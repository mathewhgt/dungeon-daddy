import { AbilityScores, MonsterAction, MonsterEntity, MonsterTrait } from '../types/monster';

export type NpcAncestry = 
  | 'human'
  | 'elf'
  | 'dwarf'
  | 'halfling'
  | 'dragonborn'
  | 'tiefling'
  | 'gnome'
  | 'half-orc'
  | 'half-elf'
  | 'goliath'
  | 'tabaxi'
  | 'goblinoid';

export type NpcArchetype =
  | 'commoner'
  | 'merchant'
  | 'tavern-keeper'
  | 'noble'
  | 'scholar'
  | 'guard'
  | 'thug'
  | 'rogue'
  | 'assassin'
  | 'bounty-hunter'
  | 'knight'
  | 'veteran'
  | 'apprentice-mage'
  | 'mage'
  | 'priest'
  | 'druid'
  | 'cultist'
  | 'archmage'
  | 'warlord';

export type NpcThreatTier = 'cr-0' | 'cr-1/8' | 'cr-1/4' | 'cr-1/2' | 'cr-1' | 'cr-2' | 'cr-3' | 'cr-5' | 'cr-6' | 'cr-8' | 'cr-12';

export type NpcPersonalityTone = 
  | 'friendly'
  | 'suspicious'
  | 'eccentric'
  | 'grim'
  | 'snobbish'
  | 'anxious'
  | 'boisterous'
  | 'mysterious'
  | 'stoic';

export interface NpcGeneratorOptions {
  ancestry?: NpcAncestry | 'random';
  gender?: 'male' | 'female' | 'non-binary' | 'random';
  archetype?: NpcArchetype | 'random';
  threatTier?: NpcThreatTier | 'random';
  personalityTone?: NpcPersonalityTone | 'random';
  alignment?: string | 'random';
}

export interface GeneratedNpcStory {
  appearance: string;
  distinctiveFeature: string;
  clothingStyle: string;
  scentOrVoice: string;
  personalityQuirk: string;
  coreMotivation: string;
  secretOrPlotHook: string;
  backstory: string;
}

export interface GeneratedNpc {
  id: string;
  name: string;
  title: string;
  ancestry: string;
  gender: string;
  archetype: string;
  alignment: string;
  threatTier: string;
  personalityTone: string;
  story: GeneratedNpcStory;
  statBlock: MonsterEntity;
}

