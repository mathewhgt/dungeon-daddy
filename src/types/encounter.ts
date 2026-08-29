import { BaseEntity } from './entity';
import { Combatant } from './combat';

export type EncounterDifficulty = 'Trivial' | 'Easy' | 'Medium' | 'Hard' | 'Deadly';

export interface EncounterMonsterSlot {
  monsterId: string;
  count: number;
  customHp?: number;
  customAc?: number;
  customName?: string;
}

export interface EncounterEntity extends BaseEntity {
  type: 'encounter';
  campaignId?: string;
  location?: string;
  description?: string;
  partyPlayerIds: string[];
  monsters: EncounterMonsterSlot[];
  savedCombatants?: Combatant[]; // snapshot of combat state
  difficulty?: EncounterDifficulty;
  totalXp?: number;
  adjustedXp?: number;
  rewardItems?: string[];
  notes?: string;
}
