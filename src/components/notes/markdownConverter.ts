/**
 * Bidirectional conversion between Dungeon Daddy Markdown and ContentEditable HTML
 */

export function createEntityBadgeHtml(type: string, label: string, id: string): string {
  const icon = type === 'map' ? '🗺️' : '🔮';
  return `<span class="dd-entity-badge" data-type="${type}" data-id="${id}" contenteditable="false">${icon} ${label}</span>&nbsp;`;
}

export function markdownToHtml(markdown: string): string {
  if (!markdown) return '<p><br></p>';

  const lines = markdown.split('\n');
  const htmlParts: string[] = [];

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

  const escapeHtml = (text: string) => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  };

  const formatInline = (text: string) => {
    let res = escapeHtml(text);
    // Entity tags: [[monster:name:id]] or [[map:name:id]]
    res = res.replace(/\[\[(monster|spell|item|npc|rule|note|map):([^:\]]+)(?::([^\]]+))?\]\]/g, (_, type, label, id) => {
      const entityId = id || label;
      const icon = type === 'map' ? '🗺️' : '🔮';
      return `<span class="dd-entity-badge" data-type="${type}" data-id="${entityId}" contenteditable="false">${icon} ${label}</span>`;
    });
    // Entity tags: @[name](type:id)
    res = res.replace(/@\[([^\]]+)\]\((monster|spell|item|npc|rule|note|map):([^)]+)\)/g, (_, label, type, id) => {
      const icon = type === 'map' ? '🗺️' : '🔮';
      return `<span class="dd-entity-badge" data-type="${type}" data-id="${id}" contenteditable="false">${icon} ${label}</span>`;
    });
    // Bold: **text**, <strong>, <b>
    res = res.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    res = res.replace(/&lt;strong&gt;(.*?)&lt;\/strong&gt;/gi, '<strong>$1</strong>');
    res = res.replace(/&lt;b&gt;(.*?)&lt;\/b&gt;/gi, '<strong>$1</strong>');
    // Italic: *text*, _text_, <em>, <i>
    res = res.replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');
    res = res.replace(/(?<!_)_(?!_)(.*?)(?<!_)_(?!_)/g, '<em>$1</em>');
    res = res.replace(/&lt;em&gt;(.*?)&lt;\/em&gt;/gi, '<em>$1</em>');
    res = res.replace(/&lt;i&gt;(.*?)&lt;\/i&gt;/gi, '<em>$1</em>');
    // Inline code: `text`
    res = res.replace(/`(.*?)`/g, '<code>$1</code>');
    // Strikethrough: ~~text~~, <del>, <s>, <strike>
    res = res.replace(/~~(.*?)~~/g, '<s>$1</s>');
    res = res.replace(/&lt;del&gt;(.*?)&lt;\/del&gt;/gi, '<s>$1</s>');
    res = res.replace(/&lt;s&gt;(.*?)&lt;\/s&gt;/gi, '<s>$1</s>');
    res = res.replace(/&lt;strike&gt;(.*?)&lt;\/strike&gt;/gi, '<s>$1</s>');
    res = res.replace(/<del>(.*?)<\/del>/gi, '<s>$1</s>');
    res = res.replace(/<strike>(.*?)<\/strike>/gi, '<s>$1</s>');
    // Underline: <u>text</u>, <ins>text</ins>
    res = res.replace(/&lt;u&gt;(.*?)&lt;\/u&gt;/gi, '<u>$1</u>');
    res = res.replace(/&lt;ins&gt;(.*?)&lt;\/ins&gt;/gi, '<u>$1</u>');
    res = res.replace(/<u>(.*?)<\/u>/gi, '<u>$1</u>');
    return res || '<br>';
  };

  const flushTable = () => {
    if (tableBuffer.length === 0) return;
    const rows = tableBuffer.map((line) =>
      line
        .split('|')
        .map((c) => c.trim())
        .filter((_, idx, arr) => idx > 0 && idx < arr.length - 1)
    );
    const headerRow = rows[0] || [];
    const dataRows = rows.slice(2);

    let html = '<div class="dd-table-container my-3 overflow-x-auto rounded-xl border border-surface-border bg-surface-100/90 shadow-md"><table class="w-full text-left text-xs border-collapse"><thead><tr class="bg-surface-50/90 border-b border-surface-border text-amber-300 font-serif font-bold">';
    headerRow.forEach((col) => {
      html += `<th class="p-2.5">${formatInline(col)}</th>`;
    });
    html += '</tr></thead><tbody class="divide-y divide-surface-border/60">';
    dataRows.forEach((row) => {
      html += '<tr class="hover:bg-surface-hover/40 text-slate-200">';
      row.forEach((cell) => {
        html += `<td class="p-2.5">${formatInline(cell)}</td>`;
      });
      html += '</tr>';
    });
    html += '</tbody></table></div>';
    htmlParts.push(html);
    tableBuffer = [];
    inTable = false;
  };

  const flushColumns = () => {
    if (currentColumnBuffer.length > 0) {
      columnsList.push(currentColumnBuffer);
      currentColumnBuffer = [];
    }
    if (columnsList.length === 0) return;

    let html = `<div class="dd-columns-container my-4 grid grid-cols-1 md:grid-cols-${Math.min(columnsList.length, 3)} gap-4" data-dd-block="columns">`;
    columnsList.forEach((colLines) => {
      html += `<div class="dd-column p-4 rounded-xl bg-surface-100/40 border border-surface-border/80 space-y-2">${markdownToHtml(colLines.join('\n'))}</div>`;
    });
    html += '</div>';
    htmlParts.push(html);
    columnsList = [];
    inColumns = false;
  };

  lines.forEach((line) => {
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
        flushColumns();
        return;
      }
      currentColumnBuffer.push(line);
      return;
    }

    // Read Aloud block
    if (trimmed.toLowerCase() === ':::read-aloud') {
      inReadAloud = true;
      readAloudBuffer = [];
      return;
    }
    if (inReadAloud && trimmed === ':::') {
      inReadAloud = false;
      const innerHtml = readAloudBuffer.map((l) => `<p class="my-1">${formatInline(l)}</p>`).join('');
      htmlParts.push(
        `<div class="dd-read-aloud my-4 p-4 rounded-xl bg-[#1e1913] border-l-4 border-amber-500/80 shadow-md font-book text-amber-100/90 italic space-y-1.5" data-dd-block="read-aloud"><div class="text-[11px] uppercase tracking-wider text-amber-400 font-sans font-bold not-italic flex items-center gap-1.5 pb-1 border-b border-amber-500/20" contenteditable="false">📜 Read Aloud to Players</div><div class="dd-block-content text-xs sm:text-sm leading-relaxed font-book">${innerHtml || '<p><br></p>'}</div></div>`
      );
      return;
    }
    if (inReadAloud) {
      readAloudBuffer.push(line);
      return;
    }

    // DM Info block
    if (trimmed.toLowerCase() === ':::dm-info') {
      inDmInfo = true;
      dmInfoBuffer = [];
      return;
    }
    if (inDmInfo && trimmed === ':::') {
      inDmInfo = false;
      const innerHtml = dmInfoBuffer.map((l) => `<p class="my-1">${formatInline(l)}</p>`).join('');
      htmlParts.push(
        `<div class="dd-dm-info my-3.5 p-3.5 rounded-xl bg-blue-950/40 border-l-4 border-blue-500 shadow-md text-blue-100 text-xs space-y-1.5" data-dd-block="dm-info"><div class="text-[11px] uppercase tracking-wider text-blue-400 font-bold flex items-center gap-1.5 pb-1 border-b border-blue-500/20" contenteditable="false">💡 DM Guidance & Tactics</div><div class="dd-block-content leading-relaxed">${innerHtml || '<p><br></p>'}</div></div>`
      );
      return;
    }
    if (inDmInfo) {
      dmInfoBuffer.push(line);
      return;
    }

    // Secrets / Spoiler block
    if (trimmed.toLowerCase() === ':::secrets') {
      inSecrets = true;
      secretsBuffer = [];
      return;
    }
    if (inSecrets && trimmed === ':::') {
      inSecrets = false;
      const innerHtml = secretsBuffer.map((l) => `<p class="my-1">${formatInline(l)}</p>`).join('');
      htmlParts.push(
        `<div class="dd-secrets my-3.5 p-3.5 rounded-xl bg-purple-950/35 border border-purple-800/60 shadow-md text-purple-200 text-xs space-y-1.5" data-dd-block="secrets"><div class="text-[11px] uppercase tracking-wider text-purple-400 font-bold flex items-center gap-1.5 pb-1 border-b border-purple-800/40" contenteditable="false">🔒 Hidden DM Secret / Spoiler</div><div class="dd-block-content leading-relaxed">${innerHtml || '<p><br></p>'}</div></div>`
      );
      return;
    }
    if (inSecrets) {
      secretsBuffer.push(line);
      return;
    }

    // DC Ability Check block
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
      const innerHtml = checkBuffer.map((l) => `<p class="dd-check-line my-1 p-2 rounded-xl transition-all leading-relaxed">${formatInline(l)}</p>`).join('');
      htmlParts.push(
        `<div class="dd-check my-3.5 p-3.5 rounded-xl bg-[#121824]/95 border border-amber-500/50 shadow-xl text-slate-200 text-xs space-y-2 select-text" data-dd-block="check" data-skill="${checkMeta.skill}" data-dc="${checkMeta.dc}"><div class="flex items-center justify-between pb-2 border-b border-surface-border font-serif flex-wrap gap-2" contenteditable="false"><div class="flex items-center space-x-2"><span class="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-xs border border-amber-500/40">DC ${checkMeta.dc}</span><span class="font-bold text-amber-400 text-xs">${checkMeta.skill}</span></div><div class="flex items-center space-x-2"><span class="dd-check-result hidden px-2 py-0.5 rounded-lg text-xs font-mono font-bold border"></span><button type="button" class="dd-check-roll-btn px-2.5 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center space-x-1 shadow-md transition-all active:scale-95 cursor-pointer"><span>🎲 Roll d20</span></button></div></div><div class="dd-block-content leading-relaxed space-y-1">${innerHtml || '<p class="dd-check-line my-1 p-2 rounded-xl"><br></p>'}</div></div>`
      );
      return;
    }
    if (inCheck) {
      checkBuffer.push(line);
      return;
    }

    // Formatted Image block
    if (trimmed.toLowerCase().startsWith(':::image')) {
      const srcMatch = line.match(/src=["']([^"']+)["']/i);
      const altMatch = line.match(/alt=["']([^"']+)["']/i);
      const alignMatch = line.match(/align=["']([^"']+)["']/i);
      const sizeMatch = line.match(/size=["']([^"']+)["']/i);
      const captionMatch = line.match(/caption=["']([^"']+)["']/i);

      const src = srcMatch ? srcMatch[1] : '';
      const alt = altMatch ? altMatch[1] : 'Artwork';
      const align = alignMatch ? alignMatch[1].toLowerCase() : 'left';
      const size = sizeMatch ? sizeMatch[1] : '50%';
      const caption = captionMatch ? captionMatch[1] : '';

      if (src) {
        htmlParts.push(
          `<div class="dd-image-wrapper my-3 text-center" data-dd-block="image" data-src="${src}" data-alt="${alt}" data-align="${align}" data-size="${size}" data-caption="${caption}" contenteditable="false"><div class="inline-block max-w-full rounded-xl overflow-hidden border-2 border-amber-500/40 bg-black/40 shadow-xl"><img src="${src}" alt="${alt}" class="max-h-72 object-contain" />${caption ? `<div class="p-1.5 text-[11px] text-slate-400 italic bg-surface-100/90">${caption}</div>` : ''}</div></div>`
        );
      }
      return;
    }

    // Standard markdown images: ![alt](url)
    const mdImgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
    if (mdImgMatch) {
      const alt = mdImgMatch[1] || 'Image';
      const src = mdImgMatch[2];
      htmlParts.push(
        `<div class="dd-image-wrapper my-3 text-center" data-dd-block="md-image" data-src="${src}" data-alt="${alt}" contenteditable="false"><div class="inline-block max-w-full rounded-xl overflow-hidden border border-surface-border bg-surface-100 shadow-md"><img src="${src}" alt="${alt}" class="max-h-72 object-contain" />${alt ? `<div class="p-1.5 text-[11px] text-slate-400 italic">${alt}</div>` : ''}</div></div>`
      );
      return;
    }

    // Callout Alerts (> [!WARNING], > [!TIP], > [!NOTE])
    if (trimmed.startsWith('> [!WARNING]') || trimmed.startsWith('> [!CAUTION]')) {
      const content = trimmed.replace(/^>\s*\[!(WARNING|CAUTION)\]\s*/i, '');
      htmlParts.push(
        `<div class="dd-alert my-3 p-3 rounded-xl bg-amber-950/40 border border-amber-500/50 text-amber-200 text-xs flex items-start gap-2" data-dd-block="alert-warning"><span contenteditable="false">⚠️</span><div class="dd-block-content flex-1">${formatInline(content || 'Warning')}</div></div>`
      );
      return;
    }
    if (trimmed.startsWith('> [!TIP]') || trimmed.startsWith('> [!NOTE]')) {
      const content = trimmed.replace(/^>\s*\[!(TIP|NOTE)\]\s*/i, '');
      htmlParts.push(
        `<div class="dd-alert my-3 p-3 rounded-xl bg-blue-950/40 border border-blue-500/50 text-blue-200 text-xs flex items-start gap-2" data-dd-block="alert-tip"><span contenteditable="false">💡</span><div class="dd-block-content flex-1">${formatInline(content || 'Tip')}</div></div>`
      );
      return;
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      htmlParts.push(
        `<blockquote class="my-2 pl-3.5 border-l-2 border-amber-500 text-slate-300 italic text-xs leading-relaxed">${formatInline(trimmed.replace(/^>\s*/, ''))}</blockquote>`
      );
      return;
    }

    // Horizontal rule
    if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
      htmlParts.push('<hr class="my-4 border-surface-border" />');
      return;
    }

    // Markdown Tables
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      inTable = true;
      tableBuffer.push(trimmed);
      return;
    } else if (inTable) {
      flushTable();
    }

    // Headings
    if (trimmed.startsWith('# ')) {
      htmlParts.push(`<h1 class="font-serif font-bold text-amber-500 text-2xl mt-5 mb-2">${formatInline(trimmed.replace(/^#\s+/, ''))}</h1>`);
      return;
    }
    if (trimmed.startsWith('## ')) {
      htmlParts.push(`<h2 class="font-serif font-bold text-slate-100 text-lg mt-4 mb-1.5 border-b border-surface-border pb-1">${formatInline(trimmed.replace(/^##\s+/, ''))}</h2>`);
      return;
    }
    if (trimmed.startsWith('### ')) {
      htmlParts.push(`<h3 class="font-serif font-bold text-amber-400 text-sm mt-3 mb-1">${formatInline(trimmed.replace(/^###\s+/, ''))}</h3>`);
      return;
    }

    // Bullet lists
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      htmlParts.push(`<ul class="my-1 pl-5 list-disc text-slate-200 text-xs"><li>${formatInline(trimmed.replace(/^[-*]\s+/, ''))}</li></ul>`);
      return;
    }

    // Numbered lists
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      htmlParts.push(`<ol class="my-1 pl-5 list-decimal text-slate-200 text-xs"><li>${formatInline(numMatch[2])}</li></ol>`);
      return;
    }

    // Empty line
    if (!trimmed) {
      htmlParts.push('<p><br></p>');
      return;
    }

    // Standard paragraph
    htmlParts.push(`<p class="text-slate-200 text-xs leading-relaxed my-1.5">${formatInline(line)}</p>`);
  });

  if (inTable) flushTable();
  if (inColumns) flushColumns();

  return htmlParts.join('\n');
}

