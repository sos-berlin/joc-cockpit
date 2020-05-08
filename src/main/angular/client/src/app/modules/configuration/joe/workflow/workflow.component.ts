import {Component, HostListener, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {Subscription} from 'rxjs';
import {saveAs} from 'file-saver';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {FileUploader} from 'ng2-file-upload';
import {TranslateService} from '@ngx-translate/core';
import {ToasterService} from 'angular2-toaster';
import {WorkflowService} from '../../../../services/workflow.service';
import {DataService} from '../../../../services/data.service';
import {CoreService} from '../../../../services/core.service';
import * as _ from 'underscore';

// Mx-Graph Objects
declare const mxEditor;
declare const mxUtils;
declare const mxEvent;
declare const mxClient;
declare const mxObjectCodec;
declare const mxEdgeHandler;
declare const mxCodec;
declare const mxAutoSaveManager;
declare const mxGraphHandler;
declare const mxCellAttributeChange;
declare const mxGraph;
declare const mxImage;
declare const mxImageExport;
declare const mxXmlCanvas2D;
declare const mxOutline;
declare const mxDragSource;
declare const mxConstants;
declare const mxRectangle;
declare const mxPoint;
declare const mxUndoManager;
declare const mxEventObject;
declare const mxToolbar;
declare const mxCellHighlight;
declare const mxImageShape;

declare const X2JS;
declare const $;

const x2js = new X2JS();

@Component({
  selector: 'app-add-workflow-modal',
  templateUrl: './add-workflow-dialog.html'
})
export class AddWorkflowComponent implements OnInit {
  @Input() workflow: any = {};
  @Input() update: boolean;
  isUnique = true;
  workflowName: string;

  constructor(public activeModal: NgbActiveModal) {
  }

  ngOnInit() {
    this.workflowName = this.workflow.name;
  }

  //Todo
  checkWorkflow() {

  }

  onSubmit(): void {
    this.workflow.name = this.workflowName;
    this.activeModal.close();
  }
}

@Component({
  selector: 'app-job-content',
  templateUrl: './job-text-editor.html'
})
export class JobComponent implements OnChanges {
  @Input() selectedNode: any;
  @Input() jobs: any;
  returnCodes: any = {on: 'success'};
  cmOption: any = {
    lineNumbers: true,
    indentWithTabs: true,
    autoRefresh: true,
    mode: 'shell'
  };

  constructor(private coreService: CoreService, private workflowService: WorkflowService) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.jobs) {
      this.jobs = changes.jobs.currentValue;
    }
    if (changes.selectedNode) {
      this.selectedNode = changes.selectedNode.currentValue;
      this.init();
    }
  }
  private init() {
    this.getJobInfo();
    let defaultArguments = [];
    if (!this.selectedNode.obj.defaultArguments || _.isEmpty(this.selectedNode.obj.defaultArguments)) {
      this.selectedNode.obj.defaultArguments = [];
    }
    if (this.selectedNode.obj.defaultArguments && !_.isEmpty(this.selectedNode.obj.defaultArguments)) {
      defaultArguments = Object.entries(this.selectedNode.obj.defaultArguments).map(([k, v]) => {
        return {name: k, value: v};
      });
    }
    this.selectedNode.obj.defaultArguments = defaultArguments;

    if (this.selectedNode.obj.defaultArguments && this.selectedNode.obj.defaultArguments.length == 0) {
      this.addArgument();
    }
  }

  private setJobProperties() {
    if (!this.selectedNode.job.taskLimit) {
      this.selectedNode.job.taskLimit = 1;
    }
    if (!this.selectedNode.job.executable || !this.selectedNode.job.executable.script) {
      this.selectedNode.job.executable = {
        TYPE: 'ExecutableScript',
        script: ''
      };
    }
    if (!this.selectedNode.job.returnCodeMeaning) {
      this.selectedNode.job.returnCodeMeaning = {success: '0'};
    } else {
      if (this.selectedNode.job.returnCodeMeaning.success) {
        this.selectedNode.job.returnCodeMeaning.success = this.selectedNode.job.returnCodeMeaning.success.toString();
      } else if (this.selectedNode.job.returnCodeMeaning.failure) {
        this.selectedNode.job.returnCodeMeaning.failure = this.selectedNode.job.returnCodeMeaning.failure.toString();
      }
    }
    if (!this.selectedNode.job.defaultArguments || _.isEmpty(this.selectedNode.job.defaultArguments)) {
      this.selectedNode.job.defaultArguments = [];
    } else {
      if (this.selectedNode.job.defaultArguments && !_.isEmpty(this.selectedNode.job.defaultArguments)) {
        this.selectedNode.job.defaultArguments = Object.entries(this.selectedNode.job.defaultArguments).map(([k, v]) => {
          return {name: k, value: v};
        });
        if (this.selectedNode.job.defaultArguments && this.selectedNode.job.defaultArguments.length > 0) {
          for (let i = 0; i < this.selectedNode.job.defaultArguments.length; i++) {
            if (this.selectedNode.job.defaultArguments[i].name) {
              this.selectedNode.job.defaultArguments[i].name = this.selectedNode.job.defaultArguments[i].name.trim();
            }
          }
        }
      }
    }
    if (this.selectedNode.job.timeout) {
      this.selectedNode.job.timeout1 = this.workflowService.convertDurationToString(this.selectedNode.job.timeout);
    }
    if (this.selectedNode.job.graceTimeout) {
      this.selectedNode.job.graceTimeout1 = this.workflowService.convertDurationToString(this.selectedNode.job.graceTimeout);
    }
    if (this.selectedNode.job.defaultArguments && this.selectedNode.job.defaultArguments.length == 0) {
      this.addVariable();
    }
  }

  getJobInfo() {
    let flag = false;
    for (let i = 0; i < this.jobs.length; i++) {
      if (this.jobs[i].name === this.selectedNode.obj.jobName) {
        this.selectedNode.job = {...this.selectedNode.job, ...this.jobs[i].value};
        flag = true;
        break;
      }
    }
    if (!flag) {
      this.selectedNode.job = {jobName: this.selectedNode.obj.jobName};
    }
    this.setJobProperties();
  }

  checkJobInfo() {
    if (this.selectedNode.job.jobName !== this.selectedNode.obj.jobName) {
      this.selectedNode.job.jobName = this.selectedNode.obj.jobName;
      for (let i = 0; i < this.jobs.length; i++) {
        if (this.jobs[i].name === this.selectedNode.obj.jobName) {
          this.selectedNode.job = {...this.selectedNode.job, ...this.jobs[i].value};
          break;
        }
      }
      this.setJobProperties();
    }
  }

  addArgument(): void {
    const param = {
      name: '',
      value: ''
    };
    if (this.selectedNode.obj.defaultArguments) {
      if (!this.coreService.isLastEntryEmpty(this.selectedNode.obj.defaultArguments, 'name', '')) {
        this.selectedNode.obj.defaultArguments.push(param);
      }
    }
  }

  removeArgument(index): void {
    this.selectedNode.obj.defaultArguments.splice(index, 1);
  }

  addVariable(): void {
    const param = {
      name: '',
      value: ''
    };
    if (this.selectedNode.job.defaultArguments) {
      if (!this.coreService.isLastEntryEmpty(this.selectedNode.job.defaultArguments, 'name', '')) {
        this.selectedNode.job.defaultArguments.push(param);
      }
    }
  }

  removeVariable(index): void {
    this.selectedNode.job.defaultArguments.splice(index, 1);
  }
}

@Component({
  selector: 'app-expression-content',
  templateUrl: './expression-editor.html'
})
export class ExpressionComponent implements OnInit {
  @Input() selectedNode: any;
  expression: any = {};
  isValid = true;
  isClicked = false;
  tmp = '';
  tmp1 = '';
  operators = ['==', '!=', '<', '<=', '>', '>=', 'in', '&&', '||', '!'];
  functions = ['toNumber ', 'toBoolean', 'toLowerCase', 'toUpperCase'];
  variablesOperators = ['matches', 'startWith', 'endsWith', 'contains'];
  isVariableSelected = false;
  varExam = 'variable ("aString", "") matches ".*"';
  lastSelectOperator = '';

  constructor() {
  }

  ngOnInit() {
    this.expression.type = 'returnCode';
  }

  generateExpression(type, operator) {
    this.lastSelectOperator = operator;
    if (type === 'function') {
      if (this.isVariableSelected) {
        if (!this.tmp1) {
          this.tmp1 = this.selectedNode.obj.predicate;
          this.selectedNode.obj.predicate = this.selectedNode.obj.predicate + '.' + operator + ' ';
        } else {
          this.selectedNode.obj.predicate = this.tmp1 + '.' + operator + ' ';
        }
      }
      if (operator === 'toNumber') {
        this.varExam = 'variable ("aNumber", "0").' + operator;
      } else if (operator === 'toBoolean') {
        this.varExam = 'variable ("aBoolean", "false").' + operator;
      } else {
        this.varExam = 'variable ("aString", "").' + operator;
      }
    } else {
      if (type && !operator) {
        if (this.isClicked && this.selectedNode.obj.predicate) {
          if (this.selectedNode.obj.predicate.length > 5) {
            const str = this.selectedNode.obj.predicate.substring(this.selectedNode.obj.predicate.length - 5);
            if (str.lastIndexOf('&&') > -1 || str.lastIndexOf('||') > -1) {
              if (type === 'returnCode') {
                this.selectedNode.obj.predicate = this.selectedNode.obj.predicate + ' ' + type + ' ';
                this.isClicked = false;
                this.tmp1 = '';
              } else if (!this.isVariableSelected) {
                this.isVariableSelected = true;
                this.selectedNode.obj.predicate = this.selectedNode.obj.predicate + ' variables(\'key\', \'defaultValue\')';
                this.isClicked = false;
                this.tmp1 = '';
              }
            }
          }
        } else {
          this.isVariableSelected = false;
        }
        this.expression.type = type;
        if (!this.selectedNode.obj.predicate || this.selectedNode.obj.predicate === '') {
          if (type === 'returnCode') {
            this.isVariableSelected = false;
            this.selectedNode.obj.predicate = type + ' ';
          } else {
            this.isVariableSelected = true;
            this.selectedNode.obj.predicate = 'variables(\'key\', \'defaultValue\')';
          }
          this.isClicked = false;
          this.tmp1 = '';
        }
        this.varExam = 'variable ("aString", "") matches ".*"';
      } else if (operator) {
        // this.isVariableSelected = false;
        this.tmp1 = '';
        if (!this.isClicked) {
          this.isClicked = true;
          this.tmp = this.selectedNode.obj.predicate;
          this.selectedNode.obj.predicate = this.selectedNode.obj.predicate + ' ' + operator + ' ';
        } else if (this.tmp) {
          this.selectedNode.obj.predicate = this.tmp + ' ' + operator + ' ';
        }
      }
    }
  }

  validateExpression() {
    this.isClicked = false;
    this.tmp = '';
    this.tmp1 = '';
    this.lastSelectOperator = '';
  }

  onKepPress($event: any) {
    const charCode = ($event.which) ? $event.which : $event.keyCode;
    if ((charCode < 91 && charCode > 64) || (charCode < 123 && charCode > 96) || (charCode < 58 && charCode > 47)
      || charCode == 8 || charCode == 32 || charCode == 40 || charCode == 41 || charCode == 34 || charCode == 39) {
      this.isValid = true;
    } else {
      if (this.lastSelectOperator != 'matches' && this.lastSelectOperator != 'startWith' && this.lastSelectOperator != 'endsWith' && this.lastSelectOperator != 'contains') {
        this.isValid = false;
        $event.preventDefault();
      }
    }

    if ((this.lastSelectOperator == '<' || this.lastSelectOperator == '<=' || this.lastSelectOperator == '>'
      || this.lastSelectOperator == '>=' || this.lastSelectOperator == 'in')) {
      if (!((charCode < 58 && charCode > 47) || (charCode == 40 || charCode == 41 || charCode == 188))) {
        this.isValid = false;
        $event.preventDefault();
      }
    }
  }
}

@Component({
  selector: 'app-import-content',
  templateUrl: './import-dialog.html'
})
export class ImportComponent implements OnInit {
  workflow: any;
  submitted = false;
  uploader: FileUploader;

  constructor(public activeModal: NgbActiveModal, public translate: TranslateService, public toasterService: ToasterService) {
    this.uploader = new FileUploader({
      url: ''
    });
  }

  ngOnInit() {
    this.uploader.onCompleteItem = (fileItem: any, response, status, headers) => {
      if (status === 200) {
        this.activeModal.close('success');
      }
    };

    this.uploader.onErrorItem = (fileItem, response: any, status, headers) => {
      if (response.error) {
        this.toasterService.pop('error', response.error.code, response.error.message);
      }
    };
  }

  // CALLBACKS
  onFileSelected(event: any): void {
    const self = this;
    let item = event['0'];

    let fileExt = item.name.slice(item.name.lastIndexOf('.') + 1).toUpperCase();
    if (fileExt != 'JSON') {
      let msg = '';
      this.translate.get('message.invalidFileExtension').subscribe(translatedValue => {
        msg = translatedValue;
      });
      this.toasterService.pop('error', '', fileExt + ' ' + msg);
      //  item.remove();
    } else {
      let reader = new FileReader();
      reader.readAsText(item, 'UTF-8');
      reader.onload = onLoadFile;
    }

    function onLoadFile(_event) {
      let data;
      try {
        data = JSON.parse(_event.target.result);
        self.workflow = data;
      } catch (e) {

      }
      if (!data || !data.instructions || data.instructions.length == 0) {
        let msg = '';
        self.translate.get('workflow.message.inValidWorkflow').subscribe(translatedValue => {
          msg = translatedValue;
        });
        self.toasterService.pop('error', '', msg);
        self.uploader.queue[0].remove();
        return;
      }
    }
  }

  onSubmit() {
    this.activeModal.close(this.workflow);
  }
}

@Component({
  selector: 'app-workflow',
  templateUrl: './workflow.component.html',
  styleUrls: ['./workflow.component.scss']
})
export class WorkflowComponent implements OnInit, OnDestroy {
  configXml = './assets/mxgraph/config/diagrameditor.xml';
  editor: any;
  dummyXml: any;
  workFlowJson: any = {};
  // Declare Map object to store fork and join Ids
  nodeMap = new Map();
  droppedCell: any;
  isCellDragging = false;
  isWorkflowReload = true;
  isWorkflowDraft = true;
  propertyPanelWidth: number;
  selectedNode: any;
  jobs: any = [];
  subscription: Subscription;
  workflow: any = {name: ''};

  @Input() selectedPath: any;
  @Input() data: any;
  @Input() preferences: any;
  @Input() schedulerId: any;

  constructor(public coreService: CoreService, public translate: TranslateService, private modalService: NgbModal,
              public toasterService: ToasterService, private workflowService: WorkflowService, private dataService: DataService) {
  }

