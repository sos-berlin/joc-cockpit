import {Component, ElementRef, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {NzModalService} from "ng-zorro-antd/modal";
import html2canvas from 'html2canvas';
import {jsPDF} from "jspdf";
import {Chart} from "chart.js";
import PerfectScrollbar from 'perfect-scrollbar';
import {CoreService} from "../../../services/core.service";
import {AuthService} from "../../../components/guard";
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-frequency-report',
  templateUrl: './frequency-report.component.html',
  styleUrls: ['./frequency-report.component.scss']
})
export class FrequencyReportComponent {
  @Input({required: true}) readonly templates: any;
  @Input({required: true}) readonly selectedReport: any;
  @Input({required: true}) readonly groupBy: string;
  @Input() readonly groupType?: string;
  schedulerIds: any = {};
  preferences: any = {};
  isLoading: boolean;
  loading: boolean;
  isPathDisplay = true;
  dateFormat: string;
  clickData: any;
  filter: any = {
    sortBy: '',
    reverse: true
  };
  barChart: any;
  dataset: any = [];

  multiReports: any[] = [];
  addCardItems: any[] = [];
  selectedFrequencies = [];

  @Output() closePanel: EventEmitter<any> = new EventEmitter();

  frequencies = [
    {name: 'WEEKLY'},
    {name: 'TWO_WEEKS'},
    {name: 'MONTHLY'},
    {name: 'THREE_MONTHS'},
    {name: 'SIX_MONTHS'},
    {name: 'YEARLY'},
    {name: 'THREE_YEARS'}
  ];
  filteredFrequency: string;
  template: string;

  /** Reporting */
  @ViewChild('content') content: ElementRef;

  constructor(private modal: NzModalService, private coreService: CoreService,
              private authService: AuthService, private elementRef: ElementRef, private translate: TranslateService) {

  }

  ngOnInit(): void {
    this.preferences = sessionStorage['preferences'] ? JSON.parse(sessionStorage['preferences']) : {};
    this.schedulerIds = JSON.parse(this.authService.scheduleIds) || {};
    this.isPathDisplay = sessionStorage['displayFoldersInViews'] == 'true';
    this.dateFormat = this.coreService.getDateFormat(this.preferences.dateFormat);

    let obj: any = {};
    if (this.selectedReport.value) {
      if (this.groupBy == 'template') {
        obj.templateNames = [this.selectedReport.value[0].templateName];
      } else {
        obj.reportPaths = [this.selectedReport.path];
      }
      this.filter.checked = true;
    } else {
      this.filter.indeterminate = true;
      obj.runIds = [this.selectedReport.runId];
    }

    this.loadData(obj);
  }

  loadData(obj): void {
    this.isLoading = false;
    this.coreService.post('reporting/reports/generated', obj).subscribe({
      next: (res: any) => {
        this.isLoading = true;
        this.multiReports = res.reports;

        // Filter reports based on groupType
        if (this.groupType) {
          const filteredReports = [];
          if (this.groupType === 'highest') {
            this.selectedReport.highestGroup.forEach((report) => {
              const matchedReport = this.multiReports.find(item => item.id === report.id);
              if (matchedReport) {
                filteredReports.push(matchedReport);
              }
            });
          } else if (this.groupType === 'lowest') {
            this.selectedReport.lowestGroup.forEach((report) => {
              const matchedReport = this.multiReports.find(item => item.id === report.id);
              if (matchedReport) {
                filteredReports.push(matchedReport);
              }
            });
          }
          this.multiReports = filteredReports;
        }

        this.multiReports.forEach(item => {
          item.name = item.path.substring(item.path.lastIndexOf('/') + 1);
          if (obj.runIds) {
            item.checked = item.id == this.selectedReport.id;
          } else {
            item.checked = true;
            this.selectedFrequencies.push(item.frequency);
          }
          this.selectedFrequencies.push(item.frequency);
          const template = this.templates.find(template => template.templateName == item.templateName);
          if (template) item.template = template.title;
          item.template = item.template?.replace('${hits}', item.hits || 10).replace('${sort}', item.sort);
        });

        this.selectedFrequencies = [...new Set(this.selectedFrequencies)].sort();
        this.sort('');
        this.addCardItems = [...this.multiReports];

        this.addCardItems = this.addCardItems.filter((report) => {
          return report.checked;
        });

        if (res.reports.length > 0) {
          setTimeout(() => {
            this.generateDonutCharts();
          }, 100);
        }
      },
      error: () => this.isLoading = true
    });
  }



