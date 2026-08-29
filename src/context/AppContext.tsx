import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { EntityType, TemplateDefinition, BaseEntity } from '../types/entity';
import { MonsterEntity } from '../types/monster';
import { SpellEntity } from '../types/spell';
import { ItemEntity } from '../types/item';
import { PlayerEntity } from '../types/player';
import { RollTableEntity } from '../types/rollTable';
import { CampaignEntity, CampaignNote } from '../types/campaign';
import { EncounterEntity } from '../types/encounter';
import { BattleMapEntity, MapToken, MapWallSegment } from '../types/map';
import { CombatState, Combatant, CombatLogEntry, ActiveCondition } from '../types/combat';
import { RollBreakdown, rollDice } from '../services/diceService';
import { 
  loadDatabase, 
  saveDatabase, 
  AppDatabase, 
  exportFullDatabaseJson, 
  importFullDatabaseJson, 
  getInitialDatabase,
  DatabaseSnapshot,
  getSnapshots,
  createSnapshot,
  restoreSnapshot,
  deleteSnapshot as deleteSnapshotStorage,
  convertMisclassifiedMonstersToItems,
  CloudSyncConfig,
  formatBytes
} from '../services/storageService';
import { DEFAULT_TEMPLATES } from '../services/templateEngine';
import { playerSyncService } from '../services/playerSyncService';
import { ProjectedMedia } from '../types/display';
import { CustomBookEntity, CustomChapterEntity, HandbookTarget, HandbookChapterOverride } from '../types/handbook';

export type MainNavTab = 'compendium' | 'party' | 'notes' | 'encounters' | 'combat' | 'maps' | 'templates' | 'tools' | 'handbook' | 'dice' | 'settings';

interface AppContextType {
  // Navigation
  activeTab: MainNavTab;
  setActiveTab: (tab: MainNavTab) => void;
  compendiumSubTab: 'monsters' | 'npcs' | 'spells' | 'items' | 'tables';
  setCompendiumSubTab: (tab: 'monsters' | 'npcs' | 'spells' | 'items' | 'tables') => void;
  handbookTarget: HandbookTarget | null;
  setHandbookTarget: (target: HandbookTarget | null) => void;
  templateSelectedType: EntityType;
  setTemplateSelectedType: (type: EntityType) => void;
  isRadialMenuOpen: boolean;
  setIsRadialMenuOpen: (open: boolean) => void;
  toggleRadialMenu: () => void;
  isExternalDisplayModalOpen: boolean;
  setIsExternalDisplayModalOpen: (open: boolean) => void;
  projectMediaToDisplay: (media: ProjectedMedia) => void;
  clearProjectedMedia: () => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  toggleSidebar: () => void;

  // Snapshots & Rollback
  snapshots: DatabaseSnapshot[];
  isRollbackModalOpen: boolean;
  setIsRollbackModalOpen: (open: boolean) => void;
  createManualSnapshot: (description: string) => void;
  rollbackToSnapshot: (snapshotId: string) => void;
  deleteSnapshot: (snapshotId: string) => void;
  convertMisclassifiedItems: () => void;

  // Database
  db: AppDatabase;
  templates: Record<string, TemplateDefinition>;
  updateTemplate: (type: EntityType, template: TemplateDefinition) => void;
  resetTemplateToDefault: (type: EntityType) => void;

  // Selected Entities
  activeCampaignId: string | null;
  setActiveCampaignId: (id: string | null) => void;
  selectedMonster: MonsterEntity | null;
  setSelectedMonster: (monster: MonsterEntity | null) => void;
  selectedSpell: SpellEntity | null;
  setSelectedSpell: (spell: SpellEntity | null) => void;
  selectedItem: ItemEntity | null;
  setSelectedItem: (item: ItemEntity | null) => void;

  // CRUD Operations
  saveMonster: (monster: MonsterEntity) => void;
  deleteMonster: (id: string) => void;
  saveSpell: (spell: SpellEntity) => void;
  deleteSpell: (id: string) => void;
  saveItem: (item: ItemEntity) => void;
  deleteItem: (id: string) => void;
  savePlayer: (player: PlayerEntity) => void;
  deletePlayer: (id: string) => void;
  playerRest: (playerId: string, restType: 'short' | 'long') => void;
  saveCampaign: (campaign: CampaignEntity) => void;
  deleteCampaign: (id: string) => void;
  saveCampaignNote: (campaignId: string, note: CampaignNote) => void;
  deleteCampaignNote: (campaignId: string, noteId: string) => void;
  saveEncounter: (encounter: EncounterEntity) => void;
  deleteEncounter: (id: string) => void;
  saveRollTable: (table: RollTableEntity) => void;
  deleteRollTable: (id: string) => void;
  saveCustomBook: (book: CustomBookEntity) => void;
  deleteCustomBook: (id: string) => void;
  saveCustomChapter: (bookId: string, chapter: CustomChapterEntity) => void;
  deleteCustomChapter: (bookId: string, chapterId: string) => void;
  saveChapterOverride: (chapterId: string, override: HandbookChapterOverride) => void;
  resetChapterOverride: (chapterId: string) => void;
  bulkAddEntities: (type: EntityType, entities: BaseEntity[]) => void;

  // Battle Maps & VTT
  activeMapId: string | null;
  setActiveMapId: (id: string | null) => void;
  saveMap: (map: BattleMapEntity) => void;
  deleteMap: (id: string) => void;
  addTokenToMap: (mapId: string, token: MapToken) => void;
  updateMapToken: (mapId: string, tokenId: string, updates: Partial<MapToken>) => void;
  deleteMapToken: (mapId: string, tokenId: string) => void;
  toggleDoorOnMap: (mapId: string, wallId: string) => void;
  addWallToMap: (mapId: string, wall: MapWallSegment) => void;
  deleteWallFromMap: (mapId: string, wallId: string) => void;

  // Combat State & Runner
  combatState: CombatState;
  startCombatFromEncounter: (encounter: EncounterEntity) => void;
  startCombatFromMapTokens: (mapId: string, initiatives: { tokenId: string; initiative: number }[]) => void;
  endCombat: () => void;
  nextTurn: () => void;
  prevTurn: () => void;
  setInitiative: (combatantId: string, initiative: number) => void;
  modifyCombatantHp: (combatantId: string, amount: number, isTemp?: boolean) => void;
  addConditionToCombatant: (combatantId: string, condition: Omit<ActiveCondition, 'appliedRound'>) => void;
  removeConditionFromCombatant: (combatantId: string, conditionId: string) => void;
  setCombatantConcentration: (combatantId: string, spellName: string | null) => void;
  executeAttackRoll: (combatant: Combatant, actionName: string, attackBonus?: number, damageDice?: string, damageType?: string) => void;
  addCombatLog: (entry: Omit<CombatLogEntry, 'id' | 'timestamp'>) => void;

  // Dice Drawer & History
  diceHistory: RollBreakdown[];
  isDiceDrawerOpen: boolean;
  setIsDiceDrawerOpen: (open: boolean) => void;
  rollCustomFormula: (formula: string, options?: { advantage?: boolean; disadvantage?: boolean; isCrit?: boolean }, speaker?: string) => RollBreakdown;
  clearDiceHistory: () => void;

  // Backup / Import / Export
  exportDatabaseJson: () => string;
  importDatabaseJson: (json: string) => boolean;
  resetDatabaseToDefaults: () => void;

  // Google Drive & Cloud Folder Sync
  cloudSyncConfig: {
    folderPath: string | null;
    autoSync: boolean;
    lastSynced: string | null;
    fileExists?: boolean;
    fileMtime?: string | null;
    fileSize?: number | null;
  };
  isSyncing: boolean;
  hasUnsavedCloudChanges: boolean;
  syncNow: () => Promise<void>;
  selectCloudFolder: () => Promise<{ success: boolean; hasExistingDb?: boolean; folderPath?: string }>;
  migrateLocalToCloud: () => Promise<boolean>;
  loadFromCloud: () => Promise<boolean>;
  openCloudFolder: () => Promise<void>;
  toggleAutoCloudSync: (enabled: boolean) => Promise<void>;
  disconnectCloudSync: () => Promise<void>;

