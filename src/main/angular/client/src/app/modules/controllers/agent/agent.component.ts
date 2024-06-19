import {Component, HostListener, inject, ViewChild} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {NZ_MODAL_DATA, NzModalRef, NzModalService} from "ng-zorro-antd/modal";
import {isEmpty, sortBy} from "underscore";
import {TranslateService} from "@ngx-translate/core";
import {Subscription} from "rxjs";
import {CdkDragDrop, moveItemInArray} from "@angular/cdk/drag-drop";
import {NzContextMenuService, NzDropdownMenuComponent} from "ng-zorro-antd/dropdown";
import {CoreService} from "../../../services/core.service";
import {AuthService} from "../../../components/guard";
import {CommentModalComponent} from "../../../components/comment-modal/comment.component";
import {ConfirmModalComponent} from "../../../components/comfirm-modal/confirm.component";
import {OrderPipe, SearchPipe} from "../../../pipes/core.pipe";
import {DataService} from "../../../services/data.service";

declare const $;
declare const mxEditor;
declare const mxClient;
declare const mxOutline;
declare const mxGraph;
declare const mxHierarchicalLayout;
declare const mxTooltipHandler;
declare const mxConstants;
declare const mxEdgeHandler;
declare const mxPoint;
declare const mxGraphHandler;
declare const mxRectangleShape;
declare const mxRectangle;
declare const mxCellHighlight;
declare const mxEvent;
declare const mxUtils;
declare const mxCellOverlay;

