/**
 * Block shift pass (Phase 4)
 * --------------------------
 * mxHierarchicalLayout positions cells without knowing about block scopes, so
 * in wide Forks an inner block's children can end up underneath neighbouring
 * branches. No rectangle around that block can then avoid covering them.
 *
 * Workflows are strictly block-structured (every opener has exactly one closer
 * with branches in between), so this pass rebuilds the CROSS-axis positions
 * (x for top-down flows, y for left-right flows) from that structure: each
 * branch gets its own column, as wide as its content plus the padding of every
 * scope inside it, and columns sit side by side.
 *
 * Guardrails:
 *  - BLOCK_SHIFT_MODE decides when it runs (always, or only on an overlap).
 *  - Flow-axis positions (ranks) and the branch order chosen by the
 *    hierarchical layout are kept; only cross-axis spacing changes.
 *  - Any structure it does not fully understand makes it change nothing.
 *  - Only geometry changes; the model is rebuilt from JSON on every load.
 */

import {BLOCK_SCOPE_CONFIG, BLOCK_SCOPE_METRICS, DEFAULT_BLOCK_SCOPE_TAGS} from './block-scope.renderer';

declare const mxPoint: any;

/** Set to false to switch the pass off without touching the service. */
export const BLOCK_SHIFT_PASS_ENABLED = true;

/**
 * 'always'    : use the structured layout whenever the block structure is
 *               understood (tidy columns and arrows, e.g. in wide Forks).
 * 'onOverlap' : only when a scope box would cover cells of another branch.
 */
export const BLOCK_SHIFT_MODE: 'always' | 'onOverlap' = 'always';

/**
 * Layout used for workflows that contain blocks:
 *  'indented'   : code-like. A block's contents sit INDENT px right of its
 *                 opener, the closer comes back to the opener's column,
 *                 branches (If, Fork, Case When) are columns side by side.
 *  'structured' : centred columns (the previous structured layout).
 * Both layouts work top-to-bottom and left-to-right. The direction comes from
 * preferences.workflowLayout ('vertical' / 'horizontal'), see flowDirection().
 */
export type WorkflowLayoutMode = 'indented' | 'structured' | 'classic';
export const DEFAULT_WORKFLOW_LAYOUT: WorkflowLayoutMode = 'indented';

/*
 * The user's choice between the new (indented) and the old (classic: mxGraph's
 * hierarchical layout as it was before the indented layout, no guides) layout.
 * Remembered in this browser and shared by the editor, the order view and the
 * dependency dialog. Until the user chooses, DEFAULT_WORKFLOW_LAYOUT applies.
 */
const LAYOUT_MODE_KEY = 'workflowLayoutMode';

function isLayoutMode(v: any): v is WorkflowLayoutMode {
  return v === 'indented' || v === 'structured' || v === 'classic';
}

export function getWorkflowLayoutMode(): WorkflowLayoutMode {
  try {
    const v = sessionStorage.getItem(LAYOUT_MODE_KEY);
    if (isLayoutMode(v)) {
      return v;
    }
  } catch (e) {
    // storage unavailable
  }
  return DEFAULT_WORKFLOW_LAYOUT;
}

export function setWorkflowLayoutMode(mode: WorkflowLayoutMode): void {
  try {
    sessionStorage.setItem(LAYOUT_MODE_KEY, mode);
  } catch (e) {
    // storage unavailable: the choice lasts for this page only
  }
}

export type FlowDirection = 'vertical' | 'horizontal';

/**
 * Flow direction: preferences.workflowLayout ('vertical' = top to bottom,
 * 'horizontal' = left to right) when set, otherwise the classic
 * preferences.orientation (east/west = horizontal, anything else = vertical).
 */
export function flowDirection(workflowLayout: any, orientation: any): FlowDirection {
  if (workflowLayout === 'vertical' || workflowLayout === 'horizontal') {
    return workflowLayout;
  }
  return orientation === 'east' || orientation === 'west' ? 'horizontal' : 'vertical';
}

/** mxHierarchicalLayout direction for a flow direction ('north' = top-down, 'west' = left-right). */
export function layoutOrientation(workflowLayout: any, orientation: any): string {
  if (workflowLayout === 'vertical') {
    return 'north';
  }
  if (workflowLayout === 'horizontal') {
    return 'west';
  }
  return orientation || 'north';
}

/**
 * Steps line up on a spine this far from their column's left edge: half the
 * diamond width (WorkflowService.DIAMOND_SIZE = 50), so diamonds fill their
 * column and wider steps (jobs) start at the column edge.
 */
const SPINE = 25;
/** Step per nesting level in the indented layout (spine + 20px). */
export const INDENT = SPINE + 20;

/**
 * Gap between parallel branches in the indented layout. Fixed on purpose: the
 * service boosts mxGraph's intraCellSpacing for Forks whose branches start with
 * a block or Segment (needed by the centred layouts), which would spread the
 * indented branches hundreds of pixels apart.
 */
const INDENT_BRANCH_GAP = 32;

/** Gap between workflows laid out side by side (order view dependency display). */
const CHAIN_GAP = 80;
/**
 * Gap between workflows stacked one below the other (top-down dependency
 * display; leaves room for a start circle placed above a workflow).
 */
const STACK_GAP = 140;

/** Minimum distance of the indented layout from the canvas's top-left corner. */
const INDENT_ORIGIN = 40;

/**
 * Top-down, indented layout: the component draws a collapsed Segment's box
 * starting this far left of the start point (spine) and extending to the right,
 * with the header text right of the arrow (see drawSegmentContainers).
 */
export const COLLAPSED_SEGMENT_LEAD = 14;

/** Mirrors WorkflowService.computeSegmentHeaderWidth (the collapsed frame's width). */
function segmentHeaderWidth(cell: any): number {
  const label = attr(cell, 'label') || attr(cell, 'displayLabel') || 'Segment';
  return Math.max(120, label.length * 7 + 40);
}

/** Mirrors the frame padding in drawSegmentContainers: 10px + 6px per enclosing Segment. */
function segmentPadding(cell: any): number {
  let depth = 0;
  for (let p = cell?.parent; p; p = p.parent) {
    if (tagOf(p) === 'Segment') {
      depth++;
    }
  }
  return SEGMENT_BASE_PADDING + depth * SEGMENT_DEPTH_PADDING;
}

/** Layout mode: an explicit mode passed in, else the user's choice (getWorkflowLayoutMode). */
export function resolveWorkflowLayout(preference?: any): WorkflowLayoutMode {
  return isLayoutMode(preference) ? preference : getWorkflowLayoutMode();
}

/**
 * Which layout the last pass actually produced ('hierarchical' when it was
 * skipped). Stored on the model, so the minimap's graph sees it too.
 */
export function appliedWorkflowLayout(graph: any): 'indented' | 'structured' | 'hierarchical' {
  const m = graph && typeof graph.getModel === 'function' ? graph.getModel() : null;
  return (m && m.__blockLayoutMode) || 'hierarchical';
}

function debug(...args: any[]): void {
  try {
    if (localStorage.getItem('blockScopeDebug') === '1') {
      console.log('[BlockShift]', ...args);
    }
  } catch (e) {
    // localStorage unavailable
  }
}

/** Every structural opener and its closer (scoped blocks plus When/Else/Segment). */
const PAIRS: { [open: string]: string } = {
  Try: 'EndTry', If: 'EndIf', Retry: 'EndRetry', Cycle: 'EndCycle', Lock: 'EndLock',
  Fork: 'Join', ForkList: 'EndForkList', CaseWhen: 'EndCase', When: 'EndWhen', ElseWhen: 'EndElse',
  StickySubagent: 'EndStickySubagent', Options: 'EndOptions', AdmissionTime: 'EndAdmissionTime',
  ConsumeNotices: 'EndConsumeNotices', Segment: 'EndSegment'
};
const CLOSERS = new Set(Object.keys(PAIRS).map(k => PAIRS[k]));

const SEGMENT_BASE_PADDING = 10;   // matches drawSegmentContainers
const SEGMENT_DEPTH_PADDING = 6;
const EMPTY_BRANCH_WIDTH = 24;     // room for a straight opener -> closer arrow

class StructureError extends Error {
}

interface CellItem {
  kind: 'cell';
  cell: any;
  w: number;
}

interface BlockItem {
  kind: 'block';
  opener: any;
  closer: any;
  branches: Chain[];
  pad: number;
  w: number;
}

interface Chain {
  items: Array<CellItem | BlockItem>;
  w: number;
}

function tagOf(cell: any): string {
  return cell?.value?.tagName || '';
}

function attr(cell: any, name: string): string {
  const v = cell?.value;
  return v && typeof v.getAttribute === 'function' ? (v.getAttribute(name) || '') : '';
}

/**
 * Re-positions cells along the cross axis so that every block has its own
 * column. Call right after mxHierarchicalLayout.execute(). Returns true when
 * geometry was changed.
 */
/**
 * Classic (hierarchical) layout: room for collapsed Segment boxes.
 * A collapsed (or empty) Segment is drawn as a box as wide as its header
 * (drawSegmentContainers / the renderer), but the hierarchical layout only sees
 * its 2x2 start point and leaves a normal step gap: the box then overlaps its
 * neighbours (left-right the width runs along the flow). This gives each such
 * start point the size of its box for the layout; the returned function puts
 * it back to 2x2 where the box will be drawn (centred across, the padding
 * below the box's top edge). Call both inside one model update.
 */
