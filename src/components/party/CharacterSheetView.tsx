import React, { useState } from 'react';
import {
  Users,
  Shield,
  Heart,
  Eye,
  Footprints,
  Dices,
  Sparkles,
  Sun,
  Moon,
  Printer,
  Edit3,
  Trash2,
  ChevronLeft,
  Skull,
  Award,
  BookOpen,
  Sword,
  Package,
  Coins,
  CheckCircle2,
  Flame,
  Zap,
  Info,
} from 'lucide-react';
import { PlayerEntity } from '../../types/player';
import { AbilityKey } from '../../types/characterCreator';
import { SKILL_DEFINITIONS, CLASSES_2024 } from '../../services/characterCreationService';
import { TokenAvatar } from '../common/TokenAvatar';
import { useApp } from '../../context/AppContext';
import { CharacterPrintModal } from './CharacterPrintModal';
import { EntityEditorModal } from '../compendium/EntityEditorModal';
import { SensesEditorModal } from './SensesEditorModal';
import { BookmarkButton } from '../bookmarks/BookmarkButton';

interface CharacterSheetViewProps {
  player: PlayerEntity;
  party: PlayerEntity[];
  onSelectPlayer: (playerId: string) => void;
  onBackToParty: () => void;
}

export const CharacterSheetView: React.FC<CharacterSheetViewProps> = ({
  player,
  party,
  onSelectPlayer,
  onBackToParty,
}) => {
  const { savePlayer, deletePlayer, playerRest, rollCustomFormula, showToast } = useApp();

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isSensesModalOpen, setIsSensesModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'combat' | 'features' | 'equipment' | 'lore'>('combat');

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
  const hitDie = matchedClass ? matchedClass.hitDie : (normClass.includes('barbarian') ? 12 : normClass.includes('fighter') || normClass.includes('paladin') || normClass.includes('ranger') ? 10 : normClass.includes('sorcerer') || normClass.includes('wizard') ? 6 : 8);

  // Saving Throws
  const saves: { key: AbilityKey; label: string; mod: number; isProf: boolean }[] = [
    { key: 'str', label: 'Strength', mod: mods.str + (profSaves.includes('str') ? pb : 0), isProf: profSaves.includes('str') },
    { key: 'dex', label: 'Dexterity', mod: mods.dex + (profSaves.includes('dex') ? pb : 0), isProf: profSaves.includes('dex') },
    { key: 'con', label: 'Constitution', mod: mods.con + (profSaves.includes('con') ? pb : 0), isProf: profSaves.includes('con') },
    { key: 'int', label: 'Intelligence', mod: mods.int + (profSaves.includes('int') ? pb : 0), isProf: profSaves.includes('int') },
    { key: 'wis', label: 'Wisdom', mod: mods.wis + (profSaves.includes('wis') ? pb : 0), isProf: profSaves.includes('wis') },
    { key: 'cha', label: 'Charisma', mod: mods.cha + (profSaves.includes('cha') ? pb : 0), isProf: profSaves.includes('cha') },
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

  const handleRollAttack = (weaponName: string, atkBonus: number, dmgFormula?: string) => {
    const formula = `1d20${atkBonus >= 0 ? `+${atkBonus}` : `${atkBonus}`}`;
    rollCustomFormula(formula, undefined, `${player.name} Attack: ${weaponName} (${dmgFormula || ''})`);
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

  return (
    <div className="h-full flex flex-col bg-[#090d12] overflow-hidden select-none animate-fadeIn">
      {/* Top Navigation Bar */}
      <div className="p-3.5 bg-surface-100/80 border-b border-surface-border flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onBackToParty}
            className="px-3 py-1.5 rounded-lg bg-surface-50 hover:bg-surface-hover border border-surface-border text-slate-300 hover:text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-sm"
          >
            <ChevronLeft className="w-4 h-4 text-amber-400" />
            <span>Party Roster</span>
          </button>

          {/* Hero Quick Switcher */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400">Hero:</span>
            <select
              value={player.id}
              onChange={(e) => onSelectPlayer(e.target.value)}
              className="px-3 py-1 bg-surface-50 border border-surface-border rounded-lg text-xs font-serif font-bold text-slate-100 focus:outline-none focus:border-amber-500"
            >
              {party.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (Lvl {p.level} {p.characterClass})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 flex-wrap gap-1.5">
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

          <button
            type="button"
            onClick={() => playerRest(player.id, 'short')}
            className="px-3 py-1.5 rounded-lg bg-surface-50 hover:bg-surface-hover border border-surface-border text-slate-300 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
            title="Take Short Rest"
          >
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            <span>Short Rest</span>
          </button>

          <button
            type="button"
            onClick={() => playerRest(player.id, 'long')}
            className="px-3 py-1.5 rounded-lg bg-surface-50 hover:bg-surface-hover border border-surface-border text-slate-300 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
            title="Take Long Rest (Restore HP & Spell Slots)"
          >
            <Moon className="w-3.5 h-3.5 text-indigo-400" />
            <span>Long Rest</span>
          </button>

          <button
            type="button"
            onClick={() => setIsPrintModalOpen(true)}
            className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-serif font-bold text-xs flex items-center space-x-1.5 shadow-md transition-all"
            title="Print Character Sheet to PDF"
          >
            <Printer className="w-4 h-4" />
            <span>Print Sheet</span>
          </button>

          <button
            type="button"
            onClick={() => setIsEditorOpen(true)}
            className="p-2 bg-surface-50 hover:bg-surface-hover border border-surface-border text-slate-300 rounded-lg transition-colors"
            title="Edit Character Details"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => {
              if (window.confirm(`Delete ${player.name}?`)) {
                deletePlayer(player.id);
                onBackToParty();
              }
            }}
            className="p-2 bg-surface-50 hover:bg-red-950 text-slate-400 hover:text-red-400 border border-surface-border rounded-lg transition-colors"
            title="Delete Character"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Character Sheet Body */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-7xl mx-auto w-full">
        {/* Character Identity Banner */}
        <div className="p-5 rounded-2xl bg-surface-100 border border-surface-border shadow-xl flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-start space-x-4">
            <TokenAvatar
              name={player.name}
              imageUrl={player.avatarUrl}
              tokenUrl={player.tokenUrl}
              type="player"
              characterClass={player.characterClass}
              size="2xl"
              allowZoom={true}
            />

            <div className="space-y-1">
              <div className="flex items-center space-x-2.5">
                <h1 className="font-serif text-2xl font-bold text-slate-100 tracking-tight">
                  {player.name}
                </h1>
                {player.currentHp === 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-red-950 text-red-300 border border-red-800 text-[10px] font-bold flex items-center space-x-1">
                    <Skull className="w-3.5 h-3.5" />
                    <span>UNCONSCIOUS</span>
                  </span>
                )}
              </div>

              <div className="text-xs text-amber-400 font-medium flex items-center space-x-2 flex-wrap">
                <span className="font-bold">Level {level} {player.characterClass}</span>
                <span>·</span>
                <span>{player.race || player.species || 'Human'}</span>
                <span>·</span>
                <span className="text-slate-300">{player.background || 'Hero Background'}</span>
                <span>·</span>
                <span className="text-slate-400">{player.alignment || 'Neutral Good'}</span>
              </div>

              {player.playerName && (
                <div className="text-xs text-slate-400">
                  Player: <strong className="text-slate-200">{player.playerName}</strong>
                </div>
              )}
            </div>
          </div>

          {/* Quick Death Saves Tracker */}
          <div className="p-3 rounded-xl bg-surface-50 border border-surface-border space-y-2 text-xs">
            <div className="font-serif font-bold text-slate-300 flex items-center space-x-1.5">
              <Skull className="w-3.5 h-3.5 text-red-400" />
              <span>Death Saves</span>
            </div>
            <div className="flex items-center justify-between space-x-3 text-[11px]">
              <span className="text-emerald-400 font-medium">Successes:</span>
              <div className="flex space-x-1.5">
                {[0, 1, 2].map((idx) => {
                  const filled = idx < (player.deathSaves?.successes || 0);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleToggleDeathSave('successes', idx)}
                      className={`w-4 h-4 rounded-full border transition-all ${
                        filled ? 'bg-emerald-500 border-emerald-400 shadow-sm shadow-emerald-500/50' : 'bg-surface-100 border-surface-border'
                      }`}
                    />
                  );
                })}
              </div>
            </div>
            <div className="flex items-center justify-between space-x-3 text-[11px]">
              <span className="text-red-400 font-medium">Failures:</span>
              <div className="flex space-x-1.5">
                {[0, 1, 2].map((idx) => {
                  const filled = idx < (player.deathSaves?.failures || 0);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleToggleDeathSave('failures', idx)}
                      className={`w-4 h-4 rounded-full border transition-all ${
                        filled ? 'bg-red-600 border-red-500 shadow-sm shadow-red-600/50' : 'bg-surface-100 border-surface-border'
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Combat Vitals Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 text-xs">
          {/* Armor Class */}
          <div className="p-3.5 rounded-xl bg-surface-100 border border-surface-border flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Armor Class</div>
              <div className="text-xl font-bold font-mono text-slate-100">{player.armorClass}</div>
              <div className="text-[10px] text-slate-500 truncate">
                {player.equippedArmor || 'Unarmored'}{player.equippedShield ? ' + Shield' : ''}
              </div>
            </div>
          </div>

          {/* Initiative */}
          <div
            onClick={() => rollCustomFormula(`1d20${player.initiativeBonus >= 0 ? `+${player.initiativeBonus}` : `${player.initiativeBonus}`}`, undefined, `${player.name} (Initiative)`)}
            className="p-3.5 rounded-xl bg-surface-100 border border-surface-border flex items-center space-x-3 cursor-pointer hover:border-amber-500/50 transition-all group"
            title="Click to roll Initiative"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Dices className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Initiative</div>
              <div className="text-xl font-bold font-mono text-amber-400">
                {player.initiativeBonus >= 0 ? `+${player.initiativeBonus}` : player.initiativeBonus}
              </div>
              <div className="text-[10px] text-slate-500">Dex Mod {formatMod(mods.dex)}</div>
            </div>
          </div>

          {/* Speed */}
          <div className="p-3.5 rounded-xl bg-surface-100 border border-surface-border flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
              <Footprints className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Speed</div>
              <div className="text-xl font-bold text-slate-100">{player.speed || '30 ft.'}</div>
              <div className="text-[10px] text-slate-500">6 Squares</div>
            </div>
          </div>

          {/* Hit Dice */}
          <div className="p-3.5 rounded-xl bg-surface-100 border border-surface-border flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center shrink-0">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Hit Dice</div>
              <div className="text-xl font-bold font-mono text-red-300">1d{hitDie}</div>
              <div className="text-[10px] text-slate-500">Total: {level}d{hitDie}</div>
            </div>
          </div>

          {/* Proficiency Bonus */}
          <div className="p-3.5 rounded-xl bg-surface-100 border border-surface-border flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Prof. Bonus</div>
              <div className="text-xl font-bold font-mono text-purple-300">+{pb}</div>
              <div className="text-[10px] text-slate-500">Level {level}</div>
            </div>
          </div>

          {/* Passive Perception */}
          <div className="p-3.5 rounded-xl bg-surface-100 border border-surface-border flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Passive Senses</div>
              <div className="text-xl font-bold font-mono text-indigo-300">{player.passivePerception || 10 + mods.wis}</div>
              <div className="text-[10px] text-slate-500">Perception</div>
            </div>
          </div>

          {/* Vision & Senses */}
          <div
            onClick={() => setIsSensesModalOpen(true)}
            className="p-3.5 rounded-xl bg-surface-100 border border-surface-border flex items-center space-x-3 cursor-pointer hover:border-cyan-500/50 hover:bg-surface-hover transition-all group"
            title="Click to configure Darkvision, Blindsight, Truesight, Tremorsense"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Eye className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Vision</div>
                <span className="text-[10px] text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">Edit ✎</span>
              </div>
              <div className="text-xl font-bold font-mono text-cyan-300 truncate">
                {player.sensesConfig?.darkvision 
                  ? `${player.sensesConfig.darkvision} ft.` 
                  : (player.race?.toLowerCase().includes('elf') || player.race?.toLowerCase().includes('dwarf') || player.race?.toLowerCase().includes('tiefling') ? '60 ft.' : 'Normal')}
              </div>
              <div className="text-[10px] text-slate-500 truncate">
                {player.sensesConfig?.darkvision || (player.race?.toLowerCase().includes('elf') || player.race?.toLowerCase().includes('dwarf') || player.race?.toLowerCase().includes('tiefling'))
                  ? 'Darkvision' 
                  : 'Sight 60 ft.'}
              </div>
            </div>
          </div>
        </div>

        {/* Hit Points Bar with Interactive Modifiers */}
        <div className="p-4 rounded-2xl bg-surface-100 border border-surface-border space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex items-center space-x-2.5">
              <Heart className="w-5 h-5 text-red-400" />
              <span className="font-serif font-bold text-sm text-slate-100">
                Hit Points: <strong className="font-mono text-base text-red-400">{player.currentHp}</strong> / <span className="text-slate-400 font-mono">{player.maxHp}</span>
              </span>
              {player.tempHp > 0 && (
                <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-mono font-bold">
                  +{player.tempHp} Temp HP
                </span>
              )}
            </div>

            {/* Quick +/- Buttons */}
            <div className="flex items-center space-x-1.5 font-mono text-xs">
              <button
                type="button"
                onClick={() => handleAdjustHp(-5)}
                className="px-2.5 py-1 rounded-lg bg-surface-50 hover:bg-red-950 text-red-300 border border-surface-border transition-colors font-bold"
                title="Take 5 damage"
              >
                -5
              </button>
              <button
                type="button"
                onClick={() => handleAdjustHp(-1)}
                className="px-2 py-1 rounded-lg bg-surface-50 hover:bg-red-950 text-red-300 border border-surface-border transition-colors font-bold"
                title="Take 1 damage"
              >
                -1
              </button>
              <button
                type="button"
                onClick={() => handleAdjustHp(1)}
                className="px-2 py-1 rounded-lg bg-surface-50 hover:bg-emerald-950 text-emerald-300 border border-surface-border transition-colors font-bold"
                title="Heal 1 HP"
              >
                +1
              </button>
              <button
                type="button"
                onClick={() => handleAdjustHp(5)}
                className="px-2.5 py-1 rounded-lg bg-surface-50 hover:bg-emerald-950 text-emerald-300 border border-surface-border transition-colors font-bold"
                title="Heal 5 HP"
              >
                +5
              </button>
            </div>
          </div>

          <div className="w-full h-3 rounded-full bg-surface-50 overflow-hidden border border-surface-border p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                hpPercent > 50 ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : hpPercent > 20 ? 'bg-amber-500 shadow-sm shadow-amber-500/50' : 'bg-red-600 shadow-sm shadow-red-600/50'
              }`}
              style={{ width: `${hpPercent}%` }}
            />
          </div>
        </div>

        {/* 3-Column Core Character Sheet Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* COLUMN 1: 6 Ability Scores & Saves (Width 3.5 / 12) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Ability Scores Grid */}
            <div className="p-4 rounded-2xl bg-surface-100 border border-surface-border space-y-3">
              <h3 className="font-serif font-bold text-sm text-slate-200 flex items-center space-x-2">
                <Dices className="w-4 h-4 text-amber-400" />
                <span>Ability Scores & Checks</span>
              </h3>

              <div className="grid grid-cols-2 gap-2">
                {(['str', 'dex', 'con', 'int', 'wis', 'cha'] as AbilityKey[]).map((key) => {
                  const score = abilities[key];
                  const mod = mods[key];
                  return (
                    <div
                      key={key}
                      onClick={() => handleRollAbility(key.toUpperCase(), score)}
                      className="p-2.5 rounded-xl bg-surface-50 hover:bg-amber-500/15 border border-surface-border hover:border-amber-500/40 transition-all cursor-pointer flex items-center justify-between group"
                      title={`Click to roll ${key.toUpperCase()} Check`}
                    >
                      <div>
                        <div className="text-[11px] font-bold uppercase text-slate-300 group-hover:text-amber-300">
                          {key}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">Score: {score}</div>
                      </div>
                      <div className="px-2.5 py-1 rounded-lg bg-surface-100 border border-surface-border group-hover:border-amber-500/60 font-mono font-bold text-sm text-amber-400 shadow-sm">
                        {formatMod(mod)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Saving Throws */}
            <div className="p-4 rounded-2xl bg-surface-100 border border-surface-border space-y-3">
              <h3 className="font-serif font-bold text-sm text-slate-200 flex items-center space-x-2">
                <Shield className="w-4 h-4 text-blue-400" />
                <span>Saving Throws</span>
              </h3>

              <div className="space-y-1 text-xs">
                {saves.map((s) => (
                  <div
                    key={s.key}
                    onClick={() => handleRollSave(s.label, s.mod)}
                    className="p-2 rounded-lg bg-surface-50 hover:bg-surface-hover border border-surface-border hover:border-blue-500/40 flex items-center justify-between cursor-pointer transition-colors group"
                    title={`Click to roll ${s.label} Saving Throw`}
                  >
                    <div className="flex items-center space-x-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full border ${
                          s.isProf ? 'bg-blue-500 border-blue-400 shadow-sm shadow-blue-500/50' : 'bg-surface-100 border-surface-border'
                        }`}
                      />
                      <span className={`text-slate-200 group-hover:text-white ${s.isProf ? 'font-bold' : ''}`}>
                        {s.label}
                      </span>
                    </div>
                    <strong className="font-mono text-slate-100 font-bold">{formatMod(s.mod)}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* COLUMN 2: All 18 Skills (Width 4 / 12) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-4 rounded-2xl bg-surface-100 border border-surface-border space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-sm text-slate-200 flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                  <span>Skills ({skillsList.filter((s) => s.isProf).length} Proficient)</span>
                </h3>
              </div>

              <div className="space-y-1 text-xs max-h-[580px] overflow-y-auto pr-1">
                {skillsList.map((sk) => (
                  <div
                    key={sk.name}
                    onClick={() => handleRollSkill(sk.name, sk.mod)}
                    className={`p-2 rounded-lg border flex items-center justify-between cursor-pointer transition-colors group ${
                      sk.isProf
                        ? 'bg-emerald-950/20 border-emerald-800/40 hover:border-emerald-500/60'
                        : 'bg-surface-50 hover:bg-surface-hover border-surface-border'
                    }`}
                    title={`Click to roll ${sk.name} check (${formatMod(sk.mod)})`}
                  >
                    <div className="flex items-center space-x-2 truncate pr-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full border shrink-0 ${
                          sk.isProf ? 'bg-emerald-500 border-emerald-400 shadow-sm shadow-emerald-500/50' : 'bg-surface-100 border-surface-border'
                        }`}
                      />
                      <span className={`truncate text-slate-200 group-hover:text-white ${sk.isProf ? 'font-bold text-emerald-300' : ''}`}>
                        {sk.name}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono uppercase">
                        ({sk.ability})
                      </span>
                    </div>
                    <strong className="font-mono text-slate-100 font-bold shrink-0">{formatMod(sk.mod)}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* COLUMN 3: Attacks, Spells, Feats & Gear (Width 4.5 / 12) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Weapon Attacks & Masteries */}
            <div className="p-4 rounded-2xl bg-surface-100 border border-surface-border space-y-3">
              <h3 className="font-serif font-bold text-sm text-slate-200 flex items-center space-x-2">
                <Sword className="w-4 h-4 text-amber-400" />
                <span>Weapon Attacks & Masteries</span>
              </h3>

              <div className="space-y-2 text-xs">
                {player.weaponMasteries && player.weaponMasteries.length > 0 ? (
                  player.weaponMasteries.map((w, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleRollAttack(w, mods.str + pb, `1d8 + ${mods.str}`)}
                      className="p-3 rounded-xl bg-surface-50 hover:bg-amber-500/10 border border-surface-border hover:border-amber-500/40 transition-all cursor-pointer space-y-1 group"
                    >
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-100 group-hover:text-amber-300">{w}</strong>
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold">
                          +{mods.str + pb} to hit
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        Damage: 1d8 {formatMod(mods.str)} Physical
                      </div>
                    </div>
                  ))
                ) : (
                  <div
                    onClick={() => handleRollAttack('Unarmed Strike', mods.str + pb, `1 + ${mods.str}`)}
                    className="p-3 rounded-xl bg-surface-50 hover:bg-surface-hover border border-surface-border transition-all cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <strong className="text-slate-100">Unarmed Strike</strong>
                      <span className="font-mono font-bold text-amber-400">+{mods.str + pb}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">1 + {mods.str} Bludgeoning</div>
                  </div>
                )}
              </div>
            </div>

            {/* Spellcasting Section (if slots or spells present) */}
            {player.spellSlots && player.spellSlots.length > 0 && (
              <div className="p-4 rounded-2xl bg-surface-100 border border-surface-border space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-sm text-purple-300 flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span>Spellcasting & Slots</span>
                  </h3>
                  {player.spellSaveDc && (
                    <span className="px-2 py-0.5 rounded bg-purple-950 border border-purple-800 text-purple-300 font-mono text-xs font-bold">
                      Save DC {player.spellSaveDc}
                    </span>
                  )}
                </div>

                {/* Spell Slots */}
                <div className="space-y-2 pt-1">
                  {player.spellSlots.map((slot) => (
                    <div key={slot.level} className="flex items-center justify-between text-xs bg-surface-50 p-2 rounded-lg border border-surface-border">
                      <span className="text-slate-300 font-medium">Level {slot.level} Slots:</span>
                      <div className="flex space-x-1.5">
                        {Array.from({ length: slot.total }).map((_, sIdx) => {
                          const isUsed = sIdx < slot.used;
                          return (
                            <button
                              key={sIdx}
                              type="button"
                              onClick={() => handleToggleSpellSlot(slot.level, sIdx)}
                              className={`w-5 h-5 rounded border transition-all ${
                                isUsed
                                  ? 'bg-surface-100 border-surface-border text-transparent'
                                  : 'bg-purple-600 border-purple-400 shadow-md shadow-purple-500/40 text-white'
                              }`}
                              title={isUsed ? 'Expended (Click to restore)' : 'Available (Click to expend)'}
                            />
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Cantrips & Prepared */}
                {player.cantrips && player.cantrips.length > 0 && (
                  <div className="text-xs text-slate-300 pt-1">
                    <strong className="text-purple-400">Cantrips:</strong> {player.cantrips.join(', ')}
                  </div>
                )}
                {player.spellsKnown && player.spellsKnown.length > 0 && (
                  <div className="text-xs text-slate-300">
                    <strong className="text-indigo-400">Prepared Spells:</strong> {player.spellsKnown.join(', ')}
                  </div>
                )}
              </div>
            )}

            {/* Feats & Background Origin */}
            <div className="p-4 rounded-2xl bg-surface-100 border border-surface-border space-y-3">
              <h3 className="font-serif font-bold text-sm text-slate-200 flex items-center space-x-2">
                <Award className="w-4 h-4 text-amber-400" />
                <span>Origin Feats & Features</span>
              </h3>

              <div className="space-y-2 text-xs">
                {player.originFeat && (
                  <div className="p-2.5 rounded-lg bg-surface-50 border border-surface-border space-y-1">
                    <strong className="text-amber-400 block font-serif">Origin Feat: {player.originFeat}</strong>
                  </div>
                )}
                {player.feats && player.feats.filter((f) => f !== player.originFeat).map((feat, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-surface-50 border border-surface-border">
                    <span className="text-slate-200 font-medium">{feat}</span>
                  </div>
                ))}
                {player.proficiencies?.languages && (
                  <div className="text-[11px] text-slate-400 pt-1">
                    <strong>Languages:</strong> {player.proficiencies.languages.join(', ')}
                  </div>
                )}
              </div>
            </div>

            {/* Inventory & Lore Snippet */}
            {player.notes && (
              <div className="p-4 rounded-2xl bg-surface-100 border border-surface-border space-y-2">
                <h3 className="font-serif font-bold text-sm text-slate-200 flex items-center space-x-2">
                  <Package className="w-4 h-4 text-slate-400" />
                  <span>Equipment & Notes</span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap bg-surface-50 p-3 rounded-lg border border-surface-border">
                  {player.notes}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Print Modal */}
      {isPrintModalOpen && (
        <CharacterPrintModal
          player={player}
          onClose={() => setIsPrintModalOpen(false)}
        />
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
