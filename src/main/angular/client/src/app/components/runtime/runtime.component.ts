import {Component, Input, OnChanges, OnDestroy, OnInit} from '@angular/core';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import * as _ from 'underscore';
import {DatePipe} from '@angular/common';
import {TreeModalComponent} from '../tree-modal/tree.component';
import {CoreService} from '../../services/core.service';
import {CalendarService} from '../../services/calendar.service';

declare const $;

@Component({
  selector: 'app-restriction',
  templateUrl: './add-restriction-dialog.html'
})
export class AddRestrictionComponent implements OnInit, OnDestroy {

  @Input() schedulerId: any;
  @Input() preferences: any;
  @Input() data: any = {};

  planItems: any = [];
  Math = Math;
  calObj: any = {};
  selectedMonths: any = [];
  selectedMonthsU: any = [];
  tempItems: any = [];
  toDate: any;
  temp: any;
  frequency: any = {};
  calendarTitle: any;
  isRuntimeEdit: boolean;
  countryField: boolean;
  isCalendarDisplay = false;
  showMonthRange = false;
  editor: any = {isEnable: false};
  excludedDates: any = [];
  includedDates: any = [];
  calendar: any = {};
  updateFrequency: any = {};
  tempList: any = [];
  frequencyList: any = [];
  frequencyList1: any = [];
  excludeFrequencyList: any = [];
  dateFormat: any;
  dateFormatM: any;
  str: string;

  constructor(public activeModal: NgbActiveModal, private coreService: CoreService, public modalService: NgbModal, private datePipe: DatePipe, private calendarService: CalendarService) {
  }

  ngOnInit() {
    this.dateFormat = this.coreService.getDateFormat(this.preferences.dateFormat);
    this.dateFormatM = this.coreService.getDateFormatMom(this.preferences.dateFormat);
    this.str = 'label.weekDays';
    this.calendarTitle = new Date().getFullYear();
    this.tempItems = [];
    this.selectedMonths = [];
    this.selectedMonthsU = [];
    this.calendar = this.coreService.clone(this.data.calendar);
    if (!this.calendar.frequencyList) {
      this.calendar.frequencyList = [];
    }

    this.temp = this.data.updateFrequency;
    if (this.temp && !_.isEmpty(this.temp)) {
      this.editor.create = false;
      this.isRuntimeEdit = true;
      this.frequency = this.coreService.clone(this.temp);
      for (let i = 0; i < this.calendar.frequencyList.length; i++) {
        if (this.calendar.frequencyList[i] == this.temp || _.isEqual(this.temp, this.calendar.frequencyList[i])) {
          if (this.calendar.frequencyList[i].tab == 'monthDays') {
            if (this.calendar.frequencyList[i].isUltimos === 'months') {
              this.frequency.selectedMonths = this.coreService.clone(this.calendar.frequencyList[i].selectedMonths);
            } else {
              this.frequency.selectedMonthsU = this.coreService.clone(this.calendar.frequencyList[i].selectedMonthsU);
            }
            if (this.calendar.frequencyList[i].isUltimos === 'months') {
              this.selectedMonths = [];
              this.calendar.frequencyList[i].selectedMonths.forEach((val) => {
                this.selectMonthDaysFunc(val);
              });
            } else {
              this.selectedMonthsU = [];
              this.calendar.frequencyList[i].selectedMonthsU.forEach((val) => {
                this.selectMonthDaysUFunc(val);
              });
            }
          } else if (this.calendar.frequencyList[i].tab === 'specificDays') {
            this.calendar.frequencyList[i].dates.forEach((date) => {
              this.tempItems.push({
                startDate: this.convertStringToDate(date),
                endDate: this.convertStringToDate(date),
                color: 'blue'
              });
            });
            let dom = $('#calendar');
            if (dom && dom.data('calendar')) {

            } else {
              dom.calendar({
                language: localStorage.$SOS$LANG,
                clickDay: (e) => {
                  this.selectDate(e.date);
                }
              });
            }
            dom.data('calendar').setDataSource(this.tempItems);
          }
          break;
        }
      }
    } else {
      this.temp = {};
      this.editor.create = true;
      this.frequency = {};
      this.frequency.tab = 'weekDays';
      this.frequency.isUltimos = 'months';
      this.frequency.dateEntity = 'DAILY';
      if (this.calendar.frequencyList && this.calendar.frequencyList.length > 0) {
        this.generateFrequencyObj();
      }
    }
    this.setEditorEnable();
  }

  convertStringToDate(date) {
    if (typeof date === 'string') {
      return moment(date);
    } else {
      return date;
    }
  }

  setEditorEnable() {
    if (this.frequency.days && this.frequency.days.length > 0) {
      this.editor.isEnable = true;
    }
  }

  ngOnDestroy() {
  }

