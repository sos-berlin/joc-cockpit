import {Component, OnInit, OnDestroy, Input} from '@angular/core';
import {Subscription} from 'rxjs';
import {differenceInCalendarDays} from 'date-fns';
import {CoreService} from '../../../services/core.service';
import {DataService} from '../../../services/data.service';
import {AuthService} from '../../../components/guard';

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
  viewDate: Date = new Date();
  dateFormat: string;
  weekStart = 1;

  subscription1: Subscription;

  constructor(private coreService: CoreService, private authService: AuthService, private dataService: DataService) {
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
    this.getData();
  }

  ngOnDestroy(): void {
    this.subscription1.unsubscribe();
  }

  private getData(): void {
    console.log('Agent  >>> From :', this.filters.filter.startDate, 'To :', this.filters.filter.endDate);
    this.agents = [
      {
        id: 1,
        controllerId: 'testsuite',
        agentId: '',
        isParent: true,
        url: '',
        date: '',
        start: '00:15',
        end: '25:00',
        statusList: [
        ]
      },
      {
        id: 2,
        controllerId: '',
        agentId: 'agent1',
        parentID: 1,
        url: 'http://localhost:7445',
        date: '2021-07-16',
        start: '00:15',
        end: '25:00',
        statusList: [
          {
            start: '10:19:36',
            end: '12:00:36',
            color: '#ff3232',
            tooltip: 'akka.stream.StreamTcpException: Tcp command [Connect(localhost:7446,None,List(),Some(10 seconds),true)] failed because of java.net.ConnectException: Connection refused: no further information [suppressed: TCP Connect localhost:7446: Connection refused: no further information]'
          },
          {
            start: '18:19:36',
            end: '20:00:36',
            color: '#ff3232',
            tooltip: 'akka.stream.StreamTcpException: Tcp command [Connect(localhost:7446,None,List(),Some(10 seconds),true)] failed because of java.net.ConnectException: Connection refused: no further information [suppressed: TCP Connect localhost:7446: Connection refused: no further information]'
          }
        ]
      },
      {
        id: 3,
        controllerId: '',
        agentId: 'agent2',
        parentID: 1,
        url: 'http://localhost:7446',
        date: '2021-07-15',
        start: '00:15',
        end: '25:00',
        statusList: [
          {
            start: '11:54',
            color: '#ff3232',
            tooltip: 'akka.stream.StreamTcpException: Tcp command [Connect(localhost:7446,None,List(),Some(10 seconds),true)] failed because of java.net.ConnectException: Connection refused: no further information [suppressed: TCP Connect localhost:7446: Connection refused: no further information]',
            end: '12:30'
          }
        ]
      },
      {
        id: 4,
        controllerId: 'testsuite',
        agentId: '',
        isParent: true,
        url: '',
        date: '',
        start: '00:15',
        end: '25:00',
        statusList: [
        ]
      },
      {
        id: 5,
        controllerId: '',
        parentID: 4,
        agentId: 'agent3',
        url: 'http://localhost:7445',
        date: '2021-07-13',
        start: '00:15',
        end: '25:00',
        statusList: [
          {
            start: '10:59:27',
            color: '#ff3232',
            end: '11:49:46',
            tooltip: 'akka.stream.StreamTcpException: Tcp command [Connect(localhost:7446,None,List(),Some(10 seconds),true)] failed because of java.net.ConnectException: Connection refused: no further information [suppressed: TCP Connect localhost:7446: Connection refused: no further information]'
          }
        ]
      }
    ];
    setTimeout(() => {
      this.isLoaded = true;
    }, 1000);
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

  disabledDate = (current: Date): boolean => {
    // Can not select days before today and today
    return differenceInCalendarDays(current, this.viewDate) > 0;
  }
}
