import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component, Directive, forwardRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges
} from '@angular/core';
import {clone, isEmpty, isEqual} from 'underscore';
import {AbstractControl, NG_VALIDATORS, Validator} from "@angular/forms";
import {Subscription} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import {NzModalService} from 'ng-zorro-antd/modal';
import {AuthService} from "../../../../components/guard";
import {CoreService} from '../../../../services/core.service';
import {DataService} from '../../../../services/data.service';
import {InventoryObject} from '../../../../models/enums';
import {CommentModalComponent} from '../../../../components/comment-modal/comment.component';
import * as moment from 'moment';

@Directive({
  selector: '[appMonthValidate]',
  providers: [
    { provide: NG_VALIDATORS, useExisting: forwardRef(() => MonthValidator), multi: true }
  ]
})
export class MonthValidator implements Validator {
  @Input('appMonthValidate') monthFrom: string;

  validate(c: AbstractControl): { [key: string]: any } | null {
    const v = c.value;

    if (v != null && v !== '') {
      const regex = /^\s*(([+-]*\d+\s*[MmQqYy]|\d{4}-(0[1-9]|1[0-2])))\s*$/;
      if (regex.test(v)) {
        if (this.monthFrom && regex.test(this.monthFrom)) {
          const unitV = this.extractUnit(v);
          const unitMonthFrom = this.extractUnit(this.monthFrom);

          if (this.isDate(v) && this.isDate(this.monthFrom)) {
            const dateV = new Date(v + "-01");
            const dateMonthFrom = new Date(this.monthFrom + "-01");
            if (dateV < dateMonthFrom) {
              return { monthFromAfterMonthTo: true };
            }
          } else {
            const absoluteDateV = this.convertToAbsoluteMonths(v);
            const absoluteDateMonthFrom = this.convertToAbsoluteMonths(this.monthFrom);
            if (absoluteDateV < absoluteDateMonthFrom) {
              return { monthFromAfterMonthTo: true };
            }
          }

          return null;
        }
        return null;
      }
    } else {
      return null;
    }
    return { invalidMonth: true };
  }

  private isDate(value: string): boolean {
    return /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
  }

  private extractUnit(value: string): string {
    if (this.isDate(value)) {
      return 'D';
    }
    return value.slice(-1).toUpperCase();
  }

  private convertToAbsoluteMonths(value: string): number {
    const now = new Date();
    let totalMonths = now.getFullYear() * 12 + now.getMonth() + 1; // Current year and month as total months

    if (this.isDate(value)) {
      const [year, month] = value.split('-').map(Number);
      return year * 12 + (month - 1);
    }

    const number = parseInt(value.slice(0, -1), 10);
    const unit = value.slice(-1).toUpperCase();

    switch (unit) {
      case 'Y':
        totalMonths -= number * 12;
        break;
      case 'Q':
        totalMonths -= number * 3;
        break;
      case 'M':
        totalMonths -= number;
        break;
    }

    return totalMonths;
  }
}

@Directive({
  selector: '[appRelativeMonthValidate]',
  providers: [
    {provide: NG_VALIDATORS, useExisting: forwardRef(() => RelativeMonthValidator), multi: true}
  ]
})
export class RelativeMonthValidator implements Validator {
  validate(c: AbstractControl): { [key: string]: any } {
    let v = c.value;
    if (v != null) {
      if (v == '') {
        return null;
      }
      if (/^\s*(([+-]*\d+\s*[MmQqYy]|\d{4}-(0[1-9]|1[0-2])))\s*$/.test(v)) {
        return null;
      }
    } else {
      return null;
    }
    return {
      invalidMonth: true
    };
  }
}

@Component({
  selector: 'app-report',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './report.component.html'
})
export class ReportComponent implements OnChanges, OnDestroy {
  @Input() preferences: any;
  @Input() permission: any;
  @Input() schedulerId: any;
  @Input() data: any;
  @Input() copyObj: any;
  @Input() reload: any;
  @Input() isTrash: any;

