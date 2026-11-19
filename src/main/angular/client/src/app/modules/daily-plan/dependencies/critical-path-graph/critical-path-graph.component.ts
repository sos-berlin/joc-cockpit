import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {BoardState, Tri} from '../dependency-graph.model';

export type GraphRichPart = { t: 'text'; v: string } | { t: 'wf'; v: string; path: string } | { t: 'board'; v: string; name: string };

export interface CriticalPathGraphWorkflow {
  path: string;
  label: string;
  stage: number;
  stateClass: string;
  stateKey: string;
  orders: number;
  blocked: boolean;
  missing: boolean;
  match: boolean;
}

export interface CriticalPathGraphBoard {
  name: string;
  label: string;
  state: BoardState;
  value: Tri;
  noPoster: boolean;
  canPost: boolean;
}

export interface CriticalPathGraphLink {
  kind: 'post' | 'expect' | 'consume';
  workflow: string;
  board: string;
  optional: boolean;
}

export interface CriticalPathGraphData {
  workflows: CriticalPathGraphWorkflow[];
  boards: CriticalPathGraphBoard[];
  links: CriticalPathGraphLink[];
  messages: GraphRichPart[][];
}

interface FoldInfo {
  count: number;
  boards: number;
  from: number;
  to: number;
  more: number;
  matches: number;
}

interface ClusterInfo {
  workflow: string;
  count: number;
  open: boolean;
}

interface LayoutNode {
  id: string;
  type: 'wf' | 'board' | 'cluster' | 'fold' | 'waypoint';
  layer: number;
  x: number;
  y: number;
  w: number;
  h: number;
  wf?: CriticalPathGraphWorkflow;
  board?: CriticalPathGraphBoard;
  cluster?: ClusterInfo;
  fold?: FoldInfo;
  foldedReceivers?: number;
}

interface LayoutEdge {
  id: string;
  d: string;
  cls: string;
  title: string;
  arrow: boolean;
  from: string;
  to: string;
  box: Box;
}

interface Box {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

interface EdgeSpec {
  from: LayoutNode;
  to: LayoutNode;
  cls: string;
  title: string;
  trunk?: boolean;
}

interface PortEntry {
  key: EdgeSpec | 'trunk';
  y: number;
  lane: number;
}

interface Leg {
  g: number;          
  key: string;        
  ya: number;         
  yb: number;         
  turn: boolean;      
  soft: boolean;      
  junction: boolean;  
}

interface Turn {
  ya: number;         
  lo: number;         
  hi: number;
  exits: number[];    
}

const WF_W = 240;
const WF_H = 52;
const BOARD_W = 200;
const BOARD_H = 42;
const FOLD_H = 84;
const GAP_X = 64;
const GAP_Y = 14;
const PAD = 20;
const MIN_SCALE = 0.15;
const MAX_SCALE = 2;
const MIN_HEIGHT = 200;
const MAX_HEIGHT = 560;
const WF_PAGE = 50;
const END_KEEP = 5;
const LEAF_LIMIT = 4;
const LEAF_KEEP = 2;
const FRESH_MS = 4000;
const WINDOW_MARGIN = 400;
const FALLBACK_W = 1600;
const EDGE_PAD = 12;
const SIMPLE_SCALE = 0.45;
const SIMPLE_MIN_NODES = 150;
const LANE_TOP = 24;
const LANE_GAP = 12;
const LANE_AREA_MAX = 360;
const SLOT_IN = 10;
const SLOT_ARROW = 20;
const SLOT_GAP = 12;
const SLOT_MIN = 8;
const SLOT_GAP_MAX = 200;
const SIDE_GAP = 40;
const CORNER = 8;
const STRAIGHT = 0.5;
const SOFT_TURN = 8;
const PORT_GAP = 12;
const PORT_MARGIN = 8;
const WAYPOINT_H = 2;
const WAYPOINT_GAP = 6;
const WAYPOINT_MARGIN = 10;
const WAYPOINT_LIMIT = 10000;
const EDGE_CLASSES = ['posted', 'expected', 'announced', 'impossible', 'optional'];
const MARKER_CLASSES = [...EDGE_CLASSES, 'fold'];

let instanceCounter = 0;

@Component({
  standalone: false,
  selector: 'app-critical-path-graph',
  templateUrl: './critical-path-graph.component.html',
  styleUrl: './critical-path-graph.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CriticalPathGraphComponent implements OnChanges, AfterViewInit, OnDestroy {
  @Input() data: CriticalPathGraphData | null = null;
  @Input() selectedBoards: Set<string> = new Set();
  @Input() selectionSize = 0;
  @Output() workflowClick = new EventEmitter<string>();
  @Output() boardClick = new EventEmitter<string>();
  @Output() ordersClick = new EventEmitter<string>();
  @Output() boardSelect = new EventEmitter<{ board: string; checked: boolean }>();

  @ViewChild('viewport') set viewportRef(el: ElementRef<HTMLDivElement> | undefined) {
    this.viewport = el;
    this.observeViewport();
  }

  viewport?: ElementRef<HTMLDivElement>;

  readonly uid = 'cpg' + (++instanceCounter);
  readonly markerClasses = MARKER_CLASSES;

  nodes: LayoutNode[] = [];
  edges: LayoutEdge[] = [];
  visibleNodes: LayoutNode[] = [];
  visibleEdges: LayoutEdge[] = [];
  width = 0;
  height = 0;
  viewportHeight = MIN_HEIGHT;
  totalWorkflows = 0;
  shownWorkflows = 0;
  hoverId: string | null = null;
  private hotEdges = new Set<string>();
  private nearNodes = new Set<string>();

  scale = 1;
  tx = 0;
  ty = 0;
  dragging = false;

  private wfLimit = WF_PAGE;
  private openClusters = new Set<string>();
  private userMoved = false;
  private viewReady = false;
  private freshIds = new Set<string>();
  private freshTimer: any = null;
  private matchKey = '';
  private win: (Box & { scale: number }) | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private dragStart: { x: number; y: number; tx: number; ty: number } | null = null;
  private readonly onMove = (e: MouseEvent) => this.drag(e);
  private readonly onUp = () => this.endDrag();

  constructor(private cd: ChangeDetectorRef, private zone: NgZone, private translate: TranslateService) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.build();
      const key = (this.data?.workflows || []).filter(w => w.match).map(w => w.path).join('\n');
      const newSearch = key !== this.matchKey;
      this.matchKey = key;
      if (this.viewReady) {
        setTimeout(() => {
          if (key && newSearch) {
            this.initialView();
            this.focusFirstMatch();
          } else if (this.userMoved) {
            this.cd.markForCheck();
          } else {
            this.initialView();
          }
        });
      }
    }
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
    setTimeout(() => {
      this.initialView();
      this.focusFirstMatch();
    });
  }

