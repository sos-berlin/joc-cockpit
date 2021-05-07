import {Component, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
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
import {SearchPipe} from '../../../pipes/core.pipe';

const API_URL = './api/';

@Component({
  selector: 'app-show-modal-content',
  templateUrl: './show-dialog.html'
})
export class ShowModalComponent {
  @Input() document: any;

  constructor(public activeModal: NzModalRef, public coreService: CoreService) {
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
  document = {path: '', path1: ''};

  constructor(public activeModal: NzModalRef, private coreService: CoreService, private authService: AuthService,
              public translate: TranslateService, public toasterService: ToasterService) {
    this.uploader = new FileUploader({
      url: API_URL + 'documentations/import'
    });
  }

  ngOnInit(): void {
    this.comments.radio = 'predefined';
    if (sessionStorage.comments) {
      this.messageList = JSON.parse(sessionStorage.comments);
    }
    if (sessionStorage.$SOS$FORCELOGING == 'true') {
      this.required = true;
    }

    this.document.path = this.selectedPath;
    this.uploader.onBeforeUploadItem = (item: any) => {
      const obj: any = {
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
      const res = typeof response === 'string' ? JSON.parse(response) : response;
      if (res.error) {
        this.toasterService.pop('error', res.error.code, res.error.message);
      }
    };
  }

  cancel(): void {
    this.activeModal.close('close');
  }

  displayWith(data): string {
    return data.key;
  }

  selectPath(node): void {
    if (!node || !node.origin) {
      return;
    }
    if (this.document.path !== node.key) {
      this.document.path = node.key;
    }
  }
}

@Component({
  selector: 'app-single-document',
  templateUrl: './single-documentation.component.html'
})
export class SingleDocumentationComponent implements OnInit {
  loading: boolean;
  schedulerId: any = {};
  preferences: any = {};
  permission: any = {};
  documents: any = [];
  path: string;

  constructor(private router: Router, private authService: AuthService, public coreService: CoreService,
              private modal: NzModalService, private route: ActivatedRoute) {

  }

  ngOnInit(): void {
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

  /* ---------------------------- Action ----------------------------------*/

  previewDocument(document): void {
    const link = API_URL + 'documentation/preview?documentation=' + encodeURIComponent(document.name) + '&accessToken=' + this.authService.accessTokenId + '&controllerId=' + this.schedulerId;
    if (this.preferences.isDocNewWindow === 'newWindow') {
      window.open(link, '', 'top=0,left=0,scrollbars=yes,resizable=yes,status=no,toolbar=no,menubar=no', true);
    } else {
      window.open(link, '_blank');
    }
  }

  showDocumentUsage(document): void {
    const documentObj = this.coreService.clone(document);
    this.coreService.post('documentation/used', {
      documentation: document.name,
      controllerId: this.schedulerId
    }).subscribe((res: any) => {
      documentObj.usedIn = res.objects || [];
      this.modal.create({
        nzTitle: null,
        nzContent: ShowModalComponent,
        nzClassName: 'lg',
        nzComponentParams: {
          document: documentObj
        },
        nzFooter: null,
        nzClosable: false
      });
    });
  }

  exportDocument(document): void {
    const obj = {controllerId: this.schedulerId, documentations: []};
    if (document) {
      obj.documentations.push(document.name);
    }
    this.coreService.download('documentations/export', obj, 'documentation_' + this.schedulerId + '.zip', () => {

    });
  }

  deleteDocumentations(): void {
    const obj: any = {
      controllerId: this.schedulerId,
      documentations: [this.path]
    };
    this.coreService.post('documentation/used', {
      documentation: this.path,
      controllerId: this.schedulerId
    }).subscribe((res: any) => {
      this.deleteDocumentFn(obj, {usedIn: res.objects || [], path: this.path});
    });
  }

  deleteDocument(obj): void {
    this.coreService.post('documentations/delete', obj).subscribe(res => {
      this.documents = [];
    });
  }

  private getDocumentationsList(obj): void {
    this.coreService.post('documentations', obj).subscribe((res: any) => {
      this.loading = false;
      this.documents = res.documentations;
    }, () => {
      this.loading = false;
    });
  }

  private deleteDocumentFn(obj, document): void {
    if (this.preferences.auditLog) {
      const comments = {
        radio: 'predefined',
        type: 'Documentation',
        operation: 'Delete',
        name: document ? document.name : ''
      };
      const modal = this.modal.create({
        nzTitle: null,
        nzContent: CommentModalComponent,
        nzComponentParams: {
          comments,
          obj,
          url: 'documentations/delete'
        },
        nzFooter: null,
        nzClosable: false
      });
      modal.afterClose.subscribe(result => {
        if (result) {
          this.deleteDocument(obj);
        }
      });
    } else {
      const modal = this.modal.create({
        nzTitle: null,
        nzContent: ConfirmModalComponent,
        nzComponentParams: {
          type: 'Delete',
          title: 'delete',
          message: 'deleteDocument',
          document,
          objectName: document.name
        },
        nzFooter: null,
        nzClosable: false
      });
      modal.afterClose.subscribe((result) => {
        if (result) {
          this.deleteDocument(obj);
        }
      });
    }
  }
}

// Main Component
@Component({
  selector: 'app-document',
  templateUrl: 'documentation.component.html'
})
export class DocumentationComponent implements OnInit, OnDestroy {
  isLoading = false;
  loading: boolean;
  schedulerIds: any = {};
  tree: any = [];
  preferences: any = {};
  object = {
    mapOfCheckedId: new Set(),
    checked: false,
    indeterminate: false
  };
  permission: any = {};
  pageView: any;
  documents: any = [];
  data: any = [];
  documentFilters: any = {};
  sideView: any = {};
  documentTypes = ['ALL', 'HTML', 'XML', 'XSL', 'XSD', 'JAVASCRIPT', 'JSON', 'CSS', 'MARKDOWN', 'GIF', 'JPEG', 'PNG'];
  selectedPath: string;
  searchableProperties = ['name', 'type', 'path'];

  subscription: Subscription;

  @ViewChild(TreeComponent, {static: false}) child;

  constructor(private router: Router, private authService: AuthService, public coreService: CoreService,
              private searchPipe: SearchPipe, private modal: NzModalService, private dataService: DataService) {
    this.subscription = dataService.refreshAnnounced$.subscribe(() => {
      this.init();
    });
  }

  ngOnInit(): void {
    this.sideView = this.coreService.getSideView();
    this.init();
    if (this.documentFilters.selectedkeys && this.documentFilters.selectedkeys.length === 1) {
      this.selectedPath = this.documentFilters.selectedkeys[0];
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.coreService.setSideView(this.sideView);
    if (this.child) {
      this.documentFilters.expandedKeys = this.child.defaultExpandedKeys;
      this.documentFilters.selectedkeys = this.child.defaultSelectedKeys;
    }
  }

  initTree(): void {
    if (this.schedulerIds.selected) {
      this.coreService.post('tree', {
        controllerId: this.schedulerIds.selected,
        types: ['DOCUMENTATION']
      }).subscribe(res => {
        this.tree = this.coreService.prepareTree(res, true);
        if (this.tree.length) {
          this.loadDocument();
        }
        this.isLoading = true;
      }, () => {
        this.isLoading = true;
      });
    } else {
      this.isLoading = true;
    }
  }

  loadDocument(): void {
    const obj = {folders: [], types: [], controllerId: this.schedulerIds.selected};
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

  receiveAction($event): void {
    this.selectedPath = $event.key;
    this.getDocumentations($event, $event.action !== 'NODE');
  }

  getDocumentations(data, recursive): void {
    data.isSelected = true;
    this.loading = true;
    const obj = {
      folders: [{folder: data.name, recursive}],
      controllerId: this.schedulerIds.selected,
      compact: true
    };

    this.getDocumentationsList(obj);
  }

  /* ---------------------------- Action ----------------------------------*/

  pageIndexChange($event): void {
    this.documentFilters.currentPage = $event;
    this.reset();
  }

  pageSizeChange($event): void {
    this.documentFilters.entryPerPage = $event;
    if (this.object.checked) {
      this.checkAll(true);
    }
  }

  sort(propertyName): void {
    this.documentFilters.reverse = !this.documentFilters.reverse;
    this.documentFilters.filter.sortBy = propertyName;
    this.reset();
  }

  searchInResult(): void {
    this.data = this.documentFilters.searchText ? this.searchPipe.transform(this.documents, this.documentFilters.searchText, this.searchableProperties) : this.documents;
    this.data = [...this.data];
  }

  receiveMessage($event): void {
    this.pageView = $event;
  }

  checkAll(value: boolean): void {
    if (value && this.documents.length > 0) {
      this.documents.slice((this.preferences.entryPerPage * (this.documentFilters.currentPage - 1)), (this.preferences.entryPerPage * this.documentFilters.currentPage))
        .forEach(item => {
          this.object.mapOfCheckedId.add(item.name);
        });
    } else {
      this.object.mapOfCheckedId.clear();
    }
    this.refreshCheckedStatus();
  }

  onItemChecked(document: any, checked: boolean): void {
    if (checked) {
      this.object.mapOfCheckedId.add(document.name);
    } else {
      this.object.mapOfCheckedId.delete(document.name);
    }
    this.object.checked = this.object.mapOfCheckedId.size === this.documents.slice((this.preferences.entryPerPage * (this.documentFilters.currentPage - 1)), (this.preferences.entryPerPage * this.documentFilters.currentPage)).length;
    this.refreshCheckedStatus();
  }

  refreshCheckedStatus(): void {
    this.object.indeterminate = this.object.mapOfCheckedId.size > 0 && !this.object.checked;
  }

  previewDocument(document): void {
    const link = API_URL + 'documentation/preview?documentation=' + encodeURIComponent(document.name) + '&accessToken=' + this.authService.accessTokenId + '&controllerId=' + this.schedulerIds.selected;
    console.log(link)
    if (this.preferences.isDocNewWindow === 'newWindow') {
      window.open(link, '', 'top=0,left=0,scrollbars=yes,resizable=yes,status=no,toolbar=no,menubar=no', true);
    } else {
      window.open(link, '_blank');
    }
  }

  showDocumentUsage(document): void {
    const documentObj = this.coreService.clone(document);
    this.coreService.post('documentation/used', {
      documentation: document.name,
      controllerId: this.schedulerIds.selected
    }).subscribe((res: any) => {
      documentObj.usedIn = res.objects || [];
      this.modal.create({
        nzTitle: null,
        nzContent: ShowModalComponent,
        nzClassName: 'lg',
        nzComponentParams: {
          document: documentObj
        },
        nzFooter: null,
        nzClosable: false
      });
    });
  }

  exportDocument(document): void {
    const obj = {controllerId: this.schedulerIds.selected, documentations: []};
    if (document) {
      obj.documentations.push(document.name);
    } else {
      obj.documentations = Array.from(this.object.mapOfCheckedId);
    }
    this.coreService.download('documentations/export', obj, 'documentation_' + this.schedulerIds.selected + '.zip', () => {
        if(!document){
          this.reset();
        }
    });
  }

  importDocument(): void {
    const modal = this.modal.create({
      nzTitle: null,
      nzContent: ImportModalComponent,
      nzClassName: 'lg',
      nzComponentParams: {
        schedulerId: this.schedulerIds.selected,
        display: this.preferences.auditLog,
        selectedPath: this.selectedPath || '/',
        nodes: this.tree
      },
      nzFooter: null,
      nzClosable: false
    });
    modal.afterClose.subscribe(res => {
      if (res === 'success') {
        this.init();
      }
    });
  }

  deleteDocumentations(document): void {
    const obj: any = {
      controllerId: this.schedulerIds.selected,
      documentations: []
    };
    if (document) {
      obj.documentations.push(document.name);
    } else {
      obj.documentations = Array.from(this.object.mapOfCheckedId);
    }
    const documentObj = this.coreService.clone(document);
    if (document) {
      documentObj.delete = true;
      this.coreService.post('documentation/used', {
        documentation: documentObj.name,
        controllerId: this.schedulerIds.selected
      }).subscribe((res: any) => {
        documentObj.usedIn = res.objects || [];
        this.deleteDocumentFn(obj, documentObj, null);
      });
    } else {
      const documentArr: any = [];
      let i = 0;
      this.object.mapOfCheckedId.forEach((value) => {
        documentArr.push({name: value});
        this.coreService.post('documentation/used', {
          documentation: value,
          controllerId: this.schedulerIds.selected
        }).subscribe((res: any) => {
          documentArr[i].usedIn = res.objects || [];
          if (i === documentArr.length - 1) {
            this.deleteDocumentFn(obj, null, documentArr);
          }
          ++i;
        });
      });
    }
  }

  deleteDocument(obj, document): void {
    this.coreService.post('documentations/delete', obj).subscribe(res => {
      if (document) {
        for (let i = 0; i < this.documents.length; i++) {
          if (this.documents[i].name === document.name) {
            this.documents.splice(i, 1);
            break;
          }
        }
      } else {
        if (this.object.mapOfCheckedId.size > 0) {
          this.documents = this.documents.filter((item) => {
            return !this.object.mapOfCheckedId.has(item.name);
          });
        }
      }
      this.reset();
      this.searchInResult();
    });
  }

  private reset(): void{
    this.object = {
      mapOfCheckedId: new Set(),
      checked: false,
      indeterminate: false
    }
  }

  private init(): void {
    this.documentFilters = this.coreService.getResourceTab().documents;
    this.coreService.getResourceTab().state = 'documentations';
    this.preferences = sessionStorage.preferences ? JSON.parse(sessionStorage.preferences) : {};
    this.schedulerIds = this.authService.scheduleIds ? JSON.parse(this.authService.scheduleIds) : {};
    this.permission = this.authService.permission ? JSON.parse(this.authService.permission) : {};
    if (localStorage.views) {
      this.pageView = JSON.parse(localStorage.views).documentation;
    }
    this.initTree();
  }

  private getDocumentationsList(obj): void {
    this.reset();
    this.coreService.post('documentations', obj).subscribe((res: any) => {
      this.loading = false;
      res.documentations.forEach((value) => {
        value.path1 = value.path.substring(0, value.path.lastIndexOf('/')) || value.path.substring(0, value.path.lastIndexOf('/') + 1);
      });
      this.documents = res.documentations;
      this.searchInResult();
    }, () => {
      this.loading = false;
    });
  }

  private deleteDocumentFn(obj, document, arr): void {
    if (this.preferences.auditLog) {
      const comments = {
        radio: 'predefined',
        type: 'Documentation',
        operation: 'Delete',
        name: document ? document.name : ''
      };
      if (!document) {
        this.object.mapOfCheckedId.forEach((value, index) => {
          if (index === this.object.mapOfCheckedId.size - 1) {
            comments.name = comments.name + ' ' + value;
          } else {
            comments.name = value + ', ' + comments.name;
          }
        });
      }
      const modal = this.modal.create({
        nzTitle: null,
        nzContent: CommentModalComponent,
        nzComponentParams: {
          comments,
          obj,
          url: 'documentations/delete'
        },
        nzFooter: null,
        nzClosable: false
      });
      modal.afterClose.subscribe(result => {
        if (result) {
          this.deleteDocument(obj, document);
        }
      });
    } else {
      const modal = this.modal.create({
        nzTitle: null,
        nzContent: ConfirmModalComponent,
        nzComponentParams: {
          type: 'Delete',
          title: document ? 'delete' : 'deleteAllDocument',
          message: document ? 'deleteDocument' : 'deleteAllDocument',
          document,
          objectName: document ? document.name : undefined,
          documentArr: document ? undefined : arr
        },
        nzFooter: null,
        nzClosable: false
      });
      modal.afterClose.subscribe(result => {
        if (result) {
          this.deleteDocument(obj, document);
        }
      });
    }
  }
}

