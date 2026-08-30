import handbookData from './srdData/handbookChapters.json';
import {
  HandbookBook,
  HandbookChapter,
  HandbookSubheading,
  HandbookChapterOverride,
  CharacterClassRule,
  SpeciesRule,
  BackgroundRule,
  FeatRule,
  ConditionRule,
  WeaponMasteryRule,
  SearchResultItem,
  CustomBookEntity,
  CustomChapterEntity,
  HandbookTarget,
  CustomSubclassEntity,
  CustomSpeciesEntity,
  CustomBackgroundEntity,
  CustomFeatEntity,
} from '../types/handbook';

export * from '../types/handbook';

const OFFICIAL_BOOKS: HandbookBook[] = (handbookData as any).books || [];
const OFFICIAL_CHAPTERS: HandbookChapter[] = (handbookData as any).chapters || [];
const OFFICIAL_CLASSES: CharacterClassRule[] = (handbookData as any).classes || [];
const OFFICIAL_SPECIES: SpeciesRule[] = (handbookData as any).species || [];
const OFFICIAL_BACKGROUNDS: BackgroundRule[] = (handbookData as any).backgrounds || [];
const OFFICIAL_FEATS: FeatRule[] = (handbookData as any).feats || [];
const OFFICIAL_CONDITIONS: ConditionRule[] = (handbookData as any).conditions || [];
const OFFICIAL_WEAPON_MASTERIES: WeaponMasteryRule[] = (handbookData as any).weaponMasteries || [];

const BOOKMARKS_STORAGE_KEY = 'dungeon_daddy_handbook_bookmarks_v1';

export function getAllBooks(customBooks: CustomBookEntity[] = []): HandbookBook[] {
  const customList: HandbookBook[] = customBooks.map((cb) => ({
    id: cb.id,
    title: cb.title,
    edition: cb.edition,
    description: cb.description,
    coverIcon: cb.coverIcon || 'Sparkles',
    color: cb.color || '#f59e0b',
    chaptersCount: cb.chapters?.length || 0,
    isCustom: true,
  }));
  return [...OFFICIAL_BOOKS, ...customList];
}

export function getBookById(id: string, customBooks: CustomBookEntity[] = []): HandbookBook | undefined {
  const all = getAllBooks(customBooks);
  return all.find((b) => b.id === id);
}

export function getAllHandbookChapters(
  bookId?: string, 
  customBooks: CustomBookEntity[] = [],
  overrides: Record<string, HandbookChapterOverride> = {},
  customEntries: CustomChapterEntity[] = []
): HandbookChapter[] {
  let allChapters: HandbookChapter[] = OFFICIAL_CHAPTERS.map((chap) => {
    const override = overrides[chap.id];
    if (!override) return chap;

    // Recalculate subheadings if content was modified
    let subheadings = chap.subheadings;
    if (override.content) {
      const newSubheadings: HandbookSubheading[] = [];
      const lines = override.content.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('## ')) {
          const subTitle = trimmed.substring(3).trim();
          const subId = chap.id + '__' + subTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          newSubheadings.push({ id: subId, title: subTitle, level: 2 });
        } else if (trimmed.startsWith('### ')) {
          const subTitle = trimmed.substring(4).trim();
          const subId = chap.id + '__' + subTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          newSubheadings.push({ id: subId, title: subTitle, level: 3 });
        }
      }
      subheadings = newSubheadings;
    }

    return {
      ...chap,
      parentId: override.parentId !== undefined ? override.parentId : (chap as any).parentId,
      title: override.title || chap.title,
      shortTitle: override.shortTitle || chap.shortTitle,
      category: override.category || chap.category || 'chapter',
      tags: override.tags || chap.tags,
      content: override.content !== undefined ? override.content : chap.content,
      subheadings,
      isEdited: true,
      updatedAt: override.updatedAt,
    };
  });

  for (const cb of customBooks) {
    const convertedChapters: HandbookChapter[] = (cb.chapters || []).map((chap) => {
      const override = overrides[chap.id];
      const activeTitle = override?.title || chap.title;
      const activeShortTitle = override?.shortTitle || chap.shortTitle || chap.title;
      const activeContent = override?.content !== undefined ? override.content : chap.content;
      const activeCategory = override?.category || chap.category || 'rule';
      const activeTags = override?.tags || chap.tags || [];
      const activeParentId = override?.parentId !== undefined ? override.parentId : chap.parentId;

      // Extract subheadings from markdown
      const subheadings: HandbookSubheading[] = [];
      const lines = (activeContent || '').split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('## ')) {
          const subTitle = trimmed.substring(3).trim();
          const subId = chap.id + '__' + subTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          subheadings.push({ id: subId, title: subTitle, level: 2 });
        } else if (trimmed.startsWith('### ')) {
          const subTitle = trimmed.substring(4).trim();
          const subId = chap.id + '__' + subTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          subheadings.push({ id: subId, title: subTitle, level: 3 });
        }
      }

      return {
        id: chap.id,
        bookId: cb.id,
        parentId: activeParentId,
        title: activeTitle,
        shortTitle: activeShortTitle,
        icon: chap.icon || 'Sparkles',
        subheadings,
        content: activeContent,
        isCustom: true,
        isEdited: !!override,
        category: activeCategory,
        tags: activeTags,
        createdAt: chap.createdAt,
        updatedAt: override?.updatedAt || chap.updatedAt,
      };
    });

    allChapters = [...allChapters, ...convertedChapters];
  }

  // Process standalone customEntries created in official or custom books
  for (const entry of customEntries) {
    // Avoid duplicates if already inside a customBook
    if (allChapters.some((c) => c.id === entry.id)) continue;

    const override = overrides[entry.id];
    const activeTitle = override?.title || entry.title;
    const activeShortTitle = override?.shortTitle || entry.shortTitle || entry.title;
    const activeContent = override?.content !== undefined ? override.content : entry.content;
    const activeCategory = override?.category || entry.category || 'chapter';
    const activeTags = override?.tags || entry.tags || [];
    const activeParentId = override?.parentId !== undefined ? override.parentId : entry.parentId;

    const subheadings: HandbookSubheading[] = [];
    const lines = (activeContent || '').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('## ')) {
        const subTitle = trimmed.substring(3).trim();
        const subId = entry.id + '__' + subTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        subheadings.push({ id: subId, title: subTitle, level: 2 });
      } else if (trimmed.startsWith('### ')) {
        const subTitle = trimmed.substring(4).trim();
        const subId = entry.id + '__' + subTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        subheadings.push({ id: subId, title: subTitle, level: 3 });
      }
    }

    allChapters.push({
      id: entry.id,
      bookId: entry.bookId || 'phb-2024',
      parentId: activeParentId,
      title: activeTitle,
      shortTitle: activeShortTitle,
      icon: entry.icon || 'Sparkles',
      subheadings,
      content: activeContent,
      isCustom: true,
      isEdited: !!override,
      category: activeCategory,
      tags: activeTags,
      createdAt: entry.createdAt,
      updatedAt: override?.updatedAt || entry.updatedAt,
    });
  }

  if (!bookId || bookId === 'all') return allChapters;
  return allChapters.filter((c) => c.bookId === bookId);
}