  // Toast notifications
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [db, setDb] = useState<AppDatabase>(() => loadDatabase());
  const [activeTab, setActiveTab] = useState<MainNavTab>('encounters');
  const [compendiumSubTab, setCompendiumSubTab] = useState<'monsters' | 'npcs' | 'spells' | 'items' | 'tables'>('monsters');
  const [handbookTarget, setHandbookTarget] = useState<HandbookTarget | null>(null);
  const [templateSelectedType, setTemplateSelectedType] = useState<EntityType>('monster');
  const [snapshots, setSnapshots] = useState<DatabaseSnapshot[]>(() => getSnapshots());
  const [isRollbackModalOpen, setIsRollbackModalOpen] = useState(false);
  const [isRadialMenuOpen, setIsRadialMenuOpen] = useState(false);
  const [isDiceDrawerOpen, setIsDiceDrawerOpen] = useState(false);
  const [diceHistory, setDiceHistory] = useState<RollBreakdown[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [activeCampaignId, setActiveCampaignId] = useState<string | null>(db.campaigns[0]?.id || null);
  const [selectedMonster, setSelectedMonster] = useState<MonsterEntity | null>(null);
  const [selectedSpell, setSelectedSpell] = useState<SpellEntity | null>(null);
  const [selectedItem, setSelectedItem] = useState<ItemEntity | null>(null);

  const [combatState, setCombatState] = useState<CombatState>({
    isActive: false,
    round: 1,
    currentTurnIndex: 0,
    combatants: [],
    log: [],
  });

  const [isExternalDisplayModalOpen, setIsExternalDisplayModalOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleSidebar = useCallback(() => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  }, []);

  // Global Ctrl+B shortcut to toggle sidebar collapse
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        const target = e.target as HTMLElement;
        if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
          return;
        }
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar]);

  // Cloud Sync State
  const [cloudSyncConfig, setCloudSyncConfig] = useState<{
    folderPath: string | null;
    autoSync: boolean;
    lastSynced: string | null;
    fileExists?: boolean;
    fileMtime?: string | null;
    fileSize?: number | null;
  }>({
    folderPath: null,
    autoSync: false,
    lastSynced: null,
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [hasUnsavedCloudChanges, setHasUnsavedCloudChanges] = useState(false);
  const [isInitialLoadDone, setIsInitialLoadDone] = useState(false);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }, []);

  const toggleRadialMenu = useCallback(() => {
    setIsRadialMenuOpen((prev) => !prev);
  }, []);

  // Initial startup: Load rich database from Cloud Sync folder or Electron AppData local_database.json
  useEffect(() => {
    async function initDesktopStorage() {
      if (typeof window !== 'undefined' && (window as any).electronAPI?.cloudSync) {
        try {
          const cfg = await (window as any).electronAPI.cloudSync.getConfig();
          if (cfg && cfg.folderPath) {
            setCloudSyncConfig(cfg);
            // If cloud folder has database, load it as primary source of truth
            if (cfg.fileExists) {
              const cloudRes = await (window as any).electronAPI.cloudSync.readDatabase();
              if (cloudRes && cloudRes.success && cloudRes.content) {
                const importRes = importFullDatabaseJson(cloudRes.content);
                if (importRes.success && importRes.db) {
                  setDb(importRes.db);
                  setSnapshots(getSnapshots());
                  if (importRes.db.campaigns && importRes.db.campaigns.length > 0) {
                    setActiveCampaignId((prev) => {
                      const exists = importRes.db?.campaigns.some((c) => c.id === prev);
                      return exists ? prev : importRes.db!.campaigns[0].id;
                    });
                  }
                  if (importRes.db.maps && importRes.db.maps.length > 0) {
                    setActiveMapId((prev) => {
                      const exists = importRes.db?.maps.some((m) => m.id === prev);
                      return exists ? prev : importRes.db!.maps[0].id;
                    });
                  }
                  setIsInitialLoadDone(true);
                  return;
                }
              }
            }
          }

          // Fallback to local_database.json in AppData (bypasses 5MB localStorage limit)
          const localRes = await (window as any).electronAPI.cloudSync.getLocalDatabase();
          if (localRes && localRes.success && localRes.content) {
            const importRes = importFullDatabaseJson(localRes.content);
            if (importRes.success && importRes.db) {
              setDb(importRes.db);
              setSnapshots(getSnapshots());
              if (importRes.db.campaigns && importRes.db.campaigns.length > 0) {
                setActiveCampaignId((prev) => {
                  const exists = importRes.db?.campaigns.some((c) => c.id === prev);
                  return exists ? prev : importRes.db!.campaigns[0].id;
                });
              }
              if (importRes.db.maps && importRes.db.maps.length > 0) {
                setActiveMapId((prev) => {
                  const exists = importRes.db?.maps.some((m) => m.id === prev);
                  return exists ? prev : importRes.db!.maps[0].id;
                });
              }
            }
          }
        } catch (err) {
          console.error('Error during initial desktop storage load:', err);
        } finally {
          setIsInitialLoadDone(true);
        }
      } else {
        setIsInitialLoadDone(true);
      }
    }

    initDesktopStorage();
  }, []);

  // Idle-debounced local auto-save (3 seconds after last edit to prevent typing/combat lag)
  useEffect(() => {
    if (!isInitialLoadDone) return;
    setHasUnsavedCloudChanges(true);
    const timer = setTimeout(() => {
      saveDatabase(db);
      if (typeof window !== 'undefined' && (window as any).electronAPI?.cloudSync?.saveLocalDatabase) {
        (window as any).electronAPI.cloudSync.saveLocalDatabase(db).catch(() => {});
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [db, isInitialLoadDone]);

  // Periodic Cloud Sync (Every 5 minutes if there are unsaved changes)
  useEffect(() => {
    if (
      !isInitialLoadDone ||
      typeof window === 'undefined' || 
      !(window as any).electronAPI?.cloudSync || 
      !cloudSyncConfig.folderPath || 
      !cloudSyncConfig.autoSync
    ) return;

    const interval = setInterval(async () => {
      if (!hasUnsavedCloudChanges) return;
      try {
        setIsSyncing(true);
        const res = await (window as any).electronAPI.cloudSync.writeDatabase(db);
        if (res && res.success) {
          setHasUnsavedCloudChanges(false);
          setCloudSyncConfig((prev) => ({ ...prev, lastSynced: res.lastSynced, fileExists: true, fileSize: res.size }));
        }
      } catch (e) {
        console.error('Periodic 5-min cloud sync failed:', e);
      } finally {
        setIsSyncing(false);
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [db, cloudSyncConfig.folderPath, cloudSyncConfig.autoSync, isInitialLoadDone, hasUnsavedCloudChanges]);

  // Ensure any pending changes are flushed to disk & cloud on app window close
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (typeof window !== 'undefined' && (window as any).electronAPI?.cloudSync) {
        // Immediate local file flush
        (window as any).electronAPI.cloudSync.saveLocalDatabase(db);
        // Immediate cloud file flush if configured
        if (cloudSyncConfig.folderPath && cloudSyncConfig.autoSync && hasUnsavedCloudChanges) {
          (window as any).electronAPI.cloudSync.writeDatabase(db);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [db, cloudSyncConfig.folderPath, cloudSyncConfig.autoSync, hasUnsavedCloudChanges]);

  // Listen to external changes from Google Drive
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).electronAPI?.cloudSync) {
      const cleanup = (window as any).electronAPI.cloudSync.onExternalChange(async (info: any) => {
        try {
          const res = await (window as any).electronAPI.cloudSync.readDatabase();
          if (res && res.success && res.content) {
            createSnapshot(db, 'Pre-Cloud-Sync Automatic Backup', 'restore');
            const importRes = importFullDatabaseJson(res.content);
            if (importRes.success && importRes.db) {
              setDb(importRes.db);
              setSnapshots(getSnapshots());
              setHasUnsavedCloudChanges(false);
              setCloudSyncConfig((prev) => ({
                ...prev,
                lastSynced: new Date().toISOString(),
                fileExists: true,
                fileSize: res.size,
                fileMtime: res.mtime,
              }));
              showToast('✨ Synchronized latest database from Google Drive / Cloud!');
            }
          }
        } catch (e) {
          console.error('Error auto-syncing external cloud database change:', e);
        }
      });

      return () => {
        if (typeof cleanup === 'function') cleanup();
      };
    }
  }, [db, showToast]);

  // Global Keyboard Shortcuts (Ctrl+Space for Radial Menu, Ctrl+D for Dice Tray)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.code === 'Space') {
        e.preventDefault();
        toggleRadialMenu();
      }
      if (e.ctrlKey && (e.key === 'd' || e.key === 'D')) {
        e.preventDefault();
        setIsDiceDrawerOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleRadialMenu]);

  // Template Update
  const updateTemplate = useCallback((type: EntityType, template: TemplateDefinition) => {
    setDb((prev) => ({
      ...prev,
      templates: { ...prev.templates, [type]: template },
    }));
    showToast(`Template updated for ${template.displayName}`);
  }, [showToast]);

  const resetTemplateToDefault = useCallback((type: EntityType) => {
    const defaultTmpl = DEFAULT_TEMPLATES[type];
    if (defaultTmpl) {
      setDb((prev) => ({
        ...prev,
        templates: { ...prev.templates, [type]: defaultTmpl },
      }));
      showToast(`Reset ${defaultTmpl.displayName} template to default schema`);
    }
  }, [showToast]);

  // CRUD Monsters
  const saveMonster = useCallback((monster: MonsterEntity) => {
    setDb((prev) => {
      const idx = prev.monsters.findIndex((m) => m.id === monster.id);
      const updated = [...prev.monsters];
      if (idx >= 0) {
        updated[idx] = monster;
      } else {
        updated.unshift(monster);
      }
      return { ...prev, monsters: updated };
    });
    showToast(`Saved monster: ${monster.name}`);
  }, [showToast]);

  const deleteMonster = useCallback((id: string) => {
    setDb((prev) => ({
      ...prev,
      monsters: prev.monsters.filter((m) => m.id !== id),
    }));
    showToast('Monster removed');
  }, [showToast]);

  // CRUD Spells
  const saveSpell = useCallback((spell: SpellEntity) => {
    setDb((prev) => {
      const idx = prev.spells.findIndex((s) => s.id === spell.id);
      const updated = [...prev.spells];
      if (idx >= 0) {
        updated[idx] = spell;
      } else {
        updated.unshift(spell);
      }
      return { ...prev, spells: updated };
    });
    showToast(`Saved spell: ${spell.name}`);
  }, [showToast]);

  const deleteSpell = useCallback((id: string) => {
    setDb((prev) => ({
      ...prev,
      spells: prev.spells.filter((s) => s.id !== id),
    }));
    showToast('Spell removed');
  }, [showToast]);

  // CRUD Items
  const saveItem = useCallback((item: ItemEntity) => {
    setDb((prev) => {
      const idx = prev.items.findIndex((i) => i.id === item.id);
      const updated = [...prev.items];
      if (idx >= 0) {
        updated[idx] = item;
      } else {
        updated.unshift(item);
      }
      return { ...prev, items: updated };
    });
    showToast(`Saved item: ${item.name}`);
  }, [showToast]);

  const deleteItem = useCallback((id: string) => {
    setDb((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i.id !== id),
    }));
    showToast('Item removed');
  }, [showToast]);

  // CRUD Players
  const savePlayer = useCallback((player: PlayerEntity) => {
    setDb((prev) => {
      const idx = prev.players.findIndex((p) => p.id === player.id);
      const isNew = idx < 0;
      const updatedPlayers = [...prev.players];
      if (!isNew) {
        updatedPlayers[idx] = player;
      } else {
        updatedPlayers.unshift(player);
      }

      // Automatically associate character with the active/target campaign
      const targetCampId = player.campaignId || activeCampaignId || prev.campaigns[0]?.id;
      let updatedCampaigns = prev.campaigns;

      if (targetCampId && prev.campaigns.length > 0) {
        updatedCampaigns = prev.campaigns.map((camp) => {
          if (camp.id === targetCampId) {
            const ids = camp.playerCharacterIds || [];
            if (!ids.includes(player.id)) {
              return {
                ...camp,
                playerCharacterIds: [...ids, player.id],
                updatedAt: new Date().toISOString(),
              };
            }
          }
          return camp;
        });
      }

      return { ...prev, players: updatedPlayers, campaigns: updatedCampaigns };
    });
    showToast(`Saved character: ${player.name}`);
  }, [activeCampaignId, showToast]);

  const deletePlayer = useCallback((id: string) => {
    setDb((prev) => ({
      ...prev,
      players: prev.players.filter((p) => p.id !== id),
      campaigns: prev.campaigns.map((camp) => ({
        ...camp,
        playerCharacterIds: (camp.playerCharacterIds || []).filter((pId) => pId !== id),
      })),
    }));
    showToast('Character removed');
  }, [showToast]);

  const playerRest = useCallback((playerId: string, restType: 'short' | 'long') => {
    setDb((prev) => {
      const updated = prev.players.map((p) => {
        if (p.id !== playerId) return p;
        if (restType === 'long') {
          // Long Rest: full HP, reset spell slots
          const resetSlots = p.spellSlots?.map((s) => ({ ...s, used: 0 }));
          return {
            ...p,
            currentHp: p.maxHp,
            tempHp: 0,
            spellSlots: resetSlots,
          };
        } else {
          // Short Rest
          return p;
        }
      });
      return { ...prev, players: updated };
    });
    showToast(`Character completed a ${restType} rest.`);
  }, [showToast]);

  // CRUD Campaigns
  const saveCampaign = useCallback((campaign: CampaignEntity) => {
    setDb((prev) => {
      const idx = prev.campaigns.findIndex((c) => c.id === campaign.id);
      const updated = [...prev.campaigns];
      if (idx >= 0) {
        updated[idx] = campaign;
      } else {
        updated.unshift(campaign);
      }
      return { ...prev, campaigns: updated };
    });
    showToast(`Saved campaign: ${campaign.name}`);
  }, [showToast]);

  const deleteCampaign = useCallback((id: string) => {
    setDb((prev) => ({
      ...prev,
      campaigns: prev.campaigns.filter((c) => c.id !== id),
    }));
    showToast('Campaign removed');
  }, [showToast]);

  // CRUD Campaign Notes (Hierarchical)
  const saveCampaignNote = useCallback((campaignId: string, note: CampaignNote) => {
    setDb((prev) => {
      const camp = prev.campaigns.find((c) => c.id === campaignId) || prev.campaigns[0];
      if (!camp) return prev;

      const notes = camp.notes || [];
      const idx = notes.findIndex((n) => n.id === note.id);
      let updatedNotes = [...notes];
      if (idx >= 0) {
        updatedNotes[idx] = note;
      } else {
        updatedNotes.unshift(note);
      }

      const updatedCamp = { ...camp, notes: updatedNotes, updatedAt: new Date().toISOString() };
      const campIdx = prev.campaigns.findIndex((c) => c.id === camp.id);
      const updatedCampaigns = [...prev.campaigns];
      updatedCampaigns[campIdx] = updatedCamp;

      return { ...prev, campaigns: updatedCampaigns };
    });
    showToast(`Saved ${note.isFolder ? 'folder' : 'note'}: ${note.name}`);
  }, [showToast]);

  const deleteCampaignNote = useCallback((campaignId: string, noteId: string) => {
    setDb((prev) => {
      const camp = prev.campaigns.find((c) => c.id === campaignId) || prev.campaigns[0];
      if (!camp) return prev;

      const notes = camp.notes || [];

      // Collect note and all its descendant IDs
      const toDeleteIds = new Set<string>([noteId]);
      let changed = true;
      while (changed) {
        changed = false;
        for (const n of notes) {
          if (n.parentId && toDeleteIds.has(n.parentId) && !toDeleteIds.has(n.id)) {
            toDeleteIds.add(n.id);
            changed = true;
          }
        }
      }

      const filteredNotes = notes.filter((n) => !toDeleteIds.has(n.id));
      const updatedCamp = { ...camp, notes: filteredNotes, updatedAt: new Date().toISOString() };
      const campIdx = prev.campaigns.findIndex((c) => c.id === camp.id);
      const updatedCampaigns = [...prev.campaigns];
      updatedCampaigns[campIdx] = updatedCamp;

      return { ...prev, campaigns: updatedCampaigns };
    });
    showToast('Deleted note/folder and contents.');
  }, [showToast]);

  // CRUD Encounters
  const saveEncounter = useCallback((encounter: EncounterEntity) => {
    setDb((prev) => {
      const idx = prev.encounters.findIndex((e) => e.id === encounter.id);
      const updated = [...prev.encounters];
      if (idx >= 0) {
        updated[idx] = encounter;
      } else {
        updated.unshift(encounter);
      }
      return { ...prev, encounters: updated };
    });
    showToast(`Saved encounter: ${encounter.name}`);
  }, [showToast]);

  const deleteEncounter = useCallback((id: string) => {
    setDb((prev) => ({
      ...prev,
      encounters: prev.encounters.filter((e) => e.id !== id),
    }));
    showToast('Encounter removed');
  }, [showToast]);

  // CRUD Tables
  const saveRollTable = useCallback((table: RollTableEntity) => {
    setDb((prev) => {
      const idx = prev.tables.findIndex((t) => t.id === table.id);
      const updated = [...prev.tables];
      if (idx >= 0) {
        updated[idx] = table;
      } else {
        updated.unshift(table);
      }
      return { ...prev, tables: updated };
    });
    showToast(`Saved roll table: ${table.name}`);
  }, [showToast]);

  const deleteRollTable = useCallback((id: string) => {
    setDb((prev) => ({
      ...prev,
      tables: prev.tables.filter((t) => t.id !== id),
    }));
    showToast('Roll table removed');
  }, [showToast]);

  // CRUD Custom Books & Homebrew
  const saveCustomBook = useCallback((book: CustomBookEntity) => {
    setDb((prev) => {
      const books = prev.customBooks || [];
      const idx = books.findIndex((b) => b.id === book.id);
      let updated = [...books];
      if (idx >= 0) {
        updated[idx] = book;
      } else {
        updated.push(book);
      }
      return { ...prev, customBooks: updated };
    });
    showToast(`Saved custom book: ${book.title}`);
  }, [showToast]);

  const deleteCustomBook = useCallback((id: string) => {
    setDb((prev) => ({
      ...prev,
      customBooks: (prev.customBooks || []).filter((b) => b.id !== id),
    }));
    showToast('Custom book removed');
  }, [showToast]);

  const saveCustomChapter = useCallback((bookId: string, chapter: CustomChapterEntity) => {
    setDb((prev) => {
      const books = prev.customBooks || [];
      const bookIdx = books.findIndex((b) => b.id === bookId);
      
      if (bookIdx !== -1) {
        const targetBook = books[bookIdx];
        const chapters = targetBook.chapters || [];
        const chapIdx = chapters.findIndex((c) => c.id === chapter.id);
        let updatedChapters = [...chapters];
        if (chapIdx >= 0) {
          updatedChapters[chapIdx] = chapter;
        } else {
          updatedChapters.push(chapter);
        }

        const updatedBooks = [...books];
        updatedBooks[bookIdx] = {
          ...targetBook,
          chapters: updatedChapters,
          updatedAt: new Date().toISOString(),
        };
        return { ...prev, customBooks: updatedBooks };
      } else {
        const entries = prev.handbookCustomEntries || [];
        const entryIdx = entries.findIndex((e) => e.id === chapter.id);
        let updatedEntries = [...entries];
        const fullChapter = { ...chapter, bookId };
        if (entryIdx >= 0) {
          updatedEntries[entryIdx] = fullChapter;
        } else {
          updatedEntries.push(fullChapter);
        }
        return { ...prev, handbookCustomEntries: updatedEntries };
      }
    });
    showToast(`Saved entry: ${chapter.title}`);
  }, [showToast]);

  const deleteCustomChapter = useCallback((bookId: string, chapterId: string) => {
    setDb((prev) => {
      const books = prev.customBooks || [];
      const bookIdx = books.findIndex((b) => b.id === bookId);

      if (bookIdx !== -1) {
        const targetBook = books[bookIdx];
        const updatedChapters = (targetBook.chapters || []).filter((c) => c.id !== chapterId);
        const updatedBooks = [...books];
        updatedBooks[bookIdx] = {
          ...targetBook,
          chapters: updatedChapters,
          updatedAt: new Date().toISOString(),
        };
        return { ...prev, customBooks: updatedBooks };
      } else {
        const updatedEntries = (prev.handbookCustomEntries || []).filter((c) => c.id !== chapterId);
        return { ...prev, handbookCustomEntries: updatedEntries };
      }
    });
    showToast('Removed entry');
  }, [showToast]);

  const saveChapterOverride = useCallback((chapterId: string, override: HandbookChapterOverride) => {
    setDb((prev) => ({
      ...prev,
      handbookOverrides: {
        ...(prev.handbookOverrides || {}),
        [chapterId]: override,
      },
    }));
    showToast(`Saved changes to ${override.title || 'section'}`);
  }, [showToast]);

  const resetChapterOverride = useCallback((chapterId: string) => {
    setDb((prev) => {
      const overrides = { ...(prev.handbookOverrides || {}) };
      delete overrides[chapterId];
      return {
        ...prev,
        handbookOverrides: overrides,
      };
    });
    showToast('Reset section to official default');
  }, [showToast]);

  const [activeMapId, setActiveMapId] = useState<string | null>(db.maps?.[0]?.id || null);

  // Sync active map to player display
  useEffect(() => {
    const activeMap = db.maps?.find((m) => m.id === activeMapId) || db.maps?.[0] || null;
    playerSyncService.setMap(activeMap);
  }, [activeMapId, db.maps]);

  // Sync combat state to player display
  useEffect(() => {
    playerSyncService.setCombatState(combatState);
  }, [combatState]);

  // Sync campaign info to player display
  useEffect(() => {
    const activeCampaign = db.campaigns.find((c) => c.id === activeCampaignId) || db.campaigns[0];
    if (activeCampaign) {
      playerSyncService.setCampaignInfo({
        name: activeCampaign.name,
        currentLocation: activeCampaign.currentLocation,
        inGameDate: activeCampaign.inGameDate,
      });
    }
  }, [activeCampaignId, db.campaigns]);

  const projectMediaToDisplay = useCallback((media: ProjectedMedia) => {
    playerSyncService.projectMedia(media);
    showToast(`Projected "${media.title}" to Player Display`);
  }, [showToast]);

  const clearProjectedMedia = useCallback(() => {
    playerSyncService.clearProjectedMedia();
    showToast('Cleared projected media from Player Display');
  }, [showToast]);

  // CRUD Maps
  const saveMap = useCallback((map: BattleMapEntity) => {
    setDb((prev) => {
      const maps = prev.maps || [];
      const idx = maps.findIndex((m) => m.id === map.id);
      const updated = [...maps];
      if (idx >= 0) {
        updated[idx] = map;
      } else {
        updated.unshift(map);
      }
      return { ...prev, maps: updated };
    });
    showToast(`Saved battle map: ${map.name}`);
  }, [showToast]);

  const deleteMap = useCallback((id: string) => {
    setDb((prev) => ({
      ...prev,
      maps: (prev.maps || []).filter((m) => m.id !== id),
    }));
    showToast('Battle map removed');
  }, [showToast]);

  const addTokenToMap = useCallback((mapId: string, token: MapToken) => {
    setDb((prev) => {
      const maps = prev.maps || [];
      const updated = maps.map((m) => {
        if (m.id !== mapId) return m;
        return {
          ...m,
          tokens: [...m.tokens.filter((t) => t.id !== token.id), token],
        };
      });
      return { ...prev, maps: updated };
    });
    showToast(`Added ${token.name} to map`);
  }, [showToast]);

  const updateMapToken = useCallback((mapId: string, tokenId: string, updates: Partial<MapToken>) => {
    setDb((prev) => {
      const maps = prev.maps || [];
      const updated = maps.map((m) => {
        if (m.id !== mapId) return m;
        return {
          ...m,
          tokens: m.tokens.map((t) => (t.id === tokenId ? { ...t, ...updates } : t)),
        };
      });
      return { ...prev, maps: updated };
    });
  }, []);

  const deleteMapToken = useCallback((mapId: string, tokenId: string) => {
    setDb((prev) => {
      const maps = prev.maps || [];
      const updated = maps.map((m) => {
        if (m.id !== mapId) return m;
        return {
          ...m,
          tokens: m.tokens.filter((t) => t.id !== tokenId),
        };
      });
      return { ...prev, maps: updated };
    });
    showToast('Removed token from map');
  }, [showToast]);

  const toggleDoorOnMap = useCallback((mapId: string, wallId: string) => {
    setDb((prev) => {
      const maps = prev.maps || [];
      let doorStatus = '';
      const updated = maps.map((m) => {
        if (m.id !== mapId) return m;
        return {
          ...m,
          walls: m.walls.map((w) => {
            if (w.id === wallId && (w.type === 'door' || w.type === 'secretDoor')) {
              const newOpen = !w.isOpen;
              doorStatus = newOpen ? 'opened' : 'closed';
              return { ...w, isOpen: newOpen };
            }
            return w;
          }),
        };
      });
      if (doorStatus) showToast(`Door ${doorStatus}`);
      return { ...prev, maps: updated };
    });
  }, [showToast]);

  const addWallToMap = useCallback((mapId: string, wall: MapWallSegment) => {
    setDb((prev) => {
      const maps = prev.maps || [];
      const updated = maps.map((m) => {
        if (m.id !== mapId) return m;
        return {
          ...m,
          walls: [...m.walls, wall],
        };
      });
      return { ...prev, maps: updated };
    });
  }, []);

  const deleteWallFromMap = useCallback((mapId: string, wallId: string) => {
    setDb((prev) => {
      const maps = prev.maps || [];
      const updated = maps.map((m) => {
        if (m.id !== mapId) return m;
        return {
          ...m,
          walls: m.walls.filter((w) => w.id !== wallId),
        };
      });
      return { ...prev, maps: updated };
    });
    showToast('Removed wall segment');
  }, [showToast]);

  // Bulk Import
  const bulkAddEntities = useCallback((type: EntityType, entities: BaseEntity[]) => {
    // Save snapshot prior to bulk addition
    createSnapshot(db, `Before importing ${entities.length} ${type}s`, 'bulk_import');
    setSnapshots(getSnapshots());

    setDb((prev) => {
      if (type === 'monster') {
        return { ...prev, monsters: [...(entities as MonsterEntity[]), ...prev.monsters] };
      } else if (type === 'spell') {
        return { ...prev, spells: [...(entities as SpellEntity[]), ...prev.spells] };
      } else if (type === 'item') {
        return { ...prev, items: [...(entities as ItemEntity[]), ...prev.items] };
      } else if (type === 'player') {
        return { ...prev, players: [...(entities as PlayerEntity[]), ...prev.players] };
      } else if (type === 'rollTable') {
        return { ...prev, tables: [...(entities as RollTableEntity[]), ...prev.tables] };
      } else if (type === 'campaignNote') {
        const rawNotes = entities as any[];
        const updatedCampaigns = [...prev.campaigns];
        if (updatedCampaigns.length === 0) {
          updatedCampaigns.push({
            id: 'camp-default',
            type: 'campaign',
            name: 'Default Campaign',
            description: 'Main campaign world',
            playerCharacterIds: [],
            notes: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }

        // Group notes by matched campaign
        const campaignMap = new Map<string, any[]>();
        for (const raw of rawNotes) {
          let targetCampId = activeCampaignId || updatedCampaigns[0].id;
          if (raw.campaignId) {
            const rawCampStr = String(raw.campaignId).trim().toLowerCase();
            const matched = updatedCampaigns.find(
              (c) => c.id.toLowerCase() === rawCampStr || c.name.toLowerCase() === rawCampStr
            );
            if (matched) {
              targetCampId = matched.id;
            } else {
              // Create new campaign if a non-existing name was specified
              const newCampId = `camp-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
              const newCamp = {
                id: newCampId,
                type: 'campaign' as const,
                name: String(raw.campaignId).trim(),
                description: `Imported campaign for ${raw.campaignId}`,
                playerCharacterIds: [],
                notes: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };
              updatedCampaigns.push(newCamp);
              targetCampId = newCampId;
            }
          }

          if (!campaignMap.has(targetCampId)) {
            campaignMap.set(targetCampId, []);
          }
          campaignMap.get(targetCampId)!.push(raw);
        }

        // For each campaign, resolve hierarchical parent-child relationships
        for (let i = 0; i < updatedCampaigns.length; i++) {
          const camp = updatedCampaigns[i];
          const batchNotes = campaignMap.get(camp.id);
          if (!batchNotes || batchNotes.length === 0) continue;

          const existingNotes = [...(camp.notes || [])];
          const existingById = new Map<string, string>();
          const existingByName = new Map<string, string>();

          for (const n of existingNotes) {
            existingById.set(n.id, n.id);
            existingByName.set(n.name.toLowerCase(), n.id);
          }

          // Index all notes in this batch by name
          const batchByName = new Map<string, string>();
          for (const n of batchNotes) {
            batchByName.set(n.name.toLowerCase(), n.id);
          }

          const autoCreatedFolders: CampaignNote[] = [];

          // Second pass: resolve parentId for each note in batch
          const processedBatch: CampaignNote[] = batchNotes.map((rawNote) => {
            let parentId: string | null = null;
            const parentKey = rawNote.parentId ? String(rawNote.parentId).trim() : '';

            if (parentKey) {
              const lowerParent = parentKey.toLowerCase();
              if (existingById.has(parentKey)) {
                parentId = parentKey;
              } else if (existingByName.has(lowerParent)) {
                parentId = existingByName.get(lowerParent)!;
              } else if (batchByName.has(lowerParent)) {
                parentId = batchByName.get(lowerParent)!;
              } else {
                // Parent does not exist in campaign or batch yet -> auto-create parent folder!
                const newFolderId = `folder-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
                const newFolder: CampaignNote = {
                  id: newFolderId,
                  type: 'campaignNote',
                  campaignId: camp.id,
                  category: 'Folder',
                  name: parentKey,
                  content: '',
                  isFolder: true,
                  isPlayerVisible: false,
                  parentId: null,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                };
                autoCreatedFolders.push(newFolder);
                existingByName.set(lowerParent, newFolderId);
                existingById.set(newFolderId, newFolderId);
                parentId = newFolderId;
              }
            }

            return {
              id: rawNote.id || `note-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
              type: 'campaignNote',
              campaignId: camp.id,
              name: rawNote.name,
              category: rawNote.category || (rawNote.isFolder ? 'Folder' : 'Lore'),
              isFolder: Boolean(rawNote.isFolder),
              isPlayerVisible: Boolean(rawNote.isPlayerVisible),
              content: rawNote.content || '',
              tags: Array.isArray(rawNote.tags) ? rawNote.tags : [],
              parentId: parentId,
              createdAt: rawNote.createdAt || new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
          });

          updatedCampaigns[i] = {
            ...camp,
            notes: [...existingNotes, ...autoCreatedFolders, ...processedBatch],
            updatedAt: new Date().toISOString(),
          };
        }

        return { ...prev, campaigns: updatedCampaigns };
      }
      return prev;
    });
    showToast(`Bulk imported ${entities.length} ${type}s successfully!`);
  }, [db, activeCampaignId, showToast]);

  // Dice Rolls
  const rollCustomFormula = useCallback((formula: string, options?: { advantage?: boolean; disadvantage?: boolean; isCrit?: boolean }, speaker = 'GM') => {
    const result = rollDice(formula, options);
    setDiceHistory((prev) => [result, ...prev.slice(0, 49)]);

    if (combatState.isActive) {
      addCombatLog({
        round: combatState.round,
        speaker,
        message: `Rolled ${result.expression}: ${result.details}`,
        type: 'roll',
        rollDetails: {
          formula: result.expression,
          total: result.total,
          breakdown: result.details,
          isCrit: result.isCrit,
          isFumble: result.isFumble,
        },
      });
    }

    // Broadcast roll to external player display
    playerSyncService.broadcastDiceRoll({ ...result, label: speaker });

    return result;
  }, [combatState.isActive, combatState.round]);

  const clearDiceHistory = useCallback(() => {
    setDiceHistory([]);
  }, []);

  // Combat Log
  const addCombatLog = useCallback((entry: Omit<CombatLogEntry, 'id' | 'timestamp'>) => {
    const fullEntry: CombatLogEntry = {
      ...entry,
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
    setCombatState((prev) => ({
      ...prev,
      log: [fullEntry, ...prev.log],
    }));
  }, []);

  // Start Combat from Encounter
  const startCombatFromEncounter = useCallback((encounter: EncounterEntity) => {
    const combatants: Combatant[] = [];
    const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'];

    // Add Players
    const activePlayers = db.players.filter((p) => encounter.partyPlayerIds.includes(p.id));
    for (const p of activePlayers) {
      const dexMod = Math.floor((p.abilities.dex - 10) / 2);
      const initRoll = Math.floor(Math.random() * 20) + 1 + p.initiativeBonus;
      combatants.push({
        id: `c-player-${p.id}`,
        entityId: p.id,
        name: p.name,
        isPlayer: true,
        avatarUrl: p.avatarUrl,
        tokenUrl: p.tokenUrl,
        initiative: initRoll,
        tieBreaker: dexMod,
        maxHp: p.maxHp,
        currentHp: p.currentHp,
        tempHp: p.tempHp,
        armorClass: p.armorClass,
        speed: p.speed,
        abilities: p.abilities,
        passivePerception: p.passivePerception,
        conditions: [],
        notes: `${p.characterClass} (AC ${p.armorClass})`,
      });
    }

    // Add Monsters
    let colorIdx = 0;
    for (const slot of encounter.monsters) {
      const m = db.monsters.find((mon) => mon.id === slot.monsterId);
      if (!m) continue;

      const dexMod = Math.floor((m.abilities.dex - 10) / 2);
      for (let i = 1; i <= slot.count; i++) {
        const initRoll = Math.floor(Math.random() * 20) + 1 + dexMod;
        const color = colors[colorIdx % colors.length];
        const suffix = slot.count > 1 ? ` ${i}` : '';

        combatants.push({
          id: `c-monster-${m.id}-${i}-${Date.now()}`,
          entityId: m.id,
          name: `${slot.customName || m.name}${suffix}`,
          isPlayer: false,
          avatarUrl: m.avatarUrl,
          tokenUrl: m.tokenUrl,
          initiative: initRoll,
          tieBreaker: dexMod,
          maxHp: slot.customHp || m.hitPoints,
          currentHp: slot.customHp || m.hitPoints,
          tempHp: 0,
          armorClass: slot.customAc || m.armorClass,
          speed: m.speed,
          abilities: m.abilities,
          conditions: [],
          color,
          actions: m.actions,
          bonusActions: m.bonusActions,
          reactions: m.reactions,
          legendaryActions: m.legendaryActions,
          traits: m.traits,
          spellcasting: m.spellcasting,
          legendaryActionsMax: m.legendaryCount || (m.legendaryActions?.length ? 3 : 0),
          legendaryActionsUsed: 0,
          reactionUsed: false,
        });
      }
      colorIdx++;
    }

    combatants.sort((a, b) => {
      if (b.initiative !== a.initiative) return b.initiative - a.initiative;
      return b.tieBreaker - a.tieBreaker;
    });

    setCombatState({
      isActive: true,
      round: 1,
      currentTurnIndex: 0,
      combatants,
      log: [
        {
          id: `log-start-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          round: 1,
          speaker: 'Dungeon Daddy',
          message: `Combat started for "${encounter.name}"! Round 1 begins with ${combatants[0]?.name || 'Nobody'}.`,
          type: 'system',
        },
      ],
      startTime: new Date().toLocaleTimeString(),
    });

    setActiveTab('combat');
    showToast(`Combat started: ${encounter.name}`);
  }, [db.players, db.monsters, showToast]);

  // Start Combat from Map Tokens
  const startCombatFromMapTokens = useCallback((mapId: string, initiatives: { tokenId: string; initiative: number }[]) => {
    const map = db.maps.find((m) => m.id === mapId);
    if (!map) return;

    const combatants: Combatant[] = [];
    const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'];
    let colorIdx = 0;

    for (const initEntry of initiatives) {
      const token = map.tokens.find((t) => t.id === initEntry.tokenId);
      if (!token) continue;

      const color = colors[colorIdx % colors.length];
      const combatantId = `c-${token.id}-${Date.now()}`;

      if (token.isPlayer) {
        const player = db.players.find((p) => p.id === token.entityId);
        const dexMod = player ? Math.floor((player.abilities.dex - 10) / 2) : 0;

        combatants.push({
          id: combatantId,
          entityId: token.entityId || token.id,
          name: token.name,
          isPlayer: true,
          avatarUrl: token.avatarUrl || player?.avatarUrl,
          tokenUrl: token.tokenUrl || player?.tokenUrl,
          initiative: initEntry.initiative,
          tieBreaker: dexMod,
          maxHp: token.maxHp || player?.maxHp || 20,
          currentHp: token.currentHp ?? (player?.currentHp || 20),
          tempHp: token.tempHp || 0,
          armorClass: token.armorClass || player?.armorClass || 15,
          speed: player?.speed || '30 ft.',
          abilities: player?.abilities || { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
          conditions: (token.conditions || []).map((c) => ({ id: `cond-${Date.now()}-${c}`, name: c, appliedRound: 1 })),
          color,
          reactionUsed: false,
        });
      } else {
        const monster = db.monsters.find((m) => m.id === token.entityId);
        const dexMod = monster ? Math.floor((monster.abilities.dex - 10) / 2) : 0;

        combatants.push({
          id: combatantId,
          entityId: token.entityId || token.id,
          name: token.name,
          isPlayer: false,
          avatarUrl: token.avatarUrl || monster?.avatarUrl,
          tokenUrl: token.tokenUrl || monster?.tokenUrl,
          initiative: initEntry.initiative,
          tieBreaker: dexMod,
          maxHp: token.maxHp || monster?.hitPoints || 10,
          currentHp: token.currentHp ?? (monster?.hitPoints || 10),
          tempHp: token.tempHp || 0,
          armorClass: token.armorClass || monster?.armorClass || 12,
          speed: monster?.speed || '30 ft.',
          abilities: monster?.abilities || { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
          conditions: (token.conditions || []).map((c) => ({ id: `cond-${Date.now()}-${c}`, name: c, appliedRound: 1 })),
          color,
          actions: monster?.actions,
          bonusActions: monster?.bonusActions,
          reactions: monster?.reactions,
          legendaryActions: monster?.legendaryActions,
          traits: monster?.traits,
          spellcasting: monster?.spellcasting,
          legendaryActionsMax: monster?.legendaryCount || (monster?.legendaryActions?.length ? 3 : 0),
          legendaryActionsUsed: 0,
          reactionUsed: false,
        });
      }
      colorIdx++;
    }

    combatants.sort((a, b) => {
      if (b.initiative !== a.initiative) return b.initiative - a.initiative;
      return b.tieBreaker - a.tieBreaker;
    });

    // Update tokens on map to link combatantId
    setDb((prev) => ({
      ...prev,
      maps: prev.maps.map((m) => {
        if (m.id !== mapId) return m;
        return {
          ...m,
          tokens: m.tokens.map((t) => {
            const matched = combatants.find((c) => c.id.includes(t.id));
            return matched ? { ...t, combatantId: matched.id } : t;
          }),
        };
      }),
    }));

    setCombatState({
      isActive: true,
      round: 1,
      currentTurnIndex: 0,
      combatants,
      log: [
        {
          id: `log-start-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          round: 1,
          speaker: 'Dungeon Daddy',
          message: `Combat started on battle map "${map.name}"! Round 1 begins with ${combatants[0]?.name || 'Nobody'}.`,
          type: 'system',
        },
      ],
      startTime: new Date().toLocaleTimeString(),
    });

    showToast(`⚔️ Combat started with ${combatants.length} combatants!`);
  }, [db.maps, db.players, db.monsters, showToast]);

  // Turn management
  const nextTurn = useCallback(() => {
    setCombatState((prev) => {
      if (!prev.isActive || prev.combatants.length === 0) return prev;

      let nextIndex = prev.currentTurnIndex + 1;
      let nextRound = prev.round;

      if (nextIndex >= prev.combatants.length) {
        nextIndex = 0;
        nextRound += 1;
      }

      const updatedCombatants = prev.combatants.map((c, idx) => {
        if (idx === nextIndex) {
          const newConditions = c.conditions
            .map((cond) => ({
              ...cond,
              durationRounds: cond.durationRounds !== undefined ? cond.durationRounds - 1 : undefined,
            }))
            .filter((cond) => cond.durationRounds === undefined || cond.durationRounds > 0);

          return {
            ...c,
            reactionUsed: false,
            legendaryActionsUsed: 0,
            conditions: newConditions,
          };
        }
        return c;
      });

      const currentCombatant = updatedCombatants[nextIndex];
      const logEntry: CombatLogEntry = {
        id: `turn-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        round: nextRound,
        speaker: 'Dungeon Daddy',
        message: `Round ${nextRound}: Turn passed to ${currentCombatant.name}.`,
        type: 'turn',
      };

      return {
        ...prev,
        round: nextRound,
        currentTurnIndex: nextIndex,
        combatants: updatedCombatants,
        log: [logEntry, ...prev.log],
      };
    });
  }, []);

  const prevTurn = useCallback(() => {
    setCombatState((prev) => {
      if (!prev.isActive || prev.combatants.length === 0) return prev;

      let prevIndex = prev.currentTurnIndex - 1;
      let prevRound = prev.round;

      if (prevIndex < 0) {
        prevIndex = prev.combatants.length - 1;
        prevRound = Math.max(1, prevRound - 1);
      }

      return {
        ...prev,
        round: prevRound,
        currentTurnIndex: prevIndex,
      };
    });
  }, []);

  const setInitiative = useCallback((combatantId: string, initiative: number) => {
    setCombatState((prev) => {
      const updated = prev.combatants.map((c) => (c.id === combatantId ? { ...c, initiative } : c));
      updated.sort((a, b) => {
        if (b.initiative !== a.initiative) return b.initiative - a.initiative;
        return b.tieBreaker - a.tieBreaker;
      });
      return { ...prev, combatants: updated };
    });
  }, []);

  const modifyCombatantHp = useCallback((combatantId: string, amount: number, isTemp = false) => {
    setCombatState((prev) => {
      let targetName = '';
      let actionType: 'damage' | 'heal' = amount < 0 ? 'damage' : 'heal';

      const updated = prev.combatants.map((c) => {
        if (c.id !== combatantId) return c;
        targetName = c.name;

        if (isTemp) {
          return { ...c, tempHp: Math.max(0, amount) };
        }

        if (amount < 0) {
          const dmg = Math.abs(amount);
          let remainingDmg = dmg;
          let newTempHp = c.tempHp;

          if (newTempHp > 0) {
            if (newTempHp >= remainingDmg) {
              newTempHp -= remainingDmg;
              remainingDmg = 0;
            } else {
              remainingDmg -= newTempHp;
              newTempHp = 0;
            }
          }

          const newCurrentHp = Math.max(0, c.currentHp - remainingDmg);
          return {
            ...c,
            tempHp: newTempHp,
            currentHp: newCurrentHp,
            defeated: newCurrentHp === 0,
          };
        } else {
          const newCurrentHp = Math.min(c.maxHp, c.currentHp + amount);
          return {
            ...c,
            currentHp: newCurrentHp,
            defeated: false,
          };
        }
      });

      const logMsg: CombatLogEntry = {
        id: `hp-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        round: prev.round,
        speaker: 'Combat Manager',
        message: `${targetName} ${amount < 0 ? `took ${Math.abs(amount)} damage` : `regained ${amount} HP`}.`,
        type: actionType,
      };

      return {
        ...prev,
        combatants: updated,
        log: [logMsg, ...prev.log],
      };
    });
  }, []);

  const addConditionToCombatant = useCallback((combatantId: string, conditionData: Omit<ActiveCondition, 'appliedRound'>) => {
    setCombatState((prev) => {
      const updated = prev.combatants.map((c) => {
        if (c.id !== combatantId) return c;
        const condition: ActiveCondition = {
          ...conditionData,
          appliedRound: prev.round,
        };
        return {
          ...c,
          conditions: [...c.conditions.filter((cond) => cond.name !== conditionData.name), condition],
        };
      });

      const target = prev.combatants.find((c) => c.id === combatantId);
      const logEntry: CombatLogEntry = {
        id: `cond-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        round: prev.round,
        speaker: 'Combat Manager',
        message: `${target?.name || 'Target'} gained condition: ${conditionData.name}${conditionData.durationRounds ? ` (${conditionData.durationRounds} rounds)` : ''}.`,
        type: 'condition',
      };

      return {
        ...prev,
        combatants: updated,
        log: [logEntry, ...prev.log],
      };
    });
  }, []);

  const removeConditionFromCombatant = useCallback((combatantId: string, conditionId: string) => {
    setCombatState((prev) => {
      const updated = prev.combatants.map((c) => {
        if (c.id !== combatantId) return c;
        return {
          ...c,
          conditions: c.conditions.filter((cond) => cond.id !== conditionId),
        };
      });
      return { ...prev, combatants: updated };
    });
  }, []);

  const setCombatantConcentration = useCallback((combatantId: string, spellName: string | null) => {
    setCombatState((prev) => {
      const updated = prev.combatants.map((c) => {
        if (c.id !== combatantId) return c;
        return {
          ...c,
          concentratingOn: spellName ? { spellName, castRound: prev.round } : undefined,
        };
      });
      return { ...prev, combatants: updated };
    });
  }, []);

  const executeAttackRoll = useCallback((combatant: Combatant, actionName: string, attackBonus?: number, damageDice?: string, damageType?: string) => {
    const toHitFormula = attackBonus !== undefined ? `1d20+${attackBonus}` : '1d20';
    const hitResult = rollDice(toHitFormula);

    let dmgText = '';
    if (damageDice) {
      const dmgResult = rollDice(damageDice, { isCrit: hitResult.isCrit });
      dmgText = ` -> Damage: ${dmgResult.total} ${damageType || ''} (${dmgResult.details})`;
    }

    const fullMessage = `${actionName}: Attack Roll ${hitResult.total} (${hitResult.details})${hitResult.isCrit ? ' [CRITICAL HIT!]' : ''}${dmgText}`;

    addCombatLog({
      round: combatState.round,
      speaker: combatant.name,
      message: fullMessage,
      type: 'roll',
      rollDetails: {
        formula: toHitFormula,
        total: hitResult.total,
        breakdown: fullMessage,
        isCrit: hitResult.isCrit,
        isFumble: hitResult.isFumble,
      },
    });

    setDiceHistory((prev) => [hitResult, ...prev.slice(0, 49)]);
  }, [combatState.round, addCombatLog]);

  const endCombat = useCallback(() => {
    setCombatState({
      isActive: false,
      round: 1,
      currentTurnIndex: 0,
      combatants: [],
      log: [],
    });
    showToast('Combat ended');
  }, [showToast]);

  // Database Backup / Restore & Snapshots
  const createManualSnapshot = useCallback((description: string) => {
    createSnapshot(db, description, 'manual');
    setSnapshots(getSnapshots());
    showToast(`Saved checkpoint: "${description}"`);
  }, [db, showToast]);

  const rollbackToSnapshot = useCallback((snapshotId: string) => {
    createSnapshot(db, 'Pre-rollback safety checkpoint', 'manual');
    const restored = restoreSnapshot(snapshotId);
    if (restored) {
      setDb(restored);
      setSnapshots(getSnapshots());
      showToast('Database rolled back successfully!');
    }
  }, [db, showToast]);

  const deleteSnapshot = useCallback((snapshotId: string) => {
    const remaining = deleteSnapshotStorage(snapshotId);
    setSnapshots(remaining);
    showToast('Deleted snapshot');
  }, [showToast]);

  const convertMisclassifiedItems = useCallback(() => {
    createSnapshot(db, 'Before converting misclassified items to equipment', 'cleanup');
    const res = convertMisclassifiedMonstersToItems(db);
    if (res.convertedCount > 0) {
      setDb(res.updatedDb);
      setSnapshots(getSnapshots());
      showToast(`Successfully moved ${res.convertedCount} items to Items & Equipment!`);
    } else {
      showToast('No misclassified items found.');
    }
  }, [db, showToast]);

  const exportDatabaseJson = useCallback(() => {
    return exportFullDatabaseJson(db);
  }, [db]);

  const importDatabaseJson = useCallback((json: string) => {
    createSnapshot(db, 'Before JSON database restore', 'restore');
    const res = importFullDatabaseJson(json);
    if (res.success && res.db) {
      setDb(res.db);
      setSnapshots(getSnapshots());
      showToast('Database imported successfully!');
      return true;
    } else {
      showToast(`Import failed: ${res.error}`);
      return false;
    }
  }, [db, showToast]);

  const resetDatabaseToDefaults = useCallback(() => {
    createSnapshot(db, 'Before reset to defaults', 'reset');
    const initial = getInitialDatabase();
    setDb(initial);
    saveDatabase(initial);
    setSnapshots(getSnapshots());
    showToast('Reset to default SRD compendium');
  }, [db, showToast]);

  // Cloud Sync Methods
  const selectCloudFolder = useCallback(async () => {
    if (typeof window === 'undefined' || !(window as any).electronAPI?.cloudSync) {
      showToast('Cloud Folder Sync requires the desktop application.');
      return { success: false };
    }
    try {
      const res = await (window as any).electronAPI.cloudSync.selectFolder();
      if (res.canceled || !res.folderPath) {
        return { success: false };
      }
      await (window as any).electronAPI.cloudSync.setConfig({
        folderPath: res.folderPath,
        autoSync: true,
      });
      setCloudSyncConfig({
        folderPath: res.folderPath,
        autoSync: true,
        lastSynced: null,
        fileExists: res.hasExistingDb,
        fileMtime: res.existingDbMtime,
        fileSize: res.existingDbSize,
      });
      return { 
        success: true, 
        hasExistingDb: res.hasExistingDb, 
        folderPath: res.folderPath 
      };
    } catch (e: any) {
      showToast(`Folder selection failed: ${e?.message || 'Unknown error'}`);
      return { success: false };
    }
  }, [showToast]);

  const migrateLocalToCloud = useCallback(async () => {
    if (typeof window === 'undefined' || !(window as any).electronAPI?.cloudSync) {
      showToast('Cloud Folder Sync requires the desktop application.');
      return false;
    }
    if (!cloudSyncConfig.folderPath) {
      showToast('Please choose a sync folder first.');
      return false;
    }
    setIsSyncing(true);
    try {
      const res = await (window as any).electronAPI.cloudSync.migrateLocalToDrive(db);
      if (res && res.success) {
        setCloudSyncConfig((prev) => ({
          ...prev,
          autoSync: true,
          lastSynced: res.lastSynced,
          fileExists: true,
          fileSize: res.size,
        }));
        showToast(`Successfully migrated local save to Google Drive! (${res.size ? formatBytes(res.size) : 'Done'})`);
        return true;
      } else {
        showToast(`Migration error: ${res?.error || 'Unknown error'}`);
        return false;
      }
    } catch (e: any) {
      showToast(`Migration failed: ${e?.message || 'Unknown error'}`);
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [cloudSyncConfig.folderPath, db, showToast]);

  const loadFromCloud = useCallback(async () => {
    if (typeof window === 'undefined' || !(window as any).electronAPI?.cloudSync) {
      showToast('Cloud Folder Sync requires the desktop application.');
      return false;
    }
    setIsSyncing(true);
    try {
      const res = await (window as any).electronAPI.cloudSync.readDatabase();
      if (res && res.success && res.content) {
        createSnapshot(db, 'Pre-Cloud Restore Snapshot', 'restore');
        const importRes = importFullDatabaseJson(res.content);
        if (importRes.success && importRes.db) {
          setDb(importRes.db);
          setSnapshots(getSnapshots());
          if (importRes.db.campaigns && importRes.db.campaigns.length > 0) {
            setActiveCampaignId(importRes.db.campaigns[0].id);
          }
          if (importRes.db.maps && importRes.db.maps.length > 0) {
            setActiveMapId(importRes.db.maps[0].id);
          }
          if ((window as any).electronAPI?.cloudSync?.saveLocalDatabase) {
            (window as any).electronAPI.cloudSync.saveLocalDatabase(importRes.db).catch(() => {});
          }
          setCloudSyncConfig((prev) => ({
            ...prev,
            lastSynced: new Date().toISOString(),
            fileExists: true,
            fileSize: res.size,
            fileMtime: res.mtime,
          }));
          showToast(`✨ Loaded ${importRes.db.campaigns?.length || 0} campaigns, ${importRes.db.monsters?.length || 0} monsters, and ${importRes.db.maps?.length || 0} battle maps from Drive!`);
          return true;
        } else {
          showToast(`Failed to parse cloud database: ${importRes.error}`);
          return false;
        }
      } else {
        showToast(`Could not read cloud database: ${res?.error || 'File not found'}`);
        return false;
      }
    } catch (e: any) {
      showToast(`Error loading cloud database: ${e?.message || 'Unknown error'}`);
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [db, showToast]);

  const syncNow = useCallback(async () => {
    if (typeof window === 'undefined' || !(window as any).electronAPI?.cloudSync) {
      showToast('Cloud Sync requires the desktop application.');
      return;
    }
    if (!cloudSyncConfig.folderPath) {
      showToast('Please select a Cloud Sync folder first in Settings.');
      return;
    }
    setIsSyncing(true);
    try {
      if ((window as any).electronAPI?.cloudSync?.saveLocalDatabase) {
        await (window as any).electronAPI.cloudSync.saveLocalDatabase(db);
      }
      const res = await (window as any).electronAPI.cloudSync.writeDatabase(db);
      if (res && res.success) {
        setHasUnsavedCloudChanges(false);
        setCloudSyncConfig((prev) => ({ ...prev, lastSynced: res.lastSynced, fileExists: true, fileSize: res.size }));
        showToast('☁️ Cloud database synchronized successfully!');
      } else {
        showToast(`Sync failed: ${res?.error || 'Unknown error'}`);
      }
    } catch (e: any) {
      showToast(`Sync failed: ${e?.message || 'Unknown error'}`);
    } finally {
      setIsSyncing(false);
    }
  }, [db, cloudSyncConfig.folderPath, showToast]);

  const openCloudFolder = useCallback(async () => {
    if (typeof window !== 'undefined' && (window as any).electronAPI?.cloudSync) {
      await (window as any).electronAPI.cloudSync.openFolder(cloudSyncConfig.folderPath);
    }
  }, [cloudSyncConfig.folderPath]);

  const toggleAutoCloudSync = useCallback(async (enabled: boolean) => {
    if (typeof window !== 'undefined' && (window as any).electronAPI?.cloudSync) {
      await (window as any).electronAPI.cloudSync.setConfig({ autoSync: enabled });
      setCloudSyncConfig((prev) => ({ ...prev, autoSync: enabled }));
      showToast(enabled ? 'Continuous cloud sync enabled (every 5 min & on close)' : 'Cloud sync paused');
    }
  }, [showToast]);

  const disconnectCloudSync = useCallback(async () => {
    if (typeof window !== 'undefined' && (window as any).electronAPI?.cloudSync) {
      await (window as any).electronAPI.cloudSync.setConfig({ folderPath: null, autoSync: false, lastSynced: null });
      setCloudSyncConfig({ folderPath: null, autoSync: false, lastSynced: null, fileExists: false });
      setHasUnsavedCloudChanges(false);
      showToast('Disconnected from cloud sync. Using local storage.');
    }
  }, [showToast]);

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        compendiumSubTab,
        setCompendiumSubTab,
        handbookTarget,
        setHandbookTarget,
        templateSelectedType,
        setTemplateSelectedType,
        isRadialMenuOpen,
        setIsRadialMenuOpen,
        toggleRadialMenu,
        isExternalDisplayModalOpen,
        setIsExternalDisplayModalOpen,
        projectMediaToDisplay,
        clearProjectedMedia,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        toggleSidebar,
        snapshots,
        isRollbackModalOpen,
        setIsRollbackModalOpen,
        createManualSnapshot,
        rollbackToSnapshot,
        deleteSnapshot,
        convertMisclassifiedItems,
        db,
        templates: db.templates,
        updateTemplate,
        resetTemplateToDefault,
        activeCampaignId,
        setActiveCampaignId,
        selectedMonster,
        setSelectedMonster,
        selectedSpell,
        setSelectedSpell,
        selectedItem,
        setSelectedItem,
        saveMonster,
        deleteMonster,
        saveSpell,
        deleteSpell,
        saveItem,
        deleteItem,
        savePlayer,
        deletePlayer,
        playerRest,
        saveCampaign,
        deleteCampaign,
        saveCampaignNote,
        deleteCampaignNote,
        saveEncounter,
        deleteEncounter,
        saveRollTable,
        deleteRollTable,
        saveCustomBook,
        deleteCustomBook,
        saveCustomChapter,
        deleteCustomChapter,
        saveChapterOverride,
        resetChapterOverride,
        bulkAddEntities,
        activeMapId,
        setActiveMapId,
        saveMap,
        deleteMap,
        addTokenToMap,
        updateMapToken,
        deleteMapToken,
        toggleDoorOnMap,
        addWallToMap,
        deleteWallFromMap,
        combatState,
        startCombatFromEncounter,
        startCombatFromMapTokens,
        endCombat,
        nextTurn,
        prevTurn,
        setInitiative,
        modifyCombatantHp,
        addConditionToCombatant,
        removeConditionFromCombatant,
        setCombatantConcentration,
        executeAttackRoll,
        addCombatLog,
        diceHistory,
        isDiceDrawerOpen,
        setIsDiceDrawerOpen,
        rollCustomFormula,
        clearDiceHistory,
        exportDatabaseJson,
        importDatabaseJson,
        resetDatabaseToDefaults,
        cloudSyncConfig,
        isSyncing,
        hasUnsavedCloudChanges,
        syncNow,
        selectCloudFolder,
        migrateLocalToCloud,
        loadFromCloud,
        openCloudFolder,
        toggleAutoCloudSync,
        disconnectCloudSync,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