export function reserveCollapsedSegmentBoxes(graph: any): () => void {
  const model = graph.getModel();
  const changed: Array<{ cell: any; w: number; h: number; pad: number }> = [];
  const isShown = (c: any) => {
    if (!model.isVisible(c)) {
      return false;
    }
    for (let p = c.parent; p && p !== graph.getDefaultParent(); p = p.parent) {
      if (p.collapsed || !model.isVisible(p)) {
        return false;
      }
    }
    return true;
  };
  for (const id of Object.keys(model.cells || {})) {
    const c = model.cells[id];
    if (!c || !c.vertex || tagOf(c) !== 'Segment' || !isShown(c)) {
      continue;
    }
    const empty = !(c.children || []).some((ch: any) => ch && ch.vertex && model.isVisible(ch));
    if (!c.collapsed && !empty) {
      continue;
    }
    const g = model.getGeometry(c);
    if (!g) {
      continue;
    }
    const w = segmentHeaderWidth(c);
    const h = 36;
    const ng = g.clone();
    ng.width = w;
    ng.height = h;
    model.setGeometry(c, ng);
    changed.push({cell: c, w: g.width, h: g.height, pad: segmentPadding(c)});
  }
  let restored = false;
  return () => {
    if (restored) {
      return;   // safe to call twice
    }
    restored = true;
    for (const ch of changed) {
      const g = model.getGeometry(ch.cell);
      if (!g) {
        continue;
      }
      const ng = g.clone();
      // Centred across the reserved width; the box's top edge is the padding
      // above the start point (by = start.y - padding).
      ng.x = g.x + g.width / 2 - ch.w / 2;
      ng.y = g.y + ch.pad;
      ng.width = ch.w;
      ng.height = ch.h;
      model.setGeometry(ch.cell, ng);
    }
  };
}

/**
 * Classic layout for the dependency display (several workflows in one graph,
 * recognised by 'Workflow' cells): mxGraph's hierarchical layout is run on each
 * workflow on its own (so they cannot interleave), the workflows are stacked
 * one below the other, a lone start circle goes above its workflow, a
 * dependent-workflow box beside the step it belongs to, and cross connections
 * run along a lane on the right (top-down; left-right the same turned 90
 * degrees: dependents below, under their step). makeLayout creates a configured
 * mxHierarchicalLayout. Returns false (nothing changed) when the graph is not
 * such a display or its structure is not understood; the caller then runs the
 * plain hierarchical layout.
 */
export function layoutClassicPerWorkflow(graph: any, makeLayout: () => any, rankGap: number, horizontal = false,
                                         beforeRouting?: () => void): boolean {
  if (!graph) {
    return false;
  }
  const model = graph.getModel();
  const parent = graph.getDefaultParent();
  const cellsAll = Object.keys(model.cells || {}).map(k => model.cells[k]);
  if (!cellsAll.some((c: any) => c && c.vertex && tagOf(c) === 'Workflow')) {
    return false;   // not a dependency display: plain classic layout
  }
  let parts: ReturnType<ShiftPass['partition']> = null;
  try {
    parts = new ShiftPass(graph, 'north', 30, rankGap, 'indented').partition();
  } catch (e) {
    parts = null;
  }
  if (!parts || parts.groups.filter(g => g.kind === 'workflow').length === 0 || parts.groups.length < 2) {
    return false;
  }
  const P = (typeof mxPoint !== 'undefined') ? mxPoint : null;
  const absOf = (cell: any): { x: number; y: number } => {
    let x = 0, y = 0;
    for (let c = cell; c && c !== parent && c.vertex; c = c.parent) {
      const g = model.getGeometry(c);
      if (g && !g.relative) {
        x += g.x;
        y += g.y;
      }
    }
    return {x, y};
  };
  // Shown cells only: steps hidden inside a collapsed block keep stale
  // positions (e.g. a collapsed Fork's branches far to the right), which would
  // make a workflow look much wider than it is.
  const isShownCell = (c: any) => {
    if (!model.isVisible(c)) {
      return false;
    }
    for (let p = c.parent; p && p !== parent; p = p.parent) {
      if (p.collapsed || !model.isVisible(p)) {
        return false;
      }
    }
    return true;
  };
  const boundsOf = (cells: any[]) => {
    let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
    for (const c of cells) {
      const g = model.getGeometry(c);
      if (!g || !isShownCell(c)) {
        continue;
      }
      const a = absOf(c);
      x1 = Math.min(x1, a.x); y1 = Math.min(y1, a.y);
      x2 = Math.max(x2, a.x + g.width); y2 = Math.max(y2, a.y + g.height);
    }
    return {x1, y1, x2, y2};
  };
  const withDescendants = (cells: any[]) => {
    const set = new Set<any>();
    for (const c of cells) {
      set.add(c);
      for (const d of model.getDescendants(c)) {
        if (d && d.vertex) {
          set.add(d);
        }
      }
    }
    return set;
  };
  const moveBy = (cells: any[], dx: number, dy: number) => {
    const set = withDescendants(cells);
    for (const c of cells) {
      if (c.parent !== parent) {
        continue;   // nested cells move with their (top-level) ancestor
      }
      const g = model.getGeometry(c);
      if (g) {
        const ng = g.clone();
        ng.x += dx;
        ng.y += dy;
        model.setGeometry(c, ng);
      }
    }
    // Arrows inside the workflow whose points are stored on the top level move too.
    for (const e of cellsAll) {
      if (!e || !e.edge || e.parent !== parent || !set.has(e.source) || !set.has(e.target)) {
        continue;
      }
      const g = model.getGeometry(e);
      if (g && g.points && g.points.length > 0 && P) {
        const ng = g.clone();
        ng.points = g.points.map((p: any) => new P(p.x + dx, p.y + dy));
        model.setGeometry(e, ng);
      }
    }
  };

  model.beginUpdate();
  try {
    const workflows = parts.groups.filter(g => g.kind === 'workflow');
    // Boxes and lone starts can be model children of a block of the workflow
    // they relate to (createWorkflowNode inserts the box into the step's
    // parent): keep them out of that workflow's cells and measurements.
    const extras = new Set<any>();
    for (const g of parts.groups) {
      if (g.kind !== 'workflow') {
        g.cells.forEach(c => extras.add(c));
      }
    }
    const cellsOf = (cells: any[]) => {
      const set = withDescendants(cells);
      extras.forEach(c => set.delete(c));
      return set;
    };
    // Place a cell at an absolute position (its geometry is relative to its parent).
    const placeAt = (cell: any, x: number, y: number) => {
      const g = model.getGeometry(cell);
      if (!g) {
        return;
      }
      const o = cell.parent && cell.parent !== parent ? absOf(cell.parent) : {x: 0, y: 0};
      const ng = g.clone();
      ng.x = x - o.x;
      ng.y = y - o.y;
      model.setGeometry(cell, ng);
    };
    type Placed = { cells: any[]; set: Set<any>; b: { x1: number; y1: number; x2: number; y2: number }; side: boolean };
    const placed: Placed[] = [];
    const partOf = (cell: any) => placed.findIndex(p => p.set.has(cell));
    const layoutOne = (wf: { cells: any[] }) => {
      const set = cellsOf(wf.cells);
      const layout = makeLayout();
      const baseIgnored = layout.isVertexIgnored.bind(layout);
      layout.isVertexIgnored = (v: any) => !set.has(v) || baseIgnored(v);
      // mxHierarchicalLayout collects its cells with filterDescendants, which
      // does not consult isVertexIgnored: restrict that too, or the other
      // workflows' cells would be laid out as separate one-cell graphs.
      const baseFilter = layout.filterDescendants.bind(layout);
      layout.filterDescendants = function (cell: any, result: any) {
        baseFilter(cell, result);
        for (const id of Object.keys(result)) {
          if (!set.has(result[id])) {
            delete result[id];
          }
        }
      };
      // Within the workflow, only its structure: a connection like a step back
      // up to its workflow node would form a loop and could turn the workflow
      // upside down. Arrows attached to a collapsed block (one model end hidden)
      // stay: they tell the layout that the block's end follows its start.
      const baseEdges = layout.getEdges.bind(layout);
      layout.getEdges = function (cell: any) {
        return (baseEdges(cell) || []).filter((e: any) => {
          const a = this.getVisibleTerminal(e, true);
          const b = this.getVisibleTerminal(e, false);
          if (!a || !b || !set.has(a) || !set.has(b)) {
            return false;
          }
          const reattached = a !== e.source || b !== e.target;
          return reattached || parts.structural.has(e);
        });
      };
      layout.execute(parent);
      return set;
    };
    // Flow axis (top-down: y, left-right: x) and cross axis (the other one).
    const H = horizontal;
    const F = (p: { x: number; y: number }) => H ? p.x : p.y;
    const X = (p: { x: number; y: number }) => H ? p.y : p.x;
    const fLen = (g: any) => H ? g.width : g.height;
    const xLen = (g: any) => H ? g.height : g.width;
    const bF1 = (b: any) => H ? b.x1 : b.y1;
    const bX1 = (b: any) => H ? b.y1 : b.x1;
    const bX2 = (b: any) => H ? b.y2 : b.x2;
    const bF2 = (b: any) => H ? b.x2 : b.y2;
    const xy = (f: number, c: number) => H ? {x: f, y: c} : {x: c, y: f};
    // Flow position (centre) of the step a part connects to in an already placed part.
    const linkedFlow = (set: Set<any>): number | null => {
      for (const e of cellsAll) {
        if (!e || !e.edge) {
          continue;
        }
        const a = graph.getView().getVisibleTerminal(e, true);
        const b = graph.getView().getVisibleTerminal(e, false);
        const inside = a && set.has(a) ? b : (b && set.has(b) ? a : null);
        if (inside && partOf(inside) >= 0) {
          const g = model.getGeometry(inside);
          return g ? F(absOf(inside)) + fLen(g) / 2 : null;
        }
      }
      return null;
    };

    // 1. the main workflow (created first) at the top left
    const mainSet = layoutOne(workflows[0]);
    {
      const b = boundsOf(Array.from(mainSet));
      moveBy(workflows[0].cells, 40 - b.x1, 40 - b.y1);
      placed.push({cells: workflows[0].cells, set: mainSet, b: boundsOf(Array.from(mainSet)), side: false});
    }
    // 2. dependent workflows beside it across the flow (top-down: to the right;
    //    left-right: below), level with the step they connect to along the flow,
    //    stacking along the flow in that lane when they would overlap
    const sideCross = bX2(placed[0].b) + 80;
    let sideEnd = -Infinity;
    for (const wf of workflows.slice(1)) {
      const set = layoutOne(wf);
      const b = boundsOf(Array.from(set));
      const want = linkedFlow(set);
      const f = Math.max(want !== null ? want - 20 : 40, sideEnd + 60, 40);
      const target = xy(f, sideCross);
      moveBy(wf.cells, target.x - b.x1, target.y - b.y1);
      const nb = boundsOf(Array.from(set));
      placed.push({cells: wf.cells, set, b: nb, side: true});
      sideEnd = bF2(nb);
    }
    let crossEnd = Math.max(...placed.map(p => bX2(p.b)));
    const idNum = (c: any) => Number(c.id);
    // 3. lone start circles: before (above / left of) the workflow created right after them
    for (const g of parts.groups.filter(x => x.kind === 'start')) {
      const start = g.cells[0];
      const target = placed.map(p => ({p, head: p.cells.slice().sort((a, b) => idNum(a) - idNum(b))[0]}))
        .filter(o => o.head && idNum(o.head) > idNum(start))
        .sort((a, b) => idNum(a.head) - idNum(b.head))[0];
      const sg = model.getGeometry(start);
      if (!target || !sg) {
        continue;
      }
      const first = Array.from(target.p.set).filter((c: any) => isShownCell(c))
        .sort((a: any, b: any) => F(absOf(a)) - F(absOf(b)))[0];
      const tg = first ? model.getGeometry(first) : null;
      if (!tg) {
        continue;
      }
      const p = xy(bF1(target.p.b) - rankGap - fLen(sg), X(absOf(first)) + xLen(tg) / 2 - xLen(sg) / 2);
      placeAt(start, p.x, p.y);
      target.p.set.add(start);
    }
    // 4. dependent-workflow boxes: a lane beyond everything across the flow, level with their step
    const lane = crossEnd + 60;
    let laneEnd = -Infinity;
    const boxes = parts.groups.filter(x => x.kind === 'box').map(g => g.cells[0]).map((box: any) => {
      const link = (box.edges || []).map((e: any) => e.source === box ? e.target : e.source).find((o: any) => partOf(o) >= 0);
      const lg = link ? model.getGeometry(link) : null;
      const bg = model.getGeometry(box);
      return {box, f: lg && bg ? F(absOf(link)) + fLen(lg) / 2 - fLen(bg) / 2 : 40};
    }).sort((a, b) => a.f - b.f);
    let boxEnd = crossEnd;
    for (const o of boxes) {
      const bg = model.getGeometry(o.box);
      if (!bg) {
        continue;
      }
      const f = Math.max(o.f, laneEnd + 10);
      const p = xy(f, lane);
      placeAt(o.box, p.x, p.y);
      laneEnd = f + fLen(bg);
      boxEnd = Math.max(boxEnd, lane + xLen(bg));
      const b = {x1: p.x, y1: p.y, x2: p.x + bg.width, y2: p.y + bg.height};
      placed.push({cells: [o.box], set: new Set([o.box]), b, side: true});
    }
    crossEnd = Math.max(crossEnd, boxEnd);
    // Collapsed Segment start points back to their final size and place before
    // routing, so connections start at the right spot (see reserveCollapsedSegmentBoxes).
    if (beforeRouting) {
      beforeRouting();
    }
    // 5. cross connections. Main <-> something beside it: straight across the
    //    gap in front of it (a small step there if the levels differ). Within
    //    one workflow: out to its side and back. Others: along a lane beyond
    //    everything, each on its own track.
    const visibleEnd = (e: any, source: boolean) => {
      const c = graph.getView().getVisibleTerminal(e, source);
      return c && placed.some(p => p.set.has(c)) ? c : null;
    };
    const routed: any[] = [];
    let k = 0;
    for (const e of cellsAll) {
      if (!e || !e.edge || parts.structural.has(e)) {
        continue;
      }
      const vs = visibleEnd(e, true);
      const vt = visibleEnd(e, false);
      if (!vs || !vt || vs === vt) {
        continue;
      }
      const ps = partOf(vs), pt = partOf(vt);
      if (ps === pt && (vs !== e.source || vt !== e.target)) {
        continue;   // attached to a collapsed block: as mxGraph draws it
      }
      const sa = absOf(vs), ta = absOf(vt);
      const sg = model.getGeometry(vs), tg = model.getGeometry(vt);
      const g = model.getGeometry(e);
      if (!sg || !tg || !g || !P) {
        continue;
      }
      const o = e.parent && e.parent !== parent ? absOf(e.parent) : {x: 0, y: 0};
      let c: number;
      const mainAndSide = ps !== pt && ((ps === 0 && placed[pt].side) || (pt === 0 && placed[ps].side));
      if (ps === pt) {
        c = bX2(placed[ps].b) + 20;
      } else if (mainAndSide) {
        c = bX1(placed[ps === 0 ? pt : ps].b) - 30;
      } else {
        c = crossEnd + 30 + (k++) * 8;
      }
      const p1 = xy(F(sa) + fLen(sg) / 2, c);
      const p2 = xy(F(ta) + fLen(tg) / 2, c);
      const ng = g.clone();
      ng.points = [new P(p1.x - o.x, p1.y - o.y), new P(p2.x - o.x, p2.y - o.y)];
      ng.offset = null;
      model.setGeometry(e, ng);
      routed.push(e);
    }
    if (routed.length > 0 && typeof graph.setCellStyles === 'function') {
      graph.setCellStyles('noEdgeStyle', '1', routed);
      graph.setCellStyles('orthogonal', '1', routed);
    }
  } finally {
    model.endUpdate();
  }
  return true;
}

