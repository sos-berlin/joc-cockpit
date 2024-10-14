import {Component, inject} from '@angular/core';
import {NZ_MODAL_DATA, NzModalRef} from 'ng-zorro-antd/modal';
import {isArray, isEmpty} from 'underscore';
import {TranslateService} from '@ngx-translate/core';
import {CoreService} from '../../../../services/core.service';
import {InventoryObject} from '../../../../models/enums';
import {WorkflowService} from '../../../../services/workflow.service';
import {AuthService} from '../../../../components/guard';

@Component({
  selector: 'app-update-job',
  templateUrl: './update-job.component.html'
})
export class UpdateJobComponent {
  readonly modalData: any = inject(NZ_MODAL_DATA);
  data: any = {};
  controllerId: any;

  preferences: any = {};
  permission: any = {};
  schedulerIds: any = {};
  comments: any = {};
  selectedSchedulerIds = [];
  agents = {
    agentList: []
  };
  scriptTree = [];
  jobResourcesTree = [];
  documentationTree = [];
  renameFailedJobs = [];
  step = 1;
  submitted = false;
  selectedNode: any = {
    obj: {},
    job: {}
  };

  checkboxObjects: any = {};

  required = false;

  constructor(private coreService: CoreService, public activeModal: NzModalRef, private translate: TranslateService,
              private workflowService: WorkflowService, private authService: AuthService) {
  }

  ngOnInit(): void {
    this.data = this.modalData.data || {};
    this.controllerId = this.modalData.controllerId;
    this.preferences = sessionStorage['preferences'] ? JSON.parse(sessionStorage['preferences']) : {};
    this.permission = this.authService.permission ? JSON.parse(this.authService.permission) : {};
    this.schedulerIds = this.authService.scheduleIds ? JSON.parse(this.authService.scheduleIds) : {};
    this.comments.radio = 'predefined';
    if (sessionStorage['$SOS$FORCELOGING'] === 'true') {
      this.required = true;
    }
    this.selectedNode.obj.jobName = this.data.jobName;
    this.selectedSchedulerIds.push(this.controllerId);
    this.init();
  }

  private init(): void {
    if (this.jobResourcesTree.length === 0) {
      this.coreService.post('tree', {
        controllerId: this.controllerId,
        forInventory: true,
        types: [InventoryObject.JOBRESOURCE]
      }).subscribe((res) => {
        this.jobResourcesTree = this.coreService.prepareTree(res, false);
      });
    }
    if (this.scriptTree.length === 0) {
      this.coreService.post('tree', {
        controllerId: this.controllerId,
        forInventory: true,
        types: [InventoryObject.INCLUDESCRIPT]
      }).subscribe((res) => {
        this.scriptTree = this.coreService.prepareTree(res, false);
      });
    }
    if (this.documentationTree.length === 0 && this.permission.joc.documentations.view) {
      this.coreService.post('tree', {
        onlyWithAssignReference: true,
        types: ['DOCUMENTATION']
      }).subscribe((res) => {
        this.documentationTree = this.coreService.prepareTree(res, false);
      });
    }
    if (this.agents.agentList.length === 0 && this.permission.joc.inventory.view) {
      this.coreService.getAgents(this.agents, this.controllerId, () => {
        if (this.data.onlyUpdate) {
          this.selectedNode.job = {};
          this.step = 2;
        }
      })
    } else {
      if (this.data.onlyUpdate) {
        setTimeout(() => {
          this.selectedNode.job = {};
          this.step = 2;
        }, 100);
      }
    }
  }

  getObject(id): void {
    this.coreService.post('inventory/read/configuration', {
      id
    }).subscribe((res: any) => {
      this.selectedNode.job = res.configuration.jobs[this.data.jobName];
      if (this.selectedNode.job) {
        this.step = 2;
      }
    });
  }

  deploy(): void {
    this.submitted = true;
    const obj: any = {
      controllerIds: this.selectedSchedulerIds,
      store: {
        draftConfigurations: []
      }
    };
    if (this.comments.comment) {
      obj.auditLog = this.comments;
    }
    this.data.workflows.forEach((workflow) => {
      const configuration = {
        path: workflow.path,
        objectType: InventoryObject.WORKFLOW
      };
      obj.store.draftConfigurations.push({configuration});
    });
    this.coreService.post('inventory/deployment/deploy', obj).subscribe({
      next: () => {
        this.activeModal.close('ok');
      }, error: () => this.submitted = false
    });
  }

