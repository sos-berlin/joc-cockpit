import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges, ViewContainerRef } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { CoreService } from '../../../services/core.service';
import { ScriptModalComponent } from '../script-modal/script-modal.component';
import { CommentModalComponent } from '../../../components/comment-modal/comment.component';

interface OrderStateSummary {
  state: string;
  severity: number;
  count: number;
}

interface SegmentItem {
  id: string;
  name: string;
  jobCount: number;
  jobLabel: string;   // precomputed "N Job" / "N Jobs" — avoids ternary on every CD cycle
  orderCount: number;
  ordersSummary: { state: string; count: number; severity: number }[];
  worstSeverity: number;
  displayTree: DisplayItem[];
  isExpanded: boolean;
  contentHeight: number;
  isSynthetic: boolean; // true = loose instructions grouped as "Step N", not a real Segment instruction
}

interface DisplayItem {
  kind: 'job' | 'container' | 'branch-label' | 'segment';
  icon: string;
  label: string;
  subLabel?: string;
  depth: number;
  positionPath: any[];
  positionKey: string;       // pre-serialized JSON.stringify(positionPath) — computed once at build time
  positionString?: string;
  orderStates: OrderStateSummary[];
  segmentItem?: SegmentItem;
  instructionRef?: any;      // pointer to original instruction — used by skip/stop/showConfig; zero memory cost
  ordersAtPos?: any[];       // full order objects at this position — used for per-row order dots + action menus
}

