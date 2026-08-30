import { ItemEntity } from '../types/item';
import { RollTableEntity } from '../types/rollTable';
import { 
  LootDifficulty, 
  LootTier, 
  GenericLootItem, 
  GeneratedLootEntry, 
  LootCoins, 
  GeneratedLootResult 
} from '../types/loot';
import { GENERAL_LOOT_ITEMS } from './srdData/generalLootData';
import { rollDice } from './diceService';

// Helper to calculate tier from character/encounter level
export function getTierFromLevel(level: number): LootTier {
  if (level <= 4) return 1;
  if (level <= 10) return 2;
  if (level <= 16) return 3;
  return 4;
}

// Helper to extract all available unique themes from tables and CSV
export function getAvailableThemes(tables: RollTableEntity[] = []): string[] {
  const themeSet = new Set<string>();
  
  // From General Loot items
  for (const item of GENERAL_LOOT_ITEMS) {
    if (item.theme) themeSet.add(item.theme);
  }

  // From Roll Tables
  for (const table of tables) {
    if (table.theme) themeSet.add(table.theme);
    for (const row of table.items) {
      if (row.values?.theme) themeSet.add(String(row.values.theme));
      if (row.values?.Theme) themeSet.add(String(row.values.Theme));
      if (row.theme) themeSet.add(String(row.theme));
    }
  }

  const themes = Array.from(themeSet).filter(Boolean).sort();
  return themes;
}

// Helper to extract all available unique types from tables and CSV
export function getAvailableTypes(tables: RollTableEntity[] = []): string[] {
  const typeSet = new Set<string>();
  
  // Default common loot types
  typeSet.add('area loot');
  typeSet.add('monster');
  typeSet.add('boss');
  typeSet.add('npc loot');
  typeSet.add('chest / hoard');

  // From General Loot items
  for (const item of GENERAL_LOOT_ITEMS) {
    if (item.type) typeSet.add(item.type);
  }

  // From Roll Tables
  for (const table of tables) {
    for (const row of table.items) {
      if (row.values?.type) typeSet.add(String(row.values.type));
      if (row.values?.Type) typeSet.add(String(row.values.Type));
      if (row.type) typeSet.add(String(row.type));
    }
  }

  const types = Array.from(typeSet).filter(Boolean).sort();
  return types;
}

// Parse currency strings to GP
export function parseValueToGp(val: string | undefined): number {
  if (!val) return 0;
  const cleaned = String(val).replace(/,/g, '').trim().toLowerCase();
  const match = cleaned.match(/([\d\.]+)\s*(cp|sp|ep|gp|pp)/);
  if (!match) {
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  }
  const amount = parseFloat(match[1]);
  const unit = match[2];
  if (unit === 'cp') return +(amount / 100).toFixed(2);
  if (unit === 'sp') return +(amount / 10).toFixed(2);
  if (unit === 'ep') return +(amount / 2).toFixed(2);
  if (unit === 'gp') return +amount.toFixed(2);
  if (unit === 'pp') return +(amount * 10).toFixed(2);
  return amount;
}

// Parse weight strings to lbs
export function parseWeightToLbs(val: string | undefined): number {
  if (!val) return 0;
  const match = String(val).replace(/,/g, '').trim().toLowerCase().match(/([\d\.]+)\s*lbs?/);
  if (match) return parseFloat(match[1]);
  const num = parseFloat(val);
  return isNaN(num) ? 0 : num;
}

const DIFFICULTY_MULTIPLIERS: Record<LootDifficulty, number> = {
  easy: 0.75,
  medium: 1.0,
  hard: 1.35,
  deadly: 1.75,
  boss: 2.5,
};

export interface GenerateLootOptions {
  level: number; // 1-20
  difficulty: LootDifficulty;
  theme?: string; // 'All' or specific e.g. 'Ancient Temple'
  type?: string; // 'All' or specific e.g. 'area loot', 'monster', 'boss'
  partySize?: number; // default 4
  includeMagicItems?: boolean; // default true
  includeGeneralLoot?: boolean; // default true
  includeDbItems?: boolean; // default true
  currencyMultiplier?: number; // default 1.0
  customItemCount?: number;
}

