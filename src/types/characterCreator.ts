import { AbilityScores } from './monster';
import { PlayerEntity } from './player';

export type AbilityKey = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';

export type AbilityScoreMethod = 'standard' | 'pointbuy' | 'rolling' | 'manual';

export interface ClassSubclass2024 {
  id: string;
  name: string;
  summary: string;
  features: string[];
}

export interface ClassDefinition2024 {
  id: string;
  name: string;
  hitDie: number; // 6, 8, 10, 12
  primaryAbility: string;
  savingThrows: AbilityKey[];
  armorProficiencies: string[];
  weaponProficiencies: string[];
  toolProficiencies?: string[];
  skillChoices: {
    count: number;
    options: string[]; // e.g. ['Athletics', 'Intimidation', ...] or ['Any']
  };
  level1Features: {
    name: string;
    description: string;
  }[];
  weaponMasteriesCount: number;
  subclasses: ClassSubclass2024[];
  spellcasting?: {
    casterType: 'full' | 'half' | 'pact' | 'third';
    ability: AbilityKey;
    cantripsKnown: number;
    spellsPrepared: number;
    spellList: string[]; // Allowed spell names or class tag
  };
  orderChoices?: {
    name: string;
    options: { name: string; description: string; benefits?: string }[];
  };
  fightingStyleChoices?: string[];
  icon: string;
  color: string;
  description: string;
}

export interface BackgroundDefinition2024 {
  id: string;
  name: string;
  allowedAbilities: AbilityKey[]; // exactly 3 stats
  originFeat: string;
  skills: string[];
  tools: string;
  toolChoices?: string[];
  equipmentPackage: {
    description: string;
    items: string[];
    gold: number;
  };
  summary: string;
  description: string;
}

export interface SpeciesLineage2024 {
  id: string;
  name: string;
  description: string;
  bonusSpells?: string[];
  traits?: string[];
}

export interface SpeciesDefinition2024 {
  id: string;
  name: string;
  size: 'Medium' | 'Small' | 'Medium or Small';
  speed: number;
  vision: string;
  traits: {
    name: string;
    description: string;
  }[];
  lineages?: SpeciesLineage2024[];
  ancestralChoices?: {
    title: string;
    options: { id: string; name: string; description: string }[];
  };
  hasExtraFeat?: boolean; // Human
  hasExtraSkill?: boolean; // Human
  extraHpPerLevel?: number; // Dwarf
  summary: string;
  description: string;
}

export interface OriginFeatDefinition2024 {
  id: string;
  name: string;
  category: 'Origin' | 'General' | 'Fighting Style' | 'Epic Boon';
  prerequisite: string;
  summary: string;
  description: string;
  requiresSpellChoice?: {
    schools: ('Cleric' | 'Druid' | 'Wizard')[];
    cantripsCount: number;
    level1Count: number;
  };
  requiresSkillChoices?: {
    count: number;
  };
  requiresToolChoices?: {
    count: number;
  };
}

export interface WeaponMasteryDefinition2024 {
  id: string;
  property: string;
  name: string;
  weapons: string[];
  summary: string;
  description: string;
}

export interface WeaponItem2024 {
  id: string;
  name: string;
  category: 'Simple' | 'Martial';
  rangeType: 'Melee' | 'Ranged';
  damage: string;
  damageType: string;
  properties: string[];
  masteryProperty: string;
  weight: string;
  cost: string;
}

export interface ArmorItem2024 {
  id: string;
  name: string;
  category: 'Light' | 'Medium' | 'Heavy' | 'Shield';
  baseAc: number;
  dexBonus: 'full' | 'max2' | 'none';
  stealthDisadvantage: boolean;
  minStr?: number;
  weight: string;
  cost: string;
}

export interface CharacterCreationState {
  characterName: string;
  playerName: string;
  avatarUrl: string;
  tokenUrl: string;
  level: number;
  alignment: string;

  // Step 1: Class
  selectedClassId: string;
  selectedSubclassId?: string;
  classSkillChoices: string[];
  selectedOrderOrStyle?: string;

  // Step 2: Origin
  selectedBackgroundId: string;
  selectedBackgroundTool?: string;
  selectedSpeciesId: string;
  selectedLineageId?: string;
  selectedAncestralChoiceId?: string;
  selectedSize: 'Medium' | 'Small';
  selectedLanguages: string[];
  humanExtraFeat?: string;
  humanExtraSkill?: string;

  // Step 3: Ability Scores
  abilityMethod: AbilityScoreMethod;
  baseScores: AbilityScores;
  backgroundBonusType: '+2/+1' | '+1/+1/+1';
  backgroundBonusAssignment: Partial<Record<AbilityKey, number>>;
  rolledScoresHistory?: number[][];

  // Step 4: Feats, Masteries & Spells
  selectedWeaponMasteries: string[]; // array of weapon ids or mastery properties
  originFeatChoices?: {
    spellList?: 'Cleric' | 'Druid' | 'Wizard';
    cantrips?: string[];
    level1Spell?: string;
    skills?: string[];
    tools?: string[];
  };
  selectedCantrips: string[];
  selectedSpells: string[];

  // Step 5: Equipment & Narrative
  equipmentMode: 'package' | 'gold';
  startingGold: number;
  inventory: string[];
  equippedArmor?: string;
  equippedShield: boolean;
  backstory: string;
  personalityTraits: string;
  ideals: string;
  bonds: string;
  flaws: string;
  physical: {
    gender: string;
    age: string;
    height: string;
    weight: string;
    eyes: string;
    hair: string;
    skin: string;
  };
}

export interface DerivedCharacterStats {
  maxHp: number;
  armorClass: number;
  armorClassBreakdown: string;
  initiativeBonus: number;
  speed: string;
  proficiencyBonus: number;
  finalScores: AbilityScores;
  modifiers: Record<AbilityKey, number>;
  savingThrows: Record<AbilityKey, { modifier: number; proficient: boolean }>;
  skills: Record<string, { ability: AbilityKey; modifier: number; proficient: boolean; expertise?: boolean }>;
  passivePerception: number;
  passiveInvestigation: number;
  passiveInsight: number;
  spellSaveDc?: number;
  spellAttackBonus?: number;
  spellCastingAbility?: AbilityKey;
  spellSlots: { level: number; total: number; used: number }[];
  weaponAttacks: {
    weaponName: string;
    attackBonus: number;
    damageFormula: string;
    masteryProperty?: string;
    range?: string;
  }[];
}