// ---------------------------------------------------------------------------
// Helper Randomizers
// ---------------------------------------------------------------------------
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// ---------------------------------------------------------------------------
// Name Datasets by Ancestry & Gender
// ---------------------------------------------------------------------------
const NAMES: Record<NpcAncestry, { male: string[]; female: string[]; neutral: string[]; surnames: string[] }> = {
  human: {
    male: ['Alden', 'Bram', 'Cedric', 'Daven', 'Edric', 'Gareth', 'Jorah', 'Lorren', 'Merrick', 'Roderick', 'Thurman', 'Vance', 'Willem', 'Zackary', 'Corbin'],
    female: ['Adeline', 'Briony', 'Clara', 'Dalia', 'Elowen', 'Genevieve', 'Isolde', 'Kaelen', 'Lysa', 'Maeve', 'Nora', 'Rosalind', 'Sylvia', 'Tessa', 'Vera'],
    neutral: ['Ash', 'Bryn', 'Darcy', 'Emery', 'Greer', 'Harper', 'Jordan', 'Kellen', 'Morgan', 'Quinn', 'Rowan', 'Sage', 'Val'],
    surnames: ['Blackwood', 'Brightwood', 'Crowley', 'Drakeshaw', 'Fairbairn', 'Graves', 'Hawklight', 'Ironridge', 'Kettleburn', 'Millfield', 'Oakhaven', 'Rivers', 'Stormer', 'Thorn', 'Whitmore'],
  },
  elf: {
    male: ['Aelrindel', 'Beiro', 'Carric', 'Erevan', 'Galanodel', 'Hadrai', 'Kaelen', 'Lia', 'Mindartis', 'Paen', 'Quarion', 'Riven', 'Sariel', 'Thelar', 'Varis'],
    female: ['Althaea', 'Bethrynna', 'Caelynn', 'Drusilia', 'Enna', 'Felosial', 'Ielenia', 'Keyleth', 'Leshanna', 'Mialee', 'Naivara', 'Quelenna', 'Sariel', 'Vadania', 'Xanaphia'],
    neutral: ['Amrun', 'Corin', 'Elior', 'Faen', 'Gael', 'Illian', 'Lian', 'Moriel', 'Nailo', 'Rael', 'Sylvar', 'Zephyr'],
    surnames: ['Starflower', 'Moonwhisper', 'Diamonddew', 'Silverfrond', 'Oakenheel', 'Nightbreeze', 'Moonbrook', 'Goldpetal'],
  },
  dwarf: {
    male: ['Adrik', 'Baern', 'Brokk', 'Dain', 'Eberk', 'Fargrim', 'Gardain', 'Harbek', 'Kildrak', 'Morgran', 'Orsik', 'Rurik', 'Taklinn', 'Thorin', 'Vondal'],
    female: ['Artin', 'Audhild', 'Bardryn', 'Dagnal', 'Diesa', 'Eldeth', 'Falkrunn', 'Gunnloda', 'Helja', 'Hlin', 'Kathra', 'Kristryd', 'Liftrasa', 'Sannl', 'Torbera'],
    neutral: ['Bari', 'Brundir', 'Durn', 'Gim', 'Kari', 'Nori', 'Ragn', 'Sigurd', 'Thori', 'Vali'],
    surnames: ['Battlehammer', 'Brawnanvil', 'Coppervein', 'Deepforge', 'Fireforge', 'Frostbeard', 'Goldseeker', 'Ironfist', 'Loderr', 'Stonebreaker', 'Thunderstone', 'Torunn'],
  },
  halfling: {
    male: ['Alton', 'Ander', 'Cade', 'Corrin', 'Eldon', 'Finnan', 'Garret', 'Lindal', 'Lyle', 'Merric', 'Milo', 'Osborn', 'Perrin', 'Reed', 'Wellby'],
    female: ['Andry', 'Bree', 'Callie', 'Cora', 'Euphemia', 'Jillian', 'Kithri', 'Lavinia', 'Lidda', 'Merla', 'Nedda', 'Paela', 'Portia', 'Seraphina', 'Verna'],
    neutral: ['Bell', 'Blithe', 'Cricket', 'Ferry', 'Merrin', 'Pippin', 'Robin', 'Toby', 'Willow'],
    surnames: ['Brushgather', 'Goodbarrel', 'Greenbottle', 'High-hill', 'Hilltopple', 'Leagallow', 'Tealeaf', 'Thorngage', 'Tosscobble', 'Underbough', 'Warmwater'],
  },
  dragonborn: {
    male: ['Arjhan', 'Balasar', 'Bharash', 'Donaar', 'Ghesh', 'Heskan', 'Kriv', 'Medrash', 'Mehen', 'Nadarr', 'Pandjed', 'Patrin', 'Rhogar', 'Shamash', 'Torinn'],
    female: ['Akra', 'Biri', 'Daar', 'Farideh', 'Harann', 'Havilar', 'Jheri', 'Kava', 'Korinn', 'Mishann', 'Nala', 'Perra', 'Raiann', 'Sora', 'Surina'],
    neutral: ['Aethel', 'Dax', 'Keth', 'Kriv', 'Mael', 'Orin', 'Rhen', 'Vael', 'Zeph'],
    surnames: ['Clethtinthiallor', 'Daardendrian', 'Delmirev', 'Drachedandion', 'Fenkenkabradon', 'Kepeshkmolik', 'Kerrhylon', 'Myastan', 'Nemmonis', 'Norixius', 'Verthisathurgiesh'],
  },
  tiefling: {
    male: ['Akmenos', 'Amnon', 'Barakas', 'Damakos', 'Ekemon', 'Iados', 'Kairon', 'Leucis', 'Melech', 'Mordai', 'Morthos', 'Pelaios', 'Skamos', 'Therai', 'Zepar'],
    female: ['Akta', 'Anakis', 'Bryseis', 'Criella', 'Damaia', 'Ea', 'Kallista', 'Lerissa', 'Makaria', 'Nemeia', 'Orianna', 'Phelaia', 'Rieta', 'Vapula', 'Yaleta'],
    neutral: ['Art', 'Carrion', 'Chant', 'Despair', 'Echo', 'Fear', 'Glory', 'Hope', 'Ideal', 'Music', 'Nowhere', 'Poetry', 'Quest', 'Random', 'Reverence', 'Sorrow', 'Torment'],
    surnames: ['Drakov', 'Hellstrider', 'Nethergaze', 'Obsidion', 'Rivenhorn', 'Shadowbrand', 'Soulthief', 'Voidwalker'],
  },
  gnome: {
    male: ['Alston', 'Alvyn', 'Boddynock', 'Brocc', 'Burgell', 'Dimble', 'Eldon', 'Erky', 'Fonkin', 'Frug', 'Gerbo', 'Gimble', 'Glint', 'Kellen', 'Namfoodle', 'Roondar', 'Seebo', 'Zook'],
    female: ['Bimpnottin', 'Breena', 'Caramip', 'Carlin', 'Donella', 'Duvamil', 'Ella', 'Ellyjobell', 'Ellywick', 'Lilli', 'Loopmottin', 'Mardnab', 'Nissa', 'Nyx', 'Oda', 'Orla', 'Roywyn', 'Shamil'],
    neutral: ['Arik', 'Fid', 'Jinx', 'Kip', 'Pip', 'Razz', 'Snick', 'Tink', 'Wix'],
    surnames: ['Beren', 'Daergel', 'Folkor', 'Garrick', 'Nackle', 'Murnig', 'Ningel', 'Raulnor', 'Scheppen', 'Timbers', 'Turen'],
  },
  'half-orc': {
    male: ['Dench', 'Feng', 'Gell', 'Henk', 'Holg', 'Imsh', 'Keth', 'Krag', 'Mhurren', 'Ront', 'Shump', 'Thokk', 'Ugor', 'Varg', 'Zorn'],
    female: ['Baggi', 'Emen', 'Engong', 'Kansif', 'Myev', 'Neega', 'Ovak', 'Ownka', 'Shautha', 'Sutha', 'Vola', 'Volen', 'Yevelda'],
    neutral: ['Brak', 'Ghor', 'Hakk', 'Kall', 'Mok', 'Ror', 'Thur', 'Vrok'],
    surnames: ['Bloodfist', 'Bonecrusher', 'Ironjaw', 'Oakhide', 'Rageshield', 'Skullsplitter', 'Thundermaw', 'Wolfbane'],
  },
  'half-elf': {
    male: ['Aidan', 'Corran', 'Devlin', 'Eamonn', 'Garrick', 'Keelan', 'Lorne', 'Maddox', 'Rian', 'Theron'],
    female: ['Alyssa', 'Briana', 'Clara', 'Elysia', 'Kaelen', 'Lynnea', 'Rhiannon', 'Shanna', 'Sylva', 'Talia'],
    neutral: ['Aven', 'Briar', 'Dael', 'Keir', 'Lian', 'Quinn', 'Rowan', 'Tiernan'],
    surnames: ['Silverwood', 'Evenbreeze', 'Dawntracker', 'Moonshadow', 'Swiftwhisper', 'Winterborn'],
  },
  goliath: {
    male: ['Aukan', 'Eglath', 'Gauthak', 'Ilikan', 'Keothi', 'Kuori', 'Lo-Kag', 'Manneo', 'Maveith', 'Nalok', 'Orilo', 'Paavu', 'Pethani', 'Thalai', 'Vaunea'],
    female: ['Ghalia', 'Innil', 'Kuori', 'Manneo', 'Maveith', 'Nalok', 'Orilo', 'Paavu', 'Pethani', 'Thalai', 'Ularo', 'Vaunea', 'Vimak'],
    neutral: ['Aukan', 'Gauth', 'Kag', 'Lok', 'Mave', 'Pet', 'Thal', 'Vim'],
    surnames: ['Skywatcher', 'Stonegazer', 'Bearkiller', 'Dawncaller', 'Rootsmasher'],
  },
  tabaxi: {
    male: ['Cloud on the Mountain', 'Five Timber', 'Jade Shoe', 'Left-Handed Hummingbird', 'Seven Thundercloud', 'Skirmisher in Shadows'],
    female: ['Amber Flute', 'Emerald Path', 'Hidden Pearl', 'Merry Brook', 'Rain on Flower', 'Silent Stalker'],
    neutral: ['Bright Spark', 'Flickering Candle', 'Quick River', 'Soft Paw', 'Whispering Wind'],
    surnames: ['of the Bright Cliffs', 'of the Deep Canopy', 'of the Roaring River', 'of the Sunlit Valley', 'of the Whispering Sands'],
  },
  goblinoid: {
    male: ['Brak', 'Drib', 'Gnasher', 'Grak', 'Krag', 'Nox', 'Rik', 'Skag', 'Snarl', 'Splug', 'Vrag', 'Yrag'],
    female: ['Bree', 'Grizelda', 'Krika', 'Morg', 'Narra', 'Ranka', 'Snikka', 'Varna', 'Yazza'],
    neutral: ['Grit', 'Kip', 'Nib', 'Rik', 'Skrix', 'Snag', 'Vex'],
    surnames: ['Bonechewer', 'Dirtfoot', 'Earcutter', 'Mudwalker', 'Ratcatcher', 'Stabber', 'Yellowfang'],
  },
};

