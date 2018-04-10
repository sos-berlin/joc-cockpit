import { Component, OnInit,OnDestroy, ViewChild} from '@angular/core';
import { CoreService } from '../../services/core.service';
import { DataService } from '../../services/data.service';
import { Subscription }   from 'rxjs/Subscription';
import { AuthService } from '../../components/guard/auth.service';
import { HeaderComponent } from '../../components/header/header.component';
import { Router } from '@angular/router';
import * as jstz from 'jstz';

declare var $:any;

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css'],
  host: {
    '(window:resize)': 'onResize($event)',
    '(window:click)': 'onClick($event)'
  }
})
export class LayoutComponent implements OnInit, OnDestroy {

    userPreferences:any = {};
    schedulerIds:any = {};
    permission:any = {};
    selectedScheduler:any = {};
    scheduleState:any = {};
    selectedJobScheduler:any = {};
    currentTime = new Date();
    interval:any;
    remainingSessionTime:any;
    eventId:any;
    isTouch:boolean=false;
    count:number = 0;
    subscription: Subscription;

    @ViewChild(HeaderComponent) child;

    constructor(private coreService:CoreService, private authService:AuthService, private router:Router, private dataService: DataService) {
        this.subscription = dataService.eventAnnounced$.subscribe(res => {
            this.refresh(res);
        });
    }

    refresh(args) {
        if(args && args.length) {
            for (let i = 0; i < args.length; i++) {
                if (args[i].jobschedulerId == this.schedulerIds.selected) {
                    if (args[i].eventSnapshots && args[i].eventSnapshots.length > 0) {
                        for (var j = 0; j < args[i].eventSnapshots.length; j++) {
                            if (args[i].eventSnapshots[j].eventType === "SchedulerStateChanged") {
                                this.loadScheduleDetail();
                                break;
                            } else if (args[i].eventSnapshots[j].eventType === "CurrentJobSchedulerChanged") {
                                this.getScheduleDetail();
                                break;
                            }
                        }
                    }
                    break
                }
            }
        }
    }


    ngOnInit() {
        if (this.router.url === '/') {
            this.router.navigate(['/dashboard']);
        }

        if (sessionStorage.preferences)
            this.userPreferences = JSON.parse(sessionStorage.preferences);
        if (this.authService.scheduleIds) {
            this.schedulerIds = JSON.parse(this.authService.scheduleIds);
        }
        this.permission = JSON.parse(this.authService.permission);
        this.getUserProfileConfiguration(this.schedulerIds.selected, this.authService.currentUserData);
        this.count = parseInt(this.authService.sessionTimeout) / 1000;
        this.loadScheduleDetail();
        this.calculateTime();
        this.calculateHeight();
    }

    ngOnDestroy() {
        clearInterval(this.interval);
        this.subscription.unsubscribe();
    }

    private calculateHeight() {
        if (window.innerHeight > 450 && window.innerWidth > 740) {
            let headerHt = $('.app-header').height() || 60;
            let topHeaderHt = $('.top-header-bar').height() || 16;
            let subHeaderHt = 59;
            let ht = (window.innerHeight - (headerHt + topHeaderHt + subHeaderHt));
            $('.max-ht').css('height', ht + 'px');
            $('.max-ht2').css('height', ht - 42 + 'px');
            $('.max-tree-ht').css('height', ht - 43 + 'px');
        } else {
            $('.max-ht').css('height', 'auto');
            $('.max-ht2').css('height', 'auto');
            $('.max-tree-ht').css('height', 'auto');
        }
    }

    private checkNavHeader() {
        if ($('#navbar1').hasClass('in')) {
            $('#navbar1').removeClass('in');
            $('a.navbar-item').addClass('collapsed');
        }
    }
   onResize(event) {
       this.calculateHeight();
       this.checkNavHeader();
   }

    onClick(event){
        this.refreshSession();
    }

    private refreshSession() {
        if (!this.isTouch) {
            this.isTouch = true;
            this.coreService.post('touch', {}).subscribe(res=> {
                this.isTouch = false;
                if (res)
                    this.count = parseInt(this.authService.sessionTimeout) / 1000 - 1;
            }, function () {
                this.isTouch = false;
            });
        }
    }

    private calculateTime() {
        this.interval = setInterval(()=> {
            --this.count;
            this.currentTime = new Date();
            var s = Math.floor((this.count) % 60),
                m = Math.floor((this.count / (60)) % 60),
                h = Math.floor((this.count / (60 * 60)) % 24),
                d = Math.floor(this.count / (60 * 60 * 24));


            var x = m > 9 ? m : '0' + m;
            var y = s > 9 ? s : '0' + s;

            if (d == 0 && h != 0) {
                this.remainingSessionTime = h + 'h ' + x + 'm ' + y + 's';
            } else if (d == 0 && h == 0 && m != 0) {
                this.remainingSessionTime = x + 'm ' + y + 's';
            } else if (d == 0 && h == 0 && m == 0) {
                this.remainingSessionTime = s + 's';
            } else {
                this.remainingSessionTime = d + 'd ' + h + 'h';
            }

            if (this.count < 0) {
                clearInterval(this.interval);
                localStorage.$SOS$URL = this.router.url;
              //  localStorage.$SOS$URLPARAMS = JSON.stringify(this.route.params);
                this.child.logout('timeout');
            }

        }, 1000);
    }

