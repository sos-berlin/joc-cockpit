import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {CoreService} from "../../services/core.service";
import {AuthService} from "../../components/guard/auth.service";
import * as _ from 'underscore';

declare var mxEditor;
declare var mxUtils;
declare var mxEvent;
declare var mxClient;
declare var mxObjectCodec;
declare var mxPanningManager;
declare var mxGuide;
declare var mxEdgeHandler;
declare var mxImage;
declare var mxConnectionHandler;
declare var mxCodec;
declare var mxAutoSaveManager;
declare var mxGraphHandler;
declare var mxCellAttributeChange;
declare var mxGraph;
declare var mxForm;
declare var mxMultiplicity;
declare var mxHierarchicalLayout;
declare var mxParallelEdgeLayout;
declare var mxCompositeLayout;

declare var X2JS;
declare var $;

@Component({
  selector: 'app-job-chain',
  templateUrl: './job-chain.component.html',
  styleUrls: ['./job-chain.component.css'],
  host: {
    '(window:resize)': 'onResize()',
    '(window:click)': 'onClick()'
  }
})
export class JobChainComponent implements OnInit, OnDestroy {
  schedulerIds: any = {};
  tree: any = [];
  isLoading: boolean = true;
  view: string;
  editor: any;
  xmlTest: any;
  workFlows: any = [];
  object: any = {checkbox: false, workflows: []};

  options: any = {
    allowDrag: true,
    allowDrop: true
  };
  json = {
    "id": 'test_id',
    "instructions": [{
      "TYPE": "Job",
      "id": 3,
      "agentPath": "/AGENT",
      "jobPath": "/JOB 1",
      "failure": []
    },
      {
        "TYPE": "If",
        "id": 4,
        "predicate": "returnCode > 0",
        "then": {
          "instructions": [{
            "TYPE": "Exit",
            "id": 5
          }]
        }, "else": { //optional
          "instructions": [{
            "TYPE": "Job",
            "id": 6,
            "agentPath": "/test-agent-2",
            "jobPath": "/JOB 3"
          }]
        }
      },
      {
        "TYPE": "Job",
        "id": 7,
        "agentPath": "/AGENT",
        "jobPath": "/JOB 2",
        "failure": []
      }]
  };


  @ViewChild('treeCtrl') treeCtrl;

  constructor(private authService: AuthService, public coreService: CoreService) {

  }

  ngOnInit() {
    let dom = $('#leftSidePanel');
    this.init();
    if (dom)
      dom.stickySidebar({
        sidebarTopMargin: 99
      });
    if (dom) {
      dom.resizable({
        handles: 'e',
        maxWidth: 450,
        minWidth: 180,
        resize: function () {
          $('#centerPanel').css({'margin-left': dom.width() + 20 + 'px'})
        }
      });
    }


    let mxJson = {
      mxGraphModel: {
        root: {
          mxCell: [
            {"_id": "0"},
            {
              "_id": "1",
              "_parent": "0"
            }
          ]
        }
      }
    };
    this.jsonParser(this.json, mxJson.mxGraphModel.root)

    console.log(JSON.stringify(mxJson));
    let x2js = new X2JS();
  this.xmlTest = x2js.json2xml_str( mxJson );
    console.log(this.xmlTest)
  }

  ngOnDestroy() {
    this.hidePopup();
  }

  init() {
    this.schedulerIds = JSON.parse(this.authService.scheduleIds);
    this.view = JSON.parse(localStorage.views).joe || 'grid';
    JobChainComponent.calculateHeight();

    this.workFlows = [
      {id: 1, job: 'Job 1', path: '/test/test101/job1'},
      {id: 1, job: 'Job 2', path: '/test/test101/job1'},
      {id: 1, job: 'Job 3', path: '/test/test101/job3'}
    ];
    this.initTree();
  }

  initTree() {
    this.coreService.post('tree', {
      jobschedulerId: this.schedulerIds.selected,
      compact: true
    }).subscribe(res => {
      this.tree = this.coreService.prepareTree(res);
      let self = this;
      let interval = setInterval(function () {
        if (self.treeCtrl && self.treeCtrl.treeModel) {
          const node = self.treeCtrl.treeModel.getNodeById(1);
          node.expand();
          clearInterval(interval);
        }
      }, 5);
      this.isLoading = false;
      this.createEditor('./assets/mxgraph/config/diagrameditor.xml');
    }, err => {
      this.isLoading = false;
    });

  }


