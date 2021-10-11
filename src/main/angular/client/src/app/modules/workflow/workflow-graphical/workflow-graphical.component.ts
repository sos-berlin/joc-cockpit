import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
import {NzContextMenuService, NzDropdownMenuComponent} from 'ng-zorro-antd/dropdown';
import {sortBy} from 'underscore';
import {Subscription} from 'rxjs';
import {AuthService} from '../../../components/guard';
import {CoreService} from '../../../services/core.service';
import {WorkflowService} from '../../../services/workflow.service';
import {DataService} from '../../../services/data.service';
import {ResumeOrderModalComponent} from '../../../components/resume-modal/resume.component';
import {CommentModalComponent} from '../../../components/comment-modal/comment.component';
import {ChangeParameterModalComponent, ModifyStartTimeModalComponent} from '../../../components/modify-modal/modify.component';
import {ScriptModalComponent} from '../script-modal/script-modal.component';

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
declare const $;

@Component({
  selector: 'app-workflow-graphical-dialog',
  templateUrl: './dependent-workflow-dialog.html'
})
export class DependentWorkflowComponent implements OnInit, OnDestroy {
  @Input() workflow: any = {};
  @Input() permission: any = {};
  @Input() preferences: any = {};
  @Input() controllerId: any;
  @Input() recursiveCals: any;
  @Input() view: any;
  @Input() workflowFilters: any = {};

  workFlowJson: any = {};
  pageView = 'grid';
  isExpandAll: boolean;
  loading = true;

  subscription: Subscription;

  constructor(private coreService: CoreService, public activeModal: NzModalRef, private dataService: DataService,
              private workflowService: WorkflowService, private modal: NzModalService) {
    this.subscription = dataService.eventAnnounced$.subscribe(res => {
      this.refresh(res);
    });
  }

  ngOnInit(): void {
    let flag = false;
    if(this.view){
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

  refresh(args): void {
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
      this.workflowService.convertTryToRetry(this.workFlowJson, null, this.workflow.jobs);
      this.workFlowJson.name = this.workflow.path.substring(this.workflow.path.lastIndexOf('/') + 1);
      this.workFlowJson.expectedNoticeBoards = this.coreService.convertObjectToArray(res.workflow, 'expectedNoticeBoards');
      this.workFlowJson.postNoticeBoards = this.coreService.convertObjectToArray(res.workflow, 'postNoticeBoards');
      this.workFlowJson.addOrderFromWorkflows = res.workflow.addOrderFromWorkflows;
      this.workFlowJson.addOrderToWorkflows = res.workflow.addOrderToWorkflows;
      this.getOrders(this.workflow);
      setTimeout(() => {
        $('.mxTooltip').remove();
      }, 500);
    });
  }

