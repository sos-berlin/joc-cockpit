import {Component, ElementRef, inject, ViewChild} from '@angular/core';
import {NZ_MODAL_DATA, NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
import {WorkflowService} from '../../services/workflow.service';
import {CoreService} from '../../services/core.service';

declare const mxUtils: any;
declare const mxEvent: any;
declare const mxClient: any;
declare const mxEdgeHandler: any;
declare const mxGraphHandler: any;
declare const mxGraph: any;
declare const mxOutline: any;
declare const mxConstants: any;
declare const mxEventObject: any;
declare const $: any;

@Component({
  selector: 'app-graphical-view-modal',
  templateUrl: './graphical-view-modal.component.html',
  styleUrls: ['./graphical-view-modal.component.css']
})
export class GraphicalViewModalComponent {
  readonly modalData: any = inject(NZ_MODAL_DATA);
  workflow: any;
  positions: any;
  operation = '';
  startNode = '';
  data: any;
  isLoading = true;
  position: any;
  preferences: any = {};
  graph: any;
  workFlowJson: any = {};

  @ViewChild('graph', {static: true}) graphContainer: ElementRef;
  @ViewChild('outlineContainer', {static: true}) outlineContainer: ElementRef;

  constructor(public coreService: CoreService, private modal: NzModalService, private activeModal: NzModalRef,
              private workflowService: WorkflowService) {

  }

  static changeCellStyle(graph): void {
    const model = graph.getModel();
    if (model.root) {
      for (let i in model.cells) {
        if (model.cells[i].value && model.cells[i].value.tagName) {
          let pos = model.cells[i].value.getAttribute('position');
          if (!pos) {
            const state = graph.view.getState(model.cells[i]);
            if (state && state.shape) {
              state.style[mxConstants.STYLE_OPACITY] = 60;
              state.shape.apply(state);
              state.shape.redraw();
            }
          }
        }
      }
    }
  }

  ngOnInit(): void {
    this.workflow = this.modalData.workflow;
    this.positions = this.modalData.positions;
    this.operation = this.modalData.operation;
    this.startNode = this.modalData.startNode;
    this.data = this.modalData.data;
    this.preferences = sessionStorage['preferences'] ? JSON.parse(sessionStorage['preferences']) : {};
    this.workFlowJson = this.coreService.clone(this.workflow);
    this.coreService.convertTryToRetry(this.workFlowJson, this.positions, this.startNode);
  }

  ngAfterViewInit(): void {
    this.createEditor();
    const dom = $('.graph2 #graph');
    let ht = 'calc(100vh - 150px)';
    this.coreService.slimscrollFunc(dom, ht, this.graph);
  }

  onSubmit(): void {
    this.activeModal.close(this.position);
  }


  cancel(): void {
    this.activeModal.destroy();
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
        setTimeout(() => {
          this.createWorkflowGraph();
        }, 0);
      }
    } catch (e) {
      mxUtils.alert('Cannot start application: ' + e.message);
      console.error(e);
    }
  }

  createWorkflowGraph(): void {
    this.initEditorConf();
    this.updateWorkflow();
    setTimeout(() => {
      this.isLoading = false;
      this.actual();
    }, 10);
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

    // Enables snapping waypoints to terminals
    mxEdgeHandler.prototype.snapToTerminals = true;

    mxConstants.CURSOR_MOVABLE_VERTEX = 'pointer';
    graph.setConnectable(true);
    graph.setHtmlLabels(true);
    graph.setTooltips(true);
    graph.setDisconnectOnMove(false);
    graph.collapseToPreferredSize = false;
    graph.constrainChildren = false;
    graph.extendParentsOnAdd = false;
    graph.extendParents = false;


    /**
     * Overrides method to provide a cell label in the display
     * @param cell
     */
    graph.convertValueToString = function (cell) {
      return self.workflowService.convertValueToString(cell, graph);
    };

    graph.getTooltipForCell = function (cell) {
      return self.workflowService.getTooltipForCell(cell);
    };

    /**
     * Function: foldCells to collapse/expand
     */
    mxGraph.prototype.foldCells = function (collapse, recurse, cells, checkFoldable) {
      recurse = (recurse != null) ? recurse : true;
      if (cells == null) {
        cells = this.getFoldableCells(this.getSelectionCells(), collapse);
      }

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

      return cells;
    };

    /**
     * Function: handle a click event
     */
    graph.addListener(mxEvent.CLICK, function (sender, evt) {
      const cell = evt.getProperty('cell'); // cell may be null
      if (cell != null) {
        const pos = cell.value.getAttribute('position');
        if (pos) {
          if (self.operation == 'END') {
            let flag = true;
            if (!self.position) {
              self.position = [];
            } else {
              if (self.position.indexOf(pos) > -1) {
                flag = false;
              }
            }
            if (flag) {
              self.position.push(pos);
              graph.addSelectionCell(cell);
            } else {
              self.position.splice(self.position.indexOf(pos), 1);
              graph.removeSelectionCell(cell);
            }
          } else {
            self.position = pos;
            graph.setSelectionCell(cell);
          }
        }
        evt.consume();
      }
    });
  }

  private updateWorkflow(): void {
    this.graph.getModel().beginUpdate();
    try {
      // this.graph.removeCells(this.graph.getChildCells(this.graph.getDefaultParent()), true);
      const mapObj = {nodeMap: new Map(), graphView: true, vertixMap: new Map(), useString: true};
      this.workflowService.createWorkflow(this.workFlowJson, {graph: this.graph}, mapObj);

      if (this.data) {

        if (this.operation === 'BLOCK_POSITION' && this.data.blockPosition) {
          this.position = this.coreService.clone(this.data.blockPosition);
          let pos = this.positions.get(this.data.blockPosition);
          this.graph.setSelectionCell(mapObj.vertixMap.get(pos));
        } else if (this.operation === 'START' && this.data.startPosition) {
          this.position = this.coreService.clone(this.data.startPosition);
          let pos = this.positions.get(this.data.startPosition);
          this.graph.setSelectionCell(mapObj.vertixMap.get(pos));
        } else if (this.operation === 'END' && this.data.endPositions && this.data.endPositions.length > 0) {
          this.position = this.coreService.clone(this.data.endPositions);
          this.data.endPositions.forEach((endPosition) => {
            let pos = this.positions.get(endPosition);
            this.graph.addSelectionCell(mapObj.vertixMap.get(pos));
          })
        }
      }
    } finally {
      // Updates the display
      this.graph.getModel().endUpdate();
      WorkflowService.executeLayout(this.graph);
      GraphicalViewModalComponent.changeCellStyle(this.graph);
    }
  }
}


