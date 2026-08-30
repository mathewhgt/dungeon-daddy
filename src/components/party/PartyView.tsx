import React, { useState } from 'react';
import { 
  Users, 
  Shield, 
  Heart, 
  Eye, 
  Plus, 
  Edit3, 
  Trash2, 
  Sparkles, 
  Moon, 
  Sun, 
  Dices, 
  Footprints, 
  Skull,
  CheckCircle2,
  Printer,
  ChevronRight,
  Search,
  BookOpen
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PlayerEntity } from '../../types/player';
import { EntityEditorModal } from '../compendium/EntityEditorModal';
import { TokenAvatar } from '../common/TokenAvatar';
import { CharacterSheetView } from './CharacterSheetView';
import { CharacterPrintModal } from './CharacterPrintModal';

export const PartyView: React.FC = () => {
  const { 
    db, 
    activeCampaignId, 
    savePlayer, 
    deletePlayer, 
    playerRest, 
    rollCustomFormula,
    setActiveTab,
    showToast 
  } = useApp();

  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'campaign'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<PlayerEntity | null>(null);
  const [printingPlayer, setPrintingPlayer] = useState<PlayerEntity | null>(null);

  const campaign = db.campaigns.find((c) => c.id === activeCampaignId) || db.campaigns[0];
  
  const party = db.players.filter((p) => {
    const matchSearch = !searchQuery || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.characterClass.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.race.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.playerName && p.playerName.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchSearch) return false;

    if (filterMode === 'all') return true;
    if (!campaign) return true;
    const isExplicitlyInCampaign = campaign.playerCharacterIds && campaign.playerCharacterIds.includes(p.id);
    const isPlayerLinkedToCampaign = p.campaignId === campaign.id;
    return isExplicitlyInCampaign || isPlayerLinkedToCampaign;
  });

  const selectedPlayer = db.players.find((p) => p.id === selectedPlayerId) || null;

  const avgLevel = party.length > 0
    ? (party.reduce((acc, p) => acc + p.level, 0) / party.length).toFixed(1)
    : '0';

  const handleAdjustHp = (e: React.MouseEvent, player: PlayerEntity, delta: number) => {
    e.stopPropagation();
    const newCurrent = Math.max(0, Math.min(player.maxHp, player.currentHp + delta));
    savePlayer({
      ...player,
      currentHp: newCurrent,
    });
  };

  // If a character is selected, show the Full Character Sheet View
  if (selectedPlayer) {
    return (
      <CharacterSheetView
        player={selectedPlayer}
        party={party.length > 0 ? party : db.players}
        onSelectPlayer={(id) => setSelectedPlayerId(id)}
        onBackToParty={() => setSelectedPlayerId(null)}
      />
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#090d12] overflow-hidden select-none animate-fadeIn">
      {/* Header Bar */}
      <div className="p-4 bg-surface-100/70 border-b border-surface-border flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center space-x-3 flex-wrap gap-2">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-serif text-xl font-bold text-slate-100 flex items-center space-x-2">
                <Users className="w-5 h-5 text-emerald-400" />
                <span>Party & Player Heroes</span>
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-surface-50 border border-surface-border text-[10px] text-slate-300 font-mono">
                Avg Level: {avgLevel} · {party.length} Heroes
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Active Campaign: <strong className="text-amber-400">{campaign?.name || 'Standard Party'}</strong>
            </p>
          </div>

          {/* Roster Filter Pills */}
          <div className="flex items-center space-x-1 bg-[#0d1117] p-1 rounded-xl border border-surface-border text-xs">
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                filterMode === 'all'
                  ? 'bg-amber-600 text-slate-950 shadow-md font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Heroes ({db.players.length})
            </button>
            {campaign && (
              <button
                type="button"
                onClick={() => setFilterMode('campaign')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  filterMode === 'campaign'
                    ? 'bg-amber-600 text-slate-950 shadow-md font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {campaign.name} Roster
              </button>
            )}
          </div>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center space-x-2 flex-wrap gap-2">
          <div className="relative w-48">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search heroes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-surface-50 border border-surface-border rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('tools')}
            className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-serif font-bold text-xs rounded-lg shadow-md transition-all flex items-center space-x-1.5"
            title="Launch the interactive D&D 2024 Character Creation Wizard"
          >
            <Sparkles className="w-4 h-4" />
            <span>2024 Character Creator</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setEditingPlayer(null);
              setIsEditorOpen(true);
            }}
            className="px-3 py-2 bg-surface-50 hover:bg-surface-hover border border-surface-border text-slate-300 font-semibold text-xs rounded-lg transition-all flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Manual Entry</span>
          </button>
        </div>
      </div>

      {/* Main Party Card Roster (Card-Like Selection View) */}
      <div className="flex-1 overflow-y-auto p-6">
        {party.length === 0 ? (
          <div className="max-w-md mx-auto text-center py-16 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-surface-50 border border-surface-border flex items-center justify-center mx-auto text-slate-500">
              <Users className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif text-lg font-bold text-slate-200">No Heroes Found</h3>
              <p className="text-xs text-slate-400">
                {filterMode === 'campaign'
                  ? `No characters assigned to ${campaign?.name || 'this campaign'}. Switch to "All Heroes" or add one.`
                  : 'Start by creating your first hero character.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('tools')}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all inline-flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch 2024 Character Creator</span>
            </button>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {party.map((p) => {
              const hpPercent = Math.max(0, Math.min(100, Math.round((p.currentHp / p.maxHp) * 100)));

              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedPlayerId(p.id)}
                  className="p-5 rounded-2xl bg-surface-100 border border-surface-border hover:border-amber-500/60 shadow-xl hover:shadow-amber-500/10 space-y-4 cursor-pointer transition-all duration-200 group flex flex-col justify-between relative overflow-hidden"
                >
                  {/* Top Card Info with Avatar */}
                  <div className="space-y-3.5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3.5">
                        <TokenAvatar
                          name={p.name}
                          imageUrl={p.avatarUrl}
                          tokenUrl={p.tokenUrl}
                          type="player"
                          characterClass={p.characterClass}
                          size="xl"
                          allowZoom={false}
                        />

                        <div className="space-y-0.5">
                          <h3 className="font-serif text-lg font-bold text-slate-100 group-hover:text-amber-400 transition-colors flex items-center space-x-1.5">
                            <span>{p.name}</span>
                            {p.currentHp === 0 && (
                              <span className="px-1.5 py-0.5 rounded bg-red-950 text-red-300 border border-red-800 text-[9px] font-bold">
                                0 HP
                              </span>
                            )}
                          </h3>
                          <div className="text-xs text-amber-400 font-medium">
                            Level {p.level} {p.race} {p.characterClass}
                          </div>
                          {p.playerName && (
                            <div className="text-[11px] text-slate-400">
                              Player: <span className="text-slate-300">{p.playerName}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Open Full Sheet Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPlayerId(p.id);
                        }}
                        className="p-2 rounded-lg bg-surface-50 hover:bg-amber-500 text-slate-400 hover:text-slate-950 border border-surface-border transition-all shadow-sm"
                        title="Open Full Character Sheet"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Vitals Badges */}
                    <div className="grid grid-cols-4 gap-2 text-center text-xs">
                      <div className="bg-surface-50 p-2 rounded-lg border border-surface-border">
                        <div className="text-[9px] text-slate-400 uppercase font-bold">AC</div>
                        <div className="font-bold text-slate-100 font-mono text-sm">{p.armorClass}</div>
                      </div>

                      <div className="bg-surface-50 p-2 rounded-lg border border-surface-border">
                        <div className="text-[9px] text-slate-400 uppercase font-bold">Init</div>
                        <div className="font-bold text-amber-400 font-mono text-sm">
                          {p.initiativeBonus >= 0 ? `+${p.initiativeBonus}` : p.initiativeBonus}
                        </div>
                      </div>

                      <div className="bg-surface-50 p-2 rounded-lg border border-surface-border">
                        <div className="text-[9px] text-slate-400 uppercase font-bold">Speed</div>
                        <div className="font-bold text-slate-100 font-mono text-xs">{p.speed || '30 ft'}</div>
                      </div>

                      <div className="bg-surface-50 p-2 rounded-lg border border-surface-border">
                        <div className="text-[9px] text-slate-400 uppercase font-bold">Passive</div>
                        <div className="font-bold text-indigo-300 font-mono text-sm">
                          {p.passivePerception || 10}
                        </div>
                      </div>
                    </div>

                    {/* Hit Points Bar & Quick Modifiers */}
                    <div className="p-3 rounded-xl bg-surface-50 border border-surface-border space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-1.5">
                          <Heart className="w-3.5 h-3.5 text-red-400" />
                          <span className="font-semibold text-slate-200">
                            HP: <strong className="font-mono">{p.currentHp} / {p.maxHp}</strong>
                          </span>
                        </div>

                        <div className="flex items-center space-x-1 font-mono text-xs">
                          <button
                            type="button"
                            onClick={(e) => handleAdjustHp(e, p, -1)}
                            className="px-1.5 py-0.5 rounded bg-surface-100 hover:bg-red-950 text-red-300 border border-surface-border font-bold"
                            title="Take 1 damage"
                          >
                            -1
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleAdjustHp(e, p, 1)}
                            className="px-1.5 py-0.5 rounded bg-surface-100 hover:bg-emerald-950 text-emerald-300 border border-surface-border font-bold"
                            title="Heal 1 HP"
                          >
                            +1
                          </button>
                        </div>
                      </div>

                      <div className="w-full h-2 rounded-full bg-surface-100 overflow-hidden border border-surface-border/50">
                        <div
                          className={`h-full transition-all duration-300 ${
                            hpPercent > 50 ? 'bg-emerald-500' : hpPercent > 20 ? 'bg-amber-500' : 'bg-red-600'
                          }`}
                          style={{ width: `${hpPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Abilities Preview Strip */}
                    <div className="grid grid-cols-6 gap-1 text-center font-mono">
                      {[
                        { k: 'STR', v: p.abilities.str },
                        { k: 'DEX', v: p.abilities.dex },
                        { k: 'CON', v: p.abilities.con },
                        { k: 'INT', v: p.abilities.int },
                        { k: 'WIS', v: p.abilities.wis },
                        { k: 'CHA', v: p.abilities.cha },
                      ].map((ab) => {
                        const m = Math.floor((ab.v - 10) / 2);
                        return (
                          <div key={ab.k} className="p-1 rounded bg-surface-50/70 border border-surface-border">
                            <div className="text-[8px] text-slate-500 font-bold">{ab.k}</div>
                            <div className="text-[10px] text-slate-200 font-bold">{ab.v}</div>
                            <div className="text-[9px] text-amber-400">{m >= 0 ? `+${m}` : m}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="pt-3 border-t border-surface-border flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPlayerId(p.id);
                      }}
                      className="text-amber-400 hover:text-amber-300 font-serif font-bold text-xs flex items-center space-x-1"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Full Sheet</span>
                    </button>

                    <div className="flex items-center space-x-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPrintingPlayer(p);
                        }}
                        className="p-1.5 rounded-lg bg-surface-50 hover:bg-surface-hover text-slate-300 hover:text-white border border-surface-border transition-colors"
                        title="Print Character Sheet to PDF"
                      >
                        <Printer className="w-3.5 h-3.5 text-amber-400" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          playerRest(p.id, 'short');
                        }}
                        className="p-1.5 rounded-lg bg-surface-50 hover:bg-surface-hover text-slate-300 hover:text-white border border-surface-border transition-colors"
                        title="Take Short Rest"
                      >
                        <Sun className="w-3.5 h-3.5 text-amber-400" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          playerRest(p.id, 'long');
                        }}
                        className="p-1.5 rounded-lg bg-surface-50 hover:bg-surface-hover text-slate-300 hover:text-white border border-surface-border transition-colors"
                        title="Take Long Rest"
                      >
                        <Moon className="w-3.5 h-3.5 text-indigo-400" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingPlayer(p);
                          setIsEditorOpen(true);
                        }}
                        className="p-1.5 rounded-lg bg-surface-50 hover:bg-surface-hover text-slate-300 hover:text-white border border-surface-border transition-colors"
                        title="Edit Character"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`Delete ${p.name}?`)) {
                            deletePlayer(p.id);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-surface-50 hover:bg-red-950 text-slate-400 hover:text-red-400 border border-surface-border transition-colors"
                        title="Delete Character"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Hero Character Editor Modal */}
      {isEditorOpen && (
        <EntityEditorModal
          type="player"
          initialData={editingPlayer}
          onClose={() => setIsEditorOpen(false)}
          onSave={(playerData) => savePlayer(playerData)}
        />
      )}

      {/* Print to PDF Modal */}
      {printingPlayer && (
        <CharacterPrintModal
          player={printingPlayer}
          onClose={() => setPrintingPlayer(null)}
        />
      )}
    </div>
  );
};
