import React, { useState, useEffect } from 'react';
import { X, Save, Edit3, RotateCcw, Eye, Code, FolderTree, Dices, Sparkles } from 'lucide-react';
import { DcCheckModal } from '../notes/DcCheckModal';
import { SlashCommandMenu } from '../notes/SlashCommandMenu';
import { HandbookChapter, HandbookChapterOverride } from '../../types/handbook';

interface HandbookEditorModalProps {
  isOpen: boolean;
  chapter: HandbookChapter | null;
  availableChapters?: HandbookChapter[];
  onClose: () => void;
  onSaveOverride: (chapterId: string, override: HandbookChapterOverride) => void;
  onResetOverride?: (chapterId: string) => void;
}

export const HandbookEditorModal: React.FC<HandbookEditorModalProps> = ({
  isOpen,
  chapter,
  availableChapters = [],
  onClose,
  onSaveOverride,
  onResetOverride,
}) => {
  const [title, setTitle] = useState('');
  const [shortTitle, setShortTitle] = useState('');
  const [parentId, setParentId] = useState<string | null>(null);
  const [category, setCategory] = useState<any>('chapter');
  const [tagsString, setTagsString] = useState('');
  const [content, setContent] = useState('');
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [isDcCheckModalOpen, setIsDcCheckModalOpen] = useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const [slashMenu, setSlashMenu] = useState<{
    isOpen: boolean;
    query: string;
    triggerChar: '/' | '\\';
    triggerPos: number;
    position: { top: number; left: number };
  }>({
    isOpen: false,
    query: '',
    triggerChar: '/',
    triggerPos: 0,
    position: { top: 0, left: 0 },
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === '\\') {
      const textarea = e.currentTarget;
      const rect = textarea.getBoundingClientRect();
      const cursorPos = textarea.selectionStart;
      const textBefore = textarea.value.substring(0, cursorPos);
      const lines = textBefore.split('\n');
      const top = rect.top + Math.min(lines.length * 20 + 25, rect.height - 100);
      const left = rect.left + Math.min(lines[lines.length - 1].length * 7 + 20, rect.width - 250);

      setTimeout(() => {
        setSlashMenu({
          isOpen: true,
          query: '',
          triggerChar: '\\',
          triggerPos: cursorPos,
          position: { top, left },
        });
      }, 10);
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);

    const cursorPos = e.target.selectionStart;
    const textBeforeCursor = val.substring(0, cursorPos);
    const triggerIdx = textBeforeCursor.lastIndexOf('\\');

    if (triggerIdx !== -1) {
      const char = '\\';
      const textAfterTrigger = textBeforeCursor.substring(triggerIdx + 1);

      if (!textAfterTrigger.includes('\n') && textAfterTrigger.length <= 20) {
        const rect = textareaRef.current?.getBoundingClientRect();
        if (rect) {
          const lines = textBeforeCursor.split('\n');
          const top = rect.top + Math.min(lines.length * 20 + 25, rect.height - 100);
          const left = rect.left + Math.min(lines[lines.length - 1].length * 7 + 20, rect.width - 250);

          setSlashMenu({
            isOpen: true,
            query: textAfterTrigger,
            triggerChar: char,
            triggerPos: triggerIdx,
            position: { top, left },
          });
          return;
        }
      }
    }

    if (slashMenu.isOpen) {
      setSlashMenu((prev) => ({ ...prev, isOpen: false }));
    }
  };

  const handleInsertSnippet = (prefix: string, suffix = '') => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const triggerPos = slashMenu.triggerPos;
    const curPos = textarea.selectionStart;
    const before = content.substring(0, triggerPos);
    const after = content.substring(curPos);
    setContent(before + prefix + suffix + after);
    setSlashMenu((prev) => ({ ...prev, isOpen: false }));
  };

  useEffect(() => {
    if (chapter) {
      setTitle(chapter.title || '');
      setShortTitle(chapter.shortTitle || chapter.title || '');
      setParentId(chapter.parentId || null);
      setCategory(chapter.category || 'chapter');
      setTagsString((chapter.tags || []).join(', '));
      setContent(chapter.content || '');
      setActiveTab('editor');
    }
  }, [chapter, isOpen]);

  if (!isOpen || !chapter) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const parsedTags = tagsString
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const override: HandbookChapterOverride = {
      id: chapter.id,
      parentId: parentId || null,
      title: title.trim(),
      shortTitle: shortTitle.trim() || title.trim(),
      category,
      tags: parsedTags,
      content: content.trim(),
      updatedAt: new Date().toISOString(),
    };

    onSaveOverride(chapter.id, override);
    onClose();
  };

  const candidateParents = availableChapters.filter((c) => c.id !== chapter.id && c.parentId !== chapter.id);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface-100 border border-surface-border rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl animate-scaleIn flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 bg-surface-50 border-b border-surface-border flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-sm font-bold text-slate-100 flex items-center space-x-2">
                <span>Edit Section & Classification</span>
                {chapter.isEdited && (
                  <span className="px-2 py-0.2 rounded-full text-[10px] font-mono bg-amber-950/80 border border-amber-800 text-amber-300">
                    Edited
                  </span>
                )}
              </h2>
              <p className="text-[11px] text-slate-400">
                Fix markdown formatting, rename titles, or set this as a subpage of another chapter.
              </p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 flex flex-col">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 shrink-0">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Section Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Chapter 3: Character Classes"
                className="w-full bg-surface-50 border border-surface-border rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Sidebar Short Label</label>
              <input
                type="text"
                value={shortTitle}
                onChange={(e) => setShortTitle(e.target.value)}
                placeholder="e.g. Classes"
                className="w-full bg-surface-50 border border-surface-border rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1">
                <FolderTree className="w-3.5 h-3.5 text-amber-400" />
                <span>Parent Chapter / Page</span>
              </label>
              <select
                value={parentId || ''}
                onChange={(e) => setParentId(e.target.value || null)}
                className="w-full bg-surface-50 border border-surface-border rounded-lg px-3 py-2 text-xs text-amber-300 font-semibold focus:outline-none focus:border-amber-500"
              >
                <option value="">(None - Top Level Chapter / Section)</option>
                {candidateParents.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.parentId ? '↳ ↳ ' : '↳ '} {p.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Classification / Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-surface-50 border border-surface-border rounded-lg px-3 py-2 text-xs text-purple-300 font-bold focus:outline-none focus:border-purple-500"
              >
                <option value="chapter">📖 Chapter / Sourcebook Section</option>
                <option value="species">🌿 Species & Lineages</option>
                <option value="feat">⚡ Feat & Special Boon</option>
                <option value="class">🛡️ Class & Subclasses</option>
                <option value="background">📜 Character Background</option>
                <option value="mastery">⚔️ Weapon Mastery Property</option>
                <option value="condition">💫 Rule Condition & Hazard</option>
                <option value="rule">📜 General Table / House Rule</option>
              </select>
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-semibold text-slate-300">Tags (Comma Separated)</label>
              <input
                type="text"
                value={tagsString}
                onChange={(e) => setTagsString(e.target.value)}
                placeholder="e.g. Magic, Combat, Spellcasting, 2024 Revision"
                className="w-full bg-surface-50 border border-surface-border rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Markdown Content Area */}
          <div className="space-y-2 flex-1 flex flex-col min-h-[300px]">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('editor')}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center space-x-1 ${
                    activeTab === 'editor' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Code className="w-3.5 h-3.5" />
                  <span>Markdown Editor</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('preview')}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center space-x-1 ${
                    activeTab === 'preview' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </button>
              </div>

              {/* Insert Reference helper */}
              <div className="flex items-center space-x-1.5">
                <span className="text-[10px] text-amber-400 font-bold flex items-center space-x-1">
                  <FolderTree className="w-3 h-3" />
                  <span>Insert Reference Card:</span>
                </span>
                <select
                  defaultValue=""
                  onChange={(e) => {
                    if (e.target.value) {
                      setContent((prev) => prev + `\n\n> 📖 **Reference:** ${e.target.value}\n\n`);
                      e.target.value = '';
                    }
                  }}
                  className="bg-surface-50 border border-surface-border text-slate-200 text-[11px] rounded px-2 py-0.5 focus:outline-none focus:border-amber-500 font-sans"
                >
                  <option value="" disabled>+ Choose Entity / Subpage...</option>
                  <optgroup label="Available Chapters & Subpages">
                    {availableChapters.map((c) => (
                      <option key={c.id} value={c.title}>
                        {c.title}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Official 5e Classes">
                    <option value="Barbarian">Barbarian</option>
                    <option value="Bard">Bard</option>
                    <option value="Cleric">Cleric</option>
                    <option value="Druid">Druid</option>
                    <option value="Fighter">Fighter</option>
                    <option value="Monk">Monk</option>
                    <option value="Paladin">Paladin</option>
                    <option value="Ranger">Ranger</option>
                    <option value="Rogue">Rogue</option>
                    <option value="Sorcerer">Sorcerer</option>
                    <option value="Warlock">Warlock</option>
                    <option value="Wizard">Wizard</option>
                  </optgroup>
                  <optgroup label="Official 5e Species">
                    <option value="Aasimar">Aasimar</option>
                    <option value="Dragonborn">Dragonborn</option>
                    <option value="Dwarf">Dwarf</option>
                    <option value="Elf">Elf</option>
                    <option value="Gnome">Gnome</option>
                    <option value="Goliath">Goliath</option>
                    <option value="Halfling">Halfling</option>
                    <option value="Human">Human</option>
                    <option value="Orc">Orc</option>
                    <option value="Tiefling">Tiefling</option>
                  </optgroup>
                  <optgroup label="Popular Feats">
                    <option value="Alert">Alert</option>
                    <option value="Lucky">Lucky</option>
                    <option value="Magic Initiate">Magic Initiate</option>
                    <option value="Musician">Musician</option>
                    <option value="Tough">Tough</option>
                    <option value="War Caster">War Caster</option>
                    <option value="Great Weapon Master">Great Weapon Master</option>
                    <option value="Sharpshooter">Sharpshooter</option>
                    <option value="Sentinel">Sentinel</option>
                    <option value="Polearm Master">Polearm Master</option>
                    <option value="Fey-Touched">Fey-Touched</option>
                    <option value="Shadow-Touched">Shadow-Touched</option>
                  </optgroup>
                </select>
              </div>

              <span className="text-[10px] text-slate-500 font-mono">
                {content.length.toLocaleString()} characters
              </span>
            </div>

            {activeTab === 'editor' ? (
              <textarea
                ref={textareaRef}
                required
                value={content}
                onChange={handleContentChange}
                onKeyDown={handleKeyDown}
                className="w-full flex-1 bg-surface-50 border border-surface-border rounded-lg p-3 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-500 resize-none leading-relaxed"
                placeholder="Enter markdown content..."
              />
            ) : (
              <div className="w-full flex-1 bg-surface-50 border border-surface-border rounded-lg p-4 text-xs text-slate-200 overflow-y-auto leading-relaxed whitespace-pre-wrap font-sans">
                {content || <span className="text-slate-500 italic">No content to preview.</span>}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-surface-border flex items-center justify-between shrink-0">
            {chapter.isEdited && onResetOverride ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Reset "${chapter.title}" to its official default text?`)) {
                    onResetOverride(chapter.id);
                    onClose();
                  }
                }}
                className="px-3 py-1.5 rounded-lg border border-red-500/40 text-red-400 hover:bg-red-950/40 text-xs font-semibold flex items-center space-x-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Official Default</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-surface-50 text-slate-300 text-xs font-semibold hover:bg-surface-hover"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold text-xs shadow-md flex items-center space-x-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {isDcCheckModalOpen && (
        <DcCheckModal
          onClose={() => setIsDcCheckModalOpen(false)}
          onInsert={(md) => setContent((prev) => prev + '\n' + md)}
        />
      )}

      {slashMenu.isOpen && (
        <SlashCommandMenu
          query={slashMenu.query}
          position={slashMenu.position}
          onClose={() => setSlashMenu((prev) => ({ ...prev, isOpen: false }))}
          onSelect={() => {}}
          onOpenDcModal={() => {
            setSlashMenu((prev) => ({ ...prev, isOpen: false }));
            setIsDcCheckModalOpen(true);
          }}
          onOpenCompendiumModal={() => {
            setSlashMenu((prev) => ({ ...prev, isOpen: false }));
          }}
          onInsertSnippet={handleInsertSnippet}
        />
      )}
    </div>
  );
};
