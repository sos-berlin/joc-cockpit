import {CoreService} from '../../../services/core.service';
import {DataService} from '../data.service';
import {Component, OnInit, Input} from '@angular/core';
import {Subscription} from 'rxjs';
import {DeleteModalComponent} from '../../../components/delete-modal/delete.component';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'underscore';

@Component({
  selector: 'app-profiles',
  templateUrl: './profiles.component.html',
  styleUrls: ['./profiles.component.css']
})
export class ProfilesComponent implements OnInit {
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
      if (res === 'DELETE_PROFILES')
        this.deleteMainProfile();
    });
  }


  ngOnInit() {
    this.preferences = JSON.parse(sessionStorage.preferences);
  }

  setUserData(res) {
    this.users = res;
    if (res)
      this.profiles = res.profiles;
  }

  checkAllProfileFnc() {
    if (!this.checkAll.checkbox && this.profiles.length > 0) {
      let data = this.profiles.slice((this.preferences.entryPerPage * (this.prof.currentPage - 1)), (this.preferences.entryPerPage * this.prof.currentPage));
      this.object.profiles = [];
      let self = this;
      data.forEach(function (data) {
        self.object.profiles.push(data);
      });
    } else {
      this.object.profiles = [];
    }
  }

  checkProfileFnc(profile, i, event) {
    let checked = event.target.checked;
    if (checked) {
      if (this.object.profile) {
      } else {
        this.object.profile = [];
        this.object.profiles = [];
      }
      this.object.profile.push(profile);
      this.object.profiles = _.clone(this.object.profile);
    } else {
      for (let j = 0; j < this.object.profile.length; j++) {
        if (profile.account == this.object.profile[j].account)
          this.object.profile.splice(j, 1);
        this.object.profiles = _.clone(this.object.profile);
      }
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
      if (this.object && this.object.profiles)
        for (let i = 0; i < this.object.profiles.length; i++) {
          for (let j = 0; j < this.profiles.length; j++) {
            if (this.profiles[j].account === this.object.profiles[i].account) {
              this.profiles.splice(j, 1);
              break;
            }
          }
        }
      this.object.profiles = [];
      this.saveInfo();
    }, (reason) => {
      console.log('close...', reason);
    });
  }

  saveInfo() {
    let obj = {
      users: this.users.users,
      masters: this.users.masters,
      main: this.users.main,
      profiles: this.profiles
    };
    console.log(obj);
    this.coreService.post('security_configuration/write', obj).subscribe(res => {
      console.log(res);
    }, err => {

    });
  }


}
