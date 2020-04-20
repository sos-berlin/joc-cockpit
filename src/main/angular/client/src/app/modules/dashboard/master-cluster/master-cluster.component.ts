import {Component, OnInit, OnDestroy, Input, ElementRef, HostListener} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {saveAs} from 'file-saver';
import {Subscription} from 'rxjs';
import {CommentModalComponent} from '../action/action.component';
import {CoreService} from '../../../services/core.service';
import {AuthService} from '../../../components/guard';
import {DataService} from '../../../services/data.service';
import * as _ from 'underscore';
import * as moment from 'moment';

declare const mxEditor;
declare const mxUtils;
declare const mxEvent;
declare const mxClient;
declare const mxEdgeHandler;
declare const mxGraphHandler;
declare const mxGraph;
declare const mxConstants;
declare const mxPoint;
declare const $;

@Component({
  selector: 'app-master-cluster',
  templateUrl: './master-cluster.component.html'
})
export class MasterClusterComponent implements OnInit, OnDestroy {
  @Input('sizeY') ybody: number;
  @Input() permission: any;
  isLoaded = false;
  clusterStatusData: any;
  preferences: any = {};
  schedulerIds: any = {};
  subscription: Subscription;
  selectedJobScheduler: any = {};
  editor: any;
  master: any;
  cluster: any;
  joc: any;
  configXml = './assets/mxgraph/config/diagram.xml';

  constructor(private authService: AuthService, public coreService: CoreService, private dataService: DataService,
              private elementRef: ElementRef, private translate: TranslateService, public modalService: NgbModal) {
    this.subscription = dataService.eventAnnounced$.subscribe(res => {
      this.refreshEvent(res);
    });
  }

