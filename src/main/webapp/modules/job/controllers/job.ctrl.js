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
        "toasty", "gettextCatalog", "DailyPlanService", "$rootScope", "CoreService", "$timeout"];
    function JobChainCtrl($scope, JobChainService, OrderService, JobService, $location, SOSAuth, $uibModal, orderBy, ScheduleService, SavedFilter,
                          toasty, gettextCatalog, DailyPlanService, $rootScope, CoreService, $timeout) {
        var vm = $scope;
        vm.jobChainFilters = CoreService.getJobChainTab();

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
            vm.savedJobChainFilter.selected = vm.savedJobChainFilter.favorite;


        $rootScope.$on('event-jobChains', function (event, values) {
            vm.expand_to = values;
        });
        if (vm.savedJobChainFilter.selected) {
            for(var i=0;i<vm.savedJobChainFilter.list.length;i++) {
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

                for(var i=0;i<selectedFiltered.paths.length;i++) {

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

        vm.treeHandler = function (data) {
            vm.reset();
            navFullTree();
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
                data.jobChains = result.jobChains;
                volatileFolderData(data, obj);
            }, function (err) {
                vm.loading = false;
                volatileFolderData(data, obj);
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

            JobChainService.get(obj).then(function (res) {

                var data1 = [];
                if (data.jobChains && data.jobChains.length > 0) {
                    angular.forEach(data.jobChains, function (jobChains) {
                        if (jobChains.path.substring(0, 1) != '/') {
                            jobChains.path = '/' + jobChains.path;
                        }

                        angular.forEach(res.jobChains, function (jobChainData) {
                            var flag1 = true;
                            if (jobChains.path == jobChainData.path) {
                                jobChains = angular.merge(jobChains, jobChainData);
                                if (selectedFiltered && selectedFiltered.agentName && jobChains.processClass) {
                                    if (!jobChains.processClass.match(selectedFiltered.agentName)) {
                                        flag1 = false;
                                    }
                                }
                                if (flag1)
                                    data1.push(jobChains);

                            }
                        })
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

                if (data.jobChains.length > 0) {
                    var temp =[];
                    for(var x=0; x<vm.allJobChains.length;x++){
                        if (vm.allJobChains[x].path1 != data.path) {
                            temp.push(vm.allJobChains[x]);
                        }
                    }

                    angular.forEach(data.jobChains, function (value) {
                        value.path1 = data.path;
                        temp.push(value);
                    });
                    vm.allJobChains = temp;
                }
                vm.folderPath = data.name || '/';


                vm.loading = false;
            }, function () {

                if (data.jobChains.length > 0) {
                    var temp =[];
                     for(var x=0; x<vm.allJobChains.length;x++){
                        if (vm.allJobChains[x].path1 != data.path) {
                            temp.push(vm.allJobChains[x]);
                        }
                    }
                    angular.forEach(data.jobChains, function (value) {
                        value.path1 = data.path;
                        temp.push(value);
                    });
                    vm.allJobChains = temp;
                }
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


        var i = 1, splitPath = [];

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

                        if (vm.flag && data.folders[x].path.substring(1, data.folders[x].path.length) == splitPath[i] && i < splitPath.length) {
                            i = i + 1;
                            splitPath[i] = splitPath[i - 1] + '/' + splitPath[i];

                            data.folders[x].expanded = true;
                            if (vm.expand_to.name == data.folders[x].name) {
                                data.folders[x].selected1 = true;
                                vm.flag = false;
                                i = 1;
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

                        if (result.jobChains && result.jobChains.length > 0 && res.jobChains && res.jobChains.length > 0) {
                            var x = [];
                            angular.forEach(result.jobChains, function (jobChains) {
                                if (jobChains.path.substring(0, 1) != '/') {
                                    jobChains.path = '/' + jobChains.path;
                                }

                                angular.forEach(res.jobChains, function (jobChainData) {
                                    if (jobChains.path == jobChainData.path) {
                                        jobChains = angular.merge(jobChains, jobChainData);
                                        x.push(jobChains);
                                    }
                                });
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
            JobChainService.get(obj).then(function (res) {
                var data = [];
                if (vm.jobChains && vm.jobChains.length > 0) {
                    angular.forEach(vm.jobChains, function (jobChains) {
                        if (jobChains.path.substring(0, 1) != '/') {
                            jobChains.path = '/' + jobChains.path;
                        }

                        angular.forEach(res.jobChains, function (jobChainData) {
                            var flag1 = true;
                            if (jobChains.path == jobChainData.path) {
                                jobChains = angular.merge(jobChains, jobChainData);
                                if (selectedFiltered && selectedFiltered.agentName && jobChains.processClass) {
                                    if (!jobChains.processClass.match(selectedFiltered.agentName)) {
                                        flag1 = false;
                                    }
                                }
                                if (flag1) {
                                    data.push(jobChains);
                                }

                            }
                        })
                    });
                } else {
                    angular.forEach(res.jobChains, function (jobChainData) {
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
            for(var i=0; i<vm.tree.length;i++) {
                if (vm.tree[i].expanded || vm.tree[i].selected1)
                    checkExpandTreeForUpdates(vm.tree[i]);
            }

        };
        vm.load = function () {
            initTree();
        };

        /**--------------- Checkbox functions -------------*/
        vm.allCheck = {
            checkbox: false
        };

        var watcher1 = $scope.$watchCollection('object.jobChains', function (newNames) {
            if (newNames && newNames.length > 0) {
                vm.allCheck.checkbox = newNames.length == vm.allJobChains.slice((vm.jobChainFilters.pageSize * (vm.jobChainFilters.currentPage - 1)), (vm.jobChainFilters.pageSize * vm.jobChainFilters.currentPage)).length;
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
                vm.allCheck.checkbox = false;
            }
        });

        var watcher3 = $scope.$watch('jobChainFilters.pageSize', function () {
            vm.reset();
        });

        vm.checkAll = function () {
            if (vm.allCheck.checkbox && vm.allJobChains && vm.allJobChains.length > 0) {
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

        vm.viewOrdersDetail = function (jobChain) {
            SOSAuth.setJobChain(JSON.stringify(jobChain));
            SOSAuth.save();
            $location.path('/jobChainDetails/overview').search({path: jobChain.path});
        };

        vm.viewCalendar = function (jobChain) {
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
                        expectedEndTime: data.expectedEndTime
                    };
                    vm.planItems.push(planData);
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
                            if (orders.path.substring(0, 1) != '/') {
                                orders.path = '/' + orders.path;
                            }
                            angular.forEach(res.orders, function (orderData) {
                                if (orders.path == orderData.path) {
                                    orders = angular.merge(orders, orderData);
                                    data.push(orders);
                                }
                            })
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

        vm.startOrder = function (jobChain) {
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
                vm.reset();
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
                order.fromDate.setHours(order.fromTime.getHours());
                order.fromDate.setMinutes(order.fromTime.getMinutes());
                order.fromDate.setSeconds(order.fromTime.getSeconds());
            }

            if (order.fromDate) {
                obj.at = moment.utc(order.fromDate).format();
            } else {
                obj.at = 'now';
            }

            if (paramObject.length > 0) {
                obj.params = paramObject;
            }
            orders.orders.push(obj);
            OrderService.addOrder(orders).then(function (res) {
                vm.reset();
            });
        }

        vm.addOrder = function (jobChain) {
            ScheduleService.getSchedulesP({
                jobschedulerId: vm.schedulerIds.selected,
                compact: true
            }).then(function (res) {
                vm.schedules = res.schedules;
            });

            vm._jobChain = jobChain;

            JobChainService.getJobChainP({
                jobschedulerId: vm.schedulerIds.selected,
                jobChain: jobChain.path
            }).then(function (res) {
                vm._jobChain = res.jobChain;
            });

            vm.order = {};
            vm.paramObject = {};
            vm.paramObject.params = [];

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
            vm.reset();
        };


        vm.stopJobChain = function (jobChain) {
            var jobChains = {};
            jobChains.jobChains = [];
            jobChains.jobschedulerId = vm.schedulerIds.selected;
            jobChains.jobChains.push({jobChain: jobChain.path});
            JobChainService.stop(jobChains).then(function (res) {

            });
            vm.reset();
        };
        vm.unstopJobChain = function (jobChain) {
            var jobChains = {};
            jobChains.jobChains = [];
            jobChains.jobschedulerId = vm.schedulerIds.selected;
            jobChains.jobChains.push({jobChain: jobChain.path});
            JobChainService.unstop(jobChains).then(function (res) {

            });
            vm.reset();
        };
        vm.stopAll = function () {
            var jobChains = {};
            jobChains.jobChains = [];
            jobChains.jobschedulerId = vm.schedulerIds.selected;

            angular.forEach(vm.object.jobChains, function (value) {
                jobChains.jobChains.push({jobChain: value.path});
            });
            JobChainService.stop(jobChains).then(function (res) {
                vm.reset();
            });
        };

        vm.unstopAll = function () {
            var jobChains = {};
            jobChains.jobChains = [];
            jobChains.jobschedulerId = vm.schedulerIds.selected;
            angular.forEach(vm.object.jobChains, function (value) {
                jobChains.jobChains.push({jobChain: value.path});
            });
            JobChainService.unstop(jobChains).then(function (res) {
                vm.reset();
            });
        };

        vm.reset = function () {
            vm.allCheck.checkbox = false;
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
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                vm.savedJobChainFilter.list.push(vm.jobChainFilter);

                if (vm.savedJobChainFilter.list.length == 1) {
                    vm.savedJobChainFilter.favorite = vm.jobChainFilter.name;
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
            vm.savedJobChainFilter.selected = filter.name;
            vm.jobChainFilters.selectedView = true;
            selectedFiltered = filter;
            SavedFilter.setJobChain(vm.savedJobChainFilter);
            SavedFilter.save();
            vm.load();
        };

        vm.removeFavorite = function (filter) {
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
            vm.jobChainFilter.regex = '';
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
            if (filter)
                vm.savedJobChainFilter.selected = filter.name;
            else
                vm.savedJobChainFilter.selected = filter;
            vm.jobChainFilters.selectedView = true;
            selectedFiltered = filter;
            SavedFilter.setJobChain(vm.savedJobChainFilter);
            SavedFilter.save();
            vm.load();
        };

        vm.hidePanel = function () {
            $('#rightPanel1').addClass('m-l-0 fade-in');
            $('#rightPanel1 .parent .child').removeClass('col-lg-4').addClass('col-lg-3');
            $('#rightPanel1 .parent .child').removeClass('col-xxl-3').addClass('col-xxl-2');
            $('#leftPanel').hide();
            $('.sidebar-btn').show();
        };

        vm.showLeftPanel = function () {
            $('#rightPanel1').removeClass('fade-in m-l-0');
            $('#rightPanel1 .parent .child').addClass('col-lg-4').removeClass('col-lg-3');
            $('#rightPanel1 .parent .child').addClass('col-xxl-3').removeClass('col-xxl-2');
            $('#leftPanel').show();
            $('.sidebar-btn').hide();

        };

        function traverseToSelectedJobChain(data, jobChain) {
            function recursive(data) {
                if (data.path == jobChain.path1)
                    for(var index=0;index<data.jobChains.length; index++) {
                        if (jobChain.path == data.jobChains[index].path) {
                            data.jobChains[index] = jobChain;
                        }
                    }
                for(var i=0; i<data.folders.length;i++) {
                    if (data.folders[i].path.match(jobChain.path1) || jobChain.path1.match(data.folders[i].path)) {
                        recursive(data.folders[i]);
                    }
                }

            }

            recursive(data);
        }

        var splitRegex = new RegExp('(.+):(.+)');

        var parentRegex = '';

        vm.showNodePanelFuc = function (jobChain) {
            JobChainService.getJobChain({
                jobschedulerId: vm.schedulerIds.selected,
                jobChain: jobChain.path
            }).then(function (res) {
                jobChain = angular.merge(jobChain, res.jobChain);
            });

            jobChain.show = true;
            for (var i = 0; i < vm.tree.length; i++) {
                if (vm.tree[i].path.match(jobChain.path1) || jobChain.path1.match(vm.tree[i].path)) {
                    traverseToSelectedJobChain(vm.tree[i], jobChain);
                }
            }

        };
        vm.hideNodePanelFuc = function (jobChain) {
            jobChain.show = false;
            for(var i=0; i<vm.tree.length;i++) {
                if (vm.tree[i].path.match(jobChain.path1) || jobChain.path1.match(vm.tree[i].path)) {
                    traverseToSelectedJobChain(vm.tree[i], jobChain);
                }
            }
        };

        vm.showHistory = function (jobChain) {
            vm.showHistoryPanel = jobChain;
            var filter = {};
            filter.jobChain = jobChain.path;
            filter.jobschedulerId = $scope.schedulerIds.selected;
            JobChainService.histories(filter).then(function (res) {
                vm.historys = res.history;
                vm.isLoading1 = true;
            }, function () {
                vm.isLoading1 = true;
            });
        };

        vm.hideHistoryPanel = function () {
            vm.showHistoryPanel = '';
        };

        vm.stopNode = function (data, jobChain) {
            var nodes = {};
            nodes.nodes = [];
            nodes.jobschedulerId = $scope.schedulerIds.selected;
            nodes.nodes.push({jobChain: jobChain.path, node: data.name});

            JobService.stopNode(nodes).then(function (res) {

            });
        };

        vm.unStopNode = function (data, jobChain) {

            var nodes = {};
            nodes.nodes = [];
            nodes.jobschedulerId = $scope.schedulerIds.selected;
            nodes.nodes.push({jobChain: jobChain.path, node: data.name});

            JobService.activateNode(nodes).then(function (res) {

            });
        };

        vm.skipNode = function (data, jobChain) {

            var nodes = {};
            nodes.nodes = [];
            nodes.jobschedulerId = $scope.schedulerIds.selected;
            nodes.nodes.push({jobChain: jobChain.path, node: data.name});

            JobService.skipNode(nodes).then(function (res) {

            });
        };

        vm.unskipNode = function (data, jobChain) {
            var nodes = {};
            nodes.nodes = [];
            nodes.jobschedulerId = $scope.schedulerIds.selected;
            nodes.nodes.push({jobChain: jobChain.path, node: data.name});

            JobService.activateNode(nodes).then(function (res) {
            });
        };

        vm.stopJob = function (data) {

            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = $scope.schedulerIds.selected;
            jobs.jobs.push({job: data.job.path});

            JobService.stop(jobs).then(function (res) {

            });
        };

        vm.unstopJob = function (data) {

            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = $scope.schedulerIds.selected;
            jobs.jobs.push({job: data.job.path});
            JobService.unstop(jobs).then(function (res) {

            });
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

                for(var i=0; i<vm.events[0].eventSnapshots.length;i++) {

                    if (vm.events[0].eventSnapshots[i].eventType.indexOf("Order") !== -1 || vm.events[0].eventSnapshots[i].eventType=='JobChainNodeActionChanged' || (vm.events[0].eventSnapshots[i].eventType=='JobChainStateChanged' && vm.events[0].eventSnapshots[i].state!='closed') || vm.events[0].eventSnapshots[i].eventType == 'JobStateChanged') {
                        if (vm.events[0].eventSnapshots[i].path != undefined) {
                            var path = [];
                            if (vm.events[0].eventSnapshots[i].path.indexOf(",") > -1) {
                                path = vm.events[0].eventSnapshots[i].path.split(",");
                            } else {
                                path[0] = vm.events[0].eventSnapshots[i].path;
                            }

                            angular.forEach(vm.allJobChains, function (value2, index) {
                                var flag = false;
                                if (vm.events[0].eventSnapshots[i].eventType == 'JobStateChanged' && value2.nodes && value2.nodes.length > 0) {
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
                                            res.jobChain.path1 = angular.copy(vm.allJobChains[index].path1);
                                            res.jobChain.distributed = angular.copy(vm.allJobChains[index].distributed);
                                            res.jobChain.show = angular.copy(vm.allJobChains[index].show);
                                            vm.allJobChains[index] = res.jobChain;
                                        }
                                    });

                                }

                                if (value2.path == path[0] && vm.showHistoryPanel && vm.showHistoryPanel.path == path[0]) {
                                    var filter = {};
                                    filter.jobChain = vm.showHistoryPanel.path;
                                    filter.jobschedulerId = $scope.schedulerIds.selected;
                                    JobChainService.histories(filter).then(function (res) {
                                        vm.historys = res.history;
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
                                                    if (orders.path.substring(0, 1) != '/') {
                                                        orders.path = '/' + orders.path;
                                                    }
                                                    angular.forEach(res.orders, function (orderData) {
                                                        if (orders.path == orderData.path) {
                                                            orders = angular.merge(orders, orderData);
                                                            data.push(orders);
                                                        }
                                                    })
                                                });
                                                vm.orders = data;
                                            } else {
                                                vm.orders = res.orders;
                                            }
                                        }
                                    });
                                }
                            });
                        }
                    }
                    if (vm.events[0].eventSnapshots[i].eventType.indexOf("FileBased") !== -1) {

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

                            for (var j = 0; j < vm.allJobChains.length; j++) {
                                if (vm.events[0].eventSnapshots[i].path.substring(0, vm.events[0].eventSnapshots[i].path.lastIndexOf('/')) == vm.allJobChains[j].path.substring(0, vm.allJobChains[j].path.lastIndexOf('/'))) {
                                    navFullTreeForUpdateJobChain(vm.events[0].eventSnapshots[i].path.substring(0, vm.events[0].eventSnapshots[i].path.lastIndexOf('/')));
                                    break;
                                }
                            }

                            $timeout.cancel(t1);
                        }, 5000);
                       break;
                    }
                }
            }

        });

        function navFullTreeForUpdateJobChain(path) {
            for (var i = 0; i < vm.tree.length; i++) {
                if (vm.tree[i].path != path) {
                    traverseTreeForUpdateJobChain(vm.tree[i], path);
                } else {

                    expandFolderData(vm.tree[i]);
                    break;
                }
            }
        }

        function traverseTreeForUpdateJobChain(data,path) {
            if(data.folders)
            for(var i=0;i<data.folders.length;i++) {
                if (data.folders[i].path != path) {
                    traverseTreeForUpdateJobChain(data.folders[i],path);
                }else{
                    expandFolderData(data.folders[i]);
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
        "gettextCatalog", "$state", "CoreService", "$timeout"];
    function JobCtrl($scope, $rootScope, JobService, $uibModal, orderBy, SavedFilter, TaskService, toasty, ScheduleService,
                     gettextCatalog, $state, CoreService, $timeout) {
        var vm = $scope;
        vm.jobFilters = CoreService.getJobTab();

        $rootScope.$on('event-jobs', function (event, values) {
            console.info("event-jobs" + JSON.stringify(values));
            vm.job_expand_to = values;

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

        if(vm.jobFilters.selectedView)
            vm.savedJobFilter.selected = vm.savedJobFilter.favorite;
            console.log(vm.jobFilters.selectedView)

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

        vm.treeHandler = function (data) {
            vm.reset();
            navFullTree();
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

        function volatileFolderData(data, obj) {

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
                        if (jobs.path.substring(0, 1) != '/') {
                            jobs.path = '/' + jobs.path;
                        }
                        angular.forEach(res.jobs, function (jobData) {
                            if (jobs.path == jobData.path) {
                                jobs = angular.merge(jobs, jobData);
                                data1.push(jobs);
                            }
                        })
                    });
                    data.jobs = data1;
                } else {
                    data.jobs = res.jobs;
                }


                if (data.jobs.length > 0) {
                    var temp =[];
                    for(var x=0; x<vm.allJobs.length;x++){
                        if (vm.allJobs[x].path1 != data.path) {
                            temp.push(vm.allJobs[x]);
                        }
                    }

                    angular.forEach(data.jobs, function (value) {
                        value.path1 = data.path;
                        temp.push(value);
                    });
                    vm.allJobs = temp;
                }

                vm.folderPath = data.name || '/';

                vm.loading = false;

            }, function () {
                if (data.jobs.length > 0) {
                    var temp =[];
                    for(var x=0; x<vm.allJobs.length;x++){
                        if (vm.allJobs[x].path1 != data.path) {
                            temp.push(vm.allJobs[x]);
                        }
                    }

                    angular.forEach(data.jobs, function (value) {
                        value.path1 = data.path;
                        temp.push(value);
                    });
                    vm.allJobs = temp;
                }
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

        var i = 1, splitPath = [];

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

                        if (vm.flag && data.folders[x].path.substring(1, data.folders[x].path.length) == splitPath[i] && i < splitPath.length) {
                            i = i + 1;
                            splitPath[i] = splitPath[i - 1] + '/' + splitPath[i];

                            data.folders[x].expanded = true;
                            if (vm.expand_to.name == data.folders[x].name) {
                                data.folders[x].selected1 = true;
                                vm.flag = false;
                                i = 1;
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
                        if (result.jobs && result.jobs.length > 0 && res.jobs && res.jobs.length > 0) {
                            var x = [];
                            angular.forEach(result.jobs, function (jobs) {
                                if (jobs.path.substring(0, 1) != '/') {
                                    jobs.path = '/' + jobs.path;
                                }

                                angular.forEach(res.jobs, function (jobData) {
                                    if (jobs.path == jobData.path) {
                                        jobs = angular.merge(jobs, jobData);
                                        x.push(jobs);
                                    }
                                });
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
                    var seconds = parseInt(/^\s*(now\+)(\d+)\s*$/i.exec(selectedFiltered.planned)[2]);
                    toDate.setSeconds(toDate.getSeconds() + seconds);
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
                        if (jobs.path.substring(0, 1) != '/') {
                            jobs.path = '/' + jobs.path;
                        }
                        angular.forEach(res.jobs, function (jobData) {
                            if (jobs.path == jobData.path) {
                                jobs = angular.merge(jobs, jobData);
                                data.push(jobs);
                            }
                        })
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

                vm.isOrderJob = false;
                vm.isStopped = false;
                vm.isUnstopped = false;
                vm.isStart = false;
                angular.forEach(newNames, function (value) {
                    if (value.isOrderJob) {
                        vm.isOrderJob = true;
                    }
                    if (value.state && value.state._text == 'STOPPED') {
                        vm.isStopped = true;
                    } else {
                        vm.isUnstopped = true;
                    }
                    if (value.ordersSummary && value.ordersSummary.pending != undefined) {
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


        vm.validPlanned = true;
        vm.checkPlanned = function () {
            vm.validPlanned = true;
            if (!vm.jobFilter.planned || /^\s*$/i.test(vm.jobFilter.planned) || /^\s*(now\s*\+)\s*(\d+)\s*$/i.test(vm.jobFilter.planned) || /^\s*(now)\s*$/i.test(vm.jobFilter.planned) || /^\s*(Today)\s*$/i.test(vm.jobFilter.planned)
                || /^\s*(\d+):(\d+)\s*(am|pm)\s*to\s*(\d+):(\d+)\s*(am|pm)\s*$/i.test(vm.jobFilter.planned)) {
            } else {
                vm.validPlanned = false;
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
            $('#rightPanel1 .parent .child').removeClass('col-lg-4').addClass('col-lg-3');
            $('#rightPanel1 .parent .child').removeClass('col-xxl-3').addClass('col-xxl-2');
            $('#leftPanel').hide();
            $('.sidebar-btn').show();
        };

        vm.showLeftPanel = function () {
            $('#rightPanel1').removeClass('fade-in m-l-0');
            $('#rightPanel1 .parent .child').addClass('col-lg-4').removeClass('col-lg-3');
            $('#rightPanel1 .parent .child').addClass('col-xxl-3').removeClass('col-xxl-2');
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
                    vm.savedJobFilter.favorite = vm.jobFilter.name;
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
                scope: vm,
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
            vm.savedJobFilter.favorite = filter;
            vm.savedJobFilter.selected = filter;
            vm.jobFilters.selectedView = true;
            SavedFilter.setJob(vm.savedJobFilter);
            SavedFilter.save();

            vm.load();
        };
        vm.removeFavorite = function (filter) {
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
            vm.jobFilter.regex = '';
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
            if (filter)
                vm.savedJobFilter.selected = filter.name;
            else
                vm.savedJobFilter.selected = filter;
            vm.jobFilters.selectedView = true;
            selectedFiltered = filter;

            SavedFilter.setJob(vm.savedJobFilter);
            SavedFilter.save();

            vm.load();

        };

        vm.isLoading1 = true;
        vm.showTaskFuc = function (value, isRunning) {
            if (isRunning) {
                if (value.numOfRunningTasks == 0) {
                    return;
                }
            }

            vm.isLoading1 = false;
            vm.showTaskPanel = value;
            var jobs = {};
            jobs.jobschedulerId = vm.schedulerIds.selected;
            jobs.job = value.path;
            JobService.history(jobs).then(function (res) {
                vm.taskHistory = res.history;
                vm.isLoading1 = true;
            }, function () {
                vm.isLoading1 = true;
            });

            if (value.numOfQueuedTasks > 0) {
                jobs = {};
                jobs.jobschedulerId = vm.schedulerIds.selected;
                jobs.jobs = [];
                jobs.jobs.push({job: value.path});
                JobService.getJobsP(jobs).then(function (res) {
                    JobService.get(jobs).then(function (result) {
                        if (res.jobs.length > 0 && result.jobs.length > 0)
                            vm.showTaskPanel = angular.merge(res.jobs[0], result.jobs[0]);
                        else if (res.jobs.length == 0 && result.jobs.length != 0)
                            vm.showTaskPanel = result.jobs[0];
                        else
                            vm.showTaskPanel = res.jobs[0];
                    }, function (err) {

                    });
                });
            }
            if (value.ordersSummary)
                getQueueOrders(jobs);

            vm.isRunning = isRunning;

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
        };


        /**--------------- Actions -----------------------------*/
        vm.stop = function (job) {
            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            jobs.jobs.push({job: job.path});
            JobService.stop(jobs).then(function (res) {

            });
            vm.reset();
        };
        vm.unstop = function (job) {
            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            jobs.jobs.push({job: job.path});
            JobService.unstop(jobs).then(function (res) {

            });
            vm.reset();
        };
        vm.start = function (job) {
            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            jobs.jobs.push({job: job.path, at: 'now'});
            JobService.start(jobs).then(function (res) {

            });
            vm.reset();
        };
        function startAt(job) {
            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            var obj = {};
            obj.params = job.params;

            if (job.date && job.time) {
                job.date.setHours(job.time.getHours());
                job.date.setMinutes(job.time.getMinutes());
                job.date.setSeconds(job.time.getSeconds());
            }

            obj.job = job.path;
            obj.at = moment.utc(order.date).format();
            if (!obj.params && paramObject.params.length > 0) {
                obj.params = paramObject.params;
            } else if (obj.params && paramObject.params.length > 0) {
                obj.params.concat(paramObject.params);
            }
            jobs.jobs.push(obj);
            JobService.start(jobs).then(function (res) {

            });
        }

        vm.startAt = function (job) {
            vm.job = job;
            vm.job.date = new Date();
            vm.job.time = new Date();
            vm.paramObject = {};
            vm.paramObject.params = [];
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/start-job-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                startAt(job);
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
            JobService.stop(jobs).then(function (res) {

            });
            vm.reset();
        };
        vm.unStopAll = function () {
            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            angular.forEach(vm.object.jobs, function (value) {
                jobs.jobs.push({job: value.path});
            });
            JobService.unstop(jobs).then(function (res) {

            });
            vm.reset();
        };
        vm.startAll = function () {
            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            angular.forEach(vm.object.jobs, function (value) {
                jobs.jobs.push({job: value.path});
            });
            JobService.start(jobs).then(function (res) {

            });
            vm.reset();
        };

        vm.reset = function () {
            vm.allCheck.checkbox = false;
            vm.object.jobs = [];
        };


        vm.end = function (task) {

            TaskService.end({taskId: task.taskId, jobschedulerId: vm.schedulerIds.selected}).then(function (res) {

            });
            vm.reset();
        };
        vm.killTask = function (task) {
            TaskService.kill({taskId: task.taskId, jobschedulerId: vm.schedulerIds.selected}).then(function (res) {

            });
            vm.reset();
        };
        vm.terminateTask = function (task) {
            TaskService.terminate({taskId: task.taskId, jobschedulerId: vm.schedulerIds.selected}).then(function (res) {

            });
            vm.reset();
        };
        vm.terminateTaskWithTimeout = function (task) {
            TaskService.terminateWith(task.taskId, {
                jobschedulerId: vm.schedulerIds.selected,
                timeout: vm.timeout
            }).then(function (res) {

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
            TaskService.killAll(vm.object.jobs).then(function (res) {

            }, function (err) {

            });
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
            TaskService.terminateAll(vm.object.jobs).then(function (res) {

            }, function (err) {

            });
            vm.reset();
        };
        vm.terminateAllTaskWithTimeout = function (job) {
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
            TaskService.terminateWithAll(vm.object.jobs).then(function (res) {

            }, function (err) {

            });
            vm.reset();
        };


        function setRunTime(job) {
            var jobs = {};
            jobs.jobs = [];
            jobs.jobs.push({job: job.path, runTime: job.runTime});
            jobs.jobschedulerId = vm.schedulerIds.selected;
            JobService.setRunTime(jobs).then(function (res) {

            });
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
                            var path=[];
                            if (value1.path.indexOf(",") > -1) {
                                path = value1.path.split(",");
                            } else {
                                path[0] = value1.path;
                            }
                            angular.forEach(vm.allJobs, function (value2, index) {

                                if (value2.path == path[0]) {

                                    var obj = {};
                                    obj.jobschedulerId = $scope.schedulerIds.selected;
                                    obj.jobs = [];
                                    obj.jobs.push({job: value2.path});

                                    JobService.get(obj).then(function (res) {
                                        if (res.jobs) {
                                            vm.allJobs[index] = angular.merge(vm.allJobs[index], res.jobs[0]);
                                        }
                                    });
                                    if (vm.showTaskPanel && (vm.showTaskPanel.path = value2.path)) {
                                        var jobs = {};
                                        jobs.jobschedulerId = vm.schedulerIds.selected;
                                        jobs.job = value2.path;
                                        JobService.history(jobs).then(function (res) {
                                            vm.taskHistory = res.history;
                                        });
                                    }
                                }
                            });
                        }

                    }
                    if (value1.eventType.indexOf("FileBased") !== -1) {
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

                            for (var i = 0; i < vm.allJobs.length; i++) {
                                if (value1.path.substring(0, value1.path.lastIndexOf('/')) == vm.allJobs[i].path.substring(0, vm.allJobs[i].path.lastIndexOf('/'))) {
                                    navFullTreeForUpdateJob(value1.path.substring(0, value1.path.lastIndexOf('/')));
                                    break;
                                }
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
                    expandFolderData(vm.tree[i]);
                    break;
                }
            }
        }

        function traverseTreeForUpdateJob(data,path) {
            if(data.folders)
            for(var i=0;i<data.folders.length;i++) {
                if (data.folders[i].path != path) {
                    traverseTreeForUpdateJob(data.folders[i],path);
                }else{
                    expandFolderData(data.folders[i]);
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
