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
declare const mxEdgeHandler: any;
declare const mxGraphHandler: any;
declare const mxGraph: any;
declare const mxConstants: any;
declare const mxPoint: any;
declare const $: any;


@Component({
  selector: 'app-show-dailyPlan-dependencies',
  templateUrl: './show-dependencies.html',
  styleUrl: './dependencies.component.scss'
})
export class ShowDailyPlanDependenciesComponent {
  @Input() schedulerId: any;
  @Input() preferences: any;
  @Input() noticePath: any;
  @Output() closePanel: EventEmitter<any> = new EventEmitter();
  @ViewChild('graphContainer') graphContainer!: ElementRef;

  private graph!: any;
  private editor!: any;
  private pendingHTTPRequests$ = new Subject<void>();
  private subscription: Subscription;
  private workflowData: any
  isPathDisplay = true
  isLoaded: boolean = false;
  configXml = './assets/mxgraph/config/diagram.xml';

  destroyGraph(): void {
    if (this.graph) {
      this.graph.getModel().clear();
    }
    this.workflowData = null;
  }

  constructor(public coreService: CoreService, private dataService: DataService, public workflowService: WorkflowService,) {
    this.subscription = dataService.eventAnnounced$.subscribe(res => this.refreshGraph(res));
  }

  ngOnInit(): void {
    this.isPathDisplay = sessionStorage['displayFoldersInViews'] == 'false';
    this.loadAdditionalData()
    if (!(this.preferences.theme === 'light' || this.preferences.theme === 'lighter' || !this.preferences.theme)) {
      this.configXml = './assets/mxgraph/config/diagrameditor-dark.xml';
    }
  }

