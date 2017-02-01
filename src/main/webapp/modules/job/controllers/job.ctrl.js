/**
 * Created by sourabhagrawal on 31/05/16.
 */
(function () {
    'use strict';
    angular
        .module('app')
        .controller('JobChainCtrl', JobChainCtrl)
        .controller('JobCtrl', JobCtrl);

    JobChainCtrl.$inject = ["$scope", "JobChainService", "OrderService", "JobService", "$location", "SOSAuth", "$uibModal", "orderByFilter", "ScheduleService", "SavedFilter",
        "toasty", "gettextCatalog", "DailyPlanService", "$rootScope", "CoreService", "$timeout", "TaskService", "$window"];
    function JobChainCtrl($scope, JobChainService, OrderService, JobService, $location, SOSAuth, $uibModal, orderBy, ScheduleService, SavedFilter,
                          toasty, gettextCatalog, DailyPlanService, $rootScope, CoreService, $timeout, TaskService, $window) {

        var vm = $scope;
        vm.jobChainFilters = CoreService.getJobChainTab();
        vm.maxEntryPerPage = $window.localStorage.$SOS$MAXENTRYPERPAGE;

        vm.object = {};

        vm.tree = [];
        vm.allJobChains = [];
        vm.my_tree = {};

        vm.filter_tree = {};
        vm.filterTree1 = [];
        vm.object.paths = [];

        var selectedFiltered, modalInstance;

        vm.savedJobChainFilter = JSON.parse(SavedFilter.jobChainFilters) || {};
        vm.savedJobChainFilter.list = vm.savedJobChainFilter.list || [];

        if (vm.jobChainFilters.selectedView)
            vm.savedJobChainFilter.selected = vm.savedJobChainFilter.selected || vm.savedJobChainFilter.favorite;
        else
            vm.savedJobChainFilter.selected = undefined;


        $rootScope.$on('event-jobChains', function (event, values) {
            $rootScope.expand_to = values;
        });
        if (vm.savedJobChainFilter.selected) {
            for (var i = 0; i < vm.savedJobChainFilter.list.length; i++) {
                if (vm.savedJobChainFilter.list[i].name == vm.savedJobChainFilter.selected) {
                    selectedFiltered = vm.savedJobChainFilter.list[i];
                }
            }
        }

        vm.expanding_property = {
            field: "name"
        };


        /**
         * Function to initialized tree view
         */
        function initTree() {
            if (selectedFiltered && selectedFiltered.paths && selectedFiltered.paths.length > 0) {
                var folders = [];

                for (var i = 0; i < selectedFiltered.paths.length; i++) {

                    folders.push({folder: selectedFiltered.paths[i]});
                }
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
                        previousTreeState();
                    }
                }

                vm.jobChainFilters.expand_to = vm.tree;

                vm.folderPath = '/';
                vm.isLoading = true;
            }, function () {
                vm.isLoading = true;
            });
        }

        initTree();

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
            if (selectedFiltered) {
                obj.regex = selectedFiltered.regex;
            }
            obj.folders = [];
            obj.folders.push({folder: data.path, recursive: true});
            JobChainService.getJobChainsP(obj).then(function (result) {
                vm.jobChains = result.jobChains;
                volatileInformation(obj, data);
            }, function () {
                volatileInformation(obj, data);
                vm.loading = false;
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
                    if (data.path == vm.jobChains[i].path.substring(0, vm.jobChains[i].path.lastIndexOf('/'))) {
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
            if (selectedFiltered) {
                obj.regex = selectedFiltered.regex;
            }
            obj.folders = [
                {folder: data.path, recursive: false}
            ];

            JobChainService.getJobChainsP(obj).then(function (result) {
                if (data.jobChains && data.jobChains.length > 0) {
                    angular.forEach(result.jobChains, function (newValue, index) {
                        angular.forEach(data.jobChains, function (oldValue) {
                            if (newValue.path == oldValue.path) {
                                result.jobChains[index].path1 = oldValue.path1;
                                result.jobChains[index].show = oldValue.show;
                            }
                        });
                    });
                }
                data.jobChains = result.jobChains;
                volatileFolderData(data, obj);
            }, function (err) {
                vm.loading = false;
                volatileFolderData(data, obj);
            });
        }

        function expandFolderData1(data) {
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.compact = true;
            if (selectedFiltered) {
                obj.regex = selectedFiltered.regex;
            }
            obj.folders = [
                {folder: data.path, recursive: false}
            ];

            JobChainService.getJobChainsP(obj).then(function (result) {
                data.jobChains = result.jobChains;
                volatileFolderData1(data, obj);
            }, function (err) {
                vm.loading = false;
                volatileFolderData1(data, obj);
            });
        }

        function volatileFolderData(data, obj) {

            if (selectedFiltered && selectedFiltered.state) {
                obj.states = selectedFiltered.state;
            } else {
                if (vm.jobChainFilters.filter.state != 'ALL') {
                    obj.states = [];
                    obj.states.push(vm.jobChainFilters.filter.state);
                }
            }

            if ($window.localStorage.$SOS$SHOWORDERS == true || $window.localStorage.$SOS$SHOWORDERS == 'true') {
                obj.compact = false;
            }

            JobChainService.get(obj).then(function (res) {

                var data1 = [];
                if (data.jobChains && data.jobChains.length > 0) {
                    angular.forEach(data.jobChains, function (jobChains) {
                        if ($window.localStorage.$SOS$SHOWORDERS == true || $window.localStorage.$SOS$SHOWORDERS == 'true')
                            jobChains.show = true;

                        for (var i = 0; i < res.jobChains.length; i++) {
                            var flag1 = true;
                            if (jobChains.path == res.jobChains[i].path) {
                                jobChains = angular.merge(jobChains, res.jobChains[i]);
                                if (selectedFiltered && selectedFiltered.agentName && jobChains.processClass) {
                                    if (!jobChains.processClass.match(selectedFiltered.agentName)) {
                                        flag1 = false;
                                    }
                                }
                                if (flag1)
                                    data1.push(jobChains);
                                break;
                            }
                        }
                    });

                } else {
                    angular.forEach(res.jobChains, function (jobChainData) {
                        if ($window.localStorage.$SOS$SHOWORDERS == true || $window.localStorage.$SOS$SHOWORDERS == 'true')
                            jobChainData.show = true;
                        var flag1 = true;
                        if (selectedFiltered && selectedFiltered.agentName && jobChains.processClass) {
                            if (!jobChains.processClass.match(selectedFiltered.agentName)) {
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

            if (selectedFiltered && selectedFiltered.state) {
                obj.states = selectedFiltered.state;
            } else {
                if (vm.jobChainFilters.filter.state != 'ALL') {
                    obj.states = [];
                    obj.states.push(vm.jobChainFilters.filter.state);
                }
            }

            JobChainService.get(obj).then(function (res) {

                var data1 = [];
                if (data.jobChains && data.jobChains.length > 0) {
                    angular.forEach(data.jobChains, function (jobChains) {

                        for (var i = 0; i < res.jobChains.length; i++) {
                            var flag1 = true;
                            if (jobChains.path == res.jobChains[i].path) {
                                jobChains = angular.merge(jobChains, res.jobChains[i]);
                                if (selectedFiltered && selectedFiltered.agentName && jobChains.processClass) {
                                    if (!jobChains.processClass.match(selectedFiltered.agentName)) {
                                        flag1 = false;
                                    }
                                }
                                if (flag1)
                                    data1.push(jobChains);
                                break;

                            }
                        }
                    });

                } else {
                    angular.forEach(res.jobChains, function (jobChainData) {
                        var flag1 = true;
                        if (selectedFiltered && selectedFiltered.agentName && jobChains.processClass) {
                            if (!jobChains.processClass.match(selectedFiltered.agentName)) {
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
                vm.allJobChains = temp;
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
                vm.allJobChains = temp;
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
                vm.tree[i].expanded = true;
                vm.tree[i].selected1 = true;
                vm.allJobChains = [];
                checkExpand(vm.tree[i]);

            }

        }

        function previousTreeState() {
            vm.allJobChains = [];
            for (var i = 0; i < vm.tree.length; i++) {
                checkExpand(vm.tree[i]);
            }
        }

        function checkExpandTreeForUpdates(data) {
            if (data.selected1) {
                var obj = {};
                obj.jobschedulerId = vm.schedulerIds.selected;
                obj.compact = true;

                if (selectedFiltered && selectedFiltered.state) {
                    obj.states = selectedFiltered.state;
                } else {
                    if (vm.jobChainFilters.filter.state != 'ALL') {
                        obj.states = [];
                        obj.states.push(vm.jobChainFilters.filter.state);
                    }
                }
                if (selectedFiltered) {
                    obj.regex = selectedFiltered.regex;
                }
                obj.folders = [
                    {folder: data.path, recursive: false}
                ];
                var obj1 = {};
                obj1.jobschedulerId = vm.schedulerIds.selected;
                obj1.compact = true;
                if (selectedFiltered) {
                    obj1.regex = selectedFiltered.regex;
                }
                obj1.folders = [
                    {folder: data.path, recursive: false}
                ];
                JobChainService.getJobChainsP(obj1).then(function (result) {
                    JobChainService.get(obj).then(function (res) {

                        if (result.jobChains && result.jobChains.length > 0) {
                            var x = [];
                            angular.forEach(result.jobChains, function (jobChains) {
                                for (var i = 0; i < res.jobChains.length; i++) {
                                    if (jobChains.path == res.jobChains[i].path) {
                                        jobChains = angular.merge(jobChains, res.jobChains[i]);
                                        x.push(jobChains);
                                        break;
                                    }

                                }
                            });
                            data.jobChains = x;
                        } else {
                            data.jobChains = res.jobChains;
                        }
                        //update list view
                        angular.forEach(data.jobChains, function (value) {
                            value.path1 = data.path;
                            vm.allJobChains.push(value);
                        });
                        vm.loading = false;
                    }, function () {
                        data.jobChains = result.jobChains;

                        angular.forEach(data.jobChains, function (value) {
                            value.path1 = data.path;
                            vm.allJobChains.push(value);
                        });
                        vm.loading = false;
                    });

                }, function (err) {
                    vm.loading = false;
                    JobChainService.get(obj).then(function (res) {
                        if (res.jobChains) {
                            //update card view
                            if (obj.folders[0].folder == data.path) {
                                data.jobChains = res.jobChains;
                            }
                            //update list view
                            angular.forEach(data.jobChains, function (value) {
                                value.path1 = data.path;
                                vm.allJobChains.push(value);
                            });
                        }
                    });
                });

            }

            data.folders = orderBy(data.folders, 'name');
            angular.forEach(data.folders, function (value) {
                if (value.expanded || value.selected1)
                    checkExpandTreeForUpdates(value);
            });
        }

        function mergeJobChainData(object, expandNode) {
            if (selectedFiltered) {
                var data = [];
                angular.forEach(object, function (res) {
                    var flag = true;
                    if (selectedFiltered.agentName && res.processClass) {
                        if (!res.processClass.match(selectedFiltered.agentName)) {
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

            if (selectedFiltered && selectedFiltered.state) {
                obj.states = selectedFiltered.state;
            } else {
                if (vm.jobChainFilters.filter.state != 'ALL') {
                    obj.states = [];
                    obj.states.push(vm.jobChainFilters.filter.state);
                }
            }
            if ($window.localStorage.$SOS$SHOWORDERS == true || $window.localStorage.$SOS$SHOWORDERS == 'true') {
                obj.compact = false;
            }
            JobChainService.get(obj).then(function (res) {
                var data = [];
                if (vm.jobChains && vm.jobChains.length > 0) {
                    angular.forEach(vm.jobChains, function (jobChains) {
                        if ($window.localStorage.$SOS$SHOWORDERS == true || $window.localStorage.$SOS$SHOWORDERS == 'true')
                            jobChains.show = true;
                        for (var i = 0; i < res.jobChains.length; i++) {


                            var flag1 = true;
                            if (jobChains.path == res.jobChains[i].path) {
                                jobChains = angular.merge(jobChains, res.jobChains[i]);
                                if (selectedFiltered && selectedFiltered.agentName && jobChains.processClass) {
                                    if (!jobChains.processClass.match(selectedFiltered.agentName)) {
                                        flag1 = false;
                                    }
                                }
                                if (flag1) {
                                    data.push(jobChains);
                                }
                                break;
                            }
                        }
                    });
                } else {
                    angular.forEach(res.jobChains, function (jobChainData) {
                        if ($window.localStorage.$SOS$SHOWORDERS == true || $window.localStorage.$SOS$SHOWORDERS == 'true')
                            jobChainData.show = true;
                        var flag1 = true;
                        if (selectedFiltered && selectedFiltered.agentName && jobChains.processClass) {
                            if (!jobChains.processClass.match(selectedFiltered.agentName)) {
                                flag1 = false;
                            }
                        }
                        if (flag1) {
                            data.push(jobChainData);
                        }

                    })
                }
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

        vm.changeStatus = function () {
            vm.allJobChains = [];
            vm.loading = true;
            for (var i = 0; i < vm.tree.length; i++) {
                if (vm.tree[i].expanded || vm.tree[i].selected1)
                    checkExpandTreeForUpdates(vm.tree[i]);
            }

        };
        vm.load = function () {
            initTree();
        };

        /**--------------- Checkbox functions -------------*/
        vm.jobChainCheckAll = {
            checkbox: false
        };

        var watcher1 = $scope.$watchCollection('object.jobChains', function (newNames) {
            if (newNames && newNames.length > 0) {
                vm.jobChainCheckAll.checkbox = newNames.length == vm.allJobChains.slice((vm.jobChainFilters.pageSize * (vm.jobChainFilters.currentPage - 1)), (vm.jobChainFilters.pageSize * vm.jobChainFilters.currentPage)).length;
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

        var watcher3 = $scope.$watch('jobChainFilters.pageSize', function () {
            vm.reset();
        });

        vm.jobChainCheckAll = function () {
            if (vm.jobChainCheckAll.checkbox && vm.allJobChains && vm.allJobChains.length > 0) {
                vm.object.jobChains = vm.allJobChains.slice((vm.jobChainFilters.pageSize * (vm.jobChainFilters.currentPage - 1)), (vm.jobChainFilters.pageSize * vm.jobChainFilters.currentPage));
            } else {
                vm.reset();
            }
        };

        /**--------------- Actions -----------------------------*/
        vm.viewOrders = function (jobChain) {
            SOSAuth.setJobChain(JSON.stringify(jobChain));
            SOSAuth.save();
            $location.path('/jobChainDetails/orders').search({path: jobChain.path});
        };

        vm.viewFlowDiagram = function (jobChain) {
            SOSAuth.setJobChain(JSON.stringify(jobChain));
            SOSAuth.save();
            $location.path('/jobChainDetails/overview').search({path: jobChain.path});
        };

        vm.maxPlannedTime;
        vm.showCalendar = function (jobChain) {
            vm.maxPlannedTime = undefined;
            vm._jobChain = jobChain;
            vm.planItems = [];
            DailyPlanService.getPlans({
                jobschedulerId: $scope.schedulerIds.selected,
                states: ['PLANNED'],
                jobChain: jobChain.path
            }).then(function (res) {
                vm.planItemData = res.planItems;
                vm.planItemData.forEach(function (data) {
                    var planData = {
                        plannedStartTime: data.plannedStartTime,
                        expectedEndTime: data.expectedEndTime,
                        orderId:data.orderId
                    };
                    vm.planItems.push(planData);
                    if (!vm.maxPlannedTime || new Date(data.plannedStartTime) > vm.maxPlannedTime) {
                        vm.maxPlannedTime = new Date(data.plannedStartTime);
                    }
                });

            }, function (err) {
            });
            openCalendar();

        };

        function openCalendar() {
            modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/calendar-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                size: 'lg',
                backdrop: 'static'
            });
            vm.reset();
        }

        function loadJobOrderV(obj) {
            OrderService.get(obj).then(function (res) {
                var data = [];
                if (res && res.orders) {
                    if (vm.orders.length > 0 && vm.orders.length > res.orders.length) {
                        angular.forEach(vm.orders, function (orders) {
                            for (var i = 0; i < res.orders.length; i++) {
                                if (orders.path == orderData.path) {
                                    orders = angular.merge(orders, orderData);
                                    data.push(orders);
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
            vm.reset();
        };
        function loadAuditLogs(obj) {
            OrderService.getAuditLogs(obj).then(function (result) {
                if (result && result.auditLog) {
                    vm.auditLogs = result.auditLog;
                }
            });
        }

        vm.showAuditLogs = function (jobChain) {
            vm.jobChain = jobChain;
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.compact = true;
            obj.orders = [];
            obj.orders.push({jobChain: jobChain.path});
            loadAuditLogs(obj);

            modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/audit-log-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                size: 'lg',
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                vm.auditLogs = null;
            }, function () {
                vm.auditLogs = null;

            });
            vm.reset();
        };

        function addOrder(order, paramObject, jobChain) {
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
                order.fromDate.setHours(order.fromTime.getHours());
                order.fromDate.setMinutes(order.fromTime.getMinutes());
                order.fromDate.setSeconds(order.fromTime.getSeconds());
            }

            if (order.fromDate) {
                obj.at = moment.utc(order.fromDate).format();
            } else {
                obj.at = order.atTime;
            }

            if (paramObject && paramObject.params.length > 0) {
                obj.params = paramObject.params;
            }
            orders.orders.push(obj);

            OrderService.addOrder(orders).then(function (res) {
                JobChainService.getJobChain({
                    jobschedulerId: vm.schedulerIds.selected,
                    jobChain: jobChain.path
                }).then(function (res) {
                    jobChain = angular.merge(jobChain, res.jobChain);
                    angular.forEach(jobChain.nodes, function (val, index) {
                        if (val.job && val.job.state && val.job.state._text == 'RUNNING' && $window.localStorage.$SOS$SHOWTASKS === 'true') {

                            JobService.get({
                                jobschedulerId: vm.schedulerIds.selected,
                                jobs: [{job: val.job.path}]
                            }).then(function (res1) {
                                jobChain.nodes[index].job = angular.merge(jobChain.nodes[index].job, res1.jobs[0]);
                            });
                        }
                    });
                    showHistory(jobChain);
                });
            });
            vm.reset();
        }

        vm.addOrder = function (jobChain) {
            ScheduleService.getSchedulesP({
                jobschedulerId: vm.schedulerIds.selected,
                compact: true
            }).then(function (res) {
                vm.schedules = res.schedules;
            });

            vm._jobChain = angular.copy(jobChain);


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

            modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/add-order-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                addOrder(vm.order, vm.paramObject, jobChain);
            }, function () {

            });
            vm.reset();
        };


        vm.stopJobChain = function (jobChain) {
            var jobChains = {};
            jobChains.jobChains = [];
            jobChains.jobschedulerId = vm.schedulerIds.selected;
            jobChains.jobChains.push({jobChain: jobChain.path});
            if ($window.localStorage.$SOS$AUDITLOG == 'true') {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = jobChain.path;
                vm.comments.operation = 'Stop';
                vm.comments.type = 'Job Chain';
                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    jobChains.comment = vm.comments.comment;
                    JobChainService.stop(jobChains);
                }, function () {

                });
            } else {
                JobChainService.stop(jobChains);
            }
            vm.reset();
        };

        vm.unstopJobChain = function (jobChain) {
            var jobChains = {};
            jobChains.jobChains = [];
            jobChains.jobschedulerId = vm.schedulerIds.selected;
            jobChains.jobChains.push({jobChain: jobChain.path});
            if ($window.localStorage.$SOS$AUDITLOG == 'true') {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = jobChain.path;
                vm.comments.operation = 'Unstop';
                vm.comments.type = 'Job Chain';
                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    jobChains.comment = vm.comments.comment;
                    JobChainService.unstop(jobChains);
                }, function () {

                });
            } else {
                JobChainService.unstop(jobChains);
            }
            vm.reset();
        };
        vm.stopAll = function () {
            var jobChains = {};
            jobChains.jobChains = [];
            jobChains.jobschedulerId = vm.schedulerIds.selected;
            angular.forEach(vm.object.jobChains, function (value) {
                jobChains.jobChains.push({jobChain: value.path});
            });
            if ($window.localStorage.$SOS$AUDITLOG == 'true') {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = '';
                vm.comments.operation = 'Stop';
                vm.comments.type = 'Job Chain';
                angular.forEach(vm.object.jobChains, function (value, index) {
                    if (index == vm.object.jobChains.length - 1) {
                        vm.comments.name = vm.comments.name + ' ' + value.path;
                    } else {
                        vm.comments.name =  value.path +', '+vm.comments.name;
                    }
                });
                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    jobChains.comment = vm.comments.comment;
                    JobChainService.stop(jobChains);
                }, function () {

                });
            } else {
                JobChainService.stop(jobChains);
            }
            vm.reset();
        };

        vm.unstopAll = function () {
            var jobChains = {};
            jobChains.jobChains = [];
            jobChains.jobschedulerId = vm.schedulerIds.selected;

            angular.forEach(vm.object.jobChains, function (value) {
                jobChains.jobChains.push({jobChain: value.path});
            });
            if ($window.localStorage.$SOS$AUDITLOG == 'true') {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = '';
                vm.comments.operation = 'Unstop';
                vm.comments.type = 'Job Chain';
                angular.forEach(vm.object.jobChains, function (value, index) {
                    if (index == vm.object.jobChains.length - 1) {
                        vm.comments.name = vm.comments.name + ' ' + value.path;
                    } else {
                        vm.comments.name = value.path + ', '+ vm.comments.name ;
                    }
                });
                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    jobChains.comment = vm.comments.comment;
                    JobChainService.unstop(jobChains);
                }, function () {

                });
            } else {
                JobChainService.unstop(jobChains);
            }
            vm.reset();
        };

        vm.stopNode = function (data, jobChain) {
            var nodes = {};
            nodes.nodes = [];
            nodes.jobschedulerId = $scope.schedulerIds.selected;
            nodes.nodes.push({jobChain: jobChain.path, node: data.name});
            if ($window.localStorage.$SOS$AUDITLOG == 'true') {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = jobChain.path;
                vm.comments.operation = 'Stop Node';
                vm.comments.type = 'Job Chain';

                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    nodes.comment = vm.comments.comment;
                    JobService.stopNode(nodes);
                }, function () {
                });
            } else {
                JobService.stopNode(nodes);
            }
            vm.reset();
        };

        vm.unStopNode = function (data, jobChain) {
            var nodes = {};
            nodes.nodes = [];
            nodes.jobschedulerId = $scope.schedulerIds.selected;
            nodes.nodes.push({jobChain: jobChain.path, node: data.name});
            if ($window.localStorage.$SOS$AUDITLOG == 'true') {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = jobChain.path;
                vm.comments.operation = 'Unstop Node';
                vm.comments.type = 'Job Chain';

                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    nodes.comment = vm.comments.comment;
                    JobService.activateNode(nodes);
                }, function () {

                });
            } else {
                JobService.activateNode(nodes);
            }
            vm.reset();
        };

        vm.skipNode = function (data, jobChain) {
            var nodes = {};
            nodes.nodes = [];
            nodes.jobschedulerId = $scope.schedulerIds.selected;
            nodes.nodes.push({jobChain: jobChain.path, node: data.name});
            if ($window.localStorage.$SOS$AUDITLOG == 'true') {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = jobChain.path;
                vm.comments.operation = 'Skip Node';
                vm.comments.type = 'Job Chain';

                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    nodes.comment = vm.comments.comment;
                    JobService.skipNode(nodes);
                }, function () {

                });
            } else {
                JobService.skipNode(nodes);
            }
            vm.reset();
        };

        vm.unskipNode = function (data, jobChain) {
            var nodes = {};
            nodes.nodes = [];
            nodes.jobschedulerId = $scope.schedulerIds.selected;
            nodes.nodes.push({jobChain: jobChain.path, node: data.name});
            if ($window.localStorage.$SOS$AUDITLOG == 'true') {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = jobChain.path;
                vm.comments.operation = 'Unskip Node';
                vm.comments.type = 'Job Chain';

                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    nodes.comment = vm.comments.comment;
                    JobService.activateNode(nodes);
                }, function () {

                });
            } else {
                JobService.activateNode(nodes);
            }
            vm.reset();
        };

        vm.stopJob = function (data) {
            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = $scope.schedulerIds.selected;
            jobs.jobs.push({job: data.job.path});
            if ($window.localStorage.$SOS$AUDITLOG == 'true') {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = data.job.path;
                vm.comments.operation = 'Stop';
                vm.comments.type = 'Job';

                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    jobs.comment = vm.comments.comment;
                    JobService.stop(jobs);
                }, function () {

                });
            } else {
                JobService.stop(jobs);
            }
            vm.reset();
        };

        vm.unstopJob = function (data) {
            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = $scope.schedulerIds.selected;
            jobs.jobs.push({job: data.job.path});
            if ($window.localStorage.$SOS$AUDITLOG == 'true') {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = data.job.path;
                vm.comments.operation = 'Unstop';
                vm.comments.type = 'Job';

                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    jobs.comment = vm.comments.comment;
                    JobService.unstop(jobs);
                }, function () {

                });
            } else {
                JobService.unstop(jobs);
            }
            vm.reset();
        };


        vm.end = function (task, path) {
            var jobs = {};
            jobs.jobs = [];
            jobs.taskIds = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            jobs.jobs.push({job: path});
            jobs.taskIds.push({taskId: task.taskId});
            if ($window.localStorage.$SOS$AUDITLOG == 'true') {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = path;
                vm.comments.operation = 'End Task';
                vm.comments.type = 'Job';

                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    jobs.comment = vm.comments.comment;
                    TaskService.end(jobs);
                }, function () {

                });
            } else {
                TaskService.end(jobs);
            }
            vm.reset();
        };
        vm.killTask = function (task, path) {
            var jobs = {};
            jobs.jobs = [];
            jobs.taskIds = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            jobs.jobs.push({job: path});
            jobs.taskIds.push({taskId: task.taskId});
            if ($window.localStorage.$SOS$AUDITLOG == 'true') {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = path;
                vm.comments.operation = 'Kill Task';
                vm.comments.type = 'Job';

                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    jobs.comment = vm.comments.comment;
                    TaskService.kill(jobs);
                }, function () {

                });
            } else {
                TaskService.kill(jobs);
            }
            vm.reset();

        };
        vm.terminateTask = function (task, path) {
            var jobs = {};
            jobs.jobs = [];
            jobs.taskIds = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            jobs.jobs.push({job: path});
            jobs.taskIds.push({taskId: task.taskId});
            if ($window.localStorage.$SOS$AUDITLOG == 'true') {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = path;
                vm.comments.operation = 'Terminate Task';
                vm.comments.type = 'Job';

                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    jobs.comment = vm.comments.comment;
                    TaskService.terminate(jobs);
                }, function () {

                });
            } else {
                TaskService.terminate(jobs);
            }
            vm.reset();
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
                jobs.taskIds = [];
                jobs.jobs.push({job: path});
                jobs.taskIds.push({taskId: task.taskId});
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

            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/terminate-task-timeout-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                terminateTaskWithTimeout(job, task, path);
            }, function () {

            });
            vm.reset();
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
            $('#jobChainTableId').table2excel({
                exclude: ".noExl",
                filename: "jobscheduler-jobchain",
                fileext: ".xls",
                exclude_img: false,
                exclude_links: false,
                exclude_inputs: false
            });
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

        vm.applyFilter = function () {
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
                vm.savedJobChainFilter.list.push(vm.jobChainFilter);
                if (vm.savedJobChainFilter.list.length == 1) {
                    vm.savedJobChainFilter.selected = vm.jobChainFilter.name;
                    selectedFiltered = vm.jobChainFilter;
                    vm.load();
                }
                SavedFilter.setJobChain(vm.savedJobChainFilter);
                SavedFilter.save();

            }, function () {

            });
        };

        vm.editFilters = function () {
            vm.filters = vm.savedJobChainFilter;
            modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/edit-filter-dialog.html',
                controller: 'DialogCtrl',
                scope: vm
            });
        };

        vm.editFilter = function (filter) {
            vm.filterName = filter.name;
            vm.jobChainFilter = angular.copy(filter);
            vm.paths = vm.jobChainFilter.paths;
            vm.object.paths = vm.paths;
            vm.isUnique = true;
            modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/edit-jobchain-filter-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                size: 'lg',
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                angular.forEach(vm.savedJobChainFilter.list, function (value, index) {
                    if (value.name == filter.name) {
                        vm.savedJobChainFilter.list[index] = vm.jobChainFilter;
                    }
                });

                if (vm.savedJobChainFilter.selected == vm.filterName) {
                    vm.savedJobChainFilter.selected = vm.jobChainFilter.name;
                    selectedFiltered = vm.jobChainFilter;
                    vm.jobChainFilters.selectedView = true;
                    vm.load();
                }
                if (vm.savedJobChainFilter.favorite == vm.filterName) {
                    vm.savedJobChainFilter.favorite = vm.jobChainFilter.name;
                }
                SavedFilter.setJobChain(vm.savedJobChainFilter);
                SavedFilter.save();
                vm.filterName = undefined;
            }, function () {
                vm.filterName = undefined;
            });
        };

        vm.deleteFilter = function (name) {
            angular.forEach(vm.savedJobChainFilter.list, function (value, index) {
                if (value.name == name) {
                    toasty.success({
                        title: value.name + ' ' + gettextCatalog.getString('message.filterDeleteSuccessfully'),
                        msg: ''
                    });
                    vm.savedJobChainFilter.list.splice(index, 1);
                }
            });
            if (vm.savedJobChainFilter.list.length == 0) {
                vm.savedJobChainFilter.selected = undefined;
                vm.jobChainFilters.selectedView = false;
                selectedFiltered = undefined;
            }
            if (vm.savedJobChainFilter.selected == name) {
                vm.savedJobChainFilter.selected = undefined;
                vm.jobChainFilters.selectedView = false;
                selectedFiltered = undefined;
                vm.load();
            }
            SavedFilter.setJobChain(vm.savedJobChainFilter);
            SavedFilter.save();

        };

        vm.favorite = function (filter) {
            vm.savedJobChainFilter.favorite = filter.name;
            vm.jobChainFilters.selectedView = true;
            SavedFilter.setJobChain(vm.savedJobChainFilter);
            SavedFilter.save();
            vm.load();
        };

        vm.removeFavorite = function () {
            vm.savedJobChainFilter.favorite = '';
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
            vm.jobChainFilter.paths.splice(object, 1);
        };

        vm.checkFilterName = function () {
            vm.isUnique = true;
            angular.forEach(vm.savedJobChainFilter.list, function (value) {
                if (!vm.filterName) {
                    if (vm.jobChainFilter.name == value.name) {
                        vm.isUnique = false;
                    }
                } else {
                    if (value.name != vm.filterName) {
                        if (vm.jobChainFilter.name == value.name) {
                            vm.isUnique = false;
                        }
                    }
                }
            })
        };

        vm.changeFilter = function (filter) {
            if (filter) {
                vm.savedJobChainFilter.selected = filter.name;
                vm.jobChainFilters.selectedView = true;
            }
            else {
                vm.savedJobChainFilter.selected = filter;
                vm.jobChainFilters.selectedView = false;
            }

            selectedFiltered = filter;
            SavedFilter.setJobChain(vm.savedJobChainFilter);
            SavedFilter.save();
            vm.load();
        };

        vm.hidePanel = function () {
            $('#rightPanel1').addClass('m-l-0 fade-in');
            $('#rightPanel1 .parent .child').removeClass('col-xxl-3 col-lg-4').addClass('col-xxl-2 col-lg-3');
            $('#leftPanel').hide();
            $('.sidebar-btn').show();
        };

        vm.showLeftPanel = function () {
            $('#rightPanel1').removeClass('fade-in m-l-0');
            $('#rightPanel1 .parent .child').addClass('col-xxl-3 col-lg-4').removeClass('col-xxl-2 col-lg-3');
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

        var splitRegex = new RegExp('(.+):(.+)');

        var parentRegex = '';

        vm.showNodePanelFuc = showNodePanelFuc;
        function showNodePanelFuc(jobChain) {
            jobChain.show = true;
            JobChainService.getJobChain({
                jobschedulerId: vm.schedulerIds.selected,
                jobChain: jobChain.path
            }).then(function (res) {
                jobChain = angular.merge(jobChain, res.jobChain);
                angular.forEach(jobChain.nodes, function (val, index) {
                    if (val.job && val.job.state && val.job.state._text == 'RUNNING' && $window.localStorage.$SOS$SHOWTASKS === 'true') {

                        JobService.get({
                            jobschedulerId: vm.schedulerIds.selected,
                            jobs: [{job: val.job.path}]
                        }).then(function (res1) {
                            jobChain.nodes[index].job = angular.merge(jobChain.nodes[index].job, res1.jobs[0]);
                        });
                    }
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

        vm.showHistory = showHistory;

        function showHistory(jobChain) {
            vm.showHistoryPanel = jobChain;
            var filter = {};
            filter.jobChain = jobChain.path;
            filter.jobschedulerId = $scope.schedulerIds.selected;
            JobChainService.histories(filter).then(function (res) {
                vm.historys = res.history;
            });
        }

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
                            break;
                        }
                    }
                }
            return scrTree;
        };

        var t1 = '';
        $scope.$on('event-started', function () {
            if (vm.events && vm.events.length > 0 && vm.events[0].eventSnapshots) {

                angular.forEach(vm.events[0].eventSnapshots, function (event) {

                    if (event.eventType.indexOf("Order") !== -1 || event.eventType == 'JobChainNodeActionChanged' || (event.eventType == 'JobChainStateChanged' && event.state != 'closed') || event.eventType == 'JobStateChanged') {
                        if (event.path != undefined) {
                            var path = [];
                            if (event.path.indexOf(",") > -1) {
                                path = event.path.split(",");
                            } else {
                                path[0] = event.path;
                            }

                            if (vm.jobChainFilters.filter.state == 'ALL') {

                                angular.forEach(vm.allJobChains, function (value2, index) {
                                    var flag = false;
                                    if (event.eventType == 'JobStateChanged' && value2.nodes && value2.nodes.length > 0) {
                                        angular.forEach(value2.nodes, function (node) {
                                            if (path[0] == node.job.path) {
                                                flag = true;
                                            }
                                        });
                                    }

                                    if (value2.path == path[0] || flag) {
                                        var obj = {};
                                        obj.jobschedulerId = $scope.schedulerIds.selected;
                                        obj.jobChain = value2.path;

                                        JobChainService.getJobChain(obj).then(function (res) {
                                            if (res.jobChain) {
                                                res.jobChain.path1 = angular.copy(value2.path1);
                                                res.jobChain.distributed = angular.copy(value2.distributed);
                                                res.jobChain.title = angular.copy(value2.title);
                                                res.jobChain.endNodes = angular.copy(value2.endNodes);
                                                res.jobChain.show = angular.copy(value2.show);
                                                vm.allJobChains[index] = res.jobChain;
                                                angular.forEach(res.jobChain.nodes, function (val, index) {
                                                    if (val.job && val.job.state && val.job.state._text == 'RUNNING' && $window.localStorage.$SOS$SHOWTASKS === 'true') {

                                                        JobService.get({
                                                            jobschedulerId: vm.schedulerIds.selected,
                                                            jobs: [{job: val.job.path}]
                                                        }).then(function (res1) {
                                                            res.jobChain.nodes[index].job = angular.merge(res.jobChain.nodes[index].job, res1.jobs[0]);
                                                        });
                                                    }
                                                });
                                            }
                                        });

                                    }

                                    if (vm.orders && vm.orders.length > 0 && vm.orders[0].jobChain == path[0]) {
                                        var obj = {};
                                        obj.jobschedulerId = vm.schedulerIds.selected;
                                        obj.compact = true;
                                        obj.orders = [];
                                        obj.orders.push({jobChain: path[0]});
                                        OrderService.get(obj).then(function (res) {
                                            var data = [];
                                            if (res && res.orders) {
                                                if (vm.orders.length > 0 && vm.orders.length > res.orders.length) {
                                                    angular.forEach(vm.orders, function (orders) {

                                                        for (var i = 0; i < res.orders.length; i++) {
                                                            if (orders.path == res.orders[i].path) {
                                                                orders = angular.merge(orders, res.orders[i]);
                                                                data.push(orders);
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
                                });
                            } else {
                                navFullTreeForUpdateJobChain(path[0].substring(0, path[0].lastIndexOf('/')));
                            }
                            if (vm.showHistoryPanel && vm.showHistoryPanel.path == path[0]) {
                                var filter = {};
                                filter.jobChain = vm.showHistoryPanel.path;
                                filter.jobschedulerId = $scope.schedulerIds.selected;
                                JobChainService.histories(filter).then(function (res) {
                                    vm.historys = res.history;
                                });
                            }
                        }
                    }
                    if (event.eventType.indexOf("FileBased") !== -1 && (event.objectType == "JOBCHAIN" || event.objectType == "ORDER")) {

                        if (t1) {
                            $timeout.cancel(t1);
                        }
                        t1 = $timeout(function () {
                            if (selectedFiltered && selectedFiltered.paths && selectedFiltered.paths.length > 0) {
                                var folders = [];
                                angular.forEach(selectedFiltered.paths, function (v) {
                                    folders.push({folder: v});
                                });
                            }
                            JobChainService.tree({
                                jobschedulerId: vm.schedulerIds.selected,
                                compact: true,
                                folders: folders,
                                types: ['JOBCHAIN']
                            }).then(function (res) {
                                    vm.jobChainFilters.expand_to = vm.recursiveTreeUpdate(angular.copy(res.folders), vm.jobChainFilters.expand_to);
                                    vm.tree = vm.jobChainFilters.expand_to;
                                }
                            );
                            var path = [];
                            if (event.path.indexOf(",") > -1) {
                                path = event.path.split(",");
                            } else {
                                path[0] = event.path;
                            }
                            if (vm.allJobChains.length > 0) {
                                for (var j = 0; j < vm.allJobChains.length; j++) {
                                    if (path[0].substring(0, path[0].lastIndexOf('/')) == vm.allJobChains[j].path.substring(0, vm.allJobChains[j].path.lastIndexOf('/'))) {
                                        navFullTreeForUpdateJobChain(path[0].substring(0, path[0].lastIndexOf('/')));
                                        break;
                                    }
                                }
                            } else {
                                navFullTreeForUpdateJobChain(path[0].substring(0, path[0].lastIndexOf('/')));
                            }

                            $timeout.cancel(t1);
                        }, 5000);

                    }
                });
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

        $scope.$on('$destroy', function () {
            watcher1();
            watcher3();
            watcher4();
            if (t1) {
                $timeout.cancel(t1);
            }
        });
    }

    JobCtrl.$inject = ["$scope", "$rootScope", "JobService", "$uibModal", "orderByFilter", "SavedFilter", "TaskService", "toasty", "ScheduleService",
        "gettextCatalog", "$state", "CoreService", "$timeout", "$window", "DailyPlanService"];
    function JobCtrl($scope, $rootScope, JobService, $uibModal, orderBy, SavedFilter, TaskService, toasty, ScheduleService,
                     gettextCatalog, $state, CoreService, $timeout, $window, DailyPlanService) {
        var vm = $scope;
        vm.jobFilters = CoreService.getJobTab();
        vm.maxEntryPerPage = $window.localStorage.$SOS$MAXENTRYPERPAGE;

        vm.showTask = $window.localStorage.$SOS$SHOWTASKS == 'true';

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
        var selectedFiltered;

        vm.savedJobFilter = JSON.parse(SavedFilter.jobFilters) || {};
        vm.savedJobFilter.list = vm.savedJobFilter.list || [];

        if (vm.jobFilters.selectedView)
            vm.savedJobFilter.selected = vm.savedJobFilter.selected || vm.savedJobFilter.favorite;
        else
            vm.savedJobFilter.selected = undefined;

        if (vm.savedJobFilter.selected) {
            angular.forEach(vm.savedJobFilter.list, function (value) {
                if (value.name == vm.savedJobFilter.selected) {
                    selectedFiltered = value;
                }
            });
        }

        vm.expanding_property = {
            field: "name"
        };

        vm.exportToExcel = function () {
            $('#exportToExcelBtn').attr("disabled", true);

            $('#jobTableId').table2excel({
                exclude: ".noExl",
                filename: "jobscheduler-job",
                fileext: ".xls",
                exclude_img: false,
                exclude_links: false,
                exclude_inputs: false
            });

            $('#exportToExcelBtn').attr("disabled", false);
        };


        /**
         * Function to initialized tree view
         */
        function initTree() {
            if (selectedFiltered && selectedFiltered.paths && selectedFiltered.paths.length > 0) {
                var folders = [];
                angular.forEach(selectedFiltered.paths, function (v) {
                    folders.push({folder: v});
                });
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
                        previousTreeState();
                    }
                }
                vm.jobFilters.expand_to = vm.tree;
                vm.folderPath = '/';
                vm.isLoading = true;
            }, function (err) {
                vm.isLoading = true;
            });
        }

        initTree();

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
            if (selectedFiltered) {
                obj.regex = selectedFiltered.regex;
            }
            obj.folders = [];
            obj.folders.push({folder: data.path, recursive: true});
            JobService.getJobsP(obj).then(function (result) {
                vm.jobs = result.jobs;
                volatileInformation(obj, data);
            }, function () {
                volatileInformation(obj, data);
                vm.loading = false;
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


                        if (value.state._text == 'RUNNING' && $window.localStorage.$SOS$SHOWTASKS === 'true') {

                            JobService.get({
                                jobschedulerId: vm.schedulerIds.selected,
                                jobs: [{job: value.path}]
                            }).then(function (res1) {
                                value = angular.merge(value, res1.jobs[0]);
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
            if (selectedFiltered) {
                obj.regex = selectedFiltered.regex;
            }
            obj.folders = [{folder: data.path, recursive: false}];
            JobService.getJobsP(obj).then(function (result) {
                data.jobs = result.jobs;
                volatileFolderData(data, obj);
            }, function (err) {
                volatileFolderData(data, obj);
                vm.loading = false;
            });
        }

        function expandFolderData1(data) {

            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.compact = true;
            if (selectedFiltered) {
                obj.regex = selectedFiltered.regex;
            }
            obj.folders = [{folder: data.path, recursive: false}];
            JobService.getJobsP(obj).then(function (result) {
                data.jobs = result.jobs;
                volatileFolderData1(data, obj);
            }, function (err) {
                volatileFolderData1(data, obj);
                vm.loading = false;
            });
        }

        function volatileFolderData(data1, obj) {

            if (selectedFiltered) {
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
                    angular.forEach(data1.jobs, function (jobs) {

                        for (var i = 0; i < res.jobs.length; i++) {
                            if (jobs.path == res.jobs[i].path) {
                                jobs = angular.merge(jobs, res.jobs[i]);
                                data.push(jobs);
                                break;
                            }
                        }
                    });
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
                        if (flag && value1.state._text == 'RUNNING' && $window.localStorage.$SOS$SHOWTASKS === 'true') {
                            JobService.get({
                                jobschedulerId: vm.schedulerIds.selected,
                                jobs: [{job: value1.path}]
                            }).then(function (res1) {
                                vm.allJobs[index1] = angular.merge(vm.allJobs[index1], res1.jobs[0]);
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

            if (selectedFiltered) {
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
                    angular.forEach(data.jobs, function (jobs) {

                        for (var i = 0; i < res.jobs.length; i++) {
                            if (jobs.path == res.jobs[i].path) {
                                jobs = angular.merge(jobs, res.jobs[i]);
                                data1.push(jobs);
                                break;
                            }
                        }
                    });
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
                vm.allJobs = temp;

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
                vm.allJobs = temp;
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
                value.expanded = true;
                value.selected1 = true;
                vm.allJobs = [];
                checkExpand(value);
            });
        }

        function previousTreeState() {
            vm.allJobs = [];
            angular.forEach(vm.tree, function (value) {
                checkExpand(value);
            });
        }

        function checkExpandTreeForUpdates(data) {
            if (data.selected1) {
                var obj = {};
                obj.jobschedulerId = vm.schedulerIds.selected;
                obj.compact = true;

                if (selectedFiltered) {
                    obj.regex = selectedFiltered.regex;
                } else {
                    if (vm.jobFilters.filter.state != 'ALL') {
                        obj.states = [];
                        obj.states.push(vm.jobFilters.filter.state);
                    }
                }
                obj.folders = [{folder: data.path, recursive: false}];

                var obj1 = {};
                obj1.jobschedulerId = vm.schedulerIds.selected;
                obj1.compact = true;
                if (selectedFiltered) {
                    obj1.regex = selectedFiltered.regex;
                }
                obj1.folders = [{folder: data.path, recursive: false}];
                JobService.getJobsP(obj1).then(function (result) {
                    JobService.get(obj).then(function (res) {
                        if (result.jobs && result.jobs.length > 0) {
                            var x = [];
                            angular.forEach(result.jobs, function (jobs) {

                                for (var i = 0; i < res.jobs.length; i++) {
                                    if (jobs.path == res.jobs[i].path) {
                                        jobs = angular.merge(jobs, res.jobs[i]);
                                        x.push(jobs);
                                    }
                                }
                            });
                            data.jobs = x;
                        } else {
                            data.jobs = res.jobs;
                        }
                        //update list view
                        angular.forEach(data.jobs, function (value) {
                            value.path1 = data.path;
                            vm.allJobs.push(value);

                        });
                        vm.loading = false;
                    }, function () {
                        data.jobs = result.jobs;

                        angular.forEach(data.jobs, function (value) {
                            value.path1 = data.path;
                            vm.allJobs.push(value);
                        });
                        vm.loading = false;
                    });
                }, function () {
                    vm.loading = false;
                    JobService.get(obj).then(function (res) {
                        if (res.jobs) {
                            //update card view
                            if (obj.folders[0].folder == data.path) {
                                data.jobs = res.jobs;
                            }
                            //update list view
                            angular.forEach(data.jobs, function (job) {
                                job.path1 = data.path;
                                vm.allJobs.push(job);
                            });
                        }
                    });
                });
            }
            data.folders = orderBy(data.folders, 'name');
            angular.forEach(data.folders, function (value) {
                if (value.expanded || value.selected1)
                    checkExpandTreeForUpdates(value);
            });
        }

        function parseDate(obj) {
            var fromDate;
            var toDate;

            if (selectedFiltered.state && selectedFiltered.state.length > 0) {
                obj.states = selectedFiltered.state;
            }
            if (selectedFiltered.planned) {
                if (/^\s*(now\s*\+)\s*(\d+)\s*$/i.test(selectedFiltered.planned)) {
                    fromDate = new Date();
                    toDate = new Date();
                    var seconds = parseInt(/^\s*(now\s*\+)\s*(\d+)\s*$/i.exec(selectedFiltered.planned)[2]);
                    toDate.setSeconds(toDate.getSeconds() + seconds);
                } else if (/^\s*\d+[d,h]\s*$/i.test(selectedFiltered.planned)) {
                    obj.dateFrom = selectedFiltered.planned;
                } else if (/^\s*(Today)\s*$/i.test(selectedFiltered.planned)) {
                    fromDate = new Date();

                    fromDate.setHours(0);
                    fromDate.setMinutes(0);
                    toDate = new Date();
                    toDate.setHours(23);
                    toDate.setMinutes(59);
                } else if (/^\s*(now)\s*$/i.test(selectedFiltered.planned)) {
                    fromDate = new Date();
                    toDate = new Date();
                } else if (/^\s*(\d+):(\d+)\s*(am|pm)\s*to\s*(\d+):(\d+)\s*(am|pm)\s*$/i.test(selectedFiltered.planned)) {
                    var time = /^\s*(\d+):(\d+)\s*(am|pm)\s*to\s*(\d+):(\d+)\s*(am|pm)\s*$/i.exec(selectedFiltered.planned);
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

            if (selectedFiltered.fromDate) {
                if (selectedFiltered.fromTime) {
                    fromDate = new Date(selectedFiltered.fromDate);
                    selectedFiltered.fromTime = new Date(selectedFiltered.fromTime);
                    fromDate.setHours(selectedFiltered.fromTime.getHours());
                    fromDate.setMinutes(selectedFiltered.fromTime.getMinutes());
                    fromDate.setSeconds(selectedFiltered.fromTime.getSeconds());
                }

            }
            if (selectedFiltered.toDate) {
                if (selectedFiltered.toTime) {
                    toDate = new Date(selectedFiltered.toDate);
                    selectedFiltered.toTime = new Date(selectedFiltered.toTime);
                    toDate.setHours(selectedFiltered.toTime.getHours());
                    toDate.setMinutes(selectedFiltered.toTime.getMinutes());
                    toDate.setSeconds(selectedFiltered.toTime.getSeconds());
                }


            }

            if (fromDate && toDate) {
                obj.dateFrom = fromDate;
                obj.dateTo = toDate;
            }

            return obj;
        }

        function volatileInformation(obj, expandNode) {

            if (selectedFiltered) {
                obj = parseDate(obj);
            } else {
                if (vm.jobFilters.filter.state != 'ALL') {
                    obj.states = [];
                    obj.states.push(vm.jobFilters.filter.state);
                }
            }
            JobService.get(obj).then(function (res) {

                var data = [];
                if (vm.jobs && vm.jobs.length > 0) {
                    angular.forEach(vm.jobs, function (jobs) {

                        for (var i = 0; i < res.jobs.length; i++) {
                            if (jobs.path == res.jobs[i].path) {
                                jobs = angular.merge(jobs, res.jobs[i]);
                                data.push(jobs);
                                break;
                            }
                        }
                    });
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

        vm.changeStatus = function () {
            vm.allJobs = [];
            vm.loading = true;
            angular.forEach(vm.tree, function (value) {
                if (value.expanded || value.selected1)
                    checkExpandTreeForUpdates(value);
            });
        };

        vm.load = function () {
            initTree();
        };


        /**--------------- Checkbox functions -------------*/
        vm.allCheck = {
            checkbox: false
        };


        var watcher1 = $scope.$watchCollection('object.jobs', function (newNames) {
            if (newNames && newNames.length > 0) {
                vm.allCheck.checkbox = newNames.length == vm.allJobs.slice((vm.jobFilters.pageSize * (vm.jobFilters.currentPage - 1)), (vm.jobFilters.pageSize * vm.jobFilters.currentPage)).length;

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
                    if ((value.ordersSummary && value.ordersSummary.pending != undefined)) {
                        vm.isStart = true;
                    } else if (value.configurationStatus && value.configurationStatus.severity == 2) {
                        vm.isStart = true;
                    }
                });
            } else {
                vm.reset();

            }
        });

        var watcher3 = $scope.$watch('jobFilters.pageSize', function (newNames) {
            if (newNames)
                vm.reset();
        });
        vm.checkAll = function () {
            if (vm.allCheck.checkbox && vm.allJobs.length > 0) {
                vm.object.jobs = vm.allJobs.slice((vm.jobFilters.pageSize * (vm.jobFilters.currentPage - 1)), (vm.jobFilters.pageSize * vm.jobFilters.currentPage));
            } else {
                vm.reset();
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
            $('#rightPanel1 .parent .child').removeClass('col-xxl-3 col-lg-4').addClass('col-xxl-2 col-lg-3');
            $('#leftPanel').hide();
            $('.sidebar-btn').show();
        };

        vm.showLeftPanel = function () {
            $('#rightPanel1').removeClass('fade-in m-l-0');
            $('#rightPanel1 .parent .child').addClass('col-xxl-3 col-lg-4').removeClass('col-xxl-2 col-lg-3');
            $('#leftPanel').show();
            $('.sidebar-btn').hide();

        };
        vm.applyFilter = function () {
            vm.jobFilter = {};
            vm.isUnique = true;
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/job-filter-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                size: 'lg',
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                if (vm.jobFilter.radio == 'current') {
                    vm.jobFilter.fromDate = undefined;
                    vm.jobFilter.fromTime = undefined;
                    vm.jobFilter.toDate = undefined;
                    vm.jobFilter.toTime = undefined;
                    vm.jobFilter.planned = undefined;
                } else if (vm.jobFilter.radio == 'planned') {
                    vm.jobFilter.state = undefined;
                }
                vm.savedJobFilter.list.push(vm.jobFilter);

                if (vm.savedJobFilter.list.length == 1) {
                    vm.savedJobFilter.selected = vm.jobFilter.name;
                    vm.jobFilters.selectedView = true;
                    selectedFiltered = vm.jobFilter;
                    vm.load();
                }
                SavedFilter.setJob(vm.savedJobFilter);
                SavedFilter.save();

            }, function () {

            });
        };

        vm.editFilters = function () {
            vm.filters = vm.savedJobFilter;
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/edit-filter-dialog.html',
                controller: 'DialogCtrl',
                scope: vm
            });
        };

        vm.editFilter = function (filter) {
            vm.filterName = filter.name;
            vm.jobFilter = angular.copy(filter);
            vm.paths = vm.jobFilter.paths;
            vm.object.paths = vm.paths;
            vm.isUnique = true;
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/edit-job-filter-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                size: 'lg',
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                angular.forEach(vm.savedJobFilter.list, function (value, index) {
                    if (value.name == filter.name) {
                        vm.savedJobFilter.list[index] = vm.jobFilter;
                    }
                });

                if (vm.savedJobFilter.selected == vm.filterName) {
                    vm.savedJobFilter.selected = vm.jobFilter.name;
                    selectedFiltered = vm.jobFilter;
                    vm.jobFilters.selectedView = true;
                    vm.load();
                }
                if (vm.savedJobFilter.favorite == vm.filterName) {
                    vm.savedJobFilter.favorite = vm.jobFilter.name;
                }
                SavedFilter.setJob(vm.savedJobFilter);
                SavedFilter.save();
                vm.filterName = undefined;
            }, function () {
                vm.filterName = undefined;
            });
        };

        vm.deleteFilter = function (name) {
            angular.forEach(vm.savedJobFilter.list, function (value, index) {
                if (value.name == name) {
                    toasty.success({
                        title: value.name + ' ' + gettextCatalog.getString('message.filterDeleteSuccessfully'),
                        msg: ''
                    });
                    vm.savedJobFilter.list.splice(index, 1);
                }
            });
            if (vm.savedJobFilter.list.length == 0) {
                vm.savedJobFilter.selected = undefined;
                vm.jobFilters.selectedView = false;
                selectedFiltered = undefined;
            }
            if (vm.savedJobFilter.selected == name) {
                vm.savedJobFilter.selected = undefined;
                vm.jobFilters.selectedView = false;
                selectedFiltered = undefined;
                vm.load();
            }
            SavedFilter.setJob(vm.savedJobFilter);
            SavedFilter.save();


        };

        vm.favorite = function (filter) {
            vm.savedJobFilter.favorite = filter.name;
            vm.jobFilters.selectedView = true;
            SavedFilter.setJob(vm.savedJobFilter);
            SavedFilter.save();
            vm.load();
        };
        vm.removeFavorite = function () {
            vm.savedJobFilter.favorite = '';
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

        var watcher4 = $scope.$watchCollection('object.paths', function (newNames) {
            if (newNames && newNames.length > 0) {
                vm.paths = newNames;
            }
        });

        vm.addJobChainPaths = function () {
            vm.jobFilter.paths = vm.paths;
        };

        vm.remove = function (object) {
            vm.jobFilter.paths.splice(object, 1);
        };

        vm.checkFilterName = function () {
            vm.isUnique = true;
            angular.forEach(vm.savedJobFilter.list, function (value) {
                if (!vm.filterName) {
                    if (vm.jobFilter.name == value.name) {
                        vm.isUnique = false;
                    }
                } else {
                    if (value.name != vm.filterName) {
                        if (vm.jobFilter.name == value.name) {
                            vm.isUnique = false;
                        }
                    }
                }
            })
        };

        vm.changeFilter = function (filter) {
            if (filter) {
                vm.savedJobFilter.selected = filter.name;
                vm.jobFilters.selectedView = true;
            }
            else {
                vm.savedJobFilter.selected = filter;
                vm.jobFilters.selectedView = false;
            }
            selectedFiltered = filter;

            SavedFilter.setJob(vm.savedJobFilter);
            SavedFilter.save();

            vm.load();

        };

        vm.showTaskFuc = function (value, isRunning) {
            if (isRunning) {
                if (value.numOfRunningTasks == 0) {
                    return;
                }
            }

            vm.showTaskPanel = value;
            var jobs = {};
            jobs.jobschedulerId = vm.schedulerIds.selected;
            jobs.job = value.path;
            JobService.history(jobs).then(function (res) {
                vm.taskHistory = res.history;
            }, function () {
            });

            if (value.numOfQueuedTasks > 0 || value.numOfRunningTasks > 0) {
                var obj = {};
                obj.jobschedulerId = vm.schedulerIds.selected;
                obj.jobs = [];
                obj.jobs.push({job: value.path});
                JobService.getJobsP(obj).then(function (res) {
                    JobService.get(obj).then(function (result) {
                        if (res.jobs.length > 0 && result.jobs.length > 0)
                            vm.showTaskPanel = angular.merge(res.jobs[0], result.jobs[0]);
                        else if (res.jobs.length == 0 && result.jobs.length != 0)
                            vm.showTaskPanel = result.jobs[0];
                        else
                            vm.showTaskPanel = res.jobs[0];
                        value.runningTasks = vm.showTaskPanel.runningTasks;

                    }, function (err) {
                        vm.showTaskPanel = res.jobs[0];
                        value.runningTasks = vm.showTaskPanel.runningTasks;
                    });
                }, function () {
                    JobService.get(obj).then(function (result) {
                        vm.showTaskPanel = angular.merge(value, result.jobs[0]);
                        value.runningTasks = vm.showTaskPanel.runningTasks;
                    });
                });
            }
            if (value.ordersSummary)
                getQueueOrders(jobs);

            vm.isRunning = isRunning;
            vm.jobFilters.showTaskPanel = vm.showTaskPanel.path;
        };

        function getQueueOrders(jobs) {
            JobService.getQueueOrders(jobs).then(function (res) {
                vm.queueOrders = res.job;
            }, function (err) {

            });
        }

        vm.showJobChains = function (job) {
            if (job.usedInJobChains > 0) {
                $('#jobChain').modal('show');
                var jobs = {};
                jobs.jobs = [];
                jobs.jobschedulerId = vm.schedulerIds.selected;
                jobs.jobs.push({job: job.path});
                JobService.getJobsP(jobs).then(function (res) {
                    vm.job = res.jobs[0];
                }, function (err) {

                });
            }
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
            if ($window.localStorage.$SOS$AUDITLOG == 'true') {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = job.path;
                vm.comments.operation = 'Stop';
                vm.comments.type = 'Job';

                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    jobs.comment = vm.comments.comment;
                    JobService.stop(jobs);
                }, function () {

                });
            } else {
                JobService.stop(jobs);
            }
            vm.reset();
        };
        vm.unstop = function (job) {
            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            jobs.jobs.push({job: job.path});
            if ($window.localStorage.$SOS$AUDITLOG == 'true') {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = job.path;
                vm.comments.operation = 'Unstop';
                vm.comments.type = 'Job';

                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    jobs.comment = vm.comments.comment;
                    JobService.unstop(jobs);
                }, function () {

                });
            } else {
                JobService.unstop(jobs);
            }
            vm.reset();
        };
        vm.start = function (job) {
            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            jobs.jobs.push({job: job.path, at: 'now'});
            if ($window.localStorage.$SOS$AUDITLOG == 'true') {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = job.path;
                vm.comments.operation = 'Start';
                vm.comments.type = 'Job';

                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    jobs.comment = vm.comments.comment;
                    JobService.start(jobs);
                }, function () {

                });
            } else {
                JobService.start(jobs);
            }
            vm.reset();
        };


        function startAt(job, paramObject) {
            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            var obj = {};
            obj.params = job.params;
            obj.job = job.path;

            if (job.date && job.time) {
                job.date.setHours(job.time.getHours());
                job.date.setMinutes(job.time.getMinutes());
                job.date.setSeconds(job.time.getSeconds());
            }

            if (job.date && job.at == 'later')
                obj.at = moment.utc(job.date).format();
            else
                obj.at = job.atTime;

            if (!obj.params && paramObject.params.length > 0) {
                obj.params = paramObject.params;
            } else if (obj.params && paramObject.params.length > 0) {
                obj.params.concat(paramObject.params);
            }
            jobs.jobs.push(obj);
            JobService.start(jobs);
        }

        vm.startAt = function (job) {
            vm.job = job;
            vm.paramObject = {};
            vm.paramObject.params = [];
            vm.job.atTime = 'now';
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/start-job-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                startAt(vm.job, vm.paramObject);
            }, function () {
                vm.reset();
            });
        };


        vm.stopAll = function () {
            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            angular.forEach(vm.object.jobs, function (value) {
                jobs.jobs.push({job: value.path});
            });
            if ($window.localStorage.$SOS$AUDITLOG == 'true') {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = '';
                vm.comments.operation = 'Stop';
                vm.comments.type = 'Job';
                angular.forEach(vm.object.jobs, function (value, index) {
                    if (index == vm.object.jobs.length - 1) {
                        vm.comments.name = vm.comments.name + ' ' + value.path;
                    } else {
                        vm.comments.name = value.path+ ', '+vm.comments.name ;
                    }
                });
                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    jobs.comment = vm.comments.comment;
                    JobService.stop(jobs);
                }, function () {

                });
            } else {
                JobService.stop(jobs);
            }
            vm.reset();
        };
        vm.unStopAll = function () {
            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            angular.forEach(vm.object.jobs, function (value) {
                jobs.jobs.push({job: value.path});
            });
            if ($window.localStorage.$SOS$AUDITLOG == 'true') {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = '';
                vm.comments.operation = 'Unstop';
                vm.comments.type = 'Job';
                angular.forEach(vm.object.jobs, function (value, index) {
                    if (index == vm.object.jobs.length - 1) {
                        vm.comments.name = vm.comments.name + ' ' + value.path;
                    } else {
                        vm.comments.name =  value.path+ ', ' + vm.comments.name;
                    }
                });
                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    jobs.comment = vm.comments.comment;
                    JobService.unstop(jobs);
                }, function () {

                });
            } else {
                JobService.unstop(jobs);
            }
            vm.reset();
        };
        vm.startAll = function () {
            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            angular.forEach(vm.object.jobs, function (value) {
                jobs.jobs.push({job: value.path});
            });
            if ($window.localStorage.$SOS$AUDITLOG == 'true') {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = '';
                vm.comments.operation = 'Start';
                vm.comments.type = 'Job';
                angular.forEach(vm.object.jobs, function (value, index) {
                    if (index == vm.object.jobs.length - 1) {
                        vm.comments.name = vm.comments.name + ' ' + value.path;
                    } else {
                        vm.comments.name = value.path+ ', ' +  vm.comments.name;
                    }
                });
                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {

                    jobs.comment = vm.comments.comment;
                    JobService.start(jobs);
                }, function () {

                });
            } else {
                JobService.start(jobs);
            }
            vm.reset();
        };

        vm.reset = function () {
            vm.allCheck.checkbox = false;
            vm.object.jobs = [];
        };


        vm.end = function (task, path) {
            var jobs = {};
            jobs.jobs = [];
            jobs.taskIds = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            jobs.jobs.push({job: path});
            jobs.taskIds.push({taskId: task.taskId});
            if ($window.localStorage.$SOS$AUDITLOG == 'true') {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = path;
                vm.comments.operation = 'End Task';
                vm.comments.type = 'Job';

                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    jobs.comment = vm.comments.comment;
                    TaskService.end(jobs);
                }, function () {

                });
            } else {
                TaskService.end(jobs);
            }
            vm.reset();
        };
        vm.killTask = function (task, path) {
            var jobs = {};
            jobs.jobs = [];
            jobs.taskIds = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            jobs.jobs.push({job: path});
            jobs.taskIds.push({taskId: task.taskId});
            if ($window.localStorage.$SOS$AUDITLOG == 'true') {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = path;
                vm.comments.operation = 'Kill Task';
                vm.comments.type = 'Job';

                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    jobs.comment = vm.comments.comment;
                    TaskService.kill(jobs);
                }, function () {

                });
            } else {
                TaskService.kill(jobs);
            }
            vm.reset();
        };
        vm.terminateTask = function (task, path) {
            var jobs = {};
            jobs.jobs = [];
            jobs.taskIds = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            jobs.jobs.push({job: path});
            jobs.taskIds.push({taskId: task.taskId});
            if ($window.localStorage.$SOS$AUDITLOG == 'true') {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = path;
                vm.comments.operation = 'Terminate Task';
                vm.comments.type = 'Job';

                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    jobs.comment = vm.comments.comment;
                    TaskService.terminate(jobs);
                }, function () {

                });
            } else {
                TaskService.terminate(jobs);
            }
            vm.reset();
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
                jobs.taskIds = [];
                jobs.jobs.push({job: path});
                jobs.taskIds.push({taskId: task.taskId});
            }

            jobs.timeout = vm.timeout;
            TaskService.terminateWith(jobs);
            vm.reset();
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
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/terminate-task-timeout-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                terminateTaskWithTimeout(job, task, path);
            }, function () {

            });
            vm.reset();
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
            if ($window.localStorage.$SOS$AUDITLOG == 'true') {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = job.path;
                vm.comments.operation = 'Kill All Task';
                vm.comments.type = 'Job';
                if (!job) {
                    angular.forEach(vm.object.jobs, function (value, index) {
                        if (index == vm.object.jobs.length - 1) {
                            vm.comments.name = vm.comments.name + ' ' + value.path;
                        } else {
                            vm.comments.name = value.path + ', ' +vm.comments.name ;
                        }
                    });
                }

                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    jobs.comment = vm.comments.comment;
                    TaskService.killAll(jobs);
                }, function () {

                });
            } else {
                TaskService.killAll(jobs);
            }
            vm.reset();
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
            if ($window.localStorage.$SOS$AUDITLOG == 'true') {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = job.path;
                vm.comments.operation = 'Terminate All Task';
                vm.comments.type = 'Job';
                if (!job) {
                    angular.forEach(vm.object.jobs, function (value, index) {
                        if (index == vm.object.jobs.length - 1) {
                            vm.comments.name = vm.comments.name + ' ' + value.path;
                        } else {
                            vm.comments.name = value.path + ', ' +  vm.comments.name;
                        }
                    });
                }

                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    jobs.comment = vm.comments.comment;
                    TaskService.terminateAll(jobs);
                }, function () {

                });
            } else {
                TaskService.terminateAll(jobs);
            }
            vm.reset();
        };

        function setRunTime(job) {
            var jobs = {};
            jobs.jobs = [];
            jobs.jobs.push({job: job.path, runTime: vkbeautify.xmlmin(job.runTime)});
            jobs.jobschedulerId = vm.schedulerIds.selected;
            JobService.setRunTime(jobs);
            vm.reset();
        }

        vm.setRunTime = function (job) {
            vm.order = job;
            JobService.getRunTime({
                jobschedulerId: vm.schedulerIds.selected,
                job: job.path
            }).then(function (res) {
                if (res.runTime) {
                    vm.runTimes = res.runTime;
                    vm.xml = vm.runTimes.runTime;
                }
                $rootScope.$broadcast('loadXml');

            });

            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/set-run-time-dialog.html',
                controller: 'RuntimeEditorDialogCtrl',
                scope: vm,
                size: 'lg',
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                setRunTime(job);
            }, function () {
                vm.reset();
            });

            ScheduleService.getSchedulesP({
                jobschedulerId: vm.schedulerIds.selected,
                compact: true
            }).then(function (res) {
                vm.schedules = res.schedules;
            });
            vm.zones = moment.tz.names();
        };

        vm.viewCalendar = function (job) {
            vm._job = job;
            vm.planItems = [];
            DailyPlanService.getPlans({
                jobschedulerId: $scope.schedulerIds.selected,
                states: ['PLANNED'],
                job: vm._job.path
            }).then(function (res) {
                vm.planItemData = res.planItems;
                vm.planItemData.forEach(function (data) {
                    var planData = {
                        plannedStartTime: data.plannedStartTime,
                        expectedEndTime: data.expectedEndTime
                    };
                    vm.planItems.push(planData);
                });

            }, function (err) {
            });
            openCalendar();
        };

        function openCalendar() {
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/calendar-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                size: 'lg',
                backdrop: 'static'
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
                            break;
                        }
                    }
                }
        }

        function loadAuditLogs(obj) {
            JobService.getAuditLogs(obj).then(function (result) {
                if (result && result.auditLog) {
                    vm.auditLogs = result.auditLog;
                }
            }, function () {

            });
        }

        var modalInstance;
        vm.showAuditLogs = function (job) {

            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.compact = true;
            obj.jobs = [];
            obj.jobs.push({job: job.path});
            loadAuditLogs(obj);

            modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/audit-log-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                size: 'lg',
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                vm.auditLogs = null;
            }, function () {
                vm.auditLogs = null;

            });
            vm.reset();
        };
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
                            break;
                        }
                    }
                }
            return scrTree;
        };

        var t1 = '';
        $scope.$on('event-started', function () {
            if (vm.events && vm.events.length > 0) {
                angular.forEach(vm.events[0].eventSnapshots, function (value1) {

                    if (value1.eventType.indexOf("Task") !== -1 || value1.eventType == "JobStateChanged") {
                        if (value1.path != undefined) {
                            var path = [];
                            if (value1.path.indexOf(",") > -1) {
                                path = value1.path.split(",");
                            } else {
                                path[0] = value1.path;
                            }
                            if (vm.jobFilters.filter.state == 'ALL') {
                                angular.forEach(vm.allJobs, function (value2, index) {

                                    if (value2.path == path[0]) {

                                        var obj = {};
                                        obj.jobschedulerId = $scope.schedulerIds.selected;
                                        obj.jobs = [];
                                        obj.jobs.push({job: value2.path});

                                        JobService.get(obj).then(function (res) {
                                            if (res.jobs && res.jobs.length > 0) {

                                                res.jobs[0].title = vm.allJobs[index].title;
                                                res.jobs[0].path1 = vm.allJobs[index].path1;
                                                res.jobs[0].isOrderJob = vm.allJobs[index].isOrderJob;
                                                res.jobs[0].hasDescription = vm.allJobs[index].hasDescription;
                                                res.jobs[0].estimatedDuration = vm.allJobs[index].estimatedDuration;
                                                res.jobs[0].maxTasks = vm.allJobs[index].maxTasks;
                                                vm.allJobs[index] = res.jobs[0];
                                                if (vm.showTaskPanel && (vm.showTaskPanel.path == value2.path)) {
                                                    vm.showTaskPanel = vm.allJobs[index];
                                                }

                                            }
                                        });
                                    }
                                });
                            } else {
                                navFullTreeForUpdateJob(path[0].substring(0, path[0].lastIndexOf('/')));
                            }
                            if (vm.showTaskPanel && vm.showTaskPanel.path == path[0]) {
                                var jobs = {};
                                jobs.jobschedulerId = vm.schedulerIds.selected;
                                jobs.job = path[0];
                                JobService.history(jobs).then(function (res) {
                                    vm.taskHistory = res.history;
                                });
                            }
                        }

                    }
                    if (value1.eventType.indexOf("FileBased") !== -1 && (value1.objectType == "JOB" || value1.objectType == "ORDER")) {
                        if (t1) {
                            $timeout.cancel(t1);
                        }
                        t1 = $timeout(function () {
                            if (selectedFiltered && selectedFiltered.paths && selectedFiltered.paths.length > 0) {
                                var folders = [];
                                angular.forEach(selectedFiltered.paths, function (v) {
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


                            $timeout.cancel(t1);
                        }, 5000);

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

        $scope.$on('$destroy', function () {
            watcher1();
            watcher3();
            watcher4();
            if (t1) {
                $timeout.cancel(t1);
            }
        });
    }

})();