  updateFrequencyObj(i) {
    if (this.calendar.frequencyList[i].tab == 'monthDays') {
      if (this.calendar.frequencyList[i].isUltimos === 'months') {
        this.frequency.selectedMonths = this.coreService.clone(this.calendar.frequencyList[i].selectedMonths);
        this.selectedMonths = [];
        for (let x = 0; x < this.calendar.frequencyList[i].selectedMonths.length; x++) {
          this.selectMonthDaysFunc(this.calendar.frequencyList[i].selectedMonths[x]);
        }
      } else {
        this.frequency.selectedMonthsU = this.coreService.clone(this.calendar.frequencyList[i].selectedMonthsU);
        this.selectedMonthsU = [];
        for (let x = 0; x < this.calendar.frequencyList[i].selectedMonthsU.length; x++) {
          this.selectMonthDaysUFunc(this.calendar.frequencyList[i].selectedMonthsU[x]);
        }
      }
      if (this.calendar.frequencyList[i].startingWithM) {
        this.frequency.startingWithM = moment(this.calendar.frequencyList[i].startingWithM).format(this.dateFormatM);
      }
      if (this.calendar.frequencyList[i].endOnM) {
        this.frequency.endOnM = moment(this.calendar.frequencyList[i].endOnM).format(this.dateFormatM);
      }
    } else if (this.calendar.frequencyList[i].tab === 'specificDays') {
      for (let m = 0; m < this.calendar.frequencyList[i].dates.length; m++) {
        let x = this.calendar.frequencyList[i].dates[m].split('-');
        this.tempItems.push({
          startDate: new Date(x[0], x[1] - 1, x[2] - 1),
          endDate: new Date(x[0], x[1] - 1, x[2] - 1),
          color: '#007da6'
        });
      }

      if (this.calendar.frequencyList[i].startingWithS) {
        this.frequency.startingWithS = moment(this.calendar.frequencyList[i].startingWithS).format(this.dateFormatM);
      }
      if (this.calendar.frequencyList[i].endOnS) {
        this.frequency.endOnS = moment(this.calendar.frequencyList[i].endOnS).format(this.dateFormatM);
      }

    }
    if (this.calendar.frequencyList[i].tab === 'weekDays') {
      this.frequency.days = this.coreService.clone(this.calendar.frequencyList[i].days);
      this.frequency.all = this.calendar.frequencyList[i].days.length === 7;
      if (this.calendar.frequencyList[i].startingWithW) {
        this.frequency.startingWithW = moment(this.calendar.frequencyList[i].startingWithW).format(this.dateFormatM);
      }
      if (this.calendar.frequencyList[i].endOnW) {
        this.frequency.endOnW = moment(this.calendar.frequencyList[i].endOnW).format(this.dateFormatM);
      }
    }
    if (this.calendar.frequencyList[i].tab == 'every') {
      if (this.calendar.frequencyList[i].startingWith) {
        this.frequency.startingWith = moment(this.calendar.frequencyList[i].startingWith).format(this.dateFormatM);
      }
      if (this.calendar.frequencyList[i].endOn) {
        this.frequency.endOn = moment(this.calendar.frequencyList[i].endOn).format(this.dateFormatM);
      }
    }
    if (this.calendar.frequencyList[i].tab == 'specificWeekDays') {
      if (this.calendar.frequencyList[i].startingWithS) {
        this.frequency.startingWithS = moment(this.calendar.frequencyList[i].startingWithS).format(this.dateFormatM);
      }
      if (this.calendar.frequencyList[i].endOnS) {
        this.frequency.endOnS = moment(this.calendar.frequencyList[i].endOnS).format(this.dateFormatM);
      }
    }
    if (this.frequency.tab === 'specificDays') {
      $('#calendar').calendar({
        clickDay: (e) => {
          this.selectDate(e);
        }
      }).setDataSource(this.tempItems);
    }
  }

  generateFrequencyObj() {
    this.tempItems = [];
    for (let i = 0; i < this.calendar.frequencyList.length; i++) {
      this.updateFrequencyObj(i);
    }
  }

  onFrequencyChange() {
    if (this.frequency) {
      if (!this.frequency.isUltimos) {
        this.frequency.isUltimos = 'months';
      }
      if (this.frequency.tab == 'monthDays') {
        if (this.frequency.isUltimos != 'months') {
          this.str = 'label.ultimos';
        } else {
          this.str = 'label.monthDays';
        }
      } else {
        if (this.frequency.tab == 'specificWeekDays') {
          this.str = 'label.specificWeekDays';
        } else if (this.frequency.tab == 'specificDays') {
          this.str = 'label.specificDays';
        } else if (this.frequency.tab == 'weekDays') {
          this.str = 'label.weekDays';
        } else if (this.frequency.tab == 'every') {
          this.str = 'label.every';
        }
      }
      if (this.frequency.tab == 'specificWeekDays') {
        this.editor.isEnable = !!(this.frequency.specificWeekDay && this.frequency.which);
      } else if (this.frequency.tab == 'monthDays') {
        if (this.frequency.isUltimos == 'months') {
          this.editor.isEnable = this.selectedMonths.length != 0;
        } else {
          this.editor.isEnable = this.selectedMonthsU.length != 0;
        }
      } else if (this.frequency.tab == 'every') {
        this.editor.isEnable = !!(this.frequency.interval && this.frequency.dateEntity);
      } else if (this.frequency.tab == 'weekDays') {
        this.editor.isEnable = this.frequency.days && this.frequency.days.length > 0;
      } else if (this.frequency.tab == 'specificDays') {
        this.editor.isEnable = this.tempItems.length > 0;
      }
    }
  }

  onChangeDays() {
    if (this.frequency.days) {
      this.editor.isEnable = this.frequency.days.length > 0;
      this.frequency.all = this.frequency.days.length == 7;
      this.frequency.days.sort();
    }
  }

  changeFrequency(str) {
    this.frequency.tab = str;
    this.onFrequencyChange();
    if (this.frequency.tab === 'specificDays') {
      $('#calendar').calendar({
        clickDay: (e) => {
          this.selectDate(e);
        }
      }).setDataSource(this.tempItems);
    }
  }

  selectMonthDaysFunc(value) {
    if (this.selectedMonths.indexOf(value) == -1) {
      this.selectedMonths.push(value);
    } else {
      this.selectedMonths.splice(this.selectedMonths.indexOf(value), 1);
    }
    this.frequency.selectedMonths = this.coreService.clone(this.selectedMonths);
    this.frequency.selectedMonths.sort();
    this.editor.isEnable = this.selectedMonths.length > 0;
  }

  selectMonthDaysUFunc(value) {
    if (this.selectedMonthsU.indexOf(value) == -1) {
      this.selectedMonthsU.push(value);
    } else {
      this.selectedMonthsU.splice(this.selectedMonthsU.indexOf(value), 1);
    }
    this.frequency.selectedMonthsU = this.coreService.clone(this.selectedMonthsU);
    this.frequency.selectedMonthsU.sort();
    this.editor.isEnable = this.selectedMonthsU.length > 0;
  }

