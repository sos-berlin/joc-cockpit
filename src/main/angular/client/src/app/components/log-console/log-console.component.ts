import {Component, ElementRef, inject, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {CoreService} from '../../services/core.service';
import {NZ_MODAL_DATA, NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
import * as moment from 'moment-timezone';

interface ParsedLine {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG' | 'OTHER';
  text: string;
  raw: string;
}

const TIMESTAMP_RE = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2},\d{3})\s+(info|WARN|ERROR|DEBUG|FATAL)\s+/i;

function parseLine(raw: string): ParsedLine {
  const m = raw.match(TIMESTAMP_RE);
  if (m) {
    const lvlStr = m[2].toUpperCase();
    let level: ParsedLine['level'] = 'OTHER';
    if (lvlStr === 'INFO')  level = 'INFO';
    else if (lvlStr === 'WARN')  level = 'WARN';
    else if (lvlStr === 'ERROR' || lvlStr === 'FATAL') level = 'ERROR';
    else if (lvlStr === 'DEBUG') level = 'DEBUG';
    return {timestamp: m[1], level, text: raw.slice(m[0].length).replace(/\r?\n$/, ''), raw};
  }
  return {timestamp: '', level: 'OTHER', text: raw.replace(/\r?\n$/, ''), raw};
}

export interface LogConsoleRequest {
  type: 'controller' | 'agent' | 'joc';
  /** Controller & Agent */
  controllerId?: string;
  /** Controller only */
  role?: string;
  /** Agent only */
  agentId?: string;
  subagentId?: string;
  /** Common */
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
  @Input() request: LogConsoleRequest = {type: 'controller'};

  allLines: ParsedLine[] = [];
  isLoading = false;
  isDownloading = false;
  isComplete = false;
  errorMsg: string | null = null;
  token: string | null = null;
  timeZone = '';

  filters = {info: true, warn: true, error: true, debug: true, other: true};
  searchTerm = '';
  followTail = false;

  @ViewChild('logBody') logBodyRef?: ElementRef<HTMLElement>;

  private destroyed = false;

  constructor(private coreService: CoreService, private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
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
  }

  get filteredLines(): ParsedLine[] {
    const term = this.searchTerm.trim().toLowerCase();
    return this.allLines.filter(l => {
      const levelOk = (() => {
        switch (l.level) {
          case 'INFO':  return this.filters.info;
          case 'WARN':  return this.filters.warn;
          case 'ERROR': return this.filters.error;
          case 'DEBUG': return this.filters.debug;
          default:      return this.filters.other;
        }
      })();
      return levelOk && (!term || l.text.toLowerCase().includes(term));
    });
  }

  /** Per-level counts over allLines (unfiltered), used by the summary bar. */
  get levelCounts(): Record<string, number> {
    const c: Record<string, number> = {error: 0, warn: 0, info: 0, debug: 0, other: 0};
    for (const l of this.allLines) {
      switch (l.level) {
        case 'ERROR': c['error']++; break;
        case 'WARN':  c['warn']++; break;
        case 'INFO':  c['info']++; break;
        case 'DEBUG': c['debug']++; break;
        default:      c['other']++; break;
      }
    }
    return c;
  }

  /**
   * Returns HTML with search matches wrapped in <mark> tags.
   * Called only when searchTerm is non-empty (template uses @if guard).
   * Text is HTML-escaped before marking to prevent injection.
   */
  highlightText(text: string): SafeHtml {
    const escaped = text
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const term = this.searchTerm.trim();
    if (!term) return this.sanitizer.bypassSecurityTrustHtml(escaped);
    const safeRe = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return this.sanitizer.bypassSecurityTrustHtml(
      escaped.replace(new RegExp(safeRe, 'gi'), '<mark class="log-search-match">$&</mark>')
    );
  }

  /** Scroll the log body to the first visible line of the given level. */
  jumpToLevel(level: string): void {
    const el = this.logBodyRef?.nativeElement;
    if (!el) return;
    const target = el.querySelector<HTMLElement>(`.log-line-${level}`);
    target?.scrollIntoView({block: 'center', behavior: 'smooth'});
  }

  toggleFollowTail(): void {
    this.followTail = !this.followTail;
    if (this.followTail) this.scrollToBottom();
  }

  get hasWarn():  boolean { return this.allLines.some(l => l.level === 'WARN'); }
  get hasError(): boolean { return this.allLines.some(l => l.level === 'ERROR'); }
  get hasDebug(): boolean { return this.allLines.some(l => l.level === 'DEBUG'); }

