import {Component, OnInit, Input, OnDestroy} from '@angular/core';
import {Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {CoreService} from '../../../services/core.service';
import {AuthService} from '../../../components/guard';
import {NgbModal, NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';
import {DataService} from '../data.service';
import {ConfirmModalComponent} from '../../../components/comfirm-modal/confirm.component';
import * as _ from 'underscore';

@Component({
  selector: 'app-ngbd-modal-content',
  templateUrl: './user-dialog.html'
})
export class AccountModalComponent implements OnInit {
  submitted = false;
  isUnique = true;
  currentUser: any = {};

  @Input() newUser = false;
  @Input() copy = false;
  @Input() userDetail: any;
  @Input() oldUser: any;
  @Input() allRoles: any;

  constructor(public activeModal: NgbActiveModal, private coreService: CoreService) {
  }

  ngOnInit() {
    if (this.oldUser) {
      this.currentUser = _.clone(this.oldUser);
      this.currentUser.fakePassword = '00000000';
      this.currentUser.userName = this.currentUser.user;
      if (this.copy) {
        this.currentUser.user = '';
      }
    } else {
      this.currentUser = {
        user: '',
        fakePassword: '',
        roles: []
      };
    }
  }

  checkUser(newUser, existingUser): void {
    this.isUnique = true;
    for (let i = 0; i < this.userDetail.users.length; i++) {
      if (this.userDetail.users[i].user === newUser && newUser !== existingUser) {
        this.isUnique = false;
        break;
      }
    }
  }

  onSubmit(obj): void {
    this.submitted = true;
    this.isUnique = true;

    if (obj.fakePassword !== '00000000') {
      obj.password = obj.fakePassword || '';
    }

    if (this.newUser || this.copy) {
      let data = {
        user: obj.user,
        password: obj.password,
        roles: obj.roles
      };
      this.userDetail.users.push(data);
    } else {
      for (let i = 0; i < this.userDetail.users.length; i++) {
        if (this.userDetail.users[i] === this.oldUser || _.isEqual(this.userDetail.users[i], this.oldUser)) {
          this.userDetail.users[i].user = obj.user;
          this.userDetail.users[i].password = obj.password;
          this.userDetail.users[i].roles = obj.roles;
          break;
        }
      }
    }

    this.coreService.post('authentication/shiro/store', this.userDetail).subscribe(res => {
      this.submitted = false;
      this.activeModal.close(this.userDetail.users);
    }, err => {
      this.submitted = false;
    });
  }

}

// Main Component
@Component({
  selector: 'app-accounts-all',
  templateUrl: 'accounts.component.html'
})
export class AccountsComponent implements OnInit, OnDestroy {

  loading =  true;
  preferences: any = {};
  users: any = [];
  roles: any = [];
  order = 'user';
  reverse = false;
  usr: any = {};
  userDetail: any = {};
  temp: any = 0;
  searchKey: string;
  username: string;
  subscription1: Subscription;
  subscription2: Subscription;
  subscription3: Subscription;

  constructor(private router: Router, private authService: AuthService, private coreService: CoreService, private modalService: NgbModal, private dataService: DataService) {
    this.subscription1 = this.dataService.searchKeyAnnounced$.subscribe(res => {
      this.searchKey = res;
    });
    this.subscription2 = this.dataService.dataAnnounced$.subscribe(res => {
      if (res) {
        this.setUserData(res);
      }
    });
    this.subscription3 = this.dataService.functionAnnounced$.subscribe(res => {
      if (res === 'ADD') {
        this.addUser();
      }
    });
  }

  ngOnInit(): void {
    this.usr = {currentPage: 1};
    this.preferences = sessionStorage.preferences ? JSON.parse(sessionStorage.preferences) : {};
    this.username = this.authService.currentUserData;

  }

  setUserData(res): void {
    this.userDetail = res;
    this.users = res.users;
    setTimeout(() => {
      this.loading = false;
    }, 300);
    this.getRoles();
  }

  ngOnDestroy(): void {
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
    this.subscription3.unsubscribe();
  }

  saveInfo(): void {
    let obj = {
      users: this.users,
      roles: this.userDetail.roles,
      main: this.userDetail.main
    };

    this.coreService.post('authentication/shiro/store', obj).subscribe(res => {
      this.users = [...this.users];
    }, err => {

    });
  }

  getRoles(): void {
    if (this.roles.length === 0) {
      this.coreService.post('authentication/permissions', {}).subscribe((res: any) => {
        this.roles = res.SOSPermissionRoles.SOSPermissionRole;
      });
    }
  }

  showRole(user): void {
    this.router.navigate(['/users/role'], {queryParams: {user}});
  }

  addUser(): void {
    const modalRef = this.modalService.open(AccountModalComponent, {backdrop: 'static'});
    modalRef.componentInstance.userDetail = this.userDetail;
    modalRef.componentInstance.allRoles = this.roles;
    modalRef.componentInstance.newUser = true;
    modalRef.result.then((result) => {
      this.users = result;
      this.users = [...this.users];
    }, () => {

    });
  }

  editUser(user): void {
    const modalRef = this.modalService.open(AccountModalComponent, {backdrop: 'static'});
    modalRef.componentInstance.userDetail = this.userDetail;
    modalRef.componentInstance.allRoles = this.roles;
    modalRef.componentInstance.oldUser = user;
    modalRef.result.then((result) => {
      this.users = result;
      this.users = [...this.users];
    }, () => {

    });
  }

  copyUser(user): void {
    const modalRef = this.modalService.open(AccountModalComponent, {backdrop: 'static'});
    modalRef.componentInstance.userDetail = this.userDetail;
    modalRef.componentInstance.copy = true;
    modalRef.componentInstance.oldUser = user;
    modalRef.result.then((result) => {
      this.users = result;
      this.users = [...this.users];
    }, () => {

    });
  }

  deleteUser(user, i): void {
    const modalRef = this.modalService.open(ConfirmModalComponent);
    modalRef.componentInstance.title = 'delete';
    modalRef.componentInstance.message = 'deleteUser';
    modalRef.componentInstance.type = 'Delete';
    modalRef.componentInstance.objectName = user;
    modalRef.result.then((result) => {
      this.users.splice(i, 1);
      this.saveInfo();
    }, () => {
    });
  }

  sort(key): void {
    this.usr.reverse = !this.usr.reverse;
    this.usr.sortBy = key;
  }

}
