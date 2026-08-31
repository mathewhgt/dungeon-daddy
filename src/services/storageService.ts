import { MonsterEntity } from '../types/monster';
import { SpellEntity } from '../types/spell';
import { ItemEntity } from '../types/item';
import { PlayerEntity } from '../types/player';
import { RollTableEntity } from '../types/rollTable';
import { CampaignEntity } from '../types/campaign';
import { EncounterEntity } from '../types/encounter';
import { BattleMapEntity } from '../types/map';
import { TemplateDefinition } from '../types/entity';
import { DEFAULT_TEMPLATES } from './templateEngine';
import { SRD_MONSTERS } from './srdData/monstersData';
import { SRD_SPELLS } from './srdData/spellsData';
import { SRD_ITEMS } from './srdData/itemsData';
import { SRD_ROLL_TABLES } from './srdData/tablesData';
import { STARTER_PLAYERS, STARTER_CAMPAIGN, STARTER_ENCOUNTERS } from './srdData/defaultParty';
import { STARTER_MAPS } from './srdData/defaultMaps';
import { CustomBookEntity, CustomChapterEntity, HandbookChapterOverride, CustomSubclassEntity, CustomFeatEntity, CustomBackgroundEntity, CustomSpeciesEntity } from '../types/handbook';
import { BookmarkItem } from '../types/bookmark';