  report: any = {};
  isVisible: boolean;
  isUnique = true;
  objectType = InventoryObject.REPORT;
  invalidMsg: string;
  isLocalChange = '';
  indexOfNextAdd = 0;
  history = [];
  templates = [
    {templateName: "WORKFLOWS_FREQUENTLY_FAILED", title: "reporting.templates.WORKFLOWS_FREQUENTLY_FAILED"},
    {templateName: "JOBS_FREQUENTLY_FAILED", title: "reporting.templates.JOBS_FREQUENTLY_FAILED"},
    {templateName: "AGENTS_PARALLEL_JOB_EXECUTIONS", title: "reporting.templates.AGENTS_PARALLEL_JOB_EXECUTIONS"},
    {templateName: "JOBS_EXECUTIONS_FREQUENCY", title: "reporting.templates.JOBS_EXECUTIONS_FREQUENCY"},
    {templateName: "ORDERS_EXECUTIONS_FREQUENCY", title: "reporting.templates.ORDERS_EXECUTIONS_FREQUENCY"},
    {templateName: "WORKFLOWS_LONGEST_EXECUTION_TIMES", title: "reporting.templates.WORKFLOWS_LONGEST_EXECUTION_TIMES"},
    {templateName: "JOBS_LONGEST_EXECUTION_TIMES", title: "reporting.templates.JOBS_LONGEST_EXECUTION_TIMES"},
    {templateName: "PERIODS_MOST_ORDER_EXECUTIONS", title: "reporting.templates.PERIODS_MOST_ORDER_EXECUTIONS"},
    {templateName: "PERIODS_MOST_JOB_EXECUTIONS", title: "reporting.templates.PERIODS_MOST_JOB_EXECUTIONS"},
    {templateName: "JOBS_SUCCESSFUL_EXECUTIONS", title: "reporting.templates.JOBS_SUCCESSFUL_EXECUTIONS"},
    {templateName: "WORKFLOWS_SUCCESSFUL_EXECUTIONS", title: "reporting.templates.WORKFLOWS_SUCCESSFUL_EXECUTIONS"}
  ];
  schedulerIds: any;
  frequencies = [
    {name: 'WEEKLY'},
    {name: 'TWO_WEEKS'},
    {name: 'MONTHLY'},
    {name: 'THREE_MONTHS'},
    {name: 'SIX_MONTHS'},
    {name: 'YEARLY'},
    {name: 'THREE_YEARS'}
  ];

  lastModified: any = '';
  subscription1: Subscription;
  subscription2: Subscription;
  subscription3: Subscription;

  isInterval: string = 'absolute';
  units: any = [
    {name: 'Year'},
    {name: 'Month'},
    {name: 'Quarter'}
  ];
  from: number = null;
  count: number = null;
  preset: any = [
    { name: 'Last Month' },
    { name: 'This Quarter' },
    { name: 'Last Quarter' },
    { name: 'This Year' },
    { name: 'Last Year' },
  ];

  originalAbsoluteValues: { monthFrom: string, monthTo: string } = { monthFrom: '', monthTo: '' };

  constructor(public coreService: CoreService, private translate: TranslateService, private dataService: DataService,
              private authService: AuthService, private ref: ChangeDetectorRef, private modal: NzModalService) {
    this.subscription1 = dataService.reloadTree.subscribe(res => {
      if (res && !isEmpty(res)) {
        if (res.reloadTree && this.report.actual) {
          this.ref.detectChanges();
        }
      }
    });
    this.subscription2 = dataService.functionAnnounced$.subscribe(res => {
      if (res === 'REDO') {
        this.redo();
      } else if (res === 'UNDO') {
        this.undo();
      }
    });
    this.subscription3 = dataService.eventAnnounced$.subscribe(res => {
      this.refresh(res);
    });
  }