// ---------------------------------------------------------------------------
// Appearance & Notable Feature Datasets
// ---------------------------------------------------------------------------
const DISTINCTIVE_FEATURES = [
  'A deep jagged scar running across the left eye down to the jawline',
  'Piercing mismatched eyes (one golden amber, one stormy sea-gray)',
  'Elaborate tribal knotwork tattoos covering the neck and forearms',
  'A mechanical brass clockwork hand with whirring gears',
  'Shockingly bright silver-white hair despite their youthful face',
  'A broken, crooked nose that has clearly been reset multiple times',
  'Gold-capped fangs that glint noticeably when they speak or grin',
  'An intricately embroidered velvet eyepatch concealing an arcane sigil',
  'A missing ring finger on their dominant hand, branded with a small rune',
  'Striking lavender skin with faint luminescence along their cheekbones',
  'Extremely calloused, scarred hands stained with alchemical soot and ink',
  'A perpetually bandaged arm that twitches when magic is cast nearby',
  'A sharp, aristocratic jawline framed by well-groomed silver whiskers',
  'Constantly flanked by a small tame raven perched upon their shoulder',
  'A broad, muscular frame covered in faint battle scars and burn marks',
];

const CLOTHING_STYLES = [
  'A tailored dark wool trench coat with hidden interior pockets and silver buttons',
  'Heavily oiled leather armor with reinforced steel shoulder pauldrons',
  'Fine brocade silk doublet embroidered with gold thread and a velvet capelet',
  'Weather-beaten traveler cloak with deep hood, muddy boots, and traveling pouch',
  'Pristine ceremonial clerical vestments bearing an ornate silver holy symbol',
  'Durable blacksmith leather apron singed by forge sparks over linen tunic',
  'Practical ranger leathers dyed forest green and earth brown for camouflage',
  'Flamboyant feathered cap, striped velvet trousers, and polished soft boots',
  'Simple undyed monks habit tied with a hempen rope cinch and prayer beads',
  'Reinforced dark studded brigandine fitted with discreet dagger sheaths',
];

const SCENT_AND_VOICE = [
  'Smells of pipeweed, roasted barley, and old hearth-smoke; speaks in a warm, rumbling baritone',
  'Smells of fresh lavender, dried parchment, and candlewax; speaks in a precise, measured cadence',
  'Smells of iron filings, forge soot, and leather; speaks with a gravelly, authoritative rasp',
  'Smells of damp earth, crushed pine needles, and rain; speaks in low, whispered murmurs',
  'Smells of sweet perfumed oils and spiced wine; speaks with a melodious, persuasive drawl',
  'Smells of ozone, brimstone, and bitter herbs; speaks with a sharp, rapid-fire intellectual clip',
  'Smells of salty sea breeze and tar; speaks with a boisterous, booming laugh and salty slang',
  'Smells of jasmine tea and incense; speaks with a soft, soothing melodic tone that commands attention',
];

const PERSONALITY_QUIRKS = [
  'Constantly flips a heavy gold coin across the knuckles of their right hand when thinking',
  'Never makes direct eye contact for more than two seconds, always scanning exits and shadows',
  'Repeatedly cleans the edge of a small paring knife with a silk handkerchief during conversation',
  'Frequently quotes obscure ancient dwarven or elven philosophical proverbs',
  'Chews persistently on a dried clove or matchstick and chuckles at unspoken private jokes',
  'Compulsively rearranges nearby items on tables into neat, symmetrical grids',
  'Speaks of their weapons or tools as if they were living, cherished family members',
  'Pauses dramatically before answering questions, as if listening to invisible advisors',
  'Absently rubs a lucky rabbit foot or stone talisman tucked inside their sleeve',
  'Laughs at inappropriate moments, particularly when danger or combat seems imminent',
];

// ---------------------------------------------------------------------------
// Motivations & Secrets
// ---------------------------------------------------------------------------
const CORE_MOTIVATIONS = [
  'Secretly working off a crushing 5,000 gp debt owed to the local thieves guild syndicate.',
  'Desperately searching for a cure or magical remedy for a sibling stricken by an arcane curse.',
  'Plotting subtle, patient vengeance against a corrupt town magistrate who ruined their family name.',
  'Collecting rare, forbidden alchemical ingredients to achieve legendary masterwork crafting.',
  'Striving to amass enough coin and political influence to buy a prestigious seat on the merchant council.',
  'Seeking redemption for a fatal blunder made during their youth that cost innocent lives.',
  'Hunting down a ruthless bounty or rogue monster that escaped their grasp years ago.',
  'Protecting an ancient, sacred relic hidden in plain sight from inquisitive cultists.',
  'Building a sanctuary or safehouse for oppressed refugees and destitute orphans.',
  'Uncovering the true identity of a secretive shadowy mastermind pulling strings in the city.',
];

const SECRETS_AND_PLOT_HOOKS = [
  'DM Secret: Is secretly an undercover operative reporting directly to the regional spymaster.',
  'DM Secret: Harbors a fugitive noble heir disguised as a common scullery worker in their cellar.',
  'DM Secret: Carries a stolen cursed signet ring that whispers telepathic instructions in Infernal at midnight.',
  'DM Secret: Was once an apprentice to the primary campaign villain before faking their own death.',
  'DM Secret: Is secretly afflicted with dormant lycanthropy (wererat or werewolf) and dreads full moons.',
  'DM Secret: Knows the secret subterranean password that opens the smuggler tunnels beneath the city walls.',
  'DM Secret: Owes their magical prowess to a desperate warlock pact made with an Archfey prankster.',
  'DM Secret: Stashes a map leading to a forgotten dragon hoard beneath the floorboards of their quarters.',
  'DM Secret: Is being blackmailed by a corrupt guard captain who threatens to expose their past crimes.',
  'DM Secret: Possesses an enchanted locket that reveals the exact location of the nearest magical portal.',
];

// ---------------------------------------------------------------------------
// Archetype Stat Presets & 5e Math
// ---------------------------------------------------------------------------
interface ArchetypeConfig {
  displayName: string;
  defaultCr: NpcThreatTier;
  armorDesc: string;
  calcAc: (dexMod: number) => number;
  calcHp: (hdCount: number, conMod: number) => { hp: number; formula: string };
  primaryAbility: keyof AbilityScores;
  secondaryAbility: keyof AbilityScores;
  baseAbilities: AbilityScores;
  savingThrows?: string;
  skills: string;
  traits: MonsterTrait[];
  actions: (dexMod: number, strMod: number, profBonus: number) => MonsterAction[];
  speed: string;
  npcRole: string;
}

