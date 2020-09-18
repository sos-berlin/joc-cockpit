import {Component, Input} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-configuration',
  template: `
    <div class="modal-header">
      <h4 class="modal-title"><span translate> button.showConfiguration</span></h4>
      <button type="button" class="close" aria-label="Close" (click)="activeModal.dismiss('Cross click')">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    <div class="modal-body p-a">
      <div>
        <div class="h4 _600">
          <span class="text-c">{{type}}:</span>
          <span>{{configuration.path}}</span>
        </div>
        <div class="m-t text">
          <span><span
            translate>label.fileTimestamp</span>: </span><span>{{configuration.configurationDate | stringToDate}}</span>
        </div>
        <div>
          <span>{{configuration.html}}</span>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-grey btn-sm" (click)="activeModal.dismiss('Cross click')" translate>button.close</button>
    </div>
  `
})
export class ConfigurationModalComponent {

  @Input() type: string;
  @Input() configuration: any;

  constructor(public activeModal: NgbActiveModal) {
  }
}
