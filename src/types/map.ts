import { BaseEntity } from './entity';

export type WallType = 'wall' | 'door' | 'window' | 'secretDoor';

export interface Point2D {
  x: number;
  y: number;
}

export interface MapWallSegment {
  id: string;
  p1: Point2D;
  p2: Point2D;
  type: WallType;
  isOpen?: boolean; // For doors / secret doors
  isLocked?: boolean;
  color?: string;
}

export interface MapGridSettings {
  enabled: boolean;
  type: 'square' | 'hex';
  cellSize: number; // in pixels (e.g. 50, 70)
  offsetX: number;
  offsetY: number;
  color: string;
  opacity: number;
  feetPerCell: number; // typically 5
  snapToGrid: boolean;
}

export interface MapFogOfWar {
  enabled: boolean;
  opacity: number; // 0 to 1 (e.g. 0.6 for explored memory veil)
  exploredMaskData?: string; // base64 PNG of persistent exploration mask
  revealedAreas?: {
    type: 'polygon' | 'rect' | 'circle' | 'brush';
    points: Point2D[];
    radius?: number;
  }[];
}

export interface MapLightingSettings {
  ambientLight: 'bright' | 'dim' | 'dark';
  dynamicLosEnabled: boolean;
  fogOfWarEnabled: boolean; // if true, visited areas stay as memory shroud
  gmVision: boolean; // if true, GM sees whole map without darkness
}

export interface MapToken {
  id: string;
  entityId?: string; // Player or Monster ID
  combatantId?: string; // Active combatant instance ID
  name: string;
  badge?: string; // Concise identifier badge (e.g. G1, G2)
  tokenUrl?: string;
  avatarUrl?: string;
  isPlayer: boolean;
  x: number; // Center position in world coordinates (px)
  y: number; // Center position in world coordinates (px)
  size: number; // 1 = Medium/Small (1x1), 2 = Large (2x2), 3 = Huge (3x3), 4 = Gargantuan (4x4)
  elevation: number; // in feet (0 = ground)
  rotation?: number; // in degrees
  currentHp?: number;
  maxHp?: number;
  tempHp?: number;
  armorClass?: number;
  conditions?: string[];
  concentratingOn?: { spellName: string; castRound?: number };
  color?: string;
  hiddenFromPlayers?: boolean;
  senses: {
    normalSight: number; // in feet (default 60 / unlimited in bright light)
    darkvision: number; // in feet (e.g. 60)
    blindsight: number; // in feet
    truesight: number; // in feet
    tremorsense: number; // in feet
  };
}

export interface MapDrawing {
  id: string;
  type: 'pen' | 'line' | 'rect' | 'circle' | 'cone' | 'sphere' | 'cube' | 'cylinder';
  points: Point2D[];
  radiusFeet?: number;
  lengthFeet?: number;
  widthFeet?: number;
  angle?: number; // orientation angle in radians
  color: string;
  strokeWidth: number;
  fillColor?: string;
  label?: string;
  spellName?: string;
  school?: string;
  element?: string;
}

export type MapPinSize = 'sm' | 'md' | 'lg' | 'xl';

export interface MapPin {
  id: string;
  x: number;
  y: number;
  title: string;
  description?: string;
  noteId?: string; // Links to CampaignNote
  encounterId?: string; // Links to Encounter
  icon?: string;
  color?: string;
  size?: MapPinSize;
}

export interface BattleMapEntity extends BaseEntity {
  type: 'map';
  campaignId: string;
  description?: string;
  imageUrl: string;
  width: number;
  height: number;
  grid: MapGridSettings;
  lighting: MapLightingSettings;
  walls: MapWallSegment[];
  tokens: MapToken[];
  fogOfWar: MapFogOfWar;
  drawings: MapDrawing[];
  pins: MapPin[];
}
