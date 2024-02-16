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
  schedulerIds: any = {};
  preferences: any = {};
  isLoading: boolean;
  dateFormat: string;
  clickData: any;
  filter: any = {};


  barChart: any;
  dataset: any;


  /** Reporting */
  @ViewChild('content') content: ElementRef;


  constructor(private modal: NzModalService, private coreService: CoreService, private groupBy: GroupByPipe,
              private authService: AuthService) {

  }

  ngOnInit(): void {
    this.preferences = sessionStorage['preferences'] ? JSON.parse(sessionStorage['preferences']) : {};
    this.schedulerIds = JSON.parse(this.authService.scheduleIds) || {};
    this.dateFormat = this.coreService.getDateFormat(this.preferences.dateFormat);
    console.log(this.report)
    this.loadData();
  }


  loadData(): void {
    this.isLoading = false;
    this.isLoading = true;
    if (this.report.title.match('low and high parallelism') || this.report.title.match('Total number')) {
      this.initLineChart();
    } else {
      this.initGraph();
    }
    setTimeout(() => {
      this.isLoading = true;
    }, 1000);
  }

  initGraph(): void {
    const data = {
      labels: [],
      datasets: [
        {
          label: this.report.title.includes('workflows') ? 'Workflows' : this.report.title.includes('parallel') ? 'Agents' : 'Jobs',
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
      if (this.report.data[i].job_name && this.report.data[i].job_name.includes('__')) {
        const arr = this.report.data[i].job_name.split('__');
        obj.workflow = arr[0];
        obj.job = arr[1];
        data.labels.push(arr[1]);
      } else if (this.report.data[i].workflow_name || this.report.data[i].WOKFLOW_NAME) {
        data.labels.push(this.report.data[i].workflow_name || this.report.data[i].WOKFLOW_NAME);
      } else if (this.report.data[i].job_name || this.report.data[i].JOB_NAME) {
        data.labels.push(this.report.data[i].job_name || this.report.data[i].JOB_NAME);
      } else if (this.report.data[i].agentName || this.report.data[i].agent_name) {
        data.labels.push(this.report.data[i].agentName || this.report.data[i].agent_name);
      } else if (this.report.data[i].startTime || this.report.data[i].start_time) {
        data.labels.push(this.report.data[i].startTime || this.report.data[i].start_time);
      }

      this.dataset.push(obj);
      if (this.report.data[i].duration || this.report.data[i].totalExecutionTime) {
        let dur = this.report.data[i].duration || this.report.data[i].totalExecutionTime;
        data.datasets[0].data.push(dur / 1000);
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
    console.log(data)
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
                text: this.report.title.includes('execution time') ? 'Execution Time in Seconds' : (this.report.title.includes('workflows') ? 'Workflow' : this.report.title.includes('parallel') ? 'Agents' : 'Job' + ' Counts')
              },
              beginAtZero: true
            }
          }
        }
      });
    }
  }

  initLineChart(): void {
    console.log('Line Chart');
    const data = {
      labels: [],
      datasets: []
    };
    this.dataset = [];
    let count = 0;
    for (let i in this.report.data) {
      if (i === 'topHighParallelismPeriods' || i === 'topLowParallelismPeriods') {
        console.log(this.report.data[i]);
        const obj = {
          label: i === 'topHighParallelismPeriods' ? 'High Parallelism Periods' : 'Low Parallelism Periods',
          data: [],
        };
        ++count;
        if (count > 1) {
          console.log(data.datasets)
          obj.data = new Array(data.datasets[0].data.length).fill(null);
        }
        for (let j in this.report.data[i]) {
          obj.data.push(this.report.data[i][j].data.length);
          data.labels.push(this.report.data[i][j].period)
        }
        data.datasets.push(obj);
      }
    }
    console.log(data)
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

}
