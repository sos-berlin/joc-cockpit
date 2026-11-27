/**
 * JOC-2343 Daily Plan -> Timeline: list of Critical Paths with estimated times; an opened path shows a Gantt
 * chart of its workflows and the target planning. Presentational: all data comes precomputed from the
 * parent (DependenciesComponent in mode 'timeline'), all actions go back as events. The page shows at most
 * one page of Critical Paths, so default change detection is cheap.
 */
import {Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges, TemplateRef, ViewChild} from '@angular/core';
import {NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
import {PathTiming, TargetPlan, WorkflowDurations, WorkflowTiming} from './critical-path-timing';

export interface TimelineRow {
  id: string;
  /** Critical Path name (formatted) and number of further end workflows */
  title: string;
  more: number;
  startsWith: string;
  severity: 'problem' | 'attention' | 'normal' | 'success';
  timing: PathTiming;
  target: number | null;
  plan: TargetPlan | null;
  /** per workflow path: formatted name, state CSS suffix (dep-state-*), Reason text key */
  names: Map<string, string>;
  stateClass: Map<string, string>;
  reasonKey: Map<string, string>;
  orderCount: Map<string, number>;
  /** time consumption statistics per workflow (API workflows/time_consumption) */
  durations: Map<string, WorkflowDurations>;
}

interface GanttBar {
  path: string; name: string; y: number; x: number; w: number; cls: string; dashed: boolean;
  /** name for the label column: long paths are cut at the start, the workflow name stays visible */
  short: string;
  waitX: number; waitW: number; label: string;
}

interface Gantt {
  width: number; height: number;
  /** grid lines (5 min, 1 min or 30 s depending on the span); label = '' for lines without text */
  ticks: { x: number; label: string; major: boolean }[];
  bars: GanttBar[]; nowX: number | null; targetX: number | null; endX: number | null;
}

/** drawing width in px: about the width of the list, so the text keeps its normal size */
const GANTT_W = 1400;
const LABEL_W = 330;
/** shortest time span of the chart (short paths are not stretched to 30 minutes any more) */
const MIN_SPAN_MS = 2 * 60000;
/** minimum distance between two time labels in px */
const LABEL_GAP = 52;
const ROW_H = 30;
const TOP = 30;

@Component({
  standalone: false,
  selector: 'app-timeline-list',
  templateUrl: './timeline-list.component.html',
  styleUrls: ['./timeline-list.component.scss']
})
export class TimelineListComponent implements OnChanges {
  @Input() rows: TimelineRow[] = [];
  @Input() now = Date.now();
  /** formats a time (ms) in the user's time zone, e.g. "23:45" */
  /** formats a time (ms) in the user's time zone and time format, with seconds, e.g. "23:45:07" */
  @Input() formatTime: (ms: number) => string = ms => new Date(ms).toTimeString().slice(0, 8);
  /** the same without seconds, for the labels of the Gantt axis and the now line, e.g. "23:45" */
  @Input() formatAxis: (ms: number) => string = ms => new Date(ms).toTimeString().slice(0, 5);
  @Input() canModify = false;
  /** opened Critical Paths (owned by the parent, so that switching views can open a path) */
  @Input() expanded: Set<string> = new Set<string>();
  @Output() toggleRow = new EventEmitter<string>();

  @Output() setTarget = new EventEmitter<{ id: string; time: string }>();
  @Output() clearTarget = new EventEmitter<string>();
  /** confirmed "Modify start times": the Critical Path and the audit log comment (null if not shown) */
  @Output() applyPlan = new EventEmitter<{ id: string; comments: any }>();
  /** show the audit log fields in the confirmation dialog (profile / session setting, from the parent) */
  @Input() auditLog = false;
  @Output() openDependencies = new EventEmitter<string>();
  @Output() workflowClick = new EventEmitter<string>();
  @Output() ordersClick = new EventEmitter<string>();

  targetInput = new Map<string, string>();
  /** Critical Paths whose target input is invalid (message shown) */
  targetError = new Set<string>();
  /** confirmation dialog of "Modify start times" (content: template #modifyConfirm) */
  @ViewChild('modifyConfirm') private modifyConfirm: TemplateRef<any>;
  private modalService = inject(NzModalService);
  private confirmRef: NzModalRef | null = null;
  /** Critical Path shown in the confirmation dialog */
  confirmRow: TimelineRow | null = null;
  /** audit log comment of the confirmation dialog (app-audit-log-input) */
  comments: any = {};
  /** opened Critical Paths whose workflow table is shown (collapsed by default) */
  private workflowsOpen = new Set<string>();
  private gantts = new Map<string, Gantt>();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['rows'] || changes['now']) {
      this.gantts.clear();
    }
  }

  toggle(id: string): void {
    this.toggleRow.emit(id);
  }

  // ------------------------------------------------------------------ texts

  time(ms: number | null): string {
    return ms === null || ms === undefined ? '—' : this.formatTime(ms);
  }

  duration(ms: number | null): string {
    if (ms === null || ms === undefined) {
      return '—';
    }
    // seconds matter for short durations only: "20 s", "3 min 20 s", "25 min", "1 h 05 min"
    const sec = Math.round(ms / 1000);
    if (sec < 60) {
      return sec + ' s';
    }
    if (sec < 600) {
      const s = sec % 60;
      return Math.floor(sec / 60) + ' min' + (s > 0 ? ' ' + s + ' s' : '');
    }
    const m = Math.round(ms / 60000);
    return m < 60 ? m + ' min' : Math.floor(m / 60) + ' h ' + String(m % 60).padStart(2, '0') + ' min';
  }

  /** Delay against the target (positive = late); null without target or without estimate. */
  delay(r: TimelineRow): number | null {
    return r.target !== null && r.timing.estEnd !== null ? r.timing.estEnd - r.target : null;
  }

  delayText(r: TimelineRow): string {
    const d = this.delay(r);
    if (d === null) {
      return '—';
    }
    return (d > 0 ? '+' : '−') + this.duration(Math.abs(d));
  }

  /** "on time" / "delayed" / "cannot complete" / "completed" / "open" / "no orders" for the status badge */
  timeStatus(r: TimelineRow): string {
    const t = r.timing;
    if (t.rows.length > 0 && t.rows.every(w => w.status === 'missing')) {
      return 'noOrders';
    }
    if (t.cannotComplete) {
      return 'cannotComplete';
    }
    if (t.rows.length > 0 && t.rows.every(w => w.status === 'completed')) {
      return 'completed';
    }
    if (t.estEnd === null) {
      return 'open';
    }
    const d = this.delay(r);
    return d !== null && d > 0 ? 'delayed' : 'onTime';
  }

  isWorkflowsOpen(id: string): boolean {
    return this.workflowsOpen.has(id);
  }

  toggleWorkflows(id: string): void {
    if (this.workflowsOpen.has(id)) {
      this.workflowsOpen.delete(id);
    } else {
      this.workflowsOpen.add(id);
    }
  }

  /** The target panel is offered unless the path is completed or has no orders (nothing to plan). */
  canPlanTarget(r: TimelineRow): boolean {
    const s = this.timeStatus(r);
    return s !== 'completed' && s !== 'noOrders';
  }

  /** Tooltip of an average duration: range, number of executions, per cycle. */
  durationParams(r: TimelineRow, path: string): { min: string; max: string; count: number } | null {
    const d = r.durations?.get(path);
    return d && d.count > 0 ? {min: this.duration(d.minMs), max: this.duration(d.maxMs), count: d.count} : null;
  }

  isPerCycle(r: TimelineRow, path: string): boolean {
    return !!r.durations?.get(path)?.perCycle;
  }

  planEntry(r: TimelineRow, path: string) {
    return r.plan?.entries.find(e => e.path === path) || null;
  }

  // ------------------------------------------------------------------ target

  /** hh:mm or hh:mm:ss (before only hh:mm was accepted, other input was ignored without a message) */
  submitTarget(r: TimelineRow): void {
    const v = (this.targetInput.get(r.id) ?? (r.target !== null ? this.time(r.target) : '')).trim();
    const m = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(v);
    if (m && +m[1] < 24 && +m[2] < 60 && (m[3] === undefined || +m[3] < 60)) {
      this.targetError.delete(r.id);
      this.setTarget.emit({id: r.id, time: v});
    } else {
      this.targetError.add(r.id);
    }
  }

  // ------------------------------------------------------------------ modify start times

  /** Orders that are moved to their new start: latest start, or earliest start if the target cannot be met. */
  moves(r: TimelineRow) {
    return (r.plan?.entries || []).filter(e => e.move && e.orderId && e.newStart !== null);
  }

  /** Opens the confirmation dialog: which Orders get which new start time. */
  askModify(r: TimelineRow): void {
    if (this.moves(r).length === 0 || !this.modifyConfirm) {
      return;
    }
    this.confirmRow = r;
    // fresh comment per dialog; type / operation / name for the predefined comments, as in the other dialogs
    this.comments = {
      radio: 'predefined', type: 'Order', operation: 'Modify',
      name: this.moves(r).map(e => e.orderId).join(', ')
    };
    this.confirmRef = this.modalService.create({
      nzTitle: undefined,
      nzContent: this.modifyConfirm,
      nzClassName: 'lg',
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    this.confirmRef.afterClose.subscribe(() => {
      this.confirmRef = null;
      this.confirmRow = null;
    });
  }

  confirmModify(): void {
    const r = this.confirmRow;
    this.confirmRef?.destroy();
    if (r) {
      this.applyPlan.emit({id: r.id, comments: this.auditLog ? this.comments : null});
    }
  }

  cancelModify(): void {
    this.confirmRef?.destroy();
  }

  // ------------------------------------------------------------------ Gantt

  gantt(r: TimelineRow): Gantt {
    let g = this.gantts.get(r.id);
    if (!g) {
      g = this.buildGantt(r);
      this.gantts.set(r.id, g);
    }
    return g;
  }

  /** "…/FLPROD_BAT_S03/COR_T_UPLCLN_N_S3" instead of "/work_2320/Aviva/FLPROD_BAT_S03/COR_T_UPL…" */
  private shortName(name: string): string {
    const max = 46;
    return name.length > max ? '…' + name.slice(name.length - max + 1) : name;
  }

  private buildGantt(r: TimelineRow): Gantt {
    const t = r.timing;
    // a completed path is shown on its own time span: "now" (maybe hours later) would squeeze its bars
    const completed = t.rows.length > 0 && t.rows.every(w => w.status === 'completed');
    const times: number[] = completed ? [] : [this.now];
    t.rows.forEach(w => [w.plannedStart, w.estStart, w.estEnd].forEach(x => x !== null && times.push(x)));
    if (r.target !== null) {
      times.push(r.target);
    }
    if (times.length === 0) {
      times.push(this.now);
    }
    let t0 = Math.min(...times);
    let t1 = Math.max(...times);
    if (t1 - t0 < MIN_SPAN_MS) {
      t1 = t0 + MIN_SPAN_MS;
    }
    const pad = (t1 - t0) * 0.04;
    t0 -= pad;
    t1 += pad;
    const x = (ms: number) => LABEL_W + (ms - t0) / (t1 - t0) * (GANTT_W - LABEL_W - 10);
    // grid adapted to the span: every 5 minutes for normal paths, every minute up to 30 minutes, every
    // 30 seconds up to 10 minutes (executions of seconds). Labels on grid lines with enough room; labels
    // with seconds when they are less than a minute apart. Very long spans keep at most ~600 grid lines.
    const span = t1 - t0;
    const pxPerMs = (GANTT_W - LABEL_W - 10) / span;
    let grid = span <= 10 * 60000 ? 30000 : (span <= 30 * 60000 ? 60000 : 5 * 60000);
    if (span / grid > 600) {
      grid = Math.ceil(span / 600 / (5 * 60000)) * 5 * 60000;
    }
    const labelSteps = [0.5, 1, 2, 5, 10, 15, 30, 60, 120, 180, 360, 720, 1440].map(m => m * 60000)
      .filter(st => st >= grid && st % grid === 0);
    const labelStep = labelSteps.find(st => st * pxPerMs >= LABEL_GAP) || labelSteps[labelSteps.length - 1] || grid;
    const label = (v: number) => (labelStep < 60000 ? this.formatTime(v) : this.formatAxis(v));
    const ticks: { x: number; label: string; major: boolean }[] = [];
    for (let v = Math.ceil(t0 / grid) * grid; v <= t1; v += grid) {
      const major = v % labelStep === 0;
      ticks.push({x: x(v), label: major ? label(v) : '', major});
    }
    const bars = t.rows.map((w: WorkflowTiming, i: number) => {
      const y = TOP + i * ROW_H;
      const start = w.estStart;
      const end = w.estEnd;
      const has = start !== null && end !== null;
      const bx = has ? x(start) : LABEL_W + 4;
      const bw = has ? Math.max(4, x(end) - x(start)) : 0;
      const waitW = has && w.waitMs > 0 ? Math.min(bx - LABEL_W, x(start) - x(start - w.waitMs)) : 0;
      return {
        path: w.path, name: r.names.get(w.path) || w.path, y, x: bx, w: bw,
        short: this.shortName(r.names.get(w.path) || w.path),
        cls: w.status, dashed: w.status === 'scheduled' || w.status === 'waiting' || w.status === 'intervention',
        waitX: bx - waitW, waitW,
        label: has ? '' : (w.status === 'missing' ? 'missing' : 'open')
      };
    });
    return {
      width: GANTT_W, height: TOP + t.rows.length * ROW_H + 26, ticks, bars,
      nowX: this.now >= t0 && this.now <= t1 ? x(this.now) : null, targetX: r.target !== null ? x(r.target) : null, endX: t.estEnd !== null ? x(t.estEnd) : null
    };
  }
}
