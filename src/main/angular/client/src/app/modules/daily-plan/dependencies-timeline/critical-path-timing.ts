/**
 * JOC-2343 Daily Plan -> Timeline: timing of a Critical Path.
 *
 * Pure functions (no Angular), so the calculation can be unit-tested. The Critical Path (workflows, step
 * levels, notice edges) comes from the Dependencies analysis; this file only adds time.
 *
 * Definitions (agreed with Andreas):
 * - net time: execution time of a workflow = its average time consumption (from successful runs);
 * - gross time: includes waiting for notices; saving = gross - net (time a user can gain);
 * - the first set of orders counts (one entry per workflow, the earliest order of the Plan day);
 * - failed, suspended, broken or blocked orders delay the path: the estimate assumes they are resolved now;
 * - only orders that are not started yet (scheduled, planned, pending, blocked) can be moved.
 */
import {DepEdge, DepNode} from '../dependencies/dependency-graph.model';

export type TimingStatus = 'completed' | 'running' | 'waiting' | 'scheduled' | 'intervention' | 'missing' | 'unneeded';

/** What is known about a workflow of the path on the Plan day. */
export interface WorkflowFacts {
  /** average time consumption in ms; null = no data */
  avgMs: number | null;
  /** the average is test data (until the server provides it) */
  testData?: boolean;
  /** state of the first order of the Plan day (upper case), null = no order */
  state: string | null;
  orderId?: string | null;
  /** the workflow's orders completed today (order history) */
  completed?: boolean;
  /** planned start of the first order (ms) */
  scheduledFor?: number | null;
  /** actual start / end from the order history (ms) */
  startedAt?: number | null;
  endedAt?: number | null;
  /** a workflow without order that the path needs (Dependencies: neededMissing) */
  neededMissing?: boolean;
}

export interface WorkflowTiming {
  path: string;
  status: TimingStatus;
  avgMs: number | null;
  testData: boolean;
  plannedStart: number | null;
  estStart: number | null;
  estEnd: number | null;
  /** waiting for notices before the start (ms) */
  waitMs: number;
  /** the order can be moved (not started yet) */
  movable: boolean;
  orderId: string | null;
  /** the upstream workflow that determines the start (critical chain) */
  drivenBy: string | null;
}

export interface PathTiming {
  workflows: Map<string, WorkflowTiming>;
  /** workflows in display order (step order) without the ones the path does not need */
  rows: WorkflowTiming[];
  start: number | null;
  /** estimated completion; null if the path cannot complete (a needed workflow has no order) */
  estEnd: number | null;
  cannotComplete: boolean;
  /** the estimate assumes that failed / suspended / blocked orders are resolved now */
  interventionNeeded: boolean;
  /** at least one workflow on the critical chain has no time consumption data */
  noData: boolean;
  testData: boolean;
  netMs: number;
  grossMs: number;
  savingMs: number;
  /** critical chain: the workflows that determine the completion time, first to last */
  chain: string[];
}

export interface TargetPlanEntry {
  path: string;
  orderId: string | null;
  latestStart: number;
  latestEnd: number;
  /** the order is moved to latestStart */
  move: boolean;
  /** latestStart is in the past, or a started workflow ends after latestEnd */
  tooLate: boolean;
}

export interface TargetPlan {
  target: number;
  entries: TargetPlanEntry[];
  /** earliest possible completion if every movable order starts as early as possible */
  earliestEnd: number | null;
  reachable: boolean;
}

const RUNNING = ['RUNNING', 'INPROGRESS', 'PROMPTING'];
const WAITING = ['WAITING', 'EXPECTING'];
const SCHEDULED = ['SCHEDULED', 'PLANNED', 'PENDING'];
const INTERVENTION = ['FAILED', 'SUSPENDED', 'BROKEN', 'BLOCKED'];
/** states in which the Daily Plan allows to modify the start time */
const MOVABLE = ['SCHEDULED', 'PLANNED', 'PENDING', 'BLOCKED'];

