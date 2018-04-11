import { Component, OnInit,Input, OnDestroy } from '@angular/core';
import { CoreService } from '../../services/core.service';
import { SaveService } from '../../services/save.service';
import { AuthService } from '../../components/guard/auth.service';
import { DataService } from '../../services/data.service';
import { Subscription }   from 'rxjs/Subscription';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TreeModal } from '../../components/tree-modal/tree.component';
import { EditFilterModal } from '../../components/edit-filter-modal/edit-filter.component';

import * as moment from 'moment';
import * as _ from 'underscore';

declare var JSGantt:any;
declare var $;

@Component({
  selector: 'app-daily-plan',
  templateUrl: './daily-plan.component.html',
  styleUrls: ['./daily-plan.component.css']
})
export class DailyPlanComponent implements OnInit, OnDestroy {

    schedulerIds:any;
    preferences:any;
    permission:any;
    plans:any = [];
    isLoaded:boolean = false;
    notAuthenticate:boolean = false;
    subscription:Subscription;
    dailyPlanFilters:any = {filter: {}};
    pageView:string;
    savedDailyPlanFilter:any = {};
    selectedFiltered:any = {};
    searchDailyPlanFilter:any = {};
    dailyPlanFilter:any = {};
    temp_filter:any = {};
    dailyPlanFilterList:any = [];
    showSearchPanel:boolean = false;
    isUnique:boolean = true;
    late:boolean;
    searchKey:string;

    constructor(private authService:AuthService, public coreService:CoreService, private saveService:SaveService, private dataService:DataService, private modalService:NgbModal) {
        this.subscription = dataService.eventAnnounced$.subscribe(res => {
            this.refresh(res);
        });
    }

    private refresh(args) {
        for (let i = 0; i < args.length; i++) {
            if (args[i].jobschedulerId == this.schedulerIds.selected) {
                if (args[i].eventSnapshots && args[i].eventSnapshots.length > 0) {
                    for (let j = 0; j < args[i].eventSnapshots.length; j++) {
                        if (args[i].eventSnapshots[j].eventType === "DailyPlanChanged") {
                            this.load();
                            break;
                        }
                    }
                }
                break
            }
        }
    }

