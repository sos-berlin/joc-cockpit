import {Component, ElementRef, Input, SimpleChanges, ViewChild} from '@angular/core';
import {CoreService} from "../../../services/core.service";
import {GroupByPipe} from "../../../pipes/core.pipe";

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
  @Input() toggle: boolean;
  @Input() isLoaded: boolean;
  @Input() isCalendarView: boolean;
  @Input() searchText: string;

  data: any[] = [];
  isVisible = false;

  planItems: any = [];
  schedule: any = {};

  gantt: any;

  @ViewChild('ztgantt', {static: true}) element: ElementRef;

  constructor(private coreService: CoreService, private groupByPipe: GroupByPipe) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['projectionData'] && this.projectionData) {
      this.groupData(this.projectionData);
    } else if (changes['isCalendarView']) {
      if (changes['isCalendarView'].currentValue == true) {
        this.ngOnDestroy();
      }
      this.render();
    }
  }

  ngOnDestroy(): void {
    if (this.gantt) {
      this.gantt.destroy();
      this.gantt = null;
    }
  }

  private render() {
    if (this.filters.calendarView) {
      this.showCalendar();
    } else {
      if (this.data.length == 0) {
        this.ngOnDestroy();
        return;
      }
      this.isLoaded = false;
      let ZT_Gantt;
      if (!this.gantt) {
        ZT_Gantt = new window['ztGantt'](this.element.nativeElement);
        this.gantt = ZT_Gantt;
      } else {
        ZT_Gantt = this.gantt;
      }

      ZT_Gantt.options.columns = [
        {
          name: "text",
          width: 245,
          min_width: 80,
          max_width: 300,
          tree: true,
          label: "Schedules",
          resize: true,
          template: (task) => {
            return `<span>${task.text}</span>`;
          },
        },
      ];
      ZT_Gantt.templates.task_drag = (mode, task) => {
        return false;
      };

      if (this.filters.view == 'Year') {
        ZT_Gantt.options.scales = [
          {
            unit: "year",
            step: 1,
            format: '%Y'
          },
          {unit: "month", step: 1, format: "%F"},
          {unit: "day", step: 1, format: "%d"},
        ];
      } else if (this.filters.view !== 'Month') {
        ZT_Gantt.options.scales = [
          {
            unit: "week",
            step: 1,
            format: (t) => {
              const {
                startDate: a,
                endDate: n,
                weekNum: i,
              } = weekStartAndEnd(t);
              return ` ${ZT_Gantt.formatDateToString(
                "%j %M",
                a
              )} - ${ZT_Gantt.formatDateToString(
                "%j %M",
                n
              )}, ${a.getFullYear()}`;
            },
          },
          {unit: "day", step: 1, format: "%d"}
        ]
      } else {
        ZT_Gantt.options.scales = [
          {unit: "month", step: 1, format: "%F,%Y"},
          {unit: "day", step: 1, format: "%d"},
        ];
      }

      function weekStartAndEnd(t) {
        const e = t.getDay();
        let a, n;
        0 === e
          ? ((a = ZT_Gantt.add(t, -6, "day")), (n = t))
          : ((a = ZT_Gantt.add(t, -1 * e + 1, "day")),
            (n = ZT_Gantt.add(t, 7 - e, "day")));
        return {
          startDate: a,
          endDate: n,
          weekNum: ZT_Gantt.formatDateToString("%W", t),
        };
      }


      ZT_Gantt.templates.taskbar_text = function (start, end, task) {
        return task.count
      };

      ZT_Gantt.templates.taskbar_text = function (start, end, task) {
        return task.count
      };
      ZT_Gantt.templates.tooltip_text = function (start, end, task) {
        return (
          "<b>Schedule:</b> " +
          task.text +
          "<br/><b>Start date:</b> " +
          new Date(start) +
          "<br/><b>End date:</b> " +
          new Date(end)
        );
      };
      ZT_Gantt.templates.showLightBox = false;
      ZT_Gantt.options.date_format = '%Y-%m-%dT%H:%i:%sZ';
      ZT_Gantt.options.localLang = this.coreService.getLocale().lang;
      ZT_Gantt.options.data = this.data;
      ZT_Gantt.options.collapse = false;
      ZT_Gantt.options.taskProgress = false;
      ZT_Gantt.options.minColWidth = 48;
      ZT_Gantt.options.row_height = 30;
      ZT_Gantt.options.weekends = [];
      ZT_Gantt.options.fullWeek = true;
      ZT_Gantt.options.updateLinkOnDrag = true;
      ZT_Gantt.options.splitTask = true;
      ZT_Gantt.options.addLinks = false;
      ZT_Gantt.options.startDate = this.filters.startDate;
      ZT_Gantt.options.endDate = this.filters.endDate;
      ZT_Gantt.attachEvent('onTaskClick', (event) => {
        this.open(event);
      });
      setTimeout(() => {
        ZT_Gantt.clearAll();
        ZT_Gantt.render();
        this.isLoaded = true;
      }, 10)
    }
  }

  private groupData(data) {
    const flattenedData = [];
    let scheduleIdCounter = 1;
    for (const yearKey of Object.keys(data)) {
      const yearData = data[yearKey];
      for (const monthKey of Object.keys(yearData)) {
        const monthData = yearData[monthKey];
        for (const dateKey of Object.keys(monthData)) {
          const dateData = monthData[dateKey];
          const datePeriods = dateData.periods;
          const group = this.groupByPipe.transform(datePeriods, 'schedule');
          group.forEach((period) => {
            const schedule = period.key;
            const start_date = dateKey;
            const end_date = dateKey;
            let scheduleItem = flattenedData.find((item) => item.text === schedule);
            if (!scheduleItem) {
              scheduleItem = {id: scheduleIdCounter++, text: schedule};
              flattenedData.push(scheduleItem);
            }
            const item = {
              text: schedule,
              start_date,
              end_date,
              periods: period.value,
              parent: scheduleItem.id,
              count: period.value.length,
            };

            flattenedData.push(item);
          });
          if (dateKey) {
            let planData: any = {};
            const date = this.coreService.getDate(dateKey);
            planData.startDate = date;
            planData.endDate = date;
            planData.color = 'blue';
            this.planItems.push(planData);
          }
        }
      }
    }

    flattenedData.sort((a, b) => {
      if (a.text.toLowerCase() < b.text.toLowerCase()) {
        return -1;
      } else if (a.text.toLowerCase() > b.text.toLowerCase()) {
        return 1;
      }
      return 0;
    });
    this.data = flattenedData;
    this.render();
  }

  close(): void {
    this.isVisible = false;
  }

  open(event): void {
    this.isVisible = true;
    this.schedule = {
      list: []
    };
    if (event['task']) {
      this.schedule.date = event['task']['start_date'];
      this.schedule.list.push(event['task'])
    } else {
      this.schedule.date = event.date;
      for (let i in this.data) {
        const currentDate = new Date(event.date).setHours(0, 0, 0, 0);
        const startDate = new Date(this.data[i].start_date).setHours(0, 0, 0, 0);
        if (startDate == currentDate) {
          this.schedule.list.push(this.data[i])
        } else if (startDate > currentDate) {
          break;
        }
      }
    }
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
    const dom = $('#full-calendar-projection');
    if (!dom.data('calendar')) {
      $('#full-calendar-projection').calendar({
        language: this.coreService.getLocale(),
        view: this.filters.calView.toLowerCase(),
        renderEnd: (e) => {
          this.filters.currentYear = e.currentYear;
          this.filters.currentMonth = e.currentMonth;
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
        dom.data('calendar').setDataSource(this.planItems);
      }
    }, 10);
  }

}
