import {Component, OnInit, OnDestroy, ViewChild, Input} from '@angular/core';
import {Subscription} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import * as moment from 'moment';
import {differenceInCalendarDays} from 'date-fns';
import {NzModalRef, NzModalService} from 'ng-zorro-antd/modal';
import {CoreService} from '../../../services/core.service';
import {AuthService} from '../../../components/guard';
import {DataService} from '../../../services/data.service';
import {TreeComponent} from '../../../components/tree-navigation/tree.component';
import {SearchPipe} from '../../../pipes/core.pipe';
import {ConfirmModalComponent} from '../../../components/comfirm-modal/confirm.component';

declare const $: any;

// Role Actions
@Component({
  selector: 'app-post-notice-modal',
  templateUrl: './post-notice-dialog.html'
})
export class PostModalComponent implements OnInit {
  @Input() controllerId: string;
  @Input() preferences: any;
  @Input() board: any;

  viewDate = new Date();
  submitted = false;
  postObj: any = {};
  dateFormat: any;
  zones = [];

  constructor(public activeModal: NzModalRef, private coreService: CoreService) {
  }

  ngOnInit(): void {
    this.dateFormat = this.coreService.getDateFormatWithTime(this.preferences.dateFormat);
    this.zones = this.coreService.getTimeZoneList();
    this.postObj.timeZone = this.coreService.getTimeZone();
    this.postObj.at = 'date';
    this.postObj.noticeId = this.coreService.getStringDate(null);
  }

  disabledDate = (current: Date): boolean => {
    // Can not select days before today and today
    return differenceInCalendarDays(current, this.viewDate) < 0;
  }

  onSubmit(): void {
    this.submitted = true;
    const obj: any = {
      controllerId: this.controllerId,
      noticeBoardPath: this.board.path,
      noticeId: this.postObj.noticeId,
      timeZone : this.postObj.timeZone
    };
    if (this.postObj.at === 'date') {
      if (this.postObj.fromDate) {
        obj.endOfLife = moment(this.postObj.fromDate).format('YYYY-MM-DD HH:mm:ss');
      }
    } else if (this.postObj.at === 'later') {
      obj.endOfLife = this.postObj.atTime;
    }
    this.coreService.post('notice/post', obj).subscribe((res) => {
      this.submitted = false;
      this.activeModal.close(res);
    }, () => {
      this.submitted = false;
    });
  }
}

