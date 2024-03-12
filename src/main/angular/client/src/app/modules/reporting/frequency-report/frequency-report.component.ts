import {Component, ElementRef, Input, ViewChild} from '@angular/core';
import {Chart} from "chart.js";
import {NzModalService} from "ng-zorro-antd/modal";
import {isArray} from "underscore";
import PerfectScrollbar from 'perfect-scrollbar';
import {CoreService} from "../../../services/core.service";
import {GroupByPipe} from "../../../pipes/core.pipe";
import {AuthService} from "../../../components/guard";

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
  multiReports: any[] = [];
  addCardItems: any[] = [];

  /** Reporting */
  @ViewChild('content') content: ElementRef;


  constructor(private modal: NzModalService, private coreService: CoreService, private groupBy: GroupByPipe,
              private authService: AuthService) {

  }

  ngOnInit(): void {
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
    this.coreService.post('reporting/reports/generated', {
      compact: false,
      templateNames: this.selectedTemplates
    }).subscribe({
      next: (res: any) => {
        this.isLoading = true;
        this.multiReports = res.reports
        this.addCardItems = [...this.multiReports];
        if (res.reports.length > 0) {
          this.report.data = res.reports[0].data;
          setTimeout(() => {
            this.generateDonutCharts()
            this.multiReports.forEach(item => {
              item.checked = true;
            });
          }, 100)
        }
      }, error: () => this.isLoading = true
    });
  }

  onCardChange(cardId: any) {
    const index = this.multiReports.findIndex(report => report.id === cardId);
    if (index !== -1) {
      if (!this.multiReports[index].checked) {
        const addCardIndex = this.addCardItems.findIndex(report => report.id === cardId);
        if (addCardIndex !== -1) {
          this.addCardItems.splice(addCardIndex, 1);
        }
      } else {
        const existingIndex = this.addCardItems.findIndex(report => report.id === cardId);
        if (existingIndex === -1) {
          this.addCardItems.push(this.multiReports[index]);
          setTimeout(() => {
            this.generateDonutCharts(this.multiReports[index]);
          }, 100)
        }
      }
    }
  }

  removeCard(cardId: any): void {
    const index = this.addCardItems.findIndex(report => report.id === cardId);
    if (index !== -1) {
      this.addCardItems.splice(index, 1);
      const multiIndex = this.multiReports.findIndex(report => report.id === cardId);
      if (multiIndex !== -1) {
        this.multiReports[multiIndex].checked = false;
      }
    }
  }

  generateDonutCharts(reportId?: any): void {
    const reportsToProcess = reportId ? [this.addCardItems.find(item => item.id === reportId?.id)] : this.addCardItems;
    for (const report of reportsToProcess) {
      if (!report) continue;
      const chartData = this.initializeChartData();
      let totalJobCount = 0;

      for (const item of report.data) {
        let label;
        let key;
        chartData.datasets[0].data.push(item.duration || item.count);
        totalJobCount += (typeof item.duration === 'number' && !isNaN(item.duration)) ? item.duration : item.count || 0;

        switch (report.templateName) {
          case 'WORKFLOWS_FREQUENTLY_FAILED':
            label = `${item.workflow_name} - (${item.count})`;
            key = "workflows";
            break;
          case 'JOBS_FREQUENTLY_FAILED':
            const formattedJobName = item.job_name.replace(/__/g, '/');
            label = `${formattedJobName} - (${item.count})`;
            key = 'jobs';
            break;
          case 'AGENTS_PARALLEL_JOB_EXECUTIONS':
            label = `${item.agentName} - (${item.count})`;
            key = 'jobs'
            break;
          case 'JOBS_HIGH_LOW_EXECUTION_PERIODS':
            for (const i of item.data) {
              if (i.topLowParallelismPeriods || i.topHighParallelismPeriods) {
                label = i.topLowParallelismPeriods ? 'topLowParallelismPeriods' : 'topHighParallelismPeriods';
                chartData.datasets[0].data.push(i.count);
                chartData.labels.push(`${label} (${i.count})`);
              }
            }
            break;
          case 'JOBS_EXECUTIONS_FREQUENCY':
            label = `${item.workflow_name} - (${item.count})`;
            key = 'workflows'
            break;
          case 'ORDERS_EXECUTIONS_FREQUENCY':
            label = `${item.workflow_name} - (${item.count})`;
            key = 'workflows'
            break;
          case 'WORKFLOWS_LONGEST_EXECUTION_TIMES':
            label = `${item.WORKFLOW_NAME} - (${this.formatDuration(item.duration)})`;
            key = "";
            break;
          case 'JOBS_LONGEST_EXECUTION_TIMES':
            label = `${item.WORKFLOW_NAME}/${item.JOB_NAME} - (${this.formatDuration(item.duration)})`;
            key = "";
            break;
          case 'PERIODS_MOST_ORDER_EXECUTIONS':
            label = `${item.period} - (${item.count})`;
            key = 'workflows'
            break;
          case 'PERIODS_MOST_JOB_EXECUTIONS':
            label = `${item.period} - (${item.count})`;
            key = 'jobs'
            break;
        }
        chartData.labels.push(label);
        chartData.uniqueKeys.key = key;
        chartData.datasets[0].borderColor.push('white');
        chartData.datasets[0].hoverBackgroundColor.push('#e0e0e2');
        chartData.datasets[0].hoverBorderColor.push('#e0e0e2');
      }

      const formattedTotalJobCount = report.data[0]?.duration || report.data[0]?.duration === 0 ? this.formatDuration(totalJobCount) : totalJobCount;
      this.createChart(chartData, formattedTotalJobCount, report.id);
    }
  }

  formatDuration(durationInSeconds: number): any {
    const days = Math.floor(durationInSeconds / (60 * 60 * 24));
    const hours = Math.floor((durationInSeconds % (60 * 60 * 24)) / (60 * 60));
    const minutes = Math.floor((durationInSeconds % (60 * 60)) / 60);
    const seconds = durationInSeconds % 60;

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  }

  parseDuration(durationString): any {
    const parts = durationString.split(' ');
    const days = parseInt(parts[0].replace('d', '')) || 0;
    const hours = parseInt(parts[1].replace('h', '')) || 0;
    const minutes = parseInt(parts[2].replace('m', '')) || 0;
    const seconds = parseInt(parts[3].replace('s', '')) || 0;
    return days * 24 * 60 * 60 + hours * 60 * 60 + minutes * 60 + seconds;
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

  createChart(chartData: any, totalJobCount: number, reportId: string): void {
    const canvas = document.createElement('canvas');
    canvas.classList.add('donut-chart');
    const containerId = `donut-chart-container-${reportId}`;
    const container = document.getElementById(containerId);

    if (container) {
      container.appendChild(canvas);
    }

    const innerLabelPlugin = {
      id: 'innerLabel',
      afterDatasetDraw: (chart: any, args: any, pluginOptions: any) => {
        const {ctx} = chart;
        const meta = args.meta;
        const xCoor = meta.data[0].x;
        const yCoor = meta.data[0].y;
        const perc = totalJobCount;
        ctx.save();
        ctx.textAlign = 'center';
        ctx.font = '16px sans-serif';
        ctx.fillText(perc, xCoor, yCoor);
        ctx.font = '16px sans-serif';
        ctx.fillText(chartData.uniqueKeys?.key, xCoor, yCoor + 20);
        ctx.restore();
      }
    };

    const legendContainerId = `htmlLegend-${reportId}`;
    const legendContainer = this.createLegendContainer(legendContainerId, container);

    const htmlLegendPlugin = {
      id: 'htmlLegend',
      afterUpdate: (chart, args, options) => {
        const ul = this.getOrCreateLegendList(chart, legendContainerId);

        // Remove old legend items
        while (ul.firstChild) {
          ul.firstChild.remove();
        }

        // Reuse the built-in legendItems generator
        const items = chart.options.plugins.legend.labels.generateLabels(chart);

        items.forEach(item => {
          const li = document.createElement('li');
          li.style.alignItems = 'center';
          li.style.cursor = 'pointer';
          li.style.display = 'flex';
          li.style.flexDirection = 'row';
          li.style.marginLeft = '10px';

          li.onclick = () => {
            const {type} = chart.config;
            const dataIndex = item.index;
            let dataValue = chartData.datasets[0].data[dataIndex];

            if (type === 'doughnut') {
              if (chartData.uniqueKeys.key === "") {
                let totalSeconds = this.parseDuration(totalJobCount);
                chart.toggleDataVisibility(dataIndex);
                if (dataValue === undefined) {
                  dataValue = 0
                }
                if (chart._hiddenIndices[dataIndex]) {
                  totalSeconds -= dataValue;
                } else {
                  totalSeconds += dataValue;
                }
                totalJobCount = this.formatDuration(totalSeconds);
              } else {
                const isVisible = chart._hiddenIndices[dataIndex];
                chart.toggleDataVisibility(dataIndex);
                if (!isVisible) {
                  totalJobCount -= dataValue;
                } else {
                  totalJobCount += dataValue;
                }
              }
            } else {
              chart.setDatasetVisibility(item.index, !chart.isDatasetVisible(item.index));
            }
            chart.update();
          };


          const boxSpan = document.createElement('span');
          boxSpan.style.background = item.fillStyle;
          boxSpan.style.borderColor = item.strokeStyle;
          boxSpan.style.borderWidth = item.lineWidth + 'px';
          boxSpan.style.display = 'inline-block';
          boxSpan.style.flexShrink = '0';
          boxSpan.style.height = '20px';
          boxSpan.style.marginRight = '10px';
          boxSpan.style.width = '20px';

          const textContainer = document.createElement('p');
          textContainer.style.color = item.fontColor;
          textContainer.style.margin = '0';
          textContainer.style.padding = '0';
          textContainer.style.textDecoration = item.hidden ? 'line-through' : '';

          const text = document.createTextNode(item.text);
          textContainer.appendChild(text);

          li.appendChild(boxSpan);
          li.appendChild(textContainer);
          ul.appendChild(li);
        });
      }
    };

    const chartOptions = {
      cutout: 60,
      responsive: true,
      aspectRatio: 2,
      plugins: {
        legend: {display: false},
        tooltip: {
          callbacks: {
            label: (tooltipItem) => {
              const label = tooltipItem.label ?? '';
              return `${label}`;
            }
          }
        }
      }
    };

    const chart = new Chart(canvas, {
      type: 'doughnut',
      data: chartData,
      plugins: [innerLabelPlugin, htmlLegendPlugin],
      options: chartOptions
    });
  }

  createLegendContainer(legendContainerId: string, container: HTMLElement): HTMLElement {
    const legendContainer = document.createElement('div');
    legendContainer.style.height = '140px';
    legendContainer.style.position = 'relative';
    legendContainer.style.marginTop = '10px';
    legendContainer.style.padding = '2px';
    legendContainer.id = legendContainerId;
    legendContainer.classList.add('html-legend-container');
    if (container) {
      container.appendChild(legendContainer);
    }
    // Initialize Perfect Scrollbar
    const ps = new PerfectScrollbar(legendContainer);
    return legendContainer;
  }

  getOrCreateLegendList(chart, id): HTMLElement {
    const legendContainer = document.getElementById(id);
    let listContainer = legendContainer.querySelector('ul');

    if (!listContainer) {
      listContainer = document.createElement('ul');
      listContainer.style.margin = '0';
      listContainer.style.padding = '0';

      legendContainer.appendChild(listContainer);
    }

    return listContainer;
  }

  initGraph(report): void {
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

      if (report.data[i].startTime || report.data[i].WORKFLOW_NAME) {
        data.labels.push(report.data[i].startTime || report.data[i].WORKFLOW_NAME);
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
      } else if (report.data[i].period) {
        data.labels.push(report.data[i].period);
      }

      this.dataset.push(obj);
      if (report.data[i].duration || report.data[i].WORKFLOW_NAME) {
        let dur = report.data[i].duration || report.data[i].WORKFLOW_NAME;
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

  toggleReportView(report?: any): void {
    this.filter.showReport = !this.filter.showReport;
    if (report) {
      this.initGraph(report);
    }
  }

  toggleCardView(reports: any) {
    reports.showTable = !reports.showTable;
  }

  hasNoData(): boolean {
    return this.addCardItems.every(item => !item.data || item.data.length === 0);
  }
}
