import {Component, Input, OnInit} from '@angular/core';
import {NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';

declare const $;

@Component({
  selector: 'app-calendar-view',
  template: `
    <div class="modal-header">
      <h4 class="modal-title">
        <span translate>label.calendarViewFor</span>
        {{path}}
      </h4>
      <button type="button" class="close" aria-label="Close" (click)="activeModal.dismiss('Cross click')">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    <div class="modal-body p-a">
      <div class="row">
        <div class="col-md-12">
          <ul class="nav navbar-nav navbar-nav-inline pull-right nav-active-border nav-active-border2 b-primary">
            <li class="nav-item">
              <a class="nav-link" [ngClass]="{'active' : calendarView=='month'}"
                 (click)="getPlan()">
                <span class="nav-text text-dark p-b-sm" translate>runtime.label.monthly</span>
              </a>
            </li>
            <li class="nav-item dropdown-separator">
              <span class="separator"></span>
            </li>
            <li class="nav-item">
              <a class="nav-link" [ngClass]="{'active' : calendarView=='year'}"
                 (click)="getPlan()">
                <span class="nav-text text-dark p-b-sm" translate>runtime.label.yearly</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div class="text-center" [hidden]="!isCalendarLoading">
        <div class="loading-img1 m-t-lg"></div>
      </div>
      <div class="row">
        <div class="col-md-12 m-t-sm">
          <div id="full-calendar"></div>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-grey btn-sm" (click)="activeModal.dismiss('Cross click')" translate>button.close</button>
    </div>
  `
})
export class CalendarModalComponent implements OnInit {
  @Input() path: string;
  calendarView: string;
  isCalendarLoading: boolean;
  calendarTitle: number;
  planItems = [];

  constructor(public activeModal: NgbActiveModal) {
    this.calendarTitle = new Date().getFullYear();
  }

  ngOnInit() {
    $('#full-calendar').calendar({
      renderEnd: (e) => {
        this.calendarTitle = e.currentYear;
      }
    });
  }

  getPlan() {

  }
}
