import {Component, OnInit, OnDestroy, Input, ViewChild, ElementRef} from '@angular/core';
import {Subscription} from 'rxjs';
import * as moment from 'moment-timezone';
import {sortBy} from 'underscore';
import {differenceInCalendarDays, differenceInMilliseconds} from 'date-fns';
import {CoreService} from '../../../services/core.service';
import {AuthService} from '../../../components/guard';
import {DataService} from '../../../services/data.service';
import {GroupByPipe} from '../../../pipes/core.pipe';
import {TranslateService} from '@ngx-translate/core';

declare let self;

@Component({
  selector: 'app-controller-monitor',
  templateUrl: './controller-monitor.component.html',
  styleUrls: ['./controller-monitor.component.scss']
})
export class ControllerMonitorComponent implements OnInit, OnDestroy {
  @Input() permission: any;
  @Input() preferences: any = {};
  @Input() schedulerIds: any = {};
  @Input() filters: any = {};

  isLoaded = false;
  toggle = false;
  runningTime: any = [];
  statisticsData: any = [];
  data = [];
  ganttData = [];
  groupByData = [];
// options
  showXAxis = true;
  showYAxis = true;
  gradient = true;
  showLabels = true;
  yAxisLabel = 'In Hours';

  selectedDate: Date = new Date();
  viewDate: Date = new Date();
  dateFormat: string;
  weekStart = 1;
  groupPadding = 16;
  view: any = null;

  colorScheme = {
    domain: ['rgb(122,185,122)', '#ef486a', '#AAAAAA']
  };

  subscription1: Subscription;
  subscription2: Subscription;

  @ViewChild('chartArea', { static: true }) chartArea: ElementRef;

  constructor(private authService: AuthService, public coreService: CoreService, private translate: TranslateService,
              private groupByPipe: GroupByPipe, private dataService: DataService) {
    this.subscription1 = dataService.eventAnnounced$.subscribe(res => {
      this.refresh(res);
    });

    this.subscription2 = dataService.functionAnnounced$.subscribe((res: any) => {
      if (res && res.statistics) {
        this.getData();
      }
    });
  }

  ngOnInit(): void {
    self = this;
    this.translate.get('monitor.label.inHours').subscribe(translatedValue => {
      this.yAxisLabel = translatedValue;
    });
    this.init();
  }

  ngOnDestroy(): void {
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
  }

  init(): void {
    this.dateFormat = this.coreService.getDateFormat(this.preferences.dateFormat);
    this.getData();
  }

  setViewSize(): void {
    this.view = this.statisticsData.length > 15 ? [(100 * this.statisticsData.length), 260] :
      (this.chartArea.nativeElement.offsetWidth && this.chartArea.nativeElement.offsetWidth > 500)
        ? [(this.chartArea.nativeElement.offsetWidth - 34), 260] : null;
    if (!this.view && this.chartArea.nativeElement.offsetWidth === 0) {
      setTimeout(() => {
        this.setViewSize();
      }, 100);
    }
    this.groupPadding = this.statisticsData.length > 15 ? 4 : 16;
  }

  refresh(args): void {
    if (args.eventSnapshots && args.eventSnapshots.length > 0) {
      for (let j = 0; j < args.eventSnapshots.length; j++) {
        if (args.eventSnapshots[j].objectType === 'CONTROLLER') {
          this.getData();
          break;
        }
      }
    }
  }

  customColors(): any {
    self.toggle = !self.toggle;
    return self.toggle ? 'rgb(122,185,122)' : '#ef486a';
  }

  private getData(): void {
    this.coreService.post('monitoring/controllers', {
      controllerId: this.filters.current ? this.schedulerIds.selected : '',
    }).subscribe((res: any) => {
      this.data = res.controllers;
      this.groupByData = [];
      this.isLoaded = true;
      this.data.forEach((controller) => {
        for (const i in controller.entries) {
          const obj = {
            controllerId: controller.controllerId,
            date: this.coreService.getDateByFormat(controller.entries[i].readyTime, this.preferences.zone, 'YYYY-MM-DD'),
            readyTime: controller.entries[i].readyTime,
            shutdownTime: controller.entries[i].shutdownTime
          };
          this.groupByData.push(obj);
        }
      });
      this.groupByData = this.groupByPipe.transform(this.groupByData, 'date');
      this.getRunningTime();
      this.renderTimeSheetHeader('overview');
      this.renderTimeSheetHeader('statistics');
    }, () => {
      this.isLoaded = true;
    });
  }

