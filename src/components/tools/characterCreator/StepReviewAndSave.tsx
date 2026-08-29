import React, { useState } from 'react';
import {
  Shield,
  Heart,
  Footprints,
  Eye,
  Dices,
  Sparkles,
  Sword,
  Save,
  Download,
  Copy,
  Check,
  Award,
  BookOpen,
  User,
  Zap,
  Flame,
  Feather,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import {
  CharacterCreationState,
  DerivedCharacterStats,
} from '../../../types/characterCreator';
import {
  CLASSES_2024,
  BACKGROUNDS_2024,
  SPECIES_2024,
  createPlayerEntityFromState,
  calculateDerivedStats,
  formatModifier,
} from '../../../services/characterCreationService';
import { useApp } from '../../../context/AppContext';
import { TokenAvatar } from '../../common/TokenAvatar';

interface StepReviewAndSaveProps {
  state: CharacterCreationState;
  onSavedHero?: (heroId: string) => void;
}

export const StepReviewAndSave: React.FC<StepReviewAndSaveProps> = ({ state, onSavedHero }) => {
  const { savePlayer, activeCampaignId, setActiveTab, showToast } = useApp();

  const [isCopied, setIsCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [savedHeroId, setSavedHeroId] = useState<string | null>(null);

  const derived = calculateDerivedStats(state);
  const selectedClass = CLASSES_2024.find((c) => c.id === state.selectedClassId) || CLASSES_2024[0];
  const selectedBackground = BACKGROUNDS_2024.find((b) => b.id === state.selectedBackgroundId) || BACKGROUNDS_2024[0];
  const selectedSpecies = SPECIES_2024.find((s) => s.id === state.selectedSpeciesId) || SPECIES_2024[0];

  const handleSaveToParty = () => {
    const playerEntity = createPlayerEntityFromState(state, activeCampaignId || undefined, savedHeroId || undefined);
    savePlayer(playerEntity);
    setIsSaved(true);
    setSavedHeroId(playerEntity.id);
    showToast(`Hero "${playerEntity.name}" saved to Party & Heroes!`);
    if (onSavedHero) onSavedHero(playerEntity.id);
  };

  const handleExportJson = () => {
    const playerEntity = createPlayerEntityFromState(state, activeCampaignId || undefined, savedHeroId || undefined);
    const blob = new Blob([JSON.stringify(playerEntity, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(state.characterName || 'Hero').toLowerCase().replace(/\s+/g, '_')}_sheet_2024.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Character JSON downloaded.');
  };

  const handleCopyMarkdown = () => {
    const md = `# ${state.characterName || 'Hero Adventurer'}
**Level 1 ${selectedSpecies.name} ${selectedClass.name}** | **Background:** ${selectedBackground.name} | **Alignment:** ${state.alignment}
**AC:** ${derived.armorClass} | **HP:** ${derived.maxHp} | **Speed:** ${derived.speed} | **Initiative:** ${formatModifier(derived.initiativeBonus)}

## Ability Scores
- **STR:** ${derived.finalScores.str} (${formatModifier(derived.modifiers.str)})
- **DEX:** ${derived.finalScores.dex} (${formatModifier(derived.modifiers.dex)})
- **CON:** ${derived.finalScores.con} (${formatModifier(derived.modifiers.con)})
- **INT:** ${derived.finalScores.int} (${formatModifier(derived.modifiers.int)})
- **WIS:** ${derived.finalScores.wis} (${formatModifier(derived.modifiers.wis)})
- **CHA:** ${derived.finalScores.cha} (${formatModifier(derived.modifiers.cha)})

## Origin Feat & Traits
- **Origin Feat:** ${selectedBackground.originFeat}
- **Weapon Masteries:** ${state.selectedWeaponMasteries.join(', ')}
- **Languages:** ${state.selectedLanguages.join(', ')}
`;
    navigator.clipboard.writeText(md);
    setIsCopied(true);
    showToast('Character Markdown summary copied to clipboard.');
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/20 via-surface-100 to-surface-100 border border-amber-500/40 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="font-serif font-bold text-xl text-slate-100 flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>Step 6: Review & Finalize Character Sheet</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Review your derived stats and save your 2024 character as a playable Hero entry.
          </p>
        </div>

        {/* Action Bar */}
        <div className="flex items-center space-x-2 flex-wrap gap-2">
          <button
            type="button"
            onClick={handleCopyMarkdown}
            className="px-3 py-2 bg-surface-50 hover:bg-surface-hover border border-surface-border text-slate-300 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          >
            {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{isCopied ? 'Copied!' : 'Copy Summary'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportJson}
            className="px-3 py-2 bg-surface-50 hover:bg-surface-hover border border-surface-border text-slate-300 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export JSON</span>
          </button>

          <button
            type="button"
            onClick={handleSaveToParty}
            className={`px-4 py-2 rounded-lg font-serif font-bold text-xs flex items-center space-x-2 transition-all shadow-lg ${
              isSaved
                ? 'bg-emerald-600 text-slate-950 shadow-emerald-500/20'
                : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/20'
            }`}
          >
            {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{isSaved ? 'Saved to Party!' : 'Save as Hero Character'}</span>
          </button>
        </div>
      </div>

      {/* Celebratory Saved Alert */}
      {isSaved && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-200 flex items-center justify-between flex-wrap gap-3 animate-scaleUp">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Check className="w-5 h-5" />
            </div>
            <div>
              <strong className="text-sm font-bold block">
                {state.characterName || 'Hero'} successfully added to Party Roster!
              </strong>
              <span className="text-xs text-emerald-300/80">
                You can now deploy this character to battle maps, initiate combat encounters, track spell slots, and roll checks.
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('party')}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition-colors shadow-md"
          >
            <span>Open Party View</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* FULL CHARACTER SHEET PREVIEW */}
      <div className="p-6 rounded-2xl bg-[#0e131b] border border-surface-border shadow-2xl space-y-6">
        {/* Sheet Top Banner */}
        <div className="flex items-start justify-between border-b border-surface-border pb-5 flex-wrap gap-4">
          <div className="flex items-start space-x-4">
            <TokenAvatar
              name={state.characterName || 'Hero'}
              imageUrl={state.avatarUrl}
              tokenUrl={state.tokenUrl}
              type="player"
              characterClass={selectedClass.name}
              size="xl"
            />

            <div>
              <h3 className="font-serif text-2xl font-bold text-slate-100">
                {state.characterName || 'Unnamed Hero'}
              </h3>
              <div className="text-sm text-amber-400 font-medium mt-0.5">
                Level 1 {selectedSpecies.name} {selectedClass.name}
              </div>
              <div className="text-xs text-slate-400 mt-1 flex items-center space-x-2">
                <span><strong>Background:</strong> {selectedBackground.name}</span>
                <span>•</span>
                <span><strong>Alignment:</strong> {state.alignment}</span>
                {state.playerName && (
                  <>
                    <span>•</span>
                    <span><strong>Player:</strong> {state.playerName}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="px-3.5 py-2 rounded-xl bg-surface-50 border border-surface-border text-right">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Proficiency Bonus</div>
            <div className="font-mono text-base font-bold text-emerald-400">+2</div>
          </div>
        </div>

        {/* Combat Vitals Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="p-3 rounded-xl bg-surface-50 border border-surface-border flex items-center space-x-3">
            <Shield className="w-5 h-5 text-blue-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Armor Class</div>
              <div className="font-mono text-lg font-bold text-slate-100">{derived.armorClass}</div>
              <div className="text-[9px] text-slate-500 truncate">{derived.armorClassBreakdown}</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-surface-50 border border-surface-border flex items-center space-x-3">
            <Heart className="w-5 h-5 text-red-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Hit Points (L1)</div>
              <div className="font-mono text-lg font-bold text-slate-100">{derived.maxHp} HP</div>
              <div className="text-[9px] text-slate-500 font-mono">d{selectedClass.hitDie} Hit Die</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-surface-50 border border-surface-border flex items-center space-x-3">
            <Dices className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Initiative</div>
              <div className="font-mono text-lg font-bold text-slate-100">{formatModifier(derived.initiativeBonus)}</div>
              <div className="text-[9px] text-slate-500 font-mono">Dex {formatModifier(derived.modifiers.dex)}</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-surface-50 border border-surface-border flex items-center space-x-3">
            <Footprints className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Speed</div>
              <div className="font-mono text-lg font-bold text-slate-100">{derived.speed}</div>
              <div className="text-[9px] text-slate-500">{selectedSpecies.vision}</div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-surface-50 border border-surface-border flex items-center space-x-3">
            <Eye className="w-5 h-5 text-indigo-400 shrink-0" />
            <div>
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Passive Perc.</div>
              <div className="font-mono text-lg font-bold text-slate-100">{derived.passivePerception}</div>
              <div className="text-[9px] text-slate-500">Insight: {derived.passiveInsight}</div>
            </div>
          </div>
        </div>

        {/* 6 Abilities & Saving Throws Grid */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-center">
          {[
            { label: 'STR', key: 'str' as const, val: derived.finalScores.str, mod: derived.modifiers.str, save: derived.savingThrows.str },
            { label: 'DEX', key: 'dex' as const, val: derived.finalScores.dex, mod: derived.modifiers.dex, save: derived.savingThrows.dex },
            { label: 'CON', key: 'con' as const, val: derived.finalScores.con, mod: derived.modifiers.con, save: derived.savingThrows.con },
            { label: 'INT', key: 'int' as const, val: derived.finalScores.int, mod: derived.modifiers.int, save: derived.savingThrows.int },
            { label: 'WIS', key: 'wis' as const, val: derived.finalScores.wis, mod: derived.modifiers.wis, save: derived.savingThrows.wis },
            { label: 'CHA', key: 'cha' as const, val: derived.finalScores.cha, mod: derived.modifiers.cha, save: derived.savingThrows.cha },
          ].map((ab) => (
            <div
              key={ab.label}
              className="p-3 rounded-xl bg-surface-50 border border-surface-border flex flex-col items-center justify-between space-y-1.5"
            >
              <div className="text-[11px] font-bold text-slate-400">{ab.label}</div>
              <div className="text-lg font-serif font-bold text-slate-100 font-mono">{ab.val}</div>
              <div className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 font-mono font-bold text-xs">
                {formatModifier(ab.mod)}
              </div>
              <div
                className={`text-[10px] font-mono mt-1 ${
                  ab.save.proficient ? 'text-emerald-400 font-bold' : 'text-slate-500'
                }`}
              >
                Save: {formatModifier(ab.save.modifier)} {ab.save.proficient ? '★' : ''}
              </div>
            </div>
          ))}
        </div>

        {/* Skills & Weapon Attacks 2-Column Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Skills Table */}
          <div className="p-4 rounded-xl bg-surface-50 border border-surface-border space-y-3">
            <h4 className="font-serif font-bold text-sm text-slate-100 flex items-center justify-between">
              <span>Skill Proficiencies</span>
              <span className="text-[10px] text-slate-500 font-mono">★ = Proficient</span>
            </h4>

            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              {Object.entries(derived.skills).map(([name, s]) => (
                <div
                  key={name}
                  className={`flex items-center justify-between py-1 border-b border-surface-border/40 ${
                    s.proficient ? 'text-amber-300 font-bold' : 'text-slate-400'
                  }`}
                >
                  <span className="flex items-center space-x-1.5">
                    <span className="text-[10px] text-slate-500 font-mono uppercase">
                      ({s.ability})
                    </span>
                    <span>{name}</span>
                  </span>
                  <span className="font-mono">{formatModifier(s.modifier)} {s.proficient ? '★' : ''}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Weapon Attacks & Masteries */}
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-surface-50 border border-surface-border space-y-3">
              <h4 className="font-serif font-bold text-sm text-slate-100 flex items-center space-x-2">
                <Sword className="w-4 h-4 text-amber-400" />
                <span>Weapon Attacks & Masteries</span>
              </h4>

              {derived.weaponAttacks.length > 0 ? (
                <div className="space-y-2">
                  {derived.weaponAttacks.map((atk, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-surface-100 border border-surface-border flex items-center justify-between"
                    >
                      <div>
                        <strong className="text-xs text-slate-100">{atk.weaponName}</strong>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Range: {atk.range}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-mono text-xs font-bold text-emerald-400">
                          {formatModifier(atk.attackBonus)} to hit
                        </div>
                        <div className="font-mono text-[11px] text-slate-200">
                          {atk.damageFormula}
                        </div>
                        {atk.masteryProperty && (
                          <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-mono">
                            Mastery: {atk.masteryProperty}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-500 italic">No weapons configured.</div>
              )}
            </div>

            {/* Spellcasting (if applicable) */}
            {derived.spellSaveDc && (
              <div className="p-4 rounded-xl bg-surface-50 border border-surface-border space-y-2">
                <h4 className="font-serif font-bold text-sm text-slate-100 flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>Spellcasting Metrics</span>
                </h4>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded bg-surface-100 border border-surface-border font-mono">
                    <div className="text-[10px] text-slate-400">Save DC</div>
                    <div className="text-sm font-bold text-purple-300">{derived.spellSaveDc}</div>
                  </div>
                  <div className="p-2 rounded bg-surface-100 border border-surface-border font-mono">
                    <div className="text-[10px] text-slate-400">Attack Bonus</div>
                    <div className="text-sm font-bold text-purple-300">{formatModifier(derived.spellAttackBonus || 0)}</div>
                  </div>
                  <div className="p-2 rounded bg-surface-100 border border-surface-border font-mono">
                    <div className="text-[10px] text-slate-400">L1 Slots</div>
                    <div className="text-sm font-bold text-purple-300">
                      {derived.spellSlots[0]?.total || 0} Slots
                    </div>
                  </div>
                </div>

                {state.selectedCantrips.length > 0 && (
                  <div className="text-xs text-slate-300 pt-1">
                    <strong>Cantrips:</strong> {state.selectedCantrips.join(', ')}
                  </div>
                )}

                {state.selectedSpells.length > 0 && (
                  <div className="text-xs text-slate-300">
                    <strong>Prepared Spells:</strong> {state.selectedSpells.join(', ')}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Features, Origin Feats & Background Lore */}
        <div className="p-4 rounded-xl bg-surface-50 border border-surface-border space-y-3">
          <h4 className="font-serif font-bold text-sm text-slate-100 flex items-center space-x-2">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Feats, Species Traits & Languages</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="space-y-1">
              <strong className="text-slate-300 block">Origin Feats:</strong>
              <p className="text-slate-400">{selectedBackground.originFeat}</p>
              {state.humanExtraFeat && <p className="text-slate-400">Human: {state.humanExtraFeat}</p>}
            </div>

            <div className="space-y-1">
              <strong className="text-slate-300 block">Languages:</strong>
              <p className="text-slate-400">{state.selectedLanguages.join(', ')}</p>
            </div>

            <div className="space-y-1">
              <strong className="text-slate-300 block">Equipment & Tools:</strong>
              <p className="text-slate-400">{selectedBackground.tools}</p>
              {state.equippedArmor && <p className="text-slate-400">Armor: {state.equippedArmor}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