  getSelectedMonthDays(value) {
    if (this.selectedMonths.indexOf(value) != -1) {
      return true;
    }
  }

  getSelectedMonthDaysU(value) {
    if (this.selectedMonthsU.indexOf(value) != -1) {
      return true;
    }
  }

  selectAllWeek() {
    if (this.frequency.all) {
      this.frequency.days = ['0', '1', '2', '3', '4', '5', '6'];
      this.editor.isEnable = true;
    } else {
      this.frequency.days = [];
      this.editor.isEnable = false;
    }
  }

  selectAllMonth() {
    if (this.frequency.allMonth) {
      this.frequency.months = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
    } else {
      this.frequency.months = [];
    }
  }

  getDateFormat(date) {
    return moment(date).format(this.dateFormatM);
  }


  addFrequency() {
    this.frequency.str = this.calendarService.freqToStr(this.frequency, this.dateFormat);
    this.setEditorEnable();
    let flag = false;
    if (this.isRuntimeEdit) {
      this.isRuntimeEdit = false;
      if (this.calendar.frequencyList.length > 0) {
        for (let i = 0; i < this.calendar.frequencyList.length; i++) {
          if (this.calendar.frequencyList[i].tab == this.temp.tab && this.calendar.frequencyList[i].str == this.temp.str && this.calendar.frequencyList[i].type == this.temp.type) {
            if (this.frequency.tab == 'specificDays') {
              this.frequency.dates = [];
              for (let j = 0; j < this.tempItems.length; j++) {
                this.frequency.dates.push(moment(this.tempItems[j].startDate).format('YYYY-MM-DD'));
              }
              this.frequency.str = this.calendarService.freqToStr(this.frequency, this.dateFormat);
            }
            this.calendar.frequencyList[i] = this.coreService.clone(this.frequency);
            break;
          }
        }
      }
      this.temp = {};
      if (this.calendar.frequencyList && this.calendar.frequencyList.length > 0) {
        this.generateFrequencyObj();
      }
      this.editor.isEnable = false;
      return;
    }
    if (this.frequency.tab == 'specificDays') {
      this.frequency.dates = [];
      for (let j = 0; j < this.tempItems.length; j++) {
        this.frequency.dates.push(moment(this.tempItems[j].startDate).format('YYYY-MM-DD'));
      }
      this.frequency.str = this.calendarService.freqToStr(this.frequency, this.dateFormat);
    }
    for (let i = 0; i < this.calendar.frequencyList.length; i++) {
      if (_.isEqual(this.calendar.frequencyList[i], this.frequency)) {
        flag = true;
        break;
      }
    }

    if (flag) {
      return;
    }
    let _dates = [], datesArr;

    if (this.calendar.frequencyList.length > 0) {
      let flag1 = false;
      for (let i = 0; i < this.calendar.frequencyList.length; i++) {
        if (this.frequency.tab == this.calendar.frequencyList[i].tab) {
          if (this.frequency.tab == 'weekDays') {
            if (this.frequency.months && this.frequency.months.length > 0) {
              if (this.frequency.months == this.calendar.frequencyList[i].months || _.isEqual(this.calendar.frequencyList[i].months, this.frequency.months)) {
                if (_.isEqual(this.calendar.frequencyList[i].days, this.frequency.days)) {
                  flag1 = true;
                  break;
                }
                this.calendar.frequencyList[i].days = this.coreService.clone(this.frequency.days);
                this.calendar.frequencyList[i].startingWithW = _.clone(this.frequency.startingWithW);
                this.calendar.frequencyList[i].endOnW = _.clone(this.frequency.endOnW);
                this.calendar.frequencyList[i].str = _.clone(this.frequency.str);
                flag1 = true;
                break;
              } else {
                if (this.calendar.frequencyList[i].months)
                  if (_.isEqual(this.calendar.frequencyList[i].days, this.frequency.days)) {
                    for (let j = 0; j < this.frequency.months.length; j++) {
                      if (this.calendar.frequencyList[i].months.indexOf(this.frequency.months[j]) == -1)
                        this.calendar.frequencyList[i].months.push(this.frequency.months[j]);
                    }
                    this.calendar.frequencyList[i].str = _.clone(this.frequency.str);
                    flag1 = true;
                    break;
                  }
              }
            } else {
              if (!this.calendar.frequencyList[i].months) {
                this.calendar.frequencyList[i].days = this.coreService.clone(this.frequency.days);
                this.calendar.frequencyList[i].startingWithW = _.clone(this.frequency.startingWithW);
                this.calendar.frequencyList[i].endOnW = _.clone(this.frequency.endOnW);
                this.calendar.frequencyList[i].str = _.clone(this.frequency.str);
                flag1 = true;
                break;
              }
            }
          } else if (this.frequency.tab == 'monthDays' && this.frequency.isUltimos == 'months' && this.calendar.frequencyList[i].isUltimos == 'months') {
            if (this.frequency.months && this.frequency.months.length > 0) {
              if (this.frequency.months == this.calendar.frequencyList[i].months || _.isEqual(this.calendar.frequencyList[i].months, this.frequency.months)) {
                this.calendar.frequencyList[i].selectedMonths = this.coreService.clone(this.frequency.selectedMonths);
                this.calendar.frequencyList[i].startingWithM = _.clone(this.frequency.startingWithM);
                this.calendar.frequencyList[i].endOnM = _.clone(this.frequency.endOnM);
                this.calendar.frequencyList[i].str = _.clone(this.frequency.str);
                flag1 = true;
                break;
              } else {
                if (this.calendar.frequencyList[i].months)
                  if (_.isEqual(this.calendar.frequencyList[i].selectedMonths, this.frequency.selectedMonths)) {
                    for (let j = 0; j < this.frequency.months.length; j++) {
                      if (this.calendar.frequencyList[i].months.indexOf(this.frequency.months[j]) == -1)
                        this.calendar.frequencyList[i].months.push(this.frequency.months[j]);
                    }
                    this.calendar.frequencyList[i].str = _.clone(this.frequency.str);
                    flag1 = true;
                    break;
                  }
              }
            } else {
              if (!this.calendar.frequencyList[i].months) {
                this.calendar.frequencyList[i].selectedMonths = this.coreService.clone(this.frequency.selectedMonths);
                this.calendar.frequencyList[i].startingWithM = _.clone(this.frequency.startingWithM);
                this.calendar.frequencyList[i].endOnM = _.clone(this.frequency.endOnM);
                this.calendar.frequencyList[i].str = _.clone(this.frequency.str);
                flag1 = true;
                break;
              }
            }
          } else if (this.frequency.tab == 'monthDays' && this.frequency.isUltimos != 'months' && this.calendar.frequencyList[i].isUltimos !== 'months') {
            if (this.frequency.months && this.frequency.months.length > 0) {
              if (this.frequency.months == this.calendar.frequencyList[i].months || _.isEqual(this.calendar.frequencyList[i].months, this.frequency.months)) {
                this.calendar.frequencyList[i].selectedMonthsU = this.coreService.clone(this.frequency.selectedMonthsU);
                this.calendar.frequencyList[i].startingWithM = _.clone(this.frequency.startingWithM);
                this.calendar.frequencyList[i].endOnM = _.clone(this.frequency.endOnM);
                this.calendar.frequencyList[i].str = _.clone(this.frequency.str);
                flag1 = true;
                break;
              } else {
                if (this.calendar.frequencyList[i].months)
                  if (_.isEqual(this.calendar.frequencyList[i].selectedMonthsU, this.frequency.selectedMonthsU)) {
                    for (let j = 0; j < this.frequency.months.length; j++) {
                      if (this.calendar.frequencyList[i].months.indexOf(this.frequency.months[j]) == -1)
                        this.calendar.frequencyList[i].months.push(this.frequency.months[j]);
                    }
                    this.calendar.frequencyList[i].str = _.clone(this.frequency.str);
                    flag1 = true;
                    break;
                  }
              }
            } else {
              if (!this.calendar.frequencyList[i].months) {
                this.calendar.frequencyList[i].selectedMonthsU = this.coreService.clone(this.frequency.selectedMonthsU);
                this.calendar.frequencyList[i].startingWithM = _.clone(this.frequency.startingWithM);
                this.calendar.frequencyList[i].endOnM = _.clone(this.frequency.endOnM);
                this.calendar.frequencyList[i].str = _.clone(this.frequency.str);

                flag1 = true;
                break;
              }
            }
          } else if (this.frequency.tab == 'specificWeekDays') {
            if (this.frequency.months && this.calendar.frequencyList[i].months) {
              if (!_.isEqual(this.calendar.frequencyList[i].months, this.frequency.months)) {
                if (_.isEqual(this.calendar.frequencyList[i].specificWeekDay, this.frequency.specificWeekDay) && _.isEqual(this.calendar.frequencyList[i].which, this.frequency.which)) {
                  for (let j = 0; j < this.frequency.months.length; j++) {
                    if (this.calendar.frequencyList[i].months.indexOf(this.frequency.months[j]) == -1)
                      this.calendar.frequencyList[i].months.push(this.frequency.months[j]);
                  }
                  this.calendar.frequencyList[i].str = this.calendarService.freqToStr(this.calendar.frequencyList[i], this.dateFormat);
                  flag1 = true;
                  break;
                }
              }
            }
          } else if (this.frequency.tab == 'specificDays') {
            this.frequency.dates = [];
            for (let j = 0; j < this.tempItems.length; j++) {
              this.frequency.dates.push(moment(this.tempItems[j].startDate).format('YYYY-MM-DD'));
            }
            this.frequency.str = this.calendarService.freqToStr(this.frequency, this.dateFormat);
            this.calendar.frequencyList[i].dates = this.coreService.clone(this.frequency.dates);
            this.calendar.frequencyList[i].str = _.clone(this.frequency.str);
            flag1 = true;
            break;
          } else if (this.frequency.tab == 'every') {
            if (_.isEqual(this.frequency.dateEntity, this.calendar.frequencyList[i].dateEntity) && _.isEqual(this.frequency.startingWith, this.calendar.frequencyList[i].startingWith)) {
              this.calendar.frequencyList[i].str = this.calendarService.freqToStr(this.frequency, this.dateFormat);
              this.calendar.frequencyList[i].interval = _.clone(this.frequency.interval);
              this.calendar.frequencyList[i].str = _.clone(this.frequency.str);
              flag1 = true;
              break;
            }
          }
        }
      }
      if (_dates && _dates.length > 0) {
        for (let i = 0; i < _dates.length; i++) {
          let obj = this.coreService.clone(this.frequency);
          obj.type = this.editor.frequencyType;
          obj.nationalHoliday = _dates[i];
          obj.str = this.calendarService.freqToStr(obj, this.dateFormat);
          this.calendar.frequencyList.push(obj);
        }
      }
      if (!flag1) {
        if (this.frequency.tab == 'specificDays') {
          this.frequency.dates = [];
          for (let i = 0; i < this.tempItems.length; i++) {
            this.frequency.dates.push(moment(this.tempItems[i].startDate).format('YYYY-MM-DD'));
          }
          this.frequency.str = this.calendarService.freqToStr(this.frequency, this.dateFormat);
        }
        if (this.frequency.tab != 'nationalHoliday') {
          this.frequency.type = this.editor.frequencyType;
          this.calendar.frequencyList.push(this.coreService.clone(this.frequency));
        }
      } else {
        this.frequency.nationHoliday = [];
      }

    } else {
      if (this.frequency.tab == 'specificDays') {
        this.frequency.dates = [];
        for (let i = 0; i < this.tempItems.length; i++) {
          this.frequency.dates.push(moment(this.tempItems[i].startDate).format('YYYY-MM-DD'));
        }
        this.frequency.str = this.calendarService.freqToStr(this.frequency, this.dateFormat);
      }
      this.frequency.type = this.editor.frequencyType;
      this.calendar.frequencyList.push(this.coreService.clone(this.frequency));
    }
    this.editor.isEnable = false;
  }

