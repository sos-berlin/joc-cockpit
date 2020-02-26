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
import {CommentModalComponent} from '../../../components/comment-modal/comment.component';
import {ConfirmModalComponent} from '../../../components/comfirm-modal/confirm.component';
import {TreeModalComponent} from '../../../components/tree-modal/tree.component';
import * as _ from 'underscore';

declare const $;
const API_URL = './api/';

@Component({
  selector: 'app-ngbd-modal-content',
  templateUrl: './show-dialog.html'
})
export class ShowModalComponent {
  @Input() document: any;

  constructor(public activeModal: NgbActiveModal, public coreService: CoreService) {
  }
}

@Component({
  selector: 'app-ngbd-modal-content',
  templateUrl: './import-dialog.html'
})
export class ImportModalComponent implements OnInit {

  @Input() schedulerId: any;
  @Input() display: any;
  @Input() selectedPath: any;

  uploader: FileUploader;
  fileLoading = false;
  messageList: any;
  required = false;
  submitted = false;
  comments: any = {};
  document = {path: ''};

  constructor(public activeModal: NgbActiveModal, private coreService: CoreService, public modalService: NgbModal, private authService: AuthService, public translate: TranslateService, public toasterService: ToasterService) {
    this.uploader = new FileUploader({
      url: API_URL + 'documentations/import'
    });
  }

  ngOnInit() {
    this.comments.radio = 'predefined';
    if (sessionStorage.comments) {
      this.messageList = JSON.parse(sessionStorage.comments);
    }
    if (sessionStorage.$SOS$FORCELOGING == 'true') {
      this.required = true;
    }

    this.document.path = this.selectedPath;
    this.uploader.onBeforeUploadItem = (item: any) => {
      let obj: any = {
        folder: this.document.path,
        jobschedulerId: this.schedulerId,
        accessToken: this.authService.accessTokenId,
        name: item.file.name
      };
      if (this.comments.comment) {
        obj.comment = this.comments.comment;
      }
      if (this.comments.timeSpent) {
        obj.timeSpent = this.comments.timeSpent;
      }
      if (this.comments.ticketLink) {
        obj.ticketLink = this.comments.ticketLink;
      }
      item.file.name = encodeURIComponent(item.file.name);
      this.uploader.options.additionalParameter = obj;
    };

    this.uploader.onCompleteItem = (fileItem: any, response, status, headers) => {
      if (status === 200) {
        this.activeModal.close('success');
      }
    };

    this.uploader.onErrorItem = (fileItem, response: any, status, headers) => {
      if (response.error) {
        this.toasterService.pop('error', response.error.code, response.error.message);
      }
    };
  }

  cancel() {
    this.activeModal.close('');
  }

