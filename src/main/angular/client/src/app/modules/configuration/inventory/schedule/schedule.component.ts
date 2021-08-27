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
import {isEmpty, isArray, isEqual, clone, sortBy} from 'underscore';
import {Subscription} from 'rxjs';
import {CoreService} from '../../../../services/core.service';
import {DataService} from '../../../../services/data.service';
import {CalendarService} from '../../../../services/calendar.service';
import {InventoryObject} from '../../../../models/enums';

@Component({
  selector: 'app-schedule',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './schedule.component.html',
})
export class ScheduleComponent implements OnInit, OnDestroy, OnChanges {
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
  subscription1: Subscription;
  subscription2: Subscription;

  constructor(private coreService: CoreService,
              private calendarService: CalendarService, private dataService: DataService,
              private ref: ChangeDetectorRef) {
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
  }

  ngOnInit(): void {
    this.dateFormat = this.coreService.getDateFormat(this.preferences.dateFormat);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.copyObj && !changes.data) {
      return;
    }
    if (changes.reload) {
      if (this.reload) {
        this.getObject();
        this.reload = false;
        return;
      }
    }
    if (this.schedule.actual) {
      this.saveJSON();
    }
    if (changes.data) {
      if (this.data.type) {
        this.getObject();
        if (this.workflowTree.length === 0) {
          this.coreService.post('tree', {
            controllerId: this.schedulerId,
            forInventory: true,
            types: ['WORKFLOW']
          }).subscribe((res) => {
            this.workflowTree = this.coreService.prepareTree(res, true);
            this.ref.detectChanges();
          });
        }
      } else {
        this.schedule = {};
        this.ref.detectChanges();
      }
    }
  }

  ngOnDestroy(): void {
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
    if (this.schedule.name) {
      this.saveJSON();
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
    const variableSet: any = {
      orderName: '',
      variables: [],
      forkListVariables: this.coreService.clone(this.forkListVariables)
    };
    if (this.schedule.configuration.variableSets) {
      if (!this.coreService.isLastEntryEmpty(this.schedule.configuration.variableSets, 'orderName', '') || this.schedule.configuration.variableSets.length < 2) {
        this.schedule.configuration.variableSets.push(variableSet);
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
    this.schedule.configuration.variableSets.splice(index, 1);
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
    if (this.documentationTree.length === 0) {
      this.coreService.post('tree', {
        onlyWithAssignReference: true,
        types: ['DOCUMENTATION']
      }).subscribe((res) => {
        this.documentationTree = this.coreService.prepareTree(res, true);
      });
    }
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
        if (this.schedule.configuration.documentationName1) {
          if (this.schedule.configuration.documentationName !== this.schedule.configuration.documentationName1) {
            this.schedule.configuration.documentationName = this.schedule.configuration.documentationName1;
          }
        } else if (node.key && !node.key.match('/')) {
          if (this.schedule.configuration.documentationName !== node.key) {
            this.schedule.configuration.documentationName = node.key;
          }
        }
      } else {
        if (this.schedule.configuration.workflowName1) {
          if (this.schedule.configuration.workflowName !== this.schedule.configuration.workflowName1) {
            this.schedule.configuration.workflowName = this.schedule.configuration.workflowName1;
          }
        } else if (node.key && !node.key.match('/')) {
          if (this.schedule.configuration.workflowName !== node.key) {
            this.schedule.configuration.workflowName = node.key;
          }
        }
        if (this.schedule.configuration.workflowName) {
          this.getWorkflowInfo(this.schedule.configuration.workflowName, true);
        }
      }
    }
  }

  updateList(node, type): void {
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
      if (type === 'WORKFLOW') {
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
      }
      this.ref.detectChanges();
    });
  }

  onExpand(e, type): void {
    this.loadData(e.node, type, null);
  }

  navToWorkflow(): void {
    this.dataService.reloadTree.next({navigate: {name: this.schedule.configuration.workflowName, type: InventoryObject.WORKFLOW}});
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
            if (this.schedule.configuration.variableSets.length === 0) {
              this.schedule.configuration.variableSets.push(
                {
                  orderName: '',
                  variables: [],
                  forkListVariables: this.coreService.clone(this.forkListVariables)
                });
            }
          }
        } else {
          if (this.schedule.configuration.variableSets.length === 0) {
            if (!val.default && val.default !== false && val.default !== 0) {
              if (!val.final) {
                this.schedule.configuration.variableSets.push({orderName: '', variables: []});
              }
            }
          }
          for (const prop in this.schedule.configuration.variableSets) {
            let isExist = false;
            for (let i = 0; i < this.schedule.configuration.variableSets[prop].variables.length; i++) {
              if (this.schedule.configuration.variableSets[prop].variables[i].name === k) {
                this.schedule.configuration.variableSets[prop].variables[i].type = val.type;
                if (!val.default && val.default !== false && val.default !== 0 && !isExist) {
                  this.schedule.configuration.variableSets[prop].variables[i].isRequired = true;
                }
                isExist = true;
                break;
              }
            }
            if (!val.default && val.default !== false && val.default !== 0 && !isExist) {
              if (!val.final) {
                this.schedule.configuration.variableSets[prop].variables.push({name: k, type: val.type, isRequired: true});
              }
            }
          }
        }
        return {name: k, value: v};
      });
