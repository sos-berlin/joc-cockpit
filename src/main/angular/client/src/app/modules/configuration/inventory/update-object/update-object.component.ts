import {Component, Input, OnInit} from '@angular/core';
import {NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
import {CdkDragDrop, moveItemInArray} from "@angular/cdk/drag-drop";
import {isArray, isEmpty, sortBy} from 'underscore';
import {TranslateService} from '@ngx-translate/core';
import {CoreService} from '../../../../services/core.service';
import {InventoryObject} from '../../../../models/enums';
import {AuthService} from '../../../../components/guard';
import {CalendarService} from "../../../../services/calendar.service";
import {ValueEditorComponent} from "../../../../components/value-editor/value.component";

@Component({
  selector: 'app-update-object',
  templateUrl: './update-object.component.html'
})
export class UpdateObjectComponent implements OnInit {
  @Input() data: any;
  @Input() type: string;
  @Input() controllerId: any;

  preferences: any = {};
  permission: any = {};
  schedulerIds: any = {};
  comments: any = {};
  selectedSchedulerIds = [];
  zones = [];
  agentList = [];
  agents = {
    agentList: []
  };
  workflowTree = [];
  jobResourcesTree = [];
  documentationTree = [];
  positions = [];
  step = 1;
  submitted = false;
  isVisible = false;
  dateFormat: any;
  forkListVariables = [];
  variableList = [];
  object: any = {};
  workflow: any = {};
  required = false;

  constructor(private coreService: CoreService, public activeModal: NzModalRef, private calendarService: CalendarService,
              private authService: AuthService, private modal: NzModalService, private translate: TranslateService) {
  }

  ngOnInit(): void {
    this.preferences = sessionStorage.preferences ? JSON.parse(sessionStorage.preferences) : {};
    this.schedulerIds = this.authService.scheduleIds ? JSON.parse(this.authService.scheduleIds) : {};
    this.permission = this.authService.permission ? JSON.parse(this.authService.permission) : {};
    this.comments.radio = 'predefined';
    if (sessionStorage.$SOS$FORCELOGING === 'true') {
      this.required = true;
    }
    this.selectedSchedulerIds.push(this.controllerId);
    this.init();
  }

  private init(): void {
    if (this.type === InventoryObject.WORKFLOW || this.type === InventoryObject.FILEORDERSOURCE) {
      this.zones = this.coreService.getTimeZoneList();
    } else if (this.type === 'CALENDAR') {
      this.dateFormat = this.coreService.getDateFormat(this.preferences.dateFormat);
    } else if (this.type === InventoryObject.NOTICEBOARD) {
      this.object = {
        endOfLifeMsg: '$js7EpochMilli + ',
        units: 'Milliseconds'
      };
    }
    if (this.jobResourcesTree.length === 0 && this.type === InventoryObject.WORKFLOW) {
      this.getJobResources();
    }
    if (this.workflowTree.length === 0 && (this.type === InventoryObject.FILEORDERSOURCE || this.type === InventoryObject.SCHEDULE)) {
      this.coreService.post('tree', {
        controllerId: this.controllerId,
        forInventory: true,
        types: [InventoryObject.WORKFLOW]
      }).subscribe((res) => {
        this.workflowTree = this.coreService.prepareTree(res, false);
      });
    }
    if (this.documentationTree.length === 0 && this.permission.joc.documentations.view) {
      this.coreService.post('tree', {
        onlyWithAssignReference: true,
        types: ['DOCUMENTATION']
      }).subscribe((res) => {
        this.documentationTree = this.coreService.prepareTree(res, true);
      });
    }
    if (this.type === InventoryObject.FILEORDERSOURCE && this.permission.joc.inventory.view) {
      this.coreService.getAgents(this.agents, this.controllerId, () =>{
        this.agentList = this.coreService.clone(this.agents.agentList);
      });
    }
  }

  onAgentChange(value: string): void {
    let temp = this.coreService.clone(this.agents.agentList);
    this.agentList = this.coreService.getFilterAgentList(temp, value, true);
    this.agentList = [...this.agentList];
  }

  private getJobResources(): void {
    this.coreService.getJobResource((arr) => {
      this.jobResourcesTree = arr;
    });
  }

  onRemoved(data): void {
    this.object.workflowNames.splice(this.object.workflowNames.indexOf(data.key), 1);
    this.object.orderParameterisations = [];
    this.variableList = [];
    this.forkListVariables = [];
  }

  selectStartNode(value, positions): void{
    if(value){
      positions.endPositions = [];
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
      if (type === 'WORKFLOW') {
        if (this.object.workflowName1) {
          if (this.object.workflowName !== this.object.workflowName1) {
            this.object.workflowName = this.object.workflowName1;
          }
        } else if (node.key && !node.key.match('/')) {
          if (this.object.workflowName !== node.key) {
            this.object.workflowName = node.key;
          }
        }
        if (this.object.workflowName && this.type === InventoryObject.SCHEDULE) {
          this.getWorkflowInfo(this.object.workflowName);
        }
      }
    }
  }

  private updateList(node, type): void {
    let obj: any = {
      path: node.key,
      objectTypes: [type]
    };
    const URL = 'inventory/read/folder';
    this.coreService.post(URL, obj).subscribe((res: any) => {
      let data;
      if (type === InventoryObject.WORKFLOW) {
        data = res.workflows;
      }
      data = sortBy(data, (i: any) => {
        return i.name.toLowerCase();
      });
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
      if (type === InventoryObject.WORKFLOW) {
        this.workflowTree = [...this.workflowTree];
      } else if (type === InventoryObject.JOBRESOURCE) {
        this.jobResourcesTree = [...this.jobResourcesTree];
      }
    });
  }

  private getWorkflowInfo(name): void {
    this.coreService.post('inventory/read/configuration', {
      path: name,
      objectType: InventoryObject.WORKFLOW
    }).subscribe((conf: any) => {
      this.workflow = conf.configuration;
      this.object.orderParameterisations = [];
      this.updateVariableList();
      this.getPositions(conf.path);
    });
  }

  /*------------ BEGIN SCHEDULE -----------------*/

  openRuntimeEditor(): void {
    if (!this.object.configuration) {
      this.object.configuration = {
        calendars: [],
        nonWorkingDayCalendars: []
      };
    }
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
            if (this.object.orderParameterisations.length === 0) {
              this.object.orderParameterisations.push(
                {
                  orderName: '',
                  positions: {},
                  variables: [],
                  forkListVariables: this.coreService.clone(this.forkListVariables)
                });
            }
          }
        } else {
          for (const prop in this.object.orderParameterisations) {
            let isExist = false;
            for (let i = 0; i < this.object.orderParameterisations[prop].variables.length; i++) {
              if (this.object.orderParameterisations[prop].variables[i].name === k) {
                this.object.orderParameterisations[prop].variables[i].type = val.type;
                if (!val.default && val.default !== false && val.default !== 0 && !isExist) {
                  this.object.orderParameterisations[prop].variables[i].isRequired = true;
                }
                isExist = true;
                break;
              }
            }
            if (!val.default && val.default !== false && val.default !== 0 && !isExist) {
              if (!val.final) {
                this.object.orderParameterisations[prop].variables.push({name: k, type: val.type, isRequired: true});
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


      for (const prop in this.object.orderParameterisations) {
        this.object.orderParameterisations[prop].forkListVariables = this.coreService.clone(this.forkListVariables);
        if (this.object.orderParameterisations[prop].variables && this.object.orderParameterisations[prop].variables.length > 0) {
          this.object.orderParameterisations[prop].variables = this.object.orderParameterisations[prop].variables.filter(item => {
            if (isArray(item.value)) {
              this.setForkListVariables(item, this.object.orderParameterisations[prop].forkListVariables);
              return false;
            } else {
              return true;
            }
          });
        }
      }
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

  private getPositions(path): void {
    this.coreService.post('inventory/read/order/positions', {
      workflowPath: path
    }).subscribe((res) => {
      this.positions = res.positions.filter(pos => {
        pos.position = JSON.stringify(pos.position);
        if(pos.type === 'ImplicitEnd'){
          pos.type = '--- end ---'
        }
        return true;
      });
    })
  }


  updateSelectItems(): void {
    for (const prop in this.object.orderParameterisations) {
      this.object.orderParameterisations[prop].variableList = this.coreService.clone(this.variableList);
      for (let i = 0; i < this.object.orderParameterisations[prop].variableList.length; i++) {
        this.object.orderParameterisations[prop].variableList[i].isSelected = false;
        for (let j = 0; j < this.object.orderParameterisations[prop].variables.length; j++) {
          if (this.object.orderParameterisations[prop].variableList[i].name === this.object.orderParameterisations[prop].variables[j].name) {
            this.object.orderParameterisations[prop].variableList[i].isSelected = true;
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
      positions: {},
      variables: [],
      forkListVariables: this.coreService.clone(this.forkListVariables)
    };
    if (this.object.orderParameterisations) {
      if (!this.coreService.isLastEntryEmpty(this.object.orderParameterisations, 'orderName', '') || this.object.orderParameterisations.length < 2) {
        this.object.orderParameterisations.push(variableSet);
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
    this.object.orderParameterisations.splice(index, 1);
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

  /*------------ END SCHEDULE -----------------*/

  /*------------ BEGIN JOBRESOURCE -----------------*/

  addEnv(): void {
    const param = {
      name: '',
      value: ''
    };
    if (!this.object.env) {
      this.object.env = [];
    }
    if (!this.coreService.isLastEntryEmpty(this.object.env, 'name', '')) {
      this.object.env.push(param);
    }
  }

  removeEnv(index): void {
    this.object.env.splice(index, 1);
  }

  addArgu(): void {
    const param = {
      name: '',
      value: ''
    };
    if (!this.object.arguments) {
      this.object.arguments = [];
    }
    if (!this.coreService.isLastEntryEmpty(this.object.arguments, 'name', '')) {
      this.object.arguments.push(param);
    }
  }

  removeArgu(index): void {
    this.object.arguments.splice(index, 1);
  }

  onKeyPress2($event, type): void {
    if ($event.which === '13' || $event.which === 13) {
      if (type === 'ENV') {
        this.addEnv();
      } else {
        this.addArgu();
      }
    }
  }

  isStringValid(data, notValid): void {
    if (notValid) {
      data.name = '';
      data.value = '';
    }
  }

  upperCase(env): void {
    if (env.name) {
      env.name = env.name.toUpperCase();
      if (!env.value) {
        env.value = '$' + env.name.toLowerCase();
      }
    }
  }

  drop(event: CdkDragDrop<string[]>, list): void {
    moveItemInArray(list, event.previousIndex, event.currentIndex);
  }


  openEditor(data): void {
    const modal = this.modal.create({
      nzTitle: null,
      nzContent: ValueEditorComponent,
      nzClassName: 'lg',
      nzComponentParams: {
        data: data.value
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        data.value = result;
      }
    });
  }

  /*------------ END JOBRESOURCE -----------------*/

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
    const request: any = {
      configuration: data.configuration,
      valid: true,
      path: data.path,
      objectType: this.type
    };
    if (sessionStorage.$SOS$FORCELOGING === 'true') {
      this.translate.get('auditLog.message.defaultAuditLog').subscribe(translatedValue => {
        request.auditLog = { comment: translatedValue };
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
      if (this.type === InventoryObject.SCHEDULE || this.type === InventoryObject.FILEORDERSOURCE) {
        obj.workflowName = object.workflowName;
      }
    }
    if (object.timeZone) {
      if (this.type === InventoryObject.WORKFLOW || this.type === InventoryObject.FILEORDERSOURCE) {
        obj.timeZone = object.timeZone;
      }
    }
    if (this.type === InventoryObject.WORKFLOW) {
      if (object.jobResourceNames) {
        obj.jobResourceNames = object.jobResourceNames;
      }
    } else if (this.type === InventoryObject.JOBRESOURCE) {
      if (object.env && object.env.length > 0) {
        obj.env = this.coreService.clone(object.env);
        obj.env.filter((env) => {
          this.coreService.addSlashToString(env, 'value');
        });
        this.coreService.convertArrayToObject(obj, 'env', true);
      }
      if (object.arguments && object.arguments.length > 0) {
        obj.arguments = this.coreService.clone(object.arguments);
        obj.arguments.filter((argu) => {
          this.coreService.addSlashToString(argu, 'value');
        });
        this.coreService.convertArrayToObject(obj, 'arguments', true);
      }
    } else if (this.type === InventoryObject.FILEORDERSOURCE) {
      if (object.agentName) {
        obj.agentName = object.agentName;
      }
      if (object.directoryExpr) {
        obj.directoryExpr = object.directoryExpr;
        this.coreService.addSlashToString(obj, 'directoryExpr');
      }
      if (object.pattern) {
        obj.pattern = object.pattern;
      }
      if (object.delay) {
        obj.delay = object.delay;
      }
    } else if (this.type === InventoryObject.NOTICEBOARD) {
      if (object.endOfLife) {
        obj.endOfLife = object.endOfLifeMsg + this.getConvertedValue(object.endOfLife);
      }
      if (object.postOrderToNoticeId) {
        obj.postOrderToNoticeId = object.postOrderToNoticeId;
      }
      if (object.expectOrderToNoticeId) {
        obj.expectOrderToNoticeId = object.expectOrderToNoticeId;
      }
    } else if (this.type === InventoryObject.LOCK) {
      if (object.limit || object.limit === 0) {
        obj.limit = object.limit;
      }
    } else if (this.type === InventoryObject.SCHEDULE) {
      if (object.planOrderAutomatically || object.planOrderAutomatically === false) {
        obj.planOrderAutomatically = object.planOrderAutomatically;
      }
      if (object.submitOrderToControllerWhenPlanned || object.submitOrderToControllerWhenPlanned === false) {
        obj.submitOrderToControllerWhenPlanned = object.submitOrderToControllerWhenPlanned;
      }
      if (object.workflowName) {
        obj.orderParameterisations = [];
      }
      if (object.orderParameterisations && object.orderParameterisations.length > 0) {
        obj.orderParameterisations = this.coreService.clone(object.orderParameterisations);
        let isEmptyExist = false;
        obj.orderParameterisations = obj.orderParameterisations.filter(variableSet => {
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
            variableSet.variables = variableSet.variables.map(variable => ({
              name: variable.name,
              value: variable.value
            }));
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

        obj.orderParameterisations = obj.orderParameterisations.map(variableSet => {
          return {orderName: variableSet.orderName, variables: variableSet.variables, positions: variableSet.variables};
        });
      }

      if (object.configuration) {
        if (object.configuration.nonWorkingDayCalendars && object.configuration.nonWorkingDayCalendars.length === 0) {
          delete object.configuration.nonWorkingDayCalendars;
        }
        if (object.configuration.calendars && object.configuration.calendars.length > 0) {
          for (let i = 0; i < object.configuration.calendars.length; i++) {
            delete object.configuration.calendars[i].type;
            if (object.configuration.calendars[i].frequencyList) {
              if (object.configuration.calendars[i].frequencyList.length > 0) {
                object.configuration.calendars[i].includes = {};
                object.configuration.calendars[i].frequencyList.forEach((val) => {
                  this.calendarService.generateCalendarObj(val, object.configuration.calendars[i]);
                });
              }
              delete object.configuration.calendars[i].frequencyList;
            }
          }
          obj.calendars = object.configuration.calendars;
        }
        if (object.configuration.nonWorkingDayCalendars && object.configuration.nonWorkingDayCalendars.length > 0) {
          for (const i in object.configuration.nonWorkingDayCalendars) {
            delete object.configuration.nonWorkingDayCalendars[i].periods;
            delete object.configuration.nonWorkingDayCalendars[i].type;
          }
          obj.nonWorkingDayCalendars = object.configuration.nonWorkingDayCalendars;
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
        path: item.path,
        objectType: item.objectType || item.type
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
