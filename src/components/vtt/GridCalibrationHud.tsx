import React from 'react';
import { 
  X, 
  Grid, 
  Sparkles, 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Minus, 
  Crosshair,
  Check
} from 'lucide-react';
import { MapGridSettings } from '../../types/map';

interface GridCalibrationHudProps {
  grid: MapGridSettings;
  onChange: (grid: MapGridSettings) => void;
  onClose: () => void;
  onStartBoxCalibration: () => void;
  isCalibratingBox: boolean;
}

export const GridCalibrationHud: React.FC<GridCalibrationHudProps> = ({
  grid,
  onChange,
  onClose,
  onStartBoxCalibration,
  isCalibratingBox,
}) => {
  const colorPresets = [
    { label: 'White', val: '#ffffff' },
    { label: 'Black', val: '#000000' },
    { label: 'Amber', val: '#f59e0b' },
    { label: 'Cyan', val: '#06b6d4' },
    { label: 'Red', val: '#ef4444' },
  ];

  const handleNudgeOffset = (dx: number, dy: number) => {
    onChange({
      ...grid,
      offsetX: (grid.offsetX + dx + grid.cellSize) % grid.cellSize,
      offsetY: (grid.offsetY + dy + grid.cellSize) % grid.cellSize,
    });
  };

  const handleAdjustCellSize = (delta: number) => {
    const newSize = Math.max(15, Math.min(300, grid.cellSize + delta));
    onChange({
      ...grid,
      cellSize: newSize,
    });
  };

  return (
    <div className="absolute top-16 right-4 z-40 w-72 bg-[#121720]/95 backdrop-blur-md border border-surface-border rounded-2xl shadow-2xl p-4 space-y-4 select-none animate-slideLeft text-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-surface-border pb-2">
        <div className="flex items-center space-x-2">
          <Grid className="w-4 h-4 text-amber-400" />
          <h3 className="font-serif font-bold text-sm text-slate-100">Live Grid Calibration</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded text-slate-400 hover:text-white hover:bg-surface-50 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 3x3 Box Calibration Tool Button */}
      <button
        type="button"
        onClick={onStartBoxCalibration}
        className={`w-full py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center space-x-2 transition-all shadow-md ${
          isCalibratingBox
            ? 'bg-amber-500 text-slate-950 border-amber-400 animate-pulse'
            : 'bg-amber-500/15 hover:bg-amber-500/25 border-amber-500/50 text-amber-300'
        }`}
      >
        <Crosshair className="w-4 h-4" />
        <span>{isCalibratingBox ? 'Click & Drag 3x3 Box on Map...' : '📐 3x3 Box Auto-Calibrate'}</span>
      </button>

      {/* Grid Enable & Snap Toggles */}
      <div className="flex items-center justify-between bg-surface-100/60 p-2 rounded-lg border border-surface-border text-xs">
        <label className="flex items-center space-x-2 cursor-pointer font-semibold">
          <input
            type="checkbox"
            checked={grid.enabled}
            onChange={(e) => onChange({ ...grid, enabled: e.target.checked })}
            className="w-3.5 h-3.5 rounded border-surface-border text-amber-500 bg-surface-50"
          />
          <span>Grid Visible</span>
        </label>

        <label className="flex items-center space-x-2 cursor-pointer font-semibold">
          <input
            type="checkbox"
            checked={grid.snapToGrid}
            onChange={(e) => onChange({ ...grid, snapToGrid: e.target.checked })}
            className="w-3.5 h-3.5 rounded border-surface-border text-amber-500 bg-surface-50"
          />
          <span>Snap Tokens</span>
        </label>
      </div>

      {/* Cell Size Controls with 1px fine-tune */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-300">Cell Size (Pixels)</span>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => handleAdjustCellSize(-1)}
              className="p-1 rounded bg-surface-50 hover:bg-surface-hover border border-surface-border text-slate-300 font-mono font-bold"
              title="-1px"
            >
              <Minus className="w-2.5 h-2.5" />
            </button>
            <span className="font-mono text-amber-400 font-bold px-1.5">{grid.cellSize}px</span>
            <button
              onClick={() => handleAdjustCellSize(1)}
              className="p-1 rounded bg-surface-50 hover:bg-surface-hover border border-surface-border text-slate-300 font-mono font-bold"
              title="+1px"
            >
              <Plus className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>

        <input
          type="range"
          min="20"
          max="200"
          step="1"
          value={grid.cellSize}
          onChange={(e) => onChange({ ...grid, cellSize: parseInt(e.target.value, 10) })}
          className="w-full h-1.5 bg-surface-50 rounded-lg appearance-none cursor-pointer accent-amber-500"
        />
      </div>

      {/* Offset Fine-Tune Nudge Pad */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-300">Nudge Grid Position</span>
          <span className="text-[10px] text-slate-400 font-mono">X:{grid.offsetX} Y:{grid.offsetY}</span>
        </div>

        <div className="flex flex-col items-center justify-center space-y-1 bg-surface-100/50 p-2 rounded-xl border border-surface-border">
          <button
            onClick={() => handleNudgeOffset(0, -1)}
            className="p-1 rounded bg-surface-50 hover:bg-amber-500 hover:text-slate-950 border border-surface-border transition-colors"
            title="Nudge Up 1px"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <div className="flex space-x-2 items-center">
            <button
              onClick={() => handleNudgeOffset(-1, 0)}
              className="p-1 rounded bg-surface-50 hover:bg-amber-500 hover:text-slate-950 border border-surface-border transition-colors"
              title="Nudge Left 1px"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => onChange({ ...grid, offsetX: 0, offsetY: 0 })}
              className="px-2 py-0.5 rounded bg-surface-50 hover:bg-surface-hover text-[10px] font-bold text-slate-400"
              title="Reset offset"
            >
              0,0
            </button>
            <button
              onClick={() => handleNudgeOffset(1, 0)}
              className="p-1 rounded bg-surface-50 hover:bg-amber-500 hover:text-slate-950 border border-surface-border transition-colors"
              title="Nudge Right 1px"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={() => handleNudgeOffset(0, 1)}
            className="p-1 rounded bg-surface-50 hover:bg-amber-500 hover:text-slate-950 border border-surface-border transition-colors"
            title="Nudge Down 1px"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid Scale Distance per Cell */}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-slate-300">Scale Distance per Square</label>
        <div className="grid grid-cols-3 gap-1 text-xs">
          {[
            { label: '5 Feet', val: 5 },
            { label: '1.5 Metres', val: 5 },
            { label: '10 Feet', val: 10 },
          ].map((u) => (
            <button
              key={u.label}
              type="button"
              onClick={() => onChange({ ...grid, feetPerCell: u.val })}
              className={`p-1 rounded-lg border font-semibold text-center transition-colors ${
                grid.feetPerCell === u.val
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                  : 'bg-surface-50 border-surface-border text-slate-400 hover:text-slate-200'
              }`}
            >
              {u.label}
            </button>
          ))}
        </div>
      </div>

      {/* Color & Opacity */}
      <div className="space-y-2 pt-1 border-t border-surface-border">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-300">Opacity ({Math.round(grid.opacity * 100)}%)</span>
          <input
            type="range"
            min="0.05"
            max="0.8"
            step="0.05"
            value={grid.opacity}
            onChange={(e) => onChange({ ...grid, opacity: parseFloat(e.target.value) })}
            className="w-28 h-1.5 bg-surface-50 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300">Color</span>
          <div className="flex space-x-1.5">
            {colorPresets.map((c) => (
              <button
                key={c.val}
                type="button"
                onClick={() => onChange({ ...grid, color: c.val })}
                className={`w-5 h-5 rounded-full border transition-transform ${
                  grid.color === c.val ? 'scale-125 border-amber-500 ring-2 ring-amber-500/40' : 'border-surface-border'
                }`}
                style={{ backgroundColor: c.val }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
