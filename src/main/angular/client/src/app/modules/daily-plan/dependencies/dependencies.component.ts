import {Component, SimpleChanges, Input, ViewChild, ElementRef, Output, EventEmitter} from '@angular/core';
import {NzModalRef} from "ng-zorro-antd/modal";
import {CoreService} from "../../../services/core.service";
import {NzTreeNodeOptions} from 'ng-zorro-antd/tree';
import {Subject, Subscription} from 'rxjs';
import {DataService} from '../../../services/data.service';
import {NzDrawerComponent} from "ng-zorro-antd/drawer"
import {WorkflowService} from "../../../services/workflow.service";
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
      return cell.getAttribute('fullLabel') || cell.value;
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
      const noticeBoardNode = this.createNode(parent, noticeBoardPath, 300, 100, 'fillColor=yellow');

      const postingNodes = (this.workflowData.noticeBoard?.postingWorkflows || []).map((wf: any, index: number) => {
        console.log(wf.path,">>")
        return this.createNode(parent, this.isPathDisplay ? wf?.path?.split('/').pop() : wf?.path, 100, 200 + index * 70, 'fillColor=lightblue');
      });

      const expectingNodes = (this.workflowData.noticeBoard?.expectingWorkflows || []).map((wf: any, index: number) => {
        return this.createNode(parent, this.isPathDisplay ? wf?.path?.split('/').pop() : wf?.path, 500, 200 + index * 70, 'fillColor=lightgreen');
      });

      postingNodes.forEach(node => {
        this.graph.insertEdge(parent, null, "", node, noticeBoardNode, 'edgeStyle=elbowEdgeStyle;rounded=1;orthogonal=1;strokeWidth=2;');
      });

      expectingNodes.forEach(node => {
        this.graph.insertEdge(parent, null, "", noticeBoardNode, node, 'edgeStyle=elbowEdgeStyle;rounded=1;orthogonal=1;strokeWidth=2;');
      });

    } finally {
      this.graph.getModel().endUpdate();
      this.graph.center(true, true);
    }
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

  private createNode(parent: any, label: string, x: number, y: number, style: string) {
    const maxLength = 20;
    const displayLabel = label.length > maxLength ? label.substring(0, maxLength) + '...' : label;

    const vertex = this.graph.insertVertex(parent, null, displayLabel, x, y, 150, 50, style);

    vertex.setAttribute('fullLabel', label);

    return vertex;
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

  selectedDate: Date;
  isLoaded: boolean;
  data: any;
  plansFilters: any = {filter: {}};
  noticeBoards = []
  allChecked = false;
  searchValue = '';
  indeterminate = false;
  isVisible = false;
  noticePath: any
  isPathDisplay = true
  @ViewChild('graphContainer') graphContainer!: ElementRef;

  constructor(public coreService: CoreService) {
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

  loadPlans(): void {
    this.isLoaded = false;
    let planIds
    if (this.plansFilters.filter.calView === 'Plannable') {
      planIds = 'DailyPlan'
    } else {
      planIds = 'Global';
    }
    this.coreService.post('plans', {
      controllerId: this.schedulerId,
      planKeys: [this.coreService.getDateByFormat(this.selectedDate, this.preferences.zone, 'YYYY-MM-DD')],
      planSchemaIds: [planIds],
      compact: false
    }).subscribe((res) => {
      this.data = res
      this.processData(res)
      this.isLoaded = true;
    });
  }

  setView(view): void {
    this.plansFilters.filter.calView = view;
    this.loadPlans();
  }

  processData(data: { plans?: { noticeBoards?: any[] }[] }) {
    if (!data?.plans) return;

    this.noticeBoards = Array.from(
      new Set(data.plans.flatMap(plan => plan.noticeBoards || []))
    ).map((board: any) => ({
      path: this.isPathDisplay ? board?.path?.split('/').pop() : board?.path,
      numOfNotices: board?.numOfNotices,
      numOfExpectedNotices: board?.numOfExpectedNotices,
      numOfExpectingOrders: board?.numOfExpectingOrders,
      numOfPostedNotices: board?.numOfPostedNotices,
      numOfAnnouncements: board?.numOfAnnouncements,
      versionDate: board?.versionDate,
      checked: board?.checked ?? false
    }));

  }


  getStatusClass(node: NzTreeNodeOptions): string {
    if (node.title.includes("WAITING")) return "status-expected";
    if (node.title.includes("ANNOUNCED")) return "status-announced";
    if (node.title.includes("POSTED")) return "status-posted";
    return "";
  }

  navToInventoryTab(data, type): void {
    this.coreService.navToInventoryTab(data, type);
  }

  showBoard(board): void {
    this.coreService.showBoard(board);
  }

  showWorkflow(workflow, version): void {
    this.coreService.showWorkflow(workflow, version);
  }

  checkBoxChange(data): void {
  }

  onExpand(event: any): void {
    if (event.node && event.node.origin.type === 'NOTICEBOARD') {
      if (event.node.isExpanded) {
        // this.loadAdditionalData(event.node.origin.path);
      }
    }
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
}
