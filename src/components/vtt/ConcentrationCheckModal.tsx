import React, { useState } from 'react';
import { Sparkles, Dices, X, AlertTriangle, Check, ShieldAlert } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export interface ConcentrationCheckData {
  combatantId?: string;
  tokenId?: string;
  name: string;
  spellName: string;
  damageTaken: number;
  dc: number; // max(10, Math.floor(damageTaken / 2))
  conModifier: number;
}

interface ConcentrationCheckModalProps {
  data: ConcentrationCheckData;
  onClose: () => void;
  onResolve: (maintained: boolean) => void;
}

export const ConcentrationCheckModal: React.FC<ConcentrationCheckModalProps> = ({
  data,
  onClose,
  onResolve,
}) => {
  const { rollCustomFormula } = useApp();
  const [rollResult, setRollResult] = useState<{ total: number; rollFormula: string; details: string; passed: boolean } | null>(null);
  const [hasAdvantage, setHasAdvantage] = useState(false); // e.g. War Caster feat

  const handleRollSave = () => {
    const modStr = data.conModifier >= 0 ? `+${data.conModifier}` : `${data.conModifier}`;
    const formula = `1d20${modStr}`;
    const res = rollCustomFormula(
      formula,
      { advantage: hasAdvantage },
      `${data.name} (DC ${data.dc} Con Save for ${data.spellName})`
    );

    const passed = res.total >= data.dc;
    setRollResult({
      total: res.total,
      rollFormula: res.expression,
      details: res.details,
      passed,
    });
  };

  const handleFinish = (maintained: boolean) => {
    onResolve(maintained);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 select-none animate-fadeIn">
      <div className="bg-[#121720] border border-amber-500/60 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scaleUp">
        {/* Header */}
        <div className="p-4 bg-amber-950/40 border-b border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <Sparkles className="w-5 h-5 animate-spinSlow" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm text-slate-100">
                5e Concentration Check
              </h3>
              <div className="text-[11px] text-amber-300/90 font-mono">
                {data.name} took {data.damageTaken} damage!
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <div className="p-3 bg-surface-100 rounded-xl border border-surface-border text-center space-y-1">
            <div className="text-xs text-slate-300">
              Concentrating on <strong className="text-amber-400 font-serif">{data.spellName}</strong>
            </div>
            <div className="text-2xl font-bold font-mono text-slate-100">
              Target: <span className="text-amber-400">DC {data.dc}</span> Constitution Save
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Calculation: max(10, {data.damageTaken} ÷ 2) = DC {data.dc}
            </div>
          </div>

          {/* War Caster Advantage Option */}
          <label className="flex items-center justify-between p-2.5 rounded-xl bg-surface-50 border border-surface-border cursor-pointer hover:bg-surface-hover transition-colors text-xs text-slate-300">
            <span className="flex items-center space-x-2">
              <span>War Caster / Advantage on Con Saves</span>
            </span>
            <input
              type="checkbox"
              checked={hasAdvantage}
              onChange={(e) => setHasAdvantage(e.target.checked)}
              className="w-4 h-4 rounded text-amber-500 bg-surface-100 border-surface-border"
            />
          </label>

          {/* Roll Result Display */}
          {rollResult && (
            <div
              className={`p-3.5 rounded-xl border text-center space-y-1 animate-scaleUp ${
                rollResult.passed
                  ? 'bg-emerald-950/40 border-emerald-500/70 text-emerald-200'
                  : 'bg-red-950/40 border-red-500/70 text-red-200'
              }`}
            >
              <div className="text-xs font-bold uppercase tracking-wider">
                {rollResult.passed ? '✅ Concentration Maintained!' : '❌ Concentration Broken!'}
              </div>
              <div className="text-2xl font-bold font-mono">
                Rolled {rollResult.total} (DC {data.dc})
              </div>
              <div className="text-[10px] opacity-80 font-mono">{rollResult.details}</div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-between space-x-2">
            {!rollResult ? (
              <>
                <button
                  type="button"
                  onClick={() => handleFinish(false)}
                  className="px-3.5 py-2 rounded-xl bg-surface-50 hover:bg-red-950 text-slate-400 hover:text-red-300 border border-surface-border text-xs font-semibold transition-colors"
                >
                  Break Concentration
                </button>

                <button
                  type="button"
                  onClick={handleRollSave}
                  className="flex-1 py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg flex items-center justify-center space-x-2 transition-all hover:scale-105"
                >
                  <Dices className="w-4 h-4" />
                  <span>Roll CON Save ({data.conModifier >= 0 ? `+${data.conModifier}` : data.conModifier})</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => handleFinish(rollResult.passed)}
                className={`w-full py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all ${
                  rollResult.passed
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : 'bg-red-600 hover:bg-red-500 text-white'
                }`}
              >
                {rollResult.passed ? 'Continue (Maintain Concentration)' : 'Drop Concentration & Continue'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
