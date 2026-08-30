import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Sword,
  Shield,
  BookOpen,
  CheckCircle2,
  Search,
  Filter,
  Info,
  Flame,
  Zap,
  Eye,
  Award,
  Layers,
  Wand2,
} from 'lucide-react';
import {
  CharacterCreationState,
  WeaponItem2024,
  WeaponMasteryDefinition2024,
} from '../../../types/characterCreator';
import {
  getMergedClasses,
  getMergedBackgrounds,
  getMergedSpecies,
  getMergedOriginFeats,
  WEAPONS_2024,
  WEAPON_MASTERIES_2024,
  SKILL_DEFINITIONS,
} from '../../../services/characterCreationService';
import { useApp } from '../../../context/AppContext';
import { SpellEntity } from '../../../types/spell';
import { RulesInspectionModal } from './RulesInspectionModal';

interface StepFeaturesAndSpellsProps {
  state: CharacterCreationState;
  onChange: (updates: Partial<CharacterCreationState>) => void;
}

export const StepFeaturesAndSpells: React.FC<StepFeaturesAndSpellsProps> = ({ state, onChange }) => {
  const { db } = useApp();
  const classes = useMemo(() => getMergedClasses(db.customSubclasses || []), [db.customSubclasses]);
  const backgrounds = useMemo(() => getMergedBackgrounds(db.customBackgrounds || []), [db.customBackgrounds]);
  const speciesList = useMemo(() => getMergedSpecies(db.customSpecies || []), [db.customSpecies]);
  const originFeats = useMemo(() => getMergedOriginFeats(db.customFeats || []), [db.customFeats]);

  const selectedClass = classes.find((c) => c.id === state.selectedClassId) || classes[0];
  const selectedBackground = backgrounds.find((b) => b.id === state.selectedBackgroundId) || backgrounds[0];
  const selectedSpecies = speciesList.find((s) => s.id === state.selectedSpeciesId) || speciesList[0];
  const selectedSubclass = selectedClass.subclasses.find((s) => s.id === state.selectedSubclassId);
  const isHuman = state.selectedSpeciesId === 'human';
  const bgOriginFeatObj = originFeats.find((f) => selectedBackground.originFeat.includes(f.name));
  const humanExtraFeatObj = isHuman && state.humanExtraFeat ? originFeats.find((f) => f.name === state.humanExtraFeat) : null;
  const selectedLineage = selectedSpecies.lineages?.find((l) => l.id === state.selectedLineageId);

  // Group bonus spells by source
  const grantedSpellsList = useMemo(() => {
    const list: { name: string; source: string; spellObj?: SpellEntity }[] = [];
    const addedNames = new Set<string>();

    const addSpells = (spells: string[] | undefined, source: string) => {
      (spells || []).forEach((spName) => {
        if (!addedNames.has(spName)) {
          addedNames.add(spName);
          const spellObj = db.spells?.find((s) => s.name.toLowerCase() === spName.toLowerCase());
          list.push({ name: spName, source, spellObj });
        }
      });
    };

    if (selectedSubclass?.bonusSpells) {
      addSpells(selectedSubclass.bonusSpells, `Subclass (${selectedSubclass.name})`);
    }
    if (bgOriginFeatObj?.bonusSpells) {
      addSpells(bgOriginFeatObj.bonusSpells, `Origin Feat (${bgOriginFeatObj.name})`);
    }
    if (humanExtraFeatObj?.bonusSpells) {
      addSpells(humanExtraFeatObj.bonusSpells, `Human Feat (${humanExtraFeatObj.name})`);
    }
    if (selectedBackground.bonusSpells) {
      addSpells(selectedBackground.bonusSpells, `Background (${selectedBackground.name})`);
    }
    if (selectedSpecies.bonusSpells) {
      addSpells(selectedSpecies.bonusSpells, `Species (${selectedSpecies.name})`);
    }
    if (selectedLineage?.bonusSpells) {
      addSpells(selectedLineage.bonusSpells, `Lineage (${selectedLineage.name})`);
    }

    return list;
  }, [selectedSubclass, bgOriginFeatObj, humanExtraFeatObj, selectedBackground, selectedSpecies, selectedLineage, db.spells]);

  const [spellSearch, setSpellSearch] = useState('');
  const [selectedSchool, setSelectedSchool] = useState<string>('all');
  const [inspectingMastery, setInspectingMastery] = useState<WeaponMasteryDefinition2024 | null>(null);
  const [inspectingSpell, setInspectingSpell] = useState<SpellEntity | null>(null);

  // Determine which weapons this class is proficient with
  const eligibleWeapons = useMemo(() => {
    return WEAPONS_2024.filter((w) => {
      if (selectedClass.weaponProficiencies.includes('Martial Weapons')) return true;
      if (selectedClass.weaponProficiencies.includes('Simple Weapons') && w.category === 'Simple') return true;
      if (selectedClass.id === 'rogue' && (w.category === 'Simple' || w.properties.includes('Finesse') || w.properties.includes('Light'))) return true;
      if (selectedClass.id === 'monk' && (w.category === 'Simple' || (w.category === 'Martial' && w.properties.includes('Light')))) return true;
      return false;
    });
  }, [selectedClass]);

  // Handle Weapon Mastery toggles
  const handleToggleWeaponMastery = (weaponId: string) => {
    const current = [...state.selectedWeaponMasteries];
    const idx = current.indexOf(weaponId);
    const max = selectedClass.weaponMasteriesCount;

    if (idx !== -1) {
      current.splice(idx, 1);
      onChange({ selectedWeaponMasteries: current });
    } else {
      if (current.length < max) {
        current.push(weaponId);
        onChange({ selectedWeaponMasteries: current });
      }
    }
  };

  // Determine Class Spells
  const isCaster = !!selectedClass.spellcasting;
  const cantripsAllowed = selectedClass.spellcasting?.cantripsKnown || 0;
  const spellsAllowed = selectedClass.spellcasting?.spellsPrepared || 0;

  // Filter compendium spells
  const classSpells = useMemo(() => {
    if (!isCaster) return { cantrips: [], level1: [] };
    const all = db.spells || [];
    const className = selectedClass.name;

    const filtered = all.filter((s) => {
      const matchClass = s.classes.some((c) => c.toLowerCase() === className.toLowerCase());
      const matchSearch = !spellSearch || s.name.toLowerCase().includes(spellSearch.toLowerCase()) || s.description.toLowerCase().includes(spellSearch.toLowerCase());
      const matchSchool = selectedSchool === 'all' || s.school.toLowerCase() === selectedSchool.toLowerCase();
      return matchClass && matchSearch && matchSchool;
    });

    return {
      cantrips: filtered.filter((s) => s.level === 0),
      level1: filtered.filter((s) => s.level === 1),
    };
  }, [db.spells, isCaster, selectedClass, spellSearch, selectedSchool]);

  const handleToggleCantrip = (spellName: string) => {
    const current = [...state.selectedCantrips];
    const idx = current.indexOf(spellName);
    if (idx !== -1) {
      current.splice(idx, 1);
      onChange({ selectedCantrips: current });
    } else {
      if (current.length < cantripsAllowed) {
        current.push(spellName);
        onChange({ selectedCantrips: current });
      }
    }
  };

  const handleToggleSpell = (spellName: string) => {
    const current = [...state.selectedSpells];
    const idx = current.indexOf(spellName);
    if (idx !== -1) {
      current.splice(idx, 1);
      onChange({ selectedSpells: current });
    } else {
      if (current.length < spellsAllowed) {
        current.push(spellName);
        onChange({ selectedSpells: current });
      }
    }
  };

  // Check if Magic Initiate feat is present
  const hasMagicInitiate = selectedBackground.originFeat.includes('Magic Initiate') || (isHuman && state.humanExtraFeat === 'Magic Initiate');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500/10 via-surface-100 to-surface-100 border border-purple-500/20">
        <h2 className="font-serif font-bold text-lg text-slate-100 flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <span>Step 4: Weapon Masteries, Spells & Origin Feats</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
          Configure your martial <strong>Weapon Masteries</strong> (unlocking special properties like Nick, Push, Topple, or Vex), select starting <strong>Cantrips & Spells</strong> for spellcasters, and configure <strong>Origin Feat</strong> choices.
        </p>
      </div>

      {/* SECTION 1: WEAPON MASTERIES */}
      {selectedClass.weaponMasteriesCount > 0 ? (
        <div className="p-5 rounded-2xl bg-surface-100 border border-surface-border space-y-4">
          <div className="flex items-center justify-between border-b border-surface-border pb-3 flex-wrap gap-2">
            <div>
              <h3 className="font-serif font-bold text-base text-slate-100 flex items-center space-x-2">
                <Sword className="w-4 h-4 text-amber-400" />
                <span>Weapon Mastery System (Pick {selectedClass.weaponMasteriesCount})</span>
              </h3>
              <p className="text-xs text-slate-400">
                Choose weapons your character has mastered to unlock their secondary combat properties.
              </p>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${
                state.selectedWeaponMasteries.length === selectedClass.weaponMasteriesCount
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                  : 'bg-amber-950 text-amber-300 border-amber-800'
              }`}
            >
              Mastered: {state.selectedWeaponMasteries.length} / {selectedClass.weaponMasteriesCount}
            </span>
          </div>

          {/* 8 Weapon Mastery Properties Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {WEAPON_MASTERIES_2024.map((wm) => (
              <div
                key={wm.id}
                onClick={() => setInspectingMastery(wm)}
                className="p-2.5 rounded-lg bg-surface-50 border border-surface-border hover:border-amber-500/50 cursor-pointer transition-all flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 font-mono">{wm.name}</span>
                  <Info className="w-3 h-3 text-slate-400" />
                </div>
                <p className="text-[10px] text-slate-400 line-clamp-1 mt-1">{wm.summary}</p>
              </div>
            ))}
          </div>

          {/* Eligible Weapon Selection Grid */}
          <div className="space-y-2 pt-2">
            <div className="text-xs font-bold text-slate-300">
              Select {selectedClass.weaponMasteriesCount} Proficient Weapons:
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 max-h-72 overflow-y-auto pr-1">
              {eligibleWeapons.map((weapon) => {
                const isSelected = state.selectedWeaponMasteries.includes(weapon.id);
                return (
                  <div
                    key={weapon.id}
                    onClick={() => handleToggleWeaponMastery(weapon.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500 ring-1 ring-amber-500/40'
                        : 'bg-surface-50 border-surface-border hover:border-slate-500'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <strong className="text-xs text-slate-100">{weapon.name}</strong>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
                      </div>

                      <div className="mt-1 flex items-center space-x-1.5 text-[10px] text-slate-400 font-mono">
                        <span>{weapon.damage} {weapon.damageType}</span>
                        <span>·</span>
                        <span>{weapon.category}</span>
                      </div>
                    </div>

                    <div className="mt-2 pt-1.5 border-t border-surface-border/50 flex items-center justify-between text-[10px]">
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 font-mono font-bold">
                        {weapon.masteryProperty}
                      </span>
                      <span className="text-slate-500">{weapon.rangeType}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}

      {/* SECTION: GRANTED SUBCLASS, FEAT & INNATE SPELLS */}
      {grantedSpellsList.length > 0 && (
        <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-950/30 via-surface-100 to-surface-100 border border-purple-800/40 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-purple-900/40 pb-3 flex-wrap gap-2">
            <div>
              <h3 className="font-serif font-bold text-base text-purple-200 flex items-center space-x-2">
                <Wand2 className="w-4 h-4 text-purple-400" />
                <span>Granted & Always Prepared Spells</span>
              </h3>
              <p className="text-xs text-slate-400">
                These spells are automatically granted by your subclass, origin feat, species, or background and do not count against your prepared spells limit.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-purple-900/60 border border-purple-700 text-purple-200">
              {grantedSpellsList.length} Granted Spell{grantedSpellsList.length > 1 ? 's' : ''}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {grantedSpellsList.map((item) => {
              const spell = item.spellObj;
              return (
                <div
                  key={item.name}
                  className="p-3 rounded-xl bg-surface-50/80 border border-purple-900/30 flex flex-col justify-between hover:border-purple-600/50 transition-colors"
                >
                  <div>
                    <div className="flex items-start justify-between gap-1">
                      <strong className="text-xs text-purple-200 font-semibold">{item.name}</strong>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-mono shrink-0">
                        {item.source}
                      </span>
                    </div>

                    {spell ? (
                      <div className="mt-1.5 space-y-1">
                        <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-mono">
                          <span>{spell.level === 0 ? 'Cantrip' : `Level ${spell.level}`}</span>
                          <span>·</span>
                          <span>{spell.school}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-2">{spell.description}</p>
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400 mt-1 italic">Granted special spell.</p>
                    )}
                  </div>

                  {spell && (
                    <button
                      type="button"
                      onClick={() => setInspectingSpell(spell)}
                      className="mt-2 pt-1 border-t border-purple-900/30 text-[10px] text-purple-400 hover:text-purple-300 text-left flex items-center space-x-1"
                    >
                      <Info className="w-3 h-3" />
                      <span>View Spell Details</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 2: SPELLCASTING SELECTION */}
      {isCaster && (
        <div className="p-5 rounded-2xl bg-surface-100 border border-surface-border space-y-5">
          <div className="flex items-center justify-between border-b border-surface-border pb-3 flex-wrap gap-2">
            <div>
              <h3 className="font-serif font-bold text-base text-slate-100 flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>{selectedClass.name} Spellcasting (Level 1)</span>
              </h3>
              <p className="text-xs text-slate-400">
                Spellcasting Ability: <strong>{selectedClass.spellcasting?.ability.toUpperCase()}</strong> · Select your starting cantrips and 1st-level spells.
              </p>
            </div>

            {/* Search and Filters */}
            <div className="flex items-center space-x-2">
              <div className="relative w-48">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter spells..."
                  value={spellSearch}
                  onChange={(e) => setSpellSearch(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1.5 bg-surface-50 border border-surface-border rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <select
                value={selectedSchool}
                onChange={(e) => setSelectedSchool(e.target.value)}
                className="px-2.5 py-1.5 bg-surface-50 border border-surface-border rounded-lg text-xs text-slate-300 focus:outline-none focus:border-purple-500"
              >
                <option value="all">All Schools</option>
                <option value="abjuration">Abjuration</option>
                <option value="conjuration">Conjuration</option>
                <option value="divination">Divination</option>
                <option value="enchantment">Enchantment</option>
                <option value="evocation">Evocation</option>
                <option value="illusion">Illusion</option>
                <option value="necromancy">Necromancy</option>
                <option value="transmutation">Transmutation</option>
              </select>
            </div>
          </div>

          {/* Cantrips Selector */}
          {cantripsAllowed > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-purple-300 flex items-center space-x-1.5">
                  <span>Cantrips (Choose {cantripsAllowed}):</span>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold border ${
                    state.selectedCantrips.length === cantripsAllowed
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                      : 'bg-purple-950 text-purple-300 border-purple-800'
                  }`}
                >
                  {state.selectedCantrips.length} / {cantripsAllowed}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
                {classSpells.cantrips.map((spell) => {
                  const isSelected = state.selectedCantrips.includes(spell.name);
                  return (
                    <div
                      key={spell.id}
                      onClick={() => handleToggleCantrip(spell.name)}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-purple-500/15 border-purple-500 ring-1 ring-purple-500/40'
                          : 'bg-surface-50 border-surface-border hover:border-slate-500'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <strong className="text-xs text-slate-100">{spell.name}</strong>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />}
                        </div>
                        <div className="text-[10px] text-purple-400 font-mono mt-0.5">
                          {spell.school} · {spell.castingTime} · {spell.range}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{spell.description}</p>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setInspectingSpell(spell);
                        }}
                        className="mt-2 pt-1 border-t border-surface-border/50 text-[10px] text-purple-400 hover:text-purple-300 text-left flex items-center space-x-1"
                      >
                        <Info className="w-3 h-3" />
                        <span>View Full Spell</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 1st-Level Spells Selector */}
          {spellsAllowed > 0 && (
            <div className="space-y-2.5 pt-3 border-t border-surface-border">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-indigo-300 flex items-center space-x-1.5">
                  <span>1st-Level Spells Prepared (Choose {spellsAllowed}):</span>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold border ${
                    state.selectedSpells.length === spellsAllowed
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                      : 'bg-indigo-950 text-indigo-300 border-indigo-800'
                  }`}
                >
                  {state.selectedSpells.length} / {spellsAllowed}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1">
                {classSpells.level1.map((spell) => {
                  const isSelected = state.selectedSpells.includes(spell.name);
                  return (
                    <div
                      key={spell.id}
                      onClick={() => handleToggleSpell(spell.name)}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'bg-indigo-500/15 border-indigo-500 ring-1 ring-indigo-500/40'
                          : 'bg-surface-50 border-surface-border hover:border-slate-500'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <strong className="text-xs text-slate-100">{spell.name}</strong>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />}
                        </div>
                        <div className="text-[10px] text-indigo-400 font-mono mt-0.5">
                          {spell.school} · {spell.castingTime} · {spell.range}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{spell.description}</p>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setInspectingSpell(spell);
                        }}
                        className="mt-2 pt-1 border-t border-surface-border/50 text-[10px] text-indigo-400 hover:text-indigo-300 text-left flex items-center space-x-1"
                      >
                        <Info className="w-3 h-3" />
                        <span>View Full Spell</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECTION 3: ORIGIN FEAT DETAILS */}
      <div className="p-4 rounded-xl bg-surface-100 border border-surface-border space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Award className="w-4 h-4 text-amber-400" />
            <h4 className="font-serif font-bold text-sm text-slate-100">
              Origin Feat: {selectedBackground.originFeat}
            </h4>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-50 border border-surface-border text-slate-400">
            Granted by Background
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          {originFeats.find((f) => selectedBackground.originFeat.includes(f.name))?.description ||
            selectedBackground.originFeat}
        </p>

        {/* Extra Human Feat display if applicable */}
        {isHuman && state.humanExtraFeat && (
          <div className="pt-2 border-t border-surface-border text-xs text-slate-300 space-y-1">
            <strong className="text-amber-400">Human Bonus Origin Feat: {state.humanExtraFeat}</strong>
            <p className="text-[11px] text-slate-400">
              {originFeats.find((f) => f.name === state.humanExtraFeat)?.description}
            </p>
          </div>
        )}
      </div>

      {/* Rules Inspection Modals */}
      {inspectingMastery && (
        <RulesInspectionModal
          title={`Weapon Mastery: ${inspectingMastery.name}`}
          category="D&D 2024 Weapon System"
          description={inspectingMastery.description}
          features={[
            { name: 'Applicable Weapons', description: inspectingMastery.weapons.join(', ') },
          ]}
          handbookTarget={{
            chapterId: 'chapter-6-equipment',
            entityId: inspectingMastery.id,
          }}
          onClose={() => setInspectingMastery(null)}
        />
      )}

      {inspectingSpell && (
        <RulesInspectionModal
          title={`Spell: ${inspectingSpell.name} (Level ${inspectingSpell.level})`}
          category={`${inspectingSpell.school} Spell`}
          description={inspectingSpell.description}
          features={[
            { name: 'Casting Time', description: inspectingSpell.castingTime },
            { name: 'Range', description: inspectingSpell.range },
            { name: 'Duration', description: inspectingSpell.duration },
            { name: 'Components', description: `Verbal: ${inspectingSpell.components.verbal ? 'Yes' : 'No'}, Somatic: ${inspectingSpell.components.somatic ? 'Yes' : 'No'}, Material: ${inspectingSpell.components.materialCost || 'None'}` },
          ]}
          tags={inspectingSpell.classes}
          onClose={() => setInspectingSpell(null)}
        />
      )}
    </div>
  );
};