  ngOnInit(): void {
    this.propertyPanelWidth = sessionStorage.propertyPanelWidth ? parseInt(sessionStorage.propertyPanelWidth, 10) : 310;
    this.loadConfig();
    this.coreService.get('workflow.json').subscribe((data) => {
      this.dummyXml = x2js.json2xml_str(data);
      this.createEditor(this.configXml);
      this.isWorkflowStored();
    });

    this.subscription = this.dataService.functionAnnounced$.subscribe(res => {
      if (res === 'CLEAR_WORKFLOW') {
        this.clearWorkFlow();
      } else if (res === 'SUBMIT_WORKFLOW') {
        this.submitWorkFlow();
      }
    });

    this.handleWindowEvents();
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
        new mxOutline(this.editor.graph, outln);
      }
    } catch (e) {
      // Shows an error message if the editor cannot start
      mxUtils.alert('Cannot start application: ' + e.message);
      throw e; // for debugging
    }
  }

  private getJSON(): object {
    if (sessionStorage.$SOS$WORKFLOW) {
      let obj = JSON.parse(sessionStorage.$SOS$WORKFLOW) || {};
      if (obj.jobs) {
        if (obj.jobs && !_.isEmpty(obj.jobs)) {
          this.jobs = Object.entries(obj.jobs).map(([k, v]) => {
            return {name: k, value: v};
          });
        }
      }
      return obj;
    } else {
      return {};
    }
  }

  private jsonParser(_json) {
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
    this.workflowService.convertTryToRetry(_json);
    this.workflowService.appendIdInJson(_json);
    mxJson.mxGraphModel.root.Process = this.workflowService.getDummyNodes();
    this.workflowService.jsonParser(_json, mxJson.mxGraphModel.root, '', '');
    let x = this.workflowService.nodeMap;
    this.nodeMap = x;
    WorkflowService.connectWithDummyNodes(_json, mxJson.mxGraphModel.root);
    return mxJson;
  }

  submitWorkFlow() {
    this.isWorkflowDraft = false;
    this.coreService.post('workflow/store', {
      jobschedulerId: this.schedulerId,
      workflow: this.workFlowJson
    }).subscribe(res => {
      console.log(res);
    }, (err) => {
      console.log(err);
    });
  }

  clearWorkFlow() {
    this.isWorkflowDraft = true;
    sessionStorage.$SOS$WORKFLOW = null;
    this.workflowService.resetVariables();
    this.nodeMap = new Map();
    this.loadConfig();
    this.workFlowJson = {};
    this.jobs = [];
    this.initEditorConf(this.editor, this.dummyXml);
  }

  isWorkflowStored(): void {
    let _json = this.getJSON();
    this.workFlowJson = _json;
    if (_json && !_.isEmpty(_json)) {
      let mxJson = this.jsonParser(_json);
      this.initEditorConf(this.editor, x2js.json2xml_str(mxJson));
      this.editor.graph.setEnabled(true);
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.saveJSON();
    try {
      if (this.editor) {
        this.editor.destroy();
        this.editor = null;
      }
    } catch (e) {
      console.log(e);
    }
  }

  addWorkflow() {
    const modalRef = this.modalService.open(AddWorkflowComponent, {backdrop: 'static'});
    modalRef.componentInstance.workflow = this.workflow;
    modalRef.result.then((result) => {

    }, (reason) => {

    });
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

  redo() {
    if (this.editor.graph.isEnabled()) {
      this.editor.redo();
    }
  }

  undo() {
    if (this.editor.graph.isEnabled()) {
      this.editor.undo();
    }
  }

  expandAll() {
    if (this.editor.graph.isEnabled()) {
      const cells = this.editor.graph.getChildVertices();
      this.editor.graph.foldCells(false, true, cells, null, null);
    }
  }

  collapseAll() {
    if (this.editor.graph.isEnabled()) {
      const cells = this.editor.graph.getChildVertices();
      this.editor.graph.foldCells(true, true, cells, null, null);
    }
  }

  delete() {
    if (this.editor.graph.isEnabled()) {
      this.editor.graph.removeCells(null, null);
    }
  }

  exportJSON() {
    if (this.workFlowJson && this.workFlowJson.instructions && this.workFlowJson.instructions.length > 0) {
      const name = 'workflow' + '.json';
      const fileType = 'application/octet-stream';
      let data = JSON.parse(JSON.stringify(this.workFlowJson));
      this.modifyJSON(data);
      if (typeof data === 'object') {
        data = JSON.stringify(data, undefined, 2);
      }
      const blob = new Blob([data], {type: fileType});
      saveAs(blob, name);
    }
  }

  importJSON() {
    const modalRef = this.modalService.open(ImportComponent, {backdrop: 'static', size: 'lg'});
    modalRef.result.then((result) => {
      this.workFlowJson = result;
      if (result.jobs && !_.isEmpty(result.jobs)) {
        this.jobs = Object.entries(result.jobs).map(([k, v]) => {
          return {name: k, value: v};
        });
      }
      this.updateXMLJSON();
    }, (reason) => {

    });
  }

  private updateXMLJSON() {
    let graph = this.editor.graph;
    let mxJson = this.jsonParser(this.workFlowJson);
    let xml = x2js.json2xml_str(mxJson);
    graph.getModel().beginUpdate();
    try {
      // Removes all cells
      graph.removeCells(graph.getChildCells(graph.getDefaultParent()), true);
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

  private handleWindowEvents() {
    const self = this;
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
          if (bounds.x > -1 && bounds.y < -30 && bounds.height > $('#graph').height()) {
            // this.editor.graph.view.setTranslate(0.6, 1);
            this.editor.graph.center(true, true, 0.5, 0);
          }
        }
      }
    });

    $('#graph').slimscroll();
    const panel = $('.property-panel');
    $('.sidebar-open', panel).click(() => {
      self.propertyPanelWidth = sessionStorage.propertyPanelWidth ? parseInt(sessionStorage.propertyPanelWidth, 10) : 310;
      $('#outlineContainer').css({'right': self.propertyPanelWidth + 10 + 'px'});
      $('.graph-container').css({'margin-right': self.propertyPanelWidth + 'px'});
      $('.toolbar').css({'margin-right': (self.propertyPanelWidth - 12) + 'px'});
      $('.sidebar-close').css({right: self.propertyPanelWidth + 'px'});
      $('#property-panel').css({width: self.propertyPanelWidth + 'px'});
      $('.sidebar-open').css({right: '-20px'});
      self.centered();
    });

    $('.sidebar-close', panel).click(() => {
      self.propertyPanelWidth = 0;
      $('#outlineContainer').css({'right': '10px'});
      $('.graph-container').css({'margin-right': '0'});
      $('.toolbar').css({'margin-right': '-12px'});
      $('.sidebar-open').css({right: '0'});
      $('#property-panel').css({width: '0', left: window.innerWidth + 'px'});
      $('.sidebar-close').css({right: '-20px'});
      self.centered();
    });
    if (window.innerWidth > 1024) {
      setTimeout(() => {
        $('.sidebar-open').click();
      }, 100);
    }
  }

  private centered() {
    if (this.editor && this.editor.graph) {
      setTimeout(() => {
        this.editor.graph.center(true, true, 0.5, 0.1);
      }, 200);
    }
  }

  private loadConfig() {
    if (!(this.preferences.theme === 'light' || this.preferences.theme === 'lighter' || !this.preferences.theme)) {
      this.configXml = './assets/mxgraph/config/diagrameditor-dark.xml';
      this.workflowService.init('dark');
    } else {
      this.workflowService.init('light');
    }
  }

  /**
   * Function: To convert Mxgraph xml to JSON (Web service response)
   * @param xml : option
   */
  private xmlToJsonParser(xml) {
    if (this.editor) {
      const _graph = _.clone(this.editor.graph);
      if (!xml) {
        const enc = new mxCodec();
        const node = enc.encode(_graph.getModel());
        xml = mxUtils.getXml(node);
      }
      let _json: any;
      try {
        _json = x2js.xml_str2json(xml);
      } catch (e) {
        console.log(e);
      }
      if (!_json.mxGraphModel) {
        return;
      }

      let objects = _json.mxGraphModel.root;

      let jsonObj = {
        id: '',
        instructions: []
      };
      let startNode: any = {};
      if (objects.Connection) {
        if (!_.isArray(objects.Connection)) {
          let _tempCon = _.clone(objects.Connection);
          objects.Connection = [];
          objects.Connection.push(_tempCon);
        }
        if (objects.Connection.length > 0) {
          let _temp;
          for (let i = 0; i < objects.Connection.length; i++) {
            if (objects.Connection[i]._type === 'then' && !_temp) {
              break;
            }
            if (objects.Connection[i]._type === 'else') {
              _temp = _.clone(objects.Connection[i]);
              objects.Connection.splice(i, 1);
              break;
            }
          }
          if (_temp) {
            objects.Connection.push(_temp);
          }
        }
        let connection = objects.Connection;
        let _jobs = _.clone(objects.Job);
        let _ifInstructions = _.clone(objects.If);
        let _forkInstructions = _.clone(objects.Fork);
        let _tryInstructions = _.clone(objects.Try);
        let _retryInstructions = _.clone(objects.Retry);
        let _awaitInstructions = _.clone(objects.Await);
        let _publishInstructions = _.clone(objects.Publish);
        let _fileWatcherInstructions = _.clone(objects.FileWatcher);
        let _failInstructions = _.clone(objects.Fail);
        let _finishInstructions = _.clone(objects.Finish);

        for (let i = 0; i < connection.length; i++) {
          if (connection[i].mxCell._source == '3') {
            continue;
          } else if (connection[i].mxCell._target == '5') {
            continue;
          }
          if (_jobs) {
            if (_.isArray(_jobs)) {
              for (let j = 0; j < _jobs.length; j++) {
                if (connection[i].mxCell._target === _jobs[j]._id) {
                  _jobs.splice(j, 1);
                  break;
                }
              }
            } else {
              if (connection[i].mxCell._target === _jobs._id) {
                _jobs = [];
              }
            }
          }
          if (_forkInstructions) {
            if (_.isArray(_forkInstructions)) {
              for (let j = 0; j < _forkInstructions.length; j++) {
                if (connection[i].mxCell._target === _forkInstructions[j]._id) {
                  _forkInstructions.splice(j, 1);
                  break;
                }
              }
            } else {
              if (connection[i].mxCell._target === _forkInstructions._id) {
                _forkInstructions = [];
              }
            }
          }
          if (_retryInstructions) {
            if (_.isArray(_retryInstructions)) {
              for (let j = 0; j < _retryInstructions.length; j++) {
                if (connection[i].mxCell._target === _retryInstructions[j]._id) {
                  _retryInstructions.splice(j, 1);
                  break;
                }
              }
            } else {
              if (connection[i].mxCell._target === _retryInstructions._id) {
                _retryInstructions = [];
              }
            }
          }
          if (_tryInstructions) {
            if (_.isArray(_tryInstructions)) {
              for (let j = 0; j < _tryInstructions.length; j++) {
                if (connection[i].mxCell._target === _tryInstructions[j]._id) {
                  _tryInstructions.splice(j, 1);
                  break;
                }
              }
            } else {
              if (connection[i].mxCell._target === _tryInstructions._id) {
                _tryInstructions = [];
              }
            }
          }
          if (_awaitInstructions) {
            if (_.isArray(_awaitInstructions)) {
              for (let j = 0; j < _awaitInstructions.length; j++) {
                if (connection[i].mxCell._target === _awaitInstructions[j]._id) {
                  _awaitInstructions.splice(j, 1);
                  break;
                }
              }
            } else {
              if (connection[i].mxCell._target === _awaitInstructions._id) {
                _awaitInstructions = [];
              }
            }
          }
          if (_publishInstructions) {
            if (_.isArray(_publishInstructions)) {
              for (let j = 0; j < _publishInstructions.length; j++) {
                if (connection[i].mxCell._target === _publishInstructions[j]._id) {
                  _publishInstructions.splice(j, 1);
                  break;
                }
              }
            } else {
              if (connection[i].mxCell._target === _publishInstructions._id) {
                _publishInstructions = [];
              }
            }
          }
          if (_fileWatcherInstructions) {
            if (_.isArray(_fileWatcherInstructions)) {
              for (let j = 0; j < _fileWatcherInstructions.length; j++) {
                if (connection[i].mxCell._target === _fileWatcherInstructions[j]._id) {
                  _fileWatcherInstructions.splice(j, 1);
                  break;
                }
              }
            } else {
              if (connection[i].mxCell._target === _fileWatcherInstructions._id) {
                _fileWatcherInstructions = [];
              }
            }
          }
          if (_ifInstructions) {
            if (_.isArray(_ifInstructions)) {
              for (let j = 0; j < _ifInstructions.length; j++) {
                if (connection[i].mxCell._target === _ifInstructions[j]._id) {
                  _ifInstructions.splice(j, 1);
                  break;
                }
              }
            } else {
              if (connection[i].mxCell._target === _ifInstructions._id) {
                _ifInstructions = [];
              }
            }
          }
          if (_failInstructions) {
            if (_.isArray(_failInstructions)) {
              for (let j = 0; j < _failInstructions.length; j++) {
                if (connection[i].mxCell._target === _failInstructions[j]._id) {
                  _failInstructions.splice(j, 1);
                  break;
                }
              }
            } else {
              if (connection[i].mxCell._target === _failInstructions._id) {
                _failInstructions = [];
              }
            }
          }
          if (_finishInstructions) {
            if (_.isArray(_finishInstructions)) {
              for (let j = 0; j < _finishInstructions.length; j++) {
                if (connection[i].mxCell._target === _finishInstructions[j]._id) {
                  _finishInstructions.splice(j, 1);
                  break;
                }
              }
            } else {
              if (connection[i].mxCell._target === _finishInstructions._id) {
                _finishInstructions = [];
              }
            }
          }
        }

        if (_jobs) {
          if (_.isArray(_jobs) && _jobs.length > 0) {
            startNode = _jobs[0];
          } else {
            startNode = _jobs;
          }
        }

        if (!_.isEmpty(startNode)) {
          jsonObj.instructions.push(this.workflowService.createObject('Job', startNode));
          this.findNextNode(connection, startNode, objects, jsonObj.instructions, jsonObj);
          startNode = null;
        } else {
          if (_forkInstructions) {
            if (_.isArray(_forkInstructions) && _forkInstructions.length > 0) {
              startNode = _forkInstructions[0];
            } else {
              startNode = _forkInstructions;
            }
          }
        }

        if (!_.isEmpty(startNode)) {
          jsonObj.instructions.push(this.workflowService.createObject('Fork', startNode));
          this.findNextNode(connection, startNode, objects, jsonObj.instructions, jsonObj);
          startNode = null;
        } else {
          if (_retryInstructions) {
            if (_.isArray(_retryInstructions) && _retryInstructions.length > 0) {
              startNode = _retryInstructions[0];
            } else {
              startNode = _retryInstructions;
            }
          }
        }

        if (!_.isEmpty(startNode)) {
          jsonObj.instructions.push(this.workflowService.createObject('Retry', startNode));
          this.findNextNode(connection, startNode, objects, jsonObj.instructions, jsonObj);
          startNode = null;
        } else {
          if (_tryInstructions) {
            if (_.isArray(_tryInstructions) && _tryInstructions.length > 0) {
              startNode = _tryInstructions[0];
            } else {
              startNode = _tryInstructions;
            }
          }
        }

        if (!_.isEmpty(startNode)) {
          jsonObj.instructions.push(this.workflowService.createObject('Try', startNode));
          this.findNextNode(connection, startNode, objects, jsonObj.instructions, jsonObj);
          startNode = null;
        } else {
          if (_publishInstructions) {
            if (_.isArray(_publishInstructions) && _publishInstructions.length > 0) {
              startNode = _publishInstructions[0];
            } else {
              startNode = _publishInstructions;
            }
          }
        }

        if (!_.isEmpty(startNode)) {
          jsonObj.instructions.push(this.workflowService.createObject('Publish', startNode));
          this.findNextNode(connection, startNode, objects, jsonObj.instructions, jsonObj);
          startNode = null;
        } else {
          if (_awaitInstructions) {
            if (_.isArray(_awaitInstructions) && _awaitInstructions.length > 0) {
              startNode = _awaitInstructions[0];
            } else {
              startNode = _awaitInstructions;
            }
          }
        }

        if (!_.isEmpty(startNode)) {
          jsonObj.instructions.push(this.workflowService.createObject('Await', startNode));
          this.findNextNode(connection, startNode, objects, jsonObj.instructions, jsonObj);
          startNode = null;
        } else {
          if (_ifInstructions) {
            if (_.isArray(_ifInstructions) && _ifInstructions.length > 0) {
              startNode = _ifInstructions[0];
            } else {
              startNode = _ifInstructions;
            }
          }
        }

        if (!_.isEmpty(startNode)) {
          jsonObj.instructions.push(this.workflowService.createObject('If', startNode));
          this.findNextNode(connection, startNode, objects, jsonObj.instructions, jsonObj);
          startNode = null;
        } else {
          if (_failInstructions) {
            if (_.isArray(_failInstructions) && _failInstructions.length > 0) {
              startNode = _failInstructions[0];
            } else {
              startNode = _failInstructions;
            }
          }
        }

        if (!_.isEmpty(startNode)) {
          jsonObj.instructions.push(this.workflowService.createObject('Fail', startNode));
          this.findNextNode(connection, startNode, objects, jsonObj.instructions, jsonObj);
          startNode = null;
        } else {
          if (_finishInstructions) {
            if (_.isArray(_finishInstructions) && _finishInstructions.length > 0) {
              startNode = _finishInstructions[0];
            } else {
              startNode = _finishInstructions;
            }
          }
        }

        if (!_.isEmpty(startNode)) {
          jsonObj.instructions.push(this.workflowService.createObject('Finish', startNode));
          this.findNextNode(connection, startNode, objects, jsonObj.instructions, jsonObj);
          startNode = null;
        }
      } else {
        const job = objects.Job;
        const ifIns = objects.If;
        const fork = objects.Fork;
        const retry = objects.Retry;
        const tryIns = objects.Try;
        const awaitIns = objects.Await;
        const publishIns = objects.Publish;
        const fileWatcherIns = objects.FileWatcher;
        const fail = objects.Fail;
        const finish = objects.Finish;
        if (job) {
          if (_.isArray(job)) {
            for (let i = 0; i < job.length; i++) {
              jsonObj.instructions.push(this.workflowService.createObject('Job', job[i]));
            }
          } else {
            jsonObj.instructions.push(this.workflowService.createObject('Job', job));
          }
        }
        if (ifIns) {
          if (_.isArray(ifIns)) {
            for (let i = 0; i < ifIns.length; i++) {
              jsonObj.instructions.push(this.workflowService.createObject('If', ifIns[i]));
            }
          } else {
            jsonObj.instructions.push(this.workflowService.createObject('If', ifIns));
          }
        }
        if (fork) {
          if (_.isArray(fork)) {
            for (let i = 0; i < fork.length; i++) {
              jsonObj.instructions.push(this.workflowService.createObject('Fork', fork[i]));
            }
          } else {
            jsonObj.instructions.push(this.workflowService.createObject('Fork', fork));
          }
        }
        if (retry) {
          if (_.isArray(retry)) {
            for (let i = 0; i < retry.length; i++) {
              jsonObj.instructions.push(this.workflowService.createObject('Retry', retry[i]));
            }
          } else {
            jsonObj.instructions.push(this.workflowService.createObject('Retry', retry));
          }
        }
        if (tryIns) {
          if (_.isArray(tryIns)) {
            for (let i = 0; i < tryIns.length; i++) {
              jsonObj.instructions.push(this.workflowService.createObject('Try', tryIns[i]));
            }
          } else {
            jsonObj.instructions.push(this.workflowService.createObject('Try', tryIns));
          }
        }
        if (awaitIns) {
          if (_.isArray(awaitIns)) {
            for (let i = 0; i < awaitIns.length; i++) {
              jsonObj.instructions.push(this.workflowService.createObject('Await', awaitIns[i]));
            }
          } else {
            jsonObj.instructions.push(this.workflowService.createObject('Await', awaitIns));
          }
        }
        if (publishIns) {
          if (_.isArray(publishIns)) {
            for (let i = 0; i < publishIns.length; i++) {
              jsonObj.instructions.push(this.workflowService.createObject('Publish', publishIns[i]));
            }
          } else {
            jsonObj.instructions.push(this.workflowService.createObject('Publish', publishIns));
          }
        }
        if (fileWatcherIns) {
          if (_.isArray(fileWatcherIns)) {
            for (let i = 0; i < fileWatcherIns.length; i++) {
              jsonObj.instructions.push(this.workflowService.createObject('FileWatcher', fileWatcherIns[i]));
            }
          } else {
            jsonObj.instructions.push(this.workflowService.createObject('FileWatcher', fileWatcherIns));
          }
        }
        if (fail) {
          if (_.isArray(fail)) {
            for (let i = 0; i < fail.length; i++) {
              jsonObj.instructions.push(this.workflowService.createObject('Fail', fail[i]));
            }
          } else {
            jsonObj.instructions.push(this.workflowService.createObject('Fail', fail));
          }
        }
        if (finish) {
          if (_.isArray(finish)) {
            for (let i = 0; i < finish.length; i++) {
              jsonObj.instructions.push(this.workflowService.createObject('Finish', finish[i]));
            }
          } else {
            jsonObj.instructions.push(this.workflowService.createObject('Finish', finish));
          }
        }
      }
      if (jsonObj.instructions.length > 0) {
        this.workFlowJson = _.clone(jsonObj);
      } else {
        this.workFlowJson = {};
      }
    }
  }

  private findNextNode(connection, node, objects, instructions: Array<any>, jsonObj) {
    if (!node) {
      return;
    }
    const id = node._id || node;
    if (_.isArray(connection)) {
      for (let i = 0; i < connection.length; i++) {
        if (!connection[i].skip && connection[i].mxCell._source && connection[i].mxCell._source === id) {
          const _id = _.clone(connection[i].mxCell._target);
          let instructionArr = instructions;
          if (connection[i]._type === 'then' || connection[i]._type === 'else') {
            for (let j = 0; j < instructions.length; j++) {
              if (instructions[j].TYPE === 'If' && instructions[j].id === id) {
                if (connection[i]._type === 'then') {
                  instructions[j].then = {
                    instructions: []
                  };
                  instructionArr = instructions[j].then.instructions;
                } else {
                  instructions[j].else = {
                    instructions: []
                  };
                  instructionArr = instructions[j].else.instructions;
                }
                break;
              }
            }
          } else if (connection[i]._type === 'branch') {
            for (let j = 0; j < instructions.length; j++) {
              if (instructions[j].TYPE === 'Fork' && instructions[j].id === id) {
                if (!instructions[j].branches) {
                  instructions[j].branches = [];
                }
                instructions[j].branches.push({instructions: []});
                for (let x = 0; x < instructions[j].branches.length; x++) {
                  if (!instructions[j].branches[x].id) {
                    instructions[j].branches[x].id = connection[i]._label;
                    instructionArr = instructions[j].branches[x].instructions;
                    break;
                  }
                }
                break;
              }
            }
          } else if (connection[i]._type === 'retry') {
            for (let j = 0; j < instructions.length; j++) {
              if (instructions[j].TYPE === 'Retry' && instructions[j].id === id) {
                if (!instructions[j].instructions) {
                  instructions[j].instructions = [];
                  instructionArr = instructions[j].instructions;
                }
                break;
              }
            }
          } else if (connection[i]._type === 'try') {
            for (let j = 0; j < instructions.length; j++) {
              if (instructions[j].TYPE === 'Try' && instructions[j].id === id) {
                if (!instructions[j].instructions) {
                  instructions[j].instructions = [];
                  instructionArr = instructions[j].instructions;
                }
                break;
              }
            }
          } else if (connection[i]._type === 'catch') {
            //console.log('catch', instructions);
          }
          connection[i].skip = true;
          if (connection[i]._type === 'join') {
            const joinInstructions = objects.Join;
            let _node: any = {};
            if (joinInstructions) {
              if (_.isArray(joinInstructions)) {
                for (let x = 0; x < joinInstructions.length; x++) {
                  if (joinInstructions[x]._id === _id) {
                    _node = joinInstructions[x];
                    break;
                  }
                }
              } else {
                if (joinInstructions._id === _id) {
                  _node = joinInstructions;
                }
              }
            }
            if (_node._targetId) {
              let arr = this.recursiveFindParentCell(_node._targetId, jsonObj.instructions);
              if (arr && arr.length > -1) {
                instructionArr = arr;
              }
            }
          } else if (connection[i]._type === 'endIf') {
            const endIfInstructions = objects.EndIf;
            let _node: any = {};
            if (endIfInstructions) {
              if (_.isArray(endIfInstructions)) {
                for (let x = 0; x < endIfInstructions.length; x++) {
                  if (endIfInstructions[x]._id === _id) {
                    _node = endIfInstructions[x];
                    break;
                  }
                }
              } else {
                if (endIfInstructions._id === _id) {
                  _node = endIfInstructions;
                }
              }
            }

            if (_node._targetId) {
              let arr = this.recursiveFindParentCell(_node._targetId, jsonObj.instructions);
              if (arr && arr.length > -1) {
                instructionArr = arr;
              }
            }
          } else if (connection[i]._type === 'endRetry') {
            const endRetryInstructions = objects.EndRetry;
            let _node: any = {};
            if (endRetryInstructions) {
              if (_.isArray(endRetryInstructions)) {
                for (let x = 0; x < endRetryInstructions.length; x++) {
                  if (endRetryInstructions[x]._id === _id) {
                    _node = endRetryInstructions[x];
                    break;
                  }
                }
              } else {
                if (endRetryInstructions._id === _id) {
                  _node = endRetryInstructions;
                }
              }
            }
            if (_node._targetId) {
              let arr = this.recursiveFindParentCell(_node._targetId, jsonObj.instructions);
              if (arr && arr.length > -1) {
                instructionArr = arr;
              }
            }
          } else if (connection[i]._type === 'endTry') {
            const endTryInstructions = objects.EndTry;
            let _node: any = {};
            if (endTryInstructions) {
              if (_.isArray(endTryInstructions)) {
                for (let x = 0; x < endTryInstructions.length; x++) {
                  if (endTryInstructions[x]._id === _id) {
                    _node = endTryInstructions[x];
                    break;
                  }
                }
              } else {
                if (endTryInstructions._id === _id) {
                  _node = endTryInstructions;
                }
              }
            }

            if (_node._targetId) {
              let arr = this.recursiveFindParentCell(_node._targetId, jsonObj.instructions);
              if (arr && arr.length > -1) {
                instructionArr = arr;
              }
            }
          }
          this.getNextNode(_id, objects, instructionArr, jsonObj);
        }
      }
    } else {
      if (connection.mxCell._source && connection.mxCell._source === id) {
        const _id = _.clone(connection.mxCell._target);
        connection = null;
        this.getNextNode(_id, objects, instructions, jsonObj);
      }
    }
  }

  private recursiveFindParentCell(id, instructionsArr: Array<any>): Array<any> {
    let arr = [];

    function recursive(_id, _instructionsArr: Array<any>) {
      for (let i = 0; i < _instructionsArr.length; i++) {
        if (_instructionsArr[i].id === _id) {
          arr = _instructionsArr;
          break;
        } else {
          if (_instructionsArr[i].TYPE === 'Fork') {
            if (_instructionsArr[i].branches) {
              for (let j = 0; j < _instructionsArr[i].branches.length; j++) {
                recursive(_id, _instructionsArr[i].branches[j].instructions);
              }
            }
          }
          if (_instructionsArr[i].TYPE === 'If') {
            if (_instructionsArr[i].then) {
              recursive(_id, _instructionsArr[i].then.instructions);
            }
            if (_instructionsArr[i].else) {
              recursive(_id, _instructionsArr[i].else.instructions);
            }
          } else if (_instructionsArr[i].TYPE === 'Try') {
            if (_instructionsArr[i].catch) {
              if (_instructionsArr[i].catch.id === _id) {
                arr = _instructionsArr[i].catch.instructions;
                break;
              } else {
                recursive(_id, _instructionsArr[i].catch.instructions);
              }
            }
            if (_instructionsArr[i].instructions && _instructionsArr[i].instructions.length > 0) {
              recursive(_id, _instructionsArr[i].instructions);
            }
          }
        }
      }
    }

    recursive(id, instructionsArr);
    return arr;
  }

  private recursiveFindCatchCell(node, instructionsArr: Array<any>): Array<any> {
    let arr = [];

    function recursive(_node, _instructionsArr: Array<any>) {
      for (let i = 0; i < _instructionsArr.length; i++) {
        if (_instructionsArr[i].id === _node._targetId) {
          if (_instructionsArr[i].TYPE === 'Try') {
            if (!_instructionsArr[i].catch) {
              _instructionsArr[i].catch = {instructions: [], id: _node._id};
              arr = _instructionsArr[i].catch.instructions;
            }
          }
          break;
        } else {
          if (_instructionsArr[i].TYPE === 'Fork') {
            if (_instructionsArr[i].branches) {
              for (let j = 0; j < _instructionsArr[i].branches.length; j++) {
                recursive(_node, _instructionsArr[i].branches[j].instructions);
              }
            }
          } else if (_instructionsArr[i].TYPE === 'If') {
            if (_instructionsArr[i].then) {
              recursive(_node, _instructionsArr[i].then.instructions);
            }
            if (_instructionsArr[i].else) {
              recursive(_node, _instructionsArr[i].else.instructions);
            }
          } else if (_instructionsArr[i].TYPE === 'Try') {
            if (_instructionsArr[i].catch) {
              recursive(_node, _instructionsArr[i].catch.instructions);
            }
          } else if (_instructionsArr[i].instructions) {
            recursive(_node, _instructionsArr[i].instructions);
          }
        }
      }
    }

    recursive(node, instructionsArr);
    return arr;
  }

  private getNextNode(id, objects, instructionsArr: Array<any>, jsonObj) {
    const connection = objects.Connection;
    const jobs = objects.Job;
    const ifInstructions = objects.If;
    const endIfInstructions = objects.EndIf;
    const forkInstructions = objects.Fork;
    const joinInstructions = objects.Join;
    const retryInstructions = objects.Retry;
    const endRetryInstructions = objects.EndRetry;
    const tryInstructions = objects.Try;
    const catchInstructions = objects.Catch;
    const tryEndInstructions = objects.EndTry;
    const awaitInstructions = objects.Await;
    const publishInstructions = objects.Publish;
    const failInstructions = objects.Fail;
    const finishInstructions = objects.Finish;
    const fileWatcherInstructions = objects.FileWatcher;

    let nextNode: any = {};

    if (jobs) {
      if (_.isArray(jobs)) {
        for (let i = 0; i < jobs.length; i++) {
          if (jobs[i]._id === id) {
            nextNode = jobs[i];
            break;
          }
        }
      } else {
        if (jobs._id === id) {
          nextNode = jobs;
        }
      }
    }

    if (nextNode && !_.isEmpty(nextNode)) {
      instructionsArr.push(this.workflowService.createObject('Job', nextNode));
      this.findNextNode(connection, nextNode, objects, instructionsArr, jsonObj);
      nextNode = null;
    } else {
      if (forkInstructions) {
        if (_.isArray(forkInstructions)) {
          for (let i = 0; i < forkInstructions.length; i++) {
            if (forkInstructions[i]._id === id) {
              nextNode = forkInstructions[i];
              break;
            }
          }
        } else {
          if (forkInstructions._id === id) {
            nextNode = forkInstructions;
          }
        }
      }
    }

    if (nextNode && !_.isEmpty(nextNode)) {
      instructionsArr.push(this.workflowService.createObject('Fork', nextNode));
      this.findNextNode(connection, nextNode, objects, instructionsArr, jsonObj);
      nextNode = null;
    } else {
      if (joinInstructions) {
        if (_.isArray(joinInstructions)) {
          for (let i = 0; i < joinInstructions.length; i++) {
            if (joinInstructions[i]._id === id) {
              nextNode = joinInstructions[i];
              break;
            }
          }
        } else {
          if (joinInstructions._id === id) {
            nextNode = joinInstructions;
          }
        }
      }
    }

    if (nextNode && !_.isEmpty(nextNode)) {
      this.findNextNode(connection, nextNode, objects, instructionsArr, jsonObj);
      nextNode = null;
    } else {
      if (retryInstructions) {
        if (_.isArray(retryInstructions)) {
          for (let i = 0; i < retryInstructions.length; i++) {
            if (retryInstructions[i]._id === id) {
              nextNode = retryInstructions[i];
              break;
            }
          }
        } else {
          if (retryInstructions._id === id) {
            nextNode = retryInstructions;
          }
        }
      }
    }

    if (nextNode && !_.isEmpty(nextNode)) {
      instructionsArr.push(this.workflowService.createObject('Retry', nextNode));
      this.findNextNode(connection, nextNode, objects, instructionsArr, jsonObj);
      nextNode = null;
    } else {
      if (endRetryInstructions) {
        if (_.isArray(endRetryInstructions)) {
          for (let i = 0; i < endRetryInstructions.length; i++) {
            if (endRetryInstructions[i]._id === id) {
              nextNode = endRetryInstructions[i];
              break;
            }
          }
        } else {
          if (endRetryInstructions._id === id) {
            nextNode = endRetryInstructions;
          }
        }
      }
    }

    if (nextNode && !_.isEmpty(nextNode)) {
      this.findNextNode(connection, nextNode, objects, instructionsArr, jsonObj);
      nextNode = null;
    } else {
      if (awaitInstructions) {
        if (_.isArray(awaitInstructions)) {
          for (let i = 0; i < awaitInstructions.length; i++) {
            if (awaitInstructions[i]._id === id) {
              nextNode = awaitInstructions[i];
              break;
            }
          }
        } else {
          if (awaitInstructions._id === id) {
            nextNode = awaitInstructions;
          }
        }
      }
    }

    if (nextNode && !_.isEmpty(nextNode)) {
      instructionsArr.push(this.workflowService.createObject('Await', nextNode));
      this.findNextNode(connection, nextNode, objects, instructionsArr, jsonObj);
      nextNode = null;
    } else {
      if (tryInstructions) {
        if (_.isArray(tryInstructions)) {
          for (let i = 0; i < tryInstructions.length; i++) {
            if (tryInstructions[i]._id === id) {
              nextNode = tryInstructions[i];
              break;
            }
          }
        } else {
          if (tryInstructions._id === id) {
            nextNode = tryInstructions;
          }
        }
      }
    }

    if (nextNode && !_.isEmpty(nextNode)) {
      instructionsArr.push(this.workflowService.createObject('Try', nextNode));
      this.findNextNode(connection, nextNode, objects, instructionsArr, jsonObj);
      nextNode = null;
    } else {
      if (tryEndInstructions) {
        if (_.isArray(tryEndInstructions)) {
          for (let i = 0; i < tryEndInstructions.length; i++) {
            if (tryEndInstructions[i]._id === id) {
              nextNode = tryEndInstructions[i];
              break;
            }
          }
        } else {
          if (tryEndInstructions._id === id) {
            nextNode = tryEndInstructions;
          }
        }
      }
    }
    if (nextNode && !_.isEmpty(nextNode)) {
      this.findNextNode(connection, nextNode, objects, instructionsArr, jsonObj);
      nextNode = null;
    } else {
      if (catchInstructions) {
        if (_.isArray(catchInstructions)) {
          for (let i = 0; i < catchInstructions.length; i++) {
            if (catchInstructions[i]._id === id) {
              nextNode = catchInstructions[i];
              break;
            }
          }
        } else {
          if (catchInstructions._id === id) {
            nextNode = catchInstructions;
          }
        }
      }
    }

    if (nextNode && !_.isEmpty(nextNode)) {
      let arr = this.recursiveFindCatchCell(nextNode, jsonObj.instructions);
      this.findNextNode(connection, nextNode, objects, arr, jsonObj);
      nextNode = null;
    }

    if (nextNode && !_.isEmpty(nextNode)) {
      this.findNextNode(connection, nextNode, objects, instructionsArr, jsonObj);
      nextNode = null;
    } else {
      if (ifInstructions) {
        if (_.isArray(ifInstructions)) {
          for (let i = 0; i < ifInstructions.length; i++) {
            if (ifInstructions[i]._id === id) {
              nextNode = ifInstructions[i];
              break;
            }
          }
        } else {
          if (ifInstructions._id === id) {
            nextNode = ifInstructions;
          }
        }
      }
    }

    if (nextNode && !_.isEmpty(nextNode)) {
      instructionsArr.push(this.workflowService.createObject('If', nextNode));
      this.findNextNode(connection, nextNode, objects, instructionsArr, jsonObj);
      nextNode = null;
    } else {
      if (endIfInstructions) {
        if (_.isArray(endIfInstructions)) {
          for (let i = 0; i < endIfInstructions.length; i++) {
            if (endIfInstructions[i]._id === id) {
              nextNode = endIfInstructions[i];
              break;
            }
          }
        } else {
          if (endIfInstructions._id === id) {
            nextNode = endIfInstructions;
          }
        }
      }
    }

    if (nextNode && !_.isEmpty(nextNode)) {
      this.findNextNode(connection, nextNode, objects, instructionsArr, jsonObj);
      nextNode = null;
    } else {
      if (failInstructions) {
        if (_.isArray(failInstructions)) {
          for (let i = 0; i < failInstructions.length; i++) {
            if (failInstructions[i]._id === id) {
              nextNode = failInstructions[i];
              break;
            }
          }
        } else {
          if (failInstructions._id === id) {
            nextNode = failInstructions;
          }
        }
      }
    }

    if (nextNode && !_.isEmpty(nextNode)) {
      instructionsArr.push(this.workflowService.createObject('Fail', nextNode));
      this.findNextNode(connection, nextNode, objects, instructionsArr, jsonObj);
      nextNode = null;
    } else {
      if (finishInstructions) {
        if (_.isArray(finishInstructions)) {
          for (let i = 0; i < finishInstructions.length; i++) {
            if (finishInstructions[i]._id === id) {
              nextNode = finishInstructions[i];
              break;
            }
          }
        } else {
          if (finishInstructions._id === id) {
            nextNode = finishInstructions;
          }
        }
      }
    }

    if (nextNode && !_.isEmpty(nextNode)) {
      instructionsArr.push(this.workflowService.createObject('Finish', nextNode));
      this.findNextNode(connection, nextNode, objects, instructionsArr, jsonObj);
      nextNode = null;
    } else {
      if (publishInstructions) {
        if (_.isArray(publishInstructions)) {
          for (let i = 0; i < publishInstructions.length; i++) {
            if (publishInstructions[i]._id === id) {
              nextNode = publishInstructions[i];
              break;
            }
          }
        } else {
          if (publishInstructions._id === id) {
            nextNode = publishInstructions;
          }
        }
      }
    }
    if (nextNode && !_.isEmpty(nextNode)) {
      instructionsArr.push(this.workflowService.createObject('Publish', nextNode));
      this.findNextNode(connection, nextNode, objects, instructionsArr, jsonObj);
      nextNode = null;
    } else {
      if (fileWatcherInstructions) {
        if (_.isArray(fileWatcherInstructions)) {
          for (let i = 0; i < fileWatcherInstructions.length; i++) {
            if (fileWatcherInstructions[i]._id === id) {
              nextNode = fileWatcherInstructions[i];
              break;
            }
          }
        } else {
          if (fileWatcherInstructions._id === id) {
            nextNode = fileWatcherInstructions;
          }
        }
      }
    }

    if (nextNode && !_.isEmpty(nextNode)) {
      instructionsArr.push(this.workflowService.createObject('FileWatcher', nextNode));
      this.findNextNode(connection, nextNode, objects, instructionsArr, jsonObj);
      nextNode = null;
    } else {
      this.findNextNode(connection, id, objects, instructionsArr, jsonObj);
    }
  }

  private initEditorConf(editor, _xml: any) {
    const self = this;
    const graph = editor.graph;
    let result: string;
    let dropTarget;
    let movedTarget;
    let selectedCellsObj;
    let isVertexDrop = false;
    let isUndoable = false;
    let dragStart = false;
    let _iterateId = 0;

    $('#toolbar').find('img').each(function (index) {
      if (index === 6) {
        $(this).addClass('disable-link');
      }
    });

    const doc = mxUtils.createXmlDocument();
    if (!_xml) {
      /**
       * Variable: autoSaveThreshold
       *
       * Minimum amount of ignored changes before an autosave. Eg. a value of 2
       * means after 2 change of the graph model the autosave will trigger if the
       * condition below is true. Default is 5.
       */
      mxAutoSaveManager.prototype.autoSaveThreshold = 1;
      mxGraph.prototype.cellsResizable = false;
      mxGraph.prototype.multigraph = false;
      mxGraph.prototype.allowDanglingEdges = false;
      mxGraph.prototype.cellsLocked = true;
      mxGraph.prototype.foldingEnabled = true;
      mxConstants.DROP_TARGET_COLOR = 'green';
      mxConstants.VERTEX_SELECTION_DASHED = false;
      mxConstants.VERTEX_SELECTION_COLOR = '#0099ff';
      mxConstants.VERTEX_SELECTION_STROKEWIDTH = 2;

      /**
       * Function: createPreviewShape
       *
       * Creates the shape used to draw the preview for the given bounds.
       */
      mxGraphHandler.prototype.createPreviewShape = function (bounds) {
        let shape, image = './assets/mxgraph/images/';
        if (self.preferences.theme !== 'light' && self.preferences.theme !== 'lighter' || !self.preferences.theme) {
          image = image + 'white-';
        }
        image = image + this.cell.value.tagName.toLowerCase() + '.png';
        shape = new mxImageShape(bounds, image);
        shape.isRounded = true;
        shape.dialect = (this.graph.dialect != mxConstants.DIALECT_SVG) ?
          mxConstants.DIALECT_VML : mxConstants.DIALECT_SVG;
        shape.init(this.graph.getView().getOverlayPane());
        shape.pointerEvents = false;
        // Workaround for artifacts on iOS
        if (mxClient.IS_IOS) {
          shape.getSvgScreenOffset = function () {
            return 0;
          };
        }
        return shape;
      };

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
      graph.setEnabled(false);
      graph.setDisconnectOnMove(false);
      graph.collapseToPreferredSize = false;
      graph.constrainChildren = false;
      graph.extendParentsOnAdd = false;
      graph.extendParents = false;

      // editor.urlImage = 'http://localhost:4200/export';
      // Only adds image and SVG export if backend is available
      // NOTE: The old image export in mxEditor is not used, the urlImage is used for the new export.
      if (editor.urlImage != null) {
        // Client-side code for image export
        const exportImage = function (_editor) {
          const scale = graph.view.scale;
          let bounds = graph.getGraphBounds();

          // New image export
          const xmlDoc = mxUtils.createXmlDocument();
          let root = xmlDoc.createElement('output');
          xmlDoc.appendChild(root);

          // Renders graph. Offset will be multiplied with state's scale when painting state.
          const xmlCanvas = new mxXmlCanvas2D(root);
          const imgExport = new mxImageExport();
          xmlCanvas.translate(Math.floor(1 / scale - bounds.x), Math.floor(1 / scale - bounds.y));
          xmlCanvas.scale(scale);

          imgExport.drawState(graph.getView().getState(graph.model.root), xmlCanvas);

          // Puts request data together
          let w = Math.ceil(bounds.width * scale + 2);
          let h = Math.ceil(bounds.height * scale + 2);
          const xml = mxUtils.getXml(root);

          // Requests image if request is valid
          if (w > 0 && h > 0) {
            const name = 'export.xml';
            const format = 'png';
            const bg = '&bg=#FFFFFF';
            const blob = new Blob([xml], {type: 'text/xml'});
            saveAs(blob, name);
          }
        };
      }

      /**
       * Function: isCellEditable
       *
       * Returns <isCellEditable>.
       */
      graph.isCellEditable = function (cell) {
        return false;
      };

      /**
       * Function: isCellSelectable
       *
       * Returns <cellSelectable>.
       */
      graph.isCellSelectable = function (cell) {
        if (!cell) {
          return false;
        }
        return !cell.edge;
      };

      // Changes fill color to red on mouseover
      graph.addMouseListener({
        currentState: null, previousStyle: null, currentHighlight: null, mouseDown: function (sender, me) {
          if (this.currentState != null) {
            this.dragLeave(me.getEvent(), this.currentState);
            this.currentState = null;
          }
        },
        mouseMove: function (sender, me) {
          if (me.consumed && me.getCell()) {
            self.isCellDragging = true;
          }
          if (this.currentState != null && me.getState() == this.currentState) {
            return;
          }
          let tmp = graph.view.getState(me.getCell());
          // Ignores everything but vertices
          if (graph.isMouseDown) {
            tmp = null;
          }
          if ($('#toolbar').find('img.mxToolbarModeSelected').not('img:first-child')[0]) {
            if (tmp != this.currentState) {
              if (this.currentState != null) {
                this.dragLeave(me.getEvent(), this.currentState);
              }
              this.currentState = tmp;
              if (this.currentState != null) {
                this.dragEnter(me.getEvent(), this.currentState, me.getCell());
              }
            }
          } else {
            return;
          }
        },
        mouseUp: function (sender, me) {
          if (self.isCellDragging) {
            self.isCellDragging = false;
            if (self.droppedCell && me.getCell()) {
              rearrangeCell(self.droppedCell);
              self.droppedCell = null;
            }
          }
        },
        dragEnter: function (evt, state, cell) {
          if (state != null) {
            this.previousStyle = state.style;
            state.style = mxUtils.clone(state.style);
            if (state.style && !dragStart && $('#toolbar').find('img.mxToolbarModeSelected').not('img:first-child')[0]) {
              result = checkValidTarget(cell, $('#toolbar').find('img.mxToolbarModeSelected').not('img:first-child').attr('title'));
              if (result === 'valid' || result === 'select') {
                this.currentHighlight = new mxCellHighlight(graph, 'green');
                this.currentHighlight.highlight(state);
              } else if (result === 'inValid') {
                this.currentHighlight = new mxCellHighlight(graph, '#ff0000');
                this.currentHighlight.highlight(state);
              }
            }
            if (state.shape) {
              state.shape.apply(state);
              state.shape.redraw();
            }
            if (state.text != null) {
              state.text.apply(state);
              state.text.redraw();
            }
          }
        },
        dragLeave: function (evt, state) {
          if (state != null) {
            state.style = this.previousStyle;
            if (state.style && this.currentHighlight != null) {
              this.currentHighlight.destroy();
              this.currentHighlight = null;
            }
            if (state.shape) {
              state.shape.apply(state);
              state.shape.redraw();
            }

            if (state.text != null) {
              state.text.apply(state);
              state.text.redraw();
            }
          }
        }
      });

      /**
       * Function: isCellMovable
       *
       * Returns true if the given cell is moveable.
       */
      graph.isCellMovable = function (cell) {
        if (cell.value) {
          return !cell.edge && cell.value.tagName !== 'Catch' && cell.value.tagName !== 'Process' && !checkClosingCell(cell);
        } else {
          return false;
        }
      };

      graph.moveCells = function (cells, dx, dy, clone, target, evt, mapping) {
        return cells;
      };

      /**
       * Function: handle a click event
       *
       */
      graph.click = function (me) {
        const evt = me.getEvent();
        let cell = me.getCell();
        let mxe = new mxEventObject(mxEvent.CLICK, 'event', evt, 'cell', cell);
        if (cell && !dragStart) {
          const dom = $('#toolbar');
          if (dom.find('img.mxToolbarModeSelected').not('img:first-child')[0]) {
            const sourceCell = dom.find('img.mxToolbarModeSelected').not('img:first-child');
            if (result === 'valid' || evt.pointerType === 'touch') {
              const _result = checkValidTarget(cell, sourceCell.attr('src'));
              if (_result !== 'select') {
                result = _result;
              }
            }
            createClickInstruction(sourceCell.attr('src'), cell);
            mxToolbar.prototype.resetMode(true);
          }
        } else {
          dragStart = false;
        }
        if (me.isConsumed()) {
          mxe.consume();
        }

        this.fireEvent(mxe);

        // Handles the event if it has not been consumed
        if (this.isEnabled() && !mxEvent.isConsumed(evt) && !mxe.isConsumed()) {
          if (cell != null) {
            if (this.isTransparentClickEvent(evt)) {
              let active = false;
              let tmp = this.getCellAt(me.graphX, me.graphY, null, null, null, mxUtils.bind(this, function (state) {
                const selected = this.isCellSelected(state.cell);
                active = active || selected;
                return !active || selected;
              }));

              if (tmp != null) {
                cell = tmp;
              }
            }
            this.selectCellForEvent(cell, evt);
          } else {
            let swimlane = null;
            if (this.isSwimlaneSelectionEnabled()) {
              // Gets the swimlane at the location (includes
              // content area of swimlanes)
              swimlane = this.getSwimlaneAt(me.getGraphX(), me.getGraphY());
            }
            // Selects the swimlane and consumes the event
            if (swimlane != null) {
              this.selectCellForEvent(swimlane, evt);
            }
            // Ignores the event if the control key is pressed
            else if (!this.isToggleEvent(evt)) {
              this.clearSelection();
            }
          }
        }

      };

      /**
       * Function: resetMode
       *
       * Selects the default mode and resets the state of the previously selected
       * mode.
       */
      mxToolbar.prototype.resetMode = function (forced) {
        if (forced) {
          this.defaultMode = $('#toolbar').find('img:first-child')[0];
          this.selectedMode = $('#toolbar').find('img.mxToolbarModeSelected').not('img:first-child')[0];
        }
        if ((forced || !this.noReset) && this.selectedMode != this.defaultMode) {
          this.selectMode(this.defaultMode, this.defaultFunction);
        }
      };

      /**
       * Overrides method to provide a cell collapse/expandable on double click
       */
      graph.dblClick = function (evt, cell) {
        if (cell != null && cell.vertex == 1) {
          if (cell.value.tagName === 'Fork' || cell.value.tagName === 'If' || cell.value.tagName === 'Try'
            || cell.value.tagName === 'Retry') {
            const flag = cell.collapsed != true;
            graph.foldCells(flag, false, [cell], null, evt);
          }
        }
      };

      /**
       * Overrides method to provide a cell label in the display
       * @param cell
       */
      graph.convertValueToString = function (cell) {
        return self.workflowService.convertValueToString(cell);
      };

      // Returns the type as the tooltip for column cells
      graph.getTooltipForCell = function (cell) {
        return self.workflowService.getTooltipForCell(cell);
      };

      /**
       * To check drop target is valid or not on hover
       *
       */
      mxDragSource.prototype.dragOver = function (_graph, evt) {
        dragStart = true;
        let offset = mxUtils.getOffset(_graph.container);
        let origin = mxUtils.getScrollOrigin(_graph.container);
        let x = mxEvent.getClientX(evt) - offset.x + origin.x - _graph.panDx;
        let y = mxEvent.getClientY(evt) - offset.y + origin.y - _graph.panDy;

        if (_graph.autoScroll && (this.autoscroll == null || this.autoscroll)) {
          _graph.scrollPointToVisible(x, y, _graph.autoExtend);
        }

        if ($('#toolbar').find('img.mxToolbarModeSelected').not('img:first-child')[0]) {
          mxToolbar.prototype.resetMode(true);
        }

        // Highlights the drop target under the mouse
        if (this.currentHighlight != null && _graph.isDropEnabled()) {
          this.currentDropTarget = this.getDropTarget(_graph, x, y, evt);
          let state = _graph.getView().getState(this.currentDropTarget);
          if (state && state.cell) {
            result = checkValidTarget(state.cell, this.dragElement.getAttribute('src'));
            this.currentHighlight.highlightColor = 'green';
            if (result === 'inValid') {
              this.currentHighlight.highlightColor = '#ff0000';
            }
            if (result === 'return') {
              return;
            }
          }
          this.currentHighlight.highlight(state);
        }

        // Updates the location of the preview
        if (this.previewElement != null) {
          if (this.previewElement.parentNode == null) {
            _graph.container.appendChild(this.previewElement);
            this.previewElement.style.zIndex = '3';
            this.previewElement.style.position = 'absolute';
          }

          let gridEnabled = this.isGridEnabled() && _graph.isGridEnabledEvent(evt);
          let hideGuide = true;

          // Grid and guides
          if (this.currentGuide != null && this.currentGuide.isEnabledForEvent(evt)) {
            // LATER: HTML preview appears smaller than SVG preview
            let w = parseInt(this.previewElement.style.width, 10);
            let h = parseInt(this.previewElement.style.height, 10);
            let bounds = new mxRectangle(0, 0, w, h);
            let delta = new mxPoint(x, y);
            delta = this.currentGuide.move(bounds, delta, gridEnabled);
            hideGuide = false;
            x = delta.x;
            y = delta.y;
          } else if (gridEnabled) {
            let scale = _graph.view.scale;
            let tr = _graph.view.translate;
            let off = _graph.gridSize / 2;
            x = (_graph.snap(x / scale - tr.x - off) + tr.x) * scale;
            y = (_graph.snap(y / scale - tr.y - off) + tr.y) * scale;
          }

          if (this.currentGuide != null && hideGuide) {
            this.currentGuide.hide();
          }

          if (this.previewOffset != null) {
            x += this.previewOffset.x;
            y += this.previewOffset.y;
          }

          this.previewElement.style.left = Math.round(x) + 'px';
          this.previewElement.style.top = Math.round(y) + 'px';
          this.previewElement.style.visibility = 'visible';
        }
        this.currentPoint = new mxPoint(x, y);
      };

      /**
       * Check the drop target on drop event
       * @param _graph
       * @param evt
       * @param drpTargt
       * @param x
       * @param y
       */
      mxDragSource.prototype.drop = function (_graph, evt, drpTargt, x, y) {
        dropTarget = null;
        movedTarget = null;
        selectedCellsObj = null;
        let flag = false;
        if (drpTargt) {
          let check = false;
          let title = '', msg = '';
          self.translate.get('workflow.message.invalidTarget').subscribe(translatedValue => {
            title = translatedValue;
          });
          if (this.dragElement && this.dragElement.getAttribute('src')) {
            if (this.dragElement.getAttribute('src').match('fork') || this.dragElement.getAttribute('src').match('retry') || this.dragElement.getAttribute('src').match('try') || this.dragElement.getAttribute('src').match('if')) {
              const selectedCell = graph.getSelectionCell();
              if (selectedCell) {
                const cells = graph.getSelectionCells();
                if (cells.length > 1) {
                  selectedCellsObj = isCellSelectedValid(cells);
                  if (selectedCellsObj.invalid) {
                    self.translate.get('workflow.message.invalidInstructionsSelected').subscribe(translatedValue => {
                      msg = translatedValue;
                    });
                    self.toasterService.pop('error', title + '!!', msg);
                    return;
                  }
                }
                if (selectedCell.id === drpTargt.id || (selectedCellsObj && selectedCellsObj.ids && selectedCellsObj.ids.length > 0 && selectedCellsObj.ids.indexOf(drpTargt.id) > -1)) {
                  check = true;
                }
              }
            }
          }
          if (!check) {
            if (drpTargt.value.tagName !== 'Connection') {
              if (drpTargt.value.tagName === 'Job' || drpTargt.value.tagName === 'Finish' || drpTargt.value.tagName === 'Fail' || drpTargt.value.tagName === 'Await' || drpTargt.value.tagName === 'Publish') {
                for (let i = 0; i < drpTargt.edges.length; i++) {
                  if (drpTargt.edges[i].target.id !== drpTargt.id) {
                    self.translate.get('workflow.message.validationError').subscribe(translatedValue => {
                      msg = translatedValue;
                    });
                    self.toasterService.pop('error', title + '!!', drpTargt.value.tagName + ' ' + msg);
                    return;
                  }
                }
              } else if (drpTargt.value.tagName === 'If') {
                if (drpTargt.edges.length > 2) {
                  self.translate.get('workflow.message.ifInstructionValidationError').subscribe(translatedValue => {
                    msg = translatedValue;
                  });
                  self.toasterService.pop('error', title + '!!', msg);
                  return;
                }
              } else if (checkClosingCell(drpTargt)) {
                if (drpTargt.edges.length > 1) {
                  for (let i = 0; i < drpTargt.edges.length; i++) {
                    if (drpTargt.edges[i].target.id !== drpTargt.id) {
                      self.translate.get('workflow.message.otherInstructionValidationError').subscribe(translatedValue => {
                        msg = translatedValue;
                      });
                      self.toasterService.pop('error', title + '!!', msg);
                      return;
                    }
                  }
                }
              } else if (drpTargt.value.tagName === 'Retry') {
                let flag1 = false;
                if (drpTargt.edges && drpTargt.edges.length) {
                  for (let i = 0; i < drpTargt.edges.length; i++) {
                    if (drpTargt.edges[i].source.value.tagName === 'Retry' && drpTargt.edges[i].target.value.tagName === 'EndRetry') {
                      flag1 = true;
                    }
                  }
                }
                if (!flag1) {
                  self.translate.get('workflow.message.otherInstructionValidationError').subscribe(translatedValue => {
                    msg = translatedValue;
                  });
                  self.toasterService.pop('error', title + '!!', msg);
                  return;
                }
              } else if (drpTargt.value.tagName === 'Try') {
                let flag1 = false;
                if (drpTargt.edges && drpTargt.edges.length) {
                  for (let i = 0; i < drpTargt.edges.length; i++) {
                    if (drpTargt.edges[i].source.value.tagName === 'Try' && drpTargt.edges[i].target && (drpTargt.edges[i].target.value.tagName === 'Catch' || drpTargt.edges[i].target.value.tagName === 'EndTry')) {
                      flag1 = true;
                    }
                  }
                }
                if (!flag1) {
                  self.translate.get('workflow.message.otherInstructionValidationError').subscribe(translatedValue => {
                    msg = translatedValue;
                  });
                  self.toasterService.pop('error', title + '!!', msg);
                  return;
                }
              } else if (drpTargt.value.tagName === 'Catch') {
                let flag1 = false;
                if (drpTargt.edges && drpTargt.edges.length) {
                  for (let i = 0; i < drpTargt.edges.length; i++) {
                    if (drpTargt.edges[i].source.value.tagName === 'Catch' && drpTargt.edges[i].target.value.tagName === 'EndTry') {
                      flag1 = true;
                    }
                  }
                }
                if (!flag1) {
                  self.translate.get('workflow.message.otherInstructionValidationError').subscribe(translatedValue => {
                    msg = translatedValue;
                  });
                  self.toasterService.pop('error', title + '!!', msg);
                  return;
                }
              } else if (drpTargt.value.tagName === 'Process') {
                if (drpTargt.getAttribute('start') || drpTargt.getAttribute('end')) {
                  return;
                }
                if (drpTargt.edges && drpTargt.edges.length === 1) {
                  if (drpTargt.edges[0].value.tagName === 'Connector') {
                    return;
                  }
                }
              } else if (drpTargt.value.tagName === 'Connector') {
                return;
              }
              dropTarget = drpTargt;
            } else {
              if (drpTargt.value.tagName === 'Connection') {
                if ((drpTargt.source.value.tagName === 'Fork' && drpTargt.target.value.tagName === 'Join') ||
                  (drpTargt.source.value.tagName === 'If' && drpTargt.target.value.tagName === 'EndIf') ||
                  (drpTargt.source.value.tagName === 'Retry' && drpTargt.target.value.tagName === 'EndRetry') ||
                  (drpTargt.source.value.tagName === 'Try' && drpTargt.target.value.tagName === 'Catch') ||
                  (drpTargt.source.value.tagName === 'Catch' && drpTargt.target.value.tagName === 'EndTry') ||
                  (drpTargt.source.value.tagName === 'Try' && drpTargt.target.value.tagName === 'EndTry')) {
                  return;
                }
              }
              flag = true;
            }
          } else {
            movedTarget = drpTargt;
          }

          if (drpTargt.value.tagName !== 'Connection') {
            createClickInstruction(this.dragElement.getAttribute('src'), drpTargt);
            return;
          }

        } else {
          return;
        }
        this.dropHandler(_graph, evt, drpTargt, x, y);
        if (_graph.container.style.visibility !== 'hidden') {
          _graph.container.focus();
        }
        if (flag) {
          isUndoable = true;
          WorkflowService.executeLayout(graph);
        }
      };

      /**
       * Function: removeCells
       *
       * Removes the given cells from the graph including all connected edges if
       * includeEdges is true. The change is carried out using <cellsRemoved>.
       * This method fires <mxEvent.REMOVE_CELLS> while the transaction is in
       * progress. The removed cells are returned as an array.
       *
       * Parameters:
       *
       * cells - Array of <mxCells> to remove. If null is specified then the
       * selection cells which are deletable are used.
       * flag - Optional boolean which specifies if all connected edges
       * should be removed as well. Default is true.
       */
      mxGraph.prototype.removeCells = function (cells, flag) {
        if (cells == null) {
          cells = this.getDeletableCells(this.getSelectionCells());
        }
        if (typeof flag != 'boolean') {
          if (cells && cells.length) {
            deleteInstructionFromJSON(cells);
          }
        } else {
          // in cells or descendant of cells
          cells = this.getDeletableCells(this.addAllEdges(cells));
          this.model.beginUpdate();
          try {
            this.cellsRemoved(cells);
            this.fireEvent(new mxEventObject(mxEvent.REMOVE_CELLS,
              'cells', cells, 'includeEdges', true));
          } finally {
            this.model.endUpdate();
          }
        }
        return cells;
      };


      /**
       * Function: foldCells to collapse/expand
       *
       * collapsed - Boolean indicating the collapsed state to be assigned.
       * recurse - Optional boolean indicating if the collapsed state of all
       * descendants should be set. Default is true.
       * cells - Array of <mxCells> whose collapsed state should be set. If
       * null is specified then the foldable selection cells are used.
       * checkFoldable - Optional boolean indicating of isCellFoldable should be
       * checked. Default is false.
       * evt - Optional native event that triggered the invocation.
       */
      mxGraph.prototype.foldCells = function (collapse, recurse, cells, checkFoldable, evt) {
        graph.clearSelection();
        recurse = (recurse != null) ? recurse : true;
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
        // graph.center(true, true);
        return cells;
      };

      /**
       * Function: undoableEditHappened
       *
       * Method to be called to add new undoable edits to the <history>.
       */
      mxUndoManager.prototype.undoableEditHappened = function (undoableEdit) {
        if (self.isWorkflowReload) {
          this.indexOfNextAdd = 0;
          this.history = [];
          self.isWorkflowReload = false;
        }

        if (isUndoable) {
          if (this.history.length === 10) {
            this.history.shift();
          }
          isUndoable = false;
          setTimeout(() => {
            const _enc = new mxCodec();
            const _nodeModel = _enc.encode(graph.getModel());
            const xml = mxUtils.getXml(_nodeModel);
            this.history.push(xml);
            this.indexOfNextAdd = this.history.length;
            if (this.indexOfNextAdd < this.history.length) {
              $('#redoBtn').removeClass('disable-link');
            }
            if (this.indexOfNextAdd > 0) {
              $('#undoBtn').removeClass('disable-link');
            }
          }, 100);
        }
      };

      /**
       * Function: undo
       *
       * Undoes the last change.
       */
      mxUndoManager.prototype.undo = function () {
        if (this.indexOfNextAdd > 0) {
          const xml = this.history[--this.indexOfNextAdd];
          self.xmlToJsonParser(xml);
          updateXMLFromJSON(true);
          if (this.indexOfNextAdd < this.history.length) {
            $('#redoBtn').removeClass('disable-link');
          }
        } else {
          $('#undoBtn').addClass('disable-link');
        }
      };

      /**
       * Function: redo
       *
       * Redoes the last change.
       */
      mxUndoManager.prototype.redo = function () {
        const n = this.history.length;
        if (this.indexOfNextAdd < n) {
          const xml = this.history[this.indexOfNextAdd++];
          self.xmlToJsonParser(xml);
          updateXMLFromJSON(true);
          if (this.indexOfNextAdd > 0) {
            $('#undoBtn').removeClass('disable-link');
          }
        } else {
          $('#redoBtn').addClass('disable-link');
        }
      };

      /**
       * Function: addVertex
       *
       * Adds the given vertex as a child of parent at the specified
       * x and y coordinate and fires an <addVertex> event.
       */
      mxEditor.prototype.addVertex = function (parent, vertex, x, y) {
        let model = this.graph.getModel();
        while (parent != null && !this.graph.isValidDropTarget(parent)) {
          parent = model.getParent(parent);
        }
        if (!parent && !isVertexDrop) {
          return null;
        } else {
          isVertexDrop = false;
        }
        parent = (parent != null) ? parent : this.graph.getSwimlaneAt(x, y);
        let scale = this.graph.getView().scale;

        let geo = model.getGeometry(vertex);
        let pgeo = model.getGeometry(parent);

        if (this.graph.isSwimlane(vertex) &&
          !this.graph.swimlaneNesting) {
          parent = null;
        } else if (parent == null && this.swimlaneRequired) {
          return null;
        } else if (parent != null && pgeo != null) {
          // Keeps vertex inside parent
          let state = this.graph.getView().getState(parent);

          if (state != null) {
            x -= state.origin.x * scale;
            y -= state.origin.y * scale;

            if (this.graph.isConstrainedMoving) {
              let width = geo.width;
              let height = geo.height;
              let tmp = state.x + state.width;
              if (x + width > tmp) {
                x -= x + width - tmp;
              }
              tmp = state.y + state.height;
              if (y + height > tmp) {
                y -= y + height - tmp;
              }
            }
          } else if (pgeo != null) {
            x -= pgeo.x * scale;
            y -= pgeo.y * scale;
          }
        }

        geo = geo.clone();
        geo.x = this.graph.snap(x / scale -
          this.graph.getView().translate.x -
          this.graph.gridSize / 2);
        geo.y = this.graph.snap(y / scale -
          this.graph.getView().translate.y -
          this.graph.gridSize / 2);
        vertex.setGeometry(geo);

        if (parent == null) {
          parent = this.graph.getDefaultParent();
        }

        this.cycleAttribute(vertex);
        this.fireEvent(new mxEventObject(mxEvent.BEFORE_ADD_VERTEX,
          'vertex', vertex, 'parent', parent));

        model.beginUpdate();
        try {
          vertex = this.graph.addCell(vertex, parent);

          if (vertex != null) {
            this.graph.constrainChild(vertex);

            this.fireEvent(new mxEventObject(mxEvent.ADD_VERTEX, 'vertex', vertex));
          }
        } finally {
          model.endUpdate();
        }
        if (vertex != null) {
          this.graph.setSelectionCell(vertex);
          this.graph.scrollCellToVisible(vertex);
          this.fireEvent(new mxEventObject(mxEvent.AFTER_ADD_VERTEX, 'vertex', vertex));
        }
        return vertex;
      };

      /**
       * Event to check if connector is valid or not on drop of new instruction
       * @param cell
       * @param cells
       * @param evt
       */
      graph.isValidDropTarget = function (cell, cells, evt) {
        if (cell && cell.value) {
          self.droppedCell = null;
          if (self.isCellDragging && cells && cells.length > 0) {
            const tagName = cell.value.tagName;
            if (tagName === 'Connection' || tagName === 'If' || tagName === 'Fork' || tagName === 'Retry' || tagName === 'Try' || tagName === 'Catch') {
              if (tagName === 'Connection') {
                let sourceId = cell.source.id;
                let targetId = cell.target.id;
                if (checkClosingCell(cell.source)) {
                  sourceId = cell.source.value.getAttribute('targetId');
                } else if (cell.source.value.tagName === 'Process' && cell.source.getAttribute('title') === 'start') {
                  sourceId = 'start';
                }
                if (checkClosingCell(cell.target)) {
                  targetId = cell.target.value.getAttribute('targetId');
                } else if (cell.target.value.tagName === 'Process' && cell.target.getAttribute('title') === 'start') {
                  targetId = 'start';
                }
                self.droppedCell = {target: {source: sourceId, target: targetId}, cell: cells[0], type: cell.value.getAttribute('type')};
                return mxGraph.prototype.isValidDropTarget.apply(this, arguments);
              } else {
                self.droppedCell = {target: cell.id, cell: cells[0]};
                return true;
              }
            } else {
              return false;
            }
          } else {
            isVertexDrop = true;
            if (cells && cells.length > 0) {
              if (cells[0] && cells[0].value && (cells[0].value.tagName === 'Fork' || cells[0].value.tagName === 'If' || cells[0].value.tagName === 'Retry'
                || cells[0].value.tagName === 'Try')) {
                cells[0].collapsed = true;
              }
            }
            if (cell.value && cell.value.tagName === 'Connection') {
              graph.clearSelection();
              if (cells && cells.length > 0) {
                if (cell.source) {
                  if (cell.source.getParent() && cell.source.getParent().id !== '1') {
                    const _type = cell.getAttribute('type');
                    if (!(_type === 'retry' || _type === 'then' || _type === 'else' || _type === 'branch' || _type === 'try' || _type === 'catch')) {
                      cell.setParent(cell.source.getParent());
                    }
                  }
                }
                if (cells[0].value.tagName === 'Fork' || cells[0].value.tagName === 'If' || cells[0].value.tagName === 'Retry' || cells[0].value.tagName === 'Try') {
                  const parent = cell.getParent() || graph.getDefaultParent();
                  let v1, v2, label = '';
                  const attr = cell.value.attributes;
                  if (attr) {
                    for (let i = 0; i < attr.length; i++) {
                      if (attr[i].value && attr[i].name) {
                        label = attr[i].value;
                        break;
                      }
                    }
                  }
                  if (cells[0].value.tagName === 'Fork') {
                    v1 = graph.insertVertex(parent, null, getCellNode('Join', 'join', null), 0, 0, 68, 68, self.workflowService.merge);
                  } else if (cells[0].value.tagName === 'If') {
                    v1 = graph.insertVertex(parent, null, getCellNode('EndIf', 'ifEnd', null), 0, 0, 75, 75, 'if');
                  } else if (cells[0].value.tagName === 'Retry') {
                    v1 = graph.insertVertex(parent, null, getCellNode('EndRetry', 'retryEnd', null), 0, 0, 75, 75, 'retry');
                  } else {
                    v1 = graph.insertVertex(parent, null, getCellNode('EndTry', 'tryEnd', null), 0, 0, 75, 75, 'try');
                    v2 = graph.insertVertex(cells[0], null, getCellNode('Catch', 'catch', null), 0, 0, 100, 40, 'dashRectangle');
                    graph.insertEdge(parent, null, getConnectionNode('try'), cells[0], v2);
                    graph.insertEdge(parent, null, getConnectionNode('endTry'), v2, v1);
                  }
                  graph.insertEdge(parent, null, getConnectionNode(label), cell.source, cells[0]);
                  if (cells[0].value.tagName !== 'Try') {
                    graph.insertEdge(parent, null, getConnectionNode(''), cells[0], v1);
                  }
                  graph.insertEdge(parent, null, getConnectionNode(''), v1, cell.target);
                  for (let x = 0; x < cell.source.edges.length; x++) {
                    if (cell.source.edges[x].id === cell.id) {
                      const _sourCellName = cell.source.value.tagName;
                      const _tarCellName = cell.target.value.tagName;
                      if ((cell.target && ((_sourCellName === 'Job' || _sourCellName === 'Finish' || _sourCellName === 'Fail' || _sourCellName === 'Publish' || _sourCellName === 'Await') &&
                        (_tarCellName === 'Job' || _tarCellName === 'Finish' || _tarCellName === 'Fail' || _tarCellName === 'Publish' || _tarCellName === 'Await')))) {
                        graph.getModel().remove(cell.source.edges[x]);
                      } else {
                        cell.source.removeEdge(cell.source.edges[x], true);
                      }
                      break;
                    }
                  }

                  setTimeout(() => {
                    graph.getModel().beginUpdate();
                    try {
                      if (cells[0].id && v1.id) {
                        self.nodeMap.set(cells[0].id, v1.id);
                      }
                      const targetId = new mxCellAttributeChange(
                        v1, 'targetId',
                        cells[0].id);
                      graph.getModel().execute(targetId);
                      if (v2) {
                        const targetId2 = new mxCellAttributeChange(
                          v2, 'targetId', cells[0].id);
                        graph.getModel().execute(targetId2);
                      }
                    } finally {
                      graph.getModel().endUpdate();
                    }
                    checkConnectionLabel(cells[0], cell, false);
                  }, 0);
                  return false;
                }
              }
              if (checkClosedCellWithSourceCell(cell.source, cell.target)) {
                graph.removeCells(cells, true);
                evt.preventDefault();
                evt.stopPropagation();
                return false;
              }
              graph.setSelectionCells(cells);
              setTimeout(() => {
                checkConnectionLabel(cells[0], cell, true);
                isVertexDrop = false;
              }, 0);
            } else {
              if (cell.value && cell.value.tagName === 'Connector') {
                graph.removeCells(cells, true);
                evt.preventDefault();
                evt.stopPropagation();
                return false;
              }
            }
          }

          if (this.isCellCollapsed(cell)) {
            return true;
          }
          return mxGraph.prototype.isValidDropTarget.apply(this, arguments);
        }
      };


      /**
       * Implements a properties panel that uses
       * mxCellAttributeChange to change properties
       */
      graph.getSelectionModel().addListener(mxEvent.CHANGE, function () {
        let cell = graph.getSelectionCell();
        let cells = graph.getSelectionCells();

        if (cells.length > 0) {
          let lastCell = cells[cells.length - 1];
          let targetId = self.nodeMap.get(lastCell.id);
          if (targetId) {
            graph.addSelectionCell(graph.getModel().getCell(targetId));
          } else if (lastCell) {
            let flag = false;
            if (cells.length > 1) {
              const secondLastCell = cells[cells.length - 2];
              const lName = secondLastCell.value.tagName;
              if (lName === 'If' || lName === 'Fork' || lName === 'Retry' || lName === 'Try' || lName === 'Catch') {
                flag = true;
              }
            }
            if (!flag && (checkClosingCell(lastCell))) {
              graph.removeSelectionCell(lastCell);
            }
          }
        }

        if (cell && (checkClosingCell(cell) ||
          cell.value.tagName === 'Connection' || cell.value.tagName === 'Process' || cell.value.tagName === 'Catch')) {
          graph.clearSelection();
          return;
        }

        if (cell && cells.length === 1) {
          setTimeout(() => {
            if (cell.value.tagName === 'If' || cell.value.tagName === 'Fork' || cell.value.tagName === 'Retry' || cell.value.tagName === 'Try') {
              const targetId = self.nodeMap.get(cell.id);
              if (targetId) {
                graph.addSelectionCell(graph.getModel().getCell(targetId));
              }

            }
          }, 0);
        }

        if(cells.length < 2) {
          selectionChanged();
        }
      });

      initGraph(this.dummyXml);
      WorkflowService.makeCenter(graph);
      isUndoable = true;
      WorkflowService.executeLayout(graph);

      const mgr = new mxAutoSaveManager(graph);
      mgr.save = function () {
        if (!self.isWorkflowReload) {
          setTimeout(() => {
            self.xmlToJsonParser(null);
            if (self.workFlowJson && self.workFlowJson.instructions && self.workFlowJson.instructions.length > 0) {
              graph.setEnabled(true);
            } else {
              reloadDummyXml(self.dummyXml);
            }
          }, 200);
        }
      };
    } else {
      self.isWorkflowReload = true;
      reloadDummyXml(_xml);
    }

    /**
     * Function: Remove selected cells from JSON
     * @param cells
     */
    function deleteInstructionFromJSON(cells) {
      iterateJson(self.workFlowJson, cells[0], '');
      setTimeout(() => {
        updateXMLFromJSON(false);
      }, 1);
    }

    function iterateJson(json, cell, type) {
      if (json.instructions) {
        for (let x = 0; x < json.instructions.length; x++) {
          if (json.instructions[x].id == cell.id) {
            json.instructions.splice(x, 1);
            if (json.instructions.length === 0 && type !== 'catch') {
              delete json['instructions'];
              delete json['id'];
            }
            break;
          }

          if (json.instructions[x].instructions) {
            iterateJson(json.instructions[x], cell, '');
          }
          if (json.instructions[x].catch) {
            if (json.instructions[x].catch.id == cell.id) {
              delete json.instructions[x]['catch'];
              break;
            }
            if (json.instructions[x].catch.instructions && json.instructions[x].catch.instructions.length > 0) {
              iterateJson(json.instructions[x].catch, cell, 'catch');
            }
          }
          if (json.instructions[x].then) {
            iterateJson(json.instructions[x].then, cell, '');
          }
          if (json.instructions[x].else) {
            iterateJson(json.instructions[x].else, cell, '');
          }
          if (json.instructions[x].branches) {
            for (let i = 0; i < json.instructions[x].branches.length; i++) {
              iterateJson(json.instructions[x].branches[i], cell, '');
              if (!json.instructions[x].branches[i].instructions) {
                json.instructions[x].branches.splice(i, 1);
                if (json.instructions[x].branches.length === 0) {
                  delete json.instructions[x]['branches'];
                  break;
                }
              }
            }
          }
          if (json.instructions[x].events) {
            for (let i = 0; i < json.instructions[x].events.length; i++) {
              if (json.instructions[x].events[i].id == cell.id) {
                json.instructions[x].events.splice(i, 1);
                break;
              }
            }
          }
        }
      }
    }

    /**
     * Function: Get first and last cell from the user selected cells
     * @param cells
     */
    function isCellSelectedValid(cells) {
      let obj = {firstCell: null, lastCell: null, ids: [], invalid: false};
      if (cells.length === 2) {
        if (!checkClosedCellWithSourceCell(cells[0], cells[1])) {
          let x = graph.getEdgesBetween(cells[0], cells[1]);
          if (x.length === 0) {
            obj.invalid = true;
            return obj;
          }
        }
      }
      for (let i = 0; i < cells.length; i++) {
        obj.invalid = !isSelectedCellConnected(cells, cells[i]);
        obj.ids.push(cells[i].id);
        if (!isParentAlsoSelected(cells, cells[i])) {
          if (!obj.firstCell) {
            obj.firstCell = cells[i];
          }
          if (!obj.lastCell) {
            obj.lastCell = cells[i];
          }
          if (obj.firstCell && obj.firstCell.geometry.y > cells[i].geometry.y) {
            obj.firstCell = cells[i];
          }
        }
        if (!obj.lastCell || (obj.lastCell.geometry.y < cells[i].geometry.y)) {
          obj.lastCell = cells[i];
        }
      }
      return obj;
    }

    /**
     * Function : To check is parent instruction also selected or not
     * @param cells
     * @param cell
     */
    function isParentAlsoSelected(cells, cell) {
      let flag = false;
      for (let i = 0; i < cells.length; i++) {
        if (cells[i].id === cell.getParent().id) {
          flag = true;
          break;
        }
      }

      return flag;
    }

    /**
     * Function: To check is selected instructions are interconnected or not
     * @param cells
     * @param cell
     */
    function isSelectedCellConnected(cells, cell) {
      let flag = false;
      for (let i = 0; i < cells.length; i++) {
        if (graph.getEdgesBetween(cells[i], cell).length > 0) {
          flag = true;
          break;
        } else {
          if (checkClosingCell(cell)) {
            flag = true;
            break;
          }
        }
      }
      return flag;
    }

    /**
     * Function: To check source is closed with its own closing cell or not
     * @param sour
     * @param targ
     */
    function checkClosedCellWithSourceCell(sour, targ) {
      const sourName = sour.value.tagName;
      const tarName = targ.value.tagName;
      return (sourName === 'Fork' && tarName === 'Join') || (sourName === 'If' && tarName === 'EndIf') ||
        ((sourName === 'Try' && tarName === 'EndTry') || (sourName === 'Try' && tarName === 'Catch') ||
          (sourName === 'Catch' && tarName === 'EndTry')) || (sourName === 'Retry' && tarName === 'EndRetry');
    }

    /**
     * Function: Check closing cell
     * @param cell
     */
    function checkClosingCell(cell) {
      return cell.value.tagName === 'Join' || cell.value.tagName === 'EndIf' ||
        cell.value.tagName === 'EndTry' || cell.value.tagName === 'EndRetry';
    }

    /**
     * Function: Move selected cell into dropped cell
     * @param cell
     * @param parentCell
     * @param cells
     */
    function moveSelectedCellToDroppedCell(cell, parentCell, cells) {
      const cellName = parentCell.value.tagName;
      let parent;
      if (cell) {
        parent = cell.getParent();
      } else {
        parent = cells.firstCell.getParent();
      }
      let v2, v3, _sour, _tar, _middle;
      if (cellName === 'Fork') {
        v2 = graph.insertVertex(parent, null, getCellNode('Join', 'join', parentCell.id), 0, 0, 68, 68, self.workflowService.merge);
        if (cell) {
          if (cell.edges) {
            for (let i = 0; i < cell.edges.length; i++) {
              if (cell.edges[i].target.id === cell.id) {
                _sour = cell.edges[i];
              }
              if (cell.edges[i].source.id === cell.id) {
                _tar = cell.edges[i];
              }
            }
            if (cell.value.tagName === 'Fork' || cell.value.tagName === 'If' || cell.value.tagName === 'Try' || cell.value.tagName === 'Retry') {
              _tar = getEndNode(cell);
              _middle = _tar.source;
            } else {
              _middle = cell;
            }
          }
        } else {
          cell = cells.firstCell;
          for (let i = 0; i < cell.edges.length; i++) {
            if (cell.edges[i].target.id === cell.id) {
              _sour = cell.edges[i];
              break;
            }
          }
          const lastCellName = cells.lastCell.value.tagName;
          if (lastCellName === 'Fork' || lastCellName === 'If' || lastCellName === 'Try' || lastCellName === 'Retry') {
            _tar = getEndNode(cells.lastCell);
            _middle = _tar.source;
          } else {
            for (let i = 0; i < cells.lastCell.edges.length; i++) {
              if (cells.lastCell.edges[i].source.id === cells.lastCell.id) {
                _tar = cells.lastCell.edges[i];
                break;
              }
            }
            _middle = cells.lastCell;
          }
        }

        connectExtraNodes(parentCell, v2, parent, _sour, _tar);
        graph.insertEdge(parent, null, getConnectionNode('branch'), parentCell, cell);
        graph.insertEdge(parent, null, getConnectionNode('join'), _middle, v2);


      } else if (cellName === 'If') {
        v2 = graph.insertVertex(parent, null, getCellNode('EndIf', 'ifEnd', parentCell.id), 0, 0, 75, 75, 'if');
        if (cell) {
          if (cell.edges) {
            for (let i = 0; i < cell.edges.length; i++) {
              if (cell.edges[i].target.id === cell.id) {
                _sour = cell.edges[i];
              }
              if (cell.edges[i].source.id === cell.id) {
                _tar = cell.edges[i];
              }
            }
            if (cell.value.tagName === 'Fork' || cell.value.tagName === 'If' || cell.value.tagName === 'Try' || cell.value.tagName === 'Retry') {
              _tar = getEndNode(cell);
              _middle = _tar.source;
            } else {
              _middle = cell;
            }

          }
        } else {
          cell = cells.firstCell;
          for (let i = 0; i < cell.edges.length; i++) {
            if (cell.edges[i].target.id === cell.id) {
              _sour = cell.edges[i];
              break;
            }
          }
          const lastCellName = cells.lastCell.value.tagName;
          if (lastCellName === 'Fork' || lastCellName === 'If' || lastCellName === 'Try' || lastCellName === 'Retry') {
            _tar = getEndNode(cells.lastCell);
            _middle = _tar.source;
          } else {
            for (let i = 0; i < cells.lastCell.edges.length; i++) {
              if (cells.lastCell.edges[i].source.id === cells.lastCell.id) {
                _tar = cells.lastCell.edges[i];

                break;
              }
            }
            _middle = cells.lastCell;
          }
        }
        connectExtraNodes(parentCell, v2, parent, _sour, _tar);
        graph.insertEdge(parent, null, getConnectionNode('then'), parentCell, cell);
        graph.insertEdge(parent, null, getConnectionNode('endIf'), _middle, v2);
      } else if (cellName === 'Try') {
        v2 = graph.insertVertex(parent, null, getCellNode('EndTry', 'tryEnd', parentCell.id), 0, 0, 75, 75, 'try');
        v3 = graph.insertVertex(parent, null, getCellNode('Catch', 'catch', parentCell.id), 0, 0, 100, 40, 'dashRectangle');
        if (cell) {
          if (cell.edges) {
            for (let i = 0; i < cell.edges.length; i++) {
              if (cell.edges[i].target.id === cell.id) {
                _sour = cell.edges[i];
              }
              if (cell.edges[i].source.id === cell.id) {
                _tar = cell.edges[i];
              }
            }
            if (cell.value.tagName === 'Fork' || cell.value.tagName === 'If' || cell.value.tagName === 'Try' || cell.value.tagName === 'Retry') {
              _tar = getEndNode(cell);
              _middle = _tar.source;
            } else {
              _middle = cell;
            }

          }
        } else {
          cell = cells.firstCell;
          for (let i = 0; i < cell.edges.length; i++) {
            if (cell.edges[i].target.id === cell.id) {
              _sour = cell.edges[i];
              break;
            }
          }
          const lastCellName = cells.lastCell.value.tagName;
          if (lastCellName === 'Fork' || lastCellName === 'If' || lastCellName === 'Try' || lastCellName === 'Retry') {
            _tar = getEndNode(cells.lastCell);
            _middle = _tar.source;
          } else {
            for (let i = 0; i < cells.lastCell.edges.length; i++) {
              if (cells.lastCell.edges[i].source.id === cells.lastCell.id) {
                _tar = cells.lastCell.edges[i];

                break;
              }
            }
            _middle = cells.lastCell;
          }
        }
        connectExtraNodes(parentCell, v2, parent, _sour, _tar);
        graph.insertEdge(parent, null, getConnectionNode('try'), parentCell, cell);
        graph.insertEdge(parent, null, getConnectionNode('try'), _middle, v3);
        graph.insertEdge(parent, null, getConnectionNode('endTry'), v3, v2);
      } else if (cellName === 'Retry') {
        v2 = graph.insertVertex(parent, null, getCellNode('EndRetry', 'retryEnd', parentCell.id), 0, 0, 75, 75, 'retry');
        if (cell) {
          if (cell.edges) {
            for (let i = 0; i < cell.edges.length; i++) {
              if (cell.edges[i].target.id === cell.id) {
                _sour = cell.edges[i];
              }
              if (cell.edges[i].source.id === cell.id) {
                _tar = cell.edges[i];
              }
            }
            if (cell.value.tagName === 'Fork' || cell.value.tagName === 'If' || cell.value.tagName === 'Try' || cell.value.tagName === 'Retry') {
              _tar = getEndNode(cell);
              _middle = _tar.source;
            } else {
              _middle = cell;
            }

          }
        } else {
          cell = cells.firstCell;
          for (let i = 0; i < cell.edges.length; i++) {
            if (cell.edges[i].target.id === cell.id) {
              _sour = cell.edges[i];
              break;
            }
          }
          const lastCellName = cells.lastCell.value.tagName;
          if (lastCellName === 'Fork' || lastCellName === 'If' || lastCellName === 'Try' || lastCellName === 'Retry') {
            _tar = getEndNode(cells.lastCell);
            _middle = _tar.source;
          } else {
            for (let i = 0; i < cells.lastCell.edges.length; i++) {
              if (cells.lastCell.edges[i].source.id === cells.lastCell.id) {
                _tar = cells.lastCell.edges[i];

                break;
              }
            }
            _middle = cells.lastCell;
          }
        }
        connectExtraNodes(parentCell, v2, parent, _sour, _tar);
        graph.insertEdge(parent, null, getConnectionNode('retry'), parentCell, cell);
        graph.insertEdge(parent, null, getConnectionNode('endRetry'), _middle, v2);
      }
      if (_sour && _tar) {
        graph.getModel().remove(_sour);
        graph.getModel().remove(_tar);
      }
      self.xmlToJsonParser(null);
      updateXMLFromJSON(false);
    }

    function updateXMLFromJSON(flag) {
      if (!_.isEmpty(self.workFlowJson)) {
        let mxJson = self.jsonParser(self.workFlowJson);
        let xml = x2js.json2xml_str(mxJson);

        graph.getModel().beginUpdate();
        try {
          // Removes all cells
          graph.removeCells(graph.getChildCells(graph.getDefaultParent()), true);
          const _doc = mxUtils.parseXml(xml);
          const dec = new mxCodec(_doc);
          const model = dec.decode(_doc.documentElement);
          // Merges the response model with the client model
          graph.getModel().mergeChildren(model.getRoot().getChildAt(0), graph.getDefaultParent(), false);
        } finally {
          // Updates the display
          graph.getModel().endUpdate();
          if (!flag) {
            isUndoable = true;
          }
          WorkflowService.executeLayout(graph);
        }
      } else {
        reloadDummyXml(self.dummyXml);
      }
    }

    /**
     * Function to connect new node with existing connections
     * @param v1
     * @param v2
     * @param parent
     * @param _sour
     * @param _tar
     */
    function connectExtraNodes(v1, v2, parent, _sour, _tar) {
      let l1 = '', l2 = '';
      if (_sour && _sour.value) {
        let attrs = _.clone(_sour.value.attributes);
        if (attrs) {
          for (let i = 0; i < attrs.length; i++) {
            if (attrs[i].nodeName === 'type') {
              l1 = attrs[i].nodeValue;
            }
          }
        }
      }

      if (_tar && _tar.value) {
        let attrs2 = _.clone(_tar.value.attributes);
        if (attrs2) {
          for (let i = 0; i < attrs2.length; i++) {
            if (attrs2[i].nodeName === 'type') {
              l2 = attrs2[i].nodeValue;
            }
          }
        }
      }
      if (_sour && _tar) {
        graph.insertEdge(parent, null, getConnectionNode(l1), _sour.source, v1);
        graph.insertEdge(parent, null, getConnectionNode(l2), v2, _tar.target);
      }
    }

    /**
     * Get end node of If/Fork/Try/Retry
     * @param cell
     */
    function getEndNode(cell) {
      let targetNode = {};

      function recursive(target) {
        const edges = target.edges;
        if (checkClosedCellWithSourceCell(cell, target)) {

          const attrs = target.value.attributes;
          if (attrs) {
            for (let i = 0; i < attrs.length; i++) {
              if (attrs[i].nodeName === 'targetId' && attrs[i].nodeValue === cell.id) {
                for (let x = 0; x < edges.length; x++) {
                  if (edges[x].target.id !== target.id) {
                    targetNode = edges[x];
                    break;
                  }
                }
                break;
              }
            }
          }
        }
        if (edges && edges.length > 0) {
          for (let j = 0; j < edges.length; j++) {
            if (edges[j].target) {
              if (edges[j].target.id !== target.id) {
                if (checkClosedCellWithSourceCell(cell, edges[j].target)) {
                  const attrs = edges[j].target.value.attributes;
                  if (attrs) {
                    for (let i = 0; i < attrs.length; i++) {
                      if (attrs[i].nodeName === 'targetId' && (attrs[i].nodeValue === cell.id || attrs[i].nodeValue === target.id)) {
                        const _edges = edges[j].target.edges;
                        for (let x = 0; x < _edges.length; x++) {
                          if (_edges[x].target.id !== edges[j].target.id) {
                            targetNode = _edges[x];
                            break;
                          }
                        }
                        break;
                      }
                    }
                  }
                } else {
                  if (edges[j].target) {
                    if (_iterateId !== edges[j].target.id) {
                      _iterateId = edges[j].target.id;
                      recursive(edges[j].target);
                    }
                  }
                }
              }
            }
          }
          if (!targetNode) {
            for (let i = 0; i < edges.length; i++) {
              if (edges[i] && edges[i].target) {
                if (_iterateId !== edges[i].target.id) {
                  _iterateId = edges[i].target.id;
                  recursive((edges[i].target));
                }
                break;
              }
            }
          }
        }
      }

      recursive(cell);
      return targetNode;
    }

    /**
     * Reload dummy xml
     */
    function reloadDummyXml(xml) {
      graph.getModel().beginUpdate();
      try {
        // Removes all cells
        graph.removeCells(graph.getChildCells(graph.getDefaultParent()), true);
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

    function initGraph(xml) {
      const _doc = mxUtils.parseXml(xml);
      const codec = new mxCodec(_doc);
      codec.decode(_doc.documentElement, graph.getModel());
      const vertices = graph.getChildVertices(graph.getDefaultParent());
      if (vertices.length > 3) {
        graph.setEnabled(true);
      }
    }

    /**
     * Create new connection object
     * @param label
     */
    function getConnectionNode(label: string): Object {
      // Create new Connection object
      const connNode = doc.createElement('Connection');
      let str = label, type = label;
      if (label.substring(0, 6) === '$TYPE$') {
        type = 'branch';
        str = label.substring(6);
      }
      connNode.setAttribute('label', str);
      connNode.setAttribute('type', type);
      return connNode;
    }

    /**
     * Create new Node object
     * @param name
     * @param label
     * @param id
     */
    function getCellNode(name: string, label: string, id: any): Object {
      // Create new node object
      const _node = doc.createElement(name);
      _node.setAttribute('label', label);
      if (id) {
        _node.setAttribute('targetId', id);
      }
      return _node;
    }

    /**
     * change label of EndIf and Join
     */
    function changeLabelOfConnection(cell, data) {
      graph.getModel().beginUpdate();
      try {
        const label = new mxCellAttributeChange(
          cell, 'label',
          data);
        const type = new mxCellAttributeChange(
          cell, 'type',
          data);
        graph.getModel().execute(label);
        graph.getModel().execute(type);
      } finally {
        graph.getModel().endUpdate();
      }
    }

    function checkConnectionLabel(cell, _dropTarget, isChange) {
      if (!isChange) {
        const label = _dropTarget.getAttribute('type') || _dropTarget.getAttribute('label');
        if (label && (label === 'join' || label === 'branch' || label === 'endIf'
          || label === 'endRetry' || label === 'endTry')) {
          let _label1, _label2;
          if (label === 'join') {
            _label1 = 'join';
            _label2 = 'branch';
          } else if (label === 'branch') {
            _label1 = 'branch';
            _label2 = 'branch';
          } else if (label === 'endIf') {
            _label1 = 'endIf';
            _label2 = 'endIf';
          } else if (label === 'endRetry') {
            _label1 = 'endRetry';
            _label2 = 'endRetry';
          } else if (label === 'try') {
            _label1 = 'try';
            _label2 = 'try';
          } else if (label === 'endTry') {
            _label1 = 'endTry';
            _label2 = 'endTry';
          }
          for (let i = 0; i < cell.edges.length; i++) {
            if (cell.edges[i].target !== cell.id) {
              if (checkClosingCell(cell.edges[i].target)) {
                if (cell.edges[i].target.edges) {
                  for (let j = 0; j < cell.edges[i].target.edges.length; j++) {
                    if (cell.edges[i].target.edges[j] && cell.edges[i].target.edges[j].target.id !== cell.edges[i].target.id) {
                      changeLabelOfConnection(cell.edges[i].target.edges[j], _label1);
                      break;
                    }
                  }
                }
              } else if (cell.edges[i].target.value.tagName === 'Fork' || cell.edges[i].target.value.tagName === 'If' || cell.edges[i].target.value.tagName === 'Retry'
                || cell.edges[i].target.value.tagName === 'Try') {
                changeLabelOfConnection(cell.edges[i], _label2);
              } else if (cell.edges[i].target.value.tagName === 'Catch') {
                changeLabelOfConnection(cell.edges[i], 'try');
              }
            }
          }
        }
      } else {
        if (cell.edges) {
          let _tempCell: any;
          for (let i = 0; i < cell.edges.length; i++) {
            if (_tempCell) {
              if (cell.edges[i].target !== cell.id) {
                if (cell.edges[i].target.value.tagName === 'Join') {
                  changeLabelOfConnection(_tempCell, 'branch');
                  changeLabelOfConnection(cell.edges[i], 'join');
                } else if (cell.edges[i].target.value.tagName === 'EndIf') {
                  changeLabelOfConnection(cell.edges[i], 'endIf');
                } else if (cell.edges[i].target.value.tagName === 'EndRetry') {
                  changeLabelOfConnection(cell.edges[i], 'endRetry');
                } else if (cell.edges[i].target.value.tagName === 'EndTry') {
                  changeLabelOfConnection(cell.edges[i], 'endTry');
                }
              }
            }
            if (cell.edges[i].source !== cell.id) {
              if (checkClosingCell(cell.edges[i].source)) {
                _tempCell = cell.edges[i];
              }
            }

            if (_dropTarget.getAttribute('type')) {
              const typeAttr = _dropTarget.getAttribute('type');
              if (((typeAttr === 'join') && cell.edges[i].id !== _dropTarget.id)) {
                changeLabelOfConnection(cell.edges[i], 'branch');
              } else if (((typeAttr === 'endIf') && cell.edges[i].id !== _dropTarget.id)) {
                changeLabelOfConnection(cell.edges[i], '');
              } else if (((typeAttr === 'endRetry') && cell.edges[i].id !== _dropTarget.id)) {
                changeLabelOfConnection(cell.edges[i], '');
              } else if (((typeAttr === 'endTry') && cell.edges[i].id !== _dropTarget.id)) {
                changeLabelOfConnection(cell.edges[i], '');
              }
            }
            if (cell.id !== cell.edges[i].target.id) {
              const attrs = cell.edges[i].value.attributes;
              if (attrs) {
                if (attrs[0].value && (attrs[0].value === 'then' || attrs[0].value === 'else')) {
                  graph.getModel().beginUpdate();
                  try {
                    const label = new mxCellAttributeChange(
                      cell.edges[i], 'label',
                      '');
                    const type = new mxCellAttributeChange(
                      cell.edges[i], 'type',
                      '');
                    graph.getModel().execute(label);
                    graph.getModel().execute(type);
                  } finally {
                    graph.getModel().endUpdate();
                  }
                }
              }
            } else if (cell.id !== cell.edges[i].source.id) {
              const attrs = cell.edges[i].value.attributes;
              if (attrs && attrs.length > 0) {
                if (attrs[0].value === 'If') {
                  if (cell.edges[i].target.value.tagName !== 'If' && cell.edges[i].source.value.tagName !== 'If' && cell.value.tagName !== 'If') {
                    graph.getModel().beginUpdate();
                    try {
                      const label = new mxCellAttributeChange(
                        cell.edges[i], 'label',
                        '');
                      const type = new mxCellAttributeChange(
                        cell.edges[i], 'type',
                        '');
                      graph.getModel().execute(label);
                      graph.getModel().execute(type);
                    } finally {
                      graph.getModel().endUpdate();
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    /**
     * Updates the properties panel
     */
    function selectionChanged() {
      if (self.selectedNode) {
        self.selectedNode.newObj = JSON.parse(JSON.stringify(self.selectedNode.obj));
        if (self.selectedNode && self.selectedNode.type === 'Job') {
          if (self.selectedNode.newObj.defaultArguments.length > 0 && self.coreService.isLastEntryEmpty(self.selectedNode.newObj.defaultArguments, 'name', '')) {
            self.selectedNode.newObj.defaultArguments.splice(self.selectedNode.newObj.defaultArguments.length - 1, 1);
          }
          if (self.selectedNode.newObj.defaultArguments.length > 0) {
            self.selectedNode.newObj.defaultArguments = _.object(_.map(self.selectedNode.newObj.defaultArguments, _.values));
          } else {
            self.selectedNode.newObj.defaultArguments = {};
          }
        }

        if (_.isEqual(self.selectedNode.newObj, self.selectedNode.actualValue)) {
          if (self.selectedNode.job) {
            self.updateJobProperties(self.selectedNode);
          }
        } else {
          self.updateProperties(self.selectedNode);
        }
      }

      // Gets the selection cell
      const cell = graph.getSelectionCell();
      if (cell == null) {
        self.selectedNode = null;
      } else {
        if (cell.value.tagName === 'Try' || cell.value.tagName === 'Catch') {
          self.selectedNode = null;
          return;
        }

        let obj: any = {}, job: any;
        if (cell.value.tagName === 'Job') {
          obj.jobName = cell.getAttribute('jobName');
          obj.label = cell.getAttribute('label');
          obj.defaultArguments = cell.getAttribute('defaultArguments');
          if (!obj.defaultArguments || _.isEmpty(obj.defaultArguments) || typeof obj.defaultArguments !== 'string') {
            obj.defaultArguments = {};
          } else {
            obj.defaultArguments = JSON.parse(obj.defaultArguments);
          }
          job = {
            jobName: obj.jobName
          };
        } else if (cell.value.tagName === 'If') {
          obj.predicate = cell.getAttribute('predicate');
        } else if (cell.value.tagName === 'Retry') {
          obj.maxTries = cell.getAttribute('maxTries');
          obj.retryDelays = cell.getAttribute('retryDelays');
        } else if (cell.value.tagName === 'Finish') {
          obj.message = cell.getAttribute('message');
        } else if (cell.value.tagName === 'Fail') {
          obj.message = cell.getAttribute('message');
          obj.returnCode = cell.getAttribute('returnCode');
          if (obj.returnCode && typeof obj.returnCode == 'string') {
            obj.returnCode = parseInt(obj.returnCode, 10);
          }
        } else if (cell.value.tagName === 'FileWatcher') {
          obj.directory = cell.getAttribute('directory');
          obj.regex = cell.getAttribute('regex');
        } else if (cell.value.tagName === 'Await') {
          obj.junctionPath = cell.getAttribute('junctionPath');
          let timeout = cell.getAttribute('timeout');
          if (timeout && timeout != 'null' && timeout != 'undefined') {
            obj.timeout1 = self.workflowService.convertDurationToString(timeout);
          }
          obj.joinVariables = cell.getAttribute('joinVariables');
          obj.joinVariables = obj.joinVariables == 'true';
          obj.predicate = cell.getAttribute('predicate');
          obj.match = cell.getAttribute('match');
        } else if (cell.value.tagName === 'Publish') {
          obj.junctionPath = cell.getAttribute('junctionPath');
        } else if (cell.value.tagName === 'Fork') {
          const edges = graph.getOutgoingEdges(cell);
          obj.branches = [];
          for (let i = 0; i < edges.length; i++) {
            if (edges[i].target.value.tagName !== 'Join') {
              obj.branches.push({id: edges[i].id, label: edges[i].getAttribute('label')});
            }
          }
        }

        self.selectedNode = {
          type: cell.value.tagName,
          obj: obj, cell: cell,
          job: job,
          actualValue: JSON.parse(JSON.stringify(obj))
        };
      }
    }

    /**
     * Function: Check and create clicked instructions
     * @param title
     * @param targetCell
     */
    function createClickInstruction(title, targetCell) {
      if (!targetCell) {
        result = '';
        return;
      }

      const flag = result === 'valid' || result === 'select';
      if (flag) {
        let defaultParent = targetCell;
        if (targetCell.value.tagName === 'Process' || targetCell.value.tagName === 'Connection' || targetCell.value.tagName === 'Catch') {
          defaultParent = targetCell.getParent();
        }
        let clickedCell: any, _node: any, v1, v2, label = '';
        if (title.match('job')) {
          _node = doc.createElement('Job');
          _node.setAttribute('jobName', 'job');
          _node.setAttribute('label', '');
          clickedCell = graph.insertVertex(defaultParent, null, _node, 0, 0, 180, 40, 'job');
        } else if (title.match('finish')) {
          _node = doc.createElement('Finish');
          _node.setAttribute('label', 'finish');
          _node.setAttribute('message', '');
          clickedCell = graph.insertVertex(defaultParent, null, _node, 0, 0, 68, 68, self.workflowService.finish);
        } else if (title.match('fail')) {
          _node = doc.createElement('Fail');
          _node.setAttribute('label', 'fail');
          _node.setAttribute('message', '');
          clickedCell = graph.insertVertex(defaultParent, null, _node, 0, 0, 68, 68, self.workflowService.fail);
        } else if (title.match('fork')) {
          _node = doc.createElement('Fork');
          _node.setAttribute('label', 'fork');
          clickedCell = graph.insertVertex(defaultParent, null, _node, 0, 0, 68, 68, self.workflowService.fork);
          clickedCell.collapsed = true;
        } else if (title.match('if')) {
          _node = doc.createElement('If');
          _node.setAttribute('label', 'if');
          _node.setAttribute('predicate', 'returnCode > 0');
          clickedCell = graph.insertVertex(defaultParent, null, _node, 0, 0, 75, 75, 'if');
          clickedCell.collapsed = true;
        } else if (title.match('retry')) {
          _node = doc.createElement('Retry');
          _node.setAttribute('label', 'retry');
          _node.setAttribute('maxTries', '10');
          _node.setAttribute('retryDelays', '0');
          clickedCell = graph.insertVertex(defaultParent, null, _node, 0, 0, 75, 75, 'retry');
          clickedCell.collapsed = true;
        } else if (title.match('try')) {
          _node = doc.createElement('Try');
          _node.setAttribute('label', 'try');
          clickedCell = graph.insertVertex(defaultParent, null, _node, 0, 0, 75, 75, 'try');
          clickedCell.collapsed = true;
        } else if (title.match('await')) {
          _node = doc.createElement('Await');
          _node.setAttribute('label', 'await');
          clickedCell = graph.insertVertex(defaultParent, null, _node, 0, 0, 68, 68, self.workflowService.await);
        } else if (title.match('publish')) {
          _node = doc.createElement('Publish');
          _node.setAttribute('label', 'publish');
          clickedCell = graph.insertVertex(defaultParent, null, _node, 0, 0, 68, 68, self.workflowService.publish);
        } else if (title.match('fileWatcher')) {
          _node = doc.createElement('FileWatcher');
          _node.setAttribute('label', 'fileWatcher');
          _node.setAttribute('directory', '');
          _node.setAttribute('regex', '.*');
          clickedCell = graph.insertVertex(defaultParent, null, _node, 0, 0, 110, 40, 'fileWatcher');
        }
        if (targetCell.value.tagName !== 'Connection') {
          if (result === 'select') {
            if (selectedCellsObj) {
              targetCell = null;
            }
            if (clickedCell.collapsed) {
              clickedCell.collapsed = false;
            }
            moveSelectedCellToDroppedCell(targetCell, clickedCell, selectedCellsObj);
            selectedCellsObj = null;
          } else {
            addInstructionToCell(clickedCell, targetCell);
            isUndoable = true;
          }
          targetCell = null;
          dropTarget = null;
          graph.clearSelection();
          setTimeout(() => {
            if (v1) {
              graph.setSelectionCells([clickedCell, v1]);
            } else {
              graph.setSelectionCells([clickedCell]);
            }
          }, 0);
        } else {
          graph.clearSelection();
          if (targetCell.source) {
            if (targetCell.source.getParent().id !== '1') {
              const _type = targetCell.getAttribute('type') || targetCell.getAttribute('label');
              if (!(_type === 'retry' || _type === 'then' || _type === 'else' || _type === 'branch' || _type === 'try' || _type === 'catch')) {
                targetCell.setParent(targetCell.source.getParent());
              }
            }
          }
          label = targetCell.getAttribute('type') || targetCell.getAttribute('label') || '';
          if (clickedCell.value.tagName === 'Fork' || clickedCell.value.tagName === 'If' || clickedCell.value.tagName === 'Retry' || clickedCell.value.tagName === 'Try') {
            const parent = targetCell.getParent() || graph.getDefaultParent();
            if (clickedCell.value.tagName === 'Fork') {
              v1 = graph.insertVertex(parent, null, getCellNode('Join', 'join', null), 0, 0, 68, 68, self.workflowService.merge);
            } else if (clickedCell.value.tagName === 'If') {
              v1 = graph.insertVertex(parent, null, getCellNode('EndIf', 'ifEnd', null), 0, 0, 75, 75, 'if');
            } else if (clickedCell.value.tagName === 'Retry') {
              v1 = graph.insertVertex(parent, null, getCellNode('EndRetry', 'retryEnd', null), 0, 0, 75, 75, 'retry');
            } else {
              v1 = graph.insertVertex(parent, null, getCellNode('EndTry', 'tryEnd', null), 0, 0, 75, 75, 'try');
              v2 = graph.insertVertex(clickedCell, null, getCellNode('Catch', 'catch', null), 0, 0, 100, 40, 'dashRectangle');
              // v2.collapsed = true;
              graph.insertEdge(parent, null, getConnectionNode('try'), clickedCell, v2);
              graph.insertEdge(parent, null, getConnectionNode('endTry'), v2, v1);
            }

            graph.insertEdge(parent, null, getConnectionNode(label), targetCell.source, clickedCell);
            if (clickedCell.value.tagName !== 'Try') {
              graph.insertEdge(parent, null, getConnectionNode(''), clickedCell, v1);
            }

            graph.insertEdge(parent, null, getConnectionNode(''), v1, targetCell.target);
            for (let x = 0; x < targetCell.source.edges.length; x++) {
              if (targetCell.source.edges[x].id === targetCell.id) {
                const _sourCellName = targetCell.source.value.tagName;
                const _tarCellName = targetCell.target.value.tagName;
                if ((targetCell.target && ((_sourCellName === 'Job' || _sourCellName === 'Finish' || _sourCellName === 'Fail' || _sourCellName === 'Publish' || _sourCellName === 'Await') &&
                  (_tarCellName === 'Job' || _tarCellName === 'Finish' || _tarCellName === 'Fail' || _tarCellName === 'Publish' || _tarCellName === 'Await')))) {
                  graph.getModel().remove(targetCell.source.edges[x]);
                } else {
                  targetCell.source.removeEdge(targetCell.source.edges[x], true);
                }
                break;
              }
            }

            setTimeout(() => {
              graph.getModel().beginUpdate();
              try {
                if (clickedCell.id && v1.id) {
                  self.nodeMap.set(clickedCell.id, v1.id);
                }
                const targetId = new mxCellAttributeChange(
                  v1, 'targetId',
                  clickedCell.id);
                graph.getModel().execute(targetId);
                if (v2) {
                  const targetId2 = new mxCellAttributeChange(
                    v2, 'targetId', clickedCell.id);
                  graph.getModel().execute(targetId2);
                }
              } finally {
                graph.getModel().endUpdate();
              }
              checkConnectionLabel(clickedCell, targetCell, false);
            }, 0);
          } else {
            graph.insertEdge(defaultParent, null, getConnectionNode(label), targetCell.source, clickedCell);
            let e1 = graph.insertEdge(defaultParent, null, getConnectionNode(label), clickedCell, targetCell.target);
            for (let i = 0; i < targetCell.source.edges.length; i++) {
              if (targetCell.id === targetCell.source.edges[i].id) {
                targetCell.source.removeEdge(targetCell.source.edges[i], true);
                break;
              }
            }
            setTimeout(() => {
              checkConnectionLabel(clickedCell, e1, true);
            }, 0);
          }
          if (v1) {
            graph.setSelectionCells([clickedCell, v1]);
          } else {
            graph.setSelectionCells([clickedCell]);
          }
        }
        WorkflowService.executeLayout(graph);
      }
      result = '';
    }

    /**
     * Function: To validate instruction is valid for drop or not
     * @param targetCell
     * @param title
     */
    function checkValidTarget(targetCell, title): string {
      const tagName = targetCell.value.tagName;
      if (tagName === 'Process') {
        if (targetCell.getAttribute('title') === 'start' || targetCell.getAttribute('title') === 'end') {
          return 'return';
        }
      } else if (tagName === 'Connector' || title === 'Connect') {
        return 'return';
      }
      let flg = false;
      if (title) {
        title = title.toLowerCase();
        if (title.match('fork') || title.match('retry') || title.match('try') || title.match('if')) {
          const selectedCell = graph.getSelectionCell();
          if (selectedCell) {
            const cells = graph.getSelectionCells();
            if (cells.length > 1) {
              selectedCellsObj = isCellSelectedValid(cells);
              if (selectedCellsObj.invalid) {
                return 'inValid';
              }
            }
            if (selectedCell.id === targetCell.id || (selectedCellsObj && selectedCellsObj.ids && selectedCellsObj.ids.length > 0 && selectedCellsObj.ids.indexOf(targetCell.id) > -1)) {
              flg = true;
            }
          }
        }
      }
      if (!flg) {
        if (tagName !== 'Connection') {
          if (tagName === 'Job' || tagName === 'Finish' || tagName === 'Fail' || tagName === 'Await' || tagName === 'Publish') {
            for (let i = 0; i < targetCell.edges.length; i++) {
              if (targetCell.edges[i].target.id !== targetCell.id) {
                return 'inValid';
              }
            }
          } else if (tagName === 'If') {
            if (targetCell.edges.length > 2) {
              return 'inValid';
            }
          } else if (checkClosingCell(targetCell)) {
            if (targetCell.edges.length > 1) {
              for (let i = 0; i < targetCell.edges.length; i++) {
                if (targetCell.edges[i].target.id !== targetCell.id) {
                  return 'inValid';
                }
              }
            }
          } else if (tagName === 'Retry') {
            let flag1 = false;
            if (targetCell.edges && targetCell.edges.length) {
              for (let i = 0; i < targetCell.edges.length; i++) {
                if (targetCell.edges[i].source.value.tagName === 'Retry' && targetCell.edges[i].target.value.tagName === 'EndRetry') {
                  flag1 = true;
                }
              }
            }
            if (!flag1) {
              return 'inValid';
            }
          } else if (tagName === 'Try') {
            let flag1 = false;
            if (targetCell.edges && targetCell.edges.length) {
              for (let i = 0; i < targetCell.edges.length; i++) {
                if (targetCell.edges[i].source && targetCell.edges[i].target && targetCell.edges[i].source.value.tagName === 'Try' && (
                  targetCell.edges[i].target.value.tagName === 'Catch' || targetCell.edges[i].target.value.tagName === 'EndTry')) {
                  flag1 = true;
                }
              }
            }
            if (!flag1) {

              return 'inValid';
            }
          } else if (tagName === 'Catch') {
            let flag1 = false;
            if (targetCell.edges && targetCell.edges.length) {
              for (let i = 0; i < targetCell.edges.length; i++) {
                if (targetCell.edges[i].source.value.tagName === 'Catch' && targetCell.edges[i].target.value.tagName === 'EndTry') {
                  flag1 = true;
                }
              }
            }
            if (!flag1) {
              return 'inValid';
            }
          } else if (tagName === 'Process') {
            if (targetCell.edges && targetCell.edges.length === 1) {
              if (targetCell.edges[0].value.tagName === 'Connector') {
                return 'inValid';
              }
            }
          }
        } else {
          if (tagName === 'Connection') {
            if ((targetCell.source.value.tagName === 'Fork' && targetCell.target.value.tagName === 'Join') ||
              (targetCell.source.value.tagName === 'If' && targetCell.target.value.tagName === 'EndIf') ||
              (targetCell.source.value.tagName === 'Retry' && targetCell.target.value.tagName === 'EndRetry') ||
              (targetCell.source.value.tagName === 'Try' && targetCell.target.value.tagName === 'Catch') ||
              (targetCell.source.value.tagName === 'Catch' && targetCell.target.value.tagName === 'EndTry') ||
              (targetCell.source.value.tagName === 'Try' && targetCell.target.value.tagName === 'EndTry')) {
              return 'return';
            }
          }
        }
      } else {
        return 'select';
      }
      return 'valid';
    }

    function addInstructionToCell(cell, _dropTarget) {
      let label = '';
      const dropTargetName = _dropTarget.value.tagName;
      for (let i = 0; i < _dropTarget.edges.length; i++) {
        if (_dropTarget.edges[i].source.id === _dropTarget.id) {
          if (checkClosedCellWithSourceCell(_dropTarget, _dropTarget.edges[i].target)) {
            graph.foldCells(false, false, [_dropTarget], null, null);
          }
          break;
        }
      }
      if (dropTargetName === 'If') {
        let flag = false;
        label = 'then';
        for (let i = 0; i < _dropTarget.edges.length; i++) {
          if (_dropTarget.edges[i].target.id !== _dropTarget.id && _dropTarget.edges[i].target.value.tagName !== 'EndIf') {
            label = 'else';
          } else {
            if (_dropTarget.edges[i].target && _dropTarget.edges[i].target.edges) {
              for (let j = 0; j < _dropTarget.edges[i].target.edges.length; j++) {
                if (_dropTarget.edges[i].target.edges[j].edge && _dropTarget.edges[i].target.edges[j].value.attributes
                  && _dropTarget.edges[i].target.edges[j].value.attributes.length > 0 && (_dropTarget.edges[i].target.edges[j].value.attributes[0]
                    && _dropTarget.edges[i].target.edges[j].value.attributes[0].value === 'else')) {
                  flag = true;
                }
              }
            }
          }
        }
        if (flag) {
          label = 'then';
        }
      } else if (dropTargetName === 'Retry') {
        label = 'retry';
      } else if (dropTargetName === 'Try') {
        label = 'try';
      } else if (dropTargetName === 'Catch') {
        label = 'catch';
        // cell.setParent(_dropTarget);
      } else if (dropTargetName === 'Fork') {
        const branchs = graph.getOutgoingEdges(_dropTarget);
        let num = branchs.length;
        if (num === 1 && branchs[0].target.value.tagName === 'Join') {
          num = 0;
        }
        label = '$TYPE$' + 'branch' + (num + 1);
      }

      let parent = cell.getParent() || graph.getDefaultParent();
      if (cell.value.tagName === 'Fork' || cell.value.tagName === 'If' || cell.value.tagName === 'Retry' || cell.value.tagName === 'Try') {
        let v1, v2, _label;
        if (cell.value.tagName === 'Fork') {
          v1 = graph.insertVertex(parent, null, getCellNode('Join', 'join', cell.id), 0, 0, 68, 68, self.workflowService.merge);
          graph.insertEdge(parent, null, getConnectionNode(''), cell, v1);
        } else if (cell.value.tagName === 'If') {
          v1 = graph.insertVertex(parent, null, getCellNode('EndIf', 'ifEnd', cell.id), 0, 0, 75, 75, 'if');
          graph.insertEdge(parent, null, getConnectionNode(''), cell, v1);
        } else if (cell.value.tagName === 'Retry') {
          v1 = graph.insertVertex(parent, null, getCellNode('EndRetry', 'retryEnd', cell.id), 0, 0, 75, 75, 'retry');
          graph.insertEdge(parent, null, getConnectionNode(''), cell, v1);
        } else if (cell.value.tagName === 'Try') {
          v2 = graph.insertVertex(cell, null, getCellNode('Catch', 'catch', cell.id), 0, 0, 100, 40, 'dashRectangle');
          v1 = graph.insertVertex(parent, null, getCellNode('EndTry', 'tryEnd', cell.id), 0, 0, 75, 75, 'try');
          graph.insertEdge(parent, null, getConnectionNode('try'), cell, v2);
          graph.insertEdge(parent, null, getConnectionNode(''), cell, v1);
          graph.insertEdge(parent, null, getConnectionNode('endTry'), v2, v1);
        }
        if (dropTargetName === 'Fork' || dropTargetName === 'Retry' || dropTargetName === 'Try' || dropTargetName === 'Catch' || dropTargetName === 'If') {
          _label = dropTargetName === 'Fork' ? 'join' : dropTargetName === 'Retry' ? 'endRetry' : dropTargetName === 'Catch' ? 'catch' : dropTargetName === 'If' ? 'endIf' : 'try';
          if (dropTargetName === 'Try') {
            for (let i = 0; i < _dropTarget.edges.length; i++) {
              if (_dropTarget.edges[i].source.id === _dropTarget.id) {
                if (_dropTarget.edges[i].target.value.tagName === 'EndTry') {
                  _label = 'endTry';
                }
                break;
              }
            }
          }
        }

        if (v1) {
          if (cell.id && v1.id) {
            self.nodeMap.set(cell.id, v1.id);
          }
          if (_label) {
            setTimeout(() => {
              for (let i = 0; i < v1.edges.length; i++) {
                if (v1.edges[i].target.id !== v1.id) {
                  changeLabelOfConnection(v1.edges[i], _label);
                  break;
                }
              }
            }, 0);
          }
        }
      }
      if (dropTargetName === 'Process') {
        parent = graph.getDefaultParent();
        let flag = false;
        for (let i = 0; i < _dropTarget.edges.length; i++) {
          if (_dropTarget.edges[i].source.id !== _dropTarget.id) {
            if (cell.value.tagName === 'Fork' || cell.value.tagName === 'If' || cell.value.tagName === 'Retry' || cell.value.tagName === 'Try') {
              for (let j = 0; j < cell.edges.length; j++) {
                if (cell.edges[j].target.id !== cell.id) {
                  if (checkClosingCell(cell.edges[j].target)) {
                    if (flag) {
                      graph.insertEdge(parent, null, getConnectionNode(label), cell.edges[j].target, _dropTarget.edges[i].target);
                    } else {
                      graph.insertEdge(parent, null, getConnectionNode(label), _dropTarget.edges[i].source, cell.edges[j].source);
                    }
                    flag = true;
                    break;
                  }
                }
              }
            } else {
              graph.insertEdge(parent, null, getConnectionNode(label), _dropTarget.edges[i].source, cell);
            }
          } else {
            if (cell.value.tagName === 'Fork' || cell.value.tagName === 'If' || cell.value.tagName === 'Retry' || cell.value.tagName === 'Try') {
              for (let j = 0; j < cell.edges.length; j++) {
                if (cell.edges[j].target.id !== cell.id) {
                  if (checkClosingCell(cell.edges[j].target)) {
                    graph.insertEdge(parent, null, getConnectionNode(label), cell.edges[j].target, _dropTarget.edges[i].target);
                    break;
                  }
                }
              }
            } else {
              graph.insertEdge(parent, null, getConnectionNode(label), cell, _dropTarget.edges[i].target);
            }
          }
        }
        graph.getModel().remove(_dropTarget);
      } else {
        let checkLabel = '';
        if (dropTargetName === 'Fork') {
          const branchs = graph.getOutgoingEdges(_dropTarget);
          let num = branchs.length;
          if (num === 1 && branchs[0].target.value.tagName === 'Join') {
            num = 0;
          }
          label = '$TYPE$' + 'branch' + (num + 1);
          checkLabel = 'Join';
        } else if (dropTargetName === 'If') {
          checkLabel = 'EndIf';
        } else if (dropTargetName === 'Retry') {
          checkLabel = 'EndRetry';
        } else if (dropTargetName === 'Try') {
          label = 'try';
          checkLabel = 'EndTry';
        } else if (dropTargetName === 'Catch') {
          label = 'catch';
          checkLabel = 'EndTry';
          graph.getModel().setStyle(_dropTarget, 'catch');
        }

        if (cell.value.tagName === 'If' || cell.value.tagName === 'Fork' || cell.value.tagName === 'Retry' || cell.value.tagName === 'Try') {
          let target1, target2;
          for (let i = 0; i < _dropTarget.edges.length; i++) {
            if (_dropTarget.edges[i].target.id !== _dropTarget.id) {
              if (_dropTarget.edges[i].target.value.tagName === checkLabel || _dropTarget.edges[i].target.value.tagName === 'Catch') {
                if (_dropTarget.edges[i].target.value.tagName !== 'Catch') {
                  self.nodeMap.set(_dropTarget.id, _dropTarget.edges[i].target.id);
                }
                target1 = _dropTarget.edges[i];
              }
              break;
            }
          }
          for (let i = 0; i < cell.edges.length; i++) {
            if (cell.edges[i].target.id !== cell.id) {
              if (checkClosingCell(cell.edges[i].target)) {
                self.nodeMap.set(cell.id, cell.edges[i].target.id);
                target2 = cell.edges[i].target;
                break;
              }
            }
          }
          if (target1 && target2) {
            graph.insertEdge(parent, null, getConnectionNode(label), target2, target1.target);
            graph.getModel().remove(target1);
          } else if (self.nodeMap.has(_dropTarget.id)) {
            const target = graph.getModel().getCell(self.nodeMap.get(_dropTarget.id));
            graph.insertEdge(parent, null, getConnectionNode(label), target2, target);
          }
        } else {
          if (dropTargetName === 'Try' && cell.value.tagName === 'Catch') {
            label = 'endTry';
            graph.getModel().setStyle(cell, 'dashRectangle');
          }
          let flag = false;
          if (_dropTarget.edges && _dropTarget.edges.length) {
            for (let i = 0; i < _dropTarget.edges.length; i++) {
              if (_dropTarget.edges[i].target.id !== _dropTarget.id) {
                if (_dropTarget.edges[i].target.value.tagName === checkLabel || _dropTarget.edges[i].target.value.tagName === 'Catch') {
                  flag = true;
                  if (!self.nodeMap.has(_dropTarget.id) && _dropTarget.value.tagName !== 'Catch') {
                    self.nodeMap.set(_dropTarget.id, _dropTarget.edges[i].target.id);
                  }

                  const attr = _dropTarget.edges[i].value.attributes;
                  if (attr && label !== 'catch' && !checkClosedCellWithSourceCell(_dropTarget, _dropTarget.edges[i].target)) {
                    for (let x = 0; x < attr.length; x++) {
                      if (attr[x].value && attr[x].name) {
                        label = attr[x].value;
                        break;
                      }
                    }
                  }

                  if (cell && _dropTarget.edges[i].target) {
                    graph.insertEdge(parent, null, getConnectionNode(label), cell, _dropTarget.edges[i].target);
                  }
                  graph.getModel().remove(_dropTarget.edges[i]);
                }
                break;
              }
            }
          }
          if (!flag && self.nodeMap.has(_dropTarget.id)) {
            const target = graph.getModel().getCell(self.nodeMap.get(_dropTarget.id));
            if (cell && target) {
              graph.insertEdge(parent, null, getConnectionNode(label), cell, target);
            }
          }
        }

        if (cell.edges) {
          for (let i = 0; i < cell.edges.length; i++) {
            if (cell.edges[i].target.value.tagName === checkLabel) {
              const _label = checkLabel === 'Join' ? 'join' : checkLabel === 'EndIf' ? 'endIf' : checkLabel === 'EndRetry'
                ? 'endRetry' : 'endTry';
              if (cell.value.tagName !== 'Fork' && cell.value.tagName !== 'If' && cell.value.tagName !== 'Try' && cell.value.tagName !== 'Retry' && cell.value.tagName !== 'Catch') {
                cell.edges[i].value.attributes[0].nodeValue = _label;
                cell.edges[i].value.attributes[1].nodeValue = _label;
              }
            }
          }
        }
        if (cell && _dropTarget) {
          if (dropTargetName === 'Try' && cell.value.tagName === 'Catch') {
            const childVertices = graph.getChildVertices(_dropTarget);
            if (childVertices.length > 0) {
              const lastChildVertex = childVertices.length === 1 ? _dropTarget : childVertices[childVertices.length - 2];
              for (let j = 0; j < lastChildVertex.edges.length; j++) {
                if (lastChildVertex.edges[j].source.id === lastChildVertex.id) {
                  graph.getModel().remove(lastChildVertex.edges[j]);
                  break;
                }
              }
              graph.insertEdge(parent, null, getConnectionNode('try'), lastChildVertex, cell);

            } else {
              graph.insertEdge(parent, null, getConnectionNode('try'), _dropTarget, cell);
            }

            const targetId = _dropTarget.id;
            setTimeout(() => {
              graph.getModel().beginUpdate();
              try {
                const targetId2 = new mxCellAttributeChange(
                  cell, 'targetId', targetId);
                graph.getModel().execute(targetId2);
              } finally {
                graph.getModel().endUpdate();
              }
            }, 0);
          } else {
            graph.insertEdge(parent, null, getConnectionNode(label), _dropTarget, cell);
          }
        }
      }
      if (cell.value.tagName === 'Try') {
        for (let j = 0; j < cell.edges.length; j++) {
          if (cell.edges[j].target.id !== cell.id) {
            if (cell.edges[j].source.value.tagName === 'Try' && cell.edges[j].target.value.tagName === 'EndTry') {
              graph.getModel().remove(cell.edges[j]);
              break;
            }
          }
        }
      }
    }

    function dropOnObject(source, target, sourceIndex, targetIndex, isCatch) {
      if (source && source.instructions.length > 0) {
        let sourceObj = source.instructions[sourceIndex];
        let targetObj = target.instructions[targetIndex];
        let isDone = false;
        if (targetObj.TYPE === 'If') {
          if (!targetObj.then) {
            targetObj.then = {instructions: [sourceObj]};
            isDone = true;
          } else if (!targetObj.else) {
            targetObj.else = {instructions: [sourceObj]};
            isDone = true;
          }
          if (!isDone) {
            let title = '', msg = '';
            self.translate.get('workflow.message.invalidTarget').subscribe(translatedValue => {
              title = translatedValue;
            });

            self.translate.get('workflow.message.ifInstructionValidationError').subscribe(translatedValue => {
              msg = translatedValue;
            });
            self.toasterService.pop('error', title + '!!', msg);
          }
        } else if (targetObj.TYPE === 'Fork') {
          let branchId = 'branch';
          if (!targetObj.branches) {
            targetObj.branches = [];
          }
          branchId = 'branch' + (targetObj.branches.length + 1);
          targetObj.branches.push({id: branchId, instructions: [sourceObj]});
          isDone = true;
        } else if (targetObj.TYPE === 'Retry') {
          if (!targetObj.instructions) {
            targetObj.instructions = [];
          }
          targetObj.instructions.push(sourceObj);
          isDone = true;
        } else if (targetObj.TYPE === 'Try' && !isCatch) {
          if (!targetObj.instructions) {
            targetObj.instructions = [];
          }
          targetObj.instructions.push(sourceObj);
          isDone = true;
        } else if (isCatch) {
          if (!targetObj.catch.instructions) {
            targetObj.catch.instructions = [];
          }
          targetObj.catch.instructions.push(sourceObj);
          isDone = true;
        }
        if (isDone) {
          source.instructions.splice(sourceIndex, 1);
          updateXMLFromJSON(false);
        }
      }
    }

    function dropAndAdd(instructions, dropId, targetId, object, obj) {
      for (let i = 0; i < instructions.length; i++) {
        if (instructions[i].id == dropId) {
          instructions.splice(i, 1);
          break;
        }
      }
      for (let k = 0; k < instructions.length; k++) {
        if (instructions[k].id == targetId) {
          instructions.splice(k, 0, object);
          obj.isMatch = true;
          break;
        }
      }
    }

    /**
     * Function: Rearrange a cell to a different position in the workflow
     * @param obj
     */
    function rearrangeCell(obj) {
      let connection = obj.target;
      let droppedCell = obj.cell;
      if (connection.source === droppedCell.id || connection.target === droppedCell.id ||
        connection === droppedCell.id) {
        updateXMLFromJSON(false);
      } else {
        let dropObject: any, targetObject: any, index = 0, targetIndex = 0, isCatch = false;
        let source = connection.source || connection;

        function getObject(json, cell) {
          if (json.instructions) {
            for (let x = 0; x < json.instructions.length; x++) {
              if (dropObject && targetObject) {
                break;
              }
              if (json.instructions[x].id == cell.id) {
                dropObject = json;
                index = x;
              }
              if (json.instructions[x].id == source) {
                targetObject = json;
                targetIndex = x;
              }
              if (json.instructions[x].instructions) {
                getObject(json.instructions[x], cell);
              }
              if (json.instructions[x].catch) {
                if (json.instructions[x].catch.id == source) {
                  targetObject = json;
                  targetIndex = x;
                  isCatch = true;
                }
                if (json.instructions[x].catch.instructions && json.instructions[x].catch.instructions.length > 0) {
                  getObject(json.instructions[x].catch, cell);
                }
              }
              if (json.instructions[x].then) {
                getObject(json.instructions[x].then, cell);
              }
              if (json.instructions[x].else) {
                getObject(json.instructions[x].else, cell);
              }
              if (json.instructions[x].branches) {
                for (let i = 0; i < json.instructions[x].branches.length; i++) {
                  getObject(json.instructions[x].branches[i], cell);
                }
              }
            }
          }
        }

        getObject(self.workFlowJson, droppedCell);
        if (!targetObject && connection.source === 'start') {
          targetObject = self.workFlowJson;
        }
        let booleanObj = {
          isMatch: false
        };
        if (!connection.source && !connection.target) {
          dropOnObject(dropObject, targetObject, index, targetIndex, isCatch);
          return;
        }
        if (targetObject) {
          if (targetObject.instructions) {
            let sourceObj = dropObject.instructions[index];
            let targetObj = targetObject.instructions[targetIndex];
            dropObject.instructions.splice(index, 1);
            if ((connection.source === 'start')) {
              targetObject.instructions.splice(0, 0, sourceObj);
            } else {
              const isSameObj = connection.source === connection.target;
              if (targetObj.TYPE === 'If') {
                if (obj.type || isSameObj) {
                  if (!obj.type.match('else')) {
                    if (!targetObj.then || targetObj.then.instructions.length === 0) {
                      targetObj.then = {instructions: [sourceObj]};
                      booleanObj.isMatch = true;
                    } else {
                      dropAndAdd(targetObj.then.instructions, droppedCell.id, connection.target, sourceObj, booleanObj);
                    }
                  } else {
                    if (!targetObj.else || targetObj.else.instructions.length === 0) {
                      targetObj.else = {instructions: [sourceObj]};
                      booleanObj.isMatch = true;
                    } else {
                      dropAndAdd(targetObj.else.instructions, droppedCell.id, connection.target, sourceObj, booleanObj);
                    }
                  }
                }
              } else if (targetObj.TYPE === 'Fork') {
                if (obj.type || isSameObj) {
                  if (!targetObj.branches || targetObj.branches.length === 0) {
                    targetObj.branches = [{id: 'branch1', instructions: [sourceObj]}];
                    booleanObj.isMatch = true;
                  } else if (targetObj.branches && targetObj.branches.length > 0) {
                    for (let j = 0; j < targetObj.branches.length; j++) {
                      dropAndAdd(targetObj.branches[j].instructions, droppedCell.id, connection.target, sourceObj, booleanObj);
                      if (booleanObj.isMatch) {
                        break;
                      }
                    }
                    for (let j = 0; j < targetObj.branches.length; j++) {
                      if (targetObj.branches[j].instructions.length === 0) {
                        targetObj.branches.splice(j, 1);
                        break;
                      }
                    }
                  }
                }
              } else if (targetObj.TYPE === 'Retry') {
                if (obj.type || isSameObj) {
                  if (!targetObj.instructions || targetObj.instructions.length === 0) {
                    targetObj.instructions = [sourceObj];
                    booleanObj.isMatch = true;
                  } else if (targetObj.instructions && targetObj.instructions.length > 0) {
                    dropAndAdd(targetObj.instructions, droppedCell.id, connection.target, sourceObj, booleanObj);
                  }
                }
              } else if (targetObj.TYPE === 'Try') {
                if (obj.type || isSameObj) {
                  if (isCatch) {
                    if (!targetObj.catch.instructions || targetObj.catch.instructions.length === 0) {
                      targetObj.catch.instructions = [sourceObj];
                      booleanObj.isMatch = true;
                    } else if (targetObj.catch.instructions && targetObj.catch.instructions.length > 0) {
                      dropAndAdd(targetObj.catch.instructions, droppedCell.id, connection.target, sourceObj, booleanObj);
                    }
                  } else {
                    if (!targetObj.instructions || targetObj.instructions.length === 0) {
                      targetObj.instructions = [sourceObj];
                      booleanObj.isMatch = true;
                    } else if (targetObj.instructions && targetObj.instructions.length > 0) {
                      dropAndAdd(targetObj.instructions, droppedCell.id, connection.target, sourceObj, booleanObj);
                    }
                  }
                }
              }
              if (!booleanObj.isMatch) {
                targetObject.instructions.splice(targetIndex + 1, 0, sourceObj);
              }
            }
          }

          if (dropObject && dropObject.instructions && dropObject.instructions.length === 0) {
            delete dropObject['instructions'];
          }
          updateXMLFromJSON(false);
        }
      }
    }
  }

  private updateJobProperties(data) {
    let job = _.clone(data.job);
    if (job.returnCodeMeaning) {
      if (typeof job.returnCodeMeaning.success == 'string') {
        job.returnCodeMeaning.success = job.returnCodeMeaning.success.split(',').map(Number);
      } else if (typeof job.returnCodeMeaning.failure == 'string') {
        job.returnCodeMeaning.failure = job.returnCodeMeaning.failure.split(',').map(Number);
      }
    }
    if (job.defaultArguments) {
      if (job.defaultArguments.length > 0 && this.coreService.isLastEntryEmpty(job.defaultArguments, 'name', '')) {
        job.defaultArguments.splice(job.defaultArguments.length - 1, 1);
      }
      if (job.defaultArguments.length > 0) {
        job.defaultArguments = _.object(_.map(job.defaultArguments, _.values));
      } else {
        job.defaultArguments = undefined;
      }
    }

    if (!job.taskLimit) {
      job.taskLimit = 0;
    }
    if (job.timeout1) {
      job.timeout = this.workflowService.convertStringToDuration(job.timeout1);
    }
    if (job.graceTimeout1) {
      job.graceTimeout = this.workflowService.convertStringToDuration(job.graceTimeout1);
    }

    let flag = true;
    for (let i = 0; i < this.jobs.length; i++) {
      if (this.jobs[i].name === job.jobName) {
        flag = false;
        delete job['jobName'];
        this.jobs[i].value = job;

      }
    }
    if (flag) {
      delete job['jobName'];
      this.jobs.push({name: data.job.jobName, value: job});
    }
  }

  private updateJobs(_graph) {
    const enc = new mxCodec();
    const node = enc.encode(_graph.getModel());
    let xml = mxUtils.getXml(node);
    let _json: any;
    try {
      _json = x2js.xml_str2json(xml);
    } catch (e) {
      console.log(e);
    }
    let objects = _json.mxGraphModel.root;
    const vertices = objects.Job;
    let tempJobs = [];
    for (let i = 0; i < vertices.length; i++) {
      for (let j = 0; j < this.jobs.length; j++) {
        if (vertices[i]._jobName === this.jobs[j].name) {
          tempJobs.push(this.jobs[j]);
          this.jobs.splice(j, 1);
          break;
        }
      }
    }
    this.jobs = tempJobs;
  }

  private updateProperties(obj) {
    if (this.editor && this.editor.graph && this.selectedNode && this.selectedNode.cell) {
      const _graph = _.clone(this.editor.graph);
      _graph.getModel().beginUpdate();
      try {
        if (this.selectedNode.type === 'Job') {
          this.updateJobProperties(this.selectedNode);
          const edit = new mxCellAttributeChange(
            obj.cell, 'jobName', this.selectedNode.newObj.jobName);
          _graph.getModel().execute(edit);
          const edit2 = new mxCellAttributeChange(
            obj.cell, 'label', this.selectedNode.newObj.label);
          _graph.getModel().execute(edit2);
          const edit3 = new mxCellAttributeChange(
            obj.cell, 'defaultArguments', JSON.stringify(this.selectedNode.newObj.defaultArguments));
          _graph.getModel().execute(edit3);
        } else if (this.selectedNode.type === 'If') {
          const edit = new mxCellAttributeChange(
            obj.cell, 'predicate', this.selectedNode.newObj.predicate);
          _graph.getModel().execute(edit);
        } else if (this.selectedNode.type === 'Retry') {
          const edit = new mxCellAttributeChange(
            obj.cell, 'maxTries', this.selectedNode.newObj.maxTries);
          _graph.getModel().execute(edit);
          const edit2 = new mxCellAttributeChange(
            obj.cell, 'retryDelays', this.selectedNode.newObj.retryDelays);
          _graph.getModel().execute(edit2);
        } else if (this.selectedNode.type === 'Finish') {
          const edit = new mxCellAttributeChange(
            obj.cell, 'message', this.selectedNode.newObj.message);
          _graph.getModel().execute(edit);
        } else if (this.selectedNode.type === 'Fail') {
          const edit = new mxCellAttributeChange(
            obj.cell, 'message', this.selectedNode.newObj.message);
          _graph.getModel().execute(edit);
          const edit2 = new mxCellAttributeChange(
            obj.cell, 'returnCode', this.selectedNode.newObj.returnCode);
          _graph.getModel().execute(edit2);
        } else if (this.selectedNode.type === 'Await') {
          const edit1 = new mxCellAttributeChange(
            obj.cell, 'junctionPath', this.selectedNode.newObj.junctionPath);
          _graph.getModel().execute(edit1);
          let timeout;
          if (this.selectedNode.newObj.timeout1) {
            timeout = this.workflowService.convertStringToDuration(this.selectedNode.newObj.timeout1);
          }
          const edit2 = new mxCellAttributeChange(
            obj.cell, 'timeout', timeout);
          _graph.getModel().execute(edit2);
          const edit3 = new mxCellAttributeChange(
            obj.cell, 'joinVariables', this.selectedNode.newObj.joinVariables);
          _graph.getModel().execute(edit3);
          const edit4 = new mxCellAttributeChange(
            obj.cell, 'predicate', this.selectedNode.newObj.predicate);
          _graph.getModel().execute(edit4);
          const edit5 = new mxCellAttributeChange(
            obj.cell, 'match', this.selectedNode.newObj.match);
          _graph.getModel().execute(edit5);
        } else if (this.selectedNode.type === 'Publish') {
          const edit = new mxCellAttributeChange(
            obj.cell, 'junctionPath', this.selectedNode.newObj.junctionPath);
          _graph.getModel().execute(edit);
        } else if (this.selectedNode.type === 'FileWatcher') {
          const edit1 = new mxCellAttributeChange(
            obj.cell, 'directory', this.selectedNode.newObj.directory);
          _graph.getModel().execute(edit1);
          const edit2 = new mxCellAttributeChange(
            obj.cell, 'regex', this.selectedNode.newObj.regex);
          _graph.getModel().execute(edit2);
        } else if (this.selectedNode.type === 'Fork') {
          const edges = _graph.getOutgoingEdges(obj.cell);
          for (let i = 0; i < edges.length; i++) {
            for (let j = 0; j < this.selectedNode.newObj.branches.length; j++) {
              if (this.selectedNode.newObj.branches[j].id && edges[i].id) {
                const edit = new mxCellAttributeChange(
                  edges[i], 'label', this.selectedNode.newObj.branches[i].label);
                _graph.getModel().execute(edit);
                break;
              }
            }
          }
        }
      } finally {
        _graph.getModel().endUpdate();
        this.updateJobs(_graph);
      }
    }
  }

  private modifyJSON(_json) {
    const self = this;

    function recursive(json) {
      if (json.instructions) {
        for (let x = 0; x < json.instructions.length; x++) {
          json.instructions[x].id = undefined;
          json.instructions[x].isCollapsed = undefined;
          if (json.instructions[x].TYPE === 'Job') {
            json.instructions[x].TYPE = 'Execute.Named';
            self.workflowService.validateFields(json.instructions[x]);
          }
          if (json.instructions[x].TYPE === 'Await') {
            self.workflowService.validateFields(json.instructions[x]);
          }
          if (json.instructions[x].TYPE === 'Fail') {
            self.workflowService.validateFields(json.instructions[x]);
          }
          if (json.instructions[x].instructions) {
            recursive(json.instructions[x]);
          }
          if (json.instructions[x].TYPE === 'Try' && json.instructions[x].instructions && !json.instructions[x].try) {
            self.workflowService.convertTryInstruction(json.instructions[x]);
          }
          if (json.instructions[x].TYPE === 'Retry' && json.instructions[x].instructions) {
            json.instructions[x].TYPE = 'Try';
            self.workflowService.convertRetryToTryCatch(json.instructions[x]);
          }

          if (json.instructions[x].catch) {
            json.instructions[x].catch.id = undefined;
            if (json.instructions[x].catch.instructions && json.instructions[x].catch.instructions.length > 0) {
              recursive(json.instructions[x].catch);
            }
          }
          if (json.instructions[x].then && json.instructions[x].then.instructions) {
            recursive(json.instructions[x].then);
          }
          if (json.instructions[x].else && json.instructions[x].else.instructions) {
            recursive(json.instructions[x].else);
          }
          if (json.instructions[x].branches) {
            for (let i = 0; i < json.instructions[x].branches.length; i++) {
              if (json.instructions[x].branches[i].instructions) {
                recursive(json.instructions[x].branches[i]);
              }
              json.instructions[x].branches[i].workflow = {
                instructions: json.instructions[x].branches[i].instructions
              };
              delete json.instructions[x].branches[i]['instructions'];
            }
          }
          if (json.instructions[x].events) {
            for (let i = 0; i < json.instructions[x].events.length; i++) {
              json.instructions[x].events[i].id = undefined;
            }
          }
        }
      }
    }

    recursive(_json);

    for (let n = 0; n < this.jobs.length; n++) {
      self.workflowService.validateFields(this.jobs[n].value);
    }

    if (_json.instructions) {
      delete _json['id'];
      _json.jobs = _.object(_.map(this.jobs, _.values));
    }
  }

  private saveJSON() {
    this.modifyJSON(this.workFlowJson);
    sessionStorage.$SOS$WORKFLOW = JSON.stringify(this.workFlowJson);
  }

  @HostListener('window:beforeunload', ['$event'])
  beforeunload() {
    this.saveJSON();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.centered();
  }
}
