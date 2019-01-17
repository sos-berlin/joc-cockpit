import {Component, OnInit, OnDestroy, ViewChild} from '@angular/core';
import {Subscription} from 'rxjs';
import {CoreService} from '../../../services/core.service';
import {AuthService} from '../../../components/guard';
import {DataService} from '../../../services/data.service';
import {TreeComponent} from '../../../components/tree-navigation/tree.component';

import * as _ from 'underscore';

// Main Component
@Component({
  selector: 'app-document',
  templateUrl: 'documentation.component.html',
  styleUrls: ['./documentation.component.css'],

})
export class DocumentationComponent implements OnInit, OnDestroy {

  isLoading = false;
  loading: boolean;
  schedulerIds: any = {};
  tree: any = [];
  preferences: any = {};
  permission: any = {};
  pageView: any;
  documents: any = [];
  documentFilters: any = {};
  documentTypes = ['ALL', 'HTML', 'XML', 'XSL', 'XSD', 'JAVASCRIPT', 'JSON', 'CSS', 'MARKDOWN', 'GIF', 'JPEG', 'PNG'];
  subscription1: Subscription;
  subscription2: Subscription;

  @ViewChild(TreeComponent) child;

  constructor(private authService: AuthService, public coreService: CoreService, private dataService: DataService) {
    this.subscription2 = dataService.refreshAnnounced$.subscribe(() => {
      this.init();
    });
  }

  ngOnInit() {
    this.init();
  }

  ngOnDestroy() {
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
  }

  initTree() {
    this.coreService.post('tree', {
      jobschedulerId: this.schedulerIds.selected,
      compact: true,
      types: ['DOCUMENTATION']
    }).subscribe(res => {
      this.filteredTreeData(this.coreService.prepareTree(res));
      this.isLoading = true;
    }, () => {
      this.isLoading = true;
    });
  }

  expandNode(node): void {
    this.navFullTree();
    const someNode = this.child.getNodeById(node.data.id);
    someNode.expandAll();
    this.documents = [];
    this.loading = true;

    let obj = {
      jobschedulerId: this.schedulerIds.selected,
      folders: [{folder: node.data.path, recursive: true}],
      compact: true
    };

    this.getDocumentationsList(obj, node);
  }

  receiveAction($event) {
    if ($event.action === 'NODE') {
      this.getDocumentations($event.data);
    } else {
      this.expandNode($event);
    }
  }

  getDocumentations(data) {
    data.isSelected = true;
    this.loading = true;
    let obj = {
      folders: [{folder: data.path, recursive: false}],
      jobschedulerId: this.schedulerIds.selected,
      compact: true
    };

    this.getDocumentationsList(obj, null);
  }

  sortBy(propertyName) {
    this.documentFilters.reverse = !this.documentFilters.reverse;
    this.documentFilters.filter.sortBy = propertyName;
  }

  /** ---------------------------- Action ----------------------------------*/

  receiveMessage($event) {
    this.pageView = $event;
  }

  private init() {
    this.documentFilters = this.coreService.getResourceTab().documents;
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

  private filteredTreeData(output) {
    if (_.isEmpty(this.documentFilters.expand_to)) {
      this.tree = output;
      this.documentFilters.expand_to = this.tree;
      this.checkExpand();
    } else {
      this.documentFilters.expand_to = this.coreService.recursiveTreeUpdate(output, this.documentFilters.expand_to);
      this.tree = this.documentFilters.expand_to;
      this.expandTree();
    }
  }

  private expandTree() {
    const self = this;
    setTimeout(() => {
      self.tree.forEach((data) => {
        recursive(data);
      });
    }, 10);

    function recursive(data) {
      if (data.isExpanded && self.child) {
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
    setTimeout(() => {
      if (this.child && this.child.getNodeById(1)) {
        const node = this.child.getNodeById(1);
        node.expand();
        node.setActiveAndVisible(true);
      }
    }, 10);
  }

  private startTraverseNode(data) {
    data.isSelected = true;
    data.children.forEach((a) => {
      this.startTraverseNode(a);
    });
  }

  private getDocumentationsList(obj, node) {
    let result: any;
    this.coreService.post('documentations', obj).subscribe(res => {
      this.loading = false;
      result = res;
      result.documentations.forEach((value) => {
        value.path1 = value.path.substring(0, value.path.lastIndexOf('/')) || value.path.substring(0, value.path.lastIndexOf('/') + 1);
      });
      this.documents = result.documentations;
      if (node) {
        this.startTraverseNode(node.data);
      }
    }, () => {
      this.loading = false;
    });
  }

  private traverseTree(data) {
    data.children.forEach((value) => {
      value.isSelected = false;
      this.traverseTree(value);
    });
  }

  private navFullTree() {
    this.tree.forEach((value) => {
      value.isSelected = false;
      this.traverseTree(value);
    });
  }

}