  ngAfterViewInit() {
    this.initGraph();
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

  private initGraph() {
    if (!mxClient.isBrowserSupported()) {
      mxUtils.error('Browser not supported!', 200, false);
      return;
    }

    this.graph = new mxGraph(this.graphContainer.nativeElement);
    this.graph.setPanning(true);
    this.graph.setCellsResizable(false);
    this.graph.setConnectable(false);
    this.graph.setHtmlLabels(true);
    this.graph.setDisconnectOnMove(false);
    this.graph.setCellsMovable(false);
    this.graph.setCellsLocked(true);

    mxGraphHandler.prototype.guidesEnabled = true;
    mxGraph.prototype.cellsResizable = false;
    mxGraph.prototype.multigraph = false;
    mxGraph.prototype.allowDanglingEdges = false;
    mxGraph.prototype.foldingEnabled = true;
    mxConstants.VERTEX_SELECTION_COLOR = null;
    mxConstants.EDGE_SELECTION_COLOR = null;
    mxConstants.GUIDE_COLOR = null;

    mxEdgeHandler.prototype.snapToTerminals = true;

    let style = this.graph.getStylesheet().getDefaultEdgeStyle();
    style[mxConstants.STYLE_EDGE] = mxConstants.EDGESTYLE_ELBOW;
    style[mxConstants.STYLE_ROUNDED] = true;
    style[mxConstants.STYLE_ORTHOGONAL] = true;
    style[mxConstants.STYLE_STROKEWIDTH] = 2;
    style[mxConstants.STYLE_ENDARROW] = mxConstants.ARROW_BLOCK;
    this.graph.getStylesheet().putDefaultEdgeStyle(style);
    this.graph.setTooltips(true);

    this.graph.getTooltipForCell = (cell) => {
      if (cell && typeof cell.value === 'object') {
        return cell.value.fullLabel;
      }
      return cell.value;
    };

    mxEvent.addMouseWheelListener((evt, up) => {
      if (evt.ctrlKey) {
        if (up) {
          this.graph.zoomIn();
        } else {
          this.graph.zoomOut();
        }
        mxEvent.consume(evt);
      }
    });

    mxEvent.addListener(document, 'keydown', (evt) => {
      if (evt.ctrlKey && evt.key === '=') {
        this.graph.zoomIn();
      } else if (evt.ctrlKey && evt.key === '-') {
        this.graph.zoomOut();
      }
    });

    this.graph.convertValueToString = (cell) => {
      if (cell && typeof cell.value === 'object') {
        const fullLabel = cell.value.fullLabel;
        const maxLength = 22;
        return fullLabel.length > maxLength ? fullLabel.substring(0, maxLength) + '...' : fullLabel;
      }
      return cell.value;
    };

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

  private loadGraphData(noticeBoardPath: string) {
    if (!this.workflowData) return;

    const parent = this.graph.getDefaultParent();
    this.graph.getModel().beginUpdate();

    try {
      const noticeBoardNode = this.createNode(parent, noticeBoardPath, 300, 100, 'fillColor=#d0d0d0', true);
      const ySpacing = 70;

      const postingNodes = (this.workflowData.noticeBoard?.postingWorkflows || []).map((wf: any, index: number) => {
        return this.createNode(
          parent,
          this.isPathDisplay ? wf?.path?.split('/').pop() : wf?.path,
          100,
          200 + index * ySpacing,
          'fillColor=#1171a6',
          false,
          true
        );
      });
      const expectingNodes = (this.workflowData.noticeBoard?.expectingWorkflows || []).map((wf: any, index: number) => {
        return this.createNode(parent, this.isPathDisplay ? wf?.path?.split('/').pop() : wf?.path, 500, 200 + index * ySpacing, 'fillColor=#FFA640');
      });

      postingNodes.forEach(node => {
        this.graph.insertEdge(parent, null, "", node, noticeBoardNode, 'edgeStyle=elbowEdgeStyle;rounded=1;orthogonal=1;strokeWidth=2;strokeColor=#1171a6;');

      });

      expectingNodes.forEach(node => {
        this.graph.insertEdge(parent, null, "", noticeBoardNode, node, 'edgeStyle=elbowEdgeStyle;rounded=1;orthogonal=1;strokeWidth=2;strokeColor=#FFA640;');

      });

    } finally {
      this.graph.getModel().endUpdate();
      this.graph.center(true, true);
    }
  }

  private createNode(parent: any, label: string, x: number, y: number, style: string, isNoticeBoard = false, isPostingWorkflow = false) {
    const maxLength = 22;
    const isTruncated = label.length > maxLength;
    const displayLabel = isTruncated ? label.substring(0, maxLength) + '...' : label;
    const nodeStyle = isNoticeBoard
      ? `${style};shape=ellipse;strokeWidth=2;strokeColor=#d0d0d0`
      : isPostingWorkflow
        ? `${style};rounded=1;arcSize=20;strokeWidth=2;strokeColor=#1171a6;fontColor=#FFFFFF;`
        : `${style};rounded=1;arcSize=20;strokeWidth=2;strokeColor=#FFA640`;
    const vertex = this.graph.insertVertex(parent, null, {fullLabel: label, displayLabel}, x, y, 150, 50, nodeStyle);

    return vertex;
  }

  loadAdditionalData() {
    this.isLoaded = true;
    this.coreService.post('notice/board/dependencies', {
      controllerId: this.schedulerId,
      noticeBoardPath: this.noticePath,
    }).subscribe((res) => {
      this.isLoaded = false;
      this.workflowData = res
      this.loadGraphData(this.noticePath);
    });
  }

  private refreshGraph(event: any) {
    this.graph.refresh();
  }
}

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

  constructor(public coreService: CoreService, private orderPipe: OrderPipe, private modal: NzModalService) {
  }

  ngOnInit(): void {
    this.isPathDisplay = sessionStorage['displayFoldersInViews'] == 'false';
    const d = new Date().setHours(0, 0, 0, 0);
    this.selectedDate = new Date(d);
    this.plansFilters = this.coreService.getPlansTab();
    this.loadPlans()
    this.initConf();

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['parentLoaded'] && changes['parentLoaded'].currentValue) {
      setTimeout(() => {
        this.initConf();
      }, 300)
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
            this.loadPlans()
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
      planKeys: [this.coreService.getDateByFormat(this.selectedDate, this.preferences.zone, 'YYYY-MM-DD')],
      planSchemaIds: [planIds],
      compact: false
    };

    if (board) {
      requestPayload.noticeBoardPaths = [board.path];
    }

    this.coreService.post('plans', requestPayload)
      .subscribe((res) => {
        if(board){
          res?.plans?.forEach(plan => {
            plan?.noticeBoards?.forEach(noticeBoard => {
              board.children = noticeBoard.notices;
            });
          });

          this.isLoaded = true;
        }else{
          this.processData(res)
          this.isLoaded = true;
        }

    });
  }

  setView(view): void {
    this.plansFilters.filter.calView = view;
    this.loadPlans();
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
    const mapOfCheckedId = {mapOfCheckedId: this.mapOfCheckedId, setOfCheckedId: this.setOfCheckedId };
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
      const noticeIds = board.notices.map(item => item.id);
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
        if(board){
          res?.noticeBoards?.forEach(noticeBoard => {
            board.children = noticeBoard.notices;
          });
          this.isLoaded = true;
        }else{
          this.processData(res)
          this.isLoaded = true;
        }

    });
  }

  getFormattedPath(path: any): any {
    return  this.isPathDisplay ? path?.split('/').pop() : path
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
    const mapOfCheckedId = {mapOfCheckedId: this.mapOfCheckedId, setOfCheckedId: this.setOfCheckedId };
    this.checkedNotices.emit(mapOfCheckedId);
  }

  checkAllNotice(checked: boolean, board?): void {
    board.checked = checked;
    if(checked){
      board.children.forEach(notice => {
        this.mapOfCheckedId.add(notice.id + '__' + board.path);
      })
    }else{
      board.children.forEach(notice => {
        this.mapOfCheckedId.delete(notice.id + '__' + board.path);
      })
    }
    this.updateCheckedSet(board.path, checked);
    this.refreshCheckedStatus();
    const mapOfCheckedId = {mapOfCheckedId: this.mapOfCheckedId, setOfCheckedId: this.setOfCheckedId };
    this.checkedNotices.emit(mapOfCheckedId);
  }

}
