/**
 * Created by sourabhagrawal on 31/05/16.
 */
(function () {
    'use strict';
    angular
        .module('app')
        .controller('JobChainCtrl', JobChainCtrl)
        .controller('JobCtrl', JobCtrl)
        .controller('JobOverviewCtrl', JobOverviewCtrl);

    JobChainCtrl.$inject = ["$scope", "JobChainService", "OrderService", "JobService", "UserService", "$location", "SOSAuth", "$uibModal", "orderByFilter", "ScheduleService", "SavedFilter",
        "DailyPlanService", "$rootScope", "CoreService", "$timeout", "TaskService", "$window", "AuditLogService"];
    function JobChainCtrl($scope, JobChainService, OrderService, JobService, UserService, $location, SOSAuth, $uibModal, orderBy, ScheduleService, SavedFilter,
                          DailyPlanService, $rootScope, CoreService, $timeout, TaskService, $window, AuditLogService) {
        var vm = $scope;
        vm.jobChainFilters = CoreService.getJobChainTab();
        vm.maxEntryPerPage = vm.userPreferences.maxEntryPerPage;

        vm.object = {};
        vm.isUnique = true;
        vm.tree = [];
        vm.allJobChains = [];
        vm.my_tree = {};

        vm.filter_tree = {};
        vm.filterTree1 = [];
        vm.object.paths = [];
        vm.temp_filter = {};

        var modalInstance;
        vm.selectedFiltered;

        var firstDay;
        var lastDay;

        function mergePermanentAndVolatile(sour, dest) {
            dest.numOfOrders = sour.numOfOrders;
            dest.numOfNodes = sour.numOfNodes;
            dest.state = sour.state;
            if(!dest.nodes && sour.nodes){
                dest.nodes = sour.nodes;
            }else if(dest.nodes && sour.nodes){
                for(var i = 0; i< dest.nodes.length;i++){
                    for(var j = 0; j< sour.nodes.length;j++){
                        if((dest.nodes[i].name == sour.nodes[j].name) && (dest.nodes[i].job.path == sour.nodes[j].job.path) ){
                            sour.nodes[j].job.processClass = dest.nodes[i].job.processClass;
                            dest.nodes[i] = sour.nodes[j];
                            sour.nodes.splice(j,1);
                            break;
                        }
                    }
                }
            }

            dest.configurationStatus = sour.configurationStatus;
            dest.ordersSummary = sour.ordersSummary;
            dest.fileOrderSources = sour.fileOrderSources;
            dest.nestedJobChains = sour.nestedJobChains;
            return dest;
        }

        vm.savedJobChainFilter = JSON.parse(SavedFilter.jobChainFilters) || {};
        vm.jobChainFilterList = [];

        if (vm.jobChainFilters.selectedView) {
            vm.savedJobChainFilter.selected = vm.savedJobChainFilter.selected || vm.savedJobChainFilter.favorite;
        }
        else {
            vm.savedJobChainFilter.selected = undefined;
        }

        $rootScope.$on('event-jobChains', function (event, values) {
            $rootScope.expand_to = values;
        });

        vm.expanding_property = {
            field: "name"
        };
        if ($location.search().scheduler_id && $location.search().path) {
            vm.checkSchedulerId();
            getJobChainByPath($location.search().path);
        } else {
            checkSharedFilters();
        }

        function getJobChainByPath(path) {
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.compact = true;
            obj.jobChains = [{jobChain: path}];
            JobChainService.getJobChainsP(obj).then(function (result) {
                vm.jobChains = result.jobChains;
                getJobChainByPathV(obj);
                vm.isLoading = true;
            }, function () {
                getJobChainByPathV(obj);
                vm.isLoading = true;
            });
        }

        function getJobChainByPathV(obj) {
            obj.maxOrders = vm.userPreferences.maxOrderPerJobchain;
            JobChainService.get(obj).then(function (res) {
                if (vm.jobChains) {
                    vm.jobChains[0] = mergePermanentAndVolatile(res.jobChains[0], vm.jobChains[0]);
                } else {
                    vm.jobChains = res.jobChains;
                }
                if(vm.showHistoryImmeditaly){

                    vm.showHistory(vm.jobChains[0]);
                }
            });
        }

        function checkSharedFilters() {
            if (vm.permission.JOCConfigurations.share.view) {
                var obj = {};
                obj.jobschedulerId = vm.schedulerIds.selected;
                obj.configurationType = "CUSTOMIZATION";
                obj.objectType = "JOBCHAIN";
                obj.shared = true;
                UserService.configurations(obj).then(function (res) {
                    if (res.configurations && res.configurations.length > 0)
                        vm.jobChainFilterList = res.configurations;
                    getCustomizations();
                }, function () {
                    getCustomizations();
                });
            } else {
                getCustomizations();
            }
        }

        function getCustomizations() {

            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.account = vm.permission.user;
            obj.configurationType = "CUSTOMIZATION";
            obj.objectType = "JOBCHAIN";
            UserService.configurations(obj).then(function (res) {

                if (vm.jobChainFilterList && vm.jobChainFilterList.length > 0) {
                    if (res.configurations && res.configurations.length > 0) {
                        vm.jobChainFilterList = vm.jobChainFilterList.concat(res.configurations);
                    }
                    var data = [];
                    for (var i = 0; i < vm.jobChainFilterList.length; i++) {
                        var flag = true;
                        for (var j = 0; j < data.length; j++) {
                            if (data[j].id == vm.jobChainFilterList[i].id) {
                                flag = false;
                            }
                        }
                        if (flag) {
                            data.push(vm.jobChainFilterList[i]);
                        }
                    }
                    vm.jobChainFilterList = data;
                } else {
                    vm.jobChainFilterList = res.configurations;
                }

                if (vm.savedJobChainFilter.selected) {
                    var flag = true;
                    angular.forEach(vm.jobChainFilterList, function (value) {
                        if (value.id == vm.savedJobChainFilter.selected) {
                            flag = false;
                            UserService.configuration({
                                jobschedulerId: value.jobschedulerId,
                                id: value.id
                            }).then(function (conf) {
                                vm.selectedFiltered = JSON.parse(conf.configuration.configurationItem);
                                vm.selectedFiltered.account = value.account;
                                initTree();
                            });
                        }
                    });
                    if (flag) {
                        vm.savedJobChainFilter.selected = undefined;
                        initTree();
                    }
                } else {
                    vm.savedJobChainFilter.selected = undefined;
                    initTree();
                }

            }, function () {
                vm.savedJobChainFilter.selected = undefined;
                initTree();
            })
        }

        function isCustomizationSelected(flag) {

            if (flag) {
                vm.temp_filter.state = angular.copy(vm.jobChainFilters.filter.state);
                vm.jobChainFilters.filter.state = '';
            } else {
                if (vm.temp_filter.state)
                    vm.jobChainFilters.filter.state = angular.copy(vm.temp_filter.state);
                else
                    vm.jobChainFilters.filter.state = 'ALL';

            }
        }

        /**
         * Function to initialized tree view
         */
        function initTree() {
            if (vm.selectedFiltered && vm.selectedFiltered.paths && vm.selectedFiltered.paths.length > 0) {
                var folders = [];
                for (var i = 0; i < vm.selectedFiltered.paths.length; i++) {
                    folders.push({folder: vm.selectedFiltered.paths[i]});
                }
            }
            if (vm.selectedFiltered) {
                isCustomizationSelected(true);
            }

            JobChainService.tree({
                jobschedulerId: vm.schedulerIds.selected,
                compact: true,
                folders: folders,
                types: ['JOBCHAIN']
            }).then(function (res) {

                if ($rootScope.expand_to) {
                    vm.tree = angular.copy(res.folders);
                    filteredTreeData();
                } else {
                    if (vm.isEmpty(vm.jobChainFilters.expand_to)) {
                        vm.tree = angular.copy(res.folders);
                        filteredTreeData();
                    } else {
                        vm.jobChainFilters.expand_to = vm.recursiveTreeUpdate(angular.copy(res.folders), vm.jobChainFilters.expand_to);
                        vm.tree = vm.jobChainFilters.expand_to;
                        vm.changeStatus();
                    }
                }
                vm.jobChainFilters.expand_to = vm.tree;
                vm.isLoading = true;
            }, function () {
                vm.isLoading = true;
            });
        }

        vm.$on('reloadObject', function () {
            navFullTree();
            filteredTreeData();
        });

        vm.treeHandler = function (data) {

            vm.reset();
            navFullTree();
            if (vm.showHistoryPanel && (vm.showHistoryPanel.path1 != data.path)) {
                vm.showHistoryPanel = '';
            }
            data.selected1 = true;
            data.jobChains = [];
            vm.allJobChains = [];
            vm.loading = true;
            expandFolderData(data);


        };
        vm.treeHandler1 = function (data) {
            if (data.expanded) {
                data.folders = orderBy(data.folders, 'name');
            }

        };
        vm.expandNode = function (data) {
            vm.reset();
            navFullTree();
            if (vm.showHistoryPanel && (vm.showHistoryPanel.path1 != data.path)) {
                vm.showHistoryPanel = '';
            }
            vm.allJobChains = [];
            vm.loading = true;
            vm.folderPath = data.name || '/';

            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.compact = true;
            if (vm.selectedFiltered) {
                obj.regex = vm.selectedFiltered.regex;
            }
            obj.folders = [];
            obj.folders.push({folder: data.path, recursive: true});
            JobChainService.getJobChainsP(obj).then(function (result) {
                vm.jobChains = result.jobChains;
                volatileInformation(obj, data);
            }, function () {
                volatileInformation(obj, data);
            });
        };

        vm.collapseNode = function (data) {
            function recursive(data) {
                data.expanded = !1;
                for (var i = 0; i < data.folders.length; i++) {
                    data.folders[i].expanded = !1;
                    if (data.folders[i].folders.length > 0) {
                        for (var j = 0; j < data.folders[i].folders.length; j++) {
                            recursive(data.folders[i].folders[j]);
                        }
                    }
                }
            }

            recursive(data);
        };


        function startTraverseNode(data) {
            vm.allJobChains = [];
            function recursive(data) {
                data.expanded = true;
                data.folders = orderBy(data.folders, 'name');

                data.jobChains = [];
                for (var i = 0; i < vm.jobChains.length; i++) {
                    if (data.path == vm.jobChains[i].path.substring(0, vm.jobChains[i].path.lastIndexOf('/')) || data.path == vm.jobChains[i].path.substring(0, vm.jobChains[i].path.lastIndexOf('/') + 1)) {
                        data.jobChains.push(vm.jobChains[i]);
                        vm.jobChains[i].path1 = data.path;
                        vm.allJobChains.push(vm.jobChains[i]);
                    }
                }
                data.selected1 = true;
                for (var j = 0; j < data.folders.length; j++) {
                    recursive(data.folders[j]);

                }
            }

            recursive(data);
        }

        function expandFolderData(data) {
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.compact = true;
            if (vm.selectedFiltered) {
                obj.regex = vm.selectedFiltered.regex;
            }
            obj.folders = [
                {folder: data.path, recursive: false}
            ];

            JobChainService.getJobChainsP(obj).then(function (result) {
                if (data.jobChains && data.jobChains.length > 0) {
                    angular.forEach(result.jobChains, function (newValue, index) {
                        for (var i = 0; i < data.jobChains.length; i++) {
                            if (newValue.path == data.jobChains[i].path) {
                                result.jobChains[index].path1 = data.jobChains[i].path1;
                                result.jobChains[index].show = data.jobChains[i].show;
                                data.jobChains.splice(i, 1);
                                break;
                            }
                        }
                    });
                }
                data.jobChains = result.jobChains;
                volatileFolderData(data, obj);
            }, function () {
                volatileFolderData(data, obj);
            });
        }

        function expandFolderData1(data) {
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            //obj.compact = true;
            if (vm.selectedFiltered) {
                obj.regex = vm.selectedFiltered.regex;
            }
            obj.folders = [
                {folder: data.path, recursive: false}
            ];

            JobChainService.getJobChainsP(obj).then(function (result) {
                if (data.jobChains && data.jobChains.length > 0) {
                    angular.forEach(result.jobChains, function (newValue, index) {
                        for (var i = 0; i < data.jobChains.length; i++) {
                            if (newValue.path == data.jobChains[i].path) {
                                result.jobChains[index].path1 = data.jobChains[i].path1;
                                result.jobChains[index].show = data.jobChains[i].show;
                                data.jobChains.splice(i, 1);
                                if (result.jobChains[index].show) {
                                    obj.compact = false;
                                }
                                break;
                            }
                        }
                    });
                }
                data.jobChains = result.jobChains;
                volatileFolderData1(data, obj);
            }, function () {
                volatileFolderData1(data, obj);
            });
        }

        function volatileFolderData(data, obj) {
            if (vm.scheduleState == 'UNREACHABLE') {
                if (data.jobChains.length > 0) {
                    angular.forEach(data.jobChains, function (value) {
                        var flag = true;
                        value.path1 = data.path;

                        for (var i = 0; i < vm.allJobChains.length; i++) {
                            if (value.path == vm.allJobChains[i].path) {
                                flag = false;
                                break;
                            }
                        }
                        if (flag)
                            vm.allJobChains.push(value);
                    });
                }
                vm.folderPath = data.name || '/';
                vm.loading = false;
                return;
            }
            if (vm.selectedFiltered && vm.selectedFiltered.state) {
                obj.states = vm.selectedFiltered.state;
            } else {
                if (vm.jobChainFilters.filter.state != 'ALL') {
                    obj.states = [];
                    obj.states.push(vm.jobChainFilters.filter.state);
                }
            }

            if (vm.userPreferences.showOrders) {
                obj.compact = false;
            }
            obj.maxOrders = vm.userPreferences.maxOrderPerJobchain;
            JobChainService.get(obj).then(function (res) {

                var data1 = [];
                if (data.jobChains && data.jobChains.length > 0) {
                    angular.forEach(data.jobChains, function (jobChain) {
                        if (vm.userPreferences.showOrders)
                            jobChain.show = true;
                        if (res.nestedJobChains)
                            jobChain.nestedJobChains = res.nestedJobChains;

                        for (var i = 0; i < res.jobChains.length; i++) {
                            var flag1 = true;
                            if (jobChain.path == res.jobChains[i].path) {
                                jobChain = mergePermanentAndVolatile(res.jobChains[i], jobChain);

                                if (vm.selectedFiltered && vm.selectedFiltered.agentName && jobChain.processClass) {
                                    if (!jobChain.processClass.match(vm.selectedFiltered.agentName)) {
                                        flag1 = false;
                                    }
                                }
                                if (flag1)
                                    data1.push(jobChain);
                                res.jobChains.splice(i, 1);
                                break;
                            }
                        }
                    });

                } else {
                    angular.forEach(res.jobChains, function (jobChainData) {
                        if (vm.userPreferences.showOrders)
                            jobChainData.show = true;
                        jobChainData.nestedJobChains = res.nestedJobChains;
                        var flag1 = true;
                        if (vm.selectedFiltered && vm.selectedFiltered.agentName && jobChains.processClass) {
                            if (!jobChains.processClass.match(vm.selectedFiltered.agentName)) {
                                flag1 = false;
                            }
                        }
                        if (flag1)
                            data1.push(jobChainData);
                    })

                }
                data.jobChains = data1;

                if (data.jobChains.length > 0) {
                    angular.forEach(data.jobChains, function (value) {
                        var flag = true;
                        value.path1 = data.path;

                        for (var i = 0; i < vm.allJobChains.length; i++) {
                            if (value.path == vm.allJobChains[i].path) {
                                flag = false;
                                break;
                            }

                        }
                        if (flag)
                            vm.allJobChains.push(value);
                    });
                }

                vm.folderPath = data.name || '/';


                vm.loading = false;
            }, function () {

                if (data.jobChains.length > 0) {
                    angular.forEach(data.jobChains, function (value) {
                        var flag = true;
                        value.path1 = data.path;

                        for (var i = 0; i < vm.allJobChains.length; i++) {
                            if (value.path == vm.allJobChains[i].path) {
                                flag = false;
                                break;
                            }
                        }
                        if (flag)
                            vm.allJobChains.push(value);
                    });
                }
                vm.folderPath = data.name || '/';
                vm.loading = false;
            });
        }

        function volatileFolderData1(data, obj) {
            if (vm.scheduleState == 'UNREACHABLE') {
                var temp = [];
                if (data.jobChains.length > 0) {

                    for (var x = 0; x < vm.allJobChains.length; x++) {
                        if (vm.allJobChains[x].path1 != data.path) {
                            temp.push(vm.allJobChains[x]);
                        }
                    }
                    angular.forEach(data.jobChains, function (value) {
                        value.path1 = data.path;
                        temp.push(value);
                    });
                }
                vm.allJobChains = angular.copy(temp);
                vm.folderPath = data.name || '/';
                vm.loading = false;
                return;
            }
            if (vm.selectedFiltered && vm.selectedFiltered.state) {
                obj.states = vm.selectedFiltered.state;
            } else {
                if (vm.jobChainFilters.filter.state != 'ALL') {
                    obj.states = [];
                    obj.states.push(vm.jobChainFilters.filter.state);
                }
            }

            if (vm.userPreferences.showOrders) {
                obj.compact = false;
            }
            obj.maxOrders = vm.userPreferences.maxOrderPerJobchain;
            JobChainService.get(obj).then(function (res) {
                var data1 = [];
                if (data.jobChains && data.jobChains.length > 0) {
                    angular.forEach(data.jobChains, function (jobChain) {
                        jobChain.nestedJobChains = res.nestedJobChains;
                        for (var i = 0; i < res.jobChains.length; i++) {
                            var flag1 = true;
                            if (jobChain.path == res.jobChains[i].path) {

                                jobChain = mergePermanentAndVolatile(res.jobChains[i], jobChain);
                                if (vm.selectedFiltered && vm.selectedFiltered.agentName && jobChain.processClass) {
                                    if (!jobChain.processClass.match(vm.selectedFiltered.agentName)) {
                                        flag1 = false;
                                    }
                                }
                                if (flag1)
                                    data1.push(jobChain);
                                res.jobChains.splice(i, 1);
                                break;
                            }
                        }
                    });
                } else {
                    angular.forEach(res.jobChains, function (jobChainData) {
                        var flag1 = true;
                        if (vm.userPreferences.showOrders)
                            jobChainData.show = true;
                        jobChainData.nestedJobChains = res.nestedJobChains;
                        if (vm.selectedFiltered && vm.selectedFiltered.agentName && jobChains.processClass) {
                            if (!jobChains.processClass.match(vm.selectedFiltered.agentName)) {
                                flag1 = false;
                            }
                        }
                        if (flag1)
                            data1.push(jobChainData);
                    })

                }
                data.jobChains = data1;
                var temp = [];
                if (data.jobChains.length > 0) {
                    for (var x = 0; x < vm.allJobChains.length; x++) {
                        if (vm.allJobChains[x].path1 != data.path) {
                            temp.push(vm.allJobChains[x]);
                        }
                    }
                    angular.forEach(data.jobChains, function (value) {
                        for (var x = 0; x < temp.length; x++) {
                            if (temp[x].path1 == data.path && temp[x].path == value.path) {
                                temp[x].splice(x, 1);
                                break;
                            }
                        }
                        value.path1 = data.path;
                        temp.push(value);
                    });
                }
                vm.allJobChains = angular.copy(temp);
                vm.folderPath = data.name || '/';


                vm.loading = false;
            }, function () {
                var temp = [];
                if (data.jobChains.length > 0) {

                    for (var x = 0; x < vm.allJobChains.length; x++) {
                        if (vm.allJobChains[x].path1 != data.path) {
                            temp.push(vm.allJobChains[x]);
                        }
                    }
                    angular.forEach(data.jobChains, function (value) {
                        value.path1 = data.path;
                        temp.push(value);
                    });
                }
                vm.allJobChains = angular.copy(temp);
                vm.folderPath = data.name || '/';
                vm.loading = false;
            });
        }

        function navFullTree() {
            for (var i = 0; i < vm.tree.length; i++) {
                vm.tree[i].selected1 = false;
                if (vm.tree[i].expanded) {
                    traverseTree1(vm.tree[i]);
                }
            }
        }
        function traverseTree1(data) {
            for (var i = 0; i < data.folders.length; i++) {
                data.folders[i].selected1 = false;
                if (data.folders[i].expanded) {
                    traverseTree1(data.folders[i]);
                }
            }
        }

        var count = 1, splitPath = [];
        function checkExpand(data) {
            if (data.selected1) {
                if (!data.jobChains) {
                    data.jobChains = [];
                }
                expandFolderData(data);
                vm.folderPath = data.name || '/';

                angular.forEach(data.jobChains, function (a) {
                    a.path1 = data.path;
                    vm.allJobChains.push(a);
                });
            }
            if (data.folders && data.folders.length > 0) {
                data.folders = orderBy(data.folders, 'name');
                for (var x = 0; x < data.folders.length; x++) {
                    if (vm.expand_to) {

                        if (vm.flag && data.folders[x].path.substring(1, data.folders[x].path.length) == splitPath[count] && count < splitPath.length) {
                            count = count + 1;
                            splitPath[count] = splitPath[count - 1] + '/' + splitPath[count];

                            data.folders[x].expanded = true;
                            if (vm.expand_to.name == data.folders[x].name) {
                                data.folders[x].selected1 = true;
                                vm.flag = false;
                                count = 1;
                                splitPath = [];

                            }
                        }
                    }
                    checkExpand(data.folders[x]);
                    if (data.folders[x].expanded || data.folders[x].selected1) {
                        if (data.path == '/') {
                            data.selected1 = false;
                        }
                    }
                }
            }
        }

        function filteredTreeData() {
            for (var i = 0; i < vm.tree.length; i++) {
                if ($rootScope.expand_to) {
                    vm.expand_to = angular.copy($rootScope.expand_to);
                    splitPath = vm.expand_to.path.split('/');
                    $rootScope.expand_to = '';
                    vm.flag = true;
                }
                if (splitPath.length < 2) {
                    vm.tree[i].selected1 = true;
                }
                vm.tree[i].expanded = true;

                vm.allJobChains = [];
                checkExpand(vm.tree[i]);
            }
        }

        function checkExpandTreeForUpdates(data) {
            if (data.selected1) {
                obj.folders.push({folder: data.path, recursive: false});
                obj1.folders.push({folder: data.path, recursive: false});
                vm.folderPath = data.name || '/';
            }

            data.folders = orderBy(data.folders, 'name');
            angular.forEach(data.folders, function (value) {
                if (value.expanded || value.selected1)
                    checkExpandTreeForUpdates(value);
            });
        }

        function insertData(node, x) {
            var _temp = angular.copy(node.jobChains);
            node.jobChains = [];
            for (var i = 0; i < x.length; i++) {
                if (node.path == x[i].path.substring(0, x[i].path.lastIndexOf('/')) || (x[i].path.substring(0, x[i].path.lastIndexOf('/') + 1) == node.path)) {
                    x[i].path1 = node.path;
                    if(_temp && _temp.length>0){
                        for(var j=0; j < _temp.length;j++){
                            if(_temp[j].path == x[i].path){
                                 x[i].show = _temp[j].show;
                                break;
                            }
                        }
                    }
                    node.jobChains.push(x[i]);
                    vm.allJobChains.push(x[i]);
                }
            }
            angular.forEach(node.folders, function (value) {
                if (value.expanded || value.selected1)
                    insertData(value, x);
            });
        }

        function mergeJobChainData(object, expandNode) {
            if (vm.selectedFiltered) {
                var data = [];
                angular.forEach(object, function (res) {
                    var flag = true;
                    if (vm.selectedFiltered.agentName && res.processClass) {
                        if (!res.processClass.match(vm.selectedFiltered.agentName)) {
                            flag = false;
                        }
                    }
                    if (flag)
                        data.push(res);
                });
                vm.jobChains = data;
            }
            if (expandNode) {
                startTraverseNode(expandNode);
            }
        }

        function volatileInformation(obj, expandNode) {
            if (vm.selectedFiltered && vm.selectedFiltered.state) {
                obj.states = vm.selectedFiltered.state;
            } else {
                if (vm.jobChainFilters.filter.state != 'ALL') {
                    obj.states = [];
                    obj.states.push(vm.jobChainFilters.filter.state);
                }
            }
            if (vm.userPreferences.showOrders) {
                obj.compact = false;
            }
            obj.maxOrders = vm.userPreferences.maxOrderPerJobchain;
            JobChainService.get(obj).then(function (res) {
                var data = [];
                if (vm.jobChains && vm.jobChains.length > 0) {
                    angular.forEach(vm.jobChains, function (jobChains) {
                        if (vm.userPreferences.showOrders)
                            jobChains.show = true;
                        for (var i = 0; i < res.jobChains.length; i++) {
                            var flag1 = true;
                            if (jobChains.path == res.jobChains[i].path) {
                                jobChains = mergePermanentAndVolatile(res.jobChains[i], jobChains);
                                if (vm.selectedFiltered && vm.selectedFiltered.agentName && jobChains.processClass) {
                                    if (!jobChains.processClass.match(vm.selectedFiltered.agentName)) {
                                        flag1 = false;
                                    }
                                }
                                if (flag1) {
                                    data.push(jobChains);
                                }
                                res.jobChains.splice(i, 1);
                                break;
                            }
                        }
                    });
                } else {
                    angular.forEach(res.jobChains, function (jobChainData) {
                        if (vm.userPreferences.showOrders)
                            jobChainData.show = true;
                        var flag1 = true;
                        if (vm.selectedFiltered && vm.selectedFiltered.agentName && jobChains.processClass) {
                            if (!jobChains.processClass.match(vm.selectedFiltered.agentName)) {
                                flag1 = false;
                            }
                        }
                        if (flag1) {
                            data.push(jobChainData);
                        }

                    })
                }
                data = data.concat(res.jobChains);
                vm.jobChains = data;
                if (expandNode) {
                    startTraverseNode(expandNode);
                }
                vm.loading = false;
            }, function () {
                mergeJobChainData(vm.jobChains, expandNode);
                vm.loading = false;
            });
        }

        var obj = {};
        var obj1 = {};
        vm.changeStatus = function () {
            vm.showHistoryPanel = '';
            vm.allJobChains = [];
            vm.loading = true;
            obj = {};
            obj1 = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.folders = [];

            if (vm.selectedFiltered && vm.selectedFiltered.state) {
                obj.states = vm.selectedFiltered.state;
            } else {
                if (vm.jobChainFilters.filter.state != 'ALL') {
                    obj.states = [];
                    obj.states.push(vm.jobChainFilters.filter.state);
                }
            }
            if (vm.selectedFiltered) {
                obj.regex = vm.selectedFiltered.regex;
            }

            obj.compact = false;

            obj1.jobschedulerId = vm.schedulerIds.selected;
            //obj1.compact = true;
            obj1.folders = [];

            if (vm.selectedFiltered) {
                obj1.regex = vm.selectedFiltered.regex;
            }

            for (var i = 0; i < vm.tree.length; i++) {
                if (vm.tree[i].expanded || vm.tree[i].selected1)
                    checkExpandTreeForUpdates(vm.tree[i]);
            }
            obj.maxOrders = vm.userPreferences.maxOrderPerJobchain;


            JobChainService.getJobChainsP(obj1).then(function (result) {
                vm.allJobChains = [];
                if (vm.scheduleState == 'UNREACHABLE') {
                    angular.forEach(vm.tree, function (node) {
                        insertData(node, result.jobChains);
                    });
                    vm.loading = false;
                    return;
                }
                JobChainService.get(obj).then(function (res) {

                    if (result.jobChains && result.jobChains.length > 0) {
                        var x = [];
                        angular.forEach(result.jobChains, function (jobChain, index) {
                            for (var i = 0; i < res.jobChains.length; i++) {
                                var flag1 = true;
                                if (result.jobChains[index].path == res.jobChains[i].path) {
                                    result.jobChains[index] = angular.merge(result.jobChains[index], res.jobChains[i]);
                                    if (vm.selectedFiltered && vm.selectedFiltered.agentName && result.jobChains[index].processClass) {
                                        if (!result.jobChains[index].processClass.match(vm.selectedFiltered.agentName)) {
                                            flag1 = false;
                                        }
                                    }
                                    if (vm.userPreferences.showTasks && result.jobChains[index].show)
                                        angular.forEach(result.jobChains[index].nodes, function (val, index) {
                                            if (val.job && val.job.state && val.job.state._text == 'RUNNING') {
                                                JobService.get({
                                                    jobschedulerId: vm.schedulerIds.selected,
                                                    jobs: [{job: val.job.path}]
                                                }).then(function (res1) {
                                                    result.jobChains[index].nodes[index].job = angular.merge(result.jobChains[index].nodes[index].job, res1.jobs[0]);
                                                });
                                            }
                                        });
                                    if (flag1)
                                        x.push(result.jobChains[index]);
                                    res.jobChains.splice(i, 1);
                                    break;
                                }

                            }
                        });
                        angular.forEach(vm.tree, function (node) {
                            insertData(node, x);
                        })

                    } else {
                        angular.forEach(vm.tree, function (node) {
                            insertData(node, res.jobChains);
                        })
                    }

                    vm.loading = false;
                }, function () {
                    angular.forEach(vm.tree, function (node) {
                        insertData(node, result.jobChains);
                    });
                    vm.loading = false;
                });

            }, function () {
                JobChainService.get(obj).then(function (res) {
                    if (res.jobChains) {
                        vm.allJobChains = [];
                        angular.forEach(vm.tree, function (node) {
                            insertData(node, res.jobChains);
                        })
                    }
                    vm.loading = false;
                }, function () {
                    vm.loading = false;
                });
            });

        };
        vm.load = function () {
            initTree();
        };

        /**--------------- Checkbox functions -------------*/
        vm.jobChainCheckAll = {
            checkbox: false
        };

        var watcher1 = vm.$watchCollection('object.jobChains', function (newNames) {
            if (newNames && newNames.length > 0) {
                vm.jobChainCheckAll.checkbox = newNames.length == vm.allJobChains.slice((vm.userPreferences.entryPerPage * (vm.jobChainFilters.currentPage - 1)), (vm.userPreferences.entryPerPage * vm.jobChainFilters.currentPage)).length;
                vm.isStopped = false;
                vm.isUnstopped = false;
                angular.forEach(newNames, function (value) {
                    if (value.state && value.state._text == 'STOPPED') {
                        vm.isStopped = true;
                    } else {
                        vm.isUnstopped = true;
                    }
                    if (value.state && (value.state._text == 'UNDER_CONSTRUCTION' || value.state._text == 'NOT_INITIALIZED')) {
                        vm.isStopped = true;
                        vm.isUnstopped = true;
                    }
                });
            } else {
                vm.jobChainCheckAll.checkbox = false;
            }
        });

        var watcher3 = $scope.$watch('userPreferences.entryPerPage', function () {
            vm.reset();
        });

        vm.jobChainCheckAll = function () {
            if (vm.jobChainCheckAll.checkbox && vm.allJobChains && vm.allJobChains.length > 0) {
                vm.object.jobChains = vm.allJobChains.slice((vm.userPreferences.entryPerPage * (vm.jobChainFilters.currentPage - 1)), (vm.userPreferences.entryPerPage * vm.jobChainFilters.currentPage));
            } else {
                vm.reset();
            }
        };

        /**--------------- Actions -----------------------------*/
        vm.viewOrders = function (jobChain, state) {
            vm.orderFilters = CoreService.getOrderDetailTab();
            if (state)
                vm.orderFilters.filter.state = state;
            else
                vm.orderFilters.filter.state = 'ALL';
            SOSAuth.setJobChain(JSON.stringify(jobChain));
            SOSAuth.save();
            $location.path('/job_chain_detail/orders').search({path: jobChain.path});
        };

        vm.viewFlowDiagram = function (jobChain) {
            SOSAuth.setJobChain(JSON.stringify(jobChain));
            SOSAuth.save();
            $location.path('/job_chain_detail/overview').search({path: jobChain.path});
        };


        vm.getPlan = function (calendarView, viewDate) {
            var firstDay2 = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0);
            var lastDay2 = new Date(new Date(viewDate).getFullYear(), 11, 31, 23, 59, 0);
            if (calendarView == 'year') {
                if (viewDate.getFullYear() < new Date().getFullYear()) {
                    return;
                }
                else if (viewDate.getFullYear() == new Date().getFullYear()) {
                    firstDay2 = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0);
                }
                else {
                    firstDay2 = new Date(new Date(viewDate).getFullYear(), 0, 1, 0, 0, 0);
                }
            }
            if (calendarView == 'month') {
                if (viewDate.getFullYear() <= new Date().getFullYear() && viewDate.getMonth() < new Date().getMonth()) {
                    return;
                }
                else if (viewDate.getFullYear() == new Date().getFullYear() && viewDate.getMonth() == new Date().getMonth()) {
                    firstDay2 = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0);
                }
                else {
                    firstDay2 = new Date(new Date(viewDate).getFullYear(), new Date(viewDate).getMonth(), 1, 0, 0, 0);

                }
                lastDay2 = new Date(new Date(viewDate).getFullYear(), new Date(viewDate).getMonth() + 1, 0, 23, 59, 0);
            }

            if (new Date(firstDay2) >= new Date(firstDay) && new Date(lastDay2) <= new Date(lastDay)) {
                return;
            }
            firstDay = firstDay2;
            lastDay = lastDay2;

            vm.planItems = [];
            vm.isCaledarLoading = true;
            DailyPlanService.getPlans({
                jobschedulerId: $scope.schedulerIds.selected,
                states: ['PLANNED'],
                jobChain: vm._jobChain.path,
                dateFrom: firstDay,
                dateTo: lastDay
            }).then(function (res) {
                populatePlanItems(res);
                vm.isCaledarLoading = false;
            }, function () {
                vm.isCaledarLoading = false;
            });
        };

        vm.showCalendar = function (jobChain) {
            vm.maxPlannedTime = undefined;
            vm._jobChain = angular.copy(jobChain);
            vm.planItems = [];
            vm.isCaledarLoading = true;
            firstDay = new Date(new Date().getFullYear(),  new Date().getMonth(),  new Date().getDate(), 0, 0, 0);
            lastDay = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 0);
            DailyPlanService.getPlans({
                jobschedulerId: $scope.schedulerIds.selected,
                states: ['PLANNED'],
                jobChain: jobChain.path,
                dateFrom: firstDay,
                dateTo: lastDay
            }).then(function (res) {
                populatePlanItems(res);
                vm.isCaledarLoading = false;
            }, function () {
                vm.isCaledarLoading = false;
            });
            openCalendar();
        };

        function populatePlanItems(res) {
            vm.planItemData = res.planItems;
            vm.planItemData.forEach(function (data) {
                var planData = {
                    plannedStartTime: data.plannedStartTime,
                    format:vm.getCalendarTimeFormat(),
                    orderId: data.orderId
                };
                vm.planItems.push(planData);
                if (res.created) {
                    vm.maxPlannedTime = new Date(res.deliveryDate);
                }
            });
        }

        function openCalendar() {
            modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/calendar-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                size: 'lg',
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                vm._jobChain = null;
            }, function () {
                vm._jobChain = null;
            });
            vm.reset();
        }

        function loadJobOrderV(obj) {
            OrderService.get(obj).then(function (res) {
                var data = [];
                if (res && res.orders) {
                    if (vm.orders.length > 0 && vm.orders.length > res.orders.length) {
                        angular.forEach(vm.orders, function (order) {
                            for (var i = 0; i < res.orders.length; i++) {
                                if (order.path == res.orders[i].path) {
                                    order = angular.merge(orders, res.orders[i]);
                                    data.push(order);
                                    res.orders.splice(i, 1);
                                    break;
                                }
                            }
                        });
                        vm.orders = data;
                    } else {
                        vm.orders = res.orders;
                    }
                }
            });
        }

        function loadOrders(obj) {
            OrderService.getOrdersP(obj).then(function (result) {
                if (result && result.orders) {
                    vm.orders = result.orders;
                }
                loadJobOrderV(obj);
            }, function () {
                loadJobOrderV(obj);
            });
        }

        vm.showOrders = function (jobChain) {
            vm.jobChain = jobChain;
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.compact = true;
            obj.orders = [];
            obj.orders.push({jobChain: jobChain.path});
            loadOrders(obj);

            modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/order-list-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                size: 'lg',
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                vm.orders = null;
            }, function () {
                vm.orders = null;
            });
        };

        function addOrder(order, paramObject) {
            var orders = {};
            orders.jobschedulerId = $scope.schedulerIds.selected;
            orders.orders = [];
            var obj = {};
            obj.jobChain = vm._jobChain.path;

            if (order.orderId)
                obj.orderId = order.orderId;
            if (order.endState)
                obj.endState = order.endState;
            if (order.state)
                obj.state = order.state;
            if (order.title)
                obj.title = order.title;

            if (order.fromDate && order.fromTime) {
                order.fromDate.setHours(moment(order.fromTime, 'HH:mm:ss').hours());
                order.fromDate.setMinutes(moment(order.fromTime, 'HH:mm:ss').minutes());
                order.fromDate.setSeconds(moment(order.fromTime, 'HH:mm:ss').seconds());
            }

            if (order.fromDate && order.at == 'later') {
                obj.at = moment(order.fromDate).format("YYYY-MM-DD HH:mm:ss");
                obj.timeZone = order.timeZone;
            } else {
                obj.at = order.atTime;
            }
            if (paramObject && paramObject.params.length > 0) {
                obj.params = paramObject.params;
            }
            orders.orders.push(obj);
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
            OrderService.addOrder(orders);
            vm.reset();
        }

        vm.addOrder = function (jobChain) {
            ScheduleService.get({
                jobschedulerId: vm.schedulerIds.selected,
                compact: true
            }).then(function (res) {
                vm.schedules = res.schedules;
            });

            vm._jobChain = angular.copy(jobChain);
            vm.comments = {};
            vm.comments.radio = 'predefined';

            JobChainService.getJobChainP({
                jobschedulerId: vm.schedulerIds.selected,
                jobChain: jobChain.path
            }).then(function (res) {
                vm._jobChain = res.jobChain;

            });

            vm.order = {};
            vm.paramObject = {};
            vm.paramObject.params = [];
            vm.order.atTime = 'now';
            vm.order.fromDate = new Date();
            vm.zones = moment.tz.names();
            if (vm.userPreferences.zone) {
                vm.order.timeZone = vm.userPreferences.zone;
            }
            modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/add-order-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                addOrder(vm.order, vm.paramObject);
            }, function () {

            });

        };

        vm.stopJobChain = function (jobChain) {
            var jobChains = {};
            jobChains.jobChains = [];
            jobChains.jobschedulerId = vm.schedulerIds.selected;
            jobChains.jobChains.push({jobChain: jobChain.path});

            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = jobChain.path;
                vm.comments.title = jobChain.title;
                vm.comments.operation = 'Stop';
                vm.comments.type = 'Job Chain';
                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    jobChains.auditLog = {};
                    if (vm.comments.comment)
                        jobChains.auditLog.comment = vm.comments.comment;

                    if (vm.comments.timeSpent)
                        jobChains.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        jobChains.auditLog.ticketLink = vm.comments.ticketLink;

                    JobChainService.stop(jobChains);
                    vm.reset();
                }, function () {

                });
            } else {
                JobChainService.stop(jobChains);
                vm.reset();
            }

        };

        vm.unstopJobChain = function (jobChain) {
            var jobChains = {};
            jobChains.jobChains = [];
            jobChains.jobschedulerId = vm.schedulerIds.selected;
            jobChains.jobChains.push({jobChain: jobChain.path});
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = jobChain.path;
                vm.comments.title = jobChain.title;
                vm.comments.operation = 'Unstop';
                vm.comments.type = 'Job Chain';
                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    jobChains.auditLog = {};
                    if (vm.comments.comment)
                        jobChains.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        jobChains.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        jobChains.auditLog.ticketLink = vm.comments.ticketLink;


                    JobChainService.unstop(jobChains);
                    vm.reset();
                }, function () {

                });
            } else {
                JobChainService.unstop(jobChains);
                vm.reset();
            }

        };
        vm.stopAll = function () {
            var jobChains = {};
            jobChains.jobChains = [];
            jobChains.jobschedulerId = vm.schedulerIds.selected;
            angular.forEach(vm.object.jobChains, function (value) {
                jobChains.jobChains.push({jobChain: value.path});
            });
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = '';
                vm.comments.operation = 'Stop';
                vm.comments.type = 'Job Chain';
                angular.forEach(vm.object.jobChains, function (value, index) {
                    if (index == vm.object.jobChains.length - 1) {
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
                    jobChains.auditLog = {};
                    if (vm.comments.comment)
                        jobChains.auditLog.comment = vm.comments.comment;

                    if (vm.comments.timeSpent)
                        jobChains.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        jobChains.auditLog.ticketLink = vm.comments.ticketLink;
                    JobChainService.stop(jobChains);
                    vm.reset();
                }, function () {

                });
            } else {
                JobChainService.stop(jobChains);
                vm.reset();
            }

        };

        vm.unstopAll = function () {
            var jobChains = {};
            jobChains.jobChains = [];
            jobChains.jobschedulerId = vm.schedulerIds.selected;

            angular.forEach(vm.object.jobChains, function (value) {
                jobChains.jobChains.push({jobChain: value.path});
            });
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = '';
                vm.comments.operation = 'Unstop';
                vm.comments.type = 'Job Chain';
                angular.forEach(vm.object.jobChains, function (value, index) {
                    if (index == vm.object.jobChains.length - 1) {
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
                    jobChains.auditLog = {};
                    if (vm.comments.comment)
                        jobChains.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        jobChains.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        jobChains.auditLog.ticketLink = vm.comments.ticketLink;
                    JobChainService.unstop(jobChains);
                    vm.reset();
                }, function () {

                });
            } else {
                JobChainService.unstop(jobChains);
                vm.reset();
            }

        };

        vm.stopNode = function (data, jobChain) {
            var nodes = {};
            nodes.nodes = [];
            nodes.jobschedulerId = $scope.schedulerIds.selected;
            nodes.nodes.push({jobChain: jobChain.path, node: data.name});
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = jobChain.path;
                vm.comments.title = jobChain.title;
                vm.comments.node = data.name;
                vm.comments.operation = 'Stop';
                vm.comments.type = 'Job Chain';

                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    nodes.auditLog = {};
                    if (vm.comments.comment)
                        nodes.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        nodes.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        nodes.auditLog.ticketLink = vm.comments.ticketLink;
                    JobService.stopNode(nodes);
                    vm.reset();
                }, function () {
                });
            } else {
                JobService.stopNode(nodes);
                vm.reset();
            }

        };

        vm.unStopNode = function (data, jobChain) {
            var nodes = {};
            nodes.nodes = [];
            nodes.jobschedulerId = $scope.schedulerIds.selected;
            nodes.nodes.push({jobChain: jobChain.path, node: data.name});
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = jobChain.path;
                vm.comments.title = jobChain.title;
                vm.comments.node = data.name;
                vm.comments.operation = 'Unstop';
                vm.comments.type = 'Job Chain';

                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    nodes.auditLog = {};
                    if (vm.comments.comment)
                        nodes.auditLog.comment = vm.comments.comment;

                    if (vm.comments.timeSpent)
                        nodes.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        nodes.auditLog.ticketLink = vm.comments.ticketLink;
                    JobService.activateNode(nodes);
                    vm.reset();
                }, function () {

                });
            } else {
                JobService.activateNode(nodes);
                vm.reset();
            }

        };

        vm.skipNode = function (data, jobChain) {
            var nodes = {};
            nodes.nodes = [];
            nodes.jobschedulerId = $scope.schedulerIds.selected;
            nodes.nodes.push({jobChain: jobChain.path, node: data.name});
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = jobChain.path;
                vm.comments.title = jobChain.title;
                vm.comments.node = data.name;
                vm.comments.operation = 'Skip';
                vm.comments.type = 'Job Chain';

                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    nodes.auditLog = {};
                    if (vm.comments.comment)
                        nodes.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        nodes.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        nodes.auditLog.ticketLink = vm.comments.ticketLink;
                    JobService.skipNode(nodes);
                    vm.reset();
                }, function () {

                });
            } else {
                JobService.skipNode(nodes);
                vm.reset();
            }

        };

        vm.unskipNode = function (data, jobChain) {
            var nodes = {};
            nodes.nodes = [];
            nodes.jobschedulerId = $scope.schedulerIds.selected;
            nodes.nodes.push({jobChain: jobChain.path, node: data.name});
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = jobChain.path;
                vm.comments.title = jobChain.title;
                vm.comments.node = data.name;
                vm.comments.operation = 'Unskip';
                vm.comments.type = 'Job Chain';

                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    nodes.auditLog = {};
                    if (vm.comments.comment)
                        nodes.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        nodes.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        nodes.auditLog.ticketLink = vm.comments.ticketLink;
                    JobService.activateNode(nodes);
                    vm.reset();
                }, function () {

                });
            } else {
                JobService.activateNode(nodes);
                vm.reset();
            }

        };

        vm.stopJob = function (data) {
            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = $scope.schedulerIds.selected;
            jobs.jobs.push({job: data.job.path});
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = data.job.path;
                vm.comments.title = data.job.title;
                vm.comments.operation = 'Stop';
                vm.comments.type = 'Job';

                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    jobs.auditLog = {};
                    if (vm.comments.comment)
                        jobs.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        jobs.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        jobs.auditLog.ticketLink = vm.comments.ticketLink;
                    JobService.stop(jobs);
                    vm.reset();
                }, function () {

                });
            } else {
                JobService.stop(jobs);
                vm.reset();
            }

        };

        vm.unstopJob = function (data) {
            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = $scope.schedulerIds.selected;
            jobs.jobs.push({job: data.job.path});
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = data.job.path;
                vm.comments.title = data.job.title;
                vm.comments.operation = 'Unstop';
                vm.comments.type = 'Job';

                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    jobs.auditLog = {};
                    if (vm.comments.comment)
                        jobs.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        jobs.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        jobs.auditLog.ticketLink = vm.comments.ticketLink;
                    JobService.unstop(jobs);
                    vm.reset();
                }, function () {

                });
            } else {
                JobService.unstop(jobs);
                vm.reset();
            }
        };


        vm.end = function (task, path) {
            var jobs = {};
            jobs.jobs = [];
            var taskIds = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            taskIds.push({taskId: task.taskId});
            jobs.jobs.push({job: path, taskIds: taskIds});
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = path;
                vm.comments.task = task.taskId;
                vm.comments.operation = 'End Task';
                vm.comments.type = 'Job';

                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    jobs.auditLog = {};
                    if (vm.comments.comment)
                        jobs.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        jobs.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        jobs.auditLog.ticketLink = vm.comments.ticketLink;
                    TaskService.end(jobs);
                    vm.reset();
                }, function () {

                });
            } else {
                TaskService.end(jobs);
                vm.reset();
            }

        };
        vm.killTask = function (task, path) {
            var jobs = {};
            jobs.jobs = [];
            var taskIds = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            taskIds.push({taskId: task.taskId});
            jobs.jobs.push({job: path, taskIds: taskIds});
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = path;
                vm.comments.task = task.taskId;
                vm.comments.operation = 'Kill Task';
                vm.comments.type = 'Job';

                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    jobs.auditLog = {};
                    if (vm.comments.comment)
                        jobs.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        jobs.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        jobs.auditLog.ticketLink = vm.comments.ticketLink;
                    TaskService.kill(jobs);
                    vm.reset();
                }, function () {

                });
            } else {
                TaskService.kill(jobs);
                vm.reset();
            }


        };
        vm.terminateTask = function (task, path) {
            var jobs = {};
            jobs.jobs = [];
            var taskIds = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            taskIds.push({taskId: task.taskId});
            jobs.jobs.push({job: path, taskIds: taskIds});
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = path;
                vm.comments.task = task.taskId;
                vm.comments.operation = 'Terminate Task';
                vm.comments.type = 'Job';

                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    jobs.auditLog = {};
                    if (vm.comments.comment)
                        jobs.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        jobs.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        jobs.auditLog.ticketLink = vm.comments.ticketLink;
                    TaskService.terminate(jobs);
                     vm.reset();
                }, function () {

                });
            } else {
                TaskService.terminate(jobs);
                 vm.reset();
            }

        };
        function terminateTaskWithTimeout(job, task, path) {
            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            if (!task) {
                if (!job) {
                    angular.forEach(vm.object.jobs, function (value) {
                        jobs.jobs.push({job: value.path});
                    });
                } else {
                    jobs.jobs.push({job: job.path});
                }
            } else {
                var taskIds = [];

                taskIds.push({taskId: task.taskId});
                jobs.jobs.push({job: path, taskIds: taskIds});
            }
            jobs.auditLog = {};

            if (vm.comments.comment) {
                jobs.auditLog.comment = vm.comments.comment;
            }

            if (vm.comments.timeSpent) {
                jobs.auditLog.timeSpent = vm.comments.timeSpent;
            }

            if (vm.comments.ticketLink) {
                jobs.auditLog.ticketLink = vm.comments.ticketLink;
            }

            jobs.timeout = vm.timeout;
            TaskService.terminateWith(jobs);

        }

        vm.terminateTaskWithTimeout = function (job, task, path) {
            if (job) {
                vm.job = job;
            } else if (task && path) {
                vm.task = task;
                vm.path = path;
            }
            else {
                vm.taskJobs = vm.object.jobs;
            }
            vm.comments = {};
            vm.comments.radio = 'predefined';
            vm.timeout = 10;

            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/terminate-task-timeout-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                terminateTaskWithTimeout(job, task, path);
                 vm.reset();
            }, function () {

            });

        };

        vm.resizerHeight = $window.localStorage.$SOS$JOBCHAINRESIZERHEIGHT;
        $rootScope.$on('angular-resizable.resizeEnd', function (event, args) {
            $window.localStorage.$SOS$JOBCHAINRESIZERHEIGHT = args.height;
        });

        vm.reset = function () {
            vm.jobChainCheckAll.checkbox = false;
            vm.object.jobChains = [];
        };

        vm.exportToExcel = function () {

            $('#exportToExcelBtn').attr("disabled", true);
            if (!vm.isIE()) {
                $('#jobChainTableId').table2excel({
                    exclude: ".tableexport-ignore",
                    filename: "jobscheduler-jobchain",
                    fileext: ".xls",
                    exclude_img: false,
                    exclude_links: false,
                    exclude_inputs: false
                });
            } else {
                var ExportButtons = document.getElementById('jobChainTableId');
                var instance = new TableExport(ExportButtons, {
                    formats: ['xlsx'],
                    exportButtons: false
                });
                var exportData = instance.getExportData()['jobChainTableId']['xlsx'];
                instance.export2file(exportData.data, exportData.mimeType, "jobscheduler-jobchain", exportData.fileExtension);
            }
            $('#exportToExcelBtn').attr("disabled", false);
        };

        /**---------------filtering, sorting and pagination -------------------*/
        vm.pageChange = function () {
            vm.reset();
        };

        vm.sortBy = function (propertyName) {
            vm.reset();
            vm.jobChainFilters.reverse = !vm.jobChainFilters.reverse;
            vm.jobChainFilters.filter.sortBy = propertyName;
        };

        vm.saveAsFilter = function (form) {
            var configObj = {};
            configObj.jobschedulerId = vm.schedulerIds.selected;
            configObj.account = vm.permission.user;
            configObj.configurationType = "CUSTOMIZATION";
            configObj.objectType = "JOBCHAIN";
            configObj.name = vm.jobChainFilter.name;
            configObj.id = 0;
            //configObj.shared = vm.jobChainFilter.shared;

            configObj.configurationItem = JSON.stringify(vm.jobChainFilter);
            UserService.saveConfiguration(configObj).then(function (res) {
                configObj.id = res.id;
                vm.jobChainFilter.name = '';
                if (form)
                    form.$setPristine();

                vm.jobChainFilterList.push(configObj);
            })
        };
        vm.advancedSearch = function () {
            vm.jobChainFilter = {};
            vm.isUnique = true;
            vm.showSearchPanel = true;
        };
        vm.cancel = function (form) {
            vm.showSearchPanel = false;
            vm.jobChainFilter = {};
            if (form)
                form.$setPristine();
        };
        function searchV(obj) {
            if (vm.jobChainFilter && vm.jobChainFilter.state) {
                obj.states = vm.jobChainFilter.state;
            }
            if (vm.userPreferences.showOrders) {
                obj.compact = false;
            }
            obj.maxOrders = vm.userPreferences.maxOrderPerJobchain;
            JobChainService.get(obj).then(function (res) {
                var data = [];
                if (vm.jobChains && vm.jobChains.length > 0) {
                    angular.forEach(vm.jobChains, function (jobChain) {
                        if (vm.userPreferences.showOrders)
                            jobChain.show = true;
                        for (var i = 0; i < res.jobChains.length; i++) {


                            var flag1 = true;
                            if (jobChain.path == res.jobChains[i].path) {
                                jobChain = angular.merge(jobChain, res.jobChains[i]);
                                if (vm.jobChainFilter && vm.jobChainFilter.agentName && jobChain.processClass) {
                                    if (!jobChain.processClass.match(vm.jobChainFilter.agentName)) {
                                        flag1 = false;
                                    }
                                }
                                if (flag1) {
                                    jobChain.path1 = jobChain.path.substring(0, jobChain.path.lastIndexOf('/')) || jobChain.path.substring(0, jobChain.path.lastIndexOf('/') + 1);
                                    data.push(jobChain);
                                }
                                res.jobChains.splice(i, 1);
                                break;
                            }
                        }
                    });
                } else {
                    angular.forEach(res.jobChains, function (jobChainData) {
                        if (vm.userPreferences.showOrders)
                            jobChainData.show = true;
                        var flag1 = true;
                        if (vm.jobChainFilter && vm.jobChainFilter.agentName && jobChains.processClass) {
                            if (!jobChains.processClass.match(vm.jobChainFilter.agentName)) {
                                flag1 = false;
                            }
                        }
                        if (flag1) {
                            jobChainData.path1 = jobChainData.path.substring(0, jobChainData.path.lastIndexOf('/')) || jobChainData.path.substring(0, jobChainData.path.lastIndexOf('/') + 1);
                            data.push(jobChainData);
                        }

                    })
                }
                vm.jobChains = data;
                vm.allJobChains = angular.copy(vm.jobChains);
                traverseTreeForSearchData();
            }, function () {
                angular.forEach(vm.jobChains, function (jobChainData) {
                    if (vm.userPreferences.showOrders)
                        jobChainData.show = true;
                    var flag1 = true;
                    if (vm.jobChainFilter && vm.jobChainFilter.agentName && jobChains.processClass) {
                        if (!jobChains.processClass.match(vm.jobChainFilter.agentName)) {
                            flag1 = false;
                        }
                    }
                    if (flag1) {
                        jobChainData.path1 = jobChainData.path.substring(0, jobChainData.path.lastIndexOf('/')) || jobChainData.path.substring(0, jobChainData.path.lastIndexOf('/') + 1);
                        data.push(jobChainData);
                    }

                });
                vm.allJobChains = angular.copy(vm.jobChains);
                traverseTreeForSearchData();
            });
        }

        vm.search = function () {
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.compact = true;
            if (vm.jobChainFilter && vm.jobChainFilter.regex) {
                obj.regex = vm.jobChainFilter.regex;
            }
            if (vm.jobChainFilter && vm.jobChainFilter.paths && vm.jobChainFilter.paths.length > 0) {
                obj.folders = [];
                for (var i = 0; i < vm.jobChainFilter.paths.length; i++) {
                    obj.folders.push({folder: vm.jobChainFilter.paths[i], recursive: true});
                }
            }

            JobChainService.getJobChainsP(obj).then(function (result) {
                vm.jobChains = result.jobChains;
                searchV(obj);
            }, function () {
                searchV(obj);
            });
        };


        function traverseTreeForSearchData() {
            function traverseTree1(data) {
                for (var i = 0; i < data.folders.length; i++) {
                    data.folders[i].selected1 = false;
                    data.folders[i].expanded = true;
                    data.folders[i].jobChains = [];
                    pushJobChain(data.folders[i]);
                    traverseTree1(data.folders[i]);
                }
            }

            function navFullTree() {
                for (var i = 0; i < vm.tree.length; i++) {
                    vm.tree[i].selected1 = true;
                    vm.tree[i].expanded = true;
                    vm.tree[i].jobChains = [];
                    pushJobChain(vm.tree[i]);
                    traverseTree1(vm.tree[i]);
                }
            }

            function pushJobChain(data) {
                angular.forEach(vm.jobChains, function (jobChain) {
                    if (data.path == jobChain.path1) {
                        data.selected1 = true;
                        data.jobChains.push(jobChain);
                    }
                });
            }

            navFullTree();
        }

        vm.applyFilter = function () {
            vm.cancel();
            vm.jobChainFilter = {};
            vm.isUnique = true;
            modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/jobchain-filter-dialog.html',
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
                configObj.objectType = "JOBCHAIN";
                configObj.name = vm.jobChainFilter.name;
                configObj.id = 0;
                configObj.shared = vm.jobChainFilter.shared;

                configObj.configurationItem = JSON.stringify(vm.jobChainFilter);
                UserService.saveConfiguration(configObj).then(function (res) {
                    configObj.id = res.id;
                    vm.jobChainFilterList.push(configObj);

                    if (vm.jobChainFilterList.length == 1) {
                        vm.savedJobChainFilter.selected = res.id;
                        vm.jobChainFilters.selectedView = true;
                        vm.selectedFiltered = vm.jobChainFilter;
                        vm.selectedFiltered.account = vm.permission.user;
                        isCustomizationSelected(true);
                        SavedFilter.setJobChain(vm.savedJobChainFilter);
                        SavedFilter.save();
                        vm.load();
                    }
                })
            }, function () {

            });
        };

        vm.editFilters = function () {
            vm.filters = {};
            vm.filters.list = vm.jobChainFilterList;
            vm.filters.favorite = vm.savedJobChainFilter.favorite;
            modalInstance = $uibModal.open({
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
                vm.jobChainFilter = JSON.parse(conf.configuration.configurationItem);
                vm.jobChainFilter.shared = filter.shared;
                vm.paths = vm.jobChainFilter.paths;
                vm.object.paths = vm.paths;
            });

            modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/edit-jobchain-filter-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                size: 'lg',
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                if (vm.savedJobChainFilter.selected == filter.id) {
                    vm.selectedFiltered = vm.jobChainFilter;
                    vm.jobChainFilters.selectedView = true;
                    isCustomizationSelected(true);
                    vm.load();
                }
                var configObj = {};
                configObj.jobschedulerId = filter.jobschedulerId;
                configObj.account = filter.account;
                configObj.configurationType = filter.configurationType;
                configObj.objectType = filter.objectType;
                configObj.configurationItem = JSON.stringify(vm.jobChainFilter);
                configObj.name = vm.jobChainFilter.name;
                configObj.id = filter.id;
                configObj.shared = vm.jobChainFilter.shared;
                filter.shared = vm.jobChainFilter.shared;

                UserService.saveConfiguration(configObj);
                filter.name = vm.jobChainFilter.name;
                temp_name = '';
            }, function () {
                temp_name = '';
            });
        };
        vm.copyFilter = function (filter) {
            vm.action = 'copy';
            vm.isUnique = true;
            UserService.configuration({jobschedulerId: filter.jobschedulerId, id: filter.id}).then(function (conf) {
                vm.jobChainFilter = JSON.parse(conf.configuration.configurationItem);
                vm.jobChainFilter.shared = filter.shared;
                vm.paths = vm.jobChainFilter.paths;
                vm.object.paths = vm.paths;
                vm.jobChainFilter.name = vm.checkCopyName(vm.jobChainFilterList, filter.name)
            });

            modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/edit-jobchain-filter-dialog.html',
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
                configObj.objectType = "JOBCHAIN";
                configObj.name = vm.jobChainFilter.name;
                configObj.shared = vm.jobChainFilter.shared;
                configObj.id = 0;

                configObj.configurationItem = JSON.stringify(vm.jobChainFilter);
                UserService.saveConfiguration(configObj).then(function (res) {
                    configObj.id = res.id;
                    vm.jobChainFilterList.push(configObj);
                });

            }, function () {

            });
        };

        vm.deleteFilter = function (filter) {

            UserService.deleteConfiguration({
                jobschedulerId: filter.jobschedulerId,
                id: filter.id
            }).then(function () {
                angular.forEach(vm.jobChainFilterList, function (value, index) {
                    if (value.id == filter.id) {
                        vm.jobChainFilterList.splice(index, 1);
                    }
                });

                if (vm.savedJobChainFilter.selected == filter.id) {
                    vm.savedJobChainFilter.selected = undefined;
                    vm.jobChainFilters.selectedView = false;
                    vm.selectedFiltered = undefined;
                    isCustomizationSelected(false);
                    vm.load();
                } else {
                    if (vm.jobChainFilterList.length == 0) {
                        vm.savedJobChainFilter.selected = undefined;
                        vm.jobChainFilters.selectedView = false;
                        vm.selectedFiltered = undefined;
                        isCustomizationSelected(false);
                    }
                }
                SavedFilter.setJobChain(vm.savedJobChainFilter);
                SavedFilter.save();
            });

        };
        vm.makePrivate = function (configObj) {

            UserService.privateConfiguration({
                jobschedulerId: configObj.jobschedulerId,
                id: configObj.id
            }).then(function () {
                configObj.shared = false;
                if (vm.permission.user != configObj.account) {
                    angular.forEach(vm.jobChainFilterList, function (value, index) {
                        if (value.id == configObj.id) {
                            vm.jobChainFilterList.splice(index, 1);
                        }
                    });
                }
            });
        };

        vm.makeShare = function (configObj) {

            UserService.shareConfiguration({
                jobschedulerId: configObj.jobschedulerId,
                id: configObj.id
            }).then(function () {
                configObj.shared = true;
            });
        };
        vm.favorite = function (filter) {
            vm.savedJobChainFilter.favorite = filter.id;
            vm.filters.favorite = filter.id;
            vm.jobChainFilters.selectedView = true;
            SavedFilter.setJobChain(vm.savedJobChainFilter);
            SavedFilter.save();
            vm.load();
        };

        vm.removeFavorite = function () {
            vm.savedJobChainFilter.favorite = '';
            vm.filters.favorite = '';
            SavedFilter.setJobChain(vm.savedJobChainFilter);
            SavedFilter.save();
        };

        vm.checkFilterName = function () {
            vm.isUnique = true;
            angular.forEach(vm.jobChainFilterList, function (value) {
                if (vm.jobChainFilter.name == value.name && vm.permission.user == value.account && vm.jobChainFilter.name != temp_name) {
                    vm.isUnique = false;
                }
            })
        };

        vm.changeFilter = function (filter) {

            vm.cancel();
            if (filter) {
                vm.savedJobChainFilter.selected = filter.id;
                vm.jobChainFilters.selectedView = true;
                UserService.configuration({jobschedulerId: filter.jobschedulerId, id: filter.id}).then(function (conf) {
                    vm.selectedFiltered = JSON.parse(conf.configuration.configurationItem);
                    vm.selectedFiltered.account = filter.account;
                    if(vm.selectedFiltered.paths){
                       vm.jobChainFilters.expand_to = {};
                    }
                    vm.load();
                });
            }
            else {
                isCustomizationSelected(false);
                vm.savedJobChainFilter.selected = filter;
                vm.jobChainFilters.selectedView = false;
                vm.selectedFiltered = filter;
                vm.load();
            }

            SavedFilter.setJobChain(vm.savedJobChainFilter);
            SavedFilter.save();

        };

        vm.getTreeStructure = function () {
            JobChainService.tree({
                jobschedulerId: vm.schedulerIds.selected,
                compact: true,
                types: ['JOBCHAIN']
            }).then(function (res) {

                vm.filterTree1 = res.folders;

            }, function () {
                $('#treeModal').modal('hide');
            });
            $('#treeModal').modal('show');
        };

        vm.treeExpand = function (data) {
            angular.forEach(vm.object.paths, function (value) {
                if (data.path == value) {
                    if (data.folders.length > 0) {
                        data.folders = orderBy(data.folders, 'name');
                        angular.forEach(data.folders, function (res) {
                            vm.object.paths.push(res.path);
                        });
                    }
                }
            });
        };

        var watcher4 = $scope.$watchCollection('object.paths', function (newNames) {
            if (newNames && newNames.length > 0) {
                vm.paths = newNames;
            }
        });

        vm.addJobChainPaths = function () {
            vm.jobChainFilter.paths = vm.paths;
        };

        vm.remove = function (object) {
            for (var i = 0; i < vm.jobChainFilter.paths.length; i++) {
                if (angular.equals(vm.jobChainFilter.paths[i], object)) {
                    vm.jobChainFilter.paths.splice(i, 1);
                    break;
                }
            }
        };

        vm.hidePanel = function () {
            $('#rightPanel1').addClass('m-l-0 fade-in');
            $('#rightPanel1').find('.parent .child').removeClass('col-xxl-3 col-lg-4').addClass('col-xxl-2 col-lg-3');
            $('#leftPanel').hide();
            $('.sidebar-btn').show();
        };

        vm.showLeftPanel = function () {
            $('#rightPanel1').removeClass('fade-in m-l-0');
            $('#rightPanel1').find('.parent .child').addClass('col-xxl-3 col-lg-4').removeClass('col-xxl-2 col-lg-3');
            $('#leftPanel').show();
            $('.sidebar-btn').hide();

        };

        function traverseToSelectedJobChain(data, jobChain) {
            function recursive(data) {
                if (data.path == jobChain.path1)
                    for (var index = 0; index < data.jobChains.length; index++) {
                        if (jobChain.path == data.jobChains[index].path) {
                            data.jobChains[index] = jobChain;
                        }
                    }
                for (var i = 0; i < data.folders.length; i++) {
                    if (data.folders[i].path.match(jobChain.path1) || jobChain.path1.match(data.folders[i].path)) {
                        recursive(data.folders[i]);
                    }
                }
            }

            recursive(data);
        }



        vm.showNodePanelFuc = showNodePanelFuc;
        function showNodePanelFuc(jobChain) {
            jobChain.show = true;

            JobChainService.getJobChainP({
                jobschedulerId: vm.schedulerIds.selected,
                jobChain: jobChain.path
            }).then(function (result) {
                jobChain.nodes = [];
                jobChain = angular.merge(jobChain, result.jobChain);
                JobChainService.getJobChain({
                    jobschedulerId: vm.schedulerIds.selected,
                    jobChain: jobChain.path,
                    maxOrders: vm.userPreferences.maxOrderPerJobchain
                }).then(function (res) {
                   // jobChain.nodes = [];
                    jobChain = angular.merge(jobChain, res.jobChain);
                    jobChain.nestedJobChains = res.nestedJobChains;
                    if (vm.userPreferences.showTasks)
                        angular.forEach(jobChain.nodes, function (val, index) {
                            if (val.job && val.job.state && val.job.state._text == 'RUNNING') {

                                JobService.get({
                                    jobschedulerId: vm.schedulerIds.selected,
                                    jobs: [{job: val.job.path}]
                                }).then(function (res1) {
                                    jobChain.nodes[index].job = angular.merge(jobChain.nodes[index].job, res1.jobs[0]);
                                });
                            }
                        });
                });
            });

            for (var i = 0; i < vm.tree.length; i++) {
                if (vm.tree[i].path.match(jobChain.path1) || jobChain.path1.match(vm.tree[i].path)) {
                    traverseToSelectedJobChain(vm.tree[i], jobChain);
                }
            }
        }

        vm.hideNodePanelFuc = function (jobChain) {
            jobChain.show = false;
            for (var i = 0; i < vm.tree.length; i++) {
                if (vm.tree[i].path.match(jobChain.path1) || jobChain.path1.match(vm.tree[i].path)) {
                    traverseToSelectedJobChain(vm.tree[i], jobChain);
                }
            }
        };


        vm.expandDetails = function () {
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.jobChains = [];
            angular.forEach(vm.allJobChains, function (value) {
                obj.jobChains.push({jobChain: value.path});
            });
            JobChainService.getJobChainsP(obj).then(function (result) {

                for (var i = 0; i < vm.allJobChains.length; i++) {
                    for (var j = 0; j < result.jobChains.length; j++) {
                        if (result.jobChains[j].path == vm.allJobChains[i].path) {
                            vm.allJobChains[i] = mergePermanentAndVolatile(result.jobChains[j], vm.allJobChains[i]);
                            vm.allJobChains[i].show = true;
                            result.jobChains.splice(j, 1);
                            break;
                        }
                    }
                }

                JobChainService.get(obj).then(function (res) {
                    for (var i = 0; i < vm.allJobChains.length; i++) {
                        for (var j = 0; j < res.jobChains.length; j++) {
                            if (res.jobChains[j].path == vm.allJobChains[i].path) {
                                vm.allJobChains[i] = mergePermanentAndVolatile(res.jobChains[j], vm.allJobChains[i]);
                                 vm.allJobChains[i].show = true;
                                if (vm.userPreferences.showTasks)
                                    angular.forEach(vm.allJobChains[i].nodes, function (val, index) {
                                        if (val.job && val.job.state && val.job.state._text == 'RUNNING') {

                                            JobService.get({
                                                jobschedulerId: vm.schedulerIds.selected,
                                                jobs: [{job: val.job.path}]
                                            }).then(function (res1) {
                                                vm.allJobChains[i].nodes[index].job = angular.merge(vm.allJobChains[i].nodes[index].job, res1.jobs[0]);
                                            });
                                        }
                                    });
                                res.jobChains.splice(j, 1);
                                break;
                            }

                        }
                    }
                });
            });
        };


        vm.collapseDetails = function () {
            angular.forEach(vm.allJobChains, function (value) {
                value.show = false;
            });
        };

        vm.showHistory = showHistory;

        function showHistory(jobChain) {
            vm.showHistoryPanel = jobChain;
            vm.isAuditLog = false;
            var filter = {};
            filter.jobChain = jobChain.path;
            filter.jobschedulerId = $scope.schedulerIds.selected;
            JobChainService.histories(filter).then(function (res) {
                vm.historys = res.history;
            });
        }

        vm.loadAuditLogs = function (obj) {
            obj.limit = parseInt(vm.userPreferences.maxAuditLogPerObject);
            AuditLogService.getLogs(obj).then(function (result) {
                if (result && result.auditLog) {
                    vm.auditLogs = result.auditLog;
                }
            });
        };

        vm.showAuditLogs = function (jobChain) {
            vm.showHistoryPanel = jobChain;
            vm.isAuditLog = true;
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.orders = [];
            obj.orders.push({jobChain: jobChain.path});
            if (vm.permission.AuditLog.view.status)
                vm.loadAuditLogs(obj);
        };

        vm.hideHistoryPanel = function () {
            vm.showHistoryPanel = '';
        };


        function recursiveTreeUpdate(scrTree, destTree) {
            if (scrTree && destTree)
                for (var i = 0; i < scrTree.length; i++) {
                    for (var j = 0; j < destTree.length; j++) {
                        if (scrTree[i].path == destTree[j].path) {
                            scrTree[i].jobChains = destTree[j].jobChains;
                            scrTree[i].expanded = destTree[j].expanded;
                            scrTree[i].selected = destTree[j].selected;
                            scrTree[i].selected1 = destTree[j].selected1;
                            recursiveTreeUpdate(scrTree[i].folders, destTree[j].folders);
                            destTree.splice(j, 1);
                            break;
                        }
                    }
                }
        }


        vm.recursiveTreeUpdate = function (scrTree, destTree) {
            if (scrTree && destTree)
                for (var i = 0; i < scrTree.length; i++) {
                    for (var j = 0; j < destTree.length; j++) {
                        if (scrTree[i].path == destTree[j].path) {
                            scrTree[i].jobChains = destTree[j].jobChains;
                            scrTree[i].expanded = destTree[j].expanded;
                            scrTree[i].selected = destTree[j].selected;
                            scrTree[i].selected1 = destTree[j].selected1;
                            recursiveTreeUpdate(scrTree[i].folders, destTree[j].folders);
                            destTree.splice(j, 1);
                            break;
                        }
                    }
                }
            return scrTree;
        };

        function recursiveSort(tree) {
            function recursive(data) {
                data.folders = orderBy(data.folders, 'name');
                angular.forEach(data.folders, function (value) {
                    recursive(value);
                });
            }

            angular.forEach(tree, function (value) {
                recursive(value);
            });
        }



        var loadFileBasedObj = true;

        var t1 = '';
        $scope.$on('event-started', function () {
            if (vm.events && vm.events.length > 0 && vm.events[0].eventSnapshots) {
                var arr = [];
                var arr1 = [];
                var callTree = false;
                for (var j = 0; j < vm.events[0].eventSnapshots.length; j++) {
                    if (vm.events[0].eventSnapshots[j].eventType == 'JobChainStateChanged' && !vm.events[0].eventSnapshots[j].eventId) {
                        arr.push({jobChain: vm.events[0].eventSnapshots[j].path});
                    }
                    if ((vm.events[0].eventSnapshots[j].eventType === "FileBasedActivated" || vm.events[0].eventSnapshots[j].eventType == "FileBasedRemoved") && (vm.events[0].eventSnapshots[j].objectType == "JOBCHAIN" || vm.events[0].eventSnapshots[j].objectType == "JOB" || vm.events[0].eventSnapshots[j].objectType == "ORDER") && loadFileBasedObj && !callTree) {
                        callTree = vm.events[0].eventSnapshots[j].path;
                    }
                }
                if (callTree) {
                    loadFileBasedObj = false;
                    if (vm.selectedFiltered && vm.selectedFiltered.paths && vm.selectedFiltered.paths.length > 0) {
                        var folders = [];
                        angular.forEach(vm.selectedFiltered.paths, function (v) {
                            folders.push({folder: v});
                        });
                    }
                    JobChainService.tree({
                        jobschedulerId: vm.schedulerIds.selected,
                        compact: true,
                        folders: folders,
                        types: ['JOBCHAIN']
                    }).then(function (res) {
                        loadFileBasedObj = true;
                        vm.jobChainFilters.expand_to = vm.recursiveTreeUpdate(angular.copy(res.folders), vm.jobChainFilters.expand_to);
                        vm.tree = vm.jobChainFilters.expand_to;
                        recursiveSort(vm.tree);

                    }, function () {
                        loadFileBasedObj = true;
                    });
                    navFullTreeForUpdateJobChain(callTree.substring(0, callTree.lastIndexOf('/')));
                }
                if (arr.length > 0) {
                    for (var i = 0; i < vm.allJobChains.length; i++) {
                        for (var j = 0; j < arr.length; j++) {

                            if (arr[j].jobChain == vm.allJobChains[i].path) {
                                arr1.push(arr[j]);
                                arr.splice(j, 1);
                                break;
                            }
                        }
                    }
                }

                if (arr1.length > 0 && !vm.loading) {
                    var obj = {};
                    obj.jobschedulerId = $scope.schedulerIds.selected;
                    obj.jobChains = arr1;
                    JobChainService.get(obj).then(function (res) {
                        if (res.jobChains) {
                            angular.forEach(vm.allJobChains, function (jobChain, index) {
                                //if (vm.userPreferences.showOrders)
                                    //vm.allJobChains[index].show = true;
                                for (var i = 0; i < res.jobChains.length; i++) {
                                    if (vm.allJobChains[index].path == res.jobChains[i].path) {
                                   vm.allJobChains[index] = mergePermanentAndVolatile(res.jobChains[i],vm.allJobChains[index]);
                                   //vm.allJobChains[index].nodes = [];
                                   // vm.allJobChains[index] = angular.merge(vm.allJobChains[index], res.jobChains[i]);
                                        vm.allJobChains[index].nestedJobChains = res.nestedJobChains;
                                        if (vm.userPreferences.showTasks && vm.allJobChains[index].show)
                                            angular.forEach(vm.allJobChains[index].nodes, function (val, index2) {
                                                if (val.job && val.job.state && val.job.state._text == 'RUNNING') {
                                                    JobService.get({
                                                        jobschedulerId: vm.schedulerIds.selected,
                                                        jobs: [{job: val.job.path}]
                                                    }).then(function (res1) {
                                                        vm.allJobChains[index].nodes[index2].job = angular.merge(vm.allJobChains[index].nodes[index2].job, res1.jobs[0]);
                                                    });
                                                }
                                            });

                                        res.jobChains.splice(i, 1);
                                        break;
                                    }

                                }
                            });
                        }
                    });
                }
                if (vm.showHistoryPanel) {
                    for (var i = 0; i < vm.events[0].eventSnapshots.length; i++) {
                        if (vm.events[0].eventSnapshots[i].eventType == "ReportingChangedOrder") {
                            var filter = {};
                            filter.jobChain = vm.showHistoryPanel.path;
                            filter.jobschedulerId = $scope.schedulerIds.selected;
                            JobChainService.histories(filter).then(function (res) {
                                vm.historys = res.history;
                            });
                        }
                        var path = vm.events[0].eventSnapshots[i].path.split(',')[0];
                        if (vm.events[0].eventSnapshots[i].eventType == "AuditLogChanged" && (vm.events[0].eventSnapshots[i].objectType == "JOBCHAIN" || vm.events[0].eventSnapshots[i].objectType == "ORDER") && (path == vm.showHistoryPanel.path)) {
                            if (vm.permission.AuditLog.view.status) {
                                var obj = {};
                                obj.jobschedulerId = vm.schedulerIds.selected;
                                obj.orders = [];
                                obj.orders.push({jobChain: vm.showHistoryPanel.path});
                                vm.loadAuditLogs(obj);
                            }
                        }
                    }
                }
            }

        });

        function navFullTreeForUpdateJobChain(path) {
            for (var i = 0; i < vm.tree.length; i++) {
                if (vm.tree[i].path != path) {
                    traverseTreeForUpdateJobChain(vm.tree[i], path);
                } else {
                    if (vm.tree[i].selected1)
                        expandFolderData1(vm.tree[i]);
                    break;
                }
            }
        }

        function traverseTreeForUpdateJobChain(data, path) {
            if (data.folders)
                for (var i = 0; i < data.folders.length; i++) {
                    if (data.folders[i].path != path) {
                        traverseTreeForUpdateJobChain(data.folders[i], path);
                    } else {
                        if (data.folders[i].selected1)
                            expandFolderData1(data.folders[i]);
                        break;
                    }
                }
        }

        $scope.$on('refreshList', function (event, jobChain) {
            showNodePanelFuc(jobChain);
        });
        var watcher2 = $scope.$watchCollection('filtered', function (newNames) {
            if (newNames)
                vm.object = {};
        });


        $scope.$on('$destroy', function () {
            watcher1();
            watcher2();
            watcher3();
            watcher4();
            if (t1) {
                $timeout.cancel(t1);
            }
        });
    }

    JobCtrl.$inject = ["$scope", "$rootScope", "JobService", "UserService", "$uibModal", "orderByFilter", "SavedFilter", "TaskService",
        "$state", "CoreService", "$timeout", "DailyPlanService", "AuditLogService", "$location","OrderService"];
    function JobCtrl($scope, $rootScope, JobService, UserService, $uibModal, orderBy, SavedFilter, TaskService,
                     $state, CoreService, $timeout, DailyPlanService, AuditLogService, $location, OrderService) {
        var vm = $scope;
        vm.jobFilters = CoreService.getJobTab();
        vm.maxEntryPerPage = vm.userPreferences.maxEntryPerPage;

        vm.showTask = vm.userPreferences.showTasks;
        vm.isUnique = true;
        $rootScope.$on('event-jobs', function (event, values) {
            $rootScope.job_expand_to = values;
        });

        vm.object = {};

        vm.tree = [];
        vm.allJobs = [];
        vm.my_tree = {};

        vm.filter_tree = {};
        vm.filterTree1 = [];
        vm.object.paths = [];

        vm.selectedFiltered='';
        vm.temp_filter = {};

        vm.savedJobFilter = JSON.parse(SavedFilter.jobFilters) || {};
        vm.jobFilterList = [];


        if (vm.jobFilters.selectedView) {
            vm.savedJobFilter.selected = vm.savedJobFilter.selected || vm.savedJobFilter.favorite;
        }
        else {
            vm.savedJobFilter.selected = undefined;
        }

        vm.expanding_property = {
            field: "name"
        };

        if ($location.search().scheduler_id && $location.search().path) {
            vm.checkSchedulerId();
            getJobByPath($location.search().path);
        } else {
            checkSharedFilters();
        }

        function mergePermanentAndVolatile(sour, dest) {
            dest.runningTasks = sour.runningTasks;
            dest.error = sour.error;
            dest.numOfRunningTasks = sour.numOfRunningTasks;
            dest.numOfQueuedTasks = sour.numOfQueuedTasks;
            dest.taskQueue = sour.taskQueue;
            dest.nextStartTime = sour.nextStartTime;
            dest.startedAt = sour.startedAt;
            dest.state = sour.state;
            dest.stateText = sour.stateText;
            dest.configurationStatus = sour.configurationStatus;
            dest.ordersSummary = sour.ordersSummary;
            return dest;
        }

        function getJobByPath(path) {
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;

            obj.jobs = [{job: path}];
            JobService.getJobsP(obj).then(function (result) {
                vm.jobs = result.jobs;
                getJobByPathV(obj);
                vm.isLoading = true;
            }, function () {
                getJobByPathV(obj);
                vm.isLoading = true;
            });
        }

        function getJobByPathV(obj) {
            JobService.get(obj).then(function (res) {
                if (vm.jobs && angular.isArray(vm.jobs)) {
                    vm.jobs[0] = mergePermanentAndVolatile(res.jobs[0], vm.jobs[0]);
                } else {
                    vm.jobs = res.jobs;
                }
            });
        }

        function checkSharedFilters() {

            if (vm.permission.JOCConfigurations.share.view) {
                var obj = {};
                obj.jobschedulerId = vm.schedulerIds.selected;
                obj.configurationType = "CUSTOMIZATION";
                obj.objectType = "JOB";
                obj.shared = true;
                UserService.configurations(obj).then(function (res) {
                    if (res.configurations && res.configurations.length > 0)
                        vm.jobFilterList = res.configurations;
                    getCustomizations();
                }, function () {
                    getCustomizations();
                });
            } else {
                getCustomizations();
            }
        }

        function getCustomizations() {
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.account = vm.permission.user;
            obj.configurationType = "CUSTOMIZATION";
            obj.objectType = "JOB";
            UserService.configurations(obj).then(function (res) {

                if (vm.jobFilterList && vm.jobFilterList.length > 0) {
                    if (res.configurations && res.configurations.length > 0) {
                        vm.jobFilterList = vm.jobFilterList.concat(res.configurations);
                    }
                    var data = [];

                    for (var i = 0; i < vm.jobFilterList.length; i++) {
                        var flag = true;
                        for (var j = 0; j < data.length; j++) {
                            if (data[j].id == vm.jobFilterList[i].id) {
                                flag = false;
                            }
                        }
                        if (flag) {
                            data.push(vm.jobFilterList[i]);
                        }
                    }
                    vm.jobFilterList = data;
                } else {
                    vm.jobFilterList = res.configurations;
                }

                if (vm.savedJobFilter.selected) {
                    var flag = true;
                    angular.forEach(vm.jobFilterList, function (value) {
                        if (value.id == vm.savedJobFilter.selected) {
                            flag = false;
                            UserService.configuration({
                                jobschedulerId: value.jobschedulerId,
                                id: value.id
                            }).then(function (conf) {
                                vm.selectedFiltered = JSON.parse(conf.configuration.configurationItem);
                                vm.selectedFiltered.account = value.account;

                                initTree();
                            });
                        }
                    });
                    if (flag) {
                        vm.savedJobFilter.selected = undefined;
                        initTree();
                    }
                } else {
                    vm.savedJobFilter.selected = undefined;
                    initTree();
                }

            }, function () {
                vm.savedJobFilter.selected = undefined;
                initTree();
            })
        }

        vm.exportToExcel = function () {
            $('#exportToExcelBtn').attr("disabled", true);

            if (!vm.isIE()) {
                $('#jobTableId').table2excel({
                    exclude: ".tableexport-ignore",
                    filename: "jobscheduler-job",
                    fileext: ".xls",
                    exclude_img: false,
                    exclude_links: false,
                    exclude_inputs: false
                });
            } else {
                var ExportButtons = document.getElementById('jobTableId');
                var instance = new TableExport(ExportButtons, {
                    formats: ['xlsx'],
                    exportButtons: false
                });
                var exportData = instance.getExportData()['jobTableId']['xlsx'];
                instance.export2file(exportData.data, exportData.mimeType, "jobscheduler-job", exportData.fileExtension);
            }
            $('#exportToExcelBtn').attr("disabled", false);
        };

        /**
         * Function to initialized tree view
         */
        function initTree() {
            if (vm.selectedFiltered && vm.selectedFiltered.paths && vm.selectedFiltered.paths.length > 0) {
                var folders = [];
                angular.forEach(vm.selectedFiltered.paths, function (v) {
                    folders.push({folder: v});
                });

            }
            if (vm.selectedFiltered) {
                isCustomizationSelected(true);
            }

            JobService.tree({
                jobschedulerId: vm.schedulerIds.selected,
                compact: true,
                folders: folders,
                types: ['JOB']
            }).then(function (res) {

                if ($rootScope.job_expand_to) {
                    vm.tree = angular.copy(res.folders);
                    filteredTreeData();
                } else {
                    if (vm.isEmpty(vm.jobFilters.expand_to)) {
                        vm.tree = angular.copy(res.folders);
                        filteredTreeData();
                    } else {
                        vm.jobFilters.expand_to = vm.recursiveTreeUpdate(angular.copy(res.folders), vm.jobFilters.expand_to);
                        vm.tree = vm.jobFilters.expand_to;
                        vm.changeStatus();
                    }
                }
                vm.jobFilters.expand_to = vm.tree;
                vm.isLoading = true;
            }, function () {
                vm.isLoading = true;
            });
        }

        vm.$on('reloadObject', function () {
            navFullTree();
            filteredTreeData();
        });

        vm.treeHandler = function (data) {
            vm.reset();
            navFullTree();
            if (vm.showTaskPanel && (vm.showTaskPanel.path1 != data.path)) {
                vm.hideTaskPanel();
            }
            data.selected1 = true;
            data.jobs = [];
            vm.allJobs = [];
            vm.loading = true;
            expandFolderData(data);
        };

        vm.treeHandler1 = function (data) {
            if (data.expanded) {
                data.folders = orderBy(data.folders, 'name');
            }
        };

        vm.expandNode = function (data) {
            vm.reset();
            navFullTree();

            if (vm.showTaskPanel && (vm.showTaskPanel.path1 != data.path)) {
                vm.hideTaskPanel();
            }
            vm.allJobs = [];
            vm.loading = true;
            vm.folderPath = data.name || '/';
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.compact = true;
            if (vm.selectedFiltered) {
                obj.regex = vm.selectedFiltered.regex;
                if (vm.selectedFiltered.type && vm.selectedFiltered.type.length > 0) {
                    if (vm.selectedFiltered.type.length > 1) {
                    } else {
                        obj.isOrderJob = vm.selectedFiltered.type[0] == 'order';
                    }
                }
            }
            if (vm.jobFilters.filter.type != 'ALL') {
                obj.isOrderJob = vm.jobFilters.filter.type == 'order';
            }
            obj.folders = [];
            obj.folders.push({folder: data.path, recursive: true});
            JobService.getJobsP(obj).then(function (result) {
                vm.jobs = result.jobs;
                volatileInformation(obj, data);
            }, function () {
                volatileInformation(obj, data);
            });
        };

        vm.collapseNode = function (data) {
            function recursive(data) {
                data.expanded = !1;
                angular.forEach(data.folders, function (a) {
                    a.expanded = !1;
                    if (a.folders.length > 0) {
                        angular.forEach(a.folders, function (value) {
                            recursive(value);
                        });
                    }
                });
            }

            recursive(data);
        };

        function startTraverseNode(data) {

            vm.allJobs = [];
            function recursive(data) {
                data.expanded = !0;
                data.folders = orderBy(data.folders, 'name');

                data.jobs = [];
                angular.forEach(vm.jobs, function (value) {
                    if (data.path == value.path.substring(0, value.path.lastIndexOf('/')) || data.path == value.path.substring(0, value.path.lastIndexOf('/') + 1)) {
                        data.jobs.push(value);
                        value.path1 = data.path;

                        if (value.state && value.state._text == 'RUNNING' && vm.userPreferences.showTasks) {
                            JobService.get({
                                jobschedulerId: vm.schedulerIds.selected,
                                jobs: [{job: value.path}]
                            }).then(function (res1) {
                                value = mergePermanentAndVolatile(res1.jobs[0], value);
                            });
                        }

                        vm.allJobs.push(value);
                    }
                });

                data.selected1 = true;
                angular.forEach(data.folders, function (a) {
                    recursive(a);
                });
            }
            recursive(data);
        }

        function expandFolderData(data) {
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.compact = true;
            if (vm.selectedFiltered) {
                obj.regex = vm.selectedFiltered.regex;
                if (vm.selectedFiltered.type && vm.selectedFiltered.type.length > 0) {
                    if (vm.selectedFiltered.type.length > 1) {
                    } else {
                        obj.isOrderJob = vm.selectedFiltered.type[0] == 'order';
                    }
                }
            }
            obj.folders = [{folder: data.path, recursive: false}];
            JobService.getJobsP(obj).then(function (result) {
                if (data.jobs && data.jobs.length > 0) {
                    angular.forEach(result.jobs, function (newValue, index) {
                        for (var i = 0; i < data.jobs.length; i++) {
                            if (result.jobs[index].path == data.jobs[i].path) {
                                result.jobs[index].path1 = data.jobs[i].path1;
                                result.jobs[index].showJobChains = data.jobs[i].showJobChains;
                                data.jobs.splice(i, 1);
                                break;
                            }
                        }
                    });
                }

                data.jobs = result.jobs;
                volatileFolderData(data, obj);
            }, function () {
                volatileFolderData(data, obj);
            });
        }

        function expandFolderData1(data) {

            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.compact = true;
            for (var i = 0; i < data.jobs.length; i++) {
                if (data.jobs[i].showJobChains) {
                    obj.compact = false;
                    break;
                }
            }
            if (vm.selectedFiltered) {
                obj.regex = vm.selectedFiltered.regex;
                if (vm.selectedFiltered.type && vm.selectedFiltered.type.length > 0) {
                    if (vm.selectedFiltered.type.length > 1) {
                    } else {
                        obj.isOrderJob = vm.selectedFiltered.type[0] == 'order';
                    }
                }
            } else {
                if (vm.jobFilters.filter.type != 'ALL') {
                    obj.isOrderJob = vm.jobFilters.filter.type == 'order';
                }
            }
            obj.folders = [{folder: data.path, recursive: false}];
            JobService.getJobsP(obj).then(function (result) {
                if (data.jobs && data.jobs.length > 0) {
                    angular.forEach(result.jobs, function (newValue, index) {
                        for (var i = 0; i < data.jobs.length; i++) {
                            if (result.jobs[index].path == data.jobs[i].path) {
                                result.jobs[index].path1 = data.jobs[i].path1;
                                result.jobs[index].showJobChains = data.jobs[i].showJobChains;
                                data.jobs.splice(i, 1);
                                break;
                            }
                        }
                    });
                }
                data.jobs = result.jobs;
                volatileFolderData1(data, obj);
            }, function () {
                volatileFolderData1(data, obj);
            });
        }

        function volatileFolderData(data1, obj) {
            if (vm.scheduleState == 'UNREACHABLE') {
                if (data1.jobs.length > 0) {
                    angular.forEach(data1.jobs, function (value) {
                        var flag = true;
                        value.path1 = data1.path;

                        for (var i = 0; i < vm.allJobs.length; i++) {
                            if (value.path == vm.allJobs[i].path) {
                                flag = false;
                                break;
                            }
                        }
                        if (flag)
                            vm.allJobs.push(value);

                        if (value.path == vm.jobFilters.showTaskPanel) {
                            vm.showTaskFuc(vm.allJobs[i]);
                        }
                    });
                }
                vm.folderPath = data1.name || '/';

                vm.loading = false;
                return;
            }
            if (vm.selectedFiltered) {
                obj = parseDate(obj);
            } else {
                if (vm.jobFilters.filter.state != 'ALL') {
                    obj.states = [];
                    obj.states.push(vm.jobFilters.filter.state);
                }
            }

            JobService.get(obj).then(function (res) {

                var data = [];
                if (data1.jobs && data1.jobs.length > 0) {
                    angular.forEach(data1.jobs, function (job) {
                        for (var i = 0; i < res.jobs.length; i++) {
                            if (job.path == res.jobs[i].path) {
                                job = mergePermanentAndVolatile(res.jobs[i], job);
                                data.push(job);
                                res.jobs.splice(i, 1);
                                break;
                            }
                        }
                    });
                    data = data.concat(res.jobs);
                    data1.jobs = data;
                } else {
                    data1.jobs = res.jobs;
                }

                angular.forEach(data1.jobs, function (value) {
                    var flag = true;

                    value.path1 = data1.path;

                    angular.forEach(vm.allJobs, function (value1, index1) {
                        if (value.path == value1.path) {
                            flag = false;
                        }
                        if (flag && value1.state && value1.state._text == 'RUNNING' && vm.userPreferences.showTasks) {
                            vm.allJobs[index1].showJobChains = true;
                            JobService.get({
                                jobschedulerId: vm.schedulerIds.selected,
                                jobs: [{job: value1.path}]
                            }).then(function () {
                                vm.allJobs[index1] = mergePermanentAndVolatile(res.jobs[0], vm.allJobs[index1]);
                            });
                        }
                    });
                    if (flag)
                        vm.allJobs.push(value);

                    if (value.path == vm.jobFilters.showTaskPanel) {
                        vm.showTaskFuc(value);
                    }
                });

                vm.folderPath = data1.name || '/';

                vm.loading = false;


            }, function () {
                if (data1.jobs.length > 0) {
                    angular.forEach(data1.jobs, function (value) {
                        var flag = true;
                        value.path1 = data1.path;

                        for (var i = 0; i < vm.allJobs.length; i++) {
                            if (value.path == vm.allJobs[i].path) {
                                flag = false;
                                break;
                            }
                        }
                        if (flag)
                            vm.allJobs.push(value);

                        if (value.path == vm.jobFilters.showTaskPanel) {
                            vm.showTaskFuc(vm.allJobs[i]);
                        }
                    });
                }
                vm.folderPath = data1.name || '/';

                vm.loading = false;
            });
        }

        function volatileFolderData1(data, obj) {
            if (vm.scheduleState == 'UNREACHABLE') {
                var temp = [];
                if (data.jobs.length > 0) {
                    for (var x = 0; x < vm.allJobs.length; x++) {
                        if (vm.allJobs[x].path1 != data.path) {
                            temp.push(vm.allJobs[x]);
                        }
                    }
                    angular.forEach(data.jobs, function (value) {
                        for (var x = 0; x < temp.length; x++) {
                            if (temp[x].path1 == data.path && temp[x].path == value.path) {
                                temp[x].splice(x, 1);
                                break;
                            }
                        }
                        value.path1 = data.path;
                        temp.push(value);
                    });

                }
                vm.allJobs = angular.copy(temp);
                vm.folderPath = data.name || '/';

                vm.loading = false;
                return;
            }
            if (vm.selectedFiltered) {
                obj = parseDate(obj);
            } else {
                if (vm.jobFilters.filter.state != 'ALL') {
                    obj.states = [];
                    obj.states.push(vm.jobFilters.filter.state);
                }
            }

            JobService.get(obj).then(function (res) {
                var data1 = [];
                if (data.jobs && data.jobs.length > 0) {
                    angular.forEach(data.jobs, function (job) {
                        for (var i = 0; i < res.jobs.length; i++) {
                            if (job.path == res.jobs[i].path) {
                                job = mergePermanentAndVolatile(res.jobs[i], job);
                                data1.push(job);
                                res.jobs.splice(i, 1);
                                break;
                            }
                        }
                    });
                    data1 = data1.concat(res.jobs);
                    data.jobs = data1;
                } else {
                    data.jobs = res.jobs;
                }

                var temp = [];
                if (data.jobs.length > 0) {
                    for (var x = 0; x < vm.allJobs.length; x++) {
                        if (vm.allJobs[x].path1 != data.path) {
                            temp.push(vm.allJobs[x]);
                        }
                    }
                    angular.forEach(data.jobs, function (value) {
                        value.path1 = data.path;
                        temp.push(value);
                    });
                }
                vm.allJobs = angular.copy(temp);
                angular.forEach(vm.allJobs, function (value1, index1) {
                    if (value1.state && value1.state._text == 'RUNNING' && vm.userPreferences.showTasks) {
                        vm.allJobs[index1].showJobChains = true;
                        JobService.get({
                            jobschedulerId: vm.schedulerIds.selected,
                            jobs: [{job: value1.path}]
                        }).then(function (res1) {
                            vm.allJobs[index1] = mergePermanentAndVolatile(res1.jobs[0], vm.allJobs[index1]);
                        });
                    }
                });

                vm.folderPath = data.name || '/';

                vm.loading = false;

            }, function () {
                var temp = [];
                if (data.jobs.length > 0) {

                    for (var x = 0; x < vm.allJobs.length; x++) {
                        if (vm.allJobs[x].path1 != data.path) {
                            temp.push(vm.allJobs[x]);
                        }
                    }

                    angular.forEach(data.jobs, function (value) {
                        for (var x = 0; x < temp.length; x++) {
                            if (temp[x].path1 == data.path && temp[x].path == value.path) {
                                temp[x].splice(x, 1);
                                break;
                            }
                        }
                        value.path1 = data.path;
                        temp.push(value);
                    });

                }
                vm.allJobs = angular.copy(temp);
                vm.folderPath = data.name || '/';

                vm.loading = false;
            });
        }

        function navFullTree() {
            angular.forEach(vm.tree, function (value) {
                value.selected1 = false;
                if (value.expanded) {
                    traverseTree1(value);
                }
            });
        }

        function traverseTree1(data) {
            angular.forEach(data.folders, function (value) {
                value.selected1 = false;
                if (value.expanded) {
                    traverseTree1(value);
                }
            });
        }

        var count = 1, splitPath = [];

        function checkExpand(data) {
            if (data.selected1) {
                data.jobs = [];
                expandFolderData(data);
                vm.folderPath = data.name || '/';

                angular.forEach(data.jobs, function (a) {
                    a.path1 = data.path;
                    vm.allJobs.push(a);
                });
            }
            if (data.folders && data.folders.length > 0) {
                data.folders = orderBy(data.folders, 'name');
                for (var x = 0; x < data.folders.length; x++) {
                    if (vm.expand_to) {

                        if (vm.flag && data.folders[x].path.substring(1, data.folders[x].path.length) == splitPath[count] && count < splitPath.length) {
                            count = count + 1;
                            splitPath[count] = splitPath[count - 1] + '/' + splitPath[count];

                            data.folders[x].expanded = true;
                            if (vm.expand_to.name == data.folders[x].name) {
                                data.folders[x].selected1 = true;
                                vm.flag = false;
                                count = 1;
                                splitPath = [];

                            }
                        }
                    }
                    checkExpand(data.folders[x]);
                    if (data.folders[x].expanded || data.folders[x].selected1) {
                        if (data.path == '/') {
                            data.selected1 = false;
                        }
                    }
                }
            }
        }

        function filteredTreeData() {
            angular.forEach(vm.tree, function (value) {
                if ($rootScope.job_expand_to) {
                    vm.expand_to = angular.copy($rootScope.job_expand_to);
                    splitPath = vm.expand_to.path.split('/');
                    $rootScope.job_expand_to = '';
                    vm.flag = true;
                }
                if (splitPath.length < 2) {
                    value.selected1 = true;
                }
                value.expanded = true;

                vm.allJobs = [];
                checkExpand(value);
            });
        }

        function checkExpandTreeForUpdates(data) {
            if (data.selected1) {
                obj.folders.push({folder: data.path, recursive: false});
                obj1.folders.push({folder: data.path, recursive: false});
                vm.folderPath = data.name || '/';
            }
            data.folders = orderBy(data.folders, 'name');
            angular.forEach(data.folders, function (value) {
                if (value.expanded || value.selected1)
                    checkExpandTreeForUpdates(value);
            });
        }

        function insertData(node, x) {
            var _temp = angular.copy(node.jobs);
            node.jobs = [];
            for (var i = 0; i < x.length; i++) {
                if (node.path == x[i].path.substring(0, x[i].path.lastIndexOf('/')) || (node.path == x[i].path.substring(0, x[i].path.lastIndexOf('/') + 1))) {
                    x[i].path1 = node.path;
                    if(_temp && _temp.length>0){
                        for(var j=0; j < _temp.length;j++){
                            if(_temp[j].path == x[i].path){
                                 x[i].showJobChains = _temp[j].showJobChains;
                                if(x[i].showJobChains){
                                   x[i].jobChains = _temp[j].jobChains;
                                }
                                break;
                            }
                        }
                    }
                    node.jobs.push(x[i]);
                    vm.allJobs.push(x[i]);
                }
            }
            angular.forEach(node.folders, function (value) {
                if (value.expanded || value.selected1)
                    insertData(value, x);
            });
        }

        function parseDate(obj) {
            var fromDate;
            var toDate;

            if (vm.selectedFiltered.state && vm.selectedFiltered.state.length > 0) {
                obj.states = vm.selectedFiltered.state;
            }
            if (vm.selectedFiltered.planned) {
                if (/^\s*(now\s*\+)\s*(\d+)\s*$/i.test(vm.selectedFiltered.planned)) {
                    fromDate = new Date();
                    toDate = new Date();
                    var seconds = parseInt(/^\s*(now\s*\+)\s*(\d+)\s*$/i.exec(vm.selectedFiltered.planned)[2]);
                    toDate.setSeconds(toDate.getSeconds() + seconds);
                } else if (/^\s*(\d+)(h|d|w|M|y)\s*$/.test(vm.selectedFiltered.planned)) {
                    obj.dateFrom = vm.selectedFiltered.planned;
                } else if (/^\s*(Today)\s*$/i.test(vm.selectedFiltered.planned)) {
                    fromDate = '0d';
                    toDate = '0d';
                } else if (/^\s*(now)\s*$/i.test(vm.selectedFiltered.planned)) {
                    fromDate = new Date();
                    toDate = new Date();
                } else if (/^\s*(\d+)(h|d|w|M|y)\s*to\s*(\d+)(h|d|w|M|y)\s*$/.test(vm.selectedFiltered.planned)) {
                    var date = /^\s*(\d+)(h|d|w|M|y)\s*to\s*(\d+)(h|d|w|M|y)\s*$/.exec(vm.selectedFiltered.planned);
                    var arr = date[0].split('to');
                    fromDate = arr[0].trim();
                    toDate = arr[1].trim();
                } else if (/^\s*(\d+)(h|d|w|M|y)\s*to\s*(\d+)(h|d|w|M|y)\s*[+,-](\d+)(h|d|w|M|y)\s*$/.test(vm.selectedFiltered.planned)) {
                    var date = /^\s*(\d+)(h|d|w|M|y)\s*to\s*(\d+)(h|d|w|M|y)\s*[+,-](\d+)(h|d|w|M|y)\s*$/.exec(vm.selectedFiltered.planned);
                    var arr = date[0].split('to');
                    fromDate = arr[0].trim();
                    toDate = arr[1].trim();
                } else if (/^\s*(\d+)(h|d|w|M|y)\s*[+,-](\d+)(h|d|w|M|y)\s*to\s*(\d+)(h|d|w|M|y)\s*[+,-](\d+)(h|d|w|M|y)\s*$/.test(vm.selectedFiltered.planned)) {
                    var date = /^\s*(\d+)(h|d|w|M|y)\s*[+,-](\d+)(h|d|w|M|y)\s*to\s*(\d+)(h|d|w|M|y)\s*[+,-](\d+)(h|d|w|M|y)\s*$/.exec(vm.selectedFiltered.planned);
                    var arr = date[0].split('to');
                    fromDate = arr[0].trim();
                    toDate = arr[1].trim();
                } else if (/^\s*(\d+)(h|d|w|M|y)\s*[+,-](\d+)(h|d|w|M|y)\s*to\s*(\d+)(h|d|w|M|y)\s*$/.test(vm.selectedFiltered.planned)) {
                    var date = /^\s*(\d+)(h|d|w|M|y)\s*[+,-](\d+)(h|d|w|M|y)\s*to\s*(\d+)(h|d|w|M|y)\s*$/.exec(vm.selectedFiltered.planned);
                    var arr = date[0].split('to');
                    fromDate = arr[0].trim();
                    toDate = arr[1].trim();
                } else if (/^\s*(\d+):(\d+)\s*(am|pm)\s*to\s*(\d+):(\d+)\s*(am|pm)\s*$/i.test(vm.selectedFiltered.planned)) {
                    var time = /^\s*(\d+):(\d+)\s*(am|pm)\s*to\s*(\d+):(\d+)\s*(am|pm)\s*$/i.exec(vm.selectedFiltered.planned);
                    fromDate = new Date();
                    if (/(pm)/i.test(time[3]) && parseInt(time[1]) != 12) {
                        fromDate.setHours(parseInt(time[1]) + 12);
                    } else {
                        fromDate.setHours(parseInt(time[1]));
                    }
                    fromDate.setMinutes(parseInt(time[2]));
                    toDate = new Date();
                    if (/(pm)/i.test(time[6]) && parseInt(time[4]) != 12) {
                        toDate.setHours(parseInt(time[4]) + 12);
                    } else {
                        toDate.setHours(parseInt(time[4]));
                    }
                    toDate.setMinutes(parseInt(time[5]));
                }
            }

            if (fromDate && toDate) {
                obj.dateFrom = fromDate;
                obj.dateTo = toDate;
            }
            obj.timeZone = vm.userPreferences.zone;
            if ((obj.dateFrom && typeof obj.dateFrom.getMonth === 'function') || (obj.dateTo && typeof obj.dateTo.getMonth === 'function')) {
                delete obj['timeZone']
            }
            return obj;
        }

        function volatileInformation(obj, expandNode) {

            if (vm.selectedFiltered) {
                obj = parseDate(obj);
                if (vm.selectedFiltered.type && vm.selectedFiltered.type.length > 0) {
                    if (vm.selectedFiltered.type.length > 1) {
                    } else {
                        obj.isOrderJob = vm.selectedFiltered.type[0] == 'order';
                    }
                }
            } else {
                if (vm.jobFilters.filter.state != 'ALL') {
                    obj.states = [];
                    obj.states.push(vm.jobFilters.filter.state);
                }
            }
            JobService.get(obj).then(function (res) {
                var data = [];
                if (vm.jobs && vm.jobs.length > 0) {
                    angular.forEach(vm.jobs, function (job) {
                        for (var i = 0; i < res.jobs.length; i++) {
                            if (job.path == res.jobs[i].path) {
                                job = mergePermanentAndVolatile(res.jobs[i], job);
                                data.push(job);
                                res.jobs.splice(i, 1);
                                break;
                            }
                        }
                    });
                    data = data.concat(res.jobs);
                    vm.jobs = data;
                } else {
                    vm.jobs = res.jobs;
                }
                if (expandNode) {
                    startTraverseNode(expandNode);
                }
                vm.loading = false;
            }, function () {

                if (expandNode) {
                    startTraverseNode(expandNode);
                }
                vm.loading = false;
            });
        }

        var obj = {};
        var obj1 = {};
        vm.changeStatus = function () {
            vm.hideTaskPanel();
            vm.allJobs = [];
            vm.loading = true;
            obj = {};
            obj1 = {};
            obj.folders = [];
            obj1.folders = [];
            obj.jobschedulerId = vm.schedulerIds.selected;
            if (!vm.showTask)
                obj.compact = true;
            if (vm.selectedFiltered) {
                obj.regex = vm.selectedFiltered.regex;
                obj1.regex = vm.selectedFiltered.regex;
                if (vm.selectedFiltered.state)
                    obj.states = vm.selectedFiltered.state;
                if (vm.selectedFiltered.type && vm.selectedFiltered.type.length > 0) {
                    if (vm.selectedFiltered.type.length > 1) {
                    } else {
                        obj.isOrderJob = vm.selectedFiltered.type[0] == 'order';
                        obj1.isOrderJob = vm.selectedFiltered.type[0] == 'order';
                    }
                }
            } else {
                if (vm.jobFilters.filter.state != 'ALL') {
                    obj.states = [];
                    obj.states.push(vm.jobFilters.filter.state);
                }
                if (vm.jobFilters.filter.type != 'ALL') {
                    obj.isOrderJob = vm.jobFilters.filter.type == 'order';
                    obj1.isOrderJob = vm.jobFilters.filter.type == 'order';
                }
            }

            obj1.jobschedulerId = vm.schedulerIds.selected;
            obj1.compact = true;

            for (var i = 0; i < vm.tree.length; i++) {
                if (vm.tree[i].expanded || vm.tree[i].selected1)
                    checkExpandTreeForUpdates(vm.tree[i]);
            }

            JobService.getJobsP(obj1).then(function (result) {
                if (vm.scheduleState == 'UNREACHABLE') {
                    angular.forEach(vm.tree, function (node) {
                        insertData(node, result.jobs);
                    });
                    vm.loading = false;
                }
                vm.allJobs = [];
                JobService.get(obj).then(function (res) {

                    if (result.jobs && result.jobs.length > 0) {

                        var x = [];
                        angular.forEach(result.jobs, function (job) {
                            for (var i = 0; i < res.jobs.length; i++) {
                                if (job.path == res.jobs[i].path) {
                                    job = mergePermanentAndVolatile(res.jobs[i], job);
                                    if (job.state && job.state._text == 'RUNNING' && vm.userPreferences.showTasks) {
                                        job.showJobChains = true;
                                    }
                                    x.push(job);
                                    res.jobs.splice(i, 1);
                                    break;
                                }
                            }
                        });
                        angular.forEach(vm.tree, function (node) {
                            insertData(node, x);
                        })
                    } else {
                        angular.forEach(vm.tree, function (node) {
                            insertData(node, res.jobs);
                        })
                    }

                    vm.loading = false;
                }, function () {
                    angular.forEach(vm.tree, function (node) {
                        insertData(node, result.jobs);
                    });
                    vm.loading = false;
                });
            }, function () {
                JobService.get(obj).then(function (res) {
                    if (res.jobs) {
                        vm.allJobs = [];
                        angular.forEach(vm.tree, function (node) {
                            insertData(node, res.jobs);
                        })
                    }
                    vm.loading = false;
                }, function () {
                    vm.loading = false;
                });
            });
        };

        vm.load = function () {
            initTree();
        };

        /**--------------- Checkbox functions -------------*/
        vm.allCheck = {
            checkbox: false
        };
        vm.allTaskCheck ={checkbox: false};
        vm.allOrderCheck ={checkbox: false};


        var watcher1 = $scope.$watchCollection('object.jobs', function (newNames) {
            if (newNames && newNames.length > 0) {
                vm.allCheck.checkbox = newNames.length == vm.allJobs.slice((vm.userPreferences.entryPerPage * (vm.jobFilters.currentPage - 1)), (vm.userPreferences.entryPerPage * vm.jobFilters.currentPage)).length;

                vm.isTasks = false;
                vm.isStopped = false;
                vm.isUnstopped = false;
                vm.isStart = false;
                angular.forEach(newNames, function (value) {
                    if (value.state && value.state._text == 'RUNNING') {
                        vm.isTasks = true;
                    }
                    if (value.state && value.state._text == 'STOPPED') {
                        vm.isStopped = true;
                    } else {
                        vm.isUnstopped = true;
                    }
                    if ((value.ordersSummary && value.ordersSummary.pending != undefined) || (value.configurationStatus && value.configurationStatus.severity==2)) {
                        vm.isStart = true;
                    }
                    if(value.isShellJob == true){
                        vm.isStart = false;
                    }
                });
            } else {
                vm.reset();
            }
        });

        var watcher2 = $scope.$watchCollection('object.tasks', function (newNames) {
            if (newNames && newNames.length > 0 && vm.showTaskPanel.taskQueue) {
                vm.allTaskCheck.checkbox = newNames.length == vm.showTaskPanel.taskQueue.length;
            }else {
                vm.allTaskCheck.checkbox = false;
                vm.object.tasks = [];
            }
        });

        var watcher3 = $scope.$watchCollection('object.orders', function (newNames) {
            if (newNames && newNames.length > 0 && vm.queueOrders && vm.queueOrders.orderQueue) {
                vm.allOrderCheck.checkbox = newNames.length == vm.queueOrders.orderQueue.length;
            }else {
                vm.allOrderCheck.checkbox = false;
                vm.object.orders = [];
            }
        });

        var watcher4 = $scope.$watch('userPreferences.entryPerPage', function (newNames) {
            if (newNames)
                vm.reset();
        });
        vm.checkAll = function () {
            if (vm.allCheck.checkbox && vm.allJobs.length > 0) {
                vm.object.jobs = vm.allJobs.slice((vm.userPreferences.entryPerPage * (vm.jobFilters.currentPage - 1)), (vm.userPreferences.entryPerPage * vm.jobFilters.currentPage));
            } else {
                vm.reset();
            }
        };
        vm.checkAllTask = function () {
            if (vm.showTaskPanel.taskQueue && vm.allTaskCheck.checkbox && vm.showTaskPanel.taskQueue.length > 0) {
                vm.object.tasks = vm.showTaskPanel.taskQueue;
            }else {
                vm.object.tasks = [];
            }
        };
        vm.checkAllOrder = function () {
            if (vm.queueOrders && vm.allOrderCheck.checkbox && vm.queueOrders.orderQueue.length > 0) {
                vm.object.orders = [];
               angular.forEach(vm.queueOrders.orderQueue, function(order){
                   if(order._type !='PERMANENT'){
                       vm.object.orders.push(order)
                   }
               });
                if(vm.object.orders.length==0){
                    vm.allOrderCheck.checkbox =  false;
                }
            }else {
                vm.object.orders = [];
            }
        };
        /**--------------- sorting and pagination -------------------*/
        vm.pageChange = function () {
            vm.reset();
        };

        vm.sortBy = function (propertyName) {
            vm.reset();
            vm.jobFilters.reverse = !vm.jobFilters.reverse;
            vm.jobFilters.filter.sortBy = propertyName;
        };

        vm.hidePanel = function () {
            $('#rightPanel1').addClass('m-l-0 fade-in');
            $('#rightPanel1').find('.parent .child').removeClass('col-xxl-3 col-lg-4').addClass('col-xxl-2 col-lg-3');
            $('#leftPanel').hide();
            $('.sidebar-btn').show();
        };

        vm.showLeftPanel = function () {
            $('#rightPanel1').removeClass('fade-in m-l-0');
            $('#rightPanel1').find('.parent .child').addClass('col-xxl-3 col-lg-4').removeClass('col-xxl-2 col-lg-3');
            $('#leftPanel').show();
            $('.sidebar-btn').hide();

        };
        function parseDateForSearch(obj) {
            var fromDate;
            var toDate;

            if (vm.jobFilter.fromDate) {
                fromDate = new Date(vm.jobFilter.fromDate);
                if (vm.jobFilter.fromTime) {
                    fromDate.setHours(moment(vm.jobFilter.fromTime, 'HH:mm:ss').hours());
                    fromDate.setMinutes(moment(vm.jobFilter.fromTime, 'HH:mm:ss').minutes());
                    fromDate.setSeconds(moment(vm.jobFilter.fromTime, 'HH:mm:ss').seconds());
                } else {
                    fromDate.setHours(0);
                    fromDate.setMinutes(0);
                    fromDate.setSeconds(0);
                }
                fromDate.setMilliseconds(0);

            }
            if (vm.jobFilter.toDate) {
                toDate = new Date(vm.jobFilter.toDate);
                if (vm.jobFilter.toTime) {
                    toDate.setHours(moment(vm.jobFilter.toTime, 'HH:mm:ss').hours());
                    toDate.setMinutes(moment(vm.jobFilter.toTime, 'HH:mm:ss').minutes());
                    toDate.setSeconds(moment(vm.jobFilter.toTime, 'HH:mm:ss').seconds());
                } else {
                    toDate.setHours(0);
                    toDate.setMinutes(0);
                    toDate.setSeconds(0);

                }
                toDate.setMilliseconds(0);
            }

            if (fromDate && toDate) {
                obj.dateFrom = fromDate;
                obj.dateTo = toDate;
            }
            return obj;
        }


        vm.saveAsFilter = function (form) {
            var configObj = {};
            configObj.jobschedulerId = vm.schedulerIds.selected;
            configObj.account = vm.permission.user;
            configObj.configurationType = "CUSTOMIZATION";
            configObj.objectType = "JOB";
            configObj.name = vm.jobFilter.name;
            configObj.id = 0;
            // configObj.shared = vm.jobFilter.shared;

            configObj.configurationItem = JSON.stringify(vm.jobFilter);
            UserService.saveConfiguration(configObj).then(function (res) {
                configObj.id = res.id;
                vm.jobFilter.name = '';
                if (form)
                    form.$setPristine();
                vm.jobFilterList.push(configObj);
            });
        };
        vm.advancedSearch = function () {
            vm.jobFilter = {};
            vm.isUnique = true;
            vm.showSearchPanel = true;
            vm.jobFilter.fromDate = new Date();
            vm.jobFilter.fromTime = "00:00";
            vm.jobFilter.toDate = new Date();
            vm.jobFilter.toDate.setDate(vm.jobFilter.toDate.getDate() + 1);
            vm.jobFilter.toTime = "00:00";
        };
        vm.cancel = function (form) {
            vm.showSearchPanel = false;
            vm.jobFilter = {};
            if (form)
                form.$setPristine();
        };
        function searchV(obj) {
            if (vm.jobFilter && vm.jobFilter.state) {
                obj.states = vm.jobFilter.state;
            }
            obj = parseDateForSearch(obj);
            JobService.get(obj).then(function (res) {
                var data = [];
                if (vm.jobs && vm.jobs.length > 0) {
                    angular.forEach(vm.jobs, function (job) {
                        for (var i = 0; i < res.jobs.length; i++) {
                            if (job.path == res.jobs[i].path) {
                                job = mergePermanentAndVolatile(res.jobs[i], job);
                                job.path1 = job.path.substring(0, job.path.lastIndexOf('/')) || job.path.substring(0, job.path.lastIndexOf('/') + 1);
                                data.push(job);
                                res.jobs.splice(i, 1);
                                break;
                            }
                        }
                    });

                } else {
                    for (var i = 0; i < res.jobs.length; i++) {
                        res.jobs[i].path1 = res.jobs[i].path.substring(0, res.jobs[i].path.lastIndexOf('/')) || res.jobs[i].path.substring(0, res.jobs[i].path.lastIndexOf('/') + 1);
                        data.push(res.jobs);
                    }
                }
                data = data.concat(res.jobs);
                vm.jobs = data;
                vm.allJobs = angular.copy(vm.jobs);
                traverseTreeForSearchData();
            }, function () {
                angular.forEach(vm.jobs, function (job) {
                    job.path1 = job.path.substring(0, job.path.lastIndexOf('/')) || job.path.substring(0, job.path.lastIndexOf('/'));
                });
                vm.allJobs = angular.copy(vm.jobs);
                traverseTreeForSearchData();
            });
        }

        vm.search = function () {
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.compact = true;
            if (vm.jobFilter && vm.jobFilter.regex) {
                obj.regex = vm.jobFilter.regex;
            }
            if (vm.jobFilter.type && vm.jobFilter.type.length > 0) {
                if (vm.jobFilter.type.length > 1) {
                } else {
                    obj.isOrderJob = vm.jobFilter.type[0] == 'order';
                }
            }
            if (vm.jobFilter && vm.jobFilter.paths && vm.jobFilter.paths.length > 0) {
                obj.folders = [];
                for (var i = 0; i < vm.jobFilter.paths.length; i++) {
                    obj.folders.push({folder: vm.jobFilter.paths[i], recursive: true});
                }
            }

            JobService.getJobsP(obj).then(function (result) {
                vm.jobs = result.jobs;
                searchV(obj);
            }, function () {
                searchV(obj);
            });
        };


        function traverseTreeForSearchData() {
            function traverseTree1(data) {
                for (var i = 0; i < data.folders.length; i++) {
                    data.folders[i].selected1 = false;
                    data.folders[i].expanded = true;
                    data.folders[i].jobs = [];
                    pushJobChain(data.folders[i]);
                    traverseTree1(data.folders[i]);
                }
            }
            function navFullTree() {
                for (var i = 0; i < vm.tree.length; i++) {
                    vm.tree[i].selected1 = true;
                    vm.tree[i].expanded = true;
                    vm.tree[i].jobs = [];
                    pushJobChain(vm.tree[i]);
                    traverseTree1(vm.tree[i]);
                }
            }
            function pushJobChain(data) {
                angular.forEach(vm.jobs, function (jobChain) {
                    if (data.path == jobChain.path1) {
                        data.selected1 = true;
                        data.jobs.push(jobChain);
                    }
                });
            }
            navFullTree();
        }

        function isCustomizationSelected(flag) {
            if (flag) {
                vm.temp_filter.state = angular.copy(vm.jobFilters.filter.state);
                vm.temp_filter.type = angular.copy(vm.jobFilters.filter.type);
                vm.jobFilters.filter.state = '';
                vm.jobFilters.filter.type = '';
            } else {
                if (vm.temp_filter.state) {
                    vm.jobFilters.filter.state = angular.copy(vm.temp_filter.state);
                    vm.jobFilters.filter.type = angular.copy(vm.temp_filter.type);
                } else {
                    vm.jobFilters.filter.state = 'ALL';
                    vm.jobFilters.filter.type = 'ALL';
                }
            }
        }

        vm.applyFilter = function () {
            vm.cancel();
            vm.jobFilter = {};
            vm.jobFilter.planned = 'today';
            vm.isUnique = true;
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/job-filter-dialog.html',
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
                configObj.objectType = "JOB";
                configObj.name = vm.jobFilter.name;
                configObj.id = 0;
                configObj.shared = vm.jobFilter.shared;

                configObj.configurationItem = JSON.stringify(vm.jobFilter);
                UserService.saveConfiguration(configObj).then(function (res) {
                    configObj.id = res.id;
                    vm.jobFilterList.push(configObj);
                    if (vm.jobFilterList.length == 1) {
                        vm.savedJobFilter.selected = res.id;
                        vm.selectedFiltered = vm.jobFilter;
                        vm.selectedFiltered.account = vm.permission.user;
                        vm.jobFilters.selectedView = true;
                        isCustomizationSelected(true);
                        SavedFilter.setJob(vm.savedJobFilter);
                        SavedFilter.save();
                        vm.load();
                    }
                });
                vm.object.paths = [];
            }, function () {
                vm.object.paths = [];
            });
        };

        vm.editFilters = function () {
            vm.filters = {};
            vm.filters.list = vm.jobFilterList;
            vm.filters.favorite = vm.savedJobFilter.favorite;
            $uibModal.open({
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
                vm.jobFilter = JSON.parse(conf.configuration.configurationItem);
                vm.jobFilter.shared = filter.shared;
                vm.paths = vm.jobFilter.paths;
                vm.object.paths = vm.paths;
            });

            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/edit-job-filter-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                size: 'lg',
                backdrop: 'static'
            });
            modalInstance.result.then(function () {

                if (vm.savedJobFilter.selected == filter.id) {
                    vm.selectedFiltered = vm.jobFilter;
                    vm.jobFilters.selectedView = true;
                    isCustomizationSelected(true);
                    vm.load();
                }
                var configObj = {};
                configObj.jobschedulerId = filter.jobschedulerId;
                configObj.account = filter.account;
                configObj.configurationType = filter.configurationType;
                configObj.objectType = filter.objectType;
                configObj.configurationItem = JSON.stringify(vm.jobFilter);
                configObj.id = filter.id;
                configObj.name = vm.jobFilter.name;
                configObj.shared = vm.jobFilter.shared;
                filter.shared = vm.jobFilter.shared;
                UserService.saveConfiguration(configObj);
                filter.name = vm.jobFilter.name;
                temp_name = '';
                vm.object.paths = [];
            }, function () {
                temp_name = '';
                vm.object.paths = [];
            });
        };
        vm.copyFilter = function (filter) {
            vm.action = 'copy';
            vm.isUnique = true;
            UserService.configuration({jobschedulerId: filter.jobschedulerId, id: filter.id}).then(function (conf) {
                vm.jobFilter = JSON.parse(conf.configuration.configurationItem);
                vm.jobFilter.shared = filter.shared;
                vm.paths = vm.jobFilter.paths;
                vm.object.paths = vm.paths;
                vm.jobFilter.name = vm.checkCopyName(vm.jobFilterList, filter.name);
            });

            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/edit-job-filter-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                size: 'lg',
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                var configObj = {};
                configObj.account = vm.permission.user;
                configObj.jobschedulerId = filter.jobschedulerId;
                configObj.configurationType = filter.configurationType;
                configObj.objectType = filter.objectType;
                configObj.name = vm.jobFilter.name;
                configObj.id = 0;
                configObj.shared = vm.jobFilter.shared;
                configObj.configurationItem = JSON.stringify(vm.jobFilter);
                UserService.saveConfiguration(configObj).then(function (res) {
                    configObj.id = res.id;
                    vm.jobFilterList.push(configObj);
                });
                vm.object.paths = [];
            }, function () {
                vm.object.paths = [];
            });
        };

        vm.deleteFilter = function (filter) {
            UserService.deleteConfiguration({
                jobschedulerId: filter.jobschedulerId,
                id: filter.id
            }).then(function () {
                angular.forEach(vm.jobFilterList, function (value, index) {
                    if (value.id == filter.id) {
                        vm.jobFilterList.splice(index, 1);
                    }
                });
                if (vm.savedJobFilter.selected == filter.id) {
                    vm.savedJobFilter.selected = undefined;
                    vm.jobFilters.selectedView = false;
                    isCustomizationSelected(false);
                    vm.selectedFiltered = undefined;
                    vm.load();
                } else {
                    if (vm.jobFilterList.length == 0) {
                        vm.savedJobFilter.selected = undefined;
                        vm.jobFilters.selectedView = false;
                        vm.selectedFiltered = undefined;
                        isCustomizationSelected(false);
                    }
                }
                SavedFilter.setJob(vm.savedJobFilter);
                SavedFilter.save();
            });
        };
        vm.makePrivate = function (configObj) {
            UserService.privateConfiguration({
                jobschedulerId: configObj.jobschedulerId,
                id: configObj.id
            }).then(function () {
                configObj.shared = false;
                if (vm.permission.user != configObj.account) {
                    angular.forEach(vm.jobFilterList, function (value, index) {
                        if (value.id == configObj.id) {
                            vm.jobFilterList.splice(index, 1);
                        }
                    });
                }
            });
        };
        vm.makeShare = function (configObj) {
            UserService.shareConfiguration({
                jobschedulerId: configObj.jobschedulerId,
                id: configObj.id
            }).then(function () {
                configObj.shared = true;
            });
        };
        vm.favorite = function (filter) {
            vm.savedJobFilter.favorite = filter.id;
            vm.jobFilters.selectedView = true;
            vm.filters.favorite = filter.id;
            SavedFilter.setJob(vm.savedJobFilter);
            SavedFilter.save();
            vm.load();
        };
        vm.removeFavorite = function () {
            vm.savedJobFilter.favorite = '';
            vm.filters.favorite = '';
            SavedFilter.setJob(vm.savedJobFilter);
            SavedFilter.save();
        };

        vm.checkFilterName = function () {
            vm.isUnique = true;
            angular.forEach(vm.jobFilterList, function (value) {
                if (vm.jobFilter.name == value.name && vm.permission.user == value.account && vm.jobFilter.name != temp_name) {
                    vm.isUnique = false;
                }
            })
        };

        vm.changeFilter = function (filter) {

            vm.cancel();
            if (filter) {
                vm.savedJobFilter.selected = filter.id;
                vm.jobFilters.selectedView = true;
                UserService.configuration({jobschedulerId: filter.jobschedulerId, id: filter.id}).then(function (conf) {
                    vm.selectedFiltered = JSON.parse(conf.configuration.configurationItem);
                    vm.selectedFiltered.account = filter.account;

                    if(vm.selectedFiltered.paths){
                       vm.jobFilters.expand_to = {};
                    }
                    vm.load();
                });
            }
            else {
                isCustomizationSelected(false);
                vm.savedJobFilter.selected = filter;
                vm.jobFilters.selectedView = false;
                vm.selectedFiltered = filter;
                vm.load();
            }
            SavedFilter.setJob(vm.savedJobFilter);
            SavedFilter.save();

        };

        vm.getTreeStructure = function () {
            JobService.tree({
                jobschedulerId: vm.schedulerIds.selected,
                compact: true,
                types: ['JOB']
            }).then(function (res) {
                vm.filterTree1 = res.folders
            }, function () {
                $('#treeModal').modal('hide');
            });
            $('#treeModal').modal('show');
        };

        vm.treeExpand = function (data) {
            angular.forEach(vm.object.paths, function (value) {
                if (data.path == value) {
                    if (data.folders.length > 0) {
                        data.folders = orderBy(data.folders, 'name');
                        angular.forEach(data.folders, function (res) {
                            vm.object.paths.push(res.path);
                        });
                    }
                }
            });
        };

        var watcher5 = $scope.$watchCollection('object.paths', function (newNames) {
            if (newNames && newNames.length > 0) {
                vm.paths = newNames;
            }
        });

        vm.addJobChainPaths = function () {
            vm.jobFilter.paths = vm.paths;
        };

        vm.remove = function (object) {
            for (var i = 0; i < vm.jobFilter.paths.length; i++) {
                if (angular.equals(vm.jobFilter.paths[i], object)) {
                    vm.jobFilter.paths.splice(i, 1);
                    break;
                }
            }
        };

        vm.loadHistory = function (value) {
            var jobs = {};
            jobs.jobschedulerId = vm.schedulerIds.selected;
            jobs.job = value.path;
            JobService.history(jobs).then(function (res) {
                vm.taskHistory = res.history;
            });
        };

        vm.loadAuditLogs = function (value) {
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.jobs = [];
            obj.jobs.push({job: value.path});
            obj.limit = parseInt(vm.userPreferences.maxAuditLogPerObject);
            AuditLogService.getLogs(obj).then(function (result) {
                if (result && result.auditLog) {
                    vm.auditLogs = result.auditLog;
                }
            });
        };

        function getHistoryPanelData(value) {
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.jobs = [];
            obj.jobs.push({job: value.path});
            JobService.getJobsP(obj).then(function (res) {
                value = angular.merge(value, res.job);
                JobService.get(obj).then(function (result) {
                    value = mergePermanentAndVolatile(result.jobs[0], value);
                });
            }, function () {
                JobService.get(obj).then(function (result) {
                    value = mergePermanentAndVolatile(result.jobs[0], value);
                });
            });
            if (value.ordersSummary)
                getQueueOrders(value);
        }

        vm.showTaskFuc = function (value, isRunning) {
            vm.allTaskCheck.checkbox = false;
            vm.object.tasks = [];
            if (isRunning)
                if (value.numOfRunningTasks == 0)return;
            vm.isAuditLog = false;
            vm.loadHistory(value);
            getHistoryPanelData(value);
            vm.showTaskPanel = value;
            vm.isRunning = isRunning;
            vm.jobFilters.showTaskPanel = vm.showTaskPanel.path;
        };

        vm.showAuditLogs = function (value) {
            vm.showTaskPanel = value;
            vm.allTaskCheck.checkbox = false;
            vm.object.tasks = [];
            vm.isAuditLog = true;
            if (vm.permission.AuditLog.view.status)
                vm.loadAuditLogs(value);
            getHistoryPanelData(value);
            vm.jobFilters.showTaskPanel = vm.showTaskPanel.path;
        };

        function getQueueOrders(value) {
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.job = value.path;
            JobService.getQueueOrders(obj).then(function (res) {
                vm.queueOrders = res.job;
            });
        }

        vm.showJobChains = function (job) {
            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            jobs.jobs.push({job: job.path});
            JobService.getJobsP(jobs).then(function (res) {
                job.jobChains = res.jobs[0].jobChains;
                job.showJobChains = true;
                JobService.get(jobs).then(function (result) {
                    job = mergePermanentAndVolatile(result.jobs[0], job);
                });
            });

        };

        vm.hideTaskPanel = function () {
            vm.showTaskPanel = undefined;
            vm.jobFilters.showTaskPanel = undefined;
        };
        vm.expandDetails = function () {
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.jobs = [];
            angular.forEach(vm.allJobs, function (value) {
                obj.jobs.push({job: value.path});
            });

            JobService.getJobsP(obj).then(function (res) {
                angular.forEach(vm.allJobs, function (value, index) {
                    for (var i = 0; i < res.jobs.length; i++) {
                        if (res.jobs[i].path == vm.allJobs[index].path && res.jobs[i].name == vm.allJobs[index].name) {
                            vm.allJobs[index].jobChains = res.jobs[i].jobChains;
                            vm.allJobs[index].showJobChains = true;

                            if (vm.allJobs[index].state && vm.allJobs[index].state._text == 'RUNNING') {
                                JobService.get({
                                    jobschedulerId: vm.schedulerIds.selected,
                                    jobs: [{job: vm.allJobs[index].path}]
                                }).then(function (result) {
                                    if (vm.allJobs[index].path == result.jobs[0].path) {
                                        vm.allJobs[index] = mergePermanentAndVolatile(result.jobs[0], vm.allJobs[index]);
                                    }
                                });
                            }

                            res.jobs.splice(i, 1);
                            break;
                        }
                    }
                });
            });
        };

        vm.collapseDetails = function () {
            angular.forEach(vm.allJobs, function (value) {
                value.showJobChains = false;
            });
        };

        /**--------------- Actions -----------------------------*/
        vm.stop = function (job) {
            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            jobs.jobs.push({job: job.path});
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = job.path;
                vm.comments.title = job.title;
                vm.comments.operation = 'Stop';
                vm.comments.type = 'Job';

                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    jobs.auditLog = {};
                    if (vm.comments.comment)
                        jobs.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        jobs.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        jobs.auditLog.ticketLink = vm.comments.ticketLink;
                    JobService.stop(jobs);
                    vm.reset();
                }, function () {

                });
            } else {
                JobService.stop(jobs);
                vm.reset();
            }

        };
        vm.unstop = function (job) {
            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            jobs.jobs.push({job: job.path});
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = job.path;
                vm.comments.title = job.title;
                vm.comments.operation = 'Unstop';
                vm.comments.type = 'Job';

                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    jobs.auditLog = {};
                    if (vm.comments.comment)
                        jobs.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        jobs.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        jobs.auditLog.ticketLink = vm.comments.ticketLink;
                    JobService.unstop(jobs);
                    vm.reset();
                }, function () {

                });
            } else {
                JobService.unstop(jobs);
                vm.reset();
            }

        };
        vm.start = function (job) {
            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            jobs.jobs.push({job: job.path, at: 'now'});
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = job.path;
                vm.comments.title = job.title;
                vm.comments.operation = 'Start';
                vm.comments.type = 'Job';

                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    jobs.auditLog = {};
                    if (vm.comments.comment)
                        jobs.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        jobs.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        jobs.auditLog.ticketLink = vm.comments.ticketLink;
                    JobService.start(jobs);
                    vm.reset();
                }, function () {

                });
            } else {
                JobService.start(jobs);
                vm.reset();
            }
        };


        function startAt(job, paramObject) {
            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            var obj = {};
            obj.params = job.params;
            obj.job = job.path;

            if (job.date && job.time) {
                job.date.setHours(moment(job.time, 'HH:mm:ss').hours());
                job.date.setMinutes(moment(job.time, 'HH:mm:ss').minutes());
                job.date.setSeconds(moment(job.time, 'HH:mm:ss').seconds());
            }

            if (job.date && job.at == 'later') {
                obj.at = moment(job.date).format("YYYY-MM-DD HH:mm:ss");
                obj.timeZone = job.timeZone;
            }else
                obj.at = job.atTime;

            if (!obj.params && paramObject.params.length > 0) {
                obj.params = paramObject.params;
            } else if (obj.params && paramObject.params.length > 0) {
                obj.params = obj.params.concat(paramObject.params);
            }

            jobs.auditLog = {};

            if (vm.comments.comment) {
                jobs.auditLog.comment = vm.comments.comment;
            }
            if (vm.comments.timeSpent) {
                jobs.auditLog.timeSpent = vm.comments.timeSpent;
            }

            if (vm.comments.ticketLink) {
                jobs.auditLog.ticketLink = vm.comments.ticketLink;
            }

            jobs.jobs.push(obj);
            JobService.start(jobs);
        }

        vm.startAt = function (job) {
            vm.job = job;
            JobService.getJob({
                jobschedulerId: vm.schedulerIds.selected,
                compact: false,
                job: vm.job.path
            }).then(function (res) {
                vm.job = angular.merge(vm.job, res.job);
            });
            vm.paramObject = {};
            vm.paramObject.params = [];
            vm.job.atTime = 'now';
            vm.comments = {};
            vm.comments.radio = 'predefined';
            vm.zones = moment.tz.names();

            if (vm.userPreferences.zone) {
                vm.job.timeZone = vm.userPreferences.zone;
            }
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/start-job-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                startAt(vm.job, vm.paramObject);
                vm.reset();
            }, function () {

            });
        };


        vm.stopAll = function () {
            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            angular.forEach(vm.object.jobs, function (value) {
                jobs.jobs.push({job: value.path});
            });
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = '';
                vm.comments.operation = 'Stop';
                vm.comments.type = 'Job';
                angular.forEach(vm.object.jobs, function (value, index) {
                    if (index == vm.object.jobs.length - 1) {
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
                    jobs.auditLog = {};
                    if (vm.comments.comment)
                        jobs.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        jobs.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        jobs.auditLog.ticketLink = vm.comments.ticketLink;
                    JobService.stop(jobs);
                    vm.reset();
                }, function () {

                });
            } else {
                JobService.stop(jobs);
                vm.reset();
            }

        };
        vm.unStopAll = function () {
            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            angular.forEach(vm.object.jobs, function (value) {
                jobs.jobs.push({job: value.path});
            });
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = '';
                vm.comments.operation = 'Unstop';
                vm.comments.type = 'Job';
                angular.forEach(vm.object.jobs, function (value, index) {
                    if (index == vm.object.jobs.length - 1) {
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
                    jobs.auditLog = {};
                    if (vm.comments.comment)
                        jobs.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        jobs.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        jobs.auditLog.ticketLink = vm.comments.ticketLink;
                    JobService.unstop(jobs);
                    vm.reset();
                }, function () {

                });
            } else {
                JobService.unstop(jobs);
                vm.reset();
            }

        };
        vm.startAll = function () {
            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            angular.forEach(vm.object.jobs, function (value) {
                jobs.jobs.push({job: value.path});
            });
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = '';
                vm.comments.operation = 'Start';
                vm.comments.type = 'Job';
                angular.forEach(vm.object.jobs, function (value, index) {
                    if (index == vm.object.jobs.length - 1) {
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
                    jobs.auditLog = {};
                    if (vm.comments.comment)
                        jobs.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        jobs.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        jobs.auditLog.ticketLink = vm.comments.ticketLink;
                    JobService.start(jobs);
                    vm.reset();
                }, function () {

                });
            } else {
                JobService.start(jobs);
                vm.reset();
            }

        };

        vm.reset = function () {
            vm.allCheck.checkbox = false;
            vm.object.jobs = [];
        };


        function terminateTaskWithTimeout(job, task, path) {

            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            if (!task) {

                if (!job) {
                    angular.forEach(vm.object.jobs, function (value) {
                        jobs.jobs.push({job: value.path});
                    });
                } else {
                    jobs.jobs.push({job: job.path});
                }
            } else {
                var taskIds = [];
                taskIds.push({taskId: task.taskId});
                jobs.jobs.push({job: path, taskIds: taskIds});
            }
            jobs.auditLog = {};

            if (vm.comments.comment) {
                jobs.auditLog.comment = vm.comments.comment;
            }
            if (vm.comments.timeSpent) {
                jobs.auditLog.timeSpent = vm.comments.timeSpent;
            }

            if (vm.comments.ticketLink) {
                jobs.auditLog.ticketLink = vm.comments.ticketLink;
            }
            jobs.timeout = vm.timeout;
            TaskService.terminateWith(jobs);

        }

        vm.terminateTaskWithTimeout = function (job, task, path) {
            if (job) {
                vm.job = job;
            } else if (task && path) {
                vm.task = task;
                vm.path = path;
            }
            else {
                vm.taskJobs = vm.object.jobs;
            }
            vm.timeout = 10;
            vm.comments = {};
            vm.comments.radio = 'predefined';
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/terminate-task-timeout-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                terminateTaskWithTimeout(job, task, path);
                vm.reset();
            }, function () {

            });

        };
        vm.end = function (task, path) {
            var jobs = {};
            jobs.jobs = [];
            var taskIds = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            taskIds.push({taskId: task.taskId});
            jobs.jobs.push({job: path, taskIds: taskIds});
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = path;
                vm.comments.task = task.taskId;
                vm.comments.operation = 'End Task';
                vm.comments.type = 'Job';

                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    jobs.auditLog = {};
                    if (vm.comments.comment)
                        jobs.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        jobs.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        jobs.auditLog.ticketLink = vm.comments.ticketLink;
                    TaskService.end(jobs);
                    vm.reset();
                }, function () {

                });
            } else {
                TaskService.end(jobs);
                vm.reset();
            }

        };

        vm.killTask = function (task, path) {
            var jobs = {};
            jobs.jobs = [];
            var taskIds = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            taskIds.push({taskId: task.taskId});
            jobs.jobs.push({job: path, taskIds: taskIds});
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = path;
                vm.comments.task = task.taskId;
                vm.comments.operation = 'Kill Task';
                vm.comments.type = 'Job';

                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    jobs.auditLog = {};
                    if (vm.comments.comment)
                        jobs.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        jobs.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        jobs.auditLog.ticketLink = vm.comments.ticketLink;
                    TaskService.kill(jobs);
                    vm.reset();
                }, function () {

                });
            } else {
                TaskService.kill(jobs);
                vm.reset();
            }

        };
        vm.terminateTask = function (task, path) {
            var jobs = {};
            jobs.jobs = [];
            var taskIds = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            taskIds.push({taskId: task.taskId});
            jobs.jobs.push({job: path, taskIds: taskIds});
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = path;
                vm.comments.task = task.taskId;
                vm.comments.operation = 'Terminate Task';
                vm.comments.type = 'Job';

                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    jobs.auditLog = {};
                    if (vm.comments.comment)
                        jobs.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        jobs.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        jobs.auditLog.ticketLink = vm.comments.ticketLink;
                    TaskService.terminate(jobs);
                    vm.reset();
                }, function () {

                });
            } else {
                TaskService.terminate(jobs);
                vm.reset();
            }

        };
        vm.killAllTask = function (job) {
            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            if (!job) {
                angular.forEach(vm.object.jobs, function (value) {
                    jobs.jobs.push({job: value.path});
                });
            } else {
                jobs.jobs.push({job: job.path});
            }
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = '';
                vm.comments.operation = 'Kill all Task';
                vm.comments.type = 'Job';
                vm.comments.title = job.title;
                if (!job) {
                    angular.forEach(vm.object.jobs, function (value, index) {
                        if (index == vm.object.jobs.length - 1) {
                            vm.comments.name = vm.comments.name + ' ' + value.path;
                        } else {
                            vm.comments.name = value.path + ', ' + vm.comments.name;
                        }
                    });
                } else {
                    vm.comments.name = job.path;
                }
                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    jobs.auditLog = {};
                    if (vm.comments.comment)
                        jobs.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        jobs.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        jobs.auditLog.ticketLink = vm.comments.ticketLink;
                    TaskService.killAll(jobs);
                    vm.reset();
                }, function () {

                });
            } else {
                TaskService.killAll(jobs);
                vm.reset();
            }
        };
        vm.deleteAllTask = function () {
            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;

            var taskIds =[];
            angular.forEach(vm.object.tasks, function(value){
                taskIds.push({taskId:value.taskId})
            });
            jobs.jobs.push({job: vm.showTaskPanel.path, taskIds: taskIds});

            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = '';
                vm.comments.operation = 'Delete all Task';
                vm.comments.type = 'Job';
                vm.comments.title = vm.showTaskPanel.title;

                vm.comments.name = vm.showTaskPanel.path;

                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    jobs.auditLog = {};
                    if (vm.comments.comment)
                        jobs.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        jobs.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        jobs.auditLog.ticketLink = vm.comments.ticketLink;
                    TaskService.killAll(jobs);
                    vm.allTaskCheck.checkbox = false;
                    vm.object.tasks = [];
                }, function () {
                    vm.allTaskCheck.checkbox = false;
                    vm.object.tasks = [];
                });
            } else {
                TaskService.killAll(jobs);
                vm.allTaskCheck.checkbox = false;
                vm.object.tasks = [];
            }
        };

        vm.terminateAllTask = function (job) {
            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            if (!job) {
                angular.forEach(vm.object.jobs, function (value) {
                    jobs.jobs.push({job: value.path});
                });
            } else {
                jobs.jobs.push({job: job.path});
            }
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = '';
                vm.comments.operation = 'Terminate all Task';
                vm.comments.type = 'Job';
                 vm.comments.title = job.title;
                if (!job) {
                    angular.forEach(vm.object.jobs, function (value, index) {
                        if (index == vm.object.jobs.length - 1) {
                            vm.comments.name = vm.comments.name + ' ' + value.path;
                        } else {
                            vm.comments.name = value.path + ', ' + vm.comments.name;
                        }
                    });
                } else {
                    vm.comments.name = job.path;
                }

                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    jobs.auditLog = {};
                    if (vm.comments.comment)
                        jobs.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        jobs.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        jobs.auditLog.ticketLink = vm.comments.ticketLink;
                    TaskService.terminateAll(jobs);
                    vm.reset();
                }, function () {

                });
            } else {
                TaskService.terminateAll(jobs);
                vm.reset();
            }

        };

        function setRunTime(job) {
            var jobs = {};
            jobs.jobs = [];

            jobs.jobs.push({
                job: job.path,
                runTime: vkbeautify.xmlmin(job.runTime),
                calendars: job.calendars
            });

            jobs.auditLog = {};
            if (vm.comments.comment) {
                jobs.auditLog.comment = vm.comments.comment;
            }
            if (vm.comments.timeSpent) {
                jobs.auditLog.timeSpent = vm.comments.timeSpent;
            }

            if (vm.comments.ticketLink) {
                jobs.auditLog.ticketLink = vm.comments.ticketLink;
            }
            jobs.jobschedulerId = vm.schedulerIds.selected;
            JobService.setRunTime(jobs);
        }

        function loadRuntime(job) {
            vm.order = job;
            vm.comments = {};
            vm.comments.radio = 'predefined';
            vm.scheduleAction = undefined;
            JobService.getRunTime({
                jobschedulerId: vm.schedulerIds.selected,
                job: job.path
            }).then(function (res) {
                if (res.runTime) {
                    vm.runTimes = res.runTime;
                    vm.xml = vm.runTimes.runTime;
                    vm.calendars = vm.runTimes.calendars;
                }
                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/set-run-time-dialog.html',
                    controller: 'RuntimeEditorDialogCtrl',
                    scope: vm,
                    size: 'lg',
                    backdrop: 'static',
                    windowClass: 'fade-modal'
                });
                modalInstance.result.then(function () {
                    setRunTime(job);
                    vm.reset();
                }, function () {

                });

            });
        }

        vm.setRunTime = function (job) {
            loadRuntime(job);
        };


        vm.deleteAllOrder =  function() {

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

                    OrderService.deleteOrder(orders).then(function () {
                        vm.allOrderCheck.checkbox = false;
                        vm.object.orders = [];
                    });

                }, function () {
                    vm.allOrderCheck.checkbox = false;
                    vm.object.orders = [];
                });
            } else {
                OrderService.deleteOrder(orders).then(function () {
                    vm.allOrderCheck.checkbox = false;
                    vm.object.orders = [];
                });
            }
        };
        vm.showAssignedCalendar = function(job) {
            var jobs = {};
            jobs.jobschedulerId = vm.schedulerIds.selected;
            jobs.job = job.path;
            jobs.compact = true;
            JobService.getcalendars(jobs).then(function (res) {
                vm.obj = angular.copy(job);
                vm.obj.calendars = res.calendars;
            });
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/show-assigned-calendar-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                backdrop: 'static'
            });
            modalInstance.result.then(function () {

            }, function () {

            });
        };

        vm.deleteOrder =  function(order) {
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            orders.orders.push({orderId: order.orderId, jobChain: order.jobChain});
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = order.path;
                vm.comments.title = order.title;
                vm.comments.operation = 'Delete';
                vm.comments.type = 'Order';
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
                    OrderService.deleteOrder(orders).then(function () {
                        vm.allOrderCheck.checkbox = false;
                        vm.object.orders = [];

                    });
                }, function () {
                    vm.allOrderCheck.checkbox = false;
                    vm.object.orders = [];
                });
            } else {
                OrderService.deleteOrder(orders).then(function () {
                    vm.allOrderCheck.checkbox = false;
                    vm.object.orders = [];
                });
            }
        };


        var firstDay, lastDay;
        vm.getPlan = function (calendarView, viewDate) {
            var firstDay2 = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0);
            var lastDay2 = new Date(new Date(viewDate).getFullYear(), 11, 31, 23, 59, 0);
            if (calendarView == 'year') {
                if (viewDate.getFullYear() < new Date().getFullYear()) {
                    return;
                }
                else if (viewDate.getFullYear() == new Date().getFullYear()) {
                    firstDay2 = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0);
                }
                else {
                    firstDay2 = new Date(new Date(viewDate).getFullYear(), 0, 1, 0, 0, 0);
                }
            }
            if (calendarView == 'month') {
                if (viewDate.getFullYear() <= new Date().getFullYear() && viewDate.getMonth() < new Date().getMonth()) {
                    return;
                }
                else if (viewDate.getFullYear() == new Date().getFullYear() && viewDate.getMonth() == new Date().getMonth()) {
                    firstDay2 = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0);
                }
                else {
                    firstDay2 = new Date(new Date(viewDate).getFullYear(), new Date(viewDate).getMonth(), 1, 0, 0, 0);

                }
                lastDay2 = new Date(new Date(viewDate).getFullYear(), new Date(viewDate).getMonth() + 1, 0, 23, 59, 0);
            }

            if (new Date(firstDay2) >= new Date(firstDay) && new Date(lastDay2) <= new Date(lastDay)) {
                return;
            }
            firstDay = firstDay2;
            lastDay = lastDay2;

            vm.planItems = [];
            vm.isCaledarLoading = true;
            DailyPlanService.getPlans({
                jobschedulerId: $scope.schedulerIds.selected,
                states: ['PLANNED'],
                job: vm._job.path,
                dateFrom: firstDay,
                dateTo: lastDay
            }).then(function (res) {
                populatePlanItems(res);
                vm.isCaledarLoading = false;
            }, function () {
                vm.isCaledarLoading = false;
            });

        };


        vm.viewCalendar = function (job) {
            vm.maxPlannedTime = undefined;
            vm._job = angular.copy(job);
            vm.planItems = [];
            vm.isCaledarLoading = true;
            firstDay = new Date(new Date().getFullYear(),  new Date().getMonth(),  new Date().getDate(), 0, 0, 0);
            lastDay = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 0);
            DailyPlanService.getPlans({
                jobschedulerId: $scope.schedulerIds.selected,
                states: ['PLANNED'],
                job: vm._job.path,
                dateFrom: firstDay,
                dateTo: lastDay
            }).then(function (res) {
                populatePlanItems(res);
                vm.isCaledarLoading = false;
            }, function () {
                vm.isCaledarLoading = false;
            });
            openCalendar();
        };

        function populatePlanItems(res) {
            vm.planItemData = res.planItems;
            vm.planItemData.forEach(function (data) {
                var planData = {
                    plannedStartTime: data.plannedStartTime,
                    format:vm.getCalendarTimeFormat()
                };
                vm.planItems.push(planData);
                if (res.created) {
                    vm.maxPlannedTime = new Date(res.deliveryDate);
                }
            });
        }

        function openCalendar() {
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/calendar-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                size: 'lg',
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                vm._job = null;
            }, function () {
                vm._job = null;
            });
        }

        vm.viewAllHistories = function () {
            vm.taskHistoryTab = CoreService.getHistoryTab();
            vm.taskHistoryTab.type = 'job';
            $state.go('app.history');
        };

        function recursiveTreeUpdate(scrTree, destTree) {
            if (scrTree && destTree)
                for (var i = 0; i < scrTree.length; i++) {
                    for (var j = 0; j < destTree.length; j++) {
                        if (scrTree[i].path == destTree[j].path) {
                            scrTree[i].jobs = destTree[j].jobs;
                            scrTree[i].expanded = destTree[j].expanded;
                            scrTree[i].selected = destTree[j].selected;
                            scrTree[i].selected1 = destTree[j].selected1;
                            recursiveTreeUpdate(scrTree[i].folders, destTree[j].folders);
                            destTree.splice(j, 1);
                            break;
                        }
                    }
                }
        }

        vm.recursiveTreeUpdate = function (scrTree, destTree) {
            if (scrTree && destTree)
                for (var i = 0; i < scrTree.length; i++) {
                    for (var j = 0; j < destTree.length; j++) {
                        if (scrTree[i].path == destTree[j].path) {
                            scrTree[i].jobs = destTree[j].jobs;
                            scrTree[i].expanded = destTree[j].expanded;
                            scrTree[i].selected = destTree[j].selected;
                            scrTree[i].selected1 = destTree[j].selected1;
                            recursiveTreeUpdate(scrTree[i].folders, destTree[j].folders);
                            destTree.splice(j, 1);
                            break;
                        }
                    }
                }
            return scrTree;
        };


        function recursiveSort(tree) {
            function recursive(data) {
                data.folders = orderBy(data.folders, 'name');
                angular.forEach(data.folders, function (value) {
                    recursive(value);
                });
            }

            angular.forEach(tree, function (value) {
                recursive(value);
            });
        }


        var t1 = '';
        var mapObj = {};
        $scope.$on('event-started', function () {
            if (vm.events && vm.events.length > 0) {
                angular.forEach(vm.events[0].eventSnapshots, function (value1) {

                    if (value1.eventType == "JobStateChanged" && !value1.eventId) {
                        if (value1.path != undefined) {
                            var path = [];
                            if (value1.path.indexOf(",") > -1) {
                                path = value1.path.split(",");
                            } else {
                                path[0] = value1.path;
                            }
                            if ($location.search().path) {
                                if (value1.path == $location.search().path) {
                                    getJobByPath($location.search().path);
                                }
                            } else {
                                if (vm.jobFilters.filter.state == 'ALL') {
                                    angular.forEach(vm.allJobs, function (value2, index) {

                                        if (vm.allJobs[index].path == path[0] && !vm.loading && (!mapObj[vm.allJobs[index].path])) {
                                            mapObj[path[0]] = path[0];
                                            var obj = {};
                                            obj.jobschedulerId = $scope.schedulerIds.selected;
                                            obj.jobs = [];
                                            obj.jobs.push({job: vm.allJobs[index].path});
                                            JobService.get(obj).then(function (res) {
                                                delete mapObj[path[0]];
                                                if (res.jobs && res.jobs.length > 0 && res.jobs[0].path == vm.allJobs[index].path) {
                                                    vm.allJobs[index] = mergePermanentAndVolatile(res.jobs[0], vm.allJobs[index]);
                                                    if (vm.allJobs[index].state && vm.allJobs[index].state._text == 'RUNNING' && vm.showTask) {
                                                        vm.allJobs[index].showJobChains = true;
                                                    }

                                                    if (vm.showTaskPanel && (vm.showTaskPanel.path == vm.allJobs[index].path)) {
                                                        vm.showTaskPanel = vm.allJobs[index];
                                                    }
                                                }
                                            }, function () {
                                                delete mapObj[path[0]];
                                            });
                                        }
                                    });
                                } else {
                                    if (!vm.loading)
                                        navFullTreeForUpdateJob(path[0].substring(0, path[0].lastIndexOf('/')));
                                }
                            }

                        }

                    }

                    if (vm.showTaskPanel && value1.eventType == "ReportingChangedJob" && !value1.eventId) {
                        var jobs = {};
                        jobs.jobschedulerId = vm.schedulerIds.selected;
                        jobs.job = vm.showTaskPanel.path;
                        JobService.history(jobs).then(function (res) {
                            vm.taskHistory = res.history;
                        });
                    }
                    if (vm.showTaskPanel && value1.eventType == "AuditLogChanged" && value1.objectType == "JOB" && value1.path == vm.showTaskPanel.path) {
                        if (vm.permission.AuditLog.view.status)
                            vm.loadAuditLogs(vm.showTaskPanel);
                    }
                    if ((value1.eventType == "FileBasedActivated" || value1.eventType == "FileBasedRemoved" ) && value1.objectType == "JOB") {

                        if (vm.selectedFiltered && vm.selectedFiltered.paths && vm.selectedFiltered.paths.length > 0) {
                            var folders = [];
                            angular.forEach(vm.selectedFiltered.paths, function (v) {
                                folders.push({folder: v});
                            });
                        }
                        JobService.tree({
                            jobschedulerId: vm.schedulerIds.selected,
                            compact: true,
                            folders: folders,
                            types: ['JOB']
                        }).then(function (res) {
                                vm.jobFilters.expand_to = vm.recursiveTreeUpdate(angular.copy(res.folders), vm.jobFilters.expand_to);
                                vm.tree = vm.jobFilters.expand_to;
                                recursiveSort(vm.tree);
                            }
                        );

                        var path = [];
                        if (value1.path.indexOf(",") > -1) {
                            path = value1.path.split(",");
                        } else {
                            path[0] = value1.path;
                        }
                        if (vm.allJobs.length > 0) {
                            for (var i = 0; i < vm.allJobs.length; i++) {
                                if (path[0].substring(0, path[0].lastIndexOf('/')) == vm.allJobs[i].path.substring(0, vm.allJobs[i].path.lastIndexOf('/'))) {
                                    navFullTreeForUpdateJob(path[0].substring(0, path[0].lastIndexOf('/')));
                                    break;
                                }
                            }
                        } else {
                            navFullTreeForUpdateJob(path[0].substring(0, path[0].lastIndexOf('/')));
                        }
                    }
                    if (value1.eventType == "JobTaskQueueChanged"  && vm.showTaskPanel) {
                 
                        getHistoryPanelData(vm.showTaskPanel);
                    }
                });
            }
        });


        function navFullTreeForUpdateJob(path) {

            for (var i = 0; i < vm.tree.length; i++) {
                if (vm.tree[i].path != path) {
                    traverseTreeForUpdateJob(vm.tree[i], path);
                } else {
                    if (vm.tree[i].selected1)
                        expandFolderData1(vm.tree[i]);
                    break;
                }
            }
        }

        function traverseTreeForUpdateJob(data, path) {
            if (data.folders)
                for (var i = 0; i < data.folders.length; i++) {
                    if (data.folders[i].path != path) {
                        traverseTreeForUpdateJob(data.folders[i], path);
                    } else {
                        if (data.folders[i].selected1)
                            expandFolderData1(data.folders[i]);
                        break;
                    }
                }
        }

        var watcher6 = $scope.$watchCollection('filtered', function (newNames) {
            if (newNames)
                vm.object = {};
        });
        $scope.$on('$destroy', function () {
            watcher1();
            watcher2();
            watcher3();
            watcher4();
            watcher5();
            watcher6();
            if (t1) {
                $timeout.cancel(t1);
            }
        });
    }

    JobOverviewCtrl.$inject = ["$scope", "$rootScope", "JobService", "$uibModal", "TaskService", "CoreService", "OrderService", "DailyPlanService", "AuditLogService", "$stateParams"];
    function JobOverviewCtrl($scope, $rootScope, JobService, $uibModal,  TaskService, CoreService, OrderService, DailyPlanService, AuditLogService, $stateParams) {
        var vm = $scope;
        vm.jobFilters = CoreService.getJobDetailTab();
        vm.maxEntryPerPage = vm.userPreferences.maxEntryPerPage;

        vm.showTask = vm.userPreferences.showTasks;

        vm.allJobs = [];
        vm.jobFilters.filter.state = $stateParams.name;
        vm.object = {};

        function mergePermanentAndVolatile(sour, dest) {
            dest.runningTasks = sour.runningTasks;
            dest.error = sour.error;
            dest.numOfRunningTasks = sour.numOfRunningTasks;
            dest.numOfQueuedTasks = sour.numOfQueuedTasks;
            dest.taskQueue = sour.taskQueue;
            dest.nextStartTime = sour.nextStartTime;
            dest.startedAt = sour.startedAt;
            dest.state = sour.state;
            dest.stateText = sour.stateText;
            dest.configurationStatus = sour.configurationStatus;
            dest.ordersSummary = sour.ordersSummary;
            dest.path1 = sour.path1;
            return dest;
        }

        vm.init = function () {
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.compact = true;
            obj.states = [];
            if(vm.jobFilters.filter.state != 'ALL')
                obj.states.push(vm.jobFilters.filter.state);
            vm.status = vm.jobFilters.filter.state;
            JobService.get(obj).then(function (res) {
                obj.jobs =[];
                angular.forEach(res.jobs, function (value) {
                    obj.jobs.push({job:value.path});
                    value.path1 = value.path.substring(1, value.path.lastIndexOf('/'));
                });
                vm.allJobs = res.jobs;
                JobService.getJobsP(obj).then(function (result) {

                     angular.forEach(result.jobs, function (job) {
                        for (var i = 0; i < res.jobs.length; i++) {
                            if (job.path == res.jobs[i].path) {
                                job = mergePermanentAndVolatile(res.jobs[i], job);
                                res.jobs.splice(i,1);
                                break;
                            }
                        }
                    });
                    vm.allJobs = result.jobs;
                });
                vm.isLoading = true;
            }, function () {
                vm.isLoading = true;
                vm.isError = true;
            });
        };
        vm.init();

        vm.changeStatus = function () {
            vm.isLoading = false;
            vm.hideTaskPanel();
            vm.init();
        };
        $scope.$on("jobState", function (evt, state) {
            if (state) {
                vm.jobFilters.filter.state = state;
                vm.changeStatus();
            }
        });

        vm.exportToExcel = function () {
            $('#exportToExcelBtn').attr("disabled", true);

            if (!vm.isIE()) {
                $('#jobTableId').table2excel({
                    exclude: ".tableexport-ignore",
                    filename: "jobscheduler-job",
                    fileext: ".xls",
                    exclude_img: false,
                    exclude_links: false,
                    exclude_inputs: false
                });
            } else {
                var ExportButtons = document.getElementById('jobTableId');
                var instance = new TableExport(ExportButtons, {
                    formats: ['xlsx'],
                    exportButtons: false
                });
                var exportData = instance.getExportData()['jobTableId']['xlsx'];
                instance.export2file(exportData.data, exportData.mimeType, "jobscheduler-job", exportData.fileExtension);
            }
            $('#exportToExcelBtn').attr("disabled", false);
        };

        /**--------------- Checkbox functions -------------*/
        vm.allCheck = {
            checkbox: false
        };
        vm.allTaskCheck = {checkbox: false};
        vm.allOrderCheck = {checkbox: false};


        var watcher1 = $scope.$watchCollection('object.jobs', function (newNames) {
            if (newNames && newNames.length > 0) {
                vm.allCheck.checkbox = newNames.length == vm.allJobs.slice((vm.userPreferences.entryPerPage * (vm.jobFilters.currentPage - 1)), (vm.userPreferences.entryPerPage * vm.jobFilters.currentPage)).length;

                vm.isTasks = false;
                vm.isStopped = false;
                vm.isUnstopped = false;
                vm.isStart = false;
                angular.forEach(newNames, function (value) {
                    if (value.state && value.state._text == 'RUNNING') {
                        vm.isTasks = true;
                    }
                    if (value.state && value.state._text == 'STOPPED') {
                        vm.isStopped = true;
                    } else {
                        vm.isUnstopped = true;
                    }
                    if ((value.ordersSummary && value.ordersSummary.pending != undefined) || (value.configurationStatus && value.configurationStatus.severity==2)) {
                        vm.isStart = true;
                    }
                    if(value.isShellJob == true){
                        vm.isStart = false;
                    }
                });
            } else {
                vm.reset();
            }
        });

        var watcher2 = $scope.$watchCollection('object.tasks', function (newNames) {
            if (newNames && newNames.length > 0 && vm.showTaskPanel.taskQueue) {
                vm.allTaskCheck.checkbox = newNames.length == vm.showTaskPanel.taskQueue.length;
            } else {
                vm.allTaskCheck.checkbox = false;
                vm.object.tasks = [];
            }
        });

        var watcher3 = $scope.$watchCollection('object.orders', function (newNames) {
            if (newNames && newNames.length > 0 && vm.queueOrders && vm.queueOrders.orderQueue) {
                vm.allOrderCheck.checkbox = newNames.length == vm.queueOrders.orderQueue.length;
            } else {
                vm.allOrderCheck.checkbox = false;
                vm.object.orders = [];
            }
        });

        var watcher4 = $scope.$watch('userPreferences.entryPerPage', function (newNames) {
            if (newNames)
                vm.reset();
        });
        vm.checkAll = function () {
            if (vm.allCheck.checkbox && vm.allJobs.length > 0) {
                vm.object.jobs = vm.allJobs.slice((vm.userPreferences.entryPerPage * (vm.jobFilters.currentPage - 1)), (vm.userPreferences.entryPerPage * vm.jobFilters.currentPage));
            } else {
                vm.reset();
            }
        };
        vm.checkAllTask = function () {
            if (vm.showTaskPanel.taskQueue && vm.allTaskCheck.checkbox && vm.showTaskPanel.taskQueue.length > 0) {
                vm.object.tasks = vm.showTaskPanel.taskQueue;
            } else {
                vm.object.tasks = [];
            }
        };
        vm.checkAllOrder = function () {
            if (vm.queueOrders && vm.allOrderCheck.checkbox && vm.queueOrders.orderQueue.length > 0) {
                vm.object.orders = [];
                angular.forEach(vm.queueOrders.orderQueue, function (order) {
                    if (order._type != 'PERMANENT') {
                        vm.object.orders.push(order)
                    }
                });
                if (vm.object.orders.length == 0) {
                    vm.allOrderCheck.checkbox = false;
                }
            } else {
                vm.object.orders = [];
            }
        };
        /**--------------- sorting and pagination -------------------*/
        vm.pageChange = function () {
            vm.reset();
        };

        vm.sortBy = function (propertyName) {
            vm.reset();
            vm.jobFilters.reverse = !vm.jobFilters.reverse;
            vm.jobFilters.filter.sortBy = propertyName;
        };


        vm.loadHistory = function (value) {
            var jobs = {};
            jobs.jobschedulerId = vm.schedulerIds.selected;
            jobs.job = value.path;
            JobService.history(jobs).then(function (res) {
                vm.taskHistory = res.history;
            });
        };

        vm.loadAuditLogs = function (value) {
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.jobs = [];
            obj.jobs.push({job: value.path});
            obj.limit = parseInt(vm.userPreferences.maxAuditLogPerObject);
            AuditLogService.getLogs(obj).then(function (result) {
                if (result && result.auditLog) {
                    vm.auditLogs = result.auditLog;
                }
            });
        };

        function getHistoryPanelData(value) {
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.jobs = [];
            obj.jobs.push({job: value.path});
            JobService.get(obj).then(function (res) {
                value = mergePermanentAndVolatile(res.jobs[0], value);
            });

            if (value.ordersSummary)
                getQueueOrders(value);
        }

        vm.showTaskFuc = function (value, isRunning) {
            vm.allTaskCheck.checkbox = false;
            vm.object.tasks = [];
            if (isRunning)
                if (value.numOfRunningTasks == 0)return;
            vm.isAuditLog = false;
            vm.loadHistory(value);
            getHistoryPanelData(value);
            vm.showTaskPanel = value;
            vm.isRunning = isRunning;
            vm.jobFilters.showTaskPanel = vm.showTaskPanel.path;
        };

        vm.showAuditLogs = function (value) {
            vm.showTaskPanel = value;
            vm.allTaskCheck.checkbox = false;
            vm.object.tasks = [];
            vm.isAuditLog = true;
            if (vm.permission.AuditLog.view.status)
                vm.loadAuditLogs(value);
            getHistoryPanelData(value);
            vm.jobFilters.showTaskPanel = vm.showTaskPanel.path;
        };

        function getQueueOrders(value) {
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.job = value.path;
            JobService.getQueueOrders(obj).then(function (res) {
                vm.queueOrders = res.job;
            });
        }

        vm.showJobChains = function (job) {
            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            jobs.jobs.push({job: job.path});
            JobService.getJobsP(jobs).then(function (res) {
                job.jobChains = res.jobs[0].jobChains;
                job.showJobChains = true;
                JobService.get(jobs).then(function (res) {
                    job = mergePermanentAndVolatile(res.jobs[0], job);
                });
            });

        };

        vm.hideTaskPanel = function () {
            vm.showTaskPanel = undefined;
            vm.jobFilters.showTaskPanel = undefined;
        };

        /**--------------- Actions -----------------------------*/
        vm.stop = function (job) {
            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            jobs.jobs.push({job: job.path});
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = job.path;
                vm.comments.title = job.title;
                vm.comments.operation = 'Stop';
                vm.comments.type = 'Job';

                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    jobs.auditLog = {};
                    if (vm.comments.comment)
                        jobs.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        jobs.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        jobs.auditLog.ticketLink = vm.comments.ticketLink;
                    JobService.stop(jobs);
                    vm.reset();
                }, function () {

                });
            } else {
                JobService.stop(jobs);
                vm.reset();
            }

        };

        vm.unstop = function (job) {
            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            jobs.jobs.push({job: job.path});
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = job.path;
                vm.comments.title = job.title;
                vm.comments.operation = 'Unstop';
                vm.comments.type = 'Job';

                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    jobs.auditLog = {};
                    if (vm.comments.comment)
                        jobs.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        jobs.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        jobs.auditLog.ticketLink = vm.comments.ticketLink;
                    JobService.unstop(jobs);
                    vm.reset();
                }, function () {

                });
            } else {
                JobService.unstop(jobs);
                vm.reset();
            }
        };

        vm.start = function (job) {
            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            jobs.jobs.push({job: job.path, at: 'now'});
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = job.path;
                vm.comments.title = job.title;
                vm.comments.operation = 'Start';
                vm.comments.type = 'Job';

                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    jobs.auditLog = {};
                    if (vm.comments.comment)
                        jobs.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        jobs.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        jobs.auditLog.ticketLink = vm.comments.ticketLink;
                    JobService.start(jobs);
                    vm.reset();
                }, function () {

                });
            } else {
                JobService.start(jobs);
                vm.reset();
            }
        };

        function startAt(job, paramObject) {
            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            var obj = {};
            obj.params = job.params;
            obj.job = job.path;

            if (job.date && job.time) {
                job.date.setHours(moment(job.time, 'HH:mm:ss').hours());
                job.date.setMinutes(moment(job.time, 'HH:mm:ss').minutes());
                job.date.setSeconds(moment(job.time, 'HH:mm:ss').seconds());
            }

            if (job.date && job.at == 'later') {
                obj.at = moment(job.date).format("YYYY-MM-DD HH:mm:ss");
                obj.timeZone = job.timeZone;
            } else
                obj.at = job.atTime;

            if (!obj.params && paramObject.params.length > 0) {
                obj.params = paramObject.params;
            } else if (obj.params && paramObject.params.length > 0) {
                obj.params = obj.params.concat(paramObject.params);
            }

            jobs.auditLog = {};

            if (vm.comments.comment) {
                jobs.auditLog.comment = vm.comments.comment;
            }
            if (vm.comments.timeSpent) {
                jobs.auditLog.timeSpent = vm.comments.timeSpent;
            }

            if (vm.comments.ticketLink) {
                jobs.auditLog.ticketLink = vm.comments.ticketLink;
            }

            jobs.jobs.push(obj);
            JobService.start(jobs);
        }

        vm.startAt = function (job) {
            vm.job = job;
            JobService.getJob({
                jobschedulerId: vm.schedulerIds.selected,
                compact: false,
                job: vm.job.path
            }).then(function (res) {
                vm.job = angular.merge(vm.job, res.job);
            });
            vm.paramObject = {};
            vm.paramObject.params = [];
            vm.job.atTime = 'now';
            vm.comments = {};
            vm.comments.radio = 'predefined';
            vm.zones = moment.tz.names();

            if (vm.userPreferences.zone) {
                vm.job.timeZone = vm.userPreferences.zone;
            }
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/start-job-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                startAt(vm.job, vm.paramObject);
                vm.reset();
            }, function () {

            });
        };

        vm.stopAll = function () {
            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            angular.forEach(vm.object.jobs, function (value) {
                jobs.jobs.push({job: value.path});
            });
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = '';
                vm.comments.operation = 'Stop';
                vm.comments.type = 'Job';
                angular.forEach(vm.object.jobs, function (value, index) {
                    if (index == vm.object.jobs.length - 1) {
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
                    jobs.auditLog = {};
                    if (vm.comments.comment)
                        jobs.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        jobs.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        jobs.auditLog.ticketLink = vm.comments.ticketLink;
                    JobService.stop(jobs);
                    vm.reset();
                }, function () {

                });
            } else {
                JobService.stop(jobs);
                vm.reset();
            }

        };

        vm.unStopAll = function () {
            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            angular.forEach(vm.object.jobs, function (value) {
                jobs.jobs.push({job: value.path});
            });
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = '';
                vm.comments.operation = 'Unstop';
                vm.comments.type = 'Job';
                angular.forEach(vm.object.jobs, function (value, index) {
                    if (index == vm.object.jobs.length - 1) {
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
                    jobs.auditLog = {};
                    if (vm.comments.comment)
                        jobs.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        jobs.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        jobs.auditLog.ticketLink = vm.comments.ticketLink;
                    JobService.unstop(jobs);
                    vm.reset();
                }, function () {

                });
            } else {
                JobService.unstop(jobs);
                vm.reset();
            }

        };

        vm.startAll = function () {
            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            angular.forEach(vm.object.jobs, function (value) {
                jobs.jobs.push({job: value.path});
            });
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = '';
                vm.comments.operation = 'Start';
                vm.comments.type = 'Job';
                angular.forEach(vm.object.jobs, function (value, index) {
                    if (index == vm.object.jobs.length - 1) {
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
                    jobs.auditLog = {};
                    if (vm.comments.comment)
                        jobs.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        jobs.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        jobs.auditLog.ticketLink = vm.comments.ticketLink;
                    JobService.start(jobs);
                    vm.reset();
                }, function () {

                });
            } else {
                JobService.start(jobs);
                vm.reset();
            }

        };

        vm.reset = function () {
            vm.allCheck.checkbox = false;
            vm.object.jobs = [];
        };

        function terminateTaskWithTimeout(job, task, path) {

            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            if (!task) {

                if (!job) {
                    angular.forEach(vm.object.jobs, function (value) {
                        jobs.jobs.push({job: value.path});
                    });
                } else {
                    jobs.jobs.push({job: job.path});
                }
            } else {
                var taskIds = [];
                taskIds.push({taskId: task.taskId});
                jobs.jobs.push({job: path, taskIds: taskIds});
            }
            jobs.auditLog = {};

            if (vm.comments.comment) {
                jobs.auditLog.comment = vm.comments.comment;
            }
            if (vm.comments.timeSpent) {
                jobs.auditLog.timeSpent = vm.comments.timeSpent;
            }

            if (vm.comments.ticketLink) {
                jobs.auditLog.ticketLink = vm.comments.ticketLink;
            }
            jobs.timeout = vm.timeout;
            TaskService.terminateWith(jobs);
        }

        vm.terminateTaskWithTimeout = function (job, task, path) {
            if (job) {
                vm.job = job;
            } else if (task && path) {
                vm.task = task;
                vm.path = path;
            }
            else {
                vm.taskJobs = vm.object.jobs;
            }
            vm.timeout = 10;
            vm.comments = {};
            vm.comments.radio = 'predefined';
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/terminate-task-timeout-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                terminateTaskWithTimeout(job, task, path);
                vm.reset();
            }, function () {

            });

        };

        vm.end = function (task, path) {
            var jobs = {};
            jobs.jobs = [];
            var taskIds = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            taskIds.push({taskId: task.taskId});
            jobs.jobs.push({job: path, taskIds: taskIds});
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = path;
                vm.comments.task = task.taskId;
                vm.comments.operation = 'End Task';
                vm.comments.type = 'Job';

                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    jobs.auditLog = {};
                    if (vm.comments.comment)
                        jobs.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        jobs.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        jobs.auditLog.ticketLink = vm.comments.ticketLink;
                    TaskService.end(jobs);
                    vm.reset();
                }, function () {

                });
            } else {
                TaskService.end(jobs);
                vm.reset();
            }

        };

        vm.killTask = function (task, path) {
            var jobs = {};
            jobs.jobs = [];
            var taskIds = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            taskIds.push({taskId: task.taskId});
            jobs.jobs.push({job: path, taskIds: taskIds});
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = path;
                vm.comments.task = task.taskId;
                vm.comments.operation = 'Kill Task';
                vm.comments.type = 'Job';

                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    jobs.auditLog = {};
                    if (vm.comments.comment)
                        jobs.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        jobs.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        jobs.auditLog.ticketLink = vm.comments.ticketLink;
                    TaskService.kill(jobs);
                    vm.reset();
                }, function () {

                });
            } else {
                TaskService.kill(jobs);
                vm.reset();
            }

        };

        vm.terminateTask = function (task, path) {
            var jobs = {};
            jobs.jobs = [];
            var taskIds = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            taskIds.push({taskId: task.taskId});
            jobs.jobs.push({job: path, taskIds: taskIds});
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = path;
                vm.comments.task = task.taskId;
                vm.comments.operation = 'Terminate Task';
                vm.comments.type = 'Job';

                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    jobs.auditLog = {};
                    if (vm.comments.comment)
                        jobs.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        jobs.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        jobs.auditLog.ticketLink = vm.comments.ticketLink;
                    TaskService.terminate(jobs);
                    vm.reset();
                }, function () {

                });
            } else {
                TaskService.terminate(jobs);
                vm.reset();
            }

        };

        vm.killAllTask = function (job) {
            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            if (!job) {
                angular.forEach(vm.object.jobs, function (value) {
                    jobs.jobs.push({job: value.path});
                });
            } else {
                jobs.jobs.push({job: job.path});
            }
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = '';
                vm.comments.operation = 'Kill all Task';
                vm.comments.type = 'Job';
                vm.comments.title = job.title;
                if (!job) {
                    angular.forEach(vm.object.jobs, function (value, index) {
                        if (index == vm.object.jobs.length - 1) {
                            vm.comments.name = vm.comments.name + ' ' + value.path;
                        } else {
                            vm.comments.name = value.path + ', ' + vm.comments.name;
                        }
                    });
                } else {
                    vm.comments.name = job.path;
                }
                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    jobs.auditLog = {};
                    if (vm.comments.comment)
                        jobs.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        jobs.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        jobs.auditLog.ticketLink = vm.comments.ticketLink;
                    TaskService.killAll(jobs);
                    vm.reset();
                }, function () {

                });
            } else {
                TaskService.killAll(jobs);
                vm.reset();
            }
        };

        vm.deleteAllTask = function () {
            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;

            var taskIds = [];
            angular.forEach(vm.object.tasks, function (value) {
                taskIds.push({taskId: value.taskId})
            });
            jobs.jobs.push({job: vm.showTaskPanel.path, taskIds: taskIds});

            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = '';
                vm.comments.operation = 'Delete all Task';
                vm.comments.type = 'Job';
                vm.comments.title = vm.showTaskPanel.title;

                vm.comments.name = vm.showTaskPanel.path;

                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    jobs.auditLog = {};
                    if (vm.comments.comment)
                        jobs.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        jobs.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        jobs.auditLog.ticketLink = vm.comments.ticketLink;
                    TaskService.killAll(jobs);
                    vm.allTaskCheck.checkbox = false;
                    vm.object.tasks = [];
                }, function () {
                    vm.allTaskCheck.checkbox = false;
                    vm.object.tasks = [];
                });
            } else {
                TaskService.killAll(jobs);
                vm.allTaskCheck.checkbox = false;
                vm.object.tasks = [];
            }
        };

        vm.terminateAllTask = function (job) {
            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            if (!job) {
                angular.forEach(vm.object.jobs, function (value) {
                    jobs.jobs.push({job: value.path});
                });
            } else {
                jobs.jobs.push({job: job.path});
            }
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = '';
                vm.comments.operation = 'Terminate all Task';
                vm.comments.type = 'Job';
                vm.comments.title = job.title;
                if (!job) {
                    angular.forEach(vm.object.jobs, function (value, index) {
                        if (index == vm.object.jobs.length - 1) {
                            vm.comments.name = vm.comments.name + ' ' + value.path;
                        } else {
                            vm.comments.name = value.path + ', ' + vm.comments.name;
                        }
                    });
                } else {
                    vm.comments.name = job.path;
                }
                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    jobs.auditLog = {};
                    if (vm.comments.comment)
                        jobs.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        jobs.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        jobs.auditLog.ticketLink = vm.comments.ticketLink;
                    TaskService.terminateAll(jobs);
                    vm.reset();
                }, function () {

                });
            } else {
                TaskService.terminateAll(jobs);
                vm.reset();
            }
        };

        function setRunTime(job) {
            var jobs = {};
            jobs.jobs = [];

            jobs.jobs.push({
                job: job.path,
                runTime: vkbeautify.xmlmin(job.runTime),
                calendars: job.calendars
            });

            jobs.auditLog = {};
            if (vm.comments.comment) {
                jobs.auditLog.comment = vm.comments.comment;
            }
            if (vm.comments.timeSpent) {
                jobs.auditLog.timeSpent = vm.comments.timeSpent;
            }

            if (vm.comments.ticketLink) {
                jobs.auditLog.ticketLink = vm.comments.ticketLink;
            }
            jobs.jobschedulerId = vm.schedulerIds.selected;
            JobService.setRunTime(jobs);
        }

        function loadRuntime(job) {
            vm.order = job;
            vm.comments = {};
            vm.comments.radio = 'predefined';
            vm.scheduleAction = undefined;
            JobService.getRunTime({
                jobschedulerId: vm.schedulerIds.selected,
                job: job.path
            }).then(function (res) {
                if (res.runTime) {
                    vm.runTimes = res.runTime;
                    vm.xml = vm.runTimes.runTime;
                    vm.calendars = vm.runTimes.calendars;
                }
                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/set-run-time-dialog.html',
                    controller: 'RuntimeEditorDialogCtrl',
                    scope: vm,
                    size: 'lg',
                    backdrop: 'static',
                    windowClass: 'fade-modal'
                });
                modalInstance.result.then(function () {
                    setRunTime(job);
                    vm.reset();
                }, function () {

                });
            });
        }

        vm.setRunTime = function (job) {
            loadRuntime(job);
        };

        vm.deleteAllOrder =  function() {

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

                    OrderService.deleteOrder(orders).then(function () {
                        vm.allOrderCheck.checkbox = false;
                        vm.object.orders = [];
                    });

                }, function () {
                    vm.allOrderCheck.checkbox = false;
                    vm.object.orders = [];
                });
            } else {
                OrderService.deleteOrder(orders).then(function () {
                    vm.allOrderCheck.checkbox = false;
                    vm.object.orders = [];
                });
            }
        };

        vm.showAssignedCalendar = function(job) {
            var jobs = {};
            jobs.jobschedulerId = vm.schedulerIds.selected;
            jobs.job = job.path;
            jobs.compact = true;
            JobService.getcalendars(jobs).then(function (res) {
                vm.obj = angular.copy(job);
                vm.obj.calendars = res.calendars;
            });
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/show-assigned-calendar-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                backdrop: 'static'
            });
            modalInstance.result.then(function () {

            }, function () {

            });
        };

        vm.deleteOrder =  function(order) {
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            orders.orders.push({orderId: order.orderId, jobChain: order.jobChain});
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = order.path;
                vm.comments.title = order.title;
                vm.comments.operation = 'Delete';
                vm.comments.type = 'Order';
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
                    OrderService.deleteOrder(orders).then(function () {
                        vm.allOrderCheck.checkbox = false;
                        vm.object.orders = [];

                    });
                }, function () {
                    vm.allOrderCheck.checkbox = false;
                    vm.object.orders = [];
                });
            } else {
                OrderService.deleteOrder(orders).then(function () {
                    vm.allOrderCheck.checkbox = false;
                    vm.object.orders = [];
                });
            }
        };

        var firstDay, lastDay;
        vm.getPlan = function (calendarView, viewDate) {
            var firstDay2 = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0);
            var lastDay2 = new Date(new Date(viewDate).getFullYear(), 11, 31, 23, 59, 0);
            if (calendarView == 'year') {
                if (viewDate.getFullYear() < new Date().getFullYear()) {
                    return;
                }
                else if (viewDate.getFullYear() == new Date().getFullYear()) {
                    firstDay2 = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0);
                }
                else {
                    firstDay2 = new Date(new Date(viewDate).getFullYear(), 0, 1, 0, 0, 0);
                }
            }
            if (calendarView == 'month') {
                if (viewDate.getFullYear() <= new Date().getFullYear() && viewDate.getMonth() < new Date().getMonth()) {
                    return;
                }
                else if (viewDate.getFullYear() == new Date().getFullYear() && viewDate.getMonth() == new Date().getMonth()) {
                    firstDay2 = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0);
                }
                else {
                    firstDay2 = new Date(new Date(viewDate).getFullYear(), new Date(viewDate).getMonth(), 1, 0, 0, 0);

                }
                lastDay2 = new Date(new Date(viewDate).getFullYear(), new Date(viewDate).getMonth() + 1, 0, 23, 59, 0);
            }

            if (new Date(firstDay2) >= new Date(firstDay) && new Date(lastDay2) <= new Date(lastDay)) {
                return;
            }
            firstDay = firstDay2;
            lastDay = lastDay2;

            vm.planItems = [];
            vm.isCaledarLoading = true;
            DailyPlanService.getPlans({
                jobschedulerId: $scope.schedulerIds.selected,
                states: ['PLANNED'],
                job: vm._job.path,
                dateFrom: firstDay,
                dateTo: lastDay
            }).then(function (res) {
                populatePlanItems(res);
                vm.isCaledarLoading = false;
            }, function () {
                vm.isCaledarLoading = false;
            });
        };

        vm.viewCalendar = function (job) {
            vm.maxPlannedTime = undefined;
            vm._job = angular.copy(job);
            vm.planItems = [];
            vm.isCaledarLoading = true;
            firstDay = new Date(new Date().getFullYear(),  new Date().getMonth(),  new Date().getDate(), 0, 0, 0);
            lastDay = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 0);
            DailyPlanService.getPlans({
                jobschedulerId: $scope.schedulerIds.selected,
                states: ['PLANNED'],
                job: vm._job.path,
                dateFrom: firstDay,
                dateTo: lastDay
            }).then(function (res) {
                populatePlanItems(res);
                vm.isCaledarLoading = false;
            }, function () {
                vm.isCaledarLoading = false;
            });
            openCalendar();
        };

        function populatePlanItems(res) {
            vm.planItemData = res.planItems;
            vm.planItemData.forEach(function (data) {
                var planData = {
                    plannedStartTime: data.plannedStartTime,
                    format: vm.getCalendarTimeFormat()
                };
                vm.planItems.push(planData);
                if (res.created) {
                    vm.maxPlannedTime = new Date(res.deliveryDate);
                }
            });
        }

        function openCalendar() {
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/calendar-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                size: 'lg',
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                vm._job = null;
            }, function () {
                vm._job = null;
            });
        }

        vm.viewAllHistories = function () {
            vm.taskHistoryTab = CoreService.getHistoryTab();
            vm.taskHistoryTab.type = 'job';
            $state.go('app.history');
        };

        vm.showLeftPanel = function () {
            CoreService.setSideView(false);
            $('#rightPanel').removeClass('fade-in m-l-0');
            $('#leftPanel').show();
            $('.sidebar-btn').hide();
        };

        var waitForResponse = true;
        $scope.$on('event-started', function () {
            if (vm.events && vm.events[0] && vm.events[0].eventSnapshots) {
                for (var i = 0; i < vm.events[0].eventSnapshots.length; i++) {
                    if (vm.events[0].eventSnapshots[i].path != undefined && vm.events[0].eventSnapshots[i].eventType == "JobStateChanged" && !vm.events[0].eventSnapshots[i].eventId && waitForResponse) {
                        waitForResponse = false;
                        var obj = {};
                        obj.jobschedulerId = $scope.schedulerIds.selected;
                        obj.compact = true;
                        obj.states = [];
                        if(vm.jobFilters.filter.state != 'ALL')
                            obj.states.push(vm.jobFilters.filter.state);

                        JobService.get(obj).then(function (res) {
                            obj.jobs = [];
                            vm.reset();
                            angular.forEach(res.jobs, function (value) {
                                obj.jobs.push({job: value.path});
                                value.path1 = value.path.substring(1, value.path.lastIndexOf('/'));
                            });
                            vm.allJobs = res.jobs;
                            JobService.getJobsP(obj).then(function (result) {
                                angular.forEach(result.jobs, function (job) {
                                    for (var i = 0; i < res.jobs.length; i++) {
                                        if (job.path == res.jobs[i].path) {
                                            job = mergePermanentAndVolatile(res.jobs[i], job);
                                            res.jobs.splice(i, 1);
                                            break;
                                        }
                                    }
                                });
                                vm.allJobs = result.jobs;
                            });
                            var flag = false;
                            for (var i = 0; i < vm.allJobs.length; i++) {
                                if (vm.showTaskPanel && vm.showTaskPanel.path == vm.allJobs[i].path) {
                                    flag = true;
                                    break;
                                }
                            }
                            if (!flag) {
                                vm.showTaskPanel = undefined;
                            }
                            waitForResponse = true;
                        }, function () {
                            waitForResponse = true;
                        });

                        $rootScope.$broadcast('reloadJobSnapshot');
                    }

                    if (vm.showTaskPanel && vm.events[0].eventSnapshots[i].eventType == "ReportingChangedJob" && !vm.events[0].eventSnapshots[i].eventId) {
                        var jobs = {};
                        jobs.jobschedulerId = vm.schedulerIds.selected;
                        jobs.job = vm.showTaskPanel.path;
                        JobService.history(jobs).then(function (res) {
                            vm.taskHistory = res.history;
                        });
                    }
                    if (vm.showTaskPanel && vm.events[0].eventSnapshots[i].eventType == "AuditLogChanged" && vm.events[0].eventSnapshots[i].objectType == "JOB" && vm.events[0].eventSnapshots[i].path == vm.showTaskPanel.path) {
                        if (vm.permission.AuditLog.view.status)
                            vm.loadAuditLogs(vm.showTaskPanel);
                    }

                    if (vm.events[0].eventSnapshots[i].eventType == "JobTaskQueueChanged" && vm.showTaskPanel) {
                        getHistoryPanelData(vm.showTaskPanel);
                    }
                }
            }
        });


        $scope.$on('$destroy', function () {
            watcher1();
            watcher2();
            watcher3();
            watcher4();
        });
    }

})();
