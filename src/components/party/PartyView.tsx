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
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PlayerEntity } from '../../types/player';
import { EntityEditorModal } from '../compendium/EntityEditorModal';
import { TokenAvatar } from '../common/TokenAvatar';

export const PartyView: React.FC = () => {
  const { 
    db, 
    activeCampaignId, 
    savePlayer, 
    deletePlayer, 
    playerRest, 
    rollCustomFormula,
    saveCampaign,
    setActiveTab,
    showToast 
  } = useApp();

  const [filterMode, setFilterMode] = useState<'all' | 'campaign'>('all');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<PlayerEntity | null>(null);

  const campaign = db.campaigns.find((c) => c.id === activeCampaignId) || db.campaigns[0];
  
  const party = db.players.filter((p) => {
    if (filterMode === 'all') return true;
    if (!campaign) return true;
    const isExplicitlyInCampaign = campaign.playerCharacterIds && campaign.playerCharacterIds.includes(p.id);
    const isPlayerLinkedToCampaign = p.campaignId === campaign.id;
    return isExplicitlyInCampaign || isPlayerLinkedToCampaign;
  });

  const avgLevel = party.length > 0
    ? (party.reduce((acc, p) => acc + p.level, 0) / party.length).toFixed(1)
    : '0';

  const handleRollAbility = (player: PlayerEntity, statName: string, val: number) => {
    const mod = Math.floor((val - 10) / 2);
    const formula = `1d20${mod >= 0 ? `+${mod}` : `${mod}`}`;
    rollCustomFormula(formula, undefined, `${player.name} (${statName} check)`);
  };

  const handleToggleSpellSlot = (player: PlayerEntity, slotLevel: number, slotIdx: number) => {
    const updatedSlots = (player.spellSlots || []).map((slot) => {
      if (slot.level === slotLevel) {
        const isCurrentlyUsed = slotIdx < slot.used;
        const newUsed = isCurrentlyUsed ? slot.used - 1 : slot.used + 1;
        return { ...slot, used: Math.max(0, Math.min(slot.total, newUsed)) };
      }
      return slot;
    });

    savePlayer({
      ...player,
      spellSlots: updatedSlots,
    });
  };

  const handleAdjustHp = (player: PlayerEntity, delta: number) => {
    const newCurrent = Math.max(0, Math.min(player.maxHp, player.currentHp + delta));
    savePlayer({
      ...player,
      currentHp: newCurrent,
    });
  };

  return (
    <div className="h-full flex flex-col bg-[#090d12] overflow-hidden select-none">
      {/* Header Bar */}
      <div className="p-4 bg-surface-100/60 border-b border-surface-border flex items-center justify-between flex-wrap gap-3">
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

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('tools')}
            className="px-3.5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-serif font-bold text-xs rounded-lg shadow-md transition-all flex items-center space-x-1.5"
            title="Launch the interactive D&D 2024 Character Creation Wizard"
          >
            <Sparkles className="w-4 h-4" />
            <span>2024 Character Creator</span>
          </button>

          <button
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

      {/* Main Party Roster */}
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
              onClick={() => setActiveTab('tools')}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all inline-flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch 2024 Character Creator</span>
            </button>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-5">
            {party.map((p) => {
              const hpPercent = Math.max(0, Math.min(100, Math.round((p.currentHp / p.maxHp) * 100)));

            return (
              <div
                key={p.id}
                className="p-5 rounded-xl bg-surface-100 border border-surface-border shadow-xl space-y-4 relative group"
              >
                {/* Top Info with Character Token Avatar */}
                <div className="flex items-start justify-between border-b border-surface-border pb-3">
                  <div className="flex items-start space-x-3.5">
                    <TokenAvatar
                      name={p.name}
                      imageUrl={p.avatarUrl}
                      tokenUrl={p.tokenUrl}
                      type="player"
                      characterClass={p.characterClass}
                      size="xl"
                      allowZoom={true}
                    />

                    <div>
                      <h3 className="font-serif text-lg font-bold text-slate-100 flex items-center space-x-2">
                        <span>{p.name}</span>
                        {p.currentHp === 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-red-950 text-red-300 border border-red-800 text-[10px] font-bold flex items-center space-x-0.5">
                            <Skull className="w-3 h-3" />
                            <span>UNCONSCIOUS</span>
                          </span>
                        )}
                      </h3>
                      <div className="text-xs text-emerald-400 font-medium mt-0.5 flex items-center space-x-1.5 flex-wrap">
                        <span>Level {p.level} {p.race} {p.characterClass}</span>
                        {p.background && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[9px] font-mono">
                            {p.background}
                          </span>
                        )}
                        {p.originFeat && (
                          <span className="px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30 text-[9px] font-mono">
                            {p.originFeat}
                          </span>
                        )}
                      </div>
                      {p.playerName && (
                        <div className="text-[11px] text-slate-400">Player: {p.playerName}</div>
                      )}
                    </div>
                  </div>

                  {/* Rest & Edit Actions */}
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => playerRest(p.id, 'short')}
                      className="px-2.5 py-1 rounded bg-surface-50 hover:bg-surface-hover border border-surface-border text-slate-300 text-[11px] font-semibold flex items-center space-x-1 transition-colors"
                      title="Take Short Rest"
                    >
                      <Sun className="w-3.5 h-3.5 text-amber-400" />
                      <span>Short Rest</span>
                    </button>

                    <button
                      onClick={() => playerRest(p.id, 'long')}
                      className="px-2.5 py-1 rounded bg-surface-50 hover:bg-surface-hover border border-surface-border text-slate-300 text-[11px] font-semibold flex items-center space-x-1 transition-colors"
                      title="Take Long Rest (Restore full HP & Spell Slots)"
                    >
                      <Moon className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Long Rest</span>
                    </button>

                    <button
                      onClick={() => {
                        setEditingPlayer(p);
                        setIsEditorOpen(true);
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

                {/* Vitals Grid */}
                <div className="grid grid-cols-4 gap-2 text-xs">
                  <div className="flex items-center space-x-2 bg-surface-50 p-2.5 rounded-lg border border-surface-border">
                    <Shield className="w-4 h-4 text-blue-400 shrink-0" />
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Armor Class</div>
                      <div className="font-bold text-slate-100 font-mono text-sm">{p.armorClass}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 bg-surface-50 p-2.5 rounded-lg border border-surface-border">
                    <Footprints className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Speed</div>
                      <div className="font-bold text-slate-100 text-xs">{p.speed}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 bg-surface-50 p-2.5 rounded-lg border border-surface-border">
                    <Dices className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Initiative</div>
                      <div className="font-bold text-slate-100 font-mono text-sm">
                        {p.initiativeBonus >= 0 ? `+${p.initiativeBonus}` : p.initiativeBonus}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 bg-surface-50 p-2.5 rounded-lg border border-surface-border">
                    <Eye className="w-4 h-4 text-indigo-400 shrink-0" />
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Passive Perc.</div>
                      <div className="font-bold text-slate-100 font-mono text-sm">{p.passivePerception}</div>
                    </div>
                  </div>
                </div>

                {/* Hit Points Bar & Quick Modifiers */}
                <div className="p-3 rounded-lg bg-surface-50 border border-surface-border space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <Heart className="w-4 h-4 text-red-400" />
                      <span className="font-semibold text-slate-200">
                        Hit Points: <strong className="font-mono">{p.currentHp} / {p.maxHp}</strong>
                      </span>
                    </div>

                    <div className="flex items-center space-x-1 font-mono text-xs">
                      <button
                        onClick={() => handleAdjustHp(p, -5)}
                        className="px-1.5 py-0.5 rounded bg-surface-100 hover:bg-red-950 text-red-300 border border-surface-border"
                        title="Take 5 damage"
                      >
                        -5
                      </button>
                      <button
                        onClick={() => handleAdjustHp(p, -1)}
                        className="px-1.5 py-0.5 rounded bg-surface-100 hover:bg-red-950 text-red-300 border border-surface-border"
                        title="Take 1 damage"
                      >
                        -1
                      </button>
                      <button
                        onClick={() => handleAdjustHp(p, 1)}
                        className="px-1.5 py-0.5 rounded bg-surface-100 hover:bg-emerald-950 text-emerald-300 border border-surface-border"
                        title="Heal 1 HP"
                      >
                        +1
                      </button>
                      <button
                        onClick={() => handleAdjustHp(p, 5)}
                        className="px-1.5 py-0.5 rounded bg-surface-100 hover:bg-emerald-950 text-emerald-300 border border-surface-border"
                        title="Heal 5 HP"
                      >
                        +5
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

                {/* Ability Scores Grid (Clickable to roll!) */}
                <div className="grid grid-cols-6 gap-1.5 text-center">
                  {[
                    { label: 'STR', val: p.abilities.str },
                    { label: 'DEX', val: p.abilities.dex },
                    { label: 'CON', val: p.abilities.con },
                    { label: 'INT', val: p.abilities.int },
                    { label: 'WIS', val: p.abilities.wis },
                    { label: 'CHA', val: p.abilities.cha },
                  ].map((ab) => {
                    const mod = Math.floor((ab.val - 10) / 2);
                    return (
                      <button
                        key={ab.label}
                        onClick={() => handleRollAbility(p, ab.label, ab.val)}
                        className="p-2 rounded-lg bg-surface-50 hover:bg-amber-500/15 border border-surface-border hover:border-amber-500/50 transition-all flex flex-col items-center group"
                        title={`Click to roll ${ab.label} check (1d20 ${mod >= 0 ? `+${mod}` : `${mod}`})`}
                      >
                        <span className="text-[10px] font-bold text-slate-400 group-hover:text-amber-400">{ab.label}</span>
                        <span className="font-mono font-bold text-slate-100 text-xs">{ab.val}</span>
                        <span className="font-mono text-[10px] text-amber-500 font-bold">{mod >= 0 ? `+${mod}` : mod}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Spell Slots Tracker */}
                {p.spellSlots && p.spellSlots.length > 0 && (
                  <div className="p-3 rounded-lg bg-surface-50 border border-surface-border space-y-2">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                      <span>Spell Slots Tracker</span>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {p.spellSlots.map((slot) => (
                        <div key={slot.level} className="flex items-center space-x-1.5 text-xs">
                          <span className="text-slate-400 font-mono text-[11px]">Lvl {slot.level}:</span>
                          <div className="flex space-x-1">
                            {Array.from({ length: slot.total }).map((_, slotIdx) => {
                              const isUsed = slotIdx < slot.used;
                              return (
                                <button
                                  key={slotIdx}
                                  onClick={() => handleToggleSpellSlot(p, slot.level, slotIdx)}
                                  className={`w-4 h-4 rounded border transition-all ${
                                    isUsed
                                      ? 'bg-surface-100 border-surface-border text-transparent'
                                      : 'bg-purple-600 border-purple-400 text-purple-200 shadow-sm shadow-purple-500/40'
                                  }`}
                                  title={isUsed ? 'Expended slot (Click to restore)' : 'Available slot (Click to expend)'}
                                />
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes / Equipment */}
                {p.notes && (
                  <div className="text-[11px] text-slate-400 italic bg-surface-50/50 p-2.5 rounded-lg border border-surface-border line-clamp-2">
                    {p.notes}
                  </div>
                )}
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
    </div>
  );
};
