import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges
} from '@angular/core';
import {isEmpty, isArray, isEqual, clone} from 'underscore';
import {Subscription} from 'rxjs';
import {NzModalService} from 'ng-zorro-antd/modal';
import {ToastrService} from "ngx-toastr";
import {TranslateService} from '@ngx-translate/core';
import {InventoryObject} from '../../../../models/enums';
import {CoreService} from '../../../../services/core.service';
import {DataService} from '../../../../services/data.service';
import {CalendarService} from '../../../../services/calendar.service';
import {CommentModalComponent} from '../../../../components/comment-modal/comment.component';

@Component({
  selector: 'app-schedule',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './schedule.component.html',
})
export class ScheduleComponent {
  @Input() preferences: any;
  @Input() permission: any;
  @Input() schedulerId: any;
  @Input() data: any;
  @Input() copyObj: any;
  @Input() reload: any;
  @Input() isTrash: any;

  schedule: any = {};
  isVisible: boolean;
  dateFormat: any;
  isUnique = true;
  objectType = InventoryObject.SCHEDULE;
  workflowTree = [];
  forkListVariables = [];
  invalidMsg: string;
  workflow: any = {};
  variableList = [];
  documentationTree = [];
  indexOfNextAdd = 0;
  history = [];
  positions: any;
  newPositions: any;
  blockPositions: any;
  blockPositionList: any;
  lastModified: any = '';
  subscription1: Subscription;
  subscription2: Subscription;
  subscription3: Subscription;

  constructor(public coreService: CoreService, private translate: TranslateService, private toasterService: ToastrService,
              private calendarService: CalendarService, private dataService: DataService,
              private ref: ChangeDetectorRef, private modal: NzModalService) {
    this.subscription1 = dataService.reloadTree.subscribe(res => {
      if (res && !isEmpty(res)) {
        if (res.reloadTree && this.schedule.actual) {
          this.ref.detectChanges();
        }
      }
    });
    this.subscription2 = this.dataService.functionAnnounced$.subscribe(res => {
      if (res === 'REDO') {
        this.redo();
      } else if (res === 'UNDO') {
        this.undo();
      }
    });
    this.subscription3 = dataService.eventAnnounced$.subscribe(res => {
      this.refresh(res);
    });
  }

