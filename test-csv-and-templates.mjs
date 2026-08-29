import Papa from 'papaparse';
import { DEFAULT_TEMPLATES, generateCsvTemplate, importCsvToEntities, exportEntitiesToCsv } from './src/services/templateEngine.ts';

console.log('--- Testing CSV Template Generation & Bulk Import for All Entity Types ---');

const entityTypes = ['monster', 'spell', 'item', 'player', 'rollTable', 'encounter', 'campaignNote', 'feat'];

for (const type of entityTypes) {
  const template = DEFAULT_TEMPLATES[type];
  if (!template) {
    throw new Error(`Missing template for ${type}`);
  }

  // 1. Generate CSV Template
  const csvTemplate = generateCsvTemplate(template);
  console.log(`[PASS] Generated CSV template for "${template.displayName}" (${template.csvHeaders.length} headers)`);

  // 2. Import CSV Template back (as a single sample record test)
  const importRes = importCsvToEntities(csvTemplate, type, []);
  if (!importRes.success || importRes.importedEntities.length === 0) {
    console.error(`[FAIL] Failed to parse generated CSV for ${type}:`, importRes.errors);
    process.exit(1);
  }
  console.log(`[PASS] Successfully imported sample ${type} entity: "${importRes.importedEntities[0].name}"`);

  // 3. Re-export entities to CSV
  const reExportedCsv = exportEntitiesToCsv(importRes.importedEntities, template);
  if (!reExportedCsv || reExportedCsv.length < 10) {
    console.error(`[FAIL] Failed to re-export ${type} to CSV`);
    process.exit(1);
  }
  console.log(`[PASS] Re-exported ${type} to CSV successfully.\n`);
}

console.log('====================================================');
console.log('ALL CSV TEMPLATE & BULK IMPORT/EXPORT TESTS PASSED!');
console.log('====================================================');
