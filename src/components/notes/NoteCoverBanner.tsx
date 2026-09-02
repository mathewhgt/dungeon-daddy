import React, { useState, useRef } from 'react';
import { 
  ImageIcon, 
  Move, 
  Trash2, 
  Sparkles, 
  Check, 
  Maximize2,
  Sliders,
  Eye
} from 'lucide-react';

interface NoteCoverBannerProps {
  imageUrl: string;
  positionY?: number; // 0 to 100 percentage
  height?: number; // Banner height in px
  isEditable?: boolean;
  onUpdatePosition?: (positionY: number) => void;
  onUpdateHeight?: (height: number) => void;
  onChangeCover?: () => void;
  onRemoveCover?: () => void;
}

export const NoteCoverBanner: React.FC<NoteCoverBannerProps> = ({
  imageUrl,
  positionY = 50,
  height = 280,
  isEditable = true,
  onUpdatePosition,
  onUpdateHeight,
  onChangeCover,
  onRemoveCover,
}) => {
  const [isRepositioning, setIsRepositioning] = useState(false);
  const [tempPos, setTempPos] = useState(positionY);
  const isDraggingRef = useRef(false);
  const startYRef = useRef(0);
  const startPosRef = useRef(positionY);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isRepositioning) return;
    isDraggingRef.current = true;
    startYRef.current = e.clientY;
    startPosRef.current = tempPos;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const deltaY = e.clientY - startYRef.current;
    // Map drag pixels to percentage offset (- delta because dragging up shifts view down)
    const newPos = Math.max(0, Math.min(100, startPosRef.current - deltaY * 0.25));
    setTempPos(Math.round(newPos));
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleSavePosition = () => {
    if (onUpdatePosition) onUpdatePosition(tempPos);
    setIsRepositioning(false);
  };

  const handleCycleHeight = () => {
    if (!onUpdateHeight) return;
    if (height <= 220) onUpdateHeight(300);
    else if (height <= 320) onUpdateHeight(420);
    else onUpdateHeight(220);
  };

  return (
    <div 
      className={`relative w-full overflow-hidden select-none group transition-all rounded-t-3xl ${
        isRepositioning ? 'cursor-grab active:cursor-grabbing ring-2 ring-amber-400' : ''
      }`}
      style={{ height: `${height}px` }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Hidden SVG Filter for Organic Watercolor Edge Bleed */}
      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          <filter id="dnd-watercolor-blend" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="4" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="22" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      {/* Main Cover Image */}
      <img
        src={imageUrl}
        alt="Cover Banner"
        className="w-full h-full object-cover transition-all duration-75 pointer-events-none"
        style={{
          objectPosition: `center ${isRepositioning ? tempPos : positionY}%`,
        }}
      />

      {/* Layer 1: Multi-stop Gradient Blend fading to page background (#090d12) */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, transparent 0%, transparent 40%, rgba(9, 13, 18, 0.15) 55%, rgba(9, 13, 18, 0.5) 70%, rgba(9, 13, 18, 0.85) 85%, #090d12 100%)'
        }}
      />

      {/* Layer 2: Side Vignette to soften top corners like sourcebook plates */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 30%, transparent 60%, rgba(9, 13, 18, 0.4) 100%)'
        }}
      />

      {/* Layer 3: Organic Watercolor Bleed Strip along the bottom */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, transparent 0%, rgba(9, 13, 18, 0.7) 40%, #090d12 100%)',
          filter: 'url(#dnd-watercolor-blend)',
          transform: 'translateZ(0)',
        }}
      />

      {/* Layer 4: Final solid blending base at bottom edge */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-4 pointer-events-none bg-[#090d12]"
      />

      {/* Repositioning Active Guide Overlay */}
      {isRepositioning && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex flex-col items-center justify-between p-4 z-20 pointer-events-none">
          <div className="px-3 py-1 rounded-full bg-black/80 border border-amber-500/60 text-amber-300 font-serif text-xs font-bold shadow-lg flex items-center space-x-1.5">
            <Move className="w-3.5 h-3.5" />
            <span>Drag image up or down to frame artwork</span>
          </div>

          <div className="w-full max-w-xs flex items-center space-x-3 bg-[#121720]/90 border border-surface-border p-2.5 rounded-xl shadow-2xl pointer-events-auto">
            <Sliders className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <input
              type="range"
              min="0"
              max="100"
              value={tempPos}
              onChange={(e) => setTempPos(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer h-1.5 bg-surface-50 rounded-lg appearance-none"
            />
            <span className="text-[10px] text-slate-300 font-mono w-7 text-right">{tempPos}%</span>
            <button
              onClick={handleSavePosition}
              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg flex items-center space-x-1 shadow-md transition-all shrink-0"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save</span>
            </button>
          </div>
        </div>
      )}

      {/* Top-Right Floating Controls (Hover State) */}
      {isEditable && !isRepositioning && (
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 flex items-center space-x-1.5 bg-[#121720]/85 backdrop-blur-md border border-white/10 p-1.5 rounded-xl shadow-2xl">
          <button
            onClick={() => {
              setTempPos(positionY);
              setIsRepositioning(true);
            }}
            className="px-2.5 py-1 rounded-lg bg-surface-50/80 hover:bg-surface-hover text-slate-200 hover:text-amber-400 text-xs font-semibold flex items-center space-x-1 transition-colors border border-surface-border/50"
            title="Reposition Cover Image Focus"
          >
            <Move className="w-3 h-3 text-amber-400" />
            <span>Reposition</span>
          </button>

          <button
            onClick={handleCycleHeight}
            className="px-2 py-1 rounded-lg bg-surface-50/80 hover:bg-surface-hover text-slate-200 hover:text-cyan-400 text-xs font-semibold flex items-center space-x-1 transition-colors border border-surface-border/50"
            title={`Banner Height: ${height}px (Click to cycle 220px / 300px / 420px)`}
          >
            <Maximize2 className="w-3 h-3 text-cyan-400" />
            <span className="text-[10px]">{height}px</span>
          </button>

          {onChangeCover && (
            <button
              onClick={onChangeCover}
              className="px-2.5 py-1 rounded-lg bg-surface-50/80 hover:bg-surface-hover text-slate-200 hover:text-white text-xs font-semibold flex items-center space-x-1 transition-colors border border-surface-border/50"
              title="Change Cover Image"
            >
              <ImageIcon className="w-3 h-3 text-pink-400" />
              <span>Change</span>
            </button>
          )}

          {onRemoveCover && (
            <button
              onClick={onRemoveCover}
              className="p-1 rounded-lg bg-surface-50/80 hover:bg-red-950/80 text-slate-400 hover:text-red-400 text-xs transition-colors border border-surface-border/50"
              title="Remove Cover Image"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};
