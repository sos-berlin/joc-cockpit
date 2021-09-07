import {Component, Input, OnInit} from '@angular/core';
import {NzModalRef} from 'ng-zorro-antd/modal';
import {sortBy, isEmpty, isArray} from 'underscore';
import {CoreService} from '../../../../services/core.service';
import {InventoryObject} from '../../../../models/enums';
import {WorkflowService} from '../../../../services/workflow.service';
import {AuthService} from '../../../../components/guard';

@Component({
  selector: 'app-update-job',
  templateUrl: './update-job.component.html'
})
export class UpdateJobComponent implements OnInit {
  @Input() data: any = {};
  @Input() controllerId: any;

  preferences: any = {};
  schedulerIds: any = {};
  comments: any = {};
  selectedSchedulerIds = [];
  agents = [];
  jobResourcesTree = [];
  documentationTree = [];
  step = 1;
  submitted = false;
  selectedNode: any = {
    obj: {},
    job: {}
  };

  constructor(private coreService: CoreService, public activeModal: NzModalRef,
              private workflowService: WorkflowService, private authService: AuthService) {
  }

  ngOnInit(): void {
    this.preferences = sessionStorage.preferences ? JSON.parse(sessionStorage.preferences) : {};
    this.schedulerIds = this.authService.scheduleIds ? JSON.parse(this.authService.scheduleIds) : {};
    this.comments.radio = 'predefined';
    this.selectedNode.obj.jobName = this.data.jobName;
    this.selectedSchedulerIds.push(this.controllerId);
    this.init();
  }

  private init(): void {
    this.getObject(this.data.workflows[0].id);
    if (this.jobResourcesTree.length === 0) {
      this.coreService.post('tree', {
        controllerId: this.controllerId,
        forInventory: true,
        types: [InventoryObject.JOBRESOURCE]
      }).subscribe((res) => {
        this.jobResourcesTree = this.coreService.prepareTree(res, false);
        this.getJobResources();
      });
    }
    if (this.documentationTree.length === 0) {
      this.coreService.post('tree', {
        onlyWithAssignReference: true,
        types: ['DOCUMENTATION']
      }).subscribe((res) => {
        this.documentationTree = this.coreService.prepareTree(res, false);
      });
    }
    if (this.agents.length === 0) {
      this.coreService.post('agents/names', {controllerId: this.controllerId}).subscribe((res: any) => {
        this.agents = res.agentNames ? res.agentNames.sort() : [];
      });
    }
  }

  private getJobResources(): void {
    this.coreService.post('inventory/read/folder', {
      path: '/',
      recursive: true,
      objectTypes: [InventoryObject.JOBRESOURCE]
    }).subscribe((res: any) => {
      let map = new Map();
      res.jobResources = sortBy(res.jobResources, 'name');
      res.jobResources.forEach((item) => {
        const path = item.path.substring(0, item.path.lastIndexOf('/')) || '/';
        const obj = {
          title: item.name,
          path: item.path,
          key: item.name,
          type: item.objectType,
          isLeaf: true
        };
        if (map.has(path)) {
          const arr = map.get(path);
          arr.push(obj);
          map.set(path, arr);
        } else {
          map.set(path, [obj]);
        }
      });
      this.jobResourcesTree[0].expanded = true;
      this.updateTreeRecursive(this.jobResourcesTree, map);
      this.jobResourcesTree = [...this.jobResourcesTree];
    });
  }

