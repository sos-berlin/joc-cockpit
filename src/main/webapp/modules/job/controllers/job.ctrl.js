/**
 * Created by sourabhagrawal on 31/05/16.
 */
(function () {
    'use strict';
    angular
        .module('app')
        .controller('JobChainCtrl', JobChainCtrl)
        .controller('JobCtrl', JobCtrl);

    JobChainCtrl.$inject = ["$scope", "JobChainService", "OrderService", "$location", "SOSAuth", "$uibModal", "orderByFilter", "ScheduleService", "SavedFilter",
        "toasty", "gettextCatalog", "DailyPlanService", "$interval", "$rootScope"];
    function JobChainCtrl($scope, JobChainService, OrderService, $location, SOSAuth, $uibModal, orderBy, ScheduleService, SavedFilter,
                          toasty, gettextCatalog, DailyPlanService, $interval, $rootScope) {
        var vm = $scope;
        vm.filter = {};
        vm.filter.state = "ALL";
        vm.filter.sortBy = "name";

        vm.object = {};

        vm.pageSize = 10;
        vm.currentPage = 1;
        vm.tree = [];
        vm.my_tree = {};
        vm.branchs = [];
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
        var watcher = $scope.$watch('pageView', function (newName) {
            if (newName) {
                vm.pageView = newName;
                if (vm.pageView == 'list') {
                    if (!vm.jobChains || isFilterChange)
                        vm.init();
                }
                else {

                    if (!vm.filterTree)
                        initTree();
                    else
                    if(isFilterChange)
                        filterTreeData();
                }
            }
        });

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
                if(isFilterChange)
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

                if (res.folders.length > 1) {
                    vm.filterTree = res.folders;
                } else {
                    vm.filterTree = res.folders[0].folders;
                }
                vm.filterTree = orderBy(vm.filterTree, 'name');
                filterTreeData();
                vm.isLoading = true;
            });
        }

        /**
         * Expand all tree data
         */
        vm.expandAll = function () {
            vm.branchs = [];
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.compact = true;
            if (selectedFiltered) {
                obj.regex = selectedFiltered.regex;
                obj.folders = [];
                angular.forEach(selectedFiltered.paths, function (res) {
                    obj.folders.push({folder: res});
                });
            }

            JobChainService.getJobChainsP(obj).then(function (result) {
                vm.jobChains = result.jobChains;

                volatileInformation(obj, true);
            }, function () {
                vm.isError = true;
            });

        };
            function startTraverseTree() {
                vm.branchs = [];
                angular.forEach(vm.tree, function (value) {
                    traverseTree(value);
                });
            }
        function traverseTree(data) {
            data.jobChains = [];
            data.folders = orderBy(data.folders, 'name');
            angular.forEach(vm.jobChains, function (value) {

                if (data.path == value.path.substring(0, value.path.lastIndexOf('/'))) {
                    data.jobChains.push(value);
                }
            });

            if (data.jobChains.length > 0) {
                vm.branchs.push(data);
            }
            if (data.folders.length > 0) {
                angular.forEach(data.folders, function (value) {
                    traverseTree(value);
                });
            }
        }

        function expandFolderData(data) {
            vm.loading = true;
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.compact = true;
            if (selectedFiltered) {
                obj.regex = selectedFiltered.regex;
            }
            obj.folders = [{folder: data.path}];
            JobChainService.getJobChainsP(obj).then(function (result) {
                data.jobChains = result.jobChains;
                vm.loading = false;
                volatileFolderData(data, obj);
            });
        }

        function volatileFolderData(data, obj) {

            if (vm.filter.state != 'ALL') {
                obj.state = [];
                obj.state.push(vm.filter.state);
            }
            if (selectedFiltered && selectedFiltered.state) {
                obj.state = selectedFiltered.state;
            }
            JobChainService.get(obj).then(function (res) {
                var object = angular.merge(res.jobChains, data.jobChains);
                var temp = [];
                angular.forEach(object, function (value) {
                    if (data.path == value.path.substring(0, value.path.lastIndexOf('/'))) {
                        temp.push(value);
                    }
                });
                object = temp;
                vm.loading = false;
                if (selectedFiltered) {
                    var x = [];
                    angular.forEach(object, function (res) {
                        var flag = true;
                        if (flag && selectedFiltered.agentName && res.processClass) {
                            if (!res.processClass.match(selectedFiltered.agentName)) {
                                flag = false;
                            }
                        }

                        if (flag)
                            x.push(res);
                    });
                    data.jobChains = x;
                } else {
                    data.jobChains = object;
                }
                 data.jobChains = orderBy(data.jobChains, vm.filter.sortBy);
                if (data.jobChains.length > 0) {
                     vm.branchs = [];
                     vm.branchs.push(data);
                }
            });
        }


        vm.treeHandler1 = function (data) {
            data.folders = orderBy(data.folders, 'name');
            if (data.expanded) {
                data.jobChains = [];
                expandFolderData(data);
            }
        };

        vm.treeHandler = function (data) {
            if (data.expanded) {
                vm.branchs = [];
                vm.branchs.push(data);
            }
        };


        vm.expandNode = function (data) {
            vm.branchs = [];
            function recursive(data) {
                data.expanded = !0;
                data.folders = orderBy(data.folders, 'name');

                data.jobChains = [];
                expandFolderData(data);

                angular.forEach(data.folders, function (a) {
                    a.expanded = !0;

                    a.jobChains = [];
                    expandFolderData(a);

                    if (a.folders.length > 0) {
                        angular.forEach(a.folders, function (value) {
                            recursive(value);
                        });
                    }
                });
            }

            recursive(data);
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


        function checkExpand(data) {
            data.jobChains = [];
            expandFolderData(data);
            if (data.jobChains.length > 0) {
                vm.branchs.push(data);
            }
            angular.forEach(data.folders, function (value) {
                if (value.expanded)
                    checkExpand(value);
            });

        }

        function filteredTreeData() {
            vm.branchs = [];
            angular.forEach(vm.tree, function (value) {
                if (value.expanded)
                    checkExpand(value);
            });
        }


        function checkExpandTreeForUpdates(data) {

            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.compact = true;

            if (selectedFiltered) {
                obj.regex = selectedFiltered.regex;
            }
            obj.folders = [{folder: data.path}];

            if (data.jobChains.length > 0)
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

        function mergeJobChainData(object, flag) {

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
            } else {
                vm.jobChains = object;
            }
            if(flag){
                startTraverseTree();
            }
        }

        function volatileInformation(obj, flag) {
            if (vm.filter.state != 'ALL') {
                obj.state = [];
                obj.state.push(vm.filter.state);
            }
            if (selectedFiltered && selectedFiltered.state) {
                obj.state = selectedFiltered.state;
            }
            JobChainService.get(obj).then(function (res) {
                var object = angular.merge(res.jobChains, vm.jobChains);
                mergeJobChainData(res.jobChains, flag);
            });
        }

        /**
         * Function to initialized list view data
         */
        vm.init = function () {
            isFilterChange = false;
            vm.isLoading = false;
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.compact = true;
            if (selectedFiltered) {
                obj.regex = selectedFiltered.regex;
                obj.folders = [];
                angular.forEach(selectedFiltered.paths, function (res) {
                    obj.folders.push({folder: res});
                });
            }

            JobChainService.getJobChainsP(obj).then(function (result) {
                vm.jobChains = result.jobChains;
                vm.isLoading = true;

                volatileInformation(obj);
            }, function () {
                vm.isLoading = true;
                vm.isError = true;
            });
        };

        vm.load = function () {
            if (vm.pageView == 'list')
                vm.init();
            else {
                if (vm.filterTree.length == 0)
                    initTree();
                else
                    filterTreeData();
            }
        };

        /**--------------- Checkbox functions -------------*/
        vm.allCheck = {
            checkbox: false
        };

        var watcher1 = $scope.$watchCollection('object.jobChains', function (newNames) {
            if (newNames && newNames.length > 0) {
                vm.allCheck.checkbox = newNames.length == vm.jobChains.slice((vm.pageSize * (vm.currentPage - 1)), (vm.pageSize * vm.currentPage)).length;
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
            if (vm.allCheck.checkbox) {
                vm.object.jobChains = vm.jobChains.slice((vm.pageSize * (vm.currentPage - 1)), (vm.pageSize * vm.currentPage));
            } else {
                vm.reset();
            }
        };

        /**--------------- Actions -----------------------------*/
        vm.viewOrders = function (jobChain) {
            SOSAuth.setJobChain(JSON.stringify(jobChain));
            SOSAuth.save();
            $location.path('/jobChainDetails/overview').search({path: jobChain.path});
        };

        vm.viewCalendar = function (jobChain) {
            vm._jobChain = jobChain;
            vm.planItems = [];
            DailyPlanService.getPlans().then(function (res) {
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
            modalInstance.result.then(function () {
            }, function () {
            });
        }

        function addOrder(order, paramObject) {

            var orders = {};
            orders.jobschedulerId = vm.schedulerIds.selected;
            orders.orders = [];
            orders.orders.push({jobChain: vm._jobChain.path});
            orders.jobChain = vm._jobChain.path;
            orders.orderId = order.orderId;
            orders.endState = order.endState;
            orders.state = order.state;
            orders.title = order.title;

            if (order.fromDate && order.fromTime) {
                order.fromDate.setHours(order.fromTime.getHours());
                order.fromDate.setMinutes(order.fromTime.getMinutes());
                order.fromDate.setSeconds(order.fromTime.getSeconds());
            }

            if (order.fromDate) {
                orders.at = moment.utc(order.fromDate).format();
            } else {
                orders.at = 'now';
            }

            if (paramObject.length > 0) {
                orders.params = paramObject;
            }
            OrderService.addOrder(orders).then(function (res) {
                toasty.success = {
                    'title': gettextCatalog.getString('message.addOrderSuccessfully')
                }
            }, function (err) {

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
                jobChain.state._text = 'STOPPED';
                jobChain.state.severity = 2;
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
                jobChain.state._text = 'RUNNING';
                jobChain.state.severity = 0;
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
                angular.forEach(vm.object.jobChains, function (jobChain) {
                    jobChain.state._text = 'STOPPED';
                    jobChain.state.severity = 2;
                });
                vm.object.jobChains = [];
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
                angular.forEach(vm.object.jobChains, function (jobChain) {
                    jobChain.state._text = 'RUNNING';
                    jobChain.state.severity = 0;
                });
                vm.object.jobChains = [];
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
            vm.reverse = (propertyName !== null && vm.propertyName === propertyName) ? !vm.reverse : false;
            vm.propertyName = propertyName;
            vm.jobChains = orderBy(vm.jobChains, vm.propertyName, vm.reverse);
        };

        vm.mainSortBy = function (propertyName) {
            vm.reset();
            vm.sortReverse = !vm.sortReverse;
            vm.filter.sortBy = propertyName;
            vm.jobChains = orderBy(vm.jobChains, vm.filter.sortBy, vm.sortReverse);
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
            vm.filterTree1 = angular.copy(vm.filterTree);
            $('#treeModal').modal('show');
        };

        vm.treeExpand = function (data) {
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
            if ($rootScope.config.jobChains.polling) {
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
                            obj.folders.push({folder: res});
                        });
                    }
                    obj.state = vm.filter.state;
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

        $scope.$on('$destroy', function () {
            watcher();
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
        vm.my_tree = {};
        vm.branchs = [];
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

        var watcher = $scope.$watch('pageView', function (newName) {

            if (newName) {
                vm.pageView = newName;
                if (vm.pageView == 'list') {
                    if (!vm.jobs || isFilterChange)
                        vm.init();
                }
                else {
                    if (!vm.filterTree)
                        initTree();
                    else
                    if(isFilterChange)
                        filterTreeData();
                }
            }
        });

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
                if(isFilterChange)
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

                if (res.folders.length > 1) {
                    vm.filterTree = res.folders;
                } else {
                    vm.filterTree = res.folders[0].folders;
                }
                vm.filterTree = orderBy(vm.filterTree, 'name');

                filterTreeData();
                vm.isLoading = true;
            }, function (err) {
                vm.isLoading = true;
            });
        }

          /**
         * Expand all tree data
         */
        vm.expandAll = function () {
            vm.branchs = [];
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.compact = true;
            if (selectedFiltered) {
                obj.regex = selectedFiltered.regex;
                obj.folders = [];
                angular.forEach(selectedFiltered.paths, function (res) {
                    obj.folders.push({folder: res});
                });
            }

            JobService.getJobsP(obj).then(function (result) {
                vm.jobs = result.jobs;

                volatileInformation(obj, true);
            }, function () {
                vm.isError = true;
            });

        };
        function startTraverseTree() {
            vm.branchs = [];
            angular.forEach(vm.tree, function (value) {
                traverseTree(value);
            });
        }
        function traverseTree(data) {
            data.jobs = [];
            data.folders = orderBy(data.folders, 'name');
            angular.forEach(vm.jobs, function (value) {
                if (data.path == value.path.substring(0, value.path.lastIndexOf('/'))) {
                    data.jobs.push(value);
                }
            });
            if (data.jobs.length > 0) {
                vm.branchs.push(data);
            }

            if (data.folders.length > 0) {
                angular.forEach(data.folders, function (value) {
                    traverseTree(value);
                });
            }
        }

        function expandFolderData(data) {
            vm.loading = true;
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.compact = true;
            if (selectedFiltered) {
                obj.regex = selectedFiltered.regex;
            }
            obj.folders = [{folder: data.path}];
            JobService.getJobsP(obj).then(function (result) {
                data.jobs = result.jobs;
                vm.loading = false;
                volatileFolderData(data, obj);
            });
        }

        function volatileFolderData(data, obj) {
             if(vm.filter.state != 'ALL') {
                obj.processingState = [];
                obj.processingState.push(vm.filter.state);
            }
             if (selectedFiltered)
                obj = parseDate(obj);

            JobService.get(obj).then(function (res) {
                var object = angular.merge(res.jobs, data.jobs);
                var temp = [];
                angular.forEach(object, function (value) {
                    if (data.path == value.path.substring(0, value.path.lastIndexOf('/'))) {
                        temp.push(value);
                    }
                });
                object = temp;
                vm.loading = false;

                data.jobs = object;
                data.jobs = orderBy(data.jobs, vm.filter.sortBy);
                if (data.jobs.length > 0) {
                     vm.branchs = [];
                     vm.branchs.push(data);
                }
            });
        }

        vm.treeHandler = function (data) {

            if (data.expanded) {
                vm.branchs = [];
                vm.branchs.push(data);
            }
        };

        vm.treeHandler1 = function (data) {
            data.folders = orderBy(data.folders, 'name');
            if (data.expanded) {
                data.jobs = [];
                expandFolderData(data);
            }

        };

        vm.expandNode = function (data) {
            vm.branchs = [];
            function recursive(data) {
                data.expanded = !0;
                data.folders = orderBy(data.folders, 'name');

                data.jobs = [];
                expandFolderData(data);
                angular.forEach(data.folders, function (a) {
                    a.expanded = !0;

                    a.jobs = [];
                    expandFolderData(data);

                    if (a.folders.length > 0) {
                        angular.forEach(a.folders, function (value) {
                            recursive(value);
                        });
                    }
                });
            }

            recursive(data);
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


        function checkExpand(data) {
            data.jobs = [];
            expandFolderData(data);
            if (data.jobs.length > 0) {
                vm.branchs.push(data);
            }

            angular.forEach(data.folders, function (value) {
                if (value.expanded)
                    checkExpand(value);
            });

        }

        function filteredTreeData() {
            vm.branchs = [];
            angular.forEach(vm.tree, function (value) {
                if (value.expanded)
                    checkExpand(value);
            });
        }
        function checkExpandTreeForUpdates(data) {

            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.compact = true;

            if (selectedFiltered) {
                obj.regex = selectedFiltered.regex;
            }
            obj.folders = [{folder: data.path}];

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
                obj.state = selectedFiltered.state;
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
                obj.dateFrom= fromDate;
                obj.dateTo= toDate;
            }

             return obj;
        }
        function volatileInformation(obj,flag) {
            if (vm.filter.state != 'ALL') {
                obj.state = [];
                obj.state.push(vm.filter.state);
            }
            if (selectedFiltered)
                obj = parseDate(obj);
            JobService.get(obj).then(function (res) {
                vm.jobs = angular.merge(vm.jobs, res.jobs);
                if(flag){
                    startTraverseTree();
                }
            });
        }

        /**
         * Function to initialized list view data
         */
        vm.init = function () {
            isFilterChange = false;
            vm.isLoading = false;
             var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.compact = true;
            if (selectedFiltered) {
                obj.regex = selectedFiltered.regex;
                obj.folders = [];
                angular.forEach(selectedFiltered.paths, function (res) {
                    obj.folders.push({folder: res});
                });
            }
            JobService.getJobsP(obj).then(function (result) {
                vm.jobs = result.jobs;
                volatileInformation(obj);
                vm.isLoading = true;

            }, function () {
                vm.isLoading = true;
                vm.isError = true;
            });
        };


        vm.load = function () {
            if (vm.pageView == 'list')
                vm.init();
            else {
                if (vm.filterTree.length == 0)
                    initTree();
                else
                    filterTreeData();
            }
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
                vm.allCheck.checkbox = newNames.length == vm.jobs.slice((vm.pageSize * (vm.currentPage - 1)), (vm.pageSize * vm.currentPage)).length;

                vm.isOrderJob = false;
                vm.isStopped = false;
                vm.isUnstopped = false;
                angular.forEach(newNames, function (value) {
                    if (value.isOrderJob) {
                        vm.isOrderJob = true;
                    }
                    if (value.state && value.state._text == 'STOPPED') {
                        vm.isStopped = true;
                    } else {
                        vm.isUnstopped = true;
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
            if (vm.allCheck.checkbox) {
                vm.object.jobs = vm.jobs.slice((vm.pageSize * (vm.currentPage - 1)), (vm.pageSize * vm.currentPage));
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
            vm.reverse = (propertyName !== null && vm.propertyName === propertyName) ? !vm.reverse : false;
            vm.propertyName = propertyName;
            vm.jobs = orderBy(vm.jobs, vm.propertyName, vm.reverse);
        };

        vm.mainSortBy = function (propertyName) {
            vm.object.jobs = [];
            vm.sortReverse = !vm.sortReverse;
            vm.filter.sortBy = propertyName;
            vm.jobs = orderBy(vm.jobs, vm.filter.sortBy, vm.sortReverse);
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
            vm.filterTree1 = angular.copy(vm.filterTree);
            $('#treeModal').modal('show');
        };


        vm.treeExpand = function (data) {
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
            TaskService.historys(jobs).then(function (res) {
                vm.taskHistory = res.history;
                vm.taskHistory = vm.taskHistory.splice(0, 10);
                vm.isLoading1 = true;
            }, function () {
                vm.isLoading1 = true;
            });


            vm.isRunning = isRunning;

        };

        vm.taskLog = function () {
            TaskService.log({
                taskId: vm.showTaskPanel.taskId,
                jobschedulerId: vm.schedulerIds.selected
            }).then(function (res) {
                var logs = JSON.parse(JSON.stringify(res));
                logs = logs.data.substring(logs.data.indexOf("plain") + 8);
                logs = logs.substring(0, logs.indexOf("}"));
                logs = logs.replace(/"/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\\n/g, '<br>');
                vm.logs = logs.split('<br>');
            });
        };

        vm.logClass = function (logData) {
            var logStatus = logData.substring(logData.indexOf("[") + 1, logData.indexOf("]"));
            return "log_" + logStatus.toLowerCase();
        };

        vm.showJobChains = function (job) {
            if (job.usedInJobChains > 0) {
                $('#jobChain').modal('show');
                vm.job = job;
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
                job.state._text = 'STOPPED';
                job.state.severity = 2;
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
                job.state._text = 'RUNNING';
                job.state.severity = 0;
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
                job.state._text = 'RUNNING';
                job.state.severity = 0;
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
                angular.forEach(vm.object.jobs, function (job) {
                    job.state._text = 'stopped';
                    job.state.severity = '2';

                });

                vm.object.jobs = [];
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
                angular.forEach(vm.object.jobs, function (job) {
                    job.state._text = 'RUNNING';
                    job.state.severity = '0';

                });
                vm.object.jobs = [];
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
                angular.forEach(vm.object.jobs, function (job) {
                    job.state._text = 'RUNNING';
                    job.state.severity = '0';

                });
                vm.object.jobs = [];
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

            if ($rootScope.config.jobs.polling) {
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
                            obj.folders.push({folder: res});
                        });
                    }
                    obj.state = vm.filter.state;
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
