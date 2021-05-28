import {Component, OnInit, OnDestroy, Input} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {Subscription} from 'rxjs';
import {Router} from '@angular/router';
import {ChartOptions} from 'chart.js';
import {Label} from 'ng2-charts';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';
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

  pieChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    tooltips: {
      callbacks: {
        label: function (tooltipItem, data) {
          return ' ' + data.labels[tooltipItem.index];
        }
      }
    },
    legend: {
      position: 'right',
      labels: {
        fontColor: 'rgba(255, 255, 255, 0.7)'
      },
      onHover: function (e: any) {
        e.target.style.cursor = 'pointer';
      },
      onLeave: function (e: any) {
        e.target.style.cursor = 'default';
      },
      onClick: ($event, item) => {
        this.navToAgentView(item.fillStyle);
      }
    },
    hover: {
      onHover: function (e: any) {
        const point = this.getElementAtEvent(e);
        if (point.length) {
          e.target.style.cursor = 'pointer';
        } else {
          e.target.style.cursor = 'default';
        }
      }
    },
    plugins: {
      datalabels: {
        formatter: (value) => {
          return Math.round((value * 100) / this.agentClusters.length) + '%';
        }
      }
    }
  };
  pieChartLabels: Label[] = [];
  pieChartData = [];
  pieChartLegend = true;
  pieChartPlugins = [pluginDataLabels];
  pieChartColors = [
    {
      borderWidth: 0,
      hoverBackgroundColor: [],
      backgroundColor: []
    }
  ];

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
      this.pieChartOptions.legend.labels.fontColor = '#3d464d';
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
          || args.eventSnapshots[j].eventType === 'AgentStateChanged'
          || ((args.eventSnapshots[j].eventType === 'ProxyCoupled'
          || args.eventSnapshots[j].eventType === 'ProxyDecoupled') && args.eventSnapshots[j].objectType === 'AGENT')) {
          this.getStatus();
          break;
        }
      }
    }
  }

  groupBy(data): any {
    let results = [];
    if (!(data)) return;
    data.forEach((value) => {
      let result = {count: 1, _text: '', color: '', hoverColor: ''};
      let label: string;
      if (value.state._text === 'COUPLED') {
        label = 'agent.label.coupled';
      } else if (value.state._text === 'RESETTING') {
        label = 'agent.label.resetting';
      } else if (value.state._text === 'RESET') {
        label = 'agent.label.reset';
      } else if (value.state._text === 'UNKNOWN') {
        label = 'agent.label.unknown';
      } else {
        label = 'agent.label.couplingFailed';
      }
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
      results.push(result);
    });
    return results;
  }

  prepareAgentClusterData(result): void {
    this.agentClusters = result.agents;
    this.pieChartData = [];
    this.pieChartLabels = [];
    this.pieChartColors[0].backgroundColor = [];
    this.pieChartColors[0].hoverBackgroundColor = [];
    this.groupBy(result.agents).forEach((value, index) => {
      this.pieChartData.push(value.count);
      this.pieChartColors[0].backgroundColor.push(value.color);
      this.pieChartColors[0].hoverBackgroundColor.push(value.hoverColor);
      this.pieChartLabels.push(value.count + ' ' + value._text);
    });
  }

  getStatus(): void {
    this.coreService.post('agents', {controllerId: this.schedulerIds.selected, compact: true, onlyEnabledAgents: true}).subscribe(res => {
      this.isLoaded = true;
      this.prepareAgentClusterData(res);
    }, (err) => {
      this.isLoaded = true;
    });
  }

  onChartClick(e: any): void {
    if (e.active.length > 0) {
      const chart = e.active[0]._chart;
      const activePoints = chart.getElementAtEvent(e.event);
      if (activePoints.length > 0 && activePoints[0]._options) {
        this.navToAgentView(activePoints[0]._options.backgroundColor);
      }
    }
  }

  navToAgentView(color): void {
    let state = 'RESET';
    if (color === '#7ab97a') {
      state = 'COUPLED';
    } else if (color === '#ef486a') {
      state = 'COUPLINGFAILED';
      // state = 'UNKNOWN';
    }
    this.coreService.getResourceTab().agents.filter.state = state;
    this.router.navigate(['/resources/agents']);
  }
}
