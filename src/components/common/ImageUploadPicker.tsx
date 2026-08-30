import React, { useState } from 'react';
import { Upload, Link as LinkIcon, Trash2, Sparkles, Image as ImageIcon, Crop } from 'lucide-react';
import { TokenAvatar } from './TokenAvatar';
import { ImageCropperModal } from './ImageCropperModal';

import { processImageUpload } from '../../utils/imageUtils';

interface ImageUploadPickerProps {
  label?: string;
  avatarUrl?: string;
  tokenUrl?: string;
  onAvatarChange: (url: string) => void;
  onTokenChange: (url: string) => void;
  onImagesChange?: (urls: { avatarUrl?: string; tokenUrl?: string }) => void;
  entityName?: string;
  entityType?: 'monster' | 'player' | 'item' | 'spell' | 'npc';
  monsterType?: string;
}

export const ImageUploadPicker: React.FC<ImageUploadPickerProps> = ({
  label = 'Artwork & VTT Map Token',
  avatarUrl = '',
  tokenUrl = '',
  onAvatarChange,
  onTokenChange,
  onImagesChange,
  entityName = 'Entity',
  entityType = 'monster',
  monsterType = '',
}) => {
  const [tab, setTab] = useState<'upload' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState('');
  const [tokenColor, setTokenColor] = useState('');
  const [cropModalConfig, setCropModalConfig] = useState<{ isOpen: boolean; mode: 'token' | 'portrait'; imageSrc: string } | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isToken = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { avatarUrl: processedAvatar, tokenUrl: processedToken } = await processImageUpload(file, isToken);
      if (isToken) {
        if (onImagesChange) {
          onImagesChange({ tokenUrl: processedToken });
        } else {
          onTokenChange(processedToken);
        }
      } else {
        if (onImagesChange) {
          onImagesChange({
            avatarUrl: processedAvatar,
            tokenUrl: tokenUrl || processedToken,
          });
        } else {
          onAvatarChange(processedAvatar);
          if (!tokenUrl) {
            onTokenChange(processedToken);
          }
        }
      }
    } catch (err) {
      console.error('Failed to process image upload:', err);
    }
  };

  const handleApplyUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    if (onImagesChange) {
      onImagesChange({
        avatarUrl: trimmed,
        tokenUrl: tokenUrl || trimmed,
      });
    } else {
      onAvatarChange(trimmed);
      if (!tokenUrl) {
        onTokenChange(trimmed);
      }
    }
    setUrlInput('');
  };

  const tokenColorPresets = [
    { label: 'Amber / Gold', val: 'border-amber-500 ring-amber-500/40' },
    { label: 'Emerald / Hero', val: 'border-emerald-500 ring-emerald-500/40' },
    { label: 'Crimson / Boss', val: 'border-red-600 ring-red-600/50' },
    { label: 'Indigo / Arcane', val: 'border-indigo-500 ring-indigo-500/40' },
    { label: 'Purple / Nether', val: 'border-purple-500 ring-purple-500/40' },
  ];

  const handleOpenCropper = (mode: 'token' | 'portrait') => {
    const src = mode === 'token' ? (tokenUrl || avatarUrl) : (avatarUrl || tokenUrl);
    if (!src) return;
    setCropModalConfig({
      isOpen: true,
      mode,
      imageSrc: src,
    });
  };

  return (
    <div className="p-4 rounded-xl bg-surface-50 border border-surface-border space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-200 flex items-center space-x-1.5">
          <ImageIcon className="w-4 h-4 text-amber-400" />
          <span>{label}</span>
        </label>
        <div className="flex bg-surface-100 p-0.5 rounded-lg border border-surface-border text-xs">
          <button
            type="button"
            onClick={() => setTab('upload')}
            className={`px-2.5 py-0.5 rounded font-medium ${tab === 'upload' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'}`}
          >
            File Upload
          </button>
          <button
            type="button"
            onClick={() => setTab('url')}
            className={`px-2.5 py-0.5 rounded font-medium ${tab === 'url' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'}`}
          >
            Paste URL
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        {/* Left: Upload / URL Controls */}
        <div className="md:col-span-2 space-y-3">
          {tab === 'upload' ? (
            <div className="space-y-2">
              <label className="flex flex-col items-center justify-center p-4 rounded-lg border-2 border-dashed border-surface-border hover:border-amber-500/60 bg-surface-100/50 hover:bg-surface-hover cursor-pointer transition-colors text-center">
                <Upload className="w-6 h-6 text-slate-400 mb-1" />
                <span className="text-xs font-semibold text-slate-300">Click to Browse or Drag Image</span>
                <span className="text-[10px] text-slate-500 mt-0.5">PNG, JPG, WebP, SVG, GIF (Saved locally)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, false)}
                  className="hidden"
                />
              </label>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex space-x-1.5">
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example.com/artwork.png"
                  className="flex-1 bg-surface-100 border border-surface-border rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={handleApplyUrl}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-lg"
                >
                  Set Image
                </button>
              </div>
            </div>
          )}

          {/* Token Ring Border Presets */}
          <div className="space-y-1">
            <div className="text-[11px] font-semibold text-slate-400 flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Token Ring Border:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {tokenColorPresets.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setTokenColor(preset.val)}
                  className={`px-2 py-0.5 rounded text-[10px] border transition-colors ${
                    tokenColor === preset.val
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                      : 'bg-surface-100 border-surface-border text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Live Previews (Portrait + Circular Token) */}
        <div className="flex items-center justify-around p-3 rounded-lg bg-surface-100 border border-surface-border">
          {/* Portrait Preview with Crop Button */}
          <div className="flex flex-col items-center space-y-1.5">
            <div className="text-[10px] uppercase font-bold text-slate-400">Portrait</div>
            <div className="w-16 h-20 rounded-lg border border-surface-border bg-surface-50 overflow-hidden flex items-center justify-center shadow-md relative group">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Portrait" className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="w-6 h-6 text-slate-600" />
              )}
            </div>

            {avatarUrl && (
              <button
                type="button"
                onClick={() => handleOpenCropper('portrait')}
                className="px-2 py-0.5 rounded bg-surface-50 hover:bg-surface-hover text-blue-300 border border-surface-border text-[10px] font-semibold flex items-center space-x-0.5 transition-colors"
                title="Crop and reposition portrait"
              >
                <Crop className="w-3 h-3" />
                <span>Adjust</span>
              </button>
            )}
          </div>

          {/* Circular VTT Token Preview with Crop Button */}
          <div className="flex flex-col items-center space-y-1.5">
            <div className="text-[10px] uppercase font-bold text-slate-400">VTT Token</div>
            <TokenAvatar
              name={entityName}
              imageUrl={avatarUrl}
              tokenUrl={tokenUrl}
              type={entityType}
              monsterType={monsterType}
              borderColor={tokenColor}
              size="xl"
            />

            {(tokenUrl || avatarUrl) && (
              <button
                type="button"
                onClick={() => handleOpenCropper('token')}
                className="px-2 py-0.5 rounded bg-surface-50 hover:bg-surface-hover text-amber-300 border border-surface-border text-[10px] font-semibold flex items-center space-x-0.5 transition-colors"
                title="Crop and reposition VTT token"
              >
                <Crop className="w-3 h-3" />
                <span>Adjust</span>
              </button>
            )}
          </div>

          {(avatarUrl || tokenUrl) && (
            <button
              type="button"
              onClick={() => {
                if (onImagesChange) {
                  onImagesChange({ avatarUrl: '', tokenUrl: '' });
                } else {
                  onAvatarChange('');
                  onTokenChange('');
                }
              }}
              className="p-1 text-slate-500 hover:text-red-400 rounded hover:bg-surface-50 self-start"
              title="Remove image"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Interactive Image Cropper Modal */}
      {cropModalConfig?.isOpen && (
        <ImageCropperModal
          imageSrc={cropModalConfig.imageSrc}
          mode={cropModalConfig.mode}
          onClose={() => setCropModalConfig(null)}
          onSave={(croppedBase64) => {
            if (cropModalConfig.mode === 'token') {
              onTokenChange(croppedBase64);
            } else {
              onAvatarChange(croppedBase64);
            }
          }}
        />
      )}
    </div>
  );
};
