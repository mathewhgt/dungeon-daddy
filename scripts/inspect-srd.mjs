import fs from 'fs';
import { SRD_ITEMS } from '../src/services/srdData/itemsData.ts';
import { SRD_MONSTERS } from '../src/services/srdData/monstersData.ts';
import { SRD_SPELLS } from '../src/services/srdData/spellsData.ts';
import { SRD_ROLL_TABLES } from '../src/services/srdData/tablesData.ts';

const fullDb = JSON.parse(fs.readFileSync('./recovered_full_database.json', 'utf-8'));
const handbook = JSON.parse(fs.readFileSync('./src/services/srdData/handbookChapters.json', 'utf-8'));

console.log({
  current_srd: {
    monsters: SRD_MONSTERS.length,
    spells: SRD_SPELLS.length,
    items: SRD_ITEMS.length,
    tables: SRD_ROLL_TABLES.length
  },
  recovered_full: {
    monsters: fullDb.monsters?.length,
    spells: fullDb.spells?.length,
    items: fullDb.items?.length,
    tables: fullDb.tables?.length
  },
  handbook: {
    books: handbook.books?.length,
    chapters: handbook.chapters?.length,
    classes: handbook.classes?.length,
    species: handbook.species?.length,
    backgrounds: handbook.backgrounds?.length,
    feats: handbook.feats?.length,
    weaponMasteries: handbook.weaponMasteries?.length,
    conditions: handbook.conditions?.length
  }
});
