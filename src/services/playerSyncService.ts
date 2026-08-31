import { PlayerDisplayState, DisplaySettings, ProjectedMedia, PlayerCameraState, PlayerDiceRoll } from '../types/display';
import { BattleMapEntity } from '../types/map';
import { CombatState } from '../types/combat';
import { RollBreakdown } from '../services/diceService';

const SYNC_CHANNEL_NAME = 'dungeon_daddy_player_sync';
const STORAGE_KEY = 'dungeon_daddy_player_display_state';

const defaultDisplaySettings: DisplaySettings = {
  mode: 'blackout',
  monsterHpVisibility: 'none',
  showGrid: true,
  followDmCamera: true,
  showSpellAnimations: true,
  showCombatTrackerOverlay: true,
  blackoutMessage: 'Session in Progress... The Adventure Continues Soon',
  isBlackoutActive: true,
};

const initialDisplayState: PlayerDisplayState = {
  activeMapId: null,
  activeMap: null,
  camera: { panX: 0, panY: 0, zoom: 1 },
  combatState: {
    isActive: false,
    round: 1,
    currentTurnIndex: 0,
    combatants: [],
    log: [],
  },
  displaySettings: defaultDisplaySettings,
  selectedTokenId: null,
  projectedMedia: null,
  latestDiceRoll: null,
};