    ngOnInit() {
        if (sessionStorage.preferences)
            this.preferences = JSON.parse(sessionStorage.preferences);
        this.schedulerIds = JSON.parse(this.authService.scheduleIds);
        this.permission = JSON.parse(this.authService.permission);
        this.dailyPlanFilters = this.coreService.getDailyPlanTab();
        this.savedDailyPlanFilter = JSON.parse(this.saveService.dailyPlanFilters) || {};

        if (this.dailyPlanFilters.selectedView) {
            this.savedDailyPlanFilter.selected = this.savedDailyPlanFilter.selected || this.savedDailyPlanFilter.favorite;
        } else {
            this.savedDailyPlanFilter.selected = undefined;
        }
        this.pageView = JSON.parse(localStorage.views).dailyPlan;

        this.checkSharedFilters();
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    getPlans(status, range):void {
        if (status) {
            this.dailyPlanFilters.filter.status = status;
        }
        if (range) {
            this.dailyPlanFilters.filter.range = range;
        }
        this.load();
    }

    private load():void {
        this.isLoaded = false;

        var obj = {
            jobschedulerId: this.schedulerIds.selected,
            states: [],
            late: false
        };
        if (this.selectedFiltered && this.selectedFiltered.name) {
            this.isCustomizationSelected(true);
            obj = this.applySavedFilter(obj);
        } else {

            if (this.dailyPlanFilters.filter.status != 'ALL') {
                obj.states = [];
                if (this.dailyPlanFilters.filter.status == 'WAITING') {
                    obj.states.push("PLANNED");
                } else {
                    obj.states.push(this.dailyPlanFilters.filter.status);
                }
            }
            if (this.dailyPlanFilters.filter.state == 'LATE') {
                obj.late = true;
            }
        }
        this.setDateRange(obj);

        this.coreService.post('plan', obj).subscribe(res => {
            this.filterData(res);
            this.isLoaded = true;
        }, (err)=> {
            console.log(err);
            this.isLoaded = true;
        });
    }

    private isCustomizationSelected(flag) {
        if (flag) {
            this.temp_filter.status = _.clone(this.dailyPlanFilters.filter.status);
            this.temp_filter.range = _.clone(this.dailyPlanFilters.filter.range);
            this.dailyPlanFilters.filter.status = '';
            this.dailyPlanFilters.filter.range = '';
        } else {
            if (this.temp_filter.status) {
                this.dailyPlanFilters.filter.status = _.clone(this.temp_filter.status);
                this.dailyPlanFilters.filter.range = _.clone(this.temp_filter.range);
            } else {
                this.dailyPlanFilters.filter.status = 'ALL';
                this.dailyPlanFilters.filter.range = 'today';
            }
        }
    }

    private parseProcessExecuted(regex):any {
        var date;
        if (/^\s*(now\s*[-,+])\s*(\d+)\s*$/i.test(regex)) {
            var fromDate = new Date();
            date = new Date();
            var seconds = parseInt(/^\s*(now\s*[-,+])\s*(\d+)\s*$/i.exec(regex)[2]);
            date.setSeconds(fromDate.getSeconds() - seconds);
        } else if (/^\s*[-,+](\d+)(h|d|w|M|y)\s*$/.test(regex)) {
            date = regex;
        } else if (/^\s*(Today)\s*$/i.test(regex)) {
            date = '0d';
        } else if (/^\s*(now)\s*$/i.test(regex)) {
            date = new Date();
        } else if (/^\s*[-,+](\d+)(h|d|w|M|y)\s*[-,+](\d+)(h|d|w|M|y)\s*$/.test(regex)) {
            date = regex;
        }
        return date;
    }

    private applySavedFilter(obj) {
        if (this.selectedFiltered.regex)
            obj.regex = this.selectedFiltered.regex;
        if (this.selectedFiltered.jobChain)
            obj.jobChain = this.selectedFiltered.jobChain;
        if (this.selectedFiltered.orderId)
            obj.orderId = this.selectedFiltered.orderId;
        if (this.selectedFiltered.job)
            obj.job = this.selectedFiltered.job;
        if (this.selectedFiltered.state && this.selectedFiltered.state.length > 0) {
            obj.states = [];
            if (this.selectedFiltered.state.indexOf('WAITING') !== -1) {
                obj.states.push("PLANNED");
            }
            if (this.selectedFiltered.state.indexOf('SUCCESSFUL') !== -1) {
                obj.states.push("SUCCESSFUL");
            }
            if (this.selectedFiltered.state.indexOf('FAILED') !== -1) {
                obj.states.push("FAILED");
            }
            if (this.selectedFiltered.state.indexOf('LATE') !== -1) {
                obj.late = true;
            }

        }
        if (this.selectedFiltered.paths && this.selectedFiltered.paths.length > 0) {
            obj.folders = [];
            for (var i = 0; i < this.selectedFiltered.paths.length; i++) {
                obj.folders.push({folder: this.selectedFiltered.paths[i], recursive: true});
            }
        }
        var fromDate;
        var toDate;

        if (this.selectedFiltered.from) {
            fromDate = this.parseProcessExecuted(this.selectedFiltered.from);
        }
        if (this.selectedFiltered.to) {
            toDate = this.parseProcessExecuted(this.selectedFiltered.to);
        }

        if (!fromDate) {
            fromDate = new Date();
            fromDate.setHours(0);
            fromDate.setMinutes(0);
            fromDate.setSeconds(0);
            fromDate.setMilliseconds(0);

        }
        obj.dateFrom = fromDate;
        if (!toDate) {
            toDate = new Date();
            toDate.setDate(toDate.getDate() + 1);
            toDate.setHours(0);
            toDate.setMinutes(0);
            toDate.setSeconds(0);
            toDate.setMilliseconds(0);
        }
        obj.dateTo = toDate;

        return obj;
    }

    private filterResponse(res) {
        if (res.configurations && res.configurations.length > 0)
            this.dailyPlanFilterList = res.configurations;
        this.getCustomizations();
    }

    exportToExcel() {
        $('#dailyPlanTableId').table2excel({
            exclude: ".tableexport-ignore",
            filename: "jobscheduler-dailyplan",
            fileext: ".xls",
            exclude_img: false,
            exclude_links: false,
            exclude_inputs: false
        });
    }

    private checkSharedFilters() {
        if (this.permission.JOCConfigurations.share.view.status) {
            var obj = {
                jobschedulerId: this.schedulerIds.selected,
                configurationType: "CUSTOMIZATION",
                objectType: "DAILYPLAN",
                shared: true
            };
            this.coreService.post('configurations', obj).subscribe((res) => {
                this.filterResponse(res);
            }, err => {
                this.getCustomizations();
            });
        } else {
            this.getCustomizations();
        }
    }

    private filterCustomizationResponse(res) {
        if (this.dailyPlanFilterList && this.dailyPlanFilterList.length > 0) {
            if (res.configurations && res.configurations.length > 0) {
                this.dailyPlanFilterList = this.dailyPlanFilterList.concat(res.configurations);
            }
            var data = [];
            for (var i = 0; i < this.dailyPlanFilterList.length; i++) {
                var flag = true;
                for (var j = 0; j < data.length; j++) {
                    if (data[j].account == this.dailyPlanFilterList[i].account && data[j].name == this.dailyPlanFilterList[i].name) {
                        flag = false;
                    }

                }
                if (flag) {
                    data.push(this.dailyPlanFilterList[i]);
                }
            }
            this.dailyPlanFilterList = data;

        } else {
            this.dailyPlanFilterList = res.configurations;
        }
        if (this.savedDailyPlanFilter.selected) {
            var flag = true;
            let self = this;
            this.dailyPlanFilterList.forEach(function (value) {
                if (value.id == this.savedDailyPlanFilter.selected) {
                    flag = false;
                    self.coreService.post('configurations', {
                        jobschedulerId: value.jobschedulerId,
                        id: value.id
                    }).subscribe(conf => {
                        this.filterConfResponse(conf, value);
                    });
                }
            });
            if (flag) {
                this.savedDailyPlanFilter.selected = undefined;
                this.load();
            }
        } else {
            this.savedDailyPlanFilter.selected = undefined;
            this.load();
        }
    }

    private filterConfResponse(conf, value) {
        this.selectedFiltered = JSON.parse(conf.configuration.configurationItem);
        this.selectedFiltered.account = value.account;
        this.load();
    }

    private getCustomizations() {
        var obj = {
            jobschedulerId: this.schedulerIds.selected,
            account: this.permission.user,
            configurationType: "CUSTOMIZATION",
            objectType: "DAILYPLAN"
        };
        this.coreService.post('configurations', obj).subscribe((res) => {

            this.filterCustomizationResponse(res);

        }, (err) => {
            this.savedDailyPlanFilter.selected = undefined;
            this.load();
        })
    }

    changeLate() {
        this.late = !this.late;
        if (this.late) {
            this.dailyPlanFilters.filter.state = '';
        } else {
            if (this.dailyPlanFilters.filter.status == 'ALL') {
                this.dailyPlanFilters.filter.status = '';
            }
        }

        this.load();
    }


    sortBy(propertyName) {
        this.dailyPlanFilters.reverse = !this.dailyPlanFilters.reverse;
        this.dailyPlanFilters.filter.sortBy = propertyName;
        this.plans = this.sortByKey(this.plans, this.dailyPlanFilters.filter.sortBy, this.dailyPlanFilters.reverse);
    }

    private naturalSorter(as, bs) {
        var a, b, a1, b1, i = 0, n, L,
            rx = /(\.\d+)|(\d+(\.\d+)?)|([^\d.]+)|(\.\D+)|(\.$)/g;
        if (as === bs) return 0;
        a = as.toLowerCase().match(rx);
        b = bs.toLowerCase().match(rx);
        L = a.length;
        while (i < L) {
            if (!b[i]) return 1;
            a1 = a[i];
            b1 = b[i++];
            if (a1 !== b1) {
                n = a1 - b1;
                if (!isNaN(n)) return n;
                return a1 > b1 ? 1 : -1;
            }
        }
        return b[i] ? -1 : 0;
    }

    private sortByKey(array, key, order) {
        var reA = /[^a-zA-Z]/g;
        let self = this;
        if (key == 'processedPlanned' || key == 'orderId') {
            return array.sort(function (x, y) {
                var key1 = key == 'processedPlanned' ? x.orderId ? 'jobChain' : 'job' : key;

                var a = x[key1];
                var b = y[key1];
                if (order) {
                    a = y[key1];
                    b = x[key1];
                }

                if (!a && b) {
                    if (key1 == 'job') {
                        a = x['jobChain'];
                        if (order) {
                            a = y['jobChain'];
                        }
                    } else if (key1 == 'jobChain') {
                        a = x['job'];
                        if (order) {
                            a = y['job'];
                        }
                    } else {
                        return -1;
                    }
                } else if (a && !b) {
                    if (key1 == 'job') {
                        b = y['jobChain'];
                        if (order) {
                            b = x['jobChain'];
                        }
                    } else if (key1 == 'jobChain') {
                        b = y['job'];
                        if (order) {
                            b = x['job'];
                        }
                    } else {
                        return 1;
                    }
                }

                var AInt = parseInt(a, 10);
                var BInt = parseInt(b, 10);

                if (isNaN(AInt) && isNaN(BInt)) {
                    return self.naturalSorter(a, b);
                } else if (isNaN(AInt)) {//A is not an Int
                    return 1;
                } else if (isNaN(BInt)) {//B is not an Int
                    return -1;
                } else if (AInt == BInt) {
                    var aA = a.replace(reA, "");
                    var bA = b.replace(reA, "");
                    return aA > bA ? 1 : -1;
                } else {
                    return AInt > BInt ? 1 : -1;
                }

            });
        } else if (key == 'duration') {
            return array.sort(function (x, y) {
                var a = x;
                var b = y;
                if (!order) {
                    a = y;
                    b = x;
                }
                var m, n;
                if (a.plannedStartTime && a.expectedEndTime) {
                    m = moment(a.plannedStartTime).diff(a.expectedEndTime);
                }
                if (b.plannedStartTime && b.expectedEndTime) {
                    n = moment(b.plannedStartTime).diff(b.expectedEndTime);
                }
                return m > n ? 1 : -1;
            });
        } else if (key == 'duration1') {
            return array.sort(function (x, y) {
                var a = x;
                var b = y;
                if (!order) {
                    a = y;
                    b = x;
                }

                var m = 0, n = 0;
                if (a.startTime && a.endTime) {
                    m = moment(a.startTime).diff(a.endTime) || 0;
                }
                if (b.startTime && b.endTime) {
                    n = moment(b.startTime).diff(b.endTime) || 0;
                }
                return m > n ? 1 : -1;
            });
        }
        else {
            let direction = order ? 1 : -1;
            return array.sort(function (a, b) {
                if (a[key] < b[key]) {
                    return -1 * direction;
                }
                else if (a[key] > b[key]) {
                    return 1 * direction;
                }
                else {
                    return 0;
                }
            });
        }
    }

    private filterData(res):void {
        this.plans = this.sortByKey(res.planItems, this.dailyPlanFilters.filter.sortBy, this.dailyPlanFilters.reverse);
        this.prepareGanttData(this.plans);
    }

    private setDateRange(obj) {

        if (!(this.dailyPlanFilters.filter.range == 'today' || !this.dailyPlanFilters.filter.range)) {
            var from = new Date();
            var to = new Date();
            from.setDate(from.getDate());
            to.setDate(to.getDate() + 1);
            obj.dateFrom = from;
            obj.dateTo = to;
        } else {
            obj.dateFrom = '0d';
            obj.dateTo = '0d';
            obj.timeZone = this.preferences.zone;
        }
    }

    receiveMessage($event) {
        this.pageView = $event;
    }

    prepareGanttData(data2) {

        var minNextStartTime;
        var maxEndTime;
        var orders = [];

        var groupJobChain = [];
        for (var i = 0; i < data2.length; i++) {

            if (groupJobChain.length > 0) {
                var flag = false;
                for (var j = 0; j < groupJobChain.length; j++) {
                    if (data2[i].jobChain && (groupJobChain[j].jobChain == data2[i].jobChain && groupJobChain[j].orderId == data2[i].orderId)) {
                        flag = true;
                    } else if (data2[i].job && (groupJobChain[j].job == data2[i].job)) {
                        flag = true;
                    }
                }
                if (!flag) {
                    if (data2[i].orderId) {
                        groupJobChain.push({orderId: data2[i].orderId, jobChain: data2[i].jobChain});
                    } else if (data2[i].job) {
                        groupJobChain.push({job: data2[i].job});
                    }
                }
            } else {

                if (data2[i].orderId)
                    groupJobChain.push({orderId: data2[i].orderId, jobChain: data2[i].jobChain});
                else if (data2[i].job)
                    groupJobChain.push({job: data2[i].job});
            }
        }
        var theme = window.localStorage.$SOS$THEME;
        for (var index = 0; index < groupJobChain.length; index++) {
            var i = 0;
            orders[index] = {};
            orders[index].tasks = [];
            for (var index1 = 0; index1 < data2.length; index1++) {
                if (data2[index1].orderId && (groupJobChain[index].jobChain == data2[index1].jobChain && groupJobChain[index].orderId == data2[index1].orderId)) {
                    orders[index].tasks[i] = {};
                    orders[index].name = data2[index1].jobChain.substring(data2[index1].jobChain);
                    orders[index].orderId = data2[index1].orderId;

                    this.plans[index].processedPlanned = orders[index].name;
                    orders[index].tasks[i].name = orders[index].name;

                    this.plans[index].status = data2[index1].state._text;
                    if (data2[index1].state._text == 'SUCCESSFUL') {
                        orders[index].tasks[i].color = "text-green";
                    } else if (data2[index1].state._text == 'FAILED') {
                        orders[index].tasks[i].color = "text-red";
                    }
                    else if (data2[index1].late) {
                        orders[index].tasks[i].color = "#ffc300";
                    } else {
                        if (theme != 'light' && theme != 'lighter')
                            orders[index].tasks[i].color = "#fafafa";
                    }
                    orders[index].tasks[i].from = new Date(data2[index1].plannedStartTime);

                    if (!minNextStartTime || minNextStartTime > new Date(data2[index1].plannedStartTime)) {
                        minNextStartTime = new Date(data2[index1].plannedStartTime);
                    }
                    if (!maxEndTime || maxEndTime < new Date(data2[index1].expectedEndTime)) {
                        maxEndTime = new Date(data2[index1].expectedEndTime);
                    }
                    orders[index].tasks[i].to = new Date(data2[index1].expectedEndTime);

                    if (data2[index1].startMode == 0) {
                        orders[index].tasks[i].startMode = 'label.singleStartMode';
                        orders[index].tasks[i].content = '<i class="fa fa-repeat1">';
                    } else if (data2[index1].startMode == 1) {
                        orders[index].tasks[i].startMode = 'label.startStartRepeatMode';
                        orders[index].tasks[i].content = '<img style="margin-left: -10px" src="images/start-start.png">';
                    } else if (data2[index1].startMode == 2) {
                        orders[index].tasks[i].startMode = 'label.startEndRepeatMode';
                        orders[index].tasks[i].content = '<img style="margin-left: -10px" src="images/end-start.png">';
                    }

                    if (data2[index1].period.repeat) {
                        var s = parseInt(((data2[index1].period.repeat) % 60).toString()),
                            m = parseInt(((data2[index1].period.repeat / 60) % 60).toString()),
                            h = parseInt(((data2[index1].period.repeat / (60 * 60)) % 24).toString());
                        let h1 = h > 9 ? h : '0' + h;
                        let m1 = m > 9 ? m : '0' + m;
                        let s1 = s > 9 ? s : '0' + s;
                        orders[index].tasks[i].repeat = h1 + ':' + m1 + ':' + s1;
                    }
                    i++;
                } else if (data2[index1].job && (groupJobChain[index].job == data2[index1].job)) {
                    orders[index].tasks[i] = {};
                    orders[index].name = data2[index1].job;

                    this.plans[index].processedPlanned = orders[index].name;
                    orders[index].tasks[i].name = orders[index].name;

                    this.plans[index].status = data2[index1].state._text;
                    if (data2[index1].state._text == 'SUCCESSFUL') {
                        orders[index].tasks[i].color = "text-green";
                    } else if (data2[index1].state._text == 'FAILED') {
                        orders[index].tasks[i].color = "text-red";
                    }
                    else if (data2[index1].late) {
                        orders[index].tasks[i].color = "#ffc300";
                    } else {
                        if (theme != 'light' && theme != 'lighter')
                            orders[index].tasks[i].color = "#fafafa";
                    }
                    orders[index].tasks[i].from = new Date(data2[index1].plannedStartTime);

                    if (!minNextStartTime || minNextStartTime > new Date(data2[index1].plannedStartTime)) {
                        minNextStartTime = new Date(data2[index1].plannedStartTime);
                    }
                    if (!maxEndTime || maxEndTime < new Date(data2[index1].expectedEndTime)) {
                        maxEndTime = new Date(data2[index1].expectedEndTime);
                    }
                    orders[index].tasks[i].to = new Date(data2[index1].expectedEndTime);

                    if (data2[index1].startMode == 0) {
                        orders[index].tasks[i].startMode = 'label.singleStartMode';
                        orders[index].tasks[i].content = 'fa fa-repeat1';
                    } else if (data2[index1].startMode == 1) {
                        orders[index].tasks[i].startMode = 'label.startStartRepeatMode';
                        orders[index].tasks[i].content = '<img style="margin-left: -10px" src="images/start-start.png">';
                    } else if (data2[index1].startMode == 2) {
                        orders[index].tasks[i].startMode = 'label.startEndRepeatMode';
                        orders[index].tasks[i].content = '<img style="margin-left: -10px" src="images/end-start.png">';
                    }

                    if (data2[index1].period.repeat) {
                        var s = parseInt(((data2[index1].period.repeat) % 60).toString()),
                            m = parseInt(((data2[index1].period.repeat / 60) % 60).toString()),
                            h = parseInt(((data2[index1].period.repeat / (60 * 60)) % 24).toString());
                        let h1 = h > 9 ? h : '0' + h;
                        let m1 = m > 9 ? m : '0' + m;
                        let s1 = s > 9 ? s : '0' + s;
                        orders[index].tasks[i].repeat = h1 + ':' + m1 + ':' + s1;
                    }
                    i++;
                }
            }
        }

        this.init(orders);
        //console.log(JSON.stringify(orders));
    }

    private init(data) {
        var g = new JSGantt.GanttChart(document.getElementById('embedded-Gantt'), 'hour');
        if (g.getDivId() != null) {
            g.setCaptionType('Duration');  // Set to Show Caption (None,Caption,Resource,Duration,Complete)
            g.setShowDur(0);
            g.setShowComp(0);
            g.setShowStartDate(0);
            g.setShowEndDate(0);
            g.setScrollTo('today');
            g.setShowTaskInfoLink(0); // Show link in tool tip (0/1)
            g.setFormatArr('Hour', 'Day', 'Week'); // Even with setUseSingleCell using Hour format on such a large chart can cause issues in some browsers
            // Parameters
            // (pID, pName, pStart, pEnd, pStyle, pLink (unused)  pMile, pRes, pComp, pGroup, pParent, pOpen, pDepend, pCaption, pNotes, pGantt)

            for (let i = 0; i < data.length; i++) {
                //  console.log(data[i])

                g.AddTaskItem(new JSGantt.TaskItem(i + 1, data[i].name, data[i].tasks[0].from, data[i].tasks[0].to, data[i].tasks[0].color, '', 0, data[i].orderId, 0, 0, 0, 0, 'SF', '', '', g));
            }

            g.Draw();
        } else {
            console.log("Error, unable to create Gantt Chart");
        }
    }


    /* ------------- Advance search ------------------- */
    advancedSearch() {
        this.isUnique = true;
        this.showSearchPanel = true;
        this.searchDailyPlanFilter = {
            radio: 'current',
            from1: 'today',
            to1: 'today',
            from: new Date(),
            fromTime: '00:00',
            to: new Date(),
            toTime: '00:00',
            state:[]
        };
        this.searchDailyPlanFilter.to.setDate(this.searchDailyPlanFilter.to.getDate() + 1);
        this.dailyPlanFilter = undefined;
    }

    cancel() {
        this.showSearchPanel = false;
        this.searchDailyPlanFilter = {};
    }

    getFolderTree() {
        const modalRef = this.modalService.open(TreeModal, {backdrop: "static"});
        modalRef.componentInstance.schedulerId = this.schedulerIds.selected;
        modalRef.componentInstance.paths = this.searchDailyPlanFilter.paths || [];
        modalRef.componentInstance.type = 'DAILYPLAN';
        modalRef.componentInstance.isCollapsed = true;
        modalRef.result.then((result) => {

        }, (reason) => {
            console.log('close...', reason)
        });
    }

    /* ---- Customization ------ */
    createCustomization() {
        const modalRef = this.modalService.open(FilterModal, {backdrop: "static", size: "lg"});
        modalRef.componentInstance.permission = this.permission;
        modalRef.componentInstance.schedulerId = this.schedulerIds.selected;
        modalRef.componentInstance.allFilter = this.dailyPlanFilterList;
        modalRef.componentInstance.new = true;
        modalRef.result.then((configObj) => {
            this.dailyPlanFilterList.push(configObj);

            if (this.dailyPlanFilterList.length == 1) {
                this.savedDailyPlanFilter.selected = configObj.id;
                this.dailyPlanFilters.selectedView = true;
                this.selectedFiltered = configObj;
                this.isCustomizationSelected(true);
                this.load();
                this.saveService.setDailyPlan(this.savedDailyPlanFilter);
                this.saveService.save();
            }
        }, (reason) => {
            console.log('close...', reason)
        });
    }

    editFilters () {
        let filters = {
            list: this.dailyPlanFilterList,
            favorite: this.savedDailyPlanFilter.favorite
        };
        const modalRef = this.modalService.open(EditFilterModal, {backdrop: "static"});

    }

    changeFilter(filter){

    }
}

@Component({
    selector: 'ngbd-modal-content',
     templateUrl: './filter-dialog.html',
})

export class FilterModal implements  OnInit {
    @Input() schedulerId;
    @Input() permission;
    @Input() allFilter;
    @Input() new;
    submitted:boolean = false;
    isUnique:boolean = true;
    filter:any = {};

