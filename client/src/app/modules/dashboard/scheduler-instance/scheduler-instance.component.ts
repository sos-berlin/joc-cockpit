import { Component, OnInit, OnDestroy } from '@angular/core';
import { CoreService } from '../../../services/core.service';
import { AuthService } from '../../../components/guard/auth.service';
import { DataService } from '../../../services/data.service';
import { Subscription }   from 'rxjs/Subscription';
import * as _ from 'underscore';

@Component({
  selector: 'app-scheduler-instance',
  templateUrl: './scheduler-instance.component.html',
  styleUrls: ['./scheduler-instance.component.css']
})
export class SchedulerInstanceComponent implements OnInit,OnDestroy {

    mastersList:any;
    isLoaded:boolean = false;
    subscription:Subscription;

    constructor(public authService:AuthService, public coreService:CoreService,private dataService: DataService) {
       this.subscription = dataService.eventAnnounced$.subscribe(res => {
           if(res)
            this.refresh(res);
        });
    }

    refresh(args) {
        for (let i = 0; i < args.length; i++) {
            if (args[i].eventSnapshots && args[i].eventSnapshots.length > 0) {
                var flag = false;
                for (var j = 0; j < args[i].eventSnapshots.length; j++) {
                    if (args[i].eventSnapshots[j].eventType === "SchedulerStateChanged") {
                        this.getInstances();
                        flag = true;
                        break;
                    }
                }
                if (flag) {
                    break;
                }
            }

        }
    }

    private mergeResult(result, res) {
        this.mastersList = [];
        if (!result && !res) {
            return;
        }
        if (result) {
            for (let i = 0; i < result.masters.length; i++) {
                result.masters[i].permission = this.authService.getPermission(result.masters[i].jobschedulerId).JobschedulerMaster;
                if (res) {
                    for (let j = 0; j < res.masters.length; j++) {
                        if (result.masters[i].jobschedulerId == res.masters[j].jobschedulerId && _.isEqual(result.masters[i].clusterType, res.masters[j].clusterType)) {
                            this.mastersList.push(_.extend(result.masters[i], res.masters[j]));
                            break
                        }
                    }
                } else {
                    this.mastersList.push(result.masters[i]);
                }
            }
        } else {
            for (let i = 0; i < res.masters.length; i++) {
                res.masters[i].permission = this.authService.getPermission(res.masters[i].jobschedulerId).JobschedulerMaster;
                this.mastersList.push(res.masters[i]);
            }
        }
    }

    getVolatile(result) {

        this.coreService.post('jobscheduler/cluster/members', {
            jobschedulerId: ''
        }).subscribe(res => {
            this.mergeResult(result, res);
            this.isLoaded = true;
        }, (err)=> {
            this.mergeResult(result, null);
            this.isLoaded = true;
        });
    }

    getInstances():void {

        this.coreService.post('jobscheduler/cluster/members/p', {
            jobschedulerId: ''
        }).subscribe(result => {
            this.getVolatile(result);
        }, (err)=> {
           this.getVolatile(null);
        });
    }

    ngOnInit() {
        this.getInstances();
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    changeScheduler(){

    }
}
