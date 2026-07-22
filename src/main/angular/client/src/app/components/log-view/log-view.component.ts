import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Inject, ViewChild} from '@angular/core';
import {isArray, isEmpty} from 'underscore';
import {NzFormatEmitEvent, NzTreeNode} from "ng-zorro-antd/tree";
import {AuthService} from "../guard";
import {CoreService} from '../../services/core.service';
import {POPOUT_MODAL_DATA, POPOUT_MODALS, PopoutData} from "../../services/popup.service";
import {NzModalService} from "ng-zorro-antd/modal";
import {HelpRenderResult, HelpService} from "../../services/help.service";

declare const $: any;
export let that: any;

@Component({
  standalone: false,
  selector: 'app-log-view',
  templateUrl: './log-view.component.html'
})
export class LogViewComponent implements AfterViewInit {
  preferences: any = {};
  loading = false;
  isLoading = false;
  isCancel = false;
  finished = false;
  errStatus = '';
  sheetContent = '';
  error: any;
  object: any = {
    checkBoxs: []
  };
  isMainLevel = false;
  isStdSuccessLevel = false;
  isFatalLevel = false;
  isErrorLevel = false;
  isWarnLevel = false;
  isTraceLevel = false;
  isStdErrLevel = false;
  isDetailLevel = false;
  isInfoLevel = false;
  isStdoutLevel = false;
  isDebugLevel = false;
  orderId: any;
  taskId: any;
  historyId: any;
  workflow: any;
  job: any;
  orderCanceller: any;
  taskCanceller: any;
  runningCanceller: any;
  taskRunningCancellers = new Map<string, any>();
  taskSessions = new Map<string, number>();
  taskLogCache = new Map<string, string>();
  scrolled = false;
  loaded = false;
  isExpandCollapse = false;
  taskCount = 1;
  controllerId = '';
  lastScrollTop = 0;
  delta = 20;
  logPanelWidth: number;
  dataObject: PopoutData;
  treeStructure: any[] = [];
  isChildren = false;
  nodes = [];
  _tzOverride: 'profile' | 'original' | null = null;
  readonly levelLastDir = new Map<string, 'next' | 'prev'>();
  private readonly levelJumpState = new Map<string, { idx: number; total: number }>();
  readonly levelTotalMap = new Map<string, number>();
  activeLineIdx: number | null = null;
  activeLevel: string | null = null;
  totalLineCount = 0;

  modeMenuOpen = false;
  contextMode = false;
  contextLines = 5;
  filterMatchCount = 0;
  private _injectedContextHeaders: HTMLElement[] = [];

  // ─── Search / Filter ───────────────────────────────────────────────────────
  inputMode: 'search' | 'filter' = 'search';
  unifiedTerm = '';
  regexMode = false;
  reverseSearch = false;
  reverseFilter = false;
  regexError = '';
  showDateFilter = false;
  dateFilterFromStr = '';
  dateFilterToStr = '';
  private _compiledRegExp: RegExp | null = null;
  private _searchPositions: Array<{lineEl: HTMLElement; occIdx: number}> = [];
  private _searchJumpIdx: number | null = null;
  _lastSearchDir: 'next' | 'prev' = 'next';
  private readonly _rawLineText = new Map<HTMLElement, string>();
  private _searchTimer: any = null;
  private _dateTimer: any = null;


  @ViewChild('dataBody', {static: false}) dataBody!: ElementRef;

  constructor(private authService: AuthService,private helpService: HelpService, public coreService: CoreService,private modal: NzModalService,
              @Inject(POPOUT_MODAL_DATA) public data: PopoutData) {

  }

  ngAfterViewInit(): void {
    this.dataBody.nativeElement.addEventListener('click', (e: MouseEvent) => {
      const line = (e.target as HTMLElement).closest('.log-line') as HTMLElement | null;
      if (line) {
        const allLines = Array.from(this.dataBody.nativeElement.querySelectorAll('.log-line')) as HTMLElement[];
        const idx = allLines.indexOf(line);
        if (idx !== -1) this.setActiveLine(idx, allLines);
      }
    });
  }

  private setActiveLine(idx: number, allLines?: HTMLElement[]): void {
    this.activeLineIdx = idx;
    const lines = allLines ?? (Array.from(this.dataBody.nativeElement.querySelectorAll('.log-line')) as HTMLElement[]);
    lines.forEach((l, i) => l.classList.toggle('log-line--active', i === idx));
    const activeLine = lines[idx];
    if (activeLine) {
      const levelClass = Array.from(activeLine.classList).find(c => c.startsWith('log-line-') && c !== 'log-line--active');
      this.activeLevel = levelClass ? levelClass.slice('log-line-'.length) : null;
    } else {
      this.activeLevel = null;
    }
  }

  scrollToTop(): void {
    const doc = POPOUT_MODALS['windowInstance']?.document;
    if (doc) (doc.scrollingElement || doc.body).scrollTop = 0;
  }

  scrollToBottom(): void {
    const doc = POPOUT_MODALS['windowInstance']?.document;
    if (doc) setTimeout(() => {
      const el = doc.scrollingElement || doc.body;
      el.scrollTop = el.scrollHeight;
    }, 0);
  }

  // ─── Search / Filter getters ───────────────────────────────────────────────
  get unifiedRegexMode(): boolean { return this.regexMode; }
  get unifiedReverse(): boolean {
    return this.inputMode === 'search' ? this.reverseSearch : this.reverseFilter;
  }
  get searchMatchCount(): number { return this._searchPositions.length; }
  get searchMatchLabel(): string {
    const t = this._searchPositions.length;
    if (!t) return '0';
    return this._searchJumpIdx === null ? String(t) : `${this._searchJumpIdx + 1}/${t}`;
  }

  // ─── Search / Filter methods ───────────────────────────────────────────────
  onUnifiedTermChange(): void {
    this.regexError = '';
    clearTimeout(this._searchTimer);
    this._searchTimer = setTimeout(() => this.commitUnified(), 300);
  }

  clearUnifiedInput(): void {
    this.unifiedTerm = '';
    this.regexError = '';
    clearTimeout(this._searchTimer);
    this.commitUnified();
  }

  toggleUnifiedReverse(): void {
    if (this.inputMode === 'search') {
      this.reverseSearch = !this.reverseSearch;
    } else {
      this.reverseFilter = !this.reverseFilter;
    }
    this.commitUnified();
  }

  onUnifiedRegexModeChange(): void {
    this.regexMode = !this.regexMode;
    this.commitUnified();
  }

  toggleModeMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.modeMenuOpen = !this.modeMenuOpen;
  }

  setInputMode(mode: 'search' | 'filter'): void {
    if (this.inputMode === mode) return;
    this._clearAllSearchAndFilter();
    this.inputMode = mode;
    this.contextMode = false;
    if (this.unifiedTerm.trim()) this.commitUnified();
  }

  onSearchEnter(): void {
    if (this.inputMode === 'search' && this.searchMatchCount > 0) {
      this.jumpToSearchMatch(this._lastSearchDir);
    }
  }

  private commitUnified(): void {
    const term = this.unifiedTerm.trim();
    if (this.regexMode && term) {
      try { new RegExp(term, 'i'); this.regexError = ''; }
      catch (e: any) { this.regexError = e.message; return; }
    } else {
      this.regexError = '';
    }
    if (term) {
      const src = this.regexMode ? term : term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      this._compiledRegExp = new RegExp(src, 'gi');
    } else {
      this._compiledRegExp = null;
    }
    if (this.inputMode === 'search') {
      this._clearSearchMarks();
      this._searchPositions = [];
      this._searchJumpIdx = null;
      if (this._compiledRegExp) this._applySearch();
    } else {
      this._applyFilter();
    }
    this._updateCaretState();
  }

  private _clearAllSearchAndFilter(): void {
    this._clearSearchMarks();
    this._clearContextHeaders();
    this._searchPositions = [];
    this._searchJumpIdx = null;
    this.filterMatchCount = 0;
    const el = this.dataBody?.nativeElement;
    if (el) {
      (Array.from(el.querySelectorAll('.log-line--filtered-out')) as HTMLElement[])
        .forEach(l => l.classList.remove('log-line--filtered-out'));
      (Array.from(el.querySelectorAll('.log-line-match')) as HTMLElement[])
        .forEach(l => l.classList.remove('log-line-match'));
    }
  }

  private _clearContextHeaders(): void {
    for (const h of this._injectedContextHeaders) {
      h.parentNode?.removeChild(h);
    }
    this._injectedContextHeaders = [];
    const el = this.dataBody?.nativeElement;
    if (el) {
      (Array.from(el.querySelectorAll('.log-line--block-collapsed')) as HTMLElement[])
        .forEach(l => l.classList.remove('log-line--block-collapsed'));
    }
  }

  private _updateCaretState(): void {
    const popupDoc = POPOUT_MODALS['windowInstance']?.document;
    if (popupDoc) {
      popupDoc.body.classList.toggle('log-search-active', !!this.unifiedTerm);
    }
  }

  private _clearSearchMarks(): void {
    const el = this.dataBody?.nativeElement;
    if (!el) return;
    (Array.from(el.querySelectorAll('.log-text[data-searched]')) as HTMLElement[]).forEach(textEl => {
      const raw = this._rawLineText.get(textEl);
      if (raw !== undefined) textEl.innerHTML = this._escHtml(raw);
      textEl.removeAttribute('data-searched');
    });
    (Array.from(el.querySelectorAll('.log-line-match')) as HTMLElement[])
      .forEach(l => l.classList.remove('log-line-match'));
  }

  private _applySearch(): void {
    const el = this.dataBody?.nativeElement;
    if (!el || !this._compiledRegExp) return;
    const lines = Array.from(el.querySelectorAll('.log-line')) as HTMLElement[];
    this._searchPositions = [];
    const regexp = this._compiledRegExp;
    for (const lineEl of lines) {
      const textEl = lineEl.querySelector('.log-text') as HTMLElement | null;
      if (!textEl) continue;
      if (!this._rawLineText.has(textEl)) {
        this._rawLineText.set(textEl, textEl.textContent || '');
      }
      const raw = this._rawLineText.get(textEl)!;
      regexp.lastIndex = 0;
      const allMatches: RegExpExecArray[] = [];
      let m: RegExpExecArray | null;
      while ((m = regexp.exec(raw)) !== null) {
        allMatches.push(m);
        if (m[0].length === 0) regexp.lastIndex++;
      }
      const hasMatch = allMatches.length > 0;
      const include = this.reverseSearch ? !hasMatch : hasMatch;
      if (!include) continue;
      lineEl.classList.add('log-line-match');
      if (!this.reverseSearch) {
        let html = '';
        let last = 0;
        let occ = 0;
        for (const match of allMatches) {
          html += this._escHtml(raw.slice(last, match.index));
          html += `<mark class="log-search-match">${this._escHtml(match[0])}</mark>`;
          this._searchPositions.push({lineEl, occIdx: occ++});
          last = match.index + match[0].length;
        }
        html += this._escHtml(raw.slice(last));
        textEl.setAttribute('data-searched', '1');
        textEl.innerHTML = html;
      } else {
        this._searchPositions.push({lineEl, occIdx: 0});
      }
    }
  }

  private _applyFilter(): void {
    const el = this.dataBody?.nativeElement;
    if (!el) return;

    this._clearContextHeaders();

    const lines = Array.from(el.querySelectorAll('.log-line')) as HTMLElement[];

    if (!this._compiledRegExp) {
      lines.forEach(l => { l.classList.remove('log-line--filtered-out'); l.classList.remove('log-line-match'); });
      this.filterMatchCount = 0;
      this._applyDateFilter();
      return;
    }

    // First pass: classify every line as match or non-match
    const matchIdxs: number[] = [];
    for (let i = 0; i < lines.length; i++) {
      const textEl = lines[i].querySelector('.log-text') as HTMLElement | null;
      const raw = textEl ? (textEl.textContent || '') : '';
      this._compiledRegExp.lastIndex = 0;
      const isMatch = this.reverseFilter ? !this._compiledRegExp.test(raw) : this._compiledRegExp.test(raw);
      lines[i].classList.toggle('log-line--filtered-out', !isMatch);
      lines[i].classList.toggle('log-line-match', isMatch);
      if (isMatch) matchIdxs.push(i);
    }
    this.filterMatchCount = matchIdxs.length;

    if (!this.contextMode || this.contextLines <= 0 || !matchIdxs.length) {
      this._applyDateFilter();
      return;
    }

    // Compute merged context windows (± contextLines around each match)
    const windows: [number, number][] = [];
    for (const idx of matchIdxs) {
      const s = Math.max(0, idx - this.contextLines);
      const e = Math.min(lines.length - 1, idx + this.contextLines);
      if (windows.length > 0 && s <= windows[windows.length - 1][1] + 1) {
        windows[windows.length - 1][1] = Math.max(windows[windows.length - 1][1], e);
      } else {
        windows.push([s, e]);
      }
    }

    // Un-hide context lines in each window
    for (const [s, e] of windows) {
      for (let j = s; j <= e; j++) lines[j].classList.remove('log-line--filtered-out');
    }

    // Inject collapsible block headers before the first line of each window
    const SVG_DOWN = `<svg viewBox="64 64 896 896" focusable="false" fill="currentColor" width="1em" height="1em" data-icon="down" aria-hidden="true"><path d="M884 256h-75c-5.1 0-9.9 2.5-12.9 6.6L512 654.2 227.9 262.6c-3-4.1-7.8-6.6-12.9-6.6h-75c-6.5 0-10.3 6.3-6.9 11.7l352.8 512a15.9 15.9 0 0026.2 0l352.8-512c3.4-5.4-.4-11.7-6.9-11.7z"></path></svg>`;
    const SVG_RIGHT = `<svg viewBox="64 64 896 896" focusable="false" fill="currentColor" width="1em" height="1em" data-icon="right" aria-hidden="true"><path d="M765.7 486.8L314.9 134.7A7.97 7.97 0 00302 141v77.3c0 4.9 2.3 9.6 6.1 12.6l360 281.1-360 281.1c-3.9 3-6.1 7.7-6.1 12.6V883c0 6.7 7.7 10.4 12.9 6.3l450.8-352.1a31.96 31.96 0 000-50.4z"></path></svg>`;
    const ownerDoc = el.ownerDocument;
    for (let bi = 0; bi < windows.length; bi++) {
      const [s, e] = windows[bi];
      const header = ownerDoc.createElement('div');
      header.className = 'log-context-header' + (bi > 0 ? ' log-context-header--sep' : '');
      header.innerHTML = `<i class="anticon anticon-down log-context-chevron">${SVG_DOWN}</i><span class="log-context-label-text">Lines ${s + 1}–${e + 1}</span>`;

      const blockLines = lines.slice(s, e + 1);
      header.addEventListener('click', () => {
        const collapsed = header.classList.toggle('log-context-header--collapsed');
        const iconEl = header.querySelector('.log-context-chevron') as HTMLElement;
        if (collapsed) {
          iconEl.className = 'anticon anticon-right log-context-chevron';
          iconEl.innerHTML = SVG_RIGHT;
        } else {
          iconEl.className = 'anticon anticon-down log-context-chevron';
          iconEl.innerHTML = SVG_DOWN;
        }
        blockLines.forEach(l => l.classList.toggle('log-line--block-collapsed', collapsed));
      });

      lines[s].parentNode?.insertBefore(header, lines[s]);
      this._injectedContextHeaders.push(header);
    }

    this._applyDateFilter();
  }

  toggleContextMode(): void {
    this.contextMode = !this.contextMode;
    this._applyFilter();
  }

  onContextLinesChange(): void {
    if (this.contextMode) this._applyFilter();
  }

  jumpToSearchMatch(dir: 'next' | 'prev'): void {
    if (!this._searchPositions.length) return;
    this._lastSearchDir = dir;
    let nextIdx: number;
    if (this._searchJumpIdx === null) {
      if (this.activeLineIdx !== null) {
        const allLines = Array.from(this.dataBody.nativeElement.querySelectorAll('.log-line')) as HTMLElement[];
        if (dir === 'next') {
          const found = this._searchPositions.findIndex(p => allLines.indexOf(p.lineEl) > this.activeLineIdx!);
          nextIdx = found !== -1 ? found : 0;
        } else {
          let found = -1;
          for (let i = this._searchPositions.length - 1; i >= 0; i--) {
            if (allLines.indexOf(this._searchPositions[i].lineEl) < this.activeLineIdx!) { found = i; break; }
          }
          nextIdx = found !== -1 ? found : this._searchPositions.length - 1;
        }
      } else {
        nextIdx = dir === 'next' ? 0 : this._searchPositions.length - 1;
      }
    } else {
      nextIdx = dir === 'next'
        ? (this._searchJumpIdx + 1) % this._searchPositions.length
        : (this._searchJumpIdx - 1 + this._searchPositions.length) % this._searchPositions.length;
    }
    this._searchJumpIdx = nextIdx;
    const pos = this._searchPositions[nextIdx];
    const allLines = Array.from(this.dataBody.nativeElement.querySelectorAll('.log-line')) as HTMLElement[];
    const lineIdx = allLines.indexOf(pos.lineEl);
    if (lineIdx !== -1) this.setActiveLine(lineIdx, allLines);
    setTimeout(() => {
      const el = this.dataBody?.nativeElement;
      if (!el) return;
      (Array.from(el.querySelectorAll('mark.log-search-match--focused')) as HTMLElement[])
        .forEach(mk => mk.classList.remove('log-search-match--focused'));
      const marks = Array.from(pos.lineEl.querySelectorAll<HTMLElement>('mark.log-search-match'));
      const mark = marks[pos.occIdx];
      if (mark) {
        mark.classList.add('log-search-match--focused');
        mark.scrollIntoView({ block: 'center', behavior: 'smooth' });
      } else {
        pos.lineEl.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    }, 0);
  }

  onDateFilterChange(): void {
    clearTimeout(this._dateTimer);
    this._dateTimer = setTimeout(() => this._applyDateFilter(), 150);
  }

  clearDateFrom(): void {
    this.dateFilterFromStr = '';
    this._applyDateFilter();
  }

  clearDateTo(): void {
    this.dateFilterToStr = '';
    this._applyDateFilter();
  }

  toggleDateFilter(): void {
    if (this.showDateFilter) {
      this.showDateFilter = false;
      if (this.dateFilterFromStr || this.dateFilterToStr) {
        this.dateFilterFromStr = '';
        this.dateFilterToStr = '';
        this._applyDateFilter();
      }
    } else {
      this.showDateFilter = true;
    }
  }

  private _applyDateFilter(): void {
    const el = this.dataBody?.nativeElement;
    if (!el) return;
    const from = this.dateFilterFromStr;
    const to = this.dateFilterToStr;
    if (!from && !to) {
      (Array.from(el.querySelectorAll('.log-line--date-out')) as HTMLElement[])
        .forEach(l => l.classList.remove('log-line--date-out'));
      return;
    }
    const lines = Array.from(el.querySelectorAll('.log-line')) as HTMLElement[];
    for (const lineEl of lines) {
      const tsEl = lineEl.querySelector('.log-ts') as HTMLElement | null;
      const raw = tsEl?.getAttribute('data-ts') || '';
      if (!raw) { lineEl.classList.remove('log-line--date-out'); continue; }
      const ts = this._normalizeTsForCompare(raw);
      const inRange = (!from || ts >= from) && (!to || ts <= to + '￿');
      lineEl.classList.toggle('log-line--date-out', !inRange);
    }
  }

  private _normalizeTsForCompare(raw: string): string {
    const m = raw.match(/^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2}:\d{2})/);
    return m ? `${m[1]}T${m[2]}` : raw;
  }

  private _escHtml(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  ngOnInit(): void {
    this.loaded = false;
    this.dataObject = POPOUT_MODALS['data'];
    if (!this.dataObject || !this.dataObject.controllerId) {
      setTimeout(() => {
        this.ngOnInit();
      }, 50);
      return;
    }
    if (sessionStorage['preferences']) {
      this.preferences = JSON.parse(sessionStorage['preferences']) || {};
    }
    let title = this.dataObject.modalName + ' - ';
    if (this.dataObject.workflow) {
      title += 'Workflow : ' + this.dataObject.workflow.substring(this.dataObject.workflow.lastIndexOf('/') + 1) + ' - ';
    }
    if (this.dataObject.orderId) {
      title += 'Order ID : ' + this.dataObject.orderId;
    } else {
      if (this.dataObject.job) {
        title += 'Job : ' + this.dataObject.job;
      }
    }

    POPOUT_MODALS['windowInstance'].document.title = title;
    this.controllerId = this.dataObject.controllerId;
    if (this.authService.scheduleIds) {
      const ids = JSON.parse(this.authService.scheduleIds);
      if (ids && ids.selected != this.controllerId) {
        const configObj = {
          controllerId: this.controllerId,
          accountName: this.authService.currentUserData
        };
        this.coreService.post('profile/prefs', configObj).subscribe({
          next: (res: any) => {
            if (res.profileItem) {
              this.preferences = JSON.parse(res.profileItem);
            }
            this.init();
          }, error: () => this.init()
        });
      } else {
        this.init();
      }
    } else {
      this.init();
    }
  }

  ngOnDestroy() {
    this.isCancel = true;
    this.cancelApiCalls();
    if (POPOUT_MODALS['windowInstance']) {
      try {
        POPOUT_MODALS['windowInstance'].removeEventListener('beforeunload', this.onUnload);
        POPOUT_MODALS['windowInstance'].removeEventListener('resize', this.onResize, false);
        POPOUT_MODALS['windowInstance'].removeEventListener('scroll', this.onScroll);
      } catch (e) {
        console.error(e);
      }
    }
  }

  private calculateHeight(): void {
    const $header = POPOUT_MODALS['windowInstance'].document.getElementById('upper-header')?.clientHeight || 80;
    this.dataBody.nativeElement.setAttribute('style', 'margin-top:' + $header + 'px');
  }

  private cancelApiCalls(): void {
    if (this.orderCanceller) {
      this.orderCanceller.unsubscribe();
    }
    if (this.taskCanceller) {
      this.taskCanceller.unsubscribe();
    }
    if (this.runningCanceller) {
      this.runningCanceller.unsubscribe();
    }
  }

  private calWindowSize(): void {
    if (POPOUT_MODALS['windowInstance']) {
      try {
        that = this;
        POPOUT_MODALS['windowInstance'].addEventListener('beforeunload', this.onUnload);
        POPOUT_MODALS['windowInstance'].addEventListener('resize', this.onResize, false);
        POPOUT_MODALS['windowInstance'].addEventListener('scroll', this.onScroll);
      } catch (e) {
        console.error(e);
      }
    }
  }

  private onUnload(event: any) {
    that.isCancel = true;
    that.cancelApiCalls();
    that.unsubscribeLogs();
    if (POPOUT_MODALS['windowInstance'].screenX != window.localStorage['log_window_x']) {
      window.localStorage['log_window_x'] = POPOUT_MODALS['windowInstance'].screenX;
      window.localStorage['log_window_y'] = POPOUT_MODALS['windowInstance'].screenY;
    }

    return null;
  }

  private onResize(): void {
    that.calculateHeight();
    window.localStorage['log_window_wt'] = POPOUT_MODALS['windowInstance'].innerWidth;
    window.localStorage['log_window_ht'] = POPOUT_MODALS['windowInstance'].innerHeight;
    window.localStorage['log_window_x'] = POPOUT_MODALS['windowInstance'].screenX;
    window.localStorage['log_window_y'] = POPOUT_MODALS['windowInstance'].screenY;
  }

  private onScroll(): void {
    const nowScrollTop = $(this).scrollTop();
    if (Math.abs(that.lastScrollTop - nowScrollTop) >= that.delta) {
      that.scrolled = nowScrollTop <= that.lastScrollTop;
      that.lastScrollTop = nowScrollTop;
    }
  }

  scrollBottom(): void {
    if (!this.scrolled) {
      $(POPOUT_MODALS['windowInstance']).scrollTop(this.dataBody.nativeElement.scrollHeight);
    }
  }

  init(): void {
    this.loaded = true;
    this.calWindowSize();
    this.addStylesToPopupWindow();
    this.injectLogViewStyles();

    if (!this.preferences.logFilter || this.preferences.logFilter.length === 0) {
      this.preferences.logFilter = {
        scheduler: true,
        main: true,
        success: true,
        stdout: true,
        stderr: true,
        info: true,
        debug: false,
        fatal: true,
        error: true,
        warn: true,
        trace: true,
        detail: false
      };
    } else if (this.preferences.logFilter) {
      if (!(this.preferences.logFilter.main === false || this.preferences.logFilter.main === true)) {
        this.preferences.logFilter.main = true;
        this.preferences.logFilter.success = true;
      }
    }
    this.loading = true;
    this.object.checkBoxs = this.preferences.logFilter;
    if (this.dataObject.historyId) {
      this.historyId = this.dataObject.historyId;
      this.orderId = this.dataObject.orderId;
      if (this.historyId !== this.coreService.logViewDetails.historyId) {
        this.coreService.logViewDetails.historyId = this.historyId;
        this.coreService.logViewDetails.expandedLogTree = [];
        this.coreService.logViewDetails.expandedLogPanel = new Set();
      }
      this.loadOrderLog();
    } else if (this.dataObject.taskId) {
      this.taskId = this.dataObject.taskId;
      this.loadJobLog();
    }

    function disableF5(e: any) {
      if ((e.which || e.keyCode) == 116) {
        that.reloadLog();
        e.preventDefault();
      }
    }

    setTimeout(() => {
      const self = this;
      $(POPOUT_MODALS['windowInstance'].document).on("keydown", disableF5);
      const panel = POPOUT_MODALS['windowInstance'].document.getElementById('property-panel');
      const close = POPOUT_MODALS['windowInstance'].document.getElementsByClassName('sidebar-close');
      const open = POPOUT_MODALS['windowInstance'].document.getElementsByClassName('sidebar-open');
      const transitionCSS = {transition: 'none'};
      if (panel) {
        $(panel).resizable({
          minWidth: 22,
          maxWidth: 768,
          handles: 'w',
          resize: (e, x) => {
            const wt = x.size.width;
            const transitionCSS = {transition: 'none'};
            $(panel).css({width: wt + 'px'});
            this.dataBody.nativeElement.setAttribute('style', 'margin-right: ' + wt + 'px');
            $(close).css({...transitionCSS, right: (wt - 2) + 'px'});
            localStorage['logPanelWidth'] = wt;
          }
        });
      }

      $(open).click(() => {
        self.logPanelWidth = localStorage['logPanelWidth'] ? parseInt(localStorage['logPanelWidth'], 10) : 300;
        this.dataBody.nativeElement.setAttribute('style', 'margin-right: ' + (self.logPanelWidth + 8) + 'px');
        $(close).css({...transitionCSS, right: (self.logPanelWidth - 2) + 'px'});

        $(panel).css({...transitionCSS, width: self.logPanelWidth + 'px'}).show();
        $(open).css({...transitionCSS, right: '-20px'});
        sessionStorage['isLogTreeOpen'] = true;
      });

      $(close).click(() => {
        const panelEl = POPOUT_MODALS['windowInstance'].document.getElementById('property-panel');
        const open = POPOUT_MODALS['windowInstance'].document.getElementsByClassName('sidebar-open');
        const transitionCSS = {transition: 'none'};

        if (panelEl && panelEl.getAttribute('data-mode') === 'help') {
          if (this.taskId) {
            panelEl.style.display = 'none';
            this.dataBody.nativeElement.setAttribute('style', 'margin-right: 10px');
            (close[0] as HTMLElement).style.display = 'none';
          } else {
            this.restoreTreeView(POPOUT_MODALS['windowInstance']);
          }
          panelEl.removeAttribute('data-mode');

        } else {
          this.dataBody.nativeElement.setAttribute('style', 'margin-right: 10px');
          $(panelEl).css(transitionCSS).hide();
          $(open).css({...transitionCSS, right: '0'});
          $(close).css({...transitionCSS, right: '-20px'});
          sessionStorage['isLogTreeOpen'] = false;
        }
      });      if (!this.taskId) {
        setTimeout(() => {
          if (sessionStorage['isLogTreeOpen'] == 'true' || sessionStorage['isLogTreeOpen'] == true) {
            $(open).click();
          }

        }, 500)
      } else {
        if (close && close[0] && close[0].style) {
          close[0].style.display = 'none';
          open[0].style.display = 'none';
        }
      }
    }, 5)
  }

  loadOrderLog(): void {
    this.workflow = this.dataObject.workflow;
    this.treeStructure = [];
    const order: any = {
      controllerId: this.controllerId,
      historyId: this.historyId
    };
    this.orderCanceller = this.coreService.post('order/log', order).subscribe({
      next: (res: any) => {
        if (res) {
          this.loading = false;
          this.checkDom(res, order);
        } else {
          this.loading = false;
          this.finished = true;
        }
        this.isLoading = false;
      }, error: (err) => {
        if (POPOUT_MODALS['windowInstance']) {
          POPOUT_MODALS['windowInstance'].document.getElementById('logs').innerHTML = '';
        }
        if (err.data && err.data.error) {
          this.error = err.data.error.message;
        } else {
          this.error = err.message;
        }
        this.errStatus = err.status;
        this.loading = false;
        this.finished = true;
        this.isLoading = false;
      }
    });
  }

  private checkDom(res: any, order: any): void {
    this.jsonToString(res);
    this.showHideTask(res.logEvents);
    if (!res.complete && !this.isCancel) {
      this.runningOrderLog({historyId: order.historyId, controllerId: this.controllerId, eventId: res.eventId});
    } else {
      this.finished = true;
    }
  }

  showHideTask(logs: any[]): void {
    let flag = false;
    for (let i in logs) {
      if (logs[i].logEvent === 'OrderProcessingStarted') {
        flag = true;
        break;
      }
    }
    if (!flag) {
      return;
    }

    const x: any = this.dataBody.nativeElement.querySelectorAll('.tx_order');
    for (let i = 0; i < x.length; i++) {
      const element = x[i];
      if (element.childNodes[0]) {
        element.childNodes[0].addEventListener('click', () => {
          this.expandTask(i, false);
        });
      }
    }

    if (!this.coreService.logViewDetails.expandedAllLog && this.coreService.logViewDetails.expandedLogPanel.size == 0) {
      if (x && x.length > 0) {
        const dom = x[x.length - 1].childNodes[0];
        if (dom) {
          dom.click();
        }
      }
    }
  }

  private expandTask(i: number, expand: boolean): void {
    if (this.unifiedTerm) return;
    if (!expand) {
      this.coreService.logViewDetails.expandedAllLog = false;
    }
    const domId = 'tx_log_' + (i + 1);
    const taskKey = 'task_' + (i + 1);
    const jobs: any = {};
    jobs.controllerId = this.controllerId;
    jobs.taskId = this.dataBody.nativeElement.querySelector('#tx_id_' + (i + 1))?.innerText;
    const a = this.dataBody.nativeElement.querySelector('#' + domId);
    const classList = this.dataBody.nativeElement.querySelector('#ex_' + (i + 1)).classList;
    if (a.classList.contains('hide') || classList.contains('down')) {
      if (this.taskRunningCancellers.has(taskKey)) {
        this.taskRunningCancellers.get(taskKey).unsubscribe();
        this.taskRunningCancellers.delete(taskKey);
      }

      const cachedLogs = this.taskLogCache.get(taskKey);
      if (cachedLogs) {
        const taskIdValue = this.dataBody.nativeElement.querySelector('#tx_id_' + (i + 1))?.innerText;
        this.dataBody.nativeElement.querySelector('#' + domId).innerHTML = cachedLogs;
        this.dataBody.nativeElement.querySelector('#ex_' + (i + 1)).classList.remove('down');
        this.dataBody.nativeElement.querySelector('#ex_' + (i + 1)).classList.add('up');
        this.coreService.logViewDetails.expandedLogPanel.add('#ex_' + (i + 1));
        a.classList.remove('hide');
        a.classList.add('show');
        return;
      }

      const currentSession = (this.taskSessions.get(taskKey) || 0) + 1;
      this.taskSessions.set(taskKey, currentSession);

      const taskIdValue = this.dataBody.nativeElement.querySelector('#tx_id_' + (i + 1))?.innerText;
      this.dataBody.nativeElement.querySelector('#' + domId).innerHTML = `<div id="tx_id_` + (i + 1) + `" class="hide">` + taskIdValue + `</div>`;

      const initialFetchSubscription = this.coreService.log('task/log', jobs, {
        responseType: 'text' as 'json',
        observe: 'response' as 'response'
      }).subscribe((res: any) => {
        if (res) {
          this.renderData(res.body, domId);
          this.dataBody.nativeElement.querySelector('#ex_' + (i + 1)).classList.remove('down');
          this.dataBody.nativeElement.querySelector('#ex_' + (i + 1)).classList.add('up');
          this.coreService.logViewDetails.expandedLogPanel.add('#ex_' + (i + 1));
          a.classList.remove('hide');
          a.classList.add('show');

          if (res.headers.get('x-log-complete').toString() === 'true') {
            const logContainer = this.dataBody.nativeElement.querySelector('#' + domId);
            if (logContainer) {
              this.taskLogCache.set(taskKey, logContainer.innerHTML);
            }
          } else if (!this.isCancel) {
            const obj = {
              controllerId: jobs.controllerId,
              taskId: res.headers.get('x-log-task-id') || jobs.taskId,
              eventId: res.headers.get('x-log-event-id')
            };
            this.runningTaskLog(obj, domId, taskKey, currentSession);
          }
        }
      });

      this.taskRunningCancellers.set(taskKey, initialFetchSubscription);
    } else {
      if (!expand) {
        if (this.taskRunningCancellers.has(taskKey)) {
          this.taskRunningCancellers.get(taskKey).unsubscribe();
          this.taskRunningCancellers.delete(taskKey);
        }

        this.dataBody.nativeElement.querySelector('#ex_' + (i + 1)).classList.remove('up');
        this.dataBody.nativeElement.querySelector('#ex_' + (i + 1)).classList.add('down');
        this.coreService.logViewDetails.expandedLogPanel.delete('#ex_' + (i + 1));
        a.classList.remove('show');
        a.classList.add('hide');
        const z = this.dataBody.nativeElement.querySelector('#tx_id_' + (i + 1))?.innerText;
        this.dataBody.nativeElement.querySelector('#' + domId).innerHTML = `<div id="tx_id_` + (i + 1) + `" class="hide">` + z + `</div>`;
      }
    }
  }

  loadJobLog(): void {
    this.job = this.dataObject.job;
    const jobs: any = {};
    jobs.controllerId = this.controllerId;
    jobs.taskId = this.taskId;
    this.orderCanceller = this.coreService.log('task/log', jobs, {
      responseType: 'text' as 'json',
      observe: 'response' as 'response'
    }).subscribe({
      next: (res: any) => {
        if (res) {
          if (res.body) {
            this.renderData(res.body, null);
          }
          if (res.headers.get('x-log-complete').toString() === 'false' && !this.isCancel) {
            const obj = {
              controllerId: this.controllerId,
              taskId: res.headers.get('x-log-task-id') || jobs.taskId,
              eventId: res.headers.get('x-log-event-id')
            };
            this.runningTaskLog(obj, '');
          } else {
            this.finished = true;
          }
        } else {
          this.loading = false;
        }
        this.isLoading = false;
      }, error: (err) => {
        this.dataBody.nativeElement.innerHTML = '';
        if (err.data && err.data.error) {
          this.error = err.data.error.message;
        } else {
          this.error = err.message;
        }
        this.errStatus = err.status;
        this.loading = false;
        this.finished = true;
        this.isLoading = false;
      }, complete: () => {
        POPOUT_MODALS['windowInstance'].document.getElementsByClassName('sidebar-close')[0].style.display = 'none';
        POPOUT_MODALS['windowInstance'].document.getElementsByClassName('sidebar-open')[0].style.display = 'none';
      }
    });
  }

  runningTaskLog(obj: any, domId: string, taskKey?: string, sessionId?: number): void {
    if (obj.eventId) {
      const subscription = this.coreService.post('task/log/running', obj).subscribe((res: any) => {
        if (taskKey && sessionId !== undefined) {
          const currentSession = this.taskSessions.get(taskKey);
          if (currentSession !== sessionId) {
            return;
          }
        }

        if (res) {
          if (res.log) {
            this.renderData(res.log, domId);
          }
          if (!res.complete && !this.isCancel) {
            if (res.eventId) {
              obj.eventId = res.eventId;
              obj.taskId = res.taskId;
            }
            this.runningTaskLog(obj, domId, taskKey, sessionId);
            if (res.log) {
              this.scrollBottom();
            }
          } else {
            this.finished = true;
            if (taskKey && domId) {
              const logContainer = this.dataBody.nativeElement.querySelector('#' + domId);
              if (logContainer) {
                this.taskLogCache.set(taskKey, logContainer.innerHTML);
              }
            }
          }
        }
      });

      if (taskKey) {
        this.taskRunningCancellers.set(taskKey, subscription);
      } else {
        this.runningCanceller = subscription;
      }
    }
  }

  runningOrderLog(obj: any): void {
    if (obj.eventId) {
      this.runningCanceller = this.coreService.post('order/log/running', obj).subscribe({
        next: (res: any) => {
          if (res) {
            if (res.logEvents) {
              this.jsonToString(res);
              this.showHideTask(res.logEvents);
              if (res.logEvents.length > 0) {
                this.scrollBottom();
              }
            }
            if (!res.complete && !this.isCancel) {
              if (res.eventId) {
                obj.eventId = res.eventId;
                this.runningOrderLog(obj);
              }
            } else {
              this.finished = true;
            }
          }
        }
      });
    }
  }

  private showHideCheckboxs(logLevel: string): void {
    if (!this.isMainLevel && logLevel === 'MAIN') {
      this.isMainLevel = true;
    }
    if (!this.isStdoutLevel && logLevel === 'STDOUT') {
      this.isStdoutLevel = true;
    }
    if (!this.isDebugLevel && logLevel === 'DEBUG') {
      this.isDebugLevel = true;
    }
    if (!this.isInfoLevel && logLevel === 'INFO') {
      this.isInfoLevel = true;
    }
    if (!this.isStdSuccessLevel && logLevel === 'SUCCESS') {
      this.isStdSuccessLevel = true;
    }
    if (!this.isStdErrLevel && logLevel === 'STDERR') {
      this.isStdErrLevel = true;
    }
    if (!this.isErrorLevel && logLevel === 'ERROR') {
      this.isErrorLevel = true;
    }
    if (!this.isWarnLevel && logLevel === 'WARN') {
      this.isWarnLevel = true;
    }
    if (!this.isTraceLevel && logLevel === 'TRACE') {
      this.isTraceLevel = true;
    }
    if (!this.isFatalLevel && logLevel === 'FATAL') {
      this.isFatalLevel = true;
    }
    if (!this.isDetailLevel && logLevel === 'DETAIL') {
      this.isDetailLevel = true;
    }
  }

  jsonToString(json: any): void {
    if (!json) {
      return;
    }
    const dt = json.logEvents;
    let col = '';
    for (let i = 0; i < dt.length; i++) {
      if (dt[i].position.match(/\/branch/)) {
        dt[i].position = dt[i].position.replace(/(\/branch)/, '/fork+branch');
      }
      let flag = false;
      if (dt[i].logEvent !== 'OrderForked' && dt[i].logEvent !== 'OrderJoined') {
        for (let x in this.treeStructure) {
          if (this.treeStructure[x]['position'] == dt[i].position && this.treeStructure[x]['job'] == dt[i].job
            && (this.treeStructure[x]['expectNotices'] == dt[i].expectNotices && this.treeStructure[x]['postNotice'] == dt[i].postNotice
              && this.treeStructure[x]['consumeNotices'] == dt[i].consumeNotices && this.treeStructure[x]['moved'] == dt[i].moved
              && this.treeStructure[x]['question'] == dt[i].question && this.treeStructure[x]['cycle'] == dt[i].cycle && this.treeStructure[x]['attached'] == dt[i].attached)) {
            if (this.treeStructure[x]['orderId'] == dt[i].orderId) {
              if (dt[i].label) {
                this.treeStructure[x]['label'] = dt[i].label;
              }
              if (dt[i].logLevel) {
                this.treeStructure[x]['logLevel'] = dt[i].logLevel
              }
              flag = true;
              break;
            }
          }
        }
      }
      if (!flag) {
        if (/\d+[.]\w/gm.test(dt[i].orderId) && !/\d+[.]\w/gm.test(dt[i].position)) {
          const pos = dt[i].orderId.substring(dt[i].orderId.lastIndexOf('.') + 1);
          if (pos) {
            dt[i].name1 = pos;
          }
        }
        this.treeStructure.push(dt[i]);
      }

      const div = POPOUT_MODALS['windowInstance']?.document.createElement('div');
      if (!div) {
        return;
      }

      div.className = (dt[i].name1 ? (dt[i].position + '.' + dt[i].name1) : dt[i].position) + ' log_line';
      if (dt[i].logLevel === 'INFO') {
        div.className += ' log_info';
        if (!this.object.checkBoxs.info) {
          div.className += ' hide-block';
        }
      } else if (dt[i].logLevel === 'MAIN') {
        if (dt[i].logEvent !== 'OrderProcessingStarted') {
          div.className += ' log_main';
          div.className += ' main';
          if (!this.object.checkBoxs.main) {
            div.className += ' hide-block';
          }
        }
      } else if (dt[i].logLevel === 'SUCCESS') {
        div.className += ' log_success';
        div.className += ' success';
        if (!this.object.checkBoxs.success) {
          div.className += ' hide-block';
        }
      } else if (dt[i].logLevel === 'STDOUT') {
        div.className += ' log_stdout';
        div.className += ' stdout';
        if (!this.object.checkBoxs.stdout) {
          div.className += ' hide-block';
        }
      } else if (dt[i].logLevel === 'DEBUG') {
        div.className += ' log_debug';
        if (!this.object.checkBoxs.debug) {
          div.className += ' hide-block';
        }
      } else if (dt[i].logLevel === 'STDERR') {
        div.className += ' log_stderr';
        div.className += ' stderr';
        if (!this.object.checkBoxs.stderr) {
          div.className += ' hide-block';
        }
      } else if (dt[i].logLevel === 'WARN') {
        div.className += ' log_warn';
        div.className += ' warn';
        if (!this.object.checkBoxs.warn) {
          div.className += ' hide-block';
        }
      } else if (dt[i].logLevel === 'ERROR') {
        div.className += ' log_error';
        div.className += ' error';
        if (!this.object.checkBoxs.error) {
          div.className += ' hide-block';
        }
      } else if (dt[i].logLevel === 'TRACE') {
        div.className += ' log_trace';
        div.className += ' trace';
        if (!this.object.checkBoxs.trace) {
          div.className += ' hide-block';
        }
      } else if (dt[i].logLevel === 'FATAL') {
        div.className += ' log_fatal';
        div.className += ' fatal';
        if (!this.object.checkBoxs.fatal) {
          div.className += ' hide-block';
        }
      } else if (dt[i].logLevel === 'DETAIL') {
        div.className += ' log_detail';
        div.className += ' detail';
        if (!this.object.checkBoxs.detail) {
          div.className += ' hide-block';
        }
      } else if (dt[i].logLevel === 'SUCCESS') {
        div.className += ' log_success';
      } else if (dt[i].logLevel === 'ERROR') {
        div.className += ' log_error';
      }
      this.showHideCheckboxs(dt[i].logLevel);

      const rawDt = dt[i].controllerDatetime || '';
      const datetime = this._useProfileTz
        ? (this.coreService.getLogDateFormat(rawDt, this.preferences.zone) || rawDt).replace('T', ' ').slice(0, 19)
        : this.formatOriginalTs(rawDt);
      col = dt[i].logEvent + ' ' + (dt[i].orderId ? ('id=' + dt[i].orderId) : '');
      if (dt[i].job) {
        col += ', <b>Job=' + dt[i].job + '</b>';
      }
      if (dt[i].label) {
        col += ', label=' + dt[i].label;
      }
      if (dt[i].position || dt[i].position == 0) {
        col += ', pos=' + dt[i].position;
      }

      if (dt[i].priority !== undefined && dt[i].priority !== null) {
        col += ', prio=' + this.getPriorityLabel(dt[i].priority);
      }
      if (dt[i].agentDatetime) {
        col += ', Agent' + '(';
        if (dt[i].agentUrl) {
          col += 'url=' + dt[i].agentUrl + ', ';
        }
        if (dt[i].agentName) {
          col += 'name=' + dt[i].agentName + ', ';
        }
        if (dt[i].subagentClusterId) {
          col += 'clusterId=' + dt[i].subagentClusterId + ', ';
        }
        if (dt[i].agentDatetime) {
          const dateTime = this.preferences.logTimezone ? this.coreService.getLogDateFormat(dt[i].agentDatetime, this.preferences.zone) : dt[i].agentDatetime;
          col += 'time=' + dateTime;
        }
        col += ')';
      }
      if (dt[i].error && !isEmpty(dt[i].error)) {
        col += ', Error (status=' + dt[i].error.errorState;
        if (dt[i].error.errorCode) {
          col += ', code=' + dt[i].error.errorCode;
        }
        if (dt[i].error.errorReason) {
          col += ', reason=' + dt[i].error.errorReason;
        }
        if (dt[i].error.errorText) {
          col += ', msg=' + dt[i].error.errorText;
        }
        col += ')';
      }
      if (dt[i].returnCode != null && dt[i].returnCode != undefined) {
        col += ', returnCode=' + dt[i].returnCode;
      }
      if (dt[i].logEvent && dt[i].logEvent.match(/Lock/)) {
        if (dt[i].lock) {
          col += ', Lock' + '(';
          if (dt[i].lock.lockId) {
            col += 'id=' + dt[i].lock.lockId;
          }
          if (dt[i].lock.label) {
            col += ', label=' + dt[i].lock.label;
          }
          if (dt[i].lock.limit) {
            col += ', limit=' + dt[i].lock.limit;
          }
          if (dt[i].lock.count) {
            col += ', count=' + dt[i].lock.count;
          }
          if (dt[i].lock.lockState) {
            if (dt[i].lock.lockState.orderIds) {
              col += ', orderIds=' + dt[i].lock.lockState.orderIds;
            }
            if (dt[i].lock.lockState.queuedOrderIds) {
              col += ', queuedOrderIds=' + dt[i].lock.lockState.queuedOrderIds;
            }
          }
          col += ')';
        }
        if (dt[i].msg) {
          col += ': ' + dt[i].msg;
        }
      }
      if (dt[i].logEvent === 'OrderCaught' && dt[i].caught) {
        col += ', Caught(cause=' + dt[i].caught.cause + ')';
      } else if (dt[i].logEvent === 'OrderRetrying' && dt[i].retrying) {
        const delayedUntil = (this.preferences.logTimezone && dt[i].retrying.delayedUntil) ? this.coreService.getLogDateFormat(dt[i].retrying.delayedUntil, this.preferences.zone) : dt[i].retrying.delayedUntil;
        col += ', Retrying(delayedUntil=' + delayedUntil;
        if (dt[i].retrying.label) {
          col += ', label=' + dt[i].retrying.label;
        }
        col += ')';
      } else if (dt[i].logEvent === 'OrderSleeping' && dt[i].sleep) {
        const until = (this.preferences.logTimezone && dt[i].sleep.until) ? this.coreService.getLogDateFormat(dt[i].sleep.until, this.preferences.zone) : dt[i].sleep.until;
        col += ', until=' + until;
      } else if (dt[i].logEvent === 'OrderNoticesExpected' && dt[i].expectNotices) {
        col += ', Waiting for';
        for (let x in dt[i].expectNotices.waitingFor) {
          col += ' ExpectNotice(board=' + dt[i].expectNotices.waitingFor[x].boardName + ', id=' + dt[i].expectNotices.waitingFor[x].id + ')';
          if (parseInt(x) < dt[i].expectNotices.waitingFor.length - 1)
            col += ',';
        }
      } else if (dt[i].logEvent === 'OrderNoticesRead' && dt[i].expectNotices) {
        col += ', ExpectNotices(' + dt[i].expectNotices.consumed + ')';
      } else if (dt[i].logEvent === 'OrderNoticePosted' && dt[i].postNotice) {
        col += ', PostNotice(board=' + dt[i].postNotice.boardName + ', id=' + dt[i].postNotice.id + ', endOfLife=' + dt[i].postNotice.endOfLife + ')';
      } else if (dt[i].logEvent === 'OrderNoticesConsumptionStarted' && dt[i].consumeNotices) {
        col += ', Consuming';
        for (let x in dt[i].consumeNotices.consuming) {
          col += ' ExpectNotice(board=' + dt[i].consumeNotices.consuming[x].boardName + ', id=' + dt[i].consumeNotices.consuming[x].id + ')';
          if (parseInt(x) < dt[i].consumeNotices.consuming.length - 1)
            col += ',';
        }
      } else if (dt[i].logEvent === 'OrderNoticesConsumed' && dt[i].consumeNotices && dt[i].consumeNotices.consumed == false) {
        col += ' (<span class="log_error">Failed</span>)';
      }
      if (dt[i].logEvent === 'OrderFinished' && dt[i].returnMessage) {
        col += ', returnMessage=' + dt[i].returnMessage;
      } else if (dt[i].logEvent === 'OrderSuspended' && dt[i].stopped && (dt[i].stopped.job || dt[i].stopped.instruction)) {
        col += ', Stopped(' + (dt[i].stopped.job ? ('job=' + dt[i].stopped.job) : ('instruction=' + dt[i].stopped.instruction)) + ')';
      } else if (dt[i].logEvent === 'OrderResumed' && dt[i].resumed && (dt[i].resumed.job || dt[i].resumed.instruction)) {
        if (dt[i].resumed.job) {
          col += ', Job=' + dt[i].resumed.job;
        } else {
          col += ', Instruction=' + dt[i].resumed.instruction;
        }
      }
      if (dt[i].logEvent === 'OrderMoved' && dt[i].moved && dt[i].moved.skipped && dt[i].moved.to) {
        col += ', Skipped(' + (dt[i].moved.skipped.instruction.job ? ('job=' + dt[i].moved.skipped.instruction.job) : ('instruction=' + dt[i].moved.skipped.instruction.instruction)) + ', reason=' + dt[i].moved.skipped.reason + '). Moved To(pos=' + dt[i].moved.to.position + ')';
      } else if (dt[i].logEvent === 'OrderMoved' && dt[i].moved?.waitingForAdmission?.entries) {
        col += ', waitingForAdmission(' + dt[i].moved.waitingForAdmission.entries + ')';
      } else if (dt[i].logEvent === 'OrderStarted' && dt[i].arguments) {
        col += ', arguments(';
        let arr: any = Object.entries(dt[i].arguments).map(([k1, v1]) => {

          if (v1 && typeof v1 == 'object') {
            if (isArray(v1)) {
              v1.forEach((list, index) => {
                v1[index] = Object.entries(list).map(([k1, v1]) => {
                  return {name: k1, value: v1};
                });
              });
            } else {
              v1 = Object.entries(v1).map(([k1, v1]) => {
                return {name: k1, value: v1};
              });
            }
          }
          return {name: k1, value: v1};
        });

        col = this.coreService.createLogOutputString(arr, col);
        col += ')';
      } else if (dt[i].logEvent === 'OrderProcessed' && dt[i].returnValues) {
        col += ', returnValues(';
        let arr: any = Object.entries(dt[i].returnValues).map(([k1, v1]) => {
          if (v1 && typeof v1 == 'object') {
            v1 = Object.entries(v1).map(([k1, v1]) => {
              return {name: k1, value: v1};
            });
          }
          return {name: k1, value: v1};
        });
        col = this.coreService.createLogOutputString(arr, col);
        col += ')';
      } else if (dt[i].logEvent === 'OrderAttached' && dt[i].attached?.waitingForAdmission?.entries) {
        col += ', waitingForAdmission(' + dt[i].attached.waitingForAdmission.entries + ')';
      } else if (dt[i].logEvent === 'OrderPrompted' && dt[i].question) {
        col += ', question(' + dt[i].question + ')';
      } else if (dt[i].logEvent === 'OrderCyclingPrepared' && dt[i].cycle.prepared && (dt[i].cycle.prepared.next || dt[i].cycle.prepared.end)) {
        if (dt[i].cycle.prepared.next) {
          col += ', next(' + dt[i].cycle.prepared.next + ')';
        }
        if (dt[i].cycle.prepared.end) {
          col += ', end(' + dt[i].cycle.prepared.end + ')';
        }
      } else if (dt[i].orderAdded) {
        col += `, OrderAdded(id=${dt[i].orderAdded.orderId}, workflow=${dt[i].orderAdded.workflowPath}, arguments(`;
        if (dt[i].orderAdded.arguments) {
          const arr = this.flattenArgumentsToStrings(dt[i].orderAdded.arguments);
          col = this.coreService.createLogOutputString(arr, col);
        }

        col += '))';
      }

      const levelLower = (dt[i].logLevel || 'MAIN').toLowerCase();
      const levelColors: {[key: string]: string} = {
        'main': '#696969', 'info': '#666666', 'success': 'green',
        'stdout': 'transparent', 'debug': '#006400', 'stderr': 'red',
        'warn': 'tomato', 'error': 'red', 'trace': '#a0a0a0',
        'fatal': 'red', 'detail': '#0000ff'
      };
      const borderColor = levelColors[levelLower] || 'transparent';

      if (dt[i].logEvent === 'OrderProcessingStarted') {
        const cls = !this.object.checkBoxs.main ? ' hide-block' : '';
        const x = `<div class="main log_main log-line log-line-main${cls}" style="border-left-color:#696969"><span class="tx_order"><i id="ex_${this.taskCount}" class="cursor caret down"></i></span><span class="log-ts" data-ts="${rawDt}">${datetime}</span><span class="log-level log-level-main">MAIN</span><!--container--><span class="log-text">${col}</span></div><div id="tx_log_${this.taskCount}" class="hide inner-log-m"><div id="tx_id_${this.taskCount}" class="hide">${dt[i].taskId}</div><div class="tx_data_${this.taskCount}"></div></div>`;
        this.taskCount++;
        div.innerHTML = x;
      } else {
        div.className += ` log-line log-line-${levelLower}`;
        div.setAttribute('style', `border-left-color:${borderColor}`);
        div.innerHTML = `<span class="log-ts" data-ts="${rawDt}">${datetime}</span><span class="log-level log-level-${levelLower}">${dt[i].logLevel || 'MAIN'}</span><!--container--><span class="log-text">${col}</span>`;
      }

      if (POPOUT_MODALS['windowInstance']?.document.getElementById('logs')) {
        const logsContainer = POPOUT_MODALS['windowInstance']?.document.getElementById('logs');
        const uniqueId = `${dt[i].controllerDatetime}-${dt[i].orderId}-${dt[i].logEvent}-${dt[i].position}`;
        const existingDiv = logsContainer.querySelector(`[data-log-id="${uniqueId}"]`);

        if (!existingDiv) {
          div.setAttribute('data-log-id', uniqueId);
          logsContainer.appendChild(div);
        }
      }

    }

    if (this.taskCount > 1) {
      this.isExpandCollapse = true;
    }

    let obj = {
      treeStructure: this.treeStructure,
      isChildren: this.isChildren
    };
    this.nodes = this.coreService.createTreeStructure(obj);
    this.checkAndExpand();
    this.isChildren = obj.isChildren;
    this.loading = false;
  }

   flattenArgumentsToStrings(obj: any): any[] {
    const result: any[] = [];

    for (const [key, val] of Object.entries(obj)) {
      if (typeof val === 'object' && val !== null) {
        result.push({
          name: key,
          value: JSON.stringify(val)
        });
      } else {
        result.push({
          name: key,
          value: val
        });
      }
    }

    return result;
  }


  private getPriorityLabel(prio: number): string {
    switch (prio) {
      case 20000:   return 'HIGH';
      case 10000:    return 'ABOVE NORMAL';
      case 0:       return 'NORMAL';
      case -10000:   return 'BELOW NORMAL';
      case -20000:  return 'LOW';
      default:      return prio.toString();
    }
  }
  renderData(res: any, domId: string | null): void {
    this.loading = false;
    this.calculateHeight();
    const levelFlags = {
      isFatalLevel: this.isFatalLevel,
      isWarnLevel: this.isWarnLevel,
      isTraceLevel: this.isTraceLevel,
      isStdErrLevel: this.isStdErrLevel,
      isInfoLevel: this.isInfoLevel,
      isStdoutLevel: this.isStdoutLevel
    };
    this.coreService.renderData(res, domId, this.object, levelFlags, {...this.preferences, _useProfileTz: this._useProfileTz}, POPOUT_MODALS['windowInstance']);
    if (levelFlags.isFatalLevel) this.isFatalLevel = true;
    if (levelFlags.isWarnLevel) this.isWarnLevel = true;
    if (levelFlags.isTraceLevel) this.isTraceLevel = true;
    if (levelFlags.isStdErrLevel) this.isStdErrLevel = true;
    if (levelFlags.isInfoLevel) this.isInfoLevel = true;
    if (levelFlags.isStdoutLevel) this.isStdoutLevel = true;
    setTimeout(() => this.updateLevelCounts(), 0);
  }

  private updateLevelCounts(): void {
    const el = this.dataBody?.nativeElement;
    if (!el) return;
    for (const level of ['main', 'success', 'stdout', 'stderr', 'info', 'fatal', 'error', 'warn', 'debug', 'trace', 'detail']) {
      const count = el.querySelectorAll(`.log-line-${level}`).length;
      if (count > 0) {
        this.levelTotalMap.set(level, count);
      }
    }
    this.totalLineCount = el.querySelectorAll('.log-line').length;
  }

  private checkAndExpand(): void {
    const self = this;

    if (this.coreService.logViewDetails.expandedLogPanel.size || this.coreService.logViewDetails.expandedAllLog) {
      const x: any = POPOUT_MODALS['windowInstance'].document.getElementsByClassName('tx_order');
      for (let i = 0; i < x.length; i++) {
        const id = '#' + x[i]?.firstChild?.id;
        if (this.coreService.logViewDetails.expandedLogPanel.has(id) || this.coreService.logViewDetails.expandedAllLog) {
          this.expandTask(i, true);
        }
      }
    }

    function traverseTree(data): void {
      for (let i in data) {
        if (data[i] && data[i].children && data[i].children.length > 0) {
          if (self.coreService.logViewDetails.expandedLogTree.indexOf(data[i].key) > -1 || self.coreService.logViewDetails.expandedAllTree) {
            data[i].expanded = true;
          }
          traverseTree(data[i].children);
        }
      }
    }

    traverseTree(this.nodes);
  }

  jumpToLevel(level: string, direction?: 'next' | 'prev'): void {
    const dir: 'next' | 'prev' = direction ?? (this.levelLastDir.get(level) ?? 'next');
    const el = this.dataBody?.nativeElement;
    if (!el) return;
    const targets: HTMLElement[] = Array.from(el.querySelectorAll(`.log-line-${level}`))
      .filter((t: any) => t.offsetParent !== null) as HTMLElement[];
    if (!targets.length) return;

    const allLines = Array.from(el.querySelectorAll('.log-line')) as HTMLElement[];
    let idx: number;
    const stored = this.levelJumpState.get(level);
    if (stored !== undefined) {
      idx = dir === 'next'
        ? (stored.idx + 1) % targets.length
        : (stored.idx - 1 + targets.length) % targets.length;
    } else if (this.activeLineIdx !== null) {
      const targetGlobalIdxs = targets.map(t => allLines.indexOf(t));
      if (dir === 'next') {
        const found = targetGlobalIdxs.findIndex(gi => gi > this.activeLineIdx!);
        idx = found !== -1 ? found : 0;
      } else {
        let found = -1;
        for (let i = targetGlobalIdxs.length - 1; i >= 0; i--) {
          if (targetGlobalIdxs[i] < this.activeLineIdx!) { found = i; break; }
        }
        idx = found !== -1 ? found : targets.length - 1;
      }
    } else {
      const scrollMid = el.scrollTop + el.clientHeight / 2;
      if (dir === 'next') {
        const found = targets.findIndex((t: HTMLElement) => t.offsetTop >= scrollMid);
        idx = found !== -1 ? found : 0;
      } else {
        let found = -1;
        for (let i = targets.length - 1; i >= 0; i--) {
          if (targets[i].offsetTop <= scrollMid) { found = i; break; }
        }
        idx = found !== -1 ? found : targets.length - 1;
      }
    }

    targets[idx].scrollIntoView({ block: 'center', behavior: 'smooth' });
    for (const k of Array.from(this.levelJumpState.keys())) {
      if (k !== level) this.levelJumpState.delete(k);
    }
    this.levelJumpState.set(level, { idx, total: targets.length });
    this.levelLastDir.set(level, dir);

    const lineIdx = allLines.indexOf(targets[idx]);
    if (lineIdx !== -1) this.setActiveLine(lineIdx, allLines);
  }

  levelOccurrenceLabel(level: string): string {
    const total = this.levelTotalMap.get(level);
    if (!total) return '';
    const state = this.levelJumpState.get(level);
    if (!state) return `${total}`;
    return `${state.idx + 1}/${total}`;
  }

  get _useProfileTz(): boolean {
    if (this._tzOverride === 'profile') return true;
    if (this._tzOverride === 'original') return false;
    return !!this.preferences.logTimezone;
  }

  get isOriginalTzMode(): boolean {
    return !this._useProfileTz;
  }

  get showTzToggle(): boolean {
    return true;
  }

  get displayTz(): string {
    return this._useProfileTz ? (this.preferences.zone || 'Profile') : 'Original';
  }

  private formatOriginalTs(raw: string): string {
    if (!raw) return '';
    const m = raw.match(/^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2}:\d{2})(?:\.\d+)?([+-]\d{2}:?\d{2}|Z)?/);
    if (!m) return raw.replace('T', ' ').slice(0, 19);
    return `${m[1]} ${m[2]}${m[3] || ''}`;
  }

  toggleTzMode(): void {
    if (this._useProfileTz) {
      this._tzOverride = 'original';
    } else {
      this._tzOverride = this.preferences.zone ? 'profile' : null;
    }
    const spans = this.dataBody.nativeElement.querySelectorAll('.log-ts[data-ts]');
    spans.forEach((el: Element) => {
      const raw = el.getAttribute('data-ts') || '';
      const formatted = this._useProfileTz
        ? (this.coreService.getLogDateFormat(raw, this.preferences.zone) || raw).replace('T', ' ').slice(0, 19)
        : this.formatOriginalTs(raw);
      (el as HTMLElement).textContent = formatted;
    });
  }

  expandAll(): void {
    this.coreService.logViewDetails.expandedAllLog = true;
    const x: any = POPOUT_MODALS['windowInstance'].document.getElementsByClassName('tx_order');
    for (let i = 0; i < x.length; i++) {
      this.expandTask(i, true);
    }
  }

  collapseAll(): void {
    this.coreService.logViewDetails.expandedAllLog = false;
    this.coreService.logViewDetails.expandedLogPanel.clear();
    const x: any = POPOUT_MODALS['windowInstance'].document.getElementsByClassName('tx_order');
    for (let i = 0; i < x.length; i++) {
      const a = POPOUT_MODALS['windowInstance'].document.getElementById('tx_log_' + (i + 1));
      POPOUT_MODALS['windowInstance'].document.getElementById('ex_' + (i + 1)).classList.remove('up');
      POPOUT_MODALS['windowInstance'].document.getElementById('ex_' + (i + 1)).classList.add('down');
      a.classList.remove('show');
      a.classList.add('hide');
      const y = POPOUT_MODALS['windowInstance'].document.getElementById('tx_id_' + (i + 1)).innerText;
      POPOUT_MODALS['windowInstance'].document.getElementById('tx_log_' + (i + 1)).innerHTML = `<div id="tx_id_` + (i + 1) + `" class="hide">` + y + `</div>`;
    }
  }

  expandAllTree(): void {
    this.coreService.logViewDetails.expandedAllTree = true;
    this.coreService.logViewDetails.expandedLogTree = [];
    this.traverseTree(this.nodes, true);
    this.nodes = [...this.nodes];
  }

  collapseAllTree(): void {
    this.coreService.logViewDetails.expandedAllTree = false;
    this.coreService.logViewDetails.expandedLogTree = [];
    this.traverseTree(this.nodes, false);
    this.nodes = [...this.nodes];
  }

  private traverseTree(data: any[], isExpand: boolean): void {
    for (let i in data) {
      if (data[i] && data[i].children && data[i].children.length > 0) {
        data[i].expanded = isExpand;
        if (isExpand) {
          this.coreService.logViewDetails.expandedLogTree.push(data[i].key);
        }
        this.traverseTree(data[i].children, isExpand);
      }
    }
  }

  openFolder(data: NzTreeNode | NzFormatEmitEvent): void {
    if (data instanceof NzTreeNode) {
      data.isExpanded = !data.isExpanded;
      data.origin['isExpanded'] = !data.origin['isExpanded'];
      if (data.origin['isExpanded']) {
        this.coreService.logViewDetails.expandedLogTree.push(data.origin.key);
      } else {
        this.coreService.logViewDetails.expandedAllTree = false;
        this.coreService.logViewDetails.expandedLogTree.splice(this.coreService.logViewDetails.expandedLogTree.indexOf(data.origin.key), 1);
      }
    } else {
      const node = data.node;
      if (node) {
        node.isExpanded = !node.isExpanded;
      }
    }
  }

  selectNode(node: any): void {
    if (node.origin.key) {
      const dom = POPOUT_MODALS['windowInstance'].document.getElementsByClassName(node.origin.position);
      if (dom && dom.length > 0) {
        let classes = POPOUT_MODALS['windowInstance'].document.getElementsByClassName('log_line');
        for (let i in classes) {
          if (classes[i].style) {
            classes[i].style.background = 'transparent';
          }
        }
        let nodeClasses = POPOUT_MODALS['windowInstance'].document.getElementsByClassName('node-wrapper');
        for (let i in nodeClasses) {
          if (nodeClasses[i].style) {
            nodeClasses[i].style.background = 'transparent';
          }
        }
        const color = (this.preferences.theme != 'light' && this.preferences.theme != 'lighter') ? 'rgba(230,247,255,0.5)' : '#e6f7ff';
        const treeElemById = POPOUT_MODALS['windowInstance'].document.getElementById(node.origin.key);
        if (treeElemById) {
          treeElemById.style.background = color;
        }

        for (let x in dom) {
          if (dom.length > 2 && x == '0') {
            continue;
          }
          if (dom[x] && dom[x].style) {
            dom[x].style.background = color;
          }
        }

        dom[dom.length > 2 ? 1 : dom.length - 1].scrollIntoView({behavior: 'smooth', block: 'center'});
        if (dom.length > 0) {
          for (let x in dom) {
            if (dom[x] && dom[x].style) {
              try {
                let arrow = $(dom[x]).find('.tx_order');
                if (arrow && arrow.length > 0) {
                  const elem = arrow.find('i');
                  if (elem) {
                    let classes = elem[0].classList;
                    if (classes) {
                      classes.forEach((item: any) => {
                        if (item == 'down') {
                          elem.click();
                          return;
                        }
                      })
                    }

                  }
                }
              } catch (e) {
              }
            }
          }
        }
      }
    }
  }

  cancel(): void {
    this.isCancel = true;
    this.cancelApiCalls();
  }

  copy(): void {
    try {
      POPOUT_MODALS['windowInstance'].navigator.clipboard.writeText(this.dataBody.nativeElement.innerText);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  }

  reloadLog(): void {
    this.cancelApiCalls();
    this.isLoading = true;
    this.isCancel = false;
    this.finished = false;
    this.taskCount = 1;
    POPOUT_MODALS['windowInstance'].document.getElementById('logs').innerHTML = '';
    if (this.dataObject.historyId) {
      this.historyId = this.dataObject.historyId;
      this.orderId = this.dataObject.orderId;
      this.loadOrderLog();
    } else if (this.dataObject.taskId) {
      this.taskId = this.dataObject.taskId;
      this.loadJobLog();
    }
  }

  downloadLog(): void {
    this.cancel();
    let obj: any;
    if (this.orderId) {
      obj = {
        historyId: this.historyId
      };
    } else if (this.taskId) {
      obj = {
        taskId: this.taskId
      };
    }
    this.coreService.downloadLog(obj, this.controllerId);
  }

  checkLogLevel(type: string): void {
    this.sheetContent = '';
    if (type === 'MAIN') {
      if (!this.object.checkBoxs.main) {
        this.sheetContent += 'div.main {display: none;}\n';
      } else {
        this.sheetContent += 'div.main {display: flex;}\n';
      }
    } else if (type === 'SUCCESS') {
      if (!this.object.checkBoxs.success) {
        this.sheetContent += 'div.success {display: none;}\n';
      } else {
        this.sheetContent += 'div.success {display: flex;}\n';
      }
    } else if (type === 'STDOUT') {
      if (!this.object.checkBoxs.stdout) {
        this.sheetContent += 'div.stdout {display: none;}\n';
      } else {
        this.sheetContent += 'div.stdout {display: flex;}\n';
      }
    } else if (type === 'STDERR') {
      if (!this.object.checkBoxs.stderr) {
        this.sheetContent += 'div.stderr {display: none;}\n';
      } else {
        this.sheetContent += 'div.stderr {display: flex;}\n';
      }
    } else if (type === 'FATAL') {
      if (!this.object.checkBoxs.fatal) {
        this.sheetContent += 'div.fatal {display: none;}\n';
      } else {
        this.sheetContent += 'div.fatal {display: flex;}\n';
      }
    } else if (type === 'DETAIL') {
      if (!this.object.checkBoxs.detail) {
        this.sheetContent += 'div.detail {display: none;}\n';
      } else {
        this.sheetContent += 'div.detail {display: flex;}\n';
      }
    } else if (type === 'ERROR') {
      if (!this.object.checkBoxs.error) {
        this.sheetContent += 'div.error {display: none;}\n';
      } else {
        this.sheetContent += 'div.error {display: flex;}\n';
      }
    } else if (type === 'WARN') {
      if (!this.object.checkBoxs.warn) {
        this.sheetContent += 'div.warn {display: none;}\n';
      } else {
        this.sheetContent += 'div.warn {display: flex;}\n';
      }
    } else if (type === 'TRACE') {
      if (!this.object.checkBoxs.trace) {
        this.sheetContent += 'div.trace {display: none;}\n';
      } else {
        this.sheetContent += 'div.trace {display: flex;}\n';
      }
    } else if (type === 'SCHEDULER') {
      if (!this.object.checkBoxs.scheduler) {
        this.sheetContent += 'div.scheduler {display: none;}\n';
      } else {
        this.sheetContent += 'div.scheduler {display: flex;}\n';
      }
    } else if (type === 'INFO') {
      if (!this.object.checkBoxs.info) {
        this.sheetContent += 'div.log_info {display: none;}\n';
        this.sheetContent += 'div.scheduler_info {display: none;}\n';
      } else {
        this.sheetContent += 'div.log_info {display: flex;}\n';
        if (this.object.checkBoxs.scheduler) {
          this.sheetContent += 'div.scheduler_info {display: flex;}\n';
        }
      }
    } else if (type === 'DEBUG') {
      if (!this.object.checkBoxs.debug) {
        this.sheetContent += 'div.log_debug {display: none;}\n';
        this.sheetContent += 'div.debug {display: none;}\n';
      } else {
        this.sheetContent += 'div.log_debug {display: flex;}\n';
        this.sheetContent += 'div.debug {display: flex;}\n';
      }
    }
    if (this.sheetContent !== '') {
      const sheet = POPOUT_MODALS['windowInstance'].document.createElement('style');
      sheet.innerHTML = this.sheetContent;
      POPOUT_MODALS['windowInstance'].document.body.appendChild(sheet);
    }
    this.saveUserPreference();
  }

  saveUserPreference(): void {
    this.preferences.logFilter = this.object.checkBoxs;
    const configObj: any = {
      controllerId: this.controllerId,
      accountName: this.authService.currentUserData,
      profileItem: JSON.stringify(this.preferences)
    };

    this.coreService.post('profile/prefs/store', configObj).subscribe(() => {
      sessionStorage['preferences'] = JSON.stringify(this.preferences);
    });
  }


  private unsubscribeLogs(): void {
    if (!this.controllerId) { return; }

    const reqs: Array<{url: string, body: any}> = [];

    if (this.historyId) {
      reqs.push({
        url: 'order/log/unsubscribe',
        body: { controllerId: this.controllerId, historyId: this.historyId }
      });
    }
    if (this.taskId) {
      reqs.push({
        url: 'task/log/unsubscribe',
        body: { controllerId: this.controllerId, taskId: this.taskId }
      });
    }

    reqs.forEach(({url, body}) => {
      this.coreService.post(url, body).subscribe({
        next: (res) => {

        },
        error: (err) => {
        }
      });
    });
  }


  private injectLogViewStyles(): void {
    const popupWindow = POPOUT_MODALS['windowInstance'];
    if (!popupWindow || popupWindow.document.getElementById('log-view-popup-styles')) {
      return;
    }
    const s = popupWindow.document.createElement('style');
    s.id = 'log-view-popup-styles';
    s.textContent = `.log-line{display:flex;align-items:flex-start;position:relative;padding:1px 12px 1px 18px!important;border-left:3px solid transparent;transition:background 80ms;cursor:pointer}.log-ts{flex-shrink:0;color:var(--text-color,#3d464d);margin-right:8px;white-space:nowrap;font-size:11px;padding-top:1px;opacity:.85}.log-level{flex-shrink:0;min-width:44px;text-align:center;margin-right:8px;font-size:10px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;padding:0 3px;border-radius:2px;line-height:18px}.log-level-main{color:#696969;border:1px solid #696969;opacity:.85}.log-level-info{color:#666;border:1px solid #666;opacity:.85}.log-level-warn{color:tomato;border:1px solid tomato;opacity:.85}.log-level-error{color:red;border:1px solid red;opacity:.9}.log-level-fatal{color:red;border:1px solid red;opacity:1}.log-level-debug{color:#006400;border:1px solid #006400;opacity:.85}.log-level-trace{color:#a0a0a0;border:1px solid #a0a0a0;opacity:.8}.log-level-success{color:green;border:1px solid green;opacity:.85}.log-level-stdout{color:#696969;border:1px solid #696969;opacity:.85}.log-level-stderr{color:red;border:1px solid red;opacity:.9}.log-level-detail{color:#0000ff;border:1px solid #0000ff;opacity:.8}.log-text{white-space:pre-wrap;word-break:break-all;flex:1;color:var(--text-color,#3d464d)!important}.log-line-error{background:rgba(255,0,0,.05)}.log-line-fatal{background:rgba(255,0,0,.07)}.log-line-stderr{background:rgba(255,0,0,.05)}.log-line-warn{background:rgba(255,99,71,.05)}.log-line-info{background:rgba(102,102,102,.04)}.log-line-debug{background:rgba(0,100,0,.04)}.log-line-trace{background:rgba(160,160,160,.03)}.log-line .tx_order{position:absolute;left:4px;top:1px;min-width:14px}.log-level-group{display:inline-flex;align-items:center;gap:3px;padding:1px 5px 1px 2px;border:1px solid var(--border-color,#d9d9d9);border-radius:4px;margin-right:4px;vertical-align:middle}.log-level-group .log-level-checkbox{margin-right:1px}.log-level-group--off .log-badge{opacity:.3;text-decoration:line-through}.log-level-group--off .log-nav-btn{opacity:.3;pointer-events:none}.log-level-group--off .log-occurrence-count{opacity:.3}.log-level-btn{display:inline-flex;align-items:center;background:none;border:none;padding:1px 2px;cursor:pointer;line-height:1;border-radius:3px;transition:background 80ms;vertical-align:middle}.log-level-btn:hover{background:rgba(128,128,128,.10)}.log-level-btn.log-level-btn--active{background:rgba(128,128,128,.10)}.log-nav-btn{display:inline-flex;align-items:center;justify-content:center;background:none;border:none;cursor:pointer;padding:1px 3px;height:18px;font-size:10px;color:var(--text-muted,#666);border-radius:2px;line-height:1;transition:background 80ms,color 80ms}.log-nav-btn:hover{background:rgba(128,128,128,.12);color:var(--text-color,#333)}.log-occurrence-count{font-size:11px;font-weight:600;color:var(--text-muted,#888);min-width:22px;text-align:right;padding-left:3px}.log-badge{display:inline-block;padding:1px 8px;border-radius:10px;font-size:11px;font-weight:600;letter-spacing:.4px;line-height:16px;white-space:nowrap;text-transform:capitalize}.log-badge-main{color:#696969;border:1px solid #696969;background:transparent;opacity:.85}.log-badge-success{color:green;border:1px solid green;background:transparent;opacity:.9}.log-badge-stdout{color:#696969;border:1px solid #696969;background:transparent;opacity:.85}.log-badge-stderr{color:red;border:1px solid red;background:transparent;opacity:.9}.log-badge-info{color:#666;border:1px solid #666;background:transparent;opacity:.9}.log-badge-fatal{color:red;border:1px solid red;background:transparent;opacity:1}.log-badge-error{color:red;border:1px solid red;background:transparent;opacity:.9}.log-badge-warn{color:tomato;border:1px solid tomato;background:transparent;opacity:.9}.log-badge-debug{color:#006400;border:1px solid #006400;background:transparent;opacity:.85}.log-badge-trace{color:#a0a0a0;border:1px solid #a0a0a0;background:transparent;opacity:.8}.log-badge-detail{color:#00f;border:1px solid #00f;background:transparent;opacity:.8}.log-jump-group{display:inline-flex;align-items:center;gap:2px;padding-left:8px;border-left:1px solid var(--border-color,#d9d9d9)}.log-jump-line-count{font-size:11px;color:var(--text-muted,#888);white-space:nowrap;padding-right:5px;border-right:1px solid var(--border-color,#d9d9d9);margin-right:5px}.log-line--active{background:rgba(24,144,255,.08)!important;border-left-color:var(--primary,#1890ff)!important}.log-toolbar-row{display:flex;align-items:center;gap:6px;padding:4px 8px;flex-wrap:wrap}.log-toolbar-row--search{display:grid;grid-template-columns:auto 1fr auto;column-gap:4px;align-items:center;border-bottom:1px solid var(--border-color,#e8e8e8)}.log-toolbar-row--levels{display:grid;grid-template-columns:auto 1fr auto;column-gap:4px;align-items:center;border-bottom:1px solid var(--border-color,#e8e8e8)}.log-tb-col{display:flex;align-items:center;gap:6px;min-width:0}.log-tb-col--left{justify-content:flex-start;flex-wrap:wrap}.log-tb-col--center{justify-content:center;flex-wrap:wrap}.log-tb-col--right{justify-content:flex-end;flex-wrap:wrap}.log-action-btn{display:inline-flex;align-items:center;gap:4px;padding:2px 6px;font-size:12px;color:var(--text-muted,#888);cursor:pointer;border-radius:3px;white-space:nowrap;text-decoration:none}.log-action-btn:hover{color:var(--primary,#1890ff);background:rgba(128,128,128,.06)}.log-tz-toggle{display:inline-flex;align-items:center;gap:4px;font-size:12px;color:var(--text-muted,#888);padding:0 6px;border-right:1px solid var(--border-color,#d9d9d9);margin-right:2px}.log-date-toggle-btn{display:inline-flex;align-items:center;justify-content:center;height:26px;width:26px;border:1px solid var(--border-color,#d9d9d9);border-radius:4px;background:none;cursor:pointer;color:var(--text-muted,#888);font-size:13px}.log-date-toggle-btn.active{background:var(--primary,#1890ff);color:#fff;border-color:var(--primary,#1890ff)}.log-search-group{display:inline-flex;align-items:stretch;border:1px solid var(--border-color,#d9d9d9);border-radius:12px;height:26px}.log-search-group--filter .log-search-mode-btn{color:#fa8c16}.log-search-group--error{border-color:#f5222d!important}.log-search-mode-btn{display:inline-flex;align-items:center;gap:3px;padding:0 8px 0 10px;border:none;border-right:1px solid var(--border-color,#d9d9d9);border-radius:12px 0 0 12px;background:none;cursor:pointer;font-size:12px;color:var(--text-muted,#888)}.log-search-mode-caret{font-size:9px;opacity:.6}.log-regex-checkbox{display:inline-flex;align-items:center;padding:0 8px;border:none;border-right:1px solid var(--border-color,#d9d9d9);border-radius:0;background:none;cursor:pointer;color:var(--text-muted,#888);font-size:12px}.log-regex-checkbox.active{background:var(--primary,#1890ff);color:#fff}.log-regex-label{font-size:11px;font-weight:700;font-family:monospace;color:var(--text-muted,#888)}.log-regex-checkbox.active .log-regex-label{color:#fff}.log-search-wrap{position:relative;display:inline-flex;align-items:center}.log-search-icon{position:absolute;left:8px;font-size:11px;color:var(--text-muted,#888);pointer-events:none;z-index:1}.log-search-input{height:24px;padding:0 44px 0 26px;border:none;border-radius:0 12px 12px 0;background:transparent;width:240px;font-size:11px;outline:none;color:var(--text-color,#3d464d)}.log-search-clear{position:absolute;right:7px;background:none;border:none;cursor:pointer;color:var(--text-muted,#888);font-size:12px;padding:0;display:inline-flex;align-items:center}.log-regex-error-icon{position:absolute;right:26px;color:#f5222d;font-size:11px;display:inline-flex;align-items:center}.log-status-mode-block{display:inline-flex;align-items:center;gap:4px;padding:1px 8px 1px 6px;border-radius:4px;border:1px solid var(--border-color,#d9d9d9);font-size:11px;height:26px}.log-status-mode-block--search{border-color:var(--primary,#1890ff)}.log-status-mode-block--search .log-status-mode-icon{color:var(--primary,#1890ff)}.log-status-mode-block--search .log-search-match-count{color:var(--primary,#1890ff)}.log-status-mode-block--filter{border-color:#fa8c16}.log-status-mode-block--filter .log-status-mode-icon{color:#fa8c16}.log-status-mode-icon{font-size:12px;flex-shrink:0}.log-search-nav{display:inline-flex;align-items:center;gap:2px;padding:1px 5px 1px 4px}.log-search-match-count{color:var(--primary,#1890ff);min-width:28px}.log-date-inline{display:inline-flex;align-items:center;gap:4px;padding:0 8px;border-left:1px solid var(--border-color,#d9d9d9);flex-shrink:0}.log-date-field-wrap{position:relative;display:inline-flex}.log-date-input{height:24px;padding:0 20px 0 4px;border:1px solid var(--border-color,#d9d9d9);border-radius:3px;background:var(--background-color,#fff);width:172px;font-size:11px;color:var(--text-color,#3d464d)}.log-date-clear{position:absolute;right:3px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:var(--text-muted,#888);font-size:11px;padding:0;display:inline-flex;align-items:center;z-index:1}.log-date-sep{color:var(--text-muted,#888);font-size:11px;user-select:none}mark.log-search-match{background:#ffd666;color:rgba(0,0,0,.87);border-radius:2px;padding:0 2px;font-weight:700;box-shadow:0 0 0 1px rgba(0,0,0,.12)}mark.log-search-match--focused{background:#ffa940;box-shadow:0 0 0 2px #ffa940,0 0 0 1px rgba(0,0,0,.35)}.log-line-match{background:rgba(255,175,30,.12)!important}.log-line--filtered-out,.log-line--date-out{display:none!important}.log-search-mode-wrap{position:relative;display:inline-flex;align-items:stretch;align-self:stretch}.log-mode-backdrop{position:fixed;top:0;left:0;right:0;bottom:0;z-index:999}.log-mode-menu{position:absolute;top:calc(100% + 4px);left:0;min-width:160px;background:var(--background-color,#fff);border:1px solid var(--border-color,#d9d9d9);border-radius:4px;box-shadow:0 2px 8px rgba(0,0,0,.15);z-index:1000;overflow:hidden}.log-mode-menu-item{display:flex;align-items:center;padding:7px 12px;font-size:12px;cursor:pointer;color:var(--text-color,#333);transition:background 80ms}.log-mode-menu-item:hover{background:rgba(0,0,0,.04)}.log-mode-menu-item--active{color:var(--primary,#1890ff);background:rgba(24,144,255,.08)}.log-tz-switch{position:relative;display:inline-block;width:28px;height:14px;border-radius:7px;border:none;background:rgba(0,0,0,.25);cursor:pointer;padding:0;transition:background 200ms;flex-shrink:0;vertical-align:middle}.log-tz-switch::after{content:'';position:absolute;left:2px;top:2px;width:10px;height:10px;border-radius:50%;background:#fff;transition:left 200ms;box-shadow:0 2px 4px rgba(0,0,0,.3)}.log-tz-switch--on{background:var(--primary,#1890ff)}.log-tz-switch--on::after{left:16px}.log-line--block-collapsed{display:none!important}.log-expand-btn--disabled{opacity:.35;cursor:not-allowed;pointer-events:none}.log-search-active .tx_order{opacity:.35;pointer-events:none;cursor:not-allowed}.log-summary-filter-active{color:#fa8c16;font-weight:500}.log-context-toggle{display:inline-flex;align-items:center;gap:5px;font-size:11px;color:var(--text-muted,#888);cursor:pointer;user-select:none;white-space:nowrap;margin:0;flex-shrink:0}.log-context-label{white-space:nowrap}.log-context-select{display:inline-flex;align-items:center;gap:4px;font-size:11px;color:var(--text-muted,#888)}.log-context-lines-input{width:65px;height:20px;padding:0 4px;border:1px solid var(--border-color,#d9d9d9);border-radius:3px;font-size:11px;text-align:center}.log-context-header{display:flex;align-items:center;gap:6px;padding:2px 8px;background:rgba(128,128,128,.04);cursor:pointer;font-size:11px;color:var(--text-muted,#888);user-select:none}.log-context-header:hover{background:rgba(128,128,128,.09)}.log-context-header.log-context-header--sep{border-top:1px dashed var(--border-color,#e3e3e3);margin-top:4px}.log-context-chevron{font-size:10px;flex-shrink:0}.log-context-label-text{flex:1}.btn{display:inline-block;padding:.375rem 1rem;font-size:1rem;font-weight:400;line-height:1.5;text-align:center;white-space:nowrap;vertical-align:middle;cursor:pointer;user-select:none;border:1px solid transparent;border-radius:.25rem;outline:0}.btn-xs{padding:3px 8px;font-size:11px}.btn-primary{background-color:var(--primary,#1890ff)!important;border-color:var(--primary,#1890ff)!important;color:#fff!important}.btn-default{background:var(--background-color,#f5f5f5);border:1px solid var(--border-color,#d9d9d9);color:var(--text-color,#333)}`;
    popupWindow.document.head.appendChild(s);
  }

  private addStylesToPopupWindow(): void {
    const popupWindow = POPOUT_MODALS['windowInstance'];
    if (!popupWindow || popupWindow.document.getElementById('log-view-styles')) {
      return;
    }

    const styleElement = popupWindow.document.createElement('style');
    styleElement.id = 'log-view-styles';
    styleElement.textContent = `
      .help-sidebar-content{height:100%;display:flex;flex-direction:column}.help-header{padding:12px 16px;border-bottom:1px solid #e8e8e8;background:#fafafa;display:flex;justify-content:space-between;align-items:center;flex-shrink:0}.help-header .help-title{margin:0;font-size:14px;font-weight:500;color:#262626}.help-header .help-title .help-icon{margin-right:8px;color:#1890ff}.help-header .help-actions{display:flex;align-items:center;gap:8px}.help-header .help-actions .btn-back-to-tree{font-size:12px;padding:4px 8px;border-radius:3px}.help-header .help-actions .btn-help-close{background:0 0;border:none;cursor:pointer;color:#999;font-size:16px;padding:4px;border-radius:3px;transition:color .2s ease}.help-header .help-actions .btn-help-close:hover{color:#666;background-color:rgba(0,0,0,.04)}.help-body{flex:1;overflow-y:auto;padding:16px;background:#fff;margin-top:16px}.help-body .help-loading{text-align:center;padding:50px 20px;color:#1890ff}.help-body .help-loading .loading-text{margin-top:10px;font-size:14px}.help-body .help-error{text-align:center;padding:50px 20px;color:#999;font-size:14px}.help-body .help-content.help-md{margin:0;padding:0;max-width:100%;overflow-wrap:break-word}.help-body .help-content.help-md h1{font-size:24px!important}.help-body .help-content.help-md h2{font-size:20px!important}.help-body .help-content.help-md h3{font-size:16px!important}.help-body .help-content.help-md table{font-size:12px!important}.help-body .help-content.help-md table th,.help-body .help-content.help-md table td{padding:6px!important}.help-body .help-content.help-md pre{font-size:12px!important;overflow-x:auto;max-width:100%}.help-body .help-content.help-md code{font-size:11px!important}#property-panel.help-mode .rg-right{display:none}.help-content .help-target-highlight{background-color:#fff2b8!important;transition:background-color .3s ease;padding:4px 8px;border-radius:4px;margin:-4px -8px}@media (max-width:1200px){.help-body .help-content.help-md h1{font-size:20px!important}.help-body .help-content.help-md h2{font-size:18px!important}.help-body .help-content.help-md h3{font-size:16px!important}.help-body .help-content.help-md table{font-size:11px!important}}
      .help-md{font-size:14px!important;line-height:1.65!important;color:#111827!important}.help-md h1{font-size:28px!important;margin:0 0 .6rem!important;font-weight:700!important;padding-bottom:.6rem!important;border-bottom:1px solid #e5e7eb!important}.help-md h2{font-size:22px!important;margin:2rem 0 .5rem!important;font-weight:700!important;padding-bottom:.4rem!important;border-bottom:1px solid #eef0f3!important}.help-md h3{font-size:18px!important;margin:1.25rem 0 .4rem!important;font-weight:700!important}.help-md h1+p,.help-md h2+p,.help-md h3+p{margin-top:.3rem!important}.help-md p{margin:.5rem 0 1rem!important;color:#374151}.help-md ul,.help-md ol{margin:.6rem 0 1rem!important;padding-left:1.4rem!important;list-style-position:outside!important}.help-md ul{list-style-type:disc!important}.help-md ul ul{list-style-type:circle!important}.help-md ul ul ul{list-style-type:square!important}.help-md ol{list-style-type:decimal!important}.help-md ol ol{list-style-type:lower-alpha!important}.help-md ol ol ol{list-style-type:lower-roman!important}.help-md li{margin:.25rem 0!important}.help-md li p{margin:.25rem 0!important}.help-md blockquote{margin:1rem 0!important;padding:.6rem 1rem!important;border-left:4px solid #e5e7eb!important;background:#f9fafb!important}.help-md hr{border:0!important;border-top:1px solid #e5e7eb!important;margin:1.25rem 0!important}.help-md table{border-collapse:collapse!important;width:100%!important;margin:1rem 0!important;font-size:13px!important}.help-md th,.help-md td{border:1px solid #e5e7eb!important;padding:8px!important;vertical-align:top!important}.help-md thead th{background:#f3f4f6!important;font-weight:600!important}.help-md pre{padding:12px!important;overflow:auto!important;border-radius:6px!important;background:#0f172a0d!important}.help-md code{padding:0 .25em!important;background:#0000000f!important;border-radius:4px!important}.help-md input[type=checkbox]{margin-right:.5em!important;transform:translateY(.1em)!important}.help-md a{color:var(--primary)!important;text-decoration:underline!important;text-underline-offset:2px!important;cursor:pointer!important}.help-md a:hover{text-decoration-thickness:2px!important}.help-md a:focus-visible{outline:2px solid var(--primary)!important;outline-offset:2px!important}.help-md a:visited{color:var(--primary)!important}.help-md a[href^="#"]{color:var(--primary)!important}.help-md a[href^=http]:not([href*="//localhost"]):not([href*="//127.0.0.1"])::after{content:" ⬈"!important;margin-left:.25em!important;font-size:.85em!important;opacity:.7!important}.help-md a[href^=mailto:]::before{content:"✉ "}.help-md a[href^=tel:]::before{content:"☎ "}.help-md h1 a,.help-md h2 a,.help-md h3 a,.help-md h4 a,.help-md h5 a,.help-md h6 a{color:inherit!important;text-decoration:underline!important}@media (prefers-color-scheme:dark){.help-md a{color:var(--primary)!important}.help-md a:visited{color:var(--primary)!important}.help-md a:focus-visible{outline-color:var(--primary)!important}}.help-md-target{background:#fde68a66;transition:background .8s ease}.help-md :is(h1,h2,h3,h4,h5,h6){scroll-margin-top:64px}.help-md-target{animation:highlight-fade 1.2s forwards}@keyframes highlight-fade{0%{background-color:var(--primary)}100%{background-color:transparent}}.help-md pre,.help-md code{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,"Liberation Mono",monospace!important;white-space:pre!important;overflow:auto!important}
    `;
    popupWindow.document.head.appendChild(styleElement);
  }

  helpPage(): void {
    const key = this.taskId ? 'task-log' : 'order-log';
    const popupWindow = POPOUT_MODALS['windowInstance'];
    if (!popupWindow) return;

    const panel = popupWindow.document.getElementById('property-panel') as HTMLElement;
    const isHelpOpen = panel && panel.getAttribute('data-mode') === 'help';

    if (isHelpOpen) {
      const sidebarClose = popupWindow.document.getElementsByClassName('sidebar-close')[0] as HTMLElement;
      if (sidebarClose) {
        sidebarClose.click();
      }
    } else {
      this.showHelpInSidebar(key);
    }
  }

  private showHelpInSidebar(key: string): void {
    const popupWindow = POPOUT_MODALS['windowInstance'];
    if (!popupWindow) return;

    this.addStylesToPopupWindow();

    const panel = popupWindow.document.getElementById('property-panel') as HTMLElement;
    const treeWrapper = popupWindow.document.getElementById('tree-wrapper') as HTMLElement;
    const helpWrapper = popupWindow.document.getElementById('help-wrapper') as HTMLElement;
    const close = popupWindow.document.getElementsByClassName('sidebar-close')[0] as HTMLElement;
    const open = popupWindow.document.getElementsByClassName('sidebar-open')[0] as HTMLElement;

    if (!panel || !treeWrapper || !helpWrapper) return;

    const helpWidth = Math.floor(popupWindow.innerWidth * 0.8);

    panel.style.display = 'block';
    panel.style.width = helpWidth + 'px';
    this.dataBody.nativeElement.setAttribute('style', 'margin-right: ' + (helpWidth + 8) + 'px');

    if (close) {
      close.style.display = 'block';
      close.style.right = (helpWidth - 2) + 'px';
    }
    if (open) {
      open.style.right = '-20px';
    }

    treeWrapper.style.display = 'none';
    helpWrapper.style.display = 'block';

    this.loadHelpContentIntoSidebar(popupWindow, key);
    panel.setAttribute('data-mode', 'help');
  }


  private loadHelpContentIntoSidebar(popupWindow: Window, key: string): void {
    const helpWrapper = popupWindow.document.getElementById('help-wrapper');
    if (!helpWrapper) return;

    const helpHtml = `
    <div class="help-sidebar-content">

      <div class="help-body">
        <div class="help-content help-md" style="display: none;"></div>
      </div>
    </div>`;

    helpWrapper.innerHTML = helpHtml;
    this.setupHelpSidebarEvents(popupWindow);
    this.fetchHelpContent(popupWindow, key);
  }


  private setupHelpSidebarEvents(popupWindow: Window): void {
    const panel = popupWindow.document.getElementById('property-panel');
    if (!panel) return;

    const backBtn = panel.querySelector('.btn-back-to-tree');
    const closeBtn = panel.querySelector('.btn-help-close');
    const sidebarClose = popupWindow.document.getElementsByClassName('sidebar-close')[0] as HTMLElement;

    if (backBtn) {
      backBtn.addEventListener('click', () => this.restoreTreeView(popupWindow));
    }

    if (closeBtn && sidebarClose) {
      closeBtn.addEventListener('click', () => sidebarClose.click());
    }
  }


  private restoreTreeView(popupWindow: Window): void {
    const panel = popupWindow.document.getElementById('property-panel') as HTMLElement;
    const treeWrapper = popupWindow.document.getElementById('tree-wrapper') as HTMLElement;
    const helpWrapper = popupWindow.document.getElementById('help-wrapper') as HTMLElement;
    const close = popupWindow.document.getElementsByClassName('sidebar-close')[0] as HTMLElement;

    if (!panel || !treeWrapper || !helpWrapper) return;

    helpWrapper.style.display = 'none';
    treeWrapper.style.display = 'block';
    panel.removeAttribute('data-mode');

    const normalWidth = localStorage['logPanelWidth'] ? parseInt(localStorage['logPanelWidth'], 10) : 300;
    panel.style.width = normalWidth + 'px';
    this.dataBody.nativeElement.setAttribute('style', 'margin-right: ' + (normalWidth + 8) + 'px');

    if (close) {
      close.style.right = (normalWidth - 2) + 'px';
      close.style.display = 'block';
    }
  }
  private fetchHelpContent(popupWindow: Window, key: string): void {
    const panel = popupWindow.document.getElementById('property-panel');
    if (!panel) return;

    const loadingEl = panel.querySelector('.help-loading') as HTMLElement;
    const contentEl = panel.querySelector('.help-content') as HTMLElement;
    const errorEl = panel.querySelector('.help-error') as HTMLElement;

    this.helpService.getHelpHtml(key).subscribe({
      next: (result: HelpRenderResult | null) => {
        if (loadingEl) loadingEl.style.display = 'none';
        if (result?.html) {
          if (contentEl) {
            contentEl.innerHTML = result.html;
            contentEl.style.display = 'block';
            this.processHelpContent(contentEl);
          }
          if (result.fellBack) {
            this.showFallbackNotice(panel, result);
          }
        } else {
          if (errorEl) errorEl.style.display = 'block';
        }
      },
      error: (err) => {
        console.error('Error loading help content:', err);
        if (loadingEl) loadingEl.style.display = 'none';
        if (errorEl) errorEl.style.display = 'block';
      }
    });
  }

  private processHelpContent(contentEl: HTMLElement): void {
    this.applyHeadingIds(contentEl);
    this.setupHelpContentLinks(contentEl);
  }

  private applyHeadingIds(container: HTMLElement): void {
    container.querySelectorAll<HTMLElement>('h1,h2,h3,h4,h5,h6').forEach(h => {
      if (h.id?.trim()) return;
      const raw = h.textContent || '';
      const custom = raw.match(/\s*\{#([A-Za-z0-9._:-]+)\}\s*$/);
      if (custom) {
        h.id = custom[1];
        h.textContent = raw.replace(/\s*\{#([A-Za-z0-9._:-]+)\}\s*$/, '').trim();
      } else {
        h.id = this.slug(raw);
      }
    });
  }

  private setupHelpContentLinks(contentEl: HTMLElement): void {
    contentEl.querySelectorAll('a[href^="#"], a[href^="/"]').forEach((link: HTMLAnchorElement) => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (!href) return;
        e.preventDefault();
        if (href.startsWith('#')) {
          const targetId = href.slice(1);
          const target = contentEl.querySelector(`#${CSS.escape(targetId)}`);
          if (target) {
            target.scrollIntoView({behavior: 'smooth', block: 'start'});
            target.classList.add('help-md-target');
            setTimeout(() => target.classList.remove('help-md-target'), 1200);
          }
        } else if (href.startsWith('/')) {
          const mdMatch = href.match(/^\/([a-z0-9._-]+)(?:\.md)?$/i);
          if (mdMatch) {
            this.showHelpInSidebar(mdMatch[1]);
          }
        }
      });
    });
  }

  private slug(s: string): string {
    return s.toLowerCase().trim().replace(/<[^>]+>/g, '').replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
  }

  private showFallbackNotice(panel: HTMLElement, result: HelpRenderResult): void {
    const headerEl = panel.querySelector('.help-header .help-actions');
    if (headerEl?.querySelector('.fallback-notice')) return;
    if (headerEl && result.fellBack) {
      const noticeHtml = `<small class="fallback-notice text-warning" style="font-size:11px;">Showing ${result.usedLang.toUpperCase()}</small>`;
      headerEl.insertAdjacentHTML('afterbegin', noticeHtml);
    }
  }

}
