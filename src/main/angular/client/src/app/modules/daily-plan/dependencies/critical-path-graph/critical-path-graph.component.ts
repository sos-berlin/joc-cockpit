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
  type: 'wf' | 'board' | 'cluster' | 'fold';
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
const TRUNK_GAP = 28;
const WINDOW_MARGIN = 400;
const FALLBACK_W = 1600;
const EDGE_PAD = 12;
const SIMPLE_SCALE = 0.45;
const SIMPLE_MIN_NODES = 150;
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
  readonly edgeClasses = EDGE_CLASSES;
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
  hasFold = false;
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
    this.hasFold = hidden.length > 0;

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
    const neighbours = new Map<string, LayoutNode[]>();
    const link = (a: LayoutNode, b: LayoutNode) => {
      (neighbours.get(a.id) || neighbours.set(a.id, []).get(a.id)).push(b);
      (neighbours.get(b.id) || neighbours.set(b.id, []).get(b.id)).push(a);
    };
    specs.forEach(s => link(s.from, s.to));
    neighbourPairs.forEach(([a, b]) => link(a, b));

    const all = Array.from(byId.values());
    this.placeNodes(all, neighbours);
    this.width = Math.max(...all.map(n => n.x + n.w)) + PAD;
    this.height = Math.max(...all.map(n => n.y + n.h)) + PAD;
    this.viewportHeight = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, this.height + 2));
    foldedReceivers.forEach((wfs, board) => byId.get('b:' + board).foldedReceivers = wfs.size);
    this.nodes = all;

    const feeders = new Set(specs.filter(s => s.trunk && s.from.x + s.from.w < s.to.x - TRUNK_GAP));
    const junction = foldNode && feeders.size >= 2 ? {x: foldNode.x - TRUNK_GAP, y: foldNode.y + foldNode.h / 2} : null;
    this.edges = specs.map((s, i) => {
      const viaTrunk = !!junction && feeders.has(s);
      const path = viaTrunk ? this.curveTo(s.from, junction.x, junction.y) : this.edgePath(s.from, s.to);
      return {
        id: 'e' + i, cls: s.cls, title: s.title, arrow: !viaTrunk, from: s.from.id, to: s.to.id,
        d: path, box: this.pathBox(path)
      };
    });
    if (junction) {
      const path = `M${junction.x},${junction.y} L${foldNode.x},${junction.y}`;
      this.edges.push({
        id: 'trunk', cls: 'fold', arrow: true, from: 'trunk', to: 'fold', d: path, box: this.pathBox(path),
        title: t('dailyPlan.dependencies.graph.trunk', {count: feeders.size})
      });
    }
    this.updateWindow(true);
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

  private curveTo(a: LayoutNode, x2: number, y2: number): string {
    const x1 = a.x + a.w;
    const y1 = a.y + a.h / 2;
    const dx = Math.max(16, (x2 - x1) / 2);
    return `M${x1},${y1} C${x1 + dx},${y1} ${x2 - dx},${y2} ${x2},${y2}`;
  }

  private placeNodes(all: LayoutNode[], neighbours: Map<string, LayoutNode[]>): void {
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
    const minY = Math.min(...all.map(n => n.y));
    all.forEach(n => n.y += PAD - minY);
  }

  private stack(col: LayoutNode[], desired: number[]): void {
    const items = col.map((n, i) => ({n, want: desired[i] - n.h / 2}));
    items.sort((a, b) => (a.want - b.want) || this.nodeLabel(a.n).localeCompare(this.nodeLabel(b.n)));
    const offset: number[] = [];
    let acc = 0;
    items.forEach((it, i) => {
      offset.push(acc);
      acc += it.n.h + GAP_Y;
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

  private edgePath(a: LayoutNode, b: LayoutNode): string {
    const x1 = a.x + a.w;
    const y1 = a.y + a.h / 2;
    const x2 = b.x;
    const y2 = b.y + b.h / 2;
    if (x2 > x1) {
      const dx = Math.max(24, (x2 - x1) / 2);
      return `M${x1},${y1} C${x1 + dx},${y1} ${x2 - dx},${y2} ${x2},${y2}`;
    }
    const loop = 36;
    const low = Math.max(a.y + a.h, b.y + b.h) + 28;
    const mid = (x1 + x2) / 2;
    return `M${x1},${y1} C${x1 + loop},${y1} ${x1 + loop},${low} ${mid},${low} S${x2 - loop},${y2} ${x2},${y2}`;
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
