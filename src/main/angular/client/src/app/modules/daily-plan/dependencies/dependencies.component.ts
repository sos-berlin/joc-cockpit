import {
  Component,
  SimpleChanges,
  Input,
  ViewChild,
  ElementRef,
  Output,
  EventEmitter,
  ChangeDetectorRef
} from '@angular/core';
import {NzModalRef, NzModalService} from "ng-zorro-antd/modal";
import {CoreService} from "../../../services/core.service";
import {NzTreeNodeOptions} from 'ng-zorro-antd/tree';
import {Observable, of, Subject, Subscription} from 'rxjs';
import {DataService} from '../../../services/data.service';
import {NzDrawerComponent} from "ng-zorro-antd/drawer";
import {WorkflowService} from "../../../services/workflow.service";
import {OrderPipe} from "../../../pipes/core.pipe";
import {Data} from "@angular/router";
import {PostModalComponent} from '../../resource/board/board.component';
import {CommentModalComponent} from 'src/app/components/comment-modal/comment.component';
import {ConfirmModalComponent} from 'src/app/components/comfirm-modal/confirm.component';
import {catchError, debounceTime, map, switchMap, takeUntil} from "rxjs/operators";
import {TranslateService} from "@ngx-translate/core";
import {InventoryObject} from "../../../models/enums";
import {
  BoardState,
  buildDependencyGraph,
  computeLevels,
  DepEdge,
  DepGraph,
  DepGroup,
  DepNode,
  DepState,
  traverse,
  boardCounts,
  boardStateOf,
  groupBoards,
  PlanOrder
} from './dependency-graph.model';

declare const $: any;

/** One row of an opened chain. */
export interface DependencyStep {
  kind: 'step';
  node: DepNode;
  /** stage in the chain (1 = start); shown only on the first workflow of a stage */
  stage: number;
  showStage: boolean;
  /** 1 when the workflow is one of several receivers of the same notice */
  indent: number;
  posts: string[];
  /** from = null: no workflow posts this notice in this Plan */
  waits: { board: string; from: string | null; kind: string; boardState: BoardState; fromState: DepState; unmatched: boolean }[];
  blocked: boolean;
}

export interface DependencyStepHeader {
  kind: 'header';
  count: number;
  boards: string[];
}

export interface DependencyStepNote {
  kind: 'note';
  blockType: BlockType;
  /** true: the orders are only planned and will wait; false: an order already waits */
  later: boolean;
  /** workflow without order (noOrder) */
  blocker: string | null;
  /** notice that nobody posts (noPoster) */
  board: string | null;
  blocked: string;
  downstream: number;
}

export interface DependencyStepFold {
  kind: 'fold';
  key: string;
  count: number;
  from: number;
  to: number;
  first: string;
  last: string;
  state: DepState;
}

export type DependencyChainRow = DependencyStep | DependencyStepHeader | DependencyStepNote | DependencyStepFold;

/**
 * Why a Critical Path cannot complete:
 * - noOrder: a workflow waits for a notice whose posting workflow has no order in this Plan (or a failed order)
 * - noPoster: a workflow waits for a notice that no workflow posts in this Plan
 */
export type BlockType = 'noOrder' | 'noPoster';

/** Health of a Critical Path, most urgent first. */
export type PathHealth = 'intervention' | 'waiting' | 'ok' | 'inactive';

export interface PathStatus {
  health: PathHealth;
  key: string;
  params: any;
  blockType: BlockType | null;
}

const HEALTH_RANK: Record<PathHealth, number> = {intervention: 0, waiting: 1, ok: 2, inactive: 3};

/** Presentation data of a Critical Path, built from the current response only when needed. */
interface GroupView {
  order: DepNode[];
  rows: DependencyChainRow[];
  blockedStage: number;
  /** stage of the workflow without order (issue: name the missing workflow with its own step) */
  blockerStage: number;
  blockType: BlockType | null;
  /** the blocked workflow's orders have not reached the notice instruction yet */
  blockLater: boolean;
  blocker: string | null;
  blockerBoard: string | null;
  blockedName: string | null;
  stripParts?: { state: string; count: number }[];
}

/** linear runs longer than this are folded; the first and last FOLD_KEEP steps stay visible */
const FOLD_MIN_LENGTH = 8;
const FOLD_KEEP = 2;
/** above this many workflows the progress strip shows one proportional part per state */
const STRIP_SEGMENT_LIMIT = 60;
/** order of the parts in a compact progress strip */
const STRIP_STATES = ['failed', 'action', 'expecting', 'normal', 'none'];

@Component({
  standalone: false,
  selector: 'app-dependencies',
  templateUrl: './dependencies.component.html',
  styleUrl: './dependencies.component.scss',
})
export class DependenciesComponent {
  @Input() parentLoaded: boolean = false;
  @Input() schedulerId: any;
  @Input() preferences: any;
  @Input() permission: any;
  @Input() isToggle: any;
  @Output() checkedNotices = new EventEmitter<any>();

  selectedDate: Date;
  planSchemaId: any;
  isClosed: false;
  isOpen: false;
  isLoaded: boolean;
  data: any;
  plansFilters: any;
  noticeBoards: any[] = [];
  noticeSpaceKey: any[] = [];
  loading: boolean;
  allChecked = false;
  searchValue = '';
  indeterminate = false;
  isVisible = false;
  noticePath: any;
  isPathDisplay = true;
  checked = false;
  listOfCurrentPageData: readonly Data[] = [];
  setOfCheckedId = new Set<number>();
  mapOfCheckedId = new Set();
  pageSize: number = 10;
  sideBar: any = {orders: []};
  private lastLoadedMonthYear: string = '';

