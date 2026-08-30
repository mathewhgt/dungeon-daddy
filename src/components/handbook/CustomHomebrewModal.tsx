import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  Sparkles,
  Shield,
  Award,
  BookOpen,
  Compass,
  Plus,
  Trash2,
  Check,
  Zap,
  Tag,
  HelpCircle,
  Dice5
} from 'lucide-react';
import {
  CustomSubclassEntity,
  CustomFeatEntity,
  CustomBackgroundEntity,
  CustomSpeciesEntity,
  AbilityKey
} from '../../types/handbook';
import { SpellEntity } from '../../types/spell';
import { SKILL_DEFINITIONS } from '../../services/characterCreationService';
import { useApp } from '../../context/AppContext';
import { Search, Wand2 } from 'lucide-react';

export type HomebrewType = 'subclass' | 'feat' | 'background' | 'species';

const OFFICIAL_CLASS_OPTIONS = [
  { id: 'barbarian', name: 'Barbarian' },
  { id: 'bard', name: 'Bard' },
  { id: 'cleric', name: 'Cleric' },
  { id: 'druid', name: 'Druid' },
  { id: 'fighter', name: 'Fighter' },
  { id: 'monk', name: 'Monk' },
  { id: 'paladin', name: 'Paladin' },
  { id: 'ranger', name: 'Ranger' },
  { id: 'rogue', name: 'Rogue' },
  { id: 'sorcerer', name: 'Sorcerer' },
  { id: 'warlock', name: 'Warlock' },
  { id: 'wizard', name: 'Wizard' },
];

const ABILITY_KEYS: { key: AbilityKey; label: string }[] = [
  { key: 'str', label: 'STR' },
  { key: 'dex', label: 'DEX' },
  { key: 'con', label: 'CON' },
  { key: 'int', label: 'INT' },
  { key: 'wis', label: 'WIS' },
  { key: 'cha', label: 'CHA' },
];

interface BonusSpellSelectorProps {
  selectedSpells: string[];
  onChange: (spells: string[]) => void;
  availableSpells: SpellEntity[];
  accentColor?: 'purple' | 'amber' | 'sky' | 'emerald';
  title?: string;
  subtitle?: string;
}

