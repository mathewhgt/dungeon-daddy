import React from 'react';
import {
  Sparkles,
  Sword,
  Shield,
  Heart,
  Footprints,
  Eye,
  Dices,
  CheckCircle2,
  Award,
  BookOpen,
  User,
  Zap,
  Flame,
  Music,
  Sun,
  Leaf,
  Feather,
  Crosshair,
  Package,
  Languages,
  Compass,
} from 'lucide-react';
import {
  CharacterCreationState,
  DerivedCharacterStats,
} from '../../types/characterCreator';
import {
  getMergedClasses,
  getMergedBackgrounds,
  getMergedSpecies,
  getMergedOriginFeats,
  WEAPON_MASTERIES_2024,
  calculateDerivedStats,
  formatModifier,
} from '../../services/characterCreationService';
import { TokenAvatar } from '../common/TokenAvatar';
import { useApp } from '../../context/AppContext';

interface PlayerCharacterCreationWalkthroughProps {
  step: number;
  characterState: CharacterCreationState;
}

const CLASS_ICONS: Record<string, React.ElementType> = {
  barbarian: Flame,
  bard: Music,
  cleric: Sun,
  druid: Leaf,
  fighter: Shield,
  monk: Zap,
  paladin: Crosshair,
  ranger: Crosshair,
  rogue: Feather,
  sorcerer: Sparkles,
  warlock: Eye,
  wizard: BookOpen,
};

const STEP_TITLES = [
  { step: 1, title: 'Step 1: Choose Your Class', subtitle: 'Class defines your core combat mechanics, hit dice, proficiencies, and future subclasses.' },
  { step: 2, title: 'Step 2: Determine Origin', subtitle: 'Background determines your ability score boosts and Origin Feat; Species grants your ancestral traits.' },
  { step: 3, title: 'Step 3: Ability Scores', subtitle: 'Strength, Dexterity, Constitution, Intelligence, Wisdom, and Charisma modifiers.' },
  { step: 4, title: 'Step 4: Masteries, Spells & Feats', subtitle: 'Specialized weapon effects, cantrips, spell preparations, and origin feats.' },
  { step: 5, title: 'Step 5: Identity, Alignment & Lore', subtitle: 'Moral alignment, character backstory, physical appearance, and starting equipment.' },
  { step: 6, title: 'Step 6: Character Sheet Review', subtitle: 'Final review of all combat vitals, saving throws, skills, and attacks.' },
];

