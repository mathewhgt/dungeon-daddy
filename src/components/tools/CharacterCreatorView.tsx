import React, { useState } from 'react';
import {
  Sparkles,
  Sword,
  Shield,
  Heart,
  Footprints,
  Eye,
  Dices,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  BookOpen,
  Save,
  Users,
  Award,
  Zap,
  Tv,
  Cast,
} from 'lucide-react';
import { CharacterCreationState } from '../../types/characterCreator';
import {
  getInitialCharacterState,
  PRESET_ARCHETYPES,
  calculateDerivedStats,
  getMergedClasses,
  getMergedBackgrounds,
  getMergedSpecies,
  getMergedOriginFeats,
} from '../../services/characterCreationService';
import { StepClassSelector } from './characterCreator/StepClassSelector';
import { StepOriginSelector } from './characterCreator/StepOriginSelector';
import { StepAbilityScores } from './characterCreator/StepAbilityScores';
import { StepFeaturesAndSpells } from './characterCreator/StepFeaturesAndSpells';
import { StepNarrativeAndEquipment } from './characterCreator/StepNarrativeAndEquipment';
import { StepReviewAndSave } from './characterCreator/StepReviewAndSave';
import { useApp } from '../../context/AppContext';
import { playerSyncService } from '../../services/playerSyncService';

const STEPS = [
  { id: 1, label: '1. Class & Subclass', short: 'Class' },
  { id: 2, label: '2. Origin & Species', short: 'Origin' },
  { id: 3, label: '3. Ability Scores', short: 'Abilities' },
  { id: 4, label: '4. Masteries & Spells', short: 'Features' },
  { id: 5, label: '5. Identity & Gear', short: 'Narrative' },
  { id: 6, label: '6. Review & Save', short: 'Review' },
];

