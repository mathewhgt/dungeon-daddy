import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Download, 
  Upload, 
  Plus, 
  Trash2, 
  Save, 
  CheckCircle2, 
  AlertCircle, 
  Edit3,
  Layers,
  FileText,
  History,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { EntityType, SchemaField, TemplateDefinition } from '../../types/entity';
import { generateCsvTemplate, importCsvToEntities, exportEntitiesToCsv, detectEntityTypeFromCsv } from '../../services/templateEngine';

export const TemplateManagerView: React.FC = () => {
  const { 
    templates, 
    updateTemplate, 
    resetTemplateToDefault,
    db, 
    bulkAddEntities, 
    showToast, 
    templateSelectedType, 
    setTemplateSelectedType,
    setIsRollbackModalOpen 
  } = useApp();

  const selectedType = templateSelectedType;
  const setSelectedType = setTemplateSelectedType;

  const [csvInput, setCsvInput] = useState<string>('');
  const [importReport, setImportReport] = useState<any>(null);
  const [importTargetType, setImportTargetType] = useState<EntityType>(templateSelectedType);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [detectedInfo, setDetectedInfo] = useState<{ detectedType: EntityType; confidence: number; reason: string } | null>(null);
  const [newFieldKey, setNewFieldKey] = useState('');
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldType, setNewFieldType] = useState<any>('string');

  const currentTemplate = templates[selectedType];

  const entityTypes: { type: EntityType; label: string; count: number }[] = [
    { type: 'monster', label: 'Monsters & NPCs', count: db.monsters.length },
    { type: 'spell', label: 'Spells', count: db.spells.length },
    { type: 'item', label: 'Items & Gear', count: db.items.length },
    { type: 'player', label: 'Player Characters', count: db.players.length },
    { type: 'rollTable', label: 'Roll Tables', count: db.tables.length },
    { type: 'encounter', label: 'Encounters', count: db.encounters.length },
    { type: 'campaignNote', label: 'Campaign Notes', count: (db.campaigns[0]?.notes || []).length },
    { type: 'feat', label: 'Feats & Features', count: 0 },
  ];

  const handleDownloadTemplate = (type: EntityType) => {
    const tmpl = templates[type];
    const csv = generateCsvTemplate(tmpl);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${type}_template.csv`;
    link.click();
    showToast(`Downloaded CSV template for ${tmpl.displayName}!`);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCsvInput(content);

      // Auto-detect CSV type from column headers
      const detected = detectEntityTypeFromCsv(content);
      const target = detected ? detected.detectedType : selectedType;
      
      setDetectedInfo(detected);
      setImportTargetType(target);
      if (detected && detected.detectedType !== selectedType) {
        setSelectedType(detected.detectedType);
        showToast(`✨ Auto-detected CSV format as: ${templates[detected.detectedType].displayName}`);
      }

      const res = importCsvToEntities(content, target, []);
      setImportReport(res);
      setIsImportModalOpen(true);
    };
    reader.readAsText(file);
  };

  const handleTargetTypeChange = (newType: EntityType) => {
    setImportTargetType(newType);
    if (csvInput) {
      const reParsed = importCsvToEntities(csvInput, newType, []);
      setImportReport(reParsed);
    }
  };

  const handleConfirmImport = () => {
    if (!importReport || !importReport.importedEntities.length) return;
    bulkAddEntities(importTargetType, importReport.importedEntities);
    setIsImportModalOpen(false);
    setCsvInput('');
    setImportReport(null);
    setDetectedInfo(null);
  };

  const handleAddField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFieldKey.trim() || !newFieldLabel.trim()) return;

    const cleanKey = newFieldKey.trim().replace(/\s+/g, '_').toLowerCase();
    if (currentTemplate.fields.some((f) => f.key === cleanKey)) {
      alert('Field with this key already exists in this template.');
      return;
    }

    const updatedFields: SchemaField[] = [
      ...currentTemplate.fields,
      {
        key: cleanKey,
        label: newFieldLabel.trim(),
        type: newFieldType,
        required: false,
      },
    ];

    const updatedHeaders = [...currentTemplate.csvHeaders, cleanKey];

    updateTemplate(selectedType, {
      ...currentTemplate,
      fields: updatedFields,
      csvHeaders: updatedHeaders,
    });

    setNewFieldKey('');
    setNewFieldLabel('');
    showToast(`Added field "${newFieldLabel}" to ${currentTemplate.displayName} template!`);
  };

  const handleRemoveField = (fieldKey: string) => {
    if (['name', 'id', 'type', 'armorClass', 'hitPoints', 'level', 'school'].includes(fieldKey)) {
      alert('Core required field cannot be removed.');
      return;
    }

    const updatedFields = currentTemplate.fields.filter((f) => f.key !== fieldKey);
    const updatedHeaders = currentTemplate.csvHeaders.filter((h) => h !== fieldKey);

    updateTemplate(selectedType, {
      ...currentTemplate,
      fields: updatedFields,
      csvHeaders: updatedHeaders,
    });
  };

  return (
    <div className="h-full flex flex-col bg-[#090d12] overflow-hidden select-none">
      {/* Header */}
      <div className="p-4 bg-surface-100/60 border-b border-surface-border flex items-center justify-between">
        <div>
          <h1 className="font-serif text-xl font-bold text-slate-100 flex items-center space-x-2">
            <FileSpreadsheet className="w-5 h-5 text-purple-400" />
            <span>Template & CSV Import / Export Manager</span>
          </h1>
          <p className="text-xs text-slate-400">
            Customize schema templates and import/export bulk data for any entity in your compendium.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsRollbackModalOpen(true)}
            className="px-3 py-1.5 bg-amber-950/60 hover:bg-amber-900/80 border border-amber-700/60 text-amber-300 text-xs font-bold rounded-lg shadow-sm transition-all flex items-center space-x-1.5"
          >
            <History className="w-4 h-4 text-amber-400" />
            <span>Snapshots & Rollback</span>
          </button>

          <label className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-lg shadow-md transition-all flex items-center space-x-1.5 cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>Bulk Import CSV</span>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <button
            onClick={() => handleDownloadTemplate(selectedType)}
            className="px-3 py-1.5 bg-surface-50 hover:bg-surface-hover border border-surface-border text-slate-200 text-xs font-semibold rounded-lg flex items-center space-x-1.5"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Download {currentTemplate.displayName} CSV Template</span>
          </button>
        </div>
      </div>

      {/* Main Two-Pane Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Template Type Selector */}
        <div className="w-72 border-r border-surface-border bg-[#0d1117] p-3 space-y-1.5 overflow-y-auto shrink-0">
          <div className="text-[11px] font-bold uppercase text-slate-400 tracking-wider mb-2">
            Entity Schemas
          </div>

          {entityTypes.map((et) => {
            const isSelected = selectedType === et.type;
            return (
              <button
                key={et.type}
                onClick={() => setSelectedType(et.type)}
                className={`w-full p-2.5 rounded-lg border text-left flex items-center justify-between transition-all ${
                  isSelected
                    ? 'bg-purple-500/15 border-purple-500/50 shadow-sm text-purple-300'
                    : 'bg-surface-100 border-surface-border text-slate-300 hover:bg-surface-hover'
                }`}
              >
                <div>
                  <div className="font-serif text-xs font-bold">{et.label}</div>
                  <div className="text-[10px] text-slate-400">{templates[et.type]?.fields.length || 0} fields</div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-surface-50 border border-surface-border text-slate-300 font-mono">
                  {et.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right: Template Schema Editor & Field Manager */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#090d12] space-y-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Schema Info */}
            <div className="p-4 rounded-xl bg-surface-100 border border-surface-border flex items-center justify-between">
              <div>
                <h2 className="font-serif text-lg font-bold text-slate-100">{currentTemplate.displayName} Template</h2>
                <p className="text-xs text-slate-400">{currentTemplate.description}</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    if (confirm(`Reset ${currentTemplate.displayName} schema back to official default fields?`)) {
                      resetTemplateToDefault(selectedType);
                    }
                  }}
                  className="px-3 py-1.5 bg-surface-50 hover:bg-surface-hover border border-surface-border text-slate-300 hover:text-amber-300 font-semibold text-xs rounded-lg flex items-center space-x-1.5 transition-colors"
                  title="Reset template back to official defaults"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                  <span>Reset Schema</span>
                </button>
                <button
                  onClick={() => handleDownloadTemplate(selectedType)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg flex items-center space-x-1.5 shadow-sm transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Get Sample CSV</span>
                </button>
              </div>
            </div>

            {/* Template Fields List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-sm font-bold text-slate-200">
                  Registered Template Fields ({currentTemplate.fields.length})
                </h3>
              </div>

              <div className="rounded-xl border border-surface-border overflow-hidden bg-surface-100">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-surface-50 border-b border-surface-border text-slate-400 font-semibold">
                      <th className="p-3">Field Key</th>
                      <th className="p-3">Display Label</th>
                      <th className="p-3">Data Type</th>
                      <th className="p-3">Required</th>
                      <th className="p-3">Example CSV Value</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-border">
                    {currentTemplate.fields.map((f) => (
                      <tr key={f.key} className="hover:bg-surface-hover/50 text-slate-200">
                        <td className="p-3 font-mono text-purple-300 font-bold">{f.key}</td>
                        <td className="p-3 font-medium">{f.label}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded bg-surface-50 text-[10px] font-mono text-slate-400 border border-surface-border">
                            {f.type}
                          </span>
                        </td>
                        <td className="p-3">
                          {f.required ? (
                            <span className="text-red-400 font-bold">Yes</span>
                          ) : (
                            <span className="text-slate-500">No</span>
                          )}
                        </td>
                        <td className="p-3 text-slate-400 font-mono text-[11px] truncate max-w-[200px]">
                          {f.exampleValue || '-'}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleRemoveField(f.key)}
                            className="text-slate-500 hover:text-red-400 p-1"
                            title="Remove field"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Add Custom Field Form */}
            <div className="p-4 rounded-xl bg-surface-100 border border-surface-border space-y-3">
              <h3 className="font-serif text-sm font-bold text-amber-400">Add Custom Field to Template</h3>
              <form onSubmit={handleAddField} className="grid grid-cols-4 gap-3 items-end">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Field Key (ID)</label>
                  <input
                    type="text"
                    required
                    value={newFieldKey}
                    onChange={(e) => setNewFieldKey(e.target.value)}
                    placeholder="e.g. lair_actions"
                    className="w-full bg-surface-50 border border-surface-border rounded-lg px-3 py-1.5 text-xs text-slate-100 font-mono focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Display Label</label>
                  <input
                    type="text"
                    required
                    value={newFieldLabel}
                    onChange={(e) => setNewFieldLabel(e.target.value)}
                    placeholder="e.g. Lair Actions"
                    className="w-full bg-surface-50 border border-surface-border rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Type</label>
                  <select
                    value={newFieldType}
                    onChange={(e) => setNewFieldType(e.target.value)}
                    className="w-full bg-surface-50 border border-surface-border rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:border-purple-500"
                  >
                    <option value="string">String</option>
                    <option value="number">Number</option>
                    <option value="boolean">Boolean (True/False)</option>
                    <option value="text">Text / Multiline</option>
                    <option value="array">List / Tags</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-lg shadow-sm flex items-center justify-center space-x-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Field</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk CSV Import Preview Modal */}
      {isImportModalOpen && importReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-[#121720] border border-surface-border rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-slate-100 flex items-center space-x-2">
                  <Upload className="w-5 h-5 text-purple-400" />
                  <span>Bulk Import Preview ({importReport.importedEntities.length} {templates[importTargetType].displayName})</span>
                </h3>
                <p className="text-xs text-slate-400">Review parsed CSV data before committing to the library.</p>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Target Library Selector & Auto-Detection Banner */}
            <div className="p-3 rounded-lg bg-surface-100/90 border border-surface-border flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-300">Import Destination:</span>
                <select
                  value={importTargetType}
                  onChange={(e) => handleTargetTypeChange(e.target.value as EntityType)}
                  className="bg-surface-50 border border-surface-border text-xs text-amber-400 font-bold rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500"
                >
                  <option value="item">📦 Items & Equipment</option>
                  <option value="monster">🐉 Monsters & NPCs</option>
                  <option value="spell">✨ Spells</option>
                  <option value="campaignNote">📜 Campaign Notes & Folders</option>
                  <option value="player">👥 Player Characters</option>
                  <option value="rollTable">🎲 Roll Tables</option>
                  <option value="encounter">⚔️ Encounters</option>
                </select>
              </div>

              {detectedInfo && (
                <div className="flex items-center space-x-1.5 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 px-2.5 py-1 rounded-md">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Auto-detected as <strong>{templates[detectedInfo.detectedType].displayName}</strong> ({detectedInfo.reason})</span>
                </div>
              )}
            </div>

            {/* Warnings / Errors */}
            {importReport.warnings.length > 0 && (
              <div className="p-3 rounded-lg bg-amber-950/50 border border-amber-800 text-xs text-amber-300 space-y-1">
                <div className="font-bold flex items-center space-x-1">
                  <AlertCircle className="w-4 h-4" />
                  <span>Import Warnings ({importReport.warnings.length})</span>
                </div>
                <div className="max-h-24 overflow-y-auto font-mono text-[11px]">
                  {importReport.warnings.map((w: string, idx: number) => (
                    <div key={idx}>{w}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Parsed Records Table Preview */}
            <div className="flex-1 overflow-y-auto rounded-lg border border-surface-border bg-surface-100">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-surface-50 border-b border-surface-border text-slate-400 font-semibold">
                    <th className="p-2.5">#</th>
                    <th className="p-2.5">Name</th>
                    <th className="p-2.5">Type / Category</th>
                    <th className="p-2.5">Details / Hierarchy</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border">
                  {importReport.importedEntities.map((item: any, idx: number) => (
                    <tr key={idx} className="hover:bg-surface-hover/50 text-slate-200">
                      <td className="p-2.5 font-mono text-slate-500">{idx + 1}</td>
                      <td className="p-2.5 font-serif font-bold text-amber-400 flex items-center space-x-1.5">
                        {item.isFolder ? <span className="text-amber-500 font-sans text-xs">📁</span> : null}
                        <span>{item.name}</span>
                      </td>
                      <td className="p-2.5 text-slate-300">
                        {item.category ? (
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${item.isFolder ? 'bg-amber-950 text-amber-300 border-amber-700' : 'bg-surface-50 text-slate-300 border-surface-border'}`}>
                            {item.isFolder ? 'Folder' : item.category}
                          </span>
                        ) : (
                          item.itemType || item.monsterType || item.school || item.characterClass || '-'
                        )}
                      </td>
                      <td className="p-2.5 font-mono text-slate-400 text-[11px]">
                        {item.type === 'campaignNote' || importTargetType === 'campaignNote' ? (
                          <div className="flex items-center space-x-2 text-[11px]">
                            {item.parentId ? (
                              <span className="text-purple-300">Parent: <strong>{item.parentId}</strong></span>
                            ) : (
                              <span className="text-slate-500">Root / Top-level</span>
                            )}
                            {item.campaignId && (
                              <span className="text-amber-400">· Campaign: <strong>{item.campaignId}</strong></span>
                            )}
                            {item.isPlayerVisible && (
                              <span className="text-emerald-400">· 👁️ Player Handout</span>
                            )}
                          </div>
                        ) : (
                          <>
                            {item.rarity ? <span className="text-purple-400 font-bold">{item.rarity} </span> : null}
                            {item.armorClass ? `AC ${item.armorClass} · ${item.hitPoints} HP ` : ''}
                            {item.damage ? `Dmg: ${item.damage} ` : ''}
                            {item.value ? `Value: ${item.value}` : ''}
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Safety notice & Actions */}
            <div className="pt-2 border-t border-surface-border flex items-center justify-between">
              <span className="text-[11px] text-slate-400 flex items-center space-x-1">
                <History className="w-3.5 h-3.5 text-amber-400" />
                <span>Automatic safety snapshot will be created before saving.</span>
              </span>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-surface-100 text-slate-300 text-xs font-semibold hover:bg-surface-hover"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmImport}
                  className="px-5 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md flex items-center space-x-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm & Import {importReport.importedEntities.length} {templates[importTargetType].displayName}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
