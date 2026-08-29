import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Swords, 
  Heart, 
  Shield, 
  ChevronRight, 
  ChevronLeft, 
  Plus, 
  Minus, 
  RotateCcw, 
  Sparkles, 
  Skull, 
  Dices, 
  AlertCircle,
  X,
  Footprints,
  Flame,
  CheckCircle2,
  StopCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Combatant, ConditionType } from '../../types/combat';
import { MonsterStatBlock } from '../compendium/MonsterStatBlock';
import { TokenAvatar } from '../common/TokenAvatar';

export const CombatTracker: React.FC = () => {
  const { 
    combatState, 
    nextTurn, 
    prevTurn, 
    endCombat, 
    modifyCombatantHp, 
    addConditionToCombatant, 
    removeConditionFromCombatant, 
    executeAttackRoll,
    setInitiative,
    db,
    showToast,
    setActiveTab
  } = useApp();

  const [selectedCombatantId, setSelectedCombatantId] = useState<string | null>(null);
  const [hpModalCombatant, setHpModalCombatant] = useState<Combatant | null>(null);
  const [hpAmountInput, setHpAmountInput] = useState<string>('5');
  const [isTempHp, setIsTempHp] = useState(false);
  const [conditionModalCombatant, setConditionModalCombatant] = useState<Combatant | null>(null);
  const [selectedConditionName, setSelectedConditionName] = useState<ConditionType>('Poisoned');
  const [conditionRounds, setConditionRounds] = useState<number>(3);

  const activeCombatant = combatState.combatants[combatState.currentTurnIndex] || null;
  const inspectedCombatant = combatState.combatants.find((c) => c.id === (selectedCombatantId || activeCombatant?.id)) || activeCombatant;

  // Spacebar to advance turn, Backspace to reverse
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (combatState.isActive) {
        if (e.code === 'Space' && (e.target as HTMLElement).tagName !== 'INPUT' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
          e.preventDefault();
          nextTurn();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [combatState.isActive, nextTurn]);

  if (!combatState.isActive || combatState.combatants.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#090d12] p-8 text-center select-none">
        <div className="w-16 h-16 rounded-full bg-surface-100 flex items-center justify-center text-amber-500 mb-4 border border-surface-border shadow-lg">
          <Swords className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-slate-100 mb-2">No Active Combat</h2>
        <p className="text-xs text-slate-400 max-w-md mb-6 leading-relaxed">
          Start a battle from the Encounter Builder or choose an existing encounter to begin tracking turns, HP, conditions, and rolls.
        </p>
        <button
          onClick={() => setActiveTab('encounters')}
          className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold text-xs rounded-lg shadow-md transition-all flex items-center space-x-2"
        >
          <Swords className="w-4 h-4" />
          <span>Go to Encounter Builder</span>
        </button>
      </div>
    );
  }

  const handleApplyDamage = () => {
    if (!hpModalCombatant) return;
    const val = parseInt(hpAmountInput, 10);
    if (!isNaN(val)) {
      modifyCombatantHp(hpModalCombatant.id, -Math.abs(val), isTempHp);
    }
    setHpModalCombatant(null);
  };

  const handleApplyHeal = () => {
    if (!hpModalCombatant) return;
    const val = parseInt(hpAmountInput, 10);
    if (!isNaN(val)) {
      modifyCombatantHp(hpModalCombatant.id, Math.abs(val), isTempHp);
    }
    setHpModalCombatant(null);
  };

  const handleAddCondition = () => {
    if (!conditionModalCombatant) return;
    addConditionToCombatant(conditionModalCombatant.id, {
      id: `cond-${Date.now()}`,
      name: selectedConditionName,
      durationRounds: conditionRounds > 0 ? conditionRounds : undefined,
    });
    setConditionModalCombatant(null);
  };

  const conditionOptions: ConditionType[] = [
    'Blinded', 'Charmed', 'Deafened', 'Frightened', 'Grappled',
    'Incapacitated', 'Invisible', 'Paralyzed', 'Petrified', 'Poisoned',
    'Prone', 'Restrained', 'Stunned', 'Unconscious', 'Exhaustion', 'Concentration', 'Custom'
  ];

  const getHpPercent = (curr: number, max: number) => {
    return Math.max(0, Math.min(100, Math.round((curr / max) * 100)));
  };

  const getHpColor = (percent: number) => {
    if (percent > 60) return 'bg-emerald-500';
    if (percent > 25) return 'bg-amber-500';
    return 'bg-red-600';
  };

  return (
    <div className="h-full flex flex-col bg-[#090d12] overflow-hidden select-none">
      {/* Top Combat Navigation & Controls Bar */}
      <div className="p-3.5 bg-surface-100/90 border-b border-surface-border flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 px-3 py-1 rounded-lg bg-red-950/80 border border-red-800 text-red-300 font-serif font-bold text-sm shadow-sm">
            <ShieldAlert className="w-4 h-4 text-red-400 animate-pulse" />
            <span>ROUND {combatState.round}</span>
          </div>

          <div className="text-xs text-slate-300">
            Active Turn:{' '}
            <strong className="text-amber-400 font-bold font-serif">
              {activeCombatant?.name || 'Nobody'}
            </strong>
          </div>
        </div>

        {/* Turn Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={prevTurn}
            className="px-3 py-1.5 rounded-lg bg-surface-50 hover:bg-surface-hover border border-surface-border text-xs text-slate-300 flex items-center space-x-1 transition-colors"
            title="Previous turn"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Prev</span>
          </button>

          <button
            onClick={nextTurn}
            className="px-5 py-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold text-xs shadow-md flex items-center space-x-1.5 transition-all"
            title="Advance turn (Shortcut: Space)"
          >
            <span>Next Turn</span>
            <ChevronRight className="w-4 h-4" />
            <kbd className="text-[10px] px-1 py-0.2 bg-slate-900/40 text-slate-900 rounded font-mono">Space</kbd>
          </button>

          <button
            onClick={() => {
              if (confirm('Are you sure you want to end this combat encounter?')) {
                endCombat();
              }
            }}
            className="px-3 py-1.5 rounded-lg bg-surface-50 hover:bg-red-950 border border-surface-border hover:border-red-800 text-xs text-slate-400 hover:text-red-300 transition-colors flex items-center space-x-1"
            title="End combat session"
          >
            <StopCircle className="w-4 h-4 text-red-500" />
            <span>End Combat</span>
          </button>
        </div>
      </div>

      {/* Main Two-Pane View: Initiative List on Left, Active Statblock on Right */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Initiative Tracker List */}
        <div className="w-[440px] border-r border-surface-border bg-[#0d1117] overflow-y-auto p-3 space-y-2 shrink-0">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase text-slate-400 tracking-wider mb-2">
            <span>Initiative Order ({combatState.combatants.length})</span>
            <span className="text-[10px] text-slate-500">Sorted by Init + Dex</span>
          </div>

          {combatState.combatants.map((c, idx) => {
            const isCurrentTurn = idx === combatState.currentTurnIndex;
            const isInspected = inspectedCombatant?.id === c.id;
            const hpPercent = getHpPercent(c.currentHp, c.maxHp);
            const isDead = c.currentHp === 0;

            return (
              <div
                key={c.id}
                onClick={() => setSelectedCombatantId(c.id)}
                className={`p-3 rounded-xl border transition-all space-y-2 cursor-pointer relative ${
                  isCurrentTurn
                    ? 'bg-amber-500/10 border-amber-500/80 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/50'
                    : isInspected
                    ? 'bg-surface-100 border-slate-500'
                    : 'bg-surface-100/70 border-surface-border hover:bg-surface-hover hover:border-slate-600'
                } ${isDead ? 'opacity-60 bg-red-950/20' : ''}`}
              >
                {/* Active Indicator Arrow */}
                {isCurrentTurn && (
                  <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-amber-500 rotate-45 rounded-xs shadow-md"></div>
                )}

                {/* Card Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    {/* Initiative Badge */}
                    <div 
                      className="w-7 h-7 rounded-lg bg-surface-50 border border-surface-border text-slate-200 font-mono font-bold text-xs flex items-center justify-center shrink-0"
                      title="Initiative roll"
                    >
                      {c.initiative}
                    </div>

                    {/* Circular Token Avatar */}
                    <TokenAvatar
                      name={c.name}
                      imageUrl={c.avatarUrl}
                      tokenUrl={c.tokenUrl}
                      type={c.isPlayer ? 'player' : 'monster'}
                      size="sm"
                    />

                    <div>
                      <div className="flex items-center space-x-2">
                        <span className={`font-serif text-sm font-bold ${c.isPlayer ? 'text-blue-300' : 'text-amber-400'}`}>
                          {c.name}
                        </span>
                        {isDead && (
                          <span className="px-1.5 py-0.2 rounded bg-red-950 text-red-300 border border-red-800 text-[10px] font-bold flex items-center space-x-0.5">
                            <Skull className="w-3 h-3" />
                            <span>DOWN</span>
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        AC {c.armorClass} · Speed {c.speed}
                      </div>
                    </div>
                  </div>

                  {/* Quick Damage/Heal & Condition Buttons */}
                  <div className="flex items-center space-x-1 select-none" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => {
                        setHpModalCombatant(c);
                        setIsTempHp(false);
                      }}
                      className="px-2 py-1 rounded bg-surface-50 hover:bg-surface-hover border border-surface-border text-xs font-bold text-slate-200 flex items-center space-x-1 transition-colors"
                      title="Adjust Hit Points"
                    >
                      <Heart className="w-3 h-3 text-red-400" />
                      <span className="font-mono">{c.currentHp}</span>
                    </button>

                    <button
                      onClick={() => setConditionModalCombatant(c)}
                      className="p-1 rounded bg-surface-50 hover:bg-surface-hover border border-surface-border text-slate-400 hover:text-amber-400 transition-colors"
                      title="Add Condition"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* HP Bar */}
                <div className="space-y-1">
                  <div className="w-full h-2 rounded-full bg-surface-50 overflow-hidden border border-surface-border/50">
                    <div
                      className={`h-full transition-all duration-300 ${getHpColor(hpPercent)}`}
                      style={{ width: `${hpPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>
                      {c.currentHp} / {c.maxHp} HP {c.tempHp > 0 && <strong className="text-blue-400">(+{c.tempHp} Temp)</strong>}
                    </span>
                    <span>{hpPercent}%</span>
                  </div>
                </div>

                {/* Active Conditions & Concentration */}
                {(c.conditions.length > 0 || c.concentratingOn) && (
                  <div className="flex flex-wrap gap-1 pt-1" onClick={(e) => e.stopPropagation()}>
                    {c.concentratingOn && (
                      <span
                        className="px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-700 text-cyan-300 text-[10px] font-bold flex items-center space-x-1"
                        title="Concentrating on spell"
                      >
                        <Sparkles className="w-3 h-3 text-cyan-400" />
                        <span>[C] {c.concentratingOn.spellName}</span>
                      </span>
                    )}

                    {c.conditions.map((cond) => (
                      <button
                        key={cond.id}
                        onClick={() => removeConditionFromCombatant(c.id, cond.id)}
                        className="px-2 py-0.5 rounded-full bg-purple-950 border border-purple-800 text-purple-300 text-[10px] font-bold flex items-center space-x-1 hover:bg-red-950 hover:border-red-800 hover:text-red-300 transition-colors group"
                        title="Click to remove condition"
                      >
                        <span>{cond.name}</span>
                        {cond.durationRounds !== undefined && (
                          <span className="text-[9px] bg-purple-900 px-1 rounded-full font-mono">
                            {cond.durationRounds}r
                          </span>
                        )}
                        <X className="w-2.5 h-2.5 opacity-60 group-hover:opacity-100" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right: Active / Inspected Combatant Stat Block & Action Roller */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#090d12] flex flex-col justify-between">
          {inspectedCombatant ? (
            <div className="max-w-3xl mx-auto w-full space-y-6">
              {/* Top Banner for Inspected Combatant */}
              <div className="p-4 rounded-xl bg-surface-100 border border-surface-border flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-400 font-semibold uppercase">Currently Inspecting</div>
                  <h2 className="font-serif text-xl font-bold text-slate-100">{inspectedCombatant.name}</h2>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setHpModalCombatant(inspectedCombatant);
                      setIsTempHp(false);
                    }}
                    className="px-3 py-1.5 bg-surface-50 hover:bg-surface-hover border border-surface-border text-xs font-semibold text-slate-200 rounded-lg flex items-center space-x-1.5"
                  >
                    <Heart className="w-3.5 h-3.5 text-red-400" />
                    <span>Damage / Heal</span>
                  </button>
                  <button
                    onClick={() => setConditionModalCombatant(inspectedCombatant)}
                    className="px-3 py-1.5 bg-surface-50 hover:bg-surface-hover border border-surface-border text-xs font-semibold text-slate-200 rounded-lg flex items-center space-x-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    <span>Add Condition</span>
                  </button>
                </div>
              </div>

              {/* Monster Actions & Attacks */}
              {inspectedCombatant.actions && inspectedCombatant.actions.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm font-serif font-bold text-amber-500 border-b border-amber-600/30 pb-2">
                    <Swords className="w-4 h-4" />
                    <span>Click to Roll Attacks & Actions</span>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5">
                    {inspectedCombatant.actions.map((act, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-surface-100 border border-surface-border hover:border-amber-500/40 transition-all space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-serif text-sm font-bold text-slate-100">{act.name}</span>
                          <button
                            onClick={() => executeAttackRoll(inspectedCombatant, act.name, act.attackBonus, act.damageDice, act.damageType)}
                            className="px-3 py-1 rounded bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-sm transition-all hover:scale-105"
                          >
                            <Dices className="w-3.5 h-3.5" />
                            <span>Roll {act.attackBonus !== undefined ? `+${act.attackBonus}` : ''} {act.damageDice ? `(${act.damageDice})` : ''}</span>
                          </button>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed select-text">{act.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-surface-100 border border-surface-border space-y-2">
                  <div className="font-serif font-bold text-slate-100 text-sm">Character Combat Information</div>
                  <p className="text-xs text-slate-400">
                    AC: {inspectedCombatant.armorClass} · Speed: {inspectedCombatant.speed}
                  </p>
                  {inspectedCombatant.notes && (
                    <div className="text-xs text-slate-300 italic pt-2 border-t border-surface-border">
                      {inspectedCombatant.notes}
                    </div>
                  )}
                </div>
              )}

              {/* Combat Event Log Drawer */}
              <div className="p-4 rounded-xl bg-surface-100 border border-surface-border space-y-2">
                <div className="flex items-center justify-between text-xs font-bold uppercase text-slate-400 tracking-wider">
                  <div className="flex items-center space-x-1.5">
                    <ShieldAlert className="w-4 h-4 text-amber-500" />
                    <span>Live Combat Log</span>
                  </div>
                  <span className="text-[10px] text-slate-500">{combatState.log.length} events</span>
                </div>

                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 text-xs">
                  {combatState.log.map((entry) => (
                    <div
                      key={entry.id}
                      className="p-2 rounded bg-surface-50 border border-surface-border/60 text-slate-300 font-mono text-[11px] leading-relaxed flex items-start space-x-2"
                    >
                      <span className="text-slate-500 text-[10px] shrink-0 font-sans">[{entry.timestamp}]</span>
                      <div>
                        <strong className="text-amber-400 mr-1">{entry.speaker}:</strong>
                        <span>{entry.message}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500 text-xs">
              No combatant selected.
            </div>
          )}
        </div>
      </div>

      {/* HP Damage / Heal Popup Modal */}
      {hpModalCombatant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#121720] border border-surface-border rounded-xl shadow-2xl w-full max-w-sm p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-surface-border pb-2">
              <h3 className="font-serif font-bold text-slate-100 text-sm">
                Adjust HP: {hpModalCombatant.name}
              </h3>
              <button
                onClick={() => setHpModalCombatant(null)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-400">
              Current HP: <strong className="text-slate-100">{hpModalCombatant.currentHp} / {hpModalCombatant.maxHp}</strong>
              {hpModalCombatant.tempHp > 0 && <span className="text-blue-400 ml-1">(+{hpModalCombatant.tempHp} Temp)</span>}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Amount</label>
              <input
                type="number"
                min={1}
                value={hpAmountInput}
                onChange={(e) => setHpAmountInput(e.target.value)}
                className="w-full bg-surface-100 border border-surface-border rounded-lg px-3 py-2 text-sm text-slate-100 font-mono focus:border-amber-500"
                autoFocus
              />
            </div>

            {/* Quick Presets */}
            <div className="flex space-x-1 text-xs">
              {[1, 5, 10, 15, 20, 25].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setHpAmountInput(amt.toString())}
                  className="flex-1 py-1 rounded bg-surface-50 border border-surface-border text-slate-300 hover:bg-surface-hover text-center font-mono text-[11px]"
                >
                  {amt}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={handleApplyDamage}
                className="py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center space-x-1"
              >
                <Minus className="w-4 h-4" />
                <span>Damage (-{hpAmountInput})</span>
              </button>
              <button
                type="button"
                onClick={handleApplyHeal}
                className="py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center space-x-1"
              >
                <Plus className="w-4 h-4" />
                <span>Heal (+{hpAmountInput})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Condition Modal */}
      {conditionModalCombatant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#121720] border border-surface-border rounded-xl shadow-2xl w-full max-w-sm p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-surface-border pb-2">
              <h3 className="font-serif font-bold text-slate-100 text-sm">
                Add Condition: {conditionModalCombatant.name}
              </h3>
              <button
                onClick={() => setConditionModalCombatant(null)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Condition</label>
              <select
                value={selectedConditionName}
                onChange={(e) => setSelectedConditionName(e.target.value as any)}
                className="w-full bg-surface-100 border border-surface-border rounded-lg px-3 py-2 text-xs text-slate-100 focus:border-amber-500"
              >
                {conditionOptions.map((cond) => (
                  <option key={cond} value={cond}>{cond}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Duration (Rounds, 0 = indefinite)</label>
              <input
                type="number"
                min={0}
                max={99}
                value={conditionRounds}
                onChange={(e) => setConditionRounds(parseInt(e.target.value, 10) || 0)}
                className="w-full bg-surface-100 border border-surface-border rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:border-amber-500"
              />
            </div>

            <div className="pt-2 flex justify-end space-x-2 border-t border-surface-border">
              <button
                type="button"
                onClick={() => setConditionModalCombatant(null)}
                className="px-4 py-2 rounded-lg bg-surface-100 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddCondition}
                className="px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs"
              >
                Apply Condition
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
