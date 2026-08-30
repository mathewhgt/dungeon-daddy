import React, { useState, useMemo } from 'react';
import { 
  Coins, 
  Sparkles, 
  Dices, 
  RotateCcw, 
  Plus, 
  Trash2, 
  Copy, 
  FileText, 
  Users, 
  Table, 
  ShieldAlert, 
  MapPin, 
  Sliders, 
  Check, 
  Layers, 
  ChevronRight,
  Package,
  Award,
  Gem,
  Swords,
  Eye,
  Info
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { 
  LootDifficulty, 
  GeneratedLootResult, 
  GeneratedLootEntry 
} from '../../types/loot';
import { 
  generateDndLoot, 
  getAvailableThemes, 
  getAvailableTypes, 
  getTierFromLevel,
  parseValueToGp,
  parseWeightToLbs
} from '../../services/lootService';
import { RollTableEntity } from '../../types/rollTable';
import { ItemCard } from '../compendium/ItemCard';
import { ItemEntity } from '../../types/item';

export const LootGeneratorView: React.FC = () => {
  const { 
    db, 
    showToast, 
    activeCampaignId, 
    saveCampaignNote, 
    saveRollTable,
    savePlayer,
    rollCustomFormula 
  } = useApp();

  // Generator Settings State
  const [level, setLevel] = useState<number>(3);
  const [difficulty, setDifficulty] = useState<LootDifficulty>('medium');
  const [selectedTheme, setSelectedTheme] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [partySize, setPartySize] = useState<number>(4);
  const [includeMagicItems, setIncludeMagicItems] = useState<boolean>(true);
  const [includeGeneralLoot, setIncludeGeneralLoot] = useState<boolean>(true);
  const [includeDbItems, setIncludeDbItems] = useState<boolean>(true);
  const [currencyMultiplier, setCurrencyMultiplier] = useState<number>(1.0);

  // Generated Result State
  const [lootResult, setLootResult] = useState<GeneratedLootResult | null>(() => {
    return generateDndLoot(
      {
        level: 3,
        difficulty: 'medium',
        theme: 'All',
        type: 'All',
        partySize: 4,
        includeMagicItems: true,
        includeGeneralLoot: true,
        includeDbItems: true,
        currencyMultiplier: 1.0,
      },
      db.items,
      db.tables
    );
  });

  // Modal / Inspector state for viewing full magic item
  const [inspectingItem, setInspectingItem] = useState<ItemEntity | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isDistributeModalOpen, setIsDistributeModalOpen] = useState<boolean>(false);

  // Dynamic Themes and Types
  const availableThemes = useMemo(() => {
    return ['All', ...getAvailableThemes(db.tables)];
  }, [db.tables]);

  const availableTypes = useMemo(() => {
    return ['All', ...getAvailableTypes(db.tables)];
  }, [db.tables]);

  const tier = getTierFromLevel(level);

  // Generate Loot Handler
  const handleGenerate = (customDiff?: LootDifficulty, customType?: string) => {
    const diffToUse = customDiff || difficulty;
    const typeToUse = customType !== undefined ? customType : selectedType;

    const result = generateDndLoot(
      {
        level,
        difficulty: diffToUse,
        theme: selectedTheme,
        type: typeToUse,
        partySize,
        includeMagicItems,
        includeGeneralLoot,
        includeDbItems,
        currencyMultiplier,
      },
      db.items,
      db.tables
    );

    setLootResult(result);
    showToast(`Generated Level ${level} (${diffToUse}) loot!`);
  };

  // Quick Preset Handlers
  const handlePresetMonster = () => {
    setSelectedType('monster');
    handleGenerate('medium', 'monster');
  };

  const handlePresetArea = () => {
    setSelectedType('area loot');
    handleGenerate('medium', 'area loot');
  };

  const handlePresetHoard = () => {
    setDifficulty('boss');
    setSelectedType('boss');
    handleGenerate('boss', 'boss');
  };

  // Re-roll single item
  const handleRerollItem = (itemIndex: number) => {
    if (!lootResult) return;
    const singleBatch = generateDndLoot(
      {
        level,
        difficulty,
        theme: selectedTheme,
        type: selectedType,
        partySize,
        includeMagicItems,
        includeGeneralLoot,
        includeDbItems,
        currencyMultiplier,
      },
      db.items,
      db.tables
    );

    if (singleBatch.items.length > 0) {
      const newItem = singleBatch.items[Math.floor(Math.random() * singleBatch.items.length)];
      const nextItems = [...lootResult.items];
      nextItems[itemIndex] = newItem;

      // Recalculate totals
      let itemsGp = 0;
      let itemsWeight = 0;
      let count = 0;
      for (const it of nextItems) {
        itemsGp += it.valueGp * it.quantity;
        itemsWeight += it.weightLbs * it.quantity;
        count += it.quantity;
      }
      const coinWeight = +( (lootResult.coins.cp + lootResult.coins.sp + lootResult.coins.ep + lootResult.coins.gp + lootResult.coins.pp) / 50 ).toFixed(2);

      setLootResult({
        ...lootResult,
        items: nextItems,
        totalValueGp: +(lootResult.coins.totalGp + itemsGp).toFixed(2),
        totalWeightLbs: +(itemsWeight + coinWeight).toFixed(2),
        itemCount: count,
      });
      showToast(`Re-rolled into "${newItem.name}"`);
    }
  };

  // Remove single item
  const handleRemoveItem = (itemIndex: number) => {
    if (!lootResult) return;
    const nextItems = lootResult.items.filter((_, idx) => idx !== itemIndex);
    let itemsGp = 0;
    let itemsWeight = 0;
    let count = 0;
    for (const it of nextItems) {
      itemsGp += it.valueGp * it.quantity;
      itemsWeight += it.weightLbs * it.quantity;
      count += it.quantity;
    }
    const coinWeight = +( (lootResult.coins.cp + lootResult.coins.sp + lootResult.coins.ep + lootResult.coins.gp + lootResult.coins.pp) / 50 ).toFixed(2);

    setLootResult({
      ...lootResult,
      items: nextItems,
      totalValueGp: +(lootResult.coins.totalGp + itemsGp).toFixed(2),
      totalWeightLbs: +(itemsWeight + coinWeight).toFixed(2),
      itemCount: count,
    });
  };

  // Add extra random item
  const handleAddExtraItem = () => {
    if (!lootResult) return;
    const singleBatch = generateDndLoot(
      {
        level,
        difficulty,
        theme: selectedTheme,
        type: selectedType,
        partySize,
        includeMagicItems,
        includeGeneralLoot,
        includeDbItems,
        currencyMultiplier,
      },
      db.items,
      db.tables
    );

    if (singleBatch.items.length > 0) {
      const newItem = singleBatch.items[Math.floor(Math.random() * singleBatch.items.length)];
      const nextItems = [...lootResult.items, newItem];
      let itemsGp = 0;
      let itemsWeight = 0;
      let count = 0;
      for (const it of nextItems) {
        itemsGp += it.valueGp * it.quantity;
        itemsWeight += it.weightLbs * it.quantity;
        count += it.quantity;
      }
      const coinWeight = +( (lootResult.coins.cp + lootResult.coins.sp + lootResult.coins.ep + lootResult.coins.gp + lootResult.coins.pp) / 50 ).toFixed(2);

      setLootResult({
        ...lootResult,
        items: nextItems,
        totalValueGp: +(lootResult.coins.totalGp + itemsGp).toFixed(2),
        totalWeightLbs: +(itemsWeight + coinWeight).toFixed(2),
        itemCount: count,
      });
      showToast(`Added "${newItem.name}" to loot!`);
    }
  };

  // Copy Markdown
  const handleCopyMarkdown = () => {
    if (!lootResult) return;
    const lines: string[] = [];
    lines.push(`## 💎 Encounter Loot (Level ${level} - ${difficulty.toUpperCase()})`);
    if (selectedTheme !== 'All') lines.push(`**Theme:** ${selectedTheme}`);
    if (selectedType !== 'All') lines.push(`**Source / Type:** ${selectedType}`);
    lines.push('');
    lines.push(`### 💰 Currency`);
    lines.push(`- **Copper (CP):** ${lootResult.coins.cp.toLocaleString()}`);
    lines.push(`- **Silver (SP):** ${lootResult.coins.sp.toLocaleString()}`);
    if (lootResult.coins.ep > 0) lines.push(`- **Electrum (EP):** ${lootResult.coins.ep.toLocaleString()}`);
    lines.push(`- **Gold (GP):** ${lootResult.coins.gp.toLocaleString()}`);
    if (lootResult.coins.pp > 0) lines.push(`- **Platinum (PP):** ${lootResult.coins.pp.toLocaleString()}`);
    lines.push(`*Total Coin Value: ${lootResult.coins.totalGp.toLocaleString()} GP*`);
    lines.push('');

    if (lootResult.items.length > 0) {
      lines.push(`### 📦 Items & Valuables`);
      lines.push('| Qty | Item | Category | Value | Weight | Details |');
      lines.push('|---|---|---|---|---|---|');
      for (const it of lootResult.items) {
        lines.push(`| ${it.quantity} | **${it.name}** | ${it.category} | ${it.value} | ${it.weight} | ${it.description} |`);
      }
      lines.push('');
    }

    lines.push(`**Grand Total Value:** ${lootResult.totalValueGp.toLocaleString()} GP`);
    lines.push(`**Total Weight:** ${lootResult.totalWeightLbs.toLocaleString()} lbs`);
    lines.push(`*Party Split (${partySize} players): ${(lootResult.totalValueGp / partySize).toFixed(2)} GP per player*`);

    navigator.clipboard.writeText(lines.join('\n'));
    setIsCopied(true);
    showToast('Copied loot markdown to clipboard!');
    setTimeout(() => setIsCopied(false), 2500);
  };

  // Save to Campaign Notes
  const handleSaveToCampaignNotes = () => {
    if (!lootResult) return;
    const campaignId = activeCampaignId || db.campaigns[0]?.id;
    if (!campaignId) {
      showToast('Please create or select a campaign first.');
      return;
    }

    const noteContent = `# 💎 Loot: ${selectedTheme !== 'All' ? selectedTheme : 'Encounter'} (${difficulty.toUpperCase()} - Lvl ${level})\n\n` +
      `**Generated on:** ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}\n` +
      `**Level / Tier:** Level ${level} (Tier ${tier})\n` +
      `**Difficulty:** ${difficulty}\n` +
      `**Theme:** ${selectedTheme}\n` +
      `**Source Type:** ${selectedType}\n\n` +
      `## 💰 Coins & Currency\n` +
      `- **Copper (CP):** ${lootResult.coins.cp.toLocaleString()}\n` +
      `- **Silver (SP):** ${lootResult.coins.sp.toLocaleString()}\n` +
      `${lootResult.coins.ep > 0 ? `- **Electrum (EP):** ${lootResult.coins.ep.toLocaleString()}\n` : ''}` +
      `- **Gold (GP):** ${lootResult.coins.gp.toLocaleString()}\n` +
      `${lootResult.coins.pp > 0 ? `- **Platinum (PP):** ${lootResult.coins.pp.toLocaleString()}\n` : ''}` +
      `**Total Coin Value:** ${lootResult.coins.totalGp.toLocaleString()} GP\n\n` +
      `## 📦 Items, Valuables & Magic\n` +
      `| Qty | Item | Category | Value | Weight | Details |\n` +
      `|---|---|---|---|---|---|\n` +
      lootResult.items.map((it) => `| ${it.quantity} | **${it.name}** | ${it.category} | ${it.value} | ${it.weight} | ${it.description} |`).join('\n') +
      `\n\n---\n` +
      `**Grand Total:** ${lootResult.totalValueGp.toLocaleString()} GP | **Weight:** ${lootResult.totalWeightLbs} lbs | **Split (${partySize} players):** ${(lootResult.totalValueGp / partySize).toFixed(2)} GP each\n`;

    saveCampaignNote(campaignId, {
      id: `note-loot-${Date.now()}`,
      type: 'campaignNote',
      campaignId,
      name: `💎 Loot: ${selectedTheme !== 'All' ? selectedTheme : 'Dungeon'} (Lvl ${level} ${difficulty})`,
      category: 'Session',
      content: noteContent,
      isFolder: false,
      isPlayerVisible: true,
      tags: ['loot', 'treasure', selectedTheme, difficulty],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    showToast('Saved loot table directly to Campaign Session Notes!');
  };

  // Save generated loot as a new Roll Table
  const handleSaveAsRollTable = () => {
    if (!lootResult || lootResult.items.length === 0) return;
    const tableId = `table-loot-${Date.now()}`;
    const newTable: RollTableEntity = {
      id: tableId,
      type: 'rollTable',
      name: `Loot Table: ${selectedTheme !== 'All' ? selectedTheme : 'Custom'} (Lvl ${level} ${difficulty})`,
      category: 'Loot',
      theme: selectedTheme !== 'All' ? selectedTheme : 'General',
      diceFormula: `1d${lootResult.items.length}`,
      description: `Generated loot cache containing ${lootResult.items.length} unique items worth ~${lootResult.totalValueGp} GP total.`,
      columns: [
        { key: 'category', label: 'Category', type: 'badge' },
        { key: 'type', label: 'Type', type: 'badge' },
        { key: 'value', label: 'Value', type: 'badge' },
        { key: 'weight', label: 'Weight', type: 'text' },
        { key: 'rarity', label: 'Rarity', type: 'badge' },
        { key: 'description', label: 'Description', type: 'text' },
      ],
      items: lootResult.items.map((it, idx) => ({
        id: `row-${idx + 1}`,
        rangeMin: idx + 1,
        rangeMax: idx + 1,
        result: it.name,
        values: {
          category: it.category,
          type: it.type,
          value: it.value,
          weight: it.weight,
          rarity: it.rarity,
          description: it.description,
        },
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveRollTable(newTable);
    showToast(`Saved as Roll Table "${newTable.name}" in Compendium!`);
  };

  // Distribute Coins to Party Members
  const handleDistributeCoins = () => {
    if (!lootResult) return;
    const partyPlayers = db.players;
    if (partyPlayers.length === 0) {
      showToast('No players found in party to distribute coins to.');
      return;
    }

    const shareGp = Math.floor(lootResult.coins.gp / partyPlayers.length);
    const shareSp = Math.floor(lootResult.coins.sp / partyPlayers.length);
    const shareCp = Math.floor(lootResult.coins.cp / partyPlayers.length);
    const sharePp = Math.floor(lootResult.coins.pp / partyPlayers.length);

    for (const player of partyPlayers) {
      const currentCp = player.currency?.cp || 0;
      const currentSp = player.currency?.sp || 0;
      const currentGp = player.currency?.gp || 0;
      const currentPp = player.currency?.pp || 0;

      savePlayer({
        ...player,
        currency: {
          cp: currentCp + shareCp,
          sp: currentSp + shareSp,
          ep: player.currency?.ep || 0,
          gp: currentGp + shareGp,
          pp: currentPp + sharePp,
        },
        updatedAt: new Date().toISOString(),
      });
    }

    showToast(`Distributed coins evenly to ${partyPlayers.length} party members!`);
    setIsDistributeModalOpen(false);
  };

  return (
    <div className="h-full flex flex-col md:flex-row overflow-hidden bg-[#090d12] text-slate-100 select-none">
      {/* LEFT SETTINGS SIDEBAR */}
      <div className="w-full md:w-80 lg:w-96 border-r border-surface-border bg-surface-100/40 p-5 overflow-y-auto flex flex-col space-y-5">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-amber-400">
            <Coins className="w-5 h-5" />
            <h2 className="font-serif text-lg font-bold text-slate-100">D&D 2024 Loot Engine</h2>
          </div>
          <p className="text-xs text-slate-400">
            Generate balanced encounter loot, hoards, trinkets, and magic items scaled to level and theme.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Quick Presets</label>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={handlePresetMonster}
              className="p-2 rounded-lg bg-surface-100 hover:bg-surface-hover border border-surface-border text-center text-xs font-semibold text-slate-200 transition-colors"
            >
              <div className="text-sm mb-0.5">🎒</div>
              <span>Monster</span>
            </button>
            <button
              onClick={handlePresetArea}
              className="p-2 rounded-lg bg-surface-100 hover:bg-surface-hover border border-surface-border text-center text-xs font-semibold text-slate-200 transition-colors"
            >
              <div className="text-sm mb-0.5">🏛️</div>
              <span>Area Search</span>
            </button>
            <button
              onClick={handlePresetHoard}
              className="p-2 rounded-lg bg-amber-950/40 hover:bg-amber-900/60 border border-amber-800/60 text-center text-xs font-semibold text-amber-300 transition-colors"
            >
              <div className="text-sm mb-0.5">👑</div>
              <span>Boss Hoard</span>
            </button>
          </div>
        </div>

        {/* Level & Tier Slider */}
        <div className="p-3.5 rounded-xl bg-surface-100 border border-surface-border space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-200">Encounter Level</label>
            <div className="flex items-center space-x-2">
              <span className="font-mono font-bold text-amber-400 text-sm">Level {level}</span>
              <span className="px-2 py-0.5 rounded bg-purple-950 border border-purple-800 text-purple-300 font-mono text-[10px]">
                Tier {tier}
              </span>
            </div>
          </div>
          <input
            type="range"
            min={1}
            max={20}
            value={level}
            onChange={(e) => setLevel(parseInt(e.target.value, 10))}
            className="w-full accent-amber-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>1 (T1)</span>
            <span>5 (T2)</span>
            <span>11 (T3)</span>
            <span>17 (T4)</span>
            <span>20</span>
          </div>
        </div>

        {/* Difficulty Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">Encounter Difficulty</label>
          <div className="grid grid-cols-5 gap-1">
            {(['easy', 'medium', 'hard', 'deadly', 'boss'] as LootDifficulty[]).map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  difficulty === d
                    ? d === 'boss'
                      ? 'bg-gradient-to-r from-amber-600 to-yellow-500 text-slate-950 font-bold shadow-md'
                      : d === 'deadly'
                      ? 'bg-rose-600 text-white font-bold'
                      : d === 'hard'
                      ? 'bg-amber-600 text-slate-950 font-bold'
                      : d === 'medium'
                      ? 'bg-blue-600 text-white font-bold'
                      : 'bg-emerald-600 text-white font-bold'
                    : 'bg-surface-100 text-slate-400 hover:text-slate-200 border border-surface-border'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Location / Theme */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>Location / Theme</span>
          </label>
          <select
            value={selectedTheme}
            onChange={(e) => setSelectedTheme(e.target.value)}
            className="w-full bg-[#0b0e14] border border-surface-border rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
          >
            {availableThemes.map((th) => (
              <option key={th} value={th}>
                {th === 'All' ? '🌐 All Themes / Any Location' : `🏛️ ${th}`}
              </option>
            ))}
          </select>
        </div>

        {/* Dynamic Source / Type */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1">
            <Layers className="w-3.5 h-3.5 text-purple-400" />
            <span>Loot Source / Type</span>
          </label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full bg-[#0b0e14] border border-surface-border rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
          >
            {availableTypes.map((tp) => (
              <option key={tp} value={tp}>
                {tp === 'All' ? '✨ All Loot Types' : `📦 ${tp}`}
              </option>
            ))}
          </select>
        </div>

        {/* Party Size & Multiplier */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Party Size</label>
            <div className="flex items-center space-x-1">
              <input
                type="number"
                min={1}
                max={12}
                value={partySize}
                onChange={(e) => setPartySize(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-full bg-[#0b0e14] border border-surface-border rounded-lg p-2 text-xs text-center font-bold text-slate-100 focus:outline-none focus:border-amber-500"
              />
              <span className="text-xs text-slate-500">PCs</span>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Gold Multiplier</label>
            <select
              value={currencyMultiplier}
              onChange={(e) => setCurrencyMultiplier(parseFloat(e.target.value))}
              className="w-full bg-[#0b0e14] border border-surface-border rounded-lg p-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
            >
              <option value="0.5">0.5x (Gritty)</option>
              <option value="1.0">1.0x (Standard)</option>
              <option value="1.5">1.5x (Rich)</option>
              <option value="2.0">2.0x (High Magic)</option>
            </select>
          </div>
        </div>

        {/* Content Toggles */}
        <div className="space-y-2 p-3.5 rounded-xl bg-surface-100/50 border border-surface-border">
          <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Loot Inclusions</label>
          <div className="space-y-1.5">
            <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={includeMagicItems}
                onChange={(e) => setIncludeMagicItems(e.target.checked)}
                className="rounded border-surface-border text-amber-500 focus:ring-amber-500 bg-[#0b0e14]"
              />
              <span>Magic Items & Potions (from Database)</span>
            </label>
            <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={includeGeneralLoot}
                onChange={(e) => setIncludeGeneralLoot(e.target.checked)}
                className="rounded border-surface-border text-amber-500 focus:ring-amber-500 bg-[#0b0e14]"
              />
              <span>General Loot, Gems & Relics (from CSV)</span>
            </label>
            <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={includeDbItems}
                onChange={(e) => setIncludeDbItems(e.target.checked)}
                className="rounded border-surface-border text-amber-500 focus:ring-amber-500 bg-[#0b0e14]"
              />
              <span>Mundane Gear & Equipment</span>
            </label>
          </div>
        </div>

        {/* GENERATE BUTTON */}
        <button
          onClick={() => handleGenerate()}
          className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center space-x-2"
        >
          <Dices className="w-5 h-5" />
          <span>Generate Loot Now</span>
        </button>
      </div>

      {/* RIGHT RESULTS CANVAS */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {lootResult ? (
          <>
            {/* Top Metrics Banner */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Grand Total Value */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-amber-950/40 to-yellow-950/20 border border-amber-500/40 space-y-1 shadow-md">
                <div className="flex items-center justify-between text-amber-400">
                  <span className="text-xs font-semibold">Total Gold Value</span>
                  <Coins className="w-4 h-4" />
                </div>
                <div className="font-serif text-2xl font-bold text-amber-300">
                  {lootResult.totalValueGp.toLocaleString()} <span className="text-sm font-sans font-normal text-amber-400/80">GP</span>
                </div>
                <div className="text-[11px] text-amber-400/70 font-mono">
                  {(lootResult.totalValueGp / partySize).toFixed(1)} GP per PC ({partySize} PCs)
                </div>
              </div>

              {/* Total Weight */}
              <div className="p-4 rounded-xl bg-surface-100 border border-surface-border space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-semibold">Total Weight</span>
                  <Package className="w-4 h-4" />
                </div>
                <div className="font-serif text-2xl font-bold text-slate-200">
                  {lootResult.totalWeightLbs.toLocaleString()} <span className="text-sm font-sans font-normal text-slate-400">lbs</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Inc. coins (~{+( (lootResult.coins.cp + lootResult.coins.sp + lootResult.coins.ep + lootResult.coins.gp + lootResult.coins.pp) / 50 ).toFixed(1)} lbs)
                </div>
              </div>

              {/* Total Items */}
              <div className="p-4 rounded-xl bg-surface-100 border border-surface-border space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-semibold">Item Count</span>
                  <Award className="w-4 h-4" />
                </div>
                <div className="font-serif text-2xl font-bold text-slate-200">
                  {lootResult.itemCount} <span className="text-sm font-sans font-normal text-slate-400">items</span>
                </div>
                <div className="text-[11px] text-purple-400 font-mono">
                  {lootResult.items.filter((i) => i.isMagic).length} magic / {lootResult.items.filter((i) => !i.isMagic).length} mundane
                </div>
              </div>

              {/* Encounter Summary Badge */}
              <div className="p-4 rounded-xl bg-surface-100 border border-surface-border space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-semibold">Encounter Profile</span>
                  <Sparkles className="w-4 h-4 text-purple-400" />
                </div>
                <div className="font-serif text-lg font-bold text-slate-200 capitalize">
                  Level {level} {difficulty}
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  {selectedTheme !== 'All' ? selectedTheme : 'General'} • {selectedType !== 'All' ? selectedType : 'Mixed'}
                </div>
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="flex items-center justify-between flex-wrap gap-2 p-3 bg-surface-100/60 rounded-xl border border-surface-border">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleGenerate()}
                  className="px-3 py-1.5 rounded-lg bg-surface-50 hover:bg-surface-hover border border-surface-border text-xs font-semibold text-slate-200 flex items-center space-x-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                  <span>Re-roll All</span>
                </button>

                <button
                  onClick={handleAddExtraItem}
                  className="px-3 py-1.5 rounded-lg bg-surface-50 hover:bg-surface-hover border border-surface-border text-xs font-semibold text-slate-200 flex items-center space-x-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Add Extra Item</span>
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopyMarkdown}
                  className="px-3 py-1.5 rounded-lg bg-surface-50 hover:bg-surface-hover border border-surface-border text-xs font-semibold text-slate-200 flex items-center space-x-1.5 transition-colors"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-blue-400" />}
                  <span>{isCopied ? 'Copied!' : 'Copy Markdown'}</span>
                </button>

                <button
                  onClick={handleSaveToCampaignNotes}
                  className="px-3 py-1.5 rounded-lg bg-sky-950/60 hover:bg-sky-900/80 border border-sky-700/80 text-xs font-semibold text-sky-300 flex items-center space-x-1.5 transition-colors"
                  title="Create or append a formatted loot note in your active campaign notes"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Send to Notes</span>
                </button>

                <button
                  onClick={() => setIsDistributeModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-purple-950/60 hover:bg-purple-900/80 border border-purple-700/80 text-xs font-semibold text-purple-300 flex items-center space-x-1.5 transition-colors"
                  title="Distribute coins directly to party character sheets"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Distribute to Party</span>
                </button>

                <button
                  onClick={handleSaveAsRollTable}
                  className="px-3 py-1.5 rounded-lg bg-amber-950/60 hover:bg-amber-900/80 border border-amber-700/80 text-xs font-semibold text-amber-300 flex items-center space-x-1.5 transition-colors"
                  title="Save this generated batch as a permanent custom Roll Table"
                >
                  <Table className="w-3.5 h-3.5" />
                  <span>Save as Table</span>
                </button>
              </div>
            </div>

            {/* CURRENCY SECTION */}
            <div className="p-4 rounded-xl bg-surface-100 border border-surface-border space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Coins className="w-4 h-4 text-yellow-400" />
                  <h3 className="font-serif font-bold text-slate-200 text-sm">Coins & Currency</h3>
                </div>
                <div className="text-xs font-mono text-slate-400">
                  Total Coins: {lootResult.coins.totalGp.toLocaleString()} GP
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {/* CP */}
                <div className="p-3 rounded-lg bg-[#0b0e14] border border-amber-900/40 text-center space-y-0.5">
                  <div className="text-[10px] text-amber-600 font-bold uppercase">Copper (CP)</div>
                  <div className="font-mono text-base font-bold text-amber-500">{lootResult.coins.cp.toLocaleString()}</div>
                  <div className="text-[10px] text-slate-500 font-mono">{(lootResult.coins.cp / 100).toFixed(2)} GP</div>
                </div>

                {/* SP */}
                <div className="p-3 rounded-lg bg-[#0b0e14] border border-slate-700 text-center space-y-0.5">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Silver (SP)</div>
                  <div className="font-mono text-base font-bold text-slate-300">{lootResult.coins.sp.toLocaleString()}</div>
                  <div className="text-[10px] text-slate-500 font-mono">{(lootResult.coins.sp / 10).toFixed(2)} GP</div>
                </div>

                {/* EP */}
                <div className="p-3 rounded-lg bg-[#0b0e14] border border-indigo-900/40 text-center space-y-0.5">
                  <div className="text-[10px] text-indigo-400 font-bold uppercase">Electrum (EP)</div>
                  <div className="font-mono text-base font-bold text-indigo-300">{lootResult.coins.ep.toLocaleString()}</div>
                  <div className="text-[10px] text-slate-500 font-mono">{(lootResult.coins.ep / 2).toFixed(2)} GP</div>
                </div>

                {/* GP */}
                <div className="p-3 rounded-lg bg-[#0b0e14] border border-yellow-700/60 text-center space-y-0.5 shadow-sm">
                  <div className="text-[10px] text-yellow-500 font-bold uppercase">Gold (GP)</div>
                  <div className="font-mono text-lg font-bold text-yellow-400">{lootResult.coins.gp.toLocaleString()}</div>
                  <div className="text-[10px] text-yellow-500/70 font-mono">{lootResult.coins.gp.toLocaleString()} GP</div>
                </div>

                {/* PP */}
                <div className="p-3 rounded-lg bg-[#0b0e14] border border-cyan-800/40 text-center space-y-0.5">
                  <div className="text-[10px] text-cyan-400 font-bold uppercase">Platinum (PP)</div>
                  <div className="font-mono text-base font-bold text-cyan-300">{lootResult.coins.pp.toLocaleString()}</div>
                  <div className="text-[10px] text-slate-500 font-mono">{(lootResult.coins.pp * 10).toLocaleString()} GP</div>
                </div>
              </div>
            </div>

            {/* GENERATED ITEMS LIST */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Package className="w-4 h-4 text-amber-400" />
                  <h3 className="font-serif font-bold text-slate-200 text-sm">
                    Items, Relics & Treasures ({lootResult.items.length})
                  </h3>
                </div>
              </div>

              {lootResult.items.length === 0 ? (
                <div className="text-center py-10 rounded-xl bg-surface-100/40 border border-surface-border text-slate-500 text-xs">
                  No items generated. Click "Add Extra Item" or re-roll with higher difficulty.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2.5">
                  {lootResult.items.map((item, idx) => {
                    const isMagic = item.isMagic;
                    const isGemOrArt = item.category.toLowerCase().includes('gem') || item.category.toLowerCase().includes('art');

                    return (
                      <div
                        key={item.id || idx}
                        className={`p-3.5 rounded-xl border transition-all flex items-start justify-between flex-wrap gap-3 ${
                          isMagic
                            ? 'bg-purple-950/25 border-purple-700/60 hover:border-purple-500 shadow-sm'
                            : isGemOrArt
                            ? 'bg-amber-950/20 border-amber-800/40 hover:border-amber-600'
                            : 'bg-surface-100 border-surface-border hover:border-slate-600'
                        }`}
                      >
                        <div className="space-y-1 flex-1 min-w-[240px]">
                          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                            {item.quantity > 1 && (
                              <span className="px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 font-bold font-mono text-xs">
                                {item.quantity}x
                              </span>
                            )}
                            <h4 className="font-serif font-bold text-sm text-slate-100">{item.name}</h4>
                            
                            <span className="px-2 py-0.5 rounded bg-surface-50 border border-surface-border text-[10px] font-mono text-slate-300">
                              {item.category}
                            </span>

                            {item.condition && (
                              <span className="px-2 py-0.5 rounded bg-surface-50 border border-surface-border text-[10px] text-slate-400">
                                {item.condition}
                              </span>
                            )}

                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              item.rarity.toLowerCase() === 'legendary' ? 'bg-amber-950 text-amber-300 border border-amber-600' :
                              item.rarity.toLowerCase() === 'very rare' ? 'bg-purple-950 text-purple-300 border border-purple-600' :
                              item.rarity.toLowerCase() === 'rare' ? 'bg-blue-950 text-blue-300 border border-blue-600' :
                              item.rarity.toLowerCase() === 'uncommon' ? 'bg-emerald-950 text-emerald-300 border border-emerald-600' :
                              'bg-slate-800 text-slate-300'
                            }`}>
                              {item.rarity}
                            </span>
                          </div>

                          <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">{item.description}</p>

                          <div className="flex items-center space-x-3 text-[11px] text-slate-500 font-mono pt-1">
                            {item.theme && <span>🏛️ {item.theme}</span>}
                            <span>⚖️ {item.weight}</span>
                            <span className="text-amber-400 font-bold">💰 {item.value} {item.quantity > 1 && `(${(item.valueGp * item.quantity).toLocaleString()} GP total)`}</span>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center space-x-1.5 self-center">
                          {item.itemRef && (
                            <button
                              onClick={() => setInspectingItem(item.itemRef || null)}
                              className="px-2.5 py-1 rounded bg-purple-950/80 hover:bg-purple-900 border border-purple-700 text-purple-300 text-xs font-semibold flex items-center space-x-1 transition-colors"
                              title="Inspect Full Item Card"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Inspect</span>
                            </button>
                          )}

                          <button
                            onClick={() => handleRerollItem(idx)}
                            className="p-1.5 rounded bg-surface-50 hover:bg-surface-hover border border-surface-border text-slate-400 hover:text-white transition-colors"
                            title="Re-roll this item"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleRemoveItem(idx)}
                            className="p-1.5 rounded bg-surface-50 hover:bg-red-950/60 border border-surface-border hover:border-red-800 text-slate-500 hover:text-red-300 transition-colors"
                            title="Remove this item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-500 text-xs">
            Adjust settings on the left and click "Generate Loot Now".
          </div>
        )}
      </div>

      {/* Inspect Item Modal */}
      {inspectingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="max-w-xl w-full bg-[#10141d] border border-surface-border rounded-xl shadow-2xl p-6 relative animate-scaleUp">
            <button
              onClick={() => setInspectingItem(null)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-surface-hover"
            >
              <Check className="w-5 h-5" />
            </button>
            <ItemCard item={inspectingItem} />
          </div>
        </div>
      )}

      {/* Distribute Coins Modal */}
      {isDistributeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="max-w-md w-full bg-[#10141d] border border-surface-border rounded-xl shadow-2xl p-5 space-y-4 animate-scaleUp">
            <div className="flex items-center space-x-2 text-purple-400">
              <Users className="w-5 h-5" />
              <h3 className="font-serif font-bold text-slate-100 text-base">Distribute Coins to Party</h3>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Splits all generated copper, silver, electrum, gold, and platinum evenly across all {db.players.length} active player character sheets in your party.
            </p>

            <div className="p-3.5 rounded-lg bg-surface-100 border border-surface-border space-y-1.5 text-xs font-mono">
              <div className="text-slate-300 font-semibold">Each Character Receives:</div>
              <div className="text-amber-400">
                + {Math.floor((lootResult?.coins.gp || 0) / Math.max(1, db.players.length))} GP
                {lootResult?.coins.sp ? ` • +${Math.floor(lootResult.coins.sp / Math.max(1, db.players.length))} SP` : ''}
                {lootResult?.coins.cp ? ` • +${Math.floor(lootResult.coins.cp / Math.max(1, db.players.length))} CP` : ''}
                {lootResult?.coins.pp ? ` • +${Math.floor(lootResult.coins.pp / Math.max(1, db.players.length))} PP` : ''}
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-surface-border">
              <button
                onClick={() => setIsDistributeModalOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-surface-100 hover:bg-surface-hover text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleDistributeCoins}
                className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow transition-colors"
              >
                Confirm Distribution
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
