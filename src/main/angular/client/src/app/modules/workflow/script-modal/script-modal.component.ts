import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {NzModalRef} from 'ng-zorro-antd/modal';
import {ClipboardService} from 'ngx-clipboard';
import * as moment from 'moment-timezone';
import {TranslateService} from '@ngx-translate/core';
import {NzMessageService} from 'ng-zorro-antd/message';
import {WorkflowService} from '../../../services/workflow.service';
import {CoreService} from '../../../services/core.service';

@Component({
  selector: 'app-script-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './script-modal.component.html'
})
export class ScriptModalComponent implements OnInit {
  @Input() jobName: string;
  @Input() isScript: boolean;
  @Input() data: any;
  @Input() schedule: any;
  @Input() predicate: any;
  @Input() admissionTime: any;
  @Input() timezone: string;
  @Input() readonly: boolean;

  preferences: any = {};
  days = [];
  periodList = [];
  schemeList = [];
  tempPeriodList = [];
  cmOption: any = {
    lineNumbers: true,
    readonly: true,
    viewportMargin: Infinity,
    mode: 'shell'
  };

  constructor(public activeModal: NzModalRef, private coreService: CoreService, private translate: TranslateService,
              private message: NzMessageService, private clipboardService: ClipboardService, private workflowService: WorkflowService) {
  }

  ngOnInit(): void {
    this.preferences = sessionStorage.preferences ? JSON.parse(sessionStorage.preferences) : {};
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
    const hour = 3600;
    this.admissionTime.periods.forEach((period) => {
      const hours = (period.secondOfWeek || period.secondOfDay) / hour;
      const day = Math.floor(hours / 24) + 1;
      const d = day - 1;
      const obj: any = {
        day,
        secondOfWeek: (d * 24 * 3600),
        frequency: this.days[day],
        periods: []
      };
      const startTime = (period.secondOfWeek || period.secondOfDay) - obj.secondOfWeek;
      const p: any = {
        startTime,
        duration: period.duration
      };
      p.text = this.getText(p.startTime, p.duration);
      let flag = true;
      if (this.periodList.length > 0) {
        for (const i in this.periodList) {
          if (this.periodList[i].day == day) {
            flag = false;
            this.periodList[i].periods.push(p);
            break;
          }
        }
      }
      if (flag) {
        obj.periods.push(p);
        this.periodList.push(obj);
      }
    });
  }

  private getText(startTime, duration): string {
    const time = this.workflowService.convertSecondToTime(startTime);
    const dur = this.workflowService.convertDurationToHour(duration);
    return 'starting at ' + time + ' for ' + dur;
  }

  private showMsg(): void {
    let msg = '';
    this.translate.get('common.message.copied').subscribe(translatedValue => {
      msg = translatedValue;
    });
    this.message.success(msg);
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
            const obj: any = {
              periods: []
            };
            const originalTime = this.workflowService.convertSecondToTime(period.startTime);
            const day = parseInt(moment('1970-01-02 ' + originalTime + '.000' + moment().tz(this.timezone).format('Z')).tz(this.preferences.zone).format('DD'), 10);
            const convertedTime = moment('1970-01-01 ' + originalTime + '.000' + moment().tz(this.timezone).format('Z')).tz(this.preferences.zone).format('HH:mm:ss');
            if (day != 2) {
              obj.day = (day > 2) ? (item.day + 1) : (item.day - 1);
            } else {
              obj.day = item.day;
            }
            obj.frequency = this.days[obj.day];
            const dur = this.workflowService.convertDurationToHour(period.duration);
            obj.periods.push({text: 'starting at ' + convertedTime + ' for ' + dur});
            let flag = true;
            if (convertTedList.length > 0) {
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
            const originalTime = this.workflowService.convertSecondToTime(period.startTime);
            const day = parseInt(moment('1970-01-02 ' + originalTime + '.000' + moment().tz(this.timezone).format('Z')).tz(this.preferences.zone).format('DD'), 10);
            const convertedTime = moment('1970-01-01 ' + originalTime + '.000' + moment().tz(this.timezone).format('Z')).tz(this.preferences.zone).format('HH:mm:ss');
            if (day != 2) {
              obj.day = (day > 2) ? (item.day + 1) : (item.day - 1);
            } else {
              obj.day = item.day;
            }
            obj.frequency = this.days[obj.day];
            if(!item.frequency){
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
    this.showMsg();
  }
}

