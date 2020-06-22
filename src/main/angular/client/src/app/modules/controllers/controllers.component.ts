import {Component, OnInit} from '@angular/core';
import { NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {CoreService} from '../../services/core.service';
import {StartUpModalComponent} from '../start-up/start-up.component';
import {ConfirmModalComponent} from '../../components/comfirm-modal/confirm.component';
import {AuthService} from '../../components/guard';
import {DataService} from '../../services/data.service';


@Component({
  selector: 'app-controllers',
  templateUrl: './controllers.component.html'
})
export class ControllersComponent implements OnInit {
  controllers: any = [];


  constructor(private coreService: CoreService, private modalService: NgbModal, private authService: AuthService,
              private dataService: DataService) {

  }

  ngOnInit(): void {
    this.getData();
  }

  getData(): void {
    this.coreService.post('jobscheduler/ids', {})
      .subscribe((data: any) => {
        this.controllers = data.jobschedulerIds;
      }, () => {

      });
  }


  addController() {
    const modalRef = this.modalService.open(StartUpModalComponent, {backdrop: 'static'});
    modalRef.componentInstance.isModal = true;
    modalRef.componentInstance.new = true;
    modalRef.componentInstance.modalRef = modalRef;
    modalRef.result.then((permission) => {
      this.getSchedulerIds(permission);
    }, () => {

    });
  }

  editController(matser) {
    this.coreService.post('jobscheduler/controllers/p', {jobschedulerId: matser}).subscribe((res: any) => {
      const modalRef = this.modalService.open(StartUpModalComponent, {backdrop: 'static'});
      modalRef.componentInstance.isModal = true;
      modalRef.componentInstance.controllerInfo = res.controllers;
      modalRef.componentInstance.modalRef = modalRef;
      modalRef.result.then((result) => {
        console.log(result);
        this.getSchedulerIds(null);
      }, () => {

      });
    });
  }

  deleteController(matser) {
    const modalRef = this.modalService.open(ConfirmModalComponent, {backdrop: 'static'});
    modalRef.componentInstance.title = 'delete';
    modalRef.componentInstance.message = 'deleteController';
    modalRef.componentInstance.type = 'Delete';
    modalRef.componentInstance.objectName = matser;
    modalRef.result.then((result) => {
      this.coreService.post('jobscheduler/cleanup', {jobschedulerId: matser}).subscribe((res: any) => {
        this.getSchedulerIds(null);
      });
    }, () => {

    });
  }

  private checkIsFirstEntry(_permission) {
    this.authService.setPermissions(_permission);
    this.authService.save();
    if (this.controllers.length == 1) {
      this.authService.savePermission(this.controllers[0]);
      this.dataService.switchScheduler(this.controllers[0]);
    }
  }

  private getSchedulerIds(permission): void {
    this.coreService.post('jobscheduler/ids', {}).subscribe((res: any) => {
      this.controllers = res.jobschedulerIds;
      this.authService.setIds(res);
      this.authService.save();
      if (permission) {
        this.checkIsFirstEntry(permission);
      }
      this.dataService.isProfileReload.next(true);
    }, err => console.log(err));
  }
}
