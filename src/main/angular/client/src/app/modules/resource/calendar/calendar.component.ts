import {Component, OnInit, Input, OnDestroy, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import {ToasterService} from 'angular2-toaster';
import {CoreService} from '../../../services/core.service';
import {AuthService} from '../../../components/guard';
import {NgbModal, NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {FileUploader} from 'ng2-file-upload';
import {DataService} from '../../../services/data.service';
import {ConfirmModalComponent} from '../../../components/comfirm-modal/confirm.component';
import {CommentModalComponent} from '../../../components/comment-modal/comment.component';
import {TreeComponent} from '../../../components/tree-navigation/tree.component';
import {saveAs} from 'file-saver';
import * as _ from 'underscore';

@Component({
  selector: 'app-ngbd-modal-content',
  templateUrl: './show-dialog.html'
})
export class ShowModalComponent {
  @Input() calendar: any;

  constructor(public activeModal: NgbActiveModal, public coreService: CoreService) {
  }
}

@Component({
  selector: 'app-ngbd-modal-content',
  templateUrl: './import-dialog.html'
})
export class ImportModalComponent implements OnInit {
  @Input() schedulerId: any;
  @Input() display: any;

  fileLoading = false;
  messageList: any;
  required = false;
  submitted = false;
  basedOnCalendars: any = [];
  fileContentCalendars: any = [];
  importCalendarObj: any = {};
  checkImportCalendar: any = {
    checkbox: false
  };
  calendars: any = [];
  comments: any = {};
  uploader: FileUploader;

  constructor(public activeModal: NgbActiveModal, private coreService: CoreService, public translate: TranslateService, public toasterService: ToasterService) {
    this.uploader = new FileUploader({url: ''});
  }

  ngOnInit() {
    this.importCalendarObj.jobschedulerId = this.schedulerId;
    this.importCalendarObj.calendars = [];
    this.comments.radio = 'predefined';
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
    let item = event['0'];

    let fileExt = item.name.slice(item.name.lastIndexOf('.') + 1).toUpperCase();
    if (fileExt != 'JSON') {
      let msg = '';
      this.translate.get('message.invalidFileExtension').subscribe(translatedValue => {
        msg = translatedValue;
      });
      this.toasterService.pop('error', '', fileExt + ' ' + msg);
      //  item.remove();
    } else {
      this.fileLoading = true;
      let reader = new FileReader();
      reader.readAsText(item, 'UTF-8');
      reader.onload = onLoadFile;
    }

    function onLoadFile(_event) {
      let data = JSON.parse(_event.target.result);
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
      self.coreService.post('calendar/used', obj).subscribe((res) => {
        result = res;
        self.calendars = result.calendars;
        for (let x = 0; x < result.calendars.length; x++) {
          for (let i = 0; i < self.fileContentCalendars.length; i++) {
            if (result.calendars[x].path == self.fileContentCalendars[i].path) {
              self.fileContentCalendars[i].isExit = true;
              break;
            }
          }
        }
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
  }

  importCalendarObjChange() {
    if (this.importCalendarObj.calendars && this.importCalendarObj.calendars.length > 0 && this.fileContentCalendars) {
      this.checkImportCalendar.checkbox = this.importCalendarObj.calendars.length == this.fileContentCalendars.length;
    } else {
      this.checkImportCalendar.checkbox = false;
    }
    for (let x = 0; x < this.calendars.length; x++) {
      for (let i = 0; i < this.importCalendarObj.calendars.length; i++) {
        if (this.calendars[x].usedBy && this.importCalendarObj.calendars[i].path == this.calendars[x].path) {
          //this.importCalendars.push(this.calendars[x]);
          break;
        }
      }
    }
  }

  cancel() {
    this.activeModal.close('');
  }

  private importCalendarCall() {
    this.submitted = true;
    for (let i = 0; i < this.importCalendarObj.calendars.length; i++) {
      if (this.importCalendarObj.calendars[i].isExit) {
        delete this.importCalendarObj.calendars[i]['isExit'];
      }
    }
    if (this.basedOnCalendars && this.basedOnCalendars.length > 0) {
      this.importCalendarObj.calendars = this.importCalendarObj.calendars.concat(this.basedOnCalendars);
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
}

// Main Component
@Component({
  selector: 'app-calendar',
  templateUrl: 'calendar.component.html'
})
export class CalendarComponent implements OnInit, OnDestroy {
  isLoading = false;
  loading: boolean;
  schedulerIds: any = {};
  tree: any = [];
  preferences: any = {};
  permission: any = {};
  pageView: any;
  calendars: any = [];
  auditLogs: any = [];
  calendarFilters: any = {};
  sideView: any = {};
  subscription1: Subscription;
  subscription2: Subscription;
  showPanel: any;
  object: any = {calendars: [], checkbox: false};

  @ViewChild(TreeComponent, {static: false}) child;

  public options = {};

  constructor(private router: Router, private authService: AuthService, public coreService: CoreService,
              private modalService: NgbModal, private dataService: DataService) {
    this.subscription1 = dataService.eventAnnounced$.subscribe(res => {
      this.refresh(res);
    });
    this.subscription2 = dataService.refreshAnnounced$.subscribe(() => {
      this.init();
    });
  }

  ngOnInit() {
    this.sideView = this.coreService.getSideView();
    this.init();
  }

  ngOnDestroy() {
    this.coreService.setSideView(this.sideView);
    if (this.child) {
      this.calendarFilters.expandedKeys = this.child.defaultExpandedKeys;
      this.calendarFilters.selectedkeys = this.child.defaultSelectedKeys;
    }
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
  }

  initTree() {
    this.coreService.post('tree', {
      jobschedulerId: this.schedulerIds.selected,
      types: ['WORKINGDAYSCALENDAR', 'NONWORKINGDAYSCALENDAR']
    }).subscribe(res => {
      this.tree = this.coreService.prepareTree(res, true);
      if(this.tree.length > 0) {
        this.loadCalendar(null);
      }
      this.isLoading = true;
    }, () => {
      this.isLoading = true;
    });
  }

  receiveMessage($event) {
    this.pageView = $event;
  }

  private refresh(args) {
    for (let i = 0; i < args.length; i++) {
      if (args[i].jobschedulerId == this.schedulerIds.selected) {
        if (args[i].eventSnapshots && args[i].eventSnapshots.length > 0) {
          for (let j = 0; j < args[i].eventSnapshots.length; j++) {
            if (args[i].eventSnapshots[j].eventType === 'CalendarCreated') {
              const path = args[i].eventSnapshots[j].path.substring(0, args[i].eventSnapshots[j].path.lastIndexOf('/')) || '/';
              this.calendarFilters.selectedkeys = [path];
              this.addPathToExpand(path);
              this.initTree();
              break;
            } else if (args[i].eventSnapshots[j].eventType == 'CalendarUpdated') {
              for (let x = 0; x < this.calendars.length; x++) {
                if (this.calendars[x].path == args[i].eventSnapshots[j].path) {
                  let obj = {
                    jobschedulerId: this.schedulerIds.selected,
                    id: this.calendars[x].id
                  };
                  this.coreService.post('calendar', obj).subscribe((res: any) => {
                    if (res.calendar) {
                      this.calendars[x] = _.extend(this.calendars[x], res.calendar);
                    }
                  });
                  break;
                }
              }
              this.calendars = [...this.calendars];
              break;
            } else if (args[i].eventSnapshots[j].eventType == 'CalendarDeleted') {
              for (let x = 0; x < this.calendars.length; x++) {
                if (this.calendars[x].path == args[i].eventSnapshots[j].path) {
                  this.calendars.splice(x, 1);
                  break;
                }
              }
              this.calendars = [...this.calendars];
              break;
            } else if (args[i].eventSnapshots[j].eventType.match('Calendar')) {
              this.initTree();
              break;
            }
            if (args[i].eventSnapshots[j].eventType === 'AuditLogChanged' && this.showPanel && this.showPanel.path == args[i].eventSnapshots[j].path) {
              this.loadAuditLogs(this.showPanel);
            }
          }
        }
        break;
      }
    }
  }

  private init() {
    this.calendarFilters = this.coreService.getResourceTab().calendars;
    this.coreService.getResourceTab().state = 'calendars';
    if (sessionStorage.preferences) {
      this.preferences = JSON.parse(sessionStorage.preferences);
    }
    this.schedulerIds = JSON.parse(this.authService.scheduleIds) || {};
    this.permission = JSON.parse(this.authService.permission) || {};
    if (localStorage.views) {
      this.pageView = JSON.parse(localStorage.views).calendar;
    }
    this.initTree();
  }

  private getCalendarsList(obj) {
    this.coreService.post('calendars', obj).subscribe((res: any) => {
      this.loading = false;
      for (let i = 0; i < res.calendars.length; i++) {
        res.calendars[i].path1 = res.calendars[i].path.substring(0, res.calendars[i].path.lastIndexOf('/')) || res.calendars[i].path.substring(0, res.calendars[i].path.lastIndexOf('/') + 1);
      }
      this.calendars = res.calendars;
    }, () => {
      this.loading = false;
    });
  }

  loadCalendar(status) {
    if (status && status !== 'remove') {
      this.calendarFilters.filter.type = status;
    }
    let obj = {
      folders: [],
      type: this.calendarFilters.filter.type != 'ALL' ? this.calendarFilters.filter.type : undefined,
      jobschedulerId: this.schedulerIds.selected,
      compact: true
    };
    this.calendars = [];
    this.loading = true;
    let paths = [];
    if (this.child) {
      paths = this.child.defaultSelectedKeys;
    } else {
      paths = this.calendarFilters.selectedkeys;
    }
    for (let x = 0; x < paths.length; x++) {
      obj.folders.push({folder: paths[x], recursive: false});
    }
    this.getCalendarsList(obj);
  }

  getCalendars(data, recursive) {
    this.loading = true;
    let obj = {
      folders: [{folder: data.path, recursive: recursive}],
      type: this.calendarFilters.filter.type != 'ALL' ? this.calendarFilters.filter.type : undefined,
      jobschedulerId: this.schedulerIds.selected,
      compact: true
    };

    this.getCalendarsList(obj);
  }

  receiveAction($event) {
    this.getCalendars($event, $event.action !== 'NODE');
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

  private addPathToExpand(path) {
    const arr = path.split('/');
    let _path = '';
    this.child.defaultExpandedKeys = [];
    arr.forEach((value) => {
      if (_path !== '/') {
        _path = _path + '/' + value;
      } else {
        _path = _path + value;
      }
      this.child.defaultExpandedKeys.push(_path);
    });
  }

  /** ---------------------------- Action ----------------------------------*/
  sortBy(propertyName) {
    this.calendarFilters.reverse = !this.calendarFilters.reverse;
    this.calendarFilters.filter.sortBy = propertyName.key;
  }

  showUsage(calendar) {
    let cal = _.clone(calendar);
    this.coreService.post('calendar/used', {
      id: calendar.id,
      jobschedulerId: this.schedulerIds.selected
    }).subscribe((res: any) => {
      cal.usedIn = res;
      const modalRef = this.modalService.open(ShowModalComponent, {backdrop: 'static'});
      modalRef.componentInstance.calendar = cal;
      modalRef.result.then(() => {
      }, (reason) => {
        console.log('close...', reason);
      });
    });
  }

  exportCalendar(calendar) {
    let calendars = [];
    if (calendar) {
      calendars.push(calendar.path);
    } else {
      for (let i = 0; i < this.object.calendars.length; i++) {
        calendars.push(this.object.calendars[i].path);
      }
    }
    this.coreService.post('calendars/export', {
      calendars: calendars,
      jobschedulerId: this.schedulerIds.selected
    }).subscribe(res => {
      this.exportFile(res);
    });
  }

  importCalendar() {
    const modalRef = this.modalService.open(ImportModalComponent, {backdrop: 'static', size: 'lg'});
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

  deleteCalendar(calendar) {
    let obj = {
      jobschedulerId: this.schedulerIds.selected,
      calendarIds: []
    };
    if (calendar) {
      obj.calendarIds.push(calendar.id);
    } else {
      for (let i = 0; i < this.object.calendars.length; i++) {
        obj.calendarIds.push(this.object.calendars[i].id);
      }
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
      for (let i = 0; i < calendarArr.length; i++) {
        this.coreService.post('calendar/used', {
          id: calendarArr[i].id,
          jobschedulerId: this.schedulerIds.selected
        }).subscribe((res) => {
          calendarArr[i].usedIn = res;
          if (i === calendarArr.length - 1)
            this.deleteCalendarFn(obj, null, calendarArr);
        });
      }

    }
  }

  loadAuditLogs(value) {
    this.showPanel = value;
    let obj = {
      jobschedulerId: this.schedulerIds.selected,
      calendars: [value.path],
      limit: this.preferences.maxAuditLogPerObject
    };
    this.coreService.post('audit_log', obj).subscribe((res: any) => {
      this.auditLogs = res.auditLog;
    });
  }

  hideAuditPanel() {
    this.showPanel = '';
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

  private deleteCalendarFn(obj, calendar, arr) {
    if (this.preferences.auditLog) {
      let comments = {
        radio: 'predefined',
        type: 'Calendar',
        operation: 'Delete',
        name: calendar ? calendar.path : ''
      };
      if (!calendar) {
        for (let i = 0; i < this.object.calendars.length; i++) {
          if (i == this.object.calendars.length - 1) {
            calendar.comments.name = calendar.comments.name + ' ' + this.object.calendars[i].path;
          } else {
            calendar.comments.name = this.object.calendars[i].path + ', ' + calendar.comments.name;
          }
        }
      }
      const modalRef = this.modalService.open(CommentModalComponent, {backdrop: 'static'});
      modalRef.componentInstance.calendar = calendar;
      modalRef.componentInstance.calendarArr = arr;
      modalRef.componentInstance.comments = comments;
      modalRef.componentInstance.obj = obj;
      modalRef.componentInstance.url = 'calendars/delete';
      modalRef.result.then(() => {

      }, function () {

      });

    } else {
      const modalRef = this.modalService.open(ConfirmModalComponent, {backdrop: 'static'});

      modalRef.componentInstance.type = 'Delete';
      if (calendar) {
        modalRef.componentInstance.title = 'delete';
        modalRef.componentInstance.message = 'deleteCalendar';
        modalRef.componentInstance.calendar = calendar;
        modalRef.componentInstance.objectName = calendar.name;
      } else {
        modalRef.componentInstance.calendarArr = arr;
        modalRef.componentInstance.title = 'deleteAllCalendar';
        modalRef.componentInstance.message = 'deleteAllCalendar';
      }
      modalRef.result.then(() => {
        this.deleteCal(obj);
      }, function () {

      });
    }
  }

}
