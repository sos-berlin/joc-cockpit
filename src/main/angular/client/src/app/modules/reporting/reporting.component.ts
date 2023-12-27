import {Component} from '@angular/core';
import {differenceInCalendarDays} from "date-fns";
import {Chart} from "chart.js";
import {CoreService} from "../../services/core.service";
import {GroupByPipe} from "../../pipes/core.pipe";
import {AuthService} from "../../components/guard";

declare const jsPDF;

@Component({
  selector: 'app-reporting',
  templateUrl: './reporting.component.html',
  styleUrls: ['./reporting.component.scss']
})
export class ReportingComponent {
  schedulerIds: any = {};
  preferences: any = {};
  permission: any = {};
  isLoading: boolean;
  showTable: boolean;
  reloadState = 'no';
  weekStart = 1;
  dateFormat: string;
  viewDate: Date = new Date();
  clickData: any;
  filter: any = {};
  data: any = [];
  agentData: any = [];
  barChart: any;
  lineChart: any;

  colors = ['#90C7F5', '#C2b280', '#Aaf0d1', '#B38b6d', '#B2beb5', '#D4af37', '#8c92ac',
    '#FFCF8c', '#CDEB8B', '#FFC7C7', '#8B8BB4', '#Eedc82', '#B87333', '#97B0FF', '#D4af37', '#856088'];

  object = {
    searchText: '',
    successValue: 0,
    successCount: 0,
    failedValue: 0,
    failedCount: 0,
    workflowCount: 0,
    failedDuration: 0,
    failedDurationValue: 0,
    successDuration: 0,
    successDurationValue: 0,
    workflows: []
  };

  constructor(private coreService: CoreService, private groupBy: GroupByPipe, private authService: AuthService) {
  }

  ngOnInit(): void {
    this.preferences = sessionStorage['preferences'] ? JSON.parse(sessionStorage['preferences']) : {};
    this.schedulerIds = JSON.parse(this.authService.scheduleIds) || {};
    this.dateFormat = this.coreService.getDateFormat(this.preferences.dateFormat);
    this.filter = this.coreService.getReportingTab();
    if (this.filter.view !== 'Custom') {
      this.coreService.renderTimeSheetHeader({filter: this.filter}, this.weekStart, () => {
        this.loadData();
      });
    } else {
      this.loadData();
    }
  }

  private groupByData(data: any): any {
    const groupBy = this.groupBy.transform(data, 'WORKFLOW_PATH');
    this.object.workflowCount = groupBy.length;
    this.object.workflows = [];
    for (let i in groupBy) {
      const obj = {
        name: groupBy[i].key.substring(groupBy[i].key.lastIndexOf('/') + 1),
        workflowPath: groupBy[i].key,
        data: {}
      };

      const orderIds = [];
      const groupByOrderIds = this.groupBy.transform(groupBy[i].value, 'ORDER_ID');

      for (let k in groupByOrderIds) {
        orderIds.push({
          orderId: groupByOrderIds[k].key,
          startDate: groupByOrderIds[k].value[groupByOrderIds.length - 1]?.START_TIME,
          count: groupByOrderIds[k].value.length
        });
      }

      obj.data = {
        order: orderIds,
        data: groupBy[i].value,
        orderCount: groupByOrderIds.length
      };
      this.object.workflows.push(obj);
    }
  }

