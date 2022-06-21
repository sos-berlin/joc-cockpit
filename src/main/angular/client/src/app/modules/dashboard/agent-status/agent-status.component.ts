import {Component, OnInit, OnDestroy, Input} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {Subscription} from 'rxjs';
import {Router} from '@angular/router';
import {ChartConfiguration} from 'chart.js';
import DatalabelsPlugin from 'chartjs-plugin-datalabels';
import {DataService} from '../../../services/data.service';
import {CoreService} from '../../../services/core.service';
import {AuthService} from '../../../components/guard';

@Component({
  selector: 'app-agent-status',
  templateUrl: './agent-status.component.html'
})
export class AgentStatusComponent implements OnInit, OnDestroy {
  @Input('layout') layout: any;
  schedulerIds: any = {};
  agentClusters: any = [];
  isLoaded = false;
  subscription1: Subscription;
  mapObj = new Map();

  pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: 'rgba(255, 255, 255, 0.7)'
        },
        onHover: function (e: any) {
          e.native.target.style.cursor = 'pointer';
        },
        onLeave: function (e: any) {
          e.native.target.style.cursor = 'default';
        },
        onClick: ($event, item) => {
          this.navToAgentView(item.text);
        }
      },
      datalabels: {
        formatter: (value) => {
          return Math.round((value * 100) / this.agentClusters.length) + '%';
        }
      }, tooltip: {
        callbacks: {
          label: function (tooltipItem): string {
            return tooltipItem.label;
          }
        }
      }
    }
  };

  public pieChartData = {
    labels: [],
    datasets: []
  };
  public pieChartPlugins = [ DatalabelsPlugin ];

  constructor(private coreService: CoreService, private authService: AuthService, public translate: TranslateService,
              private router: Router, private dataService: DataService) {
    this.subscription1 = dataService.eventAnnounced$.subscribe(res => {
      this.refresh(res);
    });
  }

  ngOnInit(): void {
    this.schedulerIds = JSON.parse(this.authService.scheduleIds) || {};
    if (this.schedulerIds.selected) {
      this.getStatus();
    } else {
      this.isLoaded = true;
    }
    if (!localStorage.$SOS$THEME || localStorage.$SOS$THEME.match(/light/)) {
       this.pieChartOptions.plugins.legend.labels.color = '#3d464d';
    }
  }

  ngOnDestroy(): void {
    this.subscription1.unsubscribe();
  }

  refresh(args): void {
    if (args.eventSnapshots && args.eventSnapshots.length > 0) {
      for (let j = 0; j < args.eventSnapshots.length; j++) {
        if (((args.eventSnapshots[j].eventType === 'ItemAdded' || args.eventSnapshots[j].eventType === 'ItemDeleted'
            || args.eventSnapshots[j].eventType === 'ItemChanged') && args.eventSnapshots[j].objectType === 'AGENT')
            || args.eventSnapshots[j].eventType === 'AgentStateChanged' || args.eventSnapshots[j].eventType === 'ProxyCoupled'
            || args.eventSnapshots[j].eventType === 'ProxyDecoupled') {
          this.getStatus();
          break;
        }
      }
    }
  }

  groupBy(data): any {
    const results = [];
    if (!(data)) {
      return;
    }
    data.forEach((value) => {
      const result = {count: 1, _text: '', color: '', hoverColor: ''};
      let label: string;
      if (value.state) {
        label = value.state._text;
        result.color = this.coreService.getColorBySeverity(value.state.severity, false);
        result.hoverColor = this.coreService.getColorBySeverity(value.state.severity, true);
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
        this.mapObj.set(result.count + ' ' + result._text, value.state._text);
        results.push(result);
      }
    });
    return results;
  }

  prepareAgentClusterData(result): void {
    this.agentClusters = result.agents;
    this.mapObj.clear();
    this.pieChartData.labels = [];
    this.pieChartData.datasets = []
    this.groupBy(result.agents).forEach((value) => {
      if (this.pieChartData.datasets.length === 0) {
        this.pieChartData.datasets = [{
          data: [],
          borderWidth: 0,
          backgroundColor: [],
          hoverBackgroundColor: []
        }];
      }
      this.pieChartData.datasets[0].data.push(value.count);
      this.pieChartData.datasets[0].backgroundColor.push(value.color);
      this.pieChartData.datasets[0].hoverBackgroundColor.push(value.hoverColor);
      this.pieChartData.labels.push(value.count + ' ' + value._text);
    });
  }

  getStatus(): void {
    this.coreService.post('agents', {controllerId: this.schedulerIds.selected, compact: true, onlyVisibleAgents: true, flat: true}).subscribe({
      next: res => {
        this.prepareAgentClusterData(res);
        this.isLoaded = true;
      }, error: () => this.isLoaded = true
    });
  }

  // events
  onChartClick({ active }: { active: any }): void {
    this.navToAgentView(this.pieChartData.labels[active[0].index]);
  }

  navToAgentView(text): void {

    this.coreService.getResourceTab().agents.filter.state = this.mapObj.get(text);
    this.router.navigate(['/resources/agents']);
  }
}
