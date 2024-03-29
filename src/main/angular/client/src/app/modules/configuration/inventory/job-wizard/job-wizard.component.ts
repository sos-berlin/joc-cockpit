import {Component, inject} from '@angular/core';
import {NZ_MODAL_DATA, NzModalRef} from 'ng-zorro-antd/modal';
import {isArray, sortBy} from "underscore";
import {debounceTime} from "rxjs/operators";
import {Subject} from "rxjs";
import {CoreService} from '../../../../services/core.service';
import {InventoryObject} from "../../../../models/enums";

@Component({
  selector: 'app-job-wizard',
  templateUrl: './job-wizard.component.html'
})
export class JobWizardComponent {
  readonly modalData: any = inject(NZ_MODAL_DATA);
  existingJob: any;
  node: any;
  index = 0;
  preferences: any;
  wizard = {
    step: 1,
    checked: false,
    loading: false,
    indeterminate: false,
    token: '',
    searchText: '',
    searchText2: '',
    setOfCheckedValue: new Set<string>()
  };
  filter = {
    sortBy: 'name',
    reverse: false
  };
  jobTemplates: any = [];
  jobTree: any = [];
  jobList: any;
  job: any;
  loading = true;
  isTreeLoad = false;
  selectValue = [
    {label: 'True', value: 'true'},
    {label: 'False', value: 'false'}
  ];

  allowEmptyArguments = false;

  private searchTerm = new Subject<string>();

  constructor(private coreService: CoreService, private activeModal: NzModalRef) {
  }

  ngOnInit(): void {
    this.existingJob = this.modalData.existingJob;
    this.allowEmptyArguments = sessionStorage['allowEmptyArguments'] == 'true';
    this.node = this.modalData.node;
    this.preferences = sessionStorage['preferences'] ? JSON.parse(sessionStorage['preferences']) : {};
    this.getJitlJobs();
    this.searchTerm.pipe(debounceTime(200))
      .subscribe((searchValue: string) => {
        this.searchObjects(searchValue);
      });
  }

  isAnyRequiredVariable() {
    this.job.params.forEach(param => {
      if(!this.job.hasRequiredArguments) {
        this.job.hasRequiredArguments = param.required;
      }
      if(param.required) {
        this.wizard.setOfCheckedValue.add(param.name);
      }
    });
  }

  tabChange($event): void {
    this.job = {};
    this.index = $event.index;
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
      folders: [
        {folder: '/', recursive: true}
      ],
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
    e.isExpanded = !e.isExpanded;
    if (e.isExpanded) {
      this.loadData(e);
    }
  }

  onExpand(e): void {
    this.loadData(e.node);
  }

  private loadData(e): void {
    const data = e.origin || e;
    if (!data) {
      return;
    }
    if (!data.jobTemplates) {
      e.origin.loading = true;
      const obj: any = {
        folders: [{
          folder: e.key,
          recursive: false
        }],
        compact: true
      };
      this.coreService.post('job_templates', obj).subscribe({
        next: (res: any) => {
          e.origin.loading = false;
          data.jobTemplates = res.jobTemplates;
          data.jobTemplates = sortBy(data.jobTemplates, 'name');
        }, error: () => {
          data.jobTemplates = [];
          e.origin.loading = false;
        }
      });
    }
  }

  clearSearchInput(): void {
    this.jobTemplates = [];
    this.wizard.searchText2 = '';
  }

  onSearchInput(searchValue: string) {
    this.searchTerm.next(searchValue);
  }

  private searchObjects(value: string) {
    if (value !== '') {
      const searchValueWithoutSpecialChars = value.replace(/[^\w\s]/gi, '');
      if (searchValueWithoutSpecialChars.length >= 2) {
        this.wizard.loading = true;
        const request: any = {
          search: value,
          returnTypes: ["JOBTEMPLATE"]
        };
        if (this.wizard.token) {
          request.token = this.wizard.token;
        }
        this.coreService.post('inventory/quick/search', request).subscribe({
          next: (res: any) => {
            this.wizard.token = res.token;
            this.jobTemplates = res.results;
            this.wizard.loading = false;
          }, error: () => this.wizard.loading = false
        });
      }
    } else {
      this.jobTemplates = [];
    }
  }

  selectJob(job): void {
    this.coreService.post('inventory/wizard/job', {
      assignReference: job.assignReference
    }).subscribe((res) => {
      this.job = res;
      this.job.paramList = [];
      this.wizard.setOfCheckedValue = new Set<string>();
      this.wizard.checked = false;
      this.wizard.indeterminate = false;
      this.checkRequiredParam();
      this.isAnyRequiredVariable();
    });
  }

