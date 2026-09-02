import React, { useState, useEffect, useRef } from 'react';
import { 
  MousePointer, 
  Grid, 
  Ruler, 
  Sun, 
  Moon, 
  Eye, 
  EyeOff, 
  Sparkles, 
  MapPin, 
  DoorClosed, 
  AppWindow, 
  Key, 
  Layers, 
  ShieldAlert, 
  Trash2,
  Maximize2,
  Eraser,
  Brush,
  CloudOff,
  Cloud,
  RotateCcw,
  Tv,
  BookOpen,
  Columns
} from 'lucide-react';
import { VttTool } from './MapCanvas';
import { BattleMapEntity } from '../../types/map';
import { useApp } from '../../context/AppContext';
import { BookmarkButton } from '../bookmarks/BookmarkButton';
import { openNotesWindow } from '../notes/LiveNoteEditor';

interface VttToolbarProps {
  activeTool: VttTool;
  setActiveTool: (tool: VttTool) => void;
  map: BattleMapEntity;
  onUpdateMap: (updates: Partial<BattleMapEntity>) => void;
  onOpenGridModal: () => void;
  onClearDrawings: () => void;
  fogBrushRadius: number;
  setFogBrushRadius: (r: number) => void;
  onResetFog: () => void;
}

export const VttToolbar: React.FC<VttToolbarProps> = ({
  activeTool,
  setActiveTool,
  map,
  onUpdateMap,
  onOpenGridModal,
  onClearDrawings,
  fogBrushRadius,
  setFogBrushRadius,
  onResetFog,
}) => {
  const { setIsExternalDisplayModalOpen, activeCampaignId } = useApp();
  const [isAoeOpen, setIsAoeOpen] = useState(false);
  const [isFogOpen, setIsFogOpen] = useState(false);
  const [isLightingOpen, setIsLightingOpen] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [isTwoColumns, setIsTwoColumns] = useState<boolean>(true);

  useEffect(() => {
    // Clear any manual column override from localStorage so it adapts automatically
    try {
      localStorage.removeItem('vtt_toolbar_columns');
    } catch (_) {}

    const checkHeight = () => {
      const parentEl = toolbarRef.current?.parentElement;
      const availableHeight = parentEl?.clientHeight || window.innerHeight;
      // 1-column layout requires ~520px height + top/bottom breathing room (800px minimum)
      // Below 800px of available map canvas height, automatically switch to 2 columns
      setIsTwoColumns(availableHeight < 800);
    };

    checkHeight();

    const parentEl = toolbarRef.current?.parentElement;
    let ro: ResizeObserver | null = null;
    if (parentEl && typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(checkHeight);
      ro.observe(parentEl);
    }
    window.addEventListener('resize', checkHeight);

    return () => {
      if (ro) ro.disconnect();
      window.removeEventListener('resize', checkHeight);
    };
  }, []);

  const primaryTools: { id: VttTool; label: string; icon: React.ElementType; color?: string }[] = [
    { id: 'select', label: 'Select / Move Tokens', icon: MousePointer },
    { id: 'wall', label: 'Draw Solid Wall (Blocks Sight & Move)', icon: Layers, color: 'text-amber-400' },
    { id: 'door', label: 'Place Door (Click to Open/Close)', icon: DoorClosed, color: 'text-emerald-400' },
    { id: 'window', label: 'Place Window (Allows Sight, Blocks Move)', icon: AppWindow, color: 'text-cyan-400' },
    { id: 'secretDoor', label: 'Place Secret Door', icon: Key, color: 'text-purple-400' },
    { id: 'eraser', label: 'Eraser (Click to delete walls, doors, tokens, or spell templates)', icon: Eraser, color: 'text-rose-400' },
    { id: 'ruler', label: '5e Distance Ruler', icon: Ruler, color: 'text-blue-400' },
    { id: 'pin', label: 'Drop DM Room Pin', icon: MapPin, color: 'text-amber-500' },
  ];

  const renderToolButton = (t: { id: VttTool; label: string; icon: React.ElementType; color?: string }) => {
    const isActive = activeTool === t.id;
    const Icon = t.icon;

    return (
      <button
        key={t.id}
        onClick={() => {
          setActiveTool(t.id);
          setIsAoeOpen(false);
          setIsFogOpen(false);
          setIsLightingOpen(false);
        }}
        className={`p-1.5 rounded-xl transition-all flex items-center justify-center ${
          isActive
            ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
            : 'text-slate-300 hover:bg-surface-hover hover:text-white'
        }`}
        title={t.label}
      >
        <Icon className={`w-4 h-4 ${!isActive && t.color ? t.color : ''}`} />
      </button>
    );
  };

  const renderFogButton = () => (
    <button
      onClick={() => {
        setIsFogOpen((prev) => !prev);
        setIsAoeOpen(false);
        setIsLightingOpen(false);
      }}
      className={`p-1.5 rounded-xl transition-all flex items-center justify-center ${
        activeTool === 'fog-reveal' || activeTool === 'fog-hide'
          ? 'bg-cyan-600 text-white font-bold shadow-md'
          : 'text-slate-300 hover:bg-surface-hover'
      }`}
      title="Manual Fog of War Brushes (Reveal / Shroud)"
    >
      <Brush className="w-4 h-4 text-cyan-400" />
    </button>
  );

  const renderAoeButton = () => (
    <button
      onClick={() => {
        setIsAoeOpen((prev) => !prev);
        setIsFogOpen(false);
        setIsLightingOpen(false);
      }}
      className={`p-1.5 rounded-xl transition-all flex items-center justify-center ${
        activeTool.startsWith('aoe-')
          ? 'bg-red-600 text-white font-bold shadow-md'
          : 'text-slate-300 hover:bg-surface-hover'
      }`}
      title="5e Spell AOE Templates (Sphere, Cone, Line, Cube)"
    >
      <Sparkles className="w-4 h-4 text-red-400" />
    </button>
  );

  const renderLightingButton = () => (
    <button
      onClick={() => {
        setIsLightingOpen((prev) => !prev);
        setIsAoeOpen(false);
        setIsFogOpen(false);
      }}
      className={`p-1.5 rounded-xl transition-all flex items-center justify-center ${
        map.lighting.dynamicLosEnabled
          ? 'bg-amber-950/70 border border-amber-500/40 text-amber-300'
          : 'text-slate-400 hover:bg-surface-hover'
      }`}
      title="Dynamic Line of Sight & Lighting Settings"
    >
      {map.lighting.ambientLight === 'dark' ? (
        <Moon className="w-4 h-4 text-indigo-400" />
      ) : (
        <Sun className="w-4 h-4 text-amber-400" />
      )}
    </button>
  );

  const renderGridButton = () => (
    <button
      onClick={onOpenGridModal}
      className="p-1.5 rounded-xl text-slate-300 hover:bg-surface-hover hover:text-amber-400 transition-colors flex items-center justify-center"
      title="Grid Settings & Calibration"
    >
      <Grid className="w-4 h-4" />
    </button>
  );

  const renderTvButton = () => (
    <button
      onClick={() => setIsExternalDisplayModalOpen(true)}
      className="p-1.5 rounded-xl text-slate-300 hover:bg-surface-hover hover:text-sky-400 transition-colors flex items-center justify-center"
      title="External Player Display / Google Cast"
    >
      <Tv className="w-4 h-4" />
    </button>
  );

  const renderNotesButton = () => (
    <button
      onClick={() => openNotesWindow(undefined, activeCampaignId || undefined)}
      className="p-1.5 rounded-xl text-slate-300 hover:bg-surface-hover hover:text-amber-400 transition-colors flex items-center justify-center"
      title="Pop-out Adventure Notes"
    >
      <BookOpen className="w-4 h-4" />
    </button>
  );

  const renderBookmarkButton = () => (
    <div className="flex items-center justify-center">
      <BookmarkButton
        type="map"
        targetId={map.id}
        title={map.name}
        subtitle={`Battle Map (${map.width || 2000}x${map.height || 2000}px)`}
        category="Battle Map"
        imageUrl={map.imageUrl}
        size="sm"
      />
    </div>
  );

  const renderTrashButton = () => (
    map.drawings.length > 0 ? (
      <button
        onClick={onClearDrawings}
        className="p-1.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-surface-hover transition-colors flex items-center justify-center"
        title="Clear Spell Templates"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    ) : null
  );

  return (
    <div 
      ref={toolbarRef}
      className="absolute right-3 top-3 bottom-3 my-auto h-fit max-h-[calc(100%-1.5rem)] z-30 select-none animate-fadeIn flex flex-col pointer-events-none"
    >
      {/* Outer Floating Card */}
      <div className="bg-[#121720]/95 backdrop-blur-md p-1.5 rounded-2xl border border-surface-border shadow-2xl flex flex-col items-center max-h-full overflow-hidden pointer-events-auto">
        {isTwoColumns ? (
          /* 2-Column Grid Layout (Fits easily on any screen height ~260px) */
          <div className="grid grid-cols-2 gap-1 w-[72px]">
            {renderToolButton(primaryTools[0])} {/* Select */}
            {renderToolButton(primaryTools[5])} {/* Eraser */}
            {renderToolButton(primaryTools[1])} {/* Wall */}
            {renderToolButton(primaryTools[6])} {/* Ruler */}
            {renderToolButton(primaryTools[2])} {/* Door */}
            {renderToolButton(primaryTools[7])} {/* Pin */}
            {renderToolButton(primaryTools[3])} {/* Window */}
            {renderToolButton(primaryTools[4])} {/* Secret Door */}

            <div className="col-span-2 w-full h-px bg-surface-border my-0.5" />

            {renderFogButton()}
            {renderAoeButton()}
            {renderLightingButton()}
            {renderGridButton()}

            <div className="col-span-2 w-full h-px bg-surface-border my-0.5" />

            {renderTvButton()}
            {renderNotesButton()}
            {renderBookmarkButton()}
            {renderTrashButton() || <div className="w-7 h-7" />}
          </div>
        ) : (
          /* 1-Column Layout with Vertical Scroll Safeguard */
          <div className="flex flex-col items-center space-y-0.5 max-h-full overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden w-8">
            {primaryTools.map(renderToolButton)}
            <div className="w-5 h-px bg-surface-border my-0.5" />
            {renderFogButton()}
            {renderAoeButton()}
            {renderLightingButton()}
            <div className="w-5 h-px bg-surface-border my-0.5" />
            {renderBookmarkButton()}
            {renderGridButton()}
            {renderTvButton()}
            {renderNotesButton()}
            {renderTrashButton()}
          </div>
        )}
      </div>

      {/* Popovers / Dropdowns (rendered outside buttons container so never clipped by scroll) */}
      {isFogOpen && (
        <div className="absolute right-full mr-2 top-8 w-48 bg-[#121720] border border-surface-border rounded-xl shadow-2xl p-2 space-y-2 z-40 animate-scaleUp text-xs pointer-events-auto">
          <div className="font-serif font-bold text-slate-200 border-b border-surface-border pb-1">
            Fog of War Brushes
          </div>

          <div className="space-y-1">
            <button
              onClick={() => {
                setActiveTool('fog-reveal');
                setIsFogOpen(false);
              }}
              className={`w-full px-2.5 py-1.5 rounded-lg text-left font-semibold flex items-center space-x-2 transition-colors ${
                activeTool === 'fog-reveal'
                  ? 'bg-cyan-600 text-white'
                  : 'text-slate-200 hover:bg-surface-hover hover:text-cyan-400'
              }`}
            >
              <CloudOff className="w-3.5 h-3.5 text-cyan-400" />
              <span>🖌️ Reveal Fog Brush</span>
            </button>

            <button
              onClick={() => {
                setActiveTool('fog-hide');
                setIsFogOpen(false);
              }}
              className={`w-full px-2.5 py-1.5 rounded-lg text-left font-semibold flex items-center space-x-2 transition-colors ${
                activeTool === 'fog-hide'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-200 hover:bg-surface-hover hover:text-indigo-400'
              }`}
            >
              <Cloud className="w-3.5 h-3.5 text-indigo-400" />
              <span>🌫️ Shroud / Hide Brush</span>
            </button>
          </div>

          {/* Brush Size Selector */}
          <div className="pt-1.5 border-t border-surface-border space-y-1">
            <div className="text-[10px] text-slate-400 uppercase font-bold flex items-center justify-between">
              <span>Brush Radius</span>
              <span className="font-mono text-cyan-400">{fogBrushRadius}px</span>
            </div>
            <div className="grid grid-cols-4 gap-1">
              {[25, 50, 100, 200].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setFogBrushRadius(r)}
                  className={`py-1 rounded text-center text-[10px] font-mono font-bold border transition-colors ${
                    fogBrushRadius === r
                      ? 'bg-cyan-950 border-cyan-500 text-cyan-300'
                      : 'bg-surface-50 border-surface-border text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {isAoeOpen && (
        <div className="absolute right-full mr-2 top-14 w-44 bg-[#121720] border border-surface-border rounded-xl shadow-2xl p-1.5 space-y-1 z-40 animate-scaleUp pointer-events-auto">
          {[
            { id: 'aoe-sphere', label: '🟡 20 ft. Sphere (Fireball)' },
            { id: 'aoe-cone', label: '🔻 60 ft. Cone (Cone of Cold)' },
            { id: 'aoe-line', label: '📏 100 ft. Line (Lightning)' },
            { id: 'aoe-cube', label: '🟩 20 ft. Cube (Web / Hypnotic)' },
            { id: 'aoe-cylinder', label: '🔵 5 ft. Cylinder (Moonbeam)' },
          ].map((aoe) => (
            <button
              key={aoe.id}
              onClick={() => {
                setActiveTool(aoe.id as any);
                setIsAoeOpen(false);
              }}
              className="w-full px-2.5 py-1.5 rounded-lg text-left text-xs font-semibold text-slate-200 hover:bg-surface-hover hover:text-cyan-300 transition-colors flex items-center space-x-1.5"
            >
              <span>{aoe.label}</span>
            </button>
          ))}
        </div>
      )}

      {isLightingOpen && (
        <div className="absolute right-full mr-2 -top-12 w-64 bg-[#121720] border border-surface-border rounded-xl shadow-2xl p-3 space-y-3 z-40 animate-scaleUp pointer-events-auto">
          <div className="text-xs font-serif font-bold text-slate-100 flex items-center justify-between border-b border-surface-border pb-1.5">
            <span>Lighting & Fog of War</span>
            <button onClick={() => setIsLightingOpen(false)} className="text-slate-400 hover:text-white">✕</button>
          </div>

          {/* Dynamic LOS Toggle */}
          <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
            <span>Dynamic Raycast LOS</span>
            <input
              type="checkbox"
              checked={map.lighting.dynamicLosEnabled}
              onChange={(e) =>
                onUpdateMap({
                  lighting: { ...map.lighting, dynamicLosEnabled: e.target.checked },
                })
              }
              className="w-4 h-4 rounded border-surface-border text-amber-500 bg-surface-100"
            />
          </label>

          {/* Exploration Memory Shroud Toggle */}
          <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
            <span>Exploration Memory Veil</span>
            <input
              type="checkbox"
              checked={map.lighting.fogOfWarEnabled}
              onChange={(e) =>
                onUpdateMap({
                  lighting: { ...map.lighting, fogOfWarEnabled: e.target.checked },
                })
              }
              className="w-4 h-4 rounded border-surface-border text-cyan-500 bg-surface-100"
            />
          </label>

          {/* GM Vision Toggle (God Mode) */}
          <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
            <span>GM God-Vision (Reveal All)</span>
            <input
              type="checkbox"
              checked={map.lighting.gmVision}
              onChange={(e) =>
                onUpdateMap({
                  lighting: { ...map.lighting, gmVision: e.target.checked },
                })
              }
              className="w-4 h-4 rounded border-surface-border text-amber-500 bg-surface-100"
            />
          </label>

          {/* Ambient Lighting Mode */}
          <div className="space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Ambient Light</span>
            <div className="grid grid-cols-2 gap-1 text-xs">
              <button
                onClick={() =>
                  onUpdateMap({
                    lighting: { ...map.lighting, ambientLight: 'dark' },
                  })
                }
                className={`p-1.5 rounded-lg border font-semibold ${
                  map.lighting.ambientLight === 'dark'
                    ? 'bg-indigo-950 border-indigo-500 text-indigo-200'
                    : 'bg-surface-50 border-surface-border text-slate-400'
                }`}
              >
                🌑 Dark (Dungeon)
              </button>
              <button
                onClick={() =>
                  onUpdateMap({
                    lighting: { ...map.lighting, ambientLight: 'bright' },
                  })
                }
                className={`p-1.5 rounded-lg border font-semibold ${
                  map.lighting.ambientLight === 'bright'
                    ? 'bg-amber-950 border-amber-500 text-amber-200'
                    : 'bg-surface-50 border-surface-border text-slate-400'
                }`}
              >
                ☀️ Bright (Daylight)
              </button>
            </div>
          </div>

          {/* Reset Fog of War Button */}
          <div className="pt-2 border-t border-surface-border">
            <button
              onClick={() => {
                onResetFog();
                setIsLightingOpen(false);
              }}
              className="w-full py-1.5 rounded-lg bg-surface-50 hover:bg-red-950/70 border border-surface-border hover:border-red-700 text-slate-300 hover:text-red-200 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Fog of War</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
