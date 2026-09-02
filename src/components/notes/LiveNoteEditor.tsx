import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Save, 
  Trash2, 
  Tv, 
  Folder, 
  BookOpen, 
  Eye, 
  EyeOff, 
  Heading1, 
  Heading2, 
  Heading3, 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough, 
  Code, 
  List, 
  ListOrdered, 
  Quote, 
  Sparkles, 
  Link2, 
  Image as ImageIcon, 
  Columns, 
  Dices, 
  Copy, 
  Check, 
  ChevronDown,
  Edit3,
  Lock,
  Plus,
  X,
  ExternalLink,
  MoreHorizontal,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CampaignNote, NoteCategory } from '../../types/campaign';
import { BookmarkButton } from '../bookmarks/BookmarkButton';
import { SlashCommandMenu } from './SlashCommandMenu';
import { CompendiumLinkModal } from './CompendiumLinkModal';
import { DcCheckModal } from './DcCheckModal';
import { NoteImageModal } from './NoteImageModal';
import { NoteCoverBanner } from './NoteCoverBanner';
import { NoteCoverModal } from './NoteCoverModal';
import { markdownToHtml, htmlToMarkdown } from './markdownConverter';
import { getNoteCategoryIcon, getNoteCategoryStyle } from './NotesView';
import { MonsterStatBlock } from '../compendium/MonsterStatBlock';
import { SpellCard } from '../compendium/SpellCard';
import { ItemCard } from '../compendium/ItemCard';
import { NoteContentRenderer } from './NoteEntityPopover';
import { crossWindowService } from '../../services/crossWindowService';

export function openNotesWindow(noteId?: string, campaignId?: string) {
  if ((window as any).electronAPI?.notes?.openWindow) {
    (window as any).electronAPI.notes.openWindow({ noteId, campaignId });
  } else {
    const params = new URLSearchParams();
    params.set('view', 'notes');
    if (noteId) params.set('noteId', noteId);
    if (campaignId) params.set('campaignId', campaignId);
    window.open(`${window.location.origin}/?${params.toString()}`, 'DungeonDaddyNotes', 'width=1050,height=860,resizable=yes');
  }
}

interface LiveNoteEditorProps {
  note: CampaignNote;
  campaignId: string;
  folders: { id: string; name: string }[];
  onDeleteNote: (noteId: string) => void;
}

const CATEGORY_OPTIONS: NoteCategory[] = ['Session', 'Lore', 'NPC', 'Location', 'Quest', 'Handout', 'Image', 'Map'];

