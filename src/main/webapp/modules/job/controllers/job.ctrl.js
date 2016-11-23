/**
 * Created by sourabhagrawal on 31/05/16.
 */
(function () {
    'use strict';
    angular
        .module('app')
        .controller('JobChainCtrl', JobChainCtrl)
        .controller('JobCtrl', JobCtrl);

    JobChainCtrl.$inject = ["$scope", "JobChainService", "OrderService","JobService", "$location", "SOSAuth", "$uibModal", "orderByFilter", "ScheduleService", "SavedFilter",
        "toasty", "gettextCatalog", "DailyPlanService", "$interval", "$rootScope", "$timeout", "$window"];
    function JobChainCtrl($scope, JobChainService, OrderService,JobService, $location, SOSAuth, $uibModal, orderBy, ScheduleService, SavedFilter, toasty, gettextCatalog, DailyPlanService, $interval, $rootScope, $timeout, $window) {
        var vm = $scope;
        vm.filter = {};
        vm.filter.state = "ALL";
        vm.filter.sortBy = "name";

        vm.object = {};

        vm.pageSize = 10;
        vm.currentPage = 1;
        vm.tree = [];
        vm.allJobChains = [];
        vm.my_tree = {};

        vm.filter_tree = {};
        vm.filterTree1 = [];
        vm.object.paths = [];

        var selectedFiltered, isFilterChange = true;

        vm.savedJobChainFilter = JSON.parse(SavedFilter.jobChainFilters) || {};
        vm.savedJobChainFilter.list = vm.savedJobChainFilter.list || [];
        vm.savedJobChainFilter.selected = vm.savedJobChainFilter.favorite;

        if (vm.savedJobChainFilter.selected) {
            angular.forEach(vm.savedJobChainFilter.list, function (value) {
                if (value.name == vm.savedJobChainFilter.selected) {
                    selectedFiltered = value;
                }
            });
        }

        vm.expanding_property = {
            field: "name"
        };


        /**
         * Filter tree data based on select folders
         */
        function filterTreeData() {

            if (selectedFiltered && selectedFiltered.paths && selectedFiltered.paths.length > 0) {
                var data = [];
                angular.forEach(vm.filterTree, function (res) {
                    var flag = false;
                    if (selectedFiltered.paths && selectedFiltered.paths.length > 0) {
                        for (var i = 0; i < selectedFiltered.paths.length; i++) {
                            if (selectedFiltered.paths[i] == res.path) {
                                flag = true;
                                break;
                            } else {
                                if (res.path.indexOf(selectedFiltered.paths[i]) !== -1 || selectedFiltered.paths[i].indexOf(res.path) !== -1) {
                                    flag = true;
                                    break;
                                }
                            }
                        }
                    }

                    if (flag)
                        data.push(res);
                });
                vm.tree = data;
            } else {
                if (isFilterChange)
                    vm.tree = angular.copy(vm.filterTree);
            }

            filteredTreeData();
            isFilterChange = false;
        }

        /**
         * Function to initialized tree view
         */
        function initTree() {
            JobChainService.tree({
                jobschedulerId: vm.schedulerIds.selected,
                compact: true,
                types: ['JOBCHAIN']
            }).then(function (res) {

                vm.filterTree = res.folders;
                isFilterChange = true;
                filterTreeData();
                vm.isLoading = true;
            });
        }

        initTree();

        /**
         * Expand all tree data
         */
        vm.expandAll = function () {
            vm.branchs = [];
            vm.allJobChains = [];
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.compact = true;
            if (selectedFiltered) {
                obj.regex = selectedFiltered.regex;
                obj.folders = [];
                angular.forEach(selectedFiltered.paths, function (res) {
                    obj.folders.push({folder: res, recursive: false});
                });
            }

            JobChainService.getJobChainsP(obj).then(function (result) {
                vm.jobChains = result.jobChains;
                startTraverseTree();
                volatileInformation(obj, true);
            }, function () {
                volatileInformation(obj, true);
            });

        };
        function startTraverseTree() {
            vm.branchs = [];
            vm.allJobChains = [];
            angular.forEach(vm.tree, function (value) {
                traverseTree(value);
            });
        }
        function traverseTree(data) {
            data.jobChains = [];

            angular.forEach(vm.jobChains, function (value) {
                if (data.path == value.path.substring(0, value.path.lastIndexOf('/')) || data.path == value.path.substring(0, value.path.lastIndexOf('/')+1)) {
                    data.jobChains.push(value);
                    vm.allJobChains.push(value);
                }
            });

            if (data.jobChains.length > 0) {
                vm.branchs.push(data);
            }
                vm.folderPath = data.name;

            if (data.folders.length > 0) {
                data.folders = orderBy(data.folders, 'name');
                angular.forEach(data.folders, function (value) {
                    traverseTree(value);
                });
            }
        }


        vm.expandNode = function (data) {
            vm.branchs = [];
            vm.allJobChains = [];

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
                startTraverseNode(data);
                volatileInformation(obj, true, data);
            }, function () {
                volatileInformation(obj, true, data);
            });
        };

        vm.collapseNode = function (data) {
            function recursive(data) {
                data.expanded = !1;
                data.folders = orderBy(data.folders, 'name');
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
            vm.branchs = [];
            vm.allJobChains = [];
            function recursive(data) {
                data.expanded = !0;
                data.folders = orderBy(data.folders, 'name');

                data.jobChains = [];
                angular.forEach(vm.jobChains, function (value) {
                    if (data.path == value.path.substring(0, value.path.lastIndexOf('/'))) {
                        data.jobChains.push(value);
                        vm.allJobChains.push(value);
                    }
                });

                if (data.jobChains.length > 0) {
                    vm.branchs.push(data);
                }
                angular.forEach(data.folders, function (a) {
                    recursive(a);
                });
            }

            recursive(data);
        }




        function expandFolderData(data) {
            // console.info("expandFolderData"+JSON.stringify(data));
            vm.loading = true;
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
            if (vm.filter.state != 'ALL') {
                obj.states = [];
                obj.states.push(vm.filter.state);
            }
            if (selectedFiltered && selectedFiltered.state) {
                obj.states = selectedFiltered.state;
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

                    vm.branchs.push(data);
                }
                    vm.folderPath = data.name;

                angular.forEach(data.jobChains, function (value) {
                    vm.allJobChains.push(value);
                    if (value.ordersSummary && value.ordersSummary.running > 0) {
                        vm.getJobchainOnAddOrder = true;
                    }
                })
            }, function () {
                if (data.jobChains.length > 0) {
                    vm.branchs.push(data);
                }
                    vm.folderPath = data.name;

                angular.forEach(data.jobChains, function (value) {
                    vm.allJobChains.push(value);

                    if (value.ordersSummary && value.ordersSummary.running > 0) {
                        vm.getJobchainOnAddOrder = true;
                    }
                })
            });
        }


        function volatileFolderDataForAddOrder(data, obj) {
            if (vm.filter.state != 'ALL') {
                obj.states = [];
                obj.states.push(vm.filter.state);
            }
            if (selectedFiltered && selectedFiltered.state) {
                obj.states = selectedFiltered.state;
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

                    vm.branchs.push(data);
                }
                    vm.folderPath = data.name;

                angular.forEach(data.jobChains, function (value) {

                    angular.forEach(vm.allJobChains, function (value1, index) {

                        if (value.path == value1.path) {
                            vm.allJobChains.splice(index, 1, value);
                        }
                    });

                    // vm.allJobChains.push(value)
                    if (value.ordersSummary && value.ordersSummary.running > 0) {
                        vm.getJobchainOnAddOrder = true;
                    }
                })
            }, function () {
                if (data.jobChains.length > 0) {
                    vm.branchs.push(data);
                }
                    vm.folderPath = data.name;

                angular.forEach(data.jobChains, function (value) {
                    // vm.allJobChains.push(value)
                    angular.forEach(vm.allJobChains, function (index, value1) {
                        if (value.jobChains.path == value1.jobChains.path) {
                            vm.allJobChains.splice(index, 1, value);
                        }
                    });

                    if (value.ordersSummary && value.ordersSummary.running > 0) {
                        vm.getJobchainOnAddOrder = true;
                    }
                })
            });
        }


        vm.treeHandler1 = function (data) {
            if (data.expanded) {
                data.folders = orderBy(data.folders, 'name');
                data.jobChains = [];
                vm.branchs = [];
                vm.allJobChains = [];
                expandFolderData(data);
            }
        };

        vm.treeHandler = function (data) {
            data.expanded = !data.expanded;
            if (data.expanded) {
                data.folders = orderBy(data.folders, 'name');
                if (!data.jobChains || data.jobChains.length == 0)
                    expandFolderData(data);
                vm.branchs = [];
                vm.allJobChains = [];
                vm.branchs.push(data);
                angular.forEach(data.jobChains, function (value) {
                    vm.allJobChains.push(value)
                })
            }
        };


        function checkExpand(data) {
            data.jobChains = [];
            expandFolderData(data);
            if (data.jobChains.length > 0) {
                vm.branchs.push(data);
            }

            vm.folderPath = data.name;
            angular.forEach(data.jobChains, function (value) {
                vm.allJobChains.push(value)
            });
            data.folders = orderBy(data.folders, 'name');

            angular.forEach(data.folders, function (value) {
                if (vm.expand_to) {
                  if (vm.flag && (value.path.match(vm.expand_to.path) || vm.expand_to.path.match(value.path))) {
                      value.expanded = true;
                       if(vm.expand_to.name==value.name){
                           vm.flag = false;
                       }
                  }
                }
                vm.folderPath = value.name;
                if (value.expanded)
                    checkExpand(value);
            });

        }

        function filteredTreeData() {

            angular.forEach(vm.tree, function (value) {
                if ($rootScope.expand_to) {
                    vm.expand_to = angular.copy($rootScope.expand_to);
                    $rootScope.expand_to='';
                    vm.flag = true;
                 }
                 value.expanded = true;
                if (value.expanded) {
                    vm.branchs = [];
                    vm.allJobChains = [];
                    checkExpand(value);
                }

            });
        }


        function checkExpandTreeForUpdates(data) {

            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.compact = true;

            if (selectedFiltered) {
                obj.regex = selectedFiltered.regex;
            }
            obj.folders = [
                {folder: data.path, recursive: false}
            ];

            if (data.jobChains.length > 0)
                volatileFolderData(data, obj);
            data.folders = orderBy(data.folders, 'name');
            angular.forEach(data.folders, function (value) {
                if (value.expanded)
                    checkExpandTreeForUpdates(value);
            });
        }

        function filteredVolatileTreeData() {
            angular.forEach(vm.tree, function (value) {
                if (value.expanded)
                    checkExpandTreeForUpdates(value);
            });
        }

        function mergeJobChainData(object, flag1, expandNode) {
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
            if (flag1 && !expandNode) {
                startTraverseTree();
            }
            if(expandNode){
                startTraverseNode(expandNode);
            }
        }

        function volatileInformation(obj, flag, expandNode) {
            if (vm.filter.state != 'ALL') {
                obj.states = [];
                obj.states.push(vm.filter.state);
            }
            if (selectedFiltered && selectedFiltered.state) {
                obj.states = selectedFiltered.state;
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
                                if (flag1)
                                    data.push(jobChains);

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
                            data.push(jobChainData);


                    })
                }
                vm.jobChains = data;
                if (flag && !expandNode) {
                    startTraverseTree();
                }
                if(expandNode){
                    startTraverseNode(expandNode);
                }
            }, function () {
                mergeJobChainData(vm.jobChains, flag,expandNode);
            });
        }


        vm.load = function () {
            if (vm.filterTree.length == 0)
                initTree();
            else
                filterTreeData();
        };

        /**--------------- Checkbox functions -------------*/
        vm.allCheck = {
            checkbox: false
        };

        var watcher1 = $scope.$watchCollection('object.jobChains', function (newNames) {
            if (newNames && newNames.length > 0) {
                vm.allCheck.checkbox = newNames.length == vm.allJobChains.slice((vm.pageSize * (vm.currentPage - 1)), (vm.pageSize * vm.currentPage)).length;
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

        var watcher2 = $scope.$watchCollection('filtered', function () {
            vm.reset();
        });

        var watcher3 = $scope.$watch('pageSize', function () {
            vm.reset();
        });

        vm.checkAll = function () {
            if (vm.allCheck.checkbox && vm.allJobChains && vm.allJobChains.length > 0) {
                vm.object.jobChains = vm.allJobChains.slice((vm.pageSize * (vm.currentPage - 1)), (vm.pageSize * vm.currentPage));
            } else {
                vm.reset();
            }
        };

        /**--------------- Actions -----------------------------*/
        vm.viewOrders = function (jobChain) {
            SOSAuth.setJobChain(JSON.stringify(jobChain));
            SOSAuth.save();
            // $window.sessionStorage.$SOS$TREE = JSON.stringify(vm.tree);
            $location.path('/jobChainDetails/orders').search({path: jobChain.path});
        };

        vm.viewOrdersDetail = function (jobChain) {
            SOSAuth.setJobChain(JSON.stringify(jobChain));
            SOSAuth.save();
            // $window.sessionStorage.$SOS$TREE = JSON.stringify(vm.tree);
            $location.path('/jobChainDetails/overview').search({path: jobChain.path});
        };

        vm.viewCalendar = function (jobChain) {
            vm._jobChain = jobChain;
            vm.planItems = [];
            DailyPlanService.getPlans({
                jobschedulerId: $scope.schedulerIds.selected,
                states: ['PLANNED'],
                jobChain:jobChain.path
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
            $uibModal.open({
                templateUrl: 'modules/core/template/calendar-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                size: 'lg',
                backdrop: 'static'
            });

        }

        function loadJobOrderV(obj) {
            OrderService.getJobOrders(obj).then(function (res) {
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
                vm.isLoading = true;
            });
        }


        function loadOrders(obj) {
            OrderService.getJobOrdersP(obj).then(function (result) {
                if (result && result.orders) {
                    vm.orders = result.orders;
                }
                vm.isLoading = true;
                loadJobOrderV(obj);
            }, function () {
                vm.isLoading = true;
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

            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/order-list-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                size: 'lg',
                backdrop: 'static'
            });
            modalInstance.result.then(function () {

            }, function () {

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
                getJobChain(vm.schedulerIds.selected, vm._jobChain);
                vm.getJobchainOnAddOrder = true;
                toasty.success = {
                    'title': gettextCatalog.getString('message.addOrderSuccessfully')
                }
            }, function (err) {

            });
        }


        vm.jobChainPollingInterval = 15000;
        vm.getJobchainOnAddOrder = false;
        function getJobChain(schedulerIds, jobchain) {
            var data = [];
            data.jobChains = [];
            var obj = {};
            obj.jobschedulerId = schedulerIds;
            obj.compact = true;
            if (selectedFiltered) {
                obj.regex = selectedFiltered.regex;
            }

            var res = jobchain.path.split(jobchain.name);
            res[0] = res[0].substring(0, res[0].length - 1);
            //console.info("res[0]"+res[0]);
            obj.folders = [
                {folder: res[0], recursive: false}
            ];

            // vm.allJobChains = [];
            JobChainService.getJobChainsP(obj).then(function (result) {
                data.jobChains = result.jobChains;
                volatileFolderDataForAddOrder(data, obj);
                //  $timeout.cancel(timeout);
                pollForJobChains(schedulerIds, jobchain);


            }, function (err) {
                vm.loading = false;
                volatileFolderData(data, obj);
            });

        }


        var timeout = undefined;

        function pollForJobChains(schedulerIds, jobchain) {

            $timeout.cancel(timeout);

            if (vm.getJobchainOnAddOrder) {
                timeout = $timeout(function () {
                    getJobChain(schedulerIds, jobchain);
                }, vm.jobChainPollingInterval);
                vm.getJobchainOnAddOrder = false;
            }
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

            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/add-order-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                addOrder(vm.order, vm.paramObject);
            }, function () {

            });
            vm.object.jobChains = [];
        };
        vm.stopJob = function (jobChain) {
            var jobChains = {};
            jobChains.jobChains = [];
            jobChains.jobschedulerId = vm.schedulerIds.selected;
            jobChains.jobChains.push({jobChain: jobChain.path});
            JobChainService.stop(jobChains).then(function (res) {
                jobChains.compact = true;
                JobChainService.get(jobChains).then(function (res) {
                    jobChain = angular.merge(jobChain, res.jobChains[0]);
                });
            }, function (err) {

            });
            vm.object.jobChains = [];
        };
        vm.unstopJob = function (jobChain) {
            var jobChains = {};
            jobChains.jobChains = [];
            jobChains.jobschedulerId = vm.schedulerIds.selected;
            jobChains.jobChains.push({jobChain: jobChain.path});
            JobChainService.unstop(jobChains).then(function (res) {
                jobChains.compact = true;
                JobChainService.get(jobChains).then(function (res) {
                    jobChain = angular.merge(jobChain, res.jobChains[0]);
                }, function (err) {

                });
            }, function (err) {

            });
            vm.object.jobChains = [];
        };
        vm.stopAll = function () {
            var jobChains = {};
            jobChains.jobChains = [];
            jobChains.jobschedulerId = vm.schedulerIds.selected;

            angular.forEach(vm.object.jobChains, function (value) {
                jobChains.jobChains.push({jobChain: value.path});
            });
            JobChainService.stop(jobChains).then(function (res) {
                jobChains.compact = true;
                JobChainService.get(jobChains).then(function (res) {
                    angular.forEach(res.jobChains, function (jobChainData) {
                        angular.forEach(vm.object.jobChains, function (jobChain) {
                            if (jobChain.path == jobChainData.path) {
                                jobChain = angular.merge(jobChain, jobChainData);
                            }
                        });
                    });
                    vm.object.jobChains = [];
                }, function (err) {

                });
            }, function (err) {

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
                jobChains.compact = true;
                JobChainService.get(jobChains).then(function (res) {
                    angular.forEach(res.jobChains, function (jobChainData) {
                        angular.forEach(vm.object.jobChains, function (jobChain) {
                            if (jobChain.path == jobChainData.path) {
                                jobChain = angular.merge(jobChain, jobChainData);
                            }
                        });
                    });
                    vm.object.jobChains = [];
                }, function (err) {

                });
            }, function (err) {

            });
        };

        vm.reset = function () {
            vm.object.jobChains = [];
        };

        vm.exportToExcel = function () {
            $('#exportToExcelBtn').attr("disabled", true);
            $('#jobChainTableId').table2excel({
                exclude: ".noExl",
                filename: "jobscheduler-jobchain",
                fileext: ".xlsx",
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
            vm.reverse = !vm.reverse;
            vm.propertyName = propertyName;
            vm.filter.sortBy = propertyName;
            vm.allJobChains = orderBy(vm.allJobChains, vm.propertyName, vm.reverse);
        };

        vm.applyFilter = function () {
            vm.jobChainFilter = {};
            vm.isUnique = true;
            var modalInstance = $uibModal.open({
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
                    isFilterChange = true;
                    vm.load();
                }
                SavedFilter.setJobChain(vm.savedJobChainFilter);
                SavedFilter.save();

            }, function () {

            });
        };

        vm.editFilters = function () {
            vm.filters = vm.savedJobChainFilter;
            var modalInstance = $uibModal.open({
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
            var modalInstance = $uibModal.open({
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
                    isFilterChange = true;
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

        vm.deleteFilter = function () {
            angular.forEach(vm.savedJobChainFilter.list, function (value, index) {
                if (value.name == vm.jobChainFilter.name) {
                    toasty.success({
                        title: value.name + ' ' + gettextCatalog.getString('message.filterDeleteSuccessfully'),
                        msg: ''
                    });
                    vm.savedJobChainFilter.list.splice(index, 1);
                }
            });
            if (vm.savedJobChainFilter.list.length == 0) {
                vm.savedJobChainFilter = {};
                selectedFiltered = undefined;
            } else if (vm.savedJobChainFilter.selected == vm.jobChainFilter.name) {
                vm.savedJobChainFilter.selected = undefined;
                selectedFiltered = undefined;
                isFilterChange = true;
                vm.load();
            }
            SavedFilter.setJobChain(vm.savedJobChainFilter);
            SavedFilter.save();

        };

        vm.favorite = function (filter) {
            vm.savedJobChainFilter.favorite = filter.name;
            vm.savedJobChainFilter.selected = filter.name;
            selectedFiltered = filter;
            SavedFilter.setJobChain(vm.savedJobChainFilter);
            SavedFilter.save();
            isFilterChange = true;
            vm.load();
        };


        vm.getTreeStructure = function () {
            if (vm.filterTree) {
                vm.filterTree1 = angular.copy(vm.filterTree);
            }
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
            selectedFiltered = filter;
            SavedFilter.setJobChain(vm.savedJobChainFilter);
            SavedFilter.save();
            isFilterChange = true;
            vm.load();
        };


        startPolling();

        function startPolling() {
            if ($rootScope.config.jobChains.polling == 'true') {
                poll();
            }
        }

        var interval;

        function poll() {
            interval = $interval(function () {

                if (vm.pageView == 'list') {
                    var obj = {};
                    obj.jobschedulerId = vm.schedulerIds.selected;
                    obj.compact = true;
                    if (selectedFiltered) {
                        obj.regex = selectedFiltered.regex;
                        obj.folders = [];
                        angular.forEach(selectedFiltered.paths, function (res) {
                            obj.folders.push({folder: res, recursive: false});
                        });
                    }
                    obj.states = vm.filter.state;
                    volatileInformation(obj);
                } else {
                    filteredVolatileTreeData();
                }
            }, $rootScope.config.jobChains.interval * 1000)

        }


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

        function showOrders(jobChain) {

            var filter = {};
            filter.orders = [];
            filter.compact = true;
            filter.orders.push({jobChain: jobChain.path});
            filter.jobschedulerId = vm.schedulerIds.selected;
            OrderService.get(filter).then(function (res) {
                vm.shouldPollForOrders = false;
                res.orders = orderBy(res.orders, '+processingState._text', false, function (v1, v2) {
                    if (v1.value == 'RUNNING') {
                        return -1;
                    } else if (v1.value > v2.value) {
                        return -1;
                    }
                    return 1;
                });

                vm.orders = res.orders;

                var current = false;
                angular.forEach(jobChain.nodes, function (node) {
                    node.orders = [];
                    current = false
                    angular.forEach(vm.orders, function (order) {
                        if (order.startedAt) {
                            vm.shouldPollForOrders = true;
                        }
                        if (order.state == node.name) {
                            if (order.startedAt) {
                                node.job.state.severity = 0;
                                node.job.state._text = 'RUNNING';
                                current = true;
                            }

                            node.orders.push(order);

                        }
                    })
                    if (!current && node.job.state.severity == 0) {
                        $timeout(function () {
                            node.job.state.severity = 1;
                            node.job.state._text = 'PENDING';
                        }, 10);
                    }
                });
            });
        }
        vm.showNodePanel = '';
        vm.showNodePanelFuc = function (jobChain) {
            JobChainService.getJobChain({
                jobschedulerId: vm.schedulerIds.selected,
                jobChain: jobChain.path
            }).then(function (res) {
                vm.showNodePanel = res.jobChain;
                showOrders(res.jobChain);
            });

            vm.hideNodePanel = true;
        };
        vm.hideNodePanelFuc = function () {
            vm.showNodePanel = '';
            vm.hideNodePanel = !vm.hideNodePanel;
        };

        vm.showOrderPanel = '';
        vm.showOrderPanelFuc = function (value) {
            vm.showOrderPanel = value;
            vm.hideOrderPanel = true;
        };
        vm.hideOrderPanelFuc = function () {
            vm.showOrderPanel = '';
            vm.hideOrderPanel = !vm.hideOrderPanel;
        };


        vm.stopNode = function (data) {

            var nodes = {};
            nodes.nodes = [];
            nodes.jobschedulerId = $scope.schedulerIds.selected;
            nodes.nodes.push({jobChain: vm.jobChain.path, node: data.name});

            JobService.stopNode(nodes).then(function (res) {
                vm.getJobChainData();
            }, function (err) {

            });
        };

        vm.unStopNode = function (data) {

            var nodes = {};
            nodes.nodes = [];
            nodes.jobschedulerId = $scope.schedulerIds.selected;
            nodes.nodes.push({jobChain: vm.jobChain.path, node: data.name});

            JobService.activateNode(nodes).then(function (res) {
                vm.getJobChainData();
            }, function (err) {

            });
        };

        vm.skipNode = function (data) {

            var nodes = {};
            nodes.nodes = [];
            nodes.jobschedulerId = $scope.schedulerIds.selected;
            nodes.nodes.push({jobChain: vm.jobChain.path, node: data.name});

            JobService.skipNode(nodes).then(function (res) {
                vm.getJobChainData();
            }, function (err) {

            });
        };

        vm.unskipNode = function (data) {

            var nodes = {};
            nodes.nodes = [];
            nodes.jobschedulerId = $scope.schedulerIds.selected;
            nodes.nodes.push({jobChain: vm.jobChain.path, node: data.name});

            JobService.activateNode(nodes).then(function (res) {
                vm.getJobChainData();
            }, function (err) {

            });
        };

        vm.stopJob = function (data) {

            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = $scope.schedulerIds.selected;
            jobs.jobs.push({job: data.job.path});

            JobService.stop(jobs).then(function (res) {
                jobs.compact = true;
                JobService.get(jobs).then(function (res) {
                    angular.forEach(res.jobs, function (jobsData) {
                        if (data.job.path == jobsData.path) {
                            data.job = angular.merge(data.job, jobsData);
                        }
                    });
                }, function (err) {

                });
            }, function (err) {

            });
        };

        vm.unstopJob = function (data) {

            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = $scope.schedulerIds.selected;
            jobs.jobs.push({job: data.job.path});
            JobService.unstop(jobs).then(function (res) {
                jobs.compact = true;
                JobService.get(jobs).then(function (res) {
                    angular.forEach(res.jobs, function (jobsData) {
                        if (data.job.path == jobsData.path) {
                            data.job = angular.merge(data.job, jobsData);
                        }
                    });
                }, function (err) {

                });
            }, function (err) {

            });
        };


        $scope.$on('$destroy', function () {
            //  watcher();
            watcher1();
            watcher2();
            watcher3();
            watcher4();
            if (interval)
                $interval.cancel(interval);
        });
    }

    JobCtrl.$inject = ["$scope", "$rootScope", "JobService", "$uibModal", "orderByFilter", "SavedFilter", "TaskService", "toasty", "ScheduleService",
        "gettextCatalog", "FileSaver", "Blob", "$state", "$interval"];
    function JobCtrl($scope, $rootScope, JobService, $uibModal, orderBy, SavedFilter, TaskService, toasty, ScheduleService,
                     gettextCatalog, FileSaver, Blob, $state, $interval) {
        var vm = $scope;
        vm.filter = {};
        vm.filter.state = "ALL";
        vm.filter.sortBy = "name";
        vm.object = {};

        vm.pageSize = 10;
        vm.currentPage = 1;
        vm.tree = [];
        vm.allJobs = [];
        vm.my_tree = {};

        vm.filter_tree = {};
        vm.filterTree1 = [];
        vm.object.paths = [];
        var selectedFiltered, isFilterChange = true;

        vm.expanding_property = {
            field: "name"
        };

        vm.savedJobFilter = JSON.parse(SavedFilter.jobFilters) || {};
        vm.savedJobFilter.list = vm.savedJobFilter.list || [];
        vm.savedJobFilter.selected = vm.savedJobFilter.favorite;

        if (vm.savedJobFilter.selected) {
            angular.forEach(vm.savedJobFilter.list, function (value) {
                if (value.name == vm.savedJobFilter.selected) {
                    selectedFiltered = value;
                }
            });
        }

        vm.exportToExcel = function () {
            $('#exportToExcelBtn').attr("disabled", true);

            $('#jobTableId').table2excel({
                exclude: ".noExl",
                filename: "jobscheduler-job",
                fileext: ".xlsx",
                exclude_img: false,
                exclude_links: false,
                exclude_inputs: false
            });

            $('#exportToExcelBtn').attr("disabled", false);

        };


        /**
         * Filter tree data based on select folders
         */
        function filterTreeData() {
            if (selectedFiltered && selectedFiltered.paths && selectedFiltered.paths.length > 0) {
                var data = [];
                angular.forEach(vm.filterTree, function (res) {
                    var flag = false;
                    if (selectedFiltered.paths && selectedFiltered.paths.length > 0) {
                        for (var i = 0; i < selectedFiltered.paths.length; i++) {
                            if (selectedFiltered.paths[i] == res.path) {
                                flag = true;
                                break;
                            } else {
                                if (res.path.indexOf(selectedFiltered.paths[i]) !== -1 || selectedFiltered.paths[i].indexOf(res.path) !== -1) {
                                    flag = true;
                                    break;
                                }
                            }
                        }
                    }

                    if (flag)
                        data.push(res);
                });
                vm.tree = data;
            } else {
                if (isFilterChange)
                    vm.tree = angular.copy(vm.filterTree);
            }
            filteredTreeData();
            isFilterChange = false;
        }

        /**
         * Function to initialized tree view
         */
        function initTree() {
            JobService.tree({
                jobschedulerId: vm.schedulerIds.selected,
                compact: true,
                types: ['JOB']
            }).then(function (res) {
                vm.filterTree = res.folders;
                isFilterChange = true;
                filterTreeData();
                vm.isLoading = true;
            }, function (err) {
                vm.isLoading = true;
            });
        }

        initTree();

        /**
         * Expand all tree data
         */
        vm.expandAll = function () {
            vm.branchs = [];
            vm.allJobs = [];
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.compact = true;
            if (selectedFiltered) {
                obj.regex = selectedFiltered.regex;
                obj.folders = [];
                angular.forEach(selectedFiltered.paths, function (res) {
                    obj.folders.push({folder: res, recursive: false});
                });
            }

            JobService.getJobsP(obj).then(function (result) {
                vm.jobs = result.jobs;

                    startTraverseTree();

                volatileInformation(obj, true);
            }, function () {
                volatileInformation(obj, true);
                vm.isError = true;
            });
        };

        function startTraverseTree() {
            vm.branchs = [];
            vm.allJobs = [];
            angular.forEach(vm.tree, function (value) {
                traverseTree(value);
            });
        }

        function traverseTree(data) {
            data.jobs = [];

            angular.forEach(vm.jobs, function (value) {
                if (data.path == value.path.substring(0, value.path.lastIndexOf('/')) || data.path == value.path.substring(0, value.path.lastIndexOf('/') + 1)) {
                    data.jobs.push(value);
                    vm.allJobs.push(value);
                }
            });
            if (data.jobs.length > 0) {
                vm.branchs.push(data);
            }
                vm.folderPath = data.name;


            if (data.folders.length > 0) {
                data.folders = orderBy(data.folders, 'name');
                angular.forEach(data.folders, function (value) {
                    traverseTree(value);
                });
            }
        }
        vm.expandNode = function (data) {
            vm.branchs = [];
            vm.allJobs = [];
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
                startTraverseNode(data);
                volatileInformation(obj, true, data);
            }, function () {
                volatileInformation(obj, true, data);
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
            vm.branchs = [];
            vm.allJobs = [];
            function recursive(data) {
                data.expanded = !0;
                data.folders = orderBy(data.folders, 'name');

                data.jobs = [];
                angular.forEach(vm.jobs, function (value) {
                    if (data.path == value.path.substring(0, value.path.lastIndexOf('/'))  || data.path == value.path.substring(0, value.path.lastIndexOf('/') + 1)) {
                        data.jobs.push(value);
                        vm.allJobs.push(value);
                    }
                });

                if (data.jobs.length > 0) {
                    vm.branchs.push(data);
                }
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
                startTraverseTree();
                volatileFolderData(data, obj);
            }, function (err) {
                volatileFolderData(data, obj);
            });
        }

        function volatileFolderData(data1, obj) {
            if (vm.filter.state != 'ALL') {
                obj.processingState = [];
                obj.processingState.push(vm.filter.state);
            }
            if (selectedFiltered)
                obj = parseDate(obj);

            JobService.get(obj).then(function (res) {
                var data = [];
                if (data1.jobs && data1.jobs.length > 0) {
                    angular.forEach(data1.jobs, function (jobs) {
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
                    data1.jobs = data;
                } else {
                    data1.jobs = res.jobs;
                }
                if (data1.jobs.length > 0) {
                    vm.branchs.push(data1);
                }
                vm.folderPath = data1.name;

                angular.forEach(data1.jobs, function (data) {
                    vm.allJobs.push(data);
                })
            }, function () {
                if (data1.jobs.length > 0) {
                    vm.branchs.push(data1);
                }
                vm.folderPath = data1.name;

                angular.forEach(data1.jobs, function (data) {
                    vm.allJobs.push(data);
                })
            });
        }

        vm.treeHandler1 = function (data) {
            if(data.expanded) {
                data.folders = orderBy(data.folders, 'name');

                data.jobs = [];
                vm.branchs = [];
                vm.allJobs = [];
                expandFolderData(data);
            }
        };

        vm.treeHandler = function (data) {
            data.expanded = !data.expanded;
            if (data.expanded) {
                data.folders = orderBy(data.folders, 'name');
                if (!data.jobs || data.jobs.length == 0)
                    expandFolderData(data);
                vm.branchs = [];
                vm.allJobs = [];
                vm.branchs.push(data);
                angular.forEach(data.jobs, function (a) {
                    vm.allJobs.push(a);
                })
            }
        };

        function checkExpand(data) {
            data.jobs = [];
            expandFolderData(data);
            if (data.jobs.length > 0) {
                vm.branchs.push(data);
            }
            vm.folderPath = data.name;

            angular.forEach(data.jobs, function (a) {
                vm.allJobs.push(a);
            });
            data.folders = orderBy(data.folders, 'name');
            angular.forEach(data.folders, function (value) {

                if (value.expanded)
                    checkExpand(value);
            });

        }

        function filteredTreeData() {
            angular.forEach(vm.tree, function (value) {
                value.expanded = true;
                if (value.expanded) {
                    vm.branchs = [];
                    vm.allJobs = [];
                    checkExpand(value);
                }
            });
        }

        function checkExpandTreeForUpdates(data) {

            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.compact = true;

            if (selectedFiltered) {
                obj.regex = selectedFiltered.regex;
            }
            obj.folders = [{folder: data.path, recursive: false}];

            if (data.jobs.length > 0)
                volatileFolderData(data, obj);

            angular.forEach(data.folders, function (value) {
                if (value.expanded)
                    checkExpandTreeForUpdates(value);
            });
        }

        function filteredVolatileTreeData() {
            angular.forEach(vm.tree, function (value) {
                if (value.expanded)
                    checkExpandTreeForUpdates(value);
            });
        }

        function parseDate(obj) {
            var fromDate;
            var toDate;

            if (selectedFiltered.state) {
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

        function volatileInformation(obj, flag,expandNode) {
            if (vm.filter.state != 'ALL') {
                obj.states = [];
                obj.states.push(vm.filter.state);
            }
            if (selectedFiltered)
                obj = parseDate(obj);
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
                if (flag && !expandNode) {
                    startTraverseTree();
                }
                if(expandNode){
                    startTraverseNode(expandNode);
                }
            }, function () {
                if (flag && !expandNode) {
                    startTraverseTree();
                }
                if(expandNode){
                    startTraverseNode(expandNode);
                }
            });
        }


        vm.load = function () {
            if (vm.filterTree.length == 0)
                initTree();
            else
                filterTreeData();
        };

        vm.getQueueOrders = function (job) {
            JobService.getQueueOrders(job).then(function (res) {

            }, function (err) {

            });
        };

        /**--------------- Checkbox functions -------------*/
        vm.allCheck = {
            checkbox: false
        };

        var watcher1 = $scope.$watchCollection('object.jobs', function (newNames) {
            if (newNames && newNames.length > 0) {
                vm.allCheck.checkbox = newNames.length == vm.allJobs.slice((vm.pageSize * (vm.currentPage - 1)), (vm.pageSize * vm.currentPage)).length;

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
                vm.allCheck.checkbox = false;
            }
        });
        var watcher2 = $scope.$watchCollection('filtered', function (newNames) {
            if (newNames)
                vm.object.jobs = [];
        });

        var watcher3 = $scope.$watch('pageSize', function (newNames) {
            if (newNames)
                vm.object.jobs = [];
        });
        vm.checkAll = function () {
            if (vm.allCheck.checkbox && vm.allJobs.length > 0) {
                vm.object.jobs = vm.allJobs.slice((vm.pageSize * (vm.currentPage - 1)), (vm.pageSize * vm.currentPage));
            } else {
                vm.object.jobs = [];
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
            vm.object.jobs = [];
        };

        vm.sortBy = function (propertyName) {
            vm.object.jobs = [];
            vm.reverse = !vm.reverse;
            vm.propertyName = propertyName;
             vm.filter.sortBy = propertyName;
            vm.allJobs = orderBy(vm.allJobs, vm.propertyName, vm.reverse);
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
                vm.savedJobFilter.selected = vm.jobFilter.name;
                if (vm.savedJobFilter.list.length == 1) {
                    vm.savedJobFilter.favorite = vm.jobFilter.name;
                }
                SavedFilter.setJob(vm.savedJobFilter);
                SavedFilter.save();
                isFilterChange = true;
                vm.load();
            }, function () {

            });
        };

        vm.editFilters = function () {
            vm.filters = vm.savedJobFilter;
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/edit-filter-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                backdrop: 'static'
            });
            modalInstance.result.then(function () {

            }, function () {

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
                    isFilterChange = true;
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

        vm.deleteFilter = function () {
            angular.forEach(vm.savedJobFilter.list, function (value, index) {
                if (value.name == vm.jobFilter.name) {
                    toasty.success({
                        title: value.name + ' ' + gettextCatalog.getString('message.filterDeleteSuccessfully'),
                        msg: ''
                    });
                    vm.savedJobFilter.list.splice(index, 1);
                }
            });
            if (vm.savedJobFilter.list.length == 0) {
                vm.savedJobFilter = {};
            } else if (vm.savedJobFilter.selected == vm.jobFilter.name) {
                vm.savedJobFilter.selected = undefined;
            }
            SavedFilter.setJob(vm.savedJobFilter);
            SavedFilter.save();
            isFilterChange = true;
            vm.load();
        };

        vm.favorite = function (filter) {
            vm.savedJobFilter.favorite = filter;
            vm.savedJobFilter.selected = filter;
            SavedFilter.setJob(vm.savedJobFilter);
            SavedFilter.save();
            isFilterChange = true;
            vm.load();
        };


        vm.getTreeStructure = function () {
            if (vm.filterTree) {
                vm.filterTree1 = angular.copy(vm.filterTree);
            }
            $('#treeModal').modal('show');
        };

        vm.treeExpand = function (data) {
            data.folders = orderBy(data.folders, 'name');
            angular.forEach(vm.object.paths, function (value) {
                if (data.path == value) {
                    if (data.folders.length > 0) {
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
            selectedFiltered = filter;

            SavedFilter.setJob(vm.savedJobFilter);
            SavedFilter.save();
            isFilterChange = true;
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
            jobs.jobs = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            jobs.jobs.push({job: value.path});
            TaskService.histories(jobs).then(function (res) {
                vm.taskHistory = res.history;
                vm.isLoading1 = true;
            }, function () {
                vm.isLoading1 = true;
            });

            JobService.getJobsP(jobs).then(function (res) {
                JobService.get(jobs).then(function (result) {
                    if(res.jobs.length>0 && result.jobs.length>0)
                      vm.showTaskPanel = angular.merge(res.jobs[0], result.jobs[0]);
                    else if(res.jobs.length==0 && result.jobs.length!= 0)
                      vm.showTaskPanel = result.jobs[0];
                    else
                       vm.showTaskPanel = res.jobs[0];
                }, function (err) {

                });
            });
            vm.isRunning = isRunning;

        };


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
                jobs.compact = true;
                JobService.get(jobs).then(function (res) {
                    job = angular.merge(job, res.jobs[0]);
                }, function (err) {

                });
            }, function (err) {

            });
            vm.object.jobs = [];
        };
        vm.unstop = function (job) {
            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            jobs.jobs.push({job: job.path});
            JobService.unstop(jobs).then(function (res) {
                jobs.compact = true;
                JobService.get(jobs).then(function (res) {
                    job = angular.merge(job, res.jobs[0]);
                }, function (err) {

                });
            }, function (err) {

            });
            vm.object.jobs = [];
        };
        vm.start = function (job) {
            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            jobs.jobs.push({job: job.path});
            JobService.start(jobs).then(function (res) {
                jobs.compact = true;
                JobService.get(jobs).then(function (res) {
                    job = angular.merge(job, res.jobs[0]);
                }, function (err) {

                });
            }, function (err) {

            });
            vm.object.jobs = [];
        };
        function startAt(job) {
            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            jobs.jobs.push({job: job.path});
            jobs.at = 'now +10';
            jobs.params = [];
            JobService.start(jobs).then(function (res) {
                jobs.compact = true;
                JobService.get(jobs).then(function (res) {
                    job = angular.merge(job, res.jobs[0]);
                }, function (err) {

                });
            }, function (err) {

            });
        }

        vm.startAt = function (job) {
            vm.job = job;
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

            });
            vm.object.jobs = [];
        };

        vm.stopAll = function () {
            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            angular.forEach(vm.object.jobs, function (value) {
                jobs.jobs.push({job: value.path});
            });
            JobService.stop(jobs).then(function (res) {
                jobs.compact = true;
                JobService.get(jobs).then(function (res) {
                    angular.forEach(res.jobs, function (jobData) {
                        angular.forEach(vm.object.jobs, function (job) {
                            if (job.path == jobData.path) {
                                job = angular.merge(job, jobData);
                            }
                        });
                    });
                    vm.object.jobs = [];
                }, function (err) {

                });
            }, function (err) {

            });
        };
        vm.unStopAll = function () {
            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            angular.forEach(vm.object.jobs, function (value) {
                jobs.jobs.push({job: value.path});
            });
            JobService.unstop(jobs).then(function (res) {
                jobs.compact = true;
                JobService.get(jobs).then(function (res) {
                    angular.forEach(res.jobs, function (jobData) {
                        angular.forEach(vm.object.jobs, function (job) {
                            if (job.path == jobData.path) {
                                job = angular.merge(job, jobData);
                            }
                        });
                    });
                    vm.object.jobs = [];
                }, function (err) {

                });
            }, function (err) {

            });
        };
        vm.startAll = function () {
            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            angular.forEach(vm.object.jobs, function (value) {
                jobs.jobs.push({job: value.path});
            });
            JobService.start(jobs).then(function (res) {
                jobs.compact = true;
                JobService.get(jobs).then(function (res) {
                    angular.forEach(res.jobs, function (jobData) {
                        angular.forEach(vm.object.jobs, function (job) {
                            if (job.path == jobData.path) {
                                job = angular.merge(job, jobData);
                            }
                        });
                    });
                    vm.object.jobs = [];
                }, function (err) {

                });
            }, function (err) {

            });
        };

        vm.reset = function () {
            vm.object.jobs = [];
        };


        vm.end = function (task) {

            TaskService.end({taskId: task.taskId, jobschedulerId: vm.schedulerIds.selected}).then(function (res) {

            }, function (err) {

            });
        };
        vm.killTask = function (task) {
            TaskService.kill({taskId: task.taskId, jobschedulerId: vm.schedulerIds.selected}).then(function (res) {

            }, function (err) {

            });
        };
        vm.terminateTask = function (task) {
            TaskService.terminate({taskId: task.taskId, jobschedulerId: vm.schedulerIds.selected}).then(function (res) {

            }, function (err) {

            });
        };
        vm.terminateTaskWithTimeout = function (task) {
            TaskService.terminateWith(task.taskId, {
                jobschedulerId: vm.schedulerIds.selected,
                timeout: timeout
            }).then(function (res) {

            }, function (err) {

            });
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
        };


        function setRunTime(job) {
            var jobs = {};
            jobs.jobs = [];
            jobs.jobs.push({job: job.path, runtime: job.runTime});
            jobs.jobschedulerId = vm.schedulerIds.selected;
            JobService.setRunTime(jobs).then(function (res) {
                jobs.compact = true;
                JobService.get(jobs).then(function (res) {
                    job = angular.merge(job, res.jobs[0]);
                }, function (err) {

                });
            }, function (err) {

            });
            vm.object.jobs = [];
        }

        vm.setRunTime = function (job) {
            vm.order = job;
            JobService.getRunTime({
                jobschedulerId: vm.schedulerIds.selected,
                job: job.path
            }).then(function (res) {
                if (res.runTime) {
                    vm.runTimes = res.runTime;
                    vm.runTimes.content = vm.runTimes.content.replace(/&lt;/g, '<');
                    vm.runTimes.content = vm.runTimes.content.replace(/&gt;/g, '>');
                    vm.xml = vm.runTimes.content;
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
                vm.object.jobs = [];
            });


            ScheduleService.getSchedulesP({
                jobschedulerId: vm.schedulerIds.selected,
                compact: true
            }).then(function (res) {
                vm.schedules = res.schedules;
            });

            vm.zones = moment.tz.names();
        };


        vm.downloadLog = function () {
            var data = new Blob([vm.logs], {type: 'text/plain;charset=utf-8'});
            FileSaver.saveAs(data, 'job.log');
        };


        startPolling();

        function startPolling() {
            if ($rootScope.config.jobs.polling == 'true') {
                poll();
            }
        }

        var interval;


        function poll() {
            interval = $interval(function () {

                if (vm.pageView == 'list') {
                    var obj = {};
                    obj.jobschedulerId = vm.schedulerIds.selected;
                    obj.compact = true;
                    if (selectedFiltered) {
                        obj.regex = selectedFiltered.regex;
                        obj.folders = [];
                        angular.forEach(selectedFiltered.paths, function (res) {
                            obj.folders.push({folder: res, recursive: false});
                        });
                    }
                    obj.states = vm.filter.state;
                    volatileInformation(obj);
                } else {
                    filteredVolatileTreeData();
                }
            }, $rootScope.config.jobs.interval * 1000)

        }

        $scope.$on('$destroy', function () {
            watcher1();
            watcher2();
            watcher3();
            watcher4();
            if (interval)
                $interval.cancel(interval);

        });

        vm.viewAllHistories = function () {
            $state.go('app.history');
            JobService.jobSelected = vm.showTaskPanel.path;
        }

    }


})();
