import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Sparkles, 
  Flame, 
  ShieldAlert, 
  RotateCcw,
  CornerDownLeft,
  Dices
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const DiceDrawer: React.FC = () => {
  const { isDiceDrawerOpen, setIsDiceDrawerOpen, diceHistory, rollCustomFormula, clearDiceHistory } = useApp();
  
  const [formulaInput, setFormulaInput] = useState('1d20');
  const [advantage, setAdvantage] = useState(false);
  const [disadvantage, setDisadvantage] = useState(false);
  const [isCrit, setIsCrit] = useState(false);
  const [activePresetPool, setActivePresetPool] = useState<string[]>([]);
  const [modifier, setModifier] = useState<number>(0);

  if (!isDiceDrawerOpen) return null;

  const quickDice = [
    { name: 'd4', sides: 4, color: 'bg-emerald-950/60 border-emerald-700 text-emerald-300' },
    { name: 'd6', sides: 6, color: 'bg-blue-950/60 border-blue-700 text-blue-300' },
    { name: 'd8', sides: 8, color: 'bg-indigo-950/60 border-indigo-700 text-indigo-300' },
    { name: 'd10', sides: 10, color: 'bg-purple-950/60 border-purple-700 text-purple-300' },
    { name: 'd12', sides: 12, color: 'bg-pink-950/60 border-pink-700 text-pink-300' },
    { name: 'd20', sides: 20, color: 'bg-amber-950/60 border-amber-600 text-amber-300 font-bold' },
    { name: 'd100', sides: 100, color: 'bg-red-950/60 border-red-700 text-red-300' },
  ];

  const handleAddDieToPool = (die: string) => {
    setActivePresetPool((prev) => [...prev, die]);
  };

  const handleRollPool = () => {
    if (activePresetPool.length === 0) {
      rollCustomFormula(`1d20${modifier !== 0 ? (modifier > 0 ? `+${modifier}` : `${modifier}`) : ''}`, {
        advantage,
        disadvantage,
        isCrit,
      });
      return;
    }

    // Aggregate pool (e.g. ['d6', 'd6', 'd8'] -> '2d6 + 1d8')
    const counts: Record<string, number> = {};
    for (const d of activePresetPool) {
      counts[d] = (counts[d] || 0) + 1;
    }
    const parts = Object.entries(counts).map(([die, count]) => `${count}${die}`);
    let expr = parts.join(' + ');
    if (modifier !== 0) {
      expr += modifier > 0 ? ` + ${modifier}` : ` - ${Math.abs(modifier)}`;
    }

    rollCustomFormula(expr, { advantage, disadvantage, isCrit });
    setActivePresetPool([]);
  };

  const handleCustomRollSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formulaInput.trim()) return;
    rollCustomFormula(formulaInput, { advantage, disadvantage, isCrit });
  };

  const handleQuickSingleRoll = (dieName: string) => {
    let expr = `1${dieName}`;
    if (modifier !== 0) {
      expr += modifier > 0 ? `+${modifier}` : `${modifier}`;
    }
    rollCustomFormula(expr, { advantage, disadvantage, isCrit });
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-96 bg-[#0f141c] border-l border-surface-border shadow-2xl flex flex-col animate-slideLeft select-none">
      {/* Header */}
      <div className="h-12 border-b border-surface-border px-4 flex items-center justify-between bg-surface-100/50">
        <div className="flex items-center space-x-2">
          <Dices className="w-5 h-5 text-amber-500" />
          <span className="font-serif font-bold text-slate-100 text-sm tracking-wide">Dice Roller & History</span>
        </div>
        <button
          onClick={() => setIsDiceDrawerOpen(false)}
          className="p-1 rounded text-slate-400 hover:text-white hover:bg-surface-hover transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Quick Dice Buttons */}
        <div>
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex justify-between">
            <span>Quick Dice</span>
            <span className="text-[10px] text-slate-500">Click to roll / combine</span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {quickDice.map((die) => (
              <div key={die.name} className="relative group">
                <button
                  onClick={() => handleQuickSingleRoll(die.name)}
                  className={`w-full py-2.5 rounded-lg border text-xs font-mono font-semibold flex flex-col items-center justify-center transition-all hover:scale-105 shadow-sm ${die.color}`}
                >
                  <span>{die.name}</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddDieToPool(die.name);
                  }}
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-slate-800 border border-slate-600 text-[10px] text-slate-200 flex items-center justify-center hover:bg-amber-600 hover:border-amber-400 transition-colors"
                  title="Add to combination pool"
                >
                  +
                </button>
              </div>
            ))}

            <button
              onClick={() => {
                setActivePresetPool([]);
                setModifier(0);
              }}
              className="py-2.5 rounded-lg border border-surface-border bg-surface-50 hover:bg-surface-hover text-slate-400 text-xs font-mono flex items-center justify-center transition-colors"
              title="Reset pool"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Combined Pool & Modifier Bar */}
        {(activePresetPool.length > 0 || modifier !== 0) && (
          <div className="p-3 rounded-lg bg-surface-100 border border-surface-border space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="font-semibold text-amber-400">Selected Pool:</span>
              <span className="font-mono">
                {activePresetPool.join(' + ') || 'None'} {modifier !== 0 && (modifier > 0 ? `+ ${modifier}` : `- ${Math.abs(modifier)}`)}
              </span>
            </div>
            <button
              onClick={handleRollPool}
              className="w-full py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold text-xs rounded-lg shadow-md transition-all flex items-center justify-center space-x-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Roll Combined Pool</span>
            </button>
          </div>
        )}

        {/* Modifiers & Roll Options */}
        <div className="space-y-2">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Modifiers & Advantage
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => {
                setAdvantage(!advantage);
                if (!advantage) setDisadvantage(false);
              }}
              className={`py-1.5 px-2 rounded border text-xs font-medium transition-all ${
                advantage
                  ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                  : 'bg-surface-100 border-surface-border text-slate-300 hover:bg-surface-hover'
              }`}
            >
              Advantage
            </button>
            <button
              onClick={() => {
                setDisadvantage(!disadvantage);
                if (!disadvantage) setAdvantage(false);
              }}
              className={`py-1.5 px-2 rounded border text-xs font-medium transition-all ${
                disadvantage
                  ? 'bg-red-950 border-red-500 text-red-300'
                  : 'bg-surface-100 border-surface-border text-slate-300 hover:bg-surface-hover'
              }`}
            >
              Disadvantage
            </button>
            <button
              onClick={() => setIsCrit(!isCrit)}
              className={`py-1.5 px-2 rounded border text-xs font-medium transition-all flex items-center justify-center space-x-1 ${
                isCrit
                  ? 'bg-amber-950 border-amber-500 text-amber-300'
                  : 'bg-surface-100 border-surface-border text-slate-300 hover:bg-surface-hover'
              }`}
            >
              <Flame className="w-3 h-3 text-amber-400" />
              <span>Crit (2x)</span>
            </button>
          </div>

          {/* Quick Modifier Buttons */}
          <div className="flex items-center space-x-1 text-xs">
            <span className="text-slate-400 text-[11px] mr-1">Mod:</span>
            {[-2, -1, 0, 1, 2, 3, 4, 5, 7].map((num) => (
              <button
                key={num}
                onClick={() => setModifier(num)}
                className={`flex-1 py-1 rounded text-center font-mono text-[11px] border transition-colors ${
                  modifier === num
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                    : 'bg-surface-100 border-surface-border text-slate-400 hover:text-slate-200'
                }`}
              >
                {num >= 0 ? `+${num}` : num}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Formula Input */}
        <div>
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Custom Formula
          </div>
          <form onSubmit={handleCustomRollSubmit} className="flex space-x-1.5">
            <input
              type="text"
              value={formulaInput}
              onChange={(e) => setFormulaInput(e.target.value)}
              placeholder="e.g. 2d8 + 1d6 + 4"
              className="flex-1 bg-surface-100 border border-surface-border text-xs text-slate-100 rounded px-2.5 py-2 font-mono focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              className="px-3 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded transition-colors flex items-center justify-center"
            >
              <CornerDownLeft className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Roll History Log */}
        <div className="pt-2 border-t border-surface-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Roll History ({diceHistory.length})
            </span>
            {diceHistory.length > 0 && (
              <button
                onClick={clearDiceHistory}
                className="text-slate-400 hover:text-red-400 text-[11px] flex items-center space-x-1 transition-colors"
                title="Clear all roll history"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear</span>
              </button>
            )}
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {diceHistory.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500">
                No rolls yet. Click any die above to roll!
              </div>
            ) : (
              diceHistory.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-lg border text-xs transition-all ${
                    item.isCrit
                      ? 'bg-amber-950/40 border-amber-500/60 text-amber-200'
                      : item.isFumble
                      ? 'bg-red-950/40 border-red-500/60 text-red-200'
                      : 'bg-surface-100 border-surface-border text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-300 font-mono text-[11px] truncate">
                      {item.expression}
                    </span>
                    <span
                      className={`font-mono text-base font-black px-2 py-0.5 rounded ${
                        item.isCrit
                          ? 'bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/30'
                          : item.isFumble
                          ? 'bg-red-600 text-white shadow-sm shadow-red-500/30'
                          : 'bg-surface-50 text-slate-100'
                      }`}
                    >
                      {item.total}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {item.details}
                  </div>
                  {item.isCrit && (
                    <div className="mt-1 text-[10px] font-bold text-amber-400 flex items-center space-x-1">
                      <Sparkles className="w-3 h-3" />
                      <span>NATURAL 20 / CRITICAL!</span>
                    </div>
                  )}
                  {item.isFumble && (
                    <div className="mt-1 text-[10px] font-bold text-red-400 flex items-center space-x-1">
                      <ShieldAlert className="w-3 h-3" />
                      <span>NATURAL 1 / FUMBLE!</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
