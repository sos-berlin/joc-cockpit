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
  boardValueFor,
  buildDependencyGraph,
  checkConditions,
  exprHasOr,
  NoticeExpr,
  Tri,
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
  /**
   * from = null: no workflow posts this notice in this Plan.
   * optional = true: the notice is one of several alternatives (||) and is not needed for the condition.
   */
  waits: { board: string; from: string | null; kind: string; boardState: BoardState; fromState: DepState; unmatched: boolean; optional: boolean }[];
  /** conditions with alternatives (||), as tokens for display, e.g. A or (B and C) */
  conditions: ConditionToken[][];
  blocked: boolean;
}

/** One part of a displayed notice condition. */
export type ConditionToken =
  { t: 'board'; name: string; value: Tri } | { t: 'op'; op: 'and' | 'or' } | { t: 'paren'; v: '(' | ')' };

/** Why a workflow cannot complete, and all posting workflows and notices responsible for it. */
interface BlockCause {
  type: BlockType;
  blocker: string | null;
  board: string;
  posters: Set<string>;
  boards: Set<string>;
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
  /** every workflow blocked by the same cause, in chain order */
  blocked: string[];
  /** blocked workflows whose own order is also FAILED, SUSPENDED or BROKEN */
  critical: { path: string; state: string }[];
  /** the posting workflow (blocker) has an order, but it is FAILED, SUSPENDED or BROKEN */
  blockerState: string | null;
  /** workflows after the blocked ones that keep waiting too */
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
  /** first blocked workflow */
  blockedName: string | null;
  /** all workflows blocked by the same cause */
  blockedNames: Set<string>;
  stripParts?: { state: string; count: number }[];
  /** step level per workflow (0 = step 1) */
  levels: Map<string, number>;
  /**
   * workflows without order that the path needs: they post a notice that an ordered workflow
   * requires (taking && / || into account), or they receive a notice from a workflow with orders
   */
  neededMissing: Set<string>;
}

/** linear runs longer than this are folded; the first and last FOLD_KEEP steps stay visible */
const FOLD_MIN_LENGTH = 8;
const FOLD_KEEP = 2;
/** above this many workflows the progress strip shows one proportional part per state */
const STRIP_SEGMENT_LIMIT = 60;
/** order of the parts in a compact progress strip */
/** Colour classes in the progress strip, most urgent first (JOC's order-state colours). */
const STRIP_STATES = ['failed', 'broken', 'suspended', 'blocked', 'missing', 'prompting', 'waiting',
  'running', 'inprogress', 'pending', 'scheduled', 'completed', 'unknown'];

/** Severity "Problem": the order needs a state change (shown as "Order State Change Required"). */
const CHANGE_STATES = ['FAILED', 'BROKEN', 'SUSPENDED', 'BLOCKED'];

/** Severity "Attention": no intervention needed yet. All other states are "Normal". */
const ATTENTION_STATES = ['WAITING', 'PROMPTING'];

/** Order states as in the Workflows view: finished and cancelled orders are "Completed". */
function normalizeOrderState(st: string | null): string {
  switch (st) {
    case 'FINISHED':
    case 'CANCELLED':
      return 'COMPLETED';
    case 'PLANNED':
      return 'SCHEDULED';
    case 'PENDING': case 'SCHEDULED': case 'INPROGRESS': case 'RUNNING': case 'SUSPENDED': case 'PROMPTING':
    case 'WAITING': case 'BLOCKED': case 'FAILED': case 'BROKEN':
      return st;
    default:
      return 'UNKNOWN';
  }
}

/** Order of the summary chips: state changes, missing orders, then the other order states. */
const CATEGORY_RANK = ['change:FAILED', 'change:BROKEN', 'change:SUSPENDED', 'change:BLOCKED', 'missing',
  'state:PROMPTING', 'state:WAITING', 'state:RUNNING', 'state:INPROGRESS', 'state:PENDING', 'state:SCHEDULED',
  'state:COMPLETED', 'state:UNKNOWN'];

/**
 * Category of a Critical Path, from the first order (earliest scheduled) of the first workflow in step 1:
 * missing = that workflow has no order; change = its order needs a state change; state = any other state.
 */
export interface PathCategory {
  key: string;
  kind: 'missing' | 'change' | 'state';
  /** order state in lower case, e.g. 'suspended'; null for missing */
  state: string | null;
}

/** One summary chip: a category and the number of Critical Paths in it. */
export interface CategoryChip {
  cat: PathCategory;
  count: number;
}

