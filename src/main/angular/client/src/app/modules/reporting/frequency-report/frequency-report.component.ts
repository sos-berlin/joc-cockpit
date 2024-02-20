import {Component, ElementRef, Input, ViewChild} from '@angular/core';
import {Chart} from "chart.js";
import {NzModalService} from "ng-zorro-antd/modal";
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
  dataset: any;
  selectedIds: string[] = [];
  compareMultiReports: any

  /** Reporting */
  @ViewChild('content') content: ElementRef;


  constructor(private modal: NzModalService, private coreService: CoreService, private groupBy: GroupByPipe,
              private authService: AuthService) {

  }

  ngOnInit(): void {
    this.preferences = sessionStorage['preferences'] ? JSON.parse(sessionStorage['preferences']) : {};
    this.schedulerIds = JSON.parse(this.authService.scheduleIds) || {};
    this.dateFormat = this.coreService.getDateFormat(this.preferences.dateFormat);
    this.selectedIds.push(this.report.id)
    this.loadData();
  }


  loadData(): void {
    this.isLoading = false;
    this.coreService.post('reporting/report/history', {compact: false, ids: this.selectedIds}).subscribe({
      next: (res: any) => {
        this.isLoading = true;
        this.compareMultiReports = res.reports
        if (res.reports.length > 0) {
          this.report.data = res.reports[0].data;
          console.log(this.report.data, this.report.data[0])
          if (this.report.data.length > 0 && this.report.data[0].data) {
            this.initGraph();
          } else {
            this.initLineChart();
          }
        }
      }, error: () => this.isLoading = true
    });

  }

  initGraph(): void {
    console.log(this.compareMultiReports.length)
    if (this.compareMultiReports.length > 1) {
      this.generateBarCharts()
    } else {
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
      for (let i in this.report.data) {
        const obj: any = {
          count: this.report.data[i].count,
          data: this.report.data[i].data
        };

        if (this.report.data[i].startTime || this.report.data[i].start_time) {
          data.labels.push(this.report.data[i].startTime || this.report.data[i].start_time);
        } else if (this.report.data[i].job_name && this.report.data[i].job_name.includes('__')) {
          const arr = this.report.data[i].job_name.split('__');
          obj.workflow = arr[0];
          obj.job = arr[1];
          data.labels.push(arr[1]);
        } else if (this.report.data[i].workflow_name || this.report.data[i].WOKFLOW_NAME || this.report.data[i].workflow) {
          data.labels.push(this.report.data[i].workflow_name || this.report.data[i].WOKFLOW_NAME || this.report.data[i].workflow);
        } else if (this.report.data[i].job_name || this.report.data[i].JOB_NAME || this.report.data[i].job) {
          data.labels.push(this.report.data[i].job_name || this.report.data[i].JOB_NAME || this.report.data[i].job);
        } else if (this.report.data[i].agentName || this.report.data[i].agent_name) {
          data.labels.push(this.report.data[i].agentName || this.report.data[i].agent_name);
        } else if (this.report.data[i].order_id) {
          data.labels.push(this.report.data[i].order_id);
        }

        this.dataset.push(obj);
        if (this.report.data[i].duration || this.report.data[i].totalExecutionTime) {
          let dur = this.report.data[i].duration || this.report.data[i].totalExecutionTime;
          data.datasets[0].data.push(dur);
        } else if (this.report.data[i].count || this.report.data[i].count == 0) {
          data.datasets[0].data.push(this.report.data[i].count);
        } else if (this.report.data[i].maxParallelJobs || this.report.data[i].maxParallelJobs === 0) {
          data.datasets[0].data.push(this.report.data[i].maxParallelJobs);
        } else if (this.report.data[i].orderCount || this.report.data[i].orderCount === 0) {
          data.datasets[0].data.push(this.report.data[i].orderCount);
        } else if (this.report.data[i].jobCount || this.report.data[i].jobCount === 0) {
          data.datasets[0].data.push(this.report.data[i].jobCount);
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
  }

  initLineChart(): void {
    const data = {
      labels: [],
      datasets: []
    };
    this.dataset = [];
    for (let i in this.report.data) {
      if (this.report.data[i].topHighParallelismPeriods || this.report.data[i].topLowParallelismPeriods) {
        const obj = {
          label: i === 'topHighParallelismPeriods' ? 'High Parallelism Periods' : 'Low Parallelism Periods',
          data: [],
        };

        if (i != '0') {
          obj.data = new Array(data.datasets[0].data.length).fill(null);
        }
        for (let j in this.report.data[i].topHighParallelismPeriods) {
          obj.data.push(this.report.data[i].topHighParallelismPeriods[j].data.length);
          data.labels.push(this.report.data[i].topHighParallelismPeriods[j].period)
        }
        for (let j in this.report.data[i].topLowParallelismPeriods) {
          obj.data.push(this.report.data[i].topLowParallelismPeriods[j].data.length);
          data.labels.push(this.report.data[i].topLowParallelismPeriods[j].period)
        }
        data.datasets.push(obj);
      } else {
        if (data.datasets.length === 0) {
          data.datasets = [{label: this.report.data[i].workflow ? 'Workflows' : 'Execution Time', data: []}]
        }
        if (this.report.data[i].workflow) {
          data.labels.push(this.report.data[i].workflow);
          data.datasets[0].data.push(this.report.data[i].totalExecutionTime || 0);
        } else {
          data.labels.push(this.report.data[i].START_TIME);
          data.datasets[0].data.push(this.report.data[i].duration);
        }
      }
    }
    console.log(data, 'data')
    let delayed;
    const self = this;
    if (this.barChart) {
      this.barChart.destroy();
    }
    const canvas = document.getElementById('bar-chart') as HTMLCanvasElement;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      this.barChart = new Chart(ctx, {
        type: 'line',
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
              title: {display: true, text: 'Jobs'},
              beginAtZero: true
            }
          }
        }
      });
    }
  }

  getValue(val): string {
    return (isNaN(val) ? 0 : val.toFixed(2)) + ' %';
  }

  toggleView(): void {
    this.filter.showTable = !this.filter.showTable;
  }

  onTemplateChange(template: any): void {
    if (template.checked) {
      this.selectedIds.push(template.id);
    } else {
      const index = this.selectedIds.indexOf(template.id);
      if (index !== -1) {
        this.selectedIds.splice(index, 1);
      }
    }
  }

  compareData(visible: boolean): void {
    if (!visible && this.selectedIds.length > 1) {
      this.filter.showComaprison = !this.filter.showComaprison;
      this.loadData();
    }
  }

  generateBarCharts(): void {
    for (const report of this.compareMultiReports) {
      const data = {
        labels: [], // Will be populated with start_time values
        datasets: [
          {
            label: report.name, // Use report name as dataset label
            data: [], // Will be populated with data values
            backgroundColor: 'rgba(54, 162, 235, 0.2)', // Optional: Customize bar color
            borderColor: 'rgba(54, 162, 235, 1)', // Optional: Customize border color
            borderWidth: 1 // Optional: Customize border width
          }
        ]
      };

      // Populate labels and datasets with dynamic data from the current report
      for (const item of report.data) {
        console.log(item, "::LLL")
        if (item.start_time) {
          data.labels.push(item.start_time);
          data.datasets[0].data.push(item.count);
        }
      }

      // Create a canvas element for each chart
      const canvas = document.createElement('canvas');
      canvas.classList.add('bar-chart');
      document.getElementById('charts-container').appendChild(canvas);

      // Generate the chart
      const ctx = canvas.getContext('2d');
      new Chart(ctx, {
        type: 'bar',
        data: data,
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              title: {display: true, text: 'Jobs'}
            }
          }
        }
      });
    }
  }


  getRandomColor(): string {
    // You can implement a logic to generate random colors
    // or use a library like 'randomcolor' to get color based on name
    return '#' + Math.floor(Math.random() * 16777215).toString(16);
  }

}
