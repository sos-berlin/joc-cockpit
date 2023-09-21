import {Component, EventEmitter, Input, Output, SimpleChanges} from '@angular/core';
import {CoreService} from "../../../services/core.service";
import {groupBy} from "underscore";

declare const $;

@Component({
  selector: 'app-projection',
  templateUrl: './projection.component.html',
  styleUrls: ['./projection.component.css']
})
export class ProjectionComponent {
  @Input() projectionData: any;
  @Input() filters: any;
  @Input() preferences: any;
  @Input() permission: any;
  @Input() isLoaded: boolean;

  @Output() onChange: EventEmitter<any> = new EventEmitter();

  data: any[] = [];
  isVisible = false;

  planItems: any = [];
  schedule: any = {};

  gantt: any;

  constructor(public coreService: CoreService) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.projectionData) {
      if (changes['projectionData']) {
        this.prepareCalendarData(this.projectionData);
      }
    }
  }

  ngOnDestroy(): void {
    $('#full-calendar-projection')?.remove();
  }

  private prepareCalendarData(data) {
    this.planItems = [];
    for (const yearKey of Object.keys(data)) {
      const yearData = data[yearKey];
      for (const monthKey of Object.keys(yearData)) {
        const monthData = yearData[monthKey];
        for (const dateKey of Object.keys(monthData)) {
          const dateData = monthData[dateKey];
          if (dateKey) {
            let planData: any = {};
            const date = this.coreService.getDate(dateKey);
            planData.startDate = date;
            planData.endDate = date;
            planData.color = dateData.planned ? 'blue' : 'orange';
            planData.numOfPeriods = dateData.numOfPeriods;
            this.planItems.push(planData);
          }
        }
      }
    }
    this.showCalendar();
  }

  close(): void {
    this.isVisible = false;
  }

  open(event): void {
    this.isVisible = true;
    this.schedule = {
      loading: true,
      list: []
    };
   
    this.schedule.date = this.coreService.getDateByFormat(event.date, this.preferences.zone, 'YYYY-MM-DD');
    this.coreService.post('daily_plan/projections/date', {
      date: this.schedule.date
    }).subscribe({
      next: (res) => {
        this.schedule.planned = res.planned;
        const data = groupBy(res.periods, (res) => {
          return res.schedule;
        });
        for (const key of Object.keys(data)) {
          this.schedule.list.push(
            {
              schedule: key,
              periods: data[key]
            }
          )
        }
        this.schedule.loading = false;
      }, error: () => this.schedule.loading = false
    });
  }

  getPeriodStr(period): string {
    let periodStr = null;
    if (period.begin) {
      periodStr = this.coreService.getDateByFormat(period.begin, null, 'HH:mm:ss');
    }
    if (period.end) {
      periodStr = periodStr + '-' + this.coreService.getDateByFormat(period.end, null, 'HH:mm:ss');
    }
    if (period.singleStart) {
      periodStr = 'Single start: ' + this.coreService.getDateByFormat(period.singleStart, null, 'HH:mm:ss');
    } else if (period.repeat) {
      periodStr = periodStr + ' every ' + this.getTimeInString(period.repeat);
    }
    return periodStr;
  }

  private getTimeInString(time: any): string {
    if (time.toString().substring(0, 2) === '00' && time.toString().substring(3, 5) === '00') {
      return time.toString().substring(6, time.length) + ' seconds';
    } else if (time.toString().substring(0, 2) === '00') {
      return time.toString().substring(3, time.length) + ' minutes';
    } else if ((time.toString().substring(0, 2) != '00' && time.length === 5) || (time.length > 5 && time.toString().substring(0, 2) != '00' && (time.toString().substring(6, time.length) === '00'))) {
      return time.toString().substring(0, 5) + ' hours';
    } else {
      return time;
    }
  }

  private showCalendar(): void {
    this.isLoaded = false;
    const dom = $('#full-calendar-projection');
    if (!dom.data('calendar')) {
      $('#full-calendar-projection').calendar({
        language: this.coreService.getLocale(),
        view: this.filters.calView.toLowerCase(),
        renderEnd: (e) => {
          let reload = false;
          if (this.filters.currentYear !== e.currentYear || this.filters.currentMonth !== e.currentMonth) {
            reload = true;
          }
          if (reload && this.isLoaded) {
            this.onChange.emit(e);
          }
        },
        clickDay: (e) => {
          this.open(e);
        }
      });
    } else {
      $('#full-calendar-projection').data('calendar').setYearView({
        view: this.filters.calView.toLowerCase(),
        year: this.filters.currentYear
      });
    }

    setTimeout(() => {
      const dom = $('#full-calendar-projection');
      if (dom.data('calendar')) {
        console.log(this.planItems)
        dom.data('calendar').setDataSource(this.planItems);
      }
      this.isLoaded = true;
    }, 10);
  }

}
