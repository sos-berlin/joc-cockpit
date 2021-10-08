import {Component, OnInit, Output, EventEmitter, Input} from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-toggle',
  template: `
    <div class="btn-group m-l-12">
      <button *ngIf="type === 'ORDER'" class="btn btn-grey btn-sm" [ngClass]="{'btn-primary': pageView=='tree'}" (click)="setView('tree')"><i
        class="fa fa-sitemap"></i>
      </button>
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
  @Input() type: string;
  view = 'list';
  pageView: string;
  views: any = {};
  @Output() messageEvent = new EventEmitter<string>();

  constructor(public router: Router) {
  }

  ngOnInit(): void {
    this.views = {
      dailyPlan: this.view,
      workflow: this.view,
      inventory: this.view,
      orderOverview: this.view,
      lock: this.view,
      board: this.view,
      agent: this.view,
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
      this.pageView = this.views.dailyPlan || this.view;
    } else if (this.router.url === '/configuration/inventory') {
      this.pageView = this.views.inventory || this.view;
    } else if (this.router.url === '/workflows') {
      this.pageView = this.views.workflow || this.view;
    } else if (this.router.url.match(/orders_overview/)) {
      this.pageView = this.views.orderOverview || this.view;
    } else if (this.router.url === '/resources/agents') {
      this.pageView = this.views.agent || this.view;
    } else if (this.router.url === '/resources/locks') {
      this.pageView = this.views.lock || this.view;
    } else if (this.router.url === '/resources/boards') {
      this.pageView = this.views.board || this.view;
    } else if (this.router.url === '/resources/calendars') {
      this.pageView = this.views.calendar || this.view;
    } else if (this.router.url === '/resources/documentations') {
      this.pageView = this.views.documentation || this.view;
    } else if (this.router.url.match('/users/')) {
      this.pageView = this.views.permission || this.view;
    } else {
      this.pageView = this.view;
    }
  }

  setView(view): void {
    this.pageView = view;
    if (this.router.url === '/daily_plan') {
      this.views.dailyPlan = view;
    } else if (this.router.url === '/inventory') {
      this.views.inventory = view;
    } else if (this.router.url === '/workflows') {
      this.views.workflow = view;
    } else if (this.router.url.match(/orders_overview/)) {
      this.views.orderOverview = this.pageView;
    } else if (this.router.url === '/resources/agents') {
      this.views.agent = view;
    } else if (this.router.url === '/resources/locks') {
      this.views.lock = view;
    } else if (this.router.url === '/resources/boards') {
      this.views.board = view;
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