class PlayerSyncService {
  private channel: BroadcastChannel | null = null;
  private state: PlayerDisplayState = initialDisplayState;
  private listeners: Set<(state: PlayerDisplayState) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.channel = new BroadcastChannel(SYNC_CHANNEL_NAME);
      this.channel.onmessage = (event) => {
        if (event.data && typeof event.data === 'object') {
          this.handleIncomingState(event.data);
        }
      };
    }

    // Also listen to electron IPC if in electron
    if (typeof window !== 'undefined' && (window as any).electronAPI?.playerDisplay?.onStateUpdate) {
      (window as any).electronAPI.playerDisplay.onStateUpdate((incomingState: Partial<PlayerDisplayState>) => {
        this.handleIncomingState(incomingState);
      });
    }

    // Connect to Server-Sent Events (SSE) for remote Wi-Fi clients (iPads, Apple TV, Smart TVs)
    if (typeof window !== 'undefined' && typeof EventSource !== 'undefined') {
      const serverHost = window.location.hostname || 'localhost';
      const streamUrl = window.location.port === '5174'
        ? '/api/stream'
        : `http://${serverHost}:5174/api/stream`;

      try {
        const eventSource = new EventSource(streamUrl);
        eventSource.onmessage = (event) => {
          try {
            if (event.data && event.data.trim()) {
              const incoming = JSON.parse(event.data);
              this.handleIncomingState(incoming);
            }
          } catch (e) {
            // ignore non-json messages (heartbeats)
          }
        };
      } catch (e) {
        console.warn('Could not connect to SSE stream:', e);
      }

      // Initial state fetch from local server
      const stateUrl = window.location.port === '5174'
        ? '/api/state'
        : `http://${serverHost}:5174/api/state`;

      fetch(stateUrl)
        .then((res) => res.json())
        .then((data) => {
          if (data && Object.keys(data).length > 0) {
            this.handleIncomingState(data);
          }
        })
        .catch(() => {});
    }

    // Load initial state from localStorage if available
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          this.state = { ...this.state, ...JSON.parse(saved) };
        }
      } catch (e) {
        console.error('Failed to parse cached player display state:', e);
      }
    }
  }

  private handleIncomingState(partialState: Partial<PlayerDisplayState>) {
    this.state = {
      ...this.state,
      ...partialState,
      displaySettings: {
        ...this.state.displaySettings,
        ...(partialState.displaySettings || {}),
      },
    };
    this.notifyListeners();
  }

  private notifyListeners() {
    for (const listener of this.listeners) {
      try {
        listener(this.state);
      } catch (err) {
        console.error('Error in player sync listener:', err);
      }
    }
  }

  public getState(): PlayerDisplayState {
    return this.state;
  }

  public subscribe(listener: (state: PlayerDisplayState) => void): () => void {
    this.listeners.add(listener);
    // Immediately call with current state
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public broadcast(partial: Partial<PlayerDisplayState>) {
    this.state = {
      ...this.state,
      ...partial,
      displaySettings: {
        ...this.state.displaySettings,
        ...(partial.displaySettings || {}),
      },
    };

    // Save to localStorage for cold starts
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      // ignore
    }

    // Send across BroadcastChannel
    if (this.channel) {
      try {
        this.channel.postMessage(partial);
      } catch (err) {
        console.error('Failed to post message to BroadcastChannel:', err);
      }
    }

    // Send through Electron IPC
    if (typeof window !== 'undefined' && (window as any).electronAPI?.playerDisplay?.syncState) {
      (window as any).electronAPI.playerDisplay.syncState(partial);
    }

    // Post to HTTP server for SSE Wi-Fi streaming
    if (typeof window !== 'undefined') {
      const serverHost = window.location.hostname || 'localhost';
      const stateUrl = window.location.port === '5174'
        ? '/api/state'
        : `http://${serverHost}:5174/api/state`;

      fetch(stateUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partial),
      }).catch(() => {});
    }

    this.notifyListeners();
  }

  public setMap(map: BattleMapEntity | null) {
    this.broadcast({
      activeMapId: map?.id || null,
      activeMap: map,
    });
  }

  public setCamera(camera: PlayerCameraState) {
    this.broadcast({ camera });
  }

  public setSelectedTokenId(selectedTokenId: string | null) {
    this.broadcast({ selectedTokenId });
  }

  public setCombatState(combatState: CombatState) {
    this.broadcast({ combatState });
  }

  public broadcastPing(activePing: { x: number; y: number; id: string; color?: string } | null) {
    this.broadcast({ activePing });
  }

  public setSettings(settings: Partial<DisplaySettings>) {
    this.broadcast({
      displaySettings: {
        ...this.state.displaySettings,
        ...settings,
      },
    });
  }

  public projectMedia(media: ProjectedMedia) {
    this.broadcast({
      projectedMedia: media,
      displaySettings: {
        ...this.state.displaySettings,
        mode: 'media',
      },
    });
  }

  public clearProjectedMedia() {
    this.broadcast({
      projectedMedia: null,
      displaySettings: {
        ...this.state.displaySettings,
        mode: 'map',
      },
    });
  }

  public setBlackout(active: boolean, message?: string) {
    this.broadcast({
      displaySettings: {
        ...this.state.displaySettings,
        isBlackoutActive: active,
        ...(message ? { blackoutMessage: message } : {}),
      },
    });
  }

  public broadcastDiceRoll(roll: RollBreakdown & { label?: string; formula?: string }) {
    this.broadcast({
      latestDiceRoll: {
        ...roll,
        formula: roll.formula || roll.expression,
        rollId: `roll-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      },
    });
  }

  public projectCharacterCreator(step: number, state: any) {
    this.broadcast({
      characterCreation: { step, characterState: state },
      displaySettings: {
        ...this.state.displaySettings,
        mode: 'character-creator',
        isBlackoutActive: false,
      },
    });
  }

  public updateCharacterCreatorState(step: number, state: any) {
    if (this.state.displaySettings.mode === 'character-creator' || this.state.characterCreation) {
      this.broadcast({
        characterCreation: { step, characterState: state },
      });
    }
  }

  public stopCharacterCreator() {
    this.broadcast({
      characterCreation: null,
      displaySettings: {
        ...this.state.displaySettings,
        mode: 'map',
      },
    });
  }

  public setCampaignInfo(campaignInfo: { name: string; currentLocation?: string; inGameDate?: string }) {
    this.broadcast({ campaignInfo });
  }
}

export const playerSyncService = new PlayerSyncService();

