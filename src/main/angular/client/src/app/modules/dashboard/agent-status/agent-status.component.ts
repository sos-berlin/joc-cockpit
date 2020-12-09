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
  view: any[] = [140, 140];
  showLegend = true;
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
    if (args.eventSnapshots && args.eventSnapshots.length > 0) {
      for (let j = 0; j < args.eventSnapshots.length; j++) {
        if (args.eventSnapshots[j].eventType === 'AgentAdded' || args.eventSnapshots[j].eventType === 'AgentUpdated' || args.eventSnapshots[j].eventType === 'AgentStateChanged') {
          this.getStatus();
          break;
        }
      }
    }
  }

  groupBy(data) {
    let results = [];
    if (!(data)) return;
    data.forEach((value) => {
      let result = {count: 1, _text: '', color: ''};
      let label: string;
      if (value.state._text === 'COUPLED') {
        label = 'agent.label.coupled';
        result.color = '#7ab97a';
      } else if (value.state._text === 'DECOUPLED') {
        label = 'agent.label.decoupled';
        result.color = 'rgba(255, 195, 0, 0.9)';
      } else {
        label = 'agent.label.couplingFailed';
        result.color = '#e86680';
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
    this.agentClusters = result.agents;
    let seriesData = [];
    let colors = [];
    this.groupBy(result.agents).forEach(function (value) {
      seriesData.push({value: value.count, name: value._text, color: value.color});
      colors.push(value.color);
    });
    this.data = seriesData;
    this.colorScheme.domain = colors;
  }

  getStatus(): void {
    this.isLoaded = true;
    this.coreService.post('agents', {controllerId: this.schedulerIds.selected, compact: true}).subscribe(res => {
      this.prepareAgentClusterData(res);
      this.isLoaded = true;

    }, (err) => {
      this.isLoaded = true;
    });
  }

  ngOnInit() {
    this.data = [];
    this.view[0] = (this.ybody * 50 - 8 ) * 3;
    this.view[1] = (this.ybody * 50);
    this.schedulerIds = JSON.parse(this.authService.scheduleIds) || {};
    if (this.schedulerIds.selected) {
      this.getStatus();
    } else {
      this.isLoaded = true;
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  setLabel(name) {

  }

  onSelect(event) {

  }
}