  private depPendingHTTPRequests$ = new Subject<void>();
  private subscription1: Subscription;
  private searchSubscription: Subscription;
  private searchInput$ = new Subject<string>();
  private refreshTimer: any;
  workflowData: any;
  totalWorkflows: number = 0;
  totalNotices: number = 0;

  // ---- JOC-2320: Critical Paths (workflows connected through notices)
  model: DepGraph | null = null;
  /** groups after the Notices Announced/Present buttons and the search */
  visibleGroups: DepGroup[] = [];
  pagedGroups: DepGroup[] = [];
  private expandedGroups = new Set<string>();
  private openedFolds = new Set<string>();
  private groupViews = new Map<string, GroupView>();
  private statusCache = new Map<string, PathStatus>();
  private searchText = '';
  /** number of visible Critical Paths per health status, for the summary above the list */
  healthCounts: Record<string, number> = {intervention: 0, waiting: 0, ok: 0, inactive: 0};
  /** visible Critical Paths that need or may need attention (health other than "No Orders") */
  activeGroups: DepGroup[] = [];
  /** visible Critical Paths without orders; folded into one row at the end of the list */
  inactiveGroups: DepGroup[] = [];
  showInactive = false;
  /** visible Critical Paths that cannot complete (dependency without matching order or poster) */
  blockedPathCount = 0;
  /** timing of the last load, for measuring the performance impact (see console and footer tooltip) */
  lastPerf: { requestMs: number; buildMs: number; workflows: number; dependencies: number; paths: number } | null = null;

  constructor(
    public coreService: CoreService,
    private orderPipe: OrderPipe,
    private cd: ChangeDetectorRef,
    private dataService: DataService,
    public workflowService: WorkflowService,
    private modal: NzModalService,
    private translate: TranslateService,
  ) {
    this.subscription1 = dataService.eventAnnounced$.subscribe(res => {
      if (res) {
        this.refresh(res);
      }
    });
  }

  ngOnInit(): void {
    this.isPathDisplay = sessionStorage['displayFoldersInViews'] == 'false';
    const d = new Date().setHours(0, 0, 0, 0);
    this.selectedDate = new Date(d);
    this.plansFilters = this.coreService.getPlansTab();
    this.pageSize = this.plansFilters.filter.entryPerPage || 10;
    if (!this.plansFilters.filter.currentPage) {
      this.plansFilters.filter.currentPage = 1;
    }
    this.searchSubscription = this.searchInput$.pipe(debounceTime(300)).subscribe(() => this.applyFilters());
    this.initConf();
    const dailyPlanFilters = this.coreService.getDailyPlanTab();
    if (dailyPlanFilters.tabIndex === 2) {
      this.loadAdditionaSnapshotlData();
    } else {
      this.loadAdditionalData();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['parentLoaded'] && changes['parentLoaded'].currentValue) {
      setTimeout(() => {
        this.initConf();
        this.loadAdditionaSnapshotlData();
      }, 300);
    }
  }

  ngOnDestroy(): void {
    this.plansFilters.selectedDate = this.selectedDate;
    this.subscription1.unsubscribe();
    this.searchSubscription?.unsubscribe();
    clearTimeout(this.refreshTimer);
    this.depPendingHTTPRequests$.next();
    this.depPendingHTTPRequests$.complete();
  }

  private initConf(): void {
    if (this.plansFilters.selectedDate) {
      this.selectedDate = this.plansFilters.selectedDate;
    } else {
      const d = new Date().setHours(0, 0, 0, 0);
      this.selectedDate = new Date(d);
    }
    setTimeout(() => {
      const dom = $('#full-calendar2');
      if (!dom.data('calendar')) {
        dom['calendar']({
          view: 'month',
          language: this.coreService.getLocale(),
          selectedDate: this.selectedDate,
          clickDay: (e) => {
            this.selectedDate = e.date;
            const formattedDate = this.coreService.getStringDate(this.selectedDate);
            const matchingPlan = this.noticeSpaceKey.find(p =>
              this.coreService.getStringDate(p.startDate) === formattedDate
            );
            this.plansFilters.filter.currentPage = 1;
            this.expandedGroups.clear();
            this.openedFolds.clear();
            if (matchingPlan) {
              this.planSchemaId = matchingPlan.planSchemaId;
              this.isClosed = matchingPlan.isClosed;
              this.isOpen = matchingPlan.isOpen;
              this.loadAdditionaSnapshotlData();
            } else {
              this.planSchemaId = null;
              this.isClosed = false;
              this.isOpen = false;
              this.setWorkflowData(null);
            }
            this.cd.markForCheck();
          },
          renderEnd: (e) => {
            const visibleDate = e?.startDate || new Date();
            const currentMonthYear = `${visibleDate.getFullYear()}-${visibleDate.getMonth()}`;
            if (this.lastLoadedMonthYear !== currentMonthYear) {
              this.lastLoadedMonthYear = currentMonthYear;
              this.loadPlans();
            }
          },
          rangeEnd: (e) => {
          }
        });
      }
    }, 100);
  }

  loadPlans(): void {
    this.isLoaded = false;
    const requestPayload: any = {
      controllerId: this.schedulerId,
      planSchemaIds: ['Global', 'DailyPlan']
    };
    this.coreService.post('plans/ids', requestPayload)
      .subscribe((res) => {
        this.isLoaded = true;
        this.processData(res);
        this.cd.markForCheck();
      });
  }

