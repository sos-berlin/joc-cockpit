import {Component, ElementRef, inject, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {CoreService} from '../../services/core.service';
import {LogSearchService} from '../../services/log-search.service';
import {NZ_MODAL_DATA, NzModalRef} from 'ng-zorro-antd/modal';
import {Subject, Subscription, debounceTime} from 'rxjs';
import * as moment from 'moment-timezone';
import {TranslateService} from '@ngx-translate/core';

interface ParsedLine {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG' | 'TRACE' | 'OTHER';
  text: string;
  raw: string;
  rawLower: string; // pre-lowercased for fast search comparisons
  globalIdx: number; // index in allLines, set by processLines
}

/** Contextual block shown in filter mode: match line + N surrounding lines. */
interface ContextBlock {
  /** Global index of the first line in this block inside filteredLines. */
  startIdx: number;
  lines: { line: ParsedLine; globalIdx: number }[];
  collapsed: boolean;
}

const TIMESTAMP_RE = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2},\d{3})\s+(INFO|WARN|ERROR|DEBUG|TRACE|FATAL)\s+/i;

// ── Order ID parsing ────────────────────────────────────────────────────────
// Matches JS7 Order IDs: #YYYY-MM-DD#<word chars, colon, hyphen>
// e.g. #2026-05-22#P0, #2026-05-22#P0:1, #2026-05-22#F1:2-suffix
const ORDER_ID_RE = /#\d{4}-\d{2}-\d{2}#[\w:-]+/g;

/**
 * Finds the JS7 Order ID token that contains `cursorIndex` in `text`.
 * Returns the token and its [start, end) offsets, or null.
 */
export function extractOrderId(
  text: string,
  cursorIndex: number
): { id: string; start: number; end: number } | null {
  ORDER_ID_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = ORDER_ID_RE.exec(text)) !== null) {
    const start = m.index;
    const end   = start + m[0].length;
    if (cursorIndex >= start && cursorIndex <= end) {
      return { id: m[0], start, end };
    }
  }
  return null;
}

/** Returns the character offset of (targetNode, targetOffset) within rootEl's full text. */
function getCharOffsetInElement(rootEl: Element, targetNode: Node, targetOffset: number): number {
  const walker = document.createTreeWalker(rootEl, NodeFilter.SHOW_TEXT);
  let total = 0;
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (node === targetNode) return total + targetOffset;
    total += (node.textContent || '').length;
  }
  return total + targetOffset;
}

/** Creates a DOM Range spanning [startOffset, endOffset) inside rootEl's text nodes. */
function buildRangeInElement(rootEl: Element, startOffset: number, endOffset: number): Range | null {
  const range = document.createRange();
  const walker = document.createTreeWalker(rootEl, NodeFilter.SHOW_TEXT);
  let pos = 0;
  let startDone = false;
  while (walker.nextNode()) {
    const node = walker.currentNode as Text;
    const len = (node.textContent || '').length;
    if (!startDone && startOffset <= pos + len) {
      range.setStart(node, startOffset - pos);
      startDone = true;
    }
    if (startDone && endOffset <= pos + len) {
      range.setEnd(node, endOffset - pos);
      return range;
    }
    pos += len;
  }
  return null;
}

function parseLine(raw: string): ParsedLine {
  const rawLower = raw.toLowerCase();
  const m = raw.match(TIMESTAMP_RE);
  if (m) {
    const lvlStr = m[2].toUpperCase();
    let level: ParsedLine['level'] = 'OTHER';
    if (lvlStr === 'INFO')                     level = 'INFO';
    else if (lvlStr === 'WARN')                level = 'WARN';
    else if (lvlStr === 'ERROR' || lvlStr === 'FATAL') level = 'ERROR';
    else if (lvlStr === 'DEBUG')               level = 'DEBUG';
    else if (lvlStr === 'TRACE')               level = 'TRACE';
    return { timestamp: m[1], level, text: raw.slice(m[0].length).replace(/\r?\n$/, ''), raw, rawLower, globalIdx: 0 };
  }
  return { timestamp: '', level: 'OTHER', text: raw.replace(/\r?\n$/, ''), raw, rawLower, globalIdx: 0 };
}

