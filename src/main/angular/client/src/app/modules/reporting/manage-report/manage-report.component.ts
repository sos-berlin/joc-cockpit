import {Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {Subject, Subscription} from 'rxjs';
import {Router} from '@angular/router';
import {takeUntil} from 'rxjs/operators';
import {NzModalService} from 'ng-zorro-antd/modal';
import {CoreService} from '../../../services/core.service';
import {DataService} from '../../../services/data.service';
import {AuthService} from '../../../components/guard';
import {SearchPipe, OrderPipe} from '../../../pipes/core.pipe';
import {TreeComponent} from "../../../components/tree-navigation/tree.component";
import {SharingDataService} from "../sharing-data.service";
import {RunModalComponent} from "../reporting.component";

@Component({
  selector: 'app-manage-report',
  templateUrl: './manage-report.component.html'
})
export class ManageReportComponent {
  @Input() permission: any;
  @Input() preferences: any = {};
  @Input() filters: any = {};
  @Input() templates: any = [];

  @Output() reportRun: EventEmitter<any> = new EventEmitter();

  isLoaded = false;
  reports = [];
  data = [];
  tree = [];

  sideView: any = {};
  schedulerIds: any = {};
  isPathDisplay = false;
  isLoading = false;
  isSearchVisible = false;
  loading: boolean;
  reloadState = 'no';
  pageView: any;

  object = {
    setOfCheckedId: new Set(),
    checked: false,
    indeterminate: false
  };
  searchableProperties = ['name', 'title', 'path', 'template', 'frequencies', 'monthFrom', 'monthTo', 'hits'];

  subscription1: Subscription;
  subscription2: Subscription;
  subscription3: Subscription;
  subscription4: Subscription;

  private pendingHTTPRequests$ = new Subject<void>();
  @ViewChild(TreeComponent, {static: false}) child;

  constructor(public coreService: CoreService, private authService: AuthService, private router: Router, private orderPipe: OrderPipe,
              private modal: NzModalService, private dataService: DataService, private searchPipe: SearchPipe, private sharingDataService: SharingDataService) {
    this.subscription1 = dataService.eventAnnounced$.subscribe(res => {
      if (res) {
        this.refresh(res);
      }
    });
    this.subscription2 = dataService.refreshAnnounced$.subscribe(() => {
      this.init();
    });
    this.subscription3 = sharingDataService.functionAnnounced$.subscribe((res: any) => {
      if (res.pageView) {
        this.pageView = res.pageView;
      } else if (res.sortBy) {
        this.sort(res.sortBy);
      } else if (res.search) {
        this.isSearchVisible = true;
      } else if (res.run) {
        this.runAll();
      }
    });
    this.subscription4 = sharingDataService.searchKeyAnnounced$.subscribe(res => {
      this.searchInResult();
    });
  }

  ngOnInit(): void {
    this.sideView = this.coreService.getSideView();
    this.init();
  }

  ngOnDestroy(): void {
    this.coreService.setSideView(this.sideView);
    if (this.child) {
      this.filters.expandedKeys = this.child.defaultExpandedKeys;
      this.filters.selectedkeys = this.child.defaultSelectedKeys;
    }
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
    this.subscription3.unsubscribe();
    this.subscription4.unsubscribe();
    this.pendingHTTPRequests$.next();
    this.pendingHTTPRequests$.complete();
  }

  refresh(args: { eventSnapshots: any[] }): void {
    if (args.eventSnapshots && args.eventSnapshots.length > 0) {
      for (let j = 0; j < args.eventSnapshots.length; j++) {
        if (args.eventSnapshots[j].eventType.match(/Item/) && args.eventSnapshots[j].objectType === 'REPORT') {
          this.initTree();

        } else if (args.eventSnapshots[j].eventType.match(/Reports/) && args.eventSnapshots[j].objectType === 'REPORT') {
          this.coreService.reportStartRunning = false;
        }
      }
    }
  }

  private init(): void {
    this.preferences = sessionStorage['preferences'] ? JSON.parse(sessionStorage['preferences']) : {};
    this.schedulerIds = this.authService.scheduleIds ? JSON.parse(this.authService.scheduleIds) : {};
    this.permission = this.authService.permission ? JSON.parse(this.authService.permission) : {};
    this.isPathDisplay = sessionStorage['displayFoldersInViews'] == 'true';
    if (localStorage['views']) {
      this.pageView = JSON.parse(localStorage['views']).report;
    }
    this.initTree();
  }

  initTree(): void {
    if (this.schedulerIds.selected) {
      this.coreService.post('tree', {
        controllerId: this.schedulerIds.selected,
        types: ['REPORT']
      }).subscribe({
        next: res => {
          this.isLoading = true;
          this.tree = this.coreService.prepareTree(res, true);
          if (this.tree.length) {
            this.loadReports();
          }
        }, error: () => this.isLoading = true
      });
    } else {
      this.isLoading = true;
    }
  }

  closeSearch(): void {
    this.isSearchVisible = false;
  }

  onNavigate(data): void {
    const pathArr = [];
    const arr = data.path.split('/');
    this.filters.selectedkeys = [];
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
    this.filters.expandedKeys = pathArr;
    this.filters.selectedkeys.push(pathArr[pathArr.length - 1]);
    this.filters.expandedObjects = [data.path];
    const obj = {
      folders: [{folder: PATH, recursive: false}]
    };
    this.reports = [];
    this.loading = true;
    this.getReportList(obj);
  }

  receiveAction($event): void {
    this.filters.expandedObjects = [];
    this.getReports($event, $event.action !== 'NODE');
  }

  getReports(data: any, recursive: boolean): void {
    data.isSelected = true;
    this.loading = true;
    const obj = {
      folders: [{folder: data.path, recursive}]
    };
    this.getReportList(obj);
  }

  selectObject(item): void {
    let flag = true;
    const PATH = item.path.substring(0, item.path.lastIndexOf('/')) || '/';
    for (let i in this.filters.expandedKeys) {
      if (PATH == this.filters.expandedKeys[i]) {
        flag = false;
        break;
      }
    }
    if (flag) {
      this.filters.expandedKeys.push(PATH);
    }
    this.filters.selectedkeys = [PATH];
    this.filters.expandedObjects = [item.path];
    this.loadReports(true);
  }

  loadReports(skipChild = false): void {
    this.reloadState = 'no';
    const obj = {
      folders: []
    };
    this.reports = [];
    this.loading = true;
    let paths;
    if (this.child && !skipChild) {
      paths = this.child.defaultSelectedKeys;
    } else {
      paths = this.filters.selectedkeys;
    }
    for (let x = 0; x < paths.length; x++) {
      obj.folders.push({folder: paths[x], recursive: false});
    }
    this.getReportList(obj);
  }

  private getReportList(obj): void {
    this.coreService.post('reporting/reports', obj).pipe(takeUntil(this.pendingHTTPRequests$)).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.reports = this.orderPipe.transform(res.reports, this.filters.filter.sortBy, this.filters.filter.reverse);
        this.reports.forEach((report) => {
          report.name = report.path.substring(report.path.lastIndexOf('/') + 1);
          report.path1 = report.path.substring(0, report.path.lastIndexOf('/')) || '/';
          const template = this.templates.find(template => template.templateName == report.templateName);
          if (template) report.template = template.title;
          if(report.template?.includes('${hits}')){
            report.template = report.template.replace('${hits}', report.hits || 10)
          }
        })
        this.searchInResult();
      }, error: () => this.loading = false
    });
  }

  sort(propertyName): void {
    this.filters.filter.reverse = !this.filters.filter.reverse;
    this.filters.filter.sortBy = propertyName;
    this.data = this.orderPipe.transform(this.data, this.filters.filter.sortBy, this.filters.filter.reverse);
  }


  getCurrentData(list, filter): Array<any> {
    const entryPerPage = filter.filter.entryPerPage || this.preferences.entryPerPage;
    return list.slice((entryPerPage * (filter.filter.currentPage - 1)), (entryPerPage * filter.filter.currentPage));
  }

  receiveMessage($event: any): void {
    this.pageView = $event;
  }

  searchInResult(): void {
    this.data = this.filters.searchText ? this.searchPipe.transform(this.reports, this.filters.searchText, this.searchableProperties) : this.reports;
    this.data = [...this.data];
    if (this.reports.length === 0) {
      this.filters.filter.currentPage = 1;
    }
  }

  /** Actions */

  checkAll(value: boolean): void {
    if (value && this.reports.length > 0) {
      const documents = this.getCurrentData(this.data, this.filters);
      documents.forEach(item => {
        this.object.setOfCheckedId.add(item.path);
      });
    } else {
      this.object.setOfCheckedId.clear();
    }
    this.refreshCheckedStatus();
  }

  onItemChecked(document: any, checked: boolean): void {
    if (!checked && this.object.setOfCheckedId.size > (this.filters.filter.entryPerPage || this.preferences.entryPerPage)) {
      const orders = this.getCurrentData(this.data, this.filters);
      if (orders.length < this.data.length) {
        this.object.setOfCheckedId.clear();
        orders.forEach(item => {
          this.object.setOfCheckedId.add(item.path);
        });
      }
    }
    if (checked) {
      this.object.setOfCheckedId.add(document.path);
    } else {
      this.object.setOfCheckedId.delete(document.path);
    }
    const documents = this.getCurrentData(this.data, this.filters);
    this.object.checked = this.object.setOfCheckedId.size === documents.length;
    this.refreshCheckedStatus();
  }

  refreshCheckedStatus(): void {
    this.object.indeterminate = this.object.setOfCheckedId.size > 0 && !this.object.checked;
    this.reportRun.emit({display: this.object.checked || this.object.indeterminate});
  }

  run(item): void {
    if(!this.preferences.auditLog) {
      this.coreService.post('reporting/reports/run', {
        reportPaths: [item.path]
      }).subscribe({
        next: () => {
          this.coreService.startReport();
        }
      })
    } else {
      this.modal.create({
        nzTitle: undefined,
        nzContent: RunModalComponent,
        nzFooter: null,
        nzAutofocus: null,
        nzData: {reportPaths: [item.path], preferences: this.preferences},
        nzClosable: false,
        nzMaskClosable: false
      });
    }
  }

  runAll(): void {
    this.modal.create({
      nzTitle: undefined,
      nzContent: RunModalComponent,
      nzFooter: null,
      nzAutofocus: null,
      nzData: {reportPaths: Array.from(this.object.setOfCheckedId), preferences: this.preferences},
      nzClosable: false,
      nzMaskClosable: false
    });
  }

  reload(): void {
    if (this.reloadState === 'no') {
      this.reports = [];
      this.data = [];
      this.reloadState = 'yes';
      this.loading = false;
      this.pendingHTTPRequests$.next();
    } else if (this.reloadState === 'yes') {
      this.loading = true;
      this.loadReports();
    }
  }
}




