import {ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit, inject, HostListener} from '@angular/core';
import {isEmpty, unique, isArray, isEqual, clone} from 'underscore';
import {NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
import {TreeModalComponent} from './tree-modal/tree.component';
import {CoreService} from '../../../../services/core.service';
import {CalendarService} from '../../../../services/calendar.service';
import {NZ_MODAL_DATA} from 'ng-zorro-antd/modal';
import * as moment from "moment/moment";
import {NgModel} from "@angular/forms";
import { DatePipe } from '@angular/common';

declare const Holidays;
declare const $;

@Component({
  selector: 'app-restriction',
  templateUrl: './add-restriction-dialog.html'
})
export class AddRestrictionComponent {
  readonly modalData: any = inject(NZ_MODAL_DATA);
  schedulerId: any;
  preferences: any;
  data: any = {};

  Math = Math;
  selectedMonths: any = [];
  selectedMonthsU: any = [];
  tempItems: any = [];
  toDate: any;
  _temp: any;
  frequency: any = {};
  countryField: boolean;
  calendarTitle: any;
  isRuntimeEdit = false;
  editor: any = {isEnable: false};
  calendar: any = {};
  updateFrequency: any = {};
  dateFormat: any;
  dateFormatM: any;
  str = '';
  isVisible = false;
  countArr = [0, 1, 2, 3, 4];
  countArrU = [1, 2, 3, 4];
  daysOptions = [
    {label: 'monday', value: '1', checked: false},
    {label: 'tuesday', value: '2', checked: false},
    {label: 'wednesday', value: '3', checked: false},
    {label: 'thursday', value: '4', checked: false},
    {label: 'friday', value: '5', checked: false},
    {label: 'saturday', value: '6', checked: false},
    {label: 'sunday', value: '0', checked: false}
  ];

  monthsOptions = [
    {label: 'january', value: '1', checked: false},
    {label: 'february', value: '2', checked: false},
    {label: 'march', value: '3', checked: false},
    {label: 'april', value: '4', checked: false},
    {label: 'may', value: '5', checked: false},
    {label: 'june', value: '6', checked: false},
    {label: 'july', value: '7', checked: false},
    {label: 'august', value: '8', checked: false},
    {label: 'september', value: '9', checked: false},
    {label: 'october', value: '10', checked: false},
    {label: 'november', value: '11', checked: false},
    {label: 'december', value: '12', checked: false}
  ];

  holidayList: any = [];
  holidayDays: any = {checked: false};
  countryListArr: any = [];
  hd = new Holidays.default();
  frequencyEditIndex: number = -1;
  showMonthRange = false;

  constructor(public activeModal: NzModalRef, private coreService: CoreService, public modal: NzModalService, public calendarService: CalendarService, private datePipe: DatePipe) {
  }

  ngOnInit(): void {
    this.schedulerId = this.modalData.schedulerId;
    this.preferences = this.modalData.preferences;
    this.frequencyEditIndex = this.modalData.data.frequencyIndex;
    this.data = this.modalData.data || {};
    setTimeout(() => {
      this.isVisible = true;
    }, 0);
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
    const countryList = this.hd.getCountries('en');
    for (const x in countryList) {
      if (countryList[x]) {
        this.countryListArr.push({code: x, name: countryList[x]});
      }
    }
    this.frequency.nationalHoliday = [];
    this._temp = this.data.updateFrequency;
    if (this._temp && !isEmpty(this._temp)) {
      this.editor.create = false;
      this.isRuntimeEdit = true;
      if (this._temp.tab === 'nationalHoliday') {
        this.frequency.year = new Date(this._temp.nationalHoliday[0]).getFullYear();
        this.holidayDays.checked = true;
        this.countryField = true;
      }
      this.frequency = this.coreService.clone(this._temp);
      for (let i = 0; i < this.calendar.frequencyList.length; i++) {
        if (this.calendar.frequencyList[i] == this._temp || isEqual(this._temp, this.calendar.frequencyList[i])) {
          this.updateFrequencyObj(i);
          break;
        }
      }
    } else {
      this._temp = {};
      this.editor.create = true;
      this.frequency = {};
      this.frequency.tab = 'weekDays';
      this.frequency.isUltimos = 'months';
      this.frequency.dateEntity = 'DAILY';
      this.frequency.year = new Date().getFullYear();
      if (this.calendar.frequencyList && this.calendar.frequencyList.length > 0) {
        this.generateFrequencyObj();
      }
    }
    this.setEditorEnable();
    if (this.frequency.days && this.frequency.days.length > 0) {
      this.checkDays();
    }
    if (this.frequency.months && this.frequency.months.length > 0) {
      this.checkMonths();
      this.showMonthRange = true;
    }
  }

  checkDays(): void {
    this.daysOptions = this.daysOptions.map(item => {
      return {
        ...item,
        checked: (this.frequency.days ? this.frequency.days.indexOf(item.value) > -1 : false)
      };
    });
  }

  convertStringToDate(date): any {
    if (typeof date === 'string') {
      return this.coreService.getDate(date);
    } else {
      return date;
    }
  }

  setEditorEnable(): void {
    if (this.frequency.days && this.frequency.days.length > 0) {
      this.editor.isEnable = true;
    }
  }

  addDates(): void {
    const date = this.frequency.specificDate;
    const obj = {
      startDate: date,
      endDate: date,
      color: 'blue'
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
    this.frequency.specificDate = '';
    $('#calendar').data('calendar').setDataSource(this.tempItems);
    this.addFrequency();
  }

  updateFrequencyObj(i): void {
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
        this.frequency.startingWithM = new Date(this.calendar.frequencyList[i].startingWithM);
      }
      if (this.calendar.frequencyList[i].endOnM) {
        this.frequency.endOnM = new Date(this.calendar.frequencyList[i].endOnM);
      }
    } else if (this.calendar.frequencyList[i].tab === 'specificDays') {
      if (this.calendar.frequencyList[i].dates) {
        this.calendar.frequencyList[i].dates.forEach((date) => {
          this.tempItems.push({
            startDate: this.convertStringToDate(date),
            endDate: this.convertStringToDate(date),
            color: 'blue'
          });
        });
      }
      if (this.calendar.frequencyList[i].startingWithS) {
        this.frequency.startingWithS = new Date(this.calendar.frequencyList[i].startingWithS);
      }
      if (this.calendar.frequencyList[i].endOnS) {
        this.frequency.endOnS = new Date(this.calendar.frequencyList[i].endOnS);
      }
    } else if (this.calendar.frequencyList[i].tab === 'weekDays') {
      this.frequency.days = this.coreService.clone(this.calendar.frequencyList[i].days);
      this.frequency.all = this.calendar.frequencyList[i].days.length === 7;
      if (this.calendar.frequencyList[i].startingWithW) {
        this.frequency.startingWithW = new Date(this.calendar.frequencyList[i].startingWithW);
      }
      if (this.calendar.frequencyList[i].endOnW) {
        this.frequency.endOnW = new Date(this.calendar.frequencyList[i].endOnW);
      }
    } else if (this.calendar.frequencyList[i].tab === 'every') {
      if (this.calendar.frequencyList[i].startingWith) {
        this.frequency.startingWith = new Date(this.calendar.frequencyList[i].startingWith);
      }
      if (this.calendar.frequencyList[i].endOn) {
        this.frequency.endOn = new Date(this.calendar.frequencyList[i].endOn);
      }
    } else if (this.calendar.frequencyList[i].tab === 'specificWeekDays') {
      if (this.calendar.frequencyList[i].startingWithS) {
        this.frequency.startingWithS = new Date(this.calendar.frequencyList[i].startingWithS);
      }
      if (this.calendar.frequencyList[i].endOnS) {
        this.frequency.endOnS = new Date(this.calendar.frequencyList[i].endOnS);
      }
    } else if (this.frequency.tab === 'specificDays') {
      const domElem = $('#calendar');
      if (domElem && domElem.data('calendar')) {
        domElem.data('calendar').setDataSource(this.tempItems);
      } else {
        domElem.calendar({
          language: this.coreService.getLocale(),
          clickDay: (e) => {
            this.selectDate(e);
          }
        }).setDataSource(this.tempItems);
      }
    } else if (this.calendar.frequencyList[i].tab === 'nationalHoliday') {
      this.frequency.nationalHoliday = clone(this.calendar.frequencyList[i].nationalHoliday);
      if (this._temp.nationalHoliday) {
        this._temp.nationalHoliday.forEach((date) => {
          this.holidayList.push({date});
        });
      }
    }
  }

  generateFrequencyObj(): void {
    this.tempItems = [];
    for (let i = 0; i < this.calendar.frequencyList.length; i++) {
      this.updateFrequencyObj(i);
    }
  }

  onDateChange(): void {
    this.onFrequencyChange();
  }

  onFrequencyChange(): void {
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
          delete this.frequency.months;
          delete this.frequency.allMonth;
        } else if (this.frequency.tab == 'weekDays') {
          this.str = 'label.weekDays';
        } else if (this.frequency.tab == 'every') {
          this.str = 'label.every';
          if (this.frequency.dateEntity === 'YEARLY') {
            delete this.frequency.months;
            delete this.frequency.allMonth;
          }
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
      } else if (this.frequency.tab == 'nationalHoliday') {
        this.editor.isEnable = !!(this.frequency.nationalHoliday && this.frequency.nationalHoliday.length > 0);
      } else if (this.frequency.tab == 'weekDays') {
        this.editor.isEnable = this.frequency.days && this.frequency.days.length > 0;
      } else if (this.frequency.tab == 'specificDays') {
        this.editor.isEnable = this.tempItems.length > 0;
        const domElem = $('#calendar');
        if (domElem && domElem.data('calendar')) {
          domElem.data('calendar').setDataSource(this.tempItems);
        } else {
          domElem.calendar({
            language: this.coreService.getLocale(),
            clickDay: (e) => {
              this.selectDate(e);
            }
          }).setDataSource(this.tempItems);
        }
      }
    }
  }

  dayChange(value: string[]): void {
    this.frequency.days = value;
    this.onChangeDays();
  }

  onChangeDays(): void {
    if (this.frequency.days) {
      this.editor.isEnable = this.frequency.days.length > 0;
      this.frequency.all = this.frequency.days.length == 7;
      this.frequency.days.sort();
    }
  }

  selectAllHolidays(): void {
    if (this.holidayDays.checked && this.holidayList.length > 0) {
      const temp = [];
      for (let m = 0; m < this.holidayList.length; m++) {
        if (this.frequency.nationalHoliday.indexOf(this.holidayList[m].date) == -1) {
          temp.push(this.holidayList[m].date);
        }
      }

      this.frequency.nationalHoliday = this.frequency.nationalHoliday.concat(temp);
    } else {
      if (this.frequency.nationalHoliday && this.frequency.nationalHoliday.length > 0) {
        const temp = clone(this.frequency.nationalHoliday);
        for (let m = 0; m < this.holidayList.length; m++) {
          for (let x = 0; x < temp.length; x++) {
            if (temp[x] == this.holidayList[m].date) {
              temp.splice(x, 1);
              break;
            }
          }
        }
        this.frequency.nationalHoliday = clone(temp);
      }
    }
    this.editor.isEnable = !!(this.frequency.nationalHoliday && this.frequency.nationalHoliday.length > 0);
  }

  onChangeHolidays(): void {
    this.editor.isEnable = !!(this.frequency.nationalHoliday && this.frequency.nationalHoliday.length > 0);
    if (this.holidayList && this.frequency.nationalHoliday) {
      this.holidayDays.checked = this.holidayList.length == this.frequency.nationalHoliday.length;
    }
  }

  onItemChecked(date: any, checked: boolean): void {
    if (checked) {
      this.frequency.nationalHoliday.push(date);
    } else {
      this.frequency.nationalHoliday.splice(this.frequency.nationalHoliday.indexOf(date), 1)
    }
    this.onChangeHolidays();
  }

  changeFrequency(): void {
    this.onFrequencyChange();
    if (this.frequency.tab === 'specificDays') {
      const domElem = $('#calendar');
      if (domElem && domElem.data('calendar')) {
        domElem.data('calendar').setDataSource(this.tempItems);
      } else {
        domElem.calendar({
          language: this.coreService.getLocale(),
          clickDay: (e) => {
            this.selectDate(e);
          }
        }).setDataSource(this.tempItems);
      }
    }
  }

  selectMonthDaysFunc(value): void {
    if (this.selectedMonths.indexOf(value) === -1) {
      this.selectedMonths.push(value);
    } else {
      this.selectedMonths.splice(this.selectedMonths.indexOf(value), 1);
    }
    this.frequency.selectedMonths = this.coreService.clone(this.selectedMonths);
    this.frequency.selectedMonths.sort();
    this.editor.isEnable = this.selectedMonths.length > 0;
  }

  selectMonthDaysUFunc(value): void {
    if (this.selectedMonthsU.indexOf(value) === -1) {
      this.selectedMonthsU.push(value);
    } else {
      this.selectedMonthsU.splice(this.selectedMonthsU.indexOf(value), 1);
    }
    this.frequency.selectedMonthsU = this.coreService.clone(this.selectedMonthsU);
    this.frequency.selectedMonthsU.sort();
    this.editor.isEnable = this.selectedMonthsU.length > 0;
  }

  getSelectedMonthDays(value): boolean {
    return this.selectedMonths.indexOf(value) !== -1;
  }

  getSelectedMonthDaysU(value): boolean {
    return this.selectedMonthsU.indexOf(value) !== -1;
  }

  selectAllWeek(): void {
    if (this.frequency.all) {
      this.frequency.days = ['0', '1', '2', '3', '4', '5', '6'];
      this.editor.isEnable = true;
    } else {
      this.frequency.days = [];
      this.editor.isEnable = false;
    }
    this.checkDays();
  }

  selectAllMonth(): void {
    if (this.frequency.allMonth) {
      this.frequency.months = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
    } else {
      this.frequency.months = [];
    }
    this.checkMonths();
  }

  checkMonths(): void {
    this.monthsOptions = this.monthsOptions.map(item => {
      return {
        ...item,
        checked: (this.frequency.months ? this.frequency.months.indexOf(item.value) > -1 : false)
      };
    });
  }

  monthChange(value: string[]): void {
    this.frequency.months = value;
    this.onChangeMonths();
  }

  onChangeMonths(): void {
    if (this.frequency.months) {
      // this.editor.isEnable = this.frequency.months.length > 0;
      this.frequency.allMonth = this.frequency.months.length === 12;
      this.frequency.months = this.frequency.months.sort();
    }
  }

  getDateFormat(date): string {
    return moment(date).format(this.dateFormatM);
  }

  loadHolidayList(): void {
    this.holidayDays.checked = false;
    this.holidayList = [];
    let holidays = [];
    if (!this.frequency.nationalHoliday) {
      this.frequency.nationalHoliday = [];
    }
    if (this.frequency.country && this.frequency.year) {
      this.hd.init(this.frequency.country);
      holidays = this.hd.getHolidays(this.frequency.year);
      for (let m = 0; m < holidays.length; m++) {

        if ((holidays[m].type === 'public' || holidays[m].type === 'bank') && holidays[m].date && holidays[m].name && holidays[m].date != 'null') {
          if (holidays[m].date.length > 19) {
            holidays[m].date = holidays[m].date.substring(0, 19);
          }
          holidays[m].date = moment(holidays[m].date).format('YYYY-MM-DD');
          this.holidayList.push(holidays[m]);
        }
      }
    }
    if (this.calendar.frequencyList.length > 0) {
      for (let i = 0; i < this.calendar.frequencyList.length; i++) {
        if (this.calendar.frequencyList[i].tab == 'nationalHoliday' && this.calendar.frequencyList[i].nationalHoliday.length > 0 && new Date(this.calendar.frequencyList[i].nationalHoliday[0]).getFullYear() == this.frequency.year) {
          this.frequency.nationalHoliday = clone(this.calendar.frequencyList[i].nationalHoliday);
          break;
        }
      }
    }
  }

  addFrequency(): void {
    this.frequency.str = this.calendarService.freqToStr(this.frequency, this.dateFormat);
    this.setEditorEnable();
    let flag = false;
    if (this.isRuntimeEdit) {
      this.isRuntimeEdit = false;
      if (this.calendar.frequencyList.length > 0) {
        for (let i = 0; i < this.calendar.frequencyList.length; i++) {
          if (this.calendar.frequencyList[i].tab == this._temp.tab && this.calendar.frequencyList[i].str == this._temp.str && this.calendar.frequencyList[i].type == this._temp.type && i === this.frequencyEditIndex) {
            if (this.frequency.tab === 'specificDays') {
              this.frequency.dates = [];
              this.tempItems.forEach((date) => {
                this.frequency.dates.push(this.coreService.getStringDate(date.startDate));
              });
              this.frequency.str = this.calendarService.freqToStr(this.frequency, this.dateFormat);
            }
            this.calendar.frequencyList[i] = this.coreService.clone(this.frequency);
            break;
          }
        }
      }
      this._temp = {};
      this.holidayList = [];
      if (this.calendar.frequencyList && this.calendar.frequencyList.length > 0) {
        this.generateFrequencyObj();
      }
      this.editor.isEnable = false;
      return;
    }
    if (this.frequency.tab === 'specificDays') {
      this.frequency.dates = [];
      for (let j = 0; j < this.tempItems.length; j++) {
        this.frequency.dates.push(this.coreService.getStringDate(this.tempItems[j].startDate));
      }
      this.frequency.str = this.calendarService.freqToStr(this.frequency, this.dateFormat);
    }
    for (let i = 0; i < this.calendar.frequencyList.length; i++) {
      if (isEqual(this.calendar.frequencyList[i], this.frequency)) {
        flag = true;
        break;
      }
    }

    if (flag) {
      return;
    }
    let _dates = [], datesArr;
    if (this.frequency.tab === 'nationalHoliday') {
      datesArr = this.calendarService.groupByDates(this.frequency.nationalHoliday);
      _dates = clone(datesArr);
    }
    if (this.calendar.frequencyList.length > 0) {
      let flag1 = false;
      for (let i = 0; i < this.calendar.frequencyList.length; i++) {
        if (this.frequency.tab == this.calendar.frequencyList[i].tab) {
          if (this.frequency.tab === 'weekDays'
            && this.calendar.frequencyList[i].str === this.frequency.str
            && JSON.stringify(this.calendar.frequencyList[i].days) === JSON.stringify(this.frequency.days)
            && this.datePipe.transform(this.calendar.frequencyList[i].startingWithW) === this.datePipe.transform(this.frequency.startingWithW)
            && this.datePipe.transform(this.calendar.frequencyList[i].endOnW) === this.datePipe.transform(this.frequency.endOnW)
          ) {
            if (this.frequency.months && this.frequency.months.length > 0) {
              if (this.frequency.months == this.calendar.frequencyList[i].months || isEqual(this.calendar.frequencyList[i].months, this.frequency.months)) {
                if (isEqual(this.calendar.frequencyList[i].days, this.frequency.days)) {
                  flag1 = true;
                  break;
                }
                this.calendar.frequencyList[i].days = this.coreService.clone(this.frequency.days);
                // this.calendar.frequencyList[i].startingWithW = clone(this.frequency.startingWithW);
                // this.calendar.frequencyList[i].endOnW = clone(this.frequency.endOnW);

                this.calendar.frequencyList[i].str = clone(this.frequency.str);
                flag1 = true;
                break;
              } else {
                if (this.calendar.frequencyList[i].months) {
                  if (isEqual(this.calendar.frequencyList[i].days, this.frequency.days)) {
                    for (let j = 0; j < this.frequency.months.length; j++) {
                      if (this.calendar.frequencyList[i].months.indexOf(this.frequency.months[j]) == -1) {
                        this.calendar.frequencyList[i].months.push(this.frequency.months[j]);
                      }
                    }
                    this.calendar.frequencyList[i].str = clone(this.frequency.str);
                    flag1 = true;
                    break;
                  }
                }
              }
            } else {
              if (!this.calendar.frequencyList[i].months) {
                this.calendar.frequencyList[i].days = this.coreService.clone(this.frequency.days);
                // this.calendar.frequencyList[i].startingWithW = this.frequency.startingWithW;
                // this.calendar.frequencyList[i].endOnW = this.frequency.endOnW;
                this.calendar.frequencyList[i].str = clone(this.frequency.str);
                flag1 = true;
                break;
              }
            }
          } else if (this.frequency.tab == 'monthDays' && this.frequency.isUltimos == 'months' && this.calendar.frequencyList[i].isUltimos == 'months'
            && this.datePipe.transform(this.calendar.frequencyList[i].startingWithM) === this.datePipe.transform(this.frequency.startingWithM)
            && this.datePipe.transform(this.calendar.frequencyList[i].endOnM) === this.datePipe.transform(this.frequency.endOnM)
            && this.areArraysEqual(this.calendar.frequencyList[i].selectedMonths, this.frequency.selectedMonths)) {
            if (this.frequency.months && this.frequency.months.length > 0) {
              if (this.frequency.months == this.calendar.frequencyList[i].months || isEqual(this.calendar.frequencyList[i].months, this.frequency.months)) {
                // this.calendar.frequencyList[i].selectedMonths = this.coreService.clone(this.frequency.selectedMonths);
                // this.calendar.frequencyList[i].startingWithM = (this.frequency.startingWithM);
                // this.calendar.frequencyList[i].endOnM = (this.frequency.endOnM);
                // this.calendar.frequencyList[i].str = clone(this.frequency.str);
                flag1 = true;
                break;
              } else {
                if (this.calendar.frequencyList[i].months) {
                  if (isEqual(this.calendar.frequencyList[i].selectedMonths, this.frequency.selectedMonths)) {
                    for (let j = 0; j < this.frequency.months.length; j++) {
                      if (this.calendar.frequencyList[i].months.indexOf(this.frequency.months[j]) == -1) {
                        this.calendar.frequencyList[i].months.push(this.frequency.months[j]);
                      }
                    }
                    // this.calendar.frequencyList[i].str = clone(this.frequency.str);
                    flag1 = true;
                    break;
                  }
                }
              }
            } else {
              if (!this.calendar.frequencyList[i].months) {
                // this.calendar.frequencyList[i].selectedMonths = this.coreService.clone(this.frequency.selectedMonths);
                // this.calendar.frequencyList[i].startingWithM = (this.frequency.startingWithM);
                // this.calendar.frequencyList[i].endOnM = (this.frequency.endOnM);
                // this.calendar.frequencyList[i].str = clone(this.frequency.str);
                flag1 = true;
                break;
              }
            }
          } else if (this.frequency.tab === 'monthDays' && this.frequency.isUltimos != 'months' && this.calendar.frequencyList[i].isUltimos !== 'months'
            && this.datePipe.transform(this.calendar.frequencyList[i].startingWithM) === this.datePipe.transform(this.frequency.startingWithM)
            && this.datePipe.transform(this.calendar.frequencyList[i].endOnM) === this.datePipe.transform(this.frequency.endOnM)
            && this.areArraysEqual(this.calendar.frequencyList[i].selectedMonthsU, this.frequency.selectedMonthsU)
          ) {
            if (this.frequency.months && this.frequency.months.length > 0) {
              if (this.frequency.months == this.calendar.frequencyList[i].months || isEqual(this.calendar.frequencyList[i].months, this.frequency.months)) {
                // this.calendar.frequencyList[i].selectedMonthsU = this.coreService.clone(this.frequency.selectedMonthsU);
                // this.calendar.frequencyList[i].startingWithM = (this.frequency.startingWithM);
                // this.calendar.frequencyList[i].endOnM = (this.frequency.endOnM);
                // this.calendar.frequencyList[i].str = clone(this.frequency.str);
                flag1 = true;
                break;
              } else {
                if (this.calendar.frequencyList[i].months) {
                  if (isEqual(this.calendar.frequencyList[i].selectedMonthsU, this.frequency.selectedMonthsU)) {
                    for (let j = 0; j < this.frequency.months.length; j++) {
                      if (this.calendar.frequencyList[i].months.indexOf(this.frequency.months[j]) == -1) {
                        this.calendar.frequencyList[i].months.push(this.frequency.months[j]);
                      }
                    }
                    // this.calendar.frequencyList[i].str = clone(this.frequency.str);
                    flag1 = true;
                    break;
                  }
                }
              }
            } else {
              if (!this.calendar.frequencyList[i].months) {
                // this.calendar.frequencyList[i].selectedMonthsU = this.coreService.clone(this.frequency.selectedMonthsU);
                // this.calendar.frequencyList[i].startingWithM = (this.frequency.startingWithM);
                // this.calendar.frequencyList[i].endOnM = (this.frequency.endOnM);
                // this.calendar.frequencyList[i].str = clone(this.frequency.str);

                flag1 = true;
                break;
              }
            }
          } else if (this.frequency.tab === 'specificWeekDays'
            && this.calendar.frequencyList[i].str === this.frequency.str
            && this.datePipe.transform(this.calendar.frequencyList[i].startingWithS) === this.datePipe.transform(this.frequency.startingWithS)
            && this.datePipe.transform(this.calendar.frequencyList[i].endOnS) === this.datePipe.transform(this.frequency.endOnS)) {
            // this.calendar.frequencyList[i].startingWithS = clone(this.frequency.startingWithS);
            // this.calendar.frequencyList[i].endOnS = clone(this.frequency.endOnS);
            this.calendar.frequencyList[i].str = clone(this.frequency.str);
            flag1 = true;
            break;
          } else if (this.frequency.tab == 'nationalHoliday') {
            flag1 = true;
            datesArr.forEach((dates) => {
              if (this.calendar.frequencyList[i].nationalHoliday && this.calendar.frequencyList[i].nationalHoliday.length > 0) {
                if (new Date(this.calendar.frequencyList[i].nationalHoliday[0]).getFullYear() === new Date(dates[0]).getFullYear()) {
                  dates.forEach((date) => {
                    if (this.calendar.frequencyList[i].nationalHoliday.indexOf(date) == -1) {
                      this.calendar.frequencyList[i].nationalHoliday.push(date);
                    }
                  });
                  this.calendar.frequencyList[i].str = this.calendarService.freqToStr(this.calendar.frequencyList[i], this.dateFormat);
                  for (let x = 0; x < _dates.length; x++) {
                    if (isEqual(_dates[x], dates)) {
                      _dates.splice(x, 1);
                      break;
                    }
                  }
                }
              }
            });

          } else if (this.frequency.tab === 'specificDays') {
            this.frequency.dates = [];
            for (let j = 0; j < this.tempItems.length; j++) {
              this.frequency.dates.push(this.coreService.getStringDate(this.tempItems[j].startDate));
            }
            this.frequency.str = this.calendarService.freqToStr(this.frequency, this.dateFormat);
            this.calendar.frequencyList[i].dates = this.coreService.clone(this.frequency.dates);
            this.calendar.frequencyList[i].str = clone(this.frequency.str);
            flag1 = true;
            break;
          } else if (this.frequency.tab === 'every'
            && this.calendar.frequencyList[i].str === this.frequency.str
            && this.datePipe.transform(this.calendar.frequencyList[i].startingWith) === this.datePipe.transform(this.frequency.startingWith)
            && this.datePipe.transform(this.calendar.frequencyList[i].endOn) === this.datePipe.transform(this.frequency.endOn)
            && this.calendar.frequencyList[i].interval === this.frequency.interval
            && this.calendar.frequencyList[i].year === this.frequency.year) {
            if (isEqual(this.frequency.dateEntity, this.calendar.frequencyList[i].dateEntity)) {
              this.calendar.frequencyList[i].str = this.calendarService.freqToStr(this.frequency, this.dateFormat);
              this.calendar.frequencyList[i].interval = clone(this.frequency.interval);
              this.calendar.frequencyList[i].str = clone(this.frequency.str);
              // this.calendar.frequencyList[i].startingWith = clone(this.frequency.startingWith);
              // this.calendar.frequencyList[i].endOn = clone(this.frequency.endOn);
              this.calendar.frequencyList[i].year = clone(this.frequency.year);
              flag1 = true;
              break;
            }
          }
        }
      }
      if (_dates && _dates.length > 0) {
        for (let i = 0; i < _dates.length; i++) {
          const obj = clone(this.frequency);
          obj.type = this.editor.frequencyType;
          obj.nationalHoliday = _dates[i];
          obj.str = this.calendarService.freqToStr(obj, this.dateFormat);
          this.calendar.frequencyList.push(obj);
        }
      }
      if (!flag1) {
        if (this.frequency.tab === 'specificDays') {
          this.frequency.dates = [];
          for (let i = 0; i < this.tempItems.length; i++) {
            this.frequency.dates.push(this.coreService.getStringDate(this.tempItems[i].startDate));
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
      if (this.frequency.tab === 'specificDays') {
        this.frequency.dates = [];
        for (let i = 0; i < this.tempItems.length; i++) {
          this.frequency.dates.push(this.coreService.getStringDate(this.tempItems[i].startDate));
        }
        this.frequency.str = this.calendarService.freqToStr(this.frequency, this.dateFormat);
      }
      if (this.frequency.tab == 'nationalHoliday') {
        for (let i = 0; i < datesArr.length; i++) {
          const obj = clone(this.frequency);
          obj.type = this.editor.frequencyType;
          obj.nationalHoliday = datesArr[i];
          obj.str = this.calendarService.freqToStr(obj, this.dateFormat);
          this.calendar.frequencyList.push(obj);
        }
      } else {
        this.frequency.type = this.editor.frequencyType;
        this.calendar.frequencyList.push(this.coreService.clone(this.frequency));
      }
    }
    this.frequency.nationalHoliday = [];
    this.holidayDays.checked = false;
    this.editor.isEnable = false;
  }

  areArraysEqual(arr1, arr2) {
    // First, check if both arrays have the same length
    if (arr1.length !== arr2.length) return false;

    // Sort both arrays and check if every element is equal
    const sortedArr1 = [...arr1].sort();
    const sortedArr2 = [...arr2].sort();

    return sortedArr1.every((value, index) => value === sortedArr2[index]);
  }

  editFrequency(data, frequencyIndex): void {
    this._temp = this.coreService.clone(data);
    this.frequency = this.coreService.clone(data);
    this.frequencyEditIndex = frequencyIndex;
    this.isRuntimeEdit = true;
    if (this.frequency.tab == 'nationalHoliday') {
      this.frequency.year = new Date(data.nationalHoliday[0]).getFullYear();
      this.holidayList = [];
      this.countryField = true;
      this.holidayDays.checked = true;
      for (let i = 0; i < data.nationalHoliday.length; i++) {
        this.holidayList.push({date: data.nationalHoliday[i]});
      }
    } else {
      this.holidayDays.checked = false;
    }
    if (this.frequency.tab === 'monthDays') {
      if (this.frequency.isUltimos === 'months') {
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

  deleteFrequency(data, index): void {
    this.calendar.frequencyList.splice(index, 1);
    if (this.calendar.frequencyList.length === 0) {
      const temp = this.coreService.clone(this.frequency);
      this.frequency = {};
      this.frequency.tab = temp.tab;
      this.frequency.isUltimos = temp.isUltimos;
    }
    if (data.tab === 'specificDays') {
      this.tempItems = [];
    } else if (data.tab == 'nationalHoliday') {
      this.frequency.nationalHoliday = [];
      this.holidayDays.checked = false;
      this.holidayList = [];
      this.frequency.year = new Date().getFullYear();
      this.countryField = false;
    }
    this.checkDays();
    this.checkMonths();
  }

  save(): void {
    this.activeModal.close(this.calendar);
  }

  cancel(): void {
    this.activeModal.destroy();
  }

  private selectDate(e): void {
    const obj = {
      startDate: e.date,
      endDate: e.date,
      color: 'blue'
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
export class PeriodComponent {
  readonly modalData: any = inject(NZ_MODAL_DATA);

  isNew: boolean;
  isDisplay: boolean;
  data: any = {};
  period: any = {period: {}};
  when_holiday_options = [
    'SUPPRESS',
    'IGNORE',
    'PREVIOUSNONWORKINGDAY',
    'NEXTNONWORKINGDAY'
  ];
  periodFrequency = [
    {label: 'runtime.label.singleStart', value: 'singleStart'},
    {label: 'runtime.label.repeat', value: 'repeat'}
  ]

  constructor(private coreService: CoreService, public activeModal: NzModalRef, private calendarService: CalendarService) {
  }

  @HostListener('window:click', ['$event'])
  onClick(): void {
    // if (this.isDisplay) {
    //   setTimeout(() => {
    //     $('#repeatId').click();
    //   }, 10);
    // }
  }

  ngOnInit(): void {
    this.isNew = this.modalData.isNew;
    this.data = this.modalData.data || {};
    if (this.isNew) {
      this.period.frequency = 'singleStart';
      this.period.period.singleStart = '';
      this.period.period.whenHoliday = 'SUPPRESS';
    } else {
      if (isArray(this.data)) {
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

  onBlur(repeat: NgModel, propertyName: string) {
    this.period.period[propertyName] = this.coreService.padTime(this.period.period[propertyName]);
    repeat.control.setErrors({incorrect: false});
    repeat.control.updateValueAndValidity();
  }


  isRepeatIntervalShort($event): void {
    if ($event) {
      const [hours, minutes, seconds] = $event.split(':').map(Number);
      let sum = 0;
      if (hours) {
        sum += hours * 3600;
      }
      if (minutes) {
        sum += minutes * 60;
      }
      if (seconds) {
        sum += seconds;
      }

      if ((minutes || minutes == 0) && sum < 1800) {
        $('#repeatId').click();
        this.isDisplay = true;
      } else {
        this.isDisplay = false;
      }
    } else {
      this.isDisplay = false;
    }
  }

  onSubmit(): void {
    if (this.period.frequency === 'singleStart') {
      delete this.period.period.repeat;
      delete this.period.period.begin;
      delete this.period.period.end;
      if (this.period.period.singleStart) {
        this.period.period.singleStart = this.calendarService.checkTime(this.period.period.singleStart);
      } else {
        return;
      }
    } else if (this.period.frequency === 'repeat') {
      delete this.period.period.singleStart;
      if (this.period.period.repeat) {
        this.period.period.repeat = this.calendarService.checkTime(this.period.period.repeat);
      } else {
        return;
      }
    } else if (this.period.frequency === 'time_slot') {
      delete this.period.period.repeat;
      delete this.period.period.singleStart;
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
    this.activeModal.destroy();
  }
}

@Component({
  selector: 'app-run-time',
  templateUrl: './run-time-dialog.html',
})
export class RunTimeComponent implements OnChanges, OnDestroy {
  @Input() schedule: any;
  @Input() isTrash: any;
  @Input() preferences: any;
  @Input() permission: any;
  @Input() schedulerId: any;
  planItems: any = [];
  tempList = [];
  timeZone = '';
  editor: any = {};
  viewCalObj: any = {calendarView: 'year'};
  calendars: any = [];
  nonWorkingDayCalendars: any = [];
  zones = [];
  calendar: any;
  toDate: any;
  calendarTitle = new Date().getFullYear();

  constructor(private coreService: CoreService, public modal: NzModalService,
              private calendarService: CalendarService, private ref: ChangeDetectorRef) {
  }

  ngOnChanges(changes): void {
    this.zones = this.coreService.getTimeZoneList();
    this.init();
  }

  assignCalendar(): void {
    this.openTreeModal('WORKINGDAYSCALENDAR');
  }

  assignHolidayCalendar(): void {
    this.openTreeModal('NONWORKINGDAYSCALENDAR');
  }

  private openTreeModal(type: string, calendar?): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: TreeModalComponent,
      nzData: {
        schedulerId: this.schedulerId,
        preferences: this.preferences,
        type: type,
        calendar,
        object: 'Calendar'
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        if (type === 'NONWORKINGDAYSCALENDAR') {
          this.nonWorkingDayCalendars = this.nonWorkingDayCalendars.concat(result);
          unique(this.nonWorkingDayCalendars);
        } else {
          if (calendar) {
            if (result.length) {
              for (let i in this.calendars) {
                if (this.calendars[i].calendarName === calendar.calendarName) {
                  this.calendars[i].calendarName = result[0].calendarName;
                  break;
                }
              }
            }
          } else {
            this.calendars = this.calendars.concat(result);
          }
        }
        this.ref.detectChanges();
      }
    });
  }

  getPeriodStr(period): string {
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
      periodStr = periodStr + ' every ' + this.coreService.getTimeInString(period.repeat);
    }
    return periodStr;
  }


  checkPeriod(value, period): boolean {
    if (!value || !period) {
      return false;
    }
    let flg = false;
    let isMatch = false;
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
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: PeriodComponent,
      nzAutofocus: null,
      nzData: {
        isNew: true,
        data: {}
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
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
        this.ref.detectChanges();
      }
    });
  }

  updatePeriodInCalendar(calendar, index, period): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: PeriodComponent,
      nzAutofocus: null,
      nzData: {
        data: period
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        calendar.periods[index] = result.period;
        this.ref.detectChanges();
      }
    });
  }

  removePeriodInCalendar(calendar, index): void {
    calendar.periods.splice(index, 1);
    this.ref.detectChanges();
  }

  planFromRuntime(): void {
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

  showCalendar(): void {
    setTimeout(() => {
      const cal = $('#full-calendar').calendar({
        language: this.coreService.getLocale(),
        renderEnd: (e) => {
          this.calendarTitle = e.currentYear;
          if (this.toDate) {
            this.changeDate();
            if(!this.calendar){
              setTimeout(()=>{
                this.attachDayTooltips(cal);
              },100)
            }
          }

        }
      });
      const obj: any = {
        dateFrom: this.coreService.getStringDate(null),
        dateTo: this.calendarTitle + '-12-31'
      };
      if (this.calendar) {
        obj.path = this.calendar.calendarName;
      } else {
        obj.calendars = this.getCalendarObj(this.calendars);
        obj.nonWorkingDayCalendars = this.nonWorkingDayCalendars;
        obj.timeZone = this.timeZone;
      }
      this.toDate = obj.dateTo;
      this.getDates(obj, true);
    }, 10);
  }

  private attachDayTooltips(cal: any) {
    cal.element.find('.day .day-content').removeAttr('title');

    cal.element.find('.day:not(.old, .new, .disabled)').each((_, td) => {
      const $td      = $(td);
      const date     = cal._getDate($td);
      const events   = cal.getEvents(date);

      const lines = events
        .map(ev => ev._period)
        .map(p  => this.coreService.getPeriodStr(p))
        .filter(l => !!l);

      if (lines.length) {
        $td.find('.day-content').attr('title', lines.join('\n'));
      }
    });
  }


  changeDate(): void {
    const newDate = new Date();
    newDate.setHours(0, 0, 0, 0);
    let toDate: any;
    if (new Date(this.toDate).getTime() < new Date(this.calendarTitle + '-12-31').getTime()) {
      toDate = this.calendarTitle + '-12-31';
    } else {
      toDate = this.toDate;
    }

    if (newDate.getFullYear() < this.calendarTitle && (new Date(this.calendarTitle + '-01-01').getTime() < new Date(toDate).getTime())) {
      const obj: any = {
        dateFrom: this.calendarTitle + '-01-01',
        dateTo: toDate,
      };

      if (this.calendar) {
        obj.path = this.calendar.calendarName;
      } else {
        obj.calendars = this.getCalendarObj(this.calendars);
        obj.nonWorkingDayCalendars = this.nonWorkingDayCalendars;
        obj.timeZone = this.timeZone;
      }
      this.getDates(obj, false);
    } else if (newDate.getFullYear() === this.calendarTitle) {
      this.planItems = clone(this.tempList);
      const dom = $('#full-calendar');
      if (dom.data('calendar')) {
        dom.data('calendar').setDataSource(this.planItems);
      }
    }
  }

  getPlan(): void {
    $('#full-calendar').data('calendar').setYearView({view: this.viewCalObj.calendarView, year: this.calendarTitle});
    const cal = $('#full-calendar').data('calendar') as any;
    cal.setDataSource(this.planItems);

    if(!this.calendar){
      this.attachDayTooltips(cal);
    }
  }

  editWorkingCal(calendar): void {
    this.openTreeModal('WORKINGDAYSCALENDAR', calendar);
  }

  removeWorkingCal(index): void {
    this.calendars.splice(index, 1);
  }

  removeNonWorkingCal(index): void {
    this.nonWorkingDayCalendars.splice(index, 1);
  }

  /* --------- Begin Restriction  ----------------*/

  addRestrictionInCalendar(data): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzClassName: 'lg',
      nzContent: AddRestrictionComponent,
      nzData: {
        schedulerId: this.schedulerId,
        preferences: this.preferences,
        data: {calendar: this.coreService.clone(data)}
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        data.frequencyList = result.frequencyList;
        this.ref.detectChanges();
      }
    });
  }

  editRestrictionInCalendar(data, frequency, frequencyIndex): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: AddRestrictionComponent,
      nzClassName: 'lg',
      nzData: {
        schedulerId: this.schedulerId,
        preferences: this.preferences,
        data: {
          calendar: this.coreService.clone(data),
          updateFrequency: this.coreService.clone(frequency),
          frequencyIndex: frequencyIndex
        }
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        data.frequencyList = result.frequencyList;
        this.ref.detectChanges();
      }
    });
  }

  deleteRestrictionInCalendar(data, frequency): void {
    for (let i = 0; i < data.frequencyList.length; i++) {
      if (data.frequencyList[i].str === frequency.str) {
        data.frequencyList.splice(i, 1);
        break;
      }
    }
  }

  /* ===================== End Restriction  ======================*/

  ngOnDestroy(): void {
    if (this.schedule.configuration) {
      if (this.timeZone) {
        for (let i = 0; i < this.calendars.length; i++) {
          this.calendars[i].timeZone = this.timeZone;
        }
      }
      this.schedule.configuration.calendars = this.calendars;
      this.schedule.configuration.nonWorkingDayCalendars = this.nonWorkingDayCalendars;
    }
  }

  back(): void {
    this.editor.showPlanned = false;
  }

  private init(): void {

    if (this.schedule.configuration) {
      this.calendars = this.schedule.configuration.calendars;
      this.nonWorkingDayCalendars = this.schedule.configuration.nonWorkingDayCalendars;
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
    if (this.calendar) {
      this.coreService.post('inventory/path', {
        name: obj.path,
        objectType: this.calendar.type
      }).subscribe((res: any) => {
        obj.path = res.path;
        this.callDates(obj, flag);
      });
    } else {
      this.callDates(obj, flag);
    }
  }

  private callDates(obj, flag): void {
    this.coreService.post(!this.calendar ? 'schedule/runtime' : 'inventory/calendar/dates',
      obj).subscribe((result: any) => {
        if(this.calendar){
          this.filterCalDates(result, flag);
        }else{
          this.filterDates(result, flag);
        }
    });
  }

  private filterCalDates(result, flag): void {
    if (result.periods) {
      this.populateCalPlanItems(result);
    } else {
      if (result.dates) {
        for (let i = 0; i < result.dates.length; i++) {
          const x = result.dates[i];
          const obj = {
            startDate: this.coreService.getDate(x),
            endDate: this.coreService.getDate(x),
            color: 'blue'
          };

          this.planItems.push(obj);
        }
      }
      if (result.withExcludes) {
        for (let i = 0; i < result.withExcludes.length; i++) {
          const x = result.withExcludes[i];
          this.planItems.push({
            startDate: this.coreService.getDate(x),
            endDate: this.coreService.getDate(x),
            color: 'orange'
          });
        }
      }
    }
    if (flag) {
      this.tempList = clone(this.planItems);
    }
    $('#full-calendar').data('calendar').setDataSource(this.planItems);
    this.ref.detectChanges();
  }

  private populateCalPlanItems(res: any): void {
    res.periods.forEach((value: any) => {
      let planData: any = {};
      if (value.begin) {
        planData = {
          plannedStartTime: this.coreService.getDateByFormat(value.begin, this.preferences.zone, 'YYYY-MM-DD'),
          plannedShowTime: this.coreService.getTimeFromDate(this.coreService.convertTimeToLocalTZ(this.preferences, value.begin), this.preferences.dateFormat)
        };
        if (value.end) {
          planData.endTime = this.coreService.getTimeFromDate(this.coreService.convertTimeToLocalTZ(this.preferences, value.end),
            this.preferences.dateFormat);
        }
        if (value.repeat) {
          planData.repeat = value.repeat;
        }
      } else if (value.singleStart) {
        planData = {
          plannedStartTime: this.coreService.getDateByFormat(value.singleStart, this.preferences.zone, 'YYYY-MM-DD'),
          plannedShowTime: this.coreService.getTimeFromDate(this.coreService.convertTimeToLocalTZ(this.preferences, value.singleStart), this.preferences.dateFormat)
        };
      }
      const date = this.coreService.getDate(planData.plannedStartTime);
      planData.startDate = date;
      planData.endDate = date;
      planData.color = 'blue';

      this.planItems.push(planData);
    });
  }


  private filterDates(result: any, flag: boolean): void {
    let toPopulate: { dates: string[], periods: any[] };

    if (result.periods) {
      toPopulate = result;
    }
    else if (result.dates) {
      const dateKeys = Object.keys(result.dates);
      const allPeriods: any[] = [];

      dateKeys.forEach(dateKey => {
        const day = result.dates[dateKey];
        if (Array.isArray(day.periods)) {
          day.periods.forEach(period => {
            allPeriods.push({ dateKey, ...period });
          });
        }
      });

      toPopulate = {
        dates:   dateKeys,
        periods: allPeriods
      };
    }
    else {
      toPopulate = { dates: [], periods: [] };
    }

    this.populatePlanItems(toPopulate);

    if (flag) {
      this.tempList = clone(this.planItems);
    }

    $('#full-calendar').data('calendar').setDataSource(this.planItems);
    const cal = $('#full-calendar').data('calendar') as any;
    cal.setDataSource(this.planItems);

    this.attachDayTooltips(cal);

    this.ref.detectChanges();
  }

  private populatePlanItems(res: { dates: string[], periods: any[] }): void {

    res.periods.forEach((value: any) => {
      const planData: any = {};

      planData.plannedStartTime = value.dateKey;
      planData.plannedShowTime  = "";

      if (value.begin) {
        planData.plannedShowTime = this.coreService.getTimeFromDate(
          this.coreService.convertTimeToLocalTZ(this.preferences, value.begin),
          this.preferences.dateFormat
        );
        if (value.repeat) {
          planData.repeat = value.repeat;
        }
        if (value.end) {
          planData.endTime = this.coreService.getTimeFromDate(
            this.coreService.convertTimeToLocalTZ(this.preferences, value.end),
            this.preferences.dateFormat
          );
        }
      }
      else if (value.singleStart) {
        planData.plannedShowTime = this.coreService.getTimeFromDate(
          this.coreService.convertTimeToLocalTZ(this.preferences, value.singleStart),
          this.preferences.dateFormat
        );
      }

      const dateObj = this.coreService.getDate(value.dateKey);
      planData.startDate = dateObj;
      planData.endDate   = dateObj;
      planData.color     = 'blue';
      planData._period   = value;
      planData.tooltip   = this.coreService.getPeriodStr(value);

      this.planItems.push(planData);
    });
  }

  private getCalendarObj(list): any {
    const calendars = [];
    for (let i = 0; i < list.length; i++) {
      const obj: any = {calendarName: list[i].calendarName, periods: list[i].periods};
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

}