/** Predecessors per workflow inside the path, without self edges and back edges of a circle. */
function predecessors(order: DepNode[], levels: Map<string, number>, edges: DepEdge[]): Map<string, string[]> {
  const inPath = new Set(order.map(n => n.path));
  const preds = new Map<string, string[]>();
  order.forEach(n => preds.set(n.path, []));
  edges.forEach(e => {
    if (e.from === e.to || !inPath.has(e.from) || !inPath.has(e.to)) {
      return;
    }
    if ((levels.get(e.from) ?? 0) >= (levels.get(e.to) ?? 0)) {
      return;
    }
    const list = preds.get(e.to);
    if (!list.includes(e.from)) {
      list.push(e.from);
    }
  });
  return preds;
}

function byLevel(order: DepNode[], levels: Map<string, number>): DepNode[] {
  return order.map((n, i) => ({n, i}))
    .sort((a, b) => ((levels.get(a.n.path) ?? 0) - (levels.get(b.n.path) ?? 0)) || (a.i - b.i))
    .map(x => x.n);
}

/**
 * Forward pass: estimated start and end per workflow, the path's completion time, net / gross / saving
 * and the critical chain. "now" is passed in for testability. With earliest = true, movable orders are
 * assumed to start as early as possible (used for the earliest possible completion).
 */
export function computePathTiming(order: DepNode[], levels: Map<string, number>, edges: DepEdge[],
                                  facts: Map<string, WorkflowFacts>, now: number, earliest = false): PathTiming {
  const preds = predecessors(order, levels, edges);
  const workflows = new Map<string, WorkflowTiming>();
  let cannotComplete = false;
  let interventionNeeded = false;

  for (const n of byLevel(order, levels)) {
    const f: WorkflowFacts = facts.get(n.path) || {avgMs: null, state: null};
    const avg = f.avgMs ?? 0;
    // upstream: the latest estimated end of the workflows whose notices this one needs
    let upEnd: number | null = null;
    let drivenBy: string | null = null;
    let upOpen = false;
    for (const p of preds.get(n.path) || []) {
      const t = workflows.get(p);
      if (!t || t.status === 'unneeded') {
        continue;
      }
      if (t.estEnd === null) {
        upOpen = true;
        continue;
      }
      if (upEnd === null || t.estEnd > upEnd) {
        upEnd = t.estEnd;
        drivenBy = p;
      }
    }
    const state = f.state ? f.state.toUpperCase() : null;
    const t: WorkflowTiming = {
      path: n.path, status: 'scheduled', avgMs: f.avgMs, testData: !!f.testData, plannedStart: f.scheduledFor ?? null,
      estStart: null, estEnd: null, waitMs: 0, movable: false, orderId: f.orderId ?? null, drivenBy
    };
    if (f.completed || state === 'FINISHED' || state === 'COMPLETED') {
      t.status = 'completed';
      t.estEnd = f.endedAt ?? f.startedAt ?? now;
      t.estStart = f.startedAt ?? (t.estEnd - avg);
      t.drivenBy = drivenBy;
    } else if (!state) {
      if (f.neededMissing) {
        t.status = 'missing';
        cannotComplete = true;
      } else {
        t.status = 'unneeded';
      }
    } else if (RUNNING.includes(state)) {
      t.status = 'running';
      t.estStart = f.startedAt ?? f.scheduledFor ?? now;
      t.estEnd = Math.max(now, t.estStart + avg);
    } else if (upOpen) {
      // an upstream workflow cannot complete: neither can this one
      t.status = INTERVENTION.includes(state) ? 'intervention' : (WAITING.includes(state) ? 'waiting' : 'scheduled');
      t.movable = MOVABLE.includes(state);
    } else if (WAITING.includes(state)) {
      t.status = 'waiting';
      t.estStart = Math.max(now, upEnd ?? now);
      t.estEnd = t.estStart + avg;
    } else if (INTERVENTION.includes(state)) {
      t.status = 'intervention';
      interventionNeeded = true;
      t.movable = MOVABLE.includes(state);
      t.estStart = Math.max(now, upEnd ?? now);
      t.estEnd = t.estStart + avg;
    } else {
      // scheduled / planned / pending (and unknown states): starts at its planned time, not before the
      // upstream notices are there, never in the past
      t.status = 'scheduled';
      t.movable = MOVABLE.includes(state) || SCHEDULED.includes(state);
      const own = earliest && t.movable ? now : (f.scheduledFor ?? now);
      t.estStart = Math.max(own, upEnd ?? own, now);
      t.estEnd = t.estStart + avg;
    }
    // waiting time: from the planned start until the actual / estimated start (notices not yet there,
    // or the order is late)
    if (t.estStart !== null && t.plannedStart !== null) {
      t.waitMs = Math.max(0, t.estStart - t.plannedStart);
    }
    workflows.set(n.path, t);
  }

  const rows = order.map(n => workflows.get(n.path)).filter(t => t && t.status !== 'unneeded');
  const ends = rows.filter(t => t.estEnd !== null);
  const estEnd = cannotComplete || rows.some(t => t.estEnd === null) ? null
    : (ends.length ? Math.max(...ends.map(t => t.estEnd)) : null);
  const starts = rows.filter(t => t.estStart !== null).map(t => t.estStart);
  const start = starts.length ? Math.min(...starts) : null;

  // critical chain: back from the workflow that ends last along drivenBy
  const chain: string[] = [];
  const last = ends.length ? ends.reduce((a, b) => (b.estEnd > a.estEnd ? b : a)) : null;
  const seen = new Set<string>();
  for (let cur = last; cur && !seen.has(cur.path); cur = cur.drivenBy ? workflows.get(cur.drivenBy) : null) {
    seen.add(cur.path);
    chain.unshift(cur.path);
  }
  const chainTimings = chain.map(p => workflows.get(p));
  const netMs = chainTimings.reduce((s, t) => s + (t.avgMs ?? 0), 0);
  const chainStart = chainTimings.length && chainTimings[0].estStart !== null ? chainTimings[0].estStart : start;
  const grossMs = estEnd !== null && chainStart !== null ? Math.max(0, estEnd - chainStart) : 0;
  return {
    workflows, rows, start, estEnd, cannotComplete, interventionNeeded,
    noData: chainTimings.some(t => t.avgMs === null) || rows.some(t => t.avgMs === null),
    testData: rows.some(t => t.testData),
    netMs, grossMs, savingMs: Math.max(0, grossMs - netMs), chain
  };
}

