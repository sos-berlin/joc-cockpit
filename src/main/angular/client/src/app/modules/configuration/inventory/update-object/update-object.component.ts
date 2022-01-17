import {Component, Input, OnInit} from '@angular/core';
import {NzModalRef} from 'ng-zorro-antd/modal';
import {isArray, isEmpty, isEqual, sortBy} from 'underscore';
import {CoreService} from '../../../../services/core.service';
import {InventoryObject} from '../../../../models/enums';
import {WorkflowService} from '../../../../services/workflow.service';
import {AuthService} from '../../../../components/guard';

@Component({
  selector: 'app-update-object',
  templateUrl: './update-object.component.html'
})
export class UpdateObjectComponent implements OnInit {
  @Input() data: any;
  @Input() type: string;
  @Input() controllerId: any;

  preferences: any = {};
  schedulerIds: any = {};
  comments: any = {};
  selectedSchedulerIds = [];
  zones = [];
  agents = [];
  workflowTree = [];
  jobResourcesTree = [];
  documentationTree = [];
  step = 1;
  submitted = false;
  isVisible = false;
  dateFormat: any;
  forkListVariables = [];
  variableList = [];
  object: any = {};
  workflow: any = {};

  constructor(private coreService: CoreService, public activeModal: NzModalRef,
              private workflowService: WorkflowService, private authService: AuthService) {
  }

  ngOnInit(): void {
    this.preferences = sessionStorage.preferences ? JSON.parse(sessionStorage.preferences) : {};
    this.schedulerIds = this.authService.scheduleIds ? JSON.parse(this.authService.scheduleIds) : {};
    this.comments.radio = 'predefined';
    this.selectedSchedulerIds.push(this.controllerId);
    this.init();
  }