  ngOnInit(): void {
    this.dateFormat = this.coreService.getDateFormat(this.preferences.dateFormat);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['copyObj'] && !changes['data']) {
      return;
    }
    if (changes['reload']) {
      if (changes['reload'].previousValue === true && changes['reload'].currentValue === false) {
        return;
      }
      if (this.reload) {
        this.getObject();
        this.reload = false;
        return;
      }
    }
    if (this.schedule.actual) {
      this.saveJSON();
    }
    if (changes['data']) {
      if (this.data.type) {
        this.getObject();
      } else {
        this.schedule = {};
        this.ref.detectChanges();
      }
    }
  }

  ngOnDestroy(): void {
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
    this.subscription3.unsubscribe();
    if (this.schedule.name) {
      this.saveJSON();
    }
  }

  private refresh(args: { eventSnapshots: any[] }): void {
    if (args.eventSnapshots && args.eventSnapshots.length > 0) {
      for (let j = 0; j < args.eventSnapshots.length; j++) {
        if (args.eventSnapshots[j].path) {
          if (args.eventSnapshots[j].eventType.match(/InventoryTreeUpdated/)) {
            this.getWorkflowTree();
            break;
          }
        }
      }
    }
  }

  openRuntimeEditor(): void {
    this.isVisible = true;
  }

  closeCalendarView(): void {
    this.isVisible = false;
    this.ref.detectChanges();
    setTimeout(() => {
      this.saveJSON();
    }, 10);
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
    const obj: any = {
      orderName: '',
      variables: [],
      positions: {},
      forkListVariables: this.coreService.clone(this.forkListVariables)
    };
    if (this.schedule.configuration.orderParameterisations) {
      if (!this.coreService.isLastEntryEmpty(this.schedule.configuration.orderParameterisations, 'orderName', '') || this.schedule.configuration.orderParameterisations.length < 2) {
        this.schedule.configuration.orderParameterisations.push(obj);
        obj.variableList = this.coreService.clone(this.variableList);
        if (obj.variableList.length > 0) {
          for (const i in obj.variableList) {
            let val = obj.variableList[i].value;
            if (!val.default && val.default !== false && val.default !== 0) {
              if (!val.final) {
                let list;
                if (val.list) {
                  list = [];
                  val.list.forEach((item) => {
                    let obj = {name: item}
                    this.coreService.removeSlashToString(obj, 'name');
                    list.push(obj);
                  });
                }
                obj.variableList[i].isSelected = true;
                obj.variables.push({
                  name: obj.variableList[i].name,
                  type: val.type,
                  isRequired: true,
                  facet: val.facet,
                  message: val.message,
                  list
                });
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

  addVariables(isNew = false, variableSet): void {
    variableSet.variableList.forEach(variable => {
      if (!variable.isSelected) {
        variable.isSelected = true;
        const param: any = {
          name: variable.name,
          value: ''
        };
        if (isNew) {
          param.isTextField = true;
        }
        variableSet.variables.push(param);
        this.checkVariableType(param)
      }
    });
    this.saveJSON();
  }

  removeVariableSet(index): void {
    this.schedule.configuration.orderParameterisations.splice(index, 1);
    this.saveJSON();
  }

  removeVariableFromList(index, list): void {
    list.splice(index, 1);
    this.saveJSON();
  }

  removeVariable(index, variableSet): void {
    variableSet.variables.splice(index, 1);
    this.updateSelectItems();
    this.saveJSON();
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
      if (count < 2) {
        this.saveJSON();
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

  private getDocumentations(): void {
    if (this.documentationTree.length === 0 && this.permission.joc.documentations.view) {
      this.coreService.post('tree', {
        onlyWithAssignReference: true,
        types: ['DOCUMENTATION']
      }).subscribe((res) => {
        this.documentationTree = this.coreService.prepareTree(res, true);
      });
    }
  }

  navToWorkflow(workflowName): void {
    this.dataService.reloadTree.next({
      navigate: {
        name: workflowName,
        type: InventoryObject.WORKFLOW
      }
    });
  }

  private setForkListVariables(sour, target): void {
    for (let x in target) {
      if (target[x].name === sour.name) {
        if (sour.value) {
          if (sour.value.length > 0) {
            let notExistArr = [];
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

              for (const prop in target[x].list) {

                let flag = false;
                for (const j in sour.value[i]) {
                  if (target[x].list[prop].name === sour.value[i][j].name) {
                    flag = true;
                    break;
                  }
                }
                if (!flag) {
                  let isDuplicate = false;
                  for (let x in notExistArr) {
                    if (notExistArr[x].name == target[x].list[prop].name) {
                      isDuplicate = true;
                      break;
                    }
                  }
                  if (!isDuplicate) {
                    notExistArr.push(target[x].list[prop]);
                  }
                }
              }

              if (notExistArr.length > 0) {
                notExistArr.forEach(item => {
                  sour.value[i].push({name: item.name, type: item.value.type})
                })
              }
            }
          } else {
            const tempArr = [];
            for (const prop in target[x].list) {
              tempArr.push({name: target[x].list[prop].name, value: '', type: target[x].list[prop].value.type});
            }
            sour.value.push(tempArr);
          }

        }
        for (let x in this.forkListVariables) {
          if (this.forkListVariables[x].name == sour.name) {
            for (let i in sour.value) {
              sour.value[i] = sour.value[i].filter((item) => {
                let flag = false;
                for (let k in this.forkListVariables[x].list) {
                  if (this.forkListVariables[x].list[k].name == item.name) {
                    flag = true;
                    break;
                  }
                }
                return flag;
              });
            }
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
            if (this.schedule.configuration.orderParameterisations.length === 0) {
              this.schedule.configuration.orderParameterisations.push(
                {
                  orderName: '',
                  variables: [],
                  positions: {},
                  forkListVariables: this.coreService.clone(this.forkListVariables)
                });
            } else {
              for (const prop in this.schedule.configuration.orderParameterisations) {
                for (let i = 0; i < this.schedule.configuration.orderParameterisations[prop].variables.length; i++) {
                  if (this.schedule.configuration.orderParameterisations[prop].variables[i].name === k) {
                    this.schedule.configuration.orderParameterisations[prop].variables[i].isExist = true;
                    break;
                  }
                }
              }
            }
          }
        } else {
          if (this.schedule.configuration.orderParameterisations.length === 0) {
            if (!val.default && val.default !== false && val.default !== 0) {
              if (!val.final) {
                this.schedule.configuration.orderParameterisations.push({orderName: '', variables: [], positions: {}});
              }
            }
          }
          for (const prop in this.schedule.configuration.orderParameterisations) {
            let isExist = false;
            for (let i = 0; i < this.schedule.configuration.orderParameterisations[prop].variables.length; i++) {
              if (this.schedule.configuration.orderParameterisations[prop].variables[i].name === k) {
                this.schedule.configuration.orderParameterisations[prop].variables[i].isExist = true;
                this.schedule.configuration.orderParameterisations[prop].variables[i].type = val.type;
                this.schedule.configuration.orderParameterisations[prop].variables[i].facet = val.facet;
                this.schedule.configuration.orderParameterisations[prop].variables[i].message = val.message;
                let list;
                if (val.list) {
                  list = [];
                  let isFound = false;
                  val.list.forEach((item) => {
                    let obj = {name: item};
                    if (this.schedule.configuration.orderParameterisations[prop].variables[i].value === item) {
                      isFound = true;
                    }
                    this.coreService.removeSlashToString(obj, 'name');
                    list.push(obj);
                  });
                  if (!isFound) {
                    list.push({
                      name: this.schedule.configuration.orderParameterisations[prop].variables[i].value,
                      default: true
                    });
                  }
                }
                this.schedule.configuration.orderParameterisations[prop].variables[i].list = list;
                if (!val.default && val.default !== false && val.default !== 0 && !isExist) {
                  this.schedule.configuration.orderParameterisations[prop].variables[i].isRequired = true;
                }
                isExist = true;
                break;
              }
            }
            if (!val.default && val.default !== false && val.default !== 0 && !isExist) {
              if (!val.final) {
                let obj: any = {
                  name: k,
                  type: val.type,
                  isRequired: true,
                  facet: val.facet,
                  isExist: true,
                  message: val.message
                };
                if (val.list) {
                  obj.list = [];
                  val.list.forEach((item) => {
                    let obj1 = {name: item}
                    this.coreService.removeSlashToString(obj1, 'name');
                    obj.list.push(obj1);
                  });
                }
                this.schedule.configuration.orderParameterisations[prop].variables.push(obj);
              }
            }
          }
        }
        return {name: k, value: v};
      });

      for (const prop in this.schedule.configuration.orderParameterisations) {
        this.schedule.configuration.orderParameterisations[prop].variables = this.schedule.configuration.orderParameterisations[prop].variables.filter((item) => {
          if (item.isExist) {
            delete item.isExist;
            return true;
          } else {
            return false;
          }
        });
      }

      this.variableList = this.variableList.filter((item) => {
        if (item.value.type === 'List') {
          return false;
        }
        return !item.value.final;
      });

      for (const prop in this.schedule.configuration.orderParameterisations) {
        this.schedule.configuration.orderParameterisations[prop].forkListVariables = this.coreService.clone(this.forkListVariables);
        if (this.schedule.configuration.orderParameterisations[prop].variables && this.schedule.configuration.orderParameterisations[prop].variables.length > 0) {
          this.schedule.configuration.orderParameterisations[prop].variables = this.schedule.configuration.orderParameterisations[prop].variables.filter(item => {
            if (isArray(item.value)) {
              this.setForkListVariables(item, this.schedule.configuration.orderParameterisations[prop].forkListVariables);
              return false;
            } else {
              return true;
            }
          });
        }
      }
    } else if (this.schedule.configuration.orderParameterisations && this.schedule.configuration.orderParameterisations.length > 0) {
      for (const prop in this.schedule.configuration.orderParameterisations) {
        delete this.schedule.configuration.orderParameterisations[prop].forkListVariables;
        this.schedule.configuration.orderParameterisations[prop].variables = [];
      }
    }
    this.updateSelectItems(true);
  }

  checkVariableType(argument): void {
    const obj = this.workflow.orderPreparation.parameters[argument.name];
    if (obj) {
      argument.type = obj.type;
      argument.facet = obj.facet;
      argument.message = obj.message;
      if (!obj.default && obj.default !== false && obj.default !== 0) {
        delete argument.value;
        argument.isRequired = true;
      } else {
        if (obj.type === 'String') {
          this.coreService.removeSlashToString(obj, 'default');
          argument.value = obj.default;
        } else if (obj.type === 'Boolean') {
          argument.value = (obj.default === true || obj.default === 'true');
        } else {
          argument.value = obj.default;
        }
      }
      if (obj.list) {
        argument.list = [];
        let isFound = false;
        obj.list.forEach((item) => {
          let obj = {name: item};
          if (argument.value === item) {
            isFound = true;
          }
          this.coreService.removeSlashToString(obj, 'name');
          argument.list.push(obj);
        });
        if (!isFound) {
          argument.list.push({name: argument.value, default: true});
        }
      }
    }
    this.updateSelectItems();
  }

  updateSelectItems(flag?): void {
    for (const prop in this.schedule.configuration.orderParameterisations) {
      if (flag) {
        if (this.schedule.configuration.orderParameterisations[prop].positions) {
          let map = new Map();
          this.positions.forEach((k, v) => {
            map.set(k, v);
          });
          let map2 = new Map();
          this.blockPositions.forEach((k, v) => {
            map2.set(k, v);
          });
          if (this.schedule.configuration.orderParameterisations[prop].positions.blockPosition) {
            this.schedule.configuration.orderParameterisations[prop].positions.blockPosition =
              map2.get(JSON.stringify(this.schedule.configuration.orderParameterisations[prop].positions.blockPosition));
          }
          if (this.schedule.configuration.orderParameterisations[prop].positions.startPosition) {
            this.schedule.configuration.orderParameterisations[prop].positions.startPosition =
              map.get(JSON.stringify(this.schedule.configuration.orderParameterisations[prop].positions.startPosition));
          }
          if (this.schedule.configuration.orderParameterisations[prop].positions.endPositions) {
            this.schedule.configuration.orderParameterisations[prop].positions.endPositions =
              this.schedule.configuration.orderParameterisations[prop].positions.endPositions.map(pos => {
                return map.get(JSON.stringify(pos));
              }).filter(pos => !!pos);
          }
        }
      }
      this.schedule.configuration.orderParameterisations[prop].variableList = this.coreService.clone(this.variableList);
      for (let i = 0; i < this.schedule.configuration.orderParameterisations[prop].variableList.length; i++) {
        this.schedule.configuration.orderParameterisations[prop].variableList[i].isSelected = false;
        for (let j = 0; j < this.schedule.configuration.orderParameterisations[prop].variables.length; j++) {
          if (this.schedule.configuration.orderParameterisations[prop].variableList[i].name === this.schedule.configuration.orderParameterisations[prop].variables[j].name) {
            this.schedule.configuration.orderParameterisations[prop].variableList[i].isSelected = true;
            break;
          }
        }
      }
    }
    this.ref.detectChanges();
  }

  rename(inValid): void {
    if (this.data.id === this.schedule.id && this.data.name !== this.schedule.name) {
      if (!inValid) {
        this.schedule.path = (this.schedule.path1 + (this.schedule.path1 === '/' ? '' : '/') + this.schedule.name);
        if (this.preferences.auditLog) {
          let comments = {
            radio: 'predefined',
            type: 'Schedule',
            operation: 'Rename',
            name: this.data.name
          };
          const modal = this.modal.create({
            nzTitle: undefined,
            nzContent: CommentModalComponent,
            nzClassName: 'lg',
            nzData: {
              comments
            },
            nzFooter: null,
            nzClosable: false,
            nzMaskClosable: false
          });
          modal.afterClose.subscribe(result => {
            if (result) {
              this.renameSchedule(result);
            } else {
              this.schedule.name = this.data.name;
              this.schedule.path = (this.data.path + (this.data.path === '/' ? '' : '/') + this.data.name);
              this.ref.detectChanges();
            }
          });
        } else {
          this.renameSchedule();
        }
      } else {
        this.schedule.name = this.data.name;
        this.schedule.path = (this.data.path + (this.data.path === '/' ? '' : '/') + this.data.name);
        this.ref.detectChanges();
      }
    }
  }

  private renameSchedule(comments: any = {}): void {
    const data = this.coreService.clone(this.data);
    const name = this.schedule.name;
    const obj: any = {
      path: (data.path + (data.path === '/' ? '' : '/') + data.name),
      objectType: this.objectType,
      newPath: name,
      auditLog: {}
    };
    this.coreService.getAuditLogObj(comments, obj.auditLog);
    this.coreService.post('inventory/rename', obj).subscribe({
      next: () => {
        if ((data.path + (data.path === '/' ? '' : '/') + data.name) === (this.data.path + (this.data.path === '/' ? '' : '/') + this.data.name)) {
          this.data.name = name;
        }
        data.name1 = name;
        this.dataService.reloadTree.next({rename: data});
      }, error: () => {
        this.schedule.name = this.data.name;
        this.schedule.path = (this.data.path + (this.data.path === '/' ? '' : '/') + this.data.name);
        this.ref.detectChanges();
      }
    });
  }

  release(): void {
    this.dataService.reloadTree.next({release: this.schedule});
  }

  backToListView(): void {
    this.dataService.reloadTree.next({back: this.schedule});
  }

  /**
   * Function: redo
   *
   * Redoes the last change.
   */
  redo(): void {
    const n = this.history.length;
    if (this.indexOfNextAdd < n) {
      const obj = this.history[this.indexOfNextAdd++];
      this.schedule.configuration = JSON.parse(obj);
      this.saveJSON(true);
    }
  }

  /**
   * Function: undo
   *
   * Undoes the last change.
   */
  undo(): void {
    if (this.indexOfNextAdd > 0) {
      const obj = this.history[--this.indexOfNextAdd];
      this.schedule.configuration = JSON.parse(obj);
      this.saveJSON(true);
    }
  }

  updateEndNode(positions): void {
    positions.endPositions = [...positions.endPositions];
    this.saveJSON();
  }

  getNewPositions(positions): void {
    this.newPositions = positions ? positions.positions : undefined;
    if (positions) {
      this.newPositions = new Map();
      positions.positions.forEach(item => {
        this.newPositions.set(item.positionString, JSON.stringify(item.position));
      })
    }

    this.saveJSON();
  }


  checkVal(isChecked) {
    setTimeout(() => {
      this.saveJSON();
    }, 0);
  }

  saveJSON(flag = false, skip = false, form?, data?): void {
    if (form && form.invalid) {
      data.value = '';
      return;
    }
    if (!this.schedule.configuration.planOrderAutomatically) {
      this.schedule.configuration.submitOrderToControllerWhenPlanned = false;
    }
    if (this.isTrash || !this.permission.joc.inventory.manage) {
      return;
    }
    const obj = this.coreService.clone(this.schedule.configuration);
    let isEmptyExist = false;
    let isValid = true;
    obj.orderParameterisations = obj.orderParameterisations.filter(parameter => {
      if (parameter.orderName === '' || !parameter.orderName) {
        if (isEmptyExist) {
          return false;
        }
        isEmptyExist = true;
      }
      if (parameter.variables) {
        parameter.variables = parameter.variables.filter((variable) => {
          return !!variable.name;
        });
        parameter.variables = parameter.variables.map(variable => ({name: variable.name, value: variable.value}));
        parameter.variables = this.coreService.keyValuePair(parameter.variables);
      }
      if (parameter.forkListVariables) {
        parameter.forkListVariables.forEach((item) => {
          parameter.variables[item.name] = [];
          if (item.actualList) {
            for (const i in item.actualList) {
              const listObj = {};
              item.actualList[i].forEach((data) => {
                if (!data.value && data.value != 0 && data.value != false) {
                  isValid = false;
                } else {
                  listObj[data.name] = data.value;
                }
              });
              if (!isEmpty(listObj)) {
                parameter.variables[item.name].push(listObj);
              }
            }
          }
        });
      }
      if (parameter.positions) {
        if (parameter.positions.blockPosition && this.blockPositions && this.blockPositions.has(parameter.positions.blockPosition)) {
          parameter.positions.blockPosition = JSON.parse(this.blockPositions.get(parameter.positions.blockPosition))
        }
        if (parameter.positions.startPosition && this.positions && this.positions.has(parameter.positions.startPosition)) {
          parameter.positions.startPosition = JSON.parse(this.positions.get(parameter.positions.startPosition))
        }
        if (parameter.positions.endPositions) {
          parameter.positions.endPositions = parameter.positions.endPositions.map((item) => {
            if (this.positions.has(item)) {
              return JSON.parse(this.positions.get(item))
            }
          })
        }
      }
      return true;
    });

    obj.orderParameterisations = obj.orderParameterisations.map(item => {
      return {
        orderName: item.orderName,
        variables: item.variables,
        positions: item.positions,
        forceJobAdmission: item.forceJobAdmission
      };
    });

    if (obj.nonWorkingDayCalendars.length === 0) {
      delete obj.nonWorkingDayCalendars;
    }
    if (skip || (this.schedule.actual && !isEqual(this.schedule.actual, JSON.stringify(obj)))) {
      if (obj.calendars.length > 0) {
        for (let i = 0; i < obj.calendars.length; i++) {
          delete obj.calendars[i].type;
          if (obj.calendars[i].frequencyList) {
            if (obj.calendars[i].frequencyList.length > 0) {
              obj.calendars[i].includes = {};
              obj.calendars[i].frequencyList.forEach((val) => {
                this.calendarService.generateCalendarObj(val, obj.calendars[i]);
              });
            } else {
              delete obj.calendars[i].includes;
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
      if (obj.workflowNames.length === 0 || obj.calendars.length === 0) {
        isValid = false;
      }
      if (isValid) {
        for (const i in this.schedule.configuration.orderParameterisations) {
          for (let j = 0; j < this.schedule.configuration.orderParameterisations[i].length; j++) {
            const argu = this.schedule.configuration.orderParameterisations[i].variables[j];
            if (argu.isRequired) {
              if (!argu.value && argu.value !== false && argu.value !== 0) {
                isValid = false;
                break;
              }
            }
          }
        }
      }
      if (skip || !isEqual(this.schedule.actual, JSON.stringify(obj))) {
        if (!flag) {
          if (this.history.length === 20) {
            this.history.shift();
          }
          this.history.push(JSON.stringify(this.schedule.configuration));
          this.indexOfNextAdd = this.history.length - 1;
        }

        const request: any = {
          configuration: obj,
          valid: isValid,
          path: this.schedule.path,
          objectType: this.objectType
        };

        if (sessionStorage['$SOS$FORCELOGING'] === 'true') {
          this.translate.get('auditLog.message.defaultAuditLog').subscribe(translatedValue => {
            request.auditLog = {comment: translatedValue};
          });
        }
        this.coreService.post('inventory/store', request).subscribe({
          next: (res: any) => {
            if (res.path === this.schedule.path) {
              this.lastModified = res.configurationDate;
              this.schedule.actual = JSON.stringify(obj);
              this.schedule.valid = res.valid;
              this.data.valid = res.valid;
              this.schedule.released = false;
              this.data.released = false;
              this.setErrorMessage(res);
            }
          }, error: () => {
            this.ref.detectChanges();
          }
        });
      }
    }
  }

  private removeSelection(name): void {
    this.schedule.configuration.workflowNames.splice(this.schedule.configuration.workflowNames.indexOf(name), 1);
    this.schedule.configuration.workflowNames = [...this.schedule.configuration.workflowNames];
    this.ref.detectChanges();
  }

  private getWorkflowInfo(name, flag = false, cb): void {
    this.coreService.post('inventory/read/configuration', {
      path: name,
      withPositions: true,
      objectType: InventoryObject.WORKFLOW
    }).subscribe((conf: any) => {
      if (this.schedule.configuration && this.schedule.configuration.workflowNames.length > 1) {
        this.ref.detectChanges();
        let msg;
        if (conf.configuration.orderPreparation) {
          msg = 'inventory.message.workflowsWithoutVariables';
        } else if (this.workflow.orderPreparation) {
          msg = 'inventory.message.workflowWithVariables';
        }
        if (msg) {
          this.removeSelection(name);
          this.translate.get(msg).subscribe(translatedValue => {
            this.toasterService.warning(translatedValue);
          });
          return;
        }
      } else {
        this.workflow = conf.configuration;
        if (flag && this.schedule.configuration) {
          this.schedule.configuration.orderParameterisations = [];
        }
        this.getPositions(conf.path, () => {
          this.updateVariableList();
          this.saveJSON();
        });
      }
      if (cb) {
        cb();
      }
    });
  }

  private getPositions(path, cb): void {
    this.coreService.post('inventory/read/order/positions', {
      workflowPath: path
    }).subscribe({
      next: (res) => {
        this.positions = new Map();
        res.positions.forEach((item) => {
          this.positions.set(item.positionString, JSON.stringify(item.position));
        });
        this.blockPositions = new Map();
        this.blockPositionList = new Map();
        res.blockPositions.forEach((item) => {
          item.positionString = item.positionString.substring(0, item.positionString.lastIndexOf('/'));
          this.blockPositions.set(item.positionString, JSON.stringify(item.position));
          this.blockPositionList.set(JSON.stringify(item.position), JSON.stringify(item));
        });
        cb();
      }, error: () => {
        cb();
      }
    });
  }

  private getWorkflowTree(): void {
    this.coreService.post('tree', {
      controllerId: this.schedulerId,
      forInventory: true,
      types: ['WORKFLOW']
    }).subscribe((res) => {
      this.workflowTree = this.coreService.prepareTree(res, true);
      this.ref.detectChanges();
    });
  }

  private getObject(): void {
    if (this.workflowTree.length === 0) {
      this.getWorkflowTree();
    }
    const URL = this.isTrash ? 'inventory/trash/read/configuration' : 'inventory/read/configuration';
    this.coreService.post(URL, {
      path: (this.data.path + (this.data.path === '/' ? '' : '/') + this.data.name),
      objectType: this.objectType,
    }).subscribe((res: any) => {
      this.lastModified = res.configurationDate;
      this.history = [];
      this.indexOfNextAdd = 0;
      this.workflow = {};
      this.getDocumentations();
      if (res.configuration) {
        delete res.configuration.TYPE;
        delete res.configuration.path;
        delete res.configuration.version;
        delete res.configuration.versionId;
      } else {
        res.configuration = {};
      }
      if (this.data.released !== res.released) {
        this.data.released = res.released;
      }
      if (this.data.valid !== res.valid) {
        this.data.valid = res.valid;
      }
      this.schedule = this.coreService.clone(res);
      if (!this.schedule.configuration.orderParameterisations) {
        this.schedule.configuration.orderParameterisations = [];
      }
      if (this.schedule.configuration.workflowName) {
        if (!this.schedule.configuration.workflowNames) {
          this.schedule.configuration.workflowNames = [this.schedule.configuration.workflowName];
        }
        delete this.schedule.configuration.workflowName
      }
      if (!this.schedule.configuration.workflowNames) {
        this.schedule.configuration.workflowNames = [];
      }
      this.schedule.actual = JSON.stringify(this.schedule.configuration);
      this.schedule.path1 = this.data.path;
      this.schedule.name = this.data.name;
      if (!this.schedule.configuration.calendars) {
        this.schedule.configuration.calendars = [];
      } else {
        for (let i = 0; i < this.schedule.configuration.calendars.length; i++) {
          this.calendarService.convertObjToArr(this.schedule.configuration.calendars[i], this.dateFormat);
        }
      }
      if (!this.schedule.configuration.nonWorkingDayCalendars) {
        this.schedule.configuration.nonWorkingDayCalendars = [];
      }
      if (this.schedule.configuration.workflowNames.length > 0) {
        this.schedule.configuration.workflowNames.forEach((workflow) => {
          this.getWorkflowInfo(workflow, false, () => {
            this.checkValidation(res)
          });
        });
      } else {
        this.checkValidation(res);
      }

      if (this.schedule.configuration.orderParameterisations) {
        this.schedule.configuration.orderParameterisations.forEach((item) => {
          item.variables = this.coreService.convertObjectToArray(item, 'variables');
          if (!item.positions) {
            item.positions = {};
          }
        });
      }
      this.history.push(JSON.stringify(this.schedule.configuration));

    });
  }

  changeWorkflow(data): void {
    if (this.schedule.configuration.workflowNames.length === 0) {
      this.schedule.configuration.orderParameterisations = [];
      this.variableList = [];
      this.forkListVariables = [];
      this.saveJSON();
    }
    if (data.add) {
      this.getWorkflowInfo(data.add, false, () => {
        if (this.schedule.configuration.workflowNames.length > 1) {
          this.saveJSON();
        }
      });
    } else if (this.schedule.configuration.workflowNames.length > 0) {
      this.saveJSON();
    }
  }

  private checkValidation(res) {
    if (!res.valid) {
      if (this.schedule.configuration.workflowNames && this.schedule.configuration.workflowNames.length > 0 && this.schedule.configuration.calendars.length > 0) {
        this.validateJSON(res.configuration);
      } else {
        this.setErrorMessage(res);
      }
    }
  }

  private validateJSON(json): void {
    const obj = clone(json);
    obj.path = this.data.path;
    this.coreService.post('inventory/' + this.objectType + '/validate', obj).subscribe({
      next: (res: any) => {
        this.schedule.valid = res.valid;
        if (this.schedule.path === this.data.path) {
          if (this.data.valid !== res.valid) {
            this.saveJSON(true, true);
          }
          this.data.valid = res.valid;
        }
        this.setErrorMessage(res);
      }
    });
  }

  private setErrorMessage(res): void {
    this.invalidMsg = '';
    if (res.invalidMsg) {
      if (res.invalidMsg.match('workflowName')) {
        this.invalidMsg = 'inventory.message.workflowIsMissing';
      } else if (res.invalidMsg.match('periods')) {
        this.invalidMsg = 'inventory.message.startTimeIsMissing';
      } else if (res.invalidMsg.match('calendars')) {
        this.invalidMsg = 'inventory.message.calendarIsMissing';
      }
      if (!this.invalidMsg) {
        this.invalidMsg = res.invalidMsg;
      }
    }
    this.ref.detectChanges();
  }
}
