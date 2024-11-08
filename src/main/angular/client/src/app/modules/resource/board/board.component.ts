import {Component, inject, ViewChild} from '@angular/core';
import {Subject, Subscription} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {takeUntil} from 'rxjs/operators';
import {NZ_MODAL_DATA, NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
import {CoreService} from '../../../services/core.service';
import {AuthService} from '../../../components/guard';
import {DataService} from '../../../services/data.service';
import {TreeComponent} from '../../../components/tree-navigation/tree.component';
import {OrderPipe, SearchPipe} from '../../../pipes/core.pipe';
import {ConfirmModalComponent} from '../../../components/comfirm-modal/confirm.component';
import {CommentModalComponent} from "../../../components/comment-modal/comment.component";
import {NgModel} from "@angular/forms";

declare const $: any;

// Role Actions
@Component({
  selector: 'app-post-notice-modal',
  templateUrl: './post-notice-dialog.html'
})
export class PostModalComponent {
  readonly modalData: any = inject(NZ_MODAL_DATA);
  controllerId: string;
  preferences: any;
  board: any;

  notice: any;

  submitted = false;
  postObj: any = {};
  dateFormat: any;
  zones = [];
  display = false;
  required = false;
  comments: any = {};
  flag = false;
  singleNotice = false;
  workflowPaths: any;
  singular = false;
  constructor(public activeModal: NzModalRef, private coreService: CoreService) {
  }

  ngOnInit(): void {
    this.controllerId = this.modalData.controllerId;
    this.preferences = this.modalData.preferences;
    this.board = this.modalData.board;
    this.notice = this.modalData.notice;
    this.flag = this.modalData.flag;
    this.singleNotice = this.modalData.singleNotice;
    this.workflowPaths = this.modalData.workflowPaths;
    this.singular = this.modalData.singular;
    this.dateFormat = this.coreService.getDateFormat(this.preferences.dateFormat);
    this.zones = this.coreService.getTimeZoneList();
    this.postObj.timeZone = this.coreService.getTimeZone();
    this.postObj.at = 'later';
    this.comments.radio = 'predefined';
    if (sessionStorage['$SOS$FORCELOGING'] === 'true') {
      this.required = true;
      this.display = true;
    } else {
      this.display = this.preferences.auditLog;
    }
    if (this.notice) {
      this.postObj.noticeId = this.notice.id;
    } else {
      this.postObj.noticeId = this.coreService.getStringDate(null);
    }
  }
 onBlur(repeat: NgModel, propertyName: string) {
  this.postObj[propertyName] = this.coreService.padTime(this.postObj[propertyName]);
  repeat.control.setErrors({incorrect: false});
  repeat.control.updateValueAndValidity();
}

  onSubmit(): void {
    this.submitted = true;
    let expectedNotices;
    const paths = this.modalData.paths || [];

    if (this.flag) {
      expectedNotices = this.workflowPaths
        .filter((data: any) => !data.isChecked) // Filter out items where isChecked is true
        .map((data: any) => {
          const notice = { noticeBoardPath: data.noticePath, workflowPaths: data.workflowPaths };
          return notice;
        });
    } else if (this.singleNotice) {
      expectedNotices = [{
        noticeBoardPath: this.modalData.paths.path,
        workflowPaths: [this.workflowPaths]
      }];
    }

    const obj: any = {
      controllerId: this.controllerId,
      timeZone: this.postObj.timeZone,
      auditLog: {}
    };

    if (this.flag || this.singleNotice) {
      obj.expectedNotices = expectedNotices;
    } else if (this.board && !this.singular) {
      if (!obj.notices) {
        obj.notices = [];
      }

      const noticeBoardPath = this.board.path;
      obj.notices.push({ noticeBoardPath: noticeBoardPath });
    } else if (!this.singular) {
      if (!obj.notices ) {
        obj.notices = {};
      }

      // Create an array of noticeBoardPath objects from paths
      obj.notices = paths.map((path: any) => {
        return { noticeBoardPath: path };
      });
    }

    if (this.singular) {
      obj.noticeBoardPath = this.board.path;
      obj.noticeId = this.postObj.noticeId;
    }

    this.coreService.getAuditLogObj(this.comments, obj.auditLog);

    if (this.postObj.at === 'date') {
      if (this.postObj.fromDate) {
        this.coreService.getDateAndTime(this.postObj);
        const endOfLifeDate = this.coreService.getDateByFormat(this.postObj.fromDate, null, 'YYYY-MM-DD HH:mm:ss');
        obj.endOfLife = endOfLifeDate;
      }
    } else if (this.postObj.at === 'later') {
      const atTime = this.postObj.atTime;
      const convertedTime = this.coreService.convertToSeconds(atTime);
      obj.endOfLife = convertedTime !== 'Invalid time format' ? convertedTime : atTime;
    }

    // Set endpoint based on singular flag
    const endpoint = this.singular ? 'notice/post' : (this.flag || this.singleNotice ? 'notices/post/expected' : 'notices/post');

    this.coreService.post(endpoint, obj).subscribe({
      next: (res) => {
        this.submitted = false;
        this.activeModal.close(res);
      },
      error: () => this.submitted = false
    });
  }

}

@Component({
  selector: 'app-single-board',
  templateUrl: './single-board.component.html'
})
export class SingleBoardComponent {
  loading: boolean;
  controllerId: any = {};
  preferences: any = {};
  permission: any = {};
  boards: any = [];
  name: string;
  isPathDisplay = false;
  subscription: Subscription;

  constructor(private authService: AuthService, public coreService: CoreService,
              private modal: NzModalService, private dataService: DataService, private route: ActivatedRoute) {
    this.subscription = dataService.eventAnnounced$.subscribe(res => {
      this.refresh(res);
    });
  }

  ngOnInit(): void {
    this.name = this.route.snapshot.queryParamMap.get('name');
    this.controllerId = this.route.snapshot.queryParamMap.get('controllerId');
    this.isPathDisplay = sessionStorage['displayFoldersInViews'] == 'true';
    if (sessionStorage['preferences']) {
      this.preferences = JSON.parse(sessionStorage['preferences']);
    }
    this.permission = JSON.parse(this.authService.permission) || {};
    this.getBoardsList({
      controllerId: this.controllerId,
      noticeBoardPaths: [this.name]
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private getBoardsList(obj): void {
    obj.limit = this.preferences.maxBoardRecords;
    this.coreService.post('notice/boards', obj).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.boards = res.noticeBoards;
        this.boards.forEach((value) => {
          value.name = value.path.substring(value.path.lastIndexOf('/') + 1);
        });
      }, error: () => this.loading = false
    });
  }

  post(board: any, notice = null): void {
    this.modal.create({
      nzTitle: undefined,
      nzContent: PostModalComponent,
      nzAutofocus: null,
      nzClassName: 'lg',
      nzData: {
        board,
        notice,
        controllerId: this.controllerId,
        preferences: this.preferences
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
  }

  delete(board, notice): void {
    if (this.preferences.auditLog) {
      const comments = {
        radio: 'predefined',
        type: 'Notice Board',
        operation: 'Delete',
        name: notice.id
      };
      const modal = this.modal.create({
        nzTitle: undefined,
        nzContent: CommentModalComponent,
        nzData: {
          comments,
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      });
      modal.afterClose.subscribe(result => {
        if (result) {
          this._delete(board, notice, result);
        }
      });
    } else {
      const modal = this.modal.create({
        nzTitle: undefined,
        nzContent: ConfirmModalComponent,
        nzData: {
          type: 'Delete',
          title: 'delete',
          message: 'deleteNotice',
          objectName: notice.id
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      });
      modal.afterClose.subscribe((result) => {
        if (result) {
          this._delete(board, notice, {});
        }
      });
    }
  }

  private _delete(board, notice, comments): void {
    this.coreService.post('notice/delete', {
      controllerId: this.controllerId,
      noticeBoardPath: board.path,
      noticeId: notice.id,
      auditLog: comments
    }).subscribe(() => {
      for (let i = 0; i < board.notices.length; i++) {
        if (board.notices[i].id === notice.id) {
          board.notices.splice(i, 1);
          break;
        }
      }
      board.notices = [...board.notices];
    });
  }

  private refresh(args: { eventSnapshots: any[] }): void {
    if (args.eventSnapshots && args.eventSnapshots.length > 0) {
      for (let j = 0; j < args.eventSnapshots.length; j++) {
        if (args.eventSnapshots[j].eventType === 'NoticeBoardStateChanged' && args.eventSnapshots[j].path && args.eventSnapshots[j].path.indexOf(this.name) > -1) {
          const obj = {
            controllerId: this.controllerId,
            limit: this.preferences.maxBoardRecords,
            noticeBoardPath: this.name
          };
          this.coreService.post('notice/board', obj).subscribe((res: any) => {
            this.boards[0].numOfNotices = res.noticeBoard.numOfNotices;
            this.boards[0].numOfExpectingOrders = res.noticeBoard.numOfExpectingOrders;
            this.boards[0].notices = res.noticeBoard.notices;
          });
          break;
        }
      }
    }
  }

}

@Component({
  selector: 'app-board',
  templateUrl: 'board.component.html'
})
export class BoardComponent {
  isLoading = false;
  loading: boolean;
  schedulerIds: any = {};
  tree: any = [];
  preferences: any = {};
  permission: any = {};
  pageView: any;
  boards: any = [];
  data: any = [];
  boardsFilters: any = {};
  sideView: any = {};
  searchableProperties = ['name', 'path', 'postOrderToNoticeId', 'expectOrderToNoticeId', 'endOfLife', 'title', 'state', '_text', 'versionDate'];
  reloadState = 'no';
  isSearchVisible = false;
  object = {
    setOfCheckedId: new Set(),
    mapOfCheckedId: new Set(),
    isDelete: false,
    checked: false,
    indeterminate: false
  };
  isPathDisplay = false;

  subscription1: Subscription;
  subscription2: Subscription;
  private pendingHTTPRequests$ = new Subject<void>();

  @ViewChild(TreeComponent, {static: false}) child;

  constructor(private authService: AuthService, public coreService: CoreService, private modal: NzModalService,
              private searchPipe: SearchPipe, private dataService: DataService, private orderPipe: OrderPipe) {
    this.subscription1 = dataService.eventAnnounced$.subscribe(res => {
      this.refresh(res);
    });
    this.subscription2 = dataService.refreshAnnounced$.subscribe(() => {
      this.init();
    });
  }

  ngOnInit(): void {
    this.sideView = this.coreService.getSideView();
    this.isPathDisplay = sessionStorage['displayFoldersInViews'] == 'true';
    this.init();
  }

  ngOnDestroy(): void {
    this.coreService.setSideView(this.sideView);
    if (this.child) {
      this.boardsFilters.expandedKeys = this.child.defaultExpandedKeys;
      this.boardsFilters.selectedkeys = this.child.defaultSelectedKeys;
    }
    this.boardsFilters.expandedObjects = this.boards.reduce((ids, obj) => {
      if (obj.show) {
        ids.push(obj.path);
      }
      return ids;
    }, []);
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
    this.pendingHTTPRequests$.next();
    this.pendingHTTPRequests$.complete();
    $('.scroll-y').remove();
  }

  initTree(): void {
    if (this.schedulerIds.selected) {
      this.coreService.post('tree', {
        controllerId: this.schedulerIds.selected,
        types: ['NOTICEBOARD']
      }).subscribe({
        next: res => {
          this.isLoading = true;
          this.tree = this.coreService.prepareTree(res, true);
          if (this.tree.length) {
            this.loadBoards();
          }
        }, error: () => this.isLoading = true
      });
    } else {
      this.isLoading = true;
    }
  }

  loadBoards(skipChild = false): void {
    this.reloadState = 'no';
    const obj = {
      folders: [],
      controllerId: this.schedulerIds.selected
    };
    this.boards = [];
    this.loading = true;
    let paths;
    if (this.child && !skipChild) {
      paths = this.child.defaultSelectedKeys;
    } else {
      paths = this.boardsFilters.selectedkeys;
    }
    for (let x = 0; x < paths.length; x++) {
      obj.folders.push({folder: paths[x], recursive: false});
    }
    this.getBoardsList(obj);
  }

  receiveAction($event): void {
    this.boardsFilters.expandedObjects = [];
    this.getBoards($event, $event.action !== 'NODE');
  }

  getBoards(data, recursive): void {
    data.isSelected = true;
    this.loading = true;
    const obj = {
      folders: [{folder: data.path, recursive}],
      controllerId: this.schedulerIds.selected
    };
    this.getBoardsList(obj);
  }

  /* ---------------------------- Action ----------------------------------*/

  selectObject(item): void {
    let flag = true;
    const PATH = item.path.substring(0, item.path.lastIndexOf('/')) || '/';
    for (let i in this.boardsFilters.expandedKeys) {
      if (PATH == this.boardsFilters.expandedKeys[i]) {
        flag = false;
        break;
      }
    }
    if (flag) {
      this.boardsFilters.expandedKeys.push(PATH);
    }
    this.boardsFilters.selectedkeys = [PATH];
    this.boardsFilters.expandedObjects = [item.path];
    this.loadBoards(true);
  }

  pageIndexChange($event: number): void {
    this.boardsFilters.currentPage = $event;
    this.reset();
  }

  pageSizeChange($event: number): void {
    this.boardsFilters.entryPerPage = $event;
  }

  getCurrentData(list, filter): Array<any> {
    const entryPerPage = filter.entryPerPage || this.preferences.entryPerPage;
    return list.slice((entryPerPage * (filter.currentPage - 1)), (entryPerPage * filter.currentPage));
  }

  sort(key): void {
    this.boardsFilters.reverse = !this.boardsFilters.reverse;
    this.boardsFilters.filter.sortBy = key;
    this.data = this.orderPipe.transform(this.data, this.boardsFilters.filter.sortBy, this.boardsFilters.reverse);
    this.reset();
  }

  receiveMessage($event): void {
    this.pageView = $event;
  }

  private refresh(args: { eventSnapshots: any[] }): void {
    if (args.eventSnapshots && args.eventSnapshots.length > 0) {
      let flag = false;
      const noticeBoardPaths = [];
      const noticeBoardPaths2 = [];
      for (let j = 0; j < args.eventSnapshots.length; j++) {
        if (args.eventSnapshots[j].eventType.match(/BoardStateChanged/) && args.eventSnapshots[j].path) {
          if (this.boards.length > 0) {
            for (let x = 0; x < this.boards.length; x++) {
              if (this.boards[x].path === args.eventSnapshots[j].path) {
                if (!this.boards[x].show) {
                  if (noticeBoardPaths.indexOf(this.boards[x].path) === -1) {
                    noticeBoardPaths.push(this.boards[x].path);
                  }
                } else if (noticeBoardPaths2.indexOf(this.boards[x].path) === -1) {
                  this.boards[x].loading = true;
                  noticeBoardPaths2.push(this.boards[x].path);
                }
                break;
              }
            }
          }
        } else if (args.eventSnapshots[j].eventType.match(/Item/) && args.eventSnapshots[j].objectType === 'NOTICEBOARD') {
          flag = true;
        }
      }

      if (noticeBoardPaths && noticeBoardPaths.length) {
        this.updateListOnEvent(noticeBoardPaths, true);
      }
      if (noticeBoardPaths2 && noticeBoardPaths2.length) {
        this.updateListOnEvent(noticeBoardPaths2, false);
      }
      if (flag) {
        this.initTree();
      }
    }
  }

  private updateListOnEvent(paths, compact): void {
    this.coreService.post('notice/boards', {
      controllerId: this.schedulerIds.selected,
      compact,
      limit: this.preferences.maxBoardRecords,
      noticeBoardPaths: paths
    }).subscribe({
      next: (res: any) => {
        this.loading = false;
        res.noticeBoards.forEach((value) => {
          for (let x = 0; x < this.boards.length; x++) {
            if (this.boards[x].path === value.path) {
              this.boards[x].loading = false;
              this.boards[x].numOfNotices = value.numOfNotices;
              this.boards[x].numOfExpectingOrders = value.numOfExpectingOrders;
              this.boards[x].notices = value.notices;
              break;
            }
          }
        });
        this.boards = [...this.boards];
      }, error: () => this.loading = false
    });
  }

  private init(): void {
    this.boardsFilters = this.coreService.getResourceTab().boards;
    this.coreService.getResourceTab().state = 'boards';
    this.preferences = sessionStorage['preferences'] ? JSON.parse(sessionStorage['preferences']) : {};
    this.schedulerIds = this.authService.scheduleIds ? JSON.parse(this.authService.scheduleIds) : {};
    this.permission = this.authService.permission ? JSON.parse(this.authService.permission) : {};
    if (localStorage['views']) {
      this.pageView = JSON.parse(localStorage['views']).board;
    }
    if (!this.pageView) {
      if (sessionStorage['preferences']) {
        if (JSON.parse(sessionStorage['preferences']).pageView) {
          this.pageView = JSON.parse(sessionStorage['preferences']).pageView;
        }
      }
    }
    this.initTree();
  }

  private getBoardsList(obj): void {
    obj.limit = this.preferences.maxBoardRecords;
    obj.compact = true;
    const boards = [];
    this.coreService.post('notice/boards', obj).pipe(takeUntil(this.pendingHTTPRequests$)).subscribe({
      next: (res: any) => {
        this.reset();
        if (res.noticeBoards && res.noticeBoards.length === 0) {
          this.boardsFilters.currentPage = 1;
        }
        res.noticeBoards.forEach((value) => {
          value.name = value.path.substring(value.path.lastIndexOf('/') + 1);
          value.path1 = value.path.substring(0, value.path.lastIndexOf('/')) || value.path.substring(0, value.path.lastIndexOf('/') + 1);
          if (this.boardsFilters.expandedObjects && this.boardsFilters.expandedObjects.length > 0) {
            const index = this.boardsFilters.expandedObjects.indexOf(value.path);
            if (index > -1) {
              boards.push(value);
              this.boardsFilters.expandedObjects.slice(index, 1);
            }
          }
        });
        res.noticeBoards = this.orderPipe.transform(res.noticeBoards, this.boardsFilters.filter.sortBy, this.boardsFilters.reverse);
        this.loading = false;
        this.boards = res.noticeBoards;
        this.searchInResult();
        if (boards && boards.length > 0) {
          this.updateBoardsDetail(boards);
        }
      }, error: () => this.loading = false
    });
  }

  searchInResult(): void {
    this.data = this.boardsFilters.searchText ? this.searchPipe.transform(this.boards, this.boardsFilters.searchText, this.searchableProperties) : this.boards;
    this.data = [...this.data];
    this.reset();
  }

  search(): void {
    this.isSearchVisible = true;
  }

  closeSearch(): void {
    this.isSearchVisible = false;
  }

  onNavigate(data): void {
    const pathArr = [];
    const arr = data.path.split('/');
    this.boardsFilters.selectedkeys = [];
    if ((arr.length - 1) > 1) {
      for (let i = 0; i < (arr.length - 1); i++) {
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
    this.boardsFilters.expandedKeys = pathArr;
    this.boardsFilters.selectedkeys.push(pathArr[pathArr.length - 1]);
    this.boardsFilters.expandedObjects = [data.path];
    const obj = {
      controllerId: this.schedulerIds.selected,
      folders: [{folder: PATH, recursive: false}]
    };
    this.boards = [];
    this.loading = true;
    this.getBoardsList(obj);
  }

  private updateBoardsDetail(boards): void {
    const obj = {
      noticeBoardPaths: [],
      controllerId: this.schedulerIds.selected
    };
    boards.forEach((value) => {
      value.show = true;
      value.loading = true;
      obj.noticeBoardPaths.push(value.path);
    });
    this.getNoticeBoards(obj, (data) => {
      if (data && data.length > 0) {
        boards.forEach((board) => {
          for (let i = 0; i < data.length; i++) {
            if (board.path === data[i].path) {
              board.notices = data[i].notices;
              board.numOfNotices = data[i].numOfNotices;
              board.numOfExpectingOrders = data[i].numOfExpectingOrders;
              data.splice(i, 1);
              break;
            }
          }
          board.loading = false;
        });
        this.boards = [...this.boards];
      }
    });
  }

  private getNoticeBoards(obj, cb): void {
    obj.limit = this.preferences.maxBoardRecords;
    this.coreService.post('notice/boards', obj).subscribe({
      next: (res: any) => {
        cb(res.noticeBoards);
      }, error: () => {
        cb();
      }
    });
  }

  showDetail(board): void {
    board.show = true;
    board.loading = true;
    const obj = {
      noticeBoardPaths: [board.path],
      controllerId: this.schedulerIds.selected
    };
    this.getNoticeBoards(obj, (data) => {
      if (data && data.length > 0) {
        for (const i in data) {
          if (board.path === data[i].path) {
            board.notices = data[i].notices;
            board.numOfNotices = data[i].numOfNotices;
            board.numOfExpectingOrders = data[i].numOfExpectingOrders;
            break;
          }
        }
      }
      board.loading = false;
    });
  }

  expandDetails(): void {
    const boards = this.getCurrentData(this.data, this.boardsFilters);
    if (boards && boards.length > 0) {
      this.updateBoardsDetail(boards);
    }
  }

  collapseDetails(): void {
    const boards = this.getCurrentData(this.data, this.boardsFilters);
    boards.forEach((value) => {
      value.show = false;
    });
  }

  private reset(): void {
    this.object.mapOfCheckedId.clear();
    this.object.setOfCheckedId.clear();
    this.object.indeterminate = false;
    this.object.checked = false;
    this.object.isDelete = false;
    this.data.forEach((item) => {
      delete item.checked;
      delete item.indeterminate;
    });
  }

  private checkChild(value: boolean, board): void {
    if (value && board.notices && board.notices.length > 0) {
      board.notices.forEach(item => {
        if (item.state && item.state._text !== 'EXPECTED') {
          this.object.mapOfCheckedId.add(item.id + '__' + board.path);
        }
      });
    } else if (board.notices && board.notices.length > 0) {
      board.notices.forEach(item => {
        if (this.object.mapOfCheckedId.has(item.id + '__' + board.path)) {
          this.object.mapOfCheckedId.delete(item.id + '__' + board.path);
        }
      });
    }
    board.indeterminate = false;
  }

  checkAll(value: boolean, board?): void {
    if (board) {
      this.checkChild(value, board);
    }
    let boards = [];
    if (this.boards.length > 0) {
      boards = this.getCurrentData(this.data, this.boardsFilters);
      boards.forEach(item => {
        if (value) {
          if (item.numOfNotices !== item.numOfExpectingOrders) {
            this.object.isDelete = true;
          }
          this.object.setOfCheckedId.add(item.path);
        }
        if (!board) {
          item.checked = value;
          this.checkChild(value, item);
        }
      });
    }
    if (!value && !board) {
      this.object.setOfCheckedId.clear();
      this.object.isDelete = false;
    } else if (board) {
      if (this.object.mapOfCheckedId.size == 0) {
        this.object.setOfCheckedId.clear();
        this.object.isDelete = false;
      }
    }
    if (board) {
      this.object.checked = boards.length == this.object.setOfCheckedId.size;
    }
    this.object.indeterminate = this.object.setOfCheckedId.size > 0 && !this.object.checked;
  }

  onItemChecked(board: any, notice: any, checked: boolean): void {
    if (checked) {
      if (notice) {
        if (notice.state && notice.state._text !== 'EXPECTED') {
          this.object.mapOfCheckedId.add(notice.id + '__' + board.path);
        }
      } else {
        board.checked = true;
        this.object.setOfCheckedId.add(board.path);
      }
    } else {
      if (notice) {
        this.object.mapOfCheckedId.delete(notice.id + '__' + board.path);
      } else {
        board.checked = false;
        this.object.setOfCheckedId.delete(board.path);
      }
    }
    const boards = this.getCurrentData(this.data, this.boardsFilters);
    if (notice) {
      let count = 0;
      if (board.notices) {
        board.notices.forEach(item => {
          if (this.object.mapOfCheckedId.has(item.id + '__' + board.path)) {
            if (item.state && item.state._text !== 'EXPECTED') {
              ++count;
            }
          }
        });
        board.checked = count === board.notices.length;
        board.indeterminate = count > 0 && !board.checked;
      }
      this.checkParent(boards, checked);
    } else {
      board.checked = checked;
      if (board.numOfNotices !== board.numOfExpectingOrders) {
        this.object.isDelete = true;
      }
      board.notices?.forEach(val => {
        if (val.state && val.state._text !== 'EXPECTED') {
          if (checked) {
            this.object.mapOfCheckedId.add(val.id + '__' + board.path);
          } else {
            this.object.mapOfCheckedId.delete(val.id + '__' + board.path);
          }
        }
      });
    }
    if (this.object.setOfCheckedId.size == 0) {
      this.object.isDelete = false;
    }
    this.object.checked = this.object.setOfCheckedId.size === boards.length;
    this.object.indeterminate = this.object.setOfCheckedId.size > 0 && !this.object.checked;
  }

  private checkParent(boards, isChecked, isParent = false): void {
    if (boards) {
      boards.forEach(item => {
        if (isChecked && (item.checked || item.indeterminate)) {
          if (item.numOfNotices !== item.numOfExpectingOrders) {
            this.object.isDelete = true;
          }
          this.object.setOfCheckedId.add(item.path);
        }

        let count = 0;
        if (item.notices) {
          item.notices.forEach(val => {
            if (val.state && val.state._text !== 'EXPECTED') {
              if (isChecked) {
                ++count;
                if (isParent) {
                  this.object.mapOfCheckedId.add(val.id + '__' + item.path);
                }
              } else {
                if (isParent) {
                  this.object.mapOfCheckedId.delete(val.id + '__' + item.path);
                }
              }
            }
          });
          if (!isParent) {
            if (count == 0) {
              this.object.setOfCheckedId.delete(item.path);
            }
          } else {
            item.checked = count === item.notices.length;
            item.indeterminate = count > 0 && !item.checked;
          }
        }

      });
    }
  }

  postAllNotices(): void {
    const paths = Array.from(this.object.setOfCheckedId);
    this.modal.create({
      nzTitle: undefined,
      nzContent: PostModalComponent,
      nzClassName: 'lg',
      nzAutofocus: null,
      nzData: {
        paths,
        controllerId: this.schedulerIds.selected,
        preferences: this.preferences
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
  }

  post(board: any, notice = null): void {

    this.modal.create({
      nzTitle: undefined,
      nzContent: PostModalComponent,
      nzClassName: 'lg',
      nzAutofocus: null,
      nzData: {
        board,
        notice,
        controllerId: this.schedulerIds.selected,
        preferences: this.preferences,
        singular: true
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
  }

  deleteAllNotices(): void {
    this.delete(null, null);
  }

  delete(board, notice): void {
    if (this.preferences.auditLog) {
      const comments = {
        radio: 'predefined',
        type: 'Notice Board',
        operation: 'Delete',
        name: notice?.id
      };
      const modal = this.modal.create({
        nzTitle: undefined,
        nzContent: CommentModalComponent,
        nzData: {
          comments,
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      });
      modal.afterClose.subscribe(result => {
        if (result) {
          this._delete(board, notice, result);
        }
      });
    } else {
      const modal = this.modal.create({
        nzTitle: undefined,
        nzContent: ConfirmModalComponent,
        nzData: {
          type: 'Delete',
          title: 'delete',
          message: notice ? 'deleteNotice' : 'deleteSelectedNotice',
          objectName: notice?.id
        },
        nzFooter: null,
        nzClosable: false,
        nzMaskClosable: false
      });
      modal.afterClose.subscribe((result) => {
        if (result) {
          this._delete(board, notice, {});
        }
      });
    }
  }

  private _delete(board, notice, comments): void {
    if (notice) {
      this.coreService.post('notice/delete', {
        controllerId: this.schedulerIds.selected,
        noticeBoardPath: board.path,
        noticeId: notice.id,
        auditLog: comments
      }).subscribe(() => {
        for (let i = 0; i < board.notices.length; i++) {
          if (board.notices[i].id === notice.id) {
            board.notices.splice(i, 1);
            break;
          }
        }
        board.notices = [...board.notices];
      });
    } else {
      this.deleteAll(board, comments);
    }
  }

  private deleteAll(board, comments): void {
    if (board) {
      if (!board.notices) {
        this.getNoticeBoards({
          noticeBoardPaths: [board.path],
          controllerId: this.schedulerIds.selected
        }, (data) => {
          if (data && data.length > 0) {
            board.notices = data[0].notices;
            this._deleteAll(board, comments);
          }
        });
      } else {
        this._deleteAll(board, comments);
      }
    } else {

      let arr = Array.from(this.object.mapOfCheckedId);
      let obj: any = {};
      arr.forEach((item: string) => {
        let path = item.substring(item.lastIndexOf('__') + 2, item.length);
        if (path) {
          this.object.setOfCheckedId.delete(path);
        }
        let id = item.substring(0, item.lastIndexOf('__'));
        if (!obj[path]) {
          obj[path] = [];
        }
        obj[path].push(id);
      });
      for (let i in obj) {
        this.coreService.post('notices/delete', {
          controllerId: this.schedulerIds.selected,
          noticeBoardPath: i,
          noticeIds: obj[i],
          auditLog: comments
        }).subscribe();
      }
      const arr2 = Array.from(this.object.setOfCheckedId);
      this.getPathAndDelete(arr2, comments);
      this.reset();
    }
  }

  private getPathAndDelete(paths, comments): void {
    this.getNoticeBoards({
      noticeBoardPaths: paths,
      controllerId: this.schedulerIds.selected
    }, (data) => {
      if (data && data.length > 0) {
        data.forEach(board => {
          this._deleteAll(board, comments);
        })
      }
    });
  }

  private _deleteAll(board, comments): void {
    let ids = [];
    if (board.notices) {
      board.notices.forEach(item => {
        if (item.state && item.state._text !== 'EXPECTED') {
          ids.push(item.id);
        }
      });
    }
    if (ids.length > 0) {
      this.coreService.post('notices/delete', {
        controllerId: this.schedulerIds.selected,
        noticeBoardPath: board.path,
        noticeIds: ids,
        auditLog: comments
      }).subscribe(() => {
        board.notices = board.notices.filter(item => {
          return (item.state && item.state._text === 'EXPECTED');
        });
        board.notices = [...board.notices];
      });
    }
  }

  reload(): void {
    if (this.reloadState === 'no') {
      this.boards = [];
      this.data = [];
      this.reloadState = 'yes';
      this.loading = false;
      this.pendingHTTPRequests$.next();
    } else if (this.reloadState === 'yes') {
      this.loading = true;
      this.loadBoards();
    }
  }

  getLastPartOfWorkflow(workflow: string): string {
    if (workflow) {
      const parts = workflow.split('/');
      return parts[parts.length - 1];
    }
    return '';
  }
}

