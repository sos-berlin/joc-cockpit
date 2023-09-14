import {Component, inject, ViewChild} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {NZ_MODAL_DATA, NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
import {Subject, Subscription} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {CoreService} from '../../../services/core.service';
import {AuthService} from '../../../components/guard';
import {DataService} from '../../../services/data.service';
import {TreeComponent} from '../../../components/tree-navigation/tree.component';
import {CommentModalComponent} from '../../../components/comment-modal/comment.component';
import {ConfirmModalComponent} from '../../../components/comfirm-modal/confirm.component';
import {OrderPipe, SearchPipe} from '../../../pipes/core.pipe';
import {FileUploaderComponent} from "../../../components/file-uploader/file-uploader.component";

declare const $: any;

const API_URL = './api/';

@Component({
  selector: 'app-show-modal-content',
  templateUrl: './show-dialog.html'
})
export class ShowModalComponent {
  readonly modalData: any = inject(NZ_MODAL_DATA);
  document: any;

  constructor(public activeModal: NzModalRef) {
  }

  ngOnInit(): void {
    this.document = this.modalData.document;
  }
}

@Component({
  selector: 'app-edit-modal-content',
  templateUrl: './edit-dialog.html'
})
export class EditModalComponent {
  readonly modalData: any = inject(NZ_MODAL_DATA);
  display: any;
  document: any;
  submitted = false;
  required = false;
  comments: any = {};

  constructor(public activeModal: NzModalRef, private coreService: CoreService) {
  }

  ngOnInit(): void {
    this.display = this.modalData.display;
    this.document = this.modalData.document;
    this.comments.radio = 'predefined';
    if (sessionStorage['$SOS$FORCELOGING'] === 'true') {
      this.required = true;
      this.display = true;
    }
  }

  onSubmit(): void {
    this.submitted = true;
    const obj: any = {
      documentation: this.document.path,
      assignReference: this.document.assignReference,
      auditLog: {}
    };
    this.coreService.getAuditLogObj(this.comments, obj.auditLog);
    this.coreService.post('documentation/edit ', obj).subscribe({
      next: () => {
        this.submitted = false;
        this.activeModal.close(this.document);
      }, error: () => this.submitted = false
    });
  }

  cancel(): void {
    this.activeModal.destroy();
  }
}

@Component({
  selector: 'app-single-document',
  templateUrl: './single-documentation.component.html'
})
export class SingleDocumentationComponent {
  loading = false;
  controllerId: any = {};
  preferences: any = {};
  permission: any = {};
  documents: any = [];
  path?: string | null;

  constructor(private router: Router, private authService: AuthService, public coreService: CoreService,
              private modal: NzModalService, private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.path = this.route.snapshot.queryParamMap.get('path');
    this.controllerId = this.route.snapshot.queryParamMap.get('controllerId');
    if (sessionStorage['preferences']) {
      this.preferences = JSON.parse(sessionStorage['preferences']);
    }
    this.permission = JSON.parse(this.authService.permission) || {};
    this.getDocumentationsList({
      controllerId: this.controllerId,
      documentations: [this.path]
    });
  }

  /* ---------------------------- Action ----------------------------------*/

  editDocument(document: any): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: EditModalComponent,
      nzClassName: 'lg',
      nzData: {
        display: this.preferences.auditLog,
        document: this.coreService.clone(document),
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(res => {
      if (res) {
        document.assignReference = res.assignReference;
      }
    });
  }

  previewDocument(document: any): void {
    const link = API_URL + 'documentation/show?documentation=' + encodeURIComponent(document.path) + '&accessToken=' + this.authService.accessTokenId;
    if (this.preferences.isDocNewWindow === 'newWindow') {
      window.open(link, '', 'top=0,left=0,scrollbars=yes,resizable=yes,status=no,toolbar=no,menubar=no');
    } else {
      window.open(link, '_blank');
    }
  }

  showDocumentUsage(document: any): void {
    const documentObj = this.coreService.clone(document);
    this.coreService.post('documentation/used', {
      documentation: document.path
    }).subscribe((res: any) => {
      documentObj.usedIn = res.objects || [];
      this.modal.create({
        nzTitle: undefined,
        nzContent: ShowModalComponent,
        nzClassName: 'lg',
        nzData: {
          document: documentObj
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      });
    });
  }

  exportDocument(document: any): void {
    const obj: any = {documentations: []};
    if (document) {
      obj.documentations.push(document.path);
    }
    this.coreService.download('documentations/export', obj, 'documentations.zip', () => {

    });
  }

  deleteDocumentation(document: any): void {
    this.coreService.post('documentation/used', {
      documentation: document.path
    }).subscribe((res: any) => {
      const obj: any = {
        controllerId: this.controllerId,
        documentations: [this.path]
      };
      this.deleteDocumentFn(obj, {usedIn: res.objects || [], path: this.path});
    });
  }

  deleteDocument(obj: any): void {
    this.coreService.post('documentations/delete', obj).subscribe(() => {
      this.documents = [];
    });
  }

  private getDocumentationsList(obj: any): void {
    this.coreService.post('documentations', obj).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.documents = res.documentations;
      }, error: () => this.loading = false
    });
  }

  private deleteDocumentFn(obj: any, document: any): void {
    if (this.preferences.auditLog) {
      const comments = {
        radio: 'predefined',
        type: 'Documentation',
        operation: 'Delete',
        name: document ? document.path : ''
      };
      const modal = this.modal.create({
        nzTitle: undefined,
        nzContent: CommentModalComponent,
        nzData: {
          comments,
          obj,
          url: 'documentations/delete'
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      });
      modal.afterClose.subscribe(result => {
        if (result) {
          this.deleteDocument(obj);
        }
      });
    } else {
      const modal = this.modal.create({
        nzTitle: undefined,
        nzContent: ConfirmModalComponent,
        nzData: {
          type: 'Delete',
          title: 'delete',
          message: 'deleteDocument',
          document,
          objectName: document.path
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
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
export class DocumentationComponent {
  isLoading = false;
  loading = false;
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
  documentTypes = ['PDF', 'HTML', 'XML', 'XSL', 'XSD', 'JAVASCRIPT', 'JSON', 'CSS', 'MARKDOWN', 'GIF', 'JPEG', 'PNG'];
  reloadState = 'no';
  selectedPath = '';
  isProcessing = false;
  searchableProperties = ['name', 'type', 'assignReference', 'path'];

  subscription1: Subscription;
  subscription2: Subscription;
  private pendingHTTPRequests$ = new Subject<void>();

  @ViewChild(TreeComponent, {static: false}) child!: any;

  constructor(private router: Router, private authService: AuthService, public coreService: CoreService, private searchPipe: SearchPipe,
              private modal: NzModalService, private dataService: DataService, private orderPipe: OrderPipe) {
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
    if (this.documentFilters.selectedkeys && this.documentFilters.selectedkeys.length === 1) {
      this.selectedPath = this.documentFilters.selectedkeys[0];
    }
  }

  ngOnDestroy(): void {
    this.coreService.setSideView(this.sideView);
    if (this.child) {
      this.documentFilters.expandedKeys = this.child.defaultExpandedKeys;
      this.documentFilters.selectedkeys = this.child.defaultSelectedKeys;
    }
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
    this.pendingHTTPRequests$.next();
    this.pendingHTTPRequests$.complete();
    $('.scroll-y').remove();
  }

  private refresh(args: { eventSnapshots: any[] }): void {
    if (args.eventSnapshots && args.eventSnapshots.length > 0) {
      let flag = false;
      for (let j = 0; j < args.eventSnapshots.length; j++) {
        if (args.eventSnapshots[j].eventType === 'DocumentationUpdated' && args.eventSnapshots[j].path && !this.loading) {
          this.loadDocument(args.eventSnapshots[j].path);
          this.resetAction(500);
        } else if (args.eventSnapshots[j].eventType === 'DocumentationTreeUpdated' && !flag) {
          flag = true;
        }
      }

      if (flag) {
        this.initTree(true);
        this.resetAction(500);
      }
    }
  }

  initTree(isSkip = false): void {
    if (this.schedulerIds.selected) {
      this.coreService.post('tree', {
        controllerId: this.schedulerIds.selected,
        types: ['DOCUMENTATION']
      }).subscribe({
        next: res => {
          this.tree = this.coreService.prepareTree(res, true);
          if (this.tree.length && !isSkip) {
            this.loadDocument();
          }
          this.isLoading = true;
        }, error: () => this.isLoading = true
      });
    } else {
      this.isLoading = true;
    }
  }

  loadDocument(path = null, skipChild = false): void {
    const obj: any = {folders: [], types: [], controllerId: this.schedulerIds.selected};
    this.documents = [];
    let paths;
    if (this.child && !skipChild) {
      paths = this.child.defaultSelectedKeys;
    } else {
      paths = this.documentFilters.selectedkeys;
    }
    if (path && paths.indexOf(path) === -1) {
      return;
    }
    this.loading = true;
    for (let x = 0; x < paths.length; x++) {
      obj.folders.push({folder: paths[x], recursive: false});
    }
    if (this.documentFilters.filter.type !== 'ALL') {
      obj.types.push(this.documentFilters.filter.type);
    }
    this.getDocumentationsList(obj);
  }

  receiveAction($event: any): void {
    this.getDocumentations($event, $event.action !== 'NODE');
  }

  private resetAction(time = 100): void {
    if (this.isProcessing) {
      setTimeout(() => {
        this.isProcessing = false;
      }, time);
    }
  }

  deleteFolder(folder: any): void {
    const obj = {
      folder: folder.path
    };
    if (this.preferences.auditLog) {
      const comments = {
        radio: 'predefined',
        type: 'Documentation',
        operation: 'Delete',
        name: folder.path
      };
      const modal = this.modal.create({
        nzTitle: undefined,
        nzContent: CommentModalComponent,
        nzData: {
          comments,
          obj,
          url: 'documentations/delete'
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      });
      modal.afterClose.subscribe(result => {
        if (result) {
          this.isProcessing = true;
        }
      });
    } else {
      const modal = this.modal.create({
        nzTitle: undefined,
        nzContent: ConfirmModalComponent,
        nzData: {
          type: 'Delete',
          title: 'delete',
          message: 'deleteDocumentFolder',
          objectName: folder.path,
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      });
      modal.afterClose.subscribe(result => {
        if (result) {
          this.isProcessing = true;
          this.coreService.post('documentations/delete', obj).subscribe({
            next: () => {

            }, error: () => {
              this.resetAction();
            }
          });
        }
      });
    }
  }

  getDocumentations(data, recursive): void {
    data.isSelected = true;
    this.loading = true;
    const obj = {
      folders: [{folder: data.path, recursive}],
      controllerId: this.schedulerIds.selected,
      compact: true
    };

    this.getDocumentationsList(obj);
  }

  /* ---------------------------- Action ----------------------------------*/

  selectObject(item): void {
    let flag = true;
    const PATH = item.path.substring(0, item.path.lastIndexOf('/')) || '/';
    for (let i in this.documentFilters.expandedKeys) {
      if (PATH == this.documentFilters.expandedKeys[i]) {
        flag = false;
        break;
      }
    }
    if (flag) {
      this.documentFilters.expandedKeys.push(PATH);
    }
    this.documentFilters.selectedkeys = [PATH];
    this.loadDocument(null, true);
  }


  pageIndexChange($event: number): void {
    this.documentFilters.currentPage = $event;
    if (this.object.mapOfCheckedId.size !== this.data.length) {
      this.reset();
    }
  }

  pageSizeChange($event: number): void {
    this.documentFilters.entryPerPage = $event;
    if (this.object.mapOfCheckedId.size !== this.data.length) {
      if (this.object.checked) {
        this.checkAll(true);
      }
    }
  }

  sort(propertyName: string): void {
    this.documentFilters.reverse = !this.documentFilters.reverse;
    this.documentFilters.filter.sortBy = propertyName;
    this.data = this.orderPipe.transform(this.data, this.documentFilters.filter.sortBy, this.documentFilters.reverse);
    this.reset();
  }

  getCurrentData(list: any[], filter: any): Array<any> {
    const entryPerPage = filter.entryPerPage || this.preferences.entryPerPage;
    return list.slice((entryPerPage * (filter.currentPage - 1)), (entryPerPage * filter.currentPage));
  }

  searchInResult(): void {
    this.data = this.documentFilters.searchText ? this.searchPipe.transform(this.documents, this.documentFilters.searchText, this.searchableProperties) : this.documents;
    this.data = [...this.data];
  }

  receiveMessage($event: string): void {
    this.pageView = $event;
  }

  selectAll(): void {
    this.data.forEach((item: any) => {
      this.object.mapOfCheckedId.add(item.path);
    });
  }

  checkAll(value: boolean): void {
    if (value && this.documents.length > 0) {
      const documents = this.getCurrentData(this.data, this.documentFilters);
      documents.forEach(item => {
        this.object.mapOfCheckedId.add(item.path);
      });
    } else {
      this.object.mapOfCheckedId.clear();
    }
    this.refreshCheckedStatus();
  }

  onItemChecked(document: any, checked: boolean): void {
    if (!checked && this.object.mapOfCheckedId.size > (this.documentFilters.entryPerPage || this.preferences.entryPerPage)) {
      const orders = this.getCurrentData(this.data, this.documentFilters);
      if (orders.length < this.data.length) {
        this.object.mapOfCheckedId.clear();
        orders.forEach(item => {
          this.object.mapOfCheckedId.add(item.path);
        });
      }
    }
    if (checked) {
      this.object.mapOfCheckedId.add(document.path);
    } else {
      this.object.mapOfCheckedId.delete(document.path);
    }
    const documents = this.getCurrentData(this.data, this.documentFilters);
    this.object.checked = this.object.mapOfCheckedId.size === documents.length;
    this.refreshCheckedStatus();
  }

  refreshCheckedStatus(): void {
    this.object.indeterminate = this.object.mapOfCheckedId.size > 0 && !this.object.checked;
  }

  editDocument(document: any): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: EditModalComponent,
      nzClassName: 'lg',
      nzData: {
        display: this.preferences.auditLog,
        document: this.coreService.clone(document),
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(res => {
      if (res) {
        document.assignReference = res.assignReference;
      }
    });
  }

  previewDocument(document: any): void {
    const link = API_URL + 'documentation/show?documentation=' + encodeURIComponent(document.path) + '&accessToken=' + this.authService.accessTokenId;
    if (this.preferences.isDocNewWindow === 'newWindow') {
      window.open(link, '', 'top=0,left=0,scrollbars=yes,resizable=yes,status=no,toolbar=no,menubar=no');
    } else {
      window.open(link, '_blank');
    }
  }

  showDocumentUsage(document: any): void {
    const documentObj = this.coreService.clone(document);
    this.coreService.post('documentation/used', {
      documentation: document.path
    }).subscribe((res: any) => {
      documentObj.usedIn = res.objects || [];
      this.modal.create({
        nzTitle: undefined,
        nzContent: ShowModalComponent,
        nzClassName: 'lg',
        nzData: {
          document: documentObj
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      });
    });
  }

  exportDocument(document: any): void {
    const obj: any = {documentations: []};
    if (document) {
      obj.documentations.push(document.path);
    } else {
      obj.documentations = Array.from(this.object.mapOfCheckedId);
    }
    this.isProcessing = true;
    this.coreService.download('documentations/export', obj, 'documentations.zip', (flag) => {
      this.resetAction();
      if (!document && flag) {
        this.reset();
      }
    });
  }

  importDocument(): void {
    const modal = this.modal.create({
      nzTitle: undefined,
      nzContent: FileUploaderComponent,
      nzClassName: 'lg',
      nzData: {
        type: 'DOCUMENTATION',
        display: this.preferences.auditLog,
        selectedPath: this.selectedPath || '/',
        nodes: this.tree
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
    modal.afterClose.subscribe(path => {
      if (path) {
        this.isProcessing = true;
        this.selectedPath = path;
        this.initTree();
        this.resetAction(3000);
      }
    });
  }

  deleteDocumentations(document: any): void {
    const obj: any = {
      controllerId: this.schedulerIds.selected,
      documentations: []
    };
    if (document) {
      obj.documentations.push(document.path);
    } else {
      obj.documentations = Array.from(this.object.mapOfCheckedId);
    }
    const documentObj = this.coreService.clone(document);
    if (document) {
      documentObj.delete = true;
      this.coreService.post('documentation/used', {
        documentation: documentObj.path
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

  deleteDocument(obj: any, document: any): void {
    this.isProcessing = true;
    this.coreService.post('documentations/delete', obj).subscribe({
      next: () => {
        if (document) {
          for (let i = 0; i < this.documents.length; i++) {
            if (this.documents[i].path === document.path) {
              this.documents.splice(i, 1);
              break;
            }
          }
        } else {
          if (this.object.mapOfCheckedId.size > 0) {
            this.documents = this.documents.filter((item) => {
              return !this.object.mapOfCheckedId.has(item.path);
            });
          }
        }
        this.reset();
        this.searchInResult();
        this.resetAction(5000);
      }, error: () => {
        this.resetAction();
      }
    });
  }

  reset(): void {
    this.object = {
      mapOfCheckedId: new Set(),
      checked: false,
      indeterminate: false
    };
  }

  private init(): void {
    this.documentFilters = this.coreService.getResourceTab().documents;
    this.coreService.getResourceTab().state = 'documentations';
    this.preferences = sessionStorage['preferences'] ? JSON.parse(sessionStorage['preferences']) : {};
    this.schedulerIds = this.authService.scheduleIds ? JSON.parse(this.authService.scheduleIds) : {};
    this.permission = this.authService.permission ? JSON.parse(this.authService.permission) : {};
    if (localStorage['views']) {
      this.pageView = JSON.parse(localStorage['views']).documentation;
    }
    this.initTree();
  }

  private getDocumentationsList(obj: any): void {
    this.reset();
    this.coreService.post('documentations', obj).pipe(takeUntil(this.pendingHTTPRequests$)).subscribe({
      next: (res: any) => {
        if (res.documentations && res.documentations.length === 0) {
          this.documentFilters.currentPage = 1;
        }
        this.loading = false;
        res.documentations.forEach((value: { path: string, path1: string }) => {
          value.path1 = value.path.substring(0, value.path.lastIndexOf('/')) || value.path.substring(0, value.path.lastIndexOf('/') + 1);
        });
        res.documentations = this.orderPipe.transform(res.documentations, this.documentFilters.filter.sortBy, this.documentFilters.reverse);
        this.documents = res.documentations;
        this.searchInResult();
      }, error: () => {
        this.loading = false;
      }
    });
  }

  private deleteDocumentFn(obj: any, document: any, arr: any): void {
    if (this.preferences.auditLog) {
      const comments = {
        radio: 'predefined',
        type: 'Documentation',
        operation: 'Delete',
        name: document ? document.path : ''
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
        nzTitle: undefined,
        nzContent: CommentModalComponent,
        nzData: {
          comments,
          obj,
          url: 'documentations/delete'
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      });
      modal.afterClose.subscribe(result => {
        if (result) {
          this.deleteDocument(obj, document);
        }
      });
    } else {
      const modal = this.modal.create({
        nzTitle: undefined,
        nzContent: ConfirmModalComponent,
        nzData: {
          type: 'Delete',
          title: document ? 'delete' : 'deleteAllDocument',
          message: document ? 'deleteDocument' : 'deleteAllDocument',
          document,
          objectName: document ? document.path : undefined,
          documentArr: document ? undefined : arr
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      });
      modal.afterClose.subscribe(result => {
        if (result) {
          this.deleteDocument(obj, document);
        }
      });
    }
  }

  reload(): void {
    if (this.reloadState === 'no') {
      this.documents = [];
      this.data = [];
      this.reloadState = 'yes';
      this.loading = false;
      this.pendingHTTPRequests$.next();
    } else if (this.reloadState === 'yes') {
      this.loading = true;
      this.loadDocument();
    }
  }
}

