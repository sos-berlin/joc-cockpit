import {Component, OnInit} from '@angular/core';

import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {CoreService} from '../../services/core.service';
import {StartUpModalComponent} from '../start-up/start-up.component';
import {ConfirmModalComponent} from '../../components/comfirm-modal/confirm.component';


@Component({
  selector: 'app-masters',
  templateUrl: './masters.component.html',
  styleUrls: ['./masters.component.css']
})
export class MastersComponent implements OnInit {
  masters: any = [];


  constructor(private coreService: CoreService, private modalService: NgbModal) {

  }

  getData(): void {
    this.coreService.post('jobscheduler/ids', {})
      .subscribe((data: any) => {
        this.masters = data.jobschedulerIds;
      }, () => {

      });
  }

  ngOnInit(): void {
    this.getData();
  }


  addMaster() {
    const modalRef = this.modalService.open(StartUpModalComponent, {backdrop: 'static'});
    modalRef.componentInstance.isModal = true;
    modalRef.componentInstance.new = true;
    modalRef.result.then((result) => {
      console.log(result);
    }, () => {

    });
  }

  editMaster(matser) {
    const modalRef = this.modalService.open(StartUpModalComponent, {backdrop: 'static'});
    modalRef.componentInstance.isModal = true;
    modalRef.result.then((result) => {
      console.log(result);
    }, () => {

    });
  }

  deleteMaster(matser) {
    const modalRef = this.modalService.open(ConfirmModalComponent, {backdrop: 'static'});
    modalRef.componentInstance.title = 'delete';
    modalRef.componentInstance.message = 'delete';
    modalRef.componentInstance.type = 'delete';
    modalRef.componentInstance.objectName = matser;
    modalRef.result.then((result) => {
      console.log(result);
    }, () => {

    });
  }
}
