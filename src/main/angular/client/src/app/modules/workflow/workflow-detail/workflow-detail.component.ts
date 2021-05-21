import {Component, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {NzModalService} from 'ng-zorro-antd/modal';
import {NzContextMenuService, NzDropdownMenuComponent} from 'ng-zorro-antd/dropdown';
import {isEmpty, sortBy} from 'underscore';
import {Subscription} from 'rxjs';
import {AuthService} from '../../../components/guard';
import {CoreService} from '../../../services/core.service';
import {WorkflowService} from '../../../services/workflow.service';
import {AddOrderModalComponent} from '../workflow-action/workflow-action.component';
import {CalendarModalComponent} from '../../../components/calendar-modal/calendar.component';
import {DataService} from '../../../services/data.service';
import {ResumeOrderModalComponent} from '../../../components/resume-modal/resume.component';
import {CommentModalComponent} from '../../../components/comment-modal/comment.component';
import {ChangeParameterModalComponent, ModifyStartTimeModalComponent} from '../../../components/modify-modal/modify.component';
import {ScriptModalComponent} from '../script-modal/script-modal.component';

declare const mxEditor: any;
declare const mxUtils: any;
declare const mxEvent: any;
declare const mxClient: any;
declare const mxEdgeHandler: any;
declare const mxGraphHandler: any;
declare const mxGraph: any;
declare const mxImage: any;
declare const mxOutline: any;
declare const mxConstants: any;
declare const mxEventObject: any;

declare const $;

@Component({
  selector: 'app-order',
  templateUrl: './workflow-detail.component.html',
  styleUrls: ['./workflow-detail.component.css']
})
export class WorkflowDetailComponent implements OnInit, OnDestroy {
  path: string;
  versionId: string;
  workFlowJson: any = {};
  orderRequirements: any = {};
  loading: boolean;
  schedulerIds: any = {};
  preferences: any = {};
  permission: any = {};
  workflow: any = {};
  isExpandAll: boolean;
  pageView: any;
  editor: any;
  order: any;
  job: any;
  selectedPath: string;
  workflowFilters: any = {};
  vertixMap = new Map();
  nodeMap = new Map();
  configXml = './assets/mxgraph/config/diagrameditor.xml';
  mapObj = new Map();
  orderCountMap = new Map();
  countArr = [];
  sideBar: any = {};
  subscription: Subscription;

  filterBtn: any = [
    {date: 'ALL', text: 'all'},
    {date: '1d', text: 'today'},
    {date: '1h', text: 'next1'},
    {date: '12h', text: 'next12'},
    {date: '24h', text: 'next24'}
  ];

  @ViewChild('menu', {static: true}) menu: NzDropdownMenuComponent;

  constructor(private authService: AuthService, public coreService: CoreService, private route: ActivatedRoute,
              public workflowService: WorkflowService, public modal: NzModalService,
              private dataService: DataService, private nzContextMenuService: NzContextMenuService) {
    this.subscription = dataService.eventAnnounced$.subscribe(res => {
      this.refresh(res);
    });
  }

  ngOnInit(): void {
    this.path = this.route.snapshot.paramMap.get('path');
    this.versionId = this.route.snapshot.paramMap.get('versionId');
    this.workflowFilters = this.coreService.getWorkflowDetailTab();
    this.pageView = this.workflowFilters.pageView;
    this.init();
    const dom = $('#graph');
    let ht = 'calc(100vh - 322px)';
    if (this.workflowFilters.panelSize > 0) {
      ht = this.workflowFilters.panelSize + 'px';
    }
    dom.slimscroll({height: ht});
    /**
     * Changes the zoom on mouseWheel events
     */
    $('.graph-container').bind('mousewheel DOMMouseScroll', (event) => {
      if (this.editor) {
        if (event.ctrlKey) {
          event.preventDefault();
          if (event.originalEvent.wheelDelta > 0 || event.originalEvent.detail < 0) {
            this.editor.execute('zoomIn');
          } else {
            this.editor.execute('zoomOut');
          }
        } else {
          const bounds = this.editor.graph.getGraphBounds();
          if (bounds.y < -0.05 && bounds.height > dom.height()) {
            this.editor.graph.center(true, true, 0.5, -0.02);
          }
        }
      }
    });
    this.showAndHideBtn();
  }

  refresh(args): void {
    if (args.eventSnapshots && args.eventSnapshots.length > 0) {
      for (let j = 0; j < args.eventSnapshots.length; j++) {
        if (args.eventSnapshots[j].eventType === 'WorkflowStateChanged' && args.eventSnapshots[j].workflow
          && this.path === args.eventSnapshots[j].workflow.path && this.versionId === args.eventSnapshots[j].workflow.versionId) {
          this.getOrders(this.coreService.clone(this.workflow), false);
          break;
        }
      }
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    try {
      if (this.editor) {
        this.editor.destroy();
        this.editor = null;
      }
    } catch (e) {
      console.error(e);
    }
  }

  @HostListener('window:scroll', ['$event'])
  scrollHandler(): void {
    this.showAndHideBtn();
  }

  backClicked(): void {
    window.history.back();
  }

  /* ---------------------------- Broadcast messages ----------------------------------*/

  isWorkflowStored(json, isFirst): void {
    if (isFirst) {
      this.workFlowJson = json;
      this.workFlowJson.name = json.path.substring(json.path.lastIndexOf('/') + 1);
      if (json && !isEmpty(json)) {
        if (json && !isEmpty(json)) {
          this.initEditorConf(this.editor, true);
          setTimeout(() => {
            this.actual();
          }, 0);
        }
      }
    } else {
      if (this.pageView === 'grid') {
        this.updateOrdersInGraph(false);
      }
    }
  }

  /**
   * Constructs a new application (returns an mxEditor instance)
   */
  createEditor(config): void {
    let editor = null;
    try {
      if (!mxClient.isBrowserSupported()) {
        mxUtils.error('Browser is not supported!', 200, false);
      } else {
        const node = mxUtils.load(config).getDocumentElement();
        editor = new mxEditor(node);
        this.editor = editor;
        this.initEditorConf(editor, null);
        const outln = document.getElementById('outlineContainer');
        new mxOutline(editor.graph, outln);
      }
    } catch (e) {
      // Shows an error message if the editor cannot start
      mxUtils.alert('Cannot start application: ' + e.message);
      console.error(e);
    }
  }

  zoomIn(): void {
    if (this.editor && this.editor.graph) {
      this.editor.graph.zoomIn();
    }
  }

  zoomOut(): void {
    if (this.editor && this.editor.graph) {
      this.editor.graph.zoomOut();
    }
  }

  actual(): void {
    if (this.editor && this.editor.graph) {
      this.editor.graph.zoomActual();
      this.editor.graph.center(true, true, 0.5, 0.1);
    }
  }

  fit(): void {
    if (this.editor && this.editor.graph) {
      this.editor.graph.fit();
      this.editor.graph.center(true, true, 0.5, 0.1);
    }
  }

  expandAll(): void {
    if (this.pageView === 'list') {
      this.isExpandAll = true;
    } else {
      if (this.editor.graph.isEnabled()) {
        let cells = this.editor.graph.getChildVertices();
        this.editor.graph.foldCells(false, true, cells, null, null);
      }
    }
  }

  collapseAll(): void {
    if (this.pageView === 'list') {
      this.isExpandAll = false;
    } else {
      if (this.editor.graph.isEnabled()) {
        let cells = this.editor.graph.getChildVertices();
        this.editor.graph.foldCells(true, true, cells, null, null);
      }
    }
  }

  scrollTop(): void {
    $(window).scrollTop(0);
  }

  scrollBottom(): void {
    $(window).scrollTop($('body').height());
  }

  setView(view): void {
    this.pageView = view;
    this.showAndHideBtn();
    if (this.pageView === 'grid') {
      this.updateOrdersInGraph(false);
      setTimeout(() => {
        this.actual();
      }, 10);
    }
  }

  addOrder(): void {
    this.modal.create({
      nzTitle: undefined,
      nzContent: AddOrderModalComponent,
      nzClassName: 'lg',
      nzComponentParams: {
        preferences: this.preferences,
        permission: this.permission,
        schedulerId: this.schedulerIds.selected,
        workflow: this.workFlowJson
      },
      nzFooter: null,
      nzClosable: false
    });
  }

  showDailyPlan(): void {
    this.modal.create({
      nzTitle: undefined,
      nzContent: CalendarModalComponent,
      nzClassName: 'lg',
      nzComponentParams: {
        path: this.workFlowJson.path
      },
      nzFooter: null,
      nzClosable: false
    });
  }

  loadOrders(date): void {
    this.workflowFilters.date = date;
    this.getOrders(this.coreService.clone(this.workflow), false);
  }

  closeMenu(): void {
    this.order = null;
    this.job = null;
  }

  showPanelFuc(order: any): void {
    if (order.arguments && !order.arguments[0]) {
      order.arguments = Object.entries(order.arguments).map(([k, v]) => {
        return {name: k, value: v};
      });
    }
    order.show = true;
  }

  modifyOrder(): void {
    this.modal.create({
      nzTitle: undefined,
      nzContent: ModifyStartTimeModalComponent,
      nzComponentParams: {
        schedulerId: this.schedulerIds.selected,
        preferences: this.preferences,
        order: this.order
      },
      nzFooter: null,
      nzClosable: false
    });
  }

  changeParameter(): void {
    this.coreService.post('daily_plan/orders/variables', {
      orderId: this.order.orderId,
      controllerId: this.schedulerIds.selected
    }).subscribe((res: any) => {
      this.order.variables = res.variables;
      this.openModel(this.order);
    }, () => {

    });
  }

  resumeOrder(): void {
    this.modal.create({
      nzTitle: undefined,
      nzContent: ResumeOrderModalComponent,
      nzComponentParams: {
        preferences: this.preferences,
        permission: this.permission,
        schedulerId: this.schedulerIds.selected,
        order: this.coreService.clone(this.order)
      },
      nzFooter: null,
      nzClosable: false
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

  private showAndHideBtn(): void {
    if (window.scrollY > 50) {
      $('.scrollBottom-btn').hide();
      $('.scrolltop-btn').show();
    } else {
      $('.scrollBottom-btn').show();
      $('.scrolltop-btn').hide();
    }
  }

  private init(): void {
    if (sessionStorage.preferences) {
      this.preferences = JSON.parse(sessionStorage.preferences);
    }
    if (!(this.preferences.theme === 'light' || this.preferences.theme === 'lighter' || !this.preferences.theme)) {
      this.configXml = './assets/mxgraph/config/diagrameditor-dark.xml';
      this.workflowService.init('dark');
    } else {
      this.workflowService.init('light');
    }
    this.schedulerIds = JSON.parse(this.authService.scheduleIds) || {};
    this.permission = JSON.parse(this.authService.permission) || {};
    this.coreService.post('workflow', {
      controllerId: this.schedulerIds.selected,
      workflowId: {path: this.path, versionId: this.versionId}
    }).subscribe((res: any) => {
      this.workflow = this.coreService.clone(res.workflow);
      this.orderRequirements = res.workflow.orderRequirements;
      this.createEditor(this.configXml);
      this.getOrders(res.workflow, true);
    }, () => {
      this.loading = true;
    });

  }

  private getOrders(workflow, isFirst): void {
    const obj = {
      compact: true,
      controllerId: this.schedulerIds.selected,
      workflowIds: [{path: workflow.path, versionId: workflow.versionId}],
      dateTo: this.workflowFilters.date !== 'ALL' ? this.workflowFilters.date : undefined,
      timeZone: this.preferences.zone
    };
    this.coreService.post('orders', obj).subscribe((res: any) => {
      this.mapObj = new Map();
      this.workflow.orders = res.orders;
      this.workflow.numOfOrders = res.orders.length;
      this.workflow.ordersSummary = {};
      if (res.orders) {
        res.orders = sortBy(res.orders, 'scheduledFor');
        for (let j = 0; j < res.orders.length; j++) {
          let arr = [res.orders[j]];
          if (this.mapObj.has(JSON.stringify(res.orders[j].position))) {
            arr = arr.concat(this.mapObj.get(JSON.stringify(res.orders[j].position)));
          }
          for (const o in res.orders[j].position) {
            if (/^(try+)/.test(res.orders[j].position[o])) {
              res.orders[j].position[o] = 'try+0';
            }
          }
          this.mapObj.set(JSON.stringify(res.orders[j].position), arr);
          const state = res.orders[j].state._text.toLowerCase();
          if (this.workflow.ordersSummary[state]) {
            this.workflow.ordersSummary[state] = this.workflow.ordersSummary[state] + 1;
          } else {
            this.workflow.ordersSummary[state] = 1;
          }
        }
      }
      this.isWorkflowStored(workflow, isFirst);
      this.loading = true;
      this.checkSideBar();
    }, () => {
      this.isWorkflowStored(workflow, isFirst);
      this.loading = true;
    });
  }

  viewOrders(workflow): void {
    this.sideBar = {
      isVisible: true,
      orders: workflow.orders
    };
  }

  private checkSideBar(): void {
    if (this.sideBar.isVisible) {
      if (this.sideBar.orders.length > 0) {
        this.sideBar.orders = this.mapObj.get(JSON.stringify(this.sideBar.orders[0].position));
      }
    }
  }

  private initEditorConf(editor, _xml: any): void {
    const self = this;
    const graph = editor.graph;
    if (!_xml) {

      // Alt disables guides
      mxGraphHandler.prototype.guidesEnabled = true;
      mxGraph.prototype.cellsResizable = false;
      mxGraph.prototype.multigraph = false;
      mxGraph.prototype.allowDanglingEdges = false;
      mxGraph.prototype.cellsLocked = true;
      mxGraph.prototype.foldingEnabled = true;
      mxConstants.VERTEX_SELECTION_COLOR = null;

      if (this.preferences.theme !== 'light' && this.preferences.theme !== 'lighter' || !this.preferences.theme) {
        let style = graph.getStylesheet().getDefaultEdgeStyle();
        style[mxConstants.STYLE_FONTCOLOR] = '#ffffff';
        let style2 = graph.getStylesheet().getDefaultEdgeStyle();
        if (this.preferences.theme === 'blue-lt') {
          style2[mxConstants.STYLE_LABEL_BACKGROUNDCOLOR] = 'rgba(70, 82, 95, 0.6)';
        } else if (this.preferences.theme === 'blue') {
          style2[mxConstants.STYLE_LABEL_BACKGROUNDCOLOR] = 'rgba(50, 70, 90, 0.61)';
        } else if (this.preferences.theme === 'cyan') {
          style2[mxConstants.STYLE_LABEL_BACKGROUNDCOLOR] = 'rgba(29, 29, 28, 0.5)';
        } else if (this.preferences.theme === 'grey') {
          style2[mxConstants.STYLE_LABEL_BACKGROUNDCOLOR] = 'rgba(78, 84, 92, 0.62)';
        }
        mxGraph.prototype.collapsedImage = new mxImage('./assets/mxgraph/images/collapsed-white.png', 12, 12);
        mxGraph.prototype.expandedImage = new mxImage('./assets/mxgraph/images/expanded-white.png', 12, 12);
      } else {
        mxGraph.prototype.collapsedImage = new mxImage('./assets/mxgraph/images/collapsed.png', 12, 12);
        mxGraph.prototype.expandedImage = new mxImage('./assets/mxgraph/images/expanded.png', 12, 12);
      }

      // Enables snapping waypoints to terminals
      mxEdgeHandler.prototype.snapToTerminals = true;

      graph.setConnectable(false);
      graph.setHtmlLabels(true);
      graph.setDisconnectOnMove(false);
      graph.collapseToPreferredSize = false;
      graph.constrainChildren = false;
      graph.extendParentsOnAdd = false;
      graph.extendParents = false;

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
        mouseUp: function(sender, me) {
        },
        dragEnter: function(evt, state, cell) {
          if (this.currentIconSet == null) {
            this.currentIconSet = new mxIconSet(state);
          }
        },
        dragLeave: function(evt, state) {
          if (this.currentIconSet != null) {
            this.currentIconSet.destroy();
            this.currentIconSet = null;
          }
        }
      });

      /**
       * Function: foldCells to collapse/expand
       */
      mxGraph.prototype.foldCells = function(collapse, recurse, cells, checkFoldable, evt) {
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
        let cell = evt.getProperty('cell'); // cell may be null
        if (cell != null) {
          if (cell.value.tagName === 'Count') {
            let orders = cell.getAttribute('orders');
            self.sideBar = {
              isVisible: true,
              orders: JSON.parse(orders)
            };
          } else if (cell.value.tagName === 'Job') {
            self.showConfiguration(cell.value.getAttribute('jobName'));
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
        if (state.cell && (state.cell.value.tagName === 'Order' || state.cell.value.tagName === 'Job')) {
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
              } else {
                data = {jobName: state.cell.value.getAttribute('jobName')};
              }
              try {
                if (self.menu) {
                  setTimeout(() => {
                    if (data.jobName) {
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

      this.makeCenter();
      WorkflowService.executeLayout(graph);
    } else {
      this.updateXMLJSON();
    }
  }

  private makeCenter(): void {
    setTimeout(() => {
      if (this.editor && this.editor.graph) {
        this.editor.graph.zoomActual();
        this.editor.graph.center(true, true, 0.5, 0.1);
      }
    }, 50);
  }

  private updatePositions(mainJson): void {
    const self = this;
    this.orderCountMap = new Map();

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

    recursive(mainJson);
  }

  private updateXMLJSON(): void {
    let graph = this.editor.graph;
    if (!isEmpty(this.workFlowJson)) {
      this.workflowService.convertTryToRetry(this.workFlowJson, () => {
        this.updateWorkflow(graph);
      });
    }
  }

  private updateOrdersInGraph(isCollapse): void {
    this.closeMenu();
    if (this.editor) {
      const graph = this.editor.graph;
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
                const edge = this.createOrder(graph, doc, parent, node);
                if (edge) {
                  edges.push(edge);
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

  private createOrder(graph, doc, parent, node): any {
    const position = node.getAttribute('position');
    let edge = null;
    if (position) {
      if (this.mapObj.get(position)) {
        let orders = this.mapObj.get(position);
        const len = orders.length < 4 ? orders.length : 3;
        for (let i = 0; i < len; i++) {
          const _node = doc.createElement('Order');
          _node.setAttribute('order', JSON.stringify(orders[i]));
          let x = node.geometry.x + node.geometry.width + 50 + (i * 5);
          let y = node.geometry.y - 40 + (i * 5);
          const v1 = graph.insertVertex(parent, null, _node, x, y, 120, 36, 'order');
          // Create badge to show total orders count
          if (orders.length > 1 && (i === 2 || i === orders.length - 1)) {
            const _nodeCount = doc.createElement('Count');
            _nodeCount.setAttribute('count', orders.length);
            _nodeCount.setAttribute('orders', JSON.stringify(orders));
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

  private updateWorkflow(graph): void {
    graph.getModel().beginUpdate();
    try {
      let mapObj = {nodeMap: this.nodeMap, vertixMap: this.vertixMap};
      this.workflowService.createWorkflow(this.workFlowJson, this.editor, mapObj);
      this.nodeMap = mapObj.nodeMap;
      this.vertixMap = mapObj.vertixMap;
      this.updatePositions(this.workFlowJson);
    } finally {
      // Updates the display
      graph.getModel().endUpdate();
      WorkflowService.executeLayout(graph);
      this.updateOrdersInGraph(false);
    }
  }

  private openModel(order: any): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: ChangeParameterModalComponent,
      nzComponentParams: {
        schedulerId: this.schedulerIds.selected,
        order,
        orderRequirements: this.orderRequirements
      },
      nzFooter: null,
      nzClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        if (order && order.show) {
          this.coreService.post('daily_plan/orders/variables', {
            orderId: order.orderId,
            controllerId: this.schedulerIds.selected
          }).subscribe((res: any) => {
            order.variables = res.variables;

          });
        }
      }
    });
  }

  private restCall(isKill, type, order, url): void {
    const obj: any = {
      controllerId: this.schedulerIds.selected, orderIds: [order.orderId], kill: isKill
    };
    if (this.preferences.auditLog) {
      const comments = {
        radio: 'predefined',
        type: 'Order',
        operation: type,
        name: order.orderId
      };
      this.modal.create({
        nzTitle: undefined,
        nzContent: CommentModalComponent,
        nzClassName: 'lg',
        nzComponentParams: {
          comments,
          obj,
          url: 'orders/' + url
        },
        nzFooter: null,
        nzClosable: false
      });
    } else {
      this.coreService.post('orders/' + url, obj).subscribe(() => {
      });
    }
  }

  /* --------- Job action menu operations ----------------*/

  showConfiguration(jobName): void {
    const job = this.workflow.jobs[jobName];
    const data = job.executable.TYPE === 'ScriptExecutable' ? job.executable.script : job.executable.className;
    if (job && job.executable) {
      this.modal.create({
        nzTitle: undefined,
        nzContent: ScriptModalComponent,
        nzClassName: 'lg',
        nzComponentParams: {
          data,
          jobName,
          isScript: job.executable.TYPE === 'ScriptExecutable'
        },
        nzFooter: null,
        nzClosable: false
      });
    }
  }

  viewDocumentation(): void {

  }
}
