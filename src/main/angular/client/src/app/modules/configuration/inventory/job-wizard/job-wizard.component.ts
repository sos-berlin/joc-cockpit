import {Component, Input, OnInit} from '@angular/core';
import {NzModalRef} from 'ng-zorro-antd/modal';
import {clone} from 'underscore';
import {CoreService} from '../../../../services/core.service';

@Component({
  selector: 'app-job-wizard',
  templateUrl: './job-wizard.component.html',
  styleUrls: ['./job-wizard.component.scss']
})
export class JobWizardComponent implements OnInit {
  @Input() jobs: any = [];

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
  childrens = [];
  jobList: any;
  job: any;
  isUnique = true;
  loading = true;

  constructor(private coreService: CoreService, private activeModal: NzModalRef) {
  }

  ngOnInit(): void {
    this.preferences = sessionStorage.preferences ? JSON.parse(sessionStorage.preferences) : {};
    this.getJitlJobs();
  }

  private getJitlJobs(): void {
    this.jobList = [];
    this.job = {};
    this.coreService.post('inventory/wizard/jobs', {}).subscribe((res: any) => {
      this.jobList = res.jobs;
      this.loading = false;
    }, (err) => {
      this.loading = false;
    });
  }

  selectJob(job): void {
    const name = clone(this.job.newName);
    this.coreService.post('inventory/wizard/job', {
      assignReference: job.assignReference
    }).subscribe((res) => {
      this.job = res;
      this.job.paramList = [];
      this.job.newName = name;
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
    if (!this.job.newName && this.job.docName) {
      this.job.newName = clone(this.job.docName);
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

  showDoc(docName): void {
    this.coreService.showDocumentation(docName, this.preferences);
  }

  ok(): void {
    if (this.isUnique) {
      const obj = {
        name: this.job.newName,
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
    } else {
      this.wizard.step = 1;
    }
  }

  cancel(): void {
    this.activeModal.destroy();
  }

  checkJobName(): void {
    this.isUnique = true;
    if (!this.job.newName || this.job.newName === '') {
      this.isUnique = false;
      return;
    }
    for (const i in this.jobs) {
      if (this.jobs[i].name === this.job.newName) {
        this.isUnique = false;
        break;
      }
    }
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
    const arr2 = [];
    if (this.job.params.length > 0) {
      let arr = [];
      for (let i = 0; i < this.job.params.length; i++) {
        if (this.job.params[i].defaultValue) {
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
  }
}
