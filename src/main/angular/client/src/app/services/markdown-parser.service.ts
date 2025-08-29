import { Injectable } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

/**
 *
 * Supports (CommonMark + GFM subset):
 *  - ATX & Setext headings with slugified ids
 *  - Paragraphs & line breaks (GFM soft break option)
 *  - Emphasis/strong, strike, code spans
 *  - Links, images, autolinks (http/https/mailto/tel)
 *  - Blockquotes (nested)
 *  - Lists (ordered/unordered), nested; task list checkboxes [ ] / [x]
 *  - Fenced code blocks ``` / ~~~ with language class
 *  - Thematic breaks (hr)
 *  - Tables with alignment
 *  - Smart typography option (quotes, dashes, ellipsis)
 *  - Basic sanitization of generated HTML (protocol + attribute allowlists)
 *
 */

export interface MarkdownOptions {
  gfm: boolean;
  tables: boolean;
  breaks: boolean;
  smartLists: boolean;
  smartypants: boolean;
  headerIds: boolean;
  headerPrefix: string;
  sanitize: boolean;
  xhtml: boolean;
  highlight?: (code: string, lang?: string) => string;
  rawHtml?: boolean;
}


interface TokenBase { type: string; raw: string; }
interface HeadingToken extends TokenBase { depth: number; text: string; id?: string; }
interface ParagraphToken extends TokenBase { text: string; }
interface HrToken extends TokenBase {}
interface CodeToken extends TokenBase { code: string; lang?: string; }
interface BlockquoteToken extends TokenBase { tokens: Token[]; }
interface ListToken extends TokenBase { ordered: boolean; start: number; items: ListItemToken[]; tight: boolean; }
interface ListItemToken extends TokenBase { task?: boolean; checked?: boolean; tokens: Token[]; }
interface TableToken extends TokenBase { header: string[]; align: ("left"|"center"|"right"|null)[]; rows: string[][]; }
interface HtmlBlockToken extends TokenBase { html: string; block: boolean; }
type Token =
  | HeadingToken | ParagraphToken | HrToken | CodeToken | BlockquoteToken
  | ListToken | ListItemToken | TableToken | HtmlBlockToken;

@Injectable({ providedIn: 'root' })
export class MarkdownParserService {
  private readonly defaults: MarkdownOptions = {
    gfm: true,
    tables: true,
    breaks: false,
    smartLists: true,
    smartypants: false,
    headerIds: true,
    headerPrefix: 'md-'
    ,sanitize: true,
    xhtml: false,
    rawHtml: false
  };

  constructor(private readonly sanitizer: DomSanitizer) {}

  /** Render Markdown to (optionally Safe) HTML. */
  render(markdown: string, opts: Partial<MarkdownOptions> = {}): string | SafeHtml {
    const options = { ...this.defaults, ...opts } as MarkdownOptions;
    const src = (markdown ?? '').replace(/\r\n?|\u2028|\u2029/g, '\n');

    const tokens = this.lex(src, options);
    let html = this.parse(tokens, options);

    if (options.smartypants) html = this.smartypants(html);
    if (options.sanitize) html = this.sanitize(html);

    return options.sanitize ? html : this.sanitizer.bypassSecurityTrustHtml(html);
  }

  parseMarkdown(markdown: string, opts: Partial<MarkdownOptions> = {}): string {
    const result = this.render(markdown, { ...opts, sanitize: true });
    return typeof result === 'string' ? result : '' + result;
  }

