import {Component, Input} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {Subscription} from 'rxjs';
import {Router} from '@angular/router';
import {ChartConfiguration} from 'chart.js';
import DatalabelsPlugin from 'chartjs-plugin-datalabels';
import {DataService} from '../../../services/data.service';
import {CoreService} from '../../../services/core.service';
import {AuthService} from '../../../components/guard';
import { HelpViewerComponent } from 'src/app/components/help-viewer/help-viewer.component';
import {NzModalService} from "ng-zorro-antd/modal";

@Component({
  selector: 'app-agent-status',
  templateUrl: './agent-status.component.html'
})
export class AgentStatusComponent {
  @Input('layout') layout: any;
  schedulerIds: any = {};
  agentClusters: any = [];
  isLoaded = false;
  subscription1: Subscription;
  mapObj = new Map();
  preferences: any = {};
  fullLabels: string[] = [];
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
        onClick: (event, item, legend) => {
          this.navToAgentView(item.text);
        }
      },
      datalabels: {
        formatter: (value) => {
          return Math.round((value * 100) / this.agentClusters.length) + '%';
        }
      },
      tooltip: {
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
  public pieChartPlugins = [DatalabelsPlugin];

  constructor(private coreService: CoreService, private authService: AuthService, public translate: TranslateService,
              private router: Router, private dataService: DataService, public modal: NzModalService,) {
    this.subscription1 = dataService.eventAnnounced$.subscribe(res => {
      this.refresh(res);
    });
  }

  ngOnInit(): void {
    this.schedulerIds = JSON.parse(this.authService.scheduleIds) || {};
    this.preferences = sessionStorage['preferences'] ? JSON.parse(sessionStorage['preferences']) : {};

    if (this.schedulerIds.selected) {
      this.getStatus();
    } else {
      this.isLoaded = true;
    }
    if (!localStorage['$SOS$THEME'] || localStorage['$SOS$THEME'].match(/light/)) {
      this.pieChartOptions.plugins.legend.labels.color = '#3d464d';
    }
  }

  ngOnDestroy(): void {
    this.subscription1.unsubscribe();
  }

  refresh(args: { eventSnapshots: any[] }): void {
    if (args.eventSnapshots && args.eventSnapshots.length > 0) {
      for (let j = 0; j < args.eventSnapshots.length; j++) {
        if (((args.eventSnapshots[j].eventType === 'ItemAdded' || args.eventSnapshots[j].eventType === 'ItemDeleted'
            || args.eventSnapshots[j].eventType === 'ItemChanged') && args.eventSnapshots[j].objectType === 'AGENT')
          || args.eventSnapshots[j].eventType === 'JOCStateChanged' || args.eventSnapshots[j].eventType === 'AgentStateChanged'
          || args.eventSnapshots[j].eventType === 'ProxyCoupled' || args.eventSnapshots[j].eventType === 'ProxyDecoupled') {
          this.getStatus();
          break;
        }
      }
    }
  }

  groupBy(data): Promise<any[]> {
    const results = new Map<string, any>();
    if (!data) {
      return Promise.resolve([]);
    }

    const translationPromises = data.map((value) => {
      return new Promise((resolve) => {
        if (value.state) {
          const label = value.state._text;
          const isDisabled = value.disabled;
          const severity = value.state.severity;
          const color = this.coreService.getColorBySeverity(value.state.severity, false, isDisabled);
          const hoverColor = this.coreService.getColorBySeverity(value.state.severity, true, isDisabled);

          const filterValue = this.getFilterValue(severity, label);

          const key = `${label}_${severity}_${isDisabled ? 'disabled' : 'enabled'}`;

          this.translate.get(label).subscribe(translatedValue => {
            let result;
            if (results.has(key)) {
              result = results.get(key);
              result.count++;
            } else {
              result = {
                count: 1,
                _text: translatedValue,
                originalText: label,
                severity: severity,
                filterValue: filterValue,
                color: color,
                hoverColor: hoverColor,
                isDisabled: isDisabled
              };
              results.set(key, result);
            }

            resolve(result);
          }, () => {
            resolve(null);
          });
        } else {
          resolve(null);
        }
      });
    });

    return Promise.all(translationPromises).then(() => {
      const resultArray = Array.from(results.values());
      return resultArray;
    });
  }


  getFilterValue(severity: number, text: string): string {
    if (text === 'COUPLED') {
      switch (severity) {
        case 0:
        case 8:
          return 'COUPLED';
        case 2:
        case 5:
          return 'COUPLINGFAILED';
        default:
          return text;
      }
    }
    return text;
  }


  prepareAgentClusterData(result): void {
    this.agentClusters = result.agents;
    this.mapObj.clear();
    this.pieChartData.labels = [];
    this.pieChartData.datasets = [{ data: [], borderWidth: 0, backgroundColor: [], hoverBackgroundColor: [] }];

    this.fullLabels = [];

    this.groupBy(result.agents).then(groupedData => {
      groupedData.forEach((value) => {
        this.pieChartData.datasets[0].data.push(value.count);
        this.pieChartData.datasets[0].backgroundColor.push(value.color);
        this.pieChartData.datasets[0].hoverBackgroundColor.push(value.hoverColor);

        const labelPrefix = value.isDisabled ? 'Disabled' : 'Enabled';
        const fullLabel = `${value.count} ${labelPrefix} ${value.originalText} (S${value.severity})`;
        const displayLabel = `${value.count} ${labelPrefix} ${value.originalText}`;

        this.fullLabels.push(fullLabel);
        this.mapObj.set(fullLabel, value.filterValue);

        this.pieChartData.labels.push(displayLabel);
      });
    });
  }



  getStatus(): void {
    this.pieChartData.labels = [];
    this.pieChartData.datasets = [];
    this.coreService.post('agents', {
        controllerId: this.schedulerIds.selected,
        compact: true,
        onlyVisibleAgents: true,
        flat: true
    }).subscribe({
        next: res => {
            this.prepareAgentClusterData(res);
            this.isLoaded = true;
        }, error: () => this.isLoaded = true
    });
  }


  onChartClick({ active }: { active: any }): void {
    if (this.fullLabels && active[0]) {
      const originalLabel = this.fullLabels[active[0].index];
      this.navToAgentView(originalLabel);
    }
  }


  navToAgentView(text: string): void {
    const state = this.mapObj.get(text);
    if (state) {
      this.coreService.getResourceTab().agents.filter.state = state;
      this.router.navigate(['/resources/agents']).then();
    } else {
    }
  }



  helpPage(): void{
    this.modal.create({
      nzTitle: undefined,
      nzContent: HelpViewerComponent,
      nzClassName: 'lg',
      nzData: {
        preferences: this.preferences,
        helpKey: 'dashboard-agent-status'
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    })
  }
}