@Component({
  selector: 'app-sub-agent-modal',
  templateUrl: './sub-agent.dialog.html'
})
export class SubagentModalComponent {
  readonly modalData: any = inject(NZ_MODAL_DATA);
  clusterAgent: any;
  data: any;
  new: boolean;
  controllerId: any;
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
    this.clusterAgent = this.modalData.clusterAgent;
    this.data = this.modalData.data;
    this.new = this.modalData.new;
    this.controllerId = this.modalData.controllerId;
    if (sessionStorage['preferences']) {
      this.preferences = JSON.parse(sessionStorage['preferences']) || {};
    }
    this.display = this.preferences.auditLog;
    this.comments.radio = 'predefined';
    if (sessionStorage['$SOS$FORCELOGING'] === 'true') {
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
      this.coreService.getAuditLogObj(this.comments, obj.auditLog);
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
export class AddClusterModalComponent {
  readonly modalData: any = inject(NZ_MODAL_DATA)
  subagentClusters: any;
  agentId: any;
  data: any;
  new: boolean;
  isCopy: boolean;
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
    this.subagentClusters = this.modalData.subagentClusters;
    this.agentId = this.modalData.agentId;
    this.data = this.modalData.data;
    this.new = this.modalData.new;
    this.isCopy = this.modalData.isCopy;

    this.preferences = JSON.parse(sessionStorage['preferences']) || {};
    this.display = this.preferences.auditLog;
    this.comments.radio = 'predefined';
    if (sessionStorage['$SOS$FORCELOGING'] === 'true') {
      this.required = true;
      this.display = true;
    }
    if (this.data) {
      this.cluster = this.coreService.clone(this.data);
      if (this.isCopy) {
        this.cluster.subagentClusterId = this.cluster.subagentClusterId + '-copy';
        for (let i = 0; i < this.subagentClusters.length; i++) {
          if (this.subagentClusters[i].subagentClusterId === this.cluster.subagentClusterId) {
            this.cluster.subagentClusterId = this.cluster.subagentClusterId + '2';
            break;
          }
        }
      }
    } else {
      this.cluster.agentId = this.agentId;
      this.cluster.subagentIds = [];
    }
  }

  checkUnique(): void {
    this.isUniqueId = true;
    for (let i = 0; i < this.subagentClusters.length; i++) {
      if (this.subagentClusters[i].subagentClusterId === this.cluster.subagentClusterId && ((this.data && this.cluster.subagentClusterId !== this.data.subagentClusterId) || !this.data)) {
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
      this.coreService.getAuditLogObj(this.comments, obj.auditLog);
    }
    if (!this.new && !this.isCopy) {
      for (let i = 0; i < this.subagentClusters.length; i++) {
        if (this.subagentClusters[i].subagentClusterId === this.data.subagentClusterId) {
          this.subagentClusters[i].title = this.cluster.title;
        }
      }
    }
    obj.subagentClusters.push({
      agentId: this.cluster.agentId,
      controllerId: this.cluster.controllerId,
      subagentClusterId: this.cluster.subagentClusterId,
      subagentIds: this.cluster.subagentIds,
      title: this.cluster.title
    });
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
export class AgentModalComponent {
  readonly modalData: any = inject(NZ_MODAL_DATA);
  data: any;
  new: boolean;
  isCluster: boolean;
  controllerId: any;
  agent: any = {};
  submitted = false;
  agentNameAliases: any = [];
  comments: any = {};
  preferences: any;
  display: any;
  required = false;
  secondaryDirector: any = {};
  processLimitTry: string = 'unlimited';

  constructor(public coreService: CoreService, public activeModal: NzModalRef) {
  }

  ngOnInit(): void {
    this.data = this.modalData.data;
    this.new = this.modalData.new;
    this.isCluster = this.modalData.isCluster;
    this.controllerId = this.modalData.controllerId;
    if (sessionStorage['preferences']) {
      this.preferences = JSON.parse(sessionStorage['preferences']) || {};
    }
    this.display = this.preferences.auditLog;
    this.comments.radio = 'predefined';
    if (sessionStorage['$SOS$FORCELOGING'] === 'true') {
      this.required = true;
      this.display = true;
    }
    if (this.data) {
      this.agent = this.coreService.clone(this.data);
      if (this.agent.processLimit || this.agent.processLimit == 0) {
        this.processLimitTry = 'limited';
      }
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
    for (let i = 0; i < this.agent.subagents?.length; i++) {
      if (this.agent.subagents[i].isDirector === 'SECONDARY_DIRECTOR') {
        this.secondaryDirector = this.agent.subagents[i];
        this.agent.subagents.slice(i, 1);
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
  }

  changeLimit(value): void {
    if (value == 'unlimited') {
      delete this.agent.processLimit;
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
      this.coreService.getAuditLogObj(this.comments, obj.auditLog);
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
          withGenerateSubagentCluster: _agent.withGenerateSubagentCluster,
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
        delete _agent.withGenerateSubagentCluster;
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
        if (this.secondaryDirector?.subagentId && this.secondaryDirector?.url) {
          _agent.subagents = _agent.subagents.filter((subagent) => {
            return subagent.subagentId !== this.secondaryDirector.subagentId && subagent.url !== this.secondaryDirector?.url
          });
          _agent.subagents.push({
            isDirector: 'SECONDARY_DIRECTOR',
            subagentId: this.secondaryDirector.subagentId,
            url: this.secondaryDirector.url,
            title: this.secondaryDirector.title
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
  selector: 'app-certificate-modal',
  templateUrl: './add-certificate-dialog.html'
})
export class AddCertificateModalComponent {
  readonly modalData: any = inject(NZ_MODAL_DATA);
  certificateObj: any = {};
  submitted = false;
  certificateList: any = [];

  constructor(public coreService: CoreService, public activeModal: NzModalRef) {
  }

  ngOnInit(): void {
    if (this.modalData.agent) {
      this.certificateObj.agentId = this.modalData.agent.agentId;
    } else if (this.modalData.subagent) {
      this.certificateObj.agentId = this.modalData.subagent.subagentId;
    }
    this.getEnciphermentCertificate();
  }

  getEnciphermentCertificate(){
    let certAliasesObj = {
      certAliases: []
    };
    this.coreService.post('encipherment/certificate', certAliasesObj).subscribe({
      next: (res: any) => {
        this.certificateList = res.certificates;
      }, error: () => {
        this.certificateList = [];
      }
    });
  }

  onSubmit(): void {
    this.submitted = true;
    this.coreService.post('encipherment/assignment/add', this.certificateObj).subscribe({
      next: () => {
        this.activeModal.close('Done');
      }, error: () => this.submitted = false
    });
  }
}

@Component({
  selector: 'app-certificate-modal',
  templateUrl: './show-certificate-list-dialog.html'
})
export class ShowCertificateListModalComponent {

  readonly modalData: any = inject(NZ_MODAL_DATA);
  data: any;
  certificateList: any

  constructor(public coreService: CoreService, public activeModal: NzModalRef, private modal: NzModalService){}

  ngOnInit(): void {
    console.log(this.modalData)
    this.data = this.modalData.agent;
    this.getCertificates();
  }

  getCertificates(){
    let certAliases = { agentIds: [] };
    certAliases.agentIds.push(this.data.agentId);
    this.coreService.post('encipherment/assignment', certAliases).subscribe({
      next: (res: any) => {
        console.log(res)
        this.certificateList = res.mappings;
      }, error: () => {
      }
    });
  }

  deleteCertificateAlias(certAlias){
    let certAliasesObj = {
      agentId: this.data.agentId,
      certAlias: certAlias
    };
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: ConfirmModalComponent,
      nzData: {
        type: 'Remove',
        title: 'remove',
        message: 'removeCertificate',
        objectName: certAlias,
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        this._deleteCertificateAlias(certAliasesObj);
      }
    });
  }

  private _deleteCertificateAlias(certAliasesObj){
    this.coreService.post('encipherment/assignment/remove', certAliasesObj).subscribe({
     next: (res: any) => {
      this.getCertificates();
     }, error: () => {}
   });
 }
}

@Component({
  selector: 'app-agent',
  templateUrl: './agent.component.html',
  styleUrls: ['./agent.component.scss']
})
export class AgentComponent {
  isLoading = true;
  isVisible = false;
  isActionMenuVisible = false;
  agentList = [];
  clusterAgents = [];
  pageView: string;
  preferences: any = {};
  permission: any = {};
  configXml = './assets/mxgraph/config/diagrameditor.xml';
  editor: any;
  controllerId: string;
  agentId: string;
  clusters = [];
  data = [];
  searchableProperties = ['subagentClusterId', 'state', '_text'];
  dropTarget: number;
  selectedCluster: any = {};
  clusterFilter: any = {};
  node: any;
  colors = ['#90C7F5', '#FFEE73', '#FFCF8c', '#Aaf0d1', '#D4af37', '#8c92ac', '#B2beb5', '#CDEB8B', '#FFC7C7', '#C2b280', '#8B8BB4', '#B38b6d', '#Eedc82', '#B87333', '#97B0FF', '#D4af37', '#856088'];
  object = {
    checked: false,
    indeterminate: false,
    mapOfCheckedId: new Set()
  }
  subscription: Subscription;

  @ViewChild('menu', {static: true}) menu: NzDropdownMenuComponent;

  constructor(public coreService: CoreService, private route: ActivatedRoute, private nzContextMenuService: NzContextMenuService,
              private translate: TranslateService, private modal: NzModalService, private authService: AuthService,
              private dataService: DataService, private orderPipe: OrderPipe, private searchPipe: SearchPipe) {
    this.subscription = dataService.eventAnnounced$.subscribe(res => {
      this.refresh(res);
    });
  }

  static setHeight(): void {
    let top = Math.round($('.scroll-y').position().top) + 24;
    let ht = 'calc(100vh - ' + top + 'px)';
    $('.graph-container').css({'height': ht, 'scroll-top': '0'});
    $('#graph').css({height: 'calc(100vh - ' + (top + 54) + 'px)'});
    $('#toolbarContainer').css({'max-height': ht});
  }

  static compare(a, b) {
    if (a.priority > b.priority) {
      return -1;
    }
    if (a.priority < b.priority) {
      return 1;
    }
    return 0;
  }

  ngOnInit(): void {
    this.init();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    try {
      if (this.editor) {
        this.editor.destroy();
        mxOutline.prototype.destroy();
        this.editor = null;
        $('.mxTooltip').css({visibility: 'hidden'})
      }
    } catch (e) {
      console.error(e);
    }
  }

  private refresh(args: { eventSnapshots: any[] }): void {
    if (args.eventSnapshots && args.eventSnapshots.length > 0) {
      for (let j = 0; j < args.eventSnapshots.length; j++) {
        if (args.eventSnapshots[j].eventType === 'AgentChanged' || args.eventSnapshots[j].eventType === 'AgentInventoryUpdated' || args.eventSnapshots[j].eventType === 'AgentStateChanged'
          || ((args.eventSnapshots[j].eventType === 'ProxyCoupled' || args.eventSnapshots[j].eventType === 'ProxyDecoupled' || args.eventSnapshots[j].eventType.match(/Item/))
            && args.eventSnapshots[j].objectType === 'AGENT')) {
          this.refreshView();
          break;
        }
      }
    }
  }

  private refreshView(): void {
    if ((!this.isActionMenuVisible && this.object.mapOfCheckedId.size === 0)) {
      this.getClusters();
    } else {
      setTimeout(() => {
        this.refreshView();
      }, 750);
    }
  }

  private init() {
    this.controllerId = this.route.snapshot.paramMap.get('controllerId');
    this.agentId = this.route.snapshot.paramMap.get('agentId');
    this.clusterFilter = this.coreService.getAgentClusterTab();
    this.permission = JSON.parse(this.authService.permission) || {};
    if (sessionStorage['preferences']) {
      this.preferences = JSON.parse(sessionStorage['preferences']) || {};
    }
    if (localStorage['views']) {
      this.pageView = JSON.parse(localStorage['views']).agentCluster;
    }
    if (this.editor && !isEmpty(this.editor)) {
      this.editor.destroy();
      mxOutline.prototype.destroy()
      this.editor = null;
    }
    this.getClusters();
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.center();
    AgentComponent.setHeight();
  }

  onVisible(value: boolean): void {
    this.isActionMenuVisible = value;
  }

  private getClusters(cb?): void {
    this.coreService.post('agents/cluster', {
      controllerId: this.controllerId,
      agentIds: [this.agentId]
    }).subscribe({
      next: (data: any) => {
        if(cb) cb();
        this.clusters = data.subagentClusters;
        if (this.selectedCluster.subagentClusterId) {
          let isFound = false;
          for (let i in this.clusters) {
            if (this.selectedCluster.subagentClusterId === this.clusters[i].subagentClusterId) {
              this.selectedCluster = this.coreService.clone(this.clusters[i]);
              isFound = true;
              break;
            }
          }
          if (!isFound && this.selectedCluster.ordering !== undefined) {
            this.backToListView();
          }
        }
        this.isLoading = false;
        this.clusters = this.orderPipe.transform(this.clusters, this.clusterFilter.filter.sortBy, this.clusterFilter.reverse);
        this.searchInResult();
      }, error: () => {
        if(cb) cb();
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
        this.updateList();
      }
    });
  }

  sort(propertyName): void {
    this.clusterFilter.reverse = !this.clusterFilter.reverse;
    this.clusterFilter.filter.sortBy = propertyName;
    this.data = this.orderPipe.transform(this.data, this.clusterFilter.filter.sortBy, this.clusterFilter.reverse);
    this.reset();
  }

  getCurrentData(list, filter): Array<any> {
    if (this.selectedCluster.subagentClusterId) {
      return this.clusters;
    } else {
      const entryPerPage = filter.entryPerPage || this.preferences.entryPerPage;
      return list.slice((entryPerPage * (filter.currentPage - 1)), (entryPerPage * filter.currentPage));
    }
  }

  pageIndexChange($event: number): void {
    this.clusterFilter.currentPage = $event;
  }

  pageSizeChange($event: number): void {
    this.clusterFilter.entryPerPage = $event;
  }

  searchInResult(): void {
    this.data = this.clusterFilter.searchText ? this.searchPipe.transform(this.clusters, this.clusterFilter.searchText, this.searchableProperties) : this.clusters;
    this.data = [...this.data];
    this.reset();
  }

  createCluster(): void {
    this.modal.create({
      nzTitle: undefined,
      nzAutofocus: null,
      nzContent: AddClusterModalComponent,
      nzClassName: 'lg',
      nzData: {
        agentId: this.agentId,
        subagentClusters: this.clusters,
        new: true
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    }).afterClose.subscribe(result => {
      if (result) {
        this.clusters = this.clusters.concat(result.subagentClusters);
        this.selectedClusterFn(result.subagentClusters[0]);
        this.clusters = this.orderPipe.transform(this.clusters, this.clusterFilter.filter.sortBy, this.clusterFilter.reverse);
        this.searchInResult();
      }
    });
  }

  edit(cluster, isCopy = false): void {
    this.modal.create({
      nzTitle: undefined,
      nzAutofocus: null,
      nzContent: AddClusterModalComponent,
      nzClassName: 'lg',
      nzData: {
        agentId: this.agentId,
        subagentClusters: this.clusters,
        data: cluster,
        isCopy
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    }).afterClose.subscribe(result => {
      if (result) {
        if (isCopy) {
          this.clusters = this.clusters.concat(result.subagentClusters);
          this.clusters = this.orderPipe.transform(this.clusters, this.clusterFilter.filter.sortBy, this.clusterFilter.reverse);
        }
        this.searchInResult();
      }
    });
  }

  duplicate(cluster): void {
    this.edit(cluster, true);
  }

  delete(cluster, isRevoke = false): void {
    const obj: any = {
      controllerId: cluster.controllerId,
      subagentClusterIds: [cluster.subagentClusterId]
    };
    if (this.preferences.auditLog) {
      const comments = {
        radio: 'predefined',
        type: 'Subagent Cluster',
        operation: isRevoke ? 'Revoke' : 'Delete',
        name: cluster.agentId
      };
      this.modal.create({
        nzTitle: undefined,
        nzContent: CommentModalComponent,
        nzClassName: 'lg',
        nzData: {
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
          this.coreService.post(isRevoke ? 'agents/cluster/revoke' : 'agents/cluster/delete', obj).subscribe();
        }
      });
    } else {
      if (isRevoke) {
        this.coreService.post('agents/cluster/revoke', obj).subscribe();
      } else {
        this.modal.create({
          nzTitle: undefined,
          nzContent: ConfirmModalComponent,
          nzData: {
            title: 'delete',
            message: 'deleteSubagentCluster',
            type: 'Delete',
            objectName: cluster.subagentClusterId,
          },
          nzFooter: null,
          nzClosable: false,
          nzMaskClosable: false
        }).afterClose.subscribe(result => {
          if (result) {
            this.coreService.post('agents/cluster/delete', obj).subscribe();
          }
        });
      }
    }
  }

  revoke(cluster): void {
    this.delete(cluster, true);
  }

  revokeAll(): void {
    this.deleteAll(true);
  }

  deleteAll(isRevoke = false): void {
    if (this.preferences.auditLog) {
      const comments = {
        radio: 'predefined',
        type: 'Subagent Cluster',
        operation: isRevoke ? 'Revoke' : 'Delete',
        name: ''
      };
      const modal = this.modal.create({
        nzTitle: undefined,
        nzContent: CommentModalComponent,
        nzClassName: 'lg',
        nzData: {
          comments,
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      });
      modal.afterClose.subscribe(result => {
        if (result) {
          this._deleteAll(isRevoke, result);
        }
      });
    } else {
      if (isRevoke) {
        this._deleteAll(isRevoke);
      } else {
        const modal = this.modal.create({
          nzTitle: undefined,
          nzContent: ConfirmModalComponent,
          nzData: {
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
            this._deleteAll(isRevoke);
          }
        });
      }
    }
  }

  private _deleteAll(isRevoke, auditLog = {}): void {
    const obj: any = {
      controllerId: this.controllerId,
      subagentClusterIds: Array.from(this.object.mapOfCheckedId),
      auditLog
    };
    this.coreService.post(isRevoke ? 'agents/cluster/revoke' : 'agents/cluster/delete', obj).subscribe(() => this.reset());
  }

  deployAll(): void {
    const obj: any = {
      controllerId: this.controllerId,
      subagentClusterIds: Array.from(this.object.mapOfCheckedId)
    };
    if (this.preferences.auditLog) {
      let comments = {
        radio: 'predefined',
        type: 'Subagent Cluster',
        operation: 'Deploy',
        name: ''
      };
      this.modal.create({
        nzTitle: undefined,
        nzContent: CommentModalComponent,
        nzClassName: 'lg',
        nzData: {
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
          this.coreService.post('agents/cluster/deploy', obj).subscribe(() => this.reset());
        }
      });
    } else {
      this.coreService.post('agents/cluster/deploy', obj).subscribe(() => this.reset());
    }
  }

  deploy(cluster): void {
    if (cluster.subagentIds.length > 0) {
      const obj: any = {
        controllerId: this.controllerId,
        subagentClusterIds: [cluster.subagentClusterId]
      };
      if (this.preferences.auditLog) {
        let comments = {
          radio: 'predefined',
          type: 'Subagent Cluster',
          operation: 'Deploy',
          name: cluster.subagentClusterId
        };
        this.modal.create({
          nzTitle: undefined,
          nzContent: CommentModalComponent,
          nzClassName: 'lg',
          nzData: {
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
            this.coreService.post('agents/cluster/deploy', obj).subscribe(() => this.reset());
          }
        });
      } else {
        this.coreService.post('agents/cluster/deploy', obj).subscribe(() => this.reset());
      }
    }
  }

  selectedClusterFn(cluster): void {
    if (this.permission.joc && this.permission.joc.administration.controllers.manage) {
      this.getClusterAgents();
      this.reset();
      this.isLoading = true;
      this.getClusters(() => {
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
                }
              }
            });
            AgentComponent.setHeight();
            setTimeout(() => {
              this.actual();
            }, 0)
          });
        }
      });
    }
  }

  backToListView(): void {
    this.selectedCluster = {};
    this.ngOnDestroy();
  }

  sortByDrop(event: CdkDragDrop<string[]>, subagents: any[]): void {
    if (event.previousIndex != event.currentIndex) {
      let index = (event.previousIndex < event.currentIndex) ? event.currentIndex : event.currentIndex - 1;
      this.coreService.post('agents/cluster/ordering', {
        subagentClusterId: subagents[event.previousIndex].subagentClusterId,
        predecessorSubagentClusterId: index > -1 ? subagents[index].subagentClusterId : undefined
      }).subscribe();
      moveItemInArray(subagents, event.previousIndex, event.currentIndex);
      for (let i = 0; i < subagents.length; i++) {
        subagents[i].ordering = i + 1;
      }
    }
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
        if (obj.priority == -1) {
          obj.priority = 0
          for (let i in this.clusters) {
            if (this.selectedCluster.subagentClusterId === this.clusters[i].subagentClusterId) {
              this.selectedCluster.subagentIds.forEach((item) => {
                item.priority = item.priority + 1;
              });
              this.clusters[i].subagentIds.forEach((item) => {
                item.priority = item.priority + 1;
              });
              break;
            }
          }
        }

        this.selectedCluster.subagentIds.push(obj);
        this.updateCluster();
        this.storeCluster(obj);
      }
    }
  }

  private storeCluster(subagent?) {
    const obj: any = {
      subagentClusters: []
    }
    if (sessionStorage['$SOS$FORCELOGING'] === 'true') {
      this.translate.get('auditLog.message.defaultAuditLog').subscribe(translatedValue => {
        obj.auditLog = {comment: translatedValue};
      });
    }
    let flag = false;
    for (let i in this.clusters) {
      if (this.selectedCluster.subagentClusterId === this.clusters[i].subagentClusterId) {
        if (subagent) {
          this.clusters[i].subagentIds.push(subagent);
        }
        obj.subagentClusters.push({
          controllerId: this.clusters[i].controllerId,
          title: this.clusters[i].title,
          agentId: this.clusters[i].agentId,
          subagentIds: this.clusters[i].subagentIds,
          subagentClusterId: this.clusters[i].subagentClusterId,
        });
        flag = true;
        break;
      }
    }

    if (!flag) {
      obj.subagentClusters.push({
        title: this.selectedCluster.title,
        controllerId: this.selectedCluster.controllerId || this.controllerId,
        agentId: this.selectedCluster.agentId,
        subagentClusterId: this.selectedCluster.subagentClusterId,
        subagentIds: this.selectedCluster.subagentIds,
      });
    }
    this.store(obj);
  }

  private removeSubagent(cell): void {
    const subagentId = cell.getAttribute('label');
    const obj: any = {
      subagentClusters: []
    }
    if (sessionStorage['$SOS$FORCELOGING'] === 'true') {
      this.translate.get('auditLog.message.defaultAuditLog').subscribe(translatedValue => {
        obj.auditLog = {comment: translatedValue};
      });
    }

    for (let x in this.clusters) {
      if (subagentId && this.selectedCluster.subagentClusterId === this.clusters[x].subagentClusterId) {
        for (let i in this.clusters[x].subagentIds) {
          if (this.clusters[x].subagentIds[i].subagentId === subagentId) {
            this.clusters[x].subagentIds.splice(i, 1);
            break;
          }
        }
        for (let i in this.selectedCluster.subagentIds) {
          if (this.selectedCluster.subagentIds[i].subagentId === subagentId) {
            this.selectedCluster.subagentIds.splice(i, 1);
            break;
          }
        }

        obj.subagentClusters.push({
          controllerId: this.clusters[x].controllerId,
          title: this.clusters[x].title,
          agentId: this.clusters[x].agentId,
          subagentIds: this.clusters[x].subagentIds,
          subagentClusterId: this.clusters[x].subagentClusterId,
        });
        break;
      }
    }
    this.updateList();
    this.updateCluster();
    this.store(obj);
  }

  private store(obj): void {
    if (obj.subagentClusters.length > 0) {
      this.coreService.post('agents/cluster/store', obj).subscribe(() => {
        this.selectedCluster.deployed = false;
        for (let i in this.clusters) {
          if (this.selectedCluster.subagentClusterId === this.clusters[i].subagentClusterId) {
            this.clusters[i].deployed = false;
            break;
          }
        }
      });
    }
  }

  private rearrange(sour, target): void {
    if (this.selectedCluster.subagentIds.length > 1) {
      const label = target.getAttribute('label');
      for (let x in this.clusters) {
        if (this.selectedCluster.subagentClusterId === this.clusters[x].subagentClusterId) {
          let subagentIds = [];
          let obj;
          let priority;
          let index;
          for (let i in this.clusters[x].subagentIds) {
            if (label === this.clusters[x].subagentIds[i].subagentId) {
              index = i;
              priority = this.clusters[x].subagentIds[i].priority;
            }
            if (sour.getAttribute('label') === this.clusters[x].subagentIds[i].subagentId) {
              obj = this.clusters[x].subagentIds[i];
            } else {
              subagentIds.push(this.clusters[x].subagentIds[i]);
            }
          }
          if (target.getAttribute('priority')) {
            obj.priority = parseInt(target.getAttribute('priority'), 10);
            subagentIds.push(obj);
          } else if (index > -1) {
            obj.priority = priority;
            subagentIds.splice(index, 0, obj);
          }
          subagentIds = subagentIds.sort(AgentComponent.compare);
          let j = 0;
          const tempList = this.coreService.clone(subagentIds);
          for (let i = subagentIds.length - 1; i >= 0; i--) {
            tempList[i].priority = j;
            if (subagentIds[i - 1] && subagentIds[i].priority != subagentIds[i - 1].priority) {
              j++;
            }
          }
          this.selectedCluster.subagentIds = tempList;
          this.clusters[x].subagentIds = tempList;
          this.updateCluster();
          this.storeCluster();
          break;
        }
      }
    }
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

  selectAll(): void {
    this.data.forEach(item => {
      this.object.mapOfCheckedId.add(item.subagentClusterId);
    });
  }

  reset(): void {
    this.object = {
      mapOfCheckedId: new Set(),
      checked: false,
      indeterminate: false
    };
  }

  onAllChecked(isCheck: boolean): void {
    if (isCheck && this.clusters.length > 0) {
      const data = this.getCurrentData(this.data, this.clusterFilter);
      data.forEach(item => {
        this.object.mapOfCheckedId.add(item.subagentClusterId);
      });
    } else {
      this.object.mapOfCheckedId.clear();
    }
    this.refreshCheckedStatus();
  }

  onItemChecked(cluster: any, checked: boolean): void {
    if (!checked && this.pageView != 'grid' && this.object.mapOfCheckedId.size > (this.clusterFilter.entryPerPage || this.preferences.entryPerPage)) {
      const data = this.getCurrentData(this.data, this.clusterFilter);
      if (data.length < this.data.length) {
        this.object.mapOfCheckedId.clear();
        data.forEach(item => {
          this.object.mapOfCheckedId.add(item.subagentClusterId);
        });
      }
    }
    if (checked) {
      this.object.mapOfCheckedId.add(cluster.subagentClusterId);
    } else {
      this.object.mapOfCheckedId.delete(cluster.subagentClusterId);
    }
    if (this.pageView != 'grid') {
      const data = this.getCurrentData(this.data, this.clusterFilter);
      this.object.checked = this.object.mapOfCheckedId.size === data.length;
      this.refreshCheckedStatus();
    }
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

    // Defines a new class for all icons
    function mxIconSet(state) {
      this.images = [];
      let img;
      if (state.cell && (state.cell.value.tagName === 'Agent')) {
        img = mxUtils.createImage('./assets/images/menu.svg');
        let x = state.x - (20 * state.shape.scale);
        let y = state.y - (8 * state.shape.scale);
        img.style.left = (x + 5) + 'px';
        img.style.top = y + 'px';
        mxEvent.addListener(img, 'click',
          mxUtils.bind(this, function (evt) {
            self.node = {
              cell: state.cell
            };
            if (self.menu) {
              setTimeout(() => {
                self.nzContextMenuService.create(evt, self.menu);
              }, 0);
            }
            this.destroy();
          })
        );
      }
      if (img) {
        img.style.position = 'absolute';
        img.style.cursor = 'pointer';
        img.style.width = (18 * state.shape.scale) + 'px';
        img.style.height = (18 * state.shape.scale) + 'px';
        state.view.graph.container.appendChild(img);
        this.images.push(img);
      }
    }

    mxIconSet.prototype.destroy = function () {
      if (this.images != null) {
        for (let i = 0; i < this.images.length; i++) {
          const img = this.images[i];
          img.parentNode.removeChild(img);
        }
      }

      this.images = null;
    };

    /**
     * Function: mouseMove
     *
     * Handles the event by highlighting possible drop targets and updating the
     * preview.
     */
    mxGraphHandler.prototype.mouseMove = function (sender, me) {
      if (!me.isConsumed() && graph.isMouseDown && this.cell != null &&
        this.first != null && this.bounds != null && !this.suspended) {
        // Stops moving if a multi touch event is received
        if (mxEvent.isMultiTouchEvent(me.getEvent())) {
          self.reset();
          return;
        }
        let delta = this.getDelta(me);
        let tol = graph.tolerance;
        if (this.shape != null || this.livePreviewActive || Math.abs(delta.x) > tol || Math.abs(delta.y) > tol) {
          // Highlight is used for highlighting drop targets
          if (this.highlight == null) {
            this.highlight = new mxCellHighlight(this.graph,
              mxConstants.DROP_TARGET_COLOR, 3);
          }

          let clone = graph.isCloneEvent(me.getEvent()) && graph.isCellsCloneable() && this.isCloneEnabled();
          let gridEnabled = graph.isGridEnabledEvent(me.getEvent());
          let cell = me.getCell();
          let hideGuide = true;
          let target = null;
          this.cloning = clone;

          if (graph.isDropEnabled() && this.highlightEnabled) {
            // Contains a call to getCellAt to find the cell under the mouse
            target = graph.getDropTarget(this.cells, me.getEvent(), cell, clone);
          }

          let state = graph.getView().getState(target);
          let highlight = false;
          if (state != null && (clone || this.isValidDropTarget(target, me) || (target && target.value.tagName === 'Process'))) {
            if (this.target != target) {
              this.target = target;
              this.setHighlightColor(mxConstants.DROP_TARGET_COLOR);
            }
            highlight = true;
          } else {
            this.target = null;
          }
          if (!state && self.selectedCluster.subagentIds.length > 1) {
            if (this.cells.length > 0 && cell && this.cells[0].id != cell.id) {
              state = graph.getView().getState(cell);
              highlight = true;
            }
          }

          if (state != null && highlight && state.cell) {
            this.highlight.highlight(state);
          } else {
            this.highlight.hide();
          }

          if (this.guide != null && this.useGuidesForEvent(me)) {
            delta = this.guide.move(this.bounds, delta, gridEnabled, clone);
            hideGuide = false;
          } else {
            delta = this.graph.snapDelta(delta, this.bounds, !gridEnabled, false, false);
          }

          if (this.guide != null && hideGuide) {
            this.guide.hide();
          }

          // Constrained movement if shift key is pressed
          if (graph.isConstrainedEvent(me.getEvent())) {
            if (Math.abs(delta.x) > Math.abs(delta.y)) {
              delta.y = 0;
            } else {
              delta.x = 0;
            }
          }
          this.checkPreview();
          if (this.currentDx != delta.x || this.currentDy != delta.y) {
            this.currentDx = delta.x;
            this.currentDy = delta.y;
            this.updatePreview();
          }
        }
        this.updateHint(me);
        this.consumeMouseEvent(mxEvent.MOUSE_MOVE, me);
        // Cancels the bubbling of events to the container so
        // that the droptarget is not reset due to an mouseMove
        // fired on the container with no associated state.
        mxEvent.consume(me.getEvent());
      } else if ((this.isMoveEnabled() || this.isCloneEnabled()) && this.updateCursor && !me.isConsumed() &&
        (me.getState() != null || me.sourceState != null) && !graph.isMouseDown) {
        let cursor = graph.getCursorForMouseEvent(me);
        if (cursor == null && graph.isEnabled() && graph.isCellMovable(me.getCell())) {
          if (graph.getModel().isEdge(me.getCell())) {
            cursor = mxConstants.CURSOR_MOVABLE_EDGE;
          } else {
            cursor = mxConstants.CURSOR_MOVABLE_VERTEX;
          }
        }
        // Sets the cursor on the original source state under the mouse
        // instead of the event source state which can be the parent
        if (cursor != null && me.sourceState != null) {
          me.sourceState.setCursor(cursor);
        }
      }
    };

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
        str = cell.getAttribute('label');
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
      currentIconSet: null,
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
        if (this.currentIconSet != null) {
          this.currentIconSet.destroy();
          this.currentIconSet = null;
        }
        if (tmp) {
          this.currentIconSet = new mxIconSet(tmp);
        }
      },
      mouseUp: function (sender, me) {
        if (isAgentDraging) {
          isAgentDraging = false;
          if (movingAgent) {
            const targetCell = me.getCell();
            if (targetCell && (targetCell.value.tagName === 'Agent' || targetCell.value.tagName === 'Process')) {
              self.rearrange(movingAgent, targetCell);
              movingAgent = null;
            } else {
              detachedAgent(me.evt.target, movingAgent);
            }
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

    graph.isValidDropTarget = function () {
      return false;
    }
  }

  closeMenu(): void {
    this.node = null;
  }

  deleteNode(): void {
    if (this.editor && this.editor.graph && this.node && this.node.cell) {
      this.editor.graph.removeCells([this.node.cell], null);
      this.removeSubagent(this.node.cell);
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
    if (!element || !graph) {
      return;
    }
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
    let i = 0, j = 1;
    let priority = -1;
    let v1;
    let styleColor = '#fafafa';
    if (this.preferences.theme === 'light' || this.preferences.theme === 'lighter') {
      styleColor = '#3d464d';
    }

    if (this.selectedCluster.subagentIds && this.selectedCluster.subagentIds.length > 0) {
      let colorIndex = 0;
      this.selectedCluster.subagentIds.sort(AgentComponent.compare).forEach((subagent, index) => {
        const _node = this.getCellNode('Agent', subagent.subagentId);
        let source;
        let colorCode;
        let flag = this.selectedCluster.subagentIds.length === 1;
        if (priority > -1 && priority !== subagent.priority) {
          j++;
        }
        let y = j * 70;
        if (priority === subagent.priority) {
          i++;
          if (v1) {
            source = v1;
          }
        } else {
          i = 0;
          if (priority > -1) {
            colorIndex++;
          }
        }
        if (this.colors.length - 1 === colorIndex) {
          colorIndex = 0;
        }
        colorCode = this.colors[colorIndex];
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
        v1 = this.editor.graph.insertVertex(defaultParent, null, _node, x, y, 180, 40, 'rectangle;strokeColor=' + colorCode + ';fillColor=' + colorCode + ';gradientColor=#fff;whiteSpace=wrap;html=1');
        if (source) {
          graph.insertEdge(defaultParent, null, doc.createElement('Connection'), source, v1, 'edgeStyle');
        }
        if (flag) {
          const mainNode = doc.createElement('Process');
          mainNode.setAttribute('label', 'dragAndDropForRoundRobin');
          mainNode.setAttribute('priority', priority);
          const v2 = graph.insertVertex(defaultParent, null, mainNode, x + 230, y - 5, 200, 50, 'rectangle;whiteSpace=wrap;html=1;dashed=1;shadow=0;opacity=70;fontColor=' + styleColor + ';strokeColor=' + styleColor + ';');
          graph.insertEdge(defaultParent, null, doc.createElement('Connection'), v1, v2, 'edgeStyle;dashed=1;');
        }
        if (0 === index) {
          const mainNode = doc.createElement('Process');
          mainNode.setAttribute('label', 'dragAndDropFixedPriority');
          mainNode.setAttribute('priority', (priority + 1));
          graph.insertVertex(defaultParent, null, mainNode, 0, -10, 200, 50, 'rectangle;whiteSpace=wrap;html=1;dashed=1;shadow=0;opacity=70;fontColor=' + styleColor + ';strokeColor=' + styleColor + ';');
        }
        if (this.selectedCluster.subagentIds.length - 1 === index) {
          const mainNode = doc.createElement('Process');
          mainNode.setAttribute('label', 'dragAndDropFixedPriority');
          mainNode.setAttribute('priority', -1);
          graph.insertVertex(defaultParent, null, mainNode, 0, y + 70, 200, 50, 'rectangle;whiteSpace=wrap;html=1;dashed=1;shadow=0;opacity=70;fontColor=' + styleColor + ';strokeColor=' + styleColor + ';');
        }
      })
    } else {
      const mainNode = doc.createElement('Process');
      mainNode.setAttribute('label', 'dragAndDropFixedPriority');
      mainNode.setAttribute('priority', 0);
      graph.insertVertex(defaultParent, null, mainNode, 0, 0, 200, 50, 'rectangle;whiteSpace=wrap;html=1;dashed=1;shadow=0;opacity=70;fontColor=' + styleColor + ';strokeColor=' + styleColor + ';');
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
