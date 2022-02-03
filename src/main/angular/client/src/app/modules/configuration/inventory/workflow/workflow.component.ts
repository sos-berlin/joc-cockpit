import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component, Directive, EventEmitter, forwardRef,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  OnInit, Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import {NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
import {FileUploader} from 'ng2-file-upload';
import {TranslateService} from '@ngx-translate/core';
import {NzContextMenuService, NzDropdownMenuComponent} from 'ng-zorro-antd/dropdown';
import {Subscription} from 'rxjs';
import {NzMessageService} from "ng-zorro-antd/message";
import {isEmpty, isArray, isEqual, clone, extend, sortBy} from 'underscore';
import {saveAs} from 'file-saver';
import {ToastrService} from 'ngx-toastr';
import {Router} from '@angular/router';
import {AbstractControl, NG_VALIDATORS, Validator} from '@angular/forms';
import {CdkDragDrop, moveItemInArray, DragDrop} from '@angular/cdk/drag-drop';
import {WorkflowService} from '../../../../services/workflow.service';
import {DataService} from '../../../../services/data.service';
import {CoreService} from '../../../../services/core.service';
import {ValueEditorComponent} from '../../../../components/value-editor/value.component';
import {InventoryObject} from '../../../../models/enums';
import {JobWizardComponent} from '../job-wizard/job-wizard.component';
import {InventoryService} from '../inventory.service';

// Mx-Graph Objects
declare const mxEditor;
declare const mxUtils;
declare const mxEvent;
declare const mxClient;
declare const mxEdgeHandler;
declare const mxAutoSaveManager;
declare const mxGraphHandler;
declare const mxCellAttributeChange;
declare const mxGraph;
declare const mxImage;
declare const mxOutline;
declare const mxDragSource;
declare const mxConstants;
declare const mxRectangle;
declare const mxPoint;
declare const mxUndoManager;
declare const mxEventObject;
declare const mxToolbar;
declare const mxCellHighlight;
declare const mxImageShape;
declare const mxRhombus;
declare const mxLabel;
declare const mxKeyHandler;
declare const $;

@Directive({
  selector: '[appValidateDuration]',
  providers: [
    {provide: NG_VALIDATORS, useExisting: forwardRef(() => DurationValidator), multi: true}
  ]
})
export class DurationValidator implements Validator {
  validate(c: AbstractControl): { [key: string]: any } {
    let v = c.value;
    if (v != null) {
      if (v == '') {
        return null;
      }
      if (/^\s*(?:(?:1?\d|2[0-3])h\s*)?(?:[1-5]?\dm\s*)?(?:[1-5]?\ds)?\s*$/.test(v)) {
        return null;
      }
      if (/^([01][0-9]|2[0-3]):?([0-5][0-9]):?([0-5][0-9])\s*-\s*([01][0-9]|2[0-3]):?([0-5][0-9]):?([0-5][0-9])\s*$/.test(v)) {
        return null;
      }

      if (/^([01][0-9]|2[0-3]):?([0-5][0-9]):?([0-5][0-9])\s*$/i.test(v) || /^[0]+\s*$/i.test(v) ||
        /^((1+)w[ ]?)?((\d+)d[ ]?)?((\d+)h[ ]?)?((\d+)m[ ]?)?((\d+)s[ ]?)?\s*$/.test(v)
      ) {
        return null;
      }
    } else {
      return null;
    }
    return {
      invalidDuration: true
    };
  }
}

@Directive({
  selector: '[appValidateOffset]',
  providers: [
    {provide: NG_VALIDATORS, useExisting: forwardRef(() => OffsetValidator), multi: true}
  ]
})
export class OffsetValidator implements Validator {
  validate(c: AbstractControl): { [key: string]: any } {
    let v = c.value;
    if (v != null) {
      if (v == '') {
        return null;
      }
      if (/^\s*(?:(?:1?\d|2[0-3])h\s*)?(?:[1-5]?\dm\s*)?(?:[1-5]?\ds)?\s*$/.test(v) ||
        /^([01][0-9]|2[0-3]):?([0-5][0-9]):?([0-5][0-9])\s*$/i.test(v) || /^[0]+\s*$/i.test(v) ||
        /^((\d+)h[ ]?)?((\d+)m[ ]?)?((\d+)s[ ]?)?\s*$/.test(v)
      ) {
        return null;
      } else if (/,?$/.test(v)) {
        const arr = v.split(',');
        let flag = true;
        if (arr.length > 0) {
          arr.forEach(val => {
            if (!val) {
              flag = false;
              return;
            } else {
              if (!(/^\s*(?:(?:1?\d|2[0-3])h\s*)?(?:[1-5]?\dm\s*)?(?:[1-5]?\ds)?\s*$/.test(val) ||
                /^([01][0-9]|2[0-3]):?([0-5][0-9]):?([0-5][0-9])\s*$/i.test(val) || /^[0]+\s*$/i.test(val) ||
                /^((\d+)h[ ]?)?((\d+)m[ ]?)?((\d+)s[ ]?)?\s*$/.test(val))) {
                flag = false;
              }
            }
          });
        }
        return flag ? null : {
          invalidOffset: true
        };
      }
    } else {
      return null;
    }
    return {
      invalidOffset: true
    };
  }
}

@Component({
  selector: 'app-repeat-editor-modal',
  templateUrl: './repeat-editor-dialog.html'
})
export class RepeatEditorComponent implements OnInit {
  @Input() data;
  isNew: boolean;
  object: any = {};

  constructor(public activeModal: NzModalRef) {
  }

  ngOnInit(): void {
    if (!this.data.TYPE) {
      this.isNew = true;
      this.object.TYPE = 'Periodic';
    } else {
      this.object = clone(this.data);
    }
  }

  onSubmit(): void {
    if (this.object) {
      this.data = this.object;
    }
    this.activeModal.close(this.data);
  }

  cancel(): void {
    this.activeModal.destroy();
  }
}

@Component({
  selector: 'app-time-editor-modal',
  templateUrl: './time-editor-dialog.html'
})
export class TimeEditorComponent implements OnInit {
  @Input() data;
  @Input() period;
  isNew: boolean;
  isExist: boolean;

  defaultOpenValue = null;
  object: any = {};

  @ViewChild('timePicker', {static: true}) tp;

  constructor(public activeModal: NzModalRef, private workflowService: WorkflowService) {
  }

  ngOnInit(): void {
    if (this.period) {
      const h = Math.floor(((((this.period.startTime % (3600 * 365 * 24)) % (3600 * 30 * 24)) % (3600 * 7 * 24)) % (3600 * 24)) / 3600);
      const m = Math.floor((((((this.period.startTime % (3600 * 365 * 24)) % (3600 * 30 * 24)) % (3600 * 7 * 24)) % (3600 * 24)) % 3600) / 60);
      const s = Math.floor(((((((this.period.startTime % (3600 * 365 * 24)) % (3600 * 30 * 24)) % (3600 * 7 * 24)) % (3600 * 24)) % 3600) % 60));
      this.object.startTime = new Date(new Date().setHours(h, m, s));
      this.object.duration = this.workflowService.convertDurationToHour(this.period.duration);
    }
  }

  onTab(): void {
    this.tp.close();
  }

  onSubmit(): void {
    const obj: any = {};
    const h = this.object.startTime.getHours();
    const m = this.object.startTime.getMinutes();
    const s = this.object.startTime.getSeconds();
    obj.startTime = (h * 60 * 60) + (m * 60) + s;
    obj.duration = this.workflowService.convertStringToDuration(this.object.duration, true);
    this.isExist = false;
    if (this.data.periods.length > 0) {
      for (const i in this.data.periods) {
        if (this.data.periods[i].startTime === obj.startTime && this.data.periods[i].duration === obj.duration) {
          if (!(this.period && this.period.startTime === this.data.periods[i].startTime && this.period.duration === this.data.periods[i].duration)) {
            this.isExist = true;
          }
          break;
        }
      }
    }
    if (!this.isExist) {
      this.activeModal.close(obj);
    }
  }

  cancel(): void {
    this.activeModal.destroy();
  }
}

@Component({
  selector: 'app-cycle-instruction',
  templateUrl: './cycle-instruction-editor.html'
})
export class CycleInstructionComponent implements OnChanges {
  @Input() selectedNode: any;
  schemeList = [];
  days = [];

  constructor(private coreService: CoreService, private modal: NzModalService,
              private workflowService: WorkflowService, private ref: ChangeDetectorRef) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.selectedNode) {
      this.init();
    }
  }

  private init(): void {
    if (this.days.length === 0) {
      this.days = this.coreService.getLocale().days;
      this.days.push(this.days[0]);
    }
    this.selectedNode.repeatObject = {};
    this.selectedNode.data = {};
    this.selectedNode.isEdit = false;
    if (this.selectedNode.obj.schedule && typeof this.selectedNode.obj.schedule === 'string') {
      try {
        this.selectedNode.obj.schedule = JSON.parse(this.selectedNode.obj.schedule);
      } catch (e) {
      }
    }
    if (!this.selectedNode.obj.schedule.schemes) {
      this.selectedNode.obj.schedule.schemes = [];
    }
    if (this.selectedNode.obj.schedule.schemes.length > 0) {
      this.convertSchemeList();
    } else {
      this.schemeList = [];
    }
  }

  private convertSchemeList(): void {
    this.schemeList = [];
    this.selectedNode.obj.schedule.schemes.forEach((item) => {
      const obj = {
        periodList: [],
        repeat: this.workflowService.getTextOfRepeatObject(item.repeat)
      };
      if (item.admissionTimeScheme && item.admissionTimeScheme.periods) {
        this.workflowService.convertSecondIntoWeek(item.admissionTimeScheme, obj.periodList, this.days, {});
      }
      this.schemeList.push(obj);
    });
    this.ref.detectChanges();
  }

  addScheme(scheme): void {
    scheme.show = true;
    this.selectedNode.isEdit = false;
    this.selectedNode.repeatObject = {};
    this.selectedNode.data.schedule = {};
    this.selectedNode.data.periodList = [];
  }

  editFrequency(data, index): void {
    this.selectedNode.isEdit = true;
    this.selectedNode.obj.show = true;
    this.selectedNode.repeatObject = data.repeat;
    this.selectedNode.repeatObject.index = index;
    this.selectedNode.data.schedule = this.selectedNode.obj.schedule.schemes[index];
    this.selectedNode.data.periodList = [];
  }

  removeFrequency(index, list, mainIndex): void {
    list.periodList.splice(index, 1);
    if (list.periodList.length === 0) {
      this.selectedNode.obj.schedule.schemes[mainIndex].admissionTimeScheme.periods = [];
    } else {
      const arr = [];
      list.periodList.forEach((item) => {
        if (item.periods) {
          item.periods.forEach((period) => {
            const obj: any = {
              TYPE: !item.frequency ? 'DailyPeriod' : 'WeekdayPeriod'
            };
            if (!item.frequency) {
              obj.secondOfDay = ((item.secondOfDay || item.secondOfWeek || 0) + period.startTime);
            } else {
              obj.secondOfWeek = ((item.secondOfDay || item.secondOfWeek || 0) + period.startTime);
            }
            obj.duration = period.duration;
            arr.push(obj);
          });
        }
      });
      this.selectedNode.obj.schedule.schemes[mainIndex].admissionTimeScheme.periods = arr;
    }
  }

  addRepeat(data, index): void {
    this.editRepeat(data, index);
  }

  editRepeat(data, index): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: RepeatEditorComponent,
      nzAutofocus: null,
      nzComponentParams: {
        data: data.repeat
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe((res) => {
      if (res) {
        this.selectedNode.obj.schedule.schemes[index].repeat = this.workflowService.convertRepeatObject(res);
        data.repeat = this.workflowService.getTextOfRepeatObject(this.selectedNode.obj.schedule.schemes[index].repeat);
        this.ref.detectChanges();
      }
    });
  }

  removeRepeat(index): void {
    this.schemeList.splice(index, 1);
    this.selectedNode.obj.schedule.schemes.splice(index, 1);
  }

  addPeriod(data, index): void {
    this.editPeriod(null, data, index);
  }

  editPeriod(period, data, index): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: TimeEditorComponent,
      nzAutofocus: null,
      nzComponentParams: {
        data,
        period
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe((res) => {
      if (res) {
        if (period) {
          data.periods = data.periods.filter((item) => {
            return item.text !== period.text;
          });
        }
        const p: any = {
          startTime: res.startTime,
          duration: res.duration
        };
        p.text = this.workflowService.getText(p.startTime, p.duration);
        data.periods.push(p);
        this.ref.detectChanges();
        const obj2 = this.createObj(data, res);
        if (period) {
          const obj = this.createObj(data, period);
          this.selectedNode.obj.schedule.schemes[index].admissionTimeScheme.periods = this.selectedNode.obj.schedule.schemes[index].admissionTimeScheme.periods.filter((item) => {
            return JSON.stringify(item) !== JSON.stringify(obj);
          });
        }
        this.selectedNode.obj.schedule.schemes[index].admissionTimeScheme.periods.push(obj2);
      }
    });
  }

  removePeriod(data, period, index): void {
    const obj = this.createObj(data, period);
    data.periods = data.periods.filter((item) => {
      return item !== period;
    });
    this.selectedNode.obj.schedule.schemes[index].admissionTimeScheme.periods = this.selectedNode.obj.schedule.schemes[index].admissionTimeScheme.periods.filter((item) => {
      return JSON.stringify(item) !== JSON.stringify(obj);
    });
  }

  private createObj(data, period): any {
    const obj: any = {
      TYPE: !data.frequency ? 'DailyPeriod' : 'WeekdayPeriod'
    };
    if (obj.TYPE === 'DailyPeriod') {
      obj.secondOfDay = ((data.secondOfDay || data.secondOfWeek || 0) + period.startTime);
    } else {
      obj.secondOfWeek = ((data.secondOfDay || data.secondOfWeek || 0) + period.startTime);
    }
    obj.duration = period.duration;
    return obj;
  }

  closeScheme(scheme): void {
    scheme.show = false;
    setTimeout(() => {
      let flag1 = true;
      if (this.selectedNode.repeatObject.TYPE === 'Periodic') {
        if (!this.selectedNode.repeatObject.period) {
          flag1 = false;
        }
      } else if (this.selectedNode.repeatObject.TYPE === 'Continuous') {
        if (!this.selectedNode.repeatObject.pause) {
          flag1 = false;
        }

      } else if (this.selectedNode.repeatObject.TYPE === 'Ticking') {
        if (!this.selectedNode.repeatObject.interval) {
          flag1 = false;
        }
      }
      if (flag1) {
        if (!this.selectedNode.isEdit) {
          this.selectedNode.obj.schedule.schemes.push({
            repeat: this.workflowService.convertRepeatObject(this.selectedNode.repeatObject),
            admissionTimeScheme: this.selectedNode.data.schedule.admissionTimeScheme
          });
        } else {
          if (this.selectedNode.repeatObject.index || this.selectedNode.repeatObject.index === 0) {
            this.selectedNode.obj.schedule.schemes[this.selectedNode.repeatObject.index].repeat = this.workflowService.convertRepeatObject(this.selectedNode.repeatObject);
          }
        }
      }
      this.selectedNode.repeatObject = {};
      this.selectedNode.data = {};
      this.convertSchemeList();
    }, 100);
  }
}

@Component({
  selector: 'app-admission-time',
  templateUrl: './admission-time-dialog.html'
})
export class AdmissionTimeComponent implements OnInit, OnDestroy {
  @Input() job: any;
  @Input() data: any;
  @Input() repeatObject: any;
  frequency: any = {
    days: [],
    all: false
  };
  days = [];
  isValid = true;
  defaultOpenValue = null;
  object: any = {};
  daysOptions = [
    {label: 'monday', value: '1', checked: false},
    {label: 'tuesday', value: '2', checked: false},
    {label: 'wednesday', value: '3', checked: false},
    {label: 'thursday', value: '4', checked: false},
    {label: 'friday', value: '5', checked: false},
    {label: 'saturday', value: '6', checked: false},
    {label: 'sunday', value: '7', checked: false}
  ];

  @Output() close: EventEmitter<any> = new EventEmitter();

  @ViewChild('timePicker', {static: true}) tp;

  constructor(private coreService: CoreService, private modal: NzModalService,
              private workflowService: WorkflowService, private ref: ChangeDetectorRef) {
  }

  ngOnInit(): void {
    if (!this.job.admissionTimeScheme) {
      this.job.admissionTimeScheme = {};
    }
    if (this.repeatObject && !this.repeatObject.TYPE) {
      this.repeatObject.TYPE = 'Periodic';
    }
    this.days = this.coreService.getLocale().days;
    this.days.push(this.days[0]);
    if (this.job.admissionTimeScheme.periods && this.job.admissionTimeScheme.periods.length > 0) {
      this.workflowService.convertSecondIntoWeek(this.job.admissionTimeScheme, this.data.periodList, this.days, this.frequency);
      if (this.data.periodList.length > 0) {
        if (!this.data.periodList[0].frequency) {
          this.frequency.days = ['1', '2', '3', '4', '5', '6', '7'];
          this.frequency.all = true;
        }
      }
      this.checkDays();
    }
  }

  ngOnDestroy(): void {
    const arr = [];
    this.data.periodList.forEach((item) => {
      if (item.periods) {
        item.periods.forEach((period) => {
          const obj: any = {
            TYPE: !item.frequency ? 'DailyPeriod' : 'WeekdayPeriod'
          };
          if (!item.frequency) {
            obj.secondOfDay = ((item.secondOfDay || item.secondOfWeek || 0) + period.startTime);
          } else {
            obj.secondOfWeek = ((item.secondOfDay || item.secondOfWeek || 0) + period.startTime);
          }
          obj.duration = period.duration;
          arr.push(obj);
        });
      }
    });
    if (!this.job.admissionTimeScheme) {
      this.job.admissionTimeScheme = {};
    }
    this.job.admissionTimeScheme.periods = arr;
    this.data.periodList = null;
  }

  onTab(): void {
    this.tp.close();
  }

  dayChange(value: string[]): void {
    this.frequency.days = value;
    this.onChangeDays();
  }

  onChangeDays(): void {
    if (this.frequency.days) {
      this.frequency.all = this.frequency.days.length === 7;
      this.frequency.days.sort();
    }
  }

  selectAllWeek(): void {
    if (this.frequency.all) {
      this.frequency.days = ['1', '2', '3', '4', '5', '6', '7'];
    } else {
      this.frequency.days = [];
    }
    this.checkDays();
  }

  checkDays(): void {
    this.daysOptions = this.daysOptions.map(item => {
      return {
        ...item,
        checked: (this.frequency.days ? this.frequency.days.indexOf(item.value) > -1 : false)
      };
    });
  }

  addFrequency(): void {
    this.isValid = true;
    let p: any;
    if (this.object.startTime || this.object.duration) {
      p = {};
      if (this.object.startTime) {
        const h = this.object.startTime.getHours();
        const m = this.object.startTime.getMinutes();
        const s = this.object.startTime.getSeconds();
        p.startTime = (h * 60 * 60) + (m * 60) + s;
      } else {
        p.startTime = 0;
      }
      p.duration = this.workflowService.convertStringToDuration(this.object.duration, true);
      p.text = this.workflowService.getText(p.startTime, p.duration);
    }
    const temp = this.coreService.clone(this.data.periodList);
    this.data.periodList = [];
    if (this.frequency.days.length === 7 && this.repeatObject) {
      this.addFrequencyAndPeriod('1', temp, p, true);
    } else {
      this.frequency.days.forEach((day) => {
        this.addFrequencyAndPeriod(day, temp, p, false);
      });
    }
    this.object = {};
  }

  private addFrequencyAndPeriod(day, temp, p, isDaily): void {
    const d = parseInt(day, 10) - 1;
    const obj: any = {
      day,
      secondOfWeek: (d * 24 * 3600),
      frequency: isDaily ? '' : this.days[parseInt(day, 10)],
      periods: []
    };
    if (temp.length > 0) {
      for (const i in temp) {
        if (temp[i] && temp[i].day == day) {
          obj.periods = temp[i].periods;
          break;
        }
      }
    }
    if (p) {
      let isCheck = true;
      if (obj.periods.length > 0) {
        obj.periods.forEach((per) => {
          if (per.text === p.text) {
            isCheck = false;
          }
        });
      }
      if (isCheck) {
        obj.periods.push(p);
      }
    }
    if (obj.periods.length === 0) {
      this.isValid = false;
    }
    this.data.periodList.push(obj);
  }

  closeRuntime(): void {
    this.close.emit();
  }

  removeFrequency(data): void {
    this.isValid = true;
    this.data.periodList = this.data.periodList.filter((item) => {
      if (item.periods.length === 0) {
        this.isValid = false;
      }
      return item.day !== data.day;
    });
  }

  addPeriod(data): void {
    this.editPeriod(null, data);
  }

  editPeriod(period, data): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: TimeEditorComponent,
      nzAutofocus: null,
      nzComponentParams: {
        data,
        period
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe((res) => {
      if (res) {
        if (period) {
          data.periods = data.periods.filter((item) => {
            return item.text !== period.text;
          });
        }
        const p: any = {
          startTime: res.startTime,
          duration: res.duration
        };
        p.text = this.workflowService.getText(p.startTime, p.duration);
        data.periods.push(p);
        this.ref.detectChanges();
        this.isValid = true;
        this.data.periodList.forEach((item) => {
          if (item.periods.length === 0) {
            this.isValid = false;
            return;
          }
        });
      }
    });
  }

  removePeriod(data, period): void {
    data.periods = data.periods.filter((item) => {
      return item !== period;
    });
  }
}

@Component({
  selector: 'app-find-replace-modal',
  templateUrl: './find-replace-dialog.html'
})
export class FindAndReplaceComponent implements OnInit {
  @Input() agents: any = [];

  listOfAllAgents = [];
  listOfAgents = [];
  object = {
    replace: '',
    finds: []
  };

  @ViewChild('selectBox', {static: true}) sb;

  constructor(public activeModal: NzModalRef, private coreService: CoreService) {
  }

  ngOnInit(): void {
    this.listOfAllAgents = this.coreService.clone(this.agents);
    this.listOfAgents = this.coreService.clone(this.agents);
    this.listOfAgents.push('*');
  }

  onKeyPress($event): void {
    if ($event.which === '13' || $event.which === 13 || $event.which === '32' || $event.which === 32) {
      const input = $event.target.value;
      $event.target.value = '';
      this.listOfAgents.push(input);
      this.object.finds.push(input);
      $event.preventDefault();
    }
  }

  focusOut(): void {
    if (this.sb.searchValue === '*') {
      this.object.finds = ['*'];
    } else if (this.object.finds.length > 1) {
      this.object.finds = this.object.finds.filter((val) => {
        return val !== '*';
      });
    }
  }

  onChange(value: string): void {
    this.listOfAllAgents = this.agents.filter(option => option.toLowerCase().indexOf(value.toLowerCase()) !== -1);
  }

  onSubmit(): void {
    this.activeModal.close(this.object);
  }
}