const ARCHETYPES: Record<NpcArchetype, ArchetypeConfig> = {
  commoner: {
    displayName: 'Commoner / Townsfolk',
    defaultCr: 'cr-0',
    armorDesc: 'unarmored',
    calcAc: (dex) => 10 + dex,
    calcHp: (hd, con) => ({ hp: Math.max(4, 4 + con), formula: '1d8' }),
    primaryAbility: 'wis',
    secondaryAbility: 'con',
    baseAbilities: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
    skills: 'Perception +2',
    traits: [],
    actions: (dex, str) => [
      { name: 'Club', desc: `Melee Weapon Attack: +${str + 2} to hit, reach 5 ft., one target. Hit: ${Math.max(1, 2 + str)} (1d4) bludgeoning damage.` },
    ],
    speed: '30 ft.',
    npcRole: 'Civilian',
  },
  merchant: {
    displayName: 'Merchant / Trader',
    defaultCr: 'cr-1/8',
    armorDesc: 'fine clothes, hidden dagger',
    calcAc: (dex) => 10 + dex,
    calcHp: (hd, con) => ({ hp: Math.max(9, 8 + con * 2), formula: `2d8 + ${con * 2}` }),
    primaryAbility: 'cha',
    secondaryAbility: 'wis',
    baseAbilities: { str: 10, dex: 12, con: 11, int: 13, wis: 12, cha: 14 },
    skills: 'Insight +3, Persuasion +4, Deception +4',
    traits: [
      { name: 'Silver Tongue', desc: 'The merchant has advantage on Charisma (Persuasion) checks to negotiate prices or strike deals.' }
    ],
    actions: (dex) => [
      { name: 'Dagger', desc: `Melee or Ranged Weapon Attack: +${dex + 2} to hit, reach 5 ft. or range 20/60 ft., one target. Hit: ${Math.max(1, 2 + dex)} (1d4 + ${dex}) piercing damage.` }
    ],
    speed: '30 ft.',
    npcRole: 'Merchant',
  },
  'tavern-keeper': {
    displayName: 'Tavern Keeper',
    defaultCr: 'cr-1/2',
    armorDesc: 'thick leather apron',
    calcAc: (dex) => 11 + Math.min(2, dex),
    calcHp: (hd, con) => ({ hp: 22 + con * 4, formula: `4d8 + ${con * 4}` }),
    primaryAbility: 'con',
    secondaryAbility: 'cha',
    baseAbilities: { str: 14, dex: 11, con: 14, int: 11, wis: 13, cha: 13 },
    skills: 'Insight +3, Perception +3, Athletics +4',
    traits: [
      { name: 'Bouncer Reflexes', desc: 'The tavern keeper has advantage on saving throws against being grappled or knocked prone.' }
    ],
    actions: (dex, str) => [
      { name: 'Heavy Skillet / Club', desc: `Melee Weapon Attack: +${str + 2} to hit, reach 5 ft., one target. Hit: ${Math.max(1, 3 + str)} (1d6 + ${str}) bludgeoning damage.` },
      { name: 'Flung Tankard', desc: `Ranged Weapon Attack: +${str + 2} to hit, range 20/40 ft., one target. Hit: ${Math.max(1, 2 + str)} (1d4 + ${str}) bludgeoning damage.` },
    ],
    speed: '30 ft.',
    npcRole: 'Tavern Keeper / Informant',
  },
  noble: {
    displayName: 'Noble / Aristocrat',
    defaultCr: 'cr-1/8',
    armorDesc: 'breastplate',
    calcAc: (dex) => 14 + Math.min(2, dex),
    calcHp: (hd, con) => ({ hp: 9, formula: '2d8' }),
    primaryAbility: 'cha',
    secondaryAbility: 'int',
    baseAbilities: { str: 11, dex: 12, con: 11, int: 13, wis: 14, cha: 15 },
    skills: 'Deception +4, Insight +4, Persuasion +4, History +3',
    traits: [
      { name: 'Parry', desc: 'The noble adds +2 to its AC against one melee attack that would hit it. To do so, the noble must see the attacker and be wielding a melee weapon.' }
    ],
    actions: (dex) => [
      { name: 'Fine Rapier', desc: `Melee Weapon Attack: +${dex + 2} to hit, reach 5 ft., one target. Hit: ${Math.max(1, 4 + dex)} (1d8 + ${dex}) piercing damage.` }
    ],
    speed: '30 ft.',
    npcRole: 'Noble / Quest Giver',
  },
  guard: {
    displayName: 'Town Guard / Sentinel',
    defaultCr: 'cr-1/8',
    armorDesc: 'chain shirt, shield',
    calcAc: (dex) => 13 + Math.min(2, dex) + 2,
    calcHp: (hd, con) => ({ hp: 11 + con * 2, formula: `2d8 + ${con * 2}` }),
    primaryAbility: 'str',
    secondaryAbility: 'con',
    baseAbilities: { str: 13, dex: 12, con: 12, int: 10, wis: 11, cha: 10 },
    skills: 'Perception +2, Athletics +3',
    traits: [],
    actions: (dex, str) => [
      { name: 'Spear', desc: `Melee or Ranged Weapon Attack: +${str + 2} to hit, reach 5 ft. or range 20/60 ft., one target. Hit: ${Math.max(1, 3 + str)} (1d6 + ${str}) piercing damage, or ${4 + str} (1d8 + ${str}) if used with two hands.` },
      { name: 'Light Crossbow', desc: `Ranged Weapon Attack: +${dex + 2} to hit, range 80/320 ft., one target. Hit: ${Math.max(1, 4 + dex)} (1d8 + ${dex}) piercing damage.` },
    ],
    speed: '30 ft.',
    npcRole: 'Guard / Ally',
  },
  thug: {
    displayName: 'Thug / Enforcer',
    defaultCr: 'cr-1/2',
    armorDesc: 'leather armor',
    calcAc: (dex) => 11 + dex,
    calcHp: (hd, con) => ({ hp: 32 + con * 5, formula: `5d8 + ${con * 5}` }),
    primaryAbility: 'str',
    secondaryAbility: 'con',
    baseAbilities: { str: 15, dex: 11, con: 14, int: 10, wis: 10, cha: 11 },
    skills: 'Intimidation +2, Athletics +4',
    traits: [
      { name: 'Pack Tactics', desc: 'The thug has advantage on an attack roll against a creature if at least one of the thugs allies is within 5 feet of the creature.' }
    ],
    actions: (dex, str) => [
      { name: 'Multiattack', desc: 'The thug makes two melee attacks.' },
      { name: 'Mace', desc: `Melee Weapon Attack: +${str + 2} to hit, reach 5 ft., one target. Hit: ${Math.max(1, 3 + str)} (1d6 + ${str}) bludgeoning damage.` },
      { name: 'Heavy Crossbow', desc: `Ranged Weapon Attack: +${dex + 2} to hit, range 100/400 ft., one target. Hit: ${Math.max(1, 5 + dex)} (1d10 + ${dex}) piercing damage.` },
    ],
    speed: '30 ft.',
    npcRole: 'Villain / Mercenary',
  },
  rogue: {
    displayName: 'Rogue / Spy',
    defaultCr: 'cr-1',
    armorDesc: 'studded leather',
    calcAc: (dex) => 12 + dex,
    calcHp: (hd, con) => ({ hp: 27 + con * 6, formula: `6d8 + ${con * 6}` }),
    primaryAbility: 'dex',
    secondaryAbility: 'cha',
    baseAbilities: { str: 10, dex: 16, con: 12, int: 12, wis: 13, cha: 14 },
    skills: 'Stealth +5, Sleight of Hand +5, Deception +4, Perception +3',
    traits: [
      { name: 'Cunning Action', desc: 'On each of its turns, the rogue can use a bonus action to take the Dash, Disengage, or Hide action.' },
      { name: 'Sneak Attack (1/Turn)', desc: 'The rogue deals an extra 7 (2d6) damage when it hits a target with a weapon attack and has advantage on the attack roll.' }
    ],
    actions: (dex) => [
      { name: 'Multiattack', desc: 'The rogue makes two shortsword attacks or two shortbow attacks.' },
      { name: 'Shortsword', desc: `Melee Weapon Attack: +${dex + 2} to hit, reach 5 ft., one target. Hit: ${Math.max(1, 3 + dex)} (1d6 + ${dex}) piercing damage.` },
      { name: 'Shortbow', desc: `Ranged Weapon Attack: +${dex + 2} to hit, range 80/320 ft., one target. Hit: ${Math.max(1, 3 + dex)} (1d6 + ${dex}) piercing damage.` },
    ],
    speed: '30 ft.',
    npcRole: 'Scoundrel / Informant',
  },
  assassin: {
    displayName: 'Master Assassin',
    defaultCr: 'cr-8',
    armorDesc: 'studded leather',
    calcAc: (dex) => 12 + dex,
    calcHp: (hd, con) => ({ hp: 78 + con * 12, formula: `12d8 + ${con * 12}` }),
    primaryAbility: 'dex',
    secondaryAbility: 'con',
    baseAbilities: { str: 11, dex: 18, con: 14, int: 13, wis: 14, cha: 10 },
    savingThrows: 'Dex +7, Int +4',
    skills: 'Acrobatics +7, Deception +3, Perception +5, Stealth +10',
    traits: [
      { name: 'Assassinate', desc: 'During its first turn, the assassin has advantage on attack rolls against any creature that hasn’t taken a turn. Hits against surprised creatures are critical hits.' },
      { name: 'Evasion', desc: 'When subjected to an effect that allows a Dex save for half damage, the assassin takes no damage on success, and half on failure.' },
      { name: 'Sneak Attack (1/Turn)', desc: 'The assassin deals an extra 14 (4d6) damage when it hits a target with advantage.' }
    ],
    actions: (dex) => [
      { name: 'Multiattack', desc: 'The assassin makes two shortsword attacks.' },
      { name: 'Poisoned Shortsword', desc: `Melee Weapon Attack: +${dex + 3} to hit, reach 5 ft., one target. Hit: ${3 + dex} (1d6 + ${dex}) piercing damage plus 24 (7d6) poison damage (DC 15 Con save for half).` },
      { name: 'Light Crossbow', desc: `Ranged Weapon Attack: +${dex + 3} to hit, range 80/320 ft., one target. Hit: ${4 + dex} (1d8 + ${dex}) piercing damage plus 24 (7d6) poison damage.` }
    ],
    speed: '30 ft.',
    npcRole: 'Villain / Bounty Hunter',
  },
  knight: {
    displayName: 'Knight / Crusader',
    defaultCr: 'cr-3',
    armorDesc: 'plate armor, shield',
    calcAc: (dex) => 18 + 2,
    calcHp: (hd, con) => ({ hp: 52 + con * 8, formula: `8d8 + ${con * 8}` }),
    primaryAbility: 'str',
    secondaryAbility: 'cha',
    baseAbilities: { str: 16, dex: 11, con: 14, int: 11, wis: 12, cha: 15 },
    savingThrows: 'Con +4, Wis +3',
    skills: 'Athletics +5, Persuasion +4, Intimidation +4',
    traits: [
      { name: 'Brave', desc: 'The knight has advantage on saving throws against being frightened.' },
      { name: 'Leadership (1/Day)', desc: 'For 1 minute, the knight can utter a special command to add 1d4 to allies attack rolls and saving throws within 30 ft.' }
    ],
    actions: (dex, str) => [
      { name: 'Multiattack', desc: 'The knight makes two melee attacks.' },
      { name: 'Greatsword', desc: `Melee Weapon Attack: +${str + 2} to hit, reach 5 ft., one target. Hit: ${7 + str} (2d6 + ${str}) slashing damage.` },
      { name: 'Heavy Crossbow', desc: `Ranged Weapon Attack: +${dex + 2} to hit, range 100/400 ft., one target. Hit: ${5 + dex} (1d10 + ${dex}) piercing damage.` },
      { name: 'Parry (Reaction)', desc: 'The knight adds +2 to its AC against one melee attack that would hit it.' }
    ],
    speed: '30 ft.',
    npcRole: 'Knight / Champion',
  },
  veteran: {
    displayName: 'Veteran Warrior',
    defaultCr: 'cr-3',
    armorDesc: 'splint armor',
    calcAc: (dex) => 17,
    calcHp: (hd, con) => ({ hp: 58 + con * 9, formula: `9d8 + ${con * 9}` }),
    primaryAbility: 'str',
    secondaryAbility: 'con',
    baseAbilities: { str: 16, dex: 13, con: 14, int: 10, wis: 11, cha: 10 },
    skills: 'Athletics +5, Perception +2',
    traits: [],
    actions: (dex, str) => [
      { name: 'Multiattack', desc: 'The veteran makes two longsword attacks and one shortsword attack.' },
      { name: 'Longsword', desc: `Melee Weapon Attack: +${str + 2} to hit, reach 5 ft., one target. Hit: ${4 + str} (1d8 + ${str}) slashing damage.` },
      { name: 'Shortsword', desc: `Melee Weapon Attack: +${str + 2} to hit, reach 5 ft., one target. Hit: ${3 + str} (1d6 + ${str}) piercing damage.` },
      { name: 'Heavy Crossbow', desc: `Ranged Weapon Attack: +${dex + 2} to hit, range 100/400 ft., one target. Hit: ${5 + dex} (1d10 + ${dex}) piercing damage.` }
    ],
    speed: '30 ft.',
    npcRole: 'Mercenary / Veteran',
  },
  'apprentice-mage': {
    displayName: 'Apprentice Mage',
    defaultCr: 'cr-1/4',
    armorDesc: 'unarmored (13 with Mage Armor)',
    calcAc: (dex) => 10 + dex,
    calcHp: (hd, con) => ({ hp: 9 + con * 2, formula: `2d8 + ${con * 2}` }),
    primaryAbility: 'int',
    secondaryAbility: 'dex',
    baseAbilities: { str: 9, dex: 13, con: 11, int: 14, wis: 12, cha: 11 },
    skills: 'Arcana +4, History +4',
    traits: [
      { name: 'Spellcasting', desc: 'The apprentice is a 1st-level spellcaster (spell save DC 12, +4 to hit with spell attacks). Cantrips: Fire Bolt, Light, Prestidigitation. 1st level (2 slots): Burning Hands, Mage Armor, Shield.' }
    ],
    actions: (dex) => [
      { name: 'Dagger', desc: `Melee or Ranged Weapon Attack: +${dex + 2} to hit, reach 5 ft. or range 20/60 ft., one target. Hit: ${2 + dex} (1d4 + ${dex}) piercing damage.` },
      { name: 'Fire Bolt (Cantrip)', desc: 'Ranged Spell Attack: +4 to hit, range 120 ft., one target. Hit: 5 (1d10) fire damage.' }
    ],
    speed: '30 ft.',
    npcRole: 'Scholar / Apprentice',
  },
  mage: {
    displayName: 'Wizard / Court Mage',
    defaultCr: 'cr-6',
    armorDesc: 'unarmored (15 with Mage Armor)',
    calcAc: (dex) => 12 + dex,
    calcHp: (hd, con) => ({ hp: 40 + con * 9, formula: `9d8 + ${con * 9}` }),
    primaryAbility: 'int',
    secondaryAbility: 'con',
    baseAbilities: { str: 9, dex: 14, con: 12, int: 17, wis: 12, cha: 11 },
    savingThrows: 'Int +6, Wis +4',
    skills: 'Arcana +6, History +6, Investigation +6',
    traits: [
      { 
        name: 'Spellcasting', 
        desc: 'The mage is a 9th-level spellcaster (spell save DC 14, +6 to hit with spell attacks). Cantrips: Fire Bolt, Light, Mage Hand, Prestidigitation. 1st level (4 slots): Detect Magic, Mage Armor, Magic Missile, Shield. 2nd level (3 slots): Misty Step, Scorching Ray. 3rd level (3 slots): Counterspell, Fireball, Fly. 4th level (3 slots): Greater Invisibility, Ice Storm. 5th level (1 slot): Cone of Cold.' 
      }
    ],
    actions: (dex) => [
      { name: 'Dagger', desc: `Melee or Ranged Weapon Attack: +${dex + 3} to hit, reach 5 ft. or range 20/60 ft., one target. Hit: ${2 + dex} (1d4 + ${dex}) piercing damage.` },
      { name: 'Fire Bolt (Cantrip)', desc: 'Ranged Spell Attack: +6 to hit, range 120 ft., one target. Hit: 11 (2d10) fire damage.' },
    ],
    speed: '30 ft.',
    npcRole: 'Mage / Advisor',
  },
  priest: {
    displayName: 'Cleric / Priest',
    defaultCr: 'cr-2',
    armorDesc: 'chain shirt, shield',
    calcAc: (dex) => 13 + Math.min(2, dex) + 2,
    calcHp: (hd, con) => ({ hp: 27 + con * 5, formula: `5d8 + ${con * 5}` }),
    primaryAbility: 'wis',
    secondaryAbility: 'cha',
    baseAbilities: { str: 10, dex: 10, con: 12, int: 13, wis: 16, cha: 13 },
    skills: 'Religion +5, Medicine +5, Insight +5',
    traits: [
      { 
        name: 'Divine Spellcasting', 
        desc: 'The priest is a 5th-level spellcaster (spell save DC 13, +5 to hit with spell attacks). Cantrips: Sacred Flame, Thaumaturgy, Guidance. 1st level (4 slots): Cure Wounds, Guiding Bolt, Sanctuary. 2nd level (3 slots): Hold Person, Spiritual Weapon. 3rd level (2 slots): Dispel Magic, Spirit Guardians.' 
      },
      { name: 'Divine Eminence', desc: 'As a bonus action, the priest can expend a spell slot to have its melee weapon attacks deal an extra 10 (3d6) radiant damage on a hit.' }
    ],
    actions: (dex, str) => [
      { name: 'Mace', desc: `Melee Weapon Attack: +${str + 2} to hit, reach 5 ft., one target. Hit: ${3 + str} (1d6 + ${str}) bludgeoning damage.` },
      { name: 'Sacred Flame (Cantrip)', desc: 'Spell: DC 13 Dex save or take 9 (2d8) radiant damage. Target gains no benefit from cover.' }
    ],
    speed: '30 ft.',
    npcRole: 'Priest / Healer',
  },
  druid: {
    displayName: 'Druid of the Wilds',
    defaultCr: 'cr-2',
    armorDesc: 'hide armor, wooden shield',
    calcAc: (dex) => 12 + Math.min(2, dex) + 2,
    calcHp: (hd, con) => ({ hp: 27 + con * 5, formula: `5d8 + ${con * 5}` }),
    primaryAbility: 'wis',
    secondaryAbility: 'con',
    baseAbilities: { str: 10, dex: 12, con: 13, int: 12, wis: 15, cha: 11 },
    skills: 'Nature +3, Medicine +4, Survival +4, Perception +4',
    traits: [
      { name: 'Spellcasting', desc: 'The druid is a 4th-level spellcaster (spell save DC 12, +4 to hit with spell attacks). Cantrips: Druidcraft, Produce Flame, Shillelagh. 1st level (4 slots): Entangle, Fog Cloud, Healing Word. 2nd level (3 slots): Barkskin, Moonbeam, Pass without Trace.' }
    ],
    actions: (dex, str) => [
      { name: 'Quarterstaff', desc: `Melee Weapon Attack: +${str + 2} to hit, reach 5 ft., one target. Hit: ${3 + str} (1d6 + ${str}) bludgeoning damage, or 1d8+2 with Shillelagh.` },
      { name: 'Produce Flame', desc: 'Ranged Spell Attack: +4 to hit, range 30 ft., one target. Hit: 4 (1d8) fire damage.' }
    ],
    speed: '30 ft.',
    npcRole: 'Druid / Hermit',
  },
  cultist: {
    displayName: 'Cultist Fanatic',
    defaultCr: 'cr-2',
    armorDesc: 'leather armor',
    calcAc: (dex) => 11 + dex,
    calcHp: (hd, con) => ({ hp: 33 + con * 6, formula: `6d8 + ${con * 6}` }),
    primaryAbility: 'wis',
    secondaryAbility: 'cha',
    baseAbilities: { str: 11, dex: 14, con: 12, int: 10, wis: 15, cha: 14 },
    skills: 'Deception +4, Religion +2, Persuasion +4',
    traits: [
      { name: 'Dark Devotion', desc: 'The fanatic has advantage on saving throws against being charmed or frightened.' },
      { name: 'Spellcasting', desc: 'The fanatic is a 4th-level spellcaster (spell save DC 12, +4 to hit with spell attacks). Cantrips: Sacred Flame, Thaumaturgy. 1st level (4 slots): Command, Inflict Wounds, Shield of Faith. 2nd level (3 slots): Hold Person, Spiritual Weapon.' }
    ],
    actions: (dex) => [
      { name: 'Multiattack', desc: 'The fanatic makes two melee attacks with its dagger.' },
      { name: 'Ritual Dagger', desc: `Melee or Ranged Weapon Attack: +${dex + 2} to hit, reach 5 ft. or range 20/60 ft., one target. Hit: ${2 + dex} (1d4 + ${dex}) piercing damage plus 3 (1d6) necrotic damage.` }
    ],
    speed: '30 ft.',
    npcRole: 'Cultist / Villain',
  },
  'bounty-hunter': {
    displayName: 'Bounty Hunter / Tracker',
    defaultCr: 'cr-3',
    armorDesc: 'studded leather',
    calcAc: (dex) => 12 + dex,
    calcHp: (hd, con) => ({ hp: 52 + con * 8, formula: `8d8 + ${con * 8}` }),
    primaryAbility: 'dex',
    secondaryAbility: 'wis',
    baseAbilities: { str: 14, dex: 16, con: 14, int: 11, wis: 14, cha: 11 },
    skills: 'Survival +6, Perception +4, Stealth +5, Athletics +4',
    traits: [
      { name: 'Relentless Tracker', desc: 'The bounty hunter has advantage on Wisdom (Survival) checks to track humanoids, and advantage on initiative rolls.' }
    ],
    actions: (dex) => [
      { name: 'Multiattack', desc: 'The bounty hunter makes two melee attacks or two ranged attacks.' },
      { name: 'Longsword', desc: `Melee Weapon Attack: +${dex + 2} to hit, reach 5 ft., one target. Hit: ${4 + dex} (1d8 + ${dex}) slashing damage.` },
      { name: 'Heavy Crossbow', desc: `Ranged Weapon Attack: +${dex + 2} to hit, range 100/400 ft., one target. Hit: ${5 + dex} (1d10 + ${dex}) piercing damage.` }
    ],
    speed: '35 ft.',
    npcRole: 'Bounty Hunter / Mercenary',
  },
  scholar: {
    displayName: 'Scholar / Antiquarian',
    defaultCr: 'cr-1/8',
    armorDesc: 'unarmored',
    calcAc: (dex) => 10 + dex,
    calcHp: (hd, con) => ({ hp: 9, formula: '2d8' }),
    primaryAbility: 'int',
    secondaryAbility: 'wis',
    baseAbilities: { str: 9, dex: 11, con: 10, int: 16, wis: 14, cha: 12 },
    skills: 'History +5, Arcana +5, Religion +5, Investigation +5',
    traits: [
      { name: 'Encyclopedic Knowledge', desc: 'The scholar can recall lore on almost any historical, magical, or religious subject with ease.' }
    ],
    actions: (dex, str) => [
      { name: 'Walking Cane / Dagger', desc: `Melee Weapon Attack: +${str + 2} to hit, reach 5 ft., one target. Hit: 2 (1d4) bludgeoning damage.` }
    ],
    speed: '30 ft.',
    npcRole: 'Scholar / Sage',
  },
  archmage: {
    displayName: 'Archmage / Grand Wizard',
    defaultCr: 'cr-12',
    armorDesc: 'unarmored (15 with Mage Armor)',
    calcAc: (dex) => 12 + dex,
    calcHp: (hd, con) => ({ hp: 99 + con * 18, formula: `18d8 + ${con * 18}` }),
    primaryAbility: 'int',
    secondaryAbility: 'dex',
    baseAbilities: { str: 10, dex: 14, con: 14, int: 20, wis: 15, cha: 16 },
    savingThrows: 'Int +9, Wis +6',
    skills: 'Arcana +13, History +13',
    traits: [
      { name: 'Magic Resistance', desc: 'The archmage has advantage on saving throws against spells and other magical effects.' },
      { 
        name: 'Spellcasting', 
        desc: 'The archmage is an 18th-level spellcaster (spell save DC 17, +9 to hit with spell attacks). Cantrips: Fire Bolt, Light, Mage Hand, Prestidigitation. 1st-level (4 slots): Detect Magic, Identify, Mage Armor, Magic Missile, Shield. 2nd-level (3 slots): Detect Thoughts, Mirror Image, Misty Step. 3rd-level (3 slots): Counterspell, Fly, Lightning Bolt. 4th-level (3 slots): Banishment, Fire Shield, Stoneskin. 5th-level (3 slots): Bigby’s Hand, Cone of Cold, Wall of Force. 6th-level (1 slot): Globe of Invulnerability. 7th-level (1 slot): Teleport. 8th-level (1 slot): Mind Blank. 9th-level (1 slot): Time Stop.' 
      }
    ],
    actions: (dex) => [
      { name: 'Dagger', desc: `Melee or Ranged Weapon Attack: +${dex + 4} to hit, reach 5 ft. or range 20/60 ft., one target. Hit: ${2 + dex} (1d4 + ${dex}) piercing damage.` },
      { name: 'Fire Bolt (Cantrip)', desc: 'Ranged Spell Attack: +9 to hit, range 120 ft., one target. Hit: 22 (4d10) fire damage.' }
    ],
    speed: '30 ft.',
    npcRole: 'Archmage / Boss',
  },
  warlord: {
    displayName: 'Warlord / General',
    defaultCr: 'cr-8',
    armorDesc: 'plate armor',
    calcAc: (dex) => 18,
    calcHp: (hd, con) => ({ hp: 110 + con * 13, formula: `13d8 + ${con * 13}` }),
    primaryAbility: 'str',
    secondaryAbility: 'cha',
    baseAbilities: { str: 18, dex: 12, con: 16, int: 14, wis: 12, cha: 16 },
    savingThrows: 'Str +7, Con +6, Cha +6',
    skills: 'Athletics +7, Intimidation +6, Perception +4',
    traits: [
      { name: 'Indomitable (2/Day)', desc: 'The warlord can reroll a saving throw that it fails.' },
      { name: 'Tactical Command', desc: 'As a bonus action, the warlord can direct an ally within 30 feet to immediately make one weapon attack using its reaction.' }
    ],
    actions: (dex, str) => [
      { name: 'Multiattack', desc: 'The warlord makes three melee weapon attacks.' },
      { name: 'Greatsword', desc: `Melee Weapon Attack: +${str + 3} to hit, reach 5 ft., one target. Hit: ${7 + str} (2d6 + ${str}) slashing damage.` },
      { name: 'Heavy Crossbow', desc: `Ranged Weapon Attack: +${dex + 3} to hit, range 100/400 ft., one target. Hit: ${5 + dex} (1d10 + ${dex}) piercing damage.` }
    ],
    speed: '30 ft.',
    npcRole: 'Warlord / Boss',
  },
};

