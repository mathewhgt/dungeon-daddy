import React, { useState } from 'react';
import { 
  X, 
  Save, 
  Plus, 
  Trash2, 
  Copy, 
  Upload, 
  Download, 
  Dices, 
  Columns, 
  ArrowUpDown, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import Papa from 'papaparse';
import { RollTableEntity, RollTableColumn, RollTableItem } from '../../types/rollTable';

interface RollTableEditorModalProps {
  initialData?: RollTableEntity | null;
  onClose: () => void;
  onSave: (table: RollTableEntity) => void;
}

export const RollTableEditorModal: React.FC<RollTableEditorModalProps> = ({
  initialData,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState(initialData?.name || '');
  const [diceFormula, setDiceFormula] = useState(initialData?.diceFormula || '1d20');
  const [description, setDescription] = useState(initialData?.description || '');
  const [theme, setTheme] = useState(initialData?.theme || '');
  const [category, setCategory] = useState(initialData?.category || 'Loot');

  // Columns definition
  const [columns, setColumns] = useState<RollTableColumn[]>(() => {
    if (initialData?.columns && initialData.columns.length > 0) {
      return [...initialData.columns];
    }
    // Default columns for rich tables if none
    return [
      { key: 'category', label: 'Category', type: 'badge' },
      { key: 'type', label: 'Type', type: 'badge' },
      { key: 'theme', label: 'Theme', type: 'badge' },
      { key: 'value', label: 'Value', type: 'badge' },
      { key: 'rarity', label: 'Rarity', type: 'badge' },
      { key: 'description', label: 'Description', type: 'text' },
    ];
  });

  // Rows definition
  const [items, setItems] = useState<RollTableItem[]>(() => {
    if (initialData?.items && initialData.items.length > 0) {
      return JSON.parse(JSON.stringify(initialData.items));
    }
    // Default 4 rows
    return [
      { id: 'row-1', rangeMin: 1, rangeMax: 5, result: 'Minor Trinket', values: { category: 'Trinket', type: 'area loot', theme: 'General', value: '5 gp', rarity: 'Common', description: 'A polished lucky stone' } },
      { id: 'row-2', rangeMin: 6, rangeMax: 10, result: 'Silver Chalice', values: { category: 'Art Object', type: 'area loot', theme: 'General', value: '25 gp', rarity: 'Common', description: 'An engraved silver cup' } },
      { id: 'row-3', rangeMin: 11, rangeMax: 15, result: 'Healing Potion', values: { category: 'Potion', type: 'area loot', theme: 'General', value: '50 gp', rarity: 'Common', description: 'Restores 2d4+2 HP' } },
      { id: 'row-4', rangeMin: 16, rangeMax: 20, result: 'Pouch of Gemstones', values: { category: 'Gemstone', type: 'area loot', theme: 'General', value: '100 gp', rarity: 'Uncommon', description: 'Assorted polished quartz and agates' } },
    ];
  });

  // State for adding a new column
  const [newColLabel, setNewColLabel] = useState('');
  const [newColType, setNewColType] = useState<'text' | 'badge' | 'number'>('text');
  const [isAddingCol, setIsAddingCol] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Column management
  const handleAddColumn = () => {
    if (!newColLabel.trim()) return;
    const key = newColLabel.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
    if (columns.some((c) => c.key === key)) {
      setError(`A column with key "${key}" already exists.`);
      return;
    }
    setColumns((prev) => [...prev, { key, label: newColLabel.trim(), type: newColType }]);
    setNewColLabel('');
    setIsAddingCol(false);
    setError(null);
  };

  const handleDeleteColumn = (colKey: string) => {
    setColumns((prev) => prev.filter((c) => c.key !== colKey));
    // Also clean up row values
    setItems((prev) =>
      prev.map((row) => {
        const nextVals = { ...(row.values || {}) };
        delete nextVals[colKey];
        return { ...row, values: nextVals };
      })
    );
  };

  // Row management
  const handleAddRow = () => {
    const lastRow = items[items.length - 1];
    const nextMin = lastRow ? lastRow.rangeMax + 1 : 1;
    const nextMax = nextMin;

    const newRow: RollTableItem = {
      id: `row-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      rangeMin: nextMin,
      rangeMax: nextMax,
      result: `New Result ${items.length + 1}`,
      values: {},
    };
    setItems((prev) => [...prev, newRow]);
  };

  const handleDuplicateRow = (index: number) => {
    const target = items[index];
    const newRow: RollTableItem = {
      ...JSON.parse(JSON.stringify(target)),
      id: `row-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      rangeMin: target.rangeMax + 1,
      rangeMax: target.rangeMax + 1,
    };
    const next = [...items];
    next.splice(index + 1, 0, newRow);
    setItems(next);
  };

  const handleDeleteRow = (index: number) => {
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleRowChange = (index: number, field: 'rangeMin' | 'rangeMax' | 'result', val: any) => {
    setItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: val };
      return next;
    });
  };

  const handleCellChange = (rowIndex: number, colKey: string, val: string) => {
    setItems((prev) => {
      const next = [...prev];
      const row = next[rowIndex];
      const nextVals = { ...(row.values || {}), [colKey]: val };
      next[rowIndex] = { ...row, values: nextVals };
      return next;
    });
  };

  // Auto distribute dice ranges
  const handleAutoBalanceRanges = () => {
    if (items.length === 0) return;
    
    // Parse max from dice formula (e.g. 1d100 -> 100, 1d20 -> 20)
    const match = diceFormula.match(/d(\d+)/i);
    const maxDie = match ? parseInt(match[1], 10) : items.length;
    
    const step = Math.max(1, Math.floor(maxDie / items.length));
    
    setItems((prev) => {
      let currentMin = 1;
      return prev.map((row, idx) => {
        let currentMax = idx === prev.length - 1 ? maxDie : currentMin + step - 1;
        if (currentMax < currentMin) currentMax = currentMin;
        const updated = {
          ...row,
          rangeMin: currentMin,
          rangeMax: currentMax,
        };
        currentMin = currentMax + 1;
        return updated;
      });
    });
  };

  // CSV Import
  const handleCsvImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (!results.data || results.data.length === 0) {
          setError('CSV file is empty or could not be parsed.');
          return;
        }

        const headers = results.meta.fields || Object.keys(results.data[0] as any);
        // Identify Result column or name column
        const nameHeader = headers.find((h) => ['name', 'result', 'title', 'item'].includes(h.toLowerCase())) || headers[0];
        const otherHeaders = headers.filter((h) => h !== nameHeader && !['id', 'rangemin', 'rangemax', 'range'].includes(h.toLowerCase()));

        // Create columns
        const newCols: RollTableColumn[] = otherHeaders.map((h) => ({
          key: h.trim().toLowerCase().replace(/[^a-z0-9]/g, '_'),
          label: h.trim(),
          type: ['category', 'type', 'theme', 'rarity', 'condition', 'value'].includes(h.toLowerCase()) ? 'badge' : 'text',
        }));

        // Create rows
        const newRows: RollTableItem[] = results.data.map((row: any, idx) => {
          const values: Record<string, any> = {};
          for (const h of otherHeaders) {
            const k = h.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
            values[k] = row[h] || '';
          }
          return {
            id: `import-row-${idx + 1}`,
            rangeMin: idx + 1,
            rangeMax: idx + 1,
            result: row[nameHeader] || `Item ${idx + 1}`,
            values,
          };
        });

        setColumns(newCols);
        setItems(newRows);
        setDiceFormula(`1d${newRows.length}`);
        if (!name) setName(file.name.replace(/\.[^/.]+$/, ''));
        setError(null);
      },
      error: (err) => {
        setError(`Failed to parse CSV: ${err.message}`);
      }
    });
  };

  // CSV Export
  const handleCsvExport = () => {
    const exportData = items.map((row) => {
      const rowObj: Record<string, any> = {
        Range: row.rangeMin === row.rangeMax ? `${row.rangeMin}` : `${row.rangeMin}-${row.rangeMax}`,
        Result: row.result,
      };
      for (const col of columns) {
        rowObj[col.label] = row.values?.[col.key] || '';
      }
      return rowObj;
    });

    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${name || 'roll_table'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Table Name is required.');
      return;
    }
    if (!diceFormula.trim()) {
      setError('Dice Formula is required.');
      return;
    }
    if (items.length === 0) {
      setError('Table must have at least one row.');
      return;
    }

    const payload: RollTableEntity = {
      id: initialData?.id || `table-${Date.now()}`,
      type: 'rollTable',
      name: name.trim(),
      diceFormula: diceFormula.trim(),
      description: description.trim() || undefined,
      theme: theme.trim() || undefined,
      category: category.trim() || undefined,
      columns,
      items,
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#10141d] border border-surface-border rounded-xl shadow-2xl w-full max-w-6xl max-h-[92vh] flex flex-col animate-scaleUp select-none">
        {/* Header */}
        <div className="h-16 border-b border-surface-border px-6 flex items-center justify-between bg-surface-100/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <Dices className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-slate-100 text-lg">
                {initialData ? `Edit Roll Table: ${initialData.name}` : 'Create Multi-Column Roll Table'}
              </h2>
              <p className="text-xs text-slate-400">
                Design custom random tables with multiple columns, dice ranges, and metadata for loot, encounters, or lore.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <label className="px-3 py-1.5 rounded-lg bg-surface-50 hover:bg-surface-hover text-slate-300 text-xs font-semibold border border-surface-border cursor-pointer flex items-center space-x-1.5 transition-colors">
              <Upload className="w-3.5 h-3.5 text-blue-400" />
              <span>Import CSV</span>
              <input type="file" accept=".csv" onChange={handleCsvImport} className="hidden" />
            </label>

            <button
              type="button"
              onClick={handleCsvExport}
              className="px-3 py-1.5 rounded-lg bg-surface-50 hover:bg-surface-hover text-slate-300 text-xs font-semibold border border-surface-border flex items-center space-x-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-surface-hover transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-red-950/80 border border-red-800 text-xs text-red-300 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-xl bg-surface-100/40 border border-surface-border">
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-slate-300 flex justify-between">
                <span>Table Name <span className="text-red-400">*</span></span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ancient Crypt Relics & Curios"
                className="w-full bg-[#0b0e14] border border-surface-border rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 flex justify-between">
                <span>Dice Formula <span className="text-red-400">*</span></span>
              </label>
              <div className="flex space-x-1">
                <input
                  type="text"
                  value={diceFormula}
                  onChange={(e) => setDiceFormula(e.target.value)}
                  placeholder="1d20, 1d100, 1d6"
                  className="w-full bg-[#0b0e14] border border-surface-border rounded-lg p-2.5 text-xs font-mono text-purple-300 focus:outline-none focus:border-purple-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setDiceFormula(`1d${items.length}`)}
                  title="Set dice formula to match total row count"
                  className="px-2.5 rounded-lg bg-surface-50 border border-surface-border text-[10px] text-slate-400 hover:text-white"
                >
                  1d{items.length}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Theme / Location</label>
              <input
                type="text"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="e.g. Tomb / Crypt, Ancient Temple"
                className="w-full bg-[#0b0e14] border border-surface-border rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="md:col-span-4 space-y-1">
              <label className="text-xs font-semibold text-slate-300">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary of when and how this table is used..."
                className="w-full bg-[#0b0e14] border border-surface-border rounded-lg p-2.5 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          {/* Columns Config Header */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Columns className="w-4 h-4 text-purple-400" />
                <h3 className="font-serif text-sm font-bold text-slate-200">Table Columns</h3>
                <span className="text-[11px] text-slate-500">({columns.length} custom columns)</span>
              </div>

              {!isAddingCol ? (
                <button
                  type="button"
                  onClick={() => setIsAddingCol(true)}
                  className="px-3 py-1.5 rounded-lg bg-purple-950/60 hover:bg-purple-900 border border-purple-700 text-purple-300 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Column</span>
                </button>
              ) : (
                <div className="flex items-center space-x-2 bg-surface-100 p-1.5 rounded-lg border border-surface-border animate-fadeIn">
                  <input
                    type="text"
                    value={newColLabel}
                    onChange={(e) => setNewColLabel(e.target.value)}
                    placeholder="Column Name (e.g. Weight)"
                    className="bg-[#0b0e14] border border-surface-border rounded px-2 py-1 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
                    autoFocus
                  />
                  <select
                    value={newColType}
                    onChange={(e: any) => setNewColType(e.target.value)}
                    className="bg-[#0b0e14] border border-surface-border rounded px-2 py-1 text-xs text-slate-300"
                  >
                    <option value="text">Text</option>
                    <option value="badge">Badge</option>
                    <option value="number">Number</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleAddColumn}
                    className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-bold"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingCol(false)}
                    className="p-1 text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Column Badges */}
            <div className="flex items-center flex-wrap gap-2 p-3 rounded-lg bg-surface-100/30 border border-surface-border">
              <div className="px-2.5 py-1 rounded bg-purple-950 border border-purple-800 text-purple-300 text-xs font-mono">
                [Range (Min-Max)]
              </div>
              <div className="px-2.5 py-1 rounded bg-amber-950 border border-amber-800 text-amber-300 text-xs font-mono font-bold">
                [Result / Item Name]
              </div>
              {columns.map((col) => (
                <div
                  key={col.key}
                  className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-surface-100 border border-surface-border text-slate-200 text-xs font-mono group hover:border-slate-500 transition-colors"
                >
                  <span>{col.label}</span>
                  <span className="text-[10px] text-slate-500">({col.type || 'text'})</span>
                  <button
                    type="button"
                    onClick={() => handleDeleteColumn(col.key)}
                    className="text-slate-500 hover:text-red-400 p-0.5"
                    title="Remove column"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Rows Data Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <h3 className="font-serif text-sm font-bold text-slate-200">Table Rows ({items.length})</h3>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleAutoBalanceRanges}
                  title="Evenly distribute roll ranges 1 to N based on dice formula"
                  className="px-3 py-1.5 rounded-lg bg-surface-100 hover:bg-surface-hover text-slate-300 text-xs font-semibold border border-surface-border flex items-center space-x-1.5 transition-colors"
                >
                  <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" />
                  <span>Auto-Balance Ranges</span>
                </button>

                <button
                  type="button"
                  onClick={handleAddRow}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-bold flex items-center space-x-1.5 shadow transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Row</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-surface-border bg-[#0b0e14]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-surface-100/80 border-b border-surface-border text-slate-400 font-serif">
                    <th className="p-2.5 w-24 text-center">Range</th>
                    <th className="p-2.5 min-w-[200px]">Result / Primary Name</th>
                    {columns.map((col) => (
                      <th key={col.key} className="p-2.5 min-w-[140px]">
                        {col.label}
                      </th>
                    ))}
                    <th className="p-2.5 w-20 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border/60">
                  {items.map((row, idx) => (
                    <tr key={row.id || idx} className="hover:bg-surface-100/30 transition-colors">
                      {/* Range Min - Max */}
                      <td className="p-2">
                        <div className="flex items-center space-x-1 justify-center">
                          <input
                            type="number"
                            value={row.rangeMin}
                            onChange={(e) => handleRowChange(idx, 'rangeMin', parseInt(e.target.value, 10) || 1)}
                            className="w-10 bg-[#121720] border border-surface-border rounded p-1 text-center font-mono text-purple-300 focus:outline-none focus:border-purple-500"
                          />
                          <span className="text-slate-600">-</span>
                          <input
                            type="number"
                            value={row.rangeMax}
                            onChange={(e) => handleRowChange(idx, 'rangeMax', parseInt(e.target.value, 10) || 1)}
                            className="w-10 bg-[#121720] border border-surface-border rounded p-1 text-center font-mono text-purple-300 focus:outline-none focus:border-purple-500"
                          />
                        </div>
                      </td>

                      {/* Result */}
                      <td className="p-2">
                        <input
                          type="text"
                          value={row.result}
                          onChange={(e) => handleRowChange(idx, 'result', e.target.value)}
                          className="w-full bg-[#121720] border border-surface-border rounded p-1.5 text-slate-100 font-semibold focus:outline-none focus:border-amber-500"
                          placeholder="Outcome text or item name..."
                        />
                      </td>

                      {/* Custom Columns */}
                      {columns.map((col) => (
                        <td key={col.key} className="p-2">
                          <input
                            type="text"
                            value={row.values?.[col.key] ?? ''}
                            onChange={(e) => handleCellChange(idx, col.key, e.target.value)}
                            className="w-full bg-[#121720] border border-surface-border rounded p-1.5 text-slate-300 focus:outline-none focus:border-purple-500 text-xs"
                            placeholder={col.label}
                          />
                        </td>
                      ))}

                      {/* Row Actions */}
                      <td className="p-2">
                        <div className="flex items-center space-x-1 justify-center">
                          <button
                            type="button"
                            onClick={() => handleDuplicateRow(idx)}
                            className="p-1 text-slate-400 hover:text-white rounded hover:bg-surface-hover"
                            title="Duplicate row"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteRow(idx)}
                            className="p-1 text-slate-500 hover:text-red-400 rounded hover:bg-surface-hover"
                            title="Delete row"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer Save / Cancel */}
          <div className="pt-4 border-t border-surface-border flex items-center justify-between">
            <div className="text-xs text-slate-500 flex items-center space-x-1">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Rows can be rolled in Compendium and dynamically referenced in Loot Generation.</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-surface-100 hover:bg-surface-hover text-slate-300 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-bold text-xs shadow-lg transition-all flex items-center space-x-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Save Roll Table</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
