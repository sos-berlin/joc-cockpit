import {Component, OnInit, OnDestroy, Input, ElementRef, HostListener, ViewChild} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {saveAs} from 'file-saver';
import {Subscription} from 'rxjs';
import * as _ from 'underscore';
import * as moment from 'moment';
import {NzContextMenuService, NzDropdownMenuComponent} from 'ng-zorro-antd';
import {CommentModalComponent} from '../action/action.component';
import {CoreService} from '../../../services/core.service';
import {AuthService} from '../../../components/guard';
import {DataService} from '../../../services/data.service';

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
  selector: 'app-controller-cluster',
  templateUrl: './controller-cluster.component.html'
})
export class ControllerClusterComponent implements OnInit, OnDestroy {
  @Input('sizeY') ybody: number;
  @Input() permission: any;
  isLoaded = false;
  isDataLoaded = false;
  clusterStatusData: any;
  preferences: any = {};
  schedulerIds: any = {};
  subscription: Subscription;
  selectedJobScheduler: any = {};
  editor: any;
  controller: any;
  cluster: any;
  joc: any;
  configXml = './assets/mxgraph/config/diagram.xml';
  @ViewChild('menu', {static: true}) menu: NzDropdownMenuComponent;

  constructor(private authService: AuthService, public coreService: CoreService, private dataService: DataService,
              private elementRef: ElementRef, private translate: TranslateService, public modalService: NgbModal,
              private nzContextMenuService: NzContextMenuService) {
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

  ngOnInit() {
    this.schedulerIds = JSON.parse(this.authService.scheduleIds) || {};
    if (this.schedulerIds.selected) {
      this.init();
      this.createEditor();
    } else {
      this.isLoaded = true;
    }
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
      this.clusterStatusData.clusterStateJOC = {
        "_text": "ClusterCoupled",
        "severity": 0
      };
      if (this.editor) {
        this.createWorkflowDiagram(this.editor.graph);
      }
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
      labelSurveyDate: any, labelVersion: any, labelStartedAt: any, labelUrl: any, labelSecurity: any;

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
    this.translate.get('label.security').subscribe(translatedValue => {
      labelSecurity = translatedValue;
    });

    /**
     * Function: handle a click event
     */
    graph.addListener(mxEvent.CLICK, function (sender, evt) {
      let event = evt.getProperty('event');
      if (event.target.className && /cluster-action-menu/.test(event.target.className)) {
        $('[data-toggle="popover"]').popover('hide');
        let cell = evt.getProperty('cell'); // cell may be null
        if (cell != null) {
          self.cluster = null;
          self.controller = null;
          self.joc = null;
          let data = cell.getAttribute('data');
          data = JSON.parse(data);
          if (cell.value.tagName === 'Cluster') {
            self.cluster = data;
          } else if (cell.value.tagName === 'Controller') {
            self.controller = data;
          } else {
            self.joc = data;
          }
          self.menu.open = true;
          setTimeout(() => {
            self.nzContextMenuService.create(event, self.menu);
          }, 0);
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
      if (!self.preferences.zone) {
        return;
      }
      let data = cell.getAttribute('data');
      if (data && data != 'undefined') {
        data = JSON.parse(data);
      }
      if (!data || data == 'undefined') {
        return '';
      }
      let status = '-';
      let security = '-';
      let clusterNodeState = '-';
      if (!data.componentState) {
        data.componentState = {};
      } else {
        if (data.componentState._text) {
          self.translate.get(data.componentState._text).subscribe(translatedValue => {
            status = translatedValue;
          });
        }
      }
      if (data.securityLevel) {
        self.translate.get(data.securityLevel).subscribe(translatedValue => {
          security = translatedValue;
        });
      }
      if (data.clusterNodeStateJoc) {
        self.translate.get(data.clusterNodeStateJoc).subscribe(translatedValue => {
          clusterNodeState = translatedValue;
        });
      }

      let colorClass = self.coreService.getColor(data.componentState.severity, 'text');
      let clusterColorClass = self.coreService.getColor(data.componentState.custerNodeSate, 'text');

      let className = 'cluster-rect';
      if (cell.value.tagName === 'Connection') {
        let c = 'connection text-sm';
        if (self.selectedJobScheduler && self.selectedJobScheduler.role === 'STANDALONE' && cell.getAttribute('data').length > 2) {
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
        let d1 = ' - ', dis = ' - ', arc = ' - ';
        if (data.startedAt) {
          d1 = moment(data.startedAt).tz(self.preferences.zone).format(self.preferences.dateFormat);
        }
        if (data.clusterNodeState && data.clusterNodeState._text) {
          self.translate.get(data.clusterNodeState._text).subscribe(translatedValue => {
            clusterNodeState = translatedValue;
          });
        }
        if (data.os) {
          arc = data.os.architecture;
          dis = data.os.distribution;
        }
        const popoverTemplate = '<span class="_600">' + labelArchitecture + ' :</span> ' + arc +
          '<br> <span class="_600">' + labelDistribution + ' : </span>' + dis +
          '<br><span class="_600">' + labelVersion + ' :</span>' + data.version +
          '<br><span class="_600">' + labelStartedAt + ' : </span>' + d1 +
          '<br><span class="_600">' + labelSurveyDate + ' : </span>' + moment(data.surveyDate).tz(self.preferences.zone).format(self.preferences.dateFormat);
        return '<div data-toggle="popover" data-placement="top" data-content=\'' + popoverTemplate + '\'' +
          ' class="' + className + '"   >' +
          '<span class="m-t-n-xxs fa fa-stop green success-node"></span>' +
          '<div class="text-left p-t-sm p-l-sm "><i class="fa fa-television"></i><span class="p-l-sm">' + data.title +
          '</span><span class="pull-right"><div class="btn-group dropdown " >' +
          '<a class="more-option" data-toggle="dropdown" ><i class="text fa fa-ellipsis-h cluster-action-menu"></i></a></div></span></div><div class="text-xs text-left p-t-xs p-l-sm ">' +
          '<span class="text-black-dk" >' + labelUrl + '</span>: ' +
          '<span class="text-sm ' + '">' + data.host + '</span></div>' +
          '<div class="text-left text-xs p-l-sm "><span class="text-black-dk" >' + labelSecurity + '</span>: ' +
          '<span class="text-sm ' + '">' + security + '</span></div>' +
          '<div class="text-left text-xs p-l-sm "><span class="text-black-dk" >' + labelState + '</span>: ' +
          '<span class="text-sm ' + colorClass + '">' + status + '</span></div>' +
          '<div class="text-left text-xs p-l-sm "><span class="text-black-dk" >' + labelClusterNodeState + '</span>: ' +
          '<span class="text-sm ' + clusterColorClass + '">' + clusterNodeState + '</span></div></div>';
      } else if (cell.value.tagName === 'Controller') {
        if (data.clusterNodeState && data.clusterNodeState._text) {
          self.translate.get(data.clusterNodeState._text).subscribe(translatedValue => {
            clusterNodeState = translatedValue;
          });
        }
        const clusterNodeColorClass = data.clusterNodeState ? self.coreService.getColor(data.clusterNodeState.severity, 'text') : '';
        className += ' controller';
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

        let controllerTemplate = '<div data-toggle="popover" data-placement="top" data-content=\'' + popoverTemplate + '\'' +
          ' class="' + className + '">' +
          '<span class="m-t-n-xxs fa fa-stop success-node ' + colorClass + '"></span>' +
          '<div class="text-left p-t-sm p-l-sm "><span class="_600">' + data.title + '</span><span class="pull-right"><div class="btn-group dropdown " >' +
          '<a class="more-option" data-toggle="dropdown" ><i class="text fa fa-ellipsis-h cluster-action-menu"></i></a></div></span></div>';
        if (data.os) {
          let name = data.os.name ? data.os.name.toLowerCase() : '';
          controllerTemplate = controllerTemplate + '<div class="text-left p-t-xs p-l-sm block-ellipsis-cluster"><i class="fa fa-' + name + '"></i><span class="p-l-sm text-sm" title="' + data.jobschedulerId + '">' + data.jobschedulerId +
            '</span></div>';
        } else {
          controllerTemplate = controllerTemplate + '<div class="text-left p-t-xs p-l-sm block-ellipsis-cluster"><i></i><span class="p-l-sm text-sm" title="' + data.jobschedulerId + '">' + data.jobschedulerId +
            '</span></div>';
        }
        controllerTemplate = controllerTemplate + '<div class="text-sm text-left p-t-xs p-l-sm block-ellipsis-cluster"><a target="_blank" href="' + data.url + '" class="text-hover-primary">' + data.url + '</a></div>' +
          '<div class="text-left text-xs p-t-xs p-l-sm">' +
          '<span class="text-black-dk" >' + labelState + '</span>: ' +
          '<span class="text-sm ' + colorClass + '">' + status + '</span></div>';
        if (data.clusterNodeState) {
          controllerTemplate = controllerTemplate + '<div class="text-left text-xs p-b-xs p-l-sm">' +
            '<span class="text-black-dk" >' + labelClusterNodeState + '</span>: ' +
            '<span class="text-sm ' + clusterNodeColorClass + '">' + clusterNodeState + '</span></div>';
        }
        return controllerTemplate + '</div>';
      } else if (cell.value.tagName === 'Cluster') {
        className = 'cluster';
        let status = '-';
        if (data._text) {
          self.translate.get(data._text).subscribe(translatedValue => {
            status = translatedValue;
          });
        }
        colorClass = self.coreService.getColor(data.severity, 'text');
        return '<div class="' + className + '">' +
          '<div class="text-left p-t-sm p-l-sm"><div class="block-ellipsis-cluster"><span class="text-black-dk" >' + labelClusterState + '</span>: <span class = "text-sm ' + colorClass + '" title="' + status + '"> ' + status + '</span></div><span style="position: absolute;right: 6px;top:11px"><div class="btn-group dropdown " >' +
          '<a class="more-option" data-toggle="dropdown" ><i class="text fa fa-ellipsis-h cluster-action-menu"></i></a></div></span></div></div>';
      } else if (cell.value.tagName === 'Junction') {
        className = 'joint';
        if (data.length == 3 || data.length == 5) {
          className += ' m-t-0';
        }
        return '<div class="' + className + '"></div>';
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

  reloadGraph() {
    this.onRefresh().subscribe((res) => {
      this.clusterStatusData = res;
      if (this.editor && this.editor.graph && !this.isDataLoaded) {
        this.editor.graph.removeCells(this.editor.graph.getChildVertices(this.editor.graph.getDefaultParent()));
        this.createWorkflowDiagram(this.editor.graph);
      }
      this.isDataLoaded = true;
    }, () => {
      this.isDataLoaded = true;
    });
  }

  createWorkflowDiagram(graph) {
    graph.getModel().beginUpdate();
    try {
      this.isLoaded = true;
      let vertix, edgeColor, len = this.clusterStatusData.controllers.length;
      const db1 = this.createVertex('DataBase', this.clusterStatusData.database.dbms, this.clusterStatusData.database, graph, len, undefined);
      let v4;
      let joint;
      if (this.clusterStatusData.jocs.length > 1) {
        v4 = this.createVertex('Cluster', 'Cluster JOC', this.clusterStatusData.clusterStateJOC, graph, len, undefined);
        if (len > 1) {
          joint = this.createVertex('Junction', 'Junction', this.clusterStatusData.jocs, graph, len, this.clusterStatusData.jocs.length);
        }
      }
      let x = this.clusterStatusData.jocs.length;
      let v2Copy;
      for (let i = 0; i < this.clusterStatusData.jocs.length; i++) {
        const color = ControllerClusterComponent.colorCode(this.clusterStatusData.jocs[i].componentState.severity);
        let v2 = this.createVertex('JOCCockpit', 'JOC Cockpit' + (i + 1), this.clusterStatusData.jocs[i], graph, i, this.clusterStatusData.jocs.length);
        this.clusterStatusData.jocs[i].vertex = v2;
        let _text = '-';
        if (this.clusterStatusData.database.connectionState._text) {
          this.translate.get(this.clusterStatusData.database.connectionState._text).subscribe(translatedValue => {
            _text = translatedValue;
          });
        }
        let edge = graph.insertEdge(graph.getDefaultParent(), null, this.getCellNode('Connection', _text, {}),
          v2, db1, 'strokeColor=' + ControllerClusterComponent.colorCode(this.clusterStatusData.database.connectionState.severity));
        if (this.clusterStatusData.jocs.length > 1) {
          if (i % 2 === 0) {
            if (i !== this.clusterStatusData.jocs.length - 1) {
              edge.geometry.points = [new mxPoint(v2.geometry.x + 105, i === 0 ? 40 : 48)];
            } else {
              edge.geometry.points = [new mxPoint(v2.geometry.x + 230, this.clusterStatusData.jocs.length > 3 ? 56 : 50)];
            }
          } else {
            if (this.clusterStatusData.jocs.length > 3) {
              edge.geometry.points = [new mxPoint(v2.geometry.x + 105, i == 1 ? 64 : 72)];
            } else {
              edge.geometry.points = [new mxPoint(v2.geometry.x + 105, 60)];
            }
          }
          if (joint) {
            let _text2 = '-';
            if (this.clusterStatusData.jocs[i].connectionState._text) {
              this.translate.get(this.clusterStatusData.jocs[i].connectionState._text).subscribe(translatedValue => {
                _text2 = translatedValue;
              });
            }
            const jointEdge = graph.insertEdge(graph.getDefaultParent(), null, this.getCellNode('Connection', _text2, {}),
              v2, joint, 'strokeColor=' + ControllerClusterComponent.colorCode(this.clusterStatusData.jocs[i].connectionState.severity));
            if (this.clusterStatusData.jocs.length > 2) {
              jointEdge.geometry.points = [new mxPoint(v2.geometry.x + 105, 410)];
            } else if (this.clusterStatusData.jocs.length === 2) {
              jointEdge.geometry.points = [new mxPoint(v2.geometry.x + 105, 260)];
            } else {
              jointEdge.geometry.points = [new mxPoint(v2.geometry.x + 105, 240)];
            }
          }
          if (x && i > 0) {
            if(graph.getEdgesBetween(x, v4).length === 0) {
              graph.insertEdge(graph.getDefaultParent(), null, this.getCellNode('Connection', '', {}),
                x, v4, 'strokeColor=' + edgeColor);
            }
            if(graph.getEdgesBetween(v2, v4).length === 0) {
              graph.insertEdge(graph.getDefaultParent(), null, this.getCellNode('Connection', '', {}),
                v2, v4, 'strokeColor=' + color);
            }
          }
          x = v2;
          edgeColor = color;
        }
        if (this.clusterStatusData.jocs.length === 1) {
          v2Copy = v2;
        }
      }
      for (let i = 0; i < len; i++) {
        let v3 = this.createVertex('Controller', this.clusterStatusData.controllers[i].url, this.clusterStatusData.controllers[i], graph, i, this.clusterStatusData.jocs.length);
        const color = ControllerClusterComponent.colorCode(this.clusterStatusData.controllers[i].connectionState.severity);
        let _text2 = '-';
        if (this.clusterStatusData.controllers[i].connectionState._text) {
          this.translate.get(this.clusterStatusData.controllers[i].connectionState._text).subscribe(translatedValue => {
            _text2 = translatedValue;
          });
        }
        if (joint) {
          const jEdge = graph.insertEdge(graph.getDefaultParent(), null, this.getCellNode('Connection', _text2, {controller: true}),
            joint, v3, 'strokeColor=' + color);
          if (len > 1) {
            jEdge.geometry.points = [new mxPoint(v3.geometry.x + 105, joint.geometry.y + 30)];
          }
        } else if(v2Copy){
          const cEdge = graph.insertEdge(graph.getDefaultParent(), null, this.getCellNode('Connection', _text2, {controller: true}),
            v2Copy, v3, 'strokeColor=' + color);
          if (this.clusterStatusData.controllers.length > 1 && i === 0) {
            cEdge.geometry.points = [new mxPoint(v2Copy.geometry.x + 90, 260), new mxPoint(v3.geometry.x + 105, 260)];
          } else if (cEdge && this.clusterStatusData.controllers.length > 1) {
            cEdge.geometry.points = [new mxPoint(v2Copy.geometry.x + 120, 260), new mxPoint(v3.geometry.x + 105, 260)];
          }
        } else {
          for (let j = 0; j < this.clusterStatusData.jocs.length; j++) {
            const j1 = this.clusterStatusData.jocs[j].vertex;
            const e = graph.insertEdge(graph.getDefaultParent(), null, this.getCellNode('Connection', _text2, {controller: true}),
              j1, v3, 'strokeColor=' + color);
            if (this.clusterStatusData.jocs.length > 2) {
              e.geometry.points = [new mxPoint(j1.geometry.x + 105, 380)];
            } else {
              e.geometry.points = [new mxPoint(j1.geometry.x + 105, 300)];
            }
          }
        }
        if (vertix && i > 0 && i === len - 1) {
          let v4 = this.createVertex('Cluster', 'Cluster', this.clusterStatusData.clusterState, graph, len, this.clusterStatusData.jocs.length);
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
      if (this.clusterStatusData && this.clusterStatusData.jocs && this.clusterStatusData.jocs.length === 1) {
        this.editor.graph.center(true, true, 0.5, 0.5);
      } else {
        this.editor.graph.center(true, true, 0.5, 0);
      }
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

  createVertex(node, label, data, graph, index, len) {
    const doc = mxUtils.createXmlDocument();
    // Create new node object
    const _node = this.getCellNode(node, label, data);
    let style = ';controller';
    let x = 0, y = 0, wt = 210, ht = 0;
    if (node === 'DataBase') {
      wt = 160;
      ht = 60;
      x = (this.clusterStatusData.jocs.length > 1 && index <= 1) ? 900 : 600;
      y = (this.clusterStatusData.jocs.length == 1) ? 140 : 20;
      if (index > 1) {
        x += 300;
      }
    } else if (node === 'JOCCockpit') {
      ht = 100;
      if (len > 1) {
        if (len % 2 == 0 || index != len - 1) {
          if (this.clusterStatusData.jocs.length < 5) {
            x = index % 2 === 0 ? 250 : 750;
          } else {
            if (index % 2 === 0) {
              x = index == 0 ? 0 : 750;
            } else {
              x = index == 1 ? 250 : 1000;
            }
          }
          y = 120;
        } else {
          y = 120;
          if (index == 2 || index == 4 || index == 6) {
            y = 250;
          }
          x = 500;
        }
      } else {
        x = (this.clusterStatusData.controllers.length > 1) ? 500 : 250;
        y = 120;
      }
    } else if (node === 'Controller') {
      ht = this.clusterStatusData.controllers.length > 1 ? 110 : 94;
      if (len > 1) {
        if (this.clusterStatusData.controllers.length > 1) {
          y = ((len === 2) ? 80 : 140) + (120 * 3);
        } else {
          if (len > 2) {
            y = 420;
          } else {
            y = 250;
          }
        }
      } else {
        if (len === 1) {
          y = 300;
        } else {
          y = 220;
        }
      }
      if (index > 0) {
        x = ((2 + 1) * 250);
      } else {
        x = (this.clusterStatusData.controllers.length > 1 || len == 1) ? 250 : 500;
      }
    } else if (label === 'Cluster JOC') {
      ht = 40;
      y = 150;
      x = 500;
    } else if (node === 'Junction') {
      style = 'circle';
      ht = 40;
      wt = 40;
      x = 585;
      if (len > 2) {
        y = 400;
      } else {
        y = 250;
      }
    } else {
      ht = 40;
      if (len > 1) {
        y = ((len == 2) ? 115 : 175) + (120 * 3);
      } else {
        if (len === 1) {
          y = 335;
        } else {
          y = 120 + 135;
        }
      }
      x = 500;
    }
    return graph.insertVertex(graph.getDefaultParent(), null, _node, x, y, wt, ht, style);
  }

  /*  ------------------ Actions -----------------------*/
  clusterAction(action, controller, isFailOver) {
    this.controller = null;
    this.cluster = null;
    let obj = {
      jobschedulerId: this.schedulerIds.selected,
      url: controller.url,
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
            if (args[i].eventSnapshots[j].eventType === 'SchedulerStateChanged' ||
              args[i].eventSnapshots[j].eventType === 'CurrentJobSchedulerChanged') {
              this.isDataLoaded = false;
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
