import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
} from '@angular/core';
import { CoreService } from '../../../services/core.service';

interface FlatInstruction {
  label: string;
  kind: 'job' | 'container';
  icon: string;
  position: any[];
  positionKey: string;
  positionString?: string;
  breadcrumb: string;
  instructionRef: any;
}

interface MagnetSlot {
  label: string;
  kind: 'job' | 'container';
  icon: string;
  isCurrent: boolean;
  isPast: boolean;
  instructionRef: any;
}

interface MagnetCard {
  orderId: string;
  order: any;
  slots: MagnetSlot[];
  breadcrumb: string;
  hasMore: { before: boolean; after: boolean };
}

@Component({
  standalone: false,
  selector: 'app-workflow-magnet',
  templateUrl: './workflow-magnet.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkflowMagnetComponent implements OnChanges, OnDestroy {
  @Input() workFlowJson: any = {};
  @Input() orders: any[] = [];
  @Input() permission: any = {};
  @Input() preferences: any = {};
  @Input() schedulerId: string = '';

  magnetCards: MagnetCard[] = [];
  activeOrders: any[] = [];
  drawerVisible = false;
  drawerSelection = new Set<string>();

  get isAllDrawerSelected(): boolean {
    return this.activeOrders.length > 0 &&
           this.activeOrders.every(o => this.drawerSelection.has(o.orderId));
  }

  get isSomeDrawerSelected(): boolean {
    return this.drawerSelection.size > 0 && !this.isAllDrawerSelected;
  }

  isDrawerSelected(orderId: string): boolean {
    return this.drawerSelection.has(orderId);
  }

  toggleDrawerSelection(orderId: string): void {
    if (this.drawerSelection.has(orderId)) {
      this.drawerSelection.delete(orderId);
      this.getDirectChildren(orderId).forEach(c => this.drawerSelection.delete(c.orderId));
    } else {
      this.drawerSelection.add(orderId);
    }
    this.cdr.markForCheck();
  }

  toggleDrawerChildSelection(parentId: string, event: Event): void {
    event.stopPropagation();
    const children = this.getDirectChildren(parentId);
    const allSelected = children.every(c => this.drawerSelection.has(c.orderId));
    children.forEach(c => allSelected
      ? this.drawerSelection.delete(c.orderId)
      : this.drawerSelection.add(c.orderId));
    this.cdr.markForCheck();
  }

  toggleSelectAllInDrawer(checked: boolean): void {
    if (checked) {
      this.activeOrders.forEach(o => this.drawerSelection.add(o.orderId));
    } else {
      this.drawerSelection.clear();
    }
    this.cdr.markForCheck();
  }

  applyMagnetFromDrawer(): void {
    this.magnetizedOrderIds = new Set(this.drawerSelection);
    this.buildMagnetCards();
    this.closeDrawer();
  }

  get visibleOrders(): any[] {
    return this.activeOrders.slice(0, 3);
  }

  get hiddenOrderCount(): number {
    return Math.max(0, this.activeOrders.length - 3);
  }

  openDrawer(): void {
    this.drawerSelection = new Set(this.magnetizedOrderIds);
    this.drawerVisible = true;
    this.cdr.markForCheck();
  }

  closeDrawer(): void {
    this.drawerVisible = false;
    this.cdr.markForCheck();
  }

  // ── M5: Parent/child helpers ──────────────────────────────────────────────

  hasChildren(orderId: string): boolean {
    const prefix = orderId + '|';
    return this.activeOrders.some(o => o.orderId.startsWith(prefix));
  }

  childCount(orderId: string): number {
    const prefix = orderId + '|';
    return this.activeOrders.filter(o => o.orderId.startsWith(prefix)).length;
  }

  isChildOrder(order: any): boolean {
    return this.activeOrders.some(p => p !== order && order.orderId.startsWith(p.orderId + '|'));
  }

  getDirectChildrenPublic(parentId: string): any[] {
    return this.getDirectChildren(parentId);
  }

  areChildrenMagnetized(parentId: string): boolean {
    const children = this.getDirectChildren(parentId);
    return children.length > 0 && children.every(c => this.magnetizedOrderIds.has(c.orderId));
  }

  toggleChildrenForParent(parentId: string, event: Event): void {
    event.stopPropagation();
    const children = this.getDirectChildren(parentId);
    if (this.areChildrenMagnetized(parentId)) {
      children.forEach(c => this.magnetizedOrderIds.delete(c.orderId));
    } else {
      children.forEach(c => this.magnetizedOrderIds.add(c.orderId));
    }
    this.buildMagnetCards();
    this.cdr.markForCheck();
  }

  get hasAnyParentWithChildren(): boolean {
    return this.activeOrders.some(o => !this.isChildOrder(o) && this.hasChildren(o.orderId));
  }

  get areAllChildrenMagnetized(): boolean {
    const parents = this.activeOrders.filter(o => !this.isChildOrder(o) && this.hasChildren(o.orderId));
    return parents.length > 0 && parents.every(p => this.areChildrenMagnetized(p.orderId));
  }

  toggleAllChildren(): void {
    const parents = this.activeOrders.filter(o => !this.isChildOrder(o) && this.hasChildren(o.orderId));
    if (this.areAllChildrenMagnetized) {
      parents.forEach(p => this.getDirectChildren(p.orderId).forEach(c => this.magnetizedOrderIds.delete(c.orderId)));
    } else {
      parents.forEach(p => this.getDirectChildren(p.orderId).forEach(c => this.magnetizedOrderIds.add(c.orderId)));
    }
    this.buildMagnetCards();
    this.cdr.markForCheck();
  }

  private applyAutoMagnet(): void {
    const states: string[] = this.preferences?.magnetAutoStates || [];
    if (states.length === 0) return;
    const includeChildren = !!this.preferences?.magnetAutoIncludeChildren;
    for (const order of this.activeOrders) {
      const stateText = order.state?._text;
      if (stateText && states.includes(stateText)) {
        this.magnetizedOrderIds.add(order.orderId);
        if (includeChildren) {
          this.getDirectChildren(order.orderId).forEach(c => this.magnetizedOrderIds.add(c.orderId));
        }
      }
    }
  }

  private get window(): number {
    const w = this.preferences?.magnetWindow;
    return (typeof w === 'number' && w >= 1 && w <= 5) ? Math.round(w) : 3;
  }

  private magnetizedOrderIds = new Set<string>();
  private flatInstructions: FlatInstruction[] = [];
  private allSortedOrders: any[] = [];
  private _refreshTimer: any = null;

  constructor(public coreService: CoreService, private cdr: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['workFlowJson']) {
      this.buildFlatInstructions();
    }
    if (changes['orders'] || changes['workFlowJson']) {
      if (this._refreshTimer) clearTimeout(this._refreshTimer);
      this._refreshTimer = setTimeout(() => {
        this.allSortedOrders = this.sortByParentChild(this.orders || []);
        this.activeOrders = this.allSortedOrders.filter(o => o.position != null);
        this.applyAutoMagnet();
        this.buildMagnetCards();
        this._refreshTimer = null;
        this.cdr.markForCheck();
      }, 150);
    }
  }

  ngOnDestroy(): void {
    if (this._refreshTimer) clearTimeout(this._refreshTimer);
  }

  toggleMagnet(orderId: string): void {
    if (this.magnetizedOrderIds.has(orderId)) {
      this.magnetizedOrderIds.delete(orderId);
      this.getDirectChildren(orderId).forEach(c => this.magnetizedOrderIds.delete(c.orderId));
    } else {
      this.magnetizedOrderIds.add(orderId);
    }
    this.buildMagnetCards();
    this.cdr.markForCheck();
  }

  isMagnetized(orderId: string): boolean {
    return this.magnetizedOrderIds.has(orderId);
  }

  releaseMagnet(orderId: string): void {
    this.magnetizedOrderIds.delete(orderId);
    this.getDirectChildren(orderId).forEach(c => this.magnetizedOrderIds.delete(c.orderId));
    this.buildMagnetCards();
    this.cdr.markForCheck();
  }

  // ── M4: Sort children immediately after their parent ─────────────────────

  private sortByParentChild(orders: any[]): any[] {
    const sorted: any[] = [];
    const visited = new Set<string>();

    const addWithChildren = (order: any) => {
      if (visited.has(order.orderId)) return;
      visited.add(order.orderId);
      sorted.push(order);
      this.getDirectChildren(order.orderId, orders).forEach(child => addWithChildren(child));
    };

    const roots = orders.filter(o =>
      !orders.some(p => p !== o && o.orderId.startsWith(p.orderId + '|'))
    );
    roots.forEach(r => addWithChildren(r));
    orders.filter(o => !visited.has(o.orderId)).forEach(o => sorted.push(o));
    return sorted;
  }

  // Direct children only (one `|` deeper, no intermediate parent in pool)
  private getDirectChildren(parentId: string, pool?: any[]): any[] {
    const source = pool || this.activeOrders;
    const prefix = parentId + '|';
    return source.filter(o => {
      if (!o.orderId.startsWith(prefix)) return false;
      const remainder = o.orderId.slice(prefix.length);
      return !remainder.includes('|');
    });
  }

  // ── Flat instruction list ─────────────────────────────────────────────────

  private buildFlatInstructions(): void {
    const result: FlatInstruction[] = [];
    this.walkInstructions(this.workFlowJson?.instructions || [], [], '', result);
    this.flatInstructions = result;
  }

  private walkInstructions(instructions: any[], path: any[], breadcrumb: string, result: FlatInstruction[]): void {
    if (!Array.isArray(instructions)) return;
    for (let i = 0; i < instructions.length; i++) {
      const inst = instructions[i];
      const type: string = inst.TYPE || '';
      if (!type || type === 'EndSegment' || type === 'ImplicitEnd' ||
          type === 'EndLock' || type === 'EndOptions' || type === 'EndAdmissionTime' ||
          type === 'Join' || type === 'ForkJoin') continue;

      if (type === 'Segment') {
        const segName = inst.label || inst.name || 'Segment';
        const childBc = breadcrumb ? breadcrumb + ' › ' + segName : segName;
        const children = inst.block?.instructions || inst.instructions || [];
        this.walkInstructions(children, [...path, i], childBc, result);
        continue;
      }

      const currentPath = inst.position || [...path, i];
      const posKey = JSON.stringify(currentPath);
      const label = inst.label || inst.jobName || inst.name || type;
      const kind: 'job' | 'container' = type === 'Job' ? 'job' : 'container';
      const icon = this.iconForType(type);
      result.push({ label, kind, icon, position: currentPath, positionKey: posKey, positionString: inst.positionString, breadcrumb, instructionRef: inst });

      const childInstr = inst.instructions || inst.block?.instructions || [];
      if (type === 'Fork' || type === 'ForkList') {
        for (const branch of inst.branches || []) {
          const bName = branch.name || branch.id || 'Branch';
          const bBc = breadcrumb ? breadcrumb + ' › ' + bName : bName;
          const bPath = branch.position || [...currentPath, bName];
          this.walkInstructions(branch.instructions || [], bPath, bBc, result);
        }
      } else if (type === 'If') {
        if (inst.then?.instructions) {
          this.walkInstructions(inst.then.instructions, [...currentPath, 'then'], breadcrumb, result);
        }
        if (inst.else?.instructions) {
          this.walkInstructions(inst.else.instructions, [...currentPath, 'else'], breadcrumb, result);
        }
      } else if (type === 'Try') {
        if (childInstr.length) {
          this.walkInstructions(childInstr, [...currentPath, 'try+0'], breadcrumb, result);
        }
        if (inst.catch?.instructions?.length) {
          this.walkInstructions(inst.catch.instructions, [...currentPath, 'catch'], breadcrumb, result);
        }
      } else if (type === 'CaseWhen') {
        for (const c of inst.cases || []) {
          if (c.then?.instructions) {
            this.walkInstructions(c.then.instructions, [...currentPath, 'when', c.predicate || ''], breadcrumb, result);
          }
        }
      } else if (childInstr.length) {
        this.walkInstructions(childInstr, [...currentPath, 'try+0'], breadcrumb, result);
      }
    }
  }

  private iconForType(type: string): string {
    switch (type) {
      case 'Job': return 'fa-cog';
      case 'Fork': case 'ForkList': return 'fa-code-fork';
      case 'If': return 'fa-random';
      case 'Try': return 'fa-shield';
      case 'Retry': return 'fa-repeat';
      case 'Lock': return 'fa-lock';
      case 'Cycle': return 'fa-refresh';
      case 'Options': case 'AdmissionTime': return 'fa-clock-o';
      case 'StickySubagent': return 'fa-link';
      case 'Finish': return 'fa-check-circle';
      case 'Fail': return 'fa-ban';
      case 'Prompt': return 'fa-comment';
      case 'Sleep': return 'fa-clock-o';
      default: return 'fa-circle-o';
    }
  }

  // ── M6: Branch-aware flat list for a specific order ───────────────────────

  private getWindowFlatList(orderPosition: any[]): FlatInstruction[] {
    if (!Array.isArray(orderPosition) || orderPosition.length === 0) {
      return this.flatInstructions;
    }
    return this.flatInstructions.filter(f => {
      const fPos = f.position;
      for (let i = 0; i < Math.min(orderPosition.length, fPos.length); i++) {
        const oPart = orderPosition[i];
        const fPart = fPos[i];
        // Two string parts at the same level = branch identifiers; if they differ under the same ancestor = parallel branch
        if (typeof oPart === 'string' && typeof fPart === 'string' && oPart !== fPart) {
          if (JSON.stringify(orderPosition.slice(0, i)) === JSON.stringify(fPos.slice(0, i))) {
            return false;
          }
        }
      }
      return true;
    });
  }

  // ── Magnet card builder ───────────────────────────────────────────────────

  private buildMagnetCards(): void {
    this.magnetCards = [];
    for (const order of this.allSortedOrders) {
      if (!this.magnetizedOrderIds.has(order.orderId)) continue;
      const posKey = JSON.stringify(order.position);
      const effectiveList = this.getWindowFlatList(order.position);
      let idx = effectiveList.findIndex(f => f.positionKey === posKey);
      if (idx < 0 && order.positionString) {
        idx = effectiveList.findIndex(f => f.positionString === order.positionString);
      }
      if (idx < 0) {
        this.magnetCards.push({ orderId: order.orderId, order, slots: [], breadcrumb: '', hasMore: { before: false, after: false } });
        continue;
      }
      const current = effectiveList[idx];
      const start = Math.max(0, idx - this.window);
      const end = Math.min(effectiveList.length - 1, idx + this.window);
      const slots: MagnetSlot[] = [];
      for (let j = start; j <= end; j++) {
        const f = effectiveList[j];
        slots.push({ label: f.label, kind: f.kind, icon: f.icon, isCurrent: j === idx, isPast: j < idx, instructionRef: f.instructionRef });
      }
      this.magnetCards.push({ orderId: order.orderId, order, slots, breadcrumb: current.breadcrumb, hasMore: { before: start > 0, after: end < effectiveList.length - 1 } });
    }
  }
}
