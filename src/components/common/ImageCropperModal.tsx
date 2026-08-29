import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  RotateCcw, 
  Move, 
  Check, 
  RefreshCw,
  Sparkles,
  Crop
} from 'lucide-react';

interface ImageCropperModalProps {
  imageSrc: string;
  mode: 'token' | 'portrait';
  onClose: () => void;
  onSave: (croppedDataUrl: string) => void;
  title?: string;
}

export const ImageCropperModal: React.FC<ImageCropperModalProps> = ({
  imageSrc,
  mode,
  onClose,
  onSave,
  title = mode === 'token' ? 'Adjust & Crop VTT Token' : 'Adjust & Crop Portrait',
}) => {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  // Load source image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageRef.current = img;
      setImageLoaded(true);

      // Auto-fit image to viewport
      const viewportSize = 280;
      const minDimension = Math.min(img.width, img.height);
      const initialScale = viewportSize / minDimension;
      setScale(Math.max(0.5, Math.min(3, initialScale)));
      setOffset({ x: 0, y: 0 });
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // Draw interactive canvas
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img || !imageLoaded) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear
    ctx.clearRect(0, 0, width, height);

    // Save state
    ctx.save();

    // Translate to center for rotation & scaling
    ctx.translate(width / 2 + offset.x, height / 2 + offset.y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale, scale);

    // Draw image centered
    ctx.drawImage(img, -img.width / 2, -img.height / 2);

    ctx.restore();

    // Draw Overlay Mask (Darkened area outside crop region)
    ctx.save();
    ctx.fillStyle = 'rgba(9, 13, 18, 0.75)';
    ctx.beginPath();
    // Outer rectangle
    ctx.rect(0, 0, width, height);

    if (mode === 'token') {
      // Cut out circle in center
      const radius = 110;
      ctx.arc(width / 2, height / 2, radius, 0, Math.PI * 2, true);
      ctx.fill();

      // Draw Token Ring Guide
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, radius, 0, Math.PI * 2);
      ctx.strokeStyle = '#f59e0b'; // Amber ring
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(width / 2, height / 2, radius + 2, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.3)';
      ctx.lineWidth = 2;
      ctx.stroke();
    } else {
      // Cut out 3:4 portrait rectangle
      const cropW = 180;
      const cropH = 240;
      const cropX = (width - cropW) / 2;
      const cropY = (height - cropH) / 2;

      ctx.rect(cropX + cropW, cropY, -cropW, cropH);
      ctx.fill();

      // Guide Border
      ctx.strokeStyle = '#3b82f6'; // Blue border
      ctx.lineWidth = 2;
      ctx.strokeRect(cropX, cropY, cropW, cropH);
    }

    ctx.restore();
  }, [offset, scale, rotation, imageLoaded, mode]);

  useEffect(() => {
    draw();
  }, [draw]);

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    setScale((prev) => Math.max(0.3, Math.min(4, prev * zoomFactor)));
  };

  // Export cropped canvas
  const handleApplyCrop = () => {
    const img = imageRef.current;
    if (!img) return;

    // Create offscreen export canvas
    const exportCanvas = document.createElement('canvas');
    const exportCtx = exportCanvas.getContext('2d');
    if (!exportCtx) return;

    if (mode === 'token') {
      const exportSize = 256;
      exportCanvas.width = exportSize;
      exportCanvas.height = exportSize;

      // Draw circular clipping path
      exportCtx.save();
      exportCtx.beginPath();
      exportCtx.arc(exportSize / 2, exportSize / 2, exportSize / 2 - 2, 0, Math.PI * 2);
      exportCtx.closePath();
      exportCtx.clip();

      // Match the preview transform
      const radius = 110;
      const exportScale = (exportSize / 2) / radius;

      exportCtx.translate(exportSize / 2 + offset.x * exportScale, exportSize / 2 + offset.y * exportScale);
      exportCtx.rotate((rotation * Math.PI) / 180);
      exportCtx.scale(scale * exportScale, scale * exportScale);

      exportCtx.drawImage(img, -img.width / 2, -img.height / 2);
      exportCtx.restore();

      const base64 = exportCanvas.toDataURL('image/png');
      onSave(base64);
    } else {
      // Portrait crop (300 x 400)
      const exportW = 300;
      const exportH = 400;
      exportCanvas.width = exportW;
      exportCanvas.height = exportH;

      const cropW = 180;
      const exportScale = exportW / cropW;

      exportCtx.save();
      exportCtx.translate(exportW / 2 + offset.x * exportScale, exportH / 2 + offset.y * exportScale);
      exportCtx.rotate((rotation * Math.PI) / 180);
      exportCtx.scale(scale * exportScale, scale * exportScale);

      exportCtx.drawImage(img, -img.width / 2, -img.height / 2);
      exportCtx.restore();

      const base64 = exportCanvas.toDataURL('image/png');
      onSave(base64);
    }

    onClose();
  };

  const handleReset = () => {
    if (!imageRef.current) return;
    const minDimension = Math.min(imageRef.current.width, imageRef.current.height);
    setScale(280 / minDimension);
    setOffset({ x: 0, y: 0 });
    setRotation(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none">
      <div className="bg-[#121720] border border-surface-border rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden animate-scaleUp">
        {/* Header */}
        <div className="p-4 border-b border-surface-border flex items-center justify-between bg-surface-100/50">
          <div>
            <h3 className="font-serif text-base font-bold text-slate-100 flex items-center space-x-2">
              <Crop className="w-4 h-4 text-amber-400" />
              <span>{title}</span>
            </h3>
            <p className="text-[11px] text-slate-400">Drag to reposition focal point. Scroll to zoom.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-surface-hover"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport Canvas */}
        <div className="p-5 flex flex-col items-center justify-center bg-[#090d12]">
          <div className="relative rounded-xl overflow-hidden border border-surface-border shadow-inner cursor-grab active:cursor-grabbing">
            <canvas
              ref={canvasRef}
              width={320}
              height={320}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
              className="block"
            />

            <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[10px] text-slate-300 font-mono flex items-center space-x-1">
              <Move className="w-3 h-3 text-amber-400" />
              <span>Drag to Pan</span>
            </div>
          </div>
        </div>

        {/* Controls Toolbar */}
        <div className="p-4 bg-surface-100 border-t border-surface-border space-y-3">
          {/* Zoom Slider */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setScale((s) => Math.max(0.3, s - 0.15))}
              className="p-1.5 rounded bg-surface-50 hover:bg-surface-hover text-slate-300 border border-surface-border"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>

            <div className="flex-1 flex items-center space-x-2">
              <input
                type="range"
                min="0.3"
                max="3.5"
                step="0.05"
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-surface-50 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <span className="text-[11px] font-mono text-slate-300 w-10 text-right">
                {Math.round(scale * 100)}%
              </span>
            </div>

            <button
              onClick={() => setScale((s) => Math.min(3.5, s + 0.15))}
              className="p-1.5 rounded bg-surface-50 hover:bg-surface-hover text-slate-300 border border-surface-border"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Rotation & Reset Row */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setRotation((r) => (r - 90 + 360) % 360)}
                className="px-2.5 py-1 rounded bg-surface-50 hover:bg-surface-hover text-slate-300 border border-surface-border flex items-center space-x-1"
                title="Rotate counter-clockwise"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>-90°</span>
              </button>

              <button
                type="button"
                onClick={() => setRotation((r) => (r + 90) % 360)}
                className="px-2.5 py-1 rounded bg-surface-50 hover:bg-surface-hover text-slate-300 border border-surface-border flex items-center space-x-1"
                title="Rotate clockwise"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>+90°</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="px-2.5 py-1 rounded bg-surface-50 hover:bg-surface-hover text-slate-400 hover:text-slate-200 border border-surface-border flex items-center space-x-1"
                title="Reset position and scale"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg bg-surface-50 hover:bg-surface-hover text-slate-300 font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyCrop}
                className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold shadow-md flex items-center space-x-1"
              >
                <Check className="w-4 h-4" />
                <span>Apply Crop</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
