import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  Point2D, 
  MapToken, 
  MapWallSegment, 
  BattleMapEntity, 
  WallType,
  MapPin as MapPinType,
  MapDrawing
} from '../../types/map';
import { useApp } from '../../context/AppContext';
import { playerSyncService } from '../../services/playerSyncService';
import { 
  createSchoolSpellAnimation,
  updateAndRenderSpellAnimations,
  renderLoopingSpellEffect,
  ActiveSpellAnimation
} from '../../services/vtt/spellAnimationEngine';
import { 
  Sparkles, 
  Trash2, 
  RotateCw, 
  RotateCcw, 
  Maximize2, 
  X,
  MapPin,
  Skull,
  Swords,
  Flame,
  Key,
  ShieldAlert,
  Eye,
  Plus,
  Minus
} from 'lucide-react';

import { SpellEntity } from '../../types/spell';
import { CombatState } from '../../types/combat';
import { getMonsterBadge, getActiveTurnTokenId } from '../../utils/monsterUtils';

export type VttTool = 
  | 'select' 
  | 'wall' 
  | 'door' 
  | 'window' 
  | 'secretDoor' 
  | 'eraser' 
  | 'ruler' 
  | 'fog-reveal'
  | 'fog-hide'
  | 'aoe-sphere' 
  | 'aoe-cone' 
  | 'aoe-line' 
  | 'aoe-cube' 
  | 'aoe-cylinder'
  | 'pin';

interface MapCanvasProps {
  map: BattleMapEntity;
  activeTool?: VttTool;
  onSelectToken?: (token: MapToken | null) => void;
  selectedToken?: MapToken | null;
  onOpenPinModal?: (pin: Partial<MapPinType> | null) => void;
  isCalibratingBox?: boolean;
  onCompleteBoxCalibration?: (cellSize: number, offsetX: number, offsetY: number) => void;
  onTokenContextMenu?: (token: MapToken, screenPt: { x: number; y: number }) => void;
  fogBrushRadius?: number;
  fogResetTrigger?: number;
  pendingSpell?: SpellEntity | null;
  onSpellPlaced?: () => void;
  isPlayerView?: boolean;
  controlledCamera?: { panX: number; panY: number; zoom: number };
  showGrid?: boolean;
  onTokenMove?: (tokenId: string, x: number, y: number) => void;
  onDrawingAdd?: (drawing: MapDrawing) => void;
  onPinClick?: (pin: MapPinType) => void;
  pingLocation?: { x: number; y: number; id: string; color?: string } | null;
  initialViewport?: { x: number; y: number; zoom: number };
  onViewportChange?: (vp: { x: number; y: number; zoom: number }) => void;
  combatState?: CombatState;
}

/**
 * Fast 2D Ray-casting Point-In-Polygon Check
 */
