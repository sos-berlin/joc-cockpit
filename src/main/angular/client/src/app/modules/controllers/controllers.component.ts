import {Component, inject} from '@angular/core';
import {NZ_MODAL_DATA, NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
import {NzMessageService} from 'ng-zorro-antd/message';
import {Subscription} from 'rxjs';
import {Router} from "@angular/router";
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {CoreService} from '../../services/core.service';
import {StartUpModalComponent} from '../start-up/start-up.component';
import {ConfirmModalComponent} from '../../components/comfirm-modal/confirm.component';
import {AuthService} from '../../components/guard';
import {DataService} from '../../services/data.service';
import {CommentModalComponent} from '../../components/comment-modal/comment.component';
import {AddCertificateModalComponent, AgentModalComponent, ShowCertificateListModalComponent, SubagentModalComponent} from "./agent/agent.component";
import {FileUploaderComponent} from "../../components/file-uploader/file-uploader.component";
import {SearchPipe} from "../../pipes/core.pipe";

@Component({
  selector: 'app-export-modal',
  templateUrl: './export-dialog.html'
})
export class ExportComponent {
  readonly modalData: any = inject(NZ_MODAL_DATA);
  preferences;
  display: any;
  controller: any;
  submitted = false;
  required = false;
  comments: any = {radio: 'predefined'};
  inValid = false;
  exportObj = {
    filename: '',
    fileFormat: 'ZIP'
  };

  fileFormat=[{value: 'ZIP' , name:'ZIP'},
  {value: 'TAR_GZ' , name:'TAR_GZ'}
]

  constructor(public activeModal: NzModalRef, private coreService: CoreService) {
  }

  ngOnInit(): void {
    this.preferences = this.modalData.preferences;
    this.display = this.modalData.display;
    this.controller = this.modalData.controller;
    if (sessionStorage['$SOS$FORCELOGING'] === 'true') {
      this.required = true;
      this.display = true;
    }
    if (!this.controller.agents) {
      this.getAgents(this.controller);
    }
  }

  private getAgents(controller): void {
    if (sessionStorage['hasLicense'] == 'true') {
      this.getClusterAgents(controller);
    }
    this.coreService.post('agents/inventory', {
      controllerId: controller.controllerId
    }).subscribe({
      next: (data: any) => {
        controller.agents = data.agents;
      }
    });
  }

  private getClusterAgents(controller): void {
    controller.isLoading = true;
    this.coreService.post('agents/inventory/cluster', {
      controllerId: controller.controllerId
    }).subscribe({
      next: (data: any) => {
        controller.agentClusters = data.agents;
      }
    });
  }

  checkFileName(): void {
    if (this.exportObj.filename) {
      const ext = this.exportObj.filename.split('.').pop();
      if (ext && this.exportObj.filename.indexOf('.') > -1) {
        if ((ext === 'ZIP' || ext === 'zip')) {
          this.exportObj.fileFormat = 'ZIP';
        } else if ((ext === 'tar' || ext === 'gz')) {
          this.exportObj.fileFormat = 'TAR_GZ';
        }
      } else {
        this.inValid = false;
        this.exportObj.filename = this.exportObj.filename + (this.exportObj.fileFormat === 'ZIP' ? '.zip' : '.tar.gz');
      }
    }
  }

  onSubmit(): void {
    this.submitted = true;
    const obj: any = {
      agentIds: [],
      exportFile: {filename: this.exportObj.filename, format: this.exportObj.fileFormat}
    };
    if (this.comments.comment) {
      obj.auditLog = {};
      this.coreService.getAuditLogObj(this.comments, obj.auditLog);
    }

    if (this.controller.agents) {
      this.controller.agents.forEach((agent) => {
        obj.agentIds.push(agent.agentId);
      })
    }
    if (this.controller.agentClusters) {
      this.controller.agentClusters.forEach((agent) => {
        obj.agentIds.push(agent.agentId);
      })
    }

    if (obj.agentIds.length > 0) {
      this.coreService.download('agents/export', obj, this.exportObj.filename, (res) => {
        if (res) {
          this.activeModal.close('ok');
        } else {
          this.submitted = false;
        }
      });
    }
  }

  cancel(): void {
    this.activeModal.destroy();
  }

}


@Component({
  selector: 'app-create-token-modal',
  templateUrl: './create-token.dialog.html'
})
export class CreateTokenModalComponent {
  readonly modalData: any = inject(NZ_MODAL_DATA);
  agents: any;
  clusterAgents: any;
  agent: any;
  data: any;
  controllerId: any;
  token: any = {
    at: 'date'
  };
  dateFormat: string;
  submitted = false;
  comments: any = {};
  preferences: any;
  display: any;
  required = false;
  viewDate = new Date();
  zones = [];

  constructor(public coreService: CoreService, public activeModal: NzModalRef) {
  }

  ngOnInit(): void {
    this.agents = this.modalData.agents;
    this.clusterAgents = this.modalData.clusterAgents;
    this.agent = this.modalData.agent;
    this.data = this.modalData.data;
    this.controllerId = this.modalData.controllerId;
    if (sessionStorage['preferences']) {
      this.preferences = JSON.parse(sessionStorage['preferences']) || {};
    }
    this.zones = this.coreService.getTimeZoneList();
    this.display = this.preferences.auditLog;
    this.dateFormat = this.coreService.getDateFormat(this.preferences.dateFormat);
    this.token.timezone = this.preferences.zone;
    this.comments.radio = 'predefined';
    if (sessionStorage['$SOS$FORCELOGING'] === 'true') {
      this.required = true;
      this.display = true;
    }
  }

  selectTime(time, isEditor = false): void {
    this.coreService.selectTime(time, isEditor, this.token);
  }

  onSubmit(): void {
    this.submitted = true;
    const obj: any = {
      timezone: this.token.timezone
    };
    if (this.agent) {
      obj.agentIds = [this.agent.agentId];
    } else if ((this.agents && this.agents.size > 0) || (this.clusterAgents && this.clusterAgents.size > 0)) {
      if (this.agents && this.agents.size > 0) {
        obj.agentIds = Array.from(this.agents);
      }
      if (this.clusterAgents && this.clusterAgents.size > 0) {
        if (!obj.agentIds) {
          obj.agentIds = [];
        }
        obj.agentIds = obj.agentIds.concat(Array.from(this.agents));
      }
    } else {
      obj.controllerId = this.controllerId;
    }
    if (this.display) {
      obj.auditLog = {};
      this.coreService.getAuditLogObj(this.comments, obj.auditLog);
    }

    if (this.token.fromDate && this.token.at === 'date') {
      this.coreService.getDateAndTime(this.token);
      obj.validUntil = this.coreService.getDateByFormat(this.token.fromDate, null, 'YYYY-MM-DD HH:mm:ss');
    } else {
      obj.validUntil = this.token.atTime;
    }
    this.coreService.post('token/create', obj).subscribe({
      next: res => {
        this.activeModal.close(res);
      }, error: () => this.submitted = false
    });
  }

}

@Component({
  selector: 'app-controllers',
  templateUrl: './controllers.component.html'
})
export class ControllersComponent {
  data: any = [];
  controllers: any = [];
  tokens: any = [];
  currentSecurityLevel: string;
  permission: any = {};
  securityLevel: string;
  preferences: any = {};
  agentsFilters: any = {};
  loading = false;
  isLoaded = false;
  hasLicense = false;
  isActionMenuVisible = false;
  agentVersions: any = [];
  searchableProperties = ['agentId', 'agentName', 'url'];
  object = {
    mapOfCheckedId2: new Map(),
    mapOfCheckedId3: new Map(),
    mapOfCheckedId: new Map()
  };
  isJOCActive = false;

  subscription1: Subscription;

  constructor(public coreService: CoreService, private modal: NzModalService, private message: NzMessageService,
              private searchPipe: SearchPipe,
              private authService: AuthService, private dataService: DataService, private router: Router) {
    this.subscription1 = dataService.eventAnnounced$.subscribe(res => {
      this.refresh(res);
    });
  }

  ngOnInit(): void {
    this.isJOCActive = sessionStorage['$SOS$ISJOCACTIVE'] == 'YES';
    this.permission = JSON.parse(this.authService.permission) || {};
    this.agentsFilters = this.coreService.getControllerTab();
    this.securityLevel = sessionStorage['securityLevel'];
    if (sessionStorage['preferences']) {
      this.preferences = JSON.parse(sessionStorage['preferences']) || {};
    }
    this.hasLicense = sessionStorage['hasLicense'] == 'true';
    this.getTokens();
  }

  ngOnDestroy(): void {
    this.subscription1.unsubscribe();
  }

  private refresh(args: { eventSnapshots: any[] }): void {
    if (args.eventSnapshots && args.eventSnapshots.length > 0) {
      for (let j = 0; j < args.eventSnapshots.length; j++) {
        if (args.eventSnapshots[j].eventType === 'AgentChanged' || args.eventSnapshots[j].eventType === 'AgentInventoryUpdated' || args.eventSnapshots[j].eventType === 'AgentStateChanged'
          || ((args.eventSnapshots[j].eventType === 'ProxyCoupled' || args.eventSnapshots[j].eventType === 'ProxyDecoupled' || args.eventSnapshots[j].eventType.match(/Item/))
            && args.eventSnapshots[j].objectType === 'AGENT')) {
          if (this.controllers.length > 0) {
            for (let i = 0; i < this.controllers.length; i++) {
              if (this.controllers[i] && this.coreService.preferences.controllers.has(this.controllers[i].controllerId)) {
                this.refreshView(this.controllers[i]);
              }
            }
          }
        } else if (args.eventSnapshots[j].eventType === 'ControllerStateChanged' || ((args.eventSnapshots[j].eventType === 'ProxyCoupled'
          || args.eventSnapshots[j].eventType === 'ProxyDecoupled' || args.eventSnapshots[j].eventType.match(/Item/)) && args.eventSnapshots[j].objectType === 'CONTROLLER')) {
          this.isLoaded = false;
          this.refreshView();
          break;
        }
      }
    }
  }

  private refreshView(obj?): void {
    if ((!this.isActionMenuVisible && (this.object.mapOfCheckedId.size === 0 || this.object.mapOfCheckedId2.size === 0))) {
      if (obj) {
        this.getAgents(obj, null);
      } else {
        this.getSchedulerIds();
      }
    } else {
      setTimeout(() => {
        this.refreshView(obj);
      }, 750);
    }
  }

  onVisible(value: boolean): void {
    this.isActionMenuVisible = value;
  }

  private getTokens(flag = true): void {
    if (this.permission.joc && this.permission.joc.administration.certificates.manage) {
      this.coreService.post('token/show', {}).subscribe({
        next: (data: any) => {
          this.tokens = data.tokens;
          if (!flag) {
            this.checkTokens();
          } else {
            this.getData();
          }
        }, error: () => {
          if (flag) {
            this.getData();
          }
        }
      });
    } else {
      if (flag) {
        this.getData();
      }
    }
  }

  getData(): void {
    this.coreService.post('controller/ids', {}).subscribe({
      next: (data: any) => {
        this.data = data.controllerIds;
        if (this.coreService.preferences.isFirst && this.coreService.preferences.controllers.size === 0) {
          this.coreService.preferences.isFirst = false;
          this.coreService.preferences.controllers.add(data.selected);
        }
        this.getSecurity();
      }, error: () => this.loading = true
    });
  }

  getAgents(controller, cb): void {
    if (controller && (!controller.agents || !cb)) {
      if (this.hasLicense) {
        this.getClusterAgents(controller);
      }
      controller.loading = true;
      this.coreService.post('agents/inventory', {
        controllerId: controller.controllerId
      }).subscribe({
        next: (data: any) => {
          controller.loading = false;
          controller.agents = data.agents;
          controller.agents.forEach((agent) => {
            this.mergeAgentVersions(agent);
            this.mergeTokenData(null, agent.agentId, agent);
          });
          this.filterAgentList(controller);
          if (cb) {
            cb();
          }
        }, error: () => {
          controller.agents = [];
          controller.loading = false;
          if (cb) {
            cb();
          }
        }
      });
    } else if (cb) {
      cb();
    }
  }

  getClusterAgents(controller): void {
    controller.isLoading = true;
    this.coreService.post('agents/inventory/cluster', {
      controllerId: controller.controllerId
    }).subscribe({
      next: (data: any) => {
        const temp = controller.agentClusters ? this.coreService.clone(controller.agentClusters) : [];
        controller.agentClusters = data.agents;
        controller.isLoading = false;
        controller.agentClusters.forEach((agent) => {
          this.mergeTokenData(null, agent.agentId, agent);
          this.mergeAgentVersions(agent);
          if (agent.subagents) {
            agent.subagents.forEach(sub => {
              this.mergeAgentVersions(sub);
            })
          }
          if (temp.length > 0) {
            for (const i in temp) {
              if (temp[i].agentId === agent.agentId) {
                agent.show = temp[i].show;
                break;
              }
            }
          }
        });
        this.filterAgentList(controller);
      }, error: () => {
        controller.agentClusters = [];
        controller.isLoading = false;
      }
    });
  }

  expand(controllerId: string): void {
    this.coreService.preferences.controllers.add(controllerId);
  }

  collapse(controllerId: string): void {
    this.coreService.preferences.controllers.delete(controllerId);
  }

  sort(controller, key, isCluster = false): void {
    if (isCluster) {
      controller.reverse2 = !controller.reverse2;
      controller.sortBy2 = key;
    } else {
      controller.reverse = !controller.reverse;
      controller.sortBy = key;
    }
  }

  drop(event: CdkDragDrop<string[]>, clusterAgents: any): void {
    if (event.previousIndex != event.currentIndex) {
      let index = (event.previousIndex < event.currentIndex) ? event.currentIndex : event.currentIndex - 1;
      this.coreService.post('agents/inventory/cluster/subagents/ordering', {
        subagentId: clusterAgents.subagents[event.previousIndex].subagentId,
        predecessorSubagentId: index > -1 ? clusterAgents.subagents[index].subagentId : undefined
      }).subscribe();
      moveItemInArray(clusterAgents.subagents, event.previousIndex, event.currentIndex);
      for (let i = 0; i < clusterAgents.subagents.length; i++) {
        clusterAgents.subagents[i].ordering = i + 1;
      }
    }
  }

  agentsReordering(event: CdkDragDrop<string[]>, agents: any[]): void {
    if (event.previousIndex != event.currentIndex) {
      let index = (event.previousIndex < event.currentIndex) ? event.currentIndex : event.currentIndex - 1;
      this.coreService.post('agents/inventory/ordering', {
        agentId: agents[event.previousIndex].agentId,
        predecessorAgentId: index > -1 ? agents[index].agentId : undefined
      }).subscribe();
      moveItemInArray(agents, event.previousIndex, event.currentIndex);
      for (let i = 0; i < agents.length; i++) {
        agents[i].ordering = i + 1;
      }
    }
  }

  clusterAgentsReordering(event: CdkDragDrop<string[]>, clusterAgents: any[]): void {
    if (event.previousIndex != event.currentIndex) {
      let index = (event.previousIndex < event.currentIndex) ? event.currentIndex : event.currentIndex - 1;
      this.coreService.post('agents/inventory/cluster/ordering', {
        agentId: clusterAgents[event.previousIndex].agentId,
        predecessorAgentId: index > -1 ? clusterAgents[index].agentId : undefined
      }).subscribe();
      moveItemInArray(clusterAgents, event.previousIndex, event.currentIndex);
      for (let i = 0; i < clusterAgents.length; i++) {
        clusterAgents[i].ordering = i + 1;
      }
    }
  }

  navToController(controllerId, agentId): void {
    this.router.navigate(['/controllers/cluster_agent', controllerId, agentId]).then();
  }

  exportAgents(controller): void {
    this.modal.create({
      nzTitle: undefined,
      nzContent: ExportComponent,
      nzAutofocus: null,
      nzData: {
        preferences: this.preferences,
        display: this.preferences.auditLog,
        controller
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
  }

  importAgents(controller): void {
    this.modal.create({
      nzTitle: undefined,
      nzContent: FileUploaderComponent,
      nzClassName: 'lg',
      nzAutofocus: null,
      nzData: {
        type: 'CONTROLLER',
        display: this.preferences.auditLog,
        controller
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
  }

  addController(): void {
    const modalInstance = this.modal.create({
      nzTitle: undefined,
      nzContent: StartUpModalComponent,
      nzClassName: 'lg',
      nzAutofocus: null,
      nzData: {
        new: true,
        modalRef: true
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modalInstance.afterClose.subscribe(result => {
      if (result && this.controllers.length === 0) {
        this.isLoaded = false;
        this.getSchedulerIds();
      }
    });
  }

  editController(controller): void {
    if (this.permission.joc && this.permission.joc.administration.controllers.manage) {
      this.coreService.post('controllers/p', {controllerId: controller}).subscribe((res: any) => {
        const modalInstance = this.modal.create({
          nzTitle: undefined,
          nzContent: StartUpModalComponent,
          nzClassName: 'lg',
          nzAutofocus: null,
          nzData: {
            controllerInfo: res.controllers,
            modalRef: true
          },
          nzFooter: null,
          nzClosable: false,
          nzMaskClosable: false
        });
        modalInstance.afterClose.subscribe(result => {
          if (result && this.controllers.length === 0) {
            if (!this.isLoaded) {
              this.getSchedulerIds();
            }
          }
        });
      });
    }
  }

  deleteController(matser): void {
    if (this.preferences.auditLog) {
      const comments = {
        radio: 'predefined',
        type: 'Controller',
        operation: 'Delete',
        name: ''
      };
      const modal = this.modal.create({
        nzTitle: undefined,
        nzContent: CommentModalComponent,
        nzClassName: 'lg',
        nzAutofocus: null,
        nzData: {
          comments,
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      });
      modal.afterClose.subscribe(result => {
        if (result) {
          this._deleteController(matser, result);
        }
      });
    }else {
      const modal = this.modal.create({
        nzTitle: undefined,
        nzContent: ConfirmModalComponent,
        nzAutofocus: null,
        nzData: {
          title: 'delete',
          message: 'deleteController',
          type: 'Delete',
          objectName: matser
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      });
      modal.afterClose.subscribe(result => {
        if (result) {
          this._deleteController(matser);
        }
      });
    }
  }

  private _deleteController(matser, auditLog = {}): void {
    this.coreService.post('controller/cleanup', {controllerId: matser, auditLog}).subscribe(() => {
      setTimeout(() => {
        if (!this.isLoaded) {
          this.getSchedulerIds();
        }
      }, 250);
    });
  }

  createToken(controller, agent = null): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: CreateTokenModalComponent,
      nzAutofocus: null,
      nzData: {
        controllerId: controller ? controller.controllerId : '',
        agents: this.object.mapOfCheckedId,
        clusterAgents: this.object.mapOfCheckedId2,
        agent
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        this.resetCheckbox();
        this.getTokens(false);
      }
    });
  }

  deleteAll(subagent = false): void {
    if (this.preferences.auditLog) {
      const comments = {
        radio: 'predefined',
        type: subagent ? 'Subagent' : 'Agent',
        operation: 'Delete',
        name: ''
      };
      const modal = this.modal.create({
        nzTitle: undefined,
        nzContent: CommentModalComponent,
        nzClassName: 'lg',
        nzAutofocus: null,
        nzData: {
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
        nzAutofocus: null,
        nzData: {
          title: 'delete',
          message: subagent ? 'deleteSubagent' : 'deleteSelectedAgents',
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
    this.object.mapOfCheckedId.forEach((k, v) => {
      this.coreService.post('agent/delete', {
        controllerId: k,
        agentId: v,
        auditLog
      }).subscribe();
    })
    this.object.mapOfCheckedId2.forEach((k, v) => {
      this.coreService.post('agent/delete', {
        controllerId: k,
        agentId: v,
        auditLog
      }).subscribe();
    });
    this.object.mapOfCheckedId3.forEach((k, v) => {
      this.coreService.post('agents/inventory/cluster/subagents/delete', {
        controllerId: k,
        subagentIds: [v],
        auditLog
      }).subscribe();
    });
    this.resetCheckbox();
  }

  deployAll(): void {
    this.revokeAndDeploy('deploy');
  }

  revokeAll() {
    this.revokeAndDeploy('revoke');
  }

  private revokeAndDeploy(type) {
    if (this.preferences.auditLog) {
      let comments = {
        radio: 'predefined',
        type: 'Agent',
        operation: type === 'revoke' ? 'Revoke' : 'Deploy',
        name: ''
      };
      this.modal.create({
        nzTitle: undefined,
        nzContent: CommentModalComponent,
        nzClassName: 'lg',
        nzAutofocus: null,
        nzData: {
          comments,
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      }).afterClose.subscribe(result => {
        if (result) {
          this._revokeAndDeploy(type, result);
        }
      });
    } else {
      this._revokeAndDeploy(type);
    }
  }

  private _revokeAndDeploy(type, auditLog = {}): void {
    this.object.mapOfCheckedId.forEach((k, v) => {
      this.coreService.post('agents/inventory/' + type, {
        controllerId: k,
        agentIds: [v],
        auditLog
      }).subscribe();
    })
    this.object.mapOfCheckedId2.forEach((k, v) => {
      this.coreService.post('agents/inventory/cluster/' + type, {
        controllerId: k,
        clusterAgentIds: [v],
        auditLog
      }).subscribe();
    });
    this.resetCheckbox();
  }

  hideAll() {
    let reqArr = [];
    this.controllers.forEach((controller) => {
      let obj = {
        controllerId: controller.controllerId,
        agents: [],
        auditLog: {}
      };
      if (controller.agents) {
        controller.agents.forEach((agent) => {
          if (this.object.mapOfCheckedId.has(agent.agentId)) {
            agent.hidden = true;
            obj.agents.push(agent);
          }
        });
        if (obj.agents.length > 0) {
          reqArr.push(obj);
        }
      }
    });

    if (this.preferences.auditLog) {
      let comments = {
        radio: 'predefined',
        type: 'Agent',
        operation: 'Hide',
        name: ''
      };

      const modal = this.modal.create({
        nzTitle: undefined,
        nzContent: CommentModalComponent,
        nzClassName: 'lg',
        nzAutofocus: null,
        nzData: {
          comments
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      });
      modal.afterClose.subscribe(result => {
        if (result) {
          reqArr.forEach((req) => {
            req.auditLog = result;
            this.coreService.post('agents/inventory/store', req).subscribe();
          })
        }
      });
    } else {
      reqArr.forEach((req) => {
        this.coreService.post('agents/inventory/store', req).subscribe();
      })
    }
    this.resetCheckbox();
  }

  disableAll(subagent = false): void {
    if (this.preferences.auditLog) {
      let comments = {
        radio: 'predefined',
        type: subagent ? 'Subagent' : 'Agent',
        operation: 'Disable',
        name: ''
      };

      const modal = this.modal.create({
        nzTitle: undefined,
        nzContent: CommentModalComponent,
        nzClassName: 'lg',
        nzAutofocus: null,
        nzData: {
          comments
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      });
      modal.afterClose.subscribe(result => {
        if (result) {
          if (subagent) {
            this.object.mapOfCheckedId3.forEach((value, key) => {
              this.coreService.post('agents/inventory/cluster/subagents/disable', {
                controllerId: value,
                subagentIds: [key],
                auditLog: result || {}
              }).subscribe();
            })
          } else {
            this.object.mapOfCheckedId.forEach((k, v) => {
              this.coreService.post('agents/inventory/disable', {
                controllerId: k,
                agentIds: [v],
                auditLog: result || {}
              }).subscribe();
            })
          }
        }
      });
    } else {
      if (subagent) {
        this.object.mapOfCheckedId3.forEach((value, key) => {
          this.coreService.post('agents/inventory/cluster/subagents/disable', {
            controllerId: value,
            subagentIds: [key]
          }).subscribe();
        })
      } else {
        this.object.mapOfCheckedId.forEach((k, v) => {
          this.coreService.post('agents/inventory/disable', {
            controllerId: k,
            agentIds: [v]
          }).subscribe();
        })
      }
    }
    this.resetCheckbox();
  }

  enableAll(subagent = false): void {
    if (this.preferences.auditLog) {
      let comments = {
        radio: 'predefined',
        type: subagent ? 'Subagent' : 'Agent',
        operation: 'enable',
        name: ''
      };

      const modal = this.modal.create({
        nzTitle: undefined,
        nzContent: CommentModalComponent,
        nzClassName: 'lg',
        nzAutofocus: null,
        nzData: {
          comments
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      });
      modal.afterClose.subscribe(result => {

        if (result) {
          if (subagent) {
            this.object.mapOfCheckedId3.forEach((value, key) => {
              this.coreService.post('agents/inventory/cluster/subagents/enable', {
                controllerId: value,
                subagentIds: [key],
                auditLog: result || {}
              }).subscribe();
            })
          } else {
            this.object.mapOfCheckedId.forEach((k, v) => {
              this.coreService.post('agents/inventory/enable', {
                controllerId: k,
                agentIds: [v],
                auditLog: result || {}
              }).subscribe();
            })
          }
        }
      });
    } else {
      if (subagent) {
        this.object.mapOfCheckedId3.forEach((value, key) => {
          this.coreService.post('agents/inventory/cluster/subagents/enable', {
            controllerId: value,
            subagentIds: [key]
          }).subscribe();
        })
      } else {
        this.object.mapOfCheckedId.forEach((k, v) => {
          this.coreService.post('agents/inventory/enable', {
            controllerId: k,
            agentIds: [v]
          }).subscribe();
        })
      }
    }
    this.resetCheckbox();
  }

  disableAllSubAgent() {
    this.disableAll(true);
  }

  enableAllSubAgent() {
    this.enableAll(true);
  }

  resetAllSubagent(force = false): void {
    this.resetAll(force, true);
  }

  deleteAllSubagent(): void {
    this.deleteAll(true);
  }

  resetAll(force = false, subagent = false) {
    if (this.preferences.auditLog) {
      const comments = {
        radio: 'predefined',
        type: 'Agent',
        operation: 'Reset',
        name: ''
      };
      this.modal.create({
        nzTitle: undefined,
        nzContent: CommentModalComponent,
        nzClassName: 'lg',
        nzAutofocus: null,
        nzData: {
          comments
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      }).afterClose.subscribe(result => {
        if (result) {
          if (!subagent) {
            this.controllers.forEach((controller) => {
              let obj = {
                controllerId: controller.controllerId,
                agentIds: [],
                force,
                auditLog: result
              };
              if (controller.agents) {
                controller.agents.forEach((agent) => {
                  if (this.object.mapOfCheckedId.has(agent.agentId)) {
                    obj.agentIds.push(agent.agentId);
                  }
                });
                if (obj.agentIds.length > 0) {
                  this.coreService.post('agents/reset', obj).subscribe();
                }
              }
            });
          } else {
            this.restSubagents(force);
          }
          this.resetCheckbox();
        }
      });
    } else if (force) {
      const modal = this.modal.create({
        nzTitle: undefined,
        nzContent: ConfirmModalComponent,
        nzAutofocus: null,
        nzData: {
          title: 'resetForced',
          message: 'resetAgentConfirmation',
          type: 'Reset',
          objectName: '',
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      });
      modal.afterClose.subscribe(result => {
        if (result) {
          if (!subagent) {
            this.controllers.forEach((controller) => {
              let obj = {
                controllerId: controller.controllerId,
                agentIds: [],
                force: true,
                auditLog: {}
              };
              if (controller.agents) {
                controller.agents.forEach((agent) => {
                  if (this.object.mapOfCheckedId.has(agent.agentId)) {
                    obj.agentIds.push(agent.agentId);
                  }
                });
                if (obj.agentIds.length > 0) {
                  this.coreService.post('agents/reset', obj).subscribe();
                }
              }
            });
          } else {
            this.restSubagents(force);
          }
          this.resetCheckbox();
        }
      });

    } else {
      if (!subagent) {
        this.controllers.forEach((controller) => {
          let obj = {
            controllerId: controller.controllerId,
            agentIds: [],
            force: false,
            auditLog: {}
          };
          if (controller.agents) {
            controller.agents.forEach((agent) => {
              if (this.object.mapOfCheckedId.has(agent.agentId)) {
                obj.agentIds.push(agent.agentId);
              }
            });
            if (obj.agentIds.length > 0) {
              this.coreService.post('agents/reset', obj).subscribe();
            }
          }
        });
      } else {
        this.restSubagents(force);
      }
      this.resetCheckbox();
    }
  }

  private restSubagents(force): void {
    this.object.mapOfCheckedId3.forEach((value, key) => {
      this.coreService.post('agents/inventory/cluster/subagent/reset', {
        controllerId: value,
        subagentId: key,
        force
      }).subscribe();
    });
  }

  addAgent(controller): void {
    this.getAgents(controller, () => {
      this.modal.create({
        nzTitle: undefined,
        nzContent: AgentModalComponent,
        nzClassName: 'lg',
        nzAutofocus: null,
        nzData: {
          controllerId: controller.controllerId,
          new: true
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      });
    });
  }

  editAgent(agent, controller, isCluster = false): void {
    if (this.permission.joc && this.permission.joc.administration.controllers.manage) {
      this.getAgents(controller, () => {
        const modal = this.modal.create({
          nzTitle: undefined,
          nzContent: AgentModalComponent,
          nzClassName: 'lg',
          nzAutofocus: null,
          nzData: {
            controllerId: controller.controllerId,
            data: agent,
            isCluster
          },
          nzFooter: null,
          nzClosable: false,
          nzMaskClosable: false
        });
        modal.afterClose.subscribe(result => {
          if (result) {
            if (isCluster) {
              this.getClusterAgents(controller);
            } else {
              this.getAgents(controller, null);
            }
          }
        });
      });
    }
  }

  removeAgent(agent, controller, isCluster = false): void {
    const obj: any = {
      controllerId: controller.controllerId,
      agentId: agent.agentId
    };

    if (this.preferences.auditLog) {
      const comments = {
        radio: 'predefined',
        type: isCluster ? 'Agent Cluster' : 'Agent',
        operation: 'Delete',
        name: agent.agentId
      };
      this.modal.create({
        nzTitle: undefined,
        nzContent: CommentModalComponent,
        nzClassName: 'lg',
        nzAutofocus: null,
        nzData: {
          comments,
          obj,
          url: 'agent/delete'
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      });
    } else {
      const modal = this.modal.create({
        nzTitle: undefined,
        nzContent: ConfirmModalComponent,
        nzData: {
          title: 'delete',
          message: isCluster ? 'deleteClusterAgent' : 'deleteAgent',
          type: 'Delete',
          objectName: agent.agentId,
        },
        nzFooter: null,
        nzAutofocus: null,
        nzClosable: false,
        nzMaskClosable: false
      });
      modal.afterClose.subscribe(result => {
        if (result) {
          this.coreService.post('agent/delete', obj).subscribe();
        }
      });
    }
  }

  addClusterAgent(controller): void {
    this.getAgents(controller, () => {
      const modal = this.modal.create({
        nzTitle: undefined,
        nzContent: AgentModalComponent,
        nzClassName: 'lg',
        nzAutofocus: null,
        nzData: {
          controllerId: controller.controllerId,
          isCluster: true,
          new: true
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      });
      modal.afterClose.subscribe(result => {
        if (result) {
          this.getClusterAgents(controller);
        }
      });
    });
  }

  addSubagent(clusterAgent, controller): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: SubagentModalComponent,
      nzClassName: 'lg',
      nzAutofocus: null,
      nzData: {
        controllerId: controller.controllerId,
        clusterAgent,
        new: true
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        this.getClusterAgents(controller);
      }
    });
  }

  editSubagent(subagent, clusterAgent, controller): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: SubagentModalComponent,
      nzClassName: 'lg',
      nzAutofocus: null,
      nzData: {
        controllerId: controller.controllerId,
        clusterAgent,
        data: subagent
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        this.getClusterAgents(controller);
      }
    });
  }

  removeSubagent(sub, clusterAgent, controller): void {
    const obj = {
      controllerId: controller.controllerId,
      subagentIds: [sub.subagentId]
    };
    if (this.preferences.auditLog) {
      const comments = {
        radio: 'predefined',
        type: 'Subagent',
        operation: 'Delete',
        name: sub.subagentId
      };
      const modal = this.modal.create({
        nzTitle: undefined,
        nzContent: CommentModalComponent,
        nzClassName: 'lg',
        nzAutofocus: null,
        nzData: {
          comments,
          obj,
          url: 'agents/inventory/cluster/subagents/delete'
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      });
      modal.afterClose.subscribe(result => {
        if (result) {
          this.getClusterAgents(controller);
        }
      });
    } else {
      const modal = this.modal.create({
        nzTitle: undefined,
        nzContent: ConfirmModalComponent,
        nzData: {
          title: 'delete',
          message: 'deleteSubagent',
          type: 'Delete',
          objectName: sub.subagentId,
        },
        nzFooter: null,
        nzAutofocus: null,
        nzClosable: false,
        nzMaskClosable: false
      });
      modal.afterClose.subscribe(result => {
        if (result) {
          this.coreService.post('agents/inventory/cluster/subagents/delete', obj).subscribe(() => {
            this.getClusterAgents(controller);
          });
        }
      });
    }
  }

  resetAgent(agent, controller, force = false): void {
    const obj = {
      controllerId: controller.controllerId,
      agentId: agent.agentId,
      force
    };
    this._reset(obj, agent.agentId);
  }

  resetSubagent(sub, clusterAgent, controller, force = false): void {
    const obj = {
      controllerId: controller.controllerId,
      subagentId: sub.subagentId,
      force
    };
    this._reset(obj, sub.subagentId, true);
  }

  private _reset(obj, name, subagent = false) {
    if (this.preferences.auditLog) {
      const comments = {
        radio: 'predefined',
        type: 'Agent',
        operation: 'Reset',
        name: name
      };
      this.modal.create({
        nzTitle: undefined,
        nzContent: CommentModalComponent,
        nzClassName: 'lg',
        nzData: {
          comments,
          obj,
          url: subagent ? 'agents/inventory/cluster/subagent/reset' : 'agent/reset'
        },
        nzFooter: null,
        nzAutofocus: null,
        nzClosable: false,
        nzMaskClosable: false
      });
    } else if (obj.force) {
      const modal = this.modal.create({
        nzTitle: undefined,
        nzContent: ConfirmModalComponent,
        nzData: {
          title: 'resetForced',
          message: 'resetAgentConfirmation',
          type: 'Reset',
          objectName: obj.agentId,
        },
        nzFooter: null,
        nzAutofocus: null,
        nzClosable: false,
        nzMaskClosable: false
      });
      modal.afterClose.subscribe(result => {
        if (result) {
          this.coreService.post(subagent ? 'agents/inventory/cluster/subagent/reset' : 'agent/reset', obj).subscribe();
        }
      });

    } else {
      this.coreService.post(subagent ? 'agents/inventory/cluster/subagent/reset' : 'agent/reset', obj).subscribe();
    }
  }

  hideAgent(agent, controller): void {
    this.hideAndShow(agent, controller, true);
  }

  showAgent(agent, controller): void {
    this.hideAndShow(agent, controller, false);
  }

  private hideAndShow(agent, controller, flag): void {
    const obj: any = {
      controllerId: controller.controllerId,
      agents: [agent]
    };
    if (this.preferences.auditLog) {
      let comments = {
        radio: 'predefined',
        type: 'Agent',
        operation: flag ? 'Hide' : 'Show',
        name: ''
      };
      const modal = this.modal.create({
        nzTitle: undefined,
        nzContent: CommentModalComponent,
        nzClassName: 'lg',
        nzAutofocus: null,
        nzData: {
          comments
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      });
      modal.afterClose.subscribe(result => {
        if (result) {
          agent.hidden = flag;
          this.coreService.post('agents/inventory/store', obj).subscribe({
            error: () => {
              agent.hidden = !flag;
            }
          });
        }
      });
    } else {
      agent.hidden = flag;
      this.coreService.post('agents/inventory/store', obj).subscribe({
        error: () => {
          agent.hidden = !flag;
        }
      });
    }
  }

  disableEnableSubagent(subagent, controller, isEnable, isAgent = false): void {
    let URL = isEnable ? 'agents/inventory/cluster/subagents/enable' : 'agents/inventory/cluster/subagents/disable';
    const obj: any = {
      controllerId: controller.controllerId
    }
    if (isAgent) {
      URL = isEnable ? 'agents/inventory/enable' : 'agents/inventory/disable';
      obj.agentIds = [subagent.agentId];
    } else {
      obj.subagentIds = [subagent.subagentId];
    }
    if (this.preferences.auditLog) {
      let comments = {
        radio: 'predefined',
        type: isAgent ? 'Agent' : 'Subagent',
        operation: isEnable ? 'Enable' : 'Disable',
        name: isAgent ? subagent.agentId : subagent.subagentId
      };
      const modal = this.modal.create({
        nzTitle: undefined,
        nzContent: CommentModalComponent,
        nzClassName: 'lg',
        nzAutofocus: null,
        nzData: {
          comments
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      });
      modal.afterClose.subscribe(result => {
        if (result) {
          obj.auditLog = result;
          this.coreService.post(URL, obj).subscribe();
        }
      });
    } else {
      this.coreService.post(URL, obj).subscribe();
    }
  }

  revoke(clusterAgent, controller, isAgent = false) {
    const obj: any = {
      controllerId: controller.controllerId
    };
    if (isAgent) {
      obj.agentIds = [clusterAgent.agentId];
    } else {
      obj.clusterAgentIds = [clusterAgent.agentId];
    }
    if (this.preferences.auditLog) {
      const comments = {
        radio: 'predefined',
        type: isAgent ? 'Agent' : 'Agent Cluster',
        operation: 'Revoke',
        name: clusterAgent.agentId
      };
      this.modal.create({
        nzTitle: undefined,
        nzContent: CommentModalComponent,
        nzClassName: 'lg',
        nzAutofocus: null,
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
          this.coreService.post(isAgent ? 'agents/inventory/revoke' : 'agents/inventory/cluster/revoke', obj).subscribe();
        }
      });
    } else {
      this.coreService.post(isAgent ? 'agents/inventory/revoke' : 'agents/inventory/cluster/revoke', obj).subscribe();
    }
  }

  deployAgent(agent, controller, isAgent = false): void {
    const obj: any = {
      controllerId: controller.controllerId,
    };
    if (isAgent) {
      obj.agentIds = [agent.agentId];
    } else {
      obj.clusterAgentIds = [agent.agentId];
    }
    if (this.preferences.auditLog) {
      let comments = {
        radio: 'predefined',
        type: isAgent ? 'Standalone Agent' : 'Agent Cluster',
        operation: 'Deploy',
        name: agent.agentId
      };
      this.modal.create({
        nzTitle: undefined,
        nzContent: CommentModalComponent,
        nzClassName: 'lg',
        nzAutofocus: null,
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
          this.coreService.post(isAgent ? 'agents/inventory/deploy' : 'agents/inventory/cluster/deploy', obj).subscribe(() => this.getClusterAgents(controller));
        }
      });
    } else {
      this.coreService.post(isAgent ? 'agents/inventory/deploy' : 'agents/inventory/cluster/deploy', obj).subscribe(() => this.getClusterAgents(controller));
    }
  }

  private getSecurity(): void {
    this.coreService.post('controllers/security_level', {}).subscribe({
      next: (data: any) => {
        this.mergeData(data);
      }, error: () => {
        this.mergeData(null);
      }
    });
  }

  checkAll(value: boolean, controller, isCluster = false): void {
    if (isCluster) {
      if (value && controller.agentClusters.length > 0) {
        controller.agentClusters.forEach(item => {
          if (!item.disabled) {
            this.object.mapOfCheckedId2.set(item.agentId, controller.controllerId);
          }
        });
      } else {
        controller.agentClusters.forEach(item => {
          this.object.mapOfCheckedId2.delete(item.agentId);
        });
      }
    } else {
      if (value && controller.agents.length > 0) {
        controller.agents.forEach(item => {
          if (item) {
            this.object.mapOfCheckedId.set(item.agentId, controller.controllerId);
          }
        });
      } else {
        controller.agents.forEach(item => {
          this.object.mapOfCheckedId.delete(item.agentId);
        });
      }
    }
    let count = 0;
    if (isCluster) {
      if (this.object.mapOfCheckedId2.size > 0) {
        controller.agentClusters.forEach(item => {
          if (this.object.mapOfCheckedId2.has(item.agentId)) {
            ++count;
          }
        });
      }
      controller.indeterminate2 = count > 0 && !controller.checked2;
    } else {
      if (this.object.mapOfCheckedId.size > 0) {
        controller.agents.forEach(item => {
          if (this.object.mapOfCheckedId.has(item.agentId)) {
            ++count;
          }
        });
      }
      controller.indeterminate = count > 0 && !controller.checked;
    }
  }

  checkAllSubagent(isChecked: boolean, agent): void {
    if (isChecked && agent.subagents.length > 0) {
      agent.subagents.forEach(item => {
        if (item) {
          this.object.mapOfCheckedId3.set(item.subagentId, agent.controllerId);
        }
      });
    } else {
      agent.subagents.forEach(item => {
        this.object.mapOfCheckedId3.delete(item.subagentId);
      });
    }
  }

  onItemCheckedSubagent(agent: any, subagent: any, checked: boolean): void {
    if (checked) {
      this.object.mapOfCheckedId3.set(subagent.subagentId, agent.controllerId);
    } else {
      this.object.mapOfCheckedId3.delete(subagent.subagentId);
    }
    let count = 0;
    if (this.object.mapOfCheckedId3.size > 0) {
      agent.subagents.forEach(item => {
        if (this.object.mapOfCheckedId3.has(item.subagentId)) {
          ++count;
        }
      });
    }
    agent.checked = count === agent.subagents.length;
    agent.indeterminate = count > 0 && !agent.checked;

  }

  onItemChecked(controller: any, agent: any, checked: boolean, isCluster = false): void {
    if (checked) {
      if (isCluster) {
        this.object.mapOfCheckedId2.set(agent.agentId, controller.controllerId);
      } else {
        this.object.mapOfCheckedId.set(agent.agentId, controller.controllerId);
      }
    } else {
      if (isCluster) {
        this.object.mapOfCheckedId2.delete(agent.agentId);
      } else {
        this.object.mapOfCheckedId.delete(agent.agentId);
      }
    }
    let count = 0;
    if (isCluster) {
      if (this.object.mapOfCheckedId2.size > 0) {
        controller.agentClusters.forEach(item => {
          if (this.object.mapOfCheckedId2.has(item.agentId)) {
            ++count;
          }
        });
      }
      controller.checked2 = count === controller.agentClusters.length;
      controller.indeterminate2 = count > 0 && !controller.checked2;
    } else {
      if (this.object.mapOfCheckedId.size > 0) {
        controller.agents.forEach(item => {
          if (this.object.mapOfCheckedId.has(item.agentId)) {
            ++count;
          }
        });
      }
      controller.checked = count === controller.agents.length;
      controller.indeterminate = count > 0 && !controller.checked;
    }
  }

  private resetCheckbox(): void {
    this.object.mapOfCheckedId.clear();
    this.object.mapOfCheckedId2.clear();
    this.object.mapOfCheckedId3.clear();
    this.controllers.forEach((controller) => {
      controller.checked = false;
      controller.checked2 = false;
      controller.indeterminate = false;
      controller.indeterminate2 = false;
    });
  }

  private mergeTokenData(controllerId, agentId, obj): void {
    delete obj.token;
    for (const tk in this.tokens) {
      if ((controllerId && this.tokens[tk].controllerId === controllerId)
        || (agentId && this.tokens[tk].agentId === agentId)) {
        if (obj.token && obj.token.validUntil === this.tokens[tk].validUntil) {
          obj.token.URI2 = this.tokens[tk].URI;
          obj.token.UUID2 = this.tokens[tk].UUID;
        } else {
          obj.token = this.tokens[tk];
        }
      }
    }
  }

  private checkTokens(): void {
    this.controllers.forEach((controller) => {
      controller.checked = false;
      controller.checked2 = false;
      controller.indeterminate = false;
      controller.indeterminate2 = false;
      this.mergeTokenData(controller.controllerId, null, controller);
      if (controller.agents) {
        controller.agents.forEach((agent) => {
          this.mergeTokenData(null, agent.agentId, agent);
        });
      }
      if (controller.agentClusters) {
        controller.agentClusters.forEach((agent) => {
          this.mergeTokenData(null, agent.agentId, agent);
        });
      }
    });
  }

  private getVesrions(controllerIds): void {
    this.coreService.post('joc/versions', {controllerIds}).subscribe({
      next: (res) => {
        this.agentVersions = res.agentVersions;
        this.controllers.forEach(controller => {
          for (let i = 0; i < res.controllerVersions.length; i++) {
            if (controller.controllerId === res.controllerVersions[i].controllerId) {
              controller.compatibility = res.controllerVersions[i].compatibility;
              res.controllerVersions.splice(i, 1);
              break;
            }
          }
        })
      }
    });
  }

  private mergeAgentVersions(agent): void {
    for (let i in this.agentVersions) {
      if (this.agentVersions[i].agentId == agent.agentId) {
        agent.version = this.agentVersions[i].version;
        agent.compatibility = this.agentVersions[i].compatibility;
        break;
      }
    }
  }

  private mergeData(securityData): void {
    this.controllers = [];
    this.currentSecurityLevel = securityData ? securityData.currentSecurityLevel : '';
    if (this.data.length > 0) {
      this.getVesrions(this.data.controllerIds);
      for (let i = 0; i < this.data.length; i++) {
        const obj: any = {
          controllerId: this.data[i]
        };

        if (this.coreService.preferences.controllers.has(this.data[i])) {
          obj.sortBy2 = "ordering";
          obj.sortBy = "ordering";
        }

        if (securityData) {
          for (let j = 0; j < securityData.controllers.length; j++) {
            if (this.data[i] === securityData.controllers[j].controllerId) {
              obj.securityLevel = securityData.controllers[j].securityLevel;
              securityData.controllers.splice(j, 1);
              break;
            }
          }
        }
        if (this.currentSecurityLevel === obj.securityLevel) {
          this.mergeTokenData(obj.controllerId, null, obj);
          this.controllers.push(obj);
        }
      }
    } else if (securityData) {
      for (let j = 0; j < securityData.controllers.length; j++) {
        if (this.currentSecurityLevel === securityData.controllers[j].securityLevel) {
          this.mergeTokenData(securityData.controllers[j].controllerId, null, securityData.controllers[j]);
          this.controllers.push(securityData.controllers[j]);
        }
      }
    }
    if (this.controllers.length > 0) {
      for (let i = 0; i < this.controllers.length; i++) {
        if (this.controllers[i] && this.coreService.preferences.controllers.has(this.controllers[i].controllerId)) {
          this.getAgents(this.controllers[i], null);
        }
      }
    }
    this.loading = true;
  }

  private getSchedulerIds(): void {
    this.coreService.post('controller/ids', {}).subscribe({
      next: (res: any) => {
        this.data = res.controllerIds;
        this.isLoaded = true;
        this.getSecurity();
        this.authService.setIds(res);
        this.authService.save();
        this.dataService.isProfileReload.next(true);
      }, error: () => this.isLoaded = true
    });
  }

  showCopyMessage(): void {
    this.coreService.showCopyMessage(this.message);
  }

  expandDetails(): void {
    this.controllers.forEach((controller) => {
      this.expand(controller.controllerId);
      this.getAgents(controller, null);
    });
  }

  collapseDetails(): void {
    this.controllers.forEach((controller) => {
      this.collapse(controller.controllerId);
    });
  }

  loadAgents(state): void {
    this.agentsFilters.filter.state = state;
    this.searchInResult();
  }

  searchInResult(): void {
    this.controllers.forEach((controller) => {
      this.filterAgentList(controller);
    });
  }

  private filterAgentList(controller): void {
    if (controller.agents) {
      controller.filteredAgents = this.agentsFilters.searchText ? this.searchPipe.transform(controller.agents, this.agentsFilters.searchText, this.searchableProperties) : controller.agents;
      controller.filteredAgents = controller.filteredAgents.filter((agent) => {
        return agent.syncState._text === this.agentsFilters.filter.state || this.agentsFilters.filter.state === 'ALL';
      });
    }
    if (controller.agentClusters) {
      controller.filteredAgentClusters = this.agentsFilters.searchText ? this.searchPipe.transform(controller.agentClusters, this.agentsFilters.searchText, this.searchableProperties) : controller.agentClusters;
      controller.filteredAgentClusters = controller.filteredAgentClusters.filter((agent) => {
        return agent.syncState._text === this.agentsFilters.filter.state || this.agentsFilters.filter.state === 'ALL';
      });
    }
  }

  addCertificateToAgent(controller, agent = null): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: AddCertificateModalComponent,
      nzAutofocus: null,
      nzData: {
        securityLevel: this.securityLevel,
        display: this.preferences.auditLog,
        agent
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
      }
    });
  }

  addCertificateToSubAgent(subagent, clusterAgent, controller): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: AddCertificateModalComponent,
      nzAutofocus: null,
      nzData: {
        securityLevel: this.securityLevel,
        display: this.preferences.auditLog,
        subagent
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
      }
    });
  }

  showCertificateAliases(agent, agentType): void{
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: ShowCertificateListModalComponent,
      nzAutofocus: null,
      nzData: {
        agent,
        agentType
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
      }
    });
  }
}