  private getOrders(workflow): void {
    this.loading = false;
    if (this.permission && this.permission.currentController && !this.permission.currentController.orders.view) {
      return;
    }
    const obj = {
      compact: true,
      controllerId: this.controllerId,
      workflowIds: [{path: workflow.path, versionId: workflow.versionId}],
      dateTo: this.workflowFilters.date !== 'ALL' ? this.workflowFilters.date : undefined,
      timeZone: this.preferences.zone,
      limit: this.preferences.maxOrderRecords
    };
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
export class WorkflowGraphicalComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() workFlowJson: any = {};
  @Input() permission: any = {};
  @Input() preferences: any = {};
  @Input() controllerId: any;
  @Input() pageView: string;
  @Input() workflowFilters: any = {};
  @Input() orderPreparation: any = {};
  @Input() jobs: any = {};
  @Input() orders: any = [];
  @Input() isModal: boolean;
  @Input() recursiveCals: any;
  @Input() workflowObjects: any;

  loading: boolean;
  order: any;
  job: any;
  graph: any;
  vertixMap = new Map();
  mapObj = new Map();
  nodeMap = new Map();
  orderCountMap = new Map();
  boardMap = new Map();
  addOrderdMap = new Map();
  countArr = [];
  sideBar: any = {};
  isProcessing = false;

  workflowArr = [];

  colors = ['#90C7F5', '#C2b280', '#Aaf0d1', '#B38b6d', '#B2beb5', '#D4af37', '#8c92ac',
    '#FFCF8c', '#CDEB8B', '#FFC7C7', '#8B8BB4', '#Eedc82', '#B87333', '#97B0FF', '#D4af37', '#856088'];

  @ViewChild('graph', {static: true}) graphContainer: ElementRef;
  @ViewChild('outlineContainer', {static: true}) outlineContainer: ElementRef;
  @ViewChild('menu', {static: true}) menu: NzDropdownMenuComponent;

  constructor(private authService: AuthService, public coreService: CoreService, private route: ActivatedRoute,
              public workflowService: WorkflowService, public modal: NzModalService,
              private dataService: DataService, private nzContextMenuService: NzContextMenuService) {
  }

  ngAfterViewInit(): void {
    this.createEditor();
    const dom = this.isModal ? $('.graph2 #graph') : $('#graph');
    let ht = this.isModal ? 'calc(100vh - 182px)' : 'calc(100vh - 322px)';
    if (this.workflowFilters && this.workflowFilters.panelSize > 0) {
      ht = this.workflowFilters.panelSize + 'px';
    }
    dom.slimscroll({height: ht});
    /**
     * Changes the zoom on mouseWheel events
     */
    $('.graph-container').bind('mousewheel DOMMouseScroll', (event) => {
      if (this.graph) {
        if (event.ctrlKey) {
          event.preventDefault();
          if (event.originalEvent.wheelDelta > 0 || event.originalEvent.detail < 0) {
            this.graph.zoomIn();
          } else {
            this.graph.zoomOut();
          }
        } else {
          const bounds = this.graph.getGraphBounds();
          if (bounds.y < -0.05 && bounds.height > dom.height()) {
            this.graph.center(true, true, 0.5, -0.02);
          }
        }
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.orders) {
      this.updateOrder();
    }
  }

  ngOnDestroy(): void {
    if (!this.isModal) {
      $('#workflowGraphId').remove();
      $('.mxTooltip').remove();
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
          if (/^(try+)/.test(this.orders[j].position[o])) {
            this.orders[j].position[o] = 'try+0';
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
    setTimeout(() => {
      this.actual();
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
      this.graph.center(true, true, 0.5, 0.1);
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
      } else{
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

  private expandCollapseWorkflow(isExpand): void {
    let isChange = false;
    this.workflowObjects.forEach((value, key) => {
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
  }

  hideTooltip(): void {
    $('.mxTooltip').hide();
  }

  modifyOrder(): void {
    this.hideTooltip();
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: ModifyStartTimeModalComponent,
      nzClassName: 'lg',
      nzComponentParams: {
        schedulerId: this.controllerId,
        preferences: this.preferences,
        order: this.order
      },
      nzFooter: null,
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
      this.order.variables = res.variables;
      this.openModel(this.order);
    }, () => {

    });
  }

  resumeOrder(): void {
    this.hideTooltip();
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: ResumeOrderModalComponent,
      nzClassName: 'x-lg',
      nzComponentParams: {
        preferences: this.preferences,
        schedulerId: this.controllerId,
        order: this.coreService.clone(this.order)
      },
      nzFooter: null,
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

  suspendOrder(): void {
    this.restCall(false, 'Suspend', this.order, 'suspend');
  }

  suspendOrderWithKill(): void {
    this.restCall(true, 'Suspend', this.order, 'suspend');
  }

  cancelOrder(): void {
    this.restCall(false, 'Cancel', this.order, 'cancel');
  }

  cancelOrderWithKill(): void {
    this.restCall(true, 'Cancel', this.order, 'cancel');
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
    mxConstants.VERTEX_SELECTION_COLOR = null;

    // Enables snapping waypoints to terminals
    mxEdgeHandler.prototype.snapToTerminals = true;

    mxConstants.CURSOR_MOVABLE_VERTEX = 'pointer';
    graph.setConnectable(false);
    graph.setHtmlLabels(true);
    graph.setTooltips(true);
    graph.setDisconnectOnMove(false);
    graph.setCellsSelectable(false);
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
    OffPageConnectorShape.prototype.isRoundable = function() {
      return true;
    };
    OffPageConnectorShape.prototype.redrawPath = function(c, x, y, w, h) {
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
    graph.convertValueToString = function(cell) {
      return self.workflowService.convertValueToString(cell, graph);
    };

    graph.getTooltipForCell = function(cell) {
      return self.workflowService.getTooltipForCell(cell);
    };

    // Changes fill color to red on mouseover
    graph.addMouseListener({
      currentState: null,
      currentIconSet: null,
      mouseDown: function(sender, me) {
        // Hides icons on mouse down
        if (this.currentState != null) {
          this.dragLeave(me.getEvent(), this.currentState);
          this.currentState = null;
        }
      },
      mouseMove: function(sender, me) {
        if (this.currentState != null && me.getState() == this.currentState) {
          return;
        }
        let tmp = graph.view.getState(me.getCell());
        // Ignores everything but vertices
        if (graph.isMouseDown || (tmp != null && !graph.getModel().isVertex(tmp.cell))) {
          tmp = null;
        }
        if (tmp != this.currentState) {
          if (this.currentState != null) {
            this.dragLeave(me.getEvent(), this.currentState);
          }
          this.currentState = tmp;
          if (this.currentState != null) {
            this.dragEnter(me.getEvent(), this.currentState);
          }
        }
      },
      mouseUp: function() {
      },
      dragEnter: function(evt, state) {
        if (this.currentIconSet == null) {
          this.currentIconSet = new mxIconSet(state);
        }
      },
      dragLeave: function() {
        if (this.currentIconSet != null) {
          this.currentIconSet.destroy();
          this.currentIconSet = null;
        }
      }
    });


    /**
     * Function: foldCells to collapse/expand
     */
    mxGraph.prototype.foldCells = function(collapse, recurse, cells, checkFoldable) {
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
      WorkflowService.executeLayout(graph);
      self.updateOrdersInGraph(false);
      return cells;
    };

    /**
     * Function: handle a click event
     */
    graph.addListener(mxEvent.CLICK, function(sender, evt) {
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
        } else if (cell.value.tagName === 'Workflow') {
          const data = cell.value.getAttribute('data');
          if (data) {
            const workflow = JSON.parse(data);
            self.modal.create({
              nzTitle: undefined,
              nzContent: DependentWorkflowComponent,
              nzClassName: 'x-lg',
              nzComponentParams: {
                workflow,
                permission: self.permission,
                preferences: self.preferences,
                controllerId: self.controllerId,
                recursiveCals: self.recursiveCals,
                workflowFilters: self.workflowFilters
              },
              nzFooter: null,
              nzClosable: false,
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
        } else if (cell.value.tagName === 'Connection' || cell.value.tagName === 'Board') {
          let data;
          if (cell.value.tagName === 'Board') {
            data = cell.value.getAttribute('label');
          } else{
            data = cell.value.getAttribute('noticeBoardName');
          }
          if (data) {
            self.coreService.showBoard(data);
          }
        }
        evt.consume();
      }
    });

    /**
     * Overrides method to provide a cell collapse/expandable on double click
     */
    graph.addListener(mxEvent.DOUBLE_CLICK, function(sender, evt) {
      let cell = evt.getProperty('cell');
      self.sideBar = {};
      if (cell != null && cell.vertex == 1) {
        if (cell.value.tagName === 'Fork' || cell.value.tagName === 'If' || cell.value.tagName === 'Try'
          || cell.value.tagName === 'Catch' || cell.value.tagName === 'Retry' || cell.value.tagName === 'Lock') {
          const flag = cell.collapsed != true;
          graph.foldCells(flag, false, null, null, evt);
        }
      }
    });

    // Defines a new class for all icons
    function mxIconSet(state) {
      this.images = [];
      let img;
      if (state.cell && (state.cell.value.tagName === 'Order' || state.cell.value.tagName === 'Job' || state.cell.value.tagName === 'If')) {
        img = mxUtils.createImage('./assets/images/menu.svg');
        let x = state.x - (20 * state.shape.scale), y = state.y - (8 * state.shape.scale);
        if (state.cell.value.tagName !== 'Job') {
          y = y + (state.cell.geometry.height / 2 * state.shape.scale) - 4;
          x = x + 2;
        }
        img.style.left = (x + 5) + 'px';
        img.style.top = y + 'px';
        mxEvent.addListener(img, 'click',
          mxUtils.bind(this, function(evt) {
            self.order = null;
            self.job = null;
            let data;
            if (state.cell.value.tagName === 'Order') {
              data = state.cell.getAttribute('order');
              data = JSON.parse(data);
            } else if (state.cell.value.tagName === 'Job') {
              const jobName = state.cell.value.getAttribute('jobName');
              const documentationName = state.cell.value.getAttribute('documentationName');
              data = {jobName, documentationName};
            } else if (state.cell.value.tagName === 'If') {
              const predicate = state.cell.value.getAttribute('predicate');
              data = {predicate};
            }
            try {
              if (self.menu) {
                setTimeout(() => {
                  if (data.jobName || data.predicate) {
                    self.job = data;
                  } else {
                    self.order = data;
                  }
                  self.nzContextMenuService.create(evt, self.menu);
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
        }
      }
    }

    mxIconSet.prototype.destroy = function() {
      if (this.images != null) {
        for (var i = 0; i < this.images.length; i++) {
          var img = this.images[i];
          img.parentNode.removeChild(img);
        }
      }

      this.images = null;
      if (self.order) {
        self.order = null;
      }
    };
  }

  private updatePositions(mainJson, vertixMap): void {
    const self = this;
    const doc = mxUtils.createXmlDocument();
    this.orderCountMap = new Map();
    const graph = this.graph;

    function createWorkflowNode(workflow, cell, type): void {
      if (!self.workflowObjects) {
        const node = doc.createElement('Workflow');
        node.setAttribute('workflowName', workflow.path.substring(workflow.path.lastIndexOf('/') + 1));
        node.setAttribute('data', JSON.stringify(workflow));
        node.setAttribute('type', type);
        const w1 = graph.insertVertex(cell.parent, null, node, 0, 0, 128, 36, type);
        if (type === 'expect') {
          graph.insertEdge(cell.parent, null, doc.createElement('Connection'), w1, cell);
        } else {
          graph.insertEdge(cell.parent, null, doc.createElement('Connection'), cell, w1);
        }
      } else {
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
            workflowName : self.workFlowJson.name || self.workFlowJson.path,
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
          if (json.instructions[x].TYPE === 'ExpectNotice') {
            const cell = vertixMap.get(JSON.stringify(json.instructions[x].position));
            if (cell) {
              if (mainJson.expectedNoticeBoards) {
                for (const prop in mainJson.expectedNoticeBoards) {
                  if (mainJson.expectedNoticeBoards[prop].name === json.instructions[x].noticeBoardName) {
                    const incomingEdges = graph.getIncomingEdges(cell);
                    if (incomingEdges && incomingEdges.length > 0) {
                      for (const edge in incomingEdges) {
                        if (incomingEdges[edge].source && incomingEdges[edge].source.value && incomingEdges[edge].source.value.tagName === 'Process') {
                          graph.removeCells([incomingEdges[edge].source], true);
                          break;
                        }
                      }
                    }
                    mainJson.expectedNoticeBoards[prop].value.forEach((workflow) => {
                      createWorkflowNode(workflow, cell, 'expect');
                    });
                    break;
                  }
                }
              }
            }
          }

          if (json.instructions[x].TYPE === 'PostNotice') {
            const cell = vertixMap.get(JSON.stringify(json.instructions[x].position));
            if (cell) {
              if (mainJson.postNoticeBoards) {
                for (const prop in mainJson.postNoticeBoards) {
                  if (mainJson.postNoticeBoards[prop].name === json.instructions[x].noticeBoardName) {
                    const outgoingEdges = graph.getOutgoingEdges(cell);
                    if (outgoingEdges && outgoingEdges.length > 0) {
                      for (const edge in outgoingEdges) {
                        if (outgoingEdges[edge].target && outgoingEdges[edge].target.value && outgoingEdges[edge].target.value.tagName === 'ImplicitEnd') {
                          graph.removeCells([outgoingEdges[edge].target], true);
                          break;
                        }
                      }
                    }
                    mainJson.postNoticeBoards[prop].value.forEach((workflow) => {
                      createWorkflowNode(workflow, cell, 'post');
                    });
                    break;
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
          createWorkflowNode(workflow, cell, 'expect');
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
                  positions.forEach((pos, index) => {
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

  private updateWorkflow(isRemove = false): void {
    this.graph.getModel().beginUpdate();
    try {
      this.addOrderdMap = new Map();
      const mapObj: any = {nodeMap: this.nodeMap, vertixMap: this.vertixMap, graphView: !!this.workflowObjects, addOrderdMap: this.addOrderdMap};
      if (mapObj.graphView) {
        mapObj.colorCode = this.colors[0];
        this.workflowArr.push({
          path: this.workFlowJson.path,
          color: mapObj.colorCode
        });
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
      WorkflowService.executeLayout(this.graph);
      this.updateOrdersInGraph(false);
    }
  }

  private openModel(order: any): void {
    this.hideTooltip();
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: ChangeParameterModalComponent,
      nzClassName: 'lg',
      nzComponentParams: {
        schedulerId: this.controllerId,
        order,
        orderPreparation: this.orderPreparation
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        if (order && order.show) {
          this.coreService.post('daily_plan/order/variables', {
            orderId: order.orderId,
            controllerId: this.controllerId
          }).subscribe((res: any) => {
            order.variables = res.variables;
          });
        }
      }
    });
  }

  private restCall(isKill, type, order, url): void {
    const obj: any = {
      controllerId: this.controllerId, orderIds: [order.orderId], kill: isKill
    };
    if (this.preferences.auditLog) {
      const comments = {
        radio: 'predefined',
        type: 'Order',
        operation: type,
        name: order.orderId
      };
      this.hideTooltip();
      const modal = this.modal.create({
        nzTitle: undefined,
        nzContent: CommentModalComponent,
        nzClassName: 'lg',
        nzComponentParams: {
          comments,
          obj,
          url: 'orders/' + url
        },
        nzFooter: null,
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
      this.coreService.post('orders/' + url, obj).subscribe(() => {
        this.resetAction(5000);
      }, () => {
        this.resetAction();
      });
    }
  }

  /* --------- Job action menu operations ----------------*/

  showConfiguration(argu): void {
    let nzComponentParams;
    if (argu.jobName) {
      const job = this.jobs[argu.jobName];
      const data = job.executable.TYPE === 'ShellScriptExecutable' ? job.executable.script : job.executable.className;
      if (job && job.executable) {
        nzComponentParams = {
          data,
          jobName: argu.jobName,
          admissionTime: job.admissionTimeScheme,
          timezone: this.workFlowJson.timeZone,
          isScript: job.executable.TYPE === 'ShellScriptExecutable',
          readonly: true
        };
      }
    } else {
      nzComponentParams = {
        predicate: true,
        data: argu.predicate,
        isScript: true,
        readonly: true
      };
    }
    if (nzComponentParams) {
      this.hideTooltip();
      this.modal.create({
        nzTitle: undefined,
        nzContent: ScriptModalComponent,
        nzClassName: 'lg',
        nzComponentParams,
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      });
    }
  }

  private resetAction(time = 100): void {
    if (this.isProcessing) {
      setTimeout(() => {
        this.isProcessing = false;
      }, time);
    }
  }
}

