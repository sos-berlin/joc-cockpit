import {Component, OnInit, OnDestroy} from '@angular/core';
import {CoreService} from '../../services/core.service';
import {AuthService} from '../../components/guard';
import {WorkflowService} from '../../services/workflow.service';
import * as _ from 'underscore';
import {ActivatedRoute} from '@angular/router';
declare const mxEditor;
declare const mxUtils;
declare const mxEvent;
declare const mxClient;
declare const mxObjectCodec;
declare const mxEdgeHandler;
declare const mxGraphHandler;
declare const mxGraph;
declare const mxImage;
declare const mxOutline;
declare const mxConstants;
declare const mxEventObject;

declare const $;

@Component({
  selector: 'app-order',
  templateUrl: './workflow-detail.component.html',
  styleUrls: ['./workflow-detail.component.css']
})
export class WorkflowDetailComponent implements OnInit, OnDestroy {
  path: string;
  workFlowJson: any;
  loading: boolean;
  schedulerIds: any = {};
  preferences: any = {};
  permission: any = {};
  pageView: any;
  editor: any;
  selectedPath: string;
  worflowFilters: any = {};
  nodeMap = new Map();
  configXml = './assets/mxgraph/config/diagrameditor.xml';

  constructor(private authService: AuthService, public coreService: CoreService, private route: ActivatedRoute,
              private workflowService: WorkflowService) {
  }

