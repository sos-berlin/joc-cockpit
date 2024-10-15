import {
  Component,
  ElementRef, EventEmitter, inject,
  Input,
  Output,
  SimpleChanges,
  ViewChild, ViewContainerRef
} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {NZ_MODAL_DATA, NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
import {NzContextMenuService, NzDropdownMenuComponent} from 'ng-zorro-antd/dropdown';
import {isArray, sortBy} from 'underscore';
import {Subscription} from 'rxjs';
import {AuthService} from '../../../components/guard';
import {CoreService} from '../../../services/core.service';
import {WorkflowService} from '../../../services/workflow.service';
import {DataService} from '../../../services/data.service';
import {ResumeOrderModalComponent} from '../../../components/resume-modal/resume.component';
import {CommentModalComponent} from '../../../components/comment-modal/comment.component';
import {
  ChangeParameterModalComponent,
  ModifyStartTimeModalComponent
} from '../../../components/modify-modal/modify.component';
import {ScriptModalComponent} from '../script-modal/script-modal.component';
import {ConfirmModalComponent} from '../../../components/comfirm-modal/confirm.component';

declare const mxUtils: any;
declare const mxEvent: any;
declare const mxClient: any;
declare const mxEdgeHandler: any;
declare const mxGraphHandler: any;
declare const mxGraph: any;
declare const mxOutline: any;
declare const mxConstants: any;
declare const mxEventObject: any;
declare const mxActor: any;
declare const mxPoint: any;
declare const mxCellRenderer: any;
declare const mxCellHighlight: any;
declare const $: any;

@Component({
  selector: 'app-workflow-graphical-dialog',
  templateUrl: './dependent-workflow-dialog.html'
})
export class DependentWorkflowComponent {
  readonly modalData: any = inject(NZ_MODAL_DATA);
  workflow: any = {};
  permission: any = {};
  preferences: any = {};
  controllerId: any;
  recursiveCals: any;
  view: any;
  workflowFilters: any = {};

  jobMap = new Map();
  workFlowJson: any = {};
  pageView = 'grid';
  isExpandAll: boolean = false;
  loading = true;

  subscription: Subscription;

  constructor(private coreService: CoreService, public activeModal: NzModalRef, private dataService: DataService,
              private workflowService: WorkflowService, private modal: NzModalService) {
    this.subscription = dataService.eventAnnounced$.subscribe(res => {
      this.refresh(res);
    });
  }

  ngOnInit(): void {
    this.workflow = this.modalData.workflow || {};
    this.permission = this.modalData.permission || {};
    this.preferences = this.modalData.preferences || {};
    this.controllerId = this.modalData.controllerId;
    this.recursiveCals = this.modalData.recursiveCals;
    this.view = this.modalData.view;
    this.workflowFilters = this.modalData.workflowFilters;
    let flag = false;
    if (this.view) {
      this.pageView = this.view;
    }
    for (let i = 0; i < this.recursiveCals.length; i++) {
      if (this.recursiveCals[i].workflow.path === this.workflow.path) {
        flag = true;
        this.recursiveCals[i].modalInstance.destroy();
        this.recursiveCals.splice(i, 1);
        break;
      }
    }
    const obj: any = {
      workflow: this.workflow,
      modalInstance: this.activeModal
    };
    if (flag) {
      obj.isCheck = flag;
    }
    this.recursiveCals.push(obj);
    this.getDependency();
  }

  ngOnDestroy(): void {
    for (let i = 0; i < this.recursiveCals.length; i++) {
      if (this.recursiveCals[i].workflow.path === this.workflow.path) {
        if (this.recursiveCals[i].isCheck) {
          delete this.recursiveCals[i].isCheck;
        } else {
          this.recursiveCals.splice(i, 1);
        }
        break;
      }
    }
    this.subscription.unsubscribe();
  }

  refresh(args: { eventSnapshots: any[] }): void {
    if (args.eventSnapshots && args.eventSnapshots.length > 0) {
      for (let j = 0; j < args.eventSnapshots.length; j++) {
        if (args.eventSnapshots[j].eventType === 'WorkflowStateChanged' && args.eventSnapshots[j].workflow
          && this.workflow.path === args.eventSnapshots[j].workflow.path && this.workflow.versionId === args.eventSnapshots[j].workflow.versionId) {
          this.getOrders(this.workflow);
          break;
        }
      }
    }
  }

  private getDependency(): void {
    this.coreService.post('workflow/dependencies', {
      controllerId: this.controllerId,
      workflowId: {
        path: this.workflow.path,
        version: this.workflow.versionId
      }
    }).subscribe((res) => {
      this.workflow = res.workflow;
      this.workFlowJson = this.coreService.clone(this.workflow);
      this.workflowService.convertTryToRetry(this.workFlowJson, (jobMap) => {
        this.jobMap = jobMap;
      }, this.workflow.jobs, {count: 0}, true);
      this.workFlowJson.name = this.workflow.path.substring(this.workflow.path.lastIndexOf('/') + 1);
      this.workFlowJson.expectedNoticeBoards = this.coreService.convertObjectToArray(res.workflow, 'expectedNoticeBoards');
      this.workFlowJson.consumeNoticeBoards = this.coreService.convertObjectToArray(res.workflow, 'consumeNoticeBoards');
      this.workFlowJson.postNoticeBoards = this.coreService.convertObjectToArray(res.workflow, 'postNoticeBoards');
      this.workFlowJson.addOrderFromWorkflows = res.workflow.addOrderFromWorkflows;
      this.workFlowJson.addOrderToWorkflows = res.workflow.addOrderToWorkflows;
      this.getOrders(this.workflow);
    });
  }

  private getOrders(workflow: any): void {
    this.loading = false;
    if (this.permission && this.permission.currentController && !this.permission.currentController.orders.view) {
      return;
    }
    if(!workflow.path){
      return;
    }
    const obj: any = {
      compact: true,
      controllerId: this.controllerId,
      workflowIds: [{path: workflow.path, versionId: workflow.versionId}],
      dateTo: this.workflowFilters.date !== 'ALL' ? this.workflowFilters.date : undefined,
      timeZone: this.preferences.zone,
      limit: this.preferences.maxWorkflowRecords
    };
    if (this.workflowFilters.date === '2d') {
      obj.dateFrom = '1d';
    }
    this.coreService.post('orders', obj).subscribe((res: any) => {
      this.workflow.orders = res.orders;
      this.workflow.numOfOrders = res.orders.length;
      this.workflow.ordersSummary = {};
      if (res.orders) {
        res.orders = sortBy(res.orders, 'scheduledFor');
        for (let j = 0; j < res.orders.length; j++) {
          const state = res.orders[j].state._text.toLowerCase();
          if (this.workflow.ordersSummary[state]) {
            this.workflow.ordersSummary[state] = this.workflow.ordersSummary[state] + 1;
          } else {
            this.workflow.ordersSummary[state] = 1;
          }
        }
      }
    });
  }

  expandAll(): void {
    if (this.pageView === 'list') {
      this.isExpandAll = true;
    }
  }

  collapseAll(): void {
    if (this.pageView === 'list') {
      this.isExpandAll = false;
    }
  }

  closeAll(): void {
    this.modal.closeAll();
    for (let i = 0; i < this.recursiveCals.length; i++) {
      this.recursiveCals.splice(i, 1);
    }
  }
}

@Component({
  selector: 'app-workflow-graphical',
  templateUrl: './workflow-graphical.component.html',
  styleUrls: ['./workflow-graphical.component.css']
})
export class WorkflowGraphicalComponent {
  @Input() workFlowJson: any = {};
  @Input() permission: any = {};
  @Input() preferences: any = {};
  @Input() controllerId: any;
  @Input() pageView: string = '';
  @Input() workflowFilters: any = {};
  @Input() orderPreparation: any = {};
  @Input() jobs: any = {};
  @Input() orders: any = [];
  @Input() isModal: boolean = false;
  @Input() reload: boolean;
  @Input() recursiveCals: any;
  @Input() jobMap: any;
  @Input() workflowObjects: any;
  @Output() onClick: EventEmitter<any> = new EventEmitter();

  loading: boolean = false;
  order: any;
  job: any;
  stopInstruction: any;
  graph: any;
  nodes = [];
  vertixMap = new Map();
  mapObj = new Map();
  nodeMap = new Map();
  orderCountMap = new Map();
  boardMap = new Map();
  addOrderdMap = new Map();
  countArr = [];
  sideBar: any = {};
  isProcessing = false;
  selectedKey = '';
  filteredNodes: any[] = [];
  searchNode = {
    loading: false,
    token: '',
    text: ''
  }

  workflowArr = [];

  colors = ['#90C7F5', '#C2b280', '#Aaf0d1', '#B38b6d', '#B2beb5', '#D4af37', '#8c92ac',
    '#FFCF8c', '#CDEB8B', '#FFC7C7', '#8B8BB4', '#Eedc82', '#B87333', '#97B0FF', '#D4af37', '#856088'];

  @ViewChild('graphEle', {static: true}) graphContainer: ElementRef;
  @ViewChild('outlineContainer', {static: true}) outlineContainer: ElementRef;
  @ViewChild('menu', {static: true}) menu: NzDropdownMenuComponent;

  constructor(private authService: AuthService, public coreService: CoreService, private route: ActivatedRoute,
              public workflowService: WorkflowService, public modal: NzModalService, private dataService: DataService,
              private nzContextMenuService: NzContextMenuService, private viewContainerRef: ViewContainerRef) {
  }

  ngAfterViewInit(): void {
    this.createEditor();
    const dom = this.isModal ? $('.graph2 #graph') : $('#graph');
    let ht = this.isModal ? 'calc(100vh - 182px)' : 'calc(100vh - 322px)';
    if (this.workflowFilters && this.workflowFilters.panelSize > 0) {
      ht = this.workflowFilters.panelSize + 'px';
    }
    if (this.preferences.orientation == 'east' || this.preferences.orientation == 'west') {
      const containerElement: HTMLElement = this.outlineContainer.nativeElement;
      containerElement.style.width = (dom.width() - 2) + 'px';
      containerElement.style.height = '112px';
      containerElement.style.top = 'auto';
      containerElement.style.bottom = '16px';
    } else {
      dom.css({width: 'calc(100% - 154px)'});
    }
    this.coreService.slimscrollFunc(dom, ht, this.graph);

    const panel = $('.left-property-panel');
    const transitionCSS = {transition: 'none'};

    $('.sidebar-open', panel).click(() => {
      let propertyPanelWidth = 360;
      this.workflowFilters.leftTreePanelSizeVisible = true;
      $('.graph-container').css({...transitionCSS, 'margin-left': propertyPanelWidth + 'px'});
      $('.toolbar').css({...transitionCSS, 'margin-left': (propertyPanelWidth - 12) + 'px'});
      $('.sidebar-close').css({...transitionCSS, left: propertyPanelWidth + 'px', display: 'block'});
      $('#left-property-panel').css({...transitionCSS, width: propertyPanelWidth + 'px'}).show();
      $('.sidebar-open').css({...transitionCSS, display: 'none'});
      if (this.preferences.orientation == 'east' || this.preferences.orientation == 'west') {
        const outln = $('#outlineContainer');
        outln.css({width: $('.graph-container').width() + 'px'});
      }
      this.workflowService.center(this.graph);
    });

    $('.sidebar-close', panel).click(() => {
      this.workflowFilters.leftTreePanelSizeVisible = false;
      $('.graph-container').css({...transitionCSS, 'margin-left': '0'});
      $('.toolbar').css({...transitionCSS, 'margin-left': '-12px'});
      $('.sidebar-open').css({...transitionCSS, left: '1px', display: 'block'});
      $('#left-property-panel').css(transitionCSS).hide();
      $('.sidebar-close').css({...transitionCSS, display: 'none'});
      if (this.preferences.orientation == 'east' || this.preferences.orientation == 'west') {
        const outln = $('#outlineContainer');
        outln.css({width: $('.graph-container').width() + 'px'});
      }
      this.workflowService.center(this.graph);
    });

    if (window.innerWidth > 1024 && this.workflowFilters.leftTreePanelSizeVisible) {
      setTimeout(() => {
        $('.sidebar-open').click();
      }, 100);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['orders']) {
      this.updateOrder();
    }
    if ((changes['reload'] || changes['jobs']) && this.graph) {
      this.vertixMap = new Map();
      this.nodeMap = new Map();
      this.workflowArr = [];
      this.updateWorkflow(true);
      this.recursiveUpdate();
    }
  }

  ngOnDestroy(): void {
    if (!this.isModal) {
      $('#workflowGraphId').remove();
      $('.mxTooltip').css({visibility: 'hidden'});
    }
  }

  updateOrder(): void {
    this.updateOrdersInGraph(false);
    if (this.permission && this.permission.currentController && !this.permission.currentController.orders.view) {
      this.updateOrdersInGraph(false);
      this.loading = true;
      return;
    }

    this.mapObj = new Map();
    if (this.orders) {
      for (let j = 0; j < this.orders.length; j++) {
        let arr = [this.orders[j]];
        if (this.mapObj.has(JSON.stringify(this.orders[j].position))) {
          arr = arr.concat(this.mapObj.get(JSON.stringify(this.orders[j].position)));
        }
        for (const o in this.orders[j].position) {
          if (/^(try\+)/.test(this.orders[j].position[o])) {
            this.orders[j].position[o] = 'try+0';
          }
          if (/^(cycle\+)/.test(this.orders[j].position[o])) {
            this.orders[j].position[o] = 'cycle';
          }
        }
        this.mapObj.set(JSON.stringify(this.orders[j].position), arr);
      }
    }
    this.updateOrdersInGraph(false);
    this.loading = true;
    this.checkSideBar();
  }

  private checkSideBar(): void {
    if (this.sideBar.isVisible) {
      if (this.sideBar.orders.length > 0) {
        this.sideBar.orders = this.mapObj.get(JSON.stringify(this.sideBar.orders[0].position));
      }
    }
  }

  /* ---------------------------- Broadcast messages ----------------------------------*/

  createWorkflowGraph(): void {
    this.workflowArr = [];
    this.initEditorConf();
    this.updateWorkflow();
    this.recursiveUpdate();
    setTimeout(() => {
      this.actual();
      $('#graph').animate({
        scrollTop: 0
      }, 300);
    }, 10);
  }

  /**
   * Constructs a new application (returns an mxEditor instance)
   */
  createEditor(): void {
    try {
      if (!mxClient.isBrowserSupported()) {
        mxUtils.error('Browser is not supported!', 200, false);
      } else {
        this.graph = new mxGraph(this.graphContainer.nativeElement);
        this.workflowService.init(!(this.preferences.theme === 'light' || this.preferences.theme === 'lighter' || !this.preferences.theme) ? 'dark' : 'light', this.graph);
        new mxOutline(this.graph, this.outlineContainer.nativeElement);
        this.createWorkflowGraph();
      }
    } catch (e) {
      mxUtils.alert('Cannot start application: ' + e.message);
      console.error(e);
    }
  }

  zoomIn(): void {
    if (this.graph) {
      this.graph.zoomIn();
    }
  }

  zoomOut(): void {
    if (this.graph) {
      this.graph.zoomOut();
    }
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

  expandAll(): void {
    if (this.graph) {
      if (!this.workflowObjects) {
        const cells = this.graph.getChildVertices();
        this.graph.foldCells(false, true, cells, null, null);
      } else {
        this.expandCollapseWorkflow(true);
      }
    }
  }

  collapseAll(): void {
    if (this.graph) {
      if (!this.workflowObjects) {
        const cells = this.graph.getChildVertices();
        this.graph.foldCells(true, true, cells, null, null);
      } else {
        this.expandCollapseWorkflow(false);
      }
    }
  }

  private expandCollapseWorkflow(isExpand: boolean): void {
    let isChange = false;
    this.workflowObjects.forEach((value: any, key: any) => {
      value = JSON.parse(value);
      if (value.isExpanded !== isExpand) {
        isChange = true;
      }
      value.isExpanded = isExpand;
      this.workflowObjects.set(key, JSON.stringify(value));
      this.workflowArr = [];
    });
    if (isChange) {
      this.updateWorkflow(true);
    }
  }

  closeMenu(): void {
    this.order = null;
    this.job = null;
    this.stopInstruction = null;
  }

  modifyOrder(): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: ModifyStartTimeModalComponent,
      nzClassName: 'lg',
      nzData: {
        schedulerId: this.controllerId,
        preferences: this.preferences,
        order: this.order
      },
      nzFooter: null,
      nzAutofocus: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe((res) => {
      if (res) {
        this.isProcessing = true;
        this.resetAction(5000);
      }
    });
  }

  changeParameter(): void {
    this.coreService.post('daily_plan/order/variables', {
      orderId: this.order.orderId,
      controllerId: this.controllerId
    }).subscribe((res: any) => {
      this.order.variables = res.variables || {};
      this.openModel(this.order);
    });
  }

  continueOrder(): void{
    this.restCall(false, 'Continue', this.order, 'continue');
  }
  resumeOrder(): void {
    if (this.order.positionIsImplicitEnd) {
      this.restCall(false, 'Resume', this.order, 'resume');
    } else {
      const modal = this.modal.create({
        nzTitle: undefined,
        nzContent: ResumeOrderModalComponent,
        nzClassName: 'x-lg',
        nzData: {
          preferences: this.preferences,
          schedulerId: this.controllerId,
          order: this.coreService.clone(this.order)
        },
        nzFooter: null,
        nzAutofocus: null,
        nzClosable: false,
        nzMaskClosable: false
      });
      modal.afterClose.subscribe((res) => {
        if (res) {
          this.isProcessing = true;
          this.resetAction(5000);
        }
      });
    }
  }

  confirmOrder(): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: ConfirmModalComponent,
      nzData: {
        title: 'confirm',
        question: this.order.question
      },
      nzFooter: null,
      nzAutofocus: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe((result) => {
      if (result) {
        this.restCall(false, 'Confirm', this.order, 'confirm');
      }
    });
  }

  normal(): void {
    this.restCall(false, 'Suspend', this.order, 'suspend', null, false);
  }

  force(): void {
    this.restCall(true, 'Suspend', this.order, 'suspend', null, false);
  }

  reset(): void {
    this.restCall(false, 'Suspend', this.order, 'suspend', null, true);
  }

  forceReset(): void {
    this.restCall(true, 'Suspend', this.order, 'suspend', false, true);
  }

  deepSuspendNormal(isDeep = false): void {
    this.restCall(false, 'Suspend', this.order, 'suspend', isDeep);
  }

  deepSuspendReset(isDeep = false): void {
    this.restCall(false, 'Suspend', this.order, 'suspend', isDeep, true);
  }

  deepSuspendForce(isDeep = false): void {
    this.restCall(true, 'Suspend', this.order, 'suspend', true, false);
  }

  deepSuspendForceReset(isDeep = false): void {
    this.restCall(true, 'Suspend', this.order, 'suspend', true, true);
  }

  cancelOrder(): void {
    this.restCall(false, 'Cancel', this.order, 'cancel');
  }

  cancelOrderWithKill(isDeep = false): void {
    this.restCall(true, 'Cancel', this.order, 'cancel', isDeep);
  }

  deepCancel(): void {
    this.restCall(false, 'Cancel', this.order, 'cancel', true);
  }


  removeWhenTerminated(): void {
    this.restCall(true, 'Terminate', this.order, 'remove_when_terminated');
  }

  private initEditorConf(): void {
    const self = this;
    const graph = this.graph;
    // Alt disables guides
    mxGraphHandler.prototype.guidesEnabled = true;
    mxGraph.prototype.cellsResizable = false;
    mxGraph.prototype.multigraph = false;
    mxGraph.prototype.allowDanglingEdges = false;
    mxGraph.prototype.cellsLocked = true;
    mxGraph.prototype.foldingEnabled = true;
    mxConstants.VERTEX_SELECTION_DASHED = false;
    mxConstants.VERTEX_SELECTION_COLOR = '#0099ff';
    mxConstants.VERTEX_SELECTION_STROKEWIDTH = 2;
    mxConstants.CURSOR_MOVABLE_VERTEX = 'pointer';

    // Enables snapping waypoints to terminals
    mxEdgeHandler.prototype.snapToTerminals = true;

    graph.setConnectable(false);
    graph.setHtmlLabels(true);
    graph.setTooltips(true);
    graph.setDisconnectOnMove(false);
    //graph.setCellsSelectable(true);
    graph.collapseToPreferredSize = false;
    graph.constrainChildren = false;
    graph.extendParentsOnAdd = false;
    graph.extendParents = false;

    // Off page connector
    function OffPageConnectorShape() {
      mxActor.call(this);
    }

    mxUtils.extend(OffPageConnectorShape, mxActor);
    OffPageConnectorShape.prototype.size = 3 / 8;
    OffPageConnectorShape.prototype.isRoundable = function () {
      return true;
    };
    OffPageConnectorShape.prototype.redrawPath = function (c, x, y, w, h) {
      let s = h * Math.max(0, Math.min(1, parseFloat(mxUtils.getValue(this.style, 'size', this.size))));
      let arcSize = mxUtils.getValue(this.style, mxConstants.STYLE_ARCSIZE, mxConstants.LINE_ARCSIZE) / 2;
      this.addPoints(c, [new mxPoint(0, 0), new mxPoint(w, 0), new mxPoint(w, h - s), new mxPoint(w / 2, h),
        new mxPoint(0, h - s)], this.isRounded, arcSize, true);
      c.end();
    };

    mxCellRenderer.registerShape('offPageConnector', OffPageConnectorShape);

    /**
     * Overrides method to provide a cell label in the display
     * @param cell
     */
    graph.convertValueToString = function (cell) {
      return self.workflowService.convertValueToString(cell, graph);
    };

    graph.getTooltipForCell = function (cell) {
      if (cell.value.tagName === 'Order') {
        let order = cell.getAttribute('order');
        if (order) {
          order = JSON.parse(order);
          if (!cell.getAttribute('isCall')) {
            self.getObstacles(order, cell);
          }
        }
      }
      return self.workflowService.getTooltipForCell(cell);
    };

    // Changes fill color to red on mouseover
    graph.addMouseListener({
      currentState: null,
      currentIconSet: null,
      currentHighlight: null,
      mouseDown: function (sender, me) {
        // Hides icons on mouse down
        if (this.currentState != null) {
          this.dragLeave(me.getEvent(), this.currentState);
          this.currentState = null;
        }
      },
      mouseMove: function (sender, me) {

        if (this.currentState != null && me.getState() == this.currentState) {
          return;
        }
        let tmp = graph.view.getState(me.getCell());

        // Ignores everything but vertices
        if (graph.isMouseDown || (tmp != null && !graph.getModel().isVertex(tmp.cell))) {
          if (tmp && tmp.cell && tmp.cell.value.tagName === 'Connection') {

          } else {
            tmp = null;
          }
        }
        if (tmp != this.currentState) {
          if (this.currentState != null) {
            this.dragLeave(me.getEvent(), this.currentState);
          }
          this.currentState = tmp;
          if (this.currentState != null) {
            this.dragEnter(me.getEvent(), this.currentState, tmp?.cell?.value?.tagName === 'Connection' ? tmp.cell : null);
          }
        }
      },
      mouseUp: function () {
      },
      dragEnter: function (evt, state, cell) {
        if (cell) {
          if (state.style) {
            this.currentHighlight = new mxCellHighlight(graph, !(self.preferences.theme === 'light' || self.preferences.theme === 'lighter' || !self.preferences.theme) ? '#FF8000' : '#1171a6');
            this.currentHighlight.highlight(state);
          }
        } else {
          if (this.currentHighlight != null) {
            this.currentHighlight.destroy();
            this.currentHighlight = null;
          }
          if (this.currentIconSet == null) {
            this.currentIconSet = new mxIconSet(state);
          }
        }
      },
      dragLeave: function (evt, state) {
        if (state != null) {
          if (this.currentHighlight != null) {
            this.currentHighlight.destroy();
            this.currentHighlight = null;
          }
        }
        if (this.currentIconSet != null) {
          this.currentIconSet.destroy();
          this.currentIconSet = null;
        }
        if(highlight) {
          highlight.remove();
          highlight = null;
          if (state?.cell?.parent) {
            const _state = graph.view.getState(state.cell.parent);
            if (_state && _state.shape && _state.shape.bounds.width > 72) {
              _state.shape.bounds.x = _state.shape.bounds.x + (_state.shape.bounds.width - _state.shape.bounds.width / 1.3) / 2;
              _state.shape.bounds.y = _state.shape.bounds.y + (_state.shape.bounds.height - _state.shape.bounds.height / 1.3) / 2;
              _state.shape.bounds.width = _state.shape.bounds.width / 1.3;
              _state.shape.bounds.height = _state.shape.bounds.height / 1.3;
              _state.shape.reconfigure();
            }
          }
        }
      }
    });


    /**
     * Function: foldCells to collapse/expand
     */
    mxGraph.prototype.foldCells = function (collapse, recurse, cells, checkFoldable) {
      recurse = (recurse != null) ? recurse : true;
      if (cells == null) {
        cells = this.getFoldableCells(this.getSelectionCells(), collapse);
      }
      self.updateOrdersInGraph(true);

      this.stopEditing(false);
      this.model.beginUpdate();
      try {
        this.cellsFolded(cells, collapse, recurse, checkFoldable);
        this.fireEvent(new mxEventObject(mxEvent.FOLD_CELLS,
          'collapse', collapse, 'recurse', recurse, 'cells', cells));

      } finally {
        this.model.endUpdate();
      }
      WorkflowService.executeLayout(graph, self.preferences);
      self.updateOrdersInGraph(false);
      return cells;
    };

    /**
     * Function: handle a click event
     */
    graph.addListener(mxEvent.CLICK, function (sender, evt) {
      const cell = evt.getProperty('cell'); // cell may be null
      if (cell != null) {
        if (cell.value.tagName === 'Count') {
          const orders = cell.getAttribute('orders');
          self.sideBar = {
            isVisible: true,
            orders: JSON.parse(orders)
          };
        } else if (cell.value.tagName === 'Job') {
          const event = evt.getProperty('event');
          if (event && event.target && event.target.getAttribute('id')) {
            self.coreService.showDocumentation(cell.value.getAttribute('documentationName'), self.preferences);
          } else {
            self.showConfiguration({jobName: cell.value.getAttribute('jobName')});
          }
        } else if (cell.value.tagName === 'If') {
          self.showConfiguration({predicate: cell.value.getAttribute('predicate')});
        } else if (cell.value.tagName === 'Cycle') {
          self.showConfiguration({schedule: cell.value.getAttribute('schedule')});
        } else if (cell.value.tagName === 'Order') {
          const event = evt.getProperty('event');
          if (event && event.target && event.target.getAttribute('id')) {
            const order = cell.value.getAttribute('order');
            if (order) {
              self.showLog(JSON.parse(order));
            }
          }
        } else if (cell.value.tagName === 'ExpectNotices' || cell.value.tagName === 'ConsumeNotices' || cell.value.tagName === 'PostNotices') {
          let noticeNames = cell.value.getAttribute('noticeBoardNames');
          if (noticeNames && cell.value.tagName === 'PostNotices') {
            if (typeof noticeNames == 'string') {
              noticeNames = noticeNames.split(',');
            }
            self.showConfiguration({noticeNames, type: cell.value.tagName});
          }
        }
        if (cell.value.tagName === 'Workflow') {
          const data = cell.value.getAttribute('data');
          if (data) {
            const workflow = JSON.parse(data);
            self.modal.create({
              nzTitle: undefined,
              nzContent: DependentWorkflowComponent,
              nzClassName: 'x-lg',
              nzData: {
                workflow,
                permission: self.permission,
                preferences: self.preferences,
                controllerId: self.controllerId,
                recursiveCals: self.recursiveCals,
                workflowFilters: self.workflowFilters
              },
              nzFooter: null,
              nzClosable: false,
              nzAutofocus: null,
              nzMaskClosable: false
            });
          } else if (self.workflowObjects) {
            const path = cell.value.getAttribute('path');
            let jsonObject = self.workflowObjects.get(path);
            if (jsonObject) {
              jsonObject = JSON.parse(jsonObject);
              jsonObject.isExpanded = !jsonObject.isExpanded;
              self.workflowObjects.set(path, JSON.stringify(jsonObject));
              self.workflowArr = [];
              self.updateWorkflow(true);
            }
          }
        }
        evt.consume();
      }
    });

    /**
     * Overrides method to provide a cell collapse/expandable on double click
     */
    graph.addListener(mxEvent.DOUBLE_CLICK, function (sender, evt) {
      let cell = evt.getProperty('cell');
      self.sideBar = {};
      if (cell != null && cell.vertex == 1) {
        if (self.workflowService.isInstructionCollapsible(cell.value.tagName) || cell.value.tagName === 'Catch') {
          const flag = cell.collapsed != true;
          graph.foldCells(flag, false, null, null, evt);
        }
      }
    });

    let highlight = null;
    // Defines a new class for all icons
    function mxIconSet(state) {
      this.images = [];
      let img;
      if (state.cell && state.cell.value && ((state.cell.getAttribute('path') == self.workFlowJson.path) || state.cell.value.tagName === 'Order') && (state.cell.value.tagName === 'Order' || self.workflowService.isSingleInstruction(state.cell.value.tagName) || self.workflowService.isInstructionCollapsible(state.cell.value.tagName))) {
        img = mxUtils.createImage('./assets/images/menu.svg');
        let x = state.x - (20 * state.shape.scale), y = state.y - (8 * state.shape.scale);
        if (state.cell.value.tagName !== 'Job') {
          y = y + (state.cell.geometry.height / 2 * state.shape.scale) - 4;
          x = x + 2;
        }
        img.style.left = (x + 5) + 'px';
        img.style.top = y + 'px';
        mxEvent.addListener(img, 'click',
          mxUtils.bind(this, function (evt) {
            self.order = null;
            self.job = null;
            self.stopInstruction = null;
            let data: any;
            let isStop = false;
            let isSkip = false;
            let position = state.cell.value.getAttribute('position');
            let _state = state.cell.value.getAttribute('state');
            if (_state) {
              _state = JSON.parse(_state);
              isStop = (_state && (_state._text === 'STOPPED' || _state._text === 'STOPPED_AND_SKIPPED'));
              isSkip = (_state && (_state._text === 'SKIPPED' || _state._text === 'STOPPED_AND_SKIPPED'));
            }
            if (state.cell.value.tagName === 'Order') {
              data = state.cell.getAttribute('order');
              data = JSON.parse(data);
            } else if (state.cell.value.tagName === 'Job') {
              const jobName = state.cell.value.getAttribute('jobName');
              const documentationName = state.cell.value.getAttribute('documentationName');
              const label = state.cell.value.getAttribute('label');
              data = {jobName, documentationName, label, isSkip, isStop};
            } else if (state.cell.value.tagName === 'If') {
              const predicate = state.cell.value.getAttribute('predicate');
              data = {predicate, isStop, isSkip};
            } else {
              const position = state.cell.value.getAttribute('position');
              data = {position, isStop, isSkip};
            }
            data.path = state.cell.getAttribute('path');
            data.versionId = state.cell.getAttribute('versionId');
            try {
              if (self.menu) {
                setTimeout(() => {
                  data.position = position;
                  if (data.jobName || data.predicate) {
                    self.job = data;
                  } else if (data.orderId) {
                    self.order = data;
                  } else {
                    self.stopInstruction = data;
                  }
                  self.nzContextMenuService.create(evt, self.menu);
                  $('.mxTooltip').css({visibility: 'hidden'});
                }, 0);
              }
            } catch (e) {
            }
            this.destroy();
          })
        );
        if (img) {
          img.style.position = 'absolute';
          img.style.cursor = 'pointer';
          img.style.width = (18 * state.shape.scale) + 'px';
          img.style.height = (18 * state.shape.scale) + 'px';
          state.view.graph.container.appendChild(img);
          this.images.push(img);
          highlightDescendantVertices(state.cell);
        }
      }
    }

    mxIconSet.prototype.destroy = function () {
      if (this.images != null) {
        for (let i = 0; i < this.images.length; i++) {
          let img = this.images[i];
          img.parentNode.removeChild(img);
        }
      }
      this.images = null;
      if (self.order) {
        self.order = null;
      }
    };

    function checkAllChilds(model, cell, obj) {
      const childCount = model.getChildCount(cell);

      if (childCount == 0) {
        const state = graph.view.getState(cell);
        if (state?.x) {
          if (obj.minX == null) {
            obj.minX = state.x;
          }
          if (state.x < obj.minX) {
            obj.minX = state.x;
          }
          if (((state.x + state.width) > obj.maxX) || obj.maxX == null) {
            obj.maxX = state.x + state.width;
          }
        }
      } else {
        for (let i = 0; i < childCount; i++) {
          const childCell = model.getChildAt(cell, i);
          if (model.isVertex(childCell)) {
            const state = graph.view.getState(childCell);
            if (!(self.preferences.orientation == 'east' || self.preferences.orientation == 'west')) {
              if (state?.x) {
                if (obj.minX == null) {
                  obj.minX = state.x;
                }
                if (state.x < obj.minX) {
                  obj.minX = state.x;
                }
                if (((state.x + state.width) > obj.maxX) || obj.maxX == null) {
                  obj.maxX = state.x + state.width;
                }
              }
            } else {
              if (state?.y) {
                if (obj.minX == null) {
                  obj.minX = state.y;
                }
                if (state.y < obj.minX) {
                  obj.minX = state.y;
                }
                if (((state.y + state.height) > obj.maxX) || obj.maxX == null) {
                  obj.maxX = state.y + state.height;
                }
              }
            }
            if (self.workflowService.isInstructionCollapsible(childCell.value.tagName)) {
              checkAllChilds(model, childCell, obj);
            }
          }
        }
      }
    }

    function highlightDescendantVertices(parentCell) {
      const model = graph.getModel();
      let obj = {
        minX: null,
        maxX: null
      };
      checkAllChilds(model, parentCell, obj);


      const targetId = self.nodeMap.get(parentCell.id);
      if (targetId) {
        const lastCell = graph.getModel().getCell(targetId);
        const state = graph.view.getState(parentCell);
        const state2 = graph.view.getState(lastCell);
        if (self.preferences.orientation == 'east' || self.preferences.orientation == 'west') {
          if (((state2.y + state2.height) > obj.maxX) || obj.maxX == null) {
            obj.maxX = state2.y + state2.height;
          }else if (((state2.y) < obj.minX) || obj.minX == null) {
            obj.minX = state2.y;
          }
        } else {
          if (((state2.x + state2.width) > obj.maxX) || obj.maxX == null) {
            obj.maxX = state2.x + state2.width;
          } else if ((state2.x < obj.minX) || obj.minX == null) {
            obj.minX = state2.x;
          }
        }

        highlight = document.createElement('div');
        highlight.style.position = 'absolute';
        highlight.style.zIndex = -1;
        if (self.preferences.orientation == 'east' || self.preferences.orientation == 'west') {
          highlight.style.top = obj.minX - 10 + 'px';
          highlight.style.left = (state.x - 10) + 'px';
          highlight.style.height = (obj.maxX - obj.minX + 20) + 'px';
          highlight.style.width = (state2.x + state2.width - state.x + 20) + 'px';
        } else {
          highlight.style.left = obj.minX - 10 + 'px';
          highlight.style.top = (state.y - 10) + 'px';
          highlight.style.width = (obj.maxX - obj.minX + 20) + 'px';
          highlight.style.height = (state2.y + state2.height - state.y + 20) + 'px';
        }
        highlight.style.backgroundColor = 'rgba(0, 0, 0, 0.4)'; // Semi-transparent background
        graph.container.appendChild(highlight);

        if (parentCell.parent) {
          const _state = graph.view.getState(parentCell.parent);
          if (_state && _state.shape && _state.shape.bounds.width < 73) {
            _state.shape.bounds.x = _state.shape.bounds.x - (_state.shape.bounds.width * 1.3 - _state.shape.bounds.width) / 2;
            _state.shape.bounds.y = _state.shape.bounds.y - (_state.shape.bounds.height * 1.3 - _state.shape.bounds.height) / 2;
            _state.shape.bounds.width = _state.shape.bounds.width * 1.3;
            _state.shape.bounds.height = _state.shape.bounds.height * 1.3;
            _state.shape.reconfigure();
          }
        }
      }
    }
  }

  private updatePositions(mainJson, vertixMap): void {
    const self = this;
    const doc = mxUtils.createXmlDocument();
    this.orderCountMap = new Map();
    let workflows = new Map();
    const graph = this.graph;
    let isCall = true;

    function createWorkflowNode(workflow, cell, type): void {
      if (!self.workflowObjects) {
        if (workflow.path !== self.workFlowJson.path) {
          const node = doc.createElement('Workflow');
          node.setAttribute('workflowName', workflow.path.substring(workflow.path.lastIndexOf('/') + 1));
          node.setAttribute('data', JSON.stringify(workflow));
          node.setAttribute('type', type == 'addOrder' ? 'expect' : type);
          let w1;
          if (!workflows.has(workflow.path)) {
            w1 = graph.insertVertex(cell.parent, null, node, 0, 0, 128, 36, type == 'addOrder' ? 'expect' : type);
            workflows.set(workflow.path, w1)
          } else {
            w1 = workflows.get(workflow.path);
            if (graph.getEdgesBetween(w1, cell).length > 0) {
              return;
            }
          }

          if (type === 'expect' || type == 'addOrder') {
            graph.insertEdge(cell.parent, null, doc.createElement('Connection'), w1, cell);
            if (isCall) {
              isCall = false;
              setTimeout(() => {
                let outLen = graph.getIncomingEdges(w1);
                if (outLen?.length > 0) {
                  WorkflowService.executeLayout(self.graph, self.preferences);
                }
              }, 5)
            }
          } else {
            graph.insertEdge(cell.parent, null, doc.createElement('Connection'), cell, w1);
          }
        }
      } else {
        if (workflow.path == self.workFlowJson.path) {
          return;
        }
        if (self.workflowObjects.has(workflow.path)) {
          const jsonObject = self.workflowObjects.get(workflow.path);
          if (jsonObject) {
            workflow = JSON.parse(jsonObject);
          }
        }
        let flag = true;
        for (const i in self.workflowArr) {
          if (self.workflowArr[i].path === workflow.path) {
            flag = false;
            break;
          }
        }
        if (self.workflowArr && self.workflowArr.length === 15) {
          return;
        }
        if (flag) {
          const obj = {
            path: workflow.path,
            color: self.colors[self.workflowArr.length + 1]
          };
          self.workflowArr.push(obj);
          const mapObj = {
            vertixMap: new Map(),
            cell,
            workflowName: self.workFlowJson.name || self.workFlowJson.path,
            graphView: !!self.workflowObjects,
            colorCode: obj.color,
            boardMap: self.boardMap,
            addOrderdMap: self.addOrderdMap
          };
          self.workflowService.createWorkflow(workflow, {graph}, mapObj);
          self.updatePositions(workflow, mapObj.vertixMap);
        }
      }
    }

    function recursive(json) {
      if (json.instructions) {
        for (let x = 0; x < json.instructions.length; x++) {
          if (json.instructions[x].TYPE === 'Fork') {
            if (json.instructions[x].branches) {
              for (let i = 0; i < json.instructions[x].branches.length; i++) {
                if (json.instructions[x].branches[i].instructions) {
                  recursive(json.instructions[x].branches[i]);
                  if (json.instructions[x].branches[i].positions) {
                    if (!json.instructions[x].positions) {
                      json.instructions[x].positions = [];
                      if (json.instructions[x].position) {
                        json.instructions[x].positions.push(JSON.stringify(json.instructions[x].position));
                      }
                    }
                    json.instructions[x].positions = json.instructions[x].positions.concat(json.instructions[x].branches[i].positions);
                  }
                }
              }
            }
          }

          if (json.instructions[x].instructions) {
            recursive(json.instructions[x]);
          }
          if (json.instructions[x].TYPE === 'ExpectNotices') {
            const cell = vertixMap.get(JSON.stringify(json.instructions[x].position));
            if (cell) {
              if (mainJson.postNoticeBoards) {
                let arr = self.coreService.convertExpToArray(json.instructions[x].noticeBoardNames);
                for (const prop in mainJson.postNoticeBoards) {
                  if (arr.length > 0 && arr.indexOf(mainJson.postNoticeBoards[prop].name) > -1) {
                    const incomingEdges = graph.getIncomingEdges(cell);
                    if (incomingEdges && incomingEdges.length > 0) {
                      for (const edge in incomingEdges) {
                        if (incomingEdges[edge].source && incomingEdges[edge].source.value && incomingEdges[edge].source.value.tagName === 'Process') {
                          graph.removeCells([incomingEdges[edge].source], true);
                          break;
                        }
                      }
                    }
                    mainJson.postNoticeBoards[prop].value.forEach((workflow) => {
                      createWorkflowNode(workflow, cell, 'expect');
                    });
                  }
                }
              }
            }
          }

          if (json.instructions[x].TYPE === 'ConsumeNotices') {
            const cell = vertixMap.get(JSON.stringify(json.instructions[x].position));
            if (cell) {
              if (mainJson.postNoticeBoards) {
                let arr = self.coreService.convertExpToArray(json.instructions[x].noticeBoardNames);
                for (const prop in mainJson.postNoticeBoards) {
                  if (arr.length > 0 && arr.indexOf(mainJson.postNoticeBoards[prop].name) > -1) {
                    const incomingEdges = graph.getIncomingEdges(cell);
                    if (incomingEdges && incomingEdges.length > 0) {
                      for (const edge in incomingEdges) {
                        if (incomingEdges[edge].source && incomingEdges[edge].source.value && incomingEdges[edge].source.value.tagName === 'Process') {
                          graph.removeCells([incomingEdges[edge].source], true);
                          break;
                        }
                      }
                    }
                    mainJson.postNoticeBoards[prop].value.forEach((workflow) => {
                      createWorkflowNode(workflow, cell, 'expect');
                    });
                  }
                }
              }
            }
          }

          if (json.instructions[x].TYPE === 'PostNotices') {
            const cell = vertixMap.get(JSON.stringify(json.instructions[x].position));
            if (cell) {
              if (mainJson.expectedNoticeBoards) {
                for (const prop in mainJson.expectedNoticeBoards) {
                  if (isArray(json.instructions[x].noticeBoardNames) && json.instructions[x].noticeBoardNames.indexOf(mainJson.expectedNoticeBoards[prop].name) > -1) {
                    const outgoingEdges = graph.getOutgoingEdges(cell);
                    if (outgoingEdges && outgoingEdges.length > 0) {
                      for (const edge in outgoingEdges) {
                        if (outgoingEdges[edge].target && outgoingEdges[edge].target.value && outgoingEdges[edge].target.value.tagName === 'ImplicitEnd') {
                          graph.removeCells([outgoingEdges[edge].target], true);
                          break;
                        }
                      }
                    }
                    mainJson.expectedNoticeBoards[prop].value.forEach((workflow) => {
                      createWorkflowNode(workflow, cell, 'post');
                    });
                  }
                }
              }
              if (mainJson.consumeNoticeBoards) {
                for (const prop in mainJson.consumeNoticeBoards) {
                  if (isArray(json.instructions[x].noticeBoardNames) && json.instructions[x].noticeBoardNames.indexOf(mainJson.consumeNoticeBoards[prop].name) > -1) {
                    const outgoingEdges = graph.getOutgoingEdges(cell);
                    if (outgoingEdges && outgoingEdges.length > 0) {
                      for (const edge in outgoingEdges) {
                        if (outgoingEdges[edge].target && outgoingEdges[edge].target.value && outgoingEdges[edge].target.value.tagName === 'ImplicitEnd') {
                          graph.removeCells([outgoingEdges[edge].target], true);
                          break;
                        }
                      }
                    }
                    mainJson.consumeNoticeBoards[prop].value.forEach((workflow) => {
                      createWorkflowNode(workflow, cell, 'post');
                    });
                  }
                }
              }
            }
          }

          if (json.instructions[x].TYPE === 'AddOrder') {
            const cell = vertixMap.get(JSON.stringify(json.instructions[x].position));
            if (cell) {
              mainJson.addOrderToWorkflows.forEach((workflow) => {
                if (workflow.path.substring(workflow.path.lastIndexOf('/') + 1) === json.instructions[x].workflowName) {
                  const outgoingEdges = graph.getOutgoingEdges(cell);
                  if (outgoingEdges && outgoingEdges.length > 0) {
                    for (const edge in outgoingEdges) {
                      if (outgoingEdges[edge].target && outgoingEdges[edge].target.value && outgoingEdges[edge].target.value.tagName === 'ImplicitEnd') {
                        graph.removeCells([outgoingEdges[edge].target], true);
                        break;
                      }
                    }
                  }
                  createWorkflowNode(workflow, cell, 'post');
                }
              });
            }
          }

          if (json.instructions[x].catch) {
            if (json.instructions[x].catch.instructions && json.instructions[x].catch.instructions.length > 0) {
              recursive(json.instructions[x].catch);
            }
            if (json.instructions[x].catch.position) {
              if (!json.instructions[x].positions) {
                json.instructions[x].positions = [];
                if (json.instructions[x].position) {
                  json.instructions[x].positions.push(JSON.stringify(json.instructions[x].position));
                }
              }
              json.instructions[x].positions.push(JSON.stringify(json.instructions[x].catch.position));
            } else {
              if (!json.instructions[x].positions) {
                json.instructions[x].positions = [];
              }
              if (json.instructions[x].catch.positions) {
                json.instructions[x].positions = json.instructions[x].positions.concat(json.instructions[x].catch.positions);
              }
            }
          }
          if (json.instructions[x].then && json.instructions[x].then.instructions) {
            recursive(json.instructions[x].then);
            if (json.instructions[x].then.position) {
              if (!json.instructions[x].positions) {
                json.instructions[x].positions = [];
                if (json.instructions[x].position) {
                  json.instructions[x].positions.push(JSON.stringify(json.instructions[x].position));
                }
              }
              json.instructions[x].positions.push(JSON.stringify(json.instructions[x].then.position));
            } else {
              if (!json.instructions[x].positions) {
                json.instructions[x].positions = [];
              }
              if (json.instructions[x].then.positions) {
                json.instructions[x].positions = json.instructions[x].positions.concat(json.instructions[x].then.positions);
              }
            }
          }
          if (json.instructions[x].else && json.instructions[x].else.instructions) {
            recursive(json.instructions[x].else);
            if (json.instructions[x].else.position) {
              if (!json.instructions[x].positions) {
                json.instructions[x].positions = [];
                if (json.instructions[x].position) {
                  json.instructions[x].positions.push(JSON.stringify(json.instructions[x].position));
                }
              }
              json.instructions[x].positions.push(JSON.stringify(json.instructions[x].else.position));
            } else {
              if (!json.instructions[x].positions) {
                json.instructions[x].positions = [];
              }
              if (json.instructions[x].else.positions) {
                json.instructions[x].positions = json.instructions[x].positions.concat(json.instructions[x].else.positions);
              }
            }
          }
          if (json.instructions[x].position) {
            if (!json.positions) {
              json.positions = [];
              if (json.position) {
                json.positions.push(JSON.stringify(json.position));
              }
            }
            json.positions.push(JSON.stringify(json.instructions[x].position));
          }
          if (self.workflowService.isInstructionCollapsible(json.instructions[x].TYPE)) {
            self.orderCountMap.set(json.instructions[x].id, JSON.stringify(json.instructions[x].positions));
          }
        }
      }
    }

    if (mainJson.addOrderFromWorkflows && mainJson.addOrderFromWorkflows.length > 0) {
      const cell = graph.getChildCells(graph.getDefaultParent())[0];
      let remove = false;
      mainJson.addOrderFromWorkflows.forEach((workflow) => {
        if (workflow.path !== self.workFlowJson.path) {
          createWorkflowNode(workflow, cell, 'addOrder');
          remove = true;
        }
      });
      if (remove) {
        const incomingEdges = graph.getIncomingEdges(cell);
        if (incomingEdges && incomingEdges.length > 0) {
          for (const edge in incomingEdges) {
            if (incomingEdges[edge].source && incomingEdges[edge].source.value && incomingEdges[edge].source.value.tagName === 'Process') {
              graph.removeCells([incomingEdges[edge].source], true);
              break;
            }
          }
        }
      }
    }

    recursive(mainJson);
  }

  private updateOrdersInGraph(isCollapse): void {
    if (this.workflowObjects) {
      return;
    }
    this.closeMenu();
    if (this.graph) {
      const graph = this.graph;
      if (graph) {
        graph.getModel().beginUpdate();
        let doc = mxUtils.createXmlDocument();
        let edges = [];
        try {
          if (this.countArr.length > 0) {
            graph.removeCells(this.countArr, true);
            this.countArr = [];
          }
          if (this.vertixMap.size > 0) {
            this.vertixMap.forEach((node) => {
              const parent = node.getParent() || graph.getDefaultParent();
              this.deleteOrder(graph, node);
              if (node.collapsed) {
                let positions = this.orderCountMap.get(node.id.toString());
                if (positions) {
                  positions = JSON.parse(positions);
                  this.setCount(graph, doc, parent, positions, node);
                }
              }
              if (!isCollapse) {
                const position = node.getAttribute('position');
                if (!position && node.getAttribute('positions')) {
                  const positions = JSON.parse(node.getAttribute('positions'));
                  let orders = [];
                  positions.forEach((pos) => {
                    if (this.mapObj.get(pos)) {
                      orders = orders.concat(this.mapObj.get(pos));
                    }
                  });
                  positions.forEach((pos, index) => {
                    const edge = this.createOrder(graph, doc, parent, node, pos, index, (positions.length - 1 === index) ? orders : null);
                    if (edge) {
                      edges.push(edge);
                    }
                  });
                } else {
                  const edge = this.createOrder(graph, doc, parent, node, position);
                  if (edge) {
                    edges.push(edge);
                  }
                }
              }
            });
          }
        } finally {
          // Updates the display
          graph.getModel().endUpdate();
        }
        if (edges.length > 0) {
          for (let i = 0; i < edges.length; i++) {
            const state = graph.view.getState(edges[i]);
            if (state) {
              state.shape.node.getElementsByTagName('path')[1].setAttribute('class', 'flow');
            }
          }
        }
      }
    }
  }

  private deleteOrder(graph, cell): void {
    if (cell.edges) {
      let orderCells = [];
      for (let i = 0; i < cell.edges.length; i++) {
        if (cell.edges[i].source && cell.edges[i].source.value && cell.edges[i].source.value.tagName === 'Order') {
          orderCells.push(cell.edges[i].source);
        }
      }
      if (orderCells.length > 0) {
        graph.removeCells(orderCells, true);
      }
    }
  }

  private setCount(graph, doc, parent, positions, cell): void {
    let orderArr = [];
    for (let i = 0; i < positions.length; i++) {
      let orders = this.mapObj.get(positions[i]);
      if (orders) {
        orderArr = orderArr.concat(orders);
      }
    }
    if (orderArr.length) {
      const _nodeCount = doc.createElement('Count');
      _nodeCount.setAttribute('count', orderArr.length);
      _nodeCount.setAttribute('orders', JSON.stringify(orderArr));
      let x = cell.geometry.x + cell.geometry.width - 5;
      let y = cell.geometry.y - 5;
      let color = '#0E8A8B';
      if (this.preferences.theme !== 'light' && this.preferences.theme !== 'lighter' || !this.preferences.theme) {
        color = '#d87600';
      }
      let countV = graph.insertVertex(parent, null, _nodeCount, x, y, 16, 16, 'order;fillColor=' + color + ';strokeColor=' + color + ';shadow=1');
      this.countArr.push(countV);
    }
  }

  private createOrder(graph, doc, parent, node, position, count = -1, branchOrders = null): any {
    let edge = null;
    if (position) {
      if (this.mapObj.get(position)) {
        const orders = this.mapObj.get(position);
        const len = orders.length < 4 ? orders.length : 3;
        for (let i = 0; i < len; i++) {
          const _node = doc.createElement('Order');
          _node.setAttribute('order', JSON.stringify(orders[i]));
          let x = node.geometry.x + node.geometry.width + 50 + (i * 8);
          let y = node.geometry.y - 40 + (i * 8);
          if (this.preferences.orientation == 'east' || this.preferences.orientation == 'west') {
            x = node.geometry.x + (node.geometry.width / 2) + 50 + (i * 8);
            y = node.geometry.y - node.geometry.height - 40 + (i * 8);
          }
          if (count > 0 && (count * len) < 3) {
            x = x + (count * 8);
            y = y + (count * 8);
          }

          const v1 = graph.insertVertex(parent, null, _node, x, y, 120, 36, 'order');
          // Create badge to show total orders count
          if ((orders.length > 1 && count === -1 && (i === 2 || i === orders.length - 1)) || (branchOrders && branchOrders.length > 0 && (i === 2 || i === orders.length - 1))) {
            const _nodeCount = doc.createElement('Count');
            _nodeCount.setAttribute('count', (branchOrders && branchOrders.length > 0) ? branchOrders.length : orders.length);
            _nodeCount.setAttribute('orders', (branchOrders && branchOrders.length > 0) ? JSON.stringify(branchOrders) : JSON.stringify(orders));
            let color = '#0E8A8B';
            if (this.preferences.theme !== 'light' && this.preferences.theme !== 'lighter' || !this.preferences.theme) {
              color = '#d87600';
            }
            let countV = graph.insertVertex(parent, null, _nodeCount, x + 105, y, 16, 16, 'order;fillColor=' + color + ';strokeColor=' + color + ';shadow=1');
            this.countArr.push(countV);
          }
          const _edge = graph.insertEdge(parent, null, doc.createElement('Connection'), v1, node, 'dashed=1;');
          if (orders[i].state && orders[i].state._text === 'RUNNING') {
            edge = _edge;
          }
        }
      }
    }
    return edge;
  }

  private recursiveUpdate(): void {
    const self = this;
    let nodes: any = {
      children: []
    };

    function recursive(json, obj) {
      if (json.instructions) {
        for (let x = 0; x < json.instructions.length; x++) {
          let child: any = {
            title: json.instructions[x].TYPE,
            key: json.instructions[x].uuid
          };
          if (json.instructions[x].jobName) {
            child.title += ' - ' + json.instructions[x].jobName;
          } else if (json.instructions[x].noticeBoardNames && json.instructions[x].noticeBoardNames.length > 0) {
            child.title += ' - ' + (json.instructions[x].TYPE === 'PostNotices' ? json.instructions[x].noticeBoardNames.join(',') : json.instructions[x].noticeBoardNames);
          } else if (json.instructions[x].demands && json.instructions[x].demands.length > 0) {
            child.title += ' - ' + json.instructions[x].demands[0].lockName;
          }
          if (json.instructions[x].label) {
            child.title += ' (' + json.instructions[x].label + ')';
          }
          if (!self.workflowService.isInstructionCollapsible(json.instructions[x].TYPE)) {
            child.isLeaf = true;
          } else {
            child.children = [];
          }
          obj.children.push(child);

          if (json.instructions[x].TYPE === 'Fork') {
            if (json.instructions[x].branches) {
              for (let i = 0; i < json.instructions[x].branches.length; i++) {
                if (json.instructions[x].branches[i].instructions) {
                  let obj1 = {
                    title: 'branch - ' + json.instructions[x].branches[i].id,
                    disabled: true,
                    key: json.instructions[x].uuid + json.instructions[x].branches[i].id,
                    children: []
                  };
                  child.children.push(obj1);
                  recursive(json.instructions[x].branches[i], obj1);
                }
              }
            }
          }

          if (json.instructions[x].instructions) {
            recursive(json.instructions[x], child);
          }

          if (json.instructions[x].then && json.instructions[x].then.instructions) {
            recursive(json.instructions[x].then, child);
          }
          if (json.instructions[x].else && json.instructions[x].else.instructions) {
            let obj = {title: "Else", disabled: true, key: json.instructions[x].uuid + 'else', children: []};
            child.children.push(obj);
            recursive(json.instructions[x].else, obj);
          }
          if (json.instructions[x].catch && json.instructions[x].catch.instructions) {
            let obj = {title: "Catch", disabled: true, key: json.instructions[x].uuid + 'catch', children: []};
            child.children.push(obj);
            recursive(json.instructions[x].catch, obj);
          }
        }
      }
    }

    recursive(this.workFlowJson, nodes);
    this.nodes = nodes.children;
    this.filteredNodes = this.nodes
  }

  expandAllTree(): void {
    this.traverseTree(this.nodes, true);
    this.nodes = [...this.nodes];
  }

  collapseAllTree(): void {
    this.traverseTree(this.nodes, false);
    this.nodes = [...this.nodes];
  }

  private traverseTree(data, isExpand): void {
    for (let i in data) {
      if (data[i] && data[i].children && data[i].children.length > 0) {
        data[i].expanded = isExpand;
        this.traverseTree(data[i].children, isExpand);
      }
    }
  }

  selectNode(uuid): void {
    const model = this.graph.getModel();
    if (model.cells) {
      for (const prop in model.cells) {
        if (model.cells[prop].getAttribute('uuid') === uuid) {
          const cell = model.cells[prop];
          let state = this.graph.view.getState(cell);
          const dom = $('#graph');
          dom.animate({
            scrollLeft: ((state.x + (state.width / 2))) - (dom.width() /2),
            scrollTop: ((state.y + (state.height / 2)) - (dom.height() /2))
          }, 200);
          this.graph.clearSelection();
          this.graph.setSelectionCell(cell);
          this.selectedKey = uuid;
          break;
        }
      }
    }
    this.filteredNodes = this.nodes
    this.searchNode.text = '';
  }

  prev(): void {
    this.navToNextCell(false);
  }

  next(): void {
    this.navToNextCell(true);
  }

  private navToNextCell(flag: boolean): void {
    let cells = this.graph.getSelectionCells();
    const self = this;
    if (cells && cells.length > 0) {
      switchToNextCell(cells[0], 0);
    }

    function switchToNextCell(cell, index) {
      let nextCell;
      if (flag) {
        const edges = self.graph.getOutgoingEdges(cell);
        if (edges[index]) {
          nextCell = edges[index].target;
        }
      } else {
        const edges = self.graph.getIncomingEdges(cell);
        if (edges[index]) {
          nextCell = edges[index].source;
        }
      }

      if (nextCell && nextCell.value?.tagName !== 'Process') {
        if (self.workflowService.checkClosingCell(nextCell.value.tagName) || nextCell.value.tagName === 'Catch') {
          if (nextCell.value.tagName === 'Join' || nextCell.value.tagName === 'EndIf') {
            const _edges = self.graph.getIncomingEdges(nextCell);
            for (let i = 0; i < _edges.length; i++) {
              if (_edges[i].source.id == cell.id) {
                if (i !== _edges.length - 1) {
                  nextCell = _edges[i].source.parent;
                  index = i + 1;
                }
                break;
              }
            }
          }
          switchToNextCell(nextCell, index);
        } else {
          self.selectNode(nextCell.getAttribute('uuid'));
        }
      }
    }
  }

  private updateWorkflow(isRemove = false): void {
    this.graph.getModel().beginUpdate();
    try {
      this.addOrderdMap = new Map();
      const mapObj: any = {
        nodeMap: this.nodeMap,
        vertixMap: this.vertixMap,
        graphView: !!this.workflowObjects,
        addOrderdMap: this.addOrderdMap,
        jobMap: this.jobMap
      };
      if (mapObj.graphView) {
        mapObj.colorCode = this.colors[0];
        if (!isRemove) {
          this.workflowArr.push({
            path: this.workFlowJson.path,
            color: mapObj.colorCode
          });
        }
      }
      if (isRemove) {
        this.graph.removeCells(this.graph.getChildCells(this.graph.getDefaultParent()), true);
      }
      this.boardMap = new Map();
      this.workflowService.createWorkflow(this.workFlowJson, {graph: this.graph}, mapObj);
      this.nodeMap = mapObj.nodeMap;
      this.vertixMap = mapObj.vertixMap;
      this.updatePositions(this.workFlowJson, this.vertixMap);
    } finally {
      // Updates the display
      this.graph.getModel().endUpdate();
      WorkflowService.executeLayout(this.graph, this.preferences);
      this.updateOrdersInGraph(false);
    }
  }

  private openModel(order: any): void {
    this.modal.create({
      nzTitle: undefined,
      nzContent: ChangeParameterModalComponent,
      nzClassName: 'lg',
      nzData: {
        schedulerId: this.controllerId,
        order,
        orderPreparation: this.orderPreparation
      },
      nzFooter: null,
      nzAutofocus: null,
      nzClosable: false,
      nzMaskClosable: false
    });
  }

  private restCall(isKill, type, order, url, deep = false, reset?): void {
    const obj: any = {
      controllerId: this.controllerId, orderIds: [order.orderId], kill: isKill, reset: reset
    };
    if (deep) {
      obj.deep = true;
    }
    if (this.preferences.auditLog) {
      const comments = {
        radio: 'predefined',
        type: 'Order',
        operation: type,
        name: order.orderId
      };
      const modal = this.modal.create({
        nzTitle: undefined,
        nzContent: CommentModalComponent,
        nzClassName: 'lg',
        nzData: {
          comments,
          obj,
          url: 'orders/' + url
        },
        nzFooter: null,
        nzAutofocus: null,
        nzClosable: false,
        nzMaskClosable: false
      });
      modal.afterClose.subscribe((res) => {
        if (res) {
          this.isProcessing = true;
          this.resetAction(5000);
        }
      });
    } else {
      this.isProcessing = true;
      this.coreService.post('orders/' + url, obj).subscribe({
        next: () => {
          this.resetAction(5000);
        }, error: () => {
          this.resetAction();
        }
      });
    }
  }

  /* ---------  action menu operations ----------------*/

  skipOperation(instruction, operation): void {
    if (this.preferences.auditLog) {
      const comments = {
        radio: 'predefined',
        type: 'Job',
        operation: operation,
        name: instruction.label
      };
      const modal = this.modal.create({
        nzTitle: undefined,
        nzContent: CommentModalComponent,
        nzData: {
          comments,
        },
        nzAutofocus: null,
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      });
      modal.afterClose.subscribe(result => {
        if (result) {
          this.isProcessing = true;
          this.skipOrStop(instruction, operation, {
            comment: result.comment,
            timeSpent: result.timeSpent,
            ticketLink: result.ticketLink
          })
        }
      });
    } else {
      this.isProcessing = true;
      this.skipOrStop(instruction, operation);
    }
  }

  private skipOrStop(data, operation, auditLog?): void {
    let obj: any = {
      controllerId: this.controllerId,
      auditLog
    };
    if (operation === 'Skip' || operation === 'Unskip') {
      obj.labels = [data.label];
      obj.workflowPath = data.path;
    } else {
      obj.positions = [JSON.parse(data.position)]
      obj.workflowId = {path: data.path, versionId: data.versionId};
    }
    this.coreService.post('workflow/' + operation.toLowerCase(), obj).subscribe({
      next: () => {
        this.resetAction(5000);
      }, error: () => {
        this.resetAction();
      }
    });
  }

  skip(instruction): void {
    this.skipOperation(instruction, 'Skip');
  }

  unskip(job): void {
    this.skipOperation(job, 'Unskip');
  }

  stop(job): void {
    this.skipOperation(job, 'Stop');
  }

  unstop(job): void {
    this.skipOperation(job, 'Unstop');
  }

  showConfiguration(argu): void {
    let nzData;
    if (argu.jobName) {
      const job = this.jobs[argu.jobName];
      const data = (job.executable.TYPE === 'ShellScriptExecutable' || job.executable.internalType === 'JavaScript_Graal') ? job.executable.script : job.executable.className;
      if (job && job.executable) {
        nzData = {
          data,
          agentName: job.agentName,
          subagentClusterId: job.subagentClusterId,
          jobName: argu.jobName,
          workflowPath: this.workFlowJson.path,
          admissionTime: job.admissionTimeScheme,
          timezone: this.workFlowJson.timeZone,
          mode: job.executable.TYPE === 'ShellScriptExecutable' ? 'shell' : 'javascript',
          isScript: (job.executable.TYPE === 'ShellScriptExecutable' || job.executable.internalType === 'JavaScript_Graal'),
          readonly: true
        };
      }
    } else if (argu.predicate) {
      nzData = {
        predicate: true,
        workflowPath: this.workFlowJson.path,
        data: argu.predicate,
        isScript: true,
        readonly: true
      };
    } else if (argu.schedule) {
      nzData = {
        schedule: JSON.parse(argu.schedule),
        workflowPath: this.workFlowJson.path,
        timezone: this.workFlowJson.timeZone
      };
    } else if (argu.noticeNames) {
      nzData = {
        noticeBoardNames: argu.noticeNames,
        type: argu.type
      };
    }
    if (nzData) {
      this.modal.create({
        nzTitle: undefined,
        nzContent: ScriptModalComponent,
        nzClassName: argu.noticeNames ? '' : 'lg script-editor2',
        nzData,
        nzFooter: null,
        nzAutofocus: null,
        nzClosable: !!argu.noticeNames,
        nzMaskClosable: !!argu.noticeNames
      });
    }
  }

  viewHistory(job): void {
    this.onClick.emit({jobName: job.jobName});
  }

  getObstacles(order, cell): void {
    if (order.state._text === 'INPROGRESS' && !order.obstacles) {
      cell.setAttribute('isCall', true);
      order.obstacles = [];
      this.coreService.post('order/obstacles', {
        controllerId: this.controllerId,
        orderId: order.orderId
      }).subscribe((res: any) => {
        order.obstacles = res.obstacles;
        cell.setAttribute('order', JSON.stringify(order));
      });
    }
  }

  showLog(order): void {
    if (order.state && (order.state._text !== 'SCHEDULED' && order.state._text !== 'PENDING')) {
      this.coreService.showOrderLogWindow(order.orderId, this.controllerId, this.workFlowJson.path, this.viewContainerRef);
    }
  }

  private resetAction(time = 100): void {
    if (this.isProcessing) {
      setTimeout(() => {
        this.isProcessing = false;
      }, time);
    }
  }

  searchNodes(keyword: string): void {
    if (!keyword.trim()) {
      this.filteredNodes = this.nodes;
      return;
    }
    this.filteredNodes = this.nodes.filter(node =>
      (node.title || '').toLowerCase().includes(keyword.toLowerCase())
    );
  }

  objectTreeSearch() {
    $('#workflowTreeSearch').focus();
    $('.editor-tree  a').addClass('hide-on-focus');
    $('.tree-search').addClass('hide-on-focus');
    }

  clearSearchInput(): void {

    this.searchNode.text = '';
    $('.editor-tree  a').removeClass('hide-on-focus');
    $('.tree-search').removeClass('hide-on-focus');
    setTimeout(() =>{
      this.filteredNodes = this.nodes
    },100)
  }

}

