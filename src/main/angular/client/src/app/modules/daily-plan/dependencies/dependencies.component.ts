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
  noticeSpaceKey: any[] = [];
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
    this.loadPlans()
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
        this.loadAdditionalData();
      }, 300)
    }
  }

  ngAfterViewInit() {
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
    const requestPayload: any = {
      controllerId: this.schedulerId
    };

    this.coreService.post('plans/ids', requestPayload)
      .subscribe((res) => {
        this.isLoaded = true;
        this.processData(res)
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
        endDate: this.convertStringToDate(noticeSpaceKey)
      };
    });
    this.noticeSpaceKey = planDates;
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
    this.graph.setCellsEditable(false);

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
    let displayLabel = label;
    if (label.length > 22) {
      displayLabel = label.substring(0, 22) + '...';
    }
    let vertex = this.graph.insertVertex(parent, null, displayLabel, x, y, width, height, style);
    vertex.tooltip = label;
    return vertex;
  }


  private getIntersection(arr1: string[], arr2: string[]): string[] {
    return arr1.filter(x => arr2.includes(x));
  }

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

  private loadGraphData(data): void {
    const parent = this.graph.getDefaultParent();
    this.graph.getModel().beginUpdate();
    try {
      const dynamicData = data;

      const rows = this.buildRowsFromData(dynamicData);

      // Positioning variables.
      const xPosting = 100;
      const xRight = 700;
      let currentY = 100;
      const rowSpacing = 20;
      const minRowHeight = 120;
      const nodeWidth = 150;
      const nodeHeight = 50;
      const nodeGap = 10;
      const groupGap = 40;

      const stylePosting = 'fillColor=#d0e0e3;strokeColor=#d0e0e3;shadow=1;shadowOffsetX=2;shadowOffsetY=2;shadowAlpha=0.3;shadowColor=#888888;rounded=1;arcSize=20;strokeWidth=1;fontColor=#000000;';
      const styleExpecting = 'fillColor=#ffe6cc;strokeColor=#ffe6cc;shadow=1;shadowOffsetX=2;shadowOffsetY=2;shadowAlpha=0.3;shadowColor=#888888;rounded=1;arcSize=20;strokeWidth=1;fontColor=#000000;';
      const styleConsuming = 'fillColor=#c8e6c9;strokeColor=#c8e6c9;shadow=1;shadowOffsetX=2;shadowOffsetY=2;shadowAlpha=0.3;shadowColor=#888888;rounded=1;arcSize=20;strokeWidth=1;fontColor=#000000;';


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

        let pCell: any = this.createNode(parent, row.posting, xPosting, rowCenterY, nodeWidth, nodeHeight, stylePosting);

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

        expectingNodes.forEach((entry) => {
          let edge = this.graph.insertEdge(
            parent,
            null,
            "",
            pCell,
            entry.cell,
            'strokeColor=#1171a6;endArrow=block;edgeStyle=elbowEdgeStyle;elbow=horizontal;orthogonal=1;jettySize=auto'
          );
          edge.tooltip = entry.notice;
        });
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

        currentY += rowHeightCalculated + rowSpacing;
      });
    } finally {
      this.graph.getModel().endUpdate();
      setTimeout(() => {
        this.graph.center(true, true);
      }, 100)
    }
  }

  loadAdditionalData() {
    this.isLoaded = false;
    this.coreService.post('workflows/boards', {
      controllerId: this.schedulerId,
    }).subscribe((res) => {
      this.isLoaded = true;
      this.workflowData = res;
      this.loadGraphData(res);

    });
  }

  private refreshGraph(event: any) {
    this.graph.refresh();
  }
}
