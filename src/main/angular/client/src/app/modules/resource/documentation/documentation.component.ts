import {Component, OnInit, OnDestroy, ViewChild, Input} from '@angular/core';
import {Router} from '@angular/router';
import {NgbActiveModal, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {FileUploader} from 'ng2-file-upload';
import {TranslateService} from '@ngx-translate/core';
import {ToasterService} from 'angular2-toaster';
import {Subscription} from 'rxjs';
import {CoreService} from '../../../services/core.service';
import {AuthService} from '../../../components/guard';
import {DataService} from '../../../services/data.service';
import {TreeComponent} from '../../../components/tree-navigation/tree.component';
import * as _ from 'underscore';

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
  comments: any = {};
  uploader: FileUploader;

  constructor(public activeModal: NgbActiveModal, private coreService: CoreService, public translate: TranslateService, public toasterService: ToasterService) {
    this.uploader = new FileUploader({url: ''});
  }

  ngOnInit() {
    this.comments.radio = 'predefined';
    if (sessionStorage.comments) {
      this.messageList = JSON.parse(sessionStorage.comments);
    }
    if (sessionStorage.$SOS$FORCELOGING == 'true') {
      this.required = true;
    }
  }

  onSubmit() {

  }

  onFileSelected(event: any): void {

  }

  cancel() {
    this.activeModal.close('');
  }
}

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
  object: any = {documents: []};
  permission: any = {};
  pageView: any;
  documents: any = [];
  documentFilters: any = {};
  document_expand_to: any = {};
  documentTypes = ['ALL', 'HTML', 'XML', 'XSL', 'XSD', 'JAVASCRIPT', 'JSON', 'CSS', 'MARKDOWN', 'GIF', 'JPEG', 'PNG'];
  subscription: Subscription;

  @ViewChild(TreeComponent) child;

  constructor(private router: Router, private authService: AuthService, public coreService: CoreService, private modalService: NgbModal, private dataService: DataService) {
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

  loadDocument() {
    this.object.documents = [];
    let obj = {folders: [], types: [], jobschedulerId: this.schedulerIds.selected};
    this.documents = [];
    this.loading = true;
    for (let x = 0; x < this.tree.length; x++) {
      if (this.tree[x].isExpanded || this.tree[x].isSelected) {
        this.getExpandTreeForUpdates(this.tree[x], obj);
      }
    }

    if (this.documentFilters.filter.type !== 'ALL') {
      obj.types.push(this.documentFilters.filter.type);
    }
    this.getDocumentationsList(obj, null);
  }

  private getExpandTreeForUpdates(data, obj) {
    const self = this;
    if (data.isSelected) {
      obj.folders.push({folder: data.path, recursive: false});
    }
    for (let x = 0; x < data.length; x++) {
      if (data[x].isExpanded || data[x].isSelected) {
        self.getExpandTreeForUpdates(data[x], obj);
      }
    }
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
    this.coreService.getResourceTab().state = 'documentations';
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
    if (!_.isEmpty(this.document_expand_to)) {
      this.tree = output;
      if (this.tree.length > 0) {
        this.navigateToPath();
      }
    } else {
      if (_.isEmpty(this.documentFilters.expand_to)) {
        this.tree = output;
        this.documentFilters.expand_to = this.tree;
        this.checkExpand();
      } else {
        this.documentFilters.expand_to = this.coreService.recursiveTreeUpdate(output, this.documentFilters.expand_to);
        this.tree = this.documentFilters.expand_to;
        this.loadDocument();
        if (this.tree.length > 0) {
          this.expandTree();
        }
      }
    }
  }

  private navigateToPath() {
    this.documents = [];
    setTimeout(() => {
      for (let x = 0; x < this.tree.length; x++) {
        this.navigatePath(this.tree[x]);
      }
    }, 10);
  }

  private navigatePath(data) {
    const self = this;
    if (this.document_expand_to && self.child) {

      let node = self.child.getNodeById(data.id);
      if (self.document_expand_to.path.indexOf(data.path) != -1) {
        node.expand();
      }
      if ((data.path === this.document_expand_to.path)) {
        node.setActiveAndVisible(true);
        self.document_expand_to = undefined;
      }
      if (data.children && data.children.length > 0) {
        for (let x = 0; x < data.children.length; x++) {
          self.navigatePath(data.children[x]);
        }
      }
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

  checkAll() {
    if (this.object.checkbox && this.documents.length > 0) {
      this.object.documents = this.documents.slice((this.preferences.entryPerPage * (this.documentFilters.currentPage - 1)), (this.preferences.entryPerPage * this.documentFilters.currentPage));
    } else {
      this.object.documents = [];
    }
  }

  checkMainCheckbox() {
    if (this.object.documents && this.object.documents.length > 0) {
      this.object.checkbox = this.object.documents.length === this.documents.slice((this.preferences.entryPerPage * (this.documentFilters.currentPage - 1)), (this.preferences.entryPerPage * this.documentFilters.currentPage)).length;
    } else {
      this.object.checkbox = false;
    }
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

  showDocumentUsage(document) {
    /*    vm.document = angular.copy(document);
        ResourceService.documentationUsed({
          documentation: vm.document.path,
          jobschedulerId: vm.schedulerIds.selected
        }).then(function (res) {
          vm.document.usedIn = res.objects;

        });
        var modalInstance1 = $uibModal.open({
          templateUrl: 'modules/core/template/show-usage-document-dialog.html',
          controller: 'DialogCtrl',
          scope: vm,
          backdrop: 'static'
        });
        modalInstance1.result.then(function () {

        }, function () {

        });*/
  }

  exportDocument(document) {
    /*    let obj = {jobschedulerId: vm.schedulerIds.selected, documentations: []};
        if (document) {
          obj.documentations.push(document.path);
        } else {
          angular.forEach(vm.object.documents, function (value) {
            obj.documentations.push(value.path);
          });
        }
        ResourceService.exportDocumentations(obj).then(function (res) {
          $("#tmpFrame").attr('src', './api/documentations/export?jobschedulerId=' + vm.schedulerIds.selected + '&filename=' + res.filename + '&accessToken=' + SOSAuth.accessTokenId);
        });*/
  }

  importDocument() {
    const modalRef = this.modalService.open(ImportModalComponent, {backdrop: 'static', size: 'lg'});
    modalRef.componentInstance.schedulerId = this.schedulerIds.selected;
    modalRef.componentInstance.display = this.preferences.auditLog;
    modalRef.result.then(() => {

    }, function () {

    });
  }

  deleteDocumentations(document) {
/*    let obj = {};
    obj.jobschedulerId = vm.schedulerIds.selected;
    obj.documentations = [];
    if (document) {
      obj.documentations.push(document.path);
    } else {
      angular.forEach(vm.object.documents, function (value) {
        obj.documentations.push(value.path);
      });
    }
    vm.document = angular.copy(document);
    if (document) {
      vm.documentArr = undefined;
      vm.document.delete = true;
      ResourceService.documentationUsed({
        documentation: vm.document.path,
        jobschedulerId: vm.schedulerIds.selected
      }).then(function (res) {
        vm.document.usedIn = res.objects;

      });
    } else {
      vm.documentArr = angular.copy(vm.object.documents);
      angular.forEach(vm.documentArr, function (value) {
        ResourceService.documentationUsed({
          documentation: value.path,
          jobschedulerId: vm.schedulerIds.selected
        }).then(function (res) {
          value.usedIn = res.objects;
        });
      });

    }*/
    // this.deleteDocumentFn(obj, document);
  }

  deleteDocument(obj, document) {
    /*    ResourceService.deleteDocumentations(obj).then(function () {
          if (document) {
            for (let i = 0; i < vm.allDocumentations.length; i++) {
              if (vm.allDocumentations[i].path === document.path) {
                vm.allDocumentations.splice(i, 1);
                break;
              }
            }
          } else {
            for (let i = 0; i < vm.object.documents.length; i++) {
              for (let j = 0; j < vm.allDocumentations.length; j++) {
                if (vm.allDocumentations[j].path === vm.object.documents[i].path) {
                  vm.allDocumentations.splice(j, 1);
                  break;
                }
              }
            }
          }
        });*/
  }

  private deleteDocumentFn(obj, document) {
    /*    const self = this;
        if (vm.userPreferences.auditLog) {
          vm.comments = {};
          vm.comments.radio = 'predefined';
          vm.comments.type = 'Documentation';
          vm.comments.operation = 'Delete';
          if (document) {
            vm.comments.name = document.path;
          } else {
            vm.comments.name = '';
            angular.forEach(vm.object.documents, function (value, index) {
              if (index == vm.object.documents.length - 1) {
                vm.comments.name = vm.comments.name + ' ' + value.path;
              } else {
                vm.comments.name = value.path + ', ' + vm.comments.name;
              }
            });
          }
          var modalInstance = $uibModal.open({
            templateUrl: 'modules/core/template/comment-dialog.html',
            controller: 'DialogCtrl',
            scope: vm,
            backdrop: 'static'
          });
          modalInstance.result.then(function () {
            obj.auditLog = {};
            if (vm.comments.comment)
              obj.auditLog.comment = vm.comments.comment;
            if (vm.comments.timeSpent)
              obj.auditLog.timeSpent = vm.comments.timeSpent;

            if (vm.comments.ticketLink)
              obj.auditLog.ticketLink = vm.comments.ticketLink;
            self.deleteDocument(obj, document);
          }, function () {

          });

        } else {
          var modalInstance1 = $uibModal.open({
            templateUrl: 'modules/core/template/confirm-dialog.html',
            controller: 'DialogCtrl1',
            scope: vm,
            backdrop: 'static'
          });
          modalInstance1.result.then(function () {
            self.deleteDocument(obj, document);
          }, function () {

          });
        }*/
  }
}

