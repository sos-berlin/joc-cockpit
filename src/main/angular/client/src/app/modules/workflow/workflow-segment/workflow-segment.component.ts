import { ChangeDetectorRef, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CoreService } from '../../../services/core.service';

interface SegmentItem {
  id: string;
  name: string;
  jobCount: number;
  orderCount: number;
  ordersSummary: { state: string; count: number; severity: number }[];
  worstSeverity: number;
  workFlowJson: any;
  isExpanded: boolean;
  children: SegmentItem[];
}

@Component({
  standalone: false,
  selector: 'app-workflow-segment',
  templateUrl: './workflow-segment.component.html',
})
export class WorkflowSegmentComponent implements OnChanges {
  @Input() workFlowJson: any = {};
  @Input() orders: any[] = [];
  @Input() jobs: any = {};
  @Input() permission: any = {};
  @Input() preferences: any = {};
  @Input() controllerId: any;
  @Input() workflowFilters: any = {};
  @Input() orderPreparation: any = {};
  @Input() recursiveCals: any = [];
  @Input() reload: boolean;
  @Input() jobMap: any;

  segments: SegmentItem[] = [];

  constructor(public coreService: CoreService, private cdr: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['workFlowJson'] || changes['orders']) {
      this.buildSegments();
    }
  }

  private countJobs(instructions: any[]): number {
    if (!Array.isArray(instructions)) return 0;
    let count = 0;
    for (const inst of instructions) {
      if (inst.TYPE === 'Job') count++;
      count += this.countJobs(inst.instructions);
      if (inst.block?.instructions) count += this.countJobs(inst.block.instructions);
      if (inst.then) count += this.countJobs(inst.then.instructions);
      if (inst.else) count += this.countJobs(inst.else.instructions);
      if (inst.catch) count += this.countJobs(inst.catch.instructions);
      if (inst.body) count += this.countJobs(inst.body.instructions);
      if (inst.branches) {
        for (const b of inst.branches) count += this.countJobs(b.instructions);
      }
    }
    return count;
  }

  private buildOrderSummary(orders: any[]): { summary: { state: string; count: number; severity: number }[]; worstSeverity: number } {
    const map: { [key: string]: { count: number; severity: number } } = {};
    let worstSeverity = 0;
    for (const o of orders) {
      const key = o.state?._text || 'UNKNOWN';
      const sev = o.state?.severity || 0;
      if (!map[key]) map[key] = { count: 0, severity: sev };
      map[key].count++;
      if (sev > worstSeverity) worstSeverity = sev;
    }
    const summary = Object.entries(map).map(([state, v]) => ({ state, count: v.count, severity: v.severity }));
    return { summary, worstSeverity };
  }

  private buildSegments(): void {
    if (!this.workFlowJson?.instructions) {
      this.segments = [];
      return;
    }

    const orders = this.orders || [];
    const allInstructions: any[] = this.workFlowJson.instructions;
    let idCounter = 0;

    const buildTree = (instructions: any[], isRoot: boolean): SegmentItem[] => {
      if (!Array.isArray(instructions)) return [];
      const result: SegmentItem[] = [];
      for (const inst of instructions) {
        if (inst.TYPE === 'Segment') {
          const childInstructions = inst.block?.instructions || inst.instructions || [];
          const { summary, worstSeverity } = this.buildOrderSummary(orders);
          result.push({
            id: 'seg_' + (idCounter++),
            name: inst.label || inst.name || 'Segment',
            jobCount: this.countJobs(childInstructions),
            orderCount: orders.length,
            ordersSummary: summary,
            worstSeverity,
            workFlowJson: { ...this.workFlowJson, instructions: childInstructions },
            isExpanded: isRoot && result.length === 0,
            children: buildTree(childInstructions, false),
          });
        } else {
          result.push(...buildTree(inst.instructions || [], false));
          if (inst.block?.instructions) result.push(...buildTree(inst.block.instructions, false));
          if (inst.then?.instructions) result.push(...buildTree(inst.then.instructions, false));
          if (inst.else?.instructions) result.push(...buildTree(inst.else.instructions, false));
          if (inst.catch?.instructions) result.push(...buildTree(inst.catch.instructions, false));
          if (inst.body?.instructions) result.push(...buildTree(inst.body.instructions, false));
          if (inst.branches) {
            for (const b of inst.branches) result.push(...buildTree(b.instructions || [], false));
          }
        }
      }
      return result;
    };

    const tree = buildTree(allInstructions, true);

    if (tree.length === 0) {
      const { summary, worstSeverity } = this.buildOrderSummary(orders);
      this.segments = [{
        id: 'seg_all',
        name: this.workFlowJson.name || 'All Jobs',
        jobCount: this.countJobs(allInstructions),
        orderCount: orders.length,
        ordersSummary: summary,
        worstSeverity,
        workFlowJson: this.workFlowJson,
        isExpanded: true,
        children: [],
      }];
    } else {
      this.segments = tree;
    }
    this.cdr.markForCheck();
  }

  toggleSegment(seg: SegmentItem): void {
    seg.isExpanded = !seg.isExpanded;
    this.cdr.markForCheck();
  }
}
