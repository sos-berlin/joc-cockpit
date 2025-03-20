import {Component, SimpleChanges, Input, ViewChild, ElementRef, Output, EventEmitter} from '@angular/core';
import {NzModalRef, NzModalService} from "ng-zorro-antd/modal";
import {CoreService} from "../../../services/core.service";
import {NzTreeNodeOptions} from 'ng-zorro-antd/tree';
import {Subject, Subscription} from 'rxjs';
import {DataService} from '../../../services/data.service';
import {NzDrawerComponent} from "ng-zorro-antd/drawer"
import {WorkflowService} from "../../../services/workflow.service";
import {OrderPipe} from "../../../pipes/core.pipe";
import {Data} from "@angular/router";
import {PostModalComponent} from '../../resource/board/board.component';
import {CommentModalComponent} from 'src/app/components/comment-modal/comment.component';
import {ConfirmModalComponent} from 'src/app/components/comfirm-modal/confirm.component';

declare const mxEditor: any;
declare const mxUtils: any;
declare const mxEvent: any;
declare const mxClient: any;
declare const mxTooltipHandler: any;
declare const mxGraphHandler: any;
declare const mxGraph: any;
declare const mxConstants: any;
declare const mxPoint: any;
declare const $: any;

@Component({
  selector: 'app-dependencies',
  templateUrl: './dependencies.component.html',
  styleUrl: './dependencies.component.scss'
})
export class DependenciesComponent {
  @Input() parentLoaded: boolean = false;
  @Input() schedulerId: any;
  @Input() preferences: any;
  @Input() permission: any;
  @Input() isToggle: any;
  @Input() pageView: any;
  @Output() checkedNotices = new EventEmitter<any>();

  selectedDate: Date;
  isLoaded: boolean;
  data: any;
  plansFilters: any = {filter: {}};
  noticeBoards: any[] = [];
  originalNoticeBoards: any[] = [];
  loading: boolean;
  allChecked = false;
  searchValue = '';
  indeterminate = false;
  isVisible = false;
  noticePath: any
  isPathDisplay = true
  checked = false;
  listOfCurrentPageData: readonly Data[] = [];
  setOfCheckedId = new Set<number>();
  mapOfCheckedId = new Set();

  @ViewChild('graphContainer') graphContainer!: ElementRef;

  private graph!: any;
  private editor!: any;
  private pendingHTTPRequests$ = new Subject<void>();
  private subscription: Subscription;
  private workflowData: any;

  configXml = './assets/mxgraph/config/diagram.xml';

  constructor(public coreService: CoreService, private orderPipe: OrderPipe, private dataService: DataService, public workflowService: WorkflowService, private modal: NzModalService) {
    this.subscription = dataService.eventAnnounced$.subscribe(res => this.refreshGraph(res));
  }

  ngOnInit(): void {
    this.isPathDisplay = sessionStorage['displayFoldersInViews'] == 'false';
    const d = new Date().setHours(0, 0, 0, 0);
    this.selectedDate = new Date(d);
    this.plansFilters = this.coreService.getPlansTab();
    // this.loadPlans()
    this.initConf();
    this.isPathDisplay = sessionStorage['displayFoldersInViews'] == 'false';
    if (!(this.preferences.theme === 'light' || this.preferences.theme === 'lighter' || !this.preferences.theme)) {
      this.configXml = './assets/mxgraph/config/diagrameditor-dark.xml';
    }
  }


  ngOnChanges(changes: SimpleChanges): void {
    if (changes['parentLoaded'] && changes['parentLoaded'].currentValue) {
      setTimeout(() => {
        this.initConf();
      }, 300)
    }
  }