  static colorCode(severity) {
    if (severity === 0) {
      return 'green';
    } else if (severity === 1) {
      return 'gold';
    } else if (severity === 2) {
      return 'crimson';
    } else if (severity === 3) {
      return 'grey';
    } else {
      return '#999';
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    setTimeout(() => {
      this.alignCenter();
    }, 20);
  }

  @HostListener('window:click', ['$event'])
  onClick() {
    this.closeActionMenu();
  }

  ngOnInit() {
    this.schedulerIds = JSON.parse(this.authService.scheduleIds);
    this.init();
    this.createEditor();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    try {
      if (this.editor) {
        this.editor.destroy();
        this.editor = null;
        $('[data-toggle="popover"]').popover('hide');
      }
    } catch (e) {
      console.log(e);
    }
  }

  init() {
    if (sessionStorage.preferences) {
      this.preferences = JSON.parse(sessionStorage.preferences);
    }
    if (sessionStorage.$SOS$JOBSCHEDULE && JSON.parse(sessionStorage.$SOS$JOBSCHEDULE)) {
      this.selectedJobScheduler = JSON.parse(sessionStorage.$SOS$JOBSCHEDULE) || {};
    }
    if (_.isEmpty(this.selectedJobScheduler)) {
      const interval = setInterval(() => {
        if (sessionStorage.$SOS$JOBSCHEDULE && JSON.parse(sessionStorage.$SOS$JOBSCHEDULE)) {
          this.selectedJobScheduler = JSON.parse(sessionStorage.$SOS$JOBSCHEDULE) || {};
          if (!_.isEmpty(this.selectedJobScheduler)) {
            clearInterval(interval);
          }
        }
        if (sessionStorage.preferences && JSON.parse(sessionStorage.preferences)) {
          this.preferences = JSON.parse(sessionStorage.preferences) || {};
        }
      }, 100);
    }
  }

  getClusterStatusData(): void {
    this.coreService.post('jobscheduler/components', {jobschedulerId: this.schedulerIds.selected}).subscribe((res: any) => {
      this.clusterStatusData = res;
      this.isLoaded = true;
      this.createWorkflowDiagram(this.editor.graph);
    }, (err) => {
      this.isLoaded = true;
    });
  }

  /**
   * Constructs a new application (returns an mxEditor instance)
   */
  createEditor() {
    let editor = null;
    try {
      if (!mxClient.isBrowserSupported()) {
        mxUtils.error('Browser is not supported!', 200, false);
      } else {
        const node = mxUtils.load(this.configXml).getDocumentElement();
        editor = new mxEditor(node);
        this.editor = editor;
        this.initEditorConf(editor);
        this.getClusterStatusData();
      }
    } catch (e) {
      console.log(e);
    }
  }

  /**
   * Function to override Mxgraph properties and functions
   */
  initEditorConf(editor) {
    const self = this;
    const graph = editor.graph;
    // Alt disables guides
    mxGraphHandler.prototype.guidesEnabled = true;
    mxGraph.prototype.cellsResizable = false;
    mxGraph.prototype.multigraph = false;
    mxGraph.prototype.allowDanglingEdges = false;
    mxGraph.prototype.cellsLocked = true;
    mxGraph.prototype.foldingEnabled = true;
    mxConstants.VERTEX_SELECTION_COLOR = null;
    mxConstants.EDGE_SELECTION_COLOR = null;
    mxConstants.GUIDE_COLOR = null;

    // Enables snapping waypoints to terminals
    mxEdgeHandler.prototype.snapToTerminals = true;

    graph.setConnectable(false);
    graph.setHtmlLabels(true);
    graph.setDisconnectOnMove(false);
    graph.setCellsSelectable(false);
    graph.collapseToPreferredSize = false;
    graph.constrainChildren = false;
    graph.extendParentsOnAdd = false;
    graph.extendParents = false;

    let labelState: any, labelClusterNodeState: any, labelClusterState: any,
       labelDatabase: any, labelArchitecture: any, labelDistribution: any,
      labelSurveyDate: any, labelVersion: any, labelStartedAt: any, labelUrl: any;

    this.translate.get('dashboard.label.componentState').subscribe(translatedValue => {
      labelState = translatedValue;
    });
    this.translate.get('dashboard.label.clusterState').subscribe(translatedValue => {
      labelClusterState = translatedValue;
    });
    this.translate.get('dashboard.label.clusterNodeState').subscribe(translatedValue => {
      labelClusterNodeState = translatedValue;
    });
    this.translate.get('label.database').subscribe(translatedValue => {
      labelDatabase = translatedValue;
    });
    this.translate.get('label.architecture').subscribe(translatedValue => {
      labelArchitecture = translatedValue;
    });
    this.translate.get('label.distribution').subscribe(translatedValue => {
      labelDistribution = translatedValue;
    });
    this.translate.get('label.surveyDate').subscribe(translatedValue => {
      labelSurveyDate = translatedValue;
    });
    this.translate.get('label.version').subscribe(translatedValue => {
      labelVersion = translatedValue;
    });
    this.translate.get('label.startedAt').subscribe(translatedValue => {
      labelStartedAt = translatedValue;
    });
    this.translate.get('label.url').subscribe(translatedValue => {
      labelUrl = translatedValue;
    });

    /**
     * Function: handle a click event
     */
    graph.addListener(mxEvent.CLICK, function (sender, evt) {
      self.closeActionMenu();
      let event = evt.getProperty('event');
      if (event.target.className && /cluster-action-menu/.test(event.target.className)) {
        $('[data-toggle="popover"]').popover('hide');
        let cell = evt.getProperty('cell'); // cell may be null
        if (cell != null) {
          let data = cell.getAttribute('data');
          data = JSON.parse(data);
          if (cell.value.tagName === 'Cluster') {
            self.cluster = data;
          } else if (cell.value.tagName === 'Master') {
            self.master = data;
          } else {
            self.joc = data;
          }
          $('#actionMenu').css({top: (event.clientY + 2) + 'px', left: (event.clientX - 12) + 'px', bottom: 'auto'})
            .removeClass('arrow-down reverse').addClass('dropdown-ac');
          window.addEventListener('scroll', () => {
            if (event.clientY) {
              $('#actionMenu').css({top: (event.clientY + 2) - window.scrollY + 'px'});
            }
          }, true);
          evt.consume();
        }
      }
    });

    graph.getTooltipForCell = function (cell) {
      return null;
    };

    /**
     * Overrides method to provide a cell label in the display
     * @param cell
     */
    graph.convertValueToString = function (cell) {
      if(!self.preferences.zone){
        return;
      }
      let data = cell.getAttribute('data');
      if (data) {
        data = JSON.parse(data);
      }
      if (!data) {
        return '';
      }
      let status = '-';
      if (!data.componentState) {
        data.componentState = {};
      } else {
        if (data.componentState._text) {
          self.translate.get(data.componentState._text).subscribe(translatedValue => {
            status = translatedValue;
          });
        }
      }
      let colorClass = self.coreService.getColor(data.componentState.severity, 'text');

      let className = 'cluster-rect';
      if (cell.value.tagName === 'Connection') {
        let c = 'connection text-sm';
        if (self.selectedJobScheduler && self.selectedJobScheduler.role === 'STANDALONE' && cell.getAttribute('data').length>2) {
          c += ' m-l-55';
        }
        return '<div class="' + c + '">' + cell.getAttribute('label') + '</div>';
      } else if (cell.value.tagName === 'DataBase') {
        className += ' database';
       // const popoverTemplate = '<span class="_600">' + labelSurveyDate + ' : </span>' + moment(data.surveyDate).tz(self.preferences.zone).format(self.preferences.dateFormat);
        return '<div' +
          ' class="' + className + '">' +
          '<span class="m-t-n-xxs fa fa-stop text-success success-node"></span>' +
          '<div class="text-left p-t-sm p-l-sm "><i class="fa fa-database"></i><span class="p-l-sm"> ' + data.dbms +
          '</span></div><div class="text-sm text-left p-t-xs p-b-xs p-l-sm ">' +
          '<span>' + data.version + '</span></div></div>';

      } else if (cell.value.tagName === 'JOCCockpit') {
        className += ' joc';
        const popoverTemplate = '<span class="_600">' + labelVersion + ' : </span>' + data.version;
        return '<div data-toggle="popover" data-placement="top" data-content=\'' + popoverTemplate + '\'' +
          ' class="' + className + '"   >' +
          '<span class="m-t-n-xxs fa fa-stop green success-node"></span>' +
          '<div class="text-left p-t-sm p-l-sm "><i class="fa fa-television"></i><span class="p-l-sm">JOC Cockpit' +
          '</span><span class="pull-right"><div class="btn-group dropdown " >' +
          '<a class="more-option" data-toggle="dropdown" ><i class="text fa fa-ellipsis-h cluster-action-menu"></i></a></div></span></div><div class="text-xs text-left p-t-xs p-b-xs p-l-sm ">' +
          '<span class="text-black-dk" >' + labelState + '</span>: ' +
          '<span class="text-sm ' + colorClass + '">' + status + '</span></div></div>';
      } else if (cell.value.tagName === 'Master') {
        let clusterNodeState = '-';
        if (data.clusterNodeState && data.clusterNodeState._text) {
          self.translate.get(data.clusterNodeState._text).subscribe(translatedValue => {
            clusterNodeState = translatedValue;
          });
        }
        const clusterNodeColorClass = data.clusterNodeState ? self.coreService.getColor(data.clusterNodeState.severity, 'text') : '';
        className += ' master';
        let d1 = ' - ', dis = ' - ', arc = ' - ';
        if (data.startedAt) {
          d1 = moment(data.startedAt).tz(self.preferences.zone).format(self.preferences.dateFormat);
        }
        if (data.os) {
          arc = data.os.architecture;
          dis = data.os.distribution;
        }
        const popoverTemplate = '<span class="_600">' + labelArchitecture + ' :</span> ' + arc +
          '<br> <span class="_600">' + labelDistribution + ' : </span>' + dis +
          '<br> <span class="_600">' + labelUrl + ' : </span>' + data.url +
          '<br><span class="_600">' + labelVersion + ' :</span>' + data.version +
          '<br><span class="_600">' + labelStartedAt + ' : </span>' + d1 +
          '<br><span class="_600">' + labelSurveyDate + ' : </span>' + moment(data.surveyDate).tz(self.preferences.zone).format(self.preferences.dateFormat);

        let masterTemplate = '<div data-toggle="popover" data-placement="right" data-content=\'' + popoverTemplate + '\'' +
          ' class="' + className + '">' +
          '<span class="m-t-n-xxs fa fa-stop success-node ' + colorClass + '"></span>' +
          '<div class="text-left p-t-sm p-l-sm "><span class="_600">' + data.title + '</span><span class="pull-right"><div class="btn-group dropdown " >' +
          '<a class="more-option" data-toggle="dropdown" ><i class="text fa fa-ellipsis-h cluster-action-menu"></i></a></div></span></div>';
        if (data.os) {
          masterTemplate = masterTemplate + '<div class="text-left p-t-xs p-l-sm block-ellipsis-cluster"><i class="fa fa-' + data.os.name.toLowerCase() + '"></i><span class="p-l-sm text-sm" title="' + data.jobschedulerId + '">' + data.jobschedulerId +
            '</span></div>';
        } else {
          masterTemplate = masterTemplate + '<div class="text-left p-t-xs p-l-sm block-ellipsis-cluster"><i></i><span class="p-l-sm text-sm" title="' + data.jobschedulerId + '">' + data.jobschedulerId +
            '</span></div>';
        }
        masterTemplate = masterTemplate + '<div class="text-sm text-left p-t-xs p-l-sm block-ellipsis-cluster"><a target="_blank" href="' + data.url + '" class="text-hover-primary">' + data.url + '</a></div>' +
          '<div class="text-left text-xs p-t-xs p-l-sm">' +
          '<span class="text-black-dk" >' + labelState + '</span>: ' +
          '<span class="text-sm ' + colorClass + '">' + status + '</span></div>';
        if (data.clusterNodeState) {
          masterTemplate = masterTemplate + '<div class="text-left text-xs p-b-xs p-l-sm">' +
            '<span class="text-black-dk" >' + labelClusterNodeState + '</span>: ' +
            '<span class="text-sm ' + clusterNodeColorClass + '">' + clusterNodeState + '</span></div>';
        }
        return masterTemplate + '</div>';
      } else {
        className = 'cluster';
        let status = '-';
        if (data._text) {
          self.translate.get(data._text).subscribe(translatedValue => {
            status = translatedValue;
          });
        }
        colorClass = self.coreService.getColor(data.severity, 'text');
        return '<div class="' + className + '">' +
          '<div class="text-left p-t-sm p-l-sm"><div class="block-ellipsis-cluster"><span class="text-black-dk" >' + labelClusterState + '</span>: <span class = "text-sm ' + colorClass + '" title="'+ status +'"> ' + status + '</span></div><span style="position: absolute;right: 6px;top:11px"><div class="btn-group dropdown " >' +
          '<a class="more-option" data-toggle="dropdown" ><i class="text fa fa-ellipsis-h cluster-action-menu"></i></a></div></span></div></div>';
      }
    };

    /**
     * Function: isCellMovable
     *
     * Returns true if the given cell is moveable.
     */
    graph.isCellMovable = function (cell) {
      return false;
    };

  }

  closeActionMenu() {
    this.master = null;
    this.cluster = null;
    this.joc = null;
  }

  reloadGraph() {
    this.onRefresh().subscribe((res) => {
      this.clusterStatusData = res;
      if (this.editor && this.editor.graph) {
        this.editor.graph.removeCells(this.editor.graph.getChildVertices(this.editor.graph.getDefaultParent()));
        this.createWorkflowDiagram(this.editor.graph);
      }
    }, () => {

    });
  }

  createWorkflowDiagram(graph) {
    graph.getModel().beginUpdate();
    try {
      let vertix, edgeColor, len = this.clusterStatusData.masters.length;
      let v1 = this.createVertex('DataBase', this.clusterStatusData.database.dbms, this.clusterStatusData.database, graph, len);
      let v2 = this.createVertex('JOCCockpit', 'JOC Cockpit', this.clusterStatusData.joc, graph, len);
      let _text = '-';
      if (this.clusterStatusData.database.connectionState._text) {
        this.translate.get(this.clusterStatusData.database.connectionState._text).subscribe(translatedValue => {
          _text = translatedValue;
        });
      }
      graph.insertEdge(graph.getDefaultParent(), null, this.getCellNode('Connection', _text, {}),
        v2, v1, 'strokeColor=' + MasterClusterComponent.colorCode(this.clusterStatusData.database.connectionState.severity));
      for (let i = 0; i < len; i++) {
        let v3 = this.createVertex('Master', this.clusterStatusData.masters[i].url, this.clusterStatusData.masters[i], graph, i);
        const color = MasterClusterComponent.colorCode(this.clusterStatusData.masters[i].connectionState.severity);
        let _text2 = '-';
        if (this.clusterStatusData.masters[i].connectionState._text) {
          this.translate.get(this.clusterStatusData.masters[i].connectionState._text).subscribe(translatedValue => {
            _text2 = translatedValue;
          });
        }
        let edge = graph.insertEdge(graph.getDefaultParent(), null, this.getCellNode('Connection', _text2, {master:true}),
          v2, v3, 'strokeColor=' + color);
        if (edge && len > 1) {
          if (i === 0) {
            edge.geometry.points = [new mxPoint(340, 100), new mxPoint(105, 100)];
          } else {
            edge.geometry.points = [new mxPoint(370, 100), new mxPoint(595, 100)];
          }
        }
        if (vertix && i > 0 && i === len - 1) {
          let v4 = this.createVertex('Cluster', 'Cluster', this.clusterStatusData.clusterState, graph, len);
          graph.insertEdge(graph.getDefaultParent(), null, this.getCellNode('Connection', '', {}),
            vertix, v4, 'strokeColor=' + edgeColor);
          graph.insertEdge(graph.getDefaultParent(), null, this.getCellNode('Connection', '', {}),
            v3, v4, 'strokeColor=' + color);
        }
        vertix = v3;
        edgeColor = color;
      }
    } catch (e) {
      console.error(e);
    } finally {
      // Updates the display
      graph.getModel().endUpdate();
    }
    setTimeout(() => {
      this.alignCenter();
    }, 0);
  }

  alignCenter() {
    $('[data-toggle="popover"]').popover('dispose');
    if (this.editor && this.editor.graph) {
      this.editor.graph.center(true, true, 0.5, 0.5);
      setTimeout(() => {
        $('[data-toggle="popover"]').popover({html: true, trigger: 'hover'});
      }, 20);
    }
  }

  /**
   * Function to create dom element
   */
  getCellNode(name, label, data) {
    const doc = mxUtils.createXmlDocument();
    // Create new node object
    const _node = doc.createElement(name);
    _node.setAttribute('label', label);
    _node.setAttribute('data', JSON.stringify(data));
    return _node;
  }

  createVertex(node, label, data, graph, index) {
    const doc = mxUtils.createXmlDocument();
    // Create new node object
    const _node = this.getCellNode(node, label, data);
    let style = ';master';
    let x = 0, y = 0, wt = 210, ht = 0;
    if (node === 'DataBase') {
      wt = 160;
      ht = 60;
      x = 325;
      if (index > 1) {
        x += 250;
      }
    } else if (node === 'JOCCockpit') {
      ht = 60;
      if (index > 1) {
        x = 250;
      }
    } else if (node === 'Master') {
      ht = this.clusterStatusData.masters.length > 1 ? 110 : 94;
      y = 150;
      if (index > 0) {
        x = 490;
      }
    } else {
      ht = 40;
      y = 185;
      x = 245;
    }
    return graph.insertVertex(graph.getDefaultParent(), null, _node, x, y, wt, ht, style);
  }

  /*  ------------------ Actions -----------------------*/
  clusterAction(action, master, isFailOver) {
    this.master = null;
    this.cluster = null;
    let obj = {
      jobschedulerId: this.schedulerIds.selected,
      url: master.url,
      withFailover: isFailOver,
      auditLog: {}
    };

    if (this.preferences.auditLog && (action !== 'download')) {
      let comments = {
        radio: 'predefined',
        name: obj.jobschedulerId + ' (' + obj.url + ')',
        operation: (action === 'terminate' && !isFailOver) ? 'Terminate without fail-over' : action === 'terminateAndRestart' ? 'Terminate and Restart' : action === 'abortAndRestart' ? 'Abort and Restart' : action === 'terminate' ? 'Terminate' : action === 'abort' ? 'Abort' : 'Switch Over'
      };

      const modalRef = this.modalService.open(CommentModalComponent, {backdrop: 'static'});
      modalRef.componentInstance.comments = comments;
      modalRef.componentInstance.action = action;
      modalRef.componentInstance.show = true;
      modalRef.componentInstance.obj = obj;
      modalRef.componentInstance.performAction = this.performAction;

      modalRef.result.then((result) => {
        console.log('Close...', result);
      }, (reason) => {
        console.log('close...', reason);
      });

    } else {
      this.performAction(action, obj, isFailOver);
    }
  }

  performAction(action, obj, isFailOver): void {
    if (obj === null) {
      obj = {};
      obj.jobschedulerId = this.schedulerIds.selected;
      obj.withFailover = isFailOver;
      obj.auditLog = {};
    }
    if (action === 'terminate') {
      this.postCall('jobscheduler/terminate', obj);
    } else if (action === 'abort') {
      this.postCall('jobscheduler/abort', obj);
    } else if (action === 'abortAndRestart') {
      this.postCall('jobscheduler/abort_and_restart', obj);
    } else if (action === 'terminateAndRestart') {
      this.postCall('jobscheduler/restart', obj);
    } else if (action === 'switchover') {
      let obj1 = {
        jobschedulerId: this.schedulerIds.selected,
        auditLog: {}
      };
      this.postCall('jobscheduler/cluster/switchover', obj1);
    } else if (action === 'download') {
      this.coreService.post('jobscheduler/log', {jobschedulerId: obj.jobschedulerId, url: obj.url}).subscribe(res => {
        this.saveToFileSystem(res, obj);
      });
    }
  }

  private refreshEvent(args) {
    for (let i = 0; i < args.length; i++) {
      if (args[i].jobschedulerId === this.schedulerIds.selected) {
        if (args[i].eventSnapshots && args[i].eventSnapshots.length > 0) {
          for (let j = 0; j < args[i].eventSnapshots.length; j++) {
            if (args[i].eventSnapshots[j].eventType === 'SchedulerStateChanged') {
              this.reloadGraph();
              break;
            }
          }
        }
        break;
      }
    }
  }

  downloadJocLog() {
    $('#tmpFrame').attr('src', './api/log?accessToken=' + this.permission.accessToken);
  }


  private onRefresh(): any {
    return this.coreService.post('jobscheduler/components', {jobschedulerId: this.schedulerIds.selected});
  }


  private postCall(url, obj) {
    this.coreService.post(url, obj).subscribe(res => {
    });
  }


  private saveToFileSystem(res, obj) {
    let name = 'jobscheduler.' + obj.jobschedulerId + '.main.log';
    let fileType = 'application/octet-stream';

    if (res.headers('Content-Disposition') && /filename=(.+)/.test(res.headers('Content-Disposition'))) {
      name = /filename=(.+)/.exec(res.headers('Content-Disposition'))[1];
    }
    if (res.headers('Content-Type')) {
      fileType = res.headers('Content-Type');
    }
    const data = new Blob([res.data], {type: fileType});
    saveAs(data, name);

  }
}