export function applyBlockShiftPass(graph: any, orientation: string, branchGap: number, rankGap: number,
                                    layoutPreference?: any): boolean {
  if (!graph) {
    return false;
  }
  const model = graph.getModel();
  model.__blockLayoutMode = 'hierarchical';
  // Direction the flow runs in; the renderer reads it from the (shared) model.
  const direction = flowDirection(layoutPreference, orientation);
  model.__blockLayoutDir = direction;
  if (!BLOCK_SHIFT_PASS_ENABLED) {
    return false;
  }
  const mode = resolveWorkflowLayout(layoutPreference);
  if (mode === 'classic') {
    return false;   // old layout: mxGraph's hierarchical layout only
  }
  try {
    const applied = new ShiftPass(graph, direction === 'horizontal' ? 'west' : 'north', branchGap, rankGap, mode).run();
    if (applied) {
      model.__blockLayoutMode = mode;
    }
    debug(applied ? 'applied ' + mode + ' layout' : 'not needed (no overlap)');
    return applied;
  } catch (e) {
    if (e instanceof StructureError) {
      debug('skipped, keeping hierarchical layout:', e.message);
    } else {
      console.error('Block shift pass failed; keeping hierarchical layout', e);
    }
    return false;
  }
}

class ShiftPass {
  private readonly model: any;
  private readonly root: any;
  private readonly horizontal: boolean;
  private readonly gap: number;
  private readonly rankGap: number;
  private readonly absCache = new Map<string, { x: number; y: number }>();
  private shown: any[] = [];
  private shownSet = new Set<any>();
  private closerByTarget = new Map<string, any>();
  private visited = new Set<any>();
  /**
   * Arrows that are part of the block structure. Everything else between
   * placed cells is a cross connection (another workflow in the order view's
   * dependency display, a dependent-workflow box, ...): drawn, not laid out.
   */
  private structural = new Set<any>();
  /** Which laid-out part each cell belongs to (index of its workflow, -1 = box lane). */
  private partOf = new Map<any, number>();
  /**
   * Top-down with several workflows: they are stacked one below the other
   * instead of side by side, because the graph views scroll vertically only.
   */
  private stacked = false;
  /** Right edge of the laid-out workflows and the next free connection lane (stacked mode). */
  private stackRight = 0;
  private laneCount = 0;

  constructor(private graph: any, orientation: string, branchGap: number, rankGap: number,
              private readonly mode: WorkflowLayoutMode = 'structured') {
    this.model = graph.getModel();
    this.root = graph.getDefaultParent();
    this.horizontal = orientation === 'east' || orientation === 'west';
    const minGap = BLOCK_SCOPE_METRICS.padding + 8;
    this.gap = isFinite(branchGap) && branchGap > minGap ? branchGap : minGap;
    this.rankGap = isFinite(rankGap) && rankGap > 0 ? rankGap : BLOCK_SCOPE_METRICS.minRankSpacing;
  }

