import {Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import * as _ from 'underscore';
import {CoreService} from '../../../../services/core.service';
import {DataService} from '../../../../services/data.service';
import {CalendarService} from '../../../../services/calendar.service';

@Component({
  selector: 'app-schedule',
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
  objectType = 'SCHEDULE';
  workflowTree = [];
  invalidMsg: string;
  workflow: any = {};
  variableList = [];

  @ViewChild('treeSelectCtrl', {static: false}) treeSelectCtrl;

  constructor(private coreService: CoreService,
              private calendarService: CalendarService, private dataService: DataService) {
  }

  ngOnInit(): void {
    this.dateFormat = this.coreService.getDateFormat(this.preferences.dateFormat);
  }

  ngOnChanges(changes: SimpleChanges): void {
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
          });
        }
      } else {
        this.schedule = {};
      }
    }
  }

  ngOnDestroy(): void {
    if (this.schedule.name) {
      this.saveJSON();
    }
  }

  openRuntimeEditor(): void {
    this.isVisible = true;
  }

  closeCalendarView(): void {
    this.isVisible = false;
    setTimeout(() => {
      this.saveJSON();
    }, 10);
  }

  addVariable(): void {
    let param = {
      name: '',
      value: ''
    };
    if (this.schedule.configuration.variables) {
      if (!this.coreService.isLastEntryEmpty(this.schedule.configuration.variables, 'name', '')) {
        this.schedule.configuration.variables.push(param);
      }
    }
    this.saveJSON();
  }

  removeVariable(index): void {
    this.schedule.configuration.variables.splice(index, 1);
    this.updateSelectItems();
    this.saveJSON();
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
    this.coreService.post('inventory/read/folder', obj).subscribe((res: any) => {
      let data;
      if (type === 'WORKFLOW') {
        data = res.workflows;
      } else {
        data = res.calendars;
      }
      for (let i = 0; i < data.length; i++) {
        const _path = node.key + (node.key === '/' ? '' : '/') + data[i].name;
        data[i].title = data[i].name;
        data[i].path = _path;
        data[i].key = data[i].name;
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
      if (type === 'WORKFLOW') {
        this.workflowTree = [...this.workflowTree];
      }
    });
  }

  onExpand(e, type): void {
    this.loadData(e.node, type, null);
  }

  private getWorkflowInfo(name): void {
    this.coreService.post('inventory/read/configuration', {
      path: name,
      objectType: 'WORKFLOW'
    }).subscribe((conf: any) => {
      this.workflow = conf.configuration;
      this.updateVariableList();
    });
  }

  navToWorkflow(): void {
    this.dataService.reloadTree.next({navigate: {name: this.schedule.configuration.workflowName, type: 'WORKFLOW'}});
  }

  updateVariableList(): void {
    this.variableList = [];
    if (this.workflow.orderRequirements && this.workflow.orderRequirements.parameters && !_.isEmpty(this.workflow.orderRequirements.parameters)) {
      this.variableList = Object.entries(this.workflow.orderRequirements.parameters).map(([k, v]) => {
        const val: any = v;
        let isExist = false;
        for (let i = 0; i < this.schedule.configuration.variables.length; i++) {
          if (this.schedule.configuration.variables[i].name === k) {
            this.schedule.configuration.variables[i].type = val.type;
            if (!val.default && val.default !== false && val.default !== 0 && !isExist) {
              this.schedule.configuration.variables[i].isRequired = true;
            }
            isExist = true;
            break;
          }
        }
        if (!val.default && val.default !== false && val.default !== 0 && !isExist) {
          this.schedule.configuration.variables.push({name: k, type: val.type, isRequired: true});
        }
        return {name: k, value: v};
      });
    } else {
      this.schedule.configuration.variables = [];
    }
    this.updateSelectItems();
  }

  checkVariableType(argument): void {
    let obj = this.workflow.orderRequirements.parameters[argument.name];
    if (obj) {
      argument.type = obj.type;
      if (!obj.default && obj.default !== false && obj.default !== 0) {
        argument.isRequired = true;
      }
    }
    this.updateSelectItems();
  }

  updateSelectItems(): void {
    if (this.schedule.configuration.variables.length > 0) {
      for (let i = 0; i < this.variableList.length; i++) {
        this.variableList[i].isSelected = false;
        for (let j = 0; j < this.schedule.configuration.variables.length; j++) {
          if (this.variableList[i].name === this.schedule.configuration.variables[j].name) {
            this.variableList[i].isSelected = true;
            break;
          }
        }
      }
    }
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
        });
      } else {
        this.schedule.name = this.data.name;
      }
    }
  }

  release(): void {
    this.dataService.reloadTree.next({release: this.schedule});
  }

  backToListView(): void {
    this.dataService.reloadTree.next({back: this.schedule});
  }

  private convertObjToArr(calendar): void {
    let obj: any = {};
    if (!calendar.frequencyList) {
      calendar.frequencyList = [];
    }
    if (calendar.includes && !_.isEmpty(calendar.includes)) {
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
              obj.str = this.calendarService.freqToStr(obj, this.dateFormat)
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
            obj.str = this.calendarService.freqToStr(obj, this.dateFormat)
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
      if (res.configuration) {
        delete res.configuration['TYPE'];
        delete res.configuration['path'];
        delete res.configuration['versionId'];
      } else {
        res.configuration = {};
      }

      this.schedule = this.coreService.clone(res);
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
      if (this.schedule.configuration.variables) {
        this.schedule.configuration.variables = this.coreService.convertObjectToArray(this.schedule.configuration, 'variables');
      } else {
        this.schedule.configuration.variables = [];
      }
      this.schedule.actual = JSON.stringify(this.schedule.configuration);
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
    });
  }

  private validateJSON(json): void {
    const obj = _.clone(json);
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
  }

  saveJSON(): void {
    if (this.isTrash) {
      return;
    }
    let obj = this.coreService.clone(this.schedule.configuration);
    obj.variables = obj.variables.map(variable => ({name: variable.name, value: variable.value}));
    if (!_.isEqual(this.schedule.actual, JSON.stringify(obj))) {
      // this.schedule.configuration.controllerId = this.schedulerId;
      if (obj.variables && _.isArray(obj.variables)) {
        this.coreService.convertArrayToObject(obj, 'variables', true);
      }
      if (obj.calendars.length > 0) {
        for (let i = 0; i < obj.calendars.length; i++) {
          if (obj.calendars[i].frequencyList) {
            if (obj.calendars[i].frequencyList.length > 0) {
              obj.calendars[i].includes = {};
              obj.calendars[i].frequencyList.forEach((val) => {
                this.calendarService.generateCalendarObj(val, obj.calendars[i]);
              });
            }
            delete obj.calendars[i]['frequencyList'];
          }
        }
      }
      let isValid = false;
      if (obj.workflowName && obj.calendars.length > 0) {
        isValid = true;
      }
      for (let i = 0; i < this.schedule.configuration.variables.length; i++) {
        const argu = this.schedule.configuration.variables[i];
        if (argu.isRequired) {
          if (!argu.value && argu.value !== false && argu.value !== 0) {
            isValid = false;
            break;
          }
        }
      }

      this.coreService.post('inventory/store', {
        configuration: obj,
        valid: isValid,
        id: this.schedule.id,
        objectType: this.objectType
      }).subscribe((res: any) => {
        if (res.id === this.data.id && this.schedule.id === this.data.id) {
          this.schedule.actual = JSON.stringify(this.schedule.configuration);
          this.schedule.valid = res.valid;
          this.data.valid = res.valid;
          this.schedule.released = false;
          this.data.released = false;
          this.setErrorMessage(res);
        }
      }, (err) => {
        console.log(err);
      });
    }
  }
}
