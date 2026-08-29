import { AbilityScores } from '../types/monster';
import { PlayerEntity, SpellSlotTracker } from '../types/player';
import {
  AbilityKey,
  ClassDefinition2024,
  BackgroundDefinition2024,
  SpeciesDefinition2024,
  OriginFeatDefinition2024,
  WeaponMasteryDefinition2024,
  WeaponItem2024,
  ArmorItem2024,
  CharacterCreationState,
  DerivedCharacterStats,
} from '../types/characterCreator';

// --- ALL 18 D&D 5E SKILLS & ASSOCIATED ABILITY ---
export const SKILL_DEFINITIONS: { name: string; ability: AbilityKey }[] = [
  { name: 'Acrobatics', ability: 'dex' },
  { name: 'Animal Handling', ability: 'wis' },
  { name: 'Arcana', ability: 'int' },
  { name: 'Athletics', ability: 'str' },
  { name: 'Deception', ability: 'cha' },
  { name: 'History', ability: 'int' },
  { name: 'Insight', ability: 'wis' },
  { name: 'Intimidation', ability: 'cha' },
  { name: 'Investigation', ability: 'int' },
  { name: 'Medicine', ability: 'wis' },
  { name: 'Nature', ability: 'int' },
  { name: 'Perception', ability: 'wis' },
  { name: 'Performance', ability: 'cha' },
  { name: 'Persuasion', ability: 'cha' },
  { name: 'Religion', ability: 'int' },
  { name: 'Sleight of Hand', ability: 'dex' },
  { name: 'Stealth', ability: 'dex' },
  { name: 'Survival', ability: 'wis' },
];

export const STANDARD_LANGUAGES = [
  'Common',
  'Common Sign Language',
  'Draconic',
  'Dwarvish',
  'Elvish',
  'Giant',
  'Gnomish',
  'Goblin',
  'Halfling',
  'Orc',
];

export const RARE_LANGUAGES = [
  'Abyssal',
  'Celestial',
  'Deep Speech',
  'Druidic',
  'Infernal',
  'Primordial',
  'Sylvan',
  "Thieves' Cant",
  'Undercommon',
];

export const ALL_LANGUAGES = [...STANDARD_LANGUAGES, ...RARE_LANGUAGES];

export const ALIGNMENTS = [
  'Lawful Good',
  'Neutral Good',
  'Chaotic Good',
  'Lawful Neutral',
  'True Neutral',
  'Chaotic Neutral',
  'Lawful Evil',
  'Neutral Evil',
  'Chaotic Evil',
];

// --- 2024 WEAPONS CATALOG ---
export const WEAPONS_2024: WeaponItem2024[] = [
  // Simple Melee
  { id: 'club', name: 'Club', category: 'Simple', rangeType: 'Melee', damage: '1d4', damageType: 'Bludgeoning', properties: ['Light'], masteryProperty: 'Slow', weight: '2 lb', cost: '1 sp' },
  { id: 'dagger', name: 'Dagger', category: 'Simple', rangeType: 'Melee', damage: '1d4', damageType: 'Piercing', properties: ['Finesse', 'Light', 'Thrown (20/60)'], masteryProperty: 'Nick', weight: '1 lb', cost: '2 gp' },
  { id: 'greatclub', name: 'Greatclub', category: 'Simple', rangeType: 'Melee', damage: '1d8', damageType: 'Bludgeoning', properties: ['Two-Handed'], masteryProperty: 'Push', weight: '10 lb', cost: '2 sp' },
  { id: 'handaxe', name: 'Handaxe', category: 'Simple', rangeType: 'Melee', damage: '1d6', damageType: 'Slashing', properties: ['Light', 'Thrown (20/60)'], masteryProperty: 'Vex', weight: '2 lb', cost: '5 gp' },
  { id: 'javelin', name: 'Javelin', category: 'Simple', rangeType: 'Melee', damage: '1d6', damageType: 'Piercing', properties: ['Thrown (30/120)'], masteryProperty: 'Slow', weight: '2 lb', cost: '5 sp' },
  { id: 'light-hammer', name: 'Light Hammer', category: 'Simple', rangeType: 'Melee', damage: '1d4', damageType: 'Bludgeoning', properties: ['Light', 'Thrown (20/60)'], masteryProperty: 'Nick', weight: '2 lb', cost: '2 gp' },
  { id: 'mace', name: 'Mace', category: 'Simple', rangeType: 'Melee', damage: '1d6', damageType: 'Bludgeoning', properties: [], masteryProperty: 'Sap', weight: '4 lb', cost: '5 gp' },
  { id: 'quarterstaff', name: 'Quarterstaff', category: 'Simple', rangeType: 'Melee', damage: '1d6', damageType: 'Bludgeoning', properties: ['Versatile (1d8)'], masteryProperty: 'Topple', weight: '4 lb', cost: '2 sp' },
  { id: 'sickle', name: 'Sickle', category: 'Simple', rangeType: 'Melee', damage: '1d4', damageType: 'Slashing', properties: ['Light'], masteryProperty: 'Nick', weight: '2 lb', cost: '1 gp' },
  { id: 'spear', name: 'Spear', category: 'Simple', rangeType: 'Melee', damage: '1d6', damageType: 'Piercing', properties: ['Thrown (20/60)', 'Versatile (1d8)'], masteryProperty: 'Sap', weight: '3 lb', cost: '1 gp' },
  // Simple Ranged
  { id: 'light-crossbow', name: 'Light Crossbow', category: 'Simple', rangeType: 'Ranged', damage: '1d8', damageType: 'Piercing', properties: ['Ammunition (80/320)', 'Loading', 'Two-Handed'], masteryProperty: 'Slow', weight: '5 lb', cost: '25 gp' },
  { id: 'dart', name: 'Dart', category: 'Simple', rangeType: 'Ranged', damage: '1d4', damageType: 'Piercing', properties: ['Finesse', 'Thrown (20/60)'], masteryProperty: 'Vex', weight: '1/4 lb', cost: '5 cp' },
  { id: 'shortbow', name: 'Shortbow', category: 'Simple', rangeType: 'Ranged', damage: '1d6', damageType: 'Piercing', properties: ['Ammunition (80/320)', 'Two-Handed'], masteryProperty: 'Vex', weight: '2 lb', cost: '25 gp' },
  { id: 'sling', name: 'Sling', category: 'Simple', rangeType: 'Ranged', damage: '1d4', damageType: 'Bludgeoning', properties: ['Ammunition (30/120)'], masteryProperty: 'Slow', weight: '0 lb', cost: '1 sp' },
  // Martial Melee
  { id: 'battleaxe', name: 'Battleaxe', category: 'Martial', rangeType: 'Melee', damage: '1d8', damageType: 'Slashing', properties: ['Versatile (1d10)'], masteryProperty: 'Topple', weight: '4 lb', cost: '10 gp' },
  { id: 'flail', name: 'Flail', category: 'Martial', rangeType: 'Melee', damage: '1d8', damageType: 'Bludgeoning', properties: [], masteryProperty: 'Sap', weight: '2 lb', cost: '10 gp' },
  { id: 'glaive', name: 'Glaive', category: 'Martial', rangeType: 'Melee', damage: '1d10', damageType: 'Slashing', properties: ['Heavy', 'Reach', 'Two-Handed'], masteryProperty: 'Graze', weight: '6 lb', cost: '20 gp' },
  { id: 'greataxe', name: 'Greataxe', category: 'Martial', rangeType: 'Melee', damage: '1d12', damageType: 'Slashing', properties: ['Heavy', 'Two-Handed'], masteryProperty: 'Cleave', weight: '7 lb', cost: '30 gp' },
  { id: 'greatsword', name: 'Greatsword', category: 'Martial', rangeType: 'Melee', damage: '2d6', damageType: 'Slashing', properties: ['Heavy', 'Two-Handed'], masteryProperty: 'Graze', weight: '6 lb', cost: '50 gp' },
  { id: 'halberd', name: 'Halberd', category: 'Martial', rangeType: 'Melee', damage: '1d10', damageType: 'Slashing', properties: ['Heavy', 'Reach', 'Two-Handed'], masteryProperty: 'Cleave', weight: '6 lb', cost: '20 gp' },
  { id: 'lance', name: 'Lance', category: 'Martial', rangeType: 'Melee', damage: '1d10', damageType: 'Piercing', properties: ['Heavy', 'Reach', 'Two-Handed (unless mounted)'], masteryProperty: 'Topple', weight: '6 lb', cost: '10 gp' },
  { id: 'longsword', name: 'Longsword', category: 'Martial', rangeType: 'Melee', damage: '1d8', damageType: 'Slashing', properties: ['Versatile (1d10)'], masteryProperty: 'Sap', weight: '3 lb', cost: '15 gp' },
  { id: 'maul', name: 'Maul', category: 'Martial', rangeType: 'Melee', damage: '2d6', damageType: 'Bludgeoning', properties: ['Heavy', 'Two-Handed'], masteryProperty: 'Topple', weight: '10 lb', cost: '10 gp' },
  { id: 'morningstar', name: 'Morningstar', category: 'Martial', rangeType: 'Melee', damage: '1d8', damageType: 'Piercing', properties: [], masteryProperty: 'Sap', weight: '4 lb', cost: '15 gp' },
  { id: 'pike', name: 'Pike', category: 'Martial', rangeType: 'Melee', damage: '1d10', damageType: 'Piercing', properties: ['Heavy', 'Reach', 'Two-Handed'], masteryProperty: 'Push', weight: '18 lb', cost: '5 gp' },
  { id: 'rapier', name: 'Rapier', category: 'Martial', rangeType: 'Melee', damage: '1d8', damageType: 'Piercing', properties: ['Finesse'], masteryProperty: 'Vex', weight: '2 lb', cost: '25 gp' },
  { id: 'scimitar', name: 'Scimitar', category: 'Martial', rangeType: 'Melee', damage: '1d6', damageType: 'Slashing', properties: ['Finesse', 'Light'], masteryProperty: 'Nick', weight: '3 lb', cost: '25 gp' },
  { id: 'shortsword', name: 'Shortsword', category: 'Martial', rangeType: 'Melee', damage: '1d6', damageType: 'Piercing', properties: ['Finesse', 'Light'], masteryProperty: 'Vex', weight: '2 lb', cost: '10 gp' },
  { id: 'trident', name: 'Trident', category: 'Martial', rangeType: 'Melee', damage: '1d8', damageType: 'Piercing', properties: ['Thrown (20/60)', 'Versatile (1d10)'], masteryProperty: 'Topple', weight: '4 lb', cost: '5 gp' },
  { id: 'warhammer', name: 'Warhammer', category: 'Martial', rangeType: 'Melee', damage: '1d8', damageType: 'Bludgeoning', properties: ['Versatile (1d10)'], masteryProperty: 'Push', weight: '2 lb', cost: '15 gp' },
  { id: 'war-pick', name: 'War Pick', category: 'Martial', rangeType: 'Melee', damage: '1d8', damageType: 'Piercing', properties: ['Versatile (1d10)'], masteryProperty: 'Sap', weight: '2 lb', cost: '5 gp' },
  { id: 'whip', name: 'Whip', category: 'Martial', rangeType: 'Melee', damage: '1d4', damageType: 'Slashing', properties: ['Finesse', 'Reach'], masteryProperty: 'Slow', weight: '3 lb', cost: '2 gp' },
  // Martial Ranged
  { id: 'blowgun', name: 'Blowgun', category: 'Martial', rangeType: 'Ranged', damage: '1', damageType: 'Piercing', properties: ['Ammunition (25/100)', 'Loading'], masteryProperty: 'Vex', weight: '1 lb', cost: '10 gp' },
  { id: 'heavy-crossbow', name: 'Heavy Crossbow', category: 'Martial', rangeType: 'Ranged', damage: '1d10', damageType: 'Piercing', properties: ['Ammunition (100/400)', 'Heavy', 'Loading', 'Two-Handed'], masteryProperty: 'Push', weight: '18 lb', cost: '50 gp' },
  { id: 'longbow', name: 'Longbow', category: 'Martial', rangeType: 'Ranged', damage: '1d8', damageType: 'Piercing', properties: ['Ammunition (150/600)', 'Heavy', 'Two-Handed'], masteryProperty: 'Slow', weight: '2 lb', cost: '50 gp' },
  { id: 'musket', name: 'Musket', category: 'Martial', rangeType: 'Ranged', damage: '1d12', damageType: 'Piercing', properties: ['Ammunition (40/120)', 'Loading', 'Two-Handed'], masteryProperty: 'Slow', weight: '10 lb', cost: '500 gp' },
  { id: 'pistol', name: 'Pistol', category: 'Martial', rangeType: 'Ranged', damage: '1d10', damageType: 'Piercing', properties: ['Ammunition (30/90)', 'Loading'], masteryProperty: 'Vex', weight: '3 lb', cost: '250 gp' },
];

