import {Component, SimpleChanges, Input, ViewChild, ElementRef} from '@angular/core';
import {NzModalRef} from "ng-zorro-antd/modal";
import {CoreService} from "../../../services/core.service";
import {NzTreeNodeOptions} from 'ng-zorro-antd/tree';
import {Subject, Subscription} from 'rxjs';
import {DataService} from '../../../services/data.service';

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
  configXml = './assets/mxgraph/config/diagram.xml';
  indeterminate = false;
  private graph!: any;
  private editor!: any;
  private pendingHTTPRequests$ = new Subject<void>();
  private subscription: Subscription;
  private workflowData: any
  @ViewChild('graphContainer') graphContainer!: ElementRef;

  constructor(public coreService: CoreService, private dataService: DataService) {
    this.subscription = dataService.eventAnnounced$.subscribe(res => this.refreshGraph(res));
  }

  ngOnInit(): void {
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

  ngAfterViewInit() {
    this.initGraph();
  }

  ngOnDestroy(): void {
    this.plansFilters.selectedDate = this.selectedDate;
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
    this.graph.setCellsMovable(false); // ✅ Prevent dragging
    this.graph.setCellsLocked(true); // ✅ Fully lock graph nodes

    // Enable zooming & panning
    mxGraphHandler.prototype.guidesEnabled = true;
    mxGraph.prototype.cellsResizable = false;
    mxGraph.prototype.multigraph = false;
    mxGraph.prototype.allowDanglingEdges = false;
    mxGraph.prototype.foldingEnabled = true;
    mxConstants.VERTEX_SELECTION_COLOR = null;
    mxConstants.EDGE_SELECTION_COLOR = null;
    mxConstants.GUIDE_COLOR = null;

    mxEdgeHandler.prototype.snapToTerminals = true;

  }


  private loadGraphData(noticeBoardPath: string) {
    if (!this.workflowData) return;

    const parent = this.graph.getDefaultParent();
    this.graph.getModel().beginUpdate();

    try {
      const noticeBoardNode = this.createNode(parent, noticeBoardPath, 300, 100, 'fillColor=yellow');

      const postingNodes = (this.workflowData.noticeBoard?.postingWorkflows || []).map((wf: any, index: number) => {
        return this.createNode(parent, wf.path, 50, 50 + index * 70, 'fillColor=lightblue');
      });

      const expectingNodes = (this.workflowData.noticeBoard?.expectingWorkflows || []).map((wf: any, index: number) => {
        return this.createNode(parent, wf.path, 550, 50 + index * 70, 'fillColor=lightgreen');
      });

      postingNodes.forEach(node => {
        this.graph.insertEdge(parent, null, "", node, noticeBoardNode);
      });

      expectingNodes.forEach(node => {
        this.graph.insertEdge(parent, null, "", noticeBoardNode, node);
      });

    } finally {
      this.graph.getModel().endUpdate();
    }
  }

  private createNode(parent: any, label: string, x: number, y: number, style: string) {
    return this.graph.insertVertex(parent, null, label, x, y, 150, 50, style);
  }

  private refreshGraph(event: any) {
    this.graph.refresh();
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
      compact: true
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
      path: board?.path,
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
        this.loadAdditionalData(event.node.origin.path);
      }
    }
  }

  loadAdditionalData(noticeBoardPath: string) {
    this.coreService.post('notice/board/dependencies', {
      controllerId: this.schedulerId,
      noticeBoardPath: noticeBoardPath,
    }).subscribe((res) => {
      this.workflowData = res
      this.loadGraphData(noticeBoardPath);
    });
  }

  onCheckAll(checked: boolean): void {
    this.noticeBoards.forEach(board => board.checked = checked);
    this.updateCheckedStatus();
  }

  updateCheckedStatus(): void {
    const checkedBoards = this.noticeBoards.filter(board => board.checked);
    this.allChecked = checkedBoards.length === this.noticeBoards.length;
    this.indeterminate = checkedBoards.length > 0 && checkedBoards.length < this.noticeBoards.length;

    if (checkedBoards.length > 0) {
      this.recursivelyLoadData(checkedBoards.map(board => board.path), 0);
    } else {
      this.destroyGraph();
    }
  }

  destroyGraph(): void {
    if (this.graph) {
      this.graph.getModel().clear();
    }
    this.workflowData = null;
  }


  recursivelyLoadData(paths: string[], index: number): void {
    if (index >= paths.length) return;

    this.loadAdditionalData(paths[index]);

    setTimeout(() => {
      this.recursivelyLoadData(paths, index + 1);
    }, 100);
  }


}
