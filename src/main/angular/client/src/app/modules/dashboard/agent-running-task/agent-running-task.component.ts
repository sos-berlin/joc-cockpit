import {Component, OnInit, OnDestroy, Input} from '@angular/core';
import {Subscription} from 'rxjs';
import {CoreService} from '../../../services/core.service';
import {DataService} from '../../../services/data.service';
import {AuthService} from '../../../components/guard';

@Component({
  selector: 'app-agent-running-task',
  templateUrl: './agent-running-task.component.html'
})
export class AgentRunningTaskComponent implements OnInit, OnDestroy {
  @Input('layout') layout: any;

  isLoaded = false;
  schedulerIds: any;
  data = [];
  view: any[] = [560, 150];
  subscription1: Subscription;
  subscription2: Subscription;
  colorScheme = {
    domain: ['rgb(122,185,122)']
  };

  constructor(private coreService: CoreService, private authService: AuthService, private dataService: DataService) {
    this.subscription1 = dataService.eventAnnounced$.subscribe(res => {
      this.refresh(res);
    });
    this.subscription2 = dataService.refreshWidgetAnnounced$.subscribe((res) => {
      if (res) {
        for (let i = 0; i < res.length; i++) {
          if (res[i].name === 'agentClusterRunningTasks') {
            this.layout = res[i];
            this.setViewSize(window);
            this.getRunningTask();
            break;
          }
        }
      }
    });
  }

  refresh(args): void {
    if (args.eventSnapshots && args.eventSnapshots.length > 0) {
      for (let j = 0; j < args.eventSnapshots.length; j++) {
        if (args.eventSnapshots[j].eventType === 'JobStateChanged' || args.eventSnapshots[j].eventType === 'AgentStateChanged' ||
          args.eventSnapshots[j].eventType === 'ProxyCoupled' || args.eventSnapshots[j].eventType === 'ProxyDecoupled') {
          this.getRunningTask();
          break;
        }
      }
    }
  }

  ngOnInit(): void {
    this.schedulerIds = JSON.parse(this.authService.scheduleIds) || {};
    if (this.schedulerIds.selected) {
      this.getRunningTask();
    } else {
      this.isLoaded = true;
    }
    this.setViewSize(window);
  }

  onResize(event): void {
    this.setViewSize(event.target);
  }

  private setViewSize(target): void {
    const w = target.innerWidth / 12;
    this.view[0] = w * this.layout.cols - 90;
    this.view[1] = (this.layout.rows * 50 + ((this.layout.rows - 1) * 20 - 50)) - 6;
  }

  ngOnDestroy(): void {
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
  }

  agentClusterRunningTaskGraph(res): void {
    this.data = [];
    for (let i = 0; i < res.agents.length; i++) {
      this.data.push({name: res.agents[i].agentName, value: res.agents[i].runningTasks});
    }
  }

  getRunningTask(): void {
    this.coreService.post('agents', {
      controllerId: this.schedulerIds.selected,
      compact: true,
      states: ['COUPLED', 'RESETTING', 'RESET']
    }).subscribe({
      next: (res: any) => {
        this.agentClusterRunningTaskGraph(res);
        this.isLoaded = true;
      }, error: () => this.isLoaded = true
    });
  }
}
