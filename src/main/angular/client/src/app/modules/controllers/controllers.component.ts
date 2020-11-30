import {Component, Input, OnInit} from '@angular/core';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {CoreService} from '../../services/core.service';
import {StartUpModalComponent} from '../start-up/start-up.component';
import {ConfirmModalComponent} from '../../components/comfirm-modal/confirm.component';
import {AuthService} from '../../components/guard';
import {DataService} from '../../services/data.service';

@Component({
  selector: 'app-agent-modal',
  templateUrl: './agent.dialog.html'
})
export class AgentModalComponent implements OnInit {
  @Input() agents: any;
  @Input() data: any;
  @Input() new: any;
  @Input() controllerId: any;
  agent: any = {};
  submitted = false;
  isUniqueId = true;
  messageList: any = [];
  agentNameAliases: any = [];
  comments: any = {};
  required = false;
  preferences: any;
  display: any;

  constructor(public coreService: CoreService, public activeModal: NgbActiveModal) {
  }

  ngOnInit() {
    if (sessionStorage.preferences) {
      this.preferences = JSON.parse(sessionStorage.preferences) || {};
    }
    this.display = this.preferences.auditLog;
    this.comments.radio = 'predefined';
    if (sessionStorage.comments) {
      this.messageList = JSON.parse(sessionStorage.comments);
    }
    if (sessionStorage.$SOS$FORCELOGING == 'true') {
      this.required = true;
    }
    if (this.data) {
      this.agent = this.coreService.clone(this.data);
    }
    if (!this.agent.agentNameAliases || this.agent.agentNameAliases.length === 0) {
      this.agentNameAliases = [{name: ''}];
    } else {
      this.agent.agentNameAliases.filter((val) => {
        this.agentNameAliases.push({name: val});
      });
    }
  }

  addAlise() {
    console.log(this.agentNameAliases[0], 'this.agent.agentNameAliases[0]');
    console.log(this.agentNameAliases, 'this.agent.agentNameAliases');
    if (this.agentNameAliases[this.agentNameAliases.length - 1].name) {
      console.log('??if<<');
      this.agentNameAliases.push({name: ''});
    }
  }

  removeAlise(index) {
    this.agent.agentNameAliases.splice(index, 1);
  }

  checkDisable() {
    if (this.agent.disabled) {
      const x = this.agents.filter((agent) => {
        return agent.disabled;
      });
      let flag = x.length >= this.agents.length - 1;
      if (flag) {
        setTimeout(() => {
          this.agent.disabled = false;
        }, 0);
      }
    }
  }

  checkId(newId) {
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
    obj.agents = [_agent];
    this.coreService.post('agents/store', obj).subscribe(res => {
      this.submitted = false;
      this.activeModal.close();
    }, err => {
      this.submitted = false;
    });
  }
}

@Component({
  selector: 'app-controllers',
  templateUrl: './controllers.component.html'
})
export class ControllersComponent implements OnInit {
  data: any = [];
  controllers: any = [];
  currentSecurityLevel: string;
  showPanel = [true];

  constructor(private coreService: CoreService, private modalService: NgbModal, private authService: AuthService,
              private dataService: DataService) {
  }

  ngOnInit(): void {
    this.getData();
  }

  getData(): void {
    this.coreService.post('controller/ids', {})
      .subscribe((data: any) => {
        this.data = data.controllerIds;
        this.getSecurity();
      });
  }

  migrateController(controller) {
    this.coreService.post('controllers/security_level/take_over', {controllerId: controller})
      .subscribe((data: any) => {
        this.getSecurity();
      });
  }

  getAgents(controller, cb): void {
    if (!controller.agents) {
      this.coreService.post('agents/p', {
        controllerId: controller.controllerId
      }).subscribe((data: any) => {
        controller.agents = data.agents;
        if (cb) {
          cb();
        }
      }, () => {
        controller.agents = [];
        if (cb) {
          cb();
        }
      });
    } else if (cb) {
      cb();
    }
  }

