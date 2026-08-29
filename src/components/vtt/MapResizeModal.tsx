import React, { useState } from 'react';
import { X, Maximize2, Sparkles, Check, Image as ImageIcon, Upload } from 'lucide-react';
import { BattleMapEntity } from '../../types/map';

interface MapResizeModalProps {
  map: BattleMapEntity;
  onClose: () => void;
  onSave: (updates: Partial<BattleMapEntity>) => void;
}

export const MapResizeModal: React.FC<MapResizeModalProps> = ({
  map,
  onClose,
  onSave,
}) => {
  const [width, setWidth] = useState(map.width || 1400);
  const [height, setHeight] = useState(map.height || 1000);
  const [scaleElements, setScaleElements] = useState(false);
  const [imageUrl, setImageUrl] = useState(map.imageUrl || '');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setImageUrl(base64);

      // Auto detect dimensions
      const img = new Image();
      img.onload = () => {
        setWidth(img.width || 1400);
        setHeight(img.height || 1000);
      };
      img.src = base64;
    };
    reader.readAsDataURL(file);
  };

  const handleAutoFitImage = () => {
    if (!imageUrl) return;
    const img = new Image();
    img.onload = () => {
      setWidth(img.width || 1400);
      setHeight(img.height || 1000);
    };
    img.src = imageUrl;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const scaleX = width / map.width;
    const scaleY = height / map.height;

    let updatedWalls = map.walls;
    let updatedTokens = map.tokens;
    let updatedPins = map.pins;

    if (scaleElements && (scaleX !== 1 || scaleY !== 1)) {
      updatedWalls = map.walls.map((w) => ({
        ...w,
        p1: { x: Math.round(w.p1.x * scaleX), y: Math.round(w.p1.y * scaleY) },
        p2: { x: Math.round(w.p2.x * scaleX), y: Math.round(w.p2.y * scaleY) },
      }));

      updatedTokens = map.tokens.map((t) => ({
        ...t,
        x: Math.round(t.x * scaleX),
        y: Math.round(t.y * scaleY),
      }));

      updatedPins = map.pins.map((p) => ({
        ...p,
        x: Math.round(p.x * scaleX),
        y: Math.round(p.y * scaleY),
      }));
    }

    onSave({
      width,
      height,
      imageUrl,
      walls: updatedWalls,
      tokens: updatedTokens,
      pins: updatedPins,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#121720] border border-surface-border rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scaleUp">
        {/* Header */}
        <div className="p-4 border-b border-surface-border flex items-center justify-between bg-surface-100/50">
          <h3 className="font-serif text-base font-bold text-slate-100 flex items-center space-x-2">
            <Maximize2 className="w-4 h-4 text-amber-400" />
            <span>Resize & Scale Battle Map</span>
          </h3>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Map Dimensions */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Width (pixels)</label>
              <input
                type="number"
                min="300"
                max="8000"
                step="50"
                value={width}
                onChange={(e) => setWidth(parseInt(e.target.value, 10) || 1000)}
                className="w-full bg-surface-100 border border-surface-border rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono focus:border-amber-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Height (pixels)</label>
              <input
                type="number"
                min="300"
                max="8000"
                step="50"
                value={height}
                onChange={(e) => setHeight(parseInt(e.target.value, 10) || 1000)}
                className="w-full bg-surface-100 border border-surface-border rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono focus:border-amber-500"
              />
            </div>
          </div>

          {/* Auto Fit Button */}
          {imageUrl && (
            <button
              type="button"
              onClick={handleAutoFitImage}
              className="w-full py-1.5 px-3 bg-surface-50 hover:bg-surface-hover border border-surface-border rounded-lg text-xs font-semibold text-amber-300 flex items-center justify-center space-x-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Auto-Fit Dimensions to Background Image</span>
            </button>
          )}

          {/* Scale Elements Proportional Toggle */}
          <label className="flex items-center justify-between bg-surface-50 p-2.5 rounded-lg border border-surface-border text-xs text-slate-200 cursor-pointer">
            <div className="space-y-0.5">
              <div className="font-semibold">Proportionally Scale Walls & Tokens</div>
              <div className="text-[10px] text-slate-400">Scale coordinates of existing walls and tokens with the resize.</div>
            </div>
            <input
              type="checkbox"
              checked={scaleElements}
              onChange={(e) => setScaleElements(e.target.checked)}
              className="w-4 h-4 rounded border-surface-border text-amber-500 bg-surface-100"
            />
          </label>

          {/* Background Image Upload / Replace */}
          <div className="space-y-2 pt-2 border-t border-surface-border">
            <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
              <span>Replace Map Artwork Image</span>
            </label>

            <label className="flex items-center justify-center space-x-2 p-2.5 rounded-lg border border-dashed border-surface-border hover:border-amber-500 bg-surface-100 hover:bg-surface-hover cursor-pointer text-xs font-medium text-slate-300 transition-colors">
              <Upload className="w-4 h-4 text-slate-400" />
              <span>Upload New Image File (PNG, JPG, WebP)</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Or paste direct image URL"
              className="w-full bg-surface-100 border border-surface-border rounded-lg px-3 py-1.5 text-[11px] text-slate-100 font-mono focus:border-amber-500"
            />
          </div>

          {/* Footer Actions */}
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
              className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow-md flex items-center space-x-1"
            >
              <Check className="w-4 h-4" />
              <span>Apply Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
