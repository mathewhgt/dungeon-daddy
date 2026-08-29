import React from 'react';
import {
  User,
  Shield,
  Coins,
  Package,
  Scroll,
  Heart,
  Sparkles,
  CheckCircle2,
  Image,
  Upload,
  RefreshCw,
} from 'lucide-react';
import {
  CharacterCreationState,
  ArmorItem2024,
} from '../../../types/characterCreator';
import {
  CLASSES_2024,
  BACKGROUNDS_2024,
  ARMOR_2024,
  ALIGNMENTS,
} from '../../../services/characterCreationService';
import { ImageUploadPicker } from '../../common/ImageUploadPicker';

interface StepNarrativeAndEquipmentProps {
  state: CharacterCreationState;
  onChange: (updates: Partial<CharacterCreationState>) => void;
}

const SAMPLE_NAMES: Record<string, string[]> = {
  barbarian: ['Krag Heavyblade', 'Brakka Bearclaw', 'Rurik Stonebreaker', 'Ylva Frostborn'],
  bard: ['Lyra Nightingale', 'Finnegan Brightwhistle', 'Aria Moonwhisper', 'Darian Silverchord'],
  cleric: ['Brother Thaddeus', 'Elowen Dawnseeker', 'Sister Valerie', 'Gideon Sunspear'],
  druid: ['Rowan Woodstrider', 'Sylvan Oakthorn', 'Bryn Stormcaller', 'Willow Windrunner'],
  fighter: ['Cedric Ironclad', 'Kaelen Swiftblade', 'Garrick Stormshield', 'Vaelin Darkmoor'],
  monk: ['Master Wu', 'Tenzin Swiftfoot', 'Lin Shadowstrike', 'Kiran Peacekeeper'],
  paladin: ['Sir Gareth Justiciar', 'Lady Aurelia Suncrest', 'Valeria Dawnguard', 'Lord Tristan Vane'],
  ranger: ['Strider Thorne', 'Vesper Nightshade', 'Dain Wolfstalker', 'Faer Wildstrider'],
  rogue: ['Shadowstep Jax', 'Vesper Ravenwing', 'Corvin Quickhand', 'Nyx Silverblade'],
  sorcerer: ['Ignis Sunspark', 'Vespera Moonveil', 'Zephyr Skyflare', 'Astrid Chaosbound'],
  warlock: ['Malakar Voidweaver', 'Lilith Shadowbound', 'Lucius Darkwhisper', 'Morgana Starfall'],
  wizard: ['Archmage Eldrin', 'Alistair Runeweaver', 'Elas Sparkfinder', 'Morrigan Deepmind'],
};