@Component({
  selector: 'app-job-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './job-text-editor.html'
})
export class JobComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild('treeSelectCtrl', {static: false}) treeSelectCtrl;
  @Input() schedulerId: any;
  @Input() selectedNode: any;
  @Input() jobs: any;
  @Input() jobResourcesTree = [];
  @Input() documentationTree = [];
  @Input() scriptTree = [];
  @Input() scriptList = [];
  @Input() orderPreparation;
  @Input() agents = [];
  @Input() isTooltipVisible: boolean;
  @Input() isModal: boolean;
  @Input() exactMatch: boolean;
  agentList = [];
  history = [];
  list: Array<string> = [];
  indexOfNextAdd = 0;
  error: boolean;
  notFound: string;
  errorMsg: string;
  obj: any = {};
  isDisplay = false;
  isRuntimeVisible = false;
  fullScreen = false;
  isLengthExceed = false;
  index = 0;
  presentObj: any = {};
  returnCodes: any = {on: 'success'};

  cmOption: any = {
    lineNumbers: true,
    autoRefresh: true,
    mode: 'shell',
    extraKeys: {'Ctrl-Space': 'autocomplete'}
  };

  object = {
    checked1: false,
    indeterminate1: false,
    setOfCheckedArgu: new Set<string>(),
    checked2: false,
    indeterminate2: false,
    setOfCheckedJobArgu: new Set<string>(),
    checked3: false,
    indeterminate3: false,
    setOfCheckedEnv: new Set<string>(),
    checked4: false,
    indeterminate4: false,
    setOfCheckedNodeArgu: new Set<string>(),
    checked5: false,
    indeterminate5: false,
    setOfCheckedDefaultArgu: new Set<string>()
  };

  scriptObj = {
    name: '',
    show: false
  };

  variableList = [];
  filteredOptions = [];
  mentionValueList = [];
  copiedParamObjects: any = {};
  subscription: Subscription;

  @ViewChild('codeMirror', {static: false}) cm: any;

  constructor(private coreService: CoreService, private modal: NzModalService, private ref: ChangeDetectorRef,
              private workflowService: WorkflowService, private dataService: DataService) {
    this.subscription = dataService.reloadWorkflowError.subscribe(res => {
      if (res.error) {
        this.error = res.error;
        if (res.msg && res.msg.match('duplicateLabel')) {
          this.errorMsg = res.msg;
        } else {
          this.errorMsg = '';
        }
      } else {
        if (res.change && res.change.current && this.selectedNode && this.selectedNode.job) {
          this.jobs = res.change.jobs;
          this.selectedNode.job = {...this.selectedNode.job, ...this.coreService.clone(res.change.current.value)};
          this.setJobProperties();
          this.ref.detectChanges();
          this.isRuntimeVisible = false;
          this.fullScreen = false;
        }
      }
    });
    $('#property-panel').on('show', () => {
      this.reloadScript(50);
    });
  }

  ngOnInit(): void {
    this.index = 0;
    if (this.scriptList.length > 0) {
      this.list = this.scriptList.map((item) => item.name);
    }
    if (!this.isModal) {
      this.updateVariableList();
    }

    setTimeout(() => {
      if (this.cm && this.cm.codeMirror) {
        this.cm.codeMirror.on('inputRead', (editor, e) => {
          const cursor = editor.getCursor();
          const currentLine = editor.getLine(cursor.line);
          if (currentLine && currentLine.match(/^(##|::|\/\/)!include/i)) {
            let start = cursor.ch;
            let end = start;
            while (end < currentLine.length && /[\w$]+/.test(currentLine.charAt(end))) {
              ++end;
            }
            while (start && /[\w$]+/.test(currentLine.charAt(start - 1))) {
              --start;
            }
            const curWord = start != end && currentLine.slice(start, end);
            this.getScript(curWord);
          }
        });
      }
      this.mergeScriptData();
    }, 100);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.selectedNode) {
      this.history = [];
      this.indexOfNextAdd = 0;
      this.isRuntimeVisible = false;
      this.reset();
      this.init();
      this.presentObj.obj = JSON.stringify(this.selectedNode.obj);
      this.presentObj.job = JSON.stringify(this.selectedNode.job);
    }
    if (changes.orderPreparation) {
      this.updateVariableList();
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  changeType(type): void {
    if (type === 'ShellScriptExecutable') {
      this.reloadScript();
    }
    this.saveToHistory();
  }

  checkLength(): void {
    const len = JSON.stringify(this.selectedNode.job.notification).length;
    this.isLengthExceed = len > 1000;
  }

  updateSelectItems(): void {
    const arr = this.selectedNode.obj.defaultArguments.filter(option => option.name);
    const x = [];
    this.variableList.forEach((item) => {
      if (item.value.listParameters) {
        Object.entries(item.value.listParameters).map(([k1, v1]) => {
          x.push({name: k1, value: v1});
        });
      } else {
        x.push(item);
      }
    });
    this.mentionValueList = [...x, ...arr];
    this.filteredOptions = [...x, ...arr];
    this.ref.detectChanges();
  }

  private checkIsAgentExist(): void {
    this.agentList = [];
    if (this.selectedNode.job.agentName) {
      let isFound = false;
      for (const i in this.agents) {
        if (this.agents[i] === this.selectedNode.job.agentName) {
          isFound = true;
          break;
        }
      }
      if (!isFound) {
        this.notFound = this.selectedNode.job.agentName;
        this.agentList.push(this.selectedNode.job.agentName);
      }
    }
    this.agentList = this.agentList.concat(this.agents);
    this.ref.detectChanges();
  }

  reloadScript(time = 5): void {
    this.isDisplay = false;
    setTimeout(() => {
      this.isDisplay = true;
      this.ref.detectChanges();
    }, time);
  }

  updateVariableList(): void {
    if (this.orderPreparation && this.orderPreparation.parameters && !isEmpty(this.orderPreparation.parameters)) {
      this.variableList = Object.entries(this.orderPreparation.parameters).map(([k, v]) => {
        return {name: k, value: v};
      });
    }
    this.updateSelectItems();
  }

  tabChange($event): void {
    if ($event.index === 0) {
      this.reloadScript();
    }
    if ($event.index === 0) {
      this.updateSelectItems();
    }
  }

  focusChange(): void {
    this.obj.script = false;
  }

  openJobWizard(): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: JobWizardComponent,
      nzClassName: 'lg',
      nzComponentParams: {
        existingJob: this.selectedNode.job
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        this.selectedNode.job.executable.TYPE = 'InternalExecutable';
        this.selectedNode.job.executable.className = result.executable.className;
        this.selectedNode.job.executable.arguments = result.executable.arguments;
        this.selectedNode.job.title = result.title;
        this.selectedNode.job.documentationName = result.documentationName;
        this.ref.detectChanges();
      }
    });
  }

  showTree(): void {
    this.scriptObj.show = true;
  }

  private mergeScriptData(): void {
    const self = this;

    function recursive(mainObj): void {
      for (const i in mainObj) {
        if (mainObj[i].children && mainObj[i].children.length > 0) {
          recursive(mainObj[i].children);
        }
        let data = [];
        for (const j in self.scriptList) {
          self.scriptList[j].path1 = self.scriptList[j].path.substring(0, self.scriptList[j].path.lastIndexOf('/')) || self.scriptList[j].path.substring(0, self.scriptList[j].path.lastIndexOf('/') + 1);
          if (self.scriptList[j].path1 === mainObj[i].path) {
            data.push({
              title: self.scriptList[j].name,
              path: self.scriptList[j].path,
              key: self.scriptList[j].name,
              type: self.scriptList[j].objectType,
              isLeaf: true
            });
          }
        }
        if (mainObj[i].children && mainObj[i].children.length > 0) {
          data = data.concat(mainObj[i].children);
        }
        if (mainObj[i].isLeaf) {
          mainObj[i].expanded = true;
        }
        mainObj[i].isLeaf = false;
        mainObj[i].children = data;
      }
    }

    if (this.scriptTree.length > 0) {
      if (!this.scriptTree[0].done) {
        this.scriptTree[0].done = true;
        recursive(this.scriptTree);
      }
    }
  }

  closeScriptTree(): void {
    if (this.scriptObj.show) {
      const doc = this.cm.codeMirror.getDoc();
      const cursor = this.cm.codeMirror.getCursor(); // gets the line number in the cursor position
      doc.replaceRange(this.scriptObj.name, cursor);
      cursor.ch = cursor.ch + this.scriptObj.name.length;
      this.cm.codeMirror.focus();
      doc.setCursor(cursor);
      this.scriptObj.name = '';
    }
    this.scriptObj.show = false;
  }

  showEditor(): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: ScriptEditorComponent,
      nzClassName: 'lg script-editor',
      nzComponentParams: {
        script: this.selectedNode.job.executable.script,
        scriptTree: this.scriptTree,
        list: this.scriptList
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        this.selectedNode.job.executable.script = result;
        this.ref.detectChanges();
        this.saveToHistory();
      }
    });
  }

  showRuntime(): void {
    this.selectedNode.periodList = [];
    this.isRuntimeVisible = true;
  }

  closeRuntime(): void {
    this.isRuntimeVisible = false;
  }

  drop(event: CdkDragDrop<string[]>, list: Array<any>): void {
    moveItemInArray(list, event.previousIndex, event.currentIndex);
    if (event.previousIndex !== event.currentIndex) {
      this.saveToHistory();
    }
  }

  onAllChecked(obj: any, type: string, isChecked: boolean): void {
    obj[type === 'nodeArguments' ? 'defaultArguments' : type].forEach(item => this.updateCheckedSet(obj[type === 'nodeArguments' ? 'defaultArguments' : type], type, item.name, isChecked));
  }

  onItemChecked(obj: any, type: string, name: string, checked: boolean): void {
    this.updateCheckedSet(obj[type === 'nodeArguments' ? 'defaultArguments' : type], type, name, checked);
  }

  updateCheckedSet(list: Array<any>, type: string, name: string, checked: boolean): void {
    if (type === 'arguments') {
      if (name) {
        if (checked) {
          this.object.setOfCheckedArgu.add(name);
        } else {
          this.object.setOfCheckedArgu.delete(name);
        }
      }
      this.object.checked1 = list.every(item => {
        return this.object.setOfCheckedArgu.has(item.name);
      });
      this.object.indeterminate1 = this.object.setOfCheckedArgu.size > 0 && !this.object.checked1;
    } else if (type === 'jobArguments') {
      if (name) {
        if (checked) {
          this.object.setOfCheckedJobArgu.add(name);
        } else {
          this.object.setOfCheckedJobArgu.delete(name);
        }
      }
      this.object.checked2 = list.every(item => {
        return this.object.setOfCheckedJobArgu.has(item.name);
      });
      this.object.indeterminate2 = this.object.setOfCheckedJobArgu.size > 0 && !this.object.checked2;
    } else if (type === 'env') {
      if (name) {
        if (checked) {
          this.object.setOfCheckedEnv.add(name);
        } else {
          this.object.setOfCheckedEnv.delete(name);
        }
      }
      this.object.checked3 = list.every(item => {
        return this.object.setOfCheckedEnv.has(item.name);
      });
      this.object.indeterminate3 = this.object.setOfCheckedEnv.size > 0 && !this.object.checked3;
    } else if (type === 'nodeArguments') {
      if (name) {
        if (checked) {
          this.object.setOfCheckedNodeArgu.add(name);
        } else {
          this.object.setOfCheckedNodeArgu.delete(name);
        }
      }
      this.object.checked4 = list.every(item => {
        return this.object.setOfCheckedNodeArgu.has(item.name);
      });
      this.object.indeterminate4 = this.object.setOfCheckedNodeArgu.size > 0 && !this.object.checked4;
    } else {
      if (name) {
        if (checked) {
          this.object.setOfCheckedDefaultArgu.add(name);
        } else {
          this.object.setOfCheckedDefaultArgu.delete(name);
        }
      }
      this.object.checked5 = list.every(item => {
        return this.object.setOfCheckedDefaultArgu.has(item.name);
      });
      this.object.indeterminate5 = this.object.setOfCheckedDefaultArgu.size > 0 && !this.object.checked5;
    }
  }

  fitToScreen(): void {
    this.fullScreen = !this.fullScreen;
  }

  cutParam(type): void {
    this.cutCopyOperation(type, 'CUT');
  }

  copyParam(type): void {
    this.cutCopyOperation(type, 'COPY');
  }

  private cutOperation(): void {
    if (this.copiedParamObjects.type) {
      let list = this.getList(this.copiedParamObjects.type);
      if (this.copiedParamObjects.operation === 'CUT' && list && list.length > 0) {
        list = list.filter(item => {
          if (this.copiedParamObjects.type === 'arguments') {
            return !this.object.setOfCheckedArgu.has(item.name);
          } else if (this.copiedParamObjects.type === 'jobArguments') {
            return !this.object.setOfCheckedJobArgu.has(item.name);
          } else if (this.copiedParamObjects.type === 'env') {
            return !this.object.setOfCheckedEnv.has(item.name);
          } else if (this.copiedParamObjects.type === 'nodeArguments') {
            return !this.object.setOfCheckedNodeArgu.has(item.name);
          } else {
            return !this.object.setOfCheckedDefaultArgu.has(item.name);
          }
        });
        if (this.copiedParamObjects.type === 'arguments') {
          this.selectedNode.job.executable.arguments = list;
        } else if (this.copiedParamObjects.type === 'jobArguments') {
          this.selectedNode.job.executable.jobArguments = list;
        } else if (this.copiedParamObjects.type === 'env') {
          this.selectedNode.job.executable.env = list;
        } else if (this.copiedParamObjects.type === 'nodeArguments') {
          this.selectedNode.obj.defaultArguments = list;
        } else {
          this.selectedNode.job.defaultArguments = list;
        }
      }
    }
  }

  private reset(): void {
    this.object = {
      checked1: false,
      indeterminate1: false,
      setOfCheckedArgu: new Set<string>(),
      checked2: false,
      indeterminate2: false,
      setOfCheckedJobArgu: new Set<string>(),
      checked3: false,
      indeterminate3: false,
      setOfCheckedEnv: new Set<string>(),
      checked4: false,
      indeterminate4: false,
      setOfCheckedNodeArgu: new Set<string>(),
      checked5: false,
      indeterminate5: false,
      setOfCheckedDefaultArgu: new Set<string>()
    };
  }

  private cutCopyOperation(type, operation): void {
    if (type === 'arguments') {
      this.object.checked2 = false;
      this.object.indeterminate2 = false;
      this.object.checked3 = false;
      this.object.indeterminate3 = false;
      this.object.checked4 = false;
      this.object.indeterminate4 = false;
      this.object.checked5 = false;
      this.object.indeterminate5 = false;
      this.object.setOfCheckedJobArgu.clear();
      this.object.setOfCheckedEnv.clear();
      this.object.setOfCheckedNodeArgu.clear();
      this.object.setOfCheckedDefaultArgu.clear();
    } else if (type === 'jobArguments') {
      this.object.checked1 = false;
      this.object.indeterminate1 = false;
      this.object.checked3 = false;
      this.object.indeterminate3 = false;
      this.object.checked4 = false;
      this.object.indeterminate4 = false;
      this.object.checked5 = false;
      this.object.indeterminate5 = false;
      this.object.setOfCheckedArgu.clear();
      this.object.setOfCheckedEnv.clear();
      this.object.setOfCheckedNodeArgu.clear();
      this.object.setOfCheckedDefaultArgu.clear();
    } else if (type === 'env') {
      this.object.checked1 = false;
      this.object.indeterminate1 = false;
      this.object.checked2 = false;
      this.object.indeterminate2 = false;
      this.object.checked4 = false;
      this.object.indeterminate4 = false;
      this.object.checked5 = false;
      this.object.indeterminate5 = false;
      this.object.setOfCheckedArgu.clear();
      this.object.setOfCheckedJobArgu.clear();
      this.object.setOfCheckedNodeArgu.clear();
      this.object.setOfCheckedDefaultArgu.clear();
    } else if (type === 'nodeArguments') {
      this.object.checked1 = false;
      this.object.indeterminate1 = false;
      this.object.checked2 = false;
      this.object.indeterminate2 = false;
      this.object.checked3 = false;
      this.object.indeterminate3 = false;
      this.object.checked5 = false;
      this.object.indeterminate5 = false;
      this.object.setOfCheckedArgu.clear();
      this.object.setOfCheckedJobArgu.clear();
      this.object.setOfCheckedEnv.clear();
      this.object.setOfCheckedDefaultArgu.clear();
    } else {
      this.object.checked1 = false;
      this.object.indeterminate1 = false;
      this.object.checked2 = false;
      this.object.indeterminate2 = false;
      this.object.checked3 = false;
      this.object.indeterminate3 = false;
      this.object.checked4 = false;
      this.object.indeterminate4 = false;
      this.object.setOfCheckedArgu.clear();
      this.object.setOfCheckedJobArgu.clear();
      this.object.setOfCheckedEnv.clear();
      this.object.setOfCheckedNodeArgu.clear();
    }
    let list = this.getList(type);
    const arr = list.filter(item => {
      if (type === 'arguments') {
        return this.object.setOfCheckedArgu.has(item.name);
      } else if (type === 'jobArguments') {
        return this.object.setOfCheckedJobArgu.has(item.name);
      } else if (type === 'env') {
        return this.object.setOfCheckedEnv.has(item.name);
      } else if (type === 'nodeArguments') {
        return this.object.setOfCheckedNodeArgu.has(item.name);
      } else {
        return this.object.setOfCheckedDefaultArgu.has(item.name);
      }
    });
    this.copiedParamObjects = {operation, type, data: arr, name: this.selectedNode.obj.jobName};
    this.coreService.tabs._configuration.copiedParamObjects = this.coreService.clone(this.copiedParamObjects);
  }

  private getList(type): Array<any> {
    if (type === 'arguments') {
      return this.selectedNode.job.executable.arguments;
    } else if (type === 'jobArguments') {
      return this.selectedNode.job.executable.jobArguments;
    } else if (type === 'env') {
      return this.selectedNode.job.executable.env;
    } else if (type === 'nodeArguments') {
      return this.selectedNode.obj.defaultArguments;
    } else {
      return this.selectedNode.job.defaultArguments;
    }
  }

  pasteParam(obj: any, type: string): void {
    if (!this.copiedParamObjects.data) {
      return;
    }
    const arr = this.getPasteParam(obj[type], this.copiedParamObjects.data);
    if (arr.length > 0) {
      obj[type] = obj[type].filter((item) => {
        return !!item.name;
      });
      obj[type] = obj[type].concat(arr);
    }
    const arrList = this.getList(this.copiedParamObjects.type);
    if (this.copiedParamObjects.operation === 'CUT' && arrList && arrList.length > 0) {
      this.cutOperation();
      if (this.copiedParamObjects.type === 'arguments') {
        this.object.setOfCheckedArgu = new Set<string>();
        this.object.checked1 = false;
        this.object.indeterminate1 = false;
      } else if (this.copiedParamObjects.type === 'jobArguments') {
        this.object.setOfCheckedJobArgu = new Set<string>();
        this.object.checked2 = false;
        this.object.indeterminate2 = false;
      } else if (this.copiedParamObjects.type === 'env') {
        this.object.setOfCheckedEnv = new Set<string>();
        this.object.checked3 = false;
        this.object.indeterminate3 = false;
      } else if (this.copiedParamObjects.type === 'nodeArguments') {
        this.object.setOfCheckedNodeArgu = new Set<string>();
        this.object.checked4 = false;
        this.object.indeterminate4 = false;
      } else {
        this.object.setOfCheckedDefaultArgu = new Set<string>();
        this.object.checked5 = false;
        this.object.indeterminate5 = false;
      }
      this.copiedParamObjects = {};
      this.coreService.tabs._configuration.copiedParamObjects = this.copiedParamObjects;
      this.ref.detectChanges();
    }
  }

  /**
   * Function: To paste param fom one job param to another param list
   */
  private getPasteParam(sour, target): any {
    const temp = this.coreService.clone(target);
    if (sour) {
      for (let i = 0; i < sour.length; i++) {
        if (temp) {
          for (let j = 0; j < temp.length; j++) {
            if (sour[i].name === temp[j].name) {
              temp.splice(j, 1);
              break;
            }
          }
        }
      }
    }
    return temp;
  }

  private getScript(curWord): void {
    const regex = new RegExp('^' + curWord, 'i');
    const list = (!curWord ? this.list : this.list.filter((item) => {
      return item.match(regex);
    })).sort();
    const options = {
      completeSingle: false,
      hint: (CodeMirror) => {
        return {
          from: CodeMirror.getDoc().getCursor(),
          to: CodeMirror.getDoc().getCursor(),
          list
        };
      }
    };
    this.cm.codeMirror.showHint(options);
  }

  openEditor(data: any): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: ValueEditorComponent,
      nzClassName: 'lg',
      nzComponentParams: {
        data: data.value
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        data.value = result;
        this.ref.detectChanges();
        this.saveToHistory();
      }
    });
  }

  onBlur(isAgent = false): void {
    if (isAgent) {
      this.onAgentChange('');
    }
    if (this.error && this.selectedNode && this.selectedNode.obj) {
      this.obj.label = !this.selectedNode.obj.label;
      this.obj.agent = !this.selectedNode.job.agentName;
      this.obj.script = !this.selectedNode.job.executable.script && this.selectedNode.job.executable.TYPE === 'ShellScriptExecutable';
      this.obj.className = !this.selectedNode.job.executable.className && this.selectedNode.job.executable.TYPE === 'InternalExecutable';
    } else {
      this.obj = {};
    }
    this.saveToHistory();
  }

  onAgentChange(value: string): void {
    this.agentList = this.agents.filter(option => option.toLowerCase().indexOf(value.toLowerCase()) > -1);
    this.agentList = [...this.agentList];
  }

  onChangeJobResource(value): void {
    if (!isEqual(JSON.stringify(this.selectedNode.job.jobResourceNames), JSON.stringify(value))) {
      this.selectedNode.job.jobResourceNames = value;
    }
  }

  saveToHistory(): void {
    let flag1 = false;
    let flag2 = false;
    if (!isEqual(this.presentObj.obj, JSON.stringify(this.selectedNode.obj))) {
      flag1 = true;
    }
    if (!isEqual(this.presentObj.job, JSON.stringify(this.selectedNode.job))) {
      flag2 = true;
    }
    if (flag1 || flag2) {
      if (this.presentObj && !isEmpty(this.presentObj)) {
        this.history.push(clone(JSON.stringify(this.presentObj)));
        this.indexOfNextAdd = this.history.length - 1;
      }
      if (flag1) {
        this.presentObj.obj = JSON.stringify(this.selectedNode.obj);
      }
      if (flag2) {
        this.presentObj.job = JSON.stringify(this.selectedNode.job);
      }
    }
  }

  checkString(data, type): void {
    if (data[type] && typeof data[type] == 'string') {
      const startChar = data[type].substring(0, 1);
      const endChar = data[type].substring(data[type].length - 1);
      if ((startChar === '\'' && endChar === '\'') || (startChar === '"' && endChar === '"')) {
        data[type] = data[type].substring(1, data[type].length - 1);
      }
    }
  }

  getJobInfo(): void {
    if (!this.isModal) {
      let flag = false;
      for (let i = 0; i < this.jobs.length; i++) {
        if (this.jobs[i].name === this.selectedNode.obj.jobName) {
          this.selectedNode.job = {...this.selectedNode.job, ...this.coreService.clone(this.jobs[i].value)};
          flag = true;
          break;
        }
      }
      if (!flag) {
        this.selectedNode.job = {jobName: this.selectedNode.obj.jobName};
      }
    }
    this.setJobProperties();
  }

  checkJobInfo(): void {
    if (!this.selectedNode.obj.jobName) {
      this.selectedNode.obj.jobName = 'job';
    }
    if (this.selectedNode.job.jobName !== this.selectedNode.obj.jobName) {
      this.selectedNode.job.jobName = this.selectedNode.obj.jobName;
      for (const i in this.jobs) {
        if (this.jobs[i] && this.jobs[i].name === this.selectedNode.obj.jobName) {
          this.selectedNode.job = {...this.selectedNode.job, ...this.coreService.clone(this.jobs[i].value)};
          break;
        }
      }
      this.setJobProperties();
    }
    if (!this.selectedNode.obj.label) {
      this.selectedNode.obj.label = this.selectedNode.obj.jobName;
    }
    this.saveToHistory();
  }

  addArgument(): void {
    const param = {
      name: '',
      value: ''
    };
    if (this.selectedNode.obj.defaultArguments) {
      if (!this.coreService.isLastEntryEmpty(this.selectedNode.obj.defaultArguments, 'name', '')) {
        this.selectedNode.obj.defaultArguments.push(param);
      }
    }
  }

  removeArgument(index): void {
    this.selectedNode.obj.defaultArguments.splice(index, 1);
    this.saveToHistory();
  }

  addJobArgument(): void {
    const param = {
      name: '',
      value: ''
    };
    if (this.selectedNode.job.executable.jobArguments) {
      if (!this.coreService.isLastEntryEmpty(this.selectedNode.job.executable.jobArguments, 'name', '')) {
        this.selectedNode.job.executable.jobArguments.push(param);
      }
    }
  }

  removeJobArgument(index): void {
    this.selectedNode.job.executable.jobArguments.splice(index, 1);
    this.saveToHistory();
  }

  addVariable(): void {
    const param = {
      name: '',
      value: ''
    };
    if (this.selectedNode.job.defaultArguments) {
      if (!this.coreService.isLastEntryEmpty(this.selectedNode.job.defaultArguments, 'name', '')) {
        this.selectedNode.job.defaultArguments.push(param);
      }
    }
  }

  removeVariable(index): void {
    this.selectedNode.job.defaultArguments.splice(index, 1);
    this.saveToHistory();
  }

  addArgu(): void {
    const param = {
      name: '',
      value: ''
    };
    if (this.selectedNode.job.executable.arguments) {
      if (!this.coreService.isLastEntryEmpty(this.selectedNode.job.executable.arguments, 'name', '')) {
        this.selectedNode.job.executable.arguments.push(param);
      }
    }
  }

  removeArgu(index): void {
    this.selectedNode.job.executable.arguments.splice(index, 1);
    this.saveToHistory();
  }

  addEnv(): void {
    const param = {
      name: '',
      value: ''
    };
    if (this.selectedNode.job.executable.env) {
      if (!this.coreService.isLastEntryEmpty(this.selectedNode.job.executable.env, 'name', 'isRequired')) {
        this.selectedNode.job.executable.env.push(param);
      }
    }
  }

  removeEnv(index): void {
    this.selectedNode.job.executable.env.splice(index, 1);
    this.saveToHistory();
  }

  isStringValid(data, form, list): void {
    if (form.invalid) {
      data.name = '';
      data.value = '';
    } else {
      let count = 0;
      if (list.length > 1) {
        for (let i in list) {
          if (list[i].name === data.name) {
            ++count;
          }
          if (count > 1) {
            form.control.setErrors({incorrect: true});
            break;
          }
        }
      }
    }
  }

  upperCase(env): void {
    if (env.name) {
      env.name = env.name.toUpperCase();
      if (!env.value) {
        env.value = '$' + env.name.toLowerCase();
      }
    }
  }

  onChange(value: string): void {
    this.filteredOptions = [...this.filteredOptions.filter(option => option.name.toLowerCase().indexOf(value.toLowerCase()) === -1)];
  }

  valueWith = (data: { name: string }) => data.name;

  checkValue(argu): void {
    if (argu && argu.value && /\s+$/.test(argu.value)) {
      argu.value = argu.value.trim();
    }
  }

  onKeyPress($event, type): void {
    if (type === 'jobArgument') {
      if ($event.key === '$') {
        $event.preventDefault();
      }
    }
    if ($event.which === '13' || $event.which === 13) {
      type === 'default' ? this.addVariable() : type === 'jobArgument' ? this.addJobArgument() : type === 'node' ? this.addArgument() : this.addArgu();
      this.saveToHistory();
    }
  }

  loadData(node, type, $event): void {
    if (!node || !node.origin) {
      return;
    }
    if (!node.origin.type) {
      if ($event) {
        node.isExpanded = !node.isExpanded;
        $event.stopPropagation();
      }
      if (type === InventoryObject.JOBRESOURCE || type === InventoryObject.INCLUDESCRIPT) {
        return;
      }
      let flag = true;
      if (node.origin.children && node.origin.children.length > 0 && node.origin.children[0].type) {
        flag = false;
      }
      if (node && (node.isExpanded || node.origin.isLeaf) && flag) {
        let request: any = {
          path: node.key,
          objectTypes: [type]
        };
        if (type === 'DOCUMENTATION') {
          request = {
            folders: [{folder: node.key, recursive: false}],
            onlyWithAssignReference: true
          };
        }
        const URL = type === 'DOCUMENTATION' ? 'documentations' : 'inventory/read/folder';
        this.coreService.post(URL, request).subscribe((res: any) => {
          let data = res.documentations || res.jobResources;
          for (let i = 0; i < data.length; i++) {
            const path = node.key + (node.key === '/' ? '' : '/') + data[i].name;
            data[i].title = data[i].assignReference || data[i].name;
            data[i].path = path;
            data[i].key = data[i].assignReference || data[i].name;
            data[i].type = type;
            data[i].isLeaf = true;
          }
          if (node.origin.children && node.origin.children.length > 0) {
            data = data.concat(node.origin.children);
          }
          if (node.origin.isLeaf) {
            node.origin.expanded = true;
          }
          node.origin.isLeaf = false;
          node.origin.children = data;
          if (type === 'DOCUMENTATION') {
            this.documentationTree = [...this.documentationTree];
          }
          this.ref.detectChanges();
        });
      }
    } else {
      if (type === 'DOCUMENTATION') {
        if (this.selectedNode.job.documentationName1) {
          if (this.selectedNode.job.documentationName !== this.selectedNode.job.documentationName1) {
            this.selectedNode.job.documentationName = this.selectedNode.job.documentationName1;
          }
        } else if (node.key && !node.key.match('/')) {
          if (this.selectedNode.job.documentationName !== node.key) {
            this.selectedNode.job.documentationName = node.key;
          }
        }
      }
      setTimeout(() => {
        this.saveToHistory();
      }, 10);
    }
  }

  onExpand(e, type): void {
    this.loadData(e.node, type, null);
  }

  private init(): void {
    this.copiedParamObjects = this.coreService.getConfigurationTab().copiedParamObjects;
    this.getJobInfo();
    this.selectedNode.obj.defaultArguments = this.coreService.convertObjectToArray(this.selectedNode.obj, 'defaultArguments');
    if (this.selectedNode.obj.defaultArguments && this.selectedNode.obj.defaultArguments.length === 0) {
      this.addArgument();
    }
    if (this.selectedNode.job.jobResourceNames && this.selectedNode.job.jobResourceNames.length > 0) {
      this.selectedNode.job.jobResourceNames = [...this.selectedNode.job.jobResourceNames];
    }
    this.onBlur();
    if (this.index === 0) {
      this.reloadScript();
    }
    this.checkIsAgentExist();
    this.presentObj.obj = JSON.stringify(this.selectedNode.obj);
    this.presentObj.job = JSON.stringify(this.selectedNode.job);
  }

  private setJobProperties(): void {
    if (!this.selectedNode.job.parallelism) {
      this.selectedNode.job.parallelism = 1;
    }
    if (!this.selectedNode.job.executable || !this.selectedNode.job.executable.TYPE) {
      this.selectedNode.job.executable = {
        TYPE: 'ShellScriptExecutable',
        script: '',
        login: {},
        env: []
      };
    }
    if (this.selectedNode.job.executable.TYPE === 'ScriptExecutable') {
      this.selectedNode.job.executable.TYPE = 'ShellScriptExecutable';
    }

    if (!this.selectedNode.job.executable.returnCodeMeaning) {
      this.selectedNode.job.executable.returnCodeMeaning = {
        success: 0
      };
    } else {
      if (this.selectedNode.job.executable.returnCodeMeaning.success) {
        this.selectedNode.job.executable.returnCodeMeaning.success = this.selectedNode.job.executable.returnCodeMeaning.success.toString();
      } else if (this.selectedNode.job.executable.returnCodeMeaning.failure) {
        this.selectedNode.job.executable.returnCodeMeaning.failure = this.selectedNode.job.executable.returnCodeMeaning.failure.toString();
      }
    }
    if (this.selectedNode.job.executable.returnCodeMeaning.failure) {
      this.returnCodes.on = 'failure';
    } else {
      this.returnCodes.on = 'success';
    }

    if (!this.selectedNode.job.defaultArguments || isEmpty(this.selectedNode.job.defaultArguments)) {
      this.selectedNode.job.defaultArguments = [];
    } else {
      if (!isArray(this.selectedNode.job.defaultArguments)) {
        this.selectedNode.job.defaultArguments = this.coreService.convertObjectToArray(this.selectedNode.job, 'defaultArguments');
        this.selectedNode.job.defaultArguments.filter((argu) => {
          this.coreService.removeSlashToString(argu, 'value');
        });
      }
    }
    if (!this.selectedNode.job.executable.arguments || isEmpty(this.selectedNode.job.executable.arguments)) {
      this.selectedNode.job.executable.arguments = [];
    } else {
      if (!isArray(this.selectedNode.job.executable.arguments)) {
        this.selectedNode.job.executable.arguments = this.coreService.convertObjectToArray(this.selectedNode.job.executable, 'arguments');
        this.selectedNode.job.executable.arguments.filter((env) => {
          this.coreService.removeSlashToString(env, 'value');
        });
      }
    }

    if (!this.selectedNode.job.executable.jobArguments || isEmpty(this.selectedNode.job.executable.jobArguments)) {
      this.selectedNode.job.executable.jobArguments = [];
    } else {
      if (!isArray(this.selectedNode.job.executable.jobArguments)) {
        this.selectedNode.job.executable.jobArguments = this.coreService.convertObjectToArray(this.selectedNode.job.executable, 'jobArguments');
        this.selectedNode.job.executable.jobArguments.filter((argu) => {
          this.coreService.removeSlashToString(argu, 'value');
        });
      }
    }

    if (!this.selectedNode.job.executable.env || isEmpty(this.selectedNode.job.executable.env)) {
      this.selectedNode.job.executable.env = [];
    } else {
      if (!isArray(this.selectedNode.job.executable.env)) {
        this.selectedNode.job.executable.env = this.coreService.convertObjectToArray(this.selectedNode.job.executable, 'env');
        this.selectedNode.job.executable.env.filter((env) => {
          this.coreService.removeSlashToString(env, 'value');
        });
      }
    }

    if (!this.selectedNode.job.executable.login) {
      this.selectedNode.job.executable.login = {};
    }

    if (!this.selectedNode.job.notification) {
      this.selectedNode.job.notification = {
        mail: {}
      };
    } else if (!this.selectedNode.job.notification.mail) {
      this.selectedNode.job.notification.mail = {};
    }

    if (this.selectedNode.job.timeout) {
      this.selectedNode.job.timeout1 = this.workflowService.convertDurationToString(this.selectedNode.job.timeout);
    }
    if (this.selectedNode.job.graceTimeout) {
      this.selectedNode.job.graceTimeout1 = this.workflowService.convertDurationToString(this.selectedNode.job.graceTimeout);
    }
    if (this.selectedNode.job.defaultArguments && this.selectedNode.job.defaultArguments.length === 0) {
      this.addVariable();
    }
    if (this.selectedNode.job.executable.arguments && this.selectedNode.job.executable.arguments.length === 0) {
      this.addArgu();
    }
    if (this.selectedNode.job.executable.jobArguments && this.selectedNode.job.executable.jobArguments.length === 0) {
      this.addJobArgument();
    }
    if (this.selectedNode.job.executable.env && this.selectedNode.job.executable.env.length === 0) {
      this.addEnv();
    }
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
      this.restoreData(obj);
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
      this.restoreData(obj);
    }
  }

  private restoreData(obj: any): void {
    obj = JSON.parse(obj);
    this.selectedNode.obj = JSON.parse(obj.obj);
    const x = JSON.parse(obj.job);
    if (this.selectedNode.job.executable.TYPE !== x.executable.TYPE && x.executable.TYPE === 'ShellScriptExecutable') {
      this.reloadScript();
    }
    this.selectedNode.job = x;
    this.ref.detectChanges();
  }
}

@Component({
  selector: 'app-script-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './script-editor.html'
})
export class ScriptEditorComponent implements AfterViewInit {
  @Input() script: any;
  @Input() list: any = [];
  @Input() scriptTree: any = [];
  dragEle: any;
  scriptList: Array<string> = [];
  scriptObj = {
    name: '',
    show: false
  };
  cmOption: any = {
    lineNumbers: true,
    viewportMargin: Infinity,
    autofocus: true,
    autoRefresh: true,
    mode: 'shell',
    extraKeys: {'Ctrl-Space': 'autocomplete'}
  };
  @ViewChild('codeMirror', {static: true}) cm: any;

  constructor(private coreService: CoreService, public activeModal: NzModalRef, private dragDrop: DragDrop) {
  }

