import {Component, OnInit} from '@angular/core';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
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
  data: any = [];
  controllers: any = [];
  currentSecurityLevel: string;

  constructor(private coreService: CoreService, private modalService: NgbModal, private authService: AuthService,
              private dataService: DataService) {
  }

  ngOnInit(): void {
    this.getData();
  }

  getData(): void {
    this.coreService.post('controller/ids', {})
      .subscribe((data: any) => {
        this.data = data.controllerIds;
        this.getSecurity();
      });
  }

  private getSecurity() {
    this.coreService.post('controllers/security_level', {})
      .subscribe((data: any) => {
        this.mergeData(data);
      }, (err) => {
        this.mergeData(null);
      });
  }

  private mergeData(securityData) {
    this.controllers = [];
    this.currentSecurityLevel = securityData ? securityData.currentSecurityLevel : '';
    if (this.data.length > 0) {
      for (let i = 0; i < this.data.length; i++) {
        const obj: any = {
          controllerId: this.data[i]
        };
        if (securityData) {
          for (let j = 0; j < securityData.controllers.length; j++) {
            if (this.data[i] === securityData.controllers[j].controllerId) {
              obj.securityLevel = securityData.controllers[j].securityLevel;
              securityData.controllers.splice(j, 1);
              break;
            }
          }
        }
        this.controllers.push(obj);
      }
    } else if (securityData) {
      this.controllers = securityData.controllers;
    }
  }

  migrateController(controller) {
    this.coreService.post('controllers/security_level/take_over', {controllerId: controller})
      .subscribe((data: any) => {
        this.getSecurity();
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

  editController(controller) {
    this.coreService.post('controllers/p', {controllerId: controller}).subscribe((res: any) => {
      const modalRef = this.modalService.open(StartUpModalComponent, {backdrop: 'static'});
      modalRef.componentInstance.isModal = true;
      modalRef.componentInstance.controllerInfo = res.controllers;
      modalRef.componentInstance.agents = res.agents;
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
      this.coreService.post('controller/cleanup', {controllerId: matser}).subscribe((res: any) => {
        this.getSchedulerIds(null);
      });
    }, () => {

    });
  }

  private checkIsFirstEntry(_permission) {
    this.authService.setPermissions(_permission);
    this.authService.save();
    if (this.controllers.length === 1) {
      this.authService.savePermission(this.controllers[0]);
      this.dataService.switchScheduler(this.controllers[0]);
    }
  }

  private getSchedulerIds(permission): void {
    this.coreService.post('controller/ids', {}).subscribe((res: any) => {
      this.controllers = res.controllerIds;
      this.authService.setIds(res);
      this.authService.save();
      if (permission) {
        this.checkIsFirstEntry(permission);
      }
      this.dataService.isProfileReload.next(true);
    }, err => console.log(err));
  }
}