  loadData(): void {
    this.isLoading = false;
    const obj: any = {
      columns: ["ID", "CONTROLLER_ID", "ORDER_ID", "WORKFLOW_PATH", "WORKFLOW_VERSION_ID", "WORKFLOW_NAME", "POSITION", "JOB_NAME", "CRITICALITY", "AGENT_ID", "AGENT_NAME", "START_TIME", "END_TIME", "ERROR_STATE", "CREATED", "MODIFIED"]
    };
    const d = new Date(this.filter.endDate).setDate(new Date(this.filter.endDate).getDate() + 1);
    obj.controllerId = this.filter.current ? this.schedulerIds.selected : '';
    obj.dateFrom = new Date(this.filter.startDate);
    obj.dateTo = new Date(d);
    obj.timeZone = this.preferences.zone;
    this.coreService.plainData('reporting/order_steps', obj).subscribe({
      next: (res: any) => {
        const csvString = res.body;
        const rows = csvString.trim().split('\n');
        const headers = rows[0].split(';');
        const data = [];
        this.object.failedCount = 0;
        this.object.failedDuration = 0;
        this.object.successDuration = 0;
        const agents = {};
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i].split(';');
          const rowData = {};
          let startTime = new Date(row[headers.indexOf('START_TIME')]);
          let endTime = new Date(row[headers.indexOf('START_TIME')]);
          for (let j = 0; j < headers.length; j++) {
            if (headers[j] === 'ORDER_ID') {
              rowData[headers[j]] = row[j].substring(0, 24);
            } else {
              if (headers[j] === 'START_TIME' || headers[j] === 'END_TIME') {
                rowData[headers[j]] = this.coreService.stringToDate(this.preferences, row[j]);
                if (headers[j] === 'START_TIME') {
                  startTime = row[j];
                } else {
                  endTime = row[j];
                }
              } else {
                rowData[headers[j]] = row[j];
              }
            }
          }
          if (!agents[rowData['AGENT_ID']]) {
            agents[rowData['AGENT_ID']] = [];
          }

          if (agents[rowData['AGENT_ID']]) {
            agents[rowData['AGENT_ID']].push(rowData);
          }
          rowData['DURATION'] = this.coreService.getDuration(startTime, endTime);

          if (rowData['ERROR_STATE']?.toUpperCase() == 'FAILED') {
            this.object.failedDuration += rowData['DURATION'];
          } else {
            this.object.successDuration += rowData['DURATION'];
          }
          this.object.failedCount += rowData['ERROR_STATE']?.toUpperCase() == 'FAILED' ? 1 : 0;
          data.push(rowData);
        }
        const totalAvg = (this.object.failedDuration + this.object.successDuration) / data.length;
        this.object.successCount = data.length - this.object.failedCount;
        this.object.successValue = +((this.object.successCount / data.length * 100).toFixed(2));
        this.object.failedValue = +((this.object.failedCount / data.length * 100).toFixed(2));
        this.object.successDurationValue = +(((this.object.successDuration / data.length) / totalAvg * 100).toFixed(2));
        this.object.failedDurationValue = +(((this.object.failedDuration / data.length) / totalAvg * 100).toFixed(2));
        this.groupByAgent(agents);
        this.groupByData(data);
        // sort data by task id
        data.sort((a, b) => {
          return a.ID - b.ID;
        });

        this.data = data;
        this.isLoading = true;
      },
      error: () => {
        this.data = [];
        this.isLoading = true;
      }
    });
  }

  updateGraphData(workflow): void {
    this.jobExecutionData(workflow);
  }

  jobExecutionData(workflow): void {

    const jobData = workflow.data.data.reverse();
    // Organize data by job name and store durations directly under job names
    const groupedData = {};
    const jobNames = new Set();
    jobData.forEach(job => {
      if (!groupedData[job.JOB_NAME]) {
        groupedData[job.JOB_NAME] = [];
      }
      jobNames.add(job.JOB_NAME);
      groupedData[job.JOB_NAME].push({
        DURATION: job.DURATION,
        START_TIME: job.START_TIME,
        ERROR_STATE: job.ERROR_STATE
      });
    });

    if (this.lineChart) {
      this.lineChart.destroy();
    }

    // Extract unique sorted job names after sorting by start time
    const uniqueJobNames = Array.from(jobNames);

    // Prepare chart data with sorted keys
    const chartData = {
      labels: jobData.filter(job => uniqueJobNames.includes(job.JOB_NAME))
        .map(job => job.START_TIME).filter((obj, index, self) =>
          index === self.findIndex((o) => o === obj)
        ),
      datasets: uniqueJobNames.map((jobName: any) => {
        const errorStates = groupedData[jobName].map(item => item.ERROR_STATE);

        const pointBackgroundColors = errorStates.map(state => {
          return state === 'failed' ? 'red' : 'green';
        });

        const pointStyles = errorStates.map(state => {
          return state === 'failed' ? 'circle' : 'rect';
        });

        const pointRadii = errorStates.map(state => {
          return state === 'failed' ? 5 : 3;
        });
        return {
          label: jobName,
          data: groupedData[jobName].map(item => {
            return {
              x: item.START_TIME,
              y: item.DURATION // Duration
            };
          }),
          borderWidth: 1,
          fill: false,
          pointRadius: pointRadii,
          pointBackgroundColor: pointBackgroundColors,
          pointStyle: pointStyles
        };
      })
    };


    // Chart options
    const chartOptions = {
      legend: false,
      scales: {
        x: {
          adapters: {
            type: 'time',
            time: {
              unit: 'hour', // Adjust the time unit as needed
              displayFormats: {
                hour: 'MMM D HH:mm' // Format for displaying the time on x-axis
              }
            }

          },
          title: {display: false, text: 'Start Time'}
        },
        y: {title: {display: true, text: 'Duration'}, beginAtZero: true}
      }

    };

// Render the line chart
    const canvas = document.getElementById(workflow.workflowPath) as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    this.lineChart = new Chart(ctx, {
      type: 'line',
      data: chartData,
      options: chartOptions
    });

  }

  groupByAgent(agents): void {
    let setObj = new Set();
    let dataSet = [];


    let count = 0;
    for (let i in agents) {
      let arr = [];
      let groupByData = [];
      const groupBy = this.groupBy.transform(agents[i], 'START_TIME');

      groupBy.forEach(item => {
        if (item.value.length > 1) {
          setObj.add(item.key);
          arr.push(item.value.length);
          groupByData.push(item.value);
        }
      });

      dataSet.push({
        label: i,
        data: arr,
        groupByData: groupByData
      });
      // backgroundColor: this.colors[count]
      count += 1;
    }

    this.agentData = {
      labels: Array.from(setObj),
      datasets: dataSet
    };
    let delayed;
    const self = this;
    const config = {
      type: 'bar',
      data: this.agentData,
      options: {
        onClick: function (event, elements) {
          if (elements.length > 0) {
            const agentIndex = elements[0].datasetIndex;
            const clickedIndex = elements[0].index;
            self.clickData = {
              label: self.agentData.labels[clickedIndex],
              agentName: self.agentData.datasets[agentIndex].label,
              list: self.agentData.datasets[agentIndex].groupByData[clickedIndex]
            };
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
          y: {title: {display: true, text: 'Job Counts'}, beginAtZero: true}
        }
      }
    };
    if (this.barChart) {
      this.barChart.destroy();
    }
    const canvas = document.getElementById('bar-chart') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    this.barChart = new Chart(ctx, config);
  }

  showDataByCount(count): void {
    for (let i in this.agentData.datasets) {
      this.agentData.datasets[i].data = this.agentData.datasets[i].groupByData.map((item) => {
        return item.length >= count ? item.length : 0;
      });
    }
    this.barChart.update()
  }

  reload(): void {
    this.reloadState = 'yes';
    this.loadData();
  }

  /** Date filters */
  setView(view): void {
    this.filter.view = view;
    if (view !== 'Custom') {
      this.coreService.renderTimeSheetHeader({filter: this.filter}, this.weekStart, () => {
        this.loadData();
      });
    } else {
      this.filter.dateRange = [this.filter.startDate, this.filter.endDate];
    }
  }

  onChangeDate(): void {
    if (this.filter.dateRange) {
      this.filter.startDate = this.filter.dateRange[0];
      this.filter.endDate = this.filter.dateRange[1];
      this.loadData();
    }
  }

  prev(): void {
    if (this.filter.view === 'Month') {
      this.filter.startMonth = this.filter.startMonth - 1;
    } else {
      const d = new Date(this.filter.endDate);
      const time = d.setDate(d.getDate() - 8);
      this.filter.endDate = new Date(time).setHours(0, 0, 0, 0);
    }
    this.coreService.renderTimeSheetHeader({filter: this.filter}, this.weekStart, () => {
      this.loadData();
    });
  }

  next(): void {
    if (this.filter.view === 'Month') {
      this.filter.startMonth = this.filter.startMonth + 1;
    } else {
      const d = new Date(this.filter.endDate);
      const time = d.setDate(d.getDate() + 1);
      this.filter.endDate = new Date(time).setHours(0, 0, 0, 0);
    }
    this.coreService.renderTimeSheetHeader({filter: this.filter}, this.weekStart, () => {
      this.loadData();
    });
  }

  onChange = (date: Date) => {
    if (this.filter.view === 'Month') {
      this.filter.startMonth = new Date(date).getMonth();
      this.filter.startYear = new Date(date).getFullYear();
    } else {
      this.filter.endDate = new Date(date).setHours(0, 0, 0, 0);
    }
    this.coreService.renderTimeSheetHeader({filter: this.filter}, this.weekStart, () => {
      this.loadData();
    });
  }

  disabledDate = (current: Date): boolean => {
    return differenceInCalendarDays(current, this.viewDate) > 0;
  }

  /** Graph functions */

  getValue(val): string {
    return (isNaN(val) ? 0 : val.toFixed(2)) + ' %';
  }

  successColor(): string {
    return 'rgb(122,185,122)';
  }

  failedColor(): string {
    return 'rgb(239,72,106)';
  }

  toggleView(): void {
    this.showTable = !this.showTable;
  }

  /** Reporting */

  createReport(): void {

  }

  private downloadReport(): void {
    // Create a new instance of jsPDF
    var doc = new jsPDF();

    // Add content to the PDF
    doc.text("Hello, this is a simple PDF created using jsPDF!", 10, 10);

    // Save the PDF
    doc.save("example.pdf");
  }
}
