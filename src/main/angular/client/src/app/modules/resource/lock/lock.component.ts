import {Component, OnInit, OnDestroy, ViewChild} from '@angular/core';
import {Subject, Subscription} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {takeUntil} from 'rxjs/operators';
import {OrderPipe} from 'ngx-order-pipe';
import {CoreService} from '../../../services/core.service';
import {AuthService} from '../../../components/guard';
import {DataService} from '../../../services/data.service';
import {TreeComponent} from '../../../components/tree-navigation/tree.component';
import {SearchPipe} from '../../../pipes/core.pipe';

declare const $: any;

@Component({
  selector: 'app-single-lock',
  templateUrl: './single-lock.component.html'
})
export class SingleLockComponent implements OnInit, OnDestroy {
  loading: boolean;
  controllerId: any = {};
  preferences: any = {};
  permission: any = {};
  locks: any = [];
  name: string;
  subscription: Subscription;

  constructor(private authService: AuthService, public coreService: CoreService,
              private dataService: DataService, private route: ActivatedRoute) {
    this.subscription = dataService.eventAnnounced$.subscribe(res => {
      this.refresh(res);
    });
  }

  ngOnInit(): void {
    this.name = this.route.snapshot.queryParamMap.get('name');
    this.controllerId = this.route.snapshot.queryParamMap.get('controllerId');
    if (sessionStorage.preferences) {
      this.preferences = JSON.parse(sessionStorage.preferences);
    }
    this.permission = JSON.parse(this.authService.permission) || {};
    this.getLocksList({
      controllerId: this.controllerId,
      lockPaths: [this.name]
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private getLocksList(obj): void {
    obj.limit = this.preferences.maxLockRecords;
    this.coreService.post('locks', obj).subscribe({
      next: (res: any) => {
        this.loading = false;
        res.locks.forEach((value) => {
          value.id = value.lock.path.substring(value.lock.path.lastIndexOf('/') + 1);
          value.state = value.lock.state;
          value.versionDate = value.lock.versionDate;
          value.documentationName = value.lock.documentationName;
          value.path = value.lock.path;
          value.limit = value.lock.limit;
          value.title = value.lock.title;
        });
        this.locks = res.locks;
      }, error: () => this.loading = false
    });
  }

  private refresh(args): void {
    if (args.eventSnapshots && args.eventSnapshots.length > 0) {
      for (let j = 0; j < args.eventSnapshots.length; j++) {
        if (args.eventSnapshots[j].eventType === 'LockStateChanged' && args.eventSnapshots[j].path && args.eventSnapshots[j].path.indexOf(this.name) > -1) {
          const obj = {
            controllerId: this.controllerId,
            limit: this.preferences.maxLockRecords,
            lockPath: this.name
          };
          this.coreService.post('lock', obj).subscribe((res: any) => {
            const lock = res.lock;
            if (lock) {
              this.locks[0].acquiredLockCount = lock.acquiredLockCount;
              this.locks[0].ordersHoldingLocksCount = lock.ordersHoldingLocksCount;
              this.locks[0].ordersWaitingForLocksCount = lock.ordersWaitingForLocksCount;
              this.locks[0].workflows = lock.workflows;
            }
          });
          break;
        }
      }
    }
  }
}

@Component({
  selector: 'app-lock',
  templateUrl: 'lock.component.html'
})
export class LockComponent implements OnInit, OnDestroy {
  isLoading = false;
  loading: boolean;
  schedulerIds: any = {};
  tree: any = [];
  preferences: any = {};
  permission: any = {};
  pageView: any;
  locks: any = [];
  data: any = [];
  locksFilters: any = {};
  sideView: any = {};
  searchableProperties = ['id', 'path', 'limit', 'title', 'state', '_text', 'versionDate'];
  reloadState = 'no';
  isSearchVisible = false;

  subscription1: Subscription;
  subscription2: Subscription;
  private pendingHTTPRequests$ = new Subject<void>();

  @ViewChild(TreeComponent, {static: false}) child;

  constructor(private authService: AuthService, public coreService: CoreService, private searchPipe: SearchPipe,
              private dataService: DataService, private orderPipe: OrderPipe) {
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
      this.locksFilters.expandedKeys = this.child.defaultExpandedKeys;
      this.locksFilters.selectedkeys = this.child.defaultSelectedKeys;
    }
    this.locksFilters.expandedObjects = this.locks.reduce((ids, obj) => {
      if (obj.show) {
        ids.push(obj.id);
      }
      return ids;
    }, []);
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
    this.pendingHTTPRequests$.next();
    this.pendingHTTPRequests$.complete();
    $('.scroll-y').remove();
  }

  initTree(): void {
    if (this.schedulerIds.selected) {
      this.coreService.post('tree', {
        controllerId: this.schedulerIds.selected,
        types: ['LOCK']
      }).subscribe({
        next: res => {
          this.isLoading = true;
          this.tree = this.coreService.prepareTree(res, true);
          if (this.tree.length) {
            this.loadLocks();
          }
        }, error: () => this.isLoading = true
      });
    } else {
      this.isLoading = true;
    }
  }

  loadLocks(): void {
    this.reloadState = 'no';
    const obj = {
      folders: [],
      controllerId: this.schedulerIds.selected
    };
    this.locks = [];
    this.loading = true;
    let paths = [];
    if (this.child) {
      paths = this.child.defaultSelectedKeys;
    } else {
      paths = this.locksFilters.selectedkeys;
    }
    for (let x = 0; x < paths.length; x++) {
      obj.folders.push({folder: paths[x], recursive: false});
    }
    this.getLocksList(obj);
  }

  receiveAction($event): void {
    this.locksFilters.expandedObjects = [];
    this.getLocks($event, $event.action !== 'NODE');
  }

  getLocks(data, recursive): void {
    data.isSelected = true;
    this.loading = true;
    const obj = {
      folders: [{folder: data.path, recursive}],
      controllerId: this.schedulerIds.selected
    };
    this.getLocksList(obj);
  }

  /* ---------------------------- Action ----------------------------------*/

  pageIndexChange($event): void {
    this.locksFilters.currentPage = $event;
  }

  pageSizeChange($event): void {
    this.locksFilters.entryPerPage = $event;
  }

  sort(propertyName): void {
    this.locksFilters.reverse = !this.locksFilters.reverse;
    this.locksFilters.filter.sortBy = propertyName;
    this.data = this.orderPipe.transform(this.data, this.locksFilters.filter.sortBy, this.locksFilters.reverse);
  }

  getCurrentData(list, filter): Array<any> {
    const entryPerPage = filter.entryPerPage || this.preferences.entryPerPage;
    return list.slice((entryPerPage * (filter.currentPage - 1)), (entryPerPage * filter.currentPage));
  }

  receiveMessage($event): void {
    this.pageView = $event;
  }

  private refresh(args): void {
    if (args.eventSnapshots && args.eventSnapshots.length > 0) {
      let flag = false;
      const lockPaths = [];
      const lockPaths2 = [];
      for (let j = 0; j < args.eventSnapshots.length; j++) {
        if (args.eventSnapshots[j].eventType === 'LockStateChanged' && args.eventSnapshots[j].path) {
          if (this.locks.length > 0) {
            for (let x = 0; x < this.locks.length; x++) {
              if (this.locks[x].path === args.eventSnapshots[j].path) {
                if (!this.locks[x].show) {
                  if (lockPaths.indexOf(this.locks[x].path) === -1) {
                    lockPaths.push(this.locks[x].path);
                  }
                } else if (lockPaths2.indexOf(this.locks[x].path) === -1) {
                  this.locks[x].loading = true;
                  lockPaths2.push(this.locks[x].path);
                }
                break;
              }
            }
          }
        } else if (args.eventSnapshots[j].eventType.match(/Item/) && args.eventSnapshots[j].objectType === 'LOCK') {
          flag = true;
        }
      }
      if (lockPaths && lockPaths.length) {
        this.updateListOnEvent(lockPaths, true);
      }
      if (lockPaths2 && lockPaths2.length) {
        this.updateListOnEvent(lockPaths2, false);
      }
      if (flag) {
        this.initTree();
      }
    }
  }

  private updateListOnEvent(paths, compact): void {
    this.coreService.post('locks', {
      controllerId: this.schedulerIds.selected,
      compact,
      lockPaths: paths,
      limit: this.preferences.maxLockRecords
    }).subscribe({
      next: (res: any) => {
        this.loading = false;
        res.locks.forEach((value) => {
          for (let x = 0; x < this.locks.length; x++) {
            if (this.locks[x].path === value.lock.path) {
              this.locks[x].loading = false;
              if (this.locks[x].workflows.length > 0 && value.workflows.length > 0) {
                this.locks[x].workflows.forEach((workflow) => {
                  if (workflow.show) {
                    for (let m = 0; value.workflows.length > 0; m++) {
                      if (value.workflows[m].path === workflow.path) {
                        value.workflows[m].show = true;
                        break;
                      }
                    }
                  }
                });
              }
              this.locks[x].acquiredLockCount = value.acquiredLockCount;
              this.locks[x].ordersHoldingLocksCount = value.ordersHoldingLocksCount;
              this.locks[x].ordersWaitingForLocksCount = value.ordersWaitingForLocksCount;
              this.locks[x].workflows = value.workflows;
              break;
            }
          }
        });
      }, error: () => this.loading = false
    });
  }

  private init(): void {
    this.locksFilters = this.coreService.getResourceTab().locks;
    this.coreService.getResourceTab().state = 'locks';
    this.preferences = sessionStorage.preferences ? JSON.parse(sessionStorage.preferences) : {};
    this.schedulerIds = this.authService.scheduleIds ? JSON.parse(this.authService.scheduleIds) : {};
    this.permission = this.authService.permission ? JSON.parse(this.authService.permission) : {};
    if (localStorage.views) {
      this.pageView = JSON.parse(localStorage.views).lock;
    }
    this.initTree();
  }

  private getLocksList(obj): void {
    obj.limit = this.preferences.maxLockRecords;
    obj.compact = true;
    const locks = [];
    this.coreService.post('locks', obj).pipe(takeUntil(this.pendingHTTPRequests$)).subscribe({
      next: (res: any) => {
        this.loading = false;
        if (res.locks && res.locks.length === 0) {
          this.locksFilters.currentPage = 1;
        }
        res.locks.forEach((value) => {
          value.id = value.lock.path.substring(value.lock.path.lastIndexOf('/') + 1);
          value.state = value.lock.state;
          value.versionDate = value.lock.versionDate;
          value.path = value.lock.path;
          value.limit = value.lock.limit;
          value.documentationName = value.lock.documentationName;
          value.title = value.lock.title;
          if (value.path) {
            value.path1 = value.path.substring(0, value.path.lastIndexOf('/')) || value.path.substring(0, value.path.lastIndexOf('/') + 1);
          }
          if (this.locksFilters.expandedObjects && this.locksFilters.expandedObjects.length > 0) {
            const index = this.locksFilters.expandedObjects.indexOf(value.id);
            if (index > -1) {
              locks.push(value);
              this.locksFilters.expandedObjects.slice(index, 1);
            }
          }
        });
        res.locks = this.orderPipe.transform(res.locks, this.locksFilters.filter.sortBy, this.locksFilters.reverse);
        this.locks = res.locks;
        this.searchInResult();
        if (locks && locks.length > 0) {
          this.updateLocksDetail(locks);
        }
      }, error: () => this.loading = false
    });
  }

  searchInResult(): void {
    this.data = this.locksFilters.searchText ? this.searchPipe.transform(this.locks, this.locksFilters.searchText, this.searchableProperties) : this.locks;
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
    this.locksFilters.selectedkeys = [];
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
    this.locksFilters.expandedKeys = pathArr;
    this.locksFilters.selectedkeys.push(pathArr[pathArr.length - 1]);
    this.locksFilters.expandedObjects = [data.path];
    const obj = {
      controllerId: this.schedulerIds.selected,
      folders: [{folder: PATH, recursive: false}]
    };
    this.locks = [];
    this.loading = true;
    this.getLocksList(obj);
  }

  private updateLocksDetail(locks): void {
    const obj = {
      lockPaths: [],
      controllerId: this.schedulerIds.selected
    };
    locks.forEach((value) => {
      value.show = true;
      value.loading = true;
      obj.lockPaths.push(value.path);
    });
    this.getLocksDetail(obj, (data) => {
      if (data && data.length > 0) {
        locks.forEach((lock) => {
          for (let i = 0; i < data.length; i++) {
            if (lock.path === data[i].lock.path) {
              lock.acquiredLockCount = data[i].acquiredLockCount;
              lock.ordersHoldingLocksCount = data[i].ordersHoldingLocksCount;
              lock.ordersWaitingForLocksCount = data[i].ordersWaitingForLocksCount;
              lock.workflows = data[i].workflows;
              lock.workflows.forEach((item) => {
                item.show = true;
              });
              data.splice(i, 1);
              break;
            }
          }
          lock.loading = false;
        });
        this.locks = [...this.locks];
      }
    });
  }

  private getLocksDetail(obj, cb): void {
    obj.limit = this.preferences.maxLockRecords;
    this.coreService.post('locks', obj).subscribe({
      next: (res: any) => {
        cb(res.locks);
      }, error: () => cb()
    });
  }

  showDetail(lock): void {
    lock.show = true;
    lock.loading = true;
    const obj = {
      lockPaths: [lock.path],
      controllerId: this.schedulerIds.selected
    };
    this.getLocksDetail(obj, (data) => {
      if (data && data.length > 0) {
        for (const i in data) {
          if (lock.path === data[i].lock.path) {
            lock.acquiredLockCount = data[i].acquiredLockCount;
            lock.ordersHoldingLocksCount = data[i].ordersHoldingLocksCount;
            lock.ordersWaitingForLocksCount = data[i].ordersWaitingForLocksCount;
            lock.workflows = data[i].workflows;
            break;
          }
        }
      }
      lock.loading = false;
    });
  }

  expandDetails(): void {
    const locks = this.getCurrentData(this.data, this.locksFilters);
    if (locks && locks.length > 0) {
      this.updateLocksDetail(locks);
    }
  }

  collapseDetails(): void {
    const locks = this.getCurrentData(this.data, this.locksFilters);
    locks.forEach((value) => {
      value.show = false;
    });
  }

  reload(): void {
    if (this.reloadState === 'no') {
      this.locks = [];
      this.data = [];
      this.reloadState = 'yes';
      this.loading = false;
      this.pendingHTTPRequests$.next();
    } else if (this.reloadState === 'yes') {
      this.loading = true;
      this.loadLocks();
    }
  }
}

