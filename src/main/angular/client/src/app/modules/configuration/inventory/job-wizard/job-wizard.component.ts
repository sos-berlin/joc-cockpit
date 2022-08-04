import {Component, Input, OnInit} from '@angular/core';
import {NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
import {CoreService} from '../../../../services/core.service';
import {InventoryObject} from "../../../../models/enums";
import {NzFormatEmitEvent, NzTreeNode} from "ng-zorro-antd/tree";
import {sortBy} from "underscore";

@Component({
  selector: 'app-job-wizard',
  templateUrl: './job-wizard.component.html'
})
export class JobWizardComponent implements OnInit {
  @Input() existingJob: any;

  preferences: any;
  wizard = {
    step: 1,
    checked: false,
    indeterminate: false,
    searchText: '',
    setOfCheckedValue: new Set<string>()
  };
  filter = {
    sortBy: 'name',
    reverse: false
  };
  jobTree: any = [];
  jobList: any;
  job: any;
  loading = true;
  isTreeLoad = false;

  constructor(private coreService: CoreService, private activeModal: NzModalRef, private modal: NzModalService,) {
  }

  ngOnInit(): void {
    this.preferences = sessionStorage.preferences ? JSON.parse(sessionStorage.preferences) : {};
    this.getJitlJobs();
  }

  tabChange($event): void {
    if ($event.index === 1) {
      if (!this.isTreeLoad) {
        this.getJobTemplates();
      }
    }
  }

  private getJitlJobs(): void {
    this.jobList = [];
    this.job = {};
    this.coreService.post('inventory/wizard/jobs', {}).subscribe({
      next: (res: any) => {
        this.jobList = res.jobs;
        this.loading = false;
      }, error: () => this.loading = false
    });
  }

  private getJobTemplates(): void {
    this.coreService.post('tree', {
      forInventory: true,
      types: [InventoryObject.JOBTEMPLATE]
    }).subscribe({
      next: (res) => {
        this.isTreeLoad = true;
        this.jobTree = this.coreService.prepareTree(res, false);
      }, error: () => {
        this.isTreeLoad = true;
      }
    });
  }

  selectNode(e): void {
    const data = e.origin || e;
    if (!data) {
      return;
    }
    if (!data.jobTemplates) {
      e.origin.loading = true;
      const obj: any = {
        path: e.key,
        objectTypes: [InventoryObject.JOBTEMPLATE]
      };
      this.coreService.post('inventory/read/folder', obj).subscribe({
        next: (res: any) => {
          e.origin.loading = false;
          data.jobTemplates = res.jobTemplates;
          data.jobTemplates = sortBy(data.jobTemplates, 'name');
          for (const i in data.jobTemplates) {
            if (data.jobTemplates[i]) {
              data.jobTemplates[i].path = e.key + (e.key === '/' ? '' : '/') + data.jobTemplates[i].name;
            }
          }
        }, error: () => {
          data.jobTemplates = [];
          e.origin.loading = false;
        }
      });
    }
  }

  onExpand(e): void {
    this.selectNode(e.node);
  }

  selectJob(job): void {
    this.coreService.post('inventory/wizard/job', {
      assignReference: job.assignReference || job.name
    }).subscribe((res) => {
      this.job = res;
      this.job.paramList = [];
      this.wizard.setOfCheckedValue = new Set<string>();
      this.wizard.checked = false;
      this.wizard.indeterminate = false;
      this.checkRequiredParam();
    });
  }

  addParameter(): void {
    const param = {
      name: '',
      newValue: ''
    };
    if (!this.coreService.isLastEntryEmpty(this.job.paramList, 'name', '')) {
      this.job.paramList.push(param);
    }
  }

  removeParams(index): void {
    this.job.paramList.splice(index, 1);
  }

  next(): void {
    this.wizard.step = this.wizard.step + 1;
    if (!this.jobList) {
      this.getJitlJobs();
    }
  }

  back(): void {
    this.wizard.step = this.wizard.step - 1;
  }

  onKeyPress($event): void {
    const key = $event.keyCode || $event.which;
    if (key == '13') {
      this.addParameter();
    }
  }

  checkCheckbox(param): void{
    if(param.newValue && param.newValue !== param.defaultValue) {
      this.wizard.setOfCheckedValue.add(param.name);
    }
  }

  showDoc(docName): void {
    this.coreService.showDocumentation(docName, this.preferences);
  }

  ok(): void {
    const obj = {
      title: this.job.title,
      executable: {
        TYPE: 'InternalExecutable',
        className: this.job.javaClass,
        arguments: []
      },
      documentationName: this.job.assignReference,
    };
    this.job.params.forEach(item => {
      if (this.wizard.setOfCheckedValue.has(item.name)) {
        obj.executable.arguments.push({name: item.name, value: item.newValue});
      }
    });
    if (this.job.paramList && this.job.paramList.length > 0) {
      for (const i in this.job.paramList) {
        if (this.job.paramList[i].name) {
          obj.executable.arguments.push({name: this.job.paramList[i].name, value: this.job.paramList[i].newValue});
        }
      }
    }
    this.activeModal.close(obj);
  }

  cancel(): void {
    this.activeModal.destroy();
  }

  /*--------------- Checkbox functions -------------*/

  onAllChecked(isChecked: boolean): void {
    this.job.params.forEach(item => this.updateCheckedSet(item.name, isChecked));
  }

  onItemChecked(item: any, checked: boolean): void {
    this.updateCheckedSet(item.name, checked);
  }

  updateCheckedSet(name: string, checked: boolean): void {
    if (name) {
      if (checked) {
        this.wizard.setOfCheckedValue.add(name);
      } else {
        this.wizard.setOfCheckedValue.delete(name);
      }
    }
    this.wizard.checked = this.job.params.every(item => {
      return this.wizard.setOfCheckedValue.has(item.name);
    });
    this.wizard.indeterminate = this.wizard.setOfCheckedValue.size > 0 && !this.wizard.checked;
  }

  sort(key): void {
    this.filter.reverse = !this.filter.reverse;
    this.filter.sortBy = key;
  }

  checkRequiredParam(): void {
    let existingArguments = [];
    if (this.existingJob.executable.arguments && this.existingJob.executable.arguments.length > 0) {
      existingArguments = this.coreService.clone(this.existingJob.executable.arguments);
    }
    const arr2 = [];
    if (this.job.params.length > 0) {
      let arr = [];
      for (let i = 0; i < this.job.params.length; i++) {
        for (let j = 0; j < existingArguments.length; j++) {
          if (existingArguments[j].name === this.job.params[i].name) {
            this.job.params[i].newValue = existingArguments[j].value;
            this.wizard.setOfCheckedValue.add(existingArguments[j].name);
            existingArguments.splice(j, 1);
            break;
          }
        }
        if (this.job.params[i].defaultValue && !this.job.params[i].newValue) {
          this.job.params[i].newValue = this.job.params[i].defaultValue;
        }
        if (this.job.params[i].required) {
          arr2.push(this.job.params[i]);
        } else {
          arr.push(this.job.params[i]);
        }
      }
      this.job.params = arr2.concat(arr);
    }
    if (existingArguments.length > 0) {
      for (const j in existingArguments) {
        this.job.paramList.push({
          name: existingArguments[j].name,
          newValue: existingArguments[j].value
        });
      }
    }
  }
}