  getRunningTime(): void {
    this.runningTime = [];
    this.data.forEach((controller) => {
      const obj: any = {
        controllerId: controller.controllerId,
      };
      let firstEntry;
      let lastEntry;
      if (this.filters.runningTime.filter.dateRange) {
        for (const i in controller.entries) {
          if (!firstEntry && new Date(controller.entries[i].readyTime).setHours(0, 0, 0, 0) >= new Date(this.filters.runningTime.filter.dateRange[0]).setHours(0, 0, 0, 0)) {
            firstEntry = controller.entries[i];
          } else {
            if (new Date(controller.entries[i].readyTime).setHours(0, 0, 0, 0) >= new Date(this.filters.runningTime.filter.dateRange[1]).setHours(0, 0, 0, 0)) {
              lastEntry = controller.entries[parseInt(i, 10) - 1];
              break;
            }
          }
        }
      } else {
        firstEntry = controller.entries[0];
        lastEntry = controller.entries[controller.entries.length - 1];
      }

      obj.total = differenceInMilliseconds(new Date(lastEntry.readyTime), new Date(firstEntry.readyTime));
      obj.time = Math.abs(lastEntry.totalRunningTime - firstEntry.totalRunningTime);
     // console.log(obj, '????', controller.controllerId)
      this.runningTime.push(obj);
    });

    this.runningTime.forEach((item) => {
      item.value = Math.round((item.time * 100) / item.total);
      item.hours = this.coreService.getTimeFromNumber(item.total);
    });
  }

  private getStatisticsData(): void {
    this.statisticsData = [];
    const dates = this.coreService.getDates(this.filters.statistics.filter.startDate, this.filters.statistics.filter.endDate);
    this.groupByData.forEach((item) => {
      const date = new Date(item.key).setHours(0, 0, 0, 0);
      if (date >= this.filters.statistics.filter.startDate && date <= this.filters.statistics.filter.endDate) {
        const values = this.groupByPipe.transform(item.value, 'controllerId');
        const obj = {
          name: item.key,
          series: []
        };
        for (const i in dates) {
          if (this.coreService.getDateByFormat(dates[i], this.preferences.zone, 'YYYY-MM-DD') === item.key) {
            dates.splice(i, 1);
            break;
          }
        }
        for (const i in values) {
          const statusObj: any = {
            value: 0,
            name: values[i].key,
          };
          let dur = 0;
          values[i].value.forEach((time, index) => {
            if (index === 0) {
              dur = moment.duration(this.coreService.getDateByFormat(time.readyTime, this.preferences.zone, 'HH:mm:SS')).asSeconds();
            } else {
              let diff = Math.abs(moment.duration(this.coreService.getDateByFormat(values[i].value[index - 1].shutdownTime, this.preferences.zone, 'HH:mm:SS')).asSeconds()
                - moment.duration(this.coreService.getDateByFormat(time.readyTime, this.preferences.zone, 'HH:mm:SS')).asSeconds());
              dur += diff;
            }
          });
          let dur1;
          if (this.coreService.getDateByFormat(this.viewDate, this.preferences.zone, 'YYYY-MM-DD') === item.key) {
            dur1 = moment.duration(this.coreService.getDateByFormat(this.viewDate, this.preferences.zone, 'HH:mm:SS')).asSeconds();
          }

          statusObj.value = (((dur1 || 86400) - dur) / (60 * 60)).toFixed(2);
          obj.series.push(statusObj);
          const totalVal: any = dur1 ? (dur1 / (60 * 60)).toFixed(2) : 24;
          obj.series.push({
            value: totalVal,
            value1: statusObj.value,
            name: values[i].key,
          });
        }
        this.statisticsData.push(obj);
      }
    });
    if (dates.length > 0) {
      const today = new Date().setHours(0, 0, 0, 0);
      dates.forEach((date) => {
        if (today > date) {
          this.statisticsData.push({
            name: this.coreService.getDateByFormat(date, this.preferences.zone, 'YYYY-MM-DD'),
            series: []
          });
        }
      });
      this.statisticsData = sortBy(this.statisticsData, (i: any) => {
        return i.name;
      });
    }
    this.setViewSize();
  }