export const StepNarrativeAndEquipment: React.FC<StepNarrativeAndEquipmentProps> = ({ state, onChange }) => {
  const selectedClass = CLASSES_2024.find((c) => c.id === state.selectedClassId) || CLASSES_2024[0];
  const selectedBackground = BACKGROUNDS_2024.find((b) => b.id === state.selectedBackgroundId) || BACKGROUNDS_2024[0];

  const handleRandomizeName = () => {
    const list = SAMPLE_NAMES[selectedClass.id] || SAMPLE_NAMES.fighter;
    const randomName = list[Math.floor(Math.random() * list.length)];
    onChange({ characterName: randomName });
  };

  // Filter armors that class can wear
  const eligibleArmor = ARMOR_2024.filter((a) => {
    if (a.category === 'Shield') return false;
    if (selectedClass.armorProficiencies.includes('All Armor')) return true;
    if (selectedClass.armorProficiencies.includes('Medium Armor') && (a.category === 'Light' || a.category === 'Medium')) return true;
    if (selectedClass.armorProficiencies.includes('Light Armor') && a.category === 'Light') return true;
    if (selectedClass.armorProficiencies.includes('None')) return false;
    return false;
  });

  return (
    <div className="space-y-8">
      {/* Step Header */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-blue-500/10 via-surface-100 to-surface-100 border border-blue-500/20">
        <h2 className="font-serif font-bold text-lg text-slate-100 flex items-center space-x-2">
          <User className="w-5 h-5 text-blue-400" />
          <span>Step 5: Identity, Alignment, Backstory & Equipment</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
          Bring your character to life with their moral alignment, physical appearance, personality traits, and starting equipment loadout.
        </p>
      </div>

      {/* SECTION 1: IDENTITY & ARTWORK */}
      <div className="p-5 rounded-2xl bg-surface-100 border border-surface-border space-y-4">
        <h3 className="font-serif font-bold text-base text-slate-100 flex items-center space-x-2">
          <User className="w-4 h-4 text-blue-400" />
          <span>Character Identity & Artwork</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Character Name */}
          <div className="space-y-1.5 md:col-span-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">Character Name *</label>
              <button
                type="button"
                onClick={handleRandomizeName}
                className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center space-x-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Suggest Name</span>
              </button>
            </div>
            <input
              type="text"
              placeholder="e.g. Valeria Brightshield"
              value={state.characterName}
              onChange={(e) => onChange({ characterName: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-surface-50 border border-surface-border rounded-xl text-sm text-slate-100 font-serif font-bold placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Player Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Player Name (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Mathew"
              value={state.playerName}
              onChange={(e) => onChange({ playerName: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-surface-50 border border-surface-border rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Artwork Picker */}
        <div className="pt-2">
          <ImageUploadPicker
            label="Hero Character Artwork & VTT Token"
            avatarUrl={state.avatarUrl}
            tokenUrl={state.tokenUrl}
            onAvatarChange={(url: string) => onChange({ avatarUrl: url })}
            onTokenChange={(url: string) => onChange({ tokenUrl: url })}
            entityName={state.characterName || 'Hero'}
            entityType="player"
          />
        </div>
      </div>

      {/* SECTION 2: 9-POINT MORAL ALIGNMENT */}
      <div className="p-5 rounded-2xl bg-surface-100 border border-surface-border space-y-4">
        <h3 className="font-serif font-bold text-base text-slate-100">
          Moral Alignment
        </h3>
        <p className="text-xs text-slate-400">
          Alignment reflects a character's moral compass (Good vs Evil) and ethical worldview (Law vs Chaos).
        </p>

        {/* 3x3 Grid */}
        <div className="grid grid-cols-3 gap-2.5 max-w-lg mx-auto">
          {ALIGNMENTS.map((align) => {
            const isSelected = state.alignment === align;
            return (
              <button
                type="button"
                key={align}
                onClick={() => onChange({ alignment: align })}
                className={`py-3 px-2 rounded-xl text-xs font-serif font-bold border transition-all text-center flex flex-col items-center justify-center space-y-1 ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                    : 'bg-surface-50 text-slate-300 border-surface-border hover:border-slate-500 hover:text-white'
                }`}
              >
                <span>{align}</span>
                {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: PHYSICAL TRAITS & PERSONALITY */}
      <div className="p-5 rounded-2xl bg-surface-100 border border-surface-border space-y-4">
        <h3 className="font-serif font-bold text-base text-slate-100">
          Physical Appearance & Backstory
        </h3>

        {/* Physical Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-400">Age</label>
            <input
              type="text"
              placeholder="e.g. 24"
              value={state.physical.age}
              onChange={(e) => onChange({ physical: { ...state.physical, age: e.target.value } })}
              className="w-full px-3 py-1.5 bg-surface-50 border border-surface-border rounded-lg text-xs text-slate-100"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-400">Height</label>
            <input
              type="text"
              placeholder="e.g. 5 ft 11 in"
              value={state.physical.height}
              onChange={(e) => onChange({ physical: { ...state.physical, height: e.target.value } })}
              className="w-full px-3 py-1.5 bg-surface-50 border border-surface-border rounded-lg text-xs text-slate-100"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-400">Weight</label>
            <input
              type="text"
              placeholder="e.g. 175 lbs"
              value={state.physical.weight}
              onChange={(e) => onChange({ physical: { ...state.physical, weight: e.target.value } })}
              className="w-full px-3 py-1.5 bg-surface-50 border border-surface-border rounded-lg text-xs text-slate-100"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-400">Eyes & Hair</label>
            <input
              type="text"
              placeholder="e.g. Amber eyes, dark hair"
              value={state.physical.eyes}
              onChange={(e) => onChange({ physical: { ...state.physical, eyes: e.target.value } })}
              className="w-full px-3 py-1.5 bg-surface-50 border border-surface-border rounded-lg text-xs text-slate-100"
            />
          </div>
        </div>

        {/* Narrative Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Personality Traits</label>
            <textarea
              rows={2}
              placeholder="e.g. I always have a backup plan. I face danger head-on."
              value={state.personalityTraits}
              onChange={(e) => onChange({ personalityTraits: e.target.value })}
              className="w-full p-2.5 bg-surface-50 border border-surface-border rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Ideals & Bonds</label>
            <textarea
              rows={2}
              placeholder="e.g. Justice: The law must apply equally to all. Bond: I protect my comrades."
              value={state.ideals}
              onChange={(e) => onChange({ ideals: e.target.value })}
              className="w-full p-2.5 bg-surface-50 border border-surface-border rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div className="space-y-1.5 pt-2">
          <label className="text-xs font-semibold text-slate-300">Backstory & Character Concept</label>
          <textarea
            rows={3}
            placeholder="Write the origin story and motivations of your character..."
            value={state.backstory}
            onChange={(e) => onChange({ backstory: e.target.value })}
            className="w-full p-3 bg-surface-50 border border-surface-border rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* SECTION 4: STARTING EQUIPMENT & ARMOR */}
      <div className="p-5 rounded-2xl bg-surface-100 border border-surface-border space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="font-serif font-bold text-base text-slate-100 flex items-center space-x-2">
              <Package className="w-4 h-4 text-amber-400" />
              <span>Starting Equipment & Armor Loadout</span>
            </h3>
            <p className="text-xs text-slate-400">
              Choose between your Background + Class equipment package or starting cash.
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-surface-50 p-1 rounded-lg border border-surface-border text-xs">
            <button
              type="button"
              onClick={() => onChange({ equipmentMode: 'package' })}
              className={`px-3 py-1 rounded font-bold transition-all ${
                state.equipmentMode === 'package'
                  ? 'bg-amber-600 text-slate-950'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Equipment Package
            </button>
            <button
              type="button"
              onClick={() => onChange({ equipmentMode: 'gold' })}
              className={`px-3 py-1 rounded font-bold transition-all ${
                state.equipmentMode === 'gold'
                  ? 'bg-amber-600 text-slate-950'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              50 GP Cash Mode
            </button>
          </div>
        </div>

        {/* Armor & Shield Equipping Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Equipped Armor */}
          <div className="p-4 rounded-xl bg-surface-50 border border-surface-border space-y-2">
            <label className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
              <Shield className="w-3.5 h-3.5 text-blue-400" />
              <span>Equipped Armor</span>
            </label>
            <select
              value={state.equippedArmor || 'none'}
              onChange={(e) => onChange({ equippedArmor: e.target.value === 'none' ? undefined : e.target.value })}
              className="w-full px-3 py-2 bg-surface-100 border border-surface-border rounded-lg text-xs text-slate-100 font-semibold focus:outline-none focus:border-amber-500"
            >
              <option value="none">Unarmored (No Armor)</option>
              {eligibleArmor.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} (Base AC {a.baseAc}, {a.category})
                </option>
              ))}
            </select>
            <p className="text-[10px] text-slate-400">
              Armor proficiencies: {selectedClass.armorProficiencies.join(', ')}
            </p>
          </div>

          {/* Equipped Shield */}
          <div className="p-4 rounded-xl bg-surface-50 border border-surface-border flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>Equip Shield (+2 AC)</span>
              </label>
              <p className="text-[10px] text-slate-400">
                {selectedClass.armorProficiencies.includes('Shields')
                  ? 'Class proficient with shields.'
                  : 'Class is not natively trained in shields.'}
              </p>
            </div>

            <input
              type="checkbox"
              checked={state.equippedShield}
              onChange={(e) => onChange({ equippedShield: e.target.checked })}
              className="w-5 h-5 rounded accent-amber-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Equipment Package Contents */}
        <div className="p-3.5 rounded-xl bg-surface-50 border border-surface-border space-y-2">
          <div className="text-xs font-bold text-amber-400">
            Background Package: {selectedBackground.name} ({selectedBackground.equipmentPackage.gold} GP Cash)
          </div>
          <div className="flex flex-wrap gap-1.5 text-[11px] text-slate-300">
            {selectedBackground.equipmentPackage.items.map((item, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded bg-surface-100 border border-surface-border">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