  private connectEdges(list, index, mxJson) {
    if (mxJson.Connector) {
      if (!_.isArray(mxJson.Connector)) {
        let _tempJob = _.clone(mxJson.Connector);
        mxJson.Connector = [];
        mxJson.Connector.push(_tempJob);
      }

    } else {
      mxJson.Connector = [];
    }

    if (list.length > (index + 1)) {
      let obj: any = {
        _label: '',
        mxCell: {
          _parent: "1",
          _source: list[index].id,
          _target: list[index + 1].id,
          _edge: "1",
          mxGeometry: {
            _relative: 1,
            _as: "geometry"
          }
        }
      };

      mxJson.Connector.push(obj);
    }
  }

   private connectIfInstruction(source, target, mxJson, label) {
     if (mxJson.Connector) {
       if (!_.isArray(mxJson.Connector)) {
         let _tempJob = _.clone(mxJson.Connector);
         mxJson.Connector = [];
         mxJson.Connector.push(_tempJob);
       }
     } else {
       mxJson.Connector = [];
     }
     let obj: any = {
       _label: label,
       mxCell: {
         _parent: "1",
         _source: source.id,
         _target: target.id,
         _edge: "1",
         mxGeometry: {
           _relative: 1,
           _as: "geometry"
         }
       }
     };
     mxJson.Connector.push(obj);
   }

  private jsonParser(json, mxJson) {
    let self = this;
    if (json.instructions) {
      json.instructions.forEach(function (instruction, index) {
        let obj: any = {
          mxCell: {
            _parent: "1",
            _vertex: "1",
            mxGeometry: {
              _as: "geometry"
            }
          }
        };

        if (instruction.TYPE === 'Job') {
          if (mxJson.Job) {
            if (!_.isArray(mxJson.Job)) {
              let _tempJob = _.clone(mxJson.Job);
              mxJson.Job = [];
              mxJson.Job.push(_tempJob);
            }

          } else {
            mxJson.Job = [];
          }

          obj._id = instruction.id;
          obj._label = instruction.jobPath;
          obj._agent = instruction.agentPath;
          obj._title = instruction.title;
          obj.mxCell._style = 'rounded';
          obj.mxCell.mxGeometry._width = '140';
          obj.mxCell.mxGeometry._height = '40';
          mxJson.Job.push(obj);

        }
        else if (instruction.TYPE === 'If') {
          if (mxJson.If) {
            if (!_.isArray(mxJson.If)) {
              let _tempIf = _.clone(mxJson.If);
              mxJson.If = [];
              mxJson.If.push(_tempIf);
            }
          } else {
            mxJson.If = [];
          }
          obj._id = instruction.id;
          obj._label = instruction.predicate;
          obj.mxCell._style = 'symbol;image=./assets/mxgraph/images/symbols/inclusive.png';
          obj.mxCell.mxGeometry._width = '70';
          obj.mxCell.mxGeometry._height = '70';

          if (instruction.then && instruction.then.instructions) {
            self.jsonParser(instruction.then, mxJson);
            self.connectIfInstruction(instruction, instruction.then.instructions[0], mxJson, 'then');
          }
          if(instruction.else && instruction.else.instructions ){
            self.jsonParser(instruction.else, mxJson);
            self.connectIfInstruction(instruction, instruction.else.instructions[0], mxJson, 'else');
          }
          mxJson.If.push(obj);

        }
        else if (instruction.TYPE === 'Exit') {
          obj._id = instruction.id;
          obj._label = instruction.TYPE;
          obj.mxCell._style = 'symbol;image=./assets/mxgraph/images/symbols/cancel_end.png';
          obj.mxCell.mxGeometry._width = '70';
          obj.mxCell.mxGeometry._height = '70';
          mxJson.Exit = obj;
        }
        else {
          //TODO
          console.log('TYPE : ' + instruction.TYPE);
        }
        self.connectEdges(json.instructions, index, mxJson);
      });
    } else {
      console.log('No instruction..');
    }

  }