/**
 * Backward pass for a target completion time: the latest start of every workflow so that the path ends by
 * the target. Orders that are not started yet are moved to their latest start; it is too late if a latest
 * start is in the past or a started workflow is estimated to end after its latest end.
 */
export function planForTarget(order: DepNode[], levels: Map<string, number>, edges: DepEdge[],
                              facts: Map<string, WorkflowFacts>, timing: PathTiming, target: number, now: number): TargetPlan {
  const preds = predecessors(order, levels, edges);
  const succ = new Map<string, string[]>();
  order.forEach(n => succ.set(n.path, []));
  preds.forEach((list, to) => list.forEach(from => succ.get(from)?.push(to)));

  const latestStart = new Map<string, number>();
  const entries: TargetPlanEntry[] = [];
  for (const n of byLevel(order, levels).reverse()) {
    const t = timing.workflows.get(n.path);
    if (!t || t.status === 'unneeded') {
      continue;
    }
    const nexts = (succ.get(n.path) || []).filter(s => latestStart.has(s)).map(s => latestStart.get(s));
    const latestEnd = nexts.length ? Math.min(target, ...nexts) : target;
    const ls = latestEnd - (t.avgMs ?? 0);
    latestStart.set(n.path, ls);
    const started = t.status === 'completed' || t.status === 'running' || t.status === 'waiting';
    const tooLate = t.movable ? ls < now : (started && t.status !== 'completed' && t.estEnd !== null && t.estEnd > latestEnd);
    entries.push({path: n.path, orderId: t.orderId, latestStart: ls, latestEnd, move: t.movable && !tooLate, tooLate});
  }
  entries.reverse();
  const earliest = computePathTiming(order, levels, edges, facts, now, true);
  return {
    target, entries, earliestEnd: earliest.estEnd,
    reachable: earliest.estEnd !== null && earliest.estEnd <= target && !entries.some(e => e.tooLate && !e.move && e.orderId)
  };
}

/** Test data for time consumption until the server provides averages: stable per workflow, 5-45 min. */
export function testAverageMs(path: string): number {
  let h = 0;
  for (let i = 0; i < path.length; i++) {
    h = (h * 31 + path.charCodeAt(i)) | 0;
  }
  return (5 + Math.abs(h) % 41) * 60000;
}
