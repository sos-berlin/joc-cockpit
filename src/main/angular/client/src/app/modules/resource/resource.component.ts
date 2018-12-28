import {Component, OnInit} from '@angular/core';
import {CoreService} from '../../services/core.service';
import {AuthService} from '../../components/guard';
import {Router} from '@angular/router';

@Component({
  selector: 'app-resource',
  templateUrl: './resource.component.html'
})
export class ResourceComponent implements OnInit {
  permission: any;

  constructor(private coreService: CoreService, private authService: AuthService, private router: Router) {
  }

  ngOnInit() {
    this.permission = JSON.parse(this.authService.permission) || {};
    this.navigateToResource();
  }

  navigateToResource() {
    const resourceFilters = this.coreService.getResourceTab();
    if (resourceFilters.state === 'agent') {
      if (this.permission.JobschedulerUniversalAgent.view.status) {
        this.router.navigate(['/resources/agent_cluster']);
        return;
      } else {
        resourceFilters.state = 'agentJobExecutions';
      }
    }
    if (resourceFilters.state === 'agentJobExecutions') {
      if (this.permission.JobschedulerUniversalAgent.view.status) {
        this.router.navigate(['/resources/agent_job_execution']);
        return;
      } else {
        resourceFilters.state = 'processClass';
      }
    }
    if (resourceFilters.state === 'processClass') {
      if (this.permission.ProcessClass.view.status) {
        this.router.navigate(['/resources/process_class']);
        return;
      } else {
        resourceFilters.state = 'locks';
      }
    }
    if (resourceFilters.state === 'locks') {
      if (this.permission.Lock.view.status) {
        this.router.navigate(['/resources/lock']);
        return;
      } else {
        resourceFilters.state = 'calendars';
      }
    }
    if (resourceFilters.state === 'calendars') {
      if (this.permission.Calendar.view.status) {
        this.router.navigate(['/resources/calendar']);
        return;
      }
    }
  }
}
