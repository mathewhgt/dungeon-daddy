import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Download, 
  Upload, 
  RotateCcw, 
  Keyboard, 
  CheckCircle2, 
  HardDrive,
  Sparkles,
  Compass,
  FileSpreadsheet,
  History,
  Cloud,
  CloudOff,
  FolderOpen,
  RefreshCw,
  ArrowUpRight,
  Laptop,
  Folder,
  Check,
  AlertCircle,
  Package,
  ArrowDownCircle,
  ShieldCheck,
  Layers,
  Terminal,
  ExternalLink,
  GitBranch,
  GitCommit,
  GitPullRequest,
  ArrowDownToLine
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatBytes } from '../../services/storageService';

export const SettingsView: React.FC = () => {
  const { 
    db, 
    exportDatabaseJson, 
    importDatabaseJson, 
    resetDatabaseToDefaults, 
    showToast,
    toggleRadialMenu,
    setIsRollbackModalOpen,
    convertMisclassifiedItems,
    cloudSyncConfig,
    isSyncing,
    hasUnsavedCloudChanges,
    syncNow,
    selectCloudFolder,
    migrateLocalToCloud,
    loadFromCloud,
    openCloudFolder,
    toggleAutoCloudSync,
    disconnectCloudSync,
  } = useApp();

  const [isMigrating, setIsMigrating] = useState(false);
  const [folderConflictModal, setFolderConflictModal] = useState<{
    isOpen: boolean;
    folderPath: string;
  }>({
    isOpen: false,
    folderPath: '',
  });

  // App Packaging & Update Center State
  const [appVersionInfo, setAppVersionInfo] = useState<{
    version: string;
    isPackaged: boolean;
    platform: string;
    arch: string;
  }>({
    version: '1.0.0',
    isPackaged: false,
    platform: 'win32',
    arch: 'x64',
  });

  const [gitInfo, setGitInfo] = useState<{
    hasGit: boolean;
    remoteUrl?: string;
    owner?: string;
    repo?: string;
    branch?: string;
    commit?: {
      hash: string;
      subject: string;
      time: string;
      author: string;
    };
  }>({
    hasGit: false,
    remoteUrl: 'https://github.com/mathewhgt/dungeon-daddy.git',
    owner: 'mathewhgt',
    repo: 'dungeon-daddy',
    branch: 'main',
  });

  const [gitUpdateInfo, setGitUpdateInfo] = useState<{
    commitsBehind: number;
    commitLogs: string[];
    branch: string;
  } | null>(null);

  const [gitPullOutput, setGitPullOutput] = useState<string | null>(null);
  const [githubLiveInfo, setGithubLiveInfo] = useState<{
    version?: string;
    currentVersion?: string;
    latestCommit?: {
      hash: string;
      message: string;
      date: string;
      author: string;
      htmlUrl: string;
    };
    message?: string;
  } | null>(null);

  const [updateStatus, setUpdateStatus] = useState<
    'idle' | 'checking' | 'available' | 'git-update-available' | 'git-pulling' | 'git-pulled' | 'github-live' | 'not-available' | 'downloading' | 'downloaded' | 'error' | 'dev-mode'
  >('idle');
  const [updateProgress, setUpdateProgress] = useState<{
    percent: number;
    bytesPerSecond?: number;
    transferred?: number;
    total?: number;
  }>({ percent: 0 });
  const [updateInfo, setUpdateInfo] = useState<{
    version?: string;
    releaseNotes?: string;
    releaseDate?: string;
  } | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const loadGitInfo = async () => {
    if ((window as any).electronAPI?.updater?.getGitInfo) {
      try {
        const info = await (window as any).electronAPI.updater.getGitInfo();
        if (info) setGitInfo(info);
      } catch (e) {}
    }
  };

  useEffect(() => {
    if ((window as any).electronAPI?.updater) {
      const api = (window as any).electronAPI.updater;
      api.getVersion().then((info: any) => {
        if (info) setAppVersionInfo(info);
      }).catch(() => {});

      loadGitInfo();

      const cleanup = api.onStatusChange((event: any) => {
        if (!event) return;
        if (event.status === 'checking') {
          setUpdateStatus('checking');
          setUpdateError(null);
        } else if (event.status === 'git-update-available') {
          setUpdateStatus('git-update-available');
          setGitUpdateInfo({
            commitsBehind: event.commitsBehind || 1,
            commitLogs: event.commitLogs || [],
            branch: event.branch || 'main',
          });
        } else if (event.status === 'git-pulling') {
          setUpdateStatus('git-pulling');
        } else if (event.status === 'git-pulled') {
          setUpdateStatus('git-pulled');
          setGitPullOutput(event.output || 'Git pull completed.');
          loadGitInfo();
        } else if (event.status === 'available') {
          setUpdateStatus('available');
          setUpdateInfo({
            version: event.version,
            releaseNotes: event.releaseNotes,
            releaseDate: event.releaseDate,
          });
        } else if (event.status === 'github-live') {
          setUpdateStatus('github-live');
          setGithubLiveInfo({
            version: event.version,
            currentVersion: event.currentVersion,
            latestCommit: event.latestCommit,
            message: event.message,
          });
        } else if (event.status === 'not-available') {
          setUpdateStatus('not-available');
          setGitUpdateInfo(null);
          setGithubLiveInfo(null);
        } else if (event.status === 'downloading') {
          setUpdateStatus('downloading');
          setUpdateProgress({
            percent: event.percent || 0,
            bytesPerSecond: event.bytesPerSecond,
            transferred: event.transferred,
            total: event.total,
          });
        } else if (event.status === 'downloaded') {
          setUpdateStatus('downloaded');
          setUpdateInfo((prev) => ({
            ...prev,
            version: event.version || prev?.version,
            releaseNotes: event.releaseNotes || prev?.releaseNotes,
          }));
        } else if (event.status === 'error') {
          setUpdateStatus('error');
          setUpdateError(event.error || 'Failed to check or download update.');
        }
      });

      return () => cleanup?.();
    }
  }, []);

  const handleCheckForUpdates = async () => {
    if (!(window as any).electronAPI?.updater) {
      setUpdateStatus('dev-mode');
      return;
    }
    setUpdateStatus('checking');
    setUpdateError(null);
    try {
      const res = await (window as any).electronAPI.updater.checkForUpdates();
      if (res?.status === 'git-update-available') {
        setUpdateStatus('git-update-available');
        setGitUpdateInfo({
          commitsBehind: res.commitsBehind || 1,
          commitLogs: res.commitLogs || [],
          branch: res.branch || 'main',
        });
      } else if (res?.status === 'github-live') {
        setUpdateStatus('github-live');
        setGithubLiveInfo({
          version: res.version,
          currentVersion: res.currentVersion,
          latestCommit: res.latestCommit,
          message: res.message,
        });
      } else if (res?.status === 'not-available') {
        setUpdateStatus('not-available');
        setGitUpdateInfo(null);
        setGithubLiveInfo(null);
      } else if (!res?.success && res?.error) {
        setUpdateStatus('error');
        setUpdateError(res.error);
      }
    } catch (err: any) {
      setUpdateStatus('error');
      setUpdateError(err?.message || 'Error communicating with update server.');
    }
  };

  const handlePullGitUpdate = async () => {
    if (!(window as any).electronAPI?.updater) return;
    setUpdateStatus('git-pulling');
    setUpdateError(null);
    try {
      const res = await (window as any).electronAPI.updater.pullGitUpdate();
      if (res?.success) {
        setUpdateStatus('git-pulled');
        setGitPullOutput(res.output || 'Git pull completed.');
        showToast('Updated successfully from Git! Relaunching...');
        setTimeout(() => {
          (window as any).electronAPI?.updater?.relaunch?.();
        }, 1200);
      } else {
        setUpdateStatus('error');
        setUpdateError(res?.error || 'Failed to pull updates from Git.');
      }
    } catch (err: any) {
      setUpdateStatus('error');
      setUpdateError(err?.message || 'Failed to pull updates from Git.');
    }
  };

  const handleRelaunch = () => {
    if ((window as any).electronAPI?.updater?.relaunch) {
      (window as any).electronAPI.updater.relaunch();
    }
  };

  const handleDownloadUpdate = async () => {
    if (!(window as any).electronAPI?.updater) return;
    setUpdateStatus('downloading');
    setUpdateProgress({ percent: 0 });
    try {
      const res = await (window as any).electronAPI.updater.downloadUpdate();
      if (!res.success && res.error) {
        setUpdateStatus('error');
        setUpdateError(res.error);
      }
    } catch (err: any) {
      setUpdateStatus('error');
      setUpdateError(err?.message || 'Download error.');
    }
  };

  const handleRestartAndInstall = () => {
    if ((window as any).electronAPI?.updater) {
      (window as any).electronAPI.updater.quitAndInstall();
    }
  };

  const handleExportBackup = () => {
    const jsonStr = exportDatabaseJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dungeon_daddy_backup_${Date.now()}.json`;
    link.click();
    showToast('Exported complete backup successfully!');
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

  const handleSelectFolder = async () => {
    const res = await selectCloudFolder();
    if (res.success && res.hasExistingDb && res.folderPath) {
      setFolderConflictModal({
        isOpen: true,
        folderPath: res.folderPath,
      });
    }
  };

  const handleMigrate = async () => {
    if (!cloudSyncConfig.folderPath) {
      const res = await selectCloudFolder();
      if (!res.success || !res.folderPath) return;
    }
    setIsMigrating(true);
    try {
      await migrateLocalToCloud();
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#090d12] overflow-y-auto p-8 select-none">
      <div className="max-w-4xl mx-auto space-y-6 w-full pb-12">
        {/* Header */}
        <div className="border-b border-surface-border pb-4">
          <h1 className="font-serif text-2xl font-bold text-slate-100 flex items-center space-x-2">
            <Settings className="w-6 h-6 text-amber-500" />
            <span>Settings & Application Data</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage local offline data, cloud drive syncing, export backups, and keyboard shortcuts.
          </p>
        </div>

        {/* Database Statistics */}
        <div className="grid grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-surface-100 border border-surface-border">
            <div className="text-[11px] font-bold uppercase text-slate-400">Monsters & NPCs</div>
            <div className="text-2xl font-black font-mono text-amber-400 mt-1">{db.monsters.length}</div>
          </div>
          <div className="p-4 rounded-xl bg-surface-100 border border-surface-border">
            <div className="text-[11px] font-bold uppercase text-slate-400">Spells</div>
            <div className="text-2xl font-black font-mono text-indigo-400 mt-1">{db.spells.length}</div>
          </div>
          <div className="p-4 rounded-xl bg-surface-100 border border-surface-border">
            <div className="text-[11px] font-bold uppercase text-slate-400">Magic Items</div>
            <div className="text-2xl font-black font-mono text-emerald-400 mt-1">{db.items.length}</div>
          </div>
          <div className="p-4 rounded-xl bg-surface-100 border border-surface-border">
            <div className="text-[11px] font-bold uppercase text-slate-400">Encounters</div>
            <div className="text-2xl font-black font-mono text-red-400 mt-1">{db.encounters.length}</div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* Google Drive / Cloud Sync & Cross-Device Data Movement */}
        {/* ============================================================ */}
        <div className="p-6 rounded-xl bg-gradient-to-b from-blue-950/20 via-surface-100 to-surface-100 border border-blue-500/30 space-y-5 shadow-lg relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-inner">
                <Cloud className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif font-bold text-base text-slate-100 flex items-center space-x-2">
                  <span>Google Drive & Cloud Folder Synchronization</span>
                  {cloudSyncConfig.folderPath && cloudSyncConfig.autoSync && (
                    <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>Live Sync (5m & On Close)</span>
                    </span>
                  )}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Keep your entire campaign database synchronized between this PC and your laptop automatically every 5 minutes and upon closing the app.
                </p>
              </div>
            </div>

            {cloudSyncConfig.folderPath && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={syncNow}
                  disabled={isSyncing}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow"
                  title="Synchronize immediately to Google Drive"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
                </button>
                <button
                  onClick={openCloudFolder}
                  className="px-3 py-1.5 rounded-lg bg-surface-50 hover:bg-surface-hover border border-surface-border text-slate-300 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
                  title="Open sync folder in File Explorer"
                >
                  <FolderOpen className="w-3.5 h-3.5 text-blue-400" />
                  <span>Open Folder</span>
                </button>
              </div>
            )}
          </div>

          {/* Sync Folder Path Card */}
          <div className="p-4 rounded-lg bg-surface-50/80 border border-surface-border space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 flex items-center space-x-1.5">
                <Folder className="w-4 h-4 text-amber-400" />
                <span>Active Cloud Storage Location:</span>
              </span>
              {cloudSyncConfig.folderPath ? (
                <span className="text-[11px] text-slate-400 font-mono">
                  {cloudSyncConfig.fileSize ? `File Size: ${formatBytes(cloudSyncConfig.fileSize)}` : ''}
                  {cloudSyncConfig.lastSynced ? ` • Last Synced: ${new Date(cloudSyncConfig.lastSynced).toLocaleTimeString()}` : ''}
                </span>
              ) : (
                <span className="text-[11px] text-amber-400/90 font-semibold">
                  Not Configured (Local Storage Only)
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <div className="flex-1 px-3 py-2 rounded-lg bg-surface-100 border border-surface-border text-xs font-mono text-slate-200 truncate select-all">
                {cloudSyncConfig.folderPath || 'No folder selected. Click "Choose Google Drive Folder" to link.'}
              </div>
              <button
                onClick={handleSelectFolder}
                className="px-3 py-2 bg-surface-100 hover:bg-surface-hover border border-surface-border text-slate-200 hover:text-white font-semibold text-xs rounded-lg transition-colors whitespace-nowrap"
              >
                {cloudSyncConfig.folderPath ? 'Change Folder...' : 'Choose Sync Folder...'}
              </button>
            </div>
          </div>

          {/* Migration & Sync Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {/* Primary Action: Move Local Save to Drive */}
            <div className="p-4 rounded-lg bg-gradient-to-br from-blue-900/30 to-surface-50 border border-blue-500/30 flex flex-col justify-between space-y-3">
              <div>
                <div className="font-bold text-xs text-blue-200 flex items-center space-x-1.5">
                  <ArrowUpRight className="w-4 h-4 text-blue-400" />
                  <span>Migrate Current Local Save to Drive</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Copies all active monsters, spells, campaigns, and homebrew from this computer into your Google Drive folder and activates continuous sync.
                </p>
              </div>
              <button
                onClick={handleMigrate}
                disabled={isMigrating || isSyncing}
                className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs rounded-lg shadow transition-all flex items-center justify-center space-x-2"
              >
                {isMigrating || isSyncing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Migrating Data...</span>
                  </>
                ) : (
                  <>
                    <Cloud className="w-3.5 h-3.5" />
                    <span>{cloudSyncConfig.folderPath ? 'Push Current Save to Drive' : 'Select Folder & Migrate to Drive'}</span>
                  </>
                )}
              </button>
            </div>

            {/* Secondary Action: Load from Drive (For second machine / laptop) */}
            <div className="p-4 rounded-lg bg-surface-50 border border-surface-border flex flex-col justify-between space-y-3">
              <div>
                <div className="font-bold text-xs text-slate-200 flex items-center space-x-1.5">
                  <Laptop className="w-4 h-4 text-emerald-400" />
                  <span>Load Cloud Save (For Laptop / New Install)</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  If you already have your database saved in Google Drive from your other machine, pull the latest save down to this computer.
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={loadFromCloud}
                  disabled={!cloudSyncConfig.folderPath || isSyncing}
                  className="flex-1 py-2 px-3 bg-surface-100 hover:bg-surface-hover disabled:opacity-40 border border-surface-border text-slate-200 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center space-x-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>Load from Drive Folder</span>
                </button>
                {cloudSyncConfig.folderPath && (
                  <button
                    onClick={disconnectCloudSync}
                    className="py-2 px-3 bg-surface-100 hover:bg-red-950/50 border border-surface-border hover:border-red-800 text-slate-400 hover:text-red-300 font-semibold text-xs rounded-lg transition-colors"
                    title="Disconnect cloud sync and use local storage only"
                  >
                    <CloudOff className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Keyboard Shortcuts Reference */}
        <div className="p-5 rounded-xl bg-surface-100 border border-surface-border space-y-3">
          <div className="flex items-center space-x-2 font-serif font-bold text-slate-100 text-sm">
            <Keyboard className="w-4 h-4 text-amber-500" />
            <span>Keyboard Shortcuts & Quick Navigation</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-surface-50 border border-surface-border flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-200">Open Radial HUD Navigation</div>
                <div className="text-[11px] text-slate-400">Circular quick launcher for all views</div>
              </div>
              <kbd className="px-2.5 py-1 bg-surface-100 border border-surface-border text-amber-400 font-mono font-bold rounded">
                Ctrl + Space
              </kbd>
            </div>

            <div className="p-3 rounded-lg bg-surface-50 border border-surface-border flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-200">Toggle Dice Roller Tray</div>
                <div className="text-[11px] text-slate-400">Quick dice tray & roll math breakdown</div>
              </div>
              <kbd className="px-2.5 py-1 bg-surface-100 border border-surface-border text-purple-400 font-mono font-bold rounded">
                Ctrl + D
              </kbd>
            </div>

            <div className="p-3 rounded-lg bg-surface-50 border border-surface-border flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-200">Next Combat Turn</div>
                <div className="text-[11px] text-slate-400">Advance active combat initiative</div>
              </div>
              <kbd className="px-2.5 py-1 bg-surface-100 border border-surface-border text-emerald-400 font-mono font-bold rounded">
                Space
              </kbd>
            </div>

            <div className="p-3 rounded-lg bg-surface-50 border border-surface-border flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-200">Close Modals & Drawers</div>
                <div className="text-[11px] text-slate-400">Dismiss radial menu or active drawer</div>
              </div>
              <kbd className="px-2.5 py-1 bg-surface-100 border border-surface-border text-slate-300 font-mono font-bold rounded">
                Escape
              </kbd>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* Application Version, Packaging & Auto-Update Center */}
        {/* ============================================================ */}
        <div className="p-6 rounded-xl bg-gradient-to-b from-purple-950/20 via-surface-100 to-surface-100 border border-purple-500/30 space-y-5 shadow-lg">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-inner">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2.5">
                  <h2 className="font-serif font-bold text-base text-slate-100">
                    Application Version & Software Updates
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                    v{appVersionInfo.version}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-surface-50 text-slate-400 border border-surface-border">
                    {appVersionInfo.isPackaged ? 'Packaged Build' : 'Dev Mode'} • {appVersionInfo.platform} ({appVersionInfo.arch})
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Check for latest releases, download updates automatically, or package for other computers.
                </p>
              </div>
            </div>

            <button
              onClick={handleCheckForUpdates}
              disabled={updateStatus === 'checking' || updateStatus === 'downloading'}
              className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold flex items-center space-x-1.5 shadow transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${updateStatus === 'checking' ? 'animate-spin' : ''}`} />
              <span>{updateStatus === 'checking' ? 'Checking...' : 'Check for Updates'}</span>
            </button>
          </div>

          {/* Git Remote Repository & Branch Card */}
          <div className="p-3.5 rounded-lg bg-surface-50/80 border border-surface-border flex items-center justify-between text-xs">
            <div className="flex items-center space-x-3 truncate">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                <GitBranch className="w-4 h-4" />
              </div>
              <div className="truncate">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-200">Git Repository:</span>
                  <span className="px-2 py-0.2 rounded bg-surface-100 text-purple-300 font-mono text-[11px] border border-surface-border">
                    origin/{gitInfo.branch || 'main'}
                  </span>
                  {gitInfo.commit?.hash && (
                    <span className="text-[10px] text-slate-400 font-mono">
                      (Commit {gitInfo.commit.hash})
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 truncate mt-0.5 font-mono">
                  {gitInfo.remoteUrl || 'https://github.com/mathewhgt/dungeon-daddy.git'}
                </div>
              </div>
            </div>

            <a
              href={gitInfo.remoteUrl?.replace(/\.git$/, '') || 'https://github.com/mathewhgt/dungeon-daddy'}
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1 rounded bg-surface-100 hover:bg-surface-hover border border-surface-border text-slate-300 hover:text-white text-[11px] font-semibold flex items-center space-x-1 shrink-0 transition-colors"
            >
              <span>GitHub Repo</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          </div>

          {/* Update Status Banner */}
          {updateStatus !== 'idle' && (
            <div className="p-4 rounded-lg bg-surface-50 border border-surface-border space-y-3">
              {updateStatus === 'checking' && (
                <div className="flex items-center space-x-2 text-xs text-slate-300">
                  <RefreshCw className="w-4 h-4 text-purple-400 animate-spin" />
                  <span>Connecting to Git remote and checking for newer commits/releases...</span>
                </div>
              )}

              {/* Git Update Available (Pull from Git) */}
              {updateStatus === 'git-update-available' && gitUpdateInfo && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-xs text-amber-300 font-semibold">
                      <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                      <span>
                        {gitUpdateInfo.commitsBehind} New {gitUpdateInfo.commitsBehind === 1 ? 'Commit' : 'Commits'} Available on origin/{gitUpdateInfo.branch}!
                      </span>
                    </div>
                    <button
                      onClick={handlePullGitUpdate}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow-lg flex items-center space-x-1.5 animate-pulse transition-all"
                    >
                      <ArrowDownToLine className="w-4 h-4" />
                      <span>Pull from Git & Relaunch</span>
                    </button>
                  </div>

                  {gitUpdateInfo.commitLogs.length > 0 && (
                    <div className="p-3 bg-surface-100/90 rounded-lg border border-surface-border space-y-1">
                      <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Incoming Commits:</div>
                      <div className="text-xs text-slate-300 font-mono space-y-1 max-h-32 overflow-y-auto">
                        {gitUpdateInfo.commitLogs.map((log, idx) => (
                          <div key={idx} className="truncate text-slate-300 flex items-center space-x-1.5">
                            <GitCommit className="w-3 h-3 text-purple-400 shrink-0" />
                            <span>{log}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Git Pulling in Progress */}
              {updateStatus === 'git-pulling' && (
                <div className="flex items-center space-x-2 text-xs text-purple-300">
                  <RefreshCw className="w-4 h-4 text-purple-400 animate-spin" />
                  <span>Pulling latest changes from Git and rebuilding application bundle...</span>
                </div>
              )}

              {/* Git Pulled Success */}
              {updateStatus === 'git-pulled' && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Successfully pulled updates from Git! Relaunching application...</span>
                  </div>
                  <button
                    onClick={handleRelaunch}
                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow transition-colors"
                  >
                    Relaunch Now
                  </button>
                </div>
              )}

              {/* GitHub Live Status (when checking remote without local git) */}
              {updateStatus === 'github-live' && githubLiveInfo && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-xs text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>
                        Up to date with GitHub main (v{appVersionInfo.version})
                      </span>
                    </div>
                    {githubLiveInfo.latestCommit?.htmlUrl && (
                      <a
                        href={githubLiveInfo.latestCommit.htmlUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 bg-surface-100 hover:bg-surface-hover border border-surface-border text-slate-200 text-xs font-semibold rounded-lg flex items-center space-x-1 transition-colors"
                      >
                        <span>View Commit on GitHub</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </a>
                    )}
                  </div>
                  {githubLiveInfo.latestCommit && (
                    <div className="p-3 bg-surface-100/90 rounded-lg border border-surface-border space-y-1">
                      <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Latest GitHub Commit:</div>
                      <div className="text-xs text-slate-300 font-mono flex items-center space-x-1.5 truncate">
                        <GitCommit className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        <span className="font-bold text-purple-300">{githubLiveInfo.latestCommit.hash}</span>
                        <span className="text-slate-400">—</span>
                        <span className="truncate text-slate-200">{githubLiveInfo.latestCommit.message}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {updateStatus === 'not-available' && (
                <div className="flex items-center space-x-2 text-xs text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>
                    You are running the latest version of Dungeon Daddy (v{appVersionInfo.version}) • Up to date with origin/{gitInfo.branch || 'main'}!
                  </span>
                </div>
              )}

              {updateStatus === 'available' && updateInfo && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-xs text-amber-300 font-semibold">
                      <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                      <span>New Binary Release Available: v{updateInfo.version}</span>
                    </div>
                    <button
                      onClick={handleDownloadUpdate}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow flex items-center space-x-1.5 transition-all"
                    >
                      <ArrowDownCircle className="w-4 h-4" />
                      <span>Download Update Now</span>
                    </button>
                  </div>
                  {updateInfo.releaseNotes && (
                    <div className="p-3 bg-surface-100 rounded text-xs text-slate-300 font-mono whitespace-pre-wrap max-h-32 overflow-y-auto">
                      {updateInfo.releaseNotes}
                    </div>
                  )}
                </div>
              )}

              {updateStatus === 'downloading' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 flex items-center space-x-1.5 font-semibold">
                      <ArrowDownCircle className="w-4 h-4 text-purple-400 animate-bounce" />
                      <span>Downloading update package...</span>
                    </span>
                    <span className="font-mono text-purple-300 font-bold">{updateProgress.percent}%</span>
                  </div>
                  <div className="w-full h-2 bg-surface-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 transition-all duration-300 rounded-full"
                      style={{ width: `${Math.max(5, updateProgress.percent)}%` }}
                    />
                  </div>
                  {updateProgress.transferred && updateProgress.total ? (
                    <div className="text-[10px] text-slate-400 font-mono text-right">
                      {formatBytes(updateProgress.transferred)} / {formatBytes(updateProgress.total)}
                    </div>
                  ) : null}
                </div>
              )}

              {updateStatus === 'downloaded' && (
                <div className="flex items-center justify-between p-1">
                  <div className="flex items-center space-x-2 text-xs text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Update v{updateInfo?.version || 'new'} downloaded and ready to apply!</span>
                  </div>
                  <button
                    onClick={handleRestartAndInstall}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow-lg flex items-center space-x-1.5 animate-pulse transition-all"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Restart & Update Now</span>
                  </button>
                </div>
              )}

              {updateStatus === 'error' && updateError && (
                <div className="flex items-start space-x-2 text-xs text-red-400">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-semibold">Update check or pull encountered an issue:</span>
                    <p className="text-[11px] text-slate-400 font-mono">{updateError}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick Guide: Multi-Device Packaging & Future Updates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-lg bg-surface-50 border border-surface-border space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-200">
                <Layers className="w-4 h-4 text-purple-400" />
                <span>How to Package for Other Devices</span>
              </div>
              <ul className="text-[11px] text-slate-400 space-y-1.5 leading-relaxed">
                <li>• Run <code className="bg-surface-100 text-purple-300 px-1 py-0.2 rounded font-mono">npm run package</code> in terminal.</li>
                <li>• Creates both an installer (<code className="text-slate-300 font-mono">Dungeon Daddy Setup.exe</code>) and a zero-install portable executable (<code className="text-slate-300 font-mono">Dungeon-Daddy-Portable.exe</code>) in the <code className="text-slate-300 font-mono">release/</code> folder.</li>
                <li>• Copy either executable to your laptop or other computers via USB or cloud drive.</li>
              </ul>
            </div>

            <div className="p-3.5 rounded-lg bg-surface-50 border border-surface-border space-y-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-200">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Data Safety & Continuous Work</span>
              </div>
              <ul className="text-[11px] text-slate-400 space-y-1.5 leading-relaxed">
                <li>• All campaigns, monsters, and notes are decoupled from the app binaries and stored in <code className="text-slate-300 font-mono">userData</code> / Google Drive sync.</li>
                <li>• Reinstalling, updating, or replacing the executable will never overwrite your campaign saves.</li>
                <li>• Enable Google Drive Sync above for instant live database sync across devices.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Backup and Data Management */}
        <div className="p-5 rounded-xl bg-surface-100 border border-surface-border space-y-4">
          <div className="font-serif font-bold text-slate-100 text-sm flex items-center space-x-2">
            <HardDrive className="w-4 h-4 text-blue-400" />
            <span>Database Backup & Restoration</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            All data is saved 100% locally on your computer. You can export a JSON backup file or import one anytime.
          </p>

          <div className="flex items-center space-x-3 pt-1 flex-wrap gap-y-2">
            <button
              onClick={() => setIsRollbackModalOpen(true)}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-lg shadow-sm flex items-center space-x-1.5 transition-colors"
            >
              <History className="w-4 h-4 text-slate-950" />
              <span>Database Snapshots & Rollback</span>
            </button>

            <button
              onClick={handleExportBackup}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg shadow-sm flex items-center space-x-1.5 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export Full JSON</span>
            </button>

            <label className="px-4 py-2 bg-surface-50 hover:bg-surface-hover border border-surface-border text-slate-200 font-semibold text-xs rounded-lg flex items-center space-x-1.5 cursor-pointer transition-colors">
              <Upload className="w-4 h-4 text-purple-400" />
              <span>Restore JSON Backup</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                className="hidden"
              />
            </label>

            <button
              onClick={convertMisclassifiedItems}
              className="px-4 py-2 bg-surface-50 hover:bg-amber-950/60 border border-surface-border hover:border-amber-800 text-slate-300 hover:text-amber-300 font-semibold text-xs rounded-lg flex items-center space-x-1.5 transition-colors"
              title="Move any accidentally imported items from Monsters to Equipment"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Fix Misclassified Items</span>
            </button>

            <button
              onClick={() => {
                if (confirm('Are you sure you want to reset all data to default 5e SRD compendium?')) {
                  resetDatabaseToDefaults();
                }
              }}
              className="px-4 py-2 bg-surface-50 hover:bg-red-950/80 border border-surface-border hover:border-red-800 text-slate-400 hover:text-red-300 font-semibold text-xs rounded-lg flex items-center space-x-1.5 transition-colors"
            >
              <RotateCcw className="w-4 h-4 text-red-400" />
              <span>Reset to Default SRD</span>
            </button>
          </div>
        </div>
      </div>

      {/* Existing Cloud Database Conflict Modal */}
      {folderConflictModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f141c] border border-blue-500/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <Cloud className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-slate-100">Existing Cloud Database Found</h3>
                <p className="text-xs text-slate-400">A database file already exists in this folder.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 bg-surface-50 p-3 rounded-lg border border-surface-border leading-relaxed font-mono">
              {folderConflictModal.folderPath}
            </p>

            <div className="text-xs text-slate-300 space-y-2">
              <p>How would you like to proceed?</p>
              <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px]">
                <li><strong className="text-emerald-400">Load Cloud Save:</strong> Recommended if you are setting up your laptop to sync with your existing campaign.</li>
                <li><strong className="text-amber-400">Overwrite with Local:</strong> Replaces the cloud database with this computer's local data (creates a .bak backup first).</li>
              </ul>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setFolderConflictModal({ isOpen: false, folderPath: '' })}
                className="px-4 py-2 bg-surface-50 hover:bg-surface-hover border border-surface-border text-slate-300 text-xs font-semibold rounded-lg transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={async () => {
                  setFolderConflictModal({ isOpen: false, folderPath: '' });
                  await migrateLocalToCloud();
                }}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 text-xs font-bold rounded-lg transition-colors"
              >
                Overwrite with Local
              </button>

              <button
                onClick={async () => {
                  setFolderConflictModal({ isOpen: false, folderPath: '' });
                  await loadFromCloud();
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow transition-colors flex items-center space-x-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Load Cloud Save</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
