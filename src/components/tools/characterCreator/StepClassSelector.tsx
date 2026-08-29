import React, { useState } from 'react';
import {
  Shield,
  Heart,
  Sparkles,
  CheckCircle2,
  BookOpen,
  Zap,
  Sword,
  Crosshair,
  Flame,
  Music,
  Sun,
  Leaf,
  Feather,
  Eye,
  Info,
} from 'lucide-react';
import {
  CharacterCreationState,
  ClassDefinition2024,
} from '../../../types/characterCreator';
import { CLASSES_2024, SKILL_DEFINITIONS } from '../../../services/characterCreationService';
import { RulesInspectionModal } from './RulesInspectionModal';

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

interface StepClassSelectorProps {
  state: CharacterCreationState;
  onChange: (updates: Partial<CharacterCreationState>) => void;
}

export const StepClassSelector: React.FC<StepClassSelectorProps> = ({ state, onChange }) => {
  const [inspectingClass, setInspectingClass] = useState<ClassDefinition2024 | null>(null);

  const selectedClass = CLASSES_2024.find((c) => c.id === state.selectedClassId) || CLASSES_2024[0];

  const handleSelectClass = (cls: ClassDefinition2024) => {
    // Determine default skills
    const allowedSkills = cls.skillChoices.options[0] === 'Any'
      ? SKILL_DEFINITIONS.map((s) => s.name)
      : cls.skillChoices.options;
    const defaultSkills = allowedSkills.slice(0, cls.skillChoices.count);

    // Default weapon masteries count
    const defaultMasteries = cls.weaponMasteriesCount > 0
      ? cls.id === 'fighter'
        ? ['greatsword', 'longbow', 'handaxe']
        : ['longsword', 'shortbow']
      : [];

    onChange({
      selectedClassId: cls.id,
      selectedSubclassId: cls.subclasses[0]?.id,
      classSkillChoices: defaultSkills,
      selectedOrderOrStyle: cls.orderChoices?.options[0]?.name || cls.fightingStyleChoices?.[0],
      selectedWeaponMasteries: defaultMasteries,
    });
  };

  const handleToggleSkill = (skillName: string) => {
    const current = [...state.classSkillChoices];
    const idx = current.indexOf(skillName);
    const max = selectedClass.skillChoices.count;

    if (idx !== -1) {
      current.splice(idx, 1);
      onChange({ classSkillChoices: current });
    } else {
      if (current.length < max) {
        current.push(skillName);
        onChange({ classSkillChoices: current });
      }
    }
  };

  const availableSkillOptions = selectedClass.skillChoices.options[0] === 'Any'
    ? SKILL_DEFINITIONS.map((s) => s.name)
    : selectedClass.skillChoices.options;

  const remainingSkillPicks = Math.max(0, selectedClass.skillChoices.count - state.classSkillChoices.length);

  return (
    <div className="space-y-6">
      {/* Intro Heading */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-surface-100 to-surface-100 border border-amber-500/20">
        <h2 className="font-serif font-bold text-lg text-slate-100 flex items-center space-x-2">
          <span>Step 1: Choose Your Class</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
          Your class is the primary definition of what your character can do in combat, spellcasting, and exploration.
          In the 2024 PHB, all 12 classes feature redesigned core mechanics, weapon masteries, and 4 distinct subclasses unlocking at Level 3.
        </p>
      </div>

      {/* 12-Class Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {CLASSES_2024.map((cls) => {
          const Icon = CLASS_ICONS[cls.id] || Sword;
          const isSelected = cls.id === state.selectedClassId;

          return (
            <div
              key={cls.id}
              onClick={() => handleSelectClass(cls)}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all duration-200 flex flex-col justify-between relative group ${
                isSelected
                  ? 'bg-amber-500/10 border-amber-500 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/50'
                  : 'bg-surface-100/80 border-surface-border hover:border-slate-500 hover:bg-surface-50'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div
                    className="p-2 rounded-lg"
                    style={{
                      backgroundColor: `${cls.color}20`,
                      color: cls.color,
                    }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <span className="px-1.5 py-0.5 rounded bg-surface-50 border border-surface-border text-[10px] font-mono text-slate-300">
                      d{cls.hitDie} HP
                    </span>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-amber-400 animate-scaleUp" />
                    )}
                  </div>
                </div>

                <div className="mt-2.5">
                  <h3 className="font-serif font-bold text-slate-100 text-sm">{cls.name}</h3>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">{cls.primaryAbility}</p>
                </div>

                <p className="text-[11px] text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                  {cls.description}
                </p>
              </div>

              {/* Bottom Specs */}
              <div className="mt-3 pt-2.5 border-t border-surface-border/60 flex items-center justify-between text-[10px] text-slate-400">
                <span className="font-mono">Saves: {cls.savingThrows.join(', ').toUpperCase()}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setInspectingClass(cls);
                  }}
                  className="text-amber-400/80 hover:text-amber-300 flex items-center space-x-0.5"
                  title="Inspect full class details"
                >
                  <Info className="w-3.5 h-3.5" />
                  <span>Details</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Class Customization Panel */}
      <div className="p-5 rounded-2xl bg-surface-100 border border-surface-border space-y-6">
        <div className="flex items-center justify-between border-b border-surface-border pb-3">
          <div className="flex items-center space-x-3">
            <div
              className="p-2.5 rounded-xl text-slate-950 font-bold"
              style={{ backgroundColor: selectedClass.color }}
            >
              {React.createElement(CLASS_ICONS[selectedClass.id] || Sword, { className: 'w-5 h-5' })}
            </div>
            <div>
              <h3 className="font-serif font-bold text-slate-100 text-base flex items-center space-x-2">
                <span>{selectedClass.name} Features & Customization</span>
              </h3>
              <p className="text-xs text-slate-400">{selectedClass.description}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setInspectingClass(selectedClass)}
            className="px-3 py-1.5 rounded-lg bg-surface-50 hover:bg-surface-hover border border-surface-border text-amber-400 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Class Rules in Handbook</span>
          </button>
        </div>

        {/* Level 1 Core Mechanics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {selectedClass.level1Features.map((feat, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-surface-50 border border-surface-border">
              <div className="text-xs font-bold text-amber-400 flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{feat.name}</span>
              </div>
              <p className="text-[11px] text-slate-300 mt-1.5 leading-relaxed">{feat.description}</p>
            </div>
          ))}
        </div>

        {/* Class Skill Choices */}
        <div className="p-4 rounded-xl bg-surface-50 border border-surface-border space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-serif font-bold text-sm text-slate-100">
                Class Skill Proficiencies
              </h4>
              <p className="text-xs text-slate-400">
                Choose {selectedClass.skillChoices.count} skills from your class list.
              </p>
            </div>

            <span
              className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold border ${
                remainingSkillPicks === 0
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                  : 'bg-amber-950 text-amber-300 border-amber-800'
              }`}
            >
              {remainingSkillPicks === 0 ? '✓ Complete' : `Pick ${remainingSkillPicks} More`}
            </span>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {availableSkillOptions.map((skill) => {
              const isSelected = state.classSkillChoices.includes(skill);
              return (
                <button
                  type="button"
                  key={skill}
                  onClick={() => handleToggleSkill(skill)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center space-x-1.5 ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-sm'
                      : 'bg-surface-100 text-slate-300 border-surface-border hover:border-slate-500 hover:text-white'
                  }`}
                >
                  <span>{skill}</span>
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Optional Order / Style Picker (Cleric Divine Order, Druid Primal Order, Fighter Fighting Style) */}
        {selectedClass.orderChoices && (
          <div className="p-4 rounded-xl bg-surface-50 border border-surface-border space-y-3">
            <h4 className="font-serif font-bold text-sm text-slate-100">
              {selectedClass.orderChoices.name}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {selectedClass.orderChoices.options.map((opt) => {
                const isSelected = state.selectedOrderOrStyle === opt.name;
                return (
                  <div
                    key={opt.name}
                    onClick={() => onChange({ selectedOrderOrStyle: opt.name })}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500 ring-1 ring-amber-500/40'
                        : 'bg-surface-100 border-surface-border hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <strong className="text-xs text-slate-100 font-bold">{opt.name}</strong>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">{opt.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {selectedClass.fightingStyleChoices && (
          <div className="p-4 rounded-xl bg-surface-50 border border-surface-border space-y-3">
            <h4 className="font-serif font-bold text-sm text-slate-100">
              Level 1 Fighting Style Feat
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {selectedClass.fightingStyleChoices.map((style) => {
                const isSelected = state.selectedOrderOrStyle === style;
                return (
                  <button
                    type="button"
                    key={style}
                    onClick={() => onChange({ selectedOrderOrStyle: style })}
                    className={`px-3 py-2 rounded-lg text-xs text-left border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500 text-amber-300 font-bold'
                        : 'bg-surface-100 border-surface-border text-slate-300 hover:border-slate-500'
                    }`}
                  >
                    <span>{style}</span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Subclass Selection / Preview */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-serif font-bold text-sm text-slate-100 flex items-center space-x-2">
                <span>Subclass (Unlocked at Level 3)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-50 text-slate-400 border border-surface-border">
                  4 Subclasses
                </span>
              </h4>
              <p className="text-xs text-slate-400">
                Preview or pre-select your character's specialization path.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {selectedClass.subclasses.map((sub) => {
              const isSelected = state.selectedSubclassId === sub.id;
              return (
                <div
                  key={sub.id}
                  onClick={() => onChange({ selectedSubclassId: sub.id })}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500 ring-1 ring-amber-500/40'
                      : 'bg-surface-50 border-surface-border hover:border-slate-500'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <h5 className="font-serif font-bold text-xs text-slate-100">{sub.name}</h5>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-3">{sub.summary}</p>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-surface-border/50 text-[10px] text-slate-500 font-mono">
                    Features: {sub.features.slice(0, 2).join(', ')}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Rules Inspection Modal */}
      {inspectingClass && (
        <RulesInspectionModal
          title={`Class: ${inspectingClass.name}`}
          category="D&D 2024 Player's Handbook"
          description={inspectingClass.description}
          features={inspectingClass.level1Features}
          tags={[
            `Hit Die: d${inspectingClass.hitDie}`,
            `Primary: ${inspectingClass.primaryAbility}`,
            `Saves: ${inspectingClass.savingThrows.join(', ').toUpperCase()}`,
            `Masteries: ${inspectingClass.weaponMasteriesCount}`,
          ]}
          handbookTarget={{
            chapterId: 'chapter-3-character-classes',
            entityId: inspectingClass.id,
          }}
          onClose={() => setInspectingClass(null)}
        />
      )}
    </div>
  );
};
