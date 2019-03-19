import {Component, OnInit, ViewChild, OnDestroy, Input} from '@angular/core';
import {CoreService} from '../../services/core.service';
import {AuthService} from '../../components/guard';
import {TreeComponent} from '../../components/tree-navigation/tree.component';
import {WorkflowService} from '../../services/workflow.service';

declare const mxEditor;
declare const mxUtils;
declare const mxEvent;
declare const mxClient;
declare const mxObjectCodec;
declare const mxEdgeHandler;
declare const mxGraphHandler;
declare const mxGraph;
declare const mxCodec;
declare const mxImage;
declare const mxOutline;
declare const mxConstants;
declare const mxEventObject;

declare const X2JS;
declare const $;

const x2js = new X2JS();

@Component({
  selector: 'app-type',
  templateUrl: './type.component.html'
})
export class TypeComponent implements OnInit {
  @Input() workflowJson;

  constructor() {
  }

  ngOnInit() {
  }

  collapse(typeId, node) {
    if (node == 'undefined') {
      $('#' + typeId).toggle();
    } else {
      $('#' + node + '-' + typeId).toggle();
    }
  }

}

@Component({
  selector: 'app-order',
  templateUrl: './workflow.component.html',
  styleUrls: ['./workflow.component.css']
})
export class WorkflowComponent implements OnInit, OnDestroy {
  workFlowJson: any;
  isLoading = false;
  loading: boolean;
  schedulerIds: any = {};
  tree: any = [];
  preferences: any = {};
  permission: any = {};
  pageView = 'grid';
  editor: any;
  selectedPath: string;
  configXml = './assets/mxgraph/config/diagrameditor.xml';

  @ViewChild(TreeComponent) child;

  constructor(private authService: AuthService, public coreService: CoreService, private workflowService: WorkflowService) {

  }