  run(): boolean {
    this.collectShown();
    if (this.shown.length === 0) {
      return false;
    }
    for (const c of this.shown) {
      if (CLOSERS.has(tagOf(c))) {
        const tid = attr(c, 'targetId');
        if (tid) {
          this.closerByTarget.set(tid + '|' + tagOf(c), c);
        }
      }
    }
    if (BLOCK_SHIFT_MODE === 'onOverlap' && !this.hasOverlap()) {
      return false; // hierarchical layout is already fine: leave it untouched
    }

    // Start points, in creation order (the main workflow comes first).
    const byId = (a: any, b: any) => {
      const na = Number(a.id), nb = Number(b.id);
      return isFinite(na) && isFinite(nb) ? na - nb : String(a.id).localeCompare(String(b.id));
    };
    const roots = this.shown.filter(c => this.predecessors(c).length === 0 && !CLOSERS.has(tagOf(c))).sort(byId);
    if (roots.length === 0 || (this.mode !== 'indented' && roots.length !== 1)) {
      throw new StructureError('expected exactly one start cell, found ' + roots.length);
    }
    const chains: Chain[] = [];
    for (const r of roots) {
      if (!this.visited.has(r)) {
        chains.push(this.parseChain(r, null, 0, 0));
      }
    }
    // Indented layout: parts reached only through cross connections (a
    // dependent workflow whose start was replaced by its add-order connection,
    // a Post-notices box, ...) become further start points.
    if (this.mode === 'indented') {
      for (let guard = 0; guard < 1000; guard++) {
        let next = this.shown.filter(c => !this.visited.has(c) && !CLOSERS.has(tagOf(c))
          && this.predecessors(c).every(p => this.visited.has(p))).sort(byId)[0];
        if (!next) {
          // A part with no clear beginning: its only way in is a connection
          // back from its own steps (e.g. a dependent workflow's job back up to
          // its workflow node, when the start circle has no arrow). Begin at
          // its first-created cell: createWorkflow makes the workflow node
          // before the steps. The loop-back becomes a cross connection.
          next = this.shown.filter(c => !this.visited.has(c) && !CLOSERS.has(tagOf(c))).sort(byId)[0];
        }
        if (!next) {
          break;
        }
        chains.push(this.parseChain(next, null, 0, 0));
      }
    }
    for (const c of this.shown) {
      if (!this.visited.has(c)) {
        throw new StructureError('cell not reachable in block structure: ' + tagOf(c) + ' #' + c.id);
      }
    }

    if (this.mode === 'indented') {
      this.applyIndented(this.placeIndented(chains));
      return true;
    }
    const chain = chains[0];

    // Lay out around 0, then shift so the left/top edge stays where it was.
    const target = new Map<any, number>();
    this.placeChain(chain, 0, target);
    let newMin = Infinity;
    let oldMin = Infinity;
    target.forEach((pos, cell) => {
      newMin = Math.min(newMin, pos);
      oldMin = Math.min(oldMin, this.cross(this.abs(cell)));
    });
    const delta = oldMin - newMin;
    this.apply(target, delta);
    return true;
  }

  // ------------------------------------------------------------- visibility

  private collectShown(): void {
    const all = Object.keys(this.model.cells || {}).map(k => this.model.cells[k]);
    // Order annotations (order view: 'Order' boxes and their 'Count' badges)
    // hang off steps; they are not part of the workflow structure.
    this.shown = all.filter(c => c && c.vertex && c !== this.root && c.value && tagOf(c)
      && tagOf(c) !== 'SegmentContainer' && tagOf(c) !== 'Order' && tagOf(c) !== 'Count' && this.isShown(c));
    this.shownSet = new Set(this.shown);
  }

  private isShown(cell: any): boolean {
    if (!this.model.isVisible(cell)) {
      return false;
    }
    for (let p = cell.parent; p && p !== this.root; p = p.parent) {
      if (p.collapsed || !this.model.isVisible(p)) {
        return false;
      }
    }
    return true;
  }

  /**
   * The structural next step of a (non-block) cell: its FIRST outgoing arrow.
   * createWorkflow connects a step to its next step before anything else;
   * connections to other workflows (notices, added orders) come later.
   */
  private firstOut(cell: any): { edge: any; target: any } | null {
    for (const e of (cell?.edges || [])) {
      if (e && e.source === cell && e.target && this.shownSet.has(e.target)) {
        return {edge: e, target: e.target};
      }
    }
    return null;
  }

  private successors(cell: any): any[] {
    return (cell?.edges || [])
      .filter((e: any) => e && e.source === cell && e.target && this.shownSet.has(e.target))
      .map((e: any) => e.target);
  }

  private predecessors(cell: any): any[] {
    return (cell?.edges || [])
      .filter((e: any) => e && e.target === cell && e.source && this.shownSet.has(e.source))
      .map((e: any) => e.source);
  }

  // -------------------------------------------------------------- geometry

  private abs(cell: any): { x: number; y: number } {
    const key = String(cell.id);
    const hit = this.absCache.get(key);
    if (hit) {
      return hit;
    }
    const g = this.model.getGeometry(cell);
    let x = g ? g.x : 0;
    let y = g ? g.y : 0;
    const p = cell.parent;
    if (p && p !== this.root && p.vertex) {
      const pa = this.abs(p);
      x += pa.x;
      y += pa.y;
    }
    const r = {x, y};
    this.absCache.set(key, r);
    return r;
  }

  private cross(p: { x: number; y: number }): number {
    return this.horizontal ? p.y : p.x;
  }

  private crossSize(cell: any): number {
    const g = this.model.getGeometry(cell);
    return g ? (this.horizontal ? g.height : g.width) : 0;
  }

  private flowSize(cell: any): number {
    const g = this.model.getGeometry(cell);
    return g ? (this.horizontal ? g.width : g.height) : 0;
  }

  // ------------------------------------------------------- overlap detection

  /**
   * True if some scope's padded box (members' extent) would cover a cell that
   * is not part of that scope: the situation the renderer cannot draw cleanly.
   */
  private hasOverlap(): boolean {
    const pad = BLOCK_SCOPE_METRICS.padding;
    for (const opener of this.shown) {
      const tag = tagOf(opener);
      if (!DEFAULT_BLOCK_SCOPE_TAGS.includes(tag) && tag !== 'Segment') {
        continue;
      }
      const closer = this.findCloser(opener);
      if (!closer) {
        continue;
      }
      const members = this.members(opener, closer);
      members.add(opener);
      members.add(closer);
      let cMin = Infinity, cMax = -Infinity, fMin = Infinity, fMax = -Infinity;
      members.forEach(m => {
        const a = this.abs(m);
        const c = this.cross(a);
        const f = this.horizontal ? a.x : a.y;
        cMin = Math.min(cMin, c);
        cMax = Math.max(cMax, c + this.crossSize(m));
        fMin = Math.min(fMin, f);
        fMax = Math.max(fMax, f + this.flowSize(m));
      });
      cMin -= pad;
      cMax += pad;
      for (const other of this.shown) {
        if (members.has(other)) {
          continue;
        }
        const a = this.abs(other);
        const c = this.cross(a);
        const f = this.horizontal ? a.x : a.y;
        if (c < cMax && c + this.crossSize(other) > cMin && f < fMax && f + this.flowSize(other) > fMin) {
          return true;
        }
      }
    }
    return false;
  }

  /** Model descendants plus everything reachable between opener and closer. */
  private members(opener: any, closer: any): Set<any> {
    const set = new Set<any>();
    for (const d of (this.model.getDescendants(opener) || [])) {
      if (d !== opener && d.vertex && this.shownSet.has(d)) {
        set.add(d);
      }
    }
    const seen = new Set<any>([opener, closer]);
    const queue = this.successors(opener);
    let guard = 0;
    while (queue.length > 0 && guard++ < 20000) {
      const c = queue.shift();
      if (seen.has(c)) {
        continue;
      }
      seen.add(c);
      set.add(c);
      queue.push(...this.successors(c));
    }
    set.delete(closer);
    return set;
  }

  private findCloser(opener: any): any {
    const closeTag = PAIRS[tagOf(opener)];
    if (!closeTag) {
      return null;
    }
    const hit = this.closerByTarget.get(opener.id + '|' + closeTag);
    if (hit) {
      return hit;
    }
    // Depth-aware forward search (nested openers of the same type).
    const openTag = tagOf(opener);
    const stack = this.successors(opener).map(c => ({cell: c, depth: 0}));
    const seen = new Set<any>([opener]);
    let guard = 0;
    while (stack.length > 0 && guard++ < 20000) {
      const {cell, depth} = stack.pop();
      if (seen.has(cell)) {
        continue;
      }
      seen.add(cell);
      let next = depth;
      if (tagOf(cell) === closeTag) {
        if (depth === 0) {
          return cell;
        }
        next = depth - 1;
      } else if (tagOf(cell) === openTag) {
        next = depth + 1;
      }
      for (const s of this.successors(cell)) {
        stack.push({cell: s, depth: next});
      }
    }
    return null;
  }

  // ----------------------------------------------------------- structure

  private parseChain(start: any, stop: any, scopeDepth: number, segmentDepth: number): Chain {
    const chain: Chain = {items: [], w: 0};
    let cur = start;
    let guard = 0;
    while (cur && cur !== stop && guard++ < 20000) {
      if (this.visited.has(cur)) {
        throw new StructureError('cell reached twice: ' + tagOf(cur) + ' #' + cur.id);
      }
      this.visited.add(cur);
      const tag = tagOf(cur);

      if (PAIRS[tag]) {
        const closer = this.findCloser(cur);
        if (!closer) {
          throw new StructureError('no closer for ' + tag + ' #' + cur.id);
        }
        const isSegment = tag === 'Segment';
        const scoped = DEFAULT_BLOCK_SCOPE_TAGS.includes(tag);
        const innerSeg = isSegment ? segmentDepth + 1 : segmentDepth;
        const branches: Chain[] = [];
        if (!cur.collapsed) {
          // Indented layout: branches in workflow order (the order their arrows
          // were created: branch1, branch2, ..., then / else), so a newly dropped
          // branch appears last right away, exactly as after a full redraw.
          // Positions must not decide: a dropped step is created near the canvas
          // origin and would sort first.
          // Structured layout: keep the order the hierarchical layout chose
          // (fewest crossings).
          const heads = this.successors(cur);
          for (const e of (cur.edges || [])) {
            if (e && e.source === cur && e.target && this.shownSet.has(e.target)) {
              this.structural.add(e);
            }
          }
          if (this.mode !== 'indented') {
            heads.sort((a, b) => this.cross(this.abs(a)) - this.cross(this.abs(b)));
          }
          for (const h of heads) {
            branches.push(h === closer
              ? {items: [], w: EMPTY_BRANCH_WIDTH}
              : this.parseChain(h, closer, scoped ? scopeDepth + 1 : scopeDepth, innerSeg));
          }
        } else {
          // Collapsed: a direct arrow from the opener to its own closer (an
          // empty Segment / block is connected that way) is still the block's
          // structure; drawn straight, not routed out to the side.
          for (const e of (cur.edges || [])) {
            if (e && e.source === cur && e.target === closer) {
              this.structural.add(e);
            }
          }
        }
        this.visited.add(closer);
        const pad = scoped ? BLOCK_SCOPE_METRICS.padding
          : isSegment ? SEGMENT_BASE_PADDING + segmentDepth * SEGMENT_DEPTH_PADDING : 0;
        const branchesW = branches.reduce((s, b) => s + b.w, 0) + Math.max(0, branches.length - 1) * this.gap;
        let inner = Math.max(this.crossSize(cur), this.crossSize(closer), branchesW);
        if (scoped) {
          // The label sits beside the opener's centre line; reserve room for it
          // on both sides so it can never push the box into a neighbour.
          inner = Math.max(inner, 2 * (this.labelWidth(cur) + BLOCK_SCOPE_METRICS.labelGap * 2 + BLOCK_SCOPE_METRICS.rail));
        }
        const block: BlockItem = {kind: 'block', opener: cur, closer, branches, pad, w: inner + 2 * pad};
        chain.items.push(block);
        chain.w = Math.max(chain.w, block.w);

        const after = this.firstOut(closer);
        // An arrow into a step another start already reached is a cross
        // connection (e.g. a dependent-workflow box into a notice step).
        if (after && !this.visited.has(after.target)) {
          this.structural.add(after.edge);
          cur = after.target;
        } else {
          cur = null;
        }
        continue;
      }

      const w = this.crossSize(cur);
      chain.items.push({kind: 'cell', cell: cur, w});
      chain.w = Math.max(chain.w, w);
      const next = this.firstOut(cur);
      if (next && !this.visited.has(next.target)) {
        this.structural.add(next.edge);
        cur = next.target;
      } else {
        cur = null;   // end, or a cross connection into a step already placed
      }
    }
    return chain;
  }

