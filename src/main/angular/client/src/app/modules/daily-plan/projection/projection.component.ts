import {Component, EventEmitter, inject, Input, Output, SimpleChanges} from '@angular/core';
import {NZ_MODAL_DATA, NzModalRef, NzModalService} from "ng-zorro-antd/modal";
import {groupBy, isEmpty} from "underscore";
import {CoreService} from "../../../services/core.service";
import {SearchPipe} from "../../../pipes/core.pipe";

declare const $;

@Component({
  selector: 'app-projection-dialog-modal-content',
  templateUrl: './projection-dialog.html'
})
export class ShowProjectionModalComponent {
  readonly modalData: any = inject(NZ_MODAL_DATA);
  schedule: any = {};
  preferences: any = {};
  permission: any = {};
  filter: any = {};
  data: any = [];
  schedulerId = '';
  isCurrentController: boolean;
  loading = true;

  searchableProperties = ['workflow', 'schedule', 'periods']

  constructor(public activeModal: NzModalRef, public coreService: CoreService,
              private searchPipe: SearchPipe) {
  }

  ngOnInit(): void {
    this.schedule = this.modalData.schedule;
    this.permission = this.modalData.permission;
    this.preferences = this.modalData.preferences;
    this.filter = this.modalData.filter;
    this.schedulerId = this.modalData.schedulerId;
    this.isCurrentController = this.modalData.isCurrentController;
    this.loadData();
  }

  private loadData(): void {
    this.coreService.post('daily_plan/projections/date', this.modalData.obj).subscribe({
      next: (res) => {
        const data = groupBy(res.periods, (res) => {
          return res.schedule;
        });

        for (const key of Object.keys(data)) {
          for (const controller of Object.keys(res.meta)) {
           
            let workflows = res.meta[controller][key].workflowPaths || res.meta[controller][key].workflows;
            workflows.forEach(workflow => {
              this.schedule.list.push(
                {
                  schedule: key,
                  periods: data[key],
                  workflow: workflow
                }
              )
            })
          }
        }
        this.loading = false;
        this.searchInResult();
      }, error: () => this.loading = false
    });
  }

  searchInResult(): void {
    this.data = this.filter.searchText ? this.searchPipe.transform(this.schedule.list, this.filter.searchText, this.searchableProperties) : this.schedule.list;
    this.data = [...this.data];
  }

  sort(propertyName: string): void {
    this.filter.reverse = !this.filter.reverse;
    this.filter.sortBy = propertyName;
  }

  pageIndexChange($event: number): void {
    this.filter.currentPage = $event;
  }

  pageSizeChange($event: number): void {
    this.filter.entryPerPage = $event;
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

  cancel(): void {
    this.activeModal.destroy();
  }

}

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

  @Input() showSearchPanel: boolean;
  @Input() isCurrentController: boolean;

  @Output() onChange: EventEmitter<any> = new EventEmitter();
  @Output() onSearch: EventEmitter<any> = new EventEmitter();
  @Output() onCancel: EventEmitter<any> = new EventEmitter();

  isLoaded: boolean;
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


  constructor(public coreService: CoreService, private modal: NzModalService) {
  }

  ngOnInit(): void {
    if (this.filters.filter && !isEmpty(this.filters.filter)) {
      this.filter = this.filters.filter;
      if (!this.showSearchPanel) {
        this.showSearchPanel = true;
        this.isHide = true;
      }
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
    if (event.events?.length > 0) {
      this.isVisible = true;
      this.schedule = {
        loading: true,
        list: []
      };
      this.schedule.date = this.coreService.getDateByFormat(event.date, this.preferences.zone, 'YYYY-MM-DD');
      const obj: any = {
        date: this.schedule.date
      };
      if (this.isCurrentController) {
        obj.controllerIds = [this.schedulerId];
      }
      if (this.filters.filter) {
        if (this.filters.filter.workflowPaths?.length > 0) {
          obj.workflowPaths = this.filters.filter.workflowPaths;
        }
        if (this.filters.filter.workflowFolders?.length > 0) {
          obj.workflowFolders = [];
          this.filters.filter.workflowFolders.forEach((path) => {
            obj.workflowFolders.push({
              folder: path,
              recursive: true
            })
          })
        }
        if (this.filters.filter.schedulePaths?.length > 0) {
          obj.schedulePaths = this.filters.filter.schedulePaths;
        }
        if (this.filters.filter.scheduleFolders?.length > 0) {
          obj.scheduleFolders = [];
          this.filters.filter.scheduleFolders.forEach((path) => {
            obj.scheduleFolders.push({
              folder: path,
              recursive: true
            })
          })
        }
      }

      this.modal.create({
        nzTitle: undefined,
        nzContent: ShowProjectionModalComponent,
        nzClassName: 'lg',
        nzData: {
          schedule: this.schedule,
          permission: this.permission,
          preferences: this.preferences,
          filter: this.filters.showDetail,
          schedulerId: this.schedulerId,
          isCurrentController: this.isCurrentController,
          obj
        },
        nzFooter: null,
        nzAutofocus: undefined,
        nzClosable: false,
        nzMaskClosable: false
      });
    }
  }

  private showCalendar(): void {
    this.isLoaded = false;
    const dom = $('#full-calendar-projection');
    if (!dom.data('calendar')) {
      $('#full-calendar-projection').calendar({
        language: this.coreService.getLocale(),
        view: this.filters.calView.toLowerCase(),
        dataSource: this.projectionData,
        renderEnd: (e) => {
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
