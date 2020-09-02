import {Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import * as _ from 'underscore';
import {DatePipe} from '@angular/common';
import {TreeModalComponent} from '../../../../components/tree-modal/tree.component';
import {CoreService} from '../../../../services/core.service';
import {DataService} from '../../../../services/data.service';
import {CalendarService} from '../../../../services/calendar.service';

declare const $;

@Component({
  selector: 'app-ngbd-modal-content',
  templateUrl: './add-restriction-dialog.html'
})
export class AddRestrictionModalComponent implements OnInit, OnDestroy {
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
  frequencyObj: any;
  isCalendarLoading: boolean;
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
    console.log(this.data);
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
    console.log(this.calendar);
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
            if ($('#calendar') && $('#calendar').data('calendar')) {

            } else {
              $('#calendar').calendar({
                language: localStorage.$SOS$LANG,
                clickDay: (e) => {
                  this.selectDate(e.date);
                }
              });
            }
            $('#calendar').data('calendar').setDataSource(this.tempItems);
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

      if (this.calendar.frequencyList[i].startingWithS)
        this.frequency.startingWithS = moment(this.calendar.frequencyList[i].startingWithS).format(this.dateFormatM);
      if (this.calendar.frequencyList[i].endOnS)
        this.frequency.endOnS = moment(this.calendar.frequencyList[i].endOnS).format(this.dateFormatM);

    }
    if (this.calendar.frequencyList[i].tab === 'weekDays') {
      this.frequency.days = this.coreService.clone(this.calendar.frequencyList[i].days);
      this.frequency.all = this.calendar.frequencyList[i].days.length === 7;
      if (this.calendar.frequencyList[i].startingWithW)
        this.frequency.startingWithW = moment(this.calendar.frequencyList[i].startingWithW).format(this.dateFormatM);
      if (this.calendar.frequencyList[i].endOnW)
        this.frequency.endOnW = moment(this.calendar.frequencyList[i].endOnW).format(this.dateFormatM);
    }
    if (this.calendar.frequencyList[i].tab == 'every') {
      if (this.calendar.frequencyList[i].startingWith)
        this.frequency.startingWith = moment(this.calendar.frequencyList[i].startingWith).format(this.dateFormatM);
      if (this.calendar.frequencyList[i].endOn)
        this.frequency.endOn = moment(this.calendar.frequencyList[i].endOn).format(this.dateFormatM);
    }
    if (this.calendar.frequencyList[i].tab == 'specificWeekDays') {
      if (this.calendar.frequencyList[i].startingWithS)
        this.frequency.startingWithS = moment(this.calendar.frequencyList[i].startingWithS).format(this.dateFormatM);
      if (this.calendar.frequencyList[i].endOnS)
        this.frequency.endOnS = moment(this.calendar.frequencyList[i].endOnS).format(this.dateFormatM);
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

  changeFrequencyObj(data) {
    if (!data) {
      data = 'all';
    }
    let obj = {};
    this.freqObj(data, obj);
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
                this.calendar.frequencyList[i].startingWithW = this.coreService.clone(this.frequency.startingWithW);
                this.calendar.frequencyList[i].endOnW = this.coreService.clone(this.frequency.endOnW);
                this.calendar.frequencyList[i].str = this.coreService.clone(this.frequency.str);
                flag1 = true;
                break;
              } else {
                if (this.calendar.frequencyList[i].months)
                  if (_.isEqual(this.calendar.frequencyList[i].days, this.frequency.days)) {
                    for (let j = 0; j < this.frequency.months.length; j++) {
                      if (this.calendar.frequencyList[i].months.indexOf(this.frequency.months[j]) == -1)
                        this.calendar.frequencyList[i].months.push(this.frequency.months[j]);
                    }
                    this.calendar.frequencyList[i].str = this.coreService.clone(this.frequency.str);
                    flag1 = true;
                    break;
                  }
              }
            } else {
              if (!this.calendar.frequencyList[i].months) {
                this.calendar.frequencyList[i].days = this.coreService.clone(this.frequency.days);
                this.calendar.frequencyList[i].startingWithM = this.coreService.clone(this.frequency.startingWithW);
                this.calendar.frequencyList[i].endOnW = this.coreService.clone(this.frequency.endOnW);
                this.calendar.frequencyList[i].str = this.coreService.clone(this.frequency.str);
                flag1 = true;
                break;
              }
            }
          } else if (this.frequency.tab == 'monthDays' && this.frequency.isUltimos == 'months' && this.calendar.frequencyList[i].isUltimos == 'months') {
            if (this.frequency.months && this.frequency.months.length > 0) {
              if (this.frequency.months == this.calendar.frequencyList[i].months || _.isEqual(this.calendar.frequencyList[i].months, this.frequency.months)) {
                this.calendar.frequencyList[i].selectedMonths = this.coreService.clone(this.frequency.selectedMonths);
                this.calendar.frequencyList[i].startingWithM = this.coreService.clone(this.frequency.startingWithM);
                this.calendar.frequencyList[i].endOnM = this.coreService.clone(this.frequency.endOnM);
                this.calendar.frequencyList[i].str = this.coreService.clone(this.frequency.str);
                flag1 = true;
                break;
              } else {
                if (this.calendar.frequencyList[i].months)
                  if (_.isEqual(this.calendar.frequencyList[i].selectedMonths, this.frequency.selectedMonths)) {
                    for (let j = 0; j < this.frequency.months.length; j++) {
                      if (this.calendar.frequencyList[i].months.indexOf(this.frequency.months[j]) == -1)
                        this.calendar.frequencyList[i].months.push(this.frequency.months[j]);
                    }
                    this.calendar.frequencyList[i].str = this.coreService.clone(this.frequency.str);
                    flag1 = true;
                    break;
                  }
              }
            } else {
              if (!this.calendar.frequencyList[i].months) {
                this.calendar.frequencyList[i].selectedMonths = this.coreService.clone(this.frequency.selectedMonths);
                this.calendar.frequencyList[i].startingWithM = this.coreService.clone(this.frequency.startingWithM);
                this.calendar.frequencyList[i].endOnM = this.coreService.clone(this.frequency.endOnM);
                this.calendar.frequencyList[i].str = this.coreService.clone(this.frequency.str);
                flag1 = true;
                break;
              }
            }
          } else if (this.frequency.tab == 'monthDays' && this.frequency.isUltimos != 'months' && this.calendar.frequencyList[i].isUltimos !== 'months') {
            if (this.frequency.months && this.frequency.months.length > 0) {
              if (this.frequency.months == this.calendar.frequencyList[i].months || _.isEqual(this.calendar.frequencyList[i].months, this.frequency.months)) {
                this.calendar.frequencyList[i].selectedMonthsU = this.coreService.clone(this.frequency.selectedMonthsU);
                this.calendar.frequencyList[i].startingWithM = this.coreService.clone(this.frequency.startingWithM);
                this.calendar.frequencyList[i].endOnM = this.coreService.clone(this.frequency.endOnM);
                this.calendar.frequencyList[i].str = this.coreService.clone(this.frequency.str);
                flag1 = true;
                break;
              } else {
                if (this.calendar.frequencyList[i].months)
                  if (_.isEqual(this.calendar.frequencyList[i].selectedMonthsU, this.frequency.selectedMonthsU)) {
                    for (let j = 0; j < this.frequency.months.length; j++) {
                      if (this.calendar.frequencyList[i].months.indexOf(this.frequency.months[j]) == -1)
                        this.calendar.frequencyList[i].months.push(this.frequency.months[j]);
                    }
                    this.calendar.frequencyList[i].str = this.coreService.clone(this.frequency.str);
                    flag1 = true;
                    break;
                  }
              }
            } else {
              if (!this.calendar.frequencyList[i].months) {
                this.calendar.frequencyList[i].selectedMonthsU = this.coreService.clone(this.frequency.selectedMonthsU);
                this.calendar.frequencyList[i].startingWithM = this.coreService.clone(this.frequency.startingWithM);
                this.calendar.frequencyList[i].endOnM = this.coreService.clone(this.frequency.endOnM);
                this.calendar.frequencyList[i].str = this.coreService.clone(this.frequency.str);

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
            this.calendar.frequencyList[i].str = this.coreService.clone(this.frequency.str);
            flag1 = true;
            break;
          } else if (this.frequency.tab == 'every') {
            if (_.isEqual(this.frequency.dateEntity, this.calendar.frequencyList[i].dateEntity) && _.isEqual(this.frequency.startingWith, this.calendar.frequencyList[i].startingWith)) {
              this.calendar.frequencyList[i].str = this.calendarService.freqToStr(this.frequency, this.dateFormat);
              this.calendar.frequencyList[i].interval = this.coreService.clone(this.frequency.interval);
              this.calendar.frequencyList[i].str = this.coreService.clone(this.frequency.str);
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

  changeDate() {
    let newDate = new Date();
    newDate.setHours(0, 0, 0, 0);
    let toDate: any;
    if (new Date(this.toDate).getTime() > new Date(this.calendarTitle + '-12-31').getTime()) {
      toDate = this.calendarTitle + '-12-31';
    } else {
      toDate = this.toDate;
    }

    if (newDate.getFullYear() < this.calendarTitle && (new Date(this.calendarTitle + '-01-01').getTime() < new Date(toDate).getTime())) {
      this.planItems = [];
      let obj = {
        jobschedulerId: this.schedulerId,
        dateFrom: this.calendarTitle + '-01-01',
        dateTo: toDate,
        calendar: this.frequencyObj
      };
      this.isCalendarLoading = true;

      this.coreService.post('inventory/calendar/dates', obj).subscribe((result: any) => {
        let color = '#007da6';
        if (this.calObj.frequency && this.calObj.frequency != 'all' && this.calObj.frequency.type == 'EXCLUDE') {
          color = '#eb8814';
        }
        for (let i = 0; i < result.dates.length; i++) {
          let x = result.dates[i];
          let obj = {
            startDate: moment(x),
            endDate: moment(x),
            color: color
          };

          this.planItems.push(obj);
        }
        for (let i = 0; i < result.withExcludes.length; i++) {
          let x = result.withExcludes[i];
          this.planItems.push({
            startDate: moment(x),
            endDate: moment(x),
            color: '#eb8814'
          });
        }

        this.isCalendarLoading = false;
        $('#full-calendar').data('calendar').setDataSource(this.planItems);
      }, () => {
        this.isCalendarLoading = false;
      });
    } else if (newDate.getFullYear() == this.calendarTitle) {
      this.planItems = this.coreService.clone(this.tempList);
    }
  }

  showCalendar(data) {
    this.calendarTitle = new Date().getFullYear();
    this.frequencyList1 = [];
    if (this.calendar.configuration.includesFrequency.length > 0) {
      for (let i = 0; i < this.calendar.configuration.includesFrequency.length; i++) {
        this.frequencyList1.push(this.calendar.configuration.includesFrequency[i]);
      }
    }
    if (this.calendar.configuration.excludesFrequency.length > 0) {
      for (let i = 0; i < this.calendar.configuration.excludesFrequency.length; i++) {
        this.frequencyList1.push(this.calendar.configuration.excludesFrequency[i]);
      }
    }
    this.changeFrequencyObj(data);
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

  private freqObj(data, obj) {
    this.isCalendarLoading = true;

    this.planItems = [];

    obj.jobschedulerId = this.schedulerId;
    obj.calendar = {};

    if (data && !_.isEmpty(data) && data != 'all') {
      if (data.tab == 'weekDays') {
        if (data.startingWithW) {
          obj.dateFrom = moment(data.startingWithW).format('YYYY-MM-DD');
        }
        if (data.endOnW) {
          obj.dateTo = moment(data.endOnW).format('YYYY-MM-DD');
        }
      } else if (data.tab == 'specificWeekDays') {
        if (data.startingWithS) {
          obj.dateFrom = moment(data.startingWithS).format('YYYY-MM-DD');
        }
        if (data.endOnS) {
          obj.dateTo = moment(data.endOnS).format('YYYY-MM-DD');
        }
      } else if (data.tab == 'monthDays') {
        if (data.startingWithM) {
          obj.dateFrom = moment(data.startingWithM).format('YYYY-MM-DD');
        }
        if (data.endOnM) {
          obj.dateTo = moment(data.endOnM).format('YYYY-MM-DD');
        }
      } else if (data.tab == 'every') {
        if (data.startingWith) {
          obj.dateFrom = moment(data.startingWith).format('YYYY-MM-DD');
        }
        if (data.endOn) {
          obj.dateTo = moment(data.endOn).format('YYYY-MM-DD');
        }
      }
    }
    if (!obj.dateFrom && this.calendar.configuration.from) {
      obj.dateFrom = moment(this.calendar.configuration.from, this.dateFormatM).format('YYYY-MM-DD') || moment().format('YYYY-MM-DD');
    }
    if (!obj.dateTo) {
      obj.dateTo = moment(this.calendar.configuration.to, this.dateFormatM).format('YYYY-MM-DD');
      this.toDate = this.coreService.clone(obj.dateTo);
      if (new Date(obj.dateTo).getTime() > new Date(this.calendarTitle + '-12-31').getTime()) {
        obj.dateTo = this.calendarTitle + '-12-31';
      }
    }

    if (data && !_.isEmpty(data) && data != 'all') {
      this.editor.showYearView = true;
      this.calObj.frequency = JSON.stringify(data);
      let obj1 = {
        includes: {}
      };

      let data1 = this.coreService.clone(data);
      data1.type = 'INCLUDE';

      this.frequencyObj = this.calendarService.generateCalendarObj(data1, obj1);
    } else {
      this.calObj.frequency = 'all';
      this.frequencyObj = this.generateCalendarAllObj();
    }

    obj.calendar = this.frequencyObj;

    let result: any;
    this.coreService.post('inventory/calendar/dates', obj).subscribe((res) => {
      result = res;
      let color = '#007da6';
      if (data && data.type == 'EXCLUDE') {
        color = '#eb8814';
      }
      this.planItems = [];
      for (let m = 0; m < result.dates.length; m++) {
        let x = result.dates[m];
        this.planItems.push({
          startDate: moment(x),
          endDate: moment(x),
          color: color
        });
      }
      for (let m = 0; m < result.withExcludes.length; m++) {
        let x = result.withExcludes[m];
        this.planItems.push({
          startDate: moment(x),
          endDate: moment(x),
          color: '#eb8814'
        });
      }
      if ($('#full-calendar') && $('#full-calendar').data('calendar')) {

      } else {
        $('#full-calendar').calendar({
          clickDay: (e) => {
            this.checkDate(e.date);
          },
          renderEnd: (e) => {
            this.calendarTitle = e.currentYear;
            if (this.isCalendarDisplay) {
              this.changeDate();
            }
          }
        });
      }
      this.tempList = [];
      this.tempList = this.coreService.clone(this.planItems);
      let a = Object.assign(this.tempList);
      $('#full-calendar').data('calendar').setDataSource(a);

      this.isCalendarLoading = false;
      setTimeout(() => {
        this.isCalendarDisplay = true;
      }, 100);

    }, () => {
      this.isCalendarLoading = false;

    });
  }

  private generateCalendarAllObj() {
    let obj = {includes: {}, excludes: {}};
    if (this.calendar.configuration.includesFrequency.length > 0) {
      for (let i = 0; i < this.calendar.configuration.includesFrequency.length; i++) {
        this.calendarService.generateCalendarObj(this.calendar.configuration.includesFrequency[i], obj);
      }
    }
    if (this.calendar.configuration.excludesFrequency.length > 0) {
      for (let i = 0; i < this.calendar.configuration.excludesFrequency.length; i++) {
        this.calendarService.generateCalendarObj(this.calendar.configuration.excludesFrequency[i], obj);
      }
    }
    return obj;
  }
}

@Component({
  selector: 'app-run-time',
  templateUrl: './run-time-dialog.html',
})
export class RunTimeEditorComponent implements OnInit, OnDestroy {
  @Input() runTimeJSON: any;
  @Input() preferences: any;
  @Input() permission: any;
  @Input() schedulerId: any;
  editor: any = {};
  runTime1: any = {};
  calendarObj: any = {};
  tempRunTime: any = {};
  _tempFrequency: any = {};
  updateTime: any = {};
  jsonObj: any = {run_time: {}};
  viewCalObj: any = {};
  tempPeriod: any = {};
  selectedMonths: any = [];
  selectedMonthsU: any = [];
  runtimeList: any = [];
  holidayCalendar: any = [];
  planItems: any = [];
  periodList: any = [];
  tempItems: any = [];
  calPeriod: any = [];
  tempList: any = [];
  selectedCalendar: any = [];
  zones = moment.tz.names();
  str: string;
  isDelete = false;
  showMonthRange = false;
  isCalendarLoading: boolean;
  isCalendarDisplay: boolean;
  firstDay: any;
  lastDay: any;
  toDate: any;
  calendarTitle = new Date().getFullYear();
  _tempPeriod: any;
  runTime: any = {};
  run_time: any = {};
  runTimeVar: any = {
    months: [],
    weekdays: {days: []},
    monthdays: {days: []},
    ultimos: {days: []}
  };

  constructor(private coreService: CoreService, public modalService: NgbModal, private calendarService: CalendarService) {

  }

  ngOnInit(): void {
    this.jsonObj.run_time = this.coreService.clone(this.runTimeJSON.runTime);
    if (this.jsonObj.run_time && !this.jsonObj.run_time.timeZone) {
      this.jsonObj.run_time.timeZone = this.preferences.zone;
    }
    this.getXml2Json(this.coreService.clone(this.jsonObj), false);
    this.editor.when_holiday_options = [
      'previous_non_holiday',
      'next_non_holiday',
      'suppress',
      'ignore_holiday'
    ];
  }

  changeFrequency1(str) {
    this.runTime.tab = str;
    if (this.runTime.tab === 'monthDays' && !this.runTime.isUltimos) {
      this.runTime.isUltimos = 'months';
    } else if (str === 'specificDays') {
      this.initSpecificDayCalendar();
    }
  }

  onFrequencyChange() {
    if (this.runTime) {
      if (!this.runTime.isUltimos) {
        this.runTime.isUltimos = 'months';
      }
      if (this.runTime.tab == 'monthDays') {
        if (this.runTime.isUltimos != 'months') {
          this.str = 'label.ultimos';
        } else {
          this.str = 'label.monthDays';
        }
      } else {
        if (this.runTime.tab == 'specificWeekDays') {
          this.str = 'label.specificWeekDays';
        } else if (this.runTime.tab == 'specificDays') {
          this.str = 'label.specificDays';
        } else if (this.runTime.tab == 'weekDays') {
          this.str = 'label.weekDays';
        } else if (this.runTime.tab == 'every') {
          this.str = 'label.every';
        }
      }

      if (this.runTime.tab == 'specificWeekDays') {
        this.editor.isEnable = !!(this.runTime.specificWeekDay && this.runTime.which);
      } else if (this.runTime.tab == 'monthDays') {
        if (this.runTime.isUltimos == 'months') {
          this.editor.isEnable = this.selectedMonths.length != 0;
        } else {
          this.editor.isEnable = this.selectedMonthsU.length != 0;
        }

      } else if (this.runTime.tab == 'every') {
        this.editor.isEnable = !!(this.runTime.interval && this.runTime.dateEntity);
      } else if (this.runTime.tab == 'weekDays') {
        this.editor.isEnable = this.runTime.days && this.runTime.days.length > 0;
      } else if (this.runTime.tab == 'specificDays') {
        this.editor.isEnable = this.tempItems.length > 0;
      }
    }
  }

  changeFrequency() {
    let temp = this.coreService.clone(this.runTime.period) || {};
    this.runTime.period = {};
    this.runTime.period.whenHoliday = temp.whenHoliday;
    if (this.runTime.frequency === 'singleStart') {
      this.runTime.period.singleStart = '00:00:00';
      delete this.runTime.period.absoluteRepeat;
      delete this.runTime.period.repeat;
      delete this.runTime.period.begin;
      delete this.runTime.period.end;
    } else if (this.runTime.frequency === 'repeat') {
      delete this.runTime.period.singleStart;
      delete this.runTime.period.absoluteRepeat;
      this.runTime.period.repeat = '00:00:00';
      this.runTime.period.begin = '00:00:00';
      this.runTime.period.end = '24:00:00';
    } else if (this.runTime.frequency === 'absoluteRepeat') {
      delete this.runTime.period.singleStart;
      delete this.runTime.period.repeat;
      this.runTime.period.absoluteRepeat = '00:00:00';
      this.runTime.period.begin = '00:00:00';
      this.runTime.period.end = '24:00:00';
    }
  }

  onChangeDays() {
    if (this.runTime.days) {
      this.editor.isEnable = this.runTime.days.length > 0;
      this.runTime.all = this.runTime.days.length == 7;
      this.runTime.days.sort();
    }
  }

  onChangeMonths() {
    if (this.runTime.months) {
      this.runTime.allMonth = this.runTime.months.length == 12;
      this.runTime.months.sort((a, b) => {
        return a - b;
      });
    }
  }

  removeTimeZone() {
    this.runTime1.timeZone = '';
    this.getXml2Json(this.coreService.clone(this.jsonObj), true);
  }

  createNewRunTime() {
    this.editor.hidePervious = true;
    this.editor.create = true;
    this.editor.update = false;
    this.periodList = [];
    this.selectedMonths = [];
    this.selectedMonthsU = [];
    this.runTime = {};
    this.runTime.period = {};
    this.runTime.period.whenHoliday = 'suppress';
    this.runTime.tab = 'weekDays';
    this.runTime.isUltimos = 'months';
    this.runTime.frequency = 'singleStart';
    this.runTime.period.singleStart = '00:00:00';
  }

  createRunTime(timeZone) {
    if (this.editor.isEnable && this.editor.create && !this.isDelete) {
      let flg = false, isPeriodEmpty = false;
      if (this.runTime.period) {
        let temp = this.coreService.clone(this.runTime.period);
        delete temp['whenHoliday'];
        if (_.isEmpty(temp)) {
          isPeriodEmpty = true;
        }
      }
      if (this.runTime.period && !isPeriodEmpty) {
        if (this.runTime.frequency === 'repeat' || this.runTime.frequency === 'absoluteRepeat') {
          flg = !!this.runTime.period.begin;
          flg = !!this.runTime.period.end;
        }
        if (this.runTime.frequency === 'singleStart' && this.runTime.period.singleStart) {
          flg = true;
        } else if (this.runTime.frequency === 'repeat' && this.runTime.period.repeat) {
          flg = true;
        } else flg = !!(this.runTime.frequency === 'absoluteRepeat' && this.runTime.period.absoluteRepeat);
        if (!flg) {
          flg = true;
          this.periodList.forEach((list) => {
            if (list.tab === this.runTime.tab) {
              if ((this.runTime.days || this.runTime.selectedMonths || this.runTime.selectedMonthsU) &&
                (_.isEqual(list.days, this.runTime.days) || _.isEqual(list.selectedMonths, this.runTime.selectedMonths) || _.isEqual(list.selectedMonthsU, this.runTime.selectedMonthsU))) {
                if (list.months && this.runTime.months) {
                  if (_.isEqual(list.months, this.runTime.months))
                    flg = false;
                } else {
                  flg = false;
                }
              } else if (this.runTime.specificWeekDay && this.runTime.which && (list.specificWeekDay == this.runTime.specificWeekDay && list.which == this.runTime.which)) {
                flg = false;
              } else if (this.runTime.date && (list.dates == this.runTime.date)) {
                flg = false;
              }
            }
          });
        }
      }
      if (flg || this.periodList.length === 0) {
        this.addPeriod();
      }
    }

    if (!_.isEmpty(this._tempFrequency)) {
      if (this.runTime.tab === 'specificDays') {
        if (this.tempItems.length > 0) {
          for (let t = 0; t < this.tempItems.length; t++) {
            this.runTime.date = this.tempItems[t].date;
            this.periodList.forEach((list) => {
              this.runTime.period = list.period;
              this.tempRunTime = this.calendarService.checkPeriodList(this.runTimeVar, this.runTime,
                this.selectedMonths, this.selectedMonthsU);
            });
          }
        } else {
          this.runTime.date = null;
          this.periodList.forEach((list) => {
            this.runTime.period = list.period;
            this.tempRunTime = this.calendarService.checkPeriodList(this.runTimeVar,
              this.runTime, this.selectedMonths, this.selectedMonthsU);
          });
        }
      } else {
        this.periodList.forEach((list) => {
          this.runTime.period = list.period;
          this.tempRunTime = this.calendarService.checkPeriodList(this.runTimeVar,
            this.runTime, this.selectedMonths, this.selectedMonthsU);
        });
      }
    }

    this._tempFrequency = {};
    this.periodList = [];
    this.editor.hidePervious = false;
    this.editor.create = false;
    this.editor.update = false;

    if (_.isEmpty(this.tempRunTime)) {
      if (_.isEmpty(this.runTimeVar)) {
        let _json = this.jsonObj;
        this.runTimeVar = _json.run_time;
      }
      this.tempRunTime = this.runTimeVar;
    }

    this.run_time = this.tempRunTime;
    if (this.runTime1.timeZone && timeZone) {
      this.run_time.timeZone = this.runTime1.timeZone;
    }

    if (this.runTime1.dates && this.runTime1.dates.date) {
      this.run_time.dates = [
        {date: moment(this.runTime1.dates.date).format('YYYY-MM-DD')}
      ];
    }

    if (!_.isEmpty(this.run_time.dates)) {
      if (!(this.run_time.dates && (this.run_time.dates.length > 0))) {
        delete this.run_time['dates'];
      }
    } else {
      delete this.run_time['date'];
    }
    if (!_.isEmpty(this.run_time.weekdays)) {
      if (!(this.run_time.weekdays.days && (this.run_time.weekdays.days.length > 0 || this.run_time.weekdays.days.day))) {
        delete this.run_time['weekdays'];
      }
    } else {
      delete this.run_time['weekdays'];
    }

    if (!_.isEmpty(this.run_time.monthdays)) {
      if (!(this.run_time.monthdays.weekdays && this.run_time.monthdays.weekdays.length > 0)) {
        delete this.run_time.monthdays['weekdays'];
      }
      if (!(this.run_time.monthdays.days && (this.run_time.monthdays.days.length > 0 || this.run_time.monthdays.days.day))) {
        if (!this.run_time.monthdays.weekdays) {
          delete this.run_time['monthdays'];
        } else {
          if (this.run_time.monthdays.days) {
            if (this.run_time.monthdays.days.length == 0 && this.run_time.monthdays.weekdays.length == 0) {
              delete this.run_time['monthdays'];
            } else if (this.run_time.monthdays.days.length == 0) {
              delete this.run_time.monthdays['days'];
            }
          }
        }
      }
    } else {
      delete this.run_time['monthdays'];
    }

    if (!_.isEmpty(this.run_time.ultimos)) {
      if (!(this.run_time.ultimos.days && (this.run_time.ultimos.days.length > 0 || this.run_time.ultimos.days.day))) {
        delete this.run_time['ultimos'];
      }
    } else {
      delete this.run_time['ultimos'];
    }

    if (!_.isEmpty(this.run_time.months)) {
      if (!(this.run_time.months.length > 0 || this.run_time.months.month)) {
        delete this.run_time['months'];
      }
    } else {
      delete this.run_time['months'];
    }
    this.runTimeVar = {months: [], weekdays: {days: []}, monthdays: {days: []}, ultimos: {days: []}};
    this.tempRunTime = {};
    this.selectedMonths = [];
    this.selectedMonthsU = [];
    this.editor.isEnable = false;
    this.getXml2Json(this.coreService.clone({run_time: this.run_time}), false);
  }

  editRunTime(data) {
    this.updateTime = this.coreService.clone(data);
    this._tempFrequency = this.coreService.clone(data);
    console.log(data, '<><><>')
    this.periodList = [];
    this.editor.hidePervious = true;
    this.editor.create = false;
    this.editor.update = true;
    this.str = this.updateTime.frequency;
    this.runTime = {};
    let runTime: any = {};
    this.selectedMonths = [];
    this.selectedMonthsU = [];
    if (!_.isEmpty(this.updateTime.obj) && _.isArray(this.updateTime.obj)) {
      if (this.updateTime.type === 'date') {
        runTime.tab = 'specificDays';
        runTime.date = new Date(this.updateTime.obj[0].date);
      } else if (this.updateTime.type === 'weekdays') {
        runTime.tab = 'weekDays';
        if (_.isArray(this.updateTime.obj[0].day)) {
          runTime.days = this.updateTime.obj[0].day;
        } else {
          runTime.days = this.updateTime.obj[0].day.split(' ').sort();
        }
      } else if (this.updateTime.type === 'monthdays') {
        runTime.tab = 'monthDays';
        runTime.isUltimos = 'months';
        this.updateTime.obj[0].day.split(' ').sort(this.calendarService.compareNumbers).forEach((val) => {
          this.selectMonthDaysFunc(val);
        });
      } else if (this.updateTime.type === 'weekday') {
        runTime.tab = 'specificWeekDays';
        runTime.specificWeekDay = this.updateTime.obj[0].day;
        runTime.which = this.updateTime.obj[0].which;
        if (runTime.which) {
          runTime.which = runTime.which.toString();
        }
      } else if (this.updateTime.type === 'ultimos') {
        runTime.isUltimos = 'ultimos';
        runTime.tab = 'monthDays';
        this.updateTime.obj[0].day.split(' ').sort(this.calendarService.compareNumbers).forEach((val) => {
          this.selectMonthDaysUFunc(val);
        });
      } else if (this.updateTime.type === 'month') {
        runTime.tab = 'weekDays';
        runTime.months = this.updateTime.obj[0].month.split(' ').sort(this.calendarService.compareNumbers);
        this.showMonthRange = true;
        if (this.updateTime.type2 === 'weekdays') {
          runTime.tab = 'weekDays';
          runTime.days = this.updateTime.obj[0].day.split(' ').sort();
        } else if (this.updateTime.type2 === 'monthdays') {
          runTime.tab = 'monthDays';
          runTime.isUltimos = 'months';
          this.updateTime.obj[0].day.split(' ').sort(this.calendarService.compareNumbers).forEach((val) => {
            this.selectMonthDaysFunc(val);
          });
        } else if (this.updateTime.type2 === 'weekday') {
          runTime.tab = 'specificWeekDays';
          runTime.specificWeekDay = this.updateTime.obj[0].day;
          runTime.which = this.updateTime.obj[0].which;
          if (runTime.which) {
            runTime.which = runTime.which.toString();
          }
        } else if (this.updateTime.type2 === 'ultimos') {
          runTime.tab = 'monthDays';
          runTime.isUltimos = 'ultimos';
          this.updateTime.obj[0].day.split(' ').sort(this.calendarService.compareNumbers).forEach((val) => {
            this.selectMonthDaysUFunc(val);
          });
        }
      }

      runTime.period = {};
      this.updateTime.obj.forEach((value) => {
        let obj: any = {};
        if (this.updateTime.type2) {
          obj.tab = this.updateTime.type2 == 'weekdays' ? 'weekDays' : this.updateTime.type2 == 'monthdays' ? 'monthDays' : this.updateTime.type2 == 'weekday' ? 'specificWeekDays' : this.updateTime.type2 == 'ultimos' ? 'monthDays' : 'specificDays';
        } else {
          obj.tab = this.updateTime.type == 'weekdays' ? 'weekDays' : this.updateTime.type == 'monthdays' ? 'monthDays' : this.updateTime.type == 'weekday' ? 'specificWeekDays' : this.updateTime.type == 'ultimos' ? 'monthDays' : 'specificDays';
        }

        if (this.updateTime.type == 'ultimos' || this.updateTime.type2 == 'ultimos') {
          obj.isUltimos = 'ultimos';
        } else {
          obj.isUltimos = 'months';
        }
        obj.period = {};
        if (value.periods && value.periods.length > 0) {
          let p = _.isArray(value.periods) ? value.periods[0] : value.periods;
          if (p.singleStart) {
            obj.frequency = 'singleStart';
            obj.period.singleStart = p.singleStart;
          } else if (p.absoluteRepeat) {
            obj.frequency = 'absoluteRepeat';
            obj.period.absoluteRepeat = p.absoluteRepeat;
          } else if (p.repeat) {
            obj.frequency = 'repeat';
            obj.period.repeat = p.repeat;
          }
          if (p.begin) {
            obj.period.begin = p.begin;
          }
          if (p.end) {
            obj.period.end = p.end;
          }
          if (p.whenHoliday) {
            obj.period.whenHoliday = p.whenHoliday;
          }
        }


        if (obj.tab == 'weekDays') {
          obj.days = value.day.toString().split(' ').sort();
        } else if (obj.tab == 'monthDays') {
          if (obj.isUltimos == 'months') {
            obj.selectedMonths = value.day.toString().split(' ').sort(this.calendarService.compareNumbers);
          } else
            obj.selectedMonthsU = value.day.toString().split(' ').sort(this.calendarService.compareNumbers);
        } else if (obj.tab == 'specificWeekDays') {
          obj.specificWeekDay = value.day;
          obj.which = value.which;
          if (obj.which) {
            obj.which = obj.which.toString();
          }
        } else if (obj.tab == 'specificDays') {
          obj.date = new Date(value.date);
        }
        if (value.month) {
          obj.months = value.month.toString().split(' ').sort(this.calendarService.compareNumbers);
        }
        obj.str = this.frequencyToString(obj);
        this.periodList.push(obj);
      });
    }
    if (!_.isEmpty(this._tempFrequency)) {
      if (this._tempFrequency.type == 'date') {
        if (_.isArray(this.runTimeVar.dates)) {
          this.runTimeVar.dates.forEach((res1, index) => {
            if (_.isEqual(res1.date, this._tempFrequency.obj[0].date)) {
              this.runTimeVar.dates.splice(index, 1);
            }
          });
        } else {
          if (_.isEqual(this.runTimeVar.dates.date, this._tempFrequency.obj[0].date)) {
            delete this.runTimeVar['date'];
          }

        }
      } else if (this._tempFrequency.type == 'weekdays') {
        if (this.runTimeVar.weekdays) {
          if (_.isArray(this.runTimeVar.weekdays.days)) {
            this.runTimeVar.weekdays.days.forEach((res1, index) => {
              if (_.isEqual(res1.day, this._tempFrequency.obj[0].day)) {
                this.runTimeVar.weekdays.days.splice(index, 1);
              }
            });
          } else {
            if (_.isEqual(this.runTimeVar.weekdays.days.day, this._tempFrequency.obj[0].day)) {
              delete this.runTimeVar['weekdays'];
            }

          }
        }
      } else if (this._tempFrequency.type == 'monthdays') {
        if (this.runTimeVar.monthdays) {
          if (_.isArray(this.runTimeVar.monthdays.days)) {
            this.runTimeVar.monthdays.days.forEach((res1, index) => {
              if (_.isEqual(res1.day, this._tempFrequency.obj[0].day)) {
                this.runTimeVar.monthdays.days.splice(index, 1);
              }
            });
          } else {
            if (_.isEqual(this.runTimeVar.monthdays.days.day, this._tempFrequency.obj[0].day)) {
              delete this.runTimeVar.monthdays['days'];
            }
          }
        }

      } else if (this._tempFrequency.type == 'weekday') {
        if (this.runTimeVar.monthdays) {
          if (this.runTimeVar.monthdays.weekdays && this.runTimeVar.monthdays.weekdays.length > 0) {
            this.runTimeVar.monthdays.weekdays.forEach((res1) => {
              if (!_.isArray(res1)) {
                if (_.isEqual(res1.which, this._tempFrequency.obj[0].which) && _.isEqual(res1.day, this._tempFrequency.obj[0].day)) {
                  delete this.runTimeVar.monthdays['weekdays'];
                }
              }
            });
          }
        }
      } else if (this._tempFrequency.type == 'ultimos') {
        if (this.runTimeVar.ultimos) {
          if (_.isArray(this.runTimeVar.ultimos.days)) {
            this.runTimeVar.ultimos.days.forEach((res1, index) => {
              if (_.isEqual(res1.day, this._tempFrequency.obj[0].day)) {
                this.runTimeVar.ultimos.days.splice(index, 1);
              }
            });
          } else {
            if (_.isEqual(this.runTimeVar.ultimos.days.day, this._tempFrequency.obj[0].day)) {
              delete this.runTimeVar['ultimos'];
            }
          }
        }
      } else if (this._tempFrequency.type == 'month') {
        if (this._tempFrequency.type2 == 'weekdays') {
          if (_.isArray(this.runTimeVar.months)) {
            this.runTimeVar.months.forEach((res) => {
              if (_.isEqual(res.month, this._tempFrequency.obj[0].month)) {
                if (res.weekdays) {
                  if (_.isArray(res.weekdays.days)) {
                    res.weekdays.days.forEach((res1, index) => {
                      if (_.isEqual(res1.day, this._tempFrequency.obj[0].day)) {
                        res.weekdays.days.splice(index, 1);
                      }
                    });
                  } else {
                    if (_.isEqual(res.weekdays.days.day, this._tempFrequency.obj[0].day)) {
                      delete res['weekdays'];
                    }
                  }
                }
              }
            });
          }
        } else if (this._tempFrequency.type2 === 'monthdays') {
          if (_.isArray(this.runTimeVar.months)) {
            this.runTimeVar.months.forEach((res, i) => {
              if (_.isEqual(res.month, this._tempFrequency.obj[0].month)) {
                if (res.monthdays) {
                  if (_.isArray(res.monthdays.days)) {
                    res.monthdays.days.forEach((res1, index) => {
                      if (_.isEqual(res1.day, this._tempFrequency.obj[0].day)) {
                        res.monthdays.days.splice(index, 1);
                      }
                    });
                  } else {
                    if (_.isEqual(res.monthdays.days.day, this._tempFrequency.obj[0].day)) {
                      delete res.monthdays['days'];
                    }
                  }
                }
              }
            });
          }
        } else if (this._tempFrequency.type2 === 'weekday') {
          if (_.isArray(this.runTimeVar.months)) {
            this.runTimeVar.months.forEach((res) => {
              if (_.isEqual(res.month, this._tempFrequency.obj[0].month)) {
                if (res.monthdays) {
                  if (_.isArray(res.monthdays.weekdays)) {
                    res.monthdays.weekdays.forEach((res1, index) => {
                      if (_.isEqual(res1.day, this._tempFrequency.obj[0].day) && _.isEqual(res1.which, this._tempFrequency.obj[0].which)) {
                        res.monthdays.weekdays.splice(index, 1);
                      }
                    });
                  } else {
                    if (_.isEqual(res.monthdays.weekdays.days, this._tempFrequency.obj[0].day) && _.isEqual(res.monthdays.weekdays.which, this._tempFrequency.obj[0].which)) {
                      delete res.monthdays['weekdays'];
                    }
                  }
                }
              }
            });
          }
        } else if (this._tempFrequency.type2 === 'ultimos') {
          if (_.isArray(this.runTimeVar.months)) {
            this.runTimeVar.months.forEach((res) => {
              if (_.isEqual(res.month, this._tempFrequency.obj[0].month)) {
                if (res.ultimos) {
                  if (_.isArray(res.ultimos.days)) {
                    res.ultimos.days.forEach((res1, index) => {
                      if (_.isEqual(res1.day, this._tempFrequency.obj[0].day)) {
                        res.ultimos.days.splice(index, 1);
                      }
                    });
                  } else {
                    if (_.isEqual(res.ultimos.days.day, this._tempFrequency.obj[0].day)) {
                      delete res['ultimos'];
                    }
                  }
                }
              }
            });
          }
        }
        if (this.runTimeVar.months && _.isArray(this.runTimeVar.months)) {
          this.runTimeVar.months.forEach((month, index) => {
            let flag = false;
            if (!month.weekdays && (!month.monthdays || _.isEmpty(month.monthdays)) && !month.ultimos) {
              flag = true;
            }
            if (flag) {
              this.runTimeVar.months.splice(index, 1);
            }
          });
        }

      }
      if (this.runTimeVar.monthdays && !this.runTimeVar.monthdays.days && !this.runTimeVar.monthdays.weekdays) {
        delete this.runTimeVar['monthdays'];
      }
    }

    setTimeout(() => {
      this.runTime = runTime;
      if (data.type === 'date') {
        this.initSpecificDayCalendar();
      }
    }, 0);
  }

  deleteRunTime(data) {
    let json = this.jsonObj;
    let _json = json.run_time;
    if (!_json) {
      return;
    }
    if (!_.isEmpty(data.obj) && _.isArray(data.obj)) {
      if (data.type == 'date') {
        if (_.isArray(_json.dates)) {
          _json.dates.forEach((val, index) => {
            if (val.date == data.obj[0].date) {
              _json.dates.splice(index, 1);
            }
          });
        } else {
          if (_json.dates.date == data.obj[0].date) {
            delete _json['dates'];
          }
        }
      } else if (data.type == 'weekdays') {
        if (_.isArray(_json.weekdays.days)) {
          _json.weekdays.days.forEach((val, index) => {
            if (val.day == data.obj[0].day) {
              _json.weekdays.days.splice(index, 1);
            }
          });
        } else {
          if (_json.weekdays.days.day == data.obj[0].day) {
            delete _json['weekdays'];
          }
        }
      } else if (data.type == 'monthdays') {
        if (_.isArray(_json.monthdays.days)) {
          _json.monthdays.days.forEach((val, index) => {
            if (val.day == data.obj[0].day) {
              _json.monthdays.days.splice(index, 1);
            }
          });
        } else {
          if (_json.monthdays.days.day == data.obj[0].day) {
            delete _json.monthdays['days'];
          }
        }
      } else if (data.type == 'weekday') {
        if (_.isArray(_json.monthdays.weekdays)) {
          _json.monthdays.weekdays.forEach((val, index) => {
            if (val.day == data.obj[0].day && val.which == data.obj[0].which) {
              _json.monthdays.weekdays.splice(index, 1);
            }
          });
        } else {
          if (_json.monthdays.weekdays.day == data.obj[0].day && _json.monthdays.weekdays.which == data.obj[0].which) {
            delete _json.monthdays['weekdays'];
          }
        }
      } else if (data.type == 'ultimos') {
        if (_.isArray(_json.ultimos.days)) {
          _json.ultimos.days.forEach((val, index) => {
            if (val.day == data.obj[0].day) {
              _json.ultimos.days.splice(index, 1);
            }
          });
        } else {

          if (_json.ultimos.days.day == data.obj[0].day) {
            delete _json['ultimos'];
          }
        }
      } else if (data.type == 'month') {
        if (_.isArray(_json.months)) {
          _json.months.forEach((val1) => {
            if (val1.month == data.obj[0].month) {
              if (data.type2 == 'weekdays') {
                if (_.isArray(val1.weekdays.days)) {
                  val1.weekdays.days.forEach((val, index) => {
                    if (val.day == data.obj[0].day) {
                      val1.weekdays.days.splice(index, 1);
                    }
                  });
                  if (val1.weekdays.days.length === 0) {
                    delete val1.weekdays['days'];
                  }
                }
                if (_.isEmpty(val1.weekdays)) {
                  delete val1['weekdays'];
                }
              } else if (data.type2 == 'monthdays') {
                if (_.isArray(val1.monthdays.days)) {
                  val1.monthdays.days.forEach((val, index) => {
                    if (val.day == data.obj[0].day) {
                      val1.monthdays.days.splice(index, 1);
                    }
                  });
                  if (val1.monthdays.days.length === 0) {
                    delete val1.monthdays['days'];
                  }
                }
              } else if (data.type2 == 'weekday') {
                if (_.isArray(val1.monthdays.weekdays)) {
                  val1.monthdays.weekdays.forEach((val, index) => {
                    if (val.day == data.obj[0].day && val.which == data.obj[0].which) {
                      val1.monthdays.weekdays.splice(index, 1);
                    }
                  });
                  if (val1.monthdays.weekdays.length === 0) {
                    delete val1.monthdays['weekdays'];
                  }
                }

              } else if (data.type2 == 'ultimos') {
                if (_.isArray(val1.ultimos.days)) {
                  val1.ultimos.days.forEach((val, index) => {
                    if (val.day == data.obj[0].day) {
                      val1.ultimos.days.splice(index, 1);
                    }
                  });
                  if (val1.ultimos.days.length === 0) {
                    delete val1.ultimos['days'];
                  }
                }
              }
              if (_.isEmpty(val1.monthdays)) {
                delete val1['monthdays'];
              }
              if (_.isEmpty(val1.ultimos)) {
                delete val1['ultimos'];
              }

              if (val1.ultimos || val1.monthdays || val1.weekdays) {

              } else {
                delete val1['month'];
              }
            }
          });
        }

        if (_json.months && _.isArray(_json.months)) {
          _json.months.forEach((month, index) => {
            let flag = false;
            if (!month.weekdays && (!month.monthdays || _.isEmpty(month.monthdays)) && !month.ultimos) {
              flag = true;
            }
            if (flag) {
              _json.months.splice(index, 1);
            }
          });
        }

        if (_json.months && !_.isArray(_json.months)) {
          if ((!_json.months.monthdays || _.isEmpty(_json.months.monthdays)) && (!_json.months.weekdays || _.isEmpty(_json.months.weekdays)) && (!_json.months.ultimos || _.isEmpty(_json.months.ultimos))) {
            delete _json['months'];
          }
        }
      }

      if (_json.monthdays && !_json.monthdays.weekdays && !_json.monthdays.days) {
        delete _json['monthdays'];
      }
    }

    for (let i = 0; i < this.runtimeList.length; i++) {
      if (this.runtimeList[i] == data) {
        this.runtimeList.splice(i, 1);
        break;
      }
    }

    this.getXml2Json({run_time: _json}, false);
  }

  assignCalendar() {
    const modalRef = this.modalService.open(TreeModalComponent, {
      backdrop: 'static'
    });
    modalRef.componentInstance.schedulerId = this.schedulerId;
    modalRef.componentInstance.type = 'WORKINGDAYSCALENDAR';
    modalRef.componentInstance.object = 'Calendar';
    modalRef.result.then((result) => {
      this.selectedCalendar = this.selectedCalendar.concat(result);
      this.generateCalendarTag(this.selectedCalendar, 'working');
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
      this.holidayCalendar = this.holidayCalendar.concat(result);
      _.unique(this.holidayCalendar);
    }, (reason) => {
      console.log('close...', reason);
    });
  }

  generateCalendarDates(run_time, dates, calendar) {
    let _tempDates = [];
    if (run_time.dates && run_time.dates.length > 0) {
      _tempDates = this.coreService.clone(run_time.dates);
      for (let x = 0; x < _tempDates.length; x++) {
        if (_tempDates[x].calendar == calendar.path) {
          for (let i = 0; i < run_time.dates.length; i++) {
            if (run_time.dates[i].calendar == calendar.path) {
              run_time.dates.splice(i, 1);
              break;
            }

          }
        }
      }
    }

    if (dates && dates.length > 0) {
      dates.forEach((d) => {
        if (run_time.dates) {
          if (!_.isArray(run_time.dates)) {
            let _temp = this.coreService.clone(run_time.dates);
            run_time.dates = [];
            run_time.dates.push(_temp);
          }
          let period: any = [];
          if (_tempDates.length > 0) {
            for (let x = 0; x < _tempDates.length; x++) {
              if (_tempDates[x].calendar == calendar.path) {
                period = _tempDates[x].periods;
                break;
              }
            }
          }
          if (!_.isArray(period)) {
            let _temp = this.coreService.clone(period);
            period = [];
            if (_temp && !_.isEmpty(_temp)) {
              period.push(_temp);
            }
          }

          run_time.dates.push({
            calendar: calendar.path,
            date: d,
            periods: period
          });
        } else {
          run_time.dates = [];
          let obj: any = {
            calendar: calendar.path,
            date: d
          };
          if (_tempDates.length > 0) {
            for (let x = 0; x < _tempDates.length; x++) {
              if (_tempDates[x].calendar == calendar.path) {
                obj.periods = _tempDates[x].periods;
                break;
              }
            }
          }
          run_time.dates.push(obj);
        }
      });
    }
  }

  generateHolidayCalendarDates(run_time, dates, calendar) {
    let _tempDates = [];
    if (run_time.holidays) {
      if (!_.isEmpty(run_time.holidays)) {
        if (run_time.holidays.days && run_time.holidays.days.length > 0) {
          _tempDates = this.coreService.clone(run_time.holidays.days);
          for (let x = 0; x < _tempDates.length; x++) {
            if (_tempDates[x].calendar == calendar.path) {
              for (let i = 0; i < run_time.holidays.days.length; i++) {
                if (run_time.holidays.days[i].calendar == calendar.path) {
                  run_time.holidays.days.splice(i, 1);
                  break;
                }
              }
            }
          }
        }
      }
    } else {
      run_time.holidays = {};
    }
    if (dates.length > 0) {
      dates.forEach((d) => {
        if (!_.isEmpty(run_time.holidays)) {
          if (run_time.holidays.days && _.isArray(run_time.holidays.days)) {

            run_time.holidays.days.push({
              calendar: calendar.path,
              date: moment(d).format('YYYY-MM-DD')
            });
          } else {
            run_time.holidays.days = [];
            run_time.holidays.days.push({
              calendar: calendar.path,
              date: moment(d).format('YYYY-MM-DD')
            });
          }

        } else {
          run_time.holidays.days = [];
          run_time.holidays.days.push({
            calendar: calendar.path,
            date: moment(d).format('YYYY-MM-DD')
          });
        }
      });
    }
  }

  selectMonthDaysFunc(value) {
    if (this.selectedMonths.indexOf(value) == -1) {
      this.selectedMonths.push(value);
    } else {
      this.selectedMonths.splice(this.selectedMonths.indexOf(value), 1);
    }
    this.runTime.selectedMonths = this.coreService.clone(this.selectedMonths);
    this.runTime.selectedMonths.sort();
    this.editor.isEnable = this.selectedMonths.length > 0;
  }

  selectMonthDaysUFunc(value) {
    if (this.selectedMonthsU.indexOf(value) == -1) {
      this.selectedMonthsU.push(value);
    } else {
      this.selectedMonthsU.splice(this.selectedMonthsU.indexOf(value), 1);
    }
    this.runTime.selectedMonthsU = this.coreService.clone(this.selectedMonthsU);
    this.runTime.selectedMonthsU.sort();
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
    if (this.runTime.all) {
      this.runTime.days = ['0', '1', '2', '3', '4', '5', '6'];
      this.editor.isEnable = true;
    } else {
      this.runTime.days = [];
      this.editor.isEnable = false;
    }
  }

  selectAllMonth() {
    if (this.runTime.allMonth) {
      this.runTime.months = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
    } else {
      this.runTime.months = [];
    }
  }

  getXml2Json(json, removeTimeZone) {
    this.runtimeList = [];
    if (_.isEmpty(json)) {
      return;
    }
    this.runTimeVar = json.run_time || {};
    if (removeTimeZone) {
      delete this.runTimeVar['timeZone'];
    } else {
      this.runTime1.timeZone = this.runTimeVar.timeZone;
    }
 console.log(this.runTimeVar, '??????????????????')
    if (this.runTimeVar.dates) {
      this.runTimeVar.dates.forEach((res) => {
        if (res.periods && !_.isArray(res.periods)) {
          res.periods = [res.periods];
        }
        var str = '';
        if (res.date && !res.calendar) {
          str = 'On ' + res.date;
          let periodStrArr = [], objArr = [];
          this._updateperiodObj(res, periodStrArr, objArr, false, null);

          if (objArr.length === 0) {
            objArr.push({
              date: res.date,
              periods: []
            });
          }

          this.runtimeList.push(
            {
              frequency: str,
              period: periodStrArr,
              obj: objArr,
              type: 'date'
            });

        } else if (res.date && res.calendar) {
          if (this.calPeriod && this.calPeriod.length > 0) {
            for (let i = 0; i < this.calPeriod.length; i++) {
              if (res.calendar === this.calPeriod[i].calendar) {
                let flag = false;
                if (res.periods) {
                  res.periods.forEach((period, index) => {
                    if (period && (period.singleStart || period.absoluteRepeat || period.repeat || (period.begin && period.end))) {
                      if (this.calendarService.checkPeriod(period, this.calPeriod[i].period))
                        flag = true;
                    } else {
                      res.periods.splice(index, 1);
                    }
                  });
                  if (!flag && (this.calPeriod[i].period.singleStart || this.calPeriod[i].period.absoluteRepeat || this.calPeriod[i].period.repeat || (this.calPeriod[i].period.begin && this.calPeriod[i].period.end))) {
                    res.periods.push(this.calPeriod[i].period);
                  }
                } else {
                  res.periods = [];
                  if (!flag && (this.calPeriod[i].period.singleStart || this.calPeriod[i].period.absoluteRepeat || this.calPeriod[i].period.repeat || (this.calPeriod[i].period.begin && this.calPeriod[i].period.end)))
                    res.periods.push(this.calPeriod[i].period);
                }
              }
            }

          }
        }
      });
    }
    if (this.selectedCalendar) {
      this.selectedCalendar.forEach((calendar) => {
        let flag = true;
        for (let i = 0; i < this.runtimeList.length; i++) {
          if (this.runtimeList[i].type === 'calendar' && calendar.path === this.runtimeList[i].calendar.path) {
            if ((!calendar.periods || calendar.periods.length === 0) && this.runtimeList[i].period.length === 0) {
              flag = false;
            } else {
              if (calendar.periods) {
                for (let j = 0; j < calendar.periods.length; j++) {
                  for (let m = 0; m < this.runtimeList[i].obj.length; m++) {
                    if (JSON.stringify(calendar.periods[j].periods) === JSON.stringify(this.runtimeList[i].obj[m].periods)) {
                      flag = false;
                      break;
                    }
                  }
                }
              }
            }
            break;
          }
        }

        if (flag) {
          var periodStrArr = [], objArr = [];
          this._updateperiodObj(calendar, periodStrArr, objArr, false, null);
          this.runtimeList.push({
            calendar: calendar,
            period: periodStrArr,
            obj: objArr,
            type: 'calendar'
          });
        }
      });
    }
    if (this.runTimeVar.weekdays && this.runTimeVar.weekdays.days) {
      this.runTimeVar.weekdays.days.forEach((res) => {
        let str = '';
        if (res.day) {
          if (_.isArray(res.day)) {
            res.day = res.day.join(' ');
          }
          str = this.calendarService.getWeekDays(res.day);
          let periodStrArr = [], objArr = [];
          if (res.periods && !_.isArray(res.periods)) {
            res.periods = [res.periods];
          }
          this._updateperiodObj(res, periodStrArr, objArr, true, null);

          this.runtimeList.push({
            frequency: str,
            period: periodStrArr,
            obj: objArr, type: 'weekdays'
          });

        }
      });
    }
    if (this.runTimeVar.monthdays) {
      if (this.runTimeVar.monthdays.weekdays && this.runTimeVar.monthdays.weekdays.length > 0) {
        this.runTimeVar.monthdays.weekdays.forEach((value) => {
          if (value && !_.isArray(value)) {
            let str = '';
            if (value.day) {
              if (_.isArray(value.day)) {
                value.day = value.day.join(' ');
              }
              str = this.calendarService.getSpecificDay(value.which) + ' ' + value.day + ' of month';
              let periodStrArr = [], objArr = [];
              this._updateperiodObj(value, periodStrArr, objArr, true, null);

              this.runtimeList.push({
                frequency: str,
                period: periodStrArr,
                obj: objArr, type: 'weekday'
              });
            }
          }
        });
      }
      if (this.runTimeVar.monthdays.days && this.runTimeVar.monthdays.days.length > 0) {
        this.runTimeVar.monthdays.days.forEach((res) => {
          let str = '';
          if (res && res.day) {
            if (_.isArray(res.day)) {
              res.day = res.day.join(' ');
            }
            str = this.calendarService.getMonthDays(res.day, false) + ' of month';
            let periodStrArr = [], objArr = [];
            if (res.periods && !_.isArray(res.periods)) {
              res.periods = [res.periods];
            }

            this._updateperiodObj(res, periodStrArr, objArr, true, null);

            this.runtimeList.push({
              frequency: str,
              period: periodStrArr, obj: objArr, type: 'monthdays'
            });
          }
        });
      }
    }
    if (this.runTimeVar.ultimos && this.runTimeVar.ultimos.days && this.runTimeVar.ultimos.days.length > 0) {
      this.runTimeVar.ultimos.days.forEach((res) => {
        let str = '';
        if (res && res.day) {
          if (_.isArray(res.day)) {
            res.day = res.day.join(' ');
          }
          str = this.calendarService.getMonthDays(res.day, true) + ' of ultimos';
          let periodStrArr = [], objArr = [];
          if (res.periods && !_.isArray(res.periods)) {
            res.periods = [res.periods];
          }

          this._updateperiodObj(res, periodStrArr, objArr, true, null);
          this.runtimeList.push(
            {
              frequency: str,
              period: periodStrArr,
              obj: objArr,
              type: 'ultimos'
            });
        }
      });
    }
    if (this.runTimeVar.months) {
      if (_.isArray(this.runTimeVar.months)) {
        this.runTimeVar.months.forEach((res) => {
          if (res.month && !_.isArray(res.month) && res.month.match(/[a-z]/)) {
            res.month = this.calendarService.stringMonthsNumber(res.month);
          }
          if (res.month && _.isArray(res.month)) {
            res.month = res.month.join(' ');
          }

          if (!_.isEmpty(res.weekdays)) {
            if (res.weekdays.days) {
              if (_.isArray(res.weekdays.days)) {
                res.weekdays.days.forEach((val) => {
                  let str, str1;
                  if (res.month)
                    str1 = this.calendarService.getMonths(res.month);
                  if (val.day) {
                    if (_.isArray(val.day)) {
                      val.day = val.day.join(' ');
                    }
                    str = this.calendarService.getWeekDays(val.day) + ' on ' + str1;
                    let periodStrArr = [], objArr = [];
                    this._updateperiodObj(val, periodStrArr, objArr, true, res);

                    this.runtimeList.push({
                      frequency: str,
                      period: periodStrArr,
                      obj: objArr,
                      type: 'month', type2: 'weekdays'
                    });
                  }
                });
              }
            }
          }
          if (!_.isEmpty(res.monthdays)) {
            if (res.monthdays.weekdays) {
              if (_.isArray(res.monthdays.weekdays)) {
                res.monthdays.weekdays.forEach((value) => {
                  if (!_.isArray(value)) {
                    let str, str1;
                    if (res.month)
                      str1 = this.calendarService.getMonths(res.month);
                    if (value.day) {
                      if (_.isArray(value.day)) {
                        value.day = value.day.join(' ');
                      }
                      str = this.calendarService.getSpecificDay(value.which) + ' ' + value.day + ' of ' + str1;
                      let periodStrArr = [], objArr = [];
                      this._updateperiodObj(value, periodStrArr, objArr, true, res);

                      this.runtimeList.push({
                        frequency: str,
                        period: periodStrArr,
                        obj: objArr,
                        type: 'month',
                        type2: 'weekday'
                      });

                    }
                  }
                });
              }
            }
            if (res.monthdays.days) {
              if (_.isArray(res.monthdays.days)) {
                res.monthdays.days.forEach((val) => {
                  let str, str1;
                  if (res.month)
                    str1 = this.calendarService.getMonths(res.month);
                  if (val.day) {
                    if (_.isArray(val.day)) {
                      val.day = val.day.join(' ');
                    }
                    str = this.calendarService.getMonthDays(val.day, false) + ' of ' + str1;
                    let periodStrArr = [], objArr = [];
                    if (val.periods && !_.isArray(val.periods)) {
                      val.periods = [val.periods];
                    }
                    this._updateperiodObj(val, periodStrArr, objArr, true, res);

                    this.runtimeList.push({
                      frequency: str,
                      period: periodStrArr,
                      obj: objArr, type: 'month', type2: 'monthdays'
                    });
                  }
                });
              }
            }
          }
          if (!_.isEmpty(res.ultimos)) {
            if (res.ultimos.days) {
              if (_.isArray(res.ultimos.days)) {
                res.ultimos.days.forEach((val) => {
                  let str, str1;
                  if (res.month) {
                    str1 = this.calendarService.getMonths(res.month);
                  }
                  if (val.day) {
                    if (_.isArray(val.day)) {
                      val.day = val.day.join(' ');
                    }
                    str = 'Ultimos: ' + this.calendarService.getMonthDays(val.day, true) + ' of ' + str1;
                    let periodStrArr = [], objArr = [];
                    if (val.periods && !_.isArray(val.periods)) {
                      val.periods = [val.periods];
                    }
                    this._updateperiodObj(val, periodStrArr, objArr, true, res);

                    this.runtimeList.push(
                      {
                        frequency: str,
                        period: periodStrArr,
                        obj: objArr,
                        type: 'month',
                        type2: 'ultimos'
                      });
                  }
                });
              }
            }
          }
        });
      }
    }
    if (this.calPeriod && this.calPeriod.length) {
      this.calPeriod = [];
      this.resetPeriodObj(this.runTimeVar);
      return;
    }

    // this.runTimeVar = this.cleanDeep(this.runTimeVar);
    this.jsonObj.run_time = this.coreService.clone(this.runTimeVar);
  }

  resetPeriodObj(run_time) {
    if (!_.isEmpty(run_time.weekdays)) {
      if (!(run_time.weekdays.days && (run_time.weekdays.days.length > 0))) {
        delete run_time['weekdays'];
      }
    } else {
      delete run_time['weekdays'];
    }

    if (!_.isEmpty(run_time.monthdays)) {
      if (!(run_time.monthdays.weekdays && run_time.monthdays.weekdays.length > 0)) {
        if (_.isEmpty(run_time.monthdays.weekdays))
          delete run_time.monthdays['weekdays'];
      }
      if (!(run_time.monthdays.days && (run_time.monthdays.days.length > 0 || run_time.monthdays.days.day))) {
        if (!run_time.monthdays.weekdays) {
          delete run_time['monthdays'];
        } else if (run_time.monthdays.days) {
          if (run_time.monthdays.days.length === 0 && run_time.monthdays.weekdays.length === 0) {
            delete run_time['monthdays'];
          } else if (run_time.monthdays.days.length === 0) {
            delete run_time.monthdays['days'];
          }
        }
      }
    } else {
      delete run_time['monthdays'];
    }

    if (!_.isEmpty(run_time.ultimos)) {
      if (!(run_time.ultimos.days && (run_time.ultimos.days.length > 0 || run_time.ultimos.days.day))) {
        delete run_time['ultimos'];
      }
    } else {
      delete run_time['ultimos'];
    }

    if (!_.isEmpty(run_time.months)) {
      if (!(run_time.months.length > 0 || run_time.months.month)) {
        delete run_time['months'];
      }
    } else {
      delete run_time['months'];
    }

    if (!_.isEmpty(run_time.holidays)) {
      if (run_time.holidays.days) {
        if (_.isArray(run_time.holidays.days) && run_time.holidays.days.length === 0) {
          delete run_time.holidays['days'];
        } else if (_.isEmpty(run_time.holidays.days)) {
          delete run_time.holidays['days'];
        }
      }
      if (!(run_time.holidays.includes && run_time.holidays.includes.length > 0)) {
        delete run_time.holidays['includes'];
      }

      if (!(run_time.holidays.weekdays && run_time.holidays.weekdays.days && run_time.holidays.weekdays.days.length > 0)) {
        delete run_time.holidays['weekdays'];
      }
    }
    if (_.isEmpty(run_time.holidays)) {
      delete run_time['holidays'];
    }
    //  run_time = cleanDeep(run_time);

    this.getXml2Json(this.coreService.clone({run_time: run_time}), false);
  }

  /** --------- Begin Period  ----------------*/

  addPeriodInFrequency(data) {
    const modalRef = this.modalService.open(PeriodEditorComponent, {backdrop: 'static'});
    modalRef.componentInstance.isNew = true;
    modalRef.componentInstance.data = {};
    modalRef.result.then((result) => {
      this.savePeriod({period: result, frequency: {frequency: data}});
    }, (reason) => {
      console.log('close...', reason);
    });
  }

  editPeriodFromFrequency(data, index, periodStr) {
    let period = data.obj[index].periods;
    if (period === '' || !period) {
      for (let i = 0; i < data.obj.length; i++) {
        if (data.obj[i].periods) {
          if (i > index) {
            period = data.obj[i].periods;
            break;
          }
        }
      }
    }
    const modalRef = this.modalService.open(PeriodEditorComponent, {backdrop: 'static'});
    modalRef.componentInstance.isNew = false;
    modalRef.componentInstance.data = period;
    modalRef.result.then((result) => {
      console.log('periodStr', periodStr, period);
      if (_.isArray(period)) {
        period = period[0];
      }
      this.savePeriod({period: result, frequency: {frequency: data, period: period, periodStr: periodStr}});
    }, (reason) => {
      console.log('close...', reason);

    });
  }

  deletePeriodFromFrequency(data, index) {
    let json = this.jsonObj;
    let _json = json.run_time || json.schedule;
    if (!_json) {
      return;
    }
    let period = data.obj[index].periods[0];
    if (period === '' || !period) {
      for (let i = 0; i < data.obj.length; i++) {
        if (data.obj[i].periods) {
          if (i > index) {
            period = data.obj[i].periods;
            break;
          }
        }
      }
    }
    if (!_.isEmpty(data.obj) && _.isArray(data.obj)) {
      if (data.type === 'date') {
        if (_.isArray(_json.dates)) {
          _json.dates.forEach((val, index1) => {
            if (val.date === data.obj[0].date) {
              if (_.isArray(val.periods)) {
                for (let i = 0; i < val.periods.length; i++) {
                  if (val.periods[i] === period || this.calendarService.checkPeriod(val.periods[i], period)) {
                    _json.dates[index1].periods.splice(i, 1);
                    break;
                  }
                }
              } else {
                if ((val.periods === period || this.calendarService.checkPeriod(val.periods, period))) {
                  _json.dates.splice(index1, 1);
                }
              }
            }
          });
        } else {
          if (_json.dates.date === data.obj[0].date) {
            if (_.isArray(_json.dates.periods)) {
              for (let i = 0; i < _json.dates.periods.length; i++) {
                if (_json.dates.periods[i] === period || this.calendarService.checkPeriod(_json.dates.periods[i], period)) {
                  _json.dates.periods.splice(i, 1);
                  break;
                }
              }
            } else {
              if (_json.dates.periods === period || this.calendarService.checkPeriod(_json.dates.periods, period)) {
                delete _json.dates['periods'];
              }
            }
          }
        }
      } else if (data.type === 'calendar') {
        if (_.isArray(_json.dates)) {
          _json.dates.forEach((val, index1) => {
            if (val.calendar === data.obj[0].calendar) {
              if (_.isArray(val.periods)) {
                for (let i = 0; i < val.periods.length; i++) {
                  if (val.periods[i] === period || this.calendarService.checkPeriod(val.periods[i], period)) {
                    _json.dates[index1].periods.splice(i, 1);
                    break;
                  }
                }
              } else {
                if ((val.periods === period || this.calendarService.checkPeriod(val.periods, period))) {
                  delete val['periods'];
                }
              }
            }
          });
        } else {
          if (_json.dates.calendar === data.obj[0].calendar) {
            if (_.isArray(_json.dates.periods)) {
              for (let i = 0; i < _json.dates.periods.length; i++) {
                if (_json.dates.periods[i] === period || this.calendarService.checkPeriod(_json.dates.periods[i], period)) {
                  _json.dates.periods.splice(i, 1);
                  break;
                }
              }
            } else {
              if (_json.dates.periods === period || this.calendarService.checkPeriod(_json.dates.periods, period)) {
                delete _json.dates['periods'];
              }
            }
          }
        }
      } else if (data.type === 'weekdays') {
        if (_.isArray(_json.weekdays.days)) {
          _json.weekdays.days.forEach((val, index1) => {

            if (val.day === data.obj[0].day) {
              if (_.isArray(val.periods)) {
                for (let i = 0; i < val.periods.length; i++) {
                  if (val.periods[i] === period || this.calendarService.checkPeriod(val.periods[i], period)) {
                    _json.weekdays.days[index1].periods.splice(i, 1);
                    break;
                  }
                }
              } else {
                if (val.periods === period || this.calendarService.checkPeriod(val.periods, period)) {
                  _json.weekdays.days.splice(index1, 1);
                }
              }
            }
          });
        } else {
          if (_json.weekdays.days.day === data.obj[0].day) {
            if (_.isArray(_json.weekdays.days.periods)) {
              for (let i = 0; i < _json.weekdays.days.periods.length; i++) {
                if (_json.weekdays.days.periods[i] === period || this.calendarService.checkPeriod(_json.weekdays.days.periods[i], period)) {
                  _json.weekdays.days.periods.splice(i, 1);
                  break;
                }
              }
            } else {
              if ((_json.weekdays.days.periods === period || this.calendarService.checkPeriod(_json.weekdays.days.periods, period))) {
                delete _json.weekdays.days ['periods'];
              }
            }
          }
        }
      } else if (data.type === 'monthdays') {
        if (_.isArray(_json.monthdays.days)) {
          _json.monthdays.days.forEach((val, index1) => {
            if (val.day === data.obj[0].day) {
              if (_.isArray(val.periods)) {
                for (let i = 0; i < val.periods.length; i++) {
                  if (val.periods[i] === period || this.calendarService.checkPeriod(val.periods[i], period)) {
                    _json.monthdays.days[index1].periods.splice(i, 1);
                    break;
                  }
                }
              } else {
                if (val.periods === period || this.calendarService.checkPeriod(val.periods, period)) {
                  _json.monthdays.days.splice(index1, 1);
                }
              }
            }
          });
        } else {
          if (_json.monthdays.days.day === data.obj[0].day) {
            if (_.isArray(_json.monthdays.days.periods)) {
              for (let i = 0; i < _json.monthdays.days.periods.length; i++) {
                if (_json.monthdays.days.periods[i] === period || this.calendarService.checkPeriod(_json.monthdays.days.periods[i], period)) {
                  _json.monthdays.days.periods.splice(i, 1);
                  break;
                }
              }
            } else {
              if ((_json.monthdays.days.periods === period || this.calendarService.checkPeriod(_json.monthdays.days.periods, period))) {
                delete _json.monthdays.days ['periods'];
              }
            }
          }
        }
      } else if (data.type === 'weekday') {
        if (_.isArray(_json.monthdays.weekdays)) {
          _json.monthdays.weekdays.forEach((val, index1) => {
            if (val.day === data.obj[0].day && val.which === data.obj[0].which) {
              if (_.isArray(val.periods)) {
                for (let i = 0; i < val.periods.length; i++) {
                  if (val.periods[i] === period || this.calendarService.checkPeriod(val.periods[i], period)) {
                    _json.monthdays.weekdays[index1].periods.splice(i, 1);
                    break;
                  }
                }
              } else {
                if ((val.periods === period || this.calendarService.checkPeriod(val.periods, period))) {
                  _json.monthdays.weekdays.splice(index1, 1);
                }
              }
            }
          });
        } else {
          if (_json.monthdays.weekdays.day === data.obj[0].day && _json.monthdays.weekdays.which === data.obj[0].which) {
            if (_.isArray(_json.monthdays.weekdays.periods)) {
              for (let i = 0; i < _json.monthdays.weekdays.periods.length; i++) {
                if (_json.monthdays.weekdays.periods[i] === period || this.calendarService.checkPeriod(_json.monthdays.weekdays.periods[i], period)) {
                  _json.monthdays.weekdays.periods.splice(i, 1);
                  break;
                }
              }
            } else {
              if (_json.monthdays.weekdays.periods === period || this.calendarService.checkPeriod(_json.monthdays.weekdays.periods, period)) {
                delete _json.monthdays.weekdays['periods'];
              }
            }
          }
        }
      } else if (data.type === 'ultimos') {
        if (_.isArray(_json.ultimos.days)) {
          _json.ultimos.days.forEach((val, index1) => {
            if (val.day === data.obj[0].day) {
              if (_.isArray(val.periods)) {
                for (let i = 0; i < val.periods.length; i++) {
                  if (val.periods[i] === period || this.calendarService.checkPeriod(val.periods[i], period)) {
                    _json.ultimos.days[index1].periods.splice(i, 1);
                    break;
                  }
                }
              } else {
                if (val.periods === period || this.calendarService.checkPeriod(val.periods, period)) {
                  _json.ultimos.days.splice(index1, 1);
                }
              }
            }
          });
        } else {
          if (_json.ultimos.days.day === data.obj[0].day) {
            if (_.isArray(_json.ultimos.days.periods)) {
              for (let i = 0; i < _json.ultimos.days.periods.length; i++) {
                if (_json.ultimos.days.periods[i] === period || this.calendarService.checkPeriod(_json.ultimos.days.periods[i], period)) {
                  _json.ultimos.days.periods.splice(i, 1);
                  break;
                }
              }
            } else {
              if ((_json.ultimos.days.periods === period || this.calendarService.checkPeriod(_json.ultimos.days.periods, period))) {
                delete _json.ultimos.days ['periods'];
              }
            }
          }
        }
      } else if (data.type === 'month') {
        if (_.isArray(_json.months)) {
          _json.months.forEach((val1) => {
            if (val1.month === data.obj[0].month) {
              if (data.type2 === 'weekdays') {
                if (_.isArray(val1.weekdays.days)) {
                  val1.weekdays.days.forEach((val, index) => {
                    if (val.day === data.obj[0].day) {
                      if (_.isArray(val.periods)) {
                        for (let i = 0; i < val.periods.length; i++) {
                          if (val.periods[i] === period || this.calendarService.checkPeriod(val.periods[i], period)) {
                            val1.weekdays.days[index].periods.splice(i, 1);
                            break;
                          }
                        }
                      } else {
                        if (val.periods === period || this.calendarService.checkPeriod(val.periods, period)) {
                          val1.weekdays.days.splice(index, 1);
                        }
                      }
                    }
                  });
                } else {
                  if (val1.weekdays.days.day === data.obj[0].day) {
                    if (_.isArray(val1.weekdays.days.periods)) {
                      val1.weekdays.days.periods.forEach((x, i) => {
                        if (x === period || this.calendarService.checkPeriod(x, period)) {
                          val1.weekdays.days.periods.splice(i, 1);

                        }
                      });
                    } else {
                      if ((val1.weekdays.days.periods === period || this.calendarService.checkPeriod(val1.weekdays.days.periods, period))) {
                        delete val1.weekdays.days ['periods'];
                      }
                    }
                  }
                }

              } else if (data.type2 === 'ultimos') {
                if (_.isArray(val1.ultimos.days)) {
                  val1.ultimos.days.forEach((val, index) => {
                    if (val.day === data.obj[0].day) {
                      if (_.isArray(val.periods)) {
                        for (let i = 0; i < val.periods.length; i++) {
                          if (val.periods[i] === period || this.calendarService.checkPeriod(val.periods[i], period)) {
                            val1.ultimos.days[index].periods.splice(i, 1);
                            break;
                          }
                        }
                      } else {
                        if (val.periods === period || this.calendarService.checkPeriod(val.periods, period)) {
                          val1.ultimos.days.splice(index, 1);
                        }
                      }
                    }
                  });
                } else {
                  if (val1.ultimos.days.day === data.obj[0].day) {
                    if (_.isArray(val1.ultimos.days.periods)) {
                      for (let i = 0; i < val1.ultimos.days.periods.length; i++) {
                        if (val1.ultimos.days.periods[i] === period || this.calendarService.checkPeriod(val1.ultimos.days.periods[i], period)) {
                          val1.ultimos.days.periods.splice(i, 1);
                          break;
                        }
                      }
                    } else {
                      if ((val1.ultimos.days.periods === period || this.calendarService.checkPeriod(val1.ultimos.days.periods, period))) {
                        delete val1.ultimos.days ['periods'];
                      }
                    }
                  }

                }
              } else if (data.type2 === 'monthdays') {
                if (_.isArray(val1.monthdays.days)) {
                  val1.monthdays.days.forEach((val, index) => {
                    if (val.day === data.obj[0].day) {
                      if (_.isArray(val.periods)) {
                        for (let i = 0; i < val.periods.length; i++) {
                          if (val.periods[i] === period || this.calendarService.checkPeriod(val.periods[i], period)) {
                            val1.monthdays.days[index].periods.splice(i, 1);
                            break;
                          }
                        }
                      } else {
                        if (val.periods === period || this.calendarService.checkPeriod(val.periods, period)) {
                          val1.monthdays.days.splice(index, 1);
                        }
                      }
                    }
                  });
                } else {
                  if (val1.monthdays.days.day === data.obj[0].day) {
                    if (_.isArray(val1.monthdays.days.periods)) {
                      for (let i = 0; i < val1.monthdays.days.periods.length; i++) {
                        if (val1.monthdays.days.periods[i] === period || this.calendarService.checkPeriod(val1.monthdays.days.periods[i], period)) {
                          val1.monthdays.days.periods.splice(i, 1);
                          break;
                        }
                      }
                    } else {
                      if ((val1.monthdays.days.periods === period || this.calendarService.checkPeriod(val1.monthdays.days.periods, period))) {
                        delete val1.monthdays.days ['periods'];
                      }
                    }
                  }
                }
              } else if (data.type2 === 'weekday') {
                if (_.isArray(val1.monthdays.weekdays)) {
                  val1.monthdays.weekdays.forEach((val, index) => {
                    if (val.day === data.obj[0].day && val.which === data.obj[0].which) {
                      if (_.isArray(val.periods)) {
                        for (let i = 0; i < val.periods.length; i++) {
                          if (val.periods[i] === period || this.calendarService.checkPeriod(val.periods[i], period)) {
                            val1.monthdays.weekdays[index].periods.splice(i, 1);
                            break;
                          }
                        }
                      } else {
                        if (val.periods === period || this.calendarService.checkPeriod(val.periods, period)) {
                          val1.monthdays.weekdays.splice(index, 1);
                        }
                      }
                    }
                  });
                } else {
                  if (val1.monthdays.weekdays.day === data.obj[0].day && val1.monthdays.weekdays.which === data.obj[0].which) {
                    if (_.isArray(val1.monthdays.weekdays.periods)) {
                      for (let i = 0; i < val1.monthdays.weekdays.periods.length; i++) {
                        if (val1.monthdays.weekdays.periods[i] === period || this.calendarService.checkPeriod(val1.monthdays.weekdays.periods[i], period)) {
                          val1.monthdays.weekdays.periods.splice(i, 1);
                          break;
                        }
                      }
                    } else {
                      if ((val1.monthdays.weekdays.periods === period || this.calendarService.checkPeriod(val1.monthdays.weekdays.periods, period))) {
                        delete val1.monthdays.weekdays ['periods'];
                      }
                    }
                  }
                }
              }
            }
          });
        }
      }
    }

    for (let i = 0; i < this.runtimeList.length; i++) {
      if (this.runtimeList[i] === data) {
        this.runtimeList.splice(i, 1);
      }
    }

    this.getXml2Json({run_time: _json}, false);
  }

  addPeriod() {
    if (this.runTime.period) {
      if (this.runTime.frequency === 'singleStart') {
        if (this.runTime.period.singleStart) {
          this.runTime.period.singleStart = this.calendarService.checkTime(this.runTime.period.singleStart);
        } else {
          return;
        }
      } else if (this.runTime.frequency === 'repeat' || this.runTime.frequency === 'absoluteRepeat') {
        if (this.runTime.frequency === 'repeat') {
          if (this.runTime.period.repeat) {
            this.runTime.period.repeat = this.calendarService.checkTime(this.runTime.period.repeat);
          } else {
            return;
          }
        } else {
          if (this.runTime.period.absoluteRepeat) {
            this.runTime.period.absoluteRepeat = this.calendarService.checkTime(this.runTime.period.absoluteRepeat);
          } else {
            return;
          }
        }
      }
      if (this.runTime.frequency !== 'singleStart') {
        if (this.runTime.period.begin) {
          this.runTime.period.begin = this.calendarService.checkTime(this.runTime.period.begin);
        } else {
          return;
        }
        if (this.runTime.period.end) {
          this.runTime.period.end = this.calendarService.checkTime(this.runTime.period.end);
        } else {
          return;
        }
      }
    }
    if (this.periodList.length > 0) {
      for (let i = 0; i < this.periodList.length; i++) {
        this.runTime.str = this.frequencyToString(this.runTime);
        if (_.isEqual(this.periodList[i], this.runTime)) {
          return;
        }
      }
    }

    if (!_.isEmpty(this.tempPeriod) && this.periodList.length > 0) {
      if (this.tempPeriod.tab === 'specificDays') {
        if (this.tempRunTime.date) {
          this.tempRunTime.date.forEach((value) => {
            console.log(value);
            if (value.date && (_.isEqual(value.date, moment(value.date).format('YYYY-MM-DD')))) {
              this.removePeriodObj(value);
            }
          });
        }
      } else if (this.tempPeriod.tab === 'weekDays') {
        if (this.tempPeriod.months && this.tempPeriod.months.length > 0) {
          if (this.tempRunTime.month && this.tempRunTime.month.length > 0) {
            for (let i = 0; i < this.tempRunTime.month.length; i++) {
              if (!_.isEmpty(this.tempRunTime.month[i].weekdays)) {
                if (_.isEqual(this.tempRunTime.month[i].month, this.tempPeriod.months)) {
                  if (this.tempRunTime.month[i].weekdays && this.tempRunTime.month[i].weekdays.days) {
                    if (this.tempRunTime.month[i].weekdays.days.length > 1) {
                      this.tempRunTime.month[i].weekdays.days.forEach((value) => {
                        if (_.isEqual(value.day, this.tempPeriod.days)) {
                          this.removePeriodObj(value);
                        }
                      });
                    } else {
                      delete this.tempRunTime.month[i]['weekdays'];
                    }
                  }
                }
              }
            }
          }
        } else {
          if (this.tempRunTime.weekdays && this.tempRunTime.weekdays.days) {
            this.tempRunTime.weekdays.days.forEach((value) => {
              if (value.day && _.isEqual(value.day, this.tempPeriod.days)) {
                this.removePeriodObj(value);
              }
            });
          }
        }

      } else if (this.tempPeriod.tab === 'monthDays') {
        if (this.tempPeriod.isUltimos === 'months') {
          if (this.tempPeriod.months && this.tempPeriod.months.length > 0) {
            if (this.tempRunTime.month && this.tempRunTime.month.length > 0) {
              for (let i = 0; i < this.tempRunTime.month.length; i++) {
                if (!_.isEmpty(this.tempRunTime.month[i].monthdays)) {
                  if (_.isEqual(this.tempRunTime.month[i].month, this.tempPeriod.months)) {
                    if (this.tempRunTime.month[i].monthdays && this.tempRunTime.month[i].monthdays.days) {
                      if (this.tempRunTime.month[i].monthdays.days.length > 1) {
                        this.tempRunTime.month[i].monthdays.days.forEach((value) => {
                          if (_.isEqual(value.day, this.tempPeriod.selectedMonths)) {
                            this.removePeriodObj(value);
                          }
                        });
                      } else {
                        delete this.tempRunTime.month[i].monthdays['days'];
                      }
                    }
                  }
                }
              }
            }
          } else {
            if (this.tempRunTime.monthdays && this.tempRunTime.monthdays.days) {
              this.tempRunTime.monthdays.days.forEach((value) => {
                if (value.day && _.isEqual(value.day, this.tempPeriod.selectedMonths)) {
                  this.removePeriodObj(value);
                }
              });
            }
          }
        }
        if (this.tempPeriod.isUltimos === 'ultimos') {
          if (this.tempPeriod.months && this.tempPeriod.months.length > 0) {
            if (this.tempRunTime.month && this.tempRunTime.month.length > 0) {
              for (let i = 0; i < this.tempRunTime.month.length; i++) {
                if (!_.isEmpty(this.tempRunTime.month[i].ultimos)) {
                  if (_.isEqual(this.tempRunTime.month[i].month, this.tempPeriod.months)) {
                    if (this.tempRunTime.month[i].ultimos && this.tempRunTime.month[i].ultimos.days) {
                      if (this.tempRunTime.month[i].ultimos.days.length > 1) {
                        this.tempRunTime.month[i].ultimos.days.forEach((value) => {
                          if (_.isEqual(value.day, this.tempPeriod.selectedMonthsU)) {
                            this.removePeriodObj(value);
                          }
                        });
                      } else {
                        delete this.tempRunTime.month[i].ultimos['days'];
                      }
                    }
                  }
                }
              }
            }
          } else {
            if (this.tempRunTime.ultimos && this.tempRunTime.ultimos.days) {
              this.tempRunTime.ultimos.days.forEach((value) => {
                if (value.day && _.isEqual(value.day, this.tempPeriod.selectedMonthsU)) {
                  this.removePeriodObj(value);
                }
              });
            }
          }
        }

      } else if (this.tempPeriod.tab === 'specificWeekDays') {
        if (this.tempPeriod.months && this.tempPeriod.months.length > 0) {
          if (this.tempRunTime.month && this.tempRunTime.month.length > 0) {
            for (let i = 0; i < this.tempRunTime.month.length; i++) {
              if (!_.isEmpty(this.tempRunTime.month[i].weekdays)) {
                if (_.isEqual(this.tempRunTime.month[i].month, this.tempPeriod.months)) {
                  if (this.tempRunTime.month[i].monthdays.weekdays && this.tempRunTime.month[i].weekdays.days) {
                    if (this.tempRunTime.month[i].monthdays.weekdays.length > 1) {
                      this.tempRunTime.month[i].monthdays.weekdays.forEach((value) => {
                        if (_.isEqual(value.day, this.tempPeriod.specificWeekDay) && _.isEqual(value.which, this.tempPeriod.which)) {
                          this.removePeriodObj(value);
                        }
                      });
                    } else {
                      delete this.tempRunTime.month[i].monthdays['weekdays'];
                    }
                  }
                }
              }
            }
          }
        } else {
          if (this.tempRunTime.monthdays && this.tempRunTime.monthdays.weekdays) {
            this.tempRunTime.monthdays.weekdays.forEach((value) => {
              if (value.day && (_.isEqual(value.day, this.tempPeriod.specificWeekDay) && _.isEqual(value.which, this.tempPeriod.which))) {
                this.removePeriodObj(value);
              }
            });
          }
        }
      }
      this.runTimeVar = this.coreService.clone(this.tempRunTime);

      for (let i = 0; i < this.periodList.length; i++) {
        if (_.isEqual(this.periodList[i], this.tempPeriod)) {
          this.periodList.splice(i, 1);
        }
      }
      this.tempPeriod = {};
    }
    if (_.isArray(this.runTime.days)) {
      this.runTime.days.sort();
    }
    if (_.isArray(this.runTime.months)) {
      this.runTime.months.sort(this.calendarService.compareNumbers);
    }
    if (this.selectedMonths.length > 0) {
      this.runTime.selectedMonths = this.coreService.clone(this.selectedMonths);
      this.runTime.selectedMonths.sort(this.calendarService.compareNumbers);
    }
    if (this.selectedMonthsU.length > 0) {
      this.runTime.selectedMonthsU = this.coreService.clone(this.selectedMonthsU);
      this.runTime.selectedMonthsU.sort(this.calendarService.compareNumbers);
    }
    if (_.isEmpty(this.runTimeVar.dates)) {
      this.runTimeVar.dates = [];
    } else {
      if (!_.isArray(this.runTimeVar.dates)) {
        let temp = this.coreService.clone(this.runTimeVar.dates);
        this.runTimeVar.dates = [];
        if (temp.periods || temp._date)
          this.runTimeVar.dates.push(temp);
      } else {
        if (this.runTime.dates)
          this.runTime.dates.forEach((value) => {
            if (!value.periods && !value.date)
              this.runTimeVar.dates = [];
          });
      }
    }
    if (_.isEmpty(this.runTimeVar.weekdays)) {
      this.runTimeVar.weekdays = {};
      this.runTimeVar.weekdays.days = [];
    } else {
      if (!_.isArray(this.runTimeVar.weekdays.days)) {
        let temp = this.coreService.clone(this.runTimeVar.weekdays.days);
        this.runTimeVar.weekdays.days = [];
        if (temp.periods || temp._day)
          this.runTimeVar.weekdays.days.push(temp);
      } else {
        if (this.runTimeVar.weekdays.days)
          this.runTimeVar.weekdays.days.forEach((value) => {
            if (!value.periods && !value.day)
              this.runTimeVar.weekdays.days = [];
          });
      }
    }
    if (_.isEmpty(this.runTimeVar.monthdays)) {
      this.runTimeVar.monthdays = {};
      this.runTimeVar.monthdays.days = [];
      this.runTimeVar.monthdays.weekdays = [];
    } else {
      let temp = this.coreService.clone(this.runTimeVar.monthdays);
      if (!_.isArray(this.runTimeVar.monthdays.days)) {
        this.runTimeVar.monthdays.days = [];
        this.runTimeVar.monthdays.weekdays = [];
        if (temp && temp.day) {
          this.runTimeVar.monthdays.days.push(temp.day);
        }

        if (temp && temp.weekdays) {
          if (_.isArray(temp.weekdays)) {
            temp.weekdays.forEach((value) => {
              if (!_.isArray(value)) {
                if (!value.periods && !value.day && !value.which) {
                } else {
                  this.runTimeVar.monthdays.weekdays.push(value);
                }
              }
            });
          } else {
            this.runTimeVar.monthdays.weekdays.push(temp.weekdays);
          }
        }
      } else {
        this.runTimeVar.monthdays.weekdays = [];
        if (this.runTimeVar.monthdays.days)
          this.runTimeVar.monthdays.days.forEach((value) => {
            if (!value.periods && !value.day) {
              this.runTimeVar.monthdays.days = [];
            }
          });
        if (temp && temp.weekdays) {
          if (_.isArray(temp.weekdays)) {
            temp.weekdays.forEach((value) => {
              if (!_.isArray(value)) {
                if (!value.periods && !value.day && !value.which) {

                } else {
                  this.runTimeVar.monthdays.weekdays.push(value);
                }
              }
            });

          } else {
            if (!temp.weekdays.periods && !temp.weekdays.day && !temp.weekdays.which)
              this.runTimeVar.monthdays.weekdays.push(temp.weekdays);
          }
        }
      }

    }
    if (_.isEmpty(this.runTimeVar.ultimos)) {
      this.runTimeVar.ultimos = {};
      this.runTimeVar.ultimos.days = [];
    } else {
      if (!_.isArray(this.runTimeVar.ultimos.days)) {
        let temp = this.coreService.clone(this.runTimeVar.ultimos.days);
        this.runTimeVar.ultimos.days = [];
        if (temp.periods || temp._day)
          this.runTimeVar.ultimos.days.push(temp);
      } else {
        if (this.runTimeVar.ultimos.days)
          this.runTimeVar.ultimos.days.forEach((value) => {
            if (!value.periods && !value.day) {
              this.runTimeVar.ultimos.days = [];
            }
          });
      }
    }
    if (_.isEmpty(this.runTimeVar.months)) {
      this.runTimeVar.months = [];
    } else {
      let temp = this.coreService.clone(this.runTimeVar.months);
      if (!_.isArray(this.runTimeVar.months)) {
        this.runTimeVar.months = [];
        if (temp)
          this.runTimeVar.months.push(temp);
      } else {
        this.runTimeVar.months.forEach((res) => {
          if (res.weekdays) {
            if (!_.isArray(res.weekdays.days)) {
              let temp = this.coreService.clone(res.weekdays.days);
              res.weekdays.days = [];
              if (temp.periods || temp.day)
                res.weekdays.days.push(temp);
            } else {
              if (res.weekdays.days)
                res.weekdays.days.forEach((value) => {
                  if (!value.periods && !value.day)
                    res.weekdays.days = [];
                });
            }

          } else if (res.monthdays) {
            if (res.monthdays.weekday) {
              if (!_.isArray(res.monthdays.weekdays)) {
                let temp = this.coreService.clone(res.monthdays.weekdays);
                res.monthdays.weekdays = [];
                if (temp.periods || temp.day)
                  res.monthdays.weekdays.push(temp);
              } else {
                if (res.monthdays.weekdays)
                  res.monthdays.weekdays.forEach((value) => {
                    if (!value.periods && !value.day)
                      res.monthdays.weekdays = [];
                  });
              }
            } else if (res.monthdays.days) {
              if (!_.isArray(res.monthdays.days)) {
                let temp = this.coreService.clone(res.monthdays.days);
                res.monthdays.days = [];
                if (temp.periods || temp.day)
                  res.monthdays.days.push(temp);
              } else {
                if (res.monthdays.days)
                  res.monthdays.days.forEach((value) => {
                    if (!value.periods && !value.day)
                      res.monthdays.days = [];
                  });
              }
            }
          } else if (res.ultimos) {
            if (!_.isArray(res.ultimos.days)) {
              let temp = this.coreService.clone(res.ultimos.days);
              res.ultimos.days = [];
              if (temp.periods || temp.day)
                res.ultimos.days.push(temp);
            } else {
              if (res.ultimos.days)
                res.ultimos.days.forEach((value) => {
                  if (!value.periods && !value.day)
                    res.ultimos.days = [];
                });
            }
          }
        });
      }
    }

    var isMonth = false;
    if (this.runTimeVar.months && _.isArray(this.runTimeVar.months)) {
      for (let i = 0; i < this.runTimeVar.months.length; i++) {
        if (this.runTimeVar.months[i].month && _.isEqual(this.runTimeVar.months[i].month, this.runTime.months) || _.isEqual(this.runTimeVar.months[i].month.toString().split(' '), this.runTime.months)) {
          isMonth = true;
          break;
        }
      }
    }
    if (this.runTime.tab === 'specificDays') {
      for (let t = 0; t < this.tempItems.length; t++) {
        if (this.runTimeVar.dates.length > 0) {
          let _period = [];
          this.runTimeVar.dates.forEach((value) => {
            if (value.date && !value.calendar && this.tempItems[t].date && (_.isEqual(value.date, moment(this.tempItems[t].date).format('YYYY-MM-DD')))) {
              if (_.isArray(value.periods)) {
                value.periods.forEach((res) => {
                  if (res)
                    _period.push(res);
                });
              } else {
                if (value.periods)
                  _period.push(value.periods);
              }
              if (this.runTime.period && !_.isEmpty(this.runTime.period)) {
                _period.push(this.runTime.period);
              }
              value.periods = _period;
            }
          });

          if (_period.length === 0) {
            if (!_.isArray(this.runTimeVar.dates)) {
              this.runTimeVar.dates = [];
            }
            this.runTimeVar.dates.push({
              'date': moment(this.tempItems[t].date).format('YYYY-MM-DD'),
              'periods': [this.runTime.period]
            });
          }
        } else {
          this.runTimeVar.dates.push({
            'date': moment(this.tempItems[t].date).format('YYYY-MM-DD'),
            'periods': [this.runTime.period]
          });
        }
      }
    } else if (this.runTime.tab === 'weekDays') {
      if (this.runTime.months && this.runTime.months.length > 0) {

        if (this.runTimeVar.months.length > 0) {
          let flag = false;
          this.runTimeVar.months.forEach((value) => {
            if (isMonth) {
              if (value.weekdays && (_.isEqual(value.month, this.runTime.months) || _.isEqual(value.month.toString().split(' '), this.runTime.months))) {
                flag = true;
                let _period = [];
                if (_.isArray(value.weekdays.days)) {
                  value.weekdays.days.forEach((value1) => {
                    if (value1.day && (_.isEqual(value1.day, this.runTime.days) || _.isEqual(value1.day.toString().split(' '), this.runTime.days))) {
                      if (_.isArray(value1.periods)) {
                        value1.periods.forEach((res) => {
                          if (res)
                            _period.push(res);
                        });
                      } else {
                        if (value1.periods) {
                          _period.push(value1.periods);
                        }
                      }
                      _period.push(this.runTime.period);
                      value1.periods = _period;
                    }
                  });
                } else {
                  if (_.isEqual(value.weekdays.days.day, this.runTime.days) || _.isEqual(value.weekdays.days.day.toString().split(' '), this.runTime.days)) {
                    if (_.isArray(value.weekdays.days.periods)) {
                      value.weekdays.days.periods.forEach((res) => {
                        if (res)
                          _period.push(res);
                      });
                    } else {
                      if (value.weekdays.days.periods)
                        _period.push(value.weekdays.days.periods);

                    }
                    _period.push(this.runTime.period);
                    value.weekdays.days.periods = _period;
                  }
                }

                if (_period.length === 0) {
                  if (value.weekdays.days && !_.isEmpty(value.weekdays.days)) {
                    if (!_.isArray(value.weekdays.days)) {
                      let t = [];
                      t.push(this.coreService.clone(value.weekdays.days));
                      value.weekdays.days = t;
                    }
                  } else {
                    value.weekdays.days = [];
                  }

                  value.weekdays.days.push({
                    'day': this.runTime.days,
                    'periods': [this.runTime.period]
                  });
                }
              }
            }
          });
          if (!flag) {
            if (isMonth) {
              for (let i = 0; i < this.runTimeVar.months.length; i++) {
                if (this.runTimeVar.months[i].month && _.isEqual(this.runTimeVar.months[i].month, this.runTime.months) || _.isEqual(this.runTimeVar.months[i].month.toString().split(' '), this.runTime.months)) {
                  this.runTimeVar.months[i].weekdays = {days: []};
                  this.runTimeVar.months[i].weekdays.days.push({
                    'day': this.runTime.days,
                    'periods': [this.runTime.period]
                  });
                  break;
                }
              }
            } else {
              let x = {month: this.runTime.months, weekdays: {days: []}};
              x.weekdays.days.push({'day': this.runTime.days, 'periods': [this.runTime.period]});
              this.runTimeVar.months.push(x);
            }
          }
        } else {
          let x = {month: this.runTime.months, weekdays: {days: []}};
          x.weekdays.days.push({'day': this.runTime.days, 'periods': [this.runTime.period]});
          this.runTimeVar.months.push(x);
        }
      } else {
        if (this.runTimeVar.weekdays.days.length > 0) {
          let _period = [];
          this.runTimeVar.weekdays.days.forEach((value) => {
            if (value.day && (_.isEqual(value.day, this.runTime.days) || _.isEqual(value.day.toString().split(' '), this.runTime.days))) {
              if (_.isArray(value.periods)) {
                value.periods.forEach((res) => {
                  if (res)
                    _period.push(res);
                });
              } else {
                if (value.periods) {
                  _period.push(value.periods);
                }
              }
              _period.push(this.runTime.period);
              value.periods = _period;
            }
          });
          if (_period.length === 0) {
            if (!_.isArray(this.runTimeVar.weekdays.days)) {
              this.runTimeVar.weekdays.days = [];
            }
            this.runTimeVar.weekdays.days.push({'day': this.runTime.days, 'periods': [this.runTime.period]});
          }
        } else {
          this.runTimeVar.weekdays.days.push({'day': this.runTime.days, 'periods': [this.runTime.period]});
        }
      }
    } else if (this.runTime.tab === 'specificWeekDays') {
      if (this.runTime.months && this.runTime.months.length > 0) {
        if (this.runTimeVar.months.length > 0) {
          let flag = false;
          this.runTimeVar.months.forEach((value) => {
            if (isMonth) {
              if (value.monthdays && value.monthdays.weekdays && (_.isEqual(value.month, this.runTime.months) || _.isEqual(value.month.toString().split(' '), this.runTime.months))) {

                flag = true;
                let _period = [];
                if (_.isArray(value.monthdays.weekdays)) {
                  value.monthdays.weekdays.forEach((value1) => {

                    if (value1 && value1.day === this.runTime.specificWeekDay && value1.which === this.runTime.which) {
                      if (_.isArray(value1.periods)) {
                        value1.periods.forEach((res) => {
                          if (res)
                            _period.push(res);
                        });
                      } else {
                        if (value1.periods) {
                          _period.push(value1.periods);
                        }
                      }
                      _period.push(this.runTime.period);
                      value1.periods = _period;

                    }
                  });
                } else {
                  if (_.isEqual(value.monthdays.weekdays.day, this.runTime.specificWeekDay) && _.isEqual(value.monthdays.weekdays.which, this.runTime.which)) {

                    if (_.isArray(value.monthdays.weekdays.periods)) {
                      value.monthdays.weekdays.periods.forEach((res) => {
                        if (res)
                          _period.push(res);
                      });
                    } else {
                      if (value.monthdays.weekdays.periods)
                        _period.push(value.monthdays.weekdays.periods);
                    }
                    _period.push(this.runTime.period);
                    value.monthdays.weekdays.periods = _period;
                  }
                }

                if (_period.length === 0) {
                  if (value.monthdays.weekdays && !_.isEmpty(value.monthdays.weekdays)) {
                    if (!_.isArray(value.monthdays.weekdays)) {
                      let t = [];
                      t.push(this.coreService.clone(value.monthdays.weekdays));
                      value.monthdays.weekdays = t;
                    }

                  } else {
                    value.monthdays.weekdays = [];
                  }

                  value.monthdays.weekdays.push({
                    'day': this.runTime.specificWeekDay,
                    'which': this.runTime.which,
                    'periods': [this.runTime.period]
                  });
                }
              }
            }
          });
          if (!flag) {
            if (isMonth) {
              for (let i = 0; i < this.runTimeVar.months.length; i++) {

                if (this.runTimeVar.months[i].month && _.isEqual(this.runTimeVar.months[i].month, this.runTime.months) || _.isEqual(this.runTimeVar.months[i].month.toString().split(' '), this.runTime.months)) {
                  if ((!this.runTimeVar.months[i].monthdays)) {
                    this.runTimeVar.months[i].monthdays = {weekdays: []};
                  } else {
                    this.runTimeVar.months[i].monthdays.weekdays = [];
                  }
                  this.runTimeVar.months[i].monthdays.weekdays.push({
                    'day': this.runTime.specificWeekDay,
                    'which': this.runTime.which,
                    'periods': [this.runTime.period]
                  });
                  break;
                }
              }

            } else {
              let x;
              if (!this.runTimeVar.months.monthdays)
                x = {month: this.runTime.months, monthdays: {weekdays: []}};
              else {
                x = {month: this.runTime.months};
                x.monthdays.weekdays = [];
              }

              x.monthdays.weekdays.push({
                'day': this.runTime.specificWeekDay,
                'which': this.runTime.which,
                'periods': [this.runTime.period]
              });
              this.runTimeVar.months.push(x);
            }

          }
        } else {
          let x;
          if (!this.runTimeVar.months.monthdays)
            x = {month: this.runTime.months, monthdays: {weekdays: []}};
          else {
            x = {month: this.runTime.months};
            x.monthdays.weekdays = [];
          }
          x.monthdays.weekdays.push({
            'day': this.runTime.specificWeekDay,
            'which': this.runTime.which,
            'periods': [this.runTime.period]
          });
          this.runTimeVar.months.push(x);
        }
      } else {
        if (this.runTimeVar.monthdays) {
          if (this.runTimeVar.monthdays.weekdays.length > 0) {
            let _period = [];
            this.runTimeVar.monthdays.weekdays.forEach((value) => {
              if (value && value.day === this.runTime.specificWeekDay && value.which === this.runTime.which) {
                if (_.isArray(value.periods)) {
                  value.periods.forEach((res) => {
                    if (res)
                      _period.push(res);
                  });
                } else {
                  if (value.periods) {
                    _period.push(value.periods);
                  }
                }
                _period.push(this.runTime.period);
                value.periods = _period;
              }
            });

            if (_period.length === 0) {
              if (!_.isArray(this.runTimeVar.monthdays.weekdays)) {
                this.runTimeVar.monthdays.weekdays = [];
              }
              this.runTimeVar.monthdays.weekdays.push({
                'day': this.runTime.specificWeekDay,
                'which': this.runTime.which,
                'periods': [this.runTime.period]
              });
            }

          } else {
            this.runTimeVar.monthdays.weekdays.push({
              'day': this.runTime.specificWeekDay,
              'which': this.runTime.which,
              'periods': [this.runTime.period]
            });
          }
        }
      }
    } else if (this.runTime.tab === 'monthDays') {

      if (this.selectedMonths.length > 0 || this.selectedMonthsU.length > 0) {
        if (this.runTime.isUltimos === 'months') {
          if (this.runTime.months && this.runTime.months.length > 0) {
            if (this.runTimeVar.months.length > 0) {
              let flag = false;
              this.runTimeVar.months.forEach((value) => {
                if (isMonth) {
                  if (value.monthdays && value.monthdays.days && (_.isEqual(value.month, this.runTime.months) || _.isEqual(value.month.toString().split(' '), this.runTime.months))) {
                    flag = true;
                    let _period = [];
                    if (_.isArray(value.monthdays.days)) {
                      value.monthdays.days.forEach((value1) => {
                        if (value1.day && (_.isEqual(value1.day, this.selectedMonths) || _.isEqual(value1.day.toString().split(' '), this.selectedMonths))) {
                          if (_.isArray(value1.periods)) {
                            value1.periods.forEach((res) => {
                              if (res)
                                _period.push(res);
                            });
                          } else {
                            if (value1.periods) {
                              _period.push(value1.periods);

                            }
                          }
                          _period.push(this.runTime.period);
                          value1.periods = _period;
                        }
                      });
                    } else {
                      if (_.isEqual(value.monthdays.days.day, this.selectedMonths) || _.isEqual(value.monthdays.days.day.toString().split(' '), this.selectedMonths)) {
                        if (_.isArray(value.monthdays.days.periods)) {
                          value.monthdays.days.periods.forEach((res) => {
                            if (res)
                              _period.push(res);
                          });
                        } else {
                          if (value.monthdays.days.periods)
                            _period.push(value.monthdays.days.periods);
                        }
                        _period.push(this.runTime.period);
                        value.monthdays.days.periods = _period;
                      }
                    }
                    if (_period.length === 0) {
                      if (value.monthdays.days && !_.isEmpty(value.monthdays.days)) {
                        if (!_.isArray(value.monthdays.days)) {
                          let t = [];
                          t.push(this.coreService.clone(value.monthdays.days));
                          value.monthdays.days = t;
                        }
                      } else {
                        value.monthdays.days = [];
                      }

                      value.monthdays.days.push({
                        'day': this.coreService.clone(this.selectedMonths),
                        'periods': [this.runTime.period]
                      });
                    }
                  }
                }
              });
              if (!flag) {
                if (isMonth) {
                  for (let i = 0; i < this.runTimeVar.months.length; i++) {
                    if (this.runTimeVar.months[i].month && _.isEqual(this.runTimeVar.months[i].month, this.runTime.months) || _.isEqual(this.runTimeVar.months[i].month.toString().split(' '), this.runTime.months)) {
                      if ((!this.runTimeVar.months[i].monthdays)) {
                        this.runTimeVar.months[i].monthdays = {days: []};
                      } else {
                        this.runTimeVar.months[i].monthdays.days = [];
                      }
                      this.runTimeVar.months[i].monthdays.days.push({
                        'day': this.coreService.clone(this.selectedMonths),
                        'periods': [this.runTime.period]
                      });
                      break;
                    }
                  }
                } else {

                  let x;
                  if (!this.runTimeVar.months.monthdays)
                    x = {month: this.runTime.months, monthdays: {days: []}};
                  else {
                    x = {month: this.runTime.months};
                    x.monthdays.days = [];
                  }
                  x.monthdays.days.push({
                    'day': this.coreService.clone(this.selectedMonths),
                    'periods': [this.runTime.period]
                  });
                  this.runTimeVar.months.push(x);
                }
              }
            } else {
              let x;
              if (!this.runTimeVar.months.monthdays)
                x = {month: this.runTime.months, monthdays: {days: []}};
              else {
                x = {month: this.runTime.months};
                x.monthdays.days = [];
              }
              x.monthdays.days.push({
                'day': this.coreService.clone(this.selectedMonths),
                'periods': [this.runTime.period]
              });
              this.runTimeVar.months.push(x);
            }
          } else {
            if (this.runTimeVar.monthdays.days.length > 0) {
              let _period = [];
              this.runTimeVar.monthdays.days.forEach((value) => {
                if (value.day && (_.isEqual(value.day, this.selectedMonths) || _.isEqual(value.day.toString().split(' '), this.selectedMonths))) {
                  if (_.isArray(value.periods)) {
                    value.periods.forEach((res) => {
                      if (res)
                        _period.push(res);

                    });
                  } else {
                    if (value.periods) {
                      _period.push(value.periods);
                    }
                  }
                  _period.push(this.runTime.period);
                  value.periods = _period;
                }
              });
              if (_period.length === 0) {
                if (!_.isArray(this.runTimeVar.monthdays.days)) {
                  this.runTimeVar.monthdays.days = [];
                }
                this.runTimeVar.monthdays.days.push({
                  'day': this.coreService.clone(this.selectedMonths),
                  'periods': [this.runTime.period]
                });
              }
            } else {
              this.runTimeVar.monthdays.days.push({
                'day': this.coreService.clone(this.selectedMonths),
                'periods': [this.runTime.period]
              });
            }
          }
        } else {
          if (this.runTime.months && this.runTime.months.length > 0) {
            if (this.runTimeVar.months.length > 0) {
              let flag = false;
              this.runTimeVar.months.forEach((value) => {
                if (isMonth) {
                  if (value.ultimos && (_.isEqual(value.month, this.runTime.months) || _.isEqual(value.month.toString().split(' '), this.runTime.months))) {
                    flag = true;
                    let _period = [];
                    if (_.isArray(value.ultimos.days)) {
                      value.ultimos.days.forEach((value1) => {
                        if (value1.day && (_.isEqual(value1.day, this.selectedMonthsU) || _.isEqual(value1.day.toString().split(' '), this.selectedMonthsU))) {
                          if (_.isArray(value1.periods)) {
                            value1.periods.forEach((res) => {
                              if (res)
                                _period.push(res);
                            });
                          } else {
                            if (value1.periods) {
                              _period.push(value1.periods);
                            }
                          }
                          _period.push(this.runTime.period);
                          value1.periods = _period;
                        }
                      });
                    } else {
                      if (_.isEqual(value.ultimos.days.day, this.selectedMonthsU) || _.isEqual(value.ultimos.days.day.toString().split(' '), this.selectedMonthsU)) {
                        if (_.isArray(value.ultimos.days.periods)) {
                          value.ultimos.days.periods.forEach((res) => {
                            if (res)
                              _period.push(res);
                          });
                        } else {
                          if (value.ultimos.days.periods)
                            _period.push(value.ultimos.days.periods);
                        }
                        _period.push(this.runTime.period);
                        value.ultimos.days.periods = _period;
                      }
                    }

                    if (_period.length === 0) {
                      if (value.ultimos.days && !_.isEmpty(value.ultimos.days)) {
                        if (!_.isArray(value.ultimos.days)) {
                          let t = [];
                          t.push(this.coreService.clone(value.ultimos.days));
                          value.ultimos.days = t;
                        }
                      } else {
                        value.ultimos.days = [];
                      }

                      value.ultimos.days.push({
                        'day': this.coreService.clone(this.selectedMonthsU),
                        'periods': [this.runTime.period]
                      });
                    }
                  }
                }
              });
              if (!flag) {
                if (isMonth) {
                  for (let i = 0; i < this.runTimeVar.months.length; i++) {

                    if (this.runTimeVar.months[i].month && _.isEqual(this.runTimeVar.months[i].month, this.runTime.months) || _.isEqual(this.runTimeVar.months[i].month.toString().split(' '), this.runTime.months)) {
                      this.runTimeVar.months[i].ultimos = {days: []};
                      this.runTimeVar.months[i].ultimos.days.push({
                        'day': this.coreService.clone(this.selectedMonthsU),
                        'periods': [this.runTime.period]
                      });
                      break;
                    }
                  }

                } else {
                  let x = {month: this.runTime.months, ultimos: {days: []}};
                  x.ultimos.days.push({
                    'day': this.coreService.clone(this.selectedMonthsU),
                    'periods': [this.runTime.period]
                  });
                  this.runTimeVar.months.push(x);
                }
              }
            } else {
              let x = {month: this.runTime.months, ultimos: {days: []}};
              x.ultimos.days.push({
                'day': this.coreService.clone(this.selectedMonthsU),
                'periods': [this.runTime.period]
              });
              this.runTimeVar.months.push(x);
            }
          } else {
            if (this.runTimeVar.ultimos.days.length > 0) {
              let _period = [];
              this.runTimeVar.ultimos.days.forEach((value) => {
                if (value.day && (_.isEqual(value.day, this.selectedMonthsU) || _.isEqual(value.day.toString().split(' '), this.selectedMonthsU))) {
                  if (_.isArray(value.periods)) {
                    value.periods.forEach((res) => {
                      if (res)
                        _period.push(res);
                    });
                  } else {
                    if (value.periods) {
                      _period.push(value.periods);

                    }
                  }
                  _period.push(this.runTime.period);
                  value.periods = _period;
                }
              });

              if (_period.length === 0) {
                if (!_.isArray(this.runTimeVar.ultimos.days)) {
                  this.runTimeVar.ultimos.days = [];
                }
                this.runTimeVar.ultimos.days.push({
                  'day': this.coreService.clone(this.selectedMonthsU),
                  'periods': [this.runTime.period]
                });
              }
            } else {
              this.runTimeVar.ultimos.days.push({
                'day': this.coreService.clone(this.selectedMonthsU),
                'periods': [this.runTime.period]
              });
            }
          }
        }
      }

    }

    if (this.tempItems.length > 0 && this.runTime.tab === 'specificDays') {
      for (let t = 0; t < this.tempItems.length; t++) {
        console.log(this.tempItems[t], ' >>>>>>>>>>>>>>>>>>>>>>>>>>>>')
        this.runTime.date = this.tempItems[t].date;
        if (this.periodList.length > 0) {
          let flag1 = false;
          for (let i = 0; i < this.periodList.length; i++) {
            this.runTime.str = this.frequencyToString(this.runTime);
            flag1 = _.isEqual(this.periodList[i], this.runTime);
            if (flag1) {
              break;
            }
          }
          if (!flag1) {
            this.periodList.push(this.coreService.clone(this.runTime));
            this.tempRunTime = this.coreService.clone(this.runTimeVar);
          }
        } else {
          this.runTime.str = this.frequencyToString(this.runTime);
          this.periodList.push(this.coreService.clone(this.runTime));
          this.tempRunTime = this.coreService.clone(this.runTimeVar);
        }
      }
    } else {
      if (this.periodList.length > 0) {
        let flag1 = false;
        for (let i = 0; i < this.periodList.length; i++) {
          this.runTime.str = this.frequencyToString(this.runTime);
          flag1 = _.isEqual(this.periodList[i], this.runTime);
          if (flag1) {
            break;
          }
        }
        if (!flag1) {
          this.periodList.push(this.coreService.clone(this.runTime));
          this.tempRunTime = this.coreService.clone(this.runTimeVar);
        }
      } else {
        this.runTime.str = this.frequencyToString(this.runTime);
        this.periodList.push(this.coreService.clone(this.runTime));
        this.tempRunTime = this.coreService.clone(this.runTimeVar);
      }
    }


    let temp = this.coreService.clone(this.runTime);
    this.runTime = {};
    this.runTime.period = {};

    this.runTime.frequency = 'singleStart';
    //TODO
    this.runTime.period.whenHoliday = 'suppress';
    this.runTime.tab = temp.tab;
    this.runTime.all = temp.all;
    this.runTime.allMonth = temp.allMonth;
    this.runTime.isUltimos = temp.isUltimos;
    if (temp.days) {
      this.runTime.days = temp.days;
    }
    if (temp.selectedMonths) {
      this.runTime.selectedMonths = temp.selectedMonths;
    }
    if (temp.selectedMonthsU) {
      this.runTime.selectedMonthsU = temp.selectedMonthsU;
    }
    if (temp.months) {
      this.runTime.months = temp.months;
    }
    if (temp.specificWeekDay) {
      this.runTime.specificWeekDay = temp.specificWeekDay;
    }
    if (temp.which) {
      this.runTime.which = temp.which;
    }
  }

  removePeriodObj(value) {
    if (_.isArray(value.periods)) {
      value.periods.forEach((val, index) => {
        if (_.isEqual(val, this.tempPeriod.period)) {
          value.periods.splice(index, 1);
        }
      });
    } else {
      if (_.isEqual(value.periods, this.tempPeriod.period)) {
        delete value.periods;
        delete value.day;
        delete value.which;
      }
    }
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

  addNewPeriod() {
    const modalRef = this.modalService.open(PeriodEditorComponent, {backdrop: 'static'});
    modalRef.componentInstance.isNew = true;
    modalRef.componentInstance.data = {};
    modalRef.result.then((result) => {
      this.savePeriod({period: result, frequency: {}});
      this.editor.isEnable = true;
    }, (reason) => {
      console.log('close...', reason);
    });
  }

  editPeriod(period) {
    let runTime = this.coreService.clone(period);
    this._tempPeriod = this.coreService.clone(period);
    if (this.editor.update) {
      const modalRef = this.modalService.open(PeriodEditorComponent, {backdrop: 'static'});
      modalRef.componentInstance.isNew = true;
      modalRef.componentInstance.data = period;
      modalRef.result.then((result) => {
        this.savePeriod({period: result, frequency: {}});
        this.editor.isEnable = true;
      }, (reason) => {
        console.log('close...', reason);
      });
    }

    if (runTime.period.singleStart) {
      runTime.frequency = 'singleStart';
    } else if (runTime.period.absoluteRepeat) {
      runTime.frequency = 'absoluteRepeat';
    } else if (runTime.period.repeat) {
      runTime.frequency = 'repeat';
    }

    this.runTime = runTime;
    if (runTime.tab === 'monthDays') {
      if (runTime.isUltimos === 'months') {
        this.selectedMonths = [];
        runTime.selectedMonths.forEach((val) => {
          this.selectMonthDaysFunc(val);
        });
      } else {
        this.selectedMonthsU = [];
        runTime.selectedMonthsU.forEach((val) => {
          this.selectMonthDaysUFunc(val);
        });
      }
    }
  }

  removePeriod(period, index) {
    this.isDelete = true;
    this.periodList.splice(index, 1);
    if (this.periodList.length === 0) {
      let temp = this.coreService.clone(this.runTime);
      this.runTime = {};
      this.runTime.period = {};
      this.runTime.frequency = 'singleStart';
      this.runTime.period.singleStart = '00:00:00';

      this.runTime.period.whenHoliday = 'suppress';
      this.runTime.tab = temp.tab;
      this.runTime.isUltimos = temp.isUltimos;
      this.editor.isEnable = false;
      this.selectedMonths = [];
      this.selectedMonthsU = [];
    }

    if (period.tab === 'specificDays') {
      if (this.tempRunTime.dates) {
        this.tempRunTime.dates.forEach((value) => {
          if (value.date && (_.isEqual(value.date, moment(period.date).format('YYYY-MM-DD')))) {
            if (_.isArray(value.periods)) {
              for (let i = 0; i < value.periods.length; i++) {
                if (_.isEqual(value.periods[i], period.period)) {
                  value.periods.splice(i, 1);
                  break;
                }
              }
            } else {
              if (_.isEqual(value.periods, period.period)) {
                delete value.periods;
                delete value.date;
              }
            }
          }
        });
      }
      if (this.tempRunTime.dates && this.tempRunTime.dates.length > 0) {
        let tempARR = [];
        for (let i = 0; i < this.tempRunTime.dates.length; i++) {
          if (this.tempRunTime.dates[i].date) {
            tempARR.push(this.tempRunTime.dates[i]);
          }
        }
        this.tempRunTime.dates = tempARR;
      }

    } else if (period.tab === 'weekDays') {
      if (period.months && period.months.length > 0) {
        if (this.tempRunTime.month && this.tempRunTime.month.length > 0) {
          for (let i = 0; i < this.tempRunTime.month.length; i++) {
            if (!_.isEmpty(this.tempRunTime.month[i].weekdays)) {
              if (_.isEqual(this.tempRunTime.month[i].month, period.months)) {
                if (this.tempRunTime.month[i].weekdays && this.tempRunTime.month[i].weekdays.days) {
                  if (this.tempRunTime.month[i].weekdays.days.length > 1) {
                    this.tempRunTime.month[i].weekdays.days.forEach((value) => {
                      if (_.isEqual(value.day, period.days)) {
                        if (_.isArray(value.periods)) {
                          for (let j = 0; j < value.periods.length; j++) {
                            if (_.isEqual(value.periods[j], period.period)) {
                              value.periods.splice(j, 1);
                              break;
                            }
                          }
                        } else {

                          if (_.isEqual(value.periods, period.period)) {
                            delete value.periods;
                            delete value.day;
                          }
                        }
                      }
                    });
                  } else {
                    delete this.tempRunTime.month[i]['weekdays'];
                  }
                }
              }
            }
          }
        }
      } else {
        if (this.tempRunTime.weekdays && this.tempRunTime.weekdays.days) {
          this.tempRunTime.weekdays.days.forEach((value) => {
            if (value.day && _.isEqual(value.day, period.days)) {
              if (_.isArray(value.periods)) {
                if (value.periods.length > 1) {
                  for (let i = 0; i < value.periods.length; i++) {
                    if (_.isEqual(value.periods[i], period.period)) {
                      value.periods.splice(i, 1);
                      break;
                    }
                  }
                } else {
                  if (_.isEqual(value.periods[0], period.period)) {
                    this.tempRunTime.weekday.day.splice(index, 1);
                  }
                }
              } else {
                if (_.isEqual(value.periods, period.period)) {
                  delete value.periods;
                  delete value.day;
                }
              }
            }
          });
          if (this.tempRunTime.weekdays.days && this.tempRunTime.weekdays.days.length > 0) {
            let tempARR = [];
            for (let i = 0; i < this.tempRunTime.weekdays.days.length; i++) {
              if (this.tempRunTime.weekdays.days[i].day) {
                tempARR.push(this.tempRunTime.weekdays.days[i]);
              }
            }
            this.tempRunTime.weekdays.days = tempARR;
          }
        }
      }
    } else if (period.tab === 'monthDays') {
      if (period.isUltimos === 'months') {
        if (period.months && period.months.length > 0) {
          if (this.tempRunTime.month && this.tempRunTime.month.length > 0) {
            for (let i = 0; i < this.tempRunTime.month.length; i++) {
              if (!_.isEmpty(this.tempRunTime.month[i].monthdays)) {
                if (_.isEqual(this.tempRunTime.month[i].month, period.months)) {
                  if (this.tempRunTime.month[i].monthdays && this.tempRunTime.month[i].monthdays.days) {
                    if (this.tempRunTime.month[i].monthdays.days.length > 1) {
                      this.tempRunTime.month[i].monthdays.days.forEach((value) => {
                        if (_.isEqual(value.day, period.selectedMonths)) {
                          if (_.isArray(value.periods)) {
                            for (let j = 0; j < value.periods.length; j++) {
                              if (_.isEqual(value.periods[j], period.period)) {
                                value.periods.splice(j, 1);
                                break;
                              }
                            }
                          } else {

                            if (_.isEqual(value.periods, period.period)) {
                              delete value.periods;
                              delete value.day;
                            }
                          }
                        }
                      });
                    } else {
                      delete this.tempRunTime.month[i].monthdays['days'];
                    }
                  }
                }
              }
            }
          }
        } else {
          if (this.tempRunTime.monthdays && this.tempRunTime.monthdays.days) {
            this.tempRunTime.monthdays.days.forEach((value) => {

              if (value.day && _.isEqual(value.day, period.selectedMonths)) {
                if (_.isArray(value.periods)) {
                  if (value.periods.length > 1) {
                    for (let i = 0; i < value.periods.length; i++) {
                      if (_.isEqual(value.periods[i], period.period)) {
                        value.periods.splice(i, 1);
                        break;
                      }
                    }
                  } else {
                    if (_.isEqual(value.periods[0], period.period)) {
                      this.tempRunTime.monthdays.days.splice(index, 1);
                    }
                  }
                } else {
                  if (_.isEqual(value.periods, period.period)) {
                    delete value.periods;
                    delete value.day;
                  }
                }
              }
            });
            if (this.tempRunTime.monthdays.days && this.tempRunTime.monthdays.days.length > 0) {
              let tempARR = [];
              for (let i = 0; i < this.tempRunTime.monthdays.days.length; i++) {
                if (this.tempRunTime.monthdays.days[i].day) {
                  tempARR.push(this.tempRunTime.monthdays.days[i]);
                }
              }
              this.tempRunTime.monthdays.days = tempARR;
            }
          }
        }
      } else {
        if (period.months && period.months.length > 0) {
          if (this.tempRunTime.month && this.tempRunTime.month.length > 0) {
            for (let i = 0; i < this.tempRunTime.month.length; i++) {
              if (!_.isEmpty(this.tempRunTime.month[i].ultimos)) {
                if (_.isEqual(this.tempRunTime.month[i].month, period.months)) {
                  if (this.tempRunTime.month[i].ultimos && this.tempRunTime.month[i].ultimos.days) {
                    if (this.tempRunTime.month[i].ultimos.days.length > 1) {
                      this.tempRunTime.month[i].ultimos.days.forEach((value) => {
                        if (_.isEqual(value.day, period.selectedMonthsU)) {
                          if (_.isArray(value.periods)) {
                            for (let j = 0; j < value.periods.length; j++) {
                              if (_.isEqual(value.periods[j], period.period)) {
                                value.periods.splice(j, 1);
                                break;
                              }
                            }
                          } else {

                            if (_.isEqual(value.periods, period.period)) {
                              delete value.periods;
                              delete value.day;
                            }
                          }
                        }
                      });
                    } else {
                      delete this.tempRunTime.month[i].ultimos['days'];
                    }
                  }
                }
              }
            }
          }
        } else {
          if (this.tempRunTime.ultimos && this.tempRunTime.ultimos.days) {
            this.tempRunTime.ultimos.days.forEach((value) => {
              if (value.day && _.isEqual(value.day, period.selectedMonthsU)) {
                if (_.isArray(value.periods)) {
                  if (value.periods.length > 1) {
                    for (let i = 0; i < value.periods.length; i++) {
                      if (_.isEqual(value.periods[i], period.period)) {
                        value.periods.splice(i, 1);
                        break;
                      }
                    }
                  } else {
                    if (_.isEqual(value.periods[0], period.period)) {
                      this.tempRunTime.ultimos.days.splice(index, 1);
                    }
                  }
                } else {
                  if (_.isEqual(value.periods, period.period)) {
                    delete value.periods;
                    delete value.day;
                  }
                }
              }
            });
            if (this.tempRunTime.ultimos.days && this.tempRunTime.ultimos.days.length > 0) {
              let tempARR = [];
              for (let i = 0; i < this.tempRunTime.ultimos.days.length; i++) {
                if (this.tempRunTime.ultimos.days[i].day) {
                  tempARR.push(this.tempRunTime.ultimos.days[i]);
                }
              }
              this.tempRunTime.ultimos.days = tempARR;
            }
          }
        }
      }

    } else if (period.tab === 'specificWeekDays') {
      if (period.months && period.months.length > 0) {
        if (this.tempRunTime.month && this.tempRunTime.month.length > 0) {
          for (let i = 0; i < this.tempRunTime.month.length; i++) {
            if (!_.isEmpty(this.tempRunTime.month[i].monthdays.weekdays)) {
              if (_.isEqual(this.tempRunTime.month[i].month, period.months)) {
                if (this.tempRunTime.month[i].monthdays && this.tempRunTime.month[i].monthdays.weekdays) {
                  if (this.tempRunTime.month[i].monthdays.weekdays.length > 1) {
                    this.tempRunTime.month[i].monthdays.weekdays.forEach((value) => {
                      if (_.isEqual(value.day, period.specificWeekDay) && _.isEqual(value.which, period.which)) {
                        if (_.isArray(value.periods)) {
                          for (let j = 0; j < value.periods.length; j++) {
                            if (_.isEqual(value.periods[i], period.period)) {
                              value.periods.splice(i, 1);
                              break;
                            }
                          }
                        } else {

                          if (_.isEqual(value.periods, period.period)) {
                            delete value.periods;
                            delete value.day;
                          }
                        }
                      }
                    });
                  } else {
                    delete this.tempRunTime.month[i].monthdays['weekdays'];
                  }
                }
              }
            }
          }
        }
      } else {
        if (this.tempRunTime.monthdays && this.tempRunTime.monthdays.weekdays) {
          this.tempRunTime.monthdays.weekdays.forEach((value, index1) => {
            if (value.day && (_.isEqual(value.day, period.specificWeekDay) && _.isEqual(value.which, period.which))) {
              if (_.isArray(value.periods)) {
                if (value.periods.length > 1) {
                  for (let i = 0; i < value.periods.length; i++) {
                    if (_.isEqual(value.periods[i], period.period)) {
                      value.periods.splice(i, 1);
                      break;
                    }
                  }
                } else {
                  if (_.isEqual(value.periods[0], period.period)) {
                    this.tempRunTime.monthdays.weekdays.splice(index1, 1);
                  }
                }
              } else {
                if (_.isEqual(value.periods, period.period)) {
                  delete value.periods;
                  delete value.day;
                  delete value.which;
                }
              }
            }
          });

        }
      }
    }
    if (this.tempRunTime.month && this.tempRunTime.month.length > 0) {
      let tempARR = [];
      for (let i = 0; i < this.tempRunTime.month.length; i++) {
        if (this.tempRunTime.month[i].weekdays || this.tempRunTime.month[i].monthdays || this.tempRunTime.month[i].ultimos) {
          tempARR.push(this.tempRunTime.month[i]);
        }
      }
      this.tempRunTime.month = tempARR;
    }
  }

  deletePeriod(index) {
    this.periodList.splice(index, 1);
  }

  savePeriod(data1) {
    let data = this.coreService.clone(data1);
    if (data.frequency && !_.isEmpty(data.frequency)) {
      this._editRunTime(data);
    } else {
      console.log('ha yaha....', data)
      this.runTime.period = data.period.period;
      this.runTime.frequency = data.period.frequency;
      if (this.editor.update) {
        if (this._tempPeriod && !_.isEmpty(this._tempPeriod)) {
          for (let i = 0; i < this.periodList.length; i++) {
            if (_.isEqual(this.periodList[i], this._tempPeriod)) {
              this.periodList[i] = this.coreService.clone(this.runTime);
            }
          }
          this._tempPeriod = {};
        } else {
          if (this.runTime.tab === 'monthDays') {
            if (this.selectedMonths && this.runTime.isUltimos === 'months') {
              this.runTime.selectedMonths = this.selectedMonths;
            } else if (this.selectedMonthsU && this.runTime.isUltimos === 'ultimos') {
              this.runTime.selectedMonthsU = this.selectedMonthsU;
            }
          }
          this.runTime.str = this.frequencyToString(this.runTime);
          this.periodList.push(this.coreService.clone(this.runTime));
        }
        this.runTime.frequency = undefined;
        this.runTime.period = {};
      }
    }
  }

  /** ===================== End Period  ======================*/

  /** --------- Begin Restriction  ----------------*/

  addRestrictionInCalendar(data) {
    if (data.calendar) {
      data.calendar.uniqueId = 'uniqueId';
    } else {
      data.uniqueId = 'uniqueId';
    }
    const modalRef = this.modalService.open(AddRestrictionModalComponent, {
      backdrop: 'static',
      size: 'lg'
    });
    modalRef.componentInstance.schedulerId = this.schedulerId;
    modalRef.componentInstance.preferences = this.preferences;
    modalRef.componentInstance.data = data;

    modalRef.result.then((result) => {
      this.saveRestriction(result);
    }, (reason) => {
      console.log('close...', reason);
    });
  }

  editRestrictionInCalendar(data, frequency) {
    if (data.calendar) {
      data.calendar.uniqueId = 'uniqueId';
    } else {
      data.uniqueId = 'uniqueId';
    }
    const modalRef = this.modalService.open(AddRestrictionModalComponent, {
      backdrop: 'static',
      size: 'lg'
    });
    modalRef.componentInstance.schedulerId = this.schedulerId;
    modalRef.componentInstance.preferences = this.preferences;
    modalRef.componentInstance.data = {
      calendar: data.calendar || data,
      updateFrequency: frequency
    };

    modalRef.result.then((result) => {
      this.saveRestriction(result);
    }, (reason) => {
      console.log('close...', reason);
    });
  }

  deleteRestrictionInCalendar(data, frequency, index) {
    for (let i = 0; i < data.calendar.frequencyList.length; i++) {
      if (data.calendar.frequencyList[i].str === frequency.str) {
        data.calendar.frequencyList.splice(i, 1);
        break;
      }
    }
    for (let i = 0; i < this.selectedCalendar.length; i++) {
      if (data.path === this.selectedCalendar[i].path) {
        console.log('i...', i);
        let isMatch = false;
        for (let j = 0; j < this.selectedCalendar[i].frequencyList.length; j++) {
          if (this.selectedCalendar[i].frequencyList[j].str === frequency.str) {
            this.selectedCalendar[i].frequencyList(j, 1);
            isMatch = true;
            break;
          }
        }
        if (isMatch) {
          break;
        }
      }
    }
    this.generateCalendarTag(this.selectedCalendar, 'working');
  }

  private saveRestriction(data) {
    for (let i = 0; i < this.runtimeList.length; i++) {
      if (this.runtimeList[i].type === 'calendar' && data.path === this.runtimeList[i].calendar.path && this.runtimeList[i].calendar.uniqueId) {
        this.runtimeList[i].calendar.frequencyList = data.frequencyList;
        delete this.runtimeList[i].calendar['uniqueId'];
        break;
      }
    }
    this.generateCalendarTag(this.selectedCalendar, 'working');
  }

  getDates(list, type, index) {
    let _json = this.coreService.clone(this.jsonObj);
    let run_time = _json.run_time || _json.schedule || {};
    let calendar = list[index];
    if (!calendar.basedOn) {
      calendar.basedOn = calendar.path;
    }
    let obj = {
      jobschedulerId: this.schedulerId,
      calendar: {includes: {}},
      basedOn: calendar.basedOn
    };
    if (calendar.frequencyList && calendar.frequencyList.length > 0) {
      calendar.frequencyList.forEach((data) => {
        obj.calendar = this.calendarService.generateCalendarObj(data, obj.calendar);
      });
    }
    this.coreService.post('plan/from_run_time', {
      jobschedulerId: this.schedulerId,
      runTime: run_time,
      dateFrom: moment(this.firstDay).format('YYYY-MM-DD'),
      dateTo: moment(this.lastDay).format('YYYY-MM-DD')
    }).subscribe((result: any) => {
      if (result.dates && result.dates.length === 0) {
        console.log('>>>>>>>>>>>>NO DATE FOUND<<<<<<<<<<<<<<<');
      }
      this.calendarToXML(type, index, result.dates, calendar, list, run_time);
      index = index + 1;
      if (list[index]) {
        this.getDates(list, type, index);
      }
    }, () => {
      this.calendarToXML(type, index, [], calendar, list, run_time);
      index = index + 1;
      if (list[index]) {
        this.getDates(list, type, index);
      }
    });
  }

  /** ===================== End Restriction  ======================*/

  generateCalendarTag(list, type) {
    let index = 0;
    if (list.length > 0) {
      this.getDates(list, type, index);
    }
  }

  calendarToXML(type, index, dates, calendar, list, run_time) {
    if (type == 'holiday') {
      this.generateHolidayCalendarDates(run_time, dates, calendar);
      if (list.length != this.holidayCalendar.length) {
        this.holidayCalendar = list;
      }
    } else {
      this.generateCalendarDates(run_time, dates, calendar);
      if (list.length != this.selectedCalendar.length) {
        this.selectedCalendar = list;
      }
    }
    if (index == list.length - 1) {
      this.resetPeriodObj(run_time);
    }
  }

  getPlan(newYear, newMonth, isReload) {
    let year = newYear || new Date().getFullYear(), month = newMonth || new Date().getMonth();
    if (!isReload) {
      $('#year-calendar').data('calendar').setYearView({view: this.viewCalObj.calendarView, year: year});
      month = $('#year-calendar').data('calendar').getMonth();
    }
    let firstDay2 = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0);
    let lastDay2 = new Date(year, 11, 31, 23, 59, 0);
    if (this.viewCalObj.calendarView == 'year') {
      if (year < new Date().getFullYear()) {
        return;
      } else if (year == new Date().getFullYear()) {
        firstDay2 = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0);
      } else {
        firstDay2 = new Date(year, 0, 1, 0, 0, 0);
      }
    }
    if (this.viewCalObj.calendarView == 'month') {
      if (year <= new Date().getFullYear() && month < new Date().getMonth()) {
        return;
      } else if (year == new Date().getFullYear() && month == new Date().getMonth()) {
        firstDay2 = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0);
      } else {
        firstDay2 = new Date(year, month, 1, 0, 0, 0);
      }
      lastDay2 = new Date(year, month + 1, 0, 23, 59, 0);
    }
    if (new Date(firstDay2) >= new Date(this.firstDay) && new Date(lastDay2) <= new Date(this.lastDay)) {
      this.isCalendarLoading = false;
      return;
    }
    this.isCalendarLoading = true;
    this.firstDay = firstDay2;
    this.lastDay = lastDay2;
    this.planItems = [];
    this.getPlansFromRuntime(this.firstDay, this.lastDay);
  }

  populatePlanItems(res) {
    if (res.periods) {
      res.periods.forEach((value) => {
        let planData: any = {};
        if (value.begin) {
          planData = {
            plannedStartTime: moment(value.begin).tz(this.preferences.zone)
          };
          if (value.end) {
            planData.endTime = this.calendarService.getTimeFromDate(moment(value.end).tz(this.preferences.zone));
          }
          if (value.repeat) {
            planData.repeat = value.repeat;
          }
          if (value.absoluteRepeat) {
            planData.absoluteRepeat = value.absoluteRepeat;
          }
        } else if (value.singleStart) {
          planData = {
            plannedStartTime: moment(value.singleStart).tz(this.preferences.zone)
          };
        }
        let date = new Date(planData.plannedStartTime).setHours(0, 0, 0, 0);
        planData.startDate = date;
        planData.endDate = date;
        planData.color = 'blue';
        this.planItems.push(planData);
      });
    }
  }

  planFromRuntime() {
    this.calendarTitle = new Date().getFullYear();
    this.isCalendarLoading = true;
    this.editor.showPlanned = true;
    this.planItems = [];
    this.firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0);
    this.lastDay = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 0);
    this.getPlansFromRuntime(this.firstDay, this.lastDay);
  }

  getPlansFromRuntime(firstDay, lastDay) {
    let run_time = this.jsonObj.run_time;
    this.coreService.post('plan/from_run_time', {
      jobschedulerId: this.schedulerId,
      runTime: run_time,
      dateFrom: moment(firstDay).format('YYYY-MM-DD'),
      dateTo: moment(lastDay).format('YYYY-MM-DD')
    }).subscribe((res: any) => {
      if ($('#year-calendar') && $('#year-calendar').data('calendar')) {

      } else {
        $('#year-calendar').calendar({
          language: localStorage.$SOS$LANG,
          view: 'month',
          startYear: this.calendarTitle,
          renderEnd: (e) => {
            this.calendarTitle = e.currentYear;
            if (this.isCalendarDisplay) {
              this.viewCalObj.calendarView = e.view;
              this.getPlan(e.currentYear, e.currentMonth, true);
            }
          }
        });
      }
      this.populatePlanItems(res);
      $('#year-calendar').data('calendar').setDataSource(this.planItems);
      this.isCalendarDisplay = true;
      this.isCalendarLoading = false;
    }, () => {
      this.isCalendarLoading = false;
    });
  }

  /** --------- Begin Calendar  ----------------*/

  previewCalendar(data) {
    this.isCalendarDisplay = false;
    this.editor.showHolidayTab = false;
    this.editor.showCalendarTab = true;
    this.planItems = [];
    this.calendarTitle = new Date().getFullYear();
    let obj: any = {};
    if ($('#full-calendar') && $('#full-calendar').data('calendar')) {

    } else {
      $('#full-calendar').calendar({
        language: localStorage.$SOS$LANG,
        view: 'year',
        renderEnd: (e) => {
          this.calendarTitle = e.currentYear;
          if (this.isCalendarDisplay) {
            if (e.view === 'year') {
              this.changeDate();
            }
          }
        }
      });
    }
    if (data.calendar) {
      this.calendarObj = data.calendar;
    } else {
      this.calendarObj = data;
    }

    this.calendarObj.from = data.calendar.from || moment().format('YYYY-MM-DD');
    this.calendarObj.to = data.calendar.to;
    obj.dateFrom = this.calendarObj.from;
    obj.dateTo = this.calendarObj.to;
    this.toDate = this.coreService.clone(obj.dateTo);
    if (new Date(obj.dateTo).getTime() > new Date(this.calendarTitle + '-12-31').getTime()) {
      obj.dateTo = this.calendarTitle + '-12-31';
    }
    obj.path = this.calendarObj.path;
    obj.jobschedulerId = this.schedulerId;
    this.coreService.post('calendar/dates', obj).subscribe((result: any) => {
      result.dates.forEach((date) => {
        this.planItems.push({
          startDate: moment(date),
          endDate: moment(date),
          color: 'blue'
        });
      });
      result.withExcludes.forEach((date) => {
        this.planItems.push({
          startDate: moment(date),
          endDate: moment(date),
          color: 'orange'
        });
      });
      this.tempList = this.coreService.clone(this.planItems);
      $('#full-calendar').data('calendar').setDataSource(this.planItems);
      setTimeout(() => {
        this.isCalendarDisplay = true;
      }, 100);
    });

  }

  changeDate() {
    let newDate = new Date(), toDate;
    newDate.setHours(0, 0, 0, 0);
    if (new Date(this.toDate).getTime() > new Date(this.calendarTitle + '-12-31').getTime()) {
      toDate = this.calendarTitle + '-12-31';
    } else {
      toDate = this.toDate;
    }
    if (newDate.getFullYear() < this.calendarTitle && (new Date(this.calendarTitle + '-01-01').getTime() < new Date(toDate).getTime())) {
      this.planItems = [];
      let obj: any = {};
      obj.jobschedulerId = this.schedulerId;
      obj.calendar = {};
      obj.dateFrom = this.calendarTitle + '-01-01';
      obj.dateTo = toDate;
      obj.path = this.calendarObj.path;
      this.coreService.post('calendar/dates', obj).subscribe((result: any) => {
        result.dates.forEach((date) => {
          this.planItems.push({
            startDate: moment(date),
            endDate: moment(date),
            color: 'blue'
          });
        });
        result.withExcludes.forEach((date) => {
          this.planItems.push({
            startDate: moment(date),
            endDate: moment(date),
            color: 'orange'
          });
        });
        $('#full-calendar').data('calendar').setDataSource(this.planItems);
      });
    } else if (newDate.getFullYear() == this.calendarTitle) {
      this.planItems = this.coreService.clone(this.tempList);
      $('#full-calendar').data('calendar').setDataSource(this.planItems);
    }
  }

  deleteCalendar(data) {
    let _json = this.jsonObj;
    let run_time = _json.run_time || _json.schedule;
    if (!run_time) {
      return;
    }
    for (let x = 0; x < this.selectedCalendar.length; x++) {
      if (data.calendar.path == this.selectedCalendar[x].path) {
        this.selectedCalendar.splice(x, 1);
        break;
      }
    }
    if (run_time.dates) {
      if (!_.isArray(run_time.dates)) {
        delete run_time['dates'];
      } else {
        let _tempList = this.coreService.clone(run_time.dates);
        _tempList.forEach((value) => {
          if (value.calendar && value.calendar == data.calendar.path) {
            for (let i = 0; i < run_time.dates.length; i++) {
              if (value.calendar == run_time.dates[i].calendar) {
                run_time.dates.splice(i, 1);
                break;
              }
            }
          }
        });

      }
    }
    this.resetPeriodObj(run_time);
  }

  deleteHolidayCalendar(data) {
    let _json = this.jsonObj;
    let run_time = _json.run_time || _json.schedule;
    if (!run_time) {
      return;
    }
    for (let x = 0; x < this.holidayCalendar.length; x++) {
      if (data.path === this.holidayCalendar[x].path) {
        this.holidayCalendar.splice(x, 1);
        break;
      }
    }
    if (run_time.holidays) {
      if (!_.isArray(run_time.holidays.days)) {
        delete run_time.holidays['days'];
      } else {
        let _tempList = this.coreService.clone(run_time.holidays.days);
        _tempList.forEach((value) => {
          if (value.calendar && value.calendar == data.path) {
            for (let i = 0; i < run_time.holidays.days.length; i++) {
              if (value.calendar == run_time.holidays.days[i].calendar) {
                run_time.holidays.days.splice(i, 1);
                break;
              }
            }
          }
        });

      }
      if (run_time.holidays.days && _.isArray && run_time.holidays.days.length === 0) {
        delete run_time.holidays['days'];
      }
    }
    this.resetPeriodObj(run_time);
  }

  /** ==================== End Restriction  ========================*/

  /** ================== End Calendar  =======================*/

  ngOnDestroy(): void {
    console.log(this.jsonObj);
    this.jsonObj.run_time.calendars = [];
    this.setCalendarToRuntime(this.jsonObj.run_time);
    this.runTimeJSON.runTime = this.jsonObj.run_time;
  }

  private setCalendarToRuntime(obj) {
    if (this.selectedCalendar && this.selectedCalendar.length > 0) {
      this.selectedCalendar.forEach((value) => {
        let cal: any = {};
        cal.basedOn = value.path;
        cal.includes = {};
        cal.type = 'WORKING_DAYS';
        value.frequencyList.forEach((data) => {
          cal = this.calendarService.generateCalendarObj(data, cal);
        });
        cal.periods = [];
        if (value.periods) {
          for (let i = 0; i < value.periods.length; i++) {
            if (value.periods[i]) {
              cal.periods.push(value.periods[i]);
            }
          }
        }
        obj.calendars.push(cal);
      });
    }
    if (this.holidayCalendar && this.holidayCalendar.length > 0) {
      this.holidayCalendar.forEach((value) => {
        let cal: any = {};
        cal.basedOn = value.path;
        cal.type = 'NON_WORKING_DAYS';
        value.frequencyList.forEach((data) => {
          cal = this.calendarService.generateCalendarObj(data, cal);
        });
        obj.calendars.push(cal);
      });
    }
  }

  back(): void {
    this.editor.hidePervious = false;
    this.periodList = [];
    this.getXml2Json(this.coreService.clone(this.jsonObj), false);
  }

  back1(): void {
    this.editor.showHolidayTab = false;
    this.editor.showCalendarTab = false;
    this.getXml2Json(this.coreService.clone(this.jsonObj), false);
  }

  private initSpecificDayCalendar() {
    console.log('initSpecificDayCalendar>>>>>>')
    this.tempItems = [];
    const dom = $('#calendar');
    if (dom && dom.data('calendar')) {

    } else {
      let date = new Date();
      date.setDate(new Date().getDate() - 1);
      dom.calendar({
        minDate: date,
        language: localStorage.$SOS$LANG,
        clickDay: (e) => {
          this.selectDate(e);
        }
      });
    }
    console.log(this.runTime.date, '><><><')

    if (this.runTime.date) {
      let date = new Date(this.runTime.date).setHours(0, 0, 0, 0);
      let planData = {
        startDate: date,
        endDate: date,
        date: date,
        color: 'blue'
      };
      this.tempItems.push(planData);
      $('#calendar').data('calendar').setDataSource(this.tempItems);
    }
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

  private _updateperiodObj(res, periodStrArr, objArr, isCheck, parent) {
    if (res.periods && res.periods.length > 0) {
      res.periods.forEach((res1) => {
        let periodStr = null;
        if (res1.begin) {
          periodStr = res1.begin;
        }
        if (res1.end) {
          periodStr = periodStr + '-' + res1.end;
        }
        if (res1.singleStart) {
          periodStr = 'Single start: ' + res1.singleStart;
        } else if (res1.absoluteRepeat) {
          periodStr = periodStr + ' every ' + this.calendarService.getTimeInString(res1.absoluteRepeat);
        } else if (res1.repeat) {
          periodStr = periodStr + ' every ' + this.calendarService.getTimeInString(res1.repeat);
        }
        if (periodStr)
          periodStrArr.push(periodStr);
        objArr.push({
          day: res.day,
          date: res.date,
          which: res.which,
          month: parent ? parent.month : undefined,
          periods: _.isEmpty(res1) ? [] : [res1]
        });
      });
    } else if (isCheck) {
      objArr.push({
        day: res.day,
        which: res.which,
        month: parent ? parent.month : undefined,
        periods: []
      });
    }
  }

  private _editRunTime(data) {
    if (data.frequency.frequency && data.frequency.frequency.calendar) {
      this.addPeriodInCalendar(this.coreService.clone(data));
      return;
    }
    this.updateTime = this.coreService.clone(data.frequency.frequency);
    this.periodList = [];
    this.runTime = {};
    if (!_.isEmpty(this.updateTime.obj) && _.isArray(this.updateTime.obj)) {
      this.updateTime.obj.forEach((value) => {
        if (value.periods && value.periods.length > 0) {
          let obj: any = {};
          if (this.updateTime.type2) {
            obj.tab = this.updateTime.type2 === 'weekdays' ? 'weekDays' : this.updateTime.type2 === 'monthdays' ? 'monthDays' : this.updateTime.type2 === 'weekday' ? 'specificWeekDays' : this.updateTime.type2 === 'ultimos' ? 'monthDays' : 'specificDays';
          } else {
            obj.tab = this.updateTime.type === 'weekdays' ? 'weekDays' : this.updateTime.type === 'monthdays' ? 'monthDays' : this.updateTime.type === 'weekday' ? 'specificWeekDays' : this.updateTime.type === 'ultimos' ? 'monthDays' : 'specificDays';
          }

          if (this.updateTime.type === 'ultimos' || this.updateTime.type2 === 'ultimos') {
            obj.isUltimos = 'ultimos';
          } else {
            obj.isUltimos = 'months';
          }
          obj.period = {};

          let x;
          if (_.isArray(value.periods)) {
            x = value.periods[0];
          } else {
            x = value.periods;
          }

          if (x.singleStart) {
            obj.frequency = 'singleStart';
            obj.period.singleStart = x.singleStart;
          } else if (x.absoluteRepeat) {
            obj.frequency = 'absoluteRepeat';
            obj.period.absoluteRepeat = x.absoluteRepeat;
          } else if (x.repeat) {
            obj.frequency = 'repeat';
            obj.period.repeat = x.repeat;
          }
          if (x.begin) {
            obj.period.begin = x.begin;
          }
          if (x.end) {
            obj.period.end = x.end;
          }
          if (x.whenHoliday) {
            obj.period.whenHoliday = x.whenHoliday;
          }
          if (obj.tab === 'weekDays') {
            obj.days = value.day.toString().split(' ').sort();
          } else if (obj.tab === 'monthDays') {
            if (obj.isUltimos === 'ultimos') {
              obj.selectedMonthsU = value.day.toString().split(' ').sort(this.calendarService.compareNumbers);
            } else {
              obj.selectedMonths = value.day.toString().split(' ').sort(this.calendarService.compareNumbers);
            }
          } else if (obj.tab === 'specificWeekDays') {
            obj.specificWeekDay = value.day;
            obj.which = value.which;
          } else if (obj.tab === 'specificDays') {
            obj.date = new Date(value.date);
          }

          if (value.month) {
            obj.months = value.month.toString().split(' ').sort(this.calendarService.compareNumbers);
          }
          obj.str = this.frequencyToString(obj);
          this.periodList.push(obj);
        }
      });
    }

    if (!_.isEmpty(this.updateTime)) {
      if (this.updateTime.type === 'date') {
        if (_.isArray(this.runTimeVar.dates)) {
          this.runTimeVar.dates.forEach((res1, index) => {
            if (_.isEqual(res1.date, this.updateTime.obj[0].date)) {
              this.runTimeVar.dates.splice(index, 1);
            }
          });
        } else {
          if (_.isEqual(this.runTimeVar.dates.date, this.updateTime.obj[0].date)) {
            delete this.runTimeVar['dates'];
          }
        }
      } else if (this.updateTime.type === 'weekdays') {
        if (this.runTimeVar.weekdays) {
          if (_.isArray(this.runTimeVar.weekdays.days)) {
            this.runTimeVar.weekdays.days.forEach((res1, index) => {
              if (_.isEqual(res1.day, this.updateTime.obj[0].day)) {
                this.runTimeVar.weekdays.days.splice(index, 1);
              }
            });
          } else {
            if (_.isEqual(this.runTimeVar.weekdays.days.day, this.updateTime.obj[0].day)) {
              delete this.runTimeVar['weekdays'];
            }

          }
        }
      } else if (this.updateTime.type === 'monthdays') {
        if (this.runTimeVar.monthdays) {
          if (_.isArray(this.runTimeVar.monthdays.days)) {
            this.runTimeVar.monthdays.days.forEach((res1, index) => {
              if (_.isEqual(res1.day, this.updateTime.obj[0].day)) {
                this.runTimeVar.monthdays.days.splice(index, 1);
              }
            });
          } else {
            if (_.isEqual(this.runTimeVar.monthdays.days.day, this.updateTime.obj[0].day)) {
              delete this.runTimeVar.monthdays['days'];
            }
          }
        }

      } else if (this.updateTime.type === 'weekday') {
        if (this.runTimeVar.monthdays) {
          if (_.isArray(this.runTimeVar.monthdays.weekdays)) {
            this.runTimeVar.monthdays.weekdays.forEach((res1, index) => {
              if (_.isEqual(res1.which, this.updateTime.obj[0].which) && _.isEqual(res1.day, this.updateTime.obj[0].day)) {
                this.runTimeVar.monthdays.weekdays.splice(index, 1);
              }
            });
          } else {
            if (_.isEqual(this.runTimeVar.monthdays.weekdays.day, this.updateTime.obj[0].weekday) && _.isEqual(this.runTimeVar.monthdays.weekdays.which, this.updateTime.obj[0].which)) {
              delete this.runTimeVar.monthdays['weekdays'];
            }
          }
        }
      } else if (this.updateTime.type === 'ultimos') {
        if (this.runTimeVar.ultimos) {
          if (_.isArray(this.runTimeVar.ultimos.days)) {
            this.runTimeVar.ultimos.days.forEach((res1, index) => {
              if (_.isEqual(res1.day, this.updateTime.obj[0].day)) {
                this.runTimeVar.ultimos.days.splice(index, 1);
              }
            });
          } else {
            if (_.isEqual(this.runTimeVar.ultimos.days.day, this.updateTime.obj[0].day)) {
              delete this.runTimeVar['ultimos'];
            }
          }
        }
      } else if (this.updateTime.type === 'month') {
        if (this.updateTime.type2 === 'weekdays') {
          if (_.isArray(this.runTimeVar.months)) {
            this.runTimeVar.months.forEach((res) => {
              if (_.isEqual(res.month, this.updateTime.obj[0].month)) {
                if (_.isArray(res.weekdays.days)) {
                  res.weekdays.days.forEach((res1, index) => {
                    if (_.isEqual(res1.day, this.updateTime.obj[0].day)) {
                      res.weekdays.days.splice(index, 1);
                    }
                  });
                } else {
                  if (_.isEqual(res.weekdays.days.day, this.updateTime.obj[0].day)) {
                    delete res['weekdays'];
                  }
                }
              }
            });
          }
        } else if (this.updateTime.type2 === 'monthdays') {

          if (_.isArray(this.runTimeVar.months)) {
            this.runTimeVar.months.forEach((res) => {
              if (_.isEqual(res.month, this.updateTime.obj[0].month)) {

                if (_.isArray(res.monthdays.days)) {

                  res.monthdays.days.forEach((res1, index) => {

                    if (_.isEqual(res1.day, this.updateTime.obj[0].day)) {
                      res.monthdays.days.splice(index, 1);
                    }
                  });
                } else {
                  if (_.isEqual(res.monthdays.days.day, this.updateTime.obj[0].day)) {
                    delete res.monthdays['days'];
                  }

                }
              }
            });
          }
        } else if (this.updateTime.type2 === 'ultimos') {
          if (_.isArray(this.runTimeVar.months)) {
            this.runTimeVar.months.forEach((res) => {
              if (_.isEqual(res.month, this.updateTime.obj[0].month)) {
                if (_.isArray(res.ultimos.days)) {
                  res.ultimos.days.forEach((res1, index) => {
                    if (_.isEqual(res1.day, this.updateTime.obj[0].day)) {
                      res.ultimos.days.splice(index, 1);
                    }
                  });
                } else {
                  if (_.isEqual(res.ultimos.days.day, this.updateTime.obj[0].day)) {
                    delete res['ultimos'];
                  }
                }
              }
            });
          }
        } else if (this.updateTime.type2 === 'weekday') {

          if (_.isArray(this.runTimeVar.months)) {
            this.runTimeVar.months.forEach((res) => {
              if (_.isEqual(res.month, this.updateTime.obj[0].month)) {
                if (_.isArray(res.monthdays.weekdays)) {
                  res.monthdays.weekdays.forEach((res1, index) => {
                    if (_.isEqual(res1.day, this.updateTime.obj[0].day) && _.isEqual(res1.which, this.updateTime.obj[0].which)) {
                      res.monthdays.weekdays.splice(index, 1);
                    }
                  });
                } else {
                  if (_.isEqual(res.monthdays.weekdays.day, this.updateTime.obj[0].day) && _.isEqual(res.monthdays.weekdays.which, this.updateTime.obj[0].which)) {
                    delete res.monthdays['weekdays'];
                  }
                }
              }
            });
          }
        }

        if (this.runTimeVar.months && _.isArray(this.runTimeVar.months)) {
          this.runTimeVar.months.forEach((month, index) => {
            var flag = false;
            if (!month.weekdays && (!month.monthdays || _.isEmpty(month.monthdays)) && !month.ultimos) {
              flag = true;
            }
            if (flag) {
              this.runTimeVar.months.splice(index, 1);
            }
          });
        }
      }
      if (this.runTimeVar.monthdays && !this.runTimeVar.monthdays.days && !this.runTimeVar.monthdays.weekdays) {
        delete this.runTimeVar['monthdays'];
      }
    }

    if (data.frequency.period) {
      for (let i = 0; i < this.periodList.length; i++) {
        if (this.calendarService.checkPeriod(this.periodList[i].period, data.frequency.period)) {
          this.periodList[i].period = this.coreService.clone(data.period.period);
        }
      }
    } else {
      if (this.periodList.length > 0) {
        let _temp = this.coreService.clone(this.periodList[0]);
        _temp.period = data.period.period;
        _temp.str = this.frequencyToString(_temp);
        this.periodList.push(_temp);

      } else {
        let obj: any = {};
        if (this.updateTime.type2) {
          obj.tab = this.updateTime.type2 === 'weekdays' ? 'weekDays' : this.updateTime.type2 === 'monthdays' ? 'monthDays' : this.updateTime.type2 === 'weekday' ? 'specificWeekDays' : this.updateTime.type2 === 'ultimos' ? 'monthDays' : 'specificDays';
        } else {
          obj.tab = this.updateTime.type === 'weekdays' ? 'weekDays' : this.updateTime.type === 'monthdays' ? 'monthDays' : this.updateTime.type === 'weekday' ? 'specificWeekDays' : this.updateTime.type === 'ultimos' ? 'monthDays' : 'specificDays';
        }
        if (this.updateTime.type === 'ultimos' || this.updateTime.type2 === 'ultimos') {
          obj.isUltimos = 'ultimos';
        }
        obj.period = {};
        if (data.period.period.singleStart) {
          obj.frequency = 'singleStart';
          obj.period.singleStart = data.period.period.singleStart;
        } else if (data.period.period.absoluteRepeat) {
          obj.frequency = 'absoluteRepeat';
          obj.period.absoluteRepeat = data.period.period.absoluteRepeat;
        } else if (data.period.period.repeat) {
          obj.frequency = 'repeat';
          obj.period.repeat = data.period.period.repeat;
        }
        if (data.period.period.begin) {
          obj.period.begin = data.period.period.begin;
        }
        if (data.period.period.end) {
          obj.period.end = data.period.period.end;
        }
        if (data.period.period.whenHoliday) {
          obj.period.whenHoliday = data.period.period.whenHoliday;
        }
        if (obj.tab === 'weekDays') {
          obj.days = this.updateTime.obj[0].day.toString().split(' ').sort();
        } else if (obj.tab === 'monthDays') {
          if (obj.isUltimos === 'ultimos') {
            obj.selectedMonthsU = this.updateTime.obj[0].day.toString().split(' ').sort(this.calendarService.compareNumbers);
          } else {
            obj.selectedMonths = this.updateTime.obj[0].day.toString().split(' ').sort(this.calendarService.compareNumbers);
          }
        } else if (obj.tab === 'specificWeekDays') {
          obj.specificWeekDay = this.updateTime.obj[0].day;
          obj.which = this.updateTime.obj[0].which;
        } else if (obj.tab === 'specificDays') {
          obj.date = new Date(this.updateTime.obj[0].date);
        }

        if (this.updateTime.obj[0].month) {
          obj.months = this.updateTime.obj[0].month.toString().split(' ').sort(this.calendarService.compareNumbers);
        }
        obj.str = this.frequencyToString(obj);
        this.periodList.push(obj);
      }
    }

    this.periodList.forEach((list) => {
      this.tempRunTime = this.calendarService.checkPeriodList(this.runTimeVar, list, this.selectedMonths, this.selectedMonthsU);
    });
    this.periodList = [];
    this.run_time = this.runTimeVar;
    delete this.run_time['schedule'];

    if (this.runTime1.dates && this.runTime1.dates.date) {
      this.run_time.dates = {};
      this.run_time.dates.date = moment(this.runTime1.dates.date).format('YYYY-MM-DD');
    }

    if (!_.isEmpty(this.run_time.dates)) {
      if (!(this.run_time.dates && (this.run_time.dates.length > 0))) {
        delete this.run_time['date'];
      }
    } else {
      delete this.run_time['date'];
    }
    if (!_.isEmpty(this.run_time.weekdays)) {
      if (!(this.run_time.weekdays.days && (this.run_time.weekdays.days.length > 0 || this.run_time.weekdays.days.day))) {
        delete this.run_time['weekdays'];
      }
    } else {
      delete this.run_time['weekdays'];
    }
    if (!_.isEmpty(this.run_time.monthdays)) {
      if (!(this.run_time.monthdays.weekdays && this.run_time.monthdays.weekdays.length > 0)) {
        delete this.run_time.monthdays['weekdays'];
      }
      if (!(this.run_time.monthdays.days && (this.run_time.monthdays.days.length > 0 || this.run_time.monthdays.days.day))) {
        if (!this.run_time.monthdays.weekdays) {
          delete this.run_time['monthdays'];
        } else {
          if (this.run_time.monthdays.days) {
            if (this.run_time.monthdays.days.length === 0 && this.run_time.monthdays.weekdays.length === 0) {
              delete this.run_time['monthdays'];
            } else if (this.run_time.monthdays.days.length === 0) {
              delete this.run_time.monthdays['days'];
            }
          }
        }
      }
    } else {
      delete this.run_time['monthdays'];
    }

    if (!_.isEmpty(this.run_time.ultimos)) {
      if (!(this.run_time.ultimos.days && (this.run_time.ultimos.days.length > 0 || this.run_time.ultimos.days.day))) {
        delete this.run_time['ultimos'];
      }
    } else {
      delete this.run_time['ultimos'];
    }

    if (!_.isEmpty(this.run_time.months)) {
      if (!(this.run_time.months.length > 0 || this.run_time.months.month)) {
        delete this.run_time['months'];
      }
    } else {
      delete this.run_time['months'];
    }

    if (!_.isEmpty(this.run_time.holidays)) {
      if (!(this.run_time.holidays.days && this.run_time.holidays.days.length > 0)) {
        delete this.run_time.holidays['days'];
      }
      if (!(this.run_time.holidays.includes && this.run_time.holidays.includes.length > 0)) {
        delete this.run_time.holidays['includes'];
      }

      if (!(this.run_time.holidays.weekdays && this.run_time.holidays.weekdays.days && this.run_time.holidays.weekdays.days.length > 0)) {
        delete this.run_time.holidays['weekdays'];
      }
    }
    if (_.isEmpty(this.run_time.holidays)) {
      delete this.run_time['holidays'];
    }

    if (this.runTime1.timeZone) {
      this.run_time.timeZone = this.runTime1.timeZone;
    }


    this.run_time = {run_time: this.run_time};

    this.runTimeVar = {
      months: [],
      weekdays: {days: []},
      monthdays: {days: []},
      ultimos: {days: []}
    };
    this.tempRunTime = {};

    this.getXml2Json(this.coreService.clone(this.run_time), false);
  }

  private addPeriodInCalendar(data) {
    let obj: any = {};
    let _json = this.jsonObj;
    let run_time = _json.run_time;
    if (data.frequency.period) {
      for (let i = 0; i < data.frequency.frequency.obj.length; i++) {
        if (this.calendarService.checkPeriod(data.frequency.frequency.obj[i].period, data.frequency.period)) {
          data.frequency.frequency.obj.splice(i, 1);
          break;
        }
      }
    }
    if (data.period) {
      obj.period = {};
      if (data.period.period.singleStart) {
        obj.frequency = 'singleStart';
        obj.period.singleStart = data.period.period.singleStart;
      } else if (data.period.period.absoluteRepeat) {
        obj.frequency = 'absoluteRepeat';
        obj.period.absoluteRepeat = data.period.period.absoluteRepeat;
      } else if (data.period.period.repeat) {
        obj.frequency = 'repeat';
        obj.period.repeat = data.period.period.repeat;
      }
      if (data.period.period.begin) {
        obj.period.begin = data.period.period.begin;
      }
      if (data.period.period.end) {
        obj.period.end = data.period.period.end;
      }
      if (data.period.period.whenHoliday) {
        obj.period.whenHoliday = data.period.period.whenHoliday;
      }
    }
    if (data.frequency.frequency.obj && data.frequency.frequency.obj.length > 0) {
      let flag = false;
      data.frequency.frequency.obj.forEach((value) => {
        if (_.isArray(value.periods)) {
          for (let m = 0; m < value.periods.length; m++) {
            if (_.isEqual(value.periods[m], obj.period)) {
              flag = true;
              break;
            }
          }
        } else {
          if (_.isEqual(value.periods, obj.period)) {
            flag = true;
          }
        }
      });
      if (flag) {
        return;
      }
    }

    for (let x = 0; x < this.selectedCalendar.length; x++) {
      if (_.isEqual(JSON.stringify(this.selectedCalendar[x]), JSON.stringify(data.frequency.frequency.calendar))) {
        if (this.selectedCalendar[x].periods) {
          let flag = true;
          for (let i = 0; i < this.selectedCalendar[x].periods.length; i++) {
            if (this.calendarService.checkPeriod(this.selectedCalendar[x].periods[i], obj.period)) {
              flag = false;
              break;
            }
          }
          if (flag) {
            this.selectedCalendar[x].periods.push(obj.period);
          }
        } else {
          this.selectedCalendar[x].periods = [obj.period];
        }
        break;
      }
    }
    this.getXml2Json(this.coreService.clone({run_time: run_time}), false);
  }
}

@Component({
  selector: 'app-period',
  templateUrl: './period-editor-dialog.html',
})
export class PeriodEditorComponent implements OnInit, OnDestroy {
  @Input() isNew: boolean;
  @Input() data: any = {};
  period: any = {period: {}};
  when_holiday_options = [
    'previous_non_holiday',
    'next_non_holiday',
    'suppress',
    'ignore_holiday'
  ];

  constructor(public activeModal: NgbActiveModal, private calendarService: CalendarService) {
  }

  ngOnInit(): void {
    if (this.isNew) {
      this.period.frequency = 'singleStart';
      console.log(this.period)
      this.period.period.singleStart = '00:00:00';
      this.period.period.whenHoliday = 'suppress';
    } else {
      if (_.isArray(this.data)) {
        this.data = this.data[0];
      }
      if (this.data.singleStart) {
        this.period.frequency = 'singleStart';
        this.period.period.singleStart = this.data.singleStart;
      } else if (this.data.absoluteRepeat) {
        this.period.frequency = 'absoluteRepeat';
        this.period.period.absoluteRepeat = this.data.absoluteRepeat;
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

  ngOnDestroy(): void {
  }


  onSubmit(): void {
    if (this.period.frequency === 'singleStart') {
      delete this.period.period['repeat'];
      delete this.period.period['absoluteRepeat'];
      delete this.period.period['begin'];
      delete this.period.period['end'];
      if (this.period.period.singleStart) {
        this.period.period.singleStart = this.calendarService.checkTime(this.period.period.singleStart);
      } else {
        return;
      }
    } else if (this.period.frequency === 'repeat' || this.period.frequency === 'absoluteRepeat') {
      delete this.period.period['singleStart'];
      let flg = false;
      if (this.period.frequency === 'repeat') {
        delete this.period.period['absoluteRepeat'];
        if (this.period.period.repeat) {
          this.period.period.repeat = this.calendarService.checkTime(this.period.period.repeat);
        } else {
          return;
        }
      } else {
        delete this.period.period['repeat'];
        if (this.period.period.absoluteRepeat) {
          this.period.period.absoluteRepeat = this.calendarService.checkTime(this.period.period.absoluteRepeat);
        } else {
          return;
        }
      }
    } else if (this.period.frequency === 'time_slot') {
      delete this.period.period['repeat'];
      delete this.period.period['absoluteRepeat'];
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
  selector: 'app-order',
  templateUrl: './order.component.html',
})
export class OrderComponent implements OnDestroy, OnChanges {
  @Input() preferences: any;
  @Input() permission: any;
  @Input() schedulerId: any;
  @Input() data: any;
  @Input() copyObj: any;

  order: any = {};
  workingDayCalendar: any;
  nonWorkingDayCalendar: any;
  previewCalendarView: any;
  isVisible: boolean;
  isUnique = true;
  objectType = 'ORDER';
  workflowTree = [];
  workingCalendarTree = [];
  nonWorkingCalendarTree = [];
  @ViewChild('treeSelectCtrl', {static: false}) treeSelectCtrl;

  constructor(private modalService: NgbModal, private coreService: CoreService, private dataService: DataService) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.order.actual) {
      this.saveJSON();
    }
    if (changes.data) {
      if (this.data.type) {
        this.getObject();
        if (this.workflowTree.length === 0) {
          this.coreService.post('tree', {
            jobschedulerId: this.schedulerId,
            forInventory: true,
            types: ['WORKFLOW']
          }).subscribe((res) => {
            this.workflowTree = this.coreService.prepareTree(res, true);
          });
        }
        /*        if (this.workingCalendarTree.length === 0) {
                  this.coreService.post('tree', {
                    jobschedulerId: this.schedulerId,
                    forInventory: true,
                    types: ['WORKINGDAYSCALENDAR']
                  }).subscribe((res) => {
                    this.workingCalendarTree = this.coreService.prepareTree(res, true);
                  });
                }
                if (this.nonWorkingCalendarTree.length === 0) {
                  this.coreService.post('tree', {
                    jobschedulerId: this.schedulerId,
                    forInventory: true,
                    types: ['NONWORKINGDAYSCALENDAR']
                  }).subscribe((res) => {
                    this.nonWorkingCalendarTree = this.coreService.prepareTree(res, true);
                  });
                }*/
      } else {
        this.order = {};
      }
    }
  }

  ngOnDestroy() {
    if (this.order.name) {
      this.saveJSON();
    }
  }

  /*  addPeriodInCalendar(calendar): void {
      const modalRef = this.modalService.open(PeriodEditorComponent, {backdrop: 'static'});
      modalRef.componentInstance.isNew = true;
      modalRef.componentInstance.period = {};
      modalRef.result.then((result) => {
        console.log(result);
        if (!calendar.periods) {
          calendar.periods = [];
        }
        calendar.periods.push(result);
        this.saveJSON();
      }, (reason) => {
        console.log('close...', reason);

      });
    }

    updatePeriodInCalendar(calendar, index, period): void {
      const modalRef = this.modalService.open(PeriodEditorComponent, {backdrop: 'static'});
      modalRef.componentInstance.period = period;
      modalRef.result.then((result) => {
        this.saveJSON();
      }, (reason) => {
        console.log('close...', reason);
      });
    }

    removePeriodInCalendar(calendar, index): void {
      calendar.periods.splice(index, 1);
      this.saveJSON();
    }

    previewCalendar(calendar, type): void {
      this.dataService.isCalendarReload.next(calendar);
      this.previewCalendarView = calendar;
      this.previewCalendarView.type = type;
    }

    removeWorkingCal(index): void {
      this.order.configuration.workingCalendars.splice(index, 1);
      this.saveJSON();
    }

    removeNonWorkingCal(index): void {
      this.order.configuration.nonWorkingCalendars.splice(index, 1);
      this.saveJSON();
    }
  */
  closeCalendarView() {
    this.previewCalendarView = null;
    this.isVisible = false;
    setTimeout(() => {
      console.log(this.order.configuration.runTime);
      this.saveJSON();
    }, 10);
  }

  addCriteria(): void {
    let param = {
      name: '',
      value: ''
    };
    if (this.order.configuration.variables) {
      if (!this.coreService.isLastEntryEmpty(this.order.configuration.variables, 'name', '')) {
        this.order.configuration.variables.push(param);
      }
    }
  }

  removeVariable(index): void {
    this.order.configuration.variables.splice(index, 1);
    this.saveJSON();
  }

  loadData(node, type, $event): void {
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
          jobschedulerId: this.schedulerId,
          path: node.key
        };
        if (type !== 'WORKFLOW') {
          obj.objectType = type;
        }
        this.coreService.post('inventory/read/folder', obj).subscribe((res: any) => {
          let data;
          if (type === 'WORKFLOW') {
            data = res.workflows;
          } else {
            data = res.calendars;
          }
          for (let i = 0; i < data.length; i++) {
            const _path = node.key + (node.key === '/' ? '' : '/') + data[i].name;
            data[i].title = _path;
            data[i].path = _path;
            data[i].key = _path;
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
          } else if (type === 'WORKINGDAYSCALENDAR') {
            //  this.workingCalendarTree = [...this.workingCalendarTree];
          } else {
            // this.nonWorkingCalendarTree = [...this.nonWorkingCalendarTree];
          }
        });
      }
    } else {
      /*      if (type !== 'WORKFLOW') {
              if (type === 'WORKINGDAYSCALENDAR') {
                this.order.configuration.workingCalendars.push({calendarPath: node.origin.path, periods: []});
              } else {
                this.order.configuration.nonWorkingCalendars.push({calendarPath: node.origin.path, periods: []});
              }
            }*/
      this.saveJSON();
    }
  }

  onExpand(e, type) {
    this.loadData(e.node, type, null);
  }

  rename() {
    this.coreService.post('inventory/rename', {
      id: this.data.id,
      name: this.order.name
    }).subscribe((res) => {
      this.data.name = this.order.name;
      this.dataService.reloadTree.next({rename: true});
    }, (err) => {
      this.order.name = this.data.name;
    });
  }

  deploy() {
    this.dataService.reloadTree.next({deploy: this.order});
  }

  backToListView() {
    this.dataService.reloadTree.next({back: this.order});
  }

  openRuntimeEditor() {
    this.isVisible = true;
    if(!this.order.configuration.runTime) {
      this.order.configuration.runTime = {};
    }
  }

  private getObject() {
    const _path = this.data.path + (this.data.path === '/' ? '' : '/') + this.data.name;
    this.coreService.post('inventory/read/configuration', {
      jobschedulerId: this.schedulerId,
      objectType: this.objectType,
      path: _path,
      id: this.data.id,
    }).subscribe((res: any) => {
      this.order = res;
      this.order.path1 = this.data.path;
      this.order.name = this.data.name;
      this.order.actual = res.configuration;
      this.order.configuration = res.configuration ? JSON.parse(res.configuration) : {};
      /*      if (!this.order.configuration.workingCalendars) {
              this.order.configuration.workingCalendars = [];
            }
            if (!this.order.configuration.nonWorkingCalendars) {
              this.order.configuration.nonWorkingCalendars = [];
            }*/
      if (!this.order.configuration.variables) {
        this.order.configuration.variables = [];
      }
      if (this.order.configuration.variables.length === 0) {
        this.addCriteria();
      }
      if (this.order.configuration.workflowPath) {
        const path = this.order.configuration.workflowPath.substring(0, this.order.configuration.workflowPath.lastIndexOf('/')) || '/';
        setTimeout(() => {
          let node = this.treeSelectCtrl.getTreeNodeByKey(path);
          node.isExpanded = true;
          this.loadData(node, 'WORKFLOW', null);
        }, 10);
      }
    });
  }

  private saveJSON() {
    console.log('saveJSON');
    if (this.order.actual !== JSON.stringify(this.order.configuration)) {
      let isValid = false;
      if (this.order.configuration.workflowPath) {
        isValid = true;
      }
      const _path = this.order.path1 + (this.order.path1 === '/' ? '' : '/') + this.order.name;
      this.coreService.post('inventory/store', {
        jobschedulerId: this.schedulerId,
        configuration: JSON.stringify(this.order.configuration),
        path: _path,
        valide: isValid,
        id: this.order.id,
        objectType: this.objectType
      }).subscribe(res => {
        if (this.order.id === this.data.id) {
          this.order.actual = JSON.stringify(this.order.configuration);
          this.order.valide = isValid;
          this.data.valide = isValid;
        }
      }, (err) => {
        console.log(err);
      });
    }
  }
}
