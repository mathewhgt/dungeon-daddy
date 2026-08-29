import React, { useState } from 'react';
import { X, Dices, Plus, Trash2, CheckCircle2, Sparkles } from 'lucide-react';

interface DcCheckModalProps {
  onClose: () => void;
  onInsert: (markdown: string) => void;
}

const PRESET_SKILLS = [
  'Wisdom (Perception)',
  'Intelligence (Investigation)',
  'Wisdom (Insight)',
  'Dexterity (Stealth)',
  'Dexterity (Acrobatics)',
  'Strength (Athletics)',
  'Dexterity (Sleight of Hand)',
  'Dexterity (Thieves\' Tools)',
  'Intelligence (Arcana)',
  'Intelligence (History)',
  'Intelligence (Nature)',
  'Intelligence (Religion)',
  'Wisdom (Animal Handling)',
  'Wisdom (Medicine)',
  'Wisdom (Survival)',
  'Charisma (Deception)',
  'Charisma (Intimidation)',
  'Charisma (Persuasion)',
  'Charisma (Performance)',
  'Constitution Saving Throw',
  'Dexterity Saving Throw',
  'Wisdom Saving Throw',
  'Strength Saving Throw',
  'Intelligence Saving Throw',
  'Charisma Saving Throw',
];

export const DcCheckModal: React.FC<DcCheckModalProps> = ({ onClose, onInsert }) => {
  const [skill, setSkill] = useState('Wisdom (Perception)');
  const [customSkill, setCustomSkill] = useState('');
  const [mode, setMode] = useState<'pass-fail' | 'tiered'>('pass-fail');
  const [singleDc, setSingleDc] = useState(15);
  const [successText, setSuccessText] = useState('The characters notice the hidden mechanism or secret details.');
  const [failureText, setFailureText] = useState('The characters fail to notice anything out of the ordinary.');

  // Tiered thresholds
  const [tiers, setTiers] = useState<Array<{ dc: number; outcome: string }>>([
    { dc: 10, outcome: 'Basic information: You notice faint scratch marks near the bookcase.' },
    { dc: 15, outcome: 'Detailed findings: You locate the hidden catch that slides the shelf open.' },
    { dc: 20, outcome: 'Exceptional discovery: You also find a concealed pouch with 50 gp and a scroll.' },
  ]);
  const [tieredFailText, setTieredFailText] = useState('The area appears completely mundane.');

  const handleAddTier = () => {
    const nextDc = tiers.length > 0 ? tiers[tiers.length - 1].dc + 5 : 15;
    setTiers([...tiers, { dc: nextDc, outcome: 'Additional outcome for this threshold...' }]);
  };

  const handleRemoveTier = (idx: number) => {
    setTiers(tiers.filter((_, i) => i !== idx));
  };

  const handleUpdateTier = (idx: number, field: 'dc' | 'outcome', val: any) => {
    const next = [...tiers];
    next[idx] = { ...next[idx], [field]: val };
    setTiers(next);
  };

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    const finalSkill = customSkill.trim() ? customSkill.trim() : skill;

    let md = '';
    if (mode === 'pass-fail') {
      md = `\n:::check skill="${finalSkill}" dc="${singleDc}"\n**Success (DC ${singleDc}+):** ${successText.trim()}\n**Failure (<${singleDc}):** ${failureText.trim()}\n:::\n`;
    } else {
      const sortedTiers = [...tiers].sort((a, b) => a.dc - b.dc);
      const dcList = sortedTiers.map((t) => t.dc).join(',');
      const tierLines = sortedTiers.map((t) => `**DC ${t.dc}+:** ${t.outcome.trim()}`).join('\n');
      const minDc = sortedTiers.length > 0 ? sortedTiers[0].dc : 10;
      md = `\n:::check skill="${finalSkill}" dc="${dcList}"\n${tierLines}\n**Failure (<${minDc}):** ${tieredFailText.trim()}\n:::\n`;
    }

    onInsert(md);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#121720] border border-surface-border rounded-2xl shadow-2xl w-full max-w-xl flex flex-col overflow-hidden animate-scaleUp">
        {/* Header */}
        <div className="p-4 border-b border-surface-border flex items-center justify-between bg-surface-100/60">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Dices className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-slate-100">Insert 5e Ability / Skill Check</h3>
              <p className="text-[11px] text-slate-400">Configure target DC thresholds, rollable mechanics, and outcomes.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleGenerate} className="p-5 overflow-y-auto space-y-4 max-h-[75vh] select-text">
          {/* Check Type / Skill */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Skill / Ability Check</label>
              <select
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
                className="w-full bg-surface-50 border border-surface-border rounded-lg px-2.5 py-1.5 text-xs text-amber-300 font-semibold focus:outline-none focus:border-amber-500"
              >
                {PRESET_SKILLS.map((s) => (
                  <option key={s} value={s}>
                    🎲 {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Custom Check Label (Optional)</label>
              <input
                type="text"
                value={customSkill}
                onChange={(e) => setCustomSkill(e.target.value)}
                placeholder="e.g. DC 15 Arcana (Runes)"
                className="w-full bg-surface-50 border border-surface-border rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Mode Switcher: Pass/Fail vs Tiered */}
          <div className="flex rounded-xl bg-surface-50 p-1 border border-surface-border text-xs font-semibold">
            <button
              type="button"
              onClick={() => setMode('pass-fail')}
              className={`flex-1 py-1.5 rounded-lg transition-colors flex items-center justify-center space-x-1.5 ${
                mode === 'pass-fail'
                  ? 'bg-amber-600 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Standard (Pass / Fail)</span>
            </button>

            <button
              type="button"
              onClick={() => setMode('tiered')}
              className={`flex-1 py-1.5 rounded-lg transition-colors flex items-center justify-center space-x-1.5 ${
                mode === 'tiered'
                  ? 'bg-amber-600 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Multi-Tiered Thresholds (DC 10 / 15 / 20)</span>
            </button>
          </div>

          {/* Mode 1: Pass / Fail */}
          {mode === 'pass-fail' ? (
            <div className="space-y-3 p-3.5 rounded-xl bg-surface-50 border border-surface-border">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Target Difficulty Class (DC)</span>
                  <span className="text-amber-400 font-mono font-bold text-xs">DC {singleDc}</span>
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min={5}
                    max={30}
                    step={1}
                    value={singleDc}
                    onChange={(e) => setSingleDc(parseInt(e.target.value, 10))}
                    className="flex-1 accent-amber-500"
                  />
                  <input
                    type="number"
                    value={singleDc}
                    onChange={(e) => setSingleDc(parseInt(e.target.value, 10) || 10)}
                    className="w-16 bg-surface-100 border border-surface-border rounded px-2 py-1 text-xs text-center font-bold text-amber-300"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-emerald-400">Success Outcome (DC {singleDc}+)</label>
                <textarea
                  required
                  rows={2}
                  value={successText}
                  onChange={(e) => setSuccessText(e.target.value)}
                  placeholder="What happens on success..."
                  className="w-full bg-surface-100 border border-surface-border rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-red-400">Failure Outcome (&lt;{singleDc})</label>
                <textarea
                  required
                  rows={2}
                  value={failureText}
                  onChange={(e) => setFailureText(e.target.value)}
                  placeholder="What happens on failure..."
                  className="w-full bg-surface-100 border border-surface-border rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>
          ) : (
            /* Mode 2: Multi-Tiered */
            <div className="space-y-3 p-3.5 rounded-xl bg-surface-50 border border-surface-border">
              <div className="flex items-center justify-between border-b border-surface-border pb-2">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Tiered Thresholds ({tiers.length})
                </span>
                <button
                  type="button"
                  onClick={handleAddTier}
                  className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Tier</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {tiers.map((t, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-surface-100 border border-surface-border space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-[11px] font-bold text-amber-400">DC Threshold:</span>
                        <input
                          type="number"
                          min={5}
                          max={35}
                          value={t.dc}
                          onChange={(e) => handleUpdateTier(idx, 'dc', parseInt(e.target.value, 10) || 10)}
                          className="w-16 bg-surface-50 border border-surface-border rounded px-2 py-0.5 text-xs text-center font-bold text-amber-300"
                        />
                        <span className="text-[11px] text-slate-400 font-mono">+</span>
                      </div>
                      {tiers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTier(idx)}
                          className="text-slate-400 hover:text-red-400 p-1"
                          title="Remove tier"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <textarea
                      rows={2}
                      value={t.outcome}
                      onChange={(e) => handleUpdateTier(idx, 'outcome', e.target.value)}
                      placeholder={`Outcome if check is ${t.dc} or higher...`}
                      className="w-full bg-surface-50 border border-surface-border rounded-lg p-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-1 pt-1">
                <label className="text-xs font-semibold text-red-400">Failure Outcome (Below lowest DC)</label>
                <textarea
                  rows={2}
                  value={tieredFailText}
                  onChange={(e) => setTieredFailText(e.target.value)}
                  placeholder="What happens if the roll does not meet any threshold..."
                  className="w-full bg-surface-100 border border-surface-border rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-2 border-t border-surface-border flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg bg-surface-50 text-slate-300 text-xs font-semibold hover:bg-surface-hover"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow-md"
            >
              Insert DC Check
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
