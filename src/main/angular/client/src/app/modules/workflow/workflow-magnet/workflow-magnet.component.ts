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

const WINDOW = 3;

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

  private magnetizedOrderIds = new Set<string>();
  private flatInstructions: FlatInstruction[] = [];
  private _refreshTimer: any = null;

  constructor(public coreService: CoreService, private cdr: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['workFlowJson']) {
      this.buildFlatInstructions();
    }
    if (changes['orders'] || changes['workFlowJson']) {
      if (this._refreshTimer) clearTimeout(this._refreshTimer);
      this._refreshTimer = setTimeout(() => {
        this.activeOrders = (this.orders || []).filter(o => o.position != null);
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
    this.buildMagnetCards();
    this.cdr.markForCheck();
  }

  // ── Flat instruction list ────────────────────────────────────────────────

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
      const label = inst.label || inst.jobName || type;
      const kind: 'job' | 'container' = type === 'Job' ? 'job' : 'container';
      const icon = this.iconForType(type);
      result.push({ label, kind, icon, positionKey: posKey, positionString: inst.positionString, breadcrumb, instructionRef: inst });

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

  // ── Magnet card builder ──────────────────────────────────────────────────

  private buildMagnetCards(): void {
    this.magnetCards = [];
    for (const order of this.orders || []) {
      if (!this.magnetizedOrderIds.has(order.orderId)) continue;
      const posKey = JSON.stringify(order.position);
      let idx = this.flatInstructions.findIndex(f => f.positionKey === posKey);
      if (idx < 0 && order.positionString) {
        idx = this.flatInstructions.findIndex(f => f.positionString === order.positionString);
      }
      if (idx < 0) {
        this.magnetCards.push({ orderId: order.orderId, order, slots: [], breadcrumb: '', hasMore: { before: false, after: false } });
        continue;
      }
      const current = this.flatInstructions[idx];
      const start = Math.max(0, idx - WINDOW);
      const end = Math.min(this.flatInstructions.length - 1, idx + WINDOW);
      const slots: MagnetSlot[] = [];
      for (let j = start; j <= end; j++) {
        const f = this.flatInstructions[j];
        slots.push({ label: f.label, kind: f.kind, icon: f.icon, isCurrent: j === idx, isPast: j < idx, instructionRef: f.instructionRef });
      }
      this.magnetCards.push({ orderId: order.orderId, order, slots, breadcrumb: current.breadcrumb, hasMore: { before: start > 0, after: end < this.flatInstructions.length - 1 } });
    }
  }
}