// --- 2024 ARMOR CATALOG ---
export const ARMOR_2024: ArmorItem2024[] = [
  // Light
  { id: 'padded-armor', name: 'Padded Armor', category: 'Light', baseAc: 11, dexBonus: 'full', stealthDisadvantage: true, weight: '8 lb', cost: '5 gp' },
  { id: 'leather-armor', name: 'Leather Armor', category: 'Light', baseAc: 11, dexBonus: 'full', stealthDisadvantage: false, weight: '10 lb', cost: '10 gp' },
  { id: 'studded-leather-armor', name: 'Studded Leather Armor', category: 'Light', baseAc: 12, dexBonus: 'full', stealthDisadvantage: false, weight: '13 lb', cost: '45 gp' },
  // Medium
  { id: 'hide-armor', name: 'Hide Armor', category: 'Medium', baseAc: 12, dexBonus: 'max2', stealthDisadvantage: false, weight: '12 lb', cost: '10 gp' },
  { id: 'chain-shirt', name: 'Chain Shirt', category: 'Medium', baseAc: 13, dexBonus: 'max2', stealthDisadvantage: false, weight: '20 lb', cost: '50 gp' },
  { id: 'scale-mail', name: 'Scale Mail', category: 'Medium', baseAc: 14, dexBonus: 'max2', stealthDisadvantage: true, weight: '45 lb', cost: '50 gp' },
  { id: 'breastplate', name: 'Breastplate', category: 'Medium', baseAc: 14, dexBonus: 'max2', stealthDisadvantage: false, weight: '20 lb', cost: '400 gp' },
  { id: 'half-plate-armor', name: 'Half Plate Armor', category: 'Medium', baseAc: 15, dexBonus: 'max2', stealthDisadvantage: true, weight: '40 lb', cost: '750 gp' },
  // Heavy
  { id: 'ring-mail', name: 'Ring Mail', category: 'Heavy', baseAc: 14, dexBonus: 'none', stealthDisadvantage: true, weight: '40 lb', cost: '30 gp' },
  { id: 'chain-mail', name: 'Chain Mail', category: 'Heavy', baseAc: 16, dexBonus: 'none', stealthDisadvantage: true, minStr: 13, weight: '55 lb', cost: '75 gp' },
  { id: 'splint-armor', name: 'Splint Armor', category: 'Heavy', baseAc: 17, dexBonus: 'none', stealthDisadvantage: true, minStr: 15, weight: '60 lb', cost: '200 gp' },
  { id: 'plate-armor', name: 'Plate Armor', category: 'Heavy', baseAc: 18, dexBonus: 'none', stealthDisadvantage: true, minStr: 15, weight: '65 lb', cost: '1500 gp' },
  // Shield
  { id: 'shield', name: 'Shield', category: 'Shield', baseAc: 2, dexBonus: 'none', stealthDisadvantage: false, weight: '6 lb', cost: '10 gp' },
];

// --- 2024 WEAPON MASTERIES ---
export const WEAPON_MASTERIES_2024: WeaponMasteryDefinition2024[] = [
  {
    id: 'cleave',
    property: 'Cleave',
    name: 'Cleave',
    weapons: ['Greataxe', 'Halberd'],
    summary: 'Make a bonus attack against an adjacent target within reach on a melee hit.',
    description: 'If you hit a creature with a melee attack roll using this weapon, you can make an attack roll with the weapon against a second creature within 5 ft of the first that is also within your reach. Damage equals weapon damage die without ability modifier.',
  },
  {
    id: 'graze',
    property: 'Graze',
    name: 'Graze',
    weapons: ['Glaive', 'Greatsword'],
    summary: 'Deal damage equal to your ability modifier even on a missed attack roll.',
    description: 'If your attack roll misses a creature, that creature still takes damage equal to the ability modifier you used with the attack roll (minimum 1 damage of the weapon\'s damage type).',
  },
  {
    id: 'nick',
    property: 'Nick',
    name: 'Nick',
    weapons: ['Dagger', 'Light Hammer', 'Scimitar', 'Sickle'],
    summary: 'Make light weapon extra attack as part of the Attack action instead of a Bonus Action.',
    description: 'When you make the extra attack granted by the Light weapon property, you can make that attack as part of the Attack action instead of as a Bonus Action (once per turn).',
  },
  {
    id: 'push',
    property: 'Push',
    name: 'Push',
    weapons: ['Greatclub', 'Heavy Crossbow', 'Pike', 'Warhammer'],
    summary: 'Push target up to 10 ft straight away on a hit (Large or smaller).',
    description: 'If you hit a creature with this weapon, you can push the creature up to 10 feet straight away from you if it is Large or smaller.',
  },
  {
    id: 'sap',
    property: 'Sap',
    name: 'Sap',
    weapons: ['Flail', 'Longsword', 'Mace', 'Morningstar', 'Spear', 'War Pick'],
    summary: 'Impose Disadvantage on target\'s next attack roll before your next turn.',
    description: 'If you hit a creature with this weapon, that creature has Disadvantage on its next attack roll before the start of your next turn.',
  },
  {
    id: 'slow',
    property: 'Slow',
    name: 'Slow',
    weapons: ['Club', 'Javelin', 'Light Crossbow', 'Longbow', 'Musket', 'Sling', 'Whip'],
    summary: 'Reduce target speed by 10 ft on a hit dealing damage.',
    description: 'If you hit a creature with this weapon and deal damage, you can reduce its speed by 10 feet until the start of your next turn (cannot reduce speed by more than 10 ft cumulatively).',
  },
  {
    id: 'topple',
    property: 'Topple',
    name: 'Topple',
    weapons: ['Battleaxe', 'Lance', 'Maul', 'Quarterstaff', 'Trident'],
    summary: 'Force target to make a Con save (DC 8+PB+Mod) or fall Prone on a hit.',
    description: 'If you hit a creature with this weapon, you can force the creature to make a Constitution saving throw (DC 8 + proficiency bonus + ability modifier used) or fall Prone.',
  },
  {
    id: 'vex',
    property: 'Vex',
    name: 'Vex',
    weapons: ['Blowgun', 'Dart', 'Handaxe', 'Pistol', 'Rapier', 'Shortbow', 'Shortsword'],
    summary: 'Gain Advantage on your next attack roll against the target on a hit.',
    description: 'If you hit a creature and deal damage with this weapon, you have Advantage on your next attack roll against that creature before the end of your next turn.',
  },
];

// --- 2024 ORIGIN FEATS ---
export const ORIGIN_FEATS_2024: OriginFeatDefinition2024[] = [
  {
    id: 'alert',
    name: 'Alert',
    category: 'Origin',
    prerequisite: 'None',
    summary: 'Gain Initiative bonus equal to PB; swap initiative positions with a willing ally.',
    description: 'You gain a bonus to initiative rolls equal to your Proficiency Bonus. Immediately after you roll initiative, you can swap your initiative with one willing ally in the same combat.',
  },
  {
    id: 'crafter',
    name: 'Crafter',
    category: 'Origin',
    prerequisite: 'None',
    summary: 'Gain 3 artisan tools, craft items faster, and get a 20% discount on nonmagical goods.',
    description: 'You gain proficiency with three different Artisan\'s Tools of your choice. You craft items in 20% less time and receive a 20% discount on nonmagical items you purchase.',
    requiresToolChoices: { count: 3 },
  },
  {
    id: 'healer',
    name: 'Healer',
    category: 'Origin',
    prerequisite: 'None',
    summary: 'Reroll 1s on healing dice; use Healer\'s Kit to heal 1d4 + 1 + target\'s Hit Dice.',
    description: 'Whenever you roll a die to determine the number of HP you restore with a spell or Healer\'s Kit, you can reroll the die if it rolls a 1. As an action, you can spend one use of a Healer\'s Kit to restore 1d4 + 1 + target\'s Hit Dice in HP.',
  },
  {
    id: 'lucky',
    name: 'Lucky',
    category: 'Origin',
    prerequisite: 'None',
    summary: 'Gain Luck Points equal to PB for Advantage on rolls or forcing Disadvantage on enemies.',
    description: 'You have a pool of Luck Points equal to your Proficiency Bonus (replenished on a Long Rest). You can spend a point to give yourself Advantage on a d20 Test or impose Disadvantage on an attack roll made against you.',
  },
  {
    id: 'magic-initiate',
    name: 'Magic Initiate',
    category: 'Origin',
    prerequisite: 'None',
    summary: 'Learn 2 Cantrips and 1 Level 1 Spell from Cleric, Druid, or Wizard spell list.',
    description: 'Choose a spell list: Cleric (Wisdom), Druid (Wisdom), or Wizard (Intelligence). You learn two cantrips and one 1st-level spell from that list. You can cast the 1st-level spell without a spell slot once per Long Rest.',
    requiresSpellChoice: {
      schools: ['Cleric', 'Druid', 'Wizard'],
      cantripsCount: 2,
      level1Count: 1,
    },
  },
  {
    id: 'musician',
    name: 'Musician',
    category: 'Origin',
    prerequisite: 'None',
    summary: 'Proficiency with 3 musical instruments; grant Heroic Inspiration to allies after rests.',
    description: 'You gain proficiency with three Musical Instruments of your choice. As you finish a Short or Long Rest, you can play music to give Heroic Inspiration to a number of allies equal to your Proficiency Bonus.',
    requiresToolChoices: { count: 3 },
  },
  {
    id: 'savage-attacker',
    name: 'Savage Attacker',
    category: 'Origin',
    prerequisite: 'None',
    summary: 'Roll damage dice twice on weapon attacks once per turn and use either total.',
    description: 'Once per turn when you hit a target with a weapon attack roll, you can roll the weapon\'s damage dice twice and use either total.',
  },
  {
    id: 'skilled',
    name: 'Skilled',
    category: 'Origin',
    prerequisite: 'None',
    summary: 'Gain proficiency in any combination of 3 skills or tools of your choice.',
    description: 'You gain proficiency in any combination of three skills or tools of your choice.',
    requiresSkillChoices: { count: 3 },
  },
  {
    id: 'tavern-brawler',
    name: 'Tavern Brawler',
    category: 'Origin',
    prerequisite: 'None',
    summary: '1d4 unarmed strike damage, reroll 1s on damage, push target 5 ft on unarmed hits.',
    description: 'Your Unarmed Strikes deal 1d4 + Strength modifier bludgeoning damage. You can reroll 1s on damage dice for unarmed strikes. When you hit with an unarmed strike, you can push the target 5 feet away.',
  },
  {
    id: 'tough',
    name: 'Tough',
    category: 'Origin',
    prerequisite: 'None',
    summary: 'HP maximum increases by +2 per character level (starting at level 1).',
    description: 'Your hit point maximum increases by an amount equal to twice your character level when you gain this feat. Whenever you gain a level thereafter, your HP max increases by an additional 2 hit points.',
  },
];

