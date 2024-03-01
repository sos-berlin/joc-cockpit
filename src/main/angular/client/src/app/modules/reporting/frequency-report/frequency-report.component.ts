import {Component, ElementRef, Input, ViewChild} from '@angular/core';
import {Chart} from "chart.js";
import {NzModalService} from "ng-zorro-antd/modal";
import {CoreService} from "../../../services/core.service";
import {GroupByPipe} from "../../../pipes/core.pipe";
import {AuthService} from "../../../components/guard";
import {isArray} from "underscore";

@Component({
  selector: 'app-frequency-report',
  templateUrl: './frequency-report.component.html',
  styleUrls: ['./frequency-report.component.scss']
})
export class FrequencyReportComponent {
  @Input({required: true}) report: any;
  @Input({required: true}) templates: any;
  schedulerIds: any = {};
  preferences: any = {};
  isLoading: boolean;
  dateFormat: string;
  clickData: any;
  filter: any = {};
  barChart: any;
  dataset: any = [];
  selectedTemplates: string[] = [];
  dateFrom: any[] = [];
  dateTo: any[] = [];
  multiReports: any

  /** Reporting */
  @ViewChild('content') content: ElementRef;


  constructor(private modal: NzModalService, private coreService: CoreService, private groupBy: GroupByPipe,
              private authService: AuthService) {

  }

  ngOnInit(): void {
    console.log(this.templates,">>>")
    this.preferences = sessionStorage['preferences'] ? JSON.parse(sessionStorage['preferences']) : {};
    this.schedulerIds = JSON.parse(this.authService.scheduleIds) || {};
    this.dateFormat = this.coreService.getDateFormat(this.preferences.dateFormat);

    if (isArray(this.report)) {
      this.selectedTemplates = this.report.map(item => item.templateName);
      this.dateFrom = this.report.map(item => item.dateFrom);
      this.dateTo = this.report.map(item => item.dateTo);
    } else {
      this.selectedTemplates = [this.report.templateName];
    }
    this.loadData();
  }


  loadData(): void {
    this.isLoading = false;
    this.coreService.post('reporting/reports/generated', {compact: false, templateNames: this.selectedTemplates}).subscribe({
      next: (res: any) => {
        this.isLoading = true;
        this.multiReports = res.reports
        if (res.reports.length > 0) {
          this.report.data = res.reports[0].data;
          setTimeout(() => {
            this.generateDonutCharts()
          }, 100)
        }
      }, error: () => this.isLoading = true
    });

  }

  onTemplateChange(template: any): void {
    if (template.checked) {
      this.selectedTemplates.push(template.templateName);
    } else {
      const index = this.selectedTemplates.indexOf(template.templateName);
      if (index !== -1) {
        this.selectedTemplates.splice(index, 1);
      }
    }
  }

  compareData(visible: boolean): void {
    if (!visible && this.selectedTemplates.length > 1) {
      this.filter.showComaprison = !this.filter.showComaprison;
      this.loadData();
    }
  }

  generateDonutCharts(): void {
    for (const report of this.multiReports) {
      const totalItems = report.data.length;
      const data = this.initializeChartData();
      let totalJobCount = 0;

      for (const item of report.data) {
        let label;
        let key = "jobs";
        data.datasets[0].data.push(item.count);
        totalJobCount += item.count;


        switch (report.templateName) {
          case 'WORKFLOWS_FREQUENTLY_FAILED':
            label = item.workflow_name;
            key = "workflows";
            break;
          case 'JOBS_FREQUENTLY_FAILED':
            label = item.job_name;
            break;
          case 'AGENTS_PARALLEL_JOB_EXECUTIONS':
            label = item.agentName;
            break;
          case 'JOBS_HIGH_LOW_EXECUTION_PERIODS':
            for (const i of item.data) {
              if (i.topLowParallelismPeriods || i.topHighParallelismPeriods) {
                label = i.topLowParallelismPeriods ? 'topLowParallelismPeriods' : 'topHighParallelismPeriods';
                data.datasets[0].data.push(i.count);
                data.labels.push(label);
              }
            }
            break;
          case 'JOBS_EXECUTIONS_FREQUENCY':
            label = item.job_name;
            break;
          case 'ORDERS_EXECUTIONS_FREQUENCY':
            label = item.order_id;
            break;
          case 'WORKFLOWS_LONGEST_EXECUTION_TIMES':
            label = item.totalExecutionTime;
            key = "totalExecutionTime";
            break;
          case 'JOBS_LONGEST_EXECUTION_TIMES':
            label = item.duration;
            key = "duration";
            break;
          case 'PERIODS_MOST_ORDER_EXECUTIONS':
          case 'PERIODS_MOST_JOB_EXECUTIONS':
            label = item.start_time;
            break;
        }

        data.labels.push(label);
        data.uniqueKeys[key] ??= key;
        data.datasets[0].borderColor.push('white');
        data.datasets[0].hoverBackgroundColor.push('#e0e0e2');
        data.datasets[0].hoverBorderColor.push('#e0e0e2');
      }

      this.createChart(data, totalJobCount, report.id);
    }
  }



  initializeChartData() {
    return {
      labels: [],
      datasets: [{
        label: 'Job Counts',
        data: [],
        borderColor: [],
        borderWidth: 1,
        hoverBackgroundColor: [],
        hoverBorderColor: []
      }],
      uniqueKeys: {key: 'jobs'}
    };
  }

