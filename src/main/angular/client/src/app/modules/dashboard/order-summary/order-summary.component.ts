import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { CoreService } from '../../../services/core.service';
import { AuthService } from '../../../components/guard/auth.service';
import { DataService } from '../../../services/data.service';
import { Subscription }   from 'rxjs/Subscription';

@Component({
  selector: 'app-order-summary',
  templateUrl: './order-summary.component.html',
  styleUrls: ['./order-summary.component.css']
})
export class OrderSummaryComponent implements OnInit, OnDestroy {

    @Input() reload:boolean;
    orderSummary:any;
    schedulerIds:any;
    preferences:any = {};
    filters:any;
    isLoaded:boolean = false;
    notAuthenticate:boolean = false;
    subscription:Subscription;

    constructor(private authService:AuthService, private coreService:CoreService, private dataService:DataService) {

        this.orderSummary = {orders: {}};
        this.filters = coreService.getDashboardTab().order;
        this.subscription = dataService.eventAnnounced$.subscribe(res => {
            this.refresh(res);
        });

    }

    refresh(args) {
        for (let i = 0; i < args.length; i++) {
            if (args[i].jobschedulerId == this.schedulerIds.selected) {
                if (args[i].eventSnapshots && args[i].eventSnapshots.length > 0) {
                    for (let j = 0; j < args[i].eventSnapshots.length; j++) {
                        if (args[i].eventSnapshots[j].eventType === "ReportingChangedOrder") {
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

        this.coreService.post('orders/overview/summary', {
            jobschedulerId: this.schedulerIds.selected,
            dateFrom: this.filters.date,
            timeZone: this.preferences.zone
        }).subscribe(res => {
            this.orderSummary = res;
            this.isLoaded = true;
        }, (err)=> {
            this.notAuthenticate = !err.isPermitted;
            this.isLoaded = true;
        });
    }

    getSummaryByDate(date):void {
        this.filters.date = date;
        this.coreService.post('orders/overview/summary', {
            jobschedulerId: this.schedulerIds.selected,
            dateFrom: date,
            timeZone: this.preferences.zone
        }).subscribe(res => {
            this.orderSummary = res;
        });
    }

    ngOnInit() {
        if (sessionStorage.preferences)
            this.preferences = JSON.parse(sessionStorage.preferences);
        if (this.authService.scheduleIds)
            this.schedulerIds = JSON.parse(this.authService.scheduleIds);
        this.getSummary();
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    showOrderSummary(trye){

    }
}
