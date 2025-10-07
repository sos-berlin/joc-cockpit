import {Component, EventEmitter, inject, Input, Output, SimpleChanges} from '@angular/core';
import {NZ_MODAL_DATA, NzModalRef, NzModalService} from "ng-zorro-antd/modal";
import {TranslateService} from "@ngx-translate/core";
import {groupBy, isEmpty} from "underscore";
import {CoreService} from "../../../services/core.service";
import {SearchPipe} from "../../../pipes/core.pipe";
import {ExcelService} from "../../../services/excel.service";

declare const $;

@Component({
  standalone: false,
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
      obj.workflowFolders = this.filter.workflowFolders.map(path => ({ folder: path, recursive: true }));
    }
    if (this.filter.schedulePaths?.length > 0) {
      obj.schedulePaths = this.filter.schedulePaths;
    }
    if (this.filter.scheduleFolders?.length > 0) {
      obj.scheduleFolders = this.filter.scheduleFolders.map(path => ({ folder: path, recursive: true }));
    }

    this.coreService.post('daily_plan/projections/dates', obj).subscribe({
      next: (res) => {
        const rows = [];
        const allDates = new Set<string>();

        for (const yearKey in res.years) {
          for (const monthKey in res.years[yearKey]) {
            for (const dateKey in res.years[yearKey][monthKey]) {
              allDates.add(dateKey);

              const dateData = res.years[yearKey][monthKey][dateKey];
              const periods = dateData.periods || dateData.nonPeriods;

              if (periods && periods.length > 0) {
                periods.forEach(periodData => {
                  for (const controller in res.meta) {
                    if (res.meta[controller][periodData.schedule]) {
                      const workflows = res.meta[controller][periodData.schedule].workflowPaths || res.meta[controller][periodData.schedule].workflows;
                      const workflow = periodData.workflow || workflows[0];

                      if(workflows.includes(workflow)){
                        rows.push({
                          date: dateKey,
                          schedule: periodData.schedule,
                          controller: controller,
                          period: periodData.period,
                          isNonPeriod: !periodData.period,
                          workflow: workflow
                        });
                      }
                    }
                  }
                });
              }
            }
          }
        }

        this.submitted = false;
        const sortedDates = Array.from(allDates).sort();
        this.exportXsl(rows, sortedDates);
      }, error: () => this.submitted = false
    });
  }


  private async exportXsl(rows: any[], sortedDates: string[]): Promise<void> {
    const t = await this.translate.get([
      'dailyPlan.label.workflow', 'dailyPlan.label.schedule',
      'common.label.controllerId', 'common.label.yes'
    ]).toPromise();

    const workflowHeader = t['dailyPlan.label.workflow'];
    const scheduleHeader = t['dailyPlan.label.schedule'];
    const controllerIdHeader = t['common.label.controllerId'];
    const yesLabel = t['common.label.yes'];

    const pivotedData = new Map<string, any>();

    for (const row of rows) {
      const key = `${row.workflow}|${row.schedule}|${row.controller}`;
      if (!pivotedData.has(key)) {
        const newEntry = {
          [workflowHeader]: row.workflow,
          [scheduleHeader]: row.schedule,
        };
        if (!this.modalData.isCurrentController) {
          newEntry[controllerIdHeader] = row.controller;
        }
        pivotedData.set(key, newEntry);
      }

      const entry = pivotedData.get(key);
      const dateKey = row.date;

      let periodStr = '';
      if (this.filter.withoutStartTime && row.isNonPeriod) {
        periodStr = yesLabel;
      } else if (row.period) {
        periodStr = this.coreService.getPeriodStr(row.period, true);
      }

      entry[dateKey] = (entry[dateKey] ? entry[dateKey] + ', ' : '') + periodStr;
    }

    const finalData = [];
    const staticHeaders = [workflowHeader, scheduleHeader];
    if (!this.modalData.isCurrentController) {
      staticHeaders.push(controllerIdHeader);
    }

    for (const pivotedRow of pivotedData.values()) {
      const newRow = {};
      for(const header of staticHeaders){
        newRow[header] = pivotedRow[header];
      }
      for (const dateKey of sortedDates) {
        newRow[dateKey] = pivotedRow[dateKey] || '';
      }
      finalData.push(newRow);
    }

    this.excelService.exportAsExcelFile(finalData, this.filter.withoutStartTime ? 'JS7-dailyplan-projection-inverted-periods' : 'JS7-dailyplan-projection-periods');
    this.cancel();
  }

  cancel(): void {
    this.activeModal.destroy();
  }

}