// --- 2024 CLASSES (12 CLASSES) ---
export const CLASSES_2024: ClassDefinition2024[] = [
  {
    id: 'barbarian',
    name: 'Barbarian',
    hitDie: 12,
    primaryAbility: 'Strength',
    savingThrows: ['str', 'con'],
    armorProficiencies: ['Light Armor', 'Medium Armor', 'Shields'],
    weaponProficiencies: ['Simple Weapons', 'Martial Weapons'],
    skillChoices: {
      count: 2,
      options: ['Animal Handling', 'Athletics', 'Intimidation', 'Nature', 'Perception', 'Survival'],
    },
    weaponMasteriesCount: 2,
    level1Features: [
      { name: 'Rage', description: 'Enter a battle fury as a bonus action, gaining bonus melee damage (+2), Advantage on Strength checks/saves, and resistance to Bludgeoning, Piercing, and Slashing damage.' },
      { name: 'Unarmored Defense', description: 'While not wearing armor, your Armor Class equals 10 + Dexterity modifier + Constitution modifier. You can use a Shield and still gain this benefit.' },
      { name: 'Weapon Mastery (2)', description: 'You unlock the mastery properties of 2 weapons of your choice that you are proficient with.' },
    ],
    subclasses: [
      { id: 'berserker', name: 'Path of the Berserker', summary: 'Unleashes Frenzy for explosive bonus damage and retaliatory strikes.', features: ['Frenzy', 'Mindless Rage', 'Retaliation', 'Intimidating Presence'] },
      { id: 'wild-heart', name: 'Path of the Wild Heart', summary: 'Channels animal aspects (Bear, Eagle, Wolf) for defensive and tactical versatility.', features: ['Rage of the Wilds', 'Aspect of the Wilds', 'Nature Speaker', 'Power of the Wilds'] },
      { id: 'world-tree', name: 'Path of the World Tree', summary: 'Draws cosmic vitality from Yggdrasil to gain temp HP, extend reach, and teleport allies.', features: ['Vitality of the Tree', 'Branches of the Tree', 'Boughs of the Root', 'Travel Along the Tree'] },
      { id: 'zealot', name: 'Path of the Zealot', summary: 'Fights in holy fury with divine energy, radiant/necrotic damage, and defying death.', features: ['Divine Fury', 'Warrior of the Gods', 'Fanatical Focus', 'Zealous Presence'] },
    ],
    icon: 'Flame',
    color: '#ef4444',
    description: 'A fierce warrior who can enter a battle rage, shrugging off deadly blows and cleaving through ranks of foes.',
  },
  {
    id: 'bard',
    name: 'Bard',
    hitDie: 8,
    primaryAbility: 'Charisma',
    savingThrows: ['dex', 'cha'],
    armorProficiencies: ['Light Armor'],
    weaponProficiencies: ['Simple Weapons'],
    toolProficiencies: ['Three Musical Instruments of choice'],
    skillChoices: {
      count: 3,
      options: ['Any'],
    },
    weaponMasteriesCount: 0,
    spellcasting: {
      casterType: 'full',
      ability: 'cha',
      cantripsKnown: 2,
      spellsPrepared: 4,
      spellList: ['Bard'],
    },
    level1Features: [
      { name: 'Bardic Inspiration (d6)', description: 'Inspire others through stirring words or music as a bonus action, granting an inspiration die (d6) to add to d20 tests or healing.' },
      { name: 'Spellcasting', description: 'Cast bard spells using Charisma. You can use a musical instrument as a spellcasting focus and cast ritual spells.' },
    ],
    subclasses: [
      { id: 'dance', name: 'College of Dance', summary: 'Harnesses agile movement to fight unarmed, move freely, and share evasion.', features: ['Dazzling Footwork', 'Inspiring Movement', 'Tandem Footwork', 'Leading Evasion'] },
      { id: 'glamour', name: 'College of Glamour', summary: 'Weaves beguiling Feywild enchantments to charm crowds and manipulate battlefields.', features: ['Beguiling Magic', 'Mantle of Inspiration', 'Mantle of Majesty', 'Unbreakable Majesty'] },
      { id: 'lore', name: 'College of Lore', summary: 'Master of secrets, gaining extra skill proficiencies, Cutting Words, and early Magical Secrets.', features: ['Bonus Proficiencies (3)', 'Cutting Words', 'Magical Discoveries', 'Peerless Skill'] },
      { id: 'valor', name: 'College of Valor', summary: 'Sings songs of martial heroics, boosting weapon attacks, armor, and combat casting.', features: ['Combat Inspiration', 'Martial Training', 'Extra Attack', 'Battle Magic'] },
    ],
    icon: 'Music',
    color: '#ec4899',
    description: 'An inspiring magician whose power echoes the music of creation, blending spells, swordplay, and lore.',
  },
  {
    id: 'cleric',
    name: 'Cleric',
    hitDie: 8,
    primaryAbility: 'Wisdom',
    savingThrows: ['wis', 'cha'],
    armorProficiencies: ['Light Armor', 'Medium Armor', 'Shields'],
    weaponProficiencies: ['Simple Weapons'],
    skillChoices: {
      count: 2,
      options: ['History', 'Insight', 'Medicine', 'Persuasion', 'Religion'],
    },
    weaponMasteriesCount: 0,
    spellcasting: {
      casterType: 'full',
      ability: 'wis',
      cantripsKnown: 3,
      spellsPrepared: 4,
      spellList: ['Cleric'],
    },
    orderChoices: {
      name: 'Divine Order',
      options: [
        { name: 'Protector', description: 'Trained for martial battle. Gain Heavy Armor proficiency and Martial Weapon proficiency.' },
        { name: 'Thaumaturge', description: 'Devoted to divine mysteries. Gain 1 extra Cleric Cantrip and a bonus to Religion / Arcana checks equal to Wisdom modifier.' },
      ],
    },
    level1Features: [
      { name: 'Divine Order', description: 'Choose your sacred path: Protector (Heavy Armor & Martial Weapons) or Thaumaturge (Extra Cantrip & Lore bonus).' },
      { name: 'Spellcasting', description: 'Prepare and cast divine spells using Wisdom as your spellcasting ability with a Holy Symbol focus.' },
    ],
    subclasses: [
      { id: 'life', name: 'Life Domain', summary: 'Master of curative magic, boosting hit points restored and armor resilience.', features: ['Disciple of Life', 'Preserve Life', 'Blessed Healer', 'Supreme Healing'] },
      { id: 'light', name: 'Light Domain', summary: 'Wields searing radiance, warding flares, and explosive Fireball magic.', features: ['Warding Flare', 'Radiance of the Dawn', 'Improved Flare', 'Corona of Light'] },
      { id: 'trickery', name: 'Trickery Domain', summary: 'Bedevils foes with illusionary duplicates, stealth enhancements, and deceit.', features: ['Blessing of the Trickster', 'Invoke Duplicity', 'Trickster\'s Magic', 'Improved Duplicity'] },
      { id: 'war', name: 'War Domain', summary: 'Inspires martial valor, granting bonus weapon attacks and guided strikes.', features: ['War Priest', 'Guided Strike', 'War God\'s Blessing', 'Avatar of Battle'] },
    ],
    icon: 'Sun',
    color: '#eab308',
    description: 'A priestly champion who wields divine magic and martial discipline in service of a higher power.',
  },
  {
    id: 'druid',
    name: 'Druid',
    hitDie: 8,
    primaryAbility: 'Wisdom',
    savingThrows: ['int', 'wis'],
    armorProficiencies: ['Light Armor', 'Shields'],
    weaponProficiencies: ['Simple Weapons'],
    toolProficiencies: ['Herbalism Kit'],
    skillChoices: {
      count: 2,
      options: ['Arcana', 'Animal Handling', 'Insight', 'Medicine', 'Nature', 'Perception', 'Religion', 'Survival'],
    },
    weaponMasteriesCount: 0,
    spellcasting: {
      casterType: 'full',
      ability: 'wis',
      cantripsKnown: 2,
      spellsPrepared: 4,
      spellList: ['Druid'],
    },
    orderChoices: {
      name: 'Primal Order',
      options: [
        { name: 'Magician', description: 'Deep devotion to primal magic. Gain 1 extra Druid Cantrip and bonus to Nature / Arcana checks equal to Wisdom modifier.' },
        { name: 'Warden', description: 'Guardian of the wilds. Gain Medium Armor proficiency and Martial Weapon proficiency.' },
      ],
    },
    level1Features: [
      { name: 'Primal Order', description: 'Choose your focus: Magician (Extra Cantrip & Nature checks bonus) or Warden (Medium Armor & Martial Weapons).' },
      { name: 'Druidic', description: 'You know Druidic, the secret language of druids, and always have Speak with Animals prepared.' },
      { name: 'Spellcasting', description: 'Channel primal magic drawn from nature using Wisdom with a Druidic Focus.' },
    ],
    subclasses: [
      { id: 'land', name: 'Circle of the Land', summary: 'Draws spellpower from biomes (Arid, Polar, Temperate, Tropical) with bonus spells.', features: ['Circle Spells', 'Land\'s Aid', 'Natural Recovery', 'Nature\'s Sanctuary'] },
      { id: 'moon', name: 'Circle of the Moon', summary: 'Transforms into ferocious combat beasts with swift transformation and lunar radiance.', features: ['Combat Wild Shape', 'Moonlight Step', 'Lunar Form', 'Moon Beast'] },
      { id: 'sea', name: 'Circle of the Sea', summary: 'Manifests oceanic tides and storms to blast enemies with cold and lightning.', features: ['Wrath of the Sea', 'Aquatic Affinity', 'Stormborn', 'Oceanic Gift'] },
      { id: 'stars', name: 'Circle of Stars', summary: 'Harnesses constellations (Archer, Chalice, Dragon) for radiant attacks or healing.', features: ['Star Map', 'Starry Form', 'Cosmic Omen', 'Full of Stars'] },
    ],
    icon: 'Leaf',
    color: '#22c55e',
    description: 'A priest of the Old Faith, wielding the powers of nature and adopting animal forms.',
  },
  {
    id: 'fighter',
    name: 'Fighter',
    hitDie: 10,
    primaryAbility: 'Strength or Dexterity',
    savingThrows: ['str', 'con'],
    armorProficiencies: ['All Armor', 'Shields'],
    weaponProficiencies: ['Simple Weapons', 'Martial Weapons'],
    skillChoices: {
      count: 2,
      options: ['Acrobatics', 'Animal Handling', 'Athletics', 'History', 'Insight', 'Intimidation', 'Perception', 'Survival'],
    },
    weaponMasteriesCount: 3,
    fightingStyleChoices: ['Archery', 'Blind Fighting', 'Defense', 'Dueling', 'Great Weapon Fighting', 'Interception', 'Protection', 'Thrown Weapon Fighting', 'Two-Weapon Fighting', 'Unarmed Fighting'],
    level1Features: [
      { name: 'Fighting Style Feat', description: 'Choose a Fighting Style Feat (e.g. Defense for +1 AC, Dueling for +2 dmg, Archery for +2 to hit).' },
      { name: 'Second Wind', description: 'Regain 1d10 + Fighter level hit points as a bonus action (2 uses per rest at level 1).' },
      { name: 'Weapon Mastery (3)', description: 'You unlock the mastery properties of 3 weapons of your choice that you are proficient with.' },
      { name: 'Tactical Mind', description: 'When you fail an ability check, you can spend 1 use of Second Wind to add 1d10 to the d20 roll.' },
    ],
    subclasses: [
      { id: 'battle-master', name: 'Battle Master', summary: 'Employs tactical maneuvers powered by Superiority Dice (d8) to control combat.', features: ['Combat Superiority (d8)', 'Maneuvers (3)', 'Student of War', 'Know Your Enemy'] },
      { id: 'champion', name: 'Champion', summary: 'Focuses on pure physical power with 19-20 critical hit range and Remarkable Athlete.', features: ['Improved Critical (19-20)', 'Remarkable Athlete', 'Heroic Warrior', 'Survivor'] },
      { id: 'eldritch-knight', name: 'Eldritch Knight', summary: 'Combines martial mastery with Abjuration and Evocation arcane wizard spellcasting.', features: ['Spellcasting (Wizard)', 'Weapon Bond', 'War Magic', 'Arcane Charge'] },
      { id: 'psi-warrior', name: 'Psi Warrior', summary: 'Augments strikes and defenses with psionic telekinesis and protective barriers.', features: ['Psionic Power (d6)', 'Protective Field', 'Psionic Strike', 'Telekinetic Movement'] },
    ],
    icon: 'Shield',
    color: '#3b82f6',
    description: 'A master of martial combat, skilled with a variety of weapons and armors.',
  },
  {
    id: 'monk',
    name: 'Monk',
    hitDie: 8,
    primaryAbility: 'Dexterity & Wisdom',
    savingThrows: ['str', 'dex'],
    armorProficiencies: ['None'],
    weaponProficiencies: ['Simple Weapons', 'Martial Weapons (with Light property)'],
    skillChoices: {
      count: 2,
      options: ['Acrobatics', 'Athletics', 'History', 'Insight', 'Religion', 'Stealth'],
    },
    weaponMasteriesCount: 0,
    level1Features: [
      { name: 'Unarmored Defense', description: 'While wearing no armor and not using a shield, your AC equals 10 + Dexterity modifier + Wisdom modifier.' },
      { name: 'Martial Arts (d6)', description: 'Use Dexterity for unarmed strikes and monk weapons. Unarmed strikes deal 1d6 damage, and you can make a bonus action unarmed strike.' },
    ],
    subclasses: [
      { id: 'mercy', name: 'Warrior of Mercy', summary: 'Manipulates life force to heal wounds with Hand of Healing or harm foes.', features: ['Hand of Healing', 'Hand of Harm', 'Physician\'s Touch', 'Flurry of Healing and Harm'] },
      { id: 'shadow', name: 'Warrior of Shadow', summary: 'Blends into shadows, teleports between darkness, and casts Darkness/Silence.', features: ['Shadow Arts', 'Shadow Step', 'Cloak of Shadows', 'Opportunist'] },
      { id: 'elements', name: 'Warrior of Elements', summary: 'Channels elemental energy to extend reach and blast foes with fire, cold, or lightning.', features: ['Elemental Attunement', 'Manipulate Elements', 'Elemental Burst', 'Stride of Elements'] },
      { id: 'open-hand', name: 'Warrior of Open Hand', summary: 'Master of physical manipulation, imposing knockdown, push, or reaction denial.', features: ['Open Hand Technique', 'Wholeness of Body', 'Fleet Step', 'Quivering Palm'] },
    ],
    icon: 'Zap',
    color: '#06b6d4',
    description: 'A martial artist who harnesses inner focus to perform supernatural strikes and uncanny movement.',
  },
  {
    id: 'paladin',
    name: 'Paladin',
    hitDie: 10,
    primaryAbility: 'Strength & Charisma',
    savingThrows: ['wis', 'cha'],
    armorProficiencies: ['All Armor', 'Shields'],
    weaponProficiencies: ['Simple Weapons', 'Martial Weapons'],
    skillChoices: {
      count: 2,
      options: ['Athletics', 'Insight', 'Intimidation', 'Medicine', 'Persuasion', 'Religion'],
    },
    weaponMasteriesCount: 2,
    spellcasting: {
      casterType: 'half',
      ability: 'cha',
      cantripsKnown: 0,
      spellsPrepared: 2,
      spellList: ['Paladin'],
    },
    level1Features: [
      { name: 'Lay on Hands', description: 'Heal a pool of hit points equal to 5 × Paladin level. You can also spend 5 HP to cure a Poisoned condition.' },
      { name: 'Spellcasting', description: 'Prepare and cast paladin spells starting at level 1 using Charisma and a Holy Symbol focus.' },
      { name: 'Weapon Mastery (2)', description: 'Unlock mastery properties for 2 weapons of your choice that you are proficient with.' },
    ],
    subclasses: [
      { id: 'devotion', name: 'Oath of Devotion', summary: 'Emulates divine purity, boosting weapon hit chances with Sacred Weapon and holy aura.', features: ['Sacred Weapon', 'Turn the Unholy', 'Aura of Devotion', 'Holy Nimbus'] },
      { id: 'glory', name: 'Oath of Glory', summary: 'Strives for legendary heroics, gaining explosive movement speed and inspirational temp HP.', features: ['Peerless Athlete', 'Inspiring Smite', 'Aura of Alacrity', 'Glorious Defense'] },
      { id: 'ancients', name: 'Oath of the Ancients', summary: 'Preserves the light of nature, ensnaring foes and radiating spell resistance.', features: ['Nature\'s Wrath', 'Turn the Faithless', 'Aura of Warding', 'Elder Champion'] },
      { id: 'vengeance', name: 'Oath of Vengeance', summary: 'Hunts transgressors with Abjure Foes and Vow of Enmity for relentless Advantage.', features: ['Vow of Enmity', 'Abjure Foes', 'Relentless Avenger', 'Avenging Angel'] },
    ],
    icon: 'Crosshair',
    color: '#f59e0b',
    description: 'A holy warrior bound to a sacred oath, smiting evil with radiant divine magic.',
  },
  {
    id: 'ranger',
    name: 'Ranger',
    hitDie: 10,
    primaryAbility: 'Dexterity & Wisdom',
    savingThrows: ['str', 'dex'],
    armorProficiencies: ['Light Armor', 'Medium Armor', 'Shields'],
    weaponProficiencies: ['Simple Weapons', 'Martial Weapons'],
    skillChoices: {
      count: 3,
      options: ['Animal Handling', 'Athletics', 'Insight', 'Investigation', 'Nature', 'Perception', 'Stealth', 'Survival'],
    },
    weaponMasteriesCount: 2,
    spellcasting: {
      casterType: 'half',
      ability: 'wis',
      cantripsKnown: 0,
      spellsPrepared: 2,
      spellList: ['Ranger'],
    },
    level1Features: [
      { name: 'Spellcasting', description: 'Prepare and cast ranger spells starting at level 1 using Wisdom and a Druidic Focus.' },
      { name: 'Favored Enemy', description: 'Always have Hunter\'s Mark prepared, casting it without expending a spell slot a number of times equal to your Wisdom modifier.' },
      { name: 'Weapon Mastery (2)', description: 'Unlock mastery properties for 2 weapons of your choice that you are proficient with.' },
    ],
    subclasses: [
      { id: 'beast-master', name: 'Beast Master', summary: 'Bonds with a Primal Companion (Land, Sea, Air) that fights alongside you.', features: ['Primal Companion', 'Exceptional Training', 'Bestial Fury', 'Share Spells'] },
      { id: 'fey-wanderer', name: 'Fey Wanderer', summary: 'Infuses strikes with fey dread, adding Wisdom modifier to all Charisma checks.', features: ['Dreadful Strikes', 'Feywild Gift', 'Beguiling Twist', 'Misty Wanderer'] },
      { id: 'gloom-stalker', name: 'Gloom Stalker', summary: 'Ambushes from darkness, gaining darkvision, first-turn bonus attacks, and invisibility to darkvision.', features: ['Dread Ambusher', 'Umbral Sight', 'Iron Mind', 'Stalker\'s Flurry'] },
      { id: 'hunter', name: 'Hunter', summary: 'Protects the wilderness with tactical combat options (Colossus Slayer, Horde Breaker).', features: ['Hunter\'s Prey', 'Defensive Tactics', 'Superior Hunter\'s Prey', 'Multiattack'] },
    ],
    icon: 'Compass',
    color: '#10b981',
    description: 'A master of wilderness lore and scouting who uses martial prowess and nature magic to track foes.',
  },
  {
    id: 'rogue',
    name: 'Rogue',
    hitDie: 8,
    primaryAbility: 'Dexterity',
    savingThrows: ['dex', 'int'],
    armorProficiencies: ['Light Armor'],
    weaponProficiencies: ['Simple Weapons', 'Martial Weapons (with Finesse or Light property)'],
    toolProficiencies: ['Thieves\' Tools'],
    skillChoices: {
      count: 4,
      options: ['Acrobatics', 'Athletics', 'Deception', 'Insight', 'Intimidation', 'Investigation', 'Perception', 'Performance', 'Persuasion', 'Sleight of Hand', 'Stealth'],
    },
    weaponMasteriesCount: 2,
    level1Features: [
      { name: 'Sneak Attack (1d6)', description: 'Deal an extra 1d6 damage once per turn to a creature you hit with a Finesse or Ranged weapon if you have Advantage or an ally within 5 ft.' },
      { name: 'Thieves\' Cant', description: 'You know Thieves\' Cant and one additional language of choice.' },
      { name: 'Expertise (2 Skills)', description: 'Double your Proficiency Bonus for checks made with two proficient skills or Thieves\' Tools.' },
      { name: 'Weapon Mastery (2)', description: 'Unlock mastery properties for 2 weapons of your choice that you are proficient with.' },
    ],
    subclasses: [
      { id: 'arcane-trickster', name: 'Arcane Trickster', summary: 'Enhances stealth and thievery with Mage Hand Legerdemain and Illusion/Enchantment spells.', features: ['Spellcasting (Wizard)', 'Mage Hand Legerdemain', 'Magical Ambush', 'Versatile Trickster'] },
      { id: 'assassin', name: 'Assassin', summary: 'Master of infiltration, disguise, poisons, and deadly critical hits on surprised targets.', features: ['Assassinate', 'Bonus Proficiencies', 'Infiltration Expertise', 'Death Strike'] },
      { id: 'soulknife', name: 'Soulknife', summary: 'Manifests psychic blades for ranged or melee attacks, boosting skills with Psi-Bolstered Knack.', features: ['Psychic Blades', 'Psi-Bolstered Knack', 'Psychic Whispers', 'Soul Blades'] },
      { id: 'thief', name: 'Thief', summary: 'Infiltrates swiftly with Fast Hands (bonus action tools/items), Second-Story Work, and Use Magic Device.', features: ['Fast Hands', 'Second-Story Work', 'Supreme Sneak', 'Use Magic Device'] },
    ],
    icon: 'Feather',
    color: '#8b5cf6',
    description: 'A scoundrel who uses stealth, precision, and agility to overcome obstacles and strike critical vulnerabilities.',
  },
  {
    id: 'sorcerer',
    name: 'Sorcerer',
    hitDie: 6,
    primaryAbility: 'Charisma',
    savingThrows: ['con', 'cha'],
    armorProficiencies: ['None'],
    weaponProficiencies: ['Simple Weapons'],
    skillChoices: {
      count: 2,
      options: ['Arcana', 'Deception', 'Insight', 'Intimidation', 'Persuasion', 'Religion'],
    },
    weaponMasteriesCount: 0,
    spellcasting: {
      casterType: 'full',
      ability: 'cha',
      cantripsKnown: 4,
      spellsPrepared: 2,
      spellList: ['Sorcerer'],
    },
    level1Features: [
      { name: 'Innate Sorcery', description: 'As a bonus action, unleash innate magical power for 1 minute: spell attacks have Advantage, and your spell save DC increases by 1 (2 uses per Long Rest).' },
      { name: 'Spellcasting', description: 'Cast arcane spells born from innate power using Charisma with an Arcane Focus.' },
    ],
    subclasses: [
      { id: 'aberrant', name: 'Aberrant Sorcery', summary: 'Wields psionic alien magic, casting telepathic spells without components and altering form.', features: ['Psionic Spells', 'Telepathic Speech', 'Psionic Sorcery', 'Psychic Defenses'] },
      { id: 'clockwork', name: 'Clockwork Sorcery', summary: 'Channels cosmic order to neutralize advantage/disadvantage and create protective shields.', features: ['Clockwork Magic', 'Restore Balance', 'Bastion of Law', 'Trance of Order'] },
      { id: 'draconic', name: 'Draconic Sorcery', summary: 'Inherits dragon blood, gaining elemental resistance, +1 HP/level, and draconic wings.', features: ['Draconic Resilience (+1 HP/lvl, AC 13+Dex)', 'Elemental Affinity', 'Dragon Wings', 'Dragon Companion'] },
      { id: 'wild-magic', name: 'Wild Magic Sorcery', summary: 'Unleashes chaotic magic, manipulating probability with Tides of Chaos and Surges.', features: ['Wild Magic Surge', 'Tides of Chaos', 'Bend Luck', 'Controlled Chaos'] },
    ],
    icon: 'Sparkles',
    color: '#a855f7',
    description: 'A spellcaster who draws on inherent magic from a gift, curse, or cosmic bloodline.',
  },
  {
    id: 'warlock',
    name: 'Warlock',
    hitDie: 8,
    primaryAbility: 'Charisma',
    savingThrows: ['wis', 'cha'],
    armorProficiencies: ['Light Armor'],
    weaponProficiencies: ['Simple Weapons'],
    skillChoices: {
      count: 2,
      options: ['Arcana', 'Deception', 'History', 'Intimidation', 'Investigation', 'Nature', 'Religion'],
    },
    weaponMasteriesCount: 0,
    spellcasting: {
      casterType: 'pact',
      ability: 'cha',
      cantripsKnown: 2,
      spellsPrepared: 2,
      spellList: ['Warlock'],
    },
    level1Features: [
      { name: 'Eldritch Invocations (1)', description: 'Gain 1 Eldritch Invocation at level 1 (e.g. Pact of the Blade, Pact of the Tome, Pact of the Chain, or Armor of Shadows).' },
      { name: 'Pact Magic', description: 'Cast warlock spells using Charisma. Your spell slots recharge on a Short or Long Rest and are always cast at the highest available slot level.' },
    ],
    subclasses: [
      { id: 'archfey', name: 'Archfey Patron', summary: 'Teleports across the battlefield with Misty Step triggers, unleashing fey charms.', features: ['Steps of the Fey', 'Misty Escape', 'Beguiling Defenses', 'Dark Delirium'] },
      { id: 'celestial', name: 'Celestial Patron', summary: 'Heals allies with a pool of d6 radiant energy and blasts foes with sacred fire.', features: ['Healing Light (d6 pool)', 'Radiant Soul', 'Celestial Resilience', 'Searing Vengeance'] },
      { id: 'fiend', name: 'Fiend Patron', summary: 'Gains temporary HP upon slaying foes, adding d10 to failed ability checks or saves.', features: ['Dark One\'s Blessing', 'Dark One\'s Own Luck (+1d10)', 'Fiendish Resilience', 'Hurl Through Hell'] },
      { id: 'great-old-one', name: 'Great Old One Patron', summary: 'Establishes telepathic bonds, creates psychic thralls, and reflects mind attacks.', features: ['Awakened Mind', 'Psychic Spells', 'Thought Shield', 'Create Thrall'] },
    ],
    icon: 'Eye',
    color: '#6366f1',
    description: 'A wielder of magic derived from a bargain with an otherworldly entity.',
  },
  {
    id: 'wizard',
    name: 'Wizard',
    hitDie: 6,
    primaryAbility: 'Intelligence',
    savingThrows: ['int', 'wis'],
    armorProficiencies: ['None'],
    weaponProficiencies: ['Simple Weapons'],
    skillChoices: {
      count: 2,
      options: ['Arcana', 'History', 'Insight', 'Investigation', 'Medicine', 'Religion'],
    },
    weaponMasteriesCount: 0,
    spellcasting: {
      casterType: 'full',
      ability: 'int',
      cantripsKnown: 3,
      spellsPrepared: 4,
      spellList: ['Wizard'],
    },
    level1Features: [
      { name: 'Spellcasting & Spellbook', description: 'Your spellbook contains 6 1st-level spells. Prepare 4 spells each day using Intelligence with an Arcane Focus. You can cast ritual spells without preparing them.' },
      { name: 'Arcane Recovery', description: 'Once per day during a Short Rest, recover expended spell slots with a combined level equal to half your wizard level (rounded up, min 1).' },
    ],
    subclasses: [
      { id: 'abjurer', name: 'Abjurer', summary: 'Creates an Arcane Ward that absorbs damage meant for you and nearby allies.', features: ['Arcane Ward', 'Projected Ward', 'Spell Breaker', 'Spell Resistance'] },
      { id: 'diviner', name: 'Diviner', summary: 'Foresees the future using Portent dice (2d20 rolled each day) to replace any d20 roll.', features: ['Portent (2d20)', 'Expert Divination', 'The Third Eye', 'Greater Portent'] },
      { id: 'evoker', name: 'Evoker', summary: 'Sculpts spells to keep allies safe in explosive blasts, boosting evocation damage.', features: ['Sculpt Spells', 'Potent Cantrip', 'Empowered Evocation', 'Overchannel'] },
      { id: 'illusionist', name: 'Illusionist', summary: 'Weaves tricky illusions, casting Minor Illusion as a bonus action and altering details.', features: ['Improved Illusions', 'Malleable Illusions', 'Illusory Self', 'Illusory Reality'] },
    ],
    icon: 'BookOpen',
    color: '#0284c7',
    description: 'A scholarly magic-user capable of manipulating reality through rigorous arcane study and a spellbook.',
  },
];

