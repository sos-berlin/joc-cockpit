import {Component, OnInit, Output, EventEmitter} from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-toggle',
  template: `
    <div class="btn-group m-l-12">
      <button class="btn btn-grey btn-sm" [ngClass]="{'btn-primary': pageView=='grid'}" (click)="setView('grid')"><i
        class="fa fa-th-large" [ngClass]="{'fa-sitemap' : this.router.url.match('workflow_detail'), 'fa-sliders' : this.router.url.match('daily_plan') }"></i>
      </button>
      <button class="btn btn-grey btn-sm" [ngClass]="{'btn-primary': pageView=='list'}" (click)="setView('list')">
        <i class="fa fa-bars"></i>
      </button>
    </div>
  `
})
export class ToggleComponent implements OnInit {

  view = 'list';
  pageView: string;
  views: any = {};

  @Output() messageEvent = new EventEmitter<string>();

  constructor(public router: Router) {

  }

  ngOnInit() {
    this.views = {
      dailyPlan: this.view,
      workflow: this.view,
      workflowDetail: this.view,
      orderOverview: this.view,
      lock: this.view,
      documentation: this.view,
      calendar: this.view,
      permission: this.view
    };
    if (sessionStorage.preferences) {
      if (JSON.parse(sessionStorage.preferences).pageView) {
        this.view = JSON.parse(sessionStorage.preferences).pageView;
      }
    }
    if (!localStorage.views) {
      localStorage.views = JSON.stringify(this.views);
    } else {
      this.views = JSON.parse(localStorage.views);
    }
    if (this.router.url === '/daily_plan') {
      this.pageView = this.views.dailyPlan;
    } else if (this.router.url === '/configuration/inventory') {
      // this.pageView = this.views.inventory;
      this.pageView = 'grid';
    }  else if (this.router.url === '/workflows') {
      this.pageView = this.views.workflow;
    } else if (this.router.url.match(/workflow_detail/)) {
      this.pageView = this.views.workflowDetail;
    } else if (this.router.url.match(/orders_overview/)) {
      this.pageView = this.views.orderOverview;
    }  else if (this.router.url === '/resources/locks') {
      this.pageView = this.views.lock;
    } else if (this.router.url === '/resources/calendars') {
      this.pageView = this.views.calendar;
    } else if (this.router.url === '/resources/documentations') {
      this.pageView = this.views.documentation;
    } else if (this.router.url.match('/users/')) {
      this.pageView = this.views.permission;
    } else {
      this.pageView = this.view;
    }
  }

  setView(view) {
    this.pageView = view;
    if (this.router.url === '/daily_plan') {
      this.views.dailyPlan = view;
    } else if (this.router.url === '/inventory') {
      this.views.joe = view;
    } else if (this.router.url === '/workflows') {
      this.views.workflow = view;
    } else if (this.router.url.match(/workflow_detail/)) {
      this.views.workflowDetail = view;
    } else if (this.router.url.match(/orders_overview/)) {
      this.views.orderOverview = this.pageView;
    } else if (this.router.url === '/resources/locks') {
      this.views.lock = view;
    } else if (this.router.url === '/resources/calendars') {
      this.views.calendar = view;
    } else if (this.router.url === '/resources/documentations') {
      this.views.documentation = view;
    } else if (this.router.url.match('/users/')) {
      this.views.permission = view;
    }
    localStorage.views = JSON.stringify(this.views);
    this.messageEvent.emit(this.pageView);
  }
}
