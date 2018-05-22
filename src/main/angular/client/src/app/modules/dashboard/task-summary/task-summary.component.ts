import { Component, OnInit, OnDestroy } from '@angular/core';
import { CoreService } from '../../../services/core.service';
import { AuthService } from '../../../components/guard';
import { DataService } from '../../../services/data.service';
import { Subscription }   from 'rxjs/Subscription';

@Component({
  selector: 'app-task-summary',
  templateUrl: './task-summary.component.html',
  styleUrls: ['./task-summary.component.css']
})
export class TaskSummaryComponent implements OnInit, OnDestroy {

    taskSummary:any={};
    preferences:any = {};
    schedulerIds:any={};
    filters:any={};
    isLoaded:boolean = false;
    notPermissionForTaskSummary:boolean = false;
    subscription: Subscription;

    constructor(public authService:AuthService, public coreService:CoreService, private dataService: DataService) {
         this.subscription = dataService.eventAnnounced$.subscribe(res => {
            this.refresh(res);
        });
    }
    ngOnInit() {
        this.filters = this.coreService.getDashboardTab().task;
        if(sessionStorage.preferences)
        this.preferences = JSON.parse(sessionStorage.preferences);
        this.schedulerIds = JSON.parse(this.authService.scheduleIds);
        this.getSummary();
    }
    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
    refresh(args) {
        for (let i = 0; i < args.length; i++) {
            if (args[i].jobschedulerId == this.schedulerIds.selected) {
                if (args[i].eventSnapshots && args[i].eventSnapshots.length > 0) {
                    for (let j = 0; j < args[i].eventSnapshots.length; j++) {
                        if (args[i].eventSnapshots[j].eventType === "ReportingChangedJob") {
                            this.getSummary();
                            break;
                        }
                    }
                }
                break
            }
        }
    }

    getSummary():void {
        this.coreService.post('jobs/overview/summary', {
            jobschedulerId: this.schedulerIds.selected,
            dateFrom: this.filters.date,
            timeZone: this.preferences.zone
        }).subscribe(res => {
            this.taskSummary = res;
            this.isLoaded = true;
        }, (err)=> {
            this.notPermissionForTaskSummary = !err.isPermitted;
            this.isLoaded = true;
        });
    }

    getSummaryByDate(date):void {
        this.filters.date = date;
        this.coreService.post('jobs/overview/summary', {
            jobschedulerId: this.schedulerIds.selected,
            dateFrom: date,
            timeZone: this.preferences.zone
        }).subscribe(res => {
            this.taskSummary = res;
        });
    }


    showTaskSummary(type){

    }
}
