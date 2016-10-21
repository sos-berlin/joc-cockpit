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
        "toasty", "gettextCatalog", "$timeout", "DailyPlanService","$interval","$rootScope"];
    function JobChainCtrl($scope, JobChainService, OrderService, $location, SOSAuth, $uibModal, orderBy, ScheduleService, SavedFilter,
                          toasty, gettextCatalog, $timeout, DailyPlanService,$interval,$rootScope) {
        var vm = $scope;
        vm.filter = {};
        vm.filter.state = "all";
        vm.filter.sortBy = "name";


        vm.object = {};

        vm.pageSize = 10;
        vm.currentPage = 1;


        vm.savedJobChainFilter = JSON.parse(SavedFilter.jobChainFilters) || {};
        vm.savedJobChainFilter.list = vm.savedJobChainFilter.list || [];
        vm.savedJobChainFilter.selected = vm.savedJobChainFilter.favorite;

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

        /**--------------- sorting and pagination -------------------*/
        vm.pageChange = function () {
            vm.object.jobChains = [];
        };

        vm.sortBy = function (propertyName) {
            vm.object.jobChains = [];
            vm.reverse = (propertyName !== null && vm.propertyName === propertyName) ? !vm.reverse : false;
            vm.propertyName = propertyName;
            vm.jobChains = orderBy(vm.jobChains, vm.propertyName, vm.reverse);
        };


        vm.mainSortBy = function (propertyName) {
            vm.object.jobChains = [];
            vm.sortReverse = !vm.sortReverse;
            vm.filter.sortBy = propertyName;

            vm.jobChains = orderBy(vm.jobChains, vm.filter.sortBy, vm.sortReverse);
        };

        vm.tree = [];

        vm.expanding_property = {
            field: "name"
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
        vm.my_tree = {};
        vm.branchs = [];

        vm.treeHandler = function (data) {
            data.folders = orderBy(data.folders, 'name');
            if (data.expanded) {
                data.jobChains = [];
                angular.forEach(vm.jobChains, function (value) {
                    if (data.path == value.path.substring(0, value.path.lastIndexOf('/'))) {
                        data.jobChains.push(value);
                    }
                });
                data.jobChains = orderBy(data.jobChains, vm.filter.sortBy);


                    vm.branchs = [];
                    vm.branchs.push(data);

            }
        };

        vm.treeHandler1 = function (data) {
            data.folders = orderBy(data.folders, 'name');
            if (data.expanded) {
                data.jobChains = [];
                angular.forEach(vm.jobChains, function (value) {
                    if (data.path == value.path.substring(0, value.path.lastIndexOf('/'))) {
                        data.jobChains.push(value);
                    }
                });
                data.jobChains = orderBy(data.jobChains, vm.filter.sortBy);

                if (data.jobChains.length > 0) {
                    vm.branchs = [];
                    vm.branchs.push(data);
                }
            }

        };

        vm.expandNode = function (data) {
            vm.branchs = [];
            function recursive(data) {
                data.expanded = !0;
                data.folders = orderBy(data.folders, 'name');

                data.jobChains = [];
                angular.forEach(vm.jobChains, function (value) {
                    if (data.path == value.path.substring(0, value.path.lastIndexOf('/'))) {
                        data.jobChains.push(value);
                    }
                });
                data.jobChains = orderBy(data.jobChains, vm.filter.sortBy);

                if (data.jobChains.length > 0) {
                    vm.branchs.push(data);
                }
                angular.forEach(data.folders, function (a) {
                    a.expanded = !0;

                    a.jobChains = [];
                    angular.forEach(vm.jobChains, function (value) {
                        if (a.path == value.path.substring(0, value.path.lastIndexOf('/'))) {
                            a.jobChains.push(value);
                        }
                    });
                    a.jobChains = orderBy(a.jobChains, vm.filter.sortBy);
                    if (a.jobChains.length > 0) {
                        vm.branchs.push(a);
                    }

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

        function traverseTree(data) {
            data.jobChains = [];
            data.folders = orderBy(data.folders, 'name');
            angular.forEach(vm.jobChains, function (value) {

                if (data.path == value.path.substring(0, value.path.lastIndexOf('/'))) {
                    data.jobChains.push(value);
                }
            });
            data.jobChains = orderBy(data.jobChains, vm.filter.sortBy);

            if (data.jobChains.length > 0) {
                vm.branchs.push(data);
            }
            if (data.folders.length > 0) {
                angular.forEach(data.folders, function (value) {
                    traverseTree(value);
                });
            }
        }

        vm.expandAll = function () {
            vm.branchs = [];
            angular.forEach(vm.tree, function (value) {
                traverseTree(value);
            });
        };

        function checkExpand(data) {
            data.jobChains = [];
            angular.forEach(vm.jobChains, function (value) {
                if (data.path == value.path.substring(0, value.path.lastIndexOf('/'))) {
                    data.jobChains.push(value);
                }
            });
            data.jobChains = orderBy(data.jobChains, vm.filter.sortBy);
            if (data.jobChains.length > 0) {
                vm.branchs.push(data);
            }
            if (data.folders.length > 0) {
                angular.forEach(data.folders, function (value) {
                    if (value.expanded)
                        checkExpand(value);
                });
            }
        }

        function filteredTreeData() {
            vm.branchs = [];
            angular.forEach(vm.tree, function (value) {
                if (value.expanded)
                    checkExpand(value);
            });
        }

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
            if (vm.savedJobChainFilter.list.length > 0) {
                filterTreeData();
            } else {
                vm.tree = angular.copy(vm.filterTree);
            }
            // vm.isLoading = true;
        }, function (err) {

        });


        vm.init = function () {
            vm.isLoading = false;
            JobChainService.getJobChainsP({
                jobschedulerId: vm.schedulerIds.selected,
                compact: true
            }).then(function (result) {
                vm.jobChains = result.jobChains;
                vm.isLoading = true;
               getVolatile();
            }, function () {
                vm.isLoading = true;
                vm.isError = true;
            });
        };

        vm.init();
        var i =1;
        function getVolatile(){
             JobChainService.get({jobschedulerId: vm.schedulerIds.selected}).then(function (res) {
                    vm.temp = angular.merge(vm.jobChains, res.jobChains);
                    filterData();
                });
        }

        vm.load = function () {
            filterTreeData();
            vm.object.jobChains = [];
            var data = [];
            if (vm.savedJobChainFilter.selected) {
                filterData();
                angular.forEach(vm.jobChains, function (value) {
                    if (value.state._text.toLowerCase() == vm.filter.state || vm.filter.state == 'all')
                        data.push(value);
                });
                vm.jobChains = data;
            } else {
                angular.forEach(vm.temp, function (value) {
                    if (value.state._text.toLowerCase() == vm.filter.state || vm.filter.state == 'all')
                        data.push(value);
                });
                vm.jobChains = data;
            }

            filteredTreeData();
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
                    if (value.state && value.state._text.toLowerCase() == 'stopped') {
                        vm.isStopped = true;
                    } else {
                        vm.isUnstopped = true;
                    }
                    if (value.state && (value.state._text.toLowerCase() == 'under_construction' || value.state._text.toLowerCase() == 'not_initialized')) {
                        vm.isStopped = true;
                        vm.isUnstopped = true;
                    }
                });
            } else {
                vm.allCheck.checkbox = false;
            }
        });

        var watcher2 = $scope.$watchCollection('filtered', function (newNames) {
            if (newNames)
                vm.object.jobChains = [];
        });

        var watcher3 = $scope.$watch('pageSize', function (newNames) {
            if (newNames)
                vm.object.jobChains = [];
        });

        vm.checkAll = function () {
            if (vm.allCheck.checkbox) {
                vm.object.jobChains = vm.jobChains.slice((vm.pageSize * (vm.currentPage - 1)), (vm.pageSize * vm.currentPage));
            } else {
                vm.object.jobChains = [];
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
                //openCalendar();
            }, function (err) {
            });
            openCalendar();
            vm.object.jobChains = [];
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

            if(order.fromDate) {
                orders.at = moment.utc(order.fromDate).format();
            } else {
                orders.at ='now';
            }

            if(paramObject.length>0){
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

        function filterData() {
            angular.forEach(vm.savedJobChainFilter.list, function (value) {
                if (!vm.savedJobChainFilter.selected) {
                    vm.jobChains = vm.temp;
                }
                else if (value.name == vm.savedJobChainFilter.selected) {
                    vm.data = [];
                    angular.forEach(vm.temp, function (res) {

                        var flag = true;
                        if (value.regex && res.name) {
                            if (!res.name.match(value.regex)) {
                                flag = false;
                            }
                        }

                        if (flag && value.paths && value.paths.length > 0) {

                            for (var i = 0; i < value.paths.length; i++) {
                                var x = res.path.substring(0, res.path.lastIndexOf('/'));
                                flag = false;
                                if (value.paths[i] == x) {
                                    flag = true;
                                    break;
                                } else {
                                    if (x.indexOf(value.paths[i]) !== -1 || value.paths[i].indexOf(x) !== -1) {
                                        flag = true;
                                        break;
                                    }
                                }
                            }
                        }

                        if (flag && value.state && res.state) {
                            if (value.state.indexOf(res.state._text) === -1) {
                                flag = false;
                            }
                        }
                        if (flag && value.agentName && res.processClass) {
                            if (!res.processClass.match(value.agentName)) {
                                flag = false;
                            }
                        }

                        if (flag)
                            vm.data.push(res);
                    });
                    vm.jobChains = vm.data;
                }

            });
        }

        function filterTreeData() {
            angular.forEach(vm.savedJobChainFilter.list, function (value) {
                if (!vm.savedJobChainFilter.selected) {
                    if (!vm.tree) {
                        vm.tree = angular.copy(vm.filterTree);
                    } else {
                        if (vm.tree.length != vm.filterTree.length) {
                            vm.tree = angular.copy(vm.filterTree);
                        }
                    }
                }
                else if (value.name == vm.savedJobChainFilter.selected && value.paths && value.paths.length > 0) {
                    var data = [];
                    angular.forEach(vm.filterTree, function (res) {
                        var flag = false;
                        if (value.paths && value.paths.length > 0) {
                            for (var i = 0; i < value.paths.length; i++) {
                                if (value.paths[i] == res.path) {
                                    flag = true;
                                    break;
                                } else {
                                    if (res.path.indexOf(value.paths[i]) !== -1 || value.paths[i].indexOf(res.path) !== -1) {
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
                }

            });

        }

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
                vm.savedJobChainFilter.selected = vm.jobChainFilter.name;
                if(vm.savedJobChainFilter.list.length==1){
                    vm.savedJobChainFilter.favorite = vm.jobChainFilter.name;
                }
                SavedFilter.setJobChain(vm.savedJobChainFilter);
                SavedFilter.save();
                vm.load();
            }, function () {

            });
        };

        vm.editFilters = function () {
            vm.filters = vm.savedJobChainFilter;
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
            }else if (vm.savedJobChainFilter.selected == vm.jobChainFilter.name) {
                vm.savedJobChainFilter.selected = undefined;
            }
            SavedFilter.setJobChain(vm.savedJobChainFilter);
            SavedFilter.save();
            vm.load();
        };

        vm.favorite = function(filter) {
            vm.savedJobChainFilter.favorite = filter;
            vm.savedJobChainFilter.selected = filter;
            SavedFilter.setJobChain(vm.savedJobChainFilter);
            SavedFilter.save();
            vm.load();
        };

        vm.filter_tree = {};
         vm.filterTree1 = [];

        vm.getTreeStructure = function () {
            vm.filterTree1 = angular.copy(vm.filterTree);
            $('#treeModal').modal('show');
        };


       vm.treeExpand = function (data) {
              angular.forEach(vm.object.paths, function (value) {
                  if(data.path==value) {
                      if (data.folders.length > 0) {
                          angular.forEach(data.folders, function (res) {
                              vm.object.paths.push(res.path);
                          });
                      }
                  }
                });
        };

        vm.object.paths=[];
        var watcher4 = $scope.$watchCollection('object.paths', function (newNames) {
            if (newNames && newNames.length > 0) {
                vm.paths= newNames;
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
            vm.savedJobChainFilter.selected = filter;
            SavedFilter.setJobChain(vm.savedJobChainFilter);
            SavedFilter.save();
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
                    getVolatile();
                }
            }, $rootScope.config.jobChains.interval * 1000)

        }

        $scope.$on('$destroy', function () {
            watcher1();
            watcher2();
            watcher3();
            watcher4();
            if(interval)
            $interval.cancel(interval);


        });
    }


    JobCtrl.$inject = ["$scope", "$rootScope", "JobService", "$uibModal", "orderByFilter", "SavedFilter", "TaskService", "toasty", "ScheduleService",
        "gettextCatalog", "FileSaver", "Blob", "$state", "$interval","$timeout"];
    function JobCtrl($scope, $rootScope, JobService, $uibModal, orderBy, SavedFilter, TaskService, toasty, ScheduleService,
                     gettextCatalog, FileSaver, Blob, $state, $interval,$timeout) {
        var vm = $scope;
        vm.filter = {};
        vm.filter.state = "all";
        vm.filter.sortBy = "name";
        vm.object = {};

        vm.pageSize = 10;
        vm.currentPage = 1;


        vm.savedJobFilter = JSON.parse(SavedFilter.jobFilters) || {};
        vm.savedJobFilter.list = vm.savedJobFilter.list || [];
        vm.savedJobFilter.selected = vm.savedJobFilter.favorite;

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

        vm.tree = [];

        vm.expanding_property = {
            field: "name"
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


        vm.my_tree = {};
        vm.branchs = [];

        vm.treeHandler = function (data) {
            data.folders = orderBy(data.folders, 'name');
            if (data.expanded) {
                data.jobs = [];
                angular.forEach(vm.jobs, function (value) {
                    if (data.path == value.path.substring(0, value.path.lastIndexOf('/'))) {
                        data.jobs.push(value);
                    }
                });
                data.jobs = orderBy(data.jobs, vm.filter.sortBy);


                    vm.branchs = [];
                    vm.branchs.push(data);

            }
        };

        vm.treeHandler1 = function (data) {
            data.folders = orderBy(data.folders, 'name');
            if (data.expanded) {
                data.jobs = [];
                angular.forEach(vm.jobs, function (value) {
                    if (data.path == value.path.substring(0, value.path.lastIndexOf('/'))) {
                        data.jobs.push(value);
                    }
                });
                data.jobs = orderBy(data.jobs, vm.filter.sortBy);

                if (data.jobs.length > 0) {
                    vm.branchs = [];
                    vm.branchs.push(data);
                }
            }

        };

        vm.expandNode = function (data) {
            vm.branchs = [];
            function recursive(data) {
                data.expanded = !0;
                data.folders = orderBy(data.folders, 'name');

                data.jobs = [];
                angular.forEach(vm.jobs, function (value) {
                    if (data.path == value.path.substring(0, value.path.lastIndexOf('/'))) {
                        data.jobs.push(value);
                    }
                });
                data.jobs = orderBy(data.jobs, vm.filter.sortBy);

                if (data.jobs.length > 0) {
                    vm.branchs.push(data);
                }
                angular.forEach(data.folders, function (a) {
                    a.expanded = !0;

                    a.jobs = [];
                    angular.forEach(vm.jobs, function (value) {
                        if (a.path == value.path.substring(0, value.path.lastIndexOf('/'))) {
                            a.jobs.push(value);
                        }
                    });
                    a.jobs = orderBy(a.jobs, vm.filter.sortBy);
                    if (a.jobs.length > 0) {
                        vm.branchs.push(a);
                    }

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

        function traverseTree(data) {
            data.jobs = [];
            data.folders = orderBy(data.folders, 'name');
            angular.forEach(vm.jobs, function (value) {

                if (data.path == value.path.substring(0, value.path.lastIndexOf('/'))) {
                    data.jobs.push(value);
                }
            });
            data.jobs = orderBy(data.jobs, vm.filter.sortBy);

            if (data.jobs.length > 0) {
                vm.branchs.push(data);
            }
            if (data.folders.length > 0) {
                angular.forEach(data.folders, function (value) {
                    traverseTree(value);
                });
            }
        }

        vm.expandAll = function () {
            vm.branchs = [];
            angular.forEach(vm.tree, function (value) {
                traverseTree(value);
            });
        };

        function checkExpand(data) {
            data.jobs = [];
            angular.forEach(vm.jobs, function (value) {
                if (data.path == value.path.substring(0, value.path.lastIndexOf('/'))) {
                    data.jobs.push(value);
                }
            });
            data.jobs = orderBy(data.jobs, vm.filter.sortBy);
            if (data.jobs.length > 0) {
                vm.branchs.push(data);
            }
            if (data.folders.length > 0) {
                angular.forEach(data.folders, function (value) {
                    if (value.expanded)
                        checkExpand(value);
                });
            }
        }

        function filteredTreeData() {
            vm.branchs = [];
            angular.forEach(vm.tree, function (value) {
                if (value.expanded)
                    checkExpand(value);
            });
        }

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

            if (vm.savedJobFilter.list && vm.savedJobFilter.list.length > 0) {
                filterTreeData();
            } else {
                vm.tree = angular.copy(vm.filterTree);
            }
            // vm.isLoading = true;
        }, function (err) {

        });


        vm.init = function () {
            vm.isLoading = false;
            JobService.getJobsP({jobschedulerId: vm.schedulerIds.selected, compact: true}).then(function (result) {
                angular.forEach(result.jobs, function (value) {
                    value.path1 = value.path.substring(0, value.path.lastIndexOf('/'));
                });
                vm.jobs = result.jobs;
                getVolatile();
                vm.isLoading = true;

            }, function () {
                vm.isLoading = true;
                vm.isError = true;
            });
        };

        function getVolatile() {
            JobService.get({jobschedulerId: vm.schedulerIds.selected}).then(function (res) {
                vm.temp = angular.merge(vm.jobs, res.jobs);
                filterData();
            });
        }

        vm.init();


        vm.load = function () {
            filterTreeData();
            vm.object.jobs = [];
            if (vm.savedJobFilter.selected) {
                filterData();
                vm.data = [];
                angular.forEach(vm.jobs, function (value) {
                    if (value.state._text.toLowerCase() == vm.filter.state || vm.filter.state == 'all')
                        vm.data.push(value);
                });
                vm.jobs = vm.data;
            } else {
                vm.data = [];
                angular.forEach(vm.temp, function (value) {
                    if (value.state._text.toLowerCase() == vm.filter.state || vm.filter.state == 'all')
                        vm.data.push(value);
                });
                vm.jobs = vm.data;
            }
            vm.hideTaskPanel();
            filteredTreeData();
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
                    if (value.state && value.state._text.toLowerCase() == 'stopped') {
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


        function filterData() {
            angular.forEach(vm.savedJobFilter.list, function (value) {
                if (!vm.savedJobFilter.selected) {
                    vm.jobs = angular.copy(vm.temp);
                }
                else if (value.name == vm.savedJobFilter.selected) {
                    vm.data = [];
                    angular.forEach(vm.temp, function (res,index) {

                        var flag = true;
                        if (value.regex && res.name) {
                            if (!res.name.match(value.regex)) {
                                flag = false;
                            }
                        }

                        if (flag && value.state && res.state) {
                            if (value.state.indexOf(res.state._text) === -1) {
                                flag = false;
                            }
                        }

                        if (flag && value.paths && value.paths.length > 0) {

                            for (var i = 0; i < value.paths.length; i++) {
                                var x = res.path.substring(0, res.path.lastIndexOf('/'));
                                flag = false;
                                if (value.paths[i] == x) {
                                    flag = true;
                                    break;
                                } else {
                                    if (x.indexOf(value.paths[i]) !== -1 || value.paths[i].indexOf(x) !== -1) {
                                        flag = true;
                                        break;
                                    }
                                }
                            }
                        }

                          var fromDate;
                        var toDate;
                         if (flag && value.planned && res.startedAt) {
                             if (/^\s*(now\s*\+)\s*(\d+)\s*$/i.test(value.planned)) {
                                 fromDate = new Date();
                                 toDate = new Date();
                                 var seconds = parseInt(/^\s*(now\+)(\d+)\s*$/i.exec(value.planned)[2]);
                                 toDate.setSeconds(toDate.getSeconds() + seconds);
                             } else if (/^\s*(Today)\s*$/i.test(value.planned)) {
                                 fromDate = new Date();

                                 fromDate.setHours(0);
                                 fromDate.setMinutes(0);
                                 toDate = new Date();
                                 toDate.setHours(23);
                                 toDate.setMinutes(59);
                             } else if (/^\s*(now)\s*$/i.test(value.planned)) {
                                 fromDate = new Date();
                                 toDate = new Date();
                             } else if (/^\s*(\d+):(\d+)\s*(am|pm)\s*to\s*(\d+):(\d+)\s*(am|pm)\s*$/i.test(value.planned)) {
                                 var time = /^\s*(\d+):(\d+)\s*(am|pm)\s*to\s*(\d+):(\d+)\s*(am|pm)\s*$/i.exec(value.planned)
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

                          if (flag && value.fromDate && res.startedAt) {
                            if (value.fromTime) {
                                fromDate = new Date(value.fromDate);
                                value.fromTime = new Date(value.fromTime);
                                fromDate.setHours(value.fromTime.getHours());
                                fromDate.setMinutes(value.fromTime.getMinutes());
                                fromDate.setSeconds(value.fromTime.getSeconds());
                            }
                        }

                        if (flag && value.toDate && res.startedAt) {
                            if (value.toTime) {
                                toDate = new Date(value.toDate);
                                value.toTime = new Date(value.toTime);
                                toDate.setHours(value.toTime.getHours());
                                toDate.setMinutes(value.toTime.getMinutes());
                                toDate.setSeconds(value.toTime.getSeconds());
                            }
                        }


                        if(fromDate && toDate){
                            if(fromDate>new Date(moment(res.startedAt)) || toDate<new Date(moment(res.startedAt))){
                                flag=false;
                            }
                        }


                        if (flag)
                            vm.data.push(res);
                    });
                    vm.jobs = vm.data;
                }
            });
        }

        function filterTreeData() {
            angular.forEach(vm.savedJobFilter.list, function (value) {
                if (!vm.savedJobFilter.selected) {
                    if (!vm.tree) {
                        vm.tree = angular.copy(vm.filterTree);
                    } else {
                        if (vm.tree.length != vm.filterTree.length) {
                            vm.tree = angular.copy(vm.filterTree);
                        }
                    }
                }
                else if (value.name == vm.savedJobFilter.selected && value.paths && value.paths.length > 0) {
                    var data = [];
                    angular.forEach(vm.filterTree, function (res) {
                        var flag = false;
                        if (value.paths && value.paths.length > 0) {
                            for (var i = 0; i < value.paths.length; i++) {
                                if (value.paths[i] == res.path) {
                                    flag = true;
                                    break;
                                } else {
                                    if (res.path.indexOf(value.paths[i]) !== -1 || value.paths[i].indexOf(res.path) !== -1) {
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
                }

            });

        }

        vm.validPlanned = true;
        vm.checkPlanned = function () {
            vm.validPlanned = true;
            if (!vm.jobFilter.planned|| /^\s*$/i.test(vm.jobFilter.planned) || /^\s*(now\s*\+)\s*(\d+)\s*$/i.test(vm.jobFilter.planned) || /^\s*(now)\s*$/i.test(vm.jobFilter.planned) || /^\s*(Today)\s*$/i.test(vm.jobFilter.planned)
                || /^\s*(\d+):(\d+)\s*(am|pm)\s*to\s*(\d+):(\d+)\s*(am|pm)\s*$/i.test(vm.jobFilter.planned)) {
            } else {
                vm.validPlanned = false;
            }
        }

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
                if(vm.savedJobFilter.list.length==1){
                    vm.savedJobFilter.favorite = vm.jobFilter.name;
                }
                SavedFilter.setJob(vm.savedJobFilter);
                SavedFilter.save();
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
            }else if (vm.savedJobFilter.selected == vm.jobFilter.name) {
                vm.savedJobFilter.selected = undefined;
            }
            SavedFilter.setJob(vm.savedJobFilter);
            SavedFilter.save();
            vm.load();
        };

        vm.favorite = function(filter) {
            vm.savedJobFilter.favorite = filter;
            vm.savedJobFilter.selected = filter;
            SavedFilter.setJob(vm.savedJobFilter);
            SavedFilter.save();
            vm.load();
        };

        vm.filter_tree = {};
         vm.filterTree1 = [];

        vm.getTreeStructure = function () {
            vm.filterTree1 = angular.copy(vm.filterTree);
            $('#treeModal').modal('show');
        };


       vm.treeExpand = function (data) {
              angular.forEach(vm.object.paths, function (value) {
                  if(data.path==value) {
                      if (data.folders.length > 0) {
                          angular.forEach(data.folders, function (res) {
                              vm.object.paths.push(res.path);
                          });
                      }
                  }
                });
        };

        vm.object.paths=[];
        var watcher4 = $scope.$watchCollection('object.paths', function (newNames) {
            if (newNames && newNames.length > 0) {
                vm.paths= newNames;
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
            vm.savedJobFilter.selected = filter;
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
                var logs = JSON.parse(JSON.stringify( res));
                logs=logs.data.substring(logs.data.indexOf("plain")+8);
                logs = logs.substring(0,logs.indexOf("}"));
                logs=logs.replace(/"/g,'').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/\\n/g,'<br>');
                vm.logs = logs.split('<br>');
            });
        };

        vm.logClass = function(logData) {
            var logStatus = logData.substring(logData.indexOf("[")+1, logData.indexOf("]"));
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


        vm.downloadLog = function (logs) {
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
            interval=$interval(function () {
                if (vm.pageView == 'list') {
                    getVolatile();
                } else {

                }
            }, $rootScope.config.jobs.interval * 1000)


        }

        $scope.$on('$destroy', function () {
            watcher1();
            watcher2();
            watcher3();
          watcher4();
            if(interval)
            $interval.cancel(interval);

        });

        vm.viewAllHistories = function () {
            $state.go('app.history');
            JobService.jobSelected = vm.showTaskPanel.path;
        }

    }


})();