export const DEFAULT_CUSTOM_BOOK: CustomBookEntity = {
  id: 'custom-homebrew-rules',
  title: 'Homebrew & Campaign House Rules',
  edition: 'Custom 5e',
  description: 'Custom house rules, third-party rules, setting guides, and homebrew mechanics.',
  coverIcon: 'Sparkles',
  color: '#f59e0b',
  isCustom: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  chapters: [
    {
      id: 'house-rules-intro',
      bookId: 'custom-homebrew-rules',
      title: 'Campaign House Rules & Table Rulings',
      shortTitle: 'Table Rulings',
      category: 'rule',
      icon: 'Sparkles',
      content: '# Campaign House Rules\n\nWelcome to your custom campaign house rules! Add custom rules, drinking potions as a bonus action, flanking rules, homebrew classes, or setting lore here.\n\n## Potion Drinking\n- **Bonus Action:** Drinking a potion yourself takes a Bonus Action.\n- **Action:** Administering a potion to an unconscious or willing ally takes an Action.\n\n## Critical Hits (Max + Roll)\n- On a critical hit, deal maximum damage for the weapon die plus roll the additional die (e.g. `1d8 + 8 + modifier`).\n\n## Flanking (Optional +2 Bonus)\n- When a creature and at least one ally are within 5 ft of an enemy on opposite sides, attack rolls gain a +2 bonus (rather than full advantage).',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ]
};

export interface AppDatabase {
  version: number;
  templates: Record<string, TemplateDefinition>;
  monsters: MonsterEntity[];
  spells: SpellEntity[];
  items: ItemEntity[];
  players: PlayerEntity[];
  tables: RollTableEntity[];
  campaigns: CampaignEntity[];
  encounters: EncounterEntity[];
  maps: BattleMapEntity[];
  customBooks: CustomBookEntity[];
  handbookOverrides: Record<string, HandbookChapterOverride>;
  handbookCustomEntries: CustomChapterEntity[];
  bookmarks?: BookmarkItem[];
  customSubclasses?: CustomSubclassEntity[];
  customFeats?: CustomFeatEntity[];
  customBackgrounds?: CustomBackgroundEntity[];
  customSpecies?: CustomSpeciesEntity[];
}

const STORAGE_KEY = 'dungeon_daddy_db_v1';
const LEGACY_STORAGE_KEY = 'encounter_plus_db_v1';

export function getInitialDatabase(): AppDatabase {
  return {
    version: 1,
    templates: DEFAULT_TEMPLATES,
    monsters: SRD_MONSTERS,
    spells: SRD_SPELLS,
    items: SRD_ITEMS,
    players: STARTER_PLAYERS,
    tables: SRD_ROLL_TABLES,
    campaigns: [STARTER_CAMPAIGN],
    encounters: STARTER_ENCOUNTERS,
    maps: STARTER_MAPS,
    customBooks: [DEFAULT_CUSTOM_BOOK],
    handbookOverrides: {},
    handbookCustomEntries: [],
    bookmarks: [],
    customSubclasses: [],
    customFeats: [],
    customBackgrounds: [],
    customSpecies: [],
  };
}

export function loadDatabase(): AppDatabase {
  try {
    let raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Fallback migration from legacy storage key
      const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (legacyRaw) {
        raw = legacyRaw;
        localStorage.setItem(STORAGE_KEY, legacyRaw);
      }
    }
    if (!raw) {
      const initial = getInitialDatabase();
      saveDatabase(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);

    // Merge SRD Spells with existing spells so newly added schema fields are populated
    const existingSpells: SpellEntity[] = parsed.spells && parsed.spells.length > 0 ? parsed.spells : SRD_SPELLS;
    const srdMap = new Map(SRD_SPELLS.map((s) => [s.id, s]));
    const enrichedSpells: SpellEntity[] = existingSpells.map((s) => {
      const srd = srdMap.get(s.id);
      if (srd) {
        return {
          ...srd,
          ...s,
          school: s.school || srd.school,
          element: s.element || srd.element,
          shape: s.shape || srd.shape,
          aoe: s.aoe || srd.aoe,
          range: s.range || srd.range,
          rangeFeet: s.rangeFeet || srd.rangeFeet,
        };
      }
      // Custom spell inference for missing fields
      const desc = (s.description || '').toLowerCase();
      const name = (s.name || '').toLowerCase();
      const element = s.element || (
        desc.includes('fire') || name.includes('fire') || name.includes('flame') ? 'fire' :
        desc.includes('cold') || desc.includes('frost') || desc.includes('ice') ? 'cold' :
        desc.includes('lightning') || name.includes('lightning') || name.includes('bolt') ? 'lightning' :
        desc.includes('thunder') || name.includes('thunder') ? 'thunder' :
        desc.includes('radiant') || name.includes('radiant') || name.includes('holy') ? 'radiant' :
        desc.includes('necrotic') || name.includes('death') ? 'necrotic' :
        desc.includes('acid') ? 'acid' :
        desc.includes('poison') ? 'poison' :
        desc.includes('psychic') ? 'psychic' :
        desc.includes('force') ? 'force' : 'none'
      );
      const shape = s.shape || s.aoe?.shape || (
        desc.includes('cone') ? 'cone' :
        desc.includes('line') ? 'line' :
        desc.includes('cube') ? 'cube' :
        desc.includes('sphere') || desc.includes('radius') ? 'sphere' :
        desc.includes('cylinder') ? 'cylinder' : 'none'
      );
      const aoe = s.aoe || (shape !== 'none' ? { shape, sizeFeet: 20 } : undefined);
      return {
        ...s,
        element,
        shape,
        aoe,
      };
    });

    // Merge SRD Monsters with existing monsters and correct isNpc flags
    const existingMonsters: MonsterEntity[] = parsed.monsters && parsed.monsters.length > 0 ? parsed.monsters : SRD_MONSTERS;
    const existingMonsterIds = new Set(existingMonsters.map((m) => m.id));
    
    // Add any missing SRD monsters to existing database
    const allMonsters: MonsterEntity[] = [
      ...existingMonsters,
      ...SRD_MONSTERS.filter((srd) => !existingMonsterIds.has(srd.id))
    ];

    const enrichedMonsters: MonsterEntity[] = allMonsters.map((m) => {
      const typeLower = (m.monsterType || '').toLowerCase();
      const nameLower = (m.name || '').toLowerCase();

      // SRD Bestiary monsters that must NEVER be categorized as NPCs
      const isSrdBestiaryMonster = ['srd-goblin', 'srd-bugbear', 'srd-skeleton', 'srd-ogre', 'srd-owlbear', 'srd-young-red-dragon', 'srd-beholder'].includes(m.id);
      if (isSrdBestiaryMonster) {
        return {
          ...m,
          isNpc: false,
        };
      }

      // Check if creature is a monster species (e.g. Goblin, Bugbear, Orc, Kobold, Gnoll, Skeleton, etc.)
      const isMonsterSpecies = ['goblin', 'bugbear', 'hobgoblin', 'orc', 'kobold', 'gnoll', 'lizardfolk', 'troglodyte', 'ogre', 'skeleton', 'zombie', 'ghoul', 'wight', 'dragon', 'beholder', 'owlbear'].some((spec) => nameLower === spec || nameLower.startsWith(`${spec} `) || typeLower.includes(spec));

      if (isMonsterSpecies && !m.npcRole && !m.occupation && !m.location) {
        return {
          ...m,
          isNpc: false,
        };
      }

      // Explicit NPC professions / roles
      const isGenericNpc = ['guard', 'mage', 'noble', 'bandit', 'knight', 'priest', 'assassin', 'cultist', 'veteran', 'gladiator', 'spy', 'commoner', 'archmage'].some((n) => nameLower.includes(n));
      const isNpc = m.isNpc !== undefined ? m.isNpc : isGenericNpc;
      return {
        ...m,
        isNpc,
      };
    });

    // Check for any items accidentally imported as monsters and recover them
    const cleanMonsters: MonsterEntity[] = [];
    const recoveredItems: ItemEntity[] = [];
    const itemTypes = ['weapon', 'armor', 'wondrous item', 'potion', 'scroll', 'ring', 'rod', 'staff', 'wand', 'adventuring gear', 'shield', 'clothing', 'tool'];
    const knownItemNames = new Set(SRD_ITEMS.map((i) => i.name.toLowerCase()));

    for (const m of enrichedMonsters) {
      const raw = m as any;
      const typeLower = (m.monsterType || '').toLowerCase();
      const nameLower = (m.name || '').toLowerCase();
      const isSrdMonster = ['srd-goblin', 'srd-bugbear', 'srd-skeleton', 'srd-ogre', 'srd-owlbear', 'srd-young-red-dragon', 'srd-beholder'].includes(m.id);

      const hasItemFields = Boolean(raw.itemType || raw.rarity || raw.value || raw.weight || (raw.damage && (!m.actions || m.actions.length === 0) && (!m.traits || m.traits.length === 0)));
      const hasItemType = itemTypes.some((t) => typeLower === t || typeLower.includes(t));
      const isKnownItemName = knownItemNames.has(nameLower);

      if (!isSrdMonster && (hasItemFields || hasItemType || isKnownItemName)) {
        // Recover misclassified item
        const recovered: ItemEntity = {
          id: m.id.startsWith('monster-') ? m.id.replace('monster-', 'item-') : (m.id.startsWith('item-') ? m.id : `item-${m.id}`),
          type: 'item',
          name: m.name,
          itemType: raw.itemType || raw.monsterType || 'Wondrous Item',
          rarity: raw.rarity || 'Common',
          attunement: Boolean(raw.attunement),
          attunementRequirement: raw.attunementRequirement || undefined,
          value: raw.value || undefined,
          weight: raw.weight || undefined,
          damage: raw.damage || undefined,
          armorClassBonus: raw.armorClassBonus || undefined,
          properties: raw.properties || undefined,
          description: raw.description || m.traits?.[0]?.desc || m.actions?.[0]?.desc || `${m.name} (${raw.itemType || 'Item'})`,
          imageUrl: m.avatarUrl || raw.imageUrl || undefined,
          createdAt: m.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        recoveredItems.push(recovered);
      } else {
        cleanMonsters.push(m);
      }
    }

    // Merge recovered items with existing items without duplicates
    const baseItems: ItemEntity[] = parsed.items && parsed.items.length > 0 ? parsed.items : SRD_ITEMS;
    const existingItemNames = new Set(baseItems.map((i) => i.name.toLowerCase()));
    const finalItems: ItemEntity[] = [
      ...baseItems,
      ...recoveredItems.filter((i) => !existingItemNames.has(i.name.toLowerCase())),
    ];

    // Ensure all official template fields are present while preserving any custom user-added fields
    const mergedTemplates: Record<string, TemplateDefinition> = {};
    for (const key of Object.keys(DEFAULT_TEMPLATES)) {
      const defaultTmpl = (DEFAULT_TEMPLATES as any)[key];
      const savedTmpl = parsed.templates?.[key];
      if (!savedTmpl) {
        mergedTemplates[key] = defaultTmpl;
      } else {
        const defaultFieldKeys = new Set(defaultTmpl.fields.map((f: any) => f.key));
        const customFields = (savedTmpl.fields || []).filter((f: any) => !defaultFieldKeys.has(f.key));
        const mergedFields = [...defaultTmpl.fields, ...customFields];

        const defaultHeaders = new Set(defaultTmpl.csvHeaders);
        const customHeaders = (savedTmpl.csvHeaders || []).filter((h: string) => !defaultHeaders.has(h));
        const mergedHeaders = [...defaultTmpl.csvHeaders, ...customHeaders];

        mergedTemplates[key] = {
          ...defaultTmpl,
          ...savedTmpl,
          displayName: defaultTmpl.displayName,
          description: defaultTmpl.description,
          fields: mergedFields,
          csvHeaders: mergedHeaders,
        };
      }
    }

    // Merge SRD tables with existing tables
    const existingTables: RollTableEntity[] = parsed.tables || [];
    const existingTableIds = new Set(existingTables.map((t) => t.id));
    const mergedTables = [...existingTables];
    for (const srdTbl of SRD_ROLL_TABLES) {
      if (!existingTableIds.has(srdTbl.id)) {
        mergedTables.push(srdTbl);
      }
    }

    // Ensure all collections exist and templates are up to date
    const loadedDb: AppDatabase = {
      version: parsed.version || 1,
      templates: mergedTemplates,
      monsters: cleanMonsters,
      spells: enrichedSpells,
      items: finalItems,
      players: parsed.players || STARTER_PLAYERS,
      tables: mergedTables.length > 0 ? mergedTables : SRD_ROLL_TABLES,
      campaigns: parsed.campaigns || [STARTER_CAMPAIGN],
      encounters: parsed.encounters || STARTER_ENCOUNTERS,
      maps: parsed.maps || STARTER_MAPS,
      customBooks: parsed.customBooks && parsed.customBooks.length > 0 ? parsed.customBooks : [DEFAULT_CUSTOM_BOOK],
      handbookOverrides: parsed.handbookOverrides || {},
      handbookCustomEntries: parsed.handbookCustomEntries || [],
      bookmarks: parsed.bookmarks || [],
      customSubclasses: parsed.customSubclasses || [],
      customFeats: parsed.customFeats || [],
      customBackgrounds: parsed.customBackgrounds || [],
      customSpecies: parsed.customSpecies || [],
    };

    saveDatabase(loadedDb);
    return loadedDb;
  } catch (err) {
    console.error('Failed to load database from localStorage:', err);
    return getInitialDatabase();
  }
}

export function saveDatabase(db: AppDatabase): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (err) {
    // If full database exceeds browser localStorage quota (e.g. large base64 battle maps):
    // Save lightweight text metadata to localStorage so text campaigns/notes/spells are never lost
    try {
      const lightweightDb = {
        ...db,
        maps: (db.maps || []).map((m) => ({
          ...m,
          imageUrl: m.imageUrl && m.imageUrl.length > 200000 ? '' : m.imageUrl,
        })),
        monsters: (db.monsters || []).map((m) => ({
          ...m,
          avatarUrl: m.avatarUrl && m.avatarUrl.length > 200000 ? '' : m.avatarUrl,
        })),
        players: (db.players || []).map((p) => ({
          ...p,
          avatarUrl: p.avatarUrl && p.avatarUrl.length > 200000 ? '' : p.avatarUrl,
          tokenUrl: p.tokenUrl && p.tokenUrl.length > 200000 ? '' : p.tokenUrl,
        })),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lightweightDb));
    } catch (e) {
      console.warn('LocalStorage quota exceeded. Native desktop file storage is handling persistence.');
    }
  }
}