  ngOnInit() {
    if (sessionStorage.$SOS$WORKFLOW) {
      this.workFlowJson = JSON.parse(sessionStorage.$SOS$WORKFLOW);
    }
    if (sessionStorage.preferences) {
      this.preferences = JSON.parse(sessionStorage.preferences) || {};
    }
    if (!(this.preferences.theme === 'light' || this.preferences.theme === 'lighter' || !this.preferences.theme)) {
      this.configXml = './assets/mxgraph/config/diagrameditor-dark.xml';
      this.workflowService.init('dark');
    } else {
      this.workflowService.init('light');
    }
    this.init();

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
        }
      }
    });
    $('#graph').slimscroll({height: 'calc(100vh - 172px)'});
  }

  ngOnDestroy() {
    try {
      if (this.editor) {
        this.editor.destroy();
        this.editor = null;
      }
    } catch (e) {
      console.log(e);
    }
  }

  /** ---------------------------- Broadcast messages ----------------------------------*/
  receiveMessage($event) {
    this.pageView = $event;
  }

  receiveAction($event) {
    if ($event.action === 'NODE') {

    }
    console.log($event);
  }

  isWorkflowStored(): void {
    let _json: any;
    if (sessionStorage.$SOS$WORKFLOW) {
      _json = JSON.parse(sessionStorage.$SOS$WORKFLOW);
      this.workFlowJson = _json;
    }
    if (_json) {
      this.workflowService.appendIdInJson(_json);
      let mxJson = {
        mxGraphModel: {
          root: {
            mxCell: [
              {_id: '0'},
              {
                _id: '1',
                _parent: '0'
              }
            ],
            Process: []
          }
        }
      };
      mxJson.mxGraphModel.root.Process = this.workflowService.getDummyNodes();
      this.workflowService.jsonParser(_json, mxJson.mxGraphModel.root, '', '');
      WorkflowService.connectWithDummyNodes(_json, mxJson.mxGraphModel.root);
      this.initEditorConf(this.editor, x2js.json2xml_str(mxJson));
    }
  }

  /**
   * Constructs a new application (returns an mxEditor instance)
   */
  createEditor(config) {
    let editor = null;
    try {
      if (!mxClient.isBrowserSupported()) {
        mxUtils.error('Browser is not supported!', 200, false);
      } else {
        mxObjectCodec.allowEval = true;
        const node = mxUtils.load(config).getDocumentElement();
        editor = new mxEditor(node);
        this.editor = editor;
        this.initEditorConf(editor, null);
        mxObjectCodec.allowEval = false;

        const outln = document.getElementById('outlineContainer');
        outln.style['border'] = '1px solid lightgray';
        outln.style['background'] = '#FFFFFF';
        new mxOutline(editor.graph, outln);
        editor.graph.allowAutoPanning = true;
      }
    } catch (e) {
      // Shows an error message if the editor cannot start
      mxUtils.alert('Cannot start application: ' + e.message);
      throw e; // for debugging
    }
  }

  zoomIn() {
    if (this.editor && this.editor.graph) {
      this.editor.graph.zoomIn();
    }
  }

  zoomOut() {
    if (this.editor && this.editor.graph) {
      this.editor.graph.zoomOut();
    }
  }

  actual() {
    if (this.editor && this.editor.graph) {
      this.editor.graph.zoomActual();
      this.editor.graph.center(true, true);
    }
  }

  fit() {
    if (this.editor && this.editor.graph) {
      this.editor.graph.fit();
      this.editor.graph.center(true, true);
    }
  }

  expandAll() {
    if (this.editor.graph.isEnabled()) {
      let cells = this.editor.graph.getChildVertices();
      this.editor.graph.foldCells(false, true, cells, null, null);
    }
  }

  collapseAll() {
    if (this.editor.graph.isEnabled()) {
      let cells = this.editor.graph.getChildVertices();
      this.editor.graph.foldCells(true, true, cells, null, null);
    }
  }

  private init() {
    if (sessionStorage.preferences) {
      this.preferences = JSON.parse(sessionStorage.preferences);
    }
    this.schedulerIds = JSON.parse(this.authService.scheduleIds) || {};
    this.permission = JSON.parse(this.authService.permission) || {};
    this.initTree();
    this.createEditor(this.configXml);
    this.isWorkflowStored();
  }

  private initTree() {
    this.coreService.post('tree', {
      jobschedulerId: this.schedulerIds.selected,
      compact: true,
      types: ['WORKFLOW']
    }).subscribe(res => {
      this.filteredTreeData(this.coreService.prepareTree(res));
      this.isLoading = true;
    }, () => {
      this.isLoading = true;
    });
  }

  private filteredTreeData(output) {
    this.tree = output;
    this.checkExpand();
  }

  private checkExpand() {
    setTimeout(() => {
      if (this.child && this.child.getNodeById(1)) {
        const node = this.child.getNodeById(1);
        node.expand();
        node.setActiveAndVisible(true);
      }
    }, 10);
  }

  private initEditorConf(editor, _xml: any) {
    const graph = editor.graph;
    const doc = mxUtils.createXmlDocument();
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
        mxGraph.prototype.collapsedImage = new mxImage('./assets/mxgraph/images/collapsed-white.png', 12, 12);
        mxGraph.prototype.expandedImage = new mxImage('./assets/mxgraph/images/expanded-white.png', 12, 12);
      } else {
        mxGraph.prototype.collapsedImage = new mxImage('./assets/mxgraph/images/collapsed.png', 12, 12);
        mxGraph.prototype.expandedImage = new mxImage('./assets/mxgraph/images/expanded.png', 12, 12);
      }

      // Enables snapping waypoints to terminals
      mxEdgeHandler.prototype.snapToTerminals = true;

      graph.setConnectable(false);
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
        if (mxUtils.isNode(cell.value)) {
          if (cell.value.nodeName.toLowerCase() === 'process') {
            let title = cell.getAttribute('title', '');
            if (title != null && title.length > 0) {
              return title;
            }
            return '';
          } else if (cell.value.nodeName.toLowerCase() === 'job') {
            let name = cell.getAttribute('name', '');
            let title = cell.getAttribute('title', '');
            if (title != null && title.length > 0) {
              return name + ' - ' + title;
            }
            return name;
          } else if (cell.value.nodeName.toLowerCase() === 'retry') {
            let str = 'Repeat ' + cell.getAttribute('repeat', '') + ' times';
            if (cell.getAttribute('delay', '') && cell.getAttribute('delay', '') !== 0) {
              str = str + '\nwith delay ' + cell.getAttribute('delay', '');
            }
            return str;
          } else if (cell.value.nodeName.toLowerCase() === 'fileorder') {
            let str = 'File Order';
            if (cell.getAttribute('regex', '') && cell.getAttribute('directory', '')) {
              str = cell.getAttribute('regex', '') + ' - ' + cell.getAttribute('directory', '');
            }
            return str;
          } else if (cell.value.nodeName.toLowerCase() === 'if') {
            return cell.getAttribute('predicate', '');
          } else {
            return cell.getAttribute('label', '');
          }
        }
        return '';
      };


      /**
       * Function: foldCells to collapse/expand
       */
      mxGraph.prototype.foldCells = function (collapse, recurse, cells, checkFoldable, evt) {
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
       * Overrides method to provide a cell collapse/expandable on double click
       */
      graph.addListener(mxEvent.DOUBLE_CLICK, function (sender, evt) {
        let cell = evt.getProperty('cell');
        if (cell != null && cell.vertex == 1) {
          if (cell.value.tagName === 'Fork' || cell.value.tagName === 'If' || cell.value.tagName === 'Try'
            || cell.value.tagName === 'Catch' || cell.value.tagName === 'Retry') {
            const flag = cell.collapsed != true;
            graph.foldCells(flag, false, null, null, evt);
          }
        }
      });

      WorkflowService.makeCenter(graph);
      WorkflowService.executeLayout(graph);
    } else {
      reloadXml(_xml);
    }

    /**
     * Reload dummy xml
     */
    function reloadXml(xml) {
      graph.getModel().beginUpdate();
      try {
        // Removes all cells
        graph.removeCells(graph.getChildCells(graph.getDefaultParent(), true, true));
        const _doc = mxUtils.parseXml(xml);
        const dec = new mxCodec(_doc);
        const model = dec.decode(_doc.documentElement);
        // Merges the response model with the client model
        graph.getModel().mergeChildren(model.getRoot().getChildAt(0), graph.getDefaultParent(), false);
      } finally {
        // Updates the display
        graph.getModel().endUpdate();
        WorkflowService.executeLayout(graph);
      }
    }

  }
}
