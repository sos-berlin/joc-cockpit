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
    if (changes.copyObj && !changes.data){
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

  addVariableSet(): void {
    const variableSet: any = {
      orderName: '',
      variables: []
    };
    if (this.schedule.configuration.variableSets) {
      if (!this.coreService.isLastEntryEmpty(this.schedule.configuration.variableSets, 'orderName', '') || this.schedule.configuration.variableSets.length < 2) {
        this.schedule.configuration.variableSets.push(variableSet);
        this.addVariable(false, variableSet);
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

  removeVariableSet(index): void{
    this.schedule.configuration.variableSets.splice(index, 1);
  }

  removeVariable(index, variableSet): void {
    variableSet.variables.splice(index, 1);
    this.updateSelectItems();
    this.saveJSON();
  }

  onKeyPress($event, variableSet): void {
    if ($event.which === '13' || $event.which === 13) {
      this.addVariable(false, variableSet);
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
          this.getWorkflowInfo(this.schedule.configuration.workflowName);
        }
      }
      setTimeout(() => {
        this.saveJSON();
      }, 10);
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

  updateVariableList(): void {
    this.variableList = [];
    if (this.workflow.orderPreparation && this.workflow.orderPreparation.parameters && !isEmpty(this.workflow.orderPreparation.parameters)) {
      this.variableList = Object.entries(this.workflow.orderPreparation.parameters).map(([k, v]) => {
        const val: any = v;
        if (this.schedule.configuration.variableSets.length === 0){
          if (!val.default && val.default !== false && val.default !== 0) {
            if (!val.final) {
              this.schedule.configuration.variableSets.push({orderName: '', variables : []});
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
        return {name: k, value: v};
      });
      if (this.workflow.orderPreparation.allowUndeclared) {
        for (const prop in this.schedule.configuration.variableSets) {
          for (let i = 0; i < this.schedule.configuration.variableSets[prop].length; i++) {
            if (!this.schedule.configuration.variableSets[prop][i].type) {
              this.schedule.configuration.variableSets[prop][i].isTextField = true;
            }
          }
        }
      }
      this.variableList = this.variableList.filter((item) => {
        return !item.value.final;
      });
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
      } else{
        this.coreService.removeSlashToString(obj, 'default');
        argument.value = obj.default;
      }
    }
    this.updateSelectItems();
  }

  updateSelectItems(): void {
    for (let i = 0; i < this.variableList.length; i++) {
      this.variableList[i].isSelected = false;
      for (const prop in this.schedule.configuration.variableSets) {
        for (let j = 0; j < this.schedule.configuration.variableSets[prop].length; j++) {
          if (this.variableList[i].name === this.schedule.configuration.variableSets[prop].variables[j].name) {
            this.variableList[i].isSelected = true;
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

  saveJSON(flag = false): void {
    if (this.isTrash || !this.permission.joc.inventory.manage) {
      return;
    }
    const obj = this.coreService.clone(this.schedule.configuration);
    obj.variableSets.filter(variableSet => {
      if (variableSet.variables) {
        variableSet.variables = variableSet.variables.map(variable => ({name: variable.name, value: variable.value}));
      }
    });

    obj.variableSets = obj.variableSets.map(variableSet => ({orderName: variableSet.orderName, variables: variableSet.variables}));
    if (this.schedule.actual && !isEqual(this.schedule.actual, JSON.stringify(obj))) {
      obj.variableSets.filter(variableSet => {
        this.coreService.convertArrayToObject(variableSet, 'variables', true);
      });
      console.log(obj.variableSets, ' Before store.......obj.variableSets>>>>')
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
      if (obj.nonWorkingCalendars.length > 0) {
        for (let i = 0; i < obj.nonWorkingCalendars.length; i++) {
          delete obj.nonWorkingCalendars[i].type;
        }
      }
      let isValid = false;
      if (obj.workflowName && obj.calendars.length > 0) {
        isValid = true;
      }
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
      if (this.schedule.actual && !isEqual(this.schedule.actual, JSON.stringify(obj))) {
        if (!flag) {
          if (this.history.length === 20) {
            this.history.shift();
          }
          this.history.push(JSON.stringify(this.schedule.configuration));
          this.indexOfNextAdd = this.history.length - 1;
        }
        this.coreService.post('inventory/store', {
          configuration: obj,
          valid: isValid,
          id: this.schedule.id,
          objectType: this.objectType
        }).subscribe((res: any) => {
          if (res.id === this.data.id && this.schedule.id === this.data.id) {
            this.schedule.actual = JSON.stringify(obj);
            this.schedule.valid = res.valid;
            this.data.valid = res.valid;
            this.schedule.released = false;
            this.data.released = false;
            this.setErrorMessage(res);
          }
        }, (err) => {
          this.ref.detectChanges();
        });
      }
    }
  }

  private getWorkflowInfo(name): void {
    this.coreService.post('inventory/read/configuration', {
      path: name,
      objectType: InventoryObject.WORKFLOW
    }).subscribe((conf: any) => {
      this.workflow = conf.configuration;
      this.updateVariableList();
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
      if (this.data.released !== res.released){
        this.data.released = res.released;
      }
      if (this.data.valid !== res.valid){
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
      if (!this.schedule.configuration.nonWorkingCalendars) {
        this.schedule.configuration.nonWorkingCalendars = [];
      }
      if (this.schedule.configuration.workflowName) {
        this.getWorkflowInfo(this.schedule.configuration.workflowName);
      }
      if (this.schedule.configuration.variableSets) {
        this.schedule.configuration.variableSets.forEach((variableSet) => {
          console.log(variableSet);
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