  getFolderTree() {
    const modalRef = this.modalService.open(TreeModalComponent, {backdrop: 'static'});
    modalRef.componentInstance.schedulerId = this.schedulerId;
    modalRef.componentInstance.paths = [];
    modalRef.componentInstance.isCollapsed = true;
    modalRef.componentInstance.showCheckBox = false;
    modalRef.componentInstance.type = 'DOCUMENTATION';
    modalRef.result.then((path) => {
      this.document.path = path;
    }, (reason) => {
      console.log('close...', reason);
    });
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
  selectedPath: string;

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
    for (let x = 0; x < data.children.length; x++) {
      if (data.children[x].isExpanded || data.children[x].isSelected) {
        self.getExpandTreeForUpdates(data.children[x], obj);
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
    this.selectedPath = node.data.path;
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
    this.coreService.post('documentations', obj).subscribe((res: any) => {
      this.loading = false;
      res.documentations.forEach((value) => {
        value.path1 = value.path.substring(0, value.path.lastIndexOf('/')) || value.path.substring(0, value.path.lastIndexOf('/') + 1);
      });
      this.documents = res.documentations;
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

  previewDocument(document) {
    const link = API_URL + 'documentation/preview?documentation=' + encodeURIComponent(document.path) + '&accessToken=' + this.authService.accessTokenId + '&jobschedulerId=' + this.schedulerIds.selected;
    if (this.preferences.isDocNewWindow === 'newWindow') {
      window.open(link, '', 'top=0,left=0,scrollbars=yes,resizable=yes,status=no,toolbar=no,menubar=no', true);
    } else {
      window.open(link, '_blank');
    }
  }

  showDocumentUsage(document) {
    let documentObj = _.clone(document);
    this.coreService.post('documentation/used', {
      documentation: document.path,
      jobschedulerId: this.schedulerIds.selected
    }).subscribe((res: any) => {
      documentObj.usedIn = res.objects || [];

      const modalRef = this.modalService.open(ShowModalComponent, {backdrop: 'static', size: 'lg'});
      modalRef.componentInstance.document = documentObj;
      modalRef.result.then(() => {

      }, () => {

      });
    });
  }

  exportDocument(document) {
    let obj = {jobschedulerId: this.schedulerIds.selected, documentations: []};
    if (document) {
      obj.documentations.push(document.path);
    } else {
      this.object.documents.forEach((value) => {
        obj.documentations.push(value.path);
      });
    }
    this.coreService.post('documentations/export/info', obj).subscribe((res: any) => {
      $('#tmpFrame').attr('src', API_URL + 'documentations/export?jobschedulerId=' +
        this.schedulerIds.selected + '&filename=' + res.filename + '&accessToken=' +
        this.authService.accessTokenId);
    });
  }

  importDocument() {
    const modalRef = this.modalService.open(ImportModalComponent, {backdrop: 'static', size: 'lg'});
    modalRef.componentInstance.schedulerId = this.schedulerIds.selected;
    modalRef.componentInstance.display = this.preferences.auditLog;
    modalRef.componentInstance.selectedPath = this.selectedPath;
    modalRef.result.then((res) => {
      if (res === 'success') {
        console.log(res);
        this.init();
      }
    }, function () {

    });
  }

  deleteDocumentations(document) {
    let obj: any = {
      jobschedulerId: this.schedulerIds.selected,
      documentations: []
    };
    if (document) {
      obj.documentations.push(document.path);
    } else {
      this.object.documents.forEach((value) => {
        obj.documentations.push(value.path);
      });
    }
    let documentObj = _.clone(document);
    if (document) {
      documentObj.delete = true;
      this.coreService.post('documentation/used', {
        documentation: documentObj.path,
        jobschedulerId: this.schedulerIds.selected
      }).subscribe((res: any) => {
        documentObj.usedIn = res.objects || [];
        this.deleteDocumentFn(obj, documentObj, null);
      });
    } else {
      let documentArr = _.clone(this.object.documents);
      for (let i = 0; i < documentArr.length; i++) {
        this.coreService.post('documentation/used', {
          documentation: documentArr[i].path,
          jobschedulerId: this.schedulerIds.selected
        }).subscribe((res: any) => {
          documentArr[i].usedIn = res.objects || [];
          if (i === documentArr.length - 1) {
            this.deleteDocumentFn(obj, null, documentArr);
          }
        });
      }
    }
  }

  deleteDocument(obj, document) {
    this.coreService.post('documentations/delete', obj).subscribe(res => {
      if (document) {
        for (let i = 0; i < this.documents.length; i++) {
          if (this.documents[i].path === document.path) {
            this.documents.splice(i, 1);
            break;
          }
        }
      } else {
        for (let i = 0; i < this.object.documents.length; i++) {
          for (let j = 0; j < this.documents.length; j++) {
            if (this.documents[j].path === this.object.documents[i].path) {
              this.documents.splice(j, 1);
              break;
            }
          }
        }
      }
    });
  }

  private deleteDocumentFn(obj, document, arr) {
    const self = this;
    if (this.preferences.auditLog) {
      let comments = {
        radio: 'predefined',
        type: 'Documentation',
        operation: 'Delete',
        name: document ? document.path : ''
      };
      if (!document) {
        this.object.documents.forEach((value, index) => {
          if (index === this.object.documents.length - 1) {
            comments.name = comments.name + ' ' + value.path;
          } else {
            comments.name = value.path + ', ' + comments.name;
          }
        });
      }

      const modalRef = this.modalService.open(CommentModalComponent, {backdrop: 'static'});
      modalRef.componentInstance.document = document;
      modalRef.componentInstance.documentArr = arr;
      modalRef.componentInstance.comments = comments;
      modalRef.componentInstance.obj = obj;
      modalRef.componentInstance.url = 'documentations/delete';
      modalRef.result.then(() => {
          this.deleteDocument(obj, document);
      }, function () {

      });

    } else {
      const modalRef = this.modalService.open(ConfirmModalComponent, {backdrop: 'static'});

      modalRef.componentInstance.type = 'Delete';
      if(document) {
        modalRef.componentInstance.title = 'delete';
        modalRef.componentInstance.message = 'deleteDocument';
        modalRef.componentInstance.document = document;
        modalRef.componentInstance.objectName = document.name;
      }else {
        modalRef.componentInstance.title = 'deleteAllDocument';
        modalRef.componentInstance.message = 'deleteAllDocument';
        modalRef.componentInstance.documentArr = arr;
      }
      modalRef.result.then(() => {
        this.deleteDocument(obj, null);
      }, function () {

      });
    }
  }
}

