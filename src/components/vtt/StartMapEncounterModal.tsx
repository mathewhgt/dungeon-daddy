import React, { useState } from 'react';
import { X, Swords, Dices, Users, ShieldAlert, Check, Sparkles } from 'lucide-react';
import { MapToken } from '../../types/map';
import { useApp } from '../../context/AppContext';
import { TokenAvatar } from '../common/TokenAvatar';

interface StartMapEncounterModalProps {
  tokens: MapToken[];
  onClose: () => void;
  onStartCombat: (initiatives: { tokenId: string; initiative: number }[]) => void;
}

export const StartMapEncounterModal: React.FC<StartMapEncounterModalProps> = ({
  tokens,
  onClose,
  onStartCombat,
}) => {
  const { db } = useApp();

  // Helper to compute Dex modifier for monsters or players
  const getDexModifier = (t: MapToken): number => {
    if (t.isPlayer) {
      const player = db.players.find((p) => p.id === t.entityId);
      if (player) {
        if (player.initiativeBonus !== undefined) return player.initiativeBonus;
        const dex = player.abilities?.dex ?? 10;
        return Math.floor((dex - 10) / 2);
      }
      return 0;
    } else {
      const monster = db.monsters.find((m) => m.id === t.entityId);
      if (monster) {
        const dex = monster.abilities?.dex ?? 10;
        return Math.floor((dex - 10) / 2);
      }
      return 0;
    }
  };

  // Filter out monsters that are hidden from players
  const activeTokens = tokens.filter((t) => t.isPlayer || !t.hiddenFromPlayers);
  const hiddenMonstersCount = tokens.filter((t) => !t.isPlayer && t.hiddenFromPlayers).length;

  // Initialize initiatives:
  // - Monsters default to standard 10 + Dex mod
  // - Players default to 10 + Dex mod or empty
  const [initiatives, setInitiatives] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    for (const t of activeTokens) {
      const dexMod = getDexModifier(t);
      initial[t.id] = 10 + dexMod;
    }
    return initial;
  });

  const handleRollSingle = (t: MapToken) => {
    const dexMod = getDexModifier(t);
    const d20 = Math.floor(Math.random() * 20) + 1;
    setInitiatives((prev) => ({
      ...prev,
      [t.id]: d20 + dexMod,
    }));
  };

  const handleRollAllMonsters = () => {
    const updated = { ...initiatives };
    for (const t of activeTokens.filter((tok) => !tok.isPlayer)) {
      const dexMod = getDexModifier(t);
      const d20 = Math.floor(Math.random() * 20) + 1;
      updated[t.id] = d20 + dexMod;
    }
    setInitiatives(updated);
  };

  const handleAutoRollAllPlayers = () => {
    const updated = { ...initiatives };
    for (const t of activeTokens.filter((tok) => tok.isPlayer)) {
      const dexMod = getDexModifier(t);
      const d20 = Math.floor(Math.random() * 20) + 1;
      updated[t.id] = d20 + dexMod;
    }
    setInitiatives(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const initiativeList = activeTokens.map((t) => ({
      tokenId: t.id,
      initiative: initiatives[t.id] ?? 10,
    }));
    onStartCombat(initiativeList);
    onClose();
  };

  const players = activeTokens.filter((t) => t.isPlayer);
  const monsters = activeTokens.filter((t) => !t.isPlayer);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 select-none">
      <div className="bg-[#121720] border border-surface-border rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col animate-scaleUp">
        {/* Header */}
        <div className="p-4 border-b border-surface-border flex items-center justify-between bg-surface-100/50">
          <div>
            <h3 className="font-serif text-base font-bold text-slate-100 flex items-center space-x-2">
              <Swords className="w-4 h-4 text-red-500" />
              <span>Start Combat Encounter from Battle Map</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Enter player rolled initiatives. Monsters auto-calculate with standard 10 + DEX modifier.
              {hiddenMonstersCount > 0 && (
                <span className="text-amber-400 font-semibold block mt-0.5">
                  ({hiddenMonstersCount} hidden monster{hiddenMonstersCount > 1 ? 's' : ''} excluded from combat)
                </span>
              )}
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="p-5 overflow-y-auto max-h-[65vh] space-y-5">
            {/* Players Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <Users className="w-3.5 h-3.5" />
                  <span>Party Heroes ({players.length})</span>
                </span>
                <button
                  type="button"
                  onClick={handleAutoRollAllPlayers}
                  className="text-[11px] text-slate-400 hover:text-emerald-300 flex items-center space-x-1 font-semibold transition-colors"
                >
                  <Dices className="w-3.5 h-3.5" />
                  <span>Roll All Players (1d20)</span>
                </button>
              </div>

              {players.length === 0 ? (
                <div className="text-xs text-slate-500 italic p-3 bg-surface-50 rounded-xl">
                  No player tokens placed on the map.
                </div>
              ) : (
                <div className="space-y-1.5">
                  {players.map((p) => {
                    const dexMod = getDexModifier(p);

                    return (
                      <div
                        key={p.id}
                        className="p-2.5 rounded-xl bg-surface-100 border border-surface-border flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          <TokenAvatar
                            name={p.name}
                            imageUrl={p.avatarUrl}
                            tokenUrl={p.tokenUrl}
                            type="player"
                            size="sm"
                          />
                          <div>
                            <div className="font-serif font-bold text-xs text-slate-100">{p.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              HP {p.currentHp}/{p.maxHp} · Dex Mod {dexMod >= 0 ? `+${dexMod}` : dexMod}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => handleRollSingle(p)}
                            className="p-1.5 rounded-lg bg-surface-50 hover:bg-surface-hover border border-surface-border text-slate-300 hover:text-emerald-400 transition-colors"
                            title="Roll 1d20 + Bonus"
                          >
                            <Dices className="w-3.5 h-3.5" />
                          </button>
                          <div className="flex items-center space-x-1">
                            <span className="text-[10px] text-slate-400 uppercase font-bold">Init</span>
                            <input
                              type="number"
                              required
                              value={initiatives[p.id] ?? ''}
                              onChange={(e) =>
                                setInitiatives({
                                  ...initiatives,
                                  [p.id]: parseInt(e.target.value, 10) || 0,
                                })
                              }
                              className="w-14 bg-surface-50 border border-surface-border rounded-lg py-1 px-2 text-center text-xs font-bold font-mono text-emerald-300 focus:border-emerald-500"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Monsters Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Monsters & Enemies ({monsters.length})</span>
                </span>
                <button
                  type="button"
                  onClick={handleRollAllMonsters}
                  className="text-[11px] text-slate-400 hover:text-amber-300 flex items-center space-x-1 font-semibold transition-colors"
                >
                  <Dices className="w-3.5 h-3.5" />
                  <span>Roll 1d20 for Monsters</span>
                </button>
              </div>

              {monsters.length === 0 ? (
                <div className="text-xs text-slate-500 italic p-3 bg-surface-50 rounded-xl">
                  No monster tokens placed on the map.
                </div>
              ) : (
                <div className="space-y-1.5">
                  {monsters.map((m) => {
                    const dexMod = getDexModifier(m);

                    return (
                      <div
                        key={m.id}
                        className="p-2.5 rounded-xl bg-surface-100 border border-surface-border flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          <TokenAvatar
                            name={m.name}
                            imageUrl={m.avatarUrl}
                            tokenUrl={m.tokenUrl}
                            type="monster"
                            size="sm"
                          />
                          <div>
                            <div className="font-serif font-bold text-xs text-slate-100">{m.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              HP {m.currentHp}/{m.maxHp} · Standard 10{dexMod >= 0 ? `+${dexMod}` : dexMod} = {10 + dexMod}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => handleRollSingle(m)}
                            className="p-1.5 rounded-lg bg-surface-50 hover:bg-surface-hover border border-surface-border text-slate-300 hover:text-amber-400 transition-colors"
                            title="Re-roll 1d20 + Dex"
                          >
                            <Dices className="w-3.5 h-3.5" />
                          </button>
                          <div className="flex items-center space-x-1">
                            <span className="text-[10px] text-slate-400 uppercase font-bold">Init</span>
                            <input
                              type="number"
                              required
                              value={initiatives[m.id] ?? ''}
                              onChange={(e) =>
                                setInitiatives({
                                  ...initiatives,
                                  [m.id]: parseInt(e.target.value, 10) || 0,
                                })
                              }
                              className="w-14 bg-surface-50 border border-surface-border rounded-lg py-1 px-2 text-center text-xs font-bold font-mono text-amber-300 focus:border-amber-500"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-surface-border flex items-center justify-between bg-surface-100/50">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg bg-surface-50 text-slate-300 text-xs font-semibold hover:bg-surface-hover"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-950/40 flex items-center space-x-2 transition-all hover:scale-105"
            >
              <Swords className="w-4 h-4" />
              <span>⚔️ Begin Combat Encounter</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
