/**
 * JOC-2320: Dependency graph model for the Daily Plan "Dependencies" view.
 *
 * Pure TypeScript (no Angular, no mxGraph) so it can be unit-tested and, if ever
 * needed, moved into a Web Worker. It is built once per API response; paging,
 * search and opening a path only read from it.
 *
 * Input: the response of `workflows/boards/snapshot` (or `workflows/boards`). The data is
 * live (orders can be added or cancelled at any time), so the model is rebuilt for every
 * response and never kept across requests.
 *
 *   postingWorkflows / expectingWorkflows / consumingWorkflows / noticeBoards / orders
 *
 * Optionally the Controller's orders of the Plan (existing `orders` API): the snapshot lists only
 * orders that wait at or are due to post a notice, so without them a workflow whose order has not
 * reached a notice instruction yet would look as if it had no order. The Controller knows all
 * orders, including ad hoc orders that are not part of the Daily Plan.
 */

/** An order the Controller knows for a workflow in this Plan (from the `orders` API). */
export interface PlanOrder {
  orderId: string;
  workflowPath: string;
  /** live order state, e.g. SCHEDULED, RUNNING, WAITING, SUSPENDED, FAILED */
  state?: string;
}

export type DepState = 'action' | 'expecting' | 'normal' | 'none';
export type BoardState = 'expected' | 'posted' | 'announced' | 'none';
export type EdgeKind = 'expect' | 'consume';

export interface DepNode {
  path: string;
  name: string;
  folder: string;
  postNotices: string[];
  expectNotices: string[];
  consumeNotices: string[];
  expectingOrderIds: string[];
  presentDueOrderIds: string[];
  futureDueOrderIds: string[];
  /** orders of this workflow in the Plan that are not (yet) at a notice instruction */
  planOrderIds: string[];
  /** number of orders waiting at a notice instruction, as counted by the API */
  numOfExpectingOrders: number;
  orderIds: string[];
  state: DepState;
  /** at least one order is FAILED, SUSPENDED or BROKEN */
  failed: boolean;
  /** the most severe of these states, e.g. 'SUSPENDED'; null if none */
  criticalState: string | null;
  /** lower-case text used by the search */
  searchText: string;
  /** expected or consumed notices that no workflow posts in this Plan */
  unmatchedNotices: string[];
}

export interface DepEdge {
  id: number;
  from: string;
  to: string;
  board: string;
  kind: EdgeKind;
  boardState: BoardState;
  /** the notice is still expected and the receiver is waiting for it */
  blocking: boolean;
}

export interface DepGroup {
  id: string;
  nodes: string[];
  edges: DepEdge[];
  starts: string[];
  ends: string[];
  state: DepState;
  failed: boolean;
  postedEdges: number;
  depth: number;
  folder: string;
  /** exactly two workflows: shown folded in the overview */
  isSimple: boolean;
  searchText: string;
}

export interface DepGraph {
  nodes: Map<string, DepNode>;
  edges: DepEdge[];
  outgoing: Map<string, DepEdge[]>;
  incoming: Map<string, DepEdge[]>;
  boards: Map<string, any>;
  groups: DepGroup[];
  groupOf: Map<string, DepGroup>;
  /** workflows that post or receive but have no counterpart in this Plan (and are not waiting) */
  isolatedCount: number;
  boardCount: number;
  /** board by name (as referenced by workflows) or path */
  boardOf: (name: string) => any;
}

export interface TraverseResult {
  nodes: Set<string>;
  beyondUp: number;
  beyondDown: number;
}

const CRITICAL_ORDER_STATES = ['FAILED', 'SUSPENDED', 'BROKEN'];
const STATE_RANK: Record<DepState, number> = {action: 0, expecting: 1, normal: 2, none: 3};

function toArray(value: any): any[] {
  if (!value) {
    return [];
  }
  return Array.isArray(value) ? value : Object.values(value);
}

function uniq(values: string[]): string[] {
  return Array.from(new Set(values));
}

