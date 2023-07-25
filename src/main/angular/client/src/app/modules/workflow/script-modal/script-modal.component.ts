import {Component, HostListener, inject, ViewChild} from '@angular/core';
import {NZ_MODAL_DATA, NzModalRef} from 'ng-zorro-antd/modal';
import {ClipboardService} from 'ngx-clipboard';
import {TranslateService} from '@ngx-translate/core';
import {NzMessageService} from 'ng-zorro-antd/message';
import {DragDrop} from "@angular/cdk/drag-drop";
import {WorkflowService} from '../../../services/workflow.service';
import {CoreService} from '../../../services/core.service';
import {AuthService} from '../../../components/guard';

declare const $;

@Component({
  selector: 'app-script-modal',
  templateUrl: './script-modal.component.html'
})
export class ScriptModalComponent {
  readonly modalData: any = inject(NZ_MODAL_DATA);
  workflowPath: string;
  jobName: string;
  isScript: boolean;
  data: any;
  schedule: any;
  predicate: any;
  admissionTime: any;
  agentName: string;
  subagentClusterId: string;
  timezone: string;
  noticeBoardNames: string;
  mode: string;

  dragEle: any;
  preferences: any = {};
  permission: any = {};

  days = [];
  periodList: any = [];
  schemeList: any = [];
  tempPeriodList: any = [];
  cmOption: any = {
    lineNumbers: true,
    autoRefresh: true,
    lineWrapping: true,
    matchBrackets: true,
    foldGutter: true,
    scrollbarStyle: 'simple',
    readOnly: true,
    tabSize: 4,
    highlightSelectionMatches: {showToken: /\w/, annotateScrollbar: true},
    mode: 'shell',
    gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter']
  };
  todayDate: string;
  type: string;

  @ViewChild('codeMirror', {static: false}) cm: any;

  constructor(public activeModal: NzModalRef, public coreService: CoreService, private translate: TranslateService, private authService: AuthService,
              private message: NzMessageService, private clipboardService: ClipboardService, private workflowService: WorkflowService, private dragDrop: DragDrop) {
  }

  ngOnInit(): void {
    this.workflowPath = this.modalData.workflowPath;
    this.jobName = this.modalData.jobName;
    this.isScript = this.modalData.isScript;
    this.data = this.modalData.data;
    this.schedule = this.modalData.schedule;
    this.predicate = this.modalData.predicate;
    this.admissionTime = this.modalData.admissionTime;
    this.agentName = this.modalData.agentName;
    this.subagentClusterId = this.modalData.subagentClusterId;
    this.timezone = this.modalData.timezone;
    this.noticeBoardNames = this.modalData.noticeBoardNames;
    this.cmOption.tabSize = this.preferences.tabSize;
    if (this.modalData.mode) {
      this.cmOption.mode = this.modalData.mode;
    } else {
      this.cmOption.mode = 'ruby';
    }

    this.todayDate = this.coreService.getStringDate(null);
    this.preferences = sessionStorage['preferences'] ? JSON.parse(sessionStorage['preferences']) : {};
    this.permission = JSON.parse(this.authService.permission) || {};
    if (this.preferences && this.preferences.zone === 'Asia/Calcutta') {
      this.preferences.zone = 'Asia/Kolkata';
    }

    this.days = this.coreService.getLocale().days;
    if (this.days) {
      this.days.push(this.days[0]);
    } else {
      this.days = [];
    }
    if (this.admissionTime && this.admissionTime.periods && this.admissionTime.periods.length > 0) {
      this.convertSecondIntoWeek();
    }
    if (this.schedule && this.schedule.schemes) {
      this.convertSchemeList();
    }
  }