  ngOnDestroy(): void {
    this.endDrag();
    clearTimeout(this.freshTimer);
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
  }

  isFresh(id: string): boolean {
    return this.freshIds.has(id);
  }

  hover(id: string | null): void {
    if (this.dragging || id === this.hoverId) {
      return;
    }
    this.hoverId = id;
    this.hotEdges.clear();
    this.nearNodes.clear();
    if (!id) {
      return;
    }
    this.nearNodes.add(id);
    let feedsTrunk = false;
    this.edges.forEach(e => {
      if (e.from === id || e.to === id) {
        this.hotEdges.add(e.id);
        this.nearNodes.add(e.from);
        this.nearNodes.add(e.to);
        feedsTrunk = feedsTrunk || (!e.arrow && e.to === 'fold');
      }
    });
    if (feedsTrunk || id === 'fold') {
      this.hotEdges.add('trunk');
    }
  }

  isHotEdge(e: LayoutEdge): boolean {
    return this.hotEdges.has(e.id);
  }

  isNear(id: string): boolean {
    return this.nearNodes.has(id);
  }

  get transform(): string {
    return `translate(${this.tx},${this.ty}) scale(${this.scale})`;
  }

  get simple(): boolean {
    return this.scale < SIMPLE_SCALE && this.nodes.length > SIMPLE_MIN_NODES;
  }

  simpleClass(n: LayoutNode): string {
    if (n.type === 'board') {
      return 'cpg-simple-board cpg-simple-board-' + this.boardClass(n.board);
    }
    const w = n.wf;
    let cls = 'cpg-simple-wf cpg-os-' + w.stateClass;
    if (w.stateClass === 'missing') {
      cls += ' cpg-simple-missing';
    }
    if (w.missing) {
      cls += ' cpg-simple-needed';
    }
    if (w.blocked) {
      cls += ' cpg-simple-blocked';
    }
    if (w.match) {
      cls += ' cpg-simple-match';
    }
    if (this.isFresh(n.id)) {
      cls += ' cpg-simple-new';
    }
    return cls;
  }

  get isPartial(): boolean {
    return this.shownWorkflows < this.totalWorkflows;
  }

  get canCollapse(): boolean {
    return this.wfLimit > WF_PAGE || this.openClusters.size > 0;
  }

  markerUrl(cls: string): string {
    return `url(#${this.uid}-${cls})`;
  }

  isSelected(board: string): boolean {
    return this.selectedBoards?.has(board);
  }

  boardClass(b: CriticalPathGraphBoard): string {
    if (b.noPoster && b.value === 'no') {
      return 'noposter';
    }
    if (b.value === 'yes') {
      return 'posted';
    }
    if (b.value === 'no') {
      return 'impossible';
    }
    return b.state === 'announced' ? 'announced' : 'expected';
  }

  boardStateKey(b: CriticalPathGraphBoard): string {
    if (b.noPoster && b.value === 'no') {
      return 'dailyPlan.dependencies.graph.noPoster';
    }
    return 'dailyPlan.dependencies.boardState.' + b.state;
  }

  showMore(): void {
    this.wfLimit += WF_PAGE;
    this.rebuildKeepingView();
  }

  showAll(): void {
    this.wfLimit = Number.MAX_SAFE_INTEGER;
    this.rebuildKeepingView();
  }

  toggleCluster(workflow: string): void {
    if (this.openClusters.has(workflow)) {
      this.openClusters.delete(workflow);
    } else {
      this.openClusters.add(workflow);
    }
    this.rebuildKeepingView();
  }

  collapse(): void {
    this.wfLimit = WF_PAGE;
    this.openClusters.clear();
    this.setFresh([]);
    this.build();
    this.cd.markForCheck();
    setTimeout(() => this.initialView());
  }

  private rebuildKeepingView(): void {
    const before = new Set(this.nodes.map(n => n.id));
    this.userMoved = true;
    this.build();
    const fresh = this.nodes.filter(n => (n.type === 'wf' || n.type === 'board') && !before.has(n.id));
    this.setFresh(fresh.map(n => n.id));
    this.cd.markForCheck();
    if (fresh.length > 0) {
      setTimeout(() => {
        if (!fresh.some(n => this.inView(n))) {
          this.centreOn(fresh.find(n => n.type === 'wf') || fresh[0]);
        }
      });
    }
  }

  private setFresh(ids: string[]): void {
    clearTimeout(this.freshTimer);
    this.freshIds = new Set(ids);
    if (ids.length > 0) {
      this.freshTimer = setTimeout(() => {
        this.freshIds = new Set();
        this.cd.markForCheck();
      }, FRESH_MS);
    }
  }

  private focusFirstMatch(): void {
    const first = this.nodes.find(n => n.type === 'wf' && n.wf.match);
    if (first && !this.inView(first)) {
      this.centreOn(first);
    }
  }

