import {Component, OnInit, Output, EventEmitter, Input} from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-toggle',
  template: `
    <div class="btn-group m-l-12">
      <button *ngIf="type === 'ORDER'" class="btn btn-grey btn-sm" [ngClass]="{'btn-primary': pageView=='bulk'}" (click)="setView('bulk')"><i
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
  orderView = 'list';
  view = 'list';
  pageView: string;
  views: any = {};
  @Output() messageEvent = new EventEmitter<string>();

  constructor(public router: Router) {
  }

  ngOnInit(): void {
    if (sessionStorage.preferences) {
      const preferences = JSON.parse(sessionStorage.preferences);
      if (preferences.pageView) {
        this.view = preferences.pageView;
      }
      if (preferences.orderOverviewPageView) {
        this.orderView = preferences.orderOverviewPageView;
      }
    }
    this.views = {
      dailyPlan: this.view,
      workflow: this.view,
      inventory: this.view,
      order: this.orderView,
      lock: this.view,
      board: this.view,
      agent: this.view,
      documentation: this.view,
      calendar: this.view,
      agentCluster: this.view,
      permission: 'grid'
    };
    if (!localStorage.views) {
      localStorage.views = JSON.stringify(this.views);
    } else {
      this.views = JSON.parse(localStorage.views);
      if (!this.views.order) {
        this.views.order = this.orderView;
      }
    }
    if (this.router.url === '/daily_plan') {
      this.pageView = this.views.dailyPlan || this.view;
    } else if (this.router.url === '/configuration/inventory') {
      this.pageView = this.views.inventory || this.view;
    } else if (this.router.url === '/workflows') {
      this.pageView = this.views.workflow || this.view;
    } else if (this.router.url.match(/orders_overview/)) {
      this.pageView = this.views.order || this.orderView;
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
    } else if (this.router.url.match('/controllers/cluster_agent/')) {
      this.pageView = this.views.agentCluster || this.view;
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
      this.views.order = view;
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
    } else if (this.router.url.match('/controllers/cluster_agent/')) {
      this.views.agentCluster = view;
    }
    localStorage.views = JSON.stringify(this.views);
    this.messageEvent.emit(this.pageView);
  }
}
