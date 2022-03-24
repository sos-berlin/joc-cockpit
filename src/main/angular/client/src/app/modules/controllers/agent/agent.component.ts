import {Component, HostListener, Input, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {NzModalRef, NzModalService} from "ng-zorro-antd/modal";
import {isEmpty, sortBy} from "underscore";
import {TranslateService} from "@ngx-translate/core";
import {CdkDragDrop, moveItemInArray} from "@angular/cdk/drag-drop";
import {CoreService} from "../../../services/core.service";
import {CommentModalComponent} from "../../../components/comment-modal/comment.component";
import {ConfirmModalComponent} from "../../../components/comfirm-modal/confirm.component";

declare const $;
declare const mxEditor;
declare const mxClient;
declare const mxOutline;
declare const mxGraph;
declare const mxHierarchicalLayout;
declare const mxTooltipHandler;
declare const mxConstants;
declare const mxEdgeHandler;
declare const saveSvgAsPng;
declare const mxPoint;
declare const mxGraphHandler;
declare const mxRectangleShape;
declare const mxRectangle;
declare const mxCellHighlight;
declare const mxCell;
declare const mxEvent;
declare const mxEventObject;
declare const mxDictionary;
declare const mxCodecRegistry;
declare const mxUtils;
declare const mxCellOverlay;

@Component({
  selector: 'app-sub-agent-modal',
  templateUrl: './sub-agent.dialog.html'
})
export class SubagentModalComponent implements OnInit {
  @Input() clusterAgent: any;
  @Input() data: any;
  @Input() new: boolean;
  @Input() controllerId: any;
  subagent: any = {};
  submitted = false;
  agentNameAliases: any = [];
  directors: any = [
    'NO_DIRECTOR',
    'PRIMARY_DIRECTOR',
    'SECONDARY_DIRECTOR'
  ];
  comments: any = {};
  preferences: any;
  display: any;
  required = false;

  constructor(public coreService: CoreService, public activeModal: NzModalRef) {
  }

  ngOnInit(): void {
    if (sessionStorage.preferences) {
      this.preferences = JSON.parse(sessionStorage.preferences) || {};
    }
    this.display = this.preferences.auditLog;
    this.comments.radio = 'predefined';
    if (sessionStorage.$SOS$FORCELOGING === 'true') {
      this.required = true;
      this.display = true;
    }
    if (this.data) {
      this.subagent = this.coreService.clone(this.data);
    } else {
      this.subagent.isDirector = 'NO_DIRECTOR';
      for (const i in this.clusterAgent.subagents) {
        if (this.clusterAgent.subagents[i].isDirector === 'PRIMARY_DIRECTOR') {
          this.directors.splice(this.directors.indexOf('PRIMARY_DIRECTOR'), 1);
        } else if (this.clusterAgent.subagents[i].isDirector === 'SECONDARY_DIRECTOR') {
          this.directors.splice(this.directors.indexOf('SECONDARY_DIRECTOR'), 1);
        }
      }
    }
  }

  onSubmit(): void {
    this.submitted = true;
    const obj: any = {controllerId: this.controllerId, agentId: this.clusterAgent.agentId};
    const subagent: any = this.coreService.clone(this.subagent);
    if (this.display) {
      obj.auditLog = {};
      if (this.comments.comment) {
        obj.auditLog.comment = this.comments.comment;
      }
      if (this.comments.timeSpent) {
        obj.auditLog.timeSpent = this.comments.timeSpent;
      }
      if (this.comments.ticketLink) {
        obj.auditLog.ticketLink = this.comments.ticketLink;
      }
    }

    obj.subagents = [subagent];

    this.coreService.post('agents/inventory/cluster/subagents/store', obj).subscribe({
      next: () => {
        this.activeModal.close('close');
      }, error: () => this.submitted = false
    });
  }
}

@Component({
  selector: 'add-cluster-agent-modal',
  templateUrl: './add-cluster.dialog.html'
})
export class AddClusterModalComponent implements OnInit {
  @Input() subagentClusters: any;
  @Input() agentId: any;
  @Input() data: any;
  @Input() new: boolean;
  cluster: any = {};
  submitted = false;
  isUniqueId = true;
  comments: any = {};
  preferences: any;
  display: any;
  required = false;

  constructor(public coreService: CoreService, public activeModal: NzModalRef) {
  }

  ngOnInit(): void {
    this.preferences = JSON.parse(sessionStorage.preferences) || {};
    this.display = this.preferences.auditLog;
    this.comments.radio = 'predefined';
    if (sessionStorage.$SOS$FORCELOGING === 'true') {
      this.required = true;
      this.display = true;
    }
    if (this.data) {
      this.cluster = this.coreService.clone(this.data);
    } else {
      this.cluster.agentId = this.agentId;
      this.cluster.subagentIds = [];
    }
  }

  checkUnique(value): void {
    this.isUniqueId = true;
    for (let i = 0; i < this.subagentClusters.length; i++) {
      if (this.subagentClusters[i].subagentClusterId === value && value !== this.data.subagentClusterId) {
        this.isUniqueId = false;
        break;
      }
    }
  }

  onSubmit(): void {
    this.submitted = true;
    const obj: any = {
      subagentClusters: []
    };
    if (this.display) {
      obj.auditLog = {};
      if (this.comments.comment) {
        obj.auditLog.comment = this.comments.comment;
      }
      if (this.comments.timeSpent) {
        obj.auditLog.timeSpent = this.comments.timeSpent;
      }
      if (this.comments.ticketLink) {
        obj.auditLog.ticketLink = this.comments.ticketLink;
      }
    }
    if (this.new) {
      obj.subagentClusters = this.coreService.clone(this.subagentClusters);
      obj.subagentClusters.push(this.cluster);
    } else {
      for (let i = 0; i < this.subagentClusters.length; i++) {
        if (this.subagentClusters[i].subagentClusterId === this.data.subagentClusterId) {
          this.subagentClusters[i].title = this.cluster.title;
          break;
        }
      }
    }
    this.coreService.post('agents/cluster/store', obj).subscribe({
      next: () => {
        this.activeModal.close(obj);
      }, error: () => {
        this.submitted = false;
      }
    });
  }
}

@Component({
  selector: 'app-agent-modal',
  templateUrl: './agent.dialog.html'
})
export class AgentModalComponent implements OnInit {
  @Input() data: any;
  @Input() new: boolean;
  @Input() isCluster: boolean;
  @Input() controllerId: any;
  agent: any = {};
  isSecondary = false;
  submitted = false;
  agentNameAliases: any = [];
  comments: any = {};
  preferences: any;
  display: any;
  required = false;

  constructor(public coreService: CoreService, public activeModal: NzModalRef) {
  }

  ngOnInit(): void {
    if (sessionStorage.preferences) {
      this.preferences = JSON.parse(sessionStorage.preferences) || {};
    }
    this.display = this.preferences.auditLog;
    this.comments.radio = 'predefined';
    if (sessionStorage.$SOS$FORCELOGING === 'true') {
      this.required = true;
      this.display = true;
    }
    if (this.data) {
      this.agent = this.coreService.clone(this.data);
      this.agent.subagents = sortBy(this.agent.subagents, 'isDirector');
      this.checkSecondaryDirector();
      delete this.agent.token;
      delete this.agent.show;
    }
    if (!this.agent.agentNameAliases || this.agent.agentNameAliases.length === 0) {
      this.agentNameAliases = [{name: ''}];
    } else {
      this.agent.agentNameAliases.filter((val) => {
        this.agentNameAliases.push({name: val});
      });
    }
  }

  private checkSecondaryDirector(): void {
    this.isSecondary = false;
    for (const i in this.agent.subagents) {
      if (this.agent.subagents[i].isDirector === 'SECONDARY_DIRECTOR') {
        this.isSecondary = true;
        break;
      }
    }
  }

  addAlise(): void {
    if (this.agentNameAliases[this.agentNameAliases.length - 1].name) {
      this.agentNameAliases.push({name: ''});
    }
  }

  removeAlise(index): void {
    this.agentNameAliases.splice(index, 1);
  }

  removeSubagent(list, index): void {
    list.splice(index, 1);
    this.checkSecondaryDirector();
  }

  addSubagent(isSecordary = false): void {
    if (isSecordary) {
      this.isSecondary = isSecordary;
    }
    if (!this.coreService.isLastEntryEmpty(this.agent.subagents, 'subagentId', 'url')) {
      this.agent.subagents.push({isDirector: isSecordary ? 'SECONDARY_DIRECTOR' : 'NO_DIRECTOR', subagentId: ''});
    }
  }

  private removeSubagents(obj, cb): void {
    this.coreService.post('agents/inventory/cluster/subagents/delete', obj).subscribe({
      next: () => {
        cb();
      }, error: () => {
        cb();
      }
    });
  }

  onSubmit(): void {
    let flag = true;
    this.submitted = true;
    const obj: any = {controllerId: this.controllerId};
    const _agent: any = this.coreService.clone(this.agent);
    if (this.display) {
      obj.auditLog = {};
      if (this.comments.comment) {
        obj.auditLog.comment = this.comments.comment;
      }
      if (this.comments.timeSpent) {
        obj.auditLog.timeSpent = this.comments.timeSpent;
      }
      if (this.comments.ticketLink) {
        obj.auditLog.ticketLink = this.comments.ticketLink;
      }
    }
    if (this.agentNameAliases.length > 0) {
      _agent.agentNameAliases = [];
      this.agentNameAliases.filter((val) => {
        if (val.name) {
          _agent.agentNameAliases.push(val.name);
        }
      });
    }
    if (this.isCluster) {
      if (this.new) {
        _agent.subagents = [{
          isDirector: 'PRIMARY_DIRECTOR',
          subagentId: _agent.subagentId,
          url: _agent.url,
          title: _agent.subtitle,
          position: _agent.position
        }];
        if (_agent.subagentId2) {
          _agent.subagents.push({
            isDirector: 'SECONDARY_DIRECTOR',
            subagentId: _agent.subagentId2,
            url: _agent.url2,
            title: _agent.subtitle2,
            position: _agent.position2
          });
        }
        delete _agent.director;
        delete _agent.subagentId;
        delete _agent.subagentId2;
        delete _agent.url;
        delete _agent.url2;
      }
      if (this.data) {
        const obj2 = {
          controllerId: this.controllerId,
          subagentIds: []
        };
        for (const i in this.data.subagents) {
          let isFound = false;
          for (const j in _agent.subagents) {
            if (this.data.subagents[i].subagentId === _agent.subagents[j].subagentId) {
              isFound = true;
              break;
            }
          }
          if (!isFound) {
            obj2.subagentIds.push(this.data.subagents[i].subagentId);
          }
        }
        if (obj2.subagentIds.length > 0) {
          flag = false;
          this.removeSubagents(obj2, () => {
            this.store(obj);
          });
        }
      }
      obj.clusterAgents = [_agent];
    } else {
      obj.agents = [_agent];
    }
    if (flag) {
      this.store(obj);
    }
  }

  private store(obj): void {
    this.coreService.post(this.isCluster ? 'agents/inventory/cluster/store' : 'agents/inventory/store', obj).subscribe({
      next: () => {
        this.activeModal.close('close');
      }, error: () => this.submitted = false
    });
  }
}

@Component({
  selector: 'app-agent',
  templateUrl: './agent.component.html',
  styleUrls: ['./agent.component.scss']
})
export class AgentComponent implements OnInit, OnDestroy {
  isLoading = true;
  isVisible = false;
  agentList = [];
  clusterAgents = [];
  pageView: string;
  preferences: any = {};
  configXml = './assets/mxgraph/config/diagrameditor.xml';
  editor: any;
  controllerId: string;
  agentId: string;
  clusters = [];
  dropTarget: number;
  selectedCluster: any = {};
  object = {
    checked: false,
    indeterminate: false,
    mapOfCheckedId: new Set()
  }

  constructor(public coreService: CoreService, private route: ActivatedRoute, private translate: TranslateService, private modal: NzModalService) {
  }

  static setHeight(): void {
    let top = Math.round($('.scroll-y').position().top) + 24;
    let ht = 'calc(100vh - ' + top + 'px)';
    $('.graph-container').css({'height': ht, 'scroll-top': '0'});
    $('#graph').slimscroll({height: 'calc(100vh - ' + (top + 54) + 'px)'});
    $('#toolbarContainer').css({'max-height': ht});
  }

  ngOnInit(): void {
    this.init();
  }

  ngOnDestroy(): void {
    try {
      if (this.editor) {
        this.editor.destroy();
        mxOutline.prototype.destroy();
        this.editor = null;
        $('.mxTooltip').remove();
      }
    } catch (e) {
      console.error(e);
    }
  }

  private init() {
    this.controllerId = this.route.snapshot.paramMap.get('controllerId');
    this.agentId = this.route.snapshot.paramMap.get('agentId');
    if (this.editor && !isEmpty(this.editor)) {
      this.editor.destroy();
      mxOutline.prototype.destroy()
      this.editor = null;
    }
    if (sessionStorage.preferences) {
      this.preferences = JSON.parse(sessionStorage.preferences) || {};
    }
    this.getClusters();
    this.getClusterAgents();
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.center();
    AgentComponent.setHeight();
  }

  private getClusters(): void {
    this.coreService.post('agents/cluster', {
      controllerId: this.controllerId,
      agentIds: [this.agentId]
    }).subscribe({
      next: (data: any) => {
        this.clusters = data.subagentClusters;
        this.isLoading = false;
      }, error: () => {
        this.isLoading = false;
      }
    });
  }

  private getClusterAgents(): void {
    this.coreService.post('agents/inventory/cluster', {
      controllerId: this.controllerId,
      agentIds: [this.agentId]
    }).subscribe({
      next: (data: any) => {
        data.agents.forEach((agent) => {
          this.clusterAgents = agent.subagents;
        });
      }
    });
  }

  createCluster(): void {
    this.modal.create({
      nzTitle: undefined,
      nzContent: AddClusterModalComponent,
      nzComponentParams: {
        agentId: this.agentId,
        subagentClusters: this.clusters,
        new: true
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    }).afterClose.subscribe(result => {
      if (result) {
        this.clusters = result.subagentClusters;
        this.selectedClusterFn(this.clusters[this.clusters.length - 1]);
      }
    });
  }

  edit(cluster): void {
    this.modal.create({
      nzTitle: undefined,
      nzContent: AddClusterModalComponent,
      nzComponentParams: {
        agentId: this.agentId,
        subagentClusters: this.clusters,
        data: cluster
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    }).afterClose.subscribe(result => {
      if (result) {
        this.clusters = result.subagentClusters;
      }
    });
  }

  delete(cluster): void {
    const obj = {
      controllerId: cluster.controllerId,
      subagentClusterIds: [cluster.subagentClusterId]
    };
    if (this.preferences.auditLog) {
      const comments = {
        radio: 'predefined',
        type: 'Cluster Agent',
        operation: 'Delete',
        name: cluster.agentId
      };
      this.modal.create({
        nzTitle: undefined,
        nzContent: CommentModalComponent,
        nzClassName: 'lg',
        nzComponentParams: {
          comments,
          obj,
          url: 'agent/cluster/delete'
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      });
    } else {
      const modal = this.modal.create({
        nzTitle: undefined,
        nzContent: ConfirmModalComponent,
        nzComponentParams: {
          title: 'delete',
          message: 'deleteClusterAgent',
          type: 'Delete',
          objectName: cluster.subagentClusterId,
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      });
      modal.afterClose.subscribe(result => {
        if (result) {
          this.coreService.post('agent/cluster/delete', obj).subscribe();
        }
      });
    }
  }

  deleteAll(): void {
    if (this.preferences.auditLog) {
      const comments = {
        radio: 'predefined',
        type: 'Cluster Agent',
        operation: 'Delete',
        name: ''
      };
      const modal = this.modal.create({
        nzTitle: undefined,
        nzContent: CommentModalComponent,
        nzClassName: 'lg',
        nzComponentParams: {
          comments,
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      });
      modal.afterClose.subscribe(result => {
        if (result) {
          this._deleteAll(result);
        }
      });
    } else {
      const modal = this.modal.create({
        nzTitle: undefined,
        nzContent: ConfirmModalComponent,
        nzComponentParams: {
          title: 'delete',
          message: 'deleteSelectedClusterAgents',
          type: 'Delete',
          objectName: '',
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      });
      modal.afterClose.subscribe(result => {
        if (result) {
          this._deleteAll();
        }
      });
    }
  }

  private _deleteAll(auditLog = {}): void {
    const obj: any = {
      controllerId: this.controllerId,
      subagentClusterIds: Array.from(this.object.mapOfCheckedId),
      auditLog
    };
    this.coreService.post('agent/cluster/delete', obj).subscribe();
    this.object.mapOfCheckedId.clear();
    this.object.checked = false;
    this.object.indeterminate = false;
  }

  deployAll(): void {
    const obj: any = {
      controllerId: this.controllerId,
      subagentClusterIds: Array.from(this.object.mapOfCheckedId)
    };
    if (this.preferences.auditLog) {
      let comments = {
        radio: 'predefined',
        type: 'Cluster Agent',
        operation: 'Deploy',
        name: ''
      };
      this.modal.create({
        nzTitle: undefined,
        nzContent: CommentModalComponent,
        nzClassName: 'lg',
        nzComponentParams: {
          comments,
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      }).afterClose.subscribe(result => {
        if (result) {
          obj.auditLog = {
            comment: result.comment,
            timeSpent: result.timeSpent,
            ticketLink: result.ticketLink
          };
          this.coreService.post('agents/cluster/deploy', obj).subscribe();
        }
      });
    } else {
      this.coreService.post('agents/cluster/deploy', obj).subscribe();
    }
  }

  deploy(cluster): void {
    const obj: any = {
      controllerId: this.controllerId,
      subagentClusterIds: [cluster.subagentClusterId]
    };
    if (this.preferences.auditLog) {
      let comments = {
        radio: 'predefined',
        type: 'Cluster Agent',
        operation: 'Deploy',
        name: cluster.subagentClusterId
      };
      this.modal.create({
        nzTitle: undefined,
        nzContent: CommentModalComponent,
        nzClassName: 'lg',
        nzComponentParams: {
          comments,
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      }).afterClose.subscribe(result => {
        if (result) {
          obj.auditLog = {
            comment: result.comment,
            timeSpent: result.timeSpent,
            ticketLink: result.ticketLink
          };
          this.coreService.post('agents/cluster/deploy', obj).subscribe();
        }
      });
    } else {
      this.coreService.post('agents/cluster/deploy', obj).subscribe();
    }
  }

  selectedClusterFn(cluster): void {
    this.selectedCluster = this.coreService.clone(cluster);
    if (this.editor && this.editor.graph) {
      this.updateCluster();
      this.updateList();
    } else {
      this.createEditor(() => {
        this.updateCluster();
        this.updateList();
        let dom = $('#graph');
        dom.css({opacity: 1});

        /**
         * Changes the zoom on mouseWheel events
         */
        dom.bind('mousewheel DOMMouseScroll', (event) => {
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
              if (bounds.y < -0.05 && bounds.height > dom.height()) {
                this.editor.graph.center(true, true, 0.5, -0.02);
              }
            }
          }
        });
        AgentComponent.setHeight();
        setTimeout(() => {
          this.actual();
        }, 0)
      });
    }
  }

  backToListView(): void {
    this.selectedCluster = {};
    this.ngOnDestroy();
  }

  drop2(event: CdkDragDrop<string[]>): void {
    moveItemInArray(this.clusters, event.previousIndex, event.currentIndex);
  }

  drop($event): void {
    if ($event.isPointerOverContainer && this.dropTarget) {
      const dropTargetCell = this.editor.graph.getModel().getCell(this.dropTarget);
      if (dropTargetCell) {
        const subagentId = this.agentList[$event.previousIndex].subagentId;
        this.agentList.splice($event.previousIndex, 1);
        const obj = {
          subagentId,
          priority: parseInt(dropTargetCell.getAttribute('priority'), 10)
        };
        this.selectedCluster.subagentIds.push(obj);
        this.updateCluster()
        this.storeCluster(obj);
      }
    }
  }

  private storeCluster(subagent?) {
    const obj: any = {
      subagentClusters: []
    }
    if (sessionStorage.$SOS$FORCELOGING === 'true') {
      this.translate.get('auditLog.message.defaultAuditLog').subscribe(translatedValue => {
        obj.auditLog = {comment: translatedValue};
      });
    }
    this.clusters.forEach((cluster) => {
      if (subagent && this.selectedCluster.subagentClusterId === cluster.subagentClusterId) {
        cluster.subagentIds.push(subagent);
      }
      obj.subagentClusters.push({
        controllerId: cluster.controllerId,
        title: cluster.title,
        agentId: cluster.agentId,
        subagentIds: cluster.subagentIds,
        subagentClusterId: cluster.subagentClusterId,
      });
    })
    this.coreService.post('agents/cluster/store', obj).subscribe();
  }

  private removeSubagent(cell): void {
    const subagentId = cell.getAttribute('label');
    const obj: any = {
      subagentClusters: []
    }
    if (sessionStorage.$SOS$FORCELOGING === 'true') {
      this.translate.get('auditLog.message.defaultAuditLog').subscribe(translatedValue => {
        obj.auditLog = {comment: translatedValue};
      });
    }
    this.clusters.forEach((cluster) => {
      if (subagentId && this.selectedCluster.subagentClusterId === cluster.subagentClusterId) {
        for (let i in cluster.subagentIds) {
          if (cluster.subagentIds[i].subagentId === subagentId) {
            cluster.subagentIds.splice(i, 1);
            break;
          }
        }
        for (let i in this.selectedCluster.subagentIds) {
          if (this.selectedCluster.subagentIds[i].subagentId === subagentId) {
            this.selectedCluster.subagentIds.splice(i, 1);
            break;
          }
        }
      }
      obj.subagentClusters.push({
        controllerId: cluster.controllerId,
        title: cluster.title,
        agentId: cluster.agentId,
        subagentIds: cluster.subagentIds,
        subagentClusterId: cluster.subagentClusterId,
      });
    });
    this.updateList();
    this.updateCluster();
    this.coreService.post('agents/cluster/store', obj).subscribe();
  }

  /**
   * Function to create dom element
   */
  private getCellNode(name, label) {
    const doc = mxUtils.createXmlDocument();
    // Create new node object
    const _node = doc.createElement(name);
    _node.setAttribute('label', label.trim());
    return _node;
  }

  onAllChecked(isCheck: boolean): void {
    if (isCheck) {
      this.clusters.forEach(item => {
        this.object.mapOfCheckedId.add(item.subagentClusterId);
      });
    } else {
      this.object.mapOfCheckedId.clear();
    }
    this.refreshCheckedStatus();
  }

  onItemChecked(cluster: any, checked: boolean): void {
    if (checked) {
      this.object.mapOfCheckedId.add(cluster.subagentClusterId);
    } else {
      this.object.mapOfCheckedId.delete(cluster.subagentClusterId);
    }
    this.object.checked = this.object.mapOfCheckedId.size === this.clusters.length;
    this.refreshCheckedStatus();
  }

  refreshCheckedStatus(): void {
    this.object.indeterminate = this.object.mapOfCheckedId.size > 0 && !this.object.checked;
  }

  /**
   * Constructs a new application (returns an mxEditor instance)
   */
  private createEditor(cb): void {
    let editor = null;
    const self = this;
    try {
      if (!mxClient.isBrowserSupported()) {
        mxUtils.error('Browser is not supported!', 200, false);
      } else {
        const xhr = mxUtils.load(this.configXml);
        xhr.request.onreadystatechange = function () {
          if (this.readyState === this.DONE) {
            const node = xhr.getDocumentElement();
            editor = new mxEditor(node);
            self.editor = editor;
            self.initEditorConf(editor);
            const outln = document.getElementById('outlineContainer');
            outln.innerHTML = '';
            new mxOutline(self.editor.graph, outln);
            cb();
          }
        };
      }
    } catch (e) {
      // Shows an error message if the editor cannot start
      mxUtils.alert('Cannot start application: ' + e.message);
      console.error(e);
      cb();
    }
  }


  /**
   * Function to override Mxgraph properties and functions
   */
  private initEditorConf(editor) {
    if (!editor) {
      return;
    }
    const graph = editor.graph;
    mxGraph.prototype.cellsResizable = false;
    mxGraph.prototype.multigraph = false;
    mxGraph.prototype.allowDanglingEdges = false;
    mxGraph.prototype.cellsLocked = true;
    mxGraph.prototype.foldingEnabled = true;
    mxHierarchicalLayout.prototype.interRankCellSpacing = 40;
    mxTooltipHandler.prototype.delay = 0;
    mxConstants.VERTEX_SELECTION_COLOR = null;
    mxConstants.EDGE_SELECTION_COLOR = null;
    mxConstants.GUIDE_COLOR = null;
    const self = this;
    let isAgentDraging = false;
    let movingAgent = null;

    if (this.preferences.theme !== 'light' && this.preferences.theme !== 'lighter' || !this.preferences.theme) {
      const style = graph.getStylesheet().getDefaultEdgeStyle();
      style[mxConstants.STYLE_FONTCOLOR] = '#ffffff';
      const style2 = graph.getStylesheet().getDefaultEdgeStyle();
      if (this.preferences.theme === 'blue-lt') {
        style2[mxConstants.STYLE_LABEL_BACKGROUNDCOLOR] = 'rgba(70, 82, 95, 0.6)';
      } else if (this.preferences.theme === 'blue') {
        style2[mxConstants.STYLE_LABEL_BACKGROUNDCOLOR] = 'rgba(50, 70, 90, 0.61)';
      } else if (this.preferences.theme === 'cyan') {
        style2[mxConstants.STYLE_LABEL_BACKGROUNDCOLOR] = 'rgba(29, 29, 28, 0.5)';
      } else if (this.preferences.theme === 'grey') {
        style2[mxConstants.STYLE_LABEL_BACKGROUNDCOLOR] = 'rgba(78, 84, 92, 0.62)';
      }
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
    mxConstants.DROP_TARGET_COLOR = 'green';

    /**
     * Function: createPreviewShape
     *
     * Creates the shape used to draw the preview for the given bounds.
     */
    mxGraphHandler.prototype.createPreviewShape = function (bounds) {
      const _shape = graph.view.getState(this.cell).shape;
      movingAgent = this.cell;
      let shape = new mxRectangleShape(bounds, _shape.fill, _shape.stroke, _shape.strokewidth);
      shape.isRounded = _shape.isRounded;
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

    /**
     * Overrides method to provide a cell label in the display
     * @param cell
     */
    graph.convertValueToString = function (cell) {
      let str = '';
      if (cell.value.tagName === 'Process') {
        const title = cell.getAttribute('label');
        if (title != null && title.length > 0) {
          self.translate.get('agent.label.' + title).subscribe(translatedValue => {
            str = translatedValue;
          });
        }
      } else if (cell.value.tagName !== 'Connection') {
        let className;
        if (cell.value.tagName === 'Agent') {
          className = 'vertex-text agent ' + cell.id;
        }
        str = '<div class="' + className + '">' + cell.getAttribute('label');
        str = str + '</div>';
      }
      return str;
    };

    /**
     * Function: isCellMovable
     *
     * Returns true if the given cell is moveable.
     */
    graph.isCellMovable = function (cell) {
      if (cell.value) {
        return cell.value.tagName === 'Agent';
      } else {
        return false;
      }
    };

    mxCellOverlay.prototype.getBounds = function (state) {
      let isEdge = state.view.graph.getModel().isEdge(state.cell);
      let s = state.view.scale;
      let pt;
      let w = this.image.width;
      let h = this.image.height;
      if (!isEdge) {
        pt = new mxPoint();
        if (this.align == mxConstants.ALIGN_LEFT) {
          pt.x = state.x;
        } else if (this.align == mxConstants.ALIGN_CENTER) {
          pt.x = state.x + state.width / 2;
        } else {
          pt.x = state.x + state.width;
        }
        if (this.verticalAlign == mxConstants.ALIGN_TOP) {
          pt.y = state.y;
        } else if (this.verticalAlign == mxConstants.ALIGN_MIDDLE) {
          pt.y = state.y + state.height / 2;
        } else {
          pt.y = state.y + state.height;
        }

      } else {
        let pts = state.absolutePoints;
        if (pts.length % 2 == 1) {
          pt = pts[Math.floor(pts.length / 2)];
        } else {
          let idx = pts.length / 2;
          let p0 = pts[idx - 1];
          let p1 = pts[idx];
          pt = new mxPoint(p0.x + (p1.x - p0.x) / 2,
            p0.y + (p1.y - p0.y) / 2);
        }
      }

      if (this.align == mxConstants.ALIGN_CENTER) {
        pt.y = pt.y - (2 * state.shape.scale);
        if (state.cell.value.tagName === 'InCondition') {
          pt.x = pt.x + (15 * state.shape.scale);
        } else if (state.cell.value.tagName === 'OutCondition') {
          pt.x = pt.x - (15 * state.shape.scale);
        }
      } else if (this.align == mxConstants.ALIGN_RIGHT && (state.cell.value.tagName === 'InCondition' || state.cell.value.tagName === 'OutCondition')) {
        pt.y = pt.y + (7 * state.shape.scale);
        if (state.cell.value.tagName === 'InCondition') {
          pt.x = pt.x - (38 * state.shape.scale);
        } else {
          pt.x = pt.x - (13 * state.shape.scale);
        }
      }

      if (!pt) {
        return;
      }
      return new mxRectangle(Math.round(pt.x - (w * this.defaultOverlap - this.offset.x) * s),
        Math.round(pt.y - (h * this.defaultOverlap - this.offset.y) * s), w * s, h * s);
    };

    /**
     * Function: getTooltipForCell
     *
     * Returns the string or DOM node to be used as the tooltip for the given
     * cell.
     */
    graph.getTooltipForCell = function (cell) {
      let tip = null;
      if (cell != null && cell.getTooltip != null) {
        tip = cell.getTooltip();
      } else if (cell) {
        if (!(cell.value.tagName === 'Connection' || cell.value.tagName === 'Connector' || cell.value.tagName === 'Process')) {
          tip = "<div class='vertex-text2'>";
          if (cell.getAttribute('label')) {
            tip = tip + cell.getAttribute('label');
          }
          tip = tip + '</div>';
        }
      }

      return tip;
    };

    // Shows icons if the mouse is over a cell
    graph.addMouseListener({
      currentState: null,
      mouseDown: function (sender, me) {
        // Hides icons on mouse down
        if (this.currentState != null) {
          this.dragLeave(me.getEvent(), this.currentState);
          this.currentState = null;
        }
      },
      mouseMove: function (sender, me) {
        if (me.consumed && !me.getCell()) {
          isAgentDraging = true;
          setTimeout(function () {
            if (isAgentDraging && movingAgent) {
              $('#dropContainer').show();
              $('#toolbar-icons').hide();
            }
          }, 10);
        }
        if (this.currentState != null && me.getState() == this.currentState) {
          return;
        }

        let tmp = graph.view.getState(me.getCell());
        // Ignores everything but vertices
        if (graph.isMouseDown) {
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
      mouseUp: function (sender, me) {
        if (isAgentDraging) {
          isAgentDraging = false;
          if (movingAgent) {
            detachedAgent(me.evt.target, movingAgent)
          }
        }
      },
      dragEnter: function (evt, state) {
        if (state != null) {
          this.previousStyle = state.style;
          state.style = mxUtils.clone(state.style);
          if (state.style) {
            if (state.cell && state.cell.value.tagName === 'Process') {
              const classList = $('#graph').attr('class');
              if (classList.indexOf('cdk-drop-list-dragging') > -1) {
                this.currentHighlight = new mxCellHighlight(graph, 'green');
                this.currentHighlight.highlight(state);
                self.dropTarget = state.cell.id;
              }
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
          self.dropTarget = null;
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

    function detachedAgent(target, cell): void {
      if (target && target.getAttribute('class') === 'dropContainer' && cell) {
        graph.removeCells([cell], null);
        self.removeSubagent(cell);
      }
      movingAgent = null;
      $('#dropContainer').hide();
      $('#toolbar-icons').show();
    }

    graph.moveCells = function (cells) {
      return cells;
    };

    graph.isValidDropTarget = function (cell, cells, evt) {
      return false;
    }
  }

  exportInPng() {
    if (this.editor && this.editor.graph) {
      const dom = $('#graph');
      let ht = $(document).height();
      let wt = $(document).width();
      if (wt < dom.first()[0].scrollWidth) {
        wt = dom.first()[0].scrollWidth;
      }
      if (ht < dom.first()[0].scrollHeight) {
        ht = dom.first()[0].scrollHeight;
      }
      let bg = dom.css('background-color');
      bg = bg.substring(0, bg.length - 4);
      saveSvgAsPng(dom.first()[0].firstChild, this.selectedCluster.subagentClusterId + '.png', {
        backgroundColor: bg + '1)',
        height: ht + 200,
        width: wt + 200,
        left: -50,
        top: -80
      });
    }
  }

  private updateList(): void {
    this.agentList = this.clusterAgents.filter((item) => {
      let flag = true;
      for (let i in this.selectedCluster.subagentIds) {
        if (this.selectedCluster.subagentIds[i].subagentId === item.subagentId) {
          flag = false;
          break;
        }
      }
      return flag;
    });
  }

  private updateCluster(): void {
    const graph = this.editor.graph;
    const scrollValue: any = {};
    const element = document.getElementById('graph');
    scrollValue.scrollTop = element.scrollTop;
    scrollValue.scrollLeft = element.scrollLeft;
    scrollValue.scale = graph.getView().getScale();
    graph.getModel().beginUpdate();
    try {
      graph.removeCells(graph.getChildCells(graph.getDefaultParent()), true);
      this.createClusterWorkflow();
    } finally {
      // Updates the display
      graph.getModel().endUpdate();
    }

    const _element = document.getElementById('graph');
    _element.scrollTop = scrollValue.scrollTop;
    _element.scrollLeft = scrollValue.scrollLeft;
    if (scrollValue.scale && scrollValue.scale != 1) {
      graph.getView().setScale(scrollValue.scale);
    }
  }

  private createClusterWorkflow(): void {
    const graph = this.editor.graph;
    const doc = mxUtils.createXmlDocument();
    const defaultParent = graph.getDefaultParent();

    function compare(a, b) {
      if (a.priority < b.priority) {
        return -1;
      }
      if (a.priority > b.priority) {
        return 1;
      }
      return 0;
    }

    let i = 0;
    let priority = -1;
    let v1;
    if (this.selectedCluster.subagentIds && this.selectedCluster.subagentIds.length > 0) {
      this.selectedCluster.subagentIds.sort(compare).forEach((subagent, index) => {
        const _node = this.getCellNode('Agent', subagent.subagentId);
        let source;
        let flag = this.selectedCluster.subagentIds.length === 1;
        let y = 70 * subagent.priority;
        if (priority === subagent.priority) {
          i++;
          if (v1) {
            source = v1;
          }
        } else {
          i = 0;
        }
        if (!flag) {
          if (this.selectedCluster.subagentIds[index + 1]) {
            if (subagent.priority !== this.selectedCluster.subagentIds[index + 1].priority) {
              flag = true;
            }
          } else {
            flag = true;
          }
        }
        priority = subagent.priority;
        let x = (230 * i) + 10;
        v1 = this.editor.graph.insertVertex(defaultParent, null, _node, x, y, 180, 40, 'job');
        if (source) {
          graph.insertEdge(defaultParent, null, doc.createElement('Connection'), source, v1, 'edgeStyle');
        }
        if (flag) {
          const mainNode = doc.createElement('Process');
          mainNode.setAttribute('label', 'dragAndDropForRoundRobin');
          mainNode.setAttribute('priority', 'priority');
          const v2 = graph.insertVertex(defaultParent, null, mainNode, x + 230, y - 5, 200, 50, 'rectangle;whiteSpace=wrap;html=1;dashed=1;shadow=0;opacity=70;');
          graph.insertEdge(defaultParent, null, doc.createElement('Connection'), v1, v2, 'edgeStyle;dashed=1;');
        }

        if (this.selectedCluster.subagentIds.length - 1 === index) {
          const mainNode = doc.createElement('Process');
          mainNode.setAttribute('label', 'dragAndDropFixedPriority');
          mainNode.setAttribute('priority', (priority + 1));
          graph.insertVertex(defaultParent, null, mainNode, 0, y + 70, 200, 50, 'rectangle;whiteSpace=wrap;html=1;dashed=1;shadow=0;opacity=70;');
        }
      })
    } else {
      const mainNode = doc.createElement('Process');
      mainNode.setAttribute('label', 'dragAndDropFixedPriority');
      mainNode.setAttribute('priority', 0);
      graph.insertVertex(defaultParent, null, mainNode, 0, 0, 200, 50, 'rectangle;whiteSpace=wrap;html=1;dashed=1;shadow=0;opacity=70;');
    }
  }

  /* ---------------------------- Broadcast messages ----------------------------------*/
  receiveMessage($event): void {
    this.pageView = $event;
  }

  zoomIn(): void {
    if (this.editor && this.editor.graph) {
      this.editor.graph.zoomIn();
    }
  }

  zoomOut(): void {
    if (this.editor && this.editor.graph) {
      this.editor.graph.zoomOut();
    }
  }

  actual(): void {
    if (this.editor && this.editor.graph) {
      this.editor.graph.zoomActual();
      this.center();
    }
  }

  fit(): void {
    if (this.editor && this.editor.graph) {
      this.editor.graph.fit();
      this.center();
    }
  }

  private center(): void {
    const dom = document.getElementById('graph');
    let x = 0.5;
    let y = 0.2;
    if (dom && this.editor) {
      if (dom.clientWidth !== dom.scrollWidth) {
        x = 0;
      }
      if (dom.clientHeight !== dom.scrollHeight) {
        y = 0;
      }
      this.editor.graph.center(true, true, x, y);
    }
  }

  close(): void {
    this.isVisible = false;
  }

}
