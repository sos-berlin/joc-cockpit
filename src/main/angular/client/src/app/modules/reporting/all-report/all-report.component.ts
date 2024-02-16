import {Component, ElementRef, Input, ViewChild} from '@angular/core';
import {NzModalService} from 'ng-zorro-antd/modal';
import {CoreService} from '../../../services/core.service';
import {DataService} from '../../../services/data.service';
import {AuthService} from '../../../components/guard';
import {GroupByPipe} from '../../../pipes/core.pipe';
import {Chart} from "chart.js";


@Component({
  selector: 'app-all-report',
  templateUrl: './all-report.component.html'
})
export class AllReportComponent {

  @Input({required: true}) reportData: any;
  schedulerIds: any = {};
  preferences: any = {};
  permission: any = {};
  isLoading: boolean;
  reloadState = 'no';
  weekStart = 1;
  dateFormat: string;
  viewDate: Date = new Date();
  clickData: any;
  filter: any = {};
  data: any = [];
  agentData: any = [];
  barChart: any;
  barChart2: any;
  lineChart: any;
  loading = false;
  agentGrouped: any;

  object = {
    searchText: '',
    successValue: 0,
    successCount: 0,
    inprogressCount: 0,
    failedValue: 0,
    failedCount: 0,
    failedDuration: 0,
    failedDurationValue: 0,
    successDuration: 0,
    successDurationValue: 0,
    workflows: []
  };

  index: number;


  /** Reporting */
  @ViewChild('content') content: ElementRef;


  constructor(private modal: NzModalService, private coreService: CoreService, private groupBy: GroupByPipe,
              private authService: AuthService, private dataService: DataService, private elementRef: ElementRef) {

  }

  ngOnInit(): void {
    this.preferences = sessionStorage['preferences'] ? JSON.parse(sessionStorage['preferences']) : {};
    this.permission = JSON.parse(this.authService.permission) || {};
    this.schedulerIds = JSON.parse(this.authService.scheduleIds) || {};
    this.dateFormat = this.coreService.getDateFormat(this.preferences.dateFormat);
    this.filter = this.coreService.getReportingTab();
    console.log(this.reportData)


   //   this.loadData();

  }

  countJobExecutionsPerMonth(data): void {
    const jobExecutionsPerMonth = {};

    // Iterate through the data and count job executions per month
    data.forEach(item => {
      const start_time = item['START_TIME'];
      if (start_time) {
        // Split the date string into components
        const [datePart, timePart] = start_time.split(' ');
        const [day, month, year] = datePart.split('.');
        const [hours, minutes, seconds] = timePart.split(':');

        // Create a new Date object using components
        const timestamp = new Date(+year, +month - 1, +day, +hours, +minutes, +seconds);

        // Check if the timestamp is valid
        if (!isNaN(timestamp.getTime())) {
          const monthKey = timestamp.toISOString().slice(0, 7); // Extracts year and month

          // Create an object for the month if it doesn't exist
          if (!jobExecutionsPerMonth[monthKey]) {
            jobExecutionsPerMonth[monthKey] = {
              count: 0,
              data: [],
            };
          }

          // Increment the count for the extracted month
          jobExecutionsPerMonth[monthKey].count++;
          jobExecutionsPerMonth[monthKey].data.push(item);
        } else {
          console.error('Invalid date format:', start_time);
        }
      }
    });

  }

  countOrderPerMonth(data): void {
    const ordersPerMonth = {};

    data.forEach(item => {
      const startTime = new Date(item.START_TIME); // Assuming START_TIME contains the date

      // Extract the year and month from the start time
      const year = startTime.getFullYear();
      const month = startTime.getMonth() + 1; // Months are zero-indexed, so adding 1 to get the correct month

      // Create a key in the format 'YYYY-MM'
      const monthKey = `${year}-${month.toString().padStart(2, '0')}`;

      // Increment the count for the extracted month
      if (!ordersPerMonth[monthKey]) {
        ordersPerMonth[monthKey] = {
          count: 1,
          data: [item], // Store the item in an array
        };
      } else {
        ordersPerMonth[monthKey].count++;
        ordersPerMonth[monthKey].data.push(item); // Add the item to the array
      }
    });

  }


