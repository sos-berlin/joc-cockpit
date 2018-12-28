import {Component, OnDestroy, OnInit, Input} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';

declare var $;

@Component({
  selector: 'app-ngbd-modal-content',
  templateUrl: './delete.component.html'
})
export class DeleteModalComponent implements OnInit, OnDestroy {

  @Input() calendar: any;
  @Input() importCalendars: any;
  @Input() calendarArr: any;
  @Input() user: any;
  @Input() role: any;
  @Input() master: any;
  @Input() entry: any;
  @Input() folder: any;
  @Input() permission: any;
  @Input() object: any;
  profiles = 'profiles';

  constructor(public activeModal: NgbActiveModal) {
  }

  ngOnInit() {
    $('.modal').css('opacity', 0.65);
    $('#freq-modal').parents('div').addClass('card m-a');
  }

  ngOnDestroy() {
    $('.modal').css('opacity', 1);
  }

}
