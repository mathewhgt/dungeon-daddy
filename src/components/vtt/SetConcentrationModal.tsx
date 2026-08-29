import React, { useState } from 'react';
import { Sparkles, X, Check, Search, ShieldAlert } from 'lucide-react';
import { MapToken } from '../../types/map';
import { useApp } from '../../context/AppContext';

interface SetConcentrationModalProps {
  token: MapToken;
  onClose: () => void;
  onSaveConcentration: (spellName: string | null) => void;
}

const COMMON_CONCENTRATION_SPELLS = [
  'Bless',
  'Bane',
  'Haste',
  'Invisibility',
  'Spirit Guardians',
  'Hold Person',
  'Fly',
  'Hunter\'s Mark',
  'Hex',
  'Faerie Fire',
  'Web',
  'Darkness',
  'Moonbeam',
  'Hypnotic Pattern',
  'Polymorph',
  'Greater Invisibility',
  'Banishment',
  'Wall of Fire',
];

export const SetConcentrationModal: React.FC<SetConcentrationModalProps> = ({
  token,
  onClose,
  onSaveConcentration,
}) => {
  const { db } = useApp();
  const [search, setSearch] = useState('');
  const [customSpell, setCustomSpell] = useState(token.concentratingOn?.spellName || '');

  // Filter SRD spells that have concentration: true
  const srdConcentrationSpells = (db.spells || [])
    .filter((s) => s.concentration)
    .map((s) => s.name);

  const availableSpells = Array.from(
    new Set([...COMMON_CONCENTRATION_SPELLS, ...srdConcentrationSpells])
  ).filter((name) => name.toLowerCase().includes(search.toLowerCase()));

  const handleSelectSpell = (name: string) => {
    setCustomSpell(name);
  };

  const handleApply = () => {
    if (!customSpell.trim()) {
      onSaveConcentration(null);
    } else {
      onSaveConcentration(customSpell.trim());
    }
    onClose();
  };

  const handleDrop = () => {
    onSaveConcentration(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 select-none animate-fadeIn">
      <div className="bg-[#121720] border border-cyan-500/60 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-scaleUp">
        {/* Header */}
        <div className="p-4 bg-cyan-950/40 border-b border-cyan-500/30 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
              <Sparkles className="w-5 h-5 animate-spinSlow" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm text-slate-100">
                5e Spell Concentration [C]
              </h3>
              <div className="text-[11px] text-cyan-300 font-mono">
                Target: {token.name}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Current Concentration Status */}
          {token.concentratingOn ? (
            <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-800 flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase font-bold text-cyan-400">Currently Concentrating On</div>
                <div className="font-serif font-bold text-sm text-slate-100">{token.concentratingOn.spellName}</div>
              </div>
              <button
                type="button"
                onClick={handleDrop}
                className="px-3 py-1.5 rounded-lg bg-red-950/70 hover:bg-red-900 border border-red-800 text-red-200 text-xs font-bold transition-colors"
              >
                Drop [C]
              </button>
            </div>
          ) : (
            <div className="text-xs text-slate-400">
              Select or type the spell <strong className="text-slate-200">{token.name}</strong> is maintaining concentration on.
            </div>
          )}

          {/* Spell Input */}
          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-400 uppercase font-bold">Spell Name</label>
            <div className="relative">
              <input
                type="text"
                value={customSpell}
                onChange={(e) => setCustomSpell(e.target.value)}
                placeholder="e.g. Bless, Haste, Invisibility..."
                className="w-full pl-3 pr-8 py-2 bg-surface-100 border border-surface-border rounded-xl text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-medium"
                autoFocus
              />
              {customSpell && (
                <button
                  onClick={() => setCustomSpell('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Quick Spell Search & Selection */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-bold">
              <span>Quick Pick Common 5e Spells</span>
              <span className="font-mono">{availableSpells.length} available</span>
            </div>

            <div className="relative mb-1.5">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter spells..."
                className="w-full pl-8 pr-3 py-1.5 bg-surface-50 border border-surface-border rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="max-h-36 overflow-y-auto grid grid-cols-2 gap-1 p-1 bg-surface-50/50 rounded-xl border border-surface-border">
              {availableSpells.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => handleSelectSpell(name)}
                  className={`px-2.5 py-1.5 rounded-lg text-left text-xs font-semibold truncate transition-colors ${
                    customSpell === name
                      ? 'bg-cyan-600 text-white font-bold'
                      : 'text-slate-300 hover:bg-surface-hover hover:text-cyan-300'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-2 flex items-center justify-between space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-surface-50 hover:bg-surface-hover text-slate-300 border border-surface-border text-xs font-semibold transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleApply}
              disabled={!customSpell.trim() && !token.concentratingOn}
              className="flex-1 py-2 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg flex items-center justify-center space-x-1.5 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>{customSpell.trim() ? `Set Concentration: ${customSpell.trim()}` : 'Save'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