  updateWorkflow(workflow, cb): void {
    const request: any = {
      configuration: workflow.configuration,
      path: workflow.path,
      objectType: InventoryObject.WORKFLOW
    };
    if (sessionStorage['$SOS$FORCELOGING'] === 'true') {
      this.translate.get('auditLog.message.defaultAuditLog').subscribe(translatedValue => {
        request.auditLog = {comment: translatedValue};
      });
    }
    this.coreService.post('inventory/store', request).subscribe({
      next: () => {
        if (cb) {
          cb();
        }
      }, error: () => {
        if (cb) {
          cb();
        }
      }
    });
  }

  private recursivelyUpdateJobInstruction(mainJson): void {
    const self = this;

    function recursive(json: any) {
      if (json.instructions) {
        for (let x = 0; x < json.instructions.length; x++) {
          if (json.instructions[x].TYPE === 'Execute.Named') {
            if (json.instructions[x].jobName === self.data.jobName) {
              json.instructions[x].jobName = self.selectedNode.obj.jobName;
            }
          }
          if (json.instructions[x].instructions) {
            recursive(json.instructions[x]);
          }
          if (json.instructions[x].catch) {
            if (json.instructions[x].catch.instructions && json.instructions[x].catch.instructions.length > 0) {
              recursive(json.instructions[x].catch);
            }
          }
          if (json.instructions[x].then && json.instructions[x].then.instructions) {
            recursive(json.instructions[x].then);
          }
          if (json.instructions[x].else && json.instructions[x].else.instructions) {
            recursive(json.instructions[x].else);
          }
          if (json.instructions[x].branches) {
            for (let i = 0; i < json.instructions[x].branches.length; i++) {
              if (json.instructions[x].branches[i]) {
                recursive(json.instructions[x].branches[i].workflow);
              }
            }
          }
        }
      }
    }

    recursive(mainJson);
  }

  private findAndUpdate(job, cb): void {
    this.data.workflows.forEach((workflow, index) => {
      this.coreService.post('inventory/read/configuration', {
        path: workflow.path,
        objectType: workflow.objectType || workflow.type
      }).subscribe((res: any) => {
        if (this.data.onlyUpdate) {
          if (!this.data.exactMatch) {
            for (const prop in res.configuration.jobs) {
              if (this.data.jobName === '*' || new RegExp(this.data.jobName).test(prop)) {
                res.configuration.jobs[prop] = this.updateProperties(res.configuration.jobs[prop], job);
              }
            }
          } else {
            res.configuration.jobs[this.data.jobName] = this.updateProperties(res.configuration.jobs[this.data.jobName], job);
          }
        } else {
          res.configuration.jobs[this.data.jobName] = job;
        }
        if (this.data.jobName !== this.selectedNode.obj.jobName) {
          if (res.configuration.jobs[this.selectedNode.obj.jobName]) {
            this.renameFailedJobs.push(workflow.path);
          } else {
            res.configuration.jobs[this.selectedNode.obj.jobName] = res.configuration.jobs[this.data.jobName];
            delete res.configuration.jobs[this.data.jobName];
            this.recursivelyUpdateJobInstruction(res.configuration);
          }
        }
        this.updateWorkflow(res, index === this.data.workflows.length - 1 ? cb : null);
      });
    });
  }


