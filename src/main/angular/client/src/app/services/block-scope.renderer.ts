/**
 * BlockScopeRenderer
 * ------------------
 * Draws a light "scope" tint + a coloured rail behind every control-flow block
 * (Try, If, ...) so users can see which instructions live inside which block.
 *
 * Design contract (see the Segment vs block discussion):
 *  - Segment keeps its dashed frame + header chip (drawn by drawSegmentContainers
 *    as model cells). Blocks never use borders, dashes or Segment blue.
 *  - Block scopes are drawn in the view's BACKGROUND PANE as plain SVG. They are
 *    never model cells, so the serializer, autosave, undo history, removeCells,
 *    orphan cleanup and the hierarchical layout never see them.
 *  - The layer has pointer-events: none, so it never intercepts clicks or drops.
 *
 * Scope detection:
 *  - Opener cell  = vertex whose tagName is an enabled block type.
 *  - Closer cell  = vertex with targetId === opener.id (set by createWorkflow),
 *                   else the component's nodeMap, else a depth-aware DFS.
 *  - Inner cells  = model descendants of the opener (createWorkflow inserts block
 *                   children with the opener as parent) UNION everything reachable
 *                   from the opener before the closer (covers drag/drop paths
 *                   where parent linkage may be incomplete).
 */

declare const mxEvent: any;
declare const mxConstants: any;
declare const mxRectangle: any;

const SVG_NS = 'http://www.w3.org/2000/svg';

/** Block types drawn by default (every block that has an opener + closer pair). */
export const DEFAULT_BLOCK_SCOPE_TAGS: string[] = [
  'Try', 'If', 'Retry', 'Cycle', 'Lock', 'Fork', 'ForkList', 'CaseWhen',
  'StickySubagent', 'Options', 'AdmissionTime', 'ConsumeNotices'
];

/**
 * Geometry in graph units (multiplied by the view scale when drawing).
 * labelStrip: extra room on the opener's side of a box for its label, which
 * sits just above the opener (vertical flows) or in a strip on top (horizontal).
 * minRankSpacing: two sibling boxes stacked along the flow axis add bottom
 * padding + top padding + label strip between them, plus a small visible gap.
 */
export const BLOCK_SCOPE_METRICS = {
  padding: 10,
  rail: 4,
  labelFont: 11,
  labelGap: 8,
  labelCharWidth: 6.4,
  labelMaxChars: 28,
  /** Minimum gap between the outermost scope box and the canvas edge. */
  canvasMargin: 10,
  get labelStrip(): number {
    return this.labelFont + 4;
  },
  get minRankSpacing(): number {
    return this.padding * 2 + this.labelStrip + 8;
  }
};

export interface BlockScopeBox {
  /** Display (screen) coordinates, same space as graph.view.getState(). */
  x: number;
  y: number;
  width: number;
  height: number;
}

interface LabelSpec {
  x: number;
  y: number;
  anchor: 'start' | 'end';
}

interface BlockTheme {
  tint: string;
  rail: string;
  text: string;
}

export interface BlockScopeConfig {
  closer: string;
  light: BlockTheme;
  dark: BlockTheme;
  label: (cell: any) => string;
}

interface Scope {
  opener: any;
  closer: any;
  tag: string;
  inner: Set<any>;
  innerIds: Set<string>;
  depth: number;
  collapsed: boolean;
  stepCount: number;
  /** Catch inside Try, When/Else branches inside Case When. */
  subScopes: SubScope[];
}

interface SubScope {
  kind: 'catch' | 'branch';
  /** Hover key (distinct from the parent scope's key). */
  key: string;
  /** Catch / When / ElseWhen cell. */
  cell: any;
  /** EndWhen / EndElse; none for Catch (it ends at the Try's EndTry). */
  closer: any | null;
  inner: Set<any>;
  text: string;
  theme: { light: BlockTheme; dark: BlockTheme };
}

interface SubBox {
  sub: SubScope;
  box: BlockScopeBox;
  label: LabelSpec;
  text: string;
}

function attr(cell: any, name: string): string {
  const v = cell?.value;
  return v && typeof v.getAttribute === 'function' ? (v.getAttribute(name) || '') : '';
}

function truncate(text: string, max: number): string {
  const t = (text || '').replace(/\s+/g, ' ').trim();
  return t.length > max ? t.substring(0, max - 1) + '\u2026' : t;
}

function theme(rail: string, tint: string, textLight: string, railDark: string, textDark: string): { light: BlockTheme; dark: BlockTheme } {
  return {
    light: {tint, rail, text: textLight},
    dark: {tint, rail: railDark, text: textDark}
  };
}

/** Number of arrows leaving a cell (e.g. Fork branches). */
function outgoingCount(cell: any): number {
  return (cell?.edges || []).filter((e: any) => e && e.source === cell && e.target).length;
}

/**
 * Colours per block type, matched to each block's own symbol colour so a scope
 * reads as "belonging" to its opener. Rails and tints are deeper versions of the
 * pastel symbol fills (a pastel at 12% would be invisible).
 * Blue is intentionally absent: it is reserved for Segment. Fork List's symbol
 * is periwinkle, so its scope uses indigo; Lock and Case When (both lavender
 * symbols) are split into violet and magenta so the three stay distinguishable.
 */
export const BLOCK_SCOPE_CONFIG: { [tag: string]: BlockScopeConfig } = {
  Try: {                                    // symbol #FFCF8A
    closer: 'EndTry',
    ...theme('#E0922F', '#F5A623', '#8A5A12', '#F0B45A', '#F6CD8B'),
    label: () => 'try'
  },
  If: {                                     // symbol #CDEB8B
    closer: 'EndIf',
    ...theme('#6A9F2A', '#7CB342', '#3E6314', '#9CCC65', '#C5E1A5'),
    label: (cell) => {
      const p = attr(cell, 'predicate');
      return p ? 'if ' + p : 'if';
    }
  },
  Retry: {                                  // symbol #FFC7C7
    closer: 'EndRetry',
    ...theme('#D8638A', '#E57399', '#8E2F4F', '#F09BB6', '#F7C6D6'),
    label: (cell) => {
      const n = attr(cell, 'maxTries');
      return n ? 'retry, max ' + n : 'retry';
    }
  },
  Cycle: {                                  // symbol #C2B280
    closer: 'EndCycle',
    ...theme('#9C8A55', '#B09E66', '#5A4E2A', '#CDBE8C', '#E4DAB8'),
    label: () => 'cycle'
  },
  Lock: {                                   // symbol #D4BAFF
    closer: 'EndLock',
    ...theme('#9C6ADE', '#A77BE3', '#4E2A85', '#C1A3EE', '#DECBF6'),
    label: (cell) => {
      try {
        const d = JSON.parse(attr(cell, 'demands') || '[]');
        if (Array.isArray(d) && d.length > 0 && d[0] && d[0].lockName) {
          return 'lock ' + d[0].lockName + (d.length > 1 ? ' +' + (d.length - 1) : '');
        }
      } catch (e) {
        // fall through
      }
      return 'lock';
    }
  },
  Fork: {                                   // symbol #FFEE73
    closer: 'Join',
    ...theme('#A89E00', '#BDB31A', '#575200', '#D9D05C', '#EDE8A6'),
    label: (cell) => {
      const n = outgoingCount(cell);
      return n > 1 ? 'fork, ' + n + ' branches' : 'fork';
    }
  },
  ForkList: {                               // symbol #97B0FF (kept off Segment blue)
    closer: 'EndForkList',
    ...theme('#5C6BC0', '#6F7DC8', '#27327A', '#9FA8DA', '#C5CAE9'),
    label: (cell) => {
      const c = attr(cell, 'children');
      return c ? 'fork list ' + c : 'fork list';
    }
  },
  CaseWhen: {                               // When symbol #DAB2FF
    closer: 'EndCase',
    ...theme('#C2479E', '#CC5FAB', '#6E1D57', '#E08AC6', '#F1C3E2'),
    label: () => 'case'
  },
  // Branches of a Case When. Drawn as their own blocks in the indented layout
  // (as sub-scopes of the Case When otherwise). Not in DEFAULT_BLOCK_SCOPE_TAGS.
  When: {
    closer: 'EndWhen',
    ...theme('#C2479E', '#CC5FAB', '#6E1D57', '#E08AC6', '#F1C3E2'),
    label: (cell) => {
      const p = attr(cell, 'predicate');
      return p ? 'when ' + p : 'when';
    }
  },
  ElseWhen: {
    closer: 'EndElse',
    ...theme('#C2479E', '#CC5FAB', '#6E1D57', '#E08AC6', '#F1C3E2'),
    label: () => 'else'
  },
  StickySubagent: {                         // symbol #59D0C9
    closer: 'EndStickySubagent',
    ...theme('#2BA39C', '#3DB5AE', '#0F5E59', '#6FD0CA', '#B5E9E5'),
    label: (cell) => {
      const a = attr(cell, 'agentName');
      return a ? 'sticky subagent ' + a : 'sticky subagent';
    }
  },
  Options: {                                // symbol #B0BEC5
    closer: 'EndOptions',
    ...theme('#78909C', '#90A4AE', '#37474F', '#B0BEC5', '#CFD8DC'),
    label: () => 'options'
  },
  AdmissionTime: {                          // symbol #FFD96A
    closer: 'EndAdmissionTime',
    ...theme('#E0A800', '#EDB81C', '#6E5200', '#F2CC5C', '#F8E3A6'),
    label: () => 'admission time'
  },
  ConsumeNotices: {                         // symbol #00E0F5
    closer: 'EndConsumeNotices',
    ...theme('#00A5B8', '#14B8CC', '#005E6A', '#4DD4E3', '#A6EAF2'),
    label: (cell) => {
      const n = attr(cell, 'noticeBoardNames');
      return n ? 'consume ' + n : 'consume notices';
    }
  }
};