  editFrequency(data) {
    this.temp = this.coreService.clone(data);
    this.frequency = this.coreService.clone(data);
    this.isRuntimeEdit = true;
    if (this.frequency.tab == 'monthDays') {
      if (this.frequency.isUltimos == 'months') {
        this.selectedMonths = [];
        for (let i = 0; i < data.selectedMonths.length; i++) {
          this.selectMonthDaysFunc(data.selectedMonths[i]);
        }
      } else {
        this.selectedMonthsU = [];
        for (let i = 0; i < data.selectedMonthsU.length; i++) {
          this.selectMonthDaysUFunc(data.selectedMonthsU[i]);
        }
      }
    }
    this.onFrequencyChange();
  }

  deleteFrequency(data, index) {
    this.calendar.frequencyList.splice(index, 1);
    if (this.calendar.frequencyList.length == 0) {
      var temp = this.coreService.clone(this.frequency);
      this.frequency = {};
      this.frequency.tab = temp.tab;
      this.frequency.isUltimos = temp.isUltimos;
    }
    if (data.tab == 'specificDays') {
      this.tempItems = [];
    }
  }

  save() {
    this.activeModal.close(this.calendar);
  }

  cancel() {
    this.activeModal.close('');
  }

  private checkDate(date) {
    let planData = {
      startDate: date,
      endDate: date,
      color: '#007da6'
    };

    let flag = false, isFound = false, flg = false;
    if (this.calObj.frequency == 'all' || this.calObj.frequency.type == 'INCLUDE') {
      if (this.planItems.length == 0) {
        this.includedDates = [];
        this.includedDates.push(planData);
        this.planItems.push(planData);
      } else {
        for (let i = 0; i < this.planItems.length; i++) {
          if ((new Date(this.planItems[i].startDate).setHours(0, 0, 0, 0) == new Date(planData.startDate).setHours(0, 0, 0, 0))) {
            isFound = true;
            if (this.planItems[i].color != '#eb8814') {
              this.planItems[i].color = '#eb8814';
              flag = true;
            } else {
              this.planItems[i].color = '#007da6';
            }
            break;
          }
        }
        if (!isFound) {
          planData.color = '#007da6';
          this.includedDates.push(planData);
          this.planItems.push(planData);
        } else {
          if (this.includedDates.length > 0) {
            for (let i = 0; i < this.includedDates.length; i++) {
              if ((new Date(this.includedDates[i].startDate).setHours(0, 0, 0, 0) == new Date(planData.startDate).setHours(0, 0, 0, 0))) {
                this.includedDates.splice(i, 1);
                break;
              }
            }
          }
        }
        if (isFound && !flag) {
          this.includedDates.push(planData);
        }
      }

      if (!flag) {
        if (this.excludedDates.length > 0) {
          for (let i = 0; i < this.excludedDates.length; i++) {
            if ((new Date(this.excludedDates[i].startDate).setHours(0, 0, 0, 0) == new Date(planData.startDate).setHours(0, 0, 0, 0))) {
              this.excludedDates.splice(i, 1);
              break;
            }
          }
        }
      } else {
        for (let i = 0; i < this.excludedDates.length; i++) {
          if ((new Date(this.excludedDates[i].startDate).setHours(0, 0, 0, 0) == new Date(planData.startDate).setHours(0, 0, 0, 0))) {
            flg = true;
            break;
          }
        }
        if (!flg) {
          this.excludedDates.push(planData);
        }
      }

    } else if (this.calObj.frequency.type == 'EXCLUDE') {
      if (this.planItems.length == 0) {
        this.excludedDates = [];
        this.excludedDates.push(planData);
        this.planItems.push(planData);
      } else {
        for (let i = 0; i < this.planItems.length; i++) {
          if ((new Date(this.planItems[i].startDate).setHours(0, 0, 0, 0) == new Date(planData.startDate).setHours(0, 0, 0, 0))) {
            isFound = true;
            if (this.planItems[i].color != '#eb8814') {
              this.planItems[i].color = '#eb8814';
            } else {
              this.planItems[i].color = '#007da6';
              flag = true;
            }
            break;
          }
        }
        if (!isFound) {
          planData.color = '#eb8814';
          this.excludedDates.push(planData);
          this.planItems.push(planData);
        } else {
          if (this.excludedDates.length > 0) {
            for (let i = 0; i < this.excludedDates.length; i++) {
              if ((new Date(this.excludedDates[i].startDate).setHours(0, 0, 0, 0) == new Date(planData.startDate).setHours(0, 0, 0, 0))) {
                this.excludedDates.splice(i, 1);
                break;
              }
            }
          }
        }
      }
      if (!flag) {
        if (this.includedDates.length > 0) {
          for (let i = 0; i < this.includedDates.length; i++) {
            if ((new Date(this.includedDates[i].startDate).setHours(0, 0, 0, 0) == new Date(planData.startDate).setHours(0, 0, 0, 0))) {
              this.includedDates.splice(i, 1);
              break;
            }
          }
        }
      } else {
        for (let i = 0; i < this.includedDates.length; i++) {
          if ((new Date(this.includedDates[i].startDate).setHours(0, 0, 0, 0) == new Date(planData.startDate).setHours(0, 0, 0, 0))) {
            flg = true;
            break;
          }
        }
        if (!flg) {
          this.includedDates.push(planData);
        }
      }
    }

    $('#full-calendar').data('calendar').setDataSource(this.planItems);
  }