  createChart(data: any, totalJobCount: number, reportId: string): void {
    const canvas = document.createElement('canvas');
    canvas.classList.add('donut-chart');
    const containerId = `donut-chart-container-${reportId}`;
    const container = document.getElementById(containerId);

    if (container) {
      container.appendChild(canvas);
    }

    const innerLabel = {
      id: 'innerLabel',
      afterDatasetDraw: (chart: any, args: any, pluginOptions: any) => {
        const {ctx} = chart;
        const meta = args.meta;
        const xCoor = meta.data[0].x;
        const yCoor = meta.data[0].y;
        const perc = totalJobCount;
        ctx.save();
        ctx.textAlign = 'center';
        ctx.font = '32px sans-serif';
        ctx.fillText(perc, xCoor, yCoor);
        ctx.font = '16px sans-serif';
        ctx.fillText(data.uniqueKeys.key, xCoor, yCoor + 20);
        ctx.restore();
      }
    };

    const chart = new Chart(canvas, {
      type: 'doughnut',
      data: data,
      plugins: [innerLabel],
      options: {
        cutout: 80,
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            labels: {
              padding: 20
            },

            position: "bottom",
            fullSize: false
          },

        }
      }
    });

  }


  // getShadeColor(index: number, totalItems: number, color): string {
  //   const maxShade = 200; // Maximum shade value to avoid pure white
  //   const baseColor = [color]; // Base blue color
  //   const shadeStep = maxShade / totalItems; // Calculate step for varying shades
  //   const shade = Math.floor(maxShade - index * shadeStep); // Calculate shade based on index
  //   return `rgba(${baseColor.join(',')}, ${shade / 255})`; // Return rgba color with varying alpha (transparency)
  // }


  initGraph(report): void {
    console.log(report,">>>>");
      const data = {
        labels: [],
        datasets: [
          {
            label: this.report.template?.includes('workflows') ? 'Workflows' : this.report.template?.includes('parallel') ? 'Agents' : 'Jobs',
            data: []
          }
        ]
      };
      this.dataset = [];
      for (let i in report.data) {
        const obj: any = {
          count: report.data[i].count,
          data: report.data[i].data
        };

        if (report.data[i].startTime || report.data[i].start_time) {
          data.labels.push(report.data[i].startTime || report.data[i].start_time);
        } else if (report.data[i].job_name && report.data[i].job_name.includes('__')) {
          const arr = report.data[i].job_name.split('__');
          obj.workflow = arr[0];
          obj.job = arr[1];
          data.labels.push(arr[1]);
        } else if (report.data[i].workflow_name || report.data[i].WOKFLOW_NAME || report.data[i].workflow) {
          data.labels.push(report.data[i].workflow_name || report.data[i].WOKFLOW_NAME || report.data[i].workflow);
        } else if (report.data[i].job_name || report.data[i].JOB_NAME || report.data[i].job) {
          data.labels.push(report.data[i].job_name || report.data[i].JOB_NAME || report.data[i].job);
        } else if (report.data[i].agentName || report.data[i].agent_name) {
          data.labels.push(report.data[i].agentName || report.data[i].agent_name);
        } else if (report.data[i].order_id) {
          data.labels.push(report.data[i].order_id);
        }

        this.dataset.push(obj);
        if (report.data[i].duration || report.data[i].totalExecutionTime) {
          let dur = report.data[i].duration || report.data[i].totalExecutionTime;
          data.datasets[0].data.push(dur);
        } else if (report.data[i].count || report.data[i].count == 0) {
          data.datasets[0].data.push(report.data[i].count);
        } else if (report.data[i].maxParallelJobs || report.data[i].maxParallelJobs === 0) {
          data.datasets[0].data.push(report.data[i].maxParallelJobs);
        } else if (report.data[i].orderCount || report.data[i].orderCount === 0) {
          data.datasets[0].data.push(report.data[i].orderCount);
        } else if (report.data[i].jobCount || report.data[i].jobCount === 0) {
          data.datasets[0].data.push(report.data[i].jobCount);
        }
      }
      let delayed;
      const self = this;
      if (this.barChart) {
        this.barChart.destroy();
      }
      const canvas = document.getElementById('bar-chart') as HTMLCanvasElement;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        this.barChart = new Chart(ctx, {
          type: 'bar',
          data: data,
          options: {
            maintainAspectRatio: false,
            onClick: function (event, elements) {
              if (elements.length > 0) {
                const clickedIndex = elements[0].index;
                self.clickData = self.dataset[clickedIndex];
              }
            },
            animation: {
              onComplete: () => {
                delayed = true;
              },
              delay: (context) => {
                let delay = 0;
                if (context.type === 'data' && context.mode === 'default' && !delayed) {
                  delay = context.dataIndex * 10 + context.datasetIndex * 100;
                }
                return delay;
              },
            },
            responsive: true,
            scales: {
              y: {
                title: {
                  display: true,
                  text: this.report.template?.includes('execution time') ? 'Execution Time in Seconds' : ((this.report.template?.includes('workflows') ? 'Workflow' : this.report.template?.includes('parallel') ? 'Agents' : 'Job') + ' Counts')
                },
                beginAtZero: true
              }
            }
          }
        });
      }
  }

  toggleView(report?: any): void {
    this.filter.showData = !this.filter.showData;
    if (report) {
      this.initGraph(report);
    }
  }

}