  onCardChange(cardId: any) {
    if (this.multiReports.every(item => !item.checked)) {
      this.filter.checked = false;
      this.filter.indeterminate = false;
    } else if (this.multiReports.every(item => item.checked)) {
      this.filter.checked = true;
      this.filter.indeterminate = false;
    } else {
      this.filter.indeterminate = true;
    }
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
    this.filter.checked = false;
    this.filter.indeterminate = true;
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
            label = `${item.workflowName} - (${item.count})`;
            key = "Workflow executions";
            chartData.labels.push(label);
            break;
          case 'JOBS_FREQUENTLY_FAILED':
            const formattedFailedJobName = item.jobName.replace(/__/g, '/');
            label = `${formattedFailedJobName} - (${item.count})`;
            key = 'Job executions';
            chartData.labels.push(label);
            break;
          case 'AGENTS_PARALLEL_JOB_EXECUTIONS':
            label = `${item.agentName} - (${item.count})`;
            key = 'Job executions'
            chartData.labels.push(label);
            break;
          case 'JOBS_HIGH_LOW_EXECUTION_PERIODS':
            let highParallelismCount = 0;
            let lowParallelismCount = 0;

            for (const period of item.topHighParallelismPeriods) {
              highParallelismCount += period.data.length;
            }

            for (const period of item.topLowParallelismPeriods) {
              lowParallelismCount += period.data.length;
            }

            const datasetData = [];
            const datasetLabels = [];

            if (lowParallelismCount > 0) {
              datasetLabels.push(`Low Parallelism (${lowParallelismCount})`);
              datasetData.push(lowParallelismCount);
            }

            if (highParallelismCount > 0) {
              datasetLabels.push(`High Parallelism (${highParallelismCount})`);
              datasetData.push(highParallelismCount);
            }
            totalJobCount += highParallelismCount + lowParallelismCount
            chartData.datasets[0].data = datasetData;
            chartData.labels = datasetLabels;
            key = 'Job executions'
            break;
          case 'JOBS_EXECUTIONS_FREQUENCY':
            label = `${item.jobName} - (${item.count})`;
            key = 'Job executions'
            chartData.labels.push(label);
            break;
          case 'ORDERS_EXECUTIONS_FREQUENCY':
            label = `${item.workflowName} - (${item.count})`;
            key = 'Workflow executions'
            chartData.labels.push(label);
            break;
          case 'WORKFLOWS_LONGEST_EXECUTION_TIMES':
            label = `${item.workflowName} - (${this.formatDuration(item.duration)})`;
            key = "Workflow executions";
            chartData.labels.push(label);
            break;
          case 'JOBS_LONGEST_EXECUTION_TIMES':
            label = `${item.workflowName}/${item.jobName} - (${this.formatDuration(item.duration)})`;
            key = "Job executions";
            chartData.labels.push(label);
            break;
          case 'PERIODS_MOST_ORDER_EXECUTIONS':
            label = `${item.period} - (${(item.count)})`;
            key = 'Workflow executions'
            chartData.labels.push(label);
            break;
          case 'PERIODS_MOST_JOB_EXECUTIONS':
            label = `${item.period} - (${(item.count)})`;
            key = 'Job executions'
            chartData.labels.push(label);
            break;
          case 'JOBS_SUCCESSFUL_EXECUTIONS':
            const formattedSuccessJobName = item.jobName.replace(/__/g, '/');
            label = `${formattedSuccessJobName} - (${item.count})`;
            key = 'Job executions';
            chartData.labels.push(label);
            break;
          case 'WORKFLOWS_SUCCESSFUL_EXECUTIONS':
            label = `${item.workflowName} - (${item.count})`;
            key = "Workflow executions";
            chartData.labels.push(label);
            break;
        }
        chartData.uniqueKeys.key = key;
        chartData.datasets[0].borderColor.push('white');
        chartData.datasets[0].hoverBackgroundColor.push('#e0e0e2');
        chartData.datasets[0].hoverBorderColor.push('#e0e0e2');
      }

      const formattedTotalJobCount = report.data[0]?.duration || report.data[0]?.duration === 0 ? (chartData.labels.length) : totalJobCount;
      this.createChart(chartData, formattedTotalJobCount, report.id, report.templateName);
    }
  }

  formatDuration(durationInSeconds: number): any {
    const days = Math.floor(durationInSeconds / (60 * 60 * 24));
    const hours = Math.floor((durationInSeconds % (60 * 60 * 24)) / (60 * 60));
    const minutes = Math.floor((durationInSeconds % (60 * 60)) / 60);
    const seconds = durationInSeconds % 60;
    if (days == 0 && hours == 0 && minutes == 0 && seconds == 0) {
      return `< 1 sec`;
    } else if (days == 0 && hours == 0 && minutes == 0) {
      return `${seconds}s`;
    } else if (days == 0 && hours == 0) {
      if (seconds == 0) {
        return `${minutes}m`;
      }
      return `${minutes}m ${seconds}s`;
    } else if (days == 0) {
      if (seconds == 0) {
        return `${hours}h ${minutes}m`;
      }
      return `${hours}h ${minutes}m ${seconds}s`;
    }
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  }

  parseDuration(durationString): any {
    const parts = durationString.split(' ');
    const days = parseInt(parts[0]?.replace('d', '')) || 0;
    const hours = parseInt(parts[1]?.replace('h', '')) || 0;
    const minutes = parseInt(parts[2]?.replace('m', '')) || 0;
    const seconds = parseInt(parts[3]?.replace('s', '')) || 0;
    return days * 24 * 60 * 60 + hours * 60 * 60 + minutes * 60 + seconds;
  }

  initializeChartData() {
    return {
      labels: [],
      datasets: [{
        label: 'Job Execution Counts',
        data: [],
        borderColor: [],
        borderWidth: 1,
        hoverBackgroundColor: [],
        hoverBorderColor: []
      }],
      uniqueKeys: {key: 'Job executions'}
    };
  }

  createChart(chartData: any, totalJobCount: any, reportId: string, templateName: string): void {
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
        if (args.meta.data.length && templateName !== 'JOBS_LONGEST_EXECUTION_TIMES' && templateName !== 'WORKFLOWS_LONGEST_EXECUTION_TIMES' && templateName !== 'AGENTS_PARALLEL_JOB_EXECUTIONS') {
          const {ctx} = chart;
          const meta = args.meta;
          const xCoor = meta.data[0].x;
          const yCoor = meta.data[0].y;
          const perc = totalJobCount;
          ctx.save();
          ctx.textAlign = 'center';

          // Set text color based on theme
          if (!(this.preferences.theme === 'light' || this.preferences.theme === 'lighter' || !this.preferences.theme)) {
            ctx.fillStyle = 'white';
          } else {
            ctx.fillStyle = 'black';
          }

          ctx.font = '20px sans-serif';

          const keyWords = chartData.uniqueKeys?.key.split(' ') || [];
          const lineHeight = 15;
          const gap = 10;
          const totalHeight = (keyWords.length + 1) * lineHeight;
          let currentY = yCoor - (totalHeight / 2) + lineHeight / 2;

          ctx.fillText(perc, xCoor, currentY);
          currentY += lineHeight + gap;

          ctx.font = '13px sans-serif';

          keyWords.forEach((word, index) => {
            ctx.fillText(word, xCoor, currentY);
            currentY += lineHeight;
          });

          ctx.restore();
        }
      }
    };

    const legendContainerId = `htmlLegend-${reportId}`;
    this.createLegendContainer(legendContainerId, container);

    const htmlLegendPlugin = {
      id: 'htmlLegend',
      afterUpdate: (chart, args, options) => {
        const ul = this.getOrCreateLegendList(chart, legendContainerId);

        // Remove old legend items
        while (ul.firstChild) {
          ul.firstChild.remove();
        }

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
              if (templateName === 'WORKFLOWS_LONGEST_EXECUTION_TIMES' || templateName === 'JOBS_LONGEST_EXECUTION_TIMES') {
                chart.toggleDataVisibility(dataIndex);
                if (chart._hiddenIndices[dataIndex]) {
                  totalJobCount -= chartData.datasets.length;
                } else {
                  totalJobCount += chartData.datasets.length;
                }
              } else {
                if (chartData.uniqueKeys.key === "") {
                  let totalSeconds = this.parseDuration(totalJobCount);
                  chart.toggleDataVisibility(dataIndex);
                  if (dataValue === undefined) {
                    dataValue = 0;
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
      maintainAspectRatio: false, // Set to false to fix height
      height: 180, // Specify the height of the chart
      plugins: {
        legend: {display: false},
        datalabels: {display: false},
        tooltip: {
          callbacks: {
            label: (tooltipItem) => {
              return tooltipItem.label ? tooltipItem.label.split('-')[0] : '';
            },
            afterLabel: (tooltipItem) => {
              return tooltipItem.label ? tooltipItem.label.split('-')[1] : '';
            }
          }
        }
      }
    };

    new Chart(canvas, {
      type: 'doughnut',
      data: chartData,
      plugins: [innerLabelPlugin, htmlLegendPlugin],
      options: chartOptions
    });
  }

  createLegendContainer(legendContainerId: string, container: HTMLElement) {
    const legendContainer = document.createElement('div');
    legendContainer.style.height = '166px';
    legendContainer.style.position = 'relative';
    legendContainer.style.marginTop = '10px';
    legendContainer.style.padding = '2px';
    legendContainer.id = legendContainerId;
    legendContainer.classList.add('html-legend-container');
    if (container) {
      container.appendChild(legendContainer);
    }
    setTimeout(() => {
      // Initialize Perfect Scrollbar
      new PerfectScrollbar(legendContainer);
    })
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

  getLabel(): any {
    const template = this.selectedReport.template;
    console.log(template,"templatelable")
    switch (template) {
      case 'WORKFLOWS_FREQUENTLY_FAILED':
        return 'Failed Workflow Executions';
      case 'JOBS_FREQUENTLY_FAILED':
        return 'Failed Job Executions';
      case 'AGENTS_PARALLEL_JOB_EXECUTIONS':
        return 'Parallel Agents';
      case 'JOBS_HIGH_LOW_EXECUTION_PERIODS':
        return 'Job Executions';
      case 'JOBS_EXECUTIONS_FREQUENCY':
        return 'Job Executions'
      case 'ORDERS_EXECUTIONS_FREQUENCY':
        return 'Workflow Executions';
      case 'WORKFLOWS_LONGEST_EXECUTION_TIMES':
        return 'Workflow Execution Duration';
      case 'JOBS_LONGEST_EXECUTION_TIMES':
        return 'Job Executions Duration';
      case 'PERIODS_MOST_ORDER_EXECUTIONS':
        return 'Workflow Executions';
      case 'PERIODS_MOST_JOB_EXECUTIONS':
        return 'Job Executions';
      case 'JOBS_SUCCESSFUL_EXECUTIONS':
        return 'Sucessful Job Executions';
      case 'WORKFLOWS_SUCCESSFUL_EXECUTIONS':
        return 'Sucessful Workflow Executions';
      default:
        return 'executions';
    }
  }

  getText(): string {
    const template = this.selectedReport.template;
    console.log(template,"templatelable")
    switch (template) {
      case 'WORKFLOWS_FREQUENTLY_FAILED':
        return 'Failed Workflow Executions Count';
      case 'JOBS_FREQUENTLY_FAILED':
        return 'Failed Job Executions Count';
      case 'AGENTS_PARALLEL_JOB_EXECUTIONS':
        return 'Parallel Agents Count';
      case 'JOBS_HIGH_LOW_EXECUTION_PERIODS':
        return 'Job Executions';
      case 'JOBS_EXECUTIONS_FREQUENCY':
        return 'Job Executions'
      case 'ORDERS_EXECUTIONS_FREQUENCY':
        return 'Workflow Executions';
      case 'WORKFLOWS_LONGEST_EXECUTION_TIMES':
        return 'Workflow Execution Duration';
      case 'JOBS_LONGEST_EXECUTION_TIMES':
        return 'Job Executions Duration';
      case 'PERIODS_MOST_ORDER_EXECUTIONS':
        return 'Workflow Executions';
      case 'PERIODS_MOST_JOB_EXECUTIONS':
        return 'Job Executions';
      case 'JOBS_SUCCESSFUL_EXECUTIONS':
        return 'Successful Job Executions Count';
      case 'WORKFLOWS_SUCCESSFUL_EXECUTIONS':
        return 'Successful Workflow Executions Count';
      default:
        return 'executions';
    }
  }
  initGraph(report): void {
    const data = {
      labels: [],
      datasets: [
        {
          label: this.getLabel(),
          data: []
        }
      ]
    };
    this.dataset = [];
    const template = this.selectedReport.template;
    for (let i in report.data) {
      const obj: any = {
        count: report.data[i].count,
        data: report.data[i].data
      };

      switch (template) {
        case 'WORKFLOWS_FREQUENTLY_FAILED':
          data.labels.push(report.data[i].workflowName);
          data.datasets[0].data.push(report.data[i].count);
          break;
        case 'JOBS_FREQUENTLY_FAILED':
          data.labels.push(report.data[i].workflowName + '/'+ report.data[i].jobName);
          data.datasets[0].data.push(report.data[i].count);
          break;
        case 'AGENTS_PARALLEL_JOB_EXECUTIONS':
          data.labels.push(report.data[i].agentName || report.data[i].agentName);
          data.datasets[0].data.push(report.data[i].count);
          break;
        case 'JOBS_HIGH_LOW_EXECUTION_PERIODS':

        case 'JOBS_EXECUTIONS_FREQUENCY':
          data.labels.push(report.data[i].workflowName + '/'+ report.data[i].jobName);
          data.datasets[0].data.push(report.data[i].count);
          break;
        case 'ORDERS_EXECUTIONS_FREQUENCY':
          data.labels.push(report.data[i].workflowName);
          data.datasets[0].data.push(report.data[i].count);
          break;
        case 'WORKFLOWS_LONGEST_EXECUTION_TIMES':
          data.labels.push(report.data[i].workflowName);
          data.datasets[0].data.push(report.data[i].duration);
          break;
        case 'JOBS_LONGEST_EXECUTION_TIMES':
          data.labels.push(report.data[i].workflowName + '/'+ report.data[i].jobName);
          data.datasets[0].data.push(report.data[i].duration);
          break;
        case 'PERIODS_MOST_ORDER_EXECUTIONS':
          data.labels.push(report.data[i].period);
          data.datasets[0].data.push(report.data[i].count);
          break;
        case 'PERIODS_MOST_JOB_EXECUTIONS':
          data.labels.push(report.data[i].period);
          data.datasets[0].data.push(report.data[i].count);
          break;
        case 'JOBS_SUCCESSFUL_EXECUTIONS':
          data.labels.push(report.data[i].workflowName + '/'+ report.data[i].jobName);
          data.datasets[0].data.push(report.data[i].count);
          break;
        case 'WORKFLOWS_SUCCESSFUL_EXECUTIONS':
          data.labels.push(report.data[i].workflowName);
          data.datasets[0].data.push(report.data[i].count);
          break;
        default:

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
          plugins: {
            datalabels: {display: false},
            tooltip: {
              callbacks: {
                label: function (context) {
                  let label = context.dataset.label || '';
                  if (label) {
                    label += ': ';
                  }
                  if (context.parsed.y !== null) {
                    if (['WORKFLOWS_LONGEST_EXECUTION_TIMES', 'JOBS_LONGEST_EXECUTION_TIMES'].includes(self.selectedReport.template)) {
                      label += self.formatDuration(context.parsed.y);
                    } else {
                      label += context.parsed.y;
                    }
                  }
                  return label;
                }
              }
            }
          },
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
                text: this.getText()
              },
              beginAtZero: true,
              ticks: {
                callback: function (value: any) {
                  if (['WORKFLOWS_LONGEST_EXECUTION_TIMES', 'JOBS_LONGEST_EXECUTION_TIMES'].includes(self.selectedReport.template)) {
                    return self.formatDuration(value);
                  } else {
                    return Number.isInteger(value) ? value : null;
                  }
                }
              }
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

  updateAllChecked(): void {
    this.filter.indeterminate = false;
    if (this.filter.checked) {
      this.multiReports = this.multiReports.map(item => ({
        ...item,
        checked: true
      }));
      this.addCardItems = [...this.multiReports];
      setTimeout(() => {
        this.generateDonutCharts(); // Generate charts for all items
      }, 100);
    } else {
      this.addCardItems = [];
      this.multiReports = this.multiReports.map(item => ({
        ...item,
        checked: false
      }));
      this.destroyElements();
    }
  }

  sort(type: string): void {
    this.filter.reverse = !this.filter.reverse;
    this.filter.sortBy = type;

    const compare = (a: any, b: any): number => {
      if (this.filter.sortBy === 'frequency') {
        if (a.frequency < b.frequency) {
          return -1;
        } else if (a.frequency > b.frequency) {
          return 1;
        } else {
          return a.dateFrom - b.dateFrom;
        }
      }
      return 0;
    };

    this.addCardItems = this.addCardItems.sort(compare);
    if (this.filter.reverse) {
      this.addCardItems = this.addCardItems.reverse();
    }
  }


  filterBy(data): void {
    this.filteredFrequency = data.name;
    this.addCardItems = this.multiReports.filter(item => {
      return (item.frequency === data.name || !data.name) && item.checked;
    });
    this.destroyElements()
    setTimeout(() => {
      this.generateDonutCharts();
    }, 100)
  }

  destroyElements(): void {
    const chartElements = document.getElementsByClassName('donut-chart');
    const legendElements = document.getElementsByClassName('html-legend-container');

    for (let i = chartElements.length - 1; i >= 0; i--) {
      chartElements[i].remove();
    }
    for (let i = legendElements.length - 1; i >= 0; i--) {
      legendElements[i].remove();
    }
  }

  exportTheReport(): void {
    this.createReport().then();
  }

  async createReport() {
    this.loading = true;
    // Get DOM elements
    const contentElement = this.elementRef.nativeElement.querySelector('#content');
    const height = contentElement.clientHeight;

    const initialMaxHeightContent = contentElement.style.maxHeight;

    // Set maxHeight to inherit for capturing full content
    contentElement.style.maxHeight = 'inherit';
    let scale = 1;
    if (this.addCardItems.length > 48) {
      scale = 3;
    } else if (this.addCardItems.length > 24) {
      scale = 2;
    }
    // Create canvas from HTML content
    const canvas = await html2canvas(contentElement, {
      scale: scale,
      scrollY: -window.scrollY // Capture entire scrollable content
    });

    // Restore initial maxHeight values
    contentElement.style.maxHeight = initialMaxHeightContent;

    // Create PDF
    const pdf = new jsPDF();
    const pageWidth = 210; // Width of A4 page in mm
    const pageHeight = (height * pageWidth) / canvas.width; // Maintain aspect ratio
    const imgHeight = (canvas.height * pageWidth) / canvas.width; // Adjusted height to match page height
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 10, pageWidth, imgHeight);
    const textColor = '#CCCCCC';
    pdf.setTextColor(textColor);
    pdf.text(this.groupBy == 'template' ? this.selectedReport.template : this.selectedReport.path, 105, 8, {align: 'center'});
    // Save PDF
    pdf.save('report.pdf');
    this.loading = false;
  }

  getTranslatedText(item: any): string {
    let templateKey = item.templateName ? item.templateName : item.template;
    let translatedText = this.translate.instant('reporting.templates.' + templateKey);
    if (item.sort && item.hits) {
      translatedText = translatedText.replace('${hits}', item.hits.toString());
      const translatedSort = this.translate.instant('reporting.label.' + item.sort);
      translatedText = translatedText.replace('${sort}', translatedSort);
    }

    return translatedText;
  }

}