/** Predefined quick-search presets. */
const PREDEFINED_SEARCHES: { label: string; value: string }[] = [
  { label: 'logConsole.label.predefined.exception',        value: 'Exception' },
  { label: 'logConsole.label.predefined.error',            value: 'ERROR' },
  { label: 'logConsole.label.predefined.warn',             value: 'WARN' },
  { label: 'logConsole.label.predefined.controllerStarted', value: 'Controller started' },
  { label: 'logConsole.label.predefined.agentStarted',     value: 'Agent started' },
  { label: 'logConsole.label.predefined.connectionLost',   value: 'Connection lost' },
  { label: 'logConsole.label.predefined.restart',          value: 'Restart' },
  { label: 'logConsole.label.predefined.terminated',       value: 'Terminated' },
];

/** Context line count options for filter mode. */
const CONTEXT_OPTIONS = [
  { label: '2 lines', value: 2 },
  { label: '5 lines', value: 5 },
  { label: '10 lines', value: 10 },
  { label: '20 lines', value: 20 },
];

export interface LogConsoleRequest {
  type: 'controller' | 'agent' | 'joc';
  controllerId?: string;
  role?: string;
  agentId?: string;
  subagentId?: string;
  /** REST level: WARN | INFO | DEBUG  (no TRACE — DEBUG includes TRACE automatically). */
  level?: string;
  dateFrom?: string;
  dateTo?: string;
  timeZone?: string;
  numOfLines?: number;
}

@Component({
  standalone: false,
  selector: 'app-log-console',
  templateUrl: './log-console.component.html',
  styleUrls: ['./log-console.component.scss']
})
export class LogConsoleComponent implements OnInit, OnChanges, OnDestroy {
  @Input() request: LogConsoleRequest = { type: 'controller' };

  allLines: ParsedLine[] = [];
  // Cached computed arrays — updated by private methods, never re-derived as getters.
  filteredLines: ParsedLine[] = [];
  contextBlocks: ContextBlock[] = [];
  levelCounts: Record<string, number> = { error: 0, warn: 0, info: 0, debug: 0, trace: 0, other: 0 };
  hasWarn  = false;
  hasError = false;
  hasDebug = false;
  isLoading = false;
  isDownloading = false;
  isComplete = false;
  errorMsg: string | null = null;
  token: string | null = null;
  timeZone = '';

  // ── Level visibility checkboxes (display filter, not REST level) ──────────
  filters = { info: true, warn: true, error: true, debug: true, trace: true };

  // ── Global search (shared via LogSearchService) ────────────────────────────
  searchTerm = '';
  /** Debounced, trimmed, lowercased search term used for all computations. */
  private _committedSearchTerm = '';
  /** Subject that feeds the 300 ms debounce before committing a search. */
  private readonly _searchDebounce = new Subject<string>();
  showPredefined = false;
  readonly predefined = PREDEFINED_SEARCHES;

  // ── Search mode ────────────────────────────────────────────────────────────
  /** true = filtered mode (only matching lines + context), false = full log with highlights */
  filterMode = false;
  /** Number of context lines shown above/below each match in filter mode. */
  contextLines = 5;
  readonly contextOptions = CONTEXT_OPTIONS;

  followTail = false;

  @ViewChild('logBody') logBodyRef?: ElementRef<HTMLElement>;
  @ViewChild('searchInput') searchInputRef?: ElementRef<HTMLInputElement>;

  private destroyed = false;
  private searchSub?: Subscription;
  private debounceSub?: Subscription;
  /** Per-text SafeHtml cache; cleared whenever the committed search term changes. */
  private readonly highlightCache = new Map<string, SafeHtml>();
  private syslogResizeHandler?: () => void;
  private readonly levelJumpIndices = new Map<string, number>();

  constructor(
    private coreService: CoreService,
    private sanitizer: DomSanitizer,
    private logSearch: LogSearchService
  ) {}

  ngOnInit(): void {
    // Persist window size so the next system-log popup opens at the same size.
    this.syslogResizeHandler = () => {
      window.localStorage['syslog_window_wt'] = String(window.innerWidth);
      window.localStorage['syslog_window_ht'] = String(window.innerHeight);
    };
    window.addEventListener('resize', this.syslogResizeHandler);
    this.syslogResizeHandler(); // save initial size immediately

    // Debounced search commitment — only recalculates filtered data 300ms after typing stops.
    this.debounceSub = this._searchDebounce.pipe(debounceTime(300)).subscribe(term => {
      this.commitSearch(term);
    });

    // Sync with global search state (apply immediately — another window already debounced).
    const current = this.logSearch.currentTerm;
    if (current) {
      this.searchTerm = current;
      this.commitSearch(current);
    }
    this.searchSub = this.logSearch.searchTerm$.subscribe(term => {
      if (this.searchTerm !== term) {
        this.searchTerm = term;
        this.commitSearch(term);
      }
    });

    if (this.request?.dateFrom) {
      this.fetchLog();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['request'] && !changes['request'].firstChange && this.request?.dateFrom) {
      this.reload();
    }
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.searchSub?.unsubscribe();
    this.debounceSub?.unsubscribe();
    this._searchDebounce.complete();
    if (this.syslogResizeHandler) {
      window.removeEventListener('resize', this.syslogResizeHandler);
    }
  }