  private getOverviewData(): void {
    this.ganttData = [];
    let count = 0;
    this.groupByData.forEach((item) => {
      const date = new Date(item.key).setHours(0, 0, 0, 0);
      if (date >= this.filters.overview.filter.startDate && date <= this.filters.overview.filter.endDate) {
        const values = this.groupByPipe.transform(item.value, 'controllerId');
        for (const i in values) {
          const obj = {
            id: ++count,
            controllerId: values[i].key,
            date: item.key,
            start: '00:15',
            end: '25:00',
            statusList: []
          };
          values[i].value.forEach((time) => {
            const statusObj = {
              start: this.coreService.getDateByFormat(time.readyTime, this.preferences.zone, 'HH:mm:SS'),
              end: '25:00',
              color: 'rgb(122,185,122)'
            };
            const readyTimeDate = this.coreService.getDateByFormat(time.readyTime, this.preferences.zone, 'YYYY-MM-DD');
            if (time.shutdownTime) {
              if (readyTimeDate === this.coreService.getDateByFormat(time.shutdownTime, this.preferences.zone, 'YYYY-MM-DD')) {
                statusObj.end = this.coreService.getDateByFormat(time.shutdownTime, this.preferences.zone, 'HH:mm:SS');
              } else {
                console.log(time.readyTime, time.shutdownTime);
              }
            } else{
              if (this.coreService.getDateByFormat(this.viewDate, this.preferences.zone, 'YYYY-MM-DD') === readyTimeDate) {
                statusObj.end = this.coreService.getDateByFormat(this.viewDate, this.preferences.zone, 'HH:mm:SS');
              }
            }
            obj.statusList.push(statusObj);
          });
          this.ganttData.push(obj);
        }
      }
    });
  }

  setView(view, type): void {
    this.filters[type].filter.view = view;
    this.renderTimeSheetHeader(type);
  }

  prev(type): void {
    if (this.filters[type].filter.view === 'Month') {
      this.filters[type].filter.startMonth = this.filters[type].filter.startMonth - 1;
    } else {
      const d = new Date(this.filters[type].filter.endDate);
      const time = d.setDate(d.getDate() - 8);
      this.filters[type].filter.endDate = new Date(time).setHours(0, 0, 0, 0);
    }
    this.renderTimeSheetHeader(type);
  }

  next(type): void {
    if (this.filters[type].filter.view === 'Month') {
      this.filters[type].filter.startMonth = this.filters[type].filter.startMonth + 1;
    } else {
      const d = new Date(this.filters[type].filter.endDate);
      const time = d.setDate(d.getDate() + 1);
      this.filters[type].filter.endDate = new Date(time).setHours(0, 0, 0, 0);
    }
    this.renderTimeSheetHeader(type);
  }

  onChange = (date: Date, type: string) => {
    if (this.filters[type].filter.view === 'Month') {
      this.filters[type].filter.startMonth = new Date(date).getMonth();
      this.filters[type].filter.startYear = new Date(date).getFullYear();
    } else {
      this.filters[type].filter.endDate = new Date(date);
    }
    this.renderTimeSheetHeader(type);
  }

  renderTimeSheetHeader(type): void {
    const headerDates = [];
    const firstDate = new Date(this.filters[type].filter.startYear, this.filters[type].filter.startMonth, 1);
    const lastDate = new Date(this.filters[type].filter.startYear, this.filters[type].filter.startMonth + 1, 0);
    let currentDate = new Date(firstDate.getTime());
    const weekStart = this.weekStart;
    if (this.filters[type].filter.view === 'Week') {
      currentDate = new Date(this.filters[type].filter.endDate);
    }
    while (currentDate.getDay() !== weekStart) {
      currentDate.setDate(currentDate.getDate() - 1);
    }
    if (this.filters[type].filter.view === 'Month') {
      while (currentDate <= lastDate) {
        do {
          const date = currentDate.getDate();
          if (currentDate >= firstDate && currentDate <= lastDate) {
            headerDates.push(new Date(currentDate));
          }
          currentDate.setDate(date + 1);
        }
        while (currentDate.getDay() !== weekStart);
      }
    } else {
      do {
        const date = currentDate.getDate();
        headerDates.push(new Date(currentDate));
        currentDate.setDate(date + 1);
      }
      while (currentDate.getDay() !== weekStart);
    }
    this.filters[type].filter.startDate = headerDates[0].setHours(0, 0, 0, 0);
    this.filters[type].filter.endDate = headerDates[headerDates.length - 1].setHours(0, 0, 0, 0);
    if (type === 'overview') {
      this.getOverviewData();
    } else {
      this.getStatisticsData();
    }
  }

  disabledDate = (current: Date): boolean => {
    // Can not select days before today and today
    return differenceInCalendarDays(current, this.viewDate) > 0;
  };

  getValue(val): string {
    return val + ' %';
  }

  getColor(): string {
    return 'rgb(122,185,122)';
  }

}