/*      if (this.workflow.orderPreparation.allowUndeclared) {
        for (const prop in this.schedule.configuration.variableSets) {
          for (let i = 0; i < this.schedule.configuration.variableSets[prop].length; i++) {
            if (!this.schedule.configuration.variableSets[prop][i].type) {
              this.schedule.configuration.variableSets[prop][i].isTextField = true;
            }
          }
        }
      }*/
      this.variableList = this.variableList.filter((item) => {
        if (item.value.type === 'List') {
          return false;
        }
        return !item.value.final;
      });


      for (const prop in this.schedule.configuration.variableSets) {
        this.schedule.configuration.variableSets[prop].forkListVariables = this.coreService.clone(this.forkListVariables);
        if (this.schedule.configuration.variableSets[prop].variables && this.schedule.configuration.variableSets[prop].variables.length > 0) {
          this.schedule.configuration.variableSets[prop].variables = this.schedule.configuration.variableSets[prop].variables.filter(item => {
            if (isArray(item.value)) {
              this.setForkListVariables(item, this.schedule.configuration.variableSets[prop].forkListVariables);
              return false;
            } else {
              return true;
            }
          });
        }
      }
    } else {
      this.schedule.configuration.variableSets = [];
    }
    this.updateSelectItems();
  }

  checkVariableType(argument): void {
    let obj = this.workflow.orderPreparation.parameters[argument.name];
    if (obj) {
      argument.type = obj.type;
      if (!obj.default && obj.default !== false && obj.default !== 0) {
        argument.isRequired = true;
      } else {
        this.coreService.removeSlashToString(obj, 'default');
        if (obj.type === 'Boolean') {
          argument.value = (obj.default === true || obj.default === 'true');
        } else {
          argument.value = obj.default;
        }
      }
    }
    this.updateSelectItems();
  }

  updateSelectItems(): void {
    for (const prop in this.schedule.configuration.variableSets) {
      this.schedule.configuration.variableSets[prop].variableList = this.coreService.clone(this.variableList);
      for (let i = 0; i < this.schedule.configuration.variableSets[prop].variableList.length; i++) {
        this.schedule.configuration.variableSets[prop].variableList[i].isSelected = false;
        for (let j = 0; j < this.schedule.configuration.variableSets[prop].variables.length; j++) {
          if (this.schedule.configuration.variableSets[prop].variableList[i].name === this.schedule.configuration.variableSets[prop].variables[j].name) {
            this.schedule.configuration.variableSets[prop].variableList[i].isSelected = true;
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
        const data = this.coreService.clone(this.data);
        const name = this.schedule.name;
        this.coreService.post('inventory/rename', {
          id: data.id,
          newPath: name
        }).subscribe((res) => {
          if (data.id === this.data.id) {
            this.data.name = name;
          }
          data.name = name;
          this.dataService.reloadTree.next({rename: data});
        }, (err) => {
          this.schedule.name = this.data.name;
          this.ref.detectChanges();
        });
      } else {
        this.schedule.name = this.data.name;
        this.ref.detectChanges();
      }
    }
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

  saveJSON(flag = false, skip = false): void {
    if (this.isTrash || !this.permission.joc.inventory.manage) {
      return;
    }
    const obj = this.coreService.clone(this.schedule.configuration);
    let isEmptyExist = false;
    let isValid = true;
    obj.variableSets = obj.variableSets.filter(variableSet => {
      if (variableSet.orderName === '' || !variableSet.orderName) {
        if (isEmptyExist) {
          return false;
        }
        isEmptyExist = true;
      }
      if (variableSet.variables) {
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
                if (!data.value) {
                  isValid = false;
                } else {
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
            }
            delete obj.calendars[i].frequencyList;
          }
        }
      }
      if (obj.nonWorkingDayCalendars.length > 0) {
        for (let i = 0; i < obj.nonWorkingDayCalendars.length; i++) {
          delete obj.nonWorkingDayCalendars[i].type;
        }
      }
      if (!(obj.workflowName && obj.calendars.length > 0)) {
        isValid = false;
      }
      if (isValid) {
        for (const i in this.schedule.configuration.variableSets) {
          for (let j = 0; j < this.schedule.configuration.variableSets[i].length; j++) {
            const argu = this.schedule.configuration.variableSets[i].variables[j];
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
        delete obj.workflowName1;

        if (obj.nonWorkingDayCalendars.length === 0) {
          delete obj.nonWorkingDayCalendars;
        }
        this.coreService.post('inventory/store', {
          configuration: obj,
          valid: isValid,
          id: this.schedule.id,
          objectType: this.objectType
        }).subscribe((res: any) => {
          if (res.id === this.data.id && this.schedule.id === this.data.id) {
            obj.nonWorkingDayCalendars = [];
            this.schedule.actual = JSON.stringify(obj);
            this.schedule.valid = res.valid;
            this.data.valid = res.valid;
            this.schedule.released = false;
            this.data.released = false;
            this.setErrorMessage(res);
          }
        }, () => {
          this.ref.detectChanges();
        });
      }
    }
  }

  private getWorkflowInfo(name, flag = false): void {
    this.coreService.post('inventory/read/configuration', {
      path: name,
      objectType: InventoryObject.WORKFLOW
    }).subscribe((conf: any) => {
      this.workflow = conf.configuration;
      if (flag) {
        this.schedule.configuration.variableSets = [];
      }
      this.updateVariableList();
      this.saveJSON();
    });
  }

  private convertObjToArr(calendar): void {
    let obj: any = {};
    if (!calendar.frequencyList) {
      calendar.frequencyList = [];
    }
    if (calendar.includes && !isEmpty(calendar.includes)) {
      if (calendar.includes.weekdays && calendar.includes.weekdays.length > 0) {
        calendar.includes.weekdays.forEach(weekday => {
          obj = {
            tab: 'weekDays',
            type: 'INCLUDE',
            days: [],
            startingWithW: weekday.from,
            endOnW: weekday.to,
            all: weekday.days.length == 7
          };
          weekday.days.forEach(day => {
            obj.days.push(day.toString());
          });
          obj.str = this.calendarService.freqToStr(obj, this.dateFormat);
          calendar.frequencyList.push(obj);
        });
      }
      if (calendar.includes.monthdays && calendar.includes.monthdays.length > 0) {
        calendar.includes.monthdays.forEach(monthday => {
          if (monthday.weeklyDays && monthday.weeklyDays.length > 0) {
            monthday.weeklyDays.forEach(day => {
              obj = {
                type: 'INCLUDE',
                tab: 'specificWeekDays',
                specificWeekDay: this.calendarService.getStringDay(day.day),
                which: day.weekOfMonth.toString(),
                startingWithS: monthday.from,
                endOnS: monthday.to
              };
              obj.str = this.calendarService.freqToStr(obj, this.dateFormat);
              calendar.frequencyList.push(obj);
            });
          } else {
            obj = {
              type: 'INCLUDE',
              tab: 'monthDays',
              selectedMonths: [],
              isUltimos: 'months',
              startingWithM: monthday.from,
              endOnM: monthday.to
            };
            monthday.days.forEach(day => {
              obj.selectedMonths.push(day.toString());
            });
            obj.str = this.calendarService.freqToStr(obj, this.dateFormat);
            calendar.frequencyList.push(obj);
          }
        });
      }
      if (calendar.includes.ultimos && calendar.includes.ultimos.length > 0) {
        calendar.includes.ultimos.forEach(ultimos => {
          if (ultimos.weeklyDays && ultimos.weeklyDays.length > 0) {
            ultimos.weeklyDays.forEach(day => {
              obj = {
                type: 'INCLUDE',
                tab: 'specificWeekDays',
                specificWeekDay: this.calendarService.getStringDay(day.day),
                which: -day.weekOfMonth,
                startingWithS: ultimos.from,
                endOnS: ultimos.to
              };
              obj.str = this.calendarService.freqToStr(obj, this.dateFormat);
              calendar.frequencyList.push(obj);
            });
          } else {
            obj = {
              type: 'INCLUDE',
              tab: 'monthDays',
              selectedMonthsU: [],
              isUltimos: 'ultimos',
              startingWithM: ultimos.from,
              endOnM: ultimos.to
            };
            ultimos.days.forEach(day => {
              obj.selectedMonthsU.push(day.toString());
            });
            obj.str = this.calendarService.freqToStr(obj, this.dateFormat);
            calendar.frequencyList.push(obj);
          }

        });
      }
      if (calendar.includes.repetitions && calendar.includes.repetitions.length > 0) {
        calendar.includes.repetitions.forEach(value => {
          obj = {
            tab: 'every',
            type: 'INCLUDE',
            dateEntity: value.repetition,
            interval: value.step,
            startingWith: value.from,
            endOn: value.to
          };
          obj.str = this.calendarService.freqToStr(obj, this.dateFormat);
          calendar.frequencyList.push(obj);
        });
      }
      if (calendar.includes.dates && calendar.includes.dates.length > 0) {
        obj = {
          tab: 'specificDays',
          type: 'INCLUDE',
          dates: calendar.includes.dates
        };
        obj.str = this.calendarService.freqToStr(obj, this.dateFormat);
        calendar.frequencyList.push(obj);
      }
    }
  }

  private getObject(): void {
    const URL = this.isTrash ? 'inventory/trash/read/configuration' : 'inventory/read/configuration';
    this.coreService.post(URL, {
      id: this.data.id
    }).subscribe((res: any) => {
      this.history = [];
      this.indexOfNextAdd = 0;
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
      this.schedule.actual = JSON.stringify(this.schedule.configuration);
      this.schedule.path1 = this.data.path;
      this.schedule.name = this.data.name;
      if (!this.schedule.configuration.calendars) {
        this.schedule.configuration.calendars = [];
      } else {
        for (let i = 0; i < this.schedule.configuration.calendars.length; i++) {
          this.convertObjToArr(this.schedule.configuration.calendars[i]);
        }
      }
      if (!this.schedule.configuration.nonWorkingDayCalendars) {
        this.schedule.configuration.nonWorkingDayCalendars = [];
      }
      if (this.schedule.configuration.workflowName) {
        this.getWorkflowInfo(this.schedule.configuration.workflowName);
      }
      if (this.schedule.configuration.variableSets) {
        this.schedule.configuration.variableSets.forEach((variableSet) => {
          variableSet.variables = this.coreService.convertObjectToArray(variableSet, 'variables');
        });

      } else {
        this.schedule.configuration.variableSets = [];
      }
      this.history.push(this.schedule.actual);
      if (!res.valid) {
        if (!this.schedule.configuration.workflowName) {
          this.invalidMsg = 'inventory.message.workflowIsMissing';
        } else if (this.schedule.configuration.calendars.length === 0) {
          this.invalidMsg = 'inventory.message.calendarIsMissing';
        } else {
          this.validateJSON(res.configuration);
        }
      } else {
        this.invalidMsg = '';
      }
      this.ref.detectChanges();
    });
  }

  private validateJSON(json): void {
    const obj = clone(json);
    obj.path = this.data.path;
    this.coreService.post('inventory/' + this.objectType + '/validate', obj).subscribe((res: any) => {
      this.schedule.valid = res.valid;
      if (this.schedule.id === this.data.id) {
        if (this.data.valid !== res.valid) {
          this.saveJSON(true, true);
        }
        this.data.valid = res.valid;
      }
      this.setErrorMessage(res);
    }, () => {
    });
  }

  private setErrorMessage(res): void {
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
    } else {
      this.invalidMsg = '';
    }
    this.ref.detectChanges();
  }
}
