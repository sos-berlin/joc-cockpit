import {Component, OnInit, OnDestroy, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {CoreService} from '../../../services/core.service';
import {AuthService} from '../../../components/guard';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {DataService} from '../../../services/data.service';
import {TreeComponent} from '../../../components/tree-navigation/tree.component';

import * as _ from 'underscore';

//Main Component
@Component({
  selector: 'app-process-class',
  templateUrl: 'process-class.component.html',
  styleUrls: ['./process-class.component.css'],

})
export class ProcessClassComponent implements OnInit, OnDestroy {

  isLoading = false;
  loading: boolean;
  schedulerIds: any = {};
  tree: any = [];
  preferences: any = {};
  permission: any = {};
  pageView: any;
  processClasses: any = [];
  processFilters: any = {};
  subscription1: Subscription;
  subscription2: Subscription;
  checked = false;
  indeterminate = false;
  listOfCurrentPageData: any = [];
  setOfCheckedId = new Set<number>();

  @ViewChild(TreeComponent, {static: false}) child;

  constructor(private router: Router, private authService: AuthService, public coreService: CoreService, private modalService: NgbModal, private dataService: DataService) {
    this.subscription1 = dataService.eventAnnounced$.subscribe(res => {
      this.refresh(res);
    });
    this.subscription2 = dataService.refreshAnnounced$.subscribe(() => {
      this.init();
    });
  }

  ngOnInit() {
    this.init();
  }

  ngOnDestroy() {
    if (this.child) {
      this.processFilters.expandedKeys = this.child.defaultExpandedKeys;
      this.processFilters.selectedkeys = this.child.defaultSelectedKeys;
    }
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
  }

  loadProcessClass(status) {
    let obj = {
      folders: [],
      jobschedulerId: this.schedulerIds.selected
    };

    this.processClasses = [];
    this.loading = true;
    let paths = [];
    if (this.child) {
      paths = this.child.defaultSelectedKeys;
    } else {
      paths = this.processFilters.selectedkeys;
    }
    for (let x = 0; x < paths.length; x++) {
      obj.folders.push({folder: paths[x], recursive: false});
    }
    this.getProcessClassList(obj);
  }

  getProcessClass(data, recursive) {
    data.isSelected = true;
    this.loading = true;
    let obj = {
      folders: [{folder: data.path, recursive: recursive}],
      jobschedulerId: this.schedulerIds.selected
    };
    this.getProcessClassList(obj);
  }

  receiveAction($event) {
    this.getProcessClass($event, $event.action !== 'NODE');
  }

  /** ---------------------------- Action ----------------------------------*/

  sortBy(propertyName) {
    this.processFilters.reverse = !this.processFilters.reverse;
    this.processFilters.filter.sortBy = propertyName.key;
  }

  onCurrentPageDataChange($event) {
    this.listOfCurrentPageData = $event;
    console.log(this.listOfCurrentPageData);
    this.refreshCheckedStatus();
  }

  refreshCheckedStatus(): void {
    //this.checked = this.listOfCurrentPageData.every(item => this.setOfCheckedId.has(item.id));
    this.indeterminate = this.listOfCurrentPageData.some(item => this.setOfCheckedId.has(item.id)) && !this.checked;
    console.log(this.indeterminate);
  }

 expandDetails() {
   this.processClasses.forEach((value) => {
     value.show = true;
   });
 }

  collapseDetails() {
    this.processClasses.forEach((value) => {
      value.show = false;
    });
  }

  /** ---------------------------- Broadcast messages ----------------------------------*/
  receiveMessage($event) {
    this.pageView = $event;
  }

  private refresh(args) {
    for (let i = 0; i < args.length; i++) {
      if (args[i].jobschedulerId == this.schedulerIds.selected) {
        if (args[i].eventSnapshots && args[i].eventSnapshots.length > 0) {
          for (let j = 0; j < args[i].eventSnapshots.length; j++) {
            if ((args[i].eventSnapshots[j].eventType == 'FileBasedActivated' || args[i].eventSnapshots[j].eventType == 'FileBasedRemoved') && args[i].eventSnapshots[j].objectType === 'PROCESSCLASS') {
              this.initTree();
              break;
            } else if (args[i].eventSnapshots[j].eventType === 'JobStateChanged') {
              if (this.processClasses.length > 0) {
                for (let x = 0; x < this.processClasses.length; x++) {
                  if (this.processClasses[x].path === args[i].eventSnapshots[j].path) {
                    let obj = {
                      jobschedulerId: this.schedulerIds.selected,
                      folders: [{folder: this.processClasses[x].path, recursive: false}]
                    };
                    this.coreService.post('process_classes', obj).subscribe(res => {
                      //TODO merge
                    });
                  }
                }
              }
            }
          }
        }
        break;
      }
    }
  }

  private init() {
    this.processFilters = this.coreService.getResourceTab().processClasses;
    this.coreService.getResourceTab().state = 'processClass';
    if (sessionStorage.preferences) {
      this.preferences = JSON.parse(sessionStorage.preferences);
    }
    this.schedulerIds = JSON.parse(this.authService.scheduleIds) || {};
    this.permission = JSON.parse(this.authService.permission) || {};
    if (localStorage.views) {
      this.pageView = JSON.parse(localStorage.views).processClass;
    }
    this.initTree();
  }

  private initTree() {
    this.coreService.post('tree', {
      jobschedulerId: this.schedulerIds.selected,
      compact: true,
      types: ['PROCESSCLASS']
    }).subscribe(res => {
      this.tree = this.coreService.prepareTree(res);
      this.loadProcessClass(null);
      this.isLoading = true;
    }, () => {
      this.isLoading = true;
    });
  }

  private getProcessClassList(obj) {
    let result: any;
    this.coreService.post('process_classes', obj).subscribe(res => {
      this.loading = false;
      result = res;
      result.processClasses.forEach((value) => {
        value.path1 = value.path.substring(0, value.path.lastIndexOf('/')) || value.path.substring(0, value.path.lastIndexOf('/') + 1);
      });
      this.processClasses = result.processClasses;
    }, () => {
      this.loading = false;
    });
  }
}