    private setUserPreferences(preferences, configObj) {
        if (sessionStorage.preferenceId == 0) {
            var timezone = jstz.determine();
            if (timezone)
                preferences.zone = timezone.name() || this.selectedJobScheduler.timeZone;
            else {
                preferences.zone = this.selectedJobScheduler.timeZone;
            }
            // preferences.locale = $rootScope.locale.lang;
            preferences.dateFormat = 'DD.MM.YYYY HH:mm:ss';
            preferences.maxRecords = 10000;
            preferences.maxAuditLogRecords = 10000;
            preferences.maxHistoryPerOrder = 30;
            preferences.maxHistoryPerTask = 10;
            preferences.maxHistoryPerJobchain = 30;
            preferences.maxOrderPerJobchain = 5;
            preferences.maxAuditLogPerObject = 10;
            preferences.maxEntryPerPage = '1000';
            preferences.entryPerPage = '10';
            preferences.isNewWindow = 'newWindow';
            preferences.pageView = 'list';
            preferences.theme = 'light';
            preferences.historyView = 'current';
            preferences.adtLog = 'current';
            preferences.agentTask = 'current';
            preferences.fileTransfer = 'current';
            preferences.showTasks = true;
            preferences.showOrders = false;
            if (sessionStorage.$SOS$FORCELOGING === 'true' || sessionStorage.$SOS$FORCELOGING == true)
                preferences.auditLog = true;
            preferences.events = {};

            preferences.events.filter = ['JobChainStopped', 'OrderStarted', 'OrderSetback', 'OrderSuspended'];
            preferences.events.taskCount = 0;
            preferences.events.jobCount = 0;
            preferences.events.jobChainCount = 1;
            preferences.events.positiveOrderCount = 1;
            preferences.events.negativeOrderCount = 2;
            configObj.configurationItem = JSON.stringify(preferences);

            configObj.id = 0;
            sessionStorage.preferences = configObj.configurationItem;
            this.coreService.post('configuration/save', configObj).subscribe(res=> {
                sessionStorage.preferenceId = res;
            })
        }
    }

    private setUserObject(preferences, res, configObj) {
        if (res.configuration && res.configuration.configurationItem) {
            sessionStorage.preferences = JSON.parse(JSON.stringify(res.configuration.configurationItem));
            // document.getElementById('style-color').href = 'css/' + JSON.parse(sessionStorage.preferences).theme + '-style.css';
            preferences = JSON.parse(sessionStorage.preferences);
            if (preferences && !preferences.pageView) {
                preferences.pageView = 'grid';
            }
            if (preferences && !preferences.historyView) {
                preferences.historyView = 'current';
            }
            if (preferences && !preferences.adtLog) {
                preferences.adtLog = 'current';
            }
            if (preferences && !preferences.agentTask) {
                preferences.agentTask = 'current';
            }
            if (preferences && !preferences.fileTransfer) {
                preferences.fileTransfer = 'current';
            }
            if (!preferences.entryPerPage) {
                preferences.entryPerPage = '10';
                sessionStorage.preferences = JSON.stringify(preferences);
            }
            if ((sessionStorage.$SOS$FORCELOGING === 'true' || sessionStorage.$SOS$FORCELOGING == true) && !preferences.auditLog) {
                preferences.auditLog = true;
            }
            sessionStorage.preferences = JSON.stringify(preferences);
            localStorage.$SOS$THEME = preferences.theme;
            /*                        if (preferences.theme == 'lighter') {
             document.getElementById('orders_id img').attr("src", 'images/order.png');
             document.getElementById('jobs_id img').attr("src", 'images/job.png');
             document.getElementById('dailyPlan_id img').attr("src", 'images/daily_plan1.png');
             document.getElementById('resources_id img').attr("src", 'images/resources1.png');
             } else {
             document.getElementById('orders_id img').attr("src", 'images/order1.png');
             document.getElementById('jobs_id img').attr("src", 'images/job1.png');
             document.getElementById('dailyPlan_id img').attr("src", 'images/daily_plan.png');
             document.getElementById('resources_id img').attr("src", 'images/resources.png');
             }*/
            localStorage.$SOS$LANG = preferences.locale;

            /*            this.coreService.get("modules/i18n/language_" + preferences.locale + ".json").subscribe((data)=> {
             console.log('><><><');
             console.log(data);
             // gettextCatalog.setCurrentLanguage(preferences.locale);
             //  gettextCatalog.setStrings(preferences.locale, data);
             });*/
        } else {
            this.setUserPreferences(preferences, configObj);
        }
    }

