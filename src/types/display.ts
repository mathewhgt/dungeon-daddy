import { BattleMapEntity, MapToken, MapDrawing } from './map';
import { CombatState } from './combat';
import { CampaignNote } from './campaign';
import { MonsterEntity } from './monster';
import { RollBreakdown } from '../services/diceService';
import { CharacterCreationState } from './characterCreator';

export type DisplayMode = 'map' | 'combat' | 'media' | 'character-creator' | 'blackout';

export type MonsterHpVisibility = 'none' | 'bars' | 'numbers';

export interface DisplaySettings {
  mode: DisplayMode;
  monsterHpVisibility: MonsterHpVisibility;
  showGrid: boolean;
  followDmCamera: boolean;
  showSpellAnimations: boolean;
  showCombatTrackerOverlay: boolean;
  blackoutMessage: string;
  isBlackoutActive: boolean;
}

export interface ProjectedMedia {
  id: string;
  type: 'note' | 'monster' | 'player' | 'image' | 'spell' | 'item';
  title: string;
  subtitle?: string;
  imageUrl?: string;
  content?: string;
  badge?: string;
  badgeColor?: string;
}

export interface PlayerCameraState {
  panX: number;
  panY: number;
  zoom: number;
}

export interface PlayerDiceRoll extends RollBreakdown {
  label?: string;
  formula?: string;
  rollId?: string;
}

export interface PlayerCharacterCreationDisplayState {
  step: number;
  characterState: CharacterCreationState;
}

export interface PlayerDisplayState {
  activeMapId: string | null;
  activeMap: BattleMapEntity | null;
  camera: PlayerCameraState;
  combatState: CombatState;
  displaySettings: DisplaySettings;
  selectedTokenId: string | null;
  projectedMedia: ProjectedMedia | null;
  latestDiceRoll: PlayerDiceRoll | null;
  activePing?: { x: number; y: number; id: string; color?: string } | null;
  characterCreation?: PlayerCharacterCreationDisplayState | null;
  campaignInfo?: {
    name: string;
    currentLocation?: string;
    inGameDate?: string;
  };
}

export interface ConnectedDisplay {
  id: number;
  label: string;
  bounds: { x: number; y: number; width: number; height: number };
  isPrimary: boolean;
  scaleFactor: number;
}
