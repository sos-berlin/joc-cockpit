import {Component, ElementRef, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Subscription} from 'rxjs';
import {differenceInCalendarDays, differenceInMilliseconds} from 'date-fns';
import * as moment from 'moment-timezone';
import {sortBy} from 'underscore';
import {TranslateService} from '@ngx-translate/core';
import {CoreService} from '../../../services/core.service';
import {DataService} from '../../../services/data.service';
import {AuthService} from '../../../components/guard';
import {GroupByPipe} from '../../../pipes/core.pipe';

declare let self;

@Component({
  selector: 'app-agent-monitor',
  templateUrl: './agent-monitor.component.html',
  styleUrls: ['./agent-monitor.component.scss']
})
export class AgentMonitorComponent implements OnInit, OnDestroy {
  @Input() permission: any;
  @Input() preferences: any = {};
  @Input() schedulerIds: any = {};
  @Input() filters: any = {};

  toggle = false;
  isLoaded = false;
  agents = [];
  data = [];
  runningTime: any = [];
  groupByData = [];
  statisticsData: any = [];

  viewDate: Date = new Date();
  dateFormat: string;
  weekStart = 1;
  yAxisLabel = 'In Hours';
  groupPadding = 16;
  view: any = null;

  subscription1: Subscription;
  subscription2: Subscription;

  colorScheme = {
    domain: ['rgb(122,185,122)', '#ef486a', '#AAAAAA']
  };

  @ViewChild('chartArea', { static: true }) chartArea: ElementRef;