// --- 2024 BACKGROUNDS (16 BACKGROUNDS) ---
export const BACKGROUNDS_2024: BackgroundDefinition2024[] = [
  {
    id: 'acolyte',
    name: 'Acolyte',
    allowedAbilities: ['int', 'wis', 'cha'],
    originFeat: 'Magic Initiate (Cleric)',
    skills: ['Insight', 'Religion'],
    tools: 'Calligrapher\'s Supplies',
    equipmentPackage: {
      description: 'Holy Symbol, Prayer Book, Robe, Calligrapher\'s Supplies, 8 GP',
      items: ['Holy Symbol', 'Prayer Book', 'Robe', 'Calligrapher\'s Supplies'],
      gold: 8,
    },
    summary: 'Devoted service in a temple, shrine, or monastery learning holy rites and divine prayers.',
    description: 'You spent your formative years in the service of a temple, learning sacred rites, caring for holy grounds, and offering prayers to divine powers.',
  },
  {
    id: 'artisan',
    name: 'Artisan',
    allowedAbilities: ['str', 'dex', 'int'],
    originFeat: 'Crafter',
    skills: ['Investigation', 'Persuasion'],
    tools: 'One Artisan\'s Tools of choice',
    toolChoices: ['Smith\'s Tools', 'Carpenter\'s Tools', 'Leatherworker\'s Tools', 'Mason\'s Tools', 'Tinker\'s Tools', 'Weaver\'s Tools', 'Woodcarver\'s Tools'],
    equipmentPackage: {
      description: 'Artisan\'s Tools, Abacus, Pouch, Traveler\'s Clothes, 28 GP',
      items: ['Artisan\'s Tools', 'Abacus', 'Pouch', 'Traveler\'s Clothes'],
      gold: 28,
    },
    summary: 'Trained guild craftsman skilled in shaping stone, wood, metal, leather, or glass.',
    description: 'You apprenticed under a master craftsman, learning the fine trade of producing goods, negotiating with merchants, and building durable items.',
  },
  {
    id: 'charlatan',
    name: 'Charlatan',
    allowedAbilities: ['dex', 'con', 'cha'],
    originFeat: 'Skilled',
    skills: ['Deception', 'Sleight of Hand'],
    tools: 'Disguise Kit',
    equipmentPackage: {
      description: 'Disguise Kit, Fine Clothes, Costume, Pouch, 15 GP',
      items: ['Disguise Kit', 'Fine Clothes', 'Costume', 'Pouch'],
      gold: 15,
    },
    summary: 'Master of deceit, false identities, swindles, and sleight of hand tricks.',
    description: 'You have a knack for putting on false personas, reading people, and taking what you want through charm, deception, and confidence games.',
  },
  {
    id: 'criminal',
    name: 'Criminal',
    allowedAbilities: ['dex', 'con', 'int'],
    originFeat: 'Alert',
    skills: ['Deception', 'Stealth'],
    tools: 'Thieves\' Tools',
    equipmentPackage: {
      description: 'Thieves\' Tools, Crowbar, Pouch, 2 Daggers, Traveler\'s Clothes, 16 GP',
      items: ['Thieves\' Tools', 'Crowbar', 'Pouch', 'Dagger (2)', 'Traveler\'s Clothes'],
      gold: 16,
    },
    summary: 'Experienced operative of the underworld, skilled in lockpicking, stealth, and vigilance.',
    description: 'You lived on the wrong side of the law, navigating shadows, escaping town guards, and developing lightning-fast instincts.',
  },
  {
    id: 'entertainer',
    name: 'Entertainer',
    allowedAbilities: ['str', 'dex', 'cha'],
    originFeat: 'Musician',
    skills: ['Acrobatics', 'Performance'],
    tools: 'One Musical Instrument of choice',
    toolChoices: ['Lute', 'Flute', 'Viol', 'Drum', 'Dulcimer', 'Horn', 'Pan Flute'],
    equipmentPackage: {
      description: 'Musical Instrument, Costumes (2), Mirror, Perfume, 11 GP',
      items: ['Musical Instrument', 'Costume (2)', 'Steel Mirror', 'Perfume'],
      gold: 11,
    },
    summary: 'Born performer who knows how to captivate an audience with music, song, or tumbling.',
    description: 'You thrive in the spotlight, captivating taverns and noble halls with song, dance, poetry, and storytelling.',
  },
  {
    id: 'farmer',
    name: 'Farmer',
    allowedAbilities: ['str', 'con', 'wis'],
    originFeat: 'Tough',
    skills: ['Animal Handling', 'Nature'],
    tools: 'Carpenter\'s Tools',
    equipmentPackage: {
      description: 'Carpenter\'s Tools, Healer\'s Kit, Iron Pot, Shovel, 23 GP',
      items: ['Carpenter\'s Tools', 'Healer\'s Kit', 'Iron Pot', 'Shovel', 'Work Clothes'],
      gold: 23,
    },
    summary: 'Grew up working the land, weather-hardened and bonded with beasts of burden.',
    description: 'You grew up close to the soil, tilling fields, tending livestock, and developing a hearty constitution that shrugs off hardship.',
  },
  {
    id: 'guard',
    name: 'Guard',
    allowedAbilities: ['str', 'int', 'wis'],
    originFeat: 'Alert',
    skills: ['Athletics', 'Perception'],
    tools: 'One Gaming Set of choice',
    toolChoices: ['Dice Set', 'Dragonchess Set', 'Playing Card Set', 'Three-Dragon Ante Set'],
    equipmentPackage: {
      description: 'Gaming Set, Hooded Lantern, Manacles, Quiver, Spear, 12 GP',
      items: ['Gaming Set', 'Hooded Lantern', 'Manacles', 'Spear', 'Uniform'],
      gold: 12,
    },
    summary: 'Vigilant defender of town gates, castle walls, or noble estates trained to spot danger.',
    description: 'You walked the parapets and kept watch over town gates, trained to spot approaching trouble and stand firm in defense of the populace.',
  },
  {
    id: 'guide',
    name: 'Guide',
    allowedAbilities: ['dex', 'con', 'wis'],
    originFeat: 'Magic Initiate (Druid)',
    skills: ['Stealth', 'Survival'],
    tools: 'Cartographer\'s Tools',
    equipmentPackage: {
      description: 'Cartographer\'s Tools, Bedroll, Map Case, Tent, 3 GP',
      items: ['Cartographer\'s Tools', 'Bedroll', 'Map Case', 'Tent (2-person)', 'Traveler\'s Clothes'],
      gold: 3,
    },
    summary: 'Wilderness scout who leads travelers through trackless forests, mountains, and swamps.',
    description: 'You guided trade caravans, hunting parties, and explorers across perilous wilderness terrain where a wrong step meant death.',
  },
  {
    id: 'hermit',
    name: 'Hermit',
    allowedAbilities: ['con', 'wis', 'cha'],
    originFeat: 'Healer',
    skills: ['Medicine', 'Religion'],
    tools: 'Herbalism Kit',
    equipmentPackage: {
      description: 'Herbalism Kit, Bedroll, Philosophy Book, Lamp, Oil (3), 15 GP',
      items: ['Herbalism Kit', 'Bedroll', 'Philosophy Book', 'Lamp', 'Flask of Oil (3)'],
      gold: 15,
    },
    summary: 'Lived in seclusion contemplating spiritual mysteries and gathering curative herbs.',
    description: 'You retreated from bustling civilization to live in quiet contemplation, gathering herbs and unlocking deeper spiritual revelations.',
  },
  {
    id: 'merchant',
    name: 'Merchant',
    allowedAbilities: ['con', 'int', 'cha'],
    originFeat: 'Lucky',
    skills: ['Animal Handling', 'Persuasion'],
    tools: 'Navigator\'s Tools',
    equipmentPackage: {
      description: 'Navigator\'s Tools, Abacus, Pouch, Traveler\'s Clothes, 22 GP',
      items: ['Navigator\'s Tools', 'Abacus', 'Pouch', 'Fine Clothes', 'Merchant Scales'],
      gold: 22,
    },
    summary: 'Trader with caravans, ships, or shops who knows the value of goods and deals.',
    description: 'You managed trade caravans, haggled with vendors across city markets, and developed an uncanny sixth sense for golden opportunities.',
  },
  {
    id: 'noble',
    name: 'Noble',
    allowedAbilities: ['str', 'int', 'cha'],
    originFeat: 'Skilled',
    skills: ['History', 'Persuasion'],
    tools: 'One Gaming Set of choice',
    toolChoices: ['Dragonchess Set', 'Dice Set', 'Playing Card Set'],
    equipmentPackage: {
      description: 'Gaming Set, Fine Clothes, Perfume, Signet Ring, Pouch, 24 GP',
      items: ['Gaming Set', 'Fine Clothes', 'Perfume', 'Signet Ring', 'Pouch'],
      gold: 24,
    },
    summary: 'Born to high aristocracy, tutored in etiquette, heraldry, politics, and leadership.',
    description: 'You were raised in wealthy manors and grand estates, taught aristocratic manners, political negotiation, and how to command respect.',
  },
  {
    id: 'sage',
    name: 'Sage',
    allowedAbilities: ['con', 'int', 'wis'],
    originFeat: 'Magic Initiate (Wizard)',
    skills: ['Arcana', 'History'],
    tools: 'Calligrapher\'s Supplies',
    equipmentPackage: {
      description: 'Calligrapher\'s Supplies, Lore Book, Ink & Pen, Parchment (8), 8 GP',
      items: ['Calligrapher\'s Supplies', 'Book of Lore', 'Bottle of Ink', 'Ink Pen', 'Parchment (8)'],
      gold: 8,
    },
    summary: 'Scholar of ancient lore, libraries, and arcane manuscripts with a thirst for knowledge.',
    description: 'You dedicated years to dusty libraries and grand academies, unraveling ancient histories and the mysteries of the multiverse.',
  },
  {
    id: 'sailor',
    name: 'Sailor',
    allowedAbilities: ['str', 'dex', 'wis'],
    originFeat: 'Tavern Brawler',
    skills: ['Acrobatics', 'Athletics'],
    tools: 'Navigator\'s Tools',
    equipmentPackage: {
      description: 'Navigator\'s Tools, Dagger, Rope (50 ft), Traveler\'s Clothes, 10 GP',
      items: ['Navigator\'s Tools', 'Dagger', 'Silk Rope (50 ft)', 'Traveler\'s Clothes'],
      gold: 10,
    },
    summary: 'Hardened seafarer accustomed to storms, rigging, sea monsters, and tavern brawls.',
    description: 'You weathered storms on the high seas, hauling rigging, dodging kraken tentacles, and holding your own in portside brawls.',
  },
  {
    id: 'scribe',
    name: 'Scribe',
    allowedAbilities: ['dex', 'int', 'wis'],
    originFeat: 'Skilled',
    skills: ['Investigation', 'Perception'],
    tools: 'Calligrapher\'s Supplies',
    equipmentPackage: {
      description: 'Calligrapher\'s Supplies, Blank Book, Fine Clothes, Ink & Pen, 8 GP',
      items: ['Calligrapher\'s Supplies', 'Blank Book', 'Fine Clothes', 'Bottle of Ink', 'Ink Pen'],
      gold: 8,
    },
    summary: 'Professional clerk who records legal documents, scrolls, treaties, and historical records.',
    description: 'You spent long days carefully transcribing decrees, treaties, and arcane scrolls, training your eye to catch the finest discrepancies.',
  },
  {
    id: 'soldier',
    name: 'Soldier',
    allowedAbilities: ['str', 'dex', 'con'],
    originFeat: 'Savage Attacker',
    skills: ['Athletics', 'Intimidation'],
    tools: 'One Gaming Set of choice',
    toolChoices: ['Dice Set', 'Playing Card Set'],
    equipmentPackage: {
      description: 'Gaming Set, Healer\'s Kit, Quiver, Traveler\'s Clothes, 14 GP',
      items: ['Gaming Set', 'Healer\'s Kit', 'Quiver', 'Traveler\'s Clothes', 'Rank Insignia'],
      gold: 14,
    },
    summary: 'Trained veteran of army campaigns, shield walls, battlefields, and military discipline.',
    description: 'You trained with an organized army or mercenary regiment, learning teamwork in the shield wall, weapon discipline, and military endurance.',
  },
  {
    id: 'wayfarer',
    name: 'Wayfarer',
    allowedAbilities: ['dex', 'wis', 'cha'],
    originFeat: 'Lucky',
    skills: ['Insight', 'Stealth'],
    tools: 'Thieves\' Tools',
    equipmentPackage: {
      description: 'Thieves\' Tools, Bedroll, 2 Daggers, Pouch, Traveler\'s Clothes, 16 GP',
      items: ['Thieves\' Tools', 'Bedroll', 'Dagger (2)', 'Pouch', 'Traveler\'s Clothes'],
      gold: 16,
    },
    summary: 'Street urchin and wanderer who grew up surviving in dark alleys and busy markets.',
    description: 'You grew up on the city streets with no guardian, surviving by your wits, agility, and keen instincts for avoiding danger.',
  },
];

