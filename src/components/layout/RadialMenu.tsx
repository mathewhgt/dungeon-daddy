import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  BookOpen, 
  Swords, 
  ShieldAlert, 
  Users, 
  FileText,
  FileSpreadsheet, 
  Dices, 
  Settings, 
  X,
  Sparkles,
  Wrench,
  BookMarked,
  Map as MapIcon,
  Search,
  Zap,
  Award,
  Compass,
  Shield,
  Scroll,
  ArrowRight,
  Flame,
  Globe
} from 'lucide-react';
import { useApp, MainNavTab } from '../../context/AppContext';
import { searchHandbook } from '../../services/handbookService';
import { MonsterEntity } from '../../types/monster';
import { SpellEntity } from '../../types/spell';
import { ItemEntity } from '../../types/item';

interface RadialSlice {
  id: MainNavTab;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  glowColor: string;
  angle: number; // in degrees
}

interface GlobalSearchResult {
  id: string;
  title: string;
  category: 'monster' | 'npc' | 'spell' | 'item' | 'note' | 'map' | 'encounter' | 'table' | 'player' | 'handbook' | 'customBook';
  categoryLabel: string;
  categoryColor: string;
  subtitle?: string;
  targetTab: MainNavTab;
  compendiumTab?: 'monsters' | 'npcs' | 'spells' | 'items' | 'tables';
  monsterEntity?: MonsterEntity;
  spellEntity?: SpellEntity;
  itemEntity?: ItemEntity;
  mapId?: string;
  noteId?: string;
  bookId?: string;
  chapterId?: string;
  subheadingId?: string;
  entityId?: string;
  handbookCategory?: 'chapters' | 'classes' | 'species' | 'backgrounds' | 'feats' | 'masteries' | 'conditions' | 'bookmarks';
}

