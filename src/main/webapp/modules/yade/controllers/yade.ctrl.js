/**
 * Created by sourabhagrawal on 24/10/17.
 */
(function () {
    'use strict';
    angular
        .module('app')
        .controller('YadeCtrl', YadeCtrl);

    YadeCtrl.$inject = ["$scope","CoreService","YadeService","UserService"];
    function YadeCtrl($scope,CoreService,YadeService,UserService) {
        var vm = $scope;
        vm.maxEntryPerPage = vm.userPreferences.maxEntryPerPage;
        vm.yadeView = {};
        vm.yadeView.current = vm.userPreferences.historyView == 'current';
        vm.yadeFilters = CoreService.getYadeTab();
        vm.yadeSearch ={};

       
        function setDateRange(filter) {

            if (vm.yadeFilters.filter.date == 'all') {

            } else if (vm.yadeFilters.filter.date == 'today') {
                filter.dateFrom = '0d';
                filter.dateTo = '0d';
            } else {
                filter.dateFrom = vm.yadeFilters.filter.date;
            }
            return filter;
        }


        vm.load = function () {
            var obj = {};
            obj.jobschedulerId = vm.yadeView.current == true ? vm.schedulerIds.selected : '';
            obj.limit = parseInt(vm.userPreferences.maxRecords);
            obj = setDateRange(obj);
            obj.timeZone = vm.userPreferences.zone;
            if ((obj.dateFrom && typeof obj.dateFrom.getMonth === 'function') || (obj.dateTo && typeof obj.dateTo.getMonth === 'function')) {
                delete obj['timeZone']
            }
            YadeService.getTransfers(obj).then(function (res) {
                vm.yadeHistorys = res.transfers;
                vm.isLoading = true;
            }, function () {
                vm.isLoading = true;
            });
        };
        vm.load();        

       
        var loadConfig = true;
         function getYadeCustomizations() {
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.account = vm.permission.user;
            obj.configurationType = "CUSTOMIZATION";
            obj.objectType = "LOCK";
            UserService.configurations(obj).then(function (res) {
                if (vm.yadeHistoryFilterList && vm.yadeHistoryFilterList.length > 0) {
                    if (res.configurations && res.configurations.length > 0) {
                        vm.yadeHistoryFilterList = vm.yadeHistoryFilterList.concat(res.configurations);
                    }
                    var data = [];

                    for (var i = 0; i < vm.yadeHistoryFilterList.length; i++) {
                        var flag = true;
                        for (var j = 0; j < data.length; j++) {
                            if (data[j].account == vm.yadeHistoryFilterList[i].account && data[j].name == vm.yadeHistoryFilterList[i].name) {
                                flag = false;
                            }
                        }
                        if (flag) {
                            data.push(vm.yadeHistoryFilterList[i]);
                        }
                    }
                    vm.yadeHistoryFilterList = data;
                } else {
                    vm.yadeHistoryFilterList = res.configurations;
                }

                if (vm.savedYadeHistoryFilter.selected) {
                    var flag = true;
                    angular.forEach(vm.yadeHistoryFilterList, function (value) {
                        if (value.id == vm.savedYadeHistoryFilter.selected) {
                            flag = false;
                            UserService.configuration({
                                jobschedulerId: value.jobschedulerId,
                                id: value.id
                            }).then(function (conf) {
                                loadConfig = true;
                                vm.selectedFiltered3 = JSON.parse(conf.configuration.configurationItem);
                                vm.selectedFiltered3.account = value.account;
                                vm.init();
                            });
                        }
                    });
                    if (flag) {
                        vm.savedYadeHistoryFilter.selected = undefined;
                        loadConfig = true;
                        vm.init();
                    }
                } else {
                    loadConfig = true;
                    vm.savedYadeHistoryFilter.selected = undefined;
                    vm.init();
                }

            }, function (err) {
                loadConfig = true;
                vm.savedYadeHistoryFilter.selected = undefined;
                vm.init();
            });
        }

    }

})();
