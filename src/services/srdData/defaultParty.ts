import { PlayerEntity } from '../../types/player';
import { CampaignEntity } from '../../types/campaign';
import { EncounterEntity } from '../../types/encounter';

export const STARTER_PLAYERS: PlayerEntity[] = [
  {
    id: 'char-eldrin',
    type: 'player',
    name: 'Eldrin Valen',
    playerName: 'Sarah',
    characterClass: 'Paladin (Oath of Devotion)',
    race: 'Half-Elf',
    level: 3,
    armorClass: 18,
    maxHp: 28,
    currentHp: 28,
    tempHp: 0,
    speed: '30 ft.',
    initiativeBonus: 0,
    abilities: { str: 16, dex: 10, con: 14, int: 10, wis: 12, cha: 16 },
    passivePerception: 13,
    passiveInvestigation: 10,
    passiveInsight: 13,
    spellSaveDc: 13,
    spellSlots: [{ level: 1, total: 3, used: 0 }],
    notes: 'Wields longsword and kite shield. Devoted to Helm.',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'char-lyra',
    type: 'player',
    name: 'Lyra Shadowswift',
    playerName: 'David',
    characterClass: 'Rogue (Arcane Trickster)',
    race: 'Lightfoot Halfling',
    level: 3,
    armorClass: 15,
    maxHp: 21,
    currentHp: 21,
    tempHp: 0,
    speed: '25 ft.',
    initiativeBonus: 3,
    abilities: { str: 8, dex: 17, con: 12, int: 14, wis: 12, cha: 13 },
    passivePerception: 15,
    passiveInvestigation: 14,
    passiveInsight: 13,
    spellSaveDc: 12,
    spellSlots: [{ level: 1, total: 2, used: 0 }],
    notes: 'Dual-wields shortswords. Expert with lockpicks.',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'char-ignis',
    type: 'player',
    name: 'Ignis Emberborn',
    playerName: 'Mia',
    characterClass: 'Wizard (School of Evocation)',
    race: 'Tiefling',
    level: 3,
    armorClass: 12,
    maxHp: 18,
    currentHp: 18,
    tempHp: 0,
    speed: '30 ft.',
    initiativeBonus: 2,
    abilities: { str: 8, dex: 14, con: 13, int: 16, wis: 12, cha: 14 },
    passivePerception: 11,
    passiveInvestigation: 15,
    passiveInsight: 11,
    spellSaveDc: 13,
    spellSlots: [
      { level: 1, total: 4, used: 0 },
      { level: 2, total: 2, used: 0 },
    ],
    notes: 'Carries glowing crystal arcane focus staff.',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'char-borin',
    type: 'player',
    name: 'Borin Ironfist',
    playerName: 'Chris',
    characterClass: 'Cleric (Life Domain)',
    race: 'Hill Dwarf',
    level: 3,
    armorClass: 18,
    maxHp: 27,
    currentHp: 27,
    tempHp: 0,
    speed: '25 ft.',
    initiativeBonus: -1,
    abilities: { str: 14, dex: 8, con: 16, int: 10, wis: 16, cha: 12 },
    passivePerception: 15,
    passiveInvestigation: 10,
    passiveInsight: 15,
    spellSaveDc: 13,
    spellSlots: [
      { level: 1, total: 4, used: 0 },
      { level: 2, total: 2, used: 0 },
    ],
    notes: 'Channels the light of Moradin with a heavy warhammer.',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
];

export const STARTER_CAMPAIGN: CampaignEntity = {
  id: 'campaign-phandalin',
  name: 'Chronicles of Phandalin',
  type: 'encounter' as any,
  description: 'An introductory campaign uncovering the secrets of the Wave Echo Cave and the goblin bandits of Cragmaw.',
  playerCharacterIds: ['char-eldrin', 'char-lyra', 'char-ignis', 'char-borin'],
  currentLocation: 'Stonehill Inn, Phandalin',
  inGameDate: '15th of Flamerule, 1492 DR',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  notes: [
    {
      id: 'folder-act-1',
      type: 'campaignNote',
      campaignId: 'campaign-phandalin',
      name: 'Act I: The Goblin Arrows',
      category: 'Folder',
      isFolder: true,
      content: '',
      isPlayerVisible: false,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    },
    {
      id: 'note-triboar',
      type: 'campaignNote',
      campaignId: 'campaign-phandalin',
      parentId: 'folder-act-1',
      name: 'Session 1: Triboar Trail Ambush',
      category: 'Session',
      isFolder: false,
      content: `:::read-aloud
The rutted dirt trail rounds a steep stone bluff where two dead horses lie sprawled across the road, black-feathered arrows sticking from their swollen flanks. The woods press tight against either side.
:::

### Encounter Overview
Four @[Goblin](monster:srd-goblin) bandits lie in wait behind the thickets on high embankments.

:::dm-info
**Tactics:** Two goblins fire @[Shortbow](item:srd-item) arrows with advantage from stealth, while two charge with scimitars. If their numbers drop to one, the survivor flees towards the Cragmaw hideout.
:::

#### Loot on the Scene
| Item | Quantity | Details |
| --- | --- | --- |
| @[Potion of Healing](item:srd-potion-of-healing) | 1 | Stashed in saddlebags |
| Copper Pieces | 24 cp | Pockets of the goblins |
| Letter from Gundren | 1 | Player handout |

:::secrets
**Secret Clue:** Gundren Rockseeker and his escort Sildar Hallwinter were taken captive and dragged to the Cragmaw Cave!
:::`,
      isPlayerVisible: true,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    },
    {
      id: 'folder-lore',
      type: 'campaignNote',
      campaignId: 'campaign-phandalin',
      name: 'World Lore & Quests',
      category: 'Folder',
      isFolder: true,
      content: '',
      isPlayerVisible: false,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    },
    {
      id: 'note-black-spider',
      type: 'campaignNote',
      campaignId: 'campaign-phandalin',
      parentId: 'folder-lore',
      name: 'Rumor: The Black Spider',
      category: 'Lore',
      isFolder: false,
      content: `:::read-aloud
"There be whispers in the dark of Phandalin... A shadow known only as the Black Spider pulls the strings of every bandit in these hills."
:::

### Known Details
A sinister drow mage is directing the Cragmaw goblins to seize all maps leading to Wave Echo Cave.

:::dm-info
The Black Spider can cast spells such as @[Shield](spell:srd-shield) and @[Magic Missile](spell:srd-magic-missile).
:::`,
      isPlayerVisible: false,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    },
  ],
};

export const STARTER_ENCOUNTERS: EncounterEntity[] = [
  {
    id: 'enc-cragmaw-ambush',
    type: 'encounter',
    name: 'Cragmaw Goblin Ambush',
    campaignId: 'campaign-phandalin',
    location: 'Triboar Trail',
    description: 'Four goblins emerge from the thickets on both sides of the sunken trail.',
    partyPlayerIds: ['char-eldrin', 'char-lyra', 'char-ignis', 'char-borin'],
    monsters: [
      { monsterId: 'srd-goblin', count: 4 },
    ],
    difficulty: 'Medium',
    totalXp: 200,
    adjustedXp: 400,
    notes: 'Two goblins shoot from high trees with advantage on stealth.',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'enc-bugbear-lair',
    type: 'encounter',
    name: 'Klarg the Bugbear Chief',
    campaignId: 'campaign-phandalin',
    location: 'Cragmaw Hideout - Chief Cave',
    description: 'Klarg the bugbear and his wolf companion defend their treasure hoard.',
    partyPlayerIds: ['char-eldrin', 'char-lyra', 'char-ignis', 'char-borin'],
    monsters: [
      { monsterId: 'srd-bugbear', count: 1 },
      { monsterId: 'srd-goblin', count: 2 },
    ],
    difficulty: 'Hard',
    totalXp: 300,
    adjustedXp: 600,
    notes: 'Klarg tries to push the chimney stalactites down if cornered.',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
];