    constructor(public activeModal:NgbActiveModal, public coreService:CoreService, private modalService:NgbModal) {
    }

    ngOnInit() {
        if (this.new) {
            this.filter = {
                name: '',
                regex: '',
                paths: [],
                jobChain: '',
                orderId: '',
                job: '',
                state: [],
                from: 'today',
                to: 'today',
                shared: false
            };
        }
    }

    getFolderTree() {
        const modalRef = this.modalService.open(TreeModal, {backdrop: "static"});
        modalRef.componentInstance.schedulerId = this.schedulerId;
        modalRef.componentInstance.paths = this.filter.paths || [];
        modalRef.componentInstance.type = 'DAILYPLAN';
        modalRef.componentInstance.isCollapsed = true;
        modalRef.result.then((result) => {

        }, (reason) => {
            console.log('close...', reason)
        });
    }

    remove(path) {
        this.filter.paths.splice(this.filter.paths.indexOf(path), 1);
    }

    checkFilterName(existingName) {
        this.isUnique = true;
        for(let i=0; i< this.allFilter.length;i++) {
            if (this.filter.name === this.allFilter[i].name && this.permission.user === this.allFilter[i].account && this.filter.name !== existingName) {
                this.isUnique = false;
            }
        }
    }

    onSubmit(result):void {
        this.submitted = true;
        let configObj = {
            jobschedulerId: this.schedulerId,
            account: this.permission.user,
            configurationType: "CUSTOMIZATION",
            objectType: "DAILYPLAN",
            name: result.name,
            shared: result.shared,
            id: 0,
            configurationItem: {}
        };
        if (!result.from) {
            result.from = '0d';
        }
        if (!result.to) {
            result.to = '0d';
        }
        configObj.configurationItem = JSON.stringify(result);
        this.coreService.post('configuration/save', configObj).subscribe((res) => {
            // configObj.id = res.id;
            this.submitted = false;
            this.activeModal.close(configObj);
        }, err => {
            this.submitted = false;
        });
    }

}

