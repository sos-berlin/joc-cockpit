import {Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {CoreService} from '../../../services/core.service';
import {DataService} from '../../../services/data.service';
import {AuthService} from '../../../components/guard';
import {TranslateService} from '@ngx-translate/core';
import {ToasterService} from 'angular2-toaster';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {catchError, debounceTime, distinctUntilChanged, map, tap, switchMap} from 'rxjs/operators';
import {saveAs} from 'file-saver';
import {DatePipe} from '@angular/common';
import {Observable, of} from 'rxjs';
import * as moment from 'moment';
import * as _ from 'underscore';
import {TreeModalComponent} from '../../../components/tree-modal/tree.component';
import {CalendarService} from '../../../services/calendar.service';
import {DeleteModalComponent} from '../../../components/delete-modal/delete.component';


declare const mxEditor;
declare const mxUtils;
declare const mxEvent;
declare const mxClient;
declare const mxObjectCodec;
declare const mxEdgeHandler;
declare const mxCodec;
declare const mxAutoSaveManager;
declare const mxGraphHandler;
declare const mxCellAttributeChange;
declare const mxGraph;
declare const mxImage;
declare const mxForm;
declare const mxHierarchicalLayout;
declare const mxImageExport;
declare const mxXmlCanvas2D;
declare const mxOutline;
declare const mxDragSource;
declare const mxConstants;
declare const mxRectangle;
declare const mxPoint;
declare const mxUndoManager;
declare const mxEventObject;

declare const Holidays;
declare const X2JS;
declare const $;

const x2js = new X2JS();

@Component({
  selector: 'app-preview-calendar-template',
  template: ' <div id="full-calendar"></div>',
})
export class PreviewCalendarComponent implements OnInit {
  @Input() schedulerId: any;
  @Input() calendar: any;
  planItems = [];
  tempList = [];
  calendarTitle: number;
  toDate: any;

  constructor(private coreService: CoreService) {
    this.calendarTitle = new Date().getFullYear();
  }

  ngOnInit(): void {
    $('#full-calendar').calendar({
      renderEnd: (e) => {
        this.calendarTitle = e.currentYear;
        this.changeDate();

      }
    });
    console.log(this.calendar);
    let obj = {
      jobschedulerId: this.schedulerId,
      dateFrom: this.calendar.from || moment().format('YYYY-MM-DD'),
      dateTo: this.calendar.to,
      path: this.calendar.path
    };
    this.toDate = _.clone(obj.dateTo);
    if (new Date(obj.dateTo).getTime() > new Date(this.calendarTitle + '-12-31').getTime()) {
      obj.dateTo = this.calendarTitle + '-12-31';
    }
    this.getDates(obj, true);
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
        path: this.calendar.path
      };
      this.getDates(obj, false);
    } else if (newDate.getFullYear() === this.calendarTitle) {
      this.planItems = _.clone(this.tempList);
      if ($('#full-calendar').data('calendar')) {
        $('#full-calendar').data('calendar').setDataSource(this.planItems);
      }
    }
  }

  private getDates(obj, flag: boolean): void {

    this.coreService.post('calendar/dates', obj).subscribe((result: any) => {
      let color = '#007da6';
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
      if (flag) {
        this.tempList = _.clone(this.planItems);
      }
      $('#full-calendar').data('calendar').setDataSource(this.planItems);
    });
  }
}

@Component({
  selector: 'app-period-template',
  templateUrl: './period-editor-dialog.html',
})
export class PeriodEditorComponent implements OnInit, OnDestroy {
  @Input() isNew: boolean;
  @Input() period: any = {};
  editor: any = {};

  constructor(public activeModal: NgbActiveModal, private coreService: CoreService) {

  }

  static getTimeInString(time) {
    if (time.toString().substring(0, 2) == '00' && time.toString().substring(3, 5) == '00') {
      return time.toString().substring(6, time.length) + ' seconds';
    } else if (time.toString().substring(0, 2) == '00') {
      return time.toString().substring(3, time.length) + ' minutes';
    } else if ((time.toString().substring(0, 2) != '00' && time.length == 5) || (time.length > 5 && time.toString().substring(0, 2) != '00' && (time.toString().substring(6, time.length) == '00'))) {
      return time.toString().substring(0, 5) + ' hours';
    } else {
      return time;
    }
  }

  ngOnInit(): void {
    if (this.isNew) {
      this.period.frequency = 'single_start';
      this.period.period = {};
      this.period.period._begin = '00:00:00';
      this.period.period._end = '24:00:00';
      this.period.period._when_holiday = 'suppress';
    } else {
      console.log(this.period);
    }
    this.editor.when_holiday_options = [
      'previous_non_holiday',
      'next_non_holiday',
      'suppress',
      'ignore_holiday'
    ];
  }

  ngOnDestroy(): void {
  }

  onSubmit(): void {
    this.period.str = this.getString();
    this.activeModal.close(this.period);
  }

  cancel(): void {
    this.activeModal.dismiss();
  }

  private getString(): string {
    let str = '';
    if (this.period.period._begin) {
      str = this.period.period._begin;
    }
    if (this.period.period._end) {
      str = str + '-' + this.period.period._end;
    }
    if (this.period.period._single_start) {
      this.period.frequency = 'single_start';
      str = 'Single start: ' + this.period.period._single_start;
    } else if (this.period.period._absolute_repeat) {
      this.period.frequency = 'absolute_repeat';
      str = str + ' every ' + PeriodEditorComponent.getTimeInString(this.period.period._absolute_repeat);
    } else if (this.period.period._repeat) {
      this.period.frequency = 'repeat';
      str = str + ' every ' + PeriodEditorComponent.getTimeInString(this.period.period._repeat);
    } else {
      this.period.frequency = 'time_slot';
    }
    return str;
  }

}

@Component({
  selector: 'app-order-template',
  templateUrl: './order-template.html',
})
export class OrderTemplateComponent implements OnInit {
  order: any = {};
  variableObject: any = {};
  @Input() preferences: any;
  @Input() schedulerId: any;
  calendarSearch: any;
  nonCalendarSearch: any;
  searching = false;
  searchFailed = false;
  searchingNon = false;
  previewCalendarView = false;
  calendarObj: any;

  constructor(private modalService: NgbModal, private coreService: CoreService) {

  }

  ngOnInit(): void {
    this.order.variables = [];
    this.order.calendars = [];
    this.order.nonWorkingCalendars = [];
    this.variableObject.variables = [];
    this.addCriteria();
  }

  onSubmit(): void {
    if (this.order.variables) {
      this.order.variables = this.order.variables.concat(this.variableObject.variables);
    }
    console.log(this.order);
  }

  showCalendarModel(type): void {
    const modalRef = this.modalService.open(TreeModalComponent, {backdrop: 'static'});
    modalRef.componentInstance.schedulerId = this.schedulerId;
    modalRef.componentInstance.paths = this.order.calendar;
    modalRef.componentInstance.type = type === 'WORKING_DAYS' ? 'WORKINGDAYSCALENDAR' : 'NONWORKINGDAYSCALENDAR';
    modalRef.componentInstance.object = 'Calendar';
    modalRef.componentInstance.objects = type === 'WORKING_DAYS' ? this.order.calendars : this.order.nonWorkingCalendars;
    modalRef.componentInstance.showCheckBox = false;
    modalRef.result.then((result) => {
      console.log(result);
      if (_.isArray(result)) {
        if (type === 'WORKING_DAYS') {
          this.order.calendars = result;
        } else {
          this.order.nonWorkingCalendars = result;
        }
      }
    }, (reason) => {
      console.log('close...', reason);
    });
  }

  addPeriodInCalendar(calendar): void {
    const modalRef = this.modalService.open(PeriodEditorComponent, {backdrop: 'static'});
    modalRef.componentInstance.isNew = true;
    modalRef.componentInstance.period = {};
    modalRef.result.then((result) => {
      console.log(result);
      if (!calendar.periods) {
        calendar.periods = [];
      }
      calendar.periods.push(result);

    }, (reason) => {
      console.log('close...', reason);

    });
  }

  updatePeriodInCalendar(calendar, index, period): void {
    const modalRef = this.modalService.open(PeriodEditorComponent, {backdrop: 'static'});
    modalRef.componentInstance.period = period;
    modalRef.result.then((result) => {

    }, (reason) => {
      console.log('close...', reason);
    });
  }

  removePeriodInCalendar(calendar, period): void {
    for (let i = 0; i < calendar.periods.length; i++) {
      if (calendar.periods[i] == period) {
        calendar.periods.splice(i, 1);
        break;
      }
    }
  }

  search(term: string, type: string) {
    if (term === '') {
      return of([]);
    }
    let obj = {
      jobschedulerId: this.schedulerId,
      regex: term,
      type: type
    };
    return this.coreService.post('calendars', obj).pipe(
      map((response: any) => response.calendars)
    );
  }

  searchCalendars = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => this.searching = true),
      switchMap(term =>
        this.search(term, 'WORKING_DAYS').pipe(
          tap(() => this.searchFailed = false),
          catchError(() => {
            this.searchFailed = true;
            return of([]);
          }))
      ),
      tap(() => this.searching = false)
    );

  searchNonCalendars = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(() => this.searchingNon = true),
      switchMap(term =>
        this.search(term, 'NON_WORKING_DAYS').pipe(
          tap(() => this.searchFailed = false),
          catchError(() => {
            this.searchFailed = true;
            return of([]);
          }))
      ),
      tap(() => this.searchingNon = false)
    );

  formatter = (x: { path: string }) => {
    let flag = false;
    if (this.calendarSearch) {
      if (this.order.calendars.length > 0) {
        for (let i = 0; i < this.order.calendars.length; i++) {
          if (this.order.calendars[i].path === x.path) {
            flag = true;
            break;
          }
        }
      }
      if (!flag) {
        this.order.calendars.push(x);
      }
      this.calendarSearch = '';
    } else {
      if (this.order.nonWorkingCalendars.length > 0) {
        for (let i = 0; i < this.order.nonWorkingCalendars.length; i++) {
          if (this.order.nonWorkingCalendars[i].path === x.path) {
            flag = true;
            break;
          }
        }
      }
      if (!flag) {
        console.log(x);
        this.order.nonWorkingCalendars.push(x);
      }
    }
  };

  previewCalendar(calendar): void {
    this.calendarObj = calendar;
    this.previewCalendarView = true;
  }

  closeCalendarView() {
    this.previewCalendarView = false;
  }

  removeWorkingCal(index): void {
    this.order.calendars.splice(index, 1);
  }

  removeNonWorkingCal(index): void {
    this.order.nonWorkingCalendars.splice(index, 1);
  }

  addCriteria(): void {
    let param = {
      name: '',
      value: ''
    };
    if (this.variableObject.variables) {
      this.variableObject.variables.push(param);
    }
  }

  removeVariable(index): void {
    this.variableObject.variables.splice(index, 1);
  }
}

@Component({
  selector: 'app-lock-template',
  templateUrl: './lock-template.html',
})
export class LockTemplateComponent implements OnInit {
  @Input() schedulerId: any;
  lock: any = {};

  constructor() {

  }

  ngOnInit(): void {
    this.lock.nonExclusive = true;
  }

  onSubmit(): void {

  }

}

@Component({
  selector: 'app-process-class-template',
  templateUrl: './process-class-template.html',
})
export class ProcessClassTemplateComponent implements OnInit {
  @Input() schedulerId: any;
  processClass: any = {};
  object: any = {hosts: []};

  constructor() {

  }

  ngOnInit(): void {
    this.addCriteria();
  }

  onSubmit(): void {

    console.log(this.processClass);
  }

  addCriteria(): void {
    let param = {
      url: '',
      timeout: '',
      period: ''
    };
    if (this.object.hosts) {
      this.object.hosts.push(param);
    }
  }

  removeCriteria(index): void {
    this.object.hosts.splice(index, 1);
  }
}

@Component({
  selector: 'app-ngbd-modal-content',
  templateUrl: './frequency-dialog.html'
})
export class FrequencyModalComponent implements OnInit, OnDestroy {

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
  isRuntimeEdit: boolean;
  countryField: boolean;
  isCalendarDisplay = false;
  showMonthRange = false;

  excludedDates: any = [];
  includedDates: any = [];

  tempList: any = [];

  frequencyList: any = [];
  frequencyList1: any = [];
  excludeFrequencyList: any = [];

  str: string;
  config: any = {};

  @Input() schedulerId: any;
  @Input() dateFormat: any;
  @Input() dateFormatM: any;
  @Input() calendar: any;
  @Input() editor: any;
  @Input() frequency: any = {};
  @Input() flag: boolean;
  @Input() _temp: any = {};
  @Input() data: any = {};

  constructor(public activeModal: NgbActiveModal, private coreService: CoreService, public modalService: NgbModal, private datePipe: DatePipe, private calendarService: CalendarService) {
  }

