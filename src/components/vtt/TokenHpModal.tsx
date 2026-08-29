import React, { useState } from 'react';
import { X, Heart, Shield, Plus, Minus, Check } from 'lucide-react';
import { MapToken } from '../../types/map';

interface TokenHpModalProps {
  token: MapToken;
  onClose: () => void;
  onApplyHp: (updates: { currentHp: number; tempHp?: number }) => void;
}

export const TokenHpModal: React.FC<TokenHpModalProps> = ({
  token,
  onClose,
  onApplyHp,
}) => {
  const [amount, setAmount] = useState<number>(5);
  const [mode, setMode] = useState<'damage' | 'heal' | 'temp'>('damage');

  const maxHp = token.maxHp || 10;
  const currentHp = token.currentHp ?? maxHp;
  const tempHp = token.tempHp || 0;

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (isNaN(amount) || amount <= 0) return;

    if (mode === 'damage') {
      let remainingDamage = amount;
      let newTempHp = tempHp;
      if (newTempHp > 0) {
        if (remainingDamage <= newTempHp) {
          newTempHp -= remainingDamage;
          remainingDamage = 0;
        } else {
          remainingDamage -= newTempHp;
          newTempHp = 0;
        }
      }
      const newCurrentHp = Math.max(0, currentHp - remainingDamage);
      onApplyHp({ currentHp: newCurrentHp, tempHp: newTempHp });
    } else if (mode === 'heal') {
      const newCurrentHp = Math.min(maxHp, currentHp + amount);
      onApplyHp({ currentHp: newCurrentHp });
    } else if (mode === 'temp') {
      onApplyHp({ currentHp, tempHp: Math.max(tempHp, amount) });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 select-none">
      <div className="bg-[#121720] border border-surface-border rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-scaleUp">
        {/* Header */}
        <div className="p-4 border-b border-surface-border flex items-center justify-between bg-surface-100/50">
          <div>
            <h3 className="font-serif text-base font-bold text-slate-100 flex items-center space-x-2">
              <Heart className="w-4 h-4 text-emerald-400" />
              <span>Hit Points: {token.name}</span>
            </h3>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5">
              Current: <strong className="text-slate-200">{currentHp}</strong> / {maxHp} HP
              {tempHp > 0 && <span className="text-amber-400"> (+{tempHp} Temp)</span>}
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleApply} className="p-5 space-y-4">
          {/* Mode Selector */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-surface-50 rounded-xl border border-surface-border text-xs font-semibold">
            <button
              type="button"
              onClick={() => setMode('damage')}
              className={`py-1.5 rounded-lg transition-colors ${
                mode === 'damage'
                  ? 'bg-red-600 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🩸 Damage
            </button>
            <button
              type="button"
              onClick={() => setMode('heal')}
              className={`py-1.5 rounded-lg transition-colors ${
                mode === 'heal'
                  ? 'bg-emerald-600 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              💚 Heal
            </button>
            <button
              type="button"
              onClick={() => setMode('temp')}
              className={`py-1.5 rounded-lg transition-colors ${
                mode === 'temp'
                  ? 'bg-amber-600 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🛡️ Temp HP
            </button>
          </div>

          {/* Amount Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              {mode === 'damage' ? 'Damage Amount' : mode === 'heal' ? 'Healing Amount' : 'Temporary HP Amount'}
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="1"
                max="999"
                value={amount}
                onChange={(e) => setAmount(parseInt(e.target.value, 10) || 0)}
                className="flex-1 bg-surface-100 border border-surface-border rounded-xl px-3 py-2 text-center text-lg font-bold font-mono text-slate-100 focus:border-amber-500"
                autoFocus
              />
            </div>
          </div>

          {/* Quick Amount Buttons */}
          <div className="grid grid-cols-4 gap-1.5">
            {[1, 5, 10, 20].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setAmount(val)}
                className="py-1 rounded-lg bg-surface-50 hover:bg-surface-hover border border-surface-border text-xs font-mono font-bold text-slate-300"
              >
                {val}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-surface-border flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg bg-surface-50 text-slate-300 text-xs font-semibold hover:bg-surface-hover"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-1.5 rounded-lg font-bold text-xs shadow-md ${
                mode === 'damage'
                  ? 'bg-red-600 hover:bg-red-500 text-white'
                  : mode === 'heal'
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-amber-600 hover:bg-amber-500 text-slate-950'
              }`}
            >
              {mode === 'damage' ? 'Apply Damage' : mode === 'heal' ? 'Apply Healing' : 'Set Temp HP'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
