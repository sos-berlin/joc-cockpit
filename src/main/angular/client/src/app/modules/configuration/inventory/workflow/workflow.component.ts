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
  ViewChild,
  inject
} from '@angular/core';
import {NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
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
import {CommentModalComponent} from '../../../../components/comment-modal/comment.component';
import {InventoryObject} from '../../../../models/enums';
import {JobWizardComponent} from '../job-wizard/job-wizard.component';
import {InventoryService} from '../inventory.service';
import {CreateObjectModalComponent} from "../inventory.component";
import {UpdateJobTemplatesComponent} from "../job-template/job-template.component";
import {CalendarService} from "../../../../services/calendar.service";
import {FileUploaderComponent} from "../../../../components/file-uploader/file-uploader.component";
import {NZ_MODAL_DATA} from 'ng-zorro-antd/modal';

// Mx-Graph Objects
declare const mxEditor;
declare const mxUtils;
declare const mxEvent;
declare const mxClient;
declare const mxEdgeHandler;
declare const mxRectangleShape;
declare const mxAutoSaveManager;
declare const mxGraphHandler;
declare const mxCellAttributeChange;
declare const mxGraph;
declare const mxImage;
declare const mxRubberband;
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
  selector: 'app-notice-board-editor-modal',
  templateUrl: './notice-board-editor-dialog.html'
})
export class NoticeBoardEditorComponent {
  readonly modalData: any = inject(NZ_MODAL_DATA);
  boardTree: any = [];
  data: any;
  object: any = {};
  obj = {
    data: ''
  };
  isTreeShow = false;
  @ViewChild('codeMirror', {static: false}) cm;

  constructor(public activeModal: NzModalRef) {
  }

  ngOnInit(): void {
    this.boardTree = this.modalData.boardTree || [];
    this.data = this.modalData.data;
    this.object = this.modalData.object || {};
  }

  ngAfterViewInit(): void {
    const self = this;
    this.isTreeShow = false;
    setTimeout(() => {
      if (this.cm && this.cm.codeMirror) {
        setTimeout(() => {
          let arr = this.data?.split('\n') || [];
          const doc = this.cm.codeMirror.getDoc();
          const cursor = doc.getCursor();  // gets the line number in the cursor position
          doc.replaceRange(this.data || '', cursor);
          cursor.line = arr.length > 0 ? arr.length - 1 : 0;
          cursor.ch = arr.length > 0 ? arr[arr.length - 1]?.length + 1 : 0;
          this.cm.codeMirror.focus();
          doc.setCursor(cursor);
        }, 400);

        this.cm.codeMirror.setOption("extraKeys", {
          "Ctrl-Space": function (editor) {
            const cursor = editor.getCursor();
            self.isTreeShow = true;
            setTimeout(() => {
              const dom = $('#show-tree-editor');
              dom?.css({
                'opacity': '1',
                'top': (cursor.line > 0 ? (cursor.line * 18.7) + 24 : 24) + 'px',
                'left': '12px',
                'width': 'calc(100% - 22px)'
              });
            }, 0)
          }
        })
      }
    }, 0);
  }

  onBlur(value: string): void {
    $('.ant-select-tree-dropdown').hide();
    this.checkExpectNoticeExp(value);
  }

  checkExpectNoticeExp(event): void {
    this.isTreeShow = false;
    if (event) {
      const doc = this.cm.codeMirror.getDoc();
      const cursor = doc.getCursor();
      if (this.cm.codeMirror.getSelection()) {
        let text = this.cm.codeMirror.getValue();
        text = text.replace(this.cm.codeMirror.getSelection(), event);
        this.cm.codeMirror.setValue(text);
        cursor.ch = text.length;
      } else {
        const doc = this.cm.codeMirror.getDoc();
        const cursor = doc.getCursor(); // gets the line number in the cursor position
        doc.replaceRange("'" + event + "'", cursor);
        cursor.ch = cursor.ch + (event.length + 2);
      }
      this.cm.codeMirror.focus();
      doc.setCursor(cursor);
    }
  }

  onSubmit(): void {
    this.activeModal.close(this.obj.data);
  }
}

@Component({
  selector: 'app-facet-editor-modal',
  templateUrl: './facet-editor-dialog.html'
})
export class FacetEditorComponent {
  readonly modalData: any = inject(NZ_MODAL_DATA);
  preferences: any = {};
  data: any = {};
  isList = false;
  variable: any = {};
  favList = [];

  constructor(public activeModal: NzModalRef, private coreService: CoreService) {
  }

  ngOnInit(): void {
    this.preferences = this.modalData.preferences || {};
    this.data = this.modalData.data || {};
    this.isList = this.modalData.isList;
    this.variable = this.coreService.clone(this.data);
    if (this.isList && this.variable.value && (!this.variable.value.list || this.variable.value.list.length === 0)) {
      this.addVariableToArray(this.variable.value);
    }
    this.getFavList();
  }

  private getFavList(): void {
    this.coreService.post('inventory/favorites', {
      types: ['FACET'],
      limit: this.preferences.maxFavoriteEntries || 10
    }).subscribe({
      next: (res: any) => {
        this.favList = res.favorites;
      }
    });
  }

  checkRegularExp(data): void {
    data.invalid = false;
    try {
      new RegExp(data.facet);
    } catch (e) {
      data.invalid = true;
    }
  }

  onSubmit(): void {
    delete this.variable.invalid;
    this.activeModal.close(this.variable);
  }

  addVariableToArray(variable): void {
    const param = {
      name: '',
    };
    if (!variable.list) {
      variable.list = [];
    }
    if (!this.coreService.isLastEntryEmpty(variable.list, 'name', '')) {
      variable.list.push(param);
    }
  }

  removeVariableFromArray(list, index): void {
    list.splice(index, 1);
  }

  cancel(): void {
    this.activeModal.destroy();
  }
}

@Component({
  selector: 'app-repeat-editor-modal',
  templateUrl: './repeat-editor-dialog.html'
})
export class RepeatEditorComponent {
  readonly modalData: any = inject(NZ_MODAL_DATA);
  data: any;
  isTooltipVisible: any;
  isNew: boolean;
  object: any = {};

  constructor(public activeModal: NzModalRef) {
  }

