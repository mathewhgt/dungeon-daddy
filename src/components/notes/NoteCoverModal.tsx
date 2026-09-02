import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  Link as LinkIcon, 
  Image as ImageIcon, 
  Sparkles, 
  Check, 
  Grid,
  Compass
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface NoteCoverModalProps {
  currentUrl?: string;
  onClose: () => void;
  onSelect: (url: string) => void;
}

export const NoteCoverModal: React.FC<NoteCoverModalProps> = ({
  currentUrl = '',
  onClose,
  onSelect,
}) => {
  const { db, activeCampaignId } = useApp();
  const [tab, setTab] = useState<'upload' | 'url' | 'gallery'>('upload');
  const [selectedUrl, setSelectedUrl] = useState<string>(currentUrl);
  const [urlInput, setUrlInput] = useState<string>(currentUrl.startsWith('http') ? currentUrl : '');

  // Collect existing artwork from campaign notes and battlemaps
  const campaign = db.campaigns.find((c) => c.id === activeCampaignId) || db.campaigns[0];
  const galleryImages = React.useMemo(() => {
    const list: { id: string; name: string; url: string; source: string }[] = [];

    // From maps
    (db.maps || []).forEach((m) => {
      if (m.imageUrl) {
        list.push({ id: m.id, name: m.name, url: m.imageUrl, source: 'Battlemap' });
      }
    });

    // From notes with images
    (campaign?.notes || []).forEach((n) => {
      if (n.imageUrl) {
        list.push({ id: n.id, name: n.name, url: n.imageUrl, source: n.category || 'Note' });
      } else if (n.coverImageUrl) {
        list.push({ id: `${n.id}-cover`, name: `${n.name} (Cover)`, url: n.coverImageUrl, source: 'Note Cover' });
      }
    });

    return list;
  }, [db.maps, campaign?.notes]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setSelectedUrl(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = () => {
    if (!urlInput.trim()) return;
    setSelectedUrl(urlInput.trim());
  };

  const handleConfirm = () => {
    if (!selectedUrl.trim()) return;
    onSelect(selectedUrl.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 select-none animate-fadeIn">
      <div className="bg-[#121720] border border-surface-border rounded-2xl shadow-2xl w-full max-w-xl flex flex-col overflow-hidden animate-scaleUp">
        {/* Header */}
        <div className="p-4 border-b border-surface-border flex items-center justify-between bg-surface-100/60">
          <div className="flex items-center space-x-2">
            <ImageIcon className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="font-serif text-base font-bold text-slate-100">Cover Artwork</h3>
              <p className="text-[11px] text-slate-400">Add a sourcebook-style landscape banner with a watercolor blend.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-surface-50 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-surface-border bg-surface-100/30 px-4 pt-2 space-x-2">
          <button
            onClick={() => setTab('upload')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-t-lg border-b-2 flex items-center space-x-1.5 transition-colors ${
              tab === 'upload'
                ? 'border-amber-500 text-amber-400 bg-surface-50'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload File</span>
          </button>

          <button
            onClick={() => setTab('url')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-t-lg border-b-2 flex items-center space-x-1.5 transition-colors ${
              tab === 'url'
                ? 'border-amber-500 text-amber-400 bg-surface-50'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Web Link</span>
          </button>

          <button
            onClick={() => setTab('gallery')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-t-lg border-b-2 flex items-center space-x-1.5 transition-colors ${
              tab === 'gallery'
                ? 'border-amber-500 text-amber-400 bg-surface-50'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Campaign Art ({galleryImages.length})</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {tab === 'upload' && (
            <div className="space-y-3">
              <label className="border-2 border-dashed border-surface-border hover:border-amber-500/60 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-surface-50/40 hover:bg-surface-50/70 group">
                <Upload className="w-8 h-8 text-slate-500 group-hover:text-amber-400 transition-colors mb-2" />
                <span className="text-xs font-bold text-slate-200">Click to upload artwork image</span>
                <span className="text-[10px] text-slate-400 mt-0.5">Supports PNG, JPG, WebP, or SVG</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {tab === 'url' && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Image Web URL</label>
                <div className="flex space-x-2">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://example.com/artwork.jpg"
                    className="flex-1 bg-surface-50 border border-surface-border rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    onClick={handleApplyUrl}
                    className="px-3 py-1.5 bg-surface-50 hover:bg-surface-hover text-slate-200 text-xs font-bold rounded-lg border border-surface-border transition-colors"
                  >
                    Preview
                  </button>
                </div>
              </div>
            </div>
          )}

          {tab === 'gallery' && (
            <div className="space-y-2">
              <span className="text-xs text-slate-400">Choose from battlemaps and images already in your campaign:</span>
              {galleryImages.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">No artwork found in current campaign.</div>
              ) : (
                <div className="grid grid-cols-3 gap-2.5 max-h-56 overflow-y-auto p-1">
                  {galleryImages.map((img) => {
                    const isSelected = selectedUrl === img.url;
                    return (
                      <button
                        key={img.id}
                        onClick={() => setSelectedUrl(img.url)}
                        className={`group relative aspect-video rounded-lg overflow-hidden border transition-all ${
                          isSelected ? 'ring-2 ring-amber-500 border-amber-400' : 'border-surface-border hover:border-slate-500'
                        }`}
                      >
                        <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1.5">
                          <span className="text-[10px] text-white font-medium truncate">{img.name}</span>
                        </div>
                        {isSelected && (
                          <div className="absolute top-1 right-1 p-0.5 rounded-full bg-amber-500 text-slate-950">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Live Preview of Watercolor Blend */}
          {selectedUrl && (
            <div className="space-y-1.5 pt-2 border-t border-surface-border/60">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider font-serif">
                Live Watercolor Blend Preview
              </span>
              <div className="relative w-full h-36 rounded-xl overflow-hidden bg-[#090d12] border border-surface-border">
                <img
                  src={selectedUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                <div 
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: 'linear-gradient(to bottom, transparent 0%, transparent 40%, rgba(9, 13, 18, 0.2) 55%, rgba(9, 13, 18, 0.6) 75%, #090d12 100%)'
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-surface-100/50 border-t border-surface-border flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleConfirm}
            disabled={!selectedUrl}
            className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Apply Cover Image</span>
          </button>
        </div>
      </div>
    </div>
  );
};