  private init(): void {
    if (this.type === InventoryObject.WORKFLOW || this.type === 'FILEORDERSOURCE') {
      this.zones = this.coreService.getTimeZoneList();
    } else if (this.type === 'CALENDAR') {
      this.dateFormat = this.coreService.getDateFormat(this.preferences.dateFormat);
    } else if (this.type === 'NOTICEBOARD') {
      this.object = {
        endOfLifeMsg: '$js7EpochMilli + ',
        units: 'Milliseconds'
      };
    }
    if (this.jobResourcesTree.length === 0 && this.type === InventoryObject.WORKFLOW) {
      this.coreService.post('tree', {
        controllerId: this.controllerId,
        forInventory: true,
        types: [InventoryObject.JOBRESOURCE]
      }).subscribe((res) => {
        this.jobResourcesTree = this.coreService.prepareTree(res, false);
        this.getJobResources();
      });
    }
    if (this.workflowTree.length === 0 && (this.type === 'FILEORDERSOURCE' || this.type === 'SCHEDULE')) {
      this.coreService.post('tree', {
        controllerId: this.controllerId,
        forInventory: true,
        types: [InventoryObject.WORKFLOW]
      }).subscribe((res) => {
        this.workflowTree = this.coreService.prepareTree(res, false);
      });
    }
    if (this.documentationTree.length === 0) {
      this.coreService.post('tree', {
        onlyWithAssignReference: true,
        types: ['DOCUMENTATION']
      }).subscribe((res) => {
        this.documentationTree = this.coreService.prepareTree(res, true);
      });
    }
    if (this.agents.length === 0 && this.type === 'FILEORDERSOURCE') {
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

  onExpand(e, type): void {
    this.loadData(e.node, type, null);
  }

  loadData(node, type, $event): void {
    if (!node || !node.origin) {
      return;
    }
    if (!node.origin.type) {
      if ($event) {
        node.isExpanded = !node.isExpanded;
        $event.stopPropagation();
      }
      let flag = true;
      if (node.origin.children && node.origin.children.length > 0 && node.origin.children[0].type) {
        flag = false;
      }
      if (node && (node.isExpanded || node.origin.isLeaf) && flag) {
        this.updateList(node, type);
      }
    } else {
      if (type === 'DOCUMENTATION') {
         if (this.object.documentationName1) {
          if (this.object.documentationName !== this.object.documentationName1) {
            this.object.documentationName = this.object.documentationName1;
          }
        } else if (node.key && !node.key.match('/')) {
          if (this.object.documentationName !== node.key) {
            this.object.documentationName = node.key;
          }
        }
      } else if (type === 'WORKFLOW') {
        if (this.object.workflowName1) {
          if (this.object.workflowName !== this.object.workflowName1) {
            this.object.workflowName = this.object.workflowName1;
          }
        } else if (node.key && !node.key.match('/')) {
          if (this.object.workflowName !== node.key) {
            this.object.workflowName = node.key;
          }
        }
        if (this.object.workflowName && this.type === 'SCHEDULE') {
          this.getWorkflowInfo(this.object.workflowName);
        }
      }
    }
  }

  private getWorkflowInfo(name): void {
    this.coreService.post('inventory/read/configuration', {
      path: name,
      objectType: InventoryObject.WORKFLOW
    }).subscribe((conf: any) => {
      this.workflow = conf.configuration;
      this.object.variableSets = [];
      this.updateVariableList();
    });
  }

  private updateList(node, type): void {
    let obj: any = {
      path: node.key,
      objectTypes: [type]
    };
    if (type === 'DOCUMENTATION') {
      obj = {
        folders: [{folder: node.key, recursive: false}],
        onlyWithAssignReference: true
      };
    }
    const URL = type === 'DOCUMENTATION' ? 'documentations' : 'inventory/read/folder';
    this.coreService.post(URL, obj).subscribe((res: any) => {
      let data;
      if (type === InventoryObject.WORKFLOW) {
        data = res.workflows;
      } else if (type === 'DOCUMENTATION') {
        data = res.documentations;
      }
      data = sortBy(data, 'name');
      for (let i = 0; i < data.length; i++) {
        const path = node.key + (node.key === '/' ? '' : '/') + data[i].name;
        data[i].title = data[i].assignReference || data[i].name;
        data[i].path = path;
        data[i].key = data[i].assignReference || data[i].name;
        data[i].type = type;
        data[i].isLeaf = true;
      }
      if (node.origin.children && node.origin.children.length > 0) {
        data = data.concat(node.origin.children);
      }
      if (node.origin.isLeaf) {
        node.origin.expanded = true;
      }
      node.origin.isLeaf = false;
      node.origin.children = data;
      if (type === 'DOCUMENTATION') {
        this.documentationTree = [...this.documentationTree];
      } else if (type === InventoryObject.WORKFLOW) {
        this.workflowTree = [...this.workflowTree];
      } else if (type === InventoryObject.JOBRESOURCE) {
        this.jobResourcesTree = [...this.jobResourcesTree];
      }
    });
  }

  openRuntimeEditor(): void {
    this.isVisible = true;
  }

  private setForkListVariables(sour, target): void {
    for (let x in target) {
      if (target[x].name === sour.name) {
        if (sour.value) {
          if (sour.value.length > 0) {
            for (const i in sour.value) {
              sour.value[i] = Object.entries(sour.value[i]).map(([k1, v1]) => {
                let type;
                for (const prop in target[x].list) {
                  if (target[x].list[prop].name === k1) {
                    type = target[x].list[prop].value.type;
                    break;
                  }
                }
                return {name: k1, value: v1, type};
              });
            }
          } else {
            const tempArr = [];
            for (const prop in target[x].list) {
              tempArr.push({name: target[x].list[prop].name, value: '', type: target[x].list[prop].value.type});
            }
            sour.value.push(tempArr);
          }
        }
        target[x].actualList = sour.value;
        break;
      }
    }
  }

  updateVariableList(): void {
    this.variableList = [];
    this.forkListVariables = [];
    if (this.workflow.orderPreparation && this.workflow.orderPreparation.parameters && !isEmpty(this.workflow.orderPreparation.parameters)) {
      this.variableList = Object.entries(this.workflow.orderPreparation.parameters).map(([k, v]) => {
        const val: any = v;
        if (val.type === 'List') {
          const actualList = [];
          if (val.listParameters) {
            if (isArray(val.listParameters)) {
              val.listParameters.forEach((item) => {
                actualList.push({name: item.name, type: item.value.type});
              });
            } else {
              val.listParameters = Object.entries(val.listParameters).map(([k1, v1]) => {
                const val1: any = v1;
                actualList.push({name: k1, type: val1.type});
                return {name: k1, value: val1};
              });
            }
            this.forkListVariables.push({name: k, list: val.listParameters, actualList: [actualList]});
            if (this.object.variableSets.length === 0) {
              this.object.variableSets.push(
                {
                  orderName: '',
                  variables: [],
                  forkListVariables: this.coreService.clone(this.forkListVariables)
                });
            }
          }
        } else {
          if (this.object.variableSets.length === 0) {
            if (!val.default && val.default !== false && val.default !== 0) {
              if (!val.final) {
                this.object.variableSets.push({orderName: '', variables: []});
              }
            }
          }
          for (const prop in this.object.variableSets) {
            let isExist = false;
            for (let i = 0; i < this.object.variableSets[prop].variables.length; i++) {
              if (this.object.variableSets[prop].variables[i].name === k) {
                this.object.variableSets[prop].variables[i].type = val.type;
                if (!val.default && val.default !== false && val.default !== 0 && !isExist) {
                  this.object.variableSets[prop].variables[i].isRequired = true;
                }
                isExist = true;
                break;
              }
            }
            if (!val.default && val.default !== false && val.default !== 0 && !isExist) {
              if (!val.final) {
                this.object.variableSets[prop].variables.push({name: k, type: val.type, isRequired: true});
              }
            }
          }
        }
        return {name: k, value: v};
      });
      this.variableList = this.variableList.filter((item) => {
        if (item.value.type === 'List') {
          return false;
        }
        return !item.value.final;
      });


      for (const prop in this.object.variableSets) {
        this.object.variableSets[prop].forkListVariables = this.coreService.clone(this.forkListVariables);
        if (this.object.variableSets[prop].variables && this.object.variableSets[prop].variables.length > 0) {
          this.object.variableSets[prop].variables = this.object.variableSets[prop].variables.filter(item => {
            if (isArray(item.value)) {
              this.setForkListVariables(item, this.object.variableSets[prop].forkListVariables);
              return false;
            } else {
              return true;
            }
          });
        }
      }
    } else {
      this.object.variableSets = [];
    }
    this.updateSelectItems();
  }

  checkVariableType(argument): void {
    const obj = this.workflow.orderPreparation.parameters[argument.name];
    if (obj) {
      argument.type = obj.type;
      if (!obj.default && obj.default !== false && obj.default !== 0) {
        argument.isRequired = true;
      } else {
        if (obj.type === 'String') {
          this.coreService.removeSlashToString(obj, 'default');
        } else if (obj.type === 'Boolean') {
          argument.value = (obj.default === true || obj.default === 'true');
        } else {
          argument.value = obj.default;
        }
      }
    }
    this.updateSelectItems();
  }

  updateSelectItems(): void {
    for (const prop in this.object.variableSets) {
      this.object.variableSets[prop].variableList = this.coreService.clone(this.variableList);
      for (let i = 0; i < this.object.variableSets[prop].variableList.length; i++) {
        this.object.variableSets[prop].variableList[i].isSelected = false;
        for (let j = 0; j < this.object.variableSets[prop].variables.length; j++) {
          if (this.object.variableSets[prop].variableList[i].name === this.object.variableSets[prop].variables[j].name) {
            this.object.variableSets[prop].variableList[i].isSelected = true;
            break;
          }
        }
      }
    }
  }

  addVariableToList(data): void {
    const arr = [];
    data.list.forEach(item => {
      arr.push({name: item.name, type: item.value.type});
    });
    let flag = false;
    for (const i in data.actualList) {
      for (const j in data.actualList[i]) {
        if (!data.actualList[i][j].value) {
          flag = true;
          break;
        }
      }
      if (flag) {
        break;
      }
    }
    if (!flag) {
      data.actualList.push(arr);
    }
  }

  addVariableSet(): void {
    const variableSet: any = {
      orderName: '',
      variables: [],
      forkListVariables: this.coreService.clone(this.forkListVariables)
    };
    if (this.object.variableSets) {
      if (!this.coreService.isLastEntryEmpty(this.object.variableSets, 'orderName', '') || this.object.variableSets.length < 2) {
        this.object.variableSets.push(variableSet);
        variableSet.variableList = this.coreService.clone(this.variableList);
        if (variableSet.variableList.length > 0) {
          for (const i in variableSet.variableList) {
            let val = variableSet.variableList[i].value;
            if (!val.default && val.default !== false && val.default !== 0) {
              if (!val.final) {
                variableSet.variables.push({name: variableSet.variableList[i].name, type: val.type, isRequired: true});
              }
            }
          }
        }
      }
    }
  }

  addVariable(isNew = false, variableSet): void {
    const param: any = {
      name: '',
      value: ''
    };
    if (variableSet.variables) {
      if (!this.coreService.isLastEntryEmpty(variableSet.variables, 'name', '')) {
        if (isNew) {
          param.isTextField = true;
        }
        variableSet.variables.push(param);
      }
    }
  }

  removeVariableSet(index): void {
    this.object.variableSets.splice(index, 1);
  }

  removeVariableFromList(index, list): void {
    list.splice(index, 1);
  }

  removeVariable(index, variableSet): void {
    variableSet.variables.splice(index, 1);
    this.updateSelectItems();
  }

  isOrderNameValid(data, form, list): void {
    if (form.invalid) {
      data.orderName = '';
    } else {
      let count = 0;
      if (list.length > 1) {
        for (let i in list) {
          if (list[i].orderName === data.orderName) {
            ++count;
          }
          if (count > 1) {
            form.control.setErrors({incorrect: true});
            break;
          }
        }
      }
    }
  }

  onKeyPress($event, variableSet): void {
    if ($event.which === '13' || $event.which === 13) {
      if (variableSet) {
        this.addVariable(false, variableSet);
      } else {
        this.addVariableSet();
      }
    }
  }

  changeExp($event, type: string): void {
    if (type === 'toNotice') {
      this.object.postOrderToNoticeId = $event;
    } else {
      this.object.expectOrderToNoticeId = $event;
    }
  }

  changeUnit($event): void {
    if ($event === 'HH:MM:SS') {
      if (!isNaN(this.object.endOfLife)) {
        this.object.endOfLife = '';
      }
    } else {
      if (isNaN(this.object.endOfLife)) {
        this.object.endOfLife = '';
      }
    }
  }

  deploy(isDeploy): void {
    this.submitted = true;
    const obj: any = {};
    if (isDeploy) {
      obj.controllerIds = this.selectedSchedulerIds;
      obj.store = {
        draftConfigurations: []
      };
    } else {
      obj.update = [];
    }
    if (this.comments.comment) {
      obj.auditLog = this.comments;
    }
    this.data.forEach((item) => {
      const configuration = {
        path: item.path,
        objectType: this.type
      };
      if (isDeploy) {
        obj.store.draftConfigurations.push({configuration});
      } else {
        obj.update.push(configuration);
      }
    });
    const URL = !isDeploy ? 'inventory/release' : 'inventory/deployment/deploy';
    this.coreService.post(URL, obj).subscribe({
      next: () => {
        this.activeModal.close('ok');
      }, error: () => this.submitted = false
    });
  }

  updateObject(data, cb): void {
    this.coreService.post('inventory/store', {
      configuration: data.configuration,
      valid: true,
      id: data.id,
      objectType: this.type
    }).subscribe({
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

  private getConvertedValue(value): any {
    let str = value;
    if (this.object.units === 'Seconds') {
      str = str + ' * 1000';
    } else if (this.object.units === 'Minutes') {
      str = str + ' * 60 * 1000';
    } else if (this.object.units === 'Hours') {
      str = str + ' * 60 * 60 * 1000';
    } else if (this.object.units === 'Days') {
      str = str + ' * 24 * 60 * 60 * 1000';
    } else if (this.object.units === 'HH:MM:SS') {
      const arr = value.split(':');
      let ms = 0;
      for (const i in arr) {
        if (i === '0') {
          ms += (arr[i] * 60 * 60 * 1000);
        } else if (i === '1') {
          ms += (arr[i] * 60 * 1000);
        } else {
          ms += (arr[i] * 1000);
        }
      }
      str = ms;
    }
    return str;
  }

  private updateProperties(obj, object): any {
    if (object.title) {
      obj.title = object.title;
    }
    if (object.documentationName) {
      obj.documentationName = object.documentationName;
    }
    if (object.workflowName) {
      if (this.type === 'SCHEDULE' || this.type === 'FILEORDERSOURCE') {
        obj.workflowName = object.workflowName;
      }
    }
    if (object.timeZone) {
      if (this.type === 'WORKFLOW' || this.type === 'FILEORDERSOURCE') {
        obj.timeZone = object.timeZone;
      }
    }
    if (this.type === 'WORKFLOW') {
      if (object.jobResourceNames) {
        obj.jobResourceNames = object.jobResourceNames;
      }
    } else if (this.type === 'FILEORDERSOURCE') {
      if (object.agentName) {
        obj.agentName = object.agentName;
      }
      if (object.directoryExpr) {
        obj.directoryExpr = object.directoryExpr;
      }
      if (object.pattern) {
        obj.pattern = object.pattern;
      }
      if (object.delay) {
        obj.delay = object.delay;
      }
    } else if (this.type === 'NOTICEBOARD') {
      if (object.endOfLife) {
        obj.endOfLife = object.endOfLifeMsg + this.getConvertedValue(object.endOfLife);
      }
      if (object.postOrderToNoticeId) {
        obj.postOrderToNoticeId = object.postOrderToNoticeId;
      }
      if (object.expectOrderToNoticeId) {
        obj.expectOrderToNoticeId = object.expectOrderToNoticeId;
      }
    } else if (this.type === 'LOCK') {
      if (object.limit || object.limit === 0) {
        obj.limit = object.limit;
      }
    } else if (this.type === 'SCHEDULE') {
      if (object.planOrderAutomatically || object.planOrderAutomatically === false) {
        obj.planOrderAutomatically = object.planOrderAutomatically;
      }
      if (object.submitOrderToControllerWhenPlanned || object.submitOrderToControllerWhenPlanned === false) {
        obj.submitOrderToControllerWhenPlanned = object.submitOrderToControllerWhenPlanned;
      }
      let isEmptyExist = false;
      obj.variableSets = obj.variableSets.filter(variableSet => {
        if (variableSet.orderName === '' || !variableSet.orderName) {
          if (isEmptyExist) {
            return false;
          }
          isEmptyExist = true;
        }
        if (variableSet.variables && isArray(variableSet.variables)) {
          variableSet.variables = variableSet.variables.filter((variable) => {
            return !!variable.name;
          });
          variableSet.variables = variableSet.variables.map(variable => ({name: variable.name, value: variable.value}));
          variableSet.variables = this.coreService.keyValuePair(variableSet.variables);
        }
        if (variableSet.forkListVariables) {
          variableSet.forkListVariables.forEach((item) => {
            variableSet.variables[item.name] = [];
            if (item.actualList) {
              for (const i in item.actualList) {
                const listObj = {};
                item.actualList[i].forEach((data) => {
                  if (data.value) {
                    listObj[data.name] = data.value;
                  }
                });
                if (!isEmpty(listObj)) {
                  variableSet.variables[item.name].push(listObj);
                }
              }
            }
          });
        }
        return true;
      });

      obj.variableSets = obj.variableSets.map(variableSet => {
        return {orderName: variableSet.orderName, variables: variableSet.variables};
      });

      if (obj.nonWorkingDayCalendars.length === 0) {
        delete obj.nonWorkingDayCalendars;
      }


      if (obj.calendars.length > 0) {
        for (let i = 0; i < obj.calendars.length; i++) {
          delete obj.calendars[i].type;
          if (obj.calendars[i].frequencyList) {
            if (obj.calendars[i].frequencyList.length > 0) {
              obj.calendars[i].includes = {};
              obj.calendars[i].frequencyList.forEach((val) => {
                //this.calendarService.generateCalendarObj(val, obj.calendars[i]);
              });
            }
            delete obj.calendars[i].frequencyList;
          }
        }
      }
      if (obj.nonWorkingDayCalendars && obj.nonWorkingDayCalendars.length > 0) {
        for (const i in obj.nonWorkingDayCalendars) {
          delete obj.nonWorkingDayCalendars[i].periods;
          delete obj.nonWorkingDayCalendars[i].type;
        }
      }
    } else if (this.type === 'CALENDAR') {
      if (object.type) {
        obj.type = object.type;
      }
      if (object.from) {
        obj.from = object.from;
      }
      if (object.to) {
        obj.to = object.to;
      }
    }
    return obj;
  }

  private findAndUpdate(cb): void {
    this.data.forEach((item, index) => {
      this.coreService.post('inventory/read/configuration', {
        id: item.id
      }).subscribe((res: any) => {
        res.configuration = this.updateProperties(res.configuration, this.object);
        this.updateObject(res, index === this.data.length - 1 ? cb : null);
      });
    });
  }

  onSubmit(): void {
    this.submitted = true;
    this.findAndUpdate(() => {
      this.step = 2;
      this.submitted = false;
    });
  }
}
