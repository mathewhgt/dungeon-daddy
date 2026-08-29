import React, { useState, useEffect } from 'react';
import { Minus, Square, Copy, X, Sparkles, Swords, Compass, Tv, Cast, Cloud, RefreshCw } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ExternalDisplayModal } from '../player/ExternalDisplayModal';

export const TitleBar: React.FC = () => {
  const { 
    db, 
    activeCampaignId, 
    combatState, 
    toggleRadialMenu, 
    setIsDiceDrawerOpen,
    isExternalDisplayModalOpen,
    setIsExternalDisplayModalOpen,
    cloudSyncConfig,
    isSyncing,
    hasUnsavedCloudChanges,
    syncNow
  } = useApp();
  
  const [isMaximized, setIsMaximized] = useState(false);
  const [isPlayerWindowOpen, setIsPlayerWindowOpen] = useState(false);
  const [updateDownloaded, setUpdateDownloaded] = useState<string | null>(null);

  const activeCampaign = db.campaigns.find((c) => c.id === activeCampaignId);

  useEffect(() => {
    if ((window as any).electronAPI?.isMaximized) {
      (window as any).electronAPI.isMaximized().then(setIsMaximized);
    }

    if ((window as any).electronAPI?.playerDisplay) {
      const api = (window as any).electronAPI.playerDisplay;
      api.isPlayerWindowOpen().then(setIsPlayerWindowOpen).catch(() => {});
      const unOpened = api.onWindowOpened(() => setIsPlayerWindowOpen(true));
      const unClosed = api.onWindowClosed(() => setIsPlayerWindowOpen(false));
      return () => {
        unOpened?.();
        unClosed?.();
      };
    }
  }, []);

  useEffect(() => {
    if ((window as any).electronAPI?.updater?.onStatusChange) {
      const cleanup = (window as any).electronAPI.updater.onStatusChange((status: any) => {
        if (status?.status === 'downloaded') {
          setUpdateDownloaded(status.version || 'New Version');
        }
      });
      return () => cleanup?.();
    }
  }, []);

  const handleRestartForUpdate = () => {
    (window as any).electronAPI?.updater?.quitAndInstall();
  };

  const handleMinimize = () => {
    (window as any).electronAPI?.minimize();
  };

  const handleMaximize = () => {
    (window as any).electronAPI?.maximize();
    setIsMaximized(!isMaximized);
  };

  const handleClose = () => {
    (window as any).electronAPI?.close();
  };

  return (
    <>
      <header className="h-10 bg-[#0d1117] border-b border-surface-border flex items-center justify-between px-3 select-none z-50 shrink-0 [-webkit-app-region:drag]">
        {/* Brand & Campaign */}
        <div className="flex items-center space-x-3 [-webkit-app-region:no-drag]">
          <div className="flex items-center space-x-2 font-serif font-bold text-amber-500 tracking-wider">
            <div className="w-5 h-5 rounded bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center text-slate-950 text-xs font-black shadow-md shadow-amber-500/20">
              DD
            </div>
            <span className="text-slate-100 text-sm">DUNGEON <span className="text-amber-500 font-black">DADDY</span></span>
          </div>

          {activeCampaign && (
            <div className="flex items-center space-x-2 px-2 py-0.5 rounded-full bg-surface-50/70 border border-surface-border text-xs text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span className="font-medium truncate max-w-[200px]">{activeCampaign.name}</span>
            </div>
          )}

          {combatState.isActive && (
            <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-red-950/80 border border-red-800 text-xs text-red-300 animate-pulse font-medium">
              <Swords className="w-3.5 h-3.5 text-red-400" />
              <span>Combat (Round {combatState.round})</span>
            </div>
          )}
        </div>

        {/* Center Quick Navigation & Display Launcher */}
        <div className="flex items-center space-x-2 [-webkit-app-region:no-drag]">
          {/* External Display / Chromecast Launcher */}
          <button
            onClick={() => setIsExternalDisplayModalOpen(true)}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all ${
              isPlayerWindowOpen
                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-950/40'
                : 'bg-surface-50 hover:bg-surface-hover border-surface-border text-slate-300 hover:text-white'
            }`}
            title="Configure External Player Display (TV / Chromecast / Dual Monitor)"
          >
            <Tv className={`w-3.5 h-3.5 ${isPlayerWindowOpen ? 'text-emerald-400 animate-pulse' : 'text-sky-400'}`} />
            <span>Player Screen</span>
            <span className={`w-1.5 h-1.5 rounded-full ${isPlayerWindowOpen ? 'bg-emerald-400' : 'bg-slate-500'}`} />
          </button>

          <button
            onClick={toggleRadialMenu}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 hover:border-amber-500/50 transition-all text-xs font-medium group"
            title="Open Radial Navigation Menu (Ctrl + Space)"
          >
            <Compass className="w-3.5 h-3.5 group-hover:rotate-45 transition-transform duration-300" />
            <span>Radial Menu</span>
            <kbd className="px-1.5 py-0.2 bg-surface-100 text-[10px] text-slate-400 rounded border border-surface-border">Ctrl+Space</kbd>
          </button>

          <button
            onClick={() => setIsDiceDrawerOpen(true)}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-surface-50 hover:bg-surface-hover border border-surface-border text-xs text-slate-300 transition-colors"
            title="Open Dice Roller (Ctrl + D)"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Dice Tray</span>
            <kbd className="px-1.5 py-0.2 bg-surface-100 text-[10px] text-slate-400 rounded border border-surface-border">Ctrl+D</kbd>
          </button>

          {/* Cloud Sync Quick Action */}
          {cloudSyncConfig.folderPath && cloudSyncConfig.autoSync && (
            <button
              onClick={syncNow}
              disabled={isSyncing}
              className={`flex items-center space-x-1.5 px-2 py-1 rounded text-xs transition-all ${
                hasUnsavedCloudChanges 
                  ? 'bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-300' 
                  : 'bg-surface-50 hover:bg-surface-hover border border-surface-border text-slate-300'
              }`}
              title={
                hasUnsavedCloudChanges 
                  ? 'Unsaved changes • Auto-syncs every 5m or on close (Click to sync now)' 
                  : `Synced to Drive (${cloudSyncConfig.lastSynced ? new Date(cloudSyncConfig.lastSynced).toLocaleTimeString() : 'Up to date'}) • Click to sync now`
              }
            >
              {isSyncing ? (
                <RefreshCw className="w-3.5 h-3.5 text-blue-400 animate-spin" />
              ) : (
                <Cloud className={`w-3.5 h-3.5 ${hasUnsavedCloudChanges ? 'text-amber-400' : 'text-emerald-400'}`} />
              )}
              <span>{isSyncing ? 'Syncing...' : hasUnsavedCloudChanges ? 'Sync Now' : 'Synced'}</span>
              <span className={`w-1.5 h-1.5 rounded-full ${hasUnsavedCloudChanges ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
            </button>
          )}

          {/* New Version Downloaded Alert Button */}
          {updateDownloaded && (
            <button
              onClick={handleRestartForUpdate}
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/30 transition-all text-xs font-semibold animate-pulse shadow-md shadow-emerald-950/50"
              title="Click to restart and apply update"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Update Ready (v{updateDownloaded}) • Restart</span>
            </button>
          )}
        </div>

        {/* Windows Native Window Controls */}
        <div className="flex items-center space-x-1 [-webkit-app-region:no-drag]">
          <button
            onClick={handleMinimize}
            className="w-8 h-7 flex items-center justify-center text-slate-400 hover:text-slate-100 hover:bg-surface-hover rounded transition-colors"
            aria-label="Minimize"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleMaximize}
            className="w-8 h-7 flex items-center justify-center text-slate-400 hover:text-slate-100 hover:bg-surface-hover rounded transition-colors"
            aria-label="Maximize"
          >
            {isMaximized ? <Copy className="w-3 h-3" /> : <Square className="w-3 h-3" />}
          </button>
          <button
            onClick={handleClose}
            className="w-8 h-7 flex items-center justify-center text-slate-400 hover:text-white hover:bg-red-600 rounded transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* External Display Control Modal */}
      {isExternalDisplayModalOpen && (
        <ExternalDisplayModal onClose={() => setIsExternalDisplayModalOpen(false)} />
      )}
    </>
  );
};
