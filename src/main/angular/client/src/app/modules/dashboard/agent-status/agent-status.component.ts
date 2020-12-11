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
    legend: {
      position: 'right',
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
  pieChartData: number[] = [];
  pieChartLegend = true;
  pieChartPlugins = [pluginDataLabels];
  pieChartColors = [
    {
      borderWidth: 1,
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

  ngOnInit() {
    this.pieChartData = [];
    this.pieChartLabels = [];
    this.pieChartColors[0].backgroundColor = [];
    this.pieChartColors[0].hoverBackgroundColor = [];
    this.schedulerIds = JSON.parse(this.authService.scheduleIds) || {};
    if (this.schedulerIds.selected) {
      this.getStatus();
    } else {
      this.isLoaded = true;
    }
  }

  ngOnDestroy() {
    this.subscription1.unsubscribe();
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
      let result = {count: 1, _text: '', color: '',hoverColor: ''};
      let label: string;
      if (value.state._text === 'COUPLED') {
        label = 'agent.label.coupled';
        result.color = '#7ab97a';
        result.hoverColor = 'rgba(122, 185, 122, .8)';
      } else if (value.state._text === 'DECOUPLED') {
        label = 'agent.label.decoupled';
        result.color = 'rgba(255,195,0,0.9)';
        result.hoverColor = 'rgba(255, 195, 0, .7)';
      } else {
        label = 'agent.label.couplingFailed';
        result.color = '#e86680';
        result.hoverColor = 'rgba(232, 102, 128, .8)';
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
    this.groupBy(result.agents).forEach((value, index) => {
      this.pieChartData.push(value.count);
      this.pieChartColors[0].backgroundColor.push(value.color);
      this.pieChartColors[0].hoverBackgroundColor.push(value.hoverColor);
      this.pieChartLabels.push(value._text);
    });
  }

  getStatus(): void {
    this.coreService.post('agents', {controllerId: this.schedulerIds.selected, compact: true}).subscribe(res => {
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

  navToAgentView(color) {
    let state = '';
    if (color === '#7ab97a') {
      state = 'COUPLED';
    } else if (color === '#e86680') {
      state = 'COUPLINGFAILED';
    } else {
      state = 'DECOUPLED';
    }
    this.coreService.getResourceTab().agents.filter.state = state;
    this.router.navigate(['/resources/agents']);
  }

}