  /** Same estimate the renderer uses when it places the label. */
  private labelWidth(opener: any): number {
    const cfg = BLOCK_SCOPE_CONFIG[tagOf(opener)];
    if (!cfg) {
      return 0;
    }
    const text = (cfg.label(opener) || '').replace(/\s+/g, ' ').trim();
    return Math.min(text.length, BLOCK_SCOPE_METRICS.labelMaxChars) * BLOCK_SCOPE_METRICS.labelCharWidth;
  }

  // ------------------------------------------------- indented placement
  //
  // Written in flow/cross terms so one implementation serves both directions:
  //   vertical   (top-down)  : flow = y, cross = x (indent to the right)
  //   horizontal (left-right): flow = x, cross = y (indent downwards)
  // pos: cell -> {c: cross leading edge, f: flow leading edge, s: spine (cross)}

  private placeIndented(chains: Chain[]): Map<any, { c: number; f: number; s: number }> {
    const pos = new Map<any, { c: number; f: number; s: number }>();
    // A chain that is just one dependent-workflow box (order view: a 'Workflow'
    // node connected to a notice / add-order step) is placed in a lane beside
    // the workflow, level with the step it connects to. Other chains (whole
    // workflows in the dependency view) sit side by side, the main one first.
    const isBox = (ch: Chain) => ch.items.length === 1 && ch.items[0].kind === 'cell'
      && tagOf((ch.items[0] as CellItem).cell) === 'Workflow';
    const boxes = chains.filter(ch => chains.length > 1 && isBox(ch));
    // A start circle left on its own (its next step was already reached, or it
    // has no arrow) belongs above a workflow, not in a column of its own.
    const isLoneStart = (ch: Chain) => chains.length > 1 && ch.items.length === 1 && ch.items[0].kind === 'cell'
      && tagOf((ch.items[0] as CellItem).cell) === 'Process';
    const loneStarts = chains.filter(isLoneStart);
    let c = 0;
    let right = 0;
    let f = 0;
    const parts = chains.filter(ch => !boxes.includes(ch) && !loneStarts.includes(ch));
    this.stacked = !this.horizontal && parts.length > 1;
    chains.forEach((ch, idx) => {
      if (boxes.includes(ch) || loneStarts.includes(ch)) {
        return;
      }
      const before = new Set(pos.keys());
      const r = this.layoutChainIndented(ch, this.stacked ? 0 : c, this.stacked ? f : 0, pos);
      pos.forEach((_, cell) => {
        if (!before.has(cell)) {
          this.partOf.set(cell, idx);
        }
      });
      right = Math.max(right, (this.stacked ? 0 : c) + r.width);
      if (this.stacked) {
        f = r.bottom + STACK_GAP;
      } else {
        c = right + CHAIN_GAP;
      }
    });
    this.stackRight = right;
    // Lone starts: above the cell their arrow points to or, without an arrow,
    // above the workflow created right after them (createWorkflow makes the
    // start first, then its workflow), on that cell's spine.
    const idNum = (c: any) => Number(c.id);
    // Only the first step of a workflow has free room above it.
    const headSet = new Set<any>(chains.filter(c2 => !loneStarts.includes(c2) && !boxes.includes(c2) && c2.items.length > 0)
      .map(c2 => c2.items[0].kind === 'cell' ? (c2.items[0] as CellItem).cell : (c2.items[0] as BlockItem).opener));
    for (const ch of loneStarts) {
      const start = (ch.items[0] as CellItem).cell;
      let target: any = null;
      let link: any = null;
      for (const e of (start.edges || [])) {
        if (e && e.source === start && e.target && pos.has(e.target) && headSet.has(e.target)) {
          target = e.target;
          link = e;
          break;
        }
      }
      if (!target) {
        const heads = Array.from(headSet)
          .filter(h => pos.has(h) && idNum(h) > idNum(start))
          .sort((a, b) => idNum(a) - idNum(b));
        target = heads[0] || null;
      }
      if (!target) {
        continue;   // nothing to attach to: stays a (tiny) column of its own below
      }
      const tp = pos.get(target);
      this.placeCell(start, tp.s - SPINE, tp.f - this.rankGap - this.flowSize(start), pos);
      this.partOf.set(start, this.partOf.get(target));
      if (link) {
        this.structural.add(link);   // drawn straight down like a normal next-step arrow
      }
    }
    for (const ch of loneStarts) {
      const start = (ch.items[0] as CellItem).cell;
      if (!pos.has(start)) {
        const r = this.layoutChainIndented(ch, c, 0, pos);
        right = Math.max(right, c + r.width);
        c = right + CHAIN_GAP;
      }
    }
    const lane = right + CHAIN_GAP;
    let laneEnd = -Infinity;
    const placed = boxes.map(ch => {
      const box = (ch.items[0] as CellItem).cell;
      const link = (box.edges || []).map((e: any) => e.source === box ? e.target : e.source).find((o: any) => pos.has(o));
      const lp = link ? pos.get(link) : null;
      const f = lp ? lp.f + this.flowSize(link) / 2 - this.flowSize(box) / 2 : 0;
      return {box, f};
    }).sort((a, b) => a.f - b.f);
    for (const p of placed) {
      const f = Math.max(p.f, laneEnd + 10);
      this.placeCell(p.box, lane, f, pos);
      this.partOf.set(p.box, -1);
      laneEnd = f + this.flowSize(p.box);
    }
    // Keep the flow where the hierarchical layout put its top-left corner.
    let nc = Infinity, nf = Infinity, oc = Infinity, of = Infinity;
    pos.forEach((p, cell) => {
      nc = Math.min(nc, p.c);
      nf = Math.min(nf, p.f);
      const a = this.abs(cell);
      oc = Math.min(oc, this.horizontal ? a.y : a.x);
      of = Math.min(of, this.horizontal ? a.x : a.y);
    });
    // At least INDENT_ORIGIN from the canvas corner: block guides, hover boxes
    // and labels reach a little outside the steps, and starting inside the
    // canvas spares the renderer a view shift (a full mxGraph re-render) on the
    // first draw of a large workflow.
    const dc = Math.max(oc, INDENT_ORIGIN) - nc;
    const df = Math.max(of, INDENT_ORIGIN) - nf;
    pos.forEach(p => {
      p.c += dc;
      p.f += df;
      p.s += dc;
    });
    return pos;
  }

  /** Narrow cells centre on the spine; wide ones start at the column edge. */
  private placeCell(cell: any, c0: number, f: number, pos: Map<any, { c: number; f: number; s: number }>): void {
    const w = this.crossSize(cell);
    const s = c0 + SPINE;
    pos.set(cell, {c: w < 2 * SPINE ? s - w / 2 : c0, f, s});
  }

  private extent(cell: any): number {
    return Math.max(this.crossSize(cell), 2 * SPINE);
  }

  /** Returns the flow end of the last item and the chain's cross extent from c0. */
  private layoutChainIndented(chain: Chain, c0: number, f: number,
                              pos: Map<any, { c: number; f: number; s: number }>): { bottom: number; width: number } {
    let cf = f;
    let bottom = f;
    let width = 0;
    chain.items.forEach((item, i) => {
      if (item.kind === 'cell') {
        this.placeCell(item.cell, c0, cf, pos);
        bottom = cf + this.flowSize(item.cell);
        width = Math.max(width, this.extent(item.cell));
      } else {
        const r = this.layoutBlockIndented(item, c0, cf, pos);
        bottom = r.bottom;
        width = Math.max(width, r.width);
      }
      cf = bottom + this.gapAfter(item, chain.items[i + 1]);
    });
    return {bottom, width};
  }

