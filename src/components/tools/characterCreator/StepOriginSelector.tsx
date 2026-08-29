import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  BookOpen,
  Eye,
  Footprints,
  Maximize2,
  Info,
  Wrench,
  Languages,
  Award,
  Layers,
} from 'lucide-react';
import {
  CharacterCreationState,
  BackgroundDefinition2024,
  SpeciesDefinition2024,
} from '../../../types/characterCreator';
import {
  BACKGROUNDS_2024,
  SPECIES_2024,
  ORIGIN_FEATS_2024,
  STANDARD_LANGUAGES,
  RARE_LANGUAGES,
  SKILL_DEFINITIONS,
} from '../../../services/characterCreationService';
import { RulesInspectionModal } from './RulesInspectionModal';

interface StepOriginSelectorProps {
  state: CharacterCreationState;
  onChange: (updates: Partial<CharacterCreationState>) => void;
}

export const StepOriginSelector: React.FC<StepOriginSelectorProps> = ({ state, onChange }) => {
  const [inspectingBackground, setInspectingBackground] = useState<BackgroundDefinition2024 | null>(null);
  const [inspectingSpecies, setInspectingSpecies] = useState<SpeciesDefinition2024 | null>(null);

  const selectedBackground = BACKGROUNDS_2024.find((b) => b.id === state.selectedBackgroundId) || BACKGROUNDS_2024[0];
  const selectedSpecies = SPECIES_2024.find((s) => s.id === state.selectedSpeciesId) || SPECIES_2024[0];

  const handleSelectBackground = (bg: BackgroundDefinition2024) => {
    // Reset background bonus assignment to match the new background's 3 allowed abilities
    const allowed = bg.allowedAbilities;
    const defaultAssignment = state.backgroundBonusType === '+2/+1'
      ? { [allowed[0]]: 2, [allowed[1]]: 1 }
      : { [allowed[0]]: 1, [allowed[1]]: 1, [allowed[2]]: 1 };

    onChange({
      selectedBackgroundId: bg.id,
      selectedBackgroundTool: bg.toolChoices ? bg.toolChoices[0] : bg.tools,
      backgroundBonusAssignment: defaultAssignment,
    });
  };

  const handleSelectSpecies = (sp: SpeciesDefinition2024) => {
    const defaultLineage = sp.lineages ? sp.lineages[0]?.id : undefined;
    const defaultAncestry = sp.ancestralChoices ? sp.ancestralChoices.options[0]?.id : undefined;
    const defaultSize = sp.size === 'Small' ? 'Small' : 'Medium';

    onChange({
      selectedSpeciesId: sp.id,
      selectedLineageId: defaultLineage,
      selectedAncestralChoiceId: defaultAncestry,
      selectedSize: defaultSize,
    });
  };

  const handleToggleLanguage = (lang: string) => {
    if (lang === 'Common') return; // Mandatory
    const current = [...state.selectedLanguages];
    const idx = current.indexOf(lang);
    if (idx !== -1) {
      if (current.length > 2) {
        current.splice(idx, 1);
        onChange({ selectedLanguages: current });
      }
    } else {
      if (current.length < 3) {
        current.push(lang);
        onChange({ selectedLanguages: current });
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Step Header */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 via-surface-100 to-surface-100 border border-emerald-500/20">
        <h2 className="font-serif font-bold text-lg text-slate-100 flex items-center space-x-2">
          <span>Step 2: Determine Origin (Background & Species)</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
          In D&D 2024, your character's Origin is formed by combining your <strong>Background</strong> (which grants your Ability Score Increases, Origin Feat, Skills, and Tool proficiencies) with your <strong>Species</strong> (which grants Size, Speed, Vision, and Innate Ancestral Traits).
        </p>
      </div>

      {/* SECTION 1: BACKGROUND SELECTOR */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif font-bold text-base text-slate-100 flex items-center space-x-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>1. Character Background (16 Options)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Each background provides +2/+1 or +1/+1/+1 stats, an Origin Feat, 2 skills, and tools.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setInspectingBackground(selectedBackground)}
            className="px-3 py-1.5 rounded-lg bg-surface-50 hover:bg-surface-hover border border-surface-border text-amber-400 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Backgrounds Handbook</span>
          </button>
        </div>

        {/* 16 Background Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {BACKGROUNDS_2024.map((bg) => {
            const isSelected = bg.id === state.selectedBackgroundId;
            return (
              <div
                key={bg.id}
                onClick={() => handleSelectBackground(bg)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-amber-500/10 border-amber-500 shadow-md shadow-amber-500/10 ring-1 ring-amber-500/50'
                    : 'bg-surface-100/80 border-surface-border hover:border-slate-500 hover:bg-surface-50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif font-bold text-sm text-slate-100">{bg.name}</h4>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                  </div>

                  <div className="mt-1.5 space-y-1 text-[11px]">
                    <div className="text-amber-400 font-mono text-[10px]">
                      Stats: {bg.allowedAbilities.map((a) => a.toUpperCase()).join(', ')}
                    </div>
                    <div className="text-purple-300 font-semibold flex items-center space-x-1">
                      <Sparkles className="w-3 h-3 text-purple-400 shrink-0" />
                      <span className="truncate">{bg.originFeat}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {bg.summary}
                  </p>
                </div>

                <div className="mt-2.5 pt-2 border-t border-surface-border/60 text-[10px] text-slate-400 flex items-center justify-between">
                  <span>Skills: {bg.skills.join(', ')}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setInspectingBackground(bg);
                    }}
                    className="text-amber-400 hover:text-amber-300"
                    title="Inspect details"
                  >
                    <Info className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Background Tool Option (if tool choices exist) */}
        {selectedBackground.toolChoices && (
          <div className="p-4 rounded-xl bg-surface-100 border border-surface-border space-y-2">
            <div className="text-xs font-bold text-slate-100 flex items-center space-x-1.5">
              <Wrench className="w-3.5 h-3.5 text-amber-400" />
              <span>Select Your Background Tool Proficiency:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedBackground.toolChoices.map((tool) => (
                <button
                  type="button"
                  key={tool}
                  onClick={() => onChange({ selectedBackgroundTool: tool })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    state.selectedBackgroundTool === tool
                      ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                      : 'bg-surface-50 text-slate-300 border-surface-border hover:border-slate-500'
                  }`}
                >
                  {tool}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: SPECIES SELECTOR */}
      <div className="space-y-4 pt-4 border-t border-surface-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-serif font-bold text-base text-slate-100 flex items-center space-x-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>2. Character Species (10 Options)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Species determines innate physical capabilities, size, speed, vision, and ancestral magic.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setInspectingSpecies(selectedSpecies)}
            className="px-3 py-1.5 rounded-lg bg-surface-50 hover:bg-surface-hover border border-surface-border text-emerald-400 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Species Handbook</span>
          </button>
        </div>

        {/* 10 Species Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {SPECIES_2024.map((sp) => {
            const isSelected = sp.id === state.selectedSpeciesId;
            return (
              <div
                key={sp.id}
                onClick={() => handleSelectSpecies(sp)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-emerald-500/10 border-emerald-500 shadow-md shadow-emerald-500/10 ring-1 ring-emerald-500/50'
                    : 'bg-surface-100/80 border-surface-border hover:border-slate-500 hover:bg-surface-50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif font-bold text-sm text-slate-100">{sp.name}</h4>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  </div>

                  <div className="mt-1.5 flex items-center space-x-2 text-[10px] text-slate-400 font-mono">
                    <span>{sp.speed} ft</span>
                    <span>·</span>
                    <span>{sp.vision}</span>
                  </div>

                  <p className="text-[11px] text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {sp.summary}
                  </p>
                </div>

                <div className="mt-2.5 pt-2 border-t border-surface-border/60 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="truncate">{sp.traits.length} Traits</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setInspectingSpecies(sp);
                    }}
                    className="text-emerald-400 hover:text-emerald-300"
                    title="Inspect details"
                  >
                    <Info className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Species Lineage / Ancestry Customization */}
        <div className="p-4 rounded-xl bg-surface-100 border border-surface-border space-y-4">
          <div className="flex items-center justify-between border-b border-surface-border pb-3">
            <div>
              <h4 className="font-serif font-bold text-sm text-slate-100">
                {selectedSpecies.name} Traits & Customization
              </h4>
              <p className="text-xs text-slate-400">{selectedSpecies.summary}</p>
            </div>

            {/* Size Choice (Medium or Small) */}
            {selectedSpecies.size === 'Medium or Small' && (
              <div className="flex items-center space-x-2 bg-surface-50 p-1.5 rounded-lg border border-surface-border text-xs">
                <span className="text-slate-400 text-[11px] font-semibold pl-1">Size:</span>
                <button
                  type="button"
                  onClick={() => onChange({ selectedSize: 'Medium' })}
                  className={`px-2.5 py-1 rounded text-xs font-bold transition-colors ${
                    state.selectedSize === 'Medium'
                      ? 'bg-emerald-600 text-slate-950'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Medium
                </button>
                <button
                  type="button"
                  onClick={() => onChange({ selectedSize: 'Small' })}
                  className={`px-2.5 py-1 rounded text-xs font-bold transition-colors ${
                    state.selectedSize === 'Small'
                      ? 'bg-emerald-600 text-slate-950'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Small
                </button>
              </div>
            )}
          </div>

          {/* Lineages (Elf, Gnome, Tiefling) */}
          {selectedSpecies.lineages && (
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-200">Select Lineage:</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                {selectedSpecies.lineages.map((lin) => {
                  const isSelected = state.selectedLineageId === lin.id;
                  return (
                    <div
                      key={lin.id}
                      onClick={() => onChange({ selectedLineageId: lin.id })}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-emerald-500/10 border-emerald-500 ring-1 ring-emerald-500/40'
                          : 'bg-surface-50 border-surface-border hover:border-slate-500'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <strong className="text-xs text-slate-100">{lin.name}</strong>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">{lin.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Ancestral Choices (Goliath, Dragonborn) */}
          {selectedSpecies.ancestralChoices && (
            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-200">
                {selectedSpecies.ancestralChoices.title}:
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {selectedSpecies.ancestralChoices.options.map((opt) => {
                  const isSelected = state.selectedAncestralChoiceId === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => onChange({ selectedAncestralChoiceId: opt.id })}
                      className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-emerald-500/10 border-emerald-500 ring-1 ring-emerald-500/40'
                          : 'bg-surface-50 border-surface-border hover:border-slate-500'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <strong className="text-xs text-slate-100">{opt.name}</strong>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{opt.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Human Extra Versatility Choices */}
          {selectedSpecies.hasExtraFeat && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-3">
              <div className="font-serif font-bold text-sm text-amber-300 flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4" />
                <span>Human Versatile Trait: Extra Bonus Origin Feat & Skill</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Extra Origin Feat */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Choose Extra Origin Feat:</label>
                  <select
                    value={state.humanExtraFeat || 'Alert'}
                    onChange={(e) => onChange({ humanExtraFeat: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-50 border border-surface-border rounded-lg text-xs text-slate-100 font-semibold focus:outline-none focus:border-amber-500"
                  >
                    {ORIGIN_FEATS_2024.map((f) => (
                      <option key={f.id} value={f.name}>
                        {f.name} ({f.summary})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Extra Skill */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Choose Extra Skill Proficiency:</label>
                  <select
                    value={state.humanExtraSkill || 'Athletics'}
                    onChange={(e) => onChange({ humanExtraSkill: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-50 border border-surface-border rounded-lg text-xs text-slate-100 font-semibold focus:outline-none focus:border-amber-500"
                  >
                    {SKILL_DEFINITIONS.map((s) => (
                      <option key={s.name} value={s.name}>
                        {s.name} ({s.ability.toUpperCase()})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Innate Traits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-2">
            {selectedSpecies.traits.map((tr, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-surface-50 border border-surface-border">
                <div className="text-xs font-bold text-emerald-400">{tr.name}</div>
                <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">{tr.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 3: STARTING LANGUAGES */}
      <div className="p-4 rounded-xl bg-surface-100 border border-surface-border space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Languages className="w-4 h-4 text-indigo-400" />
            <h4 className="font-serif font-bold text-sm text-slate-100">
              Languages Known (Common + 2 Additional Choices)
            </h4>
          </div>

          <span className="text-xs font-mono text-slate-400">
            Selected: {state.selectedLanguages.length} / 3
          </span>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          <button
            type="button"
            disabled
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600/30 border border-indigo-500/50 text-indigo-200 cursor-not-allowed flex items-center space-x-1"
          >
            <span>Common</span>
            <CheckCircle2 className="w-3.5 h-3.5" />
          </button>

          {STANDARD_LANGUAGES.filter((l) => l !== 'Common').map((lang) => {
            const isSelected = state.selectedLanguages.includes(lang);
            return (
              <button
                type="button"
                key={lang}
                onClick={() => handleToggleLanguage(lang)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center space-x-1.5 ${
                  isSelected
                    ? 'bg-indigo-600 text-slate-100 border-indigo-400 font-bold'
                    : 'bg-surface-50 text-slate-300 border-surface-border hover:border-slate-500'
                }`}
              >
                <span>{lang}</span>
                {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
              </button>
            );
          })}

          {RARE_LANGUAGES.map((lang) => {
            const isSelected = state.selectedLanguages.includes(lang);
            return (
              <button
                type="button"
                key={lang}
                onClick={() => handleToggleLanguage(lang)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center space-x-1.5 ${
                  isSelected
                    ? 'bg-indigo-600 text-slate-100 border-indigo-400 font-bold'
                    : 'bg-surface-50 text-slate-400 border-surface-border/60 hover:border-slate-500'
                }`}
              >
                <span>{lang} (Rare)</span>
                {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Rules Inspection Modals */}
      {inspectingBackground && (
        <RulesInspectionModal
          title={`Background: ${inspectingBackground.name}`}
          category="Character Origins (PHB 2024)"
          description={inspectingBackground.description}
          features={[
            { name: 'Ability Scores Pool', description: `Choose +2/+1 or +1/+1/+1 among: ${inspectingBackground.allowedAbilities.map((a) => a.toUpperCase()).join(', ')}` },
            { name: 'Origin Feat', description: inspectingBackground.originFeat },
            { name: 'Skill Proficiencies', description: inspectingBackground.skills.join(', ') },
            { name: 'Tool Proficiency', description: inspectingBackground.tools },
            { name: 'Starting Equipment Package', description: inspectingBackground.equipmentPackage.description },
          ]}
          handbookTarget={{
            chapterId: 'chapter-4-character-origins',
            entityId: inspectingBackground.id,
          }}
          onClose={() => setInspectingBackground(null)}
        />
      )}

      {inspectingSpecies && (
        <RulesInspectionModal
          title={`Species: ${inspectingSpecies.name}`}
          category="Character Origins (PHB 2024)"
          description={inspectingSpecies.description}
          features={inspectingSpecies.traits}
          tags={[
            `Size: ${inspectingSpecies.size}`,
            `Speed: ${inspectingSpecies.speed} ft`,
            `Vision: ${inspectingSpecies.vision}`,
          ]}
          handbookTarget={{
            chapterId: 'chapter-4-character-origins',
            entityId: inspectingSpecies.id,
          }}
          onClose={() => setInspectingSpecies(null)}
        />
      )}
    </div>
  );
};