  private selectDate(e) {
    let obj = {
      startDate: e.date,
      endDate: e.date,
      date: e.date,
      color: '#007da6'
    };
    let flag = false;
    let index = 0;
    for (let i = 0; i < this.tempItems.length; i++) {
      if ((new Date(this.tempItems[i].startDate).setHours(0, 0, 0, 0) == new Date(obj.startDate).setHours(0, 0, 0, 0))) {
        flag = true;
        index = i;
        break;
      }
    }
    if (!flag) {
      this.tempItems.push(obj);
    } else {
      this.tempItems.splice(index, 1);
    }
    this.editor.isEnable = this.tempItems.length > 0;
    $('#calendar').data('calendar').setDataSource(this.tempItems);
  }

}

@Component({
  selector: 'app-period',
  templateUrl: './period-editor-dialog.html',
})
export class PeriodComponent implements OnInit {
  @Input() isNew: boolean;
  @Input() data: any = {};
  period: any = {period: {}};
  when_holiday_options = [
    'SUPPRESS',
    'IGNORE',
    'PREVIOUSNONWORKINGDAY',
    'NEXTNONWORKINGDAY'
  ];

  constructor(public activeModal: NgbActiveModal, private calendarService: CalendarService) {
  }

  ngOnInit(): void {
    if (this.isNew) {
      this.period.frequency = 'singleStart';
      this.period.period.singleStart = '00:00:00';
      this.period.period.whenHoliday = 'SUPPRESS';
    } else {
      if (_.isArray(this.data)) {
        this.data = this.data[0];
      }
      if (this.data.singleStart) {
        this.period.frequency = 'singleStart';
        this.period.period.singleStart = this.data.singleStart;
      } else if (this.data.repeat) {
        this.period.frequency = 'repeat';
        this.period.period.repeat = this.data.repeat;
      }
      if (this.data.begin) {
        this.period.period.begin = this.data.begin;
      }
      if (this.data.end) {
        this.period.period.end = this.data.end;
      }
      this.period.period.whenHoliday = this.data.whenHoliday;
    }
  }