  private layoutBlockIndented(b: BlockItem, c0: number, f: number,
                              pos: Map<any, { c: number; f: number; s: number }>): { bottom: number; width: number } {
    const tag = tagOf(b.opener);
    if (this.horizontal && tag === 'Segment' && b.opener.collapsed) {
      // A collapsed Segment's frame is centred on its start point and as wide
      // as its header (drawSegmentContainers). Top-down that width runs across
      // the flow; left-right it runs along it, so reserve it here: start point
      // in the middle of the frame, end point at its right edge.
      const half = segmentHeaderWidth(b.opener) / 2;
      this.placeCell(b.opener, c0, f + half, pos);
      const closerF = f + 2 * half;
      this.placeCell(b.closer, c0, closerF, pos);
      return {bottom: closerF + this.flowSize(b.closer), width: Math.max(this.extent(b.opener), this.extent(b.closer))};
    }
    if (!this.horizontal && tag === 'Segment' && b.opener.collapsed) {
      // Top-down the collapsed box runs across the flow, from just left of the
      // start point to the right (COLLAPSED_SEGMENT_LEAD). Reserve that width so
      // collapsed Segments in parallel branches never overlap.
      this.placeCell(b.opener, c0, f, pos);
      const closerF = f + this.flowSize(b.opener) + this.rankGap;
      this.placeCell(b.closer, c0, closerF, pos);
      const boxRight = SPINE - COLLAPSED_SEGMENT_LEAD + segmentHeaderWidth(b.opener);
      return {bottom: closerF + this.flowSize(b.closer), width: Math.max(this.extent(b.opener), boxRight)};
    }
    this.placeCell(b.opener, c0, f, pos);
    const openerEnd = f + this.flowSize(b.opener);
    // Top-down: the label sits to the right of the opener (cross axis), so
    // reserve room for it. Left-right: it sits above the opener, in the gap
    // the parent's indent leaves, and needs no cross-axis room.
    const labelled = DEFAULT_BLOCK_SCOPE_TAGS.includes(tag) || tag === 'When' || tag === 'ElseWhen';
    const labelExt = labelled && !this.horizontal
      ? 2 * SPINE + BLOCK_SCOPE_METRICS.labelGap + this.labelWidth(b.opener)
        + (b.opener.collapsed ? 10 : 0) * BLOCK_SCOPE_METRICS.labelCharWidth
      : 0;
    let width = Math.max(this.extent(b.opener), labelExt);
    const colC = c0 + INDENT;
    let last = openerEnd;

    const nonEmpty = b.branches.filter(br => br.items.length > 0);
    if (tag === 'Try' && nonEmpty.length === 1 && this.catchIndex(nonEmpty[0]) >= 0) {
      // Try: body indented, Catch back at the Try's level, catch contents
      // indented again, EndTry at the Try's level (like "} catch {").
      const chain = nonEmpty[0];
      const ci = this.catchIndex(chain);
      const body: Chain = {items: chain.items.slice(0, ci), w: 0};
      const rest: Chain = {items: chain.items.slice(ci + 1), w: 0};
      const catchItem = chain.items[ci] as CellItem;
      let cf = openerEnd + this.rankGap;
      if (body.items.length > 0) {
        const r = this.layoutChainIndented(body, colC, cf, pos);
        width = Math.max(width, INDENT + r.width);
        cf = r.bottom + this.rankGap;
      }
      this.placeCell(catchItem.cell, c0, cf, pos);
      width = Math.max(width, this.extent(catchItem.cell));
      last = cf + this.flowSize(catchItem.cell);
      if (rest.items.length > 0) {
        const r = this.layoutChainIndented(rest, colC, last + this.rankGap, pos);
        width = Math.max(width, INDENT + r.width);
        last = r.bottom;
      }
    } else if (nonEmpty.length > 0) {
      // Branches side by side (columns top-down, rows left-right), each
      // indented from the opener.
      const start = openerEnd + this.rankGap;
      let c = colC;
      let maxEnd = start;
      for (const br of nonEmpty) {
        const r = this.layoutChainIndented(br, c, start, pos);
        maxEnd = Math.max(maxEnd, r.bottom);
        c += r.width + INDENT_BRANCH_GAP;
      }
      width = Math.max(width, (c - INDENT_BRANCH_GAP) - c0);
      last = maxEnd;
    }
    let closerF = last + this.rankGap;
    if (tag === 'Segment') {
      // The Segment frame reaches its padding past the content (plus a block's
      // hover box when the last step is a block): keep neighbours clear of it.
      width += segmentPadding(b.opener);
      if (this.horizontal) {
        // Left-right the frame ends before the end point: put the end point past
        // the frame, so the arrow into it does not run along the border.
        closerF += segmentPadding(b.opener) + BLOCK_SCOPE_METRICS.padding;
      }
    }
    this.placeCell(b.closer, c0, closerF, pos);
    width = Math.max(width, this.extent(b.closer));
    return {bottom: closerF + this.flowSize(b.closer), width};
  }

  /**
   * Gap before the next step in a chain. Left-right, the arrow between two
   * steps in a row is horizontal, so its label ("job-1-1-1") has to fit into
   * the gap along the flow; widen the gap when it does not. (Top-down the label
   * sits across a vertical arrow and the normal gap is enough.)
   */
  private gapAfter(item: CellItem | BlockItem, next: CellItem | BlockItem | undefined): number {
    if (!this.horizontal || !next) {
      return this.rankGap;
    }
    const from = item.kind === 'cell' ? item.cell : item.closer;
    const to = next.kind === 'cell' ? next.cell : next.opener;
    const edge = (from.edges || []).find((e: any) => e && e.source === from && e.target === to);
    const w = edge ? this.edgeLabelWidth(edge) : 0;
    return w > 0 ? Math.max(this.rankGap, w + 16) : this.rankGap;
  }

  private catchIndex(chain: Chain): number {
    return chain.items.findIndex(it => it.kind === 'cell' && tagOf(it.cell) === 'Catch');
  }

  /**
   * Arrows in the indented style (described top-down; left-right is the same
   * turned 90 degrees):
   *  - same spine: straight (with one point on the spine when a wide step's
   *    centre is off the spine, so the arrow does not jog);
   *  - into a deeper column from a single-branch opener (or a Catch): along the
   *    spine, then into the step's side;
   *  - into the columns of a multi-branch opener: a shared lane just before
   *    the branch heads, entering each head on its spine;
   *  - back to a shallower column: along its own column to a lane just before
   *    the target, then across and in on the target's spine.
   * Points are returned in canvas x/y.
   */
  private routeIndented(e: any, pos: Map<any, { c: number; f: number; s: number }>):
    { points: Array<{ x: number; y: number }> | null; labelX: number | null; offset?: { x: number; y: number } } {
    const src = e.source;
    const dst = e.target;
    const sp = src ? pos.get(src) : null;
    const tp = dst ? pos.get(dst) : null;
    if (!sp || !tp) {
      return {points: null, labelX: null};
    }
    const sEnd = sp.f + this.flowSize(src);       // source edge facing the target
    const tLead = tp.f;                            // target edge facing the source
    const tMid = tp.f + this.flowSize(dst) / 2;
    const step = this.rankGap / 2;
    const xy = (f: number, c: number) => this.horizontal ? {x: f, y: c} : {x: c, y: f};
    const segExtra = this.segmentEntryExtra(dst);
    if (Math.abs(sp.s - tp.s) < 0.5 && segExtra > 0 && this.horizontal) {
      // Straight into a collapsed Segment (left-right): the label goes before the box.
      const w0 = this.edgeLabelWidth(e);
      const sCentre0 = sp.c + this.crossSize(src) / 2;
      const pts0 = Math.abs(sCentre0 - sp.s) > 0.5 ? [xy((sEnd + tLead) / 2, sp.s)] : null;
      return w0 > 0 ? {points: pts0, labelX: 1, offset: {x: -(w0 / 2 + 4 + segExtra), y: 0}} : {points: pts0, labelX: 0};
    }
    if (Math.abs(sp.s - tp.s) < 0.5) {
      const sCentre = sp.c + this.crossSize(src) / 2;
      const tCentre = tp.c + this.crossSize(dst) / 2;
      if (Math.abs(sCentre - sp.s) > 0.5 || Math.abs(tCentre - tp.s) > 0.5) {
        return {points: [xy((sEnd + tLead) / 2, sp.s)], labelX: 0};
      }
      return {points: null, labelX: 0};
    }
    let pts: Array<{ f: number; c: number }>;
    let end: { f: number; c: number };
    let labelOnFirst = false;
    if (tp.s > sp.s && this.horizontal && tagOf(src) === 'Segment') {
      // Left-right, the Segment's header sits on the flow line right after its
      // start point: go down first, then along into the first step.
      const anchorF = sp.f + this.flowSize(src) / 2;
      pts = [{f: anchorF, c: tp.s}];
      end = {f: tLead, c: tp.s};
    } else if (tp.s > sp.s) {
      const multi = !!PAIRS[tagOf(src)] && this.successors(src).length > 1;
      if (multi) {
        // One shared lane just after the opener (not relative to each head: a
        // collapsed Segment's start point sits further along, in its frame).
        const lane = sEnd + step;
        pts = [{f: lane, c: sp.s}, {f: lane, c: tp.s}];
        end = {f: tLead, c: tp.s};
      } else {
        pts = [{f: tMid, c: sp.s}];
        end = {f: tMid, c: tp.c};
      }
    } else {
      pts = [{f: tLead - step, c: sp.s}, {f: tLead - step, c: tp.s}];
      end = {f: tLead, c: tp.s};
      // Into a closer the label normally goes right after the source. Left-right
      // a Segment's frame ends just after its last step (its end point is
      // outside the frame), so there the label goes before the end point.
      labelOnFirst = CLOSERS.has(tagOf(dst)) && !(this.horizontal && tagOf(dst) === 'EndSegment');
    }
    // Label on a stretch only this arrow uses (see routeEdge for the reasoning).
    const path = [{f: sEnd, c: sp.s}, ...pts, end];
    const seg: number[] = [];
    for (let i = 0; i < path.length - 1; i++) {
      seg.push(Math.abs(path[i + 1].f - path[i].f) + Math.abs(path[i + 1].c - path[i].c));
    }
    const total = seg.reduce((a, b) => a + b, 0);
    const along = labelOnFirst ? Math.min(seg[0] / 2, 18) : total - seg[seg.length - 1] / 2;
    const labelX = total > 0 ? Math.max(-1, Math.min(1, (along / total) * 2 - 1)) : 0;
    const points = pts.map(p => xy(p.f, p.c));

    // The stretch the label sits on can be short and horizontal (left-right:
    // next to a step; top-down: the entry into a single branch's first step).
    // A label centred on it would overlap the step, so pin the label to the
    // step instead: ending just before the target, or starting just after the
    // source. Vertical stretches are fine: the label sits across them.
    const w = this.edgeLabelWidth(e);
    if (w > 0) {
      const canvas = path.map(p => xy(p.f, p.c));
      const i = labelOnFirst ? 0 : canvas.length - 2;
      const a = canvas[i];
      const b = canvas[i + 1];
      const horizontalStretch = Math.abs(a.y - b.y) < 0.5;
      const length = Math.abs(b.x - a.x);
      const extra = labelOnFirst ? 0 : segExtra;
      if (!horizontalStretch && extra > 0) {
        // Top-down into a Segment: the stretch ends at the start point just
        // inside the frame's top edge; keep the label above the frame.
        return {points, labelX: 1, offset: {x: 0, y: -(6 + 4 + extra)}};
      }
      if (horizontalStretch && length < w + 8 + extra) {
        return labelOnFirst
          ? {points, labelX: -1, offset: {x: w / 2 + 4, y: 0}}
          : {points, labelX: 1, offset: {x: -(w / 2 + 4 + extra), y: 0}};
      }
    }
    return {points, labelX};
  }

