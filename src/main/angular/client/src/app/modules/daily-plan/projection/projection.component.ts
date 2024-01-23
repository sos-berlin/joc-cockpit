import {Component, EventEmitter, inject, Input, Output, SimpleChanges} from '@angular/core';
import {NZ_MODAL_DATA, NzModalRef, NzModalService} from "ng-zorro-antd/modal";
import {TranslateService} from "@ngx-translate/core";
import {groupBy, isEmpty} from "underscore";
import {CoreService} from "../../../services/core.service";
import {SearchPipe} from "../../../pipes/core.pipe";
import {ExcelService} from "../../../services/excel.service";

declare const $;

@Component({
  selector: 'app-projection-export-modal',
  templateUrl: './export-dialog.html'
})
export class ExportComponent {
  readonly modalData: any = inject(NZ_MODAL_DATA);
  schedulerId: any;
  dateFormat: any;
  preferences: any;
  submitted = false;
  filter: any = {
    workflowFolders: [],
    scheduleFolders: []
  };
  workflowTree = [];
  scheduleTree = [];

  constructor(public activeModal: NzModalRef, public coreService: CoreService,
              private translate: TranslateService, private excelService: ExcelService) {
  }

  ngOnInit(): void {
    this.schedulerId = this.modalData.schedulerId;
    this.preferences = this.modalData.preferences;
    this.dateFormat = this.coreService.getDateFormat(this.preferences.dateFormat);
    if (this.workflowTree.length == 0) {
      this.getWorkflowTree();
    }
    if (this.scheduleTree.length == 0) {
      this.getScheduleTree();
    }
  }

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
    let obj: any = {
      controllerIds: [],
      withoutStartTime: this.filter.withoutStartTime,
      dateFrom: this.coreService.getDateByFormat(this.filter.dateFrom, this.preferences.zone, 'YYYY-MM-DD'),
      dateTo: this.coreService.getDateByFormat(this.filter.dateTo, this.preferences.zone, 'YYYY-MM-DD')
    };

    if (this.modalData.isCurrentController) {
      obj.controllerIds.push(this.schedulerId);
    }

    if (this.filter.workflowPaths?.length > 0) {
      obj.workflowPaths = this.filter.workflowPaths;
    }
    if (this.filter.workflowFolders?.length > 0) {
      obj.workflowFolders = [];
      this.filter.workflowFolders.forEach((path) => {
        obj.scheduleFolders.push({
          folder: path,
          recursive: true
        })
      })
    }
    if (this.filter.schedulePaths?.length > 0) {
      obj.schedulePaths = this.filter.schedulePaths;
    }
    if (this.filter.scheduleFolders?.length > 0) {
      obj.scheduleFolders = [];
      this.filter.scheduleFolders.forEach((path) => {
        obj.scheduleFolders.push({
          folder: path,
          recursive: true
        })
      })
    }