  onSubmit(): void {
    if (this.period.frequency === 'singleStart') {
      delete this.period.period['repeat'];
      delete this.period.period['begin'];
      delete this.period.period['end'];
      if (this.period.period.singleStart) {
        this.period.period.singleStart = this.calendarService.checkTime(this.period.period.singleStart);
      } else {
        return;
      }
    } else if (this.period.frequency === 'repeat') {
      delete this.period.period['singleStart'];
      if (this.period.period.repeat) {
        this.period.period.repeat = this.calendarService.checkTime(this.period.period.repeat);
      } else {
        return;
      }
    } else if (this.period.frequency === 'time_slot') {
      delete this.period.period['repeat'];
      delete this.period.period['singleStart'];
    }
    if (this.period.frequency !== 'singleStart') {
      if (this.period.period.begin) {
        this.period.period.begin = this.calendarService.checkTime(this.period.period.begin);
      } else {
        return;
      }
      if (this.period.period.end) {
        this.period.period.end = this.calendarService.checkTime(this.period.period.end);
      } else {
        return;
      }
    }
    this.activeModal.close(this.period);
  }

  cancel(): void {
    this.activeModal.dismiss();
  }
}

@Component({
  selector: 'app-run-time',
  templateUrl: './run-time-dialog.html',
})
export class RunTimeComponent implements OnDestroy, OnChanges {
  @Input() schedule: any;
  @Input() preferences: any;
  @Input() permission: any;
  @Input() schedulerId: any;
  planItems = [];
  tempList = [];
  timeZone: string;
  editor: any = {};
  viewCalObj: any = {calendarView: 'year'};
  calendars: any = [];
  nonWorkingCalendars: any = [];
  zones = moment.tz.names();
  calendar: any;
  toDate: any;
  calendarTitle = new Date().getFullYear();

  constructor(private coreService: CoreService, public modalService: NgbModal, private calendarService: CalendarService) {

  }

  ngOnChanges(changes) {
    this.init();
  }

  assignCalendar() {
    const modalRef = this.modalService.open(TreeModalComponent, {
      backdrop: 'static'
    });
    modalRef.componentInstance.schedulerId = this.schedulerId;
    modalRef.componentInstance.type = 'WORKINGDAYSCALENDAR';
    modalRef.componentInstance.object = 'Calendar';
    modalRef.result.then((result) => {
      this.calendars = this.calendars.concat(result);
    }, (reason) => {
      console.log('close...', reason);
    });
  }

  assignHolidayCalendar() {
    const modalRef = this.modalService.open(TreeModalComponent, {
      backdrop: 'static'
    });
    modalRef.componentInstance.schedulerId = this.schedulerId;
    modalRef.componentInstance.type = 'NONWORKINGDAYSCALENDAR';
    modalRef.componentInstance.object = 'Calendar';
    modalRef.result.then((result) => {
      this.nonWorkingCalendars = this.nonWorkingCalendars.concat(result);
      _.unique(this.nonWorkingCalendars);
    }, (reason) => {
      console.log('close...', reason);
    });
  }

  getPeriodStr(period) {
    let periodStr = null;
    if (period.begin) {
      periodStr = period.begin;
    }
    if (period.end) {
      periodStr = periodStr + '-' + period.end;
    }
    if (period.singleStart) {
      periodStr = 'Single start: ' + period.singleStart;
    } else if (period.repeat) {
      periodStr = periodStr + ' every ' + this.calendarService.getTimeInString(period.repeat);
    }
    return periodStr;
  }