  private build(): void {
    this.nodes = [];
    this.edges = [];
    this.visibleNodes = [];
    this.visibleEdges = [];
    this.win = null;
    this.hoverId = null;
    this.hotEdges.clear();
    this.nearNodes.clear();
    const d = this.data;
    this.totalWorkflows = d?.workflows.length || 0;
    this.shownWorkflows = 0;
    if (!d || d.workflows.length === 0) {
      this.width = this.height = 0;
      this.viewportHeight = MIN_HEIGHT;
      return;
    }
    const t = (key: string, params?: any) => this.translate.instant(key, params);

    const ordered = [...d.workflows].sort((a, b) => (a.stage - b.stage) || a.label.localeCompare(b.label));
    const visible = new Set<string>();
    if (ordered.length <= this.wfLimit + END_KEEP) {
      ordered.forEach(w => visible.add(w.path));
    } else {
      ordered.slice(0, this.wfLimit).forEach(w => visible.add(w.path));
      const lastStage = ordered[ordered.length - 1].stage;
      ordered.filter(w => w.stage === lastStage).slice(0, END_KEEP).forEach(w => visible.add(w.path));
      ordered.filter(w => w.match && !visible.has(w.path)).slice(0, WF_PAGE).forEach(w => visible.add(w.path));
    }
    const hidden = ordered.filter(w => !visible.has(w.path));
    this.shownWorkflows = visible.size;

    const boardOf = new Map(d.boards.map(b => [b.name, b]));
    const linksOf = new Map<string, CriticalPathGraphLink[]>();
    d.links.forEach(l => {
      if (!linksOf.has(l.board)) {
        linksOf.set(l.board, []);
      }
      linksOf.get(l.board).push(l);
    });
    const isReceiveLink = (l: CriticalPathGraphLink) => l.kind !== 'post';
    const visibleBoards = new Set(d.boards
      .filter(b => (linksOf.get(b.name) || []).some(l => isReceiveLink(l) && visible.has(l.workflow)))
      .map(b => b.name));
    const boardsOfHidden = d.boards.length - visibleBoards.size;

    const leaves = new Map<string, string[]>();
    visibleBoards.forEach(name => {
      const ls = (linksOf.get(name) || []).filter(l => visible.has(l.workflow));
      const receivers = new Set(ls.filter(isReceiveLink).map(l => l.workflow));
      if (ls.some(l => l.kind === 'post') || receivers.size !== 1) {
        return;
      }
      const w = receivers.values().next().value;
      if (!leaves.has(w)) {
        leaves.set(w, []);
      }
      leaves.get(w).push(name);
    });
    const clusters = new Map<string, { info: ClusterInfo; folded: string[] }>();
    leaves.forEach((names, w) => {
      if (names.length <= LEAF_LIMIT) {
        return;
      }
      names.sort((a, b) => boardOf.get(a).label.localeCompare(boardOf.get(b).label));
      const rest = names.slice(LEAF_KEEP);
      const open = this.openClusters.has(w);
      if (!open) {
        rest.forEach(n => visibleBoards.delete(n));
      }
      clusters.set(w, {info: {workflow: w, count: rest.length, open}, folded: open ? [] : rest});
    });

    const byId = new Map<string, LayoutNode>();
    const add = (n: LayoutNode) => byId.set(n.id, n);
    ordered.filter(w => visible.has(w.path)).forEach(wf => add({
      id: 'w:' + wf.path, type: 'wf', layer: 2 * (wf.stage - 1) + 1, x: 0, y: 0, w: WF_W, h: WF_H, wf
    }));
    if (hidden.length > 0) {
      const from = Math.min(...hidden.map(w => w.stage));
      const to = Math.max(...hidden.map(w => w.stage));
      add({
        id: 'fold', type: 'fold', layer: 2 * (from - 1) + 1, x: 0, y: 0, w: WF_W, h: FOLD_H,
        fold: {
          count: hidden.length, boards: boardsOfHidden, from, to,
          more: Math.min(WF_PAGE, hidden.length),
          matches: hidden.filter(w => w.match).length
        }
      });
    }
    visibleBoards.forEach(name => add({
      id: 'b:' + name, type: 'board', layer: 0, x: 0, y: 0, w: BOARD_W, h: BOARD_H, board: boardOf.get(name)
    }));
    clusters.forEach((c, w) => add({
      id: 'c:' + w, type: 'cluster', layer: byId.get('w:' + w).layer - 1, x: 0, y: 0, w: BOARD_W, h: BOARD_H, cluster: c.info
    }));

    const specs: EdgeSpec[] = [];
    const foldNode = byId.get('fold');
    const seenFold = new Set<string>();
    const verb = (kind: string) => t(kind === 'post' ? 'dailyPlan.dependencies.label.postsNotice'
      : kind === 'consume' ? 'dailyPlan.dependencies.label.consumesFrom' : 'dailyPlan.dependencies.label.waitsForBoard');
    const postsToFold = new Map<string, number>();
    d.links.forEach(l => {
      if (l.kind === 'post' && visible.has(l.workflow) && !visibleBoards.has(l.board) && foldNode
        && (linksOf.get(l.board) || []).some(x => isReceiveLink(x) && !visible.has(x.workflow))) {
        postsToFold.set(l.workflow, (postsToFold.get(l.workflow) || 0) + 1);
      }
    });
    postsToFold.forEach((count, path) => {
      const wn = byId.get('w:' + path);
      specs.push({
        from: wn, to: foldNode, cls: 'fold', trunk: true,
        title: `${wn.wf.label} · ${t('dailyPlan.dependencies.graph.postsToFold', {count})}`
      });
    });
    const foldedReceivers = new Map<string, Set<string>>();
    d.links.forEach(l => {
      const bn = byId.get('b:' + l.board);
      if (!bn) {
        return;
      }
      const board = bn.board;
      const state = t(this.boardStateKey(board));
      let wn = byId.get('w:' + l.workflow);
      let cls = this.linkClass(l, board);
      let title = `${wn?.wf.label} · ${verb(l.kind)} · ${board.label} (${state})`;
      if (!wn) {
        if (l.kind !== 'post') {
          (foldedReceivers.get(l.board) || foldedReceivers.set(l.board, new Set()).get(l.board)).add(l.workflow);
          return;
        }
        const key = 'p\u0000' + l.board;
        if (!foldNode || seenFold.has(key)) {
          return;
        }
        seenFold.add(key);
        wn = foldNode;
        cls = 'fold';
        title = `${board.label} (${state}) · ${t(this.plural('dailyPlan.dependencies.graph.fold', hidden.length), {count: hidden.length})}`;
      }
      specs.push(l.kind === 'post' ? {from: wn, to: bn, cls, title} : {from: bn, to: wn, cls, title});
    });
    const neighbourPairs: [LayoutNode, LayoutNode][] = [];
    clusters.forEach((c, w) => {
      const cn = byId.get('c:' + w);
      const wn = byId.get('w:' + w);
      if (c.info.open) {
        neighbourPairs.push([cn, wn]);
        return;
      }
      const ls = c.folded.map(b => (linksOf.get(b) || []).find(l => isReceiveLink(l) && l.workflow === w)).filter(Boolean);
      const cls = ls.every(l => l.optional) ? 'optional'
        : ls.some(l => !l.optional && this.linkClass(l, boardOf.get(l.board)) === 'impossible') ? 'impossible' : 'expected';
      specs.push({from: cn, to: wn, cls, title: t('dailyPlan.dependencies.graph.cluster', {count: c.info.count})});
    });

    const posterLayers = new Map<string, number[]>();
    const receiverLayers = new Map<string, number[]>();
    specs.forEach(s => {
      if (s.to.type === 'board' && s.from.type !== 'fold') {
        (posterLayers.get(s.to.id) || posterLayers.set(s.to.id, []).get(s.to.id)).push(s.from.layer);
      }
      if (s.from.type === 'board') {
        (receiverLayers.get(s.from.id) || receiverLayers.set(s.from.id, []).get(s.from.id)).push(s.to.layer);
      }
    });
    byId.forEach(n => {
      if (n.type === 'board') {
        const p = posterLayers.get(n.id) || [];
        const r = receiverLayers.get(n.id) || [];
        n.layer = p.length ? Math.min(...p) + 1 : r.length ? Math.min(...r) - 1 : 0;
      }
    });
    const all = Array.from(byId.values());
    const columns = this.assignColumns(all);
    const chains = this.addWaypoints(specs, columns);
    const waypoints: LayoutNode[] = [];
    chains.forEach(chain => waypoints.push(...chain));

    const neighbours = new Map<string, LayoutNode[]>();
    const link = (a: LayoutNode, b: LayoutNode) => {
      (neighbours.get(a.id) || neighbours.set(a.id, []).get(a.id)).push(b);
      (neighbours.get(b.id) || neighbours.set(b.id, []).get(b.id)).push(a);
    };
    specs.forEach(s => {
      const way = [s.from, ...(chains.get(s) || []), s.to];
      for (let k = 0; k + 1 < way.length; k++) {
        link(way[k], way[k + 1]);
      }
    });
    neighbourPairs.forEach(([a, b]) => link(a, b));

    this.placeRows(columns, neighbours);
    this.straightenWaypoints(columns, chains);
    foldedReceivers.forEach((wfs, board) => byId.get('b:' + board).foldedReceivers = wfs.size);
    this.nodes = all;
    this.edges = this.routeEdges(specs, waypoints.length ? [...all, ...waypoints] : all, chains, foldNode);
    this.viewportHeight = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, this.height + 2));
    this.updateWindow(true);
  }

  private routeEdges(specs: EdgeSpec[], all: LayoutNode[], chains: Map<EdgeSpec, LayoutNode[]>,
                     foldNode: LayoutNode | undefined): LayoutEdge[] {
    let cols = 0;
    let bottom = -Infinity;
    all.forEach(n => {
      cols = Math.max(cols, n.layer + 1);
      bottom = Math.max(bottom, n.y + n.h);
    });
    const back = specs.filter(s => s.to.layer <= s.from.layer);

    const laneOf = new Map<EdgeSpec, number>();
    const lanes: { l: number; r: number }[][] = [];
    back.map((s, i) => ({s, i, l: s.to.layer - 1, r: s.from.layer}))
      .sort((a, b) => (a.r - a.l) - (b.r - b.l) || a.l - b.l || a.i - b.i)
      .forEach(e => {
        let lane = lanes.findIndex(used => used.every(u => u.r < e.l || e.r < u.l));
        if (lane < 0) {
          lane = lanes.push([]) - 1;
        }
        lanes[lane].push(e);
        laneOf.set(e.s, lane);
      });

    const feeders = new Set(specs.filter(s => s.trunk && s.to.layer > s.from.layer));
    const hasTrunk = !!foldNode && feeders.size >= 2;
    const entries = new Map<LayoutNode, PortEntry[]>();
    const enter = (n: LayoutNode, e: PortEntry) => (entries.get(n) || entries.set(n, []).get(n)).push(e);
    specs.forEach(s => {
      if (!(hasTrunk && feeders.has(s))) {
        const chain = chains.get(s);
        const from = chain?.length ? chain[chain.length - 1] : s.from;
        enter(s.to, {key: s, y: from.y + from.h / 2, lane: laneOf.has(s) ? laneOf.get(s) : -1});
      }
    });
    if (hasTrunk) {
      enter(foldNode, {key: 'trunk', y: foldNode.y + foldNode.h / 2, lane: -1});
    }
    const portY = new Map<EdgeSpec | 'trunk', number>();
    entries.forEach((list, n) => {
      list.sort((a, b) => a.lane < 0 && b.lane < 0 ? a.y - b.y : a.lane < 0 ? -1 : b.lane < 0 ? 1 : b.lane - a.lane);
      const step = list.length > 1 ? Math.min(PORT_GAP, (n.h - 2 * PORT_MARGIN) / (list.length - 1)) : 0;
      const mid = n.y + n.h / 2;
      list.forEach((e, j) => portY.set(e.key, mid + (j - (list.length - 1) / 2) * step));
    });
    const trunkY = hasTrunk ? portY.get('trunk') : 0;

    const legsOf = new Map<EdgeSpec, Leg[]>();
    const turns = new Map<number, Map<string, Turn>>();
    specs.forEach((s, i) => {
      if (laneOf.has(s)) {
        return;
      }
      const chain = chains.get(s) || [];
      const viaTrunk = hasTrunk && feeders.has(s);
      const heights = [...chain.map(p => p.y + p.h / 2), viaTrunk ? trunkY : portY.get(s)];
      let y = s.from.y + s.from.h / 2;
      const legs = [s.from, ...chain].map((n, k): Leg => {
        const turn = Math.abs(heights[k] - y) >= STRAIGHT;
        const junction = viaTrunk && k === chain.length;
        const leg = {g: n.layer, key: k === 0 ? 'n:' + s.from.id : `e:${i}:${k}`, ya: y, yb: turn ? heights[k] : y, turn,
          soft: turn && !junction && Math.abs(heights[k] - y) < SOFT_TURN, junction};
        y = leg.yb;
        return leg;
      });
      legsOf.set(s, legs);
      legs.filter(l => l.turn && !l.soft && !l.junction).forEach(l => {
        const inGap = turns.get(l.g) || turns.set(l.g, new Map()).get(l.g);
        const t = inGap.get(l.key);
        if (t) {
          t.lo = Math.min(t.lo, l.yb);
          t.hi = Math.max(t.hi, l.yb);
          t.exits.push(l.yb);
        } else {
          inGap.set(l.key, {ya: l.ya, lo: Math.min(l.ya, l.yb), hi: Math.max(l.ya, l.yb), exits: [l.yb]});
        }
      });
    });

    const downs = new Map<number, EdgeSpec[]>();
    const ups = new Map<number, EdgeSpec[]>();
    const addTo = (m: Map<number, EdgeSpec[]>, g: number, s: EdgeSpec) => (m.get(g) || m.set(g, []).get(g)).push(s);
    back.forEach(s => {
      addTo(downs, s.from.layer, s);
      addTo(ups, s.to.layer - 1, s);
    });
    downs.forEach(list => list.sort((a, b) => laneOf.get(a) - laneOf.get(b)));
    ups.forEach(list => list.sort((a, b) => laneOf.get(b) - laneOf.get(a)));
    const junctionGap = hasTrunk ? foldNode.layer - 1 : null;
    const turnKeys = (g: number): string[] => {
      const inGap = turns.get(g) || new Map<string, Turn>();
      const list = Array.from(inGap.entries()).map(([key, t]) => ({key, ya: t.ya, down: t.hi - t.ya >= t.ya - t.lo}));
      const byKey = (a: { key: string }, b: { key: string }) => a.key < b.key ? -1 : a.key > b.key ? 1 : 0;
      const keys = [...list.filter(t => t.down).sort((a, b) => b.ya - a.ya || byKey(a, b)),
        ...list.filter(t => !t.down).sort((a, b) => a.ya - b.ya || byKey(a, b))].map(t => t.key);
      for (let pass = 0; pass < 5; pass++) {
        let moved = false;
        for (let i = 0; i < keys.length && !moved; i++) {
          for (let j = i + 1; j < keys.length && !moved; j++) {
            const entry = inGap.get(keys[j]).ya;
            if (inGap.get(keys[i]).exits.some(y => Math.abs(y - entry) < 1)) {
              keys.splice(i, 0, keys.splice(j, 1)[0]);
              moved = true;
            }
          }
        }
        if (!moved) {
          break;
        }
      }
      return g === junctionGap ? [...keys, 'junction'] : keys;
    };
    const lines = (g: number) => (downs.get(g)?.length || 0) + (turns.get(g)?.size || 0) + (g === junctionGap ? 1 : 0)
      + (ups.get(g)?.length || 0);
    const need = (count: number) => Math.min(SLOT_GAP_MAX, SLOT_IN + SLOT_ARROW + (count - 1) * SLOT_MIN);

    const colX: number[] = [];
    const colRight: number[] = [];
    all.forEach(n => {
      colX[n.layer] = colX[n.layer] === undefined ? n.x : Math.min(colX[n.layer], n.x);
      colRight[n.layer] = colRight[n.layer] === undefined ? n.x + n.w : Math.max(colRight[n.layer], n.x + n.w);
    });
    const shift: number[] = [];
    let acc = 0;
    for (let c = 0; c < cols; c++) {
      const count = lines(c - 1);
      if (count > 0) {
        const current = c === 0 ? colX[0] : colX[c] - colRight[c - 1];
        const wanted = c === 0 ? Math.max(SIDE_GAP, need(count)) : need(count);
        acc += Math.max(0, wanted - current);
      }
      shift[c] = acc;
    }
    if (acc > 0) {
      all.forEach(n => n.x += shift[n.layer]);
      for (let c = 0; c < cols; c++) {
        colX[c] += shift[c];
        colRight[c] += shift[c];
      }
    }
    const lastLines = lines(cols - 1);
    const gapLeft = (g: number) => g < 0 ? 0 : colRight[g];
    const gapRight = (g: number) => g < cols - 1 ? colX[g + 1] : colRight[cols - 1] + Math.max(SIDE_GAP, need(lastLines));

    const downX = new Map<EdgeSpec, number>();
    const upX = new Map<EdgeSpec, number>();
    const turnX = new Map<string, number>();
    for (let g = -1; g < cols; g++) {
      const d = downs.get(g) || [];
      const t = turnKeys(g);
      const u = ups.get(g) || [];
      const count = d.length + t.length + u.length;
      if (count === 0) {
        continue;
      }
      const lo = gapLeft(g) + SLOT_IN;
      const hi = gapRight(g) - SLOT_ARROW;
      const step = count > 1 ? Math.min(SLOT_GAP, (hi - lo) / (count - 1)) : 0;
      const slot = (k: number) => (lo + hi) / 2 + (k - (count - 1) / 2) * step;
      d.forEach((s, k) => downX.set(s, slot(k)));
      t.forEach((key, k) => turnX.set(g + '|' + key, slot(d.length + k)));
      u.forEach((s, k) => upX.set(s, slot(d.length + t.length + k)));
    }

    const laneStep = lanes.length > 1 ? Math.min(LANE_GAP, LANE_AREA_MAX / (lanes.length - 1)) : 0;
    const laneY = (lane: number) => bottom + LANE_TOP + lane * laneStep;
    const right = colRight[cols - 1] + PAD;
    this.width = lastLines > 0 ? Math.max(right, gapRight(cols - 1)) : right;
    this.height = (lanes.length > 0 ? laneY(lanes.length - 1) : bottom) + PAD;

    const junction = hasTrunk ? {x: turnX.get(junctionGap + '|junction'), y: trunkY} : null;
    const edges: LayoutEdge[] = specs.map((s, i) => {
      const viaTrunk = !!junction && feeders.has(s);
      let path: string;
      if (laneOf.has(s)) {
        const y1 = s.from.y + s.from.h / 2;
        const y2 = portY.get(s);
        const ly = laneY(laneOf.get(s));
        const xd = downX.get(s);
        const xu = upX.get(s);
        path = this.roundedPath([[s.from.x + s.from.w, y1], [xd, y1], [xd, ly], [xu, ly], [xu, y2], [s.to.x, y2]]);
      } else {
        const legs = legsOf.get(s);
        const last = legs[legs.length - 1];
        let d = '';
        let pts: [number, number][] = [[s.from.x + s.from.w, legs[0].ya]];
        const add = (x: number, y: number) => {
          const p = pts[pts.length - 1];
          if (p[0] !== x || p[1] !== y) {
            pts.push([x, y]);
          }
        };
        legs.forEach(l => {
          if (l.soft) {
            const x1 = gapLeft(l.g);
            const x2 = l === last ? s.to.x : gapRight(l.g);
            const dx = (x2 - x1) / 2;
            add(x1, l.ya);
            d += this.cornerPath(pts) + ` C${x1 + dx},${l.ya} ${x2 - dx},${l.yb} ${x2},${l.yb}`;
            pts = [[x2, l.yb]];
          } else if (l.junction || l.turn) {
            const x = l.junction ? junction.x : turnX.get(l.g + '|' + l.key);
            add(x, l.ya);
            add(x, l.yb);
          }
        });
        if (!last.junction) {
          add(s.to.x, last.yb);
        }
        path = `M${s.from.x + s.from.w},${legs[0].ya}` + d + this.cornerPath(pts);
      }
      return {
        id: 'e' + i, cls: s.cls, title: s.title, arrow: !viaTrunk, from: s.from.id, to: s.to.id,
        d: path, box: this.pathBox(path)
      };
    });
    if (junction) {
      const path = `M${junction.x},${junction.y} L${foldNode.x},${junction.y}`;
      edges.push({
        id: 'trunk', cls: 'fold', arrow: true, from: 'trunk', to: 'fold', d: path, box: this.pathBox(path),
        title: this.translate.instant('dailyPlan.dependencies.graph.trunk', {count: feeders.size})
      });
    }
    return edges;
  }

  private roundedPath(pts: [number, number][]): string {
    return `M${pts[0][0]},${pts[0][1]}` + this.cornerPath(pts);
  }

  private cornerPath(pts: [number, number][]): string {
    let d = '';
    for (let i = 1; i < pts.length - 1; i++) {
      const [px, py] = pts[i - 1];
      const [x, y] = pts[i];
      const [nx, ny] = pts[i + 1];
      const r = Math.min(CORNER, Math.hypot(x - px, y - py) / 2, Math.hypot(nx - x, ny - y) / 2);
      d += ` L${x + Math.sign(px - x) * r},${y + Math.sign(py - y) * r}`;
      d += ` Q${x},${y} ${x + Math.sign(nx - x) * r},${y + Math.sign(ny - y) * r}`;
    }
    if (pts.length > 1) {
      const last = pts[pts.length - 1];
      d += ` L${last[0]},${last[1]}`;
    }
    return d;
  }

  private pathBox(path: string): Box {
    const v = (path.match(/-?\d+(?:\.\d+)?(?:e[-+]?\d+)?/gi) || []).map(Number);
    const box: Box = {x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity};
    for (let i = 0; i + 1 < v.length; i += 2) {
      box.x0 = Math.min(box.x0, v[i]);
      box.x1 = Math.max(box.x1, v[i]);
      box.y0 = Math.min(box.y0, v[i + 1]);
      box.y1 = Math.max(box.y1, v[i + 1]);
    }
    return {x0: box.x0 - EDGE_PAD, y0: box.y0 - EDGE_PAD, x1: box.x1 + EDGE_PAD, y1: box.y1 + EDGE_PAD};
  }

  private updateWindow(force = false): boolean {
    const el = this.viewport?.nativeElement;
    const vw = el?.clientWidth || Math.min(this.width, FALLBACK_W);
    const vh = el?.clientHeight || this.viewportHeight;
    const s = this.scale;
    const x0 = -this.tx / s;
    const y0 = -this.ty / s;
    const x1 = x0 + vw / s;
    const y1 = y0 + vh / s;
    const m = WINDOW_MARGIN / s;
    const w = this.win;
    if (!force && w && w.scale === s
      && x0 >= w.x0 + m / 2 && x1 <= w.x1 - m / 2 && y0 >= w.y0 + m / 2 && y1 <= w.y1 - m / 2) {
      return false;
    }
    const win = {scale: s, x0: x0 - m, y0: y0 - m, x1: x1 + m, y1: y1 + m};
    this.win = win;
    this.visibleNodes = this.nodes.filter(n => n.x < win.x1 && n.x + n.w > win.x0 && n.y < win.y1 && n.y + n.h > win.y0);
    this.visibleEdges = this.edges.filter(e => e.box.x0 < win.x1 && e.box.x1 > win.x0 && e.box.y0 < win.y1 && e.box.y1 > win.y0);
    return true;
  }

  private observeViewport(): void {
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    const el = this.viewport?.nativeElement;
    if (!el || typeof ResizeObserver === 'undefined') {
      return;
    }
    this.resizeObserver = new ResizeObserver(() => {
      if (this.updateWindow()) {
        this.cd.markForCheck();
      }
    });
    this.resizeObserver.observe(el);
  }

  private assignColumns(all: LayoutNode[]): LayoutNode[][] {
    const layerIds = Array.from(new Set(all.map(n => n.layer))).sort((a, b) => a - b);
    const columns: LayoutNode[][] = layerIds.map(id => all.filter(n => n.layer === id));
    let x = PAD;
    columns.forEach((col, i) => {
      col.forEach(n => {
        n.layer = i;
        n.x = x;
      });
      x += Math.max(...col.map(n => n.w)) + GAP_X;
    });
    return columns;
  }

  private addWaypoints(specs: EdgeSpec[], columns: LayoutNode[][]): Map<EdgeSpec, LayoutNode[]> {
    const chains = new Map<EdgeSpec, LayoutNode[]>();
    const long = specs.filter(s => s.to.layer - s.from.layer > 1);
    const count = long.reduce((sum, s) => sum + s.to.layer - s.from.layer - 1, 0);
    if (count === 0 || count > WAYPOINT_LIMIT) {
      return chains;
    }
    const colX = columns.map(col => col[0].x);
    const colW = columns.map(col => Math.max(...col.map(n => n.w)));
    long.forEach((s, i) => {
      const chain: LayoutNode[] = [];
      for (let c = s.from.layer + 1; c < s.to.layer; c++) {
        chain.push({id: `p:${i}:${c}`, type: 'waypoint', layer: c, x: colX[c], y: 0, w: colW[c], h: WAYPOINT_H});
      }
      chains.set(s, chain);
    });
    chains.forEach(chain => chain.forEach(p => columns[p.layer].push(p)));
    return chains;
  }

  private placeRows(columns: LayoutNode[][], neighbours: Map<string, LayoutNode[]>): void {
    columns.forEach(col => {
      col.sort((a, b) => this.nodeLabel(a).localeCompare(this.nodeLabel(b)));
      let y = 0;
      this.stack(col, col.map(n => {
        const c = y + n.h / 2;
        y += n.h + GAP_Y;
        return c;
      }));
    });
    const centre = (n: LayoutNode) => n.y + n.h / 2;
    const sweep = (cols: LayoutNode[][], before: boolean) => cols.forEach(col => {
      const desired = col.map(n => {
        const ns = (neighbours.get(n.id) || []).filter(m => before ? m.layer < n.layer : m.layer > n.layer);
        return ns.length ? ns.reduce((s, m) => s + centre(m), 0) / ns.length : centre(n);
      });
      this.stack(col, desired);
    });
    for (let i = 0; i < 4; i++) {
      sweep(columns.slice(1), true);
      sweep(columns.slice(0, -1).reverse(), false);
    }
    sweep(columns.slice(1), true);
    let minY = Infinity;
    columns.forEach(col => col.forEach(n => minY = Math.min(minY, n.y)));
    columns.forEach(col => col.forEach(n => n.y += PAD - minY));
  }

  private straightenWaypoints(columns: LayoutNode[][], chains: Map<EdgeSpec, LayoutNode[]>): void {
    if (chains.size === 0) {
      return;
    }
    const at = new Map<LayoutNode, number>();
    columns.forEach(col => col.forEach((n, i) => at.set(n, i)));
    const room = (p: LayoutNode): [number, number] => {
      const col = columns[p.layer];
      const above = col[at.get(p) - 1];
      const below = col[at.get(p) + 1];
      return [above ? above.y + above.h + this.rowGap(above, p) + p.h / 2 : -Infinity,
        below ? below.y - this.rowGap(p, below) - p.h / 2 : Infinity];
    };
    chains.forEach((chain, s) => {
      let want = s.from.y + s.from.h / 2;
      let start = 0;
      let lo = -Infinity;
      let hi = Infinity;
      const place = (end: number) => {
        want = Math.min(hi, Math.max(lo, want));
        for (let k = start; k < end; k++) {
          chain[k].y = want - chain[k].h / 2;
        }
      };
      chain.forEach((p, k) => {
        const [a, b] = room(p);
        if (Math.max(lo, a) > Math.min(hi, b)) {
          place(k);
          start = k;
          lo = a;
          hi = b;
        } else {
          lo = Math.max(lo, a);
          hi = Math.min(hi, b);
        }
      });
      place(chain.length);
    });
  }

  private rowGap(a: LayoutNode, b: LayoutNode | undefined): number {
    if (!b || (a.type !== 'waypoint' && b.type !== 'waypoint')) {
      return GAP_Y;
    }
    return a.type === 'waypoint' && b.type === 'waypoint' ? WAYPOINT_GAP : WAYPOINT_MARGIN;
  }

  private stack(col: LayoutNode[], desired: number[]): void {
    const items = col.map((n, i) => ({n, want: desired[i] - n.h / 2}));
    items.sort((a, b) => (a.want - b.want) || this.nodeLabel(a.n).localeCompare(this.nodeLabel(b.n)));
    const offset: number[] = [];
    let acc = 0;
    items.forEach((it, i) => {
      offset.push(acc);
      acc += it.n.h + this.rowGap(it.n, items[i + 1]?.n);
    });
    const blocks: { sum: number; count: number }[] = [];
    items.forEach((it, i) => {
      blocks.push({sum: it.want - offset[i], count: 1});
      while (blocks.length > 1) {
        const b = blocks[blocks.length - 1];
        const a = blocks[blocks.length - 2];
        if (a.sum / a.count <= b.sum / b.count) {
          break;
        }
        a.sum += b.sum;
        a.count += b.count;
        blocks.pop();
      }
    });
    let i = 0;
    blocks.forEach(b => {
      const z = b.sum / b.count;
      for (let k = 0; k < b.count; k++, i++) {
        items[i].n.y = z + offset[i];
      }
    });
    col.splice(0, col.length, ...items.map(it => it.n));
  }

  private nodeLabel(n: LayoutNode): string {
    switch (n.type) {
      case 'wf':
        return String(n.wf.stage).padStart(5, '0') + n.wf.label;
      case 'board':
        return n.board.label;
      case 'fold':
        return String(n.fold.from).padStart(5, '0') + '￿';
      default:
        return '￿';
    }
  }

  private linkClass(l: CriticalPathGraphLink, board: CriticalPathGraphBoard): string {
    if (l.optional) {
      return 'optional';
    }
    if (board.value === 'yes') {
      return 'posted';
    }
    if (board.value === 'no') {
      return 'impossible';
    }
    return board.state === 'announced' ? 'announced' : 'expected';
  }

  plural(key: string, count: number): string {
    return count === 1 ? key + 'One' : key;
  }

  zoomIn(): void {
    this.zoomAtCentre(1.25);
  }

  zoomOut(): void {
    this.zoomAtCentre(0.8);
  }

  actual(): void {
    this.initialView();
  }

  private initialView(): void {
    this.userMoved = false;
    this.scale = 1;
    const box = this.viewportSize();
    this.tx = box.w >= this.width ? (box.w - this.width) / 2 : 0;
    if (box.h >= this.height) {
      this.ty = (box.h - this.height) / 2;
    } else {
      let first: LayoutNode | null = null;
      this.nodes.forEach(n => {
        if (n.type === 'wf' && (!first || n.x < first.x || (n.x === first.x && n.y < first.y))) {
          first = n;
        }
      });
      const c = first ? first.y + first.h / 2 : 0;
      this.ty = Math.min(0, Math.max(box.h - this.height, box.h / 2 - c));
    }
    this.updateWindow();
    this.cd.markForCheck();
  }

  fit(): void {
    if (!this.width || !this.height) {
      this.cd.markForCheck();
      return;
    }
    this.userMoved = true;
    const box = this.viewportSize();
    const s = Math.max(MIN_SCALE, Math.min(1, box.w / this.width, box.h / this.height));
    this.scale = s;
    this.tx = Math.max(0, (box.w - this.width * s) / 2);
    this.ty = Math.max(0, (box.h - this.height * s) / 2);
    this.updateWindow();
    this.cd.markForCheck();
  }

  onWheel(e: WheelEvent): void {
    if (!(e.ctrlKey || e.metaKey) || !this.viewport) {
      return;
    }
    e.preventDefault();
    const r = this.viewport.nativeElement.getBoundingClientRect();
    this.zoomAt(e.deltaY < 0 ? 1.15 : 1 / 1.15, e.clientX - r.left, e.clientY - r.top);
  }

  onMouseDown(e: MouseEvent): void {
    if (e.button !== 0 || (e.target as HTMLElement)?.closest?.('.cpg-node')) {
      return;
    }
    e.preventDefault();
    this.dragStart = {x: e.clientX, y: e.clientY, tx: this.tx, ty: this.ty};
    this.dragging = true;
    this.zone.runOutsideAngular(() => {
      document.addEventListener('mousemove', this.onMove);
      document.addEventListener('mouseup', this.onUp);
    });
  }

  private drag(e: MouseEvent): void {
    if (!this.dragStart) {
      return;
    }
    this.userMoved = true;
    this.tx = this.dragStart.tx + e.clientX - this.dragStart.x;
    this.ty = this.dragStart.ty + e.clientY - this.dragStart.y;
    this.updateWindow();
    this.cd.detectChanges();
  }

  private endDrag(): void {
    document.removeEventListener('mousemove', this.onMove);
    document.removeEventListener('mouseup', this.onUp);
    if (this.dragStart) {
      this.dragStart = null;
      this.dragging = false;
      this.zone.run(() => this.cd.markForCheck());
    }
  }

  private zoomAtCentre(factor: number): void {
    const box = this.viewportSize();
    this.zoomAt(factor, box.w / 2, box.h / 2);
  }

  private zoomAt(factor: number, cx: number, cy: number): void {
    const s = Math.max(MIN_SCALE, Math.min(MAX_SCALE, this.scale * factor));
    this.tx = cx - (cx - this.tx) * (s / this.scale);
    this.ty = cy - (cy - this.ty) * (s / this.scale);
    this.scale = s;
    this.userMoved = true;
    this.updateWindow();
    this.cd.markForCheck();
  }

  private inView(n: LayoutNode): boolean {
    const box = this.viewportSize();
    const x = n.x * this.scale + this.tx;
    const y = n.y * this.scale + this.ty;
    return x + n.w * this.scale > 0 && x < box.w && y + n.h * this.scale > 0 && y < box.h;
  }

  private centreOn(n: LayoutNode): void {
    const box = this.viewportSize();
    this.tx = box.w / 2 - (n.x + n.w / 2) * this.scale;
    this.ty = box.h / 2 - (n.y + n.h / 2) * this.scale;
    this.userMoved = true;
    this.updateWindow();
    this.cd.markForCheck();
  }

  private viewportSize(): { w: number; h: number } {
    const el = this.viewport?.nativeElement;
    return {w: el?.clientWidth || this.width, h: el?.clientHeight || this.viewportHeight};
  }
}
