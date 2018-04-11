import { Component, OnInit } from '@angular/core';
import { CoreService } from '../../services/core.service';
import { AuthService } from '../../components/guard/auth.service';
import { TranslateService } from 'ng2-translate';
import { Router } from '@angular/router';
import * as moment from 'moment-timezone';
import * as jstz from 'jstz';

declare var $:any;

@Component({
    selector: 'app-user',
    templateUrl: './user.component.html',
    styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
    zones:any = {};
    preferences:any = {};
    userPreferences:any = {};
    username:string = '';
    permission:any = {};
    obj:any = {};
    schedulerIds:any = {};
    selectedJobScheduler:any = {};
    selectAllJobModel;
    selectAllJobChainModel;
    selectAllPositiveOrderModel;
    selectAllNegativeOrderModel;
    eventFilter;
    configObj:any = {};
    timeZone:any = {};
    locales:any = [];
    jobCount = 0;
    jobChainCount = 0;
    positiveOrderCount = 0;
    negativeOrderCount = 0;

    jobs:any = [
        {value: 'JobStopped', label: "label.jobStopped"},
        {value: 'JobPending', label: "label.jobPending"}
    ];
    jobChains:any = [
        {value: 'JobChainStopped', label: "label.jobChainStopped"},
        {value: 'JobChainPending', label: "label.jobChainPending"},
        {value: 'JobChainRunning', label: "label.jobChainUnstopped"}
    ];
    positiveOrders:any = [
        {value: 'OrderStarted', label: "label.orderStarted"},
        {value: 'OrderStepStarted', label: "label.orderStepStarted"},
        {value: 'OrderStepEnded', label: "label.orderStepEnded"},
        {value: 'OrderNodeChanged', label: "label.orderNodeChanged"},
        {value: 'OrderResumed', label: "label.orderResumed"},
        {value: 'OrderFinished', label: "label.orderFinished"}
    ];
    negativeOrders:any = [
        {value: 'OrderSetback', label: "label.orderSetback"},
        {value: 'OrderSuspended', label: "label.orderSuspended"}
    ];

    constructor(public coreService:CoreService, private authService:AuthService, private router:Router, private translate:TranslateService) {

    }

    savePreferences() {
        this.configObj.configurationItem = JSON.stringify(this.preferences);
        sessionStorage.preferences = JSON.stringify(this.preferences);
        this.coreService.post('configuration/save', this.configObj).subscribe(res=> {
            console.log(res)
        }, (err)=> {
            console.log(err)
        })
    }

    setIds() {
        if (this.authService.scheduleIds) {
            this.schedulerIds = JSON.parse(this.authService.scheduleIds);
        } else {
            this.schedulerIds = {};
        }
    }

    setPreferences() {
        this.username = this.authService.currentUserData;
        if (sessionStorage.preferences && sessionStorage.preferences != 'undefined') {
            this.preferences = JSON.parse(sessionStorage.preferences);
            this.userPreferences = JSON.parse(sessionStorage.preferences);
            this.permission = JSON.parse(this.authService.permission);
            this.selectedJobScheduler = JSON.parse(sessionStorage.$SOS$JOBSCHEDULE);
        }
    }

    ngOnInit() {
        this.locales = [{lang: 'en', country: 'US', name: 'English'}, {
            lang: 'fr',
            country: 'FR',
            name: 'French'
        }, {lang: 'de', country: 'DE', name: 'German'}, {lang: 'ja', country: 'JA', name: 'Japanese'}];

        this.setIds();
        this.setPreferences();
        this.zones = moment.tz.names();
        let localTZ = jstz.determine();
        if (localTZ)
            this.timeZone = localTZ.name() || this.selectedJobScheduler.timeZone;
        else {
            this.timeZone = this.selectedJobScheduler.timeZone;
        }
        this.configObj.jobschedulerId = this.schedulerIds.selected;
        this.configObj.account = this.permission.user;
        this.configObj.configurationType = "PROFILE";
        this.configObj.id = parseInt(sessionStorage.preferenceId);
        if (this.preferences.events.filter) {
            this.eventFilter = this.preferences.events.filter;
        } else {
            this.eventFilter = JSON.parse(this.preferences.events.filter);
        }
        this.jobCount = this.preferences.events.jobCount;
        this.jobChainCount = this.preferences.events.jobChainCount;
        this.positiveOrderCount = this.preferences.events.positiveOrderCount;
        this.negativeOrderCount = this.preferences.events.negativeOrderCount;


        if (this.jobs.length == this.jobCount) {
            this.selectAllJobModel = true;
        }
        if (this.jobChains.length == this.jobChainCount) {
            this.selectAllJobChainModel = true;
        }
        if (this.positiveOrders.length == this.positiveOrderCount) {
            this.selectAllPositiveOrderModel = true;
        }
        if (this.negativeOrders.length == this.negativeOrderCount) {

            this.selectAllNegativeOrderModel = true;
        }
    }

    changeConfiguration(reload) {
        if (isNaN(parseInt(this.preferences.maxRecords))) {
            this.preferences.maxRecords = parseInt(Object.assign({}, this.userPreferences).maxRecords);
        }
        if (isNaN(parseInt(this.preferences.maxAuditLogRecords))) {
            this.preferences.maxAuditLogRecords = parseInt(Object.assign({}, this.userPreferences).maxAuditLogRecords);
        }
        if (isNaN(parseInt(this.preferences.maxHistoryPerOrder))) {
            this.preferences.maxHistoryPerOrder = parseInt(Object.assign({}, this.userPreferences).maxHistoryPerOrder);
        }
        if (isNaN(parseInt(this.preferences.maxHistoryPerTask))) {
            this.preferences.maxHistoryPerTask = parseInt(Object.assign({}, this.userPreferences).maxHistoryPerTask);
        }
        if (isNaN(parseInt(this.preferences.maxAuditLogPerObject))) {
            this.preferences.maxAuditLogPerObject = parseInt(Object.assign({}, this.userPreferences).maxAuditLogPerObject);
        }

        if (isNaN(parseInt(this.preferences.maxOrderPerJobchain))) {
            this.preferences.maxOrderPerJobchain = parseInt(Object.assign({}, this.userPreferences).maxOrderPerJobchain);
        }
        if (isNaN(parseInt(this.preferences.maxHistoryPerJobchain))) {
            this.preferences.maxHistoryPerJobchain = parseInt(Object.assign({}, this.userPreferences).maxHistoryPerJobchain);
        }
        if (this.preferences.entryPerPage > 100) {
            this.preferences.entryPerPage = this.preferences.maxEntryPerPage;
        }

        // $rootScope.$broadcast('reloadPreferences');
        // if (reload)
        // $rootScope.$broadcast('reloadDate');
        this.savePreferences();

    }

    changeView() {
        var views = {
            dailyPlan: this.preferences.pageView,
            jobChain: this.preferences.pageView,
            job: this.preferences.pageView,
            order: this.preferences.pageView,
            agent: this.preferences.pageView,
            lock: this.preferences.pageView,
            processClass: this.preferences.pageView,
            schedule: this.preferences.pageView,
            jobChainOrder: this.preferences.pageView,
            orderOverView: this.preferences.pageView,
            permission: this.preferences.pageView
        };
        localStorage.views = JSON.stringify(views);
    }

    setLocale() {
        localStorage.$SOS$LANG = this.preferences.locale;
        this.translate.use(this.preferences.locale);
        this.savePreferences();
    }

    changeTheme(theme) {
        $('#style-color').attr('href', '../styles/' + theme + '-style.css');
        localStorage.$SOS$THEME = theme;
        if (theme == 'lighter') {
            $('#orders_id img').attr("src", '../assets/images/order.png');
            $('#jobs_id img').attr("src", '../assets/images/job.png');
            $('#dailyPlan_id img').attr("src", '../assets/images/daily_plan1.png');
            $('#resources_id img').attr("src", '../assets/images/resources1.png');
        } else {
            $('#orders_id img').attr("src", '../assets/images/order1.png');
            $('#jobs_id img').attr("src", '../assets/images/job1.png');
            $('#dailyPlan_id img').attr("src", '../assets/images/daily_plan.png');
            $('#resources_id img').attr("src", '../assets/images/resources.png');
        }

        this.savePreferences();
    }

    selectAllJobFunction(value) {
        if (value) {
            console.log("called");
            for (var i = 0; i < this.jobs.length; i++) {
                var flag = true;
                for (var j = 0; j < this.eventFilter.length; j++) {
                    if (this.jobs[i].value == this.eventFilter[j]) {
                        flag = false;
                    }
                }
                if (flag) {
                    this.eventFilter.push(this.jobs[i].value);
                }
            }
            this.jobCount = this.jobs.length;
        }
        else {
            for (var i = 0; i < this.jobs.length; i++) {
                this.eventFilter.splice(this.eventFilter.indexOf(this.jobs[i].value), 1);
            }
            this.jobCount = 0;
        }
        console.log(this.eventFilter)
    }

    selectJobFunction(checked) {
        if (checked) {
            this.jobCount++;
        }
        else {
            this.jobCount--;
        }
        this.selectAllJobModel = this.jobs.length == this.jobCount++;
    }

    selectAllJobChainFunction(value) {
        if (value) {
            console.log("called");
            for (var i = 0; i < this.jobChains.length; i++) {
                var flag = true;
                for (var j = 0; j < this.eventFilter.length; j++) {
                    if (this.jobChains[i].value == this.eventFilter[j]) {
                        flag = false;
                    }
                }
                if (flag) {
                    this.eventFilter.push(this.jobChains[i].value);
                }
            }
            this.jobChainCount = this.jobChains.length;
        }
        else {
            for (var i = 0; i < this.jobChains.length; i++) {
                this.eventFilter.splice(this.eventFilter.indexOf(this.jobChains[i].value), 1);
            }
            this.jobChainCount = 0;
        }
    }

    selectJobChainFunction(checked) {
        if (checked) {
            this.jobChainCount++;
        }
        else {
            this.jobChainCount--;
        }
        this.selectAllJobChainModel = this.jobChains.length == this.jobChainCount++;
    }

    selectAllPositiveOrderFunction(value) {
        if (value) {
            console.log("called");
            for (var i = 0; i < this.positiveOrders.length; i++) {
                var flag = true;
                for (var j = 0; j < this.eventFilter.length; j++) {
                    if (this.positiveOrders[i].value == this.eventFilter[j]) {
                        flag = false;
                    }
                }
                if (flag) {
                    this.eventFilter.push(this.positiveOrders[i].value);
                }
            }
            this.positiveOrderCount = this.positiveOrders.length;
        }
        else {
            for (var i = 0; i < this.positiveOrders.length; i++) {
                this.eventFilter.splice(this.eventFilter.indexOf(this.positiveOrders[i].value), 1);
            }
            this.positiveOrderCount = 0;
        }
    }

    selectPositiveOrderFunction(checked) {
        if (checked) {
            this.positiveOrderCount++;
        }
        else {
            this.positiveOrderCount--;
        }
        this.selectAllPositiveOrderModel = this.positiveOrders.length == this.positiveOrderCount++;
    }

    selectAllNegativeOrdersFunction(value) {
        if (value) {
            console.log("called");
            for (var i = 0; i < this.negativeOrders.length; i++) {
                var flag = true;
                for (var j = 0; j < this.eventFilter.length; j++) {
                    if (this.negativeOrders[i].value == this.eventFilter[j]) {
                        flag = false;
                    }
                }
                if (flag) {
                    this.eventFilter.push(this.negativeOrders[i].value);
                }
            }
            this.negativeOrderCount = this.negativeOrders.length;
        }
        else {
            for (var i = 0; i < this.negativeOrders.length; i++) {
                this.eventFilter.splice(this.eventFilter.indexOf(this.negativeOrders[i].value), 1);
            }
            this.negativeOrderCount = 0;
        }
    }

    selectNegativeOrderFunction(checked) {
        if (checked) {
            this.negativeOrderCount++;
        }
        else {
            this.negativeOrderCount--;
        }
        this.selectAllNegativeOrderModel = this.positiveOrders.length == this.positiveOrderCount++;
    }


    updateChecks() {
        console.log("Checks are updated");
        this.preferences.events.filter = this.eventFilter;
        this.preferences.events.jobCount = this.jobCount;
        this.preferences.events.jobChainCount = this.jobChainCount;
        this.preferences.events.positiveOrderCount = this.positiveOrderCount;
        this.preferences.events.negativeOrderCount = this.negativeOrderCount;
        this.savePreferences();
    }
}

