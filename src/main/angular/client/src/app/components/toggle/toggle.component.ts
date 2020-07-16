import {Component, OnInit, Output, EventEmitter} from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-toggle',
  template: `
    <div class="btn-group m-l-12">
      <button class="btn btn-grey btn-sm" [ngClass]="{'btn-primary': pageView=='grid'}" (click)="setView('grid')"><i
        class="fa fa-th-large"></i>
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
      job: this.view,
      agent: this.view,
      lock: this.view,
      processClass: this.view,
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
    } else if (this.router.url === '/job') {
      this.pageView = this.views.job;
    } else if (this.router.url === '/workflow') {
      this.pageView = this.views.workflow;
    } else if (this.router.url.match('/resources/agent_cluster')) {
      this.pageView = this.views.agent;
    } else if (this.router.url === '/resources/lock') {
      this.pageView = this.views.lock;
    } else if (this.router.url === '/resources/process_class') {
      this.pageView = this.views.processClass;
    } else if (this.router.url === '/resources/calendar') {
      this.pageView = this.views.calendar;
    } else if (this.router.url === '/resources/documentation') {
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
    } else if (this.router.url === '/job') {
      this.views.job = view;
    } else if (this.router.url === '/workflow') {
      this.views.workflow = view;
    } else if (this.router.url.match('/resources/agent_cluster')) {
      this.views.agent = view;
    } else if (this.router.url === '/resources/lock') {
      this.views.lock = view;
    } else if (this.router.url === '/resources/process_class') {
      this.views.processClass = view;
    } else if (this.router.url === '/resources/calendar') {
      this.views.calendar = view;
    } else if (this.router.url === '/resources/documentation') {
      this.views.documentation = view;
    } else if (this.router.url.match('/users/')) {
      this.views.permission = view;
    }
    localStorage.views = JSON.stringify(this.views);
    this.messageEvent.emit(this.pageView);
  }
}
