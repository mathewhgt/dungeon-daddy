import React, { useState, useMemo, useEffect } from 'react';
import {
  BookOpen,
  Search,
  Bookmark,
  BookmarkCheck,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Dice5,
  UserCheck,
  Shield,
  Compass,
  Award,
  Sword,
  Wand2,
  Globe,
  Skull,
  BookMarked,
  Tv,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Layers,
  Zap,
  HelpCircle,
  ExternalLink,
  Copy,
  Check,
  Scroll,
  Users,
  Feather,
  BookCheck,
  Flame,
  ArrowRight,
  Plus,
  Edit3,
  Trash2,
  BookPlus,
  Tag,
  RotateCcw
} from 'lucide-react';
import {
  getAllBooks,
  getAllHandbookChapters,
  getAllClasses,
  getAllSpecies,
  getAllBackgrounds,
  getAllFeats,
  getAllConditions,
  getAllWeaponMasteries,
  getHandbookBookmarks,
  toggleHandbookBookmark,
  searchHandbook,
  HandbookBook,
  HandbookChapter,
  CharacterClassRule,
  SpeciesRule,
  BackgroundRule,
  FeatRule,
  ConditionRule,
  WeaponMasteryRule,
  SearchResultItem,
  CustomBookEntity,
  CustomChapterEntity,
  HandbookChapterOverride,
} from '../../services/handbookService';
import { useApp } from '../../context/AppContext';
import { CustomBookModal } from './CustomBookModal';
import { CustomChapterModal } from './CustomChapterModal';
import { HandbookEditorModal } from './HandbookEditorModal';

export type HandbookCategoryTab = 
  | 'chapters' 
  | 'classes' 
  | 'species' 
  | 'backgrounds' 
  | 'feats' 
  | 'masteries' 
  | 'conditions' 
  | 'bookmarks';

const getChapterIcon = (iconName: string) => {
  switch (iconName) {
    case 'Sparkles':
      return Sparkles;
    case 'Dice5':
      return Dice5;
    case 'UserCheck':
      return UserCheck;
    case 'Shield':
      return Shield;
    case 'Compass':
      return Compass;
    case 'Award':
      return Award;
    case 'Sword':
      return Sword;
    case 'Wand2':
      return Wand2;
    case 'Globe':
      return Globe;
    case 'Skull':
      return Skull;
    case 'BookMarked':
      return BookMarked;
    default:
      return BookOpen;
  }
};

