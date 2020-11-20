import {Component, Input, OnInit} from '@angular/core';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {CoreService} from '../../services/core.service';
import {AuthService} from '../../components/guard';
import {Subscription} from 'rxjs';
import {DataService} from '../../services/data.service';

@Component({
  selector: 'app-agent-modal',
  templateUrl: './agent.dialog.html'
})
export class AgentModalComponent implements OnInit {
  @Input() preferences: any;
  @Input() agents: any;
  @Input() data: any;
  @Input() controllerId: any;
  @Input() new: any;
  agent: any = {};
  submitted = false;
  isUniqueId = true;
  messageList: any = [];
  comments: any = {};
  required = false;
  display: any;

  constructor(public coreService: CoreService, public activeModal: NgbActiveModal) {
  }

  ngOnInit() {
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
    let obj: any = {controllerId: this.controllerId};
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
    if(this.data) {
      for (let i = 0; i < this.agents.length; i++) {
        if (this.agents[i].agentId === this.data.agentId && this.agents[i].agentName === this.data.agentName) {
          this.agents[i] = this.agent;
          break;
        }
      }
    } else {
      this.agents.push(this.agent);
    }
    obj.agents = this.agents;
    this.coreService.post('agents/store', obj).subscribe(res => {
      this.submitted = false;
      this.activeModal.close();
    }, err => {
      this.submitted = false;
    });
  }
}

@Component({
  selector: 'app-agents',
  templateUrl: './agents.component.html'
})
export class AgentsComponent implements OnInit {
  agents: any = [];
  schedulerIds: any = {};
  loading = true;
  preferences: any = {};
  searchKey: string;
  filter: any = {};

  subscription: Subscription;

  constructor(private authService: AuthService, private coreService: CoreService,
              private dataService: DataService, private modalService: NgbModal) {
    this.subscription = dataService.refreshAnnounced$.subscribe(() => {
      this.initConf();
    });
  }

  ngOnInit(): void {
    this.initConf();
  }

  private initConf(): void{
    this.filter = {currentPage: 1, sortBy: 'agentName', reverse: false};
    this.schedulerIds = JSON.parse(this.authService.scheduleIds) || {};
    this.preferences = JSON.parse(sessionStorage.preferences) || {};
    this.getData();
  }

  getData(): void {
    this.coreService.post('agents/p', {
      controllerId: this.schedulerIds.selected
    }).subscribe((data: any) => {
      this.agents = data.agents;
      this.loading = false;
    }, () => {
      this.loading = false;
    });
  }

  sort(key): void {
    this.filter.reverse = !this.filter.reverse;
    this.filter.sortBy = key;
  }

  addAgent() {
    const modalRef = this.modalService.open(AgentModalComponent, {backdrop: 'static'});
    modalRef.componentInstance.new = true;
    modalRef.componentInstance.controllerId = this.schedulerIds.selected;
    modalRef.componentInstance.preferences = this.preferences;
    modalRef.componentInstance.agents = this.agents;
    modalRef.componentInstance.modalRef = modalRef;
    modalRef.result.then(() => {
      this.getData();
    }, () => {

    });
  }

  editAgent(agent) {
    const modalRef = this.modalService.open(AgentModalComponent, {backdrop: 'static'});
    modalRef.componentInstance.controllerId = this.schedulerIds.selected;
    modalRef.componentInstance.preferences = this.preferences;
    modalRef.componentInstance.agents = this.agents;
    modalRef.componentInstance.data = agent;
    modalRef.componentInstance.modalRef = modalRef;
    modalRef.result.then(() => {
      this.getData();
    }, () => {

    });
  }
}
