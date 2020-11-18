import {Component, OnInit, OnDestroy, ViewChild, Input} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
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
  @Input() nodes: any;

  uploader: FileUploader;
  messageList: any;
  required = false;
  submitted = false;
  comments: any = {};
  document = {path: ''};

  constructor(public activeModal: NgbActiveModal, private coreService: CoreService, private authService: AuthService, public translate: TranslateService, public toasterService: ToasterService) {
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
        controllerId: this.schedulerId,
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

  displayWith(data): string {
    return data.key;
  }
}

@Component({
  selector: 'app-single-document',
  templateUrl: './single-documentation.component.html'
})
export class SingleDocumentationComponent implements OnInit, OnDestroy {
  loading: boolean;
  schedulerId: any = {};
  preferences: any = {};
  permission: any = {};
  documents: any = [];
  documentFilters: any = {};
  subscription: Subscription;
  path: string;


  constructor(private router: Router, private authService: AuthService, public coreService: CoreService,
              private modalService: NgbModal, private dataService: DataService, private route: ActivatedRoute) {
    this.subscription = dataService.eventAnnounced$.subscribe(res => {
      console.log(res);
    });
  }

  ngOnInit() {
    this.path = this.route.snapshot.queryParamMap.get('path');
    this.schedulerId = this.route.snapshot.queryParamMap.get('scheduler_id');
    if (sessionStorage.preferences) {
      this.preferences = JSON.parse(sessionStorage.preferences);
    }
    this.permission = JSON.parse(this.authService.permission) || {};
    this.getDocumentationsList({
      controllerId: this.schedulerId,
      documentations: [this.path]
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private getDocumentationsList(obj) {
    this.coreService.post('documentations', obj).subscribe((res: any) => {
      this.loading = false;
      this.documents = res.documentations;
    }, () => {
      this.loading = false;
    });
  }

  /** ---------------------------- Action ----------------------------------*/

  previewDocument(document) {
    const link = API_URL + 'documentation/preview?documentation=' + encodeURIComponent(document.path) + '&accessToken=' + this.authService.accessTokenId + '&controllerId=' + this.schedulerId;
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
      controllerId: this.schedulerId
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
    let obj = {controllerId: this.schedulerId, documentations: []};
    if (document) {
      obj.documentations.push(document.path);
    }
    this.coreService.post('documentations/export/info', obj).subscribe((res: any) => {
      $('#tmpFrame').attr('src', API_URL + 'documentations/export?controllerId=' +
        this.schedulerId + '&filename=' + res.filename + '&accessToken=' +
        this.authService.accessTokenId);
    });
  }

  deleteDocumentations() {
    let obj: any = {
      controllerId: this.schedulerId,
      documentations: [this.path]
    };
    this.coreService.post('documentation/used', {
      documentation: this.path,
      controllerId: this.schedulerId
    }).subscribe((res: any) => {
      this.deleteDocumentFn(obj, {usedIn : res.objects || [], path: this.path});
    });
  }

  deleteDocument(obj) {
    this.coreService.post('documentations/delete', obj).subscribe(res => {
      this.documents = [];
    });
  }

  private deleteDocumentFn(obj, document) {
    if (this.preferences.auditLog) {
      let comments = {
        radio: 'predefined',
        type: 'Documentation',
        operation: 'Delete',
        name: document ? document.path : ''
      };

      const modalRef = this.modalService.open(CommentModalComponent, {backdrop: 'static'});
      modalRef.componentInstance.comments = comments;
      modalRef.componentInstance.obj = obj;
      modalRef.componentInstance.url = 'documentations/delete';
      modalRef.result.then(() => {
        this.deleteDocument(obj);
      }, function () {

      });

    } else {
      const modalRef = this.modalService.open(ConfirmModalComponent, {backdrop: 'static'});
      modalRef.componentInstance.type = 'Delete';
      modalRef.componentInstance.title = 'delete';
      modalRef.componentInstance.message = 'deleteDocument';
      modalRef.componentInstance.document = document;
      modalRef.componentInstance.objectName = document.name;
      modalRef.result.then(() => {
        this.deleteDocument(obj);
      }, function () {

      });
    }
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
  sideView: any = {};
  documentTypes = ['ALL', 'HTML', 'XML', 'XSL', 'XSD', 'JAVASCRIPT', 'JSON', 'CSS', 'MARKDOWN', 'GIF', 'JPEG', 'PNG'];
  subscription: Subscription;
  selectedPath: string;

  @ViewChild(TreeComponent, {static: false}) child;

  constructor(private router: Router, private authService: AuthService, public coreService: CoreService, private modalService: NgbModal, private dataService: DataService) {
    this.subscription = dataService.refreshAnnounced$.subscribe(() => {
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
      this.documentFilters.expandedKeys = this.child.defaultExpandedKeys;
      this.documentFilters.selectedkeys = this.child.defaultSelectedKeys;
    }
    this.subscription.unsubscribe();
  }

  initTree() {
    this.coreService.post('tree', {
      controllerId: this.schedulerIds.selected,
      types: ['DOCUMENTATION']
    }).subscribe(res => {
      this.tree = this.coreService.prepareTree(res, true);
      if(this.tree.length) {
        this.loadDocument();
      }
      this.isLoading = true;
    }, () => {
      this.isLoading = true;
    });
  }

  loadDocument() {
    this.object.documents = [];
    let obj = {folders: [], types: [], controllerId: this.schedulerIds.selected};
    this.documents = [];
    this.loading = true;
    let paths = [];
    if (this.child) {
      paths = this.child.defaultSelectedKeys;
    } else {
      paths = this.documentFilters.selectedkeys;
    }
    for (let x = 0; x < paths.length; x++) {
      obj.folders.push({folder: paths[x], recursive: false});
    }
    if (this.documentFilters.filter.type !== 'ALL') {
      obj.types.push(this.documentFilters.filter.type);
    }
    this.getDocumentationsList(obj);
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

  private getDocumentationsList(obj) {
    this.coreService.post('documentations', obj).subscribe((res: any) => {
      this.loading = false;
      res.documentations.forEach((value) => {
        value.path1 = value.path.substring(0, value.path.lastIndexOf('/')) || value.path.substring(0, value.path.lastIndexOf('/') + 1);
      });
      this.documents = res.documentations;
    }, () => {
      this.loading = false;
    });
  }

  receiveAction($event) {
    this.getDocumentations($event, $event.action !== 'NODE');
  }

  getDocumentations(data, recursive) {
    data.isSelected = true;
    this.loading = true;
    let obj = {
      folders: [{folder: data.path, recursive: recursive}],
      controllerId: this.schedulerIds.selected,
      compact: true
    };

    this.getDocumentationsList(obj);
  }


  /** ---------------------------- Action ----------------------------------*/

  pageIndexChange($event) {
    this.documentFilters.currentPage = $event;
  }

  pageSizeChange($event) {
    this.documentFilters.entryPerPage = $event;
  }

  sort(propertyName) {
    this.documentFilters.reverse = !this.documentFilters.reverse;
    this.documentFilters.filter.sortBy = propertyName;
  }

  receiveMessage($event) {
    this.pageView = $event;
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

  previewDocument(document) {
    const link = API_URL + 'documentation/preview?documentation=' + encodeURIComponent(document.path) + '&accessToken=' + this.authService.accessTokenId + '&controllerId=' + this.schedulerIds.selected;
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
      controllerId: this.schedulerIds.selected
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
    let obj = {controllerId: this.schedulerIds.selected, documentations: []};
    if (document) {
      obj.documentations.push(document.path);
    } else {
      this.object.documents.forEach((value) => {
        obj.documentations.push(value.path);
      });
    }
    this.coreService.post('documentations/export/info', obj).subscribe((res: any) => {
      $('#tmpFrame').attr('src', API_URL + 'documentations/export?controllerId=' +
        this.schedulerIds.selected + '&filename=' + res.filename + '&accessToken=' +
        this.authService.accessTokenId);
    });
  }

  importDocument() {
    const modalRef = this.modalService.open(ImportModalComponent, {backdrop: 'static', size: 'lg'});
    modalRef.componentInstance.schedulerId = this.schedulerIds.selected;
    modalRef.componentInstance.display = this.preferences.auditLog;
    modalRef.componentInstance.selectedPath = this.selectedPath;
    modalRef.componentInstance.nodes = this.tree;
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
      controllerId: this.schedulerIds.selected,
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
        controllerId: this.schedulerIds.selected
      }).subscribe((res: any) => {
        documentObj.usedIn = res.objects || [];
        this.deleteDocumentFn(obj, documentObj, null);
      });
    } else {
      let documentArr = _.clone(this.object.documents);
      for (let i = 0; i < documentArr.length; i++) {
        this.coreService.post('documentation/used', {
          documentation: documentArr[i].path,
          controllerId: this.schedulerIds.selected
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
      if (document) {
        modalRef.componentInstance.title = 'delete';
        modalRef.componentInstance.message = 'deleteDocument';
        modalRef.componentInstance.document = document;
        modalRef.componentInstance.objectName = document.name;
      } else {
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