  ngAfterViewInit(): void {
    if (localStorage.$SOS$SCRIPTWINDOWWIDTH) {
      const wt = parseInt(localStorage.$SOS$SCRIPTWINDOWWIDTH, 10);
      this.cm.codeMirror.setSize(wt - 2, (parseInt(localStorage.$SOS$SCRIPTWINDOWHIGHT, 10) - 2));
      $('.ant-modal').css('cssText', 'width : ' + (wt + 32) + 'px !important');
    }
    this.dragEle = this.dragDrop.createDrag(this.activeModal.containerInstance.modalElementRef.nativeElement);
    $('#resizable').resizable({
      resize: (e, x) => {
        const dom: any = document.getElementsByClassName('script-editor')[0];
        this.cm.codeMirror.setSize((x.size.width - 2), (x.size.height - 2));
        dom.style.setProperty('width', (x.size.width + 32) + 'px', 'important');
      }, stop: (e, x) => {
        localStorage.$SOS$SCRIPTWINDOWWIDTH = x.size.width;
        localStorage.$SOS$SCRIPTWINDOWHIGHT = x.size.height;
      }
    });
    if (this.list.length > 0) {
      this.scriptList = this.list.map((item) => item.name);
    }
    setTimeout(() => {
      if (this.cm && this.cm.codeMirror) {
        this.cm.codeMirror.focus();
        this.cm.codeMirror.on('inputRead', (editor, e) => {
          const cursor = editor.getCursor();
          const currentLine = editor.getLine(cursor.line);
          if (currentLine && currentLine.match(/^(##|::|\/\/)!include/i)) {
            let start = cursor.ch;
            let end = start;
            while (end < currentLine.length && /[\w$]+/.test(currentLine.charAt(end))) {
              ++end;
            }
            while (start && /[\w$]+/.test(currentLine.charAt(start - 1))) {
              --start;
            }
            const curWord = start != end && currentLine.slice(start, end);
            this.getScript(curWord);
          }
        });
      }
    }, 500);
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(e): void {
    if (this.dragEle) {
      this.dragEle.disabled = !(e.target && (e.target.getAttribute('class') === 'modal-header' || e.target.getAttribute('class') === 'drag-text'));
    }
  }

  onSubmit(): void {
    this.activeModal.close(this.script);
  }

  execCommand(type): void {
    this.cm.codeMirror.execCommand(type);
    this.coreService.updateReplaceText();
  }

  loadData(node, $event): void {
    if (!node || !node.origin) {
      return;
    }
    if (!node.origin.type) {
      if ($event) {
        node.isExpanded = !node.isExpanded;
        $event.stopPropagation();
      }
    }
  }

  onExpand(e): void {
    this.loadData(e.node, null);
  }

  private getScript(curWord): void {
    const regex = new RegExp('^' + curWord, 'i');
    const list = (!curWord ? this.scriptList : this.scriptList.filter((item) => {
      return item.match(regex);
    })).sort();
    const options = {
      completeSingle: false,
      hint: (CodeMirror) => {
        return {
          from: CodeMirror.getDoc().getCursor(),
          to: CodeMirror.getDoc().getCursor(),
          list
        };
      }
    };
    this.cm.codeMirror.showHint(options);
  }

  showTree(): void {
    this.scriptObj.show = true;
  }

  closeScriptTree(): void {
    if (this.scriptObj.show) {
      const doc = this.cm.codeMirror.getDoc();
      const cursor = this.cm.codeMirror.getCursor(); // gets the line number in the cursor position
      doc.replaceRange(this.scriptObj.name, cursor);
      cursor.ch = cursor.ch + this.scriptObj.name.length;
      this.cm.codeMirror.focus();
      doc.setCursor(cursor);
      this.scriptObj.name = '';
    }
    this.scriptObj.show = false;
  }
}

@Component({
  selector: 'app-expression-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './expression-editor.html'
})
export class ExpressionComponent implements OnInit {
  @Input() selectedNode: any;
  @Input() error: any;
  @Input() isTooltipVisible: boolean;
  expression: any = {};
  operators = ['==', '!=', '<', '<=', '>', '>=', 'in', '&&', '||', '!'];
  functions = ['toNumber', 'toBoolean'];
  variablesOperators = ['matches', 'startWith', 'endsWith', 'contains'];
  varExam = 'variable ("aString", default="") matches ".*"';
  lastSelectOperator = '';
  @ViewChild('codeMirror', {static: false}) cm;
  cmOption: any = {
    lineNumbers: false,
    autofocus: true,
    autoRefresh: true,
    mode: 'ruby'
  };

  constructor() {
  }

  ngOnInit(): void {
    this.expression.type = 'returnCode';
    this.change();
  }

  generateExpression(type, operator): void {
    this.lastSelectOperator = operator;
    let setText;
    if (type == 'function') {
      setText = operator + '(EXPR)';
      if (operator === 'toNumber') {
        this.varExam = operator + '(variable ("NAME"))';
      } else if (operator === 'toBoolean') {
        this.varExam = operator + '(variable ("NAME"))';
      } else {
        this.varExam = 'variable("aString", default="").' + operator;
      }
    } else {
      if (operator) {
        setText = operator + ' ';
      } else {
        this.expression.type = type;
        setText = type;
        if (type === 'returnCode') {
          setText += ' ';
        } else {
          setText += '(\'NAME\')';
        }
      }
    }

    this.insertText(setText, this.cm.codeMirror.getDoc());
  }

  change(): void {
    this.error = !this.selectedNode.obj.predicate;
  }

  // Begin inputting of clicked text into editor
  private insertText(data, doc): void {
    const cursor = doc.getCursor(); // gets the line number in the cursor position
    doc.replaceRange(data, cursor);
    cursor.ch = cursor.ch + data.length;
    this.cm.codeMirror.focus();
    doc.setCursor(cursor);
  }
}

@Component({
  selector: 'app-import-content',
  templateUrl: './import-dialog.html'
})
export class ImportComponent implements OnInit {
  workflow: any;
  submitted = false;
  hasBaseDropZoneOver: any;
  uploader: FileUploader;

  constructor(public activeModal: NzModalRef, public translate: TranslateService, public toasterService: ToastrService) {
    this.uploader = new FileUploader({
      url: '',
      queueLimit: 1
    });
  }

  ngOnInit(): void {
    this.uploader.onCompleteItem = (fileItem: any, response, status, headers) => {
      if (status === 200) {
        this.activeModal.close('success');
      }
    };

    this.uploader.onErrorItem = (fileItem, response: any, status, headers) => {
      const res = typeof response === 'string' ? JSON.parse(response) : response;
      if (res.error) {
        this.toasterService.error(res.error.message, res.error.code);
      }
    };
  }

  fileOverBase(e: any): void {
    this.hasBaseDropZoneOver = e;
  }

  // CALLBACKS
  onFileSelected(event: any): void {
    const self = this;
    const item = event['0'];

    const fileExt = item.name.slice(item.name.lastIndexOf('.') + 1).toUpperCase();
    if (fileExt != 'JSON') {
      let msg = '';
      this.translate.get('error.message.invalidFileExtension').subscribe(translatedValue => {
        msg = translatedValue;
      });
      this.toasterService.error(fileExt + ' ' + msg);
      this.uploader.clearQueue();
    } else {
      const reader = new FileReader();
      reader.readAsText(item, 'UTF-8');
      reader.onload = onLoadFile;
    }

    function onLoadFile(_event) {
      let data;
      try {
        data = JSON.parse(_event.target.result);
        self.workflow = data;
      } catch (e) {

      }
      if (!data || !data.instructions || data.instructions.length == 0) {
        let msg = '';
        self.translate.get('workflow.message.inValidWorkflow').subscribe(translatedValue => {
          msg = translatedValue;
        });
        self.toasterService.error(msg);
        self.uploader.queue[0].remove();
        return;
      }
    }
  }

  onSubmit(): void {
    this.submitted = true;
    setTimeout(() => {
      this.activeModal.close(this.workflow);
    }, 100);
  }
}

@Component({
  selector: 'app-workflow',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './workflow.component.html',
  styleUrls: ['./workflow.component.scss']
})
export class WorkflowComponent implements OnChanges, OnDestroy {
  @Input() data: any;
  @Input() preferences: any;
  @Input() schedulerId: any;
  @Input() permission: any;
  @Input() copyObj: any;
  @Input() reload: any;
  @Input() isTrash: any;

  agents = [];
  jobResourcesTree = [];
  documentationTree = [];
  workflowTree = [];
  lockTree = [];
  boardTree = [];
  scriptTree = [];
  scriptList = [];
  configXml = './assets/mxgraph/config/diagrameditor.xml';
  editor: any;
  dummyXml: any;
  // Declare Map object to store fork and join Ids
  nodeMap = new Map();
  droppedCell: any;
  movedCell: any;
  isCellDragging = false;
  display = false;
  propertyPanelWidth: number;
  selectedNode: any;
  node: any;
  title = '';
  timeZone = '';
  documentationName = '';
  extraConfiguration: any = {};
  zones: any = [];
  jobs: any = [];
  jobResourceNames: any = [];
  forkListVariables: any = [];
  listOfParams: any = [];
  forkListVariableObj: any = {};
  orderPreparation: any = {};
  workflow: any = {};
  history = {past: [], present: {}, future: [], type: 'new'};
  implicitSave = false;
  noSave = false;
  isLoading = true;
  isUpdate: boolean;
  isStore = false;
  error: boolean;
  cutCell: any;
  copyId: any;
  skipXMLToJSONConversion = false;
  objectType = InventoryObject.WORKFLOW;
  invalidMsg: string;
  inventoryConf: any;
  allowedDatatype = ['String', 'Number', 'Boolean', 'Final', 'List'];
  variableDeclarations = {parameters: []};
  document = {name: ''};
  fullScreen = false;
  subscription1: Subscription;
  subscription2: Subscription;
  subscription3: Subscription;

  @ViewChild('menu', {static: true}) menu: NzDropdownMenuComponent;
  @ViewChild('treeSelectCtrl', {static: false}) treeSelectCtrl;

  constructor(public coreService: CoreService, public translate: TranslateService, private modal: NzModalService, public inventoryService: InventoryService,
              private toasterService: ToastrService, public workflowService: WorkflowService, private dataService: DataService, private message: NzMessageService,
              private nzContextMenuService: NzContextMenuService, private router: Router, private ref: ChangeDetectorRef) {
    this.subscription1 = dataService.reloadTree.subscribe(res => {
      if (res && !isEmpty(res)) {
        if (res.reloadTree && this.workflow.actual) {
          this.ref.detectChanges();
        } else if (res.saveObject && this.selectedNode) {
          if (res.saveObject.id) {
            if (res.saveObject.id && res.saveObject.id === this.data.id) {
              this.initEditorConf(this.editor, false, true);
            }
          } else {
            this.initEditorConf(this.editor, false, true);
          }
        }
      }
    });
    this.subscription2 = dataService.refreshAnnounced$.subscribe(() => {
      setTimeout(() => {
        this.getAgents();
      }, 0);
    });
    this.subscription3 = dataService.eventAnnounced$.subscribe(res => {
      this.refresh(res);
    });
    this.zones = coreService.getTimeZoneList();
  }

  private static parseWorkflowJSON(result): void {
    if (result.jobs && !isEmpty(result.jobs)) {
      for (const x in result.jobs) {
        const v: any = result.jobs[x];
        if (v.executable.TYPE === 'ScriptExecutable') {
          result.jobs[x].executable.TYPE = 'ShellScriptExecutable';
        }
        result.jobs[x] = {
          agentName: v.agentName,
          executable: v.executable,
          defaultArguments: v.defaultArguments,
          jobResourceNames: v.jobResourceNames,
          title: v.title,
          admissionTimeScheme: v.admissionTimeScheme,
          logLevel: v.logLevel,
          criticality: v.criticality,
          timeout: v.timeout,
          graceTimeout: v.graceTimeout,
          warnIfShorter: v.warnIfShorter,
          warnIfLonger: v.warnIfLonger,
          notification: v.notification,
          parallelism: v.parallelism
        };
      }
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.copyObj && !changes.data) {
      return;
    }
    if (changes.reload) {
      if (this.reload) {
        this.selectedNode = null;
        this.init();
        this.reload = false;
        return;
      }
    }
    if (this.workflow.actual) {
      this.saveCopyInstruction();
      this.saveJSON(false);
      this.selectedNode = null;
    }
    if (changes.data) {
      if (this.data.type) {
        if (this.workflowTree.length > 0) {
          this.recursiveTreeUpdate(this.workflowTree);
        }
        this.init();
      } else {
        this.isLoading = false;
        this.workflow = {};
        this.jobs = [];
        this.title = '';
        this.timeZone = '';
        this.documentationName = '';
        this.jobResourceNames = [];
        this.orderPreparation = {};
        this.dummyXml = false;
        this.ref.detectChanges();
      }
    }
  }


  ngOnDestroy(): void {
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
    this.subscription3.unsubscribe();
    if (this.data.type) {
      this.saveCopyInstruction();
      this.saveJSON(false);
    }
    try {
      if (this.editor) {
        this.editor.destroy();
        mxOutline.prototype.destroy();
        this.editor = null;
        $('.mxTooltip').remove();
      }
    } catch (e) {
      console.error(e);
    }
  }

  private refresh(args): void {
    if (args.eventSnapshots && args.eventSnapshots.length > 0) {
      for (let j = 0; j < args.eventSnapshots.length; j++) {
        if (args.eventSnapshots[j].path) {
          if (args.eventSnapshots[j].eventType.match(/ItemChanged/) && args.eventSnapshots[j].objectType === this.objectType) {
            const path = this.data.path + (this.data.path === '/' ? '' : '/') + this.data.name;
            if (args.eventSnapshots[j].path === path) {
              this.getWorkflowObject();
              break;
            }
          }
        }
      }
    }
  }

  recursiveTreeUpdate(scr): void {
    function recursive(data): void {
      data.expanded = false;
      if (data.children && data.children.length > 0) {
        data.children = data.children.filter((item) => {
          if (item.children && item.children.length > 0) {
            recursive(item);
          }
          return !item.id;
        });
      }
    }

    recursive(scr[0]);
  }

  /**
   * Constructs a new application (returns an mxEditor instance)
   */
  createEditor(cb): void {
    let editor = null;
    const self = this;
    try {
      if (!mxClient.isBrowserSupported()) {
        mxUtils.error('Browser is not supported!', 200, false);
      } else {
        const xhr = mxUtils.load(this.configXml);
        xhr.request.onreadystatechange = function() {
          if (this.readyState === this.DONE) {
            const node = xhr.getDocumentElement();
            editor = new mxEditor(node);
            self.editor = editor;
            self.initEditorConf(editor, false, false);
            self.workflowService.init(!(self.preferences.theme === 'light' || self.preferences.theme === 'lighter' || !self.preferences.theme) ? 'dark' : 'light', editor.graph);
            const outln = document.getElementById('outlineContainer');
            outln.innerHTML = '';
            new mxOutline(self.editor.graph, outln);
            cb();
          }
        };
      }
    } catch (e) {
      // Shows an error message if the editor cannot start
      mxUtils.alert('Cannot start application: ' + e.message);
      console.error(e);
      cb();
    }
  }

  private saveCopyInstruction(): void {
    if (this.copyId) {
      let obj = this.getObject(this.workflow.configuration);
      if (obj.TYPE) {
        if (obj.TYPE === 'Job') {
          for (let i in this.jobs) {
            if (this.jobs[i] && this.jobs[i].name === obj.jobName) {
              obj.jobObject = this.jobs[i].value;
              break;
            }
          }
        }
        delete obj.id;
        delete obj.uuid;
        this.copyId = null;
        if (this.workflowService.isInstructionCollapsible(obj.TYPE)) {
          this.getJobsArray(obj);
        }
        this.inventoryConf.copiedInstuctionObject = obj;
      }
    }
  }

  private getJobsArray(obj): void {
    obj.jobs = [];
    const self = this;

    function recursive(json: any) {
      if (json.instructions) {
        for (let x = 0; x < json.instructions.length; x++) {
          if (json.instructions[x].TYPE === 'Job') {
            for (const i in self.jobs) {
              if (self.jobs[i] && self.jobs[i].name === json.instructions[x].jobName) {
                obj.jobs.push({name: json.instructions[x].jobName, value: self.jobs[i].value});
                break;
              }
            }
          }
          if (json.instructions[x].instructions) {
            recursive(json.instructions[x]);
          }
          if (json.instructions[x].catch) {
            if (json.instructions[x].catch.instructions && json.instructions[x].catch.instructions.length > 0) {
              recursive(json.instructions[x].catch);
            }
          }
          if (json.instructions[x].then) {
            if (json.instructions[x].then.instructions) {
              recursive(json.instructions[x].then);
            }
          }
          if (json.instructions[x].else) {
            if (json.instructions[x].else.instructions) {
              recursive(json.instructions[x].else);
            }
          }
          if (json.instructions[x].branches) {
            json.instructions[x].branches = json.instructions[x].branches.filter((branch: any) => {
              return (branch.instructions && branch.instructions.length > 0);
            });
            if (json.instructions[x].branches.length > 0) {
              for (let i = 0; i < json.instructions[x].branches.length; i++) {
                if (json.instructions[x].branches[i]) {
                  recursive(json.instructions[x].branches[i]);
                }
              }
            }
          }
        }
      }
    }

    recursive(obj);
  }

  zoomIn(): void {
    this.closeMenu();
    if (this.editor && this.editor.graph) {
      this.editor.graph.zoomIn();
    }
  }

  zoomOut(): void {
    this.closeMenu();
    if (this.editor && this.editor.graph) {
      this.editor.graph.zoomOut();
    }
  }

  actual(): void {
    this.closeMenu();
    if (this.editor && this.editor.graph) {
      this.editor.graph.zoomActual();
      this.center();
    }
  }

  fit(): void {
    this.closeMenu();
    if (this.editor && this.editor.graph) {
      this.editor.graph.fit();
      this.center();
    }
  }

  fitToScreen(): void {
    this.fullScreen = !this.fullScreen;
  }

  /**
   * Function: redo
   *
   * Redoes the last change.
   */
  redo(): void {
    // use first future state as next present ...
    if (this.history.future.length > 0) {
      let next = this.history.future[0];
      // ... and remove from future
      const newFuture = this.history.future.slice(1);
      this.history = {
        // push present into past for undo
        past: [this.history.present, ...this.history.past],
        present: next,
        future: newFuture,
        type: 'redo'
      };
      next = JSON.parse(next);
      this.updateWorkflowJSONObj(next);
      this.reloadWorkflow(next);
    }
  }

  /**
   * Function: undo
   *
   * Undoes the last change.
   */
  undo(): void {
    // use first past state as next present ...
    if (this.history.past.length > 0) {
      let previous = this.history.past[0];
      // ... and remove from past
      const newPast = this.history.past.slice(1);
      this.history = {
        past: newPast,
        present: previous,
        // push present into future for redo
        future: [this.history.present, ...this.history.future],
        type: 'undo'
      };
      previous = JSON.parse(previous);
      this.updateWorkflowJSONObj(previous);
      this.reloadWorkflow(previous);
    }
  }

  private updateWorkflowJSONObj(data): void {
    if (data.orderPreparation) {
      this.orderPreparation = data.orderPreparation;
    }
    this.extraConfiguration = {
      title: data.title,
      timeZone: data.timeZone,
      documentationName: data.documentationName,
      jobResourceNames: data.jobResourceNames,
    };
    delete data.title;
    delete data.timeZone;
    delete data.orderPreparation;
    delete data.documentationName;
    delete data.jobResourceNames;
    this.ref.detectChanges();
  }

  expandAll(): void {
    if (this.editor.graph.isEnabled()) {
      const cells = this.editor.graph.getChildVertices();
      this.editor.graph.foldCells(false, true, cells, null, null);
    }
  }

  collapseAll(): void {
    if (this.editor.graph.isEnabled()) {
      const cells = this.editor.graph.getChildVertices();
      this.editor.graph.foldCells(true, true, cells, null, null);
    }
  }

  delete(): void {
    if (this.editor && this.editor.graph) {
      const cells = this.node ? [this.node.cell] : null;
      this.editor.graph.removeCells(cells, null);
    }
  }

  deleteAll(): void {
    this.node.deleteAll = true;
    this.delete();
  }

  copy(node): void {
    if (this.editor && this.editor.graph) {
      let cell;
      if (node) {
        cell = node.cell;
      } else {
        cell = this.editor.graph.getSelectionCell();
      }
      if (cell) {
        if (this.cutCell) {
          this.changeCellStyle(this.editor.graph, this.cutCell, false);
          this.cutCell = null;
        }
        this.copyId = cell.getAttribute('uuid');
        if (this.copyId) {
          this.updateToolbar('copy', cell);
        }
        this.coreService.showCopyMessage(this.message);
      }
    }
  }

  cut(node): void {
    if (this.editor && this.editor.graph) {
      const graph = this.editor.graph;
      let cell;
      if (node) {
        cell = node.cell;
      } else {
        cell = graph.getSelectionCell();
      }
      if (cell) {
        this.copyId = null;
        if (this.cutCell) {
          this.changeCellStyle(graph, this.cutCell, false);
        }
        this.changeCellStyle(graph, cell, true);
        this.cutCell = cell;
        this.updateToolbar('cut', cell);
      }
    }
  }

  private updateToolbar(operation, cell, name = ''): void {
    $('#toolbar').find('img').each(function(index) {
      if (index === 15) {
        if (!cell && !name) {
          $(this).addClass('disable-link');
          $(this).attr('title', '');
        } else {
          $(this).removeClass('disable-link');
          $(this).attr('title', (operation === 'copy' ? 'Copy of ' : '') + (cell ? cell.value.tagName : name));
        }
      }
    });
  }

  navToWorkflowTab(): void {
    if (this.workflow.hasDeployments || this.data.deployed) {
      const PATH = this.data.path + (this.data.path === '/' ? '' : '/') + this.data.name;
      const pathArr = [];
      const arr = PATH.split('/');
      const workflowFilters = this.coreService.getWorkflowTab();
      workflowFilters.selectedkeys = [];
      const len = arr.length - 1;
      if (len > 1) {
        for (let i = 0; i < len; i++) {
          if (arr[i]) {
            if (i > 0 && pathArr[i - 1]) {
              pathArr.push(pathArr[i - 1] + (pathArr[i - 1] === '/' ? '' : '/') + arr[i]);
            } else {
              pathArr.push('/' + arr[i]);
            }
          } else {
            pathArr.push('/');
          }
        }
      }
      if (pathArr.length === 0) {
        pathArr.push('/');
      }
      workflowFilters.expandedKeys = pathArr;
      workflowFilters.selectedkeys.push(pathArr[pathArr.length - 1]);
      workflowFilters.expandedObjects = [PATH];
      this.router.navigate(['/workflows']);
    }
  }

  closeMenu(): void {
    this.node = null;
  }

  validate(): void {
    if (this.invalidMsg && this.invalidMsg.match(/orderPreparation/)) {
      this.selectedNode = null;
    } else {
      if (!this.workflow.valid) {
        const data = this.coreService.clone(this.workflow.configuration);
        this.modifyJSON(data, true, true);
      }
    }
  }

  exportJSON(): void {
    this.closeMenu();
    if (this.workflow.configuration && this.workflow.configuration.instructions && this.workflow.configuration.instructions.length > 0) {
      this.editor.graph.clearSelection();
      const name = (this.workflow.name || 'workflow') + '.workflow.json';
      const fileType = 'application/octet-stream';
      let data = this.coreService.clone(this.workflow.configuration);
      const flag = this.modifyJSON(data, true, true);
      if (!flag) {
        return;
      }
      if (typeof data === 'object') {
        const newData: any = {};
        if (this.orderPreparation) {
          newData.orderPreparation = this.orderPreparation;
        }
        newData.instructions = data.instructions;
        if (this.title) {
          newData.title = this.title;
        }
        if (this.timeZone) {
          newData.timeZone = this.timeZone;
        }
        if (this.documentationName) {
          newData.documentationName = this.documentationName;
        }
        if (this.jobResourceNames.length > 0) {
          newData.jobResourceNames = this.jobResourceNames;
        }
        newData.jobs = data.jobs;
        data = JSON.stringify(newData, undefined, 2);
      }
      const blob = new Blob([data], {type: fileType});
      saveAs(blob, name);
    }
  }

  importJSON(): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: ImportComponent,
      nzClassName: 'lg',
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        WorkflowComponent.parseWorkflowJSON(result);
        if (result.orderPreparation) {
          this.orderPreparation = this.coreService.clone(result.orderPreparation);
        }
        if (result.title) {
          this.title = this.coreService.clone(result.title);
        }
        if (result.timeZone) {
          this.timeZone = this.coreService.clone(result.timeZone);
        }
        if (result.documentationName) {
          this.documentationName = this.coreService.clone(result.documentationName);
        }
        if (result.jobResourceNames) {
          this.jobResourceNames = this.coreService.clone(result.jobResourceNames);
        }
        this.workflow.configuration = this.coreService.clone(result);
        if (result.jobs && !isEmpty(result.jobs)) {
          this.jobs = Object.entries(this.workflow.configuration.jobs).map(([k, v]) => {
            return {name: k, value: v};
          });
        }
        delete this.workflow.configuration.orderPreparation;
        delete this.workflow.configuration.jobResourceNames;
        delete this.workflow.configuration.title;
        delete this.workflow.configuration.timeZone;
        delete this.workflow.configuration.documentationName;
        this.history = {past: [], present: {}, future: [], type: 'new'};
        this.updateXMLJSON(false);
        this.storeData(result);
      }
    });
  }

  loadData(node, type, $event): void {
    if (!node || !node.origin) {
      return;
    }
    if (!node.origin.type) {
      if ($event) {
        node.isExpanded = !node.isExpanded;
        $event.stopPropagation();
      }
      if (type === InventoryObject.JOBRESOURCE) {
        return;
      }
      let flag = true;
      if (node.origin.children && node.origin.children.length > 0 && node.origin.children[0].type) {
        flag = false;
      }
      if (node && (node.isExpanded || node.origin.isLeaf) && flag) {
        let obj: any = {
          path: node.key,
          objectTypes: [type]
        };
        if (type === 'DOCUMENTATION') {
          obj = {
            folders: [{folder: node.key, recursive: false}],
            onlyWithAssignReference: true
          };
        }
        const URL = type === 'DOCUMENTATION' ? 'documentations' : 'inventory/read/folder';
        this.coreService.post(URL, obj).subscribe((res: any) => {
          let data = type === InventoryObject.LOCK ? res.locks : type === InventoryObject.WORKFLOW ? res.workflows : res.noticeBoards || res.documentations;
          for (let i = 0; i < data.length; i++) {
            const _path = node.key + (node.key === '/' ? '' : '/') + data[i].name;
            data[i].title = data[i].assignReference || data[i].name;
            data[i].path = _path;
            data[i].key = data[i].assignReference || data[i].name;
            data[i].type = type;
            data[i].isLeaf = true;
          }
          if (type === InventoryObject.WORKFLOW) {
            for (let i = 0; i < data.length; i++) {
              if (data[i].key === this.workflow.name) {
                data.splice(i, 1);
                break;
              }
            }
          }
          if (node.origin.children && node.origin.children.length > 0) {
            data = data.concat(node.origin.children);
          }
          if (node.origin.isLeaf) {
            node.origin.expanded = true;
          }
          node.origin.isLeaf = false;
          node.origin.children = data;
          if (type === InventoryObject.LOCK) {
            this.lockTree = [...this.lockTree];
          } else if (type === InventoryObject.WORKFLOW) {
            this.workflowTree = [...this.workflowTree];
          } else if (type === 'DOCUMENTATION') {
            this.documentationTree = [...this.documentationTree];
          } else if (type === InventoryObject.NOTICEBOARD) {
            this.boardTree = [...this.boardTree];
          }
          this.ref.detectChanges();
        });
      }
    } else {
      if (type === InventoryObject.LOCK) {
        if (this.selectedNode.obj.lockName1) {
          if (this.selectedNode.obj.lockName !== this.selectedNode.obj.lockName1) {
            this.selectedNode.obj.lockName = this.selectedNode.obj.lockName1;
            this.getLimit();
          }
        } else if (node.key && !node.key.match('/')) {
          if (this.selectedNode.obj.lockName !== node.key) {
            this.selectedNode.obj.lockName = node.key;
            this.getLimit();
          }
        }
      } else if (type === InventoryObject.WORKFLOW) {
        if (this.selectedNode.obj.workflowName1) {
          if (this.selectedNode.obj.workflowName !== this.selectedNode.obj.workflowName1) {
            this.selectedNode.obj.workflowName = this.selectedNode.obj.workflowName1;
            this.getWorkflow(true);
          }
        } else if (node.key && !node.key.match('/')) {
          if (this.selectedNode.obj.workflowName !== node.key) {
            this.selectedNode.obj.workflowName = node.key;
            this.getWorkflow(true);
          }
        }
      } else if (type === InventoryObject.NOTICEBOARD) {
        if (this.selectedNode.obj.noticeBoardName1) {
          if (this.selectedNode.obj.noticeBoardName !== this.selectedNode.obj.noticeBoardName1) {
            this.selectedNode.obj.noticeBoardName = this.selectedNode.obj.noticeBoardName1;
          }
        } else if (node.key && !node.key.match('/')) {
          if (this.selectedNode.obj.noticeBoardName !== node.key) {
            this.selectedNode.obj.noticeBoardName = node.key;
          }
        }
      } else if (type === 'DOCUMENTATION') {
        if (this.document.name) {
          if (this.extraConfiguration.documentationName !== this.document.name) {
            this.extraConfiguration.documentationName = this.document.name;
          }
        } else if (node.key && !node.key.match('/')) {
          if (this.extraConfiguration.documentationName !== node.key) {
            this.extraConfiguration.documentationName = node.key;
          }
        }
        this.updateOtherProperties('documentation');
      }
    }
  }

  onExpand(e, type): void {
    this.loadData(e.node, type, null);
  }

  private loadScripts(): void {
    if (this.scriptList.length === 0) {
      this.coreService.post('inventory/read/folder', {
        objectTypes: ['INCLUDESCRIPT'],
        path: '/',
        recursive: true
      }).subscribe((res) => {
        this.scriptList = res.includeScripts;
      });
    }
  }

  @HostListener('window:beforeunload', ['$event'])
  beforeunload(): void {
    if (this.data.type) {
      this.ngOnDestroy();
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(): void {
    this.centered();
    this.checkGraphHeight();
  }

  checkGraphHeight(): void {
    if (this.editor) {
      const dom = $('.graph-container');
      if (dom && dom.position()) {
        const top = (dom.position().top + $('#rightPanel').position().top);
        const ht = 'calc(100vh - ' + (top + 16) + 'px)';
        dom.css({height: ht, 'scroll-top': '0'});
        $('#graph').slimscroll({height: ht, scrollTo: '0'});
      }
    }
  }

  validateJSON(skip): void {
    if (!this.isUpdate) {
      this.isUpdate = true;
      if (this.workflow.configuration && this.workflow.configuration.instructions && this.workflow.configuration.instructions.length > 0) {
        const data = this.coreService.clone(this.workflow.configuration);
        this.workflow.valid = this.modifyJSON(data, true, false);
        this.saveJSON(this.workflow.valid ? data : skip ? false : 'false');
      }
      setTimeout(() => {
        this.isUpdate = false;
      }, 50);
    }
  }

  deploy(): void {
    if (this.selectedNode) {
      this.initEditorConf(this.editor, false, true);
      setTimeout(() => {
        this.dataService.reloadTree.next({deploy: this.workflow});
      }, 100);
    } else {
      this.dataService.reloadTree.next({deploy: this.workflow});
    }
  }

  backToListView(): void {
    this.dataService.reloadTree.next({back: this.workflow});
  }

  navToObj(name, type): void {
    this.dataService.reloadTree.next({navigate: {name, type}});
  }

  changeDataType(type, variable): void {
    if (type === 'List') {
      delete variable.value.default;
      delete variable.value.final;
      variable.value.listParameters = [];
      this.addVariableToList(variable.value);
    } else {
      variable.value.default = '';
      variable.value.final = '';
      delete variable.value.listParameters;
    }
    this.updateOtherProperties('variable');
  }

  private init(): void {
    this.fullScreen = false;
    this.inventoryConf = this.coreService.getConfigurationTab();
    if (!this.dummyXml) {
      this.propertyPanelWidth = localStorage.propertyPanelWidth ? parseInt(localStorage.propertyPanelWidth, 10) : 460;
      this.loadConfig();
      this.dummyXml = true;
      this.createEditor(() => {
        this.getWorkflowObject();
        this.handleWindowEvents();
      });
    } else {
      const outln = document.getElementById('outlineContainer');
      outln.innerHTML = '';
      outln.style.border = '1px solid lightgray';
      if (this.editor.graph) {
        new mxOutline(this.editor.graph, outln);
      }
      this.getWorkflowObject();
    }
    if (!this.isTrash) {
      if (this.jobResourcesTree.length === 0) {
        this.coreService.post('tree', {
          controllerId: this.schedulerId,
          forInventory: true,
          types: [InventoryObject.JOBRESOURCE]
        }).subscribe((res) => {
          this.jobResourcesTree = this.coreService.prepareTree(res, false);
          this.getJobResources();
        });
      }
      if (this.lockTree.length === 0) {
        this.coreService.post('tree', {
          controllerId: this.schedulerId,
          forInventory: true,
          types: [InventoryObject.LOCK]
        }).subscribe((res) => {
          this.lockTree = this.coreService.prepareTree(res, false);
        });
      }
      if (this.workflowTree.length === 0) {
        this.coreService.post('tree', {
          controllerId: this.schedulerId,
          forInventory: true,
          types: [InventoryObject.WORKFLOW]
        }).subscribe((res) => {
          this.workflowTree = this.coreService.prepareTree(res, true);
        });
      }
      if (this.boardTree.length === 0) {
        this.coreService.post('tree', {
          controllerId: this.schedulerId,
          forInventory: true,
          types: [InventoryObject.NOTICEBOARD]
        }).subscribe((res) => {
          this.boardTree = this.coreService.prepareTree(res, false);
        });
      }
      if (this.scriptTree.length === 0) {
        this.loadScripts();
        this.coreService.post('tree', {
          controllerId: this.schedulerId,
          forInventory: true,
          types: [InventoryObject.INCLUDESCRIPT]
        }).subscribe((res) => {
          this.scriptTree = this.coreService.prepareTree(res, false);
        });
      }
      if (this.documentationTree.length === 0) {
        this.coreService.post('tree', {
          onlyWithAssignReference: true,
          types: ['DOCUMENTATION']
        }).subscribe((res) => {
          this.documentationTree = this.coreService.prepareTree(res, false);
        });
      }
      if (this.agents.length === 0) {
        this.getAgents();
      }
    }
  }

  private getAgents(): void {
    this.coreService.post('agents/names', {controllerId: this.schedulerId}).subscribe((res: any) => {
      this.agents = res.agentNames ? res.agentNames.sort() : [];
    });
  }

  private getJobResources(): void {
    this.coreService.post('inventory/read/folder', {
      path: '/',
      recursive: true,
      objectTypes: [InventoryObject.JOBRESOURCE]
    }).subscribe((res: any) => {
      let map = new Map();
      res.jobResources = sortBy(res.jobResources, 'name');
      res.jobResources.forEach((item) => {
        const path = item.path.substring(0, item.path.lastIndexOf('/')) || '/';
        const obj = {
          title: item.name,
          path: item.path,
          key: item.name,
          type: item.objectType,
          isLeaf: true
        };
        if (map.has(path)) {
          const arr = map.get(path);
          arr.push(obj);
          map.set(path, arr);
        } else {
          map.set(path, [obj]);
        }
      });
      this.jobResourcesTree[0].expanded = true;
      this.updateTreeRecursive(this.jobResourcesTree, map);
      this.jobResourcesTree = [...this.jobResourcesTree];
      if (this.extraConfiguration.jobResourceNames && this.extraConfiguration.jobResourceNames.length > 0) {
        this.extraConfiguration.jobResourceNames = [...this.extraConfiguration.jobResourceNames];
        this.ref.detectChanges();
      }
    });
  }

  private updateTreeRecursive(nodes, map): void {
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].path && map.has(nodes[i].path)) {
        nodes[i].children = map.get(nodes[i].path).concat(nodes[i].children || []);
      }
      if (nodes[i].children) {
        this.updateTreeRecursive(nodes[i].children, map);
      }
    }
  }

  private getWorkflowObject(): void {
    if (!this.inventoryConf.copiedInstuctionObject || !this.inventoryConf.copiedInstuctionObject.TYPE) {
      this.updateToolbar('copy', null);
    } else {
      this.updateToolbar('copy', null, this.inventoryConf.copiedInstuctionObject.TYPE);
    }
    this.error = false;
    this.history = {past: [], present: {}, future: [], type: 'new'};
    this.isLoading = true;
    this.invalidMsg = '';
    const obj: any = {
      id: this.data.id
    };
    if (this.inventoryService.checkDeploymentStatus.isChecked && !this.isTrash) {
      obj.controllerId = this.schedulerId;
    }
    const URL = this.isTrash ? 'inventory/trash/read/configuration' : 'inventory/read/configuration';
    this.coreService.post(URL, obj).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (this.data.id === res.id) {
          if (this.data.deployed !== res.deployed) {
            this.data.deployed = res.deployed;
          }
          if (this.data.valid !== res.valid) {
            this.data.valid = res.valid;
          }
          this.data.syncState = res.syncState;
          this.jobs = [];
          this.variableDeclarations = {parameters: []};
          //this.variableDeclarations.allowUndeclared = false;
          this.orderPreparation = {};
          this.jobResourceNames = [];
          if (res.configuration) {
            delete res.configuration.TYPE;
            delete res.configuration.path;
            delete res.configuration.version;
            delete res.configuration.versionId;
          } else {
            res.configuration = {};
          }

          try {
            this.initObjects(res);
            this.workflow = res;
            this.workflow.actual = JSON.stringify(res.configuration);

            this.workflow.name = this.data.name;
            if (this.workflow.configuration.jobs) {
              if (this.workflow.configuration.jobs && !isEmpty(this.workflow.configuration.jobs)) {
                this.jobs = Object.entries(this.workflow.configuration.jobs).map(([k, v]) => {
                  return {name: k, value: v};
                });
              }
            }

            if (!res.configuration.instructions || res.configuration.instructions.length === 0) {
              this.invalidMsg = 'workflow.message.emptyWorkflow';
            } else if (!res.valid) {
              this.validateByURL(res.configuration);
            }
            this.updateXMLJSON(false);
            this.centered();
            this.checkGraphHeight();
            this.history.present = JSON.stringify(this.extendJsonObj(JSON.parse(this.workflow.actual)));
            if (this.editor) {
              this.updateJobs(this.editor.graph, true);
              this.ref.detectChanges();
            }
            if(this.workflowService.getJobValue()) {
              this.navToJob(this.workflow.configuration, this.workflowService.getJobValue());
              this.workflowService.setJobValue('')
            }
          } catch (e) {
            console.error(e);
          }
        }
      }, error: () => this.isLoading = false
    });
  }

  private initObjects(res): void {
    if (res.configuration.orderPreparation) {
      this.orderPreparation = this.coreService.clone(res.configuration.orderPreparation);
    }
    if (res.configuration.jobResourceNames) {
      this.jobResourceNames = this.coreService.clone(res.configuration.jobResourceNames);
    }
    this.documentationName = res.configuration.documentationName;
    this.title = res.configuration.title;
    this.timeZone = res.configuration.timeZone;
    if (!this.timeZone) {
      this.timeZone = this.preferences.zone;
    }
    delete res.configuration.orderPreparation;
    delete res.configuration.jobResourceNames;
    delete res.configuration.documentationName;
    delete res.configuration.title;
    delete res.configuration.timeZone;

    this.extraConfiguration = {
      title: this.title,
      timeZone: this.timeZone,
      documentationName: this.documentationName,
      jobResourceNames: this.jobResourceNames,
    };

    if (this.extraConfiguration.jobResourceNames && this.extraConfiguration.jobResourceNames.length > 0) {
      this.extraConfiguration.jobResourceNames = [...this.extraConfiguration.jobResourceNames];
      this.ref.detectChanges();
    }
    if (!this.orderPreparation && this.variableDeclarations.parameters && this.variableDeclarations.parameters.length === 0) {
      this.addVariable();
    }
    if (this.orderPreparation && !isEmpty(this.orderPreparation)) {
      // this.variableDeclarations.allowUndeclared = this.orderPreparation.allowUndeclared;
      if (this.orderPreparation.parameters && !isEmpty(this.orderPreparation.parameters)) {
        const temp = this.coreService.clone(this.orderPreparation.parameters);
        this.variableDeclarations.parameters = Object.entries(temp).map(([k, v]) => {
          const val: any = v;
          if (val.type === 'List') {
            delete val.default;
            delete val.final;
            if (val.listParameters) {
              val.listParameters = Object.entries(val.listParameters).map(([k1, v1]) => {
                return {name: k1, value: v1};
              });
            } else {
              this.addVariableToList(val);
            }
          } else if (val.final) {
            delete val.listParameters;
            val.type = 'Final';
            this.coreService.removeSlashToString(val, 'final');
          } else if (val.default) {
            delete val.listParameters;
            if (val.type === 'String') {
              this.coreService.removeSlashToString(val, 'default');
            } else if (val.type === 'Boolean') {
              val.default = (val.default === true || val.default === 'true');
            }
          }
          return {name: k, value: val};
        });
      }
    }
  }

  addVariableToList(variable): void {
    const param = {
      name: '',
      value: {
        type: 'String'
      }
    };
    if (!variable.listParameters) {
      variable.listParameters = [];
    }
    if (!this.coreService.isLastEntryEmpty(variable.listParameters, 'name', '')) {
      variable.listParameters.push(param);
    }
  }

  addArgumentToList(data): void {
    const arr = [];
    data.list.forEach(item => {
      arr.push({name: item.name, type: item.value.type});
    });
    let flag = false;
    for (const i in data.actualList) {
      for (const j in data.actualList[i]) {
        if (!data.actualList[i][j].value) {
          flag = true;
          break;
        }
      }
      if (flag) {
        break;
      }
    }
    if (!flag) {
      data.actualList.push(arr);
    }
  }

  updateArgumentList(): void {
    this.selectedNode.obj.argumentList = [];
    this.selectedNode.obj.forkListArguments = [];
    if (this.selectedNode.obj.workflow.orderPreparation && this.selectedNode.obj.workflow.orderPreparation.parameters && !isEmpty(this.selectedNode.obj.workflow.orderPreparation.parameters)) {
      this.selectedNode.obj.argumentList = Object.entries(this.selectedNode.obj.workflow.orderPreparation.parameters).map(([k, v]) => {
        const val: any = v;
        if (val.type === 'List') {
          const actualList = [];
          if (val.listParameters) {
            if (isArray(val.listParameters)) {
              val.listParameters.forEach((item) => {
                actualList.push({name: item.name, type: item.value.type});
              });
            } else {
              val.listParameters = Object.entries(val.listParameters).map(([k1, v1]) => {
                const val1: any = v1;
                actualList.push({name: k1, type: val1.type});
                return {name: k1, value: val1};
              });
            }
            this.selectedNode.obj.forkListArguments.push({name: k, list: val.listParameters, actualList: [actualList]});
          }
        } else {
          let isExist = false;
          for (let i = 0; i < this.selectedNode.obj.arguments.length; i++) {
            if (this.selectedNode.obj.arguments[i].name === k) {
              this.selectedNode.obj.arguments[i].type = val.type;
              if (!val.default && val.default !== false && val.default !== 0 && !isExist) {
                this.selectedNode.obj.arguments[i].isRequired = true;
              }
              isExist = true;
              break;
            }
          }
          if (!val.default && val.default !== false && val.default !== 0 && !isExist) {
            if (!val.final) {
              this.selectedNode.obj.arguments.push({name: k, type: val.type, isRequired: true});
            }
          }
        }
        return {name: k, value: v};
      });
      this.selectedNode.obj.argumentList = this.selectedNode.obj.argumentList.filter((item) => {
        if (item.value.type === 'List') {
          return false;
        }
        return !item.value.final;
      });
      if (this.selectedNode.obj.arguments && this.selectedNode.obj.arguments.length > 0) {
        this.selectedNode.obj.arguments = this.selectedNode.obj.arguments.filter(item => {
          if (isArray(item.value)) {
            this.setForkListVariables(item, this.selectedNode.obj.forkListArguments);
            return false;
          } else {
            return true;
          }
        });
      }
    }
    this.updateSelectItems();
  }

  private setForkListVariables(sour, target): void {
    for (let x in target) {
      if (target[x].name === sour.name) {
        if (sour.value) {
          if (sour.value.length > 0) {
            for (const i in sour.value) {
              sour.value[i] = Object.entries(sour.value[i]).map(([k1, v1]) => {
                let type;
                for (const prop in target[x].list) {
                  if (target[x].list[prop].name === k1) {
                    type = target[x].list[prop].value.type;
                    break;
                  }
                }
                return {name: k1, value: v1, type};
              });
            }
          } else {
            const tempArr = [];
            for (const prop in target[x].list) {
              tempArr.push({name: target[x].list[prop].name, value: '', type: target[x].list[prop].value.type});
            }
            sour.value.push(tempArr);
          }
        }
        target[x].actualList = sour.value;
        break;
      }
    }
  }

  checkVariableType(argument): void {
    let obj = this.selectedNode.obj.workflow.orderPreparation.parameters[argument.name];
    if (obj) {
      argument.type = obj.type;
      if (!obj.default && obj.default !== false && obj.default !== 0) {
        argument.isRequired = true;
      }
    }
    this.updateSelectItems();
    this.matchWithExistingArguments();
  }

  updateSelectItems(): void {
    for (let i = 0; i < this.selectedNode.obj.argumentList.length; i++) {
      this.selectedNode.obj.argumentList[i].isSelected = false;
      for (let j = 0; j < this.selectedNode.obj.arguments.length; j++) {
        if (this.selectedNode.obj.argumentList[i].name === this.selectedNode.obj.arguments[j].name) {
          this.selectedNode.obj.argumentList[i].isSelected = true;
          break;
        }
      }
    }

    this.ref.detectChanges();
  }

  removeArgument(data): void {
    for (let i = 0; i < this.selectedNode.obj.argumentList.length; i++) {
      if (this.selectedNode.obj.argumentList[i].name === data.name) {
        this.selectedNode.obj.argumentList[i].isSelected = false;
        break;
      }
    }
    for (let j = 0; j < this.selectedNode.obj.arguments.length; j++) {
      if (this.selectedNode.obj.arguments[j].name === data.name) {
        this.selectedNode.obj.arguments.splice(j, 1);
        break;
      }
    }
  }

  addAllArguments(): void {
    for (let i = 0; i < this.selectedNode.obj.argumentList.length; i++) {
      if (this.selectedNode.obj.argumentList[i].value && this.selectedNode.obj.argumentList[i].value.type !== 'List') {
        let flag = false;
        for (const j in this.selectedNode.obj.arguments) {
          if (this.selectedNode.obj.arguments[j].name === this.selectedNode.obj.argumentList[i].name) {
            flag = true;
            break;
          }
        }
        if (!flag) {
          this.selectedNode.obj.argumentList[i].isSelected = true;
          const obj = {
            name: this.selectedNode.obj.argumentList[i].name,
            type: this.selectedNode.obj.argumentList[i].value.type,
            value: '',
            isRequired: false
          };
          if (this.selectedNode.obj.argumentList[i].value.default) {
            this.coreService.removeSlashToString(this.selectedNode.obj.argumentList[i].value, 'default');
            if (this.selectedNode.obj.argumentList[i].value.type === 'Boolean') {
              this.selectedNode.obj.argumentList[i].value.default = (this.selectedNode.obj.argumentList[i].value.default === true || this.selectedNode.obj.argumentList[i].value.default === 'true');
            }
            obj.value = this.selectedNode.obj.argumentList[i].value.default;
          }
          if (!this.selectedNode.obj.argumentList[i].value.default && this.selectedNode.obj.argumentList[i].value.default !== false && this.selectedNode.obj.argumentList[i].value.default !== 0) {
            obj.isRequired = true;
          }
          this.selectedNode.obj.arguments.push(obj);
        }
      }
    }
    this.matchWithExistingArguments();
  }

  private matchWithExistingArguments(): void {
    if (this.orderPreparation && this.orderPreparation.parameters && !isEmpty(this.orderPreparation.parameters)) {
      const arr = Object.entries(this.orderPreparation.parameters).map(([k, v]) => {
        const val: any = v;
        return {name: k, value: val};
      });

      for (let i = 0; i < arr.length; i++) {
        if (arr[i].value && arr[i].value.type !== 'List') {
          for (const j in this.selectedNode.obj.arguments) {
            if (this.selectedNode.obj.arguments[j].name === arr[i].name) {
              if (!this.selectedNode.obj.arguments[j].value) {
                this.selectedNode.obj.arguments[j].value = '$' + this.selectedNode.obj.arguments[j].name;
              }
              break;
            }
          }
        }
      }
    }
  }

  addVariable(): void {
    const param = {
      name: '',
      value: {
        type: 'String'
      }
    };
    if (this.variableDeclarations.parameters) {
      if (!this.coreService.isLastEntryEmpty(this.variableDeclarations.parameters, 'name', '')) {
        this.variableDeclarations.parameters.push(param);
      }
    }
  }

  checkDuplicateEntries(variable, index, list): void {
    if (variable.name) {
      for (let i = 0; i < list.length; i++) {
        if (list[i].name === variable.name && i !== index) {
          variable.name = '';
          this.toasterService.warning(list[i].name + ' is already exist');
          break;
        }
      }
    }
    if (variable.name) {
      this.updateOtherProperties('variable');
    }
  }

  drop(event: CdkDragDrop<string[]>): void {
    moveItemInArray(this.variableDeclarations.parameters, event.previousIndex, event.currentIndex);
    if (event.previousIndex !== event.currentIndex) {
      this.updateOtherProperties('variable');
    }
  }

  dropDelay(event: CdkDragDrop<string[]>, list): void {
    moveItemInArray(list, event.previousIndex, event.currentIndex);
  }

  checkDelayEntries(): void {
    if (this.selectedNode.obj.maxTries < this.selectedNode.obj.retryDelays.length) {
      this.selectedNode.obj.retryDelays.splice(this.selectedNode.obj.maxTries, this.selectedNode.obj.retryDelays.length - this.selectedNode.obj.maxTries);
    }
  }

  addAllDelay(): void {
    if (this.selectedNode.obj.maxTries > this.selectedNode.obj.retryDelays.length) {
      const len = (this.selectedNode.obj.maxTries - this.selectedNode.obj.retryDelays.length);
      for (let i = 0; i <= len; i++) {
        this.selectedNode.obj.retryDelays.push({value: '1m'});
      }
    }
  }

  addDelay(list): void {
    const param = {
      value: '1m',
    };
    if (list) {
      if (!this.coreService.isLastEntryEmpty(list, 'value', '')) {
        list.push(param);
      }
    }
  }

  removeDelay(index, list): void {
    list.splice(index, 1);
  }

  removeVariable(index): void {
    this.variableDeclarations.parameters.splice(index, 1);
    this.updateOtherProperties('variable');
  }

  removeVariableFromList(list, index, flag = true): void {
    list.splice(index, 1);
    if (flag) {
      this.updateOtherProperties('variable');
    }
  }

  onKeyPress($event, isOrder = false): void {
    if ($event.which === '13' || $event.which === 13) {
      $event.preventDefault();
      if (!isOrder) {
        this.addVariable();
      }
    }
  }

  addResult(branch): void {
    const param = {
      name: '',
      value: ''
    };
    if (!branch.result) {
      branch.result = [];
    }
    if (!this.coreService.isLastEntryEmpty(branch.result, 'name', '')) {
      branch.result.push(param);
    }
  }

  removeResult(i, branch): void {
    branch.result.splice(i, 1);
  }

  isStringValid(data, form): void {
    delete data.invalid;
    if (form.invalid) {
      data.name = '';
      data.value = '';
    } else {
      let count = 0;
      this.selectedNode.obj.branches.forEach((item) => {
        for (let i in item.result) {
          if (item.result[i].name === data.name) {
            ++count;
          }
          if (count > 1) {
            data.invalid = true;
            form.control.setErrors({incorrect: true});
            break;
          }
        }
      });
    }
  }

  openEditor(data: any, type = 'default'): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: ValueEditorComponent,
      nzClassName: 'lg',
      nzComponentParams: {
        data: data[type]
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        if (data[type] !== result) {
          data[type] = result;
          this.ref.detectChanges();
          this.updateOtherProperties('variable');
        }
      }
    });
  }

  rename(inValid): void {
    if (this.data.id === this.workflow.id && this.data.name !== this.workflow.name) {
      if (!inValid) {
        const data = this.coreService.clone(this.data);
        const name = this.workflow.name;
        this.coreService.post('inventory/rename', {
          id: data.id,
          newPath: name
        }).subscribe({
          next: () => {
            if (data.id === this.data.id) {
              this.data.name = name;
            }
            data.name = name;
            this.dataService.reloadTree.next({rename: data});
          }, error: () => {
            this.workflow.name = this.data.name;
            this.ref.detectChanges();
          }
        });
      } else {
        this.workflow.name = this.data.name;
        this.ref.detectChanges();
      }
    }
  }

  private center(): void {
    const dom = document.getElementById('graph');
    let x = 0.5;
    let y = 0.2;
    if (dom && this.editor) {
      if (dom.clientWidth !== dom.scrollWidth) {
        x = 0;
      }
      if (dom.clientHeight !== dom.scrollHeight) {
        y = 0;
      }
      this.editor.graph.center(true, true, x, y);
    }
  }

  private reloadWorkflow(obj): void {
    this.closeMenu();
    const data = this.coreService.clone(this.workflow.configuration);
    this.modifyJSON(data, false, false);
    this.workflow.configuration = obj;
    let flag = false;
    if (this.workflow.configuration.jobs) {
      if (this.workflow.configuration.jobs && !isEmpty(this.workflow.configuration.jobs)) {
        const jobs = Object.entries(this.workflow.configuration.jobs).map(([k, v]) => {
          return {name: k, value: v};
        });
        if (!isEqual(JSON.stringify(this.jobs), JSON.stringify(jobs))) {
          this.jobs = jobs;
          flag = true;
        }
      }
    }
    if (!isEqual(JSON.stringify(obj.instructions), JSON.stringify(data.instructions))) {
      this.updateXMLJSON(false);
    }
    if (this.selectedNode && this.selectedNode.job && flag) {
      let isCheck = true;
      for (const i in this.jobs) {
        if (this.jobs[i].name === this.selectedNode.job.jobName) {
          isCheck = false;
          this.dataService.reloadWorkflowError.next({change: {jobs: this.jobs, current: this.jobs[i]}});
          break;
        }
      }
      if (isCheck) {
        this.selectedNode = null;
      }
    }
  }

  private getLimit(): void {
    this.error = false;
    if (this.selectedNode.obj.lockName) {
      this.coreService.post('inventory/read/configuration', {
        path: this.selectedNode.obj.lockName,
        objectType: InventoryObject.LOCK
      }).subscribe((conf: any) => {
        if (this.selectedNode && this.selectedNode.obj) {
          this.selectedNode.obj.limit = conf.configuration.limit || 1;
        }
      });
    }
  }

  private getWorkflow(flag = false): void {
    if (this.selectedNode.obj.workflowName) {
      this.coreService.post('inventory/read/configuration', {
        path: this.selectedNode.obj.workflowName,
        objectType: InventoryObject.WORKFLOW
      }).subscribe((conf: any) => {
        if (this.selectedNode && this.selectedNode.type === 'AddOrder') {
          this.selectedNode.obj.workflow = {orderPreparation: conf.configuration.orderPreparation};
          if (flag) {
            this.selectedNode.obj.arguments = [];
          }
          this.updateArgumentList();
        }
      });
    }
  }

  createForkListVariables(): void {
    this.forkListVariableObj = {
      create: true,
      name: '',
      value: {
        type: 'List',
        listParameters: [
          {
            name: '',
            value: {
              type: 'String'
            }
          }
        ]
      }
    };
  }

  deleteForkListVariables(data): void {
    this.forkListVariables = this.forkListVariables.filter((item) => {
      return item.name !== data.name;
    });
    if (this.selectedNode.obj.children === data.name) {
      this.selectedNode.obj.children = '';
    }
    this.updateOtherProperties('variable');
  }

  editForkListVariables(data): void {
    this.forkListVariableObj = this.coreService.clone(data);
    this.forkListVariableObj.oldName = this.coreService.clone(data.name);
  }

  onSubmit(): void {
    let flag = true;
    for (const i in this.forkListVariables) {
      if (this.forkListVariableObj.create) {
        if (this.forkListVariables[i].name === this.forkListVariableObj.name) {
          this.forkListVariableObj.name = '';
          flag = false;
          break;
        }
      } else {
        if (this.forkListVariableObj.oldName === this.forkListVariables[i].name) {
          delete this.forkListVariableObj.oldName;
          this.forkListVariables[i] = this.coreService.clone(this.forkListVariableObj);
          for (const j in this.variableDeclarations.parameters) {
            if (this.forkListVariables[i].name === this.variableDeclarations.parameters[j].name) {
              this.variableDeclarations.parameters[j] = this.coreService.clone(this.forkListVariableObj);
              break;
            }
          }
          this.forkListVariableObj = {};
          this.updateOtherProperties('variable');
          break;
        }
      }
    }
    if (flag && this.forkListVariableObj.create) {
      delete this.forkListVariableObj.create;
      this.forkListVariables.push(this.coreService.clone(this.forkListVariableObj));
      this.variableDeclarations.parameters.push(this.coreService.clone(this.forkListVariableObj));
      this.selectedNode.obj.children = this.forkListVariableObj.name;
      this.selectedNode.obj.childToId = '';
      this.forkListVariableObj = {};
      this.updateOtherProperties('variable');
    }

  }

  cancel(): void {
    this.forkListVariableObj = {};
  }

  selectListForForkList(value): void {
    this.listOfParams = [];
    for (const i in this.forkListVariables) {
      if (this.forkListVariables[i].name === value) {
        if (this.forkListVariables[i].value && this.forkListVariables[i].value.listParameters) {
          this.listOfParams = this.forkListVariables[i].value.listParameters;
        }
        break;
      }
    }
  }

  private getListOfVariables(obj): void {
    this.forkListVariables = [];
    if (this.variableDeclarations.parameters && this.variableDeclarations.parameters.length > 0) {
      this.variableDeclarations.parameters.forEach((param) => {
        if (param.value && param.value.type === 'List') {
          this.forkListVariables.push(param);
        }
      });
    }
    if (obj.children) {
      this.selectListForForkList(obj.children);
    }
  }

  private changeCellStyle(graph, cell, isBlur): void {
    const state = graph.view.getState(cell);
    if (state && state.shape) {
      state.style[mxConstants.STYLE_OPACITY] = isBlur ? 60 : 100;
      state.shape.apply(state);
      state.shape.redraw();
    }
  }

  private updateXMLJSON(noConversion): void {
    this.closeMenu();
    if (!this.editor) {
      return;
    }
    const graph = this.editor.graph;
    if (!isEmpty(this.workflow.configuration)) {
      if (noConversion) {
        this.workflowService.checkEmptyObjects(this.workflow.configuration, () => {
          this.updateWorkflow(graph);
        });
      } else {
        this.workflowService.convertTryToRetry(this.workflow.configuration, () => {
          this.updateWorkflow(graph);
        });
      }
    } else {
      this.reloadDummyXml(graph);
    }
  }

  private updateWorkflow(graph): void {
    const scrollValue: any = {};
    const element = document.getElementById('graph');
    scrollValue.scrollTop = element.scrollTop;
    scrollValue.scrollLeft = element.scrollLeft;
    scrollValue.scale = graph.getView().getScale();
    graph.getModel().beginUpdate();
    try {
      graph.removeCells(graph.getChildCells(graph.getDefaultParent()), true);
      const mapObj = {nodeMap: this.nodeMap};
      this.workflowService.createWorkflow(this.workflow.configuration, this.editor, mapObj);
      this.nodeMap = mapObj.nodeMap;
    } finally {
      // Updates the display
      graph.getModel().endUpdate();
      WorkflowService.executeLayout(graph);
      this.skipXMLToJSONConversion = true;
    }
    const _element = document.getElementById('graph');
    _element.scrollTop = scrollValue.scrollTop + 20;
    _element.scrollLeft = scrollValue.scrollLeft;
    if (scrollValue.scale) {
      graph.getView().setScale(scrollValue.scale);
    }
  }

  /**
   * Reload dummy xml
   */
  private reloadDummyXml(graph: any): void {
    this.jobs = [];
    graph.getModel().beginUpdate();
    try {
      // Removes all cells
      graph.removeCells(graph.getChildCells(graph.getDefaultParent()), true);
      const doc = mxUtils.createXmlDocument();
      const defaultParent = graph.getDefaultParent();
      const startNode = doc.createElement('Process');
      startNode.setAttribute('title', 'start');
      const v1 = graph.insertVertex(defaultParent, null, startNode, 0, 0, 70, 70, 'ellipse;whiteSpace=wrap;html=1;aspect=fixed;dashed=1;shadow=0;opacity=70;');
      const mainNode = doc.createElement('Process');
      mainNode.setAttribute('title', 'dragAndDrop');
      const v2 = graph.insertVertex(defaultParent, null, mainNode, 0, 0, 200, 50, 'rectangle;whiteSpace=wrap;html=1;dashed=1;shadow=0;opacity=70;');
      const endNode = doc.createElement('Process');
      endNode.setAttribute('title', 'end');
      const v3 = graph.insertVertex(defaultParent, null, endNode, 0, 0, 70, 70, 'ellipse;whiteSpace=wrap;html=1;aspect=fixed;dashed=1;shadow=0;opacity=70;');
      graph.insertEdge(defaultParent, null, doc.createElement('Connector'), v1, v2, 'edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;exitX=0.5;exitY=1;entryX=0.5;entryY=0;jettySize=auto;orthogonalLoop=1;dashed=1;shadow=0;opacity=50;');
      graph.insertEdge(defaultParent, null, doc.createElement('Connector'), v2, v3, 'edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;exitX=0.5;exitY=1;entryX=0.5;entryY=0;jettySize=auto;orthogonalLoop=1;dashed=1;shadow=0;opacity=50;');

    } finally {
      // Updates the display
      graph.getModel().endUpdate();
      WorkflowService.executeLayout(graph);
    }
  }

  private handleWindowEvents(): void {
    const self = this;
    /**
     * Changes the zoom on mouseWheel events
     */
    const dom = $('#graph');
    dom.bind('mousewheel DOMMouseScroll', (event) => {
      if (this.editor) {
        if (event.ctrlKey) {
          event.preventDefault();
          if (event.originalEvent.wheelDelta > 0 || event.originalEvent.detail < 0) {
            this.editor.execute('zoomIn');
          } else {
            this.editor.execute('zoomOut');
          }
        } else {
          const bounds = this.editor.graph.getGraphBounds();
          if (bounds.y < -0.05 && bounds.height > dom.height()) {
            this.center();
          }
        }
      }
    });

    const el = $.fn['show'];
    $.fn['show'] = function() {
      this.trigger('show');
      return el.apply(this, arguments);
    };

    $('#property-panel').on('resizestop', () => {
      self.checkGraphHeight();
    });

    const panel = $('.property-panel');
    $('.sidebar-open', panel).click(() => {
      self.propertyPanelWidth = localStorage.propertyPanelWidth ? parseInt(localStorage.propertyPanelWidth, 10) : 460;
      $('#outlineContainer').css({right: self.propertyPanelWidth + 10 + 'px'});
      $('.graph-container').css({'margin-right': self.propertyPanelWidth + 'px'});
      $('.toolbar').css({'margin-right': (self.propertyPanelWidth - 12) + 'px'});
      $('.sidebar-close').css({right: self.propertyPanelWidth + 'px'});
      $('#property-panel').css({width: self.propertyPanelWidth + 'px'}).show();
      $('.sidebar-open').css({right: '-20px'});
      self.centered();
    });

    $('.sidebar-close', panel).click(() => {
      self.propertyPanelWidth = 0;
      $('#outlineContainer').css({right: '10px'});
      $('.graph-container').css({'margin-right': '0'});
      $('.toolbar').css({'margin-right': '-12px'});
      $('.sidebar-open').css({right: '0'});
      $('#property-panel').hide();
      $('.sidebar-close').css({right: '-20px'});
      self.centered();
    });

    if (window.innerWidth > 1024) {
      setTimeout(() => {
        $('.sidebar-open').click();
      }, 100);
    }
    setTimeout(() => {
      self.checkGraphHeight();
    }, 10);
  }

  private centered(): void {
    if (this.editor && this.editor.graph) {
      setTimeout(() => {
        this.actual();
      }, 200);
    }
  }

  private loadConfig(): void {
    if (!(this.preferences.theme === 'light' || this.preferences.theme === 'lighter' || !this.preferences.theme)) {
      this.configXml = './assets/mxgraph/config/diagrameditor-dark.xml';
    }
  }

   private traversCells(node, graph): void {
     let startNode;
     const nodes = [];
     const connections = [];
     const self = this;
     const jsonObject = {
       instructions: []
     };

     function findFirstNode(data): void {
       for (const prop in node.cells) {
         if (node.cells[prop].value && node.cells[prop].value.tagName && !node.cells[prop].value.tagName.match(/Connector/)
           && !node.cells[prop].value.tagName.match(/Connection/) && !node.cells[prop].value.tagName.match(/Process/)) {
           const incomingEdge = graph.getIncomingEdges(node.cells[prop]);
           let flag = false;
           if (incomingEdge && incomingEdge.length > 0) {
             if (incomingEdge[0].source && incomingEdge[0].source.value && incomingEdge[0].source.value.tagName === 'Process') {
               startNode = node.cells[prop];
               flag = true;
             }
           }
           if (!flag) {
             nodes.push(node.cells[prop]);
           }
         } else if (node.cells[prop].value && node.cells[prop].value.tagName === 'Connection') {
           if (node.cells[prop].source && node.cells[prop].source.value.tagName !== 'Process') {
             connections.push(node.cells[prop]);
           }
         }
       }
       if (startNode) {
         data.instructions.push(creatJSONObject(startNode, nodes));
         findNext(nodes, startNode, data);
       }
     }

     function getOutgoingEdges(cell): any {
       const outgoingEdges = [];
       for (let i = 0; i < connections.length; i++) {
         if (connections[i].source) {
           if (connections[i].source.id == cell.id) {
             outgoingEdges.push(connections[i]);
           }
         }
       }
       return outgoingEdges;
     }

     function getIncomingEdges(cell): any {
       const incomingEdges = [];
       for (let i = 0; i < connections.length; i++) {
         if (connections[i].target) {
           if (connections[i].target.id == cell.id) {
             incomingEdges.push(connections[i]);
           }
         }
       }
       return incomingEdges;
     }

     function findNext(list, firstNode, data): void {
       const outgoingEdges = getOutgoingEdges(firstNode);
       let isFound = false;
       let isCatch = false;
       for (const i in outgoingEdges) {
         if (outgoingEdges[i].target) {
           for (const j in list) {
             if (outgoingEdges[i].target.id == list[j].id) {
               startNode = list[j];
               list.splice(j, 1);
               if (!self.workflowService.checkClosingCell(startNode.value.tagName)) {
                 isFound = true;
                 if (startNode.value.tagName === 'Catch' && data.TYPE === 'Try') {
                   data.catch = {
                     id: startNode.id,
                     instructions: []
                   };
                 } else {
                   const obj = creatJSONObject(startNode, list);
                   let flag = true;
                   if (data.catch) {
                     if (!isCatch) {
                       let edges = startNode.edges;
                       for (const x in edges) {
                         if (edges[x].getAttribute('label') === 'catch') {
                           isCatch = true;
                           flag = false;
                         }
                       }
                       if (!isCatch) {
                         let id = startNode.id;
                         if (self.workflowService.checkClosingCell(startNode.value.tagName)) {
                           const targetCell = graph.getModel().getCell(startNode.getAttribute('targetId'));
                           if (targetCell) {
                             edges = targetCell.edges;
                             id = targetCell.id;
                           }
                         }
                         for (const x in edges) {
                           if (edges[x].target.id == id) {
                             let sourceId = edges[x].source.id;
                             if (self.workflowService.checkClosingCell(edges[x].source.value.tagName)) {
                               const targetCell = graph.getModel().getCell(edges[x].source.getAttribute('targetId'));
                               sourceId = targetCell.id;
                             }
                             for (const y in data.catch.instructions) {
                               if (data.catch.instructions[y].id == sourceId) {
                                 isCatch = true;
                                 flag = false;
                                 break;
                               }
                             }
                             break;
                           }
                         }
                       }
                     } else {
                       const edges = getIncomingEdges(startNode);
                       let isFound2 = false;
                       for (const x in edges) {
                         if (edges[x].source && edges[x].source.id == data.id) {
                           isCatch = false;
                           isFound2 = true;
                         }
                       }
                       if (!isFound2) {
                         const outgoingEdges2 = getOutgoingEdges(startNode);
                         for (const x in outgoingEdges2) {
                           if (edges[x].target && edges[x].target.id == data.id) {
                             isCatch = false;
                           }
                         }
                       }
                     }
                   }

                   if (isCatch) {
                     if (data.catch) {
                       data.catch.instructions.push(obj);
                     }
                   } else {
                     if (flag) {
                       data.instructions.push(obj);
                     }
                   }
                 }
               }
               break;
             }
           }
         }
       }

       if (list.length > 0 && isFound) {
         if (startNode && startNode.value && !self.workflowService.isInstructionCollapsible(startNode.value.tagName)) {
           findNext(list, startNode, data);
         }
       }
     }

     function traversForkList(list, obj, edge, branchObj, parentId, endNode): void {
       let callAgain = false;
       for (const i in list) {
         if (list[i].value && ((list[i].getParent().id == parentId) || (self.workflowService.checkClosingCell(list[i].value.tagName) && parentId == list[i].getAttribute('targetId')))) {
           if((self.workflowService.checkClosingCell(list[i].value.tagName) && parentId == list[i].getAttribute('targetId'))){
             endNode.endNode = list[i];
           }
           const edges = getIncomingEdges(list[i]);
           let flag = false;
           for (const j in edges) {
             if (obj.lastId && edges[j].source && obj.lastId == edges[j].source.id) {
               obj.lastId = edges[j].target.id;
               flag = true;
               break;
             }
             if (!flag && edges[j].id == edge.id && edges[j].target) {
               obj.lastId = edges[j].target.id;
               flag = true;
               break;
             }
             if (!flag && obj.lastId && edges[j].source && self.workflowService.checkClosingCell(edges[j].source.value.tagName)) {
               if (obj.lastId == edges[j].source.getAttribute('targetId')) {
                 flag = true;
                 break;
               }
             }
           }
           if (flag) {
             const cell = list[i];
             list.splice(i, 1);
             if (!self.workflowService.checkClosingCell(cell.value.tagName)) {
               branchObj.instructions.push(creatJSONObject(cell, list));
               callAgain = true;
               break;
             }
           }
         }
       }
       if (callAgain) {
         traversForkList(list, obj, edge, branchObj, parentId, endNode);
       }
     }

     function traversForkInstruction(edge: any, obj: any, list: any, parent, main): void {
       if (!obj.branches) {
         obj.branches = [];
       }
       const result = edge.getAttribute('result');
       const branchObj = {
         id: edge.getAttribute('label'),
         result: result ? JSON.parse(result) : result,
         instructions: []
       };
       traversForkList(list, {lastId: ''}, edge, branchObj, parent.id, main);
       obj.branches.push(branchObj);
     }

     function traversIfList(list, obj, edge, data, parentId, endNode): void {
       let callAgain = false;
       for (const i in list) {
         if (list[i].value && ((list[i].getParent().id == parentId) || (self.workflowService.checkClosingCell(list[i].value.tagName) && parentId == list[i].getAttribute('targetId')))) {
           if (self.workflowService.checkClosingCell(list[i].value.tagName) && parentId == list[i].getAttribute('targetId')){
             endNode.endNode = list[i];
           }
           const edges = getIncomingEdges(list[i]);
           let flag = false;
           for (const j in edges) {
             if (obj.lastId && edges[j].source && edges[j].target && obj.lastId == edges[j].source.id) {
               obj.lastId = edges[j].target.id;
               flag = true;
               break;

             }
             if (!flag && edges[j].id == edge.id && edges[j].target) {
               obj.lastId = edges[j].target.id;
               flag = true;
               break;
             }
           }
           if (flag) {
             const cell = list[i];
             list.splice(i, 1);
             if (!self.workflowService.checkClosingCell(cell.value.tagName)) {
               callAgain = true;
               if (edge.getAttribute('label') === 'then') {
                 data.then.instructions.push(creatJSONObject(cell, list));
               } else if (edge.getAttribute('label') === 'else') {
                 data.else.instructions.push(creatJSONObject(cell, list));
               }
             }
             break;
           }
         }
       }
       if (callAgain) {
         traversIfList(list, obj, edge, data, parentId, endNode);
       }
     }

     function traversIfInstruction(edge: any, obj: any, list: any, parent, main): void {
       if (edge.getAttribute('label') === 'then') {
         if (!obj.then) {
           obj.then = {
             instructions: []
           };
         }
       } else if (edge.getAttribute('label') === 'else') {
         if (!obj.else) {
           obj.else = {
             instructions: []
           };
         }
       }

       traversIfList(list, {lastId: ''}, edge, obj, parent.id, main);
     }

     function createObject(cell: any): any {
       const obj: any = {
         id: cell.id,
         TYPE: cell.value.tagName
       };
       const attr = cell.value.attributes;
       for (const j in attr) {

         if (attr[j].name && attr[j].value && (attr[j].name !== 'label' || (attr[j].name === 'label' && obj.TYPE === 'Job'))) {
           let val = attr[j].value;
           if ((attr[j].name === 'arguments' || attr[j].name === 'defaultArguments' || attr[j].name === 'outcome')) {
             val = val ? JSON.parse(val) : attr[j].name === 'outcome' ? {returnCode: 0} : {};
           } else if (attr[j].name === 'remainWhenTerminated' || attr[j].name === 'joinIfFailed' || attr[j].name === 'uncatchable') {
             val = val == 'true';
           }
           obj[attr[j].name] = val;
         }
       }
       if (obj.TYPE === 'Job' && !obj.defaultArguments) {
         obj.defaultArguments = {};
       }
       return obj;
     }

     function creatJSONObject(cell: any, list: any[]): any {
       const obj = createObject(cell);
       if (self.workflowService.isInstructionCollapsible(cell.value.tagName)) {
         if (cell.collapsed) {
           obj.isCollapsed = cell.collapsed;
         }

         if (cell.value.tagName === 'If' || cell.value.tagName === 'Fork') {
           const edges = getOutgoingEdges(cell);
           const main = {endNode: ''};
           for (const j in edges) {
             if (cell.value.tagName === 'Fork') {
               traversForkInstruction(edges[j], obj, list, cell, main);
             } else {
               traversIfInstruction(edges[j], obj, list, cell, main);
             }
           }
           if(main && main.endNode){
             startNode = main.endNode;
           }
         } else {
           obj.instructions = [];
           findNext(list, cell, obj);
         }

       }
       return obj;
     }

     findFirstNode(jsonObject);

     if (jsonObject.instructions.length > 0) {
       this.workflow.configuration = this.coreService.clone(jsonObject);
     } else {
       this.workflow.configuration = {};
     }
   }

  /**
   * Function: To convert Mxgraph xml to JSON (Web service response)
   */
  private xmlToJsonParser(): void {
    if (this.editor && this.editor.graph) {
      const graph = this.editor.graph;
      const model = graph.getModel();
      if (model.root) {
        this.traversCells(model, graph);
      }
    }
    this.implicitSave = false;
  }

  private initEditorConf(editor, isXML, callFun): void {
    if (!editor) {
      return;
    }
    const self = this;
    const graph = editor.graph;
    let result: string;
    let dropTarget;
    let movedTarget;
    let selectedCellsObj;
    let isVertexDrop = false;
    let dragStart = false;
    let _iterateId = 0;
    const doc = mxUtils.createXmlDocument();
    if (!callFun) {
      $('#toolbar').find('img').each(function(index) {
        if (index === 15) {
          $(this).addClass('disable-link');
        }
      });
      if (!isXML) {
        /**
         * Variable: autoSaveThreshold
         *
         * Minimum amount of ignored changes before an autosave.
         */
        mxAutoSaveManager.prototype.autoSaveThreshold = 1;
        mxAutoSaveManager.prototype.autoSaveDelay = 5;
        mxGraph.prototype.cellsResizable = false;
        mxGraph.prototype.multigraph = false;
        mxGraph.prototype.allowDanglingEdges = false;
        mxGraph.prototype.cellsLocked = true;
        mxGraph.prototype.foldingEnabled = true;
        mxGraph.prototype.cellsCloneable = false;
        mxConstants.DROP_TARGET_COLOR = 'green';
        mxConstants.CURSOR_MOVABLE_VERTEX = 'move';
        mxConstants.VERTEX_SELECTION_DASHED = false;
        mxConstants.VERTEX_SELECTION_COLOR = '#0099ff';
        mxConstants.VERTEX_SELECTION_STROKEWIDTH = 2;
        mxUndoManager.prototype.size = 1;

        /**
         * Function: mouseMove
         *
         * Handles the event by highlighting possible drop targets and updating the
         * preview.
         */
        mxGraphHandler.prototype.mouseMove = function(sender, me) {
          if (!me.isConsumed() && graph.isMouseDown && this.cell != null &&
            this.first != null && this.bounds != null && !this.suspended) {
            // Stops moving if a multi touch event is received
            if (mxEvent.isMultiTouchEvent(me.getEvent())) {
              this.reset();
              return;
            }
            let delta = this.getDelta(me);
            let tol = graph.tolerance;
            if (this.shape != null || this.livePreviewActive || Math.abs(delta.x) > tol || Math.abs(delta.y) > tol) {
              // Highlight is used for highlighting drop targets
              if (this.highlight == null) {
                this.highlight = new mxCellHighlight(this.graph,
                  mxConstants.DROP_TARGET_COLOR, 3);
              }

              let clone = graph.isCloneEvent(me.getEvent()) && graph.isCellsCloneable() && this.isCloneEnabled();
              let gridEnabled = graph.isGridEnabledEvent(me.getEvent());
              let cell = me.getCell();
              let hideGuide = true;
              let target = null;
              this.cloning = clone;

              if (graph.isDropEnabled() && this.highlightEnabled) {
                // Contains a call to getCellAt to find the cell under the mouse
                target = graph.getDropTarget(this.cells, me.getEvent(), cell, clone);
              }

              let state = graph.getView().getState(target);
              let highlight = false;
              if (state != null && (clone || this.isValidDropTarget(target, me))) {
                if (this.target != target) {
                  this.target = target;
                  this.setHighlightColor(mxConstants.DROP_TARGET_COLOR);
                }
                highlight = true;
              } else {
                this.target = null;
              }
              if (self.droppedCell && self.droppedCell.target) {
                if (!target && !cell) {
                  self.droppedCell = null;
                } else if (!self.droppedCell.type) {
                  if (target && cell && target.id !== cell.id) {
                    self.droppedCell.target = cell.id;
                  }
                }
                if (this.cells.length > 0 && cell && this.cells[0].id != cell.id) {
                  if (target && target.id != cell.id) {
                    state = graph.getView().getState(cell);
                  }
                }
              }

              if (state != null && highlight) {
                if (state.cell.value.tagName === 'Connection' || self.workflowService.isInstructionCollapsible(state.cell.value.tagName) || state.cell.value.tagName === 'Catch') {
                  if (state.cell.value.tagName !== 'Connection') {
                    if (state.cell.value.tagName !== 'Fork') {
                      const edges = graph.getOutgoingEdges(state.cell);
                      if ((state.cell.value.tagName !== 'If' && edges.length === 1 && !self.workflowService.checkClosingCell(edges[0].target.value.tagName))
                        || (state.cell.value.tagName === 'If' && edges.length === 2)) {
                        this.setHighlightColor('#ff0000');
                      }
                    }
                  }
                } else {
                  this.setHighlightColor('#ff0000');
                }
                this.highlight.highlight(state);
              } else {
                this.highlight.hide();
              }

              if (this.guide != null && this.useGuidesForEvent(me)) {
                delta = this.guide.move(this.bounds, delta, gridEnabled, clone);
                hideGuide = false;
              } else {
                delta = this.graph.snapDelta(delta, this.bounds, !gridEnabled, false, false);
              }

              if (this.guide != null && hideGuide) {
                this.guide.hide();
              }

              // Constrained movement if shift key is pressed
              if (graph.isConstrainedEvent(me.getEvent())) {
                if (Math.abs(delta.x) > Math.abs(delta.y)) {
                  delta.y = 0;
                } else {
                  delta.x = 0;
                }
              }
              this.checkPreview();
              if (this.currentDx != delta.x || this.currentDy != delta.y) {
                this.currentDx = delta.x;
                this.currentDy = delta.y;
                this.updatePreview();
              }
            }
            this.updateHint(me);
            this.consumeMouseEvent(mxEvent.MOUSE_MOVE, me);
            // Cancels the bubbling of events to the container so
            // that the droptarget is not reset due to an mouseMove
            // fired on the container with no associated state.
            mxEvent.consume(me.getEvent());
          } else if ((this.isMoveEnabled() || this.isCloneEnabled()) && this.updateCursor && !me.isConsumed() &&
            (me.getState() != null || me.sourceState != null) && !graph.isMouseDown) {
            let cursor = graph.getCursorForMouseEvent(me);
            if (cursor == null && graph.isEnabled() && graph.isCellMovable(me.getCell())) {
              if (graph.getModel().isEdge(me.getCell())) {
                cursor = mxConstants.CURSOR_MOVABLE_EDGE;
              } else {
                cursor = mxConstants.CURSOR_MOVABLE_VERTEX;
              }
            }
            // Sets the cursor on the original source state under the mouse
            // instead of the event source state which can be the parent
            if (cursor != null && me.sourceState != null) {
              me.sourceState.setCursor(cursor);
            }
          }
        };

        /**
         * Function: createPreviewShape
         *
         * Creates the shape used to draw the preview for the given bounds.
         */
        mxGraphHandler.prototype.createPreviewShape = function(bounds) {
          let shape;
          const selectionCell = graph.getSelectionCell();
          if (selectionCell && selectionCell.id !== this.cell.id) {
            this.cell = selectionCell;
            this.cells = [this.cell];
          }
          self.movedCell = this.cell;
          const originalShape = graph.getView().getState(this.cell).shape;
          this.pBounds = originalShape.bounds;
          if (this.cell.value.tagName === 'Job') {
            shape = new mxLabel(originalShape.bounds, null, originalShape.stroke, originalShape.strokewidth + 1);
            shape.image = originalShape.image;
          } else if (this.cell.value.tagName === 'If' || this.cell.value.tagName === 'Cycle' || this.cell.value.tagName.match(/try/)) {
            shape = new mxRhombus(originalShape.bounds, null, originalShape.stroke, originalShape.strokewidth + 1);
          } else {
            shape = new mxImageShape(originalShape.bounds, self.workflowService.getStyleOfSymbol(this.cell.value.tagName, originalShape.image), null, originalShape.stroke + 1);
          }
          shape.isRounded = originalShape.isRounded;
          shape.gradient = originalShape.gradient;
          shape.boundingBox = originalShape.boundingBox;
          shape.style = originalShape.style;
          shape.dialect = (this.graph.dialect != mxConstants.DIALECT_SVG) ?
            mxConstants.DIALECT_VML : mxConstants.DIALECT_SVG;
          shape.init(this.graph.getView().getOverlayPane());
          shape.pointerEvents = false;
          // Workaround for artifacts on iOS
          if (mxClient.IS_IOS) {
            shape.getSvgScreenOffset = function() {
              return 0;
            };
          }
          return shape;
        };

        if (this.preferences.theme !== 'light' && this.preferences.theme !== 'lighter' || !this.preferences.theme) {
          const style = graph.getStylesheet().getDefaultEdgeStyle();
          style[mxConstants.STYLE_FONTCOLOR] = '#ffffff';
          const style2 = graph.getStylesheet().getDefaultEdgeStyle();
          if (this.preferences.theme === 'blue-lt') {
            style2[mxConstants.STYLE_LABEL_BACKGROUNDCOLOR] = 'rgba(70, 82, 95, 0.6)';
          } else if (this.preferences.theme === 'blue') {
            style2[mxConstants.STYLE_LABEL_BACKGROUNDCOLOR] = 'rgba(50, 70, 90, 0.61)';
          } else if (this.preferences.theme === 'cyan') {
            style2[mxConstants.STYLE_LABEL_BACKGROUNDCOLOR] = 'rgba(29, 29, 28, 0.5)';
          } else if (this.preferences.theme === 'grey') {
            style2[mxConstants.STYLE_LABEL_BACKGROUNDCOLOR] = 'rgba(78, 84, 92, 0.62)';
          }
          mxGraph.prototype.collapsedImage = new mxImage('./assets/mxgraph/images/collapsed-white.png', 12, 12);
          mxGraph.prototype.expandedImage = new mxImage('./assets/mxgraph/images/expanded-white.png', 12, 12);
        } else {
          mxGraph.prototype.collapsedImage = new mxImage('./assets/mxgraph/images/collapsed.png', 12, 12);
          mxGraph.prototype.expandedImage = new mxImage('./assets/mxgraph/images/expanded.png', 12, 12);
        }

        // Enables snapping waypoints to terminals
        mxEdgeHandler.prototype.snapToTerminals = true;

        graph.setConnectable(false);
        graph.setHtmlLabels(true);
        graph.setEnabled(false);
        graph.setDisconnectOnMove(false);
        graph.collapseToPreferredSize = false;
        graph.constrainChildren = false;
        graph.extendParentsOnAdd = false;
        graph.extendParents = false;

        const keyHandler = new mxKeyHandler(graph);

        // Handle Delete: delete key
        keyHandler.bindKey(46, function() {
          self.delete();
        });

        // Handle Undo: Ctrl + z
        keyHandler.bindControlKey(90, function() {
          self.undo();
        });

        // Handle Redo: Ctrl + y
        keyHandler.bindControlKey(89, function() {
          self.redo();
        });

        // Handle Copy: Ctrl + c
        keyHandler.bindControlKey(67, function() {
          self.copy(null);
        });

        // Handle Cut: Ctrl + x
        keyHandler.bindControlKey(88, function() {
          self.cut(null);
        });


        function clearClipboard(): void {
          if (self.cutCell) {
            self.changeCellStyle(self.editor.graph, self.cutCell, false);
          }
          self.cutCell = null;
          $('#toolbar').find('img').each(function(index) {
            if (index === 15) {
              $(this).addClass('disable-link');
            }
          });
        }

        // Defines a new class for all icons
        function mxIconSet(state) {
          this.images = [];
          let img;
          if (state.cell && (state.cell.value.tagName === 'Job' || state.cell.value.tagName === 'AddOrder' || state.cell.value.tagName === 'Finish' || state.cell.value.tagName === 'Fail' ||
            state.cell.value.tagName === 'ExpectNotice' || state.cell.value.tagName === 'PostNotice' || state.cell.value.tagName === 'Prompt' || self.workflowService.isInstructionCollapsible(state.cell.value.tagName))) {
            img = mxUtils.createImage('./assets/images/menu.svg');
            let x = state.x - (20 * state.shape.scale);
            let y = state.y - (8 * state.shape.scale);
            if (state.cell.value.tagName !== 'Job') {
              y = y + (state.cell.geometry.height / 2 * state.shape.scale) - 4;
              x = x + 2;
            }
            img.style.left = (x + 5) + 'px';
            img.style.top = y + 'px';
            mxEvent.addListener(img, 'click',
              mxUtils.bind(this, function(evt) {
                self.node = {cell: state.cell, isCloseable: self.workflowService.isInstructionCollapsible(state.cell.value.tagName)};
                if (self.menu) {
                  setTimeout(() => {
                    self.nzContextMenuService.create(evt, self.menu);
                  }, 0);
                }
                this.destroy();
              })
            );
          }
          if (img) {
            img.style.position = 'absolute';
            img.style.cursor = 'pointer';
            img.style.width = (18 * state.shape.scale) + 'px';
            img.style.height = (18 * state.shape.scale) + 'px';
            state.view.graph.container.appendChild(img);
            this.images.push(img);
          }
        }

        mxIconSet.prototype.destroy = function() {
          if (this.images != null) {
            for (let i = 0; i < this.images.length; i++) {
              const img = this.images[i];
              img.parentNode.removeChild(img);
            }
          }

          this.images = null;
        };

        /**
         * Function: isCellEditable
         *
         * Returns <isCellEditable>.
         */
        graph.isCellEditable = function() {
          return false;
        };

        /**
         * Function: isCellSelectable
         *
         * Returns <cellSelectable>.
         */
        graph.isCellSelectable = function(cell) {
          if (!cell || self.isTrash) {
            return false;
          }
          return !cell.edge;
        };

        // Changes fill color to red on mouseover
        graph.addMouseListener({
          currentState: null, previousStyle: null, currentHighlight: null, currentIconSet: null,
          mouseDown: function(sender, me) {
            if (self.isTrash) {
              return;
            }
            if (this.currentState != null) {
              this.dragLeave(me.getEvent(), this.currentState);
              this.currentState = null;
            }
          },
          mouseMove: function(sender, me) {
            if (self.isTrash) {
              return;
            }
            if (me.consumed && me.getCell()) {
              if (!self.display) {
                if (!self.isCellDragging && !dragStart) {
                  const cell = me.getCell();
                  const selectedCell = graph.getSelectionCell();
                  if (selectedCell && selectedCell.id !== cell.id) {
                    graph.setSelectionCell(cell);
                  }
                }
                self.isCellDragging = true;
                if (self.movedCell) {
                  self.display = true;
                  $('#dropContainer2').show();
                  $('#toolbar-icons').hide();
                }
              }
            }
            if (this.currentState != null && me.getState() == this.currentState) {
              return;
            }
            let tmp = graph.view.getState(me.getCell());
            // Ignores everything but vertices
            if (graph.isMouseDown) {
              tmp = null;
            }
            if ($('#toolbar').find('img.mxToolbarModeSelected').not('img:first-child')[0]) {

              if (tmp != this.currentState) {
                if (this.currentState != null) {
                  this.dragLeave(me.getEvent(), this.currentState);
                }
                this.currentState = tmp;
                if (this.currentState != null) {
                  this.dragEnter(me.getEvent(), this.currentState, me.getCell());
                }
              }
            } else {
              if (this.currentIconSet != null) {
                this.currentIconSet.destroy();
                this.currentIconSet = null;
              }
              if (tmp) {
                this.currentIconSet = new mxIconSet(tmp);
              }
              return;
            }
          },
          mouseUp: function(sender, me) {
            if (self.isTrash) {
              return;
            }
            if (self.isCellDragging) {
              self.isCellDragging = false;
              detachedInstruction(me.evt.target, self.movedCell);
              self.movedCell = null;
              if (self.droppedCell && me.getCell()) {
                rearrangeCell(self.droppedCell);
                self.droppedCell = null;
              } else {
                self.storeJSON();
              }
            }
          },
          dragEnter: function(evt, state, cell) {
            if (state != null) {
              this.previousStyle = state.style;
              state.style = mxUtils.clone(state.style);
              if (state.style && !dragStart && $('#toolbar').find('img.mxToolbarModeSelected').not('img:first-child')[0]) {
                result = checkValidTarget(cell, $('#toolbar').find('img.mxToolbarModeSelected').not('img:first-child').attr('title'));
                if (result === 'valid' || result === 'select') {
                  this.currentHighlight = new mxCellHighlight(graph, 'green');
                  this.currentHighlight.highlight(state);
                } else if (result === 'inValid') {
                  this.currentHighlight = new mxCellHighlight(graph, '#ff0000');
                  this.currentHighlight.highlight(state);
                }
              }
              if (state.shape) {
                state.shape.apply(state);
                state.shape.redraw();
              }
              if (state.text != null) {
                state.text.apply(state);
                state.text.redraw();
              }
            }
          },
          dragLeave: function(evt, state) {
            if (state != null) {
              state.style = this.previousStyle;
              if (state.style && this.currentHighlight != null) {
                this.currentHighlight.destroy();
                this.currentHighlight = null;
              }
              if (state.shape) {
                state.shape.apply(state);
                state.shape.redraw();
              }

              if (state.text != null) {
                state.text.apply(state);
                state.text.redraw();
              }
            }
          }
        });

        function detachedInstruction(target, cell): void {
          if (target && target.getAttribute('class') === 'dropContainer' && cell) {
            self.droppedCell = null;
            self.editor.graph.removeCells([cell], null);
          }
          self.display = false;
          $('#dropContainer2').hide();
          $('#toolbar-icons').show();
        }

        /**
         * Function: isCellMovable
         *
         * Returns true if the given cell is moveable.
         */
        graph.isCellMovable = function(cell) {
          if (cell.value && !self.isTrash) {
            return !cell.edge && cell.value.tagName !== 'Catch' && cell.value.tagName !== 'Process' && !self.workflowService.checkClosingCell(cell.value.tagName);
          } else {
            return false;
          }
        };

        graph.moveCells = function(cells) {
          return cells;
        };

        /**
         * Function: handle a click event
         *
         */
        graph.click = function(me) {
          const evt = me.getEvent();
          const cell = me.getCell();
          const mxe = new mxEventObject(mxEvent.CLICK, 'event', evt, 'cell', cell);
          if (cell && !dragStart) {
            const dom = $('#toolbar');
            if (dom.find('img.mxToolbarModeSelected').not('img:first-child')[0]) {
              const sourceCell = dom.find('img.mxToolbarModeSelected').not('img:first-child');
              if (result === 'valid' || evt.pointerType === 'touch') {
                const _result = checkValidTarget(cell, sourceCell.attr('src'));
                if (_result !== 'select') {
                  result = _result;
                }
              }
              createClickInstruction(sourceCell.attr('src'), cell);
              mxToolbar.prototype.resetMode(true);
            }
          } else {
            dragStart = false;
          }
          if (me.isConsumed()) {
            mxe.consume();
          }

          if (!cell || (cell && cell.value.tagName !== 'Connection')) {
            graph.clearSelection();
          }

          // Handles the event if it has not been consumed
          if (cell) {
            if (cell.value.tagName === 'Job' || cell.value.tagName === 'AddOrder' || cell.value.tagName === 'Finish' || cell.value.tagName === 'Fail' ||
              cell.value.tagName === 'ExpectNotice' || cell.value.tagName === 'PostNotice' || cell.value.tagName === 'Prompt') {
              graph.setSelectionCell(cell);
            } else {
              if (self.workflowService.isInstructionCollapsible(cell.value.tagName)) {
                graph.setSelectionCells([cell]);
              }
            }
          }
          customizedChangeEvent();
          self.closeMenu();
        };

        /**
         * Function: resetMode
         *
         * Selects the default mode and resets the state of the previously selected
         * mode.
         */
        mxToolbar.prototype.resetMode = function(forced) {
          if (forced) {
            this.defaultMode = $('#toolbar').find('img:first-child')[0];
            this.selectedMode = $('#toolbar').find('img.mxToolbarModeSelected').not('img:first-child')[0];
          }
          if ((forced || !this.noReset) && this.selectedMode != this.defaultMode) {
            this.selectMode(this.defaultMode, this.defaultFunction);
          }
        };

        /**
         * Overrides method to provide a cell collapse/expandable on double click
         */
        graph.dblClick = function(evt, cell) {
          if (cell != null && cell.vertex == 1) {
            if (self.workflowService.isInstructionCollapsible(cell.value.tagName)) {
              const flag = cell.collapsed != true;
              graph.foldCells(flag, false, [cell], null, evt);
            }
          }
        };

        /**
         * Overrides method to provide a cell label in the display
         * @param cell
         */
        graph.convertValueToString = function(cell) {
          return self.workflowService.convertValueToString(cell, graph);
        };

        // Returns the type as the tooltip for column cells
        graph.getTooltipForCell = function(cell) {
          return self.workflowService.getTooltipForCell(cell);
        };

        /**
         * To check drop target is valid or not on hover
         *
         */
        mxDragSource.prototype.dragOver = function(_graph, evt) {
          dragStart = true;
          const offset = mxUtils.getOffset(_graph.container);
          const origin = mxUtils.getScrollOrigin(_graph.container);
          let x = mxEvent.getClientX(evt) - offset.x + origin.x - _graph.panDx;
          let y = mxEvent.getClientY(evt) - offset.y + origin.y - _graph.panDy;

          if (_graph.autoScroll && (this.autoscroll == null || this.autoscroll)) {
            _graph.scrollPointToVisible(x, y, _graph.autoExtend);
          }
          if ($('#toolbar').find('img.mxToolbarModeSelected').not('img:first-child')[0]) {
            mxToolbar.prototype.resetMode(true);
          }

          // Highlights the drop target under the mouse
          if (this.currentHighlight != null && _graph.isDropEnabled()) {
            this.currentDropTarget = this.getDropTarget(_graph, x, y, evt);
            const state = _graph.getView().getState(this.currentDropTarget);
            if (state && state.cell) {
              result = checkValidTarget(state.cell, this.dragElement.getAttribute('src'));
              this.currentHighlight.highlightColor = 'green';
              if (result === 'inValid') {
                this.currentHighlight.highlightColor = '#ff0000';
              }
              if (result === 'return') {
                return;
              }
            }
            this.currentHighlight.highlight(state);
          }

          // Updates the location of the preview
          if (this.previewElement != null) {
            if (this.previewElement.parentNode == null) {
              _graph.container.appendChild(this.previewElement);
              this.previewElement.style.zIndex = '3';
              this.previewElement.style.position = 'absolute';
            }

            const gridEnabled = this.isGridEnabled() && _graph.isGridEnabledEvent(evt);
            let hideGuide = true;

            // Grid and guides
            if (this.currentGuide != null && this.currentGuide.isEnabledForEvent(evt)) {
              // LATER: HTML preview appears smaller than SVG preview
              const w = parseInt(this.previewElement.style.width, 10);
              const h = parseInt(this.previewElement.style.height, 10);
              const bounds = new mxRectangle(0, 0, w, h);
              let delta = new mxPoint(x, y);
              delta = this.currentGuide.move(bounds, delta, gridEnabled);
              hideGuide = false;
              x = delta.x;
              y = delta.y;
            } else if (gridEnabled) {
              const scale = _graph.view.scale;
              const tr = _graph.view.translate;
              const off = _graph.gridSize / 2;
              x = (_graph.snap(x / scale - tr.x - off) + tr.x) * scale;
              y = (_graph.snap(y / scale - tr.y - off) + tr.y) * scale;
            }

            if (this.currentGuide != null && hideGuide) {
              this.currentGuide.hide();
            }

            if (this.previewOffset != null) {
              x += this.previewOffset.x;
              y += this.previewOffset.y;
            }

            this.previewElement.style.left = Math.round(x) + 'px';
            this.previewElement.style.top = Math.round(y) + 'px';
            this.previewElement.style.visibility = 'visible';
          }
          this.currentPoint = new mxPoint(x, y);
        };

        /**
         * Check the drop target on drop event
         */
        mxDragSource.prototype.drop = function(_graph, evt, drpTargt, x, y) {
          dropTarget = null;
          movedTarget = null;
          selectedCellsObj = null;
          let flag = false;
          let dragElement = null;
          if (drpTargt) {
            let check = false;
            let title = '';
            let msg = '';
            self.translate.get('workflow.message.invalidTarget').subscribe(translatedValue => {
              title = translatedValue;
            });
            if (this.dragElement && this.dragElement.getAttribute('src')) {
              dragElement = this.dragElement.getAttribute('src');
              if (dragElement.match('fork') || dragElement.match('retry') || dragElement.match('cycle') || dragElement.match('lock') || dragElement.match('try') || dragElement.match('if')) {
                const selectedCell = graph.getSelectionCell();
                if (selectedCell) {
                  const cells = graph.getSelectionCells();
                  if (cells.length > 1) {
                    selectedCellsObj = isCellSelectedValid(cells);
                    if (selectedCellsObj.invalid) {
                      self.translate.get('workflow.message.invalidInstructionsSelected').subscribe(translatedValue => {
                        msg = translatedValue;
                      });
                      self.toasterService.error(msg, title + '!!');
                      return;
                    }
                  }
                  if (selectedCell.id === drpTargt.id || (selectedCellsObj && selectedCellsObj.ids && selectedCellsObj.ids.length > 0 && selectedCellsObj.ids.indexOf(drpTargt.id) > -1)) {
                    check = true;
                  }
                }
              }
            }
            if (!check) {
              if (drpTargt.value.tagName !== 'Connection') {
                if (drpTargt.value.tagName === 'Job' || drpTargt.value.tagName === 'AddOrder' || drpTargt.value.tagName === 'Finish' || drpTargt.value.tagName === 'Fail'
                  || drpTargt.value.tagName === 'ExpectNotice' || drpTargt.value.tagName === 'PostNotice' || drpTargt.value.tagName === 'Prompt') {
                  for (let i = 0; i < drpTargt.edges.length; i++) {
                    if (drpTargt.edges[i].target.id !== drpTargt.id) {
                      self.translate.get('workflow.message.validationError').subscribe(translatedValue => {
                        msg = translatedValue;
                      });
                      self.toasterService.error( drpTargt.value.tagName + ' ' + msg, title + '!!');
                      return;
                    }
                  }
                } else if (drpTargt.value.tagName === 'If') {
                  if (drpTargt.edges.length > 2) {
                    self.translate.get('workflow.message.ifInstructionValidationError').subscribe(translatedValue => {
                      msg = translatedValue;
                    });
                    self.toasterService.error( msg, title + '!!');
                    return;
                  }
                } else if (self.workflowService.checkClosingCell(drpTargt.value.tagName)) {
                  if (drpTargt.edges.length > 1) {
                    for (let i = 0; i < drpTargt.edges.length; i++) {
                      if (drpTargt.edges[i].target.id !== drpTargt.id) {
                        self.translate.get('workflow.message.otherInstructionValidationError').subscribe(translatedValue => {
                          msg = translatedValue;
                        });
                        self.toasterService.error(msg, title + '!!');
                        return;
                      }
                    }
                  }
                } else if (drpTargt.value.tagName === 'Retry') {
                  let flag1 = false;
                  if (drpTargt.edges && drpTargt.edges.length) {
                    for (let i = 0; i < drpTargt.edges.length; i++) {
                      if (drpTargt.edges[i].source.value.tagName === 'Retry' && drpTargt.edges[i].target.value.tagName === 'EndRetry') {
                        flag1 = true;
                      }
                    }
                  }
                  if (!flag1) {
                    self.translate.get('workflow.message.otherInstructionValidationError').subscribe(translatedValue => {
                      msg = translatedValue;
                    });
                    self.toasterService.error(msg, title + '!!');
                    return;
                  }
                } else if (drpTargt.value.tagName === 'Lock') {
                  let flag1 = false;
                  if (drpTargt.edges && drpTargt.edges.length) {
                    for (let i = 0; i < drpTargt.edges.length; i++) {
                      if (drpTargt.edges[i].source.value.tagName === 'Lock' && drpTargt.edges[i].target.value.tagName === 'EndLock') {
                        flag1 = true;
                      }
                    }
                  }
                  if (!flag1) {
                    self.translate.get('workflow.message.otherInstructionValidationError').subscribe(translatedValue => {
                      msg = translatedValue;
                    });
                    self.toasterService.error(msg, title + '!!');
                    return;
                  }
                } else if (drpTargt.value.tagName === 'Cycle') {
                  let flag1 = false;
                  if (drpTargt.edges && drpTargt.edges.length) {
                    for (let i = 0; i < drpTargt.edges.length; i++) {
                      if (drpTargt.edges[i].source.value.tagName === 'Cycle' && drpTargt.edges[i].target.value.tagName === 'EndCycle') {
                        flag1 = true;
                      }
                    }
                  }
                  if (!flag1) {
                    self.translate.get('workflow.message.otherInstructionValidationError').subscribe(translatedValue => {
                      msg = translatedValue;
                    });
                    self.toasterService.error(msg, title + '!!');
                    return;
                  }
                } else if (drpTargt.value.tagName === 'ForkList') {
                  let flag1 = false;
                  if (drpTargt.edges && drpTargt.edges.length) {
                    for (let i = 0; i < drpTargt.edges.length; i++) {
                      if (drpTargt.edges[i].source.value.tagName === 'ForkList' && drpTargt.edges[i].target.value.tagName === 'EndForkList') {
                        flag1 = true;
                      }
                    }
                  }
                  if (!flag1) {
                    self.translate.get('workflow.message.otherInstructionValidationError').subscribe(translatedValue => {
                      msg = translatedValue;
                    });
                    self.toasterService.error(msg, title + '!!');
                    return;
                  }
                } else if (drpTargt.value.tagName === 'Try') {
                  let flag1 = false;
                  if (drpTargt.edges && drpTargt.edges.length) {
                    for (let i = 0; i < drpTargt.edges.length; i++) {
                      if (drpTargt.edges[i].source.value.tagName === 'Try' && drpTargt.edges[i].target && (drpTargt.edges[i].target.value.tagName === 'Catch' || drpTargt.edges[i].target.value.tagName === 'EndTry')) {
                        flag1 = true;
                      }
                    }
                  }
                  if (!flag1) {
                    self.translate.get('workflow.message.otherInstructionValidationError').subscribe(translatedValue => {
                      msg = translatedValue;
                    });
                    self.toasterService.error(msg, title + '!!');
                    return;
                  }
                } else if (drpTargt.value.tagName === 'Catch') {
                  let flag1 = false;
                  if (drpTargt.edges && drpTargt.edges.length) {
                    for (let i = 0; i < drpTargt.edges.length; i++) {
                      if (drpTargt.edges[i].source.value.tagName === 'Catch' && drpTargt.edges[i].target.value.tagName === 'EndTry') {
                        flag1 = true;
                      }
                    }
                  }
                  if (!flag1) {
                    self.translate.get('workflow.message.otherInstructionValidationError').subscribe(translatedValue => {
                      msg = translatedValue;
                    });
                    self.toasterService.error(msg, title + '!!');
                    return;
                  }
                } else if (drpTargt.value.tagName === 'Process') {
                  if (drpTargt.getAttribute('start') || drpTargt.getAttribute('end')) {
                    return;
                  }
                  if (drpTargt.edges && drpTargt.edges.length === 1) {
                    if (drpTargt.edges[0].value.tagName === 'Connector') {
                      return;
                    }
                  }
                } else if (drpTargt.value.tagName === 'Connector') {
                  return;
                }
                dropTarget = drpTargt;
              } else {
                if (drpTargt.value.tagName === 'Connection') {
                  if ((drpTargt.source.value.tagName === 'Fork' && drpTargt.target.value.tagName === 'Join') ||
                    (drpTargt.source.value.tagName === 'If' && drpTargt.target.value.tagName === 'EndIf') ||
                    (drpTargt.source.value.tagName === 'Retry' && drpTargt.target.value.tagName === 'EndRetry') ||
                    (drpTargt.source.value.tagName === 'ForkList' && drpTargt.target.value.tagName === 'EndForkList') ||
                    (drpTargt.source.value.tagName === 'Lock' && drpTargt.target.value.tagName === 'EndLock') ||
                    (drpTargt.source.value.tagName === 'Cycle' && drpTargt.target.value.tagName === 'EndCycle') ||
                    (drpTargt.source.value.tagName === 'Try' && drpTargt.target.value.tagName === 'Catch') ||
                    (drpTargt.source.value.tagName === 'Catch' && drpTargt.target.value.tagName === 'EndTry') ||
                    (drpTargt.source.value.tagName === 'Try' && drpTargt.target.value.tagName === 'EndTry')) {
                    return;
                  }
                }
                flag = true;
              }
              setTimeout(() => {
                self.storeJSON();
              }, 10);
            } else {
              movedTarget = drpTargt;
            }

            if (dragElement) {
              if (dragElement.match('paste')) {
                if (self.copyId || (self.inventoryConf.copiedInstuctionObject && self.inventoryConf.copiedInstuctionObject.TYPE)) {
                  pasteInstruction(drpTargt);
                } else if (self.cutCell) {
                  createClickInstruction(dragElement, drpTargt);
                }
                return;
              }
              if (drpTargt.value.tagName !== 'Connection') {
                createClickInstruction(dragElement, drpTargt);
                return;
              }
            }

          } else {
            return;
          }
          this.dropHandler(_graph, evt, drpTargt, x, y);
          if (_graph.container.style.visibility !== 'hidden') {
            _graph.container.focus();
          }
          if (flag) {
            WorkflowService.executeLayout(graph);
          }
        };

        /**
         * Function: removeCells
         *
         * Removes the given cells from the graph including all connected edges if
         * includeEdges is true. The change is carried out using <cellsRemoved>.
         * This method fires <mxEvent.REMOVE_CELLS> while the transaction is in
         * progress. The removed cells are returned as an array.
         *
         * Parameters:
         *
         * cells - Array of <mxCells> to remove. If null is specified then the
         * selection cells which are deletable are used.
         * flag - Optional boolean which specifies if all connected edges
         * should be removed as well. Default is true.
         */
        mxGraph.prototype.removeCells = function(cells, flag) {
          if (cells == null) {
            cells = this.getDeletableCells(this.getSelectionCells());
          }
          if (typeof flag != 'boolean') {
            if (cells && cells.length) {
              deleteInstructionFromJSON(cells);
            }
          } else {
            // in cells or descendant of cells
            cells = this.getDeletableCells(this.addAllEdges(cells));
            this.model.beginUpdate();
            try {
              this.cellsRemoved(cells);
              this.fireEvent(new mxEventObject(mxEvent.REMOVE_CELLS,
                'cells', cells, 'includeEdges', true));
            } finally {
              this.model.endUpdate();
            }
          }
          return cells;
        };

        /**
         * Function: foldCells to collapse/expand
         *
         * collapsed - Boolean indicating the collapsed state to be assigned.
         * recurse - Optional boolean indicating if the collapsed state of all
         * descendants should be set. Default is true.
         * cells - Array of <mxCells> whose collapsed state should be set. If
         * null is specified then the foldable selection cells are used.
         * checkFoldable - Optional boolean indicating of isCellFoldable should be
         * checked. Default is false.
         * evt - Optional native event that triggered the invocation.
         */
        mxGraph.prototype.foldCells = function(collapse, recurse, cells, checkFoldable) {
          graph.clearSelection();
          recurse = (recurse != null) ? recurse : true;
          this.stopEditing(false);
          this.model.beginUpdate();
          try {
            this.cellsFolded(cells, collapse, recurse, checkFoldable);
            this.fireEvent(new mxEventObject(mxEvent.FOLD_CELLS,
              'collapse', collapse, 'recurse', recurse, 'cells', cells));
          } finally {
            this.model.endUpdate();
          }
          WorkflowService.executeLayout(graph);
          return cells;
        };

        /**
         * Function: addVertex
         *
         * Adds the given vertex as a child of parent at the specified
         * x and y coordinate and fires an <addVertex> event.
         */
        mxEditor.prototype.addVertex = function(parent, vertex, x, y) {
          const model = this.graph.getModel();
          while (parent != null && !this.graph.isValidDropTarget(parent)) {
            parent = model.getParent(parent);
          }
          if (!parent && !isVertexDrop) {
            return null;
          } else {
            isVertexDrop = false;
          }
          parent = (parent != null) ? parent : this.graph.getSwimlaneAt(x, y);
          const scale = this.graph.getView().scale;

          let geo = model.getGeometry(vertex);
          const pgeo = model.getGeometry(parent);

          if (this.graph.isSwimlane(vertex) &&
            !this.graph.swimlaneNesting) {
            parent = null;
          } else if (parent == null && this.swimlaneRequired) {
            return null;
          } else if (parent != null && pgeo != null) {
            // Keeps vertex inside parent
            const state = this.graph.getView().getState(parent);

            if (state != null) {
              x -= state.origin.x * scale;
              y -= state.origin.y * scale;

              if (this.graph.isConstrainedMoving) {
                const width = geo.width;
                const height = geo.height;
                let tmp = state.x + state.width;
                if (x + width > tmp) {
                  x -= x + width - tmp;
                }
                tmp = state.y + state.height;
                if (y + height > tmp) {
                  y -= y + height - tmp;
                }
              }
            } else if (pgeo != null) {
              x -= pgeo.x * scale;
              y -= pgeo.y * scale;
            }
          }

          geo = geo.clone();
          geo.x = this.graph.snap(x / scale -
            this.graph.getView().translate.x -
            this.graph.gridSize / 2);
          geo.y = this.graph.snap(y / scale -
            this.graph.getView().translate.y -
            this.graph.gridSize / 2);
          vertex.setGeometry(geo);

          if (parent == null) {
            parent = this.graph.getDefaultParent();
          }

          this.cycleAttribute(vertex);
          this.fireEvent(new mxEventObject(mxEvent.BEFORE_ADD_VERTEX,
            'vertex', vertex, 'parent', parent));

          model.beginUpdate();
          try {
            vertex = this.graph.addCell(vertex, parent);

            if (vertex != null) {
              this.graph.constrainChild(vertex);

              this.fireEvent(new mxEventObject(mxEvent.ADD_VERTEX, 'vertex', vertex));
            }
          } finally {
            model.endUpdate();
          }
          if (vertex != null) {
            this.graph.setSelectionCell(vertex);
            this.graph.scrollCellToVisible(vertex);
            this.fireEvent(new mxEventObject(mxEvent.AFTER_ADD_VERTEX, 'vertex', vertex));
            customizedChangeEvent();
          }
          return vertex;
        };

        /**
         * Event to check if connector is valid or not on drop of new instruction
         */
        graph.isValidDropTarget = function (cell, cells, evt) {
          if (cell && cell.value) {
            self.droppedCell = null;
            if (self.isCellDragging && cells && cells.length > 0) {
              if (!self.movedCell) {
                return;
              }
              const tagName = cell.value.tagName;
              if (tagName === 'Connection' || self.workflowService.isInstructionCollapsible(tagName) || tagName === 'Catch') {
                if (tagName === 'Connection') {
                  if (cell.source && cell.target) {
                    let sourceId = cell.source.id;
                    let targetId = cell.target.id;
                    if (self.workflowService.checkClosingCell(cell.source.value.tagName)) {
                      sourceId = cell.source.value.getAttribute('targetId');
                    } else if (cell.source.value.tagName === 'Process' && cell.source.getAttribute('title') === 'start') {
                      sourceId = 'start';
                    }
                    if (self.workflowService.checkClosingCell(cell.target.value.tagName)) {
                      targetId = cell.target.value.getAttribute('targetId');
                    } else if (cell.target.value.tagName === 'Process' && cell.target.getAttribute('title') === 'start') {
                      targetId = 'start';
                    }
                    self.droppedCell = {
                      target: {source: sourceId, target: targetId},
                      cell: self.movedCell,
                      type: cell.value.getAttribute('type')
                    };
                    return mxGraph.prototype.isValidDropTarget.apply(this, arguments);
                  }
                } else {
                  self.droppedCell = {target: cell.id, cell: self.movedCell};
                  return true;
                }
              } else {
                return false;
              }
            } else {
              isVertexDrop = true;
              if (cell.value && cell.value.tagName === 'Connection') {
                graph.clearSelection();
                if (cells && cells.length > 0) {
                  if (cell.source) {
                    if (cell.source.getParent() && cell.source.getParent().id !== '1') {
                      const _type = cell.getAttribute('type');
                      if (!(_type === 'retry' || _type === 'lock' || _type === 'cycle' || _type === 'then' || _type === 'else' || _type === 'branch' || _type === 'try' || _type === 'catch')) {
                        cell.setParent(cell.source.getParent());
                      }
                    }
                  }
                  if (self.workflowService.isInstructionCollapsible(cells[0].value.tagName)) {
                    const parent = cell.getParent() || graph.getDefaultParent();
                    let v1, v2, label = '';
                    const attr = cell.value.attributes;
                    if (attr) {
                      for (let i = 0; i < attr.length; i++) {
                        if (attr[i].value && attr[i].name) {
                          label = attr[i].value;
                          break;
                        }
                      }
                    }
                    if (cells[0].value.tagName === 'Fork') {
                      v1 = graph.insertVertex(parent, null, getCellNode('Join', 'join', null), 0, 0, 68, 68, 'join');
                    } else if (cells[0].value.tagName === 'ForkList') {
                      v1 = graph.insertVertex(parent, null, getCellNode('EndForkList', 'forkListEnd', null), 0, 0, 68, 68, 'closeForkList');
                    } else if (cells[0].value.tagName === 'If') {
                      v1 = graph.insertVertex(parent, null, getCellNode('EndIf', 'ifEnd', null), 0, 0, 75, 75, 'if');
                    } else if (cells[0].value.tagName === 'Retry') {
                      v1 = graph.insertVertex(parent, null, getCellNode('EndRetry', 'retryEnd', null), 0, 0, 75, 75, 'retry');
                    } else if (cells[0].value.tagName === 'Lock') {
                      v1 = graph.insertVertex(parent, null, getCellNode('EndLock', 'lockEnd', null), 0, 0, 68, 68, 'closeLock');
                    } else if (cells[0].value.tagName === 'Cycle') {
                      v1 = graph.insertVertex(parent, null, getCellNode('EndCycle', 'cycleEnd', null), 0, 0, 75, 75, 'cycle');
                    } else {
                      v1 = graph.insertVertex(parent, null, getCellNode('EndTry', 'tryEnd', null), 0, 0, 75, 75, 'try');
                      v2 = graph.insertVertex(cells[0], null, getCellNode('Catch', 'catch', null), 0, 0, 100, 40, 'dashRectangle');
                      graph.insertEdge(parent, null, getConnectionNode('try'), cells[0], v2);
                      graph.insertEdge(parent, null, getConnectionNode('endTry'), v2, v1);
                    }
                    graph.insertEdge(parent, null, getConnectionNode(label), cell.source, cells[0]);
                    if (cells[0].value.tagName !== 'Try') {
                      graph.insertEdge(parent, null, getConnectionNode(''), cells[0], v1);
                    }
                    graph.insertEdge(parent, null, getConnectionNode(''), v1, cell.target);
                    for (let x = 0; x < cell.source.edges.length; x++) {
                      if (cell.source.edges[x].id === cell.id) {
                        const _sourCellName = cell.source.value.tagName;
                        const _tarCellName = cell.target.value.tagName;
                        if ((cell.target && ((_sourCellName === 'Job' || _sourCellName === 'AddOrder' || _sourCellName === 'Finish' || _sourCellName === 'Fail' || _sourCellName === 'PostNotice' || _sourCellName === 'Prompt' || _sourCellName === 'ExpectNotice') &&
                          (_tarCellName === 'Job' || _tarCellName === 'AddOrder' || _tarCellName === 'Finish' || _tarCellName === 'Fail' || _tarCellName === 'PostNotice' || _tarCellName === 'Prompt' || _tarCellName === 'ExpectNotice')))) {
                          graph.getModel().remove(cell.source.edges[x]);
                        } else {
                          cell.source.removeEdge(cell.source.edges[x], true);
                        }
                        break;
                      }
                    }

                    setTimeout(() => {
                      graph.getModel().beginUpdate();
                      try {
                        if (cells[0].id && v1.id) {
                          self.nodeMap.set(cells[0].id, v1.id);
                        }
                        const targetId = new mxCellAttributeChange(
                          v1, 'targetId',
                          cells[0].id);
                        graph.getModel().execute(targetId);
                        if (v2) {
                          const targetId2 = new mxCellAttributeChange(
                            v2, 'targetId', cells[0].id);
                          graph.getModel().execute(targetId2);
                        }
                      } finally {
                        graph.getModel().endUpdate();
                      }
                      checkConnectionLabel(cells[0], cell, false);
                    }, 0);
                    return false;
                  }
                }
                if (checkClosedCellWithSourceCell(cell.source, cell.target)) {
                  graph.removeCells(cells, true);
                  evt.preventDefault();
                  evt.stopPropagation();
                  return false;
                }
                graph.setSelectionCells(cells);
                customizedChangeEvent();
                setTimeout(() => {
                  checkConnectionLabel(cells[0], cell, true);
                  isVertexDrop = false;
                }, 0);
              } else {
                if (cell.value && cell.value.tagName === 'Connector') {
                  graph.removeCells(cells, true);
                  evt.preventDefault();
                  evt.stopPropagation();
                  return false;
                }
              }
            }
            if (this.isCellCollapsed(cell)) {
              return true;
            }
            return mxGraph.prototype.isValidDropTarget.apply(this, arguments);
          }
        };

        /**
         * Implements a properties panel that uses
         * mxCellAttributeChange to change properties
         */
        graph.getSelectionModel().addListener(mxEvent.CHANGE, function(evt) {
          let cell;
          if (evt.cells && evt.cells.length > 0) {
            cell = evt.cells[0];
          }
          if (cell && (self.workflowService.checkClosingCell(cell.value.tagName) ||
            cell.value.tagName === 'Connection' || cell.value.tagName === 'Process' || cell.value.tagName === 'Catch')) {
            graph.clearSelection();
            return;
          }
          if (cell && self.workflowService.isInstructionCollapsible(cell.value.tagName)) {
            const targetId = self.nodeMap.get(cell.id);
            if (targetId) {
              const lastCell = graph.getModel().getCell(targetId);
              if (lastCell) {
                graph.addSelectionCell(graph.getModel().getCell(targetId));
              }
            }
          }
        });

        initGraph();
        self.centered();

        WorkflowService.executeLayout(graph);

        const mgr = new mxAutoSaveManager(graph);
        mgr.save = function() {
          if (self.cutCell) {
            clearClipboard();
          }
          if (!self.isLoading && !self.isTrash) {
            setTimeout(() => {
              if (self.workflow.actual) {
                self.implicitSave = true;
                if (self.noSave) {
                  self.noSave = false;
                } else {
                  if (!self.skipXMLToJSONConversion) {
                    self.xmlToJsonParser();
                  } else {
                    self.skipXMLToJSONConversion = false;
                  }
                  if (self.workflow.configuration && self.workflow.configuration.instructions && self.workflow.configuration.instructions.length > 0) {
                    graph.setEnabled(true);
                  } else {
                    self.reloadDummyXml(graph);
                  }
                  self.validateJSON(false);
                }
                setTimeout(() => {
                  self.implicitSave = false;
                }, 250);
              }
            }, 200);
          } else {
            if (self.workflow.configuration && self.workflow.configuration.instructions && self.workflow.configuration.instructions.length > 0) {
              graph.setEnabled(true);
            } else {
              self.reloadDummyXml(graph);
            }
          }
        };
      } else {
        this.updateXMLJSON(false);
      }
    }

    /**
     * Function: Remove selected cells from JSON
     */
    function deleteInstructionFromJSON(cells): void {
      deleteRecursively(self.workflow.configuration, cells[0], '', () => {
        setTimeout(() => {
          if (self.editor && self.editor.graph) {
            self.updateXMLJSON(true);
            self.updateJobs(graph, false);
          }
        }, 1);
      });
    }

    function mergeInternalInstructions(instructions, index): void {
      let instructionsArr = [];
      if (instructions[index].TYPE === 'Fork') {
        for (const i in instructions[index].branches) {
          instructionsArr = instructionsArr.concat(instructions[index].branches[i].instructions)
        }
      } else if (instructions[index].TYPE === 'If') {
        if (instructions[index].then && instructions[index].then.instructions) {
          instructionsArr = instructionsArr.concat(instructions[index].then.instructions)
        }
        if (instructions[index].else && instructions[index].else.instructions) {
          instructionsArr = instructionsArr.concat(instructions[index].else.instructions)
        }
      } else if (instructions[index].TYPE === 'Try') {
        instructionsArr = instructionsArr.concat(instructions[index].instructions);
        if (instructions[index].catch && instructions[index].catch.instructions) {
          instructionsArr = instructionsArr.concat(instructions[index].catch.instructions)
        }
      } else {
        instructionsArr = instructionsArr.concat(instructions[index].instructions)
      }
      for (let i = 0; i < instructionsArr.length; i++) {
        instructions.splice(index + i + 1, 0, instructionsArr[i]);
      }
    }

    function deleteRecursively(_json, _cell, _type, cb) {
      function iterateJson(json, cell, type) {
        if (json.instructions) {
          for (let x = 0; x < json.instructions.length; x++) {
            if (json.instructions[x].id == cell.id) {
              if(self.node && self.node.isCloseable && !self.node.deleteAll){
                mergeInternalInstructions(json.instructions, x);
              }
              json.instructions.splice(x, 1);
              if (json.instructions.length === 0 && type !== 'catch') {
                delete json.instructions;
                delete json.id;
              }
              break;
            }

            if (json.instructions[x].instructions) {
              iterateJson(json.instructions[x], cell, '');
            }
            if (json.instructions[x].catch) {
              if (json.instructions[x].catch.id == cell.id) {
                delete json.instructions[x].catch;
                break;
              }
              if (json.instructions[x].catch.instructions && json.instructions[x].catch.instructions.length > 0) {
                iterateJson(json.instructions[x].catch, cell, 'catch');
              }
            }
            if (json.instructions[x].then) {
              iterateJson(json.instructions[x].then, cell, '');
            }
            if (json.instructions[x].else) {
              iterateJson(json.instructions[x].else, cell, '');
            }
            if (json.instructions[x].branches) {
              for (let i = 0; i < json.instructions[x].branches.length; i++) {
                iterateJson(json.instructions[x].branches[i], cell, '');
                if (!json.instructions[x].branches[i].instructions) {
                  json.instructions[x].branches.splice(i, 1);
                }
              }
            }
          }
        }
      }

      iterateJson(_json, _cell, _type);
      cb();
    }

    /**
     * Function: Get first and last cell from the user selected cells
     */
    function isCellSelectedValid(cells): any {
      const obj = {firstCell: null, lastCell: null, ids: [], invalid: false};
      if (cells.length === 2) {
        if (!checkClosedCellWithSourceCell(cells[0], cells[1])) {
          const x = graph.getEdgesBetween(cells[0], cells[1]);
          if (x.length === 0) {
            obj.invalid = true;
            return obj;
          }
        }
      }
      for (let i = 0; i < cells.length; i++) {
        obj.invalid = !isSelectedCellConnected(cells, cells[i]);
        obj.ids.push(cells[i].id);
        if (!isParentAlsoSelected(cells, cells[i])) {
          if (!obj.firstCell) {
            obj.firstCell = cells[i];
          }
          if (!obj.lastCell) {
            obj.lastCell = cells[i];
          }
          if (obj.firstCell && obj.firstCell.geometry.y > cells[i].geometry.y) {
            obj.firstCell = cells[i];
          }
        }
        if (!obj.lastCell || (obj.lastCell.geometry.y < cells[i].geometry.y)) {
          obj.lastCell = cells[i];
        }
      }
      return obj;
    }

    /**
     * Function : To check is parent instruction also selected or not
     */
    function isParentAlsoSelected(cells, cell): boolean {
      let flag = false;
      for (let i = 0; i < cells.length; i++) {
        if (cells[i].id === cell.getParent().id) {
          flag = true;
          break;
        }
      }

      return flag;
    }

    /**
     * Function: To check is selected instructions are interconnected or not
     */
    function isSelectedCellConnected(cells, cell): boolean {
      let flag = false;
      for (let i = 0; i < cells.length; i++) {
        if (graph.getEdgesBetween(cells[i], cell).length > 0) {
          flag = true;
          break;
        } else {
          if (self.workflowService.checkClosingCell(cell.value.tagName)) {
            flag = true;
            break;
          }
        }
      }
      return flag;
    }

    /**
     * Function: To check source is closed with its own closing cell or not
     */
    function checkClosedCellWithSourceCell(sour, targ): boolean {
      const sourName = sour.value.tagName;
      const tarName = targ.value.tagName;
      return (sourName === 'Fork' && tarName === 'Join') || (sourName === 'If' && tarName === 'EndIf') ||
        ((sourName === 'Try' && tarName === 'EndTry') || (sourName === 'Try' && tarName === 'Catch') ||
          (sourName === 'Catch' && tarName === 'EndTry')) || (sourName === 'Retry' && tarName === 'EndRetry') ||
        (sourName === 'Cycle' && tarName === 'EndCycle') || (sourName === 'ForkList' && tarName === 'EndForkList') ||
        (sourName === 'Lock' && tarName === 'EndLock');
    }

    function getLastNodeAndConnect(name, parent, parentCell, cell, cells): any {
      let label1;
      let label2;
      let v2;
      let _sour;
      let _tar;
      let _middle;
      if (name === 'If') {
        label1 = 'then';
        label2 = 'endIf';
        v2 = graph.insertVertex(parent, null, getCellNode('EndIf', 'ifEnd', parentCell.id), 0, 0, 75, 75, 'if');
      } else if (name === 'Fork') {
        label1 = 'branch';
        label2 = 'join';
        v2 = graph.insertVertex(parent, null, getCellNode('Join', 'join', parentCell.id), 0, 0, 68, 68, 'join');
      } else if (name === 'Retry') {
        label1 = 'retry';
        label2 = 'endRetry';
        v2 = graph.insertVertex(parent, null, getCellNode('EndRetry', 'retryEnd', parentCell.id), 0, 0, 75, 75, 'retry');
      } else if (name === 'Lock') {
        label1 = 'lock';
        label2 = 'endLock';
        v2 = graph.insertVertex(parent, null, getCellNode('EndLock', 'lockEnd', parentCell.id), 0, 0, 68, 68, 'lock');
      } else if (name === 'Cycle') {
        label1 = 'cycle';
        label2 = 'endCycle';
        v2 = graph.insertVertex(parent, null, getCellNode('EndCycle', 'cycleEnd', parentCell.id), 0, 0, 75, 75, 'cycle');
      } else if (name === 'ForkList') {
        label1 = 'forkList';
        label2 = 'endForkList';
        v2 = graph.insertVertex(parent, null, getCellNode('EndForkList', 'forkListEnd', parentCell.id), 0, 0, 68, 68, 'closeForkList');
      }

      if (cell) {
        if (cell.edges) {
          for (let i = 0; i < cell.edges.length; i++) {
            if (cell.edges[i].target && cell.edges[i].target.id === cell.id) {
              _sour = cell.edges[i];
            }
            if (cell.edges[i].source && cell.edges[i].source.id === cell.id) {
              _tar = cell.edges[i];
            }
          }
          if (self.workflowService.isInstructionCollapsible(cell.value.tagName)) {
            _tar = getEndNode(cell);
            _middle = _tar.source;
          } else {
            _middle = cell;
          }

        }
      } else {
        cell = cells.firstCell;
        for (let i = 0; i < cell.edges.length; i++) {
          if (cell.edges[i].target.id === cell.id) {
            _sour = cell.edges[i];
            break;
          }
        }
        const lastCellName = cells.lastCell.value.tagName;
        if (self.workflowService.isInstructionCollapsible(lastCellName)) {
          _tar = getEndNode(cells.lastCell);
          _middle = _tar.source;
        } else {
          for (let i = 0; i < cells.lastCell.edges.length; i++) {
            if (cells.lastCell.edges[i].source && cells.lastCell.edges[i].source.id === cells.lastCell.id) {
              _tar = cells.lastCell.edges[i];

              break;
            }
          }
          _middle = cells.lastCell;
        }
      }
      connectExtraNodes(parentCell, v2, parent, _sour, _tar);
      graph.insertEdge(parent, null, getConnectionNode(label1), parentCell, cell);
      graph.insertEdge(parent, null, getConnectionNode(label2), _middle, v2);
      return {
        _sour, _tar
      };
    }

    /**
     * Function: Move selected cell into dropped cell
     */
    function moveSelectedCellToDroppedCell(cell, parentCell, cells): void {
      const cellName = parentCell.value.tagName;
      let parent;
      if (cell) {
        parent = cell.getParent();
      } else {
        parent = cells.firstCell.getParent();
      }
      let _sour, _tar;
      if (cellName === 'Try') {
        let v2, v3, _middle;
        v2 = graph.insertVertex(parent, null, getCellNode('EndTry', 'tryEnd', parentCell.id), 0, 0, 75, 75, 'try');
        v3 = graph.insertVertex(parent, null, getCellNode('Catch', 'catch', parentCell.id), 0, 0, 100, 40, 'dashRectangle');
        if (cell) {
          if (cell.edges) {
            for (let i = 0; i < cell.edges.length; i++) {
              if (cell.edges[i].target.id === cell.id) {
                _sour = cell.edges[i];
              }
              if (cell.edges[i].source.id === cell.id) {
                _tar = cell.edges[i];
              }
            }
            if (self.workflowService.isInstructionCollapsible(cell.value.tagName)) {
              _tar = getEndNode(cell);
              _middle = _tar.source;
            } else {
              _middle = cell;
            }

          }
        } else {
          cell = cells.firstCell;
          for (let i = 0; i < cell.edges.length; i++) {
            if (cell.edges[i].target.id === cell.id) {
              _sour = cell.edges[i];
              break;
            }
          }
          const lastCellName = cells.lastCell.value.tagName;
          if (self.workflowService.isInstructionCollapsible(lastCellName)) {
            _tar = getEndNode(cells.lastCell);
            _middle = _tar.source;
          } else {
            for (let i = 0; i < cells.lastCell.edges.length; i++) {
              if (cells.lastCell.edges[i].source.id === cells.lastCell.id) {
                _tar = cells.lastCell.edges[i];

                break;
              }
            }
            _middle = cells.lastCell;
          }
        }
        connectExtraNodes(parentCell, v2, parent, _sour, _tar);
        graph.insertEdge(parent, null, getConnectionNode('try'), parentCell, cell);
        graph.insertEdge(parent, null, getConnectionNode('try'), _middle, v3);
        graph.insertEdge(parent, null, getConnectionNode('endTry'), v3, v2);
      } else if (cellName === 'If' || cellName === 'Fork' || cellName === 'ForkList' || cellName === 'Retry' || cellName === 'Lock' || cellName === 'Cycle') {
        const obj = getLastNodeAndConnect(cellName, parent, parentCell, cell, cells);
        _sour = obj._sour;
        _tar = obj._tar;
      }
      if (_sour && _tar) {
        graph.getModel().remove(_sour);
        graph.getModel().remove(_tar);
      }
      if(!self.implicitSave) {
        self.xmlToJsonParser();
      }
      self.updateXMLJSON(true);
    }

    /**
     * Function to connect new node with existing connections
     */
    function connectExtraNodes(v1, v2, parent, _sour, _tar): void {
      let l1 = '', l2 = '';
      if (_sour && _sour.value) {
        const attrs = clone(_sour.value.attributes);
        if (attrs) {
          for (let i = 0; i < attrs.length; i++) {
            if (attrs[i].nodeName === 'type') {
              l1 = attrs[i].nodeValue;
            }
          }
        }
      }

      if (_tar && _tar.value) {
        const attrs2 = clone(_tar.value.attributes);
        if (attrs2) {
          for (let i = 0; i < attrs2.length; i++) {
            if (attrs2[i].nodeName === 'type') {
              l2 = attrs2[i].nodeValue;
            }
          }
        }
      }
      if (_sour && _tar) {
        graph.insertEdge(parent, null, getConnectionNode(l1), _sour.source, v1);
        graph.insertEdge(parent, null, getConnectionNode(l2), v2, _tar.target);
      }
    }

    /**
     * Get end node of If/Fork/Try/Retry/Lock/Cycle/ForkList
     */
    function getEndNode(cell): any {
      let targetNode = {};

      function recursive(target): void {
        const edges = target.edges;
        if (checkClosedCellWithSourceCell(cell, target)) {

          const attrs = target.value.attributes;
          if (attrs) {
            for (let i = 0; i < attrs.length; i++) {
              if (attrs[i].nodeName === 'targetId' && attrs[i].nodeValue === cell.id) {
                for (let x = 0; x < edges.length; x++) {
                  if (edges[x].target.id !== target.id) {
                    targetNode = edges[x];
                    break;
                  }
                }
                break;
              }
            }
          }
        }
        if (edges && edges.length > 0) {
          for (let j = 0; j < edges.length; j++) {
            if (edges[j].target) {
              if (edges[j].target.id !== target.id) {
                if (checkClosedCellWithSourceCell(cell, edges[j].target)) {
                  const attrs = edges[j].target.value.attributes;
                  if (attrs) {
                    for (let i = 0; i < attrs.length; i++) {
                      if (attrs[i].nodeName === 'targetId' && (attrs[i].nodeValue === cell.id || attrs[i].nodeValue === target.id)) {
                        const _edges = edges[j].target.edges;
                        for (let x = 0; x < _edges.length; x++) {
                          if (_edges[x].target.id !== edges[j].target.id) {
                            targetNode = _edges[x];
                            break;
                          }
                        }
                        break;
                      }
                    }
                  }
                } else {
                  if (edges[j].target) {
                    if (_iterateId !== edges[j].target.id) {
                      _iterateId = edges[j].target.id;
                      recursive(edges[j].target);
                    }
                  }
                }
              }
            }
          }
          if (!targetNode) {
            for (let i = 0; i < edges.length; i++) {
              if (edges[i] && edges[i].target) {
                if (_iterateId !== edges[i].target.id) {
                  _iterateId = edges[i].target.id;
                  recursive((edges[i].target));
                }
                break;
              }
            }
          }
        }
      }

      recursive(cell);
      return targetNode;
    }

    function initGraph(): void {
      const model = graph.getModel();
      if (model.root) {
        if (model.root.children) {
          for (const i in model.root.children) {
            if (model.root.children[i].children) {
              for (const j in model.root.children[i].children) {
                if (model.root.children[i].children[j].value && model.root.children[i].children[j].value.tagName) {
                  const tagName = model.root.children[i].children[j].value.tagName;
                  if (!tagName.match(/Connector/) && !tagName.match(/Connection/) && !tagName.match(/Process/)) {
                    graph.setEnabled(true);
                    break;
                  }
                }
              }
            }
          }
        }
      }
    }

    /**
     * Create new connection object
     */
    function getConnectionNode(label: string): any {
      // Create new Connection object
      const connNode = doc.createElement('Connection');
      let str = label, type = label;
      if (label.substring(0, 6) === '$TYPE$') {
        type = 'branch';
        str = label.substring(6);
      }
      connNode.setAttribute('label', str);
      connNode.setAttribute('type', type);
      return connNode;
    }

    /**
     * Create new Node object
     */
    function getCellNode(name: string, label: string, id: any): any {
      // Create new node object
      const _node = doc.createElement(name);
      _node.setAttribute('label', label);
      if (id) {
        _node.setAttribute('targetId', id);
      }
      return _node;
    }

    /**
     * change label of EndIf and Join
     */
    function changeLabelOfConnection(cell, data): void {
      graph.getModel().beginUpdate();
      try {
        const label = new mxCellAttributeChange(
          cell, 'label',
          data);
        const type = new mxCellAttributeChange(
          cell, 'type',
          data);
        graph.getModel().execute(label);
        graph.getModel().execute(type);
      } finally {
        graph.getModel().endUpdate();
        self.skipXMLToJSONConversion = false;
      }
    }

    function checkConnectionLabel(cell, _dropTarget, isChange): void {
      graph.getModel().beginUpdate();
      try {
        const uuid = new mxCellAttributeChange(
          cell, 'uuid', self.workflowService.create_UUID()
        );
        graph.getModel().execute(uuid);
      } finally {
        graph.getModel().endUpdate();
      }
      if (!isChange) {
        const label = _dropTarget.getAttribute('type') || _dropTarget.getAttribute('label');
        if (label && (label === 'join' || label === 'branch' || label === 'endIf'
          || label === 'endRetry' || label === 'endCycle' || label === 'endTry' || label === 'endLock')) {
          let _label1, _label2;
          if (label === 'join') {
            _label1 = 'join';
            _label2 = 'branch';
          } else if (label === 'branch') {
            _label1 = 'branch';
            _label2 = 'branch';
          } else if (label === 'endIf') {
            _label1 = 'endIf';
            _label2 = 'endIf';
          } else if (label === 'endRetry') {
            _label1 = 'endRetry';
            _label2 = 'endRetry';
          } else if (label === 'endCycle') {
            _label1 = 'endCycle';
            _label2 = 'endCycle';
          } else if (label === 'endLock') {
            _label1 = 'endLock';
            _label2 = 'endLock';
          } else if (label === 'try') {
            _label1 = 'try';
            _label2 = 'try';
          } else if (label === 'endTry') {
            _label1 = 'endTry';
            _label2 = 'endTry';
          }
          for (let i = 0; i < cell.edges.length; i++) {
            if (cell.edges[i].target !== cell.id) {
              if (self.workflowService.checkClosingCell(cell.edges[i].target.value.tagName)) {
                if (cell.edges[i].target.edges) {
                  for (let j = 0; j < cell.edges[i].target.edges.length; j++) {
                    if (cell.edges[i].target.edges[j] && cell.edges[i].target.edges[j].target.id !== cell.edges[i].target.id) {
                      changeLabelOfConnection(cell.edges[i].target.edges[j], _label1);
                      break;
                    }
                  }
                }
              } else if (self.workflowService.isInstructionCollapsible(cell.edges[i].target.value.tagName)) {
                changeLabelOfConnection(cell.edges[i], _label2);
              } else if (cell.edges[i].target.value.tagName === 'Catch') {
                changeLabelOfConnection(cell.edges[i], 'try');
              }
            }
          }
        }
      } else {
        if (cell.edges) {
          let _tempCell: any;
          for (let i = 0; i < cell.edges.length; i++) {
            if (_tempCell) {
              if (cell.edges[i].target !== cell.id) {
                if (cell.edges[i].target.value.tagName === 'Join') {
                  changeLabelOfConnection(_tempCell, 'branch');
                  changeLabelOfConnection(cell.edges[i], 'join');
                } else if (cell.edges[i].target.value.tagName === 'EndIf') {
                  changeLabelOfConnection(cell.edges[i], 'endIf');
                } else if (cell.edges[i].target.value.tagName === 'EndRetry') {
                  changeLabelOfConnection(cell.edges[i], 'endRetry');
                } else if (cell.edges[i].target.value.tagName === 'EndCycle') {
                  changeLabelOfConnection(cell.edges[i], 'endCycle');
                } else if (cell.edges[i].target.value.tagName === 'EndLock') {
                  changeLabelOfConnection(cell.edges[i], 'endLock');
                } else if (cell.edges[i].target.value.tagName === 'EndTry') {
                  changeLabelOfConnection(cell.edges[i], 'endTry');
                }
              }
            }
            if (cell.edges[i].source !== cell.id) {
              if (self.workflowService.checkClosingCell(cell.edges[i].source.value.tagName)) {
                _tempCell = cell.edges[i];
              }
            }

            if (_dropTarget.getAttribute('type')) {
              const typeAttr = _dropTarget.getAttribute('type');
              if (((typeAttr === 'join') && cell.edges[i].id !== _dropTarget.id)) {
                changeLabelOfConnection(cell.edges[i], 'branch');
              } else if (((typeAttr === 'endIf') && cell.edges[i].id !== _dropTarget.id)) {
                changeLabelOfConnection(cell.edges[i], '');
              } else if (((typeAttr === 'endRetry') && cell.edges[i].id !== _dropTarget.id)) {
                changeLabelOfConnection(cell.edges[i], '');
              } else if (((typeAttr === 'endCycle') && cell.edges[i].id !== _dropTarget.id)) {
                changeLabelOfConnection(cell.edges[i], '');
              } else if (((typeAttr === 'endLock') && cell.edges[i].id !== _dropTarget.id)) {
                changeLabelOfConnection(cell.edges[i], '');
              } else if (((typeAttr === 'endTry') && cell.edges[i].id !== _dropTarget.id)) {
                changeLabelOfConnection(cell.edges[i], '');
              }
            }
            if (cell.id !== cell.edges[i].target.id) {
              const attrs = cell.edges[i].value.attributes;
              if (attrs) {
                if (attrs[0].value && (attrs[0].value === 'then' || attrs[0].value === 'else')) {
                  graph.getModel().beginUpdate();
                  try {
                    const label = new mxCellAttributeChange(
                      cell.edges[i], 'label',
                      '');
                    const type = new mxCellAttributeChange(
                      cell.edges[i], 'type',
                      '');
                    graph.getModel().execute(label);
                    graph.getModel().execute(type);
                  } finally {
                    graph.getModel().endUpdate();
                  }
                }
              }
            } else if (cell.id !== cell.edges[i].source.id) {
              const attrs = cell.edges[i].value.attributes;
              if (attrs && attrs.length > 0) {
                if (attrs[0].value === 'If') {
                  if (cell.edges[i].target.value.tagName !== 'If' && cell.edges[i].source.value.tagName !== 'If' && cell.value.tagName !== 'If') {
                    graph.getModel().beginUpdate();
                    try {
                      const label = new mxCellAttributeChange(
                        cell.edges[i], 'label',
                        '');
                      const type = new mxCellAttributeChange(
                        cell.edges[i], 'type',
                        '');
                      graph.getModel().execute(label);
                      graph.getModel().execute(type);
                    } finally {
                      graph.getModel().endUpdate();
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    function updateProperties(obj): void {
      if (self.selectedNode && self.selectedNode.cell) {
        graph.getModel().beginUpdate();
        let flag = true;
        try {
          if (self.selectedNode.type === 'Job') {
            flag = self.updateJobProperties(self.selectedNode);
            const edit = new mxCellAttributeChange(
              obj.cell, 'jobName', self.selectedNode.newObj.jobName || 'job');
            graph.getModel().execute(edit);
            const edit2 = new mxCellAttributeChange(
              obj.cell, 'label', self.selectedNode.newObj.label);
            graph.getModel().execute(edit2);
            const edit3 = new mxCellAttributeChange(
              obj.cell, 'defaultArguments', JSON.stringify(self.selectedNode.newObj.defaultArguments));
            graph.getModel().execute(edit3);
          } else if (self.selectedNode.type === 'AddOrder') {
            if (self.selectedNode.newObj.workflow) {
              const argu: any = {};
              if ((self.selectedNode.newObj.arguments && self.selectedNode.newObj.arguments.length > 0) ||
                (self.selectedNode.newObj.forkListArguments && self.selectedNode.newObj.forkListArguments.length > 0)) {
                if ((self.selectedNode.newObj.arguments && self.selectedNode.newObj.arguments.length > 0)) {
                  argu.arguments = self.coreService.clone(self.selectedNode.newObj.arguments);
                  argu.arguments.forEach((item) => {
                    self.coreService.addSlashToString(item, 'value');
                  });
                  self.coreService.convertArrayToObject(argu, 'arguments', true);
                } else {
                  argu.arguments = {};
                }
                if (self.selectedNode.newObj.forkListArguments) {
                  self.selectedNode.newObj.forkListArguments.forEach((item) => {
                    argu.arguments[item.name] = [];
                    if (item.actualList) {
                      for (const i in item.actualList) {
                        const listObj = {};
                        item.actualList[i].forEach((data) => {
                          if (!data.value) {
                          } else {
                            self.coreService.addSlashToString(data, 'value');
                            listObj[data.name] = data.value;
                          }
                        });
                        if (!isEmpty(listObj)) {
                          argu.arguments[item.name].push(listObj);
                        }
                      }
                    }
                  });
                }
              } else {
                argu.arguments = {};
              }

              const edit = new mxCellAttributeChange(
                obj.cell, 'arguments', JSON.stringify(argu.arguments));
              graph.getModel().execute(edit);
            }
            const edit3 = new mxCellAttributeChange(
              obj.cell, 'workflowName', self.selectedNode.newObj.workflowName);
            graph.getModel().execute(edit3);
            const edit4 = new mxCellAttributeChange(
              obj.cell, 'remainWhenTerminated', self.selectedNode.newObj.remainWhenTerminated);
            graph.getModel().execute(edit4);
          } else if (self.selectedNode.type === 'If') {
            const predicate = self.selectedNode.newObj.predicate;
            self.validatePredicate(predicate, null, false);
            const edit = new mxCellAttributeChange(
              obj.cell, 'predicate', predicate);
            graph.getModel().execute(edit);
          } else if (self.selectedNode.type === 'Retry') {
            const edit = new mxCellAttributeChange(
              obj.cell, 'maxTries', self.selectedNode.newObj.maxTries);
            graph.getModel().execute(edit);
            let str = '';
            if (self.selectedNode.newObj.retryDelays && self.selectedNode.newObj.retryDelays.length > 0) {
              self.selectedNode.newObj.retryDelays = self.selectedNode.newObj.retryDelays.forEach((item, index) => {
                str += self.workflowService.convertStringToDuration(item.value, true);
                if (self.selectedNode.newObj.retryDelays.length - 1 !== index) {
                  str += ', ';
                }
              });
            }
            const edit2 = new mxCellAttributeChange(
              obj.cell, 'retryDelays', str);
            graph.getModel().execute(edit2);
          } else if (self.selectedNode.type === 'Cycle') {
            if (self.selectedNode.obj.schedule) {
              if (self.selectedNode.data.schedule && self.selectedNode.data.schedule.admissionTimeScheme) {
                let flag1 = true;
                if (self.selectedNode.repeatObject.TYPE === 'Periodic') {
                  if (!self.selectedNode.repeatObject.period) {
                    flag1 = false;
                  }
                } else if (self.selectedNode.repeatObject.TYPE === 'Continuous') {
                  if (!self.selectedNode.repeatObject.pause) {
                    flag1 = false;
                  }

                } else if (self.selectedNode.repeatObject.TYPE === 'Ticking') {
                  if (!self.selectedNode.repeatObject.interval) {
                    flag1 = false;
                  }
                }
                if (flag1) {
                  if (self.selectedNode.data.periodList) {
                    self.selectedNode.data.schedule.admissionTimeScheme.periods = convertListToAdmissionTime(self.selectedNode.data.periodList);
                  }
                  if (!self.selectedNode.isEdit) {
                    self.selectedNode.obj.schedule.schemes.push({
                      repeat: self.workflowService.convertRepeatObject(self.selectedNode.repeatObject),
                      admissionTimeScheme: self.selectedNode.data.schedule.admissionTimeScheme
                    });
                  } else {
                    if (self.selectedNode.repeatObject.index || self.selectedNode.repeatObject.index === 0) {
                      self.selectedNode.obj.schedule.schemes[self.selectedNode.repeatObject.index].repeat = self.workflowService.convertRepeatObject(self.selectedNode.repeatObject);
                    }
                  }
                }
              }
              const edit = new mxCellAttributeChange(
                obj.cell, 'schedule', JSON.stringify(self.selectedNode.obj.schedule));
              graph.getModel().execute(edit);
            }
          } else if (self.selectedNode.type === 'ForkList') {
            const edit = new mxCellAttributeChange(
              obj.cell, 'children', self.selectedNode.newObj.children);
            graph.getModel().execute(edit);
            const edit2 = new mxCellAttributeChange(
              obj.cell, 'childToId', self.selectedNode.newObj.childToId);
            graph.getModel().execute(edit2);
            const edit3 = new mxCellAttributeChange(
              obj.cell, 'joinIfFailed', self.selectedNode.newObj.joinIfFailed);
            graph.getModel().execute(edit3);
          } else if (self.selectedNode.type === 'Lock') {
            let count = '';
            if (self.selectedNode.newObj.countProperty === 'shared') {
              count = self.selectedNode.newObj.count;
            }
            const edit = new mxCellAttributeChange(
              obj.cell, 'count', count);
            graph.getModel().execute(edit);
            const edit2 = new mxCellAttributeChange(
              obj.cell, 'lockName', self.selectedNode.newObj.lockName);
            graph.getModel().execute(edit2);
          } else if (self.selectedNode.type === 'Fail') {
            const edit = new mxCellAttributeChange(
              obj.cell, 'outcome', JSON.stringify(self.selectedNode.newObj.outcome));
            graph.getModel().execute(edit);
            const edit2 = new mxCellAttributeChange(
              obj.cell, 'message', self.selectedNode.newObj.message);
            graph.getModel().execute(edit2);
            const edit3 = new mxCellAttributeChange(
              obj.cell, 'uncatchable', self.selectedNode.newObj.uncatchable);
            graph.getModel().execute(edit3);
          } else if (self.selectedNode.type === 'ExpectNotice' || self.selectedNode.type === 'PostNotice') {
            const edit1 = new mxCellAttributeChange(
              obj.cell, 'noticeBoardName', self.selectedNode.newObj.noticeBoardName);
            graph.getModel().execute(edit1);
          } else if (self.selectedNode.type === 'Prompt') {
            self.coreService.addSlashToString(self.selectedNode.newObj, 'question');
            const edit = new mxCellAttributeChange(
              obj.cell, 'question', self.selectedNode.newObj.question);
            graph.getModel().execute(edit);
          } else if (self.selectedNode.type === 'Fork') {
            const editJoin = new mxCellAttributeChange(
              obj.cell, 'joinIfFailed', self.selectedNode.newObj.joinIfFailed);
            graph.getModel().execute(editJoin);
            const edges = graph.getOutgoingEdges(obj.cell);
            for (let i = 0; i < edges.length; i++) {
              for (let j = 0; j < self.selectedNode.newObj.branches.length; j++) {
                if (self.selectedNode.newObj.branches[i].id && edges[i].id) {
                  const edit = new mxCellAttributeChange(
                    edges[i], 'label', self.selectedNode.newObj.branches[i].label || self.selectedNode.obj.branches[i].label);
                  graph.getModel().execute(edit);
                  if (self.selectedNode.newObj.branches[i].result && self.selectedNode.newObj.branches[i].result.length > 0) {
                    self.selectedNode.newObj.branches[i].result = self.selectedNode.newObj.branches[i].result.filter((argu) => {
                      self.coreService.addSlashToString(argu, 'value');
                      return !argu.invalid;
                    });
                    self.coreService.convertArrayToObject(self.selectedNode.newObj.branches[i], 'result', true);
                    if (self.selectedNode.newObj.branches[i].result) {
                      const edit2 = new mxCellAttributeChange(
                        edges[i], 'result', JSON.stringify(self.selectedNode.newObj.branches[i].result));
                      graph.getModel().execute(edit2);
                    }
                  } else {
                    const edit2 = new mxCellAttributeChange(
                      edges[i], 'result', null);
                    graph.getModel().execute(edit2);
                  }
                  break;
                }
              }
            }
          }
        } finally {
          graph.getModel().endUpdate();
          if (flag) {
            self.updateJobs(graph, false);
          }
        }
      }
    }

    function convertListToAdmissionTime(list): Array<any> {
      const arr = [];
      list.forEach((item) => {
        if (item.periods) {
          item.periods.forEach((period) => {
            if (!period.startTime) {
              period.startTime = 0;
            }
            const obj: any = {
              TYPE: item.frequency ? 'WeekdayPeriod' : 'DailyPeriod'
            };
            if (obj.TYPE === 'DailyPeriod') {
              obj.secondOfDay = ((item.secondOfWeek || item.secondOfDay || 0) + period.startTime);
            } else {
              obj.secondOfWeek = ((item.secondOfWeek || item.secondOfDay || 0) + period.startTime);
            }
            obj.duration = period.duration;
            arr.push(obj);
          });
        }
      });

      return arr;
    }

    /**
     * Updates the properties panel
     */
    function selectionChanged(): void {
      if (self.selectedNode && self.permission.joc && self.permission.joc.inventory.manage) {
        if (self.selectedNode.type === 'Job' && self.selectedNode.periodList) {
          if (!self.selectedNode.job.admissionTimeScheme) {
            self.selectedNode.job.admissionTimeScheme = {};
          }
          self.selectedNode.job.admissionTimeScheme.periods = convertListToAdmissionTime(self.selectedNode.periodList);
        }
        self.cutOperation();
        self.error = false;
        self.dataService.reloadWorkflowError.next({error: self.error});
        self.selectedNode.newObj = self.coreService.clone(self.selectedNode.obj);
        if (self.selectedNode && self.selectedNode.type === 'Job') {
          self.coreService.convertArrayToObject(self.selectedNode.newObj, 'defaultArguments', false);
        }
        if (self.selectedNode.type === 'If') {
          self.selectedNode.newObj.predicate = self.selectedNode.newObj.predicate.replace(/<[^>]+>/gm, '').replace(/&amp;/g, '&').replace(/&gt;/g, '>').replace(/&lt;/g, '<')
            .replace(/&nbsp;/g, ' ').replace(/&#39;/g, '\'').replace('\n', '').replace('\r', '');
        }

        let isChange = true;
        if (isEqual(JSON.stringify(self.selectedNode.newObj), JSON.stringify(self.selectedNode.actualValue))) {
          isChange = false;
          if (self.selectedNode.type === 'Job') {
            let _job;
            for (let i = 0; i < self.jobs.length; i++) {
              if (self.selectedNode.job.jobName === self.jobs[i].name) {
                _job = self.jobs[i].value;
                break;
              }
            }
            if (_job) {
              const job = self.coreService.clone(self.selectedNode.job);
              delete job.jobName;
              if (job.defaultArguments) {
                self.coreService.convertArrayToObject(job, 'defaultArguments', true);
              }
              if (job.executable && job.executable.arguments) {
                self.coreService.convertArrayToObject(job.executable, 'arguments', true);
              }
              if (job.executable && job.executable.jobArguments) {
                self.coreService.convertArrayToObject(job.executable, 'jobArguments', true);
              }
              if (job.executable && job.executable.env) {
                self.coreService.convertArrayToObject(job.executable, 'env', true);
              }
              if (job.executable.returnCodeMeaning && !isEmpty(job.executable.returnCodeMeaning)) {
                if (job.executable.returnCodeMeaning.success && typeof job.executable.returnCodeMeaning.success == 'string') {
                  job.executable.returnCodeMeaning.success = job.executable.returnCodeMeaning.success.split(',').map(Number);
                  delete job.executable.returnCodeMeaning.failure;
                } else if (job.executable.returnCodeMeaning.failure && typeof job.executable.returnCodeMeaning.failure == 'string') {
                  job.executable.returnCodeMeaning.failure = job.executable.returnCodeMeaning.failure.split(',').map(Number);
                  delete job.executable.returnCodeMeaning.success;
                }
                if (job.executable.returnCodeMeaning.failure === '') {
                  delete job.executable.returnCodeMeaning.failure;
                }
                if (job.executable.returnCodeMeaning.success === '' && !job.executable.returnCodeMeaning.failure) {
                  job.executable.returnCodeMeaning = {};
                }
              }
              if (job.executable && isEmpty(job.executable.login)) {
                delete job.executable.login;
              }
              if (job.notification && isEmpty(job.notification.mail)) {
                if (!job.notification.types || job.notification.types.length === 0) {
                  delete job.notification;
                } else {
                  delete job.notification.mail;
                }
              }
              if (!job.defaultArguments || typeof job.defaultArguments === 'string' || job.defaultArguments.length === 0) {
                delete job.defaultArguments;
              }
              if (job.executable && (!job.executable.arguments || typeof job.executable.arguments === 'string' || job.executable.arguments.length === 0)) {
                delete job.executable.arguments;
              }
              if (job.executable && (!job.executable.jobArguments || typeof job.executable.jobArguments === 'string' || job.executable.jobArguments.length === 0)) {
                delete job.executable.jobArguments;
              }
              if (job.executable && (!job.executable.env || typeof job.executable.env === 'string' || job.executable.env.length === 0)) {
                delete job.executable.env;
              }
              if (job.executable.returnCodeMeaning) {
                if (job.executable.returnCodeMeaning && job.executable.returnCodeMeaning.success == '0') {
                  delete job.executable.returnCodeMeaning;
                }
              }
              if (!isEqual(JSON.stringify(_job), JSON.stringify(job))) {
                isChange = true;
              }
            } else {
              isChange = true;
            }
          }
        }
        if (isChange) {
          updateProperties(self.selectedNode);
        }
      }

      // Gets the selection cell
      const cell = graph.getSelectionCell();
      if (cell == null) {
        self.selectedNode = null;
      } else {
        if (cell.value.tagName === 'Try' || cell.value.tagName === 'Catch' || cell.value.tagName === 'Finish') {
          self.selectedNode = null;
          self.ref.detectChanges();
          return;
        }

        const obj: any = {};
        let job: any;
        if (cell.value.tagName === 'Job') {
          obj.jobName = cell.getAttribute('jobName');
          obj.label = cell.getAttribute('label');
          obj.defaultArguments = cell.getAttribute('defaultArguments');
          if (!obj.defaultArguments || isEmpty(obj.defaultArguments) || typeof obj.defaultArguments !== 'string') {
            obj.defaultArguments = {};
          } else {
            obj.defaultArguments = JSON.parse(obj.defaultArguments);
          }
          job = {
            jobName: obj.jobName
          };
        } else if (cell.value.tagName === 'AddOrder') {
          let argument = cell.getAttribute('arguments');
          if (!argument) {
            argument = [];
          } else {
            argument = JSON.parse(argument);
            argument = self.coreService.convertObjectToArray({argument}, 'argument');
            argument.filter((arg) => {
              if (isArray(arg.value)) {
                arg.value.forEach((item, index) => {
                  for (const prop in arg.value[index]) {
                    self.coreService.removeSlashToString(arg.value[index], prop, true);
                  }
                });
              }
              self.coreService.removeSlashToString(arg, 'value', true);
            });
          }
          obj.arguments = argument;
          obj.argumentList = [];
          obj.workflowName = cell.getAttribute('workflowName');
          const val1 = cell.getAttribute('remainWhenTerminated');
          obj.remainWhenTerminated = val1 == 'true';
        } else if (cell.value.tagName === 'If') {
          obj.predicate = cell.getAttribute('predicate');
        } else if (cell.value.tagName === 'Retry') {
          obj.maxTries = cell.getAttribute('maxTries');
          obj.retryDelays = cell.getAttribute('retryDelays');
          if (obj.retryDelays && typeof obj.retryDelays == 'string') {
            const arr = obj.retryDelays.split(',');
            obj.retryDelays = [];
            arr.forEach((item) => {
              obj.retryDelays.push({value: self.workflowService.convertDurationToHour(item) || '0s'});
            });
          } else {
            obj.retryDelays = [];
          }
        } else if (cell.value.tagName === 'Cycle') {
          obj.schedule = cell.getAttribute('schedule');
          if (!obj.schedule || isEmpty(obj.schedule) || typeof obj.schedule !== 'string') {
            obj.schedule = {};
          } else {
            try {
              obj.schedule = JSON.parse(obj.schedule);
            } catch (e) {
              obj.schedule = {};
            }
          }
        } else if (cell.value.tagName === 'ForkList') {
          obj.children = cell.getAttribute('children');
          obj.childToId = cell.getAttribute('childToId');
          obj.joinIfFailed = cell.getAttribute('joinIfFailed');
          obj.joinIfFailed = obj.joinIfFailed == 'true';
        } else if (cell.value.tagName === 'Lock') {
          obj.count = cell.getAttribute('count');
          if (obj.count) {
            obj.count = parseInt(obj.count, 10);
          }
          obj.lockName = cell.getAttribute('lockName');
          obj.countProperty = obj.count ? 'shared' : 'exclusive';
        } else if (cell.value.tagName === 'Fail') {
          let outcome = cell.getAttribute('outcome');
          if (!outcome) {
            outcome = {
              returnCode: 0
            };
          } else {
            outcome = JSON.parse(outcome);
          }
          obj.outcome = outcome;
          obj.message = cell.getAttribute('message');
          obj.uncatchable = cell.getAttribute('uncatchable');
          obj.uncatchable = obj.uncatchable == 'true';
        } else if (cell.value.tagName === 'ExpectNotice' || cell.value.tagName === 'PostNotice') {
          obj.noticeBoardName = cell.getAttribute('noticeBoardName');
        } else if (cell.value.tagName === 'Prompt') {
          obj.question = cell.getAttribute('question');
          self.coreService.removeSlashToString(obj, 'question');
        } else if (cell.value.tagName === 'Fork') {
          obj.joinIfFailed = cell.getAttribute('joinIfFailed');
          obj.joinIfFailed = obj.joinIfFailed == 'true';
          const edges = graph.getOutgoingEdges(cell);
          obj.branches = [];
          for (let i = 0; i < edges.length; i++) {
            if (edges[i].target.value.tagName !== 'Join') {
              let resultObj = edges[i].getAttribute('result');
              if (resultObj) {
                resultObj = JSON.parse(resultObj);
                resultObj = self.coreService.convertObjectToArray({result: resultObj}, 'result');
                resultObj.filter((arg) => {
                  self.coreService.removeSlashToString(arg, 'value', true);
                });
              } else {
                resultObj = [];
              }
              obj.branches.push({id: edges[i].id, label: edges[i].getAttribute('label'), result: resultObj});
            }
          }
        }

        self.selectedNode = {
          type: cell.value.tagName,
          obj, cell,
          job,
          actualValue: self.coreService.clone(obj)
        };
        if (cell.value.tagName === 'Lock') {
          self.getLimit();
        } else if (cell.value.tagName === 'AddOrder') {
          self.getWorkflow();
        } else if (cell.value.tagName === 'ForkList') {
          self.getListOfVariables(obj);
        }
      }
      self.ref.detectChanges();
    }

    /**
     * Function: paste the instruction to given target
     */
    function pasteInstruction(target): void {
      let source = target.id;

      if (target.value.tagName === 'Connection') {
        if (self.workflowService.checkClosingCell(target.source.value.tagName)) {
          source = target.source.value.getAttribute('targetId');
        } else {
          source = target.source.id;
        }
      }

      let copyObject: any, targetObject: any, targetIndex = 0, isCatch = false;
      if (!self.copyId) {
        copyObject = self.coreService.clone(self.inventoryConf.copiedInstuctionObject);
        delete copyObject.jobObject;
      }
      if (target.value.tagName === 'Process') {
        if (self.workflow.configuration && !self.workflow.configuration.instructions) {
          self.workflow.configuration.instructions = [];
        }
      }

      function getObject(json) {
        if (json.instructions) {
          for (let x = 0; x < json.instructions.length; x++) {
            if (copyObject && targetObject) {
              break;
            }
            if (json.instructions[x].uuid == self.copyId) {
              copyObject = self.coreService.clone(json.instructions[x]);
              delete copyObject.uuid;
            }
            if (json.instructions[x].id == source) {
              targetObject = json;
              targetIndex = x;
            }
            if (json.instructions[x].instructions) {
              getObject(json.instructions[x]);
            }
            if (json.instructions[x].catch) {
              if (json.instructions[x].catch.id == source) {
                targetObject = json;
                targetIndex = x;
                isCatch = true;
              }
              if (json.instructions[x].catch.instructions && json.instructions[x].catch.instructions.length > 0) {
                getObject(json.instructions[x].catch);
              }
            }
            if (json.instructions[x].then) {
              getObject(json.instructions[x].then);
            }
            if (json.instructions[x].else) {
              getObject(json.instructions[x].else);
            }
            if (json.instructions[x].branches) {
              for (let i = 0; i < json.instructions[x].branches.length; i++) {
                getObject(json.instructions[x].branches[i]);
              }
            }
          }
        }
      }

      function _dropOnObject() {
        const targetObj = targetObject.instructions[targetIndex];
        if (target.value.tagName === 'If') {
          if (!targetObj.then) {
            targetObj.then = {instructions: [copyObject]};
          } else if (!targetObj.else) {
            targetObj.else = {instructions: [copyObject]};
          }
        } else if (target.value.tagName === 'Fork') {
          let branchId;
          if (!targetObj.branches) {
            targetObj.branches = [];
          }
          branchId = 'branch' + (targetObj.branches.length + 1);
          targetObj.branches.push({id: branchId, instructions: [copyObject]});
        } else if (target.value.tagName === 'Retry' || target.value.tagName === 'Lock' || target.value.tagName === 'Cycle') {
          if (!targetObj.instructions) {
            targetObj.instructions = [];
          }
          targetObj.instructions.push(copyObject);
        } else if (target.value.tagName === 'ForkList') {
          if (!targetObj.instructions) {
            targetObj.instructions = [];
          }
          targetObj.instructions.push(copyObject);
        } else if (target.value.tagName === 'Try' && !isCatch) {
          if (!targetObj.instructions) {
            targetObj.instructions = [];
          }
          targetObj.instructions.push(copyObject);
        } else if (isCatch) {
          if (!targetObj.catch.instructions) {
            targetObj.catch.instructions = [];
          }
          targetObj.catch.instructions.push(copyObject);
        }
      }

      if (self.workflow.configuration && self.workflow.configuration.instructions && self.workflow.configuration.instructions.length > 0) {
        getObject(self.workflow.configuration);
      }

      if (!targetObject) {
        targetIndex = -1;
        targetObject = self.workflow.configuration;
      }
      if (copyObject) {
        generateCopyObject(copyObject);
        if (copyObject.jobs) {
          delete copyObject.jobs;
        }
        if (target.value.tagName !== 'Connection' && copyObject && targetIndex > -1) {
          _dropOnObject();
        } else {
          if (targetObject && targetObject.instructions && copyObject) {
            targetObject.instructions.splice(targetIndex + 1, 0, copyObject);
          }
        }
        self.updateXMLJSON(true);
        if (copyObject.id) {
          setTimeout(() => {
            graph.setSelectionCell(graph.getModel().getCell(copyObject.id));
            customizedChangeEvent();
          }, 0);
        }
      }
    }

    function checkCopyName(jobName): string {
      let str = jobName;
      const jobs = JSON.parse((JSON.stringify(self.jobs)));

      function recursivelyCheck(name): void {
        for (let i = 0; i < jobs.length; i++) {
          if (jobs[i].name == name) {
            let tName;
            if (name.match(/_copy_[0-9]+/)) {
              const arr = name.split('copy_');
              let num = arr[arr.length - 1];
              num = parseInt(num, 10) || 0;
              tName = name.substring(0, name.lastIndexOf('_copy')) + '_copy' + '_' + (num + 1);
            } else {
              tName = name + '_copy_1';
            }
            str = tName;
            jobs.splice(i, 1);
            recursivelyCheck(tName);
            break;
          }
        }
      }

      recursivelyCheck(str);
      return str;
    }

    function getJob(name): string {
      let job: any = {};
      let newName;
      let flag = true;
      newName = checkCopyName(name);
      for (let i = 0; i < self.jobs.length; i++) {
        if (newName === self.jobs[i].name) {
          flag = false;
          break;
        }
        if (name === self.jobs[i].name) {
          job = {name: newName, value: self.jobs[i].value};
        }
      }
      if (flag) {
        if (self.inventoryConf.copiedInstuctionObject && self.inventoryConf.copiedInstuctionObject.jobName === name) {
          job = {name: newName, value: self.inventoryConf.copiedInstuctionObject.jobObject};
        }
        if (!job.name) {
          job = {name: newName, value: {}};
          if (self.inventoryConf.copiedInstuctionObject.jobs) {
            updateMissingJobs(self.inventoryConf.copiedInstuctionObject.jobs, job, name);
          }
        }
        self.jobs.push(job);
      }
      return newName;
    }

    function updateMissingJobs(jobs, job, name): void {
      for (let j = 0; j < jobs.length; j++) {
        if (jobs[j].name === name) {
          if (jobs[j].value && jobs[j].value.executable) {
            job.value = jobs[j].value;
          }
          jobs.splice(j, 1);
          break;
        }
      }
    }

    function generateCopyObject(copyObject): void {
      function recursion(json): void {
        if (json.instructions) {
          for (let x = 0; x < json.instructions.length; x++) {
            json.instructions[x].uuid = undefined;
            if (json.instructions[x].TYPE === 'Job') {
              json.instructions[x].jobName = getJob(json.instructions[x].jobName);
              json.instructions[x].label = json.instructions[x].jobName;
            }
            if (json.instructions[x].instructions) {
              recursion(json.instructions[x]);
            }

            if (json.instructions[x].catch) {
              json.instructions[x].uuid = undefined;
              if (json.instructions[x].catch.instructions && json.instructions[x].catch.instructions.length > 0) {
                recursion(json.instructions[x].catch);
              }
            }
            if (json.instructions[x].then && json.instructions[x].then.instructions) {
              recursion(json.instructions[x].then);
            }
            if (json.instructions[x].else && json.instructions[x].else.instructions) {
              recursion(json.instructions[x].else);
            }
            if (json.instructions[x].branches) {
              for (let i = 0; i < json.instructions[x].branches.length; i++) {
                if (json.instructions[x].branches[i].instructions) {
                  recursion(json.instructions[x].branches[i]);
                }
              }
            }
          }
        }
      }

      if (copyObject.TYPE === 'Job') {
        copyObject.jobName = getJob(copyObject.jobName);
        copyObject.label = copyObject.jobName;
      } else if (copyObject.TYPE === 'Fork') {
        if (copyObject.branches) {
          for (let i = 0; i < copyObject.branches.length; i++) {
            if (copyObject.branches[i].instructions) {
              recursion(copyObject.branches[i]);
            }
          }
        }
      } else if (copyObject.TYPE === 'If') {
        if (copyObject.then && copyObject.then.instructions) {
          recursion(copyObject.then);
        }
        if (copyObject.else && copyObject.else.instructions) {
          recursion(copyObject.else);
        }
      } else if (copyObject.TYPE === 'Retry' || copyObject.TYPE === 'Cycle' || copyObject.TYPE === 'Try' || copyObject.TYPE === 'Lock' || copyObject.TYPE === 'ForkList') {
        recursion(copyObject);
      }
    }

    function customizedChangeEvent(): void {
      const cell = graph.getSelectionCell();
      const cells = graph.getSelectionCells();
      if (cells.length > 0) {
        const lastCell = cells[cells.length - 1];
        const targetId = self.nodeMap.get(lastCell.id);
        if (targetId) {
          graph.addSelectionCell(graph.getModel().getCell(targetId));
        } else if (lastCell) {
          let flag = false;
          if (cells.length > 1) {
            const secondLastCell = cells[cells.length - 2];
            const lName = secondLastCell.value.tagName;
            if (self.workflowService.isInstructionCollapsible(lName) || lName === 'Catch') {
              flag = true;
            }
          }
          if (!flag && (self.workflowService.checkClosingCell(lastCell.value.tagName))) {
            graph.removeSelectionCell(lastCell);
          }
        }
      }

      if (cell && (self.workflowService.checkClosingCell(cell.value.tagName) || cell.value.tagName === 'Connection'
        || cell.value.tagName === 'Finish' || cell.value.tagName === 'Process' || cell.value.tagName === 'Catch')) {
        if (cell.value.tagName !== 'Finish') {
          graph.clearSelection();
        }
        return;
      }
      if (cell && cells.length === 1) {
        setTimeout(() => {
          if (self.workflowService.isInstructionCollapsible(cell.value.tagName)) {
            const targetId = self.nodeMap.get(cell.id);
            if (targetId) {
              graph.addSelectionCell(graph.getModel().getCell(targetId));
            }

          }
        }, 0);
      }
      if (cells.length < 2) {
        selectionChanged();
      } else if (cells.length === 2) {
        if ((cells[0].value.tagName === 'Fork' && cells[1].value.tagName === 'Join') ||
          (cells[0].value.tagName === 'If' && cells[1].value.tagName === 'EndIf') ||
          (cells[0].value.tagName === 'Retry' && cells[1].value.tagName === 'EndRetry') ||
          (cells[0].value.tagName === 'Cycle' && cells[1].value.tagName === 'EndCycle') ||
          (cells[0].value.tagName === 'Lock' && cells[1].value.tagName === 'EndLock') ||
          (cells[0].value.tagName === 'ForkList' && cells[1].value.tagName === 'EndForkList') ||
          (cells[0].value.tagName === 'Try' && cells[1].value.tagName === 'EndTry')) {
          selectionChanged();
        }

      }
    }

    /**
     * Function: Check and create clicked instructions
     */
    function createClickInstruction(title, targetCell) {
      if (title.match('paste')) {
        if (self.copyId) {
          pasteInstruction(targetCell);
        } else if (self.cutCell) {
          const tagName = targetCell.value.tagName;
          if (tagName === 'Connection' || self.workflowService.isInstructionCollapsible(tagName) || tagName === 'Catch') {
            if (tagName === 'Connection') {
              let sourceId = targetCell.source.id;
              let targetId = targetCell.target.id;
              if (self.workflowService.checkClosingCell(targetCell.source.value.tagName)) {
                sourceId = targetCell.source.value.getAttribute('targetId');
              } else if (targetCell.source.value.tagName === 'Process' && targetCell.source.getAttribute('title') === 'start') {
                sourceId = 'start';
              }
              if (self.workflowService.checkClosingCell(targetCell.target.value.tagName)) {
                targetId = targetCell.target.value.getAttribute('targetId');
              } else if (targetCell.target.value.tagName === 'Process' && targetCell.target.getAttribute('title') === 'start') {
                targetId = 'start';
              }
              self.droppedCell = {
                target: {source: sourceId, target: targetId},
                cell: self.cutCell,
                type: targetCell.value.getAttribute('type')
              };
            } else {
              self.droppedCell = {target: targetCell.id, cell: self.cutCell};
            }
          }
        }
        if (self.droppedCell) {
          rearrangeCell(self.droppedCell);
          self.droppedCell = null;
        }
        return;
      }

      if (!targetCell) {
        result = '';
        return;
      }

      self.skipXMLToJSONConversion = false;
      const flag = result === 'valid' || result === 'select';
      if (flag) {
        let defaultParent = targetCell;
        if (targetCell.value.tagName === 'Process' || targetCell.value.tagName === 'Connection' || targetCell.value.tagName === 'Catch') {
          defaultParent = targetCell.getParent();
        }
        let clickedCell: any, _node: any, v1, v2, label = '';
        if (title.match('job')) {
          _node = doc.createElement('Job');
          _node.setAttribute('jobName', 'job');
          _node.setAttribute('uuid', self.workflowService.create_UUID());
          clickedCell = graph.insertVertex(defaultParent, null, _node, 0, 0, 180, 40, 'job');
        } else if (title.match('finish')) {
          _node = doc.createElement('Finish');
          _node.setAttribute('label', 'finish');
          _node.setAttribute('uuid', self.workflowService.create_UUID());
          clickedCell = graph.insertVertex(defaultParent, null, _node, 0, 0, 68, 68, 'finish');
        } else if (title.match('fail')) {
          _node = doc.createElement('Fail');
          _node.setAttribute('label', 'fail');
          _node.setAttribute('uuid', self.workflowService.create_UUID());
          clickedCell = graph.insertVertex(defaultParent, null, _node, 0, 0, 68, 68, 'fail');
        } else if (title.match('addOrder')) {
          _node = doc.createElement('AddOrder');
          _node.setAttribute('label', 'addOrder');
          _node.setAttribute('uuid', self.workflowService.create_UUID());
          clickedCell = graph.insertVertex(defaultParent, null, _node, 0, 0, 68, 68, 'addOrder');
        } else if (title.match('fork-list')) {
          _node = doc.createElement('ForkList');
          _node.setAttribute('label', 'forkList');
          _node.setAttribute('uuid', self.workflowService.create_UUID());
          clickedCell = graph.insertVertex(defaultParent, null, _node, 0, 0, 68, 68, 'forkList');
        } else if (title.match('fork')) {
          _node = doc.createElement('Fork');
          _node.setAttribute('label', 'fork');
          _node.setAttribute('uuid', self.workflowService.create_UUID());
          clickedCell = graph.insertVertex(defaultParent, null, _node, 0, 0, 68, 68, 'fork');
        } else if (title.match('if')) {
          _node = doc.createElement('If');
          _node.setAttribute('label', 'if');
          _node.setAttribute('predicate', '$returnCode > 0');
          _node.setAttribute('uuid', self.workflowService.create_UUID());
          clickedCell = graph.insertVertex(defaultParent, null, _node, 0, 0, 75, 75, 'if');
        } else if (title.match('retry')) {
          _node = doc.createElement('Retry');
          _node.setAttribute('label', 'retry');
          _node.setAttribute('maxTries', '10');
          _node.setAttribute('retryDelays', '0s');
          _node.setAttribute('uuid', self.workflowService.create_UUID());
          clickedCell = graph.insertVertex(defaultParent, null, _node, 0, 0, 75, 75, 'retry');
        } else if (title.match('cycle')) {
          _node = doc.createElement('Cycle');
          _node.setAttribute('label', 'cycle');
          _node.setAttribute('uuid', self.workflowService.create_UUID());
          clickedCell = graph.insertVertex(defaultParent, null, _node, 0, 0, 75, 75, 'cycle');
        } else if (title.match('lock')) {
          _node = doc.createElement('Lock');
          _node.setAttribute('label', 'lock');
          _node.setAttribute('uuid', self.workflowService.create_UUID());
          clickedCell = graph.insertVertex(defaultParent, null, _node, 0, 0, 68, 68, 'lock');
        } else if (title.match('try')) {
          _node = doc.createElement('Try');
          _node.setAttribute('label', 'try');
          _node.setAttribute('uuid', self.workflowService.create_UUID());
          clickedCell = graph.insertVertex(defaultParent, null, _node, 0, 0, 75, 75, 'try');
        } else if (title.match('await')) {
          _node = doc.createElement('ExpectNotice');
          _node.setAttribute('label', 'expectNotice');
          _node.setAttribute('uuid', self.workflowService.create_UUID());
          clickedCell = graph.insertVertex(defaultParent, null, _node, 0, 0, 68, 68, 'expectNotice');
        } else if (title.match('publish')) {
          _node = doc.createElement('PostNotice');
          _node.setAttribute('label', 'postNotice');
          _node.setAttribute('uuid', self.workflowService.create_UUID());
          clickedCell = graph.insertVertex(defaultParent, null, _node, 0, 0, 68, 68, 'postNotice');
        } else if (title.match('prompt')) {
          _node = doc.createElement('Prompt');
          _node.setAttribute('label', 'prompt');
          _node.setAttribute('uuid', self.workflowService.create_UUID());
          clickedCell = graph.insertVertex(defaultParent, null, _node, 0, 0, 68, 68, 'prompt');
        }
        if (targetCell.value.tagName !== 'Connection') {
          if (result === 'select') {
            if (selectedCellsObj) {
              targetCell = null;
            }
            moveSelectedCellToDroppedCell(targetCell, clickedCell, selectedCellsObj);
            selectedCellsObj = null;
          } else {
            addInstructionToCell(clickedCell, targetCell);
          }
          targetCell = null;
          dropTarget = null;
          graph.clearSelection();
          setTimeout(() => {
            if (v1) {
              graph.setSelectionCells([clickedCell, v1]);
            } else {
              graph.setSelectionCells([clickedCell]);
            }
            customizedChangeEvent();
          }, 0);
        } else {
          graph.clearSelection();
          if (targetCell.source) {
            if (targetCell.source.getParent().id !== '1') {
              const _type = targetCell.getAttribute('type') || targetCell.getAttribute('label');
              if (!(_type === 'retry' || _type === 'cycle' || _type === 'lock' || _type === 'then' || _type === 'else' || _type === 'branch' || _type === 'try' || _type === 'catch')) {
                targetCell.setParent(targetCell.source.getParent());
              }
            }
          }
          label = targetCell.getAttribute('type') || targetCell.getAttribute('label') || '';
          if (self.workflowService.isInstructionCollapsible(clickedCell.value.tagName)) {
            const parent = targetCell.getParent() || graph.getDefaultParent();
            if (clickedCell.value.tagName === 'Fork') {
              v1 = graph.insertVertex(parent, null, getCellNode('Join', 'join', null), 0, 0, 68, 68, 'join');
            } else if (clickedCell.value.tagName === 'If') {
              v1 = graph.insertVertex(parent, null, getCellNode('EndIf', 'ifEnd', null), 0, 0, 75, 75, 'if');
            } else if (clickedCell.value.tagName === 'Retry') {
              v1 = graph.insertVertex(parent, null, getCellNode('EndRetry', 'retryEnd', null), 0, 0, 75, 75, 'retry');
            } else if (clickedCell.value.tagName === 'Lock') {
              v1 = graph.insertVertex(parent, null, getCellNode('EndLock', 'lockEnd', null), 0, 0, 68, 68, 'closeLock');
            } else if (clickedCell.value.tagName === 'Cycle') {
              v1 = graph.insertVertex(parent, null, getCellNode('EndCycle', 'cycleEnd', null), 0, 0, 75, 75, 'cycle');
            } else if (clickedCell.value.tagName === 'ForkList') {
              v1 = graph.insertVertex(parent, null, getCellNode('EndForkList', 'forkListEnd', null), 0, 0, 68, 68, 'closeForkList');
            } else {
              v1 = graph.insertVertex(parent, null, getCellNode('EndTry', 'tryEnd', null), 0, 0, 75, 75, 'try');
              v2 = graph.insertVertex(clickedCell, null, getCellNode('Catch', 'catch', null), 0, 0, 100, 40, 'dashRectangle');
              graph.insertEdge(parent, null, getConnectionNode('try'), clickedCell, v2);
              graph.insertEdge(parent, null, getConnectionNode('endTry'), v2, v1);
            }

            graph.insertEdge(parent, null, getConnectionNode(label), targetCell.source, clickedCell);
            if (clickedCell.value.tagName !== 'Try') {
              graph.insertEdge(parent, null, getConnectionNode(''), clickedCell, v1);
            }

            graph.insertEdge(parent, null, getConnectionNode(''), v1, targetCell.target);
            for (let x = 0; x < targetCell.source.edges.length; x++) {
              if (targetCell.source.edges[x].id === targetCell.id) {
                const _sourCellName = targetCell.source.value.tagName;
                const _tarCellName = targetCell.target.value.tagName;
                if ((targetCell.target && ((_sourCellName === 'Job' || _sourCellName === 'AddOrder' || _sourCellName === 'Finish' || _sourCellName === 'Fail' || _sourCellName === 'PostNotice' || _sourCellName === 'Prompt' || _sourCellName === 'ExpectNotice') &&
                  (_tarCellName === 'Job' || _tarCellName === 'AddOrder' || _tarCellName === 'Finish' || _tarCellName === 'Fail' || _tarCellName === 'PostNotice' || _tarCellName === 'Prompt' || _tarCellName === 'ExpectNotice')))) {
                  graph.getModel().remove(targetCell.source.edges[x]);
                } else {
                  targetCell.source.removeEdge(targetCell.source.edges[x], true);
                }
                break;
              }
            }

            setTimeout(() => {
              graph.getModel().beginUpdate();
              try {
                if (clickedCell.id && v1.id) {
                  self.nodeMap.set(clickedCell.id, v1.id);
                }
                const targetId = new mxCellAttributeChange(
                  v1, 'targetId',
                  clickedCell.id);
                graph.getModel().execute(targetId);
                if (v2) {
                  const targetId2 = new mxCellAttributeChange(
                    v2, 'targetId', clickedCell.id);
                  graph.getModel().execute(targetId2);
                }
              } finally {
                graph.getModel().endUpdate();
              }
              checkConnectionLabel(clickedCell, targetCell, false);
            }, 0);
          } else {
            graph.insertEdge(defaultParent, null, getConnectionNode(label), targetCell.source, clickedCell);
            const e1 = graph.insertEdge(defaultParent, null, getConnectionNode(label), clickedCell, targetCell.target);
            for (let i = 0; i < targetCell.source.edges.length; i++) {
              if (targetCell.id === targetCell.source.edges[i].id) {
                targetCell.source.removeEdge(targetCell.source.edges[i], true);
                break;
              }
            }
            setTimeout(() => {
              checkConnectionLabel(clickedCell, e1, true);
            }, 0);
          }
          if (v1) {
            graph.setSelectionCells([clickedCell, v1]);
          } else {
            graph.setSelectionCells([clickedCell]);
          }
          customizedChangeEvent();
        }
        WorkflowService.executeLayout(graph);
      }
      result = '';
    }

    /**
     * Function: To validate instruction is valid for drop or not
     */
    function checkValidTarget(targetCell, title): string {
      const tagName = targetCell.value.tagName;
      if (tagName === 'Process') {
        if (targetCell.getAttribute('title') === 'start' || targetCell.getAttribute('title') === 'end') {
          return 'return';
        }
      } else if (tagName === 'Connector' || title === 'Connect') {
        return 'return';
      }
      let flg = false;
      if (title) {
        title = title.toLowerCase();
        if (title.match('fork') || title.match('retry') || title.match('cycle') || title.match('lock') || title.match('try') || title.match('if')) {
          const selectedCell = graph.getSelectionCell();
          if (selectedCell) {
            const cells = graph.getSelectionCells();
            if (cells.length > 1) {
              selectedCellsObj = isCellSelectedValid(cells);
              if (selectedCellsObj.invalid) {
                return 'inValid';
              }
            }
            if (selectedCell.id === targetCell.id || (selectedCellsObj && selectedCellsObj.ids && selectedCellsObj.ids.length > 0 && selectedCellsObj.ids.indexOf(targetCell.id) > -1)) {
              flg = true;
            }
          }
        }
      }
      if (!flg) {
        if (tagName !== 'Connection') {
          if (tagName === 'Job' || tagName === 'AddOrder' || tagName === 'Finish' || tagName === 'Fail' || tagName === 'ExpectNotice' || tagName === 'PostNotice' || tagName === 'Prompt') {
            for (let i = 0; i < targetCell.edges.length; i++) {
              if (targetCell.edges[i].target.id !== targetCell.id) {
                return 'inValid';
              }
            }
          } else if (tagName === 'If') {
            if (targetCell.edges.length > 2) {
              return 'inValid';
            }
          } else if (self.workflowService.checkClosingCell(targetCell.value.tagName)) {
            if (targetCell.edges.length > 1) {
              for (let i = 0; i < targetCell.edges.length; i++) {
                if (targetCell.edges[i].target.id !== targetCell.id) {
                  return 'inValid';
                }
              }
            }
          } else if (tagName === 'Retry') {
            let flag1 = false;
            if (targetCell.edges && targetCell.edges.length) {
              for (let i = 0; i < targetCell.edges.length; i++) {
                if (targetCell.edges[i].source.value.tagName === 'Retry' && targetCell.edges[i].target.value.tagName === 'EndRetry') {
                  flag1 = true;
                }
              }
            }
            if (!flag1) {
              return 'inValid';
            }
          } else if (tagName === 'Cycle') {
            let flag1 = false;
            if (targetCell.edges && targetCell.edges.length) {
              for (let i = 0; i < targetCell.edges.length; i++) {
                if (targetCell.edges[i].source.value.tagName === 'Cycle' && targetCell.edges[i].target.value.tagName === 'EndCycle') {
                  flag1 = true;
                }
              }
            }
            if (!flag1) {
              return 'inValid';
            }
          } else if (tagName === 'Lock') {
            let flag1 = false;
            if (targetCell.edges && targetCell.edges.length) {
              for (let i = 0; i < targetCell.edges.length; i++) {
                if (targetCell.edges[i].source.value.tagName === 'Lock' && targetCell.edges[i].target.value.tagName === 'EndLock') {
                  flag1 = true;
                }
              }
            }
            if (!flag1) {
              return 'inValid';
            }
          } else if (tagName === 'ForkList') {
            let flag1 = false;
            if (targetCell.edges && targetCell.edges.length) {
              for (let i = 0; i < targetCell.edges.length; i++) {
                if (targetCell.edges[i].source.value.tagName === 'ForkList' && targetCell.edges[i].target.value.tagName === 'EndForkList') {
                  flag1 = true;
                }
              }
            }
            if (!flag1) {
              return 'inValid';
            }
          } else if (tagName === 'Try') {
            let flag1 = false;
            if (targetCell.edges && targetCell.edges.length) {
              for (let i = 0; i < targetCell.edges.length; i++) {
                if (targetCell.edges[i].source && targetCell.edges[i].target && targetCell.edges[i].source.value.tagName === 'Try' && (
                  targetCell.edges[i].target.value.tagName === 'Catch' || targetCell.edges[i].target.value.tagName === 'EndTry')) {
                  flag1 = true;
                }
              }
            }
            if (!flag1) {
              return 'inValid';
            }
          } else if (tagName === 'Catch') {
            let flag1 = false;
            if (targetCell.edges && targetCell.edges.length) {
              for (let i = 0; i < targetCell.edges.length; i++) {
                if (targetCell.edges[i].source.value.tagName === 'Catch' && targetCell.edges[i].target.value.tagName === 'EndTry') {
                  flag1 = true;
                }
              }
            }
            if (!flag1) {
              return 'inValid';
            }
          } else if (tagName === 'Process') {
            if (targetCell.edges && targetCell.edges.length === 1) {
              if (targetCell.edges[0].value.tagName === 'Connector') {
                return 'inValid';
              }
            }
          }
        } else {
          if (tagName === 'Connection') {
            if ((targetCell.source.value.tagName === 'Fork' && targetCell.target.value.tagName === 'Join') ||
              (targetCell.source.value.tagName === 'If' && targetCell.target.value.tagName === 'EndIf') ||
              (targetCell.source.value.tagName === 'Retry' && targetCell.target.value.tagName === 'EndRetry') ||
              (targetCell.source.value.tagName === 'Cycle' && targetCell.target.value.tagName === 'EndCycle') ||
              (targetCell.source.value.tagName === 'Lock' && targetCell.target.value.tagName === 'EndLock') ||
              (targetCell.source.value.tagName === 'ForkList' && targetCell.target.value.tagName === 'EndForkList') ||
              (targetCell.source.value.tagName === 'Try' && targetCell.target.value.tagName === 'Catch') ||
              (targetCell.source.value.tagName === 'Catch' && targetCell.target.value.tagName === 'EndTry') ||
              (targetCell.source.value.tagName === 'Try' && targetCell.target.value.tagName === 'EndTry')) {
              return 'return';
            }
          }
        }
      } else {
        return 'select';
      }
      return 'valid';
    }

    function getBranchLabel(cell): number {
      const branchs = graph.getOutgoingEdges(cell);
      let num = branchs.length;
      if (num === 1 && branchs[0].target.value.tagName === 'Join') {
        num = 0;
      } else {
        for (let i = 0; i < branchs.length; i++) {
          const label = branchs[i].getAttribute('label');
          if (label) {
            const arr = label.match(/\d+/);
            const count = (arr && arr.length > 0) ? arr[0] : 0;
            if (num < count) {
              num = count;
            }
          }
        }
      }

      return parseInt(num, 10);
    }

    function addInstructionToCell(cell, _dropTarget) {
      let label = '';
      const dropTargetName = _dropTarget.value.tagName;
      for (let i = 0; i < _dropTarget.edges.length; i++) {
        if (_dropTarget.edges[i].source && _dropTarget.edges[i].source.id === _dropTarget.id) {
          if (checkClosedCellWithSourceCell(_dropTarget, _dropTarget.edges[i].target)) {
            graph.foldCells(false, false, [_dropTarget], null, null);
          }
          break;
        }
      }
      if (dropTargetName === 'If') {
        let flag = false;
        label = 'then';
        for (let i = 0; i < _dropTarget.edges.length; i++) {
          if (_dropTarget.edges[i].target && _dropTarget.edges[i].target.id !== _dropTarget.id && _dropTarget.edges[i].target.value.tagName !== 'EndIf') {
            label = 'else';
          } else {
            if (_dropTarget.edges[i].target && _dropTarget.edges[i].target.edges) {
              for (let j = 0; j < _dropTarget.edges[i].target.edges.length; j++) {
                if (_dropTarget.edges[i].target.edges[j].edge && _dropTarget.edges[i].target.edges[j].value.attributes
                  && _dropTarget.edges[i].target.edges[j].value.attributes.length > 0 && (_dropTarget.edges[i].target.edges[j].value.attributes[0]
                    && _dropTarget.edges[i].target.edges[j].value.attributes[0].value === 'else')) {
                  flag = true;
                }
              }
            }
          }
        }
        if (flag) {
          label = 'then';
        }
      } else if (dropTargetName === 'Retry') {
        label = 'retry';
      } else if (dropTargetName === 'Cycle') {
        label = 'cycle';
      } else if (dropTargetName === 'Lock') {
        label = 'lock';
      } else if (dropTargetName === 'ForkList') {
        label = 'forkList';
      } else if (dropTargetName === 'Try') {
        label = 'try';
      } else if (dropTargetName === 'Catch') {
        label = 'catch';
        // cell.setParent(_dropTarget);
      } else if (dropTargetName === 'Fork') {
        label = '$TYPE$' + 'branch' + (getBranchLabel(_dropTarget) + 1);
      }

      let parent = cell.getParent() || graph.getDefaultParent();
      if (self.workflowService.isInstructionCollapsible(cell.value.tagName)) {
        let v1, v2, _label;
        if (cell.value.tagName === 'Fork') {
          v1 = graph.insertVertex(parent, null, getCellNode('Join', 'join', cell.id), 0, 0, 68, 68, 'join');
          graph.insertEdge(parent, null, getConnectionNode(''), cell, v1);
        } else if (cell.value.tagName === 'If') {
          v1 = graph.insertVertex(parent, null, getCellNode('EndIf', 'ifEnd', cell.id), 0, 0, 75, 75, 'if');
          graph.insertEdge(parent, null, getConnectionNode(''), cell, v1);
        } else if (cell.value.tagName === 'Retry') {
          v1 = graph.insertVertex(parent, null, getCellNode('EndRetry', 'retryEnd', cell.id), 0, 0, 75, 75, 'retry');
          graph.insertEdge(parent, null, getConnectionNode(''), cell, v1);
        } else if (cell.value.tagName === 'Lock') {
          v1 = graph.insertVertex(parent, null, getCellNode('EndLock', 'lockEnd', cell.id), 0, 0, 68, 68, 'closeLock');
          graph.insertEdge(parent, null, getConnectionNode(''), cell, v1);
        } else if (cell.value.tagName === 'Cycle') {
          v1 = graph.insertVertex(parent, null, getCellNode('EndCycle', 'cycleEnd', cell.id), 0, 0, 75, 75, 'cycle');
          graph.insertEdge(parent, null, getConnectionNode(''), cell, v1);
        } else if (cell.value.tagName === 'ForkList') {
          v1 = graph.insertVertex(parent, null, getCellNode('EndForkList', 'forkListEnd', cell.id), 0, 0, 68, 68, 'closeForkList');
          graph.insertEdge(parent, null, getConnectionNode(''), cell, v1);
        } else if (cell.value.tagName === 'Try') {
          v2 = graph.insertVertex(cell, null, getCellNode('Catch', 'catch', cell.id), 0, 0, 100, 40, 'dashRectangle');
          v1 = graph.insertVertex(parent, null, getCellNode('EndTry', 'tryEnd', cell.id), 0, 0, 75, 75, 'try');
          graph.insertEdge(parent, null, getConnectionNode('try'), cell, v2);
          graph.insertEdge(parent, null, getConnectionNode(''), cell, v1);
          graph.insertEdge(parent, null, getConnectionNode('endTry'), v2, v1);
        }
        if (self.workflowService.isInstructionCollapsible(dropTargetName) || dropTargetName === 'Catch') {
          _label = dropTargetName === 'Fork' ? 'join' : dropTargetName === 'Retry' ? 'endRetry' : dropTargetName === 'Lock' ?
            'endLock' : dropTargetName === 'ForkList' ? 'endForkList' : dropTargetName === 'Catch' ? 'catch' : dropTargetName === 'If' ? 'endIf' :
              dropTargetName === 'Cycle' ? 'endCycle' : 'try';
          if (dropTargetName === 'Try') {
            for (let i = 0; i < _dropTarget.edges.length; i++) {
              if (_dropTarget.edges[i].source.id === _dropTarget.id) {
                if (_dropTarget.edges[i].target.value.tagName === 'EndTry') {
                  _label = 'endTry';
                }
                break;
              }
            }
          }
        }

        if (v1) {
          if (cell.id && v1.id) {
            self.nodeMap.set(cell.id, v1.id);
          }
          if (_label) {
            setTimeout(() => {
              for (let i = 0; i < v1.edges.length; i++) {
                if (v1.edges[i].target.id !== v1.id) {
                  changeLabelOfConnection(v1.edges[i], _label);
                  break;
                }
              }
            }, 0);
          }
        }
      }
      if (dropTargetName === 'Process') {
        parent = graph.getDefaultParent();
        let flag = false;
        for (let i = 0; i < _dropTarget.edges.length; i++) {
          if (_dropTarget.edges[i].source.id !== _dropTarget.id) {
            if (self.workflowService.isInstructionCollapsible(cell.value.tagName)) {
              for (let j = 0; j < cell.edges.length; j++) {
                if (cell.edges[j].target.id !== cell.id) {
                  if (self.workflowService.checkClosingCell(cell.edges[j].target.value.tagName)) {
                    if (flag) {
                      graph.insertEdge(parent, null, getConnectionNode(label), cell.edges[j].target, _dropTarget.edges[i].target);
                    } else {
                      graph.insertEdge(parent, null, getConnectionNode(label), _dropTarget.edges[i].source, cell.edges[j].source);
                    }
                    flag = true;
                    break;
                  }
                }
              }
            } else {
              graph.insertEdge(parent, null, getConnectionNode(label), _dropTarget.edges[i].source, cell);
            }
          } else {
            if (self.workflowService.isInstructionCollapsible(cell.value.tagName)) {
              for (let j = 0; j < cell.edges.length; j++) {
                if (cell.edges[j].target.id !== cell.id) {
                  if (self.workflowService.checkClosingCell(cell.edges[j].target.value.tagName)) {
                    graph.insertEdge(parent, null, getConnectionNode(label), cell.edges[j].target, _dropTarget.edges[i].target);
                    break;
                  }
                }
              }
            } else {
              graph.insertEdge(parent, null, getConnectionNode(label), cell, _dropTarget.edges[i].target);
            }
          }
        }
        graph.getModel().remove(_dropTarget);
      } else {
        let checkLabel = '';
        if (dropTargetName === 'Fork') {
          label = '$TYPE$' + 'branch' + (getBranchLabel(_dropTarget) + 1);
          checkLabel = 'Join';
        } else if (dropTargetName === 'If') {
          checkLabel = 'EndIf';
        } else if (dropTargetName === 'Retry') {
          checkLabel = 'EndRetry';
        } else if (dropTargetName === 'Lock') {
          checkLabel = 'EndLock';
        } else if (dropTargetName === 'Cycle') {
          checkLabel = 'EndCycle';
        } else if (dropTargetName === 'ForkList') {
          checkLabel = 'EndForkList';
        } else if (dropTargetName === 'Try') {
          label = 'try';
          checkLabel = 'EndTry';
        } else if (dropTargetName === 'Catch') {
          label = 'catch';
          checkLabel = 'EndTry';
          graph.getModel().setStyle(_dropTarget, 'catch');
        }

        if (self.workflowService.isInstructionCollapsible(cell.value.tagName)) {
          let target1, target2;
          for (let i = 0; i < _dropTarget.edges.length; i++) {
            if (_dropTarget.edges[i].target.id !== _dropTarget.id) {
              if (_dropTarget.edges[i].target.value.tagName === checkLabel || _dropTarget.edges[i].target.value.tagName === 'Catch') {
                if (_dropTarget.edges[i].target.value.tagName !== 'Catch') {
                  self.nodeMap.set(_dropTarget.id, _dropTarget.edges[i].target.id);
                }
                target1 = _dropTarget.edges[i];
              }
              break;
            }
          }
          for (let i = 0; i < cell.edges.length; i++) {
            if (cell.edges[i].target.id !== cell.id) {
              if (self.workflowService.checkClosingCell(cell.edges[i].target.value.tagName)) {
                self.nodeMap.set(cell.id, cell.edges[i].target.id);
                target2 = cell.edges[i].target;
                break;
              }
            }
          }
          if (target1 && target2) {
            graph.insertEdge(parent, null, getConnectionNode(label), target2, target1.target);
            graph.getModel().remove(target1);
          } else if (self.nodeMap.has(_dropTarget.id)) {
            const target = graph.getModel().getCell(self.nodeMap.get(_dropTarget.id));
            graph.insertEdge(parent, null, getConnectionNode(label), target2, target);
          }
        } else {
          if (dropTargetName === 'Try' && cell.value.tagName === 'Catch') {
            label = 'endTry';
            graph.getModel().setStyle(cell, 'dashRectangle');
          }
          let flag = false;
          if (_dropTarget.edges && _dropTarget.edges.length) {
            for (let i = 0; i < _dropTarget.edges.length; i++) {
              if (_dropTarget.edges[i].target.id !== _dropTarget.id) {
                if (_dropTarget.edges[i].target.value.tagName === checkLabel || _dropTarget.edges[i].target.value.tagName === 'Catch') {
                  flag = true;
                  if (!self.nodeMap.has(_dropTarget.id) && _dropTarget.value.tagName !== 'Catch') {
                    self.nodeMap.set(_dropTarget.id, _dropTarget.edges[i].target.id);
                  }

                  const attr = _dropTarget.edges[i].value.attributes;
                  if (attr && label !== 'catch' && !checkClosedCellWithSourceCell(_dropTarget, _dropTarget.edges[i].target)) {
                    for (let x = 0; x < attr.length; x++) {
                      if (attr[x].value && attr[x].name) {
                        label = attr[x].value;
                        break;
                      }
                    }
                  }

                  if (cell && _dropTarget.edges[i].target) {
                    graph.insertEdge(parent, null, getConnectionNode(label), cell, _dropTarget.edges[i].target);
                  }
                  graph.getModel().remove(_dropTarget.edges[i]);
                }
                break;
              }
            }
          }
          if (!flag && self.nodeMap.has(_dropTarget.id)) {
            const target = graph.getModel().getCell(self.nodeMap.get(_dropTarget.id));
            if (cell && target) {
              graph.insertEdge(parent, null, getConnectionNode(label), cell, target);
            }
          }
        }

        if (cell.edges) {
          for (let i = 0; i < cell.edges.length; i++) {
            if (cell.edges[i].target.value.tagName === checkLabel) {
              const _label = checkLabel === 'Join' ? 'join' : checkLabel === 'EndForkList' ? 'endForkList' : checkLabel === 'EndIf' ? 'endIf' : checkLabel === 'EndRetry'
                ? 'endRetry' : checkLabel === 'EndLock' ? 'endLock' : checkLabel === 'EndCycle' ? 'endCycle' : 'endTry';
              if (cell.value.tagName !== 'Fork' && cell.value.tagName !== 'If' && cell.value.tagName !== 'Try' && cell.value.tagName !== 'Cycle' && cell.value.tagName !== 'Retry' && cell.value.tagName !== 'Lock' && cell.value.tagName !== 'ForkList' && cell.value.tagName !== 'Catch') {
                cell.edges[i].value.attributes[0].nodeValue = _label;
                cell.edges[i].value.attributes[1].nodeValue = _label;
              }
            }
          }
        }
        if (cell && _dropTarget) {
          if (dropTargetName === 'Try' && cell.value.tagName === 'Catch') {
            const childVertices = graph.getChildVertices(_dropTarget);
            if (childVertices.length > 0) {
              const lastChildVertex = childVertices.length === 1 ? _dropTarget : childVertices[childVertices.length - 2];
              for (let j = 0; j < lastChildVertex.edges.length; j++) {
                if (lastChildVertex.edges[j].source.id === lastChildVertex.id) {
                  graph.getModel().remove(lastChildVertex.edges[j]);
                  break;
                }
              }
              graph.insertEdge(parent, null, getConnectionNode('try'), lastChildVertex, cell);

            } else {
              graph.insertEdge(parent, null, getConnectionNode('try'), _dropTarget, cell);
            }

            const targetId = _dropTarget.id;
            setTimeout(() => {
              graph.getModel().beginUpdate();
              try {
                const targetId2 = new mxCellAttributeChange(
                  cell, 'targetId', targetId);
                graph.getModel().execute(targetId2);
              } finally {
                graph.getModel().endUpdate();
              }
            }, 0);
          } else {
            graph.insertEdge(parent, null, getConnectionNode(label), _dropTarget, cell);
          }
        }
      }
      if (cell.value.tagName === 'Try') {
        for (let j = 0; j < cell.edges.length; j++) {
          if (cell.edges[j].target.id !== cell.id) {
            if (cell.edges[j].source.value.tagName === 'Try' && cell.edges[j].target.value.tagName === 'EndTry') {
              graph.getModel().remove(cell.edges[j]);
              break;
            }
          }
        }
      }
    }

    function dropOnObject(source, target, sourceIndex, targetIndex, isCatch, tempJson) {
      if (source && source.instructions.length > 0) {
        const sourceObj = source.instructions[sourceIndex];
        const targetObj = target.instructions[targetIndex];
        let isDone = false;
        if (targetObj.TYPE === 'If') {
          if (!targetObj.then) {
            targetObj.then = {instructions: [sourceObj]};
            isDone = true;
          } else if (!targetObj.else) {
            targetObj.else = {instructions: [sourceObj]};
            isDone = true;
          }
          if (!isDone) {
            let title = '';
            let msg = '';
            self.translate.get('workflow.message.invalidTarget').subscribe(translatedValue => {
              title = translatedValue;
            });

            self.translate.get('workflow.message.ifInstructionValidationError').subscribe(translatedValue => {
              msg = translatedValue;
            });
            self.toasterService.error(msg, title + '!!');
          }
        } else if (targetObj.TYPE === 'Fork') {
          let branchId;
          if (!targetObj.branches) {
            targetObj.branches = [];
          }
          branchId = 'branch' + (targetObj.branches.length + 1);
          targetObj.branches.push({id: branchId, instructions: [sourceObj]});
          isDone = true;
        } else if (targetObj.TYPE === 'Retry' || targetObj.TYPE === 'Lock' || targetObj.TYPE === 'Cycle') {
          if (!targetObj.instructions) {
            targetObj.instructions = [];
          }
          targetObj.instructions.push(sourceObj);
          isDone = true;
        } else if (targetObj.TYPE === 'ForkList') {
          if (!targetObj.instructions) {
            targetObj.instructions = [];
          }
          targetObj.instructions.push(sourceObj);
          isDone = true;
        } else if (targetObj.TYPE === 'Try' && !isCatch) {
          if (!targetObj.instructions) {
            targetObj.instructions = [];
          }
          targetObj.instructions.push(sourceObj);
          isDone = true;
        } else if (isCatch) {
          if (!targetObj.catch.instructions) {
            targetObj.catch.instructions = [];
          }
          targetObj.catch.instructions.push(sourceObj);
          isDone = true;
        }
        if (isDone) {
          source.instructions.splice(sourceIndex, 1);
          if (!isEqual(tempJson, JSON.stringify(self.workflow.configuration))) {
            self.updateXMLJSON(true);
          }
        }
      }
    }

    function dropAndAdd(instructions, dropId, targetId, object, obj) {
      for (let i = 0; i < instructions.length; i++) {
        if (instructions[i].id == dropId) {
          instructions.splice(i, 1);
          break;
        }
      }
      for (let k = 0; k < instructions.length; k++) {
        if (instructions[k].id == targetId) {
          instructions.splice(k, 0, object);
          obj.isMatch = true;
          break;
        }
      }
    }

    function checkParent(object1, object2): boolean {
      let flag = true;

      function recurviseCheck(json) {
        if (json.instructions) {
          for (let x = 0; x < json.instructions.length; x++) {
            if (json.instructions[x].id == object2.id) {
              flag = false;
              break;
            }
            if (json.instructions[x].instructions) {
              recurviseCheck(json.instructions[x]);
            }
            if (json.instructions[x].catch) {
              if (json.instructions[x].catch.instructions && json.instructions[x].catch.instructions.length > 0) {
                recurviseCheck(json.instructions[x].catch);
              }
            }
            if (json.instructions[x].then) {
              recurviseCheck(json.instructions[x].then);
            }
            if (json.instructions[x].else) {
              recurviseCheck(json.instructions[x].else);
            }
            if (json.instructions[x].branches) {
              for (let i = 0; i < json.instructions[x].branches.length; i++) {
                recurviseCheck(json.instructions[x].branches[i]);
              }
            }
          }
        }
      }

      recurviseCheck(object1);
      return flag;
    }

    /**
     * Function: Rearrange a cell to a different position in the workflow
     */
    function rearrangeCell(obj): void {
      const connection = obj.target;
      const droppedCell = obj.cell;
      if (connection.source === droppedCell.id || connection.target === droppedCell.id ||
        connection === droppedCell.id) {
        self.updateXMLJSON(true);
        return;
      } else {
        let dropObject: any, targetObject: any, index = 0, targetIndex = 0, isCatch = false;
        const source = connection.source || connection;
        const tempJson = JSON.stringify(self.workflow.configuration);

        function getObject(json, cell): void {
          if (json.instructions) {
            for (let x = 0; x < json.instructions.length; x++) {
              if (dropObject && targetObject) {
                break;
              }
              if (json.instructions[x].id == cell.id) {
                dropObject = json;
                index = x;
              }
              if (json.instructions[x].id == source) {
                targetObject = json;
                targetIndex = x;
              }
              if (json.instructions[x].instructions) {
                getObject(json.instructions[x], cell);
              }
              if (json.instructions[x].catch) {
                if (json.instructions[x].catch.id == source) {
                  targetObject = json;
                  targetIndex = x;
                  isCatch = true;
                }
                if (json.instructions[x].catch.instructions && json.instructions[x].catch.instructions.length > 0) {
                  getObject(json.instructions[x].catch, cell);
                }
              }
              if (json.instructions[x].then) {
                getObject(json.instructions[x].then, cell);
              }
              if (json.instructions[x].else) {
                getObject(json.instructions[x].else, cell);
              }
              if (json.instructions[x].branches) {
                for (let i = 0; i < json.instructions[x].branches.length; i++) {
                  getObject(json.instructions[x].branches[i], cell);
                }
              }
            }
          }
        }

        getObject(self.workflow.configuration, droppedCell);
        if (!targetObject && connection.source === 'start') {
          targetObject = self.workflow.configuration;
        }
        const booleanObj = {
          isMatch: false
        };
        if (targetObject && dropObject) {
          if (targetObject.instructions) {
            const sourceObj = dropObject.instructions[index];
            const targetObj = targetObject.instructions[targetIndex];
            if (!checkParent(sourceObj, targetObj)) {
              return;
            }

            if (!connection.source && !connection.target) {
              dropOnObject(dropObject, targetObject, index, targetIndex, isCatch, tempJson);
              return;
            }

            if (dropObject && dropObject.instructions) {
              dropObject.instructions.splice(index, 1);
            }
            if ((connection.source === 'start')) {
              targetObject.instructions.splice(0, 0, sourceObj);
            } else {
              if (targetObject.instructions) {
                for (let x = 0; x < targetObject.instructions.length; x++) {
                  if (targetObject.instructions[x].uuid == targetObj.uuid) {
                    targetIndex = x;
                    break;
                  }
                }
              }
              const isSameObj = connection.source === connection.target;
              if (targetObj.TYPE === 'If') {
                if (obj.type || isSameObj) {
                  if (!obj.type.match('else')) {
                    if (!targetObj.then || targetObj.then.instructions.length === 0) {
                      targetObj.then = {instructions: [sourceObj]};
                      booleanObj.isMatch = true;
                    } else {
                      dropAndAdd(targetObj.then.instructions, droppedCell.id, connection.target, sourceObj, booleanObj);
                    }
                  } else {
                    if (!targetObj.else || targetObj.else.instructions.length === 0) {
                      targetObj.else = {instructions: [sourceObj]};
                      booleanObj.isMatch = true;
                    } else {
                      dropAndAdd(targetObj.else.instructions, droppedCell.id, connection.target, sourceObj, booleanObj);
                    }
                  }
                }
              } else if (targetObj.TYPE === 'Fork') {
                if (obj.type || isSameObj) {
                  if (!targetObj.branches || targetObj.branches.length === 0) {
                    targetObj.branches = [{id: 'branch1', instructions: [sourceObj]}];
                    booleanObj.isMatch = true;
                  } else if (targetObj.branches && targetObj.branches.length > 0) {
                    for (let j = 0; j < targetObj.branches.length; j++) {
                      dropAndAdd(targetObj.branches[j].instructions, droppedCell.id, connection.target, sourceObj, booleanObj);
                      if (booleanObj.isMatch) {
                        break;
                      }
                    }
                    for (let j = 0; j < targetObj.branches.length; j++) {
                      if (targetObj.branches[j].instructions.length === 0) {
                        targetObj.branches.splice(j, 1);
                        break;
                      }
                    }
                  }
                }
              } else if (targetObj.TYPE === 'Retry' || targetObj.TYPE === 'Lock' || targetObj.TYPE === 'Cycle' || targetObj.TYPE === 'ForkList') {
                if (obj.type || isSameObj) {
                  if (!targetObj.instructions || targetObj.instructions.length === 0) {
                    targetObj.instructions = [sourceObj];
                    booleanObj.isMatch = true;
                  } else if (targetObj.instructions && targetObj.instructions.length > 0) {
                    dropAndAdd(targetObj.instructions, droppedCell.id, connection.target, sourceObj, booleanObj);
                  }
                }
              } else if (targetObj.TYPE === 'Try') {
                if (obj.type || isSameObj) {
                  if (isCatch) {
                    if (!targetObj.catch.instructions || targetObj.catch.instructions.length === 0) {
                      targetObj.catch.instructions = [sourceObj];
                      booleanObj.isMatch = true;
                    } else if (targetObj.catch.instructions && targetObj.catch.instructions.length > 0) {
                      dropAndAdd(targetObj.catch.instructions, droppedCell.id, connection.target, sourceObj, booleanObj);
                    }
                  } else {
                    if (!targetObj.instructions || targetObj.instructions.length === 0) {
                      targetObj.instructions = [sourceObj];
                      booleanObj.isMatch = true;
                    } else if (targetObj.instructions && targetObj.instructions.length > 0) {
                      dropAndAdd(targetObj.instructions, droppedCell.id, connection.target, sourceObj, booleanObj);
                    }
                  }
                }
              }
              if (!booleanObj.isMatch) {
                targetObject.instructions.splice(targetIndex + 1, 0, sourceObj);
              }
            }
          }

          if (dropObject && dropObject.instructions && dropObject.instructions.length === 0) {
            delete dropObject.instructions;
          }

          self.updateXMLJSON(true);
        }
      }
    }

    if (callFun) {
      selectionChanged();
    }
  }

  private getObject(mainJson): any {
    const self = this;
    let obj: any = {};

    function recursion(json): void {
      if (json.instructions) {
        for (let x = 0; x < json.instructions.length; x++) {
          if (json.instructions[x].uuid == self.copyId) {
            obj = self.coreService.clone(json.instructions[x]);
          }
          if (json.instructions[x].instructions) {
            recursion(json.instructions[x]);
          }
          if (json.instructions[x].catch) {
            if (json.instructions[x].catch.instructions && json.instructions[x].catch.instructions.length > 0) {
              recursion(json.instructions[x].catch);
            }
          }
          if (json.instructions[x].then) {
            recursion(json.instructions[x].then);
          }
          if (json.instructions[x].else) {
            recursion(json.instructions[x].else);
          }
          if (json.instructions[x].branches) {
            for (let i = 0; i < json.instructions[x].branches.length; i++) {
              recursion(json.instructions[x].branches[i]);
            }
          }
        }
      }
    }

    recursion(mainJson);
    return obj;
  }

  private cutOperation(): void {
    const copiedParamObjects = this.coreService.getConfigurationTab().copiedParamObjects;
    if (copiedParamObjects.operation === 'CUT' && this.selectedNode.job.jobName === copiedParamObjects.name && copiedParamObjects.data && copiedParamObjects.data.length > 0) {
      let obj;
      if (copiedParamObjects.type === 'arguments') {
        obj = this.selectedNode.job.executable;
      } else if (copiedParamObjects.type === 'jobArguments') {
        obj = this.selectedNode.job.executable;
      } else if (copiedParamObjects.type === 'env') {
        obj = this.selectedNode.job.executable;
      } else if (copiedParamObjects.type === 'nodeArguments') {
        obj = this.selectedNode.obj;
      } else {
        obj = this.selectedNode.job;
      }
      if (obj[copiedParamObjects.type === 'nodeArguments' ? 'defaultArguments' : copiedParamObjects.type] && obj[copiedParamObjects.type === 'nodeArguments' ? 'defaultArguments' : copiedParamObjects.type].length > 0) {
        obj[copiedParamObjects.type === 'nodeArguments' ? 'defaultArguments' : copiedParamObjects.type] = obj[copiedParamObjects.type === 'nodeArguments' ? 'defaultArguments' : copiedParamObjects.type] = obj[copiedParamObjects.type === 'nodeArguments' ? 'defaultArguments' : copiedParamObjects.type] = obj[copiedParamObjects.type === 'nodeArguments' ? 'defaultArguments' : copiedParamObjects.type].filter(item => {
          let flag = true;
          for (const i in copiedParamObjects.data) {
            if (copiedParamObjects.data[i]) {
              if (copiedParamObjects.data[i].name === item.name && copiedParamObjects.data[i].value === item.value) {
                flag = false;
                break;
              }
            }
          }
          return flag;
        });
      }
    }
  }

  private updateJobProperties(data): boolean {
    const job = this.coreService.clone(data.job);
    if (!job.executable) {
      return false;
    }
    if (isEmpty(job.admissionTimeScheme)) {
      delete job.admissionTimeScheme;
    }
    if (isEmpty(job.executable.login)) {
      delete job.executable.login;
    }
    if (job.notification && isEmpty(job.notification.mail)) {
      if (!job.notification.types || job.notification.types.length === 0) {
        delete job.notification;
      } else {
        delete job.notification.mail;
      }
    }
    if (job.executable.returnCodeMeaning) {
      if (job.executable.returnCodeMeaning && job.executable.returnCodeMeaning.success == '0') {
        delete job.executable.returnCodeMeaning;
      } else {
        if (job.executable.returnCodeMeaning.succes && typeof job.executable.returnCodeMeaning.success == 'string') {
          job.executable.returnCodeMeaning.success = job.executable.returnCodeMeaning.success.split(',').map(Number);
          delete job.executable.returnCodeMeaning.failure;
        } else if (job.executable.returnCodeMeaning.failure && typeof job.executable.returnCodeMeaning.failure == 'string') {
          job.executable.returnCodeMeaning.failure = job.executable.returnCodeMeaning.failure.split(',').map(Number);
          delete job.executable.returnCodeMeaning.success;
        } else if (job.executable.returnCodeMeaning.failure == 0) {
          job.executable.returnCodeMeaning.failure = [0];
          delete job.executable.returnCodeMeaning.success;
        }
      }
    }

    if (!job.executable.v1Compatible) {
      if (job.executable.TYPE === 'ShellScriptExecutable') {
        job.executable.v1Compatible = false;
      } else {
        delete job.executable.v1Compatible;
      }
    }
    if (job.defaultArguments) {
      if (job.executable.v1Compatible && job.executable.TYPE === 'ShellScriptExecutable') {
        job.defaultArguments.filter((argu) => {
          this.coreService.addSlashToString(argu, 'value');
        });
        this.coreService.convertArrayToObject(job, 'defaultArguments', true);
      } else {
        delete job.defaultArguments;
      }
    }
    if (job.executable.arguments) {
      if (job.executable.TYPE === 'InternalExecutable') {
        if (job.executable.arguments && isArray(job.executable.arguments)) {
          job.executable.arguments.filter((argu) => {
            this.coreService.addSlashToString(argu, 'value');
          });
          this.coreService.convertArrayToObject(job.executable, 'arguments', true);
        }
      } else {
        delete job.executable.arguments;
      }
    }
    if (job.executable.jobArguments) {
      if (job.executable.TYPE === 'InternalExecutable') {
        if (job.executable.jobArguments && isArray(job.executable.jobArguments)) {
          job.executable.jobArguments.filter((argu) => {
            this.coreService.addSlashToString(argu, 'value');
          });
          this.coreService.convertArrayToObject(job.executable, 'jobArguments', true);
        }
      } else {
        delete job.executable.jobArguments;
      }
    }
    if (job.executable.TYPE === 'InternalExecutable') {
      delete job.executable.script;
      delete job.executable.login;
    } else if (job.executable.TYPE === 'ShellScriptExecutable') {
      delete job.executable.className;
    }

    if (job.executable.env) {
      if (job.executable.TYPE === 'ShellScriptExecutable') {
        if (job.executable.env && isArray(job.executable.env)) {
          job.executable.env.filter((env) => {
            this.coreService.addSlashToString(env, 'value');
          });
          this.coreService.convertArrayToObject(job.executable, 'env', true);
        }
      } else {
        delete job.executable.env;
      }
    }

    if (!job.parallelism) {
      job.parallelism = 0;
    }
    if (job.timeout1) {
      job.timeout = this.workflowService.convertStringToDuration(job.timeout1);
    } else {
      delete job.timeout;
    }
    if (job.graceTimeout1) {
      job.graceTimeout = this.workflowService.convertStringToDuration(job.graceTimeout1);
    } else {
      delete job.graceTimeout;
    }
    delete job.timeout1;
    delete job.graceTimeout1;
    let flag = true;
    let isChange = true;
    for (let i = 0; i < this.jobs.length; i++) {
      if (this.jobs[i].name === job.jobName) {
        flag = false;
        delete job.jobName;
        if (this.jobs[i].value.executable.returnCodeMeaning) {
          if (this.jobs[i].value.executable.TYPE === 'ShellScriptExecutable') {
            if (typeof this.jobs[i].value.executable.returnCodeMeaning.success == 'string') {
              this.jobs[i].value.executable.returnCodeMeaning.success = this.jobs[i].value.executable.returnCodeMeaning.success.split(',').map(Number);
            }
          } else {
            delete this.jobs[i].value.executable.returnCodeMeaning;
          }
        }
        if (!isEqual(JSON.stringify(job), JSON.stringify(this.jobs[i].value))) {
          this.jobs[i].value = job;
        } else {
          if (isEqual(JSON.stringify(data.newObj), JSON.stringify(data.actualValue))) {
            isChange = false;
          }
        }
      }
    }
    if (flag) {
      delete job.jobName;
      this.jobs.push({name: data.job.jobName, value: job});
    }
    return isChange;
  }

  private updateJobs(graph, isFirst): void {
    if (!graph) {
      return;
    }
    const model = graph.getModel();
    const tempJobs = [];
    if (model.cells) {
      for (const i in model.cells) {
        if (model.cells[i].value && model.cells[i].value.tagName === 'Job') {
          const name = model.cells[i].getAttribute('jobName');
          for (let j = 0; j < this.jobs.length; j++) {
            if (name === this.jobs[j].name) {
              tempJobs.push(this.jobs[j]);
              this.jobs.splice(j, 1);
              break;
            }
          }
        }
      }
    }

    this.jobs = tempJobs;

    if (isFirst) {
      const _temp = JSON.parse(this.workflow.actual);
      const jobs = this.coreService.keyValuePair(this.jobs);
      if (!isEmpty(jobs)) {
        _temp.jobs = jobs;
      }
      this.workflow.actual = JSON.stringify(_temp);
    } else {
      this.storeJSON();
    }
  }

  private storeJSON(): void {
    setTimeout(() => {
      if (this.editor && this.editor.graph && !this.implicitSave) {
        this.noSave = true;
        this.xmlToJsonParser();
        if (this.workflow.configuration && this.workflow.configuration.instructions && this.workflow.configuration.instructions.length > 0) {
          this.editor.graph.setEnabled(true);
        } else {
          this.reloadDummyXml(this.editor.graph);
        }
        this.validateJSON(false);
        setTimeout(() => {
          this.noSave = false;
        }, 250);
      }
    }, 150);
  }

  private openSideBar(id): void {
    this.error = true;
    if (this.editor.graph && id) {
      this.dataService.reloadWorkflowError.next({error: this.error, msg: this.invalidMsg});
      this.editor.graph.setSelectionCells([this.editor.graph.getModel().getCell(id)]);
      this.initEditorConf(this.editor, false, true);
    }
  }

  private navToJob(mainJson, jobName): void {
    if (isEmpty(mainJson)) {
      return;
    }
    const self = this;
    function recursive(json): void {
      if (json.instructions) {
        for (let x = 0; x < json.instructions.length; x++) {
          if (json.instructions[x].TYPE === 'Job') {
            if(json.instructions[x].jobName === jobName) {
              self.openSideBar(json.instructions[x].id);
              break;
            }
          }

          if (json.instructions[x].TYPE === 'Fork') {
            if (json.instructions[x].branches) {
              json.instructions[x].branches = json.instructions[x].branches.filter((branch) => {
                branch.workflow = {
                  instructions: branch.instructions,
                  result: branch.result
                };
                delete branch.instructions;
                delete branch.result;
                return (branch.workflow.instructions && branch.workflow.instructions.length > 0);
              });
              for (let i = 0; i < json.instructions[x].branches.length; i++) {
                if (json.instructions[x].branches[i].workflow) {
                  recursive(json.instructions[x].branches[i].workflow);
                }
              }
            } else {
              json.instructions[x].branches = [];
            }
          }

          if (json.instructions[x].instructions) {
            recursive(json.instructions[x]);
          }

          if (json.instructions[x].catch) {
            if (json.instructions[x].catch.instructions && json.instructions[x].catch.instructions.length > 0) {
              recursive(json.instructions[x].catch);
            }
          }
          if (json.instructions[x].then && json.instructions[x].then.instructions) {
            recursive(json.instructions[x].then);
          }
          if (json.instructions[x].else) {
            if (json.instructions[x].else.instructions) {
              recursive(json.instructions[x].else);
            }
          }
        }
      }
    }

    recursive(mainJson);
  }

  private modifyJSON(mainJson, isValidate, isOpen): boolean {
    if (isEmpty(mainJson)) {
      return false;
    }
    let checkErr = false;
    let isJobExist = false;
    const self = this;
    let flag = true;
    const ids = new Map();
    const labels = new Map();

    function recursive(json): void {
      if (json.instructions && (flag || !isValidate)) {
        for (let x = 0; x < json.instructions.length; x++) {
          if (json.instructions[x].TYPE === 'Job') {
            isJobExist = true;
            json.instructions[x].TYPE = 'Execute.Named';
            flag = self.workflowService.validateFields(json.instructions[x], 'Node');
            if (!flag) {
              self.invalidMsg = !json.instructions[x].label ? 'workflow.message.labelIsMissing' : 'workflow.message.nameIsNotValid';
              checkErr = true;
            }
            if (flag) {
              if (labels.has(json.instructions[x].label)) {
                if (labels.get(json.instructions[x].label) !== json.instructions[x].id) {
                  flag = false;
                  self.invalidMsg = 'workflow.message.duplicateLabel';
                  checkErr = true;
                }
              }
              if (!labels.has(json.instructions[x].label)) {
                labels.set(json.instructions[x].label, json.instructions[x].id);
              }
            }
            if (!flag && isValidate) {
              if (isOpen) {
                self.openSideBar(json.instructions[x].id);
              }
              return;
            }

            if (flag && !ids.has(json.instructions[x].jobName)) {
              ids.set(json.instructions[x].jobName, json.instructions[x].id);
            }
          }

          if (json.instructions[x].TYPE === 'If') {
            if ((!json.instructions[x].predicate || !json.instructions[x].then)) {
              flag = false;
              self.invalidMsg = !json.instructions[x].predicate ? 'workflow.message.predicateIsMissing' : 'workflow.message.invalidIfInstruction';
              checkErr = true;
              if (isOpen) {
                if (!json.instructions[x].predicate) {
                  self.openSideBar(json.instructions[x].id);
                } else {
                  let msg = '';
                  self.translate.get('workflow.message.invalidIfInstruction').subscribe(translatedValue => {
                    msg = translatedValue;
                  });
                  self.toasterService.error(msg);
                }
              }
              if (isValidate) {
                return;
              }
            } else {
              self.validatePredicate(json.instructions[x].predicate, json.instructions[x].id, isOpen);
            }
          }

          if (json.instructions[x].TYPE === 'Try') {
            if ((!json.instructions[x].instructions || json.instructions[x].instructions.length === 0) && isValidate) {
              flag = false;
              checkErr = true;
              self.invalidMsg = 'workflow.message.invalidTryInstruction';
              return;
            }
          }

          if (json.instructions[x].TYPE === 'Retry') {
            if (!(!json.instructions[x].id && !json.instructions[x].instructions && !json.instructions[x].maxTries)) {
              if ((!json.instructions[x].instructions || json.instructions[x].instructions.length === 0)) {
                flag = false;
                checkErr = true;
                self.invalidMsg = 'workflow.message.invalidRetryInstruction';
                if (isOpen) {
                  let msg = '';
                  self.translate.get('workflow.message.invalidRetryInstruction').subscribe(translatedValue => {
                    msg = translatedValue;
                  });
                  self.toasterService.error(msg);
                }
                if (isValidate) {
                  return;
                }
              }
            }
          }

          if (json.instructions[x].TYPE === 'Cycle') {
            if (json.instructions[x].schedule && typeof json.instructions[x].schedule === 'string') {
              try {
                json.instructions[x].schedule = JSON.parse(json.instructions[x].schedule);
              } catch (e) {
              }
            }
            if (!(!json.instructions[x].id && !json.instructions[x].instructions)) {
              if ((!json.instructions[x].instructions || json.instructions[x].instructions.length === 0)) {
                flag = false;
                checkErr = true;
                self.invalidMsg = 'workflow.message.invalidCycleInstruction';
                if (isValidate) {
                  return;
                }
              } else if (!json.instructions[x].schedule || (!json.instructions[x].schedule.schemes)
                || (json.instructions[x].schedule.schemes.length === 0)) {
                flag = false;
                checkErr = true;
                self.invalidMsg = 'workflow.message.scheduleIsMissing';
                if (isOpen) {
                  self.openSideBar(json.instructions[x].id);
                }
                if (isValidate) {
                  return;
                }
              }
            }
          }

          if (json.instructions[x].TYPE === 'Lock') {
            if (!json.instructions[x].id && !json.instructions[x].instructions && !json.instructions[x].lockName) {

            } else {
              if (json.instructions[x].count === '' || json.instructions[x].count === 'undefined') {
                delete json.instructions[x].count;
              } else {
                if (typeof json.instructions[x].count === 'string') {
                  json.instructions[x].count = parseInt(json.instructions[x].count, 10);
                }
              }
              if ((!json.instructions[x].instructions || json.instructions[x].instructions.length === 0)) {
                flag = false;
                checkErr = true;
                self.invalidMsg = !json.instructions[x].lockName ? 'workflow.message.lockNameIsMissing' : 'workflow.message.invalidLockInstruction';
                if (isOpen) {
                  if (!json.instructions[x].lockName) {
                    self.openSideBar(json.instructions[x].id);
                  } else {
                    let msg = '';
                    self.translate.get('workflow.message.invalidLockInstruction').subscribe(translatedValue => {
                      msg = translatedValue;
                    });
                    self.toasterService.error(msg);
                  }
                }
                if (isValidate) {
                  return;
                }
              }
            }
          }

          if (json.instructions[x].TYPE === 'ForkList') {
            if (!json.instructions[x].id && !json.instructions[x].instructions && !json.instructions[x].children) {

            } else {
              if ((!json.instructions[x].instructions || json.instructions[x].instructions.length === 0)) {
                flag = false;
                checkErr = true;
                self.invalidMsg = !json.instructions[x].children ? 'workflow.message.childrenIsMissing' : 'workflow.message.invalidForkListInstruction';
                if (isOpen) {
                  if (!json.instructions[x].children) {
                    self.openSideBar(json.instructions[x].id);
                  } else {
                    let msg = '';
                    self.translate.get('workflow.message.invalidForkListInstruction').subscribe(translatedValue => {
                      msg = translatedValue;
                    });
                    self.toasterService.error(msg);
                  }
                }
                if (isValidate) {
                  return;
                }
              }
            }
          }

          if (json.instructions[x].TYPE === 'AddOrder') {
            flag = self.workflowService.validateFields(json.instructions[x], 'AddOrder');
            if (isEmpty(json.instructions[x].arguments)) {
              delete json.instructions[x].arguments;
            }
            if (!flag) {
              self.invalidMsg = !json.instructions[x].workflowName ? 'workflow.message.workflowNameIsNotValid' : '';
              checkErr = true;
            }
            if (!flag && isValidate) {
              if (isOpen) {
                self.openSideBar(json.instructions[x].id);
              }
              return;
            }
          }

          if (json.instructions[x].TYPE === 'ExpectNotice') {
            flag = self.workflowService.validateFields(json.instructions[x], 'ExpectNotice');
            if (!flag) {
              checkErr = true;
              self.invalidMsg = 'workflow.message.invalidExpectNoticeInstruction';
            }
            if (!flag && isValidate) {
              if (isOpen) {
                self.openSideBar(json.instructions[x].id);
              }
              return;
            }
          }

          if (json.instructions[x].TYPE === 'PostNotice') {
            flag = self.workflowService.validateFields(json.instructions[x], 'PostNotice');
            if (!flag) {
              checkErr = true;
              self.invalidMsg = 'workflow.message.invalidPostNoticeInstruction';
            }
            if (!flag && isValidate) {
              if (isOpen) {
                self.openSideBar(json.instructions[x].id);
              }
              return;
            }
          }

          if (json.instructions[x].TYPE === 'Fork') {
            flag = self.workflowService.validateFields(json.instructions[x], 'Fork');
            if (!flag) {
              checkErr = true;
              self.invalidMsg = (!json.instructions[x].branches || json.instructions[x].branches.length < 2) ? 'workflow.message.invalidForkInstruction' : 'workflow.message.nameIsNotValid';
            }
            if (!flag && isValidate) {
              if (isOpen) {
                if (json.instructions[x].branches && json.instructions[x].branches.length > 0) {
                  self.openSideBar(json.instructions[x].id);
                } else {
                  let msg = '';
                  self.translate.get('workflow.message.invalidForkInstruction').subscribe(translatedValue => {
                    msg = translatedValue;
                  });
                  self.toasterService.error(msg);
                }
              }
              return;
            }
            if (json.instructions[x].branches) {
              json.instructions[x].branches = json.instructions[x].branches.filter((branch) => {
                branch.workflow = {
                  instructions: branch.instructions,
                  result: branch.result
                };
                delete branch.instructions;
                delete branch.result;
                return (branch.workflow.instructions && branch.workflow.instructions.length > 0);
              });
              for (let i = 0; i < json.instructions[x].branches.length; i++) {
                if (json.instructions[x].branches[i].workflow) {
                  recursive(json.instructions[x].branches[i].workflow);
                }
              }
            } else {
              json.instructions[x].branches = [];
            }
          }

          json.instructions[x].id = undefined;
          json.instructions[x].uuid = undefined;
          json.instructions[x].isCollapsed = undefined;
          if (json.instructions[x].instructions) {
            recursive(json.instructions[x]);
          }
          if (json.instructions[x].TYPE === 'Try' && json.instructions[x].instructions && !json.instructions[x].try) {
            self.workflowService.convertTryInstruction(json.instructions[x]);
          }
          if (json.instructions[x].TYPE === 'Retry' && (json.instructions[x].retryDelays || json.instructions[x].maxTries)) {
            json.instructions[x].TYPE = 'Try';
            self.workflowService.convertRetryToTryCatch(json.instructions[x]);
          }
          if (json.instructions[x].TYPE === 'Lock') {
            json.instructions[x].lockedWorkflow = {
              instructions: json.instructions[x].instructions
            };
            const countObj = clone(json.instructions[x].count);
            delete json.instructions[x].instructions;
            delete json.instructions[x].count;
            json.instructions[x].count = countObj;
          }
          if (json.instructions[x].TYPE === 'Cycle') {
            json.instructions[x].cycleWorkflow = {
              instructions: json.instructions[x].instructions
            };
            let scheduleObj = json.instructions[x].schedule ? clone(json.instructions[x].schedule) : null;
            delete json.instructions[x].instructions;
            delete json.instructions[x].schedule;
            if (scheduleObj && typeof scheduleObj === 'string') {
              try {
                scheduleObj = JSON.parse(scheduleObj);
              } catch (e) {
              }
            }
            if (scheduleObj && scheduleObj.schemes && scheduleObj.schemes.length > 0) {
              json.instructions[x].schedule = scheduleObj;
            }
          }
          if (json.instructions[x].TYPE === 'ForkList') {
            const childrenObj = clone(json.instructions[x].children);
            const childToIdObj = clone(json.instructions[x].childToId);
            let joinIfFailed = clone(json.instructions[x].joinIfFailed);
            joinIfFailed = joinIfFailed == 'true' || joinIfFailed === true;
            delete json.instructions[x].children;
            delete json.instructions[x].childToId;
            delete json.instructions[x].joinIfFailed;
            json.instructions[x].children = childrenObj;
            json.instructions[x].childToId = childToIdObj;
            json.instructions[x].workflow = {
              instructions: json.instructions[x].instructions
            };
            json.instructions[x].joinIfFailed = joinIfFailed;
            delete json.instructions[x].instructions;
          }
          if (json.instructions[x].TYPE === 'Fork') {
            const branchObj = clone(json.instructions[x].branches);
            let joinIfFailed = clone(json.instructions[x].joinIfFailed);
            joinIfFailed = joinIfFailed == 'true' || joinIfFailed === true;
            delete json.instructions[x].branches;
            delete json.instructions[x].joinIfFailed;
            json.instructions[x].branches = branchObj;
            json.instructions[x].joinIfFailed = joinIfFailed;
          }

          if (json.instructions[x].TYPE === 'Fail') {
            if (json.instructions[x].uncatchable == 'false') {
              json.instructions[x].uncatchable = false;
            } else if (json.instructions[x].uncatchable == 'true') {
              json.instructions[x].uncatchable = true;
            }
          }

          if (json.instructions[x].catch) {
            json.instructions[x].catch.id = undefined;
            if (json.instructions[x].catch.instructions && json.instructions[x].catch.instructions.length > 0) {
              recursive(json.instructions[x].catch);
            }
          }
          if (json.instructions[x].then && json.instructions[x].then.instructions) {
            recursive(json.instructions[x].then);
          }
          if (json.instructions[x].else) {
            if (json.instructions[x].else.instructions) {
              recursive(json.instructions[x].else);
            } else {
              delete json.instructions[x].else;
            }
          }
        }
      }
    }

    recursive(mainJson);
    if (!this.error || !isValidate) {
      if (isJobExist) {
        if (this.jobs.length === 0) {
          checkErr = true;
        } else {
          for (let n = 0; n < this.jobs.length; n++) {
            flag = self.workflowService.validateFields(this.jobs[n].value, 'Job');
            if (!flag) {
              checkErr = true;
              if (this.jobs[n].value.executable) {
                if (this.jobs[n].value.executable.TYPE === 'ShellScriptExecutable' && !this.jobs[n].value.executable.script) {
                  this.invalidMsg = 'workflow.message.scriptIsMissing';
                } else if (this.jobs[n].value.executable.TYPE === 'InternalExecutable' && !this.jobs[n].value.executable.className) {
                  this.invalidMsg = 'workflow.message.classNameIsMissing';
                } else if (!this.jobs[n].value.agentName) {
                  this.invalidMsg = 'workflow.message.agentIsMissing';
                }
              }
            }

            if (!flag && isValidate) {
              if (isOpen) {
                self.openSideBar(ids.get(this.jobs[n].name));
              }
              break;
            }
          }
        }
      }
    }
    if (mainJson.instructions && (!this.error || !isValidate)) {
      delete mainJson.id;
      mainJson.jobs = this.coreService.keyValuePair(this.jobs);
    }
    if (this.error || checkErr) {
      flag = false;
    }
    if (flag) {
      this.invalidMsg = '';
    }
    return flag;
  }

  private validateByURL(json): void {
    const obj = clone(json);
    this.coreService.post('inventory/' + this.objectType + '/validate', obj).subscribe((res: any) => {
      if (!this.invalidMsg && res.invalidMsg) {
        this.invalidMsg = res.invalidMsg;
      }
      this.workflow.valid = res.valid;
      if (this.workflow.id === this.data.id) {
        if (this.data.valid !== res.valid) {
          const data = JSON.parse(this.workflow.actual);
          this.storeData(data, true);
        }
        this.data.valid = res.valid;
      }
      this.ref.detectChanges();
    });
  }

  private validatePredicate(predicate, id, isOpen): void {
    this.coreService.post('inventory/validate/predicate', predicate).subscribe((res: any) => {
      if (res.invalidMsg) {
        this.invalidMsg = res.invalidMsg;
        this.workflow.valid = false;
        if (this.workflow.id === this.data.id) {
          this.data.valid = false;
        }
        if (isOpen) {
          this.openSideBar(id);
        }
      }
    });
  }

  private checkJobInstruction(data): any {
    for (const prop in data.jobs) {
      if (data.jobs[prop] && data.jobs[prop].executable) {
        if (data.jobs[prop].executable.env && isArray(data.jobs[prop].executable.env)) {
          data.jobs[prop].executable.env = data.jobs[prop].executable.env.filter((env) => {
            if (env.value) {
              if (!(/[$_+]/.test(env.value))) {
                const startChar = env.value.substring(0, 1);
                const endChar = env.value.substring(env.value.length - 1);
                if ((startChar === '\'' && endChar === '\'') || (startChar === '"' && endChar === '"')) {

                } else {
                  env.value = JSON.stringify(env.value);
                  env.value = '\'' + env.value.substring(1, env.value.length - 1) + '\'';
                }
              }
              return true;
            }
            return false;
          });
          if (data.jobs[prop].executable.env && data.jobs[prop].executable.env.length > 0) {
            this.coreService.convertArrayToObject(data.jobs[prop].executable, 'env', true);
          } else {
            delete data.jobs[prop].executable.env;
          }
        }
      }
    }
  }

  private saveJSON(noValidate): void {
    if (this.selectedNode) {
      if (noValidate === 'false' || noValidate === false) {
        this.initEditorConf(this.editor, false, true);
      }
      if(!this.implicitSave) {
        this.xmlToJsonParser();
      }
    } else if (this.selectedNode === undefined) {
      return;
    }
    let data;
    if (!noValidate || noValidate === 'false') {
      data = this.coreService.clone(this.workflow.configuration);
      this.workflow.valid = this.modifyJSON(data, false, false);
    } else {
      data = noValidate;
    }
    this.checkJobInstruction(data);
    if (this.workflow.actual && !isEqual(this.workflow.actual, JSON.stringify(data)) && !this.isStore) {
      this.isStore = true;
      this.storeData(data);
    }
  }

  onChangeJobResource(value): void {
    if (!isEqual(JSON.stringify(this.jobResourceNames), JSON.stringify(value))) {
      this.jobResourceNames = value;
      const data = JSON.parse(this.workflow.actual);
      this.storeData(data);
    }
  }

  updateOtherProperties(type): void {
    let flag = false;
    if (type === 'title') {
      if (!this.title) {
        this.title = '';
      }
      if (!this.extraConfiguration.title) {
        this.extraConfiguration.title = '';
      }
      if (this.title !== this.extraConfiguration.title) {
        this.title = this.extraConfiguration.title;
        flag = true;
      }
    } else if (type === 'timeZone') {
      if (!this.timeZone) {
        this.timeZone = '';
      }
      if (!this.extraConfiguration.timeZone) {
        this.extraConfiguration.timeZone = '';
      }
      if (this.timeZone !== this.extraConfiguration.timeZone) {
        this.timeZone = this.extraConfiguration.timeZone;
        flag = true;
      }
    } else if (type === 'documentation') {
      if (this.documentationName !== this.extraConfiguration.documentationName) {
        this.documentationName = this.extraConfiguration.documentationName;
        flag = true;
      }
    } else if (type === 'variable') {
      const variableDeclarations = {parameters: [], allowUndeclared: false};
      let temp = this.coreService.clone(this.variableDeclarations.parameters);
      variableDeclarations.parameters = temp.filter((value) => {
        if (value.value.type === 'List' || value.value.type === 'Final') {
          delete value.value.default;
        }
        if (!value.value.default && value.value.default !== false && value.value.default !== 0) {
          delete value.value.default;
        }
        if (value.value.type === 'List') {
          delete value.value.final;
          value.value.listParameters = this.coreService.keyValuePair(value.value.listParameters);
        } else if (value.value.type === 'Final') {
          delete value.value.type;
        } else {
          delete value.value.final;
          if (value.value.type === 'String') {
            this.coreService.addSlashToString(value.value, 'default');
          }
        }
        return !!value.name;
      });
      variableDeclarations.parameters = this.coreService.keyValuePair(variableDeclarations.parameters);
      if (variableDeclarations.parameters && isEmpty(variableDeclarations.parameters)) {
        delete variableDeclarations.parameters;
      }

      if (!isEqual(JSON.stringify(this.orderPreparation), JSON.stringify(variableDeclarations))) {
        this.orderPreparation = variableDeclarations;
        flag = true;
      }
      // this.orderPreparation.allowUndeclared = this.variableDeclarations.allowUndeclared;
    }
    if (flag) {
      const data = JSON.parse(this.workflow.actual);
      this.storeData(data);
    }
  }

  private extendJsonObj(data): any {
    let newObj: any = {};
    newObj = extend(newObj, data);
    if (this.orderPreparation) {
      newObj.orderPreparation = this.orderPreparation;
    }
    if (this.jobResourceNames) {
      newObj.jobResourceNames = this.jobResourceNames;
    }
    if (this.title) {
      newObj.title = this.title;
    }
    if (this.timeZone) {
      newObj.timeZone = this.timeZone;
    }
    if (this.documentationName) {
      newObj.documentationName = this.documentationName;
    }
    return newObj;
  }

  private storeData(data, onlyStore = false): void {
    if (this.isTrash || !this.workflow || !this.workflow.id || !this.permission.joc.inventory.manage) {
      return;
    }
    const newObj = this.extendJsonObj(data);
    if (!onlyStore) {
      if (this.history.past.length === 20) {
        this.history.past.shift();
      }
      if (this.history.type === 'new') {
        this.history = {
          // push previous present into past for undo
          past: [this.history.present, ...this.history.past],
          present: JSON.stringify(newObj),
          future: [], // clear future
          type: 'new'
        };
      } else {
        this.history.type = 'new';
      }
    }
    if (!this.workflow.id) {
      return;
    }

    this.coreService.post('inventory/store', {
      configuration: newObj,
      id: this.workflow.id,
      valid: this.workflow.valid,
      objectType: this.objectType
    }).subscribe({
      next: (res: any) => {
        this.isStore = false;
        if (res.id === this.data.id && this.workflow.id === this.data.id) {
          this.workflow.actual = JSON.stringify(data);
          this.workflow.deployed = false;
          this.workflow.valid = res.valid;
          this.data.valid = res.valid;
          this.data.deployed = false;
          if (this.invalidMsg && this.invalidMsg.match(/inventory/)) {
            this.invalidMsg = '';
          }
          if (!this.invalidMsg && res.invalidMsg) {
            this.invalidMsg = res.invalidMsg;
          }
          this.ref.detectChanges();
        }
      }, error: () => this.isStore = false
    });
  }

  findAndReplace(): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: FindAndReplaceComponent,
      nzComponentParams: {
        agents: this.agents
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        this.jobs.forEach((job) => {
          if (result.finds.length === 0 && !job.value.agentName) {
            job.value.agentName = result.replace;
          } else if (result.finds.length > 0 && result.finds[0] === '*') {
            job.value.agentName = result.replace;
          } else if (result.finds.length > 0 && job.value.agentName) {
            for (const i in result.finds) {
              if (result.finds[i]) {
                if (result.finds[i].toLowerCase() === job.value.agentName.toLowerCase()) {
                  job.value.agentName = result.replace;
                  break;
                }
              }
            }
          }
        });
        const data = this.coreService.clone(this.workflow.configuration);
        this.workflow.valid = this.modifyJSON(data, false, false);
        if (!isEqual(this.workflow.actual, JSON.stringify(data))) {
          this.isStore = true;
          this.storeData(data);
        }
      }
    });
  }
}
