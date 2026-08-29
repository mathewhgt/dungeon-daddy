export interface HandbookBook {
  id: string;
  title: string;
  edition: string;
  description: string;
  coverIcon: string;
  color: string;
  chaptersCount?: number;
  isCustom?: boolean;
}

export interface HandbookSubheading {
  id: string;
  title: string;
  level: number;
}

export interface HandbookChapterOverride {
  id: string;
  parentId?: string | null;
  title?: string;
  shortTitle?: string;
  category?: 'chapter' | 'class' | 'species' | 'background' | 'feat' | 'rule' | 'condition' | 'mastery';
  tags?: string[];
  content?: string;
  updatedAt: string;
}

export interface HandbookChapter {
  id: string;
  bookId: string;
  parentId?: string | null;
  title: string;
  shortTitle: string;
  icon: string;
  subheadings: HandbookSubheading[];
  content: string;
  isCustom?: boolean;
  isEdited?: boolean;
  category?: 'chapter' | 'class' | 'species' | 'background' | 'feat' | 'rule' | 'condition' | 'mastery';
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomChapterEntity {
  id: string;
  bookId: string;
  parentId?: string | null;
  title: string;
  shortTitle?: string;
  category?: 'chapter' | 'class' | 'species' | 'background' | 'feat' | 'rule' | 'condition' | 'mastery';
  tags?: string[];
  icon?: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomBookEntity {
  id: string;
  title: string;
  edition: string;
  description: string;
  coverIcon: string;
  color: string;
  isCustom: true;
  chapters: CustomChapterEntity[];
  createdAt: string;
  updatedAt: string;
}

export interface CharacterClassRule {
  id: string;
  name: string;
  primaryAbility: string;
  hitDie: string;
  savingThrows: string;
  armorProficiencies: string;
  weaponProficiencies: string;
  summary: string;
  subclasses: string[];
  chapterId: string;
  isCustom?: boolean;
}

export interface SpeciesRule {
  id: string;
  name: string;
  size: string;
  speed: string;
  traits: string[];
  summary: string;
  chapterId: string;
  isCustom?: boolean;
}

export interface BackgroundRule {
  id: string;
  name: string;
  abilityScores: string;
  originFeat: string;
  skills: string;
  tools: string;
  summary: string;
  isCustom?: boolean;
}

export interface FeatRule {
  id: string;
  name: string;
  category: 'Origin' | 'General' | 'Fighting Style' | 'Epic Boon';
  prerequisite: string;
  summary: string;
  isCustom?: boolean;
}

export interface ConditionRule {
  id: string;
  name: string;
  summary: string;
  category: 'condition';
  isCustom?: boolean;
}

export interface WeaponMasteryRule {
  id: string;
  name: string;
  property: string;
  summary: string;
  isCustom?: boolean;
}

export interface SearchResultItem {
  type: 'book' | 'chapter' | 'subheading' | 'class' | 'species' | 'background' | 'feat' | 'condition' | 'mastery';
  bookId?: string;
  chapterId?: string;
  subheadingId?: string;
  entityId?: string;
  title: string;
  subtitle?: string;
  snippet?: string;
  matchScore: number;
}

export interface HandbookTarget {
  bookId?: string;
  chapterId?: string;
  subheadingId?: string;
  category?: 'chapters' | 'classes' | 'species' | 'backgrounds' | 'feats' | 'masteries' | 'conditions' | 'bookmarks';
  entityId?: string;
}