  /**
   * Left-right, an arrow into a Segment ends at its start point, which sits
   * inside the Segment's frame. Distance from there to the frame's leading
   * edge, so the arrow's label can end outside the frame.
   */
  private segmentEntryExtra(dst: any): number {
    if (tagOf(dst) !== 'Segment') {
      return 0;
    }
    // Left-right a collapsed frame is centred on the start point (half the
    // header width to its edge); otherwise the frame edge is the padding away.
    return this.horizontal && dst.collapsed ? segmentHeaderWidth(dst) / 2 : segmentPadding(dst) + 2;
  }

  /** Estimated width of an edge's label (same estimate the renderer uses). */
  private edgeLabelWidth(e: any): number {
    let text = '';
    try {
      text = typeof this.graph.getLabel === 'function' ? String(this.graph.getLabel(e) || '') : '';
    } catch (err) {
      text = '';
    }
    text = text.replace(/<[^>]*>/g, '').trim();
    return text.length * 6.2;
  }

  /** The cell mxGraph draws an arrow end at: the cell itself, or its collapsed (shown) ancestor. */
  private visibleEnd(cell: any): any {
    for (let c = cell; c && c !== this.root; c = c.parent) {
      if (this.shownSet.has(c)) {
        return c;
      }
    }
    return null;
  }

  /**
   * Classic layout, dependency display: split the graph into its workflows
   * with the same rules as the indented layout (a step's first arrow is its
   * structure, everything else a cross connection), without placing anything.
   * Returns the workflows' shown cells, and which of them are a lone start
   * circle or a dependent-workflow box; null when the structure is not
   * understood (the caller then uses the plain hierarchical layout).
   */
  partition(): { groups: Array<{ cells: any[]; kind: 'workflow' | 'start' | 'box' }>; structural: Set<any> } | null {
    this.collectShown();
    if (this.shown.length === 0) {
      return null;
    }
    for (const c of this.shown) {
      if (CLOSERS.has(tagOf(c))) {
        const tid = attr(c, 'targetId');
        if (tid) {
          this.closerByTarget.set(tid + '|' + tagOf(c), c);
        }
      }
    }
    const byId = (a: any, b: any) => {
      const na = Number(a.id), nb = Number(b.id);
      return isFinite(na) && isFinite(nb) ? na - nb : String(a.id).localeCompare(String(b.id));
    };
    const groups: Array<{ cells: any[]; kind: 'workflow' | 'start' | 'box' }> = [];
    const take = (root: any) => {
      const before = new Set(this.visited);
      const chain = this.parseChain(root, null, 0, 0);
      const cells = this.shown.filter(c => this.visited.has(c) && !before.has(c));
      const single = chain.items.length === 1 && chain.items[0].kind === 'cell' ? tagOf((chain.items[0] as CellItem).cell) : '';
      groups.push({cells, kind: single === 'Process' ? 'start' : single === 'Workflow' ? 'box' : 'workflow'});
    };
    try {
      const roots = this.shown.filter(c => this.predecessors(c).length === 0 && !CLOSERS.has(tagOf(c))).sort(byId);
      for (const r of roots) {
        if (!this.visited.has(r)) {
          take(r);
        }
      }
      for (let guard = 0; guard < 1000; guard++) {
        let next = this.shown.filter(c => !this.visited.has(c) && !CLOSERS.has(tagOf(c))
          && this.predecessors(c).every(p => this.visited.has(p))).sort(byId)[0];
        if (!next) {
          next = this.shown.filter(c => !this.visited.has(c) && !CLOSERS.has(tagOf(c))).sort(byId)[0];
        }
        if (!next) {
          break;
        }
        take(next);
      }
    } catch (e) {
      return null;
    }
    if (this.shown.some(c => !this.visited.has(c))) {
      return null;
    }
    return {groups, structural: this.structural};
  }

  /** Route for a cross connection between visible ends vs -> vt (null: leave to mxGraph). */
  private routeCross(e: any, pos: Map<any, { c: number; f: number; s: number }>, vs: any, vt: any):
    Array<{ x: number; y: number }> | null {
    const a = this.partOf.get(vs);
    const b = this.partOf.get(vt);
    if (a === undefined || b === undefined) {
      return null;
    }
    const xy = (f: number, c: number) => this.horizontal ? {x: f, y: c} : {x: c, y: f};
    const spA = pos.get(vs);
    const tpA = pos.get(vt);
    const sMidA = spA.f + this.flowSize(vs) / 2;
    const tMidA = tpA.f + this.flowSize(vt) / 2;
    if (a !== b && this.stacked) {
      // Workflows stacked one below the other: out to a lane on the right of
      // all of them, along it, and back in from the side. Each connection gets
      // its own lane so they do not run on top of each other.
      // Right edge from the final positions (they were shifted away from the
      // canvas corner after the workflows were measured).
      let right = -Infinity;
      pos.forEach((p, cell) => {
        const k = this.partOf.get(cell);
        if (k !== undefined && k >= 0) {
          right = Math.max(right, p.c + this.crossSize(cell));
        }
      });
      const lane = right + CHAIN_GAP / 3 + (this.laneCount++) * 8;
      return [xy(sMidA, lane), xy(tMidA, lane)];
    }
    if (a === b) {
      // Same workflow. An arrow re-attached to a collapsed Segment stays as
      // mxGraph draws it (the editor's collapsed look). A real connection (e.g.
      // a step back up to its workflow node) goes out to the side of this
      // workflow and back in, instead of running beside the next-step arrow.
      if (vs !== e.source || vt !== e.target) {
        return null;
      }
      let hi = -Infinity;
      pos.forEach((p, cell) => {
        if (this.partOf.get(cell) === a) {
          hi = Math.max(hi, p.c + this.crossSize(cell));
        }
      });
      const side = hi + CHAIN_GAP / 3;
      return [xy(sMidA, side), xy(tMidA, side)];
    }
    // Extent of every part along the cross axis, and the flow position above all.
    const ext = new Map<number, { lo: number; hi: number }>();
    let top = Infinity;
    pos.forEach((p, cell) => {
      const k = this.partOf.get(cell);
      top = Math.min(top, p.f);
      if (k === undefined) {
        return;
      }
      const x = ext.get(k) || {lo: Infinity, hi: -Infinity};
      x.lo = Math.min(x.lo, p.c);
      x.hi = Math.max(x.hi, p.c + this.crossSize(cell));
      ext.set(k, x);
    });
    const A = ext.get(a);
    const B = ext.get(b);
    const sMid = sMidA;
    const tMid = tMidA;
    const fromLow = A.hi <= B.lo;                   // source part lies before the target part
    const gapT = fromLow ? B.lo - CHAIN_GAP / 2 : B.hi + CHAIN_GAP / 2;
    // Another part in between? Then go around it: along the gap next to the
    // source's part, across a corridor above all parts, down the target's gap.
    const between0 = fromLow ? A.hi : B.hi;
    const between1 = fromLow ? B.lo : A.lo;
    let blocked = false;
    ext.forEach((x, k) => {
      if (k !== a && k !== b && x.hi > between0 && x.lo < between1) {
        blocked = true;
      }
    });
    if (!blocked) {
      return [xy(sMid, gapT), xy(tMid, gapT)];
    }
    const gapS = fromLow ? A.hi + CHAIN_GAP / 2 : A.lo - CHAIN_GAP / 2;
    const corridor = top - 20;
    return [xy(sMid, gapS), xy(corridor, gapS), xy(corridor, gapT), xy(tMid, gapT)];
  }

