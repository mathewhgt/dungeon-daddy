import { BaseEntity } from './entity';

export type NoteCategory = 'Session' | 'Lore' | 'NPC' | 'Location' | 'Quest' | 'Handout' | 'Folder';

export interface NoteCategoryStyle {
  label: NoteCategory;
  iconName: string;
  colorHex: string;
  textClass: string;
  bgClass: string;
  borderClass: string;
  selectedBgClass: string;
  selectedBorderClass: string;
}

export const NOTE_CATEGORIES: Record<NoteCategory, NoteCategoryStyle> = {
  NPC: {
    label: 'NPC',
    iconName: 'User',
    colorHex: '#f59e0b',
    textClass: 'text-amber-400',
    bgClass: 'bg-amber-950/40',
    borderClass: 'border-amber-700/60',
    selectedBgClass: 'bg-amber-500/20',
    selectedBorderClass: 'border-amber-500',
  },
  Session: {
    label: 'Session',
    iconName: 'Calendar',
    colorHex: '#38bdf8',
    textClass: 'text-sky-400',
    bgClass: 'bg-sky-950/40',
    borderClass: 'border-sky-700/60',
    selectedBgClass: 'bg-sky-500/20',
    selectedBorderClass: 'border-sky-500',
  },
  Location: {
    label: 'Location',
    iconName: 'MapPin',
    colorHex: '#34d399',
    textClass: 'text-emerald-400',
    bgClass: 'bg-emerald-950/40',
    borderClass: 'border-emerald-700/60',
    selectedBgClass: 'bg-emerald-500/20',
    selectedBorderClass: 'border-emerald-500',
  },
  Quest: {
    label: 'Quest',
    iconName: 'Target',
    colorHex: '#f87171',
    textClass: 'text-rose-400',
    bgClass: 'bg-rose-950/40',
    borderClass: 'border-rose-700/60',
    selectedBgClass: 'bg-rose-500/20',
    selectedBorderClass: 'border-rose-500',
  },
  Lore: {
    label: 'Lore',
    iconName: 'BookOpen',
    colorHex: '#c084fc',
    textClass: 'text-purple-400',
    bgClass: 'bg-purple-950/40',
    borderClass: 'border-purple-700/60',
    selectedBgClass: 'bg-purple-500/20',
    selectedBorderClass: 'border-purple-500',
  },
  Handout: {
    label: 'Handout',
    iconName: 'FileText',
    colorHex: '#2dd4bf',
    textClass: 'text-teal-400',
    bgClass: 'bg-teal-950/40',
    borderClass: 'border-teal-700/60',
    selectedBgClass: 'bg-teal-500/20',
    selectedBorderClass: 'border-teal-500',
  },
  Folder: {
    label: 'Folder',
    iconName: 'Folder',
    colorHex: '#fbbf24',
    textClass: 'text-amber-300',
    bgClass: 'bg-surface-50',
    borderClass: 'border-surface-border',
    selectedBgClass: 'bg-amber-500/15',
    selectedBorderClass: 'border-amber-500/50',
  },
};

export interface CampaignNote extends BaseEntity {
  type: 'campaignNote';
  campaignId: string;
  category: NoteCategory;
  content: string; // Markdown formatted with custom blocks
  isPlayerVisible: boolean;
  parentId?: string | null; // null/undefined means root level
  isFolder: boolean;
  order?: number;
  icon?: string;
  color?: string;
}

export interface CampaignEntity extends BaseEntity {
  description: string;
  playerCharacterIds: string[];
  currentLocation?: string;
  inGameDate?: string;
  notes?: CampaignNote[];
  encounterIds?: string[];
  bannerUrl?: string;
}
