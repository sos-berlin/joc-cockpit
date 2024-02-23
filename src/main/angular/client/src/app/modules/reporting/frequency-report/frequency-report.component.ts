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
  dataset: any =[];
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
    this.selectedIds = this.report.map(item => item.id);
    this.loadData();

  }


  loadData(): void {
    this.isLoading = false;
    this.coreService.post('reporting/report/history', {compact: false, ids: this.selectedIds}).subscribe({
      next: (res: any) => {
        this.isLoading = true;
        this.compareMultiReports = res.reports
        if(res.reports.length > 0) {
          this.report.data = res.reports[0].data;
          if (this.report.data.length > 0 && this.report.data[0].data) {
            setTimeout(() => {
              this.generateDonutCharts()
            },100)
          }
        }
      }, error: () => this.isLoading = true
    });

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

  generateDonutCharts(): void {
    // Loop through your data and create a donut chart for each report
    for (const report of this.compareMultiReports) {
      const totalItems = report.data.length; // Get the total number of items in the report data

      const data = {
        labels: [], // Label array for data
        datasets: [{ // Dataset array
          label: 'Job Counts', // Dataset label
          data: [], // Data array for the dataset
          backgroundColor: [], // Background color array for the dataset
          borderColor: [], // Border color array for the dataset
          borderWidth: 1, // Border width
          hoverBackgroundColor: [], // Hover background color array for the dataset
          hoverBorderColor: [], // Hover border color array for the dataset
        }]
      };

      let totalJobCount = 0; // Variable to store the total job count
      // Populate data arrays from the report data
      for (let i = 0; i < report.data.length; i++) {
        const item = report.data[i];
        data.labels.push(item.start_time); // Add job name as label
        data.datasets[0].data.push(item.count); // Add count as data
        totalJobCount += item.count; // Add count to the total job count
        // Calculate background color using the getShadeColor function
        const backgroundColor = this.getShadeColor(i, totalItems);
        data.datasets[0].backgroundColor.push(backgroundColor); // Add background color
        data.datasets[0].borderColor.push('white'); // Add border color

        // Add gray hover color
        data.datasets[0].hoverBackgroundColor.push('#e0e0e2'); // Gray hover color
        data.datasets[0].hoverBorderColor.push('#e0e0e2'); // Gray hover color
      }

      // Create a canvas element for each chart
      const canvas = document.createElement('canvas');
      canvas.classList.add('donut-chart');

      const containerId = 'donut-chart-container-' + report.id;
      const container = document.getElementById(containerId);

      if (container) {
        container.appendChild(canvas);
      } else {
        console.error('Container element not found:', containerId);
      }
      const innerLabel = {
        id: 'innerLabel',
        afterDatasetDraw(chart, args, pluginOptions) {
          const { ctx } = chart;
          const meta = args.meta;
          const xCoor = meta.data[0].x;
          const yCoor = meta.data[0].y;
          const perc = totalJobCount;
          ctx.save();
          ctx.textAlign = 'center';
          ctx.font = '32px sans-serif';
          ctx.fillText(perc, xCoor, yCoor); // Drawing the number with larger font size
          ctx.font = '16px sans-serif'; // Changing the font size for the "jobs" text
          ctx.fillText(' jobs', xCoor, yCoor + 20); // Drawing the "jobs" text with smaller font size
          ctx.restore();
        },
      };

      // Generate the chart
      new Chart(canvas, {
        type: 'doughnut',
        data: data,
        plugins: [innerLabel],
        options: {
          cutout: 100,
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
              labels: {

              },
              position: "bottom"
            },
          }
        }

      });
    }
  }




  getShadeColor(index: number, totalItems: number): string {
    const maxShade = 200; // Maximum shade value to avoid pure white
    const baseColor = [129,210,199]; // Base blue color
    const shadeStep = maxShade / totalItems; // Calculate step for varying shades
    const shade = Math.floor(maxShade - index * shadeStep); // Calculate shade based on index
    return `rgba(${baseColor.join(',')}, ${shade / 255})`; // Return rgba color with varying alpha (transparency)
  }






}
