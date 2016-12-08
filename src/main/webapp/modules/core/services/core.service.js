/**
 * Created by sourabhagrawal on 20/06/16.
 */

(function () {
    'use strict';
    angular.module('app')
        .service('CoreService', CoreService)
        .service('SavedFilter', SavedFilter);

    CoreService.$inject = ['$window','$resource', '$q'];
    function CoreService($window,$resource, $q) {
        var _view = 'grid', _sideView = false, tabs = {};
        tabs._jobChain = {};
        tabs._jobChain.filter = {};
        tabs._jobChain.filter.state = 'ALL';
        tabs._jobChain.filter.sortBy = 'name';
        tabs._jobChain.reverse = false;
        tabs._jobChain.pageSize = '10';
        tabs._jobChain.currentPage = '1';
        tabs._jobChain.expand_to = [];
        tabs._jobChain.selectedView = '';

        tabs._job = {};
        tabs._job.filter = {};
        tabs._job.filter.state = 'ALL';
        tabs._job.filter.sortBy = 'name';
        tabs._job.reverse = false;
        tabs._job.pageSize = '10';
        tabs._job.currentPage = '1';
        tabs._job.expand_to = [];
        tabs._job.selectedView = '';

        tabs._dashboard = {};
        tabs._dashboard.filter = {};
        tabs._dashboard.filter.range = "today";
        tabs._dashboard.filter.orderRange = "today";
        tabs._dashboard.filter.orderSummaryfrom = "today";
        tabs._dashboard.filter.orderSummaryto = "today";
        tabs._dashboard.filter.orderRange = "today";
        tabs._dashboard.filter.label = 'button.today';

        tabs._daliyPlan = {};
        tabs._daliyPlan.filter = {};
        tabs._daliyPlan.filter.status = 'ALL';
        tabs._daliyPlan.filter.sortBy = 'processedPlan';
        tabs._daliyPlan.filter.range = "today";
        tabs._daliyPlan.range = 'period';
        tabs._daliyPlan.reverse = false;
        tabs._daliyPlan.pageSize = '10';
        tabs._daliyPlan.currentPage = '1';
        tabs._daliyPlan.selectedView = '';

        tabs._order = {};
        tabs._order.filter = {};
        tabs._order.filter.state = 'ALL';
        tabs._order.filter.sortBy = 'orderId';
        tabs._order.reverse = false;
        tabs._order.pageSize = '10';
        tabs._order.currentPage = '1';
        tabs._order.expand_to = [];
        tabs._order.selectedView = '';

        tabs._order1 = {};
        tabs._order1.filter = {};
        tabs._order1.filter.sortBy = 'orderId';
        tabs._order1.reverse = false;
        tabs._order1.pageSize = '10';

        tabs._orderDetail = {};
        tabs._orderDetail.overview = true;
        tabs._orderDetail.filter = {};
        tabs._orderDetail.filter.sortBy = 'orderId';
        tabs._orderDetail.reverse = false;
        tabs._orderDetail.pageSize = '10';
        tabs._orderDetail.currentPage = '1';
        tabs._orderDetail.pageView = 'list';
        tabs._orderDetail.showErrorNodes = true;
        tabs._orderDetail.fitToScreen = false;

        tabs._history = {};
        tabs._history.order = {};
        tabs._history.type = 'jobChain';
        tabs._history.order.filter = {};
        tabs._history.order.filter.state = 'all';
        tabs._history.order.filter.date = '-1h';
        tabs._history.order.filter.sortBy = 'startTime';
        tabs._history.order.filter.sortReverse = false;
        tabs._history.order.pageSize = '25';
        tabs._history.order.currentPage = '1';
        tabs._history.task = {};
        tabs._history.task.filter = {};
        tabs._history.task.filter.state = 'all';
        tabs._history.task.filter.date = '-1h';
        tabs._history.task.filter.sortBy = 'startTime';
        tabs._history.task.filter.sortReverse = false;
        tabs._history.task.pageSize = '25';
        tabs._history.task.currentPage = '1';


        tabs._resource = {};
        tabs._resource.agents = {};
        tabs._resource.agents.filter = {};
        tabs._resource.agents.filter.state = 'all';
        tabs._resource.agents.filter.sortBy = 'name';
        tabs._resource.agents.filter.reverse = false;
        tabs._resource.agents.pageSize = '25';
        tabs._resource.agents.currentPage = '1';
        tabs._resource.locks = {};
        tabs._resource.locks.filter = {};
        tabs._resource.locks.filter.state = 'all';
        tabs._resource.locks.filter.sortBy = 'name';
        tabs._resource.locks.filter.reverse = false;
        tabs._resource.locks.pageSize = '25';
        tabs._resource.locks.currentPage = '1';
        tabs._resource.locks.selectedView = '';
        tabs._resource.processClasses = {};
        tabs._resource.processClasses.filter = {};
        tabs._resource.processClasses.filter.state = 'all';
        tabs._resource.processClasses.filter.sortBy = 'name';
        tabs._resource.processClasses.filter.reverse = false;
        tabs._resource.processClasses.pageSize = '25';
        tabs._resource.processClasses.currentPage = '1';
        tabs._resource.processClasses.selectedView = '';
        tabs._resource.schedules = {};
        tabs._resource.schedules.filter = {};
        tabs._resource.schedules.filter.state = 'all';
        tabs._resource.schedules.filter.sortBy = 'name';
        tabs._resource.schedules.filter.reverse = false;
        tabs._resource.schedules.pageSize = '25';
        tabs._resource.schedules.currentPage = '1';
        tabs._resource.schedules.selectedView = '';
        tabs._resource.state = 'agent';


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
            getJobTab: function () {
                return tabs._job;
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
                return tabs._dashboard;
            },

            getResourceTab: function () {
                return tabs._resource;
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

        var props = ['jobChainFilters', 'orderFilters', 'jobFilters', 'historyFilters', 'ignoreList', 'dailyPlanFilters'];

        var propsPrefix = '$SOS$';

        function SavedFilter() {
            var self = this;
            props.forEach(function (name) {
                self[name] = load(name);
            });

        }

        SavedFilter.prototype.save = function () {
            var self = this;
            var storage = $window.localStorage;

            props.forEach(function (name) {

                save(storage, name, self[name]);
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

        SavedFilter.prototype.setIgnoreList = function (list) {
            this.ignoreList = JSON.stringify(list);
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
            var key = propsPrefix + name;
            if (value == null) value = '';
            storage[key] = value;
        }

        function load(name) {
            var key = propsPrefix + name;

            return $window.localStorage[key] || null;
        }
    }

})();