  private initEditorConf(editor) {
    let self = this;
    // Alt disables guides
    mxGraphHandler.prototype.guidesEnabled = true;
    /**
     * Variable: autoSaveDelay
     *
     * Minimum amount of seconds between two consecutive autosaves. Eg. a
     * value of 1 (s) means the graph is not stored more than once per second.
     * Default is 10.
     */
    mxAutoSaveManager.prototype.autoSaveDelay = 3;
    /**
     * Variable: autoSaveThreshold
     *
     * Minimum amount of ignored changes before an autosave. Eg. a value of 2
     * means after 2 change of the graph model the autosave will trigger if the
     * condition below is true. Default is 5.
     */
    mxAutoSaveManager.prototype.autoSaveThreshold = 2;
    /**
     * Variable: cellsResizable
     *
     * Specifies the return value for <isCellResizable>. Default is true.
     */
    mxGraph.prototype.cellsResizable = false;
    mxGraph.prototype.multigraph = false;
    mxGraph.prototype.allowDanglingEdges = false;
    mxGraph.prototype.disconnectOnMove = false;

    mxHierarchicalLayout.prototype.intraCellSpacing = 50;
    mxHierarchicalLayout.prototype.interRankCellSpacing = 80;

    editor.validation = true;

    mxGuide.prototype.isEnabledForEvent = function (evt) {
      return !mxEvent.isAltDown(evt);
    };

    let enc = new mxCodec();
    let x2js = new X2JS();

    let mgr = new mxAutoSaveManager(editor.graph);
    mgr.save = function () {
    //  let node = enc.encode(editor.graph.getModel());
   //   let xml = mxUtils.getXml(node);
      // let json = x2js.xml_str2json(xml);
  //   console.log( mxUtils.getPrettyXml(node));
     // sessionStorage.setItem('$JOE$XML', xml);
    };

    // Enables snapping waypoints to terminals
    mxEdgeHandler.prototype.snapToTerminals = true;

    // Defines an icon for creating new connections in the connection handler.
    // This will automatically disable the highlighting of the source vertex.
    mxConnectionHandler.prototype.connectImage = new mxImage('./assets/mxgraph/images/connector.gif', 16, 16);

    editor.graph.setConnectable(true);


    function checkValidation(node, edges) {
      if (!(node === 'If' && edges > 3)) {
        return node !== 'If' && edges > 1;
      } else {
        return true;
      }
    }

    //Set cell connectable true/false based on number of connection
    function updateStyle(state, hover) {
      if (hover) {
        let flag = checkValidation(state.cell.value.nodeName, state.cell.getEdgeCount());
        if (flag) {
          state.cell.setConnectable(false);
        }
      } else {
        state.cell.setConnectable(true);
      }
    }

    editor.graph.addMouseListener(
      {
        currentState: null,
        mouseDown: function (sender, me) {
          if (this.currentState != null) {
            this.dragLeave(me.getEvent(), this.currentState);
            this.currentState = null;
          }
        },
        mouseMove: function (sender, me) {
          if (this.currentState != null && me.getState() == this.currentState) {
            return;
          }

          let tmp = editor.graph.view.getState(me.getCell());
          // Ignores everything but vertices
          if (editor.graph.isMouseDown || (tmp != null && !
            editor.graph.getModel().isVertex(tmp.cell))) {
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
        mouseUp: function(sender, me) { },
        dragEnter: function (evt, state) {
          if (state != null) {
            updateStyle(state, true);
          }
        },
        dragLeave: function (evt, state) {
          if (state != null) {
            updateStyle(state, false);
          }
        }
      });


    // Changes the zoom on mouseWheel events
    mxEvent.addMouseWheelListener(function (evt, up) {
      if (!mxEvent.isConsumed(evt)) {
        if (up) {
          editor.execute('zoomIn');
        } else {
          editor.execute('zoomOut');
        }
        mxEvent.consume(evt);
      }
    });


    // Create select actions in page
    let node = document.getElementById('mainActions');
    let buttons = ['group', 'ungroup', 'undo', 'redo', 'cut', 'copy', 'paste', 'delete', 'toggleOutline'];

    for (let i = 0; i < buttons.length; i++) {
      let button = document.createElement('button');
      let dom = document.createElement('img');
      let icon: any;
      if (buttons[i] == "group") {
        icon = "./assets/mxgraph/images/group.gif";
        button.setAttribute('class', 'btn btn-sm');
        button.setAttribute('title', 'Group');
      } else if (buttons[i] == "ungroup") {
        icon = "./assets/mxgraph/images/ungroup.gif";
        button.setAttribute('class', 'btn btn-sm m-r-sm');
        button.setAttribute('title', 'Ungroup');
      } else if (buttons[i] == "undo") {
        icon = "./assets/mxgraph/images/undo.gif";
        button.setAttribute('class', 'btn btn-sm');
        button.setAttribute('title', 'Undo');
      } else if (buttons[i] == "redo") {
        icon = "./assets/mxgraph/images/redo.gif";
        button.setAttribute('class', 'btn btn-sm m-r-sm');
        button.setAttribute('title', 'Redo');
      } else if (buttons[i] == "cut") {
        icon = "./assets/mxgraph/images/cut.gif";
        button.setAttribute('class', 'btn btn-sm');
        button.setAttribute('title', 'Cut');
      } else if (buttons[i] == "copy") {
        icon = "./assets/mxgraph/images/copy.gif";
        button.setAttribute('class', 'btn btn-sm');
        button.setAttribute('title', 'Copy');
      } else if (buttons[i] == "paste") {
        icon = "./assets/mxgraph/images/paste.gif";
        button.setAttribute('class', 'btn btn-sm m-r-sm');
        button.setAttribute('title', 'Past');
      } else if (buttons[i] == "delete") {
        icon = "./assets/mxgraph/images/delete.gif";
        button.setAttribute('class', 'btn btn-sm m-r-sm');
        button.setAttribute('title', 'Delete');
      }/*else if(buttons[i] == "show"){
         icon = "./assets/mxgraph/images/preview.gif";
        button.setAttribute('class', 'btn btn-sm m-r-sm');
        button.setAttribute('title', 'Preview');
      }*/ else if (buttons[i] == "toggleOutline") {
        icon = "./assets/mxgraph/images/outline.gif";
        button.setAttribute('class', 'btn btn-sm m-r-sm');
        button.setAttribute('title', 'Outline');
      }

      dom.setAttribute('src', icon);
      button.appendChild(dom);
      mxUtils.write(button, '');
      let factory = function (name) {
        return function () {
          editor.execute(name);
        };
      };

      mxEvent.addListener(button, 'click', factory(buttons[i]));
      node.appendChild(button);
    }

    editor.execute('toggleOutline');
    JobChainComponent.popupwindow();

    // Create zoom actions in page
    let zoomNode = document.getElementById('zoomActions');
    let zoomButtons = ['zoomIn', 'zoomOut', 'actualSize', 'fit'];

    for (let i = 0; i < zoomButtons.length; i++) {
      let button = document.createElement('button');
      let dom = document.createElement('img');
      let icon: any;
      if (zoomButtons[i] == "zoomIn") {
        icon = "./assets/mxgraph/images/zoomin.gif";
        button.setAttribute('class', 'btn btn-sm');
        button.setAttribute('title', 'Zoom In');
      } else if (zoomButtons[i] == "zoomOut") {
        icon = "./assets/mxgraph/images/zoomout.gif";
        button.setAttribute('class', 'btn btn-sm m-r-sm');
        button.setAttribute('title', 'Zoom Out');
      } else if (zoomButtons[i] == "actualSize") {
        icon = "./assets/mxgraph/images/zoomactual.gif";
        button.setAttribute('class', 'btn btn-sm');
        button.setAttribute('title', 'Actual');
      } else if (zoomButtons[i] == "fit") {
        icon = "./assets/mxgraph/images/zoom.gif";
        button.setAttribute('class', 'btn btn-sm m-r-sm');
        button.setAttribute('title', 'Fit');
      }
      dom.setAttribute('src', icon);
      button.appendChild(dom);
      mxUtils.write(button, '');
      let factory = function (name) {
        return function () {
          editor.execute(name);
        };
      };

      mxEvent.addListener(button, 'click', factory(zoomButtons[i]));
      zoomNode.appendChild(button);
    }

    editor.graph.isCellEditable = function (cell) {
      return !this.getModel().isEdge(cell);
    };

    // Overrides method to store a cell label in the model
    let cellLabelChanged = editor.graph.cellLabelChanged;
    editor.graph.cellLabelChanged = function (cell, newValue, autoSize) {
      //TODO
      cellLabelChanged.apply(this, arguments);
    };


    // Implements a properties panel that uses
    // mxCellAttributeChange to change properties
    editor.graph.getSelectionModel().addListener(mxEvent.CHANGE, function (sender, evt) {
      selectionChanged(editor.graph);
    });

    selectionChanged(editor.graph);

    /**
     * Updates the properties panel
     */
    function selectionChanged(graph) {
      let div = document.getElementById('properties');

      // Forces focusout in IE
      graph.container.focus();

      // Clears the DIV the non-DOM way
      div.innerHTML = '';

      // Gets the selection cell
      let cell = graph.getSelectionCell();
      console.log('getSelectionCell')

      if (cell == null) {
        mxUtils.writeln(div, 'Nothing selected.');
      }
      else {
        // Creates the form from the attributes of the user object

        if(cell.source && cell.target) {

          if (cell.source.value.nodeName === 'If') {
            if(!cell.value.attributes[0].label) {
              graph.getModel().beginUpdate();
              try {
                let edit = new mxCellAttributeChange(
                  cell, cell.value.attributes[0].nodeName,
                  'then');
                graph.getModel().execute(edit);
              }
              finally {
                graph.getModel().endUpdate();
              }
            }
            console.log(cell.source)
            if (cell.source.getEdgeCount() >0) {
              console.log('if....')
              for(let i=0; i<cell.source.getEdgeCount();i++ ) {
                console.log(cell.source.getEdgeAt(i).source.id + ' id .. '+cell.source.id + ' target '+cell.source.getEdgeAt(i).target.id)
                if (cell.source.id == cell.source.getEdgeAt(i).source.id) {
                  console.log('Outgoing connection....')
                } else {
                  console.log('Incoming connection....');
                }
              }
            }
          }
        }

        let form = new mxForm();
        let attrs = cell.value.attributes;
        for (let i = 0; i < attrs.length; i++) {
          createTextField(graph, form, cell, attrs[i]);
        }
        div.appendChild(form.getTable());
        mxUtils.br(div);
      }
    }

    /**
     * Creates the textfield for the given property.
     */
    function createTextField(graph, form, cell, attribute) {
      let input = form.addText(attribute.nodeName + ':', attribute.nodeValue);

      let applyHandler = function () {
        let newValue = input.value || '';
        let oldValue = cell.getAttribute(attribute.nodeName, '');

        if (newValue != oldValue) {
          graph.getModel().beginUpdate();

          try {
            let edit = new mxCellAttributeChange(
              cell, attribute.nodeName,
              newValue);
            graph.getModel().execute(edit);
          }
          finally {
            graph.getModel().endUpdate();
          }
        }
      };

      mxEvent.addListener(input, 'keypress', function (evt) {
        // Needs to take shift into account for textareas
        if (evt.keyCode == /*enter*/13 &&
          !mxEvent.isShiftDown(evt)) {
          input.blur();
        }
      });

      if (mxClient.IS_IE) {
        mxEvent.addListener(input, 'focusout', applyHandler);
      }
      else {
        mxEvent.addListener(input, 'blur', applyHandler);
      }
    }

   // if (sessionStorage.getItem('$JOE$XML')) {
     // let doc = mxUtils.parseXml(sessionStorage.getItem('$JOE$XML'));
      let doc = mxUtils.parseXml(this.xmlTest);
      let codec = new mxCodec(doc);
      codec.decode(doc.documentElement, editor.graph.getModel());


      let first = new mxHierarchicalLayout(editor.graph);
      let second = new mxParallelEdgeLayout(editor.graph);
      let layout = new mxCompositeLayout(editor.graph, [first, second], first);

      let parent = editor.graph.getDefaultParent();
      layout.execute(parent);
   // }

  }

  /**
   * Constructs a new application (returns an mxEditor instance)
   */
  createEditor(config) {
    let editor = null;
    try {
      if (!mxClient.isBrowserSupported()) {
        mxUtils.error('Browser is not supported!', 200, false);
      }
      else {
        mxObjectCodec.allowEval = true;
        let node = mxUtils.load(config).getDocumentElement();
        editor = new mxEditor(node);

        // Source nodes needs 1..2 connected Targets
				editor.graph.multiplicities.push(new mxMultiplicity(
				   true, 'Job', null, null, 0, 1, ['Job', 'Process', 'If'],
				   'Job can have only one out going Edge',
				   'Job can only Connect to Instructions', true));

				// Source node does not want any incoming connections
				editor.graph.multiplicities.push(new mxMultiplicity(
				   false, 'Job', null, null, 0, 1, null,
				   'Job can have only one incoming Edge',
				   null)); // Type does not matter

				// Source node does not want any incoming connections
				editor.graph.multiplicities.push(new mxMultiplicity(
				   true, 'If', null, null, 1, 3, ['Job', 'Exit', 'Fork'],
				   'If instruction can have only 2 out going Edge',
				   null));

				editor.graph.multiplicities.push(new mxMultiplicity(
				   false, 'If', null, null, 0, 1, null,
				   'If instruction can have only one incoming Edge',
				   null)); // Type does not matter

        this.initEditorConf(editor);
        mxObjectCodec.allowEval = false;

        // Adds active border for panning inside the container
        editor.graph.createPanningManager = function () {
          let pm = new mxPanningManager(this);
          pm.border = 30;
          return pm;
        };

        editor.graph.allowAutoPanning = true;
        editor.graph.timerAutoScroll = true;
        editor.addListener(mxEvent.OPEN);
        // Prints the current root in the window title if the
        // current root of the graph changes (drilling).
        editor.addListener(mxEvent.ROOT);
      }
      this.editor = editor;
    }
    catch (e) {
      // Shows an error message if the editor cannot start
      mxUtils.alert('Cannot start application: ' + e.message);
      throw e; // for debugging
    }
  }

  receiveMessage(event) {
    this.view = event;
    if (this.view == 'list') {
      this.hidePopup();
    } else {
      this.showPopup();
    }
  }

  private showPopup() {
    let dom = $('.mxWindow');
    if (dom && dom.position()) {
      dom.show();
    }
  }

  private hidePopup() {
    let dom = $('.mxWindow');
    if (dom && dom.position()) {
      dom.hide();
    }
  }

  onNodeSelected(e): void {

  }

  toggleExpanded(e): void {
    e.node.data.isExpanded = e.isExpanded;
  }


  onClick() {
    console.log('save on click action....')
    // Creates a layout algorithm to be used
    // with the graph
    /*    if (this.editor) {
          let layout = new mxHierarchicalLayout(this.editor.graph);
          let parent = this.editor.graph.getDefaultParent();
          layout.execute(parent);
        }*/
    let enc = new mxCodec();
    let node = enc.encode(this.editor.graph.getModel());

    console.log(mxUtils.getPrettyXml(node));
  }

  onResize() {
    JobChainComponent.calculateHeight();
  }

  checkAll() {

  }

  checkMainCheckbox() {

  }

  static calculateHeight() {
    let dom = $('.mxWindow');
    if (dom && dom.position()) {
      if (dom.position().left > (window.innerWidth - dom.width())) {
        dom.css({
          'top': window.innerHeight - dom.height() - 20 + 'px',
          'left': window.innerWidth - dom.width() - 30 + 'px'
        });
      }

    }
  }

  static popupwindow() {
    let dom = $('.mxWindow');
    if (dom && dom.position()) {
      dom.css({
        'top': window.innerHeight - dom.height() - 20 + 'px',
        'left': window.innerWidth - 320 + 'px',
        'width': '300px'
      });

    }
  }
}
