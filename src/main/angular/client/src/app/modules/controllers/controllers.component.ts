import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
import {Subscription} from 'rxjs';
import {NzMessageService} from 'ng-zorro-antd/message';
import {differenceInCalendarDays} from 'date-fns';
import {Router} from "@angular/router";
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';
import {CoreService} from '../../services/core.service';
import {StartUpModalComponent} from '../start-up/start-up.component';
import {ConfirmModalComponent} from '../../components/comfirm-modal/confirm.component';
import {AuthService} from '../../components/guard';
import {DataService} from '../../services/data.service';
import {CommentModalComponent} from '../../components/comment-modal/comment.component';
import {AgentModalComponent, SubagentModalComponent} from "./agent/agent.component";
import {FileUploader} from "ng2-file-upload";
import {TranslateService} from "@ngx-translate/core";
import {ToastrService} from "ngx-toastr";

@Component({
  selector: 'app-export-modal',
  templateUrl: './export-dialog.html'
})
export class ExportComponent implements OnInit {
  @Input() preferences;
  @Input() display: any;
  @Input() controller: any;
  submitted = false;
  required = false;
  comments: any = {radio: 'predefined'};
  inValid = false;
  exportObj = {
    filename: '',
    fileFormat: 'ZIP'
  };

  constructor(public activeModal: NzModalRef, private coreService: CoreService) {
  }

  ngOnInit(): void {
    if (sessionStorage.$SOS$FORCELOGING === 'true') {
      this.required = true;
      this.display = true;
    }
    console.log(this.controller);
    if (!this.controller.agents) {
      this.getAgents(this.controller);
    }
  }