  ngOnInit() {
    this.path = this.route.snapshot.paramMap.get('path');
    this.worflowFilters = this.coreService.getWorkflowTab();
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
        } else {
          const bounds = this.editor.graph.getGraphBounds();
          if (bounds.y < -30 && bounds.height > $('#graph').height()) {
            // this.editor.graph.view.setTranslate(0.6, 1);
            this.editor.graph.center(true, true, 0.5, 0);
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

  backClicked() {
    window.history.back();
  }

  /** ---------------------------- Broadcast messages ----------------------------------*/

  isWorkflowStored(_json): void {
    this.workFlowJson = _json;
    if (_json && !_.isEmpty(_json)) {
      if (_json && !_.isEmpty(_json)) {
        this.initEditorConf(this.editor, true);
        this.editor.graph.setEnabled(true);
      }
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
      this.editor.graph.center(true, true, 0.5, 0.1);
    }
  }

  fit() {
    if (this.editor && this.editor.graph) {
      this.editor.graph.fit();
      this.editor.graph.center(true, true, 0.5, 0.1);
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
    this.coreService.post('workflow', {
      jobschedulerId: this.schedulerIds.selected,
      workflowId: [{path: this.path}]
    }).subscribe((res) => {
      this.createEditor(this.configXml);
      this.isWorkflowStored(res);
      this.loading = true;
    }, () => {
      this.loading = true;
    });

  }

  private initEditorConf(editor, _xml: any) {
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
      graph.convertValueToString = function (cell) {
        return self.workflowService.convertValueToString(cell, graph);
      };

      graph.getTooltipForCell = function (cell) {
        return self.workflowService.getTooltipForCell(cell);
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
      this.updateXMLJSON();
    }
  }

  private createWorkflow(_json) {
    this.nodeMap = new Map();
    let graph = this.editor.graph;
    const self = this;
    const doc = mxUtils.createXmlDocument();
    let vertexMap = new Map();
    const defaultParent = graph.getDefaultParent();

    function connectWithDummyNodes(json) {
      if (json.instructions && json.instructions.length > 0) {
        let _node = doc.createElement('Process');
        _node.setAttribute('title', 'start');
        let v1 = graph.insertVertex(defaultParent, null, _node, 0, 0, 70, 70, 'ellipse;whiteSpace=wrap;html=1;aspect=fixed;dashed=1;shadow=0;opacity=70;');

        const start = vertexMap.get(json.instructions[0].uuid);
        const last = json.instructions[json.instructions.length - 1];
        let end = vertexMap.get(last.uuid);
        if (last.TYPE === 'Fork' || last.TYPE === 'If' || last.TYPE === 'Try' || last.TYPE === 'Retry') {
          let targetId = self.nodeMap.get(last.id);
          if (targetId) {
            end = graph.getModel().getCell(targetId);
          }
        }
        let _node2 = doc.createElement('Process');
        _node2.setAttribute('title', 'end');
        let v2 = graph.insertVertex(defaultParent, null, _node2, 0, 0, 70, 70, 'ellipse;whiteSpace=wrap;html=1;aspect=fixed;dashed=1;shadow=0;opacity=70;');

        connectInstruction(v1, start, '', '', defaultParent);
        connectInstruction(end, v2, '', '', defaultParent);
      }
    }

    function recursive(json, type, parent) {
      if (json.instructions) {
        let v1, endNode;
        for (let x = 0; x < json.instructions.length; x++) {
          let v2;
          let _node = doc.createElement(json.instructions[x].TYPE);
          if (!json.instructions[x].uuid)
            json.instructions[x].uuid = self.workflowService.create_UUID();
          if (json.instructions[x].TYPE === 'Job') {
            _node.setAttribute('jobName', json.instructions[x].jobName);
            _node.setAttribute('label', json.instructions[x].label || '');
            _node.setAttribute('uuid', json.instructions[x].uuid);
            if (json.instructions[x].defaultArguments && typeof json.instructions[x].defaultArguments === 'object') {
              _node.setAttribute('defaultArguments', JSON.stringify(json.instructions[x].defaultArguments));
            } else {
              _node.setAttribute('defaultArguments', '');
            }
            v1 = graph.insertVertex(parent, null, _node, 0, 0, 180, 40, 'job');

          } else if (json.instructions[x].TYPE === 'Finish') {
            _node.setAttribute('label', 'finish');
            const outcome = json.instructions[x].outcome || {'TYPE': 'Succeeded', result: ''};
            _node.setAttribute('outcome', JSON.stringify(outcome));
            _node.setAttribute('uuid', json.instructions[x].uuid);
            v1 = graph.insertVertex(parent, null, _node, 0, 0, 68, 68, self.workflowService.finish);

          } else if (json.instructions[x].TYPE === 'Fail') {
            _node.setAttribute('label', 'fail');
            const outcome = json.instructions[x].outcome || {'TYPE': 'Failed', result: ''};
            _node.setAttribute('outcome', JSON.stringify(outcome));
            _node.setAttribute('uuid', json.instructions[x].uuid);
            v1 = graph.insertVertex(parent, null, _node, 0, 0, 68, 68, self.workflowService.fail);

          } else if (json.instructions[x].TYPE === 'Publish') {
            _node.setAttribute('label', 'publish');
            _node.setAttribute('junctionPath', json.instructions[x].junctionPath || '');
            _node.setAttribute('uuid', json.instructions[x].uuid);
            v1 = graph.insertVertex(parent, null, _node, 0, 0, 68, 68, self.workflowService.publish);

          } else if (json.instructions[x].TYPE === 'Await') {
            _node.setAttribute('label', 'await');
            _node.setAttribute('junctionPath', json.instructions[x].junctionPath || '');
            _node.setAttribute('timeout', json.instructions[x].timeout || '');
            _node.setAttribute('joinVariables', json.instructions[x].joinVariables || '');
            _node.setAttribute('predicate', json.instructions[x].predicate || '');
            _node.setAttribute('match', json.instructions[x].match || '');
            _node.setAttribute('uuid', json.instructions[x].uuid);
            v1 = graph.insertVertex(parent, null, _node, 0, 0, 68, 68, self.workflowService.await);

          } else if (json.instructions[x].TYPE === 'Fork') {
            _node.setAttribute('label', 'fork');
            _node.setAttribute('joinVariables', json.instructions[x].joinVariables || '');
            _node.setAttribute('uuid', json.instructions[x].uuid);
            v1 = graph.insertVertex(parent, null, _node, 0, 0, 68, 68, self.workflowService.fork);

            if (json.instructions[x].branches) {
              for (let i = 0; i < json.instructions[x].branches.length; i++) {
                if (json.instructions[x].branches[i].instructions && json.instructions[x].branches[i].instructions.length > 0) {
                  recursive(json.instructions[x].branches[i], 'branch', v1);
                  connectInstruction(v1, vertexMap.get(json.instructions[x].branches[i].instructions[0].uuid), json.instructions[x].branches[i].id, 'branch', v1);
                }
              }
              v2 = joinFork(json.instructions[x].branches, v1.id, parent);
            } else {
              v2 = joinFork(v1, v1.id, parent);
            }
          } else if (json.instructions[x].TYPE === 'If') {
            _node.setAttribute('label', 'if');
            _node.setAttribute('predicate', json.instructions[x].predicate);
            _node.setAttribute('uuid', json.instructions[x].uuid);
            v1 = graph.insertVertex(parent, null, _node, 0, 0, 75, 75, 'if');
            if (json.instructions[x].then && json.instructions[x].then.instructions && json.instructions[x].then.instructions.length > 0) {
              recursive(json.instructions[x].then, 'endIf', v1);
              connectInstruction(v1, vertexMap.get(json.instructions[x].then.instructions[0].uuid), 'then', 'then', v1);
            }
            if (json.instructions[x].else && json.instructions[x].else.instructions && json.instructions[x].else.instructions.length > 0) {
              recursive(json.instructions[x].else, 'endIf', v1);
              connectInstruction(v1, vertexMap.get(json.instructions[x].else.instructions[0].uuid), 'else', 'else', v1);
            }
            v2 = endIf(json.instructions[x], v1, parent);
          } else if (json.instructions[x].TYPE === 'Retry') {
            _node.setAttribute('label', 'retry');
            _node.setAttribute('maxTries', json.instructions[x].maxTries || '');
            _node.setAttribute('retryDelays', json.instructions[x].retryDelays ? json.instructions[x].retryDelays.toString() : '');
            _node.setAttribute('uuid', json.instructions[x].uuid);
            v1 = graph.insertVertex(parent, null, _node, 0, 0, 75, 75, 'retry');
            if (json.instructions[x].instructions && json.instructions[x].instructions.length > 0) {
              recursive(json.instructions[x], '', v1);
              connectInstruction(v1, vertexMap.get(json.instructions[x].instructions[0].uuid), 'retry', 'retry', v1);
              v2 = endRetry(json.instructions[x], v1.id, parent);
            } else {
              v2 = endRetry(v1, v1.id, parent);
            }
          } else if (json.instructions[x].TYPE === 'Try') {
            _node.setAttribute('label', 'try');
            _node.setAttribute('uuid', json.instructions[x].uuid);
            v1 = graph.insertVertex(parent, null, _node, 0, 0, 75, 75, 'try');
            const node = doc.createElement('Catch');
            node.setAttribute('label', 'catch');
            node.setAttribute('targetId', v1.id);
            node.setAttribute('uuid', json.instructions[x].uuid);
            let cv1 = graph.insertVertex(parent, null, node, 0, 0, 110, 40, (json.instructions[x].catch.instructions && json.instructions[x].catch.instructions.length > 0) ?
              'catch' : 'dashRectangle');
            let _id = v1;
            if (json.instructions[x].catch && json.instructions[x].catch.instructions) {
              if (json.instructions[x].catch.instructions && json.instructions[x].catch.instructions.length > 0) {
                recursive(json.instructions[x].catch, 'endTry', v1);
                connectInstruction(cv1, vertexMap.get(json.instructions[x].catch.instructions[0].uuid), 'catch', 'catch', v1);
                _id = catchEnd(json.instructions[x].catch);
              } else {
                _id = cv1;
              }
            }

            if (json.instructions[x].instructions && json.instructions[x].instructions.length > 0) {
              recursive(json.instructions[x], '', v1);
              connectInstruction(v1, vertexMap.get(json.instructions[x].instructions[0].uuid), 'try', 'try', v1);
              const _lastNode = json.instructions[x].instructions[json.instructions[x].instructions.length - 1];
              if (_lastNode.TYPE === 'If' || _lastNode.TYPE === 'Fork' || _lastNode.TYPE === 'Try' || _lastNode.TYPE === 'Retry') {
                const end = graph.getModel().getCell(self.nodeMap.get(_lastNode.id));
                connectInstruction(end, cv1, 'try', 'try', v1);
              } else {
                const end = graph.getModel().getCell(_lastNode.id);
                if (json.instructions[x].catch) {
                  connectInstruction(end, cv1, 'try', 'try', v1);
                } else {
                  _id = end;
                }
              }
            } else {
              if (json.instructions[x].catch) {
                connectInstruction(v1, cv1, 'try', 'try', v1);
              }
            }

            v2 = endTry(_id, v1.id, parent);
          }
          if (endNode) {
            connectInstruction(endNode, v1, type, type, parent);
            endNode = null;
          }
          if (json.instructions.length > (x + 1) && v2) {
            endNode = v2;
          }

          if (!vertexMap.has(json.instructions[x].uuid)) {
            vertexMap.set(json.instructions[x].uuid, v1);
          }
          json.instructions[x].id = v1.id;
          if (json.instructions[x].TYPE === 'Fork' || json.instructions[x].TYPE === 'If' ||
            json.instructions[x].TYPE === 'Try' && json.instructions[x].TYPE === 'Retry') {
            v1.collapsed = json.instructions[x].isCollapsed == '1';
          }

          if (x > 0) {
            let prev = json.instructions[x - 1];
            if (prev.TYPE !== 'Fork' && prev.TYPE !== 'If' && prev.TYPE !== 'Try' && prev.TYPE !== 'Retry' && vertexMap.get(prev.uuid)) {
              connectInstruction(vertexMap.get(prev.uuid), v1, type, type, parent);
            }
          }
        }
      }
    }

    function connectInstruction(source, target, label, type, parent) {
      // Create new Connection object
      const connNode = doc.createElement('Connection');
      let str = label;
      if (label.substring(0, 6) === '$TYPE$') {
        type = 'branch';
        str = label.substring(6);
      }
      connNode.setAttribute('label', str);
      connNode.setAttribute('type', type);
      graph.insertEdge(parent, null, connNode, source, target);
    }

    function joinFork(branches, targetId, parent) {
      let _node = doc.createElement('Join');
      _node.setAttribute('label', 'join');
      if (targetId) {
        _node.setAttribute('targetId', targetId);
      }
      let v1 = graph.insertVertex(parent, null, _node, 0, 0, 68, 68, self.workflowService.merge);
      self.nodeMap.set(targetId.toString(), v1.id.toString());
      if (_.isArray(branches)) {
        for (let i = 0; i < branches.length; i++) {
          if (branches[i].instructions && branches[i].instructions.length > 0) {
            const x = branches[i].instructions[branches[i].instructions.length - 1];
            if (x) {
              let endNode;
              if (x.TYPE === 'If' || x.TYPE === 'Fork' || x.TYPE === 'Try' || x.TYPE === 'Retry') {
                endNode = graph.getModel().getCell(self.nodeMap.get(x.id));
              } else {
                endNode = vertexMap.get(x.uuid);
              }
              connectInstruction(endNode, v1, 'join', 'join', parent);
            }
          }
        }
      } else {
        connectInstruction(branches, v1, '', '', parent);
      }
      return v1;
    }

    function endIf(branches, target, parent) {
      let _node = doc.createElement('EndIf');
      _node.setAttribute('label', 'ifEnd');
      if (target.id) {
        _node.setAttribute('targetId', target.id);
      }
      let v1 = graph.insertVertex(parent, null, _node, 0, 0, 75, 75, 'if');
      self.nodeMap.set(target.id.toString(), v1.id.toString());
      let flag = true;
      if (branches.then && branches.then.instructions) {
        flag = false;
        const x = branches.then.instructions[branches.then.instructions.length - 1];
        if (x) {
          let endNode;
          if (x.TYPE === 'If' || x.TYPE === 'Fork' || x.TYPE === 'Try' || x.TYPE === 'Retry') {
            endNode = graph.getModel().getCell(self.nodeMap.get(x.id));
          } else {
            endNode = vertexMap.get(x.uuid);
          }
          connectInstruction(endNode, v1, 'endIf', 'endIf', parent);
        }
      }
      if (branches.else && branches.else.instructions) {
        flag = false;
        const x = branches.else.instructions[branches.else.instructions.length - 1];
        let endNode;
        if (x.TYPE === 'If' || x.TYPE === 'Fork' || x.TYPE === 'Try' || x.TYPE === 'Retry') {
          endNode = graph.getModel().getCell(self.nodeMap.get(x.id));
        } else {
          endNode = vertexMap.get(x.uuid);
        }
        connectInstruction(endNode, v1, 'endIf', 'endIf', parent);
      }

      if (flag) {
        connectInstruction(target, v1, '', '', parent);
      }
      return v1;
    }

    function endRetry(branches, targetId, parent) {
      let _node = doc.createElement('EndRetry');
      _node.setAttribute('label', 'retryEnd');
      if (targetId) {
        _node.setAttribute('targetId', targetId);
      }
      let v1 = graph.insertVertex(parent, null, _node, 0, 0, 75, 75, 'retry');
      self.nodeMap.set(targetId.toString(), v1.id.toString());

      if (branches.instructions && branches.instructions.length > 0) {
        const x = branches.instructions[branches.instructions.length - 1];
        if (x) {
          let endNode;
          if (x.TYPE === 'If' || x.TYPE === 'Fork' || x.TYPE === 'Try' || x.TYPE === 'Retry') {
            endNode = graph.getModel().getCell(self.nodeMap.get(x.id));
          } else {
            endNode = vertexMap.get(x.uuid);
          }
          connectInstruction(endNode, v1, 'endRetry', 'endRetry', parent);
        }
      } else {
        connectInstruction(branches, v1, '', '', parent);
      }
      return v1;
    }

    function endTry(x, targetId, parent) {
      let _node = doc.createElement('EndTry');
      _node.setAttribute('label', 'tryEnd');
      if (targetId) {
        _node.setAttribute('targetId', targetId);
      }
      let v1 = graph.insertVertex(parent, null, _node, 0, 0, 75, 75, 'try');
      self.nodeMap.set(targetId.toString(), v1.id.toString());

      connectInstruction(x, v1, 'endTry', 'endTry', parent);
      return v1;
    }

    function catchEnd(branches) {
      let x = branches.instructions[branches.instructions.length - 1];
      if (!x) {
        x = branches;
      }
      if (x) {
        let endNode;
        if (x.TYPE === 'If' || x.TYPE === 'Fork' || x.TYPE === 'Try' || x.TYPE === 'Retry') {
          endNode = graph.getModel().getCell(self.nodeMap.get(x.id));
        } else {
          endNode = vertexMap.get(x.uuid);
        }
        return endNode;
      }
    }

    recursive(_json, '', defaultParent);
    connectWithDummyNodes(_json);
  }

  private updateXMLJSON() {
    let graph = this.editor.graph;
    if (!_.isEmpty(this.workFlowJson)) {
      this.workflowService.convertTryToRetry(this.workFlowJson, () => {
        this.updateWorkflow(graph);
      });

    }
  }

  private updateWorkflow(graph) {
    graph.getModel().beginUpdate();
    try {
      this.createWorkflow(this.workFlowJson);
    } finally {
      // Updates the display
      graph.getModel().endUpdate();
      WorkflowService.executeLayout(graph);
    }
  }
}
