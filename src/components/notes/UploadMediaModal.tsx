import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  Image as ImageIcon, 
  Compass, 
  FileText, 
  Folder, 
  Eye, 
  EyeOff, 
  Sparkles,
  BookOpen,
  MapPin
} from 'lucide-react';
import { CampaignNote, NoteCategory } from '../../types/campaign';

interface UploadMediaModalProps {
  campaignId: string;
  folders: { id: string; name: string }[];
  initialFolderId?: string | null;
  initialNote?: CampaignNote | null;
  onClose: () => void;
  onSave: (note: CampaignNote) => void;
}

export const UploadMediaModal: React.FC<UploadMediaModalProps> = ({
  campaignId,
  folders,
  initialFolderId = null,
  initialNote = null,
  onClose,
  onSave,
}) => {
  const [tab, setTab] = useState<'upload' | 'url'>('upload');
  const [name, setName] = useState(initialNote?.name || '');
  const [category, setCategory] = useState<NoteCategory>(initialNote?.category || 'Image');
  const [parentId, setParentId] = useState<string | null>(
    initialNote ? (initialNote.parentId || null) : initialFolderId
  );
  const [isPlayerVisible, setIsPlayerVisible] = useState(initialNote?.isPlayerVisible || false);
  const [imageUrl, setImageUrl] = useState(initialNote?.imageUrl || '');
  const [urlInput, setUrlInput] = useState('');
  const [content, setContent] = useState(initialNote?.content || '');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!name) {
      const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setName(baseName.charAt(0).toUpperCase() + baseName.slice(1));
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
    if (!name) {
      try {
        const urlObj = new URL(urlInput.trim());
        const pathname = urlObj.pathname;
        const filePart = pathname.substring(pathname.lastIndexOf('/') + 1);
        const namePart = filePart.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        if (namePart) {
          setName(namePart.charAt(0).toUpperCase() + namePart.slice(1));
        }
      } catch {
        setName('Artwork');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !imageUrl) return;

    const note: CampaignNote = {
      id: initialNote?.id || `media-${Date.now()}`,
      type: 'campaignNote',
      campaignId,
      name: name.trim(),
      category,
      parentId: parentId || null,
      isFolder: false,
      imageUrl,
      content,
      isPlayerVisible,
      createdAt: initialNote?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(note);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 select-none">
      <div className="bg-[#121720] border border-surface-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-scaleUp">
        {/* Header */}
        <div className="p-4 bg-surface-100/80 border-b border-surface-border flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400">
              {category === 'Map' ? <Compass className="w-4 h-4 text-cyan-400" /> : <ImageIcon className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-slate-100">
                {initialNote ? 'Edit Artwork / Map' : 'Upload Standalone Artwork / Non-Battle Map'}
              </h3>
              <p className="text-[11px] text-slate-400">
                Store city art, regional maps, and visual references directly in your folder hierarchy
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-surface-hover transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Image Upload / URL */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200">Artwork / Map File</label>
              <div className="flex bg-surface-50 p-0.5 rounded-lg border border-surface-border text-xs">
                <button
                  type="button"
                  onClick={() => setTab('upload')}
                  className={`px-3 py-0.5 rounded font-medium transition-colors ${tab === 'upload' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  File Upload
                </button>
                <button
                  type="button"
                  onClick={() => setTab('url')}
                  className={`px-3 py-0.5 rounded font-medium transition-colors ${tab === 'url' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Paste URL
                </button>
              </div>
            </div>

            {tab === 'upload' ? (
              <label className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed border-surface-border hover:border-pink-500/60 bg-surface-50/50 hover:bg-surface-50 cursor-pointer transition-colors text-center group">
                <Upload className="w-7 h-7 text-slate-400 group-hover:text-pink-400 mb-1.5 transition-colors" />
                <span className="text-xs font-semibold text-slate-200">Click to Browse or Drag Image</span>
                <span className="text-[10px] text-slate-500 mt-0.5">PNG, JPG, WebP, GIF, SVG (Stored locally in campaign)</span>
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
                  placeholder="https://example.com/phandelver_artwork.png"
                  className="flex-1 bg-surface-50 border border-surface-border rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={handleApplyUrl}
                  className="px-4 py-2 bg-surface-100 hover:bg-surface-hover text-amber-400 border border-surface-border font-bold text-xs rounded-lg"
                >
                  Set Image
                </button>
              </div>
            )}
          </div>

          {/* Thumbnail preview if selected */}
          {imageUrl && (
            <div className="p-3 rounded-xl bg-[#090d12] border border-surface-border flex items-center space-x-3">
              <div className="w-24 h-16 rounded-lg overflow-hidden border border-surface-border bg-surface-100 shrink-0 flex items-center justify-center shadow-md">
                <img src={imageUrl} alt="Thumbnail preview" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 text-xs truncate">
                <div className="font-semibold text-slate-200 truncate">{name || 'Image Ready'}</div>
                <div className="text-[10px] text-emerald-400 mt-0.5">✓ Image loaded successfully</div>
              </div>
              <button
                type="button"
                onClick={() => setImageUrl('')}
                className="px-2.5 py-1 rounded bg-surface-50 hover:bg-red-950 text-slate-400 hover:text-red-400 border border-surface-border text-xs transition-colors"
              >
                Change
              </button>
            </div>
          )}

          {/* Title and Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Title / Caption</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. City of Phandelver"
                className="w-full bg-surface-50 border border-surface-border rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:border-amber-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as NoteCategory)}
                className="w-full bg-surface-50 border border-surface-border rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:border-amber-500"
              >
                <option value="Image">🖼️ Image / Artwork</option>
                <option value="Map">🧭 Map (Non-Battle / Regional)</option>
                <option value="Handout">📜 Handout</option>
                <option value="Location">📍 Location</option>
                <option value="Lore">📖 Lore</option>
                <option value="Session">📅 Session</option>
              </select>
            </div>
          </div>

          {/* Parent Folder & Visibility */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Target Folder</label>
              <select
                value={parentId || ''}
                onChange={(e) => setParentId(e.target.value || null)}
                className="w-full bg-surface-50 border border-surface-border rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:border-amber-500"
              >
                <option value="">📁 Root Level</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>
                    📁 {f.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Player Visibility</label>
              <label className="flex items-center space-x-2 bg-surface-50 border border-surface-border rounded-lg px-3 py-1.5 text-xs text-slate-300 cursor-pointer hover:bg-surface-hover">
                <input
                  type="checkbox"
                  checked={isPlayerVisible}
                  onChange={(e) => setIsPlayerVisible(e.target.checked)}
                  className="w-4 h-4 rounded border-surface-border text-amber-500 bg-surface-100"
                />
                <span className="flex items-center space-x-1.5">
                  {isPlayerVisible ? (
                    <>
                      <Eye className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-300 font-semibold">Player Handout (Visible)</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                      <span>GM Secret (Hidden)</span>
                    </>
                  )}
                </span>
              </label>
            </div>
          </div>

          {/* Description & Lore Notes */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Attached Lore Notes / Room Descriptions</span>
              <span className="text-[10px] text-slate-500">Supports Markdown & Read-Aloud boxes</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              placeholder="Write background information, history, or read-aloud descriptions for this artwork..."
              className="w-full bg-surface-50 border border-surface-border rounded-lg p-2.5 text-xs text-slate-100 font-mono resize-none focus:border-amber-500"
            />
          </div>

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
              disabled={!imageUrl || !name.trim()}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-amber-600 hover:from-pink-500 hover:to-amber-500 text-white font-bold text-xs shadow-lg shadow-pink-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1.5"
            >
              <ImageIcon className="w-4 h-4" />
              <span>{initialNote ? 'Save Changes' : 'Add to Folder'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
