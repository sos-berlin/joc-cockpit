import {Component, OnInit, OnDestroy, Input} from '@angular/core';
import {Subscription} from 'rxjs';
import { differenceInCalendarDays } from 'date-fns';
import {CoreService} from '../../../services/core.service';
import {AuthService} from '../../../components/guard';
import {DataService} from '../../../services/data.service';

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
  statisticsData: any[];
  tasks = [];

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
      date: '-1d',
      text: 'yesterday'
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
    domain: ['#5AA454', '#C7B42C', '#AAAAAA']
  };

  subscription: Subscription;

  constructor(private authService: AuthService, public coreService: CoreService, private dataService: DataService) {
    this.subscription = dataService.eventAnnounced$.subscribe(res => {
      this.refresh(res);
    });
  }

  ngOnInit(): void {
    this.init();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  init(): void {
    this.dateFormat = this.coreService.getDateFormat(this.preferences.dateFormat);
    this.getRunningTime();
    this.renderTimeSheetHeader('overview');
    this.renderTimeSheetHeader('statistics');
  }

  refresh(args): void {
    if (args.eventSnapshots && args.eventSnapshots.length > 0) {
      for (let j = 0; j < args.eventSnapshots.length; j++) {
        if (args.eventSnapshots[j].eventType === 'ControllerStateChanged') {

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

  private getRunningTime(): void {
    if (this.filters.runningTime.filter.date === '-1d') {
      this.runningTime = [{
        controllerId: 'testsuite',
        time: 81400000,
        total: 86400000,
      }, {
        controllerId: 'standalone',
        time: 84400000,
        total: 86400000,
      }];
    } else if (this.filters.runningTime.filter.date === '-7d') {
      this.runningTime = [{
        controllerId: 'testsuite',
        time: 504800000,
        total: 604800000,
      }, {
        controllerId: 'standalone',
        time: 524800000,
        total: 604800000,
      }];
    } else if (this.filters.runningTime.filter.date === '-30d') {
      this.runningTime = [{
        controllerId: 'testsuite',
        time: 1504255511,
        total: 1674255511,
      }, {
        controllerId: 'standalone',
        time: 1404255511,
        total: 1674255511,
      }];
    } else {
      this.runningTime = [{
        controllerId: 'testsuite',
        time: 1574255511,
        total: 1674255511,
      }, {
        controllerId: 'standalone',
        time: 1474255511,
        total: 1674255511,
      }];
    }

    this.runningTime.forEach((item) => {
      item.value = Math.round((item.time * 100) / item.total);
      item.hours = this.coreService.getTimeFromNumber(item.total);
    });
  }

  private getStatisticsData(): void {
    console.log('Statistics >>> From :', this.filters.statistics.filter.startDate, 'To :', this.filters.statistics.filter.endDate);
    this.statisticsData = [
      {
        "name": "01/07/2021",
        "series": [
          {
            "name": "testsuit",
            "value": 23
          },
          {
            "name": "standalone",
            "value": 22
          }
        ]
      },
      {
        "name": "02/07/2021",
        "series": [
          {
            "name": "testsuit",
            "value": 22
          },
          {
            "name": "standalone",
            "value": 10
          }
        ]
      },
      {
        "name": "04/07/2021",
        "series": [
          {
            "name": "testsuit",
            "value": 21
          },
          {
            "name": "standalone",
            "value": 22.5
          }
        ]
      },
      {
        "name": "07/07/2021",
        "series": [
          {
            "name": "testsuit",
            "value": 24
          },
          {
            "name": "standalone",
            "value": 23.55
          }
        ]
      }
    ];
    this.isLoaded = true;
  }

  private getOverviewData(): void {
    console.log('Overview >>> From :', this.filters.overview.filter.startDate, 'To :', this.filters.overview.filter.endDate);
    this.tasks = [
      {
        id: 1,
        label: 'testsuite',
        url: 'http://localhost:7444',
        date: '2021-07-06',
        start: '00:15',
        end: '25:00',
        statusList: [
          {
            start: '18:19:36',
            color: '#ff0000'
          }, {
            start: '20:00:36',
            color: '#ff0000'
          }
        ]
      },
      {
        id: 2,
        label: 'testsuite',
        url: 'http://localhost:7444',
        date: '2021-07-05',
        start: '00:15',
        end: '25:00',
        statusList: [
          {
            start: '11:54',
            color: '#ff0000'
          },
          {
            start: '12:30',
            color: '#ff0000'
          }
        ]
      },
      {
        id: 3,
        label: 'standalone',
        url: 'http://localhost:7544',
        date: '2021-07-03',
        start: '00:15',
        end: '25:00',
        statusList: [
          {
            start: '10:55:27',
            color: '#ff0000'
          },
          {
            start: '11:49:46',
            color: '#ff0000'
          }
        ]
      }
    ];
    this.isLoaded = true;
  }

  setView(view, type): void {
    this.filters[type].filter.view = view;
    this.renderTimeSheetHeader(type);
  }

  prev(type): void {
    if (this.filters[type].filter.view === 'Month') {
      this.filters[type].filter.startMonth = this.filters[type].filter.startMonth - 1;
    } else {
      this.filters[type].filter.endDate.setDate(this.filters[type].filter.endDate.getDate() - 8);
    }
    this.renderTimeSheetHeader(type);
  }

  next(type): void {
    if (this.filters[type].filter.view === 'Month') {
      this.filters[type].filter.startMonth = this.filters[type].filter.startMonth + 1;
    } else {
      this.filters[type].filter.endDate.setDate(this.filters[type].filter.endDate.getDate() + 1);
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
    this.filters[type].filter.startDate = headerDates[0];
    this.filters[type].filter.endDate = headerDates[headerDates.length - 1];
    if (type === 'overview') {
      this.getOverviewData();
    } else {
      this.getStatisticsData();
    }
  }

  disabledDate = (current: Date): boolean => {
    // Can not select days before today and today
    return differenceInCalendarDays(current, this.viewDate) > 0;
  }

  getValue(val): string {
    return val + '%';
  }

  getColor(): string {
    return '#5AA454';
  }

  onSelect(data): void {
    console.log('Item clicked', JSON.parse(JSON.stringify(data)));
  }

}