  addController() {
    const modalRef = this.modalService.open(StartUpModalComponent, {backdrop: 'static'});
    modalRef.componentInstance.isModal = true;
    modalRef.componentInstance.new = true;
    modalRef.componentInstance.modalRef = modalRef;
    modalRef.result.then((permission) => {
      this.getSchedulerIds(permission);
    }, () => {

    });
  }

  editController(controller) {
    this.coreService.post('controllers/p', {controllerId: controller}).subscribe((res: any) => {
      const modalRef = this.modalService.open(StartUpModalComponent, {backdrop: 'static'});
      modalRef.componentInstance.isModal = true;
      modalRef.componentInstance.controllerInfo = res.controllers;
      modalRef.componentInstance.agents = res.agents;
      modalRef.componentInstance.modalRef = modalRef;
      modalRef.result.then((result) => {
        console.log(result);
        this.getSchedulerIds(null);
      }, () => {

      });
    });
  }

  deleteController(matser) {
    const modalRef = this.modalService.open(ConfirmModalComponent, {backdrop: 'static'});
    modalRef.componentInstance.title = 'delete';
    modalRef.componentInstance.message = 'deleteController';
    modalRef.componentInstance.type = 'Delete';
    modalRef.componentInstance.objectName = matser;
    modalRef.result.then((result) => {
      this.coreService.post('controller/cleanup', {controllerId: matser}).subscribe((res: any) => {
        this.getSchedulerIds(null);
      });
    }, () => {

    });
  }

  addAgent(controller) {
    this.getAgents(controller, () => {
      const modalRef = this.modalService.open(AgentModalComponent, {backdrop: 'static'});
      modalRef.componentInstance.controllerId = controller.controllerId;
      modalRef.componentInstance.agents = controller.agents;
      modalRef.componentInstance.new = true;
      modalRef.result.then(() => {
        this.getData();
      }, () => {

      });
    });
  }

  editAgent(agent, controller) {
    this.getAgents(controller, () => {
      const modalRef = this.modalService.open(AgentModalComponent, {backdrop: 'static'});
      modalRef.componentInstance.controllerId = controller.controllerId;
      modalRef.componentInstance.agents = controller.agents;
      modalRef.componentInstance.data = agent;
      modalRef.result.then(() => {
        this.getData();
      }, () => {

      });
    });
  }

  disableAgent(agent, controller) {
    agent.disabled = true;
    this.coreService.post('agents/store', {
      controllerId: controller.controllerId, agents:
      controller.agents
    }).subscribe(res => {

    });
  }

  enableAgent(agent, controller) {
    agent.disabled = false;
    this.coreService.post('agents/store', {
      controllerId: controller.controllerId, agents: controller.agents
    }).subscribe(res => {

    });
  }

  private getSecurity() {
    this.coreService.post('controllers/security_level', {})
      .subscribe((data: any) => {
        this.mergeData(data);
      }, (err) => {
        this.mergeData(null);
      });
  }

  private mergeData(securityData) {
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
        this.controllers.push(obj);
      }
    } else if (securityData) {
      this.controllers = securityData.controllers;
    }
    if (this.controllers.length > 0) {
      for (let i = 0; i < this.showPanel.length; i++) {
        this.getAgents(this.controllers[i], null);
      }
    }
  }

  private checkIsFirstEntry(_permission) {
    this.authService.setPermissions(_permission);
    this.authService.save();
    if (this.data.length === 1) {
      this.authService.savePermission(this.data[0]);
      this.dataService.switchScheduler(this.data[0]);
    }
  }

  private getSchedulerIds(permission): void {
    this.coreService.post('controller/ids', {}).subscribe((res: any) => {
      this.data = res.controllerIds;
      this.getSecurity();
      this.authService.setIds(res);
      this.authService.save();
      if (permission) {
        this.checkIsFirstEntry(permission);
      }
      this.dataService.isProfileReload.next(true);
    }, err => console.log(err));
  }
}