// --- 2024 SPECIES (10 SPECIES) ---
export const SPECIES_2024: SpeciesDefinition2024[] = [
  {
    id: 'aasimar',
    name: 'Aasimar',
    size: 'Medium or Small',
    speed: 30,
    vision: 'Darkvision 60 ft',
    traits: [
      { name: 'Celestial Resistance', description: 'You have resistance to Necrotic damage and Radiant damage.' },
      { name: 'Healing Hands', description: 'As an Action, you touch a creature and restore hit points equal to your Proficiency Bonus (1 use per Long Rest).' },
      { name: 'Light Bearer', description: 'You know the Light cantrip. Charisma is your spellcasting ability for it.' },
      { name: 'Celestial Revelation', description: 'At level 3, transform for 1 minute (Heavenly Wings fly speed, Inner Radiance radiant damage, or Necrotic Shroud fear).' },
    ],
    summary: 'Mortals carrying a spark of the Upper Planes, able to unleash angelic wings or radiant halos.',
    description: 'Aasimar bear the legacy of celestials, touched by angelic grace and righteous light in their bloodline.',
  },
  {
    id: 'dragonborn',
    name: 'Dragonborn',
    size: 'Medium',
    speed: 30,
    vision: 'Darkvision 60 ft',
    traits: [
      { name: 'Breath Weapon', description: 'Exhale destructive energy in a 15-ft cone or 30-ft line (1d10 damage at level 1). Replaces one attack in the Attack action (PB uses per Long Rest).' },
      { name: 'Damage Resistance', description: 'You have resistance to the damage type associated with your Draconic Ancestry.' },
      { name: 'Draconic Flight', description: 'At level 5, sprout spectral dragon wings for 10 minutes, gaining a fly speed equal to your speed (1 use per Long Rest).' },
    ],
    ancestralChoices: {
      title: 'Draconic Ancestry',
      options: [
        { id: 'black', name: 'Black (Acid - 30 ft Line)', description: 'Acid damage resistance and 30-ft line breath weapon.' },
        { id: 'blue', name: 'Blue (Lightning - 30 ft Line)', description: 'Lightning damage resistance and 30-ft line breath weapon.' },
        { id: 'brass', name: 'Brass (Fire - 30 ft Line)', description: 'Fire damage resistance and 30-ft line breath weapon.' },
        { id: 'bronze', name: 'Bronze (Lightning - 30 ft Line)', description: 'Lightning damage resistance and 30-ft line breath weapon.' },
        { id: 'copper', name: 'Copper (Acid - 30 ft Line)', description: 'Acid damage resistance and 30-ft line breath weapon.' },
        { id: 'gold', name: 'Gold (Fire - 15 ft Cone)', description: 'Fire damage resistance and 15-ft cone breath weapon.' },
        { id: 'green', name: 'Green (Poison - 15 ft Cone)', description: 'Poison damage resistance and 15-ft cone breath weapon.' },
        { id: 'red', name: 'Red (Fire - 15 ft Cone)', description: 'Fire damage resistance and 15-ft cone breath weapon.' },
        { id: 'silver', name: 'Silver (Cold - 15 ft Cone)', description: 'Cold damage resistance and 15-ft cone breath weapon.' },
        { id: 'white', name: 'White (Cold - 15 ft Cone)', description: 'Cold damage resistance and 15-ft cone breath weapon.' },
      ],
    },
    summary: 'Proud humanoids with draconic heritage, breathing destructive elemental energy.',
    description: 'Born of dragons, dragonborn walk proudly through a multiverse that often greets them with fear and respect.',
  },
  {
    id: 'dwarf',
    name: 'Dwarf',
    size: 'Medium',
    speed: 30,
    vision: 'Darkvision 120 ft',
    extraHpPerLevel: 1,
    traits: [
      { name: 'Dwarven Resilience', description: 'You have Advantage on saving throws against Poison and resistance to Poison damage.' },
      { name: 'Dwarven Toughness', description: 'Your hit point maximum increases by 1 for each level you possess (including level 1).' },
      { name: 'Stonecunning', description: 'As a bonus action on stone, gain Tremorsense 60 ft for 10 minutes (PB uses per Long Rest).' },
    ],
    summary: 'Stout, resilient heroes of mountain holds and underground deeps, renowned for craftsmanship.',
    description: 'Dwarves are renowned for their stonecraft, resilience, and unyielding fortitude in defense of their clan and halls.',
  },
  {
    id: 'elf',
    name: 'Elf',
    size: 'Medium',
    speed: 30,
    vision: 'Darkvision 60 ft (120 ft Drow)',
    traits: [
      { name: 'Fey Ancestry', description: 'You have Advantage on saving throws against being Charmed, and magic cannot put you to sleep.' },
      { name: 'Keen Senses', description: 'You gain proficiency in your choice of Insight, Perception, or Survival.' },
      { name: 'Trance', description: 'You don\'t need to sleep. You gain the benefits of a Long Rest in 4 hours of meditative trance.' },
    ],
    lineages: [
      { id: 'drow', name: 'Drow (Dark Elf)', description: '120 ft Darkvision. You know the Dancing Lights cantrip, Faerie Fire at level 3, and Darkness at level 5.', bonusSpells: ['Dancing Lights'] },
      { id: 'high-elf', name: 'High Elf', description: 'You know the Prestidigitation cantrip (swap after long rest), Detect Magic at level 3, and Misty Step at level 5.', bonusSpells: ['Prestidigitation'] },
      { id: 'wood-elf', name: 'Wood Elf', description: 'Your speed increases to 35 feet. You know the Druidcraft cantrip, Longstrider at level 3, and Pass Without Trace at level 5.', bonusSpells: ['Druidcraft'] },
    ],
    summary: 'Graceful beings connected to the Feywild with magical bloodlines and keen senses.',
    description: 'Elves are magical humanoids with long lifespans, keen perception, and natural grace tied to the enchanted Feywild.',
  },
  {
    id: 'gnome',
    name: 'Gnome',
    size: 'Small',
    speed: 30,
    vision: 'Darkvision 60 ft',
    traits: [
      { name: 'Gnomish Cunning', description: 'You have Advantage on all Intelligence, Wisdom, and Charisma saving throws.' },
    ],
    lineages: [
      { id: 'forest-gnome', name: 'Forest Gnome', description: 'You know the Minor Illusion cantrip and can Speak with Small Beasts (rodents, birds, badgers).', bonusSpells: ['Minor Illusion'] },
      { id: 'rock-gnome', name: 'Rock Gnome', description: 'You know the Mending and Prestidigitation cantrips and can craft clockwork tinkering devices.', bonusSpells: ['Mending', 'Prestidigitation'] },
    ],
    summary: 'Curious, inventive humanoids who thrive on wonder, arcane tinkering, and boundless enthusiasm.',
    description: 'Gnomes are bright, enthusiastic tinkerers and nature-lovers whose small stature belies their boundless ingenuity.',
  },
  {
    id: 'goliath',
    name: 'Goliath',
    size: 'Medium',
    speed: 35,
    vision: 'Darkvision 60 ft',
    traits: [
      { name: 'Powerful Build', description: 'You count as one size larger when determining your carrying capacity and the weight you can push, drag, or lift.' },
      { name: 'Large Form', description: 'At level 5, as a bonus action turn Large for 10 minutes: +10 ft speed and Advantage on Strength checks (1 use per Long Rest).' },
    ],
    ancestralChoices: {
      title: 'Giant Ancestry',
      options: [
        { id: 'cloud', name: 'Cloud\'s Jaunt (Teleport 30 ft)', description: 'As a bonus action, magically teleport up to 30 feet to an unoccupied space you can see (PB uses/LR).' },
        { id: 'fire', name: 'Fire\'s Burn (+1d10 Fire)', description: 'When you hit with an attack, deal an extra 1d10 fire damage (PB uses/LR).' },
        { id: 'frost', name: 'Frost\'s Chill (+1d6 Cold & Slow 10 ft)', description: 'When you hit with an attack, deal 1d6 cold damage and reduce target speed by 10 ft (PB uses/LR).' },
        { id: 'hill', name: 'Hill\'s Tumble (Knock Prone)', description: 'When you hit a Large or smaller creature, knock it Prone without a saving throw (PB uses/LR).' },
        { id: 'stone', name: 'Stone\'s Endurance (Reduce dmg by 1d12+Con)', description: 'When you take damage, use your reaction to reduce the damage by 1d12 + Constitution modifier (PB uses/LR).' },
        { id: 'storm', name: 'Storm\'s Thunder (Reaction 1d8 Thunder)', description: 'When you take damage from a creature within 60 ft, use reaction to deal 1d8 thunder damage to it (PB uses/LR).' },
      ],
    },
    summary: 'Towering wanderers infused with the supernatural strength and primal essence of giants.',
    description: 'Goliaths carry the bloodline of ancient giants, towering over their companions with immense strength and elemental gifts.',
  },
  {
    id: 'halfling',
    name: 'Halfling',
    size: 'Small',
    speed: 30,
    vision: 'Normal',
    traits: [
      { name: 'Brave', description: 'You have Advantage on saving throws against being Frightened.' },
      { name: 'Halfling Nimbleness', description: 'You can move through the space of any creature that is a size larger than yours.' },
      { name: 'Luck', description: 'When you roll a 1 on the d20 for an attack roll, ability check, or saving throw, you can reroll the die and must use the new roll.' },
      { name: 'Naturally Stealthy', description: 'You can attempt to hide even when obscured only by a creature that is at least one size larger than you.' },
    ],
    summary: 'Resourceful, good-natured folk known for unbelievable luck and surprising courage.',
    description: 'Halflings are cheerful, communal folk who prize comfort and peace, yet display astonishing courage and luck in adversity.',
  },
  {
    id: 'human',
    name: 'Human',
    size: 'Medium or Small',
    speed: 30,
    vision: 'Normal',
    hasExtraFeat: true,
    hasExtraSkill: true,
    traits: [
      { name: 'Resourceful', description: 'You gain Heroic Inspiration whenever you finish a Long Rest.' },
      { name: 'Skillful', description: 'You gain proficiency in one extra skill of your choice.' },
      { name: 'Versatile', description: 'You gain one extra Origin Feat of your choice.' },
    ],
    summary: 'Adaptable and ambitious innovators who build sprawling civilizations across the multiverse.',
    description: 'Humans are the most adaptable, varied, and ambitious mortals in the multiverse, driven by an insatiable hunger for discovery.',
  },
  {
    id: 'orc',
    name: 'Orc',
    size: 'Medium',
    speed: 30,
    vision: 'Darkvision 120 ft',
    traits: [
      { name: 'Adrenaline Rush', description: 'Take the Dash action as a bonus action, gaining temporary hit points equal to your Proficiency Bonus (PB uses per Long Rest).' },
      { name: 'Relentless Endurance', description: 'When you are reduced to 0 hit points but not killed outright, you can drop to 1 hit point instead (1 use per Long Rest).' },
    ],
    summary: 'Fierce and determined champions blessed with endurance and unstoppable momentum in battle.',
    description: 'Blessed by deities of strength and endurance, orcs are unstoppable warriors whose vitality shines brightest in combat.',
  },
  {
    id: 'tiefling',
    name: 'Tiefling',
    size: 'Medium or Small',
    speed: 30,
    vision: 'Darkvision 60 ft',
    traits: [
      { name: 'Otherworldly Presence', description: 'You know the Thaumaturgy cantrip. Charisma is your spellcasting ability for it.' },
    ],
    lineages: [
      { id: 'abyssal', name: 'Abyssal', description: 'Poison damage resistance. You know Poison Spray, Ray of Sickness at level 3, and Hold Person at level 5.', bonusSpells: ['Poison Spray'] },
      { id: 'chthonic', name: 'Chthonic', description: 'Necrotic damage resistance. You know Chill Touch, False Life at level 3, and Ray of Enfeeblement at level 5.', bonusSpells: ['Chill Touch'] },
      { id: 'infernal', name: 'Infernal', description: 'Fire damage resistance. You know Fire Bolt, Hellish Rebuke at level 3, and Darkness at level 5.', bonusSpells: ['Fire Bolt'] },
    ],
    summary: 'Bearers of fiendish ancestry who channel supernatural fire, shadows, or eldritch magic.',
    description: 'Tieflings carry the supernatural heritage of the Lower Planes, manifesting horns, unusual eyes, and fiendish spells.',
  },
];