// ---------------------------------------------------------------------------
// Database Snapshots & Rollback Engine
// ---------------------------------------------------------------------------

export interface DatabaseSnapshot {
  id: string;
  timestamp: string;
  description: string;
  trigger: 'bulk_import' | 'manual' | 'restore' | 'reset' | 'cleanup';
  entityCounts: {
    monsters: number;
    spells: number;
    items: number;
    players: number;
    tables: number;
    maps: number;
    campaigns: number;
  };
  data: AppDatabase;
}

const SNAPSHOTS_KEY = 'dungeon_daddy_snapshots_v1';
const LEGACY_SNAPSHOTS_KEY = 'encounter_plus_snapshots_v1';
const MAX_SNAPSHOTS = 10;

export function getSnapshots(): DatabaseSnapshot[] {
  try {
    let raw = localStorage.getItem(SNAPSHOTS_KEY);
    if (!raw) {
      const legacyRaw = localStorage.getItem(LEGACY_SNAPSHOTS_KEY);
      if (legacyRaw) {
        raw = legacyRaw;
        localStorage.setItem(SNAPSHOTS_KEY, legacyRaw);
      }
    }
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load snapshots from localStorage:', err);
    return [];
  }
}

export function saveSnapshots(snapshots: DatabaseSnapshot[]): void {
  try {
    // Clean massive images from snapshots before storing in localStorage
    const lightweightSnaps = snapshots.slice(0, MAX_SNAPSHOTS).map((snap) => ({
      ...snap,
      data: {
        ...snap.data,
        maps: (snap.data.maps || []).map((m) => ({
          ...m,
          imageUrl: m.imageUrl && m.imageUrl.length > 100000 ? '' : m.imageUrl,
        })),
      },
    }));
    localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(lightweightSnaps));
  } catch (err) {
    console.warn('Snapshots exceed localStorage limit; skipping snapshot cache in browser.');
  }
}

