import React, { useState, useMemo } from 'react';
import { 
  X, 
  Search, 
  Bookmark, 
  BookmarkCheck, 
  Pin, 
  Plus, 
  Trash2, 
  ExternalLink, 
  Tv, 
  FileText, 
  Image as ImageIcon, 
  User, 
  Users, 
  Swords, 
  Sparkles, 
  Package, 
  Map as MapIcon, 
  BookOpen, 
  Dice5, 
  Tag, 
  Edit3, 
  Check, 
  ChevronDown, 
  ChevronRight, 
  Eye, 
  Filter,
  Layers,
  Sparkle,
  Dices,
  RotateCcw
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BookmarkItem, BookmarkType } from '../../types/bookmark';
import { AddBookmarkModal } from './AddBookmarkModal';
import { NoteContentRenderer } from '../notes/NoteEntityPopover';
import { TokenAvatar } from '../common/TokenAvatar';

export const BookmarksDrawer: React.FC = () => {
  const { 
    bookmarks, 
    isBookmarksDrawerOpen, 
    setIsBookmarksDrawerOpen, 
    removeBookmark, 
    updateBookmark, 
    openBookmark, 
    clearBookmarks, 
    db, 
    activeCampaignId, 
    projectMediaToDisplay 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedSessionTag, setSelectedSessionTag] = useState<string>('all');
  const [campaignScope, setCampaignScope] = useState<'current' | 'all'>('current');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [expandedPreviewId, setExpandedPreviewId] = useState<string | null>(null);

  // Quick editing inline session tag or GM note
  const [editingBookmarkId, setEditingBookmarkId] = useState<string | null>(null);
  const [editSessionTag, setEditSessionTag] = useState('');
  const [editNotes, setEditNotes] = useState('');

  const activeCampaign = db.campaigns.find((c) => c.id === activeCampaignId);

  // Extract all unique session tags currently in bookmarks
  const availableSessionTags = useMemo(() => {
    const tags = new Set<string>();
    for (const b of bookmarks) {
      if (b.sessionTag && b.sessionTag.trim()) {
        tags.add(b.sessionTag.trim());
      }
    }
    return Array.from(tags);
  }, [bookmarks]);

  // Filtered bookmarks
  const filteredBookmarks = useMemo(() => {
    return bookmarks.filter((b) => {
      // 1. Campaign Scope Filter
      if (campaignScope === 'current' && b.campaignId && activeCampaignId && b.campaignId !== activeCampaignId) {
        return false;
      }

      // 2. Category Filter
      if (activeCategory === 'pinned' && !b.pinned) return false;
      if (activeCategory === 'notes' && !(b.type === 'note' || b.type === 'lore')) return false;
      if (activeCategory === 'images' && b.type !== 'image') return false;
      if (activeCategory === 'npcs' && !(b.type === 'npc' || (b.type === 'monster' && b.category === 'NPC'))) return false;
      if (activeCategory === 'monsters' && !(b.type === 'monster' || b.type === 'npc')) return false;
      if (activeCategory === 'heroes' && b.type !== 'player') return false;
      if (activeCategory === 'spells-items' && !(b.type === 'spell' || b.type === 'item')) return false;
      if (activeCategory === 'maps' && b.type !== 'map') return false;
      if (activeCategory === 'rules' && b.type !== 'rule') return false;

      // 3. Session Tag Filter
      if (selectedSessionTag !== 'all' && b.sessionTag !== selectedSessionTag) {
        return false;
      }

      // 4. Text Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = b.title.toLowerCase().includes(q);
        const matchSubtitle = b.subtitle ? b.subtitle.toLowerCase().includes(q) : false;
        const matchNotes = b.notes ? b.notes.toLowerCase().includes(q) : false;
        const matchTag = b.sessionTag ? b.sessionTag.toLowerCase().includes(q) : false;
        const matchCategory = b.category ? b.category.toLowerCase().includes(q) : false;
        if (!matchTitle && !matchSubtitle && !matchNotes && !matchTag && !matchCategory) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [bookmarks, campaignScope, activeCampaignId, activeCategory, selectedSessionTag, searchQuery]);

  if (!isBookmarksDrawerOpen) return null;

  const handleStartEdit = (b: BookmarkItem) => {
    setEditingBookmarkId(b.id);
    setEditSessionTag(b.sessionTag || '');
    setEditNotes(b.notes || '');
  };

  const handleSaveEdit = (b: BookmarkItem) => {
    updateBookmark(b.id, {
      sessionTag: editSessionTag.trim() || undefined,
      notes: editNotes.trim() || undefined,
    });
    setEditingBookmarkId(null);
  };

  const handleTogglePin = (b: BookmarkItem) => {
    updateBookmark(b.id, { pinned: !b.pinned });
  };

  const handleProject = (b: BookmarkItem) => {
    if (b.type === 'image' || b.imageUrl) {
      projectMediaToDisplay({
        id: `project-${b.id}-${Date.now()}`,
        type: 'image',
        title: b.title,
        imageUrl: b.imageUrl || '',
        subtitle: b.subtitle,
      });
    } else if (b.type === 'note' || b.type === 'lore') {
      const note = activeCampaign?.notes?.find((n) => n.id === b.targetId);
      if (note) {
        if (note.imageUrl) {
          projectMediaToDisplay({
            id: note.id,
            type: 'image',
            title: note.name,
            imageUrl: note.imageUrl,
            subtitle: note.caption || note.name,
          });
        } else {
          projectMediaToDisplay({
            id: note.id,
            type: 'note',
            title: note.name,
            content: note.content,
            badge: note.category,
          });
        }
      }
    } else if (b.type === 'map') {
      const map = db.maps.find((m) => m.id === b.targetId);
      if (map && map.imageUrl) {
        projectMediaToDisplay({
          id: map.id,
          type: 'image',
          title: map.name,
          imageUrl: map.imageUrl,
          subtitle: 'Battle Map',
        });
      }
    }
  };

  const getTypeBadge = (type: BookmarkType) => {
    switch (type) {
      case 'note':
      case 'lore':
        return { label: 'Note & Lore', icon: FileText, color: 'text-sky-400', bg: 'bg-sky-950/60 border-sky-800/80' };
      case 'image':
        return { label: 'Image Art', icon: ImageIcon, color: 'text-pink-400', bg: 'bg-pink-950/60 border-pink-800/80' };
      case 'npc':
        return { label: 'NPC', icon: User, color: 'text-amber-400', bg: 'bg-amber-950/60 border-amber-800/80' };
      case 'player':
        return { label: 'Hero', icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-950/60 border-emerald-800/80' };
      case 'monster':
        return { label: 'Monster', icon: Swords, color: 'text-red-400', bg: 'bg-red-950/60 border-red-800/80' };
      case 'spell':
        return { label: 'Spell', icon: Sparkles, color: 'text-purple-400', bg: 'bg-purple-950/60 border-purple-800/80' };
      case 'item':
        return { label: 'Item', icon: Package, color: 'text-amber-300', bg: 'bg-amber-950/60 border-amber-800/80' };
      case 'map':
        return { label: 'Battle Map', icon: MapIcon, color: 'text-cyan-400', bg: 'bg-cyan-950/60 border-cyan-800/80' };
      case 'table':
        return { label: 'Roll Table', icon: Dice5, color: 'text-indigo-400', bg: 'bg-indigo-950/60 border-indigo-800/80' };
      case 'rule':
        return { label: 'Handbook Rule', icon: BookOpen, color: 'text-yellow-400', bg: 'bg-yellow-950/60 border-yellow-800/80' };
      default:
        return { label: 'Resource', icon: Bookmark, color: 'text-slate-400', bg: 'bg-surface-100 border-surface-border' };
    }
  };

  // Render quick preview content inside accordion
  const renderQuickPreview = (b: BookmarkItem) => {
    if (b.type === 'monster' || b.type === 'npc') {
      const monster = db.monsters.find((m) => m.id === b.targetId);
      if (monster) {
        return (
          <div className="p-3 bg-surface-200/90 rounded-lg text-xs space-y-2 border border-surface-border animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-amber-300">{monster.name}</span>
              <span className="text-slate-400">CR {monster.challengeRating} • {monster.size} {monster.monsterType}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 bg-surface-100/80 p-2 rounded border border-surface-border text-center">
              <div><span className="text-slate-400">AC</span> <strong className="text-white">{monster.armorClass}</strong></div>
              <div><span className="text-slate-400">HP</span> <strong className="text-emerald-400">{monster.hitPoints}</strong></div>
              <div><span className="text-slate-400">Speed</span> <strong className="text-slate-200">{monster.speed || '30 ft'}</strong></div>
            </div>
            {monster.traits && monster.traits.length > 0 && (
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Traits:</span>
                {monster.traits.slice(0, 2).map((t, i) => (
                  <div key={i} className="text-slate-300"><strong className="text-amber-400">{t.name}:</strong> {t.desc}</div>
                ))}
              </div>
            )}
            {monster.actions && monster.actions.length > 0 && (
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Key Actions:</span>
                {monster.actions.slice(0, 2).map((a, i) => (
                  <div key={i} className="text-slate-300"><strong className="text-red-400">{a.name}:</strong> {a.desc}</div>
                ))}
              </div>
            )}
          </div>
        );
      }
    }

    if (b.type === 'spell') {
      const spell = db.spells.find((s) => s.id === b.targetId);
      if (spell) {
        return (
          <div className="p-3 bg-surface-200/90 rounded-lg text-xs space-y-2 border border-surface-border animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-purple-300">{spell.name}</span>
              <span className="text-slate-400">{spell.level === 0 ? 'Cantrip' : `Level ${spell.level}`} • {spell.school}</span>
            </div>
            <div className="grid grid-cols-3 gap-1 bg-surface-100/80 p-1.5 rounded border border-surface-border text-[11px]">
              <div><span className="text-slate-400">Cast:</span> {spell.castingTime}</div>
              <div><span className="text-slate-400">Range:</span> {spell.range}</div>
              <div><span className="text-slate-400">Dur:</span> {spell.duration}</div>
            </div>
            <div className="text-slate-300 line-clamp-4 leading-relaxed whitespace-pre-wrap">
              {spell.description}
            </div>
          </div>
        );
      }
    }

    if (b.type === 'item') {
      const item = db.items.find((i) => i.id === b.targetId);
      if (item) {
        return (
          <div className="p-3 bg-surface-200/90 rounded-lg text-xs space-y-2 border border-surface-border animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-amber-300">{item.name}</span>
              <span className="text-slate-400">{item.rarity} {item.itemType}</span>
            </div>
            <div className="text-slate-300 line-clamp-4 leading-relaxed whitespace-pre-wrap">
              {item.description}
            </div>
          </div>
        );
      }
    }

    if (b.type === 'note' || b.type === 'lore') {
      const note = activeCampaign?.notes?.find((n) => n.id === b.targetId);
      if (note) {
        return (
          <div className="p-3 bg-surface-200/90 rounded-lg text-xs space-y-2 border border-surface-border animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sky-300">{note.name}</span>
              <span className="text-slate-400">{note.category}</span>
            </div>
            {note.imageUrl && (
              <div className="max-h-40 rounded overflow-hidden border border-surface-border">
                <img src={note.imageUrl} alt="" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="text-slate-300 line-clamp-5 leading-relaxed">
              <NoteContentRenderer content={note.content} />
            </div>
          </div>
        );
      }
    }

    if (b.type === 'image' || b.imageUrl) {
      return (
        <div className="p-2 bg-surface-200/90 rounded-lg border border-surface-border animate-fadeIn space-y-2">
          <div className="max-h-52 rounded overflow-hidden border border-surface-border flex items-center justify-center bg-black/40">
            <img src={b.imageUrl} alt="" className="max-h-52 object-contain" />
          </div>
          <button
            onClick={() => handleProject(b)}
            className="w-full py-1.5 rounded bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/40 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all"
          >
            <Tv className="w-3.5 h-3.5" />
            <span>Project Image to Player TV / Screen</span>
          </button>
        </div>
      );
    }

    return null;
  };

  return (
    <>
      <div className="fixed inset-y-0 right-0 z-50 w-[420px] max-w-[90vw] bg-[#0c1017] border-l border-surface-border shadow-2xl flex flex-col animate-slideLeft select-none">
        {/* Top Header */}
        <div className="h-12 border-b border-surface-border px-4 flex items-center justify-between bg-surface-100/60 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-sm shadow-amber-500/10">
              <Bookmark className="w-4 h-4 fill-amber-400/30" />
            </div>
            <div>
              <span className="font-serif font-bold text-slate-100 text-sm tracking-wide flex items-center space-x-2">
                <span>Session Bookmarks</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono font-bold">
                  {bookmarks.length}
                </span>
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="p-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center space-x-1 transition-all"
              title="Add Bookmark (+)"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="text-[11px]">Add</span>
            </button>

            <button
              onClick={() => setIsBookmarksDrawerOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-surface-hover transition-colors"
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Campaign Scope & Tag Filters */}
        <div className="p-3 bg-surface-50/50 border-b border-surface-border space-y-2 shrink-0">
          <div className="flex items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1 mr-2">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search bookmarks or notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1 text-xs bg-surface-100 border border-surface-border rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Campaign Scope Toggle */}
            <button
              onClick={() => setCampaignScope(campaignScope === 'current' ? 'all' : 'current')}
              className={`px-2 py-1 rounded text-[11px] font-semibold border transition-all shrink-0 ${
                campaignScope === 'current'
                  ? 'bg-emerald-950/60 border-emerald-700/80 text-emerald-300'
                  : 'bg-surface-100 border-surface-border text-slate-400 hover:text-slate-200'
              }`}
              title="Filter by current campaign vs all campaigns"
            >
              {campaignScope === 'current' ? 'Campaign Only' : 'All Campaigns'}
            </button>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] no-scrollbar">
            {[
              { id: 'all', label: 'All' },
              { id: 'pinned', label: '📌 Pinned' },
              { id: 'notes', label: 'Notes & Lore' },
              { id: 'images', label: 'Images' },
              { id: 'monsters', label: 'Monsters & NPCs' },
              { id: 'heroes', label: 'Heroes' },
              { id: 'spells-items', label: 'Spells & Items' },
              { id: 'maps', label: 'Maps' },
              { id: 'rules', label: 'Rules' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-2 py-0.5 rounded-full whitespace-nowrap font-medium transition-all ${
                  activeCategory === cat.id
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm'
                    : 'bg-surface-100/70 hover:bg-surface-hover text-slate-400 hover:text-slate-200 border border-surface-border'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Session Tag Chips */}
          {availableSessionTags.length > 0 && (
            <div className="flex items-center gap-1 overflow-x-auto pt-0.5 text-[10px] no-scrollbar">
              <span className="text-slate-500 shrink-0 font-medium">Session:</span>
              <button
                onClick={() => setSelectedSessionTag('all')}
                className={`px-2 py-0.5 rounded transition-all ${
                  selectedSessionTag === 'all'
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-semibold'
                    : 'bg-surface-100 text-slate-400 border border-surface-border'
                }`}
              >
                All Sessions
              </button>
              {availableSessionTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedSessionTag(tag)}
                  className={`px-2 py-0.5 rounded whitespace-nowrap transition-all flex items-center space-x-1 ${
                    selectedSessionTag === tag
                      ? 'bg-sky-500/25 text-sky-300 border border-sky-500/50 font-semibold'
                      : 'bg-surface-100 text-slate-400 hover:text-slate-200 border border-surface-border'
                  }`}
                >
                  <Tag className="w-2.5 h-2.5 text-sky-400" />
                  <span>{tag}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Bookmarks List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 divide-y divide-surface-border/30">
          {filteredBookmarks.length === 0 ? (
            <div className="text-center py-16 px-4 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400/70 mx-auto">
                <Bookmark className="w-6 h-6 stroke-1" />
              </div>
              <h3 className="font-serif font-bold text-slate-200 text-sm">No Bookmarks Found</h3>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                Bookmark notes, lore, monsters, spells, heroes, battle maps, and handbook rules anywhere across the app for quick session access.
              </p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 text-xs font-semibold inline-flex items-center space-x-1.5 transition-all shadow-md shadow-amber-950/50"
              >
                <Plus className="w-4 h-4" />
                <span>Quick Add Resource</span>
              </button>
            </div>
          ) : (
            filteredBookmarks.map((b) => {
              const badge = getTypeBadge(b.type);
              const BadgeIcon = badge.icon;
              const isEditing = editingBookmarkId === b.id;
              const isExpanded = expandedPreviewId === b.id;

              return (
                <div
                  key={b.id}
                  className="pt-2 first:pt-0"
                >
                  <div
                    className={`rounded-xl border transition-all duration-200 overflow-hidden ${
                      b.pinned
                        ? 'bg-amber-950/20 border-amber-500/40 shadow-sm shadow-amber-950/30'
                        : 'bg-surface-50/60 hover:bg-surface-50 border-surface-border'
                    }`}
                  >
                    {/* Card Top Row */}
                    <div className="p-2.5 flex items-start justify-between gap-2">
                      <div
                        onClick={() => openBookmark(b)}
                        className="flex items-start space-x-2.5 min-w-0 cursor-pointer flex-1 group"
                      >
                        {/* Avatar Thumbnail or Category Icon */}
                        {b.imageUrl ? (
                          <div className="w-9 h-9 rounded-lg overflow-hidden border border-surface-border bg-surface-200 shrink-0 mt-0.5">
                            <img src={b.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          </div>
                        ) : (
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border ${badge.bg}`}>
                            <BadgeIcon className={`w-4 h-4 ${badge.color}`} />
                          </div>
                        )}

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                            <h4 className="text-xs font-bold text-slate-100 group-hover:text-amber-300 transition-colors truncate max-w-[200px]">
                              {b.title}
                            </h4>
                            <span className={`px-1.5 py-0.2 rounded text-[9px] font-semibold border ${badge.bg} ${badge.color}`}>
                              {badge.label}
                            </span>
                            {b.sessionTag && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-medium bg-sky-950/70 text-sky-300 border border-sky-800 flex items-center space-x-0.5">
                                <Tag className="w-2.5 h-2.5" />
                                <span>{b.sessionTag}</span>
                              </span>
                            )}
                          </div>

                          {b.subtitle && (
                            <p className="text-[11px] text-slate-400 truncate mt-0.5">
                              {b.subtitle}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Top Action Icons */}
                      <div className="flex items-center space-x-0.5 shrink-0">
                        {/* Pin Button */}
                        <button
                          onClick={() => handleTogglePin(b)}
                          className={`p-1 rounded transition-colors ${
                            b.pinned
                              ? 'text-amber-400 hover:text-amber-300 bg-amber-500/20'
                              : 'text-slate-500 hover:text-slate-300 hover:bg-surface-hover'
                          }`}
                          title={b.pinned ? 'Unpin bookmark' : 'Pin to top'}
                        >
                          <Pin className={`w-3.5 h-3.5 ${b.pinned ? 'fill-amber-400 rotate-45' : ''}`} />
                        </button>

                        {/* Quick Peek Accordion Toggle */}
                        <button
                          onClick={() => setExpandedPreviewId(isExpanded ? null : b.id)}
                          className={`p-1 rounded transition-colors ${
                            isExpanded ? 'text-sky-300 bg-sky-500/20' : 'text-slate-500 hover:text-slate-300 hover:bg-surface-hover'
                          }`}
                          title="Quick Peek / Preview"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit Note/Tag */}
                        <button
                          onClick={() => isEditing ? handleSaveEdit(b) : handleStartEdit(b)}
                          className={`p-1 rounded transition-colors ${
                            isEditing ? 'text-emerald-400 bg-emerald-500/20' : 'text-slate-500 hover:text-slate-300 hover:bg-surface-hover'
                          }`}
                          title={isEditing ? 'Save changes' : 'Edit note & session tag'}
                        >
                          {isEditing ? <Check className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
                        </button>

                        {/* Remove */}
                        <button
                          onClick={() => removeBookmark(b.id)}
                          className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-950/40 transition-colors"
                          title="Remove bookmark"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* GM Note display */}
                    {!isEditing && b.notes && (
                      <div className="px-3 pb-2 pt-0.5">
                        <div className="text-[11px] text-amber-200/90 bg-amber-950/30 border border-amber-700/40 px-2 py-1 rounded flex items-start space-x-1.5">
                          <span className="font-bold text-amber-400 shrink-0">GM Note:</span>
                          <span className="italic">{b.notes}</span>
                        </div>
                      </div>
                    )}

                    {/* Inline Editing Form */}
                    {isEditing && (
                      <div className="p-3 bg-surface-100/90 border-t border-surface-border space-y-2 animate-fadeIn">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Session Tag</label>
                          <input
                            type="text"
                            placeholder="e.g. Session 14, Final Encounter"
                            value={editSessionTag}
                            onChange={(e) => setEditSessionTag(e.target.value)}
                            className="w-full px-2.5 py-1 text-xs bg-surface-200 border border-surface-border rounded text-slate-200 focus:outline-none focus:border-amber-500"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">GM Private Note</label>
                          <input
                            type="text"
                            placeholder="Quick reminder or combat trigger"
                            value={editNotes}
                            onChange={(e) => setEditNotes(e.target.value)}
                            className="w-full px-2.5 py-1 text-xs bg-surface-200 border border-surface-border rounded text-slate-200 focus:outline-none focus:border-amber-500"
                          />
                        </div>
                        <div className="flex justify-end space-x-1.5 pt-1">
                          <button
                            onClick={() => setEditingBookmarkId(null)}
                            className="px-2.5 py-1 rounded text-xs text-slate-400 hover:text-slate-200"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveEdit(b)}
                            className="px-3 py-1 rounded bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Quick Peek Accordion Preview */}
                    {isExpanded && (
                      <div className="p-2.5 bg-surface-100/70 border-t border-surface-border">
                        {renderQuickPreview(b)}
                        <div className="mt-2 flex items-center justify-between pt-1">
                          {(b.type === 'image' || b.imageUrl || b.type === 'note' || b.type === 'lore' || b.type === 'map') && (
                            <button
                              onClick={() => handleProject(b)}
                              className="px-2.5 py-1 rounded bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 border border-sky-500/40 text-xs font-semibold flex items-center space-x-1 transition-all"
                            >
                              <Tv className="w-3 h-3" />
                              <span>Project to TV</span>
                            </button>
                          )}
                          <button
                            onClick={() => openBookmark(b)}
                            className="px-3 py-1 rounded bg-surface-200 hover:bg-surface-hover text-slate-200 border border-surface-border text-xs font-semibold flex items-center space-x-1 transition-all ml-auto"
                          >
                            <span>Open Full View</span>
                            <ExternalLink className="w-3 h-3 text-amber-400" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-surface-border bg-surface-100/60 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <span className="font-mono text-[11px]">{filteredBookmarks.length} displayed</span>
          {bookmarks.length > 0 && (
            <button
              onClick={() => {
                if (confirm('Clear all session bookmarks?')) {
                  clearBookmarks();
                }
              }}
              className="text-slate-500 hover:text-red-400 text-xs flex items-center space-x-1 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear All</span>
            </button>
          )}
        </div>
      </div>

      {/* Add Bookmark Universal Search Modal */}
      <AddBookmarkModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        defaultSessionTag={selectedSessionTag !== 'all' ? selectedSessionTag : ''}
      />
    </>
  );
};