@Component({
  selector: 'app-single-board',
  templateUrl: './single-board.component.html'
})
export class SingleBoardComponent implements OnInit, OnDestroy {
  loading: boolean;
  controllerId: any = {};
  preferences: any = {};
  permission: any = {};
  boards: any = [];
  name: string;
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
    if (sessionStorage.preferences) {
      this.preferences = JSON.parse(sessionStorage.preferences);
    }
    this.permission = JSON.parse(this.authService.permission) || {};
    this.getBoardsList({
      controllerId: this.controllerId,
      noticeBoardPaths	: [this.name]
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private getBoardsList(obj): void {
    this.coreService.post('notice/boards', obj).subscribe((res: any) => {
      this.loading = false;
      this.boards = res.noticeBoards;
    }, () => {
      this.loading = false;
    });
  }

  post(board): void {
    this.modal.create({
      nzTitle: null,
      nzContent: PostModalComponent,
      nzClassName: 'lg',
      nzComponentParams: {
        board,
        controllerId: this.controllerId,
        preferences: this.preferences
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
  }

  delete(board, notice): void {
    const modal = this.modal.create({
      nzTitle: null,
      nzContent: ConfirmModalComponent,
      nzComponentParams: {
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
        this.coreService.post('notice/delete', {
          controllerId: this.controllerId,
          noticeBoardPath: board.path,
          noticeId: notice.id
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
    });
  }

  private refresh(args): void {
    if (args.eventSnapshots && args.eventSnapshots.length > 0) {
      for (let j = 0; j < args.eventSnapshots.length; j++) {
        if (args.eventSnapshots[j].eventType === 'NoticeBoardStateChanged' && args.eventSnapshots[j].path && args.eventSnapshots[j].path.indexOf(this.name) > -1) {
          const obj = {
            controllerId: this.controllerId,
            noticeBoardPath : this.name
          };
          this.coreService.post('notice/board', obj).subscribe((res: any) => {
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
export class BoardComponent implements OnInit, OnDestroy {
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
  subscription1: Subscription;
  subscription2: Subscription;

  @ViewChild(TreeComponent, {static: false}) child;

  constructor(private authService: AuthService, public coreService: CoreService, private modal: NzModalService,
              private searchPipe: SearchPipe, private dataService: DataService) {
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
  }

  ngOnDestroy(): void {
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
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
    $('.scroll-y').remove();
  }

  initTree(): void {
    if (this.schedulerIds.selected) {
      this.coreService.post('tree', {
        controllerId: this.schedulerIds.selected,
        types: ['NOTICEBOARD']
      }).subscribe(res => {
        this.tree = this.coreService.prepareTree(res, true);
        if (this.tree.length) {
          this.loadBoards();
        }
        this.isLoading = true;
      }, () => {
        this.isLoading = true;
      });
    } else {
      this.isLoading = true;
    }
  }

  loadBoards(): void {
    const obj = {
      folders: [],
      controllerId: this.schedulerIds.selected
    };
    this.boards = [];
    this.loading = true;
    let paths = [];
    if (this.child) {
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

  pageIndexChange($event): void {
    this.boardsFilters.currentPage = $event;
  }

  pageSizeChange($event): void {
    this.boardsFilters.entryPerPage = $event;
  }

  sort(propertyName): void {
    this.boardsFilters.reverse = !this.boardsFilters.reverse;
    this.boardsFilters.filter.sortBy = propertyName;
  }

  receiveMessage($event): void {
    this.pageView = $event;
  }

  private refresh(args): void {
    if (args.eventSnapshots && args.eventSnapshots.length > 0) {
      let flag = false;
      const noticeBoardPaths = [];
      for (let j = 0; j < args.eventSnapshots.length; j++) {
        if (args.eventSnapshots[j].eventType === 'NoticeBoardStateChanged' && args.eventSnapshots[j].path) {
          if (this.boards.length > 0) {
            for (let x = 0; x < this.boards.length; x++) {
              if (this.boards[x].path === args.eventSnapshots[j].path) {
                noticeBoardPaths.push(this.boards[x].path);
              }
            }
          }
        } else if (args.eventSnapshots[j].eventType.match(/Item/) && args.eventSnapshots[j].objectType === 'NOTICEBOARD') {
          flag = true;
        }
      }
      if (noticeBoardPaths && noticeBoardPaths.length) {
        this.coreService.post('notice/boards', {
          controllerId: this.schedulerIds.selected,
          noticeBoardPaths
        }).subscribe((res: any) => {
          res.noticeBoards.forEach((value) => {
            for (let x = 0; x < this.boards.length; x++) {
              if (this.boards[x].path === value.path) {
                this.boards[x].notices = value.notices;
                break;
              }
            }
          });
          this.boards = [...this.boards];
        }, () => {
          this.loading = false;
        });
      }
      if (flag) {
        this.initTree();
      }
    }
  }

  private init(): void {
    this.boardsFilters = this.coreService.getResourceTab().boards;
    this.coreService.getResourceTab().state = 'boards';
    this.preferences = sessionStorage.preferences ? JSON.parse(sessionStorage.preferences) : {};
    this.schedulerIds = this.authService.scheduleIds ? JSON.parse(this.authService.scheduleIds) : {};
    this.permission = this.authService.permission ? JSON.parse(this.authService.permission) : {};
    if (localStorage.views) {
      this.pageView = JSON.parse(localStorage.views).board;
    }
    if (!this.pageView) {
      if (sessionStorage.preferences) {
        if (JSON.parse(sessionStorage.preferences).pageView) {
          this.pageView = JSON.parse(sessionStorage.preferences).pageView;
        }
      }
    }
    this.initTree();
  }

  private getBoardsList(obj): void {
    this.coreService.post('notice/boards', obj).subscribe((res: any) => {
      this.loading = false;
      res.noticeBoards.forEach((value) => {
        value.name = value.path.substring(value.path.lastIndexOf('/') + 1);
        value.path1 = value.path.substring(0, value.path.lastIndexOf('/')) || value.path.substring(0, value.path.lastIndexOf('/') + 1);
        value.numOfNotices = value.notices.length;
        if (this.boardsFilters.expandedObjects && this.boardsFilters.expandedObjects.length > 0) {
          const index = this.boardsFilters.expandedObjects.indexOf(value.path);
          if (index > -1) {
            value.show = true;
            this.boardsFilters.expandedObjects.slice(index, 1);
          }
        }
      });
      this.boards = res.noticeBoards;
      this.searchInResult();
    }, () => {
      this.loading = false;
    });
  }

  searchInResult(): void {
    this.data = this.boardsFilters.searchText ? this.searchPipe.transform(this.boards, this.boardsFilters.searchText, this.searchableProperties) : this.boards;
    this.data = [...this.data];
  }

  expandDetails(): void {
    this.data.forEach((value) => {
      value.show = true;
    });
  }

  collapseDetails(): void {
    this.data.forEach((value) => {
      value.show = false;
    });
  }

  post(board): void {
    this.modal.create({
      nzTitle: null,
      nzContent: PostModalComponent,
      nzClassName: 'lg',
      nzComponentParams: {
        board,
        controllerId: this.schedulerIds.selected,
        preferences: this.preferences
      },
      nzFooter: null,
      nzClosable: false,
      nzMaskClosable: false
    });
  }

  delete(board, notice): void {
    const modal = this.modal.create({
      nzTitle: null,
      nzContent: ConfirmModalComponent,
      nzComponentParams: {
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
        this.coreService.post('notice/delete', {
          controllerId: this.schedulerIds.selected,
          noticeBoardPath: board.path,
          noticeId: notice.id
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
    });
  }
}

