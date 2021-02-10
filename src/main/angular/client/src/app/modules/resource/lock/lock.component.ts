import {Component, OnInit, OnDestroy, ViewChild} from '@angular/core';
import {Subscription} from 'rxjs';
import {CoreService} from '../../../services/core.service';
import {AuthService} from '../../../components/guard';
import {DataService} from '../../../services/data.service';
import {TreeComponent} from '../../../components/tree-navigation/tree.component';
import {SearchPipe} from '../../../filters/filter.pipe';

// Main Component
@Component({
  selector: 'app-lock',
  templateUrl: 'lock.component.html',
  styleUrls: ['./lock.component.css'],

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
  subscription1: Subscription;
  subscription2: Subscription;

  @ViewChild(TreeComponent, {static: false}) child;

  constructor(private authService: AuthService, public coreService: CoreService,
              private searchPipe: SearchPipe, private dataService: DataService) {
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
  }

  initTree() {
    this.coreService.post('tree', {
      controllerId: this.schedulerIds.selected,
      types: ['LOCK']
    }).subscribe(res => {
      this.tree = this.coreService.prepareTree(res, true);
      if (this.tree.length) {
        this.loadLocks();
      }
      this.isLoading = true;
    }, () => {
      this.isLoading = true;
    });
  }

  loadLocks() {
    let obj = {
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

  receiveAction($event) {
    this.getLocks($event, $event.action !== 'NODE');
  }

  getLocks(data, recursive) {
    data.isSelected = true;
    this.loading = true;
    let obj = {
      folders: [{folder: data.path, recursive: recursive}],
      controllerId: this.schedulerIds.selected,
      compact: true
    };
    this.getLocksList(obj);
  }


  /** ---------------------------- Action ----------------------------------*/

  pageIndexChange($event) {
    this.locksFilters.currentPage = $event;
  }

  pageSizeChange($event) {
    this.locksFilters.entryPerPage = $event;
  }

  sort(propertyName) {
    this.locksFilters.reverse = !this.locksFilters.reverse;
    this.locksFilters.filter.sortBy = propertyName;
  }

  receiveMessage($event) {
    this.pageView = $event;
  }

  private refresh(args) {
    if (args.eventSnapshots && args.eventSnapshots.length > 0) {
      for (let j = 0; j < args.eventSnapshots.length; j++) {
        if (args.eventSnapshots[j].eventType === 'JobStateChanged' && args.eventSnapshots[j].path) {
          if (this.locks.length > 0) {
            for (let x = 0; x < this.locks.length; x++) {
              if (this.locks[x].path === args.eventSnapshots[j].path) {
                let obj = {
                  controllerId: this.schedulerIds.selected,
                  folders: [{folder: this.locks[x].path, recursive: false}]
                };
                this.coreService.post('locks', obj).subscribe(res => {
                  //TODO merge
                  console.log(res);
                });
              }
            }
          }
        }
      }
    }
  }

  private init() {
    this.locksFilters = this.coreService.getResourceTab().locks;
    this.coreService.getResourceTab().state = 'locks';
    if (sessionStorage.preferences) {
      this.preferences = JSON.parse(sessionStorage.preferences);
    }
    this.schedulerIds = JSON.parse(this.authService.scheduleIds) || {};
    this.permission = JSON.parse(this.authService.permission) || {};
    if (localStorage.views) {
      this.pageView = JSON.parse(localStorage.views).lock;
    }
    this.initTree();
  }

  private getLocksList(obj) {
    this.coreService.post('locks', obj).subscribe((res: any) => {
      this.loading = false;
      res.locks.forEach((value) => {
        value.id = value.lock.id;
        value.path = value.lock.path;
        value.limit = value.lock.limit;
        value.title = value.lock.title;
        if (value.path) {
          value.path1 = value.path.substring(0, value.path.lastIndexOf('/')) || value.path.substring(0, value.path.lastIndexOf('/') + 1);
        }
        if (this.locksFilters.expandedObjects && this.locksFilters.expandedObjects.length > 0) {
          let index = this.locksFilters.expandedObjects.indexOf(value.id);
          if (index > -1) {
            value.show = true;
            this.locksFilters.expandedObjects.slice(index, 1);
          }
        }
      });
      this.locks = res.locks;
      this.searchInResult();
    }, () => {
      this.loading = false;
    });
  }

  searchInResult() {
    this.data = this.locksFilters.searchText ? this.searchPipe.transform(this.locks, this.locksFilters.searchText) : this.locks;
    this.data = [...this.data];
  }

  expandDetails() {
    this.data.forEach((value) => {
      value.show = true;
      value.workflows.forEach((item) => {
        item.show = true;
      })
    });
  }

  collapseDetails() {
    this.data.forEach((value) => {
      value.show = false;
    });
  }
}