  ngOnInit() {
    $('.modal').css('opacity', 0.65);
    $('#freq-modal').parents('div').addClass('card m-a');

    this.str = 'label.weekDays';
    this.calendarTitle = new Date().getFullYear();
    this.config = {
      format: this.dateFormatM
    };

    let countryList = this.hd.getCountries('en');

    if (this.editor.frequencyType === 'INCLUDE' && this.calendar.includesFrequency.length > 0) {
      this.frequencyList = this.calendar.includesFrequency;
      if (this.calendar.excludesFrequency.length > 0) {
        this.excludeFrequencyList = this.calendar.excludesFrequency;
      }
    } else if (this.editor.frequencyType === 'EXCLUDE' && this.calendar.excludesFrequency.length > 0) {
      this.frequencyList = this.calendar.excludesFrequency;
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
      if (this._temp.tab == 'nationalHoliday') {
        this.frequency.year = new Date(this._temp.nationalHoliday[0]).getFullYear();
        this.holidayDays.checked = true;
        this.countryField = true;
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
  }

  setEditorEnable() {
    if (this.frequency.days && this.frequency.days.length > 0) {
      this.editor.isEnable = true;
    }
  }

  ngOnDestroy() {
    $('.modal').css('opacity', 1);
  }

  updateFrequencyObj(i) {
    if (this.frequencyList[i].tab == 'monthDays') {
      if (this.frequencyList[i].isUltimos === 'months') {
        this.frequency.selectedMonths = _.clone(this.frequencyList[i].selectedMonths);
        this.selectedMonths = [];
        for (let x = 0; x < this.frequencyList[i].selectedMonths.length; x++) {
          this.selectMonthDaysFunc(this.frequencyList[i].selectedMonths[x]);
        }
      } else {
        this.frequency.selectedMonthsU = _.clone(this.frequencyList[i].selectedMonthsU);
        this.selectedMonthsU = [];
        for (let x = 0; x < this.frequencyList[i].selectedMonthsU.length; x++) {
          this.selectMonthDaysUFunc(this.frequencyList[i].selectedMonthsU[x]);
        }
      }

      if (this.frequencyList[i].startingWithM) {
        this.frequency.startingWithM = moment(this.frequencyList[i].startingWithM).format(this.dateFormatM);
      }
      if (this.frequencyList[i].endOnM) {
        this.frequency.endOnM = moment(this.frequencyList[i].endOnM).format(this.dateFormatM);
      }
    } else if (this.frequencyList[i].tab === 'specificDays') {
      for (let m = 0; m < this.frequencyList[i].dates.length; m++) {
        let x = this.frequencyList[i].dates[m].split('-');
        this.tempItems.push({
          startDate: new Date(x[0], x[1] - 1, x[2] - 1),
          endDate: new Date(x[0], x[1] - 1, x[2] - 1),
          color: '#007da6'
        });
      }

      if (this.frequencyList[i].startingWithS)
        this.frequency.startingWithS = moment(this.frequencyList[i].startingWithS).format(this.dateFormatM);
      if (this.frequencyList[i].endOnS)
        this.frequency.endOnS = moment(this.frequencyList[i].endOnS).format(this.dateFormatM);

    } else if (this.frequencyList[i].tab == 'nationalHoliday') {
      this.frequency.nationalHoliday = _.clone(this.frequencyList[i].nationalHoliday) || [];
      for (let m = 0; m < this.frequency.nationalHoliday.length; m++) {
        this.holidayList.push({date: this.frequency.nationalHoliday[m]});
      }
    }
    if (this.frequencyList[i].tab === 'weekDays') {
      this.frequency.days = _.clone(this.frequencyList[i].days);
      this.frequency.all = this.frequencyList[i].days.length === 7;
      if (this.frequencyList[i].startingWithW)
        this.frequency.startingWithW = moment(this.frequencyList[i].startingWithW).format(this.dateFormatM);
      if (this.frequencyList[i].endOnW)
        this.frequency.endOnW = moment(this.frequencyList[i].endOnW).format(this.dateFormatM);
    }
    if (this.frequencyList[i].tab == 'every') {
      if (this.frequencyList[i].startingWith)
        this.frequency.startingWith = moment(this.frequencyList[i].startingWith).format(this.dateFormatM);
      if (this.frequencyList[i].endOn)
        this.frequency.endOn = moment(this.frequencyList[i].endOn).format(this.dateFormatM);
    }
    if (this.frequencyList[i].tab == 'specificWeekDays') {
      if (this.frequencyList[i].startingWithS)
        this.frequency.startingWithS = moment(this.frequencyList[i].startingWithS).format(this.dateFormatM);
      if (this.frequencyList[i].endOnS)
        this.frequency.endOnS = moment(this.frequencyList[i].endOnS).format(this.dateFormatM);
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
    for (let i = 0; i < this.frequencyList.length; i++) {
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
    }
  }

  onChangeDays() {
    if (this.frequency.days) {
      this.editor.isEnable = this.frequency.days.length > 0;
      this.frequency.all = this.frequency.days.length == 7;
      this.frequency.days.sort();
    }
  }

  onChangeMonths() {
    if (this.frequency.months) {
      this.frequency.allMonth = this.frequency.months.length == 12;
      this.frequency.months.sort(function (a, b) {
        return a - b;
      });
    }
  }

  onChangeHolidays() {
    this.editor.isEnable = !!(this.frequency.nationalHoliday && this.frequency.nationalHoliday.length > 0);
    if (this.holidayList && this.frequency.nationalHoliday) {
      this.holidayDays.checked = this.holidayList.length == this.frequency.nationalHoliday.length;
    }
  }

  addCalendarDates() {
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

  selectAllHolidays() {
    if (this.holidayDays.checked && this.holidayList.length > 0) {
      let temp = [];
      for (let m = 0; m < this.holidayList.length; m++) {
        if (this.frequency.nationalHoliday.indexOf(this.holidayList[m].date) == -1)
          temp.push(this.holidayList[m].date);
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
    this.frequency.selectedMonths = _.clone(this.selectedMonths);
    this.frequency.selectedMonths.sort();
    this.editor.isEnable = this.selectedMonths.length > 0;
  }

  selectMonthDaysUFunc(value) {
    if (this.selectedMonthsU.indexOf(value) == -1) {
      this.selectedMonthsU.push(value);
    } else {
      this.selectedMonthsU.splice(this.selectedMonthsU.indexOf(value), 1);
    }
    this.frequency.selectedMonthsU = _.clone(this.selectedMonthsU);
    this.frequency.selectedMonthsU.sort();
    this.editor.isEnable = this.selectedMonthsU.length > 0;
  }

  getSelectedMonthDays(value) {
    if (this.selectedMonths.indexOf(value) != -1)
      return true;
  }

  getSelectedMonthDaysU(value) {
    if (this.selectedMonthsU.indexOf(value) != -1)
      return true;
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

  loadHolidayList() {
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

  addFrequency() {
    this.countryField = false;
    this.frequency.str = this.calendarService.freqToStr(this.frequency, this.dateFormat);

    this.setEditorEnable();
    if (this.frequency.startingWith) {
      this.frequency.startingWith = this.coreService.toMomentDateFormat(this.frequency.startingWith);
    }
    if (this.frequency.startingWithW) {
      this.frequency.startingWithW = this.coreService.toMomentDateFormat(this.frequency.startingWithW);
    }
    if (this.frequency.startingWithM) {
      this.frequency.startingWithM = this.coreService.toMomentDateFormat(this.frequency.startingWithM);
    }
    if (this.frequency.startingWithS) {
      this.frequency.startingWithS = this.coreService.toMomentDateFormat(this.frequency.startingWithS);
    }
    if (this.frequency.endOn) {
      this.frequency.endOn = this.coreService.toMomentDateFormat(this.frequency.endOn);
    }
    if (this.frequency.endOnW) {
      this.frequency.endOnW = this.coreService.toMomentDateFormat(this.frequency.endOnW);
    }
    if (this.frequency.endOnM) {
      this.frequency.endOnM = this.coreService.toMomentDateFormat(this.frequency.endOnM);
    }
    if (this.frequency.endOnS) {
      this.frequency.endOnS = this.coreService.toMomentDateFormat(this.frequency.endOnS);
    }

    let flag = false;
    if (this.isRuntimeEdit) {
      this.isRuntimeEdit = false;
      if (this.frequencyList.length > 0) {
        for (let i = 0; i < this.frequencyList.length; i++) {
          if (this.frequencyList[i].tab == this._temp.tab && this.frequencyList[i].str == this._temp.str && this.frequencyList[i].type == this._temp.type) {

            if (this.frequency.tab == 'specificDays') {
              this.frequency.dates = [];
              for (let j = 0; j < this.tempItems.length; j++) {
                this.frequency.dates.push(moment(this.tempItems[j].startDate).format('YYYY-MM-DD'));
              }
              this.frequency.str = this.calendarService.freqToStr(this.frequency, this.dateFormat);
            }

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
    if (this.frequency.tab == 'specificDays') {
      this.frequency.dates = [];
      for (let j = 0; j < this.tempItems.length; j++) {
        this.frequency.dates.push(moment(this.tempItems[j].startDate).format('YYYY-MM-DD'));
      }
      this.frequency.str = this.calendarService.freqToStr(this.frequency, this.dateFormat);
    }
    for (let i = 0; i < this.frequencyList.length; i++) {
      if (_.isEqual(this.frequencyList[i], this.frequency)) {
        flag = true;
        break;
      }
    }

    if (flag) {
      return;
    }
    let _dates = [];
    if (this.frequency.tab == 'nationalHoliday') {
      var datesArr = this.calendarService.groupByDates(this.frequency.nationalHoliday);
      _dates = _.clone(datesArr);
    }

    if (this.frequencyList.length > 0) {

      let flag1 = false;
      for (let i = 0; i < this.frequencyList.length; i++) {

        if (this.frequency.tab == this.frequencyList[i].tab) {

          if (this.frequency.tab == 'weekDays') {
            if (this.frequency.months && this.frequency.months.length > 0) {
              if (this.frequency.months == this.frequencyList[i].months || _.isEqual(this.frequencyList[i].months, this.frequency.months)) {
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
                if (this.frequencyList[i].months)
                  if (_.isEqual(this.frequencyList[i].days, this.frequency.days)) {
                    for (let j = 0; j < this.frequency.months.length; j++) {
                      if (this.frequencyList[i].months.indexOf(this.frequency.months[j]) == -1)
                        this.frequencyList[i].months.push(this.frequency.months[j]);
                    }
                    this.frequencyList[i].str = _.clone(this.frequency.str);
                    flag1 = true;
                    break;
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
                if (this.frequencyList[i].months)
                  if (_.isEqual(this.frequencyList[i].selectedMonths, this.frequency.selectedMonths)) {
                    for (let j = 0; j < this.frequency.months.length; j++) {
                      if (this.frequencyList[i].months.indexOf(this.frequency.months[j]) == -1)
                        this.frequencyList[i].months.push(this.frequency.months[j]);
                    }
                    this.frequencyList[i].str = _.clone(this.frequency.str);
                    flag1 = true;
                    break;
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
                if (this.frequencyList[i].months)
                  if (_.isEqual(this.frequencyList[i].selectedMonthsU, this.frequency.selectedMonthsU)) {
                    for (let j = 0; j < this.frequency.months.length; j++) {
                      if (this.frequencyList[i].months.indexOf(this.frequency.months[j]) == -1)
                        this.frequencyList[i].months.push(this.frequency.months[j]);
                    }
                    this.frequencyList[i].str = _.clone(this.frequency.str);
                    flag1 = true;
                    break;
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
                  for (let j = 0; j < this.frequency.months.length; j++) {
                    if (this.frequencyList[i].months.indexOf(this.frequency.months[j]) == -1)
                      this.frequencyList[i].months.push(this.frequency.months[j]);
                  }
                  this.frequencyList[i].str = this.calendarService.freqToStr(this.frequencyList[i], this.dateFormat);
                  flag1 = true;
                  break;
                }
              }
            }
          } else if (this.frequency.tab == 'nationalHoliday') {
            flag1 = true;
            for (let i = 0; i < datesArr.length; i++) {
              if (this.frequencyList[i].nationalHoliday && this.frequencyList[i].nationalHoliday.length > 0) {
                if (new Date(this.frequencyList[i].nationalHoliday[0]).getFullYear() == new Date(datesArr[i][0].toString()).getFullYear()) {
                  for (let j = 0; j < datesArr[i].length; j++) {
                    if (this.frequencyList[i].nationalHoliday.indexOf(datesArr[i][j]) == -1) {
                      this.frequencyList[i].nationalHoliday.push(datesArr[i][j]);
                    }
                  }
                  this.frequencyList[i].str = this.calendarService.freqToStr(this.frequencyList[i], this.dateFormat);
                  for (let x = 0; x < _dates.length; x++) {
                    if (_.isEqual(_dates[x], datesArr[i])) {
                      _dates.splice(x, 1);
                      break;
                    }
                  }
                }
              }
            }

          } else if (this.frequency.tab == 'specificDays') {
            this.frequency.dates = [];
            for (let j = 0; j < this.tempItems.length; j++) {
              this.frequency.dates.push(moment(this.tempItems[j].startDate).format('YYYY-MM-DD'));
            }
            this.frequency.str = this.calendarService.freqToStr(this.frequency, this.dateFormat);
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
        if (this.frequency.tab == 'specificDays') {
          this.frequency.dates = [];
          for (let i = 0; i < this.tempItems.length; i++) {
            this.frequency.dates.push(moment(this.tempItems[i].startDate).format('YYYY-MM-DD'));
          }
          this.frequency.str = this.calendarService.freqToStr(this.frequency, this.dateFormat);
        }
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
        if (this.frequency.tab == 'specificDays') {
          this.frequency.dates = [];
          for (let i = 0; i < this.tempItems.length; i++) {
            this.frequency.dates.push(moment(this.tempItems[i].startDate).format('YYYY-MM-DD'));
          }
          this.frequency.str = this.calendarService.freqToStr(this.frequency, this.dateFormat);
        }
        this.frequency.type = this.editor.frequencyType;
        this.frequencyList.push(_.clone(this.frequency));
      }
    }
    this.frequency.months = [];
    this.frequency.nationalHoliday = [];
    this.frequency.allMonth = false;
    this.holidayDays.checked = false;
    this.editor.isEnable = false;
  }

  saveFrequency() {
    if (this.editor.frequencyType == 'INCLUDE') {
      this.calendar.includesFrequency = _.clone(this.frequencyList);
    } else {
      this.calendar.excludesFrequency = _.clone(this.frequencyList);
    }
  }

  editFrequency(data) {
    this._temp = _.clone(data);
    this.frequency = _.clone(data);

    if (data.tab == 'weekDays') {
      let StartDate = moment(data.startingWithW).format('YYYY-MM-DD');
      let endDate = moment(data.endOnW).format('YYYY-MM-DD');
      let startingWithW = _.clone(StartDate.split('-').reverse().join('.'));
      let endOnW = _.clone(endDate.split('-').reverse().join('.'));
      this.frequency.startingWithW = startingWithW;
      this.frequency.endOnW = endOnW;
    } else if (data.tab == 'every') {
      let StartDate = moment(data.startingWith).format('YYYY-MM-DD');
      let endDate = moment(data.endOn).format('YYYY-MM-DD');
      let startingWith = _.clone(StartDate.split('-').reverse().join('.'));
      let endOn = _.clone(endDate.split('-').reverse().join('.'));
      this.frequency.startingWith = startingWith;
      this.frequency.endOn = endOn;
    } else if (data.tab == 'specificWeekDays') {
      let StartDate = moment(data.startingWithS).format('YYYY-MM-DD');
      let endDate = moment(data.endOnS).format('YYYY-MM-DD');
      let startingWithS = _.clone(StartDate.split('-').reverse().join('.'));
      let endOnS = _.clone(endDate.split('-').reverse().join('.'));
      this.frequency.startingWithS = startingWithS;
      this.frequency.endOnS = endOnS;
    } else if (data.tab == 'monthDays') {
      let StartDate = moment(data.startingWithM).format('YYYY-MM-DD');
      let endDate = moment(data.endOnM).format('YYYY-MM-DD');
      let startingWithM = _.clone(StartDate.split('-').reverse().join('.'));
      let endOnM = _.clone(endDate.split('-').reverse().join('.'));
      this.frequency.startingWithM = startingWithM;
      this.frequency.endOnM = endOnM;
    }

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

  deleteFrequency(data) {
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
        }
        break;
      }
    }
    if (this.frequencyList.length == 0) {
      let temp = _.clone(this.frequency);
      this.frequency = {};
      this.frequency.tab = temp.tab;
      this.frequency.isUltimos = temp.isUltimos;
    }
    if (this.frequencyList && this.frequencyList.length > 0) {
      this.generateFrequencyObj();
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

      this.coreService.post('calendar/dates', obj).subscribe((result: any) => {
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
      this.planItems = _.clone(this.tempList);
    }
  }

  showCalendar(data) {
    this.calendarTitle = new Date().getFullYear();
    this.frequencyList1 = [];
    if (this.calendar.includesFrequency.length > 0) {
      for (let i = 0; i < this.calendar.includesFrequency.length; i++) {
        this.frequencyList1.push(this.calendar.includesFrequency[i]);
      }
    }
    if (this.calendar.excludesFrequency.length > 0) {
      for (let i = 0; i < this.calendar.excludesFrequency.length; i++) {
        this.frequencyList1.push(this.calendar.excludesFrequency[i]);
      }
    }
    this.changeFrequencyObj(data);
  }

  save() {
    this.saveFrequency();
    this.activeModal.close({
      editor: this.editor,
      frequency: this.frequency,
      calendar: this.calendar,
      frequencyList: this.frequencyList
    });
  }

  cancel() {
    this.activeModal.close('');
  }

  back() {
    if (this.flag) {
      this.activeModal.close('');
    } else {
      this.editor.showYearView = false;
    }
    this.isRuntimeEdit = false;
    this.excludedDates = [];
    this.includedDates = [];
  }

  private checkExclude(dates) {
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

    if (this.calendar.excludesFrequency.length > 0) {
      flag = false;
      for (let i = 0; i < this.calendar.excludesFrequency.length; i++) {
        if (this.calendar.excludesFrequency[i].tab == obj.tab) {
          flag = true;
          for (let j = 0; j < this.calendar.excludesFrequency[i].dates.length; j++) {
            for (let x = 0; x < obj.dates.length; x++) {
              if (this.calendar.excludesFrequency[i].dates[j] == obj.dates[x]) {
                obj.dates.splice(x, 1);
                break;
              }
            }
          }
          this.calendar.excludesFrequency[i].dates = this.calendar.excludesFrequency[i].dates.concat(obj.dates);
          this.calendar.excludesFrequency[i].str = this.calendarService.freqToStr(this.calendar.excludesFrequency[i], this.dateFormat);
          break;
        }
      }
    } else {
      this.calendar.excludesFrequency.push(obj);
    }
    if (!flag) {
      this.calendar.excludesFrequency.push(obj);
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
    if (this.calendar.includesFrequency.length > 0) {
      flag = false;
      for (let i = 0; i < this.calendar.includesFrequency.length; i++) {
        if (this.calendar.includesFrequency[i].tab == obj.tab) {
          flag = true;
          for (let j = 0; j < this.calendar.includesFrequency[i].dates.length; j++) {
            for (let x = 0; x < obj.dates.length; x++) {
              if (this.calendar.includesFrequency[i].dates[j] == obj.dates[x]) {
                obj.dates.splice(x, 1);
                break;
              }
            }
          }
          this.calendar.includesFrequency[i].dates = this.calendar.includesFrequency[i].dates.concat(obj.dates);
          this.calendar.includesFrequency[i].str = this.calendarService.freqToStr(this.calendar.includesFrequency[i], this.dateFormat);
          break;
        }
      }
    } else {
      this.calendar.includesFrequency.push(obj);
    }
    if (!flag) {
      this.calendar.includesFrequency.push(obj);
    }
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
    if (!obj.dateFrom && this.calendar.from) {
      obj.dateFrom = moment(this.calendar.from, this.dateFormatM).format('YYYY-MM-DD') || moment().format('YYYY-MM-DD');
    }
    if (!obj.dateTo) {
      obj.dateTo = moment(this.calendar.to, this.dateFormatM).format('YYYY-MM-DD');
      this.toDate = _.clone(obj.dateTo);
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

    obj.calendar = this.frequencyObj;

    let result: any;
    this.coreService.post('calendar/dates', obj).subscribe((res) => {
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
    if (this.calendar.includesFrequency.length > 0) {
      for (let i = 0; i < this.calendar.includesFrequency.length; i++) {
        this.calendarService.generateCalendarObj(this.calendar.includesFrequency[i], obj);
      }
    }
    if (this.calendar.excludesFrequency.length > 0) {
      for (let i = 0; i < this.calendar.excludesFrequency.length; i++) {
        this.calendarService.generateCalendarObj(this.calendar.excludesFrequency[i], obj);
      }
    }
    return obj;
  }
}

@Component({
  selector: 'app-calendar-template',
  templateUrl: './calendar-template.html',
})
export class CalendarTemplateComponent implements OnInit {
  submitted = false;
  required = false;
  display = false;
  isUnique = true;
  logError: boolean;
  calendar: any = {};
  oldType: any;
  dateFormat: any;
  dateFormatM: any;
  comments: any = {radio: 'predefined'};
  editor: any = {isEnable: false, frequencyType: 'INCLUDE'};
  predefinedMessageList: any = [];
  config: any = {};
  categories: any = [];
  calendarObj: any;
  new: boolean;
  @Input() schedulerId: any;
  @Input() preferences: any;

  constructor(public coreService: CoreService, public modalService: NgbModal, private translate: TranslateService,
              private toasterService: ToasterService, private calendarService: CalendarService) {

  }

  ngOnInit(): void {
    this.dateFormat = this.coreService.getDateFormat(this.preferences.dateFormat);
    this.dateFormatM = this.coreService.getDateFormatMom(this.preferences.dateFormat);
    this.calendar = {
      path: '/',
      type: 'WORKING_DAYS',
      includesFrequency: [],
      excludesFrequency: [],
      to: moment().format(this.dateFormatM)
    };
    this.config = {
      format: this.dateFormatM
    };
  }


  createNewFrequency() {
    this.editor.create = true;
    this.editor.update = false;
    this.editor.showYearView = false;

    let frequency = {
      tab: 'weekDays',
      dateEntity: 'DAILY',
      year: new Date().getFullYear(),
      isUltimos: 'months',
      days: [],
      months: []
    };
    const modalRef = this.modalService.open(FrequencyModalComponent, {
      backdrop: 'static',
      size: 'lg'
    });
    modalRef.componentInstance.schedulerId = this.schedulerId;
    modalRef.componentInstance.dateFormat = this.dateFormat;
    modalRef.componentInstance.dateFormatM = this.dateFormatM;
    modalRef.componentInstance.calendar = this.calendar;
    modalRef.componentInstance.editor = this.editor;
    modalRef.componentInstance.frequency = frequency;
    modalRef.componentInstance.isRuntimeEdit = false;
    modalRef.result.then(() => {

    }, (reason) => {
      console.log('close...', reason);
    });
  }

  updateFrequency(data) {
    this.editor.hidePervious = true;
    this.editor.showYearView = false;
    this.editor.create = false;
    this.editor.update = true;

    const modalRef = this.modalService.open(FrequencyModalComponent, {
      backdrop: 'static',
      size: 'lg'
    });

    modalRef.componentInstance.schedulerId = this.schedulerId;
    modalRef.componentInstance.dateFormat = this.dateFormat;
    modalRef.componentInstance.dateFormatM = this.dateFormatM;
    modalRef.componentInstance.calendar = this.calendar;
    modalRef.componentInstance.editor = this.editor;
    modalRef.componentInstance.frequency = _.clone(data);
    modalRef.componentInstance.isRuntimeEdit = true;
    modalRef.componentInstance._temp = _.clone(data);
    modalRef.result.then(() => {

    }, (reason) => {
      console.log('close...', reason);
    });
  }

  removeFrequency(index) {
    if (this.editor.frequencyType === 'INCLUDE') {
      this.calendar.includesFrequency.splice(index, 1);
    } else {
      this.calendar.excludesFrequency.splice(index, 1);
    }
  }

  getFolderTree() {
    const modalRef = this.modalService.open(TreeModalComponent, {backdrop: 'static'});
    modalRef.componentInstance.schedulerId = this.schedulerId;
    modalRef.componentInstance.paths = [];
    modalRef.componentInstance.isCollapsed = true;
    modalRef.componentInstance.showCheckBox = false;
    modalRef.componentInstance.type = this.calendar.type === 'WORKING_DAYS' ? 'WORKINGDAYSCALENDAR' : 'NONWORKINGDAYSCALENDAR';
    modalRef.result.then((path) => {
      this.calendar.path = path;
    }, (reason) => {
      console.log('close...', reason);
    });
  }

  onSubmit(): void {
    this.isUnique = true;

    if (this.calendar.name && this.calendar.path && this.calendar.to) {
      this.submitted = true;
    } else {
      this.submitted = false;
      return;
    }
    this.logError = false;
    this.calendar.calendarObj = this.generateCalendarAllObj();
    if (this.required) {
      if (this.comments.comment) {
        this.submit();
      } else {
        this.logError = true;
      }
    } else {
      this.submit();
    }
  }

  saveAs() {
    if (this.calendar.path && this.calendar.to) {
      this.submitted = true;
    } else {
      return;
    }
    this.logError = false;
    this.calendar.calendarObj = this.generateCalendarAllObj();
    if (this.required) {
      if (this.comments.comment) {
        this.storeCalendar();
      } else {
        this.logError = true;
      }
    } else {
      this.storeCalendar();
    }
  }

  storeCalendar() {
    this.submitted = true;
    let obj = {
      jobschedulerId: this.schedulerId,
      calendar: this.calendar.calendarObj,
      auditLog: {
        comment: this.comments.comment,
        timeSpent: this.comments.timeSpent,
        ticketLink: this.comments.ticketLink
      }
    };
    if (this.new) {
      if (this.calendar.path == '/') {
        obj.calendar.path = '/' + this.calendar.name;
      } else {
        obj.calendar.path = this.calendar.path + '/' + this.calendar.name;
      }
    } else {
      obj.calendar.path = this.calendar.newPath;
      obj.calendar.id = this.calendar.id;
    }
    obj.calendar.title = this.calendar.title;
    obj.calendar.category = this.calendar.category;
    obj.calendar.type = this.calendar.type;
    if (this.calendar.from) {
      obj.calendar.from = moment(this.calendar.from, this.dateFormatM).format('YYYY-MM-DD');
    }
    if (this.calendar.to) {
      obj.calendar.to = moment(this.calendar.to, this.dateFormatM).format('YYYY-MM-DD');
    }
    this.coreService.post('calendar/store', obj).subscribe(() => {
      console.log(this.calendar);
    }, () => {
      this.submitted = false;
    });
  }

  changeFrequencyType(type: string) {
    this.editor.frequencyType = type;
  }

  showYearView() {
    let frequency = {};
    this.editor.showYearView = true;
    const modalRef = this.modalService.open(FrequencyModalComponent, {
      backdrop: 'static',
      size: 'lg'
    });
    modalRef.componentInstance.schedulerId = this.schedulerId;
    modalRef.componentInstance.dateFormat = this.dateFormat;
    modalRef.componentInstance.dateFormatM = this.dateFormatM;
    modalRef.componentInstance.calendar = this.calendar;
    modalRef.componentInstance.editor = this.editor;
    modalRef.componentInstance.frequency = frequency;
    modalRef.componentInstance.flag = true;
    modalRef.result.then(() => {

    }, (reason) => {
      console.log('close...', reason);
    });
  }

  showCalendar(data) {
    let frequency = {
      tab: 'weekDays',
      dateEntity: 'DAILY',
      year: new Date().getFullYear(),
      isUltimos: 'months',
      days: [],
      months: []
    };
    this.editor.showYearView = true;
    const modalRef = this.modalService.open(FrequencyModalComponent, {
      backdrop: 'static',
      size: 'lg'
    });
    modalRef.componentInstance.schedulerId = this.schedulerId;
    modalRef.componentInstance.dateFormat = this.dateFormat;
    modalRef.componentInstance.dateFormatM = this.dateFormatM;
    modalRef.componentInstance.calendar = this.calendar;
    modalRef.componentInstance.editor = this.editor;
    modalRef.componentInstance.frequency = frequency;
    modalRef.componentInstance.flag = true;
    modalRef.componentInstance.data = data;
    modalRef.result.then(() => {

    }, (reason) => {
      console.log('close...', reason);
    });
  }

  private convertObjToArr(data) {
    let obj = {};
    if (data.includes && !_.isEmpty(data.includes)) {
      if (data.includes.months && data.includes.months.length > 0) {
        for (let m = 0; m < data.includes.months.length; m++) {
          if (data.includes.months[m].weekdays && data.includes.months[m].weekdays.length > 0) {
            for (let x = 0; x < data.includes.months[m].weekdays.length; x++) {
              obj = {};
              this.iterateData(obj, data.includes.months[m].weekdays[x], data.includes.months[m], 'weekDays', 'INCLUDE', null, null);
            }
          }
          if (data.includes.months[m].monthdays && data.includes.months[m].monthdays.length > 0) {

            for (let x = 0; x < data.includes.months[m].monthdays.length; x++) {
              if (data.includes.months[m].monthdays[x].weeklyDays && data.includes.months[m].monthdays[x].weeklyDays.length > 0) {
                for (let y = 0; y < data.includes.months[m].monthdays[x].weeklyDays.length; y++) {
                  obj = {};
                  this.iterateData(obj, data.includes.months[m].monthdays[x].weeklyDays[y], data.includes.months[m], 'specificWeekDays', 'INCLUDE', data.includes.months[m].monthdays[x], 'months');
                }
              } else {
                obj = {};
                this.iterateData(obj, data.includes.months[m].monthdays[x], data.includes.months[m], 'monthDays', 'INCLUDE', null, 'months');
              }
            }
          }
          if (data.includes.months[m].ultimos && data.includes.months[m].ultimos.length > 0) {
            for (let x = 0; x < data.includes.months[m].ultimos.length; x++) {
              if (data.includes.months[m].ultimos[x].weeklyDays && data.includes.months[m].ultimos[x].weeklyDays.length > 0) {
                for (let y = 0; y < data.includes.months[m].ultimos[x].weeklyDays.length; y++) {
                  obj = {};
                  this.iterateData(obj, data.includes.months[m].ultimos[x].weeklyDays[y], data.includes.months[m], 'specificWeekDays', 'INCLUDE', data.includes.months[m].ultimos[x], 'ultimos');

                }
              } else {
                obj = {};
                this.iterateData(obj, data.includes.months[m].ultimos[x], data.includes.months[m], 'monthDays', 'INCLUDE', null, 'ultimos');

              }
            }
          }
        }
      }
      if (data.includes.dates && data.includes.dates.length > 0) {
        obj = {};
        this.iterateData(obj, data.includes.dates, null, 'specificDays', 'INCLUDE', null, 'ultimos');

      }
      if (data.includes.weekdays && data.includes.weekdays.length > 0) {
        for (let x = 0; x < data.includes.weekdays.length; x++) {
          obj = {};
          this.iterateData(obj, data.includes.weekdays[x], null, 'weekDays', 'INCLUDE', null, null);
        }

      }
      if (data.includes.monthdays && data.includes.monthdays.length > 0) {
        for (let x = 0; x < data.includes.monthdays.length; x++) {

          if (data.includes.monthdays[x].weeklyDays && data.includes.monthdays[x].weeklyDays.length > 0) {
            for (let y = 0; y < data.includes.monthdays[x].weeklyDays.length; y++) {
              obj = {};
              this.iterateData(obj, data.includes.monthdays[x].weeklyDays[y], null, 'specificWeekDays', 'INCLUDE', data.includes.monthdays[x], 'months');
            }
          } else {
            obj = {};
            this.iterateData(obj, data.includes.monthdays[x], null, 'monthDays', 'INCLUDE', null, 'months');

          }
        }
      }
      if (data.includes.ultimos && data.includes.ultimos.length > 0) {
        for (let x = 0; x < data.includes.ultimos.length; x++) {

          if (data.includes.ultimos[x].weeklyDays && data.includes.ultimos[x].weeklyDays.length > 0) {
            for (let y = 0; y < data.includes.ultimos[x].weeklyDays.length; y++) {
              obj = {};
              this.iterateData(obj, data.includes.ultimos[x].weeklyDays[y], null, 'specificWeekDays', 'INCLUDE', data.includes.ultimos[x], 'ultimos');
            }
          } else {
            obj = {};
            this.iterateData(obj, data.includes.ultimos[x], null, 'monthDays', 'INCLUDE', null, 'ultimos');
          }

        }
      }
      if (data.includes.holidays && data.includes.holidays.length > 0) {
        let arr = this.calendarService.groupByDates(data.includes.holidays[0].dates);
        for (let x = 0; x < arr.length; x++) {
          obj = {};
          this.iterateData(obj, arr[x], null, 'nationalHoliday', 'INCLUDE', null, null);
        }
      }
      if (data.includes.repetitions && data.includes.repetitions.length > 0) {
        for (let x = 0; x < data.includes.repetitions.length; x++) {
          obj = {};
          this.iterateData(obj, data.includes.repetitions[x], null, 'every', 'INCLUDE', null, null);

        }
      }
    }
    if (data.excludes && !_.isEmpty(data.excludes)) {
      if (data.excludes.months && data.excludes.months.length > 0) {
        for (let m = 0; m < data.excludes.months; m++) {
          if (data.excludes.months[m].weekdays && data.excludes.months[m].weekdays.length > 0) {
            for (let y = 0; y < data.excludes.months[m].weekdays.length; y++) {
              obj = {};
              this.iterateData(obj, data.excludes.months[m].weekdays[y], data.excludes.months[m], 'weekDays', 'EXCLUDE', null, null);
            }
          }
          if (data.excludes.months[m].monthdays && data.excludes.months[m].monthdays.length > 0) {
            for (let x = 0; x < data.excludes.months[m].monthdays.length; x++) {
              if (data.excludes.months[m].monthdays[x].weeklyDays && data.excludes.months[m].monthdays[x].weeklyDays.length > 0) {
                for (let y = 0; y < data.excludes.months[m].months.length; y++) {
                  obj = {};
                  this.iterateData(obj, data.excludes.months[m].months[y], data.excludes.months[m], 'specificWeekDays', 'EXCLUDE', data.excludes.months[m].monthdays[x], 'months');
                }
              } else {
                obj = {};
                this.iterateData(obj, data.excludes.months[m].monthdays[x], data.excludes.months[m], 'monthDays', 'EXCLUDE', null, 'months');
              }
            }
          }
          if (data.excludes.months[m].ultimos && data.excludes.months[m].ultimos.length > 0) {
            for (let x = 0; x < data.excludes.months[m].ultimos.length; x++) {
              if (data.excludes.months[m].ultimos[x].weeklyDays && data.excludes.months[m].ultimos[x].weeklyDays.length > 0) {
                for (let y = 0; y < data.excludes.months[m].ultimos[x].weeklyDays.length; y++) {
                  obj = {};
                  this.iterateData(obj, data.excludes.months[m].ultimos[x].weeklyDays[y], data.excludes.months[m], 'specificWeekDays', 'EXCLUDE', data.excludes.months[m].ultimos[x], 'ultimos');
                }
              } else {
                obj = {};
                this.iterateData(obj, data.excludes.months[m].ultimos[x], data.excludes.months[m], 'monthDays', 'EXCLUDE', null, 'ultimos');

              }

            }

          }
        }
      }
      if (data.excludes.dates && data.excludes.dates.length > 0) {
        obj = {};
        this.iterateData(obj, data.excludes.dates, null, 'specificDays', 'EXCLUDE', null, 'ultimos');

      }
      if (data.excludes.weekdays && data.excludes.weekdays.length > 0) {
        for (let x = 0; x < data.excludes.weekdays.length; x++) {
          obj = {};
          this.iterateData(obj, data.excludes.weekdays[x], null, 'weekDays', 'EXCLUDE', null, null);

        }

      }
      if (data.excludes.monthdays && data.excludes.monthdays.length > 0) {
        for (let x = 0; x < data.excludes.monthdays.length; x++) {
          if (data.excludes.monthdays[x].weeklyDays && data.excludes.monthdays[x].weeklyDays.length > 0) {
            for (let y = 0; y < data.excludes.monthdays[x].weeklyDays.length; y++) {
              obj = {};
              this.iterateData(obj, data.excludes.monthdays[x].weeklyDays[y], null, 'specificWeekDays', 'EXCLUDE', null, 'months');
            }
          } else {
            obj = {};
            this.iterateData(obj, data.excludes.monthdays[x], null, 'monthDays', 'EXCLUDE', null, 'months');
          }
        }
      }
      if (data.excludes.ultimos && data.excludes.ultimos.length > 0) {
        for (let x = 0; x < data.excludes.ultimos.months.length; x++) {
          if (data.excludes.ultimos[x].weeklyDays && data.excludes.ultimos[x].weeklyDays.length > 0) {
            for (let y = 0; y < data.excludes.ultimos[x].weeklyDays.length; y++) {
              obj = {};
              this.iterateData(obj, data.excludes.ultimos[x].weeklyDays[y], null, 'specificWeekDays', 'EXCLUDE', data.excludes.ultimos[x], 'ultimos');
            }
          } else {
            obj = {};
            this.iterateData(obj, data.excludes.ultimos[x], null, 'monthDays', 'EXCLUDE', null, 'ultimos');
          }

        }
      }
      if (data.excludes.holidays && data.excludes.holidays.length > 0) {
        let arr = this.calendarService.groupByDates(data.excludes.holidays[0].dates);
        for (let x = 0; x < arr.length; x++) {
          obj = {};
          this.iterateData(obj, arr[x], null, 'nationalHoliday', 'EXCLUDE', null, null);

        }
      }
      if (data.excludes.repetitions && data.excludes.repetitions.length > 0) {
        for (let x = 0; x < data.excludes.repetitions.length; x++) {
          obj = {};
          this.iterateData(obj, data.excludes.repetitions[x], null, 'every', 'EXCLUDE', null, null);

        }
      }
    }
  }

  private iterateData(obj, data, month, tab, type, monthday, isUltimos) {
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
      if (month)
        obj.allMonth = month.months.length == 12;
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
      if (data.from)
        obj.startingWith = data.from;
    } else if (tab === 'nationalHoliday') {
      obj.nationalHoliday = data;
    }

    obj.str = this.calendarService.freqToStr(obj, this.dateFormat);
    if (type === 'INCLUDE')
      this.calendar.includesFrequency.push(obj);
    else
      this.calendar.excludesFrequency.push(obj);

  }

  private generateCalendarAllObj() {
    let obj = {includes: {}, excludes: {}};
    if (this.calendar.includesFrequency.length > 0) {
      for (let x = 0; x < this.calendar.includesFrequency.length; x++) {
        this.calendarService.generateCalendarObj(this.calendar.includesFrequency[x], obj);
      }
    }
    if (this.calendar.excludesFrequency.length > 0) {
      for (let x = 0; x < this.calendar.excludesFrequency.length; x++) {
        this.calendarService.generateCalendarObj(this.calendar.excludesFrequency[x], obj);
      }
    }
    return obj;
  }

  private submit() {
    if (!this.new) {
      this.coreService.post('calendar/used', {
        id: this.calendar.id,
        jobschedulerId: this.schedulerId
      }).subscribe((res) => {
        this.calendar.usedIn = res;

        if (this.calendar.usedIn && (this.calendar.usedIn.orders || this.calendar.usedIn.jobs || this.calendar.usedIn.schedules)) {
          this.submitted = false;
          if (this.oldType != this.calendar.type) {

            let title = '';
            this.translate.get('message.calendarTypeCannotBeChange').subscribe(translatedValue => {
              title = translatedValue;
            });
            this.toasterService.pop('warning', title, '');
          } else {

            const modalRef = this.modalService.open(DeleteModalComponent, {backdrop: 'static'});
            modalRef.componentInstance.calendar = this.calendar;
            modalRef.result.then(() => {
              this.storeCalendar();
            }, (reason) => {
              console.log('close...', reason);
            });
          }
        } else {
          this.storeCalendar();
        }
      });
    } else {
      this.storeCalendar();
    }
  }

}

@Component({
  selector: 'app-workflow-template',
  templateUrl: './workflow-template.html',
  styleUrls: ['./workflow-template.scss']
})
export class WorkFlowTemplateComponent implements OnInit, OnDestroy {
  editor: any;
  dummyXml: any;
  workFlowJson: any = {};
  isPropertyHide = false;
  count = 11;

  // Declare Map object to store fork and join Ids
  nodeMap = new Map();

  isWorkflowReload = true;
  configXml = './assets/mxgraph/config/diagrameditor.xml';
  merge = 'symbol;image=./assets/mxgraph/images/symbols/merge.png';
  abort = 'symbol;image=./assets/mxgraph/images/symbols/abort.png';
  terminate = 'symbol;image=./assets/mxgraph/images/symbols/terminate.png';
  await = 'symbol;image=./assets/mxgraph/images/symbols/timer.png';
  fork = 'symbol;image=./assets/mxgraph/images/symbols/fork.png';

  @Input() selectedPath: any;
  @Input() data: any;
  @Input() preferences: any;
  @Input() schedulerId: any;

  constructor(public coreService: CoreService, public translate: TranslateService, public toasterService: ToasterService, private dataService: DataService) {
    this.dataService.isWorkFlowReload.subscribe(value => {
      if (this.editor && this.editor.graph) {
        setTimeout(() => {
          this.editor.graph.zoomActual();
          this.editor.graph.center(true, true, 0.5, 0.2);
        }, 0);
      }
    });
  }

  static getDummyNodes(): any {
    return [
      {
        '_id': '3',
        '_title': 'Start',
        'mxCell': {
          '_parent': '1',
          '_vertex': '1',
          '_style': 'ellipse;whiteSpace=wrap;html=1;aspect=fixed;dashed=1;shadow=0;opacity=70;',
          'mxGeometry': {
            '_as': 'geometry',
            '_width': '70',
            '_height': '70'
          }
        }
      }, {
        '_id': '5',
        '_title': 'End',
        'mxCell': {
          '_parent': '1',
          '_vertex': '1',
          '_style': 'ellipse;whiteSpace=wrap;html=1;aspect=fixed;dashed=1;shadow=0;opacity=70;',
          'mxGeometry': {
            '_as': 'geometry',
            '_width': '70',
            '_height': '70'
          }
        }
      }
    ];
  }

  /**
   * Function to add Start and End nodes
   *
   * @param json
   * @param mxJson
   */
  static connectWithDummyNodes(json, mxJson) {
    if (json.instructions && json.instructions.length > 0) {
      if (mxJson.Connection) {
        if (!_.isArray(mxJson.Connection)) {
          const _tempConn = _.clone(mxJson.Connection);
          mxJson.Connection = [];
          mxJson.Connection.push(_tempConn);
        }
      } else {
        mxJson.Connection = [];
      }
      const startObj: any = {
        _label: '',
        _type: '',
        _id: '4',
        mxCell: {
          _parent: '1',
          _source: '3',
          _target: json.instructions[0].id,
          _edge: '1',
          mxGeometry: {
            _relative: 1,
            _as: 'geometry'
          }
        }
      };
      const last = json.instructions[json.instructions.length - 1];
      let targetId = last.id;
      if (last.TYPE === 'ForkJoin' || last.TYPE === 'If' || last.TYPE === 'Try' || last.TYPE === 'Retry') {
        let z: any;
        if (last.TYPE === 'ForkJoin') {
          z = mxJson.Join;
        } else if (last.TYPE === 'If') {
          z = mxJson.EndIf;
        } else if (last.TYPE === 'Try') {
          z = mxJson.EndTry;
        } else if (last.TYPE === 'Retry') {
          z = mxJson.RetryEnd;
        }
        if (z && _.isArray(z)) {
          for (let i = 0; i < z.length; i++) {
            if (z[i]._targetId === last.id) {
              targetId = z[i]._id;
              break;
            }
          }
        } else if (z) {
          targetId = z._id;
        }
      }

      const endObj: any = {
        _label: '',
        _type: '',
        _id: 6,
        mxCell: {
          _parent: '1',
          _source: targetId,
          _target: '5',
          _edge: '1',
          mxGeometry: {
            _relative: 1,
            _as: 'geometry'
          }
        }
      };
      mxJson.Connection.push(startObj);
      mxJson.Connection.push(endObj);
    }
  }

  ngOnInit(): void {
    if (!(this.preferences.theme === 'light' || this.preferences.theme === 'lighter')) {
      this.configXml = './assets/mxgraph/config/diagrameditor-dark.xml';
      this.merge = 'symbol;image=./assets/mxgraph/images/symbols/merge-white.png';
      this.abort = 'symbol;image=./assets/mxgraph/images/symbols/abort-white.png';
      this.terminate = 'symbol;image=./assets/mxgraph/images/symbols/terminate-white.png';
      this.await = 'symbol;image=./assets/mxgraph/images/symbols/timer-white.png';
      this.fork = 'symbol;image=./assets/mxgraph/images/symbols/fork-white.png';
    }
    this.coreService.get('workflow.json').subscribe((data) => {
      this.dummyXml = x2js.json2xml_str(data);
      this.createEditor(this.configXml);
      this.isWorkflowStored();
    });
  }

  /**
   * Constructs a new application (returns an mxEditor instance)
   */
  createEditor(config) {
    let editor = null;
    try {
      if (!mxClient.isBrowserSupported()) {
        mxUtils.error('Browser is not supported!', 200, false);
      } else {
        mxObjectCodec.allowEval = true;
        const node = mxUtils.load(config).getDocumentElement();
        editor = new mxEditor(node);
        this.editor = editor;

        this.initEditorConf(editor, null);
        mxObjectCodec.allowEval = false;

        const outln = document.getElementById('outlineContainer');
        outln.style['border'] = '1px solid lightgray';
        outln.style['background'] = '#FFFFFF';
        new mxOutline(this.editor.graph, outln);
        editor.graph.allowAutoPanning = true;
        editor.graph.timerAutoScroll = true;
        editor.addListener(mxEvent.OPEN);
        // Prints the current root in the window title if the
        // current root of the graph changes (drilling).
        editor.addListener(mxEvent.ROOT);
      }
    } catch (e) {
      // Shows an error message if the editor cannot start
      mxUtils.alert('Cannot start application: ' + e.message);
      throw e; // for debugging
    }
  }

  submitWorkFlow() {
    this.coreService.post('workflow/store', {
      jobschedulerId: this.schedulerId,
      workflow: this.workFlowJson
    }).subscribe(res => {
      console.log(res);
    }, (err) => {
      console.log(err);
    });
  }

  clearWorkFlow() {
    this.initEditorConf(this.editor, this.dummyXml);
  }

  toggleRightSideBar() {
    this.isPropertyHide = !this.isPropertyHide;
  }

  isWorkflowStored(): void {
    this.count = 11;
    let _json: any;
    if (sessionStorage.$SOS$WORKFLOW) {
      _json = JSON.parse(sessionStorage.$SOS$WORKFLOW);
      this.workFlowJson = _json;
    }
    if (_json) {
      this.appendIdInJson(_json);
      let mxJson = {
        mxGraphModel: {
          root: {
            mxCell: [
              {_id: '0'},
              {
                _id: '1',
                _parent: '0'
              }
            ],
            Process: []
          }
        }
      };
      mxJson.mxGraphModel.root.Process = WorkFlowTemplateComponent.getDummyNodes();
      this.jsonParser(_json, mxJson.mxGraphModel.root, '', '');
      WorkFlowTemplateComponent.connectWithDummyNodes(_json, mxJson.mxGraphModel.root);
      this.initEditorConf(this.editor, x2js.json2xml_str(mxJson));
    }
  }

  ngOnDestroy() {
    sessionStorage.$SOS$WORKFLOW = JSON.stringify(this.workFlowJson);
    try {
      if (this.editor) {
        mxEvent.removeAllListeners(this.editor.graph);
        this.editor.destroy();
        this.editor = null;
      }
    } catch (e) {
      console.log(e);
    }
  }

  // Function to generating dynamic unique Id
  private appendIdInJson(json) {
    for (let x = 0; x < json.instructions.length; x++) {
      json.instructions[x].id = ++this.count;
      if (json.instructions[x].instructions) {
        this.appendIdInJson(json.instructions[x]);
      }
      if (json.instructions[x].catch) {
        if (json.instructions[x].catch.instructions && json.instructions[x].catch.instructions.length > 0) {
          this.appendIdInJson(json.instructions[x].catch);
        }
      }
      if (json.instructions[x].then) {
        this.appendIdInJson(json.instructions[x].then);
      }
      if (json.instructions[x].else) {
        this.appendIdInJson(json.instructions[x].else);
      }
      if (json.instructions[x].branches) {
        for (let i = 0; i < json.instructions[x].branches.length; i++) {
          this.appendIdInJson(json.instructions[x].branches[i]);
        }
      }
    }
  }

  /**
   * Function to generate flow diagram with the help of JSON
   *
   * @param json
   * @param mxJson
   * @param type
   * @param parentId
   */
  private jsonParser(json, mxJson, type, parentId) {
    const self = this;
    if (json.instructions) {
      for (let x = 0; x < json.instructions.length; x++) {
        let obj: any = {
          mxCell: {
            _parent: parentId ? parentId : '1',
            _vertex: '1',
            mxGeometry: {
              _as: 'geometry'
            }
          }
        };

        if (json.instructions[x].TYPE === 'Job') {
          if (mxJson.Job) {
            if (!_.isArray(mxJson.Job)) {
              let _tempJob = _.clone(mxJson.Job);
              mxJson.Job = [];
              mxJson.Job.push(_tempJob);
            }

          } else {
            mxJson.Job = [];
          }

          obj._id = json.instructions[x].id;
          obj._name = json.instructions[x].jobName;
          obj._title = json.instructions[x].title ? json.instructions[x].title : '';
          obj._agent = json.instructions[x].agentPath ? json.instructions[x].agentPath : '';
          obj.mxCell._style = 'rounded';
          obj.mxCell.mxGeometry._width = '200';
          obj.mxCell.mxGeometry._height = '50';
          mxJson.Job.push(obj);
        } else if (json.instructions[x].TYPE === 'If') {
          if (mxJson.If) {
            if (!_.isArray(mxJson.If)) {
              let _tempIf = _.clone(mxJson.If);
              mxJson.If = [];
              mxJson.If.push(_tempIf);
            }
          } else {
            mxJson.If = [];
          }
          obj._id = json.instructions[x].id;
          obj._predicate = json.instructions[x].predicate;
          obj.mxCell._style = 'rhombus';
          obj.mxCell.mxGeometry._width = '150';
          obj.mxCell.mxGeometry._height = '70';

          if (json.instructions[x].then && json.instructions[x].then.instructions) {
            self.jsonParser(json.instructions[x].then, mxJson, 'endIf', obj._id);
            self.connectInstruction(json.instructions[x], json.instructions[x].then.instructions[0], mxJson, 'then', obj._id);
          }
          if (json.instructions[x].else && json.instructions[x].else.instructions) {
            self.jsonParser(json.instructions[x].else, mxJson, 'endIf', obj._id);
            self.connectInstruction(json.instructions[x], json.instructions[x].else.instructions[0], mxJson, 'else', obj._id);
          }
          self.endIf(json.instructions[x], mxJson, json.instructions, x, json.instructions[x].id, parentId);
          mxJson.If.push(obj);
        } else if (json.instructions[x].TYPE === 'ForkJoin') {
          if (mxJson.Fork) {
            if (!_.isArray(mxJson.Fork)) {
              let _tempFork = _.clone(mxJson.Fork);
              mxJson.Fork = [];
              mxJson.Fork.push(_tempFork);
            }
          } else {
            mxJson.Fork = [];
          }
          obj._id = json.instructions[x].id;
          obj._label = 'Fork';
          obj.mxCell._style = this.fork;
          obj.mxCell.mxGeometry._width = '70';
          obj.mxCell.mxGeometry._height = '70';

          if (json.instructions[x].branches && json.instructions[x].branches.length > 0) {
            for (let i = 0; i < json.instructions[x].branches.length; i++) {
              self.jsonParser(json.instructions[x].branches[i], mxJson, 'branch', obj._id);
              self.connectInstruction(json.instructions[x], json.instructions[x].branches[i], mxJson, 'branch', obj._id);
            }

            self.joinFork(json.instructions[x].branches, mxJson, json.instructions, x, json.instructions[x].id, parentId);
          } else {
            self.joinFork(json.instructions[x], mxJson, json.instructions, x, json.instructions[x].id, parentId);
          }
          mxJson.Fork.push(obj);
        } else if (json.instructions[x].TYPE === 'Retry') {
          if (mxJson.Retry) {
            if (!_.isArray(mxJson.Retry)) {
              const _tempRetry = _.clone(mxJson.Retry);
              mxJson.Retry = [];
              mxJson.Retry.push(_tempRetry);
            }
          } else {
            mxJson.Retry = [];
          }
          obj._id = json.instructions[x].id;
          obj._repeat = json.instructions[x].repeat;
          obj._delay = json.instructions[x].delay;
          obj.mxCell._style = 'rhombus';
          obj.mxCell.mxGeometry._width = '180';
          obj.mxCell.mxGeometry._height = '70';

          if (json.instructions[x].instructions && json.instructions[x].instructions.length > 0) {
            self.jsonParser(json.instructions[x], mxJson, '', obj._id);
            self.connectInstruction(json.instructions[x], json.instructions[x].instructions[0], mxJson, 'retry', obj._id);
          }

          self.endRetry(json.instructions[x], mxJson, json.instructions, x, json.instructions[x].id, parentId);
          mxJson.Retry.push(obj);
        } else if (json.instructions[x].TYPE === 'Try') {
          if (mxJson.Try) {
            if (!_.isArray(mxJson.Try)) {
              const _tempRetry = _.clone(mxJson.Try);
              mxJson.Try = [];
              mxJson.Try.push(_tempRetry);
            }
          } else {
            mxJson.Try = [];
          }
          if (mxJson.Catch) {
            if (!_.isArray(mxJson.Catch)) {
              const _tempRetry = _.clone(mxJson.Catch);
              mxJson.Catch = [];
              mxJson.Catch.push(_tempRetry);
            }
          } else {
            mxJson.Catch = [];
          }
          obj._id = json.instructions[x].id;
          obj._label = 'Try';
          obj.mxCell._style = 'rhombus';
          obj.mxCell.mxGeometry._width = '90';
          obj.mxCell.mxGeometry._height = '70';

          let catchObj: any = {
            mxCell: {
              _parent: obj._id,
              _vertex: '1',
              _style: 'rectangle',
              mxGeometry: {
                _as: 'geometry',
                _width: '90',
                _height: '40'
              }
            },
            _label: 'Catch'
          };
          let _id = 0;

          if (!json.instructions[x].catch) {
            json.instructions[x].catch = {id: (json.instructions[x].id * 7777), instructions: []};
          }

          if (json.instructions[x].catch && json.instructions[x].catch.instructions) {
            catchObj._id = json.instructions[x].catch.id;
            catchObj._targetId = json.instructions[x].id;
            if (json.instructions[x].catch.instructions && json.instructions[x].catch.instructions.length > 0) {
              self.jsonParser(json.instructions[x].catch, mxJson, 'endCatch', obj._id);
              self.connectInstruction(json.instructions[x].catch, json.instructions[x].catch.instructions[0], mxJson, 'catch', obj._id);
            } else {
              catchObj.mxCell._style = 'dashRectangle';
            }
            _id = self.endCatch(json.instructions[x].catch, mxJson, json.instructions, json.instructions[x].catch.id, obj._id);
            mxJson.Catch.push(catchObj);
          }

          if (json.instructions[x].instructions && json.instructions[x].instructions.length > 0) {
            self.jsonParser(json.instructions[x], mxJson, '', obj._id);
            self.connectInstruction(json.instructions[x], json.instructions[x].instructions[0], mxJson, 'try', obj._id);
            const _lastNode = json.instructions[x].instructions[json.instructions[x].instructions.length - 1];
            if (_lastNode.TYPE !== 'ForkJoin' && _lastNode.TYPE !== 'If' && _lastNode.TYPE !== 'Try' && _lastNode.TYPE !== 'try') {
              self.connectInstruction(_lastNode, json.instructions[x].catch, mxJson, 'try', obj._id);
            } else {
              if (_lastNode && (_lastNode.TYPE === 'If')) {
                if (mxJson.EndIf && mxJson.EndIf.length) {
                  for (let j = 0; j < mxJson.EndIf.length; j++) {
                    if (_lastNode.id === mxJson.EndIf[j]._targetId) {
                      this.connectInstruction({id: mxJson.EndIf[j]._id}, json.instructions[x].catch, mxJson, 'try', obj._id);
                      break;
                    }
                  }
                }
              } else if (_lastNode && (_lastNode.TYPE === 'Retry')) {
                if (mxJson.RetryEnd && mxJson.RetryEnd.length) {
                  for (let j = 0; j < mxJson.RetryEnd.length; j++) {
                    if (_lastNode.id === mxJson.RetryEnd[j]._targetId) {
                      this.connectInstruction({id: mxJson.RetryEnd[j]._id}, json.instructions[x].catch, mxJson, 'try', obj._id);
                      break;
                    }
                  }
                }
              } else if (_lastNode && (_lastNode.TYPE === 'Try')) {
                if (mxJson.EndTry && mxJson.EndTry.length) {
                  for (let j = 0; j < mxJson.EndTry.length; j++) {
                    if (_lastNode.id === mxJson.EndTry[j]._targetId) {
                      this.connectInstruction({id: mxJson.EndTry[j]._id}, json.instructions[x].catch, mxJson, 'try', obj._id);
                      break;
                    }
                  }
                }
              } else if (_lastNode && (_lastNode.TYPE === 'ForkJoin')) {
                if (mxJson.Join && mxJson.Join.length) {
                  for (let j = 0; j < mxJson.Join.length; j++) {
                    if (_lastNode.id === mxJson.Join[j]._targetId) {
                      this.connectInstruction({id: mxJson.Join[j]._id}, json.instructions[x].catch, mxJson, 'try', obj._id);
                      break;
                    }
                  }
                }
              }
            }
          } else {
            self.connectInstruction(json.instructions[x], json.instructions[x].catch, mxJson, 'try', obj._id);
          }
          self.endTry(_id, mxJson, json.instructions, x, json.instructions[x].id, parentId);
          mxJson.Try.push(obj);
        } else if (json.instructions[x].TYPE === 'Abort') {
          if (mxJson.Abort) {
            if (!_.isArray(mxJson.Abort)) {
              const _tempExit = _.clone(mxJson.Abort);
              mxJson.Abort = [];
              mxJson.Abort.push(_tempExit);
            }
          } else {
            mxJson.Abort = [];
          }
          obj._id = json.instructions[x].id;
          obj._label = json.instructions[x].TYPE;
          obj._message = json.instructions[x].message;
          obj.mxCell._style = this.abort;
          obj.mxCell.mxGeometry._width = '60';
          obj.mxCell.mxGeometry._height = '60';
          mxJson.Abort.push(obj);
        } else if (json.instructions[x].TYPE === 'Terminate') {
          if (mxJson.Terminate) {
            if (!_.isArray(mxJson.Terminate)) {
              const _tempExit = _.clone(mxJson.Terminate);
              mxJson.Terminate = [];
              mxJson.Terminate.push(_tempExit);
            }
          } else {
            mxJson.Terminate = [];
          }
          obj._id = json.instructions[x].id;
          obj._label = json.instructions[x].TYPE;
          obj._message = json.instructions[x].message;
          obj.mxCell._style = this.terminate;
          obj.mxCell.mxGeometry._width = '60';
          obj.mxCell.mxGeometry._height = '60';
          mxJson.Terminate.push(obj);
        } else if (json.instructions[x].TYPE === 'Await') {
          if (mxJson.Await) {
            if (!_.isArray(mxJson.Await)) {
              const _tempAwait = _.clone(mxJson.Await);
              mxJson.Await = [];
              mxJson.Await.push(_tempAwait);
            }
          } else {
            mxJson.Await = [];
          }
          obj._id = json.instructions[x].id;
          obj._label = 'Await';
          obj.mxCell._style = this.await;
          obj.mxCell.mxGeometry._width = '70';
          obj.mxCell.mxGeometry._height = '70';

          if (json.instructions[x].events && json.instructions[x].events.length > 0) {
            for (let i = 0; i < json.instructions[x].events.length; i++) {
              self.jsonParseForAwait(json.instructions[x].events[i], mxJson, parentId);
              self.connectInstruction(json.instructions[x], json.instructions[x].events[i], mxJson, 'await', parentId);
            }
          }
          mxJson.Await.push(obj);
        } else {
          console.log('Workflow yet to parse : ' + json.instructions[x].TYPE);
        }
        if (json.instructions[x].TYPE !== 'ForkJoin' && json.instructions[x].TYPE !== 'If' && json.instructions[x].TYPE !== 'Try' && json.instructions[x].TYPE !== 'Retry') {
          self.connectEdges(json.instructions, x, mxJson, type, parentId);
        }
      }
    } else {
      console.log('No instruction..');
    }
  }

  private connectEdges(list, index, mxJson, type, parentId) {
    if (mxJson.Connection) {
      if (!_.isArray(mxJson.Connection)) {
        const _tempJob = _.clone(mxJson.Connection);
        mxJson.Connection = [];
        mxJson.Connection.push(_tempJob);
      }
    } else {
      mxJson.Connection = [];
    }

    if (list.length > (index + 1)) {
      let obj: any = {
        _label: type,
        _type: type,
        _id: ++this.count,
        mxCell: {
          _parent: parentId ? parentId : '1',
          _source: list[index].id,
          _target: list[index + 1].id,
          _edge: '1',
          mxGeometry: {
            _relative: 1,
            _as: 'geometry'
          }
        }
      };
      mxJson.Connection.push(obj);
    }
  }

  private connectInstruction(source, target, mxJson, label, parentId) {
    if (mxJson.Connection) {
      if (!_.isArray(mxJson.Connection)) {
        const _tempJob = _.clone(mxJson.Connection);
        mxJson.Connection = [];
        mxJson.Connection.push(_tempJob);
      }
    } else {
      mxJson.Connection = [];
    }
    let obj: any = {
      _label: label === 'then' ? 'true' : label === 'else' ? 'false' : label,
      _type: label,
      _id: ++this.count,
      mxCell: {
        _parent: parentId ? parentId : '1',
        _source: source.id,
        _target: (source.TYPE === 'ForkJoin' && target.instructions) ? target.instructions[0].id : target.id,
        _edge: '1',
        mxGeometry: {
          _relative: 1,
          _as: 'geometry'
        }
      }
    };

    if (label === 'endCatch' && source.instructions.length === 0) {
      obj._label = '';
      obj._type = '';
      obj.mxCell._style = 'edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;exitX=0.5;exitY=1;entryX=0.5;entryY=0;jettySize=auto;orthogonalLoop=1;dashed=1;shadow=0;opacity=50;';
    }
    mxJson.Connection.push(obj);
  }

  private endRetry(branches, mxJson, list, index, targetId, parentId) {
    if (mxJson.RetryEnd) {
      if (!_.isArray(mxJson.RetryEnd)) {
        const _tempRetryEnd = _.clone(mxJson.RetryEnd);
        mxJson.RetryEnd = [];
        mxJson.RetryEnd.push(_tempRetryEnd);
      }

    } else {
      mxJson.RetryEnd = [];
    }
    let id: number;
    id = parseInt(list[list.length - 1].id, 10) + 3000;

    this.nodeMap.set(targetId.toString(), id.toString());

    let joinObj: any = {
      _id: id,
      _label: 'Retry-End',
      _targetId: targetId,
      mxCell: {
        _parent: parentId ? parentId : '1',
        _vertex: '1',
        _style: 'rhombus',
        mxGeometry: {
          _as: 'geometry',
          _width: '150',
          _height: '70'
        }
      }
    };
    mxJson.RetryEnd.push(joinObj);

    if (branches.instructions && branches.instructions.length > 0) {
      const x = branches.instructions[branches.instructions.length - 1];
      if (x && (x.TYPE === 'If')) {
        if (mxJson.EndIf && mxJson.EndIf.length) {
          for (let j = 0; j < mxJson.EndIf.length; j++) {
            if (x.id === mxJson.EndIf[j]._targetId) {
              this.connectInstruction({id: mxJson.EndIf[j]._id}, {id: id}, mxJson, 'retryEnd', parentId);
              break;
            }
          }
        }
      } else if (x && (x.TYPE === 'Retry')) {
        if (mxJson.RetryEnd && mxJson.RetryEnd.length) {
          for (let j = 0; j < mxJson.RetryEnd.length; j++) {
            if (x.id === mxJson.RetryEnd[j]._targetId) {
              this.connectInstruction({id: mxJson.RetryEnd[j]._id}, {id: id}, mxJson, 'retryEnd', parentId);
              break;
            }
          }
        }
      } else if (x && (x.TYPE === 'Try')) {
        if (mxJson.EndTry && mxJson.EndTry.length) {
          for (let j = 0; j < mxJson.EndTry.length; j++) {
            if (x.id === mxJson.EndTry[j]._targetId) {
              this.connectInstruction({id: mxJson.EndTry[j]._id}, {id: id}, mxJson, 'retryEnd', parentId);
              break;
            }
          }
        }
      } else if (x && (x.TYPE === 'ForkJoin')) {
        if (mxJson.Join && mxJson.Join.length) {
          for (let j = 0; j < mxJson.Join.length; j++) {
            if (x.id === mxJson.Join[j]._targetId) {
              this.connectInstruction({id: mxJson.Join[j]._id}, {id: id}, mxJson, 'retryEnd', parentId);
              break;
            }
          }
        }
      } else {
        this.connectInstruction(x, {id: id}, mxJson, 'retryEnd', parentId);
      }
    } else {
      this.connectInstruction(branches, {id: id}, mxJson, '', parentId);
    }

    if (list.length > (index + 1)) {
      this.connectInstruction({id: id}, list[index + 1], mxJson, '', parentId);
    }
  }

  private joinFork(branches, mxJson, list, index, targetId, parentId) {
    if (mxJson.Join) {
      if (!_.isArray(mxJson.Join)) {
        const _tempJoin = _.clone(mxJson.Join);
        mxJson.Join = [];
        mxJson.Join.push(_tempJoin);
      }

    } else {
      mxJson.Join = [];
    }

    let id: number;
    id = parseInt(list[list.length - 1].id, 10) + 1000;
    this.nodeMap.set(targetId.toString(), id.toString());
    let joinObj: any = {
      _id: id,
      _label: 'Join',
      _targetId: targetId,
      mxCell: {
        _parent: parentId ? parentId : '1',
        _vertex: '1',
        _style: this.merge,
        mxGeometry: {
          _as: 'geometry',
          _width: '70',
          _height: '70'
        }
      }
    };
    mxJson.Join.push(joinObj);
    if (_.isArray(branches)) {


      for (let i = 0; i < branches.length; i++) {
        const x = branches[i].instructions[branches[i].instructions.length - 1];
        if (x && (x.TYPE === 'If')) {
          if (mxJson.EndIf && mxJson.EndIf.length) {
            for (let j = 0; j < mxJson.EndIf.length; j++) {
              if (x.id === mxJson.EndIf[j]._targetId) {
                this.connectInstruction({id: mxJson.EndIf[j]._id}, {id: id}, mxJson, 'join', parentId);
                break;
              }
            }
          }
        } else if (x && (x.TYPE === 'ForkJoin')) {
          if (mxJson.Join && mxJson.Join.length) {
            for (let j = 0; j < mxJson.Join.length; j++) {
              if (x.id === mxJson.Join[j]._targetId) {
                this.connectInstruction({id: mxJson.Join[j]._id}, {id: id}, mxJson, 'join', parentId);
                break;
              }
            }
          }
        } else if (x && (x.TYPE === 'Retry')) {
          if (mxJson.RetryEnd && mxJson.RetryEnd.length) {
            for (let j = 0; j < mxJson.RetryEnd.length; j++) {
              if (x.id === mxJson.RetryEnd[j]._targetId) {
                this.connectInstruction({id: mxJson.RetryEnd[j]._id}, {id: id}, mxJson, 'join', parentId);
                break;
              }
            }
          }
        } else if (x && (x.TYPE === 'Try')) {
          if (mxJson.EndTry && mxJson.EndTry.length) {
            for (let j = 0; j < mxJson.EndTry.length; j++) {
              if (x.id === mxJson.EndTry[j]._targetId) {
                this.connectInstruction({id: mxJson.EndTry[j]._id}, {id: id}, mxJson, 'join', parentId);
                break;
              }
            }
          }
        } else {
          this.connectInstruction(x, {id: id}, mxJson, 'join', parentId);
        }
      }
    } else {
      this.connectInstruction(branches, {id: id}, mxJson, '', parentId);
    }

    if (list.length > (index + 1)) {
      this.connectInstruction({id: id}, list[index + 1], mxJson, '', parentId);
    }
  }

  private endIf(branches, mxJson, list, index, targetId, parentId) {
    if (mxJson.EndIf) {
      if (!_.isArray(mxJson.EndIf)) {
        const _tempJoin = _.clone(mxJson.EndIf);
        mxJson.EndIf = [];
        mxJson.EndIf.push(_tempJoin);
      }

    } else {
      mxJson.EndIf = [];
    }
    let id: number;
    id = parseInt(list[list.length - 1].id, 10) + 2000;
    this.nodeMap.set(targetId.toString(), id.toString());
    let endIfObj: any = {
      _id: id,
      _label: 'EndIf',
      _targetId: targetId,
      mxCell: {
        _parent: parentId ? parentId : '1',
        _vertex: '1',
        _style: 'rhombus',
        mxGeometry: {
          _as: 'geometry',
          _width: '150',
          _height: '70'
        }
      }
    };
    mxJson.EndIf.push(endIfObj);

    let flag = true;
    if (branches.then && branches.then.instructions) {
      flag = false;
      const x = branches.then.instructions[branches.then.instructions.length - 1];
      if (x && (x.TYPE === 'If')) {
        if (mxJson.EndIf && mxJson.EndIf.length) {
          for (let j = 0; j < mxJson.EndIf.length; j++) {
            if (x.id === mxJson.EndIf[j]._targetId) {
              this.connectInstruction({id: mxJson.EndIf[j]._id}, {id: id}, mxJson, 'endIf', parentId);
              break;
            }
          }
        }
      } else if (x && (x.TYPE === 'ForkJoin')) {
        if (mxJson.Join && mxJson.Join.length) {
          for (let j = 0; j < mxJson.Join.length; j++) {
            if (x.id === mxJson.Join[j]._targetId) {
              this.connectInstruction({id: mxJson.Join[j]._id}, {id: id}, mxJson, 'endIf', parentId);
              break;
            }
          }
        }
      } else if (x && (x.TYPE === 'Retry')) {
        if (mxJson.RetryEnd && mxJson.RetryEnd.length) {
          for (let j = 0; j < mxJson.RetryEnd.length; j++) {
            if (x.id === mxJson.RetryEnd[j]._targetId) {
              this.connectInstruction({id: mxJson.RetryEnd[j]._id}, {id: id}, mxJson, 'endIf', parentId);
              break;
            }
          }
        }
      } else if (x && (x.TYPE === 'Try')) {
        if (mxJson.EndTry && mxJson.EndTry.length) {
          for (let j = 0; j < mxJson.EndTry.length; j++) {
            if (x.id === mxJson.EndTry[j]._targetId) {
              this.connectInstruction({id: mxJson.EndTry[j]._id}, {id: id}, mxJson, 'endIf', parentId);
              break;
            }
          }
        }
      } else {
        this.connectInstruction(x, {id: id}, mxJson, 'endIf', parentId);
      }
    }
    if (branches.else && branches.else.instructions) {
      flag = false;
      const x = branches.else.instructions[branches.else.instructions.length - 1];
      if (x && (x.TYPE === 'If')) {
        if (mxJson.EndIf && mxJson.EndIf.length) {
          for (let j = 0; j < mxJson.EndIf.length; j++) {
            if (x.id === mxJson.EndIf[j]._targetId) {
              this.connectInstruction({id: mxJson.EndIf[j]._id}, {id: id}, mxJson, 'endIf', parentId);
              break;
            }
          }
        }
      } else if (x && (x.TYPE === 'ForkJoin')) {
        if (mxJson.Join && mxJson.Join.length) {
          for (let j = 0; j < mxJson.Join.length; j++) {
            if (x.id === mxJson.Join[j]._targetId) {
              this.connectInstruction({id: mxJson.Join[j]._id}, {id: id}, mxJson, 'endIf', parentId);
              break;
            }
          }
        }
      } else if (x && (x.TYPE === 'Retry')) {
        if (mxJson.RetryEnd && mxJson.RetryEnd.length) {
          for (let j = 0; j < mxJson.RetryEnd.length; j++) {
            if (x.id === mxJson.RetryEnd[j]._targetId) {
              this.connectInstruction({id: mxJson.RetryEnd[j]._id}, {id: id}, mxJson, 'endIf', parentId);
              break;
            }
          }
        }
      } else if (x && (x.TYPE === 'Try')) {
        if (mxJson.EndTry && mxJson.EndTry.length) {
          for (let j = 0; j < mxJson.EndTry.length; j++) {
            if (x.id === mxJson.EndTry[j]._targetId) {
              this.connectInstruction({id: mxJson.EndTry[j]._id}, {id: id}, mxJson, 'endIf', parentId);
              break;
            }
          }
        }
      } else {
        this.connectInstruction(x, {id: id}, mxJson, 'endIf', parentId);
      }
    }

    if (flag) {
      this.connectInstruction(branches, {id: id}, mxJson, '', parentId);
    }
    if (list.length > (index + 1)) {
      this.connectInstruction({id: id}, list[index + 1], mxJson, '', parentId);
    }
  }

  private endTry(x, mxJson, list, index, targetId, parentId) {
    if (mxJson.EndTry) {
      if (!_.isArray(mxJson.EndTry)) {
        const _tempEndTry = _.clone(mxJson.EndTry);
        mxJson.EndTry = [];
        mxJson.EndTry.push(_tempEndTry);
      }
    } else {
      mxJson.EndTry = [];
    }
    let id: number;
    id = parseInt(list[list.length - 1].id, 10) + 5000;
    this.nodeMap.set(targetId.toString(), id.toString());
    let joinObj: any = {
      _id: id,
      _label: 'Try-End',
      _targetId: targetId,
      mxCell: {
        _parent: parentId ? parentId : '1',
        _vertex: '1',
        _style: 'rhombus',
        mxGeometry: {
          _as: 'geometry',
          _width: '90',
          _height: '70'
        }
      }
    };

    mxJson.EndTry.push(joinObj);
    this.connectInstruction({id: x}, {id: id}, mxJson, 'endTry', parentId);
    if (list.length > (index + 1)) {
      this.connectInstruction({id: id}, list[index + 1], mxJson, '', parentId);
    }
  }

  private endCatch(branches, mxJson, list, targetId, parentId): number {
    if (mxJson.EndCatch) {
      if (!_.isArray(mxJson.EndCatch)) {
        const _tempEndCatch = _.clone(mxJson.EndCatch);
        mxJson.EndCatch = [];
        mxJson.EndCatch.push(_tempEndCatch);
      }

    } else {
      mxJson.EndCatch = [];
    }
    let id: number;
    id = parseInt(list[list.length - 1].id, 10) + 4000;
    this.nodeMap.set(targetId.toString(), id.toString());
    let joinObj: any = {
      _id: id,
      _label: 'Catch-End',
      _targetId: targetId,
      mxCell: {
        _parent: parentId ? parentId : '1',
        _vertex: '1',
        _style: 'rectangle',
        mxGeometry: {
          _as: 'geometry',
          _width: '90',
          _height: '40'
        }
      }
    };

    if (branches.instructions.length === 0) {
      joinObj.mxCell._style = 'dashRectangle';
    }

    mxJson.EndCatch.push(joinObj);

    let x = branches.instructions[branches.instructions.length - 1];
    if (!x) {
      x = branches;
    }

    if (x && (x.TYPE === 'If')) {
      if (mxJson.EndIf && mxJson.EndIf.length) {
        for (let j = 0; j < mxJson.EndIf.length; j++) {
          if (x.id === mxJson.EndIf[j]._targetId) {
            this.connectInstruction({id: mxJson.EndIf[j]._id}, {id: id}, mxJson, 'endCatch', parentId);
            break;
          }
        }
      }
    } else if (x && (x.TYPE === 'Retry')) {
      if (mxJson.RetryEnd && mxJson.RetryEnd.length) {
        for (let j = 0; j < mxJson.RetryEnd.length; j++) {
          if (x.id === mxJson.RetryEnd[j]._targetId) {
            this.connectInstruction({id: mxJson.RetryEnd[j]._id}, {id: id}, mxJson, 'endCatch', parentId);
            break;
          }
        }
      }
    } else if (x && (x.TYPE === 'Try')) {
      if (mxJson.EndTry && mxJson.EndTry.length) {
        for (let j = 0; j < mxJson.EndTry.length; j++) {
          if (x.id === mxJson.EndTry[j]._targetId) {
            this.connectInstruction({id: mxJson.EndTry[j]._id}, {id: id}, mxJson, 'endCatch', parentId);
            break;
          }
        }
      }
    } else if (x && (x.TYPE === 'ForkJoin')) {
      if (mxJson.Join && mxJson.Join.length) {
        for (let j = 0; j < mxJson.Join.length; j++) {
          if (x.id === mxJson.Join[j]._targetId) {
            this.connectInstruction({id: mxJson.Join[j]._id}, {id: id}, mxJson, 'endCatch', parentId);
            break;
          }
        }
      }
    } else if (x) {
      this.connectInstruction(x, {id: id}, mxJson, 'endCatch', parentId);
    }
    return id;
  }

  private jsonParseForAwait(eventObj, mxJson, parentId) {
    //TODO
    if (eventObj.TYPE) {
      if (eventObj.TYPE === 'OfferedOrder') {
        if (mxJson.OfferedOrder) {
          if (!_.isArray(mxJson.OfferedOrder)) {
            const _tempOfferedOrder = _.clone(mxJson.OfferedOrder);
            mxJson.OfferedOrder = [];
            mxJson.OfferedOrder.push(_tempOfferedOrder);
          }
        } else {
          mxJson.OfferedOrder = [];
        }
        let obj: any = {
          _id: eventObj.id,
          _label: 'Offered Order',
          mxCell: {
            _parent: parentId ? parentId : '1',
            _vertex: '1',
            _style: 'ellipse',
            mxGeometry: {
              _as: 'geometry',
              _width: '80',
              _height: '60'
            }
          }
        };
        mxJson.OfferedOrder.push(obj);
      }
    } else if (eventObj.TYPE === 'FileOrder') {
      if (mxJson.FileOrder) {
        if (!_.isArray(mxJson.FileOrder)) {
          const _tempFileOrder = _.clone(mxJson.FileOrder);
          mxJson.FileOrder = [];
          mxJson.FileOrder.push(_tempFileOrder);
        }
      } else {
        mxJson.FileOrder = [];
      }
      let obj: any = {
        _id: eventObj.id,
        _label: 'File Order',
        mxCell: {
          _parent: parentId ? parentId : '1',
          _vertex: '1',
          _style: 'ellipse',
          mxGeometry: {
            _as: 'geometry',
            _width: '80',
            _height: '60'
          }
        }
      };
      mxJson.FileOrder.push(obj);
    }
  }

  private createObject(type, node): any {
    let obj: any = {
      id: node._id,
      TYPE: type,
    };
    if (type === 'Job') {
      obj.jobName = node._name;
      obj.title = node._title;
      obj.agentPath = node._agent;
      let successArr, failureArr, key, value = '';
      if (node._success) {
        successArr = node._success.split(',');
      }
      if (node._failure) {
        failureArr = node._failure.split(',');
      }
      obj.returnCodeMeaning = {failure: failureArr, success: successArr};
      obj.variables = {};
      if (node._value) {
        value = node._value;
      }
      if (node._key) {
        key = node._key;
        obj.variables[key] = value;
      }
    } else if (type === 'If') {
      obj.predicate = node._predicate;
    } else if (type === 'Retry') {
      obj.repeat = node._repeat;
      obj.delay = node._delay;
    } else if (type === 'Abort') {
      obj.message = node._message;
    } else if (type === 'Terminate') {
      obj.message = node._message;
    } else if (type === 'FileOrder') {
      obj.agentPath = node._agent;
      obj.directory = node._directory;
      obj.regex = node._regex;
      obj.checkSteadyState = node._checkSteadyState;
    }
    return obj;
  }

  private xmlToJsonParser() {
    if (this.editor) {
      const _graph = _.clone(this.editor.graph);
      const enc = new mxCodec();
      const node = enc.encode(_graph.getModel());
      const xml = mxUtils.getXml(node);
      let _json: any;
      try {
        _json = x2js.xml_str2json(xml);
      } catch (e) {
        console.log(e);
      }
      if (!_json.mxGraphModel) {
        return;
      }

      let objects = _json.mxGraphModel.root;

      let jsonObj = {
        id: '',
        instructions: []
      };
      let startNode: any = {};
      if (objects.Connection) {
        if (!_.isArray(objects.Connection)) {
          let _tempCon = _.clone(objects.Connection);
          objects.Connection = [];
          objects.Connection.push(_tempCon);
        }
        let connection = objects.Connection;
        let _jobs = _.clone(objects.Job);
        let _ifInstructions = _.clone(objects.If);
        let _forkInstructions = _.clone(objects.Fork);
        let _tryInstructions = _.clone(objects.Try);
        let _retryInstructions = _.clone(objects.Retry);
        let _awaitInstructions = _.clone(objects.Await);
        let _exitInstructions = _.clone(objects.Terminate);
        let _abortInstructions = _.clone(objects.Abort);

        for (let i = 0; i < connection.length; i++) {
          if (connection[i].mxCell._source == '3') {
            continue;
          } else if (connection[i].mxCell._target == '5') {
            continue;
          }
          if (_jobs) {
            if (_.isArray(_jobs)) {
              for (let j = 0; j < _jobs.length; j++) {
                if (connection[i].mxCell._target === _jobs[j]._id) {
                  _jobs.splice(j, 1);
                  break;
                }
              }
            } else {
              if (connection[i].mxCell._target === _jobs._id) {
                _jobs = [];
              }
            }
          }
          if (_forkInstructions) {
            if (_.isArray(_forkInstructions)) {
              for (let j = 0; j < _forkInstructions.length; j++) {
                if (connection[i].mxCell._target === _forkInstructions[j]._id) {
                  _forkInstructions.splice(j, 1);
                  break;
                }
              }
            } else {
              if (connection[i].mxCell._target === _forkInstructions._id) {
                _forkInstructions = [];
              }
            }
          }
          if (_retryInstructions) {
            if (_.isArray(_retryInstructions)) {
              for (let j = 0; j < _retryInstructions.length; j++) {
                if (connection[i].mxCell._target === _retryInstructions[j]._id) {
                  _retryInstructions.splice(j, 1);
                  break;
                }
              }
            } else {
              if (connection[i].mxCell._target === _retryInstructions._id) {
                _retryInstructions = [];
              }
            }
          }
          if (_tryInstructions) {
            if (_.isArray(_tryInstructions)) {
              for (let j = 0; j < _tryInstructions.length; j++) {
                if (connection[i].mxCell._target === _tryInstructions[j]._id) {
                  _tryInstructions.splice(j, 1);
                  break;
                }
              }
            } else {
              if (connection[i].mxCell._target === _tryInstructions._id) {
                _tryInstructions = [];
              }
            }
          }
          if (_awaitInstructions) {
            if (_.isArray(_awaitInstructions)) {
              for (let j = 0; j < _awaitInstructions.length; j++) {
                if (connection[i].mxCell._target === _awaitInstructions[j]._id) {
                  _awaitInstructions.splice(j, 1);
                  break;
                }
              }
            } else {
              if (connection[i].mxCell._target === _awaitInstructions._id) {
                _awaitInstructions = [];
              }
            }
          }
          if (_ifInstructions) {
            if (_.isArray(_ifInstructions)) {
              for (let j = 0; j < _ifInstructions.length; j++) {
                if (connection[i].mxCell._target === _ifInstructions[j]._id) {
                  _ifInstructions.splice(j, 1);
                  break;
                }
              }
            } else {
              if (connection[i].mxCell._target === _ifInstructions._id) {
                _ifInstructions = [];
              }
            }
          }
          if (_exitInstructions) {
            if (_.isArray(_exitInstructions)) {
              for (let j = 0; j < _exitInstructions.length; j++) {
                if (connection[i].mxCell._target === _exitInstructions[j]._id) {
                  _exitInstructions.splice(j, 1);
                  break;
                }
              }
            } else {
              if (connection[i].mxCell._target === _exitInstructions._id) {
                _exitInstructions = [];
              }
            }
          }
          if (_abortInstructions) {
            if (_.isArray(_abortInstructions)) {
              for (let j = 0; j < _abortInstructions.length; j++) {
                if (connection[i].mxCell._target === _abortInstructions[j]._id) {
                  _abortInstructions.splice(j, 1);
                  break;
                }
              }
            } else {
              if (connection[i].mxCell._target === _abortInstructions._id) {
                _abortInstructions = [];
              }
            }
          }
        }

        if (_jobs) {
          if (_.isArray(_jobs) && _jobs.length > 0) {
            startNode = _jobs[0];
          } else {
            startNode = _jobs;
          }
        }

        if (!_.isEmpty(startNode)) {
          jsonObj.instructions.push(this.createObject('Job', startNode));
          this.findNextNode(connection, startNode, objects, jsonObj.instructions, jsonObj);
          startNode = null;
        } else {
          if (_forkInstructions) {
            if (_.isArray(_forkInstructions) && _forkInstructions.length > 0) {
              startNode = _forkInstructions[0];
            } else {
              startNode = _forkInstructions;
            }
          }
        }

        if (!_.isEmpty(startNode)) {
          jsonObj.instructions.push(this.createObject('ForkJoin', startNode));
          this.findNextNode(connection, startNode, objects, jsonObj.instructions, jsonObj);
          startNode = null;
        } else {
          if (_retryInstructions) {
            if (_.isArray(_retryInstructions) && _retryInstructions.length > 0) {
              startNode = _retryInstructions[0];
            } else {
              startNode = _retryInstructions;
            }
          }
        }

        if (!_.isEmpty(startNode)) {
          jsonObj.instructions.push(this.createObject('Retry', startNode));
          this.findNextNode(connection, startNode, objects, jsonObj.instructions, jsonObj);
          startNode = null;
        } else {
          if (_tryInstructions) {
            if (_.isArray(_tryInstructions) && _tryInstructions.length > 0) {
              startNode = _tryInstructions[0];
            } else {
              startNode = _tryInstructions;
            }
          }
        }

        if (!_.isEmpty(startNode)) {
          jsonObj.instructions.push(this.createObject('Try', startNode));
          this.findNextNode(connection, startNode, objects, jsonObj.instructions, jsonObj);
          startNode = null;
        } else {
          if (_awaitInstructions) {
            if (_.isArray(_awaitInstructions) && _awaitInstructions.length > 0) {
              startNode = _awaitInstructions[0];
            } else {
              startNode = _awaitInstructions;
            }
          }
        }

        if (!_.isEmpty(startNode)) {
          jsonObj.instructions.push(this.createObject('Await', startNode));
          this.findNextNode(connection, startNode, objects, jsonObj.instructions, jsonObj);
          startNode = null;
        } else {
          if (_ifInstructions) {
            if (_.isArray(_ifInstructions) && _ifInstructions.length > 0) {
              startNode = _ifInstructions[0];
            } else {
              startNode = _ifInstructions;
            }
          }
        }

        if (!_.isEmpty(startNode)) {
          jsonObj.instructions.push(this.createObject('If', startNode));
          this.findNextNode(connection, startNode, objects, jsonObj.instructions, jsonObj);
          startNode = null;
        } else {
          if (_exitInstructions) {
            if (_.isArray(_exitInstructions) && _exitInstructions.length > 0) {
              startNode = _exitInstructions[0];
            } else {
              startNode = _exitInstructions;
            }
          }
        }

        if (!_.isEmpty(startNode)) {
          jsonObj.instructions.push(this.createObject('Terminate', startNode));
          this.findNextNode(connection, startNode, objects, jsonObj.instructions, jsonObj);
          startNode = null;
        } else {
          if (_abortInstructions) {
            if (_.isArray(_abortInstructions) && _abortInstructions.length > 0) {
              startNode = _abortInstructions[0];
            } else {
              startNode = _abortInstructions;
            }
          }
        }

        if (!_.isEmpty(startNode)) {
          jsonObj.instructions.push(this.createObject('Abort', startNode));
          this.findNextNode(connection, startNode, objects, jsonObj.instructions, jsonObj);
          startNode = null;
        }
      } else {
        const job = objects.Job;
        const ifIns = objects.If;
        const fork = objects.Fork;
        const retry = objects.Retry;
        const tryIns = objects.Try;
        const awaitIns = objects.Await;
        const exit = objects.Terminate;
        const abort = objects.Abort;
        if (job) {
          if (_.isArray(job)) {
            for (let i = 0; i < job.length; i++) {
              jsonObj.instructions.push(this.createObject('Job', job[i]));
            }
          } else {
            jsonObj.instructions.push(this.createObject('Job', job));
          }
        }
        if (ifIns) {
          if (_.isArray(ifIns)) {
            for (let i = 0; i < ifIns.length; i++) {
              jsonObj.instructions.push(this.createObject('If', ifIns[i]));
            }
          } else {
            jsonObj.instructions.push(this.createObject('If', ifIns));
          }
        }
        if (fork) {
          if (_.isArray(fork)) {
            for (let i = 0; i < fork.length; i++) {
              jsonObj.instructions.push(this.createObject('ForkJoin', fork[i]));
            }
          } else {
            jsonObj.instructions.push(this.createObject('ForkJoin', fork));
          }
        }
        if (retry) {
          if (_.isArray(retry)) {
            for (let i = 0; i < retry.length; i++) {
              jsonObj.instructions.push(this.createObject('Retry', retry[i]));
            }
          } else {
            jsonObj.instructions.push(this.createObject('Retry', retry));
          }
        }
        if (tryIns) {
          if (_.isArray(tryIns)) {
            for (let i = 0; i < tryIns.length; i++) {
              jsonObj.instructions.push(this.createObject('Try', tryIns[i]));
            }
          } else {
            jsonObj.instructions.push(this.createObject('Try', tryIns));
          }
        }
        if (awaitIns) {
          if (_.isArray(awaitIns)) {
            for (let i = 0; i < awaitIns.length; i++) {
              jsonObj.instructions.push(this.createObject('Await', awaitIns[i]));
            }
          } else {
            jsonObj.instructions.push(this.createObject('Await', awaitIns));
          }
        }
        if (exit) {
          if (_.isArray(exit)) {
            for (let i = 0; i < exit.length; i++) {
              jsonObj.instructions.push(this.createObject('Terminate', exit[i]));
            }
          } else {
            jsonObj.instructions.push(this.createObject('Terminate', exit));
          }
        }
        if (abort) {
          if (_.isArray(abort)) {
            for (let i = 0; i < abort.length; i++) {
              jsonObj.instructions.push(this.createObject('Abort', abort[i]));
            }
          } else {
            jsonObj.instructions.push(this.createObject('Abort', abort));
          }
        }
      }
      this.workFlowJson = _.clone(jsonObj);
    }
  }

  private findNextNode(connection, node, objects, instructions: Array<any>, jsonObj) {
    if (!node) {
      return;
    }
    const id = node._id || node;
    if (_.isArray(connection)) {
      for (let i = 0; i < connection.length; i++) {
        if (!connection[i].skip && connection[i].mxCell._source && connection[i].mxCell._source === id) {
          const _id = _.clone(connection[i].mxCell._target);
          let instructionArr = instructions;
          if (connection[i]._type === 'then' || connection[i]._type === 'else') {
            for (let j = 0; j < instructions.length; j++) {
              if (instructions[j].TYPE === 'If' && instructions[j].id === id) {
                if (connection[i]._type === 'then') {
                  instructions[j].then = {
                    instructions: []
                  };
                  instructionArr = instructions[j].then.instructions;
                } else {
                  instructions[j].else = {
                    instructions: []
                  };
                  instructionArr = instructions[j].else.instructions;
                }
                break;
              }
            }
          } else if (connection[i]._type === 'branch') {
            for (let j = 0; j < instructions.length; j++) {
              if (instructions[j].TYPE === 'ForkJoin' && instructions[j].id === id) {
                if (!instructions[j].branches) {
                  instructions[j].branches = [];
                }
                instructions[j].branches.push({instructions: []});
                for (let x = 0; x < instructions[j].branches.length; x++) {
                  if (!instructions[j].branches[x].id) {
                    instructions[j].branches[x].id = 'branch ' + (x + 1);
                    instructionArr = instructions[j].branches[x].instructions;
                    break;
                  }
                }
                break;
              }
            }
          } else if (connection[i]._type === 'retry') {
            for (let j = 0; j < instructions.length; j++) {
              if (instructions[j].TYPE === 'Retry' && instructions[j].id === id) {
                if (!instructions[j].instructions) {
                  instructions[j].instructions = [];
                  instructionArr = instructions[j].instructions;
                }
                break;
              }
            }
          } else if (connection[i]._type === 'try') {
            for (let j = 0; j < instructions.length; j++) {
              if (instructions[j].TYPE === 'Try' && instructions[j].id === id) {
                if (!instructions[j].instructions) {
                  instructions[j].instructions = [];
                  instructionArr = instructions[j].instructions;
                }
                break;
              }
            }
          } else if (connection[i]._type === 'catch') {
            console.log('catch', instructions);
          } else if (connection[i]._type === 'await') {
            const _fileOrderInstructions = objects.FileOrder;
            let _node: any = {};
            if (_fileOrderInstructions) {
              if (_.isArray(_fileOrderInstructions)) {
                for (let x = 0; x < _fileOrderInstructions.length; x++) {
                  if (_fileOrderInstructions[x]._id === _id) {
                    _node = _fileOrderInstructions[x];
                    break;
                  }
                }
              } else {
                if (_fileOrderInstructions._id === _id) {
                  _node = _fileOrderInstructions;
                }
              }
            }
            console.log(_node);
            if (_node) {
              for (let j = 0; j < instructions.length; j++) {
                if (instructions[j].TYPE === 'Await' && instructions[j].id === id) {
                  if (!instructions[j].events) {
                    instructions[j].events = [this.createObject('FileOrder', _node)];
                  }
                  break;
                }
              }
            }
          }
          connection[i].skip = true;
          if (connection[i]._type === 'join') {
            const joinInstructions = objects.Join;
            let _node: any = {};
            if (joinInstructions) {
              if (_.isArray(joinInstructions)) {
                for (let x = 0; x < joinInstructions.length; x++) {
                  if (joinInstructions[x]._id === _id) {
                    _node = joinInstructions[x];
                    break;
                  }
                }
              } else {
                if (joinInstructions._id === _id) {
                  _node = joinInstructions;
                }
              }
            }
            if (_node._targetId) {
              let arr = this.recursiveFindParentCell(_node._targetId, jsonObj.instructions);
              if (arr && arr.length > -1) {
                instructionArr = arr;
              }
            }
          } else if (connection[i]._type === 'endIf') {
            const endIfInstructions = objects.EndIf;
            let _node: any = {};
            if (endIfInstructions) {
              if (_.isArray(endIfInstructions)) {
                for (let x = 0; x < endIfInstructions.length; x++) {
                  if (endIfInstructions[x]._id === _id) {
                    _node = endIfInstructions[x];
                    break;
                  }
                }
              } else {
                if (endIfInstructions._id === _id) {
                  _node = endIfInstructions;
                }
              }
            }

            if (_node._targetId) {
              let arr = this.recursiveFindParentCell(_node._targetId, jsonObj.instructions);
              if (arr && arr.length > -1) {
                instructionArr = arr;
              }
            }
          } else if (connection[i]._type === 'retryEnd') {
            const retryEndInstructions = objects.RetryEnd;
            let _node: any = {};
            if (retryEndInstructions) {
              if (_.isArray(retryEndInstructions)) {
                for (let x = 0; x < retryEndInstructions.length; x++) {
                  if (retryEndInstructions[x]._id === _id) {
                    _node = retryEndInstructions[x];
                    break;
                  }
                }
              } else {
                if (retryEndInstructions._id === _id) {
                  _node = retryEndInstructions;
                }
              }
            }
            if (_node._targetId) {
              let arr = this.recursiveFindParentCell(_node._targetId, jsonObj.instructions);
              if (arr && arr.length > -1) {
                instructionArr = arr;
              }
            }
          } else if (connection[i]._type === 'endTry') {
            const endTryInstructions = objects.EndTry;
            let _node: any = {};
            if (endTryInstructions) {
              if (_.isArray(endTryInstructions)) {
                for (let x = 0; x < endTryInstructions.length; x++) {
                  if (endTryInstructions[x]._id === _id) {
                    _node = endTryInstructions[x];
                    break;
                  }
                }
              } else {
                if (endTryInstructions._id === _id) {
                  _node = endTryInstructions;
                }
              }
            }

            if (_node._targetId) {
              let arr = this.recursiveFindParentCell(_node._targetId, jsonObj.instructions);
              if (arr && arr.length > -1) {
                instructionArr = arr;
              }
            }
          } else if (connection[i]._type === 'endCatch') {
            const endCatchInstructions = objects.EndCatch;
            let _node: any = {};
            if (endCatchInstructions) {
              if (_.isArray(endCatchInstructions)) {
                for (let x = 0; x < endCatchInstructions.length; x++) {
                  if (endCatchInstructions[x]._id === _id) {
                    _node = endCatchInstructions[x];
                    break;
                  }
                }
              } else {
                if (endCatchInstructions._id === _id) {
                  _node = endCatchInstructions;
                }
              }
            }

            if (_node._targetId) {
              let arr = this.recursiveFindParentCell(_node._targetId, jsonObj.instructions);
              if (arr && arr.length > -1) {
                instructionArr = arr;
              }
            }
          }
          this.getNextNode(_id, objects, instructionArr, jsonObj);
        }
      }
    } else {
      if (connection.mxCell._source && connection.mxCell._source === id) {
        const _id = _.clone(connection.mxCell._target);
        connection = null;
        this.getNextNode(_id, objects, instructions, jsonObj);
      }
    }
  }

  private recursiveFindParentCell(id, instructionsArr: Array<any>): Array<any> {
    let arr = [];

    function recursive(_id, _instructionsArr: Array<any>) {
      for (let i = 0; i < _instructionsArr.length; i++) {
        if (_instructionsArr[i].id === _id) {
          arr = _instructionsArr;
          break;
        } else {
          if (_instructionsArr[i].TYPE === 'ForkJoin') {
            if (_instructionsArr[i].branches) {
              for (let j = 0; j < _instructionsArr[i].branches.length; j++) {
                recursive(_id, _instructionsArr[i].branches[j].instructions);
              }
            }
          }
          if (_instructionsArr[i].TYPE === 'Await') {
            if (_instructionsArr[i].events) {
              recursive(_id, _instructionsArr[i].events);
            }
          } else if (_instructionsArr[i].TYPE === 'If') {
            if (_instructionsArr[i].then) {
              recursive(_id, _instructionsArr[i].then.instructions);
            }
            if (_instructionsArr[i].else) {
              recursive(_id, _instructionsArr[i].else.instructions);
            }
          } else if (_instructionsArr[i].TYPE === 'Try') {
            if (_instructionsArr[i].catch) {
              if (_instructionsArr[i].catch.id === _id) {
                arr = _instructionsArr[i].catch.instructions;
                break;
              } else {
                recursive(_id, _instructionsArr[i].catch.instructions);
              }
            }
            if (_instructionsArr[i].instructions && _instructionsArr[i].instructions.length > 0) {
              recursive(_id, _instructionsArr[i].instructions);
            }
          }
        }
      }
    }

    recursive(id, instructionsArr);
    return arr;
  }

  private recursiveFindCatchCell(node, instructionsArr: Array<any>): Array<any> {
    let arr = [];

    function recursive(_node, _instructionsArr: Array<any>) {
      for (let i = 0; i < _instructionsArr.length; i++) {
        if (_instructionsArr[i].id === _node._targetId) {
          if (_instructionsArr[i].TYPE === 'Try') {
            if (!_instructionsArr[i].catch) {
              _instructionsArr[i].catch = {instructions: [], id: _node._id};
              arr = _instructionsArr[i].catch.instructions;
            }
          }
          break;
        } else {
          if (_instructionsArr[i].TYPE === 'ForkJoin') {
            if (_instructionsArr[i].branches) {
              for (let j = 0; j < _instructionsArr[i].branches.length; j++) {
                recursive(_node, _instructionsArr[i].branches[j].instructions);
              }
            }
          } else if (_instructionsArr[i].TYPE === 'If') {
            if (_instructionsArr[i].then) {
              recursive(_node, _instructionsArr[i].then.instructions);
            }
            if (_instructionsArr[i].else) {
              recursive(_node, _instructionsArr[i].else.instructions);
            }
          } else if (_instructionsArr[i].TYPE === 'Try') {
            if (_instructionsArr[i].catch) {
              recursive(_node, _instructionsArr[i].catch.instructions);
            }
          }
        }
      }
    }

    recursive(node, instructionsArr);
    return arr;
  }

  private getNextNode(id, objects, instructionsArr: Array<any>, jsonObj) {
    const connection = objects.Connection;
    const jobs = objects.Job;
    const ifInstructions = objects.If;
    const endIfInstructions = objects.EndIf;
    const forkInstructions = objects.Fork;
    const joinInstructions = objects.Join;
    const retryInstructions = objects.Retry;
    const retryEndInstructions = objects.RetryEnd;
    const tryInstructions = objects.Try;
    const catchInstructions = objects.Catch;
    const catchEndInstructions = objects.EndCatch;
    const tryEndInstructions = objects.EndTry;
    const awaitInstructions = objects.Await;
    const exitInstructions = objects.Terminate;
    const abortInstructions = objects.Abort;
    let nextNode: any = {};

    if (jobs) {
      if (_.isArray(jobs)) {
        for (let i = 0; i < jobs.length; i++) {
          if (jobs[i]._id === id) {
            nextNode = jobs[i];
            break;
          }
        }
      } else {
        if (jobs._id === id) {
          nextNode = jobs;
        }
      }
    }

    if (nextNode && !_.isEmpty(nextNode)) {
      instructionsArr.push(this.createObject('Job', nextNode));
      this.findNextNode(connection, nextNode, objects, instructionsArr, jsonObj);
      nextNode = null;
    } else {
      if (forkInstructions) {
        if (_.isArray(forkInstructions)) {
          for (let i = 0; i < forkInstructions.length; i++) {
            if (forkInstructions[i]._id === id) {
              nextNode = forkInstructions[i];
              break;
            }
          }
        } else {
          if (forkInstructions._id === id) {
            nextNode = forkInstructions;
          }
        }
      }
    }

    if (nextNode && !_.isEmpty(nextNode)) {
      instructionsArr.push(this.createObject('ForkJoin', nextNode));
      this.findNextNode(connection, nextNode, objects, instructionsArr, jsonObj);
      nextNode = null;
    } else {
      if (joinInstructions) {
        if (_.isArray(joinInstructions)) {
          for (let i = 0; i < joinInstructions.length; i++) {
            if (joinInstructions[i]._id === id) {
              nextNode = joinInstructions[i];
              break;
            }
          }
        } else {
          if (joinInstructions._id === id) {
            nextNode = joinInstructions;
          }
        }
      }
    }

    if (nextNode && !_.isEmpty(nextNode)) {
      this.findNextNode(connection, nextNode, objects, instructionsArr, jsonObj);
      nextNode = null;
    } else {
      if (retryInstructions) {
        if (_.isArray(retryInstructions)) {
          for (let i = 0; i < retryInstructions.length; i++) {
            if (retryInstructions[i]._id === id) {
              nextNode = retryInstructions[i];
              break;
            }
          }
        } else {
          if (retryInstructions._id === id) {
            nextNode = retryInstructions;
          }
        }
      }
    }

    if (nextNode && !_.isEmpty(nextNode)) {
      instructionsArr.push(this.createObject('Retry', nextNode));
      this.findNextNode(connection, nextNode, objects, instructionsArr, jsonObj);
      nextNode = null;
    } else {
      if (retryEndInstructions) {
        if (_.isArray(retryEndInstructions)) {
          for (let i = 0; i < retryEndInstructions.length; i++) {
            if (retryEndInstructions[i]._id === id) {
              nextNode = retryEndInstructions[i];
              break;
            }
          }
        } else {
          if (retryEndInstructions._id === id) {
            nextNode = retryEndInstructions;
          }
        }
      }
    }

    if (nextNode && !_.isEmpty(nextNode)) {
      this.findNextNode(connection, nextNode, objects, instructionsArr, jsonObj);
      nextNode = null;
    } else {
      if (awaitInstructions) {
        if (_.isArray(awaitInstructions)) {
          for (let i = 0; i < awaitInstructions.length; i++) {
            if (awaitInstructions[i]._id === id) {
              nextNode = awaitInstructions[i];
              break;
            }
          }
        } else {
          if (awaitInstructions._id === id) {
            nextNode = awaitInstructions;
          }
        }
      }
    }

    if (nextNode && !_.isEmpty(nextNode)) {
      instructionsArr.push(this.createObject('Await', nextNode));
      this.findNextNode(connection, nextNode, objects, instructionsArr, jsonObj);
      nextNode = null;
    } else {
      if (tryInstructions) {
        if (_.isArray(tryInstructions)) {
          for (let i = 0; i < tryInstructions.length; i++) {
            if (tryInstructions[i]._id === id) {
              nextNode = tryInstructions[i];
              break;
            }
          }
        } else {
          if (tryInstructions._id === id) {
            nextNode = tryInstructions;
          }
        }
      }
    }

    if (nextNode && !_.isEmpty(nextNode)) {
      instructionsArr.push(this.createObject('Try', nextNode));
      this.findNextNode(connection, nextNode, objects, instructionsArr, jsonObj);
      nextNode = null;
    } else {
      if (tryEndInstructions) {
        if (_.isArray(tryEndInstructions)) {
          for (let i = 0; i < tryEndInstructions.length; i++) {
            if (tryEndInstructions[i]._id === id) {
              nextNode = tryEndInstructions[i];
              break;
            }
          }
        } else {
          if (tryEndInstructions._id === id) {
            nextNode = tryEndInstructions;
          }
        }
      }
    }

    if (nextNode && !_.isEmpty(nextNode)) {
      this.findNextNode(connection, nextNode, objects, instructionsArr, jsonObj);
      nextNode = null;
    } else {
      if (catchInstructions) {
        if (_.isArray(catchInstructions)) {
          for (let i = 0; i < catchInstructions.length; i++) {
            if (catchInstructions[i]._id === id) {
              nextNode = catchInstructions[i];
              break;
            }
          }
        } else {
          if (catchInstructions._id === id) {
            nextNode = catchInstructions;
          }
        }
      }
    }

    if (nextNode && !_.isEmpty(nextNode)) {
      let arr = this.recursiveFindCatchCell(nextNode, jsonObj.instructions);
      this.findNextNode(connection, nextNode, objects, arr, jsonObj);
      nextNode = null;
    } else {
      if (catchEndInstructions) {
        if (_.isArray(catchEndInstructions)) {
          for (let i = 0; i < catchEndInstructions.length; i++) {
            if (catchEndInstructions[i]._id === id) {
              nextNode = catchEndInstructions[i];
              break;
            }
          }
        } else {
          if (catchEndInstructions._id === id) {
            nextNode = catchEndInstructions;
          }
        }
      }
    }

    if (nextNode && !_.isEmpty(nextNode)) {
      this.findNextNode(connection, nextNode, objects, instructionsArr, jsonObj);
      nextNode = null;
    } else {
      if (ifInstructions) {
        if (_.isArray(ifInstructions)) {
          for (let i = 0; i < ifInstructions.length; i++) {
            if (ifInstructions[i]._id === id) {
              nextNode = ifInstructions[i];
              break;
            }
          }
        } else {
          if (ifInstructions._id === id) {
            nextNode = ifInstructions;
          }
        }
      }
    }

    if (nextNode && !_.isEmpty(nextNode)) {
      instructionsArr.push(this.createObject('If', nextNode));
      this.findNextNode(connection, nextNode, objects, instructionsArr, jsonObj);
      nextNode = null;
    } else {
      if (endIfInstructions) {
        if (_.isArray(endIfInstructions)) {
          for (let i = 0; i < endIfInstructions.length; i++) {
            if (endIfInstructions[i]._id === id) {
              nextNode = endIfInstructions[i];
              break;
            }
          }
        } else {
          if (endIfInstructions._id === id) {
            nextNode = endIfInstructions;
          }
        }
      }
    }

    if (nextNode && !_.isEmpty(nextNode)) {
      this.findNextNode(connection, nextNode, objects, instructionsArr, jsonObj);
      nextNode = null;
    } else {
      if (exitInstructions) {
        if (_.isArray(exitInstructions)) {
          for (let i = 0; i < exitInstructions.length; i++) {
            if (exitInstructions[i]._id === id) {
              nextNode = exitInstructions[i];
              break;
            }
          }
        } else {
          if (exitInstructions._id === id) {
            nextNode = exitInstructions;
          }
        }
      }
    }

    if (nextNode && !_.isEmpty(nextNode)) {
      instructionsArr.push(this.createObject('Terminate', nextNode));
      this.findNextNode(connection, nextNode, objects, instructionsArr, jsonObj);
      nextNode = null;
    } else {
      if (abortInstructions) {
        if (_.isArray(abortInstructions)) {
          for (let i = 0; i < abortInstructions.length; i++) {
            if (abortInstructions[i]._id === id) {
              nextNode = abortInstructions[i];
              break;
            }
          }
        } else {
          if (abortInstructions._id === id) {
            nextNode = abortInstructions;
          }
        }
      }
    }

    if (nextNode && !_.isEmpty(nextNode)) {
      instructionsArr.push(this.createObject('Abort', nextNode));
      this.findNextNode(connection, nextNode, objects, instructionsArr, jsonObj);
      nextNode = null;
    } else {
      this.findNextNode(connection, id, objects, instructionsArr, jsonObj);
    }
  }

  private initEditorConf(editor, _xml: any) {
    const self = this;
    const graph = editor.graph;
    let dropTarget;
    let isProgrammaticallyDelete = false;
    let isVertexDrop = false;
    let isUndoable = false;
    let isFullyDelete = false;
    let _targetNode: any;
    let _iterateId = 0;

    const doc = mxUtils.createXmlDocument();

    if (!_xml) {

      // Alt disables guides
      mxGraphHandler.prototype.guidesEnabled = true;
      /**
       * Variable: autoSaveDelay
       *
       * Minimum amount of seconds between two consecutive autosaves. Eg. a
       * value of 1 (s) means the graph is not stored more than once per second.
       * Default is 10.
       */
      mxAutoSaveManager.prototype.autoSaveDelay = 2;
      /**
       * Variable: autoSaveThreshold
       *
       * Minimum amount of ignored changes before an autosave. Eg. a value of 2
       * means after 2 change of the graph model the autosave will trigger if the
       * condition below is true. Default is 5.
       */
      mxAutoSaveManager.prototype.autoSaveThreshold = 1;
      mxGraph.prototype.cellsResizable = false;
      mxGraph.prototype.multigraph = false;
      mxGraph.prototype.allowDanglingEdges = false;
      mxGraph.prototype.cellsLocked = true;
      mxGraph.prototype.foldingEnabled = true;
      mxHierarchicalLayout.prototype.interRankCellSpacing = 54;
      mxHierarchicalLayout.prototype.fineTuning = true;
      mxHierarchicalLayout.prototype.disableEdgeStyle = true;
      mxConstants.DROP_TARGET_COLOR = 'green';
      mxConstants.VERTEX_SELECTION_DASHED = false;
      mxConstants.VERTEX_SELECTION_COLOR = '#007da6';
      mxConstants.VERTEX_SELECTION_STROKEWIDTH = 2;

      if (this.preferences.theme !== 'light' && this.preferences.theme !== 'lighter') {
        let style = graph.getStylesheet().getDefaultEdgeStyle();
        style[mxConstants.STYLE_FONTCOLOR] = '#ffffff';
        mxGraph.prototype.collapsedImage = new mxImage('./assets/mxgraph/images/collapsed-white.png', 9, 9);
        mxGraph.prototype.expandedImage = new mxImage('./assets/mxgraph/images/expanded-white.png', 9, 9);
      } else {
        mxGraph.prototype.collapsedImage = new mxImage('./assets/mxgraph/images/collapsed.png', 9, 9);
        mxGraph.prototype.expandedImage = new mxImage('./assets/mxgraph/images/expanded.png', 9, 9);
      }

      // Enables snapping waypoints to terminals
      mxEdgeHandler.prototype.snapToTerminals = true;

      graph.setConnectable(false);
      graph.setEnabled(false);
      graph.setDisconnectOnMove(false);
      graph.collapseToPreferredSize = false;
      graph.constrainChildren = false;
      graph.extendParentsOnAdd = false;
      graph.extendParents = false;

      // Create select actions in page
      let node = document.getElementById('mainActions');
      let buttons = ['undo', 'redo', 'delete'];

      // editor.urlImage = 'http://localhost:4200/export';
      // Only adds image and SVG export if backend is available
      // NOTE: The old image export in mxEditor is not used, the urlImage is used for the new export.
      if (editor.urlImage != null) {
        // Client-side code for image export
        const exportImage = function (_editor) {
          const scale = graph.view.scale;
          let bounds = graph.getGraphBounds();

          // New image export
          const xmlDoc = mxUtils.createXmlDocument();
          let root = xmlDoc.createElement('output');
          xmlDoc.appendChild(root);

          // Renders graph. Offset will be multiplied with state's scale when painting state.
          const xmlCanvas = new mxXmlCanvas2D(root);
          const imgExport = new mxImageExport();
          xmlCanvas.translate(Math.floor(1 / scale - bounds.x), Math.floor(1 / scale - bounds.y));
          xmlCanvas.scale(scale);

          imgExport.drawState(graph.getView().getState(graph.model.root), xmlCanvas);

          // Puts request data together
          let w = Math.ceil(bounds.width * scale + 2);
          let h = Math.ceil(bounds.height * scale + 2);
          const xml = mxUtils.getXml(root);

          // Requests image if request is valid
          if (w > 0 && h > 0) {
            const name = 'export.xml';
            const format = 'png';
            const bg = '&bg=#FFFFFF';
            const blob = new Blob([xml], {type: 'text/xml'});
            saveAs(blob, name);
            /* new mxXmlRequest(_editor.urlImage, 'filename=' + name + '&format=' + format +
               bg + '&w=' + w + '&h=' + h + '&xml=' + encodeURIComponent(xml)).simulate(document, '_blank');*/
          }
        };

        editor.addAction('exportImage', exportImage);
        buttons.push('exportImage');
      }

      for (let i = 0; i < buttons.length; i++) {
        let button = document.createElement('button');
        let dom = document.createElement('i');
        let icon: any;
        if (buttons[i] === 'undo') {
          icon = 'fa fa-undo';
          button.setAttribute('class', 'btn btn-sm btn-grey');
          button.setAttribute('title', 'Undo');
          button.setAttribute('id', 'undoBtn');
        } else if (buttons[i] === 'redo') {
          icon = 'fa fa-repeat';
          button.setAttribute('class', 'btn btn-sm btn-grey m-r-sm');
          button.setAttribute('title', 'Redo');
          button.setAttribute('id', 'redoBtn');
        } else if (buttons[i] === 'delete') {
          icon = 'fa fa-times';
          button.setAttribute('class', 'btn btn-sm btn-grey m-r-sm');
          button.setAttribute('title', 'Delete');
        }

        dom.setAttribute('class', icon);
        button.appendChild(dom);
        mxUtils.write(button, '');
        const factory = function (name) {
          return function () {
            editor.execute(name);
          };
        };

        mxEvent.addListener(button, 'click', factory(buttons[i]));
        node.appendChild(button);
      }

      // Create zoom actions in page
      let zoomNode = document.getElementById('zoomActions');
      const zoomButtons = ['zoomIn', 'zoomOut', 'actualSize', 'fit'];

      for (let i = 0; i < zoomButtons.length; i++) {
        let button = document.createElement('button');
        let dom = document.createElement('i');
        let icon: any;
        if (zoomButtons[i] === 'zoomIn') {
          icon = 'fa fa-search-plus';
          button.setAttribute('class', 'btn btn-sm btn-grey');
          button.setAttribute('title', 'Zoom In');
        } else if (zoomButtons[i] === 'zoomOut') {
          icon = 'fa fa-search-minus';
          button.setAttribute('class', 'btn btn-sm btn-grey m-r-sm');
          button.setAttribute('title', 'Zoom Out');
        } else if (zoomButtons[i] === 'actualSize') {
          icon = 'fa fa-search';
          button.setAttribute('class', 'btn btn-sm btn-grey');
          button.setAttribute('id', 'actual');
          button.setAttribute('title', 'Actual');
        } else if (zoomButtons[i] === 'fit') {
          icon = 'fa  fa-arrows-alt';
          button.setAttribute('class', 'btn btn-sm btn-grey m-r-sm');
          button.setAttribute('title', 'Fit');
        }
        dom.setAttribute('class', icon);
        button.appendChild(dom);
        mxUtils.write(button, '');
        const factory = function (name) {
          return function () {
            editor.execute(name);
          };
        };

        mxEvent.addListener(button, 'click', factory(zoomButtons[i]));
        zoomNode.appendChild(button);
      }

      graph.isCellEditable = function (cell) {
        return !this.getModel().isEdge(cell);
      };


      /**
       * Overrides method to provide a cell label in the display
       * @param cell
       */
      graph.convertValueToString = function (cell) {
        if (mxUtils.isNode(cell.value)) {
          if (cell.value.nodeName.toLowerCase() === 'process') {
            let title = cell.getAttribute('title', '');
            if (title != null && title.length > 0) {
              return title;
            }
            return '';
          } else if (cell.value.nodeName.toLowerCase() === 'job') {
            let name = cell.getAttribute('name', '');
            let title = cell.getAttribute('title', '');
            if (title != null && title.length > 0) {
              return name + ' - ' + title;
            }
            return name;
          } else if (cell.value.nodeName.toLowerCase() === 'retry') {
            let str = 'Repeat ' + cell.getAttribute('repeat', '') + ' times';
            if (cell.getAttribute('delay', '') && cell.getAttribute('delay', '') !== 0) {
              str = str + '\nwith delay ' + cell.getAttribute('delay', '');
            }
            return str;
          } else if (cell.value.nodeName.toLowerCase() === 'fileorder') {
            let str = 'File Order';
            if (cell.getAttribute('regex', '') && cell.getAttribute('directory', '')) {
              str = cell.getAttribute('regex', '') + ' - ' + cell.getAttribute('directory', '');
            }
            return str;
          } else if (cell.value.nodeName.toLowerCase() === 'if') {
            return cell.getAttribute('predicate', '');
          } else {
            return cell.getAttribute('label', '');
          }
        }
        return '';
      };

      /**
       * To check drop target is valid or not on hover
       *
       */
      mxDragSource.prototype.dragOver = function (_graph, evt) {
        let offset = mxUtils.getOffset(_graph.container);
        let origin = mxUtils.getScrollOrigin(_graph.container);
        let x = mxEvent.getClientX(evt) - offset.x + origin.x - _graph.panDx;
        let y = mxEvent.getClientY(evt) - offset.y + origin.y - _graph.panDy;

        if (_graph.autoScroll && (this.autoscroll == null || this.autoscroll)) {
          _graph.scrollPointToVisible(x, y, _graph.autoExtend);
        }

        // Highlights the drop target under the mouse
        if (this.currentHighlight != null && _graph.isDropEnabled()) {
          this.currentDropTarget = this.getDropTarget(_graph, x, y, evt);
          let state = _graph.getView().getState(this.currentDropTarget);
          this.currentHighlight.highlightColor = 'green';
          if (state && state.cell) {
            let isOrderCell = false;
            if (this.dragElement && this.dragElement.getAttribute('src').match('order')) {
              if (state.cell.value.tagName === 'Await' || state.cell.value.tagName === 'Connection') {
                isOrderCell = true;
              } else {
                this.currentHighlight.highlightColor = '#ff0000';
              }
            }
            if (state.cell.value.tagName === 'Connector' || state.cell.value.tagName === 'FileOrder') {
              return;
            } else if (state.cell.value.tagName === 'Job' || state.cell.value.tagName === 'Abort' || state.cell.value.tagName === 'Terminate') {
              if (state.cell.edges) {
                for (let i = 0; i < state.cell.edges.length; i++) {
                  if (state.cell.edges[i].target.id !== state.cell.id) {
                    this.currentHighlight.highlightColor = '#ff0000';
                  }
                }
              }
            } else if (state.cell.value.tagName === 'Await') {
              if (!isOrderCell) {
                this.currentHighlight.highlightColor = '#ff0000';
              } else {
                 if (state.cell.edges && state.cell.edges.length > 2) {
                    this.currentHighlight.highlightColor = '#ff0000';
                 }
              }
            } else if (state.cell.value.tagName === 'If') {
              if (state.cell.edges && state.cell.edges.length > 2) {
                this.currentHighlight.highlightColor = '#ff0000';
              }
            } else if (state.cell.value.tagName === 'Join' || state.cell.value.tagName === 'EndIf' || state.cell.value.tagName === 'RetryEnd'
              || state.cell.value.tagName === 'EndTry' || state.cell.value.tagName === 'EndCatch') {
              if (state.cell.edges && state.cell.edges.length > 1) {
                for (let i = 0; i < state.cell.edges.length; i++) {
                  if (state.cell.edges[i].target.id !== state.cell.id) {
                    this.currentHighlight.highlightColor = '#ff0000';
                  }
                }
              }
            } else if (state.cell.value.tagName === 'Connection') {
              if (state.cell.source && state.cell.source.value && ((state.cell.source.value.tagName === 'Fork' && state.cell.target.value.tagName === 'Join') ||
                (state.cell.source.value.tagName === 'If' && state.cell.target.value.tagName === 'EndIf') ||
                (state.cell.source.value.tagName === 'Retry' && state.cell.target.value.tagName === 'RetryEnd') ||
                (state.cell.source.value.tagName === 'Try' && state.cell.target.value.tagName === 'Catch') ||
                (state.cell.source.value.tagName === 'Catch' && state.cell.target.value.tagName === 'EndCatch') ||
                (state.cell.source.value.tagName === 'EndCatch' && state.cell.target.value.tagName === 'EndTry') ||
                (state.cell.source.value.tagName === 'Await' && state.cell.target.value.tagName === 'FileOrder' && !isOrderCell))) {
                return;
              }
            } else if (state.cell.value.tagName === 'Retry') {
              if (state.cell.edges && state.cell.edges.length > 1) {
                for (let i = 0; i < state.cell.edges.length; i++) {
                  if (state.cell.edges[i].target.id !== state.cell.id) {
                    if (state.cell.edges[i].target.value.tagName !== 'RetryEnd') {
                      this.currentHighlight.highlightColor = '#ff0000';
                    }
                  }
                }
              }
            } else if (state.cell.value.tagName === 'Try') {
              if (state.cell.edges && state.cell.edges.length > 1) {
                for (let i = 0; i < state.cell.edges.length; i++) {
                  if (state.cell.edges[i].target.id !== state.cell.id) {
                    if (state.cell.edges[i].target.value.tagName !== 'Catch') {
                      this.currentHighlight.highlightColor = '#ff0000';
                    }
                  }
                }
              }
            } else if (state.cell.value.tagName === 'Catch') {
              let flag1 = false;
              if (state.cell.edges && state.cell.edges.length) {
                for (let i = 0; i < state.cell.edges.length; i++) {
                  if (state.cell.edges[i].source.value.tagName === 'Catch' && state.cell.edges[i].target.value.tagName === 'EndCatch') {
                    flag1 = true;
                  }
                }
              }
              if (!flag1) {
                this.currentHighlight.highlightColor = '#ff0000';
              }
            } else if (state.cell.value.tagName === 'Process') {
              if (state.cell.value.attributes && state.cell.value.attributes.length > 0) {
                if (state.cell.value.attributes[0].value === 'Start' || state.cell.value.attributes[0].value === 'End') {
                  return;
                }
              }
              if (state.cell.edges && state.cell.edges.length === 1) {
                if (state.cell.edges[0].value.tagName === 'Connector') {
                  return;
                }
              }
            }
          }
          this.currentHighlight.highlight(state);
        }

        // Updates the location of the preview
        if (this.previewElement != null) {
          if (this.previewElement.parentNode == null) {
            _graph.container.appendChild(this.previewElement);
            this.previewElement.style.zIndex = '3';
            this.previewElement.style.position = 'absolute';
          }

          let gridEnabled = this.isGridEnabled() && _graph.isGridEnabledEvent(evt);
          let hideGuide = true;

          // Grid and guides
          if (this.currentGuide != null && this.currentGuide.isEnabledForEvent(evt)) {
            // LATER: HTML preview appears smaller than SVG preview
            let w = parseInt(this.previewElement.style.width, 10);
            let h = parseInt(this.previewElement.style.height, 10);
            let bounds = new mxRectangle(0, 0, w, h);
            let delta = new mxPoint(x, y);
            delta = this.currentGuide.move(bounds, delta, gridEnabled);
            hideGuide = false;
            x = delta.x;
            y = delta.y;
          } else if (gridEnabled) {
            let scale = _graph.view.scale;
            let tr = _graph.view.translate;
            let off = _graph.gridSize / 2;
            x = (_graph.snap(x / scale - tr.x - off) + tr.x) * scale;
            y = (_graph.snap(y / scale - tr.y - off) + tr.y) * scale;
          }

          if (this.currentGuide != null && hideGuide) {
            this.currentGuide.hide();
          }

          if (this.previewOffset != null) {
            x += this.previewOffset.x;
            y += this.previewOffset.y;
          }

          this.previewElement.style.left = Math.round(x) + 'px';
          this.previewElement.style.top = Math.round(y) + 'px';
          this.previewElement.style.visibility = 'visible';
        }
        this.currentPoint = new mxPoint(x, y);
      };

      /**
       * Check the drop target on drop event
       * @param _graph
       * @param evt
       * @param drpTargt
       * @param x
       * @param y
       */
      mxDragSource.prototype.drop = function (_graph, evt, drpTargt, x, y) {
        dropTarget = null;
        let flag = false;
        if (drpTargt) {
          let isOrderCell = false;
          let title = '';
          self.translate.get('label.invalidTarget').subscribe(translatedValue => {
            title = translatedValue;
          });
          if (this.dragElement && this.dragElement.getAttribute('src').match('order')) {
            if (drpTargt.value.tagName === 'Await' || drpTargt.value.tagName === 'Connection') {
              isOrderCell = true;
            } else  {
              self.toasterService.pop('error', title + '!!', 'Only Await instruction can have orders events');
              return;
            }
          }
          if (drpTargt.value.tagName !== 'Connection') {
             if (drpTargt.value.tagName === 'FileOrder') {
               self.toasterService.pop('error', title + '!!', drpTargt.value.tagName + ' instruction can have only one out going and one incoming Edges');
               return;
            } else if (drpTargt.value.tagName === 'Job' || drpTargt.value.tagName === 'Abort' || drpTargt.value.tagName === 'Terminate') {
              for (let i = 0; i < drpTargt.edges.length; i++) {
                if (drpTargt.edges[i].target.id !== drpTargt.id) {
                  self.toasterService.pop('error', title + '!!', drpTargt.value.tagName + ' instruction can have only one out going and one incoming Edges');
                  return;
                }
              }
            } else if (drpTargt.value.tagName === 'Await') {
              if (!isOrderCell) {
                self.toasterService.pop('error', title + '!!', drpTargt.value.tagName + ' instruction can have only order events');
                return;
              } else {
                 if (drpTargt.edges && drpTargt.edges.length > 2) {
                    self.toasterService.pop('error', title + '!!', drpTargt.value.tagName + ' instruction can have only order events');
                    return;
                 }
              }
            } else if (drpTargt.value.tagName === 'If') {
              if (drpTargt.edges.length > 2) {
                self.toasterService.pop('error', title + '!!', 'Cannot have more than one condition');
                return;
              }
            } else if (drpTargt.value.tagName === 'Join' || drpTargt.value.tagName === 'EndIf' || drpTargt.value.tagName === 'RetryEnd' ||
              drpTargt.value.tagName === 'EndCatch' || drpTargt.value.tagName === 'EndTry') {
              if (drpTargt.edges.length > 1) {
                for (let i = 0; i < drpTargt.edges.length; i++) {
                  if (drpTargt.edges[i].target.id !== drpTargt.id) {
                    self.toasterService.pop('error', title + '!!', 'Cannot have more than one out going Edge');
                    return;
                  }
                }
              }
            } else if (drpTargt.value.tagName === 'Retry') {
              let flag1 = false;
              if (drpTargt.edges && drpTargt.edges.length) {
                for (let i = 0; i < drpTargt.edges.length; i++) {
                  if (drpTargt.edges[i].source.value.tagName === 'Retry' && drpTargt.edges[i].target.value.tagName === 'RetryEnd') {
                    flag1 = true;
                  }
                }
              }
              if (!flag1) {
                self.toasterService.pop('error', title + '!!', 'Cannot have more than one out going Edge');
                return;
              }
            } else if (drpTargt.value.tagName === 'Try') {
              let flag1 = false;
              if (drpTargt.edges && drpTargt.edges.length) {
                for (let i = 0; i < drpTargt.edges.length; i++) {
                  if (drpTargt.edges[i].source.value.tagName === 'Try' && drpTargt.edges[i].target.value.tagName === 'Catch') {
                    flag1 = true;
                  }
                }
              }
              if (!flag1) {
                self.toasterService.pop('error', title + '!!', 'Cannot have more than one out going Edge');
                return;
              }
            } else if (drpTargt.value.tagName === 'Catch') {
              let flag1 = false;
              if (drpTargt.edges && drpTargt.edges.length) {
                for (let i = 0; i < drpTargt.edges.length; i++) {
                  if (drpTargt.edges[i].source.value.tagName === 'Catch' && drpTargt.edges[i].target.value.tagName === 'EndCatch') {
                    flag1 = true;
                  }
                }
              }
              if (!flag1) {
                self.toasterService.pop('error', title + '!!', 'Cannot have more than one out going Edge');
                return;
              }
            } else if (drpTargt.value.tagName === 'Process') {
              if (drpTargt.value.attributes && drpTargt.value.attributes.length > 0) {
                if (drpTargt.value.attributes[0].value === 'Start' || drpTargt.value.attributes[0].value === 'End') {
                  return;
                }
              }
              if (drpTargt.edges && drpTargt.edges.length === 1) {
                if (drpTargt.edges[0].value.tagName === 'Connector') {
                  return;
                }
              }
            }
            dropTarget = drpTargt;
          } else {
            if (drpTargt.value.tagName === 'Connection') {
              if ((drpTargt.source.value.tagName === 'Fork' && drpTargt.target.value.tagName === 'Join') ||
                (drpTargt.source.value.tagName === 'If' && drpTargt.target.value.tagName === 'EndIf') ||
                (drpTargt.source.value.tagName === 'Retry' && drpTargt.target.value.tagName === 'RetryEnd') ||
                (drpTargt.source.value.tagName === 'Try' && drpTargt.target.value.tagName === 'Catch') ||
                (drpTargt.source.value.tagName === 'Catch' && drpTargt.target.value.tagName === 'EndCatch') ||
                (drpTargt.source.value.tagName === 'EndCatch' && drpTargt.target.value.tagName === 'EndTry') ||
                (drpTargt.source.value.tagName === 'Await' && drpTargt.target.value.tagName === 'FileOrder' && !isOrderCell)) {
                return;
              }
            }
            flag = true;
          }
        } else {
          return;
        }
        this.dropHandler(_graph, evt, drpTargt, x, y);
        if (_graph.container.style.visibility !== 'hidden') {
          _graph.container.focus();
        }
        if (flag) {
          executeLayout();
        }
      };

      /**
       * Recursively remove all the target vertex if edges is removed
       */
      graph.addListener(mxEvent.REMOVE_CELLS, function (sender, evt) {
        const cells = evt.getProperty('cells');
        if (!isFullyDelete) {
          isFullyDelete = true;
          recursiveEdgeDelete(cells);
        }
      });

      /**
       * Removes the vertex which are added on click event
       */
      editor.addListener(mxEvent.ADD_VERTEX, function (sender, evt) {
        if (isVertexDrop) {
          isVertexDrop = false;
        } else {
          graph.getModel().remove(evt.getProperty('vertex'));
        }
      });

      /**
       * Function: foldCells to collapse/expand
       *
       *
       * collapsed - Boolean indicating the collapsed state to be assigned.
       * recurse - Optional boolean indicating if the collapsed state of all
       * descendants should be set. Default is true.
       * cells - Array of <mxCells> whose collapsed state should be set. If
       * null is specified then the foldable selection cells are used.
       * checkFoldable - Optional boolean indicating of isCellFoldable should be
       * checked. Default is false.
       * evt - Optional native event that triggered the invocation.
       */
      mxGraph.prototype.foldCells = function (collapse, recurse, cells, checkFoldable, evt) {
        recurse = (recurse != null) ? recurse : true;

        if (cells == null) {
          cells = this.getFoldableCells(this.getSelectionCells(), collapse);
        }
        this.stopEditing(false);
        this.model.beginUpdate();
        try {
          this.cellsFolded(cells, collapse, recurse, checkFoldable);
          this.fireEvent(new mxEventObject(mxEvent.FOLD_CELLS,
            'collapse', collapse, 'recurse', recurse, 'cells', cells));
        } finally {
          this.model.endUpdate();
        }
        const layout = new mxHierarchicalLayout(graph);
        layout.execute(graph.getDefaultParent());
        return cells;
      };

      /**
       *
       * Function: undoableEditHappened
       *
       * Method to be called to add new undoable edits to the <history>.
       */
      mxUndoManager.prototype.undoableEditHappened = function (undoableEdit) {
        if (self.isWorkflowReload) {
          this.indexOfNextAdd = 0;
          this.history = [];
          self.isWorkflowReload = false;
        }

        if (isUndoable) {
          if (this.history.length === 10) {
            this.history.shift();
          }
          const _enc = new mxCodec();
          const _nodeModel = _enc.encode(graph.getModel());
          const xml = mxUtils.getXml(_nodeModel);
          this.history.push(xml);
          this.indexOfNextAdd = this.history.length;
          isUndoable = false;
          if (this.indexOfNextAdd < this.history.length) {
            $('#redoBtn').prop('disabled', false);
          }
          if (this.indexOfNextAdd > 0) {
            $('#undoBtn').prop('disabled', false);
          }
        }
      };

      /**
       * Function: undo
       *
       * Undoes the last change.
       */
      mxUndoManager.prototype.undo = function () {
        if (this.indexOfNextAdd > 0) {
          console.log(this.indexOfNextAdd, this.history);
          const xml = this.history[--this.indexOfNextAdd];

          graph.getModel().beginUpdate();
          try {
            isProgrammaticallyDelete = true;
            // Removes all cells
            graph.removeCells(graph.getChildCells(graph.getDefaultParent(), true, true));
            isProgrammaticallyDelete = false;
            const _doc = mxUtils.parseXml(xml);
            const dec = new mxCodec(_doc);
            const model = dec.decode(_doc.documentElement);
            // Merges the response model with the client model
            graph.getModel().mergeChildren(model.getRoot().getChildAt(0), graph.getDefaultParent(), false);
          } finally {
            // Updates the display
            graph.getModel().endUpdate();
          }

          if (this.indexOfNextAdd < this.history.length) {
            $('#redoBtn').prop('disabled', false);
          }
        } else {
          $('#undoBtn').prop('disabled', true);
        }
      };

      /**
       * Function: redo
       *
       * Redoes the last change.
       */
      mxUndoManager.prototype.redo = function () {
        const n = this.history.length;
        if (this.indexOfNextAdd < n) {
          const xml = this.history[this.indexOfNextAdd++];
          graph.getModel().beginUpdate();
          try {
            const _doc = mxUtils.parseXml(xml);
            const dec = new mxCodec(_doc);
            const model = dec.decode(_doc.documentElement);
            isProgrammaticallyDelete = true;
            // Removes all cells
            graph.removeCells(graph.getChildCells(graph.getDefaultParent(), true, true));
            isProgrammaticallyDelete = false;
            graph.getModel().mergeChildren(model.getRoot().getChildAt(0), graph.getDefaultParent(), false);
          } finally {
            graph.getModel().endUpdate();
          }

          if (this.indexOfNextAdd > 0) {
            $('#undoBtn').prop('disabled', false);
          }
        } else {
          $('#redoBtn').prop('disabled', true);
        }
      };

      /**
       * Function: getEdges
       *
       * Returns the connected edges for the given cell.
       *
       * Parameters:
       *
       * cell - <mxCell> whose edges should be returned.
       */
      mxHierarchicalLayout.prototype.getEdges = function (cell) {
        let cachedEdges = this.edgesCache.get(cell);

        if (cachedEdges != null) {
          return cachedEdges;
        }
        let model = this.graph.model;
        let edges = [];
        let isCollapsed = this.graph.isCellCollapsed(cell);

        let childCount = model.getChildCount(cell);
        for (let i = 0; i < childCount; i++) {
          let child = model.getChildAt(cell, i);
          if (this.isPort(child)) {
            edges = edges.concat(model.getEdges(child, true, true));
          } else if (isCollapsed || !this.graph.isCellVisible(child)) {
            edges = edges.concat(model.getEdges(child, true, true));
          }
        }
        edges = edges.concat(model.getEdges(cell, true, true));
        let result = [];

        for (let i = 0; i < edges.length; i++) {
          let source = this.getVisibleTerminal(edges[i], true);
          let target = this.getVisibleTerminal(edges[i], false);
          if ((source === target) ||
            ((source !== target) &&
              ((target === cell && (this.parent == null || this.isAncestor(this.parent, source, this.traverseAncestors))) ||
                (source === cell && (this.parent == null || this.isAncestor(this.parent, target, this.traverseAncestors)))))) {
            result.push(edges[i]);
          }
        }
        this.edgesCache.put(cell, result);
        return result;
      };

      /**
       * Event to check if connector is valid or not on drop of new instruction
       * @param cell
       * @param cells
       * @param evt
       */
      graph.isValidDropTarget = function (cell, cells, evt) {
        isVertexDrop = true;
        if (cell) {
          if (cells && cells.length > 0) {
            if (cells[0].value.tagName === 'Fork' || cells[0].value.tagName === 'If' ||
              cells[0].value.tagName === 'Retry' || cells[0].value.tagName === 'Try' || cells[0].value.tagName === 'Await') {
              cells[0].collapsed = true;
            }
          }
          if (cell.value && cell.value.tagName === 'Connection') {
            graph.clearSelection();
            if (cells && cells.length > 0) {
              if (cell.source) {
                if (cell.source.getParent().id !== '1') {
                  cell.setParent(cell.source.getParent());
                }
              }
              if (cells[0].value.tagName === 'Fork' || cells[0].value.tagName === 'If' || cells[0].value.tagName === 'Retry' || cells[0].value.tagName === 'Try') {
                const parent = cell.getParent() || graph.getDefaultParent();
                let v1, label = '', type = '', v2, v3;
                const attr = cell.value.attributes;
                if (attr) {
                  for (let i = 0; i < attr.length; i++) {
                    if (attr[i].value && attr[i].name) {
                      label = attr[i].value;
                      type = attr[i].value === 'true' ? 'then' : attr[i].value === 'false' ? 'else' : attr[i].value;
                      break;
                    }
                  }
                }
                if (cells[0].value.tagName === 'Fork') {
                  v1 = graph.insertVertex(parent, null, getCellNode('Join', 'Join', null), 0, 0, 70, 70, self.merge);
                } else if (cells[0].value.tagName === 'If') {
                  v1 = graph.insertVertex(parent, null, getCellNode('EndIf', 'If-End', null), 0, 0, 150, 70, 'rhombus');
                } else if (cells[0].value.tagName === 'Retry') {
                  v1 = graph.insertVertex(parent, null, getCellNode('RetryEnd', 'Retry-End', null), 0, 0, 150, 70, 'rhombus');
                } else {
                  v1 = graph.insertVertex(parent, null, getCellNode('EndTry', 'Try-End', null), 0, 0, 90, 70, 'rhombus');
                  v2 = graph.insertVertex(cells[0], null, getCellNode('Catch', 'Catch', null), 0, 0, 90, 40, 'dashRectangle');
                  v3 = graph.insertVertex(cells[0], null, getCellNode('EndCatch', 'Catch-End', null), 0, 0, 90, 40, 'dashRectangle');
                  graph.insertEdge(parent, null, getConnectionNode('try', 'try'), cells[0], v2);
                  graph.insertEdge(cells[0], null, getConnectionNode('', ''), v2, v3, 'edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;exitX=0.5;exitY=1;entryX=0.5;entryY=0;jettySize=auto;orthogonalLoop=1;dashed=1;shadow=0;opacity=50;');
                  graph.insertEdge(parent, null, getConnectionNode('endTry', 'endTry'), v3, v1);
                }
                graph.insertEdge(parent, null, getConnectionNode(label, type), cell.source, cells[0]);
                if (cells[0].value.tagName !== 'Try') {
                  graph.insertEdge(parent, null, getConnectionNode('', ''), cells[0], v1);
                }
                graph.insertEdge(parent, null, getConnectionNode('', ''), v1, cell.target);
                isProgrammaticallyDelete = true;
                for (let x = 0; x < cell.source.edges.length; x++) {
                  if (cell.source.edges[x].id === cell.id) {
                    if (cell.target && ((cell.source.value.tagName === 'Job' && cell.target.value.tagName === 'Job') ||
                      (cell.source.value.tagName === 'Abort' && cell.target.value.tagName === 'Abort') ||
                      (cell.source.value.tagName === 'Terminate' && cell.target.value.tagName === 'Terminate'))) {
                      graph.getModel().remove(cell.source.edges[x]);
                    } else {
                      cell.source.removeEdge(cell.source.edges[x], true);
                    }
                    break;
                  }
                }
                isProgrammaticallyDelete = false;

                setTimeout(() => {
                  graph.getModel().beginUpdate();
                  try {
                    const targetId = new mxCellAttributeChange(
                      v1, 'targetId',
                      cells[0].id);
                    graph.getModel().execute(targetId);
                    if (v2 && v3) {
                      const targetId2 = new mxCellAttributeChange(
                        v2, 'targetId', cells[0].id);
                      graph.getModel().execute(targetId2);
                      const targetId3 = new mxCellAttributeChange(
                        v3, 'targetId', v2.id);
                      graph.getModel().execute(targetId3);
                    }


                  } finally {
                    graph.getModel().endUpdate();
                  }
                  checkConnectionLabel(cells[0], cell, false);
                }, 0);
                return false;
              }
            }
            if ((cell.source.value.tagName === 'Fork' && cell.target.value.tagName === 'Join') ||
              (cell.source.value.tagName === 'If' && cell.target.value.tagName === 'EndIf') ||
              (cell.source.value.tagName === 'Retry' && cell.target.value.tagName === 'RetryEnd') ||
              (cell.source.value.tagName === 'Try' && cell.target.value.tagName === 'EndTry')) {
              isProgrammaticallyDelete = true;
              graph.removeCells(cells);
              isProgrammaticallyDelete = false;
              evt.preventDefault();
              evt.stopPropagation();
              return false;
            }
            graph.setSelectionCells(cells);
            setTimeout(() => {
              checkConnectionLabel(cells[0], cell, true);
            }, 0);
          } else {
            if (cell.value && cell.value.tagName === 'Connector') {
              isProgrammaticallyDelete = true;
              graph.removeCells(cells);
              isProgrammaticallyDelete = false;
              evt.preventDefault();
              evt.stopPropagation();
              return false;
            }
          }
        }
        if (this.isCellCollapsed(cell)) {
          return true;
        }
        return mxGraph.prototype.isValidDropTarget.apply(this, arguments);
      };

      /**
       * Implements a properties panel that uses
       * mxCellAttributeChange to change properties
       */
      graph.getSelectionModel().addListener(mxEvent.CHANGE, function () {
        let cell = graph.getSelectionCell();
        if (cell && (cell.value.tagName === 'EndIf' || cell.value.tagName === 'Join' || cell.value.tagName === 'RetryEnd'
          || cell.value.tagName === 'EndTry' || cell.value.tagName === 'EndCatch' || cell.value.tagName === 'Connection' || cell.value.tagName === 'Process')) {
          graph.clearSelection();
          return;
        }

        let label = '', type = '';
        if (cell && dropTarget) {
          if (dropTarget.value.tagName === 'If') {
            let flag = false;
            label = 'true';
            type = 'then';
            for (let i = 0; i < dropTarget.edges.length; i++) {
              if (dropTarget.edges[i].target.id !== dropTarget.id && dropTarget.edges[i].target.value.tagName !== 'EndIf') {
                label = 'false';
                type = 'else';
              } else {
                if (dropTarget.edges[i].target && dropTarget.edges[i].target.edges) {
                  for (let j = 0; j < dropTarget.edges[i].target.edges.length; j++) {
                    if (dropTarget.edges[i].target.edges[j].edge && dropTarget.edges[i].target.edges[j].value.attributes
                      && dropTarget.edges[i].target.edges[j].value.attributes.length > 0 && (dropTarget.edges[i].target.edges[j].value.attributes[0]
                        && dropTarget.edges[i].target.edges[j].value.attributes[0].value == 'false')) {
                      flag = true;
                    }
                  }
                }
              }
            }
            if (flag) {
              label = 'true';
              type = 'then';
            }
          } else if (dropTarget.value.tagName === 'Retry') {
            label = 'retry';
            type = 'retry';
          } else if (dropTarget.value.tagName === 'Try') {
            label = 'try';
            type = 'try';
          } else if (dropTarget.value.tagName === 'Catch') {
            label = 'catch';
            type = 'catch';
          } else if (dropTarget.value.tagName === 'Fork') {
            label = 'branch';
            type = 'branch';
          } else if (dropTarget.value.tagName === 'Await') {
            label = 'await';
            type = 'await';
          }

          let parent = cell.getParent() || graph.getDefaultParent();
          if (cell.value.tagName === 'Fork' || cell.value.tagName === 'If' || cell.value.tagName === 'Retry' || cell.value.tagName === 'Try') {
            let v1, v2, v3, _label;
            if (cell.value.tagName === 'Fork') {
              v1 = graph.insertVertex(parent, null, getCellNode('Join', 'Join', cell.id), 0, 0, 70, 70, self.merge);
              graph.insertEdge(parent, null, getConnectionNode('', ''), cell, v1);
              if (dropTarget.value.tagName === 'If' || dropTarget.value.tagName === 'Retry' || dropTarget.value.tagName === 'Try' || dropTarget.value.tagName === 'Catch'
                || dropTarget.value.tagName === 'Fork') {
                _label = dropTarget.value.tagName === 'Retry' ? 'retryEnd' : dropTarget.value.tagName === 'If' ? 'endIf' : dropTarget.value.tagName === 'Catch' ? 'endCatch' : dropTarget.value.tagName === 'Fork' ? 'join' : 'try';
              }
            } else if (cell.value.tagName === 'If') {
              v1 = graph.insertVertex(parent, null, getCellNode('EndIf', 'If-End', cell.id), 0, 0, 150, 70, 'rhombus');
              graph.insertEdge(parent, null, getConnectionNode('', ''), cell, v1);
              if (dropTarget.value.tagName === 'Fork' || dropTarget.value.tagName === 'Retry' || dropTarget.value.tagName === 'Try' || dropTarget.value.tagName === 'Catch' || dropTarget.value.tagName === 'If') {
                _label = dropTarget.value.tagName === 'Fork' ? 'join' : dropTarget.value.tagName === 'Retry' ? 'retryEnd' : dropTarget.value.tagName === 'Catch' ? 'endCatch' : dropTarget.value.tagName === 'endIf' ? 'join' : 'try';
              }
            } else if (cell.value.tagName === 'Retry') {
              v1 = graph.insertVertex(parent, null, getCellNode('RetryEnd', 'Retry-End', cell.id), 0, 0, 150, 70, 'rhombus');
              graph.insertEdge(parent, null, getConnectionNode('', ''), cell, v1);
              if (dropTarget.value.tagName === 'Fork' || dropTarget.value.tagName === 'If' || dropTarget.value.tagName === 'Try' || dropTarget.value.tagName === 'Catch' || dropTarget.value.tagName === 'Retry') {
                _label = dropTarget.value.tagName === 'Fork' ? 'join' : dropTarget.value.tagName === 'If' ? 'endIf' : dropTarget.value.tagName === 'Catch' ? 'endCatch' : dropTarget.value.tagName === 'Retry' ? 'retryEnd' : 'try';
              }
            } else if (cell.value.tagName === 'Try') {
              v2 = graph.insertVertex(cell, null, getCellNode('Catch', 'Catch', cell.id), 0, 0, 90, 40, 'dashRectangle');
              v3 = graph.insertVertex(cell, null, getCellNode('EndCatch', 'Catch-End', null), 0, 0, 90, 40, 'dashRectangle');
              v1 = graph.insertVertex(parent, null, getCellNode('EndTry', 'Try-End', cell.id), 0, 0, 90, 70, 'rhombus');

              graph.insertEdge(parent, null, getConnectionNode('try', 'try'), cell, v2);
              graph.insertEdge(cell, null, getConnectionNode('', ''), v2, v3, 'edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;exitX=0.5;exitY=1;entryX=0.5;entryY=0;jettySize=auto;orthogonalLoop=1;dashed=1;shadow=0;opacity=50;');
              graph.insertEdge(parent, null, getConnectionNode('', ''), cell, v1);
              graph.insertEdge(parent, null, getConnectionNode('endTry', 'endTry'), v3, v1);
              if (dropTarget.value.tagName === 'Fork' || dropTarget.value.tagName === 'If' || dropTarget.value.tagName === 'Retry' || dropTarget.value.tagName === 'Catch' || dropTarget.value.tagName === 'Try') {
                _label = dropTarget.value.tagName === 'Fork' ? 'join' : dropTarget.value.tagName === 'If' ? 'endIf' : dropTarget.value.tagName === 'Catch' ? 'endCatch' : dropTarget.value.tagName === 'Try' ? 'try' : 'retryEnd';
              }
            }

            if (v1) {
              setTimeout(() => {
                if (v2 && v3) {
                  graph.getModel().beginUpdate();
                  try {
                    const targetId = new mxCellAttributeChange(
                      v3, 'targetId', v2.id);
                    graph.getModel().execute(targetId);
                  } finally {
                    graph.getModel().endUpdate();
                  }
                }
                if (_label) {
                  for (let i = 0; i < v1.edges.length; i++) {
                    if (v1.edges[i].target.id !== v1.id) {
                      changeLabelOfConnection(v1.edges[i], _label);
                      break;
                    }
                  }
                }
              }, 0);
            }
          }

          if (dropTarget.value.tagName === 'Process') {
            parent = graph.getDefaultParent();
            let flag = false;
            for (let i = 0; i < dropTarget.edges.length; i++) {
              if (dropTarget.edges[i].source.id !== dropTarget.id) {
                if (cell.value.tagName === 'Fork' || cell.value.tagName === 'If' || cell.value.tagName === 'Retry' || cell.value.tagName === 'Try') {
                  for (let j = 0; j < cell.edges.length; j++) {
                    if (cell.edges[j].target.id !== cell.id) {
                      if (cell.edges[j].target.value.tagName === 'Join' || cell.edges[j].target.value.tagName === 'EndIf'
                        || cell.edges[j].target.value.tagName === 'RetryEnd' || cell.edges[j].target.value.tagName === 'EndTry') {
                        if (flag) {
                          graph.insertEdge(parent, null, getConnectionNode(label, type), cell.edges[j].target, dropTarget.edges[i].target);
                        } else {
                          graph.insertEdge(parent, null, getConnectionNode(label, type), dropTarget.edges[i].source, cell.edges[j].source);
                        }
                        flag = true;
                        break;
                      }
                    }
                  }
                } else {
                  graph.insertEdge(parent, null, getConnectionNode(label, type), dropTarget.edges[i].source, cell);
                }
              } else {
                if (cell.value.tagName === 'Fork' || cell.value.tagName === 'If' || cell.value.tagName === 'Retry' || cell.value.tagName === 'Try') {
                  for (let j = 0; j < cell.edges.length; j++) {
                    if (cell.edges[j].target.id !== cell.id) {
                      if (cell.edges[j].target.value.tagName === 'Join' || cell.edges[j].target.value.tagName === 'EndIf'
                        || cell.edges[j].target.value.tagName === 'RetryEnd' || cell.edges[j].target.value.tagName === 'EndTry') {
                        graph.insertEdge(parent, null, getConnectionNode(label, type), cell.edges[j].target, dropTarget.edges[i].target);
                        break;
                      }
                    }
                  }
                } else {
                  graph.insertEdge(parent, null, getConnectionNode(label, type), cell, dropTarget.edges[i].target);
                }
              }
            }

            isProgrammaticallyDelete = true;
            graph.getModel().remove(dropTarget);
            isProgrammaticallyDelete = false;
          } else {
            let checkLabel = '';
            if (dropTarget.value.tagName === 'Fork') {
              label = 'branch';
              type = 'branch';
              checkLabel = 'Join';
            } else if (dropTarget.value.tagName === 'If') {
              checkLabel = 'EndIf';
            } else if (dropTarget.value.tagName === 'Retry') {
              checkLabel = 'RetryEnd';
            } else if (dropTarget.value.tagName === 'Try') {
              label = 'try';
              type = 'try';
              checkLabel = 'EndTry';
            } else if (dropTarget.value.tagName === 'Catch') {
              checkLabel = 'EndCatch';
              graph.getModel().setStyle(dropTarget, 'rectangle');
            } else if (dropTarget.value.tagName === 'Await') {
              label = 'await';
              type = 'await';
            }
            if (cell.value.tagName === 'If' || cell.value.tagName === 'Fork' || cell.value.tagName === 'Retry' || cell.value.tagName === 'Try') {
              let target1, target2;
              if (!self.nodeMap.has(dropTarget.id)) {
                for (let i = 0; i < dropTarget.edges.length; i++) {
                  if (dropTarget.edges[i].target.id !== dropTarget.id) {
                    if (dropTarget.edges[i].target.value.tagName === checkLabel || dropTarget.edges[i].target.value.tagName === 'Catch') {
                      self.nodeMap.set(dropTarget.id, dropTarget.edges[i].target.id);
                      target1 = dropTarget.edges[i];
                    }
                    break;
                  }
                }
              }

              if (!self.nodeMap.has(cell.id)) {
                for (let i = 0; i < cell.edges.length; i++) {
                  if (cell.edges[i].target.id !== cell.id) {
                    if (cell.edges[i].target.value.tagName === 'Join' || cell.edges[i].target.value.tagName === 'EndIf'
                      || cell.edges[i].target.value.tagName === 'RetryEnd' || cell.edges[i].target.value.tagName === 'EndTry') {
                      self.nodeMap.set(cell.id, cell.edges[i].target.id);
                      target2 = cell.edges[i].target;
                      break;
                    }
                  }
                }
              }

              if (target1 && target2) {
                graph.insertEdge(parent, null, getConnectionNode(label, type), target2, target1.target);
                isProgrammaticallyDelete = true;
                graph.getModel().remove(target1);
                isProgrammaticallyDelete = false;
              } else if (self.nodeMap.has(dropTarget.id)) {
                const target = graph.getModel().getCell(self.nodeMap.get(dropTarget.id));
                graph.insertEdge(parent, null, getConnectionNode(label, type), target2, target);
              }
            } else {
              let flag = false;
              if (dropTarget.edges && dropTarget.edges.length) {
                for (let i = 0; i < dropTarget.edges.length; i++) {
                  if (dropTarget.edges[i].target.id !== dropTarget.id) {
                    if (dropTarget.edges[i].target.value.tagName === checkLabel || dropTarget.edges[i].target.value.tagName === 'Catch') {
                      flag = true;
                      if (!self.nodeMap.has(dropTarget.id)) {
                        self.nodeMap.set(dropTarget.id, dropTarget.edges[i].target.id);
                      }
                      if (dropTarget.edges[i].target.value.tagName === 'EndCatch') {
                        graph.getModel().setStyle(dropTarget.edges[i].target, 'rectangle');
                      }

                      const attr = dropTarget.edges[i].value.attributes;
                      if (attr) {
                        for (let x = 0; x < attr.length; x++) {
                          if (attr[x].value && attr[x].name) {
                            label = attr[x].value;
                            type = attr[i].value === 'true' ? 'then' : attr[i].value === 'false' ? 'else' : attr[i].value;
                            break;
                          }
                        }
                      }

                      if (cell && dropTarget.edges[i].target) {
                        graph.insertEdge(parent, null, getConnectionNode(label, type), cell, dropTarget.edges[i].target);
                      }
                      isProgrammaticallyDelete = true;
                      graph.getModel().remove(dropTarget.edges[i]);
                      isProgrammaticallyDelete = false;
                    }
                    break;
                  }
                }
              }
              if (!flag && self.nodeMap.has(dropTarget.id)) {
                const target = graph.getModel().getCell(self.nodeMap.get(dropTarget.id));
                if (cell && target) {
                  graph.insertEdge(parent, null, getConnectionNode(label, type), cell, target);
                }
              }
            }

            if (cell.edges) {
              for (let i = 0; i < cell.edges.length; i++) {
                if (cell.edges[i].target.value.tagName === checkLabel) {
                  const _label = checkLabel === 'Join' ? 'join' : checkLabel === 'EndIf' ? 'endIf' : checkLabel === 'RetryEnd' ? 'retryEnd' : checkLabel === 'EndCatch' ? 'endCatch' : 'endTry';
                  if (cell.value.tagName !== 'Fork' && cell.value.tagName !== 'If' && cell.value.tagName !== 'Try' && cell.value.tagName !== 'Retry') {
                    cell.edges[i].value.attributes[0].nodeValue = _label;
                    cell.edges[i].value.attributes[1].nodeValue = _label;
                  }
                }
              }
            }

            if (cell && dropTarget) {
              graph.insertEdge(parent, null, getConnectionNode(label, type), dropTarget, cell);
            }
          }
          if (cell.value.tagName === 'Try') {
            for (let j = 0; j < cell.edges.length; j++) {
              if (cell.edges[j].target.id !== cell.id) {
                if (cell.edges[j].source.value.tagName === 'Try' && cell.edges[j].target.value.tagName === 'EndTry') {
                  isProgrammaticallyDelete = true;
                  graph.getModel().remove(cell.edges[j]);
                  isProgrammaticallyDelete = false;
                  break;
                }
              }
            }
          }
          dropTarget = null;
          executeLayout();
        }
        selectionChanged(graph);
      });

      initGraph(this.dummyXml);
      const mgr = new mxAutoSaveManager(graph);

      selectionChanged(graph);
      makeCenter();
      executeLayout();

      mgr.save = function () {
        if (!self.isWorkflowReload) {
          setTimeout(() => {
            self.xmlToJsonParser();
            if (self.workFlowJson && self.workFlowJson.instructions && self.workFlowJson.instructions.length > 0) {
              graph.setEnabled(true);
            } else {
              reloadDummyXml(self.dummyXml);
            }
          }, 0);
        }
      };
    } else {
      self.isWorkflowReload = true;
      reloadDummyXml(_xml);
    }

    /**
     * Reload dummy xml
     */
    function reloadDummyXml(xml) {
      graph.getModel().beginUpdate();
      try {
        // Removes all cells
        graph.removeCells(graph.getChildCells(graph.getDefaultParent(), true, true));
        const _doc = mxUtils.parseXml(xml);
        const dec = new mxCodec(_doc);
        const model = dec.decode(_doc.documentElement);
        // Merges the response model with the client model
        graph.getModel().mergeChildren(model.getRoot().getChildAt(0), graph.getDefaultParent(), false);
      } finally {
        // Updates the display
        graph.getModel().endUpdate();
        const layout = new mxHierarchicalLayout(graph);
        layout.execute(graph.getDefaultParent());
      }
    }

    function initGraph(xml) {
      const _doc = mxUtils.parseXml(xml);
      const codec = new mxCodec(_doc);
      codec.decode(_doc.documentElement, graph.getModel());
      const vertices = graph.getChildVertices(graph.getDefaultParent());

      if (vertices.length > 3) {
        graph.setEnabled(true);
      }
    }

    /**
     * Create new connection object
     * @param label
     * @param type
     */
    function getConnectionNode(label: string, type: string): Object {
      // Create new Connection object
      const connNode = doc.createElement('Connection');
      connNode.setAttribute('label', label);
      connNode.setAttribute('type', type);
      return connNode;
    }

    /**
     * Create new Node object
     * @param name
     * @param label
     * @param id
     */
    function getCellNode(name: string, label: string, id: any): Object {
      // Create new node object
      const _node = doc.createElement(name);
      _node.setAttribute('label', label);
      if (id) {
        _node.setAttribute('targetId', id);
      }
      return _node;
    }

    /**
     * Reformat the layout
     */
    function executeLayout() {
      isUndoable = true;
      const layout = new mxHierarchicalLayout(graph);
      layout.execute(graph.getDefaultParent());
    }

    /**
     * Function to centered the flow diagram
     */
    function makeCenter() {
      setTimeout(() => {
        graph.zoomActual();
        graph.center(true, true, 0.5, 0.2);
      }, 0);
    }

    function recursiveDeleteFn(selectedCell, target) {
      let flag = false;
      const edges = target.edges;
      if ((selectedCell.value.tagName === 'Fork' && target.value.tagName === 'Join') ||
        (selectedCell.value.tagName === 'If' && target.value.tagName === 'EndIf') ||
        (selectedCell.value.tagName === 'Retry' && target.value.tagName === 'RetryEnd') ||
        (selectedCell.value.tagName === 'Try' && target.value.tagName === 'EndTry')) {

        const attrs = target.value.attributes;
        if (attrs) {
          for (let i = 0; i < attrs.length; i++) {
            if (attrs[i].nodeName === 'targetId' && attrs[i].nodeValue === selectedCell.id) {
              for (let x = 0; x < edges.length; x++) {
                if (edges[x].target.id !== target.id) {
                  _targetNode = edges[x].target;
                }
              }
              self.nodeMap.delete(attrs[i].nodeValue);
              graph.removeCells([target]);
              flag = true;
              break;
            }
          }
        }
      }
      if (edges && edges.length > 0) {
        for (let j = 0; j < edges.length; j++) {
          if (edges[j].target) {
            if (edges[j].target.id !== target.id) {
              if ((selectedCell.value.tagName === 'Fork' && edges[j].target.value.tagName === 'Join') ||
                (selectedCell.value.tagName === 'If' && edges[j].target.value.tagName === 'EndIf') ||
                (selectedCell.value.tagName === 'Retry' && edges[j].target.value.tagName === 'RetryEnd') ||
                (selectedCell.value.tagName === 'Try' && edges[j].target.value.tagName === 'EndTry')) {
                const attrs = edges[j].target.value.attributes;
                if (attrs) {
                  for (let i = 0; i < attrs.length; i++) {
                    if (attrs[i].nodeName === 'targetId' && (attrs[i].nodeValue === selectedCell.id || attrs[i].nodeValue === target.id)) {
                      const _edges = edges[j].target.edges;
                      for (let x = 0; x < _edges.length; x++) {
                        if (_edges[x].target.id !== edges[j].target.id) {
                          _targetNode = _edges[x].target;
                        }
                      }

                      self.nodeMap.delete(attrs[i].nodeValue);
                      graph.removeCells([edges[j].target]);
                      flag = true;
                      break;
                    }
                  }
                }
              } else {
                if (edges[j].target) {
                  if (_iterateId !== edges[j].target.id) {
                    _iterateId = edges[j].target.id;
                    recursiveDeleteFn(selectedCell, edges[j].target);
                  }
                  if (edges[j]) {
                    graph.removeCells([edges[j].target]);
                  }
                }
              }
            }
          }
        }
        if (!flag) {
          for (let i = 0; i < edges.length; i++) {
            if (edges[i] && edges[i].target) {
              if (_iterateId !== edges[i].target.id) {
                _iterateId = edges[i].target.id;
                recursiveDeleteFn(selectedCell, (edges[i].target));
              }
              if (edges[i]) {
                graph.removeCells([edges[i].target]);
              }
              break;
            }
          }
        }
      }
    }

    function recursiveEdgeDelete(cells) {
      _targetNode = {};
      _iterateId = 0;
      const selectedCell = graph.getSelectionCell();
      let id = 0;
      if (selectedCell) {
        if (!isProgrammaticallyDelete) {
          id = selectedCell.id;
          let _sour, _tar, _label = '', _type = '';
          for (let i = 0; i < cells.length; i++) {
            const cell = cells[i];
            if (cell.edge && cell.source) {
              if (cell.target.id === id) {
                _sour = cell.source;
              }
              if (selectedCell.value.tagName === 'Fork' || selectedCell.value.tagName === 'If' ||
                selectedCell.value.tagName === 'Retry' || selectedCell.value.tagName === 'Try') {
                if (cell.target) {
                  if (cell.target.id !== id) {
                    recursiveDeleteFn(selectedCell, cell.target);
                    graph.removeCells([cell.target]);
                  }
                }
              } else {
                if (cell.source.id === id) {
                  const attrs = cell.value.attributes;
                  if (attrs) {
                    for (let j = 0; j < attrs.length; j++) {
                      if (attrs[j].nodeName === 'label') {
                        _label = attrs[j].nodeValue;
                      } else if (attrs[j].nodeName === 'type') {
                        _type = attrs[j].nodeValue;
                      }
                    }
                  }
                  _tar = cell.target;
                }
              }
            }
          }
          if (_sour && (_tar || !_.isEmpty(_targetNode))) {
            if (!_tar) {
              _tar = _targetNode;
            }
            let flag = true;
            if ((_sour.value.tagName === 'Fork' && _tar.value.tagName === 'Join') ||
              (_sour.value.tagName === 'If' && _tar.value.tagName === 'EndIf') ||
              (_sour.value.tagName === 'Retry' && _tar.value.tagName === 'RetryEnd') ||
              (_sour.value.tagName === 'Try' && _tar.value.tagName === 'EndTry')) {
              if (_sour.edges.length > 1) {
                flag = false;
              } else {
                _label = '';
                _type = '';
              }
            }
            if (flag) {
              graph.insertEdge(graph.getDefaultParent(), null, getConnectionNode(_label, _type), _sour, _tar);
            }
          }
        } else {
          isProgrammaticallyDelete = false;
        }
      }
      setTimeout(() => {
        isFullyDelete = false;
        if (id > 0) {
          executeLayout();
        }
      }, 0);
    }

    /**
     * change label of EndIf and Join
     */
    function changeLabelOfConnection(cell, data) {
      graph.getModel().beginUpdate();
      try {
        const label = new mxCellAttributeChange(
          cell, 'label',
          data);
        const type = new mxCellAttributeChange(
          cell, 'type',
          data);
        graph.getModel().execute(label);
        graph.getModel().execute(type);
      } finally {
        graph.getModel().endUpdate();
      }
    }

    function checkConnectionLabel(cell, _dropTarget, isChange) {
      if (!isChange) {
        if ((_dropTarget.value.attributes && _dropTarget.value.attributes.length > 0) && (_dropTarget.value.attributes[0].nodeValue === 'join' || _dropTarget.value.attributes[0].nodeValue === 'branch' || _dropTarget.value.attributes[0].nodeValue === 'endIf'
          || _dropTarget.value.attributes[0].nodeValue === 'retryEnd' || _dropTarget.value.attributes[0].nodeValue === 'endTry' || _dropTarget.value.attributes[0].nodeValue === 'endCatch')) {
          let _label1, _label2;
          if (_dropTarget.value.attributes[0].nodeValue === 'join') {
            _label1 = 'join';
            _label2 = 'branch';
          } else if (_dropTarget.value.attributes[0].nodeValue === 'branch') {
            _label1 = 'branch';
            _label2 = 'branch';
          } else if (_dropTarget.value.attributes[0].nodeValue === 'endIf') {
            _label1 = 'endIf';
            _label2 = 'endIf';
          } else if (_dropTarget.value.attributes[0].nodeValue === 'retryEnd') {
            _label1 = 'retryEnd';
            _label2 = 'retryEnd';
          } else if (_dropTarget.value.attributes[0].nodeValue === 'try') {
            _label1 = 'try';
            _label2 = 'try';
          } else if (_dropTarget.value.attributes[0].nodeValue === 'endTry') {
            _label1 = 'endTry';
            _label2 = 'endTry';
          } else if (_dropTarget.value.attributes[0].nodeValue === 'endCatch') {
            _label1 = 'endCatch';
            _label2 = 'endCatch';
          }
          for (let i = 0; i < cell.edges.length; i++) {
            if (cell.edges[i].target !== cell.id) {
              if ((cell.edges[i].target.value.tagName === 'Join' || cell.edges[i].target.value.tagName === 'EndIf' || cell.edges[i].target.value.tagName === 'RetryEnd'
                || cell.edges[i].target.value.tagName === 'EndTry' || cell.edges[i].target.value.tagName === 'EndCatch')) {
                if (cell.edges[i].target.edges) {
                  for (let j = 0; j < cell.edges[i].target.edges.length; j++) {
                    if (cell.edges[i].target.edges[j] && cell.edges[i].target.edges[j].target.id !== cell.edges[i].target.id) {
                      changeLabelOfConnection(cell.edges[i].target.edges[j], _label1);
                      break;
                    }
                  }
                }
              } else if (cell.edges[i].target.value.tagName === 'Fork' || cell.edges[i].target.value.tagName === 'If' || cell.edges[i].target.value.tagName === 'Retry'
                || cell.edges[i].target.value.tagName === 'Try') {
                changeLabelOfConnection(cell.edges[i], _label2);
              } else if (cell.edges[i].target.value.tagName === 'Catch') {
                changeLabelOfConnection(cell.edges[i], 'try');
              }
            }
          }
        }
      } else {
        if (cell.edges) {
          let _tempCell: any;
          for (let i = 0; i < cell.edges.length; i++) {
            if (_tempCell) {
              if (cell.edges[i].target !== cell.id) {
                if (cell.edges[i].target.value.tagName === 'Join') {
                  changeLabelOfConnection(_tempCell, 'branch');
                  changeLabelOfConnection(cell.edges[i], 'join');
                } else if (cell.edges[i].target.value.tagName === 'EndIf') {
                  changeLabelOfConnection(cell.edges[i], 'endIf');
                } else if (cell.edges[i].target.value.tagName === 'RetryEnd') {
                  changeLabelOfConnection(cell.edges[i], 'retryEnd');
                } else if (cell.edges[i].target.value.tagName === 'EndTry') {

                  changeLabelOfConnection(cell.edges[i], 'endTry');
                } else if (cell.edges[i].target.value.tagName === 'EndCatch') {
                  changeLabelOfConnection(cell.edges[i], 'endCatch');
                }
              }
            }
            if (cell.edges[i].source !== cell.id) {
              if (cell.edges[i].source.value.tagName === 'Join' || cell.edges[i].source.value.tagName === 'EndIf' || cell.edges[i].source.value.tagName === 'RetryEnd'
                || cell.edges[i].source.value.tagName === 'EndTry' || cell.edges[i].source.value.tagName === 'EndCatch') {
                _tempCell = cell.edges[i];
              }
            }

            if (_dropTarget.value.attributes && _dropTarget.value.attributes.length > 0) {
              if (((_dropTarget.value.attributes[0].nodeValue === 'join' || _dropTarget.value.attributes[1].nodeValue === 'join') && cell.edges[i].id !== _dropTarget.id)) {
                changeLabelOfConnection(cell.edges[i], 'branch');
              } else if (((_dropTarget.value.attributes[0].nodeValue === 'endIf' || _dropTarget.value.attributes[1].nodeValue === 'endIf') && cell.edges[i].id !== _dropTarget.id)) {
                changeLabelOfConnection(cell.edges[i], '');
              } else if (((_dropTarget.value.attributes[0].nodeValue === 'retryEnd' || _dropTarget.value.attributes[1].nodeValue === 'retryEnd') && cell.edges[i].id !== _dropTarget.id)) {
                changeLabelOfConnection(cell.edges[i], '');
              } else if (((_dropTarget.value.attributes[0].nodeValue === 'endTry' || _dropTarget.value.attributes[1].nodeValue === 'endTry') && cell.edges[i].id !== _dropTarget.id)) {
                changeLabelOfConnection(cell.edges[i], '');
              } else if (((_dropTarget.value.attributes[0].nodeValue === 'endCatch' || _dropTarget.value.attributes[1].nodeValue === 'endCatch') && cell.edges[i].id !== _dropTarget.id)) {
                changeLabelOfConnection(cell.edges[i], '');
              }
            }
            if (cell.id !== cell.edges[i].target.id) {
              const attrs = cell.edges[i].value.attributes;
              if (attrs) {
                if (attrs[0].value && (attrs[0].value === 'true' || attrs[0].value === 'false')) {
                  graph.getModel().beginUpdate();
                  try {
                    const label = new mxCellAttributeChange(
                      cell.edges[i], 'label',
                      '');
                    const type = new mxCellAttributeChange(
                      cell.edges[i], 'type',
                      '');
                    graph.getModel().execute(label);
                    graph.getModel().execute(type);
                  } finally {
                    graph.getModel().endUpdate();
                  }
                }
              }
            } else if (cell.id !== cell.edges[i].source.id) {
              const attrs = cell.edges[i].value.attributes;
              if (attrs && attrs.length > 0) {
                if (attrs[0].value === 'If') {
                  if (cell.edges[i].target.value.tagName !== 'If' && cell.edges[i].source.value.tagName !== 'If' && cell.value.tagName !== 'If') {
                    graph.getModel().beginUpdate();
                    try {
                      const label = new mxCellAttributeChange(
                        cell.edges[i], 'label',
                        '');
                      const type = new mxCellAttributeChange(
                        cell.edges[i], 'type',
                        '');
                      graph.getModel().execute(label);
                      graph.getModel().execute(type);
                    } finally {
                      graph.getModel().endUpdate();
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    /**
     * Updates the properties panel
     */
    function selectionChanged(_graph) {

      let div = document.getElementById('properties');
      // Forces focusout in IE
      _graph.container.focus();

      // Clears the DIV the non-DOM way
      div.innerHTML = '';

      // Gets the selection cell
      const cell = _graph.getSelectionCell();
      if (cell == null) {
        div.setAttribute('class', 'text-center text-orange');
        mxUtils.writeln(div, 'Nothing selected.');
      } else {
        if (cell.value.tagName === 'Fork' || cell.value.tagName === 'Await') {
          div.setAttribute('class', 'text-center text-orange');
          mxUtils.writeln(div, 'Nothing selected.');
          return;
        }
        div.removeAttribute('class');
        const form = new mxForm('property-table');
        let attrs = cell.value.attributes;
        let flg1 = false, flg2 = false, flg3 = false;
        if (attrs) {
          for (let i = 0; i < attrs.length; i++) {
            if (attrs[i].nodeName !== 'label' && attrs[i].nodeName !== 'checkSteadyState') {
              createTextField(_graph, form, cell, attrs[i]);
            }
            if (attrs[i].nodeName === 'success') {
              flg1 = true;
            } else if (attrs[i].nodeName === 'failure') {
              flg2 = true;
            } else if (attrs[i].nodeName === 'checkSteadyState') {
              flg3 = true;
            }
          }
          if (cell.value.nodeName === 'Job') {
            if (!flg1) {
              createTextField(_graph, form, cell, {nodeName: 'success', nodeValue: ''});
            }
            if (!flg2) {
              createTextField(_graph, form, cell, {nodeName: 'failure', nodeValue: ''});
            }
            // createTextAreaField(_graph, form, cell, 'Script', '');
          } else if (cell.value.nodeName === 'FileOrder') {
            if (flg3) {
              createCheckbox(_graph, form, cell, {nodeName: 'checkSteadyState', nodeValue: true});
            }
          }
        }
        div.appendChild(form.getTable());
        if (cell.value.nodeName === 'Job') {
          let label = document.createElement('div');
          let dom = document.createElement('label');
          dom.setAttribute('class', '_600 m-t-sm');
          mxUtils.writeln(dom, 'VARIABLES');
          label.appendChild(dom);
          div.appendChild(label);
          const form1 = new mxForm('property-table');
          createTextField(_graph, form1, cell, {nodeName: 'key', nodeValue: ''});
          createTextField(_graph, form1, cell, {nodeName: 'value', nodeValue: ''});
          div.appendChild(form1.getTable());
        }
        mxUtils.br(div);
      }
    }

    /**
     * Creates the textfield for the given property.
     */
    function createTextField(_graph, form, cell, attribute) {
      let input = form.addText(attribute.nodeName + ':', attribute.nodeValue);
      const applyHandler = function () {
        let newValue = input.value || '';
        let oldValue = cell.getAttribute(attribute.nodeName, '');
        if (newValue !== oldValue) {
          _graph.getModel().beginUpdate();
          try {
            const edit = new mxCellAttributeChange(
              cell, attribute.nodeName, newValue);
            _graph.getModel().execute(edit);
            isUndoable = true;
          } finally {
            _graph.getModel().endUpdate();
          }
        }
      };

      mxEvent.addListener(input, 'keypress', function (evt) {
        // Needs to take shift into account for textareas
        if (evt.which == /*enter*/13 &&
          !mxEvent.isShiftDown(evt)) {
          input.blur();
        }
      });

      if (mxClient.IS_IE) {
        mxEvent.addListener(input, 'focusout', applyHandler);
      } else {
        mxEvent.addListener(input, 'blur', applyHandler);
      }
    }

    /**
     * Creates the textAreafield for the given property.
     */
    function createTextAreaField(_graph, form, cell, name, value) {
      let input = form.addTextarea(name + ':', value, 10);
      const applyHandler = function () {
        let newValue = input.value || '';
        let oldValue = cell.getAttribute(name, '');
        if (newValue !== oldValue) {
          _graph.getModel().beginUpdate();
          try {
            const edit = new mxCellAttributeChange(
              cell, name, newValue);
            _graph.getModel().execute(edit);
            isUndoable = true;
          } finally {
            _graph.getModel().endUpdate();
          }
        }
      };

      mxEvent.addListener(input, 'keypress', function (evt) {
        // Needs to take shift into account for textareas
        if (evt.which === /*enter*/13 && !mxEvent.isShiftDown(evt)) {
          input.blur();
        }
      });

      if (mxClient.IS_IE) {
        mxEvent.addListener(input, 'focusout', applyHandler);
      } else {
        mxEvent.addListener(input, 'blur', applyHandler);
      }
    }

    /**
     * Creates the textAreafield for the given property.
     */
    function createCheckbox(_graph, form, cell, attribute) {
      let input = form.addCheckbox(attribute.nodeName + ':', attribute.nodeValue);
      const applyHandler = function () {
        let newValue = cell.getAttribute(attribute.nodeName, '') === 'true' ? false : true;
        _graph.getModel().beginUpdate();
        try {
          console.log(attribute.nodeName + ' : ' + newValue);
          const update = new mxCellAttributeChange(
            cell, attribute.nodeName, newValue);
          _graph.getModel().execute(update);
          isUndoable = true;
        } finally {
          _graph.getModel().endUpdate();
        }
      };
      mxEvent.addListener(input, 'change', applyHandler);
    }
  }
}

@Component({
  selector: 'app-joe',
  templateUrl: './joe.component.html',
  styleUrls: ['./joe.component.scss']
})
export class JoeComponent implements OnInit, OnDestroy {
  schedulerIds: any = {};
  preferences: any = {};
  tree: any = [];
  isLoading = true;
  pageView: any = 'grid';
  options: any = {};
  data: any = {};
  selectedPath: string;
  type: string;

  @ViewChild('treeCtrl') treeCtrl;

  constructor(private authService: AuthService, public coreService: CoreService, private dataService: DataService) {
  }

  ngOnInit() {
    if (sessionStorage.preferences) {
      this.preferences = JSON.parse(sessionStorage.preferences) || {};
    }
    this.schedulerIds = JSON.parse(this.authService.scheduleIds);
    if (localStorage.views) {
      // this.pageView = JSON.parse(localStorage.views).joe || 'grid';
    }
    this.initTree();
  }

  ngOnDestroy() {

  }

  initTree() {
    this.coreService.post('tree', {
      jobschedulerId: this.schedulerIds.selected,
      compact: true,
      types: ['WORKFLOW']
    }).subscribe((res) => {
      // this.tree = this.coreService.prepareTree(res);
      this.tree = [
        {
          id: 1, name: '/', path: '/', children: [
            {
              id: 2, name: 'sos', path: '/sos', children: [
                {
                  id: 4, name: 'Workflows', path: '/sos/Workflows', object: 'workflow', children: [
                    {
                      name: 'w1', type: 'workflow'
                    }, {
                      name: 'w2', type: 'workflow'
                    }
                  ]
                }, {
                  id: 5, name: 'Orders', path: '/sos/Orders', object: 'order', children: [
                    {
                      name: 'Template_1', type: 'order'
                    }, {
                      name: 'Template_2', type: 'order'
                    }
                  ]
                }, {
                  id: 6, name: 'Locks', path: '/sos/Locks', object: 'lock', children: [
                    {
                      name: 'lock_1', type: 'lock'
                    }
                  ]
                }, {
                  id: 7, name: 'Process_Classes', path: '/sos/Process_Classes', object: 'processClass', children: [
                    {
                      name: 'process_class_1', type: 'processClass'
                    }
                  ]
                }, {
                  id: 8, name: 'Calendars', path: '/sos/Calendars', object: 'calendar', children: []
                }
              ]
            },
            {
              id: 3, name: 'zehntech', path: '/zehntech', children: [
                {
                  id: 9, name: 'Workflows', path: '/zehntech/Workflows', object: 'workflow', children: [
                    {
                      name: 'w1', type: 'workflow'
                    }, {
                      name: 'w2', type: 'workflow'
                    }
                  ]
                }, {
                  id: 10, name: 'Orders', path: '/zehntech/Orders', object: 'order', children: [
                    {
                      name: 'Template_1', type: 'order'
                    }, {
                      name: 'Template_2', type: 'order'
                    }
                  ]
                }, {
                  id: 11, name: 'Locks', path: '/zehntech/Locks', object: 'lock', children: []
                }, {
                  id: 12, name: 'Process_Classes', path: '/zehntech/Process_Classes', object: 'processClass', children: []
                }, {
                  id: 13, name: 'Calendars', path: '/zehntech/Calendars', object: 'calendar', children: [
                    {
                      name: 'Working calendar', type: 'calendar'
                    }, {
                      name: 'Non-working calendar', type: 'calendar'
                    }
                  ]
                }
              ]
            }
          ]
        }
      ];
      const interval = setInterval(() => {
        if (this.treeCtrl && this.treeCtrl.treeModel) {
          const node = this.treeCtrl.treeModel.getNodeById(1);
          node.expand();
          node.data.isSelected = true;
          this.selectedPath = node.data.path;
          clearInterval(interval);
        }
      }, 5);
      this.isLoading = false;
    }, () => this.isLoading = false);
  }

  expandAll(): void {
    this.treeCtrl.treeModel.expandAll();
  }

  // Collapse all Node
  collapseAll(): void {
    this.treeCtrl.treeModel.collapseAll();
  }

  navFullTree() {
    const self = this;
    this.tree.forEach((value) => {
      value.isSelected = false;
      traverseTree(value);
    });

    function traverseTree(data) {
      if (data.children) {
        data.children.forEach((value) => {
          value.isSelected = false;
          traverseTree(value);
        });
      }
    }
  }

  onNodeSelected(e): void {
    this.navFullTree();
    if (this.preferences.expandOption === 'both') {
      const someNode = this.treeCtrl.treeModel.getNodeById(e.node.data.id);
      someNode.expand();
    }
    this.selectedPath = e.node.data.path;
    e.node.data.isSelected = true;
    this.data = e.node.data;
    this.type = e.node.data.object || e.node.data.type;
    if (this.type === 'workflow') {
      this.dataService.isWorkFlowReload.next(true);
    }
  }

  toggleExpanded(e): void {
    e.node.data.isExpanded = e.isExpanded;
  }

  receiveMessage($event) {
    this.pageView = $event;
  }
}