// --- POINT BUY COSTS ---
export const POINT_BUY_COSTS: Record<number, number> = {
  8: 0,
  9: 1,
  10: 2,
  11: 3,
  12: 4,
  13: 5,
  14: 7,
  15: 9,
};

export const STANDARD_ARRAY_SCORES = [15, 14, 13, 12, 10, 8];

// --- STATS / MODIFIERS CALCULATION ---
export function calculateModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function formatModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

export function calculatePointBuyRemaining(scores: AbilityScores): number {
  let spent = 0;
  const keys: AbilityKey[] = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
  for (const k of keys) {
    const val = scores[k];
    spent += POINT_BUY_COSTS[val] ?? 0;
  }
  return 27 - spent;
}

export function roll4d6DropLowest(): { total: number; rolls: number[]; dropped: number } {
  const rolls = [
    Math.floor(Math.random() * 6) + 1,
    Math.floor(Math.random() * 6) + 1,
    Math.floor(Math.random() * 6) + 1,
    Math.floor(Math.random() * 6) + 1,
  ];
  rolls.sort((a, b) => a - b);
  const dropped = rolls[0];
  const kept = rolls.slice(1);
  const total = kept.reduce((acc, v) => acc + v, 0);
  return { total, rolls, dropped };
}

export function rollFullAbilitySet(): { scores: AbilityScores; breakdown: { rolls: number[]; dropped: number; total: number }[] } {
  const breakdown = [];
  const results = [];
  for (let i = 0; i < 6; i++) {
    const r = roll4d6DropLowest();
    breakdown.push(r);
    results.push(r.total);
  }
  results.sort((a, b) => b - a);
  return {
    scores: {
      str: results[0],
      dex: results[1],
      con: results[2],
      int: results[3],
      wis: results[4],
      cha: results[5],
    },
    breakdown,
  };
}

