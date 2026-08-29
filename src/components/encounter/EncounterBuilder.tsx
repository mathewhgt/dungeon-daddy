import React, { useState, useMemo } from 'react';
import { 
  Swords, 
  Plus, 
  Trash2, 
  Sparkles, 
  ShieldAlert, 
  Skull, 
  CheckCircle2, 
  Search, 
  Flame,
  Play,
  Edit3
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { EncounterEntity, EncounterMonsterSlot } from '../../types/encounter';
import { calculateEncounterBudget } from '../../services/encounterService';

export const EncounterBuilder: React.FC = () => {
  const { 
    db, 
    activeCampaignId, 
    saveEncounter, 
    deleteEncounter, 
    startCombatFromEncounter,
    showToast 
  } = useApp();

  const [selectedEncounter, setSelectedEncounter] = useState<EncounterEntity | null>(
    db.encounters[0] || null
  );

  // Encounter Builder State
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPartyIds, setSelectedPartyIds] = useState<string[]>([]);
  const [monsterSlots, setMonsterSlots] = useState<EncounterMonsterSlot[]>([]);
  const [monsterSearch, setMonsterSearch] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Calculate difficulty in real time
  const partyLevels = useMemo(() => {
    return db.players
      .filter((p) => selectedPartyIds.includes(p.id))
      .map((p) => p.level);
  }, [db.players, selectedPartyIds]);

  const monstersForBudget = useMemo(() => {
    return monsterSlots.map((slot) => {
      const m = db.monsters.find((mon) => mon.id === slot.monsterId);
      return {
        xp: m?.experiencePoints || 100,
        count: slot.count,
      };
    });
  }, [db.monsters, monsterSlots]);

  const budget = useMemo(() => {
    return calculateEncounterBudget(partyLevels, monstersForBudget);
  }, [partyLevels, monstersForBudget]);

  const handleStartCreate = () => {
    setIsEditing(true);
    setSelectedEncounter(null);
    setName('New Encounter');
    setLocation('');
    setDescription('');
    setSelectedPartyIds(db.players.map((p) => p.id));
    setMonsterSlots([]);
  };

  const handleEditEncounter = (enc: EncounterEntity) => {
    setSelectedEncounter(enc);
    setIsEditing(true);
    setName(enc.name);
    setLocation(enc.location || '');
    setDescription(enc.description || '');
    setSelectedPartyIds(enc.partyPlayerIds);
    setMonsterSlots([...enc.monsters]);
  };

  const handleAddMonster = (monsterId: string) => {
    setMonsterSlots((prev) => {
      const idx = prev.findIndex((s) => s.monsterId === monsterId);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], count: updated[idx].count + 1 };
        return updated;
      }
      return [...prev, { monsterId, count: 1 }];
    });
  };

  const handleRemoveMonster = (monsterId: string) => {
    setMonsterSlots((prev) => prev.filter((s) => s.monsterId !== monsterId));
  };

  const handleUpdateMonsterCount = (monsterId: string, delta: number) => {
    setMonsterSlots((prev) => {
      return prev
        .map((s) => {
          if (s.monsterId === monsterId) {
            const newCount = s.count + delta;
            return newCount > 0 ? { ...s, count: newCount } : null;
          }
          return s;
        })
        .filter(Boolean) as EncounterMonsterSlot[];
    });
  };

  const handleSaveEncounter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const encounter: EncounterEntity = {
      id: selectedEncounter?.id || `enc-${Date.now()}`,
      type: 'encounter',
      campaignId: activeCampaignId || undefined,
      name,
      location,
      description,
      partyPlayerIds: selectedPartyIds,
      monsters: monsterSlots,
      difficulty: budget.difficulty,
      totalXp: budget.totalRawXp,
      adjustedXp: budget.adjustedXp,
      createdAt: selectedEncounter?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveEncounter(encounter);
    setSelectedEncounter(encounter);
    setIsEditing(false);
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Trivial':
        return 'text-slate-400 bg-slate-900 border-slate-700';
      case 'Easy':
        return 'text-emerald-400 bg-emerald-950/80 border-emerald-700';
      case 'Medium':
        return 'text-blue-400 bg-blue-950/80 border-blue-700';
      case 'Hard':
        return 'text-amber-400 bg-amber-950/80 border-amber-700';
      case 'Deadly':
        return 'text-red-400 bg-red-950/80 border-red-700 font-black animate-pulse';
      default:
        return 'text-slate-400 bg-slate-900 border-slate-700';
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#090d12] overflow-hidden select-none">
      {/* Top Header */}
      <div className="p-4 bg-surface-100/60 border-b border-surface-border flex items-center justify-between">
        <div>
          <h1 className="font-serif text-xl font-bold text-slate-100 flex items-center space-x-2">
            <Swords className="w-5 h-5 text-amber-500" />
            <span>Encounters & Difficulty Budget</span>
          </h1>
          <p className="text-xs text-slate-400">Plan and balance tactical combat encounters for your party.</p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleStartCreate}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-lg shadow-sm transition-all flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>New Encounter</span>
          </button>
        </div>
      </div>

      {/* Main Content Two-Pane Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Saved Encounters List */}
        <div className="w-80 border-r border-surface-border bg-[#0d1117] p-3 space-y-2 overflow-y-auto shrink-0">
          <div className="text-[11px] font-bold uppercase text-slate-400 tracking-wider mb-2">
            Saved Encounters ({db.encounters.length})
          </div>

          {db.encounters.map((enc) => {
            const isSelected = selectedEncounter?.id === enc.id && !isEditing;
            return (
              <div
                key={enc.id}
                onClick={() => {
                  setSelectedEncounter(enc);
                  setIsEditing(false);
                }}
                className={`p-3 rounded-lg border cursor-pointer transition-all space-y-2 ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-500/50 shadow-sm'
                    : 'bg-surface-100 border-surface-border hover:bg-surface-hover'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-serif text-xs font-bold text-slate-100">{enc.name}</h3>
                    {enc.location && (
                      <div className="text-[10px] text-slate-400">{enc.location}</div>
                    )}
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getDifficultyColor(enc.difficulty || 'Medium')}`}>
                    {enc.difficulty || 'Medium'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>{enc.monsters.reduce((acc, m) => acc + m.count, 0)} Monsters</span>
                  <span>{enc.adjustedXp ? `${enc.adjustedXp.toLocaleString()} XP` : ''}</span>
                </div>

                <div className="pt-1 flex items-center justify-between border-t border-surface-border">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startCombatFromEncounter(enc);
                    }}
                    className="px-2.5 py-1 rounded bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center space-x-1 transition-colors shadow-sm"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Run Combat</span>
                  </button>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditEncounter(enc);
                      }}
                      className="p-1 text-slate-400 hover:text-white rounded hover:bg-surface-hover transition-colors"
                      title="Edit encounter"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteEncounter(enc.id);
                        if (selectedEncounter?.id === enc.id) setSelectedEncounter(null);
                      }}
                      className="p-1 text-slate-400 hover:text-red-400 rounded hover:bg-surface-hover transition-colors"
                      title="Delete encounter"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Encounter Details & Live Budget Builder */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#090d12]">
          {isEditing ? (
            /* Builder Form */
            <form onSubmit={handleSaveEncounter} className="max-w-4xl mx-auto space-y-6">
              <div className="flex items-center justify-between border-b border-surface-border pb-3">
                <h2 className="font-serif text-lg font-bold text-amber-400">
                  {selectedEncounter ? 'Edit Encounter' : 'Create New Encounter'}
                </h2>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-1.5 rounded-lg bg-surface-100 text-slate-300 text-xs font-semibold hover:bg-surface-hover"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow-md"
                  >
                    Save Encounter
                  </button>
                </div>
              </div>

              {/* Title & Location */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Encounter Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-surface-100 border border-surface-border rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-amber-500"
                    placeholder="e.g. Bandit Roadblock"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Location / Map</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-surface-100 border border-surface-border rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-amber-500"
                    placeholder="e.g. Whispering Woods"
                  />
                </div>
              </div>

              {/* Real-time XP & Difficulty Budget HUD */}
              <div className="p-4 rounded-xl bg-surface-100 border border-surface-border space-y-3 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-serif text-sm font-bold text-slate-200">Difficulty Budget:</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getDifficultyColor(budget.difficulty)}`}>
                      {budget.difficulty.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    Total Raw XP: <strong className="text-slate-200">{budget.totalRawXp.toLocaleString()}</strong> · Adjusted XP ({budget.multiplier}x): <strong className="text-amber-400">{budget.adjustedXp.toLocaleString()}</strong>
                  </div>
                </div>

                {/* Thresholds Bar */}
                <div className="grid grid-cols-4 gap-2 text-xs text-center">
                  <div className="p-2 rounded bg-surface-50 border border-surface-border">
                    <div className="text-[10px] text-emerald-400 font-semibold uppercase">Easy</div>
                    <div className="font-mono font-bold text-slate-200">{budget.thresholds.easy.toLocaleString()} XP</div>
                  </div>
                  <div className="p-2 rounded bg-surface-50 border border-surface-border">
                    <div className="text-[10px] text-blue-400 font-semibold uppercase">Medium</div>
                    <div className="font-mono font-bold text-slate-200">{budget.thresholds.medium.toLocaleString()} XP</div>
                  </div>
                  <div className="p-2 rounded bg-surface-50 border border-surface-border">
                    <div className="text-[10px] text-amber-400 font-semibold uppercase">Hard</div>
                    <div className="font-mono font-bold text-slate-200">{budget.thresholds.hard.toLocaleString()} XP</div>
                  </div>
                  <div className="p-2 rounded bg-surface-50 border border-surface-border">
                    <div className="text-[10px] text-red-400 font-semibold uppercase">Deadly</div>
                    <div className="font-mono font-bold text-slate-200">{budget.thresholds.deadly.toLocaleString()} XP</div>
                  </div>
                </div>
              </div>

              {/* Party Selection */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">
                  Participating Heroes ({selectedPartyIds.length} active)
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {db.players.map((p) => {
                    const isChecked = selectedPartyIds.includes(p.id);
                    return (
                      <button
                        type="button"
                        key={p.id}
                        onClick={() => {
                          if (isChecked) {
                            setSelectedPartyIds(selectedPartyIds.filter((id) => id !== p.id));
                          } else {
                            setSelectedPartyIds([...selectedPartyIds, p.id]);
                          }
                        }}
                        className={`p-2 rounded-lg border text-left text-xs transition-all ${
                          isChecked
                            ? 'bg-emerald-950/60 border-emerald-600 text-emerald-200'
                            : 'bg-surface-100 border-surface-border text-slate-400'
                        }`}
                      >
                        <div className="font-bold font-serif">{p.name}</div>
                        <div className="text-[10px]">Level {p.level} {p.characterClass.split(' ')[0]}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Monster Slots in Encounter */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-slate-300">
                  Monsters in Encounter ({monsterSlots.reduce((a, b) => a + b.count, 0)} creatures)
                </label>

                {monsterSlots.length === 0 ? (
                  <div className="p-4 rounded-lg bg-surface-100/50 border border-dashed border-surface-border text-center text-xs text-slate-500">
                    No monsters added yet. Click monsters below to add them to this encounter!
                  </div>
                ) : (
                  <div className="space-y-2">
                    {monsterSlots.map((slot) => {
                      const m = db.monsters.find((mon) => mon.id === slot.monsterId);
                      if (!m) return null;

                      return (
                        <div
                          key={slot.monsterId}
                          className="p-3 rounded-lg bg-surface-100 border border-surface-border flex items-center justify-between"
                        >
                          <div>
                            <div className="font-bold text-xs text-slate-100 font-serif">{m.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              CR {m.challengeRating} · {m.experiencePoints} XP each · {m.hitPoints} HP · AC {m.armorClass}
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-1 bg-surface-50 border border-surface-border rounded-lg p-1">
                              <button
                                type="button"
                                onClick={() => handleUpdateMonsterCount(slot.monsterId, -1)}
                                className="w-6 h-6 rounded bg-surface-100 hover:bg-surface-hover text-slate-200 flex items-center justify-center font-bold text-xs"
                              >
                                -
                              </button>
                              <span className="w-8 text-center font-mono font-bold text-xs text-amber-400">
                                {slot.count}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleUpdateMonsterCount(slot.monsterId, 1)}
                                className="w-6 h-6 rounded bg-surface-100 hover:bg-surface-hover text-slate-200 flex items-center justify-center font-bold text-xs"
                              >
                                +
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveMonster(slot.monsterId)}
                              className="p-1.5 text-slate-400 hover:text-red-400 rounded hover:bg-surface-hover"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Monster Compendium Picker */}
              <div className="space-y-3 pt-3 border-t border-surface-border">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">
                    Add Monsters from Library
                  </label>
                  <div className="relative w-64">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                    <input
                      type="text"
                      value={monsterSearch}
                      onChange={(e) => setMonsterSearch(e.target.value)}
                      placeholder="Search monsters..."
                      className="w-full bg-surface-100 border border-surface-border rounded-lg pl-8 pr-2.5 py-1 text-xs text-slate-100 focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
                  {db.monsters
                    .filter((m) => m.name.toLowerCase().includes(monsterSearch.toLowerCase()))
                    .map((m) => (
                      <button
                        type="button"
                        key={m.id}
                        onClick={() => handleAddMonster(m.id)}
                        className="p-2 rounded-lg bg-surface-100 hover:bg-amber-500/20 border border-surface-border hover:border-amber-500/40 text-left transition-all flex items-center justify-between group"
                      >
                        <div>
                          <div className="font-bold text-xs text-slate-200 group-hover:text-amber-300 font-serif">{m.name}</div>
                          <div className="text-[10px] text-slate-400">CR {m.challengeRating} · {m.experiencePoints} XP</div>
                        </div>
                        <Plus className="w-4 h-4 text-amber-500 shrink-0" />
                      </button>
                    ))}
                </div>
              </div>
            </form>
          ) : selectedEncounter ? (
            /* Encounter Inspector View */
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="flex items-start justify-between border-b border-surface-border pb-4">
                <div>
                  <div className="flex items-center space-x-3">
                    <h2 className="font-serif text-2xl font-bold text-slate-100">{selectedEncounter.name}</h2>
                    <span className={`px-2.5 py-0.5 rounded text-xs font-bold border ${getDifficultyColor(selectedEncounter.difficulty || 'Medium')}`}>
                      {selectedEncounter.difficulty || 'Medium'}
                    </span>
                  </div>
                  {selectedEncounter.location && (
                    <div className="text-xs text-slate-400 mt-1">Location: {selectedEncounter.location}</div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => startCombatFromEncounter(selectedEncounter)}
                    className="px-4 py-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-xs rounded-lg shadow-lg flex items-center space-x-1.5 transition-all animate-pulse"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Start Combat</span>
                  </button>
                  <button
                    onClick={() => handleEditEncounter(selectedEncounter)}
                    className="p-2 bg-surface-100 hover:bg-surface-hover text-slate-300 rounded-lg border border-surface-border"
                    title="Edit encounter"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Monster roster */}
              <div className="space-y-3">
                <h3 className="font-serif text-sm font-bold text-amber-400 uppercase tracking-wider">
                  Enemy Roster ({selectedEncounter.monsters.reduce((a, b) => a + b.count, 0)} Total)
                </h3>
                <div className="space-y-2">
                  {selectedEncounter.monsters.map((slot) => {
                    const m = db.monsters.find((mon) => mon.id === slot.monsterId);
                    if (!m) return null;
                    return (
                      <div
                        key={slot.monsterId}
                        className="p-3 rounded-lg bg-surface-100 border border-surface-border flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center font-bold text-xs font-mono">
                            x{slot.count}
                          </span>
                          <div>
                            <div className="font-bold text-sm text-slate-100 font-serif">{m.name}</div>
                            <div className="text-xs text-slate-400 font-mono">
                              CR {m.challengeRating} · {m.hitPoints} HP · AC {m.armorClass}
                            </div>
                          </div>
                        </div>

                        <div className="text-right text-xs text-slate-400 font-mono">
                          <div>{m.experiencePoints * slot.count} XP</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Description & Notes */}
              {selectedEncounter.description && (
                <div className="p-4 rounded-xl bg-surface-100 border border-surface-border space-y-1">
                  <div className="text-xs font-bold text-slate-300 font-serif">Encounter Description</div>
                  <div className="text-xs text-slate-400 leading-relaxed whitespace-pre-wrap">
                    {selectedEncounter.description}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500 text-xs">
              Select an encounter from the left or create a new one.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
