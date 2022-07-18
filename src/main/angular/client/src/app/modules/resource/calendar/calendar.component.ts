import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Subject, Subscription} from 'rxjs';
import { NzModalService} from 'ng-zorro-antd/modal';
import {takeUntil} from 'rxjs/operators';
import {CoreService} from '../../../services/core.service';
import {AuthService} from '../../../components/guard';
import {DataService} from '../../../services/data.service';
import {TreeComponent} from '../../../components/tree-navigation/tree.component';
import {CalendarModalComponent} from '../../../components/calendar-modal/calendar.component';
import {SearchPipe} from '../../../pipes/core.pipe';

declare const $: any;

// Main Component
@Component({
  selector: 'app-single-calendar',
  templateUrl: 'single-calendar.component.html'
})
export class SingleCalendarComponent implements OnInit, OnDestroy {
  loading: boolean;
  preferences: any = {};
  permission: any = {};
  calendars: any = [];
  subscription: Subscription;
  name: string;
  controllerId: string;

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
      nzClosable: false,
      nzMaskClosable: false
    });
  }

  private init(): void {
    this.name = this.route.snapshot.queryParamMap.get('name');
    this.controllerId = this.route.snapshot.queryParamMap.get('controllerId');
    if (sessionStorage.preferences) {
      this.preferences = JSON.parse(sessionStorage.preferences);
    }
    this.permission = JSON.parse(this.authService.permission) || {};
    this.getCalendarsList({
      controllerId: this.controllerId,
      calendarPaths: [this.name]
    });
  }

  private getCalendarsList(obj): void {
    this.coreService.post('calendars', obj).subscribe({
      next: (res: any) => {
        this.calendars = res.calendars;
        this.loading = false;
      }, error: () => this.loading = false
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
  reloadState = 'no';
  isSearchVisible = false;

  subscription1: Subscription;
  subscription2: Subscription;
  private pendingHTTPRequests$ = new Subject<void>();

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
    this.coreService.setSideView(this.sideView);
    if (this.child) {
      this.calendarFilters.expandedKeys = this.child.defaultExpandedKeys;
      this.calendarFilters.selectedkeys = this.child.defaultSelectedKeys;
    }
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
    this.pendingHTTPRequests$.next();
    this.pendingHTTPRequests$.complete();
    $('.scroll-y').remove();
  }

  initTree(): void {
    this.coreService.post('tree', {
      controllerId: this.schedulerIds.selected,
      types: ['WORKINGDAYSCALENDAR', 'NONWORKINGDAYSCALENDAR']
    }).subscribe({
      next: res => {
        this.tree = this.coreService.prepareTree(res, true);
        if (this.tree.length > 0) {
          this.loadCalendar(null);
        }
        this.isLoading = true;
      }, error: () => this.isLoading = true
    });
  }

  loadCalendar(status): void {
    this.reloadState = 'no';
    if (status && status !== 'remove') {
      this.calendarFilters.filter.type = status;
    }
    const obj = {
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
    const obj = {
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

  search(): void {
    this.isSearchVisible = true;
  }

  closeSearch(): void {
    this.isSearchVisible = false;
  }

  onNavigate(data): void {
    const pathArr = [];
    const arr = data.path.split('/');
    this.calendarFilters.selectedkeys = [];
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
    const PATH = data.path.substring(0, data.path.lastIndexOf('/')) || '/';
    this.calendarFilters.expandedKeys = pathArr;
    this.calendarFilters.selectedkeys.push(pathArr[pathArr.length - 1]);
    this.calendarFilters.expandedObjects = [data.path];
    const obj = {
      controllerId: this.schedulerIds.selected,
      folders: [{folder: PATH, recursive: false}]
    };
    this.calendars = [];
    this.loading = true;
    this.getCalendarsList(obj);
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
      nzClosable: false,
      nzMaskClosable: false
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
    this.coreService.post('calendars', obj).pipe(takeUntil(this.pendingHTTPRequests$)).subscribe({
      next: (res: any) => {
        if (res.calendars && res.calendars.length === 0) {
          this.calendarFilters.currentPage = 1;
        }
        this.loading = false;
        if (res.calendars) {
          for (let i = 0; i < res.calendars.length; i++) {
            res.calendars[i].path1 = res.calendars[i].path.substring(0, res.calendars[i].path.lastIndexOf('/')) || res.calendars[i].path.substring(0, res.calendars[i].path.lastIndexOf('/') + 1);
          }
        }
        this.calendars = res.calendars || [];
        this.searchInResult();
      }, error: () => this.loading = false
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

  reload(): void {
    if (this.reloadState === 'no') {
      this.calendars = [];
      this.data = [];
      this.reloadState = 'yes';
      this.loading = false;
      this.pendingHTTPRequests$.next();
    } else if (this.reloadState === 'yes') {
      this.loading = true;
      this.loadCalendar(null);
    }
  }
}
