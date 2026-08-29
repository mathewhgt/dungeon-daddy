import { AbilityScores, MonsterAction, MonsterLegendaryAction, MonsterSpellcasting, MonsterTrait } from './monster';

export type ConditionType =
  | 'Blinded'
  | 'Charmed'
  | 'Deafened'
  | 'Frightened'
  | 'Grappled'
  | 'Incapacitated'
  | 'Invisible'
  | 'Paralyzed'
  | 'Petrified'
  | 'Poisoned'
  | 'Prone'
  | 'Restrained'
  | 'Stunned'
  | 'Unconscious'
  | 'Exhaustion'
  | 'Concentration'
  | 'Custom';

export interface ActiveCondition {
  id: string;
  name: ConditionType | string;
  durationRounds?: number; // decrement on start of turn
  appliedRound: number;
  color?: string;
  description?: string;
}

export interface Combatant {
  id: string; // unique instance ID in combat
  entityId?: string; // reference to Monster or Player entity
  name: string;
  isPlayer: boolean;
  avatarUrl?: string;
  tokenUrl?: string;
  initiative: number;
  tieBreaker: number; // usually dex mod
  maxHp: number;
  currentHp: number;
  tempHp: number;
  armorClass: number;
  speed: string;
  abilities: AbilityScores;
  passivePerception?: number;
  conditions: ActiveCondition[];
  concentratingOn?: { spellName: string; castRound?: number };
  color?: string; // token/badge color for duplicate monsters (e.g., Goblin 1 [Red], Goblin 2 [Blue])
  notes?: string;
  isSurprised?: boolean;
  isHidden?: boolean;
  defeated?: boolean;
  
  // Monster specific combat traits & actions
  actions?: MonsterAction[];
  bonusActions?: MonsterAction[];
  reactions?: MonsterAction[];
  legendaryActions?: MonsterLegendaryAction[];
  traits?: MonsterTrait[];
  spellcasting?: MonsterSpellcasting;
  legendaryActionsMax?: number;
  legendaryActionsUsed?: number;
  reactionUsed?: boolean;
  
  // VTT Map Token placeholder (future-proofed)
  token?: {
    x: number;
    y: number;
    size: number;
    elevation: number;
  };
}

export interface CombatLogEntry {
  id: string;
  timestamp: string;
  round: number;
  speaker: string;
  message: string;
  type: 'roll' | 'damage' | 'heal' | 'condition' | 'turn' | 'system';
  rollDetails?: {
    formula: string;
    total: number;
    breakdown: string;
    isCrit?: boolean;
    isFumble?: boolean;
  };
}

export interface CombatState {
  isActive: boolean;
  round: number;
  currentTurnIndex: number;
  combatants: Combatant[];
  log: CombatLogEntry[];
  startTime?: string;
}