  constructor(private coreService: CoreService, private authService: AuthService, private translate: TranslateService,
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

  refresh(args): void {
    if (args.eventSnapshots && args.eventSnapshots.length > 0) {
      for (let j = 0; j < args.eventSnapshots.length; j++) {
        if (args.eventSnapshots[j].eventType === 'AgentStateChanged') {
          this.getData();
          break;
        }
      }
    }
  }

  ngOnInit(): void {
    self = this;
    this.translate.get('monitor.label.inHours').subscribe(translatedValue => {
      this.yAxisLabel = translatedValue;
    });
    this.dateFormat = this.coreService.getDateFormat(this.preferences.dateFormat);
    this.init();
  }

  ngOnDestroy(): void {
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
  }

  init(): void {
    if (this.filters.filter.view !== 'Custom') {
      this.renderTimeSheetHeader();
    } else{
      this.getData();
    }
  }

  private getData(): void {
    const d = new Date(this.filters.filter.endDate).setDate(this.filters.filter.endDate.getDate() + 1);
    this.coreService.post('monitoring/agents', {
      controllerId: this.filters.current ? this.schedulerIds.selected : '',
      dateFrom: this.filters.filter.startDate,
      dateTo: new Date(d),
      timeZone: this.preferences.zone
    }).subscribe((res: any) => {
      this.data = res.controllers;
      this.isLoaded = true;
      this.checkMissingDates();
    }, () => {
      this.isLoaded = true;
    });
  }

  changeController(): void{
    this.getData();
  }

  groupBy(): void {
    if (this.filters.filter.groupBy !== 'DATE') {
      let tempArr = [];
      this.groupByData.forEach((item) => {
        tempArr = tempArr.concat(item.value);
      });
      this.getOverviewData(this.groupByPipe.transform(tempArr, 'controllerId'));
    } else{
      this.getOverviewData(this.groupByData);
    }
  }

  setView(view): void {
    this.filters.filter.view = view;
    if (view !== 'Custom') {
      this.renderTimeSheetHeader();
    } else {
      this.filters.filter.dateRange = [this.filters.filter.startDate, this.filters.filter.endDate];
    }
  }

  onChangeDate(): void {
    if (this.filters.filter.dateRange) {
      this.filters.filter.startDate = this.filters.filter.dateRange[0];
      this.filters.filter.endDate = this.filters.filter.dateRange[1];
      this.getData();
    }
  }

  setViewSize(len): void {
    this.view = this.statisticsData.length > 10 ? [(32 * len * this.statisticsData.length), 260] :
      (this.chartArea.nativeElement.offsetWidth && this.chartArea.nativeElement.offsetWidth > 500)
      ? [(this.chartArea.nativeElement.offsetWidth - 34), 260] : null;
    if (!this.view && this.chartArea.nativeElement.offsetWidth === 0) {
      setTimeout(() => {
        this.setViewSize(len);
      }, 100);
    }
    this.groupPadding = this.statisticsData.length > 10 ? 4 : 16;
  }

  customColors(): any {
    self.toggle = !self.toggle;
    return self.toggle ? 'rgb(122,185,122)' : '#ef486a';
  }

  prev(): void {
    if (this.filters.filter.view === 'Month') {
      this.filters.filter.startMonth = this.filters.filter.startMonth - 1;
    } else {
      this.filters.filter.endDate.setDate(this.filters.filter.endDate.getDate() - 8);
    }
    this.renderTimeSheetHeader();
  }

  next(): void {
    if (this.filters.filter.view === 'Month') {
      this.filters.filter.startMonth = this.filters.filter.startMonth + 1;
    } else {
      this.filters.filter.endDate.setDate(this.filters.filter.endDate.getDate() + 1);
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

  private getOverviewData(groupByData): void {
    this.agents = [];
    let count = 0;
    const reverseData = groupByData.reverse();
    reverseData.forEach((item) => {
      const parentObj: any = {
        id: ++count,
        isParent: true,
        start: '00:15',
        end: '25:00',
        statusList: []
      };
      parentObj[this.filters.filter.groupBy === 'DATE' ? 'date' : 'controllerId'] = item.key;
      this.agents.push(parentObj);
      const values = this.groupByPipe.transform(item.value, this.filters.filter.groupBy === 'DATE' ? 'agentId' : 'date');
      for (const i in values) {
        if (this.filters.filter.groupBy === 'CONTROLLERID') {
          const agents = this.groupByPipe.transform(values[i].value, 'agentId');
          for (const a in agents) {
            if (agents[a]) {
              const obj: any = {
                id: ++count,
                parentID: parentObj.id,
                date: values[i].key,
                agentId: agents[a].key,
                start: '00:15',
                end: '25:00',
                statusList: []
              };
              this.updateStatusList(agents[a], obj);
            }
          }
        } else {
          const obj: any = {
            id: ++count,
            parentID: parentObj.id,
            agentId: values[i].key,
            start: '00:15',
            end: '25:00',
            statusList: []
          };
          this.updateStatusList(values[i], obj);
        }
      }
    });
  }

  private isAlreadyExist(value, data): boolean {
    let isMatch = false;
    for (const y in value) {
      if (value[y].readyTime === data.readyTime && value[y].agentId === data.agentId) {
        isMatch = true;
        break;
      }
    }
    return isMatch;
  }

  private checkMissingDates(): void{
    this.groupByData = [];
    const map = new Map();
    this.data.forEach((controller) => {
      for (const i in controller.agents) {
        if (controller.agents[i]) {
          if (controller.agents[i].previousEntry) {
            const startDate = new Date(this.filters.filter.startDate).setHours(0, 0, 0, 0);
            if (startDate > new Date(controller.agents[i].previousEntry.readyTime).getTime()) {
              const obj = {
                controllerId: controller.controllerId,
                agentId: controller.agents[i].agentId,
                url: controller.agents[i].url,
                date: this.coreService.getDateByFormat(startDate, this.preferences.zone, 'YYYY-MM-DD'),
                readyTime: startDate,
                lastKnownTime: null,
                isShutdown: false
              };
              if (controller.agents[i].previousEntry.lastKnownTime) {
                if (startDate < new Date(controller.agents[i].previousEntry.lastKnownTime).getTime()) {
                  obj.lastKnownTime = controller.agents[i].previousEntry.lastKnownTime;
                } else {
                  obj.readyTime = new Date(this.filters.filter.startDate).setHours(23, 59, 59, 59);
                  obj.isShutdown = true;
                }
              }
              let arr = [obj];
              if (map.has(obj.date)) {
                arr = arr.concat(JSON.parse(map.get(obj.date)));
              }
              map.set(obj.date, JSON.stringify(arr));
            }
          }
          for (const j in controller.agents[i].entries) {
            if (controller.agents[i].entries[j].readyTime === controller.agents[i].entries[j].lastKnownTime) {
              const d = new Date(controller.agents[i].entries[j].readyTime);
              controller.agents[i].entries[j].lastKnownTime = d.setSeconds(d.getSeconds() + 1);
            }
            const obj = {
              controllerId: controller.controllerId,
              agentId: controller.agents[i].agentId,
              url: controller.agents[i].url,
              date: this.coreService.getDateByFormat(controller.agents[i].entries[j].readyTime, this.preferences.zone, 'YYYY-MM-DD'),
              totalRunningTime: controller.agents[i].entries[j].totalRunningTime,
              readyTime: controller.agents[i].entries[j].readyTime,
              lastKnownTime: controller.agents[i].entries[j].lastKnownTime
            };
            this.groupByData.push(obj);
          }
        }
      }
    });

    const groupByAgent = this.coreService.clone(this.groupByPipe.transform(this.groupByData, 'agentId'));
    this.groupByData = this.groupByPipe.transform(this.groupByData, 'date');
    this.getStatisticsData(map);
    this.groupBy();
    this.getRunningTime(groupByAgent);
  }

  getRunningTime(data): void {
    if (data.length === 0) {
      let arr = [];
      this.groupByData.forEach((date) => {
        arr = arr.concat(date.value);
      });
      if (arr.length > 0) {
        data = this.groupByPipe.transform(arr, 'agentId');
      }
    }
    this.runningTime = [];
    data.forEach((agent) => {
      agent.value = sortBy(agent.value, (i: any) => {
        return i.readyTime;
      });
      const obj: any = {
        agentId: agent.key,
      };
      if (agent.value.length > 0) {
        const lastEntry = agent.value[agent.value.length - 1];
        if (lastEntry) {
          let lastDate = this.filters.filter.endDate;
          let dur1 = 86400000;
          if (new Date(this.viewDate).getTime() < new Date(lastDate).getTime()) {
            lastDate = this.viewDate;
            dur1 = 0;
          }
          obj.total = (differenceInMilliseconds(lastDate,
            this.filters.filter.startDate) + (dur1));
          if (this.coreService.getDateByFormat(this.filters.filter.startDate, this.preferences.zone, 'YYYY-MM-DD') === this.coreService.getDateByFormat(this.viewDate, this.preferences.zone, 'YYYY-MM-DD')) {
            //obj.total -= (1000 * 60 * 60 * 24);
          }
          if (isNaN(lastEntry.totalRunningTime)) {
            if (lastEntry.isShutdown) {
              lastEntry.totalRunningTime = 0;
            } else {
              lastEntry.totalRunningTime = ((this.groupByData.length - 1) * 24 * 60 * 60 * 1000) +
                moment.duration(this.coreService.getDateByFormat(new Date(), this.preferences.zone, 'HH:mm:ss')).asMilliseconds();
            }
          }
          obj.time = lastEntry.totalRunningTime;
          obj.value = Math.round((obj.time * 100) / obj.total);
          obj.hours = ((obj.total) / (1000 * 60 * 60 * 24)).toFixed(2);
          if (isNaN(obj.value)) {
            obj.value = 0;
          }
          this.runningTime.push(obj);
        }
      }
    });
  }

  private getStatisticsData(map): void {
    this.statisticsData = [];
    const dates = this.coreService.getDates(this.filters.filter.startDate, this.filters.filter.endDate);
    let len = 1;
    const tempArr = [];
    for (let i = 0; i < dates.length; i++) {
      const today = new Date().setHours(0, 0, 0, 0);
      if (today < dates[i]) {
        break;
      } else {
        let flag = false;
        const date = this.coreService.getDateByFormat(dates[i], this.preferences.zone, 'YYYY-MM-DD');
        for (const j in this.groupByData) {
          if (date === this.groupByData[j].key) {
            flag = true;
            if (map && map.size > 0) {
              if (map.has(date)) {
                this.groupByData[j].value = this.groupByData[j].value.concat(JSON.parse(map.get(date)));
              }
            }
            this.groupByData[j].value = sortBy(this.groupByData[j].value, (x: any) => {
              return x.readyTime;
            });
            tempArr.push(this.groupByData[j]);
            if (len < this.groupByData[j].value.length) {
              len = this.groupByData[j].value.length;
            }
            break;
          }
        }
        if (!flag) {
          const mainObj = {
            key: date,
            value: []
          };
          if (i > 0) {
            const x = tempArr[i - 1].value;
            if (x.length > 0) {
              x.forEach((data) => {
                if (data.isShutdown) {
                  const copyObj = this.coreService.clone(data);
                  copyObj.date = date;
                  copyObj.readyTime = new Date(date).setHours(23, 59, 59, 59);
                  copyObj.lastKnownTime = null;
                  copyObj.isShutdown = true;
                  if (!this.isAlreadyExist(mainObj.value, copyObj)) {
                    mainObj.value.push(copyObj);
                  }
                } else {
                  const couplingFailedDate = this.coreService.getDateByFormat(data.lastKnownTime, this.preferences.zone, 'YYYY-MM-DD');
                  if (this.coreService.getDateByFormat(data.readyTime, this.preferences.zone, 'YYYY-MM-DD') !== couplingFailedDate) {
                    const copyObj = this.coreService.clone(data);
                    copyObj.date = date;
                    data.lastKnownTime = null;
                    copyObj.readyTime = new Date(date).setHours(0, 0, 0, 0);
                    if (!this.isAlreadyExist(mainObj.value, copyObj)) {
                      mainObj.value.push(copyObj);
                    }
                  }
                }
              });
            }
          } else {
            if (map && map.size > 0) {
              if (map.has(date)) {
                mainObj.value = mainObj.value.concat(JSON.parse(map.get(date)));
              }
            }
          }
          tempArr.push(mainObj);
        }

        if (i > 0) {
          const prev = tempArr[i - 1].value;
          const length = tempArr[i].value.length;
          for (let j = 0; j < prev.length; j++) {
            for (let x = 0; x < length; x++) {
              if (prev[j].agentId === tempArr[i].value[x].agentId && prev[j].readyTime !== tempArr[i].value[x].readyTime) {
                if (prev[j].lastKnownTime) {
                  const couplingFailedDate = this.coreService.getDateByFormat(prev[j].lastKnownTime, this.preferences.zone, 'YYYY-MM-DD');
                  if (couplingFailedDate === tempArr[i].value[x].date || (new Date(couplingFailedDate).setHours(0, 0, 0, 0) > new Date(tempArr[i].value[x].date).setHours(0, 0, 0, 0))) {
                    const copyPrevObj = this.coreService.clone(prev[j]);
                    prev[j].lastKnownTime = null;
                    copyPrevObj.date = tempArr[i].value[x].date;
                    copyPrevObj.readyTime = new Date(copyPrevObj.date).setHours(0, 0, 0, 0);
                    if (!this.isAlreadyExist(tempArr[i].value, copyPrevObj)) {
                      tempArr[i].value.push(copyPrevObj);
                    }
                  }
                }
              }
            }
          }
          if (length === 0) {
            tempArr[i].value = this.coreService.clone(prev);
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
                  item.isShutdown = true;
                }
              } else{
                item.readyTime = new Date(tempArr[i].key).setHours(0, 0, 0, 0);
              }
            });
          }
        }

        this.updateSeries(tempArr[i]);
      }
    }
    this.groupByData = tempArr;
    this.setViewSize(len);
  }

  private updateSeries(item): void {
    const values = this.groupByPipe.transform(item.value, 'agentId');
    const obj = {
      name: item.key,
      series: []
    };

    for (let i = 0; i < values.length; i++) {
      const statusObj: any = {
        value: 0,
        name: values[i].key,
      };
      let dur = 0;
      values[i].value.forEach((time) => {
        const startTimeInSec = time.isShutdown ? 86399 :
          moment.duration(this.coreService.getDateByFormat(time.readyTime, this.preferences.zone, 'HH:mm:ss')).asSeconds();
        let endTimeInSec = 86400;
        if (this.coreService.getDateByFormat(this.viewDate, this.preferences.zone, 'YYYY-MM-DD') === item.key) {
          endTimeInSec = moment.duration(this.coreService.getDateByFormat(this.viewDate, this.preferences.zone, 'HH:mm:ss')).asSeconds();
        }
        if (time.lastKnownTime) {
          const couplingFailedDate = this.coreService.getDateByFormat(time.lastKnownTime, this.preferences.zone, 'YYYY-MM-DD');
          if (this.coreService.getDateByFormat(time.readyTime, this.preferences.zone, 'YYYY-MM-DD') === couplingFailedDate) {
            endTimeInSec = moment.duration(this.coreService.getDateByFormat(time.lastKnownTime, this.preferences.zone, 'HH:mm:ss')).asSeconds();
          }
        }
        dur += (endTimeInSec - startTimeInSec);
      });
      if (dur > 86400) {
        dur = dur - 86400;
      }
      if (dur < 0){
        dur = 0;
      }

      let dur1;
      if (this.coreService.getDateByFormat(this.viewDate, this.preferences.zone, 'YYYY-MM-DD') === item.key) {
        dur1 = moment.duration(this.coreService.getDateByFormat(this.viewDate, this.preferences.zone, 'HH:mm:ss')).asSeconds();
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
      if (parseInt(statusObj2.value, 10) < parseInt(statusObj.value, 10)){
        obj.series.push(statusObj);
        obj.series.push(statusObj2);
      } else{
        obj.series.push(statusObj2);
        obj.series.push(statusObj);
      }

    }
    this.statisticsData.push(obj);
  }

  private updateStatusList(data, obj): void {
    data.value.forEach((time) => {
      if (!time.isShutdown) {
        if (this.filters.filter.groupBy === 'DATE') {
          obj.controllerId = time.controllerId;
        }
        obj.url = time.url;
        const statusObj = {
          start: this.coreService.getDateByFormat(time.readyTime, this.preferences.zone, 'HH:mm:ss'),
          end: '25:00',
          color: 'rgb(122,185,122)'
        };
        const readyTimeDate = this.coreService.getDateByFormat(time.readyTime, this.preferences.zone, 'YYYY-MM-DD');
        if (time.lastKnownTime) {
          if (readyTimeDate === this.coreService.getDateByFormat(time.lastKnownTime, this.preferences.zone, 'YYYY-MM-DD')) {
            statusObj.end = this.coreService.getDateByFormat(time.lastKnownTime, this.preferences.zone, 'HH:mm:ss');
          }
        } else {
          if (this.coreService.getDateByFormat(this.viewDate, this.preferences.zone, 'YYYY-MM-DD') === readyTimeDate) {
            statusObj.end = this.coreService.getDateByFormat(this.viewDate, this.preferences.zone, 'HH:mm:ss');
          }
        }
        obj.statusList.push(statusObj);
      }
    });
    this.agents.push(obj);
  }

  disabledDate = (current: Date): boolean => {
    // Can not select days before today and today
    return differenceInCalendarDays(current, this.viewDate) > 0;
  }

  getValue(val): string {
    return val + ' %';
  }

  getColor(): string {
    return 'rgb(122,185,122)';
  }
}