  selectJobTemp(job): void {
    if (job.loading == undefined) {
      job.loading = true;
      this.coreService.post('job_template', {
        jobTemplatePath: job.path
      }).subscribe({
        next: (res) => {
          job.loading = false;
          this.job = res.jobTemplate;
          if (this.job.arguments) {
            const temp = this.coreService.clone(this.job.arguments);
            this.job.arguments = Object.entries(temp).map(([k, v]) => {
              const val: any = v;
              if (val.default) {
                delete val.listParameters;
                if (val.type === 'String') {
                  this.coreService.removeSlashToString(val, 'default');
                } else if (val.type === 'Boolean') {
                  val.default = (val.default === true || val.default === 'true');
                }
              }
              if (val.list) {
                let list = [];
                val.list.forEach((val) => {
                  let obj = {name: val};
                  this.coreService.removeSlashToString(obj, 'name');
                  list.push(obj);
                });
                val.list = list;
              }
              return {
                name: k,
                type: val.type,
                description: val.description,
                required: val.required,
                defaultValue: val.default,
                list: val.list,
                facet: val.facet,
                message: val.message
              };
            });
          }
          this.job.jobTemplate = true;
          this.job.paramList = [];
          this.wizard.setOfCheckedValue = new Set<string>();
          this.wizard.checked = false;
          this.wizard.indeterminate = false;
          this.checkRequiredParam(true);
          this.isAnyRequiredVariable();
        }, error: () => {
          job.loading = false;
        }
      });
    }
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

  checkCheckbox(param): void {
    if (param.newValue && param.newValue !== param.defaultValue) {
      this.wizard.setOfCheckedValue.add(param.name);
    }
  }

  showDoc(docName): void {
    this.coreService.showDocumentation(docName, this.preferences);
  }

  ok(): void {
    let obj: any = {};
    if (!this.job.jobTemplate) {
      obj = {
        executable: {
          TYPE: 'InternalExecutable',
          className: this.job.javaClass,
          arguments: []
        },
        documentationName: this.job.assignReference,
      };
      this.updateParam(obj);
    } else {
      obj = this.coreService.clone(this.job);
      obj.jobTemplateName = this.job.name;
      delete obj.jobTemplate;
      delete obj.paramList;
      delete obj.params;
      delete obj.version;
      if (obj.executable.TYPE !== 'InternalExecutable') {
        delete obj.arguments;
      }
      this.updateParam(obj);
    }
    obj.title = this.job.title;

    if (this.node) {
      this.activeModal.close(obj);
    } else {
      this.activeModal.close(this.job);
    }
  }

  private updateParam(obj): void {
    this.job.params.forEach(item => {
      if (this.wizard.setOfCheckedValue.has(item.name)) {
        if (obj.executable.TYPE === 'InternalExecutable') {
          if (!obj.executable.arguments) {
            obj.executable.arguments = [];
          }
          obj.executable.arguments.push({name: item.name, value: item.newValue});
        } else if (this.node) {
          if (!this.node.defaultArguments) {
            this.node.defaultArguments = []
          }
          if (!this.checkAlreadyExistArgu(item)) {
            this.node.defaultArguments.push({name: item.name, value: item.newValue + ''});
          }
        }
      }
    });
    if (this.job.paramList && this.job.paramList.length > 0) {
      for (const i in this.job.paramList) {
        if (this.job.paramList[i].name) {
          if (obj.executable.TYPE === 'InternalExecutable') {
            obj.executable.arguments.push({name: this.job.paramList[i].name, value: this.job.paramList[i].newValue});
          } else if (this.node) {
            if (!this.checkAlreadyExistArgu(this.job.paramList[i])) {
              if (this.job.paramList[i].newValue) {
                this.node.defaultArguments.push({
                  name: this.job.paramList[i].name,
                  value: this.job.paramList[i].newValue + ''
                });
              }
            }
          }
        }
      }
    }
  }

  private checkAlreadyExistArgu(item): boolean {
    let flag = false;
    let index = -1;
    for (let i = 0; i < this.node.defaultArguments.length; i++) {
      if (!this.node.defaultArguments[i].name) {
        index = i;
      }
      if (this.node.defaultArguments[i].name === item.name) {
        if (item.newValue || item.newValue === false || item.newValue === 0) {
          this.node.defaultArguments[i].value = item.newValue + '';
        } else if (this.node.defaultArguments[i].value == '') {
          this.node.defaultArguments[i].value = item.defaultValue + '';
        }
        flag = true;
        break;
      }
    }
    if (index > -1) {
      this.node.defaultArguments.splice(index, 1);
    }
    return flag;
  }

  cancel(): void {
    this.activeModal.destroy();
  }

  /*--------------- Checkbox functions -------------*/

  onAllChecked(isChecked: boolean): void {
    this.job.params.forEach(item => this.updateCheckedSet(item, isChecked));
  }

  onItemChecked(item: any, checked: boolean): void {
    this.updateCheckedSet(item, checked);
  }

  updateCheckedSet(data: any, checked: boolean): void {
    if (data.name && (data.newValue || data.newValue == 0 || data.newValue == false)) {
      if (checked) {
        this.wizard.setOfCheckedValue.add(data.name);
      } else {
        this.wizard.setOfCheckedValue.delete(data.name);
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

  checkRequiredParam(checkType?): void {
    let existingArguments = [];
    if (!this.job.params) {
      this.job.params = [];
    }
    if (checkType) {
      if (this.job.arguments && this.job.arguments.length > 0) {
        this.job.params = this.coreService.clone(this.job.arguments);
      }
    } else {
      if (this.job.arguments) {
        if (!isArray(this.job.arguments)) {
          this.job.params = Object.entries(this.job.arguments).map(([k, v]) => {
            const val: any = v;
            return {
              name: k,
              required: val.required,
              description: val.description,
              type: val.type,
              defaultValue: val.default
            };
          });
        }
      }
      if (this.existingJob.executable.arguments && this.existingJob.executable.arguments.length > 0) {
        existingArguments = this.coreService.clone(this.existingJob.executable.arguments);
      }
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
        if ((this.job.params[i].defaultValue || this.job.params[i].defaultValue === false || this.job.params[i].defaultValue === 0)
          && (!this.job.params[i].newValue && this.job.params[i].newValue != 0 && this.job.params[i].newValue != false)) {
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
