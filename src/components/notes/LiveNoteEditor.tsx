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
  Plus
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CampaignNote, NoteCategory } from '../../types/campaign';
import { BookmarkButton } from '../bookmarks/BookmarkButton';
import { SlashCommandMenu } from './SlashCommandMenu';
import { CompendiumLinkModal } from './CompendiumLinkModal';
import { DcCheckModal } from './DcCheckModal';
import { NoteImageModal } from './NoteImageModal';
import { markdownToHtml, htmlToMarkdown } from './markdownConverter';
import { getNoteCategoryIcon, getNoteCategoryStyle } from './NotesView';

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
    saveCampaignNote, 
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
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isUpdatingFromPropRef = useRef(false);

  // Sync state when selected note changes
  useEffect(() => {
    isUpdatingFromPropRef.current = true;
    setTitle(note.name);
    setCategory(note.category || 'Session');
    setParentId(note.parentId || null);
    setIsPlayerVisible(note.isPlayerVisible || false);

    if (editorRef.current) {
      editorRef.current.innerHTML = markdownToHtml(note.content || '');
    }
    setSaveStatus('saved');
    setTimeout(() => {
      isUpdatingFromPropRef.current = false;
    }, 50);
  }, [note.id]);

  // Debounced auto-save handler
  const scheduleSave = useCallback((updatedHtml?: string, updatedTitle?: string, updatedCat?: NoteCategory, updatedParent?: string | null, updatedVis?: boolean) => {
    if (isUpdatingFromPropRef.current) return;
    setSaveStatus('saving');

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      const currentHtml = updatedHtml !== undefined ? updatedHtml : (editorRef.current?.innerHTML || '');
      const markdownContent = htmlToMarkdown(currentHtml);

      const updatedNote: CampaignNote = {
        ...note,
        name: (updatedTitle !== undefined ? updatedTitle : title).trim() || 'Untitled Note',
        category: updatedCat !== undefined ? updatedCat : category,
        parentId: updatedParent !== undefined ? updatedParent : parentId,
        isPlayerVisible: updatedVis !== undefined ? updatedVis : isPlayerVisible,
        content: markdownContent,
        updatedAt: new Date().toISOString(),
      };

      saveCampaignNote(campaignId, updatedNote);
      setSaveStatus('saved');
    }, 800);
  }, [note, campaignId, title, category, parentId, isPlayerVisible, saveCampaignNote]);

  // Handle live content changes
  const handleInput = () => {
    if (editorRef.current) {
      scheduleSave(editorRef.current.innerHTML);
    }
  };

  // Helper to execute rich text commands
  const execCommand = (cmd: string, val?: string) => {
    document.execCommand(cmd, false, val);
    handleInput();
  };

  // Check text selection for floating formatting toolbar
  const handleSelectionChange = () => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !editorRef.current?.contains(sel.anchorNode)) {
      setSelectionToolbar((prev) => prev.isVisible ? { ...prev, isVisible: false } : prev);
      return;
    }

    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    if (rect.width > 0) {
      setSelectionToolbar({
        isVisible: true,
        position: {
          top: Math.max(10, rect.top - 46),
          left: Math.max(10, rect.left + rect.width / 2 - 140),
        },
      });
    }
  };

  // Keyboard navigation & slash/backslash command listener
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // 1. Backslash `\` or Slash `/` trigger
    if (e.key === '\\' || e.key === '/') {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        const top = rect.bottom + 8;
        const left = Math.max(20, Math.min(window.innerWidth - 320, rect.left));

        setSlashMenu({
          isOpen: true,
          query: '',
          triggerChar: e.key as '/' | '\\',
          triggerPos: 0,
          position: { top, left },
        });
      }
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
      if (e.key.toLowerCase() === 'b') {
        e.preventDefault();
        execCommand('bold');
      } else if (e.key.toLowerCase() === 'i') {
        e.preventDefault();
        execCommand('italic');
      } else if (e.key.toLowerCase() === 'u') {
        e.preventDefault();
        execCommand('underline');
      }
    }
  };

  // Insert a rich HTML block or markdown snippet
  const insertHtmlBlock = (html: string) => {
    if (!editorRef.current) return;
    editorRef.current.focus();

    // Clean up slash trigger text if any
    if (slashMenu.isOpen) {
      setSlashMenu((prev) => ({ ...prev, isOpen: false }));
    }

    document.execCommand('insertHTML', false, html);
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
      <div className="h-14 border-b border-surface-border px-6 flex items-center justify-between bg-surface-100/70 shrink-0 select-none">
        {/* Left: Category & Parent Folder & Visibility */}
        <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
          {/* Category Dropdown */}
          <div className="relative">
            <select
              value={category}
              onChange={(e) => {
                const newCat = e.target.value as NoteCategory;
                setCategory(newCat);
                scheduleSave(undefined, undefined, newCat);
              }}
              className={`pl-8 pr-6 py-1 rounded-full text-xs font-bold border transition-colors bg-surface-50 focus:outline-none focus:border-amber-500 appearance-none cursor-pointer ${catStyle.badgeBg}`}
            >
              {CATEGORY_OPTIONS.map((cat) => (
                <option key={cat} value={cat} className="bg-surface-100 text-slate-200">
                  {cat}
                </option>
              ))}
            </select>
            <CatIcon className={`w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${catStyle.iconClass}`} />
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Folder Parent Dropdown */}
          <div className="relative">
            <select
              value={parentId || ''}
              onChange={(e) => {
                const newParent = e.target.value || null;
                setParentId(newParent);
                scheduleSave(undefined, undefined, undefined, newParent);
              }}
              className="pl-7 pr-6 py-1 rounded-lg text-xs bg-surface-50 hover:bg-surface-hover border border-surface-border text-slate-300 focus:outline-none focus:border-amber-500 appearance-none cursor-pointer"
            >
              <option value="" className="bg-surface-100 text-slate-300">📁 Root Folder</option>
              {folders.map((f) => (
                <option key={f.id} value={f.id} className="bg-surface-100 text-slate-200">
                  📁 {f.name}
                </option>
              ))}
            </select>
            <Folder className="w-3.5 h-3.5 text-amber-500 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Player Handout Toggle */}
          <button
            type="button"
            onClick={() => {
              const nextVis = !isPlayerVisible;
              setIsPlayerVisible(nextVis);
              scheduleSave(undefined, undefined, undefined, undefined, nextVis);
              showToast(nextVis ? 'Marked as Player Handout' : 'Marked as GM Secret');
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors border ${
              isPlayerVisible
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/80'
                : 'bg-surface-50 text-slate-400 hover:text-slate-200 border-surface-border'
            }`}
            title="Toggle player visibility (Player Handout vs GM Secret)"
          >
            {isPlayerVisible ? (
              <>
                <Eye className="w-3.5 h-3.5 text-emerald-400" />
                <span>Player Handout</span>
              </>
            ) : (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                <span>GM Secret</span>
              </>
            )}
          </button>
        </div>

        {/* Right: Auto-Save Status, TV Project, Bookmark, Delete */}
        <div className="flex items-center space-x-2">
          <span className="text-[11px] font-mono text-slate-500 flex items-center space-x-1 mr-1">
            {saveStatus === 'saving' ? (
              <span className="text-amber-400 animate-pulse">Saving...</span>
            ) : (
              <span className="text-emerald-400/80 flex items-center space-x-1">
                <Check className="w-3 h-3" />
                <span>Saved</span>
              </span>
            )}
          </span>

          <BookmarkButton
            type={category === 'NPC' ? 'npc' : (category === 'Lore' ? 'lore' : (category === 'Image' ? 'image' : 'note'))}
            targetId={note.id}
            title={title || note.name}
            subtitle={`${category} • Campaign Note`}
            category={category}
            imageUrl={note.imageUrl}
            campaignId={campaignId}
            showText
            size="md"
          />

          <button
            onClick={() => {
              projectMediaToDisplay({
                id: note.id,
                type: 'note',
                title: title || note.name,
                content: editorRef.current ? htmlToMarkdown(editorRef.current.innerHTML) : note.content,
                badge: category,
              });
              showToast(`Projected "${title || note.name}" to TV!`);
            }}
            className="px-3 py-1.5 bg-gradient-to-r from-indigo-950 to-sky-950 hover:from-indigo-900 hover:to-sky-900 border border-sky-600/60 text-sky-300 text-xs font-bold rounded-lg flex items-center space-x-1.5 transition-all shadow-md shadow-sky-950/40"
            title="Project live note to Player Screen / TV"
          >
            <Tv className="w-3.5 h-3.5 text-sky-400" />
            <span>Project to TV</span>
          </button>

          <button
            onClick={() => {
              if (confirm(`Delete note "${note.name}"?`)) {
                onDeleteNote(note.id);
              }
            }}
            className="p-1.5 bg-surface-50 hover:bg-red-950 text-slate-400 hover:text-red-400 border border-surface-border rounded-lg transition-colors"
            title="Delete note"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Scrollable Live Document View */}
      <div 
        className="flex-1 overflow-y-auto px-6 py-8 flex flex-col items-center"
        onMouseUp={handleSelectionChange}
        onKeyUp={handleSelectionChange}
      >
        <div className="w-full max-w-3xl space-y-6">
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
            <span className="flex items-center space-x-1.5">
              <span>Type</span>
              <kbd className="px-1.5 py-0.5 rounded bg-surface-100 text-amber-300 font-mono text-[10px] border border-surface-border font-bold">\</kbd>
              <span>or</span>
              <kbd className="px-1.5 py-0.5 rounded bg-surface-100 text-amber-300 font-mono text-[10px] border border-surface-border font-bold">/</kbd>
              <span>anywhere for headings, read-aloud boxes, DC checks, and compendium mentions</span>
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
                onClick={() => setIsDcModalOpen(true)}
                className="px-2 py-0.5 rounded bg-surface-50 hover:bg-surface-hover text-slate-300 hover:text-amber-300 border border-surface-border flex items-center space-x-1 transition-colors"
              >
                <Dices className="w-3 h-3 text-amber-400" />
                <span>+ DC Check</span>
              </button>

              <button
                type="button"
                onClick={() => setIsCompendiumModalOpen(true)}
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
            className="dd-live-note-content min-h-[500px] text-slate-200 focus:outline-none leading-relaxed text-sm selection:bg-amber-500/30 space-y-3 pb-24"
          />
        </div>
      </div>

      {/* Floating Selection Formatting Bubble Toolbar */}
      {selectionToolbar.isVisible && (
        <div
          className="fixed z-50 flex items-center space-x-1 bg-[#121720] border border-amber-500/50 rounded-xl px-2 py-1.5 shadow-2xl shadow-black/80 animate-fadeIn"
          style={{ top: `${selectionToolbar.position.top}px`, left: `${selectionToolbar.position.left}px` }}
        >
          <button
            onClick={() => execCommand('bold')}
            className="p-1.5 rounded hover:bg-surface-hover text-slate-300 hover:text-white transition-colors"
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => execCommand('italic')}
            className="p-1.5 rounded hover:bg-surface-hover text-slate-300 hover:text-white transition-colors"
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => execCommand('underline')}
            className="p-1.5 rounded hover:bg-surface-hover text-slate-300 hover:text-white transition-colors"
            title="Underline (Ctrl+U)"
          >
            <Underline className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => execCommand('strikeThrough')}
            className="p-1.5 rounded hover:bg-surface-hover text-slate-300 hover:text-white transition-colors"
            title="Strikethrough"
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-px bg-surface-border mx-1" />

          <button
            onClick={() => execCommand('formatBlock', '<h1>')}
            className="px-1.5 py-1 rounded text-xs font-serif font-bold text-amber-400 hover:bg-surface-hover transition-colors"
            title="Heading 1"
          >
            H1
          </button>
          <button
            onClick={() => execCommand('formatBlock', '<h2>')}
            className="px-1.5 py-1 rounded text-xs font-serif font-bold text-slate-200 hover:bg-surface-hover transition-colors"
            title="Heading 2"
          >
            H2
          </button>
          <button
            onClick={() => execCommand('formatBlock', '<h3>')}
            className="px-1.5 py-1 rounded text-xs font-serif font-bold text-amber-300 hover:bg-surface-hover transition-colors"
            title="Heading 3"
          >
            H3
          </button>

          <div className="h-4 w-px bg-surface-border mx-1" />

          <button
            onClick={() => execCommand('insertUnorderedList')}
            className="p-1.5 rounded hover:bg-surface-hover text-slate-300 hover:text-white transition-colors"
            title="Bullet List"
          >
            <List className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsCompendiumModalOpen(true)}
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
            setSlashMenu((prev) => ({ ...prev, isOpen: false }));
          }}
          onOpenDcModal={() => {
            setSlashMenu((prev) => ({ ...prev, isOpen: false }));
            setIsDcModalOpen(true);
          }}
          onOpenCompendiumModal={() => {
            setSlashMenu((prev) => ({ ...prev, isOpen: false }));
            setIsCompendiumModalOpen(true);
          }}
          onOpenImageModal={() => {
            setSlashMenu((prev) => ({ ...prev, isOpen: false }));
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
          onClose={() => setIsDcModalOpen(false)}
          onInsert={(snippet: string) => {
            insertHtmlBlock(markdownToHtml(snippet));
            setIsDcModalOpen(false);
          }}
        />
      )}

      {/* Compendium Link Modal */}
      {isCompendiumModalOpen && (
        <CompendiumLinkModal
          onClose={() => setIsCompendiumModalOpen(false)}
          onSelect={(tag: string) => {
            insertHtmlBlock(markdownToHtml(tag));
            setIsCompendiumModalOpen(false);
          }}
        />
      )}

      {/* Image / Artwork Formatting Modal */}
      {isImageModalOpen && (
        <NoteImageModal
          onClose={() => setIsImageModalOpen(false)}
          onInsert={(snippet: string) => {
            insertHtmlBlock(markdownToHtml(snippet));
            setIsImageModalOpen(false);
          }}
        />
      )}
    </div>
  );
};
