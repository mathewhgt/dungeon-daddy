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
  Layers,
  Image as ImageIcon,
  ZoomIn,
  Tv,
  Compass,
  Maximize2,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MonsterStatBlock } from '../compendium/MonsterStatBlock';
import { SpellCard } from '../compendium/SpellCard';
import { ItemCard } from '../compendium/ItemCard';
import { crossWindowService } from '../../services/crossWindowService';
import { NoteCoverBanner } from './NoteCoverBanner';
import { openNotesWindow } from './LiveNoteEditor';
import { getNoteCategoryIcon, getNoteCategoryStyle } from './NotesView';

interface NoteContentRendererProps {
  content: string;
  isPlayerSafe?: boolean;
  className?: string;
  coverImageUrl?: string;
  coverImagePositionY?: number;
  coverImageHeight?: number;
}

export const NoteContentRenderer: React.FC<NoteContentRendererProps> = ({ 
  content, 
  isPlayerSafe = false,
  className = '',
  coverImageUrl,
  coverImagePositionY,
  coverImageHeight
}) => {
  const { db, setActiveMapId, setActiveTab, setSelectedNoteId, projectMediaToDisplay, showToast } = useApp();
  const [activeEntityModal, setActiveEntityModal] = useState<{ type: string; id: string } | null>(null);
  const [lightboxImage, setLightboxImage] = useState<{ src: string; alt?: string; caption?: string } | null>(null);

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

    let inColumns = false;
    let columnsList: string[][] = [];
    let currentColumnBuffer: string[] = [];

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
        <div key={key} className="my-3 overflow-x-auto rounded-xl border border-surface-border bg-surface-100/90 shadow-md clear-both">
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

    const flushColumns = (key: string) => {
      if (currentColumnBuffer.length > 0) {
        columnsList.push(currentColumnBuffer);
        currentColumnBuffer = [];
      }
      if (columnsList.length === 0) return;

      elements.push(
        <div key={key} className={`my-4 grid grid-cols-1 md:grid-cols-${Math.min(columnsList.length, 3)} gap-4 clear-both`}>
          {columnsList.map((colLines, colIdx) => (
            <div key={colIdx} className="p-4 rounded-xl bg-surface-100/40 border border-surface-border/80 space-y-2">
              <NoteContentRenderer content={colLines.join('\n')} isPlayerSafe={isPlayerSafe} />
            </div>
          ))}
        </div>
      );
      columnsList = [];
      inColumns = false;
    };

    lines.forEach((line, lineIdx) => {
      const trimmed = line.trim();

      // Multi-column container
      if (trimmed.toLowerCase() === ':::columns') {
        inColumns = true;
        columnsList = [];
        currentColumnBuffer = [];
        return;
      }
      if (inColumns) {
        if (trimmed.toLowerCase() === ':::column') {
          if (currentColumnBuffer.length > 0) {
            columnsList.push(currentColumnBuffer);
            currentColumnBuffer = [];
          }
          return;
        }
        if (trimmed === ':::') {
          flushColumns(`cols-${lineIdx}`);
          return;
        }
        currentColumnBuffer.push(line);
        return;
      }

      // Single-line or block :::image
      if (trimmed.toLowerCase().startsWith(':::image')) {
        const srcMatch = line.match(/src=["']([^"']+)["']/i);
        const altMatch = line.match(/alt=["']([^"']+)["']/i);
        const alignMatch = line.match(/align=["']([^"']+)["']/i);
        const sizeMatch = line.match(/size=["']([^"']+)["']/i);
        const frameMatch = line.match(/frame=["']([^"']+)["']/i);
        const captionMatch = line.match(/caption=["']([^"']+)["']/i);

        const src = srcMatch ? srcMatch[1] : '';
        const alt = altMatch ? altMatch[1] : 'Artwork';
        const align = alignMatch ? alignMatch[1].toLowerCase() : 'left';
        const size = sizeMatch ? sizeMatch[1] : '50%';
        const frame = frameMatch ? frameMatch[1].toLowerCase() : 'gold';
        const caption = captionMatch ? captionMatch[1] : '';

        if (src) {
          // Floating alignment styling
          let alignClass = 'float-left mr-5 mb-4';
          if (align === 'right') alignClass = 'float-right ml-5 mb-4';
          else if (align === 'center') alignClass = 'mx-auto my-4 text-center block clear-both';
          else if (align === 'column') alignClass = 'w-full my-2 block';

          // Frame border styling
          let frameClass = 'border-2 border-amber-500/70 shadow-lg shadow-amber-500/10';
          if (frame === 'parchment') frameClass = 'border-2 border-[#a3794d] bg-[#1a140d] shadow-lg';
          else if (frame === 'dark') frameClass = 'border border-surface-border bg-surface-100 shadow-md';
          else if (frame === 'none') frameClass = 'border-0 shadow-sm';

          elements.push(
            <div
              key={`img-block-${lineIdx}`}
              className={`group transition-all ${alignClass}`}
              style={{
                width: align === 'center' ? (size === '100%' ? '100%' : size) : size,
                maxWidth: '100%',
              }}
            >
              <div className={`overflow-hidden rounded-xl relative ${frameClass}`}>
                <img
                  src={src}
                  alt={alt}
                  className="w-full h-auto object-cover rounded-lg cursor-pointer max-h-[70vh] transition-transform duration-300 group-hover:scale-[1.01]"
                  onClick={() => setLightboxImage({ src, alt, caption })}
                />

                {/* Floating Image Actions (Lightbox & Project to TV) */}
                <div className="absolute top-2 right-2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 backdrop-blur-md rounded-lg p-1 border border-surface-border shadow-xl">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxImage({ src, alt, caption });
                    }}
                    className="p-1 rounded text-slate-300 hover:text-white hover:bg-surface-50 transition-colors"
                    title="Fullscreen Lightbox"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      projectMediaToDisplay({
                        id: `img-${Date.now()}`,
                        type: 'image',
                        title: alt,
                        imageUrl: src,
                        content: caption,
                        badge: 'Artwork',
                      });
                      if (showToast) showToast(`Projected "${alt}" to TV!`);
                    }}
                    className="p-1 rounded text-sky-400 hover:text-sky-300 hover:bg-surface-50 transition-colors flex items-center space-x-0.5"
                    title="Project this image to Player Display"
                  >
                    <Tv className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {caption && (
                <p className="text-[11px] text-slate-400 italic text-center mt-1.5 leading-snug px-1">
                  {renderInlineTags(caption)}
                </p>
              )}
            </div>
          );
        }
        return;
      }

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
            className={`my-4 p-5 rounded-2xl bg-gradient-to-br from-[#1c1813] to-[#14100b] border-2 border-amber-500/60 shadow-xl text-amber-100/95 italic font-book leading-relaxed select-text clear-both ${
              isPlayerSafe ? 'text-base sm:text-lg p-6' : 'text-sm'
            }`}
          >
            <div className="text-xs font-sans font-bold uppercase tracking-widest text-amber-400 not-italic mb-2 flex items-center space-x-1.5">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>Read Aloud</span>
            </div>
            {readAloudBuffer.map((l, idx) => (
              !l.trim() ? (
                <div key={idx} className="h-3.5" />
              ) : (
                <p key={idx} className="my-1.5">{renderInlineTags(l)}</p>
              )
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
              className="my-3.5 p-4 rounded-xl bg-blue-950/30 border border-blue-800/60 shadow-md text-blue-100 text-xs leading-relaxed select-text clear-both"
            >
              <div className="text-[10px] font-bold uppercase tracking-wider text-blue-400 mb-1 flex items-center space-x-1">
                <Info className="w-3.5 h-3.5" />
                <span>GM / DM Tactics & Notes</span>
              </div>
              {dmInfoBuffer.map((l, idx) => (
                !l.trim() ? (
                  <div key={idx} className="h-3" />
                ) : (
                  <p key={idx} className="my-1">{renderInlineTags(l)}</p>
                )
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
              className="my-3.5 p-3 rounded-xl bg-purple-950/30 border border-purple-800/60 text-purple-200 text-xs cursor-pointer group clear-both"
            >
              <summary className="font-bold flex items-center space-x-1.5 text-purple-400 select-none">
                <Lock className="w-3.5 h-3.5" />
                <span>Hidden Secret / Spoiler (Click to Reveal)</span>
              </summary>
              <div className="pt-2 text-slate-300 select-text leading-relaxed">
                {secretsBuffer.map((l, idx) => (
                  !l.trim() ? (
                    <div key={idx} className="h-3" />
                  ) : (
                    <p key={idx} className="my-1">{renderInlineTags(l)}</p>
                  )
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
          <div key={`check-wrap-${lineIdx}`} className="clear-both my-3">
            <InteractiveDcCheckCard
              skill={checkMeta.skill}
              dcStr={checkMeta.dc}
              rawLines={checkBuffer}
              renderInline={renderInlineTags}
            />
          </div>
        );
        return;
      }
      if (inCheck) {
        checkBuffer.push(line);
        return;
      }

      // Callout Alerts (> [!WARNING], > [!TIP], > [!NOTE], etc)
      if (trimmed.startsWith('> [!WARNING]') || trimmed.startsWith('> [!CAUTION]')) {
        const alertContent = trimmed.replace(/^>\s*\[!(WARNING|CAUTION)\]\s*/i, '');
        elements.push(
          <div key={`alert-warn-${lineIdx}`} className="my-3 p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/50 text-amber-200 text-xs leading-relaxed flex items-start space-x-2.5 shadow-md clear-both">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1 select-text">{renderInlineTags(alertContent || 'Warning')}</div>
          </div>
        );
        return;
      }
      if (trimmed.startsWith('> [!TIP]') || trimmed.startsWith('> [!NOTE]')) {
        const alertContent = trimmed.replace(/^>\s*\[!(TIP|NOTE)\]\s*/i, '');
        elements.push(
          <div key={`alert-tip-${lineIdx}`} className="my-3 p-3.5 rounded-xl bg-blue-950/40 border border-blue-500/50 text-blue-200 text-xs leading-relaxed flex items-start space-x-2.5 shadow-md clear-both">
            <Lightbulb className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div className="flex-1 select-text">{renderInlineTags(alertContent || 'Tip')}</div>
          </div>
        );
        return;
      }

      // Standard markdown images: ![alt](url)
      const mdImgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
      if (mdImgMatch) {
        const alt = mdImgMatch[1] || 'Image';
        const src = mdImgMatch[2];
        elements.push(
          <div key={`md-img-${lineIdx}`} className="my-4 rounded-xl overflow-hidden border border-surface-border bg-surface-100 max-w-lg mx-auto shadow-lg group relative clear-both">
            <img
              src={src}
              alt={alt}
              className="w-full h-auto object-cover cursor-pointer"
              onClick={() => setLightboxImage({ src, alt })}
            />
            {alt && <p className="p-2 text-[11px] text-slate-400 text-center italic border-t border-surface-border/50">{alt}</p>}
            <div className="absolute top-2 right-2 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 backdrop-blur-md rounded-lg p-1 border border-surface-border shadow-xl">
              <button
                type="button"
                onClick={() => setLightboxImage({ src, alt })}
                className="p-1 rounded text-slate-300 hover:text-white"
                title="Fullscreen Lightbox"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  projectMediaToDisplay({
                    id: `img-${Date.now()}`,
                    type: 'image',
                    title: alt,
                    imageUrl: src,
                    badge: 'Artwork',
                  });
                  if (showToast) showToast(`Projected "${alt}" to TV!`);
                }}
                className="p-1 rounded text-sky-400 hover:text-sky-300"
                title="Project to TV"
              >
                <Tv className="w-3.5 h-3.5" />
              </button>
            </div>
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

      // Headers (Clear floats so sections start cleanly)
      if (trimmed.startsWith('### ')) {
        elements.push(
          <h3 key={lineIdx} className={`font-serif font-bold text-amber-400 mt-5 mb-1.5 clear-both ${isPlayerSafe ? 'text-xl' : 'text-base'}`}>
            {renderInlineTags(trimmed.replace(/^###\s+/, ''))}
          </h3>
        );
        return;
      }
      if (trimmed.startsWith('## ')) {
        elements.push(
          <h2 key={lineIdx} className={`font-serif font-bold text-slate-100 mt-6 mb-2 border-b border-surface-border/80 pb-1.5 clear-both ${isPlayerSafe ? 'text-2xl' : 'text-lg'}`}>
            {renderInlineTags(trimmed.replace(/^##\s+/, ''))}
          </h2>
        );
        return;
      }
      if (trimmed.startsWith('# ')) {
        elements.push(
          <h1 key={lineIdx} className={`font-serif font-bold text-amber-500 mt-7 mb-3 clear-both ${isPlayerSafe ? 'text-3xl' : 'text-2xl'}`}>
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
        elements.push(<div key={lineIdx} className="h-2" />);
        return;
      }

      // Standard Paragraph
      elements.push(
        <p key={lineIdx} className={`text-slate-200 leading-relaxed select-text my-1.5 ${isPlayerSafe ? 'text-sm sm:text-base font-book' : 'text-xs'}`}>
          {renderInlineTags(line)}
        </p>
      );
    });

    if (inTable) flushTable('tbl-end');
    if (inColumns) flushColumns('cols-end');

    return elements;
  };

  // Helper to render bold, italic, code spans and clickable tags
  const renderInlineTags = (str: string): React.ReactNode => {
    if (!str) return str;

    const parseMarkdownSpans = (text: string, keyPrefix: string): React.ReactNode => {
      // Matches **bold**, *italic*, `code`, ~~strikethrough~~, <u>underline</u>, <ins>underline</ins>
      const mdRegex = /(\*\*(.*?)\*\*|\*(.*?)\*|`(.*?)`|~~(.*?)~~|<u>(.*?)<\/u>|<ins>(.*?)<\/ins>)/g;
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
        } else if (mdMatch[5] !== undefined) {
          subParts.push(
            <del key={`${keyPrefix}-del-${mdMatch.index}`} className="line-through text-slate-400">
              {mdMatch[5]}
            </del>
          );
        } else if (mdMatch[6] !== undefined || mdMatch[7] !== undefined) {
          const uContent = mdMatch[6] !== undefined ? mdMatch[6] : mdMatch[7];
          subParts.push(
            <span key={`${keyPrefix}-u-${mdMatch.index}`} className="underline decoration-amber-400/70 underline-offset-2">
              {uContent}
            </span>
          );
        }

        subLastIndex = mdMatch.index + mdMatch[0].length;
      }

      if (subLastIndex < text.length) {
        subParts.push(text.substring(subLastIndex));
      }

      return subParts.length > 0 ? <React.Fragment key={keyPrefix}>{subParts}</React.Fragment> : text;
    };

    const tagRegex = /@\[(.*?)\]\((monster|spell|item|npc|rule|note|map):([^\)]+)\)|\[\[(monster|spell|item|npc|rule|note|map):([^:\]]+)(?::([^\]]+))?\]\]/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while ((match = tagRegex.exec(str)) !== null) {
      const matchIndex = match.index;
      if (matchIndex > lastIndex) {
        parts.push(parseMarkdownSpans(str.substring(lastIndex, matchIndex), `txt-${matchIndex}`));
      }

      // Format 1: @[label](type:id) -> match[1]=label, match[2]=type, match[3]=id
      // Format 2: [[type:label:id]] -> match[4]=type, match[5]=label, match[6]=id (or label)
      const label = match[1] || match[5] || '';
      const entityType = match[2] || match[4] || 'note';
      const entityId = match[3] || match[6] || match[5] || '';

      let badgeColor = 'bg-amber-950/80 border-amber-700 text-amber-300 hover:bg-amber-900';
      let icon = '🔮';
      if (entityType === 'map') {
        badgeColor = 'bg-emerald-950/80 border-emerald-700 text-emerald-300 hover:bg-emerald-900';
        icon = '🗺️';
      } else if (entityType === 'spell') {
        badgeColor = 'bg-indigo-950/80 border-indigo-700 text-indigo-300 hover:bg-indigo-900';
      } else if (entityType === 'item') {
        badgeColor = 'bg-teal-950/80 border-teal-700 text-teal-300 hover:bg-teal-900';
      } else if (entityType === 'note') {
        badgeColor = 'bg-purple-950/80 border-purple-700 text-purple-300 hover:bg-purple-900';
      }

      parts.push(
        <button
          key={`tag-${matchIndex}`}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (entityType === 'map') {
              setActiveMapId(entityId);
              setActiveTab('maps');
              showToast(`Opened battlemap: ${label}`);
              crossWindowService.broadcast({ type: 'SWITCH_MAP', mapId: entityId });
              return;
            }
            if (!isPlayerSafe) {
              setActiveEntityModal({ type: entityType, id: entityId });
            }
          }}
          className={`inline-flex items-center space-x-1 px-1.5 py-0.2 rounded border font-scaly font-bold text-[11px] transition-all cursor-pointer shadow-xs mx-0.5 ${badgeColor}`}
          title={entityType === 'map' ? `Click to open battlemap: ${label}` : `Click to inspect ${label} (${entityType})`}
        >
          <span>{icon} {label}</span>
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
  const noteEntity = activeEntityModal?.type === 'note'
    ? (() => {
        for (const c of db?.campaigns || []) {
          const match = (c.notes || []).find((n) => n.id === activeEntityModal.id);
          if (match) return { note: match, campaignId: c.id };
        }
        return null;
      })()
    : null;

  return (
    <div className={className}>
      {coverImageUrl && (
        <div className="mb-4">
          <NoteCoverBanner
            imageUrl={coverImageUrl}
            positionY={coverImagePositionY}
            height={coverImageHeight || 240}
            isEditable={false}
          />
        </div>
      )}
      <div className="space-y-1 clearfix">{renderFormattedMarkdown(content)}</div>

      {/* Interactive Entity Statblock / Note Modal */}
      {activeEntityModal && !isPlayerSafe && (
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
              {noteEntity && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveEntityModal(null);
                      setSelectedNoteId(noteEntity.note.id);
                      setActiveTab('notes');
                      crossWindowService.broadcast({ type: 'SWITCH_NOTE', noteId: noteEntity.note.id });
                      showToast(`Navigated to "${noteEntity.note.name}"`);
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
                      openNotesWindow(noteEntity.note.id, noteEntity.campaignId);
                    }}
                    className="p-1.5 bg-surface-50 hover:bg-surface-hover text-slate-300 hover:text-amber-300 border border-surface-border rounded-lg transition-colors cursor-pointer"
                    title="Open in Pop-out Window"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </>
              )}

              <button
                onClick={() => setActiveEntityModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-surface-100 hover:bg-surface-hover border border-surface-border transition-colors cursor-pointer"
                title="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {monsterEntity && <MonsterStatBlock monster={monsterEntity} />}
            {spellEntity && <SpellCard spell={spellEntity} />}
            {itemEntity && <ItemCard item={itemEntity} />}
            {noteEntity && (() => {
              const targetNote = noteEntity.note;
              const catStyle = getNoteCategoryStyle(targetNote.category || 'General');
              const CatIcon = getNoteCategoryIcon(targetNote.category || 'General');

              return (
                <div className="space-y-3.5 pt-1 select-text">
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
                    {renderFormattedMarkdown(targetNote.content || '')}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Fullscreen Artwork / Map Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fadeIn"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="relative max-w-5xl max-h-[95vh] w-full flex flex-col items-center bg-[#10141d] border-2 border-amber-500/40 rounded-3xl p-4 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Toolbar */}
            <div className="w-full flex items-center justify-between pb-3 border-b border-surface-border/80">
              <div className="flex items-center space-x-2">
                <ImageIcon className="w-4 h-4 text-pink-400" />
                <span className="font-serif font-bold text-slate-100 text-sm">{lightboxImage.alt || 'Artwork View'}</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    projectMediaToDisplay({
                      id: `img-${Date.now()}`,
                      type: 'image',
                      title: lightboxImage.alt || 'Artwork',
                      imageUrl: lightboxImage.src,
                      content: lightboxImage.caption,
                      badge: 'Artwork',
                    });
                    if (showToast) showToast(`Projected "${lightboxImage.alt || 'Artwork'}" to TV!`);
                  }}
                  className="px-3 py-1.5 bg-indigo-950 hover:bg-indigo-900 border border-indigo-700 text-sky-300 font-bold text-xs rounded-xl flex items-center space-x-1.5 transition-colors shadow-md"
                >
                  <Tv className="w-4 h-4 text-sky-400" />
                  <span>Project to TV</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLightboxImage(null)}
                  className="p-1.5 rounded-xl bg-surface-50 hover:bg-surface-hover text-slate-300 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* High-res Image Display */}
            <div className="flex-1 w-full flex items-center justify-center p-3 overflow-hidden">
              <img
                src={lightboxImage.src}
                alt={lightboxImage.alt || 'Artwork'}
                className="max-h-[75vh] w-auto object-contain rounded-2xl shadow-2xl border border-surface-border/60"
              />
            </div>

            {lightboxImage.caption && (
              <p className="text-xs text-amber-200/90 font-serif italic text-center pt-2 border-t border-surface-border/60 w-full">
                {lightboxImage.caption}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