export const HandbookView: React.FC = () => {
  const { 
    db, 
    showToast, 
    projectMediaToDisplay, 
    saveCustomBook, 
    deleteCustomBook, 
    saveCustomChapter, 
    deleteCustomChapter,
    saveChapterOverride,
    resetChapterOverride,
    handbookTarget,
    setHandbookTarget
  } = useApp();

  const customBooks = db.customBooks || [];
  const handbookOverrides = db.handbookOverrides || {};
  const customEntries = db.handbookCustomEntries || [];
  const books = useMemo(() => getAllBooks(customBooks), [customBooks]);
  const [selectedBookId, setSelectedBookId] = useState<string>(books[0]?.id || 'phb-2024');

  const chapters = useMemo(
    () => getAllHandbookChapters(selectedBookId, customBooks, handbookOverrides, customEntries),
    [selectedBookId, customBooks, handbookOverrides, customEntries]
  );
  
  const classes = useMemo(() => getAllClasses(), []);
  const species = useMemo(() => getAllSpecies(), []);
  const backgrounds = useMemo(() => getAllBackgrounds(), []);
  const feats = useMemo(() => getAllFeats(), []);
  const conditions = useMemo(() => getAllConditions(), []);
  const weaponMasteries = useMemo(() => getAllWeaponMasteries(), []);

  const [selectedChapterId, setSelectedChapterId] = useState<string>(
    chapters[0]?.id || 'chapter-1-playing-the-game'
  );
  const [activeCategory, setActiveCategory] = useState<HandbookCategoryTab>('chapters');
  const [expandedChapterIds, setExpandedChapterIds] = useState<Set<string>>(
    new Set([chapters[0]?.id || 'chapter-1-playing-the-game'])
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarks, setBookmarks] = useState<string[]>(() => getHandbookBookmarks());
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');
  const [copied, setCopied] = useState(false);

  // Modals state
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isChapterModalOpen, setIsChapterModalOpen] = useState(false);
  const [isEditorModalOpen, setIsEditorModalOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<CustomChapterEntity | null>(null);
  const [defaultParentId, setDefaultParentId] = useState<string | null>(null);

  // Active preview cards
  const [selectedClass, setSelectedClass] = useState<CharacterClassRule | null>(null);
  const [selectedSpecies, setSelectedSpecies] = useState<SpeciesRule | null>(null);
  const [selectedBackground, setSelectedBackground] = useState<BackgroundRule | null>(null);
  const [selectedFeat, setSelectedFeat] = useState<FeatRule | null>(null);
  const [selectedCondition, setSelectedCondition] = useState<ConditionRule | null>(null);
  const [selectedMastery, setSelectedMastery] = useState<WeaponMasteryRule | null>(null);

  
  // Categorized Custom Entries
  
  // Hierarchical Chapter Tree Helpers
  const topLevelChapters = useMemo(() => {
    return chapters.filter((c) => !c.parentId);
  }, [chapters]);

  const getChildChapters = (parentId: string) => {
    return chapters.filter((c) => c.parentId === parentId);
  };

  const customSpeciesEntries = useMemo(() => chapters.filter((c) => c.category === 'species'), [chapters]);
  const customFeatEntries = useMemo(() => chapters.filter((c) => c.category === 'feat'), [chapters]);
  const customClassEntries = useMemo(() => chapters.filter((c) => c.category === 'class'), [chapters]);
  const customBackgroundEntries = useMemo(() => chapters.filter((c) => c.category === 'background'), [chapters]);
  const customConditionEntries = useMemo(() => chapters.filter((c) => c.category === 'condition'), [chapters]);
  const customMasteryEntries = useMemo(() => chapters.filter((c) => c.category === 'mastery'), [chapters]);

  const currentBook = useMemo(() => {
    return books.find((b) => b.id === selectedBookId) || books[0];
  }, [books, selectedBookId]);

  const currentChapter = useMemo(() => {
    return chapters.find((c) => c.id === selectedChapterId) || chapters[0];
  }, [chapters, selectedChapterId]);

  const isBookmarked = bookmarks.includes(selectedChapterId);

  // Auto-select first chapter when switching books if needed
  useEffect(() => {
    if (chapters.length > 0 && !chapters.some((c) => c.id === selectedChapterId)) {
      setSelectedChapterId(chapters[0].id);
    }
  }, [chapters, selectedChapterId]);

  // Listen to deep-link handbookTarget from Global Search
  useEffect(() => {
    if (!handbookTarget) return;

    if (handbookTarget.bookId) {
      setSelectedBookId(handbookTarget.bookId);
    }
    if (handbookTarget.category) {
      setActiveCategory(handbookTarget.category);
    }
    if (handbookTarget.chapterId) {
      setSelectedChapterId(handbookTarget.chapterId);
    }

    if (handbookTarget.category === 'classes' && handbookTarget.entityId) {
      const cls = classes.find((c) => c.id === handbookTarget.entityId || c.name.toLowerCase() === handbookTarget.entityId?.toLowerCase());
      if (cls) setSelectedClass(cls);
    } else if (handbookTarget.category === 'species' && handbookTarget.entityId) {
      const sp = species.find((s) => s.id === handbookTarget.entityId || s.name.toLowerCase() === handbookTarget.entityId?.toLowerCase());
      if (sp) setSelectedSpecies(sp);
    } else if (handbookTarget.category === 'backgrounds' && handbookTarget.entityId) {
      const bg = backgrounds.find((b) => b.id === handbookTarget.entityId || b.name.toLowerCase() === handbookTarget.entityId?.toLowerCase());
      if (bg) setSelectedBackground(bg);
    } else if (handbookTarget.category === 'feats' && handbookTarget.entityId) {
      const ft = feats.find((f) => f.id === handbookTarget.entityId || f.name.toLowerCase() === handbookTarget.entityId?.toLowerCase());
      if (ft) setSelectedFeat(ft);
    } else if (handbookTarget.category === 'conditions' && handbookTarget.entityId) {
      const cond = conditions.find((c) => c.id === handbookTarget.entityId || c.name.toLowerCase() === handbookTarget.entityId?.toLowerCase());
      if (cond) setSelectedCondition(cond);
    } else if (handbookTarget.category === 'masteries' && handbookTarget.entityId) {
      const wm = weaponMasteries.find((m) => m.id === handbookTarget.entityId || m.name.toLowerCase() === handbookTarget.entityId?.toLowerCase());
      if (wm) setSelectedMastery(wm);
    }

    if (handbookTarget.subheadingId) {
      setTimeout(() => scrollToSubheading(handbookTarget.subheadingId!), 150);
    }

    setHandbookTarget(null);
  }, [handbookTarget, classes, species, backgrounds, feats, conditions, weaponMasteries, setHandbookTarget]);

  const searchResults: SearchResultItem[] = useMemo(() => {
    return searchHandbook(searchQuery, selectedBookId, customBooks, handbookOverrides, customEntries);
  }, [searchQuery, selectedBookId, customBooks, handbookOverrides, customEntries]);

  const toggleExpand = (chapId: string) => {
    setExpandedChapterIds((prev) => {
      const next = new Set(prev);
      if (next.has(chapId)) next.delete(chapId);
      else next.add(chapId);
      return next;
    });
  };

  const handleBookmarkToggle = (id: string) => {
    const updated = toggleHandbookBookmark(id);
    setBookmarks(updated);
    showToast(updated.includes(id) ? 'Bookmarked section' : 'Removed bookmark');
  };

  const handleCopySection = () => {
    if (!currentChapter) return;
    navigator.clipboard.writeText(currentChapter.content);
    setCopied(true);
    showToast('Copied section markdown to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleProjectSection = () => {
    if (!currentChapter) return;
    projectMediaToDisplay({
      id: `hb-${Date.now()}`,
      type: 'note',
      title: currentChapter.title,
      content: currentChapter.content.substring(0, 3000) + '...',
      badge: 'Rules',
      badgeColor: 'bg-purple-950 text-purple-300',
    });
    showToast('Projected rules section to Player Screen!');
  };

  const scrollToSubheading = (subId: string) => {
    if (!subId) return;
    const rawTarget = subId.split('__')[1] || subId;
    const cleanTarget = rawTarget.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    let element = document.getElementById(cleanTarget) || document.getElementById(rawTarget) || document.getElementById(subId);
    if (!element) {
      const searchWord = rawTarget.replace(/-/g, ' ').toLowerCase();
      const headings = document.querySelectorAll('h1, h2, h3, h4');
      for (const h of headings) {
        if (h.textContent && h.textContent.toLowerCase().includes(searchWord)) {
          element = h as HTMLElement;
          break;
        }
      }
    }
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const jumpToChapter = (chapterId: string, anchorId?: string) => {
    setSelectedChapterId(chapterId);
    setActiveCategory('chapters');
    if (anchorId) {
      setTimeout(() => scrollToSubheading(anchorId), 150);
    }
  };

  // Render markdown with custom styling
  const renderFormattedContent = (rawText: string) => {
    if (!rawText) return <p className="text-slate-500 italic">No content in this section.</p>;

    const lines = rawText.split('\n');
    const elements: React.ReactNode[] = [];

    let inTable = false;
    let tableRows: string[][] = [];
    let inCallout = false;
    let calloutLines: string[] = [];

    const flushTable = (key: number) => {
      if (tableRows.length > 0) {
        elements.push(
          <div key={`table-${key}`} className="my-4 overflow-x-auto rounded-lg border border-surface-border bg-surface-50/50">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-surface-100/90 border-b border-surface-border text-amber-400 font-semibold font-serif">
                  {tableRows[0].map((h, i) => (
                    <th key={i} className="p-2.5">{h.trim()}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {tableRows.slice(1).map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-surface-hover/30 text-slate-200">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="p-2.5 font-mono text-[11px]">{cell.trim()}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        tableRows = [];
      }
      inTable = false;
    };

    const flushCallout = (key: number) => {
      if (calloutLines.length > 0) {
        const fullCalloutText = calloutLines.join(' ');
        const isRef = /Reference:\*{0,2}\s*([A-Za-z0-9\s\-\(\)'’]+)/i.test(fullCalloutText);
        
        if (isRef) {
          const match = fullCalloutText.match(/Reference:\*{0,2}\s*([A-Za-z0-9\s\-\(\)'’]+)/i);
          const refName = match ? match[1].trim().replace(/[<>\]]/g, '') : '';
          
          // 1. Look for Class
          const matchedClass = classes.find((c) => c.name.toLowerCase() === refName.toLowerCase() || c.id.toLowerCase() === refName.toLowerCase());
          if (matchedClass) {
            elements.push(
              <div key={`ref-class-${key}`} className="my-4 p-5 rounded-2xl bg-surface-100/90 border border-purple-500/40 shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-serif text-base font-bold text-purple-300">{matchedClass.name}</h3>
                      <div className="text-[11px] text-slate-400">
                        Hit Die: <strong className="text-amber-400">{matchedClass.hitDie}</strong> · Primary Ability: <strong className="text-amber-400">{matchedClass.primaryAbility}</strong> · Saves: <strong className="text-slate-200">{matchedClass.savingThrows}</strong>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => projectMediaToDisplay({
                      id: `class-${matchedClass.id}`,
                      type: 'note',
                      title: `${matchedClass.name} Class`,
                      content: `Hit Die: ${matchedClass.hitDie}\nPrimary Ability: ${matchedClass.primaryAbility}\nSaving Throws: ${matchedClass.savingThrows}\nArmor: ${matchedClass.armorProficiencies}\nWeapons: ${matchedClass.weaponProficiencies}\n\n${matchedClass.summary}\n\nSubclasses: ${matchedClass.subclasses.join(', ')}`,
                      badge: 'Class',
                      badgeColor: 'bg-purple-950 text-purple-300',
                    })}
                    className="px-2.5 py-1 rounded bg-purple-950/60 hover:bg-purple-900/60 border border-purple-800 text-purple-300 text-xs font-semibold flex items-center space-x-1"
                    title="Project Class to Player Screen"
                  >
                    <Tv className="w-3 h-3" />
                    <span>Project</span>
                  </button>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{matchedClass.summary}</p>
                <div className="pt-2 border-t border-surface-border flex items-center justify-between text-xs">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase text-purple-400">Subclasses:</span>
                    {matchedClass.subclasses.map((s, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-surface-50 text-purple-300 border border-surface-border text-[11px] font-semibold">
                        {s}
                      </span>
                    ))}
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono shrink-0">
                    Armor: {matchedClass.armorProficiencies}
                  </span>
                </div>
              </div>
            );
            calloutLines = [];
            inCallout = false;
            return;
          }

          // 2. Look for Species
          const matchedSpecies = species.find((s) => s.name.toLowerCase() === refName.toLowerCase() || s.id.toLowerCase() === refName.toLowerCase());
          if (matchedSpecies) {
            elements.push(
              <div key={`ref-species-${key}`} className="my-4 p-5 rounded-2xl bg-surface-100/90 border border-emerald-500/40 shadow-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <Compass className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-serif text-base font-bold text-emerald-300">{matchedSpecies.name}</h3>
                      <div className="text-[11px] text-slate-400">
                        Size: <strong className="text-amber-400">{matchedSpecies.size}</strong> · Speed: <strong className="text-amber-400">{matchedSpecies.speed}</strong>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => projectMediaToDisplay({
                      id: `species-${matchedSpecies.id}`,
                      type: 'note',
                      title: `${matchedSpecies.name} Species`,
                      content: `Size: ${matchedSpecies.size} · Speed: ${matchedSpecies.speed}\n\n${matchedSpecies.summary}\n\nRacial Traits:\n${matchedSpecies.traits.map(t => '• ' + t).join('\n')}`,
                      badge: 'Species',
                      badgeColor: 'bg-emerald-950 text-emerald-300',
                    })}
                    className="px-2.5 py-1 rounded bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-800 text-emerald-300 text-xs font-semibold flex items-center space-x-1"
                    title="Project Species to Player Screen"
                  >
                    <Tv className="w-3 h-3" />
                    <span>Project</span>
                  </button>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{matchedSpecies.summary}</p>
                <div className="pt-2 border-t border-surface-border flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="text-[10px] font-bold uppercase text-emerald-400">Key Traits:</span>
                  {matchedSpecies.traits.map((t, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-surface-50 text-emerald-300 border border-surface-border text-[11px] font-semibold">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            );
            calloutLines = [];
            inCallout = false;
            return;
          }

          // 3. Look for Feat
          const matchedFeat = feats.find((f) => f.name.toLowerCase() === refName.toLowerCase() || f.id.toLowerCase() === refName.toLowerCase());
          if (matchedFeat) {
            elements.push(
              <div key={`ref-feat-${key}`} className="my-3 p-4 rounded-xl bg-surface-100/90 border border-amber-500/30 shadow-md space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <h3 className="font-serif text-sm font-bold text-amber-300">{matchedFeat.name}</h3>
                    <span className="text-[10px] px-2 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-800 font-mono">
                      {matchedFeat.category}
                    </span>
                  </div>
                  <button
                    onClick={() => projectMediaToDisplay({
                      id: `feat-${matchedFeat.id}`,
                      type: 'note',
                      title: `Feat: ${matchedFeat.name}`,
                      content: `Category: ${matchedFeat.category}\nPrerequisite: ${matchedFeat.prerequisite || 'None'}\n\n${matchedFeat.summary}`,
                      badge: 'Feat',
                      badgeColor: 'bg-amber-950 text-amber-300',
                    })}
                    className="p-1 rounded text-slate-400 hover:text-amber-300 hover:bg-surface-hover"
                    title="Project Feat to Player Screen"
                  >
                    <Tv className="w-3.5 h-3.5" />
                  </button>
                </div>
                {matchedFeat.prerequisite && (
                  <div className="text-[11px] text-slate-400 italic">
                    Prerequisite: <strong className="text-slate-300 font-normal">{matchedFeat.prerequisite}</strong>
                  </div>
                )}
                <p className="text-xs text-slate-300 leading-relaxed">{matchedFeat.summary}</p>
              </div>
            );
            calloutLines = [];
            inCallout = false;
            return;
          }

          // 4. Look for Background
          const matchedBg = backgrounds.find((b) => b.name.toLowerCase() === refName.toLowerCase() || b.id.toLowerCase() === refName.toLowerCase());
          if (matchedBg) {
            elements.push(
              <div key={`ref-bg-${key}`} className="my-3 p-4 rounded-xl bg-surface-100/90 border border-sky-500/30 shadow-md space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Scroll className="w-4 h-4 text-sky-400" />
                    <h3 className="font-serif text-sm font-bold text-sky-300">{matchedBg.name}</h3>
                    <span className="text-[10px] px-2 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800 font-mono">
                      Feat: {matchedBg.originFeat}
                    </span>
                  </div>
                  <button
                    onClick={() => projectMediaToDisplay({
                      id: `bg-${matchedBg.id}`,
                      type: 'note',
                      title: `Background: ${matchedBg.name}`,
                      content: `Origin Feat: ${matchedBg.originFeat}\nAbility Scores: ${matchedBg.abilityScores}\nSkills: ${matchedBg.skills}\nTools: ${matchedBg.tools}\n\n${matchedBg.summary}`,
                      badge: 'Background',
                      badgeColor: 'bg-sky-950 text-sky-300',
                    })}
                    className="p-1 rounded text-slate-400 hover:text-sky-300 hover:bg-surface-hover"
                    title="Project Background to Player Screen"
                  >
                    <Tv className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="text-[11px] text-slate-400">
                  Ability Scores: <strong className="text-slate-200">{matchedBg.abilityScores}</strong> · Skills: <strong className="text-slate-200">{matchedBg.skills}</strong> · Tools: <strong className="text-slate-200">{matchedBg.tools}</strong>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{matchedBg.summary}</p>
              </div>
            );
            calloutLines = [];
            inCallout = false;
            return;
          }

          // 5. Look for matching Child Chapter / Entry
          const matchedChild = chapters.find((c) => c.title.toLowerCase().includes(refName.toLowerCase()) || c.shortTitle.toLowerCase() === refName.toLowerCase());
          if (matchedChild && matchedChild.id !== selectedChapterId) {
            elements.push(
              <div key={`ref-child-${key}`} className="my-3 p-4 rounded-xl bg-surface-100 border border-surface-border hover:border-amber-500/40 transition-all flex items-center justify-between">
                <div>
                  <h4 className="font-serif text-sm font-bold text-amber-300">{matchedChild.title}</h4>
                  <p className="text-xs text-slate-400 line-clamp-1">{matchedChild.tags && matchedChild.tags.length > 0 ? matchedChild.tags.join(' · ') : 'Section'}</p>
                </div>
                <button
                  onClick={() => setSelectedChapterId(matchedChild.id)}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-xs font-bold flex items-center space-x-1"
                >
                  <span>Open Entry</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
            calloutLines = [];
            inCallout = false;
            return;
          }
        }

        // Standard Callout
        elements.push(
          <div key={`callout-${key}`} className="my-4 p-4 rounded-xl bg-amber-950/20 border-l-4 border-amber-500 bg-surface-100/50 text-slate-200 space-y-1 text-xs">
            {calloutLines.map((l, lIdx) => (
              <p key={lIdx} className="leading-relaxed">{l.replace(/^>\s*/, '')}</p>
            ))}
          </div>
        );
        calloutLines = [];
      }
      inCallout = false;
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Check table
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        if (inCallout) flushCallout(i);
        if (trimmed.includes('---')) continue;
        inTable = true;
        const cells = trimmed.split('|').slice(1, -1);
        tableRows.push(cells);
        continue;
      } else if (inTable) {
        flushTable(i);
      }

      // Check callout
      if (trimmed.startsWith('>')) {
        if (inTable) flushTable(i);
        inCallout = true;
        calloutLines.push(trimmed);
        continue;
      } else if (inCallout) {
        flushCallout(i);
      }

      // Skip image markdown markers
      if (trimmed.startsWith('![')) {
        continue;
      }

      // Headings
      if (trimmed.startsWith('# ')) {
        elements.push(
          <h1 key={i} className="font-serif text-2xl font-bold text-amber-300 mt-6 mb-3 pb-2 border-b border-amber-500/30 flex items-center justify-between">
            <span>{trimmed.substring(2)}</span>
          </h1>
        );
      } else if (trimmed.startsWith('## ')) {
        const title = trimmed.substring(3);
        const anchorId = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        elements.push(
          <h2 id={anchorId} key={i} className="font-serif text-lg font-bold text-slate-100 mt-6 mb-2 flex items-center space-x-2 scroll-mt-6">
            <span className="text-amber-500 font-sans text-xs">§</span>
            <span>{title}</span>
          </h2>
        );
      } else if (trimmed.startsWith('### ')) {
        const title = trimmed.substring(4);
        const anchorId = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        elements.push(
          <h3 id={anchorId} key={i} className="font-serif text-sm font-bold text-amber-400/90 mt-4 mb-1.5 scroll-mt-6">
            {title}
          </h3>
        );
      } else if (trimmed.startsWith('#### ')) {
        elements.push(
          <h4 key={i} className="font-sans text-xs font-bold text-purple-300 uppercase tracking-wider mt-3 mb-1">
            {trimmed.substring(5)}
          </h4>
        );
      } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        elements.push(
          <li key={i} className="ml-4 list-disc text-slate-300 my-0.5 leading-relaxed">
            {trimmed.substring(2)}
          </li>
        );
      } else if (trimmed === '') {
        elements.push(<div key={i} className="h-2" />);
      } else {
        elements.push(
          <p key={i} className="text-slate-300 leading-relaxed my-1.5">
            {trimmed}
          </p>
        );
      }
    }

    if (inTable) flushTable(lines.length);
    if (inCallout) flushCallout(lines.length);

    return elements;
  };

  const fontSizeClass = {
    sm: 'text-xs',
    base: 'text-[13px]',
    lg: 'text-sm',
  }[fontSize];

  return (
    <div className="h-full flex flex-col bg-[#090d12] overflow-hidden select-none">
      {/* Top Header */}
      <div className="p-3.5 bg-surface-100/60 border-b border-surface-border flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div 
            style={{ backgroundColor: currentBook.color ? `${currentBook.color}20` : undefined }}
            className="p-2 rounded-lg border border-surface-border text-amber-400"
          >
            <BookMarked className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-serif text-lg font-bold text-slate-100 flex items-center space-x-2">
              <span>{currentBook.title}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-purple-950/80 border border-purple-800 text-purple-300">
                {currentBook.edition}
              </span>
              {currentBook.isCustom && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-950/80 border border-amber-800 text-amber-300">
                  ✨ Custom Homebrew
                </span>
              )}
            </h1>
            <p className="text-[11px] text-slate-400">
              {currentBook.description}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Universal New Entry in Any Book */}
          <button
            onClick={() => {
              setEditingChapter(null);
              setIsChapterModalOpen(true);
            }}
            className="px-3 py-1.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold text-xs rounded-lg flex items-center space-x-1.5 shadow-sm"
            title={`Create a new section, species, feat, or rule entry in ${currentBook.title}`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Entry</span>
          </button>

          {currentBook.isCustom && (
            <button
              onClick={() => {
                if (confirm(`Delete custom book "${currentBook.title}" and all its entries?`)) {
                  deleteCustomBook(currentBook.id);
                  setSelectedBookId('phb-2024');
                }
              }}
              className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-surface-hover"
              title="Delete this custom book"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Font size adjustments */}
          <div className="flex items-center space-x-1 bg-surface-50 border border-surface-border rounded-lg p-0.5">
            <button
              onClick={() => setFontSize('sm')}
              className={`px-2 py-1 rounded text-xs font-semibold ${fontSize === 'sm' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
              title="Small text"
            >
              A-
            </button>
            <button
              onClick={() => setFontSize('base')}
              className={`px-2 py-1 rounded text-xs font-semibold ${fontSize === 'base' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
              title="Standard text"
            >
              A
            </button>
            <button
              onClick={() => setFontSize('lg')}
              className={`px-2 py-1 rounded text-xs font-semibold ${fontSize === 'lg' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
              title="Large text"
            >
              A+
            </button>
          </div>

          <button
            onClick={handleCopySection}
            className="px-3 py-1.5 bg-surface-50 hover:bg-surface-hover border border-surface-border text-slate-300 hover:text-slate-100 text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-colors"
            title="Copy section markdown"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={handleProjectSection}
            className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-lg flex items-center space-x-1.5 transition-all shadow-sm"
            title="Project section to Player Screen"
          >
            <Tv className="w-3.5 h-3.5" />
            <span>Project to TV</span>
          </button>
        </div>
      </div>

      {/* Main Two-Pane Layout */}
      <div className="flex-1 flex overflow-hidden min-h-0 w-full">
        {/* Left: Book Switcher, Table of Contents & Category Dropdown */}
        <div className="w-80 min-w-[320px] max-w-[320px] border-r border-surface-border bg-[#0d1117] flex flex-col shrink-0 overflow-hidden">
          {/* Top of Hierarchy: Book Selector */}
          <div className="p-3 border-b border-surface-border space-y-2.5 bg-surface-100/40">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 font-mono flex items-center space-x-1">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Reference Book</span>
              </span>
              <button
                onClick={() => setIsBookModalOpen(true)}
                className="text-[10px] font-bold text-amber-400 hover:text-amber-300 flex items-center space-x-1"
                title="Create a new custom sourcebook"
              >
                <Plus className="w-3 h-3" />
                <span>New Book</span>
              </button>
            </div>

            {/* Book Selector Dropdown */}
            <select
              value={selectedBookId}
              onChange={(e) => setSelectedBookId(e.target.value)}
              className="w-full bg-surface-50 border border-surface-border rounded-lg px-2.5 py-1.5 text-xs text-amber-300 font-semibold focus:outline-none focus:border-amber-500"
            >
              <optgroup label="Official Sourcebooks">
                {books.filter((b) => !b.isCustom).map((b) => (
                  <option key={b.id} value={b.id}>
                    📕 {b.title}
                  </option>
                ))}
              </optgroup>
              {books.some((b) => b.isCustom) && (
                <optgroup label="Custom & Homebrew Books">
                  {books.filter((b) => b.isCustom).map((b) => (
                    <option key={b.id} value={b.id}>
                      ✨ {b.title}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>

            {/* Global Search across rules & content */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search across all rules, classes, feats..."
                className="w-full bg-surface-50 border border-surface-border rounded-lg pl-8 pr-7 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-500 placeholder-slate-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-xs text-slate-500 hover:text-slate-300"
                >
                  ×
                </button>
              )}
            </div>

            {/* View Category Dropdown Selector */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Browse Category:
              </label>
              <select
                value={activeCategory}
                onChange={(e) => setActiveCategory(e.target.value as HandbookCategoryTab)}
                className="w-full bg-surface-50 border border-surface-border rounded-lg px-2.5 py-1.5 text-xs text-purple-300 font-bold focus:outline-none focus:border-purple-500"
              >
                <option value="chapters">📖 Table of Contents (Chapters & Sections)</option>
                <option value="classes">🛡️ Classes & Subclasses ({classes.length} Classes)</option>
                <option value="species">🌿 Species & Lineages ({species.length} Species)</option>
                <option value="backgrounds">📜 Character Backgrounds ({backgrounds.length} Backgrounds)</option>
                <option value="feats">⚡ Feats & Boons ({feats.length} Feats)</option>
                <option value="masteries">⚔️ Weapon Masteries ({weaponMasteries.length} Properties)</option>
                <option value="conditions">💫 Rules & Conditions ({conditions.length} Conditions)</option>
                <option value="bookmarks">⭐ Pinned Bookmarks ({bookmarks.length} Pinned)</option>
              </select>
            </div>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {/* Search Results Dropdown/List */}
            {searchQuery ? (
              <div className="space-y-1">
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Search Results ({searchResults.length})
                </div>
                {searchResults.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500 italic">
                    No matching rules, classes, or sections found for &quot;{searchQuery}&quot;.
                  </div>
                ) : (
                  searchResults.map((res, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        if (res.bookId) setSelectedBookId(res.bookId);
                        if (res.chapterId) {
                          setSelectedChapterId(res.chapterId);
                          setActiveCategory('chapters');
                          if (res.subheadingId) {
                            setTimeout(() => scrollToSubheading(res.subheadingId!), 100);
                          }
                        }
                      }}
                      className="w-full text-left p-2 rounded-lg border border-surface-border bg-surface-100 hover:bg-surface-hover/80 hover:border-amber-500/40 transition-all space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-amber-300 truncate">{res.title}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-surface-50 text-slate-400 border border-surface-border shrink-0">
                          {res.subtitle || res.type}
                        </span>
                      </div>
                      {res.snippet && (
                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-tight">
                          {res.snippet}
                        </p>
                      )}
                    </button>
                  ))
                )}
              </div>
            ) : activeCategory === 'chapters' ? (
              /* Hierarchical Chapter Tree */
              <div className="space-y-1">
                {topLevelChapters.map((chap) => {
                  const isSelected = selectedChapterId === chap.id;
                  const isExpanded = expandedChapterIds.has(chap.id);
                  const IconComp = getChapterIcon(chap.icon);
                  const childChapters = getChildChapters(chap.id);
                  const hasChildren = childChapters.length > 0;
                  const hasSubheadings = chap.subheadings.length > 0;

                  return (
                    <div key={chap.id} className="space-y-0.5">
                      <div
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg border text-xs font-semibold cursor-pointer transition-all group ${
                          isSelected
                            ? 'bg-amber-500/15 border-amber-500/50 text-amber-300'
                            : 'border-transparent text-slate-300 hover:bg-surface-hover hover:text-slate-100'
                        }`}
                        onClick={() => {
                          setSelectedChapterId(chap.id);
                          if (hasChildren || hasSubheadings) {
                            toggleExpand(chap.id);
                          }
                        }}
                      >
                        <div className="flex items-center space-x-2 truncate">
                          <IconComp className={`w-4 h-4 shrink-0 ${isSelected ? 'text-amber-400' : 'text-slate-400'}`} />
                          <span className="truncate">{chap.shortTitle}</span>
                          {hasChildren && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-surface-50 text-amber-400/90 font-mono border border-surface-border">
                              {childChapters.length}
                            </span>
                          )}
                          {chap.category && chap.category !== 'chapter' && (
                            <span className="text-[9px] font-mono px-1 rounded bg-purple-950 text-purple-300 border border-purple-800 uppercase">
                              {chap.category}
                            </span>
                          )}
                          {chap.isEdited && (
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" title="Manually edited entry" />
                          )}
                        </div>

                        <div className="flex items-center space-x-1 shrink-0">
                          {/* Quick Add Subpage Shortcut Button on Hover */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingChapter(null);
                              setDefaultParentId(chap.id);
                              setIsChapterModalOpen(true);
                            }}
                            className="p-1 hover:bg-surface-50 text-slate-500 hover:text-amber-400 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                            title={`Add child subpage under ${chap.shortTitle}`}
                          >
                            <Plus className="w-3 h-3" />
                          </button>

                          {chap.isCustom && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm(`Delete entry "${chap.title}" and its subpages?`)) {
                                  deleteCustomChapter(selectedBookId, chap.id);
                                }
                              }}
                              className="p-1 hover:bg-surface-50 text-slate-500 hover:text-red-400 rounded"
                              title="Delete entry"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}

                          {(hasChildren || hasSubheadings) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleExpand(chap.id);
                              }}
                              className="p-1 hover:bg-surface-50 rounded text-slate-400"
                            >
                              {isExpanded ? (
                                <ChevronDown className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronRight className="w-3.5 h-3.5" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Nested Child Chapters & Subheadings */}
                      {isExpanded && (hasChildren || hasSubheadings) && (
                        <div className="pl-4 pr-1 py-1 space-y-1 border-l-2 border-amber-500/30 ml-4">
                          {/* Child Pages (e.g. Aasimar, Elf, Dwarf inside Races) */}
                          {childChapters.map((child) => {
                            const isChildSelected = selectedChapterId === child.id;
                            const grandChildren = getChildChapters(child.id);

                            return (
                              <div key={child.id} className="space-y-0.5">
                                <div
                                  onClick={() => setSelectedChapterId(child.id)}
                                  className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg border text-xs cursor-pointer transition-all group/child ${
                                    isChildSelected
                                      ? 'bg-amber-500/20 border-amber-500/60 text-amber-200 font-bold'
                                      : 'border-transparent text-slate-300 hover:bg-surface-hover/80 hover:text-slate-100'
                                  }`}
                                >
                                  <div className="flex items-center space-x-1.5 truncate">
                                    <span className="text-amber-500/80 text-[10px]">↳</span>
                                    <span className="truncate">{child.shortTitle}</span>
                                    {child.category && child.category !== 'chapter' && (
                                      <span className="text-[9px] font-mono px-1 rounded bg-surface-50 text-amber-400 border border-surface-border uppercase">
                                        {child.category}
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center space-x-0.5">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingChapter(null);
                                        setDefaultParentId(child.id);
                                        setIsChapterModalOpen(true);
                                      }}
                                      className="p-0.5 hover:bg-surface-50 text-slate-500 hover:text-amber-400 rounded opacity-0 group-hover/child:opacity-100 transition-opacity"
                                      title={`Add child subpage under ${child.shortTitle}`}
                                    >
                                      <Plus className="w-2.5 h-2.5" />
                                    </button>
                                    {child.isCustom && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (confirm(`Delete entry "${child.title}"?`)) {
                                            deleteCustomChapter(selectedBookId, child.id);
                                          }
                                        }}
                                        className="p-0.5 text-slate-500 hover:text-red-400 rounded opacity-0 group-hover/child:opacity-100 transition-opacity"
                                        title="Delete subpage"
                                      >
                                        <Trash2 className="w-2.5 h-2.5" />
                                      </button>
                                    )}
                                  </div>
                                </div>

                                {/* Grandchildren */}
                                {grandChildren.length > 0 && (
                                  <div className="pl-3 py-0.5 space-y-0.5 border-l border-surface-border ml-2">
                                    {grandChildren.map((gc) => (
                                      <button
                                        key={gc.id}
                                        onClick={() => setSelectedChapterId(gc.id)}
                                        className={`w-full text-left py-1 px-1.5 rounded text-[11px] truncate block ${
                                          selectedChapterId === gc.id
                                            ? 'bg-amber-500/20 text-amber-200 font-bold'
                                            : 'text-slate-400 hover:text-amber-300 hover:bg-surface-hover/50'
                                        }`}
                                      >
                                        ↳ {gc.shortTitle}
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}

                          {/* Markdown Subheadings */}
                          {chap.subheadings.slice(0, 10).map((sub) => (
                            <button
                              key={sub.id}
                              onClick={() => {
                                setSelectedChapterId(chap.id);
                                setTimeout(() => scrollToSubheading(sub.id), 100);
                              }}
                              className="w-full text-left py-0.5 px-2 rounded text-[11px] text-slate-400 hover:text-amber-300 hover:bg-surface-hover/50 truncate block"
                            >
                              § {sub.title}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : activeCategory === 'classes' ? (
              /* Character Classes */
              <div className="space-y-1.5">
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>5e Classes</span>
                  <span className="text-purple-400 font-mono">{classes.length + customClassEntries.length} Classes</span>
                </div>
                {/* Official Classes */}
                {classes.map((cls) => (
                  <button
                    key={cls.id}
                    onClick={() => {
                      setSelectedClass(cls);
                      const targetChap = chapters.find((c) => c.id === cls.chapterId || c.id === 'chapter-3-character-classes' || c.title.toLowerCase().includes(cls.name.toLowerCase()));
                      if (targetChap) {
                        setSelectedChapterId(targetChap.id);
                        setTimeout(() => scrollToSubheading(cls.name.toLowerCase()), 150);
                      }
                    }}
                    className={`w-full text-left p-2.5 rounded-lg border transition-all space-y-1 ${
                      selectedClass?.id === cls.id
                        ? 'bg-purple-500/15 border-purple-500/50 text-purple-300 shadow-sm'
                        : 'bg-surface-100/60 border-surface-border text-slate-300 hover:bg-surface-hover'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-serif text-xs font-bold text-amber-400">{cls.name}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-surface-50 border border-surface-border text-purple-300 font-mono">
                        {cls.hitDie} · {cls.primaryAbility}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-tight">
                      {cls.summary}
                    </p>
                    <div className="text-[10px] text-slate-500 truncate">
                      {cls.subclasses.join(' · ')}
                    </div>
                  </button>
                ))}
                {/* Custom Class Entries */}
                {customClassEntries.map((cc) => (
                  <button
                    key={cc.id}
                    onClick={() => {
                      setSelectedClass(null);
                      setSelectedChapterId(cc.id);
                    }}
                    className={`w-full text-left p-2.5 rounded-lg border transition-all space-y-1 ${
                      selectedChapterId === cc.id
                        ? 'bg-purple-500/15 border-purple-500/50 text-purple-300 shadow-sm'
                        : 'bg-surface-100/60 border-surface-border text-slate-300 hover:bg-surface-hover'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-serif text-xs font-bold text-purple-300">{cc.title}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-950/80 border border-purple-800 text-purple-300 font-mono">
                        Custom
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 line-clamp-2 leading-tight">
                      {cc.tags && cc.tags.length > 0 ? cc.tags.join(' · ') : 'Custom Class / Subclass'}
                    </div>
                  </button>
                ))}
              </div>
            ) : activeCategory === 'species' ? (
              /* Species */
              <div className="space-y-1.5">
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Species & Lineages</span>
                  <span className="text-emerald-400 font-mono">{species.length + customSpeciesEntries.length}</span>
                </div>
                {/* Official Species */}
                {species.map((sp) => (
                  <button
                    key={sp.id}
                    onClick={() => {
                      setSelectedSpecies(sp);
                      const targetChap = chapters.find((c) => c.id === sp.id || c.title.toLowerCase().includes(sp.name.toLowerCase()) || c.id === 'chapter-4-character-origins' || c.id === sp.chapterId);
                      if (targetChap) {
                        setSelectedChapterId(targetChap.id);
                        setTimeout(() => scrollToSubheading(sp.name.toLowerCase()), 150);
                      }
                    }}
                    className={`w-full text-left p-2.5 rounded-lg border transition-all space-y-1 ${
                      selectedSpecies?.id === sp.id
                        ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 shadow-sm'
                        : 'bg-surface-100/60 border-surface-border text-slate-300 hover:bg-surface-hover'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-serif text-xs font-bold text-emerald-400">{sp.name}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-surface-50 border border-surface-border text-slate-400 font-mono">
                        {sp.size} · {sp.speed}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-tight">
                      {sp.summary}
                    </p>
                  </button>
                ))}
                {/* Custom / User Created Species Entries */}
                {customSpeciesEntries.map((csp) => (
                  <button
                    key={csp.id}
                    onClick={() => {
                      setSelectedSpecies(null);
                      setSelectedChapterId(csp.id);
                    }}
                    className={`w-full text-left p-2.5 rounded-lg border transition-all space-y-1 ${
                      selectedChapterId === csp.id
                        ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 shadow-sm'
                        : 'bg-surface-100/60 border-surface-border text-slate-300 hover:bg-surface-hover'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-serif text-xs font-bold text-emerald-300 flex items-center space-x-1">
                        <span>{csp.title}</span>
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950/80 border border-emerald-800 text-emerald-300 font-mono">
                        Custom
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 line-clamp-2 leading-tight">
                      {csp.tags && csp.tags.length > 0 ? csp.tags.join(' · ') : (csp.parentId ? 'Nested Species Entry' : 'Custom Species Entry')}
                    </div>
                  </button>
                ))}
              </div>
            ) : activeCategory === 'backgrounds' ? (
              /* Backgrounds */
              <div className="space-y-1.5">
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Character Backgrounds</span>
                  <span className="text-sky-400 font-mono">{backgrounds.length + customBackgroundEntries.length}</span>
                </div>
                {/* Official Backgrounds */}
                {backgrounds.map((bg) => (
                  <button
                    key={bg.id}
                    onClick={() => {
                      setSelectedBackground(bg);
                      const targetChap = chapters.find((c) => c.id === 'chapter-4-character-origins' || c.title.toLowerCase().includes(bg.name.toLowerCase()));
                      if (targetChap) {
                        setSelectedChapterId(targetChap.id);
                        setTimeout(() => scrollToSubheading(bg.name.toLowerCase()), 150);
                      }
                    }}
                    className={`w-full text-left p-2.5 rounded-lg border transition-all space-y-1 ${
                      selectedBackground?.id === bg.id
                        ? 'bg-sky-500/15 border-sky-500/50 text-sky-300 shadow-sm'
                        : 'bg-surface-100/60 border-surface-border text-slate-300 hover:bg-surface-hover'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-serif text-xs font-bold text-sky-400">{bg.name}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-surface-50 border border-surface-border text-amber-300 font-mono">
                        Feat: {bg.originFeat}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-tight">
                      {bg.summary}
                    </p>
                  </button>
                ))}
                {/* Custom Backgrounds */}
                {customBackgroundEntries.map((cbg) => (
                  <button
                    key={cbg.id}
                    onClick={() => {
                      setSelectedBackground(null);
                      setSelectedChapterId(cbg.id);
                    }}
                    className={`w-full text-left p-2.5 rounded-lg border transition-all space-y-1 ${
                      selectedChapterId === cbg.id
                        ? 'bg-sky-500/15 border-sky-500/50 text-sky-300 shadow-sm'
                        : 'bg-surface-100/60 border-surface-border text-slate-300 hover:bg-surface-hover'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-serif text-xs font-bold text-sky-300">{cbg.title}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-950/80 border border-sky-800 text-sky-300 font-mono">
                        Custom
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 line-clamp-2 leading-tight">
                      {cbg.tags && cbg.tags.length > 0 ? cbg.tags.join(' · ') : 'Custom Background Entry'}
                    </div>
                  </button>
                ))}
              </div>
            ) : activeCategory === 'feats' ? (
              /* Feats */
              <div className="space-y-1.5">
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Feats & Boons</span>
                  <span className="text-amber-400 font-mono">{feats.length + customFeatEntries.length}</span>
                </div>
                {/* Official Feats */}
                {feats.map((ft) => (
                  <button
                    key={ft.id}
                    onClick={() => {
                      setSelectedFeat(ft);
                      const targetChap = chapters.find((c) => c.id === ft.id || c.title.toLowerCase().includes(ft.name.toLowerCase()) || c.id === 'chapter-5-feats');
                      if (targetChap) {
                        setSelectedChapterId(targetChap.id);
                        setTimeout(() => scrollToSubheading(ft.name.toLowerCase()), 150);
                      }
                    }}
                    className={`w-full text-left p-2.5 rounded-lg border transition-all space-y-1 ${
                      selectedFeat?.id === ft.id
                        ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 shadow-sm'
                        : 'bg-surface-100/60 border-surface-border text-slate-300 hover:bg-surface-hover'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-serif text-xs font-bold text-amber-400">{ft.name}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-surface-50 border border-surface-border text-purple-300 font-mono">
                        {ft.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-tight">
                      {ft.summary}
                    </p>
                  </button>
                ))}
                {/* Custom Feats */}
                {customFeatEntries.map((cft) => (
                  <button
                    key={cft.id}
                    onClick={() => {
                      setSelectedFeat(null);
                      setSelectedChapterId(cft.id);
                    }}
                    className={`w-full text-left p-2.5 rounded-lg border transition-all space-y-1 ${
                      selectedChapterId === cft.id
                        ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 shadow-sm'
                        : 'bg-surface-100/60 border-surface-border text-slate-300 hover:bg-surface-hover'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-serif text-xs font-bold text-amber-300 flex items-center space-x-1">
                        <span>{cft.title}</span>
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950/80 border border-amber-800 text-amber-300 font-mono">
                        Custom
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 line-clamp-2 leading-tight">
                      {cft.tags && cft.tags.length > 0 ? cft.tags.join(' · ') : 'Custom Feat Entry'}
                    </div>
                  </button>
                ))}
              </div>
            ) : activeCategory === 'masteries' ? (
              /* Weapon Masteries */
              <div className="space-y-1.5">
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Weapon Masteries</span>
                  <span className="text-purple-400 font-mono">{weaponMasteries.length + customMasteryEntries.length}</span>
                </div>
                {weaponMasteries.map((wm) => (
                  <button
                    key={wm.id}
                    onClick={() => {
                      setSelectedMastery(wm);
                      const targetChap = chapters.find((c) => c.id === wm.id || c.title.toLowerCase().includes(wm.name.toLowerCase()) || c.id === 'chapter-6-equipment' || c.id === 'rules-glossary');
                      if (targetChap) {
                        setSelectedChapterId(targetChap.id);
                        setTimeout(() => scrollToSubheading(wm.name.toLowerCase()), 150);
                      }
                    }}
                    className={`w-full text-left p-2.5 rounded-lg border transition-all ${
                      selectedMastery?.id === wm.id
                        ? 'bg-purple-500/15 border-purple-500/50 text-purple-300 shadow-sm'
                        : 'bg-surface-100/60 border-surface-border text-slate-300 hover:bg-surface-hover'
                    }`}
                  >
                    <div className="font-serif text-xs font-bold text-purple-400">{wm.name}</div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5 leading-tight">
                      {wm.summary}
                    </p>
                  </button>
                ))}
                {/* Custom Mastery Entries */}
                {customMasteryEntries.map((cm) => (
                  <button
                    key={cm.id}
                    onClick={() => {
                      setSelectedMastery(null);
                      setSelectedChapterId(cm.id);
                    }}
                    className={`w-full text-left p-2.5 rounded-lg border transition-all space-y-1 ${
                      selectedChapterId === cm.id
                        ? 'bg-purple-500/15 border-purple-500/50 text-purple-300 shadow-sm'
                        : 'bg-surface-100/60 border-surface-border text-slate-300 hover:bg-surface-hover'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-serif text-xs font-bold text-purple-300">{cm.title}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-950/80 border border-purple-800 text-purple-300 font-mono">
                        Custom
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 line-clamp-2 leading-tight">
                      {cm.tags && cm.tags.length > 0 ? cm.tags.join(' · ') : 'Custom Mastery Property'}
                    </div>
                  </button>
                ))}
              </div>
            ) : activeCategory === 'conditions' ? (
              /* Conditions Quick Grid */
              <div className="space-y-1.5">
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>5e Conditions</span>
                  <span className="text-amber-400 font-mono">{conditions.length + customConditionEntries.length}</span>
                </div>
                {conditions.map((cond) => (
                  <button
                    key={cond.id}
                    onClick={() => {
                      setSelectedCondition(cond);
                      const targetChap = chapters.find((c) => c.id === cond.id || c.title.toLowerCase().includes(cond.name.toLowerCase()) || c.id === 'rules-glossary');
                      if (targetChap) {
                        setSelectedChapterId(targetChap.id);
                        setTimeout(() => scrollToSubheading(cond.name.toLowerCase()), 150);
                      }
                    }}
                    className={`w-full text-left p-2.5 rounded-lg border transition-all ${
                      selectedCondition?.id === cond.id
                        ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 shadow-sm'
                        : 'bg-surface-100/60 border-surface-border text-slate-300 hover:bg-surface-hover'
                    }`}
                  >
                    <div className="font-serif text-xs font-bold text-amber-400">{cond.name}</div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5 leading-tight">
                      {cond.summary}
                    </p>
                  </button>
                ))}
                {/* Custom Condition Entries */}
                {customConditionEntries.map((ccond) => (
                  <button
                    key={ccond.id}
                    onClick={() => {
                      setSelectedCondition(null);
                      setSelectedChapterId(ccond.id);
                    }}
                    className={`w-full text-left p-2.5 rounded-lg border transition-all space-y-1 ${
                      selectedChapterId === ccond.id
                        ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 shadow-sm'
                        : 'bg-surface-100/60 border-surface-border text-slate-300 hover:bg-surface-hover'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-serif text-xs font-bold text-amber-300">{ccond.title}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950/80 border border-amber-800 text-amber-300 font-mono">
                        Custom
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 line-clamp-2 leading-tight">
                      {ccond.tags && ccond.tags.length > 0 ? ccond.tags.join(' · ') : 'Custom Condition / Hazard'}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              /* Pinned Bookmarks */
              <div className="space-y-1.5">
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Pinned Chapters & Sections ({bookmarks.length})
                </div>
                {bookmarks.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-500 italic">
                    No pinned chapters yet. Click the bookmark icon in the reading header to pin your favorite rules.
                  </div>
                ) : (
                  bookmarks.map((bmId) => {
                    const chap = chapters.find((c) => c.id === bmId);
                    if (!chap) return null;
                    return (
                      <button
                        key={bmId}
                        onClick={() => {
                          setSelectedChapterId(chap.id);
                          setActiveCategory('chapters');
                        }}
                        className="w-full text-left p-2.5 rounded-lg border border-surface-border bg-surface-100 hover:bg-surface-hover flex items-center justify-between"
                      >
                        <div className="font-serif text-xs font-bold text-amber-300 truncate">
                          {chap.title}
                        </div>
                        <BookmarkCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Rich Reading Pane */}
        <div className="flex-1 min-w-0 overflow-y-auto p-8 bg-[#090d12] flex flex-col items-center">
          <div className="w-full max-w-4xl space-y-6">
            {/* Class Preview Card if selected */}
            {selectedClass && (
              <div className="p-5 rounded-2xl bg-surface-100 border border-purple-500/40 shadow-xl relative space-y-3">
                <button
                  onClick={() => setSelectedClass(null)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-100 text-xs p-1"
                >
                  ✕
                </button>
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-purple-300">
                      {selectedClass.name} Class
                    </h3>
                    <div className="text-xs text-slate-400">
                      Hit Die: <strong className="text-amber-400">{selectedClass.hitDie}</strong> · Primary Ability: <strong className="text-amber-400">{selectedClass.primaryAbility}</strong> · Saves: <strong className="text-slate-200">{selectedClass.savingThrows}</strong>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed">
                  {selectedClass.summary}
                </p>

                <div className="space-y-1.5 pt-2 border-t border-surface-border">
                  <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                    Subclasses ({selectedClass.subclasses.length}):
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedClass.subclasses.map((sub, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-purple-950/60 border border-purple-800/80 text-purple-300 text-xs font-semibold">
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-surface-border">
                  <span className="text-[10px] text-slate-400 font-mono">
                    Armor: {selectedClass.armorProficiencies} · Weapons: {selectedClass.weaponProficiencies}
                  </span>
                  <button
                    onClick={() => jumpToChapter(selectedClass.chapterId, selectedClass.name.toLowerCase())}
                    className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-lg flex items-center space-x-1.5 shadow-sm"
                  >
                    <span>Read Full Class in Chapter 3</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Species Preview Card if selected */}
            {selectedSpecies && (
              <div className="p-5 rounded-2xl bg-surface-100 border border-emerald-500/40 shadow-xl relative space-y-3">
                <button
                  onClick={() => setSelectedSpecies(null)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-100 text-xs p-1"
                >
                  ✕
                </button>
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-emerald-300">
                      {selectedSpecies.name} Species
                    </h3>
                    <div className="text-xs text-slate-400">
                      Size: <strong className="text-amber-400">{selectedSpecies.size}</strong> · Speed: <strong className="text-amber-400">{selectedSpecies.speed}</strong>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed">
                  {selectedSpecies.summary}
                </p>

                <div className="space-y-1.5 pt-2 border-t border-surface-border">
                  <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                    Key Racial Traits:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedSpecies.traits.map((tr, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-xs font-semibold">
                        {tr}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end border-t border-surface-border">
                  <button
                    onClick={() => jumpToChapter(selectedSpecies.chapterId, selectedSpecies.name.toLowerCase())}
                    className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-lg flex items-center space-x-1.5 shadow-sm"
                  >
                    <span>Read Full Species in Chapter 4</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Background Preview Card if selected */}
            {selectedBackground && (
              <div className="p-5 rounded-2xl bg-surface-100 border border-sky-500/40 shadow-xl relative space-y-3">
                <button
                  onClick={() => setSelectedBackground(null)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-100 text-xs p-1"
                >
                  ✕
                </button>
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
                    <Scroll className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-sky-300">
                      {selectedBackground.name} Background
                    </h3>
                    <div className="text-xs text-slate-400">
                      Origin Feat: <strong className="text-amber-400">{selectedBackground.originFeat}</strong> · Ability Scores: <strong className="text-slate-200">{selectedBackground.abilityScores}</strong>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed">
                  {selectedBackground.summary}
                </p>

                <div className="pt-2 flex items-center justify-between border-t border-surface-border text-xs text-slate-300">
                  <span>Skills: <strong className="text-purple-300">{selectedBackground.skills}</strong> · Tools: <strong className="text-amber-300">{selectedBackground.tools}</strong></span>
                  <button
                    onClick={() => jumpToChapter('chapter-4-character-origins', selectedBackground.name.toLowerCase())}
                    className="px-3 py-1.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs rounded-lg flex items-center space-x-1.5 shadow-sm"
                  >
                    <span>Read in Chapter 4</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Feat Preview Card if selected */}
            {selectedFeat && (
              <div className="p-5 rounded-2xl bg-surface-100 border border-amber-500/40 shadow-xl relative space-y-3">
                <button
                  onClick={() => setSelectedFeat(null)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-100 text-xs p-1"
                >
                  ✕
                </button>
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-amber-300">
                      {selectedFeat.name}
                    </h3>
                    <div className="text-xs text-slate-400">
                      Category: <strong className="text-purple-400">{selectedFeat.category} Feat</strong> · Prerequisite: <strong className="text-slate-200">{selectedFeat.prerequisite}</strong>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed">
                  {selectedFeat.summary}
                </p>

                <div className="pt-2 flex items-center justify-end border-t border-surface-border">
                  <button
                    onClick={() => jumpToChapter('chapter-5-feats', selectedFeat.name.toLowerCase())}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-lg flex items-center space-x-1.5 shadow-sm"
                  >
                    <span>Read in Chapter 5</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Condition Modal Card Preview if selected */}
            {selectedCondition && (
              <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/40 shadow-lg relative space-y-2">
                <button
                  onClick={() => setSelectedCondition(null)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-100 text-xs"
                >
                  ✕
                </button>
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <h3 className="font-serif text-base font-bold text-amber-300">
                    Condition: {selectedCondition.name}
                  </h3>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {selectedCondition.summary}
                </p>
                <div className="pt-2 flex items-center justify-between border-t border-amber-500/20">
                  <span className="text-[10px] text-amber-400/80 font-mono">D&D 5e (2024) Rules Glossary</span>
                  <button
                    onClick={() => {
                      projectMediaToDisplay({
                        id: `cond-${selectedCondition.id}`,
                        type: 'note',
                        title: `Condition: ${selectedCondition.name}`,
                        content: selectedCondition.summary,
                        badge: 'Condition',
                        badgeColor: 'bg-amber-950 text-amber-300',
                      });
                      showToast(`Projected ${selectedCondition.name} to Player Screen`);
                    }}
                    className="px-2.5 py-1 bg-amber-500 text-slate-950 font-bold text-[11px] rounded flex items-center space-x-1"
                  >
                    <Tv className="w-3 h-3" />
                    <span>Project to TV</span>
                  </button>
                </div>
              </div>
            )}

            {/* Weapon Mastery Preview if selected */}
            {selectedMastery && (
              <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/40 shadow-lg relative space-y-2">
                <button
                  onClick={() => setSelectedMastery(null)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-100 text-xs"
                >
                  ✕
                </button>
                <div className="flex items-center space-x-2">
                  <Sword className="w-4 h-4 text-purple-400" />
                  <h3 className="font-serif text-base font-bold text-purple-300">
                    Weapon Mastery: {selectedMastery.name}
                  </h3>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  {selectedMastery.summary}
                </p>
                <div className="pt-2 flex items-center justify-between border-t border-purple-500/20">
                  <span className="text-[10px] text-purple-400/80 font-mono">D&D 5e (2024) Equipment Chapter</span>
                  <button
                    onClick={() => {
                      projectMediaToDisplay({
                        id: `wm-${selectedMastery.id}`,
                        type: 'note',
                        title: `Weapon Mastery: ${selectedMastery.name}`,
                        content: selectedMastery.summary,
                        badge: 'Mastery',
                        badgeColor: 'bg-purple-950 text-purple-300',
                      });
                      showToast(`Projected ${selectedMastery.name} to Player Screen`);
                    }}
                    className="px-2.5 py-1 bg-purple-600 text-white font-bold text-[11px] rounded flex items-center space-x-1"
                  >
                    <Tv className="w-3 h-3" />
                    <span>Project to TV</span>
                  </button>
                </div>
              </div>
            )}

            
            {/* Breadcrumb if child entry */}
            {currentChapter?.parentId && (
              <div className="flex items-center space-x-2 text-xs text-slate-400 font-serif">
                {(() => {
                  const parentChap = chapters.find((c) => c.id === currentChapter.parentId);
                  return parentChap ? (
                    <button
                      onClick={() => setSelectedChapterId(parentChap.id)}
                      className="text-amber-400 hover:text-amber-300 hover:underline flex items-center space-x-1 font-semibold"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>{parentChap.title}</span>
                    </button>
                  ) : (
                    <span>Parent Section</span>
                  );
                })()}
                <span>/</span>
                <span className="text-slate-200 font-bold">{currentChapter.title}</span>
              </div>
            )}

            {/* Chapter Article Header Bar */}
            <div className="p-4 rounded-xl bg-surface-100 border border-surface-border flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 font-mono">
                    {currentBook.title} · {currentBook.edition}
                  </span>
                  {currentChapter?.isEdited && (
                    <span className="px-2 py-0.2 rounded-full text-[10px] font-mono bg-amber-950/80 border border-amber-800 text-amber-300 flex items-center space-x-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>Custom Edited</span>
                    </span>
                  )}
                  {currentChapter?.category && currentChapter.category !== 'chapter' && (
                    <span className="px-2 py-0.2 rounded-full text-[10px] font-mono bg-purple-950/80 border border-purple-800 text-purple-300 uppercase">
                      {currentChapter.category}
                    </span>
                  )}
                </div>

                <h2 className="font-serif text-xl font-bold text-slate-100 flex items-center space-x-2">
                  <span>{currentChapter?.title || 'Untitled Section'}</span>
                </h2>

                {currentChapter?.tags && currentChapter.tags.length > 0 && (
                  <div className="flex items-center flex-wrap gap-1 pt-0.5">
                    {currentChapter.tags.map((t, idx) => (
                      <span key={idx} className="px-2 py-0.2 rounded bg-surface-50 border border-surface-border text-[10px] text-slate-300 font-mono flex items-center space-x-1">
                        <Tag className="w-2.5 h-2.5 text-amber-400" />
                        <span>{t}</span>
                      </span>
                    ))}
                  </div>
                )}

                <div className="text-[11px] text-slate-400">
                  {currentChapter?.subheadings?.length || 0} major sections · {currentBook.isCustom ? 'Custom Homebrew Guide' : 'Structured D&D 5e rules reference'}
                </div>
              </div>

              <div className="flex items-center space-x-1.5">
                {currentChapter && (
                  <button
                    onClick={() => setIsEditorModalOpen(true)}
                    className="px-2.5 py-1.5 bg-surface-50 hover:bg-surface-hover border border-surface-border text-slate-300 hover:text-amber-300 text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-colors"
                    title="Edit text, markdown formatting, or categorization tags"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Edit Section</span>
                  </button>
                )}

                {currentChapter && (
                  <button
                    onClick={() => handleBookmarkToggle(currentChapter.id)}
                    className={`p-2 rounded-lg border transition-all ${
                      isBookmarked
                        ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                        : 'bg-surface-50 border-surface-border text-slate-400 hover:text-slate-200'
                    }`}
                    title={isBookmarked ? 'Pinned to favorites' : 'Pin to favorites'}
                  >
                    {isBookmarked ? (
                      <BookmarkCheck className="w-4 h-4 text-amber-400" />
                    ) : (
                      <Bookmark className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
            </div>

            
            {/* Child Pages / Subpages Grid if any */}
            {currentChapter && getChildChapters(currentChapter.id).length > 0 && (
              <div className="p-4 rounded-xl bg-surface-100/70 border border-surface-border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400 font-serif flex items-center space-x-1.5">
                    <BookOpen className="w-4 h-4" />
                    <span>Subpages & Child Entries ({getChildChapters(currentChapter.id).length})</span>
                  </span>
                  <button
                    onClick={() => {
                      setEditingChapter(null);
                      setDefaultParentId(currentChapter.id);
                      setIsChapterModalOpen(true);
                    }}
                    className="px-2.5 py-1 bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 border border-amber-500/30 rounded-lg text-xs font-bold flex items-center space-x-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Subpage</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                  {getChildChapters(currentChapter.id).map((child) => (
                    <button
                      key={child.id}
                      onClick={() => setSelectedChapterId(child.id)}
                      className="p-3 rounded-lg bg-surface-50 hover:bg-surface-hover border border-surface-border hover:border-amber-500/50 text-left transition-all space-y-1 group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-serif text-xs font-bold text-slate-100 group-hover:text-amber-300 truncate">
                          {child.title}
                        </span>
                        {child.category && (
                          <span className="text-[9px] font-mono uppercase px-1.5 py-0.2 rounded bg-surface-100 text-purple-300 border border-surface-border shrink-0">
                            {child.category}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                        {child.tags && child.tags.length > 0 ? child.tags.join(' · ') : child.content.substring(0, 80) + '...'}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Section Quick Anchor Tags */}
            {currentChapter?.subheadings && currentChapter.subheadings.length > 0 && (
              <div className="p-3 rounded-xl bg-surface-100/50 border border-surface-border flex items-center flex-wrap gap-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                  Jump to:
                </span>
                {currentChapter.subheadings.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => scrollToSubheading(sub.id)}
                    className="px-2 py-0.5 rounded bg-surface-50 hover:bg-amber-500/20 hover:text-amber-300 border border-surface-border text-[11px] text-slate-300 transition-colors"
                  >
                    {sub.title}
                  </button>
                ))}
              </div>
            )}

            {/* Rendered Markdown Body */}
            <div className={`prose prose-invert max-w-none ${fontSizeClass} leading-relaxed bg-surface-100/30 p-6 rounded-2xl border border-surface-border`}>
              {currentChapter ? renderFormattedContent(currentChapter.content) : <p className="text-slate-500 italic">Select a section to read.</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Create Custom Book Modal */}
      <CustomBookModal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        onSave={(newBook) => {
          saveCustomBook(newBook);
          setSelectedBookId(newBook.id);
        }}
      />

      {/* Create Custom Chapter Entry Modal */}
      <CustomChapterModal
        isOpen={isChapterModalOpen}
        bookId={selectedBookId}
        initialChapter={editingChapter}
        defaultParentId={defaultParentId}
        availableChapters={chapters}
        onClose={() => {
          setIsChapterModalOpen(false);
          setEditingChapter(null);
          setDefaultParentId(null);
        }}
        onSave={(bId, chap) => {
          saveCustomChapter(bId, chap);
          setSelectedChapterId(chap.id);
          if (chap.parentId) {
            setExpandedChapterIds((prev) => new Set([...prev, chap.parentId!]));
          }
        }}
      />

      {/* Universal Handbook Section & Classification Tag Editor Modal */}
      <HandbookEditorModal
        isOpen={isEditorModalOpen}
        chapter={currentChapter}
        availableChapters={chapters}
        onClose={() => setIsEditorModalOpen(false)}
        onSaveOverride={(chapId: string, override: HandbookChapterOverride) => {
          saveChapterOverride(chapId, override);
        }}
        onResetOverride={(chapId: string) => {
          resetChapterOverride(chapId);
        }}
      />
    </div>
  );
};