  // ── Search ─────────────────────────────────────────────────────────────────

  onSearchChange(): void {
    // Push to debounce subject — actual computation happens after 300ms idle.
    this._searchDebounce.next(this.searchTerm);
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.commitSearch('');
    this.logSearch.clearTerm();
  }

  applyPredefined(value: string): void {
    this.searchTerm = value;
    this.commitSearch(value);   // bypass debounce for deliberate preset selection
    this.logSearch.setTerm(value);
    this.showPredefined = false;
  }

  togglePredefined(): void {
    this.showPredefined = !this.showPredefined;
  }

  onFilterChange(): void {
    this.computeFilteredLines();
  }

  onContextLinesChange(): void {
    this.computeContextBlocks();
  }

  // ── Search commitment & cache management ──────────────────────────────────

  private commitSearch(raw: string): void {
    const term = raw.trim().toLowerCase();
    if (this._committedSearchTerm === term) return;
    this._committedSearchTerm = term;
    this.highlightCache.clear();
    this.computeFilteredLines();
    this.computeContextBlocks();
  }

  // ── Filtered lines (level + search) — computed into cached fields ──────────

  private computeFilteredLines(): void {
    const term = this._committedSearchTerm;
    this.filteredLines = this.allLines.filter(l =>
      this.levelVisible(l.level) && (!term || l.rawLower.includes(term))
    );
  }

  private levelVisible(level: ParsedLine['level']): boolean {
    switch (level) {
      case 'INFO':  return this.filters.info;
      case 'WARN':  return this.filters.warn;
      case 'ERROR': return this.filters.error;
      case 'DEBUG': return this.filters.debug;
      case 'TRACE': return this.filters.trace;
      default: return true;
    }
  }

  // ── Context blocks (filter mode) ──────────────────────────────────────────

  /**
   * Builds context blocks for filter mode into the cached `contextBlocks` field.
   * Each matching line gets ±contextLines surrounding lines; overlapping windows
   * are merged so the DOM stays small.
   */
  private computeContextBlocks(): void {
    const term = this._committedSearchTerm;
    if (!term) { this.contextBlocks = []; return; }

    const matchIdxSet = new Set<number>();
    for (let i = 0; i < this.allLines.length; i++) {
      if (this.allLines[i].rawLower.includes(term)) matchIdxSet.add(i);
    }
    if (matchIdxSet.size === 0) { this.contextBlocks = []; return; }

    const windows: [number, number][] = [];
    for (const idx of Array.from(matchIdxSet).sort((a, b) => a - b)) {
      const start = Math.max(0, idx - this.contextLines);
      const end   = Math.min(this.allLines.length - 1, idx + this.contextLines);
      if (windows.length > 0 && start <= windows[windows.length - 1][1] + 1) {
        windows[windows.length - 1][1] = Math.max(windows[windows.length - 1][1], end);
      } else {
        windows.push([start, end]);
      }
    }

    this.contextBlocks = windows.map(([start, end]) => ({
      startIdx: start,
      lines: Array.from({ length: end - start + 1 }, (_, i) => ({
        line: this.allLines[start + i],
        globalIdx: start + i,
      })),
      collapsed: false,
    }));
  }

  isMatchLine(line: ParsedLine): boolean {
    return this._committedSearchTerm.length > 0 && line.rawLower.includes(this._committedSearchTerm);
  }

  // ── Level stats ─────────────────────────────────────────────────────────────