export function createSnapshot(
  db: AppDatabase, 
  description: string, 
  trigger: DatabaseSnapshot['trigger'] = 'manual'
): DatabaseSnapshot {
  const snapshot: DatabaseSnapshot = {
    id: `snap-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    timestamp: new Date().toISOString(),
    description,
    trigger,
    entityCounts: {
      monsters: (db.monsters || []).length,
      spells: (db.spells || []).length,
      items: (db.items || []).length,
      players: (db.players || []).length,
      tables: (db.tables || []).length,
      maps: (db.maps || []).length,
      campaigns: (db.campaigns || []).length,
    },
    data: JSON.parse(JSON.stringify(db)),
  };

  const existing = getSnapshots();
  const updated = [snapshot, ...existing].slice(0, MAX_SNAPSHOTS);
  saveSnapshots(updated);
  return snapshot;
}

export function restoreSnapshot(snapshotId: string): AppDatabase | null {
  const snapshots = getSnapshots();
  const found = snapshots.find((s) => s.id === snapshotId);
  if (!found) return null;

  const restoredDb = JSON.parse(JSON.stringify(found.data));
  saveDatabase(restoredDb);
  return restoredDb;
}

export function deleteSnapshot(snapshotId: string): DatabaseSnapshot[] {
  const snapshots = getSnapshots();
  const updated = snapshots.filter((s) => s.id !== snapshotId);
  saveSnapshots(updated);
  return updated;
}

export function clearSnapshots(): void {
  try {
    localStorage.removeItem(SNAPSHOTS_KEY);
  } catch (err) {
    console.error('Failed to clear snapshots:', err);
  }
}

export function convertMisclassifiedMonstersToItems(db: AppDatabase): {
  updatedDb: AppDatabase;
  convertedCount: number;
  convertedItems: ItemEntity[];
} {
  const misclassified: MonsterEntity[] = [];
  const cleanMonsters: MonsterEntity[] = [];
  const itemTypes = ['weapon', 'armor', 'wondrous item', 'potion', 'scroll', 'ring', 'rod', 'staff', 'wand', 'adventuring gear', 'shield', 'clothing', 'tool'];
  const knownItemNames = new Set(SRD_ITEMS.map((i) => i.name.toLowerCase()));

  for (const m of db.monsters) {
    const raw = m as any;
    const typeLower = (m.monsterType || '').toLowerCase();
    const nameLower = (m.name || '').toLowerCase();
    const isSrdMonster = ['srd-goblin', 'srd-bugbear', 'srd-skeleton', 'srd-ogre', 'srd-owlbear', 'srd-young-red-dragon', 'srd-beholder'].includes(m.id);

    const hasItemFields = Boolean(raw.itemType || raw.rarity || raw.value || raw.weight || (raw.damage && (!m.actions || m.actions.length === 0) && (!m.traits || m.traits.length === 0)));
    const hasItemType = itemTypes.some((t) => typeLower === t || typeLower.includes(t));
    const isKnownItemName = knownItemNames.has(nameLower);

    if (!isSrdMonster && (hasItemFields || hasItemType || isKnownItemName)) {
      misclassified.push(m);
    } else {
      cleanMonsters.push(m);
    }
  }

  if (misclassified.length === 0) {
    return { updatedDb: db, convertedCount: 0, convertedItems: [] };
  }

  const convertedItems: ItemEntity[] = misclassified.map((m) => {
    const raw = m as any;
    return {
      id: m.id.startsWith('monster-') ? m.id.replace('monster-', 'item-') : (m.id.startsWith('item-') ? m.id : `item-${m.id}`),
      type: 'item',
      name: m.name,
      itemType: raw.itemType || raw.monsterType || 'Wondrous Item',
      rarity: raw.rarity || 'Common',
      attunement: Boolean(raw.attunement),
      attunementRequirement: raw.attunementRequirement || undefined,
      value: raw.value || undefined,
      weight: raw.weight || undefined,
      damage: raw.damage || undefined,
      armorClassBonus: raw.armorClassBonus || undefined,
      properties: raw.properties || undefined,
      description: raw.description || m.traits?.[0]?.desc || m.actions?.[0]?.desc || `${m.name} (${raw.itemType || 'Item'})`,
      imageUrl: m.avatarUrl || raw.imageUrl || undefined,
      createdAt: m.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  });

  const existingItemNames = new Set((db.items || []).map((i) => i.name.toLowerCase()));
  const finalItems: ItemEntity[] = [
    ...(db.items || []),
    ...convertedItems.filter((i) => !existingItemNames.has(i.name.toLowerCase())),
  ];

  const updatedDb: AppDatabase = {
    ...db,
    monsters: cleanMonsters,
    items: finalItems,
  };

  saveDatabase(updatedDb);
  return { updatedDb, convertedCount: convertedItems.length, convertedItems };
}

export function exportFullDatabaseJson(db: AppDatabase): string {
  return JSON.stringify(db, null, 2);
}

export function importFullDatabaseJson(jsonString: string): { success: boolean; db?: AppDatabase; error?: string } {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed.monsters && !parsed.spells && !parsed.campaigns) {
      return { success: false, error: 'Invalid database backup JSON format.' };
    }
    const merged: AppDatabase = {
      version: parsed.version || 1,
      templates: { ...DEFAULT_TEMPLATES, ...(parsed.templates || {}) },
      monsters: parsed.monsters || [],
      spells: parsed.spells || [],
      items: parsed.items || [],
      players: parsed.players || [],
      tables: parsed.tables || [],
      campaigns: parsed.campaigns || [],
      encounters: parsed.encounters || [],
      maps: parsed.maps || [],
      customBooks: parsed.customBooks && parsed.customBooks.length > 0 ? parsed.customBooks : [DEFAULT_CUSTOM_BOOK],
      handbookOverrides: parsed.handbookOverrides || {},
      handbookCustomEntries: parsed.handbookCustomEntries || [],
      bookmarks: parsed.bookmarks || [],
      customSubclasses: parsed.customSubclasses || [],
      customFeats: parsed.customFeats || [],
      customBackgrounds: parsed.customBackgrounds || [],
      customSpecies: parsed.customSpecies || [],
    };
    saveDatabase(merged);
    return { success: true, db: merged };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to parse JSON backup.' };
  }
}

// ---------------------------------------------------------------------------
// Cloud Sync Types & Utilities
// ---------------------------------------------------------------------------

export interface CloudSyncConfig {
  folderPath: string | null;
  autoSync: boolean;
  lastSynced: string | null;
  fileExists?: boolean;
  fileMtime?: string | null;
  fileSize?: number | null;
}

export function formatBytes(bytes?: number | null): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
