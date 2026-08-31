import React, { useState } from 'react';
import { 
  Users, 
  Shield, 
  Heart, 
  Eye, 
  Plus, 
  Edit3, 
  Trash2, 
  FileText, 
  MapPin, 
  Calendar,
  Sparkles,
  BookOpen,
  CheckCircle,
  EyeOff
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PlayerEntity } from '../../types/player';
import { CampaignNote, CampaignEntity } from '../../types/campaign';
import { EntityEditorModal } from '../compendium/EntityEditorModal';
import { NewCampaignModal } from './NewCampaignModal';
import { getNoteCategoryIcon, getNoteCategoryStyle } from '../notes/NotesView';
import { BookmarkButton } from '../bookmarks/BookmarkButton';

export const CampaignView: React.FC = () => {
  const { 
    db, 
    activeCampaignId, 
    setActiveCampaignId,
    saveCampaign, 
    savePlayer, 
    deletePlayer, 
    showToast 
  } = useApp();

  const campaign = db.campaigns.find((c) => c.id === activeCampaignId) || db.campaigns[0];
  const party = db.players.filter((p) => !campaign || campaign.playerCharacterIds.includes(p.id));

  const [activeTab, setActiveTab] = useState<'party' | 'notes'>('party');
  const [selectedNote, setSelectedNote] = useState<CampaignNote | null>(campaign?.notes?.[0] || null);
  const [isPlayerEditorOpen, setIsPlayerEditorOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<PlayerEntity | null>(null);
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<CampaignEntity | null>(null);
  const [isNoteEditorOpen, setIsNoteEditorOpen] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteCategory, setNewNoteCategory] = useState<any>('Session');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteIsPlayerVisible, setNewNoteIsPlayerVisible] = useState(false);

  const handleSaveCampaign = (savedCamp: CampaignEntity) => {
    saveCampaign(savedCamp);
    setActiveCampaignId(savedCamp.id);
    showToast(`Saved campaign: ${savedCamp.name}`);
  };

  if (!campaign) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 bg-[#090d12]">
        <div className="text-center space-y-1">
          <h2 className="font-serif text-lg font-bold text-slate-200">No Active Campaign</h2>
          <p className="text-xs text-slate-500">Create a campaign to manage your party, lore, and notes.</p>
        </div>
        <button
          onClick={() => {
            setEditingCampaign(null);
            setIsCampaignModalOpen(true);
          }}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Campaign</span>
        </button>

        {isCampaignModalOpen && (
          <NewCampaignModal
            initialData={editingCampaign}
            onClose={() => setIsCampaignModalOpen(false)}
            onSave={handleSaveCampaign}
          />
        )}
      </div>
    );
  }

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim()) return;

    const note: CampaignNote = {
      id: selectedNote?.id || `note-${Date.now()}`,
      type: 'campaignNote',
      campaignId: campaign.id,
      name: newNoteTitle,
      category: newNoteCategory,
      isFolder: false,
      content: newNoteContent,
      isPlayerVisible: newNoteIsPlayerVisible,
      createdAt: selectedNote?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const existingNotes = campaign.notes || [];
    const noteIdx = existingNotes.findIndex((n) => n.id === note.id);
    let updatedNotes = [...existingNotes];

    if (noteIdx >= 0) {
      updatedNotes[noteIdx] = note;
    } else {
      updatedNotes.unshift(note);
    }

    saveCampaign({ ...campaign, notes: updatedNotes });
    setSelectedNote(note);
    setIsNoteEditorOpen(false);
    showToast(`Saved note: ${note.name}`);
  };

  const handleDeleteNote = (noteId: string) => {
    const updatedNotes = (campaign.notes || []).filter((n) => n.id !== noteId);
    saveCampaign({ ...campaign, notes: updatedNotes });
    setSelectedNote(updatedNotes[0] || null);
    showToast('Note deleted');
  };

  return (
    <div className="h-full flex flex-col bg-[#090d12] overflow-hidden select-none">
      {/* Campaign Header Bar */}
      <div className="p-4 bg-surface-100/60 border-b border-surface-border space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-serif text-xl font-bold text-amber-400">{campaign.name}</h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800 text-[10px] font-bold text-emerald-300">
                ACTIVE CAMPAIGN
              </span>
              <button
                onClick={() => {
                  setEditingCampaign(campaign);
                  setIsCampaignModalOpen(true);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-surface-hover transition-colors"
                title="Edit Campaign Settings"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  setEditingCampaign(null);
                  setIsCampaignModalOpen(true);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-surface-hover transition-colors"
                title="Create New Campaign"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-center space-x-4 text-xs text-slate-400 mt-1">
              {campaign.currentLocation && (
                <div className="flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-500" />
                  <span>{campaign.currentLocation}</span>
                </div>
              )}
              {campaign.inGameDate && (
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-blue-400" />
                  <span>{campaign.inGameDate}</span>
                </div>
              )}
            </div>
          </div>

          {/* Sub Navigation */}
          <div className="flex items-center space-x-2">
            <div className="flex bg-surface-50 p-1 rounded-lg border border-surface-border">
              <button
                onClick={() => setActiveTab('party')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                  activeTab === 'party'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Party Roster ({party.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('notes')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                  activeTab === 'notes'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Adventure Notes & Lore</span>
              </button>
            </div>

            {activeTab === 'party' ? (
              <button
                onClick={() => {
                  setEditingPlayer(null);
                  setIsPlayerEditorOpen(true);
                }}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-lg shadow-sm transition-all flex items-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Hero</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setNewNoteTitle('');
                  setNewNoteCategory('Session');
                  setNewNoteContent('');
                  setNewNoteIsPlayerVisible(false);
                  setIsNoteEditorOpen(true);
                }}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-lg shadow-sm transition-all flex items-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>New Note</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Tab View */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'party' ? (
          <div className="space-y-4 max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {party.map((p) => (
                <div
                  key={p.id}
                  className="p-4 rounded-xl bg-surface-100 border border-surface-border shadow-lg space-y-3 relative group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-serif text-lg font-bold text-slate-100">{p.name}</h3>
                      <div className="text-xs text-amber-400 font-medium">
                        Level {p.level} {p.race} {p.characterClass}
                      </div>
                      {p.playerName && (
                        <div className="text-[11px] text-slate-400">Player: {p.playerName}</div>
                      )}
                    </div>

                    <div className="flex items-center space-x-1 select-none">
                      <button
                        onClick={() => {
                          setEditingPlayer(p);
                          setIsPlayerEditorOpen(true);
                        }}
                        className="p-1.5 bg-surface-50 hover:bg-surface-hover text-slate-300 rounded border border-surface-border transition-colors"
                        title="Edit character"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deletePlayer(p.id)}
                        className="p-1.5 bg-surface-50 hover:bg-red-950 text-slate-400 hover:text-red-400 rounded border border-surface-border transition-colors"
                        title="Delete character"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Core Vitals */}
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="flex items-center space-x-2 bg-surface-50 p-2 rounded-lg border border-surface-border">
                      <Shield className="w-4 h-4 text-blue-400 shrink-0" />
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">Armor Class</div>
                        <div className="font-bold text-slate-100 font-mono text-sm">{p.armorClass}</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 bg-surface-50 p-2 rounded-lg border border-surface-border">
                      <Heart className="w-4 h-4 text-red-400 shrink-0" />
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">Hit Points</div>
                        <div className="font-bold text-slate-100 font-mono text-sm">
                          {p.currentHp} / {p.maxHp}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 bg-surface-50 p-2 rounded-lg border border-surface-border">
                      <Eye className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">Passives</div>
                        <div className="text-[11px] text-slate-300 font-mono">
                          P:{p.passivePerception} I:{p.passiveInsight}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ability Scores */}
                  <div className="grid grid-cols-6 gap-1 text-center bg-surface-50/50 p-2 rounded-lg border border-surface-border text-xs">
                    {[
                      { label: 'STR', val: p.abilities.str },
                      { label: 'DEX', val: p.abilities.dex },
                      { label: 'CON', val: p.abilities.con },
                      { label: 'INT', val: p.abilities.int },
                      { label: 'WIS', val: p.abilities.wis },
                      { label: 'CHA', val: p.abilities.cha },
                    ].map((ab) => (
                      <div key={ab.label}>
                        <div className="text-[10px] font-bold text-slate-400">{ab.label}</div>
                        <div className="font-mono font-bold text-slate-100">{ab.val}</div>
                      </div>
                    ))}
                  </div>

                  {/* Notes / Equipment snippet */}
                  {p.notes && (
                    <div className="text-[11px] text-slate-400 italic bg-surface-50/30 p-2 rounded border border-surface-border line-clamp-2">
                      {p.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Notes & Lore Tab */
          <div className="h-full flex space-x-4 max-w-6xl mx-auto overflow-hidden">
            {/* Notes List */}
            <div className="w-72 bg-surface-100 rounded-xl border border-surface-border p-3 space-y-2 overflow-y-auto shrink-0">
              <div className="text-[11px] font-bold uppercase text-slate-400 tracking-wider mb-2">
                All Notes ({(campaign.notes || []).length})
              </div>
              {(campaign.notes || []).map((note) => {
                const isSelected = selectedNote?.id === note.id;
                const CatIcon = getNoteCategoryIcon(note.category);
                const catStyle = getNoteCategoryStyle(note.category, isSelected);

                return (
                  <button
                    key={note.id}
                    onClick={() => setSelectedNote(note)}
                    className={`w-full text-left p-2.5 rounded-lg border transition-all ${
                      isSelected
                        ? catStyle.selectedBorder
                        : 'bg-surface-50 border-surface-border hover:bg-surface-hover'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5 truncate pr-1">
                        <CatIcon className={`w-3.5 h-3.5 shrink-0 ${catStyle.iconClass}`} />
                        <span className={`font-bold text-xs truncate ${isSelected ? catStyle.textClass : 'text-slate-200'}`}>{note.name}</span>
                      </div>
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold border shrink-0 ${catStyle.badgeBg}`}>
                        {note.category}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{note.content}</div>
                  </button>
                );
              })}
            </div>

            {/* Note Reader / Inspector */}
            <div className="flex-1 bg-surface-100 rounded-xl border border-surface-border p-6 overflow-y-auto flex flex-col justify-between">
              {selectedNote ? (
                <div className="space-y-4">
                  <div className="flex items-start justify-between border-b border-surface-border pb-3">
                    <div>
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <h2 className="font-serif text-xl font-bold text-slate-100">{selectedNote.name}</h2>
                        {(() => {
                          const CatIcon = getNoteCategoryIcon(selectedNote.category);
                          const catStyle = getNoteCategoryStyle(selectedNote.category);
                          return (
                            <span className={`px-2.5 py-0.5 rounded-full border text-xs font-bold flex items-center space-x-1.5 ${catStyle.badgeBg}`}>
                              <CatIcon className={`w-3.5 h-3.5 ${catStyle.iconClass}`} />
                              <span>{selectedNote.category}</span>
                            </span>
                          );
                        })()}
                        {selectedNote.isPlayerVisible ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold flex items-center space-x-1">
                            <Eye className="w-3 h-3" />
                            <span>Player Handout</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-slate-900 text-slate-400 border border-slate-700 text-[10px] font-bold flex items-center space-x-1">
                            <EyeOff className="w-3 h-3" />
                            <span>GM Secret</span>
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        Last updated: {new Date(selectedNote.updatedAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <BookmarkButton
                        type={selectedNote.category === 'NPC' ? 'npc' : (selectedNote.category === 'Lore' ? 'lore' : (selectedNote.category === 'Image' ? 'image' : 'note'))}
                        targetId={selectedNote.id}
                        title={selectedNote.name}
                        subtitle={`${selectedNote.category || 'Note'} • ${campaign?.name || 'Campaign'}`}
                        category={selectedNote.category || 'Note'}
                        imageUrl={selectedNote.imageUrl}
                        campaignId={campaign?.id}
                        showText
                        size="md"
                      />

                      <button
                        onClick={() => {
                          setNewNoteTitle(selectedNote.name);
                          setNewNoteCategory(selectedNote.category);
                          setNewNoteContent(selectedNote.content);
                          setNewNoteIsPlayerVisible(selectedNote.isPlayerVisible);
                          setIsNoteEditorOpen(true);
                        }}
                        className="p-1.5 bg-surface-50 hover:bg-surface-hover text-slate-300 rounded border border-surface-border transition-colors"
                        title="Edit note"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteNote(selectedNote.id)}
                        className="p-1.5 bg-surface-50 hover:bg-red-950 text-slate-400 hover:text-red-400 rounded border border-surface-border transition-colors"
                        title="Delete note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="text-xs leading-relaxed text-slate-300 whitespace-pre-wrap font-sans select-text">
                    {selectedNote.content}
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                  Select a note or create a new one.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Player Editor Modal */}
      {isPlayerEditorOpen && (
        <EntityEditorModal
          type="player"
          initialData={editingPlayer}
          onClose={() => setIsPlayerEditorOpen(false)}
          onSave={(p) => savePlayer(p)}
        />
      )}

      {/* Note Editor Modal */}
      {isNoteEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#121720] border border-surface-border rounded-xl shadow-2xl w-full max-w-xl p-5 space-y-4">
            <h3 className="font-serif text-lg font-bold text-slate-100">
              {selectedNote ? 'Edit Campaign Note' : 'Create Campaign Note'}
            </h3>
            <form onSubmit={handleSaveNote} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Note Title</label>
                  <input
                    type="text"
                    required
                    value={newNoteTitle}
                    onChange={(e) => setNewNoteTitle(e.target.value)}
                    placeholder="e.g. Session 2 Recap"
                    className="w-full bg-surface-100 border border-surface-border rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:border-amber-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Category</label>
                  <select
                    value={newNoteCategory}
                    onChange={(e) => setNewNoteCategory(e.target.value)}
                    className="w-full bg-surface-100 border border-surface-border rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:border-amber-500"
                  >
                    {['Session', 'Lore', 'NPC', 'Location', 'Quest', 'Handout', 'Image', 'Map'].map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="notePlayerVisible"
                  checked={newNoteIsPlayerVisible}
                  onChange={(e) => setNewNoteIsPlayerVisible(e.target.checked)}
                  className="w-4 h-4 rounded border-surface-border text-amber-500 bg-surface-100"
                />
                <label htmlFor="notePlayerVisible" className="text-xs text-slate-300 cursor-pointer">
                  Visible to Players (Handout)
                </label>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Note Content (Markdown)</label>
                <textarea
                  rows={8}
                  required
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  placeholder="Write campaign notes, lore, or secrets here..."
                  className="w-full bg-surface-100 border border-surface-border rounded-lg p-2.5 text-xs text-slate-100 focus:border-amber-500 font-mono leading-relaxed"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2 border-t border-surface-border">
                <button
                  type="button"
                  onClick={() => setIsNoteEditorOpen(false)}
                  className="px-4 py-2 rounded-lg bg-surface-100 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs"
                >
                  Save Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Campaign Settings & Creation Modal */}
      {isCampaignModalOpen && (
        <NewCampaignModal
          initialData={editingCampaign}
          onClose={() => setIsCampaignModalOpen(false)}
          onSave={handleSaveCampaign}
        />
      )}
    </div>
  );
};