/**
 * Indented layout: a block's guide runs this far left of its opener's centre
 * (between the column edge and the arrows on the spine; with the layout's
 * SPINE of 25 it lands 9px inside the column).
 */
const INDENT_GUIDE_OFFSET = 16;

/** Indented layout guides: thin dashed lines (px at 100% zoom). They do not change on hover. */
const GUIDE_WIDTH = 1;
const GUIDE_DASH = [4, 3];

/** Catch branch inside a Try: its own sub-scope, red family. */
const CATCH_THEME = theme('#D9534F', '#E57373', '#9B2C2C', '#EF9A9A', '#F5C0C0');

/** Order annotations (order view): boxes attached to steps, not part of the workflow. */
const ORDER_TAGS = new Set<string>(['Order', 'Count']);

/** Tags that are structure, not user instructions (excluded from "n steps"). */
const NON_STEP_TAGS = new Set<string>([
  'Catch', 'Join', 'EndCase', 'EndIf', 'EndWhen', 'EndForkList', 'EndTry', 'EndStickySubagent',
  'EndRetry', 'EndCycle', 'EndElse', 'EndLock', 'EndConsumeNotices', 'EndOptions',
  'EndAdmissionTime', 'EndSegment', 'Segment', 'When', 'ElseWhen', 'Process', 'SegmentContainer'
]);

export interface BlockScopeRendererOptions {
  getPreferences: () => any;
  /** opener id -> closer id, as produced by WorkflowService.createWorkflow */
  getNodeMap?: () => Map<string, string> | null | undefined;
  /** Override DEFAULT_BLOCK_SCOPE_TAGS (e.g. for experiments). */
  enabledTags?: string[];
  /**
   * Minimap mode (mxOutline's graph): tints and rails only. No labels, no
   * hover, no view shifting (the minimap manages its own zoom and position).
   */
  minimap?: boolean;
  /** Highlight a scope while its opener or closer is hovered (default true). */
  hover?: boolean;
  /**
   * Also draw Segment frames (dashed box with header, collapsed box), for views
   * that have no Segment code of their own (e.g. the read-only order view).
   * The editor draws its frames as model cells and leaves this off.
   */
  segments?: boolean;
}

export interface BlockScopeDrawOptions {
  /**
   * Include SegmentContainer frames of Segments nested inside a block when sizing
   * that block. Pass false for the pre-pass that runs BEFORE segment containers
   * are rebuilt (their states would still be at pre-layout positions).
   */
  includeSegmentFrames?: boolean;
  /**
   * Redraw triggered by a model / view event (not right after a layout). Such
   * redraws never shift the view to keep scopes on the canvas: doing that while
   * the user pans (e.g. dragging the minimap's box) would push the view back.
   */
  fromEvent?: boolean;
}

export class BlockScopeRenderer {
  private layer: SVGGElement | null = null;
  private boxes = new Map<string, BlockScopeBox>();
  private rafId = 0;
  private destroyed = false;
  private readonly redrawHandler = () => this.scheduleDraw();
  /** Model changed since scopes were last collected. */
  private scopesDirty = true;
  private cachedScopes: Scope[] | null = null;
  private readonly modelChangeHandler = () => {
    this.scopesDirty = true;
    this.scheduleDraw();
  };
  /** Pan / zoom: only the view moved, the workflow did not change. */
  private readonly viewChangeHandler = () => this.onViewChanged();
  /** View translate and scale at the last full draw (for the pan fast path). */
  private drawnTranslate: { x: number; y: number } | null = null;
  private drawnScale = 1;
  /** A full redraw is pending (set when the pan fast path cannot be used). */
  private fullDrawPending = false;
  /**
   * Offset (display px) the layer was moved by the pan fast path since the last
   * full draw. The stored boxes are from that draw, so everything that reports
   * them (getGraphBounds, getBox) must add this offset.
   */
  private panOffset = {x: 0, y: 0};
  /** Segment frames drawn by this renderer (segments option), display coords. */
  private frames: Array<{ cell: any; box: BlockScopeBox; header: BlockScopeBox }> = [];
  private origGetGraphBounds: any = null;
  private hoverKey: string | null = null;
  /** cell id (opener, closer, Catch/When/Else) -> scope key to highlight */
  private hoverTargets = new Map<string, string>();
  private mouseListener: any = null;
  /** True while drawing for the indented layout (guides instead of tints). */
  private indented = false;
  private leaveHandler: (() => void) | null = null;

  constructor(private graph: any, private options: BlockScopeRendererOptions) {
  }

  // ---------------------------------------------------------------- lifecycle

  install(): void {
    const view = this.graph.getView();
    view.addListener(mxEvent.SCALE, this.viewChangeHandler);
    view.addListener(mxEvent.TRANSLATE, this.viewChangeHandler);
    view.addListener(mxEvent.SCALE_AND_TRANSLATE, this.viewChangeHandler);
    this.graph.getModel().addListener(mxEvent.CHANGE, this.modelChangeHandler);
    if (mxEvent.REFRESH) {
      this.graph.addListener(mxEvent.REFRESH, this.modelChangeHandler);
    }
    if (this.options.minimap) {
      this.draw();
      return;
    }
    // Make the graph bounds include the scope boxes, so the SVG canvas grows
    // to fit them (otherwise tints/labels outside the cells get clipped) and
    // fit/outline/export also account for them.
    const self = this;
    if (this.options.hover !== false) {
      this.mouseListener = {
        mouseDown: () => undefined,
        mouseUp: () => undefined,
        mouseMove: (sender: any, me: any) => {
          const cell = me && typeof me.getCell === 'function' ? me.getCell() : null;
          this.setHover(cell ? (this.hoverTargets.get(String(cell.id)) || null) : null);
        }
      };
      this.graph.addMouseListener(this.mouseListener);
      this.leaveHandler = () => this.setHover(null);
      if (this.graph.container) {
        this.graph.container.addEventListener('mouseleave', this.leaveHandler);
      }
    }
    this.origGetGraphBounds = this.graph.getGraphBounds;
    this.graph.getGraphBounds = function () {
      const b = self.origGetGraphBounds.apply(this, arguments);
      if (!b || (self.boxes.size === 0 && self.frames.length === 0) || typeof mxRectangle === 'undefined') {
        return b;
      }
      const r = typeof b.clone === 'function' ? b.clone() : new mxRectangle(b.x, b.y, b.width, b.height);
      // Boxes are from the last full draw; after a pan they moved with the layer.
      // (Without this the bounds grew with every pan step, and the minimap,
      // which sizes itself and its viewport box from these bounds, fought the drag.)
      const o = self.panOffset;
      self.boxes.forEach(box => r.add(new mxRectangle(box.x + o.x, box.y + o.y, box.width, box.height)));
      self.frames.forEach(f => r.add(new mxRectangle(f.box.x + o.x, f.box.y + o.y, f.box.width, f.box.height)));
      return r;
    };
    this.debug('installed; background pane =', this.graph.getView().getBackgroundPane());
    this.draw();
  }