  /** Effective display timezone: from request, or from API response. */
  get displayTz(): string {
    return this.request?.timeZone || this.timeZone;
  }

  /**
   * Format a raw log timestamp (e.g. '2026-04-30T10:00:00,123') in the display timezone.
   * The comma-separated milliseconds are a log4j convention; moment handles dot-separated.
   */
  formatTimestamp(raw: string): string {
    if (!raw) return raw;
    const tz = this.displayTz;
    const iso = raw.replace(',', '.');
    if (tz) {
      // Timestamp is already in the selected tz — parse it there and format cleanly
      return moment.tz(iso, 'YYYY-MM-DDTHH:mm:ss.SSS', tz).format('YYYY-MM-DD HH:mm:ss');
    }
    return iso.replace('T', ' ').slice(0, 23);
  }

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
    this.coreService.post(apiUrl, {token: this.token}).subscribe({
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

  lineBorderColor(level: ParsedLine['level']): string {
    switch (level) {
      case 'ERROR': return 'var(--red)';
      case 'WARN':  return 'var(--gold)';
      case 'DEBUG': return 'var(--green)';
      default:      return 'transparent';
    }
  }

  private scrollToBottom(): void {
    const el = this.logBodyRef?.nativeElement;
    if (el) setTimeout(() => { el.scrollTop = el.scrollHeight; }, 0);
  }

  private processLines(lines: string[]): void {
    for (const raw of lines) {
      const cleaned = raw.replace(/\r?\n$/, '');
      if (!cleaned.trim()) continue;
      const parsed = parseLine(cleaned);
      // Continuation line — append to last entry
      if (!parsed.timestamp && this.allLines.length > 0) {
        this.allLines[this.allLines.length - 1].text += '\n' + parsed.text;
      } else {
        this.allLines.push(parsed);
      }
    }
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
    req.level    = r.level    || 'INFO';
    req.dateFrom = r.dateFrom;
    if (r.dateTo)     req.dateTo     = r.dateTo;
    if (r.timeZone)   req.timeZone   = r.timeZone;
    if (r.numOfLines) req.numOfLines = r.numOfLines;
    return req;
  }
}

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

  readonly levelOptions    = ['DEBUG', 'INFO', 'WARN', 'ERROR'];
  readonly roleOptions     = ['PRIMARY', 'BACKUP'];

  constructor(public activeModal: NzModalRef, private coreService: CoreService, private modal: NzModalService) {}

  ngOnInit(): void {
    const data = this.modalData || {};
    if (data.type)         this.type             = data.type;
    if (data.controllerId) this.form.controllerId = data.controllerId;
    if (data.agentId)      this.form.agentId      = data.agentId;
    if (data.timeZone)     this.form.timeZone     = data.timeZone;
    if (data.role)         this.form.role         = data.role;
  }

  get sourceName(): string {
    if (this.type === 'joc') return 'JOC Logs';
    if (this.type === 'agent') return (this.form.agentId || 'Agent') + ' Logs';
    return (this.form.controllerId || 'Controller') + ' Logs';
  }

  get effectiveTz(): string {
    return this.form.timeZone || this.coreService.getTimeZone();
  }

  /** Re-initialize date defaults when the timezone changes. */
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
    const title = this.sourceName;
    // Close filter modal, open a dedicated fullscreen viewer modal
    this.activeModal.destroy();
    this.modal.create({
      nzTitle:        undefined,
      nzContent:      LogConsoleViewerComponent,
      nzData:         {request: req, title},
      nzFooter:       null,
      nzClassName:    'maximum',
      nzClosable:     false,
      nzMaskClosable: false
    });
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

  /**
   * Download API payload.
   * /controller/log/download → role (opt)
   * /agent/log/download      → agentId (req), subagentId (opt)  — no controllerId
   * /joc/log/download        → (no id fields)
   */
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

// ─── Viewer modal: lightweight wrapper opened after the filter form ────────────
@Component({
  standalone: false,
  selector: 'app-log-console-viewer',
  templateUrl: './log-console-viewer.component.html'
})
export class LogConsoleViewerComponent implements OnInit {
  readonly modalData: any = inject(NZ_MODAL_DATA);

  request!: LogConsoleRequest;
  title = 'System Logs';

  constructor(public activeModal: NzModalRef) {}

  ngOnInit(): void {
    const data = this.modalData || {};
    this.request = data.request;
    this.title   = data.title || 'System Logs';
  }
}
