import {Component, OnInit, OnDestroy, Input} from '@angular/core';
import {Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {ConfirmModalComponent} from '../../../components/comfirm-modal/confirm.component';
import {CoreService} from '../../../services/core.service';
import {DataService} from '../data.service';


@Component({
  selector: 'app-profiles',
  templateUrl: './profiles.component.html',
  styleUrls: ['./profiles.component.css']
})
export class ProfilesComponent implements OnInit, OnDestroy {
  preferences: any = {};
  profiles: any = [];
  subscription1: Subscription;
  subscription2: Subscription;
  checkAll: any = {checkbox: false};
  users: any;
  object: any = [{profiles: []}];
  searchKey: string;
  prof: any = {currentPage: 1};
  order = 'user';
  loading = true;
  reverse = false;

  constructor(private dataService: DataService, private modalService: NgbModal, private coreService: CoreService, private router: Router) {
    this.subscription1 = this.dataService.dataAnnounced$.subscribe(res => {
      this.setUserData(res);
    });

    this.subscription2 = this.dataService.functionAnnounced$.subscribe(res => {
      if (res === 'RESET_PROFILES') {
        this.resetMainProfile();
      }
    });
  }


  ngOnInit() {
    this.preferences = JSON.parse(sessionStorage.preferences);
  }

  ngOnDestroy() {
    this.subscription1.unsubscribe();
    this.subscription2.unsubscribe();
  }

  setUserData(res) {
    this.users = res;
    if (res) {
      this.profiles = res.profiles;
      setTimeout(() => {
        this.loading = false;
      }, 400);
    }
  }

  checkAllProfileFnc() {
    if (this.checkAll.checkbox && this.profiles.length > 0) {
      this.object.profiles = this.profiles.slice((this.preferences.entryPerPage * (this.prof.currentPage - 1)), (this.preferences.entryPerPage * this.prof.currentPage));
      this.dataService.announceFunction('IS_RESET_PROFILES_TRUE');
    } else {
      this.object.profiles = [];
      this.dataService.announceFunction('IS_RESET_PROFILES_FALSE');
    }
  }

  checkProfileFnc(profile, i, event) {
    if (event.target.checked) {
      this.checkAll.checkbox = this.object.profiles.length === this.profiles.slice((this.preferences.entryPerPage * (this.prof.currentPage - 1)), (this.preferences.entryPerPage * this.prof.currentPage)).length;
    } else {
      this.object.profiles = [];
      this.checkAll.checkbox = false;
    }
    if (this.object.profiles.length > 0) {
      this.dataService.announceFunction('IS_RESET_PROFILES_TRUE');
    } else {
      this.dataService.announceFunction('IS_RESET_PROFILES_FALSE');
    }
  }

  resetProfile(profile) {
    const modalRef = this.modalService.open(ConfirmModalComponent, {backdrop: 'static'});
    modalRef.componentInstance.title = 'resetProfile';
    modalRef.componentInstance.message = 'resetSingleProfile';
    modalRef.componentInstance.type = 'Reset';
    modalRef.componentInstance.objectName = profile.account;
    modalRef.result.then((result) => {
      this.deleteProfile(profile);
    }, (reason) => {
      console.log('close...', reason);
    });
  }

  resetMainProfile() {
    const modalRef = this.modalService.open(ConfirmModalComponent, {backdrop: 'static'});
    modalRef.componentInstance.title = 'resetAllProfile';
    modalRef.componentInstance.message = 'resetDefaultProfile';
    modalRef.componentInstance.type = 'Reset';
    modalRef.componentInstance.resetProfiles = this.object.profiles;
    modalRef.result.then((result) => {
      this.deleteProfile(null);
    }, (reason) => {
      console.log('close...', reason);
    });
  }

  private deleteProfile(profile) {
    let obj = {accounts: []};
    if (profile) {
      obj.accounts.push(profile.account);
    } else {
      for (let i = 0; i < this.object.profiles.length; i++) {
        obj.accounts.push(this.object.profiles[i].account);
      }
    }
    this.coreService.post('configurations/delete', obj).subscribe(res => {
      console.log(res);
      if (profile) {
        for (let i = 0; i < this.profiles.length; i++) {
          if (this.profiles[i].account === profile.account) {
            this.profiles.splice(i, 1);
            break;
          }
        }
      } else {
        if (this.object && this.object.profiles) {
          for (let i = 0; i < this.object.profiles.length; i++) {
            for (let j = 0; j < this.profiles.length; j++) {
              if (this.profiles[j].account === this.object.profiles[i].account) {
                this.profiles.splice(j, 1);
                break;
              }
            }
          }
        }
      }
      this.object.profiles = [];
    }, err => {

    });
  }

  showMaster (user) {
    this.router.navigate(['/users/master'], {queryParams: {user: user}});
  }


  saveInfo() {
    let obj = {
      users: this.users.users,
      masters: this.users.masters,
      main: this.users.main,
      profiles: this.profiles
    };
    this.coreService.post('security_configuration/write', obj).subscribe(res => {
      console.log(res);
    }, err => {

    });
  }

}