const BonusSpellSelector: React.FC<BonusSpellSelectorProps> = ({
  selectedSpells,
  onChange,
  availableSpells,
  accentColor = 'purple',
  title = 'Additional / Granted Spells',
  subtitle = 'Specify spells automatically granted or prepared by this rule (e.g. subclass domain spells, feat spells, innate spells).'
}) => {
  const [spellInput, setSpellInput] = useState('');

  const filteredSuggestions = React.useMemo(() => {
    if (!spellInput.trim()) return [];
    const query = spellInput.toLowerCase();
    return availableSpells
      .filter((s) => s.name.toLowerCase().includes(query) && !selectedSpells.includes(s.name))
      .slice(0, 8);
  }, [availableSpells, spellInput, selectedSpells]);

  const handleAddSpell = (spellName: string) => {
    const trimmed = spellName.trim();
    if (trimmed && !selectedSpells.includes(trimmed)) {
      onChange([...selectedSpells, trimmed]);
      setSpellInput('');
    }
  };

  const handleRemoveSpell = (spellName: string) => {
    onChange(selectedSpells.filter((s) => s !== spellName));
  };

  const colorStyles = {
    purple: {
      bg: 'bg-purple-950/20 border-purple-800/40',
      label: 'text-purple-300',
      icon: 'text-purple-400',
      badge: 'bg-purple-900/60 border-purple-700 text-purple-200',
      btn: 'bg-purple-600 hover:bg-purple-500',
      focus: 'focus:border-purple-500',
    },
    amber: {
      bg: 'bg-amber-950/20 border-amber-800/40',
      label: 'text-amber-300',
      icon: 'text-amber-400',
      badge: 'bg-amber-900/60 border-amber-700 text-amber-200',
      btn: 'bg-amber-600 hover:bg-amber-500',
      focus: 'focus:border-amber-500',
    },
    sky: {
      bg: 'bg-sky-950/20 border-sky-800/40',
      label: 'text-sky-300',
      icon: 'text-sky-400',
      badge: 'bg-sky-900/60 border-sky-700 text-sky-200',
      btn: 'bg-sky-600 hover:bg-sky-500',
      focus: 'focus:border-sky-500',
    },
    emerald: {
      bg: 'bg-emerald-950/20 border-emerald-800/40',
      label: 'text-emerald-300',
      icon: 'text-emerald-400',
      badge: 'bg-emerald-900/60 border-emerald-700 text-emerald-200',
      btn: 'bg-emerald-600 hover:bg-emerald-500',
      focus: 'focus:border-emerald-500',
    },
  }[accentColor];

  return (
    <div className={`p-4 rounded-xl border space-y-3 ${colorStyles.bg}`}>
      <div className="flex items-center justify-between">
        <div>
          <label className={`text-xs font-bold font-serif flex items-center space-x-1.5 ${colorStyles.label}`}>
            <Wand2 className={`w-3.5 h-3.5 ${colorStyles.icon}`} />
            <span>{title}</span>
          </label>
          <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-50 border border-surface-border text-slate-300 font-mono">
          {selectedSpells.length} Added
        </span>
      </div>

      {/* Selected Spell Chips */}
      {selectedSpells.length > 0 ? (
        <div className="flex flex-wrap gap-1.5 p-2 rounded-lg bg-surface-50 border border-surface-border">
          {selectedSpells.map((sp) => {
            const spellObj = availableSpells.find((s) => s.name.toLowerCase() === sp.toLowerCase());
            return (
              <span
                key={sp}
                className={`px-2.5 py-1 rounded-md border text-xs font-semibold flex items-center space-x-1.5 shadow-sm ${colorStyles.badge}`}
              >
                <span>{sp}</span>
                {spellObj && (
                  <span className="text-[10px] opacity-80 font-mono">
                    ({spellObj.level === 0 ? 'Cantrip' : `Lvl ${spellObj.level}`})
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleRemoveSpell(sp)}
                  className="p-0.5 rounded hover:bg-black/30 opacity-70 hover:opacity-100"
                  title="Remove spell"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })}
        </div>
      ) : (
        <div className="text-xs text-slate-500 italic p-2 rounded bg-surface-50 border border-surface-border/50">
          No additional spells added yet. Type a spell name below or choose from compendium.
        </div>
      )}

      {/* Input / Dropdown Adder */}
      <div className="relative flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={spellInput}
            onChange={(e) => setSpellInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (filteredSuggestions[0]) {
                  handleAddSpell(filteredSuggestions[0].name);
                } else if (spellInput.trim()) {
                  handleAddSpell(spellInput);
                }
              }
            }}
            placeholder="Search compendium spell or type custom spell name..."
            className={`w-full bg-surface-50 border border-surface-border rounded-lg pl-8 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none ${colorStyles.focus}`}
          />

          {/* Autocomplete dropdown */}
          {filteredSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-[#161b22] border border-surface-border rounded-lg shadow-2xl z-50 overflow-hidden max-h-48 overflow-y-auto">
              {filteredSuggestions.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleAddSpell(s.name)}
                  className="w-full text-left px-3 py-1.5 hover:bg-surface-hover border-b border-surface-border/50 text-xs flex items-center justify-between text-slate-200"
                >
                  <span className="font-semibold text-slate-100">{s.name}</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {s.level === 0 ? 'Cantrip' : `Level ${s.level}`} · {s.school}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick select dropdown from compendium */}
        <select
          onChange={(e) => {
            if (e.target.value) {
              handleAddSpell(e.target.value);
              e.target.value = '';
            }
          }}
          className={`bg-surface-50 border border-surface-border rounded-lg px-2.5 py-2 text-xs text-slate-300 focus:outline-none shrink-0 max-w-[160px] ${colorStyles.focus}`}
          defaultValue=""
        >
          <option value="" disabled>+ Quick Pick...</option>
          {availableSpells.map((s) => (
            <option key={s.id} value={s.name}>
              {s.name} ({s.level === 0 ? '0' : s.level})
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => {
            if (spellInput.trim()) handleAddSpell(spellInput);
          }}
          disabled={!spellInput.trim()}
          className={`px-3 py-2 disabled:opacity-40 text-white rounded-lg text-xs font-bold flex items-center space-x-1 shrink-0 ${colorStyles.btn}`}
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add</span>
        </button>
      </div>
    </div>
  );
};

interface CustomHomebrewModalProps {
  isOpen: boolean;
  initialType?: HomebrewType;
  initialItem?: any | null;
  onClose: () => void;
}

export const CustomHomebrewModal: React.FC<CustomHomebrewModalProps> = ({
  isOpen,
  initialType = 'subclass',
  initialItem = null,
  onClose,
}) => {
  const {
    db,
    saveCustomSubclass,
    saveCustomFeat,
    saveCustomBackground,
    saveCustomSpecies,
  } = useApp();

  const availableSpells = db?.spells || [];
  const [activeType, setActiveType] = useState<HomebrewType>(initialType);

  // --- SUBCLASS STATE ---
  const [subclassClassId, setSubclassClassId] = useState('cleric');
  const [subclassName, setSubclassName] = useState('');
  const [subclassSummary, setSubclassSummary] = useState('');
  const [subclassDescription, setSubclassDescription] = useState('');
  const [subclassFeatures, setSubclassFeatures] = useState<string[]>(['']);
  const [subclassBonusSpells, setSubclassBonusSpells] = useState<string[]>([]);

  // --- FEAT STATE ---
  const [featName, setFeatName] = useState('');
  const [featCategory, setFeatCategory] = useState<'Origin' | 'General' | 'Fighting Style' | 'Epic Boon'>('Origin');
  const [featPrerequisite, setFeatPrerequisite] = useState('None');
  const [featSummary, setFeatSummary] = useState('');
  const [featDescription, setFeatDescription] = useState('');
  const [featBonusSpells, setFeatBonusSpells] = useState<string[]>([]);

  // --- BACKGROUND STATE ---
  const [bgName, setBgName] = useState('');
  const [bgAbilities, setBgAbilities] = useState<AbilityKey[]>(['str', 'dex', 'con']);
  const [bgOriginFeat, setBgOriginFeat] = useState('Alert');
  const [bgSkills, setBgSkills] = useState<string[]>(['Athletics', 'Perception']);
  const [bgTools, setBgTools] = useState("Artisan's Tools");
  const [bgGold, setBgGold] = useState(15);
  const [bgEquipment, setBgEquipment] = useState('');
  const [bgSummary, setBgSummary] = useState('');
  const [bgDescription, setBgDescription] = useState('');
  const [bgBonusSpells, setBgBonusSpells] = useState<string[]>([]);

  // --- SPECIES STATE ---
  const [speciesName, setSpeciesName] = useState('');
  const [speciesSize, setSpeciesSize] = useState<'Medium' | 'Small' | 'Medium or Small'>('Medium');
  const [speciesSpeed, setSpeciesSpeed] = useState(30);
  const [speciesVision, setSpeciesVision] = useState('Darkvision (60 ft)');
  const [speciesTraits, setSpeciesTraits] = useState<{ name: string; description: string }[]>([
    { name: 'Darkvision', description: 'You can see in dim light within 60 feet of you as if it were bright light, and in darkness as if it were dim light.' },
  ]);
  const [speciesSummary, setSpeciesSummary] = useState('');
  const [speciesDescription, setSpeciesDescription] = useState('');
  const [speciesBonusSpells, setSpeciesBonusSpells] = useState<string[]>([]);

  const [error, setError] = useState<string | null>(null);

  // Initialize or reset form when modal opens or item changes
  useEffect(() => {
    if (!isOpen) return;

    setError(null);
    if (initialItem) {
      if ('classId' in initialItem) {
        setActiveType('subclass');
        setSubclassClassId(initialItem.classId || 'cleric');
        setSubclassName(initialItem.name || '');
        setSubclassSummary(initialItem.summary || '');
        setSubclassDescription(initialItem.description || '');
        setSubclassFeatures(initialItem.features && initialItem.features.length > 0 ? initialItem.features : ['']);
        setSubclassBonusSpells(initialItem.bonusSpells || []);
      } else if ('category' in initialItem && ('prerequisite' in initialItem || initialItem.category === 'Origin')) {
        setActiveType('feat');
        setFeatName(initialItem.name || '');
        setFeatCategory(initialItem.category || 'Origin');
        setFeatPrerequisite(initialItem.prerequisite || 'None');
        setFeatSummary(initialItem.summary || '');
        setFeatDescription(initialItem.description || '');
        setFeatBonusSpells(initialItem.bonusSpells || []);
      } else if ('allowedAbilities' in initialItem || 'originFeat' in initialItem) {
        setActiveType('background');
        setBgName(initialItem.name || '');
        setBgAbilities(initialItem.allowedAbilities || ['str', 'dex', 'con']);
        setBgOriginFeat(initialItem.originFeat || 'Alert');
        setBgSkills(initialItem.skills || ['Athletics', 'Perception']);
        setBgTools(initialItem.tools || "Artisan's Tools");
        setBgGold(initialItem.equipmentPackage?.gold ?? 15);
        setBgEquipment((initialItem.equipmentPackage?.items || []).join(', '));
        setBgSummary(initialItem.summary || '');
        setBgDescription(initialItem.description || '');
        setBgBonusSpells(initialItem.bonusSpells || []);
      } else if ('size' in initialItem || 'traits' in initialItem) {
        setActiveType('species');
        setSpeciesName(initialItem.name || '');
        setSpeciesSize(initialItem.size || 'Medium');
        setSpeciesSpeed(typeof initialItem.speed === 'number' ? initialItem.speed : parseInt(initialItem.speed) || 30);
        setSpeciesVision(initialItem.vision || 'Darkvision (60 ft)');
        setSpeciesTraits(initialItem.traits && initialItem.traits.length > 0 ? initialItem.traits : [{ name: '', description: '' }]);
        setSpeciesSummary(initialItem.summary || '');
        setSpeciesDescription(initialItem.description || '');
        setSpeciesBonusSpells(initialItem.bonusSpells || []);
      }
    } else {
      setActiveType(initialType);
      // Reset defaults
      setSubclassClassId('cleric');
      setSubclassName('');
      setSubclassSummary('');
      setSubclassDescription('');
      setSubclassFeatures(['']);
      setSubclassBonusSpells([]);

      setFeatName('');
      setFeatCategory('Origin');
      setFeatPrerequisite('None');
      setFeatSummary('');
      setFeatDescription('');
      setFeatBonusSpells([]);

      setBgName('');
      setBgAbilities(['str', 'dex', 'con']);
      setBgOriginFeat('Alert');
      setBgSkills(['Athletics', 'Perception']);
      setBgTools("Artisan's Tools");
      setBgGold(15);
      setBgEquipment('Traveler’s clothes, pouch with 15 GP');
      setBgSummary('');
      setBgDescription('');
      setBgBonusSpells([]);

      setSpeciesName('');
      setSpeciesSize('Medium');
      setSpeciesSpeed(30);
      setSpeciesVision('Darkvision (60 ft)');
      setSpeciesTraits([{ name: 'Trait 1', description: '' }]);
      setSpeciesSummary('');
      setSpeciesDescription('');
      setSpeciesBonusSpells([]);
    }
  }, [isOpen, initialItem, initialType]);

  if (!isOpen) return null;

  const handleToggleBgAbility = (key: AbilityKey) => {
    if (bgAbilities.includes(key)) {
      if (bgAbilities.length > 1) {
        setBgAbilities(bgAbilities.filter((k) => k !== key));
      }
    } else {
      if (bgAbilities.length < 3) {
        setBgAbilities([...bgAbilities, key]);
      } else {
        // Replace first
        setBgAbilities([...bgAbilities.slice(1), key]);
      }
    }
  };

  const handleToggleBgSkill = (skill: string) => {
    if (bgSkills.includes(skill)) {
      if (bgSkills.length > 1) {
        setBgSkills(bgSkills.filter((s) => s !== skill));
      }
    } else {
      if (bgSkills.length < 2) {
        setBgSkills([...bgSkills, skill]);
      } else {
        setBgSkills([bgSkills[1], skill]);
      }
    }
  };

  const handleSave = () => {
    const now = new Date().toISOString();

    if (activeType === 'subclass') {
      if (!subclassName.trim()) {
        setError('Subclass name is required.');
        return;
      }
      const features = subclassFeatures.map((f) => f.trim()).filter(Boolean);
      const entity: CustomSubclassEntity = {
        id: initialItem?.id || `subclass-custom-${Date.now()}`,
        classId: subclassClassId,
        name: subclassName.trim(),
        summary: subclassSummary.trim() || `Custom subclass for ${subclassClassId}.`,
        features,
        bonusSpells: subclassBonusSpells.length > 0 ? subclassBonusSpells : undefined,
        description: subclassDescription.trim(),
        isCustom: true,
        createdAt: initialItem?.createdAt || now,
        updatedAt: now,
      };
      saveCustomSubclass(entity);
      onClose();
    } else if (activeType === 'feat') {
      if (!featName.trim()) {
        setError('Feat name is required.');
        return;
      }
      const entity: CustomFeatEntity = {
        id: initialItem?.id || `feat-custom-${Date.now()}`,
        name: featName.trim(),
        category: featCategory,
        prerequisite: featPrerequisite.trim() || 'None',
        summary: featSummary.trim() || featDescription.trim().slice(0, 100) || 'Custom homebrew feat.',
        description: featDescription.trim() || featSummary.trim(),
        bonusSpells: featBonusSpells.length > 0 ? featBonusSpells : undefined,
        isCustom: true,
        createdAt: initialItem?.createdAt || now,
        updatedAt: now,
      };
      saveCustomFeat(entity);
      onClose();
    } else if (activeType === 'background') {
      if (!bgName.trim()) {
        setError('Background name is required.');
        return;
      }
      if (bgAbilities.length !== 3) {
        setError('Please select exactly 3 allowed ability scores for the background.');
        return;
      }
      const itemsList = bgEquipment
        .split(',')
        .map((i) => i.trim())
        .filter(Boolean);

      const entity: CustomBackgroundEntity = {
        id: initialItem?.id || `bg-custom-${Date.now()}`,
        name: bgName.trim(),
        allowedAbilities: bgAbilities,
        originFeat: bgOriginFeat.trim() || 'Alert',
        skills: bgSkills,
        tools: bgTools.trim() || 'None',
        bonusSpells: bgBonusSpells.length > 0 ? bgBonusSpells : undefined,
        equipmentPackage: {
          description: bgEquipment.trim() || 'Standard traveler equipment',
          items: itemsList,
          gold: bgGold || 0,
        },
        summary: bgSummary.trim() || `Custom background with ${bgSkills.join(', ')} proficiencies.`,
        description: bgDescription.trim() || bgSummary.trim(),
        isCustom: true,
        createdAt: initialItem?.createdAt || now,
        updatedAt: now,
      };
      saveCustomBackground(entity);
      onClose();
    } else if (activeType === 'species') {
      if (!speciesName.trim()) {
        setError('Species / Race name is required.');
        return;
      }
      const traits = speciesTraits.filter((t) => t.name.trim().length > 0);
      const entity: CustomSpeciesEntity = {
        id: initialItem?.id || `species-custom-${Date.now()}`,
        name: speciesName.trim(),
        size: speciesSize,
        speed: Number(speciesSpeed) || 30,
        vision: speciesVision.trim() || 'Normal',
        traits: traits.length > 0 ? traits : [{ name: 'Custom Trait', description: 'Special species trait.' }],
        bonusSpells: speciesBonusSpells.length > 0 ? speciesBonusSpells : undefined,
        summary: speciesSummary.trim() || `Custom species (${speciesSize}, ${speciesSpeed} ft speed).`,
        description: speciesDescription.trim() || speciesSummary.trim(),
        isCustom: true,
        createdAt: initialItem?.createdAt || now,
        updatedAt: now,
      };
      saveCustomSpecies(entity);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-surface-200 border border-surface-border w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-surface-border flex items-center justify-between bg-surface-100/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 font-serif">
                {initialItem ? 'Edit Homebrew Rule' : 'Create Homebrew Rule'}
              </h2>
              <p className="text-xs text-slate-400">
                Design custom subclasses, feats, backgrounds, and species for handbook and character creation.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-surface-50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Type Selector Tabs */}
        {!initialItem && (
          <div className="px-6 pt-4 pb-2 border-b border-surface-border bg-surface-100/30 grid grid-cols-4 gap-2">
            <button
              onClick={() => { setActiveType('subclass'); setError(null); }}
              className={`flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                activeType === 'subclass'
                  ? 'bg-purple-500/20 border-purple-500/60 text-purple-300 shadow-sm'
                  : 'bg-surface-100 border-surface-border text-slate-400 hover:text-slate-200 hover:bg-surface-hover'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Subclass</span>
            </button>
            <button
              onClick={() => { setActiveType('feat'); setError(null); }}
              className={`flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                activeType === 'feat'
                  ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-sm'
                  : 'bg-surface-100 border-surface-border text-slate-400 hover:text-slate-200 hover:bg-surface-hover'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Feat</span>
            </button>
            <button
              onClick={() => { setActiveType('background'); setError(null); }}
              className={`flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                activeType === 'background'
                  ? 'bg-sky-500/20 border-sky-500/60 text-sky-300 shadow-sm'
                  : 'bg-surface-100 border-surface-border text-slate-400 hover:text-slate-200 hover:bg-surface-hover'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Background</span>
            </button>
            <button
              onClick={() => { setActiveType('species'); setError(null); }}
              className={`flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                activeType === 'species'
                  ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-300 shadow-sm'
                  : 'bg-surface-100 border-surface-border text-slate-400 hover:text-slate-200 hover:bg-surface-hover'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Species</span>
            </button>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-red-950/60 border border-red-800/80 text-red-200 text-xs flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-200">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* ============================================================ */}
          {/* SUBCLASS FORM */}
          {/* ============================================================ */}
          {activeType === 'subclass' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Parent Class <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={subclassClassId}
                    onChange={(e) => setSubclassClassId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-100 border border-surface-border text-slate-200 text-xs focus:outline-none focus:border-purple-500"
                  >
                    {OFFICIAL_CLASS_OPTIONS.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Subclass Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={subclassName}
                    onChange={(e) => setSubclassName(e.target.value)}
                    placeholder="e.g. Twilight Domain, Echo Knight"
                    className="w-full px-3 py-2 rounded-xl bg-surface-100 border border-surface-border text-slate-200 text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Summary / Flavor Preview
                </label>
                <input
                  type="text"
                  value={subclassSummary}
                  onChange={(e) => setSubclassSummary(e.target.value)}
                  placeholder="Short 1-line description of the subclass playstyle"
                  className="w-full px-3 py-2 rounded-xl bg-surface-100 border border-surface-border text-slate-200 text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Subclass Features / Capabilities
                  </label>
                  <button
                    type="button"
                    onClick={() => setSubclassFeatures([...subclassFeatures, ''])}
                    className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Feature</span>
                  </button>
                </div>
                <div className="space-y-2">
                  {subclassFeatures.map((feat, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <span className="text-[11px] text-slate-500 w-5 font-mono">#{idx + 1}</span>
                      <input
                        type="text"
                        value={feat}
                        onChange={(e) => {
                          const updated = [...subclassFeatures];
                          updated[idx] = e.target.value;
                          setSubclassFeatures(updated);
                        }}
                        placeholder={`Feature Name (e.g. ${idx === 0 ? 'Eyes of Night' : idx === 1 ? 'Twilight Sanctuary' : 'Steps of Night'})`}
                        className="flex-1 px-3 py-1.5 rounded-lg bg-surface-100 border border-surface-border text-slate-200 text-xs focus:outline-none focus:border-purple-500"
                      />
                      {subclassFeatures.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setSubclassFeatures(subclassFeatures.filter((_, i) => i !== idx))}
                          className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-surface-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Granted / Subclass Spells */}
              <BonusSpellSelector
                selectedSpells={subclassBonusSpells}
                onChange={setSubclassBonusSpells}
                availableSpells={availableSpells}
                accentColor="purple"
                title="Subclass Spells / Domain Spells"
                subtitle="Spells automatically prepared or added to the character spell list when choosing this subclass."
              />

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Detailed Description & Lore (Optional)
                </label>
                <textarea
                  rows={4}
                  value={subclassDescription}
                  onChange={(e) => setSubclassDescription(e.target.value)}
                  placeholder="Full subclass description, lore, and mechanical details..."
                  className="w-full px-3 py-2 rounded-xl bg-surface-100 border border-surface-border text-slate-200 text-xs focus:outline-none focus:border-purple-500 resize-none font-sans"
                />
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* FEAT FORM */}
          {/* ============================================================ */}
          {activeType === 'feat' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Feat Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={featName}
                    onChange={(e) => setFeatName(e.target.value)}
                    placeholder="e.g. Shadow Touched, Fey Touched"
                    className="w-full px-3 py-2 rounded-xl bg-surface-100 border border-surface-border text-slate-200 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={featCategory}
                    onChange={(e) => setFeatCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-100 border border-surface-border text-slate-200 text-xs focus:outline-none focus:border-amber-500"
                  >
                    <option value="Origin">Origin Feat (Level 1 / Background)</option>
                    <option value="General">General Feat (Level 4+)</option>
                    <option value="Fighting Style">Fighting Style</option>
                    <option value="Epic Boon">Epic Boon (Level 19+)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Prerequisite
                </label>
                <input
                  type="text"
                  value={featPrerequisite}
                  onChange={(e) => setFeatPrerequisite(e.target.value)}
                  placeholder="e.g. None, Level 4+, Charisma 13+"
                  className="w-full px-3 py-2 rounded-xl bg-surface-100 border border-surface-border text-slate-200 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Summary
                </label>
                <input
                  type="text"
                  value={featSummary}
                  onChange={(e) => setFeatSummary(e.target.value)}
                  placeholder="Short 1-line summary of what the feat provides"
                  className="w-full px-3 py-2 rounded-xl bg-surface-100 border border-surface-border text-slate-200 text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Bonus / Granted Spells for Feats */}
              <BonusSpellSelector
                selectedSpells={featBonusSpells}
                onChange={setFeatBonusSpells}
                availableSpells={availableSpells}
                accentColor="amber"
                title="Granted Spells (e.g. Magic Initiate, Fey Touched)"
                subtitle="Additional cantrips or spells taught or granted by this feat."
              />

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Benefits & Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={5}
                  value={featDescription}
                  onChange={(e) => setFeatDescription(e.target.value)}
                  placeholder="Detailed bullets and mechanical rules for the feat..."
                  className="w-full px-3 py-2 rounded-xl bg-surface-100 border border-surface-border text-slate-200 text-xs focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* BACKGROUND FORM */}
          {/* ============================================================ */}
          {activeType === 'background' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Background Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={bgName}
                    onChange={(e) => setBgName(e.target.value)}
                    placeholder="e.g. Blacksmith, Apothecary, Spy"
                    className="w-full px-3 py-2 rounded-xl bg-surface-100 border border-surface-border text-slate-200 text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Origin Feat Granted
                  </label>
                  <input
                    type="text"
                    value={bgOriginFeat}
                    onChange={(e) => setBgOriginFeat(e.target.value)}
                    placeholder="e.g. Crafter, Alert, Tough, Magic Initiate"
                    className="w-full px-3 py-2 rounded-xl bg-surface-100 border border-surface-border text-slate-200 text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              {/* 3 Allowed Ability Scores */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Allowed Ability Score Increases (Pick exactly 3)
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {ABILITY_KEYS.map(({ key, label }) => {
                    const isSelected = bgAbilities.includes(key);
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handleToggleBgAbility(key)}
                        className={`py-2 px-2 rounded-xl border text-xs font-bold transition-all flex items-center justify-center space-x-1 ${
                          isSelected
                            ? 'bg-sky-500/20 border-sky-500 text-sky-300 shadow-sm'
                            : 'bg-surface-100 border-surface-border text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                        <span>{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2 Skill Proficiencies */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Skill Proficiencies (Pick 2)
                </label>
                <div className="grid grid-cols-3 gap-1.5 max-h-36 overflow-y-auto p-2 rounded-xl bg-surface-100 border border-surface-border">
                  {SKILL_DEFINITIONS.map((sk) => {
                    const isSelected = bgSkills.includes(sk.name);
                    return (
                      <button
                        key={sk.name}
                        type="button"
                        onClick={() => handleToggleBgSkill(sk.name)}
                        className={`text-left px-2 py-1 rounded-lg text-[11px] font-medium transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-sky-500/30 text-sky-200 font-semibold'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-surface-50'
                        }`}
                      >
                        <span>{sk.name}</span>
                        {isSelected && <Check className="w-3 h-3 text-sky-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tool Proficiency
                  </label>
                  <input
                    type="text"
                    value={bgTools}
                    onChange={(e) => setBgTools(e.target.value)}
                    placeholder="e.g. Smith's Tools, Thieves' Tools"
                    className="w-full px-3 py-2 rounded-xl bg-surface-100 border border-surface-border text-slate-200 text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Starting Gold (GP)
                  </label>
                  <input
                    type="number"
                    value={bgGold}
                    onChange={(e) => setBgGold(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-100 border border-surface-border text-slate-200 text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Starting Equipment
                </label>
                <input
                  type="text"
                  value={bgEquipment}
                  onChange={(e) => setBgEquipment(e.target.value)}
                  placeholder="e.g. Traveler's clothes, smith's hammer, iron tongs"
                  className="w-full px-3 py-2 rounded-xl bg-surface-100 border border-surface-border text-slate-200 text-xs focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Bonus / Granted Spells for Backgrounds */}
              <BonusSpellSelector
                selectedSpells={bgBonusSpells}
                onChange={setBgBonusSpells}
                availableSpells={availableSpells}
                accentColor="sky"
                title="Bonus Background Spells"
                subtitle="Additional spells or cantrips granted by this background origin."
              />

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Summary & Narrative Description
                </label>
                <textarea
                  rows={3}
                  value={bgDescription}
                  onChange={(e) => {
                    setBgDescription(e.target.value);
                    if (!bgSummary) setBgSummary(e.target.value.slice(0, 100));
                  }}
                  placeholder="Roleplay background origin, life history, and flavor..."
                  className="w-full px-3 py-2 rounded-xl bg-surface-100 border border-surface-border text-slate-200 text-xs focus:outline-none focus:border-sky-500 resize-none"
                />
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* SPECIES / RACE FORM */}
          {/* ============================================================ */}
          {activeType === 'species' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Species / Race Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={speciesName}
                    onChange={(e) => setSpeciesName(e.target.value)}
                    placeholder="e.g. Tabaxi, Kobold, Genasi"
                    className="w-full px-3 py-2 rounded-xl bg-surface-100 border border-surface-border text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Size
                  </label>
                  <select
                    value={speciesSize}
                    onChange={(e) => setSpeciesSize(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-surface-100 border border-surface-border text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Medium">Medium</option>
                    <option value="Small">Small</option>
                    <option value="Medium or Small">Medium or Small (Player Choice)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Speed (feet)
                  </label>
                  <input
                    type="number"
                    value={speciesSpeed}
                    onChange={(e) => setSpeciesSpeed(parseInt(e.target.value) || 30)}
                    placeholder="30"
                    className="w-full px-3 py-2 rounded-xl bg-surface-100 border border-surface-border text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Vision
                  </label>
                  <input
                    type="text"
                    value={speciesVision}
                    onChange={(e) => setSpeciesVision(e.target.value)}
                    placeholder="e.g. Darkvision (60 ft), Normal"
                    className="w-full px-3 py-2 rounded-xl bg-surface-100 border border-surface-border text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Racial Traits List */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Racial Traits & Special Features
                  </label>
                  <button
                    type="button"
                    onClick={() => setSpeciesTraits([...speciesTraits, { name: '', description: '' }])}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Trait</span>
                  </button>
                </div>
                <div className="space-y-2.5">
                  {speciesTraits.map((tr, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-surface-100 border border-surface-border space-y-2">
                      <div className="flex items-center justify-between">
                        <input
                          type="text"
                          value={tr.name}
                          onChange={(e) => {
                            const updated = [...speciesTraits];
                            updated[idx] = { ...updated[idx], name: e.target.value };
                            setSpeciesTraits(updated);
                          }}
                          placeholder="Trait Name (e.g. Feline Agility, Claws)"
                          className="w-2/3 px-2.5 py-1 rounded bg-surface-200 border border-surface-border text-slate-200 text-xs focus:outline-none focus:border-emerald-500 font-semibold"
                        />
                        {speciesTraits.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setSpeciesTraits(speciesTraits.filter((_, i) => i !== idx))}
                            className="p-1 text-slate-500 hover:text-red-400 rounded hover:bg-surface-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <textarea
                        rows={2}
                        value={tr.description}
                        onChange={(e) => {
                          const updated = [...speciesTraits];
                          updated[idx] = { ...updated[idx], description: e.target.value };
                          setSpeciesTraits(updated);
                        }}
                        placeholder="Trait mechanics and description..."
                        className="w-full px-2.5 py-1 rounded bg-surface-200 border border-surface-border text-slate-300 text-xs focus:outline-none focus:border-emerald-500 resize-none"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Bonus / Granted Spells for Species */}
              <BonusSpellSelector
                selectedSpells={speciesBonusSpells}
                onChange={setSpeciesBonusSpells}
                availableSpells={availableSpells}
                accentColor="emerald"
                title="Innate / Racial Spells"
                subtitle="Spells or cantrips naturally known by members of this species."
              />

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Summary & Flavor
                </label>
                <textarea
                  rows={3}
                  value={speciesDescription}
                  onChange={(e) => {
                    setSpeciesDescription(e.target.value);
                    if (!speciesSummary) setSpeciesSummary(e.target.value.slice(0, 100));
                  }}
                  placeholder="Physical appearance, origins, and cultural background..."
                  className="w-full px-3 py-2 rounded-xl bg-surface-100 border border-surface-border text-slate-200 text-xs focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-surface-border bg-surface-100/50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-surface-border text-slate-300 hover:bg-surface-50 text-xs font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-900/30 flex items-center space-x-2 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Homebrew {activeType.charAt(0).toUpperCase() + activeType.slice(1)}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