  private updateProperties(obj, job): any {
    if (this.checkboxObjects.title) {
      obj.title = job.title;
    }
    if (this.checkboxObjects.documentation) {
      obj.documentationName = job.documentationName;
    }
    if (this.checkboxObjects.radio) {
      obj.withSubagentClusterIdExpr = this.selectedNode.radio == 'expression';
      if (job.agentName1) {
        obj.subagentClusterId = job.agentName;
        job.agentName = job.agentName1;
      } else {
        obj.agentName = job.agentName;
        delete obj.subagentClusterId;
      }
    }
    if (this.checkboxObjects.subagentClusterIdExpr) {
      obj.subagentClusterIdExpr = job.subagentClusterIdExpr;
    }

    if (this.checkboxObjects.jobResourceNames) {
      obj.jobResourceNames = job.jobResourceNames;
    }
    if (this.checkboxObjects.timeout1) {
      obj.timeout = job.timeout;
    }
    if (this.checkboxObjects.graceTimeout1) {
      obj.graceTimeout = job.graceTimeout;
    }
    if (this.checkboxObjects.warnIfShorter) {
      obj.warnIfShorter = job.warnIfShorter;
    }
    if (this.checkboxObjects.warnIfLonger) {
      obj.warnIfLonger = job.warnIfLonger;
    }
    if (job.defaultArguments) {
      obj.defaultArguments = job.defaultArguments;
    }
    if (this.checkboxObjects.criticality) {
      obj.criticality = job.criticality;
    }

    if (job.admissionTimeScheme && job.admissionTimeScheme.periods) {
      obj.admissionTimeScheme = job.admissionTimeScheme;
    }
    if (job.executable) {
      if (this.checkboxObjects.executableTYPE) {
        if (job.executable.TYPE !== obj.executable.TYPE) {
          obj.executable.TYPE = job.executable.TYPE;
        }
      }
      if (this.checkboxObjects.className) {
        obj.executable.className = job.executable.className;
      }
      if (this.checkboxObjects.script) {
        obj.executable.script = job.executable.script;
      }
      if (this.checkboxObjects.credentialKey) {
        if (!obj.executable.login) {
          obj.executable.login = {};
        }
        obj.executable.login.credentialKey = job.executable.login?.credentialKey;
      }
      if (this.checkboxObjects.withUserProfile) {
        if (!obj.executable.login) {
          obj.executable.login = {};
        }
        obj.executable.login.withUserProfile = job.executable.login?.withUserProfile;
      }
      if (this.checkboxObjects.v1Compatible) {
        obj.executable.v1Compatible = job.executable.v1Compatible;
      }
      if (this.checkboxObjects.returnCode) {
        obj.executable.returnCodeMeaning = job.executable.returnCodeMeaning;
      }
      if (job.executable.env) {
        obj.executable.env = job.executable.env;
      }
      if (job.executable.arguments) {
        obj.executable.arguments = job.executable.arguments;
      }
      if (obj.executable.TYPE === 'InternalExecutable') {
        delete obj.executable.script;
        delete obj.executable.login;
        delete obj.executable.env;
      } else if (obj.executable.TYPE === 'ShellScriptExecutable') {
        delete obj.executable.className;
        delete obj.executable.arguments;
      }
    }
    if (this.checkboxObjects.failOnErrWritten) {
      obj.failOnErrWritten = job.failOnErrWritten;
    }
    if (this.checkboxObjects.warnOnErrWritten) {
      obj.warnOnErrWritten = job.warnOnErrWritten;
    }
    if (this.checkboxObjects.parallelism) {
      obj.parallelism = job.parallelism;
    }
    if (this.checkboxObjects.skipIfNoAdmissionForOrderDay) {
      obj.skipIfNoAdmissionForOrderDay = job.skipIfNoAdmissionForOrderDay;
    }
    return obj;
  }

