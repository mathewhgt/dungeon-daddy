import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  Link as LinkIcon, 
  Image as ImageIcon, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Columns, 
  Sparkles,
  Maximize2
} from 'lucide-react';

interface NoteImageModalProps {
  onClose: () => void;
  onInsert: (markdownSnippet: string) => void;
}

export type ImageAlignment = 'left' | 'right' | 'center' | 'column';
export type ImageSize = '25%' | '33%' | '50%' | '75%' | '100%';
export type ImageFrame = 'gold' | 'parchment' | 'dark' | 'none';

export const NoteImageModal: React.FC<NoteImageModalProps> = ({ onClose, onInsert }) => {
  const [tab, setTab] = useState<'upload' | 'url'>('upload');
  const [imageUrl, setImageUrl] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [altText, setAltText] = useState('');
  const [caption, setCaption] = useState('');
  const [align, setAlign] = useState<ImageAlignment>('left');
  const [size, setSize] = useState<ImageSize>('50%');
  const [frame, setFrame] = useState<ImageFrame>('gold');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!altText) {
      const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setAltText(baseName.charAt(0).toUpperCase() + baseName.slice(1));
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setImageUrl(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = () => {
    if (!urlInput.trim()) return;
    setImageUrl(urlInput.trim());
    if (!altText) {
      try {
        const urlObj = new URL(urlInput.trim());
        const pathname = urlObj.pathname;
        const filePart = pathname.substring(pathname.lastIndexOf('/') + 1);
        const namePart = filePart.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        if (namePart) {
          setAltText(namePart.charAt(0).toUpperCase() + namePart.slice(1));
        }
      } catch {
        setAltText('Artwork');
      }
    }
  };

  const handleInsert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) return;

    // Build the custom :::image block
    const escapeAttr = (str: string) => str.replace(/"/g, '&quot;');
    const altAttr = altText ? ` alt="${escapeAttr(altText)}"` : '';
    const captionAttr = caption ? ` caption="${escapeAttr(caption)}"` : '';
    const alignAttr = ` align="${align}"`;
    const sizeAttr = ` size="${size}"`;
    const frameAttr = frame !== 'gold' ? ` frame="${frame}"` : '';

    const snippet = `\n:::image src="${imageUrl}"${altAttr}${alignAttr}${sizeAttr}${frameAttr}${captionAttr}\n:::\n`;
    onInsert(snippet);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 select-none">
      <div className="bg-[#121720] border border-surface-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-scaleUp">
        {/* Modal Header */}
        <div className="p-4 bg-surface-100/80 border-b border-surface-border flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-slate-100">Insert Formatted Image</h3>
              <p className="text-[11px] text-slate-400">Embed artwork or maps with wrapping, column layout, and captions</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-surface-hover transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleInsert} className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Source Selection (Upload / URL) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200">Image Source</label>
              <div className="flex bg-surface-50 p-0.5 rounded-lg border border-surface-border text-xs">
                <button
                  type="button"
                  onClick={() => setTab('upload')}
                  className={`px-3 py-1 rounded font-medium transition-colors ${tab === 'upload' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  File Upload
                </button>
                <button
                  type="button"
                  onClick={() => setTab('url')}
                  className={`px-3 py-1 rounded font-medium transition-colors ${tab === 'url' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Image URL
                </button>
              </div>
            </div>

            {tab === 'upload' ? (
              <label className="flex flex-col items-center justify-center p-5 rounded-xl border-2 border-dashed border-surface-border hover:border-amber-500/60 bg-surface-50/50 hover:bg-surface-50 cursor-pointer transition-colors text-center group">
                <Upload className="w-6 h-6 text-slate-400 group-hover:text-amber-400 mb-1.5 transition-colors" />
                <span className="text-xs font-semibold text-slate-200">Click to Browse or Drag Image File</span>
                <span className="text-[10px] text-slate-500 mt-0.5">PNG, JPG, WebP, GIF, SVG</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example.com/map_or_art.jpg"
                  className="flex-1 bg-surface-50 border border-surface-border rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={handleApplyUrl}
                  className="px-4 py-2 bg-surface-100 hover:bg-surface-hover text-amber-400 border border-surface-border font-bold text-xs rounded-lg transition-colors"
                >
                  Apply URL
                </button>
              </div>
            )}
          </div>

          {/* Details & Caption */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Alt Text / Title</label>
              <input
                type="text"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                placeholder="e.g. Phandelver Town Hall"
                className="w-full bg-surface-50 border border-surface-border rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:border-amber-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Caption (Optional subtitle)</label>
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="e.g. Regional map depicting Sword Mountains"
                className="w-full bg-surface-50 border border-surface-border rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:border-amber-500"
              />
            </div>
          </div>

          {/* Alignment & Text Wrapping */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Alignment & Text Wrap</span>
              <span className="text-[10px] text-amber-400 font-mono">
                {align === 'left' && 'Floats left with text wrapping on the right'}
                {align === 'right' && 'Floats right with text wrapping on the left'}
                {align === 'center' && 'Centered standalone block'}
                {align === 'column' && 'Optimized for side-by-side columns'}
              </span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setAlign('left')}
                className={`p-2 rounded-xl border text-left flex items-center space-x-2 transition-all ${
                  align === 'left'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                    : 'bg-surface-50 border-surface-border text-slate-300 hover:bg-surface-hover'
                }`}
              >
                <AlignLeft className="w-4 h-4 shrink-0" />
                <span className="text-xs">Wrap Left</span>
              </button>

              <button
                type="button"
                onClick={() => setAlign('right')}
                className={`p-2 rounded-xl border text-left flex items-center space-x-2 transition-all ${
                  align === 'right'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                    : 'bg-surface-50 border-surface-border text-slate-300 hover:bg-surface-hover'
                }`}
              >
                <AlignRight className="w-4 h-4 shrink-0" />
                <span className="text-xs">Wrap Right</span>
              </button>

              <button
                type="button"
                onClick={() => setAlign('center')}
                className={`p-2 rounded-xl border text-left flex items-center space-x-2 transition-all ${
                  align === 'center'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                    : 'bg-surface-50 border-surface-border text-slate-300 hover:bg-surface-hover'
                }`}
              >
                <AlignCenter className="w-4 h-4 shrink-0" />
                <span className="text-xs">Center Block</span>
              </button>

              <button
                type="button"
                onClick={() => setAlign('column')}
                className={`p-2 rounded-xl border text-left flex items-center space-x-2 transition-all ${
                  align === 'column'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                    : 'bg-surface-50 border-surface-border text-slate-300 hover:bg-surface-hover'
                }`}
              >
                <Columns className="w-4 h-4 shrink-0" />
                <span className="text-xs">Column</span>
              </button>
            </div>
          </div>

          {/* Sizing & Frame Styling Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Size */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Width / Size</label>
              <div className="flex bg-surface-50 p-1 rounded-xl border border-surface-border text-xs">
                {(['25%', '33%', '50%', '75%', '100%'] as ImageSize[]).map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setSize(sz)}
                    className={`flex-1 py-1 rounded-lg text-center font-medium transition-colors ${
                      size === sz ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Frame Styling */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Frame Border Style</label>
              <div className="grid grid-cols-4 gap-1.5 text-[11px]">
                {[
                  { id: 'gold', label: 'Gold Rim' },
                  { id: 'parchment', label: 'Parchment' },
                  { id: 'dark', label: 'Dark' },
                  { id: 'none', label: 'Clean' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFrame(f.id as ImageFrame)}
                    className={`py-1.5 px-1 rounded-lg border text-center font-medium transition-all ${
                      frame === f.id
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                        : 'bg-surface-50 border-surface-border text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Live Preview Card */}
          {imageUrl && (
            <div className="space-y-1.5 pt-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Live Preview</span>
              </label>
              <div className="p-4 rounded-xl bg-[#090d12] border border-surface-border overflow-hidden">
                <div className="clearfix">
                  <div
                    className={`transition-all ${
                      align === 'left'
                        ? 'float-left mr-4 mb-3'
                        : align === 'right'
                        ? 'float-right ml-4 mb-3'
                        : align === 'column'
                        ? 'w-full mb-3'
                        : 'mx-auto mb-3 text-center'
                    }`}
                    style={{
                      width: align === 'center' ? (size === '100%' ? '100%' : size) : size,
                      maxWidth: '100%',
                    }}
                  >
                    <div
                      className={`overflow-hidden rounded-xl shadow-xl ${
                        frame === 'gold'
                          ? 'border-2 border-amber-500/60 shadow-amber-500/10'
                          : frame === 'parchment'
                          ? 'border-2 border-[#a3794d] bg-[#1a140d]'
                          : frame === 'dark'
                          ? 'border border-surface-border bg-surface-100'
                          : 'border-0'
                      }`}
                    >
                      <img
                        src={imageUrl}
                        alt={altText || 'Preview'}
                        className="w-full h-auto object-cover rounded-lg max-h-56"
                      />
                    </div>
                    {caption && (
                      <p className="text-[11px] text-slate-400 italic text-center mt-1 leading-snug">
                        {caption}
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phandelver is a historic mining town nestled near the Sword Mountains. When players arrive at the town square, describe the ambient chatter of merchants and the distant snow-capped peaks.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Footer Submit */}
          <div className="pt-3 border-t border-surface-border flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-surface-50 text-slate-300 text-xs font-semibold hover:bg-surface-hover"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!imageUrl}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1.5"
            >
              <ImageIcon className="w-4 h-4" />
              <span>Insert Image into Note</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