  checkPeriod(value, period): boolean {
    if (!value || !period) {
      return;
    }
    let flg = false, isMatch = false;
    if (value.whenHoliday === period.whenHoliday) {
      flg = true;
    } else if (!value.whenHoliday && period.whenHoliday === 'SUPPRESS') {
      flg = true;
    }
    if (!period.whenHoliday && value.whenHoliday === 'SUPPRESS') {
      flg = true;
    }
    if (period.singleStart && flg && value.singleStart) {
      if (value.singleStart.length === 5) {
        value.singleStart = value.singleStart + ':00';
      }
      if (period.singleStart.length === 5) {
        period.singleStart = period.singleStart + ':00';
      }
      return value.singleStart === period.singleStart;
    }
    if (period.begin && flg && value.begin) {
      if (value.begin.length === 5) {
        value.begin = value.begin + ':00';
      }
      if (period.begin.length === 5) {
        period.begin = period.begin + ':00';
      }
      flg = value.begin === period.begin;
      isMatch = flg;
    }
    if (period.end && flg && value.end) {
      if (value.end.length === 5) {
        value.end = value.end + ':00';
      }
      if (period.end.length === 5) {
        period.end = period.end + ':00';
      }
      flg = value.end === period.end;
      isMatch = flg;
    }
    if (period.repeat && flg && value.repeat) {
      if (value.repeat.length === 5) {
        value.repeat = value.repeat + ':00';
      }
      if (period.repeat.length === 5) {
        period.repeat = period.repeat + ':00';
      }
      return value.repeat === period.repeat;
    }
    return isMatch;
  }

  addPeriodInCalendar(calendar): void {
    const modalRef = this.modalService.open(PeriodComponent, {backdrop: 'static'});
    modalRef.componentInstance.isNew = true;
    modalRef.componentInstance.data = {};
    modalRef.result.then((result) => {
      let flag = false;
      if (!calendar.periods) {
        calendar.periods = [];
      } else {
        for (let i = 0; i < calendar.periods.length; i++) {
          flag = this.checkPeriod(calendar.periods[i], result.period);
        }
      }
      if (!flag) {
        calendar.periods.push(result.period);
      }
    }, (reason) => {
      console.log('close...', reason);
    });
  }

  updatePeriodInCalendar(calendar, index, period): void {
    const modalRef = this.modalService.open(PeriodComponent, {backdrop: 'static'});
    modalRef.componentInstance.data = period;
    modalRef.result.then((result) => {
      calendar.periods[index] = result.period;
    }, (reason) => {
      console.log('close...', reason);
    });
  }

  removePeriodInCalendar(calendar, index): void {
    calendar.periods.splice(index, 1);
  }

  planFromRuntime() {
    this.viewCalObj.calendarView = 'year';
    this.calendar = null;
    this.editor.showPlanned = true;
    this.showCalendar();
  }

  previewCalendar(calendar, type): void {
    this.calendar = calendar;
    this.calendar.type = type;
    this.editor.showPlanned = true;
    this.showCalendar();
  }

  showCalendar() {
    setTimeout(() => {
      $('#full-calendar').calendar({
        renderEnd: (e) => {
          this.calendarTitle = e.currentYear;
          if (this.toDate) {
            this.changeDate();
          }
        }
      });
      let obj: any = {
        dateFrom: moment().format('YYYY-MM-DD'),
        dateTo: this.calendarTitle + '-12-31'
      };
      if (this.calendar) {
        obj.path = this.calendar.calendarPath;
      } else {
        obj.calendars = this.getCalendarObj(this.calendars);
        obj.nonWorkingCalendars = this.nonWorkingCalendars;
        obj.timeZone = this.timeZone;
      }
      this.toDate = obj.dateTo;
      this.getDates(obj, true);
    }, 10);
  }

  changeDate() {
    let newDate = new Date();
    newDate.setHours(0, 0, 0, 0);
    let toDate: any;
    if (new Date(this.toDate).getTime() < new Date(this.calendarTitle + '-12-31').getTime()) {
      toDate = this.calendarTitle + '-12-31';
    } else {
      toDate = this.toDate;
    }

    if (newDate.getFullYear() < this.calendarTitle && (new Date(this.calendarTitle + '-01-01').getTime() < new Date(toDate).getTime())) {
      let obj: any = {
        dateFrom: this.calendarTitle + '-01-01',
        dateTo: toDate,
      };

      if (this.calendar) {
        obj.path = this.calendar.calendarPath;
      } else {
        obj.calendars = this.getCalendarObj(this.calendars);
        obj.nonWorkingCalendars = this.nonWorkingCalendars;
        obj.timeZone = this.timeZone;
      }
      this.getDates(obj, false);
    } else if (newDate.getFullYear() === this.calendarTitle) {
      this.planItems = _.clone(this.tempList);
      if ($('#full-calendar').data('calendar')) {
        $('#full-calendar').data('calendar').setDataSource(this.planItems);
      }
    }
  }

  getPlan() {
    $('#full-calendar').data('calendar').setYearView({view: this.viewCalObj.calendarView, year: this.calendarTitle});
  }

  removeWorkingCal(index): void {
    this.calendars.splice(index, 1);
  }

  removeNonWorkingCal(index): void {
    this.nonWorkingCalendars.splice(index, 1);
  }

  frequencyToString(period) {
    let str;
    if (period.months && _.isArray(period.months)) {
      str = this.calendarService.getMonths(period.months);
    }
    if (period.tab === 'weekDays') {
      if (str) {
        return this.calendarService.getWeekDays(period.days) + ' on ' + str;
      } else {
        return this.calendarService.getWeekDays(period.days);
      }
    } else if (period.tab === 'specificWeekDays') {
      if (str) {
        return this.calendarService.getSpecificDay(period.which) + ' ' + period.specificWeekDay + ' of ' + str;
      } else {
        return this.calendarService.getSpecificDay(period.which) + ' ' + period.specificWeekDay + ' of month';
      }
    } else if (period.tab === 'specificDays') {
      return 'On ' + moment(period.date).format('YYYY-MM-DD');
    } else if (period.tab === 'monthDays') {
      if (period.isUltimos === 'ultimos') {
        if (str) {
          return '- ' + this.calendarService.getMonthDays(period.selectedMonthsU, true) + ' of ' + str;
        } else {
          return this.calendarService.getMonthDays(period.selectedMonthsU, true) + ' of ultimos';
        }
      } else {
        if (str) {
          return this.calendarService.getMonthDays(period.selectedMonths, false) + ' of ' + str;
        } else {
          return this.calendarService.getMonthDays(period.selectedMonths, false) + ' of month';
        }
      }
    }
  }