  private refreshLevelStats(): void {
    const c: Record<string, number> = { error: 0, warn: 0, info: 0, debug: 0, trace: 0, other: 0 };
    let hasW = false, hasE = false, hasD = false;
    for (const l of this.allLines) {
      switch (l.level) {
        case 'ERROR': c['error']++; hasE = true; break;
        case 'WARN':  c['warn']++;  hasW = true; break;
        case 'INFO':  c['info']++; break;
        case 'DEBUG': c['debug']++; hasD = true; break;
        case 'TRACE': c['trace']++; hasD = true; break;
        default:      c['other']++; break;
      }
    }
    this.levelCounts = c;
    this.hasWarn  = hasW;
    this.hasError = hasE;
    this.hasDebug = hasD;
  }

  // ── Highlight ──────────────────────────────────────────────────────────────

  highlightText(text: string): SafeHtml {
    const cached = this.highlightCache.get(text);
    if (cached !== undefined) return cached;

    const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const term = this._committedSearchTerm;
    let result: SafeHtml;
    if (!term) {
      result = this.sanitizer.bypassSecurityTrustHtml(escaped);
    } else {
      const safeRe = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      result = this.sanitizer.bypassSecurityTrustHtml(
        escaped.replace(new RegExp(safeRe, 'gi'), '<mark class="log-search-match">$&</mark>')
      );
    }
    this.highlightCache.set(text, result);
    return result;
  }

  // ── Order ID double-click detection ───────────────────────────────────────

  /**
   * On double-click inside the log body, detect if the cursor is within an
   * Order ID token and — if so — select the FULL token, copy it, and search.
   * Falls back to native browser selection when clicked outside an Order ID.
   */
  onLogBodyDblClick(event: MouseEvent): void {
    // Use event.target (always an Element) to find the .log-text span.
    // This is more reliable than walking up from a text node.
    const textEl = (event.target as Element)?.closest('.log-text') as HTMLElement | null;
    if (!textEl) return;  // clicked on timestamp, level badge, or padding — ignore

    const fullText = textEl.textContent || '';
    if (!fullText.includes('#')) return;  // no Order IDs possible in this line

    // The browser already applied its word-selection by the time dblclick fires.
    // Read its start position as our cursor index within .log-text.
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    const r = sel.getRangeAt(0);
    if (r.startContainer.nodeType !== Node.TEXT_NODE) return;

    const charOffset = getCharOffsetInElement(textEl, r.startContainer, r.startOffset);
    const match = extractOrderId(fullText, charOffset);

    // Not inside an Order ID — leave browser word selection as-is
    if (!match) return;

    // Override browser selection with the full Order ID span
    const domRange = buildRangeInElement(textEl, match.start, match.end);
    if (domRange) {
      sel.removeAllRanges();
      sel.addRange(domRange);
    }

    // Copy to clipboard
    navigator.clipboard.writeText(match.id).then(() => {
      this.showCopyFeedback(match.id);
    }).catch(() => {
      const el = document.createElement('textarea');
      el.value = match.id;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      this.showCopyFeedback(match.id);
    });

    // Push into global search
    this.searchTerm = match.id;
    this.commitSearch(match.id);
    this.logSearch.setTerm(match.id);
  }

  copiedOrderId: string | null = null;
  activeLineIdx: number | null = null;
  private copyFeedbackTimer?: ReturnType<typeof setTimeout>;

  private showCopyFeedback(id: string): void {
    this.copiedOrderId = id;
    if (this.copyFeedbackTimer) clearTimeout(this.copyFeedbackTimer);
    this.copyFeedbackTimer = setTimeout(() => { this.copiedOrderId = null; }, 2000);
  }

  // ── Navigation ─────────────────────────────────────────────────────────────

  jumpToLevel(level: string): void {
    const el = this.logBodyRef?.nativeElement;
    if (!el) return;
    const targets = Array.from(el.querySelectorAll<HTMLElement>(`.log-line-${level}`));
    if (targets.length === 0) return;
    const idx = (this.levelJumpIndices.get(level) ?? 0) % targets.length;
    targets[idx].scrollIntoView({ block: 'center', behavior: 'smooth' });
    this.levelJumpIndices.set(level, idx + 1);
    const lineIdx = targets[idx].getAttribute('data-lineidx');
    if (lineIdx !== null) this.activeLineIdx = Number(lineIdx);
  }

  toggleFollowTail(): void {
    this.followTail = !this.followTail;
    if (this.followTail) this.scrollToBottom();
  }

  // ── Convenience getters ────────────────────────────────────────────────────

  // hasWarn / hasError / hasDebug are now cached fields updated by refreshLevelStats().

  get displayTz(): string {
    return this.request?.timeZone || this.timeZone;
  }

