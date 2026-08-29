import React from 'react';
import { X, Grid, Check, Sparkles } from 'lucide-react';
import { MapGridSettings } from '../../types/map';

interface GridCalibrationModalProps {
  grid: MapGridSettings;
  onClose: () => void;
  onSave: (grid: MapGridSettings) => void;
}

export const GridCalibrationModal: React.FC<GridCalibrationModalProps> = ({
  grid,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = React.useState<MapGridSettings>({ ...grid });

  const colorPresets = [
    { label: 'White', val: '#ffffff' },
    { label: 'Black', val: '#000000' },
    { label: 'Amber', val: '#f59e0b' },
    { label: 'Cyan', val: '#06b6d4' },
    { label: 'Red', val: '#ef4444' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 select-none">
      <div className="bg-[#121720] border border-surface-border rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-scaleUp">
        {/* Header */}
        <div className="p-4 border-b border-surface-border flex items-center justify-between bg-surface-100/50">
          <h3 className="font-serif text-base font-bold text-slate-100 flex items-center space-x-2">
            <Grid className="w-4 h-4 text-amber-400" />
            <span>Grid Settings & Calibration</span>
          </h3>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Enabled & Snap */}
          <div className="flex items-center justify-between bg-surface-50 p-2.5 rounded-lg border border-surface-border">
            <label className="flex items-center space-x-2 text-xs font-semibold text-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.enabled}
                onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                className="w-4 h-4 rounded border-surface-border text-amber-500 bg-surface-100"
              />
              <span>Enable Grid Overlay</span>
            </label>

            <label className="flex items-center space-x-2 text-xs font-semibold text-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.snapToGrid}
                onChange={(e) => setFormData({ ...formData, snapToGrid: e.target.checked })}
                className="w-4 h-4 rounded border-surface-border text-amber-500 bg-surface-100"
              />
              <span>Snap Tokens</span>
            </label>
          </div>

          {/* Cell Size */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">Cell Size (Pixels)</span>
              <span className="font-mono text-amber-400 font-bold">{formData.cellSize} px</span>
            </div>
            <input
              type="range"
              min="20"
              max="150"
              step="5"
              value={formData.cellSize}
              onChange={(e) => setFormData({ ...formData, cellSize: parseInt(e.target.value, 10) })}
              className="w-full h-1.5 bg-surface-50 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>

          {/* Grid Opacity */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">Grid Opacity</span>
              <span className="font-mono text-amber-400 font-bold">{Math.round(formData.opacity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.9"
              step="0.05"
              value={formData.opacity}
              onChange={(e) => setFormData({ ...formData, opacity: parseFloat(e.target.value) })}
              className="w-full h-1.5 bg-surface-50 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>

          {/* Color Presets */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-300">Grid Color</span>
            <div className="flex space-x-2">
              {colorPresets.map((c) => (
                <button
                  key={c.val}
                  type="button"
                  onClick={() => setFormData({ ...formData, color: c.val })}
                  className={`w-7 h-7 rounded-full border-2 transition-transform ${
                    formData.color === c.val ? 'scale-110 border-amber-500' : 'border-surface-border'
                  }`}
                  style={{ backgroundColor: c.val }}
                />
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-3 border-t border-surface-border flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg bg-surface-50 text-slate-300 text-xs font-semibold hover:bg-surface-hover"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow-md"
            >
              Apply Grid
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
