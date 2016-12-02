/**
 * Created by sourabhagrawal on 20/06/16.
 */

(function () {
    'use strict';
    angular.module('app')
        .service('CoreService', CoreService)
        .service('SavedFilter', SavedFilter);

    CoreService.$inject = ['$window'];
    function CoreService($window) {
        var _view = 'grid', _sideView = false, tabs ={};
        tabs._jobChain ={};
        tabs._jobChain.filter = {};
        tabs._jobChain.filter.state = 'ALL';
        tabs._jobChain.filter.sortBy = 'name';
        tabs._jobChain.reverse = false;
        tabs._jobChain.pageSize = '10';
        tabs._jobChain.currentPage = '1';
        tabs._jobChain.expand_to = {};
        tabs._jobChain.selectedView = '';

        tabs._job ={};
        tabs._job.filter = {};
        tabs._job.filter.state = 'ALL';
        tabs._job.filter.sortBy = 'name';
        tabs._job.reverse = false;
        tabs._job.pageSize = '10';
        tabs._job.currentPage = '1';
        tabs._job.expand_to = {};
        tabs._job.selectedView = '';

        tabs._order ={};
        tabs._order.filter = {};
        tabs._order.filter.state = 'ALL';
        tabs._order.filter.sortBy = 'orderId';
        tabs._order.reverse = false;
        tabs._order.pageSize = '10';
        tabs._order.currentPage = '1';
        tabs._order.expand_to = {};
        tabs._order.selectedView = '';

        tabs._history ={};
        tabs._history.order ={};
        tabs._history.type = 'jobChain';
        tabs._history.order.filter = {};
        tabs._history.order.filter.state = 'all';
        tabs._history.order.filter.date = '1h';
        tabs._history.order.filter.sortBy = 'startTime';
        tabs._history.order.sortReverse = false;
        tabs._history.order.pageSize = '25';
        tabs._history.order.currentPage = '1';
        tabs._history.task ={};
        tabs._history.task.filter ={};
        tabs._history.task.filter.state = 'all';
        tabs._history.task.filter.date = '1h';
        tabs._history.task.filter.sortBy = 'startTime';
        tabs._history.task.sortReverse = false;
        tabs._history.task.pageSize = '25';
        tabs._history.task.currentPage = '1';


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
            getJobtab: function () {
                return tabs._job;
            },
            setJobTab: function (job) {
                tabs._job = job;
            },
            getJobChainTab: function () {
                return tabs._jobChain;
            },
            setJobChainTab: function (jobChain) {
                tabs._jobChain = jobChain;
            },
            getOrderTab: function () {
                return tabs._order;
            },
            setOrderTab: function (order) {
                tabs._order = order;
            },
            getHistoryTab: function () {
                return tabs._history;
            },
            setHistoryTab: function (history) {
                tabs._history = history;
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
