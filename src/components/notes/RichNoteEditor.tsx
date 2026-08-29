import React, { useState, useRef } from 'react';
import { 
  Save, 
  X, 
  BookOpen, 
  Info, 
  Lock, 
  Table, 
  Tag, 
  Heading1, 
  Heading2, 
  Heading3, 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Quote, 
  Eye, 
  EyeOff,
  Columns,
  Sparkles
} from 'lucide-react';
import { CampaignNote, NoteCategory } from '../../types/campaign';
import { CompendiumLinkModal } from './CompendiumLinkModal';
import { NoteContentRenderer } from './NoteEntityPopover';

interface RichNoteEditorProps {
  initialNote?: Partial<CampaignNote>;
  campaignId: string;
  folders: { id: string; name: string }[];
  onSave: (note: CampaignNote) => void;
  onCancel: () => void;
}

export const RichNoteEditor: React.FC<RichNoteEditorProps> = ({
  initialNote,
  campaignId,
  folders,
  onSave,
  onCancel,
}) => {
  const [name, setName] = useState(initialNote?.name || '');
  const [category, setCategory] = useState<NoteCategory>(initialNote?.category || 'Session');
  const [parentId, setParentId] = useState<string | null>(initialNote?.parentId || null);
  const [isPlayerVisible, setIsPlayerVisible] = useState(initialNote?.isPlayerVisible || false);
  const [content, setContent] = useState(initialNote?.content || '');
  const [viewMode, setViewMode] = useState<'split' | 'edit' | 'preview'>('split');
  const [isCompendiumLinkOpen, setIsCompendiumLinkOpen] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertTextAtCursor = (prefix: string, suffix = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end);
    const replacement = `${prefix}${selected || 'text'}${suffix}`;

    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selected.length || 4));
    }, 50);
  };

  const handleInsertBlock = (blockType: string) => {
    if (blockType === 'read-aloud') {
      insertTextAtCursor('\n:::read-aloud\n', '\n:::\n');
    } else if (blockType === 'dm-info') {
      insertTextAtCursor('\n:::dm-info\n', '\n:::\n');
    } else if (blockType === 'secrets') {
      insertTextAtCursor('\n:::secrets\n', '\n:::\n');
    } else if (blockType === 'table') {
      insertTextAtCursor('\n| Column 1 | Column 2 | Column 3 |\n| --- | --- | --- |\n| Item 1 | Value | Details |\n| Item 2 | Value | Details |\n');
    } else if (blockType === 'h1') {
      insertTextAtCursor('\n# ');
    } else if (blockType === 'h2') {
      insertTextAtCursor('\n## ');
    } else if (blockType === 'h3') {
      insertTextAtCursor('\n### ');
    } else if (blockType === 'bold') {
      insertTextAtCursor('**', '**');
    } else if (blockType === 'italic') {
      insertTextAtCursor('*', '*');
    } else if (blockType === 'bullet') {
      insertTextAtCursor('\n- ');
    } else if (blockType === 'numbered') {
      insertTextAtCursor('\n1. ');
    } else if (blockType === 'quote') {
      insertTextAtCursor('\n> ');
    }
  };

  const handleSelectCompendiumTag = (tagText: string) => {
    insertTextAtCursor(` ${tagText} `);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const note: CampaignNote = {
      id: initialNote?.id || `note-${Date.now()}`,
      type: 'campaignNote',
      campaignId,
      name,
      category,
      parentId,
      isFolder: false,
      content,
      isPlayerVisible,
      createdAt: initialNote?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(note);
  };

  return (
    <div className="h-full flex flex-col bg-[#090d12] overflow-hidden select-none">
      {/* Top Header Bar */}
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
        <div className="p-3 bg-surface-100/80 border-b border-surface-border flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1 mr-4">
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Note Title..."
              className="bg-surface-50 border border-surface-border text-slate-100 font-serif font-bold text-sm rounded-lg px-3 py-1.5 focus:border-amber-500 flex-1 max-w-sm"
              autoFocus
            />

            {/* Folder Parent Selection */}
            <select
              value={parentId || ''}
              onChange={(e) => setParentId(e.target.value || null)}
              className="bg-surface-50 border border-surface-border text-xs text-slate-300 rounded-lg px-2.5 py-1.5 focus:border-amber-500"
            >
              <option value="">📁 Root Level</option>
              {folders.map((f) => (
                <option key={f.id} value={f.id}>
                  📁 {f.name}
                </option>
              ))}
            </select>

            {/* Category */}
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="bg-surface-50 border border-surface-border text-xs text-slate-300 rounded-lg px-2.5 py-1.5 focus:border-amber-500"
            >
              {['Session', 'Lore', 'NPC', 'Location', 'Quest', 'Handout'].map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Player Handout Checkbox */}
            <label className="flex items-center space-x-1.5 text-xs text-slate-300 cursor-pointer bg-surface-50 px-2.5 py-1.5 rounded-lg border border-surface-border hover:bg-surface-hover">
              <input
                type="checkbox"
                checked={isPlayerVisible}
                onChange={(e) => setIsPlayerVisible(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-surface-border text-amber-500 bg-surface-100"
              />
              <span>{isPlayerVisible ? 'Player Handout' : 'GM Secret'}</span>
            </label>
          </div>

          {/* View Mode & Save Actions */}
          <div className="flex items-center space-x-2">
            <div className="flex bg-surface-50 p-0.5 rounded-lg border border-surface-border text-xs">
              <button
                type="button"
                onClick={() => setViewMode('edit')}
                className={`px-2.5 py-1 rounded font-medium ${viewMode === 'edit' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'}`}
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => setViewMode('split')}
                className={`px-2.5 py-1 rounded font-medium ${viewMode === 'split' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'}`}
              >
                Split
              </button>
              <button
                type="button"
                onClick={() => setViewMode('preview')}
                className={`px-2.5 py-1 rounded font-medium ${viewMode === 'preview' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'}`}
              >
                Preview
              </button>
            </div>

            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-1.5 rounded-lg bg-surface-50 text-slate-300 text-xs font-semibold hover:bg-surface-hover"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-bold text-xs shadow-md flex items-center space-x-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Save Note</span>
            </button>
          </div>
        </div>

        {/* Formatting Toolbar */}
        <div className="p-2 bg-surface-100 border-b border-surface-border flex items-center space-x-1 overflow-x-auto">
          {/* D&D Block Styles */}
          <button
            type="button"
            onClick={() => handleInsertBlock('read-aloud')}
            className="px-2.5 py-1 rounded bg-amber-950/60 hover:bg-amber-900 border border-amber-700 text-amber-300 text-xs font-serif font-bold flex items-center space-x-1 shadow-xs"
            title="Insert Read Aloud Box for Players"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Read Aloud</span>
          </button>

          <button
            type="button"
            onClick={() => handleInsertBlock('dm-info')}
            className="px-2.5 py-1 rounded bg-blue-950/60 hover:bg-blue-900 border border-blue-700 text-blue-300 text-xs font-bold flex items-center space-x-1 shadow-xs"
            title="Insert DM Tactics / Notes Box"
          >
            <Info className="w-3.5 h-3.5" />
            <span>DM Info</span>
          </button>

          <button
            type="button"
            onClick={() => handleInsertBlock('secrets')}
            className="px-2.5 py-1 rounded bg-purple-950/60 hover:bg-purple-900 border border-purple-700 text-purple-300 text-xs font-bold flex items-center space-x-1 shadow-xs"
            title="Insert Hidden Secrets / Spoilers Box"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Secret Box</span>
          </button>

          <button
            type="button"
            onClick={() => handleInsertBlock('table')}
            className="px-2.5 py-1 rounded bg-surface-50 hover:bg-surface-hover border border-surface-border text-slate-300 text-xs font-medium flex items-center space-x-1"
            title="Insert Markdown Table"
          >
            <Table className="w-3.5 h-3.5 text-emerald-400" />
            <span>Table</span>
          </button>

          {/* Compendium Linker Tool */}
          <button
            type="button"
            onClick={() => setIsCompendiumLinkOpen(true)}
            className="px-2.5 py-1 rounded bg-gradient-to-r from-amber-600/30 to-indigo-600/30 hover:from-amber-600/50 hover:to-indigo-600/50 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center space-x-1 shadow-xs"
            title="Tag a Monster, Spell, Item, or Note"
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Tag Compendium</span>
          </button>

          <div className="h-4 w-px bg-surface-border mx-1" />

          {/* Typography Controls */}
          <button
            type="button"
            onClick={() => handleInsertBlock('h1')}
            className="p-1.5 rounded hover:bg-surface-hover text-slate-300"
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleInsertBlock('h2')}
            className="p-1.5 rounded hover:bg-surface-hover text-slate-300"
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleInsertBlock('h3')}
            className="p-1.5 rounded hover:bg-surface-hover text-slate-300"
            title="Heading 3"
          >
            <Heading3 className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-surface-border mx-1" />

          <button
            type="button"
            onClick={() => handleInsertBlock('bold')}
            className="p-1.5 rounded hover:bg-surface-hover text-slate-300"
            title="Bold (**text**)"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleInsertBlock('italic')}
            className="p-1.5 rounded hover:bg-surface-hover text-slate-300"
            title="Italic (*text*)"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleInsertBlock('bullet')}
            className="p-1.5 rounded hover:bg-surface-hover text-slate-300"
            title="Bullet List (- item)"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleInsertBlock('numbered')}
            className="p-1.5 rounded hover:bg-surface-hover text-slate-300"
            title="Numbered List (1. item)"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleInsertBlock('quote')}
            className="p-1.5 rounded hover:bg-surface-hover text-slate-300"
            title="Quote (> quote)"
          >
            <Quote className="w-4 h-4" />
          </button>
        </div>

        {/* Editor Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Raw Markdown Editor */}
          {(viewMode === 'edit' || viewMode === 'split') && (
            <div className={`flex-1 p-4 bg-[#090d12] flex flex-col ${viewMode === 'split' ? 'border-r border-surface-border' : ''}`}>
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write adventure notes, DM boxed text, dialogue, and secrets here..."
                className="w-full flex-1 bg-transparent text-slate-100 text-xs font-mono resize-none focus:outline-none leading-relaxed p-2"
              />
            </div>
          )}

          {/* Formatted Live Preview */}
          {(viewMode === 'preview' || viewMode === 'split') && (
            <div className="flex-1 p-6 bg-[#0d1117] overflow-y-auto">
              <div className="max-w-2xl mx-auto">
                <div className="border-b border-surface-border pb-3 mb-4">
                  <h1 className="font-serif text-2xl font-bold text-slate-100">{name || 'Untitled Note'}</h1>
                  <div className="text-xs text-slate-400 mt-1">
                    Category: {category} {isPlayerVisible && '· Visible Handout'}
                  </div>
                </div>
                <NoteContentRenderer content={content} />
              </div>
            </div>
          )}
        </div>
      </form>

      {/* Compendium Link Modal */}
      {isCompendiumLinkOpen && (
        <CompendiumLinkModal
          onClose={() => setIsCompendiumLinkOpen(false)}
          onSelect={handleSelectCompendiumTag}
        />
      )}
    </div>
  );
};
