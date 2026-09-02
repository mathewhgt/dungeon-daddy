import Papa from 'papaparse';
import { EntityType, SchemaField, TemplateDefinition, BaseEntity } from '../types/entity';
import { MonsterEntity } from '../types/monster';
import { SpellEntity } from '../types/spell';
import { ItemEntity } from '../types/item';
import { PlayerEntity } from '../types/player';
import { RollTableEntity } from '../types/rollTable';

export const DEFAULT_TEMPLATES: Record<EntityType, TemplateDefinition> = {
  monster: {
    type: 'monster',
    displayName: 'Monsters & NPCs',
    description: 'Stat blocks for creatures, bosses, and non-player characters',
    primaryKey: 'id',
    titleKey: 'name',
    subtitleKey: 'monsterType',
    badgeKey: 'challengeRating',
    csvHeaders: [
      'name', 'size', 'monsterType', 'alignment', 'armorClass', 'armorDesc',
      'hitPoints', 'hitDice', 'speed', 'str', 'dex', 'con', 'int', 'wis', 'cha',
      'savingThrows', 'skills', 'vulnerabilities', 'resistances', 'immunities',
      'conditionImmunities', 'senses', 'languages', 'challengeRating', 'experiencePoints',
      'traits', 'actions', 'bonusActions', 'reactions', 'legendaryActions', 'environment',
      'avatarUrl', 'tokenUrl'
    ],
    fields: [
      { key: 'name', label: 'Creature Name', type: 'string', required: true, exampleValue: 'Goblin' },
      { key: 'size', label: 'Size', type: 'enum', options: ['Tiny', 'Small', 'Medium', 'Large', 'Huge', 'Gargantuan'], required: true, exampleValue: 'Small' },
      { key: 'monsterType', label: 'Creature Type', type: 'string', required: true, exampleValue: 'Humanoid (goblinoid)' },
      { key: 'alignment', label: 'Alignment', type: 'string', defaultValue: 'neutral evil', exampleValue: 'neutral evil' },
      { key: 'armorClass', label: 'Armor Class (AC)', type: 'number', required: true, defaultValue: 10, exampleValue: '15' },
      { key: 'armorDesc', label: 'Armor Description', type: 'string', exampleValue: 'leather armor, shield' },
      { key: 'hitPoints', label: 'Hit Points (HP)', type: 'number', required: true, defaultValue: 10, exampleValue: '7' },
      { key: 'hitDice', label: 'Hit Dice formula', type: 'string', defaultValue: '2d6', exampleValue: '2d6' },
      { key: 'speed', label: 'Speed', type: 'string', defaultValue: '30 ft.', exampleValue: '30 ft.' },
      { key: 'str', label: 'Strength', type: 'number', defaultValue: 10, exampleValue: '8' },
      { key: 'dex', label: 'Dexterity', type: 'number', defaultValue: 10, exampleValue: '14' },
      { key: 'con', label: 'Constitution', type: 'number', defaultValue: 10, exampleValue: '10' },
      { key: 'int', label: 'Intelligence', type: 'number', defaultValue: 10, exampleValue: '10' },
      { key: 'wis', label: 'Wisdom', type: 'number', defaultValue: 10, exampleValue: '8' },
      { key: 'cha', label: 'Charisma', type: 'number', defaultValue: 10, exampleValue: '8' },
      { key: 'savingThrows', label: 'Saving Throws', type: 'string', exampleValue: 'Dex +4' },
      { key: 'skills', label: 'Skills', type: 'string', exampleValue: 'Stealth +6' },
      { key: 'vulnerabilities', label: 'Damage Vulnerabilities', type: 'string' },
      { key: 'resistances', label: 'Damage Resistances', type: 'string' },
      { key: 'immunities', label: 'Damage Immunities', type: 'string' },
      { key: 'conditionImmunities', label: 'Condition Immunities', type: 'string' },
      { key: 'senses', label: 'Senses', type: 'string', exampleValue: 'darkvision 60 ft., passive Perception 9' },
      { key: 'languages', label: 'Languages', type: 'string', exampleValue: 'Common, Goblin' },
      { key: 'challengeRating', label: 'Challenge Rating (CR)', type: 'string', required: true, defaultValue: '1/4', exampleValue: '1/4' },
      { key: 'experiencePoints', label: 'Experience (XP)', type: 'number', defaultValue: 50, exampleValue: '50' },
      { key: 'traits', label: 'Traits (JSON / Pipe separated)', type: 'text', exampleValue: 'Nimble Escape: The goblin can take the Disengage or Hide action as a bonus action on each of its turns.' },
      { key: 'actions', label: 'Actions (JSON / Pipe separated)', type: 'text', exampleValue: 'Scimitar: Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 5 (1d6 + 2) slashing damage. | Shortbow: Ranged Weapon Attack: +4 to hit, range 80/320 ft., one target. Hit: 5 (1d6 + 2) piercing damage.' },
      { key: 'bonusActions', label: 'Bonus Actions', type: 'text' },
      { key: 'reactions', label: 'Reactions', type: 'text' },
      { key: 'legendaryActions', label: 'Legendary Actions', type: 'text' },
      { key: 'environment', label: 'Environment', type: 'string', exampleValue: 'Forest, Grassland, Underground' },
      { key: 'isNpc', label: 'Is NPC / Story Character', type: 'boolean', defaultValue: false },
      { key: 'campaignId', label: 'Associated Campaign ID', type: 'string' },
      { key: 'npcRole', label: 'NPC Role / Disposition', type: 'string', exampleValue: 'Ally, Merchant, Villain, Quest Giver' },
      { key: 'location', label: 'NPC Location', type: 'string', exampleValue: 'Waterdeep - Yawning Portal' },
      { key: 'occupation', label: 'Occupation / Title', type: 'string', exampleValue: 'Tavern Keeper, Captain of Guard' },
      { key: 'avatarUrl', label: 'Artwork Portrait Image (URL or Base64)', type: 'string', exampleValue: 'https://example.com/goblin.png' },
      { key: 'tokenUrl', label: 'VTT Map Token Image (URL or Base64)', type: 'string', exampleValue: 'https://example.com/goblin_token.png' },
    ],
  },
  spell: {
    type: 'spell',
    displayName: 'Spells',
    description: 'Magic spells, cantrips, rituals, and incantations',
    primaryKey: 'id',
    titleKey: 'name',
    subtitleKey: 'school',
    badgeKey: 'level',
    csvHeaders: [
      'name', 'level', 'school', 'element', 'shape', 'aoeSize', 'castingTime', 'range', 'verbal', 'somatic', 'material', 'materialCost',
      'duration', 'concentration', 'ritual', 'classes', 'description', 'higherLevels', 'imageUrl'
    ],
    fields: [
      { key: 'name', label: 'Spell Name', type: 'string', required: true, exampleValue: 'Fireball' },
      { key: 'level', label: 'Spell Level (0=Cantrip, 1-9)', type: 'number', required: true, defaultValue: 1, exampleValue: '3' },
      { key: 'school', label: 'School', type: 'enum', options: ['Abjuration', 'Conjuration', 'Divination', 'Enchantment', 'Evocation', 'Illusion', 'Necromancy', 'Transmutation'], required: true, exampleValue: 'Evocation' },
      { key: 'element', label: 'Element / Energy Type', type: 'enum', options: ['none', 'fire', 'cold', 'lightning', 'thunder', 'acid', 'poison', 'radiant', 'necrotic', 'force', 'psychic'], defaultValue: 'none', exampleValue: 'fire' },
      { key: 'shape', label: 'AOE Shape', type: 'enum', options: ['none', 'sphere', 'cone', 'line', 'cube', 'cylinder'], defaultValue: 'none', exampleValue: 'sphere' },
      { key: 'aoeSize', label: 'AOE Size (feet)', type: 'number', defaultValue: 20, exampleValue: '20' },
      { key: 'castingTime', label: 'Casting Time', type: 'string', required: true, defaultValue: '1 action', exampleValue: '1 action' },
      { key: 'range', label: 'Range', type: 'string', required: true, defaultValue: '60 feet', exampleValue: '150 feet' },
      { key: 'verbal', label: 'Verbal (V)', type: 'boolean', defaultValue: true, exampleValue: 'true' },
      { key: 'somatic', label: 'Somatic (S)', type: 'boolean', defaultValue: true, exampleValue: 'true' },
      { key: 'material', label: 'Material (M)', type: 'boolean', defaultValue: false, exampleValue: 'true' },
      { key: 'materialCost', label: 'Material Component Details', type: 'string', exampleValue: 'A tiny ball of bat guano and sulfur' },
      { key: 'duration', label: 'Duration', type: 'string', required: true, defaultValue: 'Instantaneous', exampleValue: 'Instantaneous' },
      { key: 'concentration', label: 'Requires Concentration', type: 'boolean', defaultValue: false, exampleValue: 'false' },
      { key: 'ritual', label: 'Ritual Castable', type: 'boolean', defaultValue: false, exampleValue: 'false' },
      { key: 'classes', label: 'Classes (comma-separated)', type: 'string', exampleValue: 'Sorcerer, Wizard' },
      { key: 'description', label: 'Description', type: 'text', required: true, exampleValue: 'A bright streak flashes from your pointing finger to a point you choose within range and then blossoms with a low roar into an explosion of flame.' },
      { key: 'higherLevels', label: 'At Higher Levels', type: 'text', exampleValue: 'When you cast this spell using a spell slot of 4th level or higher, the damage increases by 1d8 for each slot level above 3rd.' },
      { key: 'imageUrl', label: 'Spell Artwork (URL or Base64)', type: 'string', exampleValue: 'https://example.com/fireball.png' },
    ],
  },
  item: {
    type: 'item',
    displayName: 'Items & Equipment',
    description: 'Weapons, armor, magic items, potions, and adventuring gear',
    primaryKey: 'id',
    titleKey: 'name',
    subtitleKey: 'itemType',
    badgeKey: 'rarity',
    csvHeaders: [
      'name', 'itemType', 'rarity', 'attunement', 'attunementRequirement',
      'value', 'weight', 'damage', 'armorClassBonus', 'properties', 'description', 'imageUrl'
    ],
    fields: [
      { key: 'name', label: 'Item Name', type: 'string', required: true, exampleValue: 'Flame Tongue Longsword' },
      { key: 'itemType', label: 'Item Type', type: 'enum', options: ['Weapon', 'Armor', 'Wondrous Item', 'Potion', 'Scroll', 'Ring', 'Rod', 'Staff', 'Wand', 'Adventuring Gear'], required: true, exampleValue: 'Weapon' },
      { key: 'rarity', label: 'Rarity', type: 'enum', options: ['Common', 'Uncommon', 'Rare', 'Very Rare', 'Legendary', 'Artifact', 'Mundane'], required: true, exampleValue: 'Rare' },
      { key: 'attunement', label: 'Requires Attunement', type: 'boolean', defaultValue: false, exampleValue: 'true' },
      { key: 'attunementRequirement', label: 'Attunement Requirement', type: 'string', exampleValue: 'requires attunement' },
      { key: 'value', label: 'Cost / Value', type: 'string', exampleValue: '5000 gp' },
      { key: 'weight', label: 'Weight', type: 'string', exampleValue: '3 lbs.' },
      { key: 'damage', label: 'Damage / Stats', type: 'string', exampleValue: '1d8 slashing + 2d6 fire' },
      { key: 'armorClassBonus', label: 'AC Bonus', type: 'number', defaultValue: 0, exampleValue: '0' },
      { key: 'properties', label: 'Properties (comma-separated)', type: 'string', exampleValue: 'Versatile (1d10)' },
      { key: 'description', label: 'Description', type: 'text', required: true, exampleValue: 'You can use a bonus action to speak this magic swords command word, causing flames to erupt from the blade.' },
      { key: 'imageUrl', label: 'Item Icon / Artwork (URL or Base64)', type: 'string', exampleValue: 'https://example.com/sword.png' },
    ],
  },
  player: {
    type: 'player',
    displayName: 'Player Characters',
    description: 'Party members and player hero characters',
    primaryKey: 'id',
    titleKey: 'name',
    subtitleKey: 'characterClass',
    badgeKey: 'level',
    csvHeaders: [
      'name', 'playerName', 'characterClass', 'race', 'level', 'armorClass',
      'maxHp', 'currentHp', 'tempHp', 'speed', 'initiativeBonus',
      'str', 'dex', 'con', 'int', 'wis', 'cha',
      'passivePerception', 'passiveInvestigation', 'passiveInsight',
      'normalSight', 'darkvision', 'blindsight', 'truesight', 'tremorsense',
      'notes', 'avatarUrl', 'tokenUrl'
    ],
    fields: [
      { key: 'name', label: 'Character Name', type: 'string', required: true, exampleValue: 'Thorin Stonehelm' },
      { key: 'playerName', label: 'Player Name', type: 'string', exampleValue: 'Alex' },
      { key: 'characterClass', label: 'Class & Subclass', type: 'string', required: true, exampleValue: 'Fighter (Battle Master)' },
      { key: 'race', label: 'Race / Ancestry', type: 'string', required: true, exampleValue: 'Mountain Dwarf' },
      { key: 'level', label: 'Level', type: 'number', required: true, defaultValue: 1, exampleValue: '5' },
      { key: 'armorClass', label: 'Armor Class (AC)', type: 'number', required: true, defaultValue: 10, exampleValue: '18' },
      { key: 'maxHp', label: 'Max Hit Points', type: 'number', required: true, defaultValue: 10, exampleValue: '49' },
      { key: 'currentHp', label: 'Current HP', type: 'number', defaultValue: 10, exampleValue: '49' },
      { key: 'tempHp', label: 'Temporary HP', type: 'number', defaultValue: 0, exampleValue: '0' },
      { key: 'speed', label: 'Speed', type: 'string', defaultValue: '25 ft.', exampleValue: '25 ft.' },
      { key: 'initiativeBonus', label: 'Initiative Bonus', type: 'number', defaultValue: 0, exampleValue: '1' },
      { key: 'str', label: 'Strength', type: 'number', defaultValue: 10, exampleValue: '18' },
      { key: 'dex', label: 'Dexterity', type: 'number', defaultValue: 10, exampleValue: '12' },
      { key: 'con', label: 'Constitution', type: 'number', defaultValue: 10, exampleValue: '16' },
      { key: 'int', label: 'Intelligence', type: 'number', defaultValue: 10, exampleValue: '10' },
      { key: 'wis', label: 'Wisdom', type: 'number', defaultValue: 10, exampleValue: '13' },
      { key: 'cha', label: 'Charisma', type: 'number', defaultValue: 10, exampleValue: '8' },
      { key: 'passivePerception', label: 'Passive Perception', type: 'number', defaultValue: 10, exampleValue: '14' },
      { key: 'passiveInvestigation', label: 'Passive Investigation', type: 'number', defaultValue: 10, exampleValue: '10' },
      { key: 'passiveInsight', label: 'Passive Insight', type: 'number', defaultValue: 10, exampleValue: '11' },
      { key: 'normalSight', label: 'Normal Sight (feet)', type: 'number', defaultValue: 60, exampleValue: '60' },
      { key: 'darkvision', label: 'Darkvision Range (feet)', type: 'number', defaultValue: 0, exampleValue: '60' },
      { key: 'blindsight', label: 'Blindsight Range (feet)', type: 'number', defaultValue: 0, exampleValue: '30' },
      { key: 'truesight', label: 'Truesight Range (feet)', type: 'number', defaultValue: 0, exampleValue: '60' },
      { key: 'tremorsense', label: 'Tremorsense Range (feet)', type: 'number', defaultValue: 0, exampleValue: '30' },
      { key: 'notes', label: 'Notes / Inventory', type: 'text', exampleValue: 'Carries ancestral warhammer and shield.' },
      { key: 'avatarUrl', label: 'Character Portrait (URL or Base64)', type: 'string', exampleValue: 'https://example.com/portrait.png' },
      { key: 'tokenUrl', label: 'VTT Map Token (URL or Base64)', type: 'string', exampleValue: 'https://example.com/token.png' },
    ],
  },
  rollTable: {
    type: 'rollTable',
    displayName: 'Roll Tables',
    description: 'Random generators, loot tables, and encounter tables',
    primaryKey: 'id',
    titleKey: 'name',
    subtitleKey: 'diceFormula',
    csvHeaders: ['name', 'diceFormula', 'description', 'items'],
    fields: [
      { key: 'name', label: 'Table Name', type: 'string', required: true, exampleValue: 'Tavern Rumors' },
      { key: 'diceFormula', label: 'Dice Formula', type: 'string', required: true, defaultValue: '1d6', exampleValue: '1d6' },
      { key: 'description', label: 'Description', type: 'string', exampleValue: 'Whispers heard around the hearth.' },
      { key: 'items', label: 'Table Rows (Format: "1: Result | 2-3: Result | ...")', type: 'text', required: true, exampleValue: '1: A ghost haunts the local mill | 2-3: The mayor has a dark secret | 4-5: Goblins were seen near the old crypt | 6: A dragon flew overhead last night' },
    ],
  },
  encounter: {
    type: 'encounter',
    displayName: 'Encounters',
    description: 'Combat encounters and monster groupings',
    primaryKey: 'id',
    titleKey: 'name',
    subtitleKey: 'location',
    badgeKey: 'difficulty',
    csvHeaders: ['name', 'location', 'description', 'monsters', 'partyPlayerIds', 'notes'],
    fields: [
      { key: 'name', label: 'Encounter Name', type: 'string', required: true, exampleValue: 'Goblin Ambush at the Bridge' },
      { key: 'location', label: 'Location', type: 'string', exampleValue: 'Old Stone Bridge' },
      { key: 'description', label: 'Description', type: 'text', exampleValue: 'Three goblins hide in the trees while two block the road.' },
      { key: 'monsters', label: 'Monsters (Format: "Goblin x4 | Bugbear x1")', type: 'string', required: true, exampleValue: 'Goblin x4 | Bugbear x1' },
      { key: 'notes', label: 'Tactics & Notes', type: 'text', exampleValue: 'Goblins will flee if the Bugbear falls.' },
    ],
  },
  campaignNote: {
    type: 'campaignNote',
    displayName: 'Campaign Notes',
    description: 'Hierarchical folders, adventure notes, session logs, and player handouts',
    primaryKey: 'id',
    titleKey: 'name',
    subtitleKey: 'category',
    csvHeaders: ['name', 'category', 'parent', 'campaign', 'isFolder', 'content', 'isPlayerVisible', 'imageUrl', 'tags'],
    fields: [
      { key: 'name', label: 'Note or Folder Title', type: 'string', required: true, exampleValue: 'Chapter 1: The Goblin Ambush' },
      { key: 'category', label: 'Category', type: 'enum', options: ['Session', 'Lore', 'NPC', 'Location', 'Quest', 'Handout', 'Image', 'Map', 'Folder'], required: true, defaultValue: 'Lore', exampleValue: 'Location' },
      { key: 'parent', label: 'Parent Note or Folder (Name or ID)', type: 'string', exampleValue: 'Acts of Valor' },
      { key: 'campaign', label: 'Campaign (Name or ID)', type: 'string', exampleValue: 'Lost Mine of Phandelver' },
      { key: 'isFolder', label: 'Is Folder / Container', type: 'boolean', defaultValue: false, exampleValue: 'false' },
      { key: 'content', label: 'Content (Markdown)', type: 'text', defaultValue: '', exampleValue: '# The Ambush\nTwo dead horses block the trail...' },
      { key: 'isPlayerVisible', label: 'Player Visible (Handout)', type: 'boolean', defaultValue: false, exampleValue: 'false' },
      { key: 'imageUrl', label: 'Artwork / Map Image (URL or Base64)', type: 'string', exampleValue: 'https://example.com/phandelver_map.png' },
      { key: 'tags', label: 'Tags (comma-separated)', type: 'string', exampleValue: 'goblin, chapter1, quest' },
    ],
  },
  campaign: {
    type: 'campaign',
    displayName: 'Campaigns',
    description: 'Campaign storylines, worlds, and adventure modules',
    primaryKey: 'id',
    titleKey: 'name',
    subtitleKey: 'description',
    csvHeaders: ['name', 'description', 'currentLocation', 'inGameDate'],
    fields: [
      { key: 'name', label: 'Campaign Title', type: 'string', required: true, exampleValue: 'Curse of Strahd' },
      { key: 'description', label: 'Description', type: 'text', exampleValue: 'Gothic horror adventure in the mist-shrouded valley of Barovia.' },
      { key: 'currentLocation', label: 'Current Location', type: 'string', exampleValue: 'Village of Barovia' },
      { key: 'inGameDate', label: 'In-Game Date', type: 'string', exampleValue: '1492 DR, 15th of Flamerule' },
    ],
  },
  feat: {
    type: 'feat',
    displayName: 'Feats & Features',
    description: 'Character feats, racial traits, and special abilities',
    primaryKey: 'id',
    titleKey: 'name',
    subtitleKey: 'source',
    csvHeaders: ['name', 'prerequisite', 'description', 'source'],
    fields: [
      { key: 'name', label: 'Feat Name', type: 'string', required: true, exampleValue: 'Alert' },
      { key: 'prerequisite', label: 'Prerequisite', type: 'string', exampleValue: 'None' },
      { key: 'description', label: 'Description', type: 'text', required: true, exampleValue: '+5 bonus to initiative, cant be surprised while conscious...' },
      { key: 'source', label: 'Source', type: 'string', exampleValue: 'SRD 5.1' },
    ],
  },
  map: {
    type: 'map',
    displayName: 'Battle Maps',
    description: '2D Virtual Tabletop tactical battle maps with dynamic Line of Sight',
    primaryKey: 'id',
    titleKey: 'name',
    subtitleKey: 'description',
    csvHeaders: ['name', 'description', 'imageUrl', 'width', 'height'],
    fields: [
      { key: 'name', label: 'Map Title', type: 'string', required: true, exampleValue: 'Cragmaw Hideout Lair' },
      { key: 'description', label: 'Description', type: 'text', exampleValue: 'A damp cavern with stone stalactites.' },
      { key: 'imageUrl', label: 'Map Image (URL or Base64)', type: 'string', exampleValue: 'https://example.com/map.jpg' },
      { key: 'width', label: 'Width (px)', type: 'number', defaultValue: 1400, exampleValue: '1400' },
      { key: 'height', label: 'Height (px)', type: 'number', defaultValue: 1000, exampleValue: '1000' },
    ],
  },
};

