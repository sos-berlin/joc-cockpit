import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {CoreService} from '../../../../services/core.service';
import {DataService} from '../../../../services/data.service';
import {TreeModalComponent} from '../../../../components/tree-modal/tree.component';
import {Observable, of} from 'rxjs';
import {catchError, debounceTime, distinctUntilChanged, map, switchMap, tap} from 'rxjs/operators';
import * as _ from 'underscore';
@Component({
  selector: 'app-period',
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
  selector: 'app-order',
  templateUrl: './order.component.html',
})
export class OrderComponent implements OnInit {
  order: any = {};
  variableObject: any = {};
  @Input() preferences: any;
  @Input() schedulerId: any;
  calendarSearch: any;
  nonCalendarSearch: any;
  searching = false;
  searchFailed = false;
  searchingNon = false;
  previewCalendarView: any;
  calendarObj: any;

  constructor(private modalService: NgbModal, private coreService: CoreService, private dataService: DataService) {

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
  };

  formatterNon = (x: { path: string }) => {
    let flag = false;
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
  };


  previewCalendar(calendar): void {
    this.dataService.isCalendarReload.next(calendar);
    this.previewCalendarView = calendar;
  }

  closeCalendarView() {
    this.previewCalendarView = null;
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
      if (!this.coreService.isLastEntryEmpty(this.variableObject.variables, 'name', '')) {
        this.variableObject.variables.push(param);
      }
    }
  }

  removeVariable(index): void {
    this.variableObject.variables.splice(index, 1);
  }
}