  private getAgents(controller): void {
    if (sessionStorage.hasLicense == 'true') {
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
        if (this.exportObj.fileFormat === 'ZIP' && (ext === 'ZIP' || ext === 'zip')) {
          this.inValid = false;
        } else {
          this.inValid = !(this.exportObj.fileFormat === 'TAR_GZ' && (ext === 'tar' || ext === 'gz'));
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
    if (this.controller.agentClusters) {
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
    }

    this.coreService.download('agents/export', obj, this.exportObj.filename, (res) => {
      if (res) {
        this.activeModal.close('ok');
      } else {
        this.submitted = false;
      }
    });
  }

  cancel(): void {
    this.activeModal.destroy();
  }

}

@Component({
  selector: 'app-import-modal-content',
  templateUrl: './import-dialog.html'
})
export class ImportModalComponent implements OnInit {
  @Input() display: any;
  @Input() controller: any;
  nodes: any = [];
  uploader: FileUploader;
  signatureAlgorithm: string;
  required = false;
  comments: any = {};
  settings: any = {};
  hasBaseDropZoneOver: any;
  requestObj = {
    overwrite: false,
    format: 'ZIP',
  };

  constructor(public activeModal: NzModalRef, private modal: NzModalService, private translate: TranslateService,
              public toasterService: ToastrService, private coreService: CoreService, private authService: AuthService) {
  }

  ngOnInit(): void {
    if (sessionStorage.$SOS$FORCELOGING === 'true') {
      this.required = true;
      this.display = true;
    }
    this.uploader = new FileUploader({
      url: './api/agents/import',
      queueLimit: 1,
      headers: [{
        name: 'X-Access-Token',
        value: this.authService.accessTokenId
      }]
    });
    this.comments.radio = 'predefined';

    this.uploader.onBeforeUploadItem = (item: any) => {
      const obj: any = {};
      this.coreService.getAuditLogObj(this.comments, obj.auditLog);
      obj.format = this.requestObj.format;
      obj.overwrite = this.requestObj.overwrite;
      obj.controllerId = this.controller.controllerId;
      item.file.name = encodeURIComponent(item.file.name);
      this.uploader.options.additionalParameter = obj;
    };

    this.uploader.onCompleteItem = (fileItem: any, response, status) => {
      if (status === 200) {
        this.activeModal.close('DONE');
      }
    };

    this.uploader.onErrorItem = (fileItem, response: any) => {
      const res = typeof response === 'string' ? JSON.parse(response) : response;
      if (res.error) {
        this.toasterService.error(res.error.message, res.error.code);
      }
    };
  }

  fileOverBase(e: any): void {
    this.hasBaseDropZoneOver = e;
  }

  // CALLBACKS
  onFileSelected(event: any): void {
    const item = event['0'];
    const fileExt = item.name.slice(item.name.lastIndexOf('.') + 1);
    if (!(fileExt && ((fileExt === 'zip' && this.requestObj.format === 'ZIP') ||
      (this.requestObj.format !== 'ZIP' && (fileExt.match(/tar/) || fileExt.match(/gz/)))))) {
      let msg = '';
      this.translate.get('error.message.invalidFileExtension').subscribe(translatedValue => {
        msg = translatedValue;
      });
      this.toasterService.error(fileExt + ' ' + msg);
      this.uploader.clearQueue();
    }
  }

  import(): void {
    this.uploader.queue[0].upload();
  }

  cancel(): void {
    this.activeModal.destroy();
  }
}

@Component({
  selector: 'app-create-token-modal',
  templateUrl: './create-token.dialog.html'
})
export class CreateTokenModalComponent implements OnInit {
  @Input() agents: any;
  @Input() clusterAgents: any;
  @Input() agent: any;
  @Input() data: any;
  @Input() controllerId: any;
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
    if (sessionStorage.preferences) {
      this.preferences = JSON.parse(sessionStorage.preferences) || {};
    }
    this.zones = this.coreService.getTimeZoneList();
    this.display = this.preferences.auditLog;
    this.dateFormat = this.coreService.getDateFormat(this.preferences.dateFormat);
    this.token.timezone = this.preferences.zone;
    this.comments.radio = 'predefined';
    if (sessionStorage.$SOS$FORCELOGING === 'true') {
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
    if (this.token.validUntil && this.token.at === 'date') {
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

  disabledDate = (current: Date): boolean => {
    // Can not select days before today and today
    return differenceInCalendarDays(current, this.viewDate) < 0;
  };
}

@Component({
  selector: 'app-controllers',
  templateUrl: './controllers.component.html'
})
export class ControllersComponent implements OnInit, OnDestroy {
  data: any = [];
  controllers: any = [];
  tokens: any = [];
  currentSecurityLevel: string;
  permission: any = {};
  preferences: any = {};
  modalInstance: NzModalRef;
  loading = false;
  isLoaded = false;
  hasLicense = false;
  isActionMenuVisible = false;
  object = {
    mapOfCheckedId2: new Map(),
    mapOfCheckedId: new Map()
  };

  subscription1: Subscription;
  subscription2: Subscription;

  constructor(public coreService: CoreService, private modal: NzModalService, private message: NzMessageService,
              private authService: AuthService, private dataService: DataService, private router: Router) {
    this.subscription1 = dataService.eventAnnounced$.subscribe(res => {
      this.refresh(res);
    });
    this.subscription2 = dataService.closeModal.subscribe(res => {
      if (res && this.modalInstance) {
        if (res === 'reload') {
          this.modalInstance.close(res);
        } else {
          this.modalInstance.destroy();
        }
      }
    });
  }

  ngOnInit(): void {
    this.permission = JSON.parse(this.authService.permission) || {};
    if (sessionStorage.preferences) {
      this.preferences = JSON.parse(sessionStorage.preferences) || {};
    }
    this.hasLicense = sessionStorage.hasLicense == 'true';
    this.getTokens();
  }

  ngOnDestroy(): void {
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
  }

  private refresh(args): void {
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
      if(obj){
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
            this.mergeTokenData(null, agent.agentId, agent);
          });
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
          if (temp.length > 0) {
            for (const i in temp) {
              if (temp[i].agentId === agent.agentId) {
                agent.show = temp[i].show;
                break;
              }
            }
          }
        });
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
      nzComponentParams: {
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
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: ImportModalComponent,
      nzClassName: 'lg',
      nzAutofocus: null,
      nzComponentParams: {
        display: this.preferences.auditLog,
        controller
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        console.log(result)
      }
    });
  }

