import {Component, OnInit, Input, OnDestroy, ViewChild} from '@angular/core';
import {DatePipe} from '@angular/common';
import {Router} from '@angular/router';
import {Subscription} from 'rxjs/Subscription';
import {TranslateService} from 'ng2-translate';
import {ToasterService} from 'angular2-toaster';
import {CoreService} from '../../../services/core.service';
import {AuthService} from '../../../components/guard';
import {NgbModal, NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {FileUploader} from 'ng2-file-upload';

import {DataService} from '../../../services/data.service';
import {DeleteModal} from '../../../components/delete-modal/delete.component';
import {CommentModal} from '../../../components/comment-modal/comment.component';
import {TreeModal} from '../../../components/tree-modal/tree.component';
import {CalendarService} from './calendar.service';
import {saveAs} from 'file-saver/FileSaver';
import {TreeComponent} from "../../../components/tree-navigation/tree.component";
import * as _ from 'underscore';
import * as moment from 'moment';

declare const Holidays;
declare const $;

@Component({
  selector: 'ngbd-modal-content',
  templateUrl: './show-dialog.html'
})
export class ShowModal {
  @Input() calendar:any;
  constructor(public activeModal: NgbActiveModal, public coreService : CoreService) {
  }
}

@Component({
  selector: 'ngbd-modal-content',
  templateUrl: './import-dialog.html'
})
export class ImportModal implements OnInit {

  @Input() schedulerId: any;
  @Input() display: any;

  fileLoading: boolean = false;
  messageList: any;
  required: boolean = false;
  submitted: boolean = false;
  basedOnCalendars: any = [];
  fileContentCalendars: any = [];
  importCalendarObj: any = {};
  checkImportCalendar: any = {
    checkbox: false
  };
  calendrs: any = [];
  comments: any = {};
  uploader: FileUploader;

  constructor(public activeModal: NgbActiveModal, private coreService: CoreService, public translate: TranslateService, public toasterService: ToasterService) {
    this.uploader = new FileUploader({url: ''});
  }

  ngOnInit() {
    this.importCalendarObj.jobschedulerId = this.schedulerId;
    this.importCalendarObj.calendars = [];
    this.comments.radio = "predefined";
    if (sessionStorage.comments)
      this.messageList = JSON.parse(sessionStorage.comments);
    if (sessionStorage.$SOS$FORCELOGING == 'true') {
      this.required = true;
    }
  }

  onSubmit() {
    this.importCalendarCall();
  }

  // CALLBACKS
  onFileSelected(event: any): void {
    let self = this;
    let item = event["0"];

    let fileExt = item.name.slice(item.name.lastIndexOf('.') + 1).toUpperCase();
    if (fileExt != 'JSON') {
      let msg = '';
      this.translate.get("message.invalidFileExtension").subscribe(translatedValue => {
        msg = translatedValue;
      });
      this.toasterService.pop('error', '', fileExt + ' ' + msg);
      //  item.remove();
    } else {
      this.fileLoading = true;
      let reader = new FileReader();
      reader.readAsText(item, "UTF-8");
      reader.onload = onLoadFile;
    }

    function onLoadFile(event) {
      let data = JSON.parse(event.target.result);
      let paths = [];
      if (data && data.calendars) {
        for (let i = 0; i < data.calendars.length; i++) {
          if (!data.calendars[i].basedOn) {
            self.fileContentCalendars.push(data.calendars[i]);
          } else {
            self.basedOnCalendars.push(data.calendars[i]);
          }
        }

      }
      if (self.fileContentCalendars && _.isArray(self.fileContentCalendars)) {
        for (let i = 0; i < self.fileContentCalendars.length; i++) {
          if (self.fileContentCalendars[i].path)
            paths.push(self.fileContentCalendars[i].path);
        }
      }
      if (paths.length == 0) {
        self.fileLoading = false;
        self.fileContentCalendars = undefined;
        let msg = '';
        self.translate.get('message.notValidCalendarFile').subscribe(translatedValue => {
          msg = translatedValue;
        });
        self.toasterService.pop('error', '', msg);
        self.uploader.queue[0].remove();
        return;
      }
      let obj = {
        calendars: paths,
        compact: true,
        jobschedulerId: self.schedulerId
      };
      let result: any;
      self.coreService.post('/calendar/used', obj).subscribe((res) => {
        result = res;
        self.calendrs = result.calendars;
        result.calendars.forEach(function (value) {
          for (let i = 0; i < self.fileContentCalendars.length; i++) {
            if (value.path == self.fileContentCalendars[i].path) {
              self.fileContentCalendars[i].isExit = true;
              break;
            }
          }
        });
        self.fileLoading = false;
      }, () => {
        self.fileLoading = false;
      });

    }
  }

  checkImportCalendarFn() {
    if (this.checkImportCalendar.checkbox && this.fileContentCalendars.length > 0) {
      this.importCalendarObj.calendars = this.fileContentCalendars;
    } else {
      this.importCalendarObj.calendars = [];
    }
  };

  importCalendarObjChange() {
    if (this.importCalendarObj.calendars && this.importCalendarObj.calendars.length > 0 && this.fileContentCalendars) {
      this.checkImportCalendar.checkbox = this.importCalendarObj.calendars.length == this.fileContentCalendars.length;
    } else {
      this.checkImportCalendar.checkbox = false;
    }
    this.calendrs.forEach(function (value) {
      for (let i = 0; i < this.importCalendarObj.calendars.length; i++) {
        if (value.usedBy && this.importCalendarObj.calendars[i].path == value.path) {
          this.importCalendars.push(value);
          break;
        }
      }
    });
  }

  private importCalendarCall() {
    this.submitted = true;
    for (let i = 0; i < this.importCalendarObj.calendars.length; i++) {
      if (this.importCalendarObj.calendars[i].isExit) {
        delete this.importCalendarObj.calendars[i]['isExit'];
      }
    }
    if (this.basedOnCalendars && this.basedOnCalendars.length > 0) {
      this.importCalendarObj.calendars = this.importCalendarObj.calendars.concat(this.basedOnCalendars)
    }
    this.importCalendarObj.auditLog = {};
    if (this.comments.comment) {
      this.importCalendarObj.auditLog.comment = this.comments.comment;
    }

    if (this.comments.timeSpent) {
      this.importCalendarObj.auditLog.timeSpent = this.comments.timeSpent;
    }

    if (this.comments.ticketLink) {
      this.importCalendarObj.auditLog.ticketLink = this.comments.ticketLink;
    }
    this.coreService.post('calendars/import', this.importCalendarObj).subscribe(() => {
      this.activeModal.close('');
    }, () => {
      this.submitted = false;
    });
  }

  cancel() {
    this.activeModal.close('');
  }
}

@Component({
  selector: 'ngbd-modal-content',
  templateUrl: './frequency-dialog.html'
})
export class FrequencyModal implements OnInit, OnDestroy {

  planItems: any = [];
  Math = Math;
  calObj: any = {};
  countryListArr: any = [];
  selectedMonths: any = [];
  selectedMonthsU: any = [];
  holidayList: any = [];
  holidayDays: any = {checked: false};
  tempItems: any = [];

  hd = new Holidays();
  toDate: any;
  calendarTitle: any;
  frequencyObj: any;
  isCalendarLoading: boolean;
  isRuntimeEdit: boolean;
  countryField: boolean;
  isCalendarDisplay: boolean = false;
  showMonthRange: boolean = false;

  excludedDates: any = [];
  includedDates: any = [];

  tempList: any = [];

  frequencyList: any = [];
  frequencyList1: any = [];
  excludeFrequencyList: any = [];

  str: string;
  config: any = {};

  @Input() schedulerId: any;
  @Input() dateFormat: any;
  @Input() dateFormatM: any;
  @Input() calendar: any;
  @Input() editor: any;
  @Input() frequency: any = {};
  @Input() flag: boolean;
  @Input() _temp: any = {};
  @Input() data: any = {};

  constructor(public activeModal: NgbActiveModal, private coreService: CoreService, public modalService: NgbModal, private datePipe: DatePipe, private calendarService: CalendarService) {
  }

  ngOnInit() {
    let self = this;
    $('.modal').css('opacity', 0.65);
    $('#freq-modal').parents('div').addClass('card m-a');

    this.str = 'tab.weekDays';
    this.calendarTitle = new Date().getFullYear();
    this.config = {
      format: this.dateFormatM
    };

    let countryList = this.hd.getCountries('en');

    if (this.editor.frequencyType === 'INCLUDE' && this.calendar.includesFrequency.length > 0) {
      this.frequencyList = this.calendar.includesFrequency;
      if (this.calendar.excludesFrequency.length > 0) {
        this.excludeFrequencyList = this.calendar.excludesFrequency;
      }
    } else if (this.editor.frequencyType === 'EXCLUDE' && this.calendar.excludesFrequency.length > 0) {
      this.frequencyList = this.calendar.excludesFrequency;
    }
    this.frequency.nationalHoliday = [];

    for (let x in countryList) {
      this.countryListArr.push({code: x, name: countryList[x]})
    }
    if (this.flag) {
      if (this.data)
        this.showCalendar(this.data);
      else
        this.showCalendar(null);
    }

    if (this._temp && !_.isEmpty(this._temp)) {

      this.isRuntimeEdit = true;
      if (this._temp.tab == 'nationalHoliday') {
        this.frequency.year = new Date(this._temp.nationalHoliday[0]).getFullYear();
        this.holidayDays.checked = true;
        this.countryField = true;
      }
      for (let i = 0; i < this.frequencyList.length; i++) {
        if (this.frequencyList[i] == this._temp || _.isEqual(this._temp, this.frequencyList[i])) {
          this.updateFrequencyObj(i);
          break;
        }
      }
    } else {
      if (this.frequencyList && this.frequencyList.length > 0) {
        this.generateFrequencyObj();
      }
    }
    if (this.frequency.tab !== 'specificDays' && this.editor.showYearView) {
      $('#full-calendar').calendar({
        clickDay: function (e) {
          self.checkDate(e.date);
        },
        renderEnd: function (e) {
          self.calendarTitle = e.currentYear;
          if (self.isCalendarDisplay) {
            self.changeDate();
          }
        }
      });
    }
  this.setEditorEnable();
  }

  setEditorEnable(){
    if(this.frequency.days && this.frequency.days.length > 0){
      this.editor.isEnable = true;
    }
  }

  ngOnDestroy() {
    $('.modal').css('opacity', 1);
  }

  updateFrequencyObj(i) {
    let self = this;
    if (this.frequencyList[i].tab == 'monthDays') {
      if (this.frequencyList[i].isUltimos === 'months') {
        this.frequency.selectedMonths = _.clone(this.frequencyList[i].selectedMonths);
        this.selectedMonths = [];
        this.frequencyList[i].selectedMonths.forEach(function (val) {
          self.selectMonthDaysFunc(val);
        });
      } else {
        this.frequency.selectedMonthsU = _.clone(this.frequencyList[i].selectedMonthsU);
        this.selectedMonthsU = [];
        this.frequencyList[i].selectedMonthsU.forEach(function (val) {
          self.selectMonthDaysUFunc(val);
        });
      }

      if (this.frequencyList[i].startingWithM)
        this.frequency.startingWithM = moment(this.frequencyList[i].startingWithM).format(this.dateFormatM);
      if (this.frequencyList[i].endOnM)
        this.frequency.endOnM = moment(this.frequencyList[i].endOnM).format(this.dateFormatM);
    } else if (this.frequencyList[i].tab === 'specificDays') {
      this.frequencyList[i].dates.forEach(function (date) {
        let x = date.split('-');
        self.tempItems.push({
          startDate: new Date(x[0], x[1] - 1, x[2] - 1),
          endDate: new Date(x[0], x[1] - 1, x[2] - 1),
          color: '#007da6'
        });

      });

      if (this.frequencyList[i].startingWithS)
        this.frequency.startingWithS = moment(this.frequencyList[i].startingWithS).format(this.dateFormatM);
      if (this.frequencyList[i].endOnS)
        this.frequency.endOnS = moment(this.frequencyList[i].endOnS).format(this.dateFormatM);

    } else if (this.frequencyList[i].tab == 'nationalHoliday') {
      this.frequency.nationalHoliday = _.clone(this.frequencyList[i].nationalHoliday) || [];
      this._temp.nationalHoliday.forEach(function (date) {
        self.holidayList.push({date: date})
      });
    }
    if (this.frequencyList[i].tab === 'weekDays') {
      this.frequency.days = _.clone(this.frequencyList[i].days);
      this.frequency.all = this.frequencyList[i].days.length === 7;
      if (this.frequencyList[i].startingWithW)
        this.frequency.startingWithW = moment(this.frequencyList[i].startingWithW).format(this.dateFormatM);
      if (this.frequencyList[i].endOnW)
        this.frequency.endOnW = moment(this.frequencyList[i].endOnW).format(this.dateFormatM);
    }
    if (this.frequencyList[i].tab == 'every') {
      if (this.frequencyList[i].startingWith)
        this.frequency.startingWith = moment(this.frequencyList[i].startingWith).format(this.dateFormatM);
      if (this.frequencyList[i].endOn)
        this.frequency.endOn = moment(this.frequencyList[i].endOn).format(this.dateFormatM);
    }
    //
    if (this.frequencyList[i].tab == 'specificWeekDays') {
      if (this.frequencyList[i].startingWithS)
        this.frequency.startingWithS = moment(this.frequencyList[i].startingWithS).format(this.dateFormatM);
      if (this.frequencyList[i].endOnS)
        this.frequency.endOnS = moment(this.frequencyList[i].endOnS).format(this.dateFormatM);
    }
    //
  }

  generateFrequencyObj() {
    this.tempItems = [];
    for (let i = 0; i < this.frequencyList.length; i++) {
      this.updateFrequencyObj(i);
    }
  }

  onFrequencyChange() {
    if (this.frequency) {
      if (this.frequency.tab == 'monthDays') {
        if (this.frequency.isUltimos != 'months') {
          this.str = 'label.ultimos';
        } else {
          this.str = 'label.monthDays';
        }
      } else {
        if (this.frequency.tab == 'specificWeekDays') {
          this.str = 'label.specificWeekDays';
        } else if (this.frequency.tab == 'specificDays') {
          this.str = 'label.specificDays';
        } else if (this.frequency.tab == 'weekDays') {
          this.str = 'label.weekDays';
        } else if (this.frequency.tab == 'every') {
          this.str = 'label.every';
        } else if (this.frequency.tab == 'nationalHoliday') {
          this.str = 'label.nationalHoliday';
        }
      }

      if (this.frequency.tab == 'specificWeekDays') {
        this.editor.isEnable = !!(this.frequency.specificWeekDay && this.frequency.which);
      } else if (this.frequency.tab == 'monthDays') {
        if (this.frequency.isUltimos == 'months') {
          this.editor.isEnable = this.selectedMonths.length != 0;
        } else {
          this.editor.isEnable = this.selectedMonthsU.length != 0;
        }

      } else if (this.frequency.tab == 'every') {
        this.editor.isEnable = !!(this.frequency.interval && this.frequency.dateEntity);
      } else if (this.frequency.tab == 'nationalHoliday') {
        this.editor.isEnable = !!(this.frequency.nationalHoliday && this.frequency.nationalHoliday.length > 0);
      }
      else if (this.frequency.tab == 'weekDays') {
        this.editor.isEnable = this.frequency.days && this.frequency.days.length > 0;
      } else if (this.frequency.tab == 'specificDays') {
        this.editor.isEnable = this.tempItems.length > 0;
      }
    }
  }

  onChangeDays() {
    if (this.frequency.days) {
      this.editor.isEnable = this.frequency.days.length > 0;
      this.frequency.all = this.frequency.days.length == 7;
      this.frequency.days.sort();
    }
  }

  onChangeMonths() {
    if (this.frequency.months) {
      this.frequency.allMonth = this.frequency.months.length == 12;
      this.frequency.months.sort(function (a, b) {
        return a - b;
      });
    }
  }

  onChangeHolidays() {
    this.editor.isEnable = !!(this.frequency.nationalHoliday && this.frequency.nationalHoliday.length > 0);
    if (this.holidayList && this.frequency.nationalHoliday) {
      this.holidayDays.checked = this.holidayList.length == this.frequency.nationalHoliday.length;
    }
  }

  private checkExclude(dates) {
    let obj = {
      tab: "specificDays",
      type: 'EXCLUDE',
      exclude: false,
      dates: [],
      str: ''
    };

    dates.forEach(function (date) {
      obj.dates.push(date.startDate);
    });

    obj.str = this.calendarService.freqToStr(obj, this.dateFormat);
    let flag = true;

    if (this.calendar.excludesFrequency.length > 0) {
      flag = false;
      for (let i = 0; i < this.calendar.excludesFrequency.length; i++) {
        if (this.calendar.excludesFrequency[i].tab == obj.tab) {
          flag = true;
          for (let j = 0; j < this.calendar.excludesFrequency[i].dates.length; j++) {
            for (let x = 0; x < obj.dates.length; x++) {
              if (this.calendar.excludesFrequency[i].dates[j] == obj.dates[x]) {
                obj.dates.splice(x, 1);
                break;
              }
            }
          }
          this.calendar.excludesFrequency[i].dates = this.calendar.excludesFrequency[i].dates.concat(obj.dates);
          this.calendar.excludesFrequency[i].str = this.calendarService.freqToStr(this.calendar.excludesFrequency[i], this.dateFormat);
          break;
        }
      }
    } else {
      this.calendar.excludesFrequency.push(obj);
    }
    if (!flag) {
      this.calendar.excludesFrequency.push(obj);
    }
  }

  private checkInclude(dates) {
    let obj = {
      tab: "specificDays",
      type: 'INCLUDE',
      exclude: false,
      dates: [],
      str: ''
    };

    dates.forEach(function (date) {
      obj.dates.push(date.startDate);
    });

    obj.str = this.calendarService.freqToStr(obj, this.dateFormat);

    let flag = true;
    if (this.calendar.includesFrequency.length > 0) {
      flag = false;
      for (let i = 0; i < this.calendar.includesFrequency.length; i++) {
        if (this.calendar.includesFrequency[i].tab == obj.tab) {
          flag = true;
          for (let j = 0; j < this.calendar.includesFrequency[i].dates.length; j++) {
            for (let x = 0; x < obj.dates.length; x++) {
              if (this.calendar.includesFrequency[i].dates[j] == obj.dates[x]) {
                obj.dates.splice(x, 1);
                break;
              }
            }
          }
          this.calendar.includesFrequency[i].dates = this.calendar.includesFrequency[i].dates.concat(obj.dates);
          this.calendar.includesFrequency[i].str = this.calendarService.freqToStr(this.calendar.includesFrequency[i], this.dateFormat);
          break;
        }
      }
    } else {
      this.calendar.includesFrequency.push(obj);
    }
    if (!flag) {
      this.calendar.includesFrequency.push(obj);
    }
  }

  private checkDate(date) {
    let planData = {
      startDate: date,
      endDate: date,
      color: '#007da6'
    };

    let flag = false, isFound = false, flg = false;
    if (this.calObj.frequency == 'all' || this.calObj.frequency.type == 'INCLUDE') {
      if (this.planItems.length == 0) {
        this.includedDates = [];
        this.includedDates.push(planData);
        this.planItems.push(planData);
      } else {
        for (let i = 0; i < this.planItems.length; i++) {
          if ((new Date(this.planItems[i].startDate).setHours(0, 0, 0, 0) == new Date(planData.startDate).setHours(0, 0, 0, 0))) {
            isFound = true;
            if (this.planItems[i].color != '#eb8814') {
              this.planItems[i].color = '#eb8814';
              flag = true;
            } else {
              this.planItems[i].color = '#007da6';
            }
            break;
          }
        }
        if (!isFound) {
          planData.color = '#007da6';
          this.includedDates.push(planData);
          this.planItems.push(planData);
        } else {
          if (this.includedDates.length > 0) {
            for (let i = 0; i < this.includedDates.length; i++) {
              if ((new Date(this.includedDates[i].startDate).setHours(0, 0, 0, 0) == new Date(planData.startDate).setHours(0, 0, 0, 0))) {
                this.includedDates.splice(i, 1);
                break;
              }
            }
          }
        }
        if (isFound && !flag) {
          this.includedDates.push(planData);
        }
      }

      if (!flag) {
        if (this.excludedDates.length > 0) {
          for (let i = 0; i < this.excludedDates.length; i++) {
            if ((new Date(this.excludedDates[i].startDate).setHours(0, 0, 0, 0) == new Date(planData.startDate).setHours(0, 0, 0, 0))) {
              this.excludedDates.splice(i, 1);
              break;
            }
          }
        }
      } else {
        for (let i = 0; i < this.excludedDates.length; i++) {
          if ((new Date(this.excludedDates[i].startDate).setHours(0, 0, 0, 0) == new Date(planData.startDate).setHours(0, 0, 0, 0))) {
            flg = true;
            break;
          }
        }
        if (!flg) {
          this.excludedDates.push(planData);
        }
      }

    } else if (this.calObj.frequency.type == 'EXCLUDE') {
      if (this.planItems.length == 0) {
        this.excludedDates = [];
        this.excludedDates.push(planData);
        this.planItems.push(planData);
      } else {
        for (let i = 0; i < this.planItems.length; i++) {
          if ((new Date(this.planItems[i].startDate).setHours(0, 0, 0, 0) == new Date(planData.startDate).setHours(0, 0, 0, 0))) {
            isFound = true;
            if (this.planItems[i].color != '#eb8814') {
              this.planItems[i].color = '#eb8814';
            } else {
              this.planItems[i].color = '#007da6';
              flag = true;
            }
            break;
          }
        }
        if (!isFound) {
          planData.color = '#eb8814';
          this.excludedDates.push(planData);
          this.planItems.push(planData);
        } else {
          if (this.excludedDates.length > 0) {
            for (let i = 0; i < this.excludedDates.length; i++) {
              if ((new Date(this.excludedDates[i].startDate).setHours(0, 0, 0, 0) == new Date(planData.startDate).setHours(0, 0, 0, 0))) {
                this.excludedDates.splice(i, 1);
                break;
              }
            }
          }
        }
      }
      if (!flag) {
        if (this.includedDates.length > 0) {
          for (let i = 0; i < this.includedDates.length; i++) {
            if ((new Date(this.includedDates[i].startDate).setHours(0, 0, 0, 0) == new Date(planData.startDate).setHours(0, 0, 0, 0))) {
              this.includedDates.splice(i, 1);
              break;
            }
          }
        }
      } else {
        for (let i = 0; i < this.includedDates.length; i++) {
          if ((new Date(this.includedDates[i].startDate).setHours(0, 0, 0, 0) == new Date(planData.startDate).setHours(0, 0, 0, 0))) {
            flg = true;
            break;
          }
        }
        if (!flg) {
          this.includedDates.push(planData);
        }
      }
    }

    $('#full-calendar').data('calendar').setDataSource(this.planItems);
  }

  addCalendarDates() {
    if (this.excludedDates.length > 0) {
      this.checkExclude(this.excludedDates);
    }
    if (this.includedDates.length > 0) {
      this.checkInclude(this.includedDates);
    }
    if (this.flag) {
      this.save();
    } else {
      this.editor.showYearView = false;
    }
  }

  selectAllHolidays() {
    let self = this;

    if (this.holidayDays.checked && this.holidayList.length > 0) {
      let temp =[];
      this.holidayList.forEach(function (holiday) {
        if (self.frequency.nationalHoliday.indexOf(holiday.date) == -1)
          temp.push(holiday.date);
      });

      this.frequency.nationalHoliday = this.frequency.nationalHoliday.concat(temp);
    } else {
      if (this.frequency.nationalHoliday && this.frequency.nationalHoliday.length > 0) {
        let temp= _.clone(this.frequency.nationalHoliday);
        this.holidayList.forEach(function (holiday) {
          for (let x = 0; x < temp.length; x++) {
            if (temp[x] == holiday.date) {
              temp.splice(x, 1);
              break;
            }
          }
        });
        this.frequency.nationalHoliday= _.clone(temp)
      }
    }
    this.editor.isEnable = !!(this.frequency.nationalHoliday && this.frequency.nationalHoliday.length > 0);
  }

  changeFrequencyObj(data) {
    if (!data) {
      data = 'all';
    }
    let obj = {};
    this.freqObj(data, obj);
  }

  changeFrequency(str) {
    let self = this;
    this.frequency.tab = str;
    this.onFrequencyChange();

    if (this.frequency.tab === 'specificDays') {
      $('#calendar').calendar({
        clickDay: function (e) {
          self.selectDate(e)
        }
      }).setDataSource(this.tempItems);
    }
  }

  private selectDate(e) {
    let obj = {
      startDate: e.date,
      endDate: e.date,
      color: '#007da6'
    };
    let flag = false;
    let index = 0;
    for (let i = 0; i < this.tempItems.length; i++) {
      if ((new Date(this.tempItems[i].startDate).setHours(0, 0, 0, 0) == new Date(obj.startDate).setHours(0, 0, 0, 0))) {
        flag = true;
        index = i;
        break;
      }
    }
    if (!flag) {
      this.tempItems.push(obj);
    } else {
      this.tempItems.splice(index, 1);
    }
    if (this.tempItems.length > 0) {
      this.editor.isEnable = true;
    } else {
      this.editor.isEnable = false;
    }
    $('#calendar').data('calendar').setDataSource(this.tempItems);
  }

  selectMonthDaysFunc(value) {
    if (this.selectedMonths.indexOf(value) == -1) {
      this.selectedMonths.push(value);
    } else {
      this.selectedMonths.splice(this.selectedMonths.indexOf(value), 1);
    }
    this.frequency.selectedMonths = _.clone(this.selectedMonths);
    this.frequency.selectedMonths.sort();
    this.editor.isEnable = this.selectedMonths.length > 0;
  }

  selectMonthDaysUFunc(value) {
    if (this.selectedMonthsU.indexOf(value) == -1) {
      this.selectedMonthsU.push(value);
    } else {
      this.selectedMonthsU.splice(this.selectedMonthsU.indexOf(value), 1);
    }
    this.frequency.selectedMonthsU = _.clone(this.selectedMonthsU);
    this.frequency.selectedMonthsU.sort();
    this.editor.isEnable = this.selectedMonthsU.length > 0;
  }

  getSelectedMonthDays(value) {
    if (this.selectedMonths.indexOf(value) != -1)
      return true;
  }

  getSelectedMonthDaysU(value) {
    if (this.selectedMonthsU.indexOf(value) != -1)
      return true;
  }

  selectAllWeek() {
    if (this.frequency.all) {
      this.frequency.days = ["0", "1", "2", "3", "4", "5", "6"];
      this.editor.isEnable = true;
    } else {
      this.frequency.days = [];
      this.editor.isEnable = false;
    }
  }

  selectAllMonth() {
    if (this.frequency.allMonth) {
      this.frequency.months = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"]
    } else {
      this.frequency.months = []
    }
  }

  getDateFormat(date) {
    return this.datePipe.transform(date, this.dateFormat);
  }

  private freqObj(data, obj) {
    this.isCalendarLoading = true;
    let self = this;

    this.planItems = [];

    obj.jobschedulerId = self.schedulerId;
    obj.calendar = {};

    if (data && !_.isEmpty(data) && data != 'all') {
      if (data.tab == 'weekDays') {
        if (data.startingWithW) {
          obj.dateFrom = moment(data.startingWithW).format('YYYY-MM-DD');
        }
        if (data.endOnW) {
          obj.dateTo = moment(data.endOnW).format('YYYY-MM-DD');
        }
      } else if (data.tab == 'specificWeekDays') {
        if (data.startingWithS) {
          obj.dateFrom = moment(data.startingWithS).format('YYYY-MM-DD');
        }
        if (data.endOnS) {
          obj.dateTo = moment(data.endOnS).format('YYYY-MM-DD');
        }
      } else if (data.tab == 'monthDays') {
        if (data.startingWithM) {
          obj.dateFrom = moment(data.startingWithM).format('YYYY-MM-DD');
        }
        if (data.endOnM) {
          obj.dateTo = moment(data.endOnM).format('YYYY-MM-DD');
        }
      } else if (data.tab == 'every') {
        if (data.startingWith) {
          obj.dateFrom = moment(data.startingWith).format('YYYY-MM-DD');
        }
        if (data.endOn) {
          obj.dateTo = moment(data.endOn).format('YYYY-MM-DD');
        }
      }
    }

    if (!obj.dateFrom) {
      obj.dateFrom = moment(self.calendar.from, this.dateFormatM).format('YYYY-MM-DD') || moment().format('YYYY-MM-DD');
    }
    if (!obj.dateTo) {
      obj.dateTo = moment(self.calendar.to, this.dateFormatM).format('YYYY-MM-DD');
      self.toDate = _.clone(obj.dateTo);
      if (new Date(obj.dateTo).getTime() > new Date(self.calendarTitle + '-12-31').getTime()) {
        obj.dateTo = self.calendarTitle + '-12-31';
      }
    }

    if (data && !_.isEmpty(data) && data != 'all') {
      self.editor.showYearView = true;
      self.calObj.frequency = JSON.stringify(data);
      let obj1 = {
        includes: {}
      };

      let data1 = _.clone(data);
      data1.type = 'INCLUDE';

      self.frequencyObj = this.calendarService.generateCalendarObj(data1, obj1);
    } else {
      self.calObj.frequency = 'all';
      self.frequencyObj = this.generateCalendarAllObj();
    }

    obj.calendar = self.frequencyObj;

    let result: any;
    this.coreService.post('calendar/dates', obj).subscribe((res) => {

      result = res;
      let color = '#007da6';
      if (data && data.type == 'EXCLUDE') {
        color = '#eb8814';
      }
      result.dates.forEach(function (date) {
        let x = date.split('-');
        self.planItems.push({
          startDate: new Date(x[0], x[1] - 1, x[2] - 1),
          endDate: new Date(x[0], x[1] - 1, x[2] - 1),
          color: color
        });
      });
      result.withExcludes.forEach(function (date) {
        let x = date.split('-');
        self.planItems.push({
          startDate: new Date(x[0], x[1] - 1, x[2] - 1),
          endDate: new Date(x[0], x[1] - 1, x[2] - 1),
          color: '#eb8814'
        });
      });
      if($('#full-calendar') && $('#full-calendar').data('calendar')) {

      }else {
        $('#full-calendar').calendar({
          clickDay: function (e) {
            self.checkDate(e.date);
          },
          renderEnd: function (e) {
            self.calendarTitle = e.currentYear;
            if (self.isCalendarDisplay) {
              self.changeDate();
            }
          }
        });
      }
      this.tempList = _.clone(this.planItems);
      $('#full-calendar').data('calendar').setDataSource(this.planItems);

      this.isCalendarLoading = false;
      setTimeout(() => {
        self.isCalendarDisplay = true;
      }, 100);

    }, () => {
      this.isCalendarLoading = false;

    });
  }

  loadHolidayList() {
    this.holidayDays.checked = false;
    this.holidayList = [];
    let holidays = [];
    if (this.frequency.country && this.frequency.year) {
      this.hd.init(this.frequency.country);
      holidays = this.hd.getHolidays(this.frequency.year);
      let self = this;
      holidays.forEach(function (holiday) {
        if (holiday.type == 'public' && holiday.date && holiday.name && holiday.date != 'null') {
          if (holiday.date.length > 19) {
            holiday.date = holiday.date.substring(0, 19);
          }
          holiday.date = moment(holiday.date).format('YYYY-MM-DD');
          self.holidayList.push(holiday);
        }
      });
    }
    if (this.frequencyList.length > 0) {
      for (let i = 0; i < this.frequencyList.length; i++) {
        if (this.frequencyList[i].tab == 'nationalHoliday' && this.frequencyList[i].nationalHoliday.length > 0 && new Date(this.frequencyList[i].nationalHoliday[0]).getFullYear() == this.frequency.year) {
          this.frequency.nationalHoliday = _.clone(this.frequencyList[i].nationalHoliday);
          break;
        }
      }
    }

  }

  addFrequency() {
    let self = this;
    this.countryField = false;
    this.frequency.str = this.calendarService.freqToStr(this.frequency, this.dateFormat);

    this.setEditorEnable();
    if(this.frequency.startingWith){
      this.frequency.startingWith = this.coreService.toMomentDateFormat(this.frequency.startingWith);
    }
    if(this.frequency.startingWithW){
      this.frequency.startingWithW = this.coreService.toMomentDateFormat(this.frequency.startingWithW);
    }
    if(this.frequency.startingWithM){
      this.frequency.startingWithM = this.coreService.toMomentDateFormat(this.frequency.startingWithM);
    }
    if(this.frequency.startingWithS){
      this.frequency.startingWithS = this.coreService.toMomentDateFormat(this.frequency.startingWithS);
    }
    if(this.frequency.endOn){
      this.frequency.endOn = this.coreService.toMomentDateFormat(this.frequency.endOn);
    }
    if(this.frequency.endOnW){
      this.frequency.endOnW = this.coreService.toMomentDateFormat(this.frequency.endOnW);
    }
    if(this.frequency.endOnM){
      this.frequency.endOnM = this.coreService.toMomentDateFormat(this.frequency.endOnM);
    }
    if(this.frequency.endOnS){
      this.frequency.endOnS = this.coreService.toMomentDateFormat(this.frequency.endOnS);
    }

    let flag = false;
    if (this.isRuntimeEdit) {
      this.isRuntimeEdit = false;
      if (this.frequencyList.length > 0) {
        for (let i = 0; i < this.frequencyList.length; i++) {
          if (this.frequencyList[i].tab == this._temp.tab && this.frequencyList[i].str == this._temp.str && this.frequencyList[i].type == this._temp.type) {

            if (this.frequency.tab == 'specificDays') {
              this.frequency.dates = [];
              this.tempItems.forEach(function (date) {

                self.frequency.dates.push(moment(date.startDate).format('YYYY-MM-DD'));
              });
              this.frequency.str = this.calendarService.freqToStr(this.frequency, this.dateFormat);
            }

            this.frequencyList[i] = _.clone(this.frequency);
            this.saveFrequency();
            break;
          }
        }
      }
      this._temp = {};
      this.holidayList = [];
      if (this.frequencyList && this.frequencyList.length > 0) {
        this.generateFrequencyObj();
      }

      this.editor.isEnable = false;
      return;
    }
    if (this.frequency.tab == 'specificDays') {
      this.frequency.dates = [];
      this.tempItems.forEach(function (date) {
        self.frequency.dates.push(moment(date.startDate).format('YYYY-MM-DD'));
      });
      this.frequency.str = this.calendarService.freqToStr(this.frequency, this.dateFormat);
    }
    for (let i = 0; i < this.frequencyList.length; i++) {
      if (_.isEqual(this.frequencyList[i], this.frequency)) {
        flag = true;
        break;
      }
    }

    if (flag) {
      return;
    }
    let _dates = [];
    if (this.frequency.tab == 'nationalHoliday') {
      var datesArr = this.calendarService.groupByDates(this.frequency.nationalHoliday);
      _dates = _.clone(datesArr);
    }

    if (this.frequencyList.length > 0) {

      let flag1 = false;
      for (let i = 0; i < this.frequencyList.length; i++) {

        if (this.frequency.tab == this.frequencyList[i].tab) {

          if (this.frequency.tab == 'weekDays') {
            if (this.frequency.months && this.frequency.months.length > 0) {
              if (this.frequency.months == this.frequencyList[i].months || _.isEqual(this.frequencyList[i].months, this.frequency.months)) {
                if (_.isEqual(this.frequencyList[i].days, this.frequency.days)) {
                  flag1 = true;
                  break;
                }
                this.frequencyList[i].days = _.clone(this.frequency.days);
                this.frequencyList[i].startingWithW = _.clone(this.frequency.startingWithW);
                this.frequencyList[i].endOnW = _.clone(this.frequency.endOnW);
                this.frequencyList[i].str = _.clone(this.frequency.str);
                flag1 = true;
                break;
              } else {
                if (this.frequencyList[i].months)
                  if (_.isEqual(this.frequencyList[i].days, this.frequency.days)) {
                    this.frequency.months.forEach(function (month) {
                      if (self.frequencyList[i].months.indexOf(month) == -1)
                        self.frequencyList[i].months.push(month)
                    });
                    this.frequencyList[i].str = _.clone(this.frequency.str);
                    flag1 = true;
                    break;
                  }
              }
            } else {
              if (!this.frequencyList[i].months) {
                this.frequencyList[i].days = _.clone(this.frequency.days);
                this.frequencyList[i].startingWithM = _.clone(this.frequency.startingWithW);
                this.frequencyList[i].endOnW = _.clone(this.frequency.endOnW);
                this.frequencyList[i].str = _.clone(this.frequency.str);
                flag1 = true;
                break;
              }
            }
          }
          else if (this.frequency.tab == 'monthDays' && this.frequency.isUltimos == 'months' && this.frequencyList[i].isUltimos == 'months') {
            if (this.frequency.months && this.frequency.months.length > 0) {
              if (this.frequency.months == this.frequencyList[i].months || _.isEqual(this.frequencyList[i].months, this.frequency.months)) {
                this.frequencyList[i].selectedMonths = _.clone(this.frequency.selectedMonths);
                this.frequencyList[i].startingWithM = _.clone(this.frequency.startingWithM);
                this.frequencyList[i].endOnM = _.clone(this.frequency.endOnM);
                this.frequencyList[i].str = _.clone(this.frequency.str);
                flag1 = true;
                break;
              } else {
                if (this.frequencyList[i].months)
                  if (_.isEqual(this.frequencyList[i].selectedMonths, this.frequency.selectedMonths)) {
                    this.frequency.months.forEach(function (month) {
                      if (self.frequencyList[i].months.indexOf(month) == -1)
                        self.frequencyList[i].months.push(month)
                    });
                    this.frequencyList[i].str = _.clone(this.frequency.str);
                    flag1 = true;
                    break;
                  }
              }
            } else {
              if (!this.frequencyList[i].months) {
                this.frequencyList[i].selectedMonths = _.clone(this.frequency.selectedMonths);
                this.frequencyList[i].startingWithM = _.clone(this.frequency.startingWithM);
                this.frequencyList[i].endOnM = _.clone(this.frequency.endOnM);
                this.frequencyList[i].str = _.clone(this.frequency.str);
                flag1 = true;
                break;
              }
            }
          }
          else if (this.frequency.tab == 'monthDays' && this.frequency.isUltimos != 'months' && this.frequencyList[i].isUltimos !== 'months') {
            if (this.frequency.months && this.frequency.months.length > 0) {
              if (this.frequency.months == this.frequencyList[i].months || _.isEqual(this.frequencyList[i].months, this.frequency.months)) {
                this.frequencyList[i].selectedMonthsU = _.clone(this.frequency.selectedMonthsU);
                this.frequencyList[i].startingWithM = _.clone(this.frequency.startingWithM);
                this.frequencyList[i].endOnM = _.clone(this.frequency.endOnM);
                this.frequencyList[i].str = _.clone(this.frequency.str);
                flag1 = true;
                break;
              } else {
                if (this.frequencyList[i].months)
                  if (_.isEqual(this.frequencyList[i].selectedMonthsU, this.frequency.selectedMonthsU)) {
                    this.frequency.months.forEach(function (month) {
                      if (self.frequencyList[i].months.indexOf(month) == -1)
                        self.frequencyList[i].months.push(month)
                    });
                    this.frequencyList[i].str = _.clone(this.frequency.str);
                    flag1 = true;
                    break;
                  }
              }
            } else {
              if (!this.frequencyList[i].months) {
                this.frequencyList[i].selectedMonthsU = _.clone(this.frequency.selectedMonthsU);
                this.frequencyList[i].startingWithM = _.clone(this.frequency.startingWithM);
                this.frequencyList[i].endOnM = _.clone(this.frequency.endOnM);
                this.frequencyList[i].str = _.clone(this.frequency.str);

                flag1 = true;
                break;
              }
            }
          }
          else if (this.frequency.tab == 'specificWeekDays') {
            if (this.frequency.months && this.frequencyList[i].months) {
              if (!_.isEqual(this.frequencyList[i].months, this.frequency.months)) {
                if (_.isEqual(this.frequencyList[i].specificWeekDay, this.frequency.specificWeekDay) && _.isEqual(this.frequencyList[i].which, this.frequency.which)) {
                  this.frequency.months.forEach(function (month) {
                    if (self.frequencyList[i].months.indexOf(month) == -1)
                      self.frequencyList[i].months.push(month);
                  });
                  this.frequencyList[i].str = this.calendarService.freqToStr(this.frequencyList[i], this.dateFormat);
                  flag1 = true;
                  break;
                }
              }
            }
          }
          else if (this.frequency.tab == 'nationalHoliday') {
            flag1 = true;
            datesArr.forEach(function (dates) {
              if (self.frequencyList[i].nationalHoliday && self.frequencyList[i].nationalHoliday.length > 0) {
                if (new Date(self.frequencyList[i].nationalHoliday[0]).getFullYear() == new Date(dates[0].toString()).getFullYear()) {
                  dates.forEach(function (date) {
                    if (self.frequencyList[i].nationalHoliday.indexOf(date) == -1) {
                      self.frequencyList[i].nationalHoliday.push(date);
                    }
                  });
                  self.frequencyList[i].str = self.calendarService.freqToStr(self.frequencyList[i], self.dateFormat);
                  for (let x = 0; x < _dates.length; x++) {
                    if (_.isEqual(_dates[x], dates)) {
                      _dates.splice(x, 1);
                      break;
                    }
                  }
                }
              }
            });

          } else if (this.frequency.tab == 'specificDays') {
            this.frequency.dates = [];
            this.tempItems.forEach(function (date) {
              self.frequency.dates.push(moment(date.startDate).format('YYYY-MM-DD'));
            });
            this.frequency.str = this.calendarService.freqToStr(this.frequency, this.dateFormat);
            this.frequencyList[i].dates = _.clone(this.frequency.dates);
            this.frequencyList[i].str = _.clone(this.frequency.str);
            flag1 = true;
            break;
          } else if (this.frequency.tab == 'every') {
            if (this.frequency.dateEntity && this.frequencyList[i].dateEntity) {
              this.frequency.months.forEach(function (month) {
                if (self.frequencyList[i].months.indexOf(month) == -1)
                  self.frequencyList[i].months.push(month);
              });
              this.frequencyList[i].str = this.calendarService.freqToStr(this.frequencyList[i], this.dateFormat);
              flag1 = true;
              break;
            }
          }
        }
      }
      if (_dates && _dates.length > 0) {
        _dates.forEach(function (dates) {
          let obj = _.clone(self.frequency);
          obj.type = self.editor.frequencyType;
          obj.nationalHoliday = dates;
          obj.str = self.calendarService.freqToStr(obj, self.dateFormat);
          self.frequencyList.push(obj);
        })
      }
      if (!flag1) {
        if (this.frequency.tab == 'specificDays') {
          this.frequency.dates = [];
          this.tempItems.forEach(function (date) {
            self.frequency.dates.push(moment(date.startDate).format('YYYY-MM-DD'));
          });
          this.frequency.str = this.calendarService.freqToStr(this.frequency, this.dateFormat);
        }
        if (this.frequency.tab != 'nationalHoliday') {
          this.frequency.type = this.editor.frequencyType;
          this.frequencyList.push(_.clone(this.frequency));
        }
      }else{
        this.frequency.nationHoliday =[];
      }

    } else {

      if (this.frequency.tab == 'nationalHoliday') {
        datesArr.forEach(function (dates) {
          let obj = _.clone(self.frequency);
          obj.type = self.editor.frequencyType;
          obj.nationalHoliday = dates;
          obj.str = self.calendarService.freqToStr(obj, self.dateFormat);
          self.frequencyList.push(obj);
        })
      } else {
        if (this.frequency.tab == 'specificDays') {
          this.frequency.dates = [];
          this.tempItems.forEach(function (date) {
            self.frequency.dates.push(moment(date.startDate).format('YYYY-MM-DD'));
          });
          this.frequency.str = this.calendarService.freqToStr(this.frequency, this.dateFormat);
        }
        this.frequency.type = this.editor.frequencyType;
        this.frequencyList.push(_.clone(this.frequency));
      }
    }
    this.frequency.months = [];
    this.frequency.nationalHoliday = [];
    this.frequency.allMonth = false;
    this.holidayDays.checked = false;
    this.editor.isEnable = false;
  }

  saveFrequency() {
    if (this.editor.frequencyType == 'INCLUDE') {
      this.calendar.includesFrequency = _.clone(this.frequencyList);
    } else {
      this.calendar.excludesFrequency = _.clone(this.frequencyList);
    }
  }

  editFrequency(data) {
    let self = this;
    this._temp = _.clone(data);
    this.frequency = _.clone(data);

    if (data.tab == "weekDays") {
      this.frequency = _.clone(data);
      let StartDate = moment(data.startingWithW).format('YYYY-MM-DD');
      let endDate = moment(data.endOnW).format('YYYY-MM-DD');
      let startingWithW = _.clone(StartDate.split("-").reverse().join("."));
      let endOnW = _.clone(endDate.split("-").reverse().join("."));
      this.frequency.startingWithW = startingWithW;
      this.frequency.endOnW = endOnW;
    } else if (data.tab == "every") {
      this.frequency = _.clone(data);
      let StartDate = moment(data.startingWith).format('YYYY-MM-DD');
      let endDate = moment(data.endOn).format('YYYY-MM-DD');
      let startingWith = _.clone(StartDate.split("-").reverse().join("."));
      let endOn = _.clone(endDate.split("-").reverse().join("."));
      this.frequency.startingWith = startingWith;
      this.frequency.endOn = endOn;
    }else if (data.tab == "specificWeekDays") {
      this.frequency = _.clone(data);
      let StartDate = moment(data.startingWithS).format('YYYY-MM-DD');
      let endDate = moment(data.endOnS).format('YYYY-MM-DD');
      let startingWithS = _.clone(StartDate.split("-").reverse().join("."));
      let endOnS = _.clone(endDate.split("-").reverse().join("."));
      this.frequency.startingWithS = startingWithS;
      this.frequency.endOnS = endOnS;
    }else if (data.tab == "monthDays") {
      this.frequency = _.clone(data);
      let StartDate = moment(data.startingWithM).format('YYYY-MM-DD');
      let endDate = moment(data.endOnM).format('YYYY-MM-DD');
      let startingWithM = _.clone(StartDate.split("-").reverse().join("."));
      let endOnM = _.clone(endDate.split("-").reverse().join("."));
      this.frequency.startingWithM = startingWithM;
      this.frequency.endOnM = endOnM;
    }

    if (this.frequency.tab == 'nationalHoliday') {
      this.frequency.year = new Date(data.nationalHoliday[0]).getFullYear();
      this.holidayList = [];
      this.countryField = true;
      this.holidayDays.checked = true;
      data.nationalHoliday.forEach(function (date) {
        self.holidayList.push({date: date})
      });
    } else {
      this.holidayDays.checked = false;
    }
    this.isRuntimeEdit = true;
    if (this.frequency.tab == 'monthDays') {
      if (this.frequency.isUltimos == 'months') {
        this.selectedMonths = [];
        data.selectedMonths.forEach(function (val) {
          self.selectMonthDaysFunc(val);
        });
      } else {
        this.selectedMonthsU = [];
        data.selectedMonthsU.forEach(function (val) {
          self.selectMonthDaysUFunc(val);
        });
      }
    }
    this.onFrequencyChange();
  }

  deleteFrequency(data) {
    for (let i = 0; i < this.frequencyList.length; i++) {
      if (this.frequencyList[i] == data || _.isEqual(this.frequencyList[i], data)) {
        this.frequencyList.splice(i, 1);
        if (data.tab == 'specificDays') {
          this.tempItems = [];
        } else if (data.tab == 'nationalHoliday') {
          this.frequency.nationalHoliday = [];
          this.holidayDays.checked = false;
          this.holidayList = [];
          this.frequency.year = new Date().getFullYear();
          this.countryField = false;
        } else if (data.tab == 'monthDays') {
          if (data.isUltimos == 'months') {
            this.selectedMonths = [];
          } else {
            this.selectedMonthsU = [];
          }
        } else if (data.tab == 'weekDays') {
          this.frequency.days = [];
        }
        break;
      }
    }
    if (this.frequencyList.length == 0) {
      let temp = _.clone(this.frequency);
      this.frequency = {};
      this.frequency.tab = temp.tab;
      this.frequency.isUltimos = temp.isUltimos;
    }
    if (this.frequencyList && this.frequencyList.length > 0) {
      this.generateFrequencyObj();
    }
  }

  changeDate() {
    let self = this;
    let newDate = new Date();
    newDate.setHours(0, 0, 0, 0);
    let toDate: any;
    if (new Date(this.toDate).getTime() > new Date(this.calendarTitle + '-12-31').getTime()) {
      toDate = this.calendarTitle + '-12-31';
    } else {
      toDate = this.toDate;
    }

    if (newDate.getFullYear() < this.calendarTitle && (new Date(this.calendarTitle + '-01-01').getTime() < new Date(toDate).getTime())) {
      this.planItems = [];
      let obj = {
        jobschedulerId: this.schedulerId,
        dateFrom: this.calendarTitle + '-01-01',
        dateTo: toDate,
        calendar: this.frequencyObj
      };
      this.isCalendarLoading = true;

      let result: any;
      this.coreService.post('calendar/dates', obj).subscribe((res) => {
        result = res;
        let color = '#007da6';
        if (this.calObj.frequency && this.calObj.frequency != 'all' && this.calObj.frequency.type == 'EXCLUDE') {
          color = '#eb8814';
        }

        result.dates.forEach(function (date) {
          let x = date.split('-');
          let obj = {
            startDate: new Date(x[0], x[1] - 1, x[2] - 1),
            endDate: new Date(x[0], x[1] - 1, x[2] - 1),
            color: color
          };
          self.planItems.push(obj);
        });
        result.withExcludes.forEach(function (date) {
          let x = date.split('-');
          self.planItems.push({
            startDate: new Date(x[0], x[1] - 1, x[2] - 1),
            endDate: new Date(x[0], x[1] - 1, x[2] - 1),
            color: '#eb8814'
          });
        });

        this.isCalendarLoading = false;
        $('#full-calendar').data('calendar').setDataSource(this.planItems);
      }, () => {
        this.isCalendarLoading = false;
      });
    } else if (newDate.getFullYear() == this.calendarTitle) {
      this.planItems = _.clone(this.tempList);
    }
  }

  showCalendar(data) {
    let self = this;
    this.calendarTitle = new Date().getFullYear();
    this.frequencyList1 = [];
    if (this.calendar.includesFrequency.length > 0) {
      this.calendar.includesFrequency.forEach(function (val) {
        self.frequencyList1.push(val)
      });
    }
    if (this.calendar.excludesFrequency.length > 0) {
      this.calendar.excludesFrequency.forEach(function (val) {
        self.frequencyList1.push(val)
      });
    }
    this.changeFrequencyObj(data);
  }

  private generateCalendarAllObj() {
    let obj = {includes: {}, excludes: {}};
    let self = this;
    if (this.calendar.includesFrequency.length > 0) {
      self.calendar.includesFrequency.forEach(function (data) {
        self.calendarService.generateCalendarObj(data, obj);
      });
    }
    if (this.calendar.excludesFrequency.length > 0) {
      self.calendar.excludesFrequency.forEach(function (data) {
        self.calendarService.generateCalendarObj(data, obj);
      });
    }
    return obj;
  }

  save() {
    this.saveFrequency();
    this.activeModal.close({
      editor: this.editor,
      frequency: this.frequency,
      calendar: this.calendar,
      frequencyList: this.frequencyList
    });
  }

  cancel() {
    this.activeModal.close('');
  }

  back() {
    if (this.flag) {
      this.activeModal.close('');
    } else {
      this.editor.showYearView = false;
    }
    this.isRuntimeEdit = false;
    this.excludedDates = [];
    this.includedDates = [];
  }
}

@Component({
  selector: 'ngbd-modal-content',
  templateUrl: './calendar-dialog.html'
})
export class CalendarModal implements OnInit {
  submitted: boolean = false;
  required: boolean = false;
  display: boolean = false;
  isUnique: boolean = true;
  logError: boolean;
  calendar: any = {};
  oldType: any;
  dateFormat: any;
  dateFormatM: any;
  comments: any = {radio: 'predefined'};
  editor: any = {isEnable: false, frequencyType: 'INCLUDE'};
  predefinedMessageList: any = [];
  config: any = {};

  @Input() new: boolean;
  @Input() preferences: any;
  @Input() categories: any;
  @Input() oldCalendar: any;
  @Input() schedulerId: any;

  constructor(public activeModal: NgbActiveModal, public coreService: CoreService, public modalService: NgbModal, private translate: TranslateService, private toasterService: ToasterService, private calendarService: CalendarService) {
  }

  ngOnInit() {
    if (sessionStorage.$SOS$FORCELOGING === 'true') {
      this.required = true;
    }
    if (this.preferences.auditLog) {
      this.display = true;
      this.predefinedMessageList = JSON.parse(sessionStorage.comments);
    }
    this.dateFormat = this.coreService.getDateFormat(this.preferences.dateFormat);

    if (this.new) {
      this.calendar = {
        path: '/',
        type: 'WORKING_DAYS',
        includesFrequency: [],
        excludesFrequency: [],
        to: moment().format(this.dateFormatM)
      };
    } else {
      this.calendar = _.clone(this.oldCalendar);
      this.calendar.newPath = _.clone(this.oldCalendar.path);
      this.calendar.includesFrequency = [];
      this.calendar.excludesFrequency = [];
      if (this.calendar.includes || this.calendar.excludes) {
        this.convertObjToArr(this.calendar);
      }
      if (this.calendar && this.calendar.type) {
        this.oldType = _.clone(this.calendar.type)
      }
    }

    this.dateFormatM = this.coreService.getDateFormatMom(this.preferences.dateFormat);
    this.config = {
      format: this.dateFormatM
    };

    if (this.calendar.from) {
      this.calendar.from = moment(this.calendar.from).format(this.dateFormatM);
    }
    if (this.calendar.to) {
      this.calendar.to = moment(this.calendar.to).format(this.dateFormatM);
    }
  }

  private convertObjToArr(data) {
    let self = this;
    let obj = {};
    if (data.includes && !_.isEmpty(data.includes)) {
      if (data.includes.months && data.includes.months.length > 0) {
        data.includes.months.forEach(function (month) {
          if (month.weekdays && month.weekdays.length > 0) {
            month.weekdays.forEach(function (weekday) {
              obj = {};
              self.iterateData(obj, weekday, month, "weekDays", "INCLUDE", null, null);
            });
          }
          if (month.monthdays && month.monthdays.length > 0) {

            month.monthdays.forEach(function (monthday) {

              if (monthday.weeklyDays && monthday.weeklyDays.length > 0) {
                monthday.weeklyDays.forEach(function (day) {
                  obj = {};
                  self.iterateData(obj, day, month, "specificWeekDays", "INCLUDE", monthday, 'months');
                });
              } else {
                obj = {};
                self.iterateData(obj, monthday, month, "monthDays", "INCLUDE", null, 'months');
              }
            });
          }
          if (month.ultimos && month.ultimos.length > 0) {
            month.ultimos.forEach(function (ultimos) {
              if (ultimos.weeklyDays && ultimos.weeklyDays.length > 0) {
                ultimos.weeklyDays.forEach(function (day) {
                  obj = {};
                  self.iterateData(obj, day, month, "specificWeekDays", "INCLUDE", ultimos, 'ultimos');

                });
              } else {
                obj = {};
                self.iterateData(obj, ultimos, month, "monthDays", "INCLUDE", null, 'ultimos');

              }

            });

          }
        });
      }
      if (data.includes.dates && data.includes.dates.length > 0) {
        obj = {};
        self.iterateData(obj, data.includes.dates, null, "specificDays", "INCLUDE", null, 'ultimos');

      }
      if (data.includes.weekdays && data.includes.weekdays.length > 0) {
        data.includes.weekdays.forEach(function (weekday) {
          obj = {};
          self.iterateData(obj, weekday, null, "weekDays", "INCLUDE", null, null);

        });

      }
      if (data.includes.monthdays && data.includes.monthdays.length > 0) {

        data.includes.monthdays.forEach(function (monthday) {

          if (monthday.weeklyDays && monthday.weeklyDays.length > 0) {
            monthday.weeklyDays.forEach(function (day) {
              obj = {};
              self.iterateData(obj, day, null, "specificWeekDays", "INCLUDE", monthday, 'months');
            });
          } else {
            obj = {};
            self.iterateData(obj, monthday, null, "monthDays", "INCLUDE", null, 'months');

          }
        });
      }
      if (data.includes.ultimos && data.includes.ultimos.length > 0) {
        data.includes.ultimos.forEach(function (ultimos) {

          if (ultimos.weeklyDays && ultimos.weeklyDays.length > 0) {
            ultimos.weeklyDays.forEach(function (day) {
              obj = {};
              self.iterateData(obj, day, null, "specificWeekDays", "INCLUDE", ultimos, 'ultimos');

            });
          } else {
            obj = {};
            self.iterateData(obj, ultimos, null, "monthDays", "INCLUDE", null, 'ultimos');
          }

        });
      }
      if (data.includes.holidays && data.includes.holidays.length > 0) {
        let arr = self.calendarService.groupByDates(data.includes.holidays[0].dates);

        arr.forEach(function (holidays) {
          obj = {};
          self.iterateData(obj, holidays, null, "nationalHoliday", "INCLUDE", null, null);

        });
      }
      if (data.includes.repetitions && data.includes.repetitions.length > 0) {
        data.includes.repetitions.forEach(function (value) {
          obj = {};
          self.iterateData(obj, value, null, "every", "INCLUDE", null, null);

        });
      }
    }
    if (data.excludes && !_.isEmpty(data.excludes)) {
      if (data.excludes.months && data.excludes.months.length > 0) {
        data.excludes.months.forEach(function (month) {
          if (month.weekdays && month.weekdays.length > 0) {
            month.weekdays.forEach(function (weekday) {
              obj = {};
              self.iterateData(obj, weekday, month, "weekDays", "EXCLUDE", null, null);
            });
          }
          if (month.monthdays && month.monthdays.length > 0) {

            month.monthdays.forEach(function (monthday) {

              if (monthday.weeklyDays && monthday.weeklyDays.length > 0) {
                monthday.weeklyDays.forEach(function (day) {
                  obj = {};
                  self.iterateData(obj, day, month, "specificWeekDays", "EXCLUDE", monthday, 'months');
                });
              } else {
                obj = {};
                self.iterateData(obj, monthday, month, "monthDays", "EXCLUDE", null, 'months');
              }
            });
          }
          if (month.ultimos && month.ultimos.length > 0) {
            month.ultimos.forEach(function (ultimos) {
              if (ultimos.weeklyDays && ultimos.weeklyDays.length > 0) {
                ultimos.weeklyDays.forEach(function (day) {
                  obj = {};
                  self.iterateData(obj, day, month, "specificWeekDays", "EXCLUDE", ultimos, 'ultimos');
                });
              } else {
                obj = {};
                self.iterateData(obj, ultimos, month, "monthDays", "EXCLUDE", null, 'ultimos');

              }

            });

          }
        });
      }
      if (data.excludes.dates && data.excludes.dates.length > 0) {
        obj = {};
        self.iterateData(obj, data.excludes.dates, null, "specificDays", "EXCLUDE", null, 'ultimos');

      }
      if (data.excludes.weekdays && data.excludes.weekdays.length > 0) {
        data.excludes.weekdays.forEach(function (weekday) {
          obj = {};
          self.iterateData(obj, weekday, null, "weekDays", "EXCLUDE", null, null);

        });

      }
      if (data.excludes.monthdays && data.excludes.monthdays.length > 0) {
        data.excludes.monthdays.forEach(function (monthday) {

          if (monthday.weeklyDays && monthday.weeklyDays.length > 0) {
            monthday.weeklyDays.forEach(function (day) {
              obj = {};
              self.iterateData(obj, day, null, "specificWeekDays", "EXCLUDE", null, 'months');
            });
          } else {
            obj = {};
            self.iterateData(obj, monthday, null, "monthDays", "EXCLUDE", null, 'months');
          }
        });
      }
      if (data.excludes.ultimos && data.excludes.ultimos.length > 0) {
        data.excludes.ultimos.forEach(function (ultimos) {

          if (ultimos.weeklyDays && ultimos.weeklyDays.length > 0) {
            ultimos.weeklyDays.forEach(function (day) {
              obj = {};
              self.iterateData(obj, day, null, "specificWeekDays", "EXCLUDE", ultimos, 'ultimos');
            });
          } else {
            obj = {};
            self.iterateData(obj, ultimos, null, "monthDays", "EXCLUDE", null, 'ultimos');
          }

        });
      }
      if (data.excludes.holidays && data.excludes.holidays.length > 0) {
        let arr = self.calendarService.groupByDates(data.excludes.holidays[0].dates);

        arr.forEach(function (holidays) {
          obj = {};
          self.iterateData(obj, holidays, null, "nationalHoliday", "EXCLUDE", null, null);

        });
      }
      if (data.excludes.repetitions && data.excludes.repetitions.length > 0) {
        data.excludes.repetitions.forEach(function (value) {
          obj = {};
          self.iterateData(obj, value, null, "every", "EXCLUDE", null, null);

        });
      }
    }
  }

  changeFrequencyType(type: string) {
    this.editor.frequencyType = type;
  }

  showYearView() {
    let frequency = {};
    this.editor.showYearView = true;
    const modalRef = this.modalService.open(FrequencyModal, {
      backdrop: "static",
      size: 'lg'
    });
    modalRef.componentInstance.schedulerId = this.schedulerId;
    modalRef.componentInstance.dateFormat = this.dateFormat;
    modalRef.componentInstance.dateFormatM = this.dateFormatM;
    modalRef.componentInstance.calendar = this.calendar;
    modalRef.componentInstance.editor = this.editor;
    modalRef.componentInstance.frequency = frequency;
    modalRef.componentInstance.flag = true;
    modalRef.result.then(() => {

    }, (reason) => {
      console.log('close...', reason)
    });
  }

  showCalendar(data) {
    let frequency = {
      tab: 'weekDays',
      dateEntity: 'DAILY',
      year: new Date().getFullYear(),
      isUltimos: 'months',
      days: [],
      months: []
    };
    this.editor.showYearView = true;
    const modalRef = this.modalService.open(FrequencyModal, {
      backdrop: "static",
      size: 'lg'
    });
    modalRef.componentInstance.schedulerId = this.schedulerId;
    modalRef.componentInstance.dateFormat = this.dateFormat;
    modalRef.componentInstance.dateFormatM = this.dateFormatM;
    modalRef.componentInstance.calendar = this.calendar;
    modalRef.componentInstance.editor = this.editor;
    modalRef.componentInstance.frequency = frequency;
    modalRef.componentInstance.flag = true;
    modalRef.componentInstance.data = data;
    modalRef.result.then(() => {

    }, (reason) => {
      console.log('close...', reason)
    });
  }

  createNewFrequency() {
    this.editor.create = true;
    this.editor.update = false;
    this.editor.showYearView = false;

    let frequency = {
      tab: 'weekDays',
      dateEntity: 'DAILY',
      year: new Date().getFullYear(),
      isUltimos: 'months',
      days: [],
      months: []
    };
    const modalRef = this.modalService.open(FrequencyModal, {
      backdrop: "static",
      size: 'lg'
    });
    modalRef.componentInstance.schedulerId = this.schedulerId;
    modalRef.componentInstance.dateFormat = this.dateFormat;
    modalRef.componentInstance.dateFormatM = this.dateFormatM;
    modalRef.componentInstance.calendar = this.calendar;
    modalRef.componentInstance.editor = this.editor;
    modalRef.componentInstance.frequency = frequency;
    modalRef.componentInstance.isRuntimeEdit = false;
    modalRef.result.then(() => {

    }, (reason) => {
      console.log('close...', reason)
    });
  }

  updateFrequency(data) {
    this.editor.hidePervious = true;
    this.editor.showYearView = false;
    this.editor.create = false;
    this.editor.update = true;

    const modalRef = this.modalService.open(FrequencyModal, {
      backdrop: "static",
      size: 'lg'
    });

    modalRef.componentInstance.schedulerId = this.schedulerId;
    modalRef.componentInstance.dateFormat = this.dateFormat;
    modalRef.componentInstance.dateFormatM = this.dateFormatM;
    modalRef.componentInstance.calendar = this.calendar;
    modalRef.componentInstance.editor = this.editor;
    modalRef.componentInstance.frequency = _.clone(data);
    modalRef.componentInstance.isRuntimeEdit = true;
    modalRef.componentInstance._temp = _.clone(data);
    modalRef.result.then(() => {

    }, (reason) => {
      console.log('close...', reason)
    });
  }


  removeFrequency(index) {
    if (this.editor.frequencyType === 'INCLUDE') {
      this.calendar.includesFrequency.splice(index, 1);
    } else {
      this.calendar.excludesFrequency.splice(index, 1)
    }
  }

  getFolderTree() {
    const modalRef = this.modalService.open(TreeModal, {backdrop: "static"});
    modalRef.componentInstance.schedulerId = this.schedulerId;
    modalRef.componentInstance.paths = [];
    modalRef.componentInstance.isCollapsed = true;
    modalRef.componentInstance.showCheckBox = false;
    modalRef.componentInstance.type = this.calendar.type === 'WORKING_DAYS' ? 'WORKINGDAYSCALENDAR' : 'NONWORKINGDAYSCALENDAR';
    modalRef.result.then((path) => {
          this.calendar.path = path;
    }, (reason) => {
      console.log('close...', reason)
    });
  }


  private iterateData(obj, data, month, tab, type, monthday, isUltimos) {
    obj.tab = tab;
    obj.type = type;
    if (month) {
      obj.months = [];
      month.months.forEach(function (mon) {
        obj.months.push(mon.toString())
      });
    }
    if (tab === "weekDays") {
      obj.days = [];
      data.days.forEach(function (val) {
        obj.days.push(val.toString())
      });
      if (month)
        obj.allMonth = month.months.length == 12;
      obj.startingWithW = data.from;
      obj.endOnW = data.to;
      obj.all = data.days.length == 7;
    }
    else if (tab === "specificWeekDays") {
      obj.specificWeekDay = this.calendarService.getStringDay(data.day);
      if(isUltimos === 'months'){
         obj.which = data.weekOfMonth;
      }else {
        obj.which = -data.weekOfMonth;
      }
      obj.startingWithS = monthday.from;
      obj.endOnS = monthday.to;
    } else if (tab === "specificDays") {
      obj.dates = [];
      data.forEach(function (date) {
        obj.dates.push(date);
      });
    } else if (tab === "monthDays") {
      if (isUltimos == 'months') {
        obj.selectedMonths = [];
        data.days.forEach(function (val) {
          obj.selectedMonths.push(val.toString())
        });
      } else {
        obj.selectedMonthsU = [];
        data.days.forEach(function (val) {
          obj.selectedMonthsU.push(val.toString())
        });
      }
      obj.startingWithM = data.from;
      obj.endOnM = data.to;
      obj.isUltimos = isUltimos;
    } else if (tab === 'every') {
      obj.dateEntity = data.repetition;
      obj.interval = data.step;
      obj.startingWith = data.from;
      obj.endOn = data.to;
      if (data.from)
        obj.startingWith = data.from;
    } else if (tab === 'nationalHoliday') {
      obj.nationalHoliday = data;
    }

    obj.str = this.calendarService.freqToStr(obj, this.dateFormat);
    if (type === 'INCLUDE')
      this.calendar.includesFrequency.push(obj);
    else
      this.calendar.excludesFrequency.push(obj);

  }

  private generateCalendarAllObj() {
    let obj = {includes: {}, excludes: {}};
    let self = this;
    if (this.calendar.includesFrequency.length > 0) {
      self.calendar.includesFrequency.forEach(function (data) {
        self.calendarService.generateCalendarObj(data, obj);
      });
    }
    if (this.calendar.excludesFrequency.length > 0) {
      self.calendar.excludesFrequency.forEach(function (data) {
        self.calendarService.generateCalendarObj(data, obj);
      });
    }
    return obj;
  }

  onSubmit(): void {
    this.isUnique = true;

    if (this.calendar.name && this.calendar.path && this.calendar.to) {
      this.submitted = true;
    } else {
      this.submitted = false;
      return;
    }
    this.logError = false;
    this.calendar.calendarObj = this.generateCalendarAllObj();
    if (this.required) {
      if (this.comments.comment) {
        this.submit();
      } else {
        this.logError = true;
      }
    } else {
      this.submit();
    }
  }

  private submit() {
    if (!this.new) {
      this.coreService.post('calendar/used', {
        id: this.calendar.id,
        jobschedulerId: this.schedulerId
      }).subscribe((res) => {
        this.calendar.usedIn = res;

        if (this.calendar.usedIn && (this.calendar.usedIn.orders || this.calendar.usedIn.jobs || this.calendar.usedIn.schedules)) {
          this.submitted = false;
          if (this.oldType != this.calendar.type) {

            let title = '';
            this.translate.get('message.calendarTypeCannotBeChange').subscribe(translatedValue => {
              title = translatedValue;
            });
            this.toasterService.pop('warning', title, '');
          } else {

            const modalRef = this.modalService.open(DeleteModal, {backdrop: "static"});
            modalRef.componentInstance.calendar = this.calendar;
            modalRef.result.then(() => {
              this.storeCalendar()
            }, (reason) => {
              console.log('close...', reason)
            });
          }
        } else {
          this.storeCalendar()
        }
      });
    } else {
      this.storeCalendar()
    }
  }

  saveAs() {
    if (this.calendar.path && this.calendar.to) {
      this.submitted = true;
    } else {
      return;
    }
    this.logError = false;
    this.calendar.calendarObj = this.generateCalendarAllObj();
    if (this.required) {
      if (this.comments.comment) {
        this.storeCalendar()
      } else {
        this.logError = true;
      }
    } else {
      this.storeCalendar()

    }
  }

  storeCalendar() {
    this.submitted = true;
    let obj = {
      jobschedulerId: this.schedulerId,
      calendar: this.calendar.calendarObj,
      auditLog: {
        comment: this.comments.comment,
        timeSpent: this.comments.timeSpent,
        ticketLink: this.comments.ticketLink
      }
    };
    if (this.new) {
      if (this.calendar.path == '/') {
        obj.calendar.path = '/' + this.calendar.name;
      } else {
        obj.calendar.path = this.calendar.path + '/' + this.calendar.name;
      }
    } else {
      obj.calendar.path = this.calendar.newPath;
      obj.calendar.id = this.calendar.id;
    }
    obj.calendar.title = this.calendar.title;
    obj.calendar.category = this.calendar.category;
    obj.calendar.type = this.calendar.type;
    if (this.calendar.from) {
      obj.calendar.from = moment(this.calendar.from, this.dateFormatM).format('YYYY-MM-DD');
    }
    if (this.calendar.to) {
      obj.calendar.to = moment(this.calendar.to, this.dateFormatM).format('YYYY-MM-DD');
    }
    this.coreService.post('calendar/store', obj).subscribe(() => {
      this.activeModal.close(this.calendar);
    }, () => {
      this.submitted = false;
    });
  }
}

//Main Component
@Component({
  selector: 'app-calendar',
  templateUrl: 'calendar.component.html',
  styleUrls: ['./calendar.component.css'],

})
export class CalendarComponent implements OnInit, OnDestroy {

  isLoading: boolean = false;
  loading: boolean;
  schedulerIds: any;
  tree: any = [];
  preferences: any;
  permission: any;
  pageView: any;
  calendars: any = [];
  auditLogs: any = [];
  categories: any = [];
  calendarFilters: any = {};
  calendar_expand_to: any = {};
  subscription1: Subscription;
  subscription2: Subscription;
  showPanel: any;
  object: any = {calendars: [], checkbox: false};

  @ViewChild(TreeComponent) child;

  public options = {};

  constructor(private router: Router, private authService: AuthService, public coreService: CoreService, private modalService: NgbModal, private dataService: DataService) {
    this.subscription1 = dataService.eventAnnounced$.subscribe(res => {
      this.refresh(res);
    });
    this.subscription2 = dataService.refreshAnnounced$.subscribe(() => {
      this.init();
    });
  }

  private refresh(args) {
    for (let i = 0; i < args.length; i++) {
      if (args[i].jobschedulerId == this.schedulerIds.selected) {
        if (args[i].eventSnapshots && args[i].eventSnapshots.length > 0) {
          for (let j = 0; j < args[i].eventSnapshots.length; j++) {
            if (args[i].eventSnapshots[j].eventType === "CalendarCreated") {
              let path = args[i].eventSnapshots[j].path.substring(0, args[i].eventSnapshots[j].path.lastIndexOf('/')) || '/';
              let name = '';
              if (path != '/')
                name = path.substring(path.lastIndexOf('/') + 1, path.length);
              this.calendar_expand_to = {
                name: name,
                path: path
              };
              this.initTree();
              break;
            }
            else if (args[i].eventSnapshots[j].eventType == "CalendarUpdated") {
              for (let x = 0; x < this.calendars.length; x++) {
                if (this.calendars[x].path == args[i].eventSnapshots[j].path) {
                  let obj = {
                    jobschedulerId: this.schedulerIds.selected,
                    id: this.calendars[x].id
                  };
                  let result: any;
                  this.coreService.post('calendar', obj).subscribe((res) => {
                    result = res;
                    if (result.calendar) {
                      this.calendars[x] = _.extend(this.calendars[x], result.calendar);
                    }
                  });
                  break;
                }
              }
              break;
            }
            else if (args[i].eventSnapshots[j].eventType == "CalendarDeleted") {
              for (let x = 0; x < this.calendars.length; x++) {
                if (this.calendars[x].path == args[i].eventSnapshots[j].path) {
                  this.calendars.splice(x, 1);
                  break;
                }
              }
              break;
            } else if (args[i].eventSnapshots[j].eventType.match('Calendar')) {
              this.initTree();
              break;
            }
            if (args[i].eventSnapshots[j].eventType === "AuditLogChanged" && this.showPanel && this.showPanel.path == args[i].eventSnapshots[j].path) {
              this.loadAuditLogs(this.showPanel);
            }
          }
        }
        break
      }
    }
  }

  ngOnInit() {
    this.init();
  }

  private init(){
        this.calendarFilters = this.coreService.getResourceTab().calendars;
    if (sessionStorage.preferences)
      this.preferences = JSON.parse(sessionStorage.preferences);
    if (this.authService.scheduleIds)
      this.schedulerIds = JSON.parse(this.authService.scheduleIds);

    if (this.authService.permission)
      this.permission = JSON.parse(this.authService.permission);
    if (localStorage.views)
      this.pageView = JSON.parse(localStorage.views).calendar;

    this.initTree();
    this.getCategories();
  }

  ngOnDestroy() {
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
  }

  initTree() {
    this.coreService.post('tree', {
      jobschedulerId: this.schedulerIds.selected,
      compact: true,
      types: ["WORKINGDAYSCALENDAR", "NONWORKINGDAYSCALENDAR"]
    }).subscribe(res => {
      this.filteredTreeData(this.coreService.prepareTree(res));
      this.isLoading = true;
    }, () => {
      this.isLoading = true;
    });
  }

  private filteredTreeData(output) {
      if (!_.isEmpty(this.calendar_expand_to)) {
        this.tree = output;
        this.navigateToPath();
      } else {
        if (_.isEmpty(this.calendarFilters.expand_to)) {
          this.tree = output;
          this.calendarFilters.expand_to = this.tree;
          this.checkExpand();
        } else {
          this.calendarFilters.expand_to = this.coreService.recursiveTreeUpdate(output, this.calendarFilters.expand_to);
          this.tree = this.calendarFilters.expand_to;
          this.loadCalendar(null);
          this.expandTree();
        }
      }
  }

  private navigateToPath() {
    let self = this;
    this.calendars = [];
    setTimeout(function () {
      self.tree.forEach(function (value) {
        self.navigatePath(value);
      });
    }, 10);
  }

  private navigatePath(data) {
    if (this.calendar_expand_to) {
      let self = this;
      let node = self.child.getNodeById(data.id);
      if (self.calendar_expand_to.path.indexOf(data.path) != -1) {
        node.expand();
      }
      if ((data.path === this.calendar_expand_to.path)) {
        node.setActiveAndVisible(true);
        self.calendar_expand_to = undefined;
      }

      if (data.children && data.children.length > 0)
        data.children.forEach(function (value) {
          self.navigatePath(value)
        });
    }
  }

  private expandTree() {
    let self = this;
    setTimeout(function () {
      self.tree.forEach(function (data) {
        recursive(data);
      });
    }, 10);

    function recursive(data) {
      if (data.isExpanded) {
        let node = self.child.getNodeById(data.id);
        node.expand();
        if (data.children && data.children.length > 0) {
          data.children.forEach(function (child) {
            recursive(child);
          });
        }
      }
    }
  }

  private checkExpand() {
    let self = this;
    setTimeout(function () {
      const node = self.child.getNodeById(1);
      node.expand();
      node.setActiveAndVisible(true);
    }, 10)
  }

  private getExpandTreeForUpdates(data, obj) {
    let self = this;
    if (data.isSelected) {
      obj.folders.push({folder: data.path, recursive: false});
    }
    data.children.forEach(function (value) {
      if (value.isExpanded || value.isSelected)
        self.getExpandTreeForUpdates(value, obj);
    });
  }

  loadCalendar(status) {
    if (status && status !== 'remove') {
      this.calendarFilters.filter.type = status;
    } else if (status === 'remove') {
      this.calendarFilters.filter.category = undefined;
    }
    let self = this;
    let obj = {
      folders: [],
      type: this.calendarFilters.filter.type != 'ALL' ? this.calendarFilters.filter.type : undefined,
      categories: [],
      jobschedulerId: this.schedulerIds.selected,
      compact: true
    };
    if (this.calendarFilters.filter.category) {
      obj.categories.push(this.calendarFilters.filter.category);
    }
    this.calendars = [];
    this.loading = true;
    this.tree.forEach(function (value) {
      if (value.isExpanded || value.isSelected)
        self.getExpandTreeForUpdates(value, obj);
    });
    this.getCalendarsList(obj, null);
  }

  getCategories() {
    let result: any;
    this.coreService.post('calendars/categories', {jobschedulerId: this.schedulerIds.selected}).subscribe(res => {
      result = res;
      this.categories = result.categories;
    });
  }

  private startTraverseNode(data) {
    let self = this;
    data.isSelected = true;
    data.children.forEach(function (a) {
      self.startTraverseNode(a);
    });
  }

  private getCalendarsList(obj, node) {
    let result: any;
    this.coreService.post('calendars', obj).subscribe(res => {
      this.loading = false;
      result = res;
      result.calendars.forEach(function (value) {
        value.path1 = value.path.substring(0, value.path.lastIndexOf('/')) || value.path.substring(0, value.path.lastIndexOf('/') + 1);

      });
      this.calendars = result.calendars;
      if (node) {
        this.startTraverseNode(node.data);
      }
    }, () => {
      this.loading = false;
    });
  }

  expandNode(node): void {
    this.calendars = [];
    this.loading = true;

    let obj = {
      jobschedulerId: this.schedulerIds.selected,
      folders: [{folder: node.data.path, recursive: true}],
      type: this.calendarFilters.filter.type != 'ALL' ? this.calendarFilters.filter.type : undefined,
      categories: [],
      compact: true
    };
    if (this.calendarFilters.filter.category) {
      obj.categories.push(this.calendarFilters.filter.category);
    }
    this.getCalendarsList(obj, node);
  }

  getCalendars(data) {
    data.isSelected = true;
    this.loading = true;

    let obj = {
      folders: [{folder: data.path, recursive: false}],
      type: this.calendarFilters.filter.type != 'ALL' ? this.calendarFilters.filter.type : undefined,
      categories: [],
      jobschedulerId: this.schedulerIds.selected,
      compact: true
    };

    if (this.calendarFilters.filter.category) {
      obj.categories.push(this.calendarFilters.filter.category);
    }
    this.getCalendarsList(obj, null);
  }

  receiveAction($event) {
    if($event.action === 'NODE')
     this.getCalendars($event.data);
    else
      this.expandNode($event)
  }

  changeCategory(category) {
    this.calendarFilters.filter.category = category;
    this.loadCalendar(null);
  }

  checkAll() {
    if (this.object.checkbox && this.calendars.length > 0) {
      this.object.calendars = this.calendars.slice((this.preferences.entryPerPage * (this.calendarFilters.currentPage - 1)), (this.preferences.entryPerPage * this.calendarFilters.currentPage));
    } else {
      this.object.calendars = [];
    }
  }

  checkMainCheckbox() {
    if (this.object.calendars && this.object.calendars.length > 0) {
      this.object.checkbox = this.object.calendars.length == this.calendars.slice((this.preferences.entryPerPage * (this.calendarFilters.currentPage - 1)), (this.preferences.entryPerPage * this.calendarFilters.currentPage)).length;
    } else {
      this.object.checkbox = false;
    }
  }

  /** ---------------------------- Action ----------------------------------*/
  sortBy(propertyName) {
    this.calendarFilters.reverse = !this.calendarFilters.reverse;
    this.calendarFilters.filter.sortBy = propertyName;
  }

  addCalendar() {
    const modalRef = this.modalService.open(CalendarModal, {backdrop: "static", size: 'lg'});
    modalRef.componentInstance.preferences = this.preferences;
    modalRef.componentInstance.categories = this.categories;
    modalRef.componentInstance.schedulerId = this.schedulerIds.selected;
    modalRef.componentInstance.new = true;
    modalRef.result.then(() => {

    }, (reason) => {
      console.log('close...', reason)
    });
  }

  editCalendar(calendar) {
    let result: any;
    this.coreService.post('calendar', {
      id: calendar.id,
      jobschedulerId: this.schedulerIds.selected
    }).subscribe((res) => {
      result = res;
      calendar = _.extend(calendar, result.calendar);
      const modalRef = this.modalService.open(CalendarModal, {backdrop: "static", size: 'lg'});
      modalRef.componentInstance.preferences = this.preferences;
      modalRef.componentInstance.categories = this.categories;
      modalRef.componentInstance.schedulerId = this.schedulerIds.selected;
      modalRef.componentInstance.oldCalendar = calendar;
      modalRef.result.then(() => {

      }, (reason) => {
        console.log('close...', reason)
      });
    });
  }

  showUsage(calendar) {
    let cal = _.clone(calendar);
    this.coreService.post('calendar/used', {
      id: calendar.id,
      jobschedulerId: this.schedulerIds.selected
    }).subscribe(res => {
      cal.usedIn = res;
      const modalRef = this.modalService.open(ShowModal, {backdrop: "static"});
      modalRef.componentInstance.calendar = cal;
      modalRef.result.then(() => {

      }, (reason) => {
        console.log('close...', reason)
      });
    });
  }

  exportCalendar(calendar) {
    let calendars = [];
    if (calendar) {
      calendars.push(calendar.path);
    } else {
      this.object.calendars.forEach(function (value) {
        calendars.push(value.path)
      });
    }
    this.coreService.post('calendars/export', {
      calendars: calendars,
      jobschedulerId: this.schedulerIds.selected
    }).subscribe(res => {
      this.exportFile(res)
    });
  }

  private exportFile(res) {
    let name = 'calendars' + '.json';
    let fileType = 'application/octet-stream';

    if (res.headers && res.headers('Content-Disposition') && /filename=(.+)/.test(res.headers('Content-Disposition'))) {
      name = /filename=(.+)/.exec(res.headers('Content-Disposition'))[1];
    }

    let data = res;
    if (typeof data === 'object') {
      data = JSON.stringify(data, undefined, 2);
    }
    let blob = new Blob([data], {type: fileType});
    saveAs(blob, name);
  }

  importCalendar() {
    const modalRef = this.modalService.open(ImportModal, {backdrop: "static", size: "lg"});
    modalRef.componentInstance.schedulerId = this.schedulerIds.selected;
    modalRef.componentInstance.display = this.preferences.auditLog;
    modalRef.result.then(() => {

    }, function () {

    });
  }

  deleteCal(obj) {
    this.coreService.post('calendars/delete', obj).subscribe(() => {
      this.object.calendars = [];
    });
  }

  private deleteCalendarFn(obj, calendar, arr) {
    if (this.preferences.auditLog) {
      let comments = {
        radio: 'predefined',
        type: 'Calendar',
        operation: 'Delete',
        name: calendar ? calendar.path : ''
      };
      if (!calendar) {
        this.object.calendars.forEach(function (value, index) {
          if (index == this.object.calendars.length - 1) {
            this.comments.name = this.comments.name + ' ' + value.path;
          } else {
            this.comments.name = value.path + ', ' + this.comments.name;
          }
        });
      }
      const modalRef = this.modalService.open(CommentModal, {backdrop: "static"});
      modalRef.componentInstance.calendar = calendar;
      modalRef.componentInstance.calendarArr = arr;
      modalRef.componentInstance.comments = comments;
      modalRef.componentInstance.obj = obj;
      modalRef.componentInstance.url = 'calendars/delete';
      modalRef.result.then(() => {

      }, function () {

      });

    } else {
      const modalRef = this.modalService.open(DeleteModal, {backdrop: "static"});
      modalRef.componentInstance.calendar = calendar;
      modalRef.componentInstance.calendarArr = arr;
      modalRef.result.then(() => {
        this.deleteCal(obj);
      }, function () {

      });
    }
  }

  deleteCalendar(calendar) {
    let obj = {
      jobschedulerId: this.schedulerIds.selected,
      calendarIds: []
    };
    if (calendar) {
      obj.calendarIds.push(calendar.id)
    } else {
      this.object.calendars.forEach(function (value) {
        obj.calendarIds.push(value.id)
      });
    }
    let calendarObj = _.clone(calendar);
    if (calendar) {
      calendarObj.delete = true;
      this.coreService.post('calendar/used', {
        id: calendarObj.id,
        jobschedulerId: this.schedulerIds.selected
      }).subscribe((res) => {
        calendarObj.usedIn = res;
        this.deleteCalendarFn(obj, calendarObj, null);
      });
    } else {
      let calendarArr = _.clone(this.object.calendars);
      calendarArr.forEach(function (value, index) {
        this.coreService.post('calendar/used', {
          id: value.id,
          jobschedulerId: this.schedulerIds.selected
        }).subscribe((res) => {
          value.usedIn = res;
          if (index === this.calendarArr.length - 1)
            this.deleteCalendarFn(obj, null, calendarArr);
        });
      });

    }
  }

  loadAuditLogs(value) {
    this.showPanel = value;
    let obj = {
      jobschedulerId: this.schedulerIds.selected,
      calendars: [value.path],
      limit: this.preferences.maxAuditLogPerObject
    };
    let result;
    this.coreService.post('audit_log', obj).subscribe(res => {
      result = res;
      this.auditLogs = result.auditLog;
    });
  }

  hideAuditPanel() {
    this.showPanel = '';
  }

  receiveMessage($event) {
    this.pageView = $event;
  }

}