/**
 * Converts DOM node from ContentEditable container back to standard Markdown
 */
export function htmlToMarkdown(html: string): string {
  if (!html) return '';

  const parser = new DOMParser();
  const doc = parser.parseFromString(`<body>${html}</body>`, 'text/html');
  const body = doc.body;

  const serializeNode = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent || '';
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return '';
    const el = node as HTMLElement;

    // Handle Custom DD Blocks
    const ddBlock = el.getAttribute('data-dd-block');
    if (ddBlock === 'read-aloud') {
      const contentEl = el.querySelector('.dd-block-content') || el;
      const content = Array.from(contentEl.childNodes).map(serializeNode).join('').trim();
      return `\n:::read-aloud\n${content}\n:::\n`;
    }
    if (ddBlock === 'dm-info') {
      const contentEl = el.querySelector('.dd-block-content') || el;
      const content = Array.from(contentEl.childNodes).map(serializeNode).join('').trim();
      return `\n:::dm-info\n${content}\n:::\n`;
    }
    if (ddBlock === 'secrets') {
      const contentEl = el.querySelector('.dd-block-content') || el;
      const content = Array.from(contentEl.childNodes).map(serializeNode).join('').trim();
      return `\n:::secrets\n${content}\n:::\n`;
    }
    if (ddBlock === 'check') {
      const skill = el.getAttribute('data-skill') || 'Wisdom (Perception)';
      const dc = el.getAttribute('data-dc') || '15';
      const contentEl = el.querySelector('.dd-block-content') || el;
      const content = Array.from(contentEl.childNodes).map(serializeNode).join('').trim();
      return `\n:::check skill="${skill}" dc="${dc}"\n${content}\n:::\n`;
    }
    if (ddBlock === 'image') {
      const src = el.getAttribute('data-src') || '';
      const alt = el.getAttribute('data-alt') || 'Artwork';
      const align = el.getAttribute('data-align') || 'left';
      const size = el.getAttribute('data-size') || '50%';
      const caption = el.getAttribute('data-caption') || '';
      return `\n:::image src="${src}" align="${align}" size="${size}" alt="${alt}" caption="${caption}"\n:::\n`;
    }
    if (ddBlock === 'md-image') {
      const src = el.getAttribute('data-src') || '';
      const alt = el.getAttribute('data-alt') || 'Image';
      return `\n![${alt}](${src})\n`;
    }
    if (ddBlock === 'alert-warning') {
      const contentEl = el.querySelector('.dd-block-content') || el;
      const content = Array.from(contentEl.childNodes).map(serializeNode).join('').trim();
      return `\n> [!WARNING]\n> ${content}\n`;
    }
    if (ddBlock === 'alert-tip') {
      const contentEl = el.querySelector('.dd-block-content') || el;
      const content = Array.from(contentEl.childNodes).map(serializeNode).join('').trim();
      return `\n> [!TIP]\n> ${content}\n`;
    }

    // Entity Badge: @[label](type:id)
    if (el.classList.contains('dd-entity-badge')) {
      const type = el.getAttribute('data-type') || 'note';
      const id = el.getAttribute('data-id') || '';
      const label = el.textContent?.replace(/^[🔮🗺️]\s*/, '').trim() || id;
      return `@[${label}](${type}:${id})`;
    }

    // Standard HTML tags
    const tag = el.tagName.toLowerCase();
    const children = Array.from(el.childNodes).map(serializeNode).join('');

    // Check for inline style formatting on span, font, or generic containers
    if (tag === 'span' || tag === 'font') {
      let styledChildren = children;
      const styleAttr = el.getAttribute('style') || '';
      const textDecoration = el.style?.textDecoration || '';
      const fontWeight = el.style?.fontWeight || '';
      const fontStyle = el.style?.fontStyle || '';

      if (textDecoration.includes('underline') || styleAttr.includes('underline')) {
        styledChildren = `<u>${styledChildren}</u>`;
      }
      if (textDecoration.includes('line-through') || styleAttr.includes('line-through')) {
        styledChildren = `~~${styledChildren}~~`;
      }
      if (fontWeight === 'bold' || parseInt(fontWeight, 10) >= 600 || styleAttr.includes('bold')) {
        styledChildren = `**${styledChildren}**`;
      }
      if (fontStyle === 'italic' || styleAttr.includes('italic')) {
        styledChildren = `*${styledChildren}*`;
      }
      return styledChildren;
    }

    switch (tag) {
      case 'h1':
        return `\n# ${children.replace(/\n+/g, ' ').trim()}\n\n`;
      case 'h2':
        return `\n## ${children.replace(/\n+/g, ' ').trim()}\n\n`;
      case 'h3':
        return `\n### ${children.replace(/\n+/g, ' ').trim()}\n\n`;
      case 'strong':
      case 'b':
        return `**${children}**`;
      case 'em':
      case 'i':
        return `*${children}*`;
      case 'u':
      case 'ins':
        return `<u>${children}</u>`;
      case 'del':
      case 's':
      case 'strike':
        return `~~${children}~~`;
      case 'code':
        return `\`${children}\``;
      case 'blockquote':
        return `\n> ${children.trim()}\n\n`;
      case 'hr':
        return `\n---\n\n`;
      case 'ul':
        return `\n${children}\n`;
      case 'ol':
        return `\n${children}\n`;
      case 'li':
        return `- ${children.trim()}\n`;
      case 'p':
        return `${children}\n\n`;
      case 'br':
        return `\n`;
      case 'div':
        return `${children}\n`;
      case 'table': {
        const rows = Array.from(el.querySelectorAll('tr'));
        if (rows.length === 0) return '';
        let tableMd = '\n';
        rows.forEach((row, rIdx) => {
          const cells = Array.from(row.querySelectorAll('th, td'));
          const cellTexts = cells.map((c) => Array.from(c.childNodes).map(serializeNode).join('').trim() || ' ');
          tableMd += `| ${cellTexts.join(' | ')} |\n`;
          if (rIdx === 0) {
            tableMd += `| ${cellTexts.map(() => '---').join(' | ')} |\n`;
          }
        });
        return tableMd + '\n';
      }
      default:
        return children;
    }
  };

  const rawMd = Array.from(body.childNodes).map(serializeNode).join('');
  return rawMd.replace(/\n{3,}/g, '\n\n').trim();
}