  ngOnInit(): void {
    this.schedulerIds = this.authService.scheduleIds ? JSON.parse(this.authService.scheduleIds) : {};
    this.preset.name = ''
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['copyObj'] && !changes['data']) {
      return;
    }
    if (changes['reload']) {
      if (changes['reload'].previousValue === true && changes['reload'].currentValue === false) {
        return;
      }
      if (this.reload) {
        this.getObject();
        this.reload = false;
        return;
      }
    }
    if (this.report.actual) {
      this.saveJSON();
    }
    if (changes['data']) {
      if (this.data.type) {
        this.getObject();
      } else {
        this.report = {};
        this.ref.detectChanges();
      }
    }
  }

  ngOnDestroy(): void {
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
    this.subscription3.unsubscribe();
    if (this.report.name) {
      this.saveJSON();
    }
  }

  private refresh(args: { eventSnapshots: any[] }): void {
    if (args.eventSnapshots && args.eventSnapshots.length > 0) {
      for (let j = 0; j < args.eventSnapshots.length; j++) {
        if (args.eventSnapshots[j].path) {
          const path = this.data.path + (this.data.path === '/' ? '' : '/') + this.data.name;
          if ((args.eventSnapshots[j].eventType.match(/InventoryObjectUpdated/) || args.eventSnapshots[j].eventType.match(/ItemChanged/)) && args.eventSnapshots[j].objectType === this.objectType) {
            if (args.eventSnapshots[j].path === path) {
              if (this.isLocalChange !== this.report.path) {
                this.getObject();
              } else {
                this.isLocalChange = '';
              }
            }
          }
        }
      }
    }
  }


  rename(inValid): void {
    if (this.data.id === this.report.id && this.data.name !== this.report.name) {
      if (!inValid) {
        this.report.path = (this.report.path1 + (this.report.path1 === '/' ? '' : '/') + this.report.name);
        if (this.preferences.auditLog) {
          let comments = {
            radio: 'predefined',
            type: 'Script',
            operation: 'Rename',
            name: this.data.name
          };
          const modal = this.modal.create({
            nzTitle: undefined,
            nzContent: CommentModalComponent,
            nzClassName: 'lg',
            nzData: {
              comments
            },
            nzFooter: null,
            nzClosable: false,
            nzMaskClosable: false
          });
          modal.afterClose.subscribe(result => {
            if (result) {
              this.renameScript(result);
            } else {
              this.report.name = this.data.name;
              this.report.path = (this.data.path + (this.data.path === '/' ? '' : '/') + this.data.name);
              this.ref.detectChanges();
            }
          });
        } else {
          this.renameScript();
        }
      } else {
        this.report.name = this.data.name;
        this.report.path = (this.data.path + (this.data.path === '/' ? '' : '/') + this.data.name);
        this.ref.detectChanges();
      }
    }
  }

  private renameScript(comments: any = {}): void {
    const data = this.coreService.clone(this.data);
    const name = this.report.name;
    const obj: any = {
      path: (data.path + (data.path === '/' ? '' : '/') + data.name),
      objectType: this.objectType,
      newPath: name,
      auditLog: {}
    };
    this.coreService.getAuditLogObj(comments, obj.auditLog);
    this.coreService.post('inventory/rename', obj).subscribe({
      next: () => {
        if ((data.path + (data.path === '/' ? '' : '/') + data.name) === (this.data.path + (this.data.path === '/' ? '' : '/') + this.data.name)) {
          this.data.name = name;
        }
        data.name1 = name;
        this.dataService.reloadTree.next({rename: data});
      }, error: () => {
        this.report.name = this.data.name;
        this.report.path = (this.data.path + (this.data.path === '/' ? '' : '/') + this.data.name);
        this.ref.detectChanges();
      }
    });
  }

  release(): void {
    this.dataService.reloadTree.next({release: this.report});
  }

  backToListView(): void {
    this.dataService.reloadTree.next({back: this.report});
  }

  /**
   * Function: redo
   *
   * Redoes the last change.
   */
  redo(): void {
    const n = this.history.length;
    if (this.indexOfNextAdd < n) {
      const obj = this.history[this.indexOfNextAdd++];
      this.report.configuration = JSON.parse(obj);
      this.saveJSON(true);
    }
  }

  /**
   * Function: undo
   *
   * Undoes the last change.
   */
  undo(): void {
    if (this.indexOfNextAdd > 0) {
      const obj = this.history[--this.indexOfNextAdd];
      this.report.configuration = JSON.parse(obj);
      this.saveJSON(true);
    }
  }

  changeDate(type: string, data: any): void {
    if (data) {
      this.report.configuration[type] = this.coreService.getDateByFormat(data, null, 'YYYY-MM');
    } else {
      this.report.configuration[type] = null;
    }
    this.saveJSON();
  }



  saveJSON(flag = false): void {
    if (this.isTrash || !this.permission.joc.inventory.manage) {
      return;
    }

    const obj = this.coreService.clone(this.report.configuration);

    if (!isEqual(this.report.actual, JSON.stringify(obj))) {
      if (!flag) {
        if (this.history.length === 20) {
          this.history.shift();
        }
        this.history.push(JSON.stringify(this.report.configuration));
        this.indexOfNextAdd = this.history.length - 1;
      }

      const request: any = {
        configuration: obj,
        valid: !obj.frequencies || !obj.templateName,
        path: this.report.path,
        objectType: this.objectType
      };

      if (sessionStorage['$SOS$FORCELOGING'] === 'true') {
        this.translate.get('auditLog.message.defaultAuditLog').subscribe(translatedValue => {
          request.auditLog = {comment: translatedValue};
        });
      }

      this.coreService.post('inventory/store', request).subscribe({
        next: (res: any) => {
          if (res.path === this.report.path) {
            this.isLocalChange = res.path;
            this.lastModified = res.configurationDate;
            this.report.actual = JSON.stringify(obj);
            this.report.valid = res.valid;
            this.data.valid = res.valid;
            this.report.released = false;
            this.data.released = false;
            this.setErrorMessage(res);
          }
        }, error: () => {
          this.ref.detectChanges();
        }
      });
    }
  }

  private getObject(): void {
    const URL = this.isTrash ? 'inventory/trash/read/configuration' : 'inventory/read/configuration';
    this.coreService.post(URL, {
      path: (this.data.path + (this.data.path === '/' ? '' : '/') + this.data.name),
      objectType: this.objectType,
    }).subscribe((res: any) => {
      this.isLocalChange = '';
      this.lastModified = res.configurationDate;
      this.history = [];
      this.indexOfNextAdd = 0;
      if (res.configuration) {
        delete res.configuration.TYPE;
        delete res.configuration.path;
        delete res.configuration.version;
        delete res.configuration.versionId;
      } else {
        res.configuration = {};
      }

      if (this.data.released !== res.released) {
        this.data.released = res.released;
      }
      if (this.data.valid !== res.valid) {
        this.data.valid = res.valid;
      }
      this.report = this.coreService.clone(res);
      this.report.actual = JSON.stringify(this.report.configuration);
      this.report.path1 = this.data.path;
      this.report.name = this.data.name;

      this.history.push(JSON.stringify(this.report.configuration));

      if (!res.valid) {
        this.validateJSON(res.configuration);
      } else {
        this.invalidMsg = '';
      }

      this.updateDateFields(res.configuration.monthFrom, res.configuration.monthTo);

      this.ref.detectChanges();
    });
  }

  private updateDateFields(monthFrom: string, monthTo: string): void {
    const relativeDatePattern = /^[+-]?\d+[MmQqYy]$/;
    if (relativeDatePattern.test(monthFrom) && relativeDatePattern.test(monthTo)) {
      // Handle relative dates
      this.isInterval = 'relative';
      this.units.name = this.getUnitFromRelativeDate(monthFrom);
      this.from = this.getValueFromRelativeDate(monthFrom);
      this.count = this.getValueFromRelativeDate(monthFrom) - this.getValueFromRelativeDate(monthTo) + 1;
    } else {
      this.isInterval = 'absolute';
      this.report.configuration.monthFrom = monthFrom;
      this.report.configuration.monthTo = monthTo;
      this.originalAbsoluteValues = { monthFrom, monthTo };
    }
    this.checkAndSetPreset(monthFrom, monthTo);
  }

  private checkAndSetPreset(monthFrom: string, monthTo: string): void {
    const fromLower = monthFrom?.toLowerCase();
    const toLower = monthTo ? monthTo?.toLowerCase() : '';

    if (fromLower === '1y' && toLower === '1y') {
      this.preset.name = 'Last Year';
    } else if (fromLower === '1m' && toLower === '1m') {
      this.preset.name = 'Last Month';
    } else if (fromLower === '1q' && toLower === '1q') {
      this.preset.name = 'Last Quarter';
    } else if (fromLower === '0q' && (toLower === '0q' || toLower === '')) {
      this.preset.name = 'This Quarter';
    } else if (fromLower === '0y' && (toLower === '0y' || toLower === '')) {
      this.preset.name = 'This Year';
    } else {
      this.preset.name = '';
    }
  }

  private getUnitFromRelativeDate(date: string): string {
    const unit = date.slice(-1).toUpperCase(); // Extracts the unit (M, Q, Y) and converts to uppercase
    if (unit === 'Y') return 'Year';
    if (unit === 'M') return 'Month';
    if (unit === 'Q') return 'Quarter';
    return '';
  }

  private getValueFromRelativeDate(date: string): number {
    return parseInt(date.slice(0, -1), 10); // Extracts the numeric part and converts to integer
  }

  private validateJSON(json): void {
    const obj = clone(json);
    obj.path = this.data.path;
    this.coreService.post('inventory/' + this.objectType + '/validate', obj).subscribe((res: any) => {
      this.report.valid = res.valid;
      if (this.report.path === this.data.path) {
        this.data.valid = res.valid;
      }
      this.setErrorMessage(res);
    });
  }

  private setErrorMessage(res): void {
    this.invalidMsg = '';
    if (res.invalidMsg) {
      if (!this.invalidMsg) {
        this.invalidMsg = res.invalidMsg;
      }
    }
    this.ref.detectChanges();
  }

  convertRelativeToAbsolute(unit: string, from: number | null, count: number | null): { monthFrom: string, monthTo: string } {
    let monthFrom: string;
    let monthTo: string;

    if (unit === 'Year') {
      let yearFrom = from !== null ? `${from}y` : '1y';
      let yearTo = from !== null && count !== null && count > 1 ? `${from - (count - 1)}y` : yearFrom;

      if (from === 0 && count === 1) {
        yearFrom = '0y';
        yearTo = '';
      }

      monthFrom = yearFrom;
      monthTo = yearTo;
    } else if (unit === 'Month') {
      let monthFromValue = from !== null ? `${from}m` : '1m';
      let monthToValue = from !== null && count !== null && count > 1 ? `${from - (count - 1)}m` : monthFromValue;

      monthFrom = monthFromValue;
      monthTo = monthToValue;
    } else if (unit === 'Quarter') {
      let quarterFromValue = from !== null ? `${from}q` : '1q';
      let quarterToValue = from !== null && count !== null && count > 1 ? `${from - (count - 1)}q` : quarterFromValue;

      if (from === 0 && count === 1) {
        quarterFromValue = '0q';
        quarterToValue = '';
      }

      monthFrom = quarterFromValue;
      monthTo = quarterToValue;
    }

    return { monthFrom, monthTo };
  }

  saveRelativeInterval(): void {
    if (this.count > this.from) {
      this.count = this.from;
    }
    const { units, from, count } = this;
    if (from !== null && count !== null) {
      this.originalAbsoluteValues.monthFrom = '';
      this.originalAbsoluteValues.monthTo = '';
    }
    if (units) {
      const { monthFrom, monthTo } = this.convertRelativeToAbsolute(units.name, from, count);
      this.report.configuration.monthFrom = monthFrom;
      this.report.configuration.monthTo = monthTo;
      this.saveJSON();
    }
  }


  convertAbsoluteToRelative(monthFrom: string, monthTo: string): { unit: string, from: number | null, count: number | null } {
    let unit: string;
    let from: number | null = null;
    let count: number | null = null;

    const extractValueAndUnit = (value: string): { value: number, unit: string } => {
      if (!value) return { value: 0, unit: '' }; // Ensure value is defined
      const match = value.match(/(\d+)([ymq])/);
      return match ? { value: parseInt(match[1]), unit: match[2] } : { value: 0, unit: '' };
    };

    const fromDetails = extractValueAndUnit(monthFrom);
    const toDetails = extractValueAndUnit(monthTo);

    if (fromDetails.unit === 'y' && toDetails.unit === 'y') {
      unit = 'Year';
    } else if (fromDetails.unit === 'm' && toDetails.unit === 'm') {
      unit = 'Month';
    } else if (fromDetails.unit === 'q' && toDetails.unit === 'q') {
      unit = 'Quarter';
    } else {
      return { unit: '', from: null, count: null };
    }

    from = fromDetails.value;
    count = fromDetails.value - toDetails.value + 1;
    return { unit, from, count };
  }

  saveAbsoluteInterval(): void {
    const { monthFrom, monthTo } = this.report.configuration;

    if (monthFrom && monthTo) {
        const { unit, from, count } = this.convertAbsoluteToRelative(monthFrom, monthTo);
        if (!unit || from === null || count === null) {
            this.units.name = '';
            this.from = null;
            this.count = null;
            this.report.configuration.monthFrom = this.originalAbsoluteValues.monthFrom;
            this.report.configuration.monthTo = this.originalAbsoluteValues.monthTo;
        } else {
            this.units.name = unit;
            this.from = from;
            this.count = count;
        }
        this.saveJSON();
    }
}


  onPresetChange(): void {
    this.applyPreset(this.preset.name);
  }

  applyPreset(preset: string): void {
  switch (preset) {
    case 'Last Year':
      this.units.name = 'Year';
      this.from = 1;
      this.count = 1;
      break;
    case 'Last Month':
      this.units.name = 'Month';
      this.from = 1;
      this.count = 1;
      break;
    case 'Last Quarter':
      this.units.name = 'Quarter';
      this.from = 1;
      this.count = 1;
      break;
    case 'This Quarter':
      this.units.name = 'Quarter';
      this.from = 0;
      this.count = 1;
      break;
    case 'This Year':
      this.units.name = 'Year';
      this.from = 0;
      this.count = 1;
      break;
    default:
      this.units.name = '';
      this.from = null;
      this.count = null;
      break;
  }
  this.saveRelativeInterval();
}

  onIntervalChange(): void {
    if (this.isInterval === 'preset') {
      this.checkAndSetPreset(this.report.configuration.monthFrom, this.report.configuration.monthTo);
      this.applyPreset(this.preset.name);
    } else if (this.isInterval === 'relative') {
      const { monthFrom, monthTo } = this.report.configuration;
      const { unit, from, count } = this.convertAbsoluteToRelative(monthFrom, monthTo);
      const isThisQuarterOrYear = this.preset.name === 'This Quarter' || this.preset.name === 'This Year';

      if (!unit || from === null || count === null) {
        if (!isThisQuarterOrYear) {
          this.originalAbsoluteValues.monthFrom = monthFrom;
          this.originalAbsoluteValues.monthTo = monthTo;
          this.units.name = '';
          this.from = null;
          this.count = null;
        }
      }else {
        this.units.name = unit;
        this.from = from;
        this.count = count;
        this.originalAbsoluteValues = { monthFrom: '', monthTo: '' };
      }
      this.checkAndSetPreset(this.report.configuration.monthFrom, this.report.configuration.monthTo);

      this.saveRelativeInterval();
    } else if (this.isInterval === 'absolute') {
      // If the original values are empty, set them from the current configuration
      if (this.originalAbsoluteValues.monthFrom || this.originalAbsoluteValues.monthTo) {
        this.report.configuration.monthFrom = this.originalAbsoluteValues.monthFrom;
        this.report.configuration.monthTo = this.originalAbsoluteValues.monthTo;
      }
      this.checkAndSetPreset(this.report.configuration.monthFrom, this.report.configuration.monthTo);
      // this.saveJSON();
      this.saveAbsoluteInterval();
    }

  }
}
