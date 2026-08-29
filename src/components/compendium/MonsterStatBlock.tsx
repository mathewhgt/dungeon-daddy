import React from 'react';
import { 
  Shield, 
  Heart, 
  Footprints, 
  Dices, 
  Sparkles, 
  Swords, 
  Edit3,
  Trash2,
  Plus,
  Tv
} from 'lucide-react';
import { MonsterEntity, MonsterAction, MonsterTrait } from '../../types/monster';
import { useApp } from '../../context/AppContext';
import { TokenAvatar } from '../common/TokenAvatar';

interface MonsterStatBlockProps {
  monster: MonsterEntity;
  onRollAction?: (actionName: string, attackBonus?: number, damageDice?: string, damageType?: string) => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onAddToEncounter?: () => void;
}

export const MonsterStatBlock: React.FC<MonsterStatBlockProps> = ({ 
  monster, 
  onRollAction,
  onEdit,
  onDelete,
  onAddToEncounter,
}) => {
  const { rollCustomFormula, db, projectMediaToDisplay } = useApp();
  const campaign = monster.campaignId ? db.campaigns.find((c) => c.id === monster.campaignId) : null;

  const handleRollAbility = (statName: string, value: number) => {
    const mod = Math.floor((value - 10) / 2);
    const formula = `1d20${mod >= 0 ? `+${mod}` : `${mod}`}`;
    rollCustomFormula(formula, undefined, `${monster.name} (${statName} check)`);
  };

  const handleActionClick = (action: MonsterAction) => {
    if (onRollAction) {
      onRollAction(action.name, action.attackBonus, action.damageDice, action.damageType);
      return;
    }

    if (action.attackBonus !== undefined) {
      const toHitFormula = `1d20+${action.attackBonus}`;
      const hitRes = rollCustomFormula(toHitFormula, undefined, `${monster.name} (${action.name} To Hit)`);

      if (action.damageDice) {
        rollCustomFormula(action.damageDice, { isCrit: hitRes.isCrit }, `${monster.name} (${action.name} Damage)`);
      }
    } else if (action.damageDice) {
      rollCustomFormula(action.damageDice, undefined, `${monster.name} (${action.name} Effect/Damage)`);
    }
  };

  const formatModifier = (score: number) => {
    const mod = Math.floor((score - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };

  return (
    <div className="bg-[#121720] border border-amber-900/40 rounded-xl p-5 shadow-2xl text-slate-200 font-sans space-y-4 max-w-2xl select-text relative overflow-hidden">
      {/* Monster Artwork Showcase */}
      {monster.avatarUrl && (
        <div className="relative -mx-5 -mt-5 mb-4 overflow-hidden border-b border-amber-900/40 bg-[#080b10] group">
          {/* Ambient blurred atmospheric backdrop */}
          <img
            src={monster.avatarUrl}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover filter blur-2xl opacity-30 scale-110 pointer-events-none"
          />
          <div className="relative h-64 sm:h-72 w-full flex items-center justify-center p-3">
            <img
              src={monster.avatarUrl}
              alt={monster.name}
              className="max-h-full max-w-full object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.85)] group-hover:scale-[1.02] transition-transform duration-300"
            />
          </div>
          {/* Bottom gradient fade into stat block */}
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#121720] via-[#121720]/80 to-transparent pointer-events-none" />
        </div>
      )}

      {/* Header */}
      <div className="border-b-2 border-amber-600/60 pb-3 flex items-start justify-between">
        <div>
          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
            <h2 className="font-serif text-2xl font-bold text-amber-500 tracking-wide">
              {monster.name}
            </h2>
            {monster.isNpc && (
              <span className="px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-700/80 text-amber-300 font-bold text-[10px] uppercase">
                👤 NPC
              </span>
            )}
            {campaign ? (
              <span className="px-2 py-0.5 rounded-full bg-indigo-950/80 border border-indigo-700/80 text-indigo-300 font-bold text-[10px]">
                🏰 {campaign.name}
              </span>
            ) : monster.isNpc ? (
              <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-400 font-medium text-[10px]">
                🌐 Global NPC
              </span>
            ) : null}
            {monster.npcRole && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-700/80 text-emerald-300 font-medium text-[10px]">
                🎭 {monster.npcRole}
              </span>
            )}
          </div>
          <div className="italic text-xs text-slate-400 mt-1 font-serif flex items-center space-x-3 flex-wrap">
            <span>{monster.size} {monster.monsterType}, {monster.alignment}</span>
            {monster.occupation && <span className="text-slate-300">💼 {monster.occupation}</span>}
            {monster.location && <span className="text-amber-400/90">📍 {monster.location}</span>}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {(monster.avatarUrl || monster.tokenUrl) && (
            <button
              onClick={() => {
                projectMediaToDisplay({
                  id: monster.id,
                  type: 'monster',
                  title: monster.name,
                  subtitle: `${monster.size} ${monster.monsterType}, ${monster.alignment}`,
                  imageUrl: monster.avatarUrl || monster.tokenUrl,
                  badge: monster.isNpc ? 'NPC' : `CR ${monster.challengeRating}`,
                });
              }}
              className="px-2.5 py-1 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/80 text-indigo-300 text-xs font-semibold rounded-lg flex items-center space-x-1"
              title="Project monster artwork to Player Display"
            >
              <Tv className="w-3.5 h-3.5 text-sky-400" />
              <span>Project Artwork</span>
            </button>
          )}

          {onAddToEncounter && (
            <button
              onClick={onAddToEncounter}
              className="px-2.5 py-1 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 text-xs font-semibold rounded-lg flex items-center space-x-1"
              title="Add to active encounter"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          )}

          {onEdit && (
            <button
              onClick={onEdit}
              className="p-1.5 bg-surface-50 hover:bg-surface-hover text-slate-300 rounded border border-surface-border"
              title="Edit monster"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          )}

          {onDelete && (
            <button
              onClick={onDelete}
              className="p-1.5 bg-surface-50 hover:bg-red-950 text-slate-400 hover:text-red-400 rounded border border-surface-border"
              title="Delete monster"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Circular VTT Token Badge */}
          <TokenAvatar
            name={monster.name}
            imageUrl={monster.avatarUrl}
            tokenUrl={monster.tokenUrl}
            type="monster"
            monsterType={monster.monsterType}
            size="lg"
            allowZoom={true}
          />
        </div>
      </div>

      {/* Basic Combat Stats */}
      <div className="space-y-1.5 text-xs text-amber-200/90 font-medium">
        <div className="flex items-center space-x-2">
          <Shield className="w-3.5 h-3.5 text-amber-500" />
          <span><strong>Armor Class:</strong> {monster.armorClass} {monster.armorDesc && `(${monster.armorDesc})`}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Heart className="w-3.5 h-3.5 text-red-500" />
          <span><strong>Hit Points:</strong> {monster.hitPoints} ({monster.hitDice})</span>
        </div>
        <div className="flex items-center space-x-2">
          <Footprints className="w-3.5 h-3.5 text-emerald-500" />
          <span><strong>Speed:</strong> {monster.speed}</span>
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-amber-600/60 via-amber-800/30 to-transparent" />

      {/* Ability Scores Bar */}
      <div className="grid grid-cols-6 gap-1 text-center bg-surface-50 p-2 rounded-lg border border-surface-border">
        {[
          { label: 'STR', val: monster.abilities.str },
          { label: 'DEX', val: monster.abilities.dex },
          { label: 'CON', val: monster.abilities.con },
          { label: 'INT', val: monster.abilities.int },
          { label: 'WIS', val: monster.abilities.wis },
          { label: 'CHA', val: monster.abilities.cha },
        ].map((item) => (
          <button
            key={item.label}
            onClick={() => handleRollAbility(item.label, item.val)}
            className="p-1 hover:bg-amber-500/20 rounded transition-colors group flex flex-col items-center"
            title={`Click to roll ${item.label} check (1d20${formatModifier(item.val)})`}
          >
            <span className="text-[10px] font-bold text-slate-400 group-hover:text-amber-400">{item.label}</span>
            <span className="font-mono text-xs font-bold text-slate-100">{item.val}</span>
            <span className="font-mono text-[10px] text-amber-500 font-bold">({formatModifier(item.val)})</span>
          </button>
        ))}
      </div>

      <div className="h-px bg-gradient-to-r from-amber-600/60 via-amber-800/30 to-transparent" />

      {/* Details (Saves, Skills, Senses, Languages, CR) */}
      <div className="space-y-1 text-xs text-slate-300">
        {monster.savingThrows && <div><strong className="text-amber-400">Saving Throws:</strong> {monster.savingThrows}</div>}
        {monster.skills && <div><strong className="text-amber-400">Skills:</strong> {monster.skills}</div>}
        {monster.vulnerabilities && <div><strong className="text-amber-400">Damage Vulnerabilities:</strong> {monster.vulnerabilities}</div>}
        {monster.resistances && <div><strong className="text-amber-400">Damage Resistances:</strong> {monster.resistances}</div>}
        {monster.immunities && <div><strong className="text-amber-400">Damage Immunities:</strong> {monster.immunities}</div>}
        {monster.conditionImmunities && <div><strong className="text-amber-400">Condition Immunities:</strong> {monster.conditionImmunities}</div>}
        {monster.senses && <div><strong className="text-amber-400">Senses:</strong> {monster.senses}</div>}
        {monster.languages && <div><strong className="text-amber-400">Languages:</strong> {monster.languages}</div>}
        <div className="flex items-center space-x-4 pt-1 font-semibold text-amber-300">
          <span><strong>Challenge:</strong> {monster.challengeRating} ({monster.experiencePoints.toLocaleString()} XP)</span>
          <span><strong>Prof Bonus:</strong> +{Math.max(2, Math.floor((parseInt(monster.challengeRating, 10) || 0) / 4) + 2)}</span>
        </div>
      </div>

      {/* Special Traits */}
      {monster.traits && monster.traits.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-surface-border">
          {monster.traits.map((t: MonsterTrait, idx: number) => (
            <div key={idx} className="text-xs leading-relaxed">
              <strong className="text-amber-400 font-serif italic text-sm">{t.name}.</strong>{' '}
              <span className="text-slate-300">{t.desc || (t as any).description}</span>
            </div>
          ))}
        </div>
      )}

      {/* Actions (Clickable attack triggers!) */}
      {monster.actions && monster.actions.length > 0 && (
        <div className="space-y-2 pt-3 border-t-2 border-amber-600/60">
          <h3 className="font-serif font-bold text-amber-500 text-sm tracking-wide uppercase flex items-center space-x-1.5">
            <Swords className="w-4 h-4" />
            <span>Actions</span>
          </h3>
          <div className="space-y-2">
            {monster.actions.map((act: MonsterAction, idx: number) => (
              <div 
                key={idx}
                className="p-2.5 rounded-lg bg-surface-50 hover:bg-surface-hover/80 border border-surface-border transition-all space-y-1 group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-serif italic font-bold text-slate-100 text-xs">
                    {act.name}.
                  </span>
                  {(act.attackBonus !== undefined || act.damageDice) && (
                    <button
                      onClick={() => handleActionClick(act)}
                      className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-bold flex items-center space-x-1 shadow-xs transition-colors"
                      title="Click to roll attack & damage"
                    >
                      <Dices className="w-3 h-3" />
                      <span>{act.attackBonus !== undefined ? `+${act.attackBonus} Hit` : 'Roll'}</span>
                    </button>
                  )}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">{act.desc || (act as any).description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Legendary Actions */}
      {monster.legendaryActions && monster.legendaryActions.length > 0 && (
        <div className="space-y-2 pt-3 border-t border-surface-border">
          <h3 className="font-serif font-bold text-amber-500 text-sm tracking-wide uppercase flex items-center space-x-1.5">
            <Sparkles className="w-4 h-4" />
            <span>Legendary Actions</span>
          </h3>
          <p className="text-[11px] text-slate-400 italic">
            The monster can take {monster.legendaryCount || 3} legendary actions, choosing from the options below. Only one legendary action option can be used at a time.
          </p>
          <div className="space-y-1.5">
            {monster.legendaryActions.map((leg: MonsterAction, idx: number) => (
              <div key={idx} className="text-xs leading-relaxed">
                <strong className="text-amber-400 font-serif italic">{leg.name}.</strong>{' '}
                <span className="text-slate-300">{leg.desc || (leg as any).description}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
