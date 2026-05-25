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
}

/** Contextual block shown in filter mode: match line + N surrounding lines. */
interface ContextBlock {
  /** Global index of the first line in this block inside filteredLines. */
  startIdx: number;
  lines: { line: ParsedLine; globalIdx: number }[];
  collapsed: boolean;
}

const TIMESTAMP_RE = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2},\d{3})\s+(INFO|WARN|ERROR|DEBUG|TRACE|FATAL)\s+/i;

// Matches JS7 Order IDs:  #<date>#P<seq>-<name>  or  #<date>-P-<seq>  etc.
// The '#' character is NOT a terminator — a single Order ID may contain multiple '#' segments.
// Begin terminators: space ( [ {   End terminators: space ) ] }
const ORDER_ID_RE = /#[\w\-.:+@#]+/g;

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
    return { timestamp: m[1], level, text: raw.slice(m[0].length).replace(/\r?\n$/, ''), raw, rawLower };
  }
  return { timestamp: '', level: 'OTHER', text: raw.replace(/\r?\n$/, ''), raw, rawLower };
}

/** Predefined quick-search presets. */
const PREDEFINED_SEARCHES: { label: string; value: string }[] = [
  { label: 'Exception',        value: 'Exception' },
  { label: 'ERROR',            value: 'ERROR' },
  { label: 'WARN',             value: 'WARN' },
  { label: 'Controller started', value: 'Controller started' },
  { label: 'Agent started',    value: 'Agent started' },
  { label: 'Connection lost',  value: 'Connection lost' },
  { label: 'Restart',          value: 'Restart' },
  { label: 'Terminated',       value: 'Terminated' },
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

  constructor(
    private coreService: CoreService,
    private sanitizer: DomSanitizer,
    private logSearch: LogSearchService
  ) {}

  ngOnInit(): void {
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
   * On double-click anywhere inside the log body, detect if the cursor is
   * within an Order ID token (starts with #) and copy it to the clipboard.
   */
  onLogBodyDblClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const textContent = target?.textContent || '';

    // Walk up to the nearest element that contains the full text of the line
    const lineEl = (target.closest('.log-line') as HTMLElement) || target;
    const lineText = lineEl?.textContent || textContent;

    // Extract all Order IDs from the full line text
    const ids = lineText.match(ORDER_ID_RE);
    if (!ids || ids.length === 0) return;

    // Find which one is closest to the double-click selection
    const sel = window.getSelection();
    const selectedText = sel?.toString().trim() || '';

    // Prefer an exact match with the selected text first
    const matched =
      ids.find(id => id === selectedText || id === '#' + selectedText) ||
      ids.find(id => id.includes(selectedText)) ||
      ids[0];

    if (matched) {
      navigator.clipboard.writeText(matched).then(() => {
        this.showCopyFeedback(matched);
      }).catch(() => {
        // Fallback for browsers that restrict clipboard API
        const el = document.createElement('textarea');
        el.value = matched;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        this.showCopyFeedback(matched);
      });
      // Paste into global search as well
      this.searchTerm = matched;
      this.commitSearch(matched);  // immediate — no debounce for explicit selection
      this.logSearch.setTerm(matched);
    }
  }

  copiedOrderId: string | null = null;
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
    const target = el.querySelector<HTMLElement>(`.log-line-${level}`);
    target?.scrollIntoView({ block: 'center', behavior: 'smooth' });
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
        this.token = res.token || null;
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
    const apiUrl = this.getApiUrl();
    this.coreService.post(apiUrl, { token: this.token }).subscribe({
      next: (res: any) => {
        if (this.destroyed) return;
        this.processLines(res.logLines || []);
        this.isComplete = res.isComplete === true;
        this.token = res.token || null;
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
    const filename = type === 'agent' ? 'agent.log.gz' : type === 'joc' ? 'joc.log.gz' : 'controller.log.gz';
    this.coreService.download(downloadUrl, this.buildRequest(), filename, () => {
      this.isDownloading = false;
    });
  }

  reload(): void {
    this.allLines = [];
    this.token = null;
    this.isComplete = false;
    this.errorMsg = null;
    this.fetchLog();
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private scrollToBottom(): void {
    const el = this.logBodyRef?.nativeElement;
    if (el) setTimeout(() => { el.scrollTop = el.scrollHeight; }, 0);
  }

  private processLines(lines: string[]): void {
    for (const raw of lines) {
      const cleaned = raw.replace(/\r?\n$/, '');
      if (!cleaned.trim()) continue;
      const parsed = parseLine(cleaned);
      if (!parsed.timestamp && this.allLines.length > 0) {
        const last = this.allLines[this.allLines.length - 1];
        last.text    += '\n' + parsed.text;
        last.raw     += '\n' + parsed.text;
        last.rawLower = last.raw.toLowerCase();
      } else {
        this.allLines.push(parsed);
      }
    }
    this.refreshLevelStats();
    this.computeFilteredLines();
    this.computeContextBlocks();
  }

  private getApiUrl(): string {
    switch (this.request?.type) {
      case 'agent': return 'agent/log';
      case 'joc':   return 'joc/log';
      default:      return 'controller/log';
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
    dateFrom:        '1d',
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
    const data = this.modalData || {};
    if (data.type)         this.type              = data.type;
    if (data.controllerId) this.form.controllerId = data.controllerId;
    if (data.agentId)      this.form.agentId      = data.agentId;
    if (data.subagentId)   this.form.subagentId   = data.subagentId;
    if (data.timeZone)     this.form.timeZone     = data.timeZone;
    if (data.role)         this.form.role         = data.role;
  }

  get sourceName(): string {
    const suffix = this.translate.instant('log.label.logs');
    if (this.type === 'joc') return this.translate.instant('logConsole.label.joc') + ' ' + suffix;
    if (this.type === 'agent') return (this.form.agentId || this.translate.instant('logConsole.label.agent')) + ' ' + suffix;
    return (this.form.controllerId || this.translate.instant('logConsole.label.controller')) + ' ' + suffix;
  }

  get effectiveTz(): string {
    return this.form.timeZone || this.coreService.getTimeZone();
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
    const w = window.innerWidth  || 1400;
    const h = window.innerHeight || 800;
    const left = Math.max(0, (screen.width  - w) / 2);
    const top  = Math.max(0, (screen.height - h) / 2);
    window.open(
      '#/system-log?' + params.toString(),
      '_blank',
      `width=${w},height=${h},top=${top},left=${left},resizable=1,scrollbars=1,status=0,toolbar=0,menubar=0,location=0`
    );
  }

  download(): void {
    this.isDownloading = true;
    const req = this.buildLogRequest();
    const apiUrl  = this.getDownloadApiUrl(req.type);
    const filename = req.type === 'agent' ? 'agent.log.gz' : req.type === 'joc' ? 'joc.log.gz' : 'controller.log.gz';
    this.coreService.download(apiUrl, this.buildDownloadPayload(req), filename, () => {
      this.isDownloading = false;
    });
  }

  onTypeChange(): void {}

  private buildLogRequest(): LogConsoleRequest {
    const tz = this.effectiveTz;
    let dateFrom: string;
    if (this.form.dateMode === 'specific' && this.form.dateFromDate) {
      const d = moment(this.form.dateFromDate).startOf('day');
      if (this.form.dateFromTime) {
        const t = moment(this.form.dateFromTime);
        d.hours(t.hours()).minutes(t.minutes()).seconds(t.seconds());
      }
      dateFrom = moment.tz(d.toDate(), tz).format('YYYY-MM-DDTHH:mm:ssZ');
    } else {
      dateFrom = this.form.dateFrom?.trim() || '1d';
    }
    let dateTo: string | undefined;
    if (this.form.dateMode === 'specific' && this.form.dateToDate) {
      const d = moment(this.form.dateToDate).startOf('day');
      if (this.form.dateToTime) {
        const t = moment(this.form.dateToTime);
        d.hours(t.hours()).minutes(t.minutes()).seconds(t.seconds());
      }
      dateTo = moment.tz(d.toDate(), tz).format('YYYY-MM-DDTHH:mm:ssZ');
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
      timeZone:     this.effectiveTz,
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