export const LiveNoteEditor: React.FC<LiveNoteEditorProps> = ({
  note,
  campaignId,
  folders,
  onDeleteNote,
}) => {
  const { 
    db,
    saveCampaignNote, 
    setSelectedNoteId,
    setActiveMapId,
    setActiveTab,
    projectMediaToDisplay, 
    showToast 
  } = useApp();

  const [title, setTitle] = useState(note.name);
  const [category, setCategory] = useState<NoteCategory>(note.category || 'Session');
  const [parentId, setParentId] = useState<string | null>(note.parentId || null);
  const [isPlayerVisible, setIsPlayerVisible] = useState(note.isPlayerVisible || false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');

  // Modals
  const [isCompendiumModalOpen, setIsCompendiumModalOpen] = useState(false);
  const [isDcModalOpen, setIsDcModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isCoverModalOpen, setIsCoverModalOpen] = useState(false);

  // Cover Image State
  const [coverImageUrl, setCoverImageUrl] = useState(note.coverImageUrl || '');
  const [coverImagePositionY, setCoverImagePositionY] = useState(note.coverImagePositionY ?? 50);
  const [coverImageHeight, setCoverImageHeight] = useState(note.coverImageHeight ?? 280);

  // More Options Menu dropdown state
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setIsMoreMenuOpen(false);
      }
    };
    if (isMoreMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMoreMenuOpen]);

  // Slash Command Menu state
  const [slashMenu, setSlashMenu] = useState<{
    isOpen: boolean;
    query: string;
    triggerChar: '/' | '\\';
    triggerPos: number;
    position: { top: number; left: number };
  }>({
    isOpen: false,
    query: '',
    triggerChar: '\\',
    triggerPos: 0,
    position: { top: 0, left: 0 },
  });

  // Floating Selection Formatting Toolbar
  const [selectionToolbar, setSelectionToolbar] = useState<{
    isVisible: boolean;
    position: { top: number; left: number };
  }>({
    isVisible: false,
    position: { top: 0, left: 0 },
  });

  const editorRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isUpdatingFromPropRef = useRef(false);
  const savedRangeRef = useRef<Range | null>(null);
  const savedScrollTopRef = useRef<number>(0);
  const mentionTriggerRef = useRef<'@' | '\\' | null>(null);
  const [activeEntityModal, setActiveEntityModal] = useState<{ type: string; id: string } | null>(null);

  // Save active caret range and scroll position before opening modals or inserting
  const saveSelection = useCallback((triggerType?: '@' | '\\') => {
    mentionTriggerRef.current = triggerType || null;
    if (scrollContainerRef.current) {
      savedScrollTopRef.current = scrollContainerRef.current.scrollTop;
    }
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0 && editorRef.current?.contains(sel.anchorNode)) {
      savedRangeRef.current = sel.getRangeAt(0).cloneRange();
    }
  }, []);

  // Handle clicking on interactive compendium entity badges
  const handleEditorClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;

    // Handle clicking the interactive Roll d20 button inside a DC check block
    const rollBtn = target.closest('.dd-check-roll-btn') as HTMLButtonElement | null;
    if (rollBtn) {
      e.preventDefault();
      e.stopPropagation();

      const checkCard = rollBtn.closest('.dd-check') as HTMLElement | null;
      if (!checkCard) return;

      const dcStr = checkCard.getAttribute('data-dc') || '15';
      const dcs = dcStr
        .split(',')
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => !isNaN(n))
        .sort((a, b) => a - b);
      const primaryDc = dcs.length > 0 ? dcs[0] : 15;

      const resultBadge = checkCard.querySelector('.dd-check-result') as HTMLElement | null;
      rollBtn.disabled = true;

      // Animate roll
      let count = 0;
      const interval = setInterval(() => {
        const tempRoll = Math.floor(Math.random() * 20) + 1;
        if (resultBadge) {
          resultBadge.classList.remove('hidden');
          resultBadge.textContent = `Rolling... ${tempRoll}`;
        }
        count++;
        if (count > 6) {
          clearInterval(interval);
          const finalRoll = Math.floor(Math.random() * 20) + 1;
          rollBtn.disabled = false;
          rollBtn.innerHTML = '<span>🎲 Re-roll</span>';

          if (resultBadge) {
            resultBadge.classList.remove('hidden', 'bg-emerald-950/90', 'border-emerald-500', 'text-emerald-300', 'bg-red-950/90', 'border-red-500', 'text-red-300');
            const isSuccess = finalRoll >= primaryDc;
            if (isSuccess) {
              resultBadge.classList.add('bg-emerald-950/90', 'border-emerald-500', 'text-emerald-300');
              resultBadge.textContent = finalRoll === 20 ? '🌟 Nat 20!' : `Result: ${finalRoll} ✓`;
            } else {
              resultBadge.classList.add('bg-red-950/90', 'border-red-500', 'text-red-300');
              resultBadge.textContent = finalRoll === 1 ? '💀 Nat 1!' : `Result: ${finalRoll} ✗`;
            }
          }

          // Evaluate and highlight matching outcome line
          const lines = checkCard.querySelectorAll('.dd-check-line');
          lines.forEach((lineEl) => {
            const el = lineEl as HTMLElement;
            const text = el.textContent || '';
            const lower = text.toLowerCase();

            // Clear previous highlight styles
            el.classList.remove(
              'bg-emerald-950/60', 'border-emerald-500', 'text-emerald-100', 'shadow-md', 'shadow-emerald-950', 'scale-[1.01]', 'border',
              'bg-red-950/60', 'border-red-500', 'text-red-100', 'shadow-red-950'
            );

            let isHighlighted = false;
            let lineSuccess = false;

            // DC XX+: pattern
            const dcMatch = text.match(/DC\s*(\d+)\+/i);
            if (dcMatch) {
              const threshold = parseInt(dcMatch[1], 10);
              const qualified = dcs.filter((d) => finalRoll >= d);
              const maxQualified = qualified.length > 0 ? Math.max(...qualified) : -1;
              if (maxQualified === threshold) {
                isHighlighted = true;
                lineSuccess = true;
              }
            } else if (lower.includes('success')) {
              if (finalRoll >= primaryDc) {
                isHighlighted = true;
                lineSuccess = true;
              }
            } else if (lower.includes('failure') || lower.includes('<')) {
              const minDc = dcs.length > 0 ? dcs[0] : primaryDc;
              if (finalRoll < minDc) {
                isHighlighted = true;
                lineSuccess = false;
              }
            }

            if (isHighlighted) {
              if (lineSuccess) {
                el.classList.add('bg-emerald-950/60', 'border', 'border-emerald-500', 'text-emerald-100', 'shadow-md', 'shadow-emerald-950', 'scale-[1.01]');
              } else {
                el.classList.add('bg-red-950/60', 'border', 'border-red-500', 'text-red-100', 'shadow-md', 'shadow-red-950', 'scale-[1.01]');
              }
            }
          });
        }
      }, 40);
      return;
    }

    // Handle clicking on interactive compendium entity badges
    const badge = target.closest('.dd-entity-badge');
    if (badge) {
      e.preventDefault();
      e.stopPropagation();
      const type = badge.getAttribute('data-type') || 'note';
      const id = badge.getAttribute('data-id') || '';
      if (type === 'map') {
        setActiveMapId(id);
        setActiveTab('maps');
        const targetMap = db.maps?.find((m) => m.id === id);
        showToast(`Opened battlemap: ${targetMap?.name || 'Map'}`);
        crossWindowService.broadcast({ type: 'SWITCH_MAP', mapId: id });
        return;
      }
      if (type && id) {
        setActiveEntityModal({ type, id });
      }
    }
  };

  // Keep references to latest state to avoid stale closure drops during save
  const noteRef = useRef(note);
  noteRef.current = note;
  const titleRef = useRef(title);
  titleRef.current = title;
  const categoryRef = useRef(category);
  categoryRef.current = category;
  const parentIdRef = useRef(parentId);
  parentIdRef.current = parentId;
  const isPlayerVisibleRef = useRef(isPlayerVisible);
  isPlayerVisibleRef.current = isPlayerVisible;
  const coverImageUrlRef = useRef(coverImageUrl);
  coverImageUrlRef.current = coverImageUrl;
  const coverImagePositionYRef = useRef(coverImagePositionY);
  coverImagePositionYRef.current = coverImagePositionY;
  const coverImageHeightRef = useRef(coverImageHeight);
  coverImageHeightRef.current = coverImageHeight;

  // Ensure all DC check cards have roll buttons, result badges, and interactive line classes
  const ensureCheckCardsInteractive = useCallback(() => {
    if (!editorRef.current) return;
    const checks = editorRef.current.querySelectorAll('.dd-check');
    checks.forEach((check) => {
      // Ensure header has roll button & result badge
      if (!check.querySelector('.dd-check-roll-btn')) {
        const header = check.querySelector('[contenteditable="false"]');
        if (header) {
          const btnGroup = document.createElement('div');
          btnGroup.className = 'flex items-center space-x-2';
          btnGroup.innerHTML = `
            <span class="dd-check-result hidden px-2 py-0.5 rounded-lg text-xs font-mono font-bold border"></span>
            <button type="button" class="dd-check-roll-btn px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center space-x-1 shadow-md transition-all active:scale-95 cursor-pointer">
              <span>🎲 Roll d20</span>
            </button>
          `;
          header.appendChild(btnGroup);
        }
      }
      // Ensure child lines have .dd-check-line
      const contentEl = check.querySelector('.dd-block-content');
      if (contentEl) {
        contentEl.querySelectorAll('p').forEach((p) => {
          p.classList.add('dd-check-line', 'my-1', 'p-2', 'rounded-xl', 'transition-all', 'leading-relaxed');
        });
      }
    });
  }, []);

  const isDirtyRef = useRef(false);

  // Sync state when selected note changes
  useEffect(() => {
    isUpdatingFromPropRef.current = true;
    isDirtyRef.current = false;
    setTitle(note.name);
    setCategory(note.category || 'Session');
    setParentId(note.parentId || null);
    setIsPlayerVisible(note.isPlayerVisible || false);
    setCoverImageUrl(note.coverImageUrl || '');
    setCoverImagePositionY(note.coverImagePositionY ?? 50);
    setCoverImageHeight(note.coverImageHeight ?? 280);

    if (editorRef.current) {
      editorRef.current.innerHTML = markdownToHtml(note.content || '');
      ensureCheckCardsInteractive();
    }
    setSaveStatus('saved');
    setTimeout(() => {
      isUpdatingFromPropRef.current = false;
    }, 50);
  }, [note.id, ensureCheckCardsInteractive]);

  // Synchronous immediate save
  const performSave = useCallback((overrideHtml?: string, overrideTitle?: string, overrideCat?: NoteCategory, overrideParent?: string | null, overrideVis?: boolean) => {
    if (isUpdatingFromPropRef.current || !editorRef.current) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }

    const currentHtml = overrideHtml !== undefined ? overrideHtml : editorRef.current.innerHTML;
    const markdownContent = htmlToMarkdown(currentHtml);

    const activeTitle = overrideTitle !== undefined ? overrideTitle : titleRef.current;
    const activeCat = overrideCat !== undefined ? overrideCat : categoryRef.current;
    const activeParent = overrideParent !== undefined ? overrideParent : parentIdRef.current;
    const activeVis = overrideVis !== undefined ? overrideVis : isPlayerVisibleRef.current;

    const updatedNote: CampaignNote = {
      ...noteRef.current,
      name: activeTitle.trim() || 'Untitled Note',
      category: activeCat,
      parentId: activeParent,
      isPlayerVisible: activeVis,
      coverImageUrl: coverImageUrlRef.current || undefined,
      coverImagePositionY: coverImagePositionYRef.current,
      coverImageHeight: coverImageHeightRef.current,
      content: markdownContent,
      updatedAt: new Date().toISOString(),
    };

    isDirtyRef.current = false;
    saveCampaignNote(campaignId, updatedNote, true);
    setSaveStatus('saved');
  }, [campaignId, saveCampaignNote]);

  const handleSaveCoverUrl = (url: string) => {
    setCoverImageUrl(url);
    coverImageUrlRef.current = url;
    scheduleSave();
    showToast('Cover image applied');
  };

  const handleUpdateCoverPosition = (pos: number) => {
    setCoverImagePositionY(pos);
    coverImagePositionYRef.current = pos;
    scheduleSave();
  };

  const handleUpdateCoverHeight = (h: number) => {
    setCoverImageHeight(h);
    coverImageHeightRef.current = h;
    scheduleSave();
  };

  const handleRemoveCover = () => {
    setCoverImageUrl('');
    coverImageUrlRef.current = '';
    scheduleSave();
    showToast('Cover image removed');
  };

  // Debounced auto-save handler (750ms to prevent typing lag while keeping edits safe)
  const scheduleSave = useCallback((overrideHtml?: string, overrideTitle?: string, overrideCat?: NoteCategory, overrideParent?: string | null, overrideVis?: boolean) => {
    if (isUpdatingFromPropRef.current) return;
    isDirtyRef.current = true;
    setSaveStatus('saving');

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      performSave(overrideHtml, overrideTitle, overrideCat, overrideParent, overrideVis);
    }, 750);
  }, [performSave]);

  // Immediate save flush on unmount only if note has unsaved changes
  useEffect(() => {
    return () => {
      if (isDirtyRef.current && editorRef.current && !isUpdatingFromPropRef.current) {
        performSave();
      }
    };
  }, [performSave]);

  // Immediate save flush on window close / unload (vital for pop-out window safety)
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isDirtyRef.current && editorRef.current && !isUpdatingFromPropRef.current) {
        performSave();
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [performSave]);

  // Listen to cross-window note updates (sync note if edited in pop-out or main window)
  useEffect(() => {
    const unsub = crossWindowService.subscribe((event) => {
      if (event.type === 'NOTE_SAVED' && event.note.id === note.id) {
        // If the user isn't currently editing this note in this window, sync the latest text
        if (editorRef.current && document.activeElement !== editorRef.current) {
          isUpdatingFromPropRef.current = true;
          setTitle(event.note.name);
          setCategory(event.note.category || 'Session');
          setParentId(event.note.parentId || null);
          setIsPlayerVisible(event.note.isPlayerVisible || false);
          setCoverImageUrl(event.note.coverImageUrl || '');
          setCoverImagePositionY(event.note.coverImagePositionY ?? 50);
          setCoverImageHeight(event.note.coverImageHeight ?? 280);
          editorRef.current.innerHTML = markdownToHtml(event.note.content || '');
          ensureCheckCardsInteractive();
          isDirtyRef.current = false;
          setSaveStatus('saved');
          setTimeout(() => {
            isUpdatingFromPropRef.current = false;
          }, 50);
        }
      }
    });
    return unsub;
  }, [note.id, ensureCheckCardsInteractive]);

  // Handle live content changes
  const handleInput = () => {
    if (editorRef.current) {
      scheduleSave(editorRef.current.innerHTML);
    }
  };

  // Track active formatting of current text selection
  const [activeFormats, setActiveFormats] = useState<{
    bold: boolean;
    italic: boolean;
    underline: boolean;
    strikethrough: boolean;
    h1: boolean;
    h2: boolean;
    h3: boolean;
    list: boolean;
  }>({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    h1: false,
    h2: false,
    h3: false,
    list: false,
  });

  // Check text selection for floating formatting toolbar and detect active styles
  const handleSelectionChange = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !editorRef.current?.contains(sel.anchorNode)) {
      setSelectionToolbar((prev) => prev.isVisible ? { ...prev, isVisible: false } : prev);
      return;
    }

    if (sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    if (rect.width > 0 || rect.height > 0) {
      const topPos = rect.top >= 54 ? rect.top - 46 : rect.bottom + 10;
      const leftPos = Math.max(16, Math.min(window.innerWidth - 300, rect.left + rect.width / 2 - 140));

      setSelectionToolbar({
        isVisible: true,
        position: {
          top: topPos,
          left: leftPos,
        },
      });

      // Detect active formatting states
      let h1 = false;
      let h2 = false;
      let h3 = false;
      let isUnderline = false;
      let isStrikethrough = false;

      const isBold = document.queryCommandState('bold');
      const isItalic = document.queryCommandState('italic');
      const isList = document.queryCommandState('insertUnorderedList');
      const cmdUnderline = document.queryCommandState('underline');
      const cmdStrike = document.queryCommandState('strikeThrough');

      let curr: Node | null = sel.anchorNode;
      while (curr && curr !== editorRef.current) {
        if (curr.nodeType === Node.ELEMENT_NODE) {
          const el = curr as HTMLElement;
          const tag = el.tagName.toLowerCase();
          if (tag === 'h1') h1 = true;
          if (tag === 'h2') h2 = true;
          if (tag === 'h3') h3 = true;
          if (tag === 'u' || tag === 'ins' || el.style?.textDecoration?.includes('underline')) {
            isUnderline = true;
          }
          if (tag === 'del' || tag === 's' || tag === 'strike' || el.style?.textDecoration?.includes('line-through')) {
            isStrikethrough = true;
          }
        }
        curr = curr.parentNode;
      }

      setActiveFormats({
        bold: isBold,
        italic: isItalic,
        underline: isUnderline || cmdUnderline,
        strikethrough: isStrikethrough || cmdStrike,
        h1,
        h2,
        h3,
        list: isList,
      });
    }
  }, []);

  // Listen to document selectionchange with requestAnimationFrame throttle to eliminate typing lag
  useEffect(() => {
    let animId: number | null = null;
    const onDocSelectionChange = () => {
      if (animId !== null) cancelAnimationFrame(animId);
      animId = requestAnimationFrame(() => {
        handleSelectionChange();
      });
    };
    document.addEventListener('selectionchange', onDocSelectionChange);
    return () => {
      if (animId !== null) cancelAnimationFrame(animId);
      document.removeEventListener('selectionchange', onDocSelectionChange);
    };
  }, [handleSelectionChange]);

  // Execute inline rich text commands with custom unwrap handling
  const toggleInlineFormat = (cmd: 'bold' | 'italic' | 'underline' | 'strikeThrough') => {
    editorRef.current?.focus();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    if (cmd === 'strikeThrough') {
      // Check if we are inside a <del>, <s>, or <strike>
      let strikeEl: HTMLElement | null = null;
      let curr: Node | null = sel.anchorNode;
      while (curr && curr !== editorRef.current) {
        if (curr.nodeType === Node.ELEMENT_NODE) {
          const el = curr as HTMLElement;
          const tag = el.tagName.toLowerCase();
          if (tag === 's' || tag === 'strike' || tag === 'del' || el.style?.textDecoration?.includes('line-through')) {
            strikeEl = el;
            break;
          }
        }
        curr = curr.parentNode;
      }

      if (strikeEl && (strikeEl.tagName.toLowerCase() === 'del' || strikeEl.style?.textDecoration?.includes('line-through'))) {
        // If it's a <del> or styled span, unwrap it directly
        const parent = strikeEl.parentNode;
        if (parent) {
          while (strikeEl.firstChild) {
            parent.insertBefore(strikeEl.firstChild, strikeEl);
          }
          parent.removeChild(strikeEl);
        }
      } else {
        document.execCommand('strikeThrough', false);
      }
    } else if (cmd === 'underline') {
      let uEl: HTMLElement | null = null;
      let curr: Node | null = sel.anchorNode;
      while (curr && curr !== editorRef.current) {
        if (curr.nodeType === Node.ELEMENT_NODE) {
          const el = curr as HTMLElement;
          const tag = el.tagName.toLowerCase();
          if (tag === 'u' || tag === 'ins' || el.style?.textDecoration?.includes('underline')) {
            uEl = el;
            break;
          }
        }
        curr = curr.parentNode;
      }

      if (uEl && (uEl.tagName.toLowerCase() === 'ins' || uEl.style?.textDecoration?.includes('underline'))) {
        const parent = uEl.parentNode;
        if (parent) {
          while (uEl.firstChild) {
            parent.insertBefore(uEl.firstChild, uEl);
          }
          parent.removeChild(uEl);
        }
      } else {
        document.execCommand('underline', false);
      }
    } else {
      document.execCommand(cmd, false);
    }

    handleInput();
    setTimeout(handleSelectionChange, 15);
  };

  // Toggle heading level (revert to <p> if already this heading)
  const toggleHeading = (level: 1 | 2 | 3) => {
    editorRef.current?.focus();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    const targetTag = `h${level}`;

    // Find the enclosing block element (h1, h2, h3, p)
    let block: HTMLElement | null = null;
    let curr: Node | null = sel.anchorNode;
    while (curr && curr !== editorRef.current) {
      if (curr.nodeType === Node.ELEMENT_NODE) {
        const el = curr as HTMLElement;
        const tag = el.tagName.toLowerCase();
        if (['h1', 'h2', 'h3', 'p'].includes(tag)) {
          block = el;
          break;
        }
      }
      curr = curr.parentNode;
    }

    const currentTag = block?.tagName.toLowerCase();
    const isAlreadyTarget = currentTag === targetTag;
    const newTag = isAlreadyTarget ? 'p' : targetTag;

    // Apply formatBlock
    let applied = false;
    try {
      applied = document.execCommand('formatBlock', false, `<${newTag}>`);
    } catch (_) {}
    if (!applied) {
      try {
        applied = document.execCommand('formatBlock', false, newTag);
      } catch (_) {}
    }

    // Direct DOM fallback ONLY if block remains unchanged in document
    if (block && block.parentNode && document.body.contains(block)) {
      if (block.tagName.toLowerCase() !== newTag) {
        const newEl = document.createElement(newTag);
        while (block.firstChild) {
          newEl.appendChild(block.firstChild);
        }
        block.parentNode.replaceChild(newEl, block);
      }
    }

    handleInput();
    setTimeout(handleSelectionChange, 15);
  };

  const toggleList = () => {
    editorRef.current?.focus();
    document.execCommand('insertUnorderedList', false);
    handleInput();
    setTimeout(handleSelectionChange, 20);
  };

  // Helper to accurately locate caret position for popups
  const getCaretCoordinates = (): { top: number; left: number } => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) {
      if (editorRef.current) {
        const r = editorRef.current.getBoundingClientRect();
        return { top: r.top + 30, left: r.left + 20 };
      }
      return { top: 100, left: 100 };
    }

    const range = sel.getRangeAt(0);

    // 1. Check client rects (often populated even when collapsed bounding rect is 0)
    const clientRects = range.getClientRects();
    if (clientRects.length > 0) {
      const r = clientRects[0];
      if (r.top > 0 || r.bottom > 0 || r.left > 0) {
        return {
          top: r.bottom + 6,
          left: Math.max(16, Math.min(window.innerWidth - 320, r.left)),
        };
      }
    }

    // 2. Direct getBoundingClientRect
    const rect = range.getBoundingClientRect();
    if (rect && (rect.width > 0 || rect.height > 0 || rect.top > 0 || rect.left > 0)) {
      return {
        top: rect.bottom + 6,
        left: Math.max(16, Math.min(window.innerWidth - 320, rect.left)),
      };
    }

    // 3. If in a text node and startOffset > 0 (e.g. immediately after typing \), measure that char
    if (range.startContainer.nodeType === Node.TEXT_NODE) {
      if (range.startOffset > 0) {
        try {
          const testRange = range.cloneRange();
          testRange.setStart(range.startContainer, range.startOffset - 1);
          testRange.setEnd(range.startContainer, range.startOffset);
          const r = testRange.getBoundingClientRect();
          if (r && (r.top > 0 || r.left > 0 || r.bottom > 0)) {
            return {
              top: r.bottom + 6,
              left: Math.max(16, Math.min(window.innerWidth - 320, r.right)),
            };
          }
        } catch (_) {}
      }
    }

    // 4. Temporary marker element right at the caret
    try {
      const marker = document.createElement('span');
      marker.textContent = '\uFEFF';
      const markerRange = range.cloneRange();
      markerRange.collapse(true);
      markerRange.insertNode(marker);
      const mRect = marker.getBoundingClientRect();
      marker.parentNode?.removeChild(marker);

      if (mRect && (mRect.top > 0 || mRect.bottom > 0 || mRect.left > 0)) {
        return {
          top: mRect.bottom + 6,
          left: Math.max(16, Math.min(window.innerWidth - 320, mRect.left)),
        };
      }
    } catch (_) {}

    // 5. Container element fallback
    let container: Node | null = range.startContainer;
    if (container.nodeType === Node.TEXT_NODE) {
      container = container.parentElement;
    }
    if (container && container instanceof HTMLElement) {
      const cRect = container.getBoundingClientRect();
      if (cRect && (cRect.top > 0 || cRect.bottom > 0)) {
        return {
          top: cRect.bottom + 6,
          left: Math.max(16, Math.min(window.innerWidth - 320, cRect.left)),
        };
      }
    }

    // 6. Editor fallback
    if (editorRef.current) {
      const eRect = editorRef.current.getBoundingClientRect();
      return { top: eRect.top + 30, left: eRect.left + 20 };
    }

    return { top: 100, left: 100 };
  };

  // Keyboard navigation & slash/backslash command listener
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // 1. Backslash `\` trigger
    if (e.key === '\\') {
      setTimeout(() => {
        const coords = getCaretCoordinates();
        setSlashMenu({
          isOpen: true,
          query: '',
          triggerChar: '\\',
          triggerPos: 0,
          position: coords,
        });
      }, 0);
      return;
    }

    // 1b. At `@` mention trigger to link compendium/note entries
    if (e.key === '@' && !e.ctrlKey && !e.metaKey && !e.altKey) {
      setTimeout(() => {
        saveSelection('@');
        setIsCompendiumModalOpen(true);
      }, 0);
      return;
    }

    // 2. If slash menu is open, handle typing query & navigation
    if (slashMenu.isOpen) {
      if (e.key === 'Escape') {
        setSlashMenu((prev) => ({ ...prev, isOpen: false }));
        return;
      }
      if (e.key === 'Backspace') {
        if (slashMenu.query.length === 0) {
          setSlashMenu((prev) => ({ ...prev, isOpen: false }));
        } else {
          setSlashMenu((prev) => ({ ...prev, query: prev.query.slice(0, -1) }));
        }
        return;
      }
      if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        setSlashMenu((prev) => ({ ...prev, query: prev.query + e.key }));
        return;
      }
    }

    // 3. Formatting Shortcuts
    if (e.ctrlKey || e.metaKey) {
      if (e.key.toLowerCase() === 's' && !e.shiftKey) {
        e.preventDefault();
        performSave();
        showToast('Note saved');
        return;
      }
      if (e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleInlineFormat('bold');
      } else if (e.key.toLowerCase() === 'i') {
        e.preventDefault();
        toggleInlineFormat('italic');
      } else if (e.key.toLowerCase() === 'u') {
        e.preventDefault();
        toggleInlineFormat('underline');
      } else if (e.shiftKey && (e.key.toLowerCase() === 's' || e.key.toLowerCase() === 'x')) {
        e.preventDefault();
        toggleInlineFormat('strikeThrough');
      }
    }
  };

  // Clean up slash trigger character and typed query
  const cleanUpSlashTrigger = () => {
    if (slashMenu.isOpen) {
      const charsToDelete = 1 + slashMenu.query.length;
      for (let i = 0; i < charsToDelete; i++) {
        document.execCommand('delete', false);
      }
      setSlashMenu((prev) => ({ ...prev, isOpen: false }));
    }
  };

  // Insert a rich HTML block or markdown snippet
  const insertHtmlBlock = (html: string) => {
    if (!editorRef.current) return;

    // Restore saved caret selection range if available so text inserts at the exact trigger spot
    if (savedRangeRef.current) {
      editorRef.current.focus({ preventScroll: true });
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(savedRangeRef.current);
      }
      savedRangeRef.current = null;
    } else {
      editorRef.current.focus({ preventScroll: true });
    }

    if (scrollContainerRef.current && savedScrollTopRef.current !== undefined) {
      scrollContainerRef.current.scrollTop = savedScrollTopRef.current;
    }

    // Clean up slash trigger text if any
    cleanUpSlashTrigger();

    document.execCommand('insertHTML', false, html);

    if (scrollContainerRef.current && savedScrollTopRef.current !== undefined) {
      scrollContainerRef.current.scrollTop = savedScrollTopRef.current;
    }

    ensureCheckCardsInteractive();
    handleInput();
  };

  // Insert inline compendium badge without splitting paragraph or creating newlines
  const insertEntityBadge = (type: string, label: string, id: string) => {
    if (!editorRef.current) return;

    // Focus without auto-scrolling to the top of the editor
    editorRef.current.focus({ preventScroll: true });

    // Restore scroll position
    if (scrollContainerRef.current && savedScrollTopRef.current !== undefined) {
      scrollContainerRef.current.scrollTop = savedScrollTopRef.current;
    }

    const sel = window.getSelection();
    let range: Range | null = null;

    if (savedRangeRef.current) {
      range = savedRangeRef.current;
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(range);
      }
      savedRangeRef.current = null;
    } else if (sel && sel.rangeCount > 0) {
      range = sel.getRangeAt(0);
    }

    // If triggered by '@' and '@' is right before the cursor, remove it
    if (mentionTriggerRef.current === '@') {
      try {
        document.execCommand('delete', false);
      } catch (_) {}
      mentionTriggerRef.current = null;
    } else {
      cleanUpSlashTrigger();
    }

    // Get fresh range after trigger removal
    const currentSel = window.getSelection();
    const activeRange = (currentSel && currentSel.rangeCount > 0) ? currentSel.getRangeAt(0) : range;

    if (activeRange) {
      activeRange.deleteContents();

      const badge = document.createElement('span');
      badge.className = 'dd-entity-badge';
      badge.setAttribute('data-type', type);
      badge.setAttribute('data-id', id);
      badge.setAttribute('contenteditable', 'false');
      const icon = type === 'map' ? '🗺️' : '🔮';
      badge.textContent = `${icon} ${label}`;

      // Insert trailing non-breaking space
      const space = document.createTextNode('\u00A0');

      activeRange.insertNode(space);
      activeRange.insertNode(badge);

      // Position caret right after the inserted badge & space
      const newRange = document.createRange();
      newRange.setStartAfter(space);
      newRange.setEndAfter(space);
      if (currentSel) {
        currentSel.removeAllRanges();
        currentSel.addRange(newRange);
      }

      // Ensure scroll container remains at saved position
      if (scrollContainerRef.current && savedScrollTopRef.current !== undefined) {
        scrollContainerRef.current.scrollTop = savedScrollTopRef.current;
      }
    }

    handleInput();
  };

  const insertSnippet = (prefix: string, suffix: string = '') => {
    const sample = 'Type here...';
    const combined = `${prefix}${sample}${suffix}`;
    const html = markdownToHtml(combined);
    insertHtmlBlock(html);
  };

  const CatIcon = getNoteCategoryIcon(category);
  const catStyle = getNoteCategoryStyle(category);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#090d12] overflow-hidden select-text">
      {/* Top Document Toolbar */}
      <div className="h-12 border-b border-surface-border px-3 sm:px-4 flex items-center justify-between bg-surface-100/80 shrink-0 select-none gap-2 min-w-0">
        {/* Left: Category & Parent Folder & Quick Visibility Toggle */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 min-w-0 shrink-0">
          {/* Category Dropdown */}
          <div className="relative shrink-0">
            <select
              value={category}
              onChange={(e) => {
                const newCat = e.target.value as NoteCategory;
                setCategory(newCat);
                scheduleSave(undefined, undefined, newCat);
              }}
              className={`pl-7 pr-5 py-1 rounded-full text-xs font-bold border transition-colors bg-surface-50 focus:outline-none focus:border-amber-500 appearance-none cursor-pointer ${catStyle.badgeBg}`}
            >
              {CATEGORY_OPTIONS.map((cat) => (
                <option key={cat} value={cat} className="bg-surface-100 text-slate-200">
                  {cat}
                </option>
              ))}
            </select>
            <CatIcon className={`w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none ${catStyle.iconClass}`} />
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Folder Parent Dropdown */}
          <div className="relative shrink-0 max-w-[120px] sm:max-w-[150px] md:max-w-[180px]">
            <select
              value={parentId || ''}
              onChange={(e) => {
                const newParent = e.target.value || null;
                setParentId(newParent);
                scheduleSave(undefined, undefined, undefined, newParent);
              }}
              className="w-full pl-6 pr-5 py-1 rounded-lg text-xs bg-surface-50 hover:bg-surface-hover border border-surface-border text-slate-300 focus:outline-none focus:border-amber-500 appearance-none cursor-pointer truncate"
              title={folders.find((f) => f.id === parentId)?.name || 'Root Folder'}
            >
              <option value="" className="bg-surface-100 text-slate-300">📁 Root</option>
              {folders.map((f) => (
                <option key={f.id} value={f.id} className="bg-surface-100 text-slate-200">
                  📁 {f.name}
                </option>
              ))}
            </select>
            <Folder className="w-3.5 h-3.5 text-amber-500 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Quick Visibility Toggle Icon */}
          <button
            type="button"
            onClick={() => {
              const nextVis = !isPlayerVisible;
              setIsPlayerVisible(nextVis);
              scheduleSave(undefined, undefined, undefined, undefined, nextVis);
              showToast(nextVis ? 'Marked as Player Handout' : 'Marked as GM Secret');
            }}
            className={`p-1.5 rounded-lg border text-xs transition-colors shrink-0 ${
              isPlayerVisible
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/80 hover:bg-emerald-900'
                : 'bg-surface-50 text-slate-400 hover:text-slate-200 border-surface-border hover:bg-surface-hover'
            }`}
            title={isPlayerVisible ? 'Player Handout (Visible to Players - click to hide)' : 'GM Secret (Hidden from Players - click to make handout)'}
          >
            {isPlayerVisible ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Right: Auto-Save Status, Bookmark, Pop-out, More (...) Dropdown */}
        <div className="flex items-center space-x-1.5 shrink-0">
          {/* Save Status */}
          <div 
            className="text-[11px] font-mono text-slate-400 px-1 py-0.5 flex items-center space-x-1 select-none"
            title={saveStatus === 'saving' ? 'Saving changes...' : 'All changes saved (Ctrl+S)'}
          >
            {saveStatus === 'saving' ? (
              <span className="text-amber-400 flex items-center space-x-1 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block animate-ping mr-0.5" />
                <span className="hidden sm:inline">Saving</span>
              </span>
            ) : (
              <span className="text-emerald-400/80 flex items-center space-x-1">
                <Check className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Saved</span>
              </span>
            )}
          </div>

          <div className="h-4 w-px bg-surface-border/80" />

          {/* Bookmark Button (Icon mode) */}
          <BookmarkButton
            type={category === 'NPC' ? 'npc' : (category === 'Lore' ? 'lore' : (category === 'Image' ? 'image' : 'note'))}
            targetId={note.id}
            title={title || note.name}
            subtitle={`${category} • Campaign Note`}
            category={category}
            imageUrl={note.imageUrl}
            campaignId={campaignId}
            showText={false}
            size="md"
          />

          {/* Pop-out Note Window Button */}
          <button
            onClick={() => openNotesWindow(note.id, campaignId)}
            className="p-1.5 bg-surface-50 hover:bg-surface-hover border border-surface-border text-slate-300 hover:text-amber-300 rounded-lg transition-all"
            title="Open in Pop-out Window (Read notes while managing map)"
          >
            <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
          </button>

          {/* More Options Dropdown Menu (...) */}
          <div className="relative" ref={moreMenuRef}>
            <button
              type="button"
              onClick={() => setIsMoreMenuOpen((prev) => !prev)}
              className={`p-1.5 rounded-lg border transition-colors ${
                isMoreMenuOpen
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                  : 'bg-surface-50 hover:bg-surface-hover text-slate-300 hover:text-white border-surface-border'
              }`}
              title="More Actions"
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>

            {isMoreMenuOpen && (
              <div 
                className="absolute right-0 top-full mt-1.5 w-52 bg-[#121720] border border-surface-border rounded-xl shadow-2xl p-1 z-50 flex flex-col space-y-0.5 animate-scaleUp font-sans"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Project to TV */}
                <button
                  onClick={() => {
                    setIsMoreMenuOpen(false);
                    projectMediaToDisplay({
                      id: note.id,
                      type: 'note',
                      title: title || note.name,
                      content: editorRef.current ? htmlToMarkdown(editorRef.current.innerHTML) : note.content,
                      badge: category,
                      imageUrl: coverImageUrl || undefined,
                    });
                    showToast(`Projected "${title || note.name}" to TV!`);
                  }}
                  className="w-full flex items-center space-x-2 px-2.5 py-1.5 text-xs font-semibold rounded-lg hover:bg-surface-50 text-sky-300 transition-colors text-left"
                >
                  <Tv className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span>Project to TV</span>
                </button>

                {/* Cover Artwork */}
                <button
                  onClick={() => {
                    setIsMoreMenuOpen(false);
                    setIsCoverModalOpen(true);
                  }}
                  className="w-full flex items-center space-x-2 px-2.5 py-1.5 text-xs font-semibold rounded-lg hover:bg-surface-50 text-slate-200 transition-colors text-left"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{coverImageUrl ? 'Change Cover Artwork' : 'Add Cover Artwork'}</span>
                </button>

                {/* Remove Cover Artwork (if set) */}
                {coverImageUrl && (
                  <button
                    onClick={() => {
                      setIsMoreMenuOpen(false);
                      handleRemoveCover();
                    }}
                    className="w-full flex items-center space-x-2 px-2.5 py-1.5 text-xs font-semibold rounded-lg hover:bg-surface-50 text-slate-400 hover:text-red-400 transition-colors text-left pl-8"
                  >
                    <span>Remove Cover</span>
                  </button>
                )}

                {/* Player Handout Toggle */}
                <button
                  onClick={() => {
                    setIsMoreMenuOpen(false);
                    const nextVis = !isPlayerVisible;
                    setIsPlayerVisible(nextVis);
                    scheduleSave(undefined, undefined, undefined, undefined, nextVis);
                    showToast(nextVis ? 'Marked as Player Handout' : 'Marked as GM Secret');
                  }}
                  className="w-full flex items-center space-x-2 px-2.5 py-1.5 text-xs font-semibold rounded-lg hover:bg-surface-50 text-slate-200 transition-colors text-left"
                >
                  {isPlayerVisible ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Make GM Secret</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Make Player Handout</span>
                    </>
                  )}
                </button>

                <div className="my-1 border-t border-surface-border/60" />

                {/* Delete Note */}
                <button
                  onClick={() => {
                    setIsMoreMenuOpen(false);
                    if (confirm(`Delete note "${note.name}"?`)) {
                      onDeleteNote(note.id);
                    }
                  }}
                  className="w-full flex items-center space-x-2 px-2.5 py-1.5 text-xs font-semibold rounded-lg hover:bg-red-950/50 text-red-400 transition-colors text-left"
                >
                  <Trash2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Delete Note</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Scrollable Live Document View */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-6 py-8 flex flex-col items-center"
        onMouseUp={handleSelectionChange}
        onKeyUp={handleSelectionChange}
      >
        <div className="w-full max-w-3xl space-y-6">
          {/* Cover Artwork Banner with Watercolor Blend */}
          {coverImageUrl ? (
            <NoteCoverBanner
              imageUrl={coverImageUrl}
              positionY={coverImagePositionY}
              height={coverImageHeight}
              isEditable
              onUpdatePosition={handleUpdateCoverPosition}
              onUpdateHeight={handleUpdateCoverHeight}
              onChangeCover={() => setIsCoverModalOpen(true)}
              onRemoveCover={handleRemoveCover}
            />
          ) : (
            <div className="flex items-center justify-start -mb-3">
              <button
                type="button"
                onClick={() => setIsCoverModalOpen(true)}
                className="opacity-40 hover:opacity-100 flex items-center space-x-1.5 text-xs text-slate-400 hover:text-amber-400 font-medium py-1 px-2.5 rounded-lg hover:bg-surface-100/50 transition-all select-none group"
              >
                <ImageIcon className="w-3.5 h-3.5 text-amber-500 group-hover:scale-110 transition-transform" />
                <span>+ Add Cover Artwork</span>
              </button>
            </div>
          )}

          {/* Live Editable Title */}
          <input
            type="text"
            value={title}
            onChange={(e) => {
              const newTitle = e.target.value;
              setTitle(newTitle);
              scheduleSave(undefined, newTitle);
            }}
            placeholder="Note Title..."
            className="w-full bg-transparent font-serif text-3xl sm:text-4xl font-bold text-amber-500 placeholder-slate-600 focus:outline-none border-b border-transparent focus:border-amber-500/40 pb-2 transition-colors"
          />

          {/* Quick Insert / Slash Command Helper Tip */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 border-b border-surface-border/40 pb-2 select-none">
            <span className="flex items-center space-x-1.5 flex-wrap gap-1">
              <span>Type</span>
              <kbd className="px-1.5 py-0.5 rounded bg-surface-100 text-amber-300 font-mono text-[10px] border border-surface-border font-bold">\</kbd>
              <span>for blocks, or</span>
              <kbd className="px-1.5 py-0.5 rounded bg-surface-100 text-cyan-300 font-mono text-[10px] border border-surface-border font-bold">@</kbd>
              <span>to link compendium entities</span>
            </span>

            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={() => insertSnippet('\n:::read-aloud\n', '\n:::\n')}
                className="px-2 py-0.5 rounded bg-surface-50 hover:bg-surface-hover text-slate-300 hover:text-amber-300 border border-surface-border flex items-center space-x-1 transition-colors"
              >
                <BookOpen className="w-3 h-3 text-amber-400" />
                <span>+ Read Aloud</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  saveSelection();
                  setIsDcModalOpen(true);
                }}
                className="px-2 py-0.5 rounded bg-surface-50 hover:bg-surface-hover text-slate-300 hover:text-amber-300 border border-surface-border flex items-center space-x-1 transition-colors"
              >
                <Dices className="w-3 h-3 text-amber-400" />
                <span>+ DC Check</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  saveSelection();
                  setIsCompendiumModalOpen(true);
                }}
                className="px-2 py-0.5 rounded bg-surface-50 hover:bg-surface-hover text-slate-300 hover:text-cyan-300 border border-surface-border flex items-center space-x-1 transition-colors"
              >
                <Link2 className="w-3 h-3 text-cyan-400" />
                <span>+ Compendium Link</span>
              </button>
            </div>
          </div>

          {/* Unified ContentEditable Markdown Surface */}
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            onBlur={() => performSave()}
            onClick={handleEditorClick}
            className="dd-live-note-content min-h-[500px] text-slate-200 focus:outline-none leading-relaxed text-sm selection:bg-amber-500/30 space-y-3 pb-24"
          />
        </div>
      </div>

      {/* Floating Selection Formatting Bubble Toolbar */}
      {selectionToolbar.isVisible && (
        <div
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          className="fixed z-50 flex items-center space-x-1 bg-[#121720]/95 backdrop-blur-md border border-amber-500/50 rounded-xl px-2 py-1.5 shadow-2xl shadow-black/80 animate-fadeIn select-none"
          style={{ top: `${selectionToolbar.position.top}px`, left: `${selectionToolbar.position.left}px` }}
        >
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onClick={() => toggleInlineFormat('bold')}
            className={`p-1.5 rounded transition-colors ${
              activeFormats.bold 
                ? 'bg-amber-500/30 text-amber-300 ring-1 ring-amber-400/50 font-bold' 
                : 'text-slate-300 hover:bg-surface-hover hover:text-white'
            }`}
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onClick={() => toggleInlineFormat('italic')}
            className={`p-1.5 rounded transition-colors ${
              activeFormats.italic 
                ? 'bg-amber-500/30 text-amber-300 ring-1 ring-amber-400/50' 
                : 'text-slate-300 hover:bg-surface-hover hover:text-white'
            }`}
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onClick={() => toggleInlineFormat('underline')}
            className={`p-1.5 rounded transition-colors ${
              activeFormats.underline 
                ? 'bg-amber-500/30 text-amber-300 ring-1 ring-amber-400/50' 
                : 'text-slate-300 hover:bg-surface-hover hover:text-white'
            }`}
            title="Underline (Ctrl+U)"
          >
            <Underline className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onClick={() => toggleInlineFormat('strikeThrough')}
            className={`p-1.5 rounded transition-colors ${
              activeFormats.strikethrough 
                ? 'bg-amber-500/30 text-amber-300 ring-1 ring-amber-400/50' 
                : 'text-slate-300 hover:bg-surface-hover hover:text-white'
            }`}
            title="Strikethrough (Ctrl+Shift+S)"
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-px bg-surface-border mx-1" />

          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onClick={() => toggleHeading(1)}
            className={`px-2 py-0.5 rounded text-xs font-serif font-bold transition-all ${
              activeFormats.h1
                ? 'bg-amber-500 text-slate-950 ring-1 ring-amber-400 shadow-xs'
                : 'text-amber-400 hover:bg-surface-hover'
            }`}
            title={activeFormats.h1 ? 'Remove Heading 1 (Convert to normal text)' : 'Heading 1'}
          >
            H1
          </button>

          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onClick={() => toggleHeading(2)}
            className={`px-2 py-0.5 rounded text-xs font-serif font-bold transition-all ${
              activeFormats.h2
                ? 'bg-amber-500 text-slate-950 ring-1 ring-amber-400 shadow-xs'
                : 'text-slate-200 hover:bg-surface-hover'
            }`}
            title={activeFormats.h2 ? 'Remove Heading 2 (Convert to normal text)' : 'Heading 2'}
          >
            H2
          </button>

          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onClick={() => toggleHeading(3)}
            className={`px-2 py-0.5 rounded text-xs font-serif font-bold transition-all ${
              activeFormats.h3
                ? 'bg-amber-500 text-slate-950 ring-1 ring-amber-400 shadow-xs'
                : 'text-amber-300 hover:bg-surface-hover'
            }`}
            title={activeFormats.h3 ? 'Remove Heading 3 (Convert to normal text)' : 'Heading 3'}
          >
            H3
          </button>

          <div className="h-4 w-px bg-surface-border mx-1" />

          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onClick={toggleList}
            className={`p-1.5 rounded transition-colors ${
              activeFormats.list 
                ? 'bg-amber-500/30 text-amber-300 ring-1 ring-amber-400/50' 
                : 'text-slate-300 hover:bg-surface-hover hover:text-white'
            }`}
            title="Bullet List"
          >
            <List className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onClick={() => {
              saveSelection();
              setIsCompendiumModalOpen(true);
            }}
            className="p-1.5 rounded hover:bg-surface-hover text-cyan-400 hover:text-cyan-300 transition-colors"
            title="Link Compendium Entity"
          >
            <Link2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Floating Slash / Backslash Command Menu */}
      {slashMenu.isOpen && (
        <SlashCommandMenu
          query={slashMenu.query}
          position={slashMenu.position}
          onClose={() => setSlashMenu((prev) => ({ ...prev, isOpen: false }))}
          onSelect={(item) => {
            item.action();
          }}
          onOpenDcModal={() => {
            cleanUpSlashTrigger();
            saveSelection();
            setIsDcModalOpen(true);
          }}
          onOpenCompendiumModal={() => {
            cleanUpSlashTrigger();
            saveSelection();
            setIsCompendiumModalOpen(true);
          }}
          onOpenImageModal={() => {
            cleanUpSlashTrigger();
            saveSelection();
            setIsImageModalOpen(true);
          }}
          onInsertSnippet={(prefix, suffix) => {
            insertSnippet(prefix, suffix);
          }}
        />
      )}

      {/* DC Check Builder Modal */}
      {isDcModalOpen && (
        <DcCheckModal
          onClose={() => {
            savedRangeRef.current = null;
            setIsDcModalOpen(false);
          }}
          onInsert={(snippet: string) => {
            insertHtmlBlock(markdownToHtml(snippet));
            setIsDcModalOpen(false);
          }}
        />
      )}

      {/* Compendium Link Modal */}
      {isCompendiumModalOpen && (
        <CompendiumLinkModal
          onClose={() => {
            savedRangeRef.current = null;
            setIsCompendiumModalOpen(false);
          }}
          onSelect={(tag: string) => {
            // Check for @[label](type:id) or [[type:label:id]]
            const atMatch = tag.match(/^@\[(.*?)\]\((monster|spell|item|npc|rule|note|map):([^\)]+)\)$/);
            if (atMatch) {
              insertEntityBadge(atMatch[2], atMatch[1], atMatch[3]);
            } else {
              const bracketMatch = tag.match(/^\[\[(monster|spell|item|npc|rule|note|map):([^:\]]+)(?::([^\]]+))?\]\]$/);
              if (bracketMatch) {
                const entityId = bracketMatch[3] || bracketMatch[2];
                insertEntityBadge(bracketMatch[1], bracketMatch[2], entityId);
              } else {
                insertHtmlBlock(tag);
              }
            }
            setIsCompendiumModalOpen(false);
          }}
        />
      )}

      {/* Image / Artwork Formatting Modal */}
      {isImageModalOpen && (
        <NoteImageModal
          onClose={() => {
            savedRangeRef.current = null;
            setIsImageModalOpen(false);
          }}
          onInsert={(snippet: string) => {
            insertHtmlBlock(markdownToHtml(snippet));
            setIsImageModalOpen(false);
          }}
        />
      )}

      {/* Cover Artwork Modal */}
      {isCoverModalOpen && (
        <NoteCoverModal
          currentUrl={coverImageUrl}
          onClose={() => setIsCoverModalOpen(false)}
          onSelect={handleSaveCoverUrl}
        />
      )}

      {/* Interactive Entity Statblock Modal (Monster, Spell, Item, Note) */}
      {activeEntityModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 select-none"
          onClick={() => setActiveEntityModal(null)}
        >
          <div 
            className="bg-[#121720] border border-surface-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-5 relative animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Right Actions */}
            <div className="absolute top-4 right-4 flex items-center space-x-2 z-10">
              {activeEntityModal.type === 'note' && (() => {
                const campaign = db.campaigns.find((c) => c.id === campaignId) || db.campaigns[0];
                const targetNote = (campaign?.notes || []).find((n) => n.id === activeEntityModal.id);
                if (!targetNote) return null;
                return (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveEntityModal(null);
                        setSelectedNoteId(targetNote.id);
                        setActiveTab('notes');
                        crossWindowService.broadcast({ type: 'SWITCH_NOTE', noteId: targetNote.id });
                        showToast(`Navigated to "${targetNote.name}"`);
                      }}
                      className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs flex items-center space-x-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
                      title="Navigate to and open this note in the editor"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                      <span>Navigate to Note</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        openNotesWindow(targetNote.id, campaign.id);
                      }}
                      className="p-1.5 bg-surface-50 hover:bg-surface-hover text-slate-300 hover:text-amber-300 border border-surface-border rounded-lg transition-colors cursor-pointer"
                      title="Open in Pop-out Window"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </>
                );
              })()}

              <button
                onClick={() => setActiveEntityModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-surface-100 hover:bg-surface-hover border border-surface-border transition-colors cursor-pointer"
                title="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {activeEntityModal.type === 'monster' && (() => {
              const monster = db.monsters?.find((m) => m.id === activeEntityModal.id);
              return monster ? <MonsterStatBlock monster={monster} /> : <p className="text-slate-400 text-xs">Monster not found.</p>;
            })()}
            {activeEntityModal.type === 'spell' && (() => {
              const spell = db.spells?.find((s) => s.id === activeEntityModal.id);
              return spell ? <SpellCard spell={spell} /> : <p className="text-slate-400 text-xs">Spell not found.</p>;
            })()}
            {activeEntityModal.type === 'item' && (() => {
              const item = db.items?.find((i) => i.id === activeEntityModal.id);
              return item ? <ItemCard item={item} /> : <p className="text-slate-400 text-xs">Item not found.</p>;
            })()}
            {activeEntityModal.type === 'note' && (() => {
              const campaign = db.campaigns.find((c) => c.id === campaignId) || db.campaigns[0];
              const targetNote = (campaign?.notes || []).find((n) => n.id === activeEntityModal.id);
              if (!targetNote) return <p className="text-slate-400 text-xs">Note not found.</p>;
              const catStyle = getNoteCategoryStyle(targetNote.category || 'General');
              const CatIcon = getNoteCategoryIcon(targetNote.category || 'General');

              return (
                <div className="space-y-3.5 pt-1">
                  <div className="flex items-center space-x-2 pr-48">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold border flex items-center space-x-1 ${catStyle.badgeBg}`}>
                      <CatIcon className={`w-3 h-3 ${catStyle.iconClass}`} />
                      <span>{targetNote.category || 'Note'}</span>
                    </span>
                    <h3 className="font-serif text-xl font-bold text-slate-100 truncate">{targetNote.name}</h3>
                  </div>

                  {targetNote.coverImageUrl && (
                    <div className="rounded-xl overflow-hidden border border-surface-border max-h-48 relative">
                      <img 
                        src={targetNote.coverImageUrl} 
                        alt={targetNote.name}
                        className="w-full h-40 object-cover object-center" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#121720] via-transparent to-transparent opacity-80" />
                    </div>
                  )}

                  <div className="text-slate-300 text-xs leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
                    <NoteContentRenderer content={targetNote.content || ''} />
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