  destroy(): void {
    this.destroyed = true;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = 0;
    }
    if (this.origGetGraphBounds) {
      this.graph.getGraphBounds = this.origGetGraphBounds;
      this.origGetGraphBounds = null;
    }
    try {
      if (this.mouseListener) {
        this.graph.removeMouseListener(this.mouseListener);
      }
      if (this.leaveHandler && this.graph.container) {
        this.graph.container.removeEventListener('mouseleave', this.leaveHandler);
      }
    } catch (e) {
      // graph may already be destroyed
    }
    this.mouseListener = null;
    this.leaveHandler = null;
    try {
      this.graph.getView().removeListener(this.viewChangeHandler);
      this.graph.getModel().removeListener(this.modelChangeHandler);
      this.graph.removeListener(this.modelChangeHandler);
    } catch (e) {
      // graph may already be destroyed
    }
    if (this.layer && this.layer.parentNode) {
      this.layer.parentNode.removeChild(this.layer);
    }
    this.layer = null;
    this.boxes.clear();
  }

  /** Coalesces bursts of zoom/pan/model events into one redraw per frame. */
  /**
   * Pan / zoom. A pure pan (same scale, no pending model change) just moves the
   * existing layer: rebuilding every scope on each frame of a drag is what makes
   * large workflows sluggish. Zoom, or a pending change, does a full redraw.
   */
  private onViewChanged(): void {
    if (this.destroyed) {
      return;
    }
    const view = this.graph.getView();
    const t = view.translate;
    const sc = view.getScale();
    if (this.layer && this.drawnTranslate && !this.scopesDirty && !this.fullDrawPending
      && Math.abs(sc - this.drawnScale) < 1e-9) {
      const dx = (t.x - this.drawnTranslate.x) * sc;
      const dy = (t.y - this.drawnTranslate.y) * sc;
      this.layer.setAttribute('transform', 'translate(' + dx + ',' + dy + ')');
      this.panOffset = {x: dx, y: dy};
      return;
    }
    this.fullDrawPending = true;
    this.scheduleDraw();
  }

  scheduleDraw(): void {
    if (this.destroyed || this.rafId) {
      return;
    }
    this.rafId = requestAnimationFrame(() => {
      this.rafId = 0;
      this.fullDrawPending = false;
      this.draw({fromEvent: true});
    });
  }

  /**
   * Segment (segments option) whose header strip, or collapsed box, contains
   * the display point (e.g. to expand / collapse it on click), else null.
   */
  segmentAt(x: number, y: number): any {
    const px = x - this.panOffset.x;
    const py = y - this.panOffset.y;
    // Innermost first: frames are stored deepest-first.
    for (const f of this.frames) {
      const h = f.header;
      if (px >= h.x && px <= h.x + h.width && py >= h.y && py <= h.y + h.height) {
        return f.cell;
      }
    }
    return null;
  }

  /** Display-coordinate box of a block opener, if drawn in the last pass. */
  getBox(openerId: string): BlockScopeBox | undefined {
    const b = this.boxes.get(openerId);
    if (!b || (this.panOffset.x === 0 && this.panOffset.y === 0)) {
      return b;
    }
    return {x: b.x + this.panOffset.x, y: b.y + this.panOffset.y, width: b.width, height: b.height};
  }

  // --------------------------------------------------------------------- draw

  draw(opts: BlockScopeDrawOptions = {}): void {
    if (this.destroyed || !this.graph || !this.graph.getView()) {
      return;
    }
    const includeSegmentFrames = opts.includeSegmentFrames !== false;
    const layer = this.ensureLayer();
    if (!layer) {
      this.debug('no SVG background pane; nothing drawn');
      return;
    }
    while (layer.firstChild) {
      layer.removeChild(layer.firstChild);
    }
    layer.removeAttribute('transform');
    this.panOffset = {x: 0, y: 0};
    this.frames = [];
    const view = this.graph.getView();
    this.drawnTranslate = {x: view.translate.x, y: view.translate.y};
    this.drawnScale = view.getScale();
    this.boxes.clear();
    this.hoverTargets.clear();
    const indented = this.layoutMode() === 'indented';
    if (indented !== this.indented) {
      this.scopesDirty = true;
    }
    this.indented = indented;

    let scopes: Scope[];
    try {
      // Scopes depend only on the model: reuse them until the model changes
      // (zooming and panning then only recompute positions).
      if (this.scopesDirty || !this.cachedScopes) {
        this.cachedScopes = this.collectScopes();
        this.scopesDirty = false;
      }
      scopes = this.cachedScopes;
      // Layout fell back to mxGraph's hierarchical layout (a structure the
      // indented layout does not handle): its positions do not line up with
      // guides, and the tinted scopes are not wanted any more, so draw no block
      // scopes (Segment frames, if enabled, are still drawn).
      if (this.layoutMode() === 'hierarchical') {
        scopes = [];
      }
    } catch (e) {
      console.error('BlockScopeRenderer: scope collection failed', e);
      return;
    }
    if (scopes.length === 0) {
      this.debug('no block scopes found (enabled tags:', this.enabledTags().join(', ') + ')');
      if (this.options.segments) {
        this.drawSegments(layer, this.isDarkTheme(), this.graph.getView().getScale());
        if (includeSegmentFrames && !this.options.minimap && !opts.fromEvent) {
          this.keepInsideCanvas();
        }
      }
      return;
    }

    const isDark = this.isDarkTheme();
    const horizontalFlow = this.isHorizontalFlow();
    const scale = this.graph.getView().getScale();
    const segmentFrames = includeSegmentFrames ? this.collectSegmentFrames() : new Map<string, any>();

    if (this.indented) {
      this.drawIndented(layer, scopes, isDark, scale, segmentFrames);
      if (this.options.segments) {
        this.drawSegments(layer, isDark, scale);
      }
      if (includeSegmentFrames && !this.options.minimap && !opts.fromEvent) {
        this.keepInsideCanvas();
      }
      return;
    }

    // Deepest first, so each outer box can enclose its inner boxes.
    const deepestFirst = [...scopes].sort((a, b) => b.depth - a.depth);
    const drawn: Array<{ scope: Scope; box: BlockScopeBox; label: LabelSpec; subBoxes: SubBox[] }> = [];

    for (const scope of deepestFirst) {
      const result = this.computeBox(scope, scale, horizontalFlow, segmentFrames);
      if (result) {
        this.boxes.set(scope.opener.id, result.box);
        drawn.push({scope, box: result.box, label: result.label, subBoxes: result.subBoxes});
      }
    }

    // Paint outermost first. Nested scopes use a lighter tint (see tintOpacity)
    // so stacked fills don't turn muddy; depth reads from the rails instead.
    drawn.sort((a, b) => a.scope.depth - b.scope.depth);
    for (const item of drawn) {
      const cfg = BLOCK_SCOPE_CONFIG[item.scope.tag];
      const t = this.themeFor(cfg.dark, cfg.light, isDark);
      let label = truncate(cfg.label(item.scope.opener), BLOCK_SCOPE_METRICS.labelMaxChars);
      if (item.scope.collapsed && item.scope.stepCount > 0) {
        label += ' (' + item.scope.stepCount + (item.scope.stepCount === 1 ? ' step)' : ' steps)');
      }
      const key = String(item.scope.opener.id);
      this.hoverTargets.set(key, key);
      this.hoverTargets.set(String(item.scope.closer.id), key);
      this.paintScope(layer, item.box, t, label, item.label, this.tintOpacity(item.scope.depth, isDark),
        scale, horizontalFlow, key, key);
      for (const sb of item.subBoxes) {
        this.hoverTargets.set(String(sb.sub.cell.id), sb.sub.key);
        if (sb.sub.closer) {
          this.hoverTargets.set(String(sb.sub.closer.id), sb.sub.key);
        }
        const st = this.themeFor(sb.sub.theme.dark, sb.sub.theme.light, isDark);
        const op = sb.sub.kind === 'catch' ? 0.08 : (isDark ? 0.06 : 0.05);
        this.paintScope(layer, sb.box, st, sb.text, sb.label, op, scale, horizontalFlow, sb.sub.key, null);
      }
    }
    this.debug('scopes found:', scopes.length, 'drawn:', drawn.length,
      drawn.map(d => d.scope.tag + '#' + d.scope.opener.id + ' depth ' + d.scope.depth + ' ' + JSON.stringify(d.box)));

    if (this.options.segments) {
      this.drawSegments(layer, isDark, scale);
    }
    // Only in the final pass: the pre-pass runs mid-way through Segment drawing.
    if (includeSegmentFrames && !this.options.minimap && !opts.fromEvent) {
      this.keepInsideCanvas();
    }
  }

  /**
   * The hierarchical layout puts the flow at x ~ 0, so a box that grows
   * outwards from the cells ends up at negative coordinates, outside the SVG.
   * Shift the view (never the model) just enough to bring the outermost box
   * inside the canvas, then let mxGraph resize the canvas to the new bounds.
   * The translate only ever increases, so this settles after one redraw.
   */
  private keepInsideCanvas(): void {
    if (this.boxes.size === 0 && this.frames.length === 0) {
      return;
    }
    const view = this.graph.getView();
    const scale = view.getScale();
    const margin = BLOCK_SCOPE_METRICS.canvasMargin * scale;
    let minX = Infinity;
    let minY = Infinity;
    this.boxes.forEach(b => {
      minX = Math.min(minX, b.x);
      minY = Math.min(minY, b.y);
    });
    this.frames.forEach(f => {
      minX = Math.min(minX, f.box.x);
      minY = Math.min(minY, f.box.y);
    });
    const t = view.translate;
    const tx = minX < margin - 0.5 ? t.x + (margin - minX) / scale : t.x;
    const ty = minY < margin - 0.5 ? t.y + (margin - minY) / scale : t.y;
    if (tx !== t.x || ty !== t.y) {
      this.debug('shifting view to keep scopes on canvas:', {from: {x: t.x, y: t.y}, to: {x: tx, y: ty}});
      view.setTranslate(tx, ty); // fires TRANSLATE -> scheduled redraw at new positions
    } else if (typeof this.graph.sizeDidChange === 'function') {
      this.graph.sizeDidChange(); // grow the canvas to include the boxes
    }
  }

  private debug(...args: any[]): void {
    try {
      if (localStorage.getItem('blockScopeDebug') === '1') {
        console.log('[BlockScope]', ...args);
      }
    } catch (e) {
      // localStorage unavailable
    }
  }

  // ------------------------------------------------------------ scope finding

  private enabledTags(): string[] {
    const tags = [...(this.options.enabledTags || DEFAULT_BLOCK_SCOPE_TAGS)];
    if (this.indented && tags.includes('CaseWhen')) {
      tags.push('When', 'ElseWhen');
    }
    return tags.filter(t => !!BLOCK_SCOPE_CONFIG[t]);
  }

  /** Set by the layout pass on the (shared) model: 'indented' | 'structured' | 'hierarchical'. */
  private layoutMode(): string {
    const m = this.graph.getModel();
    return (m && m.__blockLayoutMode) || 'hierarchical';
  }

  private collectScopes(): Scope[] {
    const model = this.graph.getModel();
    const enabled = new Set(this.enabledTags());
    if (enabled.size === 0) {
      return [];
    }
    const all: any[] = Object.keys(model.cells || {})
      .map(k => model.cells[k])
      .filter((c: any) => c && c.vertex && c.value && c.value.tagName);

    const openers = all.filter(c => enabled.has(c.value.tagName));
    if (openers.length === 0) {
      return [];
    }

    const closerTags = new Set<string>();
    enabled.forEach(t => closerTags.add(BLOCK_SCOPE_CONFIG[t].closer));
    if (enabled.has('CaseWhen')) {
      closerTags.add('EndWhen');
      closerTags.add('EndElse');
    }
    const closerByTarget = new Map<string, any>();
    for (const c of all) {
      if (closerTags.has(c.value.tagName)) {
        const tid = attr(c, 'targetId');
        if (tid) {
          closerByTarget.set(tid + '|' + c.value.tagName, c);
        }
      }
    }

    const scopes: Scope[] = [];
    for (const opener of openers) {
      const tag = opener.value.tagName;
      const closer = this.findCloser(opener, tag, closerByTarget);
      if (!closer) {
        continue; // unfinished block (e.g. mid-drop); nothing sensible to wrap
      }
      const inner = this.collectInner(opener, closer);
      const innerIds = new Set<string>();
      let stepCount = 0;
      inner.forEach(c => {
        innerIds.add(c.id);
        if (!NON_STEP_TAGS.has(c.value.tagName)) {
          stepCount++;
        }
      });
      const scope: Scope = {
        opener, closer, tag, inner, innerIds, depth: 0,
        collapsed: !!opener.collapsed,
        stepCount,
        subScopes: []
      };
      if (this.indented) {
        // Indented layout: Catch shows as a colour change on the Try guide,
        // When/Else are blocks of their own.
      } else if (tag === 'Try') {
        const cs = this.findCatchScope(opener, closer, inner);
        if (cs) {
          scope.subScopes.push({
            kind: 'catch', key: 'sub:' + cs.cell.id, cell: cs.cell, closer: null,
            inner: cs.inner, text: 'catch', theme: CATCH_THEME
          });
        }
      } else if (tag === 'CaseWhen') {
        scope.subScopes.push(...this.findCaseBranches(opener, inner, closerByTarget));
      }
      scopes.push(scope);
    }

    // depth = number of other scopes whose inner set contains this opener
    for (const s of scopes) {
      let depth = 0;
      for (const o of scopes) {
        if (o !== s && o.innerIds.has(s.opener.id)) {
          depth++;
        }
      }
      s.depth = depth;
    }
    return scopes;
  }

  private findCloser(opener: any, tag: string, closerByTarget: Map<string, any>): any {
    const closeTag = BLOCK_SCOPE_CONFIG[tag].closer;
    const byTarget = closerByTarget.get(opener.id + '|' + closeTag);
    if (byTarget) {
      return byTarget;
    }
    const nodeMap = this.options.getNodeMap ? this.options.getNodeMap() : null;
    if (nodeMap && typeof nodeMap.get === 'function') {
      const id = nodeMap.get(String(opener.id));
      const cell = id ? this.graph.getModel().getCell(id) : null;
      if (cell && cell.value && cell.value.tagName === closeTag) {
        return cell;
      }
    }
    return this.dfsFindCloser(opener, tag, closeTag);
  }

  /** Walks forward; nested openers of the same type raise depth, closers lower it. */
  private dfsFindCloser(opener: any, openTag: string, closeTag: string): any {
    const stack: Array<{ cell: any; depth: number }> = this.successors(opener).map(c => ({cell: c, depth: 0}));
    const visited = new Set<string>([opener.id]);
    let guard = 0;
    while (stack.length > 0 && guard++ < 10000) {
      const {cell, depth} = stack.pop();
      if (!cell || visited.has(cell.id)) {
        continue;
      }
      visited.add(cell.id);
      const t = cell.value?.tagName;
      let next = depth;
      if (t === closeTag) {
        if (depth === 0) {
          return cell;
        }
        next = depth - 1;
      } else if (t === openTag) {
        next = depth + 1;
      }
      for (const s of this.successors(cell)) {
        stack.push({cell: s, depth: next});
      }
    }
    return null;
  }

  private collectInner(opener: any, closer: any): Set<any> {
    const model = this.graph.getModel();
    const inner = new Set<any>();
    const accept = (c: any) => c && c !== opener && c !== closer && c.vertex && c.value
      && c.value.tagName !== 'SegmentContainer' && c.value.tagName !== 'Process'
      && !ORDER_TAGS.has(c.value.tagName);

    for (const d of (model.getDescendants(opener) || [])) {
      if (accept(d)) {
        inner.add(d);
      }
    }
    // Reachability between opener and closer (stops at the closer, so it
    // cannot leak into the rest of the workflow).
    const visited = new Set<string>([opener.id, closer.id]);
    const queue = this.successors(opener);
    let guard = 0;
    while (queue.length > 0 && guard++ < 10000) {
      const c = queue.shift();
      if (!c || visited.has(c.id)) {
        continue;
      }
      visited.add(c.id);
      if (accept(c)) {
        inner.add(c);
      }
      queue.push(...this.successors(c));
    }
    return inner;
  }

  private findCatchScope(tryCell: any, endTry: any, inner: Set<any>): { cell: any; inner: Set<any> } | undefined {
    let catchCell: any = null;
    inner.forEach(c => {
      if (!catchCell && c.value.tagName === 'Catch' && attr(c, 'targetId') === String(tryCell.id)) {
        catchCell = c;
      }
    });
    if (!catchCell) {
      inner.forEach(c => {
        if (!catchCell && c.value.tagName === 'Catch' && c.parent === tryCell) {
          catchCell = c;
        }
      });
    }
    if (!catchCell) {
      return undefined;
    }
    const catchInner = new Set<any>();
    const visited = new Set<string>([catchCell.id, endTry.id]);
    const queue = this.successors(catchCell);
    while (queue.length > 0) {
      const c = queue.shift();
      if (!c || visited.has(c.id)) {
        continue;
      }
      visited.add(c.id);
      if (c.vertex && inner.has(c)) {
        catchInner.add(c);
      }
      queue.push(...this.successors(c));
    }
    // An empty catch is already shown by its dashed placeholder; no sub-scope.
    return catchInner.size > 0 ? {cell: catchCell, inner: catchInner} : undefined;
  }

  /** Each When / Else branch of a Case When, from its opener to its own closer. */
  private findCaseBranches(caseCell: any, inner: Set<any>, closerByTarget: Map<string, any>): SubScope[] {
    const cfg = BLOCK_SCOPE_CONFIG['CaseWhen'];
    const result: SubScope[] = [];
    // Branches can sit side by side (all directly after the Case) or be chained
    // one after another (Case -> When -> When-End -> Else -> Else-End -> Case-End).
    // Either way they are model children of this Case.
    const heads = Array.from(inner).filter(c => (c.value?.tagName === 'When' || c.value?.tagName === 'ElseWhen')
      && c.parent === caseCell);
    for (const head of (heads.length > 0 ? heads : this.successors(caseCell))) {
      const tag = head?.value?.tagName;
      if (tag !== 'When' && tag !== 'ElseWhen') {
        continue;
      }
      const closeTag = tag === 'When' ? 'EndWhen' : 'EndElse';
      const closer = closerByTarget.get(head.id + '|' + closeTag) || this.dfsFindCloser(head, tag, closeTag);
      if (!closer) {
        continue;
      }
      const predicate = attr(head, 'predicate');
      result.push({
        kind: 'branch', key: 'sub:' + head.id, cell: head, closer,
        inner: this.collectInner(head, closer),
        text: tag === 'ElseWhen' ? 'else' : (predicate ? 'when ' + predicate : 'when'),
        theme: {light: cfg.light, dark: cfg.dark}
      });
    }
    return result;
  }

  private successors(cell: any): any[] {
    return (cell?.edges || [])
      .filter((e: any) => e && e.source === cell && e.target)
      .map((e: any) => e.target);
  }

  // ------------------------------------------------------------ box geometry

  private visibleState(cell: any): any {
    const st = this.graph.getView().getState(cell);
    if (!st) {
      return null;
    }
    // Segment collapse hides cells via DOM display, not via the model.
    const nodes = [st.node, st.shape && st.shape.node];
    for (const n of nodes) {
      if (n && n.style && n.style.display === 'none') {
        return null;
      }
    }
    return st;
  }

  private computeBox(scope: Scope, scale: number, horizontalFlow: boolean,
                     segmentFrames: Map<string, any>): { box: BlockScopeBox; label: LabelSpec; subBoxes: SubBox[] } | null {
    const openerSt = this.visibleState(scope.opener);
    if (!openerSt) {
      return null; // opener hidden (collapsed ancestor or collapsed Segment)
    }
    const m = BLOCK_SCOPE_METRICS;
    const pad = m.padding * scale;

    const ext = {minX: openerSt.x, minY: openerSt.y, maxX: openerSt.x + openerSt.width, maxY: openerSt.y + openerSt.height};
    const include = (x: number, y: number, w: number, h: number) => {
      ext.minX = Math.min(ext.minX, x);
      ext.minY = Math.min(ext.minY, y);
      ext.maxX = Math.max(ext.maxX, x + w);
      ext.maxY = Math.max(ext.maxY, y + h);
    };

    const closerSt = this.visibleState(scope.closer);
    if (closerSt) {
      include(closerSt.x, closerSt.y, closerSt.width, closerSt.height);
    }

    const subBoxes: SubBox[] = [];
    if (!scope.collapsed) {
      scope.inner.forEach(c => {
        // Child scope boxes already carry their own padding, so adding this
        // box's padding on top guarantees a visible step on EVERY side.
        const childBox = this.boxes.get(c.id);
        if (childBox) {
          include(childBox.x, childBox.y, childBox.width, childBox.height);
        }
        const st = this.visibleState(c);
        if (st) {
          include(st.x, st.y, st.width, st.height);
        }
        const frame = segmentFrames.get(String(c.id));
        if (frame) {
          include(frame.x, frame.y, frame.width, frame.height);
        }
      });
      // Arrows routed around the side (e.g. an else-branch going down to the
      // End cell) must sit inside the tint, not on its border.
      this.includeInnerEdges([scope.opener, ...Array.from(scope.inner)], scope.inner, scope.closer, include);

      for (const sub of scope.subScopes) {
        const sb = this.computeSubBox(sub, scale, horizontalFlow, segmentFrames);
        if (sb) {
          subBoxes.push(sb);
          include(sb.box.x, sb.box.y, sb.box.width, sb.box.height);
        }
      }
    }

    let bx = ext.minX - pad;
    let by = ext.minY - pad;
    let bw = (ext.maxX - ext.minX) + 2 * pad;
    let bh = (ext.maxY - ext.minY) + 2 * pad;

    const cfg = BLOCK_SCOPE_CONFIG[scope.tag];
    const labelLen = Math.min(cfg.label(scope.opener).length, m.labelMaxChars) + (scope.collapsed ? 10 : 0);
    const labelW = labelLen * m.labelCharWidth * scale;
    const fontSize = m.labelFont * scale;
    const gap = m.labelGap * scale;
    const rail = m.rail * scale;
    const strip = m.labelStrip * scale;
    let label: LabelSpec;

    if (horizontalFlow) {
      // Rail on top; label in an extra strip above the content.
      by -= strip;
      bh += strip;
      bw = Math.max(bw, labelW + 2 * gap);
      label = {x: bx + gap, y: by + rail + fontSize + 2 * scale, anchor: 'start'};
    } else {
      // Label sits just above the opener, ending left of centre so it never
      // touches the incoming arrow (which enters the opener at its centre).
      const openerAtTop = openerSt.y <= ext.minY + 0.5;
      if (openerAtTop) {
        by -= strip;
        bh += strip;
      } else {
        bh += strip; // flow runs upwards: opener is at the bottom
      }
      const cx = openerSt.x + openerSt.width / 2;
      const baseline = openerAtTop
        ? openerSt.y - 5 * scale
        : openerSt.y + openerSt.height + fontSize + 3 * scale;

      // Edge labels ("job", "then", "else") of arrows entering the opener can
      // sit in the label band. Only labels that actually overlap the candidate
      // span count: a long incoming arrow puts its label far away, and that
      // must not push this label (and the box) across neighbouring branches.
      const obstacles: BlockScopeBox[] = [];
      if (openerAtTop) {
        const bandTop = baseline - fontSize - 2 * scale;
        for (const e of (scope.opener.edges || [])) {
          if (!e || e.target !== scope.opener) {
            continue;
          }
          const es = this.visibleState(e);
          const lb = es ? this.edgeLabelBounds(e, es, scale) : null;
          if (lb && lb.y < openerSt.y && lb.y + lb.height > bandTop) {
            obstacles.push(lb);
          }
        }
      }
      const clear = 3 * scale;
      // dir -1: label ends left of the incoming arrow; dir +1: starts right of it.
      const place = (dir: number): { edge: number; shift: number } => {
        const home = cx + dir * gap;
        let edge = home;
        for (let k = 0; k <= obstacles.length; k++) {
          const x1 = dir < 0 ? edge - labelW : edge;
          const x2 = dir < 0 ? edge : edge + labelW;
          const hit = obstacles.find(o => o.x < x2 + clear && o.x + o.width > x1 - clear);
          if (!hit) {
            break;
          }
          edge = dir < 0 ? hit.x - clear : hit.x + hit.width + clear;
        }
        return {edge, shift: Math.abs(edge - home)};
      };
      const left = place(-1);
      const right = obstacles.length > 0 ? place(1) : {edge: cx + gap, shift: Infinity};
      const useRight = right.shift < left.shift;

      if (useRight) {
        // Only widen (rightwards) when a long label would pass the box edge.
        const maxEnd = bx + bw - gap;
        if (right.edge + labelW > maxEnd) {
          bw += right.edge + labelW - maxEnd;
        }
        label = {x: right.edge, y: baseline, anchor: 'start'};
      } else {
        // Only widen (leftwards) when a long label would cross the rail.
        const minStart = bx + rail + gap;
        if (left.edge - labelW < minStart) {
          const newLeft = left.edge - labelW - gap - rail;
          bw += bx - newLeft;
          bx = newLeft;
        }
        label = {x: left.edge, y: baseline, anchor: 'end'};
      }
    }

    return {box: {x: bx, y: by, width: bw, height: bh}, label, subBoxes};
  }

  /** Display bounds of an edge's label, measured if rendered, else estimated. */
  private edgeLabelBounds(edge: any, st: any, scale: number): BlockScopeBox | null {
    const bb = st.text && st.text.boundingBox;
    if (bb && bb.width > 0 && bb.height > 0) {
      return {x: bb.x, y: bb.y, width: bb.width, height: bb.height};
    }
    let text = '';
    try {
      text = typeof this.graph.getLabel === 'function' ? String(this.graph.getLabel(edge) || '') : '';
    } catch (e) {
      text = '';
    }
    text = text.replace(/<[^>]*>/g, '').trim();
    if (!text || !st.absoluteOffset) {
      return null;
    }
    const w = text.length * 6.2 * scale;
    const h = 12 * scale;
    return {x: st.absoluteOffset.x - w / 2, y: st.absoluteOffset.y - h / 2, width: w, height: h};
  }

  /** Adds edges that start in the scope and end inside it (or at its closer). */
  private includeInnerEdges(sources: any[], inner: Set<any>, closer: any,
                            include: (x: number, y: number, w: number, h: number) => void): void {
    for (const src of sources) {
      for (const e of (src?.edges || [])) {
        if (!e || e.source !== src || !e.target) {
          continue;
        }
        if (!inner.has(e.target) && e.target !== closer) {
          continue;
        }
        const st = this.visibleState(e);
        if (st && (st.width > 0 || st.height > 0)) {
          include(st.x, st.y, st.width, st.height);
        }
      }
    }
  }

  /**
   * Box of a sub-scope inside its parent (Catch in Try, When/Else in Case When).
   * Tighter padding than a scope. Catch keeps its label at the top-left; a
   * branch gets its label just above its diamond, shortened to fit the column
   * (branch columns can be narrow, and a sub-scope must never widen into the
   * neighbouring branch).
   */
  private computeSubBox(sub: SubScope, scale: number, horizontalFlow: boolean,
                        segmentFrames: Map<string, any>): SubBox | undefined {
    const st0 = this.visibleState(sub.cell);
    if (!st0) {
      return undefined;
    }
    let minX = st0.x, minY = st0.y, maxX = st0.x + st0.width, maxY = st0.y + st0.height;
    const include = (x: number, y: number, w: number, h: number) => {
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + w);
      maxY = Math.max(maxY, y + h);
    };
    if (sub.closer) {
      const cs = this.visibleState(sub.closer);
      if (cs) {
        include(cs.x, cs.y, cs.width, cs.height);
      }
    }
    sub.inner.forEach(c => {
      const b = this.boxes.get(c.id);
      if (b) {
        include(b.x, b.y, b.width, b.height);
      }
      const st = this.visibleState(c);
      if (st) {
        include(st.x, st.y, st.width, st.height);
      }
      const frame = segmentFrames.get(String(c.id));
      if (frame) {
        include(frame.x, frame.y, frame.width, frame.height);
      }
    });
    // Arrows inside the sub-scope only (for Catch, not the one leaving to EndTry).
    this.includeInnerEdges([sub.cell, ...Array.from(sub.inner)], sub.inner, sub.closer, include);

    const m = BLOCK_SCOPE_METRICS;
    const p = m.padding * scale * 0.6;
    const fontSize = m.labelFont * scale;
    const rail = m.rail * scale;
    const gap = m.labelGap * scale;
    let bx = minX - p;
    let by = minY - p;
    let bw = (maxX - minX) + 2 * p;
    let bh = (maxY - minY) + 2 * p;

    if (sub.kind === 'catch') {
      const label: LabelSpec = horizontalFlow
        ? {x: bx + gap, y: by + rail + fontSize + 2 * scale, anchor: 'start'}
        : {x: bx + rail + gap, y: by + fontSize + 4 * scale, anchor: 'start'};
      return {sub, box: {x: bx, y: by, width: bw, height: bh}, label, text: sub.text};
    }

    const strip = m.labelStrip * scale;
    let label: LabelSpec;
    let text: string;
    if (horizontalFlow) {
      by -= strip;
      bh += strip;
      text = this.fitLabel(sub.text, bw - 2 * gap, scale);
      label = {x: bx + gap, y: by + rail + fontSize + 2 * scale, anchor: 'start'};
    } else {
      const openerAtTop = st0.y <= minY + 0.5;
      if (openerAtTop) {
        by -= strip;
        bh += strip;
      } else {
        bh += strip;
      }
      // The arrow into the branch comes down its centre line: put the label on
      // whichever side has more room and shorten it to that room.
      const cx = st0.x + st0.width / 2;
      const baseline = openerAtTop
        ? st0.y - 5 * scale
        : st0.y + st0.height + fontSize + 3 * scale;
      // Step around the labels of arrows entering the branch (they sit in the
      // same band, centred on the arrow).
      let leftEdge = cx - gap;
      let rightEdge = cx + gap;
      if (openerAtTop) {
        const bandTop = baseline - fontSize - 2 * scale;
        const clear = 3 * scale;
        for (const e of (sub.cell.edges || [])) {
          if (!e || e.target !== sub.cell) {
            continue;
          }
          const es = this.visibleState(e);
          const lb = es ? this.edgeLabelBounds(e, es, scale) : null;
          if (lb && lb.y < st0.y && lb.y + lb.height > bandTop) {
            leftEdge = Math.min(leftEdge, lb.x - clear);
            rightEdge = Math.max(rightEdge, lb.x + lb.width + clear);
          }
        }
      }
      const leftRoom = leftEdge - (bx + rail + gap);
      const rightRoom = (bx + bw - gap) - rightEdge;
      const useRight = rightRoom > leftRoom;
      text = this.fitLabel(sub.text, Math.max(leftRoom, rightRoom), scale);
      label = useRight ? {x: rightEdge, y: baseline, anchor: 'start'} : {x: leftEdge, y: baseline, anchor: 'end'};
    }
    return {sub, box: {x: bx, y: by, width: bw, height: bh}, label, text};
  }

  /** Shortens a label to the given width; empty when not even a few characters fit. */
  private fitLabel(text: string, widthPx: number, scale: number): string {
    const max = Math.floor(widthPx / (BLOCK_SCOPE_METRICS.labelCharWidth * scale));
    if (max < 4) {
      return '';
    }
    return truncate(text, Math.min(max, BLOCK_SCOPE_METRICS.labelMaxChars));
  }

  /** segmentId -> view state of its SegmentContainer frame. */
  private collectSegmentFrames(): Map<string, any> {
    const frames = new Map<string, any>();
    const model = this.graph.getModel();
    const children = model.getChildren(this.graph.getDefaultParent()) || [];
    for (const c of children) {
      if (c && c.value && c.value.tagName === 'SegmentContainer') {
        const st = this.graph.getView().getState(c);
        const segId = attr(c, 'segmentId');
        if (st && segId) {
          frames.set(segId, st);
        }
      }
    }
    return frames;
  }

  // ---------------------------------------------------------------- painting

  /**
   * On dark backgrounds a thin layer of a saturated colour mixes into brown or
   * olive, so dark themes tint with the pale version of the colour (the same
   * one used for the label text): the area gets slightly lighter instead.
   */
  private themeFor(dark: BlockTheme, light: BlockTheme, isDark: boolean): BlockTheme {
    return isDark ? {...dark, tint: dark.text} : light;
  }

  /** Outermost scope carries the tint; nested scopes stay light. */
  private tintOpacity(depth: number, isDark: boolean): number {
    if (depth === 0) {
      return isDark ? 0.10 : 0.12;
    }
    return isDark ? 0.055 : 0.05;
  }

  private paintScope(layer: SVGGElement, box: BlockScopeBox, t: BlockTheme, label: string, labelSpec: LabelSpec,
                     opacity: number, scale: number, horizontalFlow: boolean, key: string, blockId: string | null): void {
    const m = BLOCK_SCOPE_METRICS;
    const minimap = !!this.options.minimap;
    const g = document.createElementNS(SVG_NS, 'g') as SVGGElement;
    g.setAttribute('data-scope-key', key);
    if (blockId) {
      g.setAttribute('data-block-id', blockId);
    }

    const tint = document.createElementNS(SVG_NS, 'rect');
    tint.setAttribute('x', String(box.x));
    tint.setAttribute('y', String(box.y));
    tint.setAttribute('width', String(Math.max(0, box.width)));
    tint.setAttribute('height', String(Math.max(0, box.height)));
    tint.setAttribute('fill', t.tint);
    tint.setAttribute('fill-opacity', String(opacity));
    tint.setAttribute('stroke', 'none');
    tint.setAttribute('class', 'scope-tint');
    tint.setAttribute('data-base-opacity', String(opacity));
    g.appendChild(tint);

    // In the minimap the scale is tiny; keep rails visible.
    const railW = minimap ? Math.max(2, m.rail * scale) : m.rail * scale;
    const rail = document.createElementNS(SVG_NS, 'rect');
    rail.setAttribute('class', 'scope-rail');
    rail.setAttribute('data-thickness', String(railW));
    rail.setAttribute('x', String(box.x));
    rail.setAttribute('y', String(box.y));
    rail.setAttribute('width', String(horizontalFlow ? box.width : railW));
    rail.setAttribute('height', String(horizontalFlow ? railW : box.height));
    rail.setAttribute('fill', t.rail);
    g.appendChild(rail);

    if (label && !minimap) {
      const text = document.createElementNS(SVG_NS, 'text');
      text.setAttribute('x', String(labelSpec.x));
      text.setAttribute('y', String(labelSpec.y));
      text.setAttribute('text-anchor', labelSpec.anchor);
      text.setAttribute('fill', t.text);
      text.setAttribute('font-size', String(m.labelFont * scale));
      text.setAttribute('font-family', (typeof mxConstants !== 'undefined' && mxConstants.DEFAULT_FONTFAMILY) || 'Arial, Helvetica, sans-serif');
      text.setAttribute('style', 'user-select:none;-webkit-user-select:none;-ms-user-select:none;');
      text.textContent = label;
      g.appendChild(text);
    }
    layer.appendChild(g);
    if (key === this.hoverKey) {
      this.styleHover(g, true, horizontalFlow);
    }
  }

  // ------------------------------------------------------ indented drawing

  /**
   * Indented layout: position already shows the nesting, so each block gets
   * only a thin guide line in its colour (like an editor's indent guide) and
   * its label to the right of the opener. The tint appears on hover only.
   */
  private drawIndented(layer: SVGGElement, scopes: Scope[], isDark: boolean, scale: number,
                       segmentFrames: Map<string, any>): void {
    const m = BLOCK_SCOPE_METRICS;
    const minimap = !!this.options.minimap;
    const pad = m.padding * scale;
    // Thin guide; in the minimap solid and at least 1px so it stays visible.
    const thick = minimap ? Math.max(1, GUIDE_WIDTH * scale) : Math.max(0.75, GUIDE_WIDTH * scale);
    const dash = minimap ? null : GUIDE_DASH.map(d => d * scale).join(' ');
    const fontSize = m.labelFont * scale;
    const catchT = this.themeFor(CATCH_THEME.dark, CATCH_THEME.light, isDark);
    const horizontal = this.isHorizontalFlow();

    const ordered = [...scopes].sort((a, b) => b.depth - a.depth); // inner boxes first (for getBox)
    const painted: Array<() => void> = [];
    for (const scope of ordered) {
      const op = this.visibleState(scope.opener);
      if (!op) {
        continue;
      }
      const cfg = BLOCK_SCOPE_CONFIG[scope.tag];
      const t = this.themeFor(cfg.dark, cfg.light, isDark);
      const cl = this.visibleState(scope.closer);

      // Hover box: everything the block contains.
      let minX = op.x, minY = op.y, maxX = op.x + op.width, maxY = op.y + op.height;
      const include = (st: any) => {
        if (st) {
          minX = Math.min(minX, st.x);
          minY = Math.min(minY, st.y);
          maxX = Math.max(maxX, st.x + st.width);
          maxY = Math.max(maxY, st.y + st.height);
        }
      };
      include(cl);
      if (!scope.collapsed) {
        scope.inner.forEach(c => {
          include(this.visibleState(c));
          const b = this.boxes.get(c.id);
          if (b) {
            include(b);
          }
          const f = segmentFrames.get(String(c.id));
          if (f) {
            include(f);
          }
        });
      }
      const box: BlockScopeBox = {x: minX - pad, y: minY - pad, width: (maxX - minX) + 2 * pad, height: (maxY - minY) + 2 * pad};
      this.boxes.set(scope.opener.id, box);

      painted.push(() => {
        const key = String(scope.opener.id);
        this.hoverTargets.set(key, key);
        this.hoverTargets.set(String(scope.closer.id), key);
        const g = document.createElementNS(SVG_NS, 'g') as SVGGElement;
        g.setAttribute('data-scope-key', key);
        g.setAttribute('data-block-id', key);

        const tint = document.createElementNS(SVG_NS, 'rect');
        tint.setAttribute('x', String(box.x));
        tint.setAttribute('y', String(box.y));
        tint.setAttribute('width', String(Math.max(0, box.width)));
        tint.setAttribute('height', String(Math.max(0, box.height)));
        tint.setAttribute('fill', t.tint);
        tint.setAttribute('fill-opacity', '0');
        tint.setAttribute('class', 'scope-tint');
        tint.setAttribute('data-base-opacity', '0');
        g.appendChild(tint);

        if (!scope.collapsed && cl) {
          // Guide beside the opener's spine, from opener to closer, broken where
          // a same-level step sits on it (e.g. Catch). After a Catch the Try
          // guide continues in the Catch colour.
          // Top-down: vertical line left of the spine. Left-right: horizontal
          // line above the spine (the same layout turned 90 degrees).
          const h = horizontal;
          const g0 = h ? op.y + op.height / 2 - (INDENT_GUIDE_OFFSET * scale)
                       : op.x + op.width / 2 - (INDENT_GUIDE_OFFSET * scale);
          const a1 = h ? op.x + op.width + 3 * scale : op.y + op.height + 3 * scale;
          const a2 = h ? cl.x - 3 * scale : cl.y - 3 * scale;
          const lead = (st: any) => h ? st.x : st.y;
          const len = (st: any) => h ? st.width : st.height;
          const crossLead = (st: any) => h ? st.y : st.x;
          const crossLen = (st: any) => h ? st.height : st.width;
          // Only the block's own steps can sit on its guide (between its opener
          // and closer); checking every cell of the workflow per block was the
          // main cost on large workflows.
          const blockers = Array.from(scope.inner)
            .map(c => ({c, st: this.visibleState(c)}))
            .filter(o => o.st && crossLead(o.st) - 2 * scale <= g0 && crossLead(o.st) + crossLen(o.st) + 2 * scale >= g0
              && lead(o.st) < a2 && lead(o.st) + len(o.st) > a1)
            .sort((a, b) => lead(a.st) - lead(b.st));
          let from = a1;
          let colour = t.rail;
          // A dashed line per segment (SVG rects cannot be dashed). Class
          // 'scope-guide', not 'scope-rail': hover leaves the guide unchanged.
          const segment = (a: number, b: number, colourOfSegment: string) => {
            if (b - a < 2 * scale) {
              return;
            }
            const ln = document.createElementNS(SVG_NS, 'line');
            ln.setAttribute('x1', String(h ? a : g0));
            ln.setAttribute('y1', String(h ? g0 : a));
            ln.setAttribute('x2', String(h ? b : g0));
            ln.setAttribute('y2', String(h ? g0 : b));
            ln.setAttribute('stroke', colourOfSegment);
            ln.setAttribute('stroke-width', String(thick));
            if (dash) {
              ln.setAttribute('stroke-dasharray', dash);
            }
            ln.setAttribute('class', 'scope-guide');
            g.appendChild(ln);
          };
          for (const o of blockers) {
            segment(from, lead(o.st) - 3 * scale, colour);
            from = Math.max(from, lead(o.st) + len(o.st) + 3 * scale);
            if (scope.tag === 'Try' && o.c.value.tagName === 'Catch'
              && (attr(o.c, 'targetId') === String(scope.opener.id) || o.c.parent === scope.opener)) {
              colour = catchT.rail;
            }
          }
          segment(from, a2, colour);
        }

        if (!minimap) {
          let label = truncate(cfg.label(scope.opener), m.labelMaxChars);
          if (scope.collapsed && scope.stepCount > 0) {
            label += ' (' + scope.stepCount + (scope.stepCount === 1 ? ' step)' : ' steps)');
          }
          const text = document.createElementNS(SVG_NS, 'text');
          // Left-right: just above the opener, right of the arrow that may come
          // down into its top. Top-down: to the right of the opener.
          let lx = horizontal ? op.x + op.width / 2 + m.labelGap * scale : op.x + op.width + m.labelGap * scale;
          const ly = horizontal ? op.y - 5 * scale : op.y + op.height / 2 + fontSize * 0.35;
          // Step past labels of arrows touching this opener ("else", "job"...):
          // left-right they sit in the same band above the opener.
          const lw = label.length * m.labelCharWidth * scale;
          const clear = 3 * scale;
          const bandTop = ly - fontSize;
          const bandBottom = ly + 2 * scale;
          const obstacles: BlockScopeBox[] = [];
          for (const e of (scope.opener.edges || [])) {
            const es = e ? this.visibleState(e) : null;
            const lb = es ? this.edgeLabelBounds(e, es, scale) : null;
            if (lb && lb.y < bandBottom && lb.y + lb.height > bandTop) {
              obstacles.push(lb);
            }
          }
          for (let k = 0; k <= obstacles.length; k++) {
            const hit = obstacles.find(o => o.x < lx + lw + clear && o.x + o.width > lx - clear);
            if (!hit) {
              break;
            }
            lx = hit.x + hit.width + clear;
          }
          text.setAttribute('x', String(lx));
          text.setAttribute('y', String(ly));
          text.setAttribute('text-anchor', 'start');
          text.setAttribute('fill', t.text);
          text.setAttribute('font-size', String(fontSize));
          text.setAttribute('font-family', (typeof mxConstants !== 'undefined' && mxConstants.DEFAULT_FONTFAMILY) || 'Arial, Helvetica, sans-serif');
          text.setAttribute('style', 'user-select:none;-webkit-user-select:none;-ms-user-select:none;');
          text.textContent = label;
          g.appendChild(text);
        }
        layer.appendChild(g);
        if (key === this.hoverKey) {
          this.styleHover(g, true, horizontal);
        }
      });
    }
    // Outer blocks first, so an inner block's hover tint sits on top.
    for (let i = painted.length - 1; i >= 0; i--) {
      painted[i]();
    }
    this.debug('indented: scopes', scopes.length, 'drawn', painted.length);
  }

  // ------------------------------------------------------- segment frames

  /**
   * Segment frames for views without their own Segment code. Same look and
   * geometry as the editor's drawSegmentContainers: dashed box (blue, lighter
   * in dark theme; dash alternating with depth), 10px + 6px per enclosing
   * Segment padding, bold header at the top-left; a collapsed Segment is a box
   * as wide as its header (placed as the layout reserved it).
   */
  private drawSegments(layer: SVGGElement, isDark: boolean, scale: number): void {
    const model = this.graph.getModel();
    const all: any[] = Object.keys(model.cells || {}).map(k => model.cells[k])
      .filter((c: any) => c && c.vertex && c.value && c.value.tagName);
    const segs = all.filter(c => c.value.tagName === 'Segment' && this.visibleState(c));
    if (segs.length === 0) {
      return;
    }
    const endOf = new Map<string, any>();
    for (const c of all) {
      if (c.value.tagName === 'EndSegment') {
        endOf.set(attr(c, 'targetId'), c);
      }
    }
    const depthOf = (c: any) => {
      let d = 0;
      for (let p = c.parent; p; p = p.parent) {
        if (p.value && p.value.tagName === 'Segment') {
          d++;
        }
      }
      return d;
    };
    const minimap = !!this.options.minimap;
    const colour = isDark ? '#90CAF9' : '#1E88E5';
    const textColour = isDark ? '#fafafa' : '#3d464d';
    const horizontal = this.isHorizontalFlow();
    const frameOf = new Map<string, BlockScopeBox>();
    const ordered = [...segs].sort((a, b) => depthOf(b) - depthOf(a));

    for (const seg of ordered) {
      const ss = this.visibleState(seg);
      const end = endOf.get(String(seg.id));
      const depth = depthOf(seg);
      const pad = (10 + depth * 6) * scale;
      const label = attr(seg, 'label');
      const descendants = model.getDescendants(seg).filter((c: any) => c !== seg && c.vertex && c.value
        && !ORDER_TAGS.has(c.value.tagName));
      const inner = descendants.filter((c: any) => this.visibleState(c));
      let box: BlockScopeBox;
      let header: BlockScopeBox;
      let lx: number;
      let ly: number;
      let anchor: 'start' | 'middle' = 'start';
      if (seg.collapsed || inner.length === 0) {
        const hw = Math.max(120, (label || 'Segment').length * 7 + 40) * scale;
        const bx = this.indented && !horizontal
          ? ss.x + ss.width / 2 - 14 * scale          // COLLAPSED_SEGMENT_LEAD: box right of the start point
          : ss.x + ss.width / 2 - hw / 2;
        box = {x: bx, y: ss.y - pad, width: hw, height: Math.max(36 * scale, ss.height + 2 * pad)};
        header = box;
        if (this.indented && horizontal) {
          lx = box.x + box.width / 2; ly = box.y + box.height - 5 * scale; anchor = 'middle';   // below the arrow
        } else if (this.indented) {
          lx = box.x + 24 * scale; ly = box.y + box.height / 2 + 4 * scale;                      // right of the arrow
        } else {
          lx = box.x + box.width / 2; ly = box.y + box.height / 2 + 4 * scale; anchor = 'middle';
        }
      } else {
        let x1 = ss.x, y1 = ss.y, x2 = ss.x + ss.width, y2 = ss.y + ss.height;
        const inc = (b: BlockScopeBox) => {
          x1 = Math.min(x1, b.x); y1 = Math.min(y1, b.y);
          x2 = Math.max(x2, b.x + b.width); y2 = Math.max(y2, b.y + b.height);
        };
        for (const c of inner) {
          inc(this.visibleState(c));
          const bb = this.boxes.get(c.id);
          if (bb) {
            inc(bb);
          }
          const nf = frameOf.get(String(c.id));
          if (nf) {
            inc(nf);
          }
        }
        const es = end ? this.visibleState(end) : null;
        if (es) {
          y2 = Math.max(y2, es.y + es.height);
        }
        box = {x: x1 - pad, y: y1 - pad, width: (x2 - x1) + 2 * pad, height: (y2 - y1) + 2 * pad};
        header = {x: box.x, y: box.y, width: box.width, height: 20 * scale};
        lx = box.x + 44 * scale;
        ly = box.y + 14 * scale;
      }
      frameOf.set(String(seg.id), box);
      this.frames.push({cell: seg, box, header});

      const g = document.createElementNS(SVG_NS, 'g') as SVGGElement;
      g.setAttribute('data-segment-id', String(seg.id));
      const r = document.createElementNS(SVG_NS, 'rect');
      r.setAttribute('x', String(box.x));
      r.setAttribute('y', String(box.y));
      r.setAttribute('width', String(Math.max(0, box.width)));
      r.setAttribute('height', String(Math.max(0, box.height)));
      r.setAttribute('fill', 'none');
      r.setAttribute('stroke', colour);
      r.setAttribute('stroke-width', String(Math.max(1, scale)));
      r.setAttribute('stroke-dasharray', depth % 2 === 0 ? (8 * scale) + ' ' + (4 * scale) : (4 * scale) + ' ' + (4 * scale));
      g.appendChild(r);
      if (label && !minimap) {
        const t = document.createElementNS(SVG_NS, 'text');
        t.setAttribute('x', String(lx));
        t.setAttribute('y', String(ly));
        t.setAttribute('text-anchor', anchor);
        t.setAttribute('fill', textColour);
        t.setAttribute('font-size', String(11 * scale));
        t.setAttribute('font-weight', 'bold');
        t.setAttribute('font-family', (typeof mxConstants !== 'undefined' && mxConstants.DEFAULT_FONTFAMILY) || 'Arial, Helvetica, sans-serif');
        t.setAttribute('style', 'user-select:none;-webkit-user-select:none;-ms-user-select:none;');
        t.textContent = label;
        g.appendChild(t);
      }
      layer.insertBefore(g, layer.firstChild);   // frames beneath the block guides

      // Collapsed: mxGraph re-attaches arrows from the hidden steps to the
      // Segment's start point and still draws their labels; hide those labels
      // (and restore them once the Segment is expanded again). Decided per
      // arrow (one end hidden = re-attached), so an expanded outer Segment,
      // processed after its collapsed inner ones, does not undo it.
      const edges = new Set<any>();
      descendants.forEach((c: any) => (c.edges || []).forEach((e: any) => edges.add(e)));
      if (end) {
        (end.edges || []).filter((e: any) => e.target === end).forEach((e: any) => edges.add(e));
      }
      edges.forEach(e => {
        const es = this.graph.getView().getState(e);
        if (es && es.text && es.text.node) {
          const reattached = !this.graph.getView().getState(e.source) || !this.graph.getView().getState(e.target);
          es.text.node.style.display = reattached ? 'none' : '';
        }
      });
    }
  }

  // ------------------------------------------------------------------ hover

  private setHover(key: string | null): void {
    if (key === this.hoverKey) {
      return;
    }
    this.hoverKey = key;
    if (!this.layer) {
      return;
    }
    const horizontalFlow = this.isHorizontalFlow();
    const groups = this.layer.querySelectorAll('g[data-scope-key]');
    for (let i = 0; i < groups.length; i++) {
      const g = groups[i] as SVGGElement;
      this.styleHover(g, g.getAttribute('data-scope-key') === key, horizontalFlow);
    }
  }

  /** Hovered scope: stronger tint and a thicker rail. */
  private styleHover(g: SVGGElement, on: boolean, horizontalFlow: boolean): void {
    const tint = g.querySelector('rect.scope-tint');
    if (tint) {
      const base = parseFloat(tint.getAttribute('data-base-opacity') || '0.1');
      tint.setAttribute('fill-opacity', String(on ? Math.min(0.35, base * 2 + 0.08) : base));
    }
    const rails = g.querySelectorAll('rect.scope-rail');
    for (let i = 0; i < rails.length; i++) {
      const rail = rails[i];
      const thick = parseFloat(rail.getAttribute('data-thickness') || '4');
      const vertical = rail.getAttribute('data-vertical') === '1' || (!horizontalFlow && rail.getAttribute('data-vertical') !== '0');
      const size = on ? thick * 1.75 : thick;
      if (vertical) {
        const cx = parseFloat(rail.getAttribute('data-cx') || '');
        rail.setAttribute('width', String(size));
        if (!isNaN(cx)) {
          rail.setAttribute('x', String(cx - size / 2));
        }
      } else {
        const cy = parseFloat(rail.getAttribute('data-cy') || '');
        rail.setAttribute('height', String(size));
        if (!isNaN(cy)) {
          rail.setAttribute('y', String(cy - size / 2));
        }
      }
    }
  }

  private ensureLayer(): SVGGElement | null {
    const view = this.graph.getView();
    const pane = view.getBackgroundPane ? view.getBackgroundPane() : null;
    if (!pane || pane.namespaceURI !== SVG_NS) {
      return null; // only the SVG dialect is supported
    }
    if (!this.layer) {
      this.layer = document.createElementNS(SVG_NS, 'g') as SVGGElement;
      this.layer.setAttribute('class', 'block-scope-layer');
      this.layer.setAttribute('pointer-events', 'none');
      // Scope labels are decoration: dragging across the canvas must not
      // select them like page text.
      this.layer.setAttribute('style', 'user-select:none;-webkit-user-select:none;-ms-user-select:none;');
    }
    // Re-append every pass: keeps the layer above any page/background shape
    // mxGraph may have added to the background pane since the last draw.
    pane.appendChild(this.layer);
    return this.layer;
  }

  // ----------------------------------------------------------------- helpers

  private isDarkTheme(): boolean {
    const p = this.options.getPreferences() || {};
    return !(p.theme === 'light' || p.theme === 'lighter' || !p.theme);
  }

  private isHorizontalFlow(): boolean {
    // The layout pass records the direction it used on the (shared) model:
    // preferences.workflowLayout ('vertical' / 'horizontal') or, when that is
    // not set, preferences.orientation.
    const m = this.graph && this.graph.getModel ? this.graph.getModel() : null;
    if (m && (m.__blockLayoutDir === 'horizontal' || m.__blockLayoutDir === 'vertical')) {
      return m.__blockLayoutDir === 'horizontal';
    }
    const p = this.options.getPreferences() || {};
    if (p.workflowLayout === 'horizontal' || p.workflowLayout === 'vertical') {
      return p.workflowLayout === 'horizontal';
    }
    return p.orientation === 'east' || p.orientation === 'west';
  }
}
