import React from 'react';
import { Sparkles, Clock, Target, Dices, BookOpen, Edit3, Trash2 } from 'lucide-react';
import { SpellEntity } from '../../types/spell';
import { useApp } from '../../context/AppContext';
import { TokenAvatar } from '../common/TokenAvatar';
import { BookmarkButton } from '../bookmarks/BookmarkButton';

interface SpellCardProps {
  spell: SpellEntity;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const SpellCard: React.FC<SpellCardProps> = ({ spell, onEdit, onDelete }) => {
  const { rollCustomFormula } = useApp();

  const handleRollDamage = (formula: string) => {
    rollCustomFormula(formula, undefined, `${spell.name} (Spell Damage/Effect)`);
  };

  const getSchoolColor = (school: string) => {
    switch (school.toLowerCase()) {
      case 'evocation': return 'text-red-400 border-red-500/40 bg-red-950/30';
      case 'abjuration': return 'text-blue-400 border-blue-500/40 bg-blue-950/30';
      case 'conjuration': return 'text-yellow-400 border-yellow-500/40 bg-yellow-950/30';
      case 'divination': return 'text-purple-400 border-purple-500/40 bg-purple-950/30';
      case 'enchantment': return 'text-pink-400 border-pink-500/40 bg-pink-950/30';
      case 'illusion': return 'text-cyan-400 border-cyan-500/40 bg-cyan-950/30';
      case 'necromancy': return 'text-emerald-400 border-emerald-500/40 bg-emerald-950/30';
      case 'transmutation': return 'text-amber-400 border-amber-500/40 bg-amber-950/30';
      default: return 'text-slate-300 border-slate-700 bg-slate-900/30';
    }
  };

  return (
    <div className="bg-[#121720] border border-surface-border rounded-xl p-5 shadow-2xl space-y-4 max-w-2xl select-text overflow-hidden">
      {/* Spell Artwork Showcase */}
      {spell.imageUrl && (
        <div className="relative -mx-5 -mt-5 mb-4 overflow-hidden border-b border-surface-border bg-[#080b10] group">
          {/* Ambient blurred backdrop */}
          <img
            src={spell.imageUrl}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover filter blur-2xl opacity-30 scale-110 pointer-events-none"
          />
          <div className="relative h-56 sm:h-64 w-full flex items-center justify-center p-3">
            <img
              src={spell.imageUrl}
              alt={spell.name}
              className="max-h-full max-w-full object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.85)] group-hover:scale-[1.02] transition-transform duration-300"
            />
          </div>
          {/* Bottom gradient fade */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#121720] via-[#121720]/80 to-transparent pointer-events-none" />
        </div>
      )}

      {/* Header */}
      <div className="border-b border-surface-border pb-3 flex items-start justify-between">
        <div>
          <h2 className="font-serif text-2xl font-bold text-slate-100">{spell.name}</h2>
          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
            <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${getSchoolColor(spell.school)}`}>
              {spell.level === 0 ? 'Cantrip' : `Level ${spell.level}`} · {spell.school}
            </span>
            {spell.element && spell.element !== 'none' && (
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-surface-50 border border-surface-border text-slate-200 capitalize">
                {spell.element === 'fire' ? '🔥 Fire' :
                 spell.element === 'cold' ? '❄️ Cold' :
                 spell.element === 'lightning' ? '⚡ Lightning' :
                 spell.element === 'thunder' ? '💥 Thunder' :
                 spell.element === 'radiant' ? '✨ Radiant' :
                 spell.element === 'necrotic' ? '💀 Necrotic' :
                 spell.element === 'acid' ? '🧪 Acid' :
                 spell.element === 'poison' ? '☠️ Poison' :
                 spell.element === 'force' ? '🟣 Force' :
                 spell.element === 'psychic' ? '🧠 Psychic' : spell.element}
              </span>
            )}
            {spell.aoe && (
              <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-cyan-950/80 border border-cyan-700 text-cyan-300">
                📐 {spell.aoe.sizeFeet} ft. {spell.aoe.shape.toUpperCase()}
              </span>
            )}
            {spell.ritual && (
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-800 font-bold">
                RITUAL
              </span>
            )}
            {spell.concentration && (
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-950 text-amber-300 border border-amber-800 font-bold">
                CONCENTRATION
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <BookmarkButton
            type="spell"
            targetId={spell.id}
            title={spell.name}
            subtitle={`${spell.level === 0 ? 'Cantrip' : `Level ${spell.level} Spell`} • ${spell.school}`}
            category="Spell"
            imageUrl={spell.imageUrl}
            showText
            size="md"
          />

          {onEdit && (
            <button
              onClick={onEdit}
              className="p-1.5 bg-surface-50 hover:bg-surface-hover text-slate-300 rounded border border-surface-border"
              title="Edit spell"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          )}

          {onDelete && (
            <button
              onClick={onDelete}
              className="p-1.5 bg-surface-50 hover:bg-red-950 text-slate-400 hover:text-red-400 rounded border border-surface-border"
              title="Delete spell"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Token Badge */}
          <TokenAvatar
            name={spell.name}
            imageUrl={spell.imageUrl}
            type="spell"
            size="lg"
            allowZoom={true}
          />
        </div>
      </div>

      {/* Quick Specs Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-surface-50 p-3 rounded-lg border border-surface-border">
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase">School & Level</div>
          <div className="font-semibold text-slate-200 mt-0.5">
            {spell.level === 0 ? 'Cantrip' : `Level ${spell.level}`} · {spell.school}
          </div>
        </div>
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase">Element / Type</div>
          <div className="font-semibold text-slate-200 mt-0.5 capitalize">
            {spell.element && spell.element !== 'none' ? spell.element : 'Non-elemental'}
          </div>
        </div>
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase">Shape / AOE</div>
          <div className="font-semibold text-slate-200 mt-0.5">
            {spell.aoe ? `${spell.aoe.sizeFeet} ft. ${spell.aoe.shape}` : (spell.shape && spell.shape !== 'none' ? spell.shape : 'Single Target')}
          </div>
        </div>
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase">Range</div>
          <div className="font-semibold text-slate-200 mt-0.5">{spell.range}</div>
        </div>
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase">Casting Time</div>
          <div className="font-semibold text-slate-200 mt-0.5">{spell.castingTime}</div>
        </div>
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase">Components</div>
          <div className="font-semibold text-slate-200 mt-0.5">
            {[
              spell.components.verbal && 'V',
              spell.components.somatic && 'S',
              spell.components.material && 'M',
            ].filter(Boolean).join(', ')}
          </div>
        </div>
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase">Duration</div>
          <div className="font-semibold text-slate-200 mt-0.5">{spell.duration}</div>
        </div>
        <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase">Concentration</div>
          <div className="font-semibold text-slate-200 mt-0.5">
            {spell.concentration ? 'Yes (Con.)' : 'No'}
          </div>
        </div>
      </div>

      {/* Material Cost Note */}
      {spell.components.materialCost && (
        <div className="text-xs text-amber-300/90 italic bg-surface-50/50 p-2.5 rounded border border-surface-border">
          <strong>Material Component:</strong> {spell.components.materialCost}
        </div>
      )}

      {/* Description */}
      <div className="text-xs text-slate-300 leading-relaxed font-sans space-y-2 whitespace-pre-line">
        {spell.description}
      </div>

      {/* At Higher Levels */}
      {spell.higherLevels && (
        <div className="p-3 rounded-lg bg-surface-50 border border-surface-border text-xs space-y-1">
          <strong className="text-amber-400 font-serif">At Higher Levels:</strong>
          <p className="text-slate-300 leading-relaxed">{spell.higherLevels}</p>
        </div>
      )}

      {/* Classes */}
      {spell.classes && spell.classes.length > 0 && (
        <div className="pt-2 border-t border-surface-border flex items-center space-x-2 text-xs text-slate-400">
          <BookOpen className="w-3.5 h-3.5 text-slate-500" />
          <span><strong>Classes:</strong> {spell.classes.join(', ')}</span>
        </div>
      )}
    </div>
  );
};