  formatTimestamp(raw: string): string {
    if (!raw) return raw;
    const tz = this.displayTz;
    const iso = raw.replace(',', '.');
    if (tz) {
      return moment.tz(iso, 'YYYY-MM-DDTHH:mm:ss.SSS', tz).format('YYYY-MM-DD HH:mm:ss');
    }
    return iso.replace('T', ' ').slice(0, 23);
  }

  lineBorderColor(level: ParsedLine['level']): string {
    switch (level) {
      case 'ERROR': return 'var(--red)';
      case 'WARN':  return 'var(--gold)';
      case 'DEBUG': return 'var(--green)';
      case 'TRACE': return 'var(--cyan, #17a2b8)';
      default:      return 'transparent';
    }
  }

  // ── HTTP ───────────────────────────────────────────────────────────────────

  fetchLog(): void {
    if (this.isLoading) return;
    this.isLoading = true;
    const apiUrl = this.getApiUrl();
    this.coreService.post(apiUrl, this.buildRequest()).subscribe({
      next: (res: any) => {
        if (this.destroyed) return;
        this.processLines(res.logLines || []);
        this.isComplete = res.isComplete === true;
        this.token = res.logToken || null;
        this.timeZone = res.timeZone || '';
        this.isLoading = false;
        if (this.followTail) this.scrollToBottom();
      },
      error: (err) => {
        if (!this.destroyed) {
          this.errorMsg = err?.error?.message || err?.message || ('HTTP ' + (err?.status || '?'));
        }
        this.isLoading = false;
      }
    });
  }

  loadMore(): void {
    if (!this.token || this.isLoading) return;
    this.isLoading = true;
    const apiUrl = this.getRunningApiUrl();
    this.coreService.post(apiUrl, { logToken: this.token }).subscribe({
      next: (res: any) => {
        if (this.destroyed) return;
        this.processLines(res.logLines || []);
        this.isComplete = res.isComplete === true;
        this.token = res.logToken || null;
        this.isLoading = false;
        if (this.followTail) this.scrollToBottom();
      },
      error: (err) => {
        if (!this.destroyed) {
          this.errorMsg = err?.error?.message || err?.message || ('HTTP ' + (err?.status || '?'));
        }
        this.isLoading = false;
      }
    });
  }

  download(): void {
    this.isDownloading = true;
    const type = this.request?.type || 'controller';
    const downloadUrl = this.getDownloadApiUrl();
    this.coreService.download(downloadUrl, this.buildRequest(), '', () => {
      this.isDownloading = false;
    });
  }

  reload(): void {
    this.allLines = [];
    this.token = null;
    this.isComplete = false;
    this.errorMsg = null;
    this.activeLineIdx = null;
    this.levelJumpIndices.clear();
    this.fetchLog();
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private scrollToBottom(): void {
    const el = this.logBodyRef?.nativeElement;
    if (el) setTimeout(() => { el.scrollTop = el.scrollHeight; }, 0);
  }

  private processLines(lines: string[]): void {
    const CHUNK_SIZE = 500;
    let offset = 0;

    const processChunk = () => {
      if (this.destroyed) return;
      const end = Math.min(offset + CHUNK_SIZE, lines.length);
      for (let i = offset; i < end; i++) {
        const raw = lines[i];
        const cleaned = raw.replace(/\r?\n$/, '');
        if (!cleaned.trim()) continue;
        const parsed = parseLine(cleaned);
        if (!parsed.timestamp && this.allLines.length > 0) {
          const last = this.allLines[this.allLines.length - 1];
          last.text    += '\n' + parsed.text;
          last.raw     += '\n' + parsed.text;
          last.rawLower = last.raw.toLowerCase();
        } else {
          parsed.globalIdx = this.allLines.length;
          this.allLines.push(parsed);
        }
      }
      offset = end;
      this.refreshLevelStats();
      this.computeFilteredLines();
      this.computeContextBlocks();
      if (this.followTail) this.scrollToBottom();
      if (offset < lines.length) {
        setTimeout(processChunk, 0);
      }
    };

    processChunk();
  }

  private getApiUrl(): string {
    switch (this.request?.type) {
      case 'agent': return 'agent/log';
      case 'joc':   return 'joc/log';
      default:      return 'controller/log';
    }
  }

  private getRunningApiUrl(): string {
    switch (this.request?.type) {
      case 'agent': return 'agent/log/running';
      case 'joc':   return 'joc/log/running';
      default:      return 'controller/log/running';
    }
  }

  private getDownloadApiUrl(): string {
    switch (this.request?.type) {
      case 'agent': return 'agent/log/download';
      case 'joc':   return 'joc/log/download';
      default:      return 'controller/log/download';
    }
  }

  private buildRequest(): any {
    const r = this.request;
    const req: any = {};
    if (r.type === 'controller') {
      if (r.controllerId) req.controllerId = r.controllerId;
      if (r.role)         req.role         = r.role;
    } else if (r.type === 'agent') {
      if (r.controllerId) req.controllerId = r.controllerId;
      if (r.agentId)      req.agentId      = r.agentId;
      if (r.subagentId)   req.subagentId   = r.subagentId;
    }
    // Hierarchical level: DEBUG → server sends DEBUG + TRACE; WARN → WARN + ERROR
    req.level    = r.level    || 'INFO';
    req.dateFrom = r.dateFrom;
    if (r.dateTo)     req.dateTo     = r.dateTo;
    if (r.timeZone)   req.timeZone   = r.timeZone;
    if (r.numOfLines) req.numOfLines = r.numOfLines;
    return req;
  }
}

// ─── Filter/config modal ─────────────────────────────────────────────────────
@Component({
  standalone: false,
  selector: 'app-log-console-modal',
  templateUrl: './log-console-modal.component.html'
})
export class LogConsoleModalComponent implements OnInit {
  readonly modalData: any = inject(NZ_MODAL_DATA);

