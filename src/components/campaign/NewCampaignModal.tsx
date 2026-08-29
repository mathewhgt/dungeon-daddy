import React, { useState } from 'react';
import { X, Compass, Save, MapPin, Calendar, Users, Image as ImageIcon } from 'lucide-react';
import { CampaignEntity } from '../../types/campaign';
import { useApp } from '../../context/AppContext';
import { ImageUploadPicker } from '../common/ImageUploadPicker';

interface NewCampaignModalProps {
  initialData?: CampaignEntity | null;
  onClose: () => void;
  onSave: (campaign: CampaignEntity) => void;
}

export const NewCampaignModal: React.FC<NewCampaignModalProps> = ({
  initialData,
  onClose,
  onSave,
}) => {
  const { db, showToast } = useApp();

  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [currentLocation, setCurrentLocation] = useState(initialData?.currentLocation || '');
  const [inGameDate, setInGameDate] = useState(initialData?.inGameDate || '');
  const [bannerUrl, setBannerUrl] = useState(initialData?.bannerUrl || '');
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>(
    initialData?.playerCharacterIds || db.players.map((p) => p.id)
  );

  const togglePlayer = (id: string) => {
    setSelectedPlayerIds((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
    );
  };

  const selectAllPlayers = () => {
    setSelectedPlayerIds(db.players.map((p) => p.id));
  };

  const deselectAllPlayers = () => {
    setSelectedPlayerIds([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Please enter a campaign name.');
      return;
    }

    const campaign: CampaignEntity = {
      id: initialData?.id || `campaign-${Date.now()}`,
      type: 'campaignNote' as any,
      name: name.trim(),
      description: description.trim() || 'A new adventure begins...',
      currentLocation: currentLocation.trim() || undefined,
      inGameDate: inGameDate.trim() || undefined,
      bannerUrl: bannerUrl || undefined,
      playerCharacterIds: selectedPlayerIds,
      notes: initialData?.notes || [],
      encounterIds: initialData?.encounterIds || [],
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(campaign);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn select-none">
      <div className="bg-[#121720] border border-surface-border rounded-2xl shadow-2xl w-full max-w-xl flex flex-col overflow-hidden animate-scaleUp">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-surface-border flex items-center justify-between bg-surface-100/60">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-slate-100 text-base">
                {initialData ? 'Edit Campaign Details' : 'Create New Campaign'}
              </h3>
              <p className="text-xs text-slate-400">
                {initialData ? 'Update campaign setting and active party roster' : 'Start a new D&D adventure and party roster'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-surface-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto max-h-[75vh]">
          {/* Campaign Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Campaign Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder="e.g. Curse of Strahd, Waterdeep: Dragon Heist"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-surface-50 border border-surface-border rounded-xl text-sm text-slate-100 focus:outline-none focus:border-amber-500 placeholder-slate-500"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Adventure Synopsis / Premise
            </label>
            <textarea
              rows={2}
              placeholder="A brief overview of the campaign's setting and quest..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-surface-50 border border-surface-border rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500 placeholder-slate-500 resize-none"
            />
          </div>

          {/* Location & In-Game Date (2 Columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>Current Location</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Village of Barovia, Yawning Portal"
                value={currentLocation}
                onChange={(e) => setCurrentLocation(e.target.value)}
                className="w-full px-3 py-2 bg-surface-50 border border-surface-border rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500 placeholder-slate-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                <span>In-Game Date / Year</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 735 BC, 1492 DR (Spring)"
                value={inGameDate}
                onChange={(e) => setInGameDate(e.target.value)}
                className="w-full px-3 py-2 bg-surface-50 border border-surface-border rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-500 placeholder-slate-500"
              />
            </div>
          </div>

          {/* Banner Image */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
              <span>Campaign Banner Artwork</span>
            </label>
            <ImageUploadPicker
              avatarUrl={bannerUrl}
              onAvatarChange={setBannerUrl}
              onTokenChange={() => {}}
              entityName={name || 'Campaign'}
              label="Select or upload banner image"
            />
          </div>

          {/* Party Hero Roster Assignment */}
          <div className="space-y-2 pt-2 border-t border-surface-border">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                <span>Assign Party Heroes ({selectedPlayerIds.length} / {db.players.length})</span>
              </label>
              <div className="space-x-2 text-[10px] text-slate-400">
                <button
                  type="button"
                  onClick={selectAllPlayers}
                  className="hover:text-amber-400 underline"
                >
                  Select All
                </button>
                <span>·</span>
                <button
                  type="button"
                  onClick={deselectAllPlayers}
                  className="hover:text-amber-400 underline"
                >
                  Deselect All
                </button>
              </div>
            </div>

            {db.players.length === 0 ? (
              <div className="p-3 rounded-xl bg-surface-50 border border-surface-border text-center text-xs text-slate-500">
                No hero characters found. You can create heroes later in the Party tab.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto p-1 bg-surface-50 rounded-xl border border-surface-border">
                {db.players.map((p) => {
                  const isChecked = selectedPlayerIds.includes(p.id);
                  return (
                    <label
                      key={p.id}
                      className={`flex items-center space-x-2.5 p-2 rounded-lg cursor-pointer border transition-colors ${
                        isChecked
                          ? 'bg-amber-500/10 border-amber-500/40 text-slate-100'
                          : 'bg-surface-100/50 border-surface-border text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => togglePlayer(p.id)}
                        className="rounded border-slate-700 text-amber-500 focus:ring-amber-500"
                      />
                      <div className="truncate text-xs">
                        <div className="font-semibold truncate">{p.name}</div>
                        <div className="text-[10px] text-slate-500 truncate">
                          Lv.{p.level} {p.characterClass}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-surface-border flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-surface-50 hover:bg-surface-hover text-slate-300 text-xs font-semibold rounded-xl border border-surface-border transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center space-x-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{initialData ? 'Save Changes' : 'Create Campaign'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
