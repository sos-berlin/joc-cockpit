import {Component, OnInit, OnDestroy, Input} from '@angular/core';
import {CoreService} from '../../../services/core.service';
import {AuthService} from '../../../components/guard';
import {TranslateService} from '@ngx-translate/core';
import {Subscription} from 'rxjs';
import {DataService} from '../../../services/data.service';

@Component({
  selector: 'app-agent-status',
  templateUrl: './agent-status.component.html'
})
export class AgentStatusComponent implements OnInit, OnDestroy {
  @Input('sizeY') ybody: number;
  schedulerIds: any = {};
  agentClusters: any = {};
  subscription: Subscription;
  isLoaded = false;
  data: any[];
  view: any[] = [180, 180];
  showLegend = false;
  showLabels = false;
  explodeSlices = false;
  doughnut = false;
  colorScheme = {
    domain: []
  };

  constructor(private coreService: CoreService, private authService: AuthService, public translate: TranslateService, private dataService: DataService) {
    this.subscription = dataService.eventAnnounced$.subscribe(res => {
      this.refresh(res);
    });
  }

  refresh(args) {
    for (let i = 0; i < args.length; i++) {
      if (args[i].jobschedulerId === this.schedulerIds.selected) {
        if (args[i].eventSnapshots && args[i].eventSnapshots.length > 0) {
          for (let j = 0; j < args[i].eventSnapshots.length; j++) {
            if (args[i].eventSnapshots[j].eventType === 'FileBasedActivated' && args[i].eventSnapshots[j].objectType === 'PROCESSCLASS') {
              this.getStatus();
              break;
            }
          }
        }
        break;
      }
    }
  }

  groupBy(data) {
    let results = [];
    if (!(data)) return;
    data.forEach((value) => {
      let result = {count: 1, _text: '', color: ''};
      let label: string;
      if (value.state._text === 'ALL_AGENTS_ARE_RUNNING') {
        label = 'label.healthyAgentCluster';
        result.color = '#7ab97a';
      } else if (value.state._text.toLowerCase() === 'all_agents_are_unreachable') {
        label = 'label.unreachableAgentCluster';
        result.color = '#e86680';
      } else {
        label = 'label.unhealthyAgentCluster';
        result.color = 'rgba(255, 195, 0, 0.9)';
      }
      this.translate.get(label).subscribe(translatedValue => {
        result._text = translatedValue;
       
      });
      

      if (results.length > 0) {
        for (let i = 0; i < results.length; i++) {
          if (results[i]._text === result._text) {
            result.count = result.count + results[i].count;
            results.splice(i, 1);
            break;
          }
        }
      }
      results.push(result);

    });
    return results;
  }

  prepareAgentClusterData(result) {
    this.agentClusters = result.agentClusters;
    let seriesData = [];
    let colors = [];
    this.groupBy(result.agentClusters).forEach(function (value) {
      seriesData.push({value: value.count, name: value._text, color: value.color});
      colors.push(value.color);
    });
    this.data = seriesData;
    this.colorScheme.domain = colors;
  }

  getStatus(): void {
    this.schedulerIds = JSON.parse(this.authService.scheduleIds);
    this.coreService.post('jobscheduler/agent_clusters', {jobschedulerId: this.schedulerIds.selected}).subscribe(res => {
      this.prepareAgentClusterData(res);
      this.isLoaded = true;

    }, (err) => {
      this.isLoaded = true;
    });
  }

  ngOnInit() {
    this.data = [];
    this.getStatus();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  setLabel(name) {

  }

  onSelect(event) {

  }
}
