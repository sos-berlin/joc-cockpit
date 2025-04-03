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
import {Subject, Subscription} from 'rxjs';
import {DataService} from '../../../services/data.service';
import {NzDrawerComponent} from "ng-zorro-antd/drawer";
import {WorkflowService} from "../../../services/workflow.service";
import {OrderPipe} from "../../../pipes/core.pipe";
import {Data} from "@angular/router";
import {PostModalComponent} from '../../resource/board/board.component';
import {CommentModalComponent} from 'src/app/components/comment-modal/comment.component';
import {ConfirmModalComponent} from 'src/app/components/comfirm-modal/confirm.component';
import {takeUntil} from "rxjs/operators";
import {TranslateService} from "@ngx-translate/core";

declare const mxEditor: any;
declare const mxUtils: any;
declare const mxEvent: any;
declare const mxClient: any;
declare const mxTooltipHandler: any;
declare const mxGraphHandler: any;
declare const mxGraph: any;
declare const mxConstants: any;
declare const mxGeometry: any;
declare const mxPoint: any;
declare const mxCell: any;
declare const $: any;
declare const mxImage: any;
declare const mxCellOverlay: any;

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

  @ViewChild('graphContainer') graphContainer!: ElementRef;

  private graph!: any;
  private editor!: any;
  private depPendingHTTPRequests$ = new Subject<void>();
  private subscription: Subscription;
  private subscription1: Subscription;
  workflowData: any;
  totalWorkflows: number = 0;
  totalNotices: number = 0;
  configXml = './assets/mxgraph/config/diagram.xml';

  constructor(
    public coreService: CoreService,
    private orderPipe: OrderPipe,
    private cd: ChangeDetectorRef,
    private dataService: DataService,
    public workflowService: WorkflowService,
    private modal: NzModalService,
    private translate: TranslateService,
  ) {
    this.subscription = dataService.eventAnnounced$.subscribe(res => this.refreshGraph(res));
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
    this.initConf();
    const dailyPlanFilters = this.coreService.getDailyPlanTab();
    if (dailyPlanFilters.tabIndex === 2) {
      this.loadAdditionaSnapshotlData();
    } else {
      this.loadAdditionalData();
    }
    if (!(this.preferences.theme === 'light' || this.preferences.theme === 'lighter' || !this.preferences.theme)) {
      this.configXml = './assets/mxgraph/config/diagrameditor-dark.xml';
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['parentLoaded'] && changes['parentLoaded'].currentValue) {
      setTimeout(() => {
        this.initConf();
        this.loadAdditionaSnapshotlData();
        this.fit();
      }, 300);
    }
  }

  ngAfterViewInit() {
    this.initGraph();
  }

  ngOnDestroy(): void {
    this.plansFilters.selectedDate = this.selectedDate;
    this.subscription.unsubscribe();
    this.subscription1.unsubscribe();
    this.depPendingHTTPRequests$.next();
    this.depPendingHTTPRequests$.complete();
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
            this.planSchemaId = e.events[0]?.planSchemaId;
            this.isClosed = e.events[0]?.isClosed;
            this.isOpen = e.events[0]?.isOpen;
            this.plansFilters.filter.currentPage = 1;
            if (this.graph) {
              this.graph.getModel().clear();
            }
            this.loadAdditionaSnapshotlData();
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

  zoomIn(): void {
    this.graph.zoomIn();
    this.graph.fit();
    this.graph.center(true, true, 0.5, 0.1);
  }

  zoomOut(): void {
    this.graph.zoomOut();
    this.graph.fit();
    this.graph.center(true, true, 0.5, 0.1);
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
    mxGraph.prototype.expectImage = new mxImage('./assets/mxgraph/images/white-await.png', 20, 20);
    mxGraph.prototype.consumeImage = new mxImage('./assets/mxgraph/images/white-consume.png', 20, 20);
    this.graph.setPanning(true);
    this.graph.setCellsResizable(false);
    this.graph.setConnectable(true);
    this.graph.setHtmlLabels(true);
    this.graph.setCellsMovable(false);
    this.graph.setCellsLocked(false);
    this.graph.setCellsEditable(false);
    mxGraphHandler.prototype.guidesEnabled = true;
    mxGraph.prototype.cellsResizable = false;
    mxGraph.prototype.multigraph = true;
    mxGraph.prototype.allowDanglingEdges = false;
    mxGraph.prototype.foldingEnabled = false;
    const style = this.graph.getStylesheet().getDefaultEdgeStyle();
    style[mxConstants.STYLE_EDGE] = mxConstants.EDGESTYLE_ORTHOGONAL;
    style[mxConstants.STYLE_ROUNDED] = true;
    style[mxConstants.STYLE_STROKEWIDTH] = 2;
    style[mxConstants.STYLE_ENDARROW] = mxConstants.ARROW_CLASSIC;
    this.graph.getStylesheet().putDefaultEdgeStyle(style);
    this.graph.keepEdgesInBackground = false;
    this.graph.keepEdgesOnTop = true;
    this.graph.setTooltips(true);
    this.graph.convertValueToString = function (cell) {
      return cell.value;
    };
    this.graph.addListener(mxEvent.CLICK, (sender, evt) => {
      const cell = evt.getProperty('cell');

      if (cell?.style?.includes('shape=ellipse') && cell.value && !cell.children?.length) {
        return;
      }

      if (cell && cell.vertex && cell.value && cell.originalStyle?.strokeColor !== "#000000") {
        this.navToInventoryTab(cell.value, 'WORKFLOW');
        this.graph.tooltipHandler.hide();
        evt.consume();

      } else if (cell && cell.vertex && cell.value && cell.originalStyle?.strokeColor === "#000000") {
        this.showBoard(cell.value);
        this.graph.tooltipHandler.hide();
        evt.consume();
      }
    });

    this.graph.getTooltipForCell = function (cell) {
      if (this.model.isEdge(cell)) {
        return cell.tooltip || '';
      }
      if (cell.tooltip) {
        return cell.tooltip;
      }
      return cell.value ? cell.value.toString() : '';
    };
    if (this.graph.tooltipHandler) {
      this.graph.tooltipHandler.getTooltipForCell = function (cell) {
        if (this.graph.model.isEdge(cell)) {
          return cell.tooltip || '';
        }
        return mxTooltipHandler.prototype.getTooltipForCell.apply(this, arguments);
      }.bind(this);
    }
  }

  private addOrderOverlay(vertex: any, orders: string[]): void {
  
    if (!orders || orders.length === 0) {
      return;
    }

    const orderCount = orders.length;

    let overlayTooltip;
    this.translate.get('dailyPlan.tooltip.viewOrders').subscribe(translatedValue => {
      overlayTooltip = translatedValue;
    });

    const countLabel = new mxCell(
      `${orderCount}`,
      new mxGeometry(0, 0, 20, 20),
      'shape=ellipse;fillColor=#ffffff;strokeColor=#ffffff;fontColor=#000000;fontSize=12;fontStyle=1;align=center;verticalAlign=middle;cursor=pointer;'
    );
    countLabel.vertex = true;
    countLabel.geometry.relative = true;
    countLabel.geometry.offset = new mxPoint(16, 15);
    countLabel.tooltip = overlayTooltip;
    countLabel.originalStyle = {strokeColor: '#ffffff', strokeWidth: '1'};

    this.graph.addCell(countLabel, vertex);

    this.graph.addListener(mxEvent.CLICK, (sender, evt) => {
      const cell = evt.getProperty('cell');
      if (cell === countLabel) {
        this.buildOrdersHtml(orders);
        evt.consume();
      }
    });
  }

  private addExpectingOverlay(vertex: any): void {
    let overlayTooltip;
    this.translate.get('dailyPlan.label.expectingWorkflow').subscribe(translatedValue => {
      overlayTooltip = translatedValue;
    });
    const overlay = new mxCellOverlay(
      mxGraph.prototype.expectImage,
      overlayTooltip,
      mxConstants.ALIGN_RIGHT,
      mxConstants.ALIGN_TOP,
      new mxPoint(-20, 27)
    );
    overlay.cursor = 'pointer';
    this.graph.addCellOverlay(vertex, overlay);
  }

  private addConsumingOverlay(vertex: any): void {
    let overlayTooltip;
    this.translate.get('dailyPlan.label.consumingWorkflow').subscribe(translatedValue => {
      overlayTooltip = translatedValue;
    });
    const overlay = new mxCellOverlay(
      mxGraph.prototype.consumeImage,
      overlayTooltip,
      mxConstants.ALIGN_RIGHT,
      mxConstants.ALIGN_TOP,
      new mxPoint(-20, 26)
    );
    overlay.cursor = 'pointer';
    this.graph.addCellOverlay(vertex, overlay);
  }

  private getFontColor(fillColor: string): string {
    const color = fillColor.toUpperCase();
    if (color === '#FF8000' || color === '#b3b300') {
      return '#000000';
    }
    return '#ffffff';
  }

  private blinkNode(vertex: any, blinkColor: string = '#FF0000', interval: number = 500): void {
    if (!vertex) {
      return;
    }
    const originalColor = mxUtils.getValue(vertex.style, mxConstants.STYLE_FILLCOLOR, '#1171a6');
    let isBlinkOn = false;
    const blinkInterval = setInterval(() => {
      const newColor = isBlinkOn ? originalColor : blinkColor;
      // Note: getCellStyles may not exist – use setCellStyles on the model instead.
      this.graph.setCellStyles(mxConstants.STYLE_FILLCOLOR, newColor, [vertex]);
      this.graph.refresh();
      isBlinkOn = !isBlinkOn;
    }, interval);
    vertex.blinkInterval = blinkInterval;
  }

  private isWorkflowCritical(row: any): boolean {
    const criticalStates = ['FAILED', 'SUSPENDED', 'BROKEN'];
    const ordersToCheck = [...(row.orders || [])];
    for (const orderId of ordersToCheck) {
      const orderDetails = this.getOrderDetails(orderId);
      if (orderDetails && criticalStates.includes(orderDetails.state?._text)) {
        return true;
      }
    }
    return false;
  }

  // New helper: get the corresponding notice board for a given workflow path.
  private getNoticeBoardByWorkflow(workflow: any): any {
    if (!this.workflowData || !this.workflowData.noticeBoards) {
      return null;
    }

    const boards = Array.isArray(this.workflowData.noticeBoards)
      ? this.workflowData.noticeBoards
      : Object.values(this.workflowData.noticeBoards);
    return boards.find(board => {

      const boardName = board.name;
      return (
        (workflow.postNotices && workflow.postNotices.includes(boardName)) ||
        (workflow.expectNotices && workflow.expectNotices.includes(boardName)) ||
        (workflow.consumeNotices && workflow.consumeNotices.includes(boardName))
      );
    });
  }


  private buildOrdersHtml(orders: any[]): any {
    let orderDetails = [];
    this.sideBar.orders = [];
    if (orders) {
      orders.forEach(orderId => {
        orderDetails = this.getOrderDetails(orderId);

        if (orderDetails) {
          this.sideBar.orders.push(orderDetails);
        }
      });
    }
    if (orderDetails) {
      this.sideBar.isVisible = true;
    }
  }

  private getOrderDetails(orderId: string): any {
    if (!this.workflowData || !this.workflowData.orders) {
      return null;
    }
    const orders = Array.isArray(this.workflowData.orders)
      ? this.workflowData.orders
      : Object.values(this.workflowData.orders);
    for (const obj of orders) {
      if (obj.orderId === orderId) {
        return obj;
      }
    }
    return null;
  }

  private createNode(
    parent: any,
    label: string,
    x: number,
    y: number,
    width: number,
    height: number,
    style: string
  ) {
    let displayLabel = label;
    if (label.length > 38) {
      displayLabel = label.substring(0, 38) + '...';
    }
    let vertex = this.graph.insertVertex(parent, null, displayLabel, x, y, width, height, style);
    vertex.tooltip = label;
    if (style.indexOf('#d0e0e3') !== -1) {
      vertex.originalStyle = {strokeColor: '#d0e0e3', strokeWidth: '1'};
    } else if (style.indexOf('#ffe6cc') !== -1) {
      vertex.originalStyle = {strokeColor: '#ffe6cc', strokeWidth: '1'};
    } else if (style.indexOf('#c8e6c9') !== -1 || style.indexOf('#b3b300') !== -1) {
      vertex.originalStyle = {strokeColor: style.indexOf('#b3b300') !== -1 ? '#b3b300' : '#c8e6c9', strokeWidth: '1'};
    } else {
      vertex.originalStyle = {strokeColor: '#000000', strokeWidth: '1'};
    }
    return vertex;
  }

  clearSearch(): void {
    this.searchValue = '';
    this.reloadGraph();
  }

  getIntersection(arr1: string[], arr2: string[]): string[] {
    return arr1.filter(x => arr2.includes(x));
  }

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
    this.reloadGraph();
  }


  buildRowsFromData(data: any): any[] {
    const rows: any[] = [];
    const postingWorkflows = data?.postingWorkflows || [];
    const expectingWorkflows = data?.expectingWorkflows || [];
    const consumingWorkflows = data?.consumingWorkflows || [];
    postingWorkflows.forEach((p: any) => {
      // Get the corresponding notice board info for this workflow
      const boardInfo = this.getNoticeBoardByWorkflow(p);
      let postingColor = '#1171a6';
      if (p.futureDueOrderIds && p.futureDueOrderIds.length > 0) {
        postingColor = '#FF8000';
      }

      let leftEdgeColor = 'gray';
      if (boardInfo) {
        if (boardInfo.numOfExpectedNotices > 0) {
          leftEdgeColor = '#b3b300';
        } else if (boardInfo.numOfPostedNotices > 0) {
          leftEdgeColor = '#1171a6';
        } else if (boardInfo.numOfAnnouncements > 0) {
          leftEdgeColor = '#FF8000';
        }
      }

      let rightDefaultColor = '#1171a6';
      if (p.presentDueOrderIds && p.presentDueOrderIds.length > 0) {
        rightDefaultColor = '#FF8000';
      } else if (p.expectingOrderIds && p.expectingOrderIds.length > 0) {
        rightDefaultColor = '#b3b300';
      }


      const key = this.getFormattedPath(p.path);
      const row: any = {
        posting: key,
        postingColor: postingColor,
        leftEdgeColor: leftEdgeColor,
        expecting: [] as { path: string; notice: string; rightNodeColor: string }[],
        consuming: [] as { path: string; notice: string; rightNodeColor: string }[],
        orders: p.expectingOrderIds || [],
        expanded: false
      };
      if (p.expectingOrderIds || p.presentDueOrderIds || p.futureDueOrderIds) {
        row.orders = [];
        if (p.expectingOrderIds) {
          row.orders.push(...p.expectingOrderIds);
        }
        if (p.presentDueOrderIds) {
          row.orders.push(...p.presentDueOrderIds);
        }
        if (p.futureDueOrderIds) {
          row.orders.push(...p.futureDueOrderIds);
        }
      }

      if (p.expectNotices && p.expectNotices.length > 0) {
        p.expectNotices.forEach((notice: string) => {
          row.expecting.push({
            path: key,
            notice: this.getFormattedPath(notice),
            rightNodeColor: rightDefaultColor
          });
        });
      }
      expectingWorkflows.forEach((e: any) => {
        if (this.getFormattedPath(e.path) === key && e.expectNotices && e.expectNotices.length > 0) {
          let rightNodeColor = '#1171a6';
          if (e.presentDueOrderIds && e.presentDueOrderIds.length > 0) {
            rightNodeColor = '#FF8000';
          } else if (e.expectingOrderIds && e.expectingOrderIds.length > 0) {
            rightNodeColor = '#b3b300';
          }
          e.expectNotices.forEach((notice: string) => {
            if (!row.expecting.some((ex: any) => ex.notice === this.getFormattedPath(notice))) {
              const combinedOrders = [
                ...(e.expectingOrderIds || []),
                ...(e.presentDueOrderIds || []),
                ...(e.futureDueOrderIds || [])
              ];
              row.expecting.push({
                path: this.getFormattedPath(e.path),
                notice: this.getFormattedPath(notice),
                rightNodeColor: rightNodeColor,
                orders: combinedOrders
              });
            }
          });
        } else if ((!p.expectNotices || p.expectNotices.length === 0) && p.postNotices && e.expectNotices) {
          const common = this.getIntersection(p.postNotices, e.expectNotices);
          if (common.length > 0) {
            let rightNodeColor = '#1171a6';
            if (e.presentDueOrderIds && e.presentDueOrderIds.length > 0) {
              rightNodeColor = '#FF8000';
            } else if (e.expectingOrderIds && e.expectingOrderIds.length > 0) {
              rightNodeColor = '#b3b300';
            }
            if (!row.expecting.some((ex: any) => ex.notice === this.getFormattedPath(common[0]))) {
              const combinedOrders = [
                ...(e.expectingOrderIds || []),
                ...(e.presentDueOrderIds || []),
                ...(e.futureDueOrderIds || [])
              ];
              row.expecting.push({
                path: this.getFormattedPath(e.path),
                notice: this.getFormattedPath(common[0]),
                rightNodeColor: rightNodeColor,
                orders: combinedOrders
              });
            }
          }
        }

      });
     consumingWorkflows.forEach((c: any) => {
  if (c.consumeNotices && p.postNotices) {
    const common = this.getIntersection(p.postNotices, c.consumeNotices);
    if (common.length > 0) {

      let rightNodeColor = '#1171a6';
      if (c.presentDueOrderIds && c.presentDueOrderIds.length > 0) {
        rightNodeColor = '#FF8000';
      } else if (c.expectingOrderIds && c.expectingOrderIds.length > 0) {
        rightNodeColor = '#b3b300';
      }
      const combinedOrders = [
        ...(c.expectingOrderIds || []),
        ...(c.presentDueOrderIds || []),
        ...(c.futureDueOrderIds || [])
      ];
      row.consuming.push({
        path: this.getFormattedPath(c.path),
        notice: this.getFormattedPath(common[0]),
        rightNodeColor: rightNodeColor,
        orders: combinedOrders
      });
    }
  }
});

      const filterBy = this.plansFilters.filter.filterBy;
      if (filterBy && Array.isArray(filterBy) && filterBy.length > 0) {
        let includeRow = false;
        if (filterBy.includes('future') && p.futureDueOrderIds && p.futureDueOrderIds.length > 0) {
          includeRow = true;
        }
        if (filterBy.includes('present')) {
          const hasRightMarker = row.expecting.some(
            (ex: any) => ex.rightNodeColor === '#FF8000' || ex.rightNodeColor === '#b3b300'
          );
          if (hasRightMarker) {
            includeRow = true;
          }
        }
        if (!includeRow) {
          return;
        }
      }
      rows.push(row);
    });
    return rows;
  }

  private filterRows(rows: any[], searchText: string): any[] {
    if (!searchText || searchText.trim() === '') {
      return rows;
    }
    const lowerSearch = searchText.toLowerCase();
    return rows.filter(row => {
      const postingMatch = row.posting && row.posting.toLowerCase().includes(lowerSearch);
      const expectingMatch = row.expecting && row.expecting.some((item: any) =>
        item.notice && item.notice.toLowerCase().includes(lowerSearch)
      );
      const consumingMatch = row.consuming && row.consuming.some((item: any) =>
        item.notice && item.notice.toLowerCase().includes(lowerSearch)
      );
      return postingMatch || expectingMatch || consumingMatch;
    });
  }

  highlightNodes(searchText: string): void {
    if (!this.graph) {
      return;
    }
    const model = this.graph.getModel();
    model.beginUpdate();
    try {
      Object.values(model.cells).forEach((cell: any) => {
        if (cell && model.isVertex(cell)) {
          const fullText = cell.tooltip ? cell.tooltip.toLowerCase() : '';
          const displayText = cell.value ? cell.value.toString().toLowerCase() : '';
          if (searchText && (fullText.includes(searchText.toLowerCase()) || displayText.includes(searchText.toLowerCase()))) {
            this.graph.setCellStyles(mxConstants.STYLE_STROKECOLOR, 'yellow', [cell]);
            this.graph.setCellStyles(mxConstants.STYLE_STROKEWIDTH, '3', [cell]);
          } else {
            if (cell.originalStyle) {
              this.graph.setCellStyles(mxConstants.STYLE_STROKECOLOR, cell.originalStyle.strokeColor, [cell]);
              this.graph.setCellStyles(mxConstants.STYLE_STROKEWIDTH, cell.originalStyle.strokeWidth, [cell]);
            }
          }
        }
      });
    } finally {
      model.endUpdate();
    }
  }

  private loadGraphData(): void {
    const parent = this.graph.getDefaultParent();
    this.graph.getModel().beginUpdate();
    try {
      const allRows = this.buildRowsFromData(this.workflowData);
      const filteredRows = this.filterRows(allRows, this.searchValue);
      this.computeDistinctCountsFromWorkflowData();
      const startIndex = (this.plansFilters.filter.currentPage - 1) * this.pageSize;
      const paginatedRows = filteredRows.slice(startIndex, startIndex + this.pageSize);
      const xPosting = 100;
      const xRight = 800;
      let currentY = 100;
      const rowSpacing = 20;
      const minRowHeight = 120;
      const nodeWidth = 300;
      const nodeHeight = 50;
      const nodeGap = 10;
      const groupGap = 40;
      const postingStyleBase = 'strokeColor=#d0e0e3;shadow=1;shadowOffsetX=2;shadowOffsetY=2;shadowAlpha=0.3;shadowColor=#888;rounded=1;arcSize=20;strokeWidth=1;';
      paginatedRows.forEach((row) => {
        const E = row.expecting.length;
        const C = row.consuming.length;
        const expectingBlockHeight = E > 0 ? E * nodeHeight + (E - 1) * nodeGap : 0;
        const consumingBlockHeight = C > 0 ? C * nodeHeight + (C - 1) * nodeGap : 0;
        let totalBlockHeight = (E > 0 && C > 0)
          ? expectingBlockHeight + groupGap + consumingBlockHeight
          : (expectingBlockHeight || consumingBlockHeight);
        const rowHeightCalculated = Math.max(minRowHeight, totalBlockHeight);
        const rowCenterY = currentY + rowHeightCalculated / 2;
        let postingFillColor = '#1171a6';
        if (row.postingColor === '#FF8000') {
          postingFillColor = '#FF8000';
        }
        const fontColorPosting = this.getFontColor(postingFillColor);
        const dynamicStylePosting = `fillColor=${postingFillColor};${postingStyleBase}fontColor=${fontColorPosting};`;
        let pCell = this.createNode(parent, row.posting, xPosting, rowCenterY, nodeWidth, nodeHeight, dynamicStylePosting);

        if (row.orders && row.orders.length > 0) {
          this.addOrderOverlay(pCell, row.orders);
        }


        // if (this.isWorkflowCritical(row)) {
        //   this.blinkNode(pCell, '#FF0000', 500);
        // }
        let expectingNodes: any[] = [];
        let consumingNodes: any[] = [];
        if (totalBlockHeight > 0) {
          let topY = rowCenterY - totalBlockHeight / 2;
          if (E > 0) {
            for (let j = 0; j < E; j++) {
              const expectVal = row.expecting[j].path;
              const nodeY = topY + j * (nodeHeight + nodeGap);
              const fillColorExpecting = row.expecting[j].rightNodeColor;
              const fontColorExpecting = this.getFontColor(fillColorExpecting);

              const dynamicStyleExpecting = `fillColor=${fillColorExpecting};strokeColor=#d0e0e3;shadow=1;shadowOffsetX=2;shadowOffsetY=2;shadowAlpha=0.3;shadowColor=#888;rounded=1;arcSize=20;strokeWidth=1;fontColor=${fontColorExpecting};`;
              const node = this.createNode(parent, expectVal, xRight, nodeY, nodeWidth, nodeHeight, dynamicStyleExpecting);
              // Optionally add expecting overlay if desired:
              this.addExpectingOverlay(node);
              this.addOrderOverlay(node, row.expecting[j].orders);
              expectingNodes.push({cell: node, notice: row.expecting[j].notice, rightNodeColor: fillColorExpecting});
            }
            if (C > 0) {
              topY += expectingBlockHeight + groupGap;
            }
          }
          if (C > 0) {
            for (let j = 0; j < C; j++) {
              const consumeVal = row.consuming[j].path;
              const nodeY = topY + j * (nodeHeight + nodeGap);
              const fillColorConsuming = row.consuming[j].rightNodeColor;
              const fontColorConsuming = this.getFontColor(fillColorConsuming);
              const dynamicStyleConsuming = `fillColor=${fillColorConsuming};strokeColor=#d0e0e3;shadow=1;shadowOffsetX=2;shadowOffsetY=2;shadowAlpha=0.3;shadowColor=#888;rounded=1;arcSize=20;strokeWidth=1;fontColor=${fontColorConsuming};`;
              const node = this.createNode(parent, consumeVal, xRight, nodeY, nodeWidth, nodeHeight, dynamicStyleConsuming);
              // Optionally add consuming overlay if desired:
              this.addConsumingOverlay(node);
              this.addOrderOverlay(node, row.consuming[j].orders);
              consumingNodes.push({cell: node, notice: row.consuming[j].notice, rightNodeColor: fillColorConsuming});
            }
          }
        }

        expectingNodes.forEach((entry) => {
          const dynamicEdgeStyle = `strokeColor=${row.leftEdgeColor};gradientColor=${entry.rightNodeColor};endArrow=block;edgeStyle=elbowEdgeStyle;elbow=horizontal;orthogonal=1;html=1;`;
          let edge = this.graph.insertEdge(parent, null, '', pCell, entry.cell, dynamicEdgeStyle);
          this.addBlockLabelToEdge(edge, entry.notice);
        });
        consumingNodes.forEach((entry) => {
          const dynamicEdgeStyle = `strokeColor=${row.leftEdgeColor};gradientColor=${entry.rightNodeColor};endArrow=block;edgeStyle=elbowEdgeStyle;elbow=horizontal;orthogonal=1;html=1;`;
          let edge = this.graph.insertEdge(parent, null, '', pCell, entry.cell, dynamicEdgeStyle);
          this.addBlockLabelToEdge(edge, entry.notice);
        });
        currentY += rowHeightCalculated + rowSpacing;
      });
    } finally {
      this.graph.getModel().endUpdate();
      setTimeout(() => {
        this.graph.center(true, true);
        this.highlightNodes(this.searchValue);
      }, 100);
    }
  }

  private addBlockLabelToEdge(edge: any, text: string): void {
    this.graph.getModel().beginUpdate();
    try {
      let displayText = text;
      if (text.length > 18) {
        displayText = text.substring(0, 18) + '...';
      }
      let labelCell = new mxCell(
        displayText,
        new mxGeometry(1, 0.5, 150, 25),
        'shape=rectangle;fillColor=#ffffff;strokeColor=#000000;rounded=1;fontColor=#000000;align=center;verticalAlign=middle;'
      );
      labelCell.vertex = true;
      labelCell.geometry.relative = true;
      labelCell.geometry.offset = new mxPoint(-170, -12);
      labelCell.setConnectable(false);
      labelCell.tooltip = text;
      labelCell.originalStyle = {strokeColor: '#000000', strokeWidth: '1'};
      this.graph.addCell(labelCell, edge);
    } finally {
      this.graph.getModel().endUpdate();
    }
  }

  loadAdditionalData() {
    this.isLoaded = false;
    this.coreService.post('workflows/boards', {
      controllerId: this.schedulerId,
    }).pipe(takeUntil(this.depPendingHTTPRequests$)).subscribe((res) => {
      this.isLoaded = true;
      this.workflowData = res;
      // If the response now contains notice boards, store them.
      if (res.noticeBoards) {
        this.noticeBoards = res.noticeBoards;
      }
      this.loadGraphData();
    });
  }

  loadAdditionaSnapshotlData() {
    this.isLoaded = false;
    this.coreService.post('workflows/boards/snapshot', {
      controllerId: this.schedulerId,
      planSchemaIds: ["Global", "DailyPlan"],
      noticeSpaceKeys: [this.coreService.getStringDate(this.selectedDate)]
    }).pipe(takeUntil(this.depPendingHTTPRequests$)).subscribe((res) => {
      this.isLoaded = true;
      this.workflowData = res;

      if (res.noticeBoards) {
        this.noticeBoards = res.noticeBoards;
      }
      this.loadGraphData();
    });
  }

  reloadGraph(): void {
    this.graph.getModel().clear();
    this.loadGraphData();
  }

  onPageIndexChange(newPage: number): void {
    this.plansFilters.filter.currentPage = newPage;
    this.reloadGraph();
  }

  pageSizeChange(newSize: number): void {
    this.pageSize = newSize;
    this.plansFilters.filter.entryPerPage = newSize;
    const totalRows = this.workflowData ? this.buildRowsFromData(this.workflowData).length : 0;
    if (this.plansFilters.filter.currentPage > Math.ceil(totalRows / newSize)) {
      this.plansFilters.filter.currentPage = 1;
    }
    this.reloadGraph();
  }

  private refreshGraph(event: any) {
    this.graph.refresh();
  }

  private computeDistinctCountsFromWorkflowData(): void {
    // Total workflows is the sum of the lengths of posting, expecting, and consuming arrays.
    const postingCount = this.workflowData?.postingWorkflows?.length || 0;
    const expectingCount = this.workflowData?.expectingWorkflows?.length || 0;
    const consumingCount = this.workflowData?.consumingWorkflows?.length || 0;
    this.totalWorkflows = postingCount + expectingCount + consumingCount;

    // For notices, create a Set and add all notices from each array.
    const noticeSet = new Set<string>();
    // Add notices from posting workflows (e.g. postNotices)
    this.workflowData?.postingWorkflows?.forEach((workflow: any) => {
      if (workflow.postNotices) {
        workflow.postNotices.forEach((notice: string) => noticeSet.add(notice));
      }
    });
    // Add notices from expecting workflows (e.g. expectNotices)
    this.workflowData?.expectingWorkflows?.forEach((workflow: any) => {
      if (workflow.expectNotices) {
        workflow.expectNotices.forEach((notice: string) => noticeSet.add(notice));
      }
    });
    // Add notices from consuming workflows (e.g. consumeNotices)
    this.workflowData?.consumingWorkflows?.forEach((workflow: any) => {
      if (workflow.consumeNotices) {
        workflow.consumeNotices.forEach((notice: string) => noticeSet.add(notice));
      }
    });
    this.totalNotices = noticeSet.size;
  }


  closePlan(): void {
    this.coreService.post('plans/close', {
      controllerId: this.schedulerId,
      planIds: [
        {planSchemaId: this.planSchemaId, noticeSpaceKey: this.coreService.getStringDate(this.selectedDate)}
      ]
    }).subscribe((res) => {
      this.initConf();
      this.loadAdditionalData();
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
    });
  }

  getFormattedPath(path: any): any {
    return this.isPathDisplay ? path?.split('/').pop() : path;
  }

  refresh(args: { eventSnapshots: any[] }): void {
    if (args.eventSnapshots && args.eventSnapshots.length > 0) {
      for (let j = 0; j < args.eventSnapshots.length; j++) {
        if (args.eventSnapshots[j].eventType.match(/PlanUpdated/) && args.eventSnapshots[j].objectType === 'PLAN') {
          this.loadPlans();
        } else if (args.eventSnapshots[j].eventType.match(/WorkflowPlanChanged/) && args.eventSnapshots[j].objectType === 'PLAN') {
          this.loadAdditionaSnapshotlData();
        }
      }
    }
  }
}