  private applyIndented(pos: Map<any, { c: number; f: number; s: number }>): void {
    this.laneCount = 0;
    const depthOf = (c: any) => {
      let d = 0;
      for (let p = c.parent; p && p !== this.root; p = p.parent) {
        d++;
      }
      return d;
    };
    const toXY = (p: { c: number; f: number }) => this.horizontal ? {x: p.f, y: p.c} : {x: p.c, y: p.f};
    const ordered = Array.from(pos.keys()).sort((a, b) => depthOf(a) - depthOf(b));
    const origin = (p: any): { x: number; y: number } => {
      if (!p || p === this.root || !p.vertex) {
        return {x: 0, y: 0};
      }
      const np = pos.get(p);
      return np ? toXY(np) : this.abs(p);
    };
    const P = (typeof mxPoint !== 'undefined') ? mxPoint : null;
    this.model.beginUpdate();
    try {
      for (const cell of ordered) {
        const g = this.model.getGeometry(cell);
        if (!g) {
          continue;
        }
        const np = toXY(pos.get(cell));
        const o = origin(cell.parent);
        const rx = np.x - o.x;
        const ry = np.y - o.y;
        if (Math.abs(rx - g.x) > 0.01 || Math.abs(ry - g.y) > 0.01) {
          const ng = g.clone();
          ng.x = rx;
          ng.y = ry;
          this.model.setGeometry(cell, ng);
        }
      }
      const all = Object.keys(this.model.cells || {}).map(k => this.model.cells[k]);
      const routed: any[] = [];
      const crossEdges: any[] = [];
      for (const e of all) {
        if (!e || !e.edge) {
          continue;
        }
        const g = this.model.getGeometry(e);
        if (!g) {
          continue;
        }
        const vs = this.visibleEnd(e.source);
        const vt = this.visibleEnd(e.target);
        if (vs && vt && vs !== vt && pos.has(vs) && pos.has(vt) && !this.structural.has(e)) {
          // Cross connection (other workflow, dependent-workflow box, or one
          // from a step hidden in a collapsed Segment, which mxGraph draws from
          // the Segment's box): out of the step sideways, along the gap next to
          // the target's part, and in from the side, so it does not run through
          // the steps in between.
          const pts = this.routeCross(e, pos, vs, vt);
          const ng = g.clone();
          ng.offset = null;
          if (pts && P) {
            const o = origin(e.parent);
            ng.points = pts.map(p => new P(p.x - o.x, p.y - o.y));
            routed.push(e);
          } else {
            ng.points = null;
            crossEdges.push(e);
          }
          this.model.setGeometry(e, ng);
          continue;
        }
        const route = this.routeIndented(e, pos);
        if (e.source && e.target && pos.has(e.source) && pos.has(e.target)) {
          routed.push(e);
        }
        let pts: any[] | null = null;
        if (route.points && P) {
          // Edge points are relative to the edge's parent (see routeEdge).
          const o = origin(e.parent);
          pts = route.points.map(p => new P(p.x - o.x, p.y - o.y));
        }
        const had = g.points && g.points.length > 0;
        const moveLabel = route.labelX !== null && Math.abs((g.x || 0) - route.labelX) > 0.001;
        const want = route.offset || null;
        const cur = g.offset || null;
        const moveOffset = (!!want !== !!cur) || (want && cur && (Math.abs(want.x - cur.x) > 0.01 || Math.abs(want.y - cur.y) > 0.01));
        if (pts || had || moveLabel || moveOffset) {
          const ng = g.clone();
          ng.points = pts;
          if (route.labelX !== null) {
            ng.x = route.labelX;
            ng.y = 0;
          }
          ng.offset = want && P ? new P(want.x, want.y) : null;
          this.model.setGeometry(e, ng);
        }
      }
      // Draw the arrows exactly through the points computed here, with
      // straight (axis-aligned) connections to the shapes. The hierarchical
      // layout sets the same two flags; without them the orthogonal edge style
      // re-routes the arrows (jogs) and the ends aim at shape centres (slanted
      // into wide jobs). Needed now that the indented layout runs without the
      // hierarchical one first.
      if (routed.length > 0 && typeof this.graph.setCellStyles === 'function') {
        this.graph.setCellStyles('noEdgeStyle', '1', routed);
        this.graph.setCellStyles('orthogonal', '1', routed);
      }
      if (crossEdges.length > 0 && typeof this.graph.setCellStyles === 'function') {
        this.graph.setCellStyles('noEdgeStyle', null, crossEdges);
        this.graph.setCellStyles('orthogonal', null, crossEdges);
      }
    } finally {
      this.model.endUpdate();
    }
  }

  // ------------------------------------------------------------ placement

  /** target: cell -> absolute cross-axis position of its leading edge. */
  private placeChain(chain: Chain, center: number, target: Map<any, number>): void {
    for (const item of chain.items) {
      if (item.kind === 'cell') {
        target.set(item.cell, center - item.w / 2);
      } else {
        target.set(item.opener, center - this.crossSize(item.opener) / 2);
        target.set(item.closer, center - this.crossSize(item.closer) / 2);
        const total = item.branches.reduce((s, b) => s + b.w, 0) + Math.max(0, item.branches.length - 1) * this.gap;
        let lead = center - total / 2;
        for (const b of item.branches) {
          this.placeChain(b, lead + b.w / 2, target);
          lead += b.w + this.gap;
        }
      }
    }
  }

  /**
   * Bend points for one arrow at the new positions (null = straight line) and
   * where its label goes along the arrow (mxGraph edge label x: -1 = source
   * end, 0 = middle, 1 = target end; null = leave as is).
   */
  private routeEdge(e: any, newAbs: Map<any, number>): { points: any[] | null; labelX: number | null } {
    const src = e.source;
    const dst = e.target;
    if (!src || !dst || !newAbs.has(src) || !newAbs.has(dst)) {
      return {points: null, labelX: null}; // arrow to a hidden cell (collapsed block): let mxGraph route it
    }
    const sCross = newAbs.get(src) + this.crossSize(src) / 2;
    const tCross = newAbs.get(dst) + this.crossSize(dst) / 2;
    if (Math.abs(sCross - tCross) < 0.5) {
      return {points: null, labelX: 0}; // same column: straight arrow, label in the middle
    }
    const sa = this.abs(src);
    const ta = this.abs(dst);
    const sFlow = this.horizontal ? sa.x : sa.y;
    const tFlow = this.horizontal ? ta.x : ta.y;
    const forward = tFlow >= sFlow;
    const sEnd = forward ? sFlow + this.flowSize(src) : sFlow;   // edge of source facing the target
    const tEnd = forward ? tFlow : tFlow + this.flowSize(dst);    // edge of target facing the source
    const span = Math.abs(tEnd - sEnd);
    const step = Math.min(this.rankGap, span) / 2;
    const dir = forward ? 1 : -1;
    // Into a closer: bend just before it. Otherwise bend just after the source,
    // but clear of the target's scope box (padding + label strip) if it has one.
    const clearOfBox = span - (BLOCK_SCOPE_METRICS.padding + BLOCK_SCOPE_METRICS.labelStrip) - 4;
    const intoCloser = CLOSERS.has(tagOf(dst));
    const bend = intoCloser
      ? tEnd - dir * step
      : sEnd + dir * Math.max(4, Math.min(step, clearOfBox));
    const P = (typeof mxPoint !== 'undefined') ? mxPoint : null;
    if (!P) {
      return {points: null, labelX: null};
    }

    // Arrows that fan out or merge share one sideways lane, and a label at the
    // middle of the path would land somewhere on that shared lane, next to the
    // wrong arrow. Put it on a stretch only this arrow uses instead:
    //  - into a Join/End: on the first stretch, just below the step it leaves;
    //  - otherwise (into a branch): on the last stretch, just above its target.
    const first = Math.abs(bend - sEnd);
    const side = Math.abs(tCross - sCross);
    const last = Math.abs(tEnd - bend);
    const total = first + side + last;
    // Into a Join the first stretch can be long; keep the label right under its step.
    const along = intoCloser ? Math.min(first / 2, 18) : first + side + last / 2;
    const labelX = total > 0 ? Math.max(-1, Math.min(1, (along / total) * 2 - 1)) : 0;
    // mxGraph keeps an arrow inside the nearest common ancestor of its ends
    // (an arrow from a Fork to one of its branches lives inside the Fork), and
    // its points are relative to that parent's corner, not to the canvas.
    let oCross = 0;
    let oFlow = 0;
    const parent = e.parent;
    if (parent && parent !== this.root && parent.vertex) {
      const pa = this.abs(parent);
      oCross = newAbs.has(parent) ? newAbs.get(parent) : this.cross(pa);
      oFlow = this.horizontal ? pa.x : pa.y;
    }
    const b = bend - oFlow;
    const s1 = sCross - oCross;
    const t1 = tCross - oCross;
    return {
      points: this.horizontal ? [new P(b, s1), new P(b, t1)] : [new P(s1, b), new P(t1, b)],
      labelX
    };
  }

  private apply(target: Map<any, number>, delta: number): void {
    const newAbs = new Map<any, number>();
    target.forEach((pos, cell) => newAbs.set(cell, pos + delta));

    // Parents before children, so child geometry can be made relative to the
    // parent's NEW position (block children are nested under their opener).
    const depthOf = (c: any) => {
      let d = 0;
      for (let p = c.parent; p && p !== this.root; p = p.parent) {
        d++;
      }
      return d;
    };
    const ordered = Array.from(newAbs.keys()).sort((a, b) => depthOf(a) - depthOf(b));

    this.model.beginUpdate();
    try {
      for (const cell of ordered) {
        const g = this.model.getGeometry(cell);
        if (!g) {
          continue;
        }
        const p = cell.parent;
        let parentCross = 0;
        if (p && p !== this.root && p.vertex) {
          parentCross = newAbs.has(p) ? newAbs.get(p) : this.cross(this.abs(p));
        }
        const rel = newAbs.get(cell) - parentCross;
        const cur = this.horizontal ? g.y : g.x;
        if (Math.abs(rel - cur) > 0.01) {
          const ng = g.clone();
          if (this.horizontal) {
            ng.y = rel;
          } else {
            ng.x = rel;
          }
          this.model.setGeometry(cell, ng);
        }
      }
      // The hierarchical layout stored bend points for the OLD positions.
      // Re-route every arrow in the same top-down style: leave the source,
      // jog sideways once, enter the target. Arrows out of a cell bend just
      // after it; arrows into a closer (Join, If-End, ...) bend just before
      // it, so a long branch-to-Join arrow runs straight inside its own column.
      const all = Object.keys(this.model.cells || {}).map(k => this.model.cells[k]);
      for (const e of all) {
        if (!e || !e.edge) {
          continue;
        }
        const g = this.model.getGeometry(e);
        if (!g) {
          continue;
        }
        const route = this.routeEdge(e, newAbs);
        const had = g.points && g.points.length > 0;
        const moveLabel = route.labelX !== null && Math.abs((g.x || 0) - route.labelX) > 0.001;
        if (route.points || had || moveLabel) {
          const ng = g.clone();
          ng.points = route.points;
          if (route.labelX !== null) {
            ng.x = route.labelX;
            ng.y = 0;
          }
          this.model.setGeometry(e, ng);
        }
      }
    } finally {
      this.model.endUpdate();
    }
  }
}
