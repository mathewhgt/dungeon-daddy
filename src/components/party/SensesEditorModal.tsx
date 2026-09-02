import React, { useState } from 'react';
import { 
  X, 
  Eye, 
  Sun, 
  Moon, 
  Sparkles, 
  Activity, 
  Compass, 
  Save 
} from 'lucide-react';
import { PlayerEntity } from '../../types/player';
import { useApp } from '../../context/AppContext';

interface SensesEditorModalProps {
  player: PlayerEntity;
  onClose: () => void;
  onSave?: (updated: PlayerEntity) => void;
}

export const SensesEditorModal: React.FC<SensesEditorModalProps> = ({
  player,
  onClose,
  onSave,
}) => {
  const { savePlayer, db, saveMap, showToast } = useApp();

  // Determine racial default darkvision fallback if sensesConfig isn't explicitly defined yet
  const defaultDarkvision = 
    player.sensesConfig?.darkvision ?? 
    (player.race?.toLowerCase().includes('elf') || 
     player.race?.toLowerCase().includes('dwarf') || 
     player.race?.toLowerCase().includes('tiefling') || 
     player.race?.toLowerCase().includes('gnome') || 
     player.race?.toLowerCase().includes('half-orc') || 
     player.race?.toLowerCase().includes('orc') ? 60 : 0);

  const [normalSight, setNormalSight] = useState<number>(player.sensesConfig?.normalSight ?? 60);
  const [darkvision, setDarkvision] = useState<number>(defaultDarkvision);
  const [blindsight, setBlindsight] = useState<number>(player.sensesConfig?.blindsight ?? 0);
  const [truesight, setTruesight] = useState<number>(player.sensesConfig?.truesight ?? 0);
  const [tremorsense, setTremorsense] = useState<number>(player.sensesConfig?.tremorsense ?? 0);

  const handleSave = () => {
    const sensesConfig = {
      normalSight: Math.max(0, normalSight || 60),
      darkvision: Math.max(0, darkvision || 0),
      blindsight: Math.max(0, blindsight || 0),
      truesight: Math.max(0, truesight || 0),
      tremorsense: Math.max(0, tremorsense || 0),
    };

    const updatedPlayer: PlayerEntity = {
      ...player,
      sensesConfig,
    };

    savePlayer(updatedPlayer);

    // Sync vision to any existing tokens placed on active battle maps
    try {
      db.maps.forEach((m) => {
        let mapModified = false;
        const updatedTokens = m.tokens.map((t) => {
          if (t.entityId === player.id) {
            mapModified = true;
            return {
              ...t,
              senses: {
                normalSight: sensesConfig.normalSight,
                darkvision: sensesConfig.darkvision,
                blindsight: sensesConfig.blindsight,
                truesight: sensesConfig.truesight,
                tremorsense: sensesConfig.tremorsense,
              },
            };
          }
          return t;
        });

        if (mapModified) {
          saveMap({
            ...m,
            tokens: updatedTokens,
          });
        }
      });
    } catch (_) {}

    if (onSave) {
      onSave(updatedPlayer);
    }

    showToast(`Updated vision & senses for ${player.name}`);
    onClose();
  };

  const visionOptions = [
    {
      id: 'darkvision',
      label: 'Darkvision',
      icon: Moon,
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/10',
      borderColor: 'border-indigo-500/30',
      value: darkvision,
      setValue: setDarkvision,
      desc: 'Can see in dim light as if it were bright light, and in darkness as if it were dim light (in shades of gray).',
      presets: [0, 60, 90, 120, 150],
      sourceHint: 'Common: 60 ft. (Dwarf/Elf/Tiefling), 120 ft. (Drow/Deep Gnome/Devil\'s Sight/Goggles of Night)',
    },
    {
      id: 'normalSight',
      label: 'Normal Sight',
      icon: Sun,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
      value: normalSight,
      setValue: setNormalSight,
      desc: 'Standard vision distance in bright light or illuminated conditions.',
      presets: [30, 60, 120],
      sourceHint: 'Standard default: 60 ft. (or larger outdoors)',
    },
    {
      id: 'blindsight',
      label: 'Blindsight',
      icon: Activity,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30',
      value: blindsight,
      setValue: setBlindsight,
      desc: 'Perceive surroundings without relying on sight, detecting invisible creatures and navigating pitch darkness.',
      presets: [0, 10, 30, 60],
      sourceHint: 'Common: 10 ft. (Blind Fighting fighting style), 30-60 ft. (Echolocation, magical boons)',
    },
    {
      id: 'truesight',
      label: 'Truesight',
      icon: Sparkles,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30',
      value: truesight,
      setValue: setTruesight,
      desc: 'See in normal & magical darkness, see invisible creatures/objects, automatically detect visual illusions and true forms.',
      presets: [0, 30, 60, 120],
      sourceHint: 'Common: True Seeing spell (120 ft.), Boon of Truesight (60 ft.), legendary artifacts',
    },
    {
      id: 'tremorsense',
      label: 'Tremorsense',
      icon: Compass,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/30',
      value: tremorsense,
      setValue: setTremorsense,
      desc: 'Detect and pinpoint vibrations in the ground or stone, locating creatures in contact with the same surface.',
      presets: [0, 15, 30, 60],
      sourceHint: 'Common: Earth spells, wildshapes, burrowing boons, magical stone resonance',
    },
  ];

  // Active Senses Summary String
  const activeSensesList: string[] = [];
  if (normalSight > 0) activeSensesList.push(`Sight ${normalSight} ft.`);
  if (darkvision > 0) activeSensesList.push(`Darkvision ${darkvision} ft.`);
  if (blindsight > 0) activeSensesList.push(`Blindsight ${blindsight} ft.`);
  if (truesight > 0) activeSensesList.push(`Truesight ${truesight} ft.`);
  if (tremorsense > 0) activeSensesList.push(`Tremorsense ${tremorsense} ft.`);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 select-none">
      <div className="bg-[#121720] border border-surface-border rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-scaleUp max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-surface-border flex items-center justify-between bg-surface-100/60">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-base font-bold text-slate-100 flex items-center space-x-2">
                <span>Vision & Senses: {player.name}</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Configure sensory perception, magical sight, and darkvision ranges.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-surface-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Active Senses Summary Banner */}
        <div className="px-5 py-2.5 bg-surface-50 border-b border-surface-border flex items-center justify-between flex-wrap gap-2 text-xs">
          <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
            Active Vision:
          </span>
          <div className="flex items-center flex-wrap gap-1.5 font-mono text-xs">
            {activeSensesList.map((sense, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md bg-surface-100 border border-surface-border text-cyan-300 font-bold"
              >
                {sense}
              </span>
            ))}
          </div>
        </div>

        {/* Vision Types Form */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {visionOptions.map((opt) => {
            const Icon = opt.icon;
            const isActive = opt.value > 0;

            return (
              <div
                key={opt.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  isActive
                    ? 'bg-surface-100/90 border-surface-border shadow-sm'
                    : 'bg-surface-50/50 border-surface-border/50 opacity-80'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center space-x-2.5">
                    <div
                      className={`w-8 h-8 rounded-lg ${opt.bgColor} border ${opt.borderColor} ${opt.color} flex items-center justify-center shrink-0`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-serif font-bold text-sm text-slate-100">
                          {opt.label}
                        </span>
                        {isActive ? (
                          <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold">
                            {opt.value} ft.
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.2 rounded bg-surface-200 text-slate-400 text-[10px] font-mono">
                            Disabled (0 ft.)
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug mt-0.5">
                        {opt.desc}
                      </p>
                    </div>
                  </div>

                  {/* Range Input Box */}
                  <div className="flex items-center space-x-1 shrink-0">
                    <input
                      type="number"
                      min={0}
                      max={1000}
                      step={5}
                      value={opt.value}
                      onChange={(e) => opt.setValue(Math.max(0, parseInt(e.target.value, 10) || 0))}
                      className="w-16 px-2 py-1 bg-surface-50 border border-surface-border rounded-lg text-center font-mono font-bold text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                    />
                    <span className="text-xs text-slate-500 font-mono">ft.</span>
                  </div>
                </div>

                {/* Quick Range Presets */}
                <div className="mt-3 pt-2 border-t border-surface-border/60 flex items-center justify-between flex-wrap gap-2">
                  <div className="text-[10px] text-slate-500 truncate max-w-[240px]">
                    {opt.sourceHint}
                  </div>

                  <div className="flex items-center space-x-1">
                    <span className="text-[10px] text-slate-500 font-semibold mr-1">Presets:</span>
                    {opt.presets.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => opt.setValue(preset)}
                        className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                          opt.value === preset
                            ? 'bg-cyan-600 text-white font-bold shadow-sm'
                            : 'bg-surface-50 hover:bg-surface-hover border border-surface-border text-slate-300'
                        }`}
                      >
                        {preset === 0 ? 'None' : `${preset}ft`}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-surface-border bg-surface-100/60 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-surface-50 hover:bg-surface-hover border border-surface-border text-slate-300 text-xs font-semibold transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center space-x-2 shadow-lg shadow-cyan-600/30 transition-all hover:scale-[1.02] active:scale-95"
          >
            <Save className="w-4 h-4" />
            <span>Save Vision & Senses</span>
          </button>
        </div>
      </div>
    </div>
  );
};
