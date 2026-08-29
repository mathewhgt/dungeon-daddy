import React, { useState, useEffect } from 'react';
import { X, Save, Edit3, Sparkles, BookOpen, Plus, Tag, FolderTree } from 'lucide-react';
import { CustomChapterEntity, HandbookChapter } from '../../types/handbook';

interface CustomChapterModalProps {
  isOpen: boolean;
  bookId: string;
  initialChapter?: CustomChapterEntity | null;
  defaultParentId?: string | null;
  availableChapters?: HandbookChapter[];
  onClose: () => void;
  onSave: (bookId: string, chapter: CustomChapterEntity) => void;
}

export const CustomChapterModal: React.FC<CustomChapterModalProps> = ({
  isOpen,
  bookId,
  initialChapter,
  defaultParentId = null,
  availableChapters = [],
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [shortTitle, setShortTitle] = useState('');
  const [parentId, setParentId] = useState<string | null>(null);
  const [category, setCategory] = useState<any>('species');
  const [tagsString, setTagsString] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (initialChapter) {
      setTitle(initialChapter.title);
      setShortTitle(initialChapter.shortTitle || '');
      setParentId(initialChapter.parentId || null);
      setCategory(initialChapter.category || 'species');
      setTagsString((initialChapter.tags || []).join(', '));
      setContent(initialChapter.content || '');
    } else {
      setTitle('');
      setShortTitle('');
      setParentId(defaultParentId || null);
      setCategory('species');
      setTagsString('');
      setContent('# New Section\n\nDescribe the rule, class, species, background, or feat mechanics here using markdown.');
    }
  }, [initialChapter, defaultParentId, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const parsedTags = tagsString
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const chapter: CustomChapterEntity = {
      id: initialChapter ? initialChapter.id : `entry-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      bookId,
      parentId: parentId || null,
      title: title.trim(),
      shortTitle: shortTitle.trim() || title.trim(),
      category,
      tags: parsedTags,
      icon: 'Sparkles',
      content: content.trim(),
      createdAt: initialChapter ? initialChapter.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(bookId, chapter);
    onClose();
  };

  const candidateParents = availableChapters.filter((c) => !initialChapter || c.id !== initialChapter.id);

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface-100 border border-surface-border rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-scaleIn flex flex-col max-h-[90vh]">
        <div className="p-4 bg-surface-50 border-b border-surface-border flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <Edit3 className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="font-serif text-base font-bold text-slate-100">
                {initialChapter ? 'Edit Entry' : 'Create New Entry / Subpage'}
              </h2>
              <p className="text-[11px] text-slate-400">
                Add a new chapter, subpage, species, feat, or house rule with custom parent hierarchy.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 flex flex-col">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 shrink-0">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Entry Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Aasimar, Telekinetic, Races..."
                className="w-full bg-surface-50 border border-surface-border rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Sidebar Short Label</label>
              <input
                type="text"
                value={shortTitle}
                onChange={(e) => setShortTitle(e.target.value)}
                placeholder="e.g. Aasimar"
                className="w-full bg-surface-50 border border-surface-border rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1">
                <FolderTree className="w-3.5 h-3.5 text-amber-400" />
                <span>Parent Chapter / Page (Optional)</span>
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
                <option value="species">🌿 Species & Lineage</option>
                <option value="feat">⚡ Feat & Boon</option>
                <option value="class">🛡️ Class & Subclasses</option>
                <option value="background">📜 Character Background</option>
                <option value="mastery">⚔️ Weapon Mastery Property</option>
                <option value="condition">💫 Condition & Hazard</option>
                <option value="rule">📜 General Rule / Table Ruling</option>
                <option value="chapter">📖 General Chapter / Lore</option>
              </select>
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-semibold text-slate-300">Tags (Comma Separated)</label>
              <input
                type="text"
                value={tagsString}
                onChange={(e) => setTagsString(e.target.value)}
                placeholder="e.g. Celestial, Radiant, Lineage, 2024"
                className="w-full bg-surface-50 border border-surface-border rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="space-y-1 flex-1 flex flex-col min-h-[250px]">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="text-xs font-semibold text-slate-300">Content (Markdown Supported)</label>
              
              {/* Insert Reference Card helper */}
              <div className="flex items-center space-x-1.5">
                <span className="text-[10px] text-amber-400 font-bold flex items-center space-x-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Insert Reference:</span>
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
            </div>
            <textarea
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full flex-1 bg-surface-50 border border-surface-border rounded-lg p-3 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-500 resize-none leading-relaxed"
            />
          </div>

          <div className="pt-3 border-t border-surface-border flex items-center justify-end space-x-2 shrink-0">
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
              <span>Save Entry</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