export function folderOf(path: string): string {
  if (!path) {
    return '/';
  }
  const i = path.lastIndexOf('/');
  return i <= 0 ? '/' : path.substring(0, i);
}

export function nameOf(path: string): string {
  return path ? path.split('/').pop() : '';
}

export function worseState(a: DepState, b: DepState): DepState {
  return STATE_RANK[a] <= STATE_RANK[b] ? a : b;
}

export function stateRank(state: DepState): number {
  return STATE_RANK[state];
}

/**
 * Numbers of expected, posted and announced notices of a board. Uses the counters of the
 * response and, where they are missing, the states of the board's notices.
 */
export function boardCounts(board: any): { expected: number; posted: number; announced: number } {
  const counts = {expected: 0, posted: 0, announced: 0};
  if (!board) {
    return counts;
  }
  const hasCounters = board.numOfExpectedNotices != null || board.numOfPostedNotices != null || board.numOfAnnouncements != null;
  if (hasCounters) {
    counts.expected = board.numOfExpectedNotices || 0;
    counts.posted = board.numOfPostedNotices || 0;
    counts.announced = board.numOfAnnouncements || 0;
    return counts;
  }
  toArray(board.notices).forEach((n: any) => {
    const st = String(n?.state?._text || n?.state || '').toUpperCase();
    if (st === 'EXPECTED') {
      counts.expected++;
    } else if (st === 'POSTED') {
      counts.posted++;
    } else if (st === 'ANNOUNCED') {
      counts.announced++;
    }
  });
  return counts;
}

export function boardStateOf(board: any): BoardState {
  const c = boardCounts(board);
  if (c.expected > 0) {
    return 'expected';
  }
  if (c.posted > 0) {
    return 'posted';
  }
  if (c.announced > 0) {
    return 'announced';
  }
  return 'none';
}

/** All Notice Boards a Critical Path refers to: posted, expected or consumed by its workflows. */
export function groupBoards(graph: DepGraph, g: DepGroup): string[] {
  const set = new Set<string>();
  g.nodes.forEach(p => {
    const n = graph.nodes.get(p);
    n.postNotices.forEach(b => set.add(b));
    n.expectNotices.forEach(b => set.add(b));
    n.consumeNotices.forEach(b => set.add(b));
  });
  return Array.from(set);
}

/** Same colour rules as the previous view, merged over all roles of a workflow. */
function computeState(n: DepNode): DepState {
  const isPoster = n.postNotices.length > 0;
  const isReceiver = n.expectNotices.length > 0 || n.consumeNotices.length > 0;
  // the count is available even if no order IDs are delivered
  const expecting = n.expectingOrderIds.length > 0 || n.numOfExpectingOrders > 0;
  if (n.orderIds.length === 0 && !expecting) {
    return 'none';
  }
  if ((isPoster && n.futureDueOrderIds.length > 0) || (isReceiver && n.presentDueOrderIds.length > 0)) {
    return 'action';
  }
  if (isReceiver && expecting) {
    return 'expecting';
  }
  return 'normal';
}

function commonFolder(folders: string[]): string {
  if (folders.length === 0) {
    return '/';
  }
  let parts = folders[0].split('/');
  for (let i = 1; i < folders.length && parts.length > 1; i++) {
    const other = folders[i].split('/');
    let k = 0;
    while (k < parts.length && k < other.length && parts[k] === other[k]) {
      k++;
    }
    parts = parts.slice(0, k);
  }
  const result = parts.join('/');
  return result || '/';
}

/**
 * Longest-path levels (Kahn). Nodes on a cycle get levels after all others,
 * so the layout never loops.
 */
