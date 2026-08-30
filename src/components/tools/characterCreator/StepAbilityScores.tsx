import React, { useState } from 'react';
import {
  Dices,
  Calculator,
  ListOrdered,
  Edit3,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Plus,
  Minus,
  HelpCircle,
  Award,
} from 'lucide-react';
import {
  AbilityKey,
  AbilityScoreMethod,
  CharacterCreationState,
} from '../../../types/characterCreator';
import {
  getMergedBackgrounds,
  STANDARD_ARRAY_SCORES,
  POINT_BUY_COSTS,
  calculateModifier,
  formatModifier,
  calculatePointBuyRemaining,
  rollFullAbilitySet,
} from '../../../services/characterCreationService';
import { useApp } from '../../../context/AppContext';

interface StepAbilityScoresProps {
  state: CharacterCreationState;
  onChange: (updates: Partial<CharacterCreationState>) => void;
  onRollDice?: (formula: string) => void;
}

const ABILITY_LABELS: Record<AbilityKey, { name: string; desc: string }> = {
  str: { name: 'Strength (STR)', desc: 'Natural athleticism, melee attacks, and carrying capacity.' },
  dex: { name: 'Dexterity (DEX)', desc: 'Agility, reflexes, Armor Class, initiative, and stealth.' },
  con: { name: 'Constitution (CON)', desc: 'Health, stamina, vital force, and Hit Point maximum.' },
  int: { name: 'Intelligence (INT)', desc: 'Arcane lore, memory, investigation, and reasoning.' },
  wis: { name: 'Wisdom (WIS)', desc: 'Perception, intuition, survival, and primal/divine spellcasting.' },
  cha: { name: 'Charisma (CHA)', desc: 'Force of personality, persuasion, leadership, and innate magic.' },
};

const ABILITY_KEYS: AbilityKey[] = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

