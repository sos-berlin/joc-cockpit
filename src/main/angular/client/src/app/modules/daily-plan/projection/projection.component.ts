import {Component, ElementRef, Input, ViewChild} from '@angular/core';
import {CoreService} from "../../../services/core.service";
import {isEmpty} from "underscore";

@Component({
  selector: 'app-projection',
  templateUrl: './projection.component.html',
  styleUrls: ['./projection.component.css']
})
export class ProjectionComponent {
  @Input() projectionData: any;
  @Input() groupBy: any;
  @Input() preferences: any;
  @Input() toggle: boolean;
  @Input() isLoaded: boolean;

  data: any[] = [];


  @ViewChild('ztgantt', {static: true}) element: ElementRef;

  constructor(private coreService: CoreService) {
  }

  ngOnChanges(): void {
    if(this.projectionData && !isEmpty(this.projectionData)) {
      this.groupData(this.projectionData);
    }
  }

  private render() {
    let ZT_Gantt = new window['ztGantt'](this.element.nativeElement);
    ZT_Gantt.options.columns = [
      {
        name: "text",
        width: 245,
        min_width: 80,
        max_width: 300,
        tree: true,
        label: "Schedules",
        resize: true,
        template: (task) => {
          return `<span>${task.text}</span>`;
        },
      },
    ];
    ZT_Gantt.templates.task_drag = (mode, task) => {
      return false;
    };
    ZT_Gantt.options.scales = [
      {
        unit: "year",
        step: 1,
        format: '%Y'
      },
      {unit: "month", step: 1, format: "%F"},
      {unit: "day", step: 1, format: "%d"},
    ];

    let lowestStartDate = null;
    let highestEndDate = null;
    this.data.forEach((group) => {
      const itemStartDate = new Date(group.start_date).getTime();
      const itemEndDate = new Date(group.end_date).getTime();
      if (lowestStartDate === null || itemStartDate < lowestStartDate) {
        lowestStartDate = itemStartDate;
      }
      if (highestEndDate === null || itemEndDate > highestEndDate) {
        highestEndDate = itemEndDate;
      }
    });
    ZT_Gantt.templates.taskbar_text = function (start, end, task) {
      return task.count
    };

    ZT_Gantt.templates.taskbar_text = function (start, end, task) {
      return task.count
    }; ZT_Gantt.templates.tooltip_text = function (start, end, task) {
      return (
        "<b>Schedule:</b> " +
        task.text +
        "<br/><b>Start date:</b> " +
        new Date(start) +
        "<br/><b>End date:</b> " +
        new Date(end)
      );
    };
    ZT_Gantt.options.date_format = '%Y-%m-%dT%H:%i:%sZ';
    ZT_Gantt.options.localLang = "en";
    ZT_Gantt.options.data = this.data;
    ZT_Gantt.options.collapse = false;
    ZT_Gantt.options.taskProgress = false;
    ZT_Gantt.options.minColWidth = 48;
    ZT_Gantt.options.row_height = 30;
    ZT_Gantt.options.weekends = [];
    ZT_Gantt.options.fullWeek = true;
    ZT_Gantt.options.updateLinkOnDrag = true;
    ZT_Gantt.options.splitTask = true;
    ZT_Gantt.options.addLinks = false;
    ZT_Gantt.options.startDate = lowestStartDate
    ZT_Gantt.options.endDate = highestEndDate
    ZT_Gantt.render();
  }

  groupData(data) {
    const flattenedData = [];
    let scheduleIdCounter = 1;
    for (const yearKey of Object.keys(data)) {
      const yearData = data[yearKey];
      for (const monthKey of Object.keys(yearData)) {
        const monthData = yearData[monthKey];

        for (const dateKey of Object.keys(monthData)) {
          const dateData = monthData[dateKey];
          const datePeriods = dateData.periods;
          const scheduleCounts = {};

          datePeriods.forEach((period) => {
            const schedule = period.schedule;
            const start_date = dateKey;
            const end_date = dateKey;
            const repeat = period.period.repeat;

            if (!scheduleCounts[schedule]) {
              scheduleCounts[schedule] = 0;
            }

            scheduleCounts[schedule]++;

            let scheduleItem = flattenedData.find((item) => item.text === schedule);

            if (!scheduleItem) {
              scheduleItem = {id: scheduleIdCounter++, text: schedule};
              flattenedData.push(scheduleItem);
            }

            const item = {
              text: schedule,
              start_date,
              end_date,
              repeat,
              parent: scheduleItem.id,
              count: scheduleCounts[schedule],
            };

            flattenedData.push(item);
          });
        }

      }
    }
    this.data = flattenedData;
    this.render();
  }
}
