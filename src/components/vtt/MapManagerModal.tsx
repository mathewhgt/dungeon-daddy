import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Upload, 
  Map as MapIcon, 
  Trash2, 
  Check, 
  Image as ImageIcon, 
  Download, 
  Copy, 
  FileUp 
} from 'lucide-react';
import { BattleMapEntity } from '../../types/map';
import { useApp } from '../../context/AppContext';

interface MapManagerModalProps {
  onClose: () => void;
}

export const MapManagerModal: React.FC<MapManagerModalProps> = ({ onClose }) => {
  const { 
    db, 
    activeMapId, 
    setActiveMapId, 
    saveMap, 
    deleteMap, 
    activeCampaignId, 
    showToast 
  } = useApp();
  const maps = db.maps || [];

  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [mapName, setMapName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [mapWidth, setMapWidth] = useState(1600);
  const [mapHeight, setMapHeight] = useState(1200);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setImageUrl(base64);

      // Auto detect image dimensions
      const img = new Image();
      img.onload = () => {
        setMapWidth(img.width || 1600);
        setMapHeight(img.height || 1200);
      };
      img.src = base64;
    };
    reader.readAsDataURL(file);
  };

  const handleCreateMap = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mapName.trim()) return;

    const newMap: BattleMapEntity = {
      id: `map-${Date.now()}`,
      type: 'map',
      campaignId: activeCampaignId || 'campaign-phandalin',
      name: mapName.trim(),
      imageUrl,
      width: mapWidth,
      height: mapHeight,
      grid: {
        enabled: true,
        type: 'square',
        cellSize: 50,
        offsetX: 0,
        offsetY: 0,
        color: '#ffffff',
        opacity: 0.2,
        feetPerCell: 5,
        snapToGrid: true,
      },
      lighting: {
        ambientLight: 'dark',
        dynamicLosEnabled: true,
        fogOfWarEnabled: true,
        gmVision: false,
      },
      walls: [],
      tokens: [],
      fogOfWar: {
        enabled: false,
        opacity: 0.85,
        revealedAreas: [],
      },
      drawings: [],
      pins: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveMap(newMap);
    setActiveMapId(newMap.id);
    onClose();
  };

  const handleExportMapJson = (m: BattleMapEntity) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(m, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${m.name.toLowerCase().replace(/\s+/g, '_')}_map_config.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast(`Exported "${m.name}" configuration`);
  };

  const handleImportMapJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed.name || !parsed.width || !parsed.height) {
          alert('Invalid map configuration JSON file.');
          return;
        }

        const importedMap: BattleMapEntity = {
          ...parsed,
          id: `map-${Date.now()}`,
          type: 'map',
          campaignId: activeCampaignId || parsed.campaignId || 'campaign-phandalin',
          updatedAt: new Date().toISOString(),
        };

        saveMap(importedMap);
        setActiveMapId(importedMap.id);
        showToast(`Imported map: ${importedMap.name}`);
        onClose();
      } catch (err) {
        alert('Failed to parse map JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const handleDuplicateMap = (m: BattleMapEntity) => {
    const duplicated: BattleMapEntity = {
      ...m,
      id: `map-${Date.now()}`,
      name: `${m.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveMap(duplicated);
    setActiveMapId(duplicated.id);
    showToast(`Duplicated "${m.name}"`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#121720] border border-surface-border rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col animate-scaleUp">
        {/* Header */}
        <div className="p-4 border-b border-surface-border flex items-center justify-between bg-surface-100/50">
          <div>
            <h3 className="font-serif text-base font-bold text-slate-100 flex items-center space-x-2">
              <MapIcon className="w-4 h-4 text-amber-400" />
              <span>Battle Maps Library & Storage</span>
            </h3>
            <p className="text-[11px] text-slate-400">Manage, export, import, or create tactical battle maps.</p>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 max-h-[70vh]">
          {!isCreatingNew ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Saved Battle Maps ({maps.length})
                </span>

                <div className="flex items-center space-x-2">
                  {/* Import Map JSON Config */}
                  <label className="px-3 py-1 bg-surface-50 hover:bg-surface-hover text-slate-200 border border-surface-border rounded-lg text-xs font-semibold flex items-center space-x-1 cursor-pointer transition-colors">
                    <FileUp className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Import JSON</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportMapJson}
                      className="hidden"
                    />
                  </label>

                  <button
                    onClick={() => setIsCreatingNew(true)}
                    className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-lg flex items-center space-x-1 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New Map</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2.5">
                {maps.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => {
                      setActiveMapId(m.id);
                      onClose();
                    }}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      activeMapId === m.id
                        ? 'bg-amber-500/15 border-amber-500/60 shadow-md ring-1 ring-amber-500/30'
                        : 'bg-surface-100 hover:bg-surface-hover border-surface-border'
                    }`}
                  >
                    <div className="flex items-center space-x-3.5">
                      <div className="w-14 h-14 rounded-lg bg-surface-50 border border-surface-border overflow-hidden flex items-center justify-center text-slate-500 shrink-0">
                        {m.imageUrl ? (
                          <img src={m.imageUrl} alt={m.name} className="w-full h-full object-cover" />
                        ) : (
                          <MapIcon className="w-6 h-6 text-amber-500/70" />
                        )}
                      </div>
                      <div>
                        <div className="font-serif font-bold text-sm text-slate-100 flex items-center space-x-2">
                          <span>{m.name}</span>
                          {activeMapId === m.id && (
                            <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-500 text-slate-950 font-bold">
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {m.walls?.length || 0} walls · {m.tokens?.length || 0} tokens · {m.width}x{m.height}px
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleExportMapJson(m)}
                        className="p-1.5 text-slate-400 hover:text-amber-400 rounded hover:bg-surface-50 transition-colors"
                        title="Export map configuration as JSON"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDuplicateMap(m)}
                        className="p-1.5 text-slate-400 hover:text-blue-400 rounded hover:bg-surface-50 transition-colors"
                        title="Duplicate map"
                      >
                        <Copy className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Delete battle map "${m.name}"?`)) {
                            deleteMap(m.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-400 rounded hover:bg-surface-50 transition-colors"
                        title="Delete map"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Create New Map Form */
            <form onSubmit={handleCreateMap} className="space-y-4 select-text">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Map Title *</span>
                  <span className="text-[10px] text-slate-500 font-normal">Required</span>
                </label>
                <input
                  type="text"
                  required
                  value={mapName}
                  onChange={(e) => setMapName(e.target.value)}
                  placeholder="e.g. Wave Echo Cave - Central Forge"
                  className="w-full bg-surface-50 border border-surface-border rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500 select-text cursor-text"
                />
              </div>

              {/* Image Upload / URL */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1">
                  <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                  <span>Map Artwork Image (Upload or Paste URL)</span>
                </label>

                {imageUrl ? (
                  <div className="relative rounded-xl border border-surface-border bg-surface-50 p-2 flex items-center space-x-3">
                    <div className="w-16 h-16 rounded-lg bg-surface-100 overflow-hidden shrink-0 border border-surface-border">
                      <img src={imageUrl} alt="Map preview" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-slate-200 truncate">Image Loaded</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        Auto-detected: {mapWidth} × {mapHeight} px
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="px-2.5 py-1 text-xs text-red-400 hover:text-red-300 bg-red-950/40 hover:bg-red-950/80 border border-red-800/60 rounded-lg transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center p-4 rounded-lg border-2 border-dashed border-surface-border hover:border-amber-500/60 bg-surface-50 hover:bg-surface-hover cursor-pointer text-center transition-colors">
                    <Upload className="w-6 h-6 text-slate-400 mb-1" />
                    <span className="text-xs font-semibold text-slate-300">Click to Upload Map Image</span>
                    <span className="text-[10px] text-slate-500 mt-0.5">PNG, JPG, WebP (Saved offline)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                )}

                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => {
                    const url = e.target.value;
                    setImageUrl(url);
                    if (url) {
                      const img = new Image();
                      img.onload = () => {
                        setMapWidth(img.width || 1600);
                        setMapHeight(img.height || 1200);
                      };
                      img.src = url;
                    }
                  }}
                  placeholder="Or paste direct image URL (optional)"
                  className="w-full bg-surface-50 border border-surface-border rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-mono text-[11px] select-text cursor-text"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 font-semibold">Width (px)</label>
                  <input
                    type="number"
                    value={mapWidth}
                    onChange={(e) => setMapWidth(parseInt(e.target.value, 10) || 1000)}
                    className="w-full bg-surface-50 border border-surface-border rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500 select-text cursor-text"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400 font-semibold">Height (px)</label>
                  <input
                    type="number"
                    value={mapHeight}
                    onChange={(e) => setMapHeight(parseInt(e.target.value, 10) || 1000)}
                    className="w-full bg-surface-50 border border-surface-border rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500 select-text cursor-text"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-surface-border flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-surface-50 text-slate-300 text-xs font-semibold hover:bg-surface-hover"
                >
                  Back to Maps
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs shadow-md"
                >
                  Create Map
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