  private getUpdatedJob(): any {
    const job = this.coreService.clone(this.selectedNode.job);
    if (isEmpty(job.executable.login)) {
      delete job.executable.login;
    }

    if (this.selectedNode.radio === 'agent') {
      delete job.subagentClusterIdExpr;
    } else {
      delete this.selectedNode.job.agentName1;
      if (job.subagentClusterIdExpr) {
        this.coreService.addSlashToString(job, 'subagentClusterIdExpr');
      }
    }
    job.withSubagentClusterIdExpr = this.selectedNode.radio == 'expression';
    delete this.selectedNode.radio;
    if (job.agentName1) {
      job.subagentClusterId = job.agentName;
      // job.agentName = job.agentName1;
      delete job.agentName1
    } else {
      delete job.subagentClusterId
    }
    if (!job.executable.v1Compatible) {
      if (job.executable.TYPE === 'ShellScriptExecutable') {
        job.executable.v1Compatible = false;
      } else {
        delete job.executable.v1Compatible;
      }
    }
    if (job.defaultArguments) {
      if (job.executable.v1Compatible && job.executable.TYPE === 'ShellScriptExecutable') {
        job.defaultArguments.filter((argu) => {
          this.coreService.addSlashToString(argu, 'value');
        });
        this.coreService.convertArrayToObject(job, 'defaultArguments', true);
      } else {
        delete job.defaultArguments;
      }
    }
    if (job.executable.arguments) {
      if (job.executable.TYPE === 'InternalExecutable') {
        if (job.executable.arguments && isArray(job.executable.arguments)) {
          job.executable.arguments.filter((argu) => {
            this.coreService.addSlashToString(argu, 'value');
          });
          this.coreService.convertArrayToObject(job.executable, 'arguments', true);
        }
      } else {
        delete job.executable.arguments;
      }
    }
    if (job.executable.jobArguments) {
      if (job.executable.TYPE === 'InternalExecutable') {
        if (job.executable.jobArguments && isArray(job.executable.jobArguments)) {
          job.executable.jobArguments.filter((argu) => {
            this.coreService.addSlashToString(argu, 'value');
          });
          this.coreService.convertArrayToObject(job.executable, 'jobArguments', true);
        }
      } else {
        delete job.executable.jobArguments;
      }
    }
    if (job.executable.TYPE === 'InternalExecutable') {
      delete job.executable.script;
      delete job.executable.login;
    } else if (job.executable.TYPE === 'ShellScriptExecutable') {
      delete job.executable.className;
    }

    if (job.executable.env) {
      if (job.executable.TYPE === 'ShellScriptExecutable') {
        if (job.executable.env && isArray(job.executable.env)) {
          job.executable.env.filter((env) => {
            this.coreService.addSlashToString(env, 'value');
          });
          this.coreService.convertArrayToObject(job.executable, 'env', true);
        }
      } else {
        delete job.executable.env;
      }
    }

    if (!job.parallelism) {
      job.parallelism = 0;
    }
    if (job.timeout1) {
      job.timeout = this.workflowService.convertStringToDuration(job.timeout1);
    } else {
      delete job.timeout;
    }
    if (job.graceTimeout1) {
      job.graceTimeout = this.workflowService.convertStringToDuration(job.graceTimeout1);
    } else {
      delete job.graceTimeout;
    }
    if (job.warnIfShorter1) {
      job.warnIfShorter = this.workflowService.convertStringToDuration(job.warnIfShorter1);
    } else {
      delete job.warnIfShorter;
    }
    if (job.warnIfLonger1) {
      job.warnIfLonger = this.workflowService.convertStringToDuration(job.warnIfLonger1);
    } else {
      delete job.warnIfLonger;
    }
    delete job.timeout1;
    delete job.graceTimeout1;
    delete job.warnIfShorter1;
    delete job.warnIfLonger1;
    delete job.jobName;
    delete job.documentationName1;

    if (job.executable && isEmpty(job.executable.login)) {
      delete job.executable.login;
    }
    if (!job.defaultArguments || typeof job.defaultArguments === 'string' || job.defaultArguments.length === 0) {
      delete job.defaultArguments;
    }
    if (job.executable && (!job.executable.arguments || typeof job.executable.arguments === 'string' || job.executable.arguments.length === 0)) {
      delete job.executable.arguments;
    }
    if (job.executable && (!job.executable.jobArguments || typeof job.executable.jobArguments === 'string' || job.executable.jobArguments.length === 0)) {
      delete job.executable.jobArguments;
    }
    if (job.executable && (!job.executable.env || typeof job.executable.env === 'string' || job.executable.env.length === 0)) {
      delete job.executable.env;
    }
    this.workflowService.checkReturnCodes(job);
    if (job.admissionTimeScheme && job.admissionTimeScheme.periods) {
      if (job.admissionTimeScheme.periods.length === 0) {
        delete job.admissionTimeScheme;
      }
    }
    return job;
  }

  onSubmit(): void {
    this.submitted = true;
    this.findAndUpdate(this.getUpdatedJob(), () => {
      this.step = 3;
      this.submitted = false;
    });
  }
}
