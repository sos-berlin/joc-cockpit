import {Component, ElementRef, Input, ViewChild} from '@angular/core';
import {Subject} from "rxjs";
import {Chart} from "chart.js";
import {NzModalService} from "ng-zorro-antd/modal";
import {CoreService} from "../../../services/core.service";
import {GroupByPipe} from "../../../pipes/core.pipe";
import {AuthService} from "../../../components/guard";
import {DataService} from "../../../services/data.service";


@Component({
  selector: 'app-monthly',
  templateUrl: './monthly.component.html',
  styleUrls: ['./monthly.component.scss']
})
export class MonthlyComponent {
  @Input({required: true}) report: any;
  schedulerIds: any = {};
  preferences: any = {};
  isLoading: boolean;
  dateFormat: string;
  clickData: any;
  filter: any = {};
  data: any = [];

  barChart: any;
  dataset: any;

  index: number;
  files = [];
  tabs = [];

  private pendingHTTPRequests$ = new Subject<void>();

  /** Reporting */
  @ViewChild('content') content: ElementRef;


  constructor(private modal: NzModalService, private coreService: CoreService, private groupBy: GroupByPipe,
              private authService: AuthService, private dataService: DataService, private elementRef: ElementRef) {

  }

  ngOnInit(): void {
    this.preferences = sessionStorage['preferences'] ? JSON.parse(sessionStorage['preferences']) : {};
    this.schedulerIds = JSON.parse(this.authService.scheduleIds) || {};
    this.dateFormat = this.coreService.getDateFormat(this.preferences.dateFormat);
    console.log(this.report)
    this.getData();
  }

  private getData(): void {
    this.coreService.post('get-report', {directory: this.report.directory}).subscribe({
      next: (res) => {
        this.files = res.data;
        this.files.forEach((file => {
          this.tabs.push(file.split('.')[0])
        }));
      }, error: (err) => {
        console.error(err);
      }
    });
  }

  ngOnDestroy(): void {
    this.pendingHTTPRequests$.next();
    this.pendingHTTPRequests$.complete();
  }

  tabChange($event): void {
    this.filter.tabIndex = $event.index;
    this.loadData(this.files[$event.index]);
  }


  loadData(fileName): void {
    this.isLoading = false;
    this.coreService.post('get-data', {filePath: this.report.directory + fileName}).subscribe({
      next: (res) => {
        this.data = JSON.parse(res.data);
        console.log(this.data, 'this.data')
        this.isLoading = true;
        if(this.data.title.match('low and high parallelism') || this.data.title.match('Total number')) {
          this.initLineChart();
        } else {
          this.initGraph();
        }
      }, error: (err) => {
        console.error(err);
      }
    });
    this.isLoading = true;
  }

  initGraph(): void {
    const data = {
      labels: [],
      datasets: [
        {
          label: this.data.title.includes('workflows') ? 'Workflows' : this.data.title.includes('parallel') ? 'Agents' : 'Jobs',
          data: []
        }
      ]
    };
    this.dataset = [];
    for (let i in this.data.data) {
      const obj: any = {
        count: this.data.data[i].count,
        data: this.data.data[i].data
      };

      if (i.includes('__')) {
        const arr = i.split('__');
        obj.workflow = arr[0];
        obj.job = arr[1];
        data.labels.push(arr[1]);
      } else if (this.data.data[i].workflow) {
        const workflow = this.data.data[i].workflow.substring(this.data.data[i].workflow.lastIndexOf('/') + 1, this.data.data[i].workflow.length);
        obj.workflow = workflow;
        console.log(workflow)
        data.labels.push(workflow);
      } else if (this.data.data[i].JOB_NAME) {
        data.labels.push(this.data.data[i].JOB_NAME);
      } else if (this.data.data[i].agentName) {
        data.labels.push(this.data.data[i].agentName);
      } else if(this.data.data[i].startTime) {
        data.labels.push(this.data.data[i].startTime);
      }

      this.dataset.push(obj);
      if (this.data.data[i].duration || this.data.data[i].totalExecutionTime) {
        let dur = this.data.data[i].duration || this.data.data[i].totalExecutionTime;
        data.datasets[0].data.push(dur / 1000);
      } else if (this.data.data[i].count || this.data.data[i].count == 0) {
        data.datasets[0].data.push(this.data.data[i].count);
      } else if(this.data.data[i].maxParallelJobs || this.data.data[i].maxParallelJobs === 0){
        data.datasets[0].data.push(this.data.data[i].maxParallelJobs);
      } else if(this.data.data[i].orderCount || this.data.data[i].orderCount === 0){
        data.datasets[0].data.push(this.data.data[i].orderCount);
      } else if(this.data.data[i].jobCount || this.data.data[i].jobCount === 0){
        data.datasets[0].data.push(this.data.data[i].jobCount);
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
              title: {display: true, text: (this.data.title.includes('execution time') ? 'Execution Time' : this.data.title.includes('workflows') ? 'Workflow' : this.data.title.includes('parallel') ? 'Agents' : 'Job') + ' Counts'},
              beginAtZero: true
            }
          }
        }
      });
    }
  }

  initLineChart(): void{
    console.log('Line Chart');
    const data = {
      labels: [],
      datasets: []
    };
    this.dataset = [];
    let count =0 ;
    for (let i in this.data.data) {
      if (i === 'topHighParallelismPeriods' || i === 'topLowParallelismPeriods') {
        console.log(this.data.data[i]);
        const obj = {
          label: i === 'topHighParallelismPeriods' ? 'High Parallelism Periods' : 'Low Parallelism Periods',
          data: [],
        };
        ++count;
        if (count > 1) {
          obj.data = new Array(data.datasets[0].data.length).fill(null);
        }
        for (let j in this.data.data[i]) {
          obj.data.push(this.data.data[i][j].data.length);
          data.labels.push(this.data.data[i][j].period)
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