@Component({
  standalone: false,
  selector: 'app-workflow-segment',
  templateUrl: './workflow-segment.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkflowSegmentComponent implements OnChanges, OnDestroy {
  @Input() workFlowJson: any = {};
  @Input() orders: any[] = [];
  @Input() orderReload: boolean;
  @Input() jobs: any = {};
  @Input() permission: any = {};
  @Input() preferences: any = {};
  @Input() schedulerId: string = '';
  @Output() onClick = new EventEmitter<any>();

  segments: SegmentItem[] = [];
  private segIdCounter = 0;
  // Maintained incrementally by toggleSegment; persists across structural rebuilds
  private expandedByName = new Map<string, boolean>();
  // Memoized order lookup maps — rebuilt once per order change, shared across all segments
  private _orderMap = new Map<string, Map<string, { severity: number; count: number }>>();
  private _psMap = new Map<string, Map<string, { severity: number; count: number }>>();
  private _rawOrdersMap = new Map<string, any[]>();
  private _rawOrdersPsMap = new Map<string, any[]>();
  private _refreshTimer: any = null;

  // ── Windowed slice ────────────────────────────────────────────────────────
  private readonly WINDOW_SIZE = 5;
  visibleSegments: SegmentItem[] = [];
  windowStart = 0;
  windowEnd = 0;
  private anchorIndex = -1;
  // Whether user has manually shifted the window (locks anchoring to not re-center)
  private userMovedWindow = false;
  hasPrev = false;
  hasNext = false;

  constructor(public coreService: CoreService, private cdr: ChangeDetectorRef, private modal: NzModalService, public viewContainerRef: ViewContainerRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['workFlowJson']) {
      this.buildOrderMaps();
      this.buildSegments();
    } else if (changes['orders'] || changes['orderReload']) {
      if (this._refreshTimer) clearTimeout(this._refreshTimer);
      this._refreshTimer = setTimeout(() => {
        this.buildOrderMaps();
        this.refreshOrderStates();
        this._refreshTimer = null;
      }, 150);
    }
  }

  ngOnDestroy(): void {
    if (this._refreshTimer) clearTimeout(this._refreshTimer);
  }

  // ── Structural build (runs only when workFlowJson changes) ───────────────

  private countJobs(instructions: any[]): number {
    if (!Array.isArray(instructions)) return 0;
    let count = 0;
    for (const inst of instructions) {
      if (inst.TYPE === 'Job') count++;
      count += this.countJobs(inst.instructions || []);
      if (inst.block?.instructions) count += this.countJobs(inst.block.instructions);
      if (inst.then?.instructions) count += this.countJobs(inst.then.instructions);
      if (inst.else?.instructions) count += this.countJobs(inst.else.instructions);
      if (inst.catch?.instructions) count += this.countJobs(inst.catch.instructions);
      if (inst.body?.instructions) count += this.countJobs(inst.body.instructions);
      if (inst.branches) {
        for (const b of inst.branches) count += this.countJobs(b.instructions || []);
      }
      if (inst.cases) {
        for (const c of inst.cases) count += this.countJobs(c.then?.instructions || []);
      }
    }
    return count;
  }

  private buildDisplayTree(instructions: any[], depth: number, basePath: any[]): DisplayItem[] {
    const items: DisplayItem[] = [];
    if (!Array.isArray(instructions)) return items;

    for (let i = 0; i < instructions.length; i++) {
      const inst = instructions[i];
      const type: string = inst.TYPE || '';

      if (!type || type === 'EndSegment' || type === 'ImplicitEnd' ||
          type === 'EndLock' || type === 'EndOptions' || type === 'EndAdmissionTime' ||
          type === 'Join' || type === 'ForkJoin') {
        continue;
      }

      if (type === 'Segment') {
        const childInstructions = inst.block?.instructions || inst.instructions || [];
        const name = inst.label || inst.name || 'Segment';
        const childDisplayTree = this.buildDisplayTree(childInstructions, 0, basePath);
        this.populateOrderStates(childDisplayTree);
        const { summary, worstSeverity, orderCount } = this.summaryFromDisplayTree(childDisplayTree);
        const childExpanded = this.expandedByName.get(name) ?? false;
        const childJobCount = this.countJobs(childInstructions);
        const childSeg: SegmentItem = {
          id: 'seg_' + (this.segIdCounter++),
          name,
          jobCount: childJobCount,
          jobLabel: childJobCount + (childJobCount === 1 ? ' Job' : ' Jobs'),
          orderCount,
          ordersSummary: summary,
          worstSeverity,
          displayTree: childDisplayTree,
          isExpanded: childExpanded,
          contentHeight: 0, // computed after tree is fully built
          isSynthetic: false,
        };
        const segPos = [...basePath, i];
        items.push({
          kind: 'segment', icon: 'fa-object-group', label: name,
          depth, positionPath: segPos, positionKey: JSON.stringify(segPos),
          orderStates: [], segmentItem: childSeg,
        });
        continue;
      }

      const currentPath = [...basePath, i];
      const instPos: any[] = inst.position || currentPath;
      const instPosKey = JSON.stringify(instPos);
      const instPosStr: string | undefined = inst.positionString;
      const childInstr = inst.block?.instructions || inst.instructions || [];

      switch (type) {
        case 'Job':
          items.push({
            kind: 'job', icon: 'fa-cog', depth,
            label: inst.label || inst.jobName || 'Job',
            subLabel: this.jobs?.[inst.jobName]?.agentName || undefined,
            positionPath: instPos, positionKey: instPosKey, positionString: instPosStr,
            orderStates: [], instructionRef: inst,
          });
          break;

        case 'Retry':
          items.push({
            kind: 'container', icon: 'fa-repeat', depth,
            label: 'Retry',
            subLabel: inst.maxTries ? '(max ' + inst.maxTries + 'x)' : undefined,
            positionPath: instPos, positionKey: instPosKey, positionString: instPosStr,
            orderStates: [], instructionRef: inst,
          });
          items.push(...this.buildDisplayTree(childInstr, depth + 1, [...instPos, 'try+0']));
          break;

        case 'Try': {
          items.push({ kind: 'container', icon: 'fa-shield', label: 'Try', depth, positionPath: instPos, positionKey: instPosKey, positionString: instPosStr, orderStates: [], instructionRef: inst });
          items.push(...this.buildDisplayTree(childInstr, depth + 1, [...instPos, 'try+0']));
          if (inst.catch?.instructions?.length) {
            const catchPos = inst.catch?.position || [...instPos, 'catch'];
            items.push({ kind: 'branch-label', icon: 'fa-exclamation-triangle', label: 'Catch', depth: depth + 1, positionPath: catchPos, positionKey: JSON.stringify(catchPos), orderStates: [] });
            items.push(...this.buildDisplayTree(inst.catch.instructions, depth + 2, catchPos));
          }
          break;
        }

        case 'If': {
          items.push({ kind: 'container', icon: 'fa-random', label: 'If', depth, positionPath: instPos, positionKey: instPosKey, positionString: instPosStr, orderStates: [], instructionRef: inst });
          if (inst.then?.instructions?.length) {
            const thenPos = [...instPos, 'then'];
            items.push({ kind: 'branch-label', icon: 'fa-angle-right', label: 'Then', depth: depth + 1, positionPath: thenPos, positionKey: JSON.stringify(thenPos), orderStates: [] });
            items.push(...this.buildDisplayTree(inst.then.instructions, depth + 2, thenPos));
          }
          if (inst.else?.instructions?.length) {
            const elsePos = [...instPos, 'else'];
            items.push({ kind: 'branch-label', icon: 'fa-angle-right', label: 'Else', depth: depth + 1, positionPath: elsePos, positionKey: JSON.stringify(elsePos), orderStates: [] });
            items.push(...this.buildDisplayTree(inst.else.instructions, depth + 2, elsePos));
          }
          break;
        }

        case 'CaseWhen': {
          items.push({ kind: 'container', icon: 'fa-list-alt', label: 'Case', depth, positionPath: instPos, positionKey: instPosKey, positionString: instPosStr, orderStates: [], instructionRef: inst });
          if (inst.cases?.length) {
            // Format 1: cases = [{ predicate, then: { instructions } }]
            inst.cases.forEach((c: any, ci: number) => {
              const casePath = [...instPos, ci === 0 ? 'then' : 'then+' + (ci * 2)];
              items.push({ kind: 'branch-label', icon: 'fa-angle-right', label: c.predicate || ('Case ' + (ci + 1)), depth: depth + 1, positionPath: casePath, positionKey: JSON.stringify(casePath), orderStates: [] });
              items.push(...this.buildDisplayTree(c.then?.instructions || [], depth + 2, casePath));
            });
          } else if (inst.instructions?.length) {
            // Format 2: instructions = [{ TYPE:'When'|'ElseWhen', predicate, instructions }]
            inst.instructions.forEach((w: any) => {
              const whenPos: any[] = w.position || instPos;
              items.push({ kind: 'branch-label', icon: 'fa-angle-right', label: w.TYPE === 'ElseWhen' ? 'Else' : 'When', depth: depth + 1, positionPath: whenPos, positionKey: JSON.stringify(whenPos), positionString: w.positionString, orderStates: [] });
              items.push(...this.buildDisplayTree(w.instructions || [], depth + 2, whenPos));
            });
          }
          break;
        }

        case 'Fork':
        case 'ForkList': {
          items.push({ kind: 'container', icon: 'fa-code-fork', label: type, depth, positionPath: instPos, positionKey: instPosKey, positionString: instPosStr, orderStates: [], instructionRef: inst });
          (inst.branches || []).forEach((b: any, bi: number) => {
            const branchId = b.branchId || b.id || b.name || String(bi);
            const branchPath = [...instPos, 'fork+' + branchId];
            items.push({ kind: 'branch-label', icon: 'fa-angle-right', label: b.name || branchId, depth: depth + 1, positionPath: branchPath, positionKey: JSON.stringify(branchPath), orderStates: [] });
            items.push(...this.buildDisplayTree(b.instructions || [], depth + 2, branchPath));
          });
          break;
        }

        case 'Lock':
          items.push({ kind: 'container', icon: 'fa-lock', label: 'Lock', depth, positionPath: instPos, positionKey: instPosKey, positionString: instPosStr, orderStates: [], instructionRef: inst });
          items.push(...this.buildDisplayTree(childInstr, depth + 1, instPos));
          break;

        case 'Cycle':
          items.push({ kind: 'container', icon: 'fa-refresh', label: 'Cycle', depth, positionPath: instPos, positionKey: instPosKey, positionString: instPosStr, orderStates: [], instructionRef: inst });
          items.push(...this.buildDisplayTree(childInstr, depth + 1, [...instPos, 'cycle']));
          break;

        case 'Options':
        case 'AdmissionTime':
          items.push({ kind: 'container', icon: 'fa-clock-o', label: type, depth, positionPath: instPos, positionKey: instPosKey, positionString: instPosStr, orderStates: [], instructionRef: inst });
          items.push(...this.buildDisplayTree(childInstr, depth + 1, instPos));
          break;

        case 'StickySubagent':
          items.push({ kind: 'container', icon: 'fa-link', label: 'StickySubagent', depth, positionPath: instPos, positionKey: instPosKey, positionString: instPosStr, orderStates: [], instructionRef: inst });
          items.push(...this.buildDisplayTree(childInstr, depth + 1, instPos));
          break;

        case 'ConsumeNotices':
        case 'ExpectNotices':
        case 'PostNotices':
          items.push({ kind: 'job', icon: 'fa-bell', label: type.replace('Notices', ' Notice'), depth, positionPath: instPos, positionKey: instPosKey, positionString: instPosStr, orderStates: [], instructionRef: inst });
          break;

        case 'AddOrder':
          items.push({ kind: 'job', icon: 'fa-plus-circle', label: 'Add Order', subLabel: inst.workflowPath || undefined, depth, positionPath: instPos, positionKey: instPosKey, positionString: instPosStr, orderStates: [], instructionRef: inst });
          break;

        case 'Fail':
          items.push({ kind: 'job', icon: 'fa-ban', label: 'Fail', depth, positionPath: instPos, positionKey: instPosKey, positionString: instPosStr, orderStates: [], instructionRef: inst });
          break;

        case 'Finish':
          items.push({ kind: 'job', icon: 'fa-check-circle', label: 'Finish', depth, positionPath: instPos, positionKey: instPosKey, positionString: instPosStr, orderStates: [], instructionRef: inst });
          break;

        case 'Prompt':
          items.push({ kind: 'job', icon: 'fa-comment', label: 'Prompt', subLabel: inst.question || undefined, depth, positionPath: instPos, positionKey: instPosKey, positionString: instPosStr, orderStates: [], instructionRef: inst });
          break;

        case 'Sleep':
          items.push({ kind: 'job', icon: 'fa-clock-o', label: 'Sleep', depth, positionPath: instPos, positionKey: instPosKey, positionString: instPosStr, orderStates: [], instructionRef: inst });
          break;

        default:
          if (childInstr.length > 0) {
            items.push({ kind: 'container', icon: 'fa-circle-o', label: type, depth, positionPath: instPos, positionKey: instPosKey, positionString: instPosStr, orderStates: [], instructionRef: inst });
            items.push(...this.buildDisplayTree(childInstr, depth + 1, instPos));
          } else {
            items.push({ kind: 'job', icon: 'fa-circle-o', label: type, depth, positionPath: instPos, positionKey: instPosKey, positionString: instPosStr, orderStates: [], instructionRef: inst });
          }
      }
    }
    return items;
  }

  private buildSegments(): void {
    if (!this.workFlowJson?.instructions) {
      this.segments = [];
      return;
    }

    const allInstructions: any[] = this.workFlowJson.instructions;
    this.segIdCounter = 0;

    const result: SegmentItem[] = [];
    let stepCounter = 0;
    let buffer: any[] = [];

    const flushBuffer = () => {
      if (buffer.length === 0) return;
      stepCounter++;
      const name = 'Step ' + stepCounter;
      const displayTree = this.buildDisplayTree(buffer, 0, []);
      this.populateOrderStates(displayTree);
      const { summary, worstSeverity, orderCount } = this.summaryFromDisplayTree(displayTree);
      const jc = this.countJobs(buffer);
      result.push({
        id: 'seg_' + (this.segIdCounter++),
        name,
        jobCount: jc,
        jobLabel: jc + (jc === 1 ? ' Job' : ' Jobs'),
        orderCount,
        ordersSummary: summary,
        worstSeverity,
        displayTree,
        isExpanded: this.expandedByName.has(name) ? this.expandedByName.get(name)! : false,
        contentHeight: 0,
        isSynthetic: true,
      });
      buffer = [];
    };

    for (const inst of allInstructions) {
      if (inst.TYPE === 'Segment') {
        flushBuffer();
        const childInstructions = inst.block?.instructions || inst.instructions || [];
        const name = inst.label || inst.name || 'Segment';
        const displayTree = this.buildDisplayTree(childInstructions, 0, []);
        this.populateOrderStates(displayTree);
        const { summary, worstSeverity, orderCount } = this.summaryFromDisplayTree(displayTree);
        const jc2 = this.countJobs(childInstructions);
        result.push({
          id: 'seg_' + (this.segIdCounter++),
          name,
          jobCount: jc2,
          jobLabel: jc2 + (jc2 === 1 ? ' Job' : ' Jobs'),
          orderCount,
          ordersSummary: summary,
          worstSeverity,
          displayTree,
          isExpanded: this.expandedByName.has(name) ? this.expandedByName.get(name)! : result.length === 0,
          contentHeight: 0,
          isSynthetic: false,
        });
      } else if (inst.TYPE && !['ImplicitEnd', 'EndSegment', 'EndLock', 'EndOptions',
                                  'EndAdmissionTime', 'Join', 'ForkJoin'].includes(inst.TYPE)) {
        buffer.push(inst);
      }
    }
    flushBuffer();

    if (result.length === 0) {
      // No Segment instructions at all — show everything in one card
      const name = this.workFlowJson.name || 'All Jobs';
      const displayTree = this.buildDisplayTree(allInstructions, 0, []);
      this.populateOrderStates(displayTree);
      const { summary, worstSeverity, orderCount } = this.summaryFromDisplayTree(displayTree);
      const jcAll = this.countJobs(allInstructions);
      this.segments = [{
        id: 'seg_all',
        name,
        jobCount: jcAll,
        jobLabel: jcAll + (jcAll === 1 ? ' Job' : ' Jobs'),
        orderCount,
        ordersSummary: summary,
        worstSeverity,
        displayTree,
        isExpanded: this.expandedByName.has(name) ? this.expandedByName.get(name)! : true,
        contentHeight: 0,
        isSynthetic: false,
      }];
    } else {
      this.segments = result;
    }
    this.recomputeAllHeights();
    this.userMovedWindow = false;
    this.initWindow();
    this.cdr.markForCheck();
  }

  // ── Order-state refresh (runs only when orders/orderReload changes) ───────
  // Stamps orderStates on existing DisplayItem objects in-place — no tree rebuild.

  private refreshOrderStates(): void {
    for (const seg of this.segments) {
      this.populateOrderStates(seg.displayTree);
      this.refreshNestedSegments(seg.displayTree);
      const { summary, worstSeverity, orderCount } = this.summaryFromDisplayTree(seg.displayTree);
      seg.ordersSummary = summary;
      seg.worstSeverity = worstSeverity;
      seg.orderCount = orderCount;
    }
    this.updateAnchorOnRefresh();
    this.cdr.markForCheck();
  }

  private refreshNestedSegments(displayTree: DisplayItem[]): void {
    for (const item of displayTree) {
      if (item.kind === 'segment' && item.segmentItem) {
        const seg = item.segmentItem;
        this.populateOrderStates(seg.displayTree);
        this.refreshNestedSegments(seg.displayTree);
        const { summary, worstSeverity, orderCount } = this.summaryFromDisplayTree(seg.displayTree);
        seg.ordersSummary = summary;
        seg.worstSeverity = worstSeverity;
        seg.orderCount = orderCount;
      }
    }
  }

  // ── Shared utilities ──────────────────────────────────────────────────────

  // Build lookup maps once per order change — shared across all populateOrderStates calls this cycle
  private buildOrderMaps(): void {
    this._orderMap = new Map();
    this._psMap = new Map();
    this._rawOrdersMap = new Map();
    this._rawOrdersPsMap = new Map();
    for (const order of this.orders || []) {
      const state = order.state?._text || 'UNKNOWN';
      const severity = order.state?.severity ?? 0;
      if (order.position) {
        const posKey = JSON.stringify(order.position);
        if (!this._orderMap.has(posKey)) this._orderMap.set(posKey, new Map());
        const sm = this._orderMap.get(posKey)!;
        if (!sm.has(state)) sm.set(state, { severity, count: 0 });
        sm.get(state)!.count++;
        if (!this._rawOrdersMap.has(posKey)) this._rawOrdersMap.set(posKey, []);
        this._rawOrdersMap.get(posKey)!.push(order);
      }
      if (order.positionString) {
        if (!this._psMap.has(order.positionString)) this._psMap.set(order.positionString, new Map());
        const sm = this._psMap.get(order.positionString)!;
        if (!sm.has(state)) sm.set(state, { severity, count: 0 });
        sm.get(state)!.count++;
        if (!this._rawOrdersPsMap.has(order.positionString)) this._rawOrdersPsMap.set(order.positionString, []);
        this._rawOrdersPsMap.get(order.positionString)!.push(order);
      }
    }
  }

  private populateOrderStates(displayTree: DisplayItem[]): void {
    for (const item of displayTree) {
      if (item.kind === 'segment') continue;
      const byPos = this._orderMap.get(item.positionKey);
      const byStr = item.positionString ? this._psMap.get(item.positionString) : undefined;
      const stateMap = byPos || byStr;
      item.orderStates = stateMap
        ? Array.from(stateMap.entries()).map(([state, v]) => ({ state, severity: v.severity, count: v.count }))
        : [];
      item.ordersAtPos = this._rawOrdersMap.get(item.positionKey)
        || (item.positionString ? this._rawOrdersPsMap.get(item.positionString) : undefined)
        || [];
    }
  }

  private summaryFromDisplayTree(displayTree: DisplayItem[]): { summary: { state: string; count: number; severity: number }[]; worstSeverity: number; orderCount: number } {
    const map: { [key: string]: { count: number; severity: number } } = {};
    let worstSeverity = 0;
    let orderCount = 0;
    for (const item of displayTree) {
      if (item.kind === 'segment') continue;
      for (const os of item.orderStates) {
        if (!map[os.state]) map[os.state] = { count: 0, severity: os.severity };
        map[os.state].count += os.count;
        orderCount += os.count;
        if (os.severity > worstSeverity) worstSeverity = os.severity;
      }
    }
    const summary = Object.entries(map).map(([state, v]) => ({ state, count: v.count, severity: v.severity }));
    return { summary, worstSeverity, orderCount };
  }

  // ── Height computation ────────────────────────────────────────────────────

  private computeContentHeight(displayTree: DisplayItem[]): number {
    let height = 0;
    for (const item of displayTree) {
      if (item.kind === 'segment' && item.segmentItem) {
        const nested = item.segmentItem;
        // Recursively compute and assign nested segment's own contentHeight first
        nested.contentHeight = this.computeContentHeight(nested.displayTree);
        height += 36; // header row
        if (nested.isExpanded) {
          height += nested.contentHeight;
        }
      } else {
        height += 28;
      }
    }
    return Math.min(height + 10, 400);
  }

  private recomputeAllHeights(): void {
    for (const seg of this.segments) {
      seg.contentHeight = this.computeContentHeight(seg.displayTree);
    }
  }

  // ── Windowed slice ────────────────────────────────────────────────────────

  private findAnchorIndex(): number {
    for (let i = 0; i < this.segments.length; i++) {
      if (this.segments[i].orderCount > 0) return i;
    }
    return -1;
  }

  private centerWindowOn(index: number): void {
    this.windowStart = Math.max(0, index - 2);
    this.windowEnd = Math.min(this.segments.length, this.windowStart + this.WINDOW_SIZE);
    if (this.windowEnd - this.windowStart < this.WINDOW_SIZE) {
      this.windowStart = Math.max(0, this.windowEnd - this.WINDOW_SIZE);
    }
  }

  private initWindow(): void {
    const anchor = this.findAnchorIndex();
    this.anchorIndex = anchor;
    if (anchor >= 0) {
      this.centerWindowOn(anchor);
      const anchorSeg = this.segments[anchor];
      if (!this.expandedByName.has(anchorSeg.name)) {
        this.expandedByName.set(anchorSeg.name, true);
        anchorSeg.isExpanded = true;
        anchorSeg.contentHeight = this.computeContentHeight(anchorSeg.displayTree);
      }
    } else {
      this.windowStart = 0;
      this.windowEnd = Math.min(this.WINDOW_SIZE, this.segments.length);
    }
    this.updateVisibleSegments();
  }

  private updateAnchorOnRefresh(): void {
    const newAnchor = this.findAnchorIndex();
    if (newAnchor === this.anchorIndex) return;
    this.anchorIndex = newAnchor;
    if (newAnchor < 0) return;
    if (newAnchor >= this.windowStart && newAnchor < this.windowEnd) {
      // Anchor is already in view — expand but don't re-center
      const seg = this.segments[newAnchor];
      if (!seg.isExpanded) {
        this.expandedByName.set(seg.name, true);
        seg.isExpanded = true;
        this.recomputeAllHeights();
      }
      this.updateVisibleSegments();
      return;
    }
    if (this.userMovedWindow) {
      // User has manually navigated — do not hijack their position
      return;
    }
    // Anchor outside window — re-center
    this.centerWindowOn(newAnchor);
    const seg = this.segments[newAnchor];
    if (!seg.isExpanded) {
      this.expandedByName.set(seg.name, true);
      seg.isExpanded = true;
      this.recomputeAllHeights();
    }
    this.updateVisibleSegments();
  }

  private updateVisibleSegments(): void {
    this.visibleSegments = this.segments.slice(this.windowStart, this.windowEnd);
    this.hasPrev = this.windowStart > 0;
    this.hasNext = this.windowEnd < this.segments.length;
  }

  // ── Instruction actions (skip / stop / showConfig) ───────────────────────

  private skipOrStop(item: DisplayItem, operation: string, auditLog?: any): void {
    const obj: any = { controllerId: this.schedulerId };
    if (auditLog) obj.auditLog = auditLog;
    if (operation === 'Skip' || operation === 'Unskip') {
      obj.labels = [item.instructionRef.label];
      obj.workflowPath = this.workFlowJson.path;
    } else {
      obj.positions = [item.instructionRef.position || item.positionPath];
      obj.workflowId = { path: this.workFlowJson.path, versionId: this.workFlowJson.versionId };
    }
    this.coreService.post('workflow/' + operation.toLowerCase(), obj).subscribe();
  }

  private skipOperation(item: DisplayItem, operation: string): void {
    if (this.preferences?.auditLog) {
      const modalRef = this.modal.create({
        nzTitle: undefined,
        nzContent: CommentModalComponent,
        nzData: { operationType: operation, title: '' },
        nzFooter: null,
        nzAutofocus: null,
      });
      modalRef.afterClose.subscribe(result => {
        if (result) this.skipOrStop(item, operation, result);
      });
    } else {
      this.skipOrStop(item, operation);
    }
  }

  skip(item: DisplayItem): void { this.skipOperation(item, 'Skip'); }
  unskip(item: DisplayItem): void { this.skipOperation(item, 'Unskip'); }
  stop(item: DisplayItem): void { this.skipOperation(item, 'Stop'); }
  unstop(item: DisplayItem): void { this.skipOperation(item, 'Unstop'); }

  showConfiguration(item: DisplayItem): void {
    const inst = item.instructionRef;
    if (!inst) return;
    if (inst.TYPE === 'Job') {
      const job = this.jobs?.[inst.jobName];
      if (!job?.executable) return;
      const exe = job.executable;
      const isScript = exe.TYPE === 'ShellScriptExecutable' || exe.internalType === 'JavaScript_Graal' || exe.internalType === 'Python_Graal';
      const nzData = {
        data: isScript ? exe.script : exe.className,
        isScript,
        agentName: inst.agentName || job.agentName,
        subagentClusterId: inst.subagentClusterId || job.subagentClusterId,
        workflowPath: this.workFlowJson?.path,
        admissionTime: job.admissionTimeScheme,
        timezone: this.workFlowJson?.timeZone,
        jobName: inst.jobName,
        mode: exe.TYPE === 'ShellScriptExecutable' ? 'shell' : exe.TYPE === 'Python' ? 'python' : 'javascript',
        readonly: true,
        schedulerId: this.schedulerId,
      };
      this.modal.create({ nzTitle: undefined, nzContent: ScriptModalComponent, nzClassName: 'lg script-editor2', nzData, nzFooter: null, nzAutofocus: null, nzClosable: false, nzMaskClosable: false });
    } else if (inst.TYPE === 'Sleep') {
      this.modal.create({ nzTitle: undefined, nzContent: ScriptModalComponent, nzClassName: 'lg script-editor2', nzData: { duration: inst.duration, readonly: true, timezone: this.workFlowJson?.timeZone, workflowPath: this.workFlowJson?.path }, nzFooter: null, nzAutofocus: null, nzClosable: false, nzMaskClosable: false });
    }
  }

  showDocumentation(item: DisplayItem): void {
    if (item.instructionRef?.documentationName) {
      this.coreService.showDocumentation(item.instructionRef.documentationName, this.preferences);
    }
  }

  viewHistory(item: DisplayItem): void {
    this.onClick.emit({ jobName: item.instructionRef?.jobName, path: this.workFlowJson?.path });
  }

  showLog(order: any): void {
    if (order.state && order.state._text !== 'SCHEDULED' && order.state._text !== 'PENDING') {
      this.coreService.showOrderLogWindow(order.orderId, this.schedulerId, this.workFlowJson?.path, this.viewContainerRef);
    }
  }

  showAllOrders(orders: any[]): void {
    this.onClick.emit({ action: 'showOrders', orders });
  }

  changedHandler(_data: any): void {
    this.cdr.markForCheck();
  }

  // ── Public ────────────────────────────────────────────────────────────────

  get hasActiveOutsideWindow(): boolean {
    return this.anchorIndex >= 0 &&
      (this.anchorIndex < this.windowStart || this.anchorIndex >= this.windowEnd);
  }

  get activeIsAbove(): boolean {
    return this.anchorIndex >= 0 && this.anchorIndex < this.windowStart;
  }

  jumpToActive(): void {
    if (this.anchorIndex < 0) return;
    this.userMovedWindow = false;
    this.centerWindowOn(this.anchorIndex);
    const seg = this.segments[this.anchorIndex];
    if (!seg.isExpanded) {
      this.expandedByName.set(seg.name, true);
      seg.isExpanded = true;
      this.recomputeAllHeights();
    }
    this.updateVisibleSegments();
    this.cdr.markForCheck();
  }

  toggleSegment(seg: SegmentItem): void {
    seg.isExpanded = !seg.isExpanded;
    this.expandedByName.set(seg.name, seg.isExpanded);
    this.recomputeAllHeights();
    this.cdr.markForCheck();
  }

  loadNext(): void {
    if (!this.hasNext) return;
    this.userMovedWindow = true;
    this.windowStart = this.windowEnd;
    this.windowEnd = Math.min(this.windowEnd + this.WINDOW_SIZE, this.segments.length);
    this.updateVisibleSegments();
    this.cdr.markForCheck();
  }

  loadPrev(): void {
    if (!this.hasPrev) return;
    this.userMovedWindow = true;
    this.windowEnd = this.windowStart;
    this.windowStart = Math.max(0, this.windowStart - this.WINDOW_SIZE);
    this.updateVisibleSegments();
    this.cdr.markForCheck();
  }
}
