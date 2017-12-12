/**
 * Created by sourabhagrawal on 24/10/17.
 */
(function () {
    'use strict';
    angular
        .module('app')
        .controller('YadeCtrl', YadeCtrl);

    YadeCtrl.$inject = ["$scope","CoreService","YadeService","UserService","SavedFilter","$uibModal"];
    function YadeCtrl($scope,CoreService,YadeService,UserService,SavedFilter,$uibModal) {
        var vm = $scope;
        vm.maxEntryPerPage = vm.userPreferences.maxEntryPerPage;
        vm.yadeView = {};
        vm.yadeView.current = vm.userPreferences.fileTrasfer == 'current';
        vm.yadeFilters = CoreService.getYadeTab();
        vm.yadeSearch = {};
        vm.selectedFiltered;
        vm.temp_filter = {};
        vm.object = {};
        vm.object.files = [];
        vm.object.fileTransfers = [];

        vm.showFiles = vm.userPreferences.showFiles;

        vm.savedYadeFilter = JSON.parse(SavedFilter.yadeFilters) || {};
        vm.jobFilterList = [];


        if (vm.yadeFilters.selectedView) {
            vm.savedYadeFilter.selected = vm.savedYadeFilter.selected || vm.savedYadeFilter.favorite;
        }
        else {
            vm.savedYadeFilter.selected = undefined;
        }
        vm.changeJobScheduler = function () {
            vm.load();
        };
        vm.checkAllFileTransfers = {
            checkbox: false
        };
        vm.checkAllFiles = {
            checkbox: false
        };
        vm.checkAllFileTransfersFnc = function () {
            if (vm.checkAllFileTransfers.checkbox && vm.fileTransfers.length > 0) {
                vm.object.fileTransfers = vm.fileTransfers.slice((vm.userPreferences.entryPerPage * (vm.yadeFilters.currentPage - 1)), (vm.userPreferences.entryPerPage * vm.yadeFilters.currentPage));
            } else {
                vm.object.fileTransfers = [];
            }
        };
        var watcher1 = $scope.$watchCollection('object.fileTransfers', function (newNames) {
            if (newNames && newNames.length > 0) {
                vm.checkAllFileTransfers.checkbox = newNames.length == vm.fileTransfers.slice((vm.userPreferences.entryPerPage * (vm.yadeFilters.currentPage - 1)), (vm.userPreferences.entryPerPage * vm.yadeFilters.currentPage)).length;
            } else {
                vm.checkAllFileTransfers.checkbox = false;
            }
        });
        vm.checkAllFilesFnc = function (transfer) {
            if (vm.checkAllFiles.checkbox && transfer.files.length > 0) {
                vm.object.fileTransfers = transfer.files;
            } else {
                vm.object.fileTransfers = [];
            }
        };
        var watcher2 = $scope.$watchCollection('object.files', function (newNames) {
            if (newNames && newNames.length > 0) {
                vm.checkAllFiles.checkbox = newNames.length == vm.files.length;
            } else {
                vm.checkAllFiles.checkbox = false;
            }
        });

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

        function isCustomizationSelected(flag) {
            if (flag) {
                vm.temp_filter.states = angular.copy(vm.yadeFilters.filter.states);
                vm.temp_filter.date = angular.copy(vm.yadeFilters.filter.date);
                vm.yadeFilters.filter.states = '';
                vm.yadeFilters.filter.date = '';
            } else {
                if (vm.temp_filter.states) {
                    vm.yadeFilters.filter.states = angular.copy(vm.temp_filter.states);
                    vm.yadeFilters.filter.date = angular.copy(vm.temp_filter.date);
                } else {
                    vm.yadeFilters.filter.states = 'ALL';
                    vm.yadeFilters.filter.date = 'ALL';
                }
            }
        }

        function parseProcessExecuted(regex, obj) {
            var fromDate, toDate, date, arr;

            if (/^\s*(-)\s*(\d+)(h|d|w|M|y)\s*$/.test(regex)) {
                fromDate = /^\s*(-)\s*(\d+)(h|d|w|M|y)\s*$/.exec(regex)[0];

            } else if (/^\s*(now\s*\-)\s*(\d+)\s*$/i.test(regex)) {
                fromDate = new Date();
                toDate = new Date();
                var seconds = parseInt(/^\s*(now\s*\-)\s*(\d+)\s*$/i.exec(regex)[2]);
                fromDate.setSeconds(toDate.getSeconds() - seconds);
            } else if (/^\s*(Today)\s*$/i.test(regex)) {
                fromDate = '0d';
                toDate = '0d';
            } else if (/^\s*(Yesterday)\s*$/i.test(regex)) {
                fromDate = '-1d';
                toDate = '0d';
            } else if (/^\s*(now)\s*$/i.test(regex)) {
                fromDate = new Date();
                toDate = new Date();
            } else if (/^\s*(-)(\d+)(h|d|w|M|y)\s*to\s*(-)(\d+)(h|d|w|M|y)\s*$/.test(regex)) {
                date = /^\s*(-)(\d+)(h|d|w|M|y)\s*to\s*(-)(\d+)(h|d|w|M|y)\s*$/.exec(regex);
                arr = date[0].split('to');
                fromDate = arr[0].trim();
                toDate = arr[1].trim();

            } else if (/^\s*(-)(\d+)(h|d|w|M|y)\s*to\s*(-)(\d+)(h|d|w|M|y)\s*[-,+](\d+)(h|d|w|M|y)\s*$/.test(regex)) {
                date = /^\s*(-)(\d+)(h|d|w|M|y)\s*to\s*(-)(\d+)(h|d|w|M|y)\s*[-,+](\d+)(h|d|w|M|y)\s*$/.exec(regex);
                arr = date[0].split('to');
                fromDate = arr[0].trim();
                toDate = arr[1].trim();

            } else if (/^\s*(-)(\d+)(h|d|w|M|y)\s*[-,+](\d+)(h|d|w|M|y)\s*to\s*(-)(\d+)(h|d|w|M|y)\s*$/.test(regex)) {
                date = /^\s*(-)(\d+)(h|d|w|M|y)\s*[-,+](\d+)(h|d|w|M|y)\s*to\s*(-)(\d+)(h|d|w|M|y)\s*$/.exec(regex);
                arr = date[0].split('to');
                fromDate = arr[0].trim();
                toDate = arr[1].trim();

            } else if (/^\s*(-)(\d+)(h|d|w|M|y)\s*[-,+](\d+)(h|d|w|M|y)\s*to\s*(-)(\d+)(h|d|w|M|y)\s*[-,+](\d+)(h|d|w|M|y)\s*$/.test(regex)) {
                date = /^\s*(-)(\d+)(h|d|w|M|y)\s*[-,+](\d+)(h|d|w|M|y)\s*to\s*(-)(\d+)(h|d|w|M|y)\s*[-,+](\d+)(h|d|w|M|y)\s*$/.exec(regex);
                arr = date[0].split('to');
                fromDate = arr[0].trim();
                toDate = arr[1].trim();

            } else if (/^\s*(\d+):(\d+)\s*(am|pm)\s*to\s*(\d+):(\d+)\s*(am|pm)\s*$/i.test(regex)) {
                var time = /^\s*(\d+):(\d+)\s*(am|pm)\s*to\s*(\d+):(\d+)\s*(am|pm)\s*$/i.exec(regex);
                fromDate = new Date();
                if (/(pm)/i.test(time[3]) && parseInt(time[1]) != 12) {
                    fromDate.setHours(parseInt(time[1]) - 12);
                } else {
                    fromDate.setHours(parseInt(time[1]));
                }

                fromDate.setMinutes(parseInt(time[2]));
                toDate = new Date();
                if (/(pm)/i.test(time[6]) && parseInt(time[4]) != 12) {
                    toDate.setHours(parseInt(time[4]) - 12);
                } else {
                    toDate.setHours(parseInt(time[4]));
                }
                toDate.setMinutes(parseInt(time[5]));
            }

            if (fromDate) {
                obj.dateFrom = fromDate;
            }
            if (toDate) {
                obj.dateTo = toDate;
            }
            return obj;
        }

        vm.load = function () {
            if (!vm.yadeFileTransferFilterList) {
                checkSharedFilters();
                return;
            }
            if (vm.selectedFiltered) {
                isCustomizationSelected(true);
            }
            var obj = {};
            obj.jobschedulerId = vm.yadeView.current == true ? vm.schedulerIds.selected : '';

            if (vm.yadeFilters.filter.states && vm.yadeFilters.filter.states != 'all' && vm.yadeFilters.filter.states.length > 0) {
                obj.states = [];
                obj.states.push(vm.yadeFilters.filter.states);
            }
            //obj.compact = true;
            obj.limit = parseInt(vm.userPreferences.maxRecords);
            obj = setDateRange(obj);
            obj.timeZone = vm.userPreferences.zone;
            if ((obj.dateFrom && typeof obj.dateFrom.getMonth === 'function') || (obj.dateTo && typeof obj.dateTo.getMonth === 'function')) {
                delete obj['timeZone']
            }
            YadeService.getTransfers(obj).then(function (res) {
                vm.fileTransfers = res.transfers;
                vm.isLoading = true;
            }, function () {
                vm.isLoading = true;
            });
        };

        vm.loadYadeFiles = function () {
            vm.load();
        };

        vm.showTransferFuc = function (value) {
            /*            var obj = {};
             obj.jobschedulerId = vm.yadeView.current == true ? vm.schedulerIds.selected : '';
             YadeService.getTransfers(obj).then(function (res) {
             vm.fileTransfers = res.transfers;
             vm.isLoading = true;
             }, function () {
             vm.isLoading = true;
             });*/
            value.show = true;
            var ids = [];
            ids.push(value.id);
            YadeService.files({
                transferIds: ids,
                jobschedulerId: value.jobschedulerId || vm.schedulerIds.selected
            }).then(function (res) {
                value.files = res.files
            })
        };
        var isLoaded = true;
        vm.search = function (flag) {
            isLoaded = false;
            if (!flag)
                vm.loading = true;
            var filter = {
                jobschedulerId: vm.historyView.current == true ? vm.schedulerIds.selected : '',
                limit: parseInt(vm.userPreferences.maxRecords)
            };

            vm.yadeFilters.filter.states = '';
            vm.yadeFilters.filter.date = '';

            if (vm.yadeSearch.states && vm.yadeSearch.states.length > 0) {
                filter.states = vm.yadeSearch.states;
            }

            if (vm.yadeSearch.operations && vm.yadeSearch.operations.length > 0) {
                filter.operations = vm.yadeSearch.operations;
            }

            if (vm.yadeSearch.profileId) {
                filter.profiles = vm.yadeSearch.profileId;
            }

            if (vm.yadeSearch.mandator) {
                filter.mandator = vm.yadeSearch.mandator;
            }

            if (vm.yadeSearch.sourceHost) {
                filter.sources = vm.yadeSearch.sourceHost;
            }
            if (vm.yadeSearch.targetHost) {
                filter.targets = vm.yadeSearch.targetHost;
            }
            if (vm.yadeSearch.protocol) {
                filter.protocol = [];
                var s = vm.yadeSearch.protocol.replace(/,\s+/g, ',');
                var protocols = s.split(',');
                angular.forEach(protocols, function (value) {
                    filter.protocol.push(value)
                });

            }
            if (vm.yadeSearch.date == 'process') {
                filter = parseProcessExecuted(vm.yadeSearch.planned, filter);
            } else {
                if (vm.yadeSearch.date == 'date' && vm.yadeSearch.from) {
                    var fromDate = new Date(vm.yadeSearch.from);
                    if (vm.yadeSearch.fromTime) {
                        fromDate.setHours(moment(vm.yadeSearch.fromTime, 'HH:mm:ss').hours());
                        fromDate.setMinutes(moment(vm.yadeSearch.fromTime, 'HH:mm:ss').minutes());
                        fromDate.setSeconds(moment(vm.yadeSearch.fromTime, 'HH:mm:ss').seconds());
                    } else {
                        fromDate.setHours(0);
                        fromDate.setMinutes(0);
                        fromDate.setSeconds(0);
                    }
                    fromDate.setMilliseconds(0);
                    filter.dateFrom = fromDate;
                }
                if (vm.yadeSearch.date == 'date' && vm.yadeSearch.to) {
                    var toDate = new Date(vm.yadeSearch.to);
                    if (vm.yadeSearch.toTime) {
                        toDate.setHours(moment(vm.yadeSearch.toTime, 'HH:mm:ss').hours());
                        toDate.setMinutes(moment(vm.yadeSearch.toTime, 'HH:mm:ss').minutes());
                        toDate.setSeconds(moment(vm.yadeSearch.toTime, 'HH:mm:ss').seconds());
                    } else {
                        toDate.setHours(0);
                        toDate.setMinutes(0);
                        toDate.setSeconds(0);
                    }
                    toDate.setMilliseconds(0);
                    filter.dateTo = toDate;
                }
            }

            if (vm.yadeSearch.jobschedulerId) {
                filter.jobschedulerId = vm.yadeSearch.jobschedulerId;
            }

            filter.timeZone = vm.userPreferences.zone;
            if ((filter.dateFrom && typeof filter.dateFrom.getMonth === 'function') || (filter.dateTo && typeof filter.dateTo.getMonth === 'function')) {
                delete filter['timeZone']
            }
            YadeService.getTransfers(filter).then(function (res) {
                vm.fileTransfers = res.transfers;
                vm.loading = false;
                isLoaded = true;
            }, function () {
                vm.loading = false;
                isLoaded = true;
            });
            vm.yadeSearch = true;

        };
        vm.advancedSearch = function () {
            vm.isUnique = true;
            vm.showSearchPanel = true;
            vm.yadeSearch.date = 'date';
            vm.yadeSearch.from = new Date();
            vm.yadeSearch.from.setDate(vm.yadeSearch.from.getDate() - 1);
            vm.yadeSearch.fromTime = '00:00';
            vm.yadeSearch.to = new Date();
            vm.yadeSearch.toTime = '00:00';
        };
        vm.cancel = function (form) {
            vm.yadeSearch = {};
            vm.showSearchPanel = false;
            if (form)
                form.$setPristine();
            vm.load();
        };
        var loadConfig = true;

        function checkSharedFilters() {
            if (vm.permission.JOCConfigurations.share.view) {
                var obj = {};
                obj.jobschedulerId = vm.schedulerIds.selected;
                obj.configurationType = "CUSTOMIZATION";
                obj.objectType = "YADE";
                obj.shared = true;
                UserService.configurations(obj).then(function (res) {
                    if (res.configurations && res.configurations.length > 0)
                        vm.yadeFileTransferFilterList = res.configurations;
                    getYadeCustomizations();
                }, function () {
                    vm.yadeFileTransferFilterList = [];
                    getYadeCustomizations();
                });
            } else {
                vm.yadeFileTransferFilterList = [];
                getYadeCustomizations();
            }
        }

        checkSharedFilters();
        function getYadeCustomizations() {
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.account = vm.permission.user;
            obj.configurationType = "CUSTOMIZATION";
            obj.objectType = "YADE";
            UserService.configurations(obj).then(function (res) {
                console.log(res)
                if (vm.yadeFileTransferFilterList && vm.yadeFileTransferFilterList.length > 0) {
                    if (res.configurations && res.configurations.length > 0) {
                        vm.yadeFileTransferFilterList = vm.yadeFileTransferFilterList.concat(res.configurations);
                    }
                    var data = [];

                    for (var i = 0; i < vm.yadeFileTransferFilterList.length; i++) {
                        var flag = true;
                        for (var j = 0; j < data.length; j++) {
                            if (data[j].account == vm.yadeFileTransferFilterList[i].account && data[j].name == vm.yadeFileTransferFilterList[i].name) {
                                flag = false;
                            }
                        }
                        if (flag) {
                            data.push(vm.yadeFileTransferFilterList[i]);
                        }
                    }
                    vm.yadeFileTransferFilterList = data;
                } else {
                    vm.yadeFileTransferFilterList = res.configurations;
                }

                if (vm.savedYadeFilter.selected) {
                    var flag = true;
                    angular.forEach(vm.yadeFileTransferFilterList, function (value) {
                        if (value.id == vm.savedYadeFilter.selected) {
                            flag = false;
                            UserService.configuration({
                                jobschedulerId: value.jobschedulerId,
                                id: value.id
                            }).then(function (conf) {
                                loadConfig = true;
                                vm.selectedFiltered = JSON.parse(conf.configuration.configurationItem);
                                vm.selectedFiltered.account = value.account;
                                vm.load();
                            });
                        }
                    });
                    if (flag) {
                        vm.savedYadeFilter.selected = undefined;
                        loadConfig = true;
                        vm.load();
                    }
                } else {
                    loadConfig = true;
                    vm.savedYadeFilter.selected = undefined;
                    vm.load();
                }

            }, function (err) {
                loadConfig = true;
                vm.savedYadeFilter.selected = undefined;
                vm.load();
            });
        }

        vm.saveAsFilter = function (form) {
            var configObj = {};
            configObj.jobschedulerId = vm.schedulerIds.selected;
            configObj.account = vm.permission.user;
            configObj.configurationType = "CUSTOMIZATION";
            var fromDate;
            var obj = {};

            configObj.name = vm.yadeSearch.name;
            obj.profileId = vm.yadeSearch.profileId;
            obj.mandator = vm.yadeSearch.mandator;
            obj.state = vm.yadeSearch.states;
            obj.operations = vm.yadeSearch.operations;
            obj.protocol = vm.yadeSearch.protocol;
            obj.name = vm.yadeSearch.name;
            obj.sourceFileName = vm.yadeSearch.sourceFileName;
            obj.targetFileName = vm.yadeSearch.targetFileName;
            obj.sourceHost = vm.yadeSearch.sourceHost;
            obj.targetHost = vm.yadeSearch.targetHost;

            configObj.id = 0;

            configObj.objectType = "YADE";

            configObj.configurationItem = JSON.stringify(obj);
            UserService.saveConfiguration(configObj).then(function (res) {
                configObj.id = res.id;
                vm.yadeSearch.name = '';
                if (form)
                    form.$setPristine();
                vm.yadeHistoryFilterList.push(configObj);

            });
        };

        vm.advanceFilter = function () {
            vm.cancel();
            vm.action = 'add';
            vm.historyFilter = {};
            vm.historyFilter.planned = 'today';
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/yade-filter-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                size: 'lg',
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                var configObj = {};
                configObj.jobschedulerId = vm.schedulerIds.selected;
                configObj.account = vm.permission.user;
                configObj.configurationType = "CUSTOMIZATION";
                configObj.name = vm.historyFilter.name;
                configObj.shared = vm.historyFilter.shared;
                configObj.id = 0;
                configObj.configurationItem = JSON.stringify(vm.historyFilter);
                configObj.objectType = "YADE";

                UserService.saveConfiguration(configObj).then(function (res) {
                    configObj.id = res.id;
                    vm.yadeHistoryFilterList.push(configObj);
                    if (vm.historyFilters.type == 'yade') {

                        if (vm.yadeHistoryFilterList.length == 1) {
                            vm.savedHistoryFilter.selected = res.id;
                            vm.historyFilters.yade.selectedView = true;
                            vm.selectedFiltered3 = vm.historyFilter;
                            vm.selectedFiltered3.account = vm.permission.user;
                            vm.init();
                            isCustomizationSelected3(true);
                        }
                        vm.historyFilterObj.yade = vm.savedHistoryFilter;
                    }
                    SavedFilter.setHistory(vm.historyFilterObj);
                    SavedFilter.save();
                });

            }, function () {
            });
        };

        vm.editFilters = function () {
            vm.filters = {};
            if (vm.historyFilters.type == 'jobChain') {
                vm.filters.list = vm.orderHistoryFilterList;
                vm.filters.favorite = vm.savedHistoryFilter.favorite;
            } else if (vm.historyFilters.type == 'job') {
                vm.filters.list = vm.jobHistoryFilterList;
                vm.filters.favorite = vm.savedJobHistoryFilter.favorite;
            } else {
                vm.filters.list = vm.yadeHistoryFilterList;
                vm.filters.favorite = vm.savedYadeHistoryFilter.favorite;
            }

            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/edit-filter-dialog.html',
                controller: 'DialogCtrl',
                scope: vm
            });
        };
        var temp_name = '';

        vm.editFilter = function (filter) {
            vm.cancel();
            vm.action = 'edit';
            vm.isUnique = true;
            temp_name = angular.copy(filter.name);
            UserService.configuration({jobschedulerId: filter.jobschedulerId, id: filter.id}).then(function (conf) {
                vm.historyFilter = JSON.parse(conf.configuration.configurationItem);
                vm.historyFilter.shared = filter.shared;
            });


            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/yade-filter-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                size: 'lg',
                backdrop: 'static'
            });
            modalInstance.result.then(function () {

                if (vm.historyFilters.type == 'yade') {
                    if (vm.savedHistoryFilter.selected == filter.id) {
                        vm.selectedFiltered3 = vm.historyFilter;
                        vm.historyFilters.yade.selectedView = true;
                        vm.init();
                        isCustomizationSelected3(true);
                    }
                    vm.historyFilterObj.yade = vm.savedHistoryFilter;

                }
                var configObj = {};
                configObj.jobschedulerId = filter.jobschedulerId;
                configObj.account = filter.account;
                configObj.configurationType = filter.configurationType;
                configObj.objectType = filter.objectType;
                configObj.id = filter.id;
                configObj.configurationItem = JSON.stringify(vm.historyFilter);
                configObj.name = vm.historyFilter.name;
                configObj.shared = vm.historyFilter.shared;
                UserService.saveConfiguration(configObj);
                filter.name = vm.historyFilter.name;
                temp_name = '';
            }, function () {
                temp_name = '';
            });
        };

        vm.copyFilter = function (filter) {
            vm.action = 'copy';
            vm.isUnique = true;
            UserService.configuration({jobschedulerId: filter.jobschedulerId, id: filter.id}).then(function (conf) {
                vm.historyFilter = JSON.parse(conf.configuration.configurationItem);
                vm.historyFilter.shared = filter.shared;

                if (vm.historyFilters.type == 'yade') {
                    vm.historyFilter.name = vm.checkCopyName(vm.yadeHistoryFilterList, filter.name);
                }
            });

            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/yade-filter-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                size: 'lg',
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                var configObj = {};
                configObj.jobschedulerId = filter.jobschedulerId;
                configObj.account = vm.permission.user;
                configObj.configurationType = "CUSTOMIZATION";
                configObj.name = vm.historyFilter.name;
                configObj.shared = vm.historyFilter.shared;
                configObj.objectType = filter.objectType;
                configObj.id = 0;
                configObj.configurationItem = JSON.stringify(vm.historyFilter);
                UserService.saveConfiguration(configObj).then(function (res) {
                    configObj.id = res.id;
                    if (vm.historyFilters.type == 'yade') {
                        vm.yadeHistoryFilterList.push(configObj);
                    }
                });
            }, function () {
            });
        };
        vm.deleteFilter = function (filter) {

            UserService.deleteConfiguration({
                jobschedulerId: filter.jobschedulerId,
                id: filter.id
            }).then(function (res) {

                angular.forEach(vm.yadeHistoryFilterList, function (value, index) {
                    if (value.id == filter.id) {
                        vm.yadeHistoryFilterList.splice(index, 1);
                    }
                });

                if (vm.savedYadeHistoryFilter.selected == filter.id) {
                    vm.savedYadeHistoryFilter.selected = undefined;
                    vm.historyFilters.yade.selectedView = false;
                    vm.selectedFiltered3 = undefined;
                    vm.init();
                    isCustomizationSelected3(false);
                } else {
                    if (vm.yadeHistoryFilterList.length == 0) {
                        vm.savedYadeHistoryFilter.selected = undefined;
                        vm.historyFilters.yade.selectedView = false;
                        vm.selectedFiltered3 = undefined;
                        isCustomizationSelected3(false);
                    }
                }
                vm.historyFilterObj.yade = vm.savedYadeHistoryFilter;

                SavedFilter.setHistory(vm.historyFilterObj);
                SavedFilter.save();
            });
        };

        vm.makePrivate = function (configObj) {

            UserService.privateConfiguration({
                jobschedulerId: configObj.jobschedulerId,
                id: configObj.id
            }).then(function (res) {
                configObj.shared = false;
                if (vm.permission.user != configObj.account) {

                    angular.forEach(vm.yadeHistoryFilterList, function (value, index) {
                        if (value.id == configObj.id) {
                            vm.yadeHistoryFilterList.splice(index, 1);
                        }
                    });

                }
            });
        };

        vm.makeShare = function (configObj) {
            UserService.shareConfiguration({
                jobschedulerId: configObj.jobschedulerId,
                id: configObj.id
            }).then(function (res) {
                configObj.shared = true;
            });
        };

        vm.favorite = function (filter) {
            vm.filters.favorite = filter.id;

            vm.savedYadeHistoryFilter.favorite = filter.id;
            vm.historyFilters.yade.selectedView = true;
            vm.historyFilterObj.yade = vm.savedYadeHistoryFilter;

            SavedFilter.setHistory(vm.historyFilterObj);
            SavedFilter.save();
            vm.init();
        };

        vm.removeFavorite = function () {
            vm.savedYadeHistoryFilter.favorite = '';
            vm.historyFilterObj.yade = vm.savedYadeHistoryFilter;

            vm.filters.favorite = '';
            SavedFilter.setHistory(vm.historyFilterObj);
            SavedFilter.save();
        };
        vm.checkFilterName = function () {
            vm.isUnique = true;


            if (vm.yadeSearch && vm.yadeSearch.name) {
                angular.forEach(vm.yadeHistoryFilterList, function (value) {
                    if (vm.yadeSearch.name == value.name && vm.permission.user == value.account) {
                        vm.isUnique = false;
                    }
                });
            } else if (vm.historyFilter) {
                angular.forEach(vm.yadeHistoryFilterList, function (value) {
                    if (vm.historyFilter.name == value.name && vm.permission.user == value.account && vm.historyFilter.name != temp_name) {
                        vm.isUnique = false;
                    }
                });
            }

        };

        vm.changeFilter = function (filter) {
            vm.cancel();

            if (filter) {
                vm.savedYadeHistoryFilter.selected = filter.id;
                vm.historyFilters.yade.selectedView = true;
                UserService.configuration({
                    jobschedulerId: filter.jobschedulerId,
                    id: filter.id
                }).then(function (conf) {
                    vm.selectedFiltered3 = JSON.parse(conf.configuration.configurationItem);
                    vm.selectedFiltered3.account = filter.account;
                    vm.init();
                });
            }
            else {
                isCustomizationSelected(false);
                vm.savedYadeHistoryFilter.selected = filter;
                vm.historyFilters.yade.selectedView = false;
                vm.selectedFiltered3 = filter;
                vm.init();
            }

            vm.historyFilterObj.yade = vm.savedYadeHistoryFilter;


            SavedFilter.setHistory(vm.historyFilterObj);
            SavedFilter.save();
        };

        vm.expandDetails = function () {
            vm.isExpand = true;
           // var a = vm.fileTransfers.slice((vm.userPreferences.entryPerPage * (vm.yadeFilters.currentPage - 1)), (vm.userPreferences.entryPerPage * vm.yadeFilters.currentPage)).length;
           // var selecetedHistory = angular.copy(vm.fileTransfers.slice((vm.userPreferences.entryPerPage * (vm.yadeFilters.currentPage - 1)), (vm.userPreferences.entryPerPage * vm.yadeFilters.currentPage)));
            var ids = [];
            angular.forEach(vm.fileTransfers, function (value) {
                ids.push(value.id);
            });
            YadeService.files({transferIds: ids, jobschedulerId: vm.schedulerIds.selected}).then(function (res) {
                angular.forEach(vm.fileTransfers, function (value) {
                    value.show = true;
                    value.files = [];
                    for (var i = 0; i < res.files.length; i++) {
                        if (value.id == res.files[i].transferId) {
                            value.files.push(res.files[i]);
                        }
                    }
                });
            })
        };

        vm.collapseDetails = function () {
            vm.isExpand = false;
            angular.forEach(vm.fileTransfers, function (value) {
                value.show = false;
            });
        };

        $scope.$on('$destroy', function () {
            watcher1();
            watcher2();
        });
    }

})();
