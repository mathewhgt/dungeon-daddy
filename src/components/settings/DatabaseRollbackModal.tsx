import React, { useState } from 'react';
import { 
  History, 
  RotateCcw, 
  Trash2, 
  Plus, 
  Download, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Layers, 
  X,
  HardDrive
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DatabaseSnapshot } from '../../services/storageService';

interface DatabaseRollbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DatabaseRollbackModal: React.FC<DatabaseRollbackModalProps> = ({ isOpen, onClose }) => {
  const { 
    snapshots, 
    rollbackToSnapshot, 
    createManualSnapshot, 
    deleteSnapshot, 
    exportDatabaseJson, 
    importDatabaseJson,
    showToast,
    db
  } = useApp();

  const [checkpointName, setCheckpointName] = useState('');
  const [isCreatingCheckpoint, setIsCreatingCheckpoint] = useState(false);
  const [confirmRollbackId, setConfirmRollbackId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCreateCheckpoint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkpointName.trim()) return;
    createManualSnapshot(checkpointName.trim());
    setCheckpointName('');
    setIsCreatingCheckpoint(false);
  };

  const handleExportBackup = () => {
    const jsonStr = exportDatabaseJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dungeon_daddy_backup_${Date.now()}.json`;
    link.click();
    showToast('Exported complete backup JSON successfully!');
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      importDatabaseJson(content);
    };
    reader.readAsText(file);
  };

  const formatTimeAgo = (isoDate: string) => {
    const diffMs = Date.now() - new Date(isoDate).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 minute ago';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    return new Date(isoDate).toLocaleString();
  };

  const getTriggerBadge = (trigger: DatabaseSnapshot['trigger']) => {
    switch (trigger) {
      case 'bulk_import':
        return <span className="px-2 py-0.5 rounded-full bg-purple-950/80 border border-purple-700 text-purple-300 font-bold text-[10px]">📦 Bulk Import</span>;
      case 'cleanup':
        return <span className="px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-700 text-amber-300 font-bold text-[10px]">🧹 Auto-Cleanup</span>;
      case 'restore':
        return <span className="px-2 py-0.5 rounded-full bg-blue-950/80 border border-blue-700 text-blue-300 font-bold text-[10px]">⬆️ JSON Restore</span>;
      case 'reset':
        return <span className="px-2 py-0.5 rounded-full bg-red-950/80 border border-red-700 text-red-300 font-bold text-[10px]">🔄 System Reset</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-700 text-emerald-300 font-bold text-[10px]">📸 Manual Checkpoint</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-[#10141d] border border-amber-900/40 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[88vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-surface-100/80 border-b border-surface-border flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-slate-100">
                Database Snapshots & Rollback History
              </h2>
              <p className="text-xs text-slate-400">
                Instant 1-click restore points created before bulk imports, deletions, and major changes.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-surface-50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar (Create Checkpoint + Backup / Restore) */}
        <div className="p-3 bg-surface-50/50 border-b border-surface-border flex items-center justify-between flex-wrap gap-2">
          {!isCreatingCheckpoint ? (
            <button
              onClick={() => setIsCreatingCheckpoint(true)}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-lg shadow-sm flex items-center space-x-1.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Checkpoint</span>
            </button>
          ) : (
            <form onSubmit={handleCreateCheckpoint} className="flex items-center space-x-2 flex-1 max-w-md">
              <input
                type="text"
                value={checkpointName}
                onChange={(e) => setCheckpointName(e.target.value)}
                placeholder="Checkpoint label (e.g. Before Session 4, Pre-Homebrew...)"
                autoFocus
                className="flex-1 bg-surface-100 border border-surface-border text-xs text-slate-100 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setIsCreatingCheckpoint(false)}
                className="px-2 py-1.5 text-slate-400 hover:text-white text-xs"
              >
                Cancel
              </button>
            </form>
          )}

          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportBackup}
              className="px-2.5 py-1.5 bg-surface-100 hover:bg-surface-hover border border-surface-border text-slate-300 text-xs font-semibold rounded-lg flex items-center space-x-1 transition-colors"
              title="Download JSON file backup to local disk"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>Export JSON</span>
            </button>

            <label className="px-2.5 py-1.5 bg-surface-100 hover:bg-surface-hover border border-surface-border text-slate-300 text-xs font-semibold rounded-lg flex items-center space-x-1 cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5 text-purple-400" />
              <span>Import JSON</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Current Database Live Summary */}
        <div className="px-4 py-2 bg-[#090d12] border-b border-surface-border flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <div className="flex items-center space-x-1.5 text-slate-300">
            <HardDrive className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-bold">Active Live Database:</span>
          </div>
          <div className="flex items-center space-x-3">
            <span>🐉 {db.monsters.length} Monsters</span>
            <span>🛡️ {db.items.length} Items</span>
            <span>✨ {db.spells.length} Spells</span>
            <span>👥 {db.players.length} Heroes</span>
            <span>🗺️ {db.maps.length} Maps</span>
          </div>
        </div>

        {/* Snapshots List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {snapshots.length === 0 ? (
            <div className="text-center py-12 text-slate-500 space-y-2">
              <History className="w-8 h-8 mx-auto text-slate-600 opacity-50" />
              <div className="text-xs font-semibold">No rollback snapshots saved yet.</div>
              <p className="text-[11px] text-slate-600 max-w-sm mx-auto">
                Snapshots will be saved automatically whenever you perform bulk imports or major changes.
              </p>
            </div>
          ) : (
            snapshots.map((snap) => {
              const isConfirming = confirmRollbackId === snap.id;

              return (
                <div
                  key={snap.id}
                  className={`p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                    isConfirming
                      ? 'bg-amber-950/40 border-amber-500/80 shadow-lg shadow-amber-500/10'
                      : 'bg-surface-100/70 border-surface-border hover:border-slate-600'
                  }`}
                >
                  <div className="space-y-1.5 flex-1 pr-4">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      {getTriggerBadge(snap.trigger)}
                      <span className="font-serif font-bold text-slate-100 text-sm">
                        {snap.description}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3 text-[11px] text-slate-400 font-mono flex-wrap">
                      <span className="flex items-center space-x-1 text-slate-500">
                        <Clock className="w-3 h-3" />
                        <span>{formatTimeAgo(snap.timestamp)}</span>
                      </span>
                      <span>·</span>
                      <span className="text-amber-400/90">{snap.entityCounts.monsters} Monsters</span>
                      <span>·</span>
                      <span className="text-emerald-400/90">{snap.entityCounts.items} Items</span>
                      <span>·</span>
                      <span className="text-indigo-400/90">{snap.entityCounts.spells} Spells</span>
                      <span>·</span>
                      <span className="text-blue-400/90">{snap.entityCounts.players} Heroes</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    {isConfirming ? (
                      <div className="flex items-center space-x-1.5 animate-fadeIn">
                        <button
                          onClick={() => {
                            rollbackToSnapshot(snap.id);
                            setConfirmRollbackId(null);
                            onClose();
                          }}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-lg shadow-md flex items-center space-x-1"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Confirm Rollback</span>
                        </button>
                        <button
                          onClick={() => setConfirmRollbackId(null)}
                          className="px-2.5 py-1.5 bg-surface-50 hover:bg-surface-hover text-slate-300 text-xs rounded-lg border border-surface-border"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmRollbackId(snap.id)}
                        className="px-3 py-1.5 bg-surface-50 hover:bg-amber-600 hover:text-slate-950 text-slate-200 border border-surface-border text-xs font-bold rounded-lg transition-colors flex items-center space-x-1.5 shadow-xs"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                        <span>Rollback</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        if (confirm(`Delete snapshot "${snap.description}"?`)) {
                          deleteSnapshot(snap.id);
                        }
                      }}
                      className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-surface-50 transition-colors"
                      title="Delete this snapshot"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
