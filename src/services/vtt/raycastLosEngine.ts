import { Point2D, MapWallSegment, MapToken } from '../../types/map';

export interface LosPolygon {
  tokenId: string;
  tokenName: string;
  origin: Point2D;
  sightRadius: number; // in pixels
  points: Point2D[];
  visionType: 'normal' | 'darkvision' | 'blindsight' | 'truesight' | 'tremorsense';
}

const TWO_PI = Math.PI * 2;

/**
 * Normalizes an angle into [0, 2*PI)
 */
function normalizeAngle(rad: number): number {
  let a = rad % TWO_PI;
  if (a < 0) a += TWO_PI;
  return a;
}

/**
 * Checks if ray from origin at rayAngle intersects segment p3-p4.
 * Returns intersection point and distance along the ray, or null.
 */
function raySegmentIntersection(
  origin: Point2D,
  rayAngle: number,
  maxDist: number,
  p3: Point2D,
  p4: Point2D
): { point: Point2D; dist: number } | null {
  const r_dx = Math.cos(rayAngle);
  const r_dy = Math.sin(rayAngle);

  const s_dx = p4.x - p3.x;
  const s_dy = p4.y - p3.y;

  const dx = p3.x - origin.x;
  const dy = p3.y - origin.y;

  const det = r_dx * s_dy - r_dy * s_dx;
  if (Math.abs(det) < 1e-9) return null; // Parallel or collinear

  // Cramer's rule parameters:
  // t1 is distance along the ray from origin (must be > 0 and <= maxDist)
  // t2 is normalized parameter along segment p3-p4 (must be in [0, 1])
  const t1 = (dx * s_dy - dy * s_dx) / det;
  const t2 = (r_dy * dx - r_dx * dy) / det;

  if (t1 > 0.0001 && t1 <= maxDist && t2 >= 0 && t2 <= 1) {
    return {
      point: {
        x: origin.x + t1 * r_dx,
        y: origin.y + t1 * r_dy,
      },
      dist: t1,
    };
  }

  return null;
}

/**
 * Casts a single ray from origin at given angle up to maxDistance.
 * Finds closest intersection with blocking wall segments or maxDistance circle perimeter.
 */
function castRay(
  origin: Point2D,
  angle: number,
  maxDistance: number,
  blockingSegments: MapWallSegment[]
): Point2D {
  let closestPoint: Point2D = {
    x: origin.x + Math.cos(angle) * maxDistance,
    y: origin.y + Math.sin(angle) * maxDistance,
  };
  let closestDist = maxDistance;

  for (const seg of blockingSegments) {
    const hit = raySegmentIntersection(origin, angle, maxDistance, seg.p1, seg.p2);
    if (hit && hit.dist < closestDist) {
      closestDist = hit.dist;
      closestPoint = hit.point;
    }
  }

  return closestPoint;
}

/**
 * Computes 2D Raycast Line of Sight polygon for a single token position.
 */
export function computeTokenLos(
  origin: Point2D,
  sightRadiusPx: number,
  walls: MapWallSegment[]
): Point2D[] {
  // Filter only active sight-blocking walls:
  // - 'wall': solid, always blocks
  // - 'door': blocks if not open (!isOpen)
  // - 'secretDoor': blocks if not open (!isOpen)
  // - 'window': transparent, DOES NOT block sight!
  const blockingWalls = walls.filter((w) => {
    if (w.type === 'wall') return true;
    if (w.type === 'door' && !w.isOpen) return true;
    if (w.type === 'secretDoor' && !w.isOpen) return true;
    return false;
  });

  // Filter segments within sight bounding box + margin
  const margin = sightRadiusPx + 100;
  const nearbySegments = blockingWalls.filter((w) => {
    const minX = Math.min(w.p1.x, w.p2.x);
    const maxX = Math.max(w.p1.x, w.p2.x);
    const minY = Math.min(w.p1.y, w.p2.y);
    const maxY = Math.max(w.p1.y, w.p2.y);

    return (
      maxX >= origin.x - margin &&
      minX <= origin.x + margin &&
      maxY >= origin.y - margin &&
      minY <= origin.y + margin
    );
  });

  // Collect angles to cast rays towards
  const anglesSet = new Set<number>();

  // Regular angular increments for smooth circular sight boundary (120 rays = every 3 degrees)
  const circularSteps = 120;
  for (let i = 0; i < circularSteps; i++) {
    anglesSet.add(normalizeAngle((i * TWO_PI) / circularSteps));
  }

  // Endpoints of nearby wall segments with micro-offsets (+- 0.0001 rad)
  const epsilon = 0.0001;
  for (const seg of nearbySegments) {
    for (const pt of [seg.p1, seg.p2]) {
      const baseAngle = Math.atan2(pt.y - origin.y, pt.x - origin.x);
      anglesSet.add(normalizeAngle(baseAngle - epsilon));
      anglesSet.add(normalizeAngle(baseAngle));
      anglesSet.add(normalizeAngle(baseAngle + epsilon));
    }
  }

  // Strictly sort angles in ascending order in [0, 2*PI)
  const sortedAngles = Array.from(anglesSet).sort((a, b) => a - b);

  // Cast ray for each angle to generate simple star polygon
  const polygonPoints: Point2D[] = [];
  for (const angle of sortedAngles) {
    const pt = castRay(origin, angle, sightRadiusPx, nearbySegments);
    polygonPoints.push(pt);
  }

  return polygonPoints;
}

/**
 * Calculates sight radius in pixels from token senses config, map scale, and ambient lighting
 */
export function getTokenSightRadius(
  token: MapToken, 
  pixelsPerFoot: number, 
  ambientLight: 'bright' | 'dim' | 'dark' = 'bright'
): number {
  const darkvision = token.senses?.darkvision || 0;
  const blindsight = token.senses?.blindsight || 0;
  const truesight = token.senses?.truesight || 0;
  const tremorsense = token.senses?.tremorsense || 0;
  const specialVision = Math.max(darkvision, blindsight, truesight, tremorsense);

  if (ambientLight === 'dark') {
    // In darkness, creatures without special senses cannot see
    return specialVision * pixelsPerFoot;
  }

  const normalSight = token.senses?.normalSight || 60;
  if (ambientLight === 'bright') {
    return Math.max(normalSight, specialVision) * pixelsPerFoot;
  }

  // Dim light
  return Math.max(normalSight, specialVision) * pixelsPerFoot;
}

/**
 * Computes combined LOS for a list of tokens
 */
export function computeCombinedLos(
  tokens: MapToken[],
  walls: MapWallSegment[],
  pixelsPerFoot: number,
  ambientLight: 'bright' | 'dim' | 'dark' = 'bright'
): LosPolygon[] {
  return tokens
    .map((token) => {
      const sightRadiusPx = getTokenSightRadius(token, pixelsPerFoot, ambientLight);
      if (sightRadiusPx <= 0) return null;
      const origin = { x: token.x, y: token.y };
      const points = computeTokenLos(origin, sightRadiusPx, walls);

      return {
        tokenId: token.id,
        tokenName: token.name,
        origin,
        sightRadius: sightRadiusPx,
        points,
        visionType: (token.senses?.darkvision || token.senses?.truesight) ? 'darkvision' : 'normal',
      };
    })
    .filter(Boolean) as LosPolygon[];
}