  setView(view): void {
    this.plansFilters.filter.calView = view;
  }

  processData(data: any): void {
    if (!data || !data.plans) {
      return;
    }
    const planDates = data.plans.map((plan: any) => {
      const noticeSpaceKey = plan.planId?.noticeSpaceKey || '';
      return {
        startDate: this.convertStringToDate(noticeSpaceKey),
        endDate: this.convertStringToDate(noticeSpaceKey),
        color: plan.closed ? 'orange' : 'blue',
        planSchemaId: plan.planId?.planSchemaId,
        isClosed: plan?.state?._text === 'CLOSED',
        isOpen: plan?.state?._text === 'OPEN'
      };
    });
    this.noticeSpaceKey = planDates;
    const formattedSelectedDate = this.coreService.getStringDate(this.selectedDate);
    const matchingPlan = this.noticeSpaceKey.find(p =>
      this.coreService.getStringDate(p.startDate) === formattedSelectedDate
    );
    if (matchingPlan) {
      this.planSchemaId = matchingPlan.planSchemaId;
      this.isClosed = matchingPlan.isClosed;
      this.isOpen = matchingPlan.isOpen;
    } else {
      this.planSchemaId = null;
      this.isClosed = false;
      this.isOpen = false;
    }
    const calendar = $('#full-calendar2').data('calendar');
    if (calendar) {
      calendar.setDataSource(planDates);
    }
  }

  private convertStringToDate(date): any {
    if (typeof date === 'string') {
      return this.coreService.getDate(date);
    } else {
      return date;
    }
  }

  navToWorkflow(workflowName, type): void {
    this.coreService.showWorkflow(workflowName)
  }

  showBoard(board): void {
    this.coreService.showBoard(board);
  }

  onCheckAll(checked: boolean): void {
    this.noticeBoards.forEach(board => board.checked = checked);
    this.updateCheckedStatus();
  }

  updateCheckedStatus(): void {
    const checkedBoards = this.noticeBoards.filter(board => board.checked);
    this.allChecked = checkedBoards.length === this.noticeBoards.length;
    this.indeterminate = checkedBoards.length > 0 && checkedBoards.length < this.noticeBoards.length;
  }

  onSelect(path): void {
    this.isVisible = true;
    this.noticePath = path;
    const reportDrawer = document.querySelector('.report-drawer') as HTMLElement;
    if (reportDrawer) {
      reportDrawer.style.marginRight = '24px';
    }
  }

  closePanel(): void {
    this.isVisible = false;
    const reportDrawer = document.querySelector('.report-drawer') as HTMLElement;
    if (reportDrawer) {
      reportDrawer.style.marginRight = '0px';
    }
  }

  sort(propertyName): void {
    this.plansFilters.filter.reverse = !this.plansFilters.filter.reverse;
    this.plansFilters.filter.sortBy = propertyName;
    this.noticeBoards = this.orderPipe.transform(this.noticeBoards, this.plansFilters.filter.sortBy, this.plansFilters.filter.reverse);
    this.reset();
  }

  reset(): void {
    this.noticeBoards.forEach(board => board.checked = false);
    this.allChecked = false;
    this.indeterminate = false;
  }

  onCurrentPageDataChange(listOfCurrentPageData: readonly Data[]): void {
    this.listOfCurrentPageData = listOfCurrentPageData;
    this.refreshCheckedStatus();
  }

  refreshCheckedStatus(): void {
    const listOfEnabledData = this.listOfCurrentPageData;
    this.checked = listOfEnabledData.every(({path}) => this.setOfCheckedId.has(path));
    this.indeterminate = listOfEnabledData.some(({path}) => this.setOfCheckedId.has(path)) && !this.checked;
  }

  onItemChecked(path: number, checked: boolean): void {
    this.updateCheckedSet(path, checked);
    this.refreshCheckedStatus();
  }

  onAllChecked(checked: boolean): void {
    this.listOfCurrentPageData.forEach(({path}) => this.updateCheckedSet(path, checked));
    this.refreshCheckedStatus();
  }

  updateCheckedSet(path: number, checked: boolean): void {
    if (checked) {
      this.setOfCheckedId.add(path);
    } else {
      this.setOfCheckedId.delete(path);
    }
    const mapOfCheckedId = {mapOfCheckedId: this.mapOfCheckedId, setOfCheckedId: this.setOfCheckedId};
    this.checkedNotices.emit(mapOfCheckedId);
  }