    this.coreService.post('daily_plan/projections/dates', obj).subscribe({
      next: (res) => {
        const rows = [];
        for (const yearKey of Object.keys(res.years)) {
          const yearData = res.years[yearKey];
          for (const monthKey of Object.keys(yearData)) {
            const monthData = yearData[monthKey];
            for (const dateKey of Object.keys(monthData)) {
              const dateData = monthData[dateKey];
              const group = groupBy(dateData.periods || dateData.nonPeriods, (res) => {
                return res.schedule;
              });
              for (const key of Object.keys(group)) {
                for (const controller of Object.keys(res.meta)) {
                  let workflows = res.meta[controller][key].workflowPaths || res.meta[controller][key].workflows;
                  workflows.forEach(workflow => {
                    rows.push(
                      {
                        date: dateKey,
                        schedule: key,
                        controller: controller,
                        periods: group[key],
                        workflow: workflow
                      }
                    )
                  })
                }
              }
            }
          }
        }

        this.submitted = false;
        this.exportXsl(rows);
      }, error: () => this.submitted = false
    });


  }

  private exportXsl(rows): void {
    const data = [];
    let date = '', workflow = '', schedule = '', period = '', controllerId = '', yes = '';
    this.translate.get('user.label.date').subscribe(translatedValue => {
      date = translatedValue;
    });
    this.translate.get('dailyPlan.label.workflow').subscribe(translatedValue => {
      workflow = translatedValue;
    });
    this.translate.get('dailyPlan.label.schedule').subscribe(translatedValue => {
      schedule = translatedValue;
    });
    this.translate.get('runtime.label.period').subscribe(translatedValue => {
      period = translatedValue;
    });
    this.translate.get('common.label.controllerId').subscribe(translatedValue => {
      controllerId = translatedValue;
    });
    this.translate.get('common.label.yes').subscribe(translatedValue => {
      yes = translatedValue;
    });
    for (let i = 0; i < rows.length; i++) {
      let obj: any = {};
      let periodStr = '';
      obj[workflow] = rows[i].workflow;
      obj[schedule] = rows[i].schedule;
      if (!this.modalData.isCurrentController) {
        obj[controllerId] = rows[i].controller;
      }
      const _date = this.coreService.getDateByFormat(rows[i].date, this.preferences.zone, 'YYYY-MM-DD');
      if (rows[i].periods) {
        rows[i].periods.forEach((p, index) => {
          if (p['period']) {
            if (index == 0) {
              periodStr = this.coreService.getPeriodStr(p['period'], true);
            } else {
              periodStr += ', ' + this.coreService.getPeriodStr(p['period'], true);
            }
          } else {
            periodStr = yes;
          }
        })
      }

      obj[_date] = periodStr;
      let flag = true;
      if (data.length > 0 && data[data.length - 1]) {
        // Merge data for the same key
        for (let j = 0; j < data.length; j++) {
          if (data[j][_date] === obj[_date]) {
            break;
          } else {
            if (data[j][workflow] === obj[workflow] && data[j][schedule] === obj[schedule] && data[j][controllerId] === obj[controllerId]) {
              data[j][_date] = periodStr;
              flag = false;
              break;
            }
          }
        }
      }

      if (flag) {
        data.push(obj);
      }
    }

    this.excelService.exportAsExcelFile(data, this.filter.withoutStartTime ? 'JS7-dailyplan-projection-inverted-periods' : 'JS7-dailyplan-projection-periods');
    this.cancel();
  }

  cancel(): void {
    this.activeModal.destroy();
  }

}


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
        this.schedule.isPlanned = res.planned;
        if (!this.modalData.obj.withoutStartTime) {
          this.schedule.numOfPeriods = res.numOfPeriods;
        } else {
          this.schedule.numOfNonPeriods = res.numOfPeriods || res.numOfNonPeriods;
        }
        const data = groupBy(res.periods || res.nonPeriods, (res) => {
          return res.schedule;
        });

        for (const key of Object.keys(data)) {

          const uniqueArray =  data[key].reduce((accumulator, current) => {
            const existingObject = accumulator.find(obj => obj.schedule === current.schedule && obj.period.singleStart === current.period.singleStart);
            if (!existingObject) {
              accumulator.push(current);
            }
            return accumulator;
          }, []);

          for (const controller of Object.keys(res.meta)) {
            let workflows = res.meta[controller][key].workflowPaths || res.meta[controller][key].workflows;
            workflows.forEach(workflow => {

              this.schedule.list.push(
                {
                  schedule: key,
                  periods: uniqueArray,
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
        withoutStartTime: this.filters.withoutStartTime,
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
      dom.calendar({
        language: this.coreService.getLocale(),
        view: this.filters.calView.toLowerCase(),
        startYear: this.filters.currentYear,
        startMonth: this.filters.currentMonth,
        dataSource: this.projectionData,
        renderEnd: (e) => {
          let reload = false;
          if (this.filters.calView.toLowerCase() !== e.view) {
            this.filters.calView = e.view == 'month' ? 'Month' : 'Year';
            reload = true;
          } else if (this.filters.currentYear !== e.currentYear || this.filters.currentMonth !== e.currentMonth) {
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
      if (this.filters.calView.toLowerCase() !== dom.data('calendar').getView()) {
        dom.data('calendar').setYearView({
          view: this.filters.calView.toLowerCase(),
          year: this.filters.currentYear
        });
      }
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