// --- INITIAL / DEFAULT CREATION STATE ---
export function getInitialCharacterState(): CharacterCreationState {
  return {
    characterName: '',
    playerName: '',
    avatarUrl: '',
    tokenUrl: '',
    level: 1,
    alignment: 'Neutral Good',

    // Class
    selectedClassId: 'fighter',
    selectedSubclassId: 'champion',
    classSkillChoices: ['Athletics', 'Perception'],
    selectedOrderOrStyle: 'Defense',

    // Origin
    selectedBackgroundId: 'soldier',
    selectedBackgroundTool: 'Dice Set',
    selectedSpeciesId: 'human',
    selectedLineageId: undefined,
    selectedAncestralChoiceId: undefined,
    selectedSize: 'Medium',
    selectedLanguages: ['Common', 'Dwarvish', 'Elvish'],
    humanExtraFeat: 'Alert',
    humanExtraSkill: 'Intimidation',

    // Ability Scores
    abilityMethod: 'standard',
    baseScores: { str: 15, dex: 14, con: 13, int: 10, wis: 12, cha: 8 },
    backgroundBonusType: '+2/+1',
    backgroundBonusAssignment: { str: 2, con: 1 },

    // Features / Spells / Masteries
    selectedWeaponMasteries: ['longsword', 'shortsword', 'heavy-crossbow'],
    selectedCantrips: [],
    selectedSpells: [],

    // Equipment & Backstory
    equipmentMode: 'package',
    startingGold: 10,
    inventory: ['Chain Mail', 'Longsword', 'Shield', 'Heavy Crossbow', '20 Crossbow Bolts', 'Backpack', 'Bedroll', 'Mess Kit', 'Rations (10 days)', '50 ft Hemp Rope'],
    equippedArmor: 'chain-mail',
    equippedShield: true,
    backstory: '',
    personalityTraits: '',
    ideals: '',
    bonds: '',
    flaws: '',
    physical: {
      gender: '',
      age: '',
      height: '',
      weight: '',
      eyes: '',
      hair: '',
      skin: '',
    },
  };
}

