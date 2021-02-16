import {Component, OnInit, Input, OnDestroy, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {NgbModal, NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'underscore';
import {CoreService} from '../../../services/core.service';
import {AuthService} from '../../../components/guard';
import {DataService} from '../../../services/data.service';
import {TreeComponent} from '../../../components/tree-navigation/tree.component';
import {CalendarModalComponent} from '../../../components/calendar-modal/calendar.component';
import {SearchPipe} from '../../../filters/filter.pipe';

@Component({
  selector: 'app-ngbd-modal-content',
  templateUrl: './show-dialog.html'
})
export class ShowModalComponent {
  @Input() calendar: any;

  constructor(public activeModal: NgbActiveModal, public coreService: CoreService) {
  }
}
// Main Component
@Component({
  selector: 'app-single-calendar',
  templateUrl: 'single-calendar.component.html'
})
export class SingleCalendarComponent implements OnInit, OnDestroy {
  loading: boolean;
  schedulerIds: any = {};
  preferences: any = {};
  permission: any = {};
  calendars: any = [];
  subscription: Subscription;
  path: string;
  schedulerId: string;

  public options = {};

  constructor(private router: Router, private authService: AuthService, public coreService: CoreService,
              private modalService: NgbModal, private dataService: DataService, private route: ActivatedRoute) {
    this.subscription = dataService.refreshAnnounced$.subscribe(() => {
      this.init();
    });
  }

  ngOnInit() {
    this.init();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private init() {
    this.path = this.route.snapshot.queryParamMap.get('path');
    this.schedulerId = this.route.snapshot.queryParamMap.get('scheduler_id');
    if (sessionStorage.preferences) {
      this.preferences = JSON.parse(sessionStorage.preferences);
    }
    this.schedulerIds = JSON.parse(this.authService.scheduleIds) || {};
    this.permission = JSON.parse(this.authService.permission) || {};
    this.getCalendarsList({
      controllerId: this.schedulerId,
      calendars: [this.path]
    });
  }

  private getCalendarsList(obj) {
    this.coreService.post('calendars', obj).subscribe((res: any) => {
      this.loading = false;
      this.calendars = res.calendars;
    }, () => {
      this.loading = false;
    });
  }

  /** ---------------------------- Action ----------------------------------*/

  showUsage(calendar) {
    let cal = _.clone(calendar);
    this.coreService.post('calendar/used', {
      id: calendar.id,
      controllerId: this.schedulerIds.selected
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

  previewCalendar(calendar) {
    const modalRef = this.modalService.open(CalendarModalComponent, {backdrop: 'static', size: 'lg'});
    modalRef.componentInstance.path = calendar.path;
    modalRef.componentInstance.calendar = true;
    modalRef.result.then((result) => {
      console.log(result);
    }, (reason) => {
      console.log('close...', reason);
    });
  }

  showDocumentation(calendar) {

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
  data: any = [];
  auditLogs: any = [];
  calendarFilters: any = {};
  sideView: any = {};
  subscription1: Subscription;
  subscription2: Subscription;

  @ViewChild(TreeComponent, {static: false}) child;

  public options = {};

  constructor(private router: Router, private authService: AuthService, public coreService: CoreService,
              private modalService: NgbModal, private searchPipe: SearchPipe, private dataService: DataService) {
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
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
    this.coreService.setSideView(this.sideView);
    if (this.child) {
      this.calendarFilters.expandedKeys = this.child.defaultExpandedKeys;
      this.calendarFilters.selectedkeys = this.child.defaultSelectedKeys;
    }
  }

  initTree() {
    this.coreService.post('tree', {
      controllerId: this.schedulerIds.selected,
      types: ['WORKINGDAYSCALENDAR', 'NONWORKINGDAYSCALENDAR']
    }).subscribe(res => {
      this.tree = this.coreService.prepareTree(res, true);
      if (this.tree.length > 0) {
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
    if (args.eventSnapshots && args.eventSnapshots.length > 0) {
      for (let j = 0; j < args.eventSnapshots.length; j++) {
        if (args.eventSnapshots[j].eventType === 'ItemAdded' && args.eventSnapshots[j].path) {
          const path = args.eventSnapshots[j].path.substring(0, args.eventSnapshots[j].path.lastIndexOf('/')) || '/';
          this.calendarFilters.selectedkeys = [path];
          this.addPathToExpand(path);
          this.initTree();
          break;
        } else if (args.eventSnapshots[j].eventType.match('Calendar')) {
          this.initTree();
          break;
        }
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
      if(res.calendars) {
        for (let i = 0; i < res.calendars.length; i++) {
          res.calendars[i].path1 = res.calendars[i].path.substring(0, res.calendars[i].path.lastIndexOf('/')) || res.calendars[i].path.substring(0, res.calendars[i].path.lastIndexOf('/') + 1);
        }
      }
      this.calendars = res.calendars || [];
      this.searchInResult();
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
      controllerId: this.schedulerIds.selected,
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
      controllerId: this.schedulerIds.selected,
      compact: true
    };

    this.getCalendarsList(obj);
  }

  receiveAction($event) {
    this.getCalendars($event, $event.action !== 'NODE');
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
  pageIndexChange($event) {
    this.calendarFilters.currentPage = $event;
  }

  pageSizeChange($event) {
    this.calendarFilters.entryPerPage = $event;
  }

  sort(propertyName) {
    this.calendarFilters.reverse = !this.calendarFilters.reverse;
    this.calendarFilters.filter.sortBy = propertyName;
  }

  searchInResult() {
    this.data = this.calendarFilters.searchText ? this.searchPipe.transform(this.calendars, this.calendarFilters.searchText) : this.calendars;
    this.data = [...this.data];
  }

  showUsage(calendar) {
    let cal = _.clone(calendar);
    this.coreService.post('calendar/used', {
      id: calendar.id,
      controllerId: this.schedulerIds.selected
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

  previewCalendar(calendar) {
    const modalRef = this.modalService.open(CalendarModalComponent, {backdrop: 'static', size: 'lg'});
    modalRef.componentInstance.path = calendar.path;
    modalRef.componentInstance.calendar = true;
    modalRef.result.then((result) => {
      console.log(result);
    }, (reason) => {
      console.log('close...', reason);
    });
  }

  showDocumentation(calendar) {

  }
}
