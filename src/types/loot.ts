import { ItemEntity } from './item';

export type LootDifficulty = 'easy' | 'medium' | 'hard' | 'deadly' | 'boss';

export type LootTier = 1 | 2 | 3 | 4; // Tier 1 (1-4), Tier 2 (5-10), Tier 3 (11-16), Tier 4 (17-20)

export interface GenericLootItem {
  name: string;
  category: string;
  type: string;
  theme: string;
  value: string;
  valueGp: number;
  weight: string;
  weightLbs: number;
  condition: string;
  rarity: string;
  description: string;
}

export interface GeneratedLootEntry {
  id: string;
  name: string;
  category: string; // e.g. 'Gemstone', 'Art Object', 'Magic Item', 'Temple Relic', 'Weapon', 'Trade Goods'
  type: string; // e.g. 'area loot', 'monster', 'boss', 'npc loot'
  theme?: string;
  value: string;
  valueGp: number;
  weight: string;
  weightLbs: number;
  quantity: number;
  condition?: string;
  rarity: string;
  description: string;
  isMagic?: boolean;
  itemRef?: ItemEntity;
}

export interface LootCoins {
  cp: number;
  sp: number;
  ep: number;
  gp: number;
  pp: number;
  totalGp: number;
}

export interface GeneratedLootResult {
  id: string;
  timestamp: string;
  parameters: {
    level: number;
    tier: LootTier;
    difficulty: LootDifficulty;
    theme: string;
    type: string;
    partySize: number;
    includeMagicItems: boolean;
    includeGeneralLoot: boolean;
    includeDbItems: boolean;
    currencyMultiplier: number;
  };
  coins: LootCoins;
  items: GeneratedLootEntry[];
  totalValueGp: number;
  totalWeightLbs: number;
  itemCount: number;
}