/**
 * Automatically inspects CSV content headers to detect the most appropriate EntityType
 */
export function detectEntityTypeFromCsv(csvContent: string): { detectedType: EntityType; confidence: number; reason: string } | null {
  if (!csvContent || !csvContent.trim()) return null;

  try {
    const parsed = Papa.parse<Record<string, string>>(csvContent, { preview: 3, header: true });
    if (!parsed.meta.fields || parsed.meta.fields.length === 0) return null;

    const headers = parsed.meta.fields.map((h) => h.trim().toLowerCase().replace(/[^a-z0-9]/g, ''));

    // Item indicators
    const itemSignals = ['itemtype', 'rarity', 'attunement', 'cost', 'value', 'weight', 'properties', 'armorclassbonus', 'magical'];
    const itemMatches = itemSignals.filter((s) => headers.includes(s));

    // Spell indicators
    const spellSignals = ['school', 'castingtime', 'duration', 'concentration', 'ritual', 'higherlevels', 'element', 'verbal', 'somatic', 'material'];
    const spellMatches = spellSignals.filter((s) => headers.includes(s));

    // Monster indicators
    const monsterSignals = ['monstertype', 'challengerating', 'cr', 'hitdice', 'armordesc', 'legendaryactions', 'traits', 'actions', 'speed'];
    const monsterMatches = monsterSignals.filter((s) => headers.includes(s));

    // Player indicators
    const playerSignals = ['playername', 'characterclass', 'race', 'initiativebonus', 'passiveperception'];
    const playerMatches = playerSignals.filter((s) => headers.includes(s));

    // RollTable indicators
    const tableSignals = ['diceformula', 'rangemin', 'rangemax', 'rolltable'];
    const tableMatches = tableSignals.filter((s) => headers.includes(s));

    // Campaign Note indicators
    const noteSignals = ['content', 'isplayervisible', 'parent', 'parentfolder', 'parentnote', 'category', 'isfolder', 'campaignnote', 'notename'];
    const noteMatches = noteSignals.filter((s) => headers.includes(s));

    const scores: { type: EntityType; count: number; matches: string[] }[] = [
      { type: 'item', count: itemMatches.length, matches: itemMatches },
      { type: 'spell', count: spellMatches.length, matches: spellMatches },
      { type: 'monster', count: monsterMatches.length, matches: monsterMatches },
      { type: 'player', count: playerMatches.length, matches: playerMatches },
      { type: 'rollTable', count: tableMatches.length, matches: tableMatches },
      { type: 'campaignNote', count: noteMatches.length, matches: noteMatches },
    ];

    scores.sort((a, b) => b.count - a.count);
    const top = scores[0];

    if (top.count >= 2 || (top.count === 1 && top.type === 'item' && headers.includes('rarity'))) {
      return {
        detectedType: top.type,
        confidence: Math.min(100, top.count * 25),
        reason: `Matched headers: ${top.matches.join(', ')}`,
      };
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Generates a downloadable CSV Template file string with header definitions and a sample row
 */
export function generateCsvTemplate(template: TemplateDefinition): string {
  const headers = template.csvHeaders;
  const sampleRow: Record<string, string> = {};

  for (const field of template.fields) {
    if (headers.includes(field.key)) {
      sampleRow[field.key] = field.exampleValue || '';
    }
  }

  return Papa.unparse({
    fields: headers,
    data: [sampleRow],
  });
}

/**
 * Exports entities to CSV format
 */
export function exportEntitiesToCsv<T extends BaseEntity>(
  entities: T[],
  template: TemplateDefinition
): string {
  const flatData = entities.map((entity) => {
    const row: Record<string, any> = {};
    for (const field of template.fields) {
      const val = (entity as any)[field.key];
      if (val === undefined || val === null) {
        row[field.key] = '';
      } else if (typeof val === 'object') {
        if (Array.isArray(val)) {
          // If array of strings, join with comma
          if (val.length === 0) row[field.key] = '';
          else if (typeof val[0] === 'string') row[field.key] = val.join(', ');
          else row[field.key] = JSON.stringify(val);
        } else {
          row[field.key] = JSON.stringify(val);
        }
      } else {
        row[field.key] = val;
      }
    }
    return row;
  });

  return Papa.unparse({
    fields: template.csvHeaders,
    data: flatData,
  });
}

/**
 * Parses pipe or newline separated text into Monster Trait/Action objects
 */
function parseTraitsOrActions(text: string): { name: string; desc: string }[] {
  if (!text) return [];
  if (text.startsWith('[') && text.endsWith(']')) {
    try {
      return JSON.parse(text);
    } catch {
      // fallback
    }
  }

  // Split by pipe '|' or double newline
  const parts = text.split(/\||\n\n/).map((p) => p.trim()).filter(Boolean);
  return parts.map((part) => {
    const colonIdx = part.indexOf(':');
    if (colonIdx > 0) {
      return {
        name: part.substring(0, colonIdx).trim(),
        desc: part.substring(colonIdx + 1).trim(),
      };
    }
    return { name: 'Action', desc: part };
  });
}

/**
 * Parses table rows string into RollTable items
 */
function parseTableRows(text: string): { id: string; rangeMin: number; rangeMax: number; result: string }[] {
  if (!text) return [];
  if (text.startsWith('[') && text.endsWith(']')) {
    try {
      return JSON.parse(text);
    } catch {
      // fallback
    }
  }

  const lines = text.split(/\||\n/).map((l) => l.trim()).filter(Boolean);
  return lines.map((line, idx) => {
    const colonIdx = line.indexOf(':');
    if (colonIdx > 0) {
      const rangeStr = line.substring(0, colonIdx).trim();
      const result = line.substring(colonIdx + 1).trim();
      const dashIdx = rangeStr.indexOf('-');
      if (dashIdx > 0) {
        const min = parseInt(rangeStr.substring(0, dashIdx), 10) || idx + 1;
        const max = parseInt(rangeStr.substring(dashIdx + 1), 10) || min;
        return { id: `item-${idx + 1}`, rangeMin: min, rangeMax: max, result };
      }
      const val = parseInt(rangeStr, 10) || idx + 1;
      return { id: `item-${idx + 1}`, rangeMin: val, rangeMax: val, result };
    }
    return { id: `item-${idx + 1}`, rangeMin: idx + 1, rangeMax: idx + 1, result: line };
  });
}

/**
 * Bulk imports CSV text and converts to structured entities according to Template
 */
export function importCsvToEntities(
  csvContent: string,
  type: EntityType,
  existingEntities: BaseEntity[]
): {
  success: boolean;
  importedEntities: BaseEntity[];
  errors: string[];
  warnings: string[];
} {
  const template = DEFAULT_TEMPLATES[type];
  const parsed = Papa.parse<Record<string, string>>(csvContent, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });

  if (parsed.errors.length > 0) {
    return {
      success: false,
      importedEntities: [],
      errors: parsed.errors.map((e) => `Row ${e.row}: ${e.message}`),
      warnings: [],
    };
  }

  const importedEntities: BaseEntity[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];

  parsed.data.forEach((row, index) => {
    const rowIndex = index + 1;
    const name = row.name || row.Name || row.title || row.Title;

    if (!name) {
      warnings.push(`Row ${rowIndex} skipped: Missing required 'name' field.`);
      return;
    }

    const now = new Date().toISOString();
    const id = `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    if (type === 'monster') {
      const monster: MonsterEntity = {
        id,
        type: 'monster',
        name,
        createdAt: now,
        updatedAt: now,
        size: (row.size as any) || 'Medium',
        monsterType: row.monsterType || row.type || 'Humanoid',
        alignment: row.alignment || 'unaligned',
        armorClass: parseInt(row.armorClass || '10', 10),
        armorDesc: row.armorDesc || undefined,
        hitPoints: parseInt(row.hitPoints || '10', 10),
        hitDice: row.hitDice || '2d8',
        speed: row.speed || '30 ft.',
        abilities: {
          str: parseInt(row.str || row.Str || '10', 10),
          dex: parseInt(row.dex || row.Dex || '10', 10),
          con: parseInt(row.con || row.Con || '10', 10),
          int: parseInt(row.int || row.Int || '10', 10),
          wis: parseInt(row.wis || row.Wis || '10', 10),
          cha: parseInt(row.cha || row.Cha || '10', 10),
        },
        savingThrows: row.savingThrows,
        skills: row.skills,
        vulnerabilities: row.vulnerabilities,
        resistances: row.resistances,
        immunities: row.immunities,
        conditionImmunities: row.conditionImmunities,
        senses: row.senses,
        languages: row.languages,
        challengeRating: row.challengeRating || row.cr || '1',
        experiencePoints: parseInt(row.experiencePoints || row.xp || '200', 10),
        traits: parseTraitsOrActions(row.traits || ''),
        actions: parseTraitsOrActions(row.actions || ''),
        bonusActions: parseTraitsOrActions(row.bonusActions || ''),
        reactions: parseTraitsOrActions(row.reactions || ''),
        legendaryActions: parseTraitsOrActions(row.legendaryActions || ''),
        environment: row.environment,
        avatarUrl: row.avatarUrl || row.imageUrl || undefined,
        tokenUrl: row.tokenUrl || undefined,
      };
      importedEntities.push(monster);
    } else if (type === 'spell') {
      const spell: SpellEntity = {
        id,
        type: 'spell',
        name,
        createdAt: now,
        updatedAt: now,
        level: parseInt(row.level || '0', 10),
        school: (row.school as any) || 'Evocation',
        castingTime: row.castingTime || '1 action',
        range: row.range || '60 feet',
        components: {
          verbal: row.verbal ? row.verbal.toLowerCase() === 'true' : true,
          somatic: row.somatic ? row.somatic.toLowerCase() === 'true' : true,
          material: row.material ? row.material.toLowerCase() === 'true' : false,
          materialCost: row.materialCost || undefined,
        },
        duration: row.duration || 'Instantaneous',
        concentration: row.concentration ? row.concentration.toLowerCase() === 'true' : false,
        ritual: row.ritual ? row.ritual.toLowerCase() === 'true' : false,
        classes: row.classes ? row.classes.split(',').map((c) => c.trim()) : [],
        description: row.description || '',
        higherLevels: row.higherLevels || undefined,
        imageUrl: row.imageUrl || row.avatarUrl || undefined,
      };
      importedEntities.push(spell);
    } else if (type === 'item') {
      const item: ItemEntity = {
        id,
        type: 'item',
        name,
        createdAt: now,
        updatedAt: now,
        itemType: (row.itemType as any) || 'Adventuring Gear',
        rarity: (row.rarity as any) || 'Common',
        attunement: row.attunement ? row.attunement.toLowerCase() === 'true' : false,
        attunementRequirement: row.attunementRequirement || undefined,
        value: row.value || undefined,
        weight: row.weight || undefined,
        damage: row.damage || undefined,
        armorClassBonus: parseInt(row.armorClassBonus || '0', 10),
        properties: row.properties ? row.properties.split(',').map((p) => p.trim()) : [],
        description: row.description || '',
        imageUrl: row.imageUrl || row.avatarUrl || undefined,
      };
      importedEntities.push(item);
    } else if (type === 'player') {
      const player: PlayerEntity = {
        id,
        type: 'player',
        name,
        createdAt: now,
        updatedAt: now,
        playerName: row.playerName || '',
        characterClass: row.characterClass || 'Adventurer 1',
        race: row.race || 'Human',
        level: parseInt(row.level || '1', 10),
        armorClass: parseInt(row.armorClass || '10', 10),
        maxHp: parseInt(row.maxHp || '10', 10),
        currentHp: parseInt(row.currentHp || row.maxHp || '10', 10),
        tempHp: parseInt(row.tempHp || '0', 10),
        speed: row.speed || '30 ft.',
        initiativeBonus: parseInt(row.initiativeBonus || '0', 10),
        abilities: {
          str: parseInt(row.str || '10', 10),
          dex: parseInt(row.dex || '10', 10),
          con: parseInt(row.con || '10', 10),
          int: parseInt(row.int || '10', 10),
          wis: parseInt(row.wis || '10', 10),
          cha: parseInt(row.cha || '10', 10),
        },
        passivePerception: parseInt(row.passivePerception || '10', 10),
        passiveInvestigation: parseInt(row.passiveInvestigation || '10', 10),
        passiveInsight: parseInt(row.passiveInsight || '10', 10),
        notes: row.notes || '',
        avatarUrl: row.avatarUrl || row.imageUrl || undefined,
        tokenUrl: row.tokenUrl || undefined,
      };
      importedEntities.push(player);
    } else if (type === 'rollTable') {
      const table: RollTableEntity = {
        id,
        type: 'rollTable',
        name,
        createdAt: now,
        updatedAt: now,
        diceFormula: row.diceFormula || '1d20',
        description: row.description || '',
        items: parseTableRows(row.items || ''),
      };
      importedEntities.push(table);
    } else if (type === 'campaignNote') {
      const isFolder = row.isFolder 
        ? row.isFolder.toLowerCase() === 'true' 
        : (row.category?.toLowerCase() === 'folder');

      const parentRaw = row.parent || row.parentId || row.parentFolder || row.parentNote || (row as any)['parent note or folder'] || (row as any)['Parent Note or Folder'] || '';
      const campaignRaw = row.campaign || row.campaignId || row.campaignName || (row as any)['Campaign'] || (row as any)['campaign name'] || '';

      const note: any = {
        id,
        type: 'campaignNote',
        name,
        createdAt: now,
        updatedAt: now,
        category: (row.category as any) || (isFolder ? 'Folder' : 'Lore'),
        isFolder: Boolean(isFolder),
        isPlayerVisible: row.isPlayerVisible ? row.isPlayerVisible.toLowerCase() === 'true' : false,
        content: row.content || '',
        tags: row.tags ? row.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
        parentId: parentRaw ? parentRaw.trim() : null,
        campaignId: campaignRaw ? campaignRaw.trim() : undefined,
      };
      importedEntities.push(note);
    } else {
      // Generic entity
      const generic: BaseEntity = {
        id,
        type,
        name,
        createdAt: now,
        updatedAt: now,
        customFields: { ...row },
      };
      importedEntities.push(generic);
    }
  });

  return {
    success: errors.length === 0 && importedEntities.length > 0,
    importedEntities,
    errors,
    warnings,
  };
}
