export type BookmarkType = 
  | 'note' 
  | 'lore' 
  | 'image' 
  | 'npc' 
  | 'player' 
  | 'monster' 
  | 'spell' 
  | 'item' 
  | 'table' 
  | 'map' 
  | 'rule';

export interface BookmarkItem {
  id: string;
  type: BookmarkType;
  targetId: string;
  title: string;
  subtitle?: string;
  category?: string;
  imageUrl?: string;
  campaignId?: string | null;
  sessionTag?: string;
  notes?: string;
  pinned?: boolean;
  colorHex?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}
