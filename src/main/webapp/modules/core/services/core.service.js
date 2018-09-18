/**
 * Created by sourabhagrawal on 20/06/16.
 */

(function () {
    'use strict';
    angular.module('app')
        .service('CoreService', CoreService)
        .service('SavedFilter', SavedFilter);

    CoreService.$inject = ['$window', '$resource', '$q'];
    function CoreService($window, $resource, $q) {

        var _view = 'grid', _sideView = false, tabs = {}, tempTabs = {}, dashboard = {};

        tabs._jobChain = {};
        tabs._jobChain.filter = {};
        tabs._jobChain.filter.state = 'ALL';
        tabs._jobChain.filter.sortBy = 'name';
        tabs._jobChain.reverse = false;
        tabs._jobChain.currentPage = '1';
        tabs._jobChain.expand_to = [];
        tabs._jobChain.selectedView = true;


        tabs._job = {};
        tabs._job.filter = {};
        tabs._job.filter.state = 'ALL';
        tabs._job.filter.type = 'ALL';
        tabs._job.filter.sortBy = 'name';
        tabs._job.reverse = false;
        tabs._job.currentPage = '1';
        tabs._job.expand_to = [];
        tabs._job.selectedView = true;
        tabs._job.showTaskPanel = undefined;

        tabs._jobDetail = {};
        tabs._jobDetail.filter = {};
        tabs._jobDetail.filter.state = 'ALL';
        tabs._jobDetail.filter.type = 'ALL';
        tabs._jobDetail.filter.sortBy = 'name';
        tabs._jobDetail.reverse = false;
        tabs._jobDetail.currentPage = '1';
        tabs._jobDetail.expand_to = [];
        tabs._jobDetail.selectedView = true;
        tabs._jobDetail.showTaskPanel = undefined;

        tabs._daliyPlan = {};
        tabs._daliyPlan.filter = {};
        tabs._daliyPlan.filter.status = 'ALL';
        tabs._daliyPlan.filter.state = '';
        tabs._daliyPlan.filter.sortBy = 'processedPlanned';
        tabs._daliyPlan.filter.range = "today";
        tabs._daliyPlan.range = 'period';
        tabs._daliyPlan.reverse = false;
        tabs._daliyPlan.currentPage = '1';
        tabs._daliyPlan.selectedView = true;

        tabs._order = {};
        tabs._order.filter = {};
        tabs._order.filter.state = 'ALL';
        tabs._order.filter.sortBy = 'orderId';
        tabs._order.reverse = false;
        tabs._order.currentPage = '1';
        tabs._order.expand_to = [];
        tabs._order.selectedView = true;
        tabs._order.showLogPanel = undefined;

        tabs._order1 = {};
        tabs._order1.filter = {};
        tabs._order1.filter.sortBy = 'orderId';
        tabs._order1.reverse = false;

        tabs._orderDetail = {};
        tabs._orderDetail.overview = true;
        tabs._orderDetail.filter = {};
        tabs._orderDetail.filter.sortBy = 'orderId';
        tabs._orderDetail.reverse = false;
        tabs._orderDetail.currentPage = '1';
        tabs._orderDetail.pageView = 'grid';
        tabs._orderDetail.showErrorNodes = true;
        tabs._orderDetail.fitToScreen = false;
        tabs._orderDetail.showLogPanel = undefined;

        tabs._history = {};
        tabs._history.order = {};
        tabs._history.type = 'jobChain';
        tabs._history.order.filter = {};
        tabs._history.order.filter.historyStates = 'all';
        tabs._history.order.filter.date = 'today';
        tabs._history.order.filter.sortBy = 'startTime';
        tabs._history.order.sortReverse = true;
        tabs._history.order.currentPage = '1';
        tabs._history.order.selectedView = true;
        tabs._history.task = {};
        tabs._history.task.filter = {};
        tabs._history.task.filter.historyStates = 'all';
        tabs._history.task.filter.date = 'today';
        tabs._history.task.filter.sortBy = 'startTime';
        tabs._history.task.sortReverse = true;
        tabs._history.task.currentPage = '1';
        tabs._history.task.selectedView = true;
        tabs._history.yade = {};
        tabs._history.yade.filter = {};
        tabs._history.yade.filter.historyStates = 'all';
        tabs._history.yade.filter.date = 'today';
        tabs._history.yade.filter.sortBy = 'start';
        tabs._history.yade.sortReverse = true;
        tabs._history.yade.currentPage = '1';
        tabs._history.yade.selectedView = true;

        tabs._yade = {};
        tabs._yade.filter = {};
        tabs._yade.filter.states = 'all';
        tabs._yade.filter.date = 'today';
        tabs._yade.filter.sortBy = 'start';
        tabs._yade.sortReverse = true;
        tabs._yade.currentPage = '1';
        tabs._yade.selectedView = true;

        tabs._yadeDetail = {};
        tabs._yadeDetail.overview = true;
        tabs._yadeDetail.filter = {};
        tabs._yadeDetail.filter.sortBy = 'orderId';
        tabs._yadeDetail.reverse = false;
        tabs._yadeDetail.currentPage = '1';
        tabs._yadeDetail.pageView = 'grid';
        tabs._yadeDetail.showErrorNodes = true;
        tabs._yadeDetail.fitToScreen = false;

        tabs._auditLog = {};
        tabs._auditLog.filter = {};
        tabs._auditLog.filter.historyStates = 'all';
        tabs._auditLog.filter.date = 'today';
        tabs._auditLog.filter.sortBy = "created";
        tabs._auditLog.sortReverse = true;
        tabs._auditLog.currentPage = '1';
        tabs._auditLog.selectedView = true;

        tabs._resource = {};
        tabs._resource.agents = {};
        tabs._resource.agents.filter = {};
        tabs._resource.agents.filter.state = 'all';
        tabs._resource.agents.filter.sortBy = 'path';
        tabs._resource.agents.reverse = false;
        tabs._resource.agents.currentPage = '1';
        tabs._resource.agents.expand_to = [];
        tabs._resource.agentJobExecution = {};
        tabs._resource.agentJobExecution.filter = {};
        tabs._resource.agentJobExecution.filter.date = 'today';
        tabs._resource.agentJobExecution.filter.sortBy = 'agent';
        tabs._resource.agentJobExecution.reverse = false;
        tabs._resource.agentJobExecution.currentPage = '1';
        tabs._resource.locks = {};
        tabs._resource.locks.filter = {};
        tabs._resource.locks.filter.state = 'all';
        tabs._resource.locks.filter.sortBy = 'name';
        tabs._resource.locks.reverse = false;
        tabs._resource.locks.currentPage = '1';
        tabs._resource.locks.expand_to = [];
        tabs._resource.processClasses = {};
        tabs._resource.processClasses.filter = {};
        tabs._resource.processClasses.filter.state = 'all';
        tabs._resource.processClasses.filter.sortBy = 'name';
        tabs._resource.processClasses.reverse = false;
        tabs._resource.processClasses.currentPage = '1';
        tabs._resource.processClasses.expand_to = [];
        tabs._resource.schedules = {};
        tabs._resource.schedules.filter = {};
        tabs._resource.schedules.filter.state = 'all';
        tabs._resource.schedules.filter.sortBy = 'name';
        tabs._resource.schedules.reverse = false;
        tabs._resource.schedules.currentPage = '1';
        tabs._resource.schedules.expand_to = [];
        tabs._resource.calendars = {};
        tabs._resource.calendars.filter = {};
        tabs._resource.calendars.filter.type = 'ALL';
        tabs._resource.calendars.filter.sortBy = 'name';
        tabs._resource.calendars.reverse = false;
        tabs._resource.calendars.currentPage = '1';
        tabs._resource.calendars.expand_to = [];
        tabs._resource.events = {};
        tabs._resource.events.filter = {};
        tabs._resource.events.filter.sortBy = 'expires';
        tabs._resource.events.reverse = false;
        tabs._resource.events.currentPage = '1';
        tabs._resource.events.selectedView = true;
        tabs._resource.state = 'agent';

        tempTabs._jobChain = {};
        tempTabs._jobChain.filter = {};
        tempTabs._jobChain.filter.state = 'ALL';
        tempTabs._jobChain.filter.sortBy = 'name';
        tempTabs._jobChain.reverse = false;
        tempTabs._jobChain.currentPage = '1';
        tempTabs._jobChain.expand_to = [];
        tempTabs._jobChain.selectedView = true;

        tempTabs._job = {};
        tempTabs._job.filter = {};
        tempTabs._job.filter.state = 'ALL';
        tempTabs._job.filter.type = 'ALL';
        tempTabs._job.filter.sortBy = 'name';
        tempTabs._job.reverse = false;
        tempTabs._job.currentPage = '1';
        tempTabs._job.expand_to = [];
        tempTabs._job.selectedView = true;
        tempTabs._job.showTaskPanel = undefined;

        tempTabs._jobDetail = {};
        tempTabs._jobDetail.filter = {};
        tempTabs._jobDetail.filter.state = 'ALL';
        tempTabs._jobDetail.filter.type = 'ALL';
        tempTabs._jobDetail.filter.sortBy = 'name';
        tempTabs._jobDetail.reverse = false;
        tempTabs._jobDetail.currentPage = '1';
        tempTabs._jobDetail.expand_to = [];
        tempTabs._jobDetail.selectedView = true;
        tempTabs._jobDetail.showTaskPanel = undefined;

        tempTabs._daliyPlan = {};
        tempTabs._daliyPlan.filter = {};
        tempTabs._daliyPlan.filter.status = 'ALL';
        tempTabs._daliyPlan.filter.state = '';
        tempTabs._daliyPlan.filter.sortBy = 'processedPlanned';
        tempTabs._daliyPlan.filter.range = "today";
        tempTabs._daliyPlan.range = 'period';
        tempTabs._daliyPlan.reverse = false;
        tempTabs._daliyPlan.currentPage = '1';
        tempTabs._daliyPlan.selectedView = true;

        tempTabs._order = {};
        tempTabs._order.filter = {};
        tempTabs._order.filter.state = 'ALL';
        tempTabs._order.filter.sortBy = 'orderId';
        tempTabs._order.reverse = false;
        tempTabs._order.currentPage = '1';
        tempTabs._order.expand_to = [];
        tempTabs._order.selectedView = true;
        tempTabs._order.showLogPanel = undefined;

        tempTabs._order1 = {};
        tempTabs._order1.filter = {};
        tempTabs._order1.filter.sortBy = 'orderId';
        tempTabs._order1.reverse = false;

        tempTabs._orderDetail = {};
        tempTabs._orderDetail.overview = true;
        tempTabs._orderDetail.filter = {};
        tempTabs._orderDetail.filter.sortBy = 'orderId';
        tempTabs._orderDetail.reverse = false;
        tempTabs._orderDetail.currentPage = '1';
        tempTabs._orderDetail.pageView = 'grid';
        tempTabs._orderDetail.showErrorNodes = true;
        tempTabs._orderDetail.fitToScreen = false;

        tempTabs._history = {};
        tempTabs._history.order = {};
        tempTabs._history.type = 'jobChain';
        tempTabs._history.order.filter = {};
        tempTabs._history.order.filter.historyStates = 'all';
        tempTabs._history.order.filter.date = 'today';
        tempTabs._history.order.filter.sortBy = 'startTime';
        tempTabs._history.order.sortReverse = true;
        tempTabs._history.order.currentPage = '1';
        tempTabs._history.order.selectedView = true;
        tempTabs._history.task = {};
        tempTabs._history.task.filter = {};
        tempTabs._history.task.filter.historyStates = 'all';
        tempTabs._history.task.filter.date = 'today';
        tempTabs._history.task.filter.sortBy = 'startTime';
        tempTabs._history.task.sortReverse = true;
        tempTabs._history.task.currentPage = '1';
        tempTabs._history.task.selectedView = true;
        tempTabs._history.yade = {};
        tempTabs._history.yade.filter = {};
        tempTabs._history.yade.filter.historyStates = 'all';
        tempTabs._history.yade.filter.date = 'today';
        tempTabs._history.yade.filter.sortBy = 'start';
        tempTabs._history.yade.sortReverse = true;
        tempTabs._history.yade.currentPage = '1';
        tempTabs._history.yade.selectedView = true;

        tempTabs._yade = {};
        tempTabs._yade.filter = {};
        tempTabs._yade.filter.states = 'all';
        tempTabs._yade.filter.date = 'today';
        tempTabs._yade.filter.sortBy = 'start';
        tempTabs._yade.sortReverse = true;
        tempTabs._yade.currentPage = '1';
        tempTabs._yade.selectedView = true;

        tempTabs._yadeDetail = {};
        tempTabs._yadeDetail.overview = true;
        tempTabs._yadeDetail.filter = {};
        tempTabs._yadeDetail.filter.sortBy = 'orderId';
        tempTabs._yadeDetail.reverse = false;
        tempTabs._yadeDetail.currentPage = '1';
        tempTabs._yadeDetail.pageView = 'grid';
        tempTabs._yadeDetail.showErrorNodes = true;
        tempTabs._yadeDetail.fitToScreen = false;

        tempTabs._auditLog = {};
        tempTabs._auditLog.filter = {};
        tempTabs._auditLog.filter.historyStates = 'all';
        tempTabs._auditLog.filter.date = 'today';
        tempTabs._auditLog.filter.sortBy = "created";
        tempTabs._auditLog.sortReverse = true;
        tempTabs._auditLog.currentPage = '1';
        tempTabs._auditLog.selectedView = true;

        tempTabs._resource = {};
        tempTabs._resource.agents = {};
        tempTabs._resource.agents.filter = {};
        tempTabs._resource.agents.filter.state = 'all';
        tempTabs._resource.agents.filter.sortBy = 'path';
        tempTabs._resource.agents.reverse = false;
        tempTabs._resource.agents.currentPage = '1';
        tempTabs._resource.agents.expand_to = [];
        tempTabs._resource.agentJobExecution = {};
        tempTabs._resource.agentJobExecution.filter = {};
        tempTabs._resource.agentJobExecution.filter.date = 'today';
        tempTabs._resource.agentJobExecution.filter.sortBy = 'agent';
        tempTabs._resource.agentJobExecution.reverse = false;
        tempTabs._resource.agentJobExecution.currentPage = '1';
        tempTabs._resource.locks = {};
        tempTabs._resource.locks.filter = {};
        tempTabs._resource.locks.filter.state = 'all';
        tempTabs._resource.locks.filter.sortBy = 'name';
        tempTabs._resource.locks.reverse = false;
        tempTabs._resource.locks.currentPage = '1';
        tempTabs._resource.locks.expand_to = [];
        tempTabs._resource.processClasses = {};
        tempTabs._resource.processClasses.filter = {};
        tempTabs._resource.processClasses.filter.state = 'all';
        tempTabs._resource.processClasses.filter.sortBy = 'name';
        tempTabs._resource.processClasses.reverse = false;
        tempTabs._resource.processClasses.currentPage = '1';
        tempTabs._resource.processClasses.expand_to = [];
        tempTabs._resource.schedules = {};
        tempTabs._resource.schedules.filter = {};
        tempTabs._resource.schedules.filter.state = 'all';
        tempTabs._resource.schedules.filter.sortBy = 'name';
        tempTabs._resource.schedules.reverse = false;
        tempTabs._resource.schedules.currentPage = '1';
        tempTabs._resource.schedules.expand_to = [];
        tempTabs._resource.calendars = {};
        tempTabs._resource.calendars.filter = {};
        tempTabs._resource.calendars.filter.type = 'ALL';
        tempTabs._resource.calendars.filter.sortBy = 'name';
        tempTabs._resource.calendars.reverse = false;
        tempTabs._resource.calendars.currentPage = '1';
        tempTabs._resource.calendars.expand_to = [];
        tempTabs._resource.events = {};
        tempTabs._resource.events.filter = {};
        tempTabs._resource.events.filter.sortBy = 'expires';
        tempTabs._resource.events.reverse = false;
        tempTabs._resource.events.currentPage = '1';
        tempTabs._resource.events.selectedView = true;
        tempTabs._resource.state = 'agent';

        dashboard._dashboard = {};
        dashboard._dashboard.filter = {};
        dashboard._dashboard.filter.range = "today";
        dashboard._dashboard.filter.orderSummaryfrom = "0d";
        dashboard._dashboard.filter.taskSummaryfrom = "0d";
        dashboard._dashboard.filter.fileSummaryfrom = "0d";
        dashboard._dashboard.filter.orderLabel = 'button.today';
        dashboard._dashboard.filter.taskLabel = 'button.today';
        dashboard._dashboard.filter.fileLabel = 'button.today';

        if ($window.localStorage.$SOS$DASHBOARDTABS) {
            try {
                var obj = JSON.parse($window.localStorage.$SOS$DASHBOARDTABS);

                if (obj) {
                    if (obj._dashboard.filter.orderRange != 'today') {

                        dashboard = obj;
                    }
                }
            } catch (e) {
                console.log(e);
            }
        }

        if ($window.sessionStorage.$SOS$VIEW) {
            _view = $window.sessionStorage.$SOS$VIEW;
        } else {
            $window.sessionStorage.$SOS$VIEW = 'grid';
        }

        if ($window.sessionStorage.$SOS$SIDEVIEW == 'true' || $window.sessionStorage.$SOS$SIDEVIEW == true) {
            _sideView = $window.sessionStorage.$SOS$SIDEVIEW;
        } else {
            $window.sessionStorage.$SOS$SIDEVIEW = false;
        }

        return {
            getParams: function (name) {
                name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
                var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
                    results = regex.exec(location.search);
                return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
            },
            setView: function (view) {
                $window.sessionStorage.$SOS$VIEW = view;
                _view = view;
            },
            getView: function () {
                return _view;
            },
            setSideView: function (view) {
                $window.sessionStorage.$SOS$SIDEVIEW = view;
                _sideView = view;
            },
            getSideView: function () {
                return !_sideView;
            },
            setDefaultTab: function () {
                tabs = tempTabs;
            },
            getTabs: function () {
                return tabs;
            },
            getDashboard: function () {
                return dashboard;
            },
            getJobTab: function () {
                return tabs._job;
            },
            getJobDetailTab: function () {
                return tabs._jobDetail;
            },
            getDailyPlanTab: function () {
                return tabs._daliyPlan;
            },
            getJobChainTab: function () {
                return tabs._jobChain;
            },
            getOrderTab: function () {
                return tabs._order;
            },
            getOrderTab1: function () {
                return tabs._order1;
            },
            getOrderDetailTab: function () {
                return tabs._orderDetail;
            },
            getHistoryTab: function () {
                return tabs._history;
            },
            getDashboardTab: function () {
                return dashboard._dashboard;
            },
            getResourceTab: function () {
                return tabs._resource;
            },
            getAuditLogTab: function(){
                return tabs._auditLog;
            },
            getYadeTab: function(){
                return tabs._yade;
            },
            getYadeDetailTab: function () {
                return tabs._yadeDetail;
            },
            getEvents: function (filter) {
                var deferred = $q.defer();

                var Events = $resource('events');
                Events.save(filter, function (res) {
                    deferred.resolve(res);
                }, function (err) {
                    deferred.reject(err);
                });
                return deferred.promise;
            }
        }
    }


    SavedFilter.$inject = ['$window'];
    function SavedFilter($window) {
        var props = ['jobChainFilters', 'orderFilters', 'jobFilters', 'yadeFilters','eventFilters','historyFilters', 'dailyPlanFilters','auditLogFilters'];
        var propsPrefix = '$SOS$';

        function SavedFilter() {
            let self = this;
            props.forEach(function (name) {
                self[name] = load(name);
            });
        }

        SavedFilter.prototype.save = function () {
            let self = this;
            props.forEach(function (name) {
                save($window.localStorage, name, self[name]);
            });
        };

        SavedFilter.prototype.setJobChain = function (jobchain) {
            this.jobChainFilters = JSON.stringify(jobchain);
        };

        SavedFilter.prototype.setOrder = function (order) {
            this.orderFilters = JSON.stringify(order);
        };
        SavedFilter.prototype.setJob = function (job) {
            this.jobFilters = JSON.stringify(job);
        };
        SavedFilter.prototype.setHistory = function (history) {
            this.historyFilters = JSON.stringify(history);
        };
        SavedFilter.prototype.setDailyPlan = function (dailyPlan) {
            this.dailyPlanFilters = JSON.stringify(dailyPlan);
        };
        SavedFilter.prototype.setYade = function (yade) {
            this.yadeFilters = JSON.stringify(yade);
        };
        SavedFilter.prototype.setEvent = function (event) {
            this.eventFilters = JSON.stringify(event);
        };
        SavedFilter.prototype.setAuditLog = function (filter) {
            this.auditLogFilters = JSON.stringify(filter);
        };
        SavedFilter.prototype.clearStorage = function () {
            props.forEach(function (name) {
                save($window.localStorage, name, null);
            });
        };

        return new SavedFilter();

        // Note: LocalStorage converts the value to string
        // We are using empty string as a marker for null/undefined values.
        function save(storage, name, value) {
            let key = propsPrefix + name;
            if (value == null) value = '';
            storage[key] = value;
        }

        function load(name) {
            let key = propsPrefix + name;
            return $window.localStorage[key] || null;
        }
    }

})();
