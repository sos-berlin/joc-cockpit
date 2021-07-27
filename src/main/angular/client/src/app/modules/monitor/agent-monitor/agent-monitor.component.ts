import {Component, OnInit, OnDestroy, Input, ViewChild, ElementRef} from '@angular/core';
import {Subscription} from 'rxjs';
import {differenceInCalendarDays} from 'date-fns';
import {CoreService} from '../../../services/core.service';
import {DataService} from '../../../services/data.service';
import {AuthService} from '../../../components/guard';
import {GroupByPipe} from '../../../pipes/core.pipe';
import * as moment from 'moment-timezone';
import {sortBy} from 'underscore';
import {TranslateService} from '@ngx-translate/core';

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
    this.translate.get('monitor.label.inHours').subscribe(translatedValue => {
      this.yAxisLabel = translatedValue;
    });
    this.renderTimeSheetHeader();
  }

  ngOnDestroy(): void {
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
  }

  private getData(): void {
    this.coreService.post('monitoring/agents', {
      controllerId: this.filters.current ? this.schedulerIds.selected : '',
      dateFrom: this.filters.filter.startDate,
      dateTo: this.filters.filter.endDate,
      timeZone: this.preferences.zone
    }).subscribe((res: any) => {
      this.data = res.controllers;
      this.isLoaded = true;
      this.groupBy();
      this.getStatisticsData();
    }, () => {
      this.isLoaded = true;
    });
  }

  changeController(): void{
    this.getData();
  }

  groupBy(): void {
    this.groupByData = [];
    this.data.forEach((controller) => {
      for (const i in controller.agents) {
        for (const j in controller.agents[i].entries) {
          const obj = {
            controllerId: controller.controllerId,
            agentId: controller.agents[i].agentId,
            url: controller.agents[i].url,
            date: this.coreService.getDateByFormat(controller.agents[i].entries[j].readyTime, this.preferences.zone, 'YYYY-MM-DD'),
            readyTime: controller.agents[i].entries[j].readyTime,
            couplingFailedTime: controller.agents[i].entries[j].couplingFailedTime,
            couplingFailedMessage: controller.agents[i].entries[j].couplingFailedMessage,
          };
          this.groupByData.push(obj);
        }
      }
    });
    const gData = this.groupByPipe.transform(this.groupByData, 'date');
    if (this.filters.filter.groupBy !== 'DATE') {
      this.getOverviewData(this.groupByPipe.transform(this.groupByData, 'controllerId'));
    } else{
      this.getOverviewData(gData);
    }
    this.groupByData = gData;
  }

  setView(view): void {
    this.filters.filter.view = view;
    this.renderTimeSheetHeader();
  }

  setViewSize(len): void {
    this.view = this.statisticsData.length > 15 ? [(32 * len * this.statisticsData.length), 260] : (this.chartArea.nativeElement.offsetWidth && this.chartArea.nativeElement.offsetWidth > 500)
      ? [(this.chartArea.nativeElement.offsetWidth - 34), 260] : null;
    this.groupPadding = this.statisticsData.length > 15 ? 4 : 16;
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
            headerDates.push(new Date(currentDate.setHours(0, 0, 0, 0)));
          }
          currentDate.setDate(date + 1);
        }
        while (currentDate.getDay() !== weekStart);
      }
    } else {
      do {
        const date = currentDate.getDate();
        headerDates.push(new Date(currentDate.setHours(0, 0, 0, 0)));
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
    groupByData.forEach((item) => {
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

  private getStatisticsData(): void {
    this.statisticsData = [];
    const dates = this.coreService.getDates(this.filters.filter.startDate, this.filters.filter.endDate);
    let len = 1;
    this.groupByData.forEach((item) => {
      const values = this.groupByPipe.transform(item.value, 'agentId');
      if (len < values.length) {
        len = values.length;
      }
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
    this.setViewSize(len);
  }

  private updateStatusList(data, obj): void {
    console.log(data.value);
    data.value.forEach((time) => {
      if (this.filters.filter.groupBy === 'DATE') {
        obj.controllerId = time.controllerId;
      }
      obj.url = time.url;
      const statusObj = {
        start: this.coreService.getDateByFormat(time.readyTime, this.preferences.zone, 'HH:mm:SS'),
        end: '25:00',
        color: 'rgb(122,185,122)'
      };
      const readyTimeDate = this.coreService.getDateByFormat(time.readyTime, this.preferences.zone, 'YYYY-MM-DD');
      if (time.couplingFailedTime) {
        if (readyTimeDate === this.coreService.getDateByFormat(time.couplingFailedTime, this.preferences.zone, 'YYYY-MM-DD')) {
          statusObj.end = this.coreService.getDateByFormat(time.couplingFailedTime, this.preferences.zone, 'HH:mm:SS');
        } else {
          console.log(time.readyTime, time.couplingFailedTime);
        }
      } else{
        if (this.coreService.getDateByFormat(this.viewDate, this.preferences.zone, 'YYYY-MM-DD') === readyTimeDate) {
          statusObj.end = this.coreService.getDateByFormat(this.viewDate, this.preferences.zone, 'HH:mm:SS');
        }
      }
      obj.statusList.push(statusObj);
    });
    this.agents.push(obj);
  }

  disabledDate = (current: Date): boolean => {
    // Can not select days before today and today
    return differenceInCalendarDays(current, this.viewDate) > 0;
  }
}