  type: 'controller' | 'agent' | 'joc' = 'controller';

  form: any = {
    controllerId:    '',
    role:            '',
    agentId:         '',
    subagentId:      '',
    /**
     * GUI log levels — TRACE is intentionally omitted.
     * Selecting DEBUG automatically includes TRACE on the server side.
     * Hierarchical: WARN → WARN+ERROR, INFO → INFO+WARN+ERROR, DEBUG → all.
     */
    level:           'INFO',
    dateMode:        'relative' as 'relative' | 'specific',
    dateFrom:        '0d',
    dateFromDate:    null as Date | null,
    dateFromTime:    null as Date | null,
    dateTo:          '',
    dateToDate:      null as Date | null,
    dateToTime:      null as Date | null,
    timeZone:        '',
    numOfLines:      null
  };

  logRequest: LogConsoleRequest | null = null;
  isDownloading = false;
  zones: string[] = [];
  preferencesTz = '';

  /**
   * GUI level options — three tiers only.
   * TRACE is not exposed; requesting DEBUG includes TRACE automatically.
   * ERROR-only is not supported per spec.
   */
  readonly levelOptions = [
    { value: 'WARN',  label: 'logConsole.label.levelOption.warn'  },
    { value: 'INFO',  label: 'logConsole.label.levelOption.info'  },
    { value: 'DEBUG', label: 'logConsole.label.levelOption.debug' },
  ];
  readonly roleOptions = ['PRIMARY', 'BACKUP'];

  constructor(public activeModal: NzModalRef, private coreService: CoreService, private translate: TranslateService) {}

  ngOnInit(): void {
    // Resolve user profile timezone
    if (sessionStorage['preferences']) {
      try {
        const prefs = JSON.parse(sessionStorage['preferences']);
        this.preferencesTz = prefs.zone || '';
      } catch { /**/ }
    }
    if (!this.preferencesTz) {
      this.preferencesTz = this.coreService.getTimeZone();
    }

    // Load timezone list for the selector
    this.coreService.getTimeZoneList((timezones: string[]) => {
      this.zones = timezones;
    });

    // Apply context-specific fields from the modal caller
    const data = this.modalData || {};
    if (data.type)         this.type              = data.type;
    if (data.controllerId) this.form.controllerId = data.controllerId;
    if (data.agentId)      this.form.agentId      = data.agentId;
    if (data.subagentId)   this.form.subagentId   = data.subagentId;
    if (data.role)         this.form.role         = data.role;

    // Default timezone = user profile timezone
    this.form.timeZone = this.preferencesTz;

    // Restore last-used form parameters from session storage
    const saved = sessionStorage['logConsoleLastForm'];
    if (saved) {
      try {
        const s = JSON.parse(saved);
        if (s.level !== undefined)      this.form.level      = s.level;
        if (s.dateMode !== undefined)   this.form.dateMode   = s.dateMode;
        if (s.dateFrom !== undefined)   this.form.dateFrom   = s.dateFrom;
        if (s.dateTo !== undefined)     this.form.dateTo     = s.dateTo;
        if (s.numOfLines !== undefined) this.form.numOfLines = s.numOfLines;
        if (s.timeZone)                 this.form.timeZone   = s.timeZone;
        if (s.dateFromDate) this.form.dateFromDate = new Date(s.dateFromDate);
        if (s.dateFromTime) this.form.dateFromTime = new Date(s.dateFromTime);
        if (s.dateToDate)   this.form.dateToDate   = new Date(s.dateToDate);
        if (s.dateToTime)   this.form.dateToTime   = new Date(s.dateToTime);
      } catch { /**/ }
    }
  }