  post(board: any, notice = null, boardType: string): void {
    if (boardType === "Plannable" && notice !== null) {
      const endpoint = 'notices/post';
      const obj: any = {controllerId: this.schedulerId, auditLog: {}};
      const noticeBoardPath = board.path;
      const noticeIds = board.children.map(item => item.id);
      obj.notices = [];
      obj.notices.push({noticeBoardPath: noticeBoardPath, noticeIds: noticeIds});
      this.coreService.post(endpoint, obj).subscribe({
        next: (res) => {
        }
      });
    } else if (boardType === "Plannable" && notice === null) {
      this.modal.create({
        nzTitle: undefined,
        nzContent: PostModalComponent,
        nzClassName: 'lg',
        nzAutofocus: null,
        nzData: {
          board,
          notice,
          controllerId: this.schedulerId,
          preferences: this.preferences,
          singular: true,
          showNoticeId: true
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      });
    } else {
      this.modal.create({
        nzTitle: undefined,
        nzContent: PostModalComponent,
        nzClassName: 'lg',
        nzAutofocus: null,
        nzData: {board, notice, controllerId: this.schedulerId, preferences: this.preferences, singular: true},
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      });
    }
  }

  delete(board, notice): void {
    if (this.preferences.auditLog) {
      const comments = {radio: 'predefined', type: 'Notice Board', operation: 'Delete', name: notice?.id};
      const modal = this.modal.create({
        nzTitle: undefined,
        nzContent: CommentModalComponent,
        nzData: {comments},
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      });
      modal.afterClose.subscribe(result => {
        if (result) {
          this._delete(board, notice, result);
        }
        this.cd.markForCheck();
      });
    } else {
      const modal = this.modal.create({
        nzTitle: undefined,
        nzContent: ConfirmModalComponent,
        nzData: {
          type: 'Delete',
          title: 'delete',
          message: notice ? 'deleteNotice' : 'deleteSelectedNotice',
          objectName: notice?.id
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      });
      modal.afterClose.subscribe((result) => {
        if (result) {
          this._delete(board, notice, {});
        }
        this.cd.markForCheck();
      });
    }
  }

  private _delete(board, notice, comments): void {
    if (notice) {
      this.coreService.post('notice/delete', {
        controllerId: this.schedulerId,
        noticeBoardPath: board.path,
        noticeId: notice.id,
        auditLog: comments
      }).subscribe(() => {
        for (let i = 0; i < board.notices.length; i++) {
          if (board.notices[i].id === notice.id) {
            board.notices.splice(i, 1);
            break;
          }
        }
        board.notices = [...board.notices];
        this.cd.markForCheck();
      });
    } else {
      this.deleteAll(board, comments);
    }
  }

  postAllNotices(): void {
    const paths = Array.from(this.setOfCheckedId);
    this.modal.create({
      nzTitle: undefined,
      nzContent: PostModalComponent,
      nzClassName: 'lg',
      nzAutofocus: null,
      nzData: {paths, controllerId: this.schedulerId, preferences: this.preferences},
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
  }

  private deleteAll(board, comments): void {
    if (board) {
      if (!board.notices) {
        this.getNoticeBoards({noticeBoardPaths: [board.path], controllerId: this.schedulerId}, (data) => {
          if (data && data.length > 0) {
            board.notices = data[0].notices;
            this._deleteAll(board, comments);
          }
        });
      } else {
        this._deleteAll(board, comments);
      }
    }
  }

  private _deleteAll(board, comments): void {
    let ids = [];
    if (board.notices) {
      board.notices.forEach(item => {
        if (item.state && item.state._text !== 'EXPECTED') {
          ids.push(item.id);
        }
      });
    }
    if (ids.length > 0) {
      this.coreService.post('notices/delete', {
        controllerId: this.schedulerId,
        noticeBoardPath: board.path,
        noticeIds: ids,
        auditLog: comments
      }).subscribe(() => {
        board.notices = board.notices.filter(item => item.state && item.state._text === 'EXPECTED');
        board.notices = [...board.notices];
        this.cd.markForCheck();
      });
    }
  }

  private getNoticeBoards(obj, cb): void {
    obj.limit = this.preferences.maxBoardRecords;
    this.coreService.post('notice/boards', obj).subscribe({
      next: (res: any) => {
        cb(res.noticeBoards);
      },
      error: () => {
        cb();
      }
    });
  }

  // ===================================================================== loading

  loadAdditionalData() {
    this.loadData('workflows/boards', {controllerId: this.schedulerId});
  }

  loadAdditionaSnapshotlData() {
    const day = this.coreService.getStringDate(this.selectedDate);
    this.loadData('workflows/boards/snapshot', {
      controllerId: this.schedulerId,
      planSchemaIds: ["Global", "DailyPlan"],
      noticeSpaceKeys: [day],
      // without it the response has no `orders` part: no order details, no failed orders
      includeOrders: true
    }, day);
  }

  /**
   * Orders of the day from the existing daily plan API, for the workflows of the snapshot only.
   * The snapshot lists just the orders that wait at or are due to post a notice; this tells
   * which workflows have an order in the Plan at all. The request schema allows no `limit`,
   * so the response is kept small with `workflowPaths`. A failure does not block the view:
   * it then falls back to the orders of the snapshot.
   */
  private loadPlanOrders(day: string, workflowPaths: string[]): Observable<any[] | null> {
    if (workflowPaths.length === 0) {
      return of([]);
    }
    return this.coreService.post('daily_plan/orders', {
      controllerIds: [this.schedulerId],
      dailyPlanDateFrom: day,
      dailyPlanDateTo: day,
      workflowPaths
    }).pipe(
      map((res: any) => res?.plannedOrderItems || []),
      catchError(() => {
        console.warn('[Dependencies] daily_plan/orders failed; workflows are shown with the orders of the snapshot only.');
        return of(null);
      })
    );
  }

  /** Paths of all workflows in a snapshot response. */
  private snapshotWorkflowPaths(res: any): string[] {
    const paths = new Set<string>();
    ['postingWorkflows', 'expectingWorkflows', 'consumingWorkflows'].forEach(key => {
      (res?.[key] || []).forEach((w: any) => w?.path && paths.add(w.path));
    });
    return Array.from(paths);
  }

  /**
   * Always asks the API: dependencies are resolved live from the Controller and change
   * whenever orders are added or cancelled, so responses are never reused.
   */
  private loadData(url: string, body: any, planDay?: string): void {
    this.isLoaded = false;
    const started = performance.now();
    const snapshot$: Observable<any> = this.coreService.post(url, body);
    // the planned orders are requested for the workflows of the snapshot, so after it
    const request: Observable<[any, any[] | null]> = planDay
      ? snapshot$.pipe(switchMap(res =>
        this.loadPlanOrders(planDay, this.snapshotWorkflowPaths(res)).pipe(map(items => [res, items] as [any, any[] | null]))))
      : snapshot$.pipe(map(res => [res, null] as [any, any[] | null]));
    request.pipe(takeUntil(this.depPendingHTTPRequests$)).subscribe({
      next: ([res, planItems]) => {
        const received = performance.now();
        this.isLoaded = true;
        this.setWorkflowData(res, planItems);
        const built = performance.now();
        this.lastPerf = {
          requestMs: Math.round(received - started),
          buildMs: Math.round(built - received),
          workflows: this.model?.nodes.size || 0,
          dependencies: this.model?.edges.length || 0,
          paths: this.model?.groups.length || 0
        };
        console.debug(`[Dependencies] ${url}: request ${this.lastPerf.requestMs} ms, build ${this.lastPerf.buildMs} ms, ` +
          `${this.lastPerf.workflows} workflows, ${this.lastPerf.dependencies} dependencies, ${this.lastPerf.paths} critical paths`);
        this.cd.markForCheck();
      },
      error: () => {
        this.isLoaded = true;
        this.cd.markForCheck();
      }
    });
  }

  /** Builds the model from the current response; paging, search and opening a path reuse it. */
  private setWorkflowData(res: any, planItems: any[] | null = null): void {
    this.workflowData = res || {};
    this.noticeBoards = res?.noticeBoards ? res.noticeBoards : [];
    this.planItemIndex = new Map((planItems || []).filter(i => i?.orderId).map(i => [i.orderId, i]));
    const planOrders: PlanOrder[] = (planItems || []).map(i => ({
      orderId: i.orderId,
      workflowPath: i.workflowPath || i.workflowId?.path,
      state: i.state?._text || i.state
    }));
    this.model = res ? buildDependencyGraph(res, planOrders) : null;
    this.totalWorkflows = this.model ? this.model.nodes.size : 0;
    this.totalNotices = this.model ? this.model.boardCount : 0;
    this.groupViews.clear();
    this.statusCache.clear();
    this.orderIndex = null;
    if (this.model) {
      // keep paths open across live updates when they still exist
      this.expandedGroups.forEach(id => {
        if (!this.model.groupOf.has(id)) {
          this.expandedGroups.delete(id);
        }
      });
    } else {
      this.expandedGroups.clear();
    }
    this.applyFilters();
  }

  // ===================================================================== search and notice buttons
  // (called from the template; they were dropped by mistake in an earlier revision)

  onSearchChange(): void {
    this.searchInput$.next(this.searchValue);
  }

  clearSearch(): void {
    this.searchValue = '';
    this.applyFilters();
  }

  /** "Notices Announced" (future) and "Notices Present" (present) buttons. */
  setNoticeStatus(status: string): void {
    if (!Array.isArray(this.plansFilters.filter.filterBy)) {
      this.plansFilters.filter.filterBy = [];
    }
    const index = this.plansFilters.filter.filterBy.indexOf(status);
    if (index === -1) {
      this.plansFilters.filter.filterBy.push(status);
    } else {
      this.plansFilters.filter.filterBy.splice(index, 1);
    }
    this.plansFilters.filter.currentPage = 1;
    this.applyFilters();
  }

  /** Notices Announced/Present and the search work on Critical Paths; the model is not rebuilt. */
  private applyFilters(): void {
    const search = (this.searchValue || '').trim().toLowerCase();
    if (search !== this.searchText) {
      // search matches are highlighted and never folded, so opened paths are laid out again
      this.searchText = search;
      this.groupViews.clear();
    }
    const filterBy: string[] = Array.isArray(this.plansFilters?.filter?.filterBy) ? this.plansFilters.filter.filterBy : [];
    const future = filterBy.includes('future');
    const present = filterBy.includes('present');
    const groups = this.model ? this.model.groups : [];
    this.visibleGroups = groups.filter(g => {
      if ((future || present) && !groupBoards(this.model, g).some(b => {
        const c = boardCounts(this.model.boardOf(b));
        return (future && c.announced > 0) || (present && c.posted > 0);
      })) {
        return false;
      }
      return !this.searchText || g.searchText.includes(this.searchText);
    });
    // most urgent first: intervention, waiting, ok, without orders
    this.visibleGroups.sort((a, b) =>
      (HEALTH_RANK[this.groupStatus(a).health] - HEALTH_RANK[this.groupStatus(b).health]) ||
      (b.nodes.length - a.nodes.length) || a.id.localeCompare(b.id));
    this.healthCounts = {intervention: 0, waiting: 0, ok: 0, inactive: 0};
    this.blockedPathCount = 0;
    this.visibleGroups.forEach(g => {
      const st = this.groupStatus(g);
      this.healthCounts[st.health]++;
      if (st.blockType) {
        this.blockedPathCount++;
      }
    });
    this.activeGroups = this.visibleGroups.filter(g => this.groupStatus(g).health !== 'inactive');
    this.inactiveGroups = this.visibleGroups.filter(g => this.groupStatus(g).health === 'inactive');
    this.updatePage();
    this.cd.markForCheck();
  }

  /**
   * Paths without orders are folded into one row; they are listed when the row is opened,
   * when a search is active, or when no other path is left to show.
   */
  get inactiveShown(): boolean {
    return this.showInactive || !!this.searchText || this.activeGroups.length === 0;
  }

  private get pagingList(): DepGroup[] {
    return this.inactiveShown ? [...this.activeGroups, ...this.inactiveGroups] : this.activeGroups;
  }

  get pagingTotal(): number {
    return this.pagingList.length;
  }

  toggleInactive(): void {
    this.showInactive = !this.showInactive;
    this.updatePage();
  }

  private updatePage(): void {
    const list = this.pagingList;
    const pages = Math.max(1, Math.ceil(list.length / this.pageSize));
    if (this.plansFilters.filter.currentPage > pages) {
      this.plansFilters.filter.currentPage = 1;
    }
    const start = (this.plansFilters.filter.currentPage - 1) * this.pageSize;
    this.pagedGroups = list.slice(start, start + this.pageSize);
  }

  onPageIndexChange(newPage: number): void {
    this.plansFilters.filter.currentPage = newPage;
    this.updatePage();
  }

  pageSizeChange(newSize: number): void {
    this.pageSize = newSize;
    this.plansFilters.filter.entryPerPage = newSize;
    this.updatePage();
  }

  // ===================================================================== groups and chains

  isExpanded(g: DepGroup): boolean {
    return this.expandedGroups.has(g.id);
  }

  toggleGroup(g: DepGroup): void {
    if (this.expandedGroups.has(g.id)) {
      this.expandedGroups.delete(g.id);
    } else {
      this.expandedGroups.add(g.id);
    }
  }

  openFold(groupId: string, fold: DependencyStepFold): void {
    this.openedFolds.add(groupId + '|' + fold.key);
    this.groupViews.delete(groupId);
  }

  /** A Critical Path is named after the workflow(s) everything leads to. */
  groupTitle(g: DepGroup): string {
    return this.shortList(g.ends.length ? g.ends : g.nodes);
  }

  groupStart(g: DepGroup): string {
    return this.shortList(g.starts.length ? g.starts : g.nodes);
  }

  /** Uses the same name rule as everywhere else in the view (display folders setting). */
  private shortList(paths: string[]): string {
    const name = (p: string) => this.getFormattedPath(p);
    return paths.length <= 2 ? paths.map(name).join(', ') : `${name(paths[0])} +${paths.length - 1}`;
  }

  /** Translation key with a singular variant ("...One") for a count of 1 (issue: plurals). */
  plural(key: string, count: number): string {
    return count === 1 ? key + 'One' : key;
  }

  /** Key of the note above a blocked step: no workflows after it, one, or several. */
  noteKey(r: DependencyStepNote): string {
    const base = 'dailyPlan.dependencies.message.' + r.blockType + (r.later ? 'Later' : '');
    return r.downstream === 0 ? base + 'None' : this.plural(base, r.downstream);
  }

  /** Progress strip: one segment per workflow up to STRIP_SEGMENT_LIMIT, then one part per state. */
  isCompactStrip(g: DepGroup): boolean {
    return g.nodes.length > STRIP_SEGMENT_LIMIT;
  }

  stripParts(g: DepGroup): { state: string; count: number }[] {
    const v = this.getGroupView(g);
    if (!v.stripParts) {
      const counts: Record<string, number> = {};
      v.order.forEach(n => {
        const st = n.failed ? 'failed' : n.state;
        counts[st] = (counts[st] || 0) + 1;
      });
      v.stripParts = STRIP_STATES.filter(st => counts[st] > 0).map(st => ({state: st, count: counts[st]}));
    }
    return v.stripParts;
  }

  healthKey(g: DepGroup): string {
    return 'dailyPlan.dependencies.health.' + this.groupStatus(g).health;
  }

  /** Workflows of the group in chain order, for the progress strip. */
  groupOrder(g: DepGroup): DepNode[] {
    return this.getGroupView(g).order;
  }

  /** typed loosely for the template, which switches on row.kind */
  chainRows(g: DepGroup): any[] {
    return this.getGroupView(g).rows;
  }

  isBlockedStep(g: DepGroup, node: DepNode): boolean {
    const v = this.getGroupView(g);
    return v.blockedName === node.path;
  }

  /** Health and status text of a Critical Path (cached until the next response). */
  groupStatus(g: DepGroup): PathStatus {
    let st = this.statusCache.get(g.id);
    if (!st) {
      st = this.computeGroupStatus(g, this.getGroupView(g));
      this.statusCache.set(g.id, st);
    }
    return st;
  }

  private computeGroupStatus(g: DepGroup, v: GroupView): PathStatus {
    const status = (health: PathHealth, key: string, params: any = {}): PathStatus =>
      ({health, key: 'dailyPlan.dependencies.status.' + key, params, blockType: v.blockType});
    if (g.failed) {
      const failed = v.order.find(n => n.failed);
      return status('intervention', 'failed', {name: this.getFormattedPath(failed?.path)});
    }
    const later = v.blockLater ? 'Later' : '';
    if (v.blockType === 'noOrder') {
      return status('intervention', 'noOrder' + later, {
        name: this.getFormattedPath(v.blocker), blockerStage: v.blockerStage, stage: v.blockedStage
      });
    }
    if (v.blockType === 'noPoster') {
      return status('intervention', 'noPoster' + later, {name: this.getFormattedPath(v.blockedName), board: this.getFormattedPath(v.blockerBoard)});
    }
    if (g.state === 'action') {
      const count = v.order.filter(n => n.state === 'action').length;
      return status('intervention', count === 1 ? 'actionRequiredOne' : 'actionRequired', {count});
    }
    if (g.state === 'none') {
      return status('inactive', 'noOrders');
    }
    const expecting = v.order.filter(n => n.state === 'expecting').length;
    if (expecting === 0 && g.edges.length > 0 && g.postedEdges === g.edges.length) {
      return status('ok', 'allPosted');
    }
    if (expecting > 0) {
      return status('waiting', expecting === 1 ? 'expectingOne' : 'expecting', {count: expecting});
    }
    return status('waiting', 'pending');
  }

  isSearchMatch(node: DepNode): boolean {
    return !!this.searchText && node.searchText.includes(this.searchText);
  }

  showOrders(node: DepNode): void {
    this.buildOrdersHtml(node.orderIds);
  }

  stateLabelKey(node: DepNode): string {
    return 'dailyPlan.dependencies.state.' + (node.failed ? 'failed' : node.state);
  }

  boardStateKey(state: BoardState): string {
    return 'dailyPlan.dependencies.boardState.' + state;
  }

  private getGroupView(g: DepGroup): GroupView {
    let v = this.groupViews.get(g.id);
    if (!v) {
      v = this.buildGroupView(g);
      this.groupViews.set(g.id, v);
    }
    return v;
  }

  /**
   * Orders the workflows of a group by stage (longest path from the start) and builds the
   * rows of the step list: receivers of the same notice are indented under their poster,
   * the first workflow that waits for a workflow without order is marked, and long
   * uniform runs are folded.
   */
  private buildGroupView(g: DepGroup): GroupView {
    const levels = computeLevels(g.nodes, g.edges);
    const order = g.nodes.map(p => this.model.nodes.get(p))
      .sort((a, b) => (levels.get(a.path) - levels.get(b.path)) || a.path.localeCompare(b.path));
    const inGroup = new Set(g.nodes);
    const incoming = (p: string) => (this.model.incoming.get(p) || []).filter(e => inGroup.has(e.from));
    const successors = (p: string) => new Set((this.model.outgoing.get(p) || []).filter(e => inGroup.has(e.to)).map(e => e.to));

    // first waiting workflow whose notice will not come: the posting workflow has no order in
    // this Plan (or a failed order), or no workflow posts the notice at all
    let blockType: BlockType | null = null;
    let blocker: string | null = null;
    let blockerBoard: string | null = null;
    let blockedName: string | null = null;
    let blockedStage = 0;
    let blockerStage = 0;
    let blockLater = false;
    // Every workflow with orders is checked, not only those whose orders already wait:
    // a planned order will wait as well once it reaches the notice instruction.
    // A notice that is already posted (e.g. manually) fulfils the dependency.
    for (const n of order) {
      if (n.state === 'none') {
        continue;
      }
      const bad = incoming(n.path).find(e => {
        const from = this.model.nodes.get(e.from);
        return e.boardState !== 'posted' && (from.state === 'none' || from.failed);
      });
      const unposted = n.unmatchedNotices.find(b => boardStateOf(this.model.boardOf(b)) !== 'posted');
      if (bad) {
        blockType = 'noOrder';
        blocker = bad.from;
        blockerBoard = bad.board;
      } else if (unposted) {
        blockType = 'noPoster';
        blockerBoard = unposted;
      }
      if (blockType) {
        blockLater = n.state !== 'expecting';
      }
      if (blockType) {
        blockedName = n.path;
        blockedStage = levels.get(n.path) + 1;
        blockerStage = blocker ? levels.get(blocker) + 1 : 0;
        break;
      }
    }

    const steps: DependencyChainRow[] = [];
    const headerDone = new Set<string>();
    let lastStage = -1;
    for (const n of order) {
      const stage = levels.get(n.path) + 1;
      const ins = incoming(n.path);
      const parent = ins[0]?.from;
      let indent = 0;
      if (parent && successors(parent).size > 1) {
        indent = 1;
        if (!headerDone.has(parent)) {
          headerDone.add(parent);
          const boards = Array.from(new Set((this.model.outgoing.get(parent) || []).filter(e => inGroup.has(e.to)).map(e => e.board)));
          steps.push({kind: 'header', count: successors(parent).size, boards});
        }
      }
      if (n.path === blockedName && blockType) {
        steps.push({
          kind: 'note',
          blockType,
          later: blockLater,
          blocker,
          board: blockerBoard,
          blocked: n.path,
          downstream: traverse(this.model, n.path, 0, -1).nodes.size - 1
        });
      }
      steps.push({
        kind: 'step',
        node: n,
        stage,
        showStage: stage !== lastStage,
        indent,
        posts: n.postNotices.filter(b => (this.model.outgoing.get(n.path) || []).some(e => e.board === b && inGroup.has(e.to))),
        waits: [
          ...ins.map(e => ({
            board: e.board,
            from: e.from,
            kind: e.kind,
            boardState: e.boardState,
            fromState: this.model.nodes.get(e.from).state,
            unmatched: false
          })),
          ...n.unmatchedNotices.map(b => ({
            board: b,
            from: null,
            kind: n.consumeNotices.includes(b) && !n.expectNotices.includes(b) ? 'consume' : 'expect',
            boardState: 'none' as BoardState,
            fromState: 'none' as DepState,
            unmatched: true
          }))
        ],
        blocked: n.path === blockedName
      });
      lastStage = stage;
    }
    return {order, rows: this.foldRuns(g.id, steps), blockedStage, blockerStage, blockType, blockLater, blocker, blockerBoard, blockedName};
  }

  /** Folds runs of uniform, unremarkable steps; search matches are never folded. */
  private foldRuns(groupId: string, rows: DependencyChainRow[]): DependencyChainRow[] {
    const plain = (r: DependencyChainRow) => r.kind === 'step' && r.indent === 0 && !r.blocked && r.waits.length <= 1 &&
      !r.waits.some(w => w.unmatched) && !r.node.failed && !this.isSearchMatch(r.node);
    const out: DependencyChainRow[] = [];
    let i = 0;
    while (i < rows.length) {
      const r = rows[i];
      if (!plain(r)) {
        out.push(r);
        i++;
        continue;
      }
      const state = (r as DependencyStep).node.state;
      let j = i;
      while (j < rows.length && plain(rows[j]) && (rows[j] as DependencyStep).node.state === state) {
        j++;
      }
      const run = rows.slice(i, j) as DependencyStep[];
      const key = run[0].node.path;
      if (run.length >= FOLD_MIN_LENGTH && !this.openedFolds.has(groupId + '|' + key)) {
        const hidden = run.slice(FOLD_KEEP, run.length - FOLD_KEEP);
        out.push(...run.slice(0, FOLD_KEEP));
        out.push({
          kind: 'fold', key, count: hidden.length,
          from: hidden[0].stage, to: hidden[hidden.length - 1].stage,
          first: hidden[0].node.path, last: hidden[hidden.length - 1].node.path, state
        });
        out.push(...run.slice(run.length - FOLD_KEEP));
      } else {
        out.push(...run);
      }
      i = j;
    }
    return out;
  }

  // ===================================================================== orders side panel

  private orderIndex: Map<string, any> | null = null;
  /** planned orders of the day by order ID, for orders that are not part of the snapshot */
  private planItemIndex = new Map<string, any>();

  buildOrdersHtml(orders: any[]): void {
    this.sideBar.orders = [];
    (orders || []).forEach(orderId => {
      const orderDetails = this.getOrderDetails(orderId);
      if (orderDetails) {
        this.sideBar.orders.push(orderDetails);
      }
    });
    this.sideBar.isVisible = this.sideBar.orders.length > 0;
  }

  private getOrderDetails(orderId: string): any {
    if (!this.workflowData || !this.workflowData.orders) {
      return this.planItemIndex.get(orderId) || null;
    }
    if (!this.orderIndex) {
      const orders = Array.isArray(this.workflowData.orders)
        ? this.workflowData.orders
        : Object.values(this.workflowData.orders);
      this.orderIndex = new Map(orders.map((o: any) => [o.orderId, o]));
    }
    return this.orderIndex.get(orderId) || this.planItemIndex.get(orderId) || null;
  }

  // ===================================================================== plans and events

  closePlan(): void {
    this.coreService.post('plans/close', {
      controllerId: this.schedulerId,
      planIds: [
        {planSchemaId: this.planSchemaId, noticeSpaceKey: this.coreService.getStringDate(this.selectedDate)}
      ]
    }).subscribe((res) => {
      this.initConf();
      this.loadAdditionalData();
      this.cd.markForCheck();
    });
  }

  openPlan(): void {
    this.coreService.post('plans/open', {
      controllerId: this.schedulerId,
      planIds: [
        {planSchemaId: this.planSchemaId, noticeSpaceKey: this.coreService.getStringDate(this.selectedDate)}
      ]
    }).subscribe((res) => {
      this.initConf();
      this.loadAdditionalData();
      this.cd.markForCheck();
    });
  }

  getFormattedPath(path: any): any {
    return this.isPathDisplay ? path?.split('/').pop() : path;
  }

  refresh(args: { eventSnapshots: any[] }): void {
    let shouldLoadPlans = false;
    let shouldLoadSnapshot = false;

    if (args.eventSnapshots && args.eventSnapshots.length > 0) {
      for (let j = 0; j < args.eventSnapshots.length; j++) {
        const event = args.eventSnapshots[j];
        if (event.eventType.match(/PlanUpdated/) && event.objectType === 'PLAN') {
          shouldLoadPlans = true;
        } else if (
          (event.eventType.match(/WorkflowPlanChanged/) && event.objectType === 'PLAN') ||
          (event.eventType.match(/NoticeBoardStateChanged/) && event.objectType === 'NOTICEBOARD')
        ) {
          shouldLoadSnapshot = true;
        }
      }

      if (shouldLoadPlans) {
        this.loadPlans();
      }

      if (shouldLoadSnapshot) {
        // events often arrive in bursts: reload once, shortly after the last one
        clearTimeout(this.refreshTimer);
        this.refreshTimer = setTimeout(() => {
          const formattedDate = this.coreService.getStringDate(this.selectedDate);
          const matchingPlan = this.noticeSpaceKey.find(p =>
            this.coreService.getStringDate(p.startDate) === formattedDate
          );
          if (matchingPlan) {
            this.loadAdditionaSnapshotlData();
          } else {
            this.planSchemaId = null;
            this.isClosed = false;
            this.isOpen = false;
            this.setWorkflowData(null);
          }
        }, 1000);
      }
    }
  }
}
