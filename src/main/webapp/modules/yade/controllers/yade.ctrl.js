/**
 * Created by sourabhagrawal on 24/10/17.
 */
(function () {
    'use strict';
    angular
        .module('app')
        .controller('YadeCtrl', YadeCtrl)
        .controller('YadeOverviewCtrl', YadeOverviewCtrl);

    YadeCtrl.$inject = ["$scope", "CoreService", "YadeService", "UserService", "SavedFilter", "$uibModal", "$location", "OrderService","PermissionService", "$filter"];
    function YadeCtrl($scope, CoreService, YadeService, UserService, SavedFilter, $uibModal, $location, OrderService,PermissionService, $filter) {
        var vm = $scope;
        vm.maxEntryPerPage = vm.userPreferences.maxEntryPerPage;
        vm.yadeView = {};
        vm.yadeView.current = vm.userPreferences.fileTransfer == 'current';
        vm.yadeFilters = CoreService.getYadeTab();
        vm.yadeSearch = {};
        vm.selectedFiltered = null;
        vm.temp_filter = {};
        vm.object = {};
        vm.object.files = [];
        vm.object.fileTransfers = [];

        if(vm.yadeFilters.showFiles != undefined){
            vm.showFiles = vm.yadeFilters.showFiles;
        }else{
            vm.showFiles = vm.userPreferences.showFiles;
        }

        $scope.reloadState = 'no';

        vm.reload = function() {
            if ($scope.reloadState == 'no') {
                $scope.fileTransfers = [];
                $scope.abort = 'Process aborted';
                $scope.reloadState = 'yes';
            } else if ($scope.reloadState == 'yes') {
                $scope.reloadState = 'no';
                vm.isLoading = false;
                $scope.load();
            }
        };

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
                let data  = $filter('orderBy')($scope.fileTransfers, vm.yadeFilters.filter.sortBy, vm.yadeFilters.sortReverse);
                data = data.slice((vm.userPreferences.entryPerPage * (vm.yadeFilters.currentPage - 1)), (vm.userPreferences.entryPerPage * vm.yadeFilters.currentPage));
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

                if(transfer.numOfFiles > 0 && !transfer.files){
                    getFiles(transfer, 'checkbox');
                }

                if (transfer && transfer.files) {
                    angular.forEach(transfer.files, function (file) {
                        var flag = false;
                        for (var x = 0; x < vm.object.files.length; x++) {
                            if (angular.equals(file, vm.object.files[x])) {
                                flag = true;
                                break;
                            }
                        }
                        if (!flag) {
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

            if (/^\s*(-)\s*(\d+)(s|h|d|w|M|y)\s*$/.test(regex)) {
                fromDate = /^\s*(-)\s*(\d+)(s|h|d|w|M|y)\s*$/.exec(regex)[0];
            } else if (/^\s*(now\s*\-)\s*(\d+)\s*$/i.test(regex)) {
                var seconds = parseInt(/^\s*(now\s*\-)\s*(\d+)\s*$/i.exec(regex)[2]);
                fromDate = '-'+seconds+'s'
            } else if (/^\s*(Today)\s*$/i.test(regex)) {
                fromDate = '0d';
                toDate = '0d';
            } else if (/^\s*(Yesterday)\s*$/i.test(regex)) {
                fromDate = '-1d';
                toDate = '-1d';
            } else if (/^\s*(now)\s*$/i.test(regex)) {
                fromDate = moment.utc(new Date());
                toDate = fromDate;
            } else if (/^\s*(-)(\d+)(s|h|d|w|M|y)\s*to\s*(-)(\d+)(s|h|d|w|M|y)\s*$/.test(regex)) {
                date = /^\s*(-)(\d+)(s|h|d|w|M|y)\s*to\s*(-)(\d+)(s|h|d|w|M|y)\s*$/.exec(regex);
                arr = date[0].split('to');
                fromDate = arr[0].trim();
                toDate = arr[1].trim();
            } else if (/^\s*(-)(\d+)(s|h|d|w|M|y)\s*to\s*(-)(\d+)(s|h|d|w|M|y)\s*[-,+](\d+)(s|h|d|w|M|y)\s*$/.test(regex)) {
                date = /^\s*(-)(\d+)(s|h|d|w|M|y)\s*to\s*(-)(\d+)(s|h|d|w|M|y)\s*[-,+](\d+)(s|h|d|w|M|y)\s*$/.exec(regex);
                arr = date[0].split('to');
                fromDate = arr[0].trim();
                toDate = arr[1].trim();
            } else if (/^\s*(-)(\d+)(s|h|d|w|M|y)\s*[-,+](\d+)(s|h|d|w|M|y)\s*to\s*(-)(\d+)(s|h|d|w|M|y)\s*$/.test(regex)) {
                date = /^\s*(-)(\d+)(s|h|d|w|M|y)\s*[-,+](\d+)(s|h|d|w|M|y)\s*to\s*(-)(\d+)(s|h|d|w|M|y)\s*$/.exec(regex);
                arr = date[0].split('to');
                fromDate = arr[0].trim();
                toDate = arr[1].trim();
            } else if (/^\s*(-)(\d+)(s|h|d|w|M|y)\s*[-,+](\d+)(s|h|d|w|M|y)\s*to\s*(-)(\d+)(s|h|d|w|M|y)\s*[-,+](\d+)(s|h|d|w|M|y)\s*$/.test(regex)) {
                date = /^\s*(-)(\d+)(s|h|d|w|M|y)\s*[-,+](\d+)(s|h|d|w|M|y)\s*to\s*(-)(\d+)(s|h|d|w|M|y)\s*[-,+](\d+)(s|h|d|w|M|y)\s*$/.exec(regex);
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
                fromDate = moment.utc(fromDate);

                toDate = new Date();
                if (/(pm)/i.test(time[6]) && parseInt(time[4]) != 12) {
                    toDate.setHours(parseInt(time[4]) - 12);
                } else {
                    toDate.setHours(parseInt(time[4]));
                }
                toDate.setMinutes(parseInt(time[5]));
                toDate = moment.utc(toDate);
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
             vm.isLoaded = true;
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
                if (vm.selectedFiltered.profileId) {
                    vm.selectedFiltered.profileId = vm.selectedFiltered.profileId.replace(/\s*(,|^|$)\s*/g, "$1");
                    obj.profiles = vm.selectedFiltered.profileId.split(',');
                }

                if (vm.selectedFiltered.mandator) {
                    obj.mandator = vm.selectedFiltered.mandator;
                }

                if (vm.yadeSearch.operations && vm.yadeSearch.operations.length > 0) {
                    obj.operations = vm.yadeSearch.operations;
                }
                if (vm.selectedFiltered.sourceFileName) {
                    vm.selectedFiltered.sourceFileName = vm.selectedFiltered.sourceFileName.replace(/\s*(,|^|$)\s*/g, "$1");
                    obj.sourceFiles = vm.selectedFiltered.sourceFileName.split(',');
                }
                if(vm.selectedFiltered.sourceFileRegex) {
                    obj.sourceFilesRegex = vm.selectedFiltered.sourceFileRegex;
                }
                if (vm.selectedFiltered.targetFileName) {
                    vm.selectedFiltered.targetFileName = vm.selectedFiltered.targetFileName.replace(/\s*(,|^|$)\s*/g, "$1");
                    obj.targetFiles = vm.selectedFiltered.targetFileName.split(',');
                }
                 if(vm.selectedFiltered.targetFileRegex) {
                     obj.targetFilesRegex = vm.selectedFiltered.targetFileRegex;
                 }
                if (vm.selectedFiltered.sourceHost || vm.selectedFiltered.sourceProtocol) {
                    let hosts = [];
                    let protocols = [];
                    if (vm.selectedFiltered.sourceHost) {
                        vm.selectedFiltered.sourceHost = vm.selectedFiltered.sourceHost.replace(/\s*(,|^|$)\s*/g, "$1");
                        hosts = vm.selectedFiltered.sourceHost.split(',');
                    }
                    if (vm.selectedFiltered.sourceProtocol) {
                        protocols = vm.selectedFiltered.sourceProtocol;
                    }
                    obj.sources = mergeHostAndProtocol(hosts, protocols);

                }
                if (vm.selectedFiltered.targetHost || vm.selectedFiltered.targetProtocol) {
                    let hosts = [];
                    let protocols = [];
                    if (vm.selectedFiltered.targetHost) {
                        vm.selectedFiltered.targetHost = vm.selectedFiltered.targetHost.replace(/\s*(,|^|$)\s*/g, "$1");
                        hosts = vm.selectedFiltered.targetHost.split(',');
                    }
                    if (vm.selectedFiltered.targetProtocol) {
                        protocols = vm.selectedFiltered.targetProtocol;
                    }
                    obj.targets = mergeHostAndProtocol(hosts, protocols);
                }

                if (vm.selectedFiltered.planned) {
                    obj = parseProcessExecuted(vm.selectedFiltered.planned, obj);
                }
            }
            else {
                if (vm.yadeFilters.filter.states && vm.yadeFilters.filter.states !== 'all') {
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
                delete obj["timeZone"];
            }
            if ((obj.dateFrom && typeof obj.dateFrom.getMonth === 'function')) {
                obj.dateFrom = moment(obj.dateFrom).tz(vm.userPreferences.zone)._d;
            }
            if ((obj.dateTo && typeof obj.dateTo.getMonth === 'function')) {
                obj.dateTo = moment(obj.dateTo).tz(vm.userPreferences.zone)._d;
            }
            obj.limit = parseInt(vm.userPreferences.maxRecords);
            YadeService.getTransfers(obj).then(function (res) {
                if(vm.fileTransfers && vm.fileTransfers.length>0 && res.transfers && res.transfers.length>0){
                    vm.fileTransfers = _.merge(vm.fileTransfers,res.transfers);
                }else {
                    vm.fileTransfers = res.transfers;
                }
                angular.forEach(vm.fileTransfers, function (transfer) {
                    let id = transfer.jobschedulerId || vm.schedulerIds.selected;
                    transfer.permission = PermissionService.getPermission(id).YADE;
                    if (vm.showFiles) {
                        transfer.show = true;
                        getFiles(transfer);
                    }
                });

                vm.isLoading = true;
                vm.isLoaded = false;
            }, function () {
                vm.isLoading = true;
                 vm.isLoaded = false;
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
                vm.fileTransfers[0].permission  =  PermissionService.getPermission(vm.schedulerIds.selected).YADE;
                vm.isLoading = true;
            }, function () {
                vm.isLoading = true;
            });
        }

        if ($location.search().scheduler_id && $location.search().id) {
            vm.checkSchedulerId();
            getFileTransferById($location.search().id);
        } else {
            if(vm.schedulerIds.selected) {
                checkSharedFilters();
            }else{
                vm.load();
            }
        }

        vm.loadYadeFiles = function () {
            vm.fileTransfers = [];
            vm.load();
        };

        function getFiles(value, checkbox) {
            if (vm.permission.YADE.view.files) {
                var ids = [];
                ids.push(value.id);
                YadeService.files({
                    transferIds: ids,
                    jobschedulerId: value.jobschedulerId || vm.schedulerIds.selected
                }).then(function (res) {
                    value.files = res.files;

                    if (checkbox && value.files) {
                        angular.forEach(value.files, function (file) {
                            var flag = false;
                            for (var x = 0; x < vm.object.files.length; x++) {
                                if (angular.equals(file, vm.object.files[x])) {
                                    flag = true;
                                    break;
                                }
                            }
                            if (!flag) {
                                vm.object.files.push(file)
                            }
                        });
                    }
                    vm.isLoaded = false;
                }, function () {
                    vm.isLoaded = false;
                })
            }
        }

        vm.showTransferFuc = function (value) {
            vm.isLoaded = true;
            var obj = {};
            obj.jobschedulerId = value.jobschedulerId || vm.schedulerIds.selected;
            obj.transferIds = [];
            obj.transferIds.push(value.id);
            YadeService.getTransfers(obj).then(function (res) {
                value = _.merge(value,res.transfers[0]);
                vm.isLoading = true;
            }, function () {
                vm.isLoading = true;
            });
            value.show = true;
            getFiles(value);
        };

        function mergeHostAndProtocol(hosts, protocols ) {
            var arr =[];
            if (protocols.length < hosts.length) {
                angular.forEach(hosts, function (value, index) {
                    if (protocols.length > 0) {
                        if (protocols.length < hosts.length) {
                            if (protocols.length == 1) {
                                arr.push({host: value, protocol: protocols[0]});
                            } else {
                                for (let x = 0; x < protocols.length; x++) {
                                    if (protocols.length >= index) {
                                        arr.push({host: value, protocol: protocols[index]});
                                    }
                                    break;
                                }
                            }
                        }
                    } else {
                        arr.push({host: value})
                    }

                })
            } else if (protocols.length > hosts.length) {
                angular.forEach(protocols, function (value, index) {
                    if (hosts.length > 0) {
                        if (hosts.length < protocols.length) {
                            if (hosts.length == 1) {
                                arr.push({protocol: value, host: hosts[0]});
                            } else {
                                for (let x = 0; x < hosts.length; x++) {
                                    if (hosts.length >= index) {
                                        arr.push({protocol: value, host: hosts[index]});
                                    }
                                    break;
                                }
                            }

                        }
                    } else {
                        arr.push({protocol: value})
                    }

                })
            }else {
                angular.forEach(hosts, function (value, index) {
                    for (let x = 0; x < protocols.length; x++) {
                        arr.push({host: value, protocol: protocols[x]});
                        protocols.splice(index,1);
                        break;
                    }
                });
            }
            return arr;
        }

        var isLoaded = true;
        vm.search = function (flag) {
            isLoaded = false;
            if (!flag)
                vm.loading = true;
            var filter = {
                jobschedulerId: vm.yadeView.current == true ? vm.schedulerIds.selected : '',
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
                vm.yadeSearch.profileId = vm.yadeSearch.profileId.replace(/\s*(,|^|$)\s*/g, "$1");
                filter.profiles = vm.yadeSearch.profileId.split(',');
            }
            if (vm.yadeSearch.mandator) {
                filter.mandator = vm.yadeSearch.mandator;
            }
            if (vm.yadeSearch.sourceFileName) {
                vm.yadeSearch.sourceFileName = vm.yadeSearch.sourceFileName.replace(/\s*(,|^|$)\s*/g, "$1");
                filter.sourceFiles = vm.yadeSearch.sourceFileName.split(',');
            }
            if(vm.yadeSearch.sourceFileRegex) {
                filter.sourceFilesRegex = vm.yadeSearch.sourceFileRegex;
            }
            if (vm.yadeSearch.targetFileName) {
                vm.yadeSearch.targetFileName = vm.yadeSearch.targetFileName.replace(/\s*(,|^|$)\s*/g, "$1");
                filter.targetFiles = vm.yadeSearch.targetFileName.split(',');
            }
            if(vm.yadeSearch.targetFileRegex) {
                filter.targetFilesRegex = vm.yadeSearch.targetFileRegex;
            }
            if (vm.yadeSearch.sourceHost || vm.yadeSearch.sourceProtocol) {
                let hosts = [];
                let protocols =[];
                if(vm.yadeSearch.sourceHost){
                    vm.yadeSearch.sourceHost = vm.yadeSearch.sourceHost.replace(/\s*(,|^|$)\s*/g, "$1");
                    hosts = vm.yadeSearch.sourceHost.split(',');
                }
                if(vm.yadeSearch.sourceProtocol){
                    protocols = vm.yadeSearch.sourceProtocol;
                }
                filter.sources = mergeHostAndProtocol(hosts,protocols);

            }
            if (vm.yadeSearch.targetHost || vm.yadeSearch.targetProtocol) {
                let hosts = [];
                let protocols =[];
                if(vm.yadeSearch.targetHost){
                    vm.yadeSearch.targetHost = vm.yadeSearch.targetHost.replace(/\s*(,|^|$)\s*/g, "$1");
                    hosts = vm.yadeSearch.targetHost.split(',');
                }
                if(vm.yadeSearch.targetProtocol){
                    protocols = vm.yadeSearch.targetProtocol;
                }
                filter.targets = mergeHostAndProtocol(hosts,protocols);
            }
            if (vm.yadeSearch.date === 'process') {
                filter = parseProcessExecuted(vm.yadeSearch.planned, filter);
            } else {
                if (vm.yadeSearch.date === 'date' && vm.yadeSearch.from) {
                    let fromDate = new Date(vm.yadeSearch.from);
                    if (vm.yadeSearch.fromTime) {
                        if (vm.yadeSearch.fromTime === '24:00' || vm.yadeSearch.fromTime === '24:00:00') {
                            fromDate.setDate(fromDate.getDate() + 1);
                            fromDate.setHours(0);
                            fromDate.setMinutes(0);
                            fromDate.setSeconds(0);
                        } else {
                            fromDate.setHours(moment(vm.yadeSearch.fromTime, 'HH:mm:ss').hours());
                            fromDate.setMinutes(moment(vm.yadeSearch.fromTime, 'HH:mm:ss').minutes());
                            fromDate.setSeconds(moment(vm.yadeSearch.fromTime, 'HH:mm:ss').seconds());
                        }
                    } else {
                        fromDate.setHours(0);
                        fromDate.setMinutes(0);
                        fromDate.setSeconds(0);
                    }
                    fromDate.setMilliseconds(0);
                    filter.dateFrom = moment.utc(fromDate);
                }
                if (vm.yadeSearch.date === 'date' && vm.yadeSearch.to) {
                    let toDate = new Date(vm.yadeSearch.to);
                    if (vm.yadeSearch.toTime) {
                        if (vm.yadeSearch.toTime === '24:00' || vm.yadeSearch.toTime === '24:00:00') {
                            toDate.setDate(toDate.getDate() + 1);
                            toDate.setHours(0);
                            toDate.setMinutes(0);
                            toDate.setSeconds(0);
                        } else {
                            toDate.setHours(moment(vm.yadeSearch.toTime, 'HH:mm:ss').hours());
                            toDate.setMinutes(moment(vm.yadeSearch.toTime, 'HH:mm:ss').minutes());
                            toDate.setSeconds(moment(vm.yadeSearch.toTime, 'HH:mm:ss').seconds());
                        }
                    } else {
                        toDate.setHours(0);
                        toDate.setMinutes(0);
                        toDate.setSeconds(0);
                    }
                    toDate.setMilliseconds(0);
                    filter.dateTo = moment.utc(toDate);
                }
            }

            if (vm.yadeSearch.jobschedulerId) {
                filter.jobschedulerId = vm.yadeSearch.jobschedulerId;
            }

            filter.timeZone = vm.userPreferences.zone;
            if ((filter.dateFrom && typeof filter.dateFrom.getMonth === 'function') || (filter.dateTo && typeof filter.dateTo.getMonth === 'function')) {
                delete filter["timeZone"];
            }
            if ((filter.dateFrom && typeof filter.dateFrom.getMonth === 'function')) {
                filter.dateFrom = moment(filter.dateFrom).tz(vm.userPreferences.zone)._d;
            }
            if ((filter.dateTo && typeof filter.dateTo.getMonth === 'function')) {
                filter.dateTo = moment(filter.dateTo).tz(vm.userPreferences.zone)._d;
            }

            YadeService.getTransfers(filter).then(function (res) {
                vm.fileTransfers = res.transfers;
                vm.loading = false;
                isLoaded = true;
            }, function () {
                vm.loading = false;
                isLoaded = true;
            });
        };

        vm.protocols = YadeService.getProtocols();

        vm.advancedSearch = function () {
            vm.isUnique = true;
            vm.showSearchPanel = true;
            vm.yadeSearch.date = 'date';
            vm.yadeSearch.from = new Date();
            vm.yadeSearch.fromTime = '00:00';
            vm.yadeSearch.to = new Date();
            vm.yadeSearch.toTime =  moment().format("HH:mm");
        };

        vm.cancel = function (form) {
            vm.yadeSearch = {};
            vm.yadeSearch.date = 'date';
            vm.showSearchPanel = false;
            if (!vm.yadeFilters.filter.states) {
                vm.yadeFilters.filter.states = 'all';
            }
            if (!vm.yadeFilters.filter.date) {
                vm.yadeFilters.filter.date = 'today';
            }

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
            vm.isUnique = true;
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
                filter.shared = vm.yadeFilter.shared;
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
                var filelds = [];
                angular.forEach(vm.object.files, function (file) {
                    if (value.id == file.transferId)
                        filelds.push(file.id);
                });
                obj.transfers.push({transferId: value.id, filelds: filelds});
            });

            var modalInstance = {};
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = '';
                vm.comments.operation = 'Restart';
                vm.comments.type = 'File transfer';

                angular.forEach(vm.object.fileTransfers, function (value, index) {
                    if (index == vm.object.fileTransfers.length - 1) {
                        vm.comments.name = vm.comments.name + ' ' + value.id;
                    } else {
                        vm.comments.name = value.id + ', ' + vm.comments.name;
                    }
                });

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
            if(vm.object.files && vm.object.files.length > 0) {
                obj.fileIds = [];
                angular.forEach(vm.object.files, function (val) {
                    if(transfer.id == val.transferId){
                        obj.fileIds.push(val.id);
                    }
                });
            }
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
                order = _.merge(order, res.orders[0]);
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
                for (let i = 0; i < vm.events[0].eventSnapshots.length; i++) {
                    if (vm.events[0].eventSnapshots[i].objectType == 'OTHER') {
                        if (vm.events[0].eventSnapshots[i].eventType == 'YADETransferStarted') {
                           vm.load();
                            break;
                        }else if(vm.events[0].eventSnapshots[i].eventType == 'YADETransferUpdated'){
                            for(let x=0; x<vm.fileTransfers.length;x++){
                                if(vm.fileTransfers[x].id ==vm.events[0].eventSnapshots[i].path ){
                                    getTransfer(vm.fileTransfers[x]);
                                    break;
                                }
                            }
                        }else if(vm.events[0].eventSnapshots[i].eventType == 'YADEFileStateChanged'){
                            for(let x=0; x<vm.fileTransfers.length;x++){
                                if(vm.fileTransfers[x].id == vm.events[0].eventSnapshots[i].path && vm.fileTransfers[x].show ){
                                    getFiles(vm.fileTransfers[x]);
                                    break;
                                }
                            }
                        }
                    }
                }
        });
    }

    YadeOverviewCtrl.$inject = ["$scope","$rootScope", "CoreService", "YadeService","OrderService", "$uibModal",  "$stateParams", "AuditLogService", "TaskService", "SavedFilter"];
    function YadeOverviewCtrl($scope,$rootScope, CoreService, YadeService, OrderService, $uibModal, $stateParams, AuditLogService, TaskService, SavedFilter) {
        var vm = $scope;
        vm.orderFilters = CoreService.getYadeDetailTab();
        vm.maxEntryPerPage = vm.userPreferences.maxEntryPerPage;

        vm.allOrders = [];
        vm.orderFilters.filter.state = $stateParams.name;
        vm.isLoaded = true;
        vm.object = {};
        $scope.reloadState = 'no';
        vm.reset = function () {
            vm.object = {};
        };

        vm.reload = function () {
            if (vm.reloadState === 'no') {
                vm.allOrders = [];
                vm.folderPath = 'Process aborted';
                vm.reloadState = 'yes';
            } else if (vm.reloadState === 'yes') {
                vm.reloadState = 'no';
                vm.isLoading = false;
                vm.init();
            }
        };

        vm.init = function () {
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.compact = true;
            obj.processingStates = [];
            if (vm.orderFilters.filter.state !== 'ALL') {
                obj.processingStates.push(vm.orderFilters.filter.state);
            }else{
                obj.processingStates = ["SUSPENDED","RUNNING","SETBACK","WAITINGFORRESOURCE"];
            }
            vm.status = vm.orderFilters.filter.state;
            YadeService.yadeOrders(obj).then(function (res) {
                angular.forEach(res.orders, function (value) {
                    value.path1 = value.jobChain.substring(1, value.jobChain.lastIndexOf('/'));
                });
                vm.allOrders = res.orders;
                vm.isLoading = true;
                vm.isLoaded = false;
                setTimeout(function () {
                    updatePanelHeight();
                },0);
            }, function () {
                vm.isLoading = true;
                vm.isError = true;
                vm.isLoaded = false;
            });
        };
        vm.init();

        vm.showLogFuc = function (value, skip, toggle) {
            let orders = {
                jobschedulerId: vm.schedulerIds.selected,
                limit: vm.userPreferences.maxNumInOrderOverviewPerObject
            };
            vm.isAuditLog = false;
            if (!toggle) {
                if (vm.userPreferences.historyTab === 'order' || skip) {
                    vm.isTaskHistory = false;
                } else {
                    vm.showJobHistory(value);
                    return;
                }
            } else {
                vm.showJobHistory(value, toggle);
                return;
            }
            if (value.historyId) {
                if (vm.userPreferences.maxNumInOrderOverviewPerObject < 2) {
                    orders.historyIds = [value.historyId];
                }
            }
            orders.orders = [];
            orders.orders.push({orderId: value.orderId, jobChain: value.jobChain});
            OrderService.histories(orders).then(function (res) {
                vm.historys = res.history;
            });
            vm.showLogPanel = value;
            vm.orderFilters.showLogPanel = vm.showLogPanel;
        };

        vm.showJobHistory = function (order, toggle) {
            vm.showLogPanel = order;
            vm.isTaskHistory = true;
            vm.isAuditLog = false;
            let obj = {jobschedulerId: vm.schedulerIds.selected};
            obj.limit = vm.userPreferences.maxHistoryPerTask;
            if (order.processingState._text === 'RUNNING' || order.processingState._text === 'SUSPENDED' || order.processingState._text === 'SETBACK') {
                obj.historyIds = [];
                obj.historyIds.push({historyId: order.historyId, state: order.state});
            } else if (toggle) {
                obj.orders = [{jobChain: order.jobChain, state: order.state}];
            } else {
                obj.orders = [{jobChain: order.jobChain, orderId: order.orderId}];
            }
            TaskService.histories(obj).then(function (res) {
                vm.showLogPanel.taskHistory = res.history;
            }, function () {
                vm.showLogPanel.taskHistory = [];
            })
        };

        function loadAuditLogs(obj) {
            obj.limit = parseInt(vm.userPreferences.maxAuditLogPerObject);
            AuditLogService.getLogs(obj).then(function (result) {
                if (result && result.auditLog) {
                    vm.auditLogs = result.auditLog;
                }
            }, function () {
                vm.auditLogs = [];
            });
        }

        vm.showAuditLogs = function (value) {
            vm.showLogPanel = value;
            vm.orderFilters.showLogPanel = vm.showLogPanel;
            vm.isAuditLog = true;
            let obj = {};
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

        vm.showPanelFuc1 = function (order) {
            order.show = true;
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = vm.schedulerIds.selected;
            orders.orders.push({orderId: order.orderId, jobChain: order.path.split(',')[0]});
            OrderService.get(orders).then(function (res) {
                order = _.merge(order, res.orders[0]);
                updatePanelHeight();
            });
        };

        vm.hidePanelFuc = function (order) {
            order.show = false;
            setTimeout(function () {
                updatePanelHeight();
            }, 1)
        };

        $scope.$on("yadeState", function (evt, state) {
            vm.orderFilters.filter.state = state;
            vm.status = state;
            if (state) {
                var obj = {};
                obj.jobschedulerId = $scope.schedulerIds.selected;
                obj.compact = true;
                if (vm.orderFilters.filter.state && vm.orderFilters.filter.state !== 'ALL') {
                    obj.processingStates = [];
                    obj.processingStates.push(vm.orderFilters.filter.state);
                }else {
                    if (vm.orderFilters.filter.state === 'ALL') {
                        obj.processingStates = ["SUSPENDED", "RUNNING", "SETBACK", "WAITINGFORRESOURCE"];
                    }
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
                        if (vm.orderFilters.filter.state !== 'ALL') {
                            obj.processingStates.push(vm.orderFilters.filter.state);
                        }else{
                            obj.processingStates = ["SUSPENDED","RUNNING","SETBACK","WAITINGFORRESOURCE"];
                        }
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
                    if (vm.showLogPanel && vm.events[0].eventSnapshots[i].eventType == "AuditLogChanged" && vm.events[0].eventSnapshots[i].objectType === "ORDER" && vm.events[0].eventSnapshots[i].path === vm.showLogPanel.path && vm.isAuditLog) {
                        var obj = {};
                        obj.jobschedulerId = vm.schedulerIds.selected;
                        obj.orders = [];
                        obj.orders.push({jobChain: vm.showLogPanel.jobChain, orderId: vm.showLogPanel.orderId});
                        loadAuditLogs(obj);
                    }
                    if (vm.showLogPanel && vm.events[0].eventSnapshots[i].eventType === "ReportingChangedOrder" && vm.events[0].eventSnapshots[i].objectType === "ORDER" && vm.orderFilters.filter.state === 'ALL' && !vm.isTaskHistory && !vm.isAuditLog) {
                        let orders = {
                            jobschedulerId: vm.schedulerIds.selected,
                            limit: vm.userPreferences.maxNumInOrderOverviewPerObject
                        };
                        if (vm.showLogPanel.historyId) {
                            if (vm.userPreferences.maxNumInOrderOverviewPerObject < 2) {
                                orders.historyIds = [vm.showLogPanel.historyId];
                            }
                        }
                        orders.orders = [];
                        orders.orders.push({orderId: vm.showLogPanel.orderId, jobChain: vm.showLogPanel.jobChain});
                        OrderService.histories(orders).then(function (res) {
                            vm.historys = res.history;
                        });
                    }
                    if (vm.showLogPanel && vm.events[0].eventSnapshots[i].eventType === "ReportingChangedJob" && vm.events[0].eventSnapshots[i].objectType === "JOB" && vm.orderFilters.filter.state === 'ALL' && vm.isTaskHistory) {
                        let obj = {jobschedulerId: vm.schedulerIds.selected};
                        obj.limit = vm.userPreferences.maxHistoryPerTask;
                        if (vm.showLogPanel.processingState._text === 'RUNNING' || vm.showLogPanel.processingState._text === 'SUSPENDED' || vm.showLogPanel.processingState._text === 'SETBACK') {
                            obj.historyIds = [];
                            obj.historyIds.push({historyId: vm.showLogPanel.historyId, state: vm.showLogPanel.state});
                        } else {
                            obj.orders = [{jobChain: vm.showLogPanel.jobChain, orderId: vm.showLogPanel.orderId}];
                        }
                        TaskService.histories(obj).then(function (res) {
                            vm.showLogPanel.taskHistory = res.history;
                        })
                    }
                }
        });

        vm.isSizeChange = false;
        let rsHt = JSON.parse(SavedFilter.resizerHeight) || {};
        if (!_.isEmpty(rsHt) && rsHt.yadeOrderOverview) {
            vm.resizerHeight = rsHt.yadeOrderOverview;
            vm.isSizeChange = true;
        }

        function updatePanelHeight() {
            if (!vm.isSizeChange) {
                let rsHt = JSON.parse(SavedFilter.resizerHeight) || {};
                if (!_.isEmpty(rsHt) && rsHt.yadeOrderOverview) {
                    vm.resizerHeight = rsHt.yadeOrderOverview;
                } else {
                    _updatePanelHeight();
                }
            }
        }

        function _updatePanelHeight() {
            setTimeout(function () {
                let ht = (parseInt($('#orderTableId').height()) + 50);
                let el = document.getElementById('orderDivId');
                if (el && el.scrollWidth > el.clientWidth) {
                    ht = ht + 11;
                }
                if (ht > 450) {
                    ht = 450;
                }
                vm.resizerHeight = ht + 'px';
                $('#orderDivId').css('height', vm.resizerHeight);
            }, 5);
        }

        vm.resetPanel = function () {
            let rsHt = JSON.parse(SavedFilter.resizerHeight) || {};
            rsHt.yadeOrderOverview = undefined;
            vm.isSizeChange = false;
            SavedFilter.setResizerHeight(rsHt);
            SavedFilter.save();
            _updatePanelHeight();
        };

        $scope.$on('angular-resizable.resizeEnd', function (event, args) {
            if (args.id === 'orderDivId') {
                let rsHt = JSON.parse(SavedFilter.resizerHeight) || {};
                rsHt.yadeOrderOverview = args.height;
                vm.isSizeChange = true;
                SavedFilter.setResizerHeight(rsHt);
                SavedFilter.save();
                vm.resizerHeight = args.height;
            }
        });
    }

})();
