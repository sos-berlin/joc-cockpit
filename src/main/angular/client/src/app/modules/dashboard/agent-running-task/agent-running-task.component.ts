import {Component, OnInit, OnDestroy, Input, OnChanges, SimpleChanges} from '@angular/core';
import {CoreService} from '../../../services/core.service';
import {DataService} from '../../../services/data.service';
import {Subscription} from 'rxjs';
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
    domain: ['rgb(168, 56, 93)', 'rgb(122, 163, 229)', 'rgb(162, 126, 168)', 'rgb(170, 227, 245)']
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

  refresh(args) {
    if (args.eventSnapshots && args.eventSnapshots.length > 0) {
      for (let j = 0; j < args.eventSnapshots.length; j++) {
        if (args.eventSnapshots[j].eventType === 'AgentAdded' || args.eventSnapshots[j].eventType === 'AgentUpdated'
          || args.eventSnapshots[j].eventType === 'JobStateChanged') {
          this.getRunningTask();
          break;
        }
      }
    }
  }

  ngOnInit() {
    this.schedulerIds = JSON.parse(this.authService.scheduleIds) || {};
    if (this.schedulerIds.selected) {
      this.getRunningTask();
    } else {
      this.isLoaded = true;
    }
    this.setViewSize(window);
  }

  onResize(event) {
    this.setViewSize(event.target);
  }

  private setViewSize(target) {
    let w = target.innerWidth / 12;
    this.view[0] = w * this.layout.cols - 90;
    this.view[1] = (this.layout.rows * 50 + ((this.layout.rows - 1) * 20 - 50)) - 6;
  }

  ngOnDestroy() {
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
  }

  agentClusterRunningTaskGraph(res) {
    this.data = [];
    for (let i = 0; i < res.agents.length; i++) {
      this.data.push({name: res.agents[i].agentName, value: res.agents[i].runningTasks});
    }
  }

  getRunningTask(): void {
    this.coreService.post('agents', {
      controllerId: this.schedulerIds.selected,
      compact: true,
      states: ['COUPLED', 'DECOUPLED']
    }).subscribe((res: any) => {
      this.agentClusterRunningTaskGraph(res);
      this.isLoaded = true;
    }, (err) => {
      console.log(err);
      this.isLoaded = true;
    });
  }

  onSelect(event) {

  }
}