  ngAfterViewInit() {
    setTimeout(()=>{
      this.loadAdditionalData();
    },100)
    this.initGraph();
    this.graph.fit();
  }


  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.pendingHTTPRequests$.next();
    this.pendingHTTPRequests$.complete();
    try {
      if (this.editor) {
        this.editor.destroy();
        this.editor = undefined;
      }
    } catch (e) {
      console.error(e);
    }
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
        dom.calendar({
          view: 'month',
          language: this.coreService.getLocale(),
          selectedDate: this.selectedDate,
          clickDay: (e) => {
            this.selectedDate = e.date;
            // this.loadPlans()
          },
          renderEnd: (e) => {

          },
          rangeEnd: (e) => {

          }
        });
      }
    }, 100)
  }

  loadPlans(board?): void {
    this.isLoaded = false;
    let planIds
    if (this.plansFilters.filter.calView === 'Plannable') {
      planIds = 'DailyPlan'
    } else {
      planIds = 'Global';
    }
    const requestPayload: any = {
      controllerId: this.schedulerId,
      noticeSpaceKeys: [this.coreService.getDateByFormat(this.selectedDate, this.preferences.zone, 'YYYY-MM-DD')],
      planSchemaIds: [planIds],
      compact: false
    };

    if (board) {
      requestPayload.noticeBoardPaths = [board.path];
    }

    this.coreService.post('plans', requestPayload)
      .subscribe((res) => {
        if (board) {
          res?.plans?.forEach(plan => {
            plan?.noticeBoards?.forEach(noticeBoard => {
              board.children = noticeBoard.notices;
            });
          });

          this.isLoaded = true;
        } else {
          this.processData(res)
          this.isLoaded = true;
        }

      });

  }

  setView(view): void {
    this.plansFilters.filter.calView = view;
    // this.loadPlans();
  }

  processData(data: { plans?: { noticeBoards?: any[] }[] }) {
    if (!data?.plans) return;

    this.originalNoticeBoards = data.plans.flatMap(plan => plan.noticeBoards || []).map((board: any) => ({
      path: board.path,
      numOfNotices: board?.numOfNotices,
      numOfExpectedNotices: board?.numOfExpectedNotices,
      numOfExpectingOrders: board?.numOfExpectingOrders,
      numOfPostedNotices: board?.numOfPostedNotices,
      numOfAnnouncements: board?.numOfAnnouncements,
      numOfConsumingWorkflow: board?.consumingWorkflows?.length ?? 0,
      numOfExpectingWorkflow: board?.expectingWorkflows?.length ?? 0,
      versionDate: board?.versionDate,
      checked: board?.checked ?? false
    }));

    this.noticeBoards = [...this.originalNoticeBoards];
  }


  navToInventoryTab(data, type): void {
    this.coreService.navToInventoryTab(data, type);
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
    this.noticePath = path
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
    this.reset()
  }

  reset(): void {
    this.noticeBoards.forEach(board => board.checked = false);
    this.allChecked = false,
      this.indeterminate = false
  }

  onCurrentPageDataChange(listOfCurrentPageData: readonly Data[]): void {
    this.listOfCurrentPageData = listOfCurrentPageData;
    this.refreshCheckedStatus();
  }

  pageSizeChange($event: number): void {
    this.plansFilters.entryPerPage = $event;
  }

  refreshCheckedStatus(): void {
    const listOfEnabledData = this.listOfCurrentPageData
    this.checked = listOfEnabledData.every(({path}) => this.setOfCheckedId.has(path));
    this.indeterminate = listOfEnabledData.some(({path}) => this.setOfCheckedId.has(path)) && !this.checked;
  }

  onItemChecked(path: number, checked: boolean): void {
    this.updateCheckedSet(path, checked);
    this.refreshCheckedStatus();
  }

  onAllChecked(checked: boolean): void {
    this.listOfCurrentPageData
      .forEach(({path}) => this.updateCheckedSet(path, checked));
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
      const obj: any = {
        "controllerId": this.schedulerId,
        "auditLog": {},
      }
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
        nzData: {
          board,
          notice,
          controllerId: this.schedulerId,
          preferences: this.preferences,
          singular: true
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      });
    }
  }

  delete(board, notice): void {
    if (this.preferences.auditLog) {
      const comments = {
        radio: 'predefined',
        type: 'Notice Board',
        operation: 'Delete',
        name: notice?.id
      };
      const modal = this.modal.create({
        nzTitle: undefined,
        nzContent: CommentModalComponent,
        nzData: {
          comments,
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      });
      modal.afterClose.subscribe(result => {
        if (result) {
          this._delete(board, notice, result);
        }
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
      nzData: {
        paths,
        controllerId: this.schedulerId,
        preferences: this.preferences
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
  }

  private deleteAll(board, comments): void {
    if (board) {
      if (!board.notices) {
        this.getNoticeBoards({
          noticeBoardPaths: [board.path],
          controllerId: this.schedulerId
        }, (data) => {
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
        board.notices = board.notices.filter(item => {
          return (item.state && item.state._text === 'EXPECTED');
        });
        board.notices = [...board.notices];
      });
    }
  }

  private getNoticeBoards(obj, cb): void {
    obj.limit = this.preferences.maxBoardRecords;
    this.coreService.post('notice/boards', obj).subscribe({
      next: (res: any) => {
        cb(res.noticeBoards);
      }, error: () => {
        cb();
      }
    });
  }

  filterData(filterType: string): void {
    this.plansFilters.filter.filterBy = filterType;

    if (filterType === 'expected') {
      this.noticeBoards = this.originalNoticeBoards.filter(board =>
        board.numOfConsumingWorkflow > 0 || board.numOfExpectingWorkflow > 0
      );
    } else if (filterType === 'notExpected') {
      this.noticeBoards = this.originalNoticeBoards.filter(board =>
        board.numOfConsumingWorkflow === 0 && board.numOfExpectingWorkflow === 0
      );
    } else if (filterType === 'announced') {
      this.noticeBoards = this.originalNoticeBoards.filter(board => board.numOfAnnouncements > 0);
    } else if (filterType === 'notAnnounced') {
      this.noticeBoards = this.originalNoticeBoards.filter(board => board.numOfAnnouncements === 0);
    } else {
      this.noticeBoards = [...this.originalNoticeBoards];
    }
  }

  toggleCompactView(): void {
    this.plansFilters.filter.isCompact = !this.plansFilters.filter.isCompact;
  }

  getMultiColorNotice(board: any): any {
    let colors = {};


    let announced = board.numOfAnnouncements || 0;
    let expected = board.numOfConsumingWorkflow + board.numOfExpectingWorkflow || 0;

    let notAnnounced = announced === 0 ? 1 : 0;
    let notExpected = expected === 0 ? 1 : 0;

    let total = announced + notAnnounced + expected + notExpected;

    let announcedPercent = (announced / total) * 100;
    let notAnnouncedPercent = (notAnnounced / total) * 100;
    let expectedPercent = (expected / total) * 100;
    let notExpectedPercent = (notExpected / total) * 100;

    colors = {
      '0%': '#C8A2C8',
      [`${announcedPercent}%`]: '#bbb',
      [`${announcedPercent + notAnnouncedPercent}%`]: '#1171a6',
      [`${announcedPercent + notAnnouncedPercent + expectedPercent}%`]: '#FFA640'
    };

    return colors;
  }

  showDetail(board): void {
    board.show = true;
    // this.loadPlans(board)
    this.isLoaded = false;
    let planIds
    if (this.plansFilters.filter.calView === 'Plannable') {
      planIds = 'DailyPlan'
    } else {
      planIds = 'Global';
    }
    const requestPayload: any = {
      controllerId: this.schedulerId,
      limit: 5000
    };

    if (board) {
      requestPayload.noticeBoardPaths = [board.path];
    }

    this.coreService.post('notice/boards', requestPayload)
      .subscribe((res) => {
        if (board) {
          res?.noticeBoards?.forEach(noticeBoard => {
            board.children = noticeBoard.notices;
          });
          this.isLoaded = true;
        } else {
          this.processData(res)
          this.isLoaded = true;
        }

      });
  }

  getFormattedPath(path: any): any {
    return this.isPathDisplay ? path?.split('/').pop() : path
  }

  private checkChild(value: boolean, board): void {
    if (value && board.notices && board.notices.length > 0) {
      board.notices.forEach(item => {
        if (item.state && item.state._text !== 'EXPECTED') {
          this.mapOfCheckedId.add(item.id + '__' + board.path);
        }
      });
    } else if (board.notices && board.notices.length > 0) {
      board.notices.forEach(item => {
        if (this.mapOfCheckedId.has(item.id + '__' + board.path)) {
          this.mapOfCheckedId.delete(item.id + '__' + board.path);
        }
      });
    }
    board.indeterminate = false;
  }

  onNoticeItemCheck(board: any, notice: any, checked: boolean) {
    if (checked) {
      if (notice) {
        if (notice.state && notice.state._text !== 'EXPECTED') {
          this.mapOfCheckedId.add(notice.id + '__' + board.path);
        }
      }
    } else {
      if (notice) {
        this.mapOfCheckedId.delete(notice.id + '__' + board.path);
      }
    }
    this.updateCheckedSet(board.path, checked);
    this.refreshCheckedStatus();
    const mapOfCheckedId = {mapOfCheckedId: this.mapOfCheckedId, setOfCheckedId: this.setOfCheckedId};
    this.checkedNotices.emit(mapOfCheckedId);
  }

  checkAllNotice(checked: boolean, board?): void {
    board.checked = checked;
    if (checked) {
      board.children.forEach(notice => {
        this.mapOfCheckedId.add(notice.id + '__' + board.path);
      })
    } else {
      board.children.forEach(notice => {
        this.mapOfCheckedId.delete(notice.id + '__' + board.path);
      })
    }
    this.updateCheckedSet(board.path, checked);
    this.refreshCheckedStatus();
    const mapOfCheckedId = {mapOfCheckedId: this.mapOfCheckedId, setOfCheckedId: this.setOfCheckedId};
    this.checkedNotices.emit(mapOfCheckedId);
  }

  zoomIn(): void {
    this.graph.zoomIn();
  }

  zoomOut(): void {
    this.graph.zoomOut();
  }

  actual(): void {
    if (this.graph) {
      this.graph.zoomActual();
      this.workflowService.center(this.graph);
    }
  }

  fit(): void {
    if (this.graph) {
      this.graph.fit();
      this.graph.center(true, true, 0.5, 0.1);
    }
  }

  private initGraph(): void {
    if (!mxClient.isBrowserSupported()) {
      mxUtils.error('Browser not supported!', 200, false);
      return;
    }
    this.graph = new mxGraph(this.graphContainer.nativeElement);

    // Basic configuration
    this.graph.setPanning(true);
    this.graph.setCellsResizable(false);
    this.graph.setConnectable(true);
    this.graph.setHtmlLabels(true);
    this.graph.setCellsMovable(false);
    this.graph.setCellsLocked(false);

    mxGraphHandler.prototype.guidesEnabled = true;
    mxGraph.prototype.cellsResizable = false;
    mxGraph.prototype.multigraph = true;
    mxGraph.prototype.allowDanglingEdges = false;
    mxGraph.prototype.foldingEnabled = true;

    // Default edge style
    const style = this.graph.getStylesheet().getDefaultEdgeStyle();
    style[mxConstants.STYLE_EDGE] = mxConstants.EDGESTYLE_ORTHOGONAL;
    style[mxConstants.STYLE_ROUNDED] = true;
    style[mxConstants.STYLE_STROKEWIDTH] = 2;
    style[mxConstants.STYLE_ENDARROW] = mxConstants.ARROW_CLASSIC;
    this.graph.getStylesheet().putDefaultEdgeStyle(style);

    // Keep edges on top.
    this.graph.keepEdgesInBackground = false;
    this.graph.keepEdgesOnTop = true;

    // Enable tooltips.
    this.graph.setTooltips(true);

    this.graph.convertValueToString = function (cell) {
      if (this.model.isEdge(cell)) {
        return ''; // hide edge labels
      }
      // For vertices, we still show the truncated value.
      return cell.value;
    };

    this.graph.getTooltipForCell = function (cell) {
      // For edges, return the custom tooltip if set.
      if (this.model.isEdge(cell)) {
        return cell.tooltip || '';
      }
      // For vertices, if a custom tooltip is available, return it.
      if (cell.tooltip) {
        return cell.tooltip;
      }
      return cell.value ? cell.value.toString() : '';
    };
  }

  /**
   * Helper to create a node.
   */
  private createNode(
    parent: any,
    label: string,
    x: number,
    y: number,
    width: number,
    height: number,
    style: string
  ) {
    // Limit displayed label to 22 characters; if longer, append ellipsis.
    let displayLabel = label;
    if (label.length > 22) {
      displayLabel = label.substring(0, 22) + '...';
    }
    // Insert the vertex using the truncated display label.
    let vertex = this.graph.insertVertex(parent, null, displayLabel, x, y, width, height, style);
    // Store the full label in a custom tooltip property.
    vertex.tooltip = label;
    return vertex;
  }


  // Helper function: returns the intersection of two string arrays.
  private getIntersection(arr1: string[], arr2: string[]): string[] {
    return arr1.filter(x => arr2.includes(x));
  }

  // Helper: Build rows dynamically from your JSON data.
  // Each row object will include a posting workflow and arrays of expecting and consuming objects.
  // Each expecting/consuming object contains the workflow path and the notice to show.
  private buildRowsFromData(data: any): any[] {
    const rows: any[] = [];
    const postingWorkflows = data.postingWorkflows;
    const expectingWorkflows = data.expectingWorkflows;
    const consumingWorkflows = data.consumingWorkflows;

    postingWorkflows.forEach((p: any) => {
      const row: any = {
        posting: p.path,
        expecting: [] as { path: string, notice: string }[],
        consuming: [] as { path: string, notice: string }[]
      };

      // For expecting: if posting already has expectNotices, use its own path.
      if (p.expectNotices && p.expectNotices.length > 0) {
        row.expecting.push({path: p.path, notice: p.expectNotices[0]});
      } else {
        expectingWorkflows.forEach((e: any) => {
          if (e.expectNotices && p.postNotices) {
            const common = this.getIntersection(p.postNotices, e.expectNotices);
            if (common.length > 0) {
              row.expecting.push({path: e.path, notice: common[0]});
            }
          }
        });
      }

      // For consuming: find consuming workflows with matching notices.
      consumingWorkflows.forEach((c: any) => {
        if (c.consumeNotices && p.postNotices) {
          const common = this.getIntersection(p.postNotices, c.consumeNotices);
          if (common.length > 0) {
            row.consuming.push({path: c.path, notice: common[0]});
          }
        }
      });

      rows.push(row);
    });

    return rows;
  }

  // Main function: dynamically creates rows and draws nodes and edges.
  // Edges use the custom tooltip property (set on each edge) to show the notice name when hovered.
  private loadGraphData(): void {
    const parent = this.graph.getDefaultParent();
    this.graph.getModel().beginUpdate();
    try {
      // Your dynamic JSON data:
      const dynamicData = this.workflowData;

      // Build rows dynamically using your helper function.
      const rows = this.buildRowsFromData(dynamicData);

      // Positioning variables.
      const xPosting = 100;      // Left column for posting nodes.
      const xRight = 400;        // Right column for expecting/consuming nodes.
      let currentY = 100;        // Starting Y for the first row.
      const rowSpacing = 20;     // Extra gap after each row.
      const minRowHeight = 120;  // Minimal row height.
      const nodeWidth = 150;
      const nodeHeight = 50;
      const nodeGap = 10;        // Gap between nodes within the same group.
      const groupGap = 40;       // Gap between expecting and consuming blocks.

      // Updated styles with light color shades, inner shadow effect simulation, and same border.
      const stylePosting = 'fillColor=#d0e0e3;strokeColor=#d0e0e3;shadow=1;shadowOffsetX=2;shadowOffsetY=2;shadowAlpha=0.3;shadowColor=#888888;rounded=1;arcSize=20;strokeWidth=1;fontColor=#000000;';
      const styleExpecting = 'fillColor=#ffe6cc;strokeColor=#ffe6cc;shadow=1;shadowOffsetX=2;shadowOffsetY=2;shadowAlpha=0.3;shadowColor=#888888;rounded=1;arcSize=20;strokeWidth=1;fontColor=#000000;';
      const styleConsuming = 'fillColor=#c8e6c9;strokeColor=#c8e6c9;shadow=1;shadowOffsetX=2;shadowOffsetY=2;shadowAlpha=0.3;shadowColor=#888888;rounded=1;arcSize=20;strokeWidth=1;fontColor=#000000;';


      // For each row, create nodes and edges.
      rows.forEach((row, i) => {
        const E = row.expecting.length;
        const C = row.consuming.length;

        const expectingBlockHeight = E > 0 ? E * nodeHeight + (E - 1) * nodeGap : 0;
        const consumingBlockHeight = C > 0 ? C * nodeHeight + (C - 1) * nodeGap : 0;
        let totalBlockHeight = 0;
        if (E > 0 && C > 0) {
          totalBlockHeight = expectingBlockHeight + groupGap + consumingBlockHeight;
        } else {
          totalBlockHeight = expectingBlockHeight || consumingBlockHeight;
        }
        const rowHeightCalculated = Math.max(minRowHeight, totalBlockHeight);
        const rowCenterY = currentY + rowHeightCalculated / 2;

        // Create Posting node (left column).
        let pCell: any = this.createNode(parent, row.posting, xPosting, rowCenterY, nodeWidth, nodeHeight, stylePosting);

        // Right column: create expecting and consuming nodes within one vertical block.
        let expectingNodes: any[] = [];
        let consumingNodes: any[] = [];
        if (totalBlockHeight > 0) {
          let topY = rowCenterY - totalBlockHeight / 2;
          if (E > 0) {
            for (let j = 0; j < E; j++) {
              const expectVal = row.expecting[j].path;
              const nodeY = topY + j * (nodeHeight + nodeGap);
              const node = this.createNode(parent, expectVal, xRight, nodeY, nodeWidth, nodeHeight, styleExpecting);
              expectingNodes.push({cell: node, notice: row.expecting[j].notice});
            }
            if (C > 0) {
              topY += expectingBlockHeight + groupGap;
            }
          }
          if (C > 0) {
            for (let j = 0; j < C; j++) {
              const consumeVal = row.consuming[j].path;
              const nodeY = topY + j * (nodeHeight + nodeGap);
              const node = this.createNode(parent, consumeVal, xRight, nodeY, nodeWidth, nodeHeight, styleConsuming);
              consumingNodes.push({cell: node, notice: row.consuming[j].notice});
            }
          }
        }

        // Draw edges from Posting node to each Expecting node.
        expectingNodes.forEach((entry) => {
          let edge = this.graph.insertEdge(
            parent,
            null,
            "", // Hide the edge label.
            pCell,
            entry.cell,
            'strokeColor=#1171a6;endArrow=block;edgeStyle=elbowEdgeStyle;elbow=horizontal;orthogonal=1;jettySize=auto'
          );
          edge.tooltip = entry.notice;
        });
        // Draw edges from Posting node to each Consuming node.
        consumingNodes.forEach((entry) => {
          let edge = this.graph.insertEdge(
            parent,
            null,
            "", // Hide the edge label.
            pCell,
            entry.cell,
            'strokeColor=#5cb85c;endArrow=block;edgeStyle=elbowEdgeStyle;elbow=horizontal;orthogonal=1;jettySize=auto'
          );
          edge.tooltip = entry.notice;
        });

        // Advance currentY for the next row.
        currentY += rowHeightCalculated + rowSpacing;
      });
    } finally {
      this.graph.getModel().endUpdate();
      setTimeout(()=>{
        this.graph.center(true, true);
      },100)
    }
  }

  loadAdditionalData() {
    this.isLoaded = false;
    this.coreService.post('/workflows/boards', {
      controllerId: this.schedulerId,
    }).subscribe((res) => {
      this.isLoaded = true;
      this.workflowData = res;
      setTimeout(()=>{
        this.loadGraphData();
      },100)

    });
  }

  private refreshGraph(event: any) {
    this.graph.refresh();
  }
}