/** Text with object names as separate parts, so that names get their icon and highlighting. */
export type RichPart = { t: 'text'; v: string } | { t: 'wf'; v: string; path: string } | { t: 'board'; v: string; name: string };

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
  /** summary chips of the Critical Paths found (search and notice filter applied) */
  chips: CategoryChip[] = [];
  /** chips grouped by severity (Problem, Attention, Normal) */
  chipGroups: { sev: 'problem' | 'attention' | 'normal'; chips: CategoryChip[] }[] = [];
  /** selected chips (category keys); a Critical Path is shown if it matches any of them */
  selectedCategories = new Set<string>();
  /**
   * collapsed chips (category keys): their Critical Paths are hidden in the list. "Missing" starts
   * collapsed, but Critical Paths whose orders wait for the missing one always stay visible.
   */
  collapsedCategories = new Set<string>(['missing']);
  /** Critical Paths hidden by collapsed chips */
  collapsedCount = 0;
  /** steps whose "Posts Notice" list is shown in full */
  private expandedPosts = new Set<string>();
  private categoryCache = new Map<string, PathCategory>();
  private richCache = new Map<string, RichPart[]>();
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
   * The Controller's orders of the selected Plan, for the workflows of the snapshot only.
   * The snapshot lists just the orders that wait at or are due to post a notice; the Controller
   * knows every order, including ad hoc orders that are not part of the Daily Plan, with its live
   * state (e.g. SUSPENDED). The request cannot filter by Plan, so this is done here.
   * A failure does not block the view: it then falls back to the orders of the snapshot.
   */
  private loadControllerOrders(day: string, workflowPaths: string[]): Observable<any[] | null> {
    if (workflowPaths.length === 0) {
      return of([]);
    }
    return this.coreService.post('orders', {
      controllerId: this.schedulerId,
      workflowIds: workflowPaths.map(path => ({path})),
      compact: true,
      withoutWorkflowTags: true,
      limit: -1
    }).pipe(
      map((res: any) => (res?.orders || []).filter((o: any) => this.isOrderOfPlan(o, day))),
      catchError(() => {
        console.warn('[Dependencies] orders failed; workflows are shown with the orders of the snapshot only.');
        return of(null);
      })
    );
  }

  /**
   * An order belongs to the selected Plan if its plan key is the selected day, or if it belongs to
   * the Global plan schema. Without plan information the date in the order ID decides
   * (order IDs start with "#YYYY-MM-DD#"). Cancelled orders will not post any notice.
   */
  private isOrderOfPlan(o: any, day: string): boolean {
    if (!o?.orderId || o.state?._text === 'CANCELLED') {
      return false;
    }
    if (o.planId) {
      return o.planId.noticeSpaceKey === day || o.planId.planSchemaId === 'Global';
    }
    const m = /^#(\d{4}-\d{2}-\d{2})#/.exec(o.orderId);
    return !!m && m[1] === day;
  }

  /**
   * The snapshot restricted to the selected Plan day. Global Notice Boards deliver the orders and
   * notices of every day (the notice id is the day), so orders, order ids and notices of other
   * days are removed; otherwise e.g. a failed order of 29 Oct would show on 30 Oct.
   */
  private snapshotOfPlan(res: any, day: string): any {
    if (!res) {
      return res;
    }
    const orders: Record<string, any> = {};
    Object.entries(res.orders || {}).forEach(([id, o]: [string, any]) => {
      if (this.isOrderOfPlan(o, day)) {
        orders[id] = o;
      }
    });
    const keepId = (id: string) => {
      const o = res.orders?.[id] || this.controllerOrderOf(id);
      if (o) {
        return this.isOrderOfPlan(o, day);
      }
      const m = /^#(\d{4}-\d{2}-\d{2})#/.exec(id || '');
      return !m || m[1] === day;
    };
    const workflow = (w: any) => {
      const expectingOrderIds = (w.expectingOrderIds || []).filter(keepId);
      return {
        ...w,
        expectingOrderIds,
        presentDueOrderIds: (w.presentDueOrderIds || []).filter(keepId),
        futureDueOrderIds: (w.futureDueOrderIds || []).filter(keepId),
        // the counter covers all days; with ids it can be recounted for this day
        numOfExpectingOrders: (w.expectingOrderIds || []).length ? expectingOrderIds.length : w.numOfExpectingOrders
      };
    };
    const noticeBoards: Record<string, any> = {};
    Object.entries(res.noticeBoards || {}).forEach(([key, b]: [string, any]) => {
      if (b?.planId?.planSchemaId === 'Global' && Array.isArray(b.notices)) {
        // counters cover all days: drop them so that the notices of this day are counted
        const {numOfNotices, numOfAnnouncements, numOfPostedNotices, numOfExpectedNotices, numOfExpectingOrders, ...rest} = b;
        const notices = b.notices.filter((n: any) => String(n?.id) === day)
          .map((n: any) => ({...n, expectingOrderIds: (n.expectingOrderIds || []).filter(keepId)}));
        noticeBoards[key] = {...rest, notices};
      } else {
        noticeBoards[key] = b;
      }
    });
    return {
      ...res,
      orders,
      noticeBoards,
      postingWorkflows: (res.postingWorkflows || []).map(workflow),
      expectingWorkflows: (res.expectingWorkflows || []).map(workflow),
      consumingWorkflows: (res.consumingWorkflows || []).map(workflow)
    };
  }

  /** An order of the Controller response by id (set while the response is processed). */
  private controllerOrderOf(id: string): any {
    return this.pendingControllerOrders?.get(id);
  }

  private pendingControllerOrders: Map<string, any> | null = null;

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
    // the Controller's orders are requested for the workflows of the snapshot, so after it
    const request: Observable<[any, any[] | null]> = planDay
      ? snapshot$.pipe(switchMap(res =>
        this.loadControllerOrders(planDay, this.snapshotWorkflowPaths(res)).pipe(map(items => [res, items] as [any, any[] | null]))))
      : snapshot$.pipe(map(res => [res, null] as [any, any[] | null]));
    request.pipe(takeUntil(this.depPendingHTTPRequests$)).subscribe({
      next: ([res, controllerOrders]) => {
        const received = performance.now();
        this.isLoaded = true;
        this.pendingControllerOrders = new Map((controllerOrders || []).map((o: any) => [o.orderId, o]));
        this.setWorkflowData(planDay ? this.snapshotOfPlan(res, planDay) : res, controllerOrders);
        this.pendingControllerOrders = null;
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
  private setWorkflowData(res: any, controllerOrders: any[] | null = null): void {
    this.workflowData = res || {};
    this.noticeBoards = res?.noticeBoards ? res.noticeBoards : [];
    this.controllerOrderIndex = new Map((controllerOrders || []).map(o => [o.orderId, o]));
    const planOrders: PlanOrder[] = (controllerOrders || []).map(o => ({
      orderId: o.orderId,
      workflowPath: o.workflowId?.path,
      state: o.state?._text
    }));
    this.model = res ? buildDependencyGraph(res, planOrders) : null;
    this.totalWorkflows = this.model ? this.model.nodes.size : 0;
    this.totalNotices = this.model ? this.model.boardCount : 0;
    this.groupViews.clear();
    this.statusCache.clear();
    this.categoryCache.clear();
    this.richCache.clear();
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
    // chips: one per category found, counting Critical Paths; they stay visible while filtering
    const counts = new Map<string, CategoryChip>();
    this.visibleGroups.forEach(g => {
      const cat = this.groupCategory(g);
      const chip = counts.get(cat.key) || {cat, count: 0};
      chip.count++;
      counts.set(cat.key, chip);
    });
    const rank = (key: string) => (CATEGORY_RANK.indexOf(key) + 1) || CATEGORY_RANK.length + 1;
    this.chips = [...counts.values()].sort((a, b) => rank(a.cat.key) - rank(b.cat.key));
    this.chipGroups = (['problem', 'attention', 'normal'] as const)
      .map(sev => ({sev, chips: this.chips.filter(c => this.categorySeverity(c.cat) === sev)}))
      .filter(grp => grp.chips.length > 0);
    const shown = this.selectedCategories.size
      ? this.visibleGroups.filter(g => this.selectedCategories.has(this.groupCategory(g).key))
      : this.visibleGroups;
    this.healthCounts = {intervention: 0, waiting: 0, ok: 0, inactive: 0};
    this.blockedPathCount = 0;
    shown.forEach(g => {
      const st = this.groupStatus(g);
      this.healthCounts[st.health]++;
      if (st.blockType) {
        this.blockedPathCount++;
      }
    });
    const active = shown.filter(g => this.groupStatus(g).health !== 'inactive');
    this.inactiveGroups = shown.filter(g => this.groupStatus(g).health === 'inactive');
    this.activeGroups = this.searchText ? active : active.filter(g => !this.isHiddenByCollapse(g));
    this.collapsedCount = (active.length - this.activeGroups.length) + (this.inactiveShown ? 0 : this.inactiveGroups.length);
    this.updatePage();
    this.cd.markForCheck();
  }

  /**
   * Paths without orders are folded into one row; they are listed when the row is opened,
   * when a search is active, or when no other path is left to show.
   */
  /** Critical Paths without any order are shown unless the "Missing" chip is collapsed. */
  get inactiveShown(): boolean {
    return !this.collapsedCategories.has('missing') || !!this.searchText || this.selectedCategories.has('missing')
      || this.activeGroups.length === 0;
  }

  /** A collapsed chip hides its Critical Paths; Missing paths whose orders are stuck stay visible. */
  private isHiddenByCollapse(g: DepGroup): boolean {
    const cat = this.groupCategory(g);
    return this.collapsedCategories.has(cat.key) && !(cat.kind === 'missing' && this.missingWithOrders(g));
  }

  isCollapsed(key: string): boolean {
    return this.collapsedCategories.has(key);
  }

  toggleCollapse(key: string, event?: Event): void {
    event?.stopPropagation();
    if (this.collapsedCategories.has(key)) {
      this.collapsedCategories.delete(key);
    } else {
      this.collapsedCategories.add(key);
    }
    this.applyFilters();
  }

  expandAll(): void {
    this.collapsedCategories.clear();
    this.applyFilters();
  }

  /** Number of notice boards shown in "Posts Notice" before "+N more" (profile setting, default 10). */
  get noticeLimit(): number {
    const v = parseInt(this.preferences?.dependencyNoticeLimit, 10);
    return v > 0 ? v : 10;
  }

  visiblePosts(r: { node: DepNode; posts: string[] }): string[] {
    return this.expandedPosts.has(r.node.path) ? r.posts : r.posts.slice(0, this.noticeLimit);
  }

  hiddenPosts(r: { node: DepNode; posts: string[] }): string[] {
    return this.expandedPosts.has(r.node.path) ? [] : r.posts.slice(this.noticeLimit);
  }

  togglePosts(path: string, event?: Event): void {
    event?.stopPropagation();
    if (this.expandedPosts.has(path)) {
      this.expandedPosts.delete(path);
    } else {
      this.expandedPosts.add(path);
    }
  }

  isPostsExpanded(path: string): boolean {
    return this.expandedPosts.has(path);
  }

  /** "Circular dependency: A → B → C → A …" for a Critical Path whose workflows wait for each other. */
  cycleParts(g: DepGroup): RichPart[] {
    return g.cycle ? this.rich('dailyPlan.dependencies.message.cycle', {path: g.cycle}, {path: 'wf'}, ' → ') : [];
  }

  private get pagingList(): DepGroup[] {
    return this.inactiveShown ? [...this.activeGroups, ...this.inactiveGroups] : this.activeGroups;
  }

  get pagingTotal(): number {
    return this.pagingList.length;
  }

  /** Order state of a workflow for the severity check; null = the workflow has no order (Missing). */
  private nodeOrderState(n: DepNode): string | null {
    if (n.state === 'none') {
      return null;
    }
    if (n.failed && n.criticalState) {
      return n.criticalState;
    }
    return normalizeOrderState(n.firstOrderState);
  }

  /**
   * Category of a Critical Path by severity over all workflows in step order (the earliest scheduled
   * order of each workflow): the first Problem (failed, broken, suspended, blocked, missing order)
   * stops the check and decides; otherwise the first Attention state (waiting, prompting) decides;
   * otherwise the state of the first workflow's order (Normal).
   */
  groupCategory(g: DepGroup): PathCategory {
    let cat = this.categoryCache.get(g.id);
    if (!cat) {
      let attention: string = null;
      let normal: string = null;
      const view = this.getGroupView(g);
      for (const n of view.order) {
        const st = this.nodeOrderState(n);
        if (!st) {
          if (g.state === 'none' || view.neededMissing.has(n.path)) {
            cat = {key: 'missing', kind: 'missing', state: null};
            break;
          }
          continue;
        }
        if (CHANGE_STATES.includes(st)) {
          cat = {key: 'change:' + st, kind: 'change', state: st.toLowerCase()};
          break;
        }
        if (ATTENTION_STATES.includes(st)) {
          attention = attention || st;
        } else {
          normal = normal || st;
        }
      }
      if (!cat) {
        const st = attention || normal || 'UNKNOWN';
        cat = {key: 'state:' + st, kind: 'state', state: st.toLowerCase()};
      }
      this.categoryCache.set(g.id, cat);
    }
    return cat;
  }

  /**
   * Caption of a chip or Status label: "Missing Order(s)", otherwise the order state name as in the
   * Workflows view (e.g. "Suspended", "Waiting"); the full explanation is in categoryTooltip().
   */
  categoryLabelKey(cat: PathCategory, count: number): string {
    if (cat.kind === 'missing') {
      return this.plural('dailyPlan.dependencies.category.missing', count);
    }
    return 'dailyPlan.dependencies.orderState.' + cat.state;
  }

  /** Full explanation of a category, e.g. "Order State Change Required: … is suspended …". */
  categoryTooltip(cat: PathCategory): string {
    if (cat.kind === 'missing') {
      return this.translate.instant('dailyPlan.dependencies.category.tooltip.missing');
    }
    const state = this.translate.instant('dailyPlan.dependencies.orderState.' + cat.state);
    return this.translate.instant('dailyPlan.dependencies.category.tooltip.' + cat.kind, {state});
  }

  /**
   * Severity of a Critical Path for the Status column (Andreas' three levels): Problem (failed,
   * broken, suspended, blocked, missing order), Attention (waiting, prompting) or Normal.
   */
  groupSeverity(g: DepGroup): 'problem' | 'attention' | 'normal' {
    return this.categorySeverity(this.groupCategory(g));
  }

  categorySeverity(cat: PathCategory): 'problem' | 'attention' | 'normal' {
    if (cat.kind !== 'state') {
      return 'problem';
    }
    return ATTENTION_STATES.includes(cat.state.toUpperCase()) ? 'attention' : 'normal';
  }

  /** Colour class: orange dashed for missing orders, otherwise JOC's colour of the order state. */
  categoryClass(cat: PathCategory): string {
    return cat.kind === 'missing' ? 'dep-cat-missing' : 'dep-os-' + cat.state;
  }

  /**
   * A Critical Path whose first workflow has no order, while other workflows of it have orders: those
   * orders are stuck and wait for the missing one (action needed), unlike paths without any order.
   */
  missingWithOrders(g: DepGroup): boolean {
    return this.groupCategory(g).kind === 'missing' && g.state !== 'none';
  }

  /** Number for singular/plural in a row: workflows without order, or with an order that needs a state change. */
  categoryCount(g: DepGroup): number {
    const cat = this.groupCategory(g);
    const nodes = g.nodes.map(p => this.model.nodes.get(p)).filter(n => !!n);
    if (cat.kind === 'missing') {
      const needed = this.getGroupView(g).neededMissing.size;
      return needed || nodes.filter(n => n.state === 'none').length;
    }
    if (cat.kind === 'change') {
      return Math.max(1, nodes.filter(n => CHANGE_STATES.includes(this.nodeOrderState(n))).length);
    }
    return 1;
  }

  toggleCategory(key: string): void {
    if (this.selectedCategories.has(key)) {
      this.selectedCategories.delete(key);
    } else {
      this.selectedCategories.add(key);
    }
    this.plansFilters.filter.currentPage = 1;
    this.applyFilters();
  }

  clearCategories(): void {
    this.selectedCategories.clear();
    this.plansFilters.filter.currentPage = 1;
    this.applyFilters();
  }

  /**
   * A translated text with object names as separate parts. objects names the parameters that hold
   * workflow paths ('wf') or notice board names ('board'); a parameter may hold a list of names.
   */
  rich(key: string, params: any, objects: Record<string, 'wf' | 'board'>, separator = ', '): RichPart[] {
    const cacheKey = (this.translate?.currentLang || '') + '|' + key + '|' + JSON.stringify(params) + '|' + JSON.stringify(objects) + separator;
    let parts = this.richCache.get(cacheKey);
    if (parts) {
      return parts;
    }
    const values: { t: 'wf' | 'board'; v: string }[] = [];
    const marked = {...params};
    Object.keys(objects).forEach(k => {
      if (params?.[k] === null || params?.[k] === undefined) {
        return;
      }
      const list: string[] = Array.isArray(params[k]) ? params[k] : [params[k]];
      marked[k] = list.map(v => {
        values.push({t: objects[k], v});
        return '\u0001' + (values.length - 1) + '\u0001';
      }).join(separator);
    });
    parts = [];
    String(this.translate.instant(key, marked)).split(/\u0001(\d+)\u0001/).forEach((seg, i) => {
      if (i % 2 === 0) {
        if (seg) {
          parts.push({t: 'text', v: seg});
        }
      } else {
        const o = values[+seg];
        parts.push(o.t === 'wf' ? {t: 'wf', v: this.getFormattedPath(o.v), path: o.v} : {t: 'board', v: this.getFormattedPath(o.v), name: o.v});
      }
    });
    this.richCache.set(cacheKey, parts);
    return parts;
  }

  /** Explanation of a Critical Path with its workflow and notice board names. */
  statusParts(g: DepGroup): RichPart[] {
    const st = this.groupStatus(g);
    return this.rich(st.key, st.params, {name: 'wf', board: 'board'});
  }

  noteParts(r: DependencyStepNote): RichPart[] {
    if (r.blockerState) {
      return this.rich(r.later ? 'dailyPlan.dependencies.message.posterCriticalLater' : 'dailyPlan.dependencies.message.posterCritical',
        {blocker: r.blocker, state: this.translate.instant(r.blockerState), blocked: r.blocked}, {blocker: 'wf', blocked: 'wf'});
    }
    return this.rich(this.noteKey(r), {blocker: r.blocker, board: r.board, blocked: r.blocked, count: r.downstream},
      {blocker: 'wf', board: 'board', blocked: 'wf'});
  }

  criticalParts(c: { path: string; state: string }): RichPart[] {
    return this.rich('dailyPlan.dependencies.message.blockedCritical', {blocked: c.path, state: this.translate.instant(c.state)}, {blocked: 'wf'});
  }

  headerParts(r: { count: number; boards: string[] }): RichPart[] {
    return this.rich('dailyPlan.dependencies.label.receivers', {count: r.count, boards: r.boards}, {boards: 'board'});
  }

  /** Workflow names for the Critical Path / Starts with columns: up to two names, else the first and "+N". */
  pathParts(paths: string[]): RichPart[] {
    const wf = (p: string): RichPart => ({t: 'wf', v: this.getFormattedPath(p), path: p});
    if (paths.length <= 2) {
      return [].concat(...paths.map((p, i) => i ? [{t: 'text', v: ', '}, wf(p)] : [wf(p)]));
    }
    return [wf(paths[0]), {t: 'text', v: ' +' + (paths.length - 1)}];
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
    if (r.blocked.length > 1) {
      return base + 'Many';
    }
    return r.downstream === 0 ? base + 'None' : this.plural(base, r.downstream);
  }

  /** Names of the blocked workflows for the note, e.g. "w_seg_3, w_seg_4". */
  noteBlocked(r: DependencyStepNote): string {
    return r.blocked.map(p => this.getFormattedPath(p)).join(', ');
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
        const st = this.stateClass(n);
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
    return v.blockedNames.has(node.path);
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
      return status('intervention', this.criticalKey(failed), {name: failed?.path});
    }
    const blocked = v.order.find(n => this.nodeOrderState(n) === 'BLOCKED');
    if (blocked) {
      return status('intervention', 'blocked', {name: blocked.path});
    }
    const later = v.blockLater ? 'Later' : '';
    const many = v.blockedNames.size > 1 ? 'Many' : '';
    if (v.blockType === 'noOrder') {
      return status('intervention', 'noOrder' + later + many, {
        blockedCount: v.blockedNames.size,
        name: v.blocker, blockerStage: v.blockerStage, stage: v.blockedStage
      });
    }
    if (v.blockType === 'noPoster') {
      return status('intervention', 'noPoster' + later + many, {
        name: v.blockedName, board: v.blockerBoard, blockedCount: v.blockedNames.size
      });
    }
    if (g.state === 'action') {
      const count = v.order.filter(n => n.state === 'action').length;
      return status('intervention', count === 1 ? 'actionRequiredOne' : 'actionRequired', {count});
    }
    if (g.state === 'none') {
      return status('inactive', 'noOrders');
    }
    // a workflow without order later in the path: its notices are never posted or consumed
    const missing = v.order.find(n => v.neededMissing.has(n.path));
    if (missing) {
      return status('intervention', 'missingLater', {name: missing.path, stage: v.levels.get(missing.path) + 1});
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

  /** Reason text from the same order state as the dot: "Blocked Order", "Waiting", "Missing Order" … */
  stateLabelKey(node: DepNode): string {
    const st = this.nodeOrderState(node);
    if (!st) {
      return 'dailyPlan.dependencies.state.none';
    }
    if (CHANGE_STATES.includes(st)) {
      return 'dailyPlan.dependencies.state.' + st.toLowerCase();
    }
    return 'dailyPlan.dependencies.orderState.' + st.toLowerCase();
  }

  /**
   * Colour class of a workflow. Red is reserved for errors (failed and broken orders); a suspended
   * order needs attention but is no error, so it uses the orange of "Action required".
   */
  stateClass(node: DepNode): string {
    const st = this.nodeOrderState(node);
    return st ? st.toLowerCase() : 'missing';
  }

  /** Tooltip text of a strip part. */
  stripStateKey(state: string): string {
    return state === 'missing' ? 'dailyPlan.dependencies.state.none' : 'dailyPlan.dependencies.orderState.' + state;
  }

  /**
   * Object-type icons in front of names, as in the tree of the Configuration view.
   * Please check the Notice Board class against the Configuration tree.
   */
  readonly workflowIcon = 'icon icon-workflows-icon';

  /**
   * Predicate in front of a Notice Board in the "Receives Notice" column. The state of the notice
   * comes first ("Notice posted:"), so the line never starts with "expects" for a notice that exists.
   */
  receiveKey(w: { kind: string; boardState: BoardState }): string {
    const base = 'dailyPlan.dependencies.label.';
    if (w.boardState === 'posted') {
      return base + 'noticePosted';
    }
    if (w.boardState === 'announced') {
      return base + 'noticeAnnounced';
    }
    return base + (w.kind === 'consume' ? 'consumesFrom' : 'waitsForBoard');
  }

  /** 'failed', 'suspended' or 'broken' for a workflow with a critical order (same colour for all). */
  private criticalKey(node: DepNode | undefined): string {
    return (node?.criticalState || 'FAILED').toLowerCase();
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
    const causes = new Map<string, BlockCause | null>();
    order.forEach(n => causes.set(n.path, n.state === 'none' ? null : this.blockCause(n, inGroup, incoming)));
    const neededMissing = new Set<string>();
    causes.forEach(c => c?.type === 'noOrder' && c.posters.forEach(p => this.model.nodes.get(p)?.state === 'none' && neededMissing.add(p)));
    order.filter(n => n.state === 'none' && incoming(n.path).some(e => this.model.nodes.get(e.from).state !== 'none'))
      .forEach(n => neededMissing.add(n.path));
    for (const n of order) {
      const cause = causes.get(n.path);
      if (cause) {
        blockType = cause.type;
        blocker = cause.blocker;
        blockerBoard = cause.board;
        blockedName = n.path;
        blockedStage = levels.get(n.path) + 1;
        blockerStage = blocker && levels.has(blocker) ? levels.get(blocker) + 1 : 0;
        break;
      }
    }

    // every workflow with orders that is blocked by the same cause: it depends on the same posting
    // workflow without order, or on the same notice that nobody posts
    const blockedNodes = !blockType ? [] : order.filter(n => {
      const c = causes.get(n.path);
      return !!c && c.type === blockType && (blockType === 'noOrder' ? c.posters.has(blocker) : c.boards.has(blockerBoard));
    });
    const blockedNames = new Set(blockedNodes.map(n => n.path));
    // "waits" as soon as one of them already waits, otherwise "will wait"
    blockLater = blockedNodes.length > 0 && !blockedNodes.some(n => n.state === 'expecting');
    let downstream = 0;
    if (blockedNodes.length > 0) {
      const after = new Set<string>();
      blockedNodes.forEach(n => traverse(this.model, n.path, 0, -1).nodes.forEach(p => after.add(p)));
      blockedNames.forEach(p => after.delete(p));
      downstream = after.size;
    }

    const steps: DependencyChainRow[] = [];
    const headerDone = new Set<string>();
    let lastStage = -1;
    for (const n of order) {
      const stage = levels.get(n.path) + 1;
      const ins = incoming(n.path);
      const parent = ins[0]?.from;
      let indent = 0;
      if (parent && successors(parent).size > 1 && !g.cycle) {
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
          blocked: blockedNodes.map(b => b.path),
          critical: blockedNodes.filter(b => b.failed).map(b => ({path: b.path, state: b.criticalState || 'FAILED'})),
          blockerState: blockType === 'noOrder' && blocker && this.model.nodes.get(blocker)?.failed
            ? (this.model.nodes.get(blocker).criticalState || 'FAILED') : null,
          downstream
        });
      }
      const check = checkConditions(this.model, n);
      const needed = new Set(check ? check.boards : []);
      const optional = (b: string) => !!check && !needed.has(b) && n.conditions.some(c => c.expr && exprHasOr(c.expr));
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
            unmatched: false,
            optional: optional(e.board)
          })),
          ...n.unmatchedNotices.map(b => ({
            board: b,
            from: null,
            kind: n.consumeNotices.includes(b) && !n.expectNotices.includes(b) ? 'consume' : 'expect',
            boardState: 'none' as BoardState,
            fromState: 'none' as DepState,
            unmatched: true,
            optional: optional(b)
          }))
        ],
        conditions: check ? n.conditions.filter(c => c.expr && exprHasOr(c.expr)).map(c => this.conditionTokens(c.expr, n.path)) : [],
        blocked: blockedNames.has(n.path)
      });
      lastStage = stage;
    }
    return {order, rows: this.foldRuns(g.id, steps), blockedStage, blockerStage, blockType, blockLater, blocker, blockerBoard, blockedName, blockedNames,
      levels, neededMissing};
  }

  /**
   * Why a workflow with orders cannot complete, or null. With notice conditions from the API (&& / ||)
   * a workflow is blocked only if one of its conditions cannot be met; without them every expected
   * notice is required (flat lists, as before).
   */
  private blockCause(n: DepNode, inGroup: Set<string>, incoming: (p: string) => DepEdge[]): BlockCause | null {
    const check = checkConditions(this.model, n);
    if (check) {
      if (!check.failing.length) {
        return null;
      }
      const posterOf = (b: string) => (this.model.posters.get(b) || []).filter(p => p !== n.path);
      const posters = new Set<string>([].concat(...check.boards.map(posterOf)));
      const withPoster = check.boards.find(b => posterOf(b).some(p => inGroup.has(p))) || check.boards.find(b => posterOf(b).length > 0);
      if (withPoster) {
        const candidates = posterOf(withPoster);
        return {type: 'noOrder', blocker: candidates.find(p => inGroup.has(p)) || candidates[0], board: withPoster,
          posters, boards: new Set(check.boards)};
      }
      return {type: 'noPoster', blocker: null, board: check.boards[0], posters, boards: new Set(check.boards)};
    }
    const bad = incoming(n.path).filter(e => {
      const from = this.model.nodes.get(e.from);
      return e.boardState !== 'posted' && (from.state === 'none' || from.failed);
    });
    if (bad.length) {
      return {type: 'noOrder', blocker: bad[0].from, board: bad[0].board,
        posters: new Set(bad.map(e => e.from)), boards: new Set(bad.map(e => e.board))};
    }
    const unposted = n.unmatchedNotices.filter(b => boardStateOf(this.model.boardOf(b)) !== 'posted');
    if (unposted.length) {
      return {type: 'noPoster', blocker: null, board: unposted[0], posters: new Set(), boards: new Set(unposted)};
    }
    return null;
  }

  /** A condition as display tokens; brackets only where an alternative is part of an &&. */
  private conditionTokens(expr: NoticeExpr, selfPath: string, parent: 'and' | 'or' | null = null): ConditionToken[] {
    if (expr.t === 'board') {
      return [{t: 'board', name: expr.name, value: boardValueFor(this.model, expr.name, selfPath)}];
    }
    const parts: ConditionToken[] = [];
    expr.items.forEach((x, i) => {
      if (i > 0) {
        parts.push({t: 'op', op: expr.t as 'and' | 'or'});
      }
      parts.push(...this.conditionTokens(x, selfPath, expr.t as 'and' | 'or'));
    });
    return parent && parent !== expr.t ? [{t: 'paren', v: '('}, ...parts, {t: 'paren', v: ')'}] : parts;
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
  /** the Controller's orders of the Plan by order ID, for orders that are not part of the snapshot */
  private controllerOrderIndex = new Map<string, any>();

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
      return this.controllerOrderIndex.get(orderId) || null;
    }
    if (!this.orderIndex) {
      const orders = Array.isArray(this.workflowData.orders)
        ? this.workflowData.orders
        : Object.values(this.workflowData.orders);
      this.orderIndex = new Map(orders.map((o: any) => [o.orderId, o]));
    }
    return this.orderIndex.get(orderId) || this.controllerOrderIndex.get(orderId) || null;
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
