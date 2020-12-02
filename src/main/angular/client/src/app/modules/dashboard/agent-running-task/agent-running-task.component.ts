import {Component, OnInit, OnDestroy, Input} from '@angular/core';
import {CoreService} from '../../../services/core.service';
import {DataService} from '../../../services/data.service';
import {Subscription} from 'rxjs';
import {AuthService} from '../../../components/guard';

@Component({
  selector: 'app-agent-running-task',
  templateUrl: './agent-running-task.component.html'
})
export class AgentRunningTaskComponent implements OnInit, OnDestroy {

  isLoaded = false;
  schedulerIds: any;
  subscription: Subscription;
  data = [];
  view: any[] = [600, 160];
  @Input('sizeY') ybody: number;
  colorScheme = {
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']
  };

  constructor(private coreService: CoreService, private authService: AuthService, private dataService: DataService) {
    this.subscription = dataService.eventAnnounced$.subscribe(res => {
      this.refresh(res);
    });
  }

  refresh(args) {
    if (args.eventSnapshots && args.eventSnapshots.length > 0) {
      for (let j = 0; j < args.eventSnapshots.length; j++) {
        if (args.eventSnapshots[j].eventType === 'JobStateChanged') {
          this.getRunningTask();
          break;
        }
      }
    }
  }

  ngOnInit() {
    this.schedulerIds = JSON.parse(this.authService.scheduleIds) || {};
    if(this.schedulerIds.selected) {
      this.getRunningTask();
    }else{
      this.isLoaded = true;
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  agentClusterRunningTaskGraph(res) {
    this.data = [];
    for (let i = 0; i < res.processClasses.length; i++) {
      this.data.push({name: res.processClasses[i].path, value: res.processClasses[i].numOfProcesses});
    }
  }

  getRunningTask(): void {

/*    this.coreService.post('agents/p', {
      controllerId: this.schedulerIds.selected,
      isAgentCluster: true
    }).subscribe(res => {
      this.agentClusterRunningTaskGraph(res);
      this.isLoaded = true;
    }, (err) => {
      console.log(err);
      this.isLoaded = true;
    });*/
    this.isLoaded = true;
  }

  onSelect(event) {

  }
}