export function generateDndLoot(
  options: GenerateLootOptions,
  dbItems: ItemEntity[] = [],
  dbTables: RollTableEntity[] = []
): GeneratedLootResult {
  const {
    level,
    difficulty,
    theme = 'All',
    type = 'All',
    partySize = 4,
    includeMagicItems = true,
    includeGeneralLoot = true,
    includeDbItems = true,
    currencyMultiplier = 1.0,
  } = options;

  const tier = getTierFromLevel(level);
  const diffMult = DIFFICULTY_MULTIPLIERS[difficulty] || 1.0;
  const isHoardOrBoss = difficulty === 'boss' || type.toLowerCase().includes('boss') || type.toLowerCase().includes('hoard') || type.toLowerCase().includes('chest');

  // 1. GENERATE COINS (D&D 2024 rules)
  let cp = 0;
  let sp = 0;
  let ep = 0;
  let gp = 0;
  let pp = 0;

  if (isHoardOrBoss) {
    // Hoard / Boss encounter treasure table
    if (tier === 1) {
      cp = Math.round(rollDice('6d6').total * 100 * diffMult * currencyMultiplier);
      sp = Math.round(rollDice('3d6').total * 100 * diffMult * currencyMultiplier);
      gp = Math.round(rollDice('2d6').total * 10 * diffMult * currencyMultiplier);
    } else if (tier === 2) {
      sp = Math.round(rollDice('2d6').total * 100 * diffMult * currencyMultiplier);
      gp = Math.round(rollDice('2d6').total * 100 * diffMult * currencyMultiplier);
      pp = Math.round(rollDice('3d6').total * 10 * diffMult * currencyMultiplier);
    } else if (tier === 3) {
      gp = Math.round(rollDice('4d6').total * 1000 * diffMult * currencyMultiplier);
      pp = Math.round(rollDice('5d6').total * 100 * diffMult * currencyMultiplier);
    } else {
      // Tier 4
      gp = Math.round(rollDice('12d6').total * 1000 * diffMult * currencyMultiplier);
      pp = Math.round(rollDice('8d6').total * 1000 * diffMult * currencyMultiplier);
    }
  } else {
    // Individual / Area / Monster loot
    if (tier === 1) {
      cp = Math.round(rollDice('4d6').total * diffMult * currencyMultiplier);
      sp = Math.round(rollDice('3d6').total * diffMult * currencyMultiplier);
      if (difficulty === 'deadly' || difficulty === 'hard') {
        gp = Math.round(rollDice('2d6').total * diffMult * currencyMultiplier);
      }
    } else if (tier === 2) {
      sp = Math.round(rollDice('4d6').total * 10 * diffMult * currencyMultiplier);
      gp = Math.round(rollDice('4d6').total * diffMult * currencyMultiplier);
      if (difficulty === 'deadly' || difficulty === 'hard') {
        pp = Math.round(rollDice('1d6').total * diffMult * currencyMultiplier);
      }
    } else if (tier === 3) {
      gp = Math.round(rollDice('4d6').total * 10 * diffMult * currencyMultiplier);
      pp = Math.round(rollDice('1d6').total * 10 * diffMult * currencyMultiplier);
    } else {
      // Tier 4
      gp = Math.round(rollDice('8d6').total * 100 * diffMult * currencyMultiplier);
      pp = Math.round(rollDice('3d6').total * 10 * diffMult * currencyMultiplier);
    }
  }

  const totalCoinsGp = +( (cp / 100) + (sp / 10) + (ep / 2) + gp + (pp * 10) ).toFixed(2);
  const coins: LootCoins = { cp, sp, ep, gp, pp, totalGp: totalCoinsGp };

  // 2. COMPOSE ITEMS POOL
  const generatedItems: GeneratedLootEntry[] = [];

  // Filter General Loot Items by Theme and Type
  let filteredGeneralItems = [...GENERAL_LOOT_ITEMS];

  if (theme && theme !== 'All') {
    const themeMatch = filteredGeneralItems.filter((i) => i.theme.toLowerCase() === theme.toLowerCase() || i.theme.toLowerCase() === 'general');
    if (themeMatch.length > 0) {
      filteredGeneralItems = themeMatch;
    }
  }

  if (type && type !== 'All') {
    const typeMatch = filteredGeneralItems.filter((i) => i.type.toLowerCase() === type.toLowerCase());
    if (typeMatch.length > 0) {
      filteredGeneralItems = typeMatch;
    }
  }

  // Include custom multi-column roll table rows if available
  for (const tbl of dbTables) {
    if (tbl.id === 'srd-table-general-dungeon-loot') continue; // already in GENERAL_LOOT_ITEMS
    for (const row of tbl.items) {
      const rowVals = row.values || {};
      const rowTheme = rowVals.theme || rowVals.Theme || tbl.theme || 'General';
      const rowType = rowVals.type || rowVals.Type || 'area loot';
      
      const matchesTheme = !theme || theme === 'All' || String(rowTheme).toLowerCase() === theme.toLowerCase() || String(rowTheme).toLowerCase() === 'general';
      const matchesType = !type || type === 'All' || String(rowType).toLowerCase() === type.toLowerCase();

      if (matchesTheme && matchesType) {
        const itemVal = String(rowVals.value || rowVals.Value || '10 gp');
        const itemWeight = String(rowVals.weight || rowVals.Weight || '1 lb.');
        filteredGeneralItems.push({
          name: row.result || rowVals.name || rowVals.Name || 'Curious Object',
          category: String(rowVals.category || rowVals.Category || 'Curio'),
          type: String(rowType),
          theme: String(rowTheme),
          value: itemVal,
          valueGp: parseValueToGp(itemVal),
          weight: itemWeight,
          weightLbs: parseWeightToLbs(itemWeight),
          condition: String(rowVals.condition || rowVals.Condition || 'Intact'),
          rarity: String(rowVals.rarity || rowVals.Rarity || 'Common'),
          description: String(rowVals.description || rowVals.Description || row.result || ''),
        });
      }
    }
  }

  // Determine Item Counts based on Tier & Difficulty
  let artAndGemsCount = 0;
  let thematicGeneralCount = 0;
  let magicItemCount = 0;

  if (isHoardOrBoss) {
    if (tier === 1) {
      artAndGemsCount = Math.max(1, Math.round(rollDice('2d4').total * diffMult));
      thematicGeneralCount = Math.max(1, Math.round(rollDice('1d4+1').total * diffMult));
      magicItemCount = includeMagicItems ? (rollDice('1d4').total > 1 ? (tier === 1 ? 1 : 2) : 1) : 0;
    } else if (tier === 2) {
      artAndGemsCount = Math.max(2, Math.round(rollDice('2d6').total * diffMult));
      thematicGeneralCount = Math.max(2, Math.round(rollDice('1d6+2').total * diffMult));
      magicItemCount = includeMagicItems ? Math.max(1, Math.round(rollDice('1d4').total)) : 0;
    } else if (tier === 3) {
      artAndGemsCount = Math.max(3, Math.round(rollDice('3d6').total * diffMult));
      thematicGeneralCount = Math.max(2, Math.round(rollDice('2d4').total * diffMult));
      magicItemCount = includeMagicItems ? Math.max(1, Math.round(rollDice('1d4+1').total)) : 0;
    } else {
      // Tier 4
      artAndGemsCount = Math.max(4, Math.round(rollDice('3d8').total * diffMult));
      thematicGeneralCount = Math.max(3, Math.round(rollDice('2d6').total * diffMult));
      magicItemCount = includeMagicItems ? Math.max(2, Math.round(rollDice('1d4+2').total)) : 0;
    }
  } else {
    // Individual / Regular Encounter
    if (tier === 1) {
      artAndGemsCount = rollDice('1d6').total >= 4 ? 1 : 0;
      thematicGeneralCount = Math.max(1, Math.round(rollDice('1d3').total * diffMult));
      magicItemCount = includeMagicItems && (difficulty === 'deadly' || rollDice('1d20').total >= 16) ? 1 : 0;
    } else if (tier === 2) {
      artAndGemsCount = Math.max(1, Math.round(rollDice('1d4').total * diffMult));
      thematicGeneralCount = Math.max(1, Math.round(rollDice('1d4').total * diffMult));
      magicItemCount = includeMagicItems && (difficulty === 'deadly' || rollDice('1d20').total >= 12) ? 1 : 0;
    } else if (tier === 3) {
      artAndGemsCount = Math.max(1, Math.round(rollDice('1d6').total * diffMult));
      thematicGeneralCount = Math.max(1, Math.round(rollDice('1d4+1').total * diffMult));
      magicItemCount = includeMagicItems && (difficulty === 'deadly' || rollDice('1d20').total >= 10) ? Math.max(1, Math.round(rollDice('1d2').total)) : 0;
    } else {
      // Tier 4
      artAndGemsCount = Math.max(2, Math.round(rollDice('2d4').total * diffMult));
      thematicGeneralCount = Math.max(2, Math.round(rollDice('1d6').total * diffMult));
      magicItemCount = includeMagicItems ? Math.max(1, Math.round(rollDice('1d3').total)) : 0;
    }
  }

  // 3. PICK GEMS & ART OBJECTS
  if (includeGeneralLoot && artAndGemsCount > 0) {
    // Filter gemstones & art by value appropriate for tier
    const gemAndArtItems = filteredGeneralItems.filter(
      (i) => i.category.toLowerCase().includes('gem') || i.category.toLowerCase().includes('art')
    );

    const availableGems = gemAndArtItems.length > 0 ? gemAndArtItems : GENERAL_LOOT_ITEMS.filter((i) => i.category.toLowerCase().includes('gem') || i.category.toLowerCase().includes('art'));

    // Filter tier-appropriate values
    let targetGems = availableGems;
    if (tier === 1) targetGems = availableGems.filter((i) => i.valueGp <= 50);
    else if (tier === 2) targetGems = availableGems.filter((i) => i.valueGp >= 25 && i.valueGp <= 500);
    else if (tier === 3) targetGems = availableGems.filter((i) => i.valueGp >= 100 && i.valueGp <= 2500);
    else targetGems = availableGems.filter((i) => i.valueGp >= 500);

    if (targetGems.length === 0) targetGems = availableGems;

    for (let i = 0; i < artAndGemsCount; i++) {
      const chosen = targetGems[Math.floor(Math.random() * targetGems.length)];
      if (chosen) {
        // Group identical gems if already exists
        const existing = generatedItems.find((it) => it.name === chosen.name);
        if (existing) {
          existing.quantity += 1;
        } else {
          generatedItems.push({
            id: `loot-gem-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
            name: chosen.name,
            category: chosen.category,
            type: chosen.type,
            theme: chosen.theme,
            value: chosen.value,
            valueGp: chosen.valueGp,
            weight: chosen.weight,
            weightLbs: chosen.weightLbs,
            quantity: 1,
            condition: chosen.condition,
            rarity: chosen.rarity,
            description: chosen.description,
            isMagic: false,
          });
        }
      }
    }
  }

  // 4. PICK THEMATIC GENERAL / MUNDANE / RELIC ITEMS
  if (includeGeneralLoot && thematicGeneralCount > 0) {
    const nonGemItems = filteredGeneralItems.filter(
      (i) => !i.category.toLowerCase().includes('gem') && !i.category.toLowerCase().includes('art')
    );
    const availablePool = nonGemItems.length > 0 ? nonGemItems : filteredGeneralItems;

    for (let i = 0; i < thematicGeneralCount; i++) {
      const chosen = availablePool[Math.floor(Math.random() * availablePool.length)];
      if (chosen) {
        const existing = generatedItems.find((it) => it.name === chosen.name);
        if (existing) {
          existing.quantity += 1;
        } else {
          generatedItems.push({
            id: `loot-gen-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
            name: chosen.name,
            category: chosen.category,
            type: chosen.type,
            theme: chosen.theme,
            value: chosen.value,
            valueGp: chosen.valueGp,
            weight: chosen.weight,
            weightLbs: chosen.weightLbs,
            quantity: 1,
            condition: chosen.condition,
            rarity: chosen.rarity,
            description: chosen.description,
            isMagic: false,
          });
        }
      }
    }
  }

  // 5. PICK MAGIC ITEMS FROM CURRENT DATABASE (db.items)
  if (includeMagicItems && magicItemCount > 0 && dbItems.length > 0) {
    // Map tier to appropriate magic item rarities according to D&D 2024 DMG rules
    let allowedRarities: string[] = ['Common', 'Uncommon'];
    if (tier === 1) {
      allowedRarities = difficulty === 'deadly' || difficulty === 'boss' ? ['Common', 'Uncommon'] : ['Common'];
    } else if (tier === 2) {
      allowedRarities = difficulty === 'deadly' || difficulty === 'boss' ? ['Uncommon', 'Rare'] : ['Common', 'Uncommon'];
    } else if (tier === 3) {
      allowedRarities = difficulty === 'deadly' || difficulty === 'boss' ? ['Rare', 'Very Rare'] : ['Uncommon', 'Rare'];
    } else {
      // Tier 4
      allowedRarities = difficulty === 'deadly' || difficulty === 'boss' ? ['Very Rare', 'Legendary'] : ['Rare', 'Very Rare'];
    }

    const matchingDbMagicItems = dbItems.filter((it) => {
      const r = (it.rarity || 'Common').trim();
      return allowedRarities.some((allowed) => allowed.toLowerCase() === r.toLowerCase());
    });

    const magicPool = matchingDbMagicItems.length > 0 ? matchingDbMagicItems : dbItems;

    for (let i = 0; i < magicItemCount; i++) {
      const chosenItem = magicPool[Math.floor(Math.random() * magicPool.length)];
      if (chosenItem) {
        // Approximate standard D&D magic item market values if not set
        const defaultMagicGp = 
          chosenItem.rarity?.toLowerCase() === 'common' ? 50 :
          chosenItem.rarity?.toLowerCase() === 'uncommon' ? 350 :
          chosenItem.rarity?.toLowerCase() === 'rare' ? 2500 :
          chosenItem.rarity?.toLowerCase() === 'very rare' ? 15000 :
          chosenItem.rarity?.toLowerCase() === 'legendary' ? 50000 : 100;

        const itemValGp = chosenItem.value ? parseValueToGp(chosenItem.value) : defaultMagicGp;
        const itemWeightLbs = chosenItem.weight ? parseWeightToLbs(chosenItem.weight) : 1;

        generatedItems.push({
          id: `loot-magic-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          name: chosenItem.name,
          category: chosenItem.itemType || 'Magic Item',
          type: type !== 'All' ? type : 'magic item',
          theme: theme !== 'All' ? theme : 'General',
          value: chosenItem.value || `${itemValGp.toLocaleString()} gp`,
          valueGp: itemValGp,
          weight: chosenItem.weight || `${itemWeightLbs} lb.`,
          weightLbs: itemWeightLbs,
          quantity: 1,
          condition: 'Magical',
          rarity: chosenItem.rarity || 'Common',
          description: chosenItem.description || `A wondrous ${chosenItem.rarity} item.`,
          isMagic: true,
          itemRef: chosenItem,
        });
      }
    }
  }

  // 6. CALCULATE TOTALS
  let totalItemsValueGp = 0;
  let totalWeightLbs = 0;
  let totalItemCount = 0;

  for (const item of generatedItems) {
    totalItemsValueGp += item.valueGp * item.quantity;
    totalWeightLbs += item.weightLbs * item.quantity;
    totalItemCount += item.quantity;
  }

  // Coin weight: 50 coins = 1 lb in D&D rules
  const totalCoinCount = cp + sp + ep + gp + pp;
  const coinWeightLbs = +(totalCoinCount / 50).toFixed(2);
  totalWeightLbs = +(totalWeightLbs + coinWeightLbs).toFixed(2);

  const grandTotalGp = +(totalCoinsGp + totalItemsValueGp).toFixed(2);

  return {
    id: `loot-gen-${Date.now()}`,
    timestamp: new Date().toISOString(),
    parameters: {
      level,
      tier,
      difficulty,
      theme,
      type,
      partySize,
      includeMagicItems,
      includeGeneralLoot,
      includeDbItems,
      currencyMultiplier,
    },
    coins,
    items: generatedItems,
    totalValueGp: grandTotalGp,
    totalWeightLbs,
    itemCount: totalItemCount,
  };
}
