import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {NzModalRef} from 'ng-zorro-antd/modal';
import {ClipboardService} from 'ngx-clipboard';
import * as moment from 'moment-timezone';
import {TranslateService} from '@ngx-translate/core';
import {NzMessageService} from 'ng-zorro-antd/message';
import {WorkflowService} from '../../../services/workflow.service';
import {CoreService} from '../../../services/core.service';
import {AuthService} from '../../../components/guard';

@Component({
  selector: 'app-script-modal',
  templateUrl: './script-modal.component.html'
})
export class ScriptModalComponent implements OnInit {
  @Input() jobName: string;
  @Input() isScript: boolean;
  @Input() data: any;
  @Input() schedule: any;
  @Input() predicate: any;
  @Input() admissionTime: any;
  @Input() agentName: string;
  @Input() timezone: string;
  @Input() readonly: boolean;

  preferences: any = {};
  dailyPlan: any = {};
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
  todayDate: string;

  constructor(public activeModal: NzModalRef, private coreService: CoreService, private translate: TranslateService, private authService: AuthService,
              private message: NzMessageService, private clipboardService: ClipboardService, private workflowService: WorkflowService) {
  }

  ngOnInit(): void {
    this.todayDate = moment().format('YYYY-MM-DD');
    this.preferences = sessionStorage.preferences ? JSON.parse(sessionStorage.preferences) : {};
    if (this.preferences && this.preferences.zone === 'Asia/Calcutta') {
      this.preferences.zone = 'Asia/Kolkata';
    }
    if ((this.admissionTime && this.admissionTime.periods && this.admissionTime.periods.length > 0)
      || (this.schedule && this.schedule.schemes)) {
      this.loadSetting();
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

  private loadSetting(): void {
    const controllerIds = JSON.parse(this.authService.scheduleIds) || {};
    if (this.authService.currentUserData && controllerIds.selected) {
      const configObj = {
        controllerId: controllerIds.selected,
        account: this.authService.currentUserData,
        configurationType: 'GLOBALS'
      };
      this.coreService.post('configurations', configObj).subscribe((res: any) => {
        const dailyPlan = {
          time_zone: '',
          period_begin: '',
        };
        if (res.configurations[0]) {
          const obj = JSON.parse(res.configurations[0].configurationItem).dailyplan;
          if (obj.time_zone) {
            dailyPlan.time_zone = obj.time_zone.value;
          }
          if (obj.period_begin) {
            dailyPlan.period_begin = obj.period_begin.value;
          }
        }
        if (!dailyPlan.time_zone) {
          dailyPlan.time_zone = res.defaultGlobals.dailyplan.time_zone.default;
        }
        if (!dailyPlan.period_begin) {
          dailyPlan.period_begin = res.defaultGlobals.dailyplan.period_begin.default;
        }
        this.dailyPlan = dailyPlan;
      });
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
            const currentDay = moment(this.todayDate + ' ' + originalTime + '.000' + moment().tz(this.timezone).format('Z')).tz(this.preferences.zone).format('YYYY-MM-DD');
            const convertedTime = moment(this.todayDate + ' ' + originalTime + '.000' + moment().tz(this.timezone).format('Z')).tz(this.preferences.zone).format('HH:mm:ss');
            if (this.todayDate != currentDay) {
              obj.day = (currentDay > this.todayDate) ? (item.day + 1) : (item.day - 1);
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
    if (this.preferences.zone !== this.dailyPlan.time_zone) {
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
            const dailyPlanTime = this.workflowService.convertStringToDuration(this.dailyPlan.period_begin, true);
            const originalTime = this.workflowService.convertSecondToTime((period.startTime + dailyPlanTime));
            const currentDay = moment(this.todayDate + ' ' + this.workflowService.convertSecondToTime(period.startTime) + '.000' + moment().tz(this.dailyPlan.time_zone).format('Z')).tz(this.preferences.zone).format('YYYY-MM-DD');
            const convertedTime = moment(this.todayDate + ' ' + originalTime + '.000' + moment().tz(this.dailyPlan.time_zone).format('Z')).tz(this.preferences.zone).format('HH:mm:ss');
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
}

