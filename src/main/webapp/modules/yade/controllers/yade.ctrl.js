/**
 * Created by sourabhagrawal on 24/10/17.
 */
(function () {
    'use strict';
    angular
        .module('app')
        .controller('YadeCtrl', YadeCtrl);

    YadeCtrl.$inject = ["$scope","CoreService","YadeService","UserService","SavedFilter","$uibModal","$location","OrderService"];
    function YadeCtrl($scope,CoreService,YadeService,UserService,SavedFilter,$uibModal,$location,OrderService) {
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
        vm.yadeFilterList = [];

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
                vm.object.fileTransfers = [];
                var data = vm.fileTransfers.slice((vm.userPreferences.entryPerPage * (vm.yadeFilters.currentPage - 1)), (vm.userPreferences.entryPerPage * vm.yadeFilters.currentPage));
                angular.forEach(data, function(value){
                    if(value.state._text=='FAILED')
                        vm.object.fileTransfers.push(value)
                });

            } else {
                vm.object.fileTransfers = [];
            }
            if(vm.object.fileTransfers.length==0 && vm.checkAllFileTransfers.checkbox){
                vm.checkAllFileTransfers.checkbox = false;
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
                vm.object.files = transfer.files;
            } else {
                vm.object.files = [];
            }
/*            if(vm.object.fileTransfers.length ==0){
                vm.object.fileTransfers.push(transfer);
            }else {
                var flag = true;
                for (var i = 0; i < vm.object.fileTransfers.length; i++) {
                    if (transfer.id == vm.object.fileTransfers[i].id) {
                        flag = false;
                    }
                }
                if(flag){
                    vm.object.fileTransfers.push(transfer);
                }
            }*/
        };
        var watcher2 = $scope.$watchCollection('object.files', function (newNames) {
            if (newNames && newNames.length > 0) {
               // vm.checkAllFiles.checkbox = newNames.length == vm.files.length;
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
                    vm.yadeFilters.filter.states = 'all';
                    vm.yadeFilters.filter.date = 'today';
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
            if (!vm.yadeFilterList) {
                checkSharedFilters();
                return;
            }
            if (vm.selectedFiltered) {
                isCustomizationSelected(true);
            }
            var obj = {};
            obj.jobschedulerId = vm.yadeView.current == true ? vm.schedulerIds.selected : '';
            //obj.compact = true;

            if (vm.selectedFiltered) {
                if (vm.selectedFiltered.states && vm.selectedFiltered.states.length > 0) {
                    obj.states = vm.selectedFiltered.states;
                }

                if (vm.selectedFiltered.operations && vm.selectedFiltered.operations.length > 0) {
                    obj.operations = vm.selectedFiltered.operations;
                }

                if (vm.selectedFiltered.profileId) {
                    obj.profiles = vm.selectedFiltered.profileId.split(',');
                }

                if (vm.selectedFiltered.mandator) {
                    obj.mandator = vm.selectedFiltered.mandator;
                }

                if (vm.selectedFiltered.sourceHost) {
                    obj.sources = vm.selectedFiltered.sourceHost;
                }
                if (vm.selectedFiltered.targetHost) {
                    obj.targets = vm.selectedFiltered.targetHost;
                }
                if (vm.selectedFiltered.protocol) {
                    obj.protocol = [];
                    var s = vm.selectedFiltered.protocol.replace(/,\s+/g, ',');
                    var protocols = s.split(',');
                    angular.forEach(protocols, function (value) {
                        obj.protocol.push(value)
                    });

                }
                if (vm.selectedFiltered.date == 'process') {
                    obj = parseProcessExecuted(vm.selectedFiltered.planned, obj);
                } else {
                    if (vm.selectedFiltered.date == 'date' && vm.selectedFiltered.from) {
                        var fromDate = new Date(vm.selectedFiltered.from);
                        if (vm.selectedFiltered.fromTime) {
                            fromDate.setHours(moment(vm.selectedFiltered.fromTime, 'HH:mm:ss').hours());
                            fromDate.setMinutes(moment(vm.selectedFiltered.fromTime, 'HH:mm:ss').minutes());
                            fromDate.setSeconds(moment(vm.selectedFiltered.fromTime, 'HH:mm:ss').seconds());
                        } else {
                            fromDate.setHours(0);
                            fromDate.setMinutes(0);
                            fromDate.setSeconds(0);
                        }
                        fromDate.setMilliseconds(0);
                        obj.dateFrom = fromDate;
                    }
                    if (vm.selectedFiltered.date == 'date' && vm.selectedFiltered.to) {
                        var toDate = new Date(vm.selectedFiltered.to);
                        if (vm.selectedFiltered.toTime) {
                            toDate.setHours(moment(vm.selectedFiltered.toTime, 'HH:mm:ss').hours());
                            toDate.setMinutes(moment(vm.selectedFiltered.toTime, 'HH:mm:ss').minutes());
                            toDate.setSeconds(moment(vm.selectedFiltered.toTime, 'HH:mm:ss').seconds());
                        } else {
                            toDate.setHours(0);
                            toDate.setMinutes(0);
                            toDate.setSeconds(0);
                        }
                        toDate.setMilliseconds(0);
                        obj.dateTo = toDate;
                    }
                }
            }
            else {
                if (vm.yadeFilters.filter.states && vm.yadeFilters.filter.states != 'all') {
                    obj.states = [];
                    obj.states.push(vm.yadeFilters.filter.states);
                }
                obj = setDateRange(obj);
            }

            obj.timeZone = vm.userPreferences.zone;
            if ((obj.dateFrom && typeof obj.dateFrom.getMonth === 'function') || (obj.dateTo && typeof obj.dateTo.getMonth === 'function')) {
                delete obj['timeZone']
            }
            obj.limit = parseInt(vm.userPreferences.maxRecords);
            YadeService.getTransfers(obj).then(function (res) {
                vm.fileTransfers = res.transfers;
                vm.isLoading = true;
            }, function () {
                vm.isLoading = true;
            });
        };
        function getFileTransferById(transferId){
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.transferId = transferId;
            YadeService.getTransfers(obj).then(function (res) {
                vm.fileTransfers = res.transfers;
                vm.isLoading = true;
            }, function () {
                vm.isLoading = true;
            });
        }
        if ($location.search().scheduler_id && $location.search().id) {
            vm.checkSchedulerId();
            getFileTransferById($location.search().id);
        } else {
            checkSharedFilters();
        }

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
                filter.profiles = vm.yadeSearch.profileId.split(',');
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
                        vm.yadeFilterList = res.configurations;
                    getYadeCustomizations();
                }, function () {
                    vm.yadeFilterList = [];
                    getYadeCustomizations();
                });
            } else {
                vm.yadeFilterList = [];
                getYadeCustomizations();
            }
        }


        function getYadeCustomizations() {
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.account = vm.permission.user;
            obj.configurationType = "CUSTOMIZATION";
            obj.objectType = "YADE";
            UserService.configurations(obj).then(function (res) {
                if (vm.yadeFilterList && vm.yadeFilterList.length > 0) {
                    if (res.configurations && res.configurations.length > 0) {
                        vm.yadeFilterList = vm.yadeFilterList.concat(res.configurations);
                    }
                    var data = [];

                    for (var i = 0; i < vm.yadeFilterList.length; i++) {
                        var flag = true;
                        for (var j = 0; j < data.length; j++) {
                            if (data[j].account == vm.yadeFilterList[i].account && data[j].name == vm.yadeFilterList[i].name) {
                                flag = false;
                            }
                        }
                        if (flag) {
                            data.push(vm.yadeFilterList[i]);
                        }
                    }
                    vm.yadeFilterList = data;
                } else {
                    vm.yadeFilterList = res.configurations;
                }

                if (vm.savedYadeFilter.selected) {
                    var flag = true;
                    angular.forEach(vm.yadeFilterList, function (value) {
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
            configObj.objectType = "YADE";
            configObj.id = 0;
            configObj.name = vm.yadeSearch.name;
            configObj.configurationItem = JSON.stringify(vm.yadeSearch);

            UserService.saveConfiguration(configObj).then(function (res) {
                configObj.id = res.id;
                vm.yadeSearch.name = '';
                if (form)
                    form.$setPristine();
                vm.yadeFilterList.push(configObj);

            });
        };

        vm.advanceFilter = function () {
            vm.cancel();
            vm.action = 'add';
            vm.yadeFilter = {};
            vm.yadeFilter.planned = 'today';
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
                configObj.name = vm.yadeFilter.name;
                configObj.shared = vm.yadeFilter.shared;
                configObj.id = 0;
                configObj.configurationItem = JSON.stringify(vm.yadeFilter);
                configObj.objectType = "YADE";

                UserService.saveConfiguration(configObj).then(function (res) {
                    configObj.id = res.id;
                    vm.yadeFilterList.push(configObj);

                    if (vm.yadeFilterList.length == 1) {
                        vm.savedYadeFilter.selected = res.id;
                        vm.yadeFilters.selectedView = true;
                        vm.selectedFiltered = vm.yadeFilter;
                        vm.selectedFiltered.account = vm.permission.user;
                        isCustomizationSelected(true);
                        SavedFilter.setYade(vm.savedYadeFilter);
                        SavedFilter.save();
                        vm.load();
                    }
                });

            }, function () {
            });
        };

        vm.editFilters = function () {
            vm.filters = {};
            vm.filters.list = vm.yadeFilterList;
            vm.filters.favorite = vm.savedYadeFilter.favorite;

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
                vm.yadeFilter = JSON.parse(conf.configuration.configurationItem);
                vm.yadeFilter.shared = filter.shared;
            });


            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/yade-filter-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                size: 'lg',
                backdrop: 'static'
            });
            modalInstance.result.then(function () {

                if (vm.savedYadeFilter.selected == filter.id) {
                    vm.selectedFiltered = vm.yadeFilter;
                    vm.yadeFilters.selectedView = true;
                    isCustomizationSelected(true);
                    vm.load();
                }
                var configObj = {};
                configObj.jobschedulerId = filter.jobschedulerId;
                configObj.account = filter.account;
                configObj.configurationType = filter.configurationType;
                configObj.objectType = filter.objectType;
                configObj.id = filter.id;
                configObj.configurationItem = JSON.stringify(vm.yadeFilter);
                configObj.name = vm.yadeFilter.name;
                configObj.shared = vm.yadeFilter.shared;
                UserService.saveConfiguration(configObj);
                filter.name = vm.yadeFilter.name;
                temp_name = '';
            }, function () {
                temp_name = '';
            });
        };

        vm.copyFilter = function (filter) {
            vm.action = 'copy';
            vm.isUnique = true;
            UserService.configuration({jobschedulerId: filter.jobschedulerId, id: filter.id}).then(function (conf) {
                vm.yadeFilter = JSON.parse(conf.configuration.configurationItem);
                vm.yadeFilter.shared = filter.shared;
                vm.yadeFilter.name = vm.checkCopyName(vm.yadeFilterList, filter.name);
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
                configObj.name = vm.yadeFilter.name;
                configObj.shared = vm.yadeFilter.shared;
                configObj.objectType = filter.objectType;
                configObj.id = 0;
                configObj.configurationItem = JSON.stringify(vm.yadeFilter);
                UserService.saveConfiguration(configObj).then(function (res) {
                    configObj.id = res.id;
                    vm.yadeFilterList.push(configObj);
                });
            }, function () {
            });
        };
        vm.deleteFilter = function (filter) {

            UserService.deleteConfiguration({
                jobschedulerId: filter.jobschedulerId,
                id: filter.id
            }).then(function (res) {

                angular.forEach(vm.yadeFilterList, function (value, index) {
                    if (value.id == filter.id) {
                        vm.yadeFilterList.splice(index, 1);
                    }
                });

                if (vm.savedYadeFilter.selected == filter.id) {
                    vm.savedYadeFilter.selected = undefined;
                    vm.yadeFilters.selectedView = false;
                    vm.selectedFiltered = undefined;
                    vm.load();
                    isCustomizationSelected(false);
                } else {
                    if (vm.yadeFilterList.length == 0) {
                        vm.savedYadeFilter.selected = undefined;
                        vm.yadeFilters.selectedView = false;
                        vm.selectedFiltered = undefined;
                        isCustomizationSelected(false);
                    }
                }


                SavedFilter.setYade(vm.savedYadeFilter);
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
                    angular.forEach(vm.yadeFilterList, function (value, index) {
                        if (value.id == configObj.id) {
                            vm.yadeFilterList.splice(index, 1);
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
            vm.savedYadeFilter.favorite = filter.id;
            vm.yadeFilters.selectedView = true;

            SavedFilter.setYade(vm.savedYadeFilter);
            SavedFilter.save();
            vm.load();
        };

        vm.removeFavorite = function () {
            vm.savedYadeFilter.favorite = '';


            vm.filters.favorite = '';
            SavedFilter.setYade(vm.savedYadeFilter);
            SavedFilter.save();
        };
        vm.checkFilterName = function () {
            vm.isUnique = true;

            if (vm.yadeSearch && vm.yadeSearch.name) {
                angular.forEach(vm.yadeFilterList, function (value) {
                    if (vm.yadeSearch.name == value.name && vm.permission.user == value.account) {
                        vm.isUnique = false;
                    }
                });
            } else if (vm.yadeFilter) {
                angular.forEach(vm.yadeFilterList, function (value) {
                    if (vm.yadeFilter.name == value.name && vm.permission.user == value.account && vm.yadeFilter.name != temp_name) {
                        vm.isUnique = false;
                    }
                });
            }
        };

        vm.changeFilter = function (filter) {
            vm.cancel();

            if (filter) {
                vm.savedYadeFilter.selected = filter.id;
                vm.yadeFilters.selectedView = true;
                UserService.configuration({
                    jobschedulerId: filter.jobschedulerId,
                    id: filter.id
                }).then(function (conf) {
                    vm.selectedFiltered = JSON.parse(conf.configuration.configurationItem);
                    vm.selectedFiltered.account = filter.account;
                    vm.load();
                });
            }
            else {
                isCustomizationSelected(false);
                vm.savedYadeFilter.selected = filter;
                vm.yadeFilters.selectedView = false;
                vm.selectedFiltered = filter;
                vm.load();
            }


            SavedFilter.setYade(vm.savedYadeFilter);
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
        vm.restartAllTransfer = function () {

            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.ids = [];

            angular.forEach(vm.object.fileTransfers, function (value) {
                obj.ids.push(value.id);
            });

            var modalInstance ={};
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = '';
                vm.comments.operation = 'Delete';
                vm.comments.type = 'File transfer';
                if(event){
                    vm.comments.name = event.id;
                }else {
                    angular.forEach(vm.object.events, function (value, index) {
                        if (index == vm.object.events.length - 1) {
                            vm.comments.name = vm.comments.name + ' ' + value.id;
                        } else {
                            vm.comments.name = value.id + ', ' + vm.comments.name;
                        }
                    });
                }
                 modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    obj.auditLog = {};
                    if (vm.comments.comment)
                        obj.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        obj.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        obj.auditLog.ticketLink = vm.comments.ticketLink;
                    YadeService.restart(obj);
                    vm.object.events = [];
                }, function () {
                    vm.object.events = [];
                });
            } else {
                 YadeService.restart(obj);
            }
        };
        vm.restartTransfer = function(transfer){
            console.log(transfer);
            YadeService.restart();
        };


        vm.resumeOrderNextstate = function (order) {
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = order.path;
                vm.comments.title = order.title;
                vm.comments.operation = 'Resume';
                vm.comments.type = 'Order';
            }
            vm.order = angular.copy(order);
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/resume-order-state-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                resumeOrderState(order);
            }, function () {

            });

            JobChainService.getJobChainP({
                jobschedulerId: $scope.schedulerIds.selected,
                jobChain: order.jobChain
            }).then(function (res) {
                vm._jobChain = res.jobChain;
                angular.forEach(res.jobChain.endNodes, function (value) {
                    vm._jobChain.nodes.push(value);
                });
            });
        };

        function resumeOrderState(order) {
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            if (vm.comments) {
                orders.auditLog = {};
                if (vm.comments.comment) {
                    orders.auditLog.comment = vm.comments.comment;
                }
                if (vm.comments.timeSpent) {
                    orders.auditLog.timeSpent = vm.comments.timeSpent;
                }

                if (vm.comments.ticketLink) {
                    orders.auditLog.ticketLink = vm.comments.ticketLink;
                }
            }
            orders.orders.push({
                orderId: order.orderId,
                jobChain: order.jobChain,
                state: vm.order.state,
                endState: vm.order.endState,
                resume: true
            });

            OrderService.setOrderState(orders);
            vm.reset();
        }

        function resumeOrderWithParam(order, paramObject) {
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            orders.auditLog = {};
            if (vm.comments.comment) {
                orders.auditLog.comment = vm.comments.comment;
            }
            if (vm.comments.timeSpent) {
                orders.auditLog.timeSpent = vm.comments.timeSpent;
            }

            if (vm.comments.ticketLink) {
                orders.auditLog.ticketLink = vm.comments.ticketLink;
            }

            if (order.params) {
                order.params = order.params.concat(paramObject.params);
            } else {
                order.params = paramObject.params;
            }

            if (order.params && order.params.length > 0) {
                orders.orders.push({orderId: order.orderId, jobChain: order.jobChain, params: order.params});
            } else {
                orders.orders.push({orderId: order.orderId, jobChain: order.jobChain});
            }
            delete orders['params'];
            OrderService.resumeOrder(orders);
            vm.reset();
        }

        vm.resumeOrderWithParam = function (order) {

            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            orders.orders.push({orderId: order.orderId, jobChain: order.path.split(',')[0]});
            OrderService.get(orders).then(function (res) {
                order = angular.merge(order, res.orders[0]);
            });

            vm.order = order;
            vm.paramObject = {};
            vm.paramObject.params = [];
            vm.comments = {};
            vm.comments.radio = 'predefined';
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/resume-order-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                resumeOrderWithParam(order, vm.paramObject);
            }, function () {
                vm.reset();
            });
        };
        $scope.$on('$destroy', function () {
            watcher1();
            watcher2();
        });
    }

})();
