import {CoreService} from '../../../services/core.service';
import {DataService} from '../data.service';
import {Component, OnInit, OnDestroy} from '@angular/core';
import {Subscription} from 'rxjs';
import {DeleteModalComponent} from '../../../components/delete-modal/delete.component';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {Router} from '@angular/router';

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

  constructor(private dataService: DataService, private modalService: NgbModal, private coreService: CoreService) {
    this.subscription1 = this.dataService.dataAnnounced$.subscribe(res => {
      this.setUserData(res);
    });

    this.subscription2 = this.dataService.functionAnnounced$.subscribe(res => {
      if (res === 'DELETE_PROFILES') {
        this.deleteMainProfile();
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
    }
  }

  checkAllProfileFnc() {
    if (this.checkAll.checkbox && this.profiles.length > 0) {
      this.object.profiles = this.profiles.slice((this.preferences.entryPerPage * (this.prof.currentPage - 1)), (this.preferences.entryPerPage * this.prof.currentPage));
      this.dataService.announceFunction('IS_DELETE_PROFILES_TRUE');
    } else {
      this.object.profiles = [];
      this.dataService.announceFunction('IS_DELETE_PROFILES_FALSE');
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
      this.dataService.announceFunction('IS_DELETE_PROFILES_TRUE');
    } else {
      this.dataService.announceFunction('IS_DELETE_PROFILES_FALSE');
    }
  }

  deleteProfile(i) {
    this.profiles.splice(i, 1);
    this.saveInfo();
  }

  deleteMainProfile() {
    const modalRef = this.modalService.open(DeleteModalComponent, {backdrop: 'static'});
    modalRef.componentInstance.object = this.object;
    modalRef.result.then((result) => {
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
      this.object.profiles = [];
      this.saveInfo();
    }, (reason) => {
      console.log('close...', reason);
    });
  }

  showMaster (user) {
    this.router.navigate(['/users/master']);
    console.log(user)
    //this.selectUser(user);
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