  get sourceName(): string {
    const suffix = this.translate.instant('log.label.logs');
    if (this.type === 'joc') return this.translate.instant('logConsole.label.joc') + ' ' + suffix;
    if (this.type === 'agent') return (this.form.agentId || this.translate.instant('logConsole.label.agent')) + ' ' + suffix;
    return (this.form.controllerId || this.translate.instant('logConsole.label.controller')) + ' ' + suffix;
  }

  get effectiveTz(): string {
    return this.form.timeZone || this.preferencesTz;
  }

  /** True when the user chose a timezone different from their profile timezone. */
  get isTimezoneModified(): boolean {
    return !!(this.form.timeZone && this.form.timeZone !== this.preferencesTz);
  }

  onTimezoneChange(): void {}

  get isShowDisabled(): boolean {
    const dateFromOk = this.form.dateMode === 'relative'
      ? !!this.form.dateFrom?.trim()
      : !!this.form.dateFromDate;
    if (!dateFromOk) return true;
    if (this.type === 'controller' && !this.form.controllerId) return true;
    if (this.type === 'agent' && (!this.form.controllerId || !this.form.agentId)) return true;
    return false;
  }

  get isDownloadDisabled(): boolean {
    return this.isShowDisabled || this.isDownloading;
  }

  showLogs(): void {
    this.saveFormState();
    const req = this.buildLogRequest();
    const params = new URLSearchParams();
    params.set('type', req.type);
    if (req.controllerId) params.set('controllerId', req.controllerId);
    if (req.role)         params.set('role',         req.role);
    if (req.agentId)      params.set('agentId',      req.agentId);
    if (req.subagentId)   params.set('subagentId',   req.subagentId);
    if (req.level)        params.set('level',        req.level);
    if (req.dateFrom)     params.set('dateFrom',     req.dateFrom);
    if (req.dateTo)       params.set('dateTo',       req.dateTo);
    if (req.timeZone)     params.set('timeZone',     req.timeZone);
    if (req.numOfLines)   params.set('numOfLines',   String(req.numOfLines));
    this.activeModal.destroy();
    const savedW = window.localStorage['syslog_window_wt'];
    const savedH = window.localStorage['syslog_window_ht'];
    const w = savedW ? Number(savedW) : (window.innerWidth  || 1400);
    const h = savedH ? Number(savedH) : (window.innerHeight || 800);
    const left = Math.max(0, (screen.width  - w) / 2);
    const top  = Math.max(0, (screen.height - h) / 2);
    window.open(
      '#/system-log?' + params.toString(),
      '_blank',
      `width=${w},height=${h},top=${top},left=${left},resizable=1,scrollbars=1,status=0,toolbar=0,menubar=0,location=0`
    );
  }

  download(): void {
    this.saveFormState();
    this.isDownloading = true;
    const req = this.buildLogRequest();
    const apiUrl  = this.getDownloadApiUrl(req.type);
    this.coreService.download(apiUrl, this.buildDownloadPayload(req), '', () => {
      this.isDownloading = false;
    });
  }

  onTypeChange(): void {}

  private saveFormState(): void {
    const toSave: any = {
      level:      this.form.level,
      dateMode:   this.form.dateMode,
      dateFrom:   this.form.dateFrom,
      dateTo:     this.form.dateTo,
      numOfLines: this.form.numOfLines,
      timeZone:   this.form.timeZone
    };
    if (this.form.dateFromDate instanceof Date) toSave.dateFromDate = this.form.dateFromDate.toISOString();
    if (this.form.dateFromTime instanceof Date) toSave.dateFromTime = this.form.dateFromTime.toISOString();
    if (this.form.dateToDate   instanceof Date) toSave.dateToDate   = this.form.dateToDate.toISOString();
    if (this.form.dateToTime   instanceof Date) toSave.dateToTime   = this.form.dateToTime.toISOString();
    try { sessionStorage['logConsoleLastForm'] = JSON.stringify(toSave); } catch { /**/ }
  }