export function getHandbookChapterById(
  id: string, 
  customBooks: CustomBookEntity[] = [],
  overrides: Record<string, HandbookChapterOverride> = {},
  customEntries: CustomChapterEntity[] = []
): HandbookChapter | undefined {
  const all = getAllHandbookChapters('all', customBooks, overrides, customEntries);
  return all.find((c) => c.id === id);
}

export function getAllClasses(customSubclasses: CustomSubclassEntity[] = []): CharacterClassRule[] {
  if (!customSubclasses || customSubclasses.length === 0) return OFFICIAL_CLASSES;
  return OFFICIAL_CLASSES.map((cls) => {
    const customForClass = customSubclasses.filter((s) => s.classId.toLowerCase() === cls.id.toLowerCase() || s.classId.toLowerCase() === cls.name.toLowerCase());
    if (customForClass.length === 0) return cls;
    return {
      ...cls,
      subclasses: [...cls.subclasses, ...customForClass.map((s) => s.name)],
    };
  });
}

export function getClassById(id: string, customSubclasses: CustomSubclassEntity[] = []): CharacterClassRule | undefined {
  const allClasses = getAllClasses(customSubclasses);
  return allClasses.find((c) => c.id === id || c.name.toLowerCase() === id.toLowerCase());
}

export function getAllSpecies(customSpecies: CustomSpeciesEntity[] = []): SpeciesRule[] {
  const customList: SpeciesRule[] = (customSpecies || []).map((cs) => ({
    id: cs.id,
    name: cs.name,
    size: cs.size,
    speed: `${cs.speed} ft`,
    traits: (cs.traits || []).map((t: any) => `${t.name}: ${t.description}`),
    bonusSpells: cs.bonusSpells,
    summary: cs.summary || cs.description || '',
    chapterId: 'chapter-4-character-origins',
    isCustom: true,
  }));
  return [...OFFICIAL_SPECIES, ...customList];
}

export function getSpeciesById(id: string, customSpecies: CustomSpeciesEntity[] = []): SpeciesRule | undefined {
  const allSpecies = getAllSpecies(customSpecies);
  return allSpecies.find((s) => s.id === id || s.name.toLowerCase() === id.toLowerCase());
}

