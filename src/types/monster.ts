import { BaseEntity } from './entity';

export interface AbilityScores {
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
}

export interface MonsterAction {
  name: string;
  desc: string;
  attackBonus?: number;
  damageDice?: string;
  damageBonus?: number;
  damageType?: string;
}

export interface MonsterTrait {
  name: string;
  desc: string;
}

export interface MonsterLegendaryAction {
  name: string;
  desc: string;
  cost?: number;
}

export interface MonsterSpellcasting {
  level?: number;
  ability?: string;
  dc?: number;
  attackBonus?: number;
  spells: {
    level: string; // 'Cantrip', '1st', etc.
    slots?: number;
    spells: string[];
  }[];
}

export interface MonsterEntity extends BaseEntity {
  type: 'monster';
  size: 'Tiny' | 'Small' | 'Medium' | 'Large' | 'Huge' | 'Gargantuan';
  monsterType: string; // 'Dragon', 'Fiend', 'Humanoid', etc.
  subtype?: string;
  alignment: string;
  armorClass: number;
  armorDesc?: string;
  hitPoints: number;
  hitDice: string;
  speed: string; // e.g. "30 ft., fly 60 ft."
  abilities: AbilityScores;
  savingThrows?: string;
  skills?: string;
  vulnerabilities?: string;
  resistances?: string;
  immunities?: string;
  conditionImmunities?: string;
  senses?: string;
  languages?: string;
  challengeRating: string; // "1/4", "1/2", "1", "10", etc.
  experiencePoints: number;
  traits?: MonsterTrait[];
  actions?: MonsterAction[];
  bonusActions?: MonsterAction[];
  reactions?: MonsterAction[];
  legendaryActions?: MonsterLegendaryAction[];
  legendaryCount?: number;
  spellcasting?: MonsterSpellcasting;
  avatarUrl?: string;
  tokenUrl?: string;
  sensesConfig?: {
    normalSight: number;
    darkvision: number;
    blindsight: number;
    truesight: number;
    tremorsense: number;
  };
  environment?: string;
  isNpc?: boolean;
  campaignId?: string; // Associated Campaign ID or undefined for global/all
  npcRole?: string; // e.g. "Ally", "Villain", "Merchant", "Quest Giver", "Neutral", "Informant"
  location?: string; // e.g. "Village of Barovia"
  occupation?: string; // e.g. "Tavern Keeper", "High Priest"
}

