import { CampaignNote } from '../types/campaign';

export const CURRENT_WINDOW_ID = typeof window !== 'undefined' 
  ? Math.random().toString(36).substring(2, 9) 
  : 'server';

export type CrossWindowEvent = 
  | { type: 'SWITCH_MAP'; mapId: string; senderId?: string }
  | { type: 'SWITCH_NOTE'; noteId: string; senderId?: string }
  | { type: 'NOTE_SAVED'; campaignId: string; note: CampaignNote; senderId?: string }
  | { type: 'NOTE_DELETED'; campaignId: string; noteId: string; senderId?: string };

const CHANNEL_NAME = 'dungeon-daddy-window-sync';

class CrossWindowService {
  private channel: BroadcastChannel | null = null;
  private listeners: ((event: CrossWindowEvent) => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel(CHANNEL_NAME);
        this.channel.onmessage = (e) => {
          if (e.data && e.data.type) {
            // Ignore events sent by this window instance
            if (e.data.senderId && e.data.senderId === CURRENT_WINDOW_ID) {
              return;
            }
            this.listeners.forEach((listener) => listener(e.data));
          }
        };
      } catch (err) {
        console.warn('BroadcastChannel not supported:', err);
      }
    }
  }

  public broadcast(event: CrossWindowEvent) {
    const payload = { ...event, senderId: CURRENT_WINDOW_ID };
    if (this.channel) {
      try {
        this.channel.postMessage(payload);
      } catch (err) {
        console.warn('Broadcast error:', err);
      }
    }
  }

  public subscribe(listener: (event: CrossWindowEvent) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }
}

export const crossWindowService = new CrossWindowService();
