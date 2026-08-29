import React, { useState, useEffect } from 'react';
import { 
  Map as MapIcon, 
  Users, 
  Swords, 
  ShieldAlert, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Sliders, 
  Grid, 
  Trash2, 
  Heart, 
  Shield, 
  Eye, 
  EyeOff, 
  Footprints, 
  Sparkles, 
  Layers, 
  Maximize2, 
  Image as ImageIcon, 
  Download, 
  FileUp, 
  FolderOpen, 
  Square, 
  X, 
  FileText
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { playerSyncService } from '../../services/playerSyncService';
import { MapCanvas, VttTool } from './MapCanvas';
import { VttToolbar } from './VttToolbar';
import { GridCalibrationHud } from './GridCalibrationHud';
import { MapManagerModal } from './MapManagerModal';
import { MapResizeModal } from './MapResizeModal';
import { StartMapEncounterModal } from './StartMapEncounterModal';
import { VttCombatHud } from './VttCombatHud';
import { TokenContextMenu } from './TokenContextMenu';
import { TokenConditionModal } from './TokenConditionModal';
import { TokenHpModal } from './TokenHpModal';
import { ConcentrationCheckModal, ConcentrationCheckData } from './ConcentrationCheckModal';
import { SetConcentrationModal } from './SetConcentrationModal';
import { PinEditorModal } from './PinEditorModal';
import { MonsterStatBlock } from '../compendium/MonsterStatBlock';
import { MapToken, BattleMapEntity, MapPin as MapPinType } from '../../types/map';
import { MonsterEntity } from '../../types/monster';
import { PlayerEntity } from '../../types/player';
import { SpellEntity } from '../../types/spell';
import { TokenAvatar } from '../common/TokenAvatar';
import { fuzzyMatchMultiple } from '../../utils/searchUtils';

export const VttView: React.FC = () => {
  const { 
    db, 
    activeMapId, 
    setActiveMapId,
    saveMap, 
    combatState, 
    setCombatantConcentration,
    startCombatFromMapTokens,
    endCombat,
    addTokenToMap, 
    deleteMapToken,
    updateMapToken,
    modifyCombatantHp,
    activeCampaignId,
    showToast 
  } = useApp();

  const maps = db.maps || [];
  const currentMap = maps.find((m) => m.id === activeMapId) || maps[0];

  const [activeTool, setActiveTool] = useState<VttTool>('select');
  const [selectedToken, setSelectedToken] = useState<MapToken | null>(null);
  const [isGridModalOpen, setIsGridModalOpen] = useState(false);
  const [isCalibratingBox, setIsCalibratingBox] = useState(false);
  const [isMapManagerOpen, setIsMapManagerOpen] = useState(false);
  const [isResizeModalOpen, setIsResizeModalOpen] = useState(false);
  const [isStartCombatModalOpen, setIsStartCombatModalOpen] = useState(false);
  const [isTokenDockOpen, setIsTokenDockOpen] = useState(true);
  const [dockTab, setDockTab] = useState<'combat' | 'party' | 'monsters' | 'spells'>('combat');
  const [monsterSearch, setMonsterSearch] = useState('');
  const [spellSearch, setSpellSearch] = useState('');
  const [aoeShapeFilter, setAoeShapeFilter] = useState<string>('all');
  const [pendingSpellToCast, setPendingSpellToCast] = useState<SpellEntity | null>(null);
  const [fogBrushRadius, setFogBrushRadius] = useState<number>(50);
  const [fogResetTrigger, setFogResetTrigger] = useState<number>(0);

  // Sync selected token with Player Display for line of sight
  useEffect(() => {
    playerSyncService.setSelectedTokenId(selectedToken?.id || null);
  }, [selectedToken?.id]);

  // Right-click Token Context Menu & Modals State
  const [contextMenu, setContextMenu] = useState<{ token: MapToken; position: { x: number; y: number } } | null>(null);
  const [hpModalToken, setHpModalToken] = useState<MapToken | null>(null);
  const [conditionsModalToken, setConditionsModalToken] = useState<MapToken | null>(null);
  const [concentrationModalToken, setConcentrationModalToken] = useState<MapToken | null>(null);
  const [concentrationPrompt, setConcentrationPrompt] = useState<ConcentrationCheckData | null>(null);
  const [pinModalData, setPinModalData] = useState<Partial<MapPinType> | null>(null);
  const [inspectedEntity, setInspectedEntity] = useState<{ entity: MonsterEntity | PlayerEntity; type: 'monster' | 'player' } | null>(null);

  if (!currentMap) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#090d12] text-slate-400 space-y-3">
        <MapIcon className="w-12 h-12 text-slate-600" />
        <div className="text-sm font-semibold">No battle maps created yet.</div>
        <button
          onClick={() => setIsMapManagerOpen(true)}
          className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-lg shadow-md"
        >
          Create First Battle Map
        </button>
        {isMapManagerOpen && <MapManagerModal onClose={() => setIsMapManagerOpen(false)} />}
      </div>
    );
  }

  // Active combatant for turn highlight
  const activeCombatant = combatState.isActive && combatState.combatants.length > 0
    ? combatState.combatants[combatState.currentTurnIndex]
    : null;

  // Helper to calculate spawn coordinates centered in a grid cell
  const getSpawnCoords = (tokenSize: number = 1) => {
    const cellSize = currentMap.grid.cellSize || 50;
    const ox = currentMap.grid.offsetX || 0;
    const oy = currentMap.grid.offsetY || 0;
    const rawX = (currentMap.width / 2) + (Math.random() * 120 - 60);
    const rawY = (currentMap.height / 2) + (Math.random() * 120 - 60);

    if (tokenSize % 2 === 1) {
      return {
        x: Math.floor((rawX - ox) / cellSize) * cellSize + ox + (cellSize / 2),
        y: Math.floor((rawY - oy) / cellSize) * cellSize + oy + (cellSize / 2),
      };
    } else {
      return {
        x: Math.round((rawX - ox) / cellSize) * cellSize + ox,
        y: Math.round((rawY - oy) / cellSize) * cellSize + oy,
      };
    }
  };

  // Handle Spawning a Player Token
  const handleSpawnPlayer = (player: typeof db.players[0]) => {
    const darkvisionRange = player.sensesConfig?.darkvision || (player.race.toLowerCase().includes('elf') || player.race.toLowerCase().includes('dwarf') ? 60 : 0);
    const coords = getSpawnCoords(1);

    const newToken: MapToken = {
      id: `tok-player-${player.id}-${Date.now()}`,
      entityId: player.id,
      name: player.name,
      tokenUrl: player.tokenUrl,
      avatarUrl: player.avatarUrl,
      isPlayer: true,
      x: coords.x,
      y: coords.y,
      size: 1,
      elevation: 0,
      currentHp: player.currentHp,
      maxHp: player.maxHp,
      tempHp: player.tempHp,
      armorClass: player.armorClass,
      senses: {
        normalSight: 60,
        darkvision: darkvisionRange,
        blindsight: 0,
        truesight: 0,
        tremorsense: 0,
      },
    };
    addTokenToMap(currentMap.id, newToken);
  };

  // Handle Spawning a Monster Token
  const handleSpawnMonster = (monster: typeof db.monsters[0]) => {
    const darkvisionRange = monster.sensesConfig?.darkvision || (monster.senses?.toLowerCase().includes('darkvision') ? 60 : 0);
    const sizeCategory = monster.size.toLowerCase();
    const tokenSize = sizeCategory === 'large' ? 2 : sizeCategory === 'huge' ? 3 : sizeCategory === 'gargantuan' ? 4 : 1;
    const coords = getSpawnCoords(tokenSize);

    const newToken: MapToken = {
      id: `tok-monster-${monster.id}-${Date.now()}`,
      entityId: monster.id,
      name: monster.name,
      tokenUrl: monster.tokenUrl,
      avatarUrl: monster.avatarUrl,
      isPlayer: false,
      x: coords.x,
      y: coords.y,
      size: tokenSize,
      elevation: 0,
      currentHp: monster.hitPoints,
      maxHp: monster.hitPoints,
      armorClass: monster.armorClass,
      senses: {
        normalSight: 60,
        darkvision: darkvisionRange,
        blindsight: monster.senses?.toLowerCase().includes('blindsight') ? 30 : 0,
        truesight: monster.senses?.toLowerCase().includes('truesight') ? 120 : 0,
        tremorsense: monster.senses?.toLowerCase().includes('tremorsense') ? 60 : 0,
      },
    };
    addTokenToMap(currentMap.id, newToken);
  };

  // Handle Spawning a Combatant from live combat
  const handleSpawnCombatant = (combatant: typeof combatState.combatants[0]) => {
    const existing = currentMap.tokens.find((t) => t.combatantId === combatant.id || t.entityId === combatant.entityId);
    if (existing) {
      showToast(`${combatant.name} is already on the battle map.`);
      return;
    }

    const coords = getSpawnCoords(1);

    const newToken: MapToken = {
      id: `tok-combat-${combatant.id}-${Date.now()}`,
      combatantId: combatant.id,
      entityId: combatant.entityId,
      name: combatant.name,
      tokenUrl: combatant.tokenUrl,
      avatarUrl: combatant.avatarUrl,
      isPlayer: combatant.isPlayer,
      x: coords.x,
      y: coords.y,
      size: 1,
      elevation: 0,
      currentHp: combatant.currentHp,
      maxHp: combatant.maxHp,
      tempHp: combatant.tempHp,
      armorClass: combatant.armorClass,
      senses: {
        normalSight: 60,
        darkvision: 60,
        blindsight: 0,
        truesight: 0,
        tremorsense: 0,
      },
    };
    addTokenToMap(currentMap.id, newToken);
  };

  // Open Statblock from token
  const handleOpenStatblockForToken = (token: MapToken) => {
    if (token.isPlayer) {
      const player = db.players.find((p) => p.id === token.entityId);
      if (player) {
        setInspectedEntity({ entity: player, type: 'player' });
      } else {
        showToast(`Statblock not found for ${token.name}`);
      }
    } else {
      const monster = db.monsters.find((m) => m.id === token.entityId);
      if (monster) {
        setInspectedEntity({ entity: monster, type: 'monster' });
      } else {
        showToast(`Statblock not found for ${token.name}`);
      }
    }
  };

  // Helper to trigger 5e Concentration DC check when damage is sustained
  const checkConcentrationOnDamage = (token: MapToken, prevHp: number, newHp: number) => {
    if (newHp < prevHp && token.concentratingOn) {
      const dmg = prevHp - newHp;
      const dc = Math.max(10, Math.floor(dmg / 2));
      let conMod = 0;
      if (token.isPlayer) {
        const p = db.players.find((pl) => pl.id === token.entityId);
        if (p) conMod = Math.floor((p.abilities.con - 10) / 2);
      } else {
        const m = db.monsters.find((mon) => mon.id === token.entityId);
        if (m) conMod = Math.floor((m.abilities.con - 10) / 2);
      }
      setConcentrationPrompt({
        tokenId: token.id,
        combatantId: token.combatantId,
        name: token.name,
        spellName: token.concentratingOn.spellName,
        damageTaken: dmg,
        dc,
        conModifier: conMod,
      });
    }
  };

  // Export Map to JSON
  const handleExportMap = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(currentMap, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${currentMap.name.toLowerCase().replace(/\s+/g, '_')}_map.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast(`Exported "${currentMap.name}" map package`);
  };

  // Import Map from JSON
  const handleImportMap = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const imported = JSON.parse(evt.target?.result as string);
        if (!imported.width || !imported.height || !imported.grid) {
          showToast('Invalid map JSON file format.');
          return;
        }

        const newMap: BattleMapEntity = {
          ...imported,
          id: `map-${Date.now()}`,
          name: imported.name ? `${imported.name} (Imported)` : 'Imported Map',
        };

        saveMap(newMap);
        setActiveMapId(newMap.id);
        showToast(`Successfully imported map "${newMap.name}"!`);
      } catch (err) {
        showToast('Failed to parse map JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="h-full flex flex-col bg-[#090d12] overflow-hidden select-none">
      {/* Top Map Title & Action Bar */}
      <div className="h-12 bg-[#121720] border-b border-surface-border px-4 flex items-center justify-between z-30 shrink-0">
        {/* Left Info & Selector */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsMapManagerOpen(true)}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-surface-50 hover:bg-surface-hover border border-surface-border text-xs font-semibold text-slate-200 hover:text-amber-400 transition-colors"
            title="Browse and manage battle maps"
          >
            <FolderOpen className="w-4 h-4 text-amber-400" />
            <span className="font-serif font-bold truncate max-w-[180px]">{currentMap.name}</span>
            <span className="text-[10px] text-slate-400">({maps.length})</span>
          </button>

          <div className="h-4 w-px bg-surface-border" />

          {/* Start / End Combat Action Button */}
          {combatState.isActive ? (
            <button
              onClick={endCombat}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-700 text-xs font-bold text-red-200 transition-all shadow-md"
              title="End the active combat encounter"
            >
              <Square className="w-3.5 h-3.5" />
              <span>⏹️ End Combat</span>
            </button>
          ) : (
            <button
              onClick={() => {
                if (currentMap.tokens.length === 0) {
                  showToast('Add at least one token to the map to start an encounter.');
                  return;
                }
                setIsStartCombatModalOpen(true);
              }}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-md shadow-red-950/30 hover:scale-105"
              title="Start a combat encounter with all tokens on the map"
            >
              <Swords className="w-3.5 h-3.5" />
              <span>⚔️ Start Combat</span>
            </button>
          )}

          <button
            onClick={() => setIsResizeModalOpen(true)}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-surface-50 hover:bg-surface-hover border border-surface-border text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            title="Resize map dimensions or replace background image"
          >
            <Maximize2 className="w-3.5 h-3.5 text-blue-400" />
            <span>Resize & Image</span>
          </button>

          <button
            onClick={handleExportMap}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-surface-50 hover:bg-surface-hover border border-surface-border text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            title="Export map configuration with all walls and tokens"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Export</span>
          </button>

          <label className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-surface-50 hover:bg-surface-hover border border-surface-border text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer" title="Import map configuration JSON">
            <FileUp className="w-3.5 h-3.5 text-indigo-400" />
            <span>Import</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportMap}
              className="hidden"
            />
          </label>

          {currentMap.lighting.gmVision && (
            <span className="px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800 text-[10px] font-bold">
              GM GOD-VISION ACTIVE
            </span>
          )}
        </div>

        {/* Right Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsTokenDockOpen((prev) => !prev)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
              isTokenDockOpen
                ? 'bg-amber-500/15 border-amber-500/50 text-amber-400'
                : 'bg-surface-50 border-surface-border text-slate-300 hover:bg-surface-hover'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Token Spawner</span>
          </button>
        </div>
      </div>

      {/* Main Workspace (Canvas + Floating Toolbar + Token Spawner Dock) */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Token Spawner Sidebar Dock */}
        {isTokenDockOpen && (
          <div className="w-80 bg-[#0d1117] border-r border-surface-border flex flex-col z-20 shrink-0 animate-slideRight">
            {/* Dock Tabs */}
            <div className="p-1.5 border-b border-surface-border grid grid-cols-4 gap-1 bg-surface-100/50 text-[11px]">
              <button
                onClick={() => setDockTab('combat')}
                className={`py-1.5 rounded-lg font-semibold flex items-center justify-center space-x-1 transition-colors ${
                  dockTab === 'combat'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Combat Initiative Tracker"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Combat</span>
              </button>
              <button
                onClick={() => setDockTab('party')}
                className={`py-1.5 rounded-lg font-semibold flex items-center justify-center space-x-1 transition-colors ${
                  dockTab === 'party'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Party Characters"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Party</span>
              </button>
              <button
                onClick={() => setDockTab('monsters')}
                className={`py-1.5 rounded-lg font-semibold flex items-center justify-center space-x-1 transition-colors ${
                  dockTab === 'monsters'
                    ? 'bg-amber-600 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Monster Bestiary"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Bestiary</span>
              </button>
              <button
                onClick={() => setDockTab('spells')}
                className={`py-1.5 rounded-lg font-semibold flex items-center justify-center space-x-1 transition-colors ${
                  dockTab === 'spells'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="5e Spells & AOE Templates"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Spells</span>
              </button>
            </div>

            {/* Dock List Content */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
              {dockTab === 'combat' && (
                <div className="space-y-1.5">
                  {!combatState.isActive || combatState.combatants.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-500 space-y-2">
                      <Swords className="w-8 h-8 mx-auto text-slate-600" />
                      <div>No combat encounter currently active.</div>
                      <button
                        onClick={() => {
                          if (currentMap.tokens.length === 0) {
                            showToast('Add at least one token to the map to start an encounter.');
                            return;
                          }
                          setIsStartCombatModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md"
                      >
                        ⚔️ Start Encounter
                      </button>
                    </div>
                  ) : (
                    combatState.combatants.map((c, idx) => {
                      const isTurn = idx === combatState.currentTurnIndex;
                      const mapToken = currentMap.tokens.find((t) => t.combatantId === c.id || t.entityId === c.entityId);

                      return (
                        <div
                          key={c.id}
                          className={`p-2.5 rounded-xl border space-y-1.5 transition-colors ${
                            isTurn
                              ? 'bg-amber-950/50 border-amber-500/80 shadow-md ring-1 ring-amber-500/40'
                              : 'bg-surface-100 hover:bg-surface-hover border-surface-border'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <TokenAvatar
                                name={c.name}
                                imageUrl={c.avatarUrl}
                                tokenUrl={c.tokenUrl}
                                type={c.isPlayer ? 'player' : 'monster'}
                                size="sm"
                              />
                              <div>
                                <div className="font-serif font-bold text-xs text-slate-100 flex items-center space-x-1.5">
                                  <span>{c.name}</span>
                                  {isTurn && (
                                    <span className="px-1 py-0.2 rounded bg-amber-500 text-slate-950 font-bold text-[9px]">
                                      TURN
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono">
                                  Init {c.initiative} · HP {c.currentHp}/{c.maxHp} · AC {c.armorClass}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-1">
                              {/* Quick [C] Concentration Button */}
                              <button
                                onClick={() => {
                                  if (mapToken) setConcentrationModalToken(mapToken);
                                  else {
                                    const next = c.concentratingOn ? null : 'Bless';
                                    setCombatantConcentration(c.id, next);
                                    showToast(next ? `${c.name} is concentrating on ${next}` : `Dropped concentration for ${c.name}`);
                                  }
                                }}
                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                                  c.concentratingOn
                                    ? 'bg-cyan-950 border-cyan-700 text-cyan-300'
                                    : 'bg-surface-50 border-surface-border text-slate-400 hover:text-cyan-300'
                                }`}
                                title="Set Concentration"
                              >
                                [C]
                              </button>

                              {/* Quick Condition Button */}
                              <button
                                onClick={() => {
                                  if (mapToken) setConditionsModalToken(mapToken);
                                  else showToast('Spawn token onto map to edit conditions.');
                                }}
                                className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-surface-50 border border-surface-border text-slate-400 hover:text-purple-300 transition-colors"
                                title="Add/Edit Conditions"
                              >
                                + Cond
                              </button>

                              {!mapToken ? (
                                <button
                                  onClick={() => handleSpawnCombatant(c)}
                                  className="px-2 py-0.5 bg-amber-600 hover:bg-amber-500 text-slate-950 text-[10px] font-bold rounded transition-colors"
                                  title="Place token on battle map"
                                >
                                  Spawn
                                </button>
                              ) : (
                                <span className="text-[9px] text-emerald-400 font-bold px-1">On Map</span>
                              )}
                            </div>
                          </div>

                          {/* Active Conditions & Concentration Badges */}
                          {(c.conditions.length > 0 || c.concentratingOn) && (
                            <div className="flex flex-wrap gap-1 pt-0.5">
                              {c.concentratingOn && (
                                <span className="px-1.5 py-0.2 rounded bg-cyan-950 border border-cyan-700 text-[9px] font-bold text-cyan-300 flex items-center space-x-1">
                                  <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
                                  <span>[C] {c.concentratingOn.spellName}</span>
                                </span>
                              )}

                              {c.conditions.map((cond) => (
                                <span
                                  key={cond.id}
                                  className="px-1.5 py-0.2 rounded bg-purple-950/80 border border-purple-700 text-[9px] font-bold text-purple-200"
                                >
                                  {cond.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {dockTab === 'party' && (
                <div className="space-y-1.5">
                  {db.players.map((p) => {
                    const isOnMap = currentMap.tokens.some((t) => t.entityId === p.id);

                    return (
                      <div
                        key={p.id}
                        className="p-2 rounded-xl bg-surface-100 border border-surface-border flex items-center justify-between hover:bg-surface-hover transition-colors"
                      >
                        <div className="flex items-center space-x-2">
                          <TokenAvatar
                            name={p.name}
                            imageUrl={p.avatarUrl}
                            tokenUrl={p.tokenUrl}
                            type="player"
                            size="sm"
                          />
                          <div>
                            <div className="font-serif font-bold text-xs text-slate-100">{p.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              Lv.{p.level} {p.characterClass} · HP {p.currentHp}/{p.maxHp}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleSpawnPlayer(p)}
                          className="px-2 py-1 bg-surface-50 hover:bg-emerald-600 hover:text-white text-slate-300 text-xs font-bold rounded-lg border border-surface-border transition-colors"
                          title="Spawn token on map"
                        >
                          + Spawn
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {dockTab === 'monsters' && (
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Search bestiary..."
                    value={monsterSearch}
                    onChange={(e) => setMonsterSearch(e.target.value)}
                    className="w-full bg-surface-50 border border-surface-border rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:border-amber-500"
                  />

                  {db.monsters
                    .filter((m) => fuzzyMatchMultiple([m.name, m.monsterType, m.type, m.environment], monsterSearch))
                    .slice(0, 30)
                    .map((m) => (
                      <div
                        key={m.id}
                        className="p-2 rounded-xl bg-surface-100 border border-surface-border flex items-center justify-between hover:bg-surface-hover transition-colors"
                      >
                        <div className="flex items-center space-x-2">
                          <TokenAvatar
                            name={m.name}
                            imageUrl={m.avatarUrl}
                            tokenUrl={m.tokenUrl}
                            type="monster"
                            size="sm"
                          />
                          <div>
                            <div className="font-serif font-bold text-xs text-slate-100">{m.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              CR {m.challengeRating} · HP {m.hitPoints} · AC {m.armorClass}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleSpawnMonster(m)}
                          className="px-2 py-1 bg-surface-50 hover:bg-amber-500 hover:text-slate-950 text-slate-300 text-xs font-bold rounded-lg border border-surface-border transition-colors"
                        >
                          + Spawn
                        </button>
                      </div>
                    ))}
                </div>
              )}

              {dockTab === 'spells' && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-1.5">
                    <input
                      type="text"
                      placeholder="Search AOE spells (Fireball, Cone of Cold...)..."
                      value={spellSearch}
                      onChange={(e) => setSpellSearch(e.target.value)}
                      className="flex-1 bg-surface-50 border border-surface-border rounded-lg px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500"
                    />
                    <select
                      value={aoeShapeFilter}
                      onChange={(e) => setAoeShapeFilter(e.target.value)}
                      className="bg-surface-50 border border-surface-border rounded-lg px-2 py-1.5 text-xs text-slate-300 focus:border-cyan-500 font-medium"
                    >
                      <option value="all">All Shapes</option>
                      <option value="sphere">🟡 Sphere</option>
                      <option value="cone">🔻 Cone</option>
                      <option value="line">📏 Line</option>
                      <option value="cube">🟩 Cube</option>
                      <option value="cylinder">🔵 Cylinder</option>
                    </select>
                  </div>

                  {(() => {
                    const aoeSpells = db.spells.filter((s) => {
                      const shape = s.shape || s.aoe?.shape;
                      // Strictly require an AOE shape (exclude none or missing AOE)
                      if (!shape || shape === 'none' || !s.aoe) return false;

                      const matchesSearch = fuzzyMatchMultiple([s.name, s.school, s.element, s.shape, s.aoe?.shape], spellSearch);
                      const matchesShape = aoeShapeFilter === 'all' || shape === aoeShapeFilter;

                      return matchesSearch && matchesShape;
                    });

                    if (aoeSpells.length === 0) {
                      return (
                        <div className="text-center py-6 text-xs text-slate-500">
                          No AOE spells found matching filter.
                        </div>
                      );
                    }

                    return aoeSpells.slice(0, 40).map((s) => {
                      const shape = s.shape || s.aoe?.shape || 'sphere';
                      const sizeFeet = s.aoe?.sizeFeet || (shape === 'cone' ? 60 : shape === 'line' ? 100 : 20);
                      const aoeType = `aoe-${shape}`;

                      return (
                        <div
                          key={s.id}
                          className="p-2.5 rounded-xl bg-surface-100 border border-surface-border space-y-1.5 hover:border-cyan-500/50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-serif font-bold text-xs text-slate-100 flex items-center space-x-1.5">
                                <span>{s.name}</span>
                                {s.concentration && (
                                  <span className="px-1 py-0.2 rounded bg-cyan-950 border border-cyan-800 text-[8px] font-bold text-cyan-300">
                                    [C]
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono flex flex-wrap items-center gap-1.5 mt-0.5">
                                <span>Lv.{s.level} {s.school}</span>
                                {s.element && s.element !== 'none' && (
                                  <span className="px-1 rounded bg-surface-50 border border-surface-border text-slate-300 font-sans text-[9px] capitalize">
                                    {s.element === 'fire' ? '🔥 Fire' :
                                     s.element === 'cold' ? '❄️ Cold' :
                                     s.element === 'lightning' ? '⚡ Lightning' :
                                     s.element === 'radiant' ? '✨ Radiant' :
                                     s.element === 'necrotic' ? '💀 Necrotic' : s.element}
                                  </span>
                                )}
                                <span>·</span>
                                <span>{s.range}</span>
                              </div>
                            </div>

                            <button
                              onClick={() => {
                                setPendingSpellToCast(s);
                                setActiveTool(aoeType as any);
                                showToast(`Click anywhere on map to cast ${s.name} (${s.element ? `${s.element} ` : ''}${sizeFeet} ft. ${shape})!`);
                              }}
                              className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg shadow-sm flex items-center space-x-1 transition-all hover:scale-105"
                              title="Cast and place animated spell template on map"
                            >
                              <Sparkles className="w-3 h-3" />
                              <span>Cast</span>
                            </button>
                          </div>

                          {/* 5e AOE Dimension Tag */}
                          {s.aoe && (
                            <div className="pt-0.5">
                              <span className="px-1.5 py-0.5 rounded bg-cyan-950/70 border border-cyan-700/80 text-cyan-300 font-mono text-[9px] font-bold">
                                📐 {s.aoe.sizeFeet} ft. {s.aoe.shape.toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    });
                  })()}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Central Map Canvas */}
        <div className="flex-1 relative overflow-hidden">
          <MapCanvas
            map={currentMap}
            activeTool={activeTool}
            onSelectToken={setSelectedToken}
            selectedToken={selectedToken}
            onOpenPinModal={(pin) => setPinModalData(pin || {})}
            pendingSpell={pendingSpellToCast}
            onSpellPlaced={() => {
              setPendingSpellToCast(null);
              setActiveTool('select');
            }}
            isCalibratingBox={isCalibratingBox}
            onCompleteBoxCalibration={(calculatedSize, ox, oy) => {
              saveMap({
                ...currentMap,
                grid: {
                  ...currentMap.grid,
                  cellSize: calculatedSize,
                  offsetX: ox,
                  offsetY: oy,
                },
              });
              setIsCalibratingBox(false);
            }}
            onTokenContextMenu={(token, screenPt) => {
              setContextMenu({ token, position: screenPt });
            }}
            fogBrushRadius={fogBrushRadius}
            fogResetTrigger={fogResetTrigger}
          />

          {/* Floating VTT Toolbar */}
          <VttToolbar
            activeTool={activeTool}
            setActiveTool={setActiveTool}
            map={currentMap}
            onUpdateMap={(updates) => saveMap({ ...currentMap, ...updates })}
            onOpenGridModal={() => setIsGridModalOpen((prev) => !prev)}
            onClearDrawings={() => saveMap({ ...currentMap, drawings: [] })}
            fogBrushRadius={fogBrushRadius}
            setFogBrushRadius={setFogBrushRadius}
            onResetFog={() => setFogResetTrigger((prev) => prev + 1)}
          />

          {/* Floating Live Combat HUD */}
          {combatState.isActive && (
            <VttCombatHud
              onEndCombat={endCombat}
              onOpenStatblock={(cId) => {
                const combatant = combatState.combatants.find((c) => c.id === cId);
                if (combatant) {
                  if (combatant.isPlayer) {
                    const player = db.players.find((p) => p.id === combatant.entityId);
                    if (player) setInspectedEntity({ entity: player, type: 'player' });
                  } else {
                    const monster = db.monsters.find((m) => m.id === combatant.entityId);
                    if (monster) setInspectedEntity({ entity: monster, type: 'monster' });
                  }
                }
              }}
            />
          )}

          {/* Selected Token Inspector HUD */}
          {selectedToken && (
            <div className="absolute bottom-5 right-5 z-30 bg-[#121720]/90 backdrop-blur-md border border-surface-border p-4 rounded-2xl shadow-2xl space-y-3 w-64 animate-scaleUp">
              <div className="flex items-center justify-between border-b border-surface-border pb-2">
                <div className="flex items-center space-x-2">
                  <TokenAvatar
                    name={selectedToken.name}
                    imageUrl={selectedToken.avatarUrl}
                    tokenUrl={selectedToken.tokenUrl}
                    type={selectedToken.isPlayer ? 'player' : 'monster'}
                    size="sm"
                  />
                  <div>
                    <h4 className="font-serif font-bold text-sm text-slate-100">{selectedToken.name}</h4>
                    <span className="text-[10px] text-amber-400 font-mono">
                      AC {selectedToken.armorClass || 10} · Sight {selectedToken.senses.normalSight}ft / Darkvision {selectedToken.senses.darkvision}ft
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleOpenStatblockForToken(selectedToken)}
                    className="p-1 text-slate-400 hover:text-blue-400 rounded"
                    title="View 5e statblock"
                  >
                    <FileText className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteMapToken(currentMap.id, selectedToken.id)}
                    className="p-1 text-slate-400 hover:text-red-400 rounded"
                    title="Remove token from map"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* HP Adjustment */}
              {selectedToken.maxHp && (
                <div className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Hit Points</span>
                    <span className="font-mono font-bold text-slate-200">
                      {selectedToken.currentHp} / {selectedToken.maxHp}
                    </span>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() =>
                        updateMapToken(currentMap.id, selectedToken.id, {
                          currentHp: Math.max(0, (selectedToken.currentHp || 0) - 5),
                        })
                      }
                      className="flex-1 py-1 rounded bg-surface-50 hover:bg-red-950 text-red-300 border border-surface-border font-mono font-bold text-[11px]"
                    >
                      -5
                    </button>
                    <button
                      onClick={() =>
                        updateMapToken(currentMap.id, selectedToken.id, {
                          currentHp: Math.max(0, (selectedToken.currentHp || 0) - 1),
                        })
                      }
                      className="flex-1 py-1 rounded bg-surface-50 hover:bg-red-950 text-red-300 border border-surface-border font-mono font-bold text-[11px]"
                    >
                      -1
                    </button>
                    <button
                      onClick={() =>
                        updateMapToken(currentMap.id, selectedToken.id, {
                          currentHp: Math.min(selectedToken.maxHp || 10, (selectedToken.currentHp || 0) + 1),
                        })
                      }
                      className="flex-1 py-1 rounded bg-surface-50 hover:bg-emerald-950 text-emerald-300 border border-surface-border font-mono font-bold text-[11px]"
                    >
                      +1
                    </button>
                    <button
                      onClick={() =>
                        updateMapToken(currentMap.id, selectedToken.id, {
                          currentHp: Math.min(selectedToken.maxHp || 10, (selectedToken.currentHp || 0) + 5),
                        })
                      }
                      className="flex-1 py-1 rounded bg-surface-50 hover:bg-emerald-950 text-emerald-300 border border-surface-border font-mono font-bold text-[11px]"
                    >
                      +5
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Live Grid Calibration Floating HUD (Map stays 100% visible) */}
      {isGridModalOpen && (
        <GridCalibrationHud
          grid={currentMap.grid}
          onChange={(newGrid) => saveMap({ ...currentMap, grid: newGrid })}
          onClose={() => {
            setIsGridModalOpen(false);
            setIsCalibratingBox(false);
          }}
          onStartBoxCalibration={() => setIsCalibratingBox((prev) => !prev)}
          isCalibratingBox={isCalibratingBox}
        />
      )}

      {/* Map Manager & Library Modal */}
      {isMapManagerOpen && <MapManagerModal onClose={() => setIsMapManagerOpen(false)} />}

      {/* Map Dimension & Background Resize Modal */}
      {isResizeModalOpen && (
        <MapResizeModal
          map={currentMap}
          onClose={() => setIsResizeModalOpen(false)}
          onSave={(updates) => saveMap({ ...currentMap, ...updates })}
        />
      )}

      {/* Start Combat from Map Encounter Modal */}
      {isStartCombatModalOpen && (
        <StartMapEncounterModal
          tokens={currentMap.tokens}
          onClose={() => setIsStartCombatModalOpen(false)}
          onStartCombat={(initiatives) => {
            startCombatFromMapTokens(currentMap.id, initiatives);
          }}
        />
      )}

      {/* Token Right-Click Context Menu */}
      {contextMenu && (
        <TokenContextMenu
          token={contextMenu.token}
          position={contextMenu.position}
          onClose={() => setContextMenu(null)}
          onOpenStatblock={handleOpenStatblockForToken}
          onOpenHpModal={(tok) => setHpModalToken(tok)}
          onOpenConditionsModal={(tok) => setConditionsModalToken(tok)}
          onToggleConcentration={(tok) => setConcentrationModalToken(tok)}
          onToggleHideToken={(tok) => {
            const nextHide = !tok.hiddenFromPlayers;
            updateMapToken(currentMap.id, tok.id, { hiddenFromPlayers: nextHide });
            showToast(nextHide ? `Hidden ${tok.name} from players` : `Revealed ${tok.name} to players`);
          }}
          onDeleteToken={(tok) => deleteMapToken(currentMap.id, tok.id)}
        />
      )}

      {/* Set Concentration Modal */}
      {concentrationModalToken && (
        <SetConcentrationModal
          token={concentrationModalToken}
          onClose={() => setConcentrationModalToken(null)}
          onSaveConcentration={(spellName) => {
            const updates = spellName
              ? { concentratingOn: { spellName, castRound: combatState.round || 1 } }
              : { concentratingOn: undefined };
            updateMapToken(currentMap.id, concentrationModalToken.id, updates);
            if (concentrationModalToken.combatantId) {
              setCombatantConcentration(concentrationModalToken.combatantId, spellName);
            }
            showToast(
              spellName
                ? `${concentrationModalToken.name} is now concentrating on ${spellName}`
                : `Dropped concentration for ${concentrationModalToken.name}`
            );
          }}
        />
      )}

      {/* Token Status Conditions Modal */}
      {conditionsModalToken && (
        <TokenConditionModal
          token={conditionsModalToken}
          onClose={() => setConditionsModalToken(null)}
          onUpdateConditions={(conditions) => {
            updateMapToken(currentMap.id, conditionsModalToken.id, { conditions });
            setConditionsModalToken({ ...conditionsModalToken, conditions });
            showToast(`Updated conditions for ${conditionsModalToken.name}`);
          }}
        />
      )}

      {/* Token Quick HP Damage/Healing Modal */}
      {hpModalToken && (
        <TokenHpModal
          token={hpModalToken}
          onClose={() => setHpModalToken(null)}
          onApplyHp={({ currentHp, tempHp }) => {
            const prevHp = hpModalToken.currentHp || 0;
            updateMapToken(currentMap.id, hpModalToken.id, { currentHp, tempHp });
            if (hpModalToken.combatantId) {
              const diff = currentHp - prevHp;
              if (diff !== 0) modifyCombatantHp(hpModalToken.combatantId, diff, false);
            }
            checkConcentrationOnDamage(hpModalToken, prevHp, currentHp);
            showToast(`Updated HP for ${hpModalToken.name}`);
          }}
        />
      )}

      {/* 5e Concentration Save Check Modal */}
      {concentrationPrompt && (
        <ConcentrationCheckModal
          data={concentrationPrompt}
          onClose={() => setConcentrationPrompt(null)}
          onResolve={(maintained) => {
            if (!maintained && concentrationPrompt.tokenId) {
              updateMapToken(currentMap.id, concentrationPrompt.tokenId, { concentratingOn: undefined });
              showToast(`Concentration broken on ${concentrationPrompt.spellName}!`);
            }
          }}
        />
      )}

      {/* DM Room Pin Editor / Viewer Modal */}
      {pinModalData && (
        <PinEditorModal
          pin={pinModalData}
          onClose={() => setPinModalData(null)}
          onSave={(savedPin) => {
            const exists = currentMap.pins.some((p) => p.id === savedPin.id);
            const updatedPins = exists
              ? currentMap.pins.map((p) => (p.id === savedPin.id ? savedPin : p))
              : [...currentMap.pins, savedPin];
            saveMap({ ...currentMap, pins: updatedPins });
            showToast(`Saved room pin: ${savedPin.title}`);
          }}
          onDelete={(pinId) => {
            saveMap({ ...currentMap, pins: currentMap.pins.filter((p) => p.id !== pinId) });
            showToast('Deleted room pin');
          }}
        />
      )}

      {/* 5e Statblock Slide-Over / Popover */}
      {inspectedEntity && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/70 backdrop-blur-sm p-4 select-none animate-fadeIn">
          <div className="w-full max-w-xl h-full bg-[#121720] border border-surface-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-slideLeft">
            <div className="p-3 border-b border-surface-border flex items-center justify-between bg-surface-100/50">
              <span className="font-serif font-bold text-sm text-slate-100 flex items-center space-x-2">
                <FileText className="w-4 h-4 text-blue-400" />
                <span>5e Statblock: {inspectedEntity.entity.name}</span>
              </span>
              <button
                onClick={() => setInspectedEntity(null)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {inspectedEntity.type === 'monster' ? (
                <MonsterStatBlock monster={inspectedEntity.entity as MonsterEntity} />
              ) : (
                <div className="p-4 space-y-4 text-slate-200">
                  <div className="flex items-center space-x-4 border-b border-surface-border pb-4">
                    <TokenAvatar
                      name={inspectedEntity.entity.name}
                      imageUrl={inspectedEntity.entity.avatarUrl}
                      tokenUrl={inspectedEntity.entity.tokenUrl}
                      type="player"
                      size="lg"
                    />
                    <div>
                      <h2 className="font-serif font-bold text-xl text-amber-400">{inspectedEntity.entity.name}</h2>
                      <div className="text-xs text-slate-400">
                        Level {(inspectedEntity.entity as PlayerEntity).level} {(inspectedEntity.entity as PlayerEntity).race} {(inspectedEntity.entity as PlayerEntity).characterClass}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 bg-surface-50 rounded-xl border border-surface-border">
                      <div className="text-slate-400 uppercase text-[10px] font-bold">Armor Class</div>
                      <div className="font-bold font-mono text-base text-slate-100">{(inspectedEntity.entity as PlayerEntity).armorClass}</div>
                    </div>
                    <div className="p-2 bg-surface-50 rounded-xl border border-surface-border">
                      <div className="text-slate-400 uppercase text-[10px] font-bold">Hit Points</div>
                      <div className="font-bold font-mono text-base text-emerald-400">
                        {(inspectedEntity.entity as PlayerEntity).currentHp} / {(inspectedEntity.entity as PlayerEntity).maxHp}
                      </div>
                    </div>
                    <div className="p-2 bg-surface-50 rounded-xl border border-surface-border">
                      <div className="text-slate-400 uppercase text-[10px] font-bold">Speed</div>
                      <div className="font-bold font-mono text-base text-slate-100">{(inspectedEntity.entity as PlayerEntity).speed || '30 ft.'}</div>
                    </div>
                  </div>

                  {/* Ability Scores */}
                  <div className="grid grid-cols-6 gap-1.5 text-center text-xs">
                    {['str', 'dex', 'con', 'int', 'wis', 'cha'].map((stat) => {
                      const val = (inspectedEntity.entity as PlayerEntity).abilities[stat as keyof typeof inspectedEntity.entity.abilities] || 10;
                      const mod = Math.floor((val - 10) / 2);
                      return (
                        <div key={stat} className="p-2 bg-surface-50 rounded-xl border border-surface-border">
                          <div className="text-slate-400 uppercase text-[9px] font-bold">{stat}</div>
                          <div className="font-bold text-slate-100">{val}</div>
                          <div className="text-[10px] text-amber-400 font-mono">{mod >= 0 ? `+${mod}` : mod}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
