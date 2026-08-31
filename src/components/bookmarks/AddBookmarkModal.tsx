import React, { useState, useMemo } from 'react';
import { 
  X, 
  Search, 
  Bookmark, 
  BookmarkCheck, 
  Sparkles, 
  BookOpen, 
  User, 
  Users, 
  Swords, 
  Package, 
  Map as MapIcon, 
  FileText, 
  Tag, 
  Dice5,
  Calendar,
  Layers,
  MapPin,
  Target,
  Image as ImageIcon
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BookmarkType } from '../../types/bookmark';
import { searchHandbook } from '../../services/handbookService';
import { TokenAvatar } from '../common/TokenAvatar';

interface SearchResultItem {
  id: string;
  type: BookmarkType;
  title: string;
  subtitle: string;
  category: string;
  imageUrl?: string;
  campaignId?: string | null;
  metadata?: Record<string, any>;
}

interface AddBookmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSessionTag?: string;
}

export const AddBookmarkModal: React.FC<AddBookmarkModalProps> = ({
  isOpen,
  onClose,
  defaultSessionTag = '',
}) => {
  const { 
    db, 
    activeCampaignId, 
    isBookmarked, 
    toggleBookmark, 
    bookmarks 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'notes' | 'compendium' | 'party' | 'maps' | 'rules'>('all');
  const [sessionTag, setSessionTag] = useState(defaultSessionTag);
  const [customNote, setCustomNote] = useState('');

  const activeCampaign = db.campaigns.find((c) => c.id === activeCampaignId);

  // Index and aggregate all entities across the entire application
  const results: SearchResultItem[] = useMemo(() => {
    if (!isOpen) return [];

    const q = searchQuery.toLowerCase().trim();
    const items: SearchResultItem[] = [];

    // 1. Campaign Notes & Lore
    const campaignNotes = (activeCampaign?.notes || []);
    for (const note of campaignNotes) {
      if (!q || note.name.toLowerCase().includes(q) || (note.category && note.category.toLowerCase().includes(q))) {
        items.push({
          id: note.id,
          type: note.category === 'Image' ? 'image' : (note.category === 'NPC' ? 'npc' : (note.category === 'Lore' ? 'lore' : 'note')),
          title: note.name,
          subtitle: `${note.category || 'Note'} • ${activeCampaign?.name || 'Campaign'}`,
          category: note.category || 'Note',
          imageUrl: note.imageUrl,
          campaignId: activeCampaignId,
        });
      }
    }

    // 2. Party Heroes
    for (const player of db.players) {
      if (!q || player.name.toLowerCase().includes(q) || player.characterClass.toLowerCase().includes(q) || player.race.toLowerCase().includes(q)) {
        items.push({
          id: player.id,
          type: 'player',
          title: player.name,
          subtitle: `Lv ${player.level} ${player.race} ${player.characterClass} • AC ${player.armorClass} • HP ${player.currentHp}/${player.maxHp}`,
          category: 'Hero',
          imageUrl: player.avatarUrl || player.tokenUrl,
        });
      }
    }

    // 3. Monsters & Bestiary
    for (const monster of db.monsters) {
      if (!q || monster.name.toLowerCase().includes(q) || monster.monsterType.toLowerCase().includes(q)) {
        items.push({
          id: monster.id,
          type: monster.isNpc ? 'npc' : 'monster',
          title: monster.name,
          subtitle: `${monster.size} ${monster.monsterType} • CR ${monster.challengeRating} • AC ${monster.armorClass} • HP ${monster.hitPoints}`,
          category: monster.isNpc ? 'NPC' : 'Monster',
          imageUrl: monster.avatarUrl || monster.imageUrl,
        });
      }
    }

    // 4. Spells
    for (const spell of db.spells) {
      if (!q || spell.name.toLowerCase().includes(q) || (spell.school && spell.school.toLowerCase().includes(q))) {
        items.push({
          id: spell.id,
          type: 'spell',
          title: spell.name,
          subtitle: `${spell.level === 0 ? 'Cantrip' : `Level ${spell.level} Spell`} • ${spell.school || 'Magic'} • ${spell.castingTime || '1 action'}`,
          category: 'Spell',
        });
      }
    }

    // 5. Items
    for (const item of db.items) {
      if (!q || item.name.toLowerCase().includes(q) || item.itemType.toLowerCase().includes(q)) {
        items.push({
          id: item.id,
          type: 'item',
          title: item.name,
          subtitle: `${item.rarity || 'Common'} ${item.itemType || 'Item'}${item.value ? ` • ${item.value}` : ''}`,
          category: 'Item',
          imageUrl: item.imageUrl,
        });
      }
    }

    // 6. Battle Maps
    for (const map of db.maps) {
      if (!q || map.name.toLowerCase().includes(q)) {
        items.push({
          id: map.id,
          type: 'map',
          title: map.name,
          subtitle: `Battle Map (${map.width || 2000}x${map.height || 2000}px)`,
          category: 'Map',
          imageUrl: map.imageUrl,
        });
      }
    }

    // 7. Roll Tables
    for (const table of db.tables) {
      if (!q || table.name.toLowerCase().includes(q) || (table.description && table.description.toLowerCase().includes(q))) {
        items.push({
          id: table.id,
          type: 'table',
          title: table.name,
          subtitle: `Roll Table • ${table.diceFormula || 'd20'} • ${table.items?.length || 0} entries`,
          category: 'Roll Table',
        });
      }
    }

    // 8. Handbook Chapters & Rules
    if (q) {
      const handbookMatches = searchHandbook(
        q, 
        undefined, 
        db.customBooks, 
        db.handbookOverrides, 
        db.handbookCustomEntries,
        db.customSubclasses,
        db.customSpecies,
        db.customBackgrounds,
        db.customFeats
      );
      for (const res of handbookMatches.slice(0, 15)) {
        items.push({
          id: res.chapterId || res.entityId || res.title,
          type: 'rule',
          title: res.title,
          subtitle: `Handbook: ${res.subtitle || res.type} (${res.bookId})`,
          category: 'Rule',
          metadata: {
            bookId: res.bookId,
            category: res.type,
            entityId: res.entityId,
          },
        });
      }
    }

    return items;
  }, [isOpen, searchQuery, activeCampaign, db, activeCampaignId]);

  const filteredResults = useMemo(() => {
    if (activeFilter === 'all') return results;
    if (activeFilter === 'notes') return results.filter((r) => r.type === 'note' || r.type === 'lore' || r.type === 'image');
    if (activeFilter === 'compendium') return results.filter((r) => r.type === 'monster' || r.type === 'spell' || r.type === 'item' || r.type === 'table' || r.type === 'npc');
    if (activeFilter === 'party') return results.filter((r) => r.type === 'player');
    if (activeFilter === 'maps') return results.filter((r) => r.type === 'map');
    if (activeFilter === 'rules') return results.filter((r) => r.type === 'rule');
    return results;
  }, [results, activeFilter]);

  if (!isOpen) return null;

  const handleToggle = (item: SearchResultItem) => {
    toggleBookmark({
      type: item.type,
      targetId: item.id,
      title: item.title,
      subtitle: item.subtitle,
      category: item.category,
      imageUrl: item.imageUrl,
      campaignId: item.campaignId !== undefined ? item.campaignId : activeCampaignId,
      sessionTag: sessionTag.trim() || undefined,
      notes: customNote.trim() || undefined,
      metadata: item.metadata,
    });
  };

  const getTypeIcon = (type: BookmarkType) => {
    switch (type) {
      case 'note':
      case 'lore':
        return <FileText className="w-4 h-4 text-sky-400" />;
      case 'image':
        return <ImageIcon className="w-4 h-4 text-pink-400" />;
      case 'npc':
        return <User className="w-4 h-4 text-amber-400" />;
      case 'player':
        return <Users className="w-4 h-4 text-emerald-400" />;
      case 'monster':
        return <Swords className="w-4 h-4 text-red-400" />;
      case 'spell':
        return <Sparkles className="w-4 h-4 text-purple-400" />;
      case 'item':
        return <Package className="w-4 h-4 text-amber-300" />;
      case 'map':
        return <MapIcon className="w-4 h-4 text-cyan-400" />;
      case 'table':
        return <Dice5 className="w-4 h-4 text-indigo-400" />;
      case 'rule':
        return <BookOpen className="w-4 h-4 text-yellow-400" />;
      default:
        return <Bookmark className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl bg-[#0d1219] border border-surface-border rounded-xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border bg-surface-100/60">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-sm">
              <Bookmark className="w-4 h-4 fill-amber-400/20" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-slate-100">Add Quick Session Bookmark</h2>
              <p className="text-xs text-slate-400">Search notes, lore, monsters, spells, heroes, maps or rules to pin for quick access</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-surface-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options: Session Tag & Notes */}
        <div className="px-5 py-3 bg-surface-50/40 border-b border-surface-border grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1 flex items-center space-x-1">
              <Tag className="w-3 h-3 text-amber-400" />
              <span>Attach Session Tag (Optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Session 14, Dungeon Boss, Tavern Clues"
              value={sessionTag}
              onChange={(e) => setSessionTag(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-surface-100/90 border border-surface-border rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1 flex items-center space-x-1">
              <FileText className="w-3 h-3 text-sky-400" />
              <span>GM Quick Note / Reminder (Optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Vulnerable to fire, has key to chest"
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-surface-100/90 border border-surface-border rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="px-5 py-3 border-b border-surface-border bg-surface-100/30 space-y-2.5">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search everything (Fireball, Goblin, Castle Map, Level 1 Rules, Hero name)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              className="w-full pl-10 pr-4 py-2 text-sm bg-surface-100 border border-surface-border rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/50"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs select-none">
            {[
              { id: 'all', label: 'All Items' },
              { id: 'notes', label: 'Notes & Lore' },
              { id: 'compendium', label: 'Monsters & Spells & Items' },
              { id: 'party', label: 'Party Heroes' },
              { id: 'maps', label: 'Maps' },
              { id: 'rules', label: 'Handbook Rules' },
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id as any)}
                className={`px-2.5 py-1 rounded-md transition-all text-xs font-medium ${
                  activeFilter === filter.id
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'bg-surface-50/70 hover:bg-surface-hover text-slate-400 hover:text-slate-200 border border-surface-border'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 divide-y divide-surface-border/40">
          {filteredResults.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm space-y-2">
              <Bookmark className="w-8 h-8 mx-auto text-slate-600 stroke-1" />
              <p>No resources found matching "{searchQuery}"</p>
              <p className="text-xs text-slate-600">Try searching for a spell name, monster, campaign note, character, or rule keyword.</p>
            </div>
          ) : (
            filteredResults.map((item) => {
              const bookmarked = isBookmarked(item.id, item.type);
              return (
                <div
                  key={`${item.type}-${item.id}`}
                  className="pt-1.5 first:pt-0"
                >
                  <div className="flex items-center justify-between p-2.5 rounded-lg hover:bg-surface-50/80 transition-colors group">
                    <div className="flex items-center space-x-3 min-w-0 pr-3">
                      {/* Avatar / Thumbnail or Type Icon */}
                      {item.imageUrl ? (
                        <div className="w-9 h-9 rounded-lg overflow-hidden border border-surface-border bg-surface-200 shrink-0">
                          <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-surface-100 border border-surface-border flex items-center justify-center shrink-0 shadow-sm">
                          {getTypeIcon(item.type)}
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-xs font-semibold text-slate-200 truncate group-hover:text-amber-300 transition-colors">
                            {item.title}
                          </h4>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-surface-100 text-slate-400 border border-surface-border shrink-0">
                            {item.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggle(item)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all shrink-0 ${
                        bookmarked
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm hover:bg-amber-500/30'
                          : 'bg-surface-100 hover:bg-surface-hover text-slate-300 hover:text-white border border-surface-border'
                      }`}
                    >
                      {bookmarked ? (
                        <>
                          <BookmarkCheck className="w-3.5 h-3.5 text-amber-400 fill-amber-400/30" />
                          <span>Bookmarked</span>
                        </>
                      ) : (
                        <>
                          <Bookmark className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-400" />
                          <span>Bookmark</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-surface-border bg-surface-100/60 flex items-center justify-between text-xs text-slate-400">
          <span>{filteredResults.length} matching resources • {bookmarks.length} currently bookmarked</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-surface-50 hover:bg-surface-hover border border-surface-border text-slate-200 font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
