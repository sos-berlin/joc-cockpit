import {Component, Input, OnInit} from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CoreService } from '../../services/core.service';

@Component({
    selector: 'ngbd-modal-content',
     templateUrl: './edit-filter.component.html'
})
export class EditFilterModal {

   @Input() permission: any;
   @Input() filters: any;
   @Input() username: any;
    constructor(public activeModal:NgbActiveModal) {
    }

    editFilter() {

    }

    makeShare() {

    }

    makePrivate() {

    }

    removeFavorite() {

    }

    favorite() {

    }

    copyFilter() {

    }

    deleteFilter() {

    }
}
