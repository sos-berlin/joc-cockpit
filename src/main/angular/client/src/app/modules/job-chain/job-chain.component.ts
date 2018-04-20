import {Component, OnInit, ViewChild} from '@angular/core';
import {CoreService} from "../../services/core.service";
import {TreeComponent} from "../../components/tree-navigation/tree.component";
import {AuthService} from "../../components/guard/auth.service";


declare var mxEditor: any;
declare var mxUtils: any;
declare var mxEvent;
declare var mxClient;
declare var mxObjectCodec;
declare var mxPanningManager;
declare var mxVertexHandler;
declare var mxGuide;
declare var mxEdgeHandler;
declare var mxImage;
declare var mxGraphHandler;
declare var mxConnectionHandler;
declare var mxCodec;
declare var mxXmlCanvas2D;
declare var mxImageExport;
declare var mxXmlRequest;
declare var mxConstants;
declare var mxSvgCanvas2D;
declare var mxResources;
declare var mxAutoSaveManager;
declare var $;

@Component({
  selector: 'app-job-chain',
  templateUrl: './job-chain.component.html',
  styleUrls: ['./job-chain.component.css']
})
export class JobChainComponent implements OnInit {
  schedulerIds: any = {};
  tree: any = [];
  isLoading: boolean = true;
  @ViewChild(TreeComponent) child;


  constructor(private authService: AuthService, public coreService: CoreService) {
  }

  ngOnInit() {
    let dom = $('#lefSidePanel');
    this.init();

    if (dom) {
      dom.resizable({
        handles: 'e',
        maxWidth: 450,
        minWidth: 180,
        resize: function () {
          $('#centerPanel').css('margin-left', dom.width() + 20 + 'px')
        }
      });
    }
  }

  init() {
    this.schedulerIds = JSON.parse(this.authService.scheduleIds);
    this.initTree();

  }

  initTree() {
    this.coreService.post('tree', {
      jobschedulerId: this.schedulerIds.selected,
      compact: true
    }).subscribe(res => {
      this.tree = this.coreService.prepareTree(res);
      this.isLoading = false;
      this.createEditor('./assets/mxgraph/editors/config/diagrameditor.xml');
       JobChainComponent.calculateHeight();
    }, err => {
      this.isLoading = false;
    });
  }


