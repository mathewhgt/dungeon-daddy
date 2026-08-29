import React from 'react';
import { X, Sparkles, Check } from 'lucide-react';
import { MapToken } from '../../types/map';

interface TokenConditionModalProps {
  token: MapToken;
  onClose: () => void;
  onUpdateConditions: (conditions: string[]) => void;
}

export const CONDITIONS_5E = [
  { id: 'blinded', label: 'Blinded', desc: 'Auto-fails sight checks; attacks have disadvantage, attacks against have advantage.' },
  { id: 'charmed', label: 'Charmed', desc: 'Cannot attack the charmer; charmer has advantage on social checks.' },
  { id: 'deafened', label: 'Deafened', desc: 'Auto-fails hearing checks.' },
  { id: 'frightened', label: 'Frightened', desc: 'Disadvantage on ability checks/attacks while source is in line of sight; cannot move closer.' },
  { id: 'grappled', label: 'Grappled', desc: 'Speed becomes 0.' },
  { id: 'incapacitated', label: 'Incapacitated', desc: 'Cannot take actions or reactions.' },
  { id: 'invisible', label: 'Invisible', desc: 'Impossible to see; attacks have advantage, attacks against have disadvantage.' },
  { id: 'paralyzed', label: 'Paralyzed', desc: 'Incapacitated, cannot move/speak; auto-fails Str/Dex saves; melee hits within 5ft are crits.' },
  { id: 'petrified', label: 'Petrified', desc: 'Transformed into solid stone; incapacitated, resistance to all damage.' },
  { id: 'poisoned', label: 'Poisoned', desc: 'Disadvantage on attack rolls and ability checks.' },
  { id: 'prone', label: 'Prone', desc: 'Must crawl; disadvantage on attacks; melee within 5ft has advantage against, ranged has disadvantage.' },
  { id: 'restrained', label: 'Restrained', desc: 'Speed 0; disadvantage on Dex saves; attacks against have advantage, own attacks have disadvantage.' },
  { id: 'stunned', label: 'Stunned', desc: 'Incapacitated, cannot move; auto-fails Str/Dex saves; attacks against have advantage.' },
  { id: 'unconscious', label: 'Unconscious', desc: 'Incapacitated, drops items, falls prone; auto-fails Str/Dex saves; attacks within 5ft are crits.' },
  { id: 'exhaustion', label: 'Exhaustion', desc: 'Cumulative levels of debuff to checks, speed, and max HP.' },
];

export const TokenConditionModal: React.FC<TokenConditionModalProps> = ({
  token,
  onClose,
  onUpdateConditions,
}) => {
  const activeConditions = token.conditions || [];

  const toggleCondition = (conditionId: string) => {
    let next: string[];
    if (activeConditions.includes(conditionId)) {
      next = activeConditions.filter((c) => c !== conditionId);
    } else {
      next = [...activeConditions, conditionId];
    }
    onUpdateConditions(next);
  };

  const handleClearAll = () => {
    onUpdateConditions([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 select-none">
      <div className="bg-[#121720] border border-surface-border rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-scaleUp">
        {/* Header */}
        <div className="p-4 border-b border-surface-border flex items-center justify-between bg-surface-100/50">
          <div>
            <h3 className="font-serif text-base font-bold text-slate-100 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Status Conditions: {token.name}</span>
            </h3>
            <p className="text-[11px] text-slate-400">Toggle 5e status condition effects and markers.</p>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Condition Grid */}
        <div className="p-4 overflow-y-auto max-h-[60vh] space-y-1.5">
          {CONDITIONS_5E.map((cond) => {
            const isActive = activeConditions.includes(cond.id);

            return (
              <div
                key={cond.id}
                onClick={() => toggleCondition(cond.id)}
                className={`p-2.5 rounded-xl border flex items-start space-x-3 cursor-pointer transition-all ${
                  isActive
                    ? 'bg-purple-950/40 border-purple-500/70 shadow-md ring-1 ring-purple-500/30'
                    : 'bg-surface-100 hover:bg-surface-hover border-surface-border'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors shrink-0 mt-0.5 ${
                    isActive
                      ? 'bg-purple-600 border-purple-400 text-white'
                      : 'border-surface-border bg-surface-50'
                  }`}
                >
                  {isActive && <Check className="w-3.5 h-3.5" />}
                </div>

                <div className="flex-1">
                  <div className="font-semibold text-xs text-slate-100">{cond.label}</div>
                  <div className="text-[10px] text-slate-400 leading-tight mt-0.5">{cond.desc}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-surface-border flex items-center justify-between bg-surface-100/30">
          <button
            onClick={handleClearAll}
            className="text-xs text-slate-400 hover:text-red-400 transition-colors font-medium px-2 py-1"
          >
            Clear All Conditions
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