@Component({
  standalone: false,
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
          this.schedule.numOfPeriods = res.numOfOrders ?? 0;
        } else {
          this.schedule.numOfNonPeriods = res.numOfOrders ?? res.numOfNonPeriods ?? 0;
        }

        const periodsArray = res.periods || res.nonPeriods || [];
        const list: Array<{
          schedule: string;
          workflow: string;
          periods: any[];
          orderNames: string[];
          period?: string;
          controller?: string;
        }> = [];

        const isPlannedWithWf = res.planned && periodsArray.some(p => !!(p as any).workflow);

        for (const controllerId in res.meta) {
          if (isPlannedWithWf) {
            const byKey = groupBy(
              periodsArray,
              p => `${p.schedule}||${(p as any).workflow}||${(p as any).scheduleOrderName ?? ''}`
            );
            for (const key of Object.keys(byKey)) {
              const [schedule, workflow, scheduleOrderName] = key.split('||');
              if (res.meta[controllerId][schedule]) {
                const bucket = byKey[key];
                const uniquePeriods = bucket.reduce((acc, cur) => {
                  if (!acc.find(x =>
                    x.period.singleStart === cur.period.singleStart &&
                    x.period.begin === cur.period.begin &&
                    x.period.end === cur.period.end
                  )) {
                    acc.push(cur);
                  }
                  return acc;
                }, [] as any[]);
                const orderNames = scheduleOrderName ? [scheduleOrderName] : [];
                list.push({ schedule, workflow, periods: uniquePeriods, orderNames, controller: controllerId });
              }
            }
          } else {
            const bySched = groupBy(periodsArray, p => p.schedule);
            for (const schedule of Object.keys(bySched)) {
              if (res.meta[controllerId][schedule]) {
                const bucket = bySched[schedule];
                const uniquePeriods = bucket.reduce((acc, cur) => {
                  if (!acc.find(x =>
                    x.period.singleStart === cur.period.singleStart &&
                    x.period.begin === cur.period.begin &&
                    x.period.end === cur.period.end
                  )) {
                    acc.push(cur);
                  }
                  return acc;
                }, [] as any[]);

                const metaForSched = res.meta[controllerId][schedule] || {};
                const workflows = metaForSched.workflowPaths || [];
                const orderNames = metaForSched.orderNames || [];
                workflows.forEach(workflow => {
                  list.push({ schedule, workflow, periods: uniquePeriods, orderNames, controller: controllerId });
                });
              }
            }
          }
        }

        const uniqueList = Array.from(new Map(list.map(item => [`${item.controller}|${item.schedule}|${item.workflow}`, item])).values());

        uniqueList.forEach(item => {
          const first = item.periods?.[0]?.period;
          item.period = first?.singleStart || first?.begin || '';
        });

        this.schedule.list = uniqueList;
        this.loading = false;
        this.searchInResult();
      },
      error: () => this.loading = false
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
  standalone: false,
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
      this.schedule.date = this.coreService.getDateByFormat(event.date, null, 'YYYY-MM-DD');
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

  private getDate(date): string {
    return this.coreService.getDateByFormat(date, this.preferences.zone, 'YYYY-MM-DD');
  }

  private showCalendar(): void {
    this.isLoaded = false;
    const dom = $('#full-calendar-projection');
    const dateStr   = this.getDate(this.filters.calStartDate);
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