  private initEditorConf(editor) {
    // Enables rotation handle
    mxVertexHandler.prototype.rotationEnabled = true;

    // Enables guides
    mxGraphHandler.prototype.guidesEnabled = true;

    // Alt disables guides
    mxGuide.prototype.isEnabledForEvent = function (evt) {
      return !mxEvent.isAltDown(evt);
    };

    // Enables snapping waypoints to terminals
    mxEdgeHandler.prototype.snapToTerminals = true;

    // Defines an icon for creating new connections in the connection handler.
    // This will automatically disable the highlighting of the source vertex.
    mxConnectionHandler.prototype.connectImage = new mxImage('./assets/mxgraph/editors/images/connector.gif', 16, 16);

    // Enables connections in the graph and disables
    // reset of zoom and translate on root change
    // (ie. switch between XML and graphical mode).
    editor.graph.setConnectable(true);

    // Clones the source if new connection has no target
    editor.graph.connectionHandler.setCreateTarget(true);

    // Changes the zoom on mouseWheel events
    mxEvent.addMouseWheelListener(function (evt, up) {
      if (!mxEvent.isConsumed(evt)) {
        if (up) {
          editor.execute('zoomIn');
        }
        else {
          editor.execute('zoomOut');
        }

        mxEvent.consume(evt);
      }
    });

    // Defines a new action to switch between
    // XML and graphical display
    let textNode: any = document.getElementById('xml');
    let graphNode = editor.graph.container;
    let sourceInput: any = document.getElementById('source');
    sourceInput.checked = false;

    let funct = function (editor) {
      if (sourceInput.checked) {
        graphNode.style.display = 'none';
        textNode.style.display = 'inline';

        let enc = new mxCodec();
        let node = enc.encode(editor.graph.getModel());

        textNode.value = mxUtils.getPrettyXml(node);
        textNode.originalValue = textNode.value;
        textNode.focus();
      }
      else {
        graphNode.style.display = '';

        if (textNode.value != textNode.originalValue) {
          let doc = mxUtils.parseXml(textNode.value);
          let dec = new mxCodec(doc);
          dec.decode(doc.documentElement, editor.graph.getModel());
        }

        textNode.originalValue = null;

        // Makes sure nothing is selected in IE
        if (mxClient.IS_IE) {
          mxUtils.clearSelection();
        }

        textNode.style.display = 'none';

        // Moves the focus back to the graph
        editor.graph.container.focus();
      }
    };

     editor.addAction('switchView', funct);

    // Defines a new action to switch between
    // XML and graphical display
    mxEvent.addListener(sourceInput, 'click', function () {
      editor.execute('switchView');
    });

    // Create select actions in page
    let node = document.getElementById('mainActions');
    let buttons = ['group', 'ungroup', 'undo', 'redo', 'cut', 'copy', 'paste', 'delete','show','toggleOutline'];
    // Only adds image and SVG export from backend
    // NOTE: The old image export in mxEditor is not used, the urlImage is used for the new export.
    if (editor.urlImage != null) {
      // Client-side code for image export
      let exportImage = function (editor) {
        let graph = editor.graph;
        let scale = graph.view.scale;
        let bounds = graph.getGraphBounds();

        // New image export
        let xmlDoc = mxUtils.createXmlDocument();
        let root = xmlDoc.createElement('output');
        xmlDoc.appendChild(root);

        // Renders graph. Offset will be multiplied with state's scale when painting state.
        let xmlCanvas = new mxXmlCanvas2D(root);
        xmlCanvas.translate(Math.floor(1 / scale - bounds.x), Math.floor(1 / scale - bounds.y));
        xmlCanvas.scale(scale);

        let imgExport = new mxImageExport();
        imgExport.drawState(graph.getView().getState(graph.model.root), xmlCanvas);

        // Puts request data together
        let w = Math.ceil(bounds.width * scale + 2);
        let h = Math.ceil(bounds.height * scale + 2);
        let xml = mxUtils.getXml(root);

        // Requests image if request is valid
        if (w > 0 && h > 0) {
          let name = 'export.png';
          let format = 'png';
          let bg = '&bg=#FFFFFF';

          new mxXmlRequest(editor.urlImage, 'filename=' + name + '&format=' + format +
            bg + '&w=' + w + '&h=' + h + '&xml=' + encodeURIComponent(xml)).simulate(document, '_blank');
        }
      };

      editor.addAction('exportImage', exportImage);

      // Client-side code for SVG export
      let exportSvg = function (editor) {
        let graph = editor.graph;
        let scale = graph.view.scale;
        let bounds = graph.getGraphBounds();

        // Prepares SVG document that holds the output
        let svgDoc = mxUtils.createXmlDocument();
        let root = (svgDoc.createElementNS != null) ?
          svgDoc.createElementNS(mxConstants.NS_SVG, 'svg') : svgDoc.createElement('svg');

        if (root.style != null) {
          root.style.backgroundColor = '#FFFFFF';
        }
        else {
          root.setAttribute('style', 'background-color:#FFFFFF');
        }

        if (svgDoc.createElementNS == null) {
          root.setAttribute('xmlns', mxConstants.NS_SVG);
        }

        root.setAttribute('width', Math.ceil(bounds.width * scale + 2) + 'px');
        root.setAttribute('height', Math.ceil(bounds.height * scale + 2) + 'px');
        root.setAttribute('xmlns:xlink', mxConstants.NS_XLINK);
        root.setAttribute('version', '1.1');

        // Adds group for anti-aliasing via transform
        let group = (svgDoc.createElementNS != null) ?
          svgDoc.createElementNS(mxConstants.NS_SVG, 'g') : svgDoc.createElement('g');
        group.setAttribute('transform', 'translate(0.5,0.5)');
        root.appendChild(group);
        svgDoc.appendChild(root);

        // Renders graph. Offset will be multiplied with state's scale when painting state.
        let svgCanvas = new mxSvgCanvas2D(group);
        svgCanvas.translate(Math.floor(1 / scale - bounds.x), Math.floor(1 / scale - bounds.y));
        svgCanvas.scale(scale);

        let imgExport = new mxImageExport();
        imgExport.drawState(graph.getView().getState(graph.model.root), svgCanvas);

        let name = 'export.svg';
        let xml = encodeURIComponent(mxUtils.getXml(root));

        new mxXmlRequest(editor.urlEcho, 'filename=' + name + '&format=svg' + '&xml=' + xml).simulate(document, "_blank");
      };

      editor.addAction('exportSvg', exportSvg);

      buttons.push('exportImage');
      buttons.push('exportSvg');
    }

    for (let i = 0; i < buttons.length; i++) {
      let button = document.createElement('button');
      let dom = document.createElement('img');
      let icon: any;
      if (buttons[i] == "group") {
        icon = "./assets/mxgraph/editors/images/group.gif";
        button.setAttribute('class', 'btn btn-sm');
        button.setAttribute('title', 'Group');
      } else if (buttons[i] == "ungroup") {
        icon = "./assets/mxgraph/editors/images/ungroup.gif";
        button.setAttribute('class', 'btn btn-sm m-r-sm');
        button.setAttribute('title', 'Ungroup');
      } else if (buttons[i] == "undo") {
        icon = "./assets/mxgraph/editors/images/undo.gif";
        button.setAttribute('class', 'btn btn-sm');
        button.setAttribute('title', 'Undo');
      } else if (buttons[i] == "redo") {
        icon = "./assets/mxgraph/editors/images/redo.gif";
        button.setAttribute('class', 'btn btn-sm m-r-sm');
        button.setAttribute('title', 'Redo');
      } else if (buttons[i] == "cut") {
        icon = "./assets/mxgraph/editors/images/cut.gif";
        button.setAttribute('class', 'btn btn-sm');
        button.setAttribute('title', 'Cut');
      } else if (buttons[i] == "copy") {
        icon = "./assets/mxgraph/editors/images/copy.gif";
        button.setAttribute('class', 'btn btn-sm');
        button.setAttribute('title', 'Copy');
      } else if (buttons[i] == "paste") {
        icon = "./assets/mxgraph/editors/images/paste.gif";
        button.setAttribute('class', 'btn btn-sm m-r-sm');
        button.setAttribute('title', 'Past');
      } else if (buttons[i] == "delete") {
        icon = "./assets/mxgraph/editors/images/delete.gif";
        button.setAttribute('class', 'btn btn-sm m-r-sm');
        button.setAttribute('title', 'Delete');
      }else if(buttons[i] == "show"){
         icon = "./assets/mxgraph/editors/images/preview.gif";
        button.setAttribute('class', 'btn btn-sm m-r-sm');
        button.setAttribute('title', 'Preview');
      }else if(buttons[i] == "toggleOutline"){
         icon = "./assets/mxgraph/editors/images/outline.gif";
        button.setAttribute('class', 'btn btn-sm');
        button.setAttribute('title', 'Outline');
      }
      //<add as="outline" action="toggleOutline" icon="./assets/mxgraph/editors/images/outline.gif"/>
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


    // Create zoom actions in page
    let zoomNode = document.getElementById('zoomActions');
    let zoomButtons = ['zoomIn', 'zoomOut', 'actualSize', 'fit'];

    for (let i = 0; i < zoomButtons.length; i++) {
      let button = document.createElement('button');
      let dom = document.createElement('img');
      let icon: any;
      if (zoomButtons[i] == "zoomIn") {
        icon = "./assets/mxgraph/editors/images/zoomin.gif";
        button.setAttribute('class', 'btn btn-sm');
        button.setAttribute('title', 'Zoom In');
      } else if (zoomButtons[i] == "zoomOut") {
        icon = "./assets/mxgraph/editors/images/zoomout.gif";
        button.setAttribute('class', 'btn btn-sm m-r-sm');
        button.setAttribute('title', 'Zoom Out');
      } else if (zoomButtons[i] == "actualSize") {
        icon = "./assets/mxgraph/editors/images/zoomactual.gif";
        button.setAttribute('class', 'btn btn-sm');
        button.setAttribute('title', 'Actual');
      } else if (zoomButtons[i] == "fit") {
        icon = "./assets/mxgraph/editors/images/zoom.gif";
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
    }
    catch (e) {
      // Shows an error message if the editor cannot start
      mxUtils.alert('Cannot start application: ' + e.message);
      throw e; // for debugging
    }
    return editor;
  }

  receiveMessage(event) {

  }

  receiveAction($event) {
    console.log($event)
  }

  static calculateHeight() {
    let headerHt = $('.app-header').height() || 60;
    let topHeaderHt = $('.top-header-bar').height() || 16;
    let ht = (window.innerHeight - (headerHt + topHeaderHt));
    $('#lefSidePanel').css('height', ht + 'px');
    $('#centerPanel').css('height', ht + 'px');
  }
}