export const PlayerCharacterCreationWalkthrough: React.FC<PlayerCharacterCreationWalkthroughProps> = ({
  step,
  characterState,
}) => {
  const { db } = useApp();
  const customOpts = React.useMemo(() => ({
    customSubclasses: db?.customSubclasses || [],
    customBackgrounds: db?.customBackgrounds || [],
    customSpecies: db?.customSpecies || [],
    customFeats: db?.customFeats || [],
  }), [db?.customSubclasses, db?.customBackgrounds, db?.customSpecies, db?.customFeats]);

  const classes = React.useMemo(() => getMergedClasses(db?.customSubclasses || []), [db?.customSubclasses]);
  const backgrounds = React.useMemo(() => getMergedBackgrounds(db?.customBackgrounds || []), [db?.customBackgrounds]);
  const species = React.useMemo(() => getMergedSpecies(db?.customSpecies || []), [db?.customSpecies]);
  const originFeats = React.useMemo(() => getMergedOriginFeats(db?.customFeats || []), [db?.customFeats]);

  const currentStepInfo = STEP_TITLES.find((s) => s.step === step) || STEP_TITLES[0];

  const selectedClass = classes.find((c) => c.id === characterState.selectedClassId) || classes[0];
  const selectedBackground = backgrounds.find((b) => b.id === characterState.selectedBackgroundId) || backgrounds[0];
  const selectedSpecies = species.find((s) => s.id === characterState.selectedSpeciesId) || species[0];

  const grantedBonusSpells = React.useMemo(() => {
    const spells: string[] = [];
    const sub = selectedClass.subclasses.find((s) => s.id === characterState.selectedSubclassId);
    if (sub?.bonusSpells) spells.push(...sub.bonusSpells);
    const featObj = originFeats.find((f) => selectedBackground.originFeat.includes(f.name));
    if (featObj?.bonusSpells) spells.push(...featObj.bonusSpells);
    if (selectedSpecies.id === 'human' && characterState.humanExtraFeat) {
      const extraFeat = originFeats.find((f) => f.name === characterState.humanExtraFeat);
      if (extraFeat?.bonusSpells) spells.push(...extraFeat.bonusSpells);
    }
    if (selectedBackground.bonusSpells) spells.push(...selectedBackground.bonusSpells);
    if (selectedSpecies.bonusSpells) spells.push(...selectedSpecies.bonusSpells);
    const lin = selectedSpecies.lineages?.find((l) => l.id === characterState.selectedLineageId);
    if (lin?.bonusSpells) spells.push(...lin.bonusSpells);
    return Array.from(new Set(spells));
  }, [selectedClass, selectedBackground, selectedSpecies, characterState.selectedSubclassId, characterState.humanExtraFeat, characterState.selectedLineageId, originFeats]);

  const derived = calculateDerivedStats(characterState, customOpts);
  const ClassIcon = CLASS_ICONS[selectedClass?.id] || Sword;

  return (
    <div className="w-full h-full bg-[#080c14] text-slate-100 flex flex-col justify-between p-8 md:p-12 overflow-y-auto animate-fadeIn select-none">
      {/* Top Header & Step Progress Bar */}
      <div className="max-w-6xl w-full mx-auto space-y-4">
        <div className="flex items-center justify-between border-b border-surface-border/80 pb-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 shadow-xl shadow-amber-500/20 font-bold">
              <Sparkles className="w-7 h-7" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400">
                D&D 2024 Character Walkthrough
              </div>
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-slate-100 tracking-wide">
                {currentStepInfo.title}
              </h1>
            </div>
          </div>

          <div className="text-right hidden sm:block">
            <span className="px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500 text-amber-300 font-serif font-bold text-sm">
              Step {step} of 6
            </span>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">{currentStepInfo.subtitle}</p>
          </div>
        </div>

        {/* Stepper Dots */}
        <div className="flex items-center space-x-2 pt-1">
          {[1, 2, 3, 4, 5, 6].map((st) => (
            <div
              key={st}
              className={`h-2 rounded-full flex-1 transition-all duration-500 ${
                st === step
                  ? 'bg-amber-500 shadow-lg shadow-amber-500/50'
                  : st < step
                  ? 'bg-emerald-500'
                  : 'bg-surface-50/50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main Center Presentation Area */}
      <div className="max-w-6xl w-full mx-auto flex-1 my-6 flex flex-col justify-center">
        {/* ========================================================================= */}
        {/* STEP 1: CLASS PRESENTATION */}
        {/* ========================================================================= */}
        {step === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Hero Card */}
            <div className="lg:col-span-5 p-8 rounded-3xl bg-surface-100/90 border-2 border-amber-500/60 shadow-2xl space-y-6 text-center flex flex-col items-center">
              <div
                className="w-24 h-24 rounded-3xl flex items-center justify-center shadow-2xl text-slate-950 font-bold"
                style={{ backgroundColor: selectedClass.color }}
              >
                <ClassIcon className="w-14 h-14" />
              </div>

              <div>
                <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold uppercase tracking-wider">
                  Chosen Class
                </span>
                <h2 className="font-serif text-4xl font-bold text-slate-100 mt-2">
                  {selectedClass.name}
                </h2>
                <p className="text-sm text-slate-300 mt-2 italic leading-relaxed">
                  "{selectedClass.description}"
                </p>
              </div>

              {/* Class Badges */}
              <div className="grid grid-cols-3 gap-3 w-full pt-2">
                <div className="p-3 rounded-2xl bg-surface-50 border border-surface-border text-center">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Hit Die</div>
                  <div className="text-lg font-bold text-slate-100 font-mono">d{selectedClass.hitDie}</div>
                </div>
                <div className="p-3 rounded-2xl bg-surface-50 border border-surface-border text-center">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Primary</div>
                  <div className="text-xs font-bold text-amber-400 truncate">{selectedClass.primaryAbility.split(' ')[0]}</div>
                </div>
                <div className="p-3 rounded-2xl bg-surface-50 border border-surface-border text-center">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Saves</div>
                  <div className="text-xs font-bold text-slate-100 font-mono">{selectedClass.savingThrows.join(', ').toUpperCase()}</div>
                </div>
              </div>
            </div>

            {/* Right Features & Subclass Breakdown */}
            <div className="lg:col-span-7 space-y-4">
              <h3 className="font-serif text-xl font-bold text-amber-400 flex items-center space-x-2">
                <Sparkles className="w-5 h-5" />
                <span>Level 1 Core Class Features</span>
              </h3>

              <div className="space-y-3">
                {selectedClass.level1Features.map((feat, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-surface-100/70 border border-surface-border space-y-1">
                    <strong className="text-sm font-bold text-slate-100 block">{feat.name}</strong>
                    <p className="text-xs text-slate-300 leading-relaxed">{feat.description}</p>
                  </div>
                ))}
              </div>

              {/* Selected Skills */}
              <div className="p-4 rounded-2xl bg-surface-100/70 border border-surface-border flex items-center justify-between">
                <div className="space-y-0.5">
                  <strong className="text-xs text-slate-200">Skill Proficiencies:</strong>
                  <div className="text-xs text-amber-300 font-medium">
                    {characterState.classSkillChoices.join(', ') || 'Selecting skills...'}
                  </div>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  {characterState.classSkillChoices.length} / {selectedClass.skillChoices.count} Chosen
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: ORIGIN PRESENTATION */}
        {/* ========================================================================= */}
        {step === 2 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Background Card */}
            <div className="p-8 rounded-3xl bg-surface-100/90 border-2 border-amber-500/50 shadow-2xl space-y-6 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-amber-400 font-serif font-bold text-xs uppercase tracking-widest">
                  <Award className="w-4 h-4" />
                  <span>Character Background</span>
                </div>
                <h2 className="font-serif text-3xl font-bold text-slate-100">
                  {selectedBackground.name}
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed italic">
                  {selectedBackground.description}
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t border-surface-border/80 text-xs">
                <div className="p-3 rounded-xl bg-surface-50 border border-surface-border">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Designated Stat Increases:</span>
                  <span className="text-sm font-bold text-amber-300 font-mono">
                    {selectedBackground.allowedAbilities.map((a) => a.toUpperCase()).join(' / ')}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-800">
                  <span className="text-[10px] text-purple-300 uppercase font-semibold block">Origin Feat Granted:</span>
                  <span className="text-sm font-bold text-purple-200">
                    {selectedBackground.originFeat}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-300 text-xs px-1">
                  <span><strong>Skills:</strong> {selectedBackground.skills.join(', ')}</span>
                  <span><strong>Tools:</strong> {selectedBackground.tools}</span>
                </div>
              </div>
            </div>

            {/* Species Card */}
            <div className="p-8 rounded-3xl bg-surface-100/90 border-2 border-emerald-500/50 shadow-2xl space-y-6 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-emerald-400 font-serif font-bold text-xs uppercase tracking-widest">
                  <Compass className="w-4 h-4" />
                  <span>Character Species</span>
                </div>
                <h2 className="font-serif text-3xl font-bold text-slate-100">
                  {selectedSpecies.name}
                </h2>
                <div className="flex items-center space-x-3 text-xs font-mono text-slate-400">
                  <span>Speed: {selectedSpecies.speed} ft</span>
                  <span>•</span>
                  <span>{selectedSpecies.vision}</span>
                  <span>•</span>
                  <span>Size: {characterState.selectedSize}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed italic">
                  {selectedSpecies.description}
                </p>
              </div>

              <div className="space-y-2 pt-4 border-t border-surface-border/80">
                <div className="text-xs font-bold text-emerald-400">Innate Species Traits:</div>
                <div className="space-y-2">
                  {selectedSpecies.traits.slice(0, 3).map((tr, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-surface-50 border border-surface-border text-xs">
                      <strong className="text-slate-100 block">{tr.name}</strong>
                      <p className="text-[11px] text-slate-400 leading-normal">{tr.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: ABILITY SCORES */}
        {/* ========================================================================= */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center space-y-1">
              <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold uppercase tracking-wider">
                Method: {characterState.abilityMethod.toUpperCase()}
              </span>
              <h2 className="font-serif text-3xl font-bold text-slate-100">
                Core Ability Scores & Modifiers
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { label: 'STRENGTH', key: 'str' as const, base: characterState.baseScores.str, bonus: characterState.backgroundBonusAssignment.str || 0, final: derived.finalScores.str, mod: derived.modifiers.str },
                { label: 'DEXTERITY', key: 'dex' as const, base: characterState.baseScores.dex, bonus: characterState.backgroundBonusAssignment.dex || 0, final: derived.finalScores.dex, mod: derived.modifiers.dex },
                { label: 'CONSTITUTION', key: 'con' as const, base: characterState.baseScores.con, bonus: characterState.backgroundBonusAssignment.con || 0, final: derived.finalScores.con, mod: derived.modifiers.con },
                { label: 'INTELLIGENCE', key: 'int' as const, base: characterState.baseScores.int, bonus: characterState.backgroundBonusAssignment.int || 0, final: derived.finalScores.int, mod: derived.modifiers.int },
                { label: 'WISDOM', key: 'wis' as const, base: characterState.baseScores.wis, bonus: characterState.backgroundBonusAssignment.wis || 0, final: derived.finalScores.wis, mod: derived.modifiers.wis },
                { label: 'CHARISMA', key: 'cha' as const, base: characterState.baseScores.cha, bonus: characterState.backgroundBonusAssignment.cha || 0, final: derived.finalScores.cha, mod: derived.modifiers.cha },
              ].map((ab) => (
                <div
                  key={ab.label}
                  className="p-6 rounded-3xl bg-surface-100/90 border-2 border-amber-500/50 shadow-2xl flex flex-col items-center justify-between text-center space-y-3"
                >
                  <div className="text-xs font-bold tracking-wider text-slate-400 font-serif">
                    {ab.label}
                  </div>

                  <div className="text-4xl font-serif font-black text-slate-100 font-mono">
                    {ab.final}
                  </div>

                  <div className="px-4 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-mono font-black text-lg shadow-md shadow-amber-500/20">
                    {formatModifier(ab.mod)}
                  </div>

                  <div className="text-[11px] font-mono text-slate-400 pt-2 border-t border-surface-border/50 w-full">
                    {ab.base} {ab.bonus > 0 ? `+ ${ab.bonus} BG` : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: WEAPON MASTERIES & SPELLS */}
        {/* ========================================================================= */}
        {step === 4 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Weapon Masteries */}
            <div className="p-8 rounded-3xl bg-surface-100/90 border-2 border-amber-500/50 shadow-2xl space-y-4">
              <div className="flex items-center space-x-2 text-amber-400 font-serif font-bold text-sm uppercase tracking-widest">
                <Sword className="w-5 h-5" />
                <span>Weapon Masteries</span>
              </div>

              {characterState.selectedWeaponMasteries.length > 0 ? (
                <div className="space-y-3">
                  {characterState.selectedWeaponMasteries.map((wId) => {
                    return (
                      <div key={wId} className="p-4 rounded-2xl bg-surface-50 border border-surface-border flex items-center justify-between">
                        <span className="text-base font-bold text-slate-100 capitalize">{wId}</span>
                        <span className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-mono font-bold text-xs">
                          Mastered
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No weapon masteries unlocked for this class.</p>
              )}
            </div>

            {/* Spells & Magic */}
            <div className="p-8 rounded-3xl bg-surface-100/90 border-2 border-purple-500/50 shadow-2xl space-y-4">
              <div className="flex items-center space-x-2 text-purple-400 font-serif font-bold text-sm uppercase tracking-widest">
                <Sparkles className="w-5 h-5" />
                <span>Spellcasting & Cantrips</span>
              </div>

              {selectedClass.spellcasting ? (
                <div className="space-y-3">
                  <div className="text-xs text-slate-300">
                    Spellcasting Ability: <strong className="text-purple-300 uppercase">{selectedClass.spellcasting.ability}</strong> · Save DC: <strong className="text-purple-300">{derived.spellSaveDc}</strong>
                  </div>

                  <div className="space-y-2">
                    <strong className="text-xs text-purple-300 block">Cantrips:</strong>
                    <div className="flex flex-wrap gap-2">
                      {characterState.selectedCantrips.map((c) => (
                        <span key={c} className="px-3 py-1 rounded-xl bg-purple-950/60 border border-purple-700 text-purple-200 text-xs font-bold">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <strong className="text-xs text-indigo-300 block">1st-Level Spells Prepared:</strong>
                    <div className="flex flex-wrap gap-2">
                      {characterState.selectedSpells.map((s) => (
                        <span key={s} className="px-3 py-1 rounded-xl bg-indigo-950/60 border border-indigo-700 text-indigo-200 text-xs font-bold">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {grantedBonusSpells.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-surface-border/50">
                      <strong className="text-xs text-purple-400 block font-serif">Granted / Subclass Spells:</strong>
                      <div className="flex flex-wrap gap-2">
                        {grantedBonusSpells.map((sp) => (
                          <span key={sp} className="px-3 py-1 rounded-xl bg-purple-900/60 border border-purple-600 text-purple-100 text-xs font-bold font-mono">
                            ✨ {sp}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : grantedBonusSpells.length > 0 ? (
                <div className="space-y-3">
                  <div className="text-xs text-purple-300">
                    Granted Spells from Subclass / Feat / Species:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {grantedBonusSpells.map((sp) => (
                      <span key={sp} className="px-3 py-1 rounded-xl bg-purple-900/60 border border-purple-600 text-purple-100 text-xs font-bold font-mono">
                        ✨ {sp}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">This class relies on physical prowess and martial weapons.</p>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 5: IDENTITY & BACKSTORY */}
        {/* ========================================================================= */}
        {step === 5 && (
          <div className="p-8 rounded-3xl bg-surface-100/90 border-2 border-blue-500/50 shadow-2xl space-y-6">
            <div className="flex items-center space-x-4 border-b border-surface-border pb-6">
              <TokenAvatar
                name={characterState.characterName || 'Hero'}
                imageUrl={characterState.avatarUrl}
                tokenUrl={characterState.tokenUrl}
                type="player"
                characterClass={selectedClass.name}
                size="xl"
              />

              <div>
                <h2 className="font-serif text-3xl font-bold text-slate-100">
                  {characterState.characterName || 'Hero Adventurer'}
                </h2>
                <div className="text-sm text-blue-400 font-medium">
                  {characterState.alignment} · Level 1 {selectedSpecies.name} {selectedClass.name}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-surface-50 border border-surface-border space-y-1">
                  <strong className="text-slate-300 block text-xs">Personality Traits:</strong>
                  <p className="text-slate-400 leading-relaxed italic">{characterState.personalityTraits || 'Traits in progress...'}</p>
                </div>

                <div className="p-4 rounded-2xl bg-surface-50 border border-surface-border space-y-1">
                  <strong className="text-slate-300 block text-xs">Ideals & Bonds:</strong>
                  <p className="text-slate-400 leading-relaxed italic">{characterState.ideals || 'Ideals in progress...'}</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-surface-50 border border-surface-border space-y-1">
                <strong className="text-slate-300 block text-xs">Backstory:</strong>
                <p className="text-slate-400 leading-relaxed italic">{characterState.backstory || 'Backstory in progress...'}</p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 6: FINAL CHARACTER SHEET */}
        {/* ========================================================================= */}
        {step === 6 && (
          <div className="p-8 rounded-3xl bg-surface-100/90 border-2 border-emerald-500/60 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-surface-border pb-4">
              <div className="flex items-center space-x-4">
                <TokenAvatar
                  name={characterState.characterName || 'Hero'}
                  imageUrl={characterState.avatarUrl}
                  tokenUrl={characterState.tokenUrl}
                  type="player"
                  characterClass={selectedClass.name}
                  size="lg"
                />
                <div>
                  <h2 className="font-serif text-3xl font-bold text-slate-100">
                    {characterState.characterName || 'Hero Adventurer'}
                  </h2>
                  <div className="text-xs text-emerald-400 font-semibold">
                    Level 1 {selectedSpecies.name} {selectedClass.name} ({selectedBackground.name})
                  </div>
                </div>
              </div>

              <div className="px-4 py-2 rounded-2xl bg-emerald-950/80 border border-emerald-500 text-emerald-300 font-serif font-bold text-sm">
                Ready for Adventure
              </div>
            </div>

            {/* Vitals */}
            <div className="grid grid-cols-4 gap-3 text-center">
              <div className="p-4 rounded-2xl bg-surface-50 border border-surface-border">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Armor Class</div>
                <div className="text-2xl font-bold text-slate-100 font-mono">{derived.armorClass}</div>
              </div>
              <div className="p-4 rounded-2xl bg-surface-50 border border-surface-border">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Hit Points</div>
                <div className="text-2xl font-bold text-red-400 font-mono">{derived.maxHp} HP</div>
              </div>
              <div className="p-4 rounded-2xl bg-surface-50 border border-surface-border">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Initiative</div>
                <div className="text-2xl font-bold text-amber-400 font-mono">{formatModifier(derived.initiativeBonus)}</div>
              </div>
              <div className="p-4 rounded-2xl bg-surface-50 border border-surface-border">
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Speed</div>
                <div className="text-2xl font-bold text-emerald-400 font-mono">{derived.speed}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Live Ambient Vitals Bar */}
      <div className="max-w-6xl w-full mx-auto p-4 rounded-2xl bg-surface-100/80 border border-surface-border flex items-center justify-between text-xs font-mono text-slate-300">
        <div className="flex items-center space-x-2 font-serif font-bold text-slate-200">
          <span>{characterState.characterName || 'Hero'}</span>
          <span>•</span>
          <span className="text-amber-400">{selectedClass.name}</span>
        </div>

        <div className="flex items-center space-x-4">
          <span>AC: <strong className="text-slate-100">{derived.armorClass}</strong></span>
          <span>HP: <strong className="text-slate-100">{derived.maxHp}</strong></span>
          <span>Init: <strong className="text-slate-100">+{derived.initiativeBonus}</strong></span>
          <span>PB: <strong className="text-emerald-400">+2</strong></span>
        </div>
      </div>
    </div>
  );
};