  ngAfterViewInit(): void {
    this.dragEle = this.dragDrop.createDrag(this.activeModal.containerInstance.modalElementRef.nativeElement);
    setTimeout(() => {
      if (this.cm && this.cm.codeMirror) {
        const doc = this.cm.codeMirror.getDoc();
        const cursor = doc.getCursor(); // gets the line number in the cursor position
        doc.replaceRange(this.data, cursor);
        this.cm.codeMirror.focus();
        doc.setCursor(cursor);
      }
    }, 250);
    $('#resizable').resizable({
      resize: (e, x) => {
        const dom: any = document.getElementsByClassName('script-editor2')[0];
        this.cm.codeMirror.setSize((x.size.width - 2), (x.size.height - 2));
        dom.style.setProperty('width', (x.size.width + 32) + 'px', 'important');
      }
    });
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(e): void {
    if (this.dragEle) {
      this.dragEle.disabled = !(e.target && (e.target.getAttribute('class') === 'modal-header' || e.target.getAttribute('class') === 'drag-text'));
    }
  }

  private convertSchemeList(): void {
    this.schemeList = [];
    this.schedule.schemes.forEach((item) => {
      const obj = {
        periodList: [],
        repeat: this.workflowService.getTextOfRepeatObject(item.repeat)
      };
      if (item.admissionTimeScheme && item.admissionTimeScheme.periods) {
        this.workflowService.convertSecondIntoWeek(item.admissionTimeScheme, obj.periodList, this.days, {});
      }
      this.schemeList.push(obj);
    });
  }

  convertSecondIntoWeek(): void {
    this.workflowService.convertSecondIntoWeek(this.admissionTime, this.periodList, this.days, {});
  }

  showConvertTime(): void {
    if (this.schedule) {
      this.convertTime();
    } else {
      this.tempPeriodList = this.coreService.clone(this.periodList);
      if (this.preferences.zone !== this.timezone) {
        const convertTedList = [];
        this.periodList.forEach((item) => {
          item.periods.forEach((period) => {
            let obj: any = {
              periods: []
            };
            const originalTime = this.workflowService.convertSecondToTime(period.startTime);
            const currentDay = this.coreService.getDateByFormat(this.todayDate + ' ' + originalTime + '.000' + this.coreService.getDateByFormat(null, this.timezone, 'Z'), this.preferences.zone, 'YYYY-MM-DD');
            const convertedTime = this.coreService.getDateByFormat(this.todayDate + ' ' + originalTime + '.000' + this.coreService.getDateByFormat(null, this.timezone, 'Z'), this.preferences.zone, 'HH:mm:ss');
            if (item.secondOfWeek || item.secondOfDay) {
              if (this.todayDate != currentDay) {
                obj.day = (currentDay > this.todayDate) ? (item.day + 1) : (item.day - 1);
              } else {
                obj.day = item.day;
              }
              obj.frequency = this.days[obj.day];
            } else {
              obj = this.coreService.clone(item);
              obj.periods = [];
            }
            const dur = this.workflowService.convertDurationToHour(period.duration);
            obj.periods.push({text: 'starting at ' + convertedTime + ' for ' + dur});
            let flag = true;
            if (convertTedList.length > 0 && (item.secondOfWeek || item.secondOfDay)) {
              for (let i = 0; i < convertTedList.length; i++) {
                if (convertTedList[i].day === obj.day) {
                  flag = false;
                  convertTedList[i].periods.push({text: 'starting at ' + convertedTime + ' for ' + dur});
                  break;
                }
              }
            }
            if (flag) {
              convertTedList.push(obj);
            }
          });
        });
        this.periodList = convertTedList;
      }
    }
  }

  private convertTime(): void {
    this.tempPeriodList = this.coreService.clone(this.schemeList);
    if (this.preferences.zone !== this.timezone) {
      const convertTedList = [];
      this.schemeList.forEach((list) => {
        const x = {
          periodList: [],
          repeat: list.repeat
        };
        list.periodList.forEach((item) => {
          item.periods.forEach((period) => {
            const obj: any = {
              periods: []
            };

            const originalTime = this.workflowService.convertSecondToTime((period.startTime));
            const currentDay = this.coreService.getDateByFormat(this.todayDate + ' ' + this.workflowService.convertSecondToTime(period.startTime) + '.000' + this.coreService.getDateByFormat(null, this.timezone, 'Z'), this.preferences.zone, 'YYYY-MM-DD');
            const convertedTime = this.coreService.getDateByFormat(this.todayDate + ' ' + originalTime + '.000' + this.coreService.getDateByFormat(null, this.timezone, 'Z'), this.preferences.zone, 'HH:mm:ss');
            if (this.todayDate != currentDay) {
              obj.day = (currentDay > this.todayDate) ? (item.day + 1) : (item.day - 1);
            } else {
              obj.day = item.day;
            }
            obj.frequency = this.days[obj.day];
            if (!item.frequency) {
              obj.frequency = '';
            }
            const dur = this.workflowService.convertDurationToHour(period.duration);
            obj.periods.push({text: 'starting at ' + convertedTime + ' for ' + dur});
            let flag = true;
            if (x.periodList.length > 0) {
              for (let i = 0; i < x.periodList.length; i++) {
                if (x.periodList[i].day === obj.day) {
                  flag = false;
                  x.periodList[i].periods.push({text: 'starting at ' + convertedTime + ' for ' + dur});
                  break;
                }
              }
            }
            if (flag) {
              x.periodList.push(obj);
            }
          });
        });
        convertTedList.push(x);
      });
      this.schemeList = convertTedList;
    }
  }

  showOriginalTime(): void {
    if (this.schedule) {
      this.schemeList = this.coreService.clone(this.tempPeriodList);
    } else {
      this.periodList = this.coreService.clone(this.tempPeriodList);
    }
    this.tempPeriodList = [];
  }

  copyToClipboard(): void {
    const selectedText = window.getSelection().toString();
    this.clipboardService.copyFromContent(selectedText || this.data);
    this.coreService.showCopyMessage(this.message);
  }

  navToConfig(): void {
    if (this.workflowPath) {
      this.activeModal.destroy();
      this.workflowService.setJobValue(this.jobName);
      this.coreService.navToInventoryTab(this.workflowPath, 'WORKFLOW');
    }
  }

  @HostListener('window:click', ['$event'])
  onClick(event): void {
    if (event) {
      if (event.target.getAttribute('data-id-x')) {
        this.coreService.navToInventoryTab(event.target.getAttribute('data-id-x'), 'NOTICEBOARD');
      } else if (event.target.getAttribute('data-id-y')) {
        this.coreService.showBoard(event.target.getAttribute('data-id-y'));
      }
    }
  }
}

