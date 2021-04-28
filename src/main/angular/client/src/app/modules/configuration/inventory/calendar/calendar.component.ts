import {Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges} from '@angular/core';
import {NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
import {DatePipe} from '@angular/common';
import * as moment from 'moment';
import * as _ from 'underscore';
import {CalendarService} from '../../../../services/calendar.service';
import {DataService} from '../../../../services/data.service';
import {CoreService} from '../../../../services/core.service';

declare const Holidays;
declare const $;

@Component({
  selector: 'app-ngbd-modal-content',
  templateUrl: './frequency-dialog.html'
})
export class FrequencyModalComponent implements OnInit {
  @Input() schedulerId: any;
  @Input() dateFormat: any;
  @Input() dateFormatM: any;
  @Input() calendar: any;
  @Input() editor: any;
  @Input() frequency: any;
  @Input() flag: boolean;
  @Input() _temp: any = {};
  @Input() data: any = {};
  @Input() isRuntimeEdit: boolean;

  planItems: any = [];
  Math = Math;
  calObj: any = {};
  countryListArr: any = [];
  selectedMonths: any = [];
  selectedMonthsU: any = [];
  holidayList: any = [];
  holidayDays: any = {checked: false};
  tempItems: any = [];
  hd = new Holidays();
  toDate: any;
  calendarTitle: any;
  frequencyObj: any;
  isCalendarLoading: boolean;
  countryField: boolean;
  isCalendarDisplay = false;
  showMonthRange = false;
  excludedDates: any = [];
  includedDates: any = [];
  tempList: any = [];
  frequencyList: any = [];
  frequencyList1: any = [];
  excludeFrequencyList: any = [];
  isVisible: boolean;
  str: string;
  countArr = [0, 1, 2, 3, 4];
  countArrU = [1, 2, 3, 4];

  daysOptions = [
    {label: 'sunday', value: '0'},
    {label: 'monday', value: '1'},
    {label: 'tuesday', value: '2'},
    {label: 'wednesday', value: '3'},
    {label: 'thursday', value: '4'},
    {label: 'friday', value: '5'},
    {label: 'saturday', value: '6'}
  ];

  monthsOptions = [
    {label: 'january', value: '1'},
    {label: 'february', value: '2'},
    {label: 'march', value: '3'},
    {label: 'april', value: '4'},
    {label: 'may', value: '5'},
    {label: 'june', value: '6'},
    {label: 'july', value: '7'},
    {label: 'august', value: '8'},
    {label: 'september', value: '9'},
    {label: 'october', value: '10'},
    {label: 'november', value: '11'},
    {label: 'december', value: '12'}
  ];

  constructor(public activeModal: NzModalRef, private coreService: CoreService, public modal: NzModalService,
              private datePipe: DatePipe, private calendarService: CalendarService) {
  }

  ngOnInit() {
    setTimeout(() => {
      this.isVisible = true;
    }, 0);

    this.str = 'label.weekDays';
    this.calendarTitle = new Date().getFullYear();
    const countryList = this.hd.getCountries('en');
    if (this.editor.frequencyType === 'INCLUDE' && this.calendar.configuration.includesFrequency.length > 0) {
      this.frequencyList = this.calendar.configuration.includesFrequency;
      if (this.calendar.configuration.excludesFrequency.length > 0) {
        this.excludeFrequencyList = this.calendar.configuration.excludesFrequency;
      }
    } else if (this.editor.frequencyType === 'EXCLUDE' && this.calendar.configuration.excludesFrequency.length > 0) {
      this.frequencyList = this.calendar.configuration.excludesFrequency;
    }
    this.frequency.nationalHoliday = [];

    for (let x in countryList) {
      this.countryListArr.push({code: x, name: countryList[x]});
    }
    if (this.flag) {
      if (this.data) {
        this.showCalendar(this.data);
      } else {
        this.showCalendar(null);
      }
    }

    if (this._temp && !_.isEmpty(this._temp)) {
      this.isRuntimeEdit = true;
      if (this._temp.tab === 'nationalHoliday') {
        this.frequency.year = new Date(this._temp.nationalHoliday[0]).getFullYear();
        this.holidayDays.checked = true;
        this.countryField = true;
      } else if (this._temp.tab === 'weekDays') {
        this.frequency.all = this._temp.days.length === 7;
      }
      for (let i = 0; i < this.frequencyList.length; i++) {
        if (this.frequencyList[i] == this._temp || _.isEqual(this._temp, this.frequencyList[i])) {
          this.updateFrequencyObj(i);
          break;
        }
      }
    } else {
      if (this.frequencyList && this.frequencyList.length > 0) {
        this.generateFrequencyObj();
      }
    }
    if (this.frequency.tab !== 'specificDays' && this.editor.showYearView) {
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
    this.setEditorEnable();
    if (this.frequency.days && this.frequency.days.length > 0) {
      this.checkDays();
    }
    if (this.frequency.months && this.frequency.months.length > 0) {
      this.checkMonths();
    }
  }

  dayChange(value: string[]): void {
    this.frequency.days = value;
    this.onChangeDays();
  }

  monthChange(value: string[]): void {
    this.frequency.months = value;
    this.onChangeMonths();
  }

  setEditorEnable() {
    if (this.frequency.days && this.frequency.days.length > 0) {
      this.editor.isEnable = true;
    }
  }

  updateFrequencyObj(i) {
    if (this.frequencyList[i].tab == 'monthDays') {
      if (this.frequencyList[i].isUltimos === 'months') {
        this.frequency.selectedMonths = _.clone(this.frequencyList[i].selectedMonths);
        this.selectedMonths = [];
        this.frequencyList[i].selectedMonths.forEach((val) => {
          this.selectMonthDaysFunc(val);
        });
      } else {
        this.frequency.selectedMonthsU = _.clone(this.frequencyList[i].selectedMonthsU);
        this.selectedMonthsU = [];
        this.frequencyList[i].selectedMonthsU.forEach((val) => {
          this.selectMonthDaysUFunc(val);
        });
      }

      if (this.frequencyList[i].startingWithM) {
        this.frequency.startingWithM = this.frequencyList[i].startingWithM;
      }
      if (this.frequencyList[i].endOnM) {
        this.frequency.endOnM = this.frequencyList[i].endOnM;
      }
    } else if (this.frequencyList[i].tab === 'specificDays') {
      if (this.frequencyList[i].dates) {
        this.frequencyList[i].dates.forEach((date) => {
          this.tempItems.push({
            startDate: this.convertStringToDate(date),
            endDate: this.convertStringToDate(date),
            color: 'blue'
          });
        });
      }
    } else if (this.frequencyList[i].tab === 'nationalHoliday') {
      this.frequency.nationalHoliday = _.clone(this.frequencyList[i].nationalHoliday);
      if (this._temp.nationalHoliday) {
        this._temp.nationalHoliday.forEach((date) => {
          this.holidayList.push({date});
        });
      }
    }
    if (this.frequencyList[i].tab === 'weekDays') {
      this.frequency.days = _.clone(this.frequencyList[i].days);
      this.frequency.all = this.frequencyList[i].days.length === 7;
      if (this.frequencyList[i].startingWithW) {
        this.frequency.startingWithW = this.frequencyList[i].startingWithW;
      }
      if (this.frequencyList[i].endOnW) {
        this.frequency.endOnW = this.frequencyList[i].endOnW;
      }
    }
    if (this.frequencyList[i].tab == 'every') {
      if (this.frequencyList[i].startingWith) {
        this.frequency.startingWith = this.frequencyList[i].startingWith;
      }
      if (this.frequencyList[i].endOn) {
        this.frequency.endOn = this.frequencyList[i].endOn;
      }
    }
    if (this.frequencyList[i].tab == 'specificWeekDays') {
      if (this.frequencyList[i].startingWithS) {
        this.frequency.startingWithS = this.frequencyList[i].startingWithS;
      }
      if (this.frequencyList[i].endOnS) {
        this.frequency.endOnS = this.frequencyList[i].endOnS;
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

  generateFrequencyObj(): void {
    this.tempItems = [];
    for (let i = 0; i < this.frequencyList.length; i++) {
      this.updateFrequencyObj(i);
    }
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
        } else if (this.frequency.tab == 'weekDays') {
          this.str = 'label.weekDays';
        } else if (this.frequency.tab == 'every') {
          this.str = 'label.every';
        } else if (this.frequency.tab == 'nationalHoliday') {
          this.str = 'label.nationalHoliday';
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
      }

      if (this.frequency.months && this.frequency.months.length > 0) {
        this.checkMonths();
      }
    }
  }

  onChangeDays(): void {
    if (this.frequency.days) {
      this.editor.isEnable = this.frequency.days.length > 0;
      this.frequency.all = this.frequency.days.length == 7;
      this.frequency.days.sort();
    }
  }

  onChangeMonths() {
    if (this.frequency.months) {
      this.frequency.allMonth = this.frequency.months.length == 12;
      this.frequency.months.sort((a, b) => {
        return a - b;
      });
    }
  }

  onChangeHolidays(): void {
    this.editor.isEnable = !!(this.frequency.nationalHoliday && this.frequency.nationalHoliday.length > 0);
    if (this.holidayList && this.frequency.nationalHoliday) {
      this.holidayDays.checked = this.holidayList.length == this.frequency.nationalHoliday.length;
    }
  }

  addCalendarDates(): void {
    if (this.excludedDates.length > 0) {
      this.checkExclude(this.excludedDates);
    }
    if (this.includedDates.length > 0) {
      this.checkInclude(this.includedDates);
    }
    if (this.flag) {
      this.save();
    } else {
      this.editor.showYearView = false;
    }
  }

  selectAllHolidays(): void {
    if (this.holidayDays.checked && this.holidayList.length > 0) {
      let temp = [];
      for (let m = 0; m < this.holidayList.length; m++) {
        if (this.frequency.nationalHoliday.indexOf(this.holidayList[m].date) == -1) {
          temp.push(this.holidayList[m].date);
        }
      }

      this.frequency.nationalHoliday = this.frequency.nationalHoliday.concat(temp);
    } else {
      if (this.frequency.nationalHoliday && this.frequency.nationalHoliday.length > 0) {
        let temp = _.clone(this.frequency.nationalHoliday);
        for (let m = 0; m < this.holidayList.length; m++) {
          for (let x = 0; x < temp.length; x++) {
            if (temp[x] == this.holidayList[m].date) {
              temp.splice(x, 1);
              break;
            }
          }
        }
        this.frequency.nationalHoliday = _.clone(temp);
      }
    }
    this.editor.isEnable = !!(this.frequency.nationalHoliday && this.frequency.nationalHoliday.length > 0);
  }

  changeFrequencyObj(data): void {
    if (!data) {
      data = 'all';
    }
    let obj = {};
    this.freqObj(data, obj);
  }

  changeFrequency(): void {
    this.onFrequencyChange();
    if (this.frequency.tab === 'specificDays') {
      $('#calendar').calendar({
        clickDay: (e) => {
          this.selectDate(e);
        }
      }).setDataSource(this.tempItems);
    }
  }

  selectMonthDaysFunc(value): void {
    if (this.selectedMonths.indexOf(value) === -1) {
      this.selectedMonths.push(value);
    } else {
      this.selectedMonths.splice(this.selectedMonths.indexOf(value), 1);
    }
    this.frequency.selectedMonths = _.clone(this.selectedMonths);
    this.frequency.selectedMonths.sort();
    this.editor.isEnable = this.selectedMonths.length > 0;
  }

  selectMonthDaysUFunc(value): void {
    if (this.selectedMonthsU.indexOf(value) === -1) {
      this.selectedMonthsU.push(value);
    } else {
      this.selectedMonthsU.splice(this.selectedMonthsU.indexOf(value), 1);
    }
    this.frequency.selectedMonthsU = _.clone(this.selectedMonthsU);
    this.frequency.selectedMonthsU.sort();
    this.editor.isEnable = this.selectedMonthsU.length > 0;
  }

  getSelectedMonthDays(value): boolean {
    if (this.selectedMonths.indexOf(value) !== -1) {
      return true;
    }
  }

  getSelectedMonthDaysU(value): boolean {
    if (this.selectedMonthsU.indexOf(value) !== -1) {
      return true;
    }
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

  checkDays(): void {
    this.daysOptions = this.daysOptions.map(item => {
      return {
        ...item,
        checked: (this.frequency.days ? this.frequency.days.indexOf(item.value) > -1 : false)
      };
    });
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

  getDateFormat(date): string {
    return moment(date).format(this.dateFormatM);
  }

  loadHolidayList(): void {
    this.holidayDays.checked = false;
    this.holidayList = [];
    let holidays = [];
    if (this.frequency.country && this.frequency.year) {
      this.hd.init(this.frequency.country);
      holidays = this.hd.getHolidays(this.frequency.year);
      for (let m = 0; m < holidays.length; m++) {
        if (holidays[m].type == 'public' && holidays[m].date && holidays[m].name && holidays[m].date != 'null') {
          if (holidays[m].date.length > 19) {
            holidays[m].date = holidays[m].date.substring(0, 19);
          }
          holidays[m].date = moment(holidays[m].date).format('YYYY-MM-DD');
          this.holidayList.push(holidays[m]);
        }
      }
    }
    if (this.frequencyList.length > 0) {
      for (let i = 0; i < this.frequencyList.length; i++) {
        if (this.frequencyList[i].tab == 'nationalHoliday' && this.frequencyList[i].nationalHoliday.length > 0 && new Date(this.frequencyList[i].nationalHoliday[0]).getFullYear() == this.frequency.year) {
          this.frequency.nationalHoliday = _.clone(this.frequencyList[i].nationalHoliday);
          break;
        }
      }
    }

  }

  addFrequency(): void {
    this.countryField = false;
    this.frequency.str = this.calendarService.freqToStr(this.frequency, this.dateFormat);
    this.setEditorEnable();
    let flag = false;
    if (this.isRuntimeEdit) {
      this.isRuntimeEdit = false;
      if (this.frequencyList.length > 0) {
        for (let i = 0; i < this.frequencyList.length; i++) {
          if (this.frequencyList[i].tab === this._temp.tab && this.frequencyList[i].str === this._temp.str
            && this.frequencyList[i].type === this._temp.type) {
            this.updateFrequencyData(null);

            this.frequencyList[i] = _.clone(this.frequency);
            this.saveFrequency();
            break;
          }
        }
      }
      this._temp = {};
      this.holidayList = [];
      if (this.frequencyList && this.frequencyList.length > 0) {
        this.generateFrequencyObj();
      }
      this.editor.isEnable = false;
      return;
    }
    this.updateFrequencyData(null);
    for (let i = 0; i < this.frequencyList.length; i++) {
      if (_.isEqual(this.frequencyList[i], this.frequency)) {
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
      _dates = _.clone(datesArr);
    }

    if (this.frequencyList.length > 0) {
      let flag1 = false;
      for (let i = 0; i < this.frequencyList.length; i++) {
        if (this.frequency.tab === this.frequencyList[i].tab) {
          if (this.frequency.tab === 'weekDays') {
            if (this.frequency.months && this.frequency.months.length > 0) {
              if (this.frequency.months === this.frequencyList[i].months || _.isEqual(this.frequencyList[i].months, this.frequency.months)) {
                if (_.isEqual(this.frequencyList[i].days, this.frequency.days)) {
                  flag1 = true;
                  break;
                }
                this.frequencyList[i].days = _.clone(this.frequency.days);
                this.frequencyList[i].startingWithW = _.clone(this.frequency.startingWithW);
                this.frequencyList[i].endOnW = _.clone(this.frequency.endOnW);
                this.frequencyList[i].str = _.clone(this.frequency.str);
                flag1 = true;
                break;
              } else {
                if (this.frequencyList[i].months) {
                  if (_.isEqual(this.frequencyList[i].days, this.frequency.days)) {
                    this.frequency.months.forEach((month) => {
                      if (this.frequencyList[i].months.indexOf(month) === -1) {
                        this.frequencyList[i].months.push(month);
                      }
                    });
                    this.frequencyList[i].str = _.clone(this.frequency.str);
                    flag1 = true;
                    break;
                  }
                }
              }
            } else {
              if (!this.frequencyList[i].months) {
                this.frequencyList[i].days = _.clone(this.frequency.days);
                this.frequencyList[i].startingWithM = _.clone(this.frequency.startingWithW);
                this.frequencyList[i].endOnW = _.clone(this.frequency.endOnW);
                this.frequencyList[i].str = _.clone(this.frequency.str);
                flag1 = true;
                break;
              }
            }
          } else if (this.frequency.tab == 'monthDays' && this.frequency.isUltimos == 'months' && this.frequencyList[i].isUltimos == 'months') {
            if (this.frequency.months && this.frequency.months.length > 0) {
              if (this.frequency.months == this.frequencyList[i].months || _.isEqual(this.frequencyList[i].months, this.frequency.months)) {
                this.frequencyList[i].selectedMonths = _.clone(this.frequency.selectedMonths);
                this.frequencyList[i].startingWithM = _.clone(this.frequency.startingWithM);
                this.frequencyList[i].endOnM = _.clone(this.frequency.endOnM);
                this.frequencyList[i].str = _.clone(this.frequency.str);
                flag1 = true;
                break;
              } else {
                if (this.frequencyList[i].months) {
                  if (_.isEqual(this.frequencyList[i].selectedMonths, this.frequency.selectedMonths)) {
                    this.updateFrequencyData(i);
                    flag1 = true;
                    break;
                  }
                }
              }
            } else {
              if (!this.frequencyList[i].months) {
                this.frequencyList[i].selectedMonths = _.clone(this.frequency.selectedMonths);
                this.frequencyList[i].startingWithM = _.clone(this.frequency.startingWithM);
                this.frequencyList[i].endOnM = _.clone(this.frequency.endOnM);
                this.frequencyList[i].str = _.clone(this.frequency.str);
                flag1 = true;
                break;
              }
            }
          } else if (this.frequency.tab == 'monthDays' && this.frequency.isUltimos != 'months' && this.frequencyList[i].isUltimos !== 'months') {
            if (this.frequency.months && this.frequency.months.length > 0) {
              if (this.frequency.months == this.frequencyList[i].months || _.isEqual(this.frequencyList[i].months, this.frequency.months)) {
                this.frequencyList[i].selectedMonthsU = _.clone(this.frequency.selectedMonthsU);
                this.frequencyList[i].startingWithM = _.clone(this.frequency.startingWithM);
                this.frequencyList[i].endOnM = _.clone(this.frequency.endOnM);
                this.frequencyList[i].str = _.clone(this.frequency.str);
                flag1 = true;
                break;
              } else {
                if (this.frequencyList[i].months) {
                  if (_.isEqual(this.frequencyList[i].selectedMonthsU, this.frequency.selectedMonthsU)) {
                    this.updateFrequencyData(i);
                    flag1 = true;
                    break;
                  }
                }
              }
            } else {
              if (!this.frequencyList[i].months) {
                this.frequencyList[i].selectedMonthsU = _.clone(this.frequency.selectedMonthsU);
                this.frequencyList[i].startingWithM = _.clone(this.frequency.startingWithM);
                this.frequencyList[i].endOnM = _.clone(this.frequency.endOnM);
                this.frequencyList[i].str = _.clone(this.frequency.str);

                flag1 = true;
                break;
              }
            }
          } else if (this.frequency.tab == 'specificWeekDays') {
            if (this.frequency.months && this.frequencyList[i].months) {
              if (!_.isEqual(this.frequencyList[i].months, this.frequency.months)) {
                if (_.isEqual(this.frequencyList[i].specificWeekDay, this.frequency.specificWeekDay) && _.isEqual(this.frequencyList[i].which, this.frequency.which)) {
                  this.updateFrequencyData(i);
                  this.frequencyList[i].str = this.calendarService.freqToStr(this.frequencyList[i], this.dateFormat);
                  flag1 = true;
                  break;
                }
              }
            }
          } else if (this.frequency.tab == 'nationalHoliday') {
            flag1 = true;
            datesArr.forEach((dates) => {
              if (this.frequencyList[i].nationalHoliday && this.frequencyList[i].nationalHoliday.length > 0) {
                if (new Date(this.frequencyList[i].nationalHoliday[0]).getFullYear() === new Date(dates[0]).getFullYear()) {
                  dates.forEach((date) => {
                    if (this.frequencyList[i].nationalHoliday.indexOf(date) == -1) {
                      this.frequencyList[i].nationalHoliday.push(date);
                    }
                  });
                  this.frequencyList[i].str = this.calendarService.freqToStr(this.frequencyList[i], this.dateFormat);
                  for (let x = 0; x < _dates.length; x++) {
                    if (_.isEqual(_dates[x], dates)) {
                      _dates.splice(x, 1);
                      break;
                    }
                  }
                }
              }
            });

          } else if (this.frequency.tab == 'specificDays') {
            this.updateFrequencyData(null);
            this.frequencyList[i].dates = _.clone(this.frequency.dates);
            this.frequencyList[i].str = _.clone(this.frequency.str);
            flag1 = true;
            break;
          } else if (this.frequency.tab == 'every') {
            if (_.isEqual(this.frequency.dateEntity, this.frequencyList[i].dateEntity) && _.isEqual(this.frequency.startingWith, this.frequencyList[i].startingWith)) {
              this.frequencyList[i].str = this.calendarService.freqToStr(this.frequency, this.dateFormat);
              this.frequencyList[i].interval = _.clone(this.frequency.interval);
              this.frequencyList[i].str = _.clone(this.frequency.str);
              flag1 = true;
              break;
            }
          }
        }
      }
      if (_dates && _dates.length > 0) {
        for (let i = 0; i < _dates.length; i++) {
          let obj = _.clone(this.frequency);
          obj.type = this.editor.frequencyType;
          obj.nationalHoliday = _dates[i];
          obj.str = this.calendarService.freqToStr(obj, this.dateFormat);
          this.frequencyList.push(obj);
        }
      }
      if (!flag1) {
        this.updateFrequencyData(null);
        if (this.frequency.tab != 'nationalHoliday') {
          this.frequency.type = this.editor.frequencyType;
          this.frequencyList.push(_.clone(this.frequency));
        }
      } else {
        this.frequency.nationHoliday = [];
      }

    } else {
      if (this.frequency.tab == 'nationalHoliday') {
        for (let i = 0; i < datesArr.length; i++) {
          let obj = _.clone(this.frequency);
          obj.type = this.editor.frequencyType;
          obj.nationalHoliday = datesArr[i];
          obj.str = this.calendarService.freqToStr(obj, this.dateFormat);
          this.frequencyList.push(obj);
        }
      } else {
        this.updateFrequencyData(null);
        this.frequency.type = this.editor.frequencyType;
        this.frequencyList.push(_.clone(this.frequency));
      }
    }
    this.frequency.months = [];
    this.frequency.nationalHoliday = [];
    this.frequency.allMonth = false;
    this.holidayDays.checked = false;
    this.editor.isEnable = false;
    this.checkMonths();
  }

  saveFrequency(): void {
    if (this.editor.frequencyType == 'INCLUDE') {
      this.calendar.configuration.includesFrequency = _.clone(this.frequencyList);
    } else {
      this.calendar.configuration.excludesFrequency = _.clone(this.frequencyList);
    }
  }

  editFrequency(data): void {
    this._temp = this.coreService.clone(data);
    this.frequency = this.coreService.clone(data);

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

  deleteFrequency(data): void {
    for (let i = 0; i < this.frequencyList.length; i++) {
      if (this.frequencyList[i] == data || _.isEqual(this.frequencyList[i], data)) {
        this.frequencyList.splice(i, 1);
        if (data.tab == 'specificDays') {
          this.tempItems = [];
        } else if (data.tab == 'nationalHoliday') {
          this.frequency.nationalHoliday = [];
          this.holidayDays.checked = false;
          this.holidayList = [];
          this.frequency.year = new Date().getFullYear();
          this.countryField = false;
        } else if (data.tab == 'monthDays') {
          if (data.isUltimos == 'months') {
            this.selectedMonths = [];
          } else {
            this.selectedMonthsU = [];
          }
        } else if (data.tab == 'weekDays') {
          this.frequency.days = [];
          this.frequency.all = false;
          this.checkDays();
        }
        if (this.frequency.tab === data.tab) {
          this.editor.isEnable = false;
        }
        break;
      }
    }
    if (this.frequencyList.length === 0) {
      let temp = _.clone(this.frequency);
      this.frequency = {};
      this.frequency.tab = temp.tab;
      this.frequency.isUltimos = temp.isUltimos;
    }
    this.checkMonths();
    if (this.frequencyList && this.frequencyList.length > 0) {
      this.generateFrequencyObj();
    }
  }

  changeDate(): void {
    let newDate = new Date();
    newDate.setHours(0, 0, 0, 0);
    let toDate: any;
    if (new Date(this.toDate).getTime() < new Date(this.calendarTitle + '-12-31').getTime()) {
      toDate = this.calendarTitle + '-12-31';
    } else {
      toDate = this.toDate;
    }
    if (newDate.getFullYear() < this.calendarTitle && (new Date(this.calendarTitle + '-01-01').getTime() < new Date(toDate).getTime())) {
      this.planItems = [];
      let obj = {
        dateFrom: this.calendarTitle + '-01-01',
        dateTo: toDate,
        calendar: this.frequencyObj
      };
      this.isCalendarLoading = true;

      this.coreService.post('inventory/calendar/dates', obj).subscribe((result: any) => {
        let color = 'blue';
        if (this.calObj.frequency && this.calObj.frequency != 'all' && this.calObj.frequency.type == 'EXCLUDE') {
          color = 'orange';
        }
        for (let i = 0; i < result.dates.length; i++) {
          let x = result.dates[i];
          let obj = {
            startDate: moment(x),
            endDate: moment(x),
            color
          };

          this.planItems.push(obj);
        }
        if (result.withExcludes) {
          for (let i = 0; i < result.withExcludes.length; i++) {
            let x = result.withExcludes[i];
            this.planItems.push({
              startDate: moment(x),
              endDate: moment(x),
              color: 'orange'
            });
          }
        }

        this.isCalendarLoading = false;
        $('#full-calendar').data('calendar').setDataSource(this.planItems);
      }, () => {
        this.isCalendarLoading = false;
      });
    } else if (newDate.getFullYear() == this.calendarTitle) {
      this.planItems = _.clone(this.tempList);
      $('#full-calendar').data('calendar').setDataSource(this.planItems);
    }
  }

  showCalendar(data): void {
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

  save(): void {
    this.saveFrequency();
    this.activeModal.close({
      editor: this.editor,
      frequency: this.frequency,
      calendar: this.calendar,
      frequencyList: this.frequencyList
    });
  }

  cancel(): void {
    this.activeModal.close('');
  }

  back(): void {
    if (this.flag) {
      this.activeModal.close('');
    } else {
      this.editor.showYearView = false;
    }
    this.isRuntimeEdit = false;
    this.excludedDates = [];
    this.includedDates = [];
  }

  private updateFrequencyData(index) {
    if (index !== null) {
      for (let j = 0; j < this.frequency.months.length; j++) {
        if (this.frequencyList[index].months.indexOf(this.frequency.months[j]) == -1) {
          this.frequencyList[index].months.push(this.frequency.months[j]);
        }
      }
      this.frequencyList[index].str = _.clone(this.frequency.str);
    } else {
      if (this.frequency.tab === 'specificDays') {
        this.frequency.dates = [];
        this.tempItems.forEach((date) => {
          this.frequency.dates.push(moment(date.startDate).format('YYYY-MM-DD'));
        });
        this.frequency.str = this.calendarService.freqToStr(this.frequency, this.dateFormat);
      }
    }
  }

  private convertStringToDate(date): any {
    if (typeof date === 'string') {
      return moment(date);
    } else {
      return date;
    }
  }

  private checkExclude(dates): void {
    let obj = {
      tab: 'specificDays',
      type: 'EXCLUDE',
      exclude: false,
      dates: [],
      str: ''
    };

    for (let m = 0; m < dates.length; m++) {
      obj.dates.push(dates[m].startDate);
    }

    obj.str = this.calendarService.freqToStr(obj, this.dateFormat);
    let flag = true;

    if (this.calendar.configuration.excludesFrequency.length > 0) {
      flag = false;
      for (let i = 0; i < this.calendar.configuration.excludesFrequency.length; i++) {
        if (this.calendar.configuration.excludesFrequency[i].tab == obj.tab) {
          flag = true;
          for (let j = 0; j < this.calendar.configuration.excludesFrequency[i].dates.length; j++) {
            for (let x = 0; x < obj.dates.length; x++) {
              if (this.calendar.configuration.excludesFrequency[i].dates[j] == obj.dates[x]) {
                obj.dates.splice(x, 1);
                break;
              }
            }
          }
          this.calendar.configuration.excludesFrequency[i].dates = this.calendar.configuration.excludesFrequency[i].dates.concat(obj.dates);
          this.calendar.configuration.excludesFrequency[i].str = this.calendarService.freqToStr(this.calendar.configuration.excludesFrequency[i], this.dateFormat);
          break;
        }
      }
    } else {
      this.calendar.configuration.excludesFrequency.push(obj);
    }
    if (!flag) {
      this.calendar.configuration.excludesFrequency.push(obj);
    }
  }

  private checkInclude(dates) {
    let obj = {
      tab: 'specificDays',
      type: 'INCLUDE',
      exclude: false,
      dates: [],
      str: ''
    };

    for (let m = 0; m < dates.length; m++) {
      obj.dates.push(dates[m].startDate);
    }

    obj.str = this.calendarService.freqToStr(obj, this.dateFormat);

    let flag = true;
    if (this.calendar.configuration.includesFrequency.length > 0) {
      flag = false;
      for (let i = 0; i < this.calendar.configuration.includesFrequency.length; i++) {
        if (this.calendar.configuration.includesFrequency[i].tab == obj.tab) {
          flag = true;
          for (let j = 0; j < this.calendar.configuration.includesFrequency[i].dates.length; j++) {
            for (let x = 0; x < obj.dates.length; x++) {
              if (this.calendar.configuration.includesFrequency[i].dates[j] == obj.dates[x]) {
                obj.dates.splice(x, 1);
                break;
              }
            }
          }
          this.calendar.configuration.includesFrequency[i].dates = this.calendar.configuration.includesFrequency[i].dates.concat(obj.dates);
          this.calendar.configuration.includesFrequency[i].str = this.calendarService.freqToStr(this.calendar.configuration.includesFrequency[i], this.dateFormat);
          break;
        }
      }
    } else {
      this.calendar.configuration.includesFrequency.push(obj);
    }
    if (!flag) {
      this.calendar.configuration.includesFrequency.push(obj);
    }
  }

  private checkDate(date) {
    let planData = {
      startDate: date,
      endDate: date,
      color: 'blue'
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
            if (this.planItems[i].color != 'orange') {
              this.planItems[i].color = 'orange';
              flag = true;
            } else {
              this.planItems[i].color = 'blue';
            }
            break;
          }
        }
        if (!isFound) {
          planData.color = 'blue';
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
            if (this.planItems[i].color != 'orange') {
              this.planItems[i].color = 'orange';
            } else {
              this.planItems[i].color = 'blue';
              flag = true;
            }
            break;
          }
        }
        if (!isFound) {
          planData.color = 'orange';
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

  private freqObj(data, obj) {
    this.isCalendarLoading = true;
    this.planItems = [];
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
    if (!obj.dateTo && this.calendar.configuration.to) {
      obj.dateTo = moment(this.calendar.configuration.to, this.dateFormatM).format('YYYY-MM-DD');
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

      let data1 = _.clone(data);
      data1.type = 'INCLUDE';

      this.frequencyObj = this.calendarService.generateCalendarObj(data1, obj1);
    } else {
      this.calObj.frequency = 'all';
      this.frequencyObj = this.generateCalendarAllObj();
    }
    if (this.frequencyObj.includes && _.isEmpty(this.frequencyObj.includes)) {
      delete this.frequencyObj['includes'];
    }
    if (this.frequencyObj.excludes && _.isEmpty(this.frequencyObj.excludes)) {
      delete this.frequencyObj['excludes'];
    }
    obj.calendar = this.frequencyObj;
    if (!obj.dateTo) {
      obj.dateTo = this.calendarTitle + '-12-31';
    }
    this.toDate = _.clone(obj.dateTo);
    let result: any;
    this.coreService.post('inventory/calendar/dates', obj).subscribe((res) => {
      result = res;
      let color = 'blue';
      if (data && data.type == 'EXCLUDE') {
        color = 'orange';
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
      if (result.withExcludes) {
        for (let m = 0; m < result.withExcludes.length; m++) {
          let x = result.withExcludes[m];
          this.planItems.push({
            startDate: moment(x),
            endDate: moment(x),
            color: 'orange'
          });
        }
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
      this.tempList = _.clone(this.planItems);
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
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
})
export class CalendarComponent implements OnInit, OnDestroy, OnChanges {
  @Input() schedulerId: any;
  @Input() preferences: any;
  @Input() permission: any;
  @Input() data: any;
  @Input() copyObj: any;
  @Input() reload: any;
  @Input() isTrash: any;

  submitted = false;
  required = false;
  display = false;
  calendar: any = {};
  dateFormat: any;
  dateFormatM: any;
  comments: any = {radio: 'predefined'};
  editor: any = {isEnable: false, frequencyType: 'INCLUDE'};
  objectType = 'CALENDAR';
  invalidMsg: string;

  constructor(public coreService: CoreService, public modal: NzModalService, private calendarService: CalendarService,
              private dataService: DataService) {
  }

  ngOnInit(): void {
    this.dateFormat = this.coreService.getDateFormat(this.preferences.dateFormat);
    this.dateFormatM = this.coreService.getDateFormatMom(this.preferences.dateFormat);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.reload) {
      if (this.reload) {
        this.editor.frequencyType = 'INCLUDE';
        this.getObject();
        this.reload = false;
        return;
      }
    }
    if (this.calendar.actual) {
      this.saveJSON();
    }
    if (changes.data) {
      if (this.data.type) {
        this.editor.frequencyType = 'INCLUDE';
        this.getObject();
      } else {
        this.calendar = {};
      }
    }
  }

  ngOnDestroy(): void {
    if (this.data.type) {
      this.saveJSON();
    }
  }

  rename(inValid): void {
    if (this.data.id === this.calendar.id && this.data.name !== this.calendar.name) {
      if (!inValid) {
        const data = this.coreService.clone(this.data);
        const name = this.calendar.name;
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
          this.calendar.name = this.data.name;
        });
      } else {
        this.calendar.name = this.data.name;
      }
    }
  }

  createNewFrequency(): void {
    const frequency = {
      tab: 'weekDays',
      dateEntity: 'DAILY',
      year: new Date().getFullYear(),
      isUltimos: 'months',
      days: [],
      months: []
    };
    this.openModel(frequency, null);
  }

  updateFrequency(data): void {
    this.openModel(null, data);
  }

  removeFrequency(index): void {
    if (this.editor.frequencyType === 'INCLUDE') {
      this.calendar.configuration.includesFrequency.splice(index, 1);
    } else {
      this.calendar.configuration.excludesFrequency.splice(index, 1);
    }
    this.saveJSON();
  }

  changeFrequencyType(type: string): void {
    this.editor.frequencyType = type;
  }

  showYearView(): void {
    this.editor.showYearView = true;
    this.modal.create({
      nzTitle: null,
      nzContent: FrequencyModalComponent,
      nzClassName: 'lg',
      nzComponentParams: {
        schedulerId: this.schedulerId,
        dateFormat: this.dateFormat,
        dateFormatM: this.dateFormatM,
        calendar: this.calendar,
        editor: this.editor,
        frequency: {},
        flag: true
      },
      nzFooter: null,
      nzClosable: false
    });
  }

  showCalendar(data): void {
    const frequency = {
      tab: 'weekDays',
      dateEntity: 'DAILY',
      year: new Date().getFullYear(),
      isUltimos: 'months',
      days: [],
      months: []
    };
    this.editor.showYearView = true;
    this.modal.create({
      nzTitle: null,
      nzContent: FrequencyModalComponent,
      nzClassName: 'lg',
      nzComponentParams: {
        schedulerId: this.schedulerId,
        dateFormat: this.dateFormat,
        dateFormatM: this.dateFormatM,
        calendar: this.calendar,
        editor: this.editor,
        frequency,
        flag: true,
        data
      },
      nzFooter: null,
      nzClosable: false
    });
  }

  backToListView(): void {
    this.dataService.reloadTree.next({back: this.calendar});
  }

  saveJSON(): void {
    if (this.isTrash) {
      return;
    }
    let obj: any = this.generateCalendarAllObj();
    obj.title = this.calendar.configuration.title;
    obj.type = this.calendar.configuration.type;
    if (this.calendar.configuration.from) {
      obj.from = moment(this.calendar.configuration.from, this.dateFormatM).format('YYYY-MM-DD');
    }
    if (this.calendar.configuration.to) {
      obj.to = moment(this.calendar.configuration.to, this.dateFormatM).format('YYYY-MM-DD');
    }
    if (obj.includes && _.isEmpty(obj.includes)) {
      delete obj['includes'];
    }
    if (obj.excludes && _.isEmpty(obj.excludes)) {
      delete obj['excludes'];
    }
    if (!_.isEqual(this.calendar.actual, JSON.stringify(this.calendar.configuration))) {
      this.coreService.post('inventory/store', {
        configuration: obj,
        id: this.calendar.id,
        valid: !!obj.includes,
        objectType: obj.type
      }).subscribe((res: any) => {
        if (res.id === this.data.id && this.calendar.id === this.data.id) {
          this.calendar.actual = JSON.stringify(this.calendar.configuration);
          this.calendar.valid = res.valid;
          this.data.valid = res.valid;
          this.calendar.released = false;
          this.data.released = false;
          if (res.invalidMsg && !obj.includes) {
            this.invalidMsg = 'inventory.message.includesIsMissing';
          } else {
            this.invalidMsg = res.invalidMsg;
          }
        }
      }, () => {

      });
    }
  }

  release(): void {
    this.dataService.reloadTree.next({release: this.calendar});
  }

  private openModel(frequency, data): void {
    this.editor.hidePervious = !!data;
    this.editor.showYearView = false;
    this.editor.create = !data;
    this.editor.update = !!data;

    const modal = this.modal.create({
      nzTitle: null,
      nzContent: FrequencyModalComponent,
      nzClassName: 'lg',
      nzAutofocus: null,
      nzComponentParams: {
        schedulerId: this.schedulerId,
        dateFormat: this.dateFormat,
        dateFormatM: this.dateFormatM,
        calendar: this.coreService.clone(this.calendar),
        editor: this.editor,
        frequency: frequency || _.clone(data),
        isRuntimeEdit: !!data,
        _temp: data ? _.clone(data) : {}
      },
      nzFooter: null,
      nzClosable: false
    });
    modal.afterClose.subscribe(res => {
      if (res.calendar) {
        this.calendar.configuration = res.calendar.configuration;
        this.saveJSON();
      }
    });
  }

  private getObject(): void {
    const URL = this.isTrash ? 'inventory/trash/read/configuration' : 'inventory/read/configuration';
    this.coreService.post(URL, {
      id: this.data.id
    }).subscribe((res: any) => {
      if (res.configuration) {
        delete res.configuration['path'];
      } else {
        res.configuration = {};
      }
      this.calendar = res;
      this.calendar.path1 = this.data.path;
      this.calendar.name = this.data.name;
      this.calendar.configuration.includesFrequency = [];
      this.calendar.configuration.excludesFrequency = [];
      if (this.calendar.configuration.includes || this.calendar.configuration.excludes) {
        this.convertObjToArr(this.calendar.configuration);
      }
      if (this.calendar.configuration.from) {
        this.calendar.configuration.from = new Date(this.calendar.configuration.from);
        if (!moment(this.calendar.configuration.from).isValid()) {
          this.calendar.configuration.from = new Date();
        }
      }
      if (this.calendar.configuration.to) {
        this.calendar.configuration.to = new Date(this.calendar.configuration.to);
        if (!moment(this.calendar.configuration.to).isValid()) {
          this.calendar.configuration.to = null;
        }
      }
      if (!this.calendar.configuration.type) {
        this.calendar.configuration.type = 'WORKINGDAYSCALENDAR';
        this.calendar.configuration.from = new Date();
      }
      this.calendar.actual = JSON.stringify(this.calendar.configuration);
      if (!res.valid) {
        this.invalidMsg = 'inventory.message.includesIsMissing';
      } else {
        this.invalidMsg = '';
      }
    });
  }

  private convertObjToArr(data): void {
    let obj = {};
    if (data.includes && !_.isEmpty(data.includes)) {
      this._convertObjToArr(data, 'includes', obj);
    }
    if (data.excludes && !_.isEmpty(data.excludes)) {
      this._convertObjToArr(data, 'excludes', obj);
    }
  }

  private _convertObjToArr(data, type, obj): void {
    const TYPE = type === 'includes' ? 'INCLUDE' : 'EXCLUDE';
    if (data[type].months && data[type].months.length > 0) {
      for (let m = 0; m < data[type].months.length; m++) {
        if (data[type].months[m].weekdays && data[type].months[m].weekdays.length > 0) {
          for (let x = 0; x < data[type].months[m].weekdays.length; x++) {
            obj = {};
            this.iterateData(obj, data[type].months[m].weekdays[x], data[type].months[m], 'weekDays', TYPE, null, null);
          }
        }
        if (data[type].months[m].monthdays && data[type].months[m].monthdays.length > 0) {

          for (let x = 0; x < data[type].months[m].monthdays.length; x++) {
            if (data[type].months[m].monthdays[x].weeklyDays && data[type].months[m].monthdays[x].weeklyDays.length > 0) {
              for (let y = 0; y < data[type].months[m].monthdays[x].weeklyDays.length; y++) {
                obj = {};
                this.iterateData(obj, data[type].months[m].monthdays[x].weeklyDays[y], data[type].months[m], 'specificWeekDays', TYPE, data[type].months[m].monthdays[x], 'months');
              }
            } else {
              obj = {};
              this.iterateData(obj, data[type].months[m].monthdays[x], data[type].months[m], 'monthDays', TYPE, null, 'months');
            }
          }
        }
        if (data[type].months[m].ultimos && data[type].months[m].ultimos.length > 0) {
          for (let x = 0; x < data[type].months[m].ultimos.length; x++) {
            if (data[type].months[m].ultimos[x].weeklyDays && data[type].months[m].ultimos[x].weeklyDays.length > 0) {
              for (let y = 0; y < data[type].months[m].ultimos[x].weeklyDays.length; y++) {
                obj = {};
                this.iterateData(obj, data[type].months[m].ultimos[x].weeklyDays[y], data[type].months[m], 'specificWeekDays', TYPE, data[type].months[m].ultimos[x], 'ultimos');

              }
            } else {
              obj = {};
              this.iterateData(obj, data[type].months[m].ultimos[x], data[type].months[m], 'monthDays', TYPE, null, 'ultimos');

            }
          }
        }
      }
    }
    if (data[type].dates && data[type].dates.length > 0) {
      obj = {};
      this.iterateData(obj, data[type].dates, null, 'specificDays', TYPE, null, 'ultimos');

    }
    if (data[type].weekdays && data[type].weekdays.length > 0) {
      for (let x = 0; x < data[type].weekdays.length; x++) {
        obj = {};
        this.iterateData(obj, data[type].weekdays[x], null, 'weekDays', TYPE, null, null);
      }

    }
    if (data[type].monthdays && data[type].monthdays.length > 0) {
      for (let x = 0; x < data[type].monthdays.length; x++) {

        if (data[type].monthdays[x].weeklyDays && data[type].monthdays[x].weeklyDays.length > 0) {
          for (let y = 0; y < data[type].monthdays[x].weeklyDays.length; y++) {
            obj = {};
            this.iterateData(obj, data[type].monthdays[x].weeklyDays[y], null, 'specificWeekDays', TYPE, data[type].monthdays[x], 'months');
          }
        } else {
          obj = {};
          this.iterateData(obj, data[type].monthdays[x], null, 'monthDays', TYPE, null, 'months');

        }
      }
    }
    if (data[type].ultimos && data[type].ultimos.length > 0) {
      for (let x = 0; x < data[type].ultimos.length; x++) {

        if (data[type].ultimos[x].weeklyDays && data[type].ultimos[x].weeklyDays.length > 0) {
          for (let y = 0; y < data[type].ultimos[x].weeklyDays.length; y++) {
            obj = {};
            this.iterateData(obj, data[type].ultimos[x].weeklyDays[y], null, 'specificWeekDays', TYPE, data[type].ultimos[x], 'ultimos');
          }
        } else {
          obj = {};
          this.iterateData(obj, data[type].ultimos[x], null, 'monthDays', TYPE, null, 'ultimos');
        }

      }
    }
    if (data[type].holidays && data[type].holidays.length > 0) {
      let arr = this.calendarService.groupByDates(data[type].holidays[0].dates);
      for (let x = 0; x < arr.length; x++) {
        obj = {};
        this.iterateData(obj, arr[x], null, 'nationalHoliday', TYPE, null, null);
      }
    }
    if (data[type].repetitions && data[type].repetitions.length > 0) {
      for (let x = 0; x < data[type].repetitions.length; x++) {
        obj = {};
        this.iterateData(obj, data[type].repetitions[x], null, 'every', TYPE, null, null);

      }
    }
  }

  private iterateData(obj, data, month, tab, type, monthday, isUltimos): void {
    obj.tab = tab;
    obj.type = type;
    if (month) {
      obj.months = [];
      for (let x = 0; x < month.months.length; x++) {
        obj.months.push(month.months[x].toString());
      }
    }
    if (tab === 'weekDays') {
      obj.days = [];
      for (let x = 0; x < data.days.length; x++) {
        obj.days.push(data.days[x].toString());
      }
      if (month) {
        obj.allMonth = month.months.length == 12;
      }
      obj.startingWithW = data.from;
      obj.endOnW = data.to;
      obj.all = data.days.length == 7;
    } else if (tab === 'specificWeekDays') {
      obj.specificWeekDay = this.calendarService.getStringDay(data.day);
      if (isUltimos === 'months') {
        obj.which = data.weekOfMonth;
      } else {
        obj.which = -data.weekOfMonth;
      }
      obj.startingWithS = monthday.from;
      obj.endOnS = monthday.to;
    } else if (tab === 'specificDays') {
      obj.dates = [];
      for (let x = 0; x < data.length; x++) {
        obj.dates.push(data[x]);
      }
    } else if (tab === 'monthDays') {
      if (isUltimos == 'months') {
        obj.selectedMonths = [];
        for (let x = 0; x < data.days.length; x++) {
          obj.selectedMonths.push(data.days[x].toString());
        }
      } else {
        obj.selectedMonthsU = [];
        for (let x = 0; x < data.days.length; x++) {
          obj.selectedMonthsU.push(data.days[x].toString());
        }
      }
      obj.startingWithM = data.from;
      obj.endOnM = data.to;
      obj.isUltimos = isUltimos;
    } else if (tab === 'every') {
      obj.dateEntity = data.repetition;
      obj.interval = data.step;
      obj.startingWith = data.from;
      obj.endOn = data.to;
    } else if (tab === 'nationalHoliday') {
      obj.nationalHoliday = data;
    }

    obj.str = this.calendarService.freqToStr(obj, this.dateFormat);
    if (type === 'INCLUDE') {
      this.calendar.configuration.includesFrequency.push(obj);
    } else {
      this.calendar.configuration.excludesFrequency.push(obj);
    }
  }

  private generateCalendarAllObj(): any {
    let obj = {includes: {}, excludes: {}};
    if (this.calendar.configuration.includesFrequency.length > 0) {
      for (let x = 0; x < this.calendar.configuration.includesFrequency.length; x++) {
        this.calendarService.generateCalendarObj(this.calendar.configuration.includesFrequency[x], obj);
      }
    }
    if (this.calendar.configuration.excludesFrequency.length > 0) {
      for (let x = 0; x < this.calendar.configuration.excludesFrequency.length; x++) {
        this.calendarService.generateCalendarObj(this.calendar.configuration.excludesFrequency[x], obj);
      }
    }
    return obj;
  }
}