  private updateTreeRecursive(nodes, map): void {
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].path && map.has(nodes[i].path)) {
        nodes[i].children = map.get(nodes[i].path).concat(nodes[i].children || []);
      }
      if (nodes[i].children) {
        this.updateTreeRecursive(nodes[i].children, map);
      }
    }
  }

  getObject(id): void {
    if (this.data.onlyUpdate) {
      setTimeout(() => {
        this.selectedNode.job = {};
        this.step = 2;
      }, 100);
    } else {
      this.coreService.post('inventory/read/configuration', {
        id
      }).subscribe((res: any) => {
        this.selectedNode.job = res.configuration.jobs[this.data.jobName];
        if (this.selectedNode.job) {
          this.step = 2;
        }
      });
    }
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
    this.coreService.post('inventory/deployment/deploy', obj).subscribe(() => {
      this.activeModal.close('ok');
    }, () => {
      this.submitted = false;
    });
  }

  updateWorkflow(workflow, cb): void {
    this.coreService.post('inventory/store', {
      configuration: workflow.configuration,
      valid: true,
      id: workflow.id,
      objectType: InventoryObject.WORKFLOW
    }).subscribe((res: any) => {
      if (cb) {
        cb();
      }
    }, () => {
      if (cb) {
        cb();
      }
    });
  }

  private updateProperties(obj, job): any {
    if (job.title) {
      obj.title = job.title;
    }
    if (job.documentationName) {
      obj.documentationName = job.documentationName;
    }
    if (job.agentName) {
      obj.agentName = job.agentName;
    }
    if (job.jobResourceNames) {
      obj.jobResourceNames = job.jobResourceNames;
    }
    if (job.timeout > -1) {
      obj.timeout = job.timeout;
    }
    if (job.graceTimeout > -1) {
      obj.graceTimeout = job.graceTimeout;
    }
    if (job.warnIfShorter > -1) {
      obj.warnIfShorter = job.warnIfShorter;
    }
    if (job.warnIfLonger > -1) {
      obj.warnIfLonger = job.warnIfLonger;
    }
    if (job.defaultArguments) {
      obj.defaultArguments = job.defaultArguments;
    }
    if (job.admissionTimeScheme && job.admissionTimeScheme.periods) {
      obj.admissionTimeScheme = job.admissionTimeScheme;
    }
    if (job.executable) {
      if (job.executable.TYPE !== obj.executable.TYPE) {
        obj.executable.TYPE = job.executable.TYPE;
      }
      if (job.executable.className) {
        obj.executable.className = job.executable.className;
      }
      if (job.executable.script) {
        obj.executable.script = job.executable.script;
      }
      if (job.executable.login) {
        obj.executable.login = job.executable.login;
      }
      if (job.executable.v1Compatible || job.executable.v1Compatible === false) {
        obj.executable.v1Compatible = job.executable.v1Compatible;
      }
      if (job.executable.returnCodeMeaning) {
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
    if (job.failOnErrWritten || job.failOnErrWritten === false) {
      obj.failOnErrWritten = job.failOnErrWritten;
    }
    return obj;
  }

  private findAndUpdate(job, cb): void {
    this.data.workflows.forEach((workflow, index) => {
      this.coreService.post('inventory/read/configuration', {
        id: workflow.id
      }).subscribe((res: any) => {
        if (this.data.onlyUpdate) {
          res.configuration.jobs[this.data.jobName] = this.updateProperties(res.configuration.jobs[this.data.jobName], job);
        } else {
          res.configuration.jobs[this.data.jobName] = job;
        }
        this.updateWorkflow(res, index === this.data.workflows.length - 1 ? cb : null);
        if (index === this.data.workflows.length - 1) {
          cb();
        }
      });
    });
  }

  private getUpdatedJob(): any {
    const job = this.coreService.clone(this.selectedNode.job);
    if (isEmpty(job.executable.login)) {
      delete job.executable.login;
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

    if (job.executable.returnCodeMeaning && !isEmpty(job.executable.returnCodeMeaning)) {
      if (job.executable.returnCodeMeaning.success && typeof job.executable.returnCodeMeaning.success == 'string') {
        job.executable.returnCodeMeaning.success = job.executable.returnCodeMeaning.success.split(',').map(Number);
        delete job.executable.returnCodeMeaning.failure;
      } else if (job.executable.returnCodeMeaning.failure && typeof job.executable.returnCodeMeaning.failure == 'string') {
        job.executable.returnCodeMeaning.failure = job.executable.returnCodeMeaning.failure.split(',').map(Number);
        delete job.executable.returnCodeMeaning.success;
      }
      if (job.executable.returnCodeMeaning.failure === '') {
        delete job.executable.returnCodeMeaning.failure;
      }
      if (job.executable.returnCodeMeaning.success === '' && !job.executable.returnCodeMeaning.failure) {
        job.executable.returnCodeMeaning = {};
      }
    }
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
    if (job.executable.returnCodeMeaning) {
      if (job.executable.returnCodeMeaning && job.executable.returnCodeMeaning.success == '0') {
        delete job.executable.returnCodeMeaning;
      }
    }
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