export function getAllBackgrounds(customBackgrounds: CustomBackgroundEntity[] = []): BackgroundRule[] {
  const customList: BackgroundRule[] = (customBackgrounds || []).map((cb) => ({
    id: cb.id,
    name: cb.name,
    abilityScores: (cb.allowedAbilities || []).map((a: string) => a.toUpperCase()).join(', '),
    originFeat: cb.originFeat || '',
    skills: (cb.skills || []).join(', '),
    tools: cb.tools || '',
    bonusSpells: cb.bonusSpells,
    summary: cb.summary || cb.description || '',
    isCustom: true,
  }));
  return [...OFFICIAL_BACKGROUNDS, ...customList];
}

export function getBackgroundById(id: string, customBackgrounds: CustomBackgroundEntity[] = []): BackgroundRule | undefined {
  const allBackgrounds = getAllBackgrounds(customBackgrounds);
  return allBackgrounds.find((b) => b.id === id || b.name.toLowerCase() === id.toLowerCase());
}

export function getAllFeats(customFeats: CustomFeatEntity[] = []): FeatRule[] {
  const customList: FeatRule[] = (customFeats || []).map((cf) => ({
    id: cf.id,
    name: cf.name,
    category: cf.category,
    prerequisite: cf.prerequisite || 'None',
    bonusSpells: cf.bonusSpells,
    summary: cf.summary || cf.description || '',
    isCustom: true,
  }));
  return [...OFFICIAL_FEATS, ...customList];
}

export function getFeatById(id: string, customFeats: CustomFeatEntity[] = []): FeatRule | undefined {
  const allFeats = getAllFeats(customFeats);
  return allFeats.find((f) => f.id === id || f.name.toLowerCase() === id.toLowerCase());
}

export function getAllConditions(): ConditionRule[] {
  return OFFICIAL_CONDITIONS;
}

export function getConditionById(id: string): ConditionRule | undefined {
  const norm = id.toLowerCase().trim();
  return OFFICIAL_CONDITIONS.find((c) => c.id === norm || c.name.toLowerCase() === norm);
}

export function getAllWeaponMasteries(): WeaponMasteryRule[] {
  return OFFICIAL_WEAPON_MASTERIES;
}

export function getWeaponMasteryById(id: string): WeaponMasteryRule | undefined {
  const norm = id.toLowerCase().trim();
  return OFFICIAL_WEAPON_MASTERIES.find((m) => m.id === norm || m.name.toLowerCase() === norm);
}

export function getHandbookBookmarks(): string[] {
  try {
    const raw = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : ['chapter-1-playing-the-game', 'chapter-6-equipment', 'rules-glossary'];
  } catch {
    return ['chapter-1-playing-the-game'];
  }
}

