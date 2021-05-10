import {Component, Input, OnInit} from '@angular/core';
import {NzModalRef} from 'ng-zorro-antd/modal';
import {CoreService} from '../../services/core.service';

declare const $: any;

@Component({
  selector: 'app-calendar-view',
  template: `
    <div class="modal-header">
      <h4 class="modal-title">
        <span *ngIf="!calendar" translate>runtime.label.calendarViewFor</span>
        <span *ngIf="calendar" translate>runtime.label.showPreview</span>
        <span *ngIf="calendar">: </span>
        {{path}}
      </h4>
      <button type="button" class="close" aria-label="Close" (click)="activeModal.destroy()">
        <span aria-hidden="true" class="fa fa-times-circle"></span>
      </button>
    </div>
    <div class="modal-body p-a">
      <div class="row">
        <div class="col-md-12">
          <ul class="nav navbar-nav navbar-nav-inline pull-right nav-active-border nav-active-border2 b-primary">
            <li class="nav-item">
              <a class="nav-link" [ngClass]="{'active' : calendarView=='month'}"
                 (click)="calendarView='month';getPlan()">
                <span class="nav-text text-dark p-b-sm" translate>runtime.label.monthly</span>
              </a>
            </li>
            <li class="nav-item dropdown-separator">
              <span class="separator"></span>
            </li>
            <li class="nav-item">
              <a class="nav-link" [ngClass]="{'active' : calendarView=='year'}"
                 (click)="calendarView='year';getPlan()">
                <span class="nav-text text-dark p-b-sm" translate>runtime.label.yearly</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div class="text-center" [hidden]="!isCalendarLoading">
        <div class="loading-img1 m-t-lg"></div>
      </div>
      <div class="row">
        <div class="col-md-12 m-t-sm">
          <div id="full-calendar"></div>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-grey btn-sm" (click)="activeModal.destroy()" translate>common.button.close</button>
    </div>
  `
})
export class CalendarModalComponent implements OnInit {
  @Input() path: string;
  @Input() calendar: boolean;
  calendarView = 'year';
  isCalendarLoading = false;
  planItems = [];
  toDate: any;
  calendarTitle = new Date().getFullYear();

  constructor(public activeModal: NzModalRef, private coreService: CoreService) {
  }

  ngOnInit(): void {
    this.showCalendar();
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
      let obj: any = {
        dateFrom: this.calendarTitle + '-01-01',
        dateTo: toDate,
      };

      if (this.calendar) {
        obj.path = this.path;
        this.getDates(obj);
      }
    } else if (newDate.getFullYear() === this.calendarTitle) {
      let obj: any = {
        dateFrom: this.coreService.getStringDate(null),
        dateTo: toDate,
      };
      if (this.calendar) {
        obj.path = this.path;
        this.getDates(obj);
      }
    }
  }

  getPlan(): void {
    $('#full-calendar').data('calendar').setYearView({view: this.calendarView, year: this.calendarTitle});
  }

  private showCalendar(): void {
    $('#full-calendar').calendar({
      language: localStorage.$SOS$LANG,
      renderEnd: (e) => {
        this.calendarTitle = e.currentYear;
        if (this.toDate) {
          this.changeDate();
        }
      }
    });
    const obj: any = {
      dateFrom: this.coreService.getStringDate(null),
      dateTo: this.calendarTitle + '-12-31'
    };
    if (this.calendar) {
      obj.path = this.path;
      this.toDate = obj.dateTo;
      this.getDates(obj);
    }
  }

  private getDates(obj): void {
    this.planItems = [];
    this.coreService.post('calendar/dates',
      obj).subscribe((result: any) => {
      this.filterDates(result);
    });
  }

  private filterDates(result) {
    if (result.dates) {
      for (let i = 0; i < result.dates.length; i++) {
        let x = result.dates[i];
        let obj = {
          startDate: this.coreService.getDate(x),
          endDate: this.coreService.getDate(x),
          color: '#007da6'
        };

        this.planItems.push(obj);
      }
    }
    if (result.withExcludes) {
      for (let i = 0; i < result.withExcludes.length; i++) {
        let x = result.withExcludes[i];
        this.planItems.push({
          startDate: this.coreService.getDate(x),
          endDate: this.coreService.getDate(x),
          color: '#eb8814'
        });
      }
    }

    $('#full-calendar').data('calendar').setDataSource(this.planItems);
  }
}
