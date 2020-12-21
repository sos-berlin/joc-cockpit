import {Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'underscore';
import {CoreService} from '../../../../services/core.service';
import {DataService} from '../../../../services/data.service';
import {CalendarService} from '../../../../services/calendar.service';

declare const $;

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

  schedule: any = {};
  workingDayCalendar: any;
  nonWorkingDayCalendar: any;
  isVisible: boolean;
  dateFormat: any;
  isUnique = true;
  objectType = 'SCHEDULE';
  workflowTree = [];
  invalidMsg: string;

  @ViewChild('treeSelectCtrl', {static: false}) treeSelectCtrl;

  constructor(private modalService: NgbModal, private coreService: CoreService,
              private calendarService: CalendarService, private dataService: DataService) {
  }

  ngOnInit() {
    this.dateFormat = this.coreService.getDateFormat(this.preferences.dateFormat);
  }

  ngOnChanges(changes: SimpleChanges): void {
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

  ngOnDestroy() {
    if (this.schedule.name) {
      this.saveJSON();
    }
  }

  openRuntimeEditor() {
    this.isVisible = true;
  }

  closeCalendarView() {
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
  }

  onKeyPress($event) {
    if ($event.which === '13' || $event.which === 13) {
      this.addVariable();
    }
  }

  removeVariable(index): void {
    this.schedule.configuration.variables.splice(index, 1);
    this.saveJSON();
  }

  loadData(node, type, $event): void {
    if (!node || !node.origin) {
      return;
    }
    if (!node.origin.type) {
      if ($event) {
        $event.stopPropagation();
      }
      let flag = true;
      if (node.origin.children && node.origin.children.length > 0 && node.origin.children[0].type) {
        flag = false;
      }
      if (node && (node.isExpanded || node.origin.isLeaf) && flag) {
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
          let flag = false;
          for (let i = 0; i < data.length; i++) {
            const _path = node.key + (node.key === '/' ? '' : '/') + data[i].name;
            if (this.schedule.configuration.workflowPath === _path) {
              flag = true;
            }
            data[i].title = _path;
            data[i].path = _path;
            data[i].key = _path;
            data[i].type = type;
            data[i].isLeaf = true;
          }
          if (!flag) {
            this.schedule.configuration.workflowPath = null;
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
    } else {
      setTimeout(() => {
        this.saveJSON();
      }, 10);
    }
  }

  onExpand(e, type) {
    this.loadData(e.node, type, null);
  }

  rename(inValid) {
    if (this.data.id === this.schedule.id && this.data.name !== this.schedule.name) {

      if (!inValid) {
        const data = this.coreService.clone(this.data);
        const name = this.schedule.name;
        this.coreService.post('inventory/rename', {
          id: data.id,
          name: name
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

  release() {
    this.dataService.reloadTree.next({release: this.schedule});
  }

  backToListView() {
    this.dataService.reloadTree.next({back: this.schedule});
  }

  private convertObjToArr(calendar) {
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

  private getObject() {
    this.coreService.post('inventory/read/configuration', {
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
      if (!this.schedule.configuration.variables) {
        this.schedule.configuration.variables = [];
      }
      if (this.schedule.configuration.variables.length === 0) {
        this.addVariable();
      }
      if (this.schedule.configuration.workflowPath) {
        const path = this.schedule.configuration.workflowPath.substring(0, this.schedule.configuration.workflowPath.lastIndexOf('/')) || '/';
        this.loadWorkflowTree(path);
      }
      this.schedule.actual = JSON.stringify(this.schedule.configuration);
      if (!res.valid) {
        if (!this.schedule.configuration.workflowPath) {
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

  private loadWorkflowTree(path) {
    const self = this;
    let count = 0;

    function interval() {
      ++count;
      setTimeout(() => {
        if (self.workflowTree.length === 0 && count < 5) {
          interval();
        }
        const node = self.treeSelectCtrl.getTreeNodeByKey(path);
        if (node) {
          node.isExpanded = true;
          self.loadData(node, 'WORKFLOW', null);
        }
      }, 10 * count);
    }

    interval();
  }

  private validateJSON(json) {
    const obj = _.clone(json);
    obj.path = this.data.path;
    this.coreService.post('inventory/' + this.objectType + '/validate', obj).subscribe((res: any) => {
      this.setErrorMessage(res);
    }, () => {
    });
  }

  private setErrorMessage(res) {
    if (res.invalidMsg) {
      if (res.invalidMsg.match('workflowPath')) {
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

  saveJSON() {
    if (!_.isEqual(this.schedule.actual, JSON.stringify(this.schedule.configuration))) {
      const _path = this.schedule.path1 + (this.schedule.path1 === '/' ? '' : '/') + this.schedule.name;
      this.schedule.configuration.controllerId = this.schedulerId;
      // this.schedule.configuration.path = _path;
      let obj = this.coreService.clone(this.schedule.configuration);
      if (obj.variables) {
        if (this.coreService.isLastEntryEmpty(obj.variables, 'name', '')) {
          obj.variables.splice(obj.variables.length - 1, 1);
        }
      }
      obj.path = _path;
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
      if (obj.workflowPath && obj.calendars.length > 0) {
        isValid = true;
      }
      this.coreService.post('inventory/store', {
        configuration: obj,
        path: _path,
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