export function toggleHandbookBookmark(chapterIdOrSubId: string): string[] {
  try {
    const current = getHandbookBookmarks();
    const set = new Set(current);
    if (set.has(chapterIdOrSubId)) {
      set.delete(chapterIdOrSubId);
    } else {
      set.add(chapterIdOrSubId);
    }
    const updated = Array.from(set);
    localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function searchHandbook(
  query: string, 
  bookId?: string, 
  customBooks: CustomBookEntity[] = [],
  overrides: Record<string, HandbookChapterOverride> = {},
  customEntries: CustomChapterEntity[] = [],
  customSubclasses: CustomSubclassEntity[] = [],
  customSpecies: CustomSpeciesEntity[] = [],
  customBackgrounds: CustomBackgroundEntity[] = [],
  customFeats: CustomFeatEntity[] = []
): SearchResultItem[] {
  if (!query || !query.trim()) return [];

  const q = query.toLowerCase().trim();
  const results: SearchResultItem[] = [];

  // Search Classes & Subclasses
  const mergedClasses = getAllClasses(customSubclasses);
  for (const cls of mergedClasses) {
    const nameMatch = cls.name.toLowerCase().includes(q);
    const subMatch = cls.subclasses.some((s) => s.toLowerCase().includes(q));
    const summaryMatch = cls.summary.toLowerCase().includes(q);
    if (nameMatch || subMatch || summaryMatch) {
      results.push({
        type: 'class',
        bookId: 'phb-2024',
        chapterId: cls.chapterId,
        entityId: cls.id,
        title: `Class: ${cls.name}`,
        subtitle: cls.subclasses.join(', '),
        snippet: cls.summary,
        matchScore: nameMatch ? 100 : subMatch ? 85 : 60,
      });
    }
  }

  // Search Species
  const mergedSpecies = getAllSpecies(customSpecies);
  for (const sp of mergedSpecies) {
    const nameMatch = sp.name.toLowerCase().includes(q);
    const traitMatch = sp.traits.some((t) => t.toLowerCase().includes(q));
    if (nameMatch || traitMatch) {
      results.push({
        type: 'species',
        bookId: 'phb-2024',
        chapterId: sp.chapterId,
        entityId: sp.id,
        title: `Species: ${sp.name}`,
        subtitle: sp.traits.slice(0, 3).join(' · '),
        snippet: sp.summary,
        matchScore: nameMatch ? 95 : 70,
      });
    }
  }

  // Search Backgrounds
  const mergedBackgrounds = getAllBackgrounds(customBackgrounds);
  for (const bg of mergedBackgrounds) {
    const nameMatch = bg.name.toLowerCase().includes(q);
    const featMatch = bg.originFeat.toLowerCase().includes(q);
    if (nameMatch || featMatch) {
      results.push({
        type: 'background',
        bookId: 'phb-2024',
        chapterId: 'chapter-4-character-origins',
        entityId: bg.id,
        title: `Background: ${bg.name}`,
        subtitle: `Feat: ${bg.originFeat} · Skills: ${bg.skills}`,
        snippet: bg.summary,
        matchScore: nameMatch ? 90 : 65,
      });
    }
  }

  // Search Feats
  const mergedFeats = getAllFeats(customFeats);
  for (const ft of mergedFeats) {
    const nameMatch = ft.name.toLowerCase().includes(q);
    const summaryMatch = ft.summary.toLowerCase().includes(q);
    if (nameMatch || summaryMatch) {
      results.push({
        type: 'feat',
        bookId: 'phb-2024',
        chapterId: 'chapter-5-feats',
        entityId: ft.id,
        title: `Feat: ${ft.name} (${ft.category})`,
        subtitle: `Prerequisite: ${ft.prerequisite}`,
        snippet: ft.summary,
        matchScore: nameMatch ? 95 : 60,
      });
    }
  }

  // Search conditions
  for (const cond of OFFICIAL_CONDITIONS) {
    const nameMatch = cond.name.toLowerCase().includes(q);
    const summaryMatch = cond.summary.toLowerCase().includes(q);
    if (nameMatch || summaryMatch) {
      results.push({
        type: 'condition',
        bookId: 'phb-2024',
        chapterId: 'rules-glossary',
        entityId: cond.id,
        title: `Condition: ${cond.name}`,
        subtitle: '5e Rules Condition',
        snippet: cond.summary,
        matchScore: nameMatch ? 100 : 70,
      });
    }
  }

  // Search weapon masteries
  for (const wm of OFFICIAL_WEAPON_MASTERIES) {
    const nameMatch = wm.name.toLowerCase().includes(q);
    const summaryMatch = wm.summary.toLowerCase().includes(q);
    if (nameMatch || summaryMatch) {
      results.push({
        type: 'mastery',
        bookId: 'phb-2024',
        chapterId: 'chapter-6-equipment',
        entityId: wm.id,
        title: `Weapon Mastery: ${wm.name}`,
        subtitle: '5e 2024 Weapon Property',
        snippet: wm.summary,
        matchScore: nameMatch ? 95 : 65,
      });
    }
  }

  // Search all chapters (including custom books, custom entries & overrides)
  const targetChapters = getAllHandbookChapters(bookId, customBooks, overrides, customEntries);
  for (const chap of targetChapters) {
    const chapTitleMatch = chap.title.toLowerCase().includes(q) || chap.shortTitle.toLowerCase().includes(q);
    const tagMatch = (chap.tags || []).some((t) => t.toLowerCase().includes(q));
    if (chapTitleMatch || tagMatch) {
      results.push({
        type: 'chapter',
        bookId: chap.bookId,
        chapterId: chap.id,
        entityId: chap.id,
        title: chap.title,
        subtitle: chap.isCustom ? 'Homebrew & House Rules' : `${chap.subheadings.length} Sections`,
        matchScore: 75,
      });
    }

    // Search subheadings
    for (const sub of chap.subheadings) {
      const subTitleMatch = sub.title.toLowerCase().includes(q);
      if (subTitleMatch) {
        results.push({
          type: 'subheading',
          bookId: chap.bookId,
          chapterId: chap.id,
          subheadingId: sub.id,
          title: sub.title,
          subtitle: chap.shortTitle,
          matchScore: sub.title.toLowerCase() === q ? 90 : 65,
        });
      }
    }

    // Search inside content
    if (!chapTitleMatch && results.length < 35) {
      const idx = chap.content.toLowerCase().indexOf(q);
      if (idx !== -1) {
        const start = Math.max(0, idx - 40);
        const end = Math.min(chap.content.length, idx + q.length + 80);
        const snippet = '...' + chap.content.substring(start, end).replace(/\n/g, ' ') + '...';
        results.push({
          type: 'chapter',
          bookId: chap.bookId,
          chapterId: chap.id,
          entityId: chap.id,
          title: chap.title,
          subtitle: `Mentioned in ${chap.shortTitle}`,
          snippet,
          matchScore: 30,
        });
      }
    }
  }

  return results.sort((a, b) => b.matchScore - a.matchScore).slice(0, 35);
}
