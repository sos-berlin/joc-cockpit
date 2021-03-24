import {Component, OnInit, OnDestroy, Input, ElementRef, HostListener, ViewChild} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {NzContextMenuService, NzDropdownMenuComponent} from 'ng-zorro-antd/dropdown';
import {Subscription} from 'rxjs';
import * as _ from 'underscore';
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
  selectedController: any = {};
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

  static colorCode(severity): string {
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
  onResize(): void {
    setTimeout(() => {
      this.alignCenter();
    }, 20);
  }

  ngOnInit(): void {
    this.schedulerIds = JSON.parse(this.authService.scheduleIds) || {};
    if (this.schedulerIds.selected) {
      this.init();
    } else {
      this.isLoaded = true;
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    try {
      if (this.editor) {
        this.editor.destroy();
        this.editor = null;
        $('[data-toggle="popover"]').popover('hide');
      }
    } catch (e) {
      console.error(e);
    }
  }

  init(): void {
    if (sessionStorage.preferences) {
      this.preferences = JSON.parse(sessionStorage.preferences);
    }
    if (sessionStorage.$SOS$CONTROLLER && JSON.parse(sessionStorage.$SOS$CONTROLLER)) {
      this.selectedController = JSON.parse(sessionStorage.$SOS$CONTROLLER) || {};
    }
    if (_.isEmpty(this.selectedController)) {
      const interval = setInterval(() => {
        if (sessionStorage.$SOS$CONTROLLER && JSON.parse(sessionStorage.$SOS$CONTROLLER)) {
          this.selectedController = JSON.parse(sessionStorage.$SOS$CONTROLLER) || {};
          if (!_.isEmpty(this.selectedController)) {
            clearInterval(interval);
          }
        }
        if (sessionStorage.preferences && JSON.parse(sessionStorage.preferences)) {
          this.preferences = JSON.parse(sessionStorage.preferences) || {};
        }
      }, 100);
    }
    this.getClusterStatusData();
  }

  getClusterStatusData(): void {
    this.coreService.post('controller/components', {controllerId: this.schedulerIds.selected}).subscribe((res: any) => {
      this.clusterStatusData = res;
      if (this.editor) {
        this.createWorkflowDiagram(this.editor.graph);
      } else{
        this.createEditor();
      }
    }, (err) => {
      this.isLoaded = true;
    });
  }

  /**
   * Constructs a new application (returns an mxEditor instance)
   */
  createEditor(): void {
    let editor = null;
    try {
      if (!mxClient.isBrowserSupported()) {
        mxUtils.error('Browser is not supported!', 200, false);
      } else {
        const node = mxUtils.load(this.configXml).getDocumentElement();
        editor = new mxEditor(node);
        this.editor = editor;
        this.initEditorConf(editor);
        this.createWorkflowDiagram(this.editor.graph);
      }
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * Function to override Mxgraph properties and functions
   */
  initEditorConf(editor): void {
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
      labelDatabase: any, labelArchitecture: any, labelDistribution: any, labelControllerId: any,
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
    this.translate.get('dashboard.label.database').subscribe(translatedValue => {
      labelDatabase = translatedValue;
    });
    this.translate.get('dashboard.label.architecture').subscribe(translatedValue => {
      labelArchitecture = translatedValue;
    });
    this.translate.get('dashboard.label.distribution').subscribe(translatedValue => {
      labelDistribution = translatedValue;
    });
    this.translate.get('dashboard.label.surveyDate').subscribe(translatedValue => {
      labelSurveyDate = translatedValue;
    });
    this.translate.get('dashboard.label.version').subscribe(translatedValue => {
      labelVersion = translatedValue;
    });
    this.translate.get('dashboard.label.startedAt').subscribe(translatedValue => {
      labelStartedAt = translatedValue;
    });
    this.translate.get('dashboard.label.url').subscribe(translatedValue => {
      labelUrl = translatedValue;
    });
    this.translate.get('dashboard.label.securityLevel').subscribe(translatedValue => {
      labelSecurity = translatedValue;
    });
    this.translate.get('dashboard.label.controllerId').subscribe(translatedValue => {
      labelControllerId = translatedValue;
    });
    /**
     * Function: handle a click event
     */
    graph.addListener(mxEvent.CLICK, (sender, evt) => {
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

          setTimeout(() => {
            self.nzContextMenuService.create(event, self.menu);
          }, 0);
          evt.consume();
        }
      }
    });

    graph.getTooltipForCell = (cell) => {
      return null;
    };

    /**
     * Overrides method to provide a cell label in the display
     * @param cell
     */
    graph.convertValueToString = (cell) => {
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
      let clusterColorClass = data.clusterNodeState ? self.coreService.getColor(data.clusterNodeState.severity, 'text') : '';

      let className = 'cluster-rect';
      if (cell.value.tagName === 'Connection') {
        let c = 'connection text-sm';
        if (data.length > 3) {
          if (data.index == 1) {
            c += ' p-l-55';
          } else if (data.index == 0) {
            c += ' m-t-22';
          }
        }
        return '<div class="' + c + '">' + cell.getAttribute('label') + '</div>';
      } else if (cell.value.tagName === 'DataBase') {
        className += ' database';
        return '<div class="' + className + '">' +
          '<span class="m-t-n-xxs fa fa-stop text-success success-node"></span>' +
          '<div class="text-left p-t-sm p-l-sm "><i class="fa fa-database"></i><span class="p-l-sm"> ' + data.dbms +
          '</span></div><div class="text-sm text-left p-t-xs p-b-xs p-l-sm ">' +
          '<span>' + data.version + '</span></div></div>';
      } else if (cell.value.tagName === 'JOCCockpit') {
        className += ' joc';
        let d1 = ' - ', dis = ' - ', arc = ' - ';
        if (data.startedAt) {
          d1 = self.coreService.stringToDate(self.preferences, data.startedAt);
        }
        if (data.current) {
          className += ' current';
        }

        if (data.clusterNodeState && data.clusterNodeState._text) {
          self.translate.get(data.clusterNodeState._text).subscribe(translatedValue => {
            clusterNodeState = translatedValue;
          });
        }
        let name;
        if (data.os) {
          arc = data.os.architecture;
          dis = data.os.distribution;
          name = data.os.name ? data.os.name.toLowerCase() : '';
        }
        let actionMenuCls = '';
        if (!data.current && data.clusterNodeState._text == 'active') {
          actionMenuCls = ' hide';
        }
        const popoverTemplate = '<span class="_600">' + labelArchitecture + ' :</span> ' + arc +
          '<br> <span class="_600">' + labelDistribution + ' : </span>' + dis +
          '<br><span class="_600">' + labelVersion + ' :</span>' + data.version +
          '<br><span class="_600">' + labelStartedAt + ' : </span>' + d1 +
          '<br><span class="_600">' + labelSurveyDate + ' : </span>' + self.coreService.stringToDate(self.preferences, data.surveyDate);

        let str = '<div data-toggle="popover" data-placement="top" data-content=\'' + popoverTemplate + '\'' +
          ' class="' + className + '"   >' +
          '<span class="m-t-n-xxs fa fa-stop success-node ' + colorClass + '"></span>' +
          '<div class="text-left p-t-sm p-l-sm "><i class="fa fa-television"></i><span class="p-l-sm _600">' + data.title +
          '</span><span class="pull-right ' + actionMenuCls + ' "><div class="btn-group dropdown " >' +
          '<a class="more-option" data-toggle="dropdown" ><i class="text fa fa-ellipsis-h cluster-action-menu"></i></a></div></span></div>' +
          '<div class="text-left p-t-xs p-l-sm block-ellipsis-cluster"><i class="fa fa-' + name
          + '"></i>';

        if (data.url && !data.current) {
          str += '<a class="p-l-sm text-sm" target="_blank" href="' + data.url + '" title="' + (data.url || data.host) + '">' + (data.url || data.host) + '</a>';
        } else {
          str += '<span class="p-l-sm text-sm" title="' + (data.url || data.host) + '">' + (data.url || data.host) + '</span>';
        }
        str += '</div>' +
          '<div class="text-left text-xs p-l-sm "><span class="text-black-dk" >' + labelSecurity + '</span>: ' +
          '<span class="text-sm ' + '">' + security + '</span></div>' +
          '<div class="text-left text-xs p-l-sm "><span class="text-black-dk" >' + labelState + '</span>: ' +
          '<span class="text-sm ' + colorClass + '">' + status + '</span></div>' +
          '<div class="text-left text-xs p-l-sm "><span class="text-black-dk" >' + labelClusterNodeState + '</span>: ' +
          '<span class="text-sm ' + clusterColorClass + '">' + clusterNodeState + '</span></div></div>'

        return str;
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
          d1 = self.coreService.stringToDate(self.preferences, data.startedAt);
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
          '<br><span class="_600">' + labelSurveyDate + ' : </span>' + self.coreService.stringToDate(self.preferences, data.surveyDate);

        let controllerTemplate = '<div data-toggle="popover" data-placement="top" data-content=\'' + popoverTemplate + '\'' +
          ' class="' + className + '">' +
          '<span class="m-t-n-xxs fa fa-stop success-node ' + colorClass + '"></span>' +
          '<div class="text-left p-t-sm p-l-sm "><i class="fa fa-tasks"></i><span class="p-l-sm _600">' + data.title + '</span><span class="pull-right"><div class="btn-group dropdown " >' +
          '<a class="more-option" data-toggle="dropdown" ><i class="text fa fa-ellipsis-h cluster-action-menu"></i></a></div></span></div>';
        if (data.os) {
          let name = data.os.name ? data.os.name.toLowerCase() : '';
          controllerTemplate = controllerTemplate + '<div class="text-left p-t-xs p-l-sm block-ellipsis-cluster"><i class="fa fa-' + name + '"></i><span class="p-l-sm text-sm" title="' + data.url + '">' + data.url +
            '</span></div>';
        } else {
          controllerTemplate = controllerTemplate + '<div class="text-left p-t-xs p-l-sm block-ellipsis-cluster"><i></i><span class="p-l-sm text-sm" title="' + data.url + '">' + data.url +
            '</span></div>';
        }
        controllerTemplate = controllerTemplate + '<div class="text-xs text-left p-t-xs  p-l-sm block-ellipsis-cluster" style="width: 99%">' +
          '<span class="text-black-dk" >' + labelControllerId + '</span>: <span class="text-sm">' + data.controllerId + '</span></div>' +
          '<div class="text-left text-xs p-t-xs p-l-sm"><span class="text-black-dk" >' + labelState + '</span>: ' +
          '<span class="text-sm ' + colorClass + '">' + status + '</span></div>';
        if (data.clusterNodeState) {
          controllerTemplate = controllerTemplate + '<div class="text-left text-xs p-t-xs p-l-sm">' +
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
      }
    };

    /**
     * Function: isCellMovable
     *
     * Returns true if the given cell is moveable.
     */
    graph.isCellMovable = (cell) => {
      return false;
    };
  }

  reloadGraph(): void {
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

  createWorkflowDiagram(graph): void {
    graph.getModel().beginUpdate();
    try {
      this.isLoaded = true;
      let vertix, edgeColor;
      const len = this.clusterStatusData.controllers.length;
      const db1 = this.createVertex('DataBase', this.clusterStatusData.database.dbms, this.clusterStatusData.database, graph, len, undefined);
      let v2Copy, isMatch = false, isMatch2 = false;
      for (let i = 0; i < this.clusterStatusData.jocs.length; i++) {
        const color = ControllerClusterComponent.colorCode(this.clusterStatusData.jocs[i].componentState.severity);
        const v2 = this.createVertex('JOCCockpit', 'JOC Cockpit' + (i + 1), this.clusterStatusData.jocs[i], graph, i, this.clusterStatusData.jocs.length);
        this.clusterStatusData.jocs[i].vertex = v2;
        let _text = '-';
        if (this.clusterStatusData.jocs[i].connectionState._text) {
          this.translate.get(this.clusterStatusData.jocs[i].connectionState._text).subscribe(translatedValue => {
            _text = translatedValue;
          });
        }
        const edge = graph.insertEdge(graph.getDefaultParent(), null, this.getCellNode('Connection', _text, {}),
          v2, db1, 'strokeColor=' + ControllerClusterComponent.colorCode(this.clusterStatusData.jocs[i].connectionState.severity));
        if (this.clusterStatusData.jocs.length > 1) {
          let _y = db1.geometry.height / 2;
          let num = db1.geometry.width / 2;
          let x = 100;
          if (this.clusterStatusData.jocs.length === 2) {
            _y += i == 0 ? 20 : 38;
          } else if (this.clusterStatusData.jocs.length === 4) {

            if (i == 0 || i == this.clusterStatusData.jocs.length - 1) {
              num += i == 0 ? -30 : 30;
              x = 84;
            } else {
              num += !isMatch ? -15 : 15;
              isMatch = true;
            }
          } else {
            const middleNum = Math.floor(this.clusterStatusData.jocs.length / 2);
            if (middleNum > i) {
              if (this.clusterStatusData.jocs.length > 3) {
                num += isMatch ? -15 : -30;
                x = isMatch ? 100 : 84;
                isMatch = true;
              } else {
                num -= 15;
              }

            } else if (middleNum < i) {
              if (this.clusterStatusData.jocs.length > 3) {
                num += isMatch2 ? 30 : 15;
                x = isMatch2 ? 84 : 100;
                isMatch2 = true;
              } else {
                num += 15;
              }
            }
          }
          if (this.clusterStatusData.jocs.length < 3) {
            edge.geometry.points = [new mxPoint(v2.geometry.x + 105, _y)];
          } else {
            edge.geometry.points = [new mxPoint(v2.geometry.x + 105, x), new mxPoint(db1.geometry.x + num, 100)];
          }
          edgeColor = color;
        }
        if (this.clusterStatusData.jocs.length === 1) {
          v2Copy = v2;
        }
      }
      for (let i = 0; i < len; i++) {
        const v3 = this.createVertex('Controller', this.clusterStatusData.controllers[i].url, this.clusterStatusData.controllers[i], graph, i, this.clusterStatusData.jocs.length);
        const color = ControllerClusterComponent.colorCode(this.clusterStatusData.controllers[i].connectionState.severity);
        let _text2 = '-';
        if (this.clusterStatusData.controllers[i].connectionState._text) {
          this.translate.get(this.clusterStatusData.controllers[i].connectionState._text).subscribe(translatedValue => {
            _text2 = translatedValue;
          });
        }
        if (v2Copy) {
          const cEdge = graph.insertEdge(graph.getDefaultParent(), null, this.getCellNode('Connection', _text2, {}),
            v2Copy, v3, 'strokeColor=' + color);
          if (this.clusterStatusData.controllers.length > 1) {
            cEdge.geometry.points = [new mxPoint(v2Copy.geometry.x + (i === 0 ? 90 : 120), 250), new mxPoint(v3.geometry.x + 105, 250)];
          }
        } else {
          for (let j = 0; j < this.clusterStatusData.jocs.length; j++) {
            for (let m = 0; m < this.clusterStatusData.jocs[j].controllerConnectionStates.length; m++) {
              if (this.clusterStatusData.jocs[j].controllerConnectionStates[m].role === this.clusterStatusData.controllers[i].role) {
                let _text3 = '-';
                if (this.clusterStatusData.jocs[j].controllerConnectionStates[m].state._text) {
                  this.translate.get(this.clusterStatusData.jocs[j].controllerConnectionStates[m].state._text).subscribe(translatedValue => {
                    _text3 = translatedValue;
                  });
                }
                const j1 = this.clusterStatusData.jocs[j].vertex;
                const e = graph.insertEdge(graph.getDefaultParent(), null, this.getCellNode('Connection', _text3, {}),
                  j1, v3, 'strokeColor=' + ControllerClusterComponent.colorCode(this.clusterStatusData.jocs[j].controllerConnectionStates[m].state.severity));
                if (this.clusterStatusData.jocs.length > 2) {
                  let num = 0, _y = 240;
                  const middleNum = Math.floor(this.clusterStatusData.jocs.length / 2);
                  if (this.clusterStatusData.jocs.length > 3) {
                    if (j === 0 || this.clusterStatusData.jocs.length - 1 == j) {
                      _y = 256;
                    } else if (j === 1 || j === 4) {
                      _y = (j == 1) ? 240 : 256;
                    }
                    if (middleNum == j) {
                      num = this.clusterStatusData.jocs.length % 2 === 0 ? 15 : 0;
                    } else if (middleNum > j) {
                      num = _y == 240 ? -15 : -30;
                    } else if (middleNum < j) {
                      num = _y == 240 ? 15 : 30;
                    }
                  } else {
                    num = j === 0 ? -20 : j === 1 ? 0 : 20;
                  }
                  let xAxis = 105;
                  if (this.clusterStatusData.jocs[j].controllerConnectionStates.length > 1) {
                    xAxis += i === 0 ? -10 : 10;
                    if (middleNum > j) {
                      _y += i === 0 ? 10 : -10;
                    } else if (middleNum < j) {
                      _y += i === 0 ? -10 : 10;
                    } else {
                      _y = j === 1 ? 248 : 260;
                    }
                  }
                  if (j === 0 || j === this.clusterStatusData.jocs.length - 1) {
                    _y += this.clusterStatusData.controllers.length > 1 ? (8 + m * 2) : 0;
                  } else if (this.clusterStatusData.controllers.length > 1) {
                    _y += ((j + m) * 2);
                  }
                  e.geometry.points = [new mxPoint(j1.geometry.x + xAxis, _y), new mxPoint(v3.geometry.x + (105 + num), 260)];
                } else if (this.clusterStatusData.jocs.length === 2) {
                  let _y = 250;
                  if (this.clusterStatusData.jocs[j].controllerConnectionStates.length > 1) {
                    _y += i !== j ? (10 + (m * 4)) : -10;
                  } else {
                    _y -= 10;
                  }
                  e.geometry.points = [new mxPoint(j1.geometry.x + (i === 0 ? 95 : 115), _y), new mxPoint(v3.geometry.x + (105 + (j === 0 ? -10 : 10)), 250)];
                }
              }
            }
          }
        }
        if (vertix && i > 0 && i === len - 1) {
          const c1 = this.createVertex('Cluster', 'Cluster', this.clusterStatusData.clusterState, graph, len, this.clusterStatusData.jocs.length);
          graph.insertEdge(graph.getDefaultParent(), null, this.getCellNode('Connection', '', {}),
            vertix, c1, 'strokeColor=' + edgeColor);
          graph.insertEdge(graph.getDefaultParent(), null, this.getCellNode('Connection', '', {}),
            v3, c1, 'strokeColor=' + color);
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

  alignCenter(): void {
    $('[data-toggle="popover"]').popover('dispose');
    if (this.editor && this.editor.graph) {
      if (this.clusterStatusData && this.clusterStatusData.jocs && this.clusterStatusData.jocs.length === 1) {
        this.editor.graph.center(true, true, 0.5, 0.5);
      } else {
        this.editor.graph.center(true, true, this.clusterStatusData.jocs.length > 4 ? 0 : 0.5, 0);
      }
      setTimeout(() => {
        $('[data-toggle="popover"]').popover({html: true, trigger: 'hover'});
      }, 20);
    }
  }

  /**
   * Function to create dom element
   */
  getCellNode(name, label, data): any {
    const doc = mxUtils.createXmlDocument();
    // Create new node object
    const _node = doc.createElement(name);
    _node.setAttribute('label', label);
    _node.setAttribute('data', JSON.stringify(data));
    return _node;
  }

  createVertex(node, label, data, graph, index, len): any {
    // Create new node object
    const _node = this.getCellNode(node, label, data);
    let style = ';controller';
    let x, y, wt = 210, ht;
    if (node === 'DataBase') {
      wt = 160;
      ht = 60;
      x = 150 + (250 * this.clusterStatusData.jocs.length) / 2;
      y = (this.clusterStatusData.jocs.length == 1) ? 140 : (this.clusterStatusData.jocs.length == 2) ? 30 : this.clusterStatusData.jocs.length == 3 ? 15 : 0;
      if (this.clusterStatusData.jocs.length < 3) {
        x = 730;
      }
      if (this.clusterStatusData.jocs.length == 1) {
        x = index == 1 ? 560 : 620;
      }
    } else if (node === 'JOCCockpit') {
      ht = 100;
      y = 120;
      x = 250 + (250 * index);
    } else if (node === 'Controller') {
      ht = this.clusterStatusData.controllers.length > 1 ? 110 : 94;
      if (len > 1) {
        if (this.clusterStatusData.controllers.length > 1) {
          y = this.clusterStatusData.controllers.length === 2 ? 286 : 300;
        } else {
          if (len < 2) {
            y = 268;
          } else {
            y = 270;
          }
        }
      } else {
        if (len === 1) {
          y = 280;
        } else {
          y = 220;
        }
      }
      if (y === 286 && len == 3) {
        y = 278;
      }

      x = (this.clusterStatusData.controllers.length == 1 ? 125 : -125) + (250 * this.clusterStatusData.jocs.length) / 2;
      if (index > 0) {
        x += 500;
      }
    } else {
      ht = 40;
      if (len > 1) {
        y = this.clusterStatusData.controllers.length === 2 ? 321 : 335;
      } else {
        if (len === 1) {
          y = 315;
        } else {
          y = 255;
        }
      }
      if (y === 321 && len == 3) {
        y = 313;
      }
      x = 125 + (250 * this.clusterStatusData.jocs.length) / 2;
    }
    return graph.insertVertex(graph.getDefaultParent(), null, _node, x, y, wt, ht, style);
  }

  /*  ------------------ Actions -----------------------*/
  clusterAction(action, controller, isFailOver): void {
    this.controller = null;
    this.cluster = null;
    let obj = {
      controllerId: this.schedulerIds.selected,
      url: controller.url,
      withFailover: isFailOver,
      auditLog: {}
    };

    if (this.preferences.auditLog && (action !== 'download')) {
      let comments = {
        radio: 'predefined',
        name: obj.controllerId + ' (' + obj.url + ')',
        operation: (action === 'terminate' && !isFailOver) ? 'Terminate without fail-over' : action === 'terminateAndRestart' ? 'Terminate and Restart' : action === 'abortAndRestart' ? 'Abort and Restart' : action === 'terminate' ? 'Terminate' : action === 'abort' ? 'Abort' : 'Switch Over'
      };

      const modalRef = this.modalService.open(CommentModalComponent, {backdrop: 'static'});
      modalRef.componentInstance.comments = comments;
      modalRef.componentInstance.action = action;
      modalRef.componentInstance.show = true;
      modalRef.componentInstance.obj = obj;
      modalRef.componentInstance.performAction = this.performAction;
      modalRef.result.then((result) => {

      }, () => {

      });

    } else {
      this.performAction(action, obj, isFailOver);
    }
  }

  performAction(action, obj, isFailOver): void {
    if (obj === null) {
      obj = {};
      obj.controllerId = this.schedulerIds.selected;
      obj.withFailover = isFailOver;
      obj.auditLog = {};
    }
    if (action === 'terminate') {
      this.postCall('controller/terminate', obj);
    } else if (action === 'abort') {
      this.postCall('controller/abort', obj);
    } else if (action === 'abortAndRestart') {
      this.postCall('controller/abort_and_restart', obj);
    } else if (action === 'terminateAndRestart') {
      this.postCall('controller/restart', obj);
    } else if (action === 'switchover') {
      const obj1 = obj;
      delete obj1['withFailover'];
      this.postCall('controller/cluster/switchover', obj1);
    } else if (action === 'download') {
      $('#tmpFrame').attr('src', './api/controller/log?url=' + obj.url + '&controllerId=' + obj.controllerId + '&accessToken=' + this.authService.accessTokenId);
    }
  }

  restartService(type): void {
    this.postCall('joc/cluster/restart', {type});
  }

  switchOver(): void {
    this.postCall('joc/cluster/switch_member', {memberId: this.joc.memberId});
  }

  private refreshEvent(args): void {
    if (args.eventSnapshots && args.eventSnapshots.length > 0) {
      for (let j = 0; j < args.eventSnapshots.length; j++) {
        if (args.eventSnapshots[j].eventType === 'ControllerStateChanged' ||
          args.eventSnapshots[j].eventType === 'JOCStateChanged' ||
          args.eventSnapshots[j].eventType === 'ProxyCoupled' ||
          args.eventSnapshots[j].eventType === 'ProxyDecoupled') {
          this.isDataLoaded = false;
          this.reloadGraph();
          break;
        }
      }
    }
  }

  downloadJocLog(): void {
    $('#tmpFrame').attr('src', './api/joc/log?accessToken=' + this.authService.accessTokenId);
  }

  private onRefresh(): any {
    return this.coreService.post('controller/components', {controllerId: this.schedulerIds.selected});
  }

  private postCall(url, obj): void {
    this.coreService.post(url, obj).subscribe(res => {
    });
  }
}