export const CharacterCreatorView: React.FC = () => {
  const { db, showToast, setActiveTab, setIsExternalDisplayModalOpen } = useApp();

  const customOpts = React.useMemo(() => ({
    customSubclasses: db.customSubclasses || [],
    customBackgrounds: db.customBackgrounds || [],
    customSpecies: db.customSpecies || [],
    customFeats: db.customFeats || [],
  }), [db.customSubclasses, db.customBackgrounds, db.customSpecies, db.customFeats]);

  const classes = React.useMemo(() => getMergedClasses(db.customSubclasses || []), [db.customSubclasses]);
  const backgrounds = React.useMemo(() => getMergedBackgrounds(db.customBackgrounds || []), [db.customBackgrounds]);
  const species = React.useMemo(() => getMergedSpecies(db.customSpecies || []), [db.customSpecies]);
  const originFeats = React.useMemo(() => getMergedOriginFeats(db.customFeats || []), [db.customFeats]);

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [characterState, setCharacterState] = useState<CharacterCreationState>(() => getInitialCharacterState());
  const [isCasting, setIsCasting] = useState<boolean>(() => {
    const s = playerSyncService.getState();
    return s.displaySettings.mode === 'character-creator' || Boolean(s.characterCreation);
  });

  const handleUpdateState = (updates: Partial<CharacterCreationState>) => {
    setCharacterState((prev) => {
      const updated = {
        ...prev,
        ...updates,
      };
      if (isCasting) {
        playerSyncService.updateCharacterCreatorState(currentStep, updated);
      }
      return updated;
    });
  };

  const handleStepChange = (newStep: number) => {
    setCurrentStep(newStep);
    if (isCasting) {
      playerSyncService.updateCharacterCreatorState(newStep, characterState);
    }
  };

  const handleToggleCasting = () => {
    if (isCasting) {
      playerSyncService.stopCharacterCreator();
      setIsCasting(false);
      showToast('Stopped projecting to Player Screen');
    } else {
      playerSyncService.projectCharacterCreator(currentStep, characterState);
      setIsCasting(true);
      showToast('Now broadcasting live character creation to Player Screen / TV');
    }
  };

  const handleReset = () => {
    const init = getInitialCharacterState();
    setCharacterState(init);
    setCurrentStep(1);
    if (isCasting) {
      playerSyncService.updateCharacterCreatorState(1, init);
    }
    showToast('Character Creator reset to defaults.');
  };

  const handleLoadPreset = (preset: typeof PRESET_ARCHETYPES[0]) => {
    const bg = backgrounds.find((b) => b.id === preset.backgroundId) || backgrounds[0];
    const cls = classes.find((c) => c.id === preset.classId) || classes[0];

    handleUpdateState({
      characterName: preset.characterName,
      selectedClassId: preset.classId,
      selectedSubclassId: cls.subclasses[0]?.id,
      selectedBackgroundId: preset.backgroundId,
      selectedSpeciesId: preset.speciesId,
      selectedLineageId: preset.lineageId,
      alignment: preset.alignment,
      baseScores: preset.scores,
      backgroundBonusAssignment: preset.bgBonus,
      selectedWeaponMasteries: preset.masteries,
      equippedArmor: preset.armor,
      equippedShield: preset.shield,
      selectedCantrips: preset.cantrips || [],
      selectedSpells: preset.spells || [],
    });
    showToast(`Loaded Preset: ${preset.name}`);
  };

  const derived = calculateDerivedStats(characterState, customOpts);
  const currentClass = classes.find((c) => c.id === characterState.selectedClassId) || classes[0];
  const currentSpecies = species.find((s) => s.id === characterState.selectedSpeciesId) || species[0];
  const currentBg = backgrounds.find((b) => b.id === characterState.selectedBackgroundId) || backgrounds[0];

  return (
    <div className="h-full flex flex-col bg-[#090d12] overflow-hidden select-none">
      {/* Top Wizard Navigation & Stepper Header */}
      <div className="p-4 bg-surface-100/80 border-b border-surface-border flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Title and Presets */}
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/30 border border-amber-500/40 text-amber-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-serif text-lg font-bold text-slate-100">
                2024 Character Creation Wizard
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[10px] font-mono">
                D&D 2024 PHB Rules
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Interactive builder that automatically validates and saves to your Party & Hero roster.
            </p>
          </div>
        </div>

        {/* Quick Actions, Casting & Presets */}
        <div className="flex items-center space-x-2 flex-wrap gap-1.5">
          {/* Cast to Player Screen Button */}
          <button
            type="button"
            onClick={handleToggleCasting}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-serif font-bold transition-all flex items-center space-x-2 shadow-md ${
              isCasting
                ? 'bg-emerald-600 hover:bg-emerald-500 text-slate-950 shadow-emerald-500/20 ring-2 ring-emerald-400'
                : 'bg-surface-50 hover:bg-surface-hover border border-surface-border text-slate-300 hover:text-white'
            }`}
            title={isCasting ? 'Currently broadcasting live to player display (Click to stop)' : 'Project live walkthrough to TV / player screen'}
          >
            <Cast className={`w-4 h-4 ${isCasting ? 'animate-pulse' : 'text-amber-400'}`} />
            <span>{isCasting ? '● Casting to Player Screen' : 'Cast to Player Screen'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExternalDisplayModalOpen(true)}
            className="p-2 rounded-lg bg-surface-50 hover:bg-surface-hover text-slate-400 hover:text-white border border-surface-border transition-colors"
            title="Configure Connected TV / Player Screens"
          >
            <Tv className="w-4 h-4 text-amber-400" />
          </button>

          <div className="flex items-center space-x-1 bg-surface-50 p-1 rounded-lg border border-surface-border text-xs">
            <span className="text-[11px] text-slate-400 pl-1 font-semibold">Presets:</span>
            {PRESET_ARCHETYPES.map((p, idx) => (
              <button
                type="button"
                key={idx}
                onClick={() => handleLoadPreset(p)}
                className="px-2 py-1 rounded hover:bg-surface-hover text-slate-300 hover:text-amber-400 text-[11px] font-medium transition-colors"
                title={`Load pre-configured ${p.name}`}
              >
                {p.characterName.split(' ')[0]}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="p-2 rounded-lg bg-surface-50 hover:bg-surface-hover text-slate-400 hover:text-white border border-surface-border transition-colors"
            title="Reset wizard to defaults"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Step Progress Stepper Bar */}
      <div className="bg-[#0c1017] border-b border-surface-border/80 px-4 py-2.5 overflow-x-auto">
        <div className="max-w-6xl mx-auto flex items-center justify-between space-x-2 min-w-[650px]">
          {STEPS.map((step) => {
            const isActive = currentStep === step.id;
            const isDone = currentStep > step.id;

            return (
              <button
                type="button"
                key={step.id}
                onClick={() => handleStepChange(step.id)}
                className={`flex-1 py-2 px-3 rounded-xl border text-xs font-serif font-bold transition-all flex items-center justify-between ${
                  isActive
                    ? 'bg-amber-500/15 border-amber-500 text-amber-300 shadow-md ring-1 ring-amber-500/30'
                    : isDone
                    ? 'bg-surface-100/80 border-surface-border text-slate-300 hover:border-slate-500'
                    : 'bg-surface-50/40 border-surface-border/40 text-slate-500 hover:text-slate-400'
                }`}
              >
                <div className="flex items-center space-x-2 truncate">
                  <span
                    className={`w-5 h-5 rounded-full text-[10px] font-mono flex items-center justify-center font-bold ${
                      isActive
                        ? 'bg-amber-500 text-slate-950'
                        : isDone
                        ? 'bg-emerald-600 text-slate-950'
                        : 'bg-surface-100 text-slate-400'
                    }`}
                  >
                    {isDone ? '✓' : step.id}
                  </span>
                  <span className="truncate">{step.label}</span>
                </div>

                {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-1" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Step Canvas + Live Sheet Mini HUD */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Live Mini Summary HUD */}
          <div className="p-3 rounded-xl bg-surface-100/90 border border-surface-border flex items-center justify-between flex-wrap gap-3 shadow-md">
            <div className="flex items-center space-x-3">
              <div className="px-2.5 py-1 rounded-lg bg-surface-50 border border-surface-border text-xs font-serif font-bold text-slate-200">
                {characterState.characterName || 'Hero Adventurer'}
              </div>
              <div className="text-xs text-amber-400 font-medium">
                Level 1 {currentSpecies.name} {currentClass.name} ({currentBg.name})
              </div>
            </div>

            <div className="flex items-center space-x-3 text-xs font-mono">
              <div className="flex items-center space-x-1 text-slate-300">
                <Shield className="w-3.5 h-3.5 text-blue-400" />
                <span>AC: <strong className="text-slate-100">{derived.armorClass}</strong></span>
              </div>
              <div className="flex items-center space-x-1 text-slate-300">
                <Heart className="w-3.5 h-3.5 text-red-400" />
                <span>HP: <strong className="text-slate-100">{derived.maxHp}</strong></span>
              </div>
              <div className="flex items-center space-x-1 text-slate-300">
                <Dices className="w-3.5 h-3.5 text-amber-400" />
                <span>Init: <strong className="text-slate-100">+{derived.initiativeBonus}</strong></span>
              </div>
              <div className="flex items-center space-x-1 text-slate-300">
                <Footprints className="w-3.5 h-3.5 text-emerald-400" />
                <span>{derived.speed}</span>
              </div>
            </div>
          </div>

          {/* Current Step Content */}
          {currentStep === 1 && (
            <StepClassSelector state={characterState} onChange={handleUpdateState} />
          )}
          {currentStep === 2 && (
            <StepOriginSelector state={characterState} onChange={handleUpdateState} />
          )}
          {currentStep === 3 && (
            <StepAbilityScores state={characterState} onChange={handleUpdateState} />
          )}
          {currentStep === 4 && (
            <StepFeaturesAndSpells state={characterState} onChange={handleUpdateState} />
          )}
          {currentStep === 5 && (
            <StepNarrativeAndEquipment state={characterState} onChange={handleUpdateState} />
          )}
          {currentStep === 6 && (
            <StepReviewAndSave state={characterState} />
          )}

          {/* Wizard Bottom Navigation Controls */}
          <div className="pt-4 border-t border-surface-border flex items-center justify-between pb-8">
            <button
              type="button"
              onClick={() => handleStepChange(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className="px-4 py-2 bg-surface-50 hover:bg-surface-hover disabled:opacity-30 disabled:pointer-events-none text-slate-200 border border-surface-border rounded-xl text-xs font-serif font-bold flex items-center space-x-2 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous Step</span>
            </button>

            <div className="text-xs text-slate-500 font-mono">
              Step {currentStep} of {STEPS.length}
            </div>

            {currentStep < 6 ? (
              <button
                type="button"
                onClick={() => handleStepChange(Math.min(6, currentStep + 1))}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-serif font-bold rounded-xl text-xs flex items-center space-x-2 transition-all shadow-md shadow-amber-500/20"
              >
                <span>Next: {STEPS[currentStep].short}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  const saveBtn = document.querySelector('button[title="Save as Hero Character"]') as HTMLButtonElement;
                  if (saveBtn) saveBtn.click();
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-serif font-bold rounded-xl text-xs flex items-center space-x-2 transition-all shadow-md shadow-emerald-500/20"
              >
                <Save className="w-4 h-4" />
                <span>Ready & Finalized</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
