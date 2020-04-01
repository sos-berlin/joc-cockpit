import {Component, OnInit} from '@angular/core';
import { NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {CoreService} from '../../services/core.service';
import {StartUpModalComponent} from '../start-up/start-up.component';
import {ConfirmModalComponent} from '../../components/comfirm-modal/confirm.component';
import {AuthService} from '../../components/guard';
import {DataService} from '../../services/data.service';


@Component({
  selector: 'app-masters',
  templateUrl: './masters.component.html',
  styleUrls: ['./masters.component.css']
})
export class MastersComponent implements OnInit {
  masters: any = [];


  constructor(private coreService: CoreService, private modalService: NgbModal, private authService: AuthService,
              private dataService: DataService) {

  }

  ngOnInit(): void {
    this.getData();
  }

  getData(): void {
    this.coreService.post('jobscheduler/ids', {})
      .subscribe((data: any) => {
        this.masters = data.jobschedulerIds;
      }, () => {

      });
  }


  addMaster() {
    const modalRef = this.modalService.open(StartUpModalComponent, {backdrop: 'static'});
    modalRef.componentInstance.isModal = true;
    modalRef.componentInstance.new = true;
    modalRef.componentInstance.modalRef = modalRef;
    modalRef.result.then((permission) => {
      this.getSchedulerIds();
      this.authService.setPermissions(permission);
      this.authService.save();
    }, () => {

    });
  }

  editMaster(matser) {
    this.coreService.post('jobscheduler/masters/p', {jobschedulerId: matser}).subscribe((res: any) => {
      const modalRef = this.modalService.open(StartUpModalComponent, {backdrop: 'static'});
      modalRef.componentInstance.isModal = true;
      modalRef.componentInstance.masterInfo = res.masters;
      modalRef.componentInstance.modalRef = modalRef;
      modalRef.result.then((result) => {
        console.log(result);
        this.getSchedulerIds();
      }, () => {

      });
    });
  }

  deleteMaster(matser) {
    const modalRef = this.modalService.open(ConfirmModalComponent, {backdrop: 'static'});
    modalRef.componentInstance.title = 'delete';
    modalRef.componentInstance.message = 'deleteMaster';
    modalRef.componentInstance.type = 'Delete';
    modalRef.componentInstance.objectName = matser;
    modalRef.result.then((result) => {
      this.getSchedulerIds();
    }, () => {

    });
  }

  private getSchedulerIds(): void {
    this.coreService.post('jobscheduler/ids', {}).subscribe((res: any) => {
      this.masters = res.jobschedulerIds;
      this.authService.setIds(res);
      this.authService.save();
      this.dataService.isProfileReload.next(true);
    }, err => console.log(err));
  }
}