  addController(): void {
    this.modalInstance = this.modal.create({
      nzTitle: undefined,
      nzContent: StartUpModalComponent,
      nzClassName: 'lg',
      nzComponentParams: {
        isModal: true,
        new: true,
        modalRef: true
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    this.modalInstance.afterClose.subscribe(result => {
      if (result && this.controllers.length === 0) {
        this.isLoaded = false;
        this.getSchedulerIds();
      }
    });
  }

  editController(controller): void {
    if (this.permission.joc && this.permission.joc.administration.controllers.manage) {
      this.coreService.post('controllers/p', {controllerId: controller}).subscribe((res: any) => {
        this.modalInstance = this.modal.create({
          nzTitle: undefined,
          nzContent: StartUpModalComponent,
          nzClassName: 'lg',
          nzComponentParams: {
            isModal: true,
            controllerInfo: res.controllers,
            agents: res.agents,
            clusterAgents: res.clusterAgents,
            modalRef: true
          },
          nzFooter: null,
          nzClosable: false,
          nzMaskClosable: false
        });
        this.modalInstance.afterClose.subscribe(result => {
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
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: ConfirmModalComponent,
      nzComponentParams: {
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
        this.coreService.post('controller/cleanup', {controllerId: matser}).subscribe(() => {
          setTimeout(() => {
            if (!this.isLoaded) {
              this.getSchedulerIds();
            }
          }, 250);
        });
      }
    });
  }

  createToken(controller, agent = null): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: CreateTokenModalComponent,
      nzAutofocus: null,
      nzComponentParams: {
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

  deleteAll(): void {
    if (this.preferences.auditLog) {
      const comments = {
        radio: 'predefined',
        type: 'Agent',
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
          message: 'deleteSelectedAgents',
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
    this.resetCheckbox();
  }

  deployAll(): void {
    if (this.preferences.auditLog) {
      let comments = {
        radio: 'predefined',
        type: 'Agent',
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
          this._deployAll(result);
        }
      });
    } else {
      this._deployAll();
    }
  }

  private _deployAll(auditLog = {}): void {
    this.object.mapOfCheckedId.forEach((k, v) => {
      this.coreService.post('agents/inventory/deploy', {
        controllerId: k,
        agentIds: [v],
        auditLog
      }).subscribe();
    })
    this.object.mapOfCheckedId2.forEach((k, v) => {
      this.coreService.post('agents/inventory/cluster/deploy', {
        controllerId: k,
        clusterAgentIds: [v],
        auditLog
      }).subscribe();
    });
    this.resetCheckbox();
  }

  addAgent(controller): void {
    this.getAgents(controller, () => {
      this.modal.create({
        nzTitle: undefined,
        nzContent: AgentModalComponent,
        nzClassName: 'lg',
        nzAutofocus: null,
        nzComponentParams: {
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
          nzComponentParams: {
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
        nzComponentParams: {
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
        nzComponentParams: {
          title: 'delete',
          message: isCluster ? 'deleteClusterAgent' : 'deleteAgent',
          type: 'Delete',
          objectName: agent.agentId,
        },
        nzFooter: null,
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
        nzComponentParams: {
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
      nzComponentParams: {
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
      nzComponentParams: {
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
        nzComponentParams: {
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
        nzComponentParams: {
          title: 'delete',
          message: 'deleteSubagent',
          type: 'Delete',
          objectName: sub.subagentId,
        },
        nzFooter: null,
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
        nzComponentParams: {
          comments,
          obj,
          url: subagent ? 'agents/inventory/cluster/subagent/reset' : 'agent/reset'
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      });
    } else if (obj.force) {
      const modal = this.modal.create({
        nzTitle: undefined,
        nzContent: ConfirmModalComponent,
        nzComponentParams: {
          title: 'resetForced',
          message: 'resetAgentConfirmation',
          type: 'Reset',
          objectName: obj.agentId,
        },
        nzFooter: null,
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
        nzComponentParams: {
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
        nzComponentParams: {
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
          if (!item.disabled) {
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

  private mergeData(securityData): void {
    this.controllers = [];
    this.currentSecurityLevel = securityData ? securityData.currentSecurityLevel : '';
    if (this.data.length > 0) {
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
}