// ---------------------------------------------------------------------------
// CR and XP Mappings
// ---------------------------------------------------------------------------
const CR_XP_MAP: Record<string, number> = {
  '0': 10,
  '1/8': 25,
  '1/4': 50,
  '1/2': 100,
  '1': 200,
  '2': 450,
  '3': 700,
  '5': 1800,
  '6': 2300,
  '8': 3900,
  '12': 8400,
};

// ---------------------------------------------------------------------------
// Main Generation Function
// ---------------------------------------------------------------------------
export function generateNpc(options: NpcGeneratorOptions = {}): GeneratedNpc {
  // 1. Ancestry
  const allAncestries: NpcAncestry[] = ['human', 'elf', 'dwarf', 'halfling', 'dragonborn', 'tiefling', 'gnome', 'half-orc', 'half-elf', 'goliath', 'tabaxi', 'goblinoid'];
  const ancestry: NpcAncestry = options.ancestry && options.ancestry !== 'random' ? options.ancestry : pick(allAncestries);

  // 2. Gender
  const genders: ('male' | 'female' | 'non-binary')[] = ['male', 'female', 'non-binary'];
  const gender: 'male' | 'female' | 'non-binary' = options.gender && options.gender !== 'random' ? options.gender : pick(genders);

  // 3. Name Generation
  const nameSet = NAMES[ancestry] || NAMES.human;
  let firstName = '';
  if (gender === 'male') firstName = pick(nameSet.male);
  else if (gender === 'female') firstName = pick(nameSet.female);
  else firstName = pick(nameSet.neutral);

  const surname = pick(nameSet.surnames);
  const fullName = `${firstName} ${surname}`;

  // 4. Archetype & Class
  const allArchetypes: NpcArchetype[] = Object.keys(ARCHETYPES) as NpcArchetype[];
  const archetypeKey: NpcArchetype = options.archetype && options.archetype !== 'random' ? options.archetype : pick(allArchetypes);
  const config: ArchetypeConfig = ARCHETYPES[archetypeKey] || ARCHETYPES.commoner;

  // 5. CR Threat Tier
  let crTier = config.defaultCr.replace('cr-', '');
  if (options.threatTier && options.threatTier !== 'random') {
    crTier = options.threatTier.replace('cr-', '');
  }

  // 6. Alignment
  const alignments = ['Lawful Good', 'Neutral Good', 'Chaotic Good', 'Lawful Neutral', 'True Neutral', 'Chaotic Neutral', 'Lawful Evil', 'Neutral Evil', 'Chaotic Evil'];
  const alignment = options.alignment && options.alignment !== 'random' ? options.alignment : pick(alignments);

  // 7. Personality Tone
  const allTones: NpcPersonalityTone[] = ['friendly', 'suspicious', 'eccentric', 'grim', 'snobbish', 'anxious', 'boisterous', 'mysterious', 'stoic'];
  const tone: NpcPersonalityTone = options.personalityTone && options.personalityTone !== 'random' ? options.personalityTone : pick(allTones);

  // 8. Story, Backstory & Features
  const feature = pick(DISTINCTIVE_FEATURES);
  const clothes = pick(CLOTHING_STYLES);
  const scent = pick(SCENT_AND_VOICE);
  const quirk = pick(PERSONALITY_QUIRKS);
  const motive = pick(CORE_MOTIVATIONS);
  const secret = pick(SECRETS_AND_PLOT_HOOKS);

  const ancestryDisplay = ancestry.charAt(0).toUpperCase() + ancestry.slice(1);
  const archetypeTitle = config.displayName.split('/')[0].trim();

  const backstory = `${fullName} is a ${ancestryDisplay} ${archetypeTitle} known locally for their distinctive presence and ${tone} demeanor. Born in the bustling outskirts of the region, they learned early on that survival requires a mix of sharp wits and keen observation. Over the years, they have carved out a reputation in their trade, though few know the private burdens that drive them each day.\n\nCurrently, ${fullName} spends their days managing their affairs while keeping a cautious eye on visiting adventurers and local authorities. While generally ${tone} to strangers who approach with respect, they are quick to guard their interests if threatened.`;

  // 9. Ability Scores & Modifiers
  const abilities = { ...config.baseAbilities };
  if (ancestry === 'dwarf') { abilities.con += 2; }
  else if (ancestry === 'elf') { abilities.dex += 2; }
  else if (ancestry === 'halfling') { abilities.dex += 2; }
  else if (ancestry === 'dragonborn') { abilities.str += 2; abilities.cha += 1; }
  else if (ancestry === 'gnome') { abilities.int += 2; }
  else if (ancestry === 'tiefling') { abilities.cha += 2; abilities.int += 1; }
  else if (ancestry === 'half-orc') { abilities.str += 2; abilities.con += 1; }
  else if (ancestry === 'goliath') { abilities.str += 2; abilities.con += 1; }
  else if (ancestry === 'tabaxi') { abilities.dex += 2; abilities.cha += 1; }

  const strMod = Math.floor((abilities.str - 10) / 2);
  const dexMod = Math.floor((abilities.dex - 10) / 2);
  const conMod = Math.floor((abilities.con - 10) / 2);
  const wisMod = Math.floor((abilities.wis - 10) / 2);

  const ac = config.calcAc(dexMod);
  const hpData = config.calcHp(4, conMod);
  const actions = config.actions(dexMod, strMod, 2);

  // 10. Compile Senses & Languages
  const hasDarkvision = ['elf', 'dwarf', 'gnome', 'tiefling', 'half-orc', 'tabaxi', 'goblinoid'].includes(ancestry);
  const senses = hasDarkvision 
    ? `darkvision 60 ft., passive Perception ${10 + wisMod}` 
    : `passive Perception ${10 + wisMod}`;

  const languages = ancestry === 'human' 
    ? 'Common' 
    : `Common, ${ancestryDisplay}`;

  const xp = CR_XP_MAP[crTier] || 100;
  const now = new Date().toISOString();
  const id = `npc-gen-${Date.now()}-${Math.random().toString(36).substr(2, 7)}`;

  // Construct standard 5e MonsterEntity for cross-app compatibility
  const statBlock: MonsterEntity = {
    id,
    type: 'monster',
    name: fullName,
    size: ['halfling', 'gnome', 'goblinoid'].includes(ancestry) ? 'Small' : 'Medium',
    monsterType: `Humanoid (${ancestry})`,
    alignment,
    armorClass: ac,
    armorDesc: config.armorDesc,
    hitPoints: hpData.hp,
    hitDice: hpData.formula,
    speed: config.speed,
    abilities,
    savingThrows: config.savingThrows,
    skills: config.skills,
    senses,
    languages,
    challengeRating: crTier,
    experiencePoints: xp,
    traits: [
      ...config.traits,
      { name: 'Distinctive Quirk', desc: quirk },
      { name: 'Core Motivation', desc: motive },
    ],
    actions,
    isNpc: true,
    npcRole: config.npcRole,
    occupation: archetypeTitle,
    location: 'Current Campaign Area',
    environment: 'Urban, Settlement, Tavern',
    createdAt: now,
    updatedAt: now,
  };

  return {
    id,
    name: fullName,
    title: `${ancestryDisplay} ${archetypeTitle}`,
    ancestry: ancestryDisplay,
    gender: gender.charAt(0).toUpperCase() + gender.slice(1),
    archetype: config.displayName,
    alignment,
    threatTier: `CR ${crTier} (${xp} XP)`,
    personalityTone: tone.charAt(0).toUpperCase() + tone.slice(1),
    story: {
      appearance: `${clothes}. ${feature}.`,
      distinctiveFeature: feature,
      clothingStyle: clothes,
      scentOrVoice: scent,
      personalityQuirk: quirk,
      coreMotivation: motive,
      secretOrPlotHook: secret,
      backstory,
    },
    statBlock,
  };
}
