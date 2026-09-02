import React, { useState } from 'react';
import {
  Shield,
  Heart,
  Eye,
  Footprints,
  Dices,
  Sparkles,
  Sun,
  Moon,
  Edit3,
  Trash2,
  Award,
  BookOpen,
  Sword,
  Package,
  Tv,
  Coins,
  Skull,
  User,
  Zap,
} from 'lucide-react';
import { PlayerEntity } from '../../types/player';
import { AbilityKey } from '../../types/characterCreator';
import { SKILL_DEFINITIONS, CLASSES_2024 } from '../../services/characterCreationService';
import { TokenAvatar } from '../common/TokenAvatar';
import { BookmarkButton } from '../bookmarks/BookmarkButton';
import { useApp } from '../../context/AppContext';
import { EntityEditorModal } from './EntityEditorModal';
import { SensesEditorModal } from '../party/SensesEditorModal';

interface PlayerStatBlockProps {
  player: PlayerEntity;
  onEdit?: () => void;
  onDelete?: () => void;
}

export const PlayerStatBlock: React.FC<PlayerStatBlockProps> = ({
  player,
  onEdit,
  onDelete,
}) => {
  const {
    db,
    savePlayer,
    deletePlayer,
    playerRest,
    rollCustomFormula,
    projectMediaToDisplay,
    showToast,
  } = useApp();

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isSensesModalOpen, setIsSensesModalOpen] = useState(false);

  const abilities = player.abilities || { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
  const level = player.level || 1;
  const pb = Math.floor((level - 1) / 4) + 2;

  const getMod = (score: number) => Math.floor((score - 10) / 2);
  const formatMod = (mod: number) => (mod >= 0 ? `+${mod}` : `${mod}`);

  const mods: Record<AbilityKey, number> = {
    str: getMod(abilities.str),
    dex: getMod(abilities.dex),
    con: getMod(abilities.con),
    int: getMod(abilities.int),
    wis: getMod(abilities.wis),
    cha: getMod(abilities.cha),
  };

  const profSaves = (player.proficiencies?.savingThrows || []).map((s) => s.toLowerCase());
  const profSkills = player.proficiencies?.skills || [];

  const normClass = (player.characterClass || '').toLowerCase();
  const matchedClass = CLASSES_2024.find((c) => normClass.includes(c.id) || normClass.includes(c.name.toLowerCase()));
  const hitDie = matchedClass
    ? matchedClass.hitDie
    : normClass.includes('barbarian')
    ? 12
    : normClass.includes('fighter') || normClass.includes('paladin') || normClass.includes('ranger')
    ? 10
    : normClass.includes('sorcerer') || normClass.includes('wizard')
    ? 6
    : 8;

  // Saving Throws
  const saves: { key: AbilityKey; label: string; mod: number; isProf: boolean }[] = [
    { key: 'str', label: 'STR', mod: mods.str + (profSaves.includes('str') ? pb : 0), isProf: profSaves.includes('str') },
    { key: 'dex', label: 'DEX', mod: mods.dex + (profSaves.includes('dex') ? pb : 0), isProf: profSaves.includes('dex') },
    { key: 'con', label: 'CON', mod: mods.con + (profSaves.includes('con') ? pb : 0), isProf: profSaves.includes('con') },
    { key: 'int', label: 'INT', mod: mods.int + (profSaves.includes('int') ? pb : 0), isProf: profSaves.includes('int') },
    { key: 'wis', label: 'WIS', mod: mods.wis + (profSaves.includes('wis') ? pb : 0), isProf: profSaves.includes('wis') },
    { key: 'cha', label: 'CHA', mod: mods.cha + (profSaves.includes('cha') ? pb : 0), isProf: profSaves.includes('cha') },
  ];

  // Skills
  const skillsList = SKILL_DEFINITIONS.map((def) => {
    const isProf = profSkills.includes(def.name);
    const mod = mods[def.ability] + (isProf ? pb : 0);
    return {
      name: def.name,
      ability: def.ability,
      mod,
      isProf,
    };
  });

  // Roll Handlers
  const handleRollAbility = (statName: string, val: number) => {
    const mod = getMod(val);
    const formula = `1d20${mod >= 0 ? `+${mod}` : `${mod}`}`;
    rollCustomFormula(formula, undefined, `${player.name} (${statName} Check)`);
  };

  const handleRollSave = (statName: string, saveMod: number) => {
    const formula = `1d20${saveMod >= 0 ? `+${saveMod}` : `${saveMod}`}`;
    rollCustomFormula(formula, undefined, `${player.name} (${statName} Save)`);
  };

  const handleRollSkill = (skillName: string, skillMod: number) => {
    const formula = `1d20${skillMod >= 0 ? `+${skillMod}` : `${skillMod}`}`;
    rollCustomFormula(formula, undefined, `${player.name} (${skillName} Check)`);
  };

  const handleRollAttack = (weaponName: string, atkBonus: number, dmgDice: string = '1d8', statMod: number = mods.str) => {
    const toHitFormula = `1d20${atkBonus >= 0 ? `+${atkBonus}` : `${atkBonus}`}`;
    const hitRes = rollCustomFormula(toHitFormula, undefined, `${player.name} Attack: ${weaponName} To Hit`);

    const dmgFormula = `${dmgDice}${statMod >= 0 ? `+${statMod}` : `${statMod}`}`;
    rollCustomFormula(dmgFormula, { isCrit: hitRes.isCrit }, `${player.name} ${weaponName} Damage`);
  };

  // HP Adjust
  const handleAdjustHp = (delta: number) => {
    const newCurrent = Math.max(0, Math.min(player.maxHp, player.currentHp + delta));
    savePlayer({
      ...player,
      currentHp: newCurrent,
    });
  };

  // Spell Slot Toggle
  const handleToggleSpellSlot = (slotLevel: number, slotIdx: number) => {
    const updatedSlots = (player.spellSlots || []).map((slot) => {
      if (slot.level === slotLevel) {
        const isCurrentlyUsed = slotIdx < slot.used;
        const newUsed = isCurrentlyUsed ? slot.used - 1 : slot.used + 1;
        return { ...slot, used: Math.max(0, Math.min(slot.total, newUsed)) };
      }
      return slot;
    });

    savePlayer({
      ...player,
      spellSlots: updatedSlots,
    });
  };

  // Death Saves Toggle
  const handleToggleDeathSave = (type: 'successes' | 'failures', index: number) => {
    const current = player.deathSaves || { successes: 0, failures: 0 };
    const currentVal = current[type];
    const newVal = index < currentVal ? index : index + 1;
    savePlayer({
      ...player,
      deathSaves: {
        ...current,
        [type]: newVal,
      },
    });
  };

  const hpPercent = Math.max(0, Math.min(100, Math.round((player.currentHp / player.maxHp) * 100)));
  const campaign = player.campaignId ? db.campaigns.find((c) => c.id === player.campaignId) : null;

  return (
    <div className="bg-[#121720] border border-blue-900/40 rounded-xl p-5 shadow-2xl text-slate-200 font-sans space-y-4 max-w-3xl select-text relative overflow-hidden">
      {/* Hero Artwork Showcase */}
      {player.avatarUrl && (
        <div className="relative -mx-5 -mt-5 mb-4 overflow-hidden border-b border-blue-900/40 bg-[#080b10] group">
          <img
            src={player.avatarUrl}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover filter blur-2xl opacity-30 scale-110 pointer-events-none"
          />
          <div className="relative h-64 sm:h-72 w-full flex items-center justify-center p-3">
            <img
              src={player.avatarUrl}
              alt={player.name}
              className="max-h-full max-w-full object-contain filter drop-shadow-[0_12px_24px_rgba(0,0,0,0.85)] group-hover:scale-[1.02] transition-transform duration-300"
            />
          </div>
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#121720] via-[#121720]/80 to-transparent pointer-events-none" />
        </div>
      )}

      {/* Header */}
      <div className="border-b-2 border-amber-600/60 pb-3 flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
            <h2 className="font-serif text-2xl font-bold text-amber-500 tracking-wide">
              {player.name}
            </h2>
            {campaign && (
              <span className="px-2 py-0.5 rounded-full bg-indigo-950/80 border border-indigo-700/80 text-indigo-300 font-bold text-[10px]">
                🏰 {campaign.name}
              </span>
            )}
            {player.playerName && (
              <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-400 font-medium text-[10px] flex items-center space-x-1">
                <User className="w-3 h-3 text-slate-400" />
                <span>Player: {player.playerName}</span>
              </span>
            )}
            {player.currentHp === 0 && (
              <span className="px-2 py-0.5 rounded-full bg-red-950 text-red-300 border border-red-800 text-[10px] font-bold flex items-center space-x-1">
                <Skull className="w-3 h-3" />
                <span>UNCONSCIOUS</span>
              </span>
            )}
          </div>
          <div className="italic text-xs text-slate-400 mt-1 font-serif flex items-center space-x-2 flex-wrap">
            <span className="text-amber-300 font-bold">Level {level} {player.characterClass}</span>
            <span>•</span>
            <span>{player.race || player.species || 'Hero'}</span>
            {player.lineage && (
              <>
                <span>•</span>
                <span>{player.lineage}</span>
              </>
            )}
            <span>•</span>
            <span className="text-slate-300">{player.background || 'Hero Background'}</span>
            <span>•</span>
            <span className="text-slate-400">{player.alignment || 'Neutral Good'}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 flex-wrap gap-y-1.5">
          <BookmarkButton
            type="player"
            targetId={player.id}
            title={player.name}
            subtitle={`Lv ${player.level} ${player.race} ${player.characterClass}`}
            category="Hero"
            imageUrl={player.avatarUrl || player.tokenUrl}
            campaignId={player.campaignId}
            showText
            size="md"
          />

          {(player.avatarUrl || player.tokenUrl) && (
            <button
              onClick={() => {
                projectMediaToDisplay({
                  id: player.id,
                  type: 'player',
                  title: player.name,
                  subtitle: `Level ${player.level} ${player.race} ${player.characterClass}`,
                  imageUrl: player.avatarUrl || player.tokenUrl,
                  badge: `Level ${player.level}`,
                });
              }}
              className="px-2.5 py-1 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/80 text-indigo-300 text-xs font-semibold rounded-lg flex items-center space-x-1 transition-colors"
              title="Project hero artwork to Player Display"
            >
              <Tv className="w-3.5 h-3.5 text-sky-400" />
              <span>Project Artwork</span>
            </button>
          )}

          <button
            onClick={() => playerRest(player.id, 'short')}
            className="px-2 py-1 bg-surface-50 hover:bg-surface-hover border border-surface-border text-slate-300 text-xs font-semibold rounded-lg flex items-center space-x-1 transition-colors"
            title="Take Short Rest"
          >
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            <span>Short Rest</span>
          </button>

          <button
            onClick={() => playerRest(player.id, 'long')}
            className="px-2 py-1 bg-surface-50 hover:bg-surface-hover border border-surface-border text-slate-300 text-xs font-semibold rounded-lg flex items-center space-x-1 transition-colors"
            title="Take Long Rest"
          >
            <Moon className="w-3.5 h-3.5 text-indigo-400" />
            <span>Long Rest</span>
          </button>

          <button
            onClick={() => {
              if (onEdit) onEdit();
              else setIsEditorOpen(true);
            }}
            className="p-1.5 bg-surface-50 hover:bg-surface-hover text-slate-300 rounded-lg border border-surface-border transition-colors"
            title="Edit Hero Details"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>

          {onDelete && (
            <button
              onClick={onDelete}
              className="p-1.5 bg-surface-50 hover:bg-red-950 text-slate-400 hover:text-red-400 rounded-lg border border-surface-border transition-colors"
              title="Delete Hero"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          <TokenAvatar
            name={player.name}
            imageUrl={player.avatarUrl}
            tokenUrl={player.tokenUrl}
            type="player"
            characterClass={player.characterClass}
            size="lg"
            allowZoom={true}
          />
        </div>
      </div>

      {/* Combat Vitals Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-xs">
        {/* Armor Class */}
        <div className="p-2.5 rounded-xl bg-surface-50 border border-surface-border flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[9px] text-slate-400 font-bold uppercase">Armor Class</div>
            <div className="text-base font-bold font-mono text-slate-100">{player.armorClass}</div>
            <div className="text-[9px] text-slate-500 truncate max-w-[80px]">
              {player.equippedArmor || 'Unarmored'}{player.equippedShield ? ' + Shield' : ''}
            </div>
          </div>
        </div>

        {/* Initiative */}
        <div
          onClick={() => rollCustomFormula(`1d20${player.initiativeBonus >= 0 ? `+${player.initiativeBonus}` : `${player.initiativeBonus}`}`, undefined, `${player.name} (Initiative)`)}
          className="p-2.5 rounded-xl bg-surface-50 hover:bg-amber-500/15 border border-surface-border hover:border-amber-500/40 transition-all cursor-pointer flex items-center space-x-2.5 group"
          title="Click to roll Initiative"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Dices className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[9px] text-slate-400 font-bold uppercase">Initiative</div>
            <div className="text-base font-bold font-mono text-amber-400">
              {player.initiativeBonus >= 0 ? `+${player.initiativeBonus}` : player.initiativeBonus}
            </div>
            <div className="text-[9px] text-slate-500">Dex {formatMod(mods.dex)}</div>
          </div>
        </div>

        {/* Speed */}
        <div className="p-2.5 rounded-xl bg-surface-50 border border-surface-border flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
            <Footprints className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[9px] text-slate-400 font-bold uppercase">Speed</div>
            <div className="text-base font-bold text-slate-100">{player.speed || '30 ft.'}</div>
            <div className="text-[9px] text-slate-500">6 Squares</div>
          </div>
        </div>

        {/* Hit Dice */}
        <div className="p-2.5 rounded-xl bg-surface-50 border border-surface-border flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center shrink-0">
            <Heart className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[9px] text-slate-400 font-bold uppercase">Hit Dice</div>
            <div className="text-base font-bold font-mono text-red-300">1d{hitDie}</div>
            <div className="text-[9px] text-slate-500">Total: {level}d{hitDie}</div>
          </div>
        </div>

        {/* Proficiency Bonus */}
        <div className="p-2.5 rounded-xl bg-surface-50 border border-surface-border flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[9px] text-slate-400 font-bold uppercase">Prof. Bonus</div>
            <div className="text-base font-bold font-mono text-purple-300">+{pb}</div>
            <div className="text-[9px] text-slate-500">Level {level}</div>
          </div>
        </div>

        {/* Passive Perception */}
        <div className="p-2.5 rounded-xl bg-surface-50 border border-surface-border flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[9px] text-slate-400 font-bold uppercase">Passive Senses</div>
            <div className="text-base font-bold font-mono text-indigo-300">{player.passivePerception || 10 + mods.wis}</div>
            <div className="text-[9px] text-slate-500">Perception</div>
          </div>
        </div>
      </div>

      {/* Hit Points Bar & Quick Modifiers */}
      <div className="p-3.5 rounded-xl bg-surface-50 border border-surface-border space-y-2.5">
        <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center space-x-2">
            <Heart className="w-4 h-4 text-red-400" />
            <span className="font-serif font-bold text-xs text-slate-100">
              Hit Points: <strong className="font-mono text-sm text-emerald-400">{player.currentHp}</strong> / <span className="text-slate-400 font-mono">{player.maxHp}</span>
            </span>
            {player.tempHp > 0 && (
              <span className="px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-mono font-bold">
                +{player.tempHp} Temp
              </span>
            )}
          </div>

          <div className="flex items-center space-x-1 font-mono text-xs">
            <button
              onClick={() => handleAdjustHp(-5)}
              className="px-2 py-0.5 rounded bg-surface-100 hover:bg-red-950 text-red-300 border border-surface-border transition-colors font-bold text-[11px]"
              title="Take 5 damage"
            >
              -5
            </button>
            <button
              onClick={() => handleAdjustHp(-1)}
              className="px-2 py-0.5 rounded bg-surface-100 hover:bg-red-950 text-red-300 border border-surface-border transition-colors font-bold text-[11px]"
              title="Take 1 damage"
            >
              -1
            </button>
            <button
              onClick={() => handleAdjustHp(1)}
              className="px-2 py-0.5 rounded bg-surface-100 hover:bg-emerald-950 text-emerald-300 border border-surface-border transition-colors font-bold text-[11px]"
              title="Heal 1 HP"
            >
              +1
            </button>
            <button
              onClick={() => handleAdjustHp(5)}
              className="px-2 py-0.5 rounded bg-surface-100 hover:bg-emerald-950 text-emerald-300 border border-surface-border transition-colors font-bold text-[11px]"
              title="Heal 5 HP"
            >
              +5
            </button>
          </div>
        </div>

        <div className="w-full h-2.5 rounded-full bg-surface-100 overflow-hidden border border-surface-border/60 p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              hpPercent > 50 ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : hpPercent > 20 ? 'bg-amber-500 shadow-sm shadow-amber-500/50' : 'bg-red-600 shadow-sm shadow-red-600/50'
            }`}
            style={{ width: `${hpPercent}%` }}
          />
        </div>

        {/* Death Saves (if downed or tracked) */}
        {player.currentHp === 0 && (
          <div className="pt-1 flex items-center justify-between border-t border-surface-border/60 text-xs">
            <div className="font-serif font-bold text-red-400 flex items-center space-x-1">
              <Skull className="w-3.5 h-3.5" />
              <span>Death Saves</span>
            </div>
            <div className="flex items-center space-x-4 text-[11px]">
              <div className="flex items-center space-x-1.5">
                <span className="text-emerald-400 font-medium">Successes:</span>
                <div className="flex space-x-1">
                  {[0, 1, 2].map((idx) => {
                    const filled = idx < (player.deathSaves?.successes || 0);
                    return (
                      <button
                        key={idx}
                        onClick={() => handleToggleDeathSave('successes', idx)}
                        className={`w-3.5 h-3.5 rounded-full border transition-all ${
                          filled ? 'bg-emerald-500 border-emerald-400 shadow-xs' : 'bg-surface-100 border-surface-border'
                        }`}
                      />
                    );
                  })}
                </div>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="text-red-400 font-medium">Failures:</span>
                <div className="flex space-x-1">
                  {[0, 1, 2].map((idx) => {
                    const filled = idx < (player.deathSaves?.failures || 0);
                    return (
                      <button
                        key={idx}
                        onClick={() => handleToggleDeathSave('failures', idx)}
                        className={`w-3.5 h-3.5 rounded-full border transition-all ${
                          filled ? 'bg-red-600 border-red-500 shadow-xs' : 'bg-surface-100 border-surface-border'
                        }`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="h-px bg-gradient-to-r from-amber-600/60 via-amber-800/30 to-transparent" />

      {/* Ability Scores Bar */}
      <div>
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center space-x-1.5">
          <Dices className="w-3.5 h-3.5 text-amber-400" />
          <span>Ability Scores & Modifiers (Click to Roll)</span>
        </div>
        <div className="grid grid-cols-6 gap-1 text-center bg-surface-50 p-2 rounded-lg border border-surface-border">
          {(['str', 'dex', 'con', 'int', 'wis', 'cha'] as AbilityKey[]).map((key) => {
            const val = abilities[key] || 10;
            const mod = mods[key];
            return (
              <button
                key={key}
                onClick={() => handleRollAbility(key.toUpperCase(), val)}
                className="p-1 hover:bg-amber-500/20 rounded transition-colors group flex flex-col items-center cursor-pointer"
                title={`Click to roll ${key.toUpperCase()} check (1d20${formatMod(mod)})`}
              >
                <span className="text-[10px] font-bold text-slate-400 group-hover:text-amber-400 uppercase">{key}</span>
                <span className="font-mono text-xs font-bold text-slate-100">{val}</span>
                <span className="font-mono text-[10px] text-amber-400 font-bold">{formatMod(mod)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Saving Throws */}
      <div>
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center space-x-1.5">
          <Shield className="w-3.5 h-3.5 text-blue-400" />
          <span>Saving Throws</span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 text-xs">
          {saves.map((s) => (
            <button
              key={s.key}
              onClick={() => handleRollSave(s.key.toUpperCase(), s.mod)}
              className={`p-1.5 rounded-lg border flex items-center justify-between cursor-pointer transition-colors group ${
                s.isProf
                  ? 'bg-blue-950/30 border-blue-700/60 hover:border-blue-400'
                  : 'bg-surface-50 hover:bg-surface-hover border-surface-border'
              }`}
              title={`Click to roll ${s.key.toUpperCase()} Save (${formatMod(s.mod)})`}
            >
              <div className="flex items-center space-x-1">
                <span
                  className={`w-2 h-2 rounded-full border ${
                    s.isProf ? 'bg-blue-400 border-blue-300 shadow-xs' : 'bg-surface-100 border-surface-border'
                  }`}
                />
                <span className={`text-[10px] text-slate-300 group-hover:text-white ${s.isProf ? 'font-bold text-blue-300' : ''}`}>
                  {s.label}
                </span>
              </div>
              <strong className="font-mono text-[11px] text-slate-100 font-bold">{formatMod(s.mod)}</strong>
            </button>
          ))}
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-amber-600/60 via-amber-800/30 to-transparent" />

      {/* Skills Grid */}
      <div>
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span>Skills ({skillsList.filter((s) => s.isProf).length} Proficient)</span>
          </div>
          <span className="text-[9px] text-slate-500">Click to Roll Check</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1 text-xs max-h-48 overflow-y-auto pr-1">
          {skillsList.map((sk) => (
            <button
              key={sk.name}
              onClick={() => handleRollSkill(sk.name, sk.mod)}
              className={`p-1.5 rounded-lg border flex items-center justify-between cursor-pointer transition-colors text-left group ${
                sk.isProf
                  ? 'bg-emerald-950/20 border-emerald-800/50 hover:border-emerald-500/60'
                  : 'bg-surface-50 hover:bg-surface-hover border-surface-border'
              }`}
              title={`Click to roll ${sk.name} (${formatMod(sk.mod)})`}
            >
              <div className="flex items-center space-x-1.5 truncate pr-1">
                <span
                  className={`w-2 h-2 rounded-full border shrink-0 ${
                    sk.isProf ? 'bg-emerald-400 border-emerald-300 shadow-xs' : 'bg-surface-100 border-surface-border'
                  }`}
                />
                <span className={`text-[11px] truncate text-slate-300 group-hover:text-white ${sk.isProf ? 'font-bold text-emerald-300' : ''}`}>
                  {sk.name}
                </span>
                <span className="text-[9px] text-slate-500 font-mono uppercase">
                  ({sk.ability})
                </span>
              </div>
              <strong className="font-mono text-[11px] text-slate-100 font-bold shrink-0">{formatMod(sk.mod)}</strong>
            </button>
          ))}
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-amber-600/60 via-amber-800/30 to-transparent" />

      {/* Attacks & Weapon Masteries */}
      <div className="space-y-2">
        <h3 className="font-serif font-bold text-amber-500 text-xs tracking-wide uppercase flex items-center space-x-1.5">
          <Sword className="w-3.5 h-3.5" />
          <span>Attacks & Weapon Masteries</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {player.weaponMasteries && player.weaponMasteries.length > 0 ? (
            player.weaponMasteries.map((w, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-surface-50 border border-surface-border hover:border-amber-500/40 transition-all flex items-center justify-between"
              >
                <div>
                  <div className="font-serif font-bold text-slate-100 text-xs">{w}</div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Hit: +{mods.str + pb} · Dmg: 1d8 {formatMod(mods.str)}
                  </div>
                </div>
                <button
                  onClick={() => handleRollAttack(w, mods.str + pb, '1d8', mods.str)}
                  className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-bold flex items-center space-x-1 transition-colors"
                >
                  <Dices className="w-3 h-3" />
                  <span>+{mods.str + pb} Hit</span>
                </button>
              </div>
            ))
          ) : (
            <div className="p-2.5 rounded-lg bg-surface-50 border border-surface-border flex items-center justify-between">
              <div>
                <div className="font-serif font-bold text-slate-100 text-xs">Unarmed Strike</div>
                <div className="text-[10px] text-slate-400 font-mono">
                  Hit: +{mods.str + pb} · Dmg: 1 + {mods.str} Bludgeoning
                </div>
              </div>
              <button
                onClick={() => handleRollAttack('Unarmed Strike', mods.str + pb, '1', mods.str)}
                className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-bold flex items-center space-x-1 transition-colors"
              >
                <Dices className="w-3 h-3" />
                <span>+{mods.str + pb} Hit</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Spellcasting Section (if slots, cantrips, or spells present) */}
      {(player.spellSlots && player.spellSlots.length > 0) || (player.cantrips && player.cantrips.length > 0) || (player.spellsKnown && player.spellsKnown.length > 0) ? (
        <div className="space-y-2 pt-2 border-t border-surface-border">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-purple-300 text-xs tracking-wide uppercase flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Spellcasting & Spell Slots</span>
            </h3>
            {player.spellSaveDc && (
              <span className="px-2 py-0.5 rounded bg-purple-950 border border-purple-800 text-purple-300 font-mono text-[10px] font-bold">
                Spell Save DC {player.spellSaveDc}
              </span>
            )}
          </div>

          {/* Spell Slot Tracker */}
          {player.spellSlots && player.spellSlots.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
              {player.spellSlots.map((slot) => (
                <div key={slot.level} className="flex items-center justify-between bg-surface-50 px-2.5 py-1.5 rounded-lg border border-surface-border">
                  <span className="text-slate-300 font-medium text-[11px]">Level {slot.level} Slots:</span>
                  <div className="flex space-x-1">
                    {Array.from({ length: slot.total }).map((_, sIdx) => {
                      const isUsed = sIdx < slot.used;
                      return (
                        <button
                          key={sIdx}
                          onClick={() => handleToggleSpellSlot(slot.level, sIdx)}
                          className={`w-4 h-4 rounded border transition-all ${
                            isUsed
                              ? 'bg-surface-100 border-surface-border text-transparent'
                              : 'bg-purple-600 border-purple-400 shadow-xs text-white'
                          }`}
                          title={isUsed ? 'Expended (Click to restore)' : 'Available (Click to expend)'}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Cantrips & Spells Badges */}
          <div className="space-y-1 text-xs pt-1">
            {player.cantrips && player.cantrips.length > 0 && (
              <div className="flex flex-wrap items-center gap-1">
                <strong className="text-purple-400 text-[10px] uppercase font-mono mr-1">Cantrips:</strong>
                {player.cantrips.map((c, i) => (
                  <span key={i} className="px-1.5 py-0.5 rounded bg-purple-950/60 border border-purple-800/60 text-purple-200 text-[10px]">
                    {c}
                  </span>
                ))}
              </div>
            )}
            {player.spellsKnown && player.spellsKnown.length > 0 && (
              <div className="flex flex-wrap items-center gap-1">
                <strong className="text-indigo-400 text-[10px] uppercase font-mono mr-1">Prepared:</strong>
                {player.spellsKnown.map((s, i) => (
                  <span key={i} className="px-1.5 py-0.5 rounded bg-indigo-950/60 border border-indigo-800/60 text-indigo-200 text-[10px]">
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* Senses, Languages, Feats & Proficiencies */}
      <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-surface-border">
        {/* Origin Feat & Feats */}
        {(player.originFeat || (player.feats && player.feats.length > 0)) && (
          <div>
            <strong className="text-amber-400">Feats & Features:</strong>{' '}
            {[
              player.originFeat ? `Origin Feat: ${player.originFeat}` : null,
              ...(player.feats || []).filter((f) => f !== player.originFeat),
            ]
              .filter(Boolean)
              .join(', ')}
          </div>
        )}

        {/* Proficiencies */}
        {player.proficiencies?.armor && player.proficiencies.armor.length > 0 && (
          <div>
            <strong className="text-amber-400">Armor Training:</strong> {player.proficiencies.armor.join(', ')}
          </div>
        )}
        {player.proficiencies?.weapons && player.proficiencies.weapons.length > 0 && (
          <div>
            <strong className="text-amber-400">Weapon Proficiencies:</strong> {player.proficiencies.weapons.join(', ')}
          </div>
        )}
        {player.proficiencies?.tools && player.proficiencies.tools.length > 0 && (
          <div>
            <strong className="text-amber-400">Tool Proficiencies:</strong> {player.proficiencies.tools.join(', ')}
          </div>
        )}
        {player.proficiencies?.languages && player.proficiencies.languages.length > 0 && (
          <div>
            <strong className="text-amber-400">Languages:</strong> {player.proficiencies.languages.join(', ')}
          </div>
        )}
        {/* Senses (Configured or Racial Default) */}
        {(() => {
          const darkvision = player.sensesConfig?.darkvision ?? (
            player.race?.toLowerCase().includes('elf') || 
            player.race?.toLowerCase().includes('dwarf') || 
            player.race?.toLowerCase().includes('tiefling') || 
            player.race?.toLowerCase().includes('gnome') || 
            player.race?.toLowerCase().includes('half-orc') || 
            player.race?.toLowerCase().includes('orc') ? 60 : 0
          );
          const normalSight = player.sensesConfig?.normalSight ?? 60;
          const blindsight = player.sensesConfig?.blindsight ?? 0;
          const truesight = player.sensesConfig?.truesight ?? 0;
          const tremorsense = player.sensesConfig?.tremorsense ?? 0;

          return (
            <div className="flex items-center justify-between group">
              <div>
                <strong className="text-amber-400">Senses:</strong> Sight {normalSight} ft.
                {darkvision > 0 && `, Darkvision ${darkvision} ft.`}
                {blindsight > 0 && `, Blindsight ${blindsight} ft.`}
                {truesight > 0 && `, Truesight ${truesight} ft.`}
                {tremorsense > 0 && `, Tremorsense ${tremorsense} ft.`}
              </div>
              <button
                type="button"
                onClick={() => setIsSensesModalOpen(true)}
                className="px-1.5 py-0.5 rounded text-[10px] text-slate-400 hover:text-cyan-400 hover:bg-surface-hover transition-colors opacity-0 group-hover:opacity-100 flex items-center space-x-1"
                title="Edit character vision and senses"
              >
                <span>Edit Vision ✎</span>
              </button>
            </div>
          );
        })()}
      </div>

      {/* Currency & Inventory / Notes */}
      {(player.currency || player.notes) && (
        <div className="space-y-2 pt-2 border-t border-surface-border">
          {/* Currency Bar */}
          {player.currency && (
            <div className="flex items-center space-x-3 text-xs bg-surface-50 p-2 rounded-lg border border-surface-border">
              <div className="flex items-center space-x-1 text-amber-400 font-bold">
                <Coins className="w-3.5 h-3.5" />
                <span>Currency:</span>
              </div>
              <div className="flex items-center space-x-2 font-mono text-[11px]">
                <span><strong className="text-amber-400">{player.currency.gp || 0}</strong> GP</span>
                <span><strong className="text-slate-300">{player.currency.sp || 0}</strong> SP</span>
                <span><strong className="text-amber-600">{player.currency.cp || 0}</strong> CP</span>
                {player.currency.ep ? <span><strong className="text-cyan-300">{player.currency.ep}</strong> EP</span> : null}
                {player.currency.pp ? <span><strong className="text-indigo-300">{player.currency.pp}</strong> PP</span> : null}
              </div>
            </div>
          )}

          {/* Notes / Equipment */}
          {player.notes && (
            <div className="p-2.5 rounded-lg bg-surface-50 border border-surface-border text-xs leading-relaxed space-y-1">
              <div className="font-serif font-bold text-slate-200 flex items-center space-x-1.5">
                <Package className="w-3.5 h-3.5 text-slate-400" />
                <span>Equipment & Notes</span>
              </div>
              <p className="text-slate-300 whitespace-pre-wrap">{player.notes}</p>
            </div>
          )}
        </div>
      )}

      {/* Personality & Lore (if present) */}
      {(player.personalityTraits || player.ideals || player.bonds || player.flaws || player.backstory) && (
        <div className="space-y-1 text-xs pt-2 border-t border-surface-border text-slate-300">
          {player.personalityTraits && <div><strong className="text-amber-400 font-serif">Personality:</strong> {player.personalityTraits}</div>}
          {player.ideals && <div><strong className="text-amber-400 font-serif">Ideals:</strong> {player.ideals}</div>}
          {player.bonds && <div><strong className="text-amber-400 font-serif">Bonds:</strong> {player.bonds}</div>}
          {player.flaws && <div><strong className="text-amber-400 font-serif">Flaws:</strong> {player.flaws}</div>}
          {player.backstory && (
            <div className="pt-1">
              <strong className="text-amber-400 font-serif block">Backstory:</strong>
              <p className="text-slate-400 italic mt-0.5 leading-relaxed">{player.backstory}</p>
            </div>
          )}
        </div>
      )}

      {/* Entity Editor Modal */}
      {isEditorOpen && (
        <EntityEditorModal
          type="player"
          initialData={player}
          onClose={() => setIsEditorOpen(false)}
          onSave={(updatedData) => savePlayer(updatedData)}
        />
      )}

      {/* Senses & Vision Modal */}
      {isSensesModalOpen && (
        <SensesEditorModal
          player={player}
          onClose={() => setIsSensesModalOpen(false)}
        />
      )}
    </div>
  );
};