export function computeLevels(nodeIds: string[], links: { from: string; to: string }[]): Map<string, number> {
  const indeg = new Map<string, number>();
  const out = new Map<string, string[]>();
  nodeIds.forEach(id => {
    indeg.set(id, 0);
    out.set(id, []);
  });
  links.forEach(l => {
    if (indeg.has(l.from) && indeg.has(l.to) && l.from !== l.to) {
      out.get(l.from).push(l.to);
      indeg.set(l.to, indeg.get(l.to) + 1);
    }
  });
  const level = new Map<string, number>();
  const queue: string[] = [];
  nodeIds.forEach(id => {
    if (indeg.get(id) === 0) {
      queue.push(id);
      level.set(id, 0);
    }
  });
  let head = 0;
  while (head < queue.length) {
    const id = queue[head++];
    const lv = level.get(id);
    for (const next of out.get(id)) {
      level.set(next, Math.max(level.get(next) ?? 0, lv + 1));
      const d = indeg.get(next) - 1;
      indeg.set(next, d);
      if (d === 0) {
        queue.push(next);
      }
    }
  }
  if (level.size < nodeIds.length) {
    let max = 0;
    level.forEach(v => max = Math.max(max, v));
    nodeIds.forEach(id => {
      if (!level.has(id) || indeg.get(id) > 0) {
        level.set(id, ++max);
      }
    });
  }
  return level;
}

