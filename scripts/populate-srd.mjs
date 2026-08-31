import fs from 'fs';
import path from 'path';

const fullDb = JSON.parse(fs.readFileSync('./recovered_full_database.json', 'utf-8'));

// 1. Process Monsters
console.log(`Processing ${fullDb.monsters.length} monsters...`);
const monsters = fullDb.monsters.map((m) => {
  const isSrdId = m.id.startsWith('srd-') ? m.id : `srd-monster-${m.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  return {
    ...m,
    id: isSrdId,
    type: 'monster',
    createdAt: m.createdAt || '2026-01-01T00:00:00Z',
    updatedAt: m.updatedAt || '2026-01-01T00:00:00Z',
  };
});

const monstersTsContent = `import { MonsterEntity } from '../../types/monster';\n\nexport const SRD_MONSTERS: MonsterEntity[] = ${JSON.stringify(monsters, null, 2)};\n`;
fs.writeFileSync('./src/services/srdData/monstersData.ts', monstersTsContent, 'utf-8');
console.log(`Saved ${monsters.length} monsters to src/services/srdData/monstersData.ts`);

// 2. Process Spells
console.log(`Processing ${fullDb.spells.length} spells...`);
const spells = fullDb.spells.map((s) => {
  const isSrdId = s.id.startsWith('srd-') ? s.id : `srd-spell-${s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  
  // Infer element, shape, rangeFeet if missing
  const desc = (s.description || '').toLowerCase();
  const name = (s.name || '').toLowerCase();
  const element = s.element || (
    desc.includes('fire') || name.includes('fire') || name.includes('flame') ? 'fire' :
    desc.includes('cold') || desc.includes('frost') || desc.includes('ice') ? 'cold' :
    desc.includes('lightning') || name.includes('lightning') || name.includes('bolt') ? 'lightning' :
    desc.includes('thunder') || name.includes('thunder') ? 'thunder' :
    desc.includes('radiant') || name.includes('radiant') || name.includes('holy') || name.includes('sacred') ? 'radiant' :
    desc.includes('necrotic') || name.includes('death') || name.includes('undead') ? 'necrotic' :
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
  
  let rangeFeet = s.rangeFeet;
  if (!rangeFeet) {
    const rangeMatch = (s.range || '').match(/(\d+)\s*feet/i) || (s.range || '').match(/(\d+)\s*ft/i);
    if (rangeMatch) {
      rangeFeet = parseInt(rangeMatch[1], 10);
    } else if (s.range?.toLowerCase().includes('touch')) {
      rangeFeet = 5;
    } else if (s.range?.toLowerCase().includes('self')) {
      rangeFeet = 0;
    }
  }

  const aoe = s.aoe || (shape !== 'none' ? { shape, sizeFeet: 20 } : undefined);

  return {
    ...s,
    id: isSrdId,
    type: 'spell',
    element,
    shape,
    rangeFeet,
    aoe,
    createdAt: s.createdAt || '2026-01-01T00:00:00Z',
    updatedAt: s.updatedAt || '2026-01-01T00:00:00Z',
  };
});

const spellsTsContent = `import { SpellEntity } from '../../types/spell';\n\nexport const SRD_SPELLS: SpellEntity[] = ${JSON.stringify(spells, null, 2)};\n`;
fs.writeFileSync('./src/services/srdData/spellsData.ts', spellsTsContent, 'utf-8');
console.log(`Saved ${spells.length} spells to src/services/srdData/spellsData.ts`);

// 3. Process Items
console.log(`Processing ${fullDb.items.length} items...`);
const items = fullDb.items.map((i) => {
  const isSrdId = i.id.startsWith('srd-') ? i.id : `srd-item-${i.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  return {
    ...i,
    id: isSrdId,
    type: 'item',
    createdAt: i.createdAt || '2026-01-01T00:00:00Z',
    updatedAt: i.updatedAt || '2026-01-01T00:00:00Z',
  };
});

const itemsTsContent = `import { ItemEntity } from '../../types/item';\n\nexport const SRD_ITEMS: ItemEntity[] = ${JSON.stringify(items, null, 2)};\n`;
fs.writeFileSync('./src/services/srdData/itemsData.ts', itemsTsContent, 'utf-8');
console.log(`Saved ${items.length} items to src/services/srdData/itemsData.ts`);

console.log('Done populating official base compendium!');
