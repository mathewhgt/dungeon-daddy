import { RollTableEntity } from '../../types/rollTable';
import { GENERAL_LOOT_ROLL_TABLE } from './generalLootData';

export const SRD_ROLL_TABLES: RollTableEntity[] = [
  GENERAL_LOOT_ROLL_TABLE,
  {
    id: 'srd-table-tavern-rumors',
    type: 'rollTable',
    name: 'Tavern Rumors & Whispers',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    diceFormula: '1d6',
    description: 'Local rumors overheard by the hearth fire.',
    items: [
      { id: 't1', rangeMin: 1, rangeMax: 1, result: 'The blacksmith lost his daughter to a cult operating in the sewers.' },
      { id: 't2', rangeMin: 2, rangeMax: 2, result: 'Goblins near the old mill are unusually organized, led by a bugbear champion.' },
      { id: 't3', rangeMin: 3, rangeMax: 3, result: 'A glowing meteor fell into the whispering woods two nights ago.' },
      { id: 't4', rangeMin: 4, rangeMax: 4, result: 'The lord mayor hasn’t left his estate in over three weeks.' },
      { id: 't5', rangeMin: 5, rangeMax: 5, result: 'Merchant caravans traveling south are being raided by winged creatures.' },
      { id: 't6', rangeMin: 6, rangeMax: 6, result: 'An ancient vault beneath the cathedral has begun emitting a low hum.' },
    ],
  },
  {
    id: 'srd-table-dungeon-traps',
    type: 'rollTable',
    name: 'Random Dungeon Hazards',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    diceFormula: '1d4',
    description: 'Hazards and traps to challenge delving adventurers.',
    items: [
      { id: 'h1', rangeMin: 1, rangeMax: 1, result: 'Poison Dart Wall: DC 13 Dex save or 2d4 piercing + 2d6 poison damage.' },
      { id: 'h2', rangeMin: 2, rangeMax: 2, result: 'Collapsing Ceiling: DC 14 Dex save or 3d10 bludgeoning and pinned.' },
      { id: 'h3', rangeMin: 3, rangeMax: 3, result: 'Pit Trap (10 ft deep, spiked): DC 12 Dex save or 1d6 fall + 2d4 piercing.' },
      { id: 'h4', rangeMin: 4, rangeMax: 4, result: 'Glyph of Warding (Explosive): DC 14 Dex save or 5d8 thunder damage.' },
    ],
  },
];
