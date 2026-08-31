import React, { useState } from 'react';
import { X, Swords, Dices, Plus, Minus, Check, Zap } from 'lucide-react';
import { Combatant } from '../../types/combat';
import { TokenAvatar } from './TokenAvatar';

interface EditInitiativeModalProps {
  combatant: Combatant;
  onClose: () => void;
  onSaveInitiative: (combatantId: string, newInitiative: number) => void;
}

export const EditInitiativeModal: React.FC<EditInitiativeModalProps> = ({
  combatant,
  onClose,
  onSaveInitiative,
}) => {
  const [initiative, setInitiative] = useState<number>(combatant.initiative);

  const dex = combatant.abilities?.dex ?? 10;
  const dexMod = combatant.tieBreaker !== undefined ? combatant.tieBreaker : Math.floor((dex - 10) / 2);

  const handleRollD20 = () => {
    const d20 = Math.floor(Math.random() * 20) + 1;
    setInitiative(d20 + dexMod);
  };

  const handleIncrement = (amount: number) => {
    setInitiative((prev) => prev + amount);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveInitiative(combatant.id, initiative);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 select-none animate-fadeIn">
      <div 
        className="bg-[#121720] border border-surface-border rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-surface-border flex items-center justify-between bg-surface-100/50">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif text-sm font-bold text-slate-100">Edit Initiative</h3>
              <p className="text-[11px] text-slate-400">Update turn order count</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-surface-hover transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Combatant Details */}
        <div className="p-4 bg-surface-50/50 border-b border-surface-border flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <TokenAvatar
              name={combatant.name}
              imageUrl={combatant.avatarUrl}
              tokenUrl={combatant.tokenUrl}
              type={combatant.isPlayer ? 'player' : 'monster'}
              size="md"
            />
            <div>
              <div className="font-serif font-bold text-xs text-slate-100">{combatant.name}</div>
              <div className="text-[10px] text-slate-400 font-mono">
                DEX Mod: {dexMod >= 0 ? `+${dexMod}` : dexMod}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRollD20}
            className="px-2.5 py-1 rounded-lg bg-surface-100 hover:bg-surface-hover border border-surface-border text-amber-300 text-xs font-medium flex items-center space-x-1.5 transition-colors cursor-pointer"
            title="Roll 1d20 + DEX modifier"
          >
            <Dices className="w-3.5 h-3.5" />
            <span>Roll d20</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block text-center">
              Initiative Score
            </label>

            <div className="flex items-center justify-center space-x-2">
              <button
                type="button"
                onClick={() => handleIncrement(-5)}
                className="px-2 py-1.5 rounded-lg bg-surface-100 hover:bg-surface-hover text-slate-300 text-xs font-mono font-bold transition-colors cursor-pointer"
              >
                -5
              </button>
              <button
                type="button"
                onClick={() => handleIncrement(-1)}
                className="p-1.5 rounded-lg bg-surface-100 hover:bg-surface-hover text-slate-300 transition-colors cursor-pointer"
              >
                <Minus className="w-4 h-4" />
              </button>

              <input
                type="number"
                value={initiative}
                onChange={(e) => setInitiative(parseInt(e.target.value, 10) || 0)}
                autoFocus
                className="w-20 px-2 py-2 text-center text-xl font-mono font-bold bg-[#090d12] border border-amber-500/50 rounded-xl text-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />

              <button
                type="button"
                onClick={() => handleIncrement(1)}
                className="p-1.5 rounded-lg bg-surface-100 hover:bg-surface-hover text-slate-300 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleIncrement(5)}
                className="px-2 py-1.5 rounded-lg bg-surface-100 hover:bg-surface-hover text-slate-300 text-xs font-mono font-bold transition-colors cursor-pointer"
              >
                +5
              </button>
            </div>
          </div>

          <div className="pt-2 flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-xl bg-surface-100 hover:bg-surface-hover text-slate-300 text-xs font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow-md flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>Save</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