  /** --------- Begin Restriction  ----------------*/

  addRestrictionInCalendar(data) {
    const modalRef = this.modalService.open(AddRestrictionComponent, {
      backdrop: 'static',
      size: 'lg'
    });
    modalRef.componentInstance.schedulerId = this.schedulerId;
    modalRef.componentInstance.preferences = this.preferences;
    modalRef.componentInstance.data = {calendar: this.coreService.clone(data)};
    modalRef.result.then((result) => {
      if (result) {
        this.saveRestriction(result);
      }
    }, (reason) => {
      console.log('close...', reason);
    });
  }

  editRestrictionInCalendar(data, frequency) {
    const modalRef = this.modalService.open(AddRestrictionComponent, {
      backdrop: 'static',
      size: 'lg'
    });
    modalRef.componentInstance.schedulerId = this.schedulerId;
    modalRef.componentInstance.preferences = this.preferences;
    modalRef.componentInstance.data = {
      calendar: this.coreService.clone(data),
      updateFrequency: this.coreService.clone(frequency)
    };

    modalRef.result.then((result) => {
      if (result) {
        this.saveRestriction(result);
      }
    }, (reason) => {
      console.log('close...', reason);
    });
  }

  deleteRestrictionInCalendar(data, frequency) {
    for (let i = 0; i < data.frequencyList.length; i++) {
      if (data.frequencyList[i].str === frequency.str) {
        data.frequencyList.splice(i, 1);
        break;
      }
    }
  }

  /** ===================== End Restriction  ======================*/

  ngOnDestroy(): void {
    if (this.schedule.configuration) {
      if (this.timeZone) {
        for (let i = 0; i < this.calendars.length; i++) {
          this.calendars[i].timeZone = this.timeZone;
        }
      }
      this.schedule.configuration.calendars = this.calendars;
      this.schedule.configuration.nonWorkingCalendars = this.nonWorkingCalendars;
    }
  }

  back(): void {
    this.editor.showPlanned = false;
  }

  private init(): void {
    if (this.schedule.configuration) {
      this.calendars = this.schedule.configuration.calendars;
      this.nonWorkingCalendars = this.schedule.configuration.nonWorkingCalendars;
    }
    if (this.calendars.length > 0) {
      this.timeZone = this.calendars[0].timeZone;
    }
    if (!this.timeZone) {
      this.timeZone = this.preferences.zone;
    }
  }

  private getDates(obj, flag: boolean): void {
    this.planItems = [];
    this.coreService.post(!this.calendar ? 'schedule/runtime' : 'inventory/calendar/dates',
      obj).subscribe((result: any) => {
      this.filterDates(result, flag);
    });
  }

  private filterDates(result, flag) {
    if (result.periods) {
      this.populatePlanItems(result);
    } else {
      if(result.dates) {
        for (let i = 0; i < result.dates.length; i++) {
          let x = result.dates[i];
          let obj = {
            startDate: moment(x),
            endDate: moment(x),
            color: '#007da6'
          };

          this.planItems.push(obj);
        }
      }
      if (result.withExcludes) {
        for (let i = 0; i < result.withExcludes.length; i++) {
          let x = result.withExcludes[i];
          this.planItems.push({
            startDate: moment(x),
            endDate: moment(x),
            color: '#eb8814'
          });
        }
      }
    }
    if (flag) {
      this.tempList = _.clone(this.planItems);
    }
    $('#full-calendar').data('calendar').setDataSource(this.planItems);
  }

  private populatePlanItems(res) {
    res.periods.forEach((value) => {
      let planData: any = {};
      if (value.begin) {
        planData = {
          plannedStartTime: moment(value.begin).tz(this.preferences.zone),
          plannedShowTime: this.coreService.getTimeFromDate(moment(value.begin).tz(this.preferences.zone), this.preferences.dateFormat)
        };
        if (value.end) {
          planData.endTime = this.coreService.getTimeFromDate(moment(value.end).tz(this.preferences.zone),
            this.preferences.dateFormat);
        }
        if (value.repeat) {
          planData.repeat = value.repeat;
        }
      } else if (value.singleStart) {
        planData = {
          plannedStartTime: moment(value.singleStart).tz(this.preferences.zone),
          plannedShowTime: this.coreService.getTimeFromDate(moment(value.begin).tz(this.preferences.zone), this.preferences.dateFormat)
        };
      }
      let date = new Date(planData.plannedStartTime).setHours(0, 0, 0, 0);
      planData.startDate = date;
      planData.endDate = date;
      planData.color = 'blue';
      this.planItems.push(planData);
    });
  }

  private getCalendarObj(list): any {
    let calendars = [];
    for (let i = 0; i < list.length; i++) {
      let obj: any = {calendarPath: list[i].calendarPath, periods: list[i].periods};
      if (list[i].frequencyList && list[i].frequencyList.length > 0) {
        obj.includes = {};
        list[i].frequencyList.forEach((val) => {
          this.calendarService.generateCalendarObj(val, obj);
        });
      }
      calendars.push(obj);
    }
    return calendars;
  }

  private saveRestriction(data) {
    for (let i = 0; i < this.calendars.length; i++) {
      if (data.calendarPath === this.calendars[i].calendarPath) {
        this.calendars[i].frequencyList = data.frequencyList;
        break;
      }
    }
  }

}


