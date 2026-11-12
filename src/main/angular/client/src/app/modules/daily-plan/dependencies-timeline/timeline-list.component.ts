/**
 * JOC-2343 Daily Plan -> Timeline: list of Critical Paths with estimated times; an opened path shows a Gantt
 * chart of its workflows and the target planning. Presentational: all data comes precomputed from the
 * parent (DependenciesComponent in mode 'timeline'), all actions go back as events. The page shows at most
 * one page of Critical Paths, so default change detection is cheap.
 */
import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {PathTiming, TargetPlan, WorkflowTiming} from './critical-path-timing';

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
}

interface GanttBar {
  path: string; name: string; y: number; x: number; w: number; cls: string; dashed: boolean;
  /** name for the label column: long paths are cut at the start, the workflow name stays visible */
  short: string;
  waitX: number; waitW: number; label: string;
}

interface Gantt {
  width: number; height: number;
  /** grid line every 5 minutes; label = '' for lines without text */
  ticks: { x: number; label: string; major: boolean }[];
  bars: GanttBar[]; nowX: number | null; targetX: number | null; endX: number | null;
}

/** drawing width in px: about the width of the list, so the text keeps its normal size */
const GANTT_W = 1400;
const LABEL_W = 330;
/** grid interval: every 5 minutes */
const GRID_MS = 5 * 60000;
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
  @Input() formatTime: (ms: number) => string = ms => new Date(ms).toTimeString().slice(0, 5);
  @Input() canModify = false;
  /** opened Critical Paths (owned by the parent, so that switching views can open a path) */
  @Input() expanded: Set<string> = new Set<string>();
  @Output() toggleRow = new EventEmitter<string>();

  @Output() setTarget = new EventEmitter<{ id: string; time: string }>();
  @Output() clearTarget = new EventEmitter<string>();
  @Output() applyPlan = new EventEmitter<string>();
  @Output() openDependencies = new EventEmitter<string>();
  @Output() workflowClick = new EventEmitter<string>();
  @Output() ordersClick = new EventEmitter<string>();

  targetInput = new Map<string, string>();
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

  planEntry(r: TimelineRow, path: string) {
    return r.plan?.entries.find(e => e.path === path) || null;
  }

  // ------------------------------------------------------------------ target

  submitTarget(r: TimelineRow): void {
    const v = (this.targetInput.get(r.id) || '').trim();
    if (/^\d{1,2}:\d{2}$/.test(v)) {
      this.setTarget.emit({id: r.id, time: v});
    }
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
    const times: number[] = [this.now];
    t.rows.forEach(w => [w.plannedStart, w.estStart, w.estEnd].forEach(x => x !== null && times.push(x)));
    if (r.target !== null) {
      times.push(r.target);
    }
    let t0 = Math.min(...times);
    let t1 = Math.max(...times);
    if (t1 - t0 < 30 * 60000) {
      t1 = t0 + 30 * 60000;
    }
    const pad = (t1 - t0) * 0.04;
    t0 -= pad;
    t1 += pad;
    const x = (ms: number) => LABEL_W + (ms - t0) / (t1 - t0) * (GANTT_W - LABEL_W - 10);
    // grid line every 5 minutes; time labels on every 5 minutes if there is room, otherwise on every
    // 10, 15, 30 ... minutes (always multiples of 5); very long spans keep at most ~600 grid lines
    const pxPerMs = (GANTT_W - LABEL_W - 10) / (t1 - t0);
    const grid = (t1 - t0) / GRID_MS > 600 ? Math.ceil((t1 - t0) / 600 / GRID_MS) * GRID_MS : GRID_MS;
    const labelSteps = [5, 10, 15, 30, 60, 120, 180, 360, 720, 1440].map(m => m * 60000).filter(st => st % grid === 0);
    const labelStep = labelSteps.find(st => st * pxPerMs >= LABEL_GAP) || labelSteps[labelSteps.length - 1] || grid;
    const ticks: { x: number; label: string; major: boolean }[] = [];
    for (let v = Math.ceil(t0 / grid) * grid; v <= t1; v += grid) {
      const major = v % labelStep === 0;
      ticks.push({x: x(v), label: major ? this.formatTime(v) : '', major});
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
      nowX: x(this.now), targetX: r.target !== null ? x(r.target) : null, endX: t.estEnd !== null ? x(t.estEnd) : null
    };
  }
}
