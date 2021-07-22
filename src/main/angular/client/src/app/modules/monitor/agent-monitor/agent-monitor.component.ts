import {Component, OnInit, OnDestroy, Input} from '@angular/core';
import {Subscription} from 'rxjs';
import {differenceInCalendarDays} from 'date-fns';
import {CoreService} from '../../../services/core.service';
import {DataService} from '../../../services/data.service';
import {AuthService} from '../../../components/guard';
import {GroupByPipe} from '../../../pipes/core.pipe';

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

  isLoaded = false;
  agents = [];
  data = [];
  groupByData = [];

  viewDate: Date = new Date();
  dateFormat: string;
  weekStart = 1;

  subscription1: Subscription;

  constructor(private coreService: CoreService, private authService: AuthService,
              private groupByPipe: GroupByPipe, private dataService: DataService) {
    this.subscription1 = dataService.eventAnnounced$.subscribe(res => {
      this.refresh(res);
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
    this.renderTimeSheetHeader();
  }

  ngOnDestroy(): void {
    this.subscription1.unsubscribe();
  }

  private getData(): void {
    this.coreService.post('monitoring/agents', {
      controllerId: this.filters.filter.controllerId ? this.filters.filter.controllerId : '',
      dateFrom: this.filters.filter.startDate,
      dateTo: this.filters.filter.endDate,
      timeZone: this.preferences.zone
    }).subscribe((res: any) => {
      this.data = res.controllers;
      this.isLoaded = true;
      this.groupBy();
    }, () => {
      this.isLoaded = true;
    });
  }

  changeController(): void{
    this.getData();
  }

  groupBy(): void {
    this.groupByData = [];
    this.isLoaded = true;
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
    this.groupByData = this.groupByPipe.transform(this.groupByData, this.filters.filter.groupBy === 'DATE' ? 'date' : 'controllerId');
    this.getStatisticsData();
  }

  setView(view): void {
    this.filters.filter.view = view;
    this.renderTimeSheetHeader();
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

  private getStatisticsData(): void {
    this.agents = [];
    let count = 0;
    this.groupByData.forEach((item) => {
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

  private updateStatusList(data, obj): void {
    data.value.forEach((time, index) => {
      if (this.filters.filter.groupBy === 'DATE') {
        obj.controllerId = time.controllerId;
      }
      obj.url = time.url;
      const statusObj = {
        start: index === 0 ? '00:00' : this.coreService.getDateByFormat(data.value[index - 1].couplingFailedTime, this.preferences.zone, 'HH:mm:SS'),
        end: this.coreService.getDateByFormat(time.readyTime, this.preferences.zone, 'HH:mm:SS'),
        color: '#ff3232',
        tooltip: time.couplingFailedMessage
      };
      obj.statusList.push(statusObj);
    });
    this.agents.push(obj);
  }

  disabledDate = (current: Date): boolean => {
    // Can not select days before today and today
    return differenceInCalendarDays(current, this.viewDate) > 0;
  }
}
