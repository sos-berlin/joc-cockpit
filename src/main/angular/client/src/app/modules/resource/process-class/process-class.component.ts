import {Component, OnInit, OnDestroy, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {Subscription} from 'rxjs/Subscription';
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

  isLoading: boolean = false;
  loading: boolean;
  schedulerIds: any;
  tree: any = [];
  preferences: any;
  permission: any;
  pageView: any;
  processClasses: any = [];
  processFilters: any = {};
  subscription1: Subscription;
  subscription2: Subscription;
  process_class_expand_to: any;

  @ViewChild(TreeComponent) child;

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
            if ((args[i].eventSnapshots[j].eventType == "FileBasedActivated" || args[i].eventSnapshots[j].eventType == "FileBasedRemoved") && args[i].eventSnapshots[j].objectType === "PROCESSCLASS") {
              this.initTree();
              break;
            } else if (args[i].eventSnapshots[j].eventType === "JobStateChanged") {
              if (this.processClasses.length > 0) {
                for (let x = 0; x < this.processClasses.length; x++) {
                  if (this.processClasses[x].path === args[i].eventSnapshots[j].path) {
                    let obj = {
                      jobschedulerId: this.schedulerIds.selected,
                      folders: [{folder: this.processClasses[x].path, recursive: false}]
                    };
                    this.coreService.post('process_classes', obj).subscribe(res => {
                      //TODO merge
                    })
                  }
                }
              }
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

  private init() {
   this.processFilters = this.coreService.getResourceTab().processClasses;
    if (sessionStorage.preferences)
      this.preferences = JSON.parse(sessionStorage.preferences);
    if (this.authService.scheduleIds)
      this.schedulerIds = JSON.parse(this.authService.scheduleIds);

    if (this.authService.permission)
      this.permission = JSON.parse(this.authService.permission);
    if (localStorage.views)
      this.pageView = JSON.parse(localStorage.views).processClass;

    this.initTree();
  }


  ngOnDestroy() {
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
  }

  private initTree() {
    this.coreService.post('tree', {
      jobschedulerId: this.schedulerIds.selected,
      compact: true,
      types: ["PROCESSCLASS"]
    }).subscribe(res => {
      this.filteredTreeData(this.coreService.prepareTree(res));
      this.isLoading = true;
    }, () => {
      this.isLoading = true;
    });
  }

  private filteredTreeData(output) {
    if (!_.isEmpty(this.process_class_expand_to)) {
      this.tree = output;
      this.navigateToPath();
    } else {
      if (_.isEmpty(this.processFilters.expand_to)) {
        this.tree = output;
        this.processFilters.expand_to = this.tree;
        this.checkExpand();
      } else {
        this.processFilters.expand_to = this.coreService.recursiveTreeUpdate(output, this.processFilters.expand_to);
        this.tree = this.processFilters.expand_to;
        this.loadProcessClass(null);
        this.expandTree();
      }
    }
  }

  private navigateToPath() {
    let self = this;
    this.processClasses = [];
    setTimeout(function () {
      self.tree.forEach(function (value) {
        self.navigatePath(value);
      });
    }, 10);
  }

  private navigatePath(data) {
    if (this.process_class_expand_to) {
      let self = this;
      let node = self.child.getNodeById(data.id);
      if (self.process_class_expand_to.path.indexOf(data.path) != -1) {
        node.expand();
      }
      if ((data.path === this.process_class_expand_to.path)) {
        node.setActiveAndVisible(true);
        self.process_class_expand_to = undefined;
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

  loadProcessClass(status) {
    let self = this;
    let obj = {
      folders: [],
      jobschedulerId: this.schedulerIds.selected
    };

    this.processClasses = [];
    this.loading = true;
    this.tree.forEach(function (value) {
      if (value.isExpanded || value.isSelected)
        self.getExpandTreeForUpdates(value, obj);
    });
    this.getProcessClassList(obj, null);
  }

  private startTraverseNode(data) {
    let self = this;
    data.isSelected = true;
    data.children.forEach(function (a) {
      self.startTraverseNode(a);
    });
  }

  private getProcessClassList(obj, node) {
    let result: any;
    this.coreService.post('process_classes', obj).subscribe(res => {
      this.loading = false;
      result = res;
      result.processClasses.forEach(function (value) {
        value.path1 = value.path.substring(0, value.path.lastIndexOf('/')) || value.path.substring(0, value.path.lastIndexOf('/') + 1);
      });
      this.processClasses = result.processClasses;
      if (node) {
        this.startTraverseNode(node.data);
      }
    }, () => {
      this.loading = false;
    });
  }


  expandNode(node): void {
    this.processClasses = [];
    this.loading = true;

    let obj = {
      jobschedulerId: this.schedulerIds.selected,
      folders: [{folder: node.data.path, recursive: true}]
    };
    this.getProcessClassList(obj, node);
  }

  getProcessClass(data) {
    data.isSelected = true;
    this.loading = true;
    let obj = {
      folders: [{folder: data.path, recursive: false}],
      jobschedulerId: this.schedulerIds.selected
    };

    this.getProcessClassList(obj, null);
  }

  receiveAction($event) {
    if($event.action === 'NODE')
      this.getProcessClass($event.data);
    else
      this.expandNode($event)

  }

  /** ---------------------------- Action ----------------------------------*/

  sortBy(propertyName) {
    this.processFilters.reverse = !this.processFilters.reverse;
    this.processFilters.filter.sortBy = propertyName;
  }

  expandDetails() {

  }

  collapseDetails() {

  }

  /** ---------------------------- Broadcast messages ----------------------------------*/
  receiveMessage($event) {
    this.pageView = $event;
  }

}

