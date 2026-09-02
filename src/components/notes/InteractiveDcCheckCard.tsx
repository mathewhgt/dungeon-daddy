import React, { useState } from 'react';
import { Dices, CheckCircle2, XCircle, Sparkles, RefreshCw } from 'lucide-react';

interface InteractiveDcCheckCardProps {
  skill: string;
  dcStr: string;
  rawLines: string[];
  renderInline?: (text: string) => React.ReactNode;
}

export const InteractiveDcCheckCard: React.FC<InteractiveDcCheckCardProps> = ({
  skill,
  dcStr,
  rawLines = [],
  renderInline,
}) => {
  const [roll, setRoll] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);

  const safeDcStr = typeof dcStr === 'string' ? dcStr : '15';
  const dcs = safeDcStr
    .split(',')
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !isNaN(n))
    .sort((a, b) => a - b);

  const primaryDc = dcs.length > 0 ? dcs[0] : 15;

  const handleRoll = () => {
    setIsRolling(true);
    let count = 0;
    const interval = setInterval(() => {
      setRoll(Math.floor(Math.random() * 20) + 1);
      count++;
      if (count > 6) {
        clearInterval(interval);
        const finalRoll = Math.floor(Math.random() * 20) + 1;
        setRoll(finalRoll);
        setIsRolling(false);
      }
    }, 40);
  };

  // Determine outcome tier based on roll safely
  const getOutcomeStatus = (line: any): { isHighlighted: boolean; isSuccess: boolean } => {
    if (roll === null) return { isHighlighted: false, isSuccess: false };
    const str = typeof line === 'string' ? line : '';
    const lower = str.toLowerCase();

    // Check for "DC XX+:" pattern
    const dcMatch = str.match(/DC\s*(\d+)\+/i);
    if (dcMatch) {
      const threshold = parseInt(dcMatch[1], 10);
      const qualified = dcs.filter((d) => roll >= d);
      const maxQualified = qualified.length > 0 ? Math.max(...qualified) : -1;
      return {
        isHighlighted: maxQualified === threshold,
        isSuccess: true,
      };
    }

    // Check for "Success (DC XX+):" pattern
    if (lower.includes('success')) {
      return {
        isHighlighted: roll >= primaryDc,
        isSuccess: true,
      };
    }

    // Check for "Failure (<XX):" pattern
    if (lower.includes('failure') || lower.includes('<')) {
      const minDc = dcs.length > 0 ? dcs[0] : primaryDc;
      return {
        isHighlighted: roll < minDc,
        isSuccess: false,
      };
    }

    return { isHighlighted: false, isSuccess: false };
  };

  return (
    <div className="my-4 rounded-2xl bg-[#121824]/95 border border-amber-500/50 shadow-xl overflow-hidden select-text animate-fadeIn">
      {/* Card Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-amber-950/60 via-surface-100 to-amber-950/40 border-b border-surface-border flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-sm">
            <Dices className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-scalyCaps uppercase tracking-wider text-amber-400 font-bold">
              5e Ability / Skill Check
            </div>
            <div className="font-serif font-bold text-sm text-slate-100 flex items-center space-x-2">
              <span>{skill || 'Ability Check'}</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-scaly font-bold">
                {dcs.length > 1 ? `DC ${dcs.join(' / ')}` : `DC ${primaryDc}`}
              </span>
            </div>
          </div>
        </div>

        {/* Interactive Roll Button & Result */}
        <div className="flex items-center space-x-2">
          {roll !== null && (
            <div
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border animate-scaleUp ${
                roll >= (dcs[0] || 15)
                  ? 'bg-emerald-950/90 border-emerald-500 text-emerald-300 shadow-sm shadow-emerald-900'
                  : 'bg-red-950/90 border-red-500 text-red-300 shadow-sm shadow-red-900'
              }`}
            >
              Result: <span className="text-sm font-black">{roll}</span>
              {roll === 20 && <span className="ml-1 text-amber-300">🌟 Nat 20!</span>}
              {roll === 1 && <span className="ml-1 text-red-400">💀 Nat 1!</span>}
            </div>
          )}

          <button
            type="button"
            onClick={handleRoll}
            disabled={isRolling}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRolling ? 'animate-spin' : ''}`} />
            <span>{roll === null ? 'Roll d20' : 'Re-roll'}</span>
          </button>
        </div>
      </div>

      {/* Outcomes List */}
      <div className="p-3.5 space-y-2 text-xs">
        {rawLines.map((line, idx) => {
          const str = typeof line === 'string' ? line : String(line || '');
          if (!str.trim()) return <div key={idx} className="h-1" />;
          const { isHighlighted, isSuccess } = getOutcomeStatus(str);
          const isFail = str.toLowerCase().includes('failure') || str.includes('<');

          return (
            <div
              key={idx}
              className={`p-2.5 rounded-xl border transition-all leading-relaxed ${
                isHighlighted
                  ? isSuccess
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-100 shadow-md shadow-emerald-950 scale-[1.01]'
                    : 'bg-red-950/60 border-red-500 text-red-100 shadow-md shadow-red-950 scale-[1.01]'
                  : isFail
                  ? 'bg-surface-50/60 border-surface-border text-slate-300'
                  : 'bg-surface-50/90 border-surface-border text-slate-200'
              }`}
            >
              <div className="flex items-start space-x-2">
                <div className="mt-0.5 shrink-0">
                  {isFail ? (
                    <XCircle className={`w-3.5 h-3.5 ${isHighlighted ? 'text-red-400 font-bold' : 'text-slate-500'}`} />
                  ) : (
                    <CheckCircle2 className={`w-3.5 h-3.5 ${isHighlighted ? 'text-emerald-400 font-bold' : 'text-amber-400/80'}`} />
                  )}
                </div>
                <div className="flex-1 min-w-0 font-medium">
                  {renderInline ? renderInline(str) : str}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