  private buildLogRequest(): LogConsoleRequest {
    const tz = this.effectiveTz;
    // Build a datetime string from picker values without browser-timezone influence,
    // then interpret it in the effective timezone and send UTC to the API.
    const buildDateStr = (dateVal: Date, timeVal: Date | null, defaultTime: string): string => {
      const y  = dateVal.getFullYear();
      const mo = String(dateVal.getMonth() + 1).padStart(2, '0');
      const d  = String(dateVal.getDate()).padStart(2, '0');
      let timePart = defaultTime;
      if (timeVal) {
        timePart = `${String(timeVal.getHours()).padStart(2, '0')}:${String(timeVal.getMinutes()).padStart(2, '0')}:${String(timeVal.getSeconds()).padStart(2, '0')}`;
      }
      return `${y}-${mo}-${d} ${timePart}`;
    };
    let dateFrom: string;
    if (this.form.dateMode === 'specific' && this.form.dateFromDate) {
      const localStr = buildDateStr(this.form.dateFromDate, this.form.dateFromTime, '00:00:00');
      dateFrom = moment.tz(localStr, 'YYYY-MM-DD HH:mm:ss', tz).utc().format('YYYY-MM-DDTHH:mm:ss[Z]');
    } else {
      dateFrom = this.form.dateFrom?.trim() || '0d';
    }
    let dateTo: string | undefined;
    if (this.form.dateMode === 'specific' && this.form.dateToDate) {
      const localStr = buildDateStr(this.form.dateToDate, this.form.dateToTime, '23:59:59');
      dateTo = moment.tz(localStr, 'YYYY-MM-DD HH:mm:ss', tz).utc().format('YYYY-MM-DDTHH:mm:ss[Z]');
    } else {
      dateTo = this.form.dateTo?.trim() || undefined;
    }
    return {
      type:         this.type,
      controllerId: this.form.controllerId || undefined,
      role:         this.form.role         || undefined,
      agentId:      this.form.agentId      || undefined,
      subagentId:   this.form.subagentId   || undefined,
      level:        this.form.level        || 'INFO',
      dateFrom,
      dateTo,
      // Only send timeZone to API when user selected a zone different from their profile
      timeZone:     this.isTimezoneModified ? this.form.timeZone : undefined,
      numOfLines:   this.form.numOfLines ? Number(this.form.numOfLines) : undefined
    };
  }

  private buildDownloadPayload(req: LogConsoleRequest): any {
    const p: any = {};
    if (req.type === 'controller') {
      if (req.controllerId) p.controllerId = req.controllerId;
      if (req.role) p.role = req.role;
    } else if (req.type === 'agent') {
      if (req.controllerId) p.controllerId = req.controllerId;
      if (req.agentId)    p.agentId    = req.agentId;
      if (req.subagentId) p.subagentId = req.subagentId;
    }
    p.level    = req.level    || 'INFO';
    p.dateFrom = req.dateFrom;
    if (req.dateTo)     p.dateTo     = req.dateTo;
    if (req.timeZone)   p.timeZone   = req.timeZone;
    if (req.numOfLines) p.numOfLines = req.numOfLines;
    return p;
  }

  private getDownloadApiUrl(type: 'controller' | 'agent' | 'joc'): string {
    switch (type) {
      case 'agent': return 'agent/log/download';
      case 'joc':   return 'joc/log/download';
      default:      return 'controller/log/download';
    }
  }
}

// ─── Viewer modal: wrapper opened after the filter form ─────────────────────
@Component({
  standalone: false,
  selector: 'app-log-console-viewer',
  templateUrl: './log-console-viewer.component.html'
})
export class LogConsoleViewerComponent implements OnInit {
  readonly modalData: any = inject(NZ_MODAL_DATA);

  request!: LogConsoleRequest;
  title = '';

  constructor(public activeModal: NzModalRef, private translate: TranslateService) {}

  ngOnInit(): void {
    const data = this.modalData || {};
    this.request = data.request;
    this.title   = data.title || this.translate.instant('logConsole.label.systemLogs');
  }
}
