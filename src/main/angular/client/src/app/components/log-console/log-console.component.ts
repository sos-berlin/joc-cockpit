import {ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, inject, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild} from '@angular/core';
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
  /** Max lines per running-log poll (sent as `limit` to the running API). */
  limit?: number;
}

@Component({
  standalone: false,
  selector: 'app-log-console',
  templateUrl: './log-console.component.html',
  styleUrls: ['./log-console.component.scss', './log-console.toolbar.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LogConsoleComponent implements OnInit, OnChanges, OnDestroy {
  @Input() request: LogConsoleRequest = { type: 'controller' };

  allLines: ParsedLine[] = [];
  // Cached computed arrays — updated by private methods, never re-derived as getters.
  filteredLines: ParsedLine[] = [];
  contextBlocks: ContextBlock[] = [];
  levelCounts: Record<string, number> = { error: 0, warn: 0, info: 0, debug: 0, trace: 0, other: 0 };
  hasInfo  = false;
  hasWarn  = false;
  hasError = false;
  hasDebug = false;
  hasTrace = false;
  isLoading = false;
  isDownloading = false;
  isComplete = false;
  token: string | null = null;
  /** Timezone returned by the API in each response — the Controller/Agent's own timezone. */
  timeZone = '';
  /** preferences.logTimezone: true = convert to user profile tz; false = display in controller tz */
  logTimezone = false;
  /** User's profile timezone (preferences.zone), populated from sessionStorage in ngOnInit. */
  profileTz = '';
  /**
   * Per-window display mode override (Option A toggle).
   * null   = follow global `logTimezone` preference
   * 'profile'  = always convert to user profile tz (regardless of preference)
   * 'original' = show timestamps exactly in the Controller/Agent tz (no conversion)
   */
  _tzOverride: 'profile' | 'original' | null = null;

  // ── Level visibility checkboxes (display filter, not REST level) ──────────
  filters = { info: true, warn: true, error: true, debug: true, trace: true };

  // ── Global search (shared via LogSearchService) ────────────────────────────
  searchTerm = '';
  /** Debounced, trimmed, lowercased search term used for all computations. */
  private _committedSearchTerm = '';
  /** Subject that feeds the 300 ms debounce before committing a search. */
  private readonly _searchDebounce = new Subject<string>();
  readonly predefined = PREDEFINED_SEARCHES;
  predefinedOpen = false;

  // ── Filter term (controls which lines are visible) ─────────────────────────
  filterTerm = '';
  private _committedFilterTerm = '';
  private readonly _filterDebounce = new Subject<string>();
  filterRegexMode = false;
  filterRegexError = '';
  private _committedFilterRegexMode = false;
  private _compiledFilterRegExp: RegExp | null = null;
  /** When true, lines that MATCH the filter term are hidden; non-matching lines are shown. */
  reverseFilter = false;

  // ── Search term (highlights / navigates within visible lines) ─────────────────
  /** When true, lines that do NOT match the search term are highlighted and navigated. */
  reverseSearch = false;

  // ── Unified single input (routes to search or filter pipeline based on mode) ──────────
  /** 'search' = highlight/navigate visible lines; 'filter' = hide non-matching lines. */
  inputMode: 'search' | 'filter' = 'search';
  /** Bound to the single visible input element. Routed to the active pipeline. */
  unifiedTerm = '';
  /** Controls the mode-selector dropdown open state. */
  inputModeOpen = false;

  /** Active regex mode for the current input pipeline. */
  get unifiedRegexMode(): boolean {
    return this.inputMode === 'search' ? this.regexMode : this.filterRegexMode;
  }

  /** Active reverse flag for the current input pipeline. */
  get unifiedReverse(): boolean {
    return this.inputMode === 'search' ? this.reverseSearch : this.reverseFilter;
  }

  /** Active regex error for the current input pipeline. */
  get unifiedRegexError(): string {
    return this.inputMode === 'search' ? this.regexError : this.filterRegexError;
  }

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
  private pollTimer?: ReturnType<typeof setTimeout>;
  private readonly POLL_INTERVAL_MS = 3000;
  /** Per-text SafeHtml cache; cleared whenever the committed search term changes. */
  // Cache key = `${committedTerm}\x00${text}` so changing the search term naturally
  // invalidates all prior entries without a manual clear, and the same text+term pair
  // always returns the same SafeHtml reference — preventing unnecessary innerHTML rewrites.
  private readonly highlightCache = new Map<string, SafeHtml>();
  private readonly HIGHLIGHT_CACHE_MAX = 3000;
  /** Compiled search RegExp; reused across cache-miss calls while the search term is unchanged. */
  private _cachedHighlightRegExp: RegExp | null = null;
  private _cachedHighlightTerm = '';
  /** true = treat search term as a JavaScript regular expression. */
  regexMode = false;
  /** Validation error message when regexMode is on and the pattern is invalid; '' when valid. */
  regexError = '';
  private _committedRegexMode = false;
  /** Non-global RegExp for .test() checks in line filtering (regex mode only). */
  private _compiledSearchRegExp: RegExp | null = null;
  /** Sorted globalIdx array of lines matching the current search term — for prev/next navigation. */
  _searchMatchIdxs: number[] = [];
  /** 0-based index into _searchMatchIdxs for the currently active navigation position. */
  _searchJumpIdx: number | null = null;
  /** Per-occurrence navigation list — one entry per match token across all matching lines.
   *  Multiple entries share the same globalIdx when a term appears more than once in a line. */
  _searchMatchPositions: Array<{globalIdx: number; occurrenceInLine: number}> = [];
  private syslogResizeHandler?: () => void;
  /** Per-level: 0-based index of the last jumped-to occurrence in the DOM list. */
  private readonly levelJumpIndices = new Map<string, number>();
  /** Per-level: last navigation direction. Clicking the badge reuses this (default 'next'). */
  readonly levelLastDir = new Map<string, 'next' | 'prev'>();
  /** Per-level counts within the currently visible (filtered) lines — denominator for occurrence labels. */
  filteredLevelCounts: Record<string, number> = { error: 0, warn: 0, info: 0, debug: 0, trace: 0 };
  /** globalIdx set of lines matching the search term — eliminates per-line re-evaluation in template. */
  private _matchLineSet = new Set<number>();
  /** Per-level sorted globalIdx arrays from filteredLines — eliminates querySelectorAll during navigation. */
  private levelLineMap = new Map<string, number[]>();
  /** True while the user has a live text selection inside the log body — used to suppress
   *  DOM-destructive operations (markForCheck, followTail polls) that would clear the selection. */
  private _userSelecting = false;
  private _selectionChangeHandler?: () => void;

  // ── Client-side date range filter ─────────────────────────────────────────
  /** Bound to the date-picker inputs as ISO strings (YYYY-MM-DDTHH:mm). */
  dateFilterFromStr = '';
  dateFilterToStr   = '';
  /** Controls visibility of the date filter inline section. */
  showDateFilter = false;
  /** Debounce subject for date filter input changes (150ms). */
  private readonly _dateFilterDebounce = new Subject<void>();
  /** preferences.numOfNextLogLines: max lines returned per running-log poll request. */
  private numOfNextLogLines: number | undefined;

  constructor(
    private coreService: CoreService,
    private sanitizer: DomSanitizer,
    private logSearch: LogSearchService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Persist window size so the next system-log popup opens at the same size.
    this.syslogResizeHandler = () => {
      window.localStorage['syslog_window_wt'] = String(window.innerWidth);
      window.localStorage['syslog_window_ht'] = String(window.innerHeight);
    };
    window.addEventListener('resize', this.syslogResizeHandler);
    this.syslogResizeHandler(); // save initial size immediately

    // Track whether the user has an active text selection inside this log window.
    // Used to suppress DOM-destructive operations that would clear the selection.
    this._selectionChangeHandler = () => {
      const sel = window.getSelection();
      const body = this.logBodyRef?.nativeElement;
      if (!sel || sel.isCollapsed || !body) {
        this._userSelecting = false;
        return;
      }
      // Check if the selection anchor is inside our log body.
      const anchor = sel.anchorNode;
      this._userSelecting = anchor ? body.contains(anchor) : false;
    };
    document.addEventListener('selectionchange', this._selectionChangeHandler);

    // Debounced search commitment — only recomputes search highlights/navigation 300ms after typing stops.
    this.debounceSub = this._searchDebounce.pipe(debounceTime(300)).subscribe(term => {
      this.commitSearch(term);
    });
    // Debounced filter commitment — recomputes visible lines 300ms after typing stops.
    this.debounceSub.add(
      this._filterDebounce.pipe(debounceTime(300)).subscribe(term => {
        this.commitFilter(term);
      })
    );
    // Debounced date filter — recomputes filtered lines 150ms after last input change.
    this.debounceSub.add(
      this._dateFilterDebounce.pipe(debounceTime(150)).subscribe(() => {
        this.computeFilteredLines();
        this.computeContextBlocks();
        this.cdr.markForCheck();
      })
    );

    // Sync with global search state (apply immediately — another window already debounced).
    const current = this.logSearch.currentTerm;
    if (current) {
      this.searchTerm = current;
      this.unifiedTerm = current;
      this.commitSearch(current);
    }
    this.searchSub = this.logSearch.searchTerm$.subscribe(term => {
      if (this.searchTerm !== term) {
        this.searchTerm = term;
        this.unifiedTerm = term;
        this.commitSearch(term);
      }
    });

    // Read logTimezone preference and user profile timezone from session storage.
    if (sessionStorage['preferences']) {
      try {
        const prefs = JSON.parse(sessionStorage['preferences']);
        this.logTimezone = prefs.logTimezone === true;
        this.profileTz   = prefs.zone || '';
        if (prefs.numOfNextLogLines) {
          this.numOfNextLogLines = Number(prefs.numOfNextLogLines) || undefined;
        }
      } catch { /**/ }
    }
    if (!this.profileTz) {
      this.profileTz = this.coreService.getTimeZone();
    }

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
    this.clearPollTimer();
    this.searchSub?.unsubscribe();
    this.debounceSub?.unsubscribe();
    this._searchDebounce.complete();
    this._filterDebounce.complete();
    this._dateFilterDebounce.complete();
    if (this.syslogResizeHandler) {
      window.removeEventListener('resize', this.syslogResizeHandler);
    }
    if (this._selectionChangeHandler) {
      document.removeEventListener('selectionchange', this._selectionChangeHandler);
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
    this.unifiedTerm = value;
    if (this.inputMode === 'filter') {
      this.filterTerm = value;
      this.commitFilter(value);
    } else {
      this.searchTerm = value;
      this.commitSearch(value);
      this.logSearch.setTerm(value);
    }
  }

  // ── Unified input handlers ──────────────────────────────────────────────────────────

  onUnifiedTermChange(): void {
    if (this.inputMode === 'filter') {
      this.filterTerm = this.unifiedTerm;
      this._filterDebounce.next(this.unifiedTerm);
    } else {
      this.searchTerm = this.unifiedTerm;
      this._searchDebounce.next(this.unifiedTerm);
    }
  }

  clearUnifiedInput(): void {
    this.unifiedTerm = '';
    if (this.inputMode === 'filter') {
      this.filterTerm = '';
      this.commitFilter('');
    } else {
      this.searchTerm = '';
      this.commitSearch('');
      this.logSearch.clearTerm();
    }
  }

  onUnifiedRegexModeChange(): void {
    if (this.inputMode === 'filter') {
      this.filterRegexMode = !this.filterRegexMode;
      this.onFilterRegexModeChange();
    } else {
      this.regexMode = !this.regexMode;
      this.onRegexModeChange();
    }
  }

  toggleUnifiedReverse(): void {
    if (this.inputMode === 'filter') {
      this.toggleReverseFilter();
    } else {
      this.toggleReverseSearch();
    }
  }

  /**
   * Switches the input mode between 'search' and 'filter'.
   * Clears the previous pipeline's term and routes the current typed value
   * (unifiedTerm) to the new pipeline.
   */
  setInputMode(mode: 'search' | 'filter'): void {
    if (this.inputMode === mode) return;
    // Clear the pipeline we are leaving
    if (this.inputMode === 'filter') {
      this.filterTerm = '';
      this.commitFilter('');
    } else {
      this.searchTerm = '';
      this.commitSearch('');
      this.logSearch.clearTerm();
    }
    this.inputMode  = mode;
    // Search mode = highlight (all lines visible), Filter mode = context-block view.
    this.filterMode = (mode === 'filter');
    // Route any already-typed text to the new pipeline
    if (this.unifiedTerm) {
      if (mode === 'filter') {
        this.filterTerm = this.unifiedTerm;
        this.commitFilter(this.unifiedTerm);
      } else {
        this.searchTerm = this.unifiedTerm;
        this.commitSearch(this.unifiedTerm);
      }
    }
  }

  onFilterChange(): void {
    this.computeFilteredLines();
    this.computeContextBlocks();
  }

  onFilterTermChange(): void {
    this._filterDebounce.next(this.filterTerm);
  }

  clearFilterTerm(): void {
    this.filterTerm = '';
    this.commitFilter('');
  }

  onFilterRegexModeChange(): void {
    this._committedFilterTerm = ''; // force recommit even if term is unchanged
    this._searchJumpIdx = null;
    this.commitFilter(this.filterTerm);
  }

  toggleReverseFilter(): void {
    this.reverseFilter = !this.reverseFilter;
    this.computeFilteredLines();
    this.computeContextBlocks();
    this.cdr.markForCheck();
  }

  toggleReverseSearch(): void {
    this.reverseSearch = !this.reverseSearch;
    this.computeSearchMatches();
    this._safeMarkForCheck();
  }

  onDateFilterChange(): void {
    // Push to debounce — actual recompute happens 150ms after typing stops.
    this._dateFilterDebounce.next();
  }

  clearDateFilter(): void {
    this.dateFilterFromStr = '';
    this.dateFilterToStr   = '';
    this.computeFilteredLines();
    this.computeContextBlocks();
  }

  clearDateFrom(): void {
    this.dateFilterFromStr = '';
    this._dateFilterDebounce.next();
  }

  clearDateTo(): void {
    this.dateFilterToStr = '';
    this._dateFilterDebounce.next();
  }

  /**
   * Toggle the date filter panel.
   * Opening: shows the date input row.
   * Closing: hides the row AND clears any active filter so lines are never
   * silently hidden after the panel is dismissed.
   */
  toggleDateFilter(): void {
    if (this.showDateFilter) {
      this.showDateFilter = false;
      if (this.dateFilterFromStr || this.dateFilterToStr) {
        this.clearDateFilter();
      }
    } else {
      this.showDateFilter = true;
    }
  }

  onContextLinesChange(): void {
    this.computeContextBlocks();
  }

  // ── Filter commitment ────────────────────────────────────────────────────

  private commitFilter(raw: string): void {
    const trimmed = raw.trim();
    const term = this.filterRegexMode ? trimmed : trimmed.toLowerCase();

    if (this.filterRegexMode && trimmed) {
      try {
        new RegExp(trimmed);
        this.filterRegexError = '';
      } catch (e) {
        this.filterRegexError = (e as Error).message;
        this.cdr.markForCheck();
        return;
      }
    } else {
      this.filterRegexError = '';
    }

    if (this._committedFilterTerm === term && this._committedFilterRegexMode === this.filterRegexMode) return;
    this._committedFilterTerm      = term;
    this._committedFilterRegexMode = this.filterRegexMode;
    this._compiledFilterRegExp     = (this.filterRegexMode && term) ? new RegExp(term, 'i') : null;
    this._searchJumpIdx            = null;
    this.computeFilteredLines();
    this.computeContextBlocks();
    this._safeMarkForCheck();
  }

  // ── Search commitment & cache management ──────────────────────────────────

  private commitSearch(raw: string): void {
    const trimmed = raw.trim();
    const term = this.regexMode ? trimmed : trimmed.toLowerCase();

    // Validate regex pattern before committing — guard against SyntaxError.
    if (this.regexMode && trimmed) {
      try {
        new RegExp(trimmed);
        this.regexError = '';
      } catch (e) {
        this.regexError = (e as Error).message;
        this.cdr.markForCheck();
        return; // Do not commit invalid pattern
      }
    } else {
      this.regexError = '';
    }

    if (this._committedSearchTerm === term && this._committedRegexMode === this.regexMode) return;
    this._committedSearchTerm = term;
    this._committedRegexMode  = this.regexMode;
    this._searchJumpIdx       = null;
    // Build compiled RegExp for .test() in filtering — non-global to avoid lastIndex mutation.
    this._compiledSearchRegExp = (this.regexMode && term) ? new RegExp(term, 'i') : null;
    // Force highlight RegExp to be rebuilt in highlightText().
    // NOTE: highlightCache is now keyed by term+text, so no manual clear is needed —
    // the new term naturally produces new cache entries while old ones age out.
    this._cachedHighlightTerm = '';
    this.computeSearchMatches();
    // Use _safeMarkForCheck: the data update above is safe, but the resulting DOM
    // render (innerHTML rewrites) must not destroy an active text selection.
    this._safeMarkForCheck();
  }

  /** Called when the regex mode toggle is clicked — forces recommit with the new mode. */
  onRegexModeChange(): void {
    this._committedSearchTerm = ''; // force recommit even if term is unchanged
    // No manual cache clear needed — keyed by term+text, old entries age out naturally.
    this._searchJumpIdx = null;
    this.commitSearch(this.searchTerm);
  }

  // ── Filtered lines (level + filter + search) — computed into cached fields ──

  /** Returns true when line `l` matches the current committed filter term or regex. */
  private lineMatchesFilter(l: ParsedLine): boolean {
    const term = this._committedFilterTerm;
    if (!term) return true;
    if (this._committedFilterRegexMode) {
      return this._compiledFilterRegExp?.test(l.raw) ?? false;
    }
    return l.rawLower.includes(term);
  }

  /** Returns true when line `l` matches the current committed search term or regex. */
  private lineMatchesSearch(l: ParsedLine): boolean {
    const term = this._committedSearchTerm;
    if (!term) return true;
    if (this._committedRegexMode) {
      return this._compiledSearchRegExp?.test(l.raw) ?? false;
    }
    return l.rawLower.includes(term);
  }

  /** Counts non-overlapping occurrences of the committed search term inside line `l`. */
  private _countOccurrences(l: ParsedLine): number {
    const term = this._committedSearchTerm;
    if (!term) return 0;
    if (this._committedRegexMode && this._compiledSearchRegExp) {
      return (l.raw.match(new RegExp(this._compiledSearchRegExp.source, 'gi')) ?? []).length;
    }
    let count = 0, pos = 0;
    const hay = l.rawLower;
    const len = term.length || 1;
    while ((pos = hay.indexOf(term, pos)) !== -1) { count++; pos += len; }
    return count;
  }

  private computeFilteredLines(): void {
    // Convert user-entered times to controller tz for comparison.
    // When logTimezone=true the user sees/enters profile-tz times, so we offset them back.
    const fromCmp   = this.toControllerTzStr(this.dateFilterFromStr);
    const toCmp     = this.toControllerTzStr(this.dateFilterToStr);
    const hasFilter = !!this._committedFilterTerm;

    this.filteredLines = this.allLines.filter(l => {
      if (!this.levelVisible(l.level)) return false;
      if (hasFilter) {
        const matches = this.lineMatchesFilter(l);
        // reverseFilter: keep lines that do NOT match the filter term
        if (this.reverseFilter ? matches : !matches) return false;
      }
      if ((fromCmp || toCmp) && l.timestamp) {
        // Normalize: "2026-01-15T10:22:33,123" → "2026-01-15T10:22:33.123"
        const ts = l.timestamp.replace(',', '.');
        if (fromCmp && ts < fromCmp) return false;
        // '\uffff' suffix ensures the whole last minute/second is included
        // when the user's toCmp has no sub-minute/sub-second precision.
        if (toCmp && ts > toCmp + '\uffff') return false;
      }
      return true;
    });

    // ── Rebuild derived lookup structures from filteredLines ──────────────────
    const lm = new Map<string, number[]>();
    const fc: Record<string, number> = { error: 0, warn: 0, info: 0, debug: 0, trace: 0 };
    for (const l of this.filteredLines) {
      const key = l.level.toLowerCase();
      if (!lm.has(key)) lm.set(key, []);
      lm.get(key)!.push(l.globalIdx);
      if (key in fc) fc[key]++;
    }
    this.levelLineMap        = lm;
    this.filteredLevelCounts = fc;

    // Rebuild search matches against the updated visible line set.
    this.computeSearchMatches();
  }

  /** Rebuilds the search-match set and prev/next navigation arrays from the current filteredLines.
   *  Called by computeFilteredLines() and directly by commitSearch() (when filteredLines is unchanged). */
  private computeSearchMatches(): void {
    this._matchLineSet.clear();
    const term = this._committedSearchTerm;
    if (term) {
      for (const l of this.filteredLines) {
        const matches = this.lineMatchesSearch(l);
        // reverseSearch: navigate/highlight lines that do NOT contain the search term
        if (this.reverseSearch ? !matches : matches) {
          this._matchLineSet.add(l.globalIdx);
        }
      }
    }
    // Build sorted navigation index for prev/next search match.
    this._searchMatchIdxs = Array.from(this._matchLineSet).sort((a, b) => a - b);

    // Build per-occurrence positions for navigation.
    // In reverse mode non-matching lines have no occurrences, so one stop per line.
    // In normal mode a term appearing N times in a line contributes N stops.
    this._searchMatchPositions = [];
    if (term) {
      for (const gi of this._searchMatchIdxs) {
        const l = this.allLines[gi];
        if (!l) continue;
        if (this.reverseSearch) {
          this._searchMatchPositions.push({ globalIdx: gi, occurrenceInLine: 0 });
        } else {
          const cnt = this._countOccurrences(l);
          for (let i = 0; i < cnt; i++) {
            this._searchMatchPositions.push({ globalIdx: gi, occurrenceInLine: i });
          }
        }
      }
    }
  }

  /**
   * Converts a datetime-local input value (YYYY-MM-DDTHH:mm) from the display timezone
   * to the controller timezone for lexicographic comparison against `l.timestamp`.
   * When logTimezone=false the user enters controller-tz times directly — returned as-is.
   */
  private toControllerTzStr(inputStr: string): string {
    if (!inputStr) return '';
    const sourceTz = this.timeZone || this.request?.timeZone || '';
    if (this._useProfileTz && this.profileTz && sourceTz && this.profileTz !== sourceTz) {
      return moment.tz(inputStr, ['YYYY-MM-DDTHH:mm:ss', 'YYYY-MM-DDTHH:mm'], this.profileTz).tz(sourceTz).format('YYYY-MM-DDTHH:mm:ss');
    }
    return inputStr;
  }

  /**
   * Converts a raw log timestamp (controller tz) to a datetime-local input value
   * (YYYY-MM-DDTHH:mm) in the same timezone the user currently sees timestamps in.
   * Used when double-clicking a timestamp to populate the date filter.
   */
  private timestampToDatetimeLocal(raw: string): string {
    const iso = raw.replace(',', '.');
    const sourceTz = this.timeZone || this.request?.timeZone || '';
    if (sourceTz) {
      const m = moment.tz(iso, 'YYYY-MM-DDTHH:mm:ss.SSS', sourceTz);
      if (this._useProfileTz && this.profileTz) {
        return m.tz(this.profileTz).format('YYYY-MM-DDTHH:mm:ss');
      }
      return m.format('YYYY-MM-DDTHH:mm:ss');
    }
    return iso.slice(0, 19);
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
    const term = this._committedFilterTerm;
    if (!term) { this.contextBlocks = []; return; }

    // Build the pool: level + date filtered, but NOT filter-text filtered.
    // We need non-matching lines to be present so they can appear as context
    // around matching lines. filteredLines already strips non-matches, so
    // using it would leave only match lines → all consecutive → one giant block.
    const fromCmp = this.toControllerTzStr(this.dateFilterFromStr);
    const toCmp   = this.toControllerTzStr(this.dateFilterToStr);
    const pool = this.allLines.filter(l => {
      if (!this.levelVisible(l.level)) return false;
      if ((fromCmp || toCmp) && l.timestamp) {
        const ts = l.timestamp.replace(',', '.');
        if (fromCmp && ts < fromCmp) return false;
        if (toCmp && ts > toCmp + '\uffff') return false;
      }
      return true;
    });

    const matchPositions: number[] = [];
    for (let i = 0; i < pool.length; i++) {
      const matches = this.lineMatchesFilter(pool[i]);
      // reverseFilter: context blocks center on lines that do NOT match the filter term
      if (this.reverseFilter ? !matches : matches) matchPositions.push(i);
    }
    if (matchPositions.length === 0) { this.contextBlocks = []; return; }

    const windows: [number, number][] = [];
    for (const idx of matchPositions) {
      const start = Math.max(0, idx - this.contextLines);
      const end   = Math.min(pool.length - 1, idx + this.contextLines);
      if (windows.length > 0 && start <= windows[windows.length - 1][1] + 1) {
        windows[windows.length - 1][1] = Math.max(windows[windows.length - 1][1], end);
      } else {
        windows.push([start, end]);
      }
    }

    this.contextBlocks = windows.map(([start, end]) => ({
      startIdx: pool[start].globalIdx,
      lines: Array.from({ length: end - start + 1 }, (_, i) => ({
        line: pool[start + i],
        globalIdx: pool[start + i].globalIdx,
      })),
      collapsed: false,
    }));
  }

  isMatchLine(line: ParsedLine): boolean {
    return this._matchLineSet.has(line.globalIdx);
  }

  // ── Level stats ─────────────────────────────────────────────────────────────

  /**
   * Incrementally updates level stats for the newly appended chunk only.
   * Called with the slice [prevLength, allLines.length) — avoids O(n²) full re-scans.
   */
  private updateLevelStats(fromIdx: number): void {
    const c = this.levelCounts;
    for (let i = fromIdx; i < this.allLines.length; i++) {
      switch (this.allLines[i].level) {
        case 'ERROR': c['error']++; this.hasError = true; break;
        case 'WARN':  c['warn']++;  this.hasWarn  = true; break;
        case 'INFO':  c['info']++;  this.hasInfo  = true; break;
        case 'DEBUG': c['debug']++; this.hasDebug = true; break;
        case 'TRACE': c['trace']++; this.hasTrace = true; break;
        default:      c['other']++; break;
      }
    }
    // Trigger change detection by reassigning the object reference.
    this.levelCounts = { ...c };
    // Auto-default active line on first data arrival.
    if (this.activeLineIdx === null && this.allLines.length > 0) {
      this.activeLineIdx = 0;
    }
  }

  // ── Highlight ──────────────────────────────────────────────────────────────

  highlightText(text: string): SafeHtml {
    const cacheKey = this._committedSearchTerm + '\x00' + text;
    const cached = this.highlightCache.get(cacheKey);
    if (cached !== undefined) return cached;

    const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const term = this._committedSearchTerm;
    let result: SafeHtml;
    if (!term) {
      result = this.sanitizer.bypassSecurityTrustHtml(escaped);
    } else {
      if (this._cachedHighlightTerm !== term || !this._cachedHighlightRegExp) {
        if (this._committedRegexMode) {
          // Use the user's regex directly (already validated in commitSearch).
          this._cachedHighlightRegExp = new RegExp(term, 'gi');
        } else {
          const safeRe = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          this._cachedHighlightRegExp = new RegExp(safeRe, 'gi');
        }
        this._cachedHighlightTerm = term;
      }
      result = this.sanitizer.bypassSecurityTrustHtml(
        escaped.replace(this._cachedHighlightRegExp, '<mark class="log-search-match">$&</mark>')
      );
    }
    // Evict oldest entry when cache exceeds limit to bound memory usage.
    if (this.highlightCache.size >= this.HIGHLIGHT_CACHE_MAX) {
      this.highlightCache.delete(this.highlightCache.keys().next().value!);
    }
    this.highlightCache.set(cacheKey, result);
    return result;
  }

  // ── Order ID double-click detection ───────────────────────────────────────

  /**
   * On double-click inside the log body, detect if the cursor is within an
   * Order ID token and — if so — select the FULL token, copy it, and search.
   * Falls back to native browser selection when clicked outside an Order ID.
   */
  onLogBodyDblClick(event: MouseEvent): void {
    // Cancel any pending single-click activeLineIdx update so the DOM is not
    // re-rendered between the two clicks of the double-click gesture.
    clearTimeout(this._lineClickTimer);
    // ── Branch 1: timestamp double-click → populate date filter ─────────────
    const tsEl = (event.target as Element)?.closest('.log-ts') as HTMLElement | null;
    if (tsEl) {
      const lineEl = tsEl.closest('[data-lineidx]') as HTMLElement | null;
      if (lineEl) {
        const idx = Number(lineEl.getAttribute('data-lineidx'));
        const line = this.allLines[idx];
        if (line?.timestamp) {
          const inputVal = this.timestampToDatetimeLocal(line.timestamp);
          // Assignment rule: fill first empty → fill second empty → overwrite first
          if (!this.dateFilterFromStr) {
            this.dateFilterFromStr = inputVal;
          } else if (!this.dateFilterToStr) {
            this.dateFilterToStr = inputVal;
          } else {
            this.dateFilterFromStr = inputVal;
          }
          this.showDateFilter = true;
          this._dateFilterDebounce.next();
        }
      }
      return;
    }

    // ── Branch 2: Order ID double-click in .log-text ──────────────────────
    // All log lines now use [innerHTML] binding, so event.target reliably
    // lands on .log-text (or a <mark> inside it) in every mode.
    const textEl = (event.target as Element)?.closest('.log-text') as HTMLElement | null;
    if (!textEl) return;  // clicked on level badge, timestamp, or line padding — ignore

    const fullText = textEl.textContent || '';
    if (!fullText.includes('#')) return;  // no Order IDs possible in this line

    // Resolve the caret position using the click coordinates against the CURRENT
    // live DOM. This is more reliable than sel.getRangeAt(0) whose startContainer
    // may reference a stale (detached) text node if Angular re-rendered the line
    // (via the 250ms onLineClick timer) between the first click and the dblclick.
    let charOffset = 0;
    try {
      let container: Node | null = null;
      let nodeOffset = 0;
      if ((document as any).caretRangeFromPoint) {
        // Chromium / Safari / Edge
        const cr: Range = (document as any).caretRangeFromPoint(event.clientX, event.clientY);
        if (cr) { container = cr.startContainer; nodeOffset = cr.startOffset; }
      } else if ((document as any).caretPositionFromPoint) {
        // Firefox
        const cp = (document as any).caretPositionFromPoint(event.clientX, event.clientY);
        if (cp) { container = cp.offsetNode; nodeOffset = cp.offset; }
      }
      if (container && textEl.contains(container)) {
        const preRange = document.createRange();
        preRange.setStart(textEl, 0);
        preRange.setEnd(container, nodeOffset);
        charOffset = preRange.toString().length;
      } else {
        // Fallback: use the browser word-selection range (may be stale in rare cases)
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return;
        const r = sel.getRangeAt(0);
        const preRange = document.createRange();
        preRange.setStart(textEl, 0);
        preRange.setEnd(r.startContainer, r.startOffset);
        charOffset = preRange.toString().length;
      }
    } catch {
      return;
    }

    const match = extractOrderId(fullText, charOffset);

    // Not inside an Order ID — leave browser word selection as-is
    if (!match) return;

    // Override browser selection with the full Order ID span
    const domRange = buildRangeInElement(textEl, match.start, match.end);
    const sel = window.getSelection();
    if (domRange && sel) {
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
    this.unifiedTerm = match.id;
    this.inputMode = 'search';
    this.commitSearch(match.id);
    this.logSearch.setTerm(match.id);
  }

  copiedOrderId: string | null = null;
  activeLineIdx: number | null = null;
  private copyFeedbackTimer?: ReturnType<typeof setTimeout>;
  private _lineClickTimer?: ReturnType<typeof setTimeout>;

  /**
   * Deferred single-click handler for log lines.
   * The 250ms delay lets the browser fire `dblclick` first so we can cancel
   * the activeLineIdx update — preventing a mid-gesture re-render that would
   * destroy the text nodes the browser needs for its word-selection.
   */
  onLineClick(idx: number): void {
    clearTimeout(this._lineClickTimer);
    this._lineClickTimer = setTimeout(() => {
      this.activeLineIdx = idx;
      // Only trigger full change detection when the user has no active text selection.
      // If there is a selection, update the active class directly via DOM to avoid
      // re-evaluating [innerHTML] bindings which would recreate text nodes and clear it.
      const sel = window.getSelection();
      if (sel && sel.toString().length > 0) {
        const body = this.logBodyRef?.nativeElement;
        if (body) {
          body.querySelectorAll('.log-line--active').forEach(el => el.classList.remove('log-line--active'));
          body.querySelector(`[data-lineidx="${idx}"]`)?.classList.add('log-line--active');
        }
      } else {
        this.cdr.markForCheck();
      }
    }, 250);
  }

  private showCopyFeedback(id: string): void {
    this.copiedOrderId = id;
    if (this.copyFeedbackTimer) clearTimeout(this.copyFeedbackTimer);
    this.copyFeedbackTimer = setTimeout(() => { this.copiedOrderId = null; this.cdr.markForCheck(); }, 2000);
  }

  // ── Navigation ─────────────────────────────────────────────────────────────

  /**
   * Navigate within `level` using the given direction (or remembered direction if omitted).
   * Auto-enables the level filter if hidden, then defers DOM work one render cycle.
   */
  jumpToLevel(level: string, direction?: 'next' | 'prev'): void {
    const dir: 'next' | 'prev' = direction ?? (this.levelLastDir.get(level) ?? 'next');

    if (!this.levelVisible(level.toUpperCase() as ParsedLine['level'])) {
      // Re-enable the filter first — Angular needs one render cycle before we can query the DOM.
      (this.filters as any)[level] = true;
      this.computeFilteredLines();
      setTimeout(() => this._doJump(level, dir), 0);
      return;
    }

    this._doJump(level, dir);
  }

  /** Performs the actual scroll + state update. Split out so it can be deferred after re-render. */
  private _doJump(level: string, dir: 'next' | 'prev'): void {
    const el = this.logBodyRef?.nativeElement;
    if (!el) return;

    // Use the pre-built index (no querySelectorAll full scan) — O(log n) binary search.
    const lineIdxs = this.levelLineMap.get(level);
    if (!lineIdxs || lineIdxs.length === 0) return;

    let arrIdx: number;

    if (this.activeLineIdx !== null) {
      // Primary path: navigate relative to the currently highlighted line.
      const anchor = this.activeLineIdx;
      if (dir === 'next') {
        const found = lineIdxs.findIndex(gi => gi > anchor);
        arrIdx = found !== -1 ? found : 0;
      } else {
        let found = -1;
        for (let i = lineIdxs.length - 1; i >= 0; i--) {
          if (lineIdxs[i] < anchor) { found = i; break; }
        }
        arrIdx = found !== -1 ? found : lineIdxs.length - 1;
      }
    } else {
      const storedIdx = this.levelJumpIndices.get(level);
      if (storedIdx !== undefined) {
        // Subsequent navigation without an active line — step forward/back.
        arrIdx = dir === 'next'
          ? (storedIdx + 1) % lineIdxs.length
          : (storedIdx - 1 + lineIdxs.length) % lineIdxs.length;
      } else {
        // First-ever navigation — anchor to viewport midpoint (DOM read once only).
        const domTargets = Array.from(el.querySelectorAll<HTMLElement>(`.log-line-${level}`));
        const scrollMid = el.scrollTop + el.clientHeight / 2;
        if (dir === 'next') {
          const found = domTargets.findIndex(t => t.offsetTop >= scrollMid);
          arrIdx = found !== -1 ? found : 0;
        } else {
          let found = -1;
          for (let i = domTargets.length - 1; i >= 0; i--) {
            if (domTargets[i].offsetTop <= scrollMid) { found = i; break; }
          }
          arrIdx = found !== -1 ? found : domTargets.length - 1;
        }
      }
    }

    // Targeted attribute selector — no full DOM traversal.
    const targetGlobalIdx = lineIdxs[arrIdx];
    const targetEl = el.querySelector<HTMLElement>(`[data-lineidx="${targetGlobalIdx}"]`);
    targetEl?.scrollIntoView({ block: 'center', behavior: 'smooth' });

    // Reset other levels' counters so their indicators revert to totals.
    for (const k of Array.from(this.levelJumpIndices.keys())) {
      if (k !== level) this.levelJumpIndices.delete(k);
    }
    this.levelJumpIndices.set(level, arrIdx);
    this.levelLastDir.set(level, dir);
    this.activeLineIdx = targetGlobalIdx;
    this._safeMarkForCheck();
  }

  /** Returns `"N/total"` when navigation has started for `level`, otherwise `"total"`.
   *  Denominator uses filteredLevelCounts so it reflects only currently visible lines. */
  levelOccurrenceLabel(level: string): string {
    const total = this.filteredLevelCounts[level] ?? 0;
    const idx = this.levelJumpIndices.get(level);
    if (idx === undefined) return String(total);
    return `${idx + 1}/${total}`;
  }

  /** Returns the search match navigation label: "3/47" when navigating, "47" otherwise.
   *  The denominator counts individual match tokens (not lines). */
  get searchMatchLabel(): string {
    const total = this._searchMatchPositions.length;
    if (total === 0) return '0';
    if (this._searchJumpIdx === null) return String(total);
    return `${this._searchJumpIdx + 1}/${total}`;
  }

  /** Total number of individual search-term occurrences across all matching lines. */
  get searchMatchCount(): number { return this._searchMatchPositions.length; }

  /** Navigate to the next or previous individual search-term occurrence.
   *  A single line that contains the term twice counts as two separate stops. */
  jumpToSearchMatch(dir: 'next' | 'prev'): void {
    const el = this.logBodyRef?.nativeElement;
    const positions = this._searchMatchPositions;
    if (!el || positions.length === 0) return;

    let posIdx: number;
    // Determine whether the previous jump position still corresponds to the currently
    // active line. If the user clicked a different line since the last navigation,
    // activeLineIdx will differ from positions[_searchJumpIdx].globalIdx, so we
    // must re-anchor from activeLineIdx rather than blindly stepping from _searchJumpIdx.
    const jumpStillMatchesActiveLine =
      this._searchJumpIdx !== null &&
      positions[this._searchJumpIdx]?.globalIdx === this.activeLineIdx;

    if (jumpStillMatchesActiveLine) {
      // Continue stepping from where we left off.
      posIdx = dir === 'next'
        ? (this._searchJumpIdx! + 1) % positions.length
        : (this._searchJumpIdx! - 1 + positions.length) % positions.length;
    } else if (this.activeLineIdx !== null) {
      // First navigation, or user clicked a different line — re-anchor.
      const anchor = this.activeLineIdx;
      if (dir === 'next') {
        const found = positions.findIndex(p => p.globalIdx >= anchor);
        posIdx = found !== -1 ? found : 0;
      } else {
        let found = -1;
        for (let i = positions.length - 1; i >= 0; i--) {
          if (positions[i].globalIdx <= anchor) { found = i; break; }
        }
        posIdx = found !== -1 ? found : positions.length - 1;
      }
    } else {
      posIdx = dir === 'next' ? 0 : positions.length - 1;
    }

    const { globalIdx: targetGlobalIdx, occurrenceInLine } = positions[posIdx];

    // In filter mode: ensure the block containing this match is expanded.
    if (this.filterMode && this._committedFilterTerm) {
      for (const block of this.contextBlocks) {
        if (block.collapsed && block.lines.some(e => e.globalIdx === targetGlobalIdx)) {
          block.collapsed = false;
          break;
        }
      }
    }

    this._searchJumpIdx = posIdx;
    this.activeLineIdx  = targetGlobalIdx;
    this._safeMarkForCheck();
    // After Angular renders any newly-expanded blocks, focus the exact <mark> occurrence.
    setTimeout(() => {
      el.querySelectorAll<HTMLElement>('mark.log-search-match--focused')
        .forEach(m => m.classList.remove('log-search-match--focused'));
      const lineEl = el.querySelector<HTMLElement>(`[data-lineidx="${targetGlobalIdx}"]`);
      const marks  = lineEl?.querySelectorAll<HTMLElement>('mark.log-search-match');
      const markEl = marks?.[occurrenceInLine];
      if (markEl) {
        markEl.classList.add('log-search-match--focused');
        markEl.scrollIntoView({ block: 'center', behavior: 'smooth' });
      } else {
        lineEl?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    }, 0);
  }

  scrollToTop(): void {
    const el = this.logBodyRef?.nativeElement;
    if (el) el.scrollTop = 0;
  }

  scrollToBottom(): void {
    const el = this.logBodyRef?.nativeElement;
    if (el) setTimeout(() => { el.scrollTop = el.scrollHeight; }, 0);
  }

  toggleFollowTail(): void {
    this.followTail = !this.followTail;
    if (this.followTail) {
      this.scrollToBottom();
      this.scheduleNextPoll();
    } else {
      this.clearPollTimer();
    }
  }

  /** True when timestamps should be converted to the user profile tz; false = stay in Controller tz.
   *  Respects the per-window _tzOverride before falling back to the global logTimezone preference. */
  private get _useProfileTz(): boolean {
    if (this._tzOverride === 'profile')  return true;
    if (this._tzOverride === 'original') return false;
    return this.logTimezone;
  }

  /** Toggle between profile tz and original (Controller/Agent) tz for this window. */
  toggleTzMode(): void {
    if (this._useProfileTz) {
      // Currently showing profile tz → switch to original
      this._tzOverride = 'original';
    } else {
      // Currently showing original tz → switch to profile (or preference-driven if profile is set)
      this._tzOverride = this.profileTz ? 'profile' : null;
    }
    // Recompute date filter comparisons in case user has an active filter.
    this._dateFilterDebounce.next();
    this.cdr.markForCheck();
  }

  get displayTz(): string {
    const controllerTz = this.timeZone || this.request?.timeZone || '';
    if (this._useProfileTz) {
      return this.profileTz || controllerTz;
    }
    return controllerTz;
  }

  /** True when this window is currently showing timestamps in the original Controller/Agent tz. */
  get isOriginalTzMode(): boolean {
    return !this._useProfileTz;
  }

  /** True only when profile TZ and controller TZ are both set and differ — the toggle has no effect otherwise. */
  get showTzToggle(): boolean {
    const controllerTz = this.timeZone || this.request?.timeZone || '';
    return !!(controllerTz && this.profileTz && this.profileTz !== controllerTz);
  }

  formatTimestamp(raw: string): string {
    if (!raw) return raw;
    const iso = raw.replace(',', '.');
    // Source timezone: the timezone the Controller/Agent runs in, returned in response.timeZone.
    // Fall back to request.timeZone only before the first response arrives.
    const sourceTz = this.timeZone || this.request?.timeZone || '';
    if (sourceTz) {
      if (this._useProfileTz && this.profileTz) {
        // Profile tz mode: parse as Controller tz, then convert to user profile tz.
        return moment.tz(iso, 'YYYY-MM-DDTHH:mm:ss.SSS', sourceTz).tz(this.profileTz).format('YYYY-MM-DD HH:mm:ss');
      } else {
        // Original tz mode: display in Controller tz with UTC offset appended.
        return moment.tz(iso, 'YYYY-MM-DDTHH:mm:ss.SSS', sourceTz).format('YYYY-MM-DD HH:mm:ssZ');
      }
    }
    return iso.replace('T', ' ').slice(0, 23);
  }

  private static readonly LEVEL_BORDER: Partial<Record<ParsedLine['level'], string>> = {
    INFO:  'var(--blue)',
    WARN:  'var(--orange)',
    ERROR: 'var(--red)',
    DEBUG: 'var(--mangenta)',
    TRACE: 'var(--dimgrey)',
  };

  lineBorderColor(level: ParsedLine['level']): string {
    return LogConsoleComponent.LEVEL_BORDER[level] ?? 'transparent';
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
        this.scheduleNextPoll();
        this._safeMarkForCheck();
      },
      error: () => {
        this.isLoading = false;
        this._safeMarkForCheck();
      }
    });
  }

  loadMore(): void {
    if (!this.token || this.isLoading) return;
    this.isLoading = true;
    const apiUrl = this.getRunningApiUrl();
    const body: any = { logToken: this.token };
    const limit = this.request.limit ?? this.numOfNextLogLines;
    if (limit) body.limit = limit;
    this.coreService.post(apiUrl, body).subscribe({
      next: (res: any) => {
        if (this.destroyed) return;
        this.processLines(res.logLines || []);
        this.isComplete = res.isComplete === true;
        this.token = res.logToken || null;
        this.isLoading = false;
        if (this.followTail) this.scrollToBottom();
        this.scheduleNextPoll();
        this._safeMarkForCheck();
      },
      error: () => {
        this.isLoading = false;
        this._safeMarkForCheck();
      }
    });
  }

  download(): void {
    this.isDownloading = true;
    const type = this.request?.type || 'controller';
    const downloadUrl = this.getDownloadApiUrl();
    this.coreService.download(downloadUrl, this.buildRequest(), '', () => {
      this.isDownloading = false;
      this.cdr.markForCheck();
    });
  }

  reload(): void {
    this.clearPollTimer();
    this.allLines = [];
    this.filteredLines = [];
    this.contextBlocks = [];
    this.levelCounts         = { error: 0, warn: 0, info: 0, debug: 0, trace: 0, other: 0 };
    this.filteredLevelCounts = { error: 0, warn: 0, info: 0, debug: 0, trace: 0 };
    this.hasInfo = this.hasWarn = this.hasError = this.hasDebug = this.hasTrace = false;
    this.token = null;
    this.isComplete = false;
    this.activeLineIdx = null;
    this.levelJumpIndices.clear();
    this.levelLastDir.clear();
    this.levelLineMap.clear();
    this._matchLineSet.clear();
    this._searchMatchIdxs = [];
    this._searchMatchPositions = [];
    this._searchJumpIdx = null;
    this.fetchLog();
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  /** Calls markForCheck() immediately when no selection is active; otherwise defers
   *  using requestAnimationFrame to avoid destroying innerHTML text nodes mid-drag. */
  private _safeMarkForCheck(): void {
    if (this._userSelecting) {
      requestAnimationFrame(() => {
        if (!this.destroyed) this.cdr.markForCheck();
      });
    } else {
      this.cdr.markForCheck();
    }
  }

  private scheduleNextPoll(): void {
    this.clearPollTimer();
    if (this.followTail && !this.isComplete && this.token) {
      this.pollTimer = setTimeout(() => {
        // Do not poll while the user has an active text selection — the response
        // would trigger markForCheck() which destroys innerHTML text nodes.
        if (this._userSelecting) {
          this.scheduleNextPoll(); // reschedule and try again after another interval
          return;
        }
        if (!this.destroyed && this.followTail && !this.isComplete && this.token) {
          this.loadMore();
        }
      }, this.POLL_INTERVAL_MS);
    }
  }

  private clearPollTimer(): void {
    if (this.pollTimer !== undefined) {
      clearTimeout(this.pollTimer);
      this.pollTimer = undefined;
    }
  }

  private processLines(lines: string[]): void {
    const CHUNK_SIZE = 500;
    let offset = 0;

    const processChunk = () => {
      if (this.destroyed) return;
      const end = Math.min(offset + CHUNK_SIZE, lines.length);
      const prevLength = this.allLines.length;
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
      const isLastChunk = offset >= lines.length;
      // Incremental stats: only scan the newly appended lines.
      this.updateLevelStats(prevLength);
      this.computeFilteredLines();
      // Context blocks are O(n) full scan — only recompute on the final chunk.
      if (isLastChunk) {
        this.computeContextBlocks();
        // Only scroll once — on the final chunk — to avoid repeated layout reflows.
        if (this.followTail) this.scrollToBottom();
      } else {
        setTimeout(processChunk, 0);
      }
      this._safeMarkForCheck();
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
    if (r.limit)      req.limit      = r.limit;
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
    level:           'INFO',
    dateMode:        'relative' as 'relative' | 'specific',
    dateFrom:        '0d',
    dateFromDate:    null as Date | null,
    dateFromTime:    null as Date | null,
    dateTo:          '',
    dateToDate:      null as Date | null,
    dateToTime:      null as Date | null,
    timeZone:        '',
    numOfLines:      null,
    limit:           null
  };

  logRequest: LogConsoleRequest | null = null;
  isDownloading = false;
  preferencesTz = '';

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
        if (prefs.numOfLogLines)     this.form.numOfLines = Number(prefs.numOfLogLines)     || null;
        if (prefs.numOfNextLogLines) this.form.limit      = Number(prefs.numOfNextLogLines) || null;
      } catch { /**/ }
    }
    if (!this.preferencesTz) {
      this.preferencesTz = this.coreService.getTimeZone();
    }

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
        if (s.limit      !== undefined) this.form.limit      = s.limit;
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
    if (req.limit)         params.set('limit',         String(req.limit));
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
      limit:      this.form.limit,
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
      // Always send timeZone so the API interprets dateFrom/dateTo in the correct
      // timezone and so that displayTz is populated for timestamp rendering.
      timeZone:     this.effectiveTz || undefined,
      numOfLines:   this.form.numOfLines ? Number(this.form.numOfLines) : undefined,
      limit:        this.form.limit      ? Number(this.form.limit)      : undefined
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