function isPointInPolygon(pt: Point2D, poly: Point2D[]): boolean {
  if (poly.length < 3) return false;
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x, yi = poly[i].y;
    const xj = poly[j].x, yj = poly[j].y;
    const intersect = ((yi > pt.y) !== (yj > pt.y))
        && (pt.x < (xj - xi) * (pt.y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

// 5e Status Condition Icon Definitions
const CONDITION_ICONS: Record<string, { label: string; icon: string; color: string; border: string }> = {
  blinded: { label: 'Blinded', icon: '🙈', color: '#475569', border: '#94a3b8' },
  charmed: { label: 'Charmed', icon: '💖', color: '#db2777', border: '#f472b6' },
  deafened: { label: 'Deafened', icon: '🔇', color: '#475569', border: '#94a3b8' },
  frightened: { label: 'Frightened', icon: '😱', color: '#d97706', border: '#fbbf24' },
  grappled: { label: 'Grappled', icon: '🪢', color: '#b45309', border: '#f59e0b' },
  incapacitated: { label: 'Incapacitated', icon: '💫', color: '#7c3aed', border: '#a78bfa' },
  invisible: { label: 'Invisible', icon: '👻', color: '#0284c7', border: '#38bdf8' },
  paralyzed: { label: 'Paralyzed', icon: '⚡', color: '#eab308', border: '#fde047' },
  petrified: { label: 'Petrified', icon: '🗿', color: '#57534e', border: '#a8a29e' },
  poisoned: { label: 'Poisoned', icon: '🐍', color: '#16a34a', border: '#4ade80' },
  prone: { label: 'Prone', icon: '🩸', color: '#dc2626', border: '#f87171' },
  restrained: { label: 'Restrained', icon: '⛓️', color: '#4b5563', border: '#9ca3af' },
  stunned: { label: 'Stunned', icon: '⚡', color: '#eab308', border: '#facc15' },
  unconscious: { label: 'Unconscious', icon: '💤', color: '#991b1b', border: '#ef4444' },
  exhaustion: { label: 'Exhaustion', icon: '⌛', color: '#ea580c', border: '#fb923c' },
};

export const MapCanvas: React.FC<MapCanvasProps> = ({
  map,
  activeTool = 'select',
  onSelectToken,
  selectedToken,
  onOpenPinModal,
  isCalibratingBox = false,
  onCompleteBoxCalibration,
  onTokenContextMenu,
  fogBrushRadius = 50,
  fogResetTrigger = 0,
  pendingSpell = null,
  onSpellPlaced,
  isPlayerView = false,
  controlledCamera,
  showGrid,
  onTokenMove,
  onDrawingAdd,
  onPinClick,
  pingLocation,
  initialViewport,
  onViewportChange,
  combatState: propCombatState,
}) => {
  const { 
    combatState: appCombatState, 
    updateMapToken, 
    deleteMapToken,
    toggleDoorOnMap, 
    addWallToMap, 
    deleteWallFromMap,
    saveMap, 
    showToast 
  } = useApp();

  const combatState = propCombatState || appCombatState;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Persistent Explored Terrain Mask Canvas (Fog of War Memory Shroud)
  const exploredCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Active Spell Animations
  const activeAnimationsRef = useRef<ActiveSpellAnimation[]>([]);

  // Active Animated Pings (Expanding pulsing beacon rings)
  const activePingsRef = useRef<Array<{ id: string; x: number; y: number; startTime: number; duration: number; color: string }>>([]);
  const lastPingHandledRef = useRef<string | null>(null);

  // Viewport Pan & Zoom State (High performance 60/120fps Ref with decoupled state)
  const [viewport, setViewport] = useState(() => initialViewport || { x: 0, y: 0, zoom: 1 });
  const viewportRef = useRef(initialViewport || { x: 0, y: 0, zoom: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const isPanningRef = useRef(false);
  const panStartRef = useRef<Point2D>({ x: 0, y: 0 });
  const currentMouseWorldRef = useRef<Point2D>({ x: 0, y: 0 });

  const onViewportChangeRef = useRef(onViewportChange);
  onViewportChangeRef.current = onViewportChange;

  const updateViewport = useCallback((newVp: { x: number; y: number; zoom: number }) => {
    viewportRef.current = newVp;
    setViewport(newVp);
    if (onViewportChangeRef.current) {
      onViewportChangeRef.current(newVp);
    }
  }, []);

  // Sync / restore saved viewport when active map changes
  useEffect(() => {
    if (initialViewport) {
      viewportRef.current = initialViewport;
      setViewport(initialViewport);
    }
  }, [map.id]);

  // Handle incoming Ping Location (runs ONCE per unique ping ID, then allows normal free movement)
  useEffect(() => {
    if (pingLocation && pingLocation.id && pingLocation.id !== lastPingHandledRef.current) {
      lastPingHandledRef.current = pingLocation.id;
      
      activePingsRef.current.push({
        id: pingLocation.id,
        x: pingLocation.x,
        y: pingLocation.y,
        startTime: performance.now(),
        duration: 3000,
        color: pingLocation.color || '#facc15',
      });

      // Smoothly pan viewport to center on the pinged token once
      const container = containerRef.current;
      if (container) {
        const cw = container.clientWidth || 800;
        const ch = container.clientHeight || 600;
        const curZoom = viewportRef.current.zoom;
        const targetX = cw / 2 - pingLocation.x * curZoom;
        const targetY = ch / 2 - pingLocation.y * curZoom;
        updateViewport({ x: targetX, y: targetY, zoom: curZoom });
      }
    }
  }, [pingLocation?.id, pingLocation?.x, pingLocation?.y, pingLocation?.color, updateViewport]);

  // Touch & Multi-Touch Gesture Tracking (Microsoft Surface & Touchscreens)
  const activePointersRef = useRef<Map<number, { x: number; y: number; pointerType: string }>>(new Map());
  const pinchInitialRef = useRef<{
    dist: number;
    screenCenter: Point2D;
    worldCenter: Point2D;
    viewport: { x: number; y: number; zoom: number };
  } | null>(null);
  const longPressTimerRef = useRef<any>(null);

  // Sync with controlled camera (for Player Display following GM)
  useEffect(() => {
    if (controlledCamera) {
      viewportRef.current = {
        x: controlledCamera.panX,
        y: controlledCamera.panY,
        zoom: controlledCamera.zoom,
      };
      setViewport({
        x: controlledCamera.panX,
        y: controlledCamera.panY,
        zoom: controlledCamera.zoom,
      });
    }
  }, [controlledCamera?.panX, controlledCamera?.panY, controlledCamera?.zoom]);

  // Broadcast GM camera updates to player display with 40ms throttling
  useEffect(() => {
    if (isPlayerView) return;
    
    const now = performance.now();
    if (now - lastCameraSyncTimeRef.current > 40) {
      lastCameraSyncTimeRef.current = now;
      playerSyncService.setCamera({
        panX: viewport.x,
        panY: viewport.y,
        zoom: viewport.zoom,
      });
    } else {
      if (cameraSyncTimerRef.current) clearTimeout(cameraSyncTimerRef.current);
      cameraSyncTimerRef.current = setTimeout(() => {
        playerSyncService.setCamera({
          panX: viewport.x,
          panY: viewport.y,
          zoom: viewport.zoom,
        });
      }, 40);
    }
  }, [viewport.x, viewport.y, viewport.zoom, isPlayerView]);
  // Token Dragging State (high-performance 60fps local ref tracking)
  const [draggedTokenId, setDraggedTokenId] = useState<string | null>(null);
  const tokenDragOffsetRef = useRef<Point2D>({ x: 0, y: 0 });
  const draggedTokenPosRef = useRef<{ id: string; x: number; y: number } | null>(null);

  // Placed Spell Drawing Selection & Dragging State
  const [selectedDrawingId, setSelectedDrawingId] = useState<string | null>(null);
  const [draggedDrawingId, setDraggedDrawingId] = useState<string | null>(null);
  const drawingDragOffsetRef = useRef<Point2D>({ x: 0, y: 0 });
  const draggedDrawingPosRef = useRef<{ id: string; x: number; y: number } | null>(null);

  // DM Room Pin Dragging & Movement State
  const [draggedPinId, setDraggedPinId] = useState<string | null>(null);
  const pinDragOffsetRef = useRef<Point2D>({ x: 0, y: 0 });
  const pinDragStartPosRef = useRef<Point2D | null>(null);
  const draggedPinPosRef = useRef<{ id: string; x: number; y: number } | null>(null);

  // Wall Segment Drawing State
  const [wallStartPoint, setWallStartPoint] = useState<Point2D | null>(null);
  // currentMouseWorld now in currentMouseWorldRef

  // Measurement Ruler State
  const [rulerStart, setRulerStart] = useState<Point2D | null>(null);
  const [rulerCurrent, setRulerCurrent] = useState<Point2D | null>(null);

  // 3x3 Calibration Drag State
  const [boxStart, setBoxStart] = useState<Point2D | null>(null);
  const [boxCurrent, setBoxCurrent] = useState<Point2D | null>(null);

  // Fog of War Brush Painting State
  const [isBrushPainting, setIsBrushPainting] = useState<boolean>(false);

  // Image cache & Offscreen Masks
  const mapImageRef = useRef<HTMLImageElement | null>(null);
  const darknessCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const tokenImagesCache = useRef<Record<string, HTMLImageElement>>({});

  // Performance Caches: LOS Raycasting & Darkness Baking
  const isVisionDirtyRef = useRef(true);
  const cachedLosPolygonsRef = useRef<{ origin: Point2D; radius: number; points: Point2D[] }[]>([]);
  const lastCameraSyncTimeRef = useRef<number>(0);
  const cameraSyncTimerRef = useRef<any>(null);

  // Reset Explored Fog of War Mask when requested
  useEffect(() => {
    if (fogResetTrigger > 0 && exploredCanvasRef.current) {
      const expCtx = exploredCanvasRef.current.getContext('2d');
      if (expCtx) {
        expCtx.clearRect(0, 0, exploredCanvasRef.current.width, exploredCanvasRef.current.height);
        isVisionDirtyRef.current = true;
        showToast('Fog of War exploration memory reset.');
      }
    }
  }, [fogResetTrigger, showToast]);

  // Mark vision dirty on state changes
  useEffect(() => {
    isVisionDirtyRef.current = true;
  }, [map.tokens, map.walls, map.lighting, selectedToken, isPlayerView, combatState.currentTurnIndex]);

  // Load Map Background Image
  useEffect(() => {
    if (!map.imageUrl) {
      mapImageRef.current = null;
      return;
    }
    const img = new Image();
    img.src = map.imageUrl;
    img.onload = () => {
      mapImageRef.current = img;

      // Initialize persistent explored canvas mask to match image dimensions
      if (!exploredCanvasRef.current) {
        const expCanvas = document.createElement('canvas');
        expCanvas.width = img.naturalWidth || 2000;
        expCanvas.height = img.naturalHeight || 2000;
        exploredCanvasRef.current = expCanvas;
      }
    };
  }, [map.imageUrl]);

  // Coordinate Conversion: Screen to World (Instant Zero-Lag Ref Access)
  const screenToWorld = useCallback((screenX: number, screenY: number): Point2D => {
    const vp = viewportRef.current;
    return {
      x: (screenX - vp.x) / vp.zoom,
      y: (screenY - vp.y) / vp.zoom,
    };
  }, []);

  // Snap to Grid: Square Center for Odd-sized Tokens (1x1 = 5ft Medium/Small)
  const snapTokenCenter = useCallback((pt: Point2D, tokenSize = 1): Point2D => {
    const cellSize = map.grid.cellSize || 50;
    const ox = map.grid.offsetX || 0;
    const oy = map.grid.offsetY || 0;

    if (tokenSize % 2 === 1) {
      const col = Math.floor((pt.x - ox) / cellSize);
      const row = Math.floor((pt.y - oy) / cellSize);
      return {
        x: ox + col * cellSize + cellSize / 2,
        y: oy + row * cellSize + cellSize / 2,
      };
    } else {
      const col = Math.round((pt.x - ox) / cellSize);
      const row = Math.round((pt.y - oy) / cellSize);
      return {
        x: ox + col * cellSize,
        y: oy + row * cellSize,
      };
    }
  }, [map.grid.cellSize, map.grid.offsetX, map.grid.offsetY]);

  // Snap to Nearby Vertex or Grid Intersection for Wall Snapping
  const snapToNearbyVertex = (pt: Point2D, threshold = 18): Point2D => {
    for (const w of map.walls) {
      if (Math.hypot(pt.x - w.p1.x, pt.y - w.p1.y) < threshold) return w.p1;
      if (Math.hypot(pt.x - w.p2.x, pt.y - w.p2.y) < threshold) return w.p2;
    }
    const cellSize = map.grid.cellSize || 50;
    const ox = map.grid.offsetX || 0;
    const oy = map.grid.offsetY || 0;
    const gridX = Math.round((pt.x - ox) / cellSize) * cellSize + ox;
    const gridY = Math.round((pt.y - oy) / cellSize) * cellSize + oy;
    if (Math.hypot(pt.x - gridX, pt.y - gridY) < threshold) {
      return { x: gridX, y: gridY };
    }
    return pt;
  };

  // Smooth Zoom At Specific Screen Point (or Screen Center by default)
  const zoomAtPoint = useCallback((targetZoom: number, screenPoint?: { x: number; y: number }) => {
    const clampedZoom = Math.max(0.12, Math.min(8.0, targetZoom));
    const curVp = viewportRef.current;
    if (clampedZoom === curVp.zoom) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    const ptX = screenPoint ? screenPoint.x : (rect ? rect.width / 2 : (containerRef.current?.clientWidth || 1200) / 2);
    const ptY = screenPoint ? screenPoint.y : (rect ? rect.height / 2 : (containerRef.current?.clientHeight || 800) / 2);

    const newX = ptX - (ptX - curVp.x) * (clampedZoom / curVp.zoom);
    const newY = ptY - (ptY - curVp.y) * (clampedZoom / curVp.zoom);

    updateViewport({ x: newX, y: newY, zoom: clampedZoom });
  }, [updateViewport]);

  const handleZoomIn = useCallback(() => {
    zoomAtPoint(viewportRef.current.zoom * 1.25);
  }, [zoomAtPoint]);

  const handleZoomOut = useCallback(() => {
    zoomAtPoint(viewportRef.current.zoom / 1.25);
  }, [zoomAtPoint]);

  const handleResetView = useCallback(() => {
    const container = containerRef.current;
    const cw = container?.clientWidth || 1200;
    const ch = container?.clientHeight || 800;
    const mapW = mapImageRef.current?.naturalWidth || map.width || 2000;
    const mapH = mapImageRef.current?.naturalHeight || map.height || 2000;

    const zoomX = (cw * 0.9) / mapW;
    const zoomY = (ch * 0.9) / mapH;
    const fitZoom = Math.max(0.15, Math.min(1.5, Math.min(zoomX, zoomY)));
    const centerX = (cw - mapW * fitZoom) / 2;
    const centerY = (ch - mapH * fitZoom) / 2;

    updateViewport({ x: centerX, y: centerY, zoom: fitZoom });
  }, [map.width, map.height, updateViewport]);

  // Zoom with Mouse Wheel / Touchpad pinch
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = 1.12;
    const curVp = viewportRef.current;
    const newZoom = e.deltaY < 0 ? curVp.zoom * zoomFactor : curVp.zoom / zoomFactor;
    if (newZoom < 0.12 || newZoom > 8.0) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const newX = mouseX - (mouseX - curVp.x) * (newZoom / curVp.zoom);
    const newY = mouseY - (mouseY - curVp.y) * (newZoom / curVp.zoom);

    updateViewport({ x: newX, y: newY, zoom: newZoom });
  };

  // Find token at world coordinates
  const findTokenAt = (worldPt: Point2D): MapToken | null => {
    const cellSize = map.grid.cellSize || 50;
    for (let i = map.tokens.length - 1; i >= 0; i--) {
      const t = map.tokens[i];
      const radius = (t.size * cellSize) / 2;
      const dx = worldPt.x - t.x;
      const dy = worldPt.y - t.y;
      if (Math.hypot(dx, dy) <= radius) {
        return t;
      }
    }
    return null;
  };

  // Find placed spell drawing at world coordinates
  const findDrawingAt = (worldPt: Point2D): MapDrawing | null => {
    const cellSize = map.grid.cellSize || 50;
    const pixelsPerFoot = cellSize / (map.grid.feetPerCell || 5);

    for (let i = map.drawings.length - 1; i >= 0; i--) {
      const d = map.drawings[i];
      const p0 = d.points[0];
      if (!p0) continue;

      const radPx = (d.radiusFeet || d.lengthFeet || 20) * pixelsPerFoot;
      const dist = Math.hypot(worldPt.x - p0.x, worldPt.y - p0.y);

      if (d.type === 'sphere' || d.type === 'circle' || d.type === 'cylinder') {
        if (dist <= radPx) return d;
      } else if (d.type === 'cube' || d.type === 'rect') {
        const half = radPx / 2;
        if (Math.abs(worldPt.x - p0.x) <= half && Math.abs(worldPt.y - p0.y) <= half) return d;
      } else if (d.type === 'cone' || d.type === 'line') {
        if (dist <= radPx + 15) return d;
      }
    }
    return null;
  };

  // Find door near world coordinates
  const findDoorAt = (worldPt: Point2D, threshold = 18): MapWallSegment | null => {
    for (const w of map.walls) {
      if (w.type === 'door' || w.type === 'secretDoor') {
        const midX = (w.p1.x + w.p2.x) / 2;
        const midY = (w.p1.y + w.p2.y) / 2;
        if (Math.hypot(worldPt.x - midX, worldPt.y - midY) <= threshold) {
          return w;
        }
      }
    }
    return null;
  };

  // Find wall near point for eraser tool
  const findWallNear = (worldPt: Point2D, threshold = 12): MapWallSegment | null => {
    for (const w of map.walls) {
      const l2 = (w.p2.x - w.p1.x) ** 2 + (w.p2.y - w.p1.y) ** 2;
      if (l2 === 0) continue;
      const t = Math.max(0, Math.min(1, ((worldPt.x - w.p1.x) * (w.p2.x - w.p1.x) + (worldPt.y - w.p1.y) * (w.p2.y - w.p1.y)) / l2));
      const projX = w.p1.x + t * (w.p2.x - w.p1.x);
      const projY = w.p1.y + t * (w.p2.y - w.p1.y);
      if (Math.hypot(worldPt.x - projX, worldPt.y - projY) <= threshold) {
        return w;
      }
    }
    return null;
  };

  // Paint Fog of War Brush stroke onto explored canvas mask
  const paintFogBrush = (worldPt: Point2D, isReveal: boolean) => {
    if (!exploredCanvasRef.current) return;
    const expCtx = exploredCanvasRef.current.getContext('2d');
    if (!expCtx) return;

    expCtx.save();
    if (isReveal) {
      expCtx.globalCompositeOperation = 'source-over';
      expCtx.fillStyle = '#ffffff';
    } else {
      expCtx.globalCompositeOperation = 'destination-out';
    }
    expCtx.beginPath();
    expCtx.arc(worldPt.x, worldPt.y, fogBrushRadius, 0, Math.PI * 2);
    expCtx.fill();
    expCtx.restore();
  };

  // Pointer Down handler (Supports Mouse, Surface Pen, and Touch / Multi-touch)
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch (_) {}

    activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY, pointerType: e.pointerType });

    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    // === Multi-Touch Pinch & Two-Finger Pan ===
    if (activePointersRef.current.size === 2) {
      // Abort any in-progress single-pointer actions cleanly so pinching doesn't drop tokens or walls
      if (draggedTokenId || draggedTokenPosRef.current) {
        setDraggedTokenId(null);
        draggedTokenPosRef.current = null;
      }
      if (draggedDrawingId || draggedDrawingPosRef.current) {
        setDraggedDrawingId(null);
        draggedDrawingPosRef.current = null;
      }
      if (draggedPinId || draggedPinPosRef.current) {
        setDraggedPinId(null);
        draggedPinPosRef.current = null;
        pinDragStartPosRef.current = null;
      }
      setIsPanning(false);
      isPanningRef.current = false;
      setIsBrushPainting(false);
      setWallStartPoint(null);
      setRulerStart(null);
      setRulerCurrent(null);
      setBoxStart(null);
      setBoxCurrent(null);

      const pts = Array.from(activePointersRef.current.values());
      const p1 = pts[0];
      const p2 = pts[1];
      const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
      const screenCenter = {
        x: (p1.x + p2.x) / 2 - rect.left,
        y: (p1.y + p2.y) / 2 - rect.top,
      };
      const currentVp = { ...viewportRef.current };
      const worldCenter = {
        x: (screenCenter.x - currentVp.x) / currentVp.zoom,
        y: (screenCenter.y - currentVp.y) / currentVp.zoom,
      };

      pinchInitialRef.current = {
        dist: Math.max(dist, 1),
        screenCenter,
        worldCenter,
        viewport: currentVp,
      };
      return;
    }

    if (activePointersRef.current.size > 2) {
      return;
    }

    // === Single Pointer Handling ===
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const worldPt = screenToWorld(screenX, screenY);
    currentMouseWorldRef.current = worldPt;

    // 3x3 Box Calibration Drag
    if (isCalibratingBox) {
      setBoxStart(worldPt);
      setBoxCurrent(worldPt);
      return;
    }

    // Right click / Pen barrel button handling
    if (e.button === 2) {
      if (wallStartPoint) {
        setWallStartPoint(null);
        showToast('Cancelled wall drawing');
        return;
      }

      const clickedToken = findTokenAt(worldPt);
      if (clickedToken) {
        onSelectToken?.(clickedToken);
        onTokenContextMenu?.(clickedToken, { x: e.clientX, y: e.clientY });
        return;
      }

      const clickedDrawing = findDrawingAt(worldPt);
      if (clickedDrawing) {
        setSelectedDrawingId(clickedDrawing.id);
        return;
      }
    }

    // Pan with Middle Mouse or Right Mouse (on blank space) or Shift key or Alt key
    if (e.button === 1 || e.button === 2 || e.shiftKey || (activeTool === 'select' && e.altKey)) {
      setIsPanning(true);
      isPanningRef.current = true;
      panStartRef.current = { x: e.clientX - viewportRef.current.x, y: e.clientY - viewportRef.current.y };
      return;
    }

    if (e.button === 0) {
      // Long-press detection for touch / pen on token
      if (e.pointerType === 'touch' || e.pointerType === 'pen') {
        const tokenUnderPointer = findTokenAt(worldPt);
        if (tokenUnderPointer) {
          longPressTimerRef.current = setTimeout(() => {
            onSelectToken?.(tokenUnderPointer);
            onTokenContextMenu?.(tokenUnderPointer, { x: e.clientX, y: e.clientY });
            setDraggedTokenId(null);
            draggedTokenPosRef.current = null;
          }, 550);
        }
      }

      // FOG OF WAR MANUAL BRUSH
      if (activeTool === 'fog-reveal' || activeTool === 'fog-hide') {
        setIsBrushPainting(true);
        paintFogBrush(worldPt, activeTool === 'fog-reveal');
        isVisionDirtyRef.current = true;
        return;
      }

      // ERASER TOOL
      if (activeTool === 'eraser') {
        const wallHit = findWallNear(worldPt);
        if (wallHit) {
          deleteWallFromMap(map.id, wallHit.id);
          return;
        }
        const tokenHit = findTokenAt(worldPt);
        if (tokenHit) {
          deleteMapToken(map.id, tokenHit.id);
          if (selectedToken?.id === tokenHit.id) onSelectToken?.(null);
          return;
        }
        const pinHit = map.pins.find((p) => Math.hypot(p.x - worldPt.x, p.y - worldPt.y) <= 22);
        if (pinHit) {
          saveMap({ ...map, pins: map.pins.filter((p) => p.id !== pinHit.id) });
          showToast('Removed pin');
          return;
        }
        const drawingHit = findDrawingAt(worldPt);
        if (drawingHit) {
          saveMap({ ...map, drawings: map.drawings.filter((d) => d.id !== drawingHit.id) });
          if (selectedDrawingId === drawingHit.id) setSelectedDrawingId(null);
          showToast('Removed spell template');
          return;
        }
        return;
      }

      // Check Door Click (Toggle open/closed)
      const clickedDoor = findDoorAt(worldPt);
      if (clickedDoor && activeTool !== 'wall' && activeTool !== 'door') {
        toggleDoorOnMap(map.id, clickedDoor.id);
        return;
      }

      // DM PIN CREATION TOOL
      if (activeTool === 'pin') {
        onOpenPinModal?.({
          x: Math.round(worldPt.x),
          y: Math.round(worldPt.y),
        });
        return;
      }

      if (activeTool === 'select') {
        // 1. Check if clicking on an existing Pin (supports both Dragging to Move and Clicking to Edit)
        const clickedPin = map.pins.find((p) => Math.hypot(p.x - worldPt.x, p.y - worldPt.y) <= 22);
        if (clickedPin) {
          setDraggedPinId(clickedPin.id);
          pinDragOffsetRef.current = { x: worldPt.x - clickedPin.x, y: worldPt.y - clickedPin.y };
          pinDragStartPosRef.current = { x: worldPt.x, y: worldPt.y };
          draggedPinPosRef.current = { id: clickedPin.id, x: clickedPin.x, y: clickedPin.y };
          return;
        }

        // 2. Check if clicking on a Token (supports 60fps drag & drop)
        const token = findTokenAt(worldPt);
        if (token) {
          onSelectToken?.(token);
          setSelectedDrawingId(null);
          setDraggedTokenId(token.id);
          tokenDragOffsetRef.current = { x: worldPt.x - token.x, y: worldPt.y - token.y };
          draggedTokenPosRef.current = { id: token.id, x: token.x, y: token.y };
          return;
        }

        // 3. Check if clicking on a Placed Spell Drawing (supports 60fps dragging)
        const drawing = findDrawingAt(worldPt);
        if (drawing) {
          setSelectedDrawingId(drawing.id);
          onSelectToken?.(null);
          setDraggedDrawingId(drawing.id);
          const p0 = drawing.points[0] || worldPt;
          drawingDragOffsetRef.current = { x: worldPt.x - p0.x, y: worldPt.y - p0.y };
          draggedDrawingPosRef.current = { id: drawing.id, x: p0.x, y: p0.y };
          return;
        }

        // 4. Blank space pan (supports single touch, pen, or mouse drag)
        onSelectToken?.(null);
        setSelectedDrawingId(null);
        setIsPanning(true);
        isPanningRef.current = true;
        panStartRef.current = { x: e.clientX - viewportRef.current.x, y: e.clientY - viewportRef.current.y };
      } else if (activeTool === 'wall' || activeTool === 'door' || activeTool === 'window' || activeTool === 'secretDoor') {
        const targetPt = snapToNearbyVertex(worldPt);
        if (!wallStartPoint) {
          setWallStartPoint(targetPt);
        } else {
          const newWall: MapWallSegment = {
            id: `wall-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            p1: wallStartPoint,
            p2: targetPt,
            type: activeTool as WallType,
            isOpen: false,
          };
          addWallToMap(map.id, newWall);
          setWallStartPoint(targetPt);
        }
      } else if (activeTool === 'ruler') {
        setRulerStart(worldPt);
        setRulerCurrent(worldPt);
      } else if (activeTool.startsWith('aoe-') || pendingSpell) {
        // Place Spell AOE template with accurate element and school particle effects
        const aoeType = (pendingSpell?.shape || pendingSpell?.aoe?.shape || activeTool.replace('aoe-', '')) as any;
        const radiusFeet = pendingSpell?.aoe?.sizeFeet || (aoeType === 'cone' ? 60 : aoeType === 'line' ? 100 : aoeType === 'cube' ? 20 : aoeType === 'cylinder' ? 5 : 20);
        const cellSize = map.grid.cellSize || 50;
        const pixelsPerFoot = cellSize / (map.grid.feetPerCell || 5);
        const radiusPx = radiusFeet * pixelsPerFoot;

        const schoolName = pendingSpell?.school || (aoeType === 'cone' ? 'Evocation' : aoeType === 'line' ? 'Evocation' : 'Evocation');
        const element = pendingSpell?.element || (aoeType === 'cone' ? 'cold' : aoeType === 'line' ? 'lightning' : 'fire');
        const spellName = pendingSpell?.name;

        // Trigger element & school visual spell particle explosion
        activeAnimationsRef.current.push(
          createSchoolSpellAnimation(
            schoolName,
            worldPt,
            radiusPx,
            spellName,
            { x: worldPt.x + radiusPx, y: worldPt.y },
            element
          )
        );

        const newDrawing: MapDrawing = {
          id: `aoe-${Date.now()}`,
          type: aoeType,
          points: [worldPt],
          radiusFeet,
          lengthFeet: radiusFeet,
          widthFeet: aoeType === 'line' ? 5 : undefined,
          angle: 0,
          color: element === 'cold' ? '#38bdf8' : element === 'lightning' ? '#06b6d4' : element === 'radiant' ? '#facc15' : element === 'necrotic' ? '#22c55e' : element === 'psychic' ? '#ec4899' : '#ef4444',
          strokeWidth: 2,
          fillColor: element === 'cold' ? 'rgba(56, 189, 248, 0.25)' : element === 'lightning' ? 'rgba(6, 182, 212, 0.25)' : element === 'radiant' ? 'rgba(250, 204, 21, 0.25)' : element === 'necrotic' ? 'rgba(34, 197, 94, 0.25)' : 'rgba(239, 68, 68, 0.25)',
          label: spellName ? `${spellName} (${radiusFeet} ft. ${aoeType})` : `${radiusFeet} ft. ${aoeType}`,
          spellName,
          school: schoolName,
          element,
        };

        saveMap({
          ...map,
          drawings: [...map.drawings, newDrawing],
        });
        setSelectedDrawingId(newDrawing.id);
        showToast(`Cast ${spellName || `${radiusFeet} ft. ${aoeType}`}!`);
        onSpellPlaced?.();
      }
    }
  };

  // Pointer Move handler (Supports 60/120fps ref updates + multi-touch pinch & pan)
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY, pointerType: e.pointerType });

    // Cancel long press if finger moved
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    // === Multi-Touch Pinch-to-Zoom and Two-Finger Pan ===
    if (activePointersRef.current.size === 2 && pinchInitialRef.current) {
      const pts = Array.from(activePointersRef.current.values());
      const p1 = pts[0];
      const p2 = pts[1];
      const curDist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
      const curScreenCenter = {
        x: (p1.x + p2.x) / 2 - rect.left,
        y: (p1.y + p2.y) / 2 - rect.top,
      };

      const init = pinchInitialRef.current;
      if (init && init.dist > 0) {
        const scale = curDist / init.dist;
        const newZoom = Math.max(0.12, Math.min(8.0, init.viewport.zoom * scale));

        const newX = curScreenCenter.x - init.worldCenter.x * newZoom;
        const newY = curScreenCenter.y - init.worldCenter.y * newZoom;

        viewportRef.current = { x: newX, y: newY, zoom: newZoom };
      }
      return;
    }

    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const worldPt = screenToWorld(screenX, screenY);
    currentMouseWorldRef.current = worldPt;

    if (isPanningRef.current) {
      const newX = e.clientX - panStartRef.current.x;
      const newY = e.clientY - panStartRef.current.y;
      viewportRef.current.x = newX;
      viewportRef.current.y = newY;
      return;
    }

    if (isBrushPainting && (activeTool === 'fog-reveal' || activeTool === 'fog-hide')) {
      paintFogBrush(worldPt, activeTool === 'fog-reveal');
      return;
    }

    if (isCalibratingBox && boxStart) {
      setBoxCurrent(worldPt);
      return;
    }

    if (draggedTokenId) {
      const targetPt = {
        x: worldPt.x - tokenDragOffsetRef.current.x,
        y: worldPt.y - tokenDragOffsetRef.current.y,
      };
      const token = map.tokens.find((t) => t.id === draggedTokenId);
      const snapped = snapTokenCenter(targetPt, token?.size || 1);
      draggedTokenPosRef.current = { id: draggedTokenId, x: snapped.x, y: snapped.y };
      isVisionDirtyRef.current = true;
      return;
    }

    if (draggedDrawingId) {
      const targetPt = {
        x: worldPt.x - drawingDragOffsetRef.current.x,
        y: worldPt.y - drawingDragOffsetRef.current.y,
      };
      draggedDrawingPosRef.current = { id: draggedDrawingId, x: targetPt.x, y: targetPt.y };
      return;
    }

    if (draggedPinId) {
      const targetPt = {
        x: worldPt.x - pinDragOffsetRef.current.x,
        y: worldPt.y - pinDragOffsetRef.current.y,
      };
      draggedPinPosRef.current = { id: draggedPinId, x: targetPt.x, y: targetPt.y };
      return;
    }

    if (rulerStart) {
      setRulerCurrent(worldPt);
    }
  };

  // Pointer Up / Cancel handler
  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch (_) {}

    activePointersRef.current.delete(e.pointerId);

    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    // Sync viewport state on pinch end
    if (activePointersRef.current.size < 2 && pinchInitialRef.current) {
      pinchInitialRef.current = null;
      updateViewport({ ...viewportRef.current });
    }

    // If 1 pointer remains after multi-touch, re-anchor pan to avoid jumping
    if (activePointersRef.current.size === 1 && isPanningRef.current) {
      const rem = Array.from(activePointersRef.current.values())[0];
      panStartRef.current = { x: rem.x - viewportRef.current.x, y: rem.y - viewportRef.current.y };
    }

    if (activePointersRef.current.size === 0) {
      if (isPanningRef.current) {
        setIsPanning(false);
        isPanningRef.current = false;
        updateViewport({ ...viewportRef.current });
      }
      setIsBrushPainting(false);

      if (isCalibratingBox && boxStart && boxCurrent) {
        const boxW = Math.abs(boxCurrent.x - boxStart.x);
        const boxH = Math.abs(boxCurrent.y - boxStart.y);
        const minX = Math.min(boxStart.x, boxCurrent.x);
        const minY = Math.min(boxStart.y, boxCurrent.y);

        const calculatedCellSize = Math.max(10, Math.round(Math.max(boxW, boxH) / 3));
        const ox = ((minX % calculatedCellSize) + calculatedCellSize) % calculatedCellSize;
        const oy = ((minY % calculatedCellSize) + calculatedCellSize) % calculatedCellSize;

        onCompleteBoxCalibration?.(calculatedCellSize, ox, oy);
        setBoxStart(null);
        setBoxCurrent(null);
        showToast(`Grid Calibrated: ${calculatedCellSize}px cells`);
        return;
      }

      // Commit Token position on drag completion
      if (draggedTokenPosRef.current) {
        const pos = draggedTokenPosRef.current;
        updateMapToken(map.id, pos.id, { x: pos.x, y: pos.y });
        draggedTokenPosRef.current = null;
      }

      // Commit Placed Spell Drawing position on drag completion
      if (draggedDrawingPosRef.current) {
        const pos = draggedDrawingPosRef.current;
        saveMap({
          ...map,
          drawings: map.drawings.map((d) => (d.id === pos.id ? { ...d, points: [{ x: pos.x, y: pos.y }] } : d)),
        });
        draggedDrawingPosRef.current = null;
      }

      // Handle DM Room Pin: Move or Open Edit Modal
      if (draggedPinId && pinDragStartPosRef.current) {
        const start = pinDragStartPosRef.current;
        const currentPos = draggedPinPosRef.current;
        const startPinX = start.x - pinDragOffsetRef.current.x;
        const startPinY = start.y - pinDragOffsetRef.current.y;
        const movedDist = currentPos ? Math.hypot(currentPos.x - startPinX, currentPos.y - startPinY) : 0;
        const pin = map.pins.find((p) => p.id === draggedPinId);

        if (movedDist < 6) {
          // Small movement -> Click to Edit
          if (pin) onOpenPinModal?.(pin);
        } else if (currentPos && pin) {
          // Dragged -> Move pin position
          const updatedPins = map.pins.map((p) => (p.id === currentPos.id ? { ...p, x: Math.round(currentPos.x), y: Math.round(currentPos.y) } : p));
          saveMap({ ...map, pins: updatedPins });
          showToast(`Moved room pin: ${pin.title}`);
        }
        draggedPinPosRef.current = null;
        pinDragStartPosRef.current = null;
        setDraggedPinId(null);
      }

      setDraggedTokenId(null);
      setDraggedDrawingId(null);
      setRulerStart(null);
      setRulerCurrent(null);
    }
  };

  // Compute Active LOS Polygons
  const computeActiveLosPolygons = useCallback((): { origin: Point2D; radius: number; points: Point2D[] }[] => {
    // If GM explicitly disabled dynamic LOS, only disable if not on player view with walls
    if (!map.lighting.dynamicLosEnabled && !isPlayerView) return [];

    let tokensToUse: MapToken[] = [];

    if (isPlayerView) {
      // ON PLAYER SCREEN: Vision must ONLY come from player characters (t.isPlayer === true)
      const playerTokens = map.tokens.filter((t) => t.isPlayer && !t.hiddenFromPlayers);

      // If a specific PLAYER character is selected in the main app, show that character's vision:
      if (selectedToken && selectedToken.isPlayer && !selectedToken.hiddenFromPlayers) {
        const found = playerTokens.find((t) => t.id === selectedToken.id);
        tokensToUse = found ? [found] : (playerTokens.length > 0 ? playerTokens : [selectedToken]);
      } else {
        // When clicking empty map or selecting a monster/NPC, show ALL player characters' combined vision
        tokensToUse = playerTokens;
      }
    } else {
      // ON GM SCREEN:
      if (selectedToken) {
        const currentTok = map.tokens.find((t) => t.id === selectedToken.id) || selectedToken;
        tokensToUse = [currentTok];
      } else if (combatState.isActive) {
        const currentCombatant = combatState.combatants[combatState.currentTurnIndex];
        const activePartyToken = currentCombatant 
          ? map.tokens.find((t) => t.combatantId === currentCombatant.id || t.entityId === currentCombatant.entityId)
          : null;
        if (activePartyToken) {
          tokensToUse = [activePartyToken];
        }
      }

      if (tokensToUse.length === 0) {
        tokensToUse = map.tokens.filter((t) => t.isPlayer && !t.hiddenFromPlayers);
      }
    }

    if (tokensToUse.length === 0) {
      return [];
    }

    const losPolygons: { origin: Point2D; radius: number; points: Point2D[] }[] = [];
    const cellSize = map.grid.cellSize || 50;
    const pixelsPerFoot = cellSize / (map.grid.feetPerCell || 5);
    const mapW = mapImageRef.current?.naturalWidth || map.width || 4000;
    const mapH = mapImageRef.current?.naturalHeight || map.height || 4000;
    const maxMapDiagonal = Math.hypot(mapW, mapH);
    const isDaylight = map.lighting.ambientLight === 'bright' || (map.lighting.ambientLight as string) === 'daylight';
    const closedWalls = map.walls.filter((w) => !w.isOpen);

    // If Daylight is enabled and there are no solid walls on the map, illuminate whole map!
    if (isDaylight && closedWalls.length === 0) {
      return [
        {
          origin: { x: mapW / 2, y: mapH / 2 },
          radius: maxMapDiagonal,
          points: [
            { x: 0, y: 0 },
            { x: mapW, y: 0 },
            { x: mapW, y: mapH },
            { x: 0, y: mapH },
          ],
        },
      ];
    }

    for (const tok of tokensToUse) {
      const rangeFeet = (tok as any).visionRangeFeet || 60;
      // In daylight: radius is whole map diagonal; in darkness: limited by token vision (e.g. 60ft)
      const radiusPx = isDaylight ? maxMapDiagonal : rangeFeet * pixelsPerFoot;
      const tokX = (draggedTokenPosRef.current?.id === tok.id) ? draggedTokenPosRef.current.x : tok.x;
      const tokY = (draggedTokenPosRef.current?.id === tok.id) ? draggedTokenPosRef.current.y : tok.y;
      const origin: Point2D = { x: tokX, y: tokY };

      // Collect angles: uniform angular samples + precise wall corner endpoint rays
      const anglesSet = new Set<number>();
      const numBaseRays = isDaylight ? 120 : 90;
      for (let i = 0; i < numBaseRays; i++) {
        anglesSet.add((i / numBaseRays) * Math.PI * 2);
      }

      // Add rays directed at all closed wall endpoints with small offset (+/- epsilon) for crisp shadow corners
      for (const wall of closedWalls) {
        for (const pt of [wall.p1, wall.p2]) {
          const a = Math.atan2(pt.y - origin.y, pt.x - origin.x);
          anglesSet.add(a);
          anglesSet.add(a - 0.0001);
          anglesSet.add(a + 0.0001);
        }
      }

      const sortedAngles = Array.from(anglesSet).sort((a, b) => a - b);
      const points: Point2D[] = [];

      for (const angle of sortedAngles) {
        const maxDist = radiusPx;
        let bestDist = maxDist;
        const dx = Math.cos(angle);
        const dy = Math.sin(angle);

        for (const wall of closedWalls) {
          const x1 = wall.p1.x, y1 = wall.p1.y;
          const x2 = wall.p2.x, y2 = wall.p2.y;

          const denom = (y2 - y1) * dx - (x2 - x1) * dy;
          if (Math.abs(denom) < 0.0001) continue;

          const t1 = ((x2 - x1) * (origin.y - y1) - (y2 - y1) * (origin.x - x1)) / denom;
          const t2 = (dx * (origin.y - y1) - dy * (origin.x - x1)) / denom;

          if (t1 > 0 && t1 < bestDist && t2 >= 0 && t2 <= 1) {
            bestDist = t1;
          }
        }

        points.push({
          x: origin.x + dx * bestDist,
          y: origin.y + dy * bestDist,
        });
      }

      losPolygons.push({ origin, radius: radiusPx, points });
    }

    return losPolygons;
  }, [map.lighting, map.tokens, map.walls, map.grid, combatState, selectedToken, isPlayerView]);

  // Main Render Canvas
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const cellSize = map.grid.cellSize || 50;
    const pixelsPerFoot = cellSize / (map.grid.feetPerCell || 5);

    // Clear Screen
    ctx.clearRect(0, 0, width, height);

    ctx.save();
    const vp = viewportRef.current;
    ctx.translate(vp.x, vp.y);
    ctx.scale(vp.zoom, vp.zoom);

    // 1. Render Map Background
    if (mapImageRef.current) {
      ctx.drawImage(mapImageRef.current, 0, 0);
    } else {
      ctx.fillStyle = '#161d27';
      ctx.fillRect(0, 0, 3000, 2000);
    }

    // 2. Render Grid Lines
    if (map.grid.enabled) {
      ctx.save();
      ctx.strokeStyle = map.grid.color || 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;

      const mapW = mapImageRef.current?.naturalWidth || 3000;
      const mapH = mapImageRef.current?.naturalHeight || 2000;
      const ox = map.grid.offsetX || 0;
      const oy = map.grid.offsetY || 0;

      ctx.beginPath();
      for (let x = ox; x <= mapW; x += cellSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, mapH);
      }
      for (let y = oy; y <= mapH; y += cellSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(mapW, y);
      }
      ctx.stroke();
      ctx.restore();
    }

    // 3. Dynamic LOS & Fog of War Shroud (Optimized with Cached Bake)
    const mapW = mapImageRef.current?.naturalWidth || 3000;
    const mapH = mapImageRef.current?.naturalHeight || 2000;
    const isVisionActive = (map.lighting.dynamicLosEnabled || isPlayerView) && (!map.lighting.gmVision || isPlayerView);

    if (isVisionActive) {
      if (!darknessCanvasRef.current) {
        darknessCanvasRef.current = document.createElement('canvas');
        isVisionDirtyRef.current = true;
      }
      const darkCanvas = darknessCanvasRef.current;
      if (darkCanvas.width !== mapW || darkCanvas.height !== mapH) {
        darkCanvas.width = mapW;
        darkCanvas.height = mapH;
        isVisionDirtyRef.current = true;
      }

      // Re-bake darkness mask ONLY when vision state is dirty (not every pan frame)
      if (isVisionDirtyRef.current) {
        const losPolygons = computeActiveLosPolygons();
        cachedLosPolygonsRef.current = losPolygons;

        // 1. Update persistent explored memory mask
        if (exploredCanvasRef.current && losPolygons.length > 0) {
          const expCtx = exploredCanvasRef.current.getContext('2d');
          if (expCtx) {
            expCtx.save();
            expCtx.fillStyle = '#ffffff';
            for (const poly of losPolygons) {
              expCtx.beginPath();
              if (poly.points.length > 0) {
                expCtx.moveTo(poly.points[0].x, poly.points[0].y);
                for (let i = 1; i < poly.points.length; i++) expCtx.lineTo(poly.points[i].x, poly.points[i].y);
                expCtx.closePath();
                expCtx.fill();
              }
            }
            expCtx.restore();
          }
        }

        const darkCtx = darkCanvas.getContext('2d');
        if (darkCtx) {
          // Step A: Fill darkness mask completely with dark shroud
          darkCtx.globalCompositeOperation = 'source-over';
          darkCtx.globalAlpha = 1.0;
          darkCtx.fillStyle = 'rgba(5, 7, 10, 0.98)';
          darkCtx.fillRect(0, 0, mapW, mapH);

          // Step B: Punch out Explored Memory veil (semi-transparent 55% reveal)
          if (exploredCanvasRef.current && map.lighting.fogOfWarEnabled !== false) {
            darkCtx.save();
            darkCtx.globalCompositeOperation = 'destination-out';
            darkCtx.globalAlpha = 0.58;
            darkCtx.drawImage(exploredCanvasRef.current, 0, 0);
            darkCtx.restore();
          }

          // Step C: Punch out Active 100% illuminated Line of Sight polygons
          if (losPolygons.length > 0) {
            darkCtx.save();
            darkCtx.globalCompositeOperation = 'destination-out';
            darkCtx.globalAlpha = 1.0;
            for (const poly of losPolygons) {
              if (poly.points.length > 0) {
                darkCtx.beginPath();
                darkCtx.moveTo(poly.points[0].x, poly.points[0].y);
                for (let i = 1; i < poly.points.length; i++) darkCtx.lineTo(poly.points[i].x, poly.points[i].y);
                darkCtx.closePath();
                darkCtx.fill();
              }
            }
            darkCtx.restore();
          }
        }

        isVisionDirtyRef.current = false;
      }

      // Fast single-pass composite blit
      ctx.save();
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1.0;
      ctx.drawImage(darkCanvas, 0, 0);
      ctx.restore();
    }

    // 4. Placed Spell Drawings Layer (All 5e Shapes + Continuous Slow Ambient Looping Effects)
    const currentTime = performance.now();
    for (const d of map.drawings) {
      const p0 = (draggedDrawingPosRef.current?.id === d.id) ? draggedDrawingPosRef.current : d.points[0];
      if (!p0) continue;

      const isSelected = selectedDrawingId === d.id;
      const radFeet = d.radiusFeet || d.lengthFeet || 20;
      const radPx = radFeet * pixelsPerFoot;
      const angle = d.angle || 0;

      // Render Continuous Ambient Animated Shader & Floating Particles on Slow Loop
      renderLoopingSpellEffect(ctx, d, currentTime, pixelsPerFoot);

      ctx.save();
      ctx.strokeStyle = isSelected ? '#38bdf8' : d.color || '#ef4444';
      ctx.lineWidth = isSelected ? 3 : d.strokeWidth || 2;
      ctx.fillStyle = d.fillColor || 'rgba(239, 68, 68, 0.15)';

      if (isSelected) {
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 8;
      }

      if (d.type === 'sphere' || d.type === 'circle' || d.type === 'cylinder') {
        // Circle / Sphere / Cylinder
        ctx.beginPath();
        ctx.arc(p0.x, p0.y, radPx, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Center crosshair
        ctx.beginPath();
        ctx.arc(p0.x, p0.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = ctx.strokeStyle;
        ctx.fill();
      } else if (d.type === 'cube' || d.type === 'rect') {
        // Cube / Square
        const half = radPx / 2;
        ctx.beginPath();
        ctx.rect(p0.x - half, p0.y - half, radPx, radPx);
        ctx.fill();
        ctx.stroke();
      } else if (d.type === 'cone') {
        // 5e 53.13 degree Cone
        const spread = (53.13 * Math.PI) / 180;
        const startA = angle - spread / 2;
        const endA = angle + spread / 2;

        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.arc(p0.x, p0.y, radPx, startA, endA);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (d.type === 'line') {
        // Rotated Line Rectangle (length x width)
        const widthPx = Math.max(10, (d.widthFeet || 5) * pixelsPerFoot);
        ctx.save();
        ctx.translate(p0.x, p0.y);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.rect(0, -widthPx / 2, radPx, widthPx);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }

      // Label Tag
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px sans-serif';
      const labelText = d.label || `${radFeet} ft. ${d.type}`;
      ctx.fillText(labelText, p0.x - 25, p0.y - 8);

      ctx.restore();
    }

    // 5. Active Spell Particle Visual Effects Layer (60fps Canvas Animations)
    if (activeAnimationsRef.current.length > 0) {
      activeAnimationsRef.current = updateAndRenderSpellAnimations(
        ctx,
        activeAnimationsRef.current,
        performance.now()
      );
    }

    // 6. Wall & Barrier Overlay Layer (GM View Only - hidden on Player Screen)
    if (!isPlayerView) {
      for (const w of map.walls) {
        ctx.save();
        if (w.type === 'wall') {
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(w.p1.x, w.p1.y);
          ctx.lineTo(w.p2.x, w.p2.y);
          ctx.stroke();
        } else if (w.type === 'door') {
          ctx.strokeStyle = w.isOpen ? '#10b981' : '#b45309';
          ctx.lineWidth = w.isOpen ? 1.5 : 2.5;
          if (w.isOpen) ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(w.p1.x, w.p1.y);
          ctx.lineTo(w.p2.x, w.p2.y);
          ctx.stroke();

          const midX = (w.p1.x + w.p2.x) / 2;
          const midY = (w.p1.y + w.p2.y) / 2;
          ctx.fillStyle = w.isOpen ? '#10b981' : '#f59e0b';
          ctx.beginPath();
          ctx.arc(midX, midY, 5, 0, Math.PI * 2);
          ctx.fill();
        } else if (w.type === 'window') {
          ctx.strokeStyle = '#06b6d4';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([6, 3]);
          ctx.beginPath();
          ctx.moveTo(w.p1.x, w.p1.y);
          ctx.lineTo(w.p2.x, w.p2.y);
          ctx.stroke();
        } else if (w.type === 'secretDoor') {
          ctx.strokeStyle = w.isOpen ? '#10b981' : '#8b5cf6';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          ctx.beginPath();
          ctx.moveTo(w.p1.x, w.p1.y);
          ctx.lineTo(w.p2.x, w.p2.y);
          ctx.stroke();
        }
        ctx.restore();
      }

      // Active Freehand Wall Drawing Guide Line
      if (wallStartPoint) {
        const mousePt = currentMouseWorldRef.current;
        const guideEnd = snapToNearbyVertex(mousePt);
        const isSnapped = guideEnd.x !== mousePt.x || guideEnd.y !== mousePt.y;

        ctx.save();
        ctx.strokeStyle = isSnapped ? '#10b981' : '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(wallStartPoint.x, wallStartPoint.y);
        ctx.lineTo(guideEnd.x, guideEnd.y);
        ctx.stroke();

        if (isSnapped) {
          ctx.strokeStyle = '#10b981';
          ctx.fillStyle = 'rgba(16, 185, 129, 0.4)';
          ctx.beginPath();
          ctx.arc(guideEnd.x, guideEnd.y, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
        ctx.restore();
      }
    }

    // 7. 3x3 Grid Box Calibration Overlay
    if (isCalibratingBox && boxStart && boxCurrent) {
      const minX = Math.min(boxStart.x, boxCurrent.x);
      const minY = Math.min(boxStart.y, boxCurrent.y);
      const boxW = Math.abs(boxCurrent.x - boxStart.x);
      const boxH = Math.abs(boxCurrent.y - boxStart.y);

      ctx.save();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 3]);
      ctx.fillStyle = 'rgba(245, 158, 11, 0.15)';
      ctx.strokeRect(minX, minY, boxW, boxH);
      ctx.fillRect(minX, minY, boxW, boxH);

      const cellW = boxW / 3;
      const cellH = boxH / 3;
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      for (let i = 1; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(minX + cellW * i, minY);
        ctx.lineTo(minX + cellW * i, minY + boxH);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(minX, minY + cellH * i);
        ctx.lineTo(minX + boxW, minY + cellH * i);
        ctx.stroke();
      }

      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(`3x3 Box (~${Math.round(Math.max(boxW, boxH) / 3)}px/cell)`, minX + 5, minY - 8);
      ctx.restore();
    }

    // 8. Measurement Ruler Line
    if (rulerStart && rulerCurrent) {
      const dx = rulerCurrent.x - rulerStart.x;
      const dy = rulerCurrent.y - rulerStart.y;
      const distancePx = Math.hypot(dx, dy);
      const distanceFeet = Math.round((distancePx / pixelsPerFoot) / 5) * 5;

      ctx.save();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(rulerStart.x, rulerStart.y);
      ctx.lineTo(rulerCurrent.x, rulerCurrent.y);
      ctx.stroke();

      const midX = (rulerStart.x + rulerCurrent.x) / 2;
      const midY = (rulerStart.y + rulerCurrent.y) / 2;
      ctx.fillStyle = '#0d1117';
      ctx.fillRect(midX - 25, midY - 14, 50, 24);
      ctx.strokeStyle = '#38bdf8';
      ctx.strokeRect(midX - 25, midY - 14, 50, 24);
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 12px monospace';
      ctx.fillText(`${distanceFeet} ft.`, midX - 20, midY + 3);
      ctx.restore();
    }

    // 9. Token Layer with Live Monster Culling & Rich 5e Condition Badges
    const activeTurnTokenId = getActiveTurnTokenId(combatState, map.tokens);

    for (const t of map.tokens) {
      const tokX = (draggedTokenPosRef.current?.id === t.id) ? draggedTokenPosRef.current.x : t.x;
      const tokY = (draggedTokenPosRef.current?.id === t.id) ? draggedTokenPosRef.current.y : t.y;

      // Live Monster & NPC Culling (Always active on player view, or when GM vision is off)
      const shouldCullMonsters = isPlayerView || (!map.lighting.gmVision && map.lighting.dynamicLosEnabled);
      if (!t.isPlayer && shouldCullMonsters && (map.lighting.dynamicLosEnabled || isPlayerView)) {
        const activeLos = cachedLosPolygonsRef.current;
        if (activeLos.length === 0) {
          // If no active player LOS polygons exist, no monster is visible in LOS
          continue;
        }
        const isVisibleInActiveLos = activeLos.some((poly: { points: Point2D[] }) => isPointInPolygon({ x: tokX, y: tokY }, poly.points));
        if (!isVisibleInActiveLos) continue;
      }

      // Hide tokens with hiddenFromPlayers on player view
      if (isPlayerView && t.hiddenFromPlayers) {
        continue;
      }

      const tokenRadius = Math.max(8, (t.size * cellSize) / 2 - 3);
      const isSelected = selectedToken?.id === t.id;
      const isConcentrating = !!t.concentratingOn;
      const isInvisible = t.conditions?.includes('invisible');
      const isPoisoned = t.conditions?.includes('poisoned');
      const isUnconscious = t.conditions?.includes('unconscious');

      const isCurrentTurn = activeTurnTokenId !== null && t.id === activeTurnTokenId;

      ctx.save();
      ctx.translate(tokX, tokY);

      // Active Turn Golden Glowing Aura & Turning Arcs (Easily identifiable turn indicator)
      if (isCurrentTurn) {
        const time = performance.now() * 0.003;
        ctx.save();
        // 1. Soft gold outer pulse
        const pulseRadius = tokenRadius + 7 + Math.sin(time * 2) * 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, pulseRadius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(250, 204, 21, 0.45)';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#eab308';
        ctx.shadowBlur = 14;
        ctx.stroke();

        // 2. Rotating double gold arcs
        ctx.beginPath();
        ctx.arc(0, 0, tokenRadius + 6, time, time + Math.PI * 0.75);
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 3.5;
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 10;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(0, 0, tokenRadius + 6, time + Math.PI, time + Math.PI * 1.75);
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 3.5;
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.restore();

        // 3. Golden Turn Badge [⚔️] at top
        const tx = 0;
        const ty = -tokenRadius - 10;
        ctx.save();
        ctx.beginPath();
        ctx.arc(tx, ty, 9, 0, Math.PI * 2);
        ctx.fillStyle = '#78350f';
        ctx.fill();
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#eab308';
        ctx.shadowBlur = 8;
        ctx.stroke();

        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⚔️', tx, ty);
        ctx.restore();
      }

      // Selection Highlight Aura
      if (isSelected) {
        ctx.beginPath();
        ctx.arc(0, 0, tokenRadius + 6, 0, Math.PI * 2);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Concentration Rotating Glow Aura [C]
      if (isConcentrating) {
        const time = performance.now() * 0.002;
        ctx.save();
        ctx.beginPath();
        ctx.arc(0, 0, tokenRadius + 5, time, time + Math.PI * 1.5);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 8;
        ctx.stroke();
        ctx.restore();
      }

      // Poisoned Pulsing Green Aura
      if (isPoisoned) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(0, 0, tokenRadius + 4, 0, Math.PI * 2);
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      }

      const isDeadMonster = !t.isPlayer && (t.currentHp !== undefined && t.currentHp <= 0);
      const isDownPlayer = t.isPlayer && (t.currentHp !== undefined && t.currentHp <= 0);

      // Hidden / Invisible Alpha
      if (t.hiddenFromPlayers || isInvisible) {
        ctx.globalAlpha = 0.45;
      }

      // Unconscious / Dead Monster Darkened Tint
      if (isDeadMonster) {
        ctx.filter = 'grayscale(100%) brightness(35%)';
      } else if (isDownPlayer || isUnconscious) {
        ctx.filter = 'grayscale(75%) brightness(50%)';
      }

      // Circular Token Body
      ctx.beginPath();
      ctx.arc(0, 0, tokenRadius, 0, Math.PI * 2);
      ctx.fillStyle = isDeadMonster ? '#1e293b' : t.isPlayer ? '#065f46' : '#7f1d1d';
      ctx.fill();

      // Token Image if available
      const tokenSrc = t.tokenUrl || t.avatarUrl;
      if (tokenSrc) {
        if (!tokenImagesCache.current[tokenSrc]) {
          const img = new Image();
          img.src = tokenSrc;
          img.onload = () => {
            tokenImagesCache.current[tokenSrc] = img;
          };
        } else {
          const img = tokenImagesCache.current[tokenSrc];
          ctx.save();
          ctx.beginPath();
          ctx.arc(0, 0, tokenRadius, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(img, -tokenRadius, -tokenRadius, tokenRadius * 2, tokenRadius * 2);
          ctx.restore();
        }
      }

      // Dark overlay for 0 HP entities
      if (isDeadMonster) {
        ctx.beginPath();
        ctx.arc(0, 0, tokenRadius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(10, 15, 25, 0.65)';
        ctx.fill();
      } else if (isDownPlayer) {
        ctx.beginPath();
        ctx.arc(0, 0, tokenRadius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(69, 10, 10, 0.45)';
        ctx.fill();
      }

      // Border Ring
      ctx.beginPath();
      ctx.arc(0, 0, tokenRadius, 0, Math.PI * 2);
      ctx.strokeStyle = isDeadMonster ? '#475569' : isDownPlayer ? '#ef4444' : isCurrentTurn ? '#facc15' : isSelected ? '#38bdf8' : t.isPlayer ? '#34d399' : '#f87171';
      ctx.lineWidth = isCurrentTurn ? 2.5 : 2;
      ctx.stroke();

      // Monster Defeated Skull Overlay Badge
      if (isDeadMonster) {
        ctx.save();
        const skullRadius = Math.min(16, tokenRadius * 0.55);
        ctx.beginPath();
        ctx.arc(0, 0, skullRadius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
        ctx.fill();
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1.5;
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 8;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = `${Math.max(11, Math.round(tokenRadius * 0.55))}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('💀', 0, 1);
        ctx.restore();
      } else if (isDownPlayer) {
        ctx.save();
        const badgeRadius = Math.min(14, tokenRadius * 0.5);
        ctx.beginPath();
        ctx.arc(0, 0, badgeRadius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(127, 29, 29, 0.92)';
        ctx.fill();
        ctx.strokeStyle = '#f87171';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = `${Math.max(10, Math.round(tokenRadius * 0.45))}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🩸', 0, 1);
        ctx.restore();
      }

      // Monster Identifier Badge (e.g. G1, G2, G3)
      const monsterBadge = !t.isPlayer ? (t.badge || getMonsterBadge(t, map.tokens)) : null;
      if (monsterBadge) {
        const bx = -tokenRadius + 2;
        const by = -tokenRadius + 2;
        ctx.save();
        ctx.font = 'bold 9px sans-serif';
        const textW = ctx.measureText(monsterBadge).width;
        const badgeW = Math.max(16, textW + 8);
        const badgeH = 14;

        ctx.beginPath();
        if (typeof (ctx as any).roundRect === 'function') {
          (ctx as any).roundRect(bx - badgeW / 2, by - badgeH / 2, badgeW, badgeH, 6);
        } else {
          ctx.arc(bx, by, 8, 0, Math.PI * 2);
        }
        ctx.fillStyle = '#831843'; // Deep crimson
        ctx.fill();
        ctx.strokeStyle = '#f472b6'; // Vibrant pink border
        ctx.lineWidth = 1.5;
        ctx.shadowColor = '#f43f5e';
        ctx.shadowBlur = 6;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(monsterBadge, bx, by + 0.5);
        ctx.restore();
      }

      // Condition Badges Arc
      if (t.conditions && t.conditions.length > 0) {
        const condList = t.conditions.slice(0, 4);
        const startAngle = -Math.PI * 0.8;
        const step = (Math.PI * 0.6) / Math.max(1, condList.length - 1 || 1);

        condList.forEach((condName, idx) => {
          const def = CONDITION_ICONS[condName.toLowerCase()] || { label: condName, icon: '⚠️', color: '#7c3aed', border: '#a78bfa' };
          const a = condList.length === 1 ? -Math.PI * 0.5 : startAngle + idx * step;
          const bx = Math.cos(a) * (tokenRadius + 10);
          const by = Math.sin(a) * (tokenRadius + 10);

          ctx.save();
          ctx.beginPath();
          ctx.arc(bx, by, 7.5, 0, Math.PI * 2);
          ctx.fillStyle = def.color;
          ctx.fill();
          ctx.strokeStyle = def.border;
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.font = '9px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(def.icon, bx, by + 1);
          ctx.restore();
        });
      }

      // Concentration Badge [C]
      if (isConcentrating) {
        const cx = tokenRadius - 2;
        const cy = -tokenRadius + 2;

        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#0284c7';
        ctx.fill();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('C', cx, cy + 0.5);
        ctx.restore();
      }

      // Mini Health Bar above Nameplate if maxHp > 0
      if (t.maxHp && t.maxHp > 0) {
        const curHp = Math.max(0, t.currentHp ?? t.maxHp);
        const hpRatio = Math.min(1, curHp / t.maxHp);
        const barW = Math.max(28, tokenRadius * 1.6);
        const barH = 3.5;
        const barX = -barW / 2;
        const barY = tokenRadius + 2;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);

        ctx.fillStyle = hpRatio > 0.5 ? '#22c55e' : hpRatio > 0.2 ? '#eab308' : '#ef4444';
        ctx.fillRect(barX, barY, barW * hpRatio, barH);
      }

      // Dynamic nameplate: append sequence number if monster is unnumbered
      let tokenDisplayName = t.name;
      if (!t.isPlayer && monsterBadge) {
        const hasTrailingNumber = /\d+$/.test(t.name.trim());
        if (!hasTrailingNumber) {
          const badgeNum = monsterBadge.replace(/^[A-Z]+/i, '');
          if (badgeNum) {
            tokenDisplayName = `${t.name} ${badgeNum}`;
          }
        }
      }

      // Nameplate Tag (with Gold highlight if current turn, Dark Red for 0 HP)
      const nameOffsetY = (t.maxHp && t.maxHp > 0) ? 8 : 4;
      const isDeadMonsterName = isDeadMonster;
      const isDownPlayerName = isDownPlayer;

      let formattedDisplayName = tokenDisplayName;
      if (isDeadMonsterName) formattedDisplayName += ' [DEAD]';
      else if (isDownPlayerName) formattedDisplayName += ' [0 HP]';

      ctx.fillStyle = isCurrentTurn
        ? 'rgba(120, 53, 15, 0.95)'
        : isDeadMonsterName
        ? 'rgba(15, 23, 42, 0.9)'
        : isDownPlayerName
        ? 'rgba(69, 10, 10, 0.92)'
        : 'rgba(13, 17, 23, 0.85)';

      const nameW = ctx.measureText(formattedDisplayName).width + 12;
      ctx.fillRect(-nameW / 2, tokenRadius + nameOffsetY, nameW, 16);

      if (isCurrentTurn) {
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-nameW / 2, tokenRadius + nameOffsetY, nameW, 16);
      } else if (isDeadMonsterName) {
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1;
        ctx.strokeRect(-nameW / 2, tokenRadius + nameOffsetY, nameW, 16);
      } else if (isDownPlayerName) {
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 1;
        ctx.strokeRect(-nameW / 2, tokenRadius + nameOffsetY, nameW, 16);
      }

      ctx.fillStyle = isCurrentTurn
        ? '#fef08a'
        : isDeadMonsterName
        ? '#94a3b8'
        : isDownPlayerName
        ? '#fca5a5'
        : '#ffffff';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(formattedDisplayName, 0, tokenRadius + nameOffsetY + 12);

      ctx.restore();
    }

    // 10. DM Pins Layer with Rich Icons & Titles
    for (const pin of map.pins) {
      const pinX = (draggedPinPosRef.current?.id === pin.id) ? draggedPinPosRef.current.x : pin.x;
      const pinY = (draggedPinPosRef.current?.id === pin.id) ? draggedPinPosRef.current.y : pin.y;
      ctx.save();
      ctx.translate(pinX, pinY);

      // Pin Pinpoint Circle
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fillStyle = pin.color || '#f59e0b';
      ctx.fill();
      ctx.strokeStyle = '#0d1117';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Pin Center Dot
      ctx.beginPath();
      ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#0d1117';
      ctx.fill();

      // Pin Title Badge
      ctx.fillStyle = 'rgba(13, 17, 23, 0.9)';
      const pW = ctx.measureText(pin.title).width + 12;
      ctx.fillRect(14, -8, pW, 18);
      ctx.strokeStyle = pin.color || '#f59e0b';
      ctx.strokeRect(14, -8, pW, 18);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(pin.title, 19, 1);
      ctx.restore();
    }

    // 11. Animated Pings Layer (Expanding pulsing beacon waves + target reticle)
    const now = performance.now();
    activePingsRef.current = activePingsRef.current.filter((p) => now - p.startTime < p.duration);

    for (const ping of activePingsRef.current) {
      const elapsed = now - ping.startTime;
      const progress = elapsed / ping.duration; // 0 to 1
      const color = ping.color || '#facc15';

      ctx.save();
      ctx.translate(ping.x, ping.y);

      // 3 Staggered Expanding Waves
      for (let wave = 0; wave < 3; wave++) {
        const waveProgress = ((elapsed + wave * 380) % 1100) / 1100;
        const radius = 18 + waveProgress * 85;
        const alpha = (1 - waveProgress) * (1 - progress * 0.4);

        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.strokeStyle = color;
        ctx.lineWidth = 3.5 * (1 - waveProgress);
        ctx.globalAlpha = Math.max(0, alpha);
        ctx.shadowColor = color;
        ctx.shadowBlur = 18;
        ctx.stroke();
      }

      // Central Pulsing Target Crosshair Reticle
      ctx.globalAlpha = Math.max(0, 1 - progress * 0.8);
      const pulse = 1 + Math.sin(elapsed * 0.012) * 0.18;

      ctx.save();
      ctx.rotate(elapsed * 0.003);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = color;
      ctx.shadowBlur = 12;

      ctx.beginPath();
      ctx.arc(0, 0, 14 * pulse, 0, Math.PI * 2);
      ctx.moveTo(-22 * pulse, 0); ctx.lineTo(-10 * pulse, 0);
      ctx.moveTo(10 * pulse, 0); ctx.lineTo(22 * pulse, 0);
      ctx.moveTo(0, -22 * pulse); ctx.lineTo(0, -10 * pulse);
      ctx.moveTo(0, 10 * pulse); ctx.lineTo(0, 22 * pulse);
      ctx.stroke();
      ctx.restore();

      // Center High-Glow Pin Dot
      ctx.beginPath();
      ctx.arc(0, 0, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = color;
      ctx.shadowBlur = 14;
      ctx.fill();

      ctx.restore();
    }

    // 12. Fog of War Brush Cursor Preview
    if (activeTool === 'fog-reveal' || activeTool === 'fog-hide') {
      ctx.save();
      ctx.strokeStyle = activeTool === 'fog-reveal' ? '#06b6d4' : '#818cf8';
      ctx.fillStyle = activeTool === 'fog-reveal' ? 'rgba(6, 182, 212, 0.15)' : 'rgba(99, 102, 241, 0.15)';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(currentMouseWorldRef.current.x, currentMouseWorldRef.current.y, fogBrushRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }, [
    map,
    viewport,
    selectedToken,
    selectedDrawingId,
    wallStartPoint,
    rulerStart,
    rulerCurrent,
    draggedTokenId,
    draggedDrawingId,
    combatState,
    snapTokenCenter,
    activeTool,
    fogBrushRadius,
  ]);

  // Stable 60/120fps Render Loop using ref trampoline
  const renderCanvasRef = useRef(renderCanvas);
  renderCanvasRef.current = renderCanvas;

  useEffect(() => {
    let animId: number;
    const loop = () => {
      renderCanvasRef.current();
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Resize Observer for Auto Canvas Resolution
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const resizeObs = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
          canvas.width = entry.contentRect.width;
          canvas.height = entry.contentRect.height;
        }
      }
    });
    resizeObs.observe(container);
    return () => resizeObs.disconnect();
  }, []);

  // Selected Placed Spell Drawing for HUD
  const selectedDrawing = map.drawings.find((d) => d.id === selectedDrawingId) || null;

  // Handlers for Placed Spell Template Manipulation
  const handleResizeDrawing = (newFeet: number) => {
    if (!selectedDrawing) return;
    saveMap({
      ...map,
      drawings: map.drawings.map((d) =>
        d.id === selectedDrawing.id
          ? { ...d, radiusFeet: newFeet, lengthFeet: newFeet, label: `${newFeet} ft. ${d.type}` }
          : d
      ),
    });
    showToast(`Resized ${selectedDrawing.type} to ${newFeet} ft.`);
  };

  const handleRotateDrawing = (deltaDeg: number) => {
    if (!selectedDrawing) return;
    const currentAngle = selectedDrawing.angle || 0;
    const nextAngle = currentAngle + (deltaDeg * Math.PI) / 180;
    saveMap({
      ...map,
      drawings: map.drawings.map((d) => (d.id === selectedDrawing.id ? { ...d, angle: nextAngle } : d)),
    });
  };

  const handleReplayAnimation = () => {
    if (!selectedDrawing || !selectedDrawing.points[0]) return;
    const p0 = selectedDrawing.points[0];
    const cellSize = map.grid.cellSize || 50;
    const pixelsPerFoot = cellSize / (map.grid.feetPerCell || 5);
    const radiusPx = (selectedDrawing.radiusFeet || 20) * pixelsPerFoot;

    activeAnimationsRef.current.push(
      createSchoolSpellAnimation(
        selectedDrawing.school || 'Evocation',
        p0,
        radiusPx,
        selectedDrawing.spellName,
        { x: p0.x + radiusPx, y: p0.y }
      )
    );
  };

  const handleDeleteDrawing = () => {
    if (!selectedDrawing) return;
    saveMap({
      ...map,
      drawings: map.drawings.filter((d) => d.id !== selectedDrawing.id),
    });
    setSelectedDrawingId(null);
    showToast('Removed spell template from map');
  };

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden bg-[#090d12] select-none" style={{ touchAction: 'none' }}>
      <canvas
        ref={canvasRef}
        width={containerRef.current?.clientWidth || 1200}
        height={containerRef.current?.clientHeight || 800}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onContextMenu={(e) => e.preventDefault()}
        style={{ touchAction: 'none' }}
        className={`w-full h-full block touch-none ${
          activeTool === 'select' ? 'cursor-default' : 
          activeTool.startsWith('fog-') ? 'cursor-crosshair' :
          activeTool === 'eraser' ? 'cursor-not-allowed' : 'cursor-crosshair'
        }`}
      />

      {/* Floating Touch-Friendly Navigation & Zoom HUD (Surface & Touch Screen Controls) */}
      <div className="absolute bottom-4 right-4 z-20 flex items-center bg-[#121720]/90 backdrop-blur-md border border-surface-border/80 rounded-2xl shadow-2xl p-1 space-x-1 select-none pointer-events-auto">
        <button
          type="button"
          onClick={handleZoomOut}
          className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-surface-hover active:bg-surface-200 transition-colors"
          title="Zoom Out (-)"
        >
          <Minus className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={handleResetView}
          className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold text-amber-400 hover:bg-surface-hover active:bg-surface-200 transition-colors"
          title="Fit / Reset Map View"
        >
          {Math.round(viewport.zoom * 100)}%
        </button>

        <button
          type="button"
          onClick={handleZoomIn}
          className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-surface-hover active:bg-surface-200 transition-colors"
          title="Zoom In (+)"
        >
          <Plus className="w-4 h-4" />
        </button>

        <div className="h-4 w-px bg-surface-border mx-0.5" />

        <button
          type="button"
          onClick={handleResetView}
          className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-surface-hover active:bg-surface-200 transition-colors"
          title="Fit Map to Screen"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Floating Placed Spell Template Inspector & Controller */}
      {selectedDrawing && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 bg-[#121720]/95 backdrop-blur-md border border-cyan-500/70 rounded-2xl shadow-2xl p-3 flex items-center space-x-3 select-none animate-slideUp">
          <div className="flex items-center space-x-2 border-r border-surface-border pr-3">
            <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="font-serif font-bold text-xs text-slate-100 uppercase tracking-wide">
                {selectedDrawing.spellName || selectedDrawing.type}
              </div>
              <div className="text-[10px] text-cyan-300 font-mono">
                {selectedDrawing.radiusFeet || selectedDrawing.lengthFeet || 20} ft. {selectedDrawing.type}
              </div>
            </div>
          </div>

          {/* Quick Preset Size Buttons */}
          <div className="flex items-center space-x-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 mr-1">Size:</span>
            {[5, 10, 15, 20, 30, 60, 100].map((ft) => (
              <button
                key={ft}
                onClick={() => handleResizeDrawing(ft)}
                className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-colors ${
                  (selectedDrawing.radiusFeet || 20) === ft
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'bg-surface-50 hover:bg-surface-hover text-slate-300 border border-surface-border'
                }`}
              >
                {ft}ft
              </button>
            ))}
          </div>

          {/* Rotation for Cones and Lines */}
          {(selectedDrawing.type === 'cone' || selectedDrawing.type === 'line') && (
            <div className="flex items-center space-x-1 border-l border-surface-border pl-2">
              <button
                onClick={() => handleRotateDrawing(-15)}
                className="p-1.5 rounded-lg bg-surface-50 hover:bg-surface-hover text-slate-300 border border-surface-border"
                title="Rotate counter-clockwise 15°"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleRotateDrawing(15)}
                className="p-1.5 rounded-lg bg-surface-50 hover:bg-surface-hover text-slate-300 border border-surface-border"
                title="Rotate clockwise 15°"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Re-cast Animation & Delete Controls */}
          <div className="flex items-center space-x-1 border-l border-surface-border pl-2">
            <button
              onClick={handleReplayAnimation}
              className="p-1.5 rounded-lg bg-amber-600/30 hover:bg-amber-600 text-amber-300 hover:text-slate-950 border border-amber-500/40 transition-colors"
              title="Re-trigger Visual Spell Explosion"
            >
              <Sparkles className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleDeleteDrawing}
              className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-800 transition-colors"
              title="Dismiss / Remove Spell"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setSelectedDrawingId(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              title="Deselect"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