  frequentlyFailedWorkflowsPerMonth(data): void {
    const failedWorkflowsPerMonth = {};

    // Iterate through the data and count failed workflows per month
    data.forEach(item => {
      const start_time = item['START_TIME'];
      const error_state = item['ERROR_STATE'];
      const workflow_path = item['WORKFLOW_PATH'];

      if (start_time && error_state && error_state.toLowerCase() === 'failed' && workflow_path) {
        // Split the date string into components
        const [datePart, timePart] = start_time.split(' ');
        const [day, month, year] = datePart.split('.');
        const [hours, minutes, seconds] = timePart.split(':');

        // Create a new Date object using components
        const timestamp = new Date(+year, +month - 1, +day, +hours, +minutes, +seconds);

        // Check if the timestamp is valid
        if (!isNaN(timestamp.getTime())) {
          const monthKey = timestamp.toISOString().slice(0, 7); // Extracts year and month

          // Create an object for the month if it doesn't exist
          if (!failedWorkflowsPerMonth[monthKey]) {
            failedWorkflowsPerMonth[monthKey] = {};
          }

          // Increment the count for failed workflows in the extracted month
          if (!failedWorkflowsPerMonth[monthKey][workflow_path]) {
            failedWorkflowsPerMonth[monthKey][workflow_path] = 1;
          } else {
            failedWorkflowsPerMonth[monthKey][workflow_path]++;
          }
        } else {
          console.error('Invalid date format:', start_time);
        }
      }
    });

    // Convert the extracted data to an array for sorting
    const sortedData = Object.entries(failedWorkflowsPerMonth).map(([key, value]) => ({
      month: key,
      workflows: value,
    }));

    // Sort the array based on the frequency of failed workflows
    sortedData.forEach(item => {
      item.workflows = Object.entries(item.workflows)
        .sort((a, b) => b[1] - a[1]) // Sort in descending order
        .slice(0, 10) // Extract the top 10 most frequent workflows
        .reduce((obj, [workflow, count]) => {
          obj[workflow] = count;
          return obj;
        }, {});
    });

  }



  private groupByData(data: any): any {
    const groupBy = this.groupBy.transform(data, 'WORKFLOW_PATH');
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
        let duration = 0;
        groupByOrderIds[k].value.forEach((item) => {
          duration += item.DURATION;
        });
        orderIds.push({
          orderId: groupByOrderIds[k].key,
          startDate: groupByOrderIds[k].value[groupByOrderIds[k].value.length - 1]?.START_TIME,
          duration: duration
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


        const rows: any = ''; //csvString.trim().split('\n');
        const headers = rows[0].split(';');
        const data = [];
        this.object.failedCount = 0;
        this.object.inprogressCount = 0;
        this.object.successCount = 0;
        this.object.failedDuration = 0;
        this.object.successDuration = 0;
        const agents = {};
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i].split(';');
          const rowData = {};
          let startTime = new Date(row[headers.indexOf('START_TIME')]);
          let endTime = row[headers.indexOf('END_TIME')] ? new Date(row[headers.indexOf('END_TIME')]) : new Date();
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
            this.object.failedCount += 1;
          } else {
            if (row[headers.indexOf('END_TIME')]) {
              this.object.successDuration += rowData['DURATION'];
            } else {
              this.object.inprogressCount += 1;
            }
          }

          data.push(rowData);
        }
        this.countJobExecutionsPerMonth(data)

        const totalAvg = (this.object.failedDuration + this.object.successDuration) / data.length;
        this.object.successCount = data.length - (this.object.failedCount + this.object.inprogressCount);
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


  }

  updateGraphData(workflow): void {
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
    if (this.barChart2) {
      this.barChart2.destroy();
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

    const chartOptions2 = {
      plugins: {
        legend: {
          display: false,
        }
      },
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
          title: {display: false, text: 'Workflow Start Time'}
        },
        y: {title: {display: true, text: 'Total Duration'}, beginAtZero: true}
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

    const workflowData = workflow.data.order.reverse();
    const chartData2 = {
      labels: workflowData.map(item => item.startDate),
      datasets: [{
        label: '',
        data: workflowData.map(item => {
          return {
            x: item.startDate,
            y: item.duration // Duration
          };
        }),
        borderWidth: 1,
        fill: false
      }]
    };

    const canvas2 = document.getElementById('workflow_' + workflow.workflowPath) as HTMLCanvasElement;
    const ctx2 = canvas2.getContext('2d');
    this.barChart2 = new Chart(ctx2, {
      type: 'bar',
      data: chartData2,
      options: chartOptions2
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
    if (canvas) {
      const ctx = canvas.getContext('2d');
      this.barChart = new Chart(ctx, config);
    }
  }

  showDataByCount(count): void {
    let labels = new Set();
    for (let i in this.agentData.datasets) {
      this.agentData.datasets[i].data = this.agentData.datasets[i].groupByData.map((item) => {
        if (item.length >= count) {
          item.forEach((obj) => {
            labels.add(obj.START_TIME);
          });
        }
        return item.length >= count ? item.length : 0;
      });
    }
    this.agentData.labels = Array.from(labels);
    this.barChart.update()
  }

  failedExecution(isChecked: boolean, workflow): void {
    const jobData = workflow.data.data.reverse();
    // Organize data by job name and store durations directly under job names
    const groupedData = {};
    const jobNames = new Set();
    jobData.forEach(job => {
      if (!isChecked || job['ERROR_STATE']?.toUpperCase() == 'FAILED') {
        if (!groupedData[job.JOB_NAME]) {
          groupedData[job.JOB_NAME] = [];
        }
        jobNames.add(job.JOB_NAME);
        groupedData[job.JOB_NAME].push({
          DURATION: job.DURATION,
          START_TIME: job.START_TIME,
          ERROR_STATE: job.ERROR_STATE
        });
      }
    });

    // Extract unique sorted job names after sorting by start time
    const uniqueJobNames = Array.from(jobNames);
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
    this.lineChart.data = chartData;
    this.lineChart.update();
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
    this.filter.showAgentTable = !this.filter.showAgentTable;
  }

  toggleJobView(): void {
    this.filter.showJobTable = !this.filter.showJobTable;
  }

}
