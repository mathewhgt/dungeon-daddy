import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Download, 
  Upload, 
  FileSpreadsheet, 
  Filter, 
  Flame, 
  Shield, 
  Sparkles, 
  BookOpen, 
  Dices,
  Trash2,
  CheckCircle2,
  UserCheck,
  Users,
  MapPin,
  Compass,
  History,
  Edit,
  Copy,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MonsterStatBlock } from './MonsterStatBlock';
import { SpellCard } from './SpellCard';
import { ItemCard } from './ItemCard';
import { EntityEditorModal } from './EntityEditorModal';
import { RollTableEditorModal } from './RollTableEditorModal';
import { RollTableEntity } from '../../types/rollTable';
import { generateCsvTemplate, exportEntitiesToCsv } from '../../services/templateEngine';
import { EntityType } from '../../types/entity';
import { fuzzyMatch, fuzzyMatchMultiple } from '../../utils/searchUtils';

export const CompendiumView: React.FC = () => {
  const { 
    db, 
    compendiumSubTab, 
    setCompendiumSubTab, 
    selectedMonster, 
    setSelectedMonster, 
    selectedSpell, 
    setSelectedSpell, 
    selectedItem, 
    setSelectedItem,
    activeCampaignId,
    saveMonster,
    deleteMonster,
    saveSpell,
    deleteSpell,
    saveItem,
    deleteItem,
    saveRollTable,
    deleteRollTable,
    templates,
    showToast,
    rollCustomFormula,
    setActiveTab,
    setTemplateSelectedType,
    setIsRollbackModalOpen
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [crFilter, setCrFilter] = useState<string>('all');
  const [npcCampaignFilter, setNpcCampaignFilter] = useState<string>('all');
  const [npcRoleFilter, setNpcRoleFilter] = useState<string>('all');
  const [schoolFilter, setSchoolFilter] = useState<string>('all');
  const [elementFilter, setElementFilter] = useState<string>('all');
  const [shapeFilter, setShapeFilter] = useState<string>('all');
  const [rarityFilter, setRarityFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingEntity, setEditingEntity] = useState<any>(null);

  // Roll Table specific state
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [isTableEditorOpen, setIsTableEditorOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<RollTableEntity | null>(null);
  const [activeRolledRow, setActiveRolledRow] = useState<{
    tableId: string;
    rowId: string;
    rollTotal: number;
    item: any;
  } | null>(null);
  const [tableRowSearch, setTableRowSearch] = useState('');

  // Filtered Monsters (Bestiary - excludes NPCs)
  const filteredMonsters = useMemo(() => {
    return db.monsters.filter((m) => {
      if (m.isNpc) return false;
      const matchSearch = fuzzyMatchMultiple([m.name, m.monsterType, m.environment, m.alignment], searchQuery);
      const matchCr = crFilter === 'all' || m.challengeRating === crFilter;
      return matchSearch && matchCr;
    });
  }, [db.monsters, searchQuery, crFilter]);

  // Filtered NPCs & Characters
  const filteredNpcs = useMemo(() => {
    return db.monsters.filter((m) => {
      if (!m.isNpc) return false;
      const matchSearch = fuzzyMatchMultiple([
        m.name,
        m.monsterType,
        m.npcRole,
        m.occupation,
        m.location,
        m.alignment
      ], searchQuery);
      
      const matchCampaign = npcCampaignFilter === 'all' ||
        (npcCampaignFilter === 'global' ? !m.campaignId : m.campaignId === npcCampaignFilter);

      const matchRole = npcRoleFilter === 'all' || (m.npcRole && m.npcRole.toLowerCase() === npcRoleFilter.toLowerCase());

      return matchSearch && matchCampaign && matchRole;
    });
  }, [db.monsters, searchQuery, npcCampaignFilter, npcRoleFilter]);

  // Filtered Spells
  const filteredSpells = useMemo(() => {
    return db.spells.filter((s) => {
      const matchSearch = fuzzyMatchMultiple([s.name, s.school, s.element, s.shape, s.aoe?.shape], searchQuery);
      const matchSchool = schoolFilter === 'all' || s.school.toLowerCase() === schoolFilter.toLowerCase();
      const matchLevel = levelFilter === 'all' || s.level.toString() === levelFilter;
      const matchElement = elementFilter === 'all' || (s.element && s.element.toLowerCase() === elementFilter.toLowerCase());
      const shape = s.shape || s.aoe?.shape || 'none';
      const matchShape = shapeFilter === 'all' || shape.toLowerCase() === shapeFilter.toLowerCase();
      return matchSearch && matchSchool && matchLevel && matchElement && matchShape;
    });
  }, [db.spells, searchQuery, schoolFilter, levelFilter, elementFilter, shapeFilter]);

  // Filtered Items
  const filteredItems = useMemo(() => {
    return db.items.filter((i) => {
      const matchSearch = fuzzyMatchMultiple([i.name, i.itemType, i.rarity], searchQuery);
      const matchRarity = rarityFilter === 'all' || i.rarity.toLowerCase() === rarityFilter.toLowerCase();
      return matchSearch && matchRarity;
    });
  }, [db.items, searchQuery, rarityFilter]);

  // Filtered Tables
  const filteredTables = useMemo(() => {
    return db.tables.filter((t) => {
      return fuzzyMatchMultiple([t.name, t.description], searchQuery);
    });
  }, [db.tables, searchQuery]);

  // Export current list to CSV
  const handleExportCategoryCsv = () => {
    let type: EntityType = 'monster';
    let entities: any[] = [];
    if (compendiumSubTab === 'monsters') {
      type = 'monster';
      entities = filteredMonsters;
    } else if (compendiumSubTab === 'npcs') {
      type = 'monster';
      entities = filteredNpcs;
    } else if (compendiumSubTab === 'spells') {
      type = 'spell';
      entities = filteredSpells;
    } else if (compendiumSubTab === 'items') {
      type = 'item';
      entities = filteredItems;
    } else if (compendiumSubTab === 'tables') {
      type = 'rollTable';
      entities = filteredTables;
    }

    const csvContent = exportEntitiesToCsv(entities, templates[type]);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${type}_export_${Date.now()}.csv`;
    link.click();
    showToast(`Exported ${entities.length} ${type}s to CSV!`);
  };

  // Download CSV Template
  const handleDownloadCsvTemplate = () => {
    let type: EntityType = 'monster';
    if (compendiumSubTab === 'spells') type = 'spell';
    else if (compendiumSubTab === 'items') type = 'item';
    else if (compendiumSubTab === 'tables') type = 'rollTable';

    const csvContent = generateCsvTemplate(templates[type]);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${type}_template.csv`;
    link.click();
    showToast(`Downloaded ${type} CSV template!`);
  };

  const handleRollTable = (table: RollTableEntity) => {
    setSelectedTableId(table.id);
    const rollResult = rollCustomFormula(table.diceFormula, undefined, `Table: ${table.name}`);
    // Find matching table row
    const item = table.items.find(
      (it: any) => rollResult.total >= it.rangeMin && rollResult.total <= it.rangeMax
    );
    if (item) {
      setActiveRolledRow({
        tableId: table.id,
        rowId: item.id,
        rollTotal: rollResult.total,
        item,
      });
      showToast(`🎲 Rolled [${rollResult.total}]: ${item.result}`);
    } else {
      setActiveRolledRow({
        tableId: table.id,
        rowId: '',
        rollTotal: rollResult.total,
        item: null,
      });
      showToast(`🎲 Rolled [${rollResult.total}] (No row matched range)`);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-[#090d12] select-none">
      {/* Top Compendium Navigation & Search Toolbar */}
      <div className="p-4 bg-surface-100/60 border-b border-surface-border space-y-3">
        <div className="flex items-center justify-between">
          {/* Sub-tabs */}
          {/* Sub-tabs */}
          <div className="flex items-center space-x-1.5 bg-surface-50 p-1 rounded-lg border border-surface-border">
            {[
              { id: 'monsters', label: '🐉 Bestiary', count: filteredMonsters.length },
              { id: 'npcs', label: "👤 NPC's & Story", count: filteredNpcs.length },
              { id: 'spells', label: '✨ Spells', count: db.spells.length },
              { id: 'items', label: '🛡️ Items & Gear', count: db.items.length },
              { id: 'tables', label: '🎲 Roll Tables', count: db.tables.length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setCompendiumSubTab(tab.id as any);
                  setSearchQuery('');
                }}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                  compendiumSubTab === tab.id
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-surface-hover'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    compendiumSubTab === tab.id ? 'bg-slate-950 text-amber-400' : 'bg-surface-100 text-slate-400'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}

            <div className="h-4 w-px bg-surface-border mx-1" />

            <button
              onClick={() => setActiveTab('handbook')}
              className="px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center space-x-1.5 text-purple-300 hover:text-purple-100 hover:bg-purple-950/40 border border-purple-800/40"
              title="Open Player's Handbook (2024) Rules & Conditions Explorer"
            >
              <span>📖 Rules & Handbook</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full font-mono bg-purple-950 text-purple-300 border border-purple-700">
                2024
              </span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                if (compendiumSubTab === 'tables') {
                  setEditingTable(null);
                  setIsTableEditorOpen(true);
                } else if (compendiumSubTab === 'npcs') {
                  setEditingEntity({
                    type: 'monster',
                    isNpc: true,
                    campaignId: activeCampaignId || undefined,
                  });
                  setIsEditorOpen(true);
                } else {
                  setEditingEntity(null);
                  setIsEditorOpen(true);
                }
              }}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-lg shadow-sm transition-all flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>{compendiumSubTab === 'tables' ? 'Create Table' : compendiumSubTab === 'npcs' ? 'Create NPC' : 'Create Entry'}</span>
            </button>

            <button
              onClick={handleDownloadCsvTemplate}
              className="px-2.5 py-1.5 bg-surface-50 hover:bg-surface-hover border border-surface-border text-slate-300 text-xs font-medium rounded-lg transition-colors flex items-center space-x-1.5"
              title="Download CSV Template with sample headers"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>CSV Template</span>
            </button>

            <button
              onClick={handleExportCategoryCsv}
              className="px-2.5 py-1.5 bg-surface-50 hover:bg-surface-hover border border-surface-border text-slate-300 text-xs font-medium rounded-lg transition-colors flex items-center space-x-1.5"
              title="Export filtered items to CSV"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => {
                let targetType: EntityType = 'monster';
                if (compendiumSubTab === 'spells') targetType = 'spell';
                else if (compendiumSubTab === 'items') targetType = 'item';
                else if (compendiumSubTab === 'tables') targetType = 'rollTable';
                else if (compendiumSubTab === 'monsters' || compendiumSubTab === 'npcs') targetType = 'monster';

                setTemplateSelectedType(targetType);
                setActiveTab('templates');
              }}
              className="px-2.5 py-1.5 bg-surface-50 hover:bg-surface-hover border border-surface-border text-slate-300 text-xs font-medium rounded-lg transition-colors flex items-center space-x-1.5"
              title="Open Bulk CSV Importer"
            >
              <Upload className="w-3.5 h-3.5 text-purple-400" />
              <span>Bulk Import</span>
            </button>

            <button
              onClick={() => setIsRollbackModalOpen(true)}
              className="px-2.5 py-1.5 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-800/60 text-amber-300 text-xs font-medium rounded-lg transition-colors flex items-center space-x-1.5"
              title="Open Database Snapshots & Rollback History"
            >
              <History className="w-3.5 h-3.5 text-amber-400" />
              <span>Rollback</span>
            </button>
          </div>
        </div>

        {/* Search and Filters Bar */}
        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                compendiumSubTab === 'npcs'
                  ? 'Search NPCs by name, role, occupation, location, race...'
                  : `Search ${compendiumSubTab}...`
              }
              className="w-full bg-surface-50 border border-surface-border text-xs text-slate-100 rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-amber-500 placeholder-slate-500"
            />
          </div>

          {/* NPC Filters */}
          {compendiumSubTab === 'npcs' && (
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <select
                value={npcCampaignFilter}
                onChange={(e) => setNpcCampaignFilter(e.target.value)}
                className="bg-surface-50 border border-surface-border text-xs text-slate-300 rounded-lg px-2.5 py-2 focus:outline-none focus:border-amber-500 font-medium"
              >
                <option value="all">🏰 All Campaigns</option>
                <option value="global">🌐 Global / All (Unassigned)</option>
                {db.campaigns.map((c) => (
                  <option key={c.id} value={c.id}>
                    🏰 {c.name}
                  </option>
                ))}
              </select>

              <select
                value={npcRoleFilter}
                onChange={(e) => setNpcRoleFilter(e.target.value)}
                className="bg-surface-50 border border-surface-border text-xs text-slate-300 rounded-lg px-2.5 py-2 focus:outline-none focus:border-amber-500"
              >
                <option value="all">All Roles</option>
                <option value="ally">🎭 Ally</option>
                <option value="villain">💀 Villain / Nemesis</option>
                <option value="merchant">💰 Merchant / Shopkeeper</option>
                <option value="quest giver">📜 Quest Giver</option>
                <option value="informant">🕵️ Informant / Spy</option>
                <option value="neutral">⚖️ Neutral</option>
                <option value="patron">👑 Patron / Noble</option>
                <option value="guard">🛡️ Guard / Soldier</option>
              </select>
            </div>
          )}

          {/* Monster Filters */}
          {compendiumSubTab === 'monsters' && (
            <div className="flex items-center space-x-2">
              <select
                value={crFilter}
                onChange={(e) => setCrFilter(e.target.value)}
                className="bg-surface-50 border border-surface-border text-xs text-slate-300 rounded-lg px-2.5 py-2 focus:outline-none focus:border-amber-500"
              >
                <option value="all">All Challenge Ratings (CR)</option>
                {['0', '1/8', '1/4', '1/2', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'].map((cr) => (
                  <option key={cr} value={cr}>CR {cr}</option>
                ))}
              </select>
            </div>
          )}

          {/* Spell Filters */}
          {compendiumSubTab === 'spells' && (
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="bg-surface-50 border border-surface-border text-xs text-slate-300 rounded-lg px-2 py-1.5 focus:outline-none focus:border-amber-500"
              >
                <option value="all">All Levels</option>
                <option value="0">Cantrip (0)</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((lvl) => (
                  <option key={lvl} value={lvl.toString()}>Level {lvl}</option>
                ))}
              </select>

              <select
                value={schoolFilter}
                onChange={(e) => setSchoolFilter(e.target.value)}
                className="bg-surface-50 border border-surface-border text-xs text-slate-300 rounded-lg px-2 py-1.5 focus:outline-none focus:border-amber-500"
              >
                <option value="all">All Schools</option>
                {['Abjuration', 'Conjuration', 'Divination', 'Enchantment', 'Evocation', 'Illusion', 'Necromancy', 'Transmutation'].map((sch) => (
                  <option key={sch} value={sch}>{sch}</option>
                ))}
              </select>

              <select
                value={elementFilter}
                onChange={(e) => setElementFilter(e.target.value)}
                className="bg-surface-50 border border-surface-border text-xs text-slate-300 rounded-lg px-2 py-1.5 focus:outline-none focus:border-amber-500"
              >
                <option value="all">All Elements</option>
                <option value="fire">🔥 Fire</option>
                <option value="cold">❄️ Cold / Ice</option>
                <option value="lightning">⚡ Lightning</option>
                <option value="thunder">💥 Thunder</option>
                <option value="radiant">✨ Radiant</option>
                <option value="necrotic">💀 Necrotic</option>
                <option value="acid">🧪 Acid</option>
                <option value="poison">☠️ Poison</option>
                <option value="force">🟣 Force</option>
                <option value="psychic">🧠 Psychic</option>
              </select>

              <select
                value={shapeFilter}
                onChange={(e) => setShapeFilter(e.target.value)}
                className="bg-surface-50 border border-surface-border text-xs text-slate-300 rounded-lg px-2 py-1.5 focus:outline-none focus:border-amber-500"
              >
                <option value="all">All Shapes</option>
                <option value="sphere">🟡 Sphere</option>
                <option value="cone">🔻 Cone</option>
                <option value="line">📏 Line</option>
                <option value="cube">🟩 Cube</option>
                <option value="cylinder">🔵 Cylinder</option>
                <option value="none">🎯 Single Target</option>
              </select>
            </div>
          )}

          {/* Item Filters */}
          {compendiumSubTab === 'items' && (
            <div className="flex items-center space-x-2">
              <select
                value={rarityFilter}
                onChange={(e) => setRarityFilter(e.target.value)}
                className="bg-surface-50 border border-surface-border text-xs text-slate-300 rounded-lg px-2.5 py-2 focus:outline-none focus:border-amber-500"
              >
                <option value="all">All Rarities</option>
                {['Common', 'Uncommon', 'Rare', 'Very Rare', 'Legendary', 'Artifact'].map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Two-Pane Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left List Pane */}
        <div className="w-80 border-r border-surface-border bg-[#0d1117] overflow-y-auto p-3 space-y-1.5 shrink-0">
          {/* Monsters List */}
          {compendiumSubTab === 'monsters' && (
            filteredMonsters.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">No monsters found.</div>
            ) : (
              filteredMonsters.map((m) => {
                const isSelected = selectedMonster?.id === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMonster(m)}
                    className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-center justify-between group ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500/50 shadow-sm shadow-amber-500/10'
                        : 'bg-surface-100 border-surface-border hover:bg-surface-hover hover:border-slate-600'
                    }`}
                  >
                    <div>
                      <div className={`font-serif text-xs font-bold ${isSelected ? 'text-amber-400' : 'text-slate-200'}`}>
                        {m.name}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[170px]">
                        {m.size} {m.monsterType}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="px-1.5 py-0.5 rounded bg-surface-50 border border-surface-border text-[10px] font-mono font-bold text-amber-400">
                        CR {m.challengeRating}
                      </span>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">{m.hitPoints} HP</div>
                    </div>
                  </button>
                );
              })
            )
          )}

          {/* NPCs List */}
          {compendiumSubTab === 'npcs' && (
            filteredNpcs.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500 space-y-2">
                <div>No NPCs found matching filter.</div>
                <button
                  onClick={() => {
                    setEditingEntity({
                      type: 'monster',
                      isNpc: true,
                      campaignId: activeCampaignId || undefined,
                    });
                    setIsEditorOpen(true);
                  }}
                  className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded hover:bg-amber-500/30 text-xs font-semibold"
                >
                  + Create First NPC
                </button>
              </div>
            ) : (
              filteredNpcs.map((npc) => {
                const isSelected = selectedMonster?.id === npc.id;
                const npcCamp = npc.campaignId ? db.campaigns.find((c) => c.id === npc.campaignId) : null;
                return (
                  <button
                    key={npc.id}
                    onClick={() => setSelectedMonster(npc)}
                    className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-center justify-between group ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500/50 shadow-sm shadow-amber-500/10'
                        : 'bg-surface-100 border-surface-border hover:bg-surface-hover hover:border-slate-600'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <div className="flex items-center space-x-1.5">
                        <span className={`font-serif text-xs font-bold truncate ${isSelected ? 'text-amber-400' : 'text-slate-200'}`}>
                          {npc.name}
                        </span>
                        {npc.npcRole && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-950/80 border border-amber-700/60 text-amber-300 shrink-0">
                            {npc.npcRole}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate mt-0.5">
                        {npc.occupation ? `${npc.occupation} · ` : ''}{npc.location || `${npc.size} ${npc.monsterType}`}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      {npcCamp ? (
                        <span className="px-1.5 py-0.5 rounded bg-indigo-950/80 border border-indigo-700/60 text-[9px] font-bold text-indigo-300 block truncate max-w-[90px]">
                          🏰 {npcCamp.name}
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-[9px] font-medium text-slate-400 block">
                          🌐 Global
                        </span>
                      )}
                      <div className="text-[9px] text-slate-500 font-mono mt-0.5">CR {npc.challengeRating} · {npc.hitPoints}HP</div>
                    </div>
                  </button>
                );
              })
            )
          )}

          {/* Spells List */}
          {compendiumSubTab === 'spells' && (
            filteredSpells.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">No spells found.</div>
            ) : (
              filteredSpells.map((s) => {
                const isSelected = selectedSpell?.id === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSpell(s)}
                    className={`w-full text-left p-2.5 rounded-lg border transition-all space-y-1.5 group ${
                      isSelected
                        ? 'bg-indigo-500/15 border-indigo-500/50 shadow-sm shadow-indigo-500/10'
                        : 'bg-surface-100 border-surface-border hover:bg-surface-hover hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className={`font-serif text-xs font-bold flex items-center space-x-1.5 ${isSelected ? 'text-indigo-300' : 'text-slate-200'}`}>
                          <span>{s.name}</span>
                          {s.concentration && (
                            <span className="px-1 py-0.2 rounded bg-amber-950/80 border border-amber-700/80 text-[8px] text-amber-300 font-bold">
                              [C]
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {s.level === 0 ? 'Cantrip' : `Level ${s.level}`} · {s.school}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="px-1.5 py-0.5 rounded bg-surface-50 border border-surface-border text-[9px] text-slate-300 font-mono">
                          {s.range}
                        </span>
                      </div>
                    </div>

                    {/* Element and Shape/AOE Badges */}
                    <div className="flex flex-wrap items-center gap-1">
                      {s.element && s.element !== 'none' && (
                        <span className="px-1.5 py-0.5 rounded bg-surface-50/80 border border-surface-border text-[9px] font-bold text-slate-300 capitalize">
                          {s.element === 'fire' ? '🔥 Fire' :
                           s.element === 'cold' ? '❄️ Cold' :
                           s.element === 'lightning' ? '⚡ Lightning' :
                           s.element === 'radiant' ? '✨ Radiant' :
                           s.element === 'necrotic' ? '💀 Necrotic' :
                           s.element === 'thunder' ? '💥 Thunder' :
                           s.element === 'acid' ? '🧪 Acid' :
                           s.element === 'poison' ? '☠️ Poison' :
                           s.element === 'force' ? '🟣 Force' :
                           s.element === 'psychic' ? '🧠 Psychic' : s.element}
                        </span>
                      )}
                      {s.aoe && (
                        <span className="px-1.5 py-0.5 rounded bg-cyan-950/70 border border-cyan-800/80 text-[9px] font-mono font-bold text-cyan-300">
                          📐 {s.aoe.sizeFeet}ft {s.aoe.shape}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )
          )}

          {/* Items List */}
          {compendiumSubTab === 'items' && (
            filteredItems.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">No items found.</div>
            ) : (
              filteredItems.map((item) => {
                const isSelected = selectedItem?.id === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={`w-full text-left p-2.5 rounded-lg border transition-all flex items-center justify-between group ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500/50 shadow-sm shadow-amber-500/10'
                        : 'bg-surface-100 border-surface-border hover:bg-surface-hover hover:border-slate-600'
                    }`}
                  >
                    <div>
                      <div className={`font-serif text-xs font-bold ${isSelected ? 'text-amber-400' : 'text-slate-200'}`}>
                        {item.name}
                      </div>
                      <div className="text-[10px] text-slate-400">{item.itemType}</div>
                    </div>
                    <span className="px-1.5 py-0.5 rounded bg-surface-50 border border-surface-border text-[10px] font-mono text-slate-300">
                      {item.rarity}
                    </span>
                  </button>
                );
              })
            )
          )}

          {/* Tables List */}
          {compendiumSubTab === 'tables' && (
            filteredTables.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">No roll tables found.</div>
            ) : (
              filteredTables.map((t) => {
                const isSelected = selectedTableId === t.id || (!selectedTableId && filteredTables[0]?.id === t.id);
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTableId(t.id)}
                    className={`p-3 rounded-lg border transition-all cursor-pointer space-y-2 ${
                      isSelected
                        ? 'bg-purple-950/30 border-purple-500/50 shadow-md shadow-purple-950/30 ring-1 ring-purple-500/30'
                        : 'bg-surface-100 border-surface-border hover:bg-surface-hover hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-serif text-xs font-bold ${isSelected ? 'text-purple-300' : 'text-slate-200'}`}>
                        {t.name}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-purple-950 border border-purple-800 text-purple-300 font-mono text-[10px]">
                        {t.diceFormula}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-[10px] text-slate-400">
                      <span>{t.items.length} rows</span>
                      {t.theme && <span className="px-1.5 py-0.2 rounded bg-surface-50 text-slate-300">🏛️ {t.theme}</span>}
                      {t.columns && t.columns.length > 0 && (
                        <span className="px-1.5 py-0.2 rounded bg-surface-50 text-slate-300">{t.columns.length} columns</span>
                      )}
                    </div>
                    {t.description && <p className="text-[11px] text-slate-400 line-clamp-1">{t.description}</p>}
                    <div className="flex items-center justify-between pt-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRollTable(t);
                        }}
                        className="px-2.5 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center space-x-1 transition-colors shadow-sm"
                      >
                        <Dices className="w-3.5 h-3.5" />
                        <span>Roll</span>
                      </button>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingTable(t);
                            setIsTableEditorOpen(true);
                          }}
                          className="p-1 text-slate-400 hover:text-white transition-colors"
                          title="Edit Table"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteRollTable(t.id);
                          }}
                          className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                          title="Delete table"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )
          )}
        </div>

        {/* Right Inspector Pane */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#090d12]">
          {compendiumSubTab === 'monsters' && (
            selectedMonster || filteredMonsters[0] ? (
              <div className="max-w-3xl mx-auto">
                <MonsterStatBlock
                  monster={selectedMonster || filteredMonsters[0]}
                  onEdit={() => {
                    setEditingEntity(selectedMonster || filteredMonsters[0]);
                    setIsEditorOpen(true);
                  }}
                  onDelete={() => deleteMonster((selectedMonster || filteredMonsters[0]).id)}
                  onAddToEncounter={() => {
                    showToast(`Added ${selectedMonster?.name || filteredMonsters[0].name} to encounter`);
                    setActiveTab('encounters');
                  }}
                />
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                Select a creature from the list or create one.
              </div>
            )
          )}

          {compendiumSubTab === 'npcs' && (
            selectedMonster || filteredNpcs[0] ? (
              <div className="max-w-3xl mx-auto">
                <MonsterStatBlock
                  monster={selectedMonster || filteredNpcs[0]}
                  onEdit={() => {
                    setEditingEntity(selectedMonster || filteredNpcs[0]);
                    setIsEditorOpen(true);
                  }}
                  onDelete={() => deleteMonster((selectedMonster || filteredNpcs[0]).id)}
                  onAddToEncounter={() => {
                    showToast(`Added ${selectedMonster?.name || filteredNpcs[0].name} to encounter`);
                    setActiveTab('encounters');
                  }}
                />
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                Select an NPC from the list or create one.
              </div>
            )
          )}

          {compendiumSubTab === 'spells' && (
            selectedSpell || filteredSpells[0] ? (
              <div className="max-w-2xl mx-auto">
                <SpellCard
                  spell={selectedSpell || filteredSpells[0]}
                  onEdit={() => {
                    setEditingEntity(selectedSpell || filteredSpells[0]);
                    setIsEditorOpen(true);
                  }}
                  onDelete={() => deleteSpell((selectedSpell || filteredSpells[0]).id)}
                />
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                Select a spell from the list.
              </div>
            )
          )}

          {compendiumSubTab === 'items' && (
            selectedItem || filteredItems[0] ? (
              <div className="max-w-2xl mx-auto">
                <ItemCard
                  item={selectedItem || filteredItems[0]}
                  onEdit={() => {
                    setEditingEntity(selectedItem || filteredItems[0]);
                    setIsEditorOpen(true);
                  }}
                  onDelete={() => deleteItem((selectedItem || filteredItems[0]).id)}
                />
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                Select an item from the list.
              </div>
            )
          )}

          {compendiumSubTab === 'tables' && (() => {
            const currentTable = db.tables.find((t) => t.id === selectedTableId) || filteredTables[0] || db.tables[0];
            if (!currentTable) {
              return (
                <div className="h-full flex items-center justify-center text-slate-500 text-xs">
                  No roll tables available. Click "Create Table" above to build one.
                </div>
              );
            }

            const tableColumns = currentTable.columns && currentTable.columns.length > 0 
              ? currentTable.columns 
              : [];

            const filteredRows = currentTable.items.filter((r) => {
              if (!tableRowSearch.trim()) return true;
              const q = tableRowSearch.toLowerCase();
              if (r.result.toLowerCase().includes(q)) return true;
              if (r.values) {
                return Object.values(r.values).some((v) => String(v).toLowerCase().includes(q));
              }
              return false;
            });

            return (
              <div className="max-w-5xl mx-auto space-y-5">
                {/* Table Header Card */}
                <div className="p-5 rounded-xl bg-surface-100 border border-surface-border space-y-4">
                  <div className="flex items-start justify-between flex-wrap gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2.5">
                        <h2 className="font-serif text-xl font-bold text-slate-100">{currentTable.name}</h2>
                        <span className="px-2.5 py-0.5 rounded-full bg-purple-950 border border-purple-700 text-purple-300 font-mono font-bold text-xs shadow-sm">
                          {currentTable.diceFormula}
                        </span>
                        {currentTable.theme && (
                          <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs">
                            🏛️ {currentTable.theme}
                          </span>
                        )}
                        {currentTable.category && (
                          <span className="px-2 py-0.5 rounded bg-blue-950 border border-blue-800 text-blue-300 text-xs">
                            {currentTable.category}
                          </span>
                        )}
                      </div>
                      {currentTable.description && (
                        <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">{currentTable.description}</p>
                      )}
                    </div>

                    {/* Toolbar Actions */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleRollTable(currentTable)}
                        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-bold text-xs rounded-lg shadow-md transition-all flex items-center space-x-1.5"
                      >
                        <Dices className="w-4 h-4" />
                        <span>Roll on Table ({currentTable.diceFormula})</span>
                      </button>

                      <button
                        onClick={() => {
                          setEditingTable(currentTable);
                          setIsTableEditorOpen(true);
                        }}
                        className="px-3 py-2 bg-surface-50 hover:bg-surface-hover border border-surface-border text-slate-200 text-xs font-semibold rounded-lg transition-colors flex items-center space-x-1.5"
                        title="Edit columns, rows, and dice formula"
                      >
                        <Edit className="w-3.5 h-3.5 text-amber-400" />
                        <span>Edit Table</span>
                      </button>

                      <button
                        onClick={() => {
                          const duplicate: RollTableEntity = {
                            ...JSON.parse(JSON.stringify(currentTable)),
                            id: `table-${Date.now()}`,
                            name: `${currentTable.name} (Copy)`,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                          };
                          saveRollTable(duplicate);
                          setSelectedTableId(duplicate.id);
                          showToast(`Duplicated table "${duplicate.name}"`);
                        }}
                        className="p-2 bg-surface-50 hover:bg-surface-hover border border-surface-border text-slate-300 hover:text-white text-xs rounded-lg transition-colors"
                        title="Duplicate Table"
                      >
                        <Copy className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => deleteRollTable(currentTable.id)}
                        className="p-2 bg-surface-50 hover:bg-red-950/60 border border-surface-border hover:border-red-800 text-slate-400 hover:text-red-300 text-xs rounded-lg transition-colors"
                        title="Delete Table"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Active Rolled Outcome Banner */}
                  {activeRolledRow && activeRolledRow.tableId === currentTable.id && activeRolledRow.item && (
                    <div className="p-4 rounded-xl bg-purple-950/60 border-2 border-purple-500/80 shadow-lg shadow-purple-950/50 animate-fadeIn space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="px-2.5 py-1 rounded bg-purple-600 text-white font-mono font-bold text-xs shadow">
                            Rolled: {activeRolledRow.rollTotal}
                          </span>
                          <span className="font-serif font-bold text-base text-amber-300">
                            {activeRolledRow.item.result}
                          </span>
                        </div>
                        <button
                          onClick={() => setActiveRolledRow(null)}
                          className="text-purple-300 hover:text-white text-xs p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Rolled Values Breakdown */}
                      {activeRolledRow.item.values && Object.keys(activeRolledRow.item.values).length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-purple-800/60 text-xs">
                          {Object.entries(activeRolledRow.item.values).map(([k, v]) => (
                            <div key={k} className="bg-[#0b0e14]/60 p-2 rounded border border-purple-900/50">
                              <div className="text-[10px] text-purple-400 capitalize font-medium">{k}:</div>
                              <div className="text-slate-200 font-semibold">{String(v)}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Table Search & Row Count Filter Bar */}
                  <div className="flex items-center justify-between pt-2 border-t border-surface-border/60">
                    <div className="relative w-72">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                      <input
                        type="text"
                        value={tableRowSearch}
                        onChange={(e) => setTableRowSearch(e.target.value)}
                        placeholder="Search rows or column values..."
                        className="w-full bg-[#0b0e14] border border-surface-border rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
                      />
                    </div>
                    <div className="text-xs text-slate-400">
                      Showing {filteredRows.length} of {currentTable.items.length} rows
                    </div>
                  </div>
                </div>

                {/* Multi-Column Data Table */}
                <div className="overflow-x-auto rounded-xl border border-surface-border bg-surface-100/40">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-surface-100 border-b border-surface-border text-slate-300 font-serif">
                        <th className="p-3 w-20 text-center">Range</th>
                        <th className="p-3 min-w-[180px]">Result / Primary Item</th>
                        {tableColumns.map((col) => (
                          <th key={col.key} className="p-3 min-w-[130px] font-semibold">
                            {col.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-border/60">
                      {filteredRows.map((row) => {
                        const isWinningRow = activeRolledRow?.tableId === currentTable.id && activeRolledRow?.rowId === row.id;
                        return (
                          <tr
                            key={row.id}
                            className={`transition-colors ${
                              isWinningRow
                                ? 'bg-purple-900/40 border-l-4 border-l-purple-500 text-slate-100 font-medium'
                                : 'hover:bg-surface-100/60 text-slate-300'
                            }`}
                          >
                            <td className="p-3 text-center">
                              <span className={`px-2 py-0.5 rounded font-mono font-bold text-xs ${
                                isWinningRow ? 'bg-purple-600 text-white' : 'bg-surface-50 text-purple-400 border border-surface-border'
                              }`}>
                                {row.rangeMin === row.rangeMax ? row.rangeMin : `${row.rangeMin}-${row.rangeMax}`}
                              </span>
                            </td>
                            <td className={`p-3 font-semibold ${isWinningRow ? 'text-amber-300 font-bold' : 'text-slate-200'}`}>
                              {row.result}
                            </td>
                            {tableColumns.map((col) => {
                              const val = row.values?.[col.key] ?? '';
                              if (col.type === 'badge' && val) {
                                return (
                                  <td key={col.key} className="p-3">
                                    <span className="px-2 py-0.5 rounded bg-surface-50 border border-surface-border text-[11px] text-slate-300 font-mono">
                                      {val}
                                    </span>
                                  </td>
                                );
                              }
                              return (
                                <td key={col.key} className="p-3 text-slate-300 text-xs">
                                  {val}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Dynamic Entity Editor Modal (Monsters, Spells, Items) */}
      {isEditorOpen && (
        <EntityEditorModal
          type={compendiumSubTab === 'monsters' ? 'monster' : compendiumSubTab === 'spells' ? 'spell' : 'item'}
          initialData={editingEntity}
          onClose={() => setIsEditorOpen(false)}
          onSave={(entity) => {
            if (compendiumSubTab === 'monsters' || compendiumSubTab === 'npcs') saveMonster(entity);
            else if (compendiumSubTab === 'spells') saveSpell(entity);
            else if (compendiumSubTab === 'items') saveItem(entity);
          }}
        />
      )}

      {/* Dedicated Multi-Column Roll Table Editor Modal */}
      {isTableEditorOpen && (
        <RollTableEditorModal
          initialData={editingTable}
          onClose={() => {
            setIsTableEditorOpen(false);
            setEditingTable(null);
          }}
          onSave={(table) => {
            saveRollTable(table);
            setSelectedTableId(table.id);
            showToast(`Saved Roll Table "${table.name}"!`);
          }}
        />
      )}
    </div>
  );
};
