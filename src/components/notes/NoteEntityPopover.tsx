import React, { useState } from 'react';
import { InteractiveDcCheckCard } from './InteractiveDcCheckCard';
import { 
  Sparkles,
  AlertTriangle,
  Lightbulb,
  Dices, 
  Swords, 
  BookOpen, 
  ShieldAlert, 
  Lock, 
  Eye, 
  X, 
  Info,
  Layers
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MonsterStatBlock } from '../compendium/MonsterStatBlock';
import { SpellCard } from '../compendium/SpellCard';
import { ItemCard } from '../compendium/ItemCard';

interface NoteContentRendererProps {
  content: string;
  isPlayerSafe?: boolean;
  className?: string;
}

export const NoteContentRenderer: React.FC<NoteContentRendererProps> = ({ 
  content, 
  isPlayerSafe = false,
  className = '' 
}) => {
  const { db } = useApp();
  const [activeEntityModal, setActiveEntityModal] = useState<{ type: string; id: string } | null>(null);

  // Helper to parse custom D&D Markdown blocks and compendium tags
  const renderFormattedMarkdown = (text: string) => {
    if (!text) return null;
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];

    let inReadAloud = false;
    let readAloudBuffer: string[] = [];

    let inDmInfo = false;
    let dmInfoBuffer: string[] = [];

    let inSecrets = false;
    let secretsBuffer: string[] = [];

    let inCheck = false;
    let checkMeta = { skill: 'Wisdom (Perception)', dc: '15' };
    let checkBuffer: string[] = [];

    let inTable = false;
    let tableBuffer: string[] = [];

    const flushTable = (key: string) => {
      if (tableBuffer.length === 0) return;
      const rows = tableBuffer.map((line) =>
        line
          .split('|')
          .map((c) => c.trim())
          .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
      );

      const headerRow = rows[0] || [];
      const dataRows = rows.slice(2); // skip header separator row | --- | --- |

      elements.push(
        <div key={key} className="my-3 overflow-x-auto rounded-xl border border-surface-border bg-surface-100/90 shadow-md">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-surface-50/90 border-b border-surface-border text-amber-300 font-serif font-bold">
                {headerRow.map((col, cIdx) => (
                  <th key={cIdx} className="p-3">{renderInlineTags(col)}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/60">
              {dataRows.map((r, rIdx) => (
                <tr key={rIdx} className="hover:bg-surface-hover/40 text-slate-200">
                  {r.map((cell, cellIdx) => (
                    <td key={cellIdx} className="p-3">{renderInlineTags(cell)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableBuffer = [];
      inTable = false;
    };

    lines.forEach((line, lineIdx) => {
      const trimmed = line.trim();

      // Read Aloud Block start / end
      if (trimmed.toLowerCase() === ':::read-aloud') {
        inReadAloud = true;
        readAloudBuffer = [];
        return;
      }
      if (inReadAloud && trimmed === ':::') {
        inReadAloud = false;
        elements.push(
          <div
            key={`read-aloud-${lineIdx}`}
            className={`my-4 p-5 rounded-2xl bg-gradient-to-br from-[#1c1813] to-[#14100b] border-2 border-amber-500/60 shadow-xl text-amber-100/95 italic font-serif leading-relaxed select-text ${
              isPlayerSafe ? 'text-base sm:text-lg p-6' : 'text-sm'
            }`}
          >
            <div className="text-xs font-sans font-bold uppercase tracking-widest text-amber-400 not-italic mb-2 flex items-center space-x-1.5">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>Read Aloud</span>
            </div>
            {readAloudBuffer.map((l, idx) => (
              <p key={idx} className="my-1.5">{renderInlineTags(l)}</p>
            ))}
          </div>
        );
        return;
      }
      if (inReadAloud) {
        readAloudBuffer.push(line);
        return;
      }

      // DM Info Block (Omit if player safe)
      if (trimmed.toLowerCase() === ':::dm-info') {
        inDmInfo = true;
        dmInfoBuffer = [];
        return;
      }
      if (inDmInfo && trimmed === ':::') {
        inDmInfo = false;
        if (!isPlayerSafe) {
          elements.push(
            <div
              key={`dm-info-${lineIdx}`}
              className="my-3.5 p-4 rounded-xl bg-blue-950/30 border border-blue-800/60 shadow-md text-blue-100 text-xs leading-relaxed select-text"
            >
              <div className="text-[10px] font-bold uppercase tracking-wider text-blue-400 mb-1 flex items-center space-x-1">
                <Info className="w-3.5 h-3.5" />
                <span>GM / DM Tactics & Notes</span>
              </div>
              {dmInfoBuffer.map((l, idx) => (
                <p key={idx} className="my-1">{renderInlineTags(l)}</p>
              ))}
            </div>
          );
        }
        return;
      }
      if (inDmInfo) {
        dmInfoBuffer.push(line);
        return;
      }

      // Secrets Block (Omit if player safe)
      if (trimmed.toLowerCase() === ':::secrets') {
        inSecrets = true;
        secretsBuffer = [];
        return;
      }
      if (inSecrets && trimmed === ':::') {
        inSecrets = false;
        if (!isPlayerSafe) {
          elements.push(
            <details
              key={`secrets-${lineIdx}`}
              className="my-3.5 p-3 rounded-xl bg-purple-950/30 border border-purple-800/60 text-purple-200 text-xs cursor-pointer group"
            >
              <summary className="font-bold flex items-center space-x-1.5 text-purple-400 select-none">
                <Lock className="w-3.5 h-3.5" />
                <span>Hidden Secret / Spoiler (Click to Reveal)</span>
              </summary>
              <div className="pt-2 text-slate-300 select-text leading-relaxed">
                {secretsBuffer.map((l, idx) => (
                  <p key={idx} className="my-1">{renderInlineTags(l)}</p>
                ))}
              </div>
            </details>
          );
        }
        return;
      }
      if (inSecrets) {
        secretsBuffer.push(line);
        return;
      }

      // DC Check Block
      if (trimmed.toLowerCase().startsWith(':::check')) {
        inCheck = true;
        checkBuffer = [];
        const skillMatch = line.match(/skill=["']([^"']+)["']/i);
        const dcMatch = line.match(/dc=["']([^"']+)["']/i);
        checkMeta = {
          skill: skillMatch ? skillMatch[1] : 'Wisdom (Perception)',
          dc: dcMatch ? dcMatch[1] : '15',
        };
        return;
      }
      if (inCheck && trimmed === ':::') {
        inCheck = false;
        elements.push(
          <InteractiveDcCheckCard
            key={`check-${lineIdx}`}
            skill={checkMeta.skill}
            dcStr={checkMeta.dc}
            rawLines={checkBuffer}
            renderInline={renderInlineTags}
          />
        );
        return;
      }
      if (inCheck) {
        checkBuffer.push(line);
        return;
      }

      // Callout Alerts (> [!WARNING], > [!TIP], > [!NOTE], etc)
      if (trimmed.startsWith('> [!WARNING]') || trimmed.startsWith('> [!CAUTION]')) {
        const alertContent = trimmed.replace(/^>s*[!(WARNING|CAUTION)]s*/i, '');
        elements.push(
          <div key={`alert-warn-${lineIdx}`} className="my-3 p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/50 text-amber-200 text-xs leading-relaxed flex items-start space-x-2.5 shadow-md">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1 select-text">{renderInlineTags(alertContent || 'Warning')}</div>
          </div>
        );
        return;
      }
      if (trimmed.startsWith('> [!TIP]') || trimmed.startsWith('> [!NOTE]')) {
        const alertContent = trimmed.replace(/^>s*[!(TIP|NOTE)]s*/i, '');
        elements.push(
          <div key={`alert-tip-${lineIdx}`} className="my-3 p-3.5 rounded-xl bg-blue-950/40 border border-blue-500/50 text-blue-200 text-xs leading-relaxed flex items-start space-x-2.5 shadow-md">
            <Lightbulb className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div className="flex-1 select-text">{renderInlineTags(alertContent || 'Tip')}</div>
          </div>
        );
        return;
      }

      // Markdown Tables
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        inTable = true;
        tableBuffer.push(trimmed);
        return;
      } else if (inTable) {
        flushTable(`tbl-${lineIdx}`);
      }

      // Headers
      if (trimmed.startsWith('### ')) {
        elements.push(
          <h3 key={lineIdx} className={`font-serif font-bold text-amber-400 mt-5 mb-1.5 ${isPlayerSafe ? 'text-xl' : 'text-base'}`}>
            {renderInlineTags(trimmed.replace(/^###\s+/, ''))}
          </h3>
        );
        return;
      }
      if (trimmed.startsWith('## ')) {
        elements.push(
          <h2 key={lineIdx} className={`font-serif font-bold text-slate-100 mt-6 mb-2 border-b border-surface-border/80 pb-1.5 ${isPlayerSafe ? 'text-2xl' : 'text-lg'}`}>
            {renderInlineTags(trimmed.replace(/^##\s+/, ''))}
          </h2>
        );
        return;
      }
      if (trimmed.startsWith('# ')) {
        elements.push(
          <h1 key={lineIdx} className={`font-serif font-bold text-amber-500 mt-7 mb-3 ${isPlayerSafe ? 'text-3xl' : 'text-2xl'}`}>
            {renderInlineTags(trimmed.replace(/^#\s+/, ''))}
          </h1>
        );
        return;
      }

      // Bullet lists
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        elements.push(
          <li key={lineIdx} className={`ml-5 list-disc text-slate-200 my-1 ${isPlayerSafe ? 'text-sm sm:text-base' : 'text-xs'}`}>
            {renderInlineTags(trimmed.replace(/^[-*]\s+/, ''))}
          </li>
        );
        return;
      }

      // Blank line (Consistent vertical paragraph spacing)
      if (!trimmed) {
        elements.push(<div key={lineIdx} className="h-4" />);
        return;
      }

      // Standard Paragraph
      elements.push(
        <p key={lineIdx} className={`text-slate-200 leading-relaxed select-text my-1.5 ${isPlayerSafe ? 'text-sm sm:text-base font-serif' : 'text-xs'}`}>
          {renderInlineTags(line)}
        </p>
      );
    });

    if (inTable) flushTable('tbl-end');

    return elements;
  };

  // Helper to render bold, italic, code spans and clickable tags
  const renderInlineTags = (str: string): React.ReactNode => {
    if (!str) return str;

    const parseMarkdownSpans = (text: string, keyPrefix: string): React.ReactNode => {
      // Matches **bold**, *italic*, `code`
      const mdRegex = /(\*\*(.*?)\*\*|\*(.*?)\*|`(.*?)`)/g;
      const subParts: React.ReactNode[] = [];
      let subLastIndex = 0;
      let mdMatch;

      while ((mdMatch = mdRegex.exec(text)) !== null) {
        if (mdMatch.index > subLastIndex) {
          subParts.push(text.substring(subLastIndex, mdMatch.index));
        }

        if (mdMatch[2] !== undefined) {
          subParts.push(
            <strong key={`${keyPrefix}-b-${mdMatch.index}`} className="font-bold text-amber-300">
              {mdMatch[2]}
            </strong>
          );
        } else if (mdMatch[3] !== undefined) {
          subParts.push(
            <em key={`${keyPrefix}-i-${mdMatch.index}`} className="italic text-slate-200">
              {mdMatch[3]}
            </em>
          );
        } else if (mdMatch[4] !== undefined) {
          subParts.push(
            <code key={`${keyPrefix}-c-${mdMatch.index}`} className="px-1.5 py-0.5 rounded bg-surface-50 font-mono text-xs text-amber-300 border border-surface-border">
              {mdMatch[4]}
            </code>
          );
        }

        subLastIndex = mdMatch.index + mdMatch[0].length;
      }

      if (subLastIndex < text.length) {
        subParts.push(text.substring(subLastIndex));
      }

      return subParts.length > 0 ? <React.Fragment key={keyPrefix}>{subParts}</React.Fragment> : text;
    };

    const tagRegex = /@\[(.*?)\]\((monster|spell|item|note):([^\)]+)\)/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = tagRegex.exec(str)) !== null) {
      const matchIndex = match.index;
      if (matchIndex > lastIndex) {
        parts.push(parseMarkdownSpans(str.substring(lastIndex, matchIndex), `txt-${matchIndex}`));
      }

      const label = match[1];
      const entityType = match[2];
      const entityId = match[3];

      let badgeColor = 'bg-amber-950/80 border-amber-700 text-amber-300 hover:bg-amber-900';
      if (entityType === 'spell') badgeColor = 'bg-indigo-950/80 border-indigo-700 text-indigo-300 hover:bg-indigo-900';
      if (entityType === 'item') badgeColor = 'bg-emerald-950/80 border-emerald-700 text-emerald-300 hover:bg-emerald-900';
      if (entityType === 'note') badgeColor = 'bg-purple-950/80 border-purple-700 text-purple-300 hover:bg-purple-900';

      parts.push(
        <button
          key={`tag-${matchIndex}`}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (!isPlayerSafe) {
              setActiveEntityModal({ type: entityType, id: entityId });
            }
          }}
          className={`inline-flex items-center space-x-1 px-1.5 py-0.2 rounded border font-semibold text-[11px] transition-all cursor-pointer shadow-xs mx-0.5 ${badgeColor}`}
          title={`Click to inspect ${label} (${entityType})`}
        >
          <span>{label}</span>
        </button>
      );

      lastIndex = matchIndex + match[0].length;
    }

    if (lastIndex < str.length) {
      parts.push(parseMarkdownSpans(str.substring(lastIndex), `txt-end-${lastIndex}`));
    }

    return parts.length > 0 ? parts : parseMarkdownSpans(str, 'full');
  };

  // Resolve active entity modal
  const monsterEntity = activeEntityModal?.type === 'monster'
    ? db?.monsters?.find((m) => m.id === activeEntityModal.id)
    : null;
  const spellEntity = activeEntityModal?.type === 'spell'
    ? db?.spells?.find((s) => s.id === activeEntityModal.id)
    : null;
  const itemEntity = activeEntityModal?.type === 'item'
    ? db?.items?.find((i) => i.id === activeEntityModal.id)
    : null;

  return (
    <div className={className}>
      <div className="space-y-1">{renderFormattedMarkdown(content)}</div>

      {/* Interactive Entity Statblock Modal */}
      {activeEntityModal && !isPlayerSafe && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setActiveEntityModal(null)}
        >
          <div 
            className="bg-[#121720] border border-surface-border rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-5 relative animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveEntityModal(null)}
              className="absolute top-4 right-4 p-1 rounded text-slate-400 hover:text-white bg-surface-100 border border-surface-border z-10"
            >
              <X className="w-4 h-4" />
            </button>

            {monsterEntity && <MonsterStatBlock monster={monsterEntity} />}
            {spellEntity && <SpellCard spell={spellEntity} />}
            {itemEntity && <ItemCard item={itemEntity} />}
          </div>
        </div>
      )}
    </div>
  );
};
