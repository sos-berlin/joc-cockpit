import {Component, EventEmitter, Input, Output, SimpleChanges} from '@angular/core';
import {groupBy, isEmpty} from "underscore";
import {CoreService} from "../../../services/core.service";

declare const $;

@Component({
  selector: 'app-projection',
  templateUrl: './projection.component.html',
  styleUrls: ['./projection.component.css']
})
export class ProjectionComponent {
  @Input() projectionData: any = [];
  @Input() filters: any;
  @Input() preferences: any;
  @Input() schedulerId: any;
  @Input() permission: any;
  @Input() isLoaded: boolean;
  @Input() showSearchPanel: boolean;

  @Output() onChange: EventEmitter<any> = new EventEmitter();
  @Output() onSearch: EventEmitter<any> = new EventEmitter();
  @Output() onCancel: EventEmitter<any> = new EventEmitter();

  filter: any = {
    workflowFolders: [],
    scheduleFolders: []
  };

  isVisible = false;

  schedule: any = {};

  scheduleTree = [];
  workflowTree = [];

  isHide: boolean;
  submitted: boolean;


  constructor(public coreService: CoreService) {
  }

  ngOnInit(): void {
    if (this.filters.filter && !isEmpty(this.filters.filter)) {
      this.filter = this.filters.filter;
      console.log(this.filter)
      console.log(this.showSearchPanel, this.isHide)
      if (!this.showSearchPanel) {
        this.showSearchPanel = true;
        this.isHide = true;
      }
      console.log(this.showSearchPanel, this.isHide, 'afetr.........')
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.projectionData) {
      if (changes['projectionData']) {
        this.showCalendar();
      }
    }

    if (changes['showSearchPanel']?.currentValue) {
      if (this.workflowTree.length == 0) {
        this.getWorkflowTree();
      }
      if (this.scheduleTree.length == 0) {
        this.getScheduleTree();
      }
    }
  }

  ngOnDestroy(): void {
    $('#full-calendar-projection')?.remove();
  }


  close(): void {
    this.isVisible = false;
  }

  open(event): void {
    this.isVisible = true;
    this.schedule = {
      loading: true,
      list: []
    };

    this.schedule.date = this.coreService.getDateByFormat(event.date, this.preferences.zone, 'YYYY-MM-DD');
    this.coreService.post('daily_plan/projections/date', {
      date: this.schedule.date
    }).subscribe({
      next: (res) => {
        this.schedule.planned = res.planned;
        const data = groupBy(res.periods, (res) => {
          return res.schedule;
        });
        for (const key of Object.keys(data)) {
          this.schedule.list.push(
            {
              schedule: key,
              periods: data[key]
            }
          )
        }
        this.schedule.loading = false;
      }, error: () => this.schedule.loading = false
    });
  }

  getPeriodStr(period): string {
    let periodStr = null;
    if (period.begin) {
      periodStr = this.coreService.getDateByFormat(period.begin, null, 'HH:mm:ss');
    }
    if (period.end) {
      periodStr = periodStr + '-' + this.coreService.getDateByFormat(period.end, null, 'HH:mm:ss');
    }
    if (period.singleStart) {
      periodStr = 'Single start: ' + this.coreService.getDateByFormat(period.singleStart, null, 'HH:mm:ss');
    } else if (period.repeat) {
      periodStr = periodStr + ' every ' + this.getTimeInString(period.repeat);
    }
    return periodStr;
  }

  private getTimeInString(time: any): string {
    if (time.toString().substring(0, 2) === '00' && time.toString().substring(3, 5) === '00') {
      return time.toString().substring(6, time.length) + ' seconds';
    } else if (time.toString().substring(0, 2) === '00') {
      return time.toString().substring(3, time.length) + ' minutes';
    } else if ((time.toString().substring(0, 2) != '00' && time.length === 5) || (time.length > 5 && time.toString().substring(0, 2) != '00' && (time.toString().substring(6, time.length) === '00'))) {
      return time.toString().substring(0, 5) + ' hours';
    } else {
      return time;
    }
  }

  private showCalendar(): void {
    this.isLoaded = false;
    const dom = $('#full-calendar-projection');
    if (!dom.data('calendar')) {
      $('#full-calendar-projection').calendar({
        language: this.coreService.getLocale(),
        view: this.filters.calView.toLowerCase(),
        renderEnd: (e) => {
          console.log(e)
          let reload = false;
          if (this.filters.calView.toLowerCase() !== e.view) {
            this.filters.calView = e.view == 'month' ? 'Month' : 'Year';
          }
          if (this.filters.currentYear !== e.currentYear || this.filters.currentMonth !== e.currentMonth) {
            reload = true;
          }
          if (reload && this.isLoaded) {
            this.onChange.emit(e);
          }
        },
        clickDay: (e) => {
          this.open(e);
        }
      });
      setTimeout(() => {
        $('#full-calendar-projection').data('calendar').setDataSource(this.projectionData);
        this.isLoaded = true;
      }, 10);
    } else {
      dom.data('calendar').setYearView({
        view: this.filters.calView.toLowerCase(),
        year: this.filters.currentYear
      });
      dom.data('calendar').setDataSource(this.projectionData);
      this.isLoaded = true;
    }
  }

  /* ----------- Advance Filter ------------ **/

  private getWorkflowTree(): void {
    this.coreService.post('tree', {
      controllerId: this.schedulerId,
      forInventory: false,
      types: ['WORKFLOW']
    }).subscribe((res) => {
      this.workflowTree = this.coreService.prepareTree(res, true);
    });
  }

  private getScheduleTree(): void {
    this.coreService.post('tree', {
      controllerId: this.schedulerId,
      forInventory: false,
      types: ['SCHEDULE']
    }).subscribe((res) => {
      this.scheduleTree = this.coreService.prepareTree(res, true);
    });
  }

  remove(path, flag = false): void {
    if (flag) {
      this.filter.workflowFolders.splice(this.filter.workflowFolders.indexOf(path), 1);
    } else {
      this.filter.scheduleFolders.splice(this.filter.scheduleFolders.indexOf(path), 1);
    }
  }

  onSubmit(): void {
    this.submitted = true;
    this.filter.submit = true;
    this.onSearch.emit(this.filter);
    setTimeout(() => {
      this.submitted = false;
    }, 800);
  }

  cancel(): void {
    this.submitted = false;
    this.filter = {};
    this.onCancel.emit();
  }


}
