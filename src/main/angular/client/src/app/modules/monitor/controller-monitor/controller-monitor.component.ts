import {Component, OnInit, OnDestroy, Input} from '@angular/core';
import {Subscription} from 'rxjs';
import * as moment from 'moment-timezone';
import {differenceInCalendarDays, differenceInMilliseconds} from 'date-fns';
import {CoreService} from '../../../services/core.service';
import {AuthService} from '../../../components/guard';
import {DataService} from '../../../services/data.service';
import {GroupByPipe} from '../../../pipes/core.pipe';

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

  selectedDate: Date = new Date();
  viewDate: Date = new Date();
  dateFormat: string;
  weekStart = 1;
  runningFilterBtn = [
    {
      date: 'ALL', text: 'all'
    },
    {
      date: '-7d',
      text: 'lastWeak'
    },
    {
      date: '-30d',
      text: 'last30'
    }
  ];

  colorScheme = {
    domain: ['#19AADE', '#C7B42C', '#AAAAAA']
  };

  subscription: Subscription;

  constructor(private authService: AuthService, public coreService: CoreService,
              private groupByPipe: GroupByPipe, private dataService: DataService) {
    this.subscription = dataService.eventAnnounced$.subscribe(res => {
      this.refresh(res);
    });
  }

  ngOnInit(): void {
    self = this;
    this.init();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  init(): void {
    this.dateFormat = this.coreService.getDateFormat(this.preferences.dateFormat);
    this.getData();
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

  changeDate(obj): void {
    this.filters.runningTime.filter.date = obj.date;
    this.filters.runningTime.filter.label = obj.text;
    this.getRunningTime();
  }

  private getData(): void {
    this.coreService.post('monitoring/controllers', {
      controllerId: this.schedulerIds.selected
    }).subscribe((res: any) => {
      this.data = res.controllers;
      this.groupByData = [];
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
      this.isLoaded = true;
    }, () => {
      this.isLoaded = true;
    });
  }

  private getRunningTime(): void {
    this.runningTime = [];
    this.data.forEach((controller) => {
      const obj: any = {
        controllerId: controller.controllerId,
      };
      let firstEntry = controller.entries[0];
      const lastEntry = controller.entries[controller.entries.length - 1];
      const d = new Date();
      if (this.filters.runningTime.filter.date !== 'ALL') {
        let fromDate;
        if (this.filters.runningTime.filter.date === '-7d') {
          fromDate = d.setDate(new Date().getDate() - 7);
        } else {
          fromDate = d.setMonth(new Date().getMonth() - 1);
        }
        for (const i in controller.entries) {
          if (new Date(controller.entries[i].readyTime) >= fromDate) {
            firstEntry = controller.entries[i];
            break;
          }
        }
      }
      obj.total = differenceInMilliseconds(new Date(lastEntry.readyTime), new Date(firstEntry.readyTime));
      obj.time = (lastEntry.totalRunningTime - firstEntry.totalRunningTime);
      this.runningTime.push(obj);
    });

    this.runningTime.forEach((item) => {
      item.value = Math.round((item.time * 100) / item.total);
      item.hours = this.coreService.getTimeFromNumber(item.total);
    });
  }

  private getStatisticsData(): void {
    this.statisticsData = [];
    this.groupByData.forEach((item) => {
      const date = new Date(item.key).setHours(0, 0, 0, 0);
      if (date >= this.filters.statistics.filter.startDate && date <= this.filters.statistics.filter.endDate) {
        const values = this.groupByPipe.transform(item.value, 'controllerId');
        const obj = {
          name: item.key,
          series: []
        };
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
          statusObj.value = ((86400 - dur) / (60 * 60));
          statusObj.tooltip = statusObj.value.toFixed(2) + ' hours';
          obj.series.push(statusObj);
        }
        this.statisticsData.push(obj);
      }
    });
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
          values[i].value.forEach((time, index) => {
            const statusObj = {
              start: index === 0 ? '00:00' : this.coreService.getDateByFormat(values[i].value[index - 1].shutdownTime, this.preferences.zone, 'HH:mm:SS'),
              end: this.coreService.getDateByFormat(time.readyTime, this.preferences.zone, 'HH:mm:SS'),
              color: '#ff3232'
            };
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
    for (let i in self.runningTime) {
      if (val === self.runningTime[i].value) {
        return self.coreService.getTimeFromNumber(self.runningTime[i].time);
      }
    }
    return val + ' %';
  }

  getColor(): string {
    return 'rgb(122,185,122)';
  }

}
