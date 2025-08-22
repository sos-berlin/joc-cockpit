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
}


interface TokenBase { type: string; raw: string; }
interface HeadingToken extends TokenBase { depth: number; text: string; }
interface ParagraphToken extends TokenBase { text: string; }
interface HrToken extends TokenBase {}
interface CodeToken extends TokenBase { code: string; lang?: string; }
interface BlockquoteToken extends TokenBase { tokens: Token[]; }
interface ListToken extends TokenBase { ordered: boolean; start: number; items: ListItemToken[]; tight: boolean; }
interface ListItemToken extends TokenBase { task?: boolean; checked?: boolean; tokens: Token[]; }
interface TableToken extends TokenBase { header: string[]; align: ("left"|"center"|"right"|null)[]; rows: string[][]; }

type Token = HeadingToken | ParagraphToken | HrToken | CodeToken | BlockquoteToken | ListToken | ListItemToken | TableToken;

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

  /** Convenience alias to mimic `marked(md)` like API */
  parseMarkdown(markdown: string, opts: Partial<MarkdownOptions> = {}): string {
    const result = this.render(markdown, { ...opts, sanitize: true });
    return typeof result === 'string' ? result : '' + result;
  }

  // =====================
  // Lexer (block level)
  // =====================
  private lex(src: string, options: MarkdownOptions): Token[] {
    const tokens: Token[] = [];
    let lines = src.split('\n');

    const eat = (n: number) => { lines.splice(0, n); };

    const isBlank = (s: string) => /^\s*$/.test(s);

    while (lines.length) {
      if (isBlank(lines[0])) { tokens.push({ type: 'space', raw: lines[0] } as any); eat(1); continue; }

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
        const text = lines[0].trim();
        const raw = lines[0] + '\n' + lines[1];
        tokens.push({ type: 'heading', raw, depth, text } as HeadingToken);
        eat(2);
        continue;
      }

      m = lines[0].match(/^(#{1,6})\s+(.+?)\s*#*\s*$/);
      if (m) {
        const depth = m[1].length;
        const text = m[2].trim();
        tokens.push({ type: 'heading', raw: lines[0], depth, text } as HeadingToken);
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
          let text = rawItem.replace(/^\s*([*+-]|\d+\.)\s+/, (m) => m.replace(/./g, ' '));
          const firstLine = rawItem.replace(/\n[\s\S]*$/, '');
          const taskMatch = firstLine.match(/^(?:\s*[*+-]|\s*\d+\.)\s+\[( |x|X)\]\s+/);
          if (taskMatch) {
            task = true; checked = /x/i.test(taskMatch[1]);
            text = rawItem.replace(/^(\s*(?:[*+-]|\d+\.)\s+)\[(?: |x|X)\]\s+/, '$1');
          }
          text = text.replace(/^(\s*)(?:[*+-]|\d+\.)\s+/, '$1');
          const tokens = this.lex(text, options);
          items.push({ type: 'list_item', raw: rawItem, task, checked, tokens } as ListItemToken);
          buf.length = 0;
        };

        while (i < lines.length) {
          const s = lines[i];
          if (/^\s*([*+-]|\d+\.)\s+/.test(s) && getIndent(s) <= baseIndent) {
            flush();
            buf.push(s);
          } else if (!buf.length && isBlank(s)) {
          } else if (buf.length && /^\s{0,3}\S/.test(s) && /^\s*([*+-]|\d+\.)\s+/.test(s)) {
            flush();
            buf.push(s);
          } else if (buf.length && isBlank(s)) {
            buf.push(s);
          } else if (buf.length) {
            buf.push(s);
          } else break;
          i++;
        }
        flush();
        const raw = lines.slice(0, i).join('\n');
        const tight = !raw.match(/\n\s*\n/); // if no empty lines, render tight
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

  // =====================
  // Parser (render tokens)
  // =====================
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

      text = text.replace(/\\([*_`\[\]()#!>|~-])/g, '$1');

      text = text.replace(/(`+)([^`\n]+?)\1/g, (_, bt: string, code: string) => `<code>${escapeHtml(code)}</code>`);

      text = text
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/__([^_]+)__/g, '<strong>$1</strong>')
        .replace(/\*([^*]+)\*/g, '<em>$1</em>')
        .replace(/_([^_]+)_/g, '<em>$1</em>');

      text = text.replace(/~~([^~]+)~~/g, '<del>$1</del>');

      text = text.replace(/!\[([^\]]*)\]\(([^\s)]+)(?:\s+\"([^\"]*)\")?\)/g, (_, alt: string, src: string, title?: string) => {
        src = this.safeUrl(src);
        if (!src) return '';
        const t = title ? ` title="${escapeHtml(title)}"` : '';
        return `<img src="${src}" alt="${escapeHtml(alt)}"${t}>`;
      });

      text = text.replace(/\[([^\]]+)\]\(([^\s)]+)(?:\s+\"([^\"]*)\")?\)/g, (_, label: string, href: string, title?: string) => {
        href = this.safeUrl(href);
        if (!href) return escapeHtml(label);
        const t = title ? ` title="${escapeHtml(title)}"` : '';
        return `<a href="${href}" rel="nofollow ugc" target="_blank"${t}>${label}</a>`;
      });

      text = text.replace(/<((?:https?:\/\/|mailto:|tel:)[^>]+)>/gi, (_, url: string) => {
        const u = this.safeUrl(url);
        if (!u) return escapeHtml(url);
        return `<a href="${u}" rel="nofollow ugc" target="_blank">${escapeHtml(url)}</a>`;
      });

      text = text.replace(/(^|\s)(https?:\/\/[\w\-._~:\/?#\[\]@!$&'()*+,;=%]+)(?=$|\s)/gi, (_, pre: string, url: string) => {
        const u = this.safeUrl(url);
        if (!u) return pre + escapeHtml(url);
        return `${pre}<a href="${u}" rel="nofollow ugc" target="_blank">${escapeHtml(url)}</a>`;
      });

      if (options.breaks) text = text.replace(/\n/g, br);
      else text = text.replace(/ {2,}\n/g, br);

      return text;
    };

    for (const t of tokens) {
      switch (t.type) {
        case 'heading': {
          const h = t as HeadingToken;
          const id = options.headerIds ? ` id="${slugify(renderInline(h.text).replace(/<[^>]+>/g, ''))}"` : '';
          out.push(`<h${h.depth}${id}>${renderInline(h.text)}</h${h.depth}>`);
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

  // =====================
  // Utilities
  // =====================
  private smartypants(html: string): string {
    return html
      .replace(/(^|\W)"(\S)/g, '$1“$2')
      .replace(/(\S)"(\W|$)/g, '$1”$2')
      .replace(/(^|\W)'(\S)/g, '$1‘$2')
      .replace(/(\S)'(\W|$)/g, '$1’$2')
      .replace(/\.{3}/g, '…')
      .replace(/--/g, '—');
  }

  /**
   * Very small sanitizer to complement our controlled renderer:
   *  - Only allow tags we produce
   *  - Strip dangerous attributes and protocols
   */
  private sanitize(html: string): string {
    const allowedTags = new Set([
      'h1','h2','h3','h4','h5','h6','p','br','hr','em','strong','del','code','pre',
      'a','img','ul','ol','li','blockquote','table','thead','tbody','tr','th','td','input'
    ]);

    const allowedAttrs: Record<string, Set<string>> = {
      'a': new Set(['href','title','rel','target']),
      'img': new Set(['src','alt','title']),
      'input': new Set(['type','checked','disabled']),
      'th': new Set(['align']), 'td': new Set(['align']),
      'ol': new Set(['start'])
    };

    const doc = this.stringToDoc(`<div>${html}</div>`);

    const walk: any = (node: Element | ChildNode) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as Element;
        const tag = el.tagName.toLowerCase();
        if (!allowedTags.has(tag)) { el.replaceWith(...Array.from(el.childNodes)); return; }
        const keep = allowedAttrs[tag] || new Set<string>();
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
      for (const child of Array.from((node as any).childNodes || [])) walk(child);
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

  /**
   * Allow only safe URL protocols.
   */
  private safeUrl(url: string): string | null {
    const trimmed = (url || '').trim();
    if (!trimmed) return null;
    let decoded = trimmed;
    try { decoded = decodeURI(trimmed); } catch { /* ignore */ }
    const lower = decoded.toLowerCase();
    if (lower.startsWith('javascript:') || lower.startsWith('data:') || lower.startsWith('vbscript:')) return null;
    if (/^(https?:|mailto:|tel:)/i.test(trimmed)) return trimmed;
    if (/^\//.test(trimmed)) return trimmed;
    return null;
  }
}
