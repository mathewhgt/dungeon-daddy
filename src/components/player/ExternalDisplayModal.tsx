import React, { useState, useEffect } from 'react';
import { 
  X, 
  Tv, 
  Cast, 
  Monitor, 
  Maximize, 
  Minimize, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Swords, 
  Map as MapIcon, 
  FileText, 
  QrCode, 
  Power, 
  Check, 
  ExternalLink,
  ShieldAlert,
  Layers,
  Camera
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { playerSyncService } from '../../services/playerSyncService';
import { ConnectedDisplay, DisplayMode, MonsterHpVisibility } from '../../types/display';
import { QrCodeModal } from './QrCodeModal';

interface ExternalDisplayModalProps {
  onClose: () => void;
}

export const ExternalDisplayModal: React.FC<ExternalDisplayModalProps> = ({ onClose }) => {
  const { db, activeMapId, showToast } = useApp();

  const [displays, setDisplays] = useState<ConnectedDisplay[]>([]);
  const [selectedDisplayId, setSelectedDisplayId] = useState<number | null>(null);
  const [isPlayerWindowOpen, setIsPlayerWindowOpen] = useState(false);
  const [localServerInfo, setLocalServerInfo] = useState<{ ip: string; allIps?: { name: string; address: string }[]; port: number; url: string } | null>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  const [currentState, setCurrentState] = useState(() => playerSyncService.getState());
  const { displaySettings, projectedMedia } = currentState;

  // Query connected screens and server info on mount
  useEffect(() => {
    if ((window as any).electronAPI?.playerDisplay) {
      const api = (window as any).electronAPI.playerDisplay;

      api.getDisplays().then((ds: ConnectedDisplay[]) => {
        setDisplays(ds);
        // Default to non-primary if available
        const ext = ds.find((d) => !d.isPrimary);
        if (ext) setSelectedDisplayId(ext.id);
        else if (ds.length > 0) setSelectedDisplayId(ds[0].id);
      }).catch(() => {});

      api.isPlayerWindowOpen().then(setIsPlayerWindowOpen).catch(() => {});
      api.getLocalServerInfo().then(setLocalServerInfo).catch(() => {});

      const unOpened = api.onWindowOpened(() => setIsPlayerWindowOpen(true));
      const unClosed = api.onWindowClosed(() => setIsPlayerWindowOpen(false));

      return () => {
        unOpened?.();
        unClosed?.();
      };
    } else {
      // Browser fallback
      setLocalServerInfo({
        ip: window.location.hostname || 'localhost',
        port: parseInt(window.location.port || '5173', 10),
        url: `${window.location.origin}/?view=player`,
      });
    }
  }, []);

  // Listen to sync service state
  useEffect(() => {
    return playerSyncService.subscribe((state) => {
      setCurrentState({ ...state });
    });
  }, []);

  const handleLaunchWindow = (fullscreen = false) => {
    if ((window as any).electronAPI?.playerDisplay) {
      (window as any).electronAPI.playerDisplay.open({
        displayId: selectedDisplayId || undefined,
        fullscreen,
      });
      setIsPlayerWindowOpen(true);
      showToast('Player Display opened');
    } else {
      // Browser fallback
      const url = `${window.location.origin}/?view=player`;
      window.open(url, 'EncounterPlusPlayerView', 'width=1920,height=1080');
      setIsPlayerWindowOpen(true);
      showToast('Player Display opened in new tab');
    }
  };

  const handleCloseWindow = () => {
    if ((window as any).electronAPI?.playerDisplay) {
      (window as any).electronAPI.playerDisplay.close();
      setIsPlayerWindowOpen(false);
      showToast('Player Display closed');
    }
  };

  const handleToggleFullscreen = () => {
    if ((window as any).electronAPI?.playerDisplay) {
      (window as any).electronAPI.playerDisplay.toggleFullscreen();
    }
  };

  const handleLaunchChromeCast = () => {
    if ((window as any).electronAPI?.playerDisplay?.launchChromeCast) {
      (window as any).electronAPI.playerDisplay.launchChromeCast();
      showToast('Launching Chrome for Google Cast...');
    } else {
      window.open(`${window.location.origin}/?view=player`, '_blank');
    }
  };

  const handleModeChange = (mode: DisplayMode) => {
    playerSyncService.setSettings({
      mode,
      isBlackoutActive: mode === 'blackout',
    });
    if (mode !== 'media') {
      playerSyncService.clearProjectedMedia();
    }
    showToast(`Switched Player Display to ${mode === 'map' ? 'Battle Map' : mode === 'combat' ? 'Combat Tracker' : mode === 'media' ? 'Handout Projector' : 'Blackout'} mode`);
  };

  const handleToggleBlackout = () => {
    const next = !displaySettings.isBlackoutActive;
    playerSyncService.setSettings({
      isBlackoutActive: next,
      mode: next ? 'blackout' : (displaySettings.mode === 'blackout' ? 'map' : displaySettings.mode),
    });
    showToast(next ? 'Blackout Curtain enabled' : 'Blackout Curtain disabled');
  };

  const handleMonsterHpChange = (monsterHpVisibility: MonsterHpVisibility) => {
    playerSyncService.setSettings({ monsterHpVisibility });
    showToast(`Monster health visibility set to: ${monsterHpVisibility}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none animate-fadeIn">
      <div className="bg-[#121723] border border-amber-500/40 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 bg-surface-100/60 border-b border-surface-border flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-md">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-serif font-bold text-slate-100 text-base">External Player Display</h2>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    isPlayerWindowOpen
                      ? 'bg-emerald-950/80 border border-emerald-700 text-emerald-300 animate-pulse'
                      : 'bg-slate-900 border border-slate-700 text-slate-400'
                  }`}
                >
                  {isPlayerWindowOpen ? '● Live' : '○ Standby'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Project player-safe battle maps, combat tracker & handouts</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-surface-hover text-slate-400 hover:text-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Section 1: Physical Screens & Window Launcher */}
          <div className="p-4 rounded-2xl bg-surface-100 border border-surface-border space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-sm font-bold text-slate-200 flex items-center space-x-2">
                <Monitor className="w-4 h-4 text-amber-400" />
                <span>Physical Monitor / TV Window</span>
              </h3>

              {displays.length > 0 && (
                <span className="text-[11px] text-slate-400">
                  {displays.length} {displays.length === 1 ? 'display' : 'displays'} detected
                </span>
              )}
            </div>

            {displays.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {displays.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setSelectedDisplayId(d.id)}
                    className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                      selectedDisplayId === d.id
                        ? 'bg-amber-500/15 border-amber-500 text-amber-300 font-bold shadow-md shadow-amber-500/10'
                        : 'bg-surface-50 border-surface-border text-slate-300 hover:bg-surface-hover'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <div className="text-xs truncate">{d.label}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">{d.bounds.width} × {d.bounds.height}</div>
                    </div>
                    {d.isPrimary && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] bg-surface-100 text-slate-400 shrink-0">Primary</span>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">Running in web browser mode. Click below to launch in secondary tab or window.</p>
            )}

            <div className="flex items-center space-x-2 pt-1">
              {!isPlayerWindowOpen ? (
                <>
                  <button
                    onClick={() => handleLaunchWindow(false)}
                    className="flex-1 py-2.5 px-4 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center space-x-2"
                  >
                    <Power className="w-4 h-4" />
                    <span>Launch Player Display</span>
                  </button>
                  <button
                    onClick={() => handleLaunchWindow(true)}
                    className="py-2.5 px-3 bg-surface-50 hover:bg-surface-hover border border-surface-border text-slate-200 text-xs font-semibold rounded-xl transition-colors flex items-center space-x-1.5"
                    title="Launch directly in fullscreen on second screen"
                  >
                    <Maximize className="w-4 h-4" />
                    <span>Fullscreen</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleToggleFullscreen}
                    className="flex-1 py-2 px-3 bg-surface-50 hover:bg-surface-hover border border-surface-border text-slate-200 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center space-x-1.5"
                  >
                    <Maximize className="w-4 h-4 text-amber-400" />
                    <span>Toggle Fullscreen (F11)</span>
                  </button>

                  <button
                    onClick={handleCloseWindow}
                    className="py-2 px-4 bg-red-950/80 hover:bg-red-900 border border-red-800 text-red-300 text-xs font-bold rounded-xl transition-colors flex items-center space-x-1.5"
                  >
                    <Power className="w-4 h-4" />
                    <span>Close Window</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Section 2: Wireless Google Cast & Local Wi-Fi */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/40 to-surface-100 border border-indigo-700/50 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-sm font-bold text-slate-200 flex items-center space-x-2">
                <Cast className="w-4 h-4 text-sky-400" />
                <span>Google Chromecast & Wireless Smart TVs</span>
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-950/80 border border-sky-700 text-sky-300">
                Wi-Fi Streaming
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Cast your battle map wirelessly to Google Chromecast devices, Apple TV, or open directly in your Smart TV browser.
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleLaunchChromeCast}
                className="py-2.5 px-3 bg-surface-50 hover:bg-surface-hover border border-indigo-700/60 rounded-xl text-xs font-bold text-slate-100 transition-colors flex items-center justify-center space-x-2"
              >
                <Cast className="w-4 h-4 text-sky-400" />
                <span>Cast via Chrome / Edge</span>
              </button>

              <button
                onClick={() => setIsQrModalOpen(true)}
                className="py-2.5 px-3 bg-surface-50 hover:bg-surface-hover border border-indigo-700/60 rounded-xl text-xs font-bold text-slate-100 transition-colors flex items-center justify-center space-x-2"
              >
                <QrCode className="w-4 h-4 text-amber-400" />
                <span>QR Code / TV Link</span>
              </button>
            </div>
          </div>

          {/* Section 3: Display Mode Switcher */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center space-x-2">
              <Layers className="w-3.5 h-3.5" />
              <span>Player Display Mode</span>
            </h3>

            {projectedMedia && (
              <div className="p-3 rounded-xl bg-sky-950/40 border border-sky-700/60 flex items-center justify-between">
                <div className="flex items-center space-x-2 truncate">
                  <FileText className="w-4 h-4 text-sky-400 shrink-0" />
                  <div className="truncate">
                    <div className="text-xs font-bold text-sky-200 truncate">Projecting: {projectedMedia.title}</div>
                    <div className="text-[10px] text-slate-400">Handout is active on player display</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    playerSyncService.clearProjectedMedia();
                    playerSyncService.setSettings({ mode: 'map', isBlackoutActive: false });
                    showToast('Dismissed handout and returned to Battle Map');
                  }}
                  className="px-2.5 py-1 bg-surface-50 hover:bg-surface-hover border border-surface-border text-slate-200 text-xs font-semibold rounded-lg shrink-0 transition-colors"
                >
                  Dismiss & Return to Map
                </button>
              </div>
            )}

            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'map', label: 'Battle Map', icon: MapIcon, color: 'text-amber-400' },
                { id: 'combat', label: 'Combat Tracker', icon: Swords, color: 'text-red-400' },
                { id: 'media', label: 'Handout Projector', icon: FileText, color: 'text-sky-400' },
                { id: 'blackout', label: 'Blackout Curtain', icon: EyeOff, color: 'text-purple-400' },
              ].map((tab) => {
                const isActive = displaySettings.mode === tab.id;
                const Icon = tab.icon;

                return (
                  <button
                    key={tab.id}
                    onClick={() => handleModeChange(tab.id as DisplayMode)}
                    className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center space-y-1.5 ${
                      isActive
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold shadow-md shadow-amber-500/10'
                        : 'bg-surface-100 border-surface-border text-slate-300 hover:bg-surface-hover'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${tab.color}`} />
                    <span className="text-xs">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 4: Display Settings */}
          <div className="p-4 rounded-2xl bg-surface-100 border border-surface-border space-y-4">
            <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Display Settings & Vision</h3>

            <div className="grid grid-cols-2 gap-4 text-xs">
              {/* Follow Camera */}
              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={displaySettings.followDmCamera}
                  onChange={(e) => playerSyncService.setSettings({ followDmCamera: e.target.checked })}
                  className="w-4 h-4 rounded border-surface-border text-amber-500 focus:ring-amber-500 bg-surface-50"
                />
                <span className="text-slate-200 font-medium">Follow GM Camera Zoom & Pan</span>
              </label>

              {/* Show Grid */}
              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={displaySettings.showGrid}
                  onChange={(e) => playerSyncService.setSettings({ showGrid: e.target.checked })}
                  className="w-4 h-4 rounded border-surface-border text-amber-500 focus:ring-amber-500 bg-surface-50"
                />
                <span className="text-slate-200 font-medium">Show Map Grid Lines</span>
              </label>

              {/* Combat Tracker Overlay */}
              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={displaySettings.showCombatTrackerOverlay}
                  onChange={(e) => playerSyncService.setSettings({ showCombatTrackerOverlay: e.target.checked })}
                  className="w-4 h-4 rounded border-surface-border text-amber-500 focus:ring-amber-500 bg-surface-50"
                />
                <span className="text-slate-200 font-medium">Show Combat Turn Banner</span>
              </label>

              {/* Looping Spell Animations */}
              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={displaySettings.showSpellAnimations}
                  onChange={(e) => playerSyncService.setSettings({ showSpellAnimations: e.target.checked })}
                  className="w-4 h-4 rounded border-surface-border text-amber-500 focus:ring-amber-500 bg-surface-50"
                />
                <span className="text-slate-200 font-medium">Looping Spell Shaders</span>
              </label>
            </div>

            {/* Monster HP Visibility */}
            <div className="space-y-1.5 pt-2 border-t border-surface-border">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Monster Health on TV</span>
                <span className="text-[10px] text-slate-500 font-normal">Controls how creature HP is revealed</span>
              </label>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'none', label: '🔒 Hidden (Default)' },
                  { id: 'bars', label: '🟩 Health Bar' },
                  { id: 'numbers', label: '🔢 Exact Numbers' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => handleMonsterHpChange(opt.id as MonsterHpVisibility)}
                    className={`py-1.5 px-2 rounded-lg border text-xs font-medium transition-all ${
                      displaySettings.monsterHpVisibility === opt.id
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                        : 'bg-surface-50 border-surface-border text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Blackout Curtain Message */}
            <div className="space-y-1.5 pt-2 border-t border-surface-border">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">Intermission / Blackout Message</label>
                <button
                  onClick={handleToggleBlackout}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                    displaySettings.isBlackoutActive
                      ? 'bg-red-950 text-red-300 border border-red-700'
                      : 'bg-surface-50 text-slate-400 border border-surface-border'
                  }`}
                >
                  {displaySettings.isBlackoutActive ? 'Cover Active (Click to Reveal)' : 'Cover Screen'}
                </button>
              </div>

              <input
                type="text"
                value={displaySettings.blackoutMessage}
                onChange={(e) => playerSyncService.setSettings({ blackoutMessage: e.target.value })}
                placeholder="Session in Progress... The Adventure Continues Soon"
                className="w-full bg-surface-50 border border-surface-border rounded-lg p-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-surface-100/60 border-t border-surface-border flex items-center justify-end space-x-2 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-surface-50 hover:bg-surface-hover border border-surface-border rounded-xl text-xs font-semibold text-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* QR Code / Cast Hub Modal */}
      {isQrModalOpen && localServerInfo && (
        <QrCodeModal
          serverUrl={localServerInfo.url}
          localIp={localServerInfo.ip}
          allIps={localServerInfo.allIps}
          port={localServerInfo.port}
          onClose={() => setIsQrModalOpen(false)}
          onLaunchChromeCast={handleLaunchChromeCast}
        />
      )}
    </div>
  );
};