/** Builds the whole model once per snapshot. Cost is linear in workflows + edges. */
export function buildDependencyGraph(data: any, planOrders: PlanOrder[] = []): DepGraph {
  const nodes = new Map<string, DepNode>();
  const boards = new Map<string, any>();

  // Boards are referenced by name in the workflows but may be keyed by name or by path:
  // index each board under its key, its name, its path and the last part of its path.
  const indexBoard = (key: string | null, b: any) => {
    const keys = [key, b?.name, b?.path, nameOf(b?.path), nameOf(key || '')];
    keys.filter(Boolean).forEach(k => {
      if (!boards.has(k)) {
        boards.set(k, b);
      }
    });
  };
  const rawBoards = data?.noticeBoards;
  if (rawBoards) {
    if (Array.isArray(rawBoards)) {
      rawBoards.forEach(b => indexBoard(null, b));
    } else {
      Object.keys(rawBoards).forEach(key => indexBoard(key, rawBoards[key]));
    }
  }
  const boardOf = (name: string) => boards.get(name) ?? boards.get(nameOf(name));

  const orderStates = new Map<string, string>();
  const ordersByWorkflow = new Map<string, string[]>();
  const addPlanOrder = (path: string, orderId: string) => {
    if (!path || !orderId) {
      return;
    }
    if (!ordersByWorkflow.has(path)) {
      ordersByWorkflow.set(path, []);
    }
    ordersByWorkflow.get(path).push(orderId);
  };
  toArray(data?.orders).forEach((o: any) => {
    if (o?.orderId) {
      orderStates.set(o.orderId, o.state?._text);
      addPlanOrder(o.workflowId?.path || o.workflowPath, o.orderId);
    }
  });
  (planOrders || []).forEach(o => {
    if (o?.orderId) {
      // the Controller's live state wins
      if (o.state) {
        orderStates.set(o.orderId, o.state);
      }
      addPlanOrder(o.workflowPath, o.orderId);
    }
  });

  const merge = (w: any) => {
    if (!w?.path) {
      return;
    }
    let n = nodes.get(w.path);
    if (!n) {
      n = {
        path: w.path,
        name: nameOf(w.path),
        folder: folderOf(w.path),
        postNotices: [], expectNotices: [], consumeNotices: [],
        expectingOrderIds: [], presentDueOrderIds: [], futureDueOrderIds: [],
        planOrderIds: [], numOfExpectingOrders: 0, orderIds: [], state: 'none', failed: false, criticalState: null, searchText: '', unmatchedNotices: []
      };
      nodes.set(w.path, n);
    }
    n.postNotices.push(...(w.postNotices || []));
    n.expectNotices.push(...(w.expectNotices || []));
    n.consumeNotices.push(...(w.consumeNotices || []));
    n.expectingOrderIds.push(...(w.expectingOrderIds || []));
    n.presentDueOrderIds.push(...(w.presentDueOrderIds || []));
    n.futureDueOrderIds.push(...(w.futureDueOrderIds || []));
    n.numOfExpectingOrders = Math.max(n.numOfExpectingOrders, w.numOfExpectingOrders || 0);
  };
  toArray(data?.postingWorkflows).forEach(merge);
  toArray(data?.expectingWorkflows).forEach(merge);
  toArray(data?.consumingWorkflows).forEach(merge);

  const posters = new Map<string, string[]>();
  const referencedBoards = new Set<string>();
  nodes.forEach(n => {
    n.postNotices = uniq(n.postNotices);
    n.expectNotices = uniq(n.expectNotices);
    n.consumeNotices = uniq(n.consumeNotices);
    n.expectingOrderIds = uniq(n.expectingOrderIds);
    n.presentDueOrderIds = uniq(n.presentDueOrderIds);
    n.futureDueOrderIds = uniq(n.futureDueOrderIds);
    const atNotice = new Set([...n.expectingOrderIds, ...n.presentDueOrderIds, ...n.futureDueOrderIds]);
    n.planOrderIds = uniq(ordersByWorkflow.get(n.path) || []).filter(id => !atNotice.has(id));
    n.orderIds = uniq([...atNotice, ...n.planOrderIds]);
    n.state = computeState(n);
    const critical = n.orderIds.map(id => orderStates.get(id)).filter(st => CRITICAL_ORDER_STATES.includes(st));
    n.failed = critical.length > 0;
    n.criticalState = CRITICAL_ORDER_STATES.find(st => critical.includes(st)) || null;
    n.searchText = [n.path, ...n.postNotices, ...n.expectNotices, ...n.consumeNotices].join(' ').toLowerCase();
    n.postNotices.forEach(b => {
      referencedBoards.add(b);
      if (!posters.has(b)) {
        posters.set(b, []);
      }
      posters.get(b).push(n.path);
    });
    n.expectNotices.forEach(b => referencedBoards.add(b));
    n.consumeNotices.forEach(b => referencedBoards.add(b));
  });

  nodes.forEach(n => {
    n.unmatchedNotices = uniq([...n.expectNotices, ...n.consumeNotices]).filter(b => !posters.has(b));
  });

  const edges: DepEdge[] = [];
  const outgoing = new Map<string, DepEdge[]>();
  const incoming = new Map<string, DepEdge[]>();
  nodes.forEach((_, p) => {
    outgoing.set(p, []);
    incoming.set(p, []);
  });
  const seen = new Set<string>();
  const addEdges = (receiver: DepNode, boardName: string, kind: EdgeKind) => {
    const from = posters.get(boardName);
    if (!from) {
      return;
    }
    const board = boardOf(boardName);
    const bState = boardStateOf(board);
    for (const posterPath of from) {
      if (posterPath === receiver.path) {
        continue;
      }
      const key = posterPath + '\u0000' + receiver.path + '\u0000' + boardName + '\u0000' + kind;
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      const edge: DepEdge = {
        id: edges.length,
        from: posterPath,
        to: receiver.path,
        board: boardName,
        kind,
        boardState: bState,
        blocking: bState === 'expected' && receiver.state === 'expecting'
      };
      edges.push(edge);
      outgoing.get(posterPath).push(edge);
      incoming.get(receiver.path).push(edge);
    }
  };
  nodes.forEach(n => {
    n.expectNotices.forEach(b => addEdges(n, b, 'expect'));
    n.consumeNotices.forEach(b => addEdges(n, b, 'consume'));
  });

  // connected groups (union-find)
  const parent = new Map<string, string>();
  const find = (x: string): string => {
    let r = x;
    while (parent.get(r) !== r) {
      r = parent.get(r);
    }
    let c = x;
    while (parent.get(c) !== r) {
      const next = parent.get(c);
      parent.set(c, r);
      c = next;
    }
    return r;
  };
  nodes.forEach((_, p) => parent.set(p, p));
  edges.forEach(e => {
    const a = find(e.from);
    const b = find(e.to);
    if (a !== b) {
      parent.set(a, b);
    }
  });
  const members = new Map<string, string[]>();
  let isolatedCount = 0;
  nodes.forEach((_, p) => {
    if (outgoing.get(p).length === 0 && incoming.get(p).length === 0) {
      const n = nodes.get(p);
      // A workflow with orders that waits for a notice no workflow posts can never continue:
      // it is shown as a path of its own so that this critical situation is visible.
      if (!(n.unmatchedNotices.length > 0 && n.orderIds.length > 0)) {
        isolatedCount++;
        return;
      }
    }
    const r = find(p);
    if (!members.has(r)) {
      members.set(r, []);
    }
    members.get(r).push(p);
  });
  const edgesByRoot = new Map<string, DepEdge[]>();
  edges.forEach(e => {
    const r = find(e.from);
    if (!edgesByRoot.has(r)) {
      edgesByRoot.set(r, []);
    }
    edgesByRoot.get(r).push(e);
  });

  const groups: DepGroup[] = [];
  const groupOf = new Map<string, DepGroup>();
  members.forEach((paths, root) => {
    paths.sort();
    const gEdges = edgesByRoot.get(root) || [];
    const hasIn = new Set(gEdges.map(e => e.to));
    const hasOut = new Set(gEdges.map(e => e.from));
    let state: DepState = 'none';
    let failed = false;
    const texts: string[] = [];
    paths.forEach(p => {
      const n = nodes.get(p);
      state = worseState(state, n.state);
      failed = failed || n.failed;
      texts.push(n.searchText);
    });
    const levels = computeLevels(paths, gEdges);
    let depth = 0;
    levels.forEach(v => depth = Math.max(depth, v));
    const group: DepGroup = {
      id: paths[0],
      nodes: paths,
      edges: gEdges,
      starts: paths.filter(p => !hasIn.has(p)),
      ends: paths.filter(p => !hasOut.has(p)),
      state,
      failed,
      postedEdges: gEdges.filter(e => e.boardState === 'posted').length,
      depth,
      folder: commonFolder(paths.map(p => nodes.get(p).folder)),
      isSimple: paths.length === 2,
      searchText: texts.join(' ')
    };
    groups.push(group);
    paths.forEach(p => groupOf.set(p, group));
  });
  groups.sort((a, b) =>
    (a.failed === b.failed ? 0 : a.failed ? -1 : 1) ||
    STATE_RANK[a.state] - STATE_RANK[b.state] ||
    b.nodes.length - a.nodes.length ||
    a.id.localeCompare(b.id));

  return {
    nodes, edges, outgoing, incoming, boards, groups, groupOf, isolatedCount,
    boardCount: referencedBoards.size,
    boardOf
  };
}

/**
 * Upstream/downstream walk from one workflow. depth < 0 means "all levels".
 * beyondUp/beyondDown count the workflows one level past the limit.
 */
export function traverse(graph: DepGraph, start: string, upDepth: number, downDepth: number): TraverseResult {
  const result = new Set<string>([start]);
  const walk = (depth: number, next: (p: string) => string[]): number => {
    let frontier = [start];
    const seen = new Set<string>([start]);
    let level = 0;
    while (frontier.length > 0) {
      const candidates: string[] = [];
      frontier.forEach(p => next(p).forEach(q => {
        if (!seen.has(q)) {
          seen.add(q);
          candidates.push(q);
        }
      }));
      if (depth >= 0 && level >= depth) {
        return candidates.length;
      }
      candidates.forEach(q => result.add(q));
      frontier = candidates;
      level++;
    }
    return 0;
  };
  const beyondUp = walk(upDepth, p => (graph.incoming.get(p) || []).map(e => e.from));
  const beyondDown = walk(downDepth, p => (graph.outgoing.get(p) || []).map(e => e.to));
  return {nodes: result, beyondUp, beyondDown};
}
