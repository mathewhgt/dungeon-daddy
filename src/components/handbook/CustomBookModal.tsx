import React, { useState } from 'react';
import { X, BookPlus, Sparkles, BookOpen } from 'lucide-react';
import { CustomBookEntity } from '../../types/handbook';

interface CustomBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (book: CustomBookEntity) => void;
}

export const CustomBookModal: React.FC<CustomBookModalProps> = ({ isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [edition, setEdition] = useState('Custom 5e / Homebrew');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#f59e0b');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newBook: CustomBookEntity = {
      id: `book-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      title: title.trim(),
      edition: edition.trim() || 'Custom 5e',
      description: description.trim() || 'Custom house rules and homebrew sourcebook.',
      coverIcon: 'Sparkles',
      color,
      isCustom: true,
      chapters: [
        {
          id: `chap-${Date.now()}-intro`,
          bookId: '', // will be set
          title: 'Introduction & Overview',
          shortTitle: 'Overview',
          category: 'chapter',
          icon: 'Sparkles',
          content: `# ${title.trim()}\n\nWelcome to ${title.trim()}! Add custom rules, classes, feats, or lore chapters using the "+ New Entry" button.`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    newBook.chapters[0].bookId = newBook.id;

    onSave(newBook);
    onClose();
    setTitle('');
    setDescription('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface-100 border border-surface-border rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-scaleIn">
        <div className="p-4 bg-surface-50 border-b border-surface-border flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookPlus className="w-5 h-5 text-amber-400" />
            <h2 className="font-serif text-base font-bold text-slate-100">Create Custom / Homebrew Book</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Book Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Grim Hollow Campaign Rules, Dark Sun 5e Guide..."
              className="w-full bg-surface-50 border border-surface-border rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Edition / Tag</label>
            <input
              type="text"
              value={edition}
              onChange={(e) => setEdition(e.target.value)}
              placeholder="e.g. 5e Homebrew, House Rules"
              className="w-full bg-surface-50 border border-surface-border rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of what this book or ruleset covers..."
              className="w-full bg-surface-50 border border-surface-border rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300">Accent Color</label>
            <div className="flex items-center space-x-2">
              {['#f59e0b', '#8b5cf6', '#10b981', '#ef4444', '#06b6d4', '#ec4899', '#3b82f6'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{ backgroundColor: c }}
                  className={`w-6 h-6 rounded-full transition-transform ${color === c ? 'scale-125 ring-2 ring-white' : 'opacity-70 hover:opacity-100'}`}
                />
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-surface-border flex items-center justify-end space-x-2">
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
              <Sparkles className="w-3.5 h-3.5" />
              <span>Create Book</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