    private setUserProfileConfiguration(configObj, preferences, res1, id) {
        if (res1.configurations && res1.configurations.length > 0) {
            sessionStorage.preferenceId = res1.configurations[0].id;
            this.coreService.post('configuration', {
                jobschedulerId: id,
                id: sessionStorage.preferenceId
            }).subscribe(res=> {

                this.setUserObject(preferences, res, configObj);

                //  $rootScope.$broadcast('reloadPreferences');
            }, (err) => {
                this.setUserPreferences(preferences, configObj);
                // $rootScope.$broadcast('reloadPreferences');
            });
        } else {
            this.setUserPreferences(preferences, configObj);
            // $rootScope.$broadcast('reloadPreferences');
        }
    }

    private getUserProfileConfiguration(id, user) {
        var configObj = {
            jobschedulerId: id,
            account: user,
            configurationType: "PROFILE"
        };
        var preferences = {};
        this.coreService.post('configurations', configObj).subscribe(res1=> {
            sessionStorage.preferenceId = 0;
            this.setUserProfileConfiguration(configObj, preferences, res1, id);

        }, (err)=> {
            this.setUserPreferences(preferences, configObj);
            // $rootScope.$broadcast('reloadPreferences');
        });
    }

    private mergeData(result, res) {

        if (!result && !res) {
            return;
        }
        if (res) {
            res.jobscheduler.os = result.jobscheduler.os;
            res.jobscheduler.timeZone = result.jobscheduler.timeZone;
            this.selectedJobScheduler = res.jobscheduler;
        } else {
            this.selectedJobScheduler = result.jobscheduler;
        }
        this.selectedScheduler.scheduler = this.selectedJobScheduler;
        if (this.selectedScheduler && this.selectedScheduler.scheduler)
            document.title = this.selectedScheduler.scheduler.host + ':' + this.selectedScheduler.scheduler.port + '/' + this.selectedScheduler.scheduler.jobschedulerId;
        sessionStorage.$SOS$JOBSCHEDULE = JSON.stringify(this.selectedJobScheduler);
        if (this.selectedJobScheduler && this.selectedJobScheduler.state)
            this.scheduleState = this.selectedJobScheduler.state._text;
        if (this.selectedJobScheduler && this.selectedJobScheduler.clusterType)
            this.permission.precedence = this.selectedJobScheduler.clusterType.precedence;
    }

    private getVolatileData(result):void {
        this.coreService.post('jobscheduler', {jobschedulerId: this.schedulerIds.selected}).subscribe(res=> {
            this.mergeData(result, res);
        }, (err) => {
            this.mergeData(result, null);
        });
    }

    getScheduleDetail():void {
        this.coreService.post('jobscheduler/p', {jobschedulerId: this.schedulerIds.selected}).subscribe(result=> {
            this.getVolatileData(result);
        }, error=> {
            this.getVolatileData(null);
        });
    }

    loadScheduleDetail() {
        if (sessionStorage.$SOS$JOBSCHEDULE && sessionStorage.$SOS$JOBSCHEDULE != 'null') {
            this.selectedJobScheduler = JSON.parse(sessionStorage.$SOS$JOBSCHEDULE);
            if (this.selectedJobScheduler && this.selectedJobScheduler.state)
                this.scheduleState = this.selectedJobScheduler.state._text;
            this.selectedScheduler.scheduler = this.selectedJobScheduler;
            if (this.selectedScheduler && this.selectedScheduler.scheduler)
                document.title = this.selectedScheduler.scheduler.host + ':' + this.selectedScheduler.scheduler.port + '/' + this.selectedScheduler.scheduler.jobschedulerId;
        } else if (this.schedulerIds.selected) {
            this.getScheduleDetail();
        }
    }

    changeScheduler(jobScheduler) {
        this.child.switchScheduler = true;
        this.schedulerIds.selected = jobScheduler;
        this.coreService.post('jobscheduler/switch', {jobschedulerId: this.schedulerIds.selected}).subscribe(function (permission) {

            this.coreService.post('jobscheduler/ids', {}).subscribe(function (res) {
                if (res) {
                    //CoreService.setDefaultTab();
                    this.authService.setIds(res);
                    this.authService.setPermission(permission);
                    this.authService.save();

                    // $rootScope.$broadcast('reloadUser');
                    /*                    if (this.router.url.match('job_chain_detail/')) {
                     $location.path('/').search({});
                     } else {
                     if ($state.current.name != 'app.dashboard')
                     getScheduleDetail();
                     $state.reload(this.currentState);
                     }*/
                } else {
                    /*                    toasty.error({
                     title: gettextCatalog.getString('message.oops'),
                     msg: gettextCatalog.getString('message.errorInLoadingScheduleIds'),
                     timeout: 10000
                     });*/
                }
            });
        })
    }

}