export const StepAbilityScores: React.FC<StepAbilityScoresProps> = ({ state, onChange }) => {
  const { db } = useApp();
  const backgrounds = React.useMemo(() => getMergedBackgrounds(db.customBackgrounds || []), [db.customBackgrounds]);
  const selectedBackground = backgrounds.find((b) => b.id === state.selectedBackgroundId) || backgrounds[0];
  const allowedBgStats = selectedBackground?.allowedAbilities || ['str', 'dex', 'con'];

  const [rollBreakdown, setRollBreakdown] = useState<{ rolls: number[]; dropped: number; total: number }[] | null>(null);

  const remainingPointBuy = calculatePointBuyRemaining(state.baseScores);

  // Switch Generation Mode
  const handleSetMethod = (method: AbilityScoreMethod) => {
    if (method === 'standard') {
      onChange({
        abilityMethod: 'standard',
        baseScores: { str: 15, dex: 14, con: 13, int: 10, wis: 12, cha: 8 },
      });
    } else if (method === 'pointbuy') {
      onChange({
        abilityMethod: 'pointbuy',
        baseScores: { str: 15, dex: 14, con: 13, int: 10, wis: 12, cha: 8 },
      });
    } else if (method === 'rolling') {
      const rolled = rollFullAbilitySet();
      setRollBreakdown(rolled.breakdown);
      onChange({
        abilityMethod: 'rolling',
        baseScores: rolled.scores,
      });
    } else {
      onChange({ abilityMethod: 'manual' });
    }
  };

  const handleRollAgain = () => {
    const rolled = rollFullAbilitySet();
    setRollBreakdown(rolled.breakdown);
    onChange({ baseScores: rolled.scores });
  };

  // Adjust Point Buy
  const handleAdjustPointBuy = (stat: AbilityKey, delta: number) => {
    const current = state.baseScores[stat];
    const target = current + delta;
    if (target < 8 || target > 15) return;

    const newScores = { ...state.baseScores, [stat]: target };
    const newRemaining = calculatePointBuyRemaining(newScores);
    if (newRemaining < 0 && delta > 0) return;

    onChange({ baseScores: newScores });
  };

  // Adjust Standard Array / Manual dropdown / Rolling score swap
  const handleChangeBaseScore = (stat: AbilityKey, val: number) => {
    onChange({
      baseScores: {
        ...state.baseScores,
        [stat]: val,
      },
    });
  };

  const handleSwapBaseScore = (stat: AbilityKey, newVal: number) => {
    const currentVal = state.baseScores[stat];
    if (currentVal === newVal) return;

    const currentScores = { ...state.baseScores };
    // Find another stat that currently holds newVal and swap
    const otherStat = ABILITY_KEYS.find((k) => k !== stat && currentScores[k] === newVal);
    if (otherStat) {
      currentScores[otherStat] = currentVal;
    }
    currentScores[stat] = newVal;
    onChange({ baseScores: currentScores });
  };

  // Background Bonus Split Configuration
  const handleSetBonusType = (type: '+2/+1' | '+1/+1/+1') => {
    if (type === '+2/+1') {
      onChange({
        backgroundBonusType: '+2/+1',
        backgroundBonusAssignment: {
          [allowedBgStats[0]]: 2,
          [allowedBgStats[1]]: 1,
        },
      });
    } else {
      onChange({
        backgroundBonusType: '+1/+1/+1',
        backgroundBonusAssignment: {
          [allowedBgStats[0]]: 1,
          [allowedBgStats[1]]: 1,
          [allowedBgStats[2]]: 1,
        },
      });
    }
  };

  const handleAssignBonus = (stat: AbilityKey, targetBonus: 2 | 1) => {
    const currentBonus = state.backgroundBonusAssignment[stat] || 0;
    if (currentBonus === targetBonus) return;

    const assignment: Partial<Record<AbilityKey, number>> = { ...state.backgroundBonusAssignment };
    const current2Stat = allowedBgStats.find((k) => assignment[k] === 2);
    const current1Stat = allowedBgStats.find((k) => assignment[k] === 1);

    if (targetBonus === 2) {
      if (stat === current1Stat) {
        // Swap 2 and 1
        assignment[stat] = 2;
        if (current2Stat) assignment[current2Stat] = 1;
      } else {
        // This stat gets 2; previous 2-holder is cleared; 1-holder stays intact
        assignment[stat] = 2;
        if (current2Stat && current2Stat !== stat) delete assignment[current2Stat];
      }
    } else if (targetBonus === 1) {
      if (stat === current2Stat) {
        // Swap 1 and 2
        assignment[stat] = 1;
        if (current1Stat) assignment[current1Stat] = 2;
      } else {
        // This stat gets 1; previous 1-holder is cleared; 2-holder stays intact
        assignment[stat] = 1;
        if (current1Stat && current1Stat !== stat) delete assignment[current1Stat];
      }
    }

    onChange({ backgroundBonusAssignment: assignment });
  };

  return (
    <div className="space-y-6">
      {/* Intro Heading */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-surface-100 to-surface-100 border border-amber-500/20">
        <h2 className="font-serif font-bold text-lg text-slate-100 flex items-center space-x-2">
          <Dices className="w-5 h-5 text-amber-400" />
          <span>Step 3: Determine Ability Scores</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
          Generate your 6 core Ability Scores using Standard Array, 27-Point Buy, or 4d6 Drop Lowest Rolling.
          Then apply your <strong>{selectedBackground.name}</strong> background bonus (+2/+1 or +1/+1/+1) to its 3 designated abilities ({allowedBgStats.map((a) => a.toUpperCase()).join(', ')}).
        </p>
      </div>

      {/* Generation Mode Tabs */}
      <div className="flex items-center space-x-2 bg-surface-100 p-1.5 rounded-xl border border-surface-border">
        <button
          type="button"
          onClick={() => handleSetMethod('standard')}
          className={`flex-1 py-2 rounded-lg text-xs font-serif font-bold transition-all flex items-center justify-center space-x-1.5 ${
            state.abilityMethod === 'standard'
              ? 'bg-amber-600 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ListOrdered className="w-4 h-4" />
          <span>Standard Array [15,14,13,12,10,8]</span>
        </button>

        <button
          type="button"
          onClick={() => handleSetMethod('pointbuy')}
          className={`flex-1 py-2 rounded-lg text-xs font-serif font-bold transition-all flex items-center justify-center space-x-1.5 ${
            state.abilityMethod === 'pointbuy'
              ? 'bg-amber-600 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>27-Point Buy</span>
        </button>

        <button
          type="button"
          onClick={() => handleSetMethod('rolling')}
          className={`flex-1 py-2 rounded-lg text-xs font-serif font-bold transition-all flex items-center justify-center space-x-1.5 ${
            state.abilityMethod === 'rolling'
              ? 'bg-amber-600 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Dices className="w-4 h-4" />
          <span>4d6 Drop Lowest Roller</span>
        </button>

        <button
          type="button"
          onClick={() => handleSetMethod('manual')}
          className={`px-3 py-2 rounded-lg text-xs font-serif font-bold transition-all flex items-center justify-center space-x-1.5 ${
            state.abilityMethod === 'manual'
              ? 'bg-amber-600 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Edit3 className="w-4 h-4" />
          <span>Manual</span>
        </button>
      </div>

      {/* Point Buy Status Bar (if active) */}
      {state.abilityMethod === 'pointbuy' && (
        <div className="p-3.5 rounded-xl bg-surface-100 border border-surface-border flex items-center justify-between">
          <div className="text-xs text-slate-300">
            Spend 27 points to purchase scores between 8 and 15.
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400">Points Remaining:</span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${
                remainingPointBuy === 0
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                  : remainingPointBuy > 0
                  ? 'bg-amber-950 text-amber-300 border-amber-800'
                  : 'bg-red-950 text-red-300 border-red-800'
              }`}
            >
              {remainingPointBuy} / 27 pts
            </span>
          </div>
        </div>
      )}

      {/* 4d6 Roll Breakdown (if active) */}
      {state.abilityMethod === 'rolling' && (
        <div className="p-4 rounded-xl bg-surface-100 border border-surface-border flex items-center justify-between flex-wrap gap-3">
          <div className="space-y-1">
            <div className="text-xs font-bold text-amber-400 flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4" />
              <span>4d6 Drop Lowest Dice Breakdown:</span>
            </div>
            {rollBreakdown && (
              <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-400 flex-wrap">
                {rollBreakdown.map((r, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-surface-50 border border-surface-border">
                    [{r.rolls.join(',')}] Drop {r.dropped} = <strong className="text-slate-100">{r.total}</strong>
                  </span>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleRollAgain}
            className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition-colors shadow-md"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reroll All Stats</span>
          </button>
        </div>
      )}

      {/* Main 6 Abilities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {ABILITY_KEYS.map((key) => {
          const base = state.baseScores[key];
          const bgBonus = state.backgroundBonusAssignment[key] || 0;
          const total = base + bgBonus;
          const mod = calculateModifier(total);
          const isAllowedBgStat = allowedBgStats.includes(key);

          return (
            <div
              key={key}
              className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                isAllowedBgStat
                  ? 'bg-surface-100 border-amber-500/40 ring-1 ring-amber-500/20'
                  : 'bg-surface-100/70 border-surface-border'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-serif font-bold text-sm text-slate-100">
                      {ABILITY_LABELS[key].name}
                    </span>
                    {isAllowedBgStat && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-mono">
                        BG Stat
                      </span>
                    )}
                  </div>

                  {/* Final Mod Badge */}
                  <div className="px-2.5 py-1 rounded-lg bg-surface-50 border border-surface-border flex items-center space-x-1 font-mono">
                    <span className="text-[11px] text-slate-400">MOD:</span>
                    <strong className="text-xs text-amber-400 font-bold">{formatModifier(mod)}</strong>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                  {ABILITY_LABELS[key].desc}
                </p>

                {/* Score Controls */}
                <div className="mt-3 p-2.5 rounded-lg bg-surface-50 border border-surface-border flex items-center justify-between">
                  <div className="text-[11px] text-slate-400">
                    Base Score: <strong className="text-slate-100 font-mono text-sm">{base}</strong>
                  </div>

                  {state.abilityMethod === 'pointbuy' && (
                    <div className="flex items-center space-x-1.5">
                      <button
                        type="button"
                        onClick={() => handleAdjustPointBuy(key, -1)}
                        disabled={base <= 8}
                        className="w-7 h-7 rounded bg-surface-100 hover:bg-surface-hover disabled:opacity-30 text-slate-200 flex items-center justify-center border border-surface-border"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAdjustPointBuy(key, 1)}
                        disabled={base >= 15 || remainingPointBuy <= 0}
                        className="w-7 h-7 rounded bg-surface-100 hover:bg-surface-hover disabled:opacity-30 text-slate-200 flex items-center justify-center border border-surface-border"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {state.abilityMethod === 'rolling' && (
                    <select
                      value={base}
                      onChange={(e) => handleSwapBaseScore(key, parseInt(e.target.value, 10))}
                      className="px-2 py-1 bg-surface-100 border border-amber-500/50 rounded text-xs font-mono text-amber-300 font-bold focus:outline-none focus:border-amber-400"
                    >
                      {ABILITY_KEYS.map((k) => state.baseScores[k])
                        .sort((a, b) => b - a)
                        .map((s, idx) => (
                          <option key={idx} value={s}>
                            {s}
                          </option>
                        ))}
                    </select>
                  )}

                  {state.abilityMethod === 'standard' && (
                    <select
                      value={base}
                      onChange={(e) => handleSwapBaseScore(key, parseInt(e.target.value, 10))}
                      className="px-2 py-1 bg-surface-100 border border-surface-border rounded text-xs font-mono text-slate-100 font-bold focus:outline-none focus:border-amber-500"
                    >
                      {STANDARD_ARRAY_SCORES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  )}

                  {state.abilityMethod === 'manual' && (
                    <input
                      type="number"
                      min={3}
                      max={20}
                      value={base}
                      onChange={(e) => handleChangeBaseScore(key, parseInt(e.target.value, 10) || 10)}
                      className="w-14 px-2 py-1 bg-surface-100 border border-surface-border rounded text-xs font-mono text-slate-100 text-center font-bold"
                    />
                  )}
                </div>
              </div>

              {/* Bottom Total Formula */}
              <div className="mt-3 pt-2.5 border-t border-surface-border/60 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400 font-mono">
                  {base} {bgBonus > 0 ? `+ ${bgBonus} (BG)` : ''}
                </span>
                <div className="font-mono">
                  Total: <strong className="text-slate-100 text-sm font-bold">{total}</strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Background Ability Score Increase Config */}
      <div className="p-4 rounded-xl bg-surface-100 border border-surface-border space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h4 className="font-serif font-bold text-sm text-slate-100 flex items-center space-x-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Background Stat Bonus: {selectedBackground.name}</span>
            </h4>
            <p className="text-xs text-slate-400">
              Must be assigned strictly among: <strong>{allowedBgStats.map((a) => a.toUpperCase()).join(', ')}</strong>
            </p>
          </div>

          <div className="flex items-center space-x-1.5 bg-surface-50 p-1 rounded-lg border border-surface-border text-xs">
            <button
              type="button"
              onClick={() => handleSetBonusType('+2/+1')}
              className={`px-3 py-1 rounded font-bold transition-all ${
                state.backgroundBonusType === '+2/+1'
                  ? 'bg-amber-600 text-slate-950'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              +2 / +1 Bonus
            </button>
            <button
              type="button"
              onClick={() => handleSetBonusType('+1/+1/+1')}
              className={`px-3 py-1 rounded font-bold transition-all ${
                state.backgroundBonusType === '+1/+1/+1'
                  ? 'bg-amber-600 text-slate-950'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              +1 / +1 / +1 Bonus
            </button>
          </div>
        </div>

        {/* Bonus Selector Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          {allowedBgStats.map((statKey) => {
            const currentBonus = state.backgroundBonusAssignment[statKey] || 0;
            return (
              <div
                key={statKey}
                className="p-3 rounded-lg bg-surface-50 border border-surface-border flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-slate-100">{ABILITY_LABELS[statKey].name}</div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Base: {state.baseScores[statKey]} → Total:{' '}
                    <strong className="text-amber-400">{state.baseScores[statKey] + currentBonus}</strong>
                  </div>
                </div>

                {state.backgroundBonusType === '+2/+1' ? (
                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => handleAssignBonus(statKey, 2)}
                      className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-all ${
                        currentBonus === 2
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-surface-100 text-slate-300 hover:text-white border border-surface-border'
                      }`}
                    >
                      +2
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAssignBonus(statKey, 1)}
                      className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-all ${
                        currentBonus === 1
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-surface-100 text-slate-300 hover:text-white border border-surface-border'
                      }`}
                    >
                      +1
                    </button>
                  </div>
                ) : (
                  <span className="px-2.5 py-1 rounded bg-amber-500/20 border border-amber-500/30 text-amber-300 font-mono font-bold text-xs">
                    +1 Bonus
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