// --- DERIVED STATS ENGINE ---
export function calculateDerivedStats(state: CharacterCreationState): DerivedCharacterStats {
  const cls = CLASSES_2024.find((c) => c.id === state.selectedClassId) || CLASSES_2024[0];
  const bg = BACKGROUNDS_2024.find((b) => b.id === state.selectedBackgroundId) || BACKGROUNDS_2024[0];
  const species = SPECIES_2024.find((s) => s.id === state.selectedSpeciesId) || SPECIES_2024[0];

  const pb = 2; // Level 1 Proficiency Bonus

  // Compute final ability scores
  const finalScores: AbilityScores = {
    str: state.baseScores.str + (state.backgroundBonusAssignment.str || 0),
    dex: state.baseScores.dex + (state.backgroundBonusAssignment.dex || 0),
    con: state.baseScores.con + (state.backgroundBonusAssignment.con || 0),
    int: state.baseScores.int + (state.backgroundBonusAssignment.int || 0),
    wis: state.baseScores.wis + (state.backgroundBonusAssignment.wis || 0),
    cha: state.baseScores.cha + (state.backgroundBonusAssignment.cha || 0),
  };

  const modifiers: Record<AbilityKey, number> = {
    str: calculateModifier(finalScores.str),
    dex: calculateModifier(finalScores.dex),
    con: calculateModifier(finalScores.con),
    int: calculateModifier(finalScores.int),
    wis: calculateModifier(finalScores.wis),
    cha: calculateModifier(finalScores.cha),
  };

  // Check Feats
  const hasAlert = bg.originFeat.includes('Alert') || state.humanExtraFeat === 'Alert';
  const hasTough = bg.originFeat.includes('Tough') || state.humanExtraFeat === 'Tough';
  const isDwarf = species.id === 'dwarf';
  const isWoodElf = state.selectedSpeciesId === 'elf' && state.selectedLineageId === 'wood-elf';

  // HP Calculation
  let bonusHp = 0;
  if (isDwarf) bonusHp += 1;
  if (hasTough) bonusHp += 2;
  const maxHp = Math.max(1, cls.hitDie + modifiers.con + bonusHp);

  // Speed
  let speedVal = species.speed;
  if (isWoodElf) speedVal = 35;
  const speed = `${speedVal} ft.`;

  // Initiative
  const initiativeBonus = modifiers.dex + (hasAlert ? pb : 0);

  // Saving Throws
  const savingThrows: Record<AbilityKey, { modifier: number; proficient: boolean }> = {
    str: { proficient: cls.savingThrows.includes('str'), modifier: modifiers.str + (cls.savingThrows.includes('str') ? pb : 0) },
    dex: { proficient: cls.savingThrows.includes('dex'), modifier: modifiers.dex + (cls.savingThrows.includes('dex') ? pb : 0) },
    con: { proficient: cls.savingThrows.includes('con'), modifier: modifiers.con + (cls.savingThrows.includes('con') ? pb : 0) },
    int: { proficient: cls.savingThrows.includes('int'), modifier: modifiers.int + (cls.savingThrows.includes('int') ? pb : 0) },
    wis: { proficient: cls.savingThrows.includes('wis'), modifier: modifiers.wis + (cls.savingThrows.includes('wis') ? pb : 0) },
    cha: { proficient: cls.savingThrows.includes('cha'), modifier: modifiers.cha + (cls.savingThrows.includes('cha') ? pb : 0) },
  };

  // Collect All Proficient Skills
  const proficientSkillsSet = new Set<string>();
  // From Background
  bg.skills.forEach((s) => proficientSkillsSet.add(s));
  // From Class
  state.classSkillChoices.forEach((s) => proficientSkillsSet.add(s));
  // From Human
  if (state.humanExtraSkill) proficientSkillsSet.add(state.humanExtraSkill);
  // From Skilled feat
  if (bg.originFeat.includes('Skilled') || state.humanExtraFeat === 'Skilled') {
    state.originFeatChoices?.skills?.forEach((s) => proficientSkillsSet.add(s));
  }

  // Skills breakdown
  const skills: Record<string, { ability: AbilityKey; modifier: number; proficient: boolean; expertise?: boolean }> = {};
  for (const def of SKILL_DEFINITIONS) {
    const isProf = proficientSkillsSet.has(def.name);
    const mod = modifiers[def.ability] + (isProf ? pb : 0);
    skills[def.name] = {
      ability: def.ability,
      modifier: mod,
      proficient: isProf,
    };
  }

  // Passive Scores
  const percMod = skills['Perception']?.modifier ?? modifiers.wis;
  const invMod = skills['Investigation']?.modifier ?? modifiers.int;
  const insMod = skills['Insight']?.modifier ?? modifiers.wis;

  const passivePerception = 10 + percMod;
  const passiveInvestigation = 10 + invMod;
  const passiveInsight = 10 + insMod;

  // Armor Class Calculation
  let baseAc = 10;
  let acBreakdown = '10 + Dex';
  const equippedArmorObj = ARMOR_2024.find((a) => a.id === state.equippedArmor);

  if (equippedArmorObj) {
    if (equippedArmorObj.category === 'Light') {
      baseAc = equippedArmorObj.baseAc + modifiers.dex;
      acBreakdown = `${equippedArmorObj.name} (${equippedArmorObj.baseAc}) + Dex (${modifiers.dex})`;
    } else if (equippedArmorObj.category === 'Medium') {
      const cappedDex = Math.min(2, modifiers.dex);
      baseAc = equippedArmorObj.baseAc + cappedDex;
      acBreakdown = `${equippedArmorObj.name} (${equippedArmorObj.baseAc}) + Dex max 2 (${cappedDex})`;
    } else if (equippedArmorObj.category === 'Heavy') {
      baseAc = equippedArmorObj.baseAc;
      acBreakdown = `${equippedArmorObj.name} (${equippedArmorObj.baseAc})`;
    }
  } else {
    // Unarmored Formulas
    if (cls.id === 'barbarian') {
      baseAc = 10 + modifiers.dex + modifiers.con;
      acBreakdown = `Unarmored Defense (10 + Dex ${modifiers.dex} + Con ${modifiers.con})`;
    } else if (cls.id === 'monk' && !state.equippedShield) {
      baseAc = 10 + modifiers.dex + modifiers.wis;
      acBreakdown = `Unarmored Defense (10 + Dex ${modifiers.dex} + Wis ${modifiers.wis})`;
    } else {
      baseAc = 10 + modifiers.dex;
      acBreakdown = `Unarmored (10 + Dex ${modifiers.dex})`;
    }
  }

  if (state.equippedShield) {
    baseAc += 2;
    acBreakdown += ' + Shield (+2)';
  }

  // Fighting Style Defense bonus (+1 AC while wearing armor)
  if (state.selectedOrderOrStyle === 'Defense' && state.equippedArmor) {
    baseAc += 1;
    acBreakdown += ' + Defense Style (+1)';
  }

  const armorClass = baseAc;

  // Spellcasting metrics
  let spellSaveDc: number | undefined;
  let spellAttackBonus: number | undefined;
  let spellCastingAbility: AbilityKey | undefined;
  const spellSlots: SpellSlotTracker[] = [];

  if (cls.spellcasting) {
    spellCastingAbility = cls.spellcasting.ability;
    const castMod = modifiers[spellCastingAbility];
    spellSaveDc = 8 + pb + castMod;
    spellAttackBonus = pb + castMod;

    if (cls.spellcasting.casterType === 'full') {
      spellSlots.push({ level: 1, total: 2, used: 0 });
    } else if (cls.spellcasting.casterType === 'pact') {
      spellSlots.push({ level: 1, total: 1, used: 0 });
    } else if (cls.spellcasting.casterType === 'half') {
      spellSlots.push({ level: 1, total: 2, used: 0 });
    }
  }

  // Weapon Attacks
  const weaponAttacks = (state.selectedWeaponMasteries || []).map((wId) => {
    const weapon = WEAPONS_2024.find((w) => w.id === wId || w.name.toLowerCase() === wId.toLowerCase());
    if (!weapon) {
      return {
        weaponName: wId,
        attackBonus: modifiers.str + pb,
        damageFormula: `1d6 ${formatModifier(modifiers.str)}`,
      };
    }

    const isFinesse = weapon.properties.includes('Finesse');
    const isRanged = weapon.rangeType === 'Ranged';
    const useDex = isRanged || (isFinesse && modifiers.dex > modifiers.str);
    const mod = useDex ? modifiers.dex : modifiers.str;
    const atk = mod + pb;

    return {
      weaponName: weapon.name,
      attackBonus: atk,
      damageFormula: `${weapon.damage} ${formatModifier(mod)} ${weapon.damageType}`,
      masteryProperty: weapon.masteryProperty,
      range: weapon.properties.find((p) => p.includes('Thrown') || p.includes('Ammunition')) || '5 ft.',
    };
  });

  return {
    maxHp,
    armorClass,
    armorClassBreakdown: acBreakdown,
    initiativeBonus,
    speed,
    proficiencyBonus: pb,
    finalScores,
    modifiers,
    savingThrows,
    skills,
    passivePerception,
    passiveInvestigation,
    passiveInsight,
    spellSaveDc,
    spellAttackBonus,
    spellCastingAbility,
    spellSlots,
    weaponAttacks,
  };
}

// --- CONVERT CREATION STATE TO FULL PlayerEntity ---
export function createPlayerEntityFromState(
  state: CharacterCreationState,
  campaignId?: string,
  existingId?: string
): PlayerEntity {
  const derived = calculateDerivedStats(state);
  const cls = CLASSES_2024.find((c) => c.id === state.selectedClassId) || CLASSES_2024[0];
  const bg = BACKGROUNDS_2024.find((b) => b.id === state.selectedBackgroundId) || BACKGROUNDS_2024[0];
  const species = SPECIES_2024.find((s) => s.id === state.selectedSpeciesId) || SPECIES_2024[0];

  const now = new Date().toISOString();
  const id = existingId || `player-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

  // Collect feats
  const featsList: string[] = [bg.originFeat];
  if (state.humanExtraFeat) featsList.push(state.humanExtraFeat);
  if (state.selectedOrderOrStyle && state.selectedOrderOrStyle.includes('Style')) {
    featsList.push(`Fighting Style: ${state.selectedOrderOrStyle}`);
  }

  // Collect masteries
  const masteriesList = state.selectedWeaponMasteries.map((wId) => {
    const weapon = WEAPONS_2024.find((w) => w.id === wId);
    return weapon ? `${weapon.name} (${weapon.masteryProperty})` : wId;
  });

  // Collect proficiencies
  const profSkills = Object.entries(derived.skills)
    .filter(([_, v]) => v.proficient)
    .map(([k]) => k);

  const subclassName = cls.subclasses.find((s) => s.id === state.selectedSubclassId)?.name;
  const characterClassLabel = subclassName ? `${cls.name} (${subclassName})` : cls.name;

  return {
    id,
    type: 'player',
    name: state.characterName.trim() || 'Hero Adventurer',
    playerName: state.playerName.trim() || undefined,
    characterClass: characterClassLabel,
    race: species.name,
    level: 1,
    armorClass: derived.armorClass,
    maxHp: derived.maxHp,
    currentHp: derived.maxHp,
    tempHp: 0,
    speed: derived.speed,
    initiativeBonus: derived.initiativeBonus,
    abilities: derived.finalScores,
    passivePerception: derived.passivePerception,
    passiveInvestigation: derived.passiveInvestigation,
    passiveInsight: derived.passiveInsight,
    spellSaveDc: derived.spellSaveDc,
    spellSlots: derived.spellSlots,
    deathSaves: { successes: 0, failures: 0 },
    avatarUrl: state.avatarUrl || undefined,
    tokenUrl: state.tokenUrl || undefined,
    notes: state.backstory || state.inventory.join(', ') || undefined,
    campaignId,
    createdAt: now,
    updatedAt: now,

    // 2024 Extended Details
    background: bg.name,
    species: species.name,
    lineage: state.selectedLineageId,
    originFeat: bg.originFeat,
    feats: featsList,
    weaponMasteries: masteriesList,
    proficiencies: {
      savingThrows: cls.savingThrows.map((s) => s.toUpperCase()),
      skills: profSkills,
      weapons: cls.weaponProficiencies,
      armor: cls.armorProficiencies,
      tools: [bg.tools, state.selectedBackgroundTool].filter(Boolean) as string[],
      languages: state.selectedLanguages,
    },
    cantrips: state.selectedCantrips,
    spellsKnown: state.selectedSpells,
    alignment: state.alignment,
    backstory: state.backstory,
    personalityTraits: state.personalityTraits,
    ideals: state.ideals,
    bonds: state.bonds,
    flaws: state.flaws,
    equippedArmor: state.equippedArmor,
    equippedShield: state.equippedShield,
  };
}

// --- PRESET ARCHETYPES FOR QUICK RANDOMIZATION / TESTING ---
export const PRESET_ARCHETYPES = [
  {
    name: 'Devoted Paladin of Justice',
    characterName: 'Valeria Brightshield',
    classId: 'paladin',
    backgroundId: 'noble',
    speciesId: 'human',
    alignment: 'Lawful Good',
    scores: { str: 15, dex: 10, con: 14, int: 8, wis: 12, cha: 13 },
    bgBonus: { str: 2, cha: 1 },
    masteries: ['longsword', 'warhammer'],
    armor: 'chain-mail',
    shield: true,
  },
  {
    name: 'Shadow Infiltrator Rogue',
    characterName: 'Shadowstep Lyra',
    classId: 'rogue',
    backgroundId: 'criminal',
    speciesId: 'elf',
    lineageId: 'drow',
    alignment: 'Chaotic Good',
    scores: { str: 8, dex: 15, con: 14, int: 13, wis: 12, cha: 10 },
    bgBonus: { dex: 2, int: 1 },
    masteries: ['rapier', 'shortsword'],
    armor: 'leather-armor',
    shield: false,
  },
  {
    name: 'Mountain Berserker',
    characterName: 'Thorin Bloodaxe',
    classId: 'barbarian',
    backgroundId: 'soldier',
    speciesId: 'dwarf',
    alignment: 'Chaotic Good',
    scores: { str: 15, dex: 14, con: 14, int: 8, wis: 12, cha: 8 },
    bgBonus: { str: 2, con: 1 },
    masteries: ['greataxe', 'handaxe'],
    armor: 'scale-mail',
    shield: false,
  },
  {
    name: 'Archmage Prodigy Wizard',
    characterName: 'Alden Farstrider',
    classId: 'wizard',
    backgroundId: 'sage',
    speciesId: 'gnome',
    lineageId: 'rock-gnome',
    alignment: 'Neutral Good',
    scores: { str: 8, dex: 14, con: 13, int: 15, wis: 12, cha: 10 },
    bgBonus: { int: 2, con: 1 },
    masteries: ['quarterstaff'],
    armor: undefined,
    shield: false,
    cantrips: ['Fire Bolt', 'Mage Hand', 'Minor Illusion'],
    spells: ['Magic Missile', 'Shield', 'Sleep', 'Detect Magic'],
  },
];
