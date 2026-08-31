import React from 'react';
import { Check, X, Skull, ShieldCheck, Dices, Heart } from 'lucide-react';

export interface DeathSaves {
  successes: number;
  failures: number;
}

interface DeathSavesTrackerProps {
  saves?: DeathSaves;
  onChange?: (saves: DeathSaves) => void;
  onRoll?: () => void;
  readOnly?: boolean;
  compact?: boolean;
  lastHealAmount?: number;
  characterName?: string;
}

export const DeathSavesTracker: React.FC<DeathSavesTrackerProps> = ({
  saves = { successes: 0, failures: 0 },
  onChange,
  onRoll,
  readOnly = false,
  compact = false,
  lastHealAmount,
  characterName,
}) => {
  const successes = Math.max(0, Math.min(3, saves.successes || 0));
  const failures = Math.max(0, Math.min(3, saves.failures || 0));

  const isStabilized = successes >= 3;
  const isDead = failures >= 3;

  const toggleSuccess = (index: number) => {
    if (readOnly || !onChange) return;
    const newSuccesses = successes === index + 1 ? index : index + 1;
    onChange({ successes: newSuccesses, failures });
  };

  const toggleFailure = (index: number) => {
    if (readOnly || !onChange) return;
    const newFailures = failures === index + 1 ? index : index + 1;
    onChange({ successes, failures: newFailures });
  };

  if (compact) {
    return (
      <div className="flex items-center space-x-2 text-xs select-none">
        {/* Successes */}
        <div className="flex items-center space-x-1">
          <span className="text-[10px] font-bold text-emerald-400">S:</span>
          {[0, 1, 2].map((idx) => (
            <button
              key={`succ-${idx}`}
              type="button"
              disabled={readOnly}
              onClick={(e) => {
                e.stopPropagation();
                toggleSuccess(idx);
              }}
              className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-all ${
                idx < successes
                  ? 'bg-emerald-500 border-emerald-400 text-slate-950 shadow-xs shadow-emerald-500/50'
                  : 'bg-surface-50 border-emerald-900/60 hover:border-emerald-500/60 text-transparent'
              }`}
              title={`Success ${idx + 1}`}
            >
              <Check className="w-2.5 h-2.5 stroke-[3]" />
            </button>
          ))}
        </div>

        {/* Failures */}
        <div className="flex items-center space-x-1">
          <span className="text-[10px] font-bold text-red-400">F:</span>
          {[0, 1, 2].map((idx) => (
            <button
              key={`fail-${idx}`}
              type="button"
              disabled={readOnly}
              onClick={(e) => {
                e.stopPropagation();
                toggleFailure(idx);
              }}
              className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-all ${
                idx < failures
                  ? 'bg-red-600 border-red-400 text-white shadow-xs shadow-red-500/50'
                  : 'bg-surface-50 border-red-900/60 hover:border-red-500/60 text-transparent'
              }`}
              title={`Failure ${idx + 1}`}
            >
              <X className="w-2.5 h-2.5 stroke-[3]" />
            </button>
          ))}
        </div>

        {isStabilized && (
          <span className="px-1.5 py-0.2 rounded bg-emerald-950 border border-emerald-700 text-emerald-300 font-bold text-[9px]">
            STABLE
          </span>
        )}
        {isDead && (
          <span className="px-1.5 py-0.2 rounded bg-red-950 border border-red-700 text-red-300 font-bold text-[9px] flex items-center space-x-0.5">
            <Skull className="w-2.5 h-2.5" />
            <span>DEAD</span>
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="p-2 rounded-xl bg-[#0b0f15]/90 border border-red-900/40 shadow-inner space-y-2 select-none">
      {/* Title & Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1.5">
          <Skull className="w-3.5 h-3.5 text-red-400" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-200">
            Death Saving Throws
          </span>
        </div>

        {isStabilized ? (
          <span className="px-2 py-0.5 rounded-md bg-emerald-950 border border-emerald-600 text-emerald-300 text-[10px] font-bold flex items-center space-x-1 animate-pulse">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Stabilized</span>
          </span>
        ) : isDead ? (
          <span className="px-2 py-0.5 rounded-md bg-red-950 border border-red-600 text-red-300 text-[10px] font-bold flex items-center space-x-1 animate-pulse">
            <Skull className="w-3 h-3 text-red-400" />
            <span>Dead</span>
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded-md bg-amber-950/60 border border-amber-700/60 text-amber-300 text-[10px] font-bold">
            Unconscious (0 HP)
          </span>
        )}
      </div>

      {/* Checkboxes Grid */}
      <div className="grid grid-cols-2 gap-2 pt-0.5">
        {/* Successes */}
        <div className="p-1.5 rounded-lg bg-emerald-950/25 border border-emerald-800/30 flex items-center justify-between">
          <span className="text-[11px] font-bold text-emerald-400 flex items-center space-x-1">
            <Check className="w-3 h-3 text-emerald-400" />
            <span>Successes</span>
          </span>
          <div className="flex items-center space-x-1.5">
            {[0, 1, 2].map((idx) => (
              <button
                key={`succ-${idx}`}
                type="button"
                disabled={readOnly}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSuccess(idx);
                }}
                className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                  idx < successes
                    ? 'bg-emerald-500 border-emerald-300 text-slate-950 font-black shadow-sm shadow-emerald-500/50'
                    : 'bg-surface-50 border-emerald-900/80 hover:border-emerald-500 text-transparent cursor-pointer'
                }`}
                title={`Toggle Success ${idx + 1}`}
              >
                <Check className="w-3 h-3 stroke-[3]" />
              </button>
            ))}
          </div>
        </div>

        {/* Failures */}
        <div className="p-1.5 rounded-lg bg-red-950/25 border border-red-800/30 flex items-center justify-between">
          <span className="text-[11px] font-bold text-red-400 flex items-center space-x-1">
            <X className="w-3 h-3 text-red-400" />
            <span>Failures</span>
          </span>
          <div className="flex items-center space-x-1.5">
            {[0, 1, 2].map((idx) => (
              <button
                key={`fail-${idx}`}
                type="button"
                disabled={readOnly}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFailure(idx);
                }}
                className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                  idx < failures
                    ? 'bg-red-600 border-red-300 text-white font-black shadow-sm shadow-red-500/50'
                    : 'bg-surface-50 border-red-900/80 hover:border-red-500 text-transparent cursor-pointer'
                }`}
                title={`Toggle Failure ${idx + 1}`}
              >
                <X className="w-3 h-3 stroke-[3]" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Roll Button & Recent Healing Notification */}
      <div className="flex items-center justify-between pt-1">
        {onRoll && !isStabilized && !isDead && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRoll();
            }}
            className="px-2.5 py-1 rounded-lg bg-red-900/40 hover:bg-red-800/60 border border-red-600/50 text-red-200 text-[11px] font-bold flex items-center space-x-1.5 transition-colors shadow-xs"
          >
            <Dices className="w-3.5 h-3.5 text-red-400" />
            <span>Roll Death Save (d20)</span>
          </button>
        )}

        {lastHealAmount !== undefined && lastHealAmount > 0 && (
          <div className="text-[10px] font-bold text-emerald-400 flex items-center space-x-1 ml-auto">
            <Heart className="w-3 h-3 text-emerald-400" />
            <span>Healed +{lastHealAmount} HP!</span>
          </div>
        )}
      </div>
    </div>
  );
};
