import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
import {Subscription} from 'rxjs';
import {NzMessageService} from 'ng-zorro-antd/message';
import {differenceInCalendarDays} from 'date-fns';
import * as moment from 'moment-timezone';
import {CoreService} from '../../services/core.service';
import {StartUpModalComponent} from '../start-up/start-up.component';
import {ConfirmModalComponent} from '../../components/comfirm-modal/confirm.component';
import {AuthService} from '../../components/guard';
import {DataService} from '../../services/data.service';
import {CommentModalComponent} from '../../components/comment-modal/comment.component';

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
    this.dateFormat = this.coreService.getDateFormatWithTime(this.preferences.dateFormat);
    this.token.timezone = this.preferences.zone;
    this.comments.radio = 'predefined';
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
    if (this.token.validUntil && this.token.at === 'date') {
      obj.validUntil = moment(this.token.validUntil).format('YYYY-MM-DDTHH:mm:ss') + '.000Z';
    } else {
      obj.validUntil = this.token.atTime;
    }
    this.coreService.post('token/create', obj).subscribe(res => {
      this.submitted = false;
      this.activeModal.close(res);
    }, () => {
      this.submitted = false;
    });
  }

  disabledDate = (current: Date): boolean => {
    // Can not select days before today and today
    return differenceInCalendarDays(current, this.viewDate) < 0;
  };
}

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
  isUniqueId = true;
  agentNameAliases: any = [];
  comments: any = {};
  preferences: any;
  display: any;

  constructor(public coreService: CoreService, public activeModal: NzModalRef) {
  }

  ngOnInit(): void {
    if (sessionStorage.preferences) {
      this.preferences = JSON.parse(sessionStorage.preferences) || {};
    }
    this.display = this.preferences.auditLog;
    this.comments.radio = 'predefined';
    if (this.data) {
      this.subagent = this.coreService.clone(this.data);
    } else {
      this.subagent.isDirector = 'NO_DIRECTOR';
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

    this.coreService.post('agent/subagents/store', obj).subscribe(res => {
      this.submitted = false;
      this.activeModal.close('close');
    }, () => {
      this.submitted = false;
    });
  }
}

@Component({
  selector: 'app-agent-modal',
  templateUrl: './agent.dialog.html'
})
export class AgentModalComponent implements OnInit {
  @Input() agents: any;
  @Input() data: any;
  @Input() new: boolean;
  @Input() isCluster: boolean;
  @Input() controllerId: any;
  agent: any = {};
  submitted = false;
  isUniqueId = true;
  agentNameAliases: any = [];
  comments: any = {};
  preferences: any;
  display: any;

  constructor(public coreService: CoreService, public activeModal: NzModalRef) {
  }

