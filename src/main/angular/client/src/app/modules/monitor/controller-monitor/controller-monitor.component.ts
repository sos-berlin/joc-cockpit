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
      this.renderTimeSheetHeader();
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
      obj.value = Math.round((obj.time * 100) / obj.total);
      obj.hours = this.coreService.getTimeFromNumber(obj.total);
      if (isNaN(obj.value)) {
        obj.value = 0;
      }
      this.runningTime.push(obj);
    });
  }

  private getStatisticsData(tempArr): void {
    this.statisticsData = [];
    tempArr.forEach((item) => {
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
        values[i].value.forEach((time) => {
          const startTimeInSec = moment.duration(this.coreService.getDateByFormat(time.readyTime, this.preferences.zone, 'HH:mm:SS')).asSeconds();
          let endTimeInSec = 86400;
          if (this.coreService.getDateByFormat(this.viewDate, this.preferences.zone, 'YYYY-MM-DD') === item.key) {
            endTimeInSec = moment.duration(this.coreService.getDateByFormat(this.viewDate, this.preferences.zone, 'HH:mm:SS')).asSeconds();
          }
          if (time.shutdownTime) {
            const shutdownDate = this.coreService.getDateByFormat(time.shutdownTime, this.preferences.zone, 'YYYY-MM-DD');
            if (this.coreService.getDateByFormat(time.readyTime, this.preferences.zone, 'YYYY-MM-DD') === shutdownDate) {
              endTimeInSec = moment.duration(this.coreService.getDateByFormat(time.shutdownTime, this.preferences.zone, 'HH:mm:SS')).asSeconds();
            }
          }
          dur += (endTimeInSec - startTimeInSec);
        });

        let dur1;
        if (this.coreService.getDateByFormat(this.viewDate, this.preferences.zone, 'YYYY-MM-DD') === item.key) {
          dur1 = moment.duration(this.coreService.getDateByFormat(this.viewDate, this.preferences.zone, 'HH:mm:SS')).asSeconds();
        }
        statusObj.value2 = (dur / (60 * 60));
        statusObj.value = ((dur1 ? (dur1 / (60 * 60)) : 24) - statusObj.value2);

        let totalVal: any = dur1 ? (dur1 / (60 * 60)).toFixed(2) : 24;
        if (statusObj.value == 24 || statusObj.value === '24.00') {
          totalVal = 0;
        }
        const statusObj2: any = {
          value: totalVal,
          value1: statusObj.value2.toFixed(2),
          name: values[i].key,
        };
        statusObj.value1 = (24 - statusObj.value2).toFixed(2);
        if (parseInt(statusObj2.value, 10) < parseInt(statusObj.value, 10)){
          obj.series.push(statusObj);
          obj.series.push(statusObj2);
        } else{
          obj.series.push(statusObj2);
          obj.series.push(statusObj);
        }
      }
      this.statisticsData.push(obj);
    });

    this.setViewSize();
  }

  private getOverviewData(tempArr): void {
    this.ganttData = [];
    let count = 0;
    tempArr.forEach((item) => {
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
            }
          } else {
            if (this.coreService.getDateByFormat(this.viewDate, this.preferences.zone, 'YYYY-MM-DD') === readyTimeDate) {
              statusObj.end = this.coreService.getDateByFormat(this.viewDate, this.preferences.zone, 'HH:mm:SS');
            }
          }
          obj.statusList.push(statusObj);
        });
        this.ganttData.push(obj);
      }
    });
  }

  setView(view): void {
    this.filters.filter.view = view;
    this.renderTimeSheetHeader();
  }

  prev(): void {
    if (this.filters.filter.view === 'Month') {
      this.filters.filter.startMonth = this.filters.filter.startMonth - 1;
    } else {
      const d = new Date(this.filters.filter.endDate);
      const time = d.setDate(d.getDate() - 8);
      this.filters.filter.endDate = new Date(time).setHours(0, 0, 0, 0);
    }
    this.renderTimeSheetHeader();
  }

  next(): void {
    if (this.filters.filter.view === 'Month') {
      this.filters.filter.startMonth = this.filters.filter.startMonth + 1;
    } else {
      const d = new Date(this.filters.filter.endDate);
      const time = d.setDate(d.getDate() + 1);
      this.filters.filter.endDate = new Date(time).setHours(0, 0, 0, 0);
    }
    this.renderTimeSheetHeader();
  }

  onChange = (date: Date) => {
    if (this.filters.filter.view === 'Month') {
      this.filters.filter.startMonth = new Date(date).getMonth();
      this.filters.filter.startYear = new Date(date).getFullYear();
    } else {
      this.filters.filter.endDate = new Date(date);
    }
    this.renderTimeSheetHeader();
  }

  renderTimeSheetHeader(): void {
    const headerDates = [];
    const firstDate = new Date(this.filters.filter.startYear, this.filters.filter.startMonth, 1);
    const lastDate = new Date(this.filters.filter.startYear, this.filters.filter.startMonth + 1, 0);
    let currentDate = new Date(firstDate.getTime());
    const weekStart = this.weekStart;
    if (this.filters.filter.view === 'Week') {
      currentDate = new Date(this.filters.filter.endDate);
    }
    while (currentDate.getDay() !== weekStart) {
      currentDate.setDate(currentDate.getDate() - 1);
    }
    if (this.filters.filter.view === 'Month') {
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
    this.filters.filter.startDate = headerDates[0].setHours(0, 0, 0, 0);
    this.filters.filter.endDate = headerDates[headerDates.length - 1].setHours(0, 0, 0, 0);
    const tempArr = [];
    for (let i = 0; i < headerDates.length; i++) {
      const today = new Date().setHours(0, 0, 0, 0);
      if (today < headerDates[i]) {
        break;
      } else {
        let flag = false;
        const date = this.coreService.getDateByFormat(headerDates[i], this.preferences.zone, 'YYYY-MM-DD');
        for (const j in this.groupByData) {
          if (date === this.groupByData[j].key) {
            flag = true;
            this.groupByData[j].value = sortBy(this.groupByData[j].value, (i: any) => {
              return i.readyTime;
            });
            tempArr.push(this.groupByData[j]);
            break;
          }
        }
        if (!flag) {
          let mailObj = {
            key: date,
            value: []
          };
          if (i > 0) {
            let x = tempArr[i - 1].value;
            if (x.length > 0) {
              x.forEach((data) => {
                const shutdownDate = this.coreService.getDateByFormat(data.shutdownTime, this.preferences.zone, 'YYYY-MM-DD');
                if (this.coreService.getDateByFormat(data.readyTime, this.preferences.zone, 'YYYY-MM-DD') !== shutdownDate) {
                  const copyObj = this.coreService.clone(data);
                  copyObj.date = date;
                  data.shutdownTime = null;
                  copyObj.readyTime = new Date(date).setHours(0, 0, 0, 0);
                  mailObj.value.push(copyObj);
                }
              });
            }
          }
          tempArr.push(mailObj);
        }

        if (i > 0) {
          const prev = this.coreService.clone(tempArr[i - 1].value);
          for (let j = 0; j < prev.length; j++) {
            let flag1 = false;
            for (let x = 0; x < tempArr[i].value.length; x++) {
              if (prev[j].controllerId === tempArr[i].value[x].controllerId) {
                if (prev[j].shutdownTime &&
                  this.coreService.getDateByFormat(prev[j].shutdownTime, this.preferences.zone, 'YYYY-MM-DD') === tempArr[i].value[x].date) {
                  tempArr[i - 1].shutdownTime = null;
                  prev[j].date = tempArr[i].value[x].date;
                  prev[j].readyTime = new Date(prev[j].date).setHours(0, 0, 0, 0);
                  flag1 = true;
                  tempArr[i].value.push(prev[j]);
                  break;
                }
              }
            }
            if (flag1) {
              break;
            }
          }
        }
      }
    }

    this.getOverviewData(tempArr);
    this.getStatisticsData(tempArr);
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