  ngOnInit(): void {
    this.data = this.modalData.data;
    this.isTooltipVisible = this.modalData.isTooltipVisible;
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
export class TimeEditorComponent {
  readonly modalData: any = inject(NZ_MODAL_DATA);
  data: any;
  period: any;
  isTooltipVisible = false;
  isCycle = false;

  isExist = false;

  object: any = {};

  @ViewChild('timePicker', {static: true}) tp;

  constructor(public activeModal: NzModalRef, private workflowService: WorkflowService, private coreService: CoreService) {
  }

  ngOnInit(): void {
    this.data = this.modalData.data;
    this.period = this.modalData.period;
    this.isTooltipVisible = this.modalData.isTooltipVisible;
    this.isCycle = this.modalData.isCycle;
    if (this.period) {
      const h = Math.floor(((((this.period.startTime % (3600 * 365 * 24)) % (3600 * 30 * 24)) % (3600 * 7 * 24)) % (3600 * 24)) / 3600);
      const m = Math.floor((((((this.period.startTime % (3600 * 365 * 24)) % (3600 * 30 * 24)) % (3600 * 7 * 24)) % (3600 * 24)) % 3600) / 60);
      const s = Math.floor(((((((this.period.startTime % (3600 * 365 * 24)) % (3600 * 30 * 24)) % (3600 * 7 * 24)) % (3600 * 24)) % 3600) % 60));
      this.object.startTime = (h > 9 ? h : '0' + h) + ':' + (m > 9 ? m : '0' + m) + (s > 0 ? (':' + (s > 9 ? s : '0' + s)) : ':00');
      this.object.startTime1 = new Date(new Date().setHours(h, m, s));
      this.object.duration = this.workflowService.convertDurationToHour(this.period.duration);
    }
  }

  onTab(): void {
    this.tp.close();
  }

  selectTime(time, isEditor = false): void {
    this.coreService.selectTime(time, isEditor, this.object, 'start');
  }

  onSubmit(): void {
    const obj: any = {};
    const h = this.object.startTime1.getHours();
    const m = this.object.startTime1.getMinutes();
    const s = this.object.startTime1.getSeconds();
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
  @Input() isTooltipVisible = false;
  @Input() timeZone: string;
  schemeList = [];
  days = [];

  constructor(private coreService: CoreService, private modal: NzModalService,
              private workflowService: WorkflowService, private ref: ChangeDetectorRef) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedNode']) {
      this.init();
    }
  }

  static createObj(data, period): any {
    const obj: any = {
      TYPE: !data.frequency ? 'DailyPeriod' : 'WeekdayPeriod'
    };
    if (data.secondOfMonth != undefined) {
      obj.TYPE = 'MonthlyDatePeriod';
      obj.secondOfMonth = data.secondOfMonth + period.startTime;
    } else if (data.lastSecondOfMonth != undefined) {
      obj.TYPE = 'MonthlyLastDatePeriod';
      obj.lastSecondOfMonth = data.lastSecondOfMonth + period.startTime;
    } else if (data.secondOfWeeks != undefined) {
      obj.TYPE = data.secondOfWeeks < 0 ? 'MonthlyLastWeekdayPeriod' : 'MonthlyWeekdayPeriod';
      obj.secondOfWeeks = data.secondOfWeeks + period.startTime;
    } else if (data.date != undefined) {
      obj.TYPE = 'SpecificDatePeriod';
      obj.secondsSinceLocalEpoch = (data.date + period.startTime);
    }
    if (obj.TYPE === 'WeekdayPeriod') {
      obj.secondOfWeek = ((data.secondOfWeek || data.secondOfDay || 0) + period.startTime);
    } else if (obj.TYPE === 'DailyPeriod') {
      obj.secondOfDay = ((data.secondOfDay || 0) + period.startTime);
    }
    obj.duration = period.duration;
    return obj;
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
        if (typeof this.selectedNode.obj.schedule === 'string') {
          this.selectedNode.obj.schedule = JSON.parse(this.selectedNode.obj.schedule);
        }
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

  editFrequency(data, index, listIndex?): void {
    this.selectedNode.isEdit = listIndex > -1;
    this.selectedNode.obj.show = true;
    this.selectedNode.repeatObject = data.repeat;
    this.selectedNode.repeatObject.index = index;
    this.selectedNode.obj.listIndex = listIndex;
    this.selectedNode.obj.addNewFreq = true;
    this.selectedNode.data.schedule = this.selectedNode.obj.schedule.schemes[index];
    this.selectedNode.data.periodList = [];
  }

  removeFrequency(index, list, mainIndex): void {
    list.periodList.splice(index, 1);
    if (list.periodList.length === 0) {
      this.selectedNode.obj.schedule.schemes[mainIndex].admissionTimeScheme.periods = [];
    } else {
      this.selectedNode.obj.schedule.schemes[mainIndex].admissionTimeScheme.periods = this.workflowService.convertListToAdmissionTime(list.periodList);
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
      nzData: {
        data: data.repeat,
        isTooltipVisible: this.isTooltipVisible
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe((res) => {
      if (res) {
        this.selectedNode.obj.schedule.schemes[index].repeat = this.workflowService.convertRepeatObject(res);
        this.convertSchemeList();
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
      nzData: {
        data,
        period,
        isTooltipVisible: this.isTooltipVisible,
        isCycle: true
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
        const obj2 = CycleInstructionComponent.createObj(data, res);
        if (period) {
          const obj = CycleInstructionComponent.createObj(data, period);
          this.selectedNode.obj.schedule.schemes[index].admissionTimeScheme.periods = this.selectedNode.obj.schedule.schemes[index].admissionTimeScheme.periods.filter((item) => {
            return JSON.stringify(item) !== JSON.stringify(obj);
          });
        }
        this.selectedNode.obj.schedule.schemes[index].admissionTimeScheme.periods.push(obj2);
      }
    });
  }

  removePeriod(data, period, index): void {
    const obj = CycleInstructionComponent.createObj(data, period);
    data.periods = data.periods.filter((item) => {
      return item !== period;
    });
    this.selectedNode.obj.schedule.schemes[index].admissionTimeScheme.periods = this.selectedNode.obj.schedule.schemes[index].admissionTimeScheme.periods.filter((item) => {
      return JSON.stringify(item) !== JSON.stringify(obj);
    });
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
          if (!this.selectedNode.obj.addNewFreq) {
            this.selectedNode.obj.schedule.schemes.push({
              repeat: this.workflowService.convertRepeatObject(this.selectedNode.repeatObject),
              admissionTimeScheme: this.selectedNode.data.schedule.admissionTimeScheme
            });
          }
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
export class AdmissionTimeComponent {
  @Input() job: any;
  @Input() data: any;
  @Input() timeZone: any;
  @Input() repeatObject: any;
  @Input() isTooltipVisible: boolean;
  @Input() isEdit: boolean;
  @Input() index: number;

  frequency: any = {
    days: [],
    tab: 'weekDays',
    all: false
  };
  days = [];
  isValid = true;
  object: any = {};
  _temp: any;
  selectedMonths = [];
  selectedMonthsU = [];

  countArr = [0, 1, 2, 3, 4];
  countUArr = [1, 2, 3, 4];
  editor: any = {isEnable: false};
  daysOptions = [
    {label: 'monday', value: '1', checked: false},
    {label: 'tuesday', value: '2', checked: false},
    {label: 'wednesday', value: '3', checked: false},
    {label: 'thursday', value: '4', checked: false},
    {label: 'friday', value: '5', checked: false},
    {label: 'saturday', value: '6', checked: false},
    {label: 'sunday', value: '7', checked: false}
  ];

  tempDates = [];

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
      if (this.isEdit && this.data.periodList && this.data.periodList.length > 0) {
        this.editFrequency(this.data.periodList[this.index > -1 ? this.index : 0]);
      }
      if (this.data.periodList.length > 0) {
        if (this.repeatObject && !this.data.periodList[0].frequency) {
          this.frequency.days = ['1', '2', '3', '4', '5', '6', '7'];
          this.frequency.all = true;
        }
      }
    }
    if (this.repeatObject) {
      this.checkDays();
      this.checkFrequency();
    }
  }

  ngOnDestroy(): void {
    if (!this.job.admissionTimeScheme) {
      this.job.admissionTimeScheme = {};
    }
    this.job.admissionTimeScheme.periods = this.workflowService.convertListToAdmissionTime(this.data.periodList);
    this.data.periodList = null;
  }

  onTab(): void {
    this.tp.close();
  }

  changeFrequency(): void {
    if (!this.frequency.isUltimos) {
      this.frequency.isUltimos = 'months';
    }
    this.checkFrequency();
  }

  private checkFrequency(): void {
    if (this.frequency.tab == 'specificWeekDays') {
      this.onFrequencyChange();
    } else if (this.frequency.tab == 'monthDays') {
      if (this.frequency.isUltimos == 'months') {
        this.editor.isEnable = this.selectedMonths.length != 0;
      } else {
        this.editor.isEnable = this.selectedMonthsU.length != 0;
      }
    } else if (this.frequency.tab == 'weekDays') {
      this.editor.isEnable = this.frequency.days && this.frequency.days.length > 0;
    } else if (this.frequency.tab === 'specificDays') {
      $('#calendar').calendar({
        language: this.coreService.getLocale(),
        clickDay: (e) => {
          this.selectDate(e);
        }
      });
    }
  }

  private selectDate(e): void {
    const obj = {
      startDate: e.date,
      endDate: e.date,
      color: 'blue'
    };
    let flag = false;
    let index = 0;
    for (let i = 0; i < this.tempDates.length; i++) {
      if ((new Date(this.tempDates[i].startDate).setHours(0, 0, 0, 0) == new Date(obj.startDate).setHours(0, 0, 0, 0))) {
        flag = true;
        index = i;
        break;
      }
    }
    if (!flag) {
      this.tempDates.push(obj);
    } else {
      this.tempDates.splice(index, 1);
    }
    this.editor.isEnable = this.tempDates.length > 0;
    $('#calendar').data('calendar').setDataSource(this.tempDates);
  }

  onFrequencyChange(): void {
    this.editor.isEnable = !!(this.frequency.specificWeekDay && this.frequency.specificWeek);
  }

  selectTime(time, isEditor = false): void {
    this.coreService.selectTime(time, isEditor, this.object, 'start');
  }

  dayChange(value: string[]): void {
    this.frequency.days = value;
    this.onChangeDays();
  }

  onChangeDays(): void {
    if (this.frequency.days) {
      this.editor.isEnable = this.frequency.days.length > 0;
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
    this.editor.isEnable = this.frequency.days.length > 0;
    this.checkDays();
  }

  checkDays(): void {
    this.frequency.all = this.frequency.days.length === 7;
    this.daysOptions = this.daysOptions.map(item => {
      return {
        ...item,
        checked: (this.frequency.days ? this.frequency.days.indexOf(item.value) > -1 : false)
      };
    });
  }

  selectMonthDaysFunc(value): void {
    if (this.selectedMonths.indexOf(value) === -1) {
      this.selectedMonths.push(value);
    } else {
      this.selectedMonths.splice(this.selectedMonths.indexOf(value), 1);
    }
    this.frequency.selectedMonths = this.coreService.clone(this.selectedMonths);
    this.frequency.selectedMonths.sort();
    this.editor.isEnable = this.selectedMonths.length > 0;
  }

  selectMonthDaysUFunc(value): void {
    if (this.selectedMonthsU.indexOf(value) === -1) {
      this.selectedMonthsU.push(value);
    } else {
      this.selectedMonthsU.splice(this.selectedMonthsU.indexOf(value), 1);
    }
    this.frequency.selectedMonthsU = this.coreService.clone(this.selectedMonthsU);
    this.frequency.selectedMonthsU.sort();
    this.editor.isEnable = this.selectedMonthsU.length > 0;
  }

  getSelectedMonthDays(value): boolean {
    return this.selectedMonths.indexOf(value) !== -1;
  }

  getSelectedMonthDaysU(value): boolean {
    return this.selectedMonthsU.indexOf(value) !== -1;
  }

  addFrequency(myForm): void {
    this.isValid = true;
    let p: any;
    let periods = [];
    if (this._temp) {
      for (let i = 0; i < this.data.periodList.length; i++) {
        if (this.data.periodList[i].frequency === this._temp.frequency) {
          periods = this.data.periodList[i].periods;
          this.data.periodList.splice(i, 1);
          break;
        }
      }
    }

    if (this.object.startTime || this.object.duration) {
      p = {};
      if (this.object.startTime) {
        const h = this.object.startTime1.getHours();
        const m = this.object.startTime1.getMinutes();
        const s = this.object.startTime1.getSeconds();
        p.startTime = (h * 60 * 60) + (m * 60) + s;
      } else {
        p.startTime = 0;
      }
      p.duration = this.workflowService.convertStringToDuration(this.object.duration, true);
      p.text = this.workflowService.getText(p.startTime, p.duration);
    }
    const temp = this.coreService.clone(this.data.periodList);
    if (this.frequency.tab === 'weekDays') {
      if (this.frequency.days.length > 0) {
        if (this.frequency.days.length === 7 && this.repeatObject) {
          this.data.periodList.push(this.addWeekdayFrequency('1', temp, p, true, periods));
        } else {
          this.frequency.days.forEach((day) => {
            this.data.periodList.push(this.addWeekdayFrequency(day, temp, p, false, periods));
          });
        }
      }
    } else if (this.frequency.tab === 'specificWeekDays') {
      this.data.periodList.push(this.addSpecificWeekdayFrequency(this.frequency, temp, p, periods));
    } else if (this.frequency.tab === 'monthDays') {
      if (this.frequency.isUltimos === 'months') {
        this.selectedMonths.forEach((day) => {
          this.data.periodList.push(this.addMonthdayFrequency(day, temp, p, false, periods));
        });
      } else {
        this.selectedMonthsU.forEach((day) => {
          this.data.periodList.push(this.addMonthdayFrequency(day, temp, p, true, periods));
        });
      }
    } else if (this.frequency.tab === 'specificDays') {
      this.tempDates = sortBy(this.tempDates, (i: any) => {
        return i.startDate;
      });
      this.tempDates.forEach(date => {
        const utcDate = Date.UTC(date.startDate.getFullYear(), date.startDate.getMonth(), date.startDate.getDate());
        const obj: any = {
          date: this.coreService.getUnixTime(utcDate),
          frequency: this.coreService.getStringDate(utcDate),
          periods: periods
        };

        this.workflowService.updatePeriod(temp, obj, p);
        if (obj.periods.length === 0) {
          this.isValid = false;
        }
        this.data.periodList.push(obj);
      });
      this.tempDates = [];
      const dom = $('#calendar');
      if (dom.data('calendar')) {
        dom.data('calendar').setDataSource(this.tempDates);
      }
      this.data.periodList = sortBy(this.data.periodList, (i: any) => {
        return i.date;
      });
    }


    for (let i in temp) {
      for (let j = 0; j < this.data.periodList.length; j++) {
        if (temp[i].match && temp[i].frequency === this.data.periodList[j].frequency) {
          this.data.periodList.splice(j, 1);
          break;
        }
      }
    }

    this.object = {};
    this._temp = null;
    this.selectedMonths = [];
    this.selectedMonthsU = [];
    this.frequency.days = [];
    this.frequency.all = false;
    this.checkDays();
    this.ref.detectChanges();
    if (this.isEdit) {
      this.closeRuntime();
    } else {
      Object.keys(myForm.controls).forEach((key) => {
        const control = myForm.controls[key];
        control.markAsPristine();
        control.markAsUntouched();
      });
    }
  }

  private addWeekdayFrequency(day, temp, p, isDaily, periods): any {
    const d = parseInt(day, 10) - 1;
    const obj: any = {
      day,
      secondOfWeek: (d * 24 * 3600),
      frequency: isDaily ? '' : this.days[parseInt(day, 10)],
      periods: periods
    };
    this.workflowService.updatePeriod(temp, obj, p);
    if (obj.periods.length === 0) {
      this.isValid = false;
    }
    return obj;
  }

  private addSpecificWeekdayFrequency(frequency, temp, p, periods): any {
    const obj: any = {
      specificWeekDay: frequency.specificWeekDay,
      specificWeek: frequency.specificWeek,
      secondOfWeeks: (frequency.specificWeekDay * 24 * 3600) + ((frequency.specificWeek - (frequency.specificWeek > 0 ? 1 : 0)) * 7 * 24 * 3600),
      frequency: this.workflowService.getSpecificDay(frequency.specificWeek) + ' ' + this.workflowService.getStringDay(frequency.specificWeekDay),
      periods: periods
    };
    this.workflowService.updatePeriod(temp, obj, p);
    if (obj.periods.length === 0) {
      this.isValid = false;
    }
    return obj;
  }

  private addMonthdayFrequency(day, temp, p, isLast, periods): any {
    const d = parseInt(day, 10) - 1;
    const obj: any = {
      frequency: this.workflowService.getMonthDays(isLast ? -d : day, isLast),
      day,
      periods: periods
    };
    if (!isLast) {
      obj.secondOfMonth = (d * 24 * 3600);
    } else {
      obj.lastSecondOfMonth = -(day * 24 * 3600);
    }
    this.workflowService.updatePeriod(temp, obj, p);
    if (obj.periods.length === 0) {
      this.isValid = false;
    }
    return obj;
  }

  closeRuntime(): void {
    this.close.emit();
  }

  resetTab(): void {
    if (this.isEdit) {
      this.closeRuntime();
    } else {
      this._temp = null;
      this.selectedMonths = [];
      this.selectedMonthsU = [];
      this.frequency.tab = 'weekDays';
      this.frequency.days = [];
      this.frequency.all = false;
      this.object = {};
      this.checkDays();
      this.ref.detectChanges();
    }
  }

  editFrequency(data): void {
    this._temp = this.coreService.clone(data);
    this.selectedMonths = [];
    this.selectedMonthsU = [];
    if (data.lastSecondOfMonth || data.secondOfMonth > -1) {
      this.frequency.tab = 'monthDays';
      this.frequency.isUltimos = data.secondOfMonth > -1 ? 'months' : 'ultimos';
      if (this.frequency.isUltimos == 'months') {
        this.selectedMonths.push('' + data.day);
      } else {
        if (data.day === 0) {
          data.day = 1;
        }
        this.selectedMonthsU.push('' + Math.abs(data.day));
      }
    } else if (data.secondOfWeeks || data.secondOfWeeks == 0) {
      this.frequency.tab = 'specificWeekDays';
      this.frequency.specificWeekDay = data.specificWeekDay.toString();
      this.frequency.specificWeek = data.specificWeek.toString();
    } else if (data.date) {
      this.frequency.tab = 'specificDays';
      this.tempDates = [{
        startDate: new Date(data.date * 1000),
        endDate: new Date(data.date * 1000),
        color: 'blue'
      }];
      $('#calendar').calendar({
        language: this.coreService.getLocale(),
        clickDay: (e) => {
          this.selectDate(e);
        }
      }).setDataSource(this.tempDates);
    } else {
      this.frequency.tab = 'weekDays';
      this.frequency.days = (!data.frequency && data.day == '1') ? ['1', '2', '3', '4', '5', '6', '7'] : [data.day.toString()];
      this.checkDays();
    }
    this.editor.isEnable = true;
    this.ref.detectChanges();
  }

  removeFrequency(data, index): void {
    this.isValid = true;
    this.data.periodList.splice(index, 1);
  }

  addPeriod(data): void {
    this.editPeriod(null, data);
  }

  editPeriod(period, data): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: TimeEditorComponent,
      nzAutofocus: null,
      nzData: {
        data,
        period,
        isTooltipVisible: this.isTooltipVisible,
        isCycle: false
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
export class FindAndReplaceComponent {
  readonly modalData: any = inject(NZ_MODAL_DATA);
  agents: any = [];
  preferences: any = {};

  listOfAllAgents = [];
  listOfAgents = [];
  object = {
    replace: '',
    agentName: '',
    finds: []
  };

  @ViewChild('selectBox', {static: true}) sb;

  constructor(public activeModal: NzModalRef, private coreService: CoreService) {
  }

  ngOnInit(): void {
    this.agents = this.modalData.agents || [];
    this.preferences = this.modalData.preferences || {};

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

  selectSubagentCluster(cluster): void {
    if (cluster) {
      this.object.agentName = cluster.title;
    } else {
      delete this.object.agentName;
    }
  }

  onSubmit(): void {
    this.activeModal.close(this.object);
  }
}

@Component({
  selector: 'app-show-reference',
  templateUrl: './show-reference-dialog.html'
})
export class ShowReferenceComponent {
  readonly modalData: any = inject(NZ_MODAL_DATA);
  type: string;
  obj: any;
  preferences: any;
  data: any = {};

  constructor(public activeModal: NzModalRef, private coreService: CoreService, private calendarService: CalendarService) {
  }

  ngOnInit(): void {
    this.type = this.modalData.type;
    this.obj = this.modalData.obj;
    this.preferences = this.modalData.preferences;
    this.getReferences();
  }

  private getReferences(): void {
    this.coreService.post('inventory/workflow/references', this.obj).subscribe({
      next: (res: any) => {
        this.data = res;
        if (this.type === 'SCHEDULE') {
          let dateFormat = this.coreService.getDateFormat(this.preferences.dateFormat);
          for (let i in this.data.schedules) {
            for (let j in this.data.schedules[i].calendars) {
              this.calendarService.convertObjToArr(this.data.schedules[i].calendars[j], dateFormat);
            }
          }
        }
      }
    });
  }

  navToObj(path: string, type?): void {
    if (type) {
      this.activeModal.close({
        name: path, type
      });
    } else {
      this.activeModal.close({
        path, type: this.type
      });
    }
  }

  getPeriodStr(period): string {
    let periodStr = null;
    if (period.begin) {
      periodStr = period.begin;
    }
    if (period.end) {
      periodStr = periodStr + '-' + period.end;
    }
    if (period.singleStart) {
      periodStr = 'Single start: ' + period.singleStart;
    } else if (period.repeat) {
      periodStr = periodStr + ' every ' + this.calendarService.getTimeInString(period.repeat);
    }
    return periodStr;
  }
}

@Component({
  selector: 'app-job-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './job-text-editor.html'
})
export class JobComponent {
  @Input() schedulerId: any;
  @Input() selectedNode: any;
  @Input() jobs: any;
  @Input() preferences: any;
  @Input() jobResourcesTree = [];
  @Input() documentationTree = [];
  @Input() scriptTree = [];
  @Input() orderPreparation;
  @Input() agents: any = [];
  @Input() isTooltipVisible: boolean;
  @Input() isModal: boolean;
  @Input() exactMatch: boolean;
  @Input() timeZone;
  @Input() checkboxObjects: any = {};

  history = [];
  indexOfNextAdd = 0;
  error: boolean;
  errorMsg: string;
  invalidName: string;
  obj: any = {};
  isDisplay = true;
  isRuntimeVisible = false;
  isReloading = false;
  fullScreen = false;
  isLengthExceed = false;
  index = 0;
  presentObj: any = {};
  returnCodes: any = {on: 'success'};
  state: any = {};
  jobresources = {
    list: []
  }

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
    name: ''
  };

  variableList = [];
  filteredOptions = [];
  mentionValueList = [];
  copiedParamObjects: any = {};
  hasLicense: boolean;
  isTreeShow = false;
  subscription: Subscription;

  @ViewChild('codeMirror', {static: false}) cm: any;

  @Output() updateFromJobTemplateFn: EventEmitter<any> = new EventEmitter();

  constructor(public coreService: CoreService, private modal: NzModalService, private ref: ChangeDetectorRef,
              private workflowService: WorkflowService, private dataService: DataService, private message: NzMessageService) {
    this.subscription = dataService.reloadWorkflowError.subscribe(res => {
      if (res.error) {
        this.error = res.error;
        if (res.msg && res.msg.match('duplicateLabel')) {
          this.errorMsg = res.msg;
        }
        if (res.msg && res.msg.match('Invalid name')) {
          this.invalidName = 'inventory.message.nameIsNotValid';
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
    const self = this;
    this.isTreeShow = false;
    if (!this.isModal) {
      this.updateVariableList();
    }

    setTimeout(() => {
      if (this.cm && this.cm.codeMirror) {
        this.cm.codeMirror.setOption("extraKeys", {
          "Ctrl-Space": function (editor) {
            const cursor = editor.getCursor();
            self.isTreeShow = true;
            self.ref.detectChanges();
            setTimeout(() => {
              const dom = $('#show-tree');
              dom?.css({
                'opacity': '1',
                'top': (cursor.line > 0 ? (cursor.line * 18.7) + 24 : 24) + 'px',
                'left': '36px',
                'width': 'calc(100% - 48px)'
              });
            }, 0)
          }
        })
      }
    }, 100);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedNode']) {
      this.history = [];
      this.indexOfNextAdd = 0;
      this.isRuntimeVisible = false;
      this.reset();
      this.init();
      this.presentObj.obj = JSON.stringify(this.selectedNode.obj);
      this.presentObj.job = JSON.stringify(this.selectedNode.job);
    }
    if (changes['orderPreparation']) {
      this.updateVariableList();
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  navToJobTemp(name): void {
    this.dataService.reloadTree.next({navigate: {name, type: InventoryObject.JOBTEMPLATE}});
  }

  changeType(): void {
    this.saveToHistory();
  }

  checkLength(): void {
    const len = JSON.stringify(this.selectedNode.job.notification).length;
    this.isLengthExceed = len > 1000;
  }

  changeAgentSelection($event) {
    if ($event == 'expression') {
      this.selectedNode.job.agentName2 = this.selectedNode.job.agentName;
      if (this.selectedNode.job && this.selectedNode.job.agentName1) {
        this.selectedNode.job.agentName = this.selectedNode.job.agentName1;
        delete this.selectedNode.job.agentName1;
      } else if (this.selectedNode.job.agentName3) {
        this.selectedNode.job.agentName = this.selectedNode.job.agentName3;
        delete this.selectedNode.job.agentName3;
      } else {
        delete this.selectedNode.job.agentName;
      }
    } else {
      if (this.selectedNode.job.agentName2) {
        this.selectedNode.job.agentName1 = this.selectedNode.job.agentName;
        this.selectedNode.job.agentName = this.selectedNode.job.agentName2;
      }
      if (!this.selectedNode.job.agentName1 && this.selectedNode.job.agentName) {
        this.selectedNode.job.agentName3 = this.selectedNode.job.agentName;
        delete this.selectedNode.job.agentName;
      }
      delete this.selectedNode.job.agentName2;
    }
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
      this.updateSelectItems();
    }
  }

  focusChange(): void {
    this.obj.script = false;
  }

  selectSubagentCluster(cluster): void {
    if (cluster) {
      this.selectedNode.job.agentName1 = cluster.title;
    } else {
      delete this.selectedNode.job.agentName1;
    }
  }

  openJobWizard(): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: JobWizardComponent,
      nzClassName: 'lg',
      nzAutofocus: null,
      nzData: {
        existingJob: this.selectedNode.job,
        node: this.selectedNode.obj
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        this.updateJobFromWizardJob(result);
      }
    });
  }

  private updateJobFromWizardJob(result): void {
    this.selectedNode.job.executable.TYPE = result.executable.TYPE;
    this.selectedNode.job.executable.className = result.executable.className;
    this.selectedNode.job.executable.script = result.executable.script;
    if (this.selectedNode.job.executable.TYPE === 'InternalExecutable') {
      this.selectedNode.job.executable.arguments = result.executable.arguments || [];
      if (!isArray(this.selectedNode.job.executable.arguments)) {
        this.selectedNode.job.executable.arguments = this.coreService.convertObjectToArray(this.selectedNode.job.executable, 'arguments');
        this.selectedNode.job.executable.arguments.forEach((argu) => {
          this.coreService.removeSlashToString(argu, 'value');
        });
      }
      this.selectedNode.job.executable.jobArguments = result.executable.jobArguments || [];
      if (!isArray(this.selectedNode.job.executable.jobArguments)) {
        this.selectedNode.job.executable.jobArguments = this.coreService.convertObjectToArray(this.selectedNode.job.executable, 'jobArguments');
        this.selectedNode.job.executable.jobArguments.forEach((argu) => {
          this.coreService.removeSlashToString(argu, 'value');
        });
      }
    } else {
      this.selectedNode.job.executable.env = result.executable.env || [];
      if (!isArray(this.selectedNode.job.executable.env)) {
        this.selectedNode.job.executable.env = this.coreService.convertObjectToArray(this.selectedNode.job.executable, 'env');
        this.selectedNode.job.executable.env.forEach((env) => {
          this.coreService.removeSlashToString(env, 'value');
        });
      }
    }
    this.selectedNode.job.executable.login = result.executable.login || {};
    this.selectedNode.job.executable.returnCodeMeaning = result.executable.returnCodeMeaning || {};
    if (result.notification) {
      this.selectedNode.job.notification = result.notification || {mail: {}};
    }
    this.selectedNode.job.title = result.title;
    this.selectedNode.job.documentationName = result.documentationName;
    if (result.jobTemplateName) {
      this.selectedNode.job.jobTemplate = {name: result.jobTemplateName, hash: result.hash};
      this.getJobTemplate();
    } else {
      delete this.selectedNode.job.jobTemplate;
    }
    if (result.admissionTimeScheme) {
      this.selectedNode.job.admissionTimeScheme = result.admissionTimeScheme;
    }
    if (result.jobTemplateName) {
      this.selectedNode.job.criticality = result.criticality;
      this.selectedNode.job.warnIfShorter = result.warnIfShorter;
      this.selectedNode.job.warnIfLonger = result.warnIfLonger;
      this.selectedNode.job.timeout = result.timeout;
      this.selectedNode.job.timeout1 = this.workflowService.convertDurationToString(this.selectedNode.job.timeout);
      this.selectedNode.job.graceTimeout = result.graceTimeout;
      this.selectedNode.job.graceTimeout1 = this.workflowService.convertDurationToString(this.selectedNode.job.graceTimeout);
      this.selectedNode.job.failOnErrWritten = result.failOnErrWritten;
      this.selectedNode.job.warnOnErrWritten = result.warnOnErrWritten;
      this.selectedNode.job.skipIfNoAdmissionForOrderDay = result.skipIfNoAdmissionForOrderDay;
      this.selectedNode.job.parallelism = result.parallelism;
      this.selectedNode.job.jobResourceNames = result.jobResourceNames || [];
    }
    this.ref.detectChanges();
  }

  showEditor(): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: ScriptEditorComponent,
      nzClassName: 'lg script-editor',
      nzAutofocus: null,
      nzData: {
        script: this.selectedNode.job.executable.script,
        scriptTree: this.scriptTree,
        disabled: (this.selectedNode.job && this.selectedNode.job.jobTemplate && this.selectedNode.job.jobTemplate.name)
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
    if (arr.length > 0) {
      this.coreService.showCopyMessage(this.message, operation === 'CUT' ? 'cut' : 'copied');
    }
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

  openEditor(data: any): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: ValueEditorComponent,
      nzClassName: 'lg',
      nzAutofocus: null,
      nzData: {
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

  onBlur(): void {
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

  onBlurTree(value: string): void {
    $('.ant-select-tree-dropdown').hide();
    this.checkExpectNoticeExp(value);
  }

  checkExpectNoticeExp(name): void {
    this.isTreeShow = false;
    this.ref.detectChanges();
    if (name) {
      const doc = this.cm.codeMirror.getDoc();
      const cursor = doc.getCursor(); // gets the line number in the cursor position
      const currentLine = this.cm.codeMirror.getLine(cursor.line);
      const isSpace = cursor.ch > 0 ? currentLine.substring(cursor.ch - 1, cursor.ch) == ' ' : true;

      let str = (!isSpace ? ' ' : '');
      let text = name;
      if (!currentLine.substring(0, cursor.ch).match(/##!include/)) {
        text = '##!include ' + name;
      }
      str = str + text + ' ';
      doc.replaceRange(str, cursor);
      cursor.ch = cursor.ch + (text.length);

      this.cm.codeMirror.focus();
      doc.setCursor(cursor);
    }
  }

  onChangeJobResource(value): void {
    if (!isEqual(JSON.stringify(this.selectedNode.job.jobResourceNames), JSON.stringify(this.jobresources.list))) {
      this.selectedNode.job.jobResourceNames = this.coreService.clone(this.jobresources.list);
    }
  }

  validateReturnCode(value, form): void {
    if (form.control['status'] === 'INVALID') {
      value[form.name] = '0';
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

  getJobTemplate(): void {
    if (this.selectedNode.job.jobTemplate && this.selectedNode.job.jobTemplate.hash) {
      this.coreService.post('job_template/state', {
        jobTemplate: this.selectedNode.job.jobTemplate
      }).subscribe({
        next: (res) => {
          this.state = res;
        }
      })
    }
  }

  checkJobInfo(): void {
    if (!this.selectedNode.obj.jobName) {
      this.selectedNode.obj.jobName = 'job';
    }
    this.selectedNode.obj.jobName = this.selectedNode.obj.jobName.trim();
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
      // data.name = '';
      // data.value = '';
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
      // env.name = env.name.toUpperCase();
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

  private init(): void {
    this.hasLicense = sessionStorage['hasLicense'] == 'true';
    this.copiedParamObjects = this.coreService.getConfigurationTab().copiedParamObjects;
    this.getJobInfo();
    this.getJobTemplate();
    this.selectedNode.obj.defaultArguments = this.coreService.convertObjectToArray(this.selectedNode.obj, 'defaultArguments');
    this.selectedNode.obj.defaultArguments.forEach((argu) => {
      this.coreService.removeSlashToString(argu, 'value');
    });
    if (this.selectedNode.obj.defaultArguments && this.selectedNode.obj.defaultArguments.length === 0) {
      this.addArgument();
    }
    if (this.selectedNode.job.jobResourceNames && this.selectedNode.job.jobResourceNames.length > 0) {
      this.jobresources.list = this.coreService.clone(this.selectedNode.job.jobResourceNames);
    }

    this.onBlur();
    const dom = $('#agentId');
    let flag = false;
    if (document.activeElement === document.getElementById('agentId')) {
      dom.blur();
      flag = true;
    }
    if (this.selectedNode.job.subagentClusterId) {
      this.selectedNode.job.agentName1 = this.selectedNode.job.agentName;
      this.selectedNode.job.agentName = this.selectedNode.job.subagentClusterId;
      delete this.selectedNode.job.subagentClusterId;
    }
    if (flag) {
      setTimeout(() => {
        dom.focus();
      }, 500)
    }
    this.presentObj.obj = JSON.stringify(this.selectedNode.obj);
    this.presentObj.job = JSON.stringify(this.selectedNode.job);
  }

  private setJobProperties(): void {
    if (!this.selectedNode.job.parallelism) {
      this.selectedNode.job.parallelism = 1;
    }
    if (!this.selectedNode.job.graceTimeout) {
      this.selectedNode.job.graceTimeout = 1;
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
    if (this.hasLicense && (this.selectedNode.job.subagentClusterIdExpr || this.selectedNode.job.withSubagentClusterIdExpr)) {
      this.selectedNode.radio = 'expression';
      if (this.selectedNode.job.subagentClusterIdExpr) {
        this.coreService.removeSlashToString(this.selectedNode.job, 'subagentClusterIdExpr');
      }
    } else {
      this.selectedNode.radio = 'agent';
    }

    if (!this.selectedNode.job.executable.returnCodeMeaning) {
      this.selectedNode.job.executable.returnCodeMeaning = {
        success: '0'
      };
    }

    this.returnCodes.on = this.selectedNode.job.executable.returnCodeMeaning.failure ? 'failure' : 'success';

    if (!this.selectedNode.job.defaultArguments || isEmpty(this.selectedNode.job.defaultArguments)) {
      this.selectedNode.job.defaultArguments = [];
    } else {
      if (!isArray(this.selectedNode.job.defaultArguments)) {
        this.selectedNode.job.defaultArguments = this.coreService.convertObjectToArray(this.selectedNode.job, 'defaultArguments');
        this.selectedNode.job.defaultArguments.forEach((argu) => {
          this.coreService.removeSlashToString(argu, 'value');
        });
      }
    }
    if (!this.selectedNode.job.executable.arguments || isEmpty(this.selectedNode.job.executable.arguments)) {
      this.selectedNode.job.executable.arguments = [];
    } else {
      if (!isArray(this.selectedNode.job.executable.arguments)) {
        this.selectedNode.job.executable.arguments = this.coreService.convertObjectToArray(this.selectedNode.job.executable, 'arguments');
        this.selectedNode.job.executable.arguments.forEach((argu) => {
          this.coreService.removeSlashToString(argu, 'value');
        });
      }
    }

    if (!this.selectedNode.job.executable.jobArguments || isEmpty(this.selectedNode.job.executable.jobArguments)) {
      this.selectedNode.job.executable.jobArguments = [];
    } else {
      if (!isArray(this.selectedNode.job.executable.jobArguments)) {
        this.selectedNode.job.executable.jobArguments = this.coreService.convertObjectToArray(this.selectedNode.job.executable, 'jobArguments');
        this.selectedNode.job.executable.jobArguments.forEach((argu) => {
          this.coreService.removeSlashToString(argu, 'value');
        });
      }
    }

    if (!this.selectedNode.job.executable.env || isEmpty(this.selectedNode.job.executable.env)) {
      this.selectedNode.job.executable.env = [];
    } else {
      if (!isArray(this.selectedNode.job.executable.env)) {
        this.selectedNode.job.executable.env = this.coreService.convertObjectToArray(this.selectedNode.job.executable, 'env');
        this.selectedNode.job.executable.env.forEach((env) => {
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
    this.selectedNode.job = JSON.parse(obj.job);
    this.ref.detectChanges();
  }

  updateFromJobTemplate(): void {
    // $('div.floating-action-menu').removeClass('active');
    if (this.state._text !== 'IN_SYNC') {
      this.updateFromJobTemplateFn.emit(this.selectedNode)
    }
  }
}

@Component({
  selector: 'app-script-content',
  templateUrl: './script-editor.html'
})
export class ScriptEditorComponent implements AfterViewInit, OnInit {
  readonly modalData: any = inject(NZ_MODAL_DATA);
  script: any;
  scriptTree: any = [];
  disabled: boolean;
  isTreeShow = false;
  dragEle: any;
  scriptObj = {
    data: ''
  };
  cmOption: any = {
    lineNumbers: true,
    scrollbarStyle: 'simple',
    viewportMargin: Infinity,
    autoRefresh: true,
    mode: 'shell'
  };
  @ViewChild('codeMirror', {static: false}) cm: any;

  constructor(private coreService: CoreService, public activeModal: NzModalRef, private dragDrop: DragDrop) {
  }

  ngOnInit(): void {
    this.script = this.modalData.script;
    this.scriptTree = this.modalData.scriptTree;
    this.disabled = this.modalData.disabled;
    if (this.disabled) {
      this.cmOption.reladOnly = true;
    }
  }

  ngAfterViewInit(): void {
    this.dragEle = this.dragDrop.createDrag(this.activeModal.containerInstance.modalElementRef.nativeElement);
    $('#resizable').resizable({
      resize: (e, x) => {
        const dom: any = document.getElementsByClassName('script-editor')[0];
        this.cm.codeMirror.setSize((x.size.width - 2), (x.size.height - 2));
        dom.style.setProperty('width', (x.size.width + 32) + 'px', 'important');
      }, stop: (e, x) => {
        localStorage['$SOS$SCRIPTWINDOWWIDTH'] = x.size.width;
        localStorage['$SOS$SCRIPTWINDOWHIGHT'] = x.size.height;
      }
    });

    setTimeout(() => {
      if (this.cm && this.cm.codeMirror) {
        if (localStorage['$SOS$SCRIPTWINDOWWIDTH']) {
          const wt = parseInt(localStorage['$SOS$SCRIPTWINDOWWIDTH'], 10);
          this.cm.codeMirror.setSize(wt - 2, (parseInt(localStorage['$SOS$SCRIPTWINDOWHIGHT'], 10) - 2));
          $('.ant-modal').css('cssText', 'width : ' + (wt + 32) + 'px !important');
        }
      }
    }, 100);

    const self = this;
    this.isTreeShow = false;
    setTimeout(() => {
      if (this.cm && this.cm.codeMirror) {
        setTimeout(() => {
          let arr = this.script?.split('\n') || [];
          const doc = this.cm.codeMirror.getDoc();
          const cursor = doc.getCursor();  // gets the line number in the cursor position
          doc.replaceRange(this.script, cursor);
          cursor.line = arr.length > 0 ? arr.length - 1 : 0;
          cursor.ch = arr.length > 0 ? arr[arr.length - 1]?.length + 1 : 0;
          this.cm.codeMirror.focus();
          doc.setCursor(cursor);
        }, 400);

        this.cm.codeMirror.setOption("extraKeys", {
          "Ctrl-Space": function (editor) {
            const cursor = editor.getCursor();
            self.isTreeShow = true;
            setTimeout(() => {
              const dom = $('#show-tree-editor');
              dom?.css({
                'opacity': '1',
                'top': (cursor.line > 0 ? (cursor.line * 18.7) + 24 : 24) + 'px',
                'left': '36px',
                'width': 'calc(100% - 48px)'
              });
            }, 0)
          }
        })
      }
    }, 0);
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(e): void {
    try {
      if (this.dragEle && e && e.target) {
        this.dragEle.disabled = !((e.target.getAttribute('class') === 'modal-header' || e.target.getAttribute('class') === 'drag-text'));
      }
    } catch (e) {
    }
  }

  onSubmit(): void {
    this.activeModal.close(this.scriptObj.data);
  }

  execCommand(type): void {
    this.cm.codeMirror.execCommand(type);
    this.coreService.updateReplaceText();
  }

  onBlur(value: string): void {
    $('.ant-select-tree-dropdown').hide();
    this.checkExpectNoticeExp(value);
  }

  checkExpectNoticeExp(name): void {
    this.isTreeShow = false;
    if (name) {
      const doc = this.cm.codeMirror.getDoc();
      const cursor = doc.getCursor(); // gets the line number in the cursor position
      const currentLine = this.cm.codeMirror.getLine(cursor.line);
      const isSpace = cursor.ch > 0 ? currentLine.substring(cursor.ch - 1, cursor.ch) == ' ' : true;

      let str = (!isSpace ? ' ' : '');
      let text = name;
      if (!currentLine.substring(0, cursor.ch).match(/##!include/)) {
        text = '##!include ' + name;
      }
      str = str + text + ' ';
      doc.replaceRange(str, cursor);
      cursor.ch = cursor.ch + (text.length);

      this.cm.codeMirror.focus();
      doc.setCursor(cursor);
    }
  }

}

@Component({
  selector: 'app-expression-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './expression-editor.html'
})
export class ExpressionComponent {
  @Input() selectedNode: any;
  @Input() error: any;
  @Input() isTooltipVisible: boolean;
  expression: any = {};
  operators = ['==', '!=', '<', '<=', '>', '>=', 'in', '&&', '||', '!'];
  functions = ['toNumber', 'toBoolean'];
  variablesOperators = ['matches', 'startWith', 'endsWith', 'contains'];
  varExam = 'variable ("aString", default="") matches ".*"';
  lastSelectOperator = '';
  @ViewChild('codeMirror', {static: true}) cm;
  cmOption: any = {
    lineNumbers: false,
    scrollbarStyle: 'simple',
    autoFocus: true,
    autoRefresh: true,
    mode: 'ruby'
  };

  constructor() {
  }

  ngOnInit(): void {
    this.expression.type = 'returnCode';
    this.change();

  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.cm && this.cm.codeMirror) {
        let arr = this.selectedNode.obj.predicate?.split('\n') || [];
        const doc = this.cm.codeMirror.getDoc();
        const cursor = doc.getCursor();  // gets the line number in the cursor position
        doc.replaceRange('', cursor);
        cursor.line = arr.length > 0 ? arr.length - 1 : 0;
        cursor.ch = arr.length > 0 ? arr[arr.length - 1]?.length + 1 : 0;
        this.cm.codeMirror.focus();
        doc.setCursor(cursor);
      }
    }, 400);
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
  @ViewChild('codeMirror', {static: false}) cm;

  searchNode = {
    text: ''
  }
  jobResourcesTree = [];
  documentationTree = [];
  workflowTree = [];
  lockTree = [];
  boardTree = [];
  tempTree = [];
  scriptTree = [];
  configXml = './assets/mxgraph/config/diagrameditor.xml';
  editor: any;
  dummyXml: any;
  // Declare Map object to store closeable instructions Ids
  nodeMap = new Map();
  droppedCell: any;
  movedCells: any = [];
  isCellDragging = false;
  display = false;
  propertyPanelWidth: number;
  selectedNode: any;
  node: any;
  isReferencedBy: any;
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
  cutCell: any = [];
  copyId: any = [];
  allNodes: any = [];
  skipXMLToJSONConversion = false;
  objectType = InventoryObject.WORKFLOW;
  invalidMsg: string;
  inventoryConf: any;
  allowedDatatype = ['String', 'Number', 'Boolean', 'Final', 'List'];
  variableDeclarations = {parameters: []};
  document = {name: ''};
  fullScreen = false;
  isSearchVisible = false;
  keyHandler: any;
  lastModified: any = '';
  hasLicense: boolean;
  positions: any;
  info1 = '';
  info2 = '';
  info3 = '';
  forkListAgentAssignment = '';
  stickySubagentAgentAssignment = '';
  selectedCellId = '';

  subscription1: Subscription;
  subscription2: Subscription;

  @ViewChild('menu', {static: true}) menu: NzDropdownMenuComponent;

  constructor(public coreService: CoreService, private translate: TranslateService, private modal: NzModalService, public inventoryService: InventoryService,
              private toasterService: ToastrService, public workflowService: WorkflowService, private dataService: DataService, private message: NzMessageService,
              private nzContextMenuService: NzContextMenuService, private router: Router, private ref: ChangeDetectorRef) {
    this.hasLicense = sessionStorage['hasLicense'] == 'true';
    this.subscription1 = dataService.reloadTree.subscribe(res => {
      if (res && !isEmpty(res)) {
        if (res.reloadTree && this.workflow.actual) {
          this.ref.detectChanges();
        } else if (res.saveObject && this.selectedNode) {
          if (res.saveObject.id || res.saveObject.objectType) {
            if ((res.saveObject.id && res.saveObject.id === this.data.id)
              || (res.saveObject.name === this.data.name && res.saveObject.path === this.data.path)) {
              this.initEditorConf(this.editor, false, true);
            }
          } else {

            this.initEditorConf(this.editor, false, true);
          }
        }
      }
    });
    this.subscription2 = dataService.eventAnnounced$.subscribe(res => {
      this.refresh(res);
    });
    this.zones = coreService.getTimeZoneList();
    this.translate.get('inventory.tooltips.workflow.forkList.infoOfListVariable').subscribe(translatedValue => {
      translatedValue = translatedValue.replace(new RegExp(/\n/, 'gi'), '<br\>');
      this.info1 = this.coreService.convertTextToLink(translatedValue, '');
    });
    if (this.hasLicense) {
      this.translate.get('inventory.tooltips.workflow.forkList.infoOfSubagentCluster').subscribe(translatedValue => {
        translatedValue = translatedValue.replace(new RegExp(/\n/, 'gi'), '<br\>');
        this.info2 = this.coreService.convertTextToLink(translatedValue, '');
      });
      this.translate.get('inventory.tooltips.workflow.stickySubagent.infoMessage').subscribe(translatedValue => {
        translatedValue = translatedValue.replace(new RegExp(/\n/, 'gi'), '<br\>');
        this.info3 = this.coreService.convertTextToLink(translatedValue, '');
      });
      this.translate.get('inventory.tooltips.workflow.forkList.agentAssignment').subscribe(translatedValue => {
        translatedValue = translatedValue.replace(new RegExp(/\n/, 'gi'), '<br\>');
        this.forkListAgentAssignment = translatedValue;
      });
      this.translate.get('inventory.tooltips.workflow.stickySubagent.agentAssignment').subscribe(translatedValue => {
        translatedValue = translatedValue.replace(new RegExp(/\n/, 'gi'), '<br\>');
        this.stickySubagentAgentAssignment = translatedValue;
      });
    }
  }

  private static parseWorkflowJSON(result): void {
    if (result.jobs && !isEmpty(result.jobs)) {
      for (const x in result.jobs) {
        const v: any = result.jobs[x];
        if (v.executable.TYPE === 'ScriptExecutable') {
          result.jobs[x].executable.TYPE = 'ShellScriptExecutable';
        }
        result.jobs[x] = {
          agentName: v.agentName || v.agentId,
          subagentClusterId: v.subagentClusterId,
          subagentClusterIdExpr: v.subagentClusterIdExpr,
          withSubagentClusterIdExpr: v.withSubagentClusterIdExpr,
          executable: v.executable,
          defaultArguments: v.defaultArguments,
          jobResourceNames: v.jobResourceNames,
          jobClass: v.jobClass,
          title: v.title,
          documentationName: v.documentationName,
          admissionTimeScheme: v.admissionTimeScheme,
          skipIfNoAdmissionForOrderDay: v.skipIfNoAdmissionForOrderDay,
          returnCodeMeaning: v.returnCodeMeaning,
          logLevel: v.logLevel,
          criticality: v.criticality,
          timeout: v.timeout,
          graceTimeout: v.graceTimeout,
          failOnErrWritten: v.failOnErrWritten,
          warnOnErrWritten: v.warnOnErrWritten,
          warnIfShorter: v.warnIfShorter,
          warnIfLonger: v.warnIfLonger,
          notification: v.notification,
          parallelism: v.parallelism
        };
      }
    }
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
    if (changes['data']) {
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
    if (this.data.type) {
      this.saveCopyInstruction();
      this.saveJSON(false);
    }
    try {
      if (this.editor) {
        this.editor.destroy();
        mxOutline.prototype.destroy();
        this.keyHandler.destroy();
        this.editor = null;
        $('.mxTooltip').css({visibility: 'hidden'})
      }
    } catch (e) {
      console.error(e);
    }
  }

  private refresh(args: { eventSnapshots: any[] }): void {
    if (args.eventSnapshots && args.eventSnapshots.length > 0) {
      for (let j = 0; j < args.eventSnapshots.length; j++) {
        if (args.eventSnapshots[j].path) {
          if (args.eventSnapshots[j].eventType.match(/ItemChanged/) && args.eventSnapshots[j].objectType === this.objectType) {
            const path = this.data.path + (this.data.path === '/' ? '' : '/') + this.data.name;
            if (args.eventSnapshots[j].path === path) {
              this.getWorkflowObject();
              break;
            }
          } else if (args.eventSnapshots[j].eventType.match(/InventoryTreeUpdated/)) {
            this.initTreeObject(true);
            break;
          }
        }
      }
    }
  }

  private initTreeObject(flag = false): void {
    if (this.lockTree.length === 0 || flag) {
      this.coreService.post('tree', {
        controllerId: this.schedulerId,
        forInventory: true,
        types: [InventoryObject.LOCK]
      }).subscribe((res) => {
        this.lockTree = this.coreService.prepareTree(res, true);
      });
    }
    if (this.workflowTree.length === 0 || flag) {
      this.coreService.post('tree', {
        controllerId: this.schedulerId,
        forInventory: true,
        types: [InventoryObject.WORKFLOW]
      }).subscribe((res) => {
        this.workflowTree = this.coreService.prepareTree(res, true);
      });
    }
    if (this.boardTree.length === 0 || flag) {
      this.coreService.post('tree', {
        controllerId: this.schedulerId,
        forInventory: true,
        types: [InventoryObject.NOTICEBOARD]
      }).subscribe((res) => {
        this.boardTree = this.coreService.prepareTree(res, false);
      });
    }
    if (this.scriptTree.length === 0 || flag) {
      this.coreService.post('tree', {
        controllerId: this.schedulerId,
        forInventory: true,
        types: [InventoryObject.INCLUDESCRIPT]
      }).subscribe((res) => {
        this.scriptTree = this.coreService.prepareTree(res, false);
      });
    }
    if (this.jobResourcesTree.length === 0 || flag) {
      this.coreService.post('tree', {
        controllerId: this.schedulerId,
        forInventory: true,
        types: [InventoryObject.JOBRESOURCE]
      }).subscribe((res) => {
        this.jobResourcesTree = this.coreService.prepareTree(res, false);
      });
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

  selectSearchNode(value) {
    if (this.editor && this.editor.graph) {
      const graph = this.editor.graph;
      const model = graph.getModel();
      if (model.cells) {
        for (const prop in model.cells) {
          if (model.cells[prop].getAttribute('uuid') === value) {
            const cell = model.cells[prop];
            const bounds = this.editor.graph.getGraphBounds();
            let state = this.editor.graph.view.getState(cell);
            this.editor.graph.view.setTranslate(((this.editor.graph.container.clientWidth / 2) - (state.width / 2) - (state.x - bounds.x)),
              (bounds.y - (state.y - ((this.editor.graph.container.clientHeight / 2) - (state.height / 2)))));
            graph.clearSelection();
            graph.setSelectionCell(cell);
            this.initEditorConf(this.editor, false, false, true);
            this.searchNode = {text: ''};
            $('#searchTree input').blur();
            $('#workflowHeader').removeClass('hide-on-focus')
            break;
          }
        }
      }
    }
  }

  @HostListener('window:click', ['$event'])
  onClick(event): void {
    const dom = $('#searchTree');
    if (!dom.hasClass('ant-select-focused')) {
      if (event.target.id === 'search-container') {
        dom.addClass('ant-select-focused');
      } else {
        $('#workflowHeader').removeClass('hide-on-focus');
      }
    }
  }

  changeAgentSelection($event) {
    if ($event == 'expression') {
      this.selectedNode.obj.agentName2 = this.selectedNode.obj.agentName;
      if (this.selectedNode.obj && this.selectedNode.obj.agentName1) {
        this.selectedNode.obj.agentName = this.selectedNode.obj.agentName1;
        delete this.selectedNode.obj.agentName1;
      } else if (this.selectedNode.obj.agentName3) {
        this.selectedNode.obj.agentName = this.selectedNode.obj.agentName3;
        delete this.selectedNode.obj.agentName3;
      }
    } else {
      if (this.selectedNode.obj.agentName2) {
        this.selectedNode.obj.agentName1 = this.selectedNode.obj.agentName;
        this.selectedNode.obj.agentName = this.selectedNode.obj.agentName2;
      }
      if (!this.selectedNode.obj.agentName1 && this.selectedNode.obj.agentName) {
        this.selectedNode.obj.agentName3 = this.selectedNode.obj.agentName;
        delete this.selectedNode.obj.agentName;
      }
      delete this.selectedNode.obj.agentName2;
    }
  }

  propagateJobs(): void {
    if (this.selectedNode.type === 'ForkList') {
      this.updateForkListOrStickySubagentJobs(this.selectedNode, false, true);
    } else if (this.selectedNode.type === 'StickySubagent') {
      this.updateForkListOrStickySubagentJobs(this.selectedNode, true, true);
    }
  }

  recursiveUpdate(): void {
    $('#searchTree input').focus();
    $('#workflowHeader').addClass('hide-on-focus');
    const self = this;
    let nodes: any = {
      children: []
    };

    function recursive(json, obj) {
      if (json.instructions) {
        for (let x = 0; x < json.instructions.length; x++) {
          let child: any = {
            title: json.instructions[x].TYPE,
            key: json.instructions[x].uuid
          };
          if (json.instructions[x].jobName) {
            child.title += ' - ' + json.instructions[x].jobName;
          } else if (json.instructions[x].noticeBoardNames && json.instructions[x].noticeBoardNames.length > 0) {
            child.title += ' - ' + (json.instructions[x].TYPE === 'PostNotices' ? json.instructions[x].noticeBoardNames.join(',') : json.instructions[x].noticeBoardNames);
          } else if (json.instructions[x].demands && json.instructions[x].demands.length > 0) {
            child.title += ' - ' + json.instructions[x].demands[0].lockName;
          }
          if (!self.workflowService.isInstructionCollapsible(json.instructions[x].TYPE)) {
            child.isLeaf = true;
          } else {
            child.children = [];
          }
          obj.children.push(child);

          if (json.instructions[x].TYPE === 'Fork') {
            if (json.instructions[x].branches) {
              for (let i = 0; i < json.instructions[x].branches.length; i++) {
                if (json.instructions[x].branches[i].instructions) {
                  let obj1 = {
                    title: 'branch - ' + json.instructions[x].branches[i].id,
                    disabled: true,
                    key: json.instructions[x].uuid + json.instructions[x].branches[i].id,
                    children: []
                  };
                  child.children.push(obj1);
                  recursive(json.instructions[x].branches[i], obj1);
                }
              }
            }
          }

          if (json.instructions[x].instructions) {
            recursive(json.instructions[x], child);
          }

          if (json.instructions[x].then && json.instructions[x].then.instructions) {
            recursive(json.instructions[x].then, child);
          }
          if (json.instructions[x].else && json.instructions[x].else.instructions) {
            let obj = {title: "Else", disabled: true, key: json.instructions[x].uuid + 'else', children: []};
            child.children.push(obj);
            recursive(json.instructions[x].else, obj);
          }
          if (json.instructions[x].catch && json.instructions[x].catch.instructions) {
            let obj = {title: "Catch", disabled: true, key: json.instructions[x].uuid + 'catch', children: []};
            child.children.push(obj);
            recursive(json.instructions[x].catch, obj);
          }
        }
      }
    }

    recursive(this.workflow.configuration, nodes);
    self.allNodes = nodes.children;
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
        xhr.request.onreadystatechange = function () {
          if (this.readyState === this.DONE) {
            const node = xhr.getDocumentElement();
            editor = new mxEditor(node);
            self.editor = editor;
            new mxRubberband(editor.graph);
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
    this.cutCell = [];
    if (this.copyId.length > 0) {
      this.inventoryConf.copiedInstuctionObject = [];
      this.copyId.forEach(id => {
        let obj = this.getObject(this.workflow.configuration, id);
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
          if (this.workflowService.isInstructionCollapsible(obj.TYPE)) {
            this.getJobsArray(obj);
          }
          this.inventoryConf.copiedInstuctionObject.push(obj);
        }
      });
      this.copyId = [];
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
      } else {
        if (json.catch) {
          if (json.catch.instructions && json.catch.instructions.length > 0) {
            recursive(json.catch);
          }
        }
        if (json.then) {
          if (json.then.instructions) {
            recursive(json.then);
          }
        }
        if (json.else) {
          if (json.else.instructions) {
            recursive(json.else);
          }
        }
        if (json.branches) {
          json.branches = json.branches.filter((branch: any) => {
            return (branch.instructions && branch.instructions.length > 0);
          });
          if (json.branches.length > 0) {
            for (let i = 0; i < json.branches.length; i++) {
              if (json.branches[i]) {
                recursive(json.branches[i]);
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

  selectSubagentCluster(cluster): void {
    if (cluster) {
      this.selectedNode.obj.agentName1 = cluster.title;
    } else {
      delete this.selectedNode.obj.agentName1;
    }
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
      this.updateOrderPreparation();
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

  updateFromJobTemplate(data): void {
    this.modal.create({
      nzTitle: undefined,
      nzContent: UpdateJobTemplatesComponent,
      nzClassName: 'lg',
      nzAutofocus: null,
      nzData: {
        preferences: this.preferences,
        job: {
          jobName: data.cell.getAttribute('jobName'),
          workflowPath: (this.data.path + (this.data.path === '/' ? '' : '/') + this.data.name)
        }
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    }).afterClose.subscribe((result: any) => {
      if (result) {
        if (result.value.state && result.value.state._text !== 'UPTODATE') {
          // this.init();
          this.selectedNode = null;
          this.getWorkflowObject();
        }
      }
    });
  }

  makeJobTemplate(data): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: CreateObjectModalComponent,
      nzAutofocus: null,
      nzData: {
        preferences: this.preferences,
        allowPath: true,
        obj: {
          type: InventoryObject.JOBTEMPLATE,
          path: this.data.path
        },
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe((result: any) => {
      if (result) {
        const request: any = {
          objectType: InventoryObject.JOBTEMPLATE,
          path: result.path,
          configuration: {}
        };
        if (result.comments.comment) {
          request.auditLog = {
            comment: result.comments.comment,
            timeSpent: result.comments.timeSpent,
            ticketLink: result.comments.ticketLink
          }
        }
        let job = this.coreService.clone(data.job);
        if (!job.executable) {

        } else {
          if (job.executable.TYPE === 'ShellScriptExecutable') {
            if (data.cell) {
              let parameters = data.cell.getAttribute('defaultArguments')
              if (parameters) {
                job.parameters = JSON.parse(parameters)
              }
            } else {
              job.parameters = data.obj.defaultArguments;
            }
          } else {
            job.parameters = job.executable.arguments;
          }
          if (job.parameters) {
            job.arguments = {};
            for (let i in job.parameters) {
              job.arguments[i] = {
                type: (job.parameters[i] == 'true' || job.parameters[i] == 'false') ? 'Boolean' :
                  (/^\d+$/.test(job.parameters[i])) ? 'Number' : 'String',
                default: job.parameters[i]
              }
            }
          }
          delete job.parameters;
          delete job.jobName;
          request.configuration = job;
          this.coreService.post('inventory/store', request).subscribe();
        }
      }
    });
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
      $('#toolbar').find('img:last-child').click();
      let cells;
      if (node) {
        cells = [node.cell];
      } else {
        cells = this.editor.graph.getSelectionCells();
      }
      if (cells && cells.length > 0) {
        if (this.cutCell.length > 0) {
          this.cutCell.forEach(cell => {
            this.changeCellStyle(this.editor.graph, cell, false);
          });
        }
        this.cutCell = [];
        this.copyId = [];
        cells.forEach(cell => {
          this.copyId.push(cell.getAttribute('uuid'));
        });

        this.updateToolbar('copy', node ? node.cell : null, 'multiple instructions');
        this.coreService.showCopyMessage(this.message);
      }
    }
  }

  cut(node): void {
    if (this.editor && this.editor.graph) {
      $('#toolbar').find('img:last-child').click();
      const graph = this.editor.graph;
      let cells;
      if (node) {
        cells = [node.cell];
      } else {
        cells = graph.getSelectionCells();
      }
      if (cells && cells.length > 0) {
        this.copyId = [];
        if (this.cutCell.length > 0) {
          this.cutCell.forEach(cell => {
            this.changeCellStyle(graph, cell, false);
          });
        }
        this.cutCell = [];
        cells.forEach(cell => {
          this.changeCellStyle(graph, cell, true);
          this.cutCell.push(cell);
        });
        this.updateToolbar('cut', node ? node.cell : null, 'multiple instructions');
        this.coreService.showCopyMessage(this.message, 'cut');
      }
    }
  }

  private updateToolbar(operation, cell, name = ''): void {
    $('#toolbar').find('img').each(function (index) {
      if (index === 19) {
        if (!cell && !name) {
          $(this).addClass('disable-link');
          $(this).attr('title', '');
        } else {
          $(this).removeClass('disable-link');
          $(this).attr('title', (operation === 'copy' ? 'Paste of ' : '') + (cell ? cell.value.tagName : name));
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
      workflowFilters.showPanel = PATH;
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
      workflowFilters.scrollTop = 0;
      workflowFilters.selectedkeys.push(pathArr[pathArr.length - 1]);
      workflowFilters.expandedObjects = [PATH + 'CURRENT'];
      this.router.navigate(['/workflows']).then();
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
        const flag = this.modifyJSON(data, true, true);
        if (flag) {
          this.invalidMsg = '';
          this.validateByURL(data);
        }
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
        this.workflow.valid = false;
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
      nzContent: FileUploaderComponent,
      nzData: {
        type: 'WORKFLOW'
      },
      nzClassName: 'lg',
      nzFooter: null,
      nzAutofocus: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        WorkflowComponent.parseWorkflowJSON(result);
        const res = {
          configuration: result
        }
        this.initObjects(res);
        this.workflow.configuration = this.coreService.clone(result);
        this.workflow.actual = JSON.stringify(res.configuration);

        if (this.workflow.configuration.jobs) {
          if (this.workflow.configuration.jobs && !isEmpty(this.workflow.configuration.jobs)) {
            this.jobs = Object.entries(this.workflow.configuration.jobs).map(([k, v]) => {
              return {name: k, value: v};
            });
          }
        }
        if (!res.configuration.instructions || res.configuration.instructions.length === 0) {
          this.invalidMsg = 'workflow.message.emptyWorkflow';
        } else {
          this.validateByURL(res.configuration);
        }

        this.updateXMLJSON(false);
        this.history = {past: [], present: {}, future: [], type: 'new'};
        this.storeData(result);
      }
    });
  }

  onSelect(name) {
    if (this.selectedNode) {
      this.selectedNode.isTreeShow = false;
      this.selectedNode.obj.workflowName = name;
      this.getWorkflow(true);
    }
  }

  onSelectBlur(): void {
    if (this.selectedNode) {
      this.selectedNode.isTreeShow = false;
    }
  }

  onBlur(value: string): void {
    this.checkExpectNoticeExp(value);
  }

  checkExpectNoticeExp(event): void {
    if (this.selectedNode) {
      this.selectedNode.isTreeShow = false;
      this.ref.detectChanges();
      $('.ant-select-tree-dropdown').hide();
    }
    if (event) {
      this.selectedNode.obj.noticeBoardName = '';
      const doc = this.cm.codeMirror.getDoc();
      const cursor = doc.getCursor();  // gets the line number in the cursor position
      if (this.cm.codeMirror.getSelection()) {
        let text = this.cm.codeMirror.getValue();
        text = text.replace(this.cm.codeMirror.getSelection(), event);
        this.cm.codeMirror.setValue(text);
        cursor.ch = text.length;
      } else {
        doc.replaceRange("'" + event + "'", cursor);
        cursor.ch = cursor.ch + (event.length + 2);
      }
      this.cm.codeMirror.focus();
      doc.setCursor(cursor);
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
    this.centered(true);
    this.checkGraphHeight();
  }

  private checkGraphHeight(): void {
    if (this.editor) {
      setTimeout(() => {
        const dom = $('.graph-container');
        if (dom && dom.position()) {
          let _top = dom.position().top;
          if (_top > 40) {
            _top = 35;
          }
          const top = (_top + $('#rightPanel').position().top);
          const ht = 'calc(100vh - ' + (top + 22) + 'px)';
          dom.css({height: ht, 'scroll-top': '0'});
          $('#graph').slimscroll({height: ht, scrollTo: '0'});
        }
      }, 10);
    }
  }

  private validateJSON(): void {
    if (!this.isUpdate) {
      this.isUpdate = true;
      if (this.workflow.configuration && this.workflow.configuration.instructions && this.workflow.configuration.instructions.length > 0) {
        const data = this.coreService.clone(this.workflow.configuration);
        const valid = this.modifyJSON(data, true, false);
        this.saveJSON(valid ? data : 'false');
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
        if (this.isStore) {
          this._reload();
        } else {
          this.dataService.reloadTree.next({deploy: this.workflow});
        }
      }, 500);
    } else {
      this.dataService.reloadTree.next({deploy: this.workflow});
    }
  }

  private _reload(): void {
    setTimeout(() => {
      if (this.isStore) {
        this._reload();
      } else {
        this.dataService.reloadTree.next({deploy: this.workflow});
      }
    }, 100);
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
      delete variable.value.list;
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
      this.propertyPanelWidth = localStorage['propertyPanelWidth'] ? parseInt(localStorage['propertyPanelWidth'], 10) : 460;
      this.loadConfig();
      this.dummyXml = true;
      this.createEditor(() => {
        this.getWorkflowObject();
        this.handleWindowEvents();
      });
    } else {
      this.getWorkflowObject();
    }
    if (!this.isTrash) {
      this.initTreeObject();
      if (this.documentationTree.length === 0 && this.permission.joc.documentations.view) {
        this.coreService.post('tree', {
          onlyWithAssignReference: true,
          types: ['DOCUMENTATION']
        }).subscribe((res) => {
          this.documentationTree = this.coreService.prepareTree(res, false);
        });
      }
    }
  }

  private getWorkflowObject(): void {
    if (!this.inventoryConf.copiedInstuctionObject || this.inventoryConf.copiedInstuctionObject.length === 0) {
      this.updateToolbar('copy', null);
    } else if (this.inventoryConf.copiedInstuctionObject.length > 0) {
      if (this.inventoryConf.copiedInstuctionObject.length > 1) {
        this.updateToolbar('copy', null, 'multiple instructions');
      } else {
        this.updateToolbar('copy', null, this.inventoryConf.copiedInstuctionObject[0].TYPE);
      }
    }
    this.error = false;
    this.history = {past: [], present: {}, future: [], type: 'new'};
    this.isLoading = true;
    this.invalidMsg = '';
    const obj: any = {
      objectType: this.objectType,
      path: this.data.path + (this.data.path === '/' ? '' : '/') + this.data.name
    };
    if (this.inventoryService.checkDeploymentStatus.isChecked && !this.isTrash) {
      obj.controllerId = this.schedulerId;
    }
    let isSame = false;
    if (this.workflow.name === this.data.name) {
      isSame = true;
    }

    const URL = this.isTrash ? 'inventory/trash/read/configuration' : 'inventory/read/configuration';
    this.coreService.post(URL, obj).subscribe({
      next: (res: any) => {
        this.lastModified = res.configurationDate;
        this.isReferencedBy = res.isReferencedBy;
        this.isLoading = false;
        if ((this.data.path + (this.data.path === '/' ? '' : '/') + this.data.name) === res.path) {
          if (this.data.deployed !== res.deployed) {
            this.data.deployed = res.deployed;
          }
          if (this.data.valid !== res.valid) {
            this.data.valid = res.valid;
          }
          this.data.syncState = res.syncState;
          this.jobs = [];
          this.variableDeclarations = {parameters: []};
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
            if (!res.configuration.instructions || res.configuration.instructions.length === 0) {
              this.invalidMsg = 'workflow.message.emptyWorkflow';
            } else if (!res.valid) {
              this.validateByURL(res.configuration);
            }
            this.initObjects(res);
            this.workflow = res;
            this.workflow.path1 = this.data.path;
            this.workflow.name = this.data.name;
            this.workflow.actual = JSON.stringify(res.configuration);
            if (this.workflow.configuration.jobs) {
              if (this.workflow.configuration.jobs && !isEmpty(this.workflow.configuration.jobs)) {
                this.jobs = Object.entries(this.workflow.configuration.jobs).map(([k, v]) => {
                  return {name: k, value: v};
                });
              }
            }

            this.updateXMLJSON(false);
            if (!isSame) {
              this.centered();
            }
            this.checkGraphHeight();
            this.history.present = JSON.stringify(this.extendJsonObj(JSON.parse(this.workflow.actual)));
            if (this.editor) {
              this.updateJobs(this.editor.graph, true);
              this.ref.detectChanges();
            }
            if (this.workflowService.getJobValue()) {
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

  getReferences(type): void {
    const obj: any = {
      objectType: this.objectType,
      path: this.data.path + (this.data.path === '/' ? '' : '/') + this.data.name
    };
    this.modal.create({
      nzTitle: undefined,
      nzContent: ShowReferenceComponent,
      nzData: {
        obj,
        preferences: this.preferences,
        type
      },
      nzFooter: null,
      nzAutofocus: null,
      nzClosable: false,
      nzMaskClosable: false
    }).afterClose.subscribe(result => {
      if (result) {
        const name = result.path ? result.path.substring(result.path.lastIndexOf('/') + 1, result.path.length) : result.name;
        this.navToObj(name, result.type)
      }
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
      jobResourceNames: this.coreService.clone(this.jobResourceNames),
    };

    if (!this.orderPreparation && this.variableDeclarations.parameters && this.variableDeclarations.parameters.length === 0) {
      this.addVariable();
    }
    this.updateOrderPreparation();
  }

  private updateOrderPreparation(): void {
    if (this.orderPreparation && !isEmpty(this.orderPreparation)) {
      // this.variableDeclarations.allowUndeclared = this.orderPreparation.allowUndeclared;
      if (this.orderPreparation.parameters && !isEmpty(this.orderPreparation.parameters)) {
        const temp = this.coreService.clone(this.orderPreparation.parameters);
        this.variableDeclarations.parameters = Object.entries(temp).map(([k, v]) => {
          const val: any = v;
          if (val.type === 'List') {
            delete val.default;
            delete val.final;
            delete val.list;
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
          if (val.list) {
            let list = [];
            val.list.forEach((val) => {
              let obj = {name: val};
              this.coreService.removeSlashToString(obj, 'name');
              list.push(obj);
            });
            val.list = list;
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
              this.selectedNode.obj.arguments[i].isExist = true;
              if (!val.default && val.default !== false && val.default !== 0 && !isExist) {
                this.selectedNode.obj.arguments[i].isRequired = true;
              }
              isExist = true;
              break;
            }
          }
          if (!val.default && val.default !== false && val.default !== 0 && !isExist) {
            if (!val.final) {
              this.selectedNode.obj.arguments.push({name: k, type: val.type, isRequired: true, isExist: true});
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
          } else {
            if (item.isExist) {
              delete item.isExist;
              return true;
            }
          }
          return false;
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

  addResult(obj): void {
    const param = {
      name: '',
      value: ''
    };
    if (!obj.result) {
      obj.result = [];
    }
    if (!this.coreService.isLastEntryEmpty(obj.result, 'name', '')) {
      obj.result.push(param);
    }
  }

  removeResult(i, list): void {
    list.result.splice(i, 1);
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

  isForklistStringValid(data, form): void {
    delete data.invalid;
    if (form.invalid) {
      data.name = '';
      data.value = '';
    } else {
      let count = 0;
      for (let i in this.selectedNode.obj.result) {
        if (this.selectedNode.obj.result[i].name === data.name) {
          ++count;
        }
        if (count > 1) {
          data.invalid = true;
          form.control.setErrors({incorrect: true});
          break;
        }
      }
    }
  }

  addFacet(data: any, isList = false): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: FacetEditorComponent,
      nzClassName: isList ? 'sm' : 'lg',
      nzData: {
        data,
        isList,
        preferences: this.preferences
      },
      nzFooter: null,
      nzAutofocus: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        data.value = result.value;
        this.ref.detectChanges();
        this.updateOtherProperties('variable');
      }
    });
  }

  addList(data: any): void {
    this.addFacet(data, true);
  }

  changeSettings(evn): void {
    if (evn == 'unchanged') {
      delete this.selectedNode.obj.unsuccessful;
    } else {
      this.selectedNode.obj.unsuccessful = evn == 'unsuccessful';
    }
  }

  openEditor(data: any, type = 'default'): void {
    let modal;
    if (type === 'noticeBoardNames') {
      modal = this.modal.create({
        nzTitle: undefined,
        nzContent: NoticeBoardEditorComponent,
        nzClassName: 'lg',
        nzData: {
          boardTree: this.boardTree,
          data: data[type],
          object: data,
        },
        nzFooter: null,
        nzAutofocus: null,
        nzClosable: false,
        nzMaskClosable: false
      });
    } else {
      modal = this.modal.create({
        nzTitle: undefined,
        nzContent: ValueEditorComponent,
        nzClassName: 'lg',
        nzData: {
          data: data[type],
          object: data,
        },
        nzFooter: null,
        nzAutofocus: null,
        nzClosable: false,
        nzMaskClosable: false
      });
    }
    modal.afterClose.subscribe(result => {
      if (result) {
        if (data[type] !== result) {
          data[type] = result;
          this.ref.detectChanges();
          if (type !== 'noticeBoardNames') {
            this.updateOtherProperties('variable');
          }
        }
      }
    });
  }

  rename(inValid): void {
    if (this.data.id === this.workflow.id) {
      if (!inValid) {
        this.workflow.path = (this.workflow.path1 + (this.workflow.path1 === '/' ? '' : '/') + this.workflow.name);
        if (this.preferences.auditLog) {
          let comments = {
            radio: 'predefined',
            type: 'Workflow',
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
            nzAutofocus: null,
            nzClosable: false,
            nzMaskClosable: false
          });
          modal.afterClose.subscribe(result => {
            if (result) {
              this.renameWorkflow(result);
            } else {
              this.workflow.name = this.data.name;
              this.workflow.path = (this.data.path + (this.data.path === '/' ? '' : '/') + this.data.name);
              this.ref.detectChanges();
            }
          });
        } else {
          this.renameWorkflow();
        }
      } else {
        this.workflow.name = this.data.name;
        this.workflow.path = (this.data.path + (this.data.path === '/' ? '' : '/') + this.data.name);
        this.ref.detectChanges();
      }
    }
  }

  private renameWorkflow(comments: any = {}): void {
    const data = this.coreService.clone(this.data);
    const name = this.workflow.name;
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
        this.workflow.name = this.data.name;
        this.workflow.path = (this.data.path + (this.data.path === '/' ? '' : '/') + this.data.name);
        this.ref.detectChanges();
      }
    });
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
    this.copyId = [];
    this.updateToolbar('', null);
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

  private getWorkflow(flag = false): void {
    if (this.selectedNode.obj.workflowName) {
      this.coreService.post('inventory/read/configuration', {
        path: this.selectedNode.obj.workflowName,
        withPositions: true,
        objectType: InventoryObject.WORKFLOW
      }).subscribe((conf: any) => {
        if (this.selectedNode && this.selectedNode.type === 'AddOrder') {
          this.selectedNode.obj.workflow = {
            orderPreparation: conf.configuration.orderPreparation,
            instructions: conf.configuration.instructions
          };
          if (flag) {
            this.selectedNode.obj.arguments = [];
          }
          this.positions = undefined;
          this.getPositions(this.selectedNode.obj.workflowName);
          this.updateArgumentList();
        }
      });
    }
  }

  private getPositions(path): void {
    this.coreService.post('inventory/read/order/positions', {
      workflowPath: path
    }).subscribe({
      next: (res) => {
        this.positions = new Map();
        res.positions.forEach((item) => {
          this.positions.set(item.positionString, JSON.stringify(item.position));
        });

        if (this.selectedNode.obj) {
          let map = new Map();
          this.positions.forEach((k, v) => {
            map.set(k, v);
          });
          if (this.selectedNode.obj.startPosition) {
            this.selectedNode.obj.startPosition =
              map.get(JSON.stringify(this.selectedNode.obj.startPosition));
          }
          if (this.selectedNode.obj.endPositions) {
            this.selectedNode.obj.endPositions =
              this.selectedNode.obj.endPositions.map(pos => {
                return map.get(JSON.stringify(pos));
              }).filter(pos => !!pos);
          }
        }

        this.ref.detectChanges();
      }
    });
  }

  updateEndNode(positions): void {
    positions.endPositions = [...positions.endPositions];
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
    this.selectedCellId = '';
    if (!isEmpty(this.workflow.configuration)) {
      if (noConversion) {
        this.workflowService.checkEmptyObjects(this.workflow.configuration, () => {
          this.updateWorkflow(graph, null);
        });
      } else {
        this.workflowService.convertTryToRetry(this.workflow.configuration, (jobMap) => {
          this.updateWorkflow(graph, jobMap);
        }, {}, {count: 0});
      }
    } else {
      this.reloadDummyXml(graph);
    }
  }

  private updateWorkflow(graph, jobMap): void {
    const scrollValue: any = {};
    const element = document.getElementById('graph');
    if (element) {
      scrollValue.scrollTop = element.scrollTop;
      scrollValue.scrollLeft = element.scrollLeft;
    }
    scrollValue.scale = graph.getView().getScale();
    graph.getModel().beginUpdate();
    try {
      graph.removeCells(graph.getChildCells(graph.getDefaultParent()), true);
      const mapObj = {nodeMap: this.nodeMap, jobMap};
      this.workflowService.createWorkflow(this.workflow.configuration, this.editor, mapObj);
      this.nodeMap = mapObj.nodeMap;
    } finally {
      // Updates the display
      graph.getModel().endUpdate();
      WorkflowService.executeLayout(graph);
      this.skipXMLToJSONConversion = true;
    }

    const _element = document.getElementById('graph');
    if (element) {
      _element.scrollTop = scrollValue.scrollTop;
      _element.scrollLeft = scrollValue.scrollLeft;
    }
    if (scrollValue.scale && scrollValue.scale != 1) {
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
    $.fn['show'] = function () {
      this.trigger('show');
      return el.apply(this, arguments);
    };

    const panel = $('.property-panel');
    $('.sidebar-open', panel).click(() => {
      self.propertyPanelWidth = localStorage['propertyPanelWidth'] ? parseInt(localStorage['propertyPanelWidth'], 10) : 460;
      $('#outlineContainer').css({right: self.propertyPanelWidth + 10 + 'px'});
      $('.graph-container').css({'margin-right': self.propertyPanelWidth + 'px'});
      $('.toolbar').css({'margin-right': (self.propertyPanelWidth - 12) + 'px'});
      $('.sidebar-close').css({right: self.propertyPanelWidth + 'px'});
      $('#property-panel').css({width: self.propertyPanelWidth + 'px'}).show();
      $('.sidebar-open').css({right: '-20px'});
      self.centered(true);
    });

    $('.sidebar-close', panel).click(() => {
      self.propertyPanelWidth = 0;
      $('#outlineContainer').css({right: '10px'});
      $('.graph-container').css({'margin-right': '0'});
      $('.toolbar').css({'margin-right': '-12px'});
      $('.sidebar-open').css({right: '0'});
      $('#property-panel').hide();
      $('.sidebar-close').css({right: '-20px'});
      self.centered(true);
    });

    if (window.innerWidth > 1024) {
      setTimeout(() => {
        $('.sidebar-open').click();
      }, 100);
    }
    self.checkGraphHeight();
  }

  private centered(flag = false): void {
    if (this.editor && this.editor.graph) {
      setTimeout(() => {
        if (flag) {
          this.center();
        } else {
          this.actual();
        }
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
    let jobMap = new Map();
    let arrOfJobs = [];

    function findFirstNode(data): void {
      for (const prop in node.cells) {
        if (node.cells[prop]?.value?.tagName === 'Job') {
          let name = node.cells[prop].getAttribute('jobName');
          let count = 1;
          if (jobMap.has(name)) {
            count = 2;
          }
          arrOfJobs.push(node.cells[prop])
          jobMap.set(name, count);
        }
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
        if (connections[i].source && connections[i].target && connections[i].target.value.tagName !== 'Process') {
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
                        if (edges[x].getAttribute('displayLabel') === 'catch') {
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
                            if (sourceId === data.catch.id) {
                              isCatch = true;
                              flag = false;
                            } else {
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

    function traversForkList(list, obj, edge, branchObj, parent, endNode): void {
      let callAgain = false;
      for (const i in list) {

        if (list[i].value && ((list[i].getParent().id == parent.id) || (list[i].getAttribute('parentId') == parent.id) || (edge.target && list[i].id == edge.target.id) || (list[i].id == parent.getParent().id) || (self.workflowService.checkClosingCell(list[i].value.tagName)
          && parent.id == list[i].getAttribute('targetId')))) {
          if ((self.workflowService.checkClosingCell(list[i].value.tagName) && parent.id == list[i].getAttribute('targetId'))) {
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
            if (!flag) {
              if (edges[j].source && branchObj.instructions[branchObj.instructions.length - 1] && branchObj.instructions[branchObj.instructions.length - 1].id == edges[j].source.id) {
                flag = true;
                break;
              } else {
                if (obj.lastId && (self.workflowService.isSingleInstruction(list[i].value.tagName) || self.workflowService.isInstructionCollapsible(list[i].value.tagName))) {
                  if (edges[j].source && self.workflowService.checkClosingCell(edges[j].source.value.tagName)) {
                    if (branchObj.instructions[branchObj.instructions.length - 1].id === edges[j].source.getAttribute('targetId')) {
                      flag = true;
                      break;
                    }
                  }
                }
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
        traversForkList(list, obj, edge, branchObj, parent, endNode);
      }
    }

    function traversForkInstruction(edge: any, obj: any, list: any, parent, main): void {
      if (!obj.branches) {
        obj.branches = [];
      }
      const result = edge.getAttribute('result');
      const branchObj = {
        id: edge.getAttribute('displayLabel'),
        result: result ? JSON.parse(result) : result,
        instructions: []
      };
      traversForkList(list, {lastId: ''}, edge, branchObj, parent, main);
      obj.branches.push(branchObj);
    }

    function traversIfList(list, obj, edge, data, parent, endNode): void {
      let callAgain = false;
      for (const i in list) {
        if (list[i].value && ((list[i].getParent().id == parent.id) || (list[i].getAttribute('parentId') == parent.id) || (edge.target && list[i].id == edge.target.id) || (list[i].id == parent.getParent().id) || (self.workflowService.checkClosingCell(list[i].value.tagName) && parent.id == list[i].getAttribute('targetId')))) {
          if (self.workflowService.checkClosingCell(list[i].value.tagName) && parent.id == list[i].getAttribute('targetId')) {
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
            if (!flag && obj.lastId && edges[j].source && self.workflowService.checkClosingCell(edges[j].source.value.tagName)) {
              if (obj.lastId == edges[j].source.getAttribute('targetId')) {
                flag = true;
                break;
              }
            }
            if (!flag && edges[j].source) {
              if (edge.getAttribute('displayLabel') === 'then' && data.then.instructions[data.then.instructions.length - 1]) {
                if (data.then.instructions[data.then.instructions.length - 1].id == edges[j].source.id) {
                  flag = true;
                  break;
                }
              } else if (edge.getAttribute('displayLabel') === 'else' && data.else.instructions[data.else.instructions.length - 1]) {
                if (data.else.instructions[data.else.instructions.length - 1].id == edges[j].source.id) {
                  flag = true;
                  break;
                }
              }
            }
          }
          if (flag) {
            const cell = list[i];
            list.splice(i, 1);
            if (!self.workflowService.checkClosingCell(cell.value.tagName)) {
              callAgain = true;
              if (edge.getAttribute('displayLabel') === 'then') {
                data.then.instructions.push(creatJSONObject(cell, list));
              } else if (edge.getAttribute('displayLabel') === 'else') {
                data.else.instructions.push(creatJSONObject(cell, list));
              }
            }
            break;
          }
        }
      }
      if (callAgain) {
        traversIfList(list, obj, edge, data, parent, endNode);
      }
    }

    function traversIfInstruction(edge: any, obj: any, list: any, parent, main): void {
      if (edge.getAttribute('displayLabel') === 'then') {
        if (!obj.then) {
          obj.then = {
            instructions: []
          };
        }
      } else if (edge.getAttribute('displayLabel') === 'else') {
        if (!obj.else) {
          obj.else = {
            instructions: []
          };
        }
      }

      traversIfList(list, {lastId: ''}, edge, obj, parent, main);
    }

    function createObject(cell: any): any {
      const obj: any = {
        id: cell.id,
        TYPE: cell.value.tagName
      };
      const attr = cell.value.attributes;
      for (const j in attr) {

        if (attr[j].name === 'startPosition' || attr[j].name === 'endPositions') {
          obj[attr[j].name] = JSON.parse(attr[j].value);
          if (attr[j].name === 'endPositions' && isArray(obj[attr[j].name])) {
            obj[attr[j].name] = obj[attr[j].name].map((item) => {
              return JSON.parse((item))
            })
          } else {
            if (typeof obj[attr[j].name] == 'string') {
              obj[attr[j].name] = JSON.parse(obj[attr[j].name]);
            }
          }
        } else {
          if (attr[j].name && attr[j].value && attr[j].name !== 'displayLabel') {
            let val = attr[j].value;
            if ((attr[j].name === 'arguments' || attr[j].name === 'defaultArguments' || attr[j].name === 'outcome' || attr[j].name === 'result')) {
              val = val ? JSON.parse(val) : attr[j].name === 'outcome' ? {returnCode: 0} : {};
            } else if (attr[j].name === 'remainWhenTerminated' || attr[j].name === 'forceJobAdmission' || attr[j].name === 'stopOnFailure' || attr[j].name === 'joinIfFailed' || attr[j].name === 'uncatchable' || attr[j].name === 'unsuccessful') {
              val = val == 'true';
            } else if (obj.TYPE === 'PostNotices' && attr[j].name === 'noticeBoardNames') {
              val = val ? val.split(',') : '';
            }
            obj[attr[j].name] = val;
          }
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
          if (main && main.endNode) {
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


    const jobs = Array.from(jobMap.keys());
    arrOfJobs.forEach((cell) => {
      const jobName = cell.getAttribute('jobName');
      if (jobName && jobMap.get(jobName) == 2) {
        let colorCode = this.workflowService.calculateShades('90C7F5')[jobs.indexOf(jobName)];
        graph.setCellStyles(mxConstants.STYLE_FILLCOLOR, colorCode, [cell]);
        graph.setCellStyles(mxConstants.STYLE_STROKECOLOR, colorCode, [cell]);
      } else {
        graph.setCellStyles(mxConstants.STYLE_FILLCOLOR, '#90C7F5', [cell]);
        graph.setCellStyles(mxConstants.STYLE_STROKECOLOR, '#90C7F5', [cell]);
      }
    });


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

  private initEditorConf(editor, isXML, callFun, isNavigate?): void {
    if (!editor) {
      return;
    }
    const self = this;
    const graph = editor.graph;
    let result: string;
    let dropTarget;
    let parentOfEdge;
    let movedTarget;
    let selectedCellsObj;
    let isVertexDrop = false;
    let dragStart = false;
    let dropTargetForPaste = null;
    let _iterateId = 0;
    const doc = mxUtils.createXmlDocument();
    if (!callFun && !isNavigate) {
      $('#toolbar').find('img').each(function (index) {
        if (index === 16 && !self.hasLicense) {
          $('#toolbar').find('hr').each(function (index) {
            if (index === 15) {
              $(this).hide();
            }
          });
          $(this).hide();
        }
        if (index === 19) {
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
         * Function: execute
         *
         * Resets the state of this handler and selects the current region
         * for the given event.
         */
        mxRubberband.prototype.execute = function (evt) {
          let rect = new mxRectangle(this.x, this.y, this.width, this.height);
          let cells = this.graph.selectRegion(rect, evt);
          if (cells && cells.length > 0) {
            let endNodes = [];
            cells = cells.filter((cell) => {
              if (self.workflowService.isInstructionCollapsible(cell.value.tagName)) {
                const targetId = self.nodeMap.get(cell.id);
                if (targetId) {
                  const lastCell = graph.getModel().getCell(targetId);
                  if (lastCell) {
                    endNodes.push(lastCell);
                  }
                }
              }
              return cell.vertex;
            })
            setTimeout(() => {
              graph.setSelectionCells([...cells, ...endNodes]);
            }, 1)
          }
        };

        /**
         * Function: mouseMove
         *
         * Handles the event by highlighting possible drop targets and updating the
         * preview.
         */
        mxGraphHandler.prototype.mouseMove = function (sender, me) {
          if (!me.isConsumed() && graph.isMouseDown && this.cell != null &&
            this.first != null && this.bounds != null && !this.suspended) {
            // Stops moving if a multitouch event is received
            if (mxEvent.isMultiTouchEvent(me.getEvent())) {
              this.reset();
              return;
            }
            if (!graph.getSelectionCell()) {
              let cell = me.getCell();
              if (cell && !self.workflowService.checkClosingCell(cell.value.tagName) && cell.value.tagName !== 'Process') {
                graph.setSelectionCell(cell)
              } else {
                return;
              }
            }
            let delta = this.getDelta(me);
            let tol = graph.tolerance;
            if (this.shape != null || this.livePreviewActive || Math.abs(delta.x) > tol || Math.abs(delta.y) > tol) {
              // Highlight is used for highlighting drop targets
              if (this.highlight == null) {
                this.highlight = new mxCellHighlight(this.graph,
                  mxConstants.DROP_TARGET_COLOR, 3);
              }

              let gridEnabled = graph.isGridEnabledEvent(me.getEvent());
              let cell = me.getCell();
              let hideGuide = true;
              let target = null;
              this.cloning = false;

              if (graph.isDropEnabled() && this.highlightEnabled) {
                // Contains a call to getCellAt to find the cell under the mouse
                target = graph.getDropTarget(this.cells, me.getEvent(), cell, false);
              }

              if (!target && cell) {
                let flag = true;
                for (let i in this.cells) {
                  if (this.cells[i].id == cell.id) {
                    flag = false;
                    break;
                  }
                }
                if (flag) {
                  target = cell;
                }
              }

              let state = graph.getView().getState(target);
              let highlight = false;
              if (state != null && (this.isValidDropTarget(target, me) || (target && target.value.tagName === 'Try'))) {
                if (this.target != target) {
                  this.target = target;
                  this.setHighlightColor(mxConstants.DROP_TARGET_COLOR);
                }
                highlight = true;
              } else {
                this.target = null;
              }
              if (self.droppedCell && self.droppedCell.target) {
                if (target && target.value && target.value.tagName == 'Fork') {
                  if (self.droppedCell.cells && self.droppedCell.cells[0].value) {
                    const edges = graph.getIncomingEdges(self.droppedCell.cells[0]);
                    let isFound = false;
                    for (let i in edges) {
                      if (edges[i].source && edges[i].source.id === target.id) {
                        isFound = true;
                        break;
                      }
                    }
                    if (!isFound) {
                      highlight = true;
                    } else {
                      self.droppedCell = null;
                      highlight = false;
                    }
                  }
                }
                if (!target && !cell) {
                  self.droppedCell = null;
                } else if (self.droppedCell && !self.droppedCell.type) {
                  if (target && cell && target.id !== cell.id) {
                    if (cell.value.tagName === 'Connection') {
                      let sourceId = cell.source.id;
                      let targetId = cell.target.id;
                      let isOutside = false;
                      if (self.workflowService.checkClosingCell(cell.source.value.tagName)) {
                        sourceId = cell.source.value.getAttribute('targetId');
                        isOutside = true;
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
                        cells: self.movedCells,
                        type: cell.value.getAttribute('type'),
                        isOutside
                      };
                    } else {
                      self.droppedCell.target = cell.id;
                    }
                  }
                }
                if (this.cells.length > 0 && cell && this.cells[0].id != cell.id) {
                  if (target && target.id != cell.id) {
                    state = graph.getView().getState(cell);
                  }
                }
              }
              if (state != null && highlight && state.cell) {
                if (state.cell.value.tagName === 'Connection' || self.workflowService.isInstructionCollapsible(state.cell.value.tagName) || state.cell.value.tagName === 'Catch') {
                  if (state.cell.value.tagName !== 'Connection') {
                    if (state.cell.value.tagName !== 'Fork') {
                      const edges = graph.getOutgoingEdges(state.cell);
                      if ((state.cell.value.tagName !== 'If' && edges.length === 1 && !self.workflowService.checkClosingCell(edges[0].target.value.tagName) &&
                          !(state.cell.value.tagName === 'Try' && edges[0].target.value.tagName === 'Catch'))
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
                delta = this.guide.move(this.bounds, delta, gridEnabled, false);
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
        mxGraphHandler.prototype.createPreviewShape = function (bounds) {
          let shape;
          this.cells = graph.getSelectionCells();
          self.movedCells = this.cells;
          if ((this.cells.length == 2 && !self.workflowService.checkClosingCell(this.cells[0].value.tagName) && !self.workflowService.checkClosingCell(this.cells[1].value.tagName)) ||
            (this.cells.length > 2)) {
            shape = new mxRectangleShape(bounds, null, this.previewColor);
            if (this.htmlPreview) {
              shape.dialect = mxConstants.DIALECT_STRICTHTML;
              shape.init(this.graph.container);
            } else {
              shape.dialect = (this.graph.dialect != mxConstants.DIALECT_SVG) ?
                mxConstants.DIALECT_VML : mxConstants.DIALECT_SVG;
              shape.init(this.graph.getView().getOverlayPane());
              shape.pointerEvents = false;

              // Workaround for artifacts on iOS
              if (mxClient.IS_IOS) {
                shape.getSvgScreenOffset = function () {
                  return 0;
                };
              }
            }
          } else if (graph.getView().getState(this.cells[0])) {
            const originalShape = graph.getView().getState(this.cells[0]).shape;
            this.pBounds = originalShape.bounds;
            if (this.cells[0].value.tagName === 'Job') {
              shape = new mxLabel(originalShape.bounds, null, originalShape.stroke, originalShape.strokewidth + 1);
              shape.image = originalShape.image;
            } else if (this.cells[0].value.tagName === 'If' || this.cells[0].value.tagName === 'Cycle' || this.cells[0].value.tagName === 'Try' || this.cells[0].value.tagName === 'Retry') {
              shape = new mxRhombus(originalShape.bounds, null, originalShape.stroke, originalShape.strokewidth + 1);
            } else {
              shape = new mxImageShape(originalShape.bounds, self.workflowService.getStyleOfSymbol(this.cells[0].value.tagName, originalShape.image), null, originalShape.stroke + 1);
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
              shape.getSvgScreenOffset = function () {
                return 0;
              };
            }
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

        // Transfer initial focus to graph container for keystroke handling
        graph.container.focus();

        self.keyHandler = new mxKeyHandler(graph);

        // Handle Delete: delete key
        self.keyHandler.bindKey(46, function () {
          self.delete();
        });

        // Handle Undo: Ctrl + z
        self.keyHandler.bindControlKey(90, function () {
          self.undo();
        });

        // Handle Redo: Ctrl + y
        self.keyHandler.bindControlKey(89, function () {
          self.redo();
        });

        // Handle Copy: Ctrl + c
        self.keyHandler.bindControlKey(67, function () {
          self.copy(null);
        });

        // Handle Cut: Ctrl + x
        self.keyHandler.bindControlKey(88, function () {
          self.cut(null);
        });

        // Handle Cut: Ctrl + v
        self.keyHandler.bindControlKey(86, function () {
          if (dropTargetForPaste) {
            createClickInstruction('paste', dropTargetForPaste);
          }
        });

        // Handle Cut: Ctrl + a
        self.keyHandler.bindControlKey(65, function () {
          selectAll()
        });

        // Handle Scroll to left: Arrow Left
        self.keyHandler.bindKey(37, function () {
          nudge(37);
        });

        // Handle Scroll to up: Arrow Up
        self.keyHandler.bindKey(38, function () {
          nudge(38);
        });

        // Handle Scroll to right: Arrow Right
        self.keyHandler.bindKey(39, function () {
          nudge(39);
        });

        // Handle Scroll to down: Arrow Down
        self.keyHandler.bindKey(40, function () {
          nudge(40);
        });

        // Handles cursor keys
        function nudge(keyCode) {
          const scale = graph.view.scale;
          const bounds = graph.getGraphBounds();
          if (keyCode == 37) {
            graph.view.setTranslate(bounds.x / scale - 40, bounds.y / scale);
          } else if (keyCode == 38) {
            graph.view.setTranslate(bounds.x / scale, bounds.y / scale - 40);
          } else if (keyCode == 39) {
            graph.view.setTranslate(bounds.x / scale + 40, bounds.y / scale);
          } else if (keyCode == 40) {
            graph.view.setTranslate(bounds.x / scale, bounds.y / scale + 40);
          }
        }

        // Defines a new class for all icons
        function mxIconSet(state) {
          this.images = [];
          let img;
          if (state.cell && (self.workflowService.isSingleInstruction(state.cell.value.tagName) || self.workflowService.isInstructionCollapsible(state.cell.value.tagName))) {
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
              mxUtils.bind(this, function (evt) {
                self.node = {
                  cell: state.cell,
                  isCloseable: self.workflowService.isInstructionCollapsible(state.cell.value.tagName)
                };
                if (state.cell.value.tagName === 'Job') {
                  self.node.isJob = true;
                  for (let i in self.jobs) {
                    if (self.jobs[i].name === state.cell.getAttribute('jobName')) {
                      self.node.job = self.jobs[i].value;
                      if (self.jobs[i].value && self.jobs[i].value.jobTemplate && self.jobs[i].value.jobTemplate.hash) {
                        self.node.hasTemplate = true;
                      }
                      break;
                    }
                  }
                }
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

        mxIconSet.prototype.destroy = function () {
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
        graph.isCellEditable = function () {
          return false;
        };

        /**
         * Function: isCellSelectable
         *
         * Returns <cellSelectable>.
         */
        graph.isCellSelectable = function (cell) {
          if (!cell || self.isTrash) {
            return false;
          }
          return !cell.edge;
        };

        // Changes fill color to red on mouseover
        graph.addMouseListener({
          currentState: null, previousStyle: null, currentHighlight: null, currentIconSet: null,
          mouseDown: function (sender, me) {
            if (self.isTrash) {
              return;
            }
            if (this.currentState != null) {
              this.dragLeave(me.getEvent(), this.currentState);
              this.currentState = null;
            }
          },
          mouseMove: function (sender, me) {
            if (self.isTrash) {
              return;
            }
            const cell = me.getCell();
            if (me.consumed && cell) {
              if (!self.display) {
                if (!self.isCellDragging && !dragStart) {
                  const selectedCells = graph.getSelectionCells();
                  if ((selectedCells.length == 2 && !self.workflowService.checkClosingCell(selectedCells[0].value.tagName) && !self.workflowService.checkClosingCell(selectedCells[1].value.tagName)) ||
                    (selectedCells.length > 2)) {

                  } else {
                    if (cell && self.workflowService.checkClosingCell(cell.value.tagName)) {
                      graph.clearSelection();
                      self.movedCells = [];
                      self.droppedCell = null;
                    } else {
                      if (selectedCells.length > 0 && selectedCells[0].id !== cell.id) {
                        graph.setSelectionCell(cell);
                      }
                    }
                  }
                }
                self.isCellDragging = true;
                if (self.movedCells.length > 0 && graph.getSelectionCell()) {
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
            if ($('#toolbar').find('img.mxToolbarModeSelected').not('img:first-child')[0] || ((self.copyId.length > 0 || self.cutCell.length > 0) && dropTargetForPaste)) {
              if (!dropTargetForPaste) {
                if (tmp != this.currentState) {
                  if (this.currentState != null) {
                    this.dragLeave(me.getEvent(), this.currentState);
                  }
                  this.currentState = tmp;
                  if (this.currentState != null) {
                    this.dragEnter(me.getEvent(), this.currentState, me.getCell());
                  }
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
          mouseUp: function (sender, me) {
            if (self.isTrash) {
              return;
            }
            if (self.isCellDragging) {
              self.isCellDragging = false;
              if (self.movedCells.length) {
                detachedInstruction(me.evt.target, self.movedCells);
              }
              self.movedCells = [];
              if (self.droppedCell && me.getCell()) {
                let _result = 'valid';
                let flag = checkNestedForkList(self.droppedCell);
                if (!flag) {
                  _result = 'inValid';
                }

                if (self.droppedCell.target && self.droppedCell.target.target && _result == 'inValid') {
                  self.updateXMLJSON(true);
                }
                if (_result === 'valid' && self.droppedCell.target && !self.droppedCell.target.target) {
                  const targetCell = graph.getModel().getCell(self.droppedCell.target);
                  if (self.droppedCell.cells && self.droppedCell.cells.length > 0) {
                    self.droppedCell.cells = self.droppedCell.cells.filter((cell) => {
                      return !self.workflowService.checkClosingCell(cell.value.tagName);
                    });
                    for (let i in self.droppedCell.cells) {
                      if (targetCell.getParent().id === self.droppedCell.cells[i].id) {
                        _result = 'inValid';
                      } else {
                        _result = checkValidTarget(graph.getModel().getCell(self.droppedCell.target), self.droppedCell.cells[i].value.tagName);
                      }
                      if (_result === 'inValid') {
                        break;
                      }
                    }
                  }
                }
                if (_result !== 'inValid') {
                  if (self.droppedCell.cells && self.droppedCell.cells.length > 0) {
                    let isExist = false;
                    for (let i in self.droppedCell.cells) {
                      const incomingEdge = graph.getIncomingEdges(self.droppedCell.cells[i]);
                      let flag = true;
                      for (let i in incomingEdge) {
                        if (incomingEdge[i].source && self.droppedCell.target === incomingEdge[i].source.id) {
                          flag = false;
                          break;
                        }
                      }
                      if (!flag) {
                        isExist = true;
                        break;
                      }
                    }
                    if (isExist) {
                      return;
                    }
                  }
                  rearrangeCell(self.droppedCell);
                }
                self.droppedCell = null;
              } else {
                self.storeJSON();
              }
            }
          },
          dragEnter: function (evt, state, cell) {
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
          dragLeave: function (evt, state) {
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

        function detachedInstruction(target, cells): void {
          if (target && target.getAttribute('class') === 'dropContainer' && cells && cells.length > 0) {
            self.droppedCell = null;
            self.editor.graph.removeCells(cells, null);
          }
          self.display = false;
          $('#dropContainer2').hide();
          $('#toolbar-icons').show();
        }

        /**
         * Function: Select all parent nodes
         */
        function selectAll() {
          const cells = graph.getModel().getChildren(graph.getDefaultParent());
          const filterCells = cells.filter(cell => {
            return cell.vertex && cell.value && cell.value.tagName !== 'Process';
          });
          graph.setSelectionCells(filterCells);
        }

        /**
         * Function: isCellMovable
         *
         * Returns true if the given cell is moveable.
         */
        graph.isCellMovable = function (cell) {
          if (cell.value && !self.isTrash) {
            return !cell.edge && cell.value.tagName !== 'Catch' && cell.value.tagName !== 'Process' && !self.workflowService.checkClosingCell(cell.value.tagName);
          } else {
            return false;
          }
        };

        graph.moveCells = function (cells) {
          return cells;
        };

        /**
         * Overrides method to provide a cell collapse/expandable on double click
         */
        graph.dblClick = function (evt, cell) {
          if (cell != null && cell.vertex == 1) {
            if (self.workflowService.isInstructionCollapsible(cell.value.tagName) || self.workflowService.isSingleInstruction(cell.value.tagName)) {

              mxDragSource.prototype.currentHighlight = new mxCellHighlight(graph,
                (!(self.preferences.theme === 'light' || self.preferences.theme === 'lighter' || !self.preferences.theme) ? '#FF8000' : '#1171a6'), 2);
              // Highlights the drop target under the mouse
              if (mxDragSource.prototype.currentHighlight != null) {
                const state = graph.getView().getState(cell);
                if (state && state.cell) {
                  self.selectedCellId = cell.id;
                  mxDragSource.prototype.currentHighlight.highlight(state);
                }
              }
            }
          }
        };

        /**
         * Function: handle a click event
         *
         */
        let count = 0, lastClickId = 0, time = 0;
        graph.click = function (me) {
          if (me.state?.cell?.id && me.state?.cell?.value?.tagName == 'Job') {
            if (count == 0) {
              lastClickId = me.state.cell.id;
              time = new Date().getTime();
            }
            if (me.state.cell.id === lastClickId) {
              if ((new Date().getTime() - 200) > 0) {
                ++count;
              } else {
                count = 0;
                lastClickId = 0;
              }
            } else {
              count = 0;
              lastClickId = 0;
            }
          } else {
            count = 0;
            lastClickId = 0;
          }
          if (count == 2) {
            mxDragSource.prototype.currentHighlight = new mxCellHighlight(graph,
              (!(self.preferences.theme === 'light' || self.preferences.theme === 'lighter' || !self.preferences.theme) ? '#FF8000' : '#1171a6'), 2);
            // Highlights the drop target under the mouse
            if (mxDragSource.prototype.currentHighlight != null) {
              const state = graph.getView().getState(me.state?.cell);
              if (state && state.cell) {
                self.selectedCellId = me.state?.cell.id;
                mxDragSource.prototype.currentHighlight.highlight(state);
              }
            }
          }
          if (me && self.selectedCellId) {
            const cell = graph.getModel().getCell(self.selectedCellId);
            if (mxDragSource.prototype.currentHighlight != null && cell) {
              const state = graph.getView().getState(cell);
              if (!me.state || (me.state?.cell?.id != cell.id)) {
                self.selectedCellId = '';
                if (state.style && mxDragSource.prototype.currentHighlight != null) {
                  mxDragSource.prototype.currentHighlight.destroy();
                  mxDragSource.prototype.currentHighlight = null;
                }
              }
            }
          }
          checkState();
          dropTargetForPaste = null;
          const evt = me.getEvent();
          let cell = me.getCell();
          const mxe = new mxEventObject(mxEvent.CLICK, 'event', evt, 'cell', cell);
          if (evt.target) {
            const str = evt.target.getAttribute('xlink:href');
            if (str && typeof str == 'string' && (str.match('expanded') || str.match('collapsed'))) {
              if (me.isConsumed()) {
                mxe.consume();
              }
              return;
            }
          }
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
              if (sourceCell.attr('src') && sourceCell.attr('src').match(/paste/) && result == 'valid') {
                if (cell.value.tagName === 'Connection') {
                  let state = graph.getView().getState(cell);
                  this.currentHighlight = new mxCellHighlight(graph, 'green');
                  this.currentHighlight.highlight(state);
                  state.shape.redraw();
                } else if (self.workflowService.checkClosingCell(cell.value.tagName) || cell.value.tagName === 'Process') {
                  return;
                }
                dropTargetForPaste = cell;
                graph.setSelectionCell(cell);
                self.selectedNode = null;
                //mxToolbar.prototype.resetMode(true);
                return;
              } else {
                createClickInstruction(sourceCell.attr('src'), cell);
                mxToolbar.prototype.resetMode(true);
              }
            } else if (self.copyId.length > 0 || self.cutCell.length > 0) {
              if (result == 'valid') {
                if (cell.value.tagName === 'Connection') {
                  let state = graph.getView().getState(cell);
                  this.currentHighlight = new mxCellHighlight(graph, 'green');
                  this.currentHighlight.highlight(state);
                  state.shape.redraw();
                  dropTargetForPaste = cell;
                  graph.setSelectionCell(cell);
                  self.selectedNode = null;
                  return;
                } else {
                  if (!self.workflowService.checkClosingCell(cell.value.tagName) && cell.value.tagName !== 'Process') {
                    dropTargetForPaste = cell;
                  }
                }
              }
            }
          } else {
            dragStart = false;
          }
          if (me.isConsumed()) {
            mxe.consume();
          }
          if (!cell || (cell && cell.value.tagName !== 'Connection')) {
            if (evt.target && evt.target.href && evt.target.getAttribute('xlink:href')) {
              if (evt.target.getAttribute('xlink:href').match('.png')) {
                return;
              }
            }
            if (!cell || !evt.ctrlKey) {
              graph.clearSelection();
            }
          }

          // Handles the event if it has not been consumed
          if (cell) {
            if (self.workflowService.checkClosingCell(cell.value.tagName)) {
              return;
            }
            let isProceed = true;
            if (evt.ctrlKey) {
              const cells = graph.getSelectionCells();
              for (let i in cells) {
                if (cells[i].id == cell.id) {
                  graph.removeSelectionCell(cells[i]);
                  if (self.workflowService.isInstructionCollapsible(cell.value.tagName)) {
                    graph.removeSelectionCell(graph.getModel().getCell(self.nodeMap.get(cell.id)));
                  }
                  isProceed = false;
                  break;
                }
              }
            }
            if (isProceed) {
              if (self.workflowService.isSingleInstruction(cell.value.tagName) || self.workflowService.isInstructionCollapsible(cell.value.tagName)) {
                if (!evt.ctrlKey) {
                  graph.setSelectionCell(cell);
                } else {
                  const cells = graph.getSelectionCells();
                  if (cells && cells.length > 0) {
                    if (cells[0].getParent().id !== cell.getParent().id) {
                      let parentCell = {cell: cell.getParent()};
                      checkParentRecursively(parentCell, cells[0]);
                      cell = parentCell.cell;
                    }
                  }
                  graph.addSelectionCell(cell);
                }
                if (self.workflowService.isInstructionCollapsible(cell.value.tagName)) {
                  const targetId = self.nodeMap.get(cell.id);
                  if (targetId) {
                    const lastCell = graph.getModel().getCell(targetId);
                    if (lastCell) {
                      graph.addSelectionCell(graph.getModel().getCell(targetId));
                    }
                  }
                }
              }
            }
          }
          if (!evt.ctrlKey) {
            customizedChangeEvent();
          } else {
            selectionChanged();
          }
          self.closeMenu();
        };

        function checkParentRecursively(parentCell, selectedCell): void {
          if (parentCell && parentCell.cell) {
            const parent = parentCell.cell.getParent();
            if (parent && parent.id !== selectedCell.getParent().id) {
              parentCell.cell = parent;
              checkParentRecursively(parentCell, selectedCell);
            }
          }
        }

        /**
         * Function: resetMode
         *
         * Selects the default mode and resets the state of the previously selected
         * mode.
         */
        mxToolbar.prototype.resetMode = function (forced) {
          if (forced) {
            $('#toolbar').find('img:first-child').click();
            this.selectedMode = undefined;
          }
          if ((forced || !this.noReset) && this.selectedMode != this.defaultMode) {
            this.selectMode(this.defaultMode, this.defaultFunction);
          }
        };

        /**
         * Overrides method to provide a cell label in the display
         * @param cell
         */
        graph.convertValueToString = function (cell) {
          return self.workflowService.convertValueToString(cell, graph);
        };

        // Returns the type as the tooltip for column cells
        graph.getTooltipForCell = function (cell) {
          return self.workflowService.getTooltipForCell(cell);
        };

        /**
         * To check drop target is valid or not on hover
         *
         */
        mxDragSource.prototype.dragOver = function (_graph, evt) {
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
          checkState();
          // Highlights the drop target under the mouse
          if (this.currentHighlight != null && _graph.isDropEnabled()) {
            this.currentDropTarget = this.getDropTarget(_graph, x, y, evt);
            const state = _graph.getView().getState(this.currentDropTarget);
            if (state && state.cell) {
              result = checkValidTarget(state.cell, this.dragElement.getAttribute('src'));
              this.currentHighlight.highlightColor = result === 'inValid' ? '#ff0000' : 'green';
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
              // HTML preview appears smaller than SVG preview
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

        function validationCheck(drpTargt, title, msg): boolean {
          let flag1 = false;
          if (drpTargt.edges && drpTargt.edges.length) {
            for (let i = 0; i < drpTargt.edges.length; i++) {
              let endTagName = 'End' + drpTargt.edges[i].source.value.tagName;
              if (drpTargt.edges[i].target.value.tagName === endTagName) {
                flag1 = true;
                break;
              }
            }
          }
          if (!flag1) {
            self.translate.get('workflow.message.otherInstructionValidationError').subscribe(translatedValue => {
              msg = translatedValue;
            });
            self.toasterService.error(msg, title + '!!');
          }
          return flag1;
        }

        /**
         * Check the drop target on drop event
         */
        mxDragSource.prototype.drop = function (_graph, evt, drpTargt, x, y) {
          parentOfEdge = null;
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
            if (drpTargt.value && self.workflowService.checkClosingCell(drpTargt.value.tagName)) {
              self.toasterService.error(msg, title + '!!');
              return;
            }
            if (this.dragElement && this.dragElement.getAttribute('src')) {

              dragElement = this.dragElement.getAttribute('src');
              if (dragElement.match('fork-list') && drpTargt.value.tagName === 'Connection') {
                let flag = checkNestedForkList(drpTargt);
                if (!flag) {
                  return;
                }
              } else if ((drpTargt.value.tagName === 'ForkList' || drpTargt.value.tagName === 'StickySubagent') && dragElement.match('fork.')) {
                self.toasterService.error(msg, title + '!!');
                return;
              }
              if (drpTargt.value.tagName === 'Connection') {
                if ((drpTargt.source.value.tagName === 'ForkList' || drpTargt.source.value.tagName === 'StickySubagent') && dragElement.match('fork.')) {
                  self.toasterService.error(msg, title + '!!');
                  return;
                }
              }
              if (dragElement.match('fork') || dragElement.match('retry') || dragElement.match('cycle') || dragElement.match('lock') || dragElement.match('options') || dragElement.match('try') || dragElement.match('if')) {
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
                if (self.workflowService.isSingleInstruction(drpTargt.value.tagName)) {
                  for (let i = 0; i < drpTargt.edges.length; i++) {
                    if (drpTargt.edges[i].target.id !== drpTargt.id) {
                      self.translate.get('workflow.message.validationError').subscribe(translatedValue => {
                        msg = translatedValue;
                      });
                      self.toasterService.error(drpTargt.value.tagName + ' ' + msg, title + '!!');
                      return;
                    }
                  }
                } else if (drpTargt.value.tagName === 'If') {
                  if (drpTargt.edges.length > 2) {
                    self.translate.get('workflow.message.ifInstructionValidationError').subscribe(translatedValue => {
                      msg = translatedValue;
                    });
                    self.toasterService.error(msg, title + '!!');
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
                } else if (self.workflowService.isOnlyInstruction(drpTargt.value.tagName)) {
                  let flag1 = validationCheck(drpTargt, title, msg);
                  if (!flag1) {
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
                  if (checkClosedCellWithSourceCell(drpTargt.source, drpTargt.target)) {
                    return;
                  }
                }
                parentOfEdge = drpTargt.getParent();
                flag = true;
              }
              setTimeout(() => {
                self.storeJSON();
                parentOfEdge = null;
              }, 10);
            } else {
              movedTarget = drpTargt;
            }

            if (dragElement) {
              if (dragElement.match('paste')) {
                if (self.copyId.length > 0 || (self.inventoryConf.copiedInstuctionObject && self.inventoryConf.copiedInstuctionObject.length > 0)) {
                  pasteInstruction(drpTargt);
                } else if (self.cutCell.length > 0) {
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
        mxGraph.prototype.removeCells = function (cells, flag) {
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
        mxGraph.prototype.foldCells = function (collapse, recurse, cells, checkFoldable) {
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
        mxEditor.prototype.addVertex = function (parent, vertex, x, y) {
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
            if (parentOfEdge) {
              parent = parentOfEdge;
            } else {
              parent = this.graph.getDefaultParent();
            }
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
            parentOfEdge = null;
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
              if (self.movedCells.length === 0) {
                return;
              }
              const tagName = cell.value.tagName;
              if (tagName === 'Connection' || self.workflowService.isInstructionCollapsible(tagName) || tagName === 'Catch') {
                if (tagName === 'Connection') {
                  if (cell.source && cell.target) {
                    let sourceId = cell.source.id;
                    let targetId = cell.target.id;
                    let isOutside = false;
                    if (self.workflowService.checkClosingCell(cell.source.value.tagName)) {
                      sourceId = cell.source.value.getAttribute('targetId');
                      isOutside = true;
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
                      cells: self.movedCells,
                      type: cell.value.getAttribute('type'),
                      isOutside

                    };
                    return mxGraph.prototype.isValidDropTarget.apply(this, arguments);
                  }
                } else {
                  self.droppedCell = {target: cell.id, cells: self.movedCells};
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
                      if (!(_type === 'retry' || _type === 'lock' || _type === 'options' || _type === 'cycle' || _type === 'then' || _type === 'else' || _type === 'branch' || _type === 'try' || _type === 'catch')) {
                        cell.setParent(cell.source.getParent());
                      }
                    }
                  }
                  const parent = cell.getParent() || graph.getDefaultParent();
                  cells[0].setAttribute('parentId', parent.id)
                  if (self.workflowService.isInstructionCollapsible(cells[0].value.tagName)) {
                    let v1, v2, displayLabel = '';
                    const attr = cell.value.attributes;
                    if (attr) {
                      for (let i = 0; i < attr.length; i++) {
                        if (attr[i].value && attr[i].name) {
                          displayLabel = attr[i].value;
                          break;
                        }
                      }
                    }
                    if (cells[0].value.tagName === 'Fork') {
                      v1 = graph.insertVertex(parent, null, getCellNode('Join', 'join', null), 0, 0, 68, 68, 'join');
                    } else if (cells[0].value.tagName === 'ForkList' || cells[0].value.tagName === 'Lock' || cells[0].value.tagName === 'StickySubagent' ||
                      cells[0].value.tagName === 'Options' || cells[0].value.tagName === 'ConsumeNotices') {
                      v1 = createEndVertex(parent, cells[0].value.tagName);
                    } else if (cells[0].value.tagName === 'If') {
                      v1 = graph.insertVertex(parent, null, getCellNode('EndIf', 'ifEnd', null), 0, 0, 75, 75, 'if');
                    } else if (cells[0].value.tagName === 'Retry') {
                      v1 = graph.insertVertex(parent, null, getCellNode('EndRetry', 'retryEnd', null), 0, 0, 75, 75, 'retry');
                    } else if (cells[0].value.tagName === 'Cycle') {
                      v1 = graph.insertVertex(parent, null, getCellNode('EndCycle', 'cycleEnd', null), 0, 0, 75, 75, 'cycle');
                    } else {
                      v1 = graph.insertVertex(parent, null, getCellNode('EndTry', 'tryEnd', null), 0, 0, 75, 75, 'try');
                      v2 = graph.insertVertex(cells[0], null, getCellNode('Catch', 'catch', null), 0, 0, 100, 40, 'dashRectangle');
                      graph.insertEdge(parent, null, getConnectionNode('try'), cells[0], v2);
                      graph.insertEdge(parent, null, getConnectionNode('endTry'), v2, v1);
                    }
                    graph.insertEdge(parent, null, getConnectionNode(displayLabel), cell.source, cells[0]);
                    if (cells[0].value.tagName !== 'Try') {
                      graph.insertEdge(parent, null, getConnectionNode(''), cells[0], v1);
                    }
                    graph.insertEdge(parent, null, getConnectionNode(''), v1, cell.target);
                    for (let x = 0; x < cell.source.edges.length; x++) {
                      if (cell.source.edges[x].id === cell.id) {
                        const _sourCellName = cell.source.value.tagName;
                        const _tarCellName = cell.target.value.tagName;
                        if (cell.target && self.workflowService.isSingleInstruction(_sourCellName) &&
                          self.workflowService.isSingleInstruction(_tarCellName)) {
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

        initGraph();
        self.centered();

        WorkflowService.executeLayout(graph);

        const mgr = new mxAutoSaveManager(graph);
        mgr.save = function () {
          if (!self.isLoading && !self.isTrash) {
            setTimeout(() => {
              if (!self.implicitSave) {
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
                    self.validateJSON();
                  }
                  setTimeout(() => {
                    self.implicitSave = false;
                  }, 250);
                }
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

    /*
     * Function:
     */
    function checkNestedForkList(cell): boolean {
      let flag = true;
      if (cell.value && cell.value.tagName) {
        const tagName = cell.value.tagName;
        if (tagName === 'ForkList') {
          flag = false;
        } else if (self.workflowService.isInstructionCollapsible(tagName) || tagName === 'Connection') {
          let obj = {
            flag: true
          };
          checkParentRecursively(cell.getParent(), obj);
          flag = obj.flag;
        }
      } else {
        if (cell.target) {
          let id = cell.target;
          if (cell.target.source) {
            id = cell.target.source;
          }
          let obj = {
            flag: true
          };

          let dropCell = graph.getModel().getCell(id);
          if (dropCell && dropCell.value && (dropCell.value.tagName == 'ForkList' || dropCell.value.tagName == 'StickySubagent')) {
            for (let x in cell.cells) {
              if (cell.cells[x].value && cell.cells[x].value.tagName === 'Fork') {
                flag = false;
                break;
              }
            }
          }
          if (flag) {
            checkParentRecursively(dropCell, obj);
            if (!obj.flag) {
              for (let x in cell.cells) {
                if (cell.cells[x].value) {
                  if (cell.cells[x].value.tagName === 'ForkList') {
                    flag = false;
                    break;
                  } else if (self.workflowService.isInstructionCollapsible(cell.cells[x].value.tagName)) {
                    if (flag) {
                      checkChildRecursively(cell.cells[x]);
                    } else {
                      break;
                    }
                  }
                }
              }
            }
          }
        }
      }

      function checkParentRecursively(parentCell, obj): void {
        if (parentCell) {
          if (parentCell.value) {
            if (parentCell.value.tagName === 'ForkList') {
              obj.flag = false;
            } else {
              checkParentRecursively(parentCell.getParent(), obj);
            }
          }
        }
      }

      function checkChildRecursively(cell): void {
        for (let y in cell.children) {
          if (cell.children[y].value) {
            if (cell.children[y].value.tagName === 'ForkList') {
              flag = false;
              break;
            } else if (self.workflowService.isInstructionCollapsible(cell.children[y].value.tagName)) {
              checkChildRecursively(cell.children[y]);
            }
          }
        }
      }

      if (!flag) {
        let title = '';
        let msg = '';
        self.translate.get('workflow.message.invalidTarget').subscribe(translatedValue => {
          title = translatedValue;
        });
        self.translate.get('workflow.message.nestedForkListInstruction').subscribe(translatedValue => {
          msg = translatedValue;
        });
        self.toasterService.error(msg, title + '!!');
      }

      return flag;
    }

    /**
     * Function: check the shape of selected cell
     */
    function checkState() {
      if (dropTargetForPaste && graph.currentHighlight) {
        graph.currentHighlight.destroy();
      }
    }

    /**
     * Function: Remove selected cells from JSON
     */
    function deleteInstructionFromJSON(cells): void {
      cells.forEach((cell, index) => {
        deleteRecursively(self.workflow.configuration, cell, '', (index === cells.length - 1) ? () => {
          setTimeout(() => {
            if (!self.workflow.configuration.instructions) {
              self.workflow.configuration.instructions = [];
            }
            if (self.editor && self.editor.graph) {
              self.updateXMLJSON(true);
              self.updateJobs(graph, false);
            }
          }, 1);
        } : null);
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
      if (self.selectedNode && self.selectedNode.cell.id === _cell.id) {
        self.selectedNode = null;
      }

      function iterateJson(json, cell, type) {
        if (json && json.instructions) {
          for (let x = 0; x < json.instructions.length; x++) {
            if (json.instructions[x].id == cell.id) {
              if (self.node && self.node.isCloseable && !self.node.deleteAll) {
                mergeInternalInstructions(json.instructions, x);
              }
              if (self.copyId && self.copyId.length > 0 && self.copyId.indexOf(json.instructions[x].uuid) > -1) {
                self.copyId.splice(self.copyId.indexOf(json.instructions[x].uuid), 1);
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
      if (cb) {
        cb();
      }
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
      return (sourName === 'Fork' && tarName === 'Join') ||
        (sourName === 'If' && tarName === 'EndIf') ||
        (sourName === 'ConsumeNotices' && tarName === 'EndConsumeNotices') ||
        (sourName === 'Try' && tarName === 'EndTry') ||
        (sourName === 'Try' && tarName === 'Catch') ||
        (sourName === 'Catch' && tarName === 'EndTry') ||
        (sourName === 'Retry' && tarName === 'EndRetry') ||
        (sourName === 'Cycle' && tarName === 'EndCycle') ||
        (sourName === 'ForkList' && tarName === 'EndForkList') ||
        (sourName === 'Lock' && tarName === 'EndLock') ||
        (sourName === 'Options' && tarName === 'EndOptions') ||
        (sourName === 'StickySubagent' && tarName === 'EndStickySubagent');
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
      } else if (name === 'StickySubagent') {
        label1 = 'stickySubagent';
        label2 = 'endStickySubagent';
        v2 = graph.insertVertex(parent, null, getCellNode('EndStickySubagent', 'stickySubagentEnd', parentCell.id), 0, 0, 68, 68, 'stickySubagent');
      } else if (name === 'Options') {
        label1 = 'options';
        label2 = 'endOptions';
        v2 = graph.insertVertex(parent, null, getCellNode('EndOptions', 'optionsEnd', parentCell.id), 0, 0, 68, 68, 'options');
      } else if (name === 'ConsumeNotices') {
        label1 = 'consumeNotices';
        label2 = 'endConsumeNotices';
        v2 = graph.insertVertex(parent, null, getCellNode('EndConsumeNotices', 'lockConsumeNotices', parentCell.id), 0, 0, 68, 68, 'consumeNotices');
      } else if (name === 'Cycle') {
        label1 = 'cycle';
        label2 = 'endCycle';
        v2 = graph.insertVertex(parent, null, getCellNode('EndCycle', 'cycleEnd', parentCell.id), 0, 0, 75, 75, 'cycle');
      } else if (name === 'ForkList') {
        label1 = 'forkList';
        label2 = 'endForkList';
        v2 = graph.insertVertex(parent, null, getCellNode('EndForkList', 'forkListEnd', parentCell.id), 0, 0, 68, 68, 'forkList');
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
        graph.insertEdge(parent, null, getConnectionNode('try'), parentCell, cell);
        graph.insertEdge(parent, null, getConnectionNode('try'), _middle, v3);
        graph.insertEdge(parent, null, getConnectionNode('endTry'), v3, v2);
      } else if (self.workflowService.isInstructionCollapsible(cellName) && cellName !== 'Try') {
        const obj = getLastNodeAndConnect(cellName, parent, parentCell, cell, cells);
        _sour = obj._sour;
        _tar = obj._tar;
      }
      if (_sour && _tar) {
        graph.getModel().remove(_sour);
        graph.getModel().remove(_tar);
      }
      if (!self.implicitSave) {
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
     * Get end node of If/Fork/Try/Retry/Lock/Options/StickySubagent/Cycle/ForkList/ConsumeNotices
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
                  if (edges[x].target && edges[x].target.id !== target.id) {
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
    function getConnectionNode(displayLabel: string): any {
      // Create new Connection object
      const connNode = doc.createElement('Connection');
      let str = displayLabel, type = displayLabel;
      if (displayLabel.substring(0, 6) === '$TYPE$') {
        type = 'branch';
        str = displayLabel.substring(6);
      }
      connNode.setAttribute('displayLabel', str);
      connNode.setAttribute('type', type);
      return connNode;
    }

    /**
     * Create new Node object
     */
    function getCellNode(name: string, displayLabel: string, id: any): any {
      // Create new node object
      const _node = doc.createElement(name);
      _node.setAttribute('displayLabel', displayLabel);
      if (id) {
        _node.setAttribute('targetId', id);
      }
      return _node;
    }

    /**
     * change displayLabel of EndIf and Join
     */
    function changeLabelOfConnection(cell, data): void {
      graph.getModel().beginUpdate();
      try {
        const type = new mxCellAttributeChange(
          cell, 'type',
          data);
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
          cell, 'uuid', self.coreService.create_UUID()
        );
        graph.getModel().execute(uuid);
      } finally {
        graph.getModel().endUpdate();
      }
      if (!isChange) {
        const _type = _dropTarget.getAttribute('type');
        if (_type && (_type === 'join' || _type === 'branch' || _type === 'endIf' || _type === 'endRetry'
          || _type === 'endCycle' || _type === 'endTry' || _type === 'endLock' || _type === 'endConsumeNotices')) {
          let _label1, _label2;
          if (_type === 'join') {
            _label1 = 'join';
            _label2 = 'branch';
          } else if (_type === 'branch') {
            _label1 = 'branch';
          } else if (_type === 'endIf') {
            _label1 = 'endIf';
          } else if (_type === 'endRetry') {
            _label1 = 'endRetry';
          } else if (_type === 'endCycle') {
            _label1 = 'endCycle';
          } else if (_type === 'endLock') {
            _label1 = 'endLock';
          } else if (_type === 'endConsumeNotices') {
            _label1 = 'endConsumeNotices';
          } else if (_type === 'try') {
            _label1 = 'try';
          } else if (_type === 'endTry') {
            _label1 = 'endTry';
          }
          for (let i = 0; i < cell.edges.length; i++) {
            if (cell.edges[i].target !== cell.id) {
              if (self.workflowService.checkClosingCell(cell.edges[i].target.value.tagName)) {
                if (cell.edges[i].target.edges) {
                  for (let j = 0; j < cell.edges[i].target.edges.length; j++) {
                    if (cell.edges[i].target.edges[j].target && cell.edges[i].target.edges[j].target.id !== cell.edges[i].target.id) {
                      changeLabelOfConnection(cell.edges[i].target.edges[j], _label1);
                      break;
                    }
                  }
                }
              } else if (self.workflowService.isInstructionCollapsible(cell.edges[i].target.value.tagName)) {
                changeLabelOfConnection(cell.edges[i], _label2 || _label1);
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
                } else if (cell.edges[i].target.value.tagName === 'EndStickySubagent') {
                  changeLabelOfConnection(cell.edges[i], 'endStickySubagent');
                } else if (cell.edges[i].target.value.tagName === 'EndConsumeNotices') {
                  changeLabelOfConnection(cell.edges[i], 'endConsumeNotices');
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
              } else if (((typeAttr === 'endConsumeNotices' || typeAttr === 'endCycle' || typeAttr === 'endLock' || typeAttr === 'endTry' || typeAttr === 'endTry') && cell.edges[i].id !== _dropTarget.id)) {
                changeLabelOfConnection(cell.edges[i], '');
              }
            }
            if (cell.id !== cell.edges[i].target.id) {
              const attrs = cell.edges[i].value.attributes;
              if (attrs) {
                if (attrs[0].value && (attrs[0].value === 'then' || attrs[0].value === 'else')) {
                  graph.getModel().beginUpdate();
                  try {
                    const type = new mxCellAttributeChange(
                      cell.edges[i], 'type',
                      '');
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
                      const type = new mxCellAttributeChange(
                        cell.edges[i], 'type',
                        '');
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
              obj.cell, 'defaultArguments', JSON.stringify(self.selectedNode.newObj.defaultArguments));
            graph.getModel().execute(edit2);
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
                  self.coreService.convertArrayToObject(argu, 'arguments', false);
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

            if (self.selectedNode.newObj.startPosition && self.positions.get(self.selectedNode.newObj.startPosition)) {
              const edit5 = new mxCellAttributeChange(
                obj.cell, 'startPosition', JSON.stringify(self.positions.get(self.selectedNode.newObj.startPosition)))
              graph.getModel().execute(edit5);
            }

            if (self.selectedNode.newObj.endPositions && self.selectedNode.newObj.endPositions.length > 0) {
              let arr = [];
              self.selectedNode.newObj.endPositions.forEach((item) => {
                arr.push(self.positions.get(item));
              })
              const edit6 = new mxCellAttributeChange(
                obj.cell, 'endPositions', JSON.stringify(arr));
              graph.getModel().execute(edit6);
            }
            const edit7 = new mxCellAttributeChange(
              obj.cell, 'forceJobAdmission', self.selectedNode.newObj.forceJobAdmission);
            graph.getModel().execute(edit7);
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
                    self.selectedNode.data.schedule.admissionTimeScheme.periods = self.workflowService.convertListToAdmissionTime(self.selectedNode.data.periodList);
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
            if (self.selectedNode.radio1 === 'byListVariable' || !self.hasLicense) {
              const edit = new mxCellAttributeChange(
                obj.cell, 'children', self.selectedNode.newObj.children);
              graph.getModel().execute(edit);
              const edit2 = new mxCellAttributeChange(
                obj.cell, 'childToId', self.selectedNode.newObj.childToId);
              graph.getModel().execute(edit2);
              const edit5 = new mxCellAttributeChange(
                obj.cell, 'agentName', undefined);
              graph.getModel().execute(edit5);
              const edit6 = new mxCellAttributeChange(
                obj.cell, 'subagentClusterId', undefined);
              graph.getModel().execute(edit6);
              const edit7 = new mxCellAttributeChange(
                obj.cell, 'subagentClusterIdExpr', undefined);
              graph.getModel().execute(edit7);
            } else {
              const edit = new mxCellAttributeChange(
                obj.cell, 'children', undefined);
              graph.getModel().execute(edit);
              const edit2 = new mxCellAttributeChange(
                obj.cell, 'childToId', undefined);
              graph.getModel().execute(edit2);
              if (self.selectedNode.newObj.agentName1) {
                self.selectedNode.newObj.subagentClusterId = self.selectedNode.newObj.agentName;
                self.selectedNode.newObj.agentName = self.selectedNode.newObj.agentName1;
                delete self.selectedNode.newObj.agentName1;
              }
              if (self.selectedNode.radio === 'agent') {
                delete self.selectedNode.newObj.subagentClusterIdExpr;
              } else {
                delete self.selectedNode.newObj.agentName1;
                if (self.selectedNode.newObj.subagentClusterIdExpr) {
                  self.coreService.addSlashToString(self.selectedNode.newObj, 'subagentClusterIdExpr');
                }
              }
              const edit5 = new mxCellAttributeChange(
                obj.cell, 'agentName', self.selectedNode.newObj.agentName);
              graph.getModel().execute(edit5);
              const edit6 = new mxCellAttributeChange(
                obj.cell, 'subagentClusterId', self.selectedNode.newObj.subagentClusterId);
              graph.getModel().execute(edit6);
              const edit7 = new mxCellAttributeChange(
                obj.cell, 'subagentClusterIdExpr', self.selectedNode.newObj.subagentClusterIdExpr);
              graph.getModel().execute(edit7);
            }
            const edit8 = new mxCellAttributeChange(
              obj.cell, 'subagentIdVariable', self.selectedNode.newObj.subagentIdVariable);
            graph.getModel().execute(edit8);
            const edit3 = new mxCellAttributeChange(
              obj.cell, 'joinIfFailed', self.selectedNode.newObj.joinIfFailed);
            graph.getModel().execute(edit3);
            if (self.selectedNode.newObj.result && self.selectedNode.newObj.result.length > 0) {
              self.selectedNode.newObj.result = self.selectedNode.newObj.result.filter((argu) => {
                self.coreService.addSlashToString(argu, 'value');
                return !argu.invalid;
              });
              self.coreService.convertArrayToObject(self.selectedNode.newObj, 'result', true);
              if (self.selectedNode.newObj.result) {
                const edit4 = new mxCellAttributeChange(
                  obj.cell, 'result', JSON.stringify(self.selectedNode.newObj.result));
                graph.getModel().execute(edit4);
              }
            } else {
              const edit4 = new mxCellAttributeChange(
                obj.cell, 'result', null);
              graph.getModel().execute(edit4);
            }

          } else if (self.selectedNode.type === 'StickySubagent') {
            if (self.selectedNode.newObj.agentName1) {
              self.selectedNode.newObj.subagentClusterId = self.selectedNode.newObj.agentName;
              self.selectedNode.newObj.agentName = self.selectedNode.newObj.agentName1;
              delete self.selectedNode.newObj.agentName1;
            }
            if (self.selectedNode.radio === 'agent') {
              delete self.selectedNode.newObj.subagentClusterIdExpr;
            } else {
              delete self.selectedNode.newObj.agentName1;
              if (self.selectedNode.newObj.subagentClusterIdExpr) {
                self.coreService.addSlashToString(self.selectedNode.newObj, 'subagentClusterIdExpr');
              }
            }
            const edit5 = new mxCellAttributeChange(
              obj.cell, 'agentName', self.selectedNode.newObj.agentName);
            graph.getModel().execute(edit5);
            const edit6 = new mxCellAttributeChange(
              obj.cell, 'subagentClusterId', self.selectedNode.newObj.subagentClusterId);
            graph.getModel().execute(edit6);
            if (self.selectedNode.newObj.subagentClusterIdExpr) {
              self.coreService.addSlashToString(self.selectedNode.newObj, 'subagentClusterIdExpr');
            }
            const edit7 = new mxCellAttributeChange(
              obj.cell, 'subagentClusterIdExpr', self.selectedNode.newObj.subagentClusterIdExpr);
            graph.getModel().execute(edit7);

          } else if (self.selectedNode.type === 'Lock') {
            let demands = [];
            if (isArray(self.selectedNode.newObj.lockNames)) {
              self.selectedNode.newObj.lockNames.forEach((name) => {
                if (name) {
                  demands.push({
                    lockName: name,
                    count: (self.selectedNode.newObj.countProperty === 'shared') ? self.selectedNode.newObj[name] : undefined
                  })
                }
              })
            }
            const edit1 = new mxCellAttributeChange(
              obj.cell, 'demands', JSON.stringify(demands));
            graph.getModel().execute(edit1);
          } else if (self.selectedNode.type === 'ConsumeNotices') {
            let noticeBoardNames = self.selectedNode.newObj.noticeBoardNames;
            const edit1 = new mxCellAttributeChange(
              obj.cell, 'noticeBoardNames', noticeBoardNames);
            graph.getModel().execute(edit1);
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
          } else if (self.selectedNode.type === 'Finish') {
            const edit2 = new mxCellAttributeChange(
              obj.cell, 'message', self.selectedNode.newObj.message);
            graph.getModel().execute(edit2);
            const edit3 = new mxCellAttributeChange(
              obj.cell, 'unsuccessful', self.selectedNode.newObj.unsuccessful);
            graph.getModel().execute(edit3);
          } else if (self.selectedNode.type === 'Options') {
            const edit2 = new mxCellAttributeChange(
              obj.cell, 'stopOnFailure', self.selectedNode.newObj.stopOnFailure);
            graph.getModel().execute(edit2);
          } else if (self.selectedNode.type === 'ExpectNotices' || self.selectedNode.type === 'PostNotices') {
            let noticeBoardNames;
            if (self.selectedNode.type === 'ExpectNotices') {
              noticeBoardNames = self.selectedNode.newObj.noticeBoardNames;
            } else {
              if (isArray(self.selectedNode.newObj.noticeBoardNames)) {
                noticeBoardNames = self.selectedNode.newObj.noticeBoardNames.join(',');
              }
            }
            const edit1 = new mxCellAttributeChange(
              obj.cell, 'noticeBoardNames', noticeBoardNames);
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
                    edges[i], 'displayLabel', self.selectedNode.newObj.branches[i].displayLabel || self.selectedNode.obj.branches[i].displayLabel);
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
          const editLabel = new mxCellAttributeChange(
            obj.cell, 'label', self.selectedNode.newObj.label);
          graph.getModel().execute(editLabel);
        } finally {

          graph.getModel().endUpdate();
          if (!self.coreService.expertMode && self.hasLicense) {
            if (self.selectedNode.type === 'ForkList') {
              self.updateForkListOrStickySubagentJobs(self.selectedNode, false);
            } else if (self.selectedNode.type === 'StickySubagent') {
              self.updateForkListOrStickySubagentJobs(self.selectedNode, true);
            }
          }
          if (flag) {
            self.updateJobs(graph, false);
          }
        }
      }
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
          self.selectedNode.job.admissionTimeScheme.periods = self.workflowService.convertListToAdmissionTime(self.selectedNode.periodList);
        }

        self.cutOperation();
        self.error = false;
        if (self.selectedNode.job) {
          if (self.selectedNode.radio === 'agent') {
            delete self.selectedNode.job.subagentClusterIdExpr;
          } else {
            delete self.selectedNode.job.agentName1;
            if (self.selectedNode.job.subagentClusterIdExpr) {
              self.coreService.addSlashToString(self.selectedNode.job, 'subagentClusterIdExpr');
            }
          }

          self.selectedNode.job.withSubagentClusterIdExpr = self.selectedNode.radio == 'expression';
          delete self.selectedNode.radio;
        }
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
              self.workflowService.checkReturnCodes(job);

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
        const selectedCells = graph.getSelectionCells();
        if ((selectedCells.length == 2 && !self.workflowService.checkClosingCell(selectedCells[0].value.tagName) && !self.workflowService.checkClosingCell(selectedCells[1].value.tagName)) ||
          (selectedCells.length > 2)) {
          self.selectedNode = null;
          self.ref.detectChanges();
          return;
        }
        if (cell.value.tagName === 'Catch') {
          self.selectedNode = null;
          self.ref.detectChanges();
          return;
        }

        const obj: any = {
          label: cell.getAttribute('label')
        };
        let job: any;
        if (cell.value.tagName === 'Job') {
          if (self.selectedNode && cell.getAttribute('defaultArguments') && self.hasLicense && !self.inventoryConf.expertMode) {
            let obj: any = {
              data: {}
            };
            self.getObjectbyUuid(obj, cell.getAttribute('uuid'), true);
            if (obj.list) {
              checkEachIntructions(obj.list, obj.data);
            }
          }
          obj.jobName = cell.getAttribute('jobName');
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
            argument.forEach((arg) => {
              if (isArray(arg.value)) {
                arg.value.forEach((item, index) => {
                  for (const prop in arg.value[index]) {
                    self.coreService.removeSlashToString(arg.value[index], prop);
                  }
                });
              }
              self.coreService.removeSlashToString(arg, 'value');
            });
          }
          obj.arguments = argument;
          obj.argumentList = [];
          obj.workflowName = cell.getAttribute('workflowName');
          obj.startPosition = cell.getAttribute('startPosition');
          if (obj.startPosition && obj.startPosition != 'undefined' && typeof obj.startPosition == 'string') {
            obj.startPosition = JSON.parse(obj.startPosition);
          }
          obj.endPositions = cell.getAttribute('endPositions');
          if (obj.endPositions && obj.endPositions != 'undefined' && typeof obj.endPositions == 'string') {
            obj.endPositions = JSON.parse(obj.endPositions);
          }
          const val1 = cell.getAttribute('remainWhenTerminated');
          obj.remainWhenTerminated = val1 == 'true';
          const val2 = cell.getAttribute('forceJobAdmission');
          obj.forceJobAdmission = val2 == 'true';
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
            obj.retryDelays = [{value: '0s'}];
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
          let children = cell.getAttribute('children');
          if (children) {
            obj.children = children;
            obj.childToId = cell.getAttribute('childToId');
          } else {
            let subagentClusterId = cell.getAttribute('subagentClusterId');
            if (subagentClusterId) {
              obj.agentName = subagentClusterId;
              obj.agentName1 = cell.getAttribute('agentName');
            } else {
              obj.agentName = cell.getAttribute('agentName');
            }
            obj.subagentClusterIdExpr = cell.getAttribute('subagentClusterIdExpr');
            if (obj.subagentClusterIdExpr) {
              self.coreService.removeSlashToString(obj, 'subagentClusterIdExpr');
            }
          }
          obj.subagentIdVariable = cell.getAttribute('subagentIdVariable');
          obj.joinIfFailed = cell.getAttribute('joinIfFailed');
          obj.joinIfFailed = obj.joinIfFailed == 'true';
          let resultObj = cell.getAttribute('result');
          if (resultObj) {
            resultObj = JSON.parse(resultObj);
            resultObj = self.coreService.convertObjectToArray({result: resultObj}, 'result');
            resultObj.forEach((arg) => {
              self.coreService.removeSlashToString(arg, 'value');
            });
          } else {
            resultObj = [];
          }
          obj.result = resultObj;
        } else if (cell.value.tagName === 'StickySubagent') {
          let subagentClusterId = cell.getAttribute('subagentClusterId');
          if (subagentClusterId) {
            obj.agentName = subagentClusterId;
            obj.agentName1 = cell.getAttribute('agentName');
          } else {
            obj.agentName = cell.getAttribute('agentName');
          }
          obj.subagentClusterIdExpr = cell.getAttribute('subagentClusterIdExpr');
          if (obj.subagentClusterIdExpr) {
            self.coreService.removeSlashToString(obj, 'subagentClusterIdExpr');
          }
        } else if (cell.value.tagName === 'Options') {
          obj.stopOnFailure = cell.getAttribute('stopOnFailure');
          obj.stopOnFailure = obj.stopOnFailure == 'true';
        } else if (cell.value.tagName === 'Lock') {
          obj.lockNames = [];
          let demands = cell.getAttribute('demands');
          let isCountExist = false;
          if (demands) {
            demands = JSON.parse(demands);
            if (isArray(demands)) {
              demands.forEach((lock) => {
                obj.lockNames.push(lock.lockName);
                if (lock.count) {
                  isCountExist = true;
                }
                obj[lock.lockName] = lock.count;
              });
            }
          }
          obj.countProperty = isCountExist ? 'shared' : 'exclusive';
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
        } else if (cell.value.tagName === 'Finish') {
          obj.message = cell.getAttribute('message');
          obj.unsuccessful = cell.getAttribute('unsuccessful');
          if (obj.unsuccessful == 'true' || obj.unsuccessful == 'false') {
            obj.unsuccessful = obj.unsuccessful == 'true';
            obj.type = obj.unsuccessful ? 'unsuccessful' : 'successful';
          } else {
            delete obj.unsuccessful;
            delete obj.message;
            obj.type = 'unchanged';
          }
        } else if (cell.value.tagName === 'PostNotices') {
          obj.noticeBoardNames = cell.getAttribute('noticeBoardNames');
          if (obj.noticeBoardNames) {
            obj.noticeBoardNames = obj.noticeBoardNames.split(',');
          } else {
            obj.noticeBoardNames = [];
          }
        } else if (cell.value.tagName === 'ExpectNotices' || cell.value.tagName === 'ConsumeNotices') {
          obj.noticeBoardNames = cell.getAttribute('noticeBoardNames');
          self.coreService.removeSlashToString(obj, 'noticeBoardNames');
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
                resultObj.forEach((arg) => {
                  self.coreService.removeSlashToString(arg, 'value');
                });
              } else {
                resultObj = [];
              }
              obj.branches.push({
                id: edges[i].id,
                displayLabel: edges[i].getAttribute('displayLabel'),
                result: resultObj
              });
            }
          }
        }

        self.selectedNode = {
          path: self.data.path,
          type: cell.value.tagName,
          obj, cell,
          job,
          actualValue: self.coreService.clone(obj)
        };

        if (cell.value.tagName === 'ForkList') {
          self.selectedNode.radio1 = 'bySubagentCluster';
          if (obj.children || !self.hasLicense) {
            self.selectedNode.radio1 = 'byListVariable';
          }
          if (obj.subagentClusterIdExpr || (!obj.agentName1 && obj.agentName)) {
            self.selectedNode.radio = 'expression';
          } else {
            self.selectedNode.radio = 'agent';
          }
        } else if (cell.value.tagName === 'StickySubagent') {
          if (obj.subagentClusterIdExpr || (!obj.agentName1 && obj.agentName)) {
            self.selectedNode.radio = 'expression';
          } else {
            self.selectedNode.radio = 'agent';
          }
        }

        if (cell.value.tagName === 'Lock') {
          obj.lockNames = [];
          //self.getLimit();
          let demands = cell.getAttribute('demands');
          if (demands) {
            demands = JSON.parse(demands);
            if (isArray(demands)) {
              demands.forEach((item) => {
                if (item.lockName) {
                  obj.lockNames.push(item.lockName);
                }
              })
            }
          }
        } else if (cell.value.tagName === 'AddOrder') {
          self.getWorkflow();
        } else if (cell.value.tagName === 'ForkList') {
          self.getListOfVariables(obj);
        }
      }
      if (cell?.value?.tagName === 'ExpectNotices' || cell?.value?.tagName === 'ConsumeNotices') {
        self.selectedNode.isTreeShow = false;
        self.ref.detectChanges();
        setTimeout(() => {
          if (self.cm && self.cm.codeMirror) {
            setTimeout(() => {
              if (self.selectedNode && self.selectedNode.obj) {
                let arr = self.selectedNode.obj.noticeBoardNames?.split('\n') || [];
                const doc = self.cm.codeMirror.getDoc();
                const cursor = doc.getCursor();  // gets the line number in the cursor position
                doc.replaceRange('', cursor);
                cursor.line = arr.length > 0 ? arr.length - 1 : 0;
                cursor.ch = arr.length > 0 ? arr[arr.length - 1]?.length + 1 : 0;
                self.cm.codeMirror.focus();
                doc.setCursor(cursor);
              }
            }, 100);

            self.cm.codeMirror.setOption("extraKeys", {
              "Ctrl-Space": function (editor) {
                // Save contents
                const cursor = editor.getCursor();
                self.selectedNode.isTreeShow = true;
                self.ref.detectChanges();
                setTimeout(() => {
                  const dom = $('#show-tree');
                  dom?.css({
                    'opacity': '1',
                    'top': (cursor.line > 0 ? (cursor.line * 18.7) + 24 : 24) + 'px',
                    'left': '12px',
                    'width': 'calc(100% - 22px)'
                  });
                }, 0)
              }
            });
          }
        }, 500);
      }
    }

    function checkEachIntructions(list, job) {
      for (let i in list) {
        let flag = false;
        traverseFork(list[i], job.id, () => {
          flag = true;
          for (let k in self.jobs) {
            if (self.jobs[k].name == 'job') {
              self.jobs[k].value.agentName = list[i].agentName;
              self.jobs[k].value.agentName1 = list[i].subagentClusterId;
              if (list[i].TYPE == 'ForkList') {
                self.jobs[k].value.subagentClusterIdExpr = '$js7ForkListSubagentId';
              }
              break;
            }
          }

        });
        if (flag) {
          break;
        }
      }
    }

    function traverseFork(json, id, cb): void {
      if (json.instructions) {
        for (let x = 0; x < json.instructions.length; x++) {
          if (json.instructions[x].id == id) {
            cb();
            break;
          }
          if (json.instructions[x].instructions && json.instructions[x].TYPE !== 'ForkList' && json.instructions[x].TYPE !== 'StickySubagent') {
            traverseFork(json.instructions[x], id, cb);
          }
          if (json.instructions[x].catch) {
            if (json.instructions[x].catch.instructions && json.instructions[x].catch.instructions.length > 0) {
              traverseFork(json.instructions[x].catch, id, cb);
            }
          }
          if (json.instructions[x].then) {
            traverseFork(json.instructions[x].then, id, cb);
          }
          if (json.instructions[x].else) {
            traverseFork(json.instructions[x].else, id, cb);
          }
          if (json.instructions[x].branches) {
            for (let i = 0; i < json.instructions[x].branches.length; i++) {
              traverseFork(json.instructions[x].branches[i], id, cb);
            }
          }
        }
      }
    }

    /**
     * Function: paste the instruction to given target
     */
    function pasteInstruction(target): void {
      let source = target.id;
      let isFound = false;
      if (target.value.tagName === 'Connection') {
        if (self.workflowService.checkClosingCell(target.source.value.tagName)) {
          source = target.source.value.getAttribute('targetId');
        } else {
          source = target.source.id;
        }
      }

      let copyObject: any = [], targetObject: any, targetIndex = 0, isCatch = false;
      if (self.copyId.length == 0) {
        copyObject = self.coreService.clone(self.inventoryConf.copiedInstuctionObject);

        copyObject.forEach(cObject => {
          delete cObject.jobObject;
        });

      }

      if (target.value.tagName === 'Process') {
        if (self.workflow.configuration && !self.workflow.configuration.instructions) {
          self.workflow.configuration.instructions = [];
        }
      }

      function getObject(json, id) {
        if (json.instructions) {
          for (let x = 0; x < json.instructions.length; x++) {
            if (isFound && targetObject) {
              break;
            }
            if (json.instructions[x].uuid == id) {
              let copyObj = self.coreService.clone(json.instructions[x]);
              delete copyObj.uuid;
              isFound = true;
              copyObject.push(copyObj);
            }
            if (json.instructions[x].id == source && !targetObject) {
              if (json.instructions[x].TYPE == 'Fork' && target.value.tagName === 'Connection' && (target.source && !self.workflowService.checkClosingCell(target.source.value.tagName))) {
                for (let y = 0; y < json.instructions[x].branches.length; y++) {
                  if (json.instructions[x].branches[y].id === target.getAttribute('displayLabel')) {
                    targetObject = json.instructions[x].branches[y];
                    targetIndex = -1;
                    break;
                  }
                }
              } else {
                if (self.workflowService.isInstructionCollapsible(json.instructions[x].TYPE) && (target.source && !self.workflowService.checkClosingCell(target.source.value.tagName))) {
                  targetObject = json;
                  targetIndex = x;
                  if (json.instructions[x].TYPE === 'If') {
                    if (target.getAttribute('displayLabel') == 'then') {
                      targetObject = json.instructions[x].then;
                      targetIndex = -1;
                    } else if (target.getAttribute('displayLabel') == 'else') {
                      targetObject = json.instructions[x].else;
                      targetIndex = -1;
                    }
                  } else if (json.instructions[x].TYPE !== 'Fork') {
                    targetObject = json.instructions[x];
                    targetIndex = -1;
                  }
                } else {
                  targetObject = json;
                  targetIndex = x;
                }
              }
            }
            if (json.instructions[x].instructions) {
              getObject(json.instructions[x], id);
            }
            if (json.instructions[x].catch) {
              if (json.instructions[x].catch.id == source && !targetObject) {
                targetObject = json.instructions[x].catch;
                targetIndex = -1;
                isCatch = true;
              }
              if (json.instructions[x].catch.instructions && json.instructions[x].catch.instructions.length > 0) {
                getObject(json.instructions[x].catch, id);
              }
            }
            if (json.instructions[x].then) {
              getObject(json.instructions[x].then, id);
            }
            if (json.instructions[x].else) {
              getObject(json.instructions[x].else, id);
            }
            if (json.instructions[x].branches) {
              for (let i = 0; i < json.instructions[x].branches.length; i++) {
                getObject(json.instructions[x].branches[i], id);
              }
            }
          }
        }
      }

      function _dropOnObject() {
        const targetObj = targetObject.instructions[targetIndex];
        if (target.value.tagName === 'If') {
          if (!targetObj.then) {
            targetObj.then = {instructions: copyObject};
          } else if (!targetObj.else) {
            targetObj.else = {instructions: copyObject};
          }
        } else if (target.value.tagName === 'Fork') {
          let branchId;
          if (!targetObj.branches) {
            targetObj.branches = [];
          } else if (targetObj.branches.length > 0) {
            targetObj.branches = targetObj.branches.filter(branch => {
              return (branch.instructions && branch.instructions.length > 0);
            });
          }
          branchId = 'branch' + (targetObj.branches.length + 1);
          targetObj.branches.push({id: branchId, instructions: copyObject});
        } else if (self.workflowService.isOnlyInstruction(target.value.tagName)) {
          if (!targetObj.instructions) {
            targetObj.instructions = [];
          }
          targetObj.instructions = targetObj.instructions.concat(copyObject);
        } else if (target.value.tagName === 'Try' && !isCatch) {
          if (!targetObj.instructions) {
            targetObj.instructions = [];
          }
          targetObj.instructions = targetObj.instructions.concat(copyObject);
        } else if (isCatch) {
          if (!targetObj.catch.instructions) {
            targetObj.catch.instructions = [];
          }
          targetObj.catch.instructions = targetObj.catch.instructions.concat(copyObject);
        }
      }

      if (self.workflow.configuration && self.workflow.configuration.instructions && self.workflow.configuration.instructions.length > 0) {
        if (self.copyId.length > 0) {
          self.copyId.forEach(id => {
            isFound = false;
            getObject(self.workflow.configuration, id);
          });
        } else {
          getObject(self.workflow.configuration, source);
        }
      }

      if (!targetObject) {
        targetIndex = -1;
        targetObject = self.workflow.configuration;
      }
      if (copyObject && copyObject.length > 0) {
        let ignore = false;
        copyObject.forEach((copyObj, index) => {
          generateCopyObject(copyObj);
          if (copyObj.jobs) {
            delete copyObj.jobs;
          }
          if (!ignore) {
            if (target.value.tagName !== 'Connection' && copyObj && targetIndex > -1) {
              ignore = true;
              _dropOnObject();
            } else {
              if (targetObject && targetObject.instructions && copyObj) {
                targetObject.instructions.splice(targetIndex + 1 + index, 0, copyObj);
              }
            }
          }

          if (index == copyObject.length - 1) {
            self.updateXMLJSON(true);
            if (copyObj.id) {
              setTimeout(() => {
                graph.setSelectionCell(graph.getModel().getCell(copyObj.id));
                customizedChangeEvent();
              }, 0);
            }
          }
        });
      }
    }

    function checkCopyName(jobName): string {
      let str = jobName;
      const jobs = JSON.parse((JSON.stringify(self.jobs)));

      function recursivelyCheck(name): void {
        for (let i = 0; i < jobs.length; i++) {
          if (jobs[i].name == name) {
            let tName;
            if (name.match(/_copy_\d+/)) {
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

        if (self.inventoryConf.copiedInstuctionObject && self.inventoryConf.copiedInstuctionObject.length > 0) {
          for (let x in self.inventoryConf.copiedInstuctionObject) {

            if (self.inventoryConf.copiedInstuctionObject[x].jobName === name) {
              job = {name: newName, value: self.inventoryConf.copiedInstuctionObject[x].jobObject || {}};
              break;
            }
          }
        }
        if (!job.name) {
          job = {name: newName, value: {}};
          if (self.inventoryConf.copiedInstuctionObject && self.inventoryConf.copiedInstuctionObject.length > 0) {
            for (let x in self.inventoryConf.copiedInstuctionObject) {
              if (self.inventoryConf.copiedInstuctionObject[x].jobs && self.inventoryConf.copiedInstuctionObject[x].jobName === name) {
                updateMissingJobs(self.inventoryConf.copiedInstuctionObject[x].jobs, job, name);
                break;
              } else if (self.inventoryConf.copiedInstuctionObject[x].jobs && self.inventoryConf.copiedInstuctionObject[x].jobs.length > 0 && !self.inventoryConf.copiedInstuctionObject[x].jobName) {
                updateMissingJobs(self.inventoryConf.copiedInstuctionObject[x].jobs, job, name);
              }
            }
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
      } else if (self.workflowService.isOnlyInstruction(copyObject.TYPE) || copyObject.TYPE === 'Try') {
        recursion(copyObject);
      }
    }

    function customizedChangeEvent(): void {
      const cell = graph.getSelectionCell();
      const cells = graph.getSelectionCells();
      if (cells.length > 0) {
        const lastCell = cells[cells.length - 1];
        if (lastCell) {
          const targetId = self.nodeMap.get(lastCell.id);
          if (targetId) {
            graph.addSelectionCell(graph.getModel().getCell(targetId));
          } else {
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
      }

      if (cell && (self.workflowService.checkClosingCell(cell.value.tagName) || cell.value.tagName === 'Connection'
        || cell.value.tagName === 'Process' || cell.value.tagName === 'Catch')) {
        graph.clearSelection();
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
        if (checkClosedCellWithSourceCell(cells[0], cells[1]) && !((cells[0].value.tagName === 'Try' && cells[1].value.tagName === 'Catch') ||
          (cells[0].value.tagName === 'Catch' && cells[1].value.tagName === 'EndTry'))) {
          selectionChanged();
        }
      }
    }

    function createEndVertex(parent, tagName, id?): any {
      let endTag = 'End' + tagName;
      let closeTag = 'close' + tagName;
      let lastEndTag = tagName.substring(0, 1).toLowerCase() + tagName.substring(1, tagName.length) + 'End';
      return graph.insertVertex(parent, null, getCellNode(endTag, lastEndTag, id), 0, 0, 68, 68, closeTag);
    }

    /**
     * Function: Check and create clicked instructions
     */
    function createClickInstruction(title, targetCell) {
      if (self.selectedCellId) {
        const cell = graph.getModel().getCell(self.selectedCellId);
        if (mxDragSource.prototype.currentHighlight != null && cell) {
          self.selectedCellId = '';
          if (mxDragSource.prototype.currentHighlight != null) {
            mxDragSource.prototype.currentHighlight.destroy();
            mxDragSource.prototype.currentHighlight = null;
          }
        }
      }
      if (title.match('fork-list')) {
        let flag = checkNestedForkList(targetCell);
        if (!flag) {
          return;
        }
      }
      if ((targetCell.value.tagName === 'ForkList' || targetCell.value.tagName === 'StickySubagent') && title.match('fork.')) {
        return;
      }
      mxToolbar.prototype.selectedMode = undefined;
      if (title.match('paste')) {
        if (self.copyId.length > 0 || (self.inventoryConf.copiedInstuctionObject && self.inventoryConf.copiedInstuctionObject.length > 0)) {
          pasteInstruction(targetCell);
        } else if (self.cutCell.length > 0) {
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
                cells: self.cutCell,
                type: targetCell.value.getAttribute('type')
              };
            } else {
              self.droppedCell = {target: targetCell.id, cells: self.cutCell};
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
        let clickedCell: any, _node: any, v1, v2, displayLabel = '';
        if (title.match('job')) {
          _node = doc.createElement('Job');
          _node.setAttribute('jobName', 'job');
          _node.setAttribute('uuid', self.coreService.create_UUID());
          clickedCell = graph.insertVertex(defaultParent, null, _node, 0, 0, 180, 40, 'job');
        } else if (title.match('finish')) {
          _node = doc.createElement('Finish');
          _node.setAttribute('displayLabel', 'finish');
          _node.setAttribute('uuid', self.coreService.create_UUID());
          clickedCell = graph.insertVertex(defaultParent, null, _node, 0, 0, 68, 68, 'finish');
        } else if (title.match('fail')) {
          _node = doc.createElement('Fail');
          _node.setAttribute('displayLabel', 'fail');
          _node.setAttribute('uuid', self.coreService.create_UUID());
          clickedCell = graph.insertVertex(defaultParent, null, _node, 0, 0, 68, 68, 'fail');
        } else if (title.match('break')) {
          _node = doc.createElement('Break');
          _node.setAttribute('displayLabel', 'break');
          _node.setAttribute('uuid', self.coreService.create_UUID());
          clickedCell = graph.insertVertex(defaultParent, null, _node, 0, 0, 68, 68, 'break');
        } else if (title.match('addOrder')) {
          _node = doc.createElement('AddOrder');
          _node.setAttribute('displayLabel', 'addOrder');
          _node.setAttribute('uuid', self.coreService.create_UUID());
          clickedCell = graph.insertVertex(defaultParent, null, _node, 0, 0, 68, 68, 'addOrder');
        } else if (title.match('fork-list')) {
          _node = doc.createElement('ForkList');
          _node.setAttribute('displayLabel', 'forkList');
          _node.setAttribute('uuid', self.coreService.create_UUID());
          clickedCell = graph.insertVertex(defaultParent, null, _node, 0, 0, 68, 68, 'forkList');
        } else if (title.match('fork')) {
          _node = doc.createElement('Fork');
          _node.setAttribute('displayLabel', 'fork');
          _node.setAttribute('uuid', self.coreService.create_UUID());
          clickedCell = graph.insertVertex(defaultParent, null, _node, 0, 0, 68, 68, 'fork');
        } else if (title.match('if')) {
          _node = doc.createElement('If');
          _node.setAttribute('displayLabel', 'if');
          _node.setAttribute('predicate', '$returnCode > 0');
          _node.setAttribute('uuid', self.coreService.create_UUID());
          clickedCell = graph.insertVertex(defaultParent, null, _node, 0, 0, 75, 75, 'if');
        } else if (title.match('retry')) {
          _node = doc.createElement('Retry');
          _node.setAttribute('displayLabel', 'retry');
          _node.setAttribute('maxTries', '10');
          _node.setAttribute('retryDelays', '0s');
          _node.setAttribute('uuid', self.coreService.create_UUID());
          clickedCell = graph.insertVertex(defaultParent, null, _node, 0, 0, 75, 75, 'retry');
        } else if (title.match('cycle')) {
          _node = doc.createElement('Cycle');
          _node.setAttribute('displayLabel', 'cycle');
          _node.setAttribute('uuid', self.coreService.create_UUID());
          clickedCell = graph.insertVertex(defaultParent, null, _node, 0, 0, 75, 75, 'cycle');
        } else if (title.match('lock')) {
          _node = doc.createElement('Lock');
          _node.setAttribute('displayLabel', 'lock');
          _node.setAttribute('uuid', self.coreService.create_UUID());
          clickedCell = graph.insertVertex(defaultParent, null, _node, 0, 0, 68, 68, 'lock');
        } else if (title.match('sticky')) {
          _node = doc.createElement('StickySubagent');
          _node.setAttribute('displayLabel', 'stickySubagent');
          _node.setAttribute('uuid', self.coreService.create_UUID());
          clickedCell = graph.insertVertex(defaultParent, null, _node, 0, 0, 68, 68, 'stickySubagent');
        } else if (title.match('consume')) {
          _node = doc.createElement('ConsumeNotices');
          _node.setAttribute('displayLabel', 'consumeNotices');
          _node.setAttribute('uuid', self.coreService.create_UUID());
          clickedCell = graph.insertVertex(defaultParent, null, _node, 0, 0, 68, 68, 'consumeNotices');
        } else if (title.match('options')) {
          _node = doc.createElement('Options');
          _node.setAttribute('displayLabel', 'options');
          _node.setAttribute('uuid', self.coreService.create_UUID());
          clickedCell = graph.insertVertex(defaultParent, null, _node, 0, 0, 68, 68, 'options');
        } else if (title.match('try')) {
          _node = doc.createElement('Try');
          _node.setAttribute('displayLabel', 'try');
          _node.setAttribute('uuid', self.coreService.create_UUID());
          clickedCell = graph.insertVertex(defaultParent, null, _node, 0, 0, 75, 75, 'try');
        } else if (title.match('await')) {
          _node = doc.createElement('ExpectNotices');
          _node.setAttribute('displayLabel', 'expectNotices');
          _node.setAttribute('uuid', self.coreService.create_UUID());
          clickedCell = graph.insertVertex(defaultParent, null, _node, 0, 0, 68, 68, 'expectNotices');
        } else if (title.match('publish')) {
          _node = doc.createElement('PostNotices');
          _node.setAttribute('displayLabel', 'postNotices');
          _node.setAttribute('uuid', self.coreService.create_UUID());
          clickedCell = graph.insertVertex(defaultParent, null, _node, 0, 0, 68, 68, 'postNotices');
        } else if (title.match('prompt')) {
          _node = doc.createElement('Prompt');
          _node.setAttribute('displayLabel', 'prompt');
          _node.setAttribute('uuid', self.coreService.create_UUID());
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
              const _type = targetCell.getAttribute('type') || targetCell.getAttribute('displayLabel');
              if (!(_type === 'retry' || _type === 'cycle' || _type === 'lock' || _type === 'options' || _type === 'consumeNotices' || _type === 'then' || _type === 'else' || _type === 'branch' || _type === 'try' || _type === 'catch')) {
                targetCell.setParent(targetCell.source.getParent());
              }
            }
          }
          displayLabel = targetCell.getAttribute('type') || targetCell.getAttribute('displayLabel') || '';
          if (self.workflowService.isInstructionCollapsible(clickedCell.value.tagName)) {
            const parent = targetCell.getParent() || graph.getDefaultParent();
            if (clickedCell.value.tagName === 'Fork') {
              v1 = graph.insertVertex(parent, null, getCellNode('Join', 'join', null), 0, 0, 68, 68, 'join');
            } else if (clickedCell.value.tagName === 'If') {
              v1 = graph.insertVertex(parent, null, getCellNode('EndIf', 'ifEnd', null), 0, 0, 75, 75, 'if');
            } else if (clickedCell.value.tagName === 'Retry') {
              v1 = graph.insertVertex(parent, null, getCellNode('EndRetry', 'retryEnd', null), 0, 0, 75, 75, 'retry');
            } else if (clickedCell.value.tagName === 'ForkList' || clickedCell.value.tagName === 'Lock' || clickedCell.value.tagName === 'StickySubagent' ||
              clickedCell.value.tagName === 'Options' || clickedCell.value.tagName === 'ConsumeNotices') {
              v1 = createEndVertex(parent, clickedCell.value.tagName);
            } else if (clickedCell.value.tagName === 'Cycle') {
              v1 = graph.insertVertex(parent, null, getCellNode('EndCycle', 'cycleEnd', null), 0, 0, 75, 75, 'cycle');
            } else {
              v1 = graph.insertVertex(parent, null, getCellNode('EndTry', 'tryEnd', null), 0, 0, 75, 75, 'try');
              v2 = graph.insertVertex(clickedCell, null, getCellNode('Catch', 'catch', null), 0, 0, 100, 40, 'dashRectangle');
              graph.insertEdge(parent, null, getConnectionNode('try'), clickedCell, v2);
              graph.insertEdge(parent, null, getConnectionNode('endTry'), v2, v1);
            }

            graph.insertEdge(parent, null, getConnectionNode(displayLabel), targetCell.source, clickedCell);
            if (clickedCell.value.tagName !== 'Try') {
              graph.insertEdge(parent, null, getConnectionNode(''), clickedCell, v1);
            }

            graph.insertEdge(parent, null, getConnectionNode(''), v1, targetCell.target);
            for (let x = 0; x < targetCell.source.edges.length; x++) {
              if (targetCell.source.edges[x].id === targetCell.id) {
                const _sourCellName = targetCell.source.value.tagName;
                const _tarCellName = targetCell.target.value.tagName;
                if (targetCell.target && self.workflowService.isSingleInstruction(_sourCellName) &&
                  self.workflowService.isSingleInstruction(_tarCellName)) {
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
            graph.insertEdge(defaultParent, null, getConnectionNode(displayLabel), targetCell.source, clickedCell);
            const e1 = graph.insertEdge(defaultParent, null, getConnectionNode(displayLabel), clickedCell, targetCell.target);
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
      } else if (tagName === 'Connector' || title === 'Connect' || self.workflowService.checkClosingCell(tagName)) {
        return 'return';
      }
      let flg = false;
      if (title) {
        title = title.toLowerCase();
        if ((tagName === 'ForkList' || tagName === 'StickySubagent') && title.match('fork.')) {
          return 'inValid';
        }
        if (title.match('fork') || title.match('retry') || title.match('cycle') || title.match('consume') || title.match('lock') || title.match('options') || title.match('try') || title.match('if')) {
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
              // flg = true;
              if (targetCell.id == self.selectedCellId) {
                return 'select';
              }
            }
          }
        }
      }
      if (!flg) {
        if (tagName !== 'Connection') {
          if (self.workflowService.isSingleInstruction(tagName)) {
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
          } else if (self.workflowService.isOnlyInstruction(tagName)) {
            let flag1 = false;
            if (targetCell.edges && targetCell.edges.length) {
              for (let i = 0; i < targetCell.edges.length; i++) {
                if (targetCell.edges[i].source && targetCell.edges[i].target && checkClosedCellWithSourceCell(targetCell.edges[i].source, targetCell.edges[i].target)) {
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
            if (checkClosedCellWithSourceCell(targetCell.source, targetCell.target)) {
              return 'return';
            }
          }
        }
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
          const displayLabel = branchs[i].getAttribute('displayLabel');
          if (displayLabel) {
            const arr = displayLabel.match(/\d+/);
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
      let displayLabel = '';
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
        displayLabel = 'then';
        const edges = graph.getOutgoingEdges(_dropTarget);
        for (let i = 0; i < edges.length; i++) {
          if (edges[i].target) {
            if (edges[i].target.value.tagName !== 'EndIf') {
              displayLabel = 'else';
            } else {
              if (edges[i].target.edges) {
                for (let j = 0; j < edges[i].target.edges.length; j++) {
                  if (edges[i].target.edges[j].edge && edges[i].target.edges[j].value.attributes
                    && edges[i].target.edges[j].value.attributes.length > 0 && (edges[i].target.edges[j].value.attributes[0]
                      && edges[i].target.edges[j].value.attributes[0].value === 'else')) {
                    displayLabel = 'then';
                    break;
                  }
                }
              }
            }
          }
        }
      } else if (dropTargetName === 'Retry') {
        displayLabel = 'retry';
      } else if (dropTargetName === 'Cycle') {
        displayLabel = 'cycle';
      } else if (dropTargetName === 'Lock') {
        displayLabel = 'lock';
      } else if (dropTargetName === 'StickySubagent') {
        displayLabel = 'stickySubagent';
      } else if (dropTargetName === 'Options') {
        displayLabel = 'options';
      } else if (dropTargetName === 'ConsumeNotices') {
        displayLabel = 'consumeNotices';
      } else if (dropTargetName === 'ForkList') {
        displayLabel = 'forkList';
      } else if (dropTargetName === 'Try') {
        displayLabel = 'try';
      } else if (dropTargetName === 'Catch') {
        displayLabel = 'catch';
      } else if (dropTargetName === 'Fork') {
        displayLabel = '$TYPE$' + 'branch' + (getBranchLabel(_dropTarget) + 1);
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
        } else if (cell.value.tagName === 'ForkList' || cell.value.tagName === 'Lock' || cell.value.tagName === 'StickySubagent' ||
          cell.value.tagName === 'Options' || cell.value.tagName === 'ConsumeNotices') {
          v1 = createEndVertex(parent, cell.value.tagName, cell.id);
          graph.insertEdge(parent, null, getConnectionNode(''), cell, v1);
        } else if (cell.value.tagName === 'Cycle') {
          v1 = graph.insertVertex(parent, null, getCellNode('EndCycle', 'cycleEnd', cell.id), 0, 0, 75, 75, 'cycle');
          graph.insertEdge(parent, null, getConnectionNode(''), cell, v1);
        } else if (cell.value.tagName === 'Try') {
          v2 = graph.insertVertex(cell, null, getCellNode('Catch', 'catch', cell.id), 0, 0, 100, 40, 'dashRectangle');
          v1 = graph.insertVertex(parent, null, getCellNode('EndTry', 'tryEnd', cell.id), 0, 0, 75, 75, 'try');
          graph.insertEdge(parent, null, getConnectionNode('try'), cell, v2);
          graph.insertEdge(parent, null, getConnectionNode(''), cell, v1);
          graph.insertEdge(parent, null, getConnectionNode('endTry'), v2, v1);
        }
        if (self.workflowService.isInstructionCollapsible(dropTargetName) || dropTargetName === 'Catch') {
          _label = self.workflowService.getLabelName(dropTargetName);
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
                      graph.insertEdge(parent, null, getConnectionNode(displayLabel), cell.edges[j].target, _dropTarget.edges[i].target);
                    } else {
                      graph.insertEdge(parent, null, getConnectionNode(displayLabel), _dropTarget.edges[i].source, cell.edges[j].source);
                    }
                    flag = true;
                    break;
                  }
                }
              }
            } else {
              graph.insertEdge(parent, null, getConnectionNode(displayLabel), _dropTarget.edges[i].source, cell);
            }
          } else {
            if (self.workflowService.isInstructionCollapsible(cell.value.tagName)) {
              for (let j = 0; j < cell.edges.length; j++) {
                if (cell.edges[j].target.id !== cell.id) {
                  if (self.workflowService.checkClosingCell(cell.edges[j].target.value.tagName)) {
                    graph.insertEdge(parent, null, getConnectionNode(displayLabel), cell.edges[j].target, _dropTarget.edges[i].target);
                    break;
                  }
                }
              }
            } else {
              graph.insertEdge(parent, null, getConnectionNode(displayLabel), cell, _dropTarget.edges[i].target);
            }
          }
        }
        graph.getModel().remove(_dropTarget);
      } else {
        let checkLabel = '';
        if (dropTargetName === 'Fork') {
          displayLabel = '$TYPE$' + 'branch' + (getBranchLabel(_dropTarget) + 1);
          checkLabel = 'Join';
        } else if (dropTargetName === 'If') {
          checkLabel = 'EndIf';
        } else if (dropTargetName === 'Retry') {
          checkLabel = 'EndRetry';
        } else if (dropTargetName === 'Lock') {
          checkLabel = 'EndLock';
        } else if (dropTargetName === 'StickySubagent') {
          checkLabel = 'EndStickySubagent';
        } else if (dropTargetName === 'Options') {
          checkLabel = 'EndOptions';
        } else if (dropTargetName === 'ConsumeNotices') {
          checkLabel = 'EndConsumeNotices';
        } else if (dropTargetName === 'Cycle') {
          checkLabel = 'EndCycle';
        } else if (dropTargetName === 'ForkList') {
          checkLabel = 'EndForkList';
        } else if (dropTargetName === 'Try') {
          displayLabel = 'try';
          checkLabel = 'EndTry';
        } else if (dropTargetName === 'Catch') {
          displayLabel = 'catch';
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
            graph.insertEdge(parent, null, getConnectionNode(displayLabel), target2, target1.target);
            graph.getModel().remove(target1);
          } else if (self.nodeMap.has(_dropTarget.id)) {
            const target = graph.getModel().getCell(self.nodeMap.get(_dropTarget.id));
            graph.insertEdge(parent, null, getConnectionNode(displayLabel), target2, target);
          }
        } else {
          if (dropTargetName === 'Try' && cell.value.tagName === 'Catch') {
            displayLabel = 'endTry';
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
                  if (attr && displayLabel !== 'catch' && !checkClosedCellWithSourceCell(_dropTarget, _dropTarget.edges[i].target)) {
                    for (let x = 0; x < attr.length; x++) {
                      if (attr[x].value && attr[x].name) {
                        displayLabel = attr[x].value;
                        break;
                      }
                    }
                  }

                  if (cell && _dropTarget.edges[i].target) {
                    graph.insertEdge(parent, null, getConnectionNode(displayLabel), cell, _dropTarget.edges[i].target);
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
              graph.insertEdge(parent, null, getConnectionNode(displayLabel), cell, target);
            }
          }
        }

        if (cell.edges) {
          for (let i = 0; i < cell.edges.length; i++) {
            if (cell.edges[i].target.value.tagName === checkLabel) {
              const _label = checkLabel === 'Join' ? 'join' : checkLabel === 'EndForkList' ? 'endForkList' : checkLabel === 'EndIf' ? 'endIf' : checkLabel === 'EndRetry'
                ? 'endRetry' : checkLabel === 'EndLock' ? 'endLock' : checkLabel === 'EndStickySubagent' ? 'endStickySubagent' : checkLabel === 'EndConsumeNotices' ? 'endConsumeNotices' : checkLabel === 'EndCycle' ? 'endCycle' : 'endTry';
              if (!self.workflowService.isInstructionCollapsible(cell.value.tagName) && cell.value.tagName !== 'Catch') {
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
            graph.insertEdge(parent, null, getConnectionNode(displayLabel), _dropTarget, cell);
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

    function dropOnObject(source, target, sourceIndex, targetIndex, isCatch) {
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
          } else if (targetObj.branches.length > 0) {
            targetObj.branches = targetObj.branches.filter(branch => {
              return (branch.instructions && branch.instructions.length > 0);
            });
          }
          branchId = 'branch' + (targetObj.branches.length + 1);
          targetObj.branches.push({id: branchId, instructions: [sourceObj]});
          isDone = true;
        } else if (self.workflowService.isOnlyInstruction(targetObj.TYPE)) {
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
      const droppedCells = obj.cells;
      for (let i in droppedCells) {
        let proceed = true;
        if (connection.source === droppedCells[i].id || connection.target === droppedCells[i].id ||
          connection === droppedCells[i].id) {

        } else {
          let dropObject: any, targetObject: any, index = 0, targetIndex = 0, isCatch = false;
          const source = connection.source || connection;

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

          getObject(self.workflow.configuration, droppedCells[i]);
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
                proceed = false;
              }

              if (!connection.source && !connection.target) {
                dropOnObject(dropObject, targetObject, index, targetIndex, isCatch);
                proceed = false;
              }

              if (proceed) {
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
                  if (obj.isOutside) {
                    targetObject.instructions.splice(targetIndex + 1, 0, sourceObj);
                  } else {
                    const isSameObj = connection.source === connection.target;
                    if (targetObj.TYPE === 'If') {
                      if (obj.type || isSameObj) {
                        if (!obj.type.match('else')) {
                          if (!targetObj.then || targetObj.then.instructions.length === 0) {
                            targetObj.then = {instructions: [sourceObj]};
                            booleanObj.isMatch = true;
                          } else {
                            dropAndAdd(targetObj.then.instructions, droppedCells[i].id, connection.target, sourceObj, booleanObj);
                          }
                        } else {
                          if (!targetObj.else || targetObj.else.instructions.length === 0) {
                            targetObj.else = {instructions: [sourceObj]};
                            booleanObj.isMatch = true;
                          } else {
                            dropAndAdd(targetObj.else.instructions, droppedCells[i].id, connection.target, sourceObj, booleanObj);
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
                            dropAndAdd(targetObj.branches[j].instructions, droppedCells[i].id, connection.target, sourceObj, booleanObj);
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
                    } else if (self.workflowService.isOnlyInstruction(targetObj.TYPE)) {
                      if (obj.type || isSameObj) {
                        if (!targetObj.instructions || targetObj.instructions.length === 0) {
                          targetObj.instructions = [sourceObj];
                          booleanObj.isMatch = true;
                        } else if (targetObj.instructions && targetObj.instructions.length > 0) {
                          dropAndAdd(targetObj.instructions, droppedCells[i].id, connection.target, sourceObj, booleanObj);
                        }
                      }
                    } else if (targetObj.TYPE === 'Try') {
                      if (obj.type || isSameObj) {
                        if (isCatch) {
                          if (!targetObj.catch.instructions || targetObj.catch.instructions.length === 0) {
                            targetObj.catch.instructions = [sourceObj];
                            booleanObj.isMatch = true;
                          } else if (targetObj.catch.instructions && targetObj.catch.instructions.length > 0) {
                            dropAndAdd(targetObj.catch.instructions, droppedCells[i].id, connection.target, sourceObj, booleanObj);
                          }
                        } else {
                          if (!targetObj.instructions || targetObj.instructions.length === 0) {
                            targetObj.instructions = [sourceObj];
                            booleanObj.isMatch = true;
                          } else if (targetObj.instructions && targetObj.instructions.length > 0) {
                            dropAndAdd(targetObj.instructions, droppedCells[i].id, connection.target, sourceObj, booleanObj);
                          }
                        }
                      }
                    }
                    if (!booleanObj.isMatch) {
                      targetObject.instructions.splice(targetIndex + 1, 0, sourceObj);
                    }
                  }
                }
              }
            }

            if (proceed) {
              if (dropObject && dropObject.instructions && dropObject.instructions.length === 0) {
                delete dropObject.instructions;
              }
            }
          }
        }
      }

      self.updateXMLJSON(true);
    }

    if (callFun) {
      selectionChanged();
    }

    if (isNavigate) {
      customizedChangeEvent();
    }
  }

  private updateForkListOrStickySubagentJobs(data, isSticky, skip = false) {
    const actualVal = data.actualValue;
    const newVal = data.obj;
    const self = this;
    if ((actualVal.agentName == newVal.agentName && actualVal.agentName1 == newVal.agentName1 && actualVal.subagentClusterIdExpr == newVal.subagentClusterIdExpr) && !skip) {

    } else {
      if (newVal.agentName3) {
        return;
      }
      const uuid = data.cell.getAttribute('uuid');
      let obj = {
        data: {}
      };

      this.getObjectbyUuid(obj, uuid);
      let jobs = new Set();
      if (!isEmpty(obj.data)) {
        traverseInstructions(obj.data);

        function traverseInstructions(json) {
          if (json.instructions) {
            for (let x = 0; x < json.instructions.length; x++) {
              if (json.instructions[x].TYPE == 'Job') {
                jobs.add(json.instructions[x].jobName);
              }

              if (json.instructions[x].instructions) {
                traverseInstructions(json.instructions[x]);
              }
              if (json.instructions[x].catch) {
                if (json.instructions[x].catch.instructions && json.instructions[x].catch.instructions.length > 0) {
                  traverseInstructions(json.instructions[x].catch);
                }
              }
              if (json.instructions[x].then) {
                traverseInstructions(json.instructions[x].then);
              }
              if (json.instructions[x].else) {
                traverseInstructions(json.instructions[x].else);
              }
              if (json.instructions[x].branches) {
                for (let i = 0; i < json.instructions[x].branches.length; i++) {
                  traverseInstructions(json.instructions[x].branches[i]);
                }
              }
            }
          }
        }
      }

      if (jobs.size > 0) {
        self._updateForkListOrStickySubagentJobs(jobs, newVal, isSticky);
      }
    }
  }

  private getObjectbyUuid(obj, uuid, isJob = false) {
    function recursion(json): void {
      if (json.instructions) {
        for (let x = 0; x < json.instructions.length; x++) {
          if (isJob && (json.instructions[x].TYPE == 'ForkList' || json.instructions[x].TYPE == 'StickySubagent')) {
            if (!obj.list) {
              obj.list = [];
            }
            if (json.instructions[x].agentName) {
              obj.list.push(json.instructions[x]);
            }
          }

          if (json.instructions[x].uuid == uuid) {
            obj.data = json.instructions[x];
            break;
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

    recursion(this.workflow.configuration);
  }

  private _updateForkListOrStickySubagentJobs(jobs, data, isSticky): void {
    for (let i in this.jobs) {
      if (this.jobs[i].name && jobs.has(this.jobs[i].name)) {
        if (this.jobs[i].value.withSubagentClusterIdExpr) {
          if (data.agentName1) {
            if (!isSticky) {
              this.jobs[i].value.subagentClusterIdExpr = '$js7ForkListSubagentId';
            }
            this.jobs[i].value.agentName = data.agentName1;
            this.jobs[i].value.subagentClusterId = data.agentName;
          }
        }
      }
    }
  }

  private getObject(mainJson, copyId): any {
    const self = this;
    let obj: any = {};

    function recursion(json): void {
      if (json.instructions) {
        for (let x = 0; x < json.instructions.length; x++) {
          if (json.instructions[x].uuid == copyId) {
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
    let job = this.coreService.clone(data.job);
    if (!job.executable) {
      return false;
    }
    job = this.workflowService.convertJobObject(job, false);

    let flag = true;
    let isChange = true;
    for (let i = 0; i < this.jobs.length; i++) {
      if (this.jobs[i].name === job.jobName) {
        flag = false;
        delete job.jobName;
        this.workflowService.checkReturnCodes(this.jobs[i].value);
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
      if (this.workflow.configuration.instructions && this.workflow.configuration.instructions.length === 0) {
        const data = this.coreService.clone(this.workflow.configuration);
        const valid = this.modifyJSON(data, true, false);
        this.saveJSON(valid ? data : 'false');
      } else {
        this.storeJSON();
      }
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
        this.validateJSON();
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
            if (json.instructions[x].jobName === jobName) {
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
          delete json.instructions[x].path;
          delete json.instructions[x].versionId;
          if (json.instructions[x].TYPE === 'Job') {
            isJobExist = true;
            let _label = json.instructions[x].label;
            delete json.instructions[x].label;
            json.instructions[x].TYPE = 'Execute.Named';
            json.instructions[x].label = _label;
            flag = self.workflowService.validateFields(json.instructions[x], 'Node');
            if (!flag) {
              let msg = !json.instructions[x].label ? 'workflow.message.labelIsMissing' : 'inventory.message.nameIsNotValid';
              checkErr = true;
              self.translate.get(msg).subscribe(translatedValue => {
                self.invalidMsg = 'Job: ' + json.instructions[x].jobName + ' ' + translatedValue;
              });
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
          } else if (json.instructions[x].TYPE === 'If') {
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
            if (json.instructions[x].then && json.instructions[x].then.instructions && json.instructions[x].then.instructions.length === 0) {
              delete json.instructions[x].then;
            }
            if (json.instructions[x].else && json.instructions[x].else.instructions && json.instructions[x].else.instructions.length === 0) {
              delete json.instructions[x].else;
            }
          } else if (json.instructions[x].TYPE === 'Try') {
            if ((!json.instructions[x].instructions || json.instructions[x].instructions.length === 0) && isValidate) {
              flag = false;
              checkErr = true;
              self.invalidMsg = 'workflow.message.invalidTryInstruction';
              return;
            }
          } else if (json.instructions[x].TYPE === 'Retry') {
            if (!(!json.instructions[x].id && !json.instructions[x].instructions)) {
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
          } else if (json.instructions[x].TYPE === 'Cycle') {
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
                self.invalidMsg = 'workflow.message.runtimeIsMissing';
                if (isOpen) {
                  self.openSideBar(json.instructions[x].id);
                }
                if (isValidate) {
                  return;
                }
              }
            }
          } else if (json.instructions[x].TYPE === 'Lock') {
            if (!json.instructions[x].id && !json.instructions[x].instructions && !json.instructions[x].demands) {

            } else {

              if (json.instructions[x].demands && typeof json.instructions[x].demands == 'string') {
                json.instructions[x].demands = JSON.parse(json.instructions[x].demands);
              }
              if ((!json.instructions[x].instructions || json.instructions[x].instructions.length === 0)) {
                flag = false;
                checkErr = true;
                self.invalidMsg = (!json.instructions[x].demands || json.instructions[x].demands.length === 0) ? 'workflow.message.lockNameIsMissing' : 'workflow.message.invalidLockInstruction';
                if (isOpen) {
                  if ((!json.instructions[x].demands || json.instructions[x].demands.length === 0)) {
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
          } else if (json.instructions[x].TYPE === 'ConsumeNotices') {
            if ((!json.instructions[x].instructions || json.instructions[x].instructions.length === 0)) {
              flag = self.workflowService.validateFields(json.instructions[x], 'ConsumeNotices');
              if (!flag) {
                checkErr = true;
                self.invalidMsg = 'workflow.message.invalidConsumeNoticeInstruction';
              }
              if (!flag && isValidate) {
                if (isOpen) {
                  self.openSideBar(json.instructions[x].id);
                }
                return;
              }
            }
          } else if (json.instructions[x].TYPE === 'ForkList') {
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
          } else if (json.instructions[x].TYPE === 'StickySubagent') {
            if (!json.instructions[x].id && !json.instructions[x].instructions && !json.instructions[x].agentName) {

            } else {
              if ((!json.instructions[x].instructions || json.instructions[x].instructions.length === 0)) {
                flag = false;
                checkErr = true;
                self.invalidMsg = !json.instructions[x].agentName ? 'workflow.message.agentIsMissing' : 'workflow.message.invalidStickySubagentInstruction';
                if (isOpen) {
                  if (!json.instructions[x].children) {
                    self.openSideBar(json.instructions[x].id);
                  } else {
                    let msg = '';
                    self.translate.get('workflow.message.invalidStickySubagentInstruction').subscribe(translatedValue => {
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
          } else if (json.instructions[x].TYPE === 'AddOrder') {
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
          } else if (json.instructions[x].TYPE === 'ExpectNotices') {
            flag = self.workflowService.validateFields(json.instructions[x], 'ExpectNotices');
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
          } else if (json.instructions[x].TYPE === 'PostNotices') {
            flag = self.workflowService.validateFields(json.instructions[x], 'PostNotices');
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
          } else if (json.instructions[x].TYPE === 'Fork') {
            flag = self.workflowService.validateFields(json.instructions[x], 'Fork');
            if (!flag) {
              checkErr = true;
              self.invalidMsg = (!json.instructions[x].branches || json.instructions[x].branches.length < 2) ? 'workflow.message.invalidForkInstruction' : 'inventory.message.nameIsNotValid';
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
              const ids = [];
              let maxNum = 0;

              json.instructions[x].branches.forEach((branch) => {
                if (branch.id) {
                  const arr = branch.id.match(/[0-9]+$/);
                  if (arr && arr.length > 0) {
                    const num = parseInt(arr[0], 10);
                    if (typeof num == 'number' && !isNaN(num)) {
                      if (num > maxNum) {
                        maxNum = num;
                      }
                    }
                  }
                }
              });

              json.instructions[x].branches = json.instructions[x].branches.filter((branch) => {
                if (ids.indexOf(branch.id) == -1) {
                  ids.push(branch.id);
                } else {
                  const arr = branch.id.match(/[0-9]+$/);
                  if (arr && arr.length) {
                    const num = parseInt(arr[0], 10);
                    if (typeof num == 'number' && !isNaN(num)) {
                      branch.id = branch.id.substring(0, branch.id.indexOf(num)) + (maxNum + 1);
                    } else {
                      branch.id = branch.id + (maxNum + 1);
                    }
                    ids.push(branch.id);
                  }
                }
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
          if (json.instructions[x].TYPE === 'Retry' && json.instructions[x].instructions && !json.instructions[x].try) {
            json.instructions[x].TYPE = 'Try';
            self.workflowService.convertRetryToTryCatch(json.instructions[x]);
          }
          if (json.instructions[x].TYPE === 'AddOrder') {
            const workflowName = clone(json.instructions[x].workflowName);
            const argu = clone(json.instructions[x].arguments);
            const startPosition = clone(json.instructions[x].startPosition);
            const remainWhenTerminated = clone(json.instructions[x].remainWhenTerminated);
            const forceJobAdmission = clone(json.instructions[x].forceJobAdmission);
            const endPositions = clone(json.instructions[x].endPositions);
            delete json.instructions[x].workflowName;
            delete json.instructions[x].arguments;
            delete json.instructions[x].remainWhenTerminated;
            delete json.instructions[x].startPosition;
            delete json.instructions[x].endPositions;
            delete json.instructions[x].forceJobAdmission;
            json.instructions[x].workflowName = workflowName;
            json.instructions[x].arguments = argu;
            json.instructions[x].remainWhenTerminated = remainWhenTerminated;
            json.instructions[x].forceJobAdmission = forceJobAdmission;
            json.instructions[x].startPosition = startPosition;
            json.instructions[x].endPositions = endPositions;
          } else if (json.instructions[x].TYPE === 'Lock') {
            json.instructions[x].lockedWorkflow = {
              instructions: json.instructions[x].instructions
            };

            const demands = clone(json.instructions[x].demands);
            delete json.instructions[x].instructions;
            delete json.instructions[x].demands;
            json.instructions[x].demands = demands;
          } else if (json.instructions[x].TYPE === 'ConsumeNotices' || json.instructions[x].TYPE === 'StickySubagent') {
            json.instructions[x].subworkflow = {
              instructions: json.instructions[x].instructions
            };
            delete json.instructions[x].instructions;
          } else if (json.instructions[x].TYPE === 'Options') {
            json.instructions[x].block = {
              instructions: json.instructions[x].instructions
            };
            delete json.instructions[x].instructions;
          } else if (json.instructions[x].TYPE === 'Cycle') {
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
          } else if (json.instructions[x].TYPE === 'ForkList') {
            const childrenObj = clone(json.instructions[x].children);
            const childToIdObj = clone(json.instructions[x].childToId);
            const agentNameObj = clone(json.instructions[x].agentName);
            const subagentClusterIdObj = clone(json.instructions[x].subagentClusterId);
            const subagentClusterIdExprObj = clone(json.instructions[x].subagentClusterIdExpr);
            const subagentIdVariableObj = clone(json.instructions[x].subagentIdVariable);
            let joinIfFailed = clone(json.instructions[x].joinIfFailed);
            let result = clone(json.instructions[x].result);
            joinIfFailed = joinIfFailed == 'true' || joinIfFailed === true;
            delete json.instructions[x].children;
            delete json.instructions[x].childToId;
            delete json.instructions[x].joinIfFailed;
            delete json.instructions[x].result;
            delete json.instructions[x].agentName;
            delete json.instructions[x].subagentClusterId;
            delete json.instructions[x].subagentClusterIdExpr;
            delete json.instructions[x].subagentIdVariable;
            if (childrenObj) {
              json.instructions[x].children = childrenObj;
              json.instructions[x].childToId = childToIdObj;
            } else {
              json.instructions[x].agentName = agentNameObj;
              json.instructions[x].subagentClusterId = subagentClusterIdObj;
              json.instructions[x].subagentClusterIdExpr = subagentClusterIdExprObj;
            }
            json.instructions[x].subagentIdVariable = subagentIdVariableObj;
            json.instructions[x].workflow = {
              instructions: json.instructions[x].instructions,
              result
            };
            json.instructions[x].joinIfFailed = joinIfFailed;
            delete json.instructions[x].instructions;
          } else if (json.instructions[x].TYPE === 'Fork') {
            const branchObj = clone(json.instructions[x].branches);
            let joinIfFailed = clone(json.instructions[x].joinIfFailed);
            joinIfFailed = joinIfFailed == 'true' || joinIfFailed === true;
            delete json.instructions[x].branches;
            delete json.instructions[x].joinIfFailed;
            json.instructions[x].branches = branchObj;
            json.instructions[x].joinIfFailed = joinIfFailed;
          } else if (json.instructions[x].TYPE === 'Fail') {
            if (json.instructions[x].uncatchable == 'false') {
              json.instructions[x].uncatchable = false;
            } else if (json.instructions[x].uncatchable == 'true') {
              json.instructions[x].uncatchable = true;
            }

            const message = clone(json.instructions[x].message);
            const outcome = clone(json.instructions[x].outcome);
            const uncatchable = clone(json.instructions[x].uncatchable);
            delete json.instructions[x].message;
            delete json.instructions[x].outcome;
            delete json.instructions[x].uncatchable;
            json.instructions[x].message = message;
            json.instructions[x].outcome = outcome;
            json.instructions[x].uncatchable = uncatchable;
          } else if (json.instructions[x].TYPE === 'Finish') {
            if (json.instructions[x].unsuccessful == 'false') {
              json.instructions[x].unsuccessful = false;
              delete json.instructions[x].message;
            } else if (json.instructions[x].unsuccessful == 'true' || json.instructions[x].unsuccessful == true) {
              json.instructions[x].unsuccessful = true;
            } else {
              delete json.instructions[x].message;
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
          if (json.instructions[x].TYPE !== 'Execute.Named' && json.instructions[x].TYPE !== 'Try') {
            if (json.instructions[x].label) {
              const label = clone(json.instructions[x].label);
              delete json.instructions[x].label;
              json.instructions[x].label = label;
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
              if (!this.invalidMsg) {
                if (this.jobs[n].value.executable) {
                  if (this.jobs[n].value.executable.TYPE === 'ShellScriptExecutable' && !this.jobs[n].value.executable.script) {
                    this.invalidMsg = 'workflow.message.scriptIsMissing';
                  } else if (this.jobs[n].value.executable.TYPE === 'InternalExecutable' && !this.jobs[n].value.executable.className) {
                    this.invalidMsg = 'workflow.message.classNameIsMissing';
                  } else if (!this.jobs[n].value.agentName) {
                    this.invalidMsg = 'workflow.message.agentIsMissing';
                  } else if (this.jobs[n].value.executable && this.jobs[n].value.executable.login &&
                    this.jobs[n].value.executable.login.withUserProfile && !this.jobs[n].value.executable.login.credentialKey) {
                    this.invalidMsg = 'inventory.message.credentialKeyIsMissing';
                  }
                }
              }
            }


            if (/[$.]jobs\[/gm.test(self.invalidMsg)) {
              let reg = "$.jobs\['" + self.jobs[n].name + "']";
              if (self.invalidMsg.indexOf(reg) > -1) {
                flag = false;
                checkErr = true;
              }
            }
            if (!flag && isValidate) {
              if (isOpen) {
                self.openSideBar(ids.get(self.jobs[n].name));
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
    if (isEmpty(mainJson.jobs)) {
      delete mainJson.jobs;
    }
    return flag;
  }

  private validateByURL(json): void {
    const obj = clone(json);
    this.coreService.post('inventory/' + this.objectType + '/validate', obj).subscribe((res: any) => {
      if (res.invalidMsg) {
        this.invalidMsg = res.invalidMsg;
        if (res.invalidMsg.match('lockName: is missing but it is required')) {
          this.invalidMsg = 'workflow.message.lockNameIsMissing';
        }
      }
      this.workflow.valid = res.valid;
      if (this.workflow.path === this.data.path) {
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
    if (isOpen) {
      this.coreService.post('inventory/validate/predicate', predicate).subscribe((res: any) => {
        if (res.invalidMsg) {
          this.invalidMsg = res.invalidMsg;
          this.workflow.valid = false;
          if (this.workflow.path === this.data.path) {
            this.data.valid = false;
          }
          this.openSideBar(id);
        }
      });
    }
  }

  private checkJobInstruction(data): any {
    for (const prop in data.jobs) {
      if (data.jobs[prop] && data.jobs[prop].executable) {
        if (data.jobs[prop].executable.env && isArray(data.jobs[prop].executable.env)) {
          this.coreService.addSlashToStringForEvn(data.jobs[prop].executable);
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
      if (!this.implicitSave) {
        this.xmlToJsonParser();
      }
    } else if (this.selectedNode === undefined) {
      return;
    }
    let data;
    if (!noValidate || noValidate === 'false') {
      data = this.coreService.clone(this.workflow.configuration);
      this.modifyJSON(data, false, false);
    } else {
      data = noValidate;
    }
    this.checkJobInstruction(data);
    if (this.workflow.path && !isEqual(this.workflow.actual, JSON.stringify(data)) && !this.isStore) {
      this.isStore = true;
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
    } else if (type === 'jobResourceNames') {
      if (!isEqual(JSON.stringify(this.extraConfiguration.jobResourceNames), JSON.stringify(this.jobResourceNames))) {
        this.jobResourceNames = this.coreService.clone(this.extraConfiguration.jobResourceNames);
        flag = true;
      }
    } else if (type === 'variable') {
      const variableDeclarations = {parameters: [], allowUndeclared: false};
      let temp = this.coreService.clone(this.variableDeclarations.parameters);
      variableDeclarations.parameters = temp.filter((value) => {
        delete value.value.invalid;
        if (value.value.type === 'List' || value.value.type === 'Final') {
          delete value.value.default;
        } else if (value.value.type !== 'String') {
          delete value.value.facet;
          delete value.value.message;
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
        if (value.value.list) {
          let list = [];
          value.value.list.forEach((obj) => {
            this.coreService.addSlashToString(obj, 'name');
            list.push(obj.name);
          });
          value.value.list = list;
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

  private clearClipboard(): void {
    if (this.cutCell.length > 0) {
      this.cutCell.forEach(cell => {
        this.changeCellStyle(this.editor.graph, cell, false);
      })
    }
    this.cutCell = [];
    $('#toolbar').find('img').each(function (index) {
      if (index === 19) {
        $(this).addClass('disable-link');
      }
    });
  }

  private storeData(data, onlyStore = false): void {
    if (this.isTrash || !this.workflow || !this.workflow.path || !this.permission.joc.inventory.manage) {
      return;
    }
    if (this.cutCell.length > 0) {
      this.clearClipboard();
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
    if (!this.workflow.path) {
      return;
    }

    const request: any = {
      configuration: newObj,
      path: this.workflow.path,
      valid: this.workflow.valid,
      objectType: this.objectType
    };

    if (sessionStorage['$SOS$FORCELOGING'] === 'true') {
      this.translate.get('auditLog.message.defaultAuditLog').subscribe(translatedValue => {
        request.auditLog = {comment: translatedValue};
      });
    }
    this.coreService.post('inventory/store', request).subscribe({
      next: (res: any) => {
        this.isStore = false;
        if (res.path === this.workflow.path) {
          this.lastModified = res.configurationDate;
          this.workflow.actual = JSON.stringify(data);
          this.workflow.deployed = false;
          this.workflow.valid = res.valid;
          this.data.valid = res.valid;
          this.data.deployed = false;
          if (res.invalidMsg) {
            this.invalidMsg = res.invalidMsg;
          }
          if (!res.valid) {
            const data = this.coreService.clone(this.workflow.configuration);
            this.modifyJSON(data, true, false);
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
      nzData: {
        agents: this.inventoryService.agentList,
        preferences: this.preferences
      },
      nzFooter: null,
      nzAutofocus: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(result => {
      if (result) {
        this.jobs.forEach((job) => {
          if ((result.finds.length === 0 && !job.value.agentName) || (result.finds.length > 0 && result.finds[0] === '*')) {
            if (result.agentName) {
              job.value.agentName = result.agentName;
              job.value.subagentClusterId = result.replace;
            } else {
              job.value.agentName = result.replace;
              delete job.value.subagentClusterId;
            }
          } else if (result.finds.length > 0 && job.value.agentName) {
            for (const i in result.finds) {
              if (result.finds[i]) {
                if ((result.finds[i].toLowerCase() === job.value.agentName.toLowerCase())
                  || (job.value.subagentClusterId && result.finds[i].toLowerCase() === job.value.subagentClusterId.toLowerCase())) {
                  if (result.agentName) {
                    job.value.agentName = result.agentName;
                    job.value.subagentClusterId = result.replace;
                  } else {
                    job.value.agentName = result.replace;
                    delete job.value.subagentClusterId;
                  }
                  break;
                }
              }
            }
          }
        });
        const data = this.coreService.clone(this.workflow.configuration);
        this.modifyJSON(data, false, false);
        if (!isEqual(this.workflow.actual, JSON.stringify(data))) {
          this.isStore = true;
          this.storeData(data);
        }
      }
    });
  }

}
