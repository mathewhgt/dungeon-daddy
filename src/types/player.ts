import { BaseEntity } from './entity';
import { AbilityScores } from './monster';

export interface SpellSlotTracker {
  level: number;
  total: number;
  used: number;
}

export interface PlayerEntity extends BaseEntity {
  type: 'player';
  playerName?: string;
  characterClass: string; // e.g. "Paladin 5 / Warlock 2"
  race: string;
  level: number;
  armorClass: number;
  maxHp: number;
  currentHp: number;
  tempHp: number;
  speed: string;
  initiativeBonus: number;
  abilities: AbilityScores;
  passivePerception: number;
  passiveInvestigation: number;
  passiveInsight: number;
  spellSaveDc?: number;
  spellSlots?: SpellSlotTracker[];
  deathSaves?: {
    successes: number;
    failures: number;
  };
  avatarUrl?: string;
  tokenUrl?: string;
  sensesConfig?: {
    normalSight: number;
    darkvision: number;
    blindsight: number;
    truesight: number;
    tremorsense: number;
  };
  notes?: string;
  campaignId?: string;
  // 2024 Character Details
  background?: string;
  species?: string;
  lineage?: string;
  originFeat?: string;
  feats?: string[];
  weaponMasteries?: string[];
  proficiencies?: {
    savingThrows?: string[];
    skills?: string[];
    weapons?: string[];
    armor?: string[];
    tools?: string[];
    languages?: string[];
  };
  spellsKnown?: string[];
  cantrips?: string[];
  alignment?: string;
  backstory?: string;
  personalityTraits?: string;
  ideals?: string;
  bonds?: string;
  flaws?: string;
  equippedArmor?: string;
  equippedShield?: boolean;
}
