import {Component, OnInit, Input, OnChanges, SimpleChanges} from '@angular/core';
import { differenceInHours, set, differenceInMinutes } from 'date-fns';

@Component({
  selector: 'app-gantt-chart',
  templateUrl: 'gantt-chart.component.html',
  styleUrls: ['gantt-chart.component.scss']
})
export class GanttChartComponent implements OnChanges {
  @Input() dayStart: any;
  @Input() dayEnd: any;
  @Input() tasks: any;
  @Input() isAgent: boolean;
  @Input() groupBy: any;
  dayStartHour: number;
  today = new Date();
  selectedDate = this.today;
  workingHours: number;

  constructor() {
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.prepareChart();
    this.prepareTasks();
  }

  prepareChart(): void {
    this.dayStartHour = this.getHourFromTime(this.dayStart);
    this.workingHours =
      this.diffFromTime(this.dayEnd, this.dayStart, 'hours') + 2;
  }

  prepareTasks(): void {
    this.tasks.map((task) => {
      task.width = this.diffFromTime(task.end, task.start, 'minutes');
      task.offset = this.diffFromTime(task.start, this.dayStart, 'minutes');
      if (task.statusList) {
        task.statusList.map((status, index) => {
          status.offset =
            this.diffFromTime(status.start, this.dayStart, 'minutes') + 13;
          if ((task.statusList[index + 1] && task.statusList[index + 1].start) || status.end) {
            if (!status.end) {
              status.end = task.statusList[index + 1].start;
            }
            status.width =
              this.diffFromTime(status.end, status.start, 'minutes') * 1;
          }
        });
      }
    });
  }

  onTaskClick(clickedTask): void {
    clickedTask.active = !clickedTask.active;
    if (clickedTask.isParent) {
      this.tasks.filter((task) => {
        if (task.parentID === clickedTask.id) {
          task.isHidden = !task.isHidden;
        }
      });
    }
  }

  getHourFromTime(timeStr): number {
    return Number(timeStr.split(':')[0]);
  }

  diffFromTime(endTime, StartTime, returnFormat: 'hours' | 'minutes'): any {
    const [endTimeHour, endTimeMinute] = endTime.split(':');
    const [StartTimeHour, StartTimeMinute] = StartTime.split(':');
    const taskEndDate = set(this.today, {
      hours: endTimeHour,
      minutes: endTimeMinute,
      seconds: 0
    });
    const taskStartDate = set(this.today, {
      hours: StartTimeHour,
      minutes: StartTimeMinute,
      seconds: 0
    });
    let res;
    switch (returnFormat) {
      case 'hours':
        res = differenceInHours(new Date(taskEndDate), new Date(taskStartDate));
        break;
      case 'minutes':
        res = differenceInMinutes(
          new Date(taskEndDate),
          new Date(taskStartDate)
        );
        break;

      default:
        break;
    }
    return res;
  }
}
