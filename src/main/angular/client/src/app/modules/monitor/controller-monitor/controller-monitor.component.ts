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
      if (res && res.filter) {
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
    this.renderTimeSheetHeader();
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
      dateFrom: this.filters.filter.startDate,
      dateTo: this.filters.filter.endDate,
      timeZone: this.preferences.zone
    }).subscribe((res: any) => {
      this.data = res.controllers;
      let groupData = [];
      this.isLoaded = true;
      this.data.forEach((controller) => {
        for (const i in controller.entries) {
          const obj = {
            controllerId: controller.controllerId,
            date: this.coreService.getDateByFormat(controller.entries[i].readyTime, this.preferences.zone, 'YYYY-MM-DD'),
            readyTime: controller.entries[i].readyTime,
            lastKnownTime: controller.entries[i].lastKnownTime
          };
          groupData.push(obj);
        }
      });
      groupData = this.groupByPipe.transform(groupData, 'date');
      this.getRunningTime();
      this.checkMissingDates(groupData);
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
      if (this.filters.runningTime.filter.dateRange && this.filters.runningTime.filter.dateRange.length > 0) {
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

      if (lastEntry) {
        obj.total = differenceInMilliseconds(new Date(lastEntry.readyTime), new Date(firstEntry.readyTime));
        obj.time = Math.abs(lastEntry.totalRunningTime - firstEntry.totalRunningTime);
        obj.value = Math.round((obj.time * 100) / obj.total);
        obj.hours = this.coreService.getTimeFromNumber(obj.total);
        if (isNaN(obj.value)) {
          obj.value = 0;
        }
        this.runningTime.push(obj);
      }
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
          if (time.lastKnownTime) {
            const shutdownDate = this.coreService.getDateByFormat(time.lastKnownTime, this.preferences.zone, 'YYYY-MM-DD');
            if (this.coreService.getDateByFormat(time.readyTime, this.preferences.zone, 'YYYY-MM-DD') === shutdownDate) {
              endTimeInSec = moment.duration(this.coreService.getDateByFormat(time.lastKnownTime, this.preferences.zone, 'HH:mm:SS')).asSeconds();
            }
          }
          dur += (endTimeInSec - startTimeInSec);
        });

        if (dur > 86400) {
          dur = dur - 86400;
        }

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
        statusObj.value1 = ((dur1 ? (dur1 / (60 * 60)) : 24) - statusObj.value2).toFixed(2);
        if (parseInt(statusObj2.value, 10) < parseInt(statusObj.value, 10)) {
          obj.series.push(statusObj);
          obj.series.push(statusObj2);
        } else {
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
          if (time.lastKnownTime) {
            if (readyTimeDate === this.coreService.getDateByFormat(time.lastKnownTime, this.preferences.zone, 'YYYY-MM-DD')) {
              statusObj.end = this.coreService.getDateByFormat(time.lastKnownTime, this.preferences.zone, 'HH:mm:SS');
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
    this.filters.filter.startDate = headerDates[0];
    this.filters.filter.endDate = headerDates[headerDates.length - 1];
    this.getData();
  }

  checkMissingDates(groupData): void {
    const dates = this.coreService.getDates(this.filters.filter.startDate, this.filters.filter.endDate);
    const tempArr = [];
    for (let i = 0; i < dates.length; i++) {
      const today = new Date().setHours(0, 0, 0, 0);
      if (today < dates[i]) {
        break;
      } else {
        let flag = false;
        const date = this.coreService.getDateByFormat(dates[i], this.preferences.zone, 'YYYY-MM-DD');
        for (const j in groupData) {
          if (date === groupData[j].key) {
            flag = true;
            groupData[j].value = sortBy(groupData[j].value, (i: any) => {
              return i.readyTime;
            });
            tempArr.push(groupData[j]);
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
                const shutdownDate = this.coreService.getDateByFormat(data.lastKnownTime, this.preferences.zone, 'YYYY-MM-DD');
                if (this.coreService.getDateByFormat(data.readyTime, this.preferences.zone, 'YYYY-MM-DD') !== shutdownDate) {
                  const copyObj = this.coreService.clone(data);
                  copyObj.date = date;
                  data.lastKnownTime = null;
                  copyObj.readyTime = new Date(date).setHours(0, 0, 0, 0);
                  mailObj.value.push(copyObj);
                }
              });
            }
          }
          tempArr.push(mailObj);
        }

        if (i > 0) {
          const prev = tempArr[i - 1].value;
          const length = tempArr[i].value.length;
          for (let j = 0; j < prev.length; j++) {
            for (let x = 0; x < length; x++) {
              if (prev[j].controllerId === tempArr[i].value[x].controllerId && prev[j].readyTime !== tempArr[i].value[x].readyTime) {
                if (prev[j].lastKnownTime) {
                  const couplingFailedDate = this.coreService.getDateByFormat(prev[j].lastKnownTime, this.preferences.zone, 'YYYY-MM-DD');
                  if (couplingFailedDate === tempArr[i].value[x].date || (new Date(couplingFailedDate).setHours(0, 0, 0, 0) > new Date(tempArr[i].value[x].date).setHours(0, 0, 0, 0))) {
                    const copyPrevObj = this.coreService.clone(prev[j]);
                    prev[j].lastKnownTime = null;
                    copyPrevObj.date = tempArr[i].value[x].date;
                    copyPrevObj.readyTime = new Date(copyPrevObj.date).setHours(0, 0, 0, 0);
                    let isMatch = false;
                    for (const y in tempArr[i].value) {
                      if (tempArr[i].value[y].readyTime === copyPrevObj.readyTime) {
                        isMatch = true;
                        break;
                      }
                    }
                    if (!isMatch) {
                      tempArr[i].value.push(copyPrevObj);
                    }
                  }
                }
              }
            }
          }
          if (length === 0) {
            tempArr[i].value = prev;
            tempArr[i].value.forEach(item => {
              item.date = tempArr[i].key;
              if (item.lastKnownTime) {
                const couplingFailedDate = this.coreService.getDateByFormat(item.lastKnownTime, this.preferences.zone, 'YYYY-MM-DD');
                if (couplingFailedDate === item.date || (new Date(couplingFailedDate).setHours(0, 0, 0, 0) >
                  new Date(item.date).setHours(0, 0, 0, 0))) {
                  item.readyTime = new Date(tempArr[i].key).setHours(0, 0, 0, 0);
                } else if (new Date(couplingFailedDate).setHours(0, 0, 0, 0) <
                  new Date(item.date).setHours(0, 0, 0, 0)) {
                  item.readyTime = new Date(tempArr[i].key).setHours(23, 59, 59, 0);
                  item.lastKnownTime = null;
                }
              } else{
                item.readyTime = new Date(tempArr[i].key).setHours(0, 0, 0, 0);
              }
            });
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