export const RadialMenu: React.FC = () => {
  const { 
    db,
    isRadialMenuOpen, 
    setIsRadialMenuOpen, 
    setActiveTab, 
    setCompendiumSubTab,
    setHandbookTarget,
    combatState, 
    setIsDiceDrawerOpen,
    setActiveMapId,
    activeCampaignId,
    setSelectedMonster,
    setSelectedSpell,
    setSelectedItem,
    setSelectedNoteId,
    setSelectedPlayerId,
  } = useApp();

  const [hoveredSlice, setHoveredSlice] = useState<RadialSlice | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResultIndex, setSelectedResultIndex] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus search input when radial menu opens
  useEffect(() => {
    if (isRadialMenuOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      setSearchQuery('');
    }
  }, [isRadialMenuOpen]);

  // Global Search indexing across all database collections and handbook
  const searchResults: GlobalSearchResult[] = useMemo(() => {
    if (!searchQuery || !searchQuery.trim()) return [];

    const q = searchQuery.toLowerCase().trim();
    const results: GlobalSearchResult[] = [];

    // 1. Spells (High priority match for spells like Fireball)
    for (const sp of (db.spells || [])) {
      if (sp.name.toLowerCase().includes(q) || (sp.school && sp.school.toLowerCase().includes(q))) {
        results.push({
          id: sp.id,
          title: sp.name,
          category: 'spell',
          categoryLabel: sp.level === 0 ? 'Cantrip' : `Lvl ${sp.level} Spell`,
          categoryColor: '#a855f7',
          subtitle: `${sp.school || 'Magic'} · ${sp.castingTime || '1 action'} · ${sp.range || 'Self'}`,
          targetTab: 'compendium',
          compendiumTab: 'spells',
          spellEntity: sp,
        });
      }
    }

    // 2. Monsters & NPCs
    for (const m of (db.monsters || [])) {
      const isNpc = m.monsterType?.toLowerCase().includes('npc') || m.tags?.some((t) => t.toLowerCase().includes('npc'));
      if (m.name.toLowerCase().includes(q) || (m.monsterType && m.monsterType.toLowerCase().includes(q))) {
        results.push({
          id: m.id,
          title: m.name,
          category: isNpc ? 'npc' : 'monster',
          categoryLabel: isNpc ? 'NPC' : `CR ${m.challengeRating || '0'}`,
          categoryColor: isNpc ? '#38bdf8' : '#ef4444',
          subtitle: `${m.size || ''} ${m.monsterType || 'creature'} · AC ${m.armorClass || 10} · HP ${m.hitPoints || 10}`,
          targetTab: 'compendium',
          compendiumTab: isNpc ? 'npcs' : 'monsters',
          monsterEntity: m,
        });
      }
    }

    // 3. Items
    for (const it of (db.items || [])) {
      if (it.name.toLowerCase().includes(q) || (it.itemType && it.itemType.toLowerCase().includes(q))) {
        results.push({
          id: it.id,
          title: it.name,
          category: 'item',
          categoryLabel: it.rarity || 'Item',
          categoryColor: '#10b981',
          subtitle: `${it.itemType || 'Gear'} ${it.value ? `· ${it.value}` : ''}`,
          targetTab: 'compendium',
          compendiumTab: 'items',
          itemEntity: it,
        });
      }
    }

    // 4. Player's Handbook (2024), Custom Books & Entries
    const hbMatches = searchHandbook(q, undefined, db.customBooks || [], db.handbookOverrides || {}, db.handbookCustomEntries || []);
    for (const hb of hbMatches.slice(0, 10)) {
      let hbCategory: GlobalSearchResult['handbookCategory'] = 'chapters';
      if (hb.type === 'class') hbCategory = 'classes';
      else if (hb.type === 'species') hbCategory = 'species';
      else if (hb.type === 'background') hbCategory = 'backgrounds';
      else if (hb.type === 'feat') hbCategory = 'feats';
      else if (hb.type === 'condition') hbCategory = 'conditions';
      else if (hb.type === 'mastery') hbCategory = 'masteries';

      results.push({
        id: hb.entityId || hb.chapterId || hb.title,
        title: hb.title,
        category: 'handbook',
        categoryLabel: hb.type.toUpperCase(),
        categoryColor: '#c084fc',
        subtitle: hb.subtitle || hb.snippet || 'Rule Reference',
        targetTab: 'handbook',
        bookId: hb.bookId,
        chapterId: hb.chapterId,
        subheadingId: hb.subheadingId,
        entityId: hb.entityId,
        handbookCategory: hbCategory,
      });
    }

    // 5. Battle Maps
    for (const mp of (db.maps || [])) {
      if (mp.name.toLowerCase().includes(q)) {
        results.push({
          id: mp.id,
          title: mp.name,
          category: 'map',
          categoryLabel: 'Battle Map',
          categoryColor: '#14b8a6',
          subtitle: `${mp.tokens?.length || 0} tokens placed`,
          targetTab: 'maps',
          mapId: mp.id,
        });
      }
    }

    // 6. Campaign Notes
    const activeCamp = (db.campaigns || []).find((c) => c.id === activeCampaignId) || db.campaigns?.[0];
    if (activeCamp?.notes) {
      for (const nt of activeCamp.notes) {
        if (nt.name.toLowerCase().includes(q) || (nt.content && nt.content.toLowerCase().includes(q))) {
          results.push({
            id: nt.id,
            title: nt.name,
            category: 'note',
            categoryLabel: nt.isFolder ? 'Folder' : 'Note',
            categoryColor: '#06b6d4',
            subtitle: nt.category || 'Campaign Lore',
            targetTab: 'notes',
            noteId: nt.id,
          });
        }
      }
    }

    // 7. Encounters
    for (const enc of (db.encounters || [])) {
      if (enc.name.toLowerCase().includes(q)) {
        results.push({
          id: enc.id,
          title: enc.name,
          category: 'encounter',
          categoryLabel: 'Encounter',
          categoryColor: '#f59e0b',
          subtitle: `${enc.monsters?.length || 0} monster groups`,
          targetTab: 'encounters',
        });
      }
    }

    // 8. Players
    for (const pl of (db.players || [])) {
      if (pl.name.toLowerCase().includes(q) || (pl.characterClass && pl.characterClass.toLowerCase().includes(q))) {
        results.push({
          id: pl.id,
          title: pl.name,
          category: 'player',
          categoryLabel: 'Hero',
          categoryColor: '#22c55e',
          subtitle: `Lvl ${pl.level || 1} ${pl.race || ''} ${pl.characterClass || ''}`,
          targetTab: 'party',
        });
      }
    }

    return results.slice(0, 15);
  }, [searchQuery, db, activeCampaignId]);

  if (!isRadialMenuOpen) return null;

  const slices: RadialSlice[] = [
    {
      id: 'compendium',
      title: 'Compendium',
      subtitle: 'Monsters, Spells & Items',
      icon: BookOpen,
      color: '#3b82f6', // blue
      glowColor: 'rgba(59, 130, 246, 0.4)',
      angle: -90,
    },
    {
      id: 'party',
      title: 'Party & Heroes',
      subtitle: 'Player characters & rests',
      icon: Users,
      color: '#10b981', // emerald
      glowColor: 'rgba(16, 185, 129, 0.4)',
      angle: -54,
    },
    {
      id: 'notes',
      title: 'Notes & Lore',
      subtitle: 'Folders, logs & handouts',
      icon: FileText,
      color: '#06b6d4', // cyan
      glowColor: 'rgba(6, 182, 212, 0.4)',
      angle: -18,
    },
    {
      id: 'encounters',
      title: 'Encounter Builder',
      subtitle: 'Build & budget fights',
      icon: Swords,
      color: '#f59e0b', // amber
      glowColor: 'rgba(245, 158, 11, 0.4)',
      angle: 18,
    },
    {
      id: 'combat',
      title: 'Combat Tracker',
      subtitle: combatState.isActive ? `Active (Round ${combatState.round})` : 'Initiative & HP tracker',
      icon: ShieldAlert,
      color: '#ef4444', // red
      glowColor: 'rgba(239, 68, 68, 0.4)',
      angle: 54,
    },
    {
      id: 'maps',
      title: 'Battle Maps',
      subtitle: '2D VTT & Line of Sight',
      icon: MapIcon,
      color: '#14b8a6', // teal
      glowColor: 'rgba(20, 184, 166, 0.4)',
      angle: 90,
    },
    {
      id: 'tools',
      title: 'DM Tools',
      subtitle: '5e NPC Generator',
      icon: Wrench,
      color: '#d97706', // amber-600
      glowColor: 'rgba(217, 119, 6, 0.4)',
      angle: 126,
    },
    {
      id: 'handbook',
      title: 'Rules & Handbook',
      subtitle: '5e 2024 Reference & Homebrew',
      icon: BookMarked,
      color: '#a855f7', // purple
      glowColor: 'rgba(168, 85, 247, 0.4)',
      angle: 162,
    },
    {
      id: 'templates',
      title: 'Template & CSV',
      subtitle: 'CSV import/export & schemas',
      icon: FileSpreadsheet,
      color: '#8b5cf6', // indigo
      glowColor: 'rgba(139, 92, 246, 0.4)',
      angle: 198,
    },
    {
      id: 'settings',
      title: 'Settings & Data',
      subtitle: 'Backups & snapshots',
      icon: Settings,
      color: '#64748b', // slate
      glowColor: 'rgba(100, 116, 139, 0.4)',
      angle: 234,
    },
  ];

  const handleSelect = (slice: RadialSlice) => {
    if (slice.id === 'dice') {
      setIsDiceDrawerOpen(true);
    } else {
      setActiveTab(slice.id);
    }
    setIsRadialMenuOpen(false);
  };

  const handleSelectSearchResult = (result: GlobalSearchResult) => {
    if (result.targetTab === 'compendium') {
      if (result.compendiumTab) {
        setCompendiumSubTab(result.compendiumTab);
      }
      if (result.monsterEntity) {
        setSelectedMonster(result.monsterEntity);
      }
      if (result.spellEntity) {
        setSelectedSpell(result.spellEntity);
      }
      if (result.itemEntity) {
        setSelectedItem(result.itemEntity);
      }
      setActiveTab('compendium');
    } else if (result.targetTab === 'handbook') {
      setHandbookTarget({
        bookId: result.bookId,
        chapterId: result.chapterId,
        subheadingId: result.subheadingId,
        category: result.handbookCategory || 'chapters',
        entityId: result.entityId,
      });
      setActiveTab('handbook');
    } else if (result.targetTab === 'maps') {
      if (result.mapId) {
        setActiveMapId(result.mapId);
      }
      setActiveTab('maps');
    } else if (result.targetTab === 'party') {
      setSelectedPlayerId(result.id);
      setActiveTab('party');
    } else if (result.targetTab === 'notes') {
      setSelectedNoteId(result.id);
      setActiveTab('notes');
    } else {
      setActiveTab(result.targetTab);
    }

    setIsRadialMenuOpen(false);
  };

  // Geometry: Significantly larger dimensions (w-620px, outerRadius 255)
  const centerRadius = 85;
  const outerRadius = 255;
  const centerX = 310;
  const centerY = 310;
  const sliceAngle = 360 / slices.length;

  const createArc = (startAngleDeg: number, endAngleDeg: number) => {
    const startRad = ((startAngleDeg - 90) * Math.PI) / 180;
    const endRad = ((endAngleDeg - 90) * Math.PI) / 180;

    const x1 = centerX + outerRadius * Math.cos(startRad);
    const y1 = centerY + outerRadius * Math.sin(startRad);
    const x2 = centerX + outerRadius * Math.cos(endRad);
    const y2 = centerY + outerRadius * Math.sin(endRad);

    const x3 = centerX + centerRadius * Math.cos(endRad);
    const y3 = centerY + centerRadius * Math.sin(endRad);
    const x4 = centerX + centerRadius * Math.cos(startRad);
    const y4 = centerY + centerRadius * Math.sin(startRad);

    const largeArcFlag = endAngleDeg - startAngleDeg <= 180 ? '0' : '1';

    return `M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${x3} ${y3} A ${centerRadius} ${centerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4} Z`;
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-lg animate-fadeIn p-4 overflow-y-auto"
      onClick={() => setIsRadialMenuOpen(false)}
    >
      <div 
        className="relative flex flex-col items-center select-none max-w-2xl w-full my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Global Search Bar at Top */}
        <div className="w-full max-w-lg mb-6 relative z-10">
          <div className="relative shadow-2xl">
            <Search className="w-4 h-4 text-amber-400 absolute left-3.5 top-3.5 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  if (searchQuery) setSearchQuery('');
                  else setIsRadialMenuOpen(false);
                } else if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  setSelectedResultIndex((prev) => (prev + 1) % Math.max(1, searchResults.length));
                } else if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  setSelectedResultIndex((prev) => (prev - 1 + searchResults.length) % Math.max(1, searchResults.length));
                } else if (e.key === 'Enter' && searchResults[selectedResultIndex]) {
                  handleSelectSearchResult(searchResults[selectedResultIndex]);
                }
              }}
              placeholder="Global Search (monsters, spells, items, rules, notes, maps, classes)..."
              className="w-full bg-[#161b22]/95 border-2 border-amber-500/50 focus:border-amber-400 rounded-2xl pl-10 pr-10 py-3 text-sm text-slate-100 placeholder-slate-400 focus:outline-none shadow-xl backdrop-blur-md transition-all font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-100 text-sm font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Search Dropdown Results List */}
          {searchQuery && (
            <div className="absolute left-0 right-0 top-14 mt-1 bg-[#161b22] border border-surface-border rounded-2xl shadow-2xl overflow-hidden max-h-80 overflow-y-auto divide-y divide-surface-border z-50">
              {searchResults.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 italic">
                  No matching monsters, spells, rules, notes, or items found for &quot;{searchQuery}&quot;.
                </div>
              ) : (
                searchResults.map((res, idx) => (
                  <button
                    key={res.id + idx}
                    onClick={() => handleSelectSearchResult(res)}
                    className={`w-full text-left p-3 flex items-center justify-between transition-colors ${
                      idx === selectedResultIndex ? 'bg-amber-500/20 text-white' : 'hover:bg-surface-hover/80 text-slate-300'
                    }`}
                  >
                    <div className="space-y-0.5 truncate pr-3">
                      <div className="font-semibold text-xs text-slate-100 flex items-center space-x-2">
                        <span className="truncate">{res.title}</span>
                      </div>
                      {res.subtitle && (
                        <div className="text-[11px] text-slate-400 truncate">
                          {res.subtitle}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <span 
                        style={{ color: res.categoryColor, borderColor: `${res.categoryColor}40`, backgroundColor: `${res.categoryColor}15` }}
                        className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border font-mono"
                      >
                        {res.categoryLabel}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Large Radial Wheel SVG Container */}
        <div className="relative w-[620px] h-[620px]">
          <svg className="w-full h-full filter drop-shadow-[0_0_35px_rgba(0,0,0,0.9)]">
            {slices.map((slice, index) => {
              const startAngle = index * sliceAngle;
              const endAngle = startAngle + sliceAngle;
              const midAngle = startAngle + sliceAngle / 2;
              const midRad = ((midAngle - 90) * Math.PI) / 180;
              const iconRadius = (centerRadius + outerRadius) / 2;
              const iconX = centerX + iconRadius * Math.cos(midRad);
              const iconY = centerY + iconRadius * Math.sin(midRad);
              const isHovered = hoveredSlice?.id === slice.id;

              return (
                <g 
                  key={slice.id}
                  className="cursor-pointer transition-all duration-200"
                  onMouseEnter={() => setHoveredSlice(slice)}
                  onMouseLeave={() => setHoveredSlice(null)}
                  onClick={() => handleSelect(slice)}
                >
                  <path
                    d={createArc(startAngle, endAngle)}
                    fill={isHovered ? slice.color : '#161b22'}
                    fillOpacity={isHovered ? 0.35 : 0.88}
                    stroke={isHovered ? slice.color : '#30363d'}
                    strokeWidth={isHovered ? 3 : 1.5}
                    className="transition-all duration-200"
                  />
                  <foreignObject
                    x={iconX - 24}
                    y={iconY - 24}
                    width={48}
                    height={48}
                    className="pointer-events-none"
                  >
                    <div 
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-transform duration-200 ${
                        isHovered ? 'scale-125 bg-slate-900 shadow-xl ring-2' : 'bg-surface-50/90 shadow-md'
                      }`}
                      style={{ color: slice.color }}
                    >
                      <slice.icon className="w-6 h-6" />
                    </div>
                  </foreignObject>
                </g>
              );
            })}

            {/* Inner Hub Circle */}
            <circle
              cx={centerX}
              cy={centerY}
              r={centerRadius - 4}
              fill="#0d1117"
              stroke="#30363d"
              strokeWidth="2.5"
            />
          </svg>

          {/* Central Hub Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-6">
            {hoveredSlice ? (
              <div className="animate-fadeIn space-y-1">
                <div 
                  className="text-sm font-bold tracking-wide flex items-center justify-center space-x-1.5"
                  style={{ color: hoveredSlice.color }}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{hoveredSlice.title}</span>
                </div>
                <div className="text-xs text-slate-300 line-clamp-2 max-w-[130px] leading-tight">
                  {hoveredSlice.subtitle}
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="font-serif font-black text-amber-500 text-sm tracking-wider">DUNGEON DADDY</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">QUICK NAV</div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Hint */}
        <div className="mt-4 flex items-center space-x-3 text-xs text-slate-400 bg-surface-100/90 px-5 py-2 rounded-full border border-surface-border shadow-xl">
          <span>Click any slice or press <kbd className="px-1.5 py-0.5 bg-surface-50 text-slate-200 rounded border border-surface-border text-[10px] font-mono">Esc</kbd> to close</span>
          <button 
            onClick={() => setIsRadialMenuOpen(false)}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
