import {Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
import * as _ from 'underscore';
import {CoreService} from '../../../services/core.service';
import {AuthService} from '../../../components/guard';
import {DataService} from '../../../services/data.service';
import {TreeComponent} from '../../../components/tree-navigation/tree.component';
import {CalendarModalComponent} from '../../../components/calendar-modal/calendar.component';
import {SearchPipe} from '../../../pipes/core.pipe';

@Component({
  selector: 'app-ngbd-modal-content',
  templateUrl: './show-dialog.html'
})
export class ShowModalComponent {
  @Input() calendar: any;

  constructor(public activeModal: NzModalRef, public coreService: CoreService) {
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

  constructor(private router: Router, private authService: AuthService, public coreService: CoreService,
              private modal: NzModalService, private dataService: DataService, private route: ActivatedRoute) {
    this.subscription = dataService.refreshAnnounced$.subscribe(() => {
      this.init();
    });
  }

  ngOnInit(): void {
    this.init();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /* ---------------------------- Action ----------------------------------*/

  showUsage(calendar): void {
    let cal = _.clone(calendar);
    this.coreService.post('calendar/used', {
      id: calendar.id,
      controllerId: this.schedulerIds.selected
    }).subscribe((res: any) => {
      cal.usedIn = res;
      this.modal.create({
        nzTitle: null,
        nzContent: ShowModalComponent,

        nzComponentParams: {
          calendar: cal
        },
        nzFooter: null,
        nzClosable: false
      });
    });
  }

  previewCalendar(calendar): void {
    this.modal.create({
      nzTitle: null,
      nzContent: CalendarModalComponent,
      nzClassName: 'lg',
      nzComponentParams: {
        path: calendar.path,
        calendar: true
      },
      nzFooter: null,
      nzClosable: false
    });
  }

  showDocumentation(calendar): void {

  }

  private init(): void {
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

  private getCalendarsList(obj): void {
    this.coreService.post('calendars', obj).subscribe((res: any) => {
      this.loading = false;
      this.calendars = res.calendars;
    }, () => {
      this.loading = false;
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
  data: any = [];
  calendarFilters: any = {};
  sideView: any = {};
  searchableProperties = ['name', 'path', 'title', 'type'];
  subscription1: Subscription;
  subscription2: Subscription;

  @ViewChild(TreeComponent, {static: false}) child;

  constructor(private router: Router, private authService: AuthService, public coreService: CoreService,
              private modal: NzModalService, private searchPipe: SearchPipe, private dataService: DataService) {
    this.subscription1 = dataService.eventAnnounced$.subscribe(res => {
      this.refresh(res);
    });
    this.subscription2 = dataService.refreshAnnounced$.subscribe(() => {
      this.init();
    });
  }

  ngOnInit(): void {
    this.sideView = this.coreService.getSideView();
    this.init();
  }

  ngOnDestroy(): void {
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
    this.coreService.setSideView(this.sideView);
    if (this.child) {
      this.calendarFilters.expandedKeys = this.child.defaultExpandedKeys;
      this.calendarFilters.selectedkeys = this.child.defaultSelectedKeys;
    }
  }

  initTree(): void {
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

  loadCalendar(status): void {
    if (status && status !== 'remove') {
      this.calendarFilters.filter.type = status;
    }
    let obj = {
      folders: [],
      type: this.calendarFilters.filter.type !== 'ALL' ? this.calendarFilters.filter.type : undefined,
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

  getCalendars(data, recursive): void {
    this.loading = true;
    let obj = {
      folders: [{folder: data.path, recursive}],
      type: this.calendarFilters.filter.type !== 'ALL' ? this.calendarFilters.filter.type : undefined,
      controllerId: this.schedulerIds.selected,
      compact: true
    };
    this.getCalendarsList(obj);
  }

  receiveAction($event): void {
    this.getCalendars($event, $event.action !== 'NODE');
  }

  /* ---------------------------- Action ----------------------------------*/
  pageIndexChange($event): void {
    this.calendarFilters.currentPage = $event;
  }

  pageSizeChange($event): void {
    this.calendarFilters.entryPerPage = $event;
  }

  sort(propertyName): void {
    this.calendarFilters.reverse = !this.calendarFilters.reverse;
    this.calendarFilters.filter.sortBy = propertyName;
  }

  receiveMessage($event): void {
    this.pageView = $event;
  }

  searchInResult(): void {
    this.data = this.calendarFilters.searchText ? this.searchPipe.transform(this.calendars, this.calendarFilters.searchText, this.searchableProperties) : this.calendars;
    this.data = [...this.data];
  }

  showUsage(calendar): void {
    let cal = _.clone(calendar);
    this.coreService.post('calendar/used', {
      id: calendar.id,
      controllerId: this.schedulerIds.selected
    }).subscribe((res: any) => {
      cal.usedIn = res;
      this.modal.create({
        nzTitle: null,
        nzContent: ShowModalComponent,
        nzComponentParams: {
          calendar: cal
        },
        nzFooter: null,
        nzClosable: false
      });
    });
  }

  previewCalendar(calendar): void {
    this.modal.create({
      nzTitle: null,
      nzContent: CalendarModalComponent,
      nzClassName: 'lg',
      nzComponentParams: {
        path: calendar.path,
        calendar: true
      },
      nzFooter: null,
      nzClosable: false
    });
  }

  private init(): void {
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

  private getCalendarsList(obj): void {
    this.coreService.post('calendars', obj).subscribe((res: any) => {
      this.loading = false;
      if (res.calendars) {
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

  private refresh(args): void {
    const pathArr = [];
    if (args.eventSnapshots && args.eventSnapshots.length > 0) {
      for (let j = 0; j < args.eventSnapshots.length; j++) {
        if (args.eventSnapshots[j].eventType === 'CalendarStateChanged' && args.eventSnapshots[j].path) {
          if (this.calendars.length > 0) {
            for (let x = 0; x < this.calendars.length; x++) {
              if (this.calendars[x].path === args.eventSnapshots[j].path) {
                pathArr.push(args.eventSnapshots[j].path);
                break;
              }
            }
          }
        } else if (args.eventSnapshots[j].eventType.match(/Item/) && args.eventSnapshots[j].objectType.match(/CALENDAR/)) {
          this.initTree();
          break;
        }
      }
    }
    if (pathArr.length > 0) {
      this.coreService.post('calendars', {
        controllerId: this.schedulerIds.selected,
        calendarPaths: pathArr
      }).subscribe((res: any) => {
        for (let x = 0; x < this.calendars.length; x++) {
          for (let y = 0; y < res.calendars.length; y++) {
            if (this.calendars[x].path === res.calendars[y].path) {
              this.calendars[x] = res.calendars[y];
              break;
            }
          }
        }
      });
    }
  }
}