  private lex(src: string, options: MarkdownOptions): Token[] {
    const tokens: Token[] = [];
    let lines = src.split('\n');
    const outdent = (s: string, n: number) =>
      s.split('\n').map(line => line.replace(new RegExp(`^ {0,${n}}`), '')).join('\n');
    const eat = (n: number) => { lines.splice(0, n); };

    const isBlank = (s: string) => /^\s*$/.test(s);

    while (lines.length) {
      if (isBlank(lines[0])) { tokens.push({ type: 'space', raw: lines[0] } as any); eat(1); continue; }
      if (options.rawHtml) {
        if (/^<!--/.test(lines[0])) {
          let i = 0;
          while (i < lines.length && !/-->/.test(lines[i])) i++;
          const raw = lines.slice(0, Math.min(i + 1, lines.length)).join('\n');
          tokens.push({type: 'html', raw, html: raw, block: true} as HtmlBlockToken);
          eat(Math.min(i + 1, lines.length));
          continue;
        }

        const open = lines[0].match(/^<([A-Za-z][\w:-]*)(\s[^>]*)?>\s*$/);
        if (open) {
          const tag = open[1].toLowerCase();
          const voidTags = new Set(['br', 'hr', 'img', 'input', 'source', 'track', 'wbr', 'meta', 'link', 'area', 'col', 'embed', 'param']);
          if (voidTags.has(tag) || /\/>\s*$/.test(lines[0])) {
            const raw = lines[0];
            tokens.push({type: 'html', raw, html: raw, block: true} as HtmlBlockToken);
            eat(1);
            continue;
          }
          let i = 1;
          const closeRe = new RegExp(`^</${tag}>\\s*$`, 'i');
          while (i < lines.length && !closeRe.test(lines[i])) i++;
          const raw = lines.slice(0, Math.min(i + 1, lines.length)).join('\n');
          tokens.push({type: 'html', raw, html: raw, block: true} as HtmlBlockToken);
          eat(Math.min(i + 1, lines.length));
          continue;
        }
      }
      let m = lines[0].match(/^\s*(```|~~~)\s*([^`]*)\s*$/);
      if (m) {
        const fence = m[1];
        const lang = (m[2] || '').trim() || undefined;
        let i = 1;
        while (i < lines.length && !new RegExp(`^\s*${fence}\s*$`).test(lines[i])) i++;
        const body = lines.slice(1, i).join('\n');
        const raw = lines.slice(0, i + 1).join('\n');
        tokens.push({ type: 'code', raw, code: body.replace(/\n$/, ''), lang } as CodeToken);
        eat(i + 1);
        continue;
      }

      if (lines.length >= 2 && /^(=+|-+)\s*$/.test(lines[1])) {
        const depth = /^=+\s*$/.test(lines[1]) ? 1 : 2;
        const { text, id } = this.extractHeadingId(lines[0]);
        const raw = lines[0] + '\n' + lines[1];
        tokens.push({ type: 'heading', raw, depth, text, /* @ts-ignore */ id } as HeadingToken);
        eat(2);
        continue;
      }


      m = lines[0].match(/^(#{1,6})\s+(.+?)\s*#*\s*$/);
      if (m) {
        const depth = m[1].length;
        const { text, id } = this.extractHeadingId(m[2]);
        tokens.push({ type: 'heading', raw: lines[0], depth, text, /* @ts-ignore */ id } as HeadingToken);
        eat(1);
        continue;
      }

      if (/^\s*([-*_])(?:\s*\1){2,}\s*$/.test(lines[0])) {
        tokens.push({ type: 'hr', raw: lines[0] } as HrToken);
        eat(1);
        continue;
      }


      if (/^\s*>\s?/.test(lines[0])) {
        let i = 0; const chunk: string[] = [];
        while (i < lines.length && /^\s*>\s?/.test(lines[i])) { chunk.push(lines[i].replace(/^\s*>\s?/, '')); i++; }
        const inner = chunk.join('\n');
        const innerTokens = this.lex(inner, options);
        tokens.push({ type: 'blockquote', raw: chunk.join('\n'), tokens: innerTokens } as BlockquoteToken);
        eat(i);
        continue;
      }

      m = lines[0].match(/^\s*([*+-]|\d+\.)\s+/);
      if (m) {
        const bullet = m[1];
        const ordered = /\d+\./.test(bullet);
        const start = ordered ? parseInt(bullet, 10) : 1;

        const items: ListItemToken[] = [];
        let i = 0; const buf: string[] = [];
        const getIndent = (s: string) => (s.match(/^\s*/)?.[0].length ?? 0);
        const baseIndent = getIndent(lines[0]);

        const flush = () => {
          if (!buf.length) return;

          const rawItem = buf.join('\n');

          let task = false, checked = false;
          const firstLine = rawItem.replace(/\n[\s\S]*$/, '');
          const taskMatch = firstLine.match(/^(?:\s*[*+-]|\s*\d+\.)\s+\[( |x|X)\]\s+/);
          let body = rawItem;

          if (taskMatch) {
            task = true; checked = /x/i.test(taskMatch[1]);
            body = body.replace(/^(\s*(?:[*+-]|\d+\.)\s+)\[(?: |x|X)\]\s+/, '$1');
          }

          body = body.replace(/^(\s*)(?:[*+-]|\d+\.)\s+/, '$1');

          const firstIndent = (firstLine.match(/^\s*/)?.[0].length ?? 0);
          body = outdent(body, firstIndent + 2);

          const tokens = this.lex(body, options);
          items.push({ type: 'list_item', raw: rawItem, task, checked, tokens } as ListItemToken);
          buf.length = 0;
        };

        const isBlockStart = (s: string): boolean => (
          /^(#{1,6})\s+/.test(s) ||
          /^\s*([-*_])(?:\s*\1){2,}\s*$/.test(s) ||
          /^\s*>\s?/.test(s) ||
          /^\s*(```|~~~)\s*[^`]*$/.test(s) ||
          (options.gfm && options.tables && /\|/.test(s))
        );

        while (i < lines.length) {
          const s = lines[i];

          if (/^\s*([*+-]|\d+\.)\s+/.test(s) && getIndent(s) <= baseIndent) {
            flush();
            buf.push(s);
          }
          else if (buf.length && !isBlank(s) && getIndent(s) <= baseIndent &&
            !/^\s*([*+-]|\d+\.)\s+/.test(s)) {
            break;
          }
          else if (buf.length && isBlank(s)) {
            buf.push(s);
          }
          else if (buf.length && getIndent(s) <= baseIndent && isBlockStart(s)) {
            break;
          }
          else if (buf.length) {
            buf.push(s);
          }
          else break;

          i++;
        }
        flush();
        const raw = lines.slice(0, i).join('\n');
        const tight = !raw.match(/\n\s*\n/);
        tokens.push({ type: 'list', raw, ordered, start, items, tight } as ListToken);
        eat(i);
        continue;
      }

      if (options.gfm && options.tables && lines.length >= 2 && /\|/.test(lines[0]) && /^(\s*\|)?\s*(:?-{3,}:?)(\s*\|\s*:?-{3,}:?)*\s*(\|\s*)?$/.test(lines[1])) {
        const headerLine = this.splitTableRow(lines[0]);
        const alignLine = this.splitTableRow(lines[1]);
        const align: ("left"|"center"|"right"|null)[] = alignLine.map(cell => {
          const s = cell.trim();
          const left = s.startsWith(':');
          const right = s.endsWith(':');
          if (left && right) return 'center';
          if (right) return 'right';
          if (left) return 'left';
          return null;
        });
        const header = headerLine.map(s => s.trim());
        let i = 2; const rows: string[][] = [];
        while (i < lines.length && /\|/.test(lines[i]) && !/^\s*$/.test(lines[i])) {
          rows.push(this.splitTableRow(lines[i]).map(s => s.trim()));
          i++;
        }
        const raw = lines.slice(0, i).join('\n');
        tokens.push({ type: 'table', raw, header, align, rows } as TableToken);
        eat(i);
        continue;
      }

      let i = 0; const buf: string[] = [];
      while (i < lines.length && !/^\s*$/.test(lines[i]) &&
        !/^(#{1,6})\s+/.test(lines[i]) &&
        !/^\s*([-*_])(?:\s*\1){2,}\s*$/.test(lines[i]) &&
        !/^\s*>\s?/.test(lines[i]) &&
        !/^\s*([*+-]|\d+\.)\s+/.test(lines[i]) &&
        !(options.gfm && options.tables && /\|/.test(lines[i]) && i+1 < lines.length && /^(\s*\|)?\s*(:?-{3,}:?)(\s*\|\s*:?-{3,}:?)*\s*(\|\s*)?$/.test(lines[i+1])) &&
        !/^\s*(```|~~~)\s*[^`]*$/.test(lines[i])
        ) { buf.push(lines[i]); i++; }
      const text = buf.join('\n');
      if (text.trim().length) {
        tokens.push({ type: 'paragraph', raw: text, text } as ParagraphToken);
        eat(i);
        continue;
      }

      tokens.push({ type: 'paragraph', raw: lines[0], text: lines[0] } as ParagraphToken);
      eat(1);
    }

    return tokens.filter(t => t.type !== 'space');
  }

  private splitTableRow(row: string): string[] {
    const out: string[] = [];
    let cur = ''; let inCode = false; let backticks = 0;
    for (let i = 0; i < row.length; i++) {
      const ch = row[i];
      if (ch === '`') { backticks++; inCode = backticks % 2 === 1; cur += ch; continue; }
      if (ch === '|' && !inCode) { out.push(cur); cur = ''; continue; }
      if (ch === '\\' && i + 1 < row.length) { cur += row[i+1]; i++; continue; }
      cur += ch;
    }
    out.push(cur);
    if (row.trim().startsWith('|')) out.shift();
    if (row.trim().endsWith('|')) out.pop();
    return out;
  }

  private parse(tokens: Token[], options: MarkdownOptions): string {
    const out: string[] = [];

    const escapeHtml = (s: string) => s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\"/g, '&quot;')
      .replace(/'/g, '&#39;');

    const slugify = (str: string) =>
      (options.headerPrefix + str.toLowerCase()
          .trim()
          .replace(/<[^>]+>/g, '')
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
      );

    const br = options.xhtml ? '<br/>' : '<br>';
    const hr = options.xhtml ? '<hr/>' : '<hr>';

      const renderInline = (text: string): string => {
        if (!text) return '';

        const transformPlain = (chunk: string): string => {
          chunk = chunk.replace(/\\([\\`*_{}\[\]()#+\-.!>|~])/g, (_m, ch: string) => {
            const map: Record<string, string> = {
              '\\': '&#92;',  '`': '&#96;',  '*': '&#42;',  '_': '&#95;',
              '{': '&#123;',  '}': '&#125;','[': '&#91;',  ']': '&#93;',
              '(': '&#40;',   ')': '&#41;',  '#': '&#35;',  '+': '&#43;',
              '-': '&#45;',   '.': '&#46;',  '!': '&#33;',  '>': '&gt;',
              '|': '&#124;',  '~': '&#126;'
            };
            return map[ch] || ch;
          });

          chunk = chunk.replace(/(`+)([^`\n]+?)\1/g, (_m, _bt: string, code: string) => `<code>${escapeHtml(code)}</code>`);

          chunk = chunk
            .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
            .replace(/__([^_]+)__/g, '<strong>$1</strong>')
            .replace(/\*([^*]+)\*/g, '<em>$1</em>')
            .replace(/_([^_]+)_/g, '<em>$1</em>')
            .replace(/~~([^~]+)~~/g, '<del>$1</del>');

          chunk = chunk.replace(/!\[([^\]]*)\]\(([^\s)]+)(?:\s+"([^"]*)")?\)/g,
            (_m, alt: string, src: string, title?: string) => {
              const safeSrc = this.safeUrl(src);
              if (!safeSrc) return '';
              const titleAttr = title ? ` title="${escapeHtml(title)}"` : '';
              return `<img src="${safeSrc}" alt="${escapeHtml(alt)}"${titleAttr}>`;
            });

          // links
          chunk = chunk.replace(/\[([^\]]+)\]\(([^\s)]+)(?:\s+"([^"]*)")?\)/g,
            (_m, label: string, href: string, title?: string) => {
              const safeHref = this.safeUrl(href);
              if (!safeHref) return escapeHtml(label);
              const titleAttr = title ? ` title="${escapeHtml(title)}"` : '';
              if (safeHref.startsWith('#')) {
                return `<a href="${safeHref}"${titleAttr}>${escapeHtml(label)}</a>`;
              } else if (/^https?:/i.test(safeHref)) {
                return `<a href="${safeHref}" rel="nofollow ugc" target="_blank"${titleAttr}>${escapeHtml(label)}</a>`;
              } else {
                return `<a href="${safeHref}"${titleAttr}>${escapeHtml(label)}</a>`;
              }
            });

          // autolinks
          chunk = chunk.replace(/<((?:https?:\/\/|mailto:|tel:)[^>]+)>/gi, (_m, url: string) => {
            const safeUrl = this.safeUrl(url);
            if (!safeUrl) return escapeHtml(url);
            const isExternal = /^https?:/i.test(safeUrl);
            const target = isExternal ? ' target="_blank" rel="nofollow ugc"' : '';
            return `<a href="${safeUrl}"${target}>${escapeHtml(url)}</a>`;
          });

          // bare URLs
          chunk = chunk.replace(/(^|\s)(https?:\/\/[\w\-._~:\/?#\[\]@!$&'()*+,;=%]+)(?=$|\s)/gi,
            (_m, pre: string, url: string) => {
              const safeUrl = this.safeUrl(url);
              if (!safeUrl) return pre + escapeHtml(url);
              return `${pre}<a href="${safeUrl}" rel="nofollow ugc" target="_blank">${escapeHtml(url)}</a>`;
            });

          // line breaks
          if (options.breaks) chunk = chunk.replace(/\n/g, br);
          else chunk = chunk.replace(/ {2,}\n/g, br);

          return chunk;
        };

        if (!options.rawHtml) return transformPlain(text);

        const parts = text.split(/(<!--[\s\S]*?-->|<\/?[A-Za-z][^>]*>)/g);

        let preDepth = 0;
        let codeDepth = 0;
        const out: string[] = [];

        for (const part of parts) {
          if (!part) continue;

          if (part.startsWith('<')) {
            if (/^<\s*pre\b/i.test(part)) preDepth++;
            else if (/^<\s*\/\s*pre\b/i.test(part)) preDepth = Math.max(0, preDepth - 1);
            else if (/^<\s*code\b/i.test(part)) codeDepth++;
            else if (/^<\s*\/\s*code\b/i.test(part)) codeDepth = Math.max(0, codeDepth - 1);

            out.push(part);
          } else {
            out.push(preDepth || codeDepth ? part : transformPlain(part));
          }
        }

        return out.join('');
      };

    for (const t of tokens) {
      switch (t.type) {
        case 'heading': {
          const h = t as HeadingToken;

          const baseId = h.id ?? this.slugifyPlain(h.text, '');
          const finalId = options.headerPrefix + baseId;
          const idAttr = ` id="${finalId}"`;

          out.push(`<h${h.depth}${idAttr}>${renderInline(h.text)}</h${h.depth}>`);
          break;
        }

        case 'html': {
          const h = t as HtmlBlockToken;
          out.push(h.html);
          break;
        }

        case 'paragraph': {
          const p = t as ParagraphToken;
          out.push(`<p>${renderInline(p.text)}</p>`);
          break;
        }
        case 'hr': {
          out.push(hr);
          break;
        }
        case 'code': {
          const c = t as CodeToken;
          const langClass = c.lang ? ` class="language-${this.escapeClass(c.lang)}"` : '';
          let code = escapeHtml(c.code);
          if (c.lang && typeof (options.highlight) === 'function') {
            try { code = options.highlight(c.code, c.lang); } catch { /* noop */ }
          }
          out.push(`<pre><code${langClass}>${code}</code></pre>`);
          break;
        }
        case 'blockquote': {
          const b = t as BlockquoteToken;
          out.push(`<blockquote>${this.parse(b.tokens, options)}</blockquote>`);
          break;
        }
        case 'list': {
          const l = t as ListToken;
          const tag = l.ordered ? 'ol' : 'ul';
          const startAttr = l.ordered && l.start !== 1 ? ` start="${l.start}"` : '';
          const li: string[] = [];
          for (const it of l.items) {
            const inner = this.parse(it.tokens, options);
            const content = l.tight ? inner.replace(/^<p>|<\/p>$/g, '') : inner;
            let marker = '';
            if (it.task) {
              marker = `<input type="checkbox" disabled${it.checked ? ' checked' : ''}>`;
            }
            li.push(`<li>${marker}${content}</li>`);
          }
          out.push(`<${tag}${startAttr}>${li.join('')}</${tag}>`);
          break;
        }
        case 'table': {
          const tb = t as TableToken;
          const head = `<thead><tr>${tb.header.map((h, i) => `<th${this.alignAttr(tb.align[i])}>${renderInline(h)}</th>`).join('')}</tr></thead>`;
          const bodyRows = tb.rows.map(r => `<tr>${r.map((c, i) => `<td${this.alignAttr(tb.align[i])}>${renderInline(c)}</td>`).join('')}</tr>`).join('');
          const body = `<tbody>${bodyRows}</tbody>`;
          out.push(`<table>${head}${body}</table>`);
          break;
        }
        default:
          break;
      }
    }

    return out.join('');
  }

  private alignAttr(a: "left"|"center"|"right"|null): string { return a ? ` align="${a}"` : ''; }
  private escapeClass(s: string): string { return s.replace(/[^a-zA-Z0-9_-]/g, ''); }


  private smartypants(html: string): string {
    return html
      .split(/(<[^>]+>)/g)
      .map(part => {
        if (part.startsWith('<')) return part;
        return part
          .replace(/(^|\W)"(\S)/g, '$1“$2')
          .replace(/(\S)"(\W|$)/g, '$1”$2')
          .replace(/(^|\W)'(\S)/g, '$1‘$2')
          .replace(/(\S)'(\W|$)/g, '$1’$2')
          .replace(/\.{3}/g, '…')
          .replace(/--/g, '—');
      })
      .join('');
  }




  private sanitize(html: string): string {
      const allowedTags = new Set([
        'h1','h2','h3','h4','h5','h6','p','br','hr','em','strong','del','code','pre',
        'a','img','ul','ol','li','blockquote','table','thead','tbody','tr','th','td',
        'input','details','summary','figure','figcaption','span','div','kbd','mark'
      ]);

      const allowedAttrs: Record<string, Set<string>> = {
        'a': new Set(['href','title','rel','target','class','id']),
        'img': new Set(['src','alt','title','class','id']),
        'th': new Set(['align','colspan','rowspan','class','id']),
        'td': new Set(['align','colspan','rowspan','class','id']),
        'ol': new Set(['start','class','id']),
        'pre': new Set(['class','id']),
        'code': new Set(['class','id']),
        'details': new Set(['open','class','id']),
        'summary': new Set(['class','id']),
        'span': new Set(['class','id']),
        'div': new Set(['class','id']),
        'input': new Set(['type','checked','disabled','class','id']),
      };



      const doc = this.stringToDoc(`<div>${html}</div>`);

    const walk: any = (node: Element | ChildNode) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as Element;
        const tag = el.tagName.toLowerCase();
        if (!allowedTags.has(tag)) {
          el.replaceWith(...Array.from(el.childNodes));
          return;
        }

        const baseKeep = new Set<string>(['id']);
        const keep = new Set<string>([...baseKeep, ...Array.from(allowedAttrs[tag] || new Set<string>())]);
        const toRemove: string[] = [];

        for (const attr of Array.from(el.attributes)) {
          const name = attr.name.toLowerCase();
          if (!keep.has(name)) { toRemove.push(attr.name); continue; }

          if ((tag === 'a' && name === 'href') || (tag === 'img' && name === 'src')) {
            const safe = this.safeUrl(attr.value);
            if (!safe) { toRemove.push(attr.name); continue; }
            el.setAttribute(name, safe);
          }

          if (/^on/i.test(name)) toRemove.push(attr.name);
        }


        toRemove.forEach(n => el.removeAttribute(n));
      }

      for (const child of Array.from((node as any).childNodes || [])) {
        walk(child);
      }
    };

    for (const child of Array.from(doc.body.firstElementChild?.children || [])) {
      walk(child);
    }

    return (doc.body.firstElementChild?.innerHTML) || '';
  }

  private stringToDoc(html: string): Document {
    const parser = new DOMParser();
    return parser.parseFromString(html, 'text/html');
  }

  private extractHeadingId(text: string): { text: string; id?: string } {
    const m = text.match(/\s*\{#([A-Za-z0-9._:-]+)\}\s*$/);
    if (!m) return { text: text.trim() };
    return { text: text.replace(/\s*\{#[A-Za-z0-9._:-]+\}\s*$/, '').trim(), id: m[1] };
  }



  private slugifyPlain(str: string, prefix: string): string {
    return (prefix + str)
      .toLowerCase()
      .trim()
      .replace(/<[^>]+>/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }



  private safeUrl(url: string): string | null {
    const trimmed = (url || '').trim();

    if (!trimmed) return null;

    if (trimmed.toLowerCase().startsWith('javascript:') ||
      trimmed.toLowerCase().startsWith('data:') ||
      trimmed.toLowerCase().startsWith('vbscript:')) {
      return null;
    }

    if (trimmed.startsWith('#')) {
      return trimmed;
    }

    if (/^https?:/i.test(trimmed)) {
      return trimmed;
    }

    if (/^(mailto:|tel:)/i.test(trimmed)) {
      return trimmed;
    }

    if (/^\//.test(trimmed)) {
      return trimmed;
    }

    if (/^\/[a-z0-9._\-]+(\.md)?$/i.test(trimmed)) {
      return trimmed;
    }
    return null;
  }




}