  ngOnInit(): void {
    if (sessionStorage.preferences) {
      this.preferences = JSON.parse(sessionStorage.preferences) || {};
    }
    this.display = this.preferences.auditLog;
    this.comments.radio = 'predefined';
    if (this.data) {
      this.agent = this.coreService.clone(this.data);
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
    if (this.isCluster) {
      this.agent.director = 'NO_DIRECTOR';
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

  checkDisable(): void {
    if (this.agent.disabled) {
      const x = this.agents.filter((agent) => {
        return agent.disabled;
      });
      const flag = x.length >= this.agents.length - 1;
      if (flag) {
        setTimeout(() => {
          this.agent.disabled = false;
        }, 0);
      }
    }
  }

  checkId(newId): void {
    this.isUniqueId = true;
    for (let i = 0; i < this.agents.length; i++) {
      if (this.agents[i].agentId === newId && (this.data && newId !== this.data.agentId)) {
        this.isUniqueId = false;
        break;
      }
    }
  }

  onSubmit(): void {
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
        _agent.subagents = [{isDirector: _agent.director, subagentId: _agent.subagentId, url: _agent.url}];
        delete _agent.director;
        delete _agent.subagentId;
        delete _agent.url;
      }
      obj.clusterAgents = [_agent];
    } else {
      obj.agents = [_agent];
    }
    this.coreService.post(this.isCluster ? 'agents/cluster/store' : 'agents/store', obj).subscribe(res => {
      this.submitted = false;
      this.activeModal.close('close');
    }, () => {
      this.submitted = false;
    });
  }
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
  showPanel = [true];
  permission: any = {};
  preferences: any = {};
  modalInstance: NzModalRef;
  loading = false;
  isLoaded = false;
  hasLicense = false;
  object = {
    mapOfCheckedId2: new Set(),
    mapOfCheckedId: new Set()
  };

  subscription1: Subscription;
  subscription2: Subscription;

  constructor(public coreService: CoreService, private modal: NzModalService, private message: NzMessageService,
              private authService: AuthService, private dataService: DataService) {
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
    this.hasLicense = sessionStorage.hasLicense;
    this.getTokens();
  }

  ngOnDestroy(): void {
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
  }

  private refresh(args): void {
    if (args.eventSnapshots && args.eventSnapshots.length > 0) {
      for (let j = 0; j < args.eventSnapshots.length; j++) {
        if (args.eventSnapshots[j].eventType === 'AgentChanged' || args.eventSnapshots[j].eventType === 'AgentStateChanged'
          || ((args.eventSnapshots[j].eventType === 'ProxyCoupled' || args.eventSnapshots[j].eventType === 'ProxyDecoupled' || args.eventSnapshots[j].eventType.match(/Item/))
            && args.eventSnapshots[j].objectType === 'AGENT')) {
          if (this.controllers.length > 0) {
            for (let i = 0; i < this.showPanel.length; i++) {
              if (this.controllers[i]) {
                this.getAgents(this.controllers[i], null);
              }
            }
          }
          break;
        } else if (args.eventSnapshots[j].eventType === 'ControllerStateChanged' || ((args.eventSnapshots[j].eventType === 'ProxyCoupled'
          || args.eventSnapshots[j].eventType === 'ProxyDecoupled' || args.eventSnapshots[j].eventType.match(/Item/)) && args.eventSnapshots[j].objectType === 'CONTROLLER')) {
          this.isLoaded = false;
          this.getSchedulerIds();
          break;
        }
      }
    }
  }

  private getTokens(flag = true): void {
    this.coreService.post('token/show', {}).subscribe((data: any) => {
      this.tokens = data.tokens;
      if (flag) {
        this.getData();
      } else {
        this.checkTokens();
      }
    }, () => {
      if (flag) {
        this.getData();
      }
    });
  }

  getData(): void {
    this.coreService.post('controller/ids', {})
      .subscribe((data: any) => {
        this.data = data.controllerIds;
        this.getSecurity();
      }, () => {
        this.loading = true;
      });
  }

  getAgents(controller, cb): void {
    if (controller && (!controller.agents || !cb)) {
      if (this.hasLicense) {
        this.getClusterAgents(controller);
      }
      controller.loading = true;
      this.coreService.post('agents/p', {
        controllerId: controller.controllerId
      }).subscribe((data: any) => {
        controller.agents = data.agents;
        controller.agents.forEach((agent) => {
          this.mergeTokenData(null, agent.agentId, agent);
        });
        controller.loading = false;
        if (cb) {
          cb();
        }
      }, () => {
        controller.agents = [];
        controller.loading = false;
        if (cb) {
          cb();
        }
      });
    } else if (cb) {
      cb();
    }
  }

  getClusterAgents(controller): void {
    controller.isLoading = true;
    this.coreService.post('agents/cluster/p', {
      controllerId: controller.controllerId
    }).subscribe((data: any) => {
      const temp = controller.agentClusters ? this.coreService.clone(controller.agentClusters) : [];
      controller.agentClusters = data.agents;
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
      controller.isLoading = false;
    }, () => {
      controller.agentClusters = [];
      controller.isLoading = false;
    });
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

  addController(): void {
    this.modalInstance = this.modal.create({
      nzTitle: undefined,
      nzContent: StartUpModalComponent,
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
          nzComponentParams: {
            isModal: true,
            controllerInfo: res.controllers,
            agents: res.agents,
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
        this.object.mapOfCheckedId.clear();
        this.object.mapOfCheckedId2.clear();
        this.getTokens(false);
      }
    });
  }

  addAgent(controller): void {
    this.getAgents(controller, () => {
      this.modal.create({
        nzTitle: undefined,
        nzContent: AgentModalComponent,
        nzAutofocus: null,
        nzComponentParams: {
          controllerId: controller.controllerId,
          agents: controller.agents,
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
          nzAutofocus: null,
          nzComponentParams: {
            controllerId: controller.controllerId,
            agents: controller.agents,
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

  removeAgent(agent, controller): void {
    const obj = {
      controllerId: controller.controllerId,
      agentId: agent.agentId
    };
    if (this.preferences.auditLog) {
      const comments = {
        radio: 'predefined',
        type: 'Agent',
        operation: 'Remove',
        name: agent.agentId
      };
      this.modal.create({
        nzTitle: undefined,
        nzContent: CommentModalComponent,
        nzClassName: 'lg',
        nzComponentParams: {
          comments,
          obj,
          url: 'agent/remove'
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
          title: 'remove',
          message: 'removeAgent',
          type: 'Remove',
          objectName: agent.agentId,
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      });
      modal.afterClose.subscribe(result => {
        if (result) {
          this.coreService.post('agent/remove', obj).subscribe(() => {

          });
        }
      });
    }
  }

  addClusterAgent(controller): void {
    this.getAgents(controller, () => {
      const modal = this.modal.create({
        nzTitle: undefined,
        nzContent: AgentModalComponent,
        nzAutofocus: null,
        nzComponentParams: {
          controllerId: controller.controllerId,
          agents: controller.agents,
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
    console.log(subagent, clusterAgent, controller);
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: SubagentModalComponent,
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
    console.log(sub, clusterAgent, controller);
    const obj = {
      controllerId: controller.controllerId,
      subagentIds: [sub.subagentId]
    };
    if (this.preferences.auditLog) {
      const comments = {
        radio: 'predefined',
        type: 'Agent',
        operation: 'Remove',
        name: sub.subagentId
      };
      const modal = this.modal.create({
        nzTitle: undefined,
        nzContent: CommentModalComponent,
        nzClassName: 'lg',
        nzComponentParams: {
          comments,
          obj,
          url: 'agent/subagents/remove'
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
          title: 'remove',
          message: 'removeSubagent',
          type: 'Remove',
          objectName: sub.subagentId,
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      });
      modal.afterClose.subscribe(result => {
        if (result) {
          this.coreService.post('agent/subagents/remove', obj).subscribe(() => {
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
    if (this.preferences.auditLog) {
      const comments = {
        radio: 'predefined',
        type: 'Agent',
        operation: 'Reset',
        name: agent.agentId
      };
      this.modal.create({
        nzTitle: undefined,
        nzContent: CommentModalComponent,
        nzClassName: 'lg',
        nzComponentParams: {
          comments,
          obj,
          url: 'agent/reset'
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      });
    } else {
      this.coreService.post('agent/reset', obj).subscribe(() => {

      });
    }
  }

  disableAgent(agent, controller, isCluster = false): void {
    this.enableDisable(agent, controller, isCluster, true);
  }

  enableAgent(agent, controller, isCluster = false): void {
    this.enableDisable(agent, controller, isCluster, false);
  }

  private enableDisable(agent, controller, isCluster, flag): void {
    agent.disabled = flag;
    const obj: any = {
      controllerId: controller.controllerId
    };
    if (isCluster) {
      obj.clusterAgents = controller.agentClusters;
    } else {
      obj.agents = controller.agents;
    }
    this.coreService.post('agents/store', obj).subscribe(() => {

    }, () => {
      agent.disabled = !flag;
    });
  }

  private getSecurity(): void {
    this.coreService.post('controllers/security_level', {})
      .subscribe((data: any) => {
        this.mergeData(data);
      }, (err) => {
        this.mergeData(null);
      });
  }

  checkAll(value: boolean, controller, isCluster = false): void {
    if (isCluster) {
      if (value && controller.agentClusters.length > 0) {
        controller.agentClusters.forEach(item => {
          if (!item.disabled) {
            this.object.mapOfCheckedId2.add(item.agentId);
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
            this.object.mapOfCheckedId.add(item.agentId);
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
        this.object.mapOfCheckedId2.add(agent.agentId);
      } else {
        this.object.mapOfCheckedId.add(agent.agentId);
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
      for (let i = 0; i < this.showPanel.length; i++) {
        if (this.controllers[i]) {
          this.getAgents(this.controllers[i], null);
        }
      }
    }
    this.loading = true;
  }

  private getSchedulerIds(): void {
    this.coreService.post('controller/ids', {}).subscribe((res: any) => {
      this.isLoaded = true;
      this.data = res.controllerIds;
      this.getSecurity();
      this.authService.setIds(res);
      this.authService.save();
      this.dataService.isProfileReload.next(true);
    }, () => {
      this.isLoaded = true;
    });
  }

  showCopyMessage(): void {
    this.coreService.showCopyMessage(this.message);
  }
}
