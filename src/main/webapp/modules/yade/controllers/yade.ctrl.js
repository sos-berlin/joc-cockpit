/**
 * Created by sourabhagrawal on 24/10/17.
 */
(function () {
    'use strict';
    angular
        .module('app')
        .controller('YadeCtrl', YadeCtrl)
        .controller('YadeOverviewCtrl', YadeOverviewCtrl);

    YadeCtrl.$inject = ["$scope", "CoreService", "YadeService", "UserService", "SavedFilter", "$uibModal", "$location", "OrderService"];
    function YadeCtrl($scope, CoreService, YadeService, UserService, SavedFilter, $uibModal, $location, OrderService) {
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

        if(vm.yadeFilters.showFiles != undefined){
            vm.showFiles = vm.yadeFilters.showFiles;
        }else{
            vm.showFiles = vm.userPreferences.showFiles;
        }

        vm.reset = function(){
            vm.object.files = [];
            vm.object.fileTransfers = [];
        };

        vm.sortBy = function (propertyName) {
            vm.reset();
            vm.yadeFilters.sortReverse = !vm.yadeFilters.sortReverse;
            vm.yadeFilters.filter.sortBy = propertyName;
        };

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

        vm.checkAllFileTransfersFnc = function () {
            if (vm.checkAllFileTransfers.checkbox && vm.fileTransfers.length > 0) {
                vm.object.fileTransfers = [];
                var data = vm.fileTransfers.slice((vm.userPreferences.entryPerPage * (vm.yadeFilters.currentPage - 1)), (vm.userPreferences.entryPerPage * vm.yadeFilters.currentPage));
                angular.forEach(data, function (value) {
                    if (value.state._text != 'SUCCESSFUL') {
                        vm.object.fileTransfers.push(value);
                        if(value.files && value.files.length>0){
                            angular.forEach(value.files, function (file) {
                                vm.object.files.push(file);
                            });
                        }
                    }
                });

            } else {
                vm.reset();
            }

        };
        var watcher1 = $scope.$watchCollection('object.fileTransfers', function (newNames) {
            if (newNames && newNames.length > 0) {

            } else {
                vm.checkAllFileTransfers.checkbox = false;
                vm.object.files = [];
            }

        });

        vm.checkALLFilesFnc = function(transfer){
            if($("#" + transfer.id) && $("#" + transfer.id).prop('checked')) {
         
                if (transfer && transfer.files) {
                    angular.forEach(transfer.files, function (file) {
                        var flag = false;
                        for (var x = 0; x < vm.object.files.length; x++) {
                            if (angular.equals(file, vm.object.files[x])) {
                                flag = true;
                                break;
                            }
                        }
                        if(!flag){
                            vm.object.files.push(file)
                        }
                    });
                }
            }else{
                var _temp = angular.copy(vm.object.files);
                angular.forEach(_temp, function (file,index) {
                     for (var x = 0; x < vm.object.files.length; x++) {
                         if(transfer.id == vm.object.files[x].id) {
                             vm.object.files.splice(index,1);
                             break;
                         }
                     }
                });
            }
        };

        var watcher2 = $scope.$watchCollection('object.files', function (newNames) {
            if (newNames && newNames.length > 0) {
                var data = vm.fileTransfers.slice((vm.userPreferences.entryPerPage * (vm.yadeFilters.currentPage - 1)), (vm.userPreferences.entryPerPage * vm.yadeFilters.currentPage));
                angular.forEach(newNames, function (value) {
                    for(var i=0; i<data.length;i++) {
                        if(data[i].id == value.transferId){
                            var flg = false;
                            for(var x= 0; x<vm.object.fileTransfers.length;x++ ){
                                if(vm.object.fileTransfers[x].id  == data[i].id){
                                    flg = true
                                }
                            }
                            if(!flg)
                            vm.object.fileTransfers.push(data[i]);
                            break;
                        }
                    }
                });

            } else {
                if (vm.fileTransfers && vm.fileTransfers.length > 0) {
                    var data = vm.fileTransfers.slice((vm.userPreferences.entryPerPage * (vm.yadeFilters.currentPage - 1)), (vm.userPreferences.entryPerPage * vm.yadeFilters.currentPage));
                    angular.forEach(data, function (transfer) {
                        if ($("#" + transfer.id)) {
                            $("#" + transfer.id).prop('checked', false);
                        }
                    });
                }
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
            vm.reset();
            if (!vm.yadeFilterList) {
                checkSharedFilters();
                return;
            }
            if (vm.selectedFiltered) {
                isCustomizationSelected(true);
            }
            var obj = {};
            obj.jobschedulerId = vm.yadeView.current == true ? vm.schedulerIds.selected : '';

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
            if (!vm.showFiles) {
                obj.compact = true;
            }

            obj.timeZone = vm.userPreferences.zone;
            if ((obj.dateFrom && typeof obj.dateFrom.getMonth === 'function') || (obj.dateTo && typeof obj.dateTo.getMonth === 'function')) {
                delete obj['timeZone']
            }
            obj.limit = parseInt(vm.userPreferences.maxRecords);
            YadeService.getTransfers(obj).then(function (res) {
                vm.fileTransfers = res.transfers;
                if (vm.showFiles) {
                    angular.forEach(vm.fileTransfers, function (transfer) {
                        transfer.show = true;
                        getFiles(transfer);
                    });
                }
                vm.isLoading = true;
            }, function () {
                vm.isLoading = true;
            });
        };

        function getTransfer(transfer) {
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.transferIds = [];
            obj.transferIds.push(transfer.id);
            YadeService.getTransfers(obj).then(function (res) {
                if(res.transfers && res.transfers.length>0) {
                    transfer.states = res.transfers[0].states;
                    transfer.operations = res.transfers[0].operations;
                    transfer.hasIntervention = res.transfers[0].hasIntervention;
                    transfer.isIntervention = res.transfers[0].isIntervention;
                    transfer.source = res.transfers[0].source;
                    transfer.target = res.transfers[0].target;
                    transfer.mandator = res.transfers[0].mandator;
                    transfer.profile = res.transfers[0].profile;
                    transfer.taskId = res.transfers[0].taskId;
                }
            });
        }

        function getFileTransferById(transferId) {
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.transferIds = [];
            obj.transferIds.push(transferId);
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

        function getFiles(value) {
            var ids = [];
            ids.push(value.id);
            YadeService.files({
                transferIds: ids,
                jobschedulerId: value.jobschedulerId || vm.schedulerIds.selected
            }).then(function (res) {
                value.files = res.files;
            })
        }

        vm.showTransferFuc = function (value) {
            var obj = {};
            obj.jobschedulerId = value.jobschedulerId || vm.schedulerIds.selected;
            obj.transferIds = [];
            obj.transferIds.push(value.id);
            YadeService.getTransfers(obj).then(function (res) {
                value = angular.merge(value,res.transfers[0]);
                vm.isLoading = true;
            }, function () {
                vm.isLoading = true;
            });
            value.show = true;
            getFiles(value);
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
            vm.showFiles = true;
            vm.yadeFilters.showFiles = true;

            vm.load();
        };

        vm.collapseDetails = function () {
            vm.showFiles = false;
            vm.yadeFilters.showFiles = false;

            angular.forEach(vm.fileTransfers, function (value) {
                value.show = false;
            });
        };
        vm.restartAllTransfer = function () {

            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.transfers = [];

            angular.forEach(vm.object.fileTransfers, function (value) {
                var fields =[];
                angular.forEach(vm.object.files, function (file) {
                    if(value.id == file.transferId)
                        fields.push(file.id);
                });
                obj.transfers.push({transferId: value.id,fields:fields});
            });

            var modalInstance = {};
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = '';
                vm.comments.operation = 'Restart';
                vm.comments.type = 'File transfer';
                if (event) {
                    vm.comments.name = event.id;
                } else {
                    angular.forEach(vm.object.fileTransfers, function (value, index) {
                        if (index == vm.object.fileTransfers.length - 1) {
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
                    vm.object.fileTransfers = [];
                }, function () {
                    vm.object.fileTransfers = [];
                });
            } else {
                YadeService.restart(obj);
            }
        };
        vm.restartTransfer = function (transfer) {
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.transferId = transfer.id;
            YadeService.transferOrder(obj).then(function(res){
                vm.resumeOrderWithParam(res.order);
            });
        };


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

        $scope.$on('event-started', function () {
            if (vm.events && vm.events[0] && vm.events[0].eventSnapshots)
                for (var i = 0; i < vm.events[0].eventSnapshots.length; i++) {
                    if (vm.events[0].eventSnapshots[i].objectType == 'OTHER') {
                        if (vm.events[0].eventSnapshots[i].eventType == 'YADETransferStarted') {
                           vm.load();
                            break;
                        }else if(vm.events[0].eventSnapshots[i].eventType == 'YADETransferUpdated'){
                            for(var x=0; x<vm.fileTransfers.length;x++){
                                if(vm.fileTransfers[x].id ==vm.events[0].eventSnapshots[i].path ){
                                    getTransfer(vm.fileTransfers[x]);
                                    break;
                                }
                            }
                        }else if(vm.events[0].eventSnapshots[i].eventType == 'YADEFileStateChanged'){
                            for(var x=0; x<vm.fileTransfers.length;x++){
                                if(vm.fileTransfers[x].id ==vm.events[0].eventSnapshots[i].path && vm.fileTransfers[x].show ){
                                    getFiles(vm.fileTransfers[x]);
                                    break;
                                }
                            }
                        }
                    }
                }
        });
    }

    YadeOverviewCtrl.$inject = ["$scope","$rootScope", "CoreService", "YadeService","OrderService", "$uibModal",  "$stateParams", "AuditLogService"];
    function YadeOverviewCtrl($scope,$rootScope, CoreService, YadeService, OrderService, $uibModal,$stateParams, AuditLogService) {
        var vm = $scope;
        vm.orderFilters = CoreService.getYadeDetailTab();
        vm.maxEntryPerPage = vm.userPreferences.maxEntryPerPage;


        vm.allOrders = [];
        vm.orderFilters.filter.state = $stateParams.name;
        vm.object = {};
        vm.reset = function () {
            vm.object = {};
        };
        vm.init = function () {
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.compact = true;
            obj.processingStates = [];
            if (vm.orderFilters.filter.state != 'ALL')
                obj.processingStates.push(vm.orderFilters.filter.state);
            vm.status = vm.orderFilters.filter.state;
            YadeService.yadeOrders(obj).then(function (res) {
                angular.forEach(res.orders, function (value) {
                    value.path1 = value.jobChain.substring(1, value.jobChain.lastIndexOf('/'));
                });
                vm.allOrders = res.orders;

                vm.isLoading = true;
            }, function () {
                vm.isLoading = true;
                vm.isError = true;
            });
        };
        vm.init();

        vm.showLogFuc = function (value) {
            var orders = {};
            vm.isAuditLog = false;
            orders.orders = [];
            orders.orders.push({orderId: value.orderId, jobChain: value.path.split(',')[0]});
            orders.jobschedulerId = $scope.schedulerIds.selected;
            orders.limit = parseInt(vm.userPreferences.maxHistoryPerOrder);

            OrderService.histories(orders).then(function (res) {
                vm.historys = res.history;
            });

            vm.showLogPanel = value;
            vm.orderFilters.showLogPanel = vm.showLogPanel;
        };

        function loadAuditLogs(obj) {
            obj.limit = parseInt(vm.userPreferences.maxAuditLogPerObject);
            AuditLogService.getLogs(obj).then(function (result) {
                if (result && result.auditLog) {
                    vm.auditLogs = result.auditLog;
                }
            });
        }

        vm.showAuditLogs = function (value) {
            vm.showLogPanel = value;
            vm.orderFilters.showLogPanel = vm.showLogPanel;
            vm.isAuditLog = true;
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.orders = [];
            obj.orders.push({jobChain: value.jobChain, orderId: value.orderId});
            if (vm.permission.AuditLog.view.status)
                loadAuditLogs(obj);
        };


        vm.hideLogPanel = function () {
            vm.showLogPanel = undefined;
            vm.orderFilters.showLogPanel = vm.showLogPanel;
        };

        vm.showLeftPanel = function () {
            CoreService.setSideView(false);
            $('#rightPanel').removeClass('fade-in m-l-0');
            $('#leftPanel').show();
            $('.sidebar-btn').hide();
        };
        vm.changeStatus = function () {
            vm.hideLogPanel();
            vm.init();
        };

        $scope.$on("yadeState", function (evt, state) {
            vm.orderFilters.filter.state = state;
            vm.status = state;
            if (state) {
                var obj = {};
                obj.jobschedulerId = $scope.schedulerIds.selected;
                obj.compact = true;
                if (vm.orderFilters.filter.state && vm.orderFilters.filter.state != 'ALL') {
                    obj.processingStates = [];
                    obj.processingStates.push(vm.orderFilters.filter.state);
                }
                YadeService.yadeOrders(obj).then(function (res) {
                    angular.forEach(res.orders, function (value) {
                        value.path1 = value.jobChain.substring(1, value.jobChain.lastIndexOf('/'));
                    });
                    vm.allOrders = res.orders;
                });
            }
        });
        vm.sortBy = function (propertyName) {
            vm.reset();
            vm.orderFilters.reverse = !vm.orderFilters.reverse;
            vm.orderFilters.filter.sortBy = propertyName;
        };

        /** --------action ------------ **/

        vm.deleteAllOrder = function () {
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            angular.forEach(vm.object.orders, function (value) {
                orders.orders.push({orderId: value.orderId, jobChain: value.jobChain});
            });
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = '';
                vm.comments.operation = 'Delete';
                vm.comments.type = 'Order';
                angular.forEach(vm.object.orders, function (value, index) {
                    if (index == vm.object.orders.length - 1) {
                        vm.comments.name = vm.comments.name + ' ' + value.path;
                    } else {
                        vm.comments.name = value.path + ', ' + vm.comments.name;
                    }
                });
                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    orders.auditLog = {};
                    if (vm.comments.comment)
                        orders.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        orders.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        orders.auditLog.ticketLink = vm.comments.ticketLink;
                    OrderService.deleteOrder(orders).then(function (res) {
                        for (var i = 0; i < vm.object.orders.length; i++) {
                            if (vm.showLogPanel && vm.object.orders[i].path == vm.showLogPanel.path) {
                                vm.showLogPanel = undefined;
                            }
                            for (var j = 0; j < vm.allOrders.length; j++) {
                                if (vm.object.orders[i].path == vm.allOrders[j].path) {
                                    vm.allOrders.splice(j, 1);
                                    break;
                                }
                            }
                        }
                        vm.reset();
                    });
                }, function () {

                });
            } else {
                OrderService.deleteOrder(orders).then(function (res) {
                    for (var i = 0; i < vm.object.orders.length; i++) {
                        if (vm.showLogPanel && vm.object.orders[i].path == vm.showLogPanel.path) {
                            vm.showLogPanel = undefined;
                        }
                        for (var j = 0; j < vm.allOrders.length; j++) {
                            if (vm.object.orders[i].path == vm.allOrders[j].path) {
                                vm.allOrders.splice(j, 1);
                                break;
                            }
                        }
                    }
                    vm.reset();
                });
            }
        };

        vm.suspendAllOrder = function () {
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            angular.forEach(vm.object.orders, function (value) {
                orders.orders.push({orderId: value.orderId, jobChain: value.jobChain});
            });
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = '';
                vm.comments.operation = 'Suspend';
                vm.comments.type = 'Order';
                angular.forEach(vm.object.orders, function (value, index) {
                    if (index == vm.object.orders.length - 1) {
                        vm.comments.name = vm.comments.name + ' ' + value.path;
                    } else {
                        vm.comments.name = value.path + ', ' + vm.comments.name;
                    }
                });
                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    orders.auditLog = {};
                    if (vm.comments.comment)
                        orders.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        orders.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        orders.auditLog.ticketLink = vm.comments.ticketLink;
                    OrderService.suspendOrder(orders);
                    vm.reset();
                }, function () {

                });
            } else {
                OrderService.suspendOrder(orders);
                vm.reset();
            }

        };

        vm.resumeAllOrder = function () {
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            angular.forEach(vm.object.orders, function (value) {
                orders.orders.push({orderId: value.orderId, jobChain: value.jobChain});
            });
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = '';
                vm.comments.operation = 'Resume';
                vm.comments.type = 'Order';
                angular.forEach(vm.object.orders, function (value, index) {
                    if (index == vm.object.orders.length - 1) {
                        vm.comments.name = vm.comments.name + ' ' + value.path;
                    } else {
                        vm.comments.name = value.path + ', ' + vm.comments.name;
                    }
                });
                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    orders.auditLog = {};
                    if (vm.comments.comment)
                        orders.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        orders.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        orders.auditLog.ticketLink = vm.comments.ticketLink;
                    OrderService.resumeOrder(orders);
                    vm.reset();
                }, function () {

                });
            } else {
                OrderService.resumeOrder(orders);
                vm.reset();
            }

        };
        vm.resetAllOrder = function () {
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            angular.forEach(vm.object.orders, function (value) {
                orders.orders.push({orderId: value.orderId, jobChain: value.jobChain});
            });
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = '';
                vm.comments.operation = 'Reset';
                vm.comments.type = 'Order';
                angular.forEach(vm.object.orders, function (value, index) {
                    if (index == vm.object.orders.length - 1) {
                        vm.comments.name = vm.comments.name + ' ' + value.path;
                    } else {
                        vm.comments.name = value.path + ', ' + vm.comments.name;
                    }
                });
                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    orders.auditLog = {};
                    if (vm.comments.comment)
                        orders.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        orders.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        orders.auditLog.ticketLink = vm.comments.ticketLink;
                    OrderService.resetOrder(orders);
                    vm.reset();
                }, function () {

                });
            } else {
                OrderService.resetOrder(orders);
                vm.reset();
            }

        };
        vm.startAllOrder = function () {
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            angular.forEach(vm.object.orders, function (value) {
                orders.orders.push({orderId: value.orderId, jobChain: value.jobChain, at: 'now'});
            });
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = '';
                vm.comments.operation = 'Start';
                vm.comments.type = 'Order';
                angular.forEach(vm.object.orders, function (value, index) {
                    if (index == vm.object.orders.length - 1) {
                        vm.comments.name = vm.comments.name + ' ' + value.path;
                    } else {
                        vm.comments.name = value.path + ', ' + vm.comments.name;
                    }
                });
                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    orders.auditLog = {};
                    if (vm.comments.comment)
                        orders.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        orders.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        orders.auditLog.ticketLink = vm.comments.ticketLink;
                    OrderService.startOrder(orders);
                    vm.reset();
                }, function () {

                });
            } else {
                OrderService.startOrder(orders);
                vm.reset();
            }

        };
        vm.exportToExcel = function () {

            $('#exportToExcelBtn').attr("disabled", true);
            if (!vm.isIE()) {
                $('#orderTableId').table2excel({
                    exclude: ".tableexport-ignore",
                    filename: "jobscheduler-yade-order",
                    fileext: ".xls",
                    exclude_img: false,
                    exclude_links: false,
                    exclude_inputs: false
                });
            } else {
                var ExportButtons = document.getElementById('orderTableId');
                var instance = new TableExport(ExportButtons, {
                    formats: ['xlsx'],
                    exportButtons: false
                });
                var exportData = instance.getExportData()['orderTableId']['xlsx'];
                instance.export2file(exportData.data, exportData.mimeType, "jobscheduler-yade-order", exportData.fileExtension);
            }
            $('#exportToExcelBtn').attr("disabled", false);
        };
        var waitForResponse = true;
        $scope.$on('event-started', function () {
            if (vm.events && vm.events[0] && vm.events[0].eventSnapshots)
                for (var i = 0; i < vm.events[0].eventSnapshots.length; i++) {

                    if (vm.events[0].eventSnapshots[i].path != undefined && vm.events[0].eventSnapshots[i].eventType == "OrderStateChanged" && !vm.events[0].eventSnapshots[i].eventId && waitForResponse) {
                        waitForResponse = false;
                        var obj = {};
                        obj.jobschedulerId = $scope.schedulerIds.selected;
                        obj.compact = true;
                        obj.processingStates = [];
                        obj.processingStates.push(vm.orderFilters.filter.state);
                        YadeService.yadeOrders(obj).then(function (res) {
                            angular.forEach(res.orders, function (value) {
                                value.path1 = value.path.substring(1, value.path.lastIndexOf('/'));
                            });
                            vm.reset();
                            vm.allOrders = res.orders;
                            var flag = false;
                            for (var i = 0; i < vm.allOrders.length; i++) {
                                if (vm.showLogPanel && vm.showLogPanel.path == vm.allOrders[i].path) {
                                    flag = true;
                                    break;
                                }
                            }
                            if (!flag) {
                                vm.showLogPanel = undefined;
                            }
                            waitForResponse = true;

                        }, function () {
                            waitForResponse = true;
                        });
                        $rootScope.$broadcast('reloadYadeSnapshot');
                    }
                    if (vm.showLogPanel && vm.events[0].eventSnapshots[i].eventType == "AuditLogChanged" && vm.events[0].eventSnapshots[i].objectType == "ORDER" && vm.events[0].eventSnapshots[i].path == vm.showLogPanel.path) {
                        var obj = {};
                        obj.jobschedulerId = vm.schedulerIds.selected;
                        obj.orders = [];
                        obj.orders.push({jobChain: vm.showLogPanel.jobChain, orderId: vm.showLogPanel.orderId});
                        loadAuditLogs(obj);
                    }
                }
        });
    }

})();
