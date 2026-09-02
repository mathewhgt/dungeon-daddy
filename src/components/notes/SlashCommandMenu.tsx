import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  Lock, 
  Info, 
  Dices, 
  Table, 
  Heading1, 
  Heading2, 
  Heading3, 
  List, 
  ListOrdered, 
  Quote, 
  AlertTriangle, 
  Lightbulb, 
  Minus,
  Sparkles,
  Link2,
  Image as ImageIcon,
  Columns
} from 'lucide-react';

export interface SlashCommandItem {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  category: 'blocks' | 'checks' | 'format' | 'links';
  action: () => void;
}

interface SlashCommandMenuProps {
  query: string;
  position: { top: number; left: number };
  onClose: () => void;
  onSelect: (item: SlashCommandItem) => void;
  onOpenDcModal: () => void;
  onOpenCompendiumModal: () => void;
  onOpenImageModal?: () => void;
  onInsertSnippet: (prefix: string, suffix?: string) => void;
}

export const SlashCommandMenu: React.FC<SlashCommandMenuProps> = ({
  query,
  position,
  onClose,
  onOpenDcModal,
  onOpenCompendiumModal,
  onOpenImageModal,
  onInsertSnippet,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  const items: SlashCommandItem[] = [
    {
      id: 'image',
      title: 'Formatted Image / Artwork',
      subtitle: 'Embed image with text wrap (left/right), alignment, size & caption',
      icon: ImageIcon,
      color: 'text-pink-400 bg-pink-900/30 border-pink-700/40',
      category: 'blocks',
      action: () => (onOpenImageModal ? onOpenImageModal() : onInsertSnippet('\n:::image src="https://example.com/art.png" align="left" size="50%" caption="Artwork caption"\n:::\n')),
    },
    {
      id: 'columns',
      title: '2-Column Side-by-Side Layout',
      subtitle: 'Split text and artwork into clean multi-column layout',
      icon: Columns,
      color: 'text-indigo-400 bg-indigo-900/30 border-indigo-700/40',
      category: 'format',
      action: () => onInsertSnippet('\n:::columns\n:::column\n### Column 1\nWrite left column content here...\n:::\n:::column\n### Column 2\nWrite right column content here...\n:::\n:::\n'),
    },
    {
      id: 'dc-check',
      title: 'DC Ability / Skill Check',
      subtitle: '5e rollable DC check with difficulty thresholds & outcomes',
      icon: Dices,
      color: 'text-amber-400 bg-amber-500/20 border-amber-500/30',
      category: 'checks',
      action: () => onOpenDcModal(),
    },
    {
      id: 'read-aloud',
      title: 'Read Aloud Box',
      subtitle: 'Boxed description to read aloud directly to players',
      icon: BookOpen,
      color: 'text-amber-300 bg-amber-900/30 border-amber-700/40',
      category: 'blocks',
      action: () => onInsertSnippet('\n:::read-aloud\n', '\n:::\n'),
    },
    {
      id: 'secrets',
      title: 'DM Secret / Spoiler',
      subtitle: 'Hidden collapsible spoiler block visible to DM only',
      icon: Lock,
      color: 'text-purple-400 bg-purple-900/30 border-purple-700/40',
      category: 'blocks',
      action: () => onInsertSnippet('\n:::secrets\n', '\n:::\n'),
    },
    {
      id: 'dm-info',
      title: 'DM Tactics & Guidance',
      subtitle: 'Blue tactical reminder block for the DM',
      icon: Info,
      color: 'text-blue-400 bg-blue-900/30 border-blue-700/40',
      category: 'blocks',
      action: () => onInsertSnippet('\n:::dm-info\n', '\n:::\n'),
    },
    {
      id: 'compendium-link',
      title: 'Link Compendium Entity',
      subtitle: 'Interactive monster, spell, item, or note hover tag',
      icon: Link2,
      color: 'text-cyan-400 bg-cyan-900/30 border-cyan-700/40',
      category: 'links',
      action: () => onOpenCompendiumModal(),
    },
    {
      id: 'table',
      title: 'Table',
      subtitle: 'Structured markdown data table',
      icon: Table,
      color: 'text-emerald-400 bg-emerald-900/30 border-emerald-700/40',
      category: 'format',
      action: () => onInsertSnippet('\n| Column 1 | Column 2 | Column 3 |\n| --- | --- | --- |\n| Item 1 | Value | Details |\n| Item 2 | Value | Details |\n'),
    },
    {
      id: 'warning',
      title: 'Warning / Danger Callout',
      subtitle: 'High-visibility alert for traps, ambushes or hazards',
      icon: AlertTriangle,
      color: 'text-rose-400 bg-rose-900/30 border-rose-700/40',
      category: 'blocks',
      action: () => onInsertSnippet('\n> [!WARNING]\n> **Hazard:** '),
    },
    {
      id: 'tip',
      title: 'Tip / DM Advice',
      subtitle: 'Helpful roleplaying or pacing tip',
      icon: Lightbulb,
      color: 'text-yellow-400 bg-yellow-900/30 border-yellow-700/40',
      category: 'blocks',
      action: () => onInsertSnippet('\n> [!TIP]\n> '),
    },
    {
      id: 'h1',
      title: 'Heading 1',
      subtitle: 'Large section heading',
      icon: Heading1,
      color: 'text-slate-300 bg-slate-800/50 border-slate-700',
      category: 'format',
      action: () => onInsertSnippet('\n# '),
    },
    {
      id: 'h2',
      title: 'Heading 2',
      subtitle: 'Medium section heading',
      icon: Heading2,
      color: 'text-slate-300 bg-slate-800/50 border-slate-700',
      category: 'format',
      action: () => onInsertSnippet('\n## '),
    },
    {
      id: 'h3',
      title: 'Heading 3',
      subtitle: 'Small subsection heading',
      icon: Heading3,
      color: 'text-slate-300 bg-slate-800/50 border-slate-700',
      category: 'format',
      action: () => onInsertSnippet('\n### '),
    },
    {
      id: 'bullet-list',
      title: 'Bulleted List',
      subtitle: 'Unordered list item',
      icon: List,
      color: 'text-slate-300 bg-slate-800/50 border-slate-700',
      category: 'format',
      action: () => onInsertSnippet('\n- '),
    },
    {
      id: 'numbered-list',
      title: 'Numbered List',
      subtitle: 'Sequential ordered list item',
      icon: ListOrdered,
      color: 'text-slate-300 bg-slate-800/50 border-slate-700',
      category: 'format',
      action: () => onInsertSnippet('\n1. '),
    },
    {
      id: 'quote',
      title: 'Blockquote',
      subtitle: 'Indented quote or NPC dialogue',
      icon: Quote,
      color: 'text-slate-300 bg-slate-800/50 border-slate-700',
      category: 'format',
      action: () => onInsertSnippet('\n> '),
    },
    {
      id: 'divider',
      title: 'Divider Rule',
      subtitle: 'Horizontal separation line',
      icon: Minus,
      color: 'text-slate-300 bg-slate-800/50 border-slate-700',
      category: 'format',
      action: () => onInsertSnippet('\n---\n'),
    },
  ];

  const filtered = items.filter((item) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return item.title.toLowerCase().includes(q) || item.subtitle.toLowerCase().includes(q) || item.id.includes(q);
  });

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (filtered.length > 0 ? (prev + 1) % filtered.length : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (filtered.length > 0 ? (prev - 1 + filtered.length) % filtered.length : 0));
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          filtered[selectedIndex].action();
          onClose();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [filtered, selectedIndex, onClose]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  if (filtered.length === 0) return null;

  const menuEstimatedHeight = 310;
  const fitsBelow = position.top + menuEstimatedHeight <= window.innerHeight - 15;
  const topPos = fitsBelow
    ? Math.max(10, position.top)
    : Math.max(10, position.top - menuEstimatedHeight - 20);
  const leftPos = Math.max(10, Math.min(position.left, window.innerWidth - 300));

  return (
    <div
      ref={menuRef}
      onMouseDown={(e) => e.preventDefault()}
      style={{
        top: `${topPos}px`,
        left: `${leftPos}px`,
      }}
      className="fixed z-[99999] w-72 bg-[#121720]/95 backdrop-blur-md border border-surface-border rounded-xl shadow-2xl overflow-hidden animate-scaleUp text-xs select-none"
    >
      <div className="p-2 border-b border-surface-border bg-surface-100/50 flex items-center justify-between text-[11px] font-mono text-slate-400">
        <span>Insert Block or Command</span>
        <kbd className="px-1.5 py-0.5 rounded bg-surface-50 text-[10px] text-amber-400 border border-surface-border">
          ↵ to select
        </kbd>
      </div>

      <div className="max-h-64 overflow-y-auto p-1 space-y-0.5">
        {filtered.map((item, idx) => {
          const Icon = item.icon;
          const isSelected = idx === selectedIndex;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                item.action();
                onClose();
              }}
              onMouseEnter={() => setSelectedIndex(idx)}
              className={`w-full p-2 rounded-lg flex items-center space-x-2.5 text-left transition-colors ${
                isSelected
                  ? 'bg-amber-500/20 border border-amber-500/40 text-amber-200'
                  : 'text-slate-200 hover:bg-surface-hover'
              }`}
            >
              <div className={`p-1.5 rounded-lg border ${item.color}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-100 flex items-center justify-between">
                  <span className="truncate">{item.title}</span>
                </div>
                <div className="text-[10px] text-slate-400 truncate">{item.subtitle}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
