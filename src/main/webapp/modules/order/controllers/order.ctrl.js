/**
 * Created by sourabhagrawal on 30/06/16.
 */
(function () {
    'use strict';
    angular
        .module('app')
        .controller('JobChainOrdersCtrl', JobChainOrdersCtrl)
        .controller('JobChainOverviewCtrl', JobChainOverviewCtrl)
        .controller('JobChainDetailsCtrl', JobChainDetailsCtrl)
        .controller('OrderCtrl', OrderCtrl)
        .controller('OrderOverviewCtrl', OrderOverviewCtrl)
        .controller('OrderFunctionCtrl', OrderFunctionCtrl)
        .controller('HistoryCtrl', HistoryCtrl)
        .controller('LogCtrl', LogCtrl);

    JobChainOrdersCtrl.$inject = ["$scope", "SOSAuth", "OrderService", "CoreService", "AuditLogService"];
    function JobChainOrdersCtrl($scope, SOSAuth, OrderService, CoreService, AuditLogService) {
        var vm = $scope;
        vm.orderFilters = CoreService.getOrderDetailTab();
        vm.orderFilters.overview = false;
        vm.status = vm.orderFilters.filter.state;

        var loadFinished = true;

        function loadJobOrderV(obj) {
            OrderService.get(obj).then(function (res) {
                var data = [];
                if (vm.orders && vm.orders.length > 0) {
                    angular.forEach(vm.orders, function (order) {
                        for (var i = 0; i < res.orders.length; i++) {
                            if (order.path == res.orders[i].path) {
                                res.orders[i].title = angular.copy(order.title);
                                res.orders[i].params = angular.copy(order.params);
                                res.orders[i].show = angular.copy(order.show);
                                order = res.orders[i];
                                data.push(order);
                                res.orders.splice(i, 1);
                                break;
                            }
                        }
                    });
                    data = data.concat(res.orders);
                    vm.orders = data;
                } else {
                    vm.orders = res.orders;
                }
                vm.isLoading = true;
                loadFinished = true;
            }, function () {
                vm.isLoading = true;
                loadFinished = true;
            });
        }

        function loadOrders(obj) {
            loadFinished = false;
            OrderService.getOrdersP(obj).then(function (result) {
                vm.orders = result.orders;
                vm.isLoading = true;
                loadJobOrderV(obj);
            }, function () {
                vm.isLoading = true;
                loadJobOrderV(obj);
            });
        }

        vm.orders = [];

        function loadJobChain() {

            if (SOSAuth.jobChain) {
                vm.jobChain = JSON.parse(SOSAuth.jobChain);
                var obj = {};
                obj.jobschedulerId = $scope.schedulerIds.selected;
                obj.compact = true;
                obj.orders = [];
                obj.orders.push({jobChain: vm.jobChain.path});
                if (vm.orderFilters.filter.state && vm.orderFilters.filter.state != 'ALL') {
                    obj.processingStates = [];
                    obj.processingStates.push(vm.orderFilters.filter.state);
                }
                if (loadFinished)
                    loadOrders(obj);
            }
        }

        loadJobChain();
        $scope.$on("reloadJobChain", function () {
            loadJobChain();
        });

        $scope.$on("orderState", function (evt, state) {
            vm.orderFilters.filter.state = state;
            vm.status = state;
            if (state) {
                var obj = {};
                obj.jobschedulerId = $scope.schedulerIds.selected;
                obj.compact = true;
                obj.orders = [];
                obj.orders.push({jobChain: vm.jobChain.path});
                if (vm.orderFilters.filter.state && vm.orderFilters.filter.state != 'ALL') {
                    obj.processingStates = [];
                    obj.processingStates.push(vm.orderFilters.filter.state);
                }
                loadOrders(obj);

            }
        });

        vm.showLogFuc = function (value) {
            var orders = {};
            vm.isAuditLog = false;
            orders = {};
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

    }

    JobChainOverviewCtrl.$inject = ["$scope", "$rootScope", "OrderService", "SOSAuth", "JobChainService", "JobService", "$timeout", "DailyPlanService", "$state", "$location", "CoreService", "$uibModal", "AuditLogService"];
    function JobChainOverviewCtrl($scope, $rootScope, OrderService, SOSAuth, JobChainService, JobService, $timeout, DailyPlanService, $state, $location, CoreService, $uibModal, AuditLogService) {

        var vm = $scope;
        vm.orderFilters = CoreService.getOrderDetailTab();
        vm.orderFilters.pageView = 'grid';
        vm.status = vm.orderFilters.filter.state;

        vm.orderFilters.overview = true;

        vm.selectedNodes = [];
        vm.allOrdersCheck = {};
        vm.allOrdersCheck.orders = [];
        vm.obj = {};
        vm.obj.orders = [];
        var promise1, promise2;
        var object = $location.search();

        var splitRegex = new RegExp('(.+):(.+)');
        var parentRegex = '';

        vm.totalNodes = 0;
        vm.uniqueNode = 0;
        vm.totalSubNodes = 0;


        function loadJobChain() {

            if (SOSAuth.jobChain) {
                vm.totalNodes = 0;
                vm.totalSubNodes = 0;

                vm.jobChain = JSON.parse(SOSAuth.jobChain);

                if (vm.totalSubNodes > 0) {
                    vm.totalLineWidth = vm.totalNodes + vm.totalSubNodes;
                } else {
                    vm.totalLineWidth = vm.totalNodes;
                }

                angular.forEach(vm.jobChain.nodes, function (val, index) {
                    if (val.job && val.job.state && val.job.state._text == 'RUNNING' && vm.userPreferences.showTasks) {

                        JobService.get({
                            jobschedulerId: vm.schedulerIds.selected,
                            jobs: [{job: val.job.path}]
                        }).then(function (res1) {
                            vm.jobChain.nodes[index].job = angular.merge(vm.jobChain.nodes[index].job, res1.jobs[0]);
                        });
                    }
                });

            }
        }

        $scope.$on("reloadJobChain", function () {
            loadJobChain();
            loadHistory();
            if (vm.permission.AuditLog.view.status)
                loadAuditLogs();
        });

        loadHistory();
        if (vm.permission.AuditLog.view.status && vm.jobChain)
            loadAuditLogs();

        vm.getJobInfo = getJobInfo;
        function getJobInfo(jobInfo) {
            jobInfo.jobschedulerId = $scope.schedulerIds.selected;
            jobInfo.compact = false;
            return JobService.getJobP(jobInfo);
        }

        vm.slider = {
            value: 100,
            options: {
                floor: 50,
                ceil: 150,
                showTicks: 10,
                hidePointerLabels: true,
                hideLimitLabels: true
            }
        };
        /*        vm.showTask = function(task,node){
         if(!task.order){
         return false;
         }
         var show = false;
         angular.forEach(node.orders,function(order){
         if(order.orderId==task.order.orderId){
         show=true;
         }
         })
         return show;
         }*/

        vm.onAction = onAction;

        function onAction(path, node, action) {
            var nodes = {};
            nodes.nodes = [];
            nodes.jobschedulerId = $scope.schedulerIds.selected;
            nodes.nodes.push({jobChain: path, node: node});

            var jobs = {};
            if (action == 'stop jobChain' || action == 'unstop jobChain') {
                jobs.jobChains = [];
                jobs.jobChains.push({jobChain: path});
            } else {
                jobs.jobs = [];
                jobs.jobs.push({job: path});
            }

            jobs.jobschedulerId = $scope.schedulerIds.selected;

            var modalInstance = '';
            vm.comments = {};
            vm.comments.radio = 'predefined';

            if (action == 'stop node') {
                if (vm.userPreferences.auditLog) {

                    vm.comments.name = path;
                    vm.comments.operation = 'Stop Node';
                    vm.comments.type = 'Job Chain';

                    modalInstance = $uibModal.open({
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
                        return JobService.stopNode(nodes);
                    }, function () {
                    });
                } else {
                    return JobService.stopNode(nodes);
                }
            } else if (action == 'skip') {
                if (vm.userPreferences.auditLog) {

                    vm.comments.name = path;
                    vm.comments.operation = 'Skip Node';
                    vm.comments.type = 'Job Chain';

                    modalInstance = $uibModal.open({
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
                        return JobService.skipNode(nodes);
                    }, function () {
                    });
                } else {
                    return JobService.skipNode(nodes);
                }
            } else if (action == 'unstop node' || action == 'unskip') {
                if (vm.userPreferences.auditLog) {

                    vm.comments.name = path;
                    vm.comments.operation = action == 'unskip' ? 'Unskip Node' : 'Unstop Node';
                    vm.comments.type = 'Job Chain';

                    modalInstance = $uibModal.open({
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
                        return JobService.activateNode(nodes);
                    }, function () {
                    });
                } else {
                    return JobService.activateNode(nodes);
                }
            } else if (action == 'stop job') {
                if (vm.userPreferences.auditLog) {

                    vm.comments.name = path;
                    vm.comments.operation = 'Stop';
                    vm.comments.type = 'Job';

                    modalInstance = $uibModal.open({
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
                        return JobService.stop(jobs);
                    }, function () {
                    });
                } else {
                    return JobService.stop(jobs);
                }
            } else if (action == 'unstop job') {
                if (vm.userPreferences.auditLog) {

                    vm.comments.name = path;
                    vm.comments.operation = 'Unstop';
                    vm.comments.type = 'Job';

                    modalInstance = $uibModal.open({
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
                        return JobService.unstop(jobs);
                    }, function () {
                    });
                } else {
                    return JobService.unstop(jobs);
                }
            } else if (action == 'stop jobChain') {
                if (vm.userPreferences.auditLog) {

                    vm.comments.name = path;
                    vm.comments.operation = 'Stop';
                    vm.comments.type = 'Job Chain';

                    modalInstance = $uibModal.open({
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
                        return JobChainService.stop(jobs);
                    }, function () {
                    });
                } else {
                    return JobChainService.stop(jobs);
                }
            } else if (action == 'unstop jobChain') {
                if (vm.userPreferences.auditLog) {

                    vm.comments.name = path;
                    vm.comments.operation = 'Unstop';
                    vm.comments.type = 'Job Chain';

                    modalInstance = $uibModal.open({
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
                        return JobChainService.unstop(jobs);
                    }, function () {
                    });
                } else {
                    return JobChainService.unstop(jobs);
                }
            }
        }

        vm.stopNode = function (data, jobChain) {

            var nodes = {};
            nodes.nodes = [];
            nodes.jobschedulerId = $scope.schedulerIds.selected;
            nodes.nodes.push({jobChain: jobChain.path, node: data.name});
            if (vm.userPreferences.auditLog) {
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
                    nodes.auditLog = {};
                    if (vm.comments.comment)
                        nodes.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        nodes.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        nodes.auditLog.ticketLink = vm.comments.ticketLink;
                    JobService.stopNode(nodes);
                }, function () {
                });
            } else {
                JobService.stopNode(nodes);
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
                vm.comments.operation = 'Unstop Node';
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
                }, function () {

                });
            } else {
                JobService.activateNode(nodes);
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
                vm.comments.operation = 'Skip Node';
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
                }, function () {

                });
            } else {
                JobService.skipNode(nodes);
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
                vm.comments.operation = 'Unskip Node';
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
                }, function () {

                });
            } else {
                JobService.activateNode(nodes);
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
                }, function () {

                });
            } else {
                JobService.stop(jobs);
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
                }, function () {

                });
            } else {
                JobService.unstop(jobs);
            }
        };

        vm.onAdd = function (item) {
            promise1 = $timeout(function () {
                if (item) {
                    vm.selectedNodes.push(item);
                }
                vm.isStoppedJob = false;
                vm.isStoppedNode = false;
                vm.isSkippedNode = false;
                vm.isActiveNode = false;
                vm.isPendingJob = false;
                vm.isStoppedJobChain = false;
                vm.isJob = false;
                vm.isJobChain = false;

                angular.forEach(vm.selectedNodes, function (value) {

                    if (value.job) {
                        vm.isJob = true;
                    }
                    if (value.jobChain) {
                        vm.isJobChain = true;
                    }

                    if (value.job && value.state && value.state._text == 'STOPPED') {
                        vm.isStoppedNode = true;
                    }
                    if (value.job && value.state && value.state._text == 'SKIPPED') {
                        vm.isSkippedNode = true;
                    }
                    if (value.job && value.state && value.state._text == 'ACTIVE') {
                        vm.isActiveNode = true;
                    }
                    if (value.job && value.job.state && value.job.state._text == 'STOPPED') {
                        vm.isStoppedJob = true;
                    }
                    if (value.jobChain && value.jobChain.state && value.jobChain.state._text == 'STOPPED') {
                        vm.isStoppedJobChain = true;
                    }
                    if (value.job && value.job.state && value.job.state._text == 'PENDING') {
                        vm.isPendingJob = true;
                    }

                });


            }, 50);
        };

        vm.reset = function () {
            vm.object1.nodes = [];
            vm.selectedNodes = [];
        };

        vm.onRemove = function (item) {
            angular.forEach(vm.selectedNodes, function (node, index) {
                if (node.name == item.name) {
                    promise2 = $timeout(function () {
                        vm.selectedNodes.splice(index, 1);
                    }, 50);
                }
            })
        };

        vm.stopJobs = function () {
            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = $scope.schedulerIds.selected;

            angular.forEach(vm.selectedNodes, function (value) {
                jobs.jobs.push({job: value.job.path});
            });
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = '';
                vm.comments.operation = 'Stop';
                vm.comments.type = 'Job';
                angular.forEach(vm.selectedNodes, function (value, index) {
                    if (index == vm.selectedNodes.length - 1) {
                        vm.comments.name = vm.comments.name + ' ' + value.job.path;
                    } else {
                        vm.comments.name = value.job.path + ', ' + vm.comments.name;
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
                    JobService.stop(jobs).then(function (res) {
                        $rootScope.$broadcast('bulkOperationCompleted', {
                            operation: 'stopJobs',
                            status: 'success'
                        });
                    });
                    vm.reset();
                }, function () {
                    vm.reset();
                });
            } else {
                JobService.stop(jobs).then(function (res) {
                    $rootScope.$broadcast('bulkOperationCompleted', {
                        operation: 'stopJobs',
                        status: 'success'
                    });
                });
                vm.reset();
            }
        };

        vm.unstopJobs = function () {
            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = $scope.schedulerIds.selected;

            angular.forEach(vm.selectedNodes, function (value) {
                jobs.jobs.push({job: value.job.path});
            });
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = '';
                vm.comments.operation = 'Unstop';
                vm.comments.type = 'Job';
                angular.forEach(vm.selectedNodes, function (value, index) {
                    if (index == vm.selectedNodes.length - 1) {
                        vm.comments.name = vm.comments.name + ' ' + value.job.path;
                    } else {
                        vm.comments.name = value.job.path + ', ' + vm.comments.name;
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
                    JobService.unstop(jobs).then(function (res) {
                        $rootScope.$broadcast('bulkOperationCompleted', {operation: 'unstopJobs', status: 'success'});
                    });
                    vm.reset();
                }, function () {
                    vm.reset();
                });
            } else {
                JobService.unstop(jobs).then(function (res) {
                    $rootScope.$broadcast('bulkOperationCompleted', {operation: 'unstopJobs', status: 'success'});
                });
                vm.reset();
            }

        };

        vm.skipNodes = function () {
            var nodes = {};
            nodes.nodes = [];
            nodes.jobschedulerId = $scope.schedulerIds.selected;

            angular.forEach(vm.selectedNodes, function (value) {
                nodes.nodes.push({jobChain: vm.jobChain.path, node: value.name});
            });
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = '';
                vm.comments.operation = 'Skip Node';
                vm.comments.type = 'Job Chain';
                angular.forEach(vm.selectedNodes, function (value, index) {
                    if (index == vm.selectedNodes.length - 1) {
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
                    nodes.auditLog = {};
                    if (vm.comments.comment)
                        nodes.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        nodes.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        nodes.auditLog.ticketLink = vm.comments.ticketLink;
                    JobService.skipNode(nodes).then(function (res) {
                        $rootScope.$broadcast('bulkOperationCompleted', {operation: 'skipNodes', status: 'success'});
                    });
                    vm.reset();
                }, function () {
                    vm.reset();
                });
            } else {
                JobService.skipNode(nodes).then(function (res) {
                    $rootScope.$broadcast('bulkOperationCompleted', {operation: 'skipNodes', status: 'success'});
                });
                vm.reset();
            }

        };

        vm.unskipNodes = function () {

            var nodes = {};
            nodes.nodes = [];
            nodes.jobschedulerId = $scope.schedulerIds.selected;

            angular.forEach(vm.selectedNodes, function (value) {
                nodes.nodes.push({jobChain: vm.jobChain.path, node: value.name});
            });
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = '';
                vm.comments.operation = 'Unskip Node';
                vm.comments.type = 'Job Chain';
                angular.forEach(vm.selectedNodes, function (value, index) {
                    if (index == vm.selectedNodes.length - 1) {
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
                    nodes.auditLog = {};
                    if (vm.comments.comment)
                        nodes.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        nodes.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        nodes.auditLog.ticketLink = vm.comments.ticketLink;
                    JobService.activateNode(nodes).then(function (res) {
                        $rootScope.$broadcast('bulkOperationCompleted', {operation: 'unskipNodes', status: 'success'});
                    });
                    vm.reset();
                }, function () {
                    vm.reset();
                });
            } else {
                JobService.activateNode(nodes).then(function (res) {
                    $rootScope.$broadcast('bulkOperationCompleted', {operation: 'unskipNodes', status: 'success'});
                });
                vm.reset();
            }

        };

        vm.stopNodes = function () {

            var nodes = {};
            nodes.nodes = [];
            nodes.jobschedulerId = $scope.schedulerIds.selected;

            angular.forEach(vm.selectedNodes, function (value) {
                nodes.nodes.push({jobChain: vm.jobChain.path, node: value.name});
            });
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = '';
                vm.comments.operation = 'Stop Node';
                vm.comments.type = 'Job Chain';
                angular.forEach(vm.selectedNodes, function (value, index) {
                    if (index == vm.selectedNodes.length - 1) {
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
                    nodes.auditLog = {};
                    if (vm.comments.comment)
                        nodes.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        nodes.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        nodes.auditLog.ticketLink = vm.comments.ticketLink;
                    JobService.stopNode(nodes).then(function (res) {
                        $rootScope.$broadcast('bulkOperationCompleted', {operation: 'stopNodes', status: 'success'});
                    });
                    vm.reset();
                }, function () {
                    vm.reset();
                });
            } else {
                JobService.stopNode(nodes).then(function (res) {
                    $rootScope.$broadcast('bulkOperationCompleted', {operation: 'stopNodes', status: 'success'});
                });
                vm.reset();
            }

        };

        vm.unstopNodes = function () {

            var nodes = {};
            nodes.nodes = [];
            nodes.jobschedulerId = $scope.schedulerIds.selected;

            angular.forEach(vm.selectedNodes, function (value) {
                nodes.nodes.push({jobChain: vm.jobChain.path, node: value.name});
            });
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = '';
                vm.comments.operation = 'Unstop Node';
                vm.comments.type = 'Job Chain';
                angular.forEach(vm.selectedNodes, function (value, index) {
                    if (index == vm.selectedNodes.length - 1) {
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
                    nodes.auditLog = {};
                    if (vm.comments.comment)
                        nodes.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        nodes.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        nodes.auditLog.ticketLink = vm.comments.ticketLink;
                    JobService.activateNode(nodes).then(function (res) {
                        $rootScope.$broadcast('bulkOperationCompleted', {operation: 'unstopNodes', status: 'success'});
                    });
                }, function () {

                });
            } else {
                JobService.activateNode(nodes).then(function (res) {
                    $rootScope.$broadcast('bulkOperationCompleted', {operation: 'unstopNodes', status: 'success'});
                });
            }
            vm.reset();
        };

        vm.stopJobChains = function () {
            var jobChains = {};
            jobChains.jobChains = [];
            jobChains.jobschedulerId = $scope.schedulerIds.selected;

            angular.forEach(vm.selectedNodes, function (value) {
                jobChains.jobChains.push({jobChain: value.jobChain.path});
            });
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = '';
                vm.comments.operation = 'Stop';
                vm.comments.type = 'Job Chain';
                angular.forEach(vm.selectedNodes, function (value, index) {
                    if (index == vm.selectedNodes.length - 1) {
                        vm.comments.name = vm.comments.name + ' ' + value.jobChain.path;
                    } else {
                        vm.comments.name = value.jobChain.path + ', ' + vm.comments.name;
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
                    JobChainService.stop(jobChains).then(function (res) {
                        $rootScope.$broadcast('bulkOperationCompleted', {
                            operation: 'stopJobChains',
                            status: 'success'
                        });
                    });
                    vm.reset();
                }, function () {
                    vm.reset();
                });
            } else {
                JobChainService.stop(jobChains).then(function (res) {
                    $rootScope.$broadcast('bulkOperationCompleted', {
                        operation: 'stopJobChains',
                        status: 'success'
                    });
                });
                vm.reset();
            }
        };

        vm.unstopJobChains = function () {
            var jobChains = {};
            jobChains.jobChains = [];
            jobChains.jobschedulerId = $scope.schedulerIds.selected;

            angular.forEach(vm.selectedNodes, function (value) {
                jobChains.jobChains.push({jobChain: value.jobChain.path});
            });
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = '';
                vm.comments.operation = 'Unstop';
                vm.comments.type = 'Job Chain';
                angular.forEach(vm.selectedNodes, function (value, index) {
                    if (index == vm.selectedNodes.length - 1) {
                        vm.comments.name = vm.comments.name + ' ' + value.jobChain.path;
                    } else {
                        vm.comments.name = value.jobChain.path + ', ' + vm.comments.name;
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
                    JobChainService.unstop(jobChains).then(function (res) {
                        $rootScope.$broadcast('bulkOperationCompleted', {
                            operation: 'unstopJobChains',
                            status: 'success'
                        });
                    });
                    vm.reset();
                }, function () {
                    vm.reset();
                });
            } else {
                JobChainService.unstop(jobChains).then(function (res) {
                    $rootScope.$broadcast('bulkOperationCompleted', {operation: 'unstopJobChains', status: 'success'});
                });
                vm.reset();
            }

        };

        vm.viewOrders = function (jobChain, state) {
            if (state)
                vm.orderFilters.filter.state = state;
            else
                vm.orderFilters.filter.state = 'ALL';
            $location.path('/job_chain_detail/orders').search(object);
        };

        $scope.$on("slideEnded", function () {
            $("#zoomCn").css("zoom", vm.slider.value / 100);
            $("#zoomCn").css("transform", "Scale(" + vm.slider.value / 100 + ")");
            $("#zoomCn").css("transform-origin", "0 0");
            if (vm.slider.value < 90) {
                $('.rect').css('border-width', '2px');
            }
            else {
                $('.rect').css('border-width', '1px');
            }
        });

        vm.isLoading = true;
        /**--------------- Checkbox functions -------------*/

        vm.object1 = {};
        vm.allCheck1 = {
            checkbox: false
        };

        var watcher1 = vm.$watchCollection('object1.nodes', function (newNames) {

            if (newNames && newNames.length > 0) {
                vm.allCheck1.checkbox = newNames.length == vm.jobChain.nodes.length;

                vm.isStoppedJob = false;
                vm.isStoppedJobChain = false;
                vm.isStoppedNode = false;
                vm.isSkippedNode = false;
                vm.isActiveNode = false;
                vm.isPendingJob = false;

                angular.forEach(newNames, function (value) {
                    if (value.state && value.state._text == 'STOPPED') {
                        vm.isStoppedNode = true;
                    }
                    if (value.state && value.state._text == 'SKIPPED') {
                        vm.isSkippedNode = true;
                    }
                    if (value.state && value.state._text == 'ACTIVE') {
                        vm.isActiveNode = true;
                    }
                    if (value.job) {
                        if (value.job.state && value.job.state._text == 'STOPPED') {
                            vm.isStoppedJob = true;
                        }
                        if (value.job.state && value.job.state._text == 'PENDING') {
                            vm.isPendingJob = true;
                        }
                    } else if (value.jobChain) {
                        if (value.jobChain.state && value.jobChain.state._text == 'STOPPED') {
                            vm.isStoppedJobChain = true;
                        }
                    }
                });

            } else {
                vm.allCheck1.checkbox = false;
            }

            vm.selectedNodes = angular.copy(vm.object1.nodes);
        });

        vm.checkAllJobChains = function () {

            if (vm.allCheck1.checkbox && vm.jobChain) {
                vm.object1.nodes = vm.jobChain.nodes;
            } else {
                vm.object1.nodes = [];
            }
            vm.selectedNodes = angular.copy(vm.object1.nodes);
        };
        $scope.compareFn = function (obj1, obj2) {
            return obj1.name === obj2.name;
        };
        vm.checkAllOrders = function () {
            if (vm.allOrdersCheck.orders) {
                vm.obj.orders = angular.copy(vm.orders, vm.obj.orders);
            } else {
                vm.obj.orders = [];
            }
        };


        $('#dDorders').on('click', function (event) {
            event.stopPropagation();
        });

        vm.getJobChain = getJobChain;
        function getJobChain(filter) {
            filter.jobschedulerId = vm.schedulerIds.selected;
            return JobChainService.getJobChain(filter);
        }

        vm.getJobChainInfo = getJobChainInfo;
        function getJobChainInfo(filter) {
            filter.jobschedulerId = vm.schedulerIds.selected;
            return JobChainService.getJobChainP(filter);
        }

        vm.isLoading1 = false;

        vm.loadHistory = loadHistory;
        function loadHistory(nestedJobChain) {
            if (vm.jobChain) {
                var filter = {};
                filter.jobChain = nestedJobChain ? nestedJobChain.path : vm.jobChain.path;
                filter.jobschedulerId = $scope.schedulerIds.selected;

                JobChainService.histories(filter).then(function (res) {
                    vm.orderHistory = res.history;
                    vm.isLoading1 = true;
                    vm.showHistoryPanel = {name: vm.jobChain.path, title: vm.jobChain.title}
                    if (nestedJobChain) {
                        vm.isAuditLog = false;
                        vm.showHistoryPanel = {name: nestedJobChain.path, title: nestedJobChain.title}
                    }
                }, function () {
                    vm.isLoading1 = true;
                });
            }
        }

        vm.loadAuditLogs = loadAuditLogs;
        function loadAuditLogs(nestedJobChain) {
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.orders = [];
            obj.orders.push({jobChain: nestedJobChain ? nestedJobChain.path : vm.jobChain.path});
            obj.limit = parseInt(vm.userPreferences.maxAuditLogPerObject);
            AuditLogService.getLogs(obj).then(function (result) {
                if (result && result.auditLog) {
                    vm.auditLogs = result.auditLog;

                }
                vm.showHistoryPanel = {name: vm.jobChain.path, title: vm.jobChain.title}
                if (nestedJobChain) {
                    vm.isAuditLog = true;
                    vm.showHistoryPanel = {name: nestedJobChain.path, title: nestedJobChain.title}
                }
            });
        }


        vm.viewAllHistories = function () {
            vm.taskHistoryTab = CoreService.getHistoryTab();
            vm.taskHistoryTab.type = 'jobChain';
            $state.go('app.history');
        };

        vm.setHeight = setHeight;

        vm.fitIntoScreen = fitIntoScreen;
        function fitIntoScreen() {
            vm.fitToScreen = true;
            setHeight(true);
        }

        function setHeight(reset) {
            if (vm.fitToScreen) {
                if (!document.getElementById("mainContainer")) {
                    return;
                }
                var windowWidth = document.getElementById("mainContainer").clientWidth;
                var maxLeft = 0;
                var maxTop = 0;

                angular.forEach(vm.coords, function (coord) {
                    if (coord.left && coord.left > maxLeft) {
                        maxLeft = coord.left;
                    }
                    if (coord.top && coord.top > maxTop) {
                        maxTop = coord.top;
                    }
                });

                if (maxLeft + 250 < windowWidth) {
                    vm.fitToScreen = !reset;
                    return;
                }

                vm.slider.value = windowWidth / (maxLeft + 250);
                vm.slider.value = vm.slider.value * 100;
                if (vm.slider.value > 150) {
                    vm.slider.value = 150;
                }
                setFlowDiagramWidth();
            } else {
                vm.slider.value = 100;
                setFlowDiagramWidth();
            }
        }

        vm.$watch("fitToScreen", function () {
            setHeight(false);
        });

        function setFlowDiagramWidth() {
            $("#zoomCn").css("zoom", vm.slider.value / 100);
            $("#zoomCn").css("transform", "Scale(" + vm.slider.value / 100 + ")");
            $("#zoomCn").css("transform-origin", "0 0");
            if (vm.slider.value < 90) {
                $('.rect').css('border-width', '2px');
            }
            else {
                $('.rect').css('border-width', '1px');
            }
        }

        $(window).resize(function () {
            setHeight(false);
        });

        function startAt(order, paramObject) {
            var orders = {};
            orders.orders = [];

            orders.jobschedulerId = $scope.schedulerIds.selected;
            var obj = {};
            obj.orderId = order.orderId;
            obj.jobChain = order.jobChain;
            obj.params = order.params;

            if (order.date && order.time) {
                order.date.setHours(order.time.getHours());
                order.date.setMinutes(order.time.getMinutes());
                order.date.setSeconds(order.time.getSeconds());
            }

            if (order.date && order.at == 'later')
                obj.at = moment.utc(order.date).format();
            else
                obj.at = order.atTime;

            if (!obj.params && paramObject.params.length > 0) {
                obj.params = paramObject.params;
            } else if (obj.params && paramObject.params.length > 0) {
                obj.params.concat(paramObject.params);
            }
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
            orders.orders.push(obj);
            OrderService.startOrder(orders);
        }

        function setOrderState(order) {

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

            orders.orders.push({
                orderId: order.orderId,
                jobChain: order.jobChain,
                state: vm.order.state,
                endState: vm.order.endState
            });

            OrderService.setOrderState(orders);
        }

        function setRunTime(order) {
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
            orders.orders.push({
                orderId: order.orderId,
                jobChain: order.jobChain,
                runTime: vkbeautify.xmlmin(order.runTime)
            });
            OrderService.setRunTime(orders).then(function () {
                var orders = {};
                orders.orders = [];
                orders.jobschedulerId = $scope.schedulerIds.selected;
                orders.orders.push({orderId: order.orderId, jobChain: order.jobChain});
                OrderService.get(orders).then(function (res) {
                    order = angular.merge(order, res.orders[0]);
                });
            });
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
            orders.orders.push({orderId: order.orderId, jobChain: order.jobChain});

            if (orders.params) {
                orders.params.concat(paramObject.params);
            } else {
                orders.params = paramObject.params;
            }
            OrderService.resumeOrder(orders);
        }

        function resumeOrderState(order) {
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
            orders.orders.push({
                orderId: order.orderId,
                jobChain: order.jobChain,
                state: vm.order.state,
                endState: vm.order.endState,
                resume: true
            });

            OrderService.setOrderState(orders);

        }

        function openCalendar() {
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/calendar-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                size: 'lg',
                backdrop: 'static'
            });
        }

        vm.onOrderAction = function (order, action) {
            var modalInstance = '';
            vm.comments = {};
            vm.comments.radio = 'predefined';
            if (action == 'start order now') {
                var orders = {};
                orders.orders = [];
                orders.jobschedulerId = $scope.schedulerIds.selected;
                orders.orders.push({orderId: order.orderId, jobChain: order.jobChain, at: 'now'});
                if (vm.userPreferences.auditLog) {
                    vm.comments.name = order.path;
                    vm.comments.operation = 'Start';
                    vm.comments.type = 'Order';
                    modalInstance = $uibModal.open({
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
                    }, function () {

                    });
                } else {
                    OrderService.startOrder(orders);
                }
            }
            if (action == 'view log') {
                vm.showLogWindow(order);
            }

            if (action == 'start order at') {
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
                vm.order.atTime = 'now';

                modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/start-order-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    startAt(vm.order, vm.paramObject);
                }, function () {

                });
            }

            if (action == 'set order state') {
                vm.order = angular.copy(order);

                JobChainService.getJobChainP({
                    jobschedulerId: $scope.schedulerIds.selected,
                    jobChain: order.jobChain
                }).then(function (res) {
                    vm._jobChain = res.jobChain;
                    angular.forEach(res.jobChain.endNodes, function (value) {
                        if (vm._jobChain.nodes)
                            vm._jobChain.nodes.push(value);
                        else {
                            vm._jobChain.nodes = [];
                            vm._jobChain.nodes.push(value);
                        }
                    });
                });

                modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/set-order-state-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    setOrderState(order);
                }, function () {

                });
            }

            if (action == 'set run time') {
                OrderService.getRunTime({
                    jobschedulerId: $scope.schedulerIds.selected,
                    jobChain: order.jobChain,
                    orderId: order.orderId
                }).then(function (res) {
                    if (res.runTime) {
                        vm.runTimes = res.runTime;
                        vm.xml = vm.runTimes.runTime;
                    }
                    $rootScope.$broadcast('loadXml');
                });

                vm.order = order;

                modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/set-run-time-dialog.html',
                    controller: 'RuntimeEditorDialogCtrl',
                    scope: vm,
                    size: 'lg',
                    backdrop: 'static'
                });

                modalInstance.result.then(function () {
                    setRunTime(order);
                }, function () {

                });
            }

            if (action == 'suspend order') {
                var orders = {};
                orders.orders = [];
                orders.jobschedulerId = $scope.schedulerIds.selected;
                orders.orders.push({orderId: order.orderId, jobChain: order.jobChain});
                if (vm.userPreferences.auditLog) {

                    vm.comments.name = order.path;
                    vm.comments.operation = 'Suspend';
                    vm.comments.type = 'Order';
                    modalInstance = $uibModal.open({
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
                    }, function () {

                    });
                } else {
                    OrderService.suspendOrder(orders);
                }
            }

            if (action == 'resume order') {
                var orders = {};
                orders.orders = [];
                orders.jobschedulerId = $scope.schedulerIds.selected;
                orders.orders.push({orderId: order.orderId, jobChain: order.jobChain});
                if (vm.userPreferences.auditLog) {

                    vm.comments.name = order.path;
                    vm.comments.operation = 'Resume';
                    vm.comments.type = 'Order';
                    modalInstance = $uibModal.open({
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
                    }, function () {

                    });
                } else {
                    OrderService.resumeOrder(orders);
                }
            }

            if (action == 'resume order with param') {
                vm.order = order;
                vm.paramObject = {};
                vm.paramObject.params = [];

                modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/resume-order-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });

                modalInstance.result.then(function () {
                    resumeOrderWithParam(order, vm.paramObject);
                }, function () {

                });
            }

            if (action == 'resume order next state') {
                vm.order = angular.copy(order);

                JobChainService.getJobChainP({
                    jobschedulerId: $scope.schedulerIds.selected,
                    jobChain: order.jobChain
                }).then(function (res) {
                    vm._jobChain = res.jobChain;
                    angular.forEach(res.jobChain.endNodes, function (value) {
                        vm._jobChain.nodes.push(value);
                    });
                });

                modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/resume-order-state-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });

                modalInstance.result.then(function () {
                    resumeOrderState(order);
                }, function () {

                });
            }

            if (action == 'reset order') {
                var orders = {};
                orders.orders = [];
                orders.jobschedulerId = $scope.schedulerIds.selected;
                orders.orders.push({orderId: order.orderId, jobChain: order.jobChain});
                if (vm.userPreferences.auditLog) {

                    vm.comments.name = order.path;
                    vm.comments.operation = 'Reset';
                    vm.comments.type = 'Order';
                    modalInstance = $uibModal.open({
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
                    }, function () {

                    });
                } else {
                    OrderService.resetOrder(orders);
                }
            }

            if (action == 'remove order') {
                var orders = {};
                orders.orders = [];
                orders.jobschedulerId = $scope.schedulerIds.selected;
                orders.orders.push({orderId: order.orderId, jobChain: order.jobChain});
                if (vm.userPreferences.auditLog) {

                    vm.comments.name = order.path;
                    vm.comments.operation = 'Remove';
                    vm.comments.type = 'Order';
                    modalInstance = $uibModal.open({
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
                        OrderService.removeOrder(orders);
                    }, function () {

                    });
                } else {
                    OrderService.removeOrder(orders);
                }
            }

            if (action == 'view calendar') {
                vm._jobChain = order;
                vm._jobChain.name = order.orderId;
                vm.planItems = [];

                DailyPlanService.getPlans({
                    jobschedulerId: $scope.schedulerIds.selected,
                    states: ['PLANNED'],
                    orderId: order.orderId
                }).then(function (res) {
                    vm.planItemData = res.planItems;
                    vm.planItemData.forEach(function (data) {
                        var planData = {
                            planneloadHistorydStartTime: data.plannedStartTime,
                            expectedEndTime: data.expectedEndTime
                        };
                        vm.planItems.push(planData);
                    });
                }, function (err) {
                });
                openCalendar();
            }

            if (action == 'delete order') {
                var orders = {};
                orders.orders = [];
                orders.jobschedulerId = $scope.schedulerIds.selected;
                orders.orders.push({orderId: order.orderId, jobChain: order.jobChain});
                if (vm.userPreferences.auditLog) {

                    vm.comments.name = order.path;
                    vm.comments.operation = 'Delete';
                    vm.comments.type = 'Order';
                    modalInstance = $uibModal.open({
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
                            $scope.$emit('refreshList');
                        });
                    }, function () {

                    });
                } else {
                    OrderService.deleteOrder(orders).then(function () {
                        $scope.$emit('refreshList');
                    });
                }
            }
        };

        $scope.$on('$destroy', function () {
            watcher1();
            if (promise1)
                $timeout.cancel(promise1);
            if (promise2)
                $timeout.cancel(promise2);
        });

    }

    JobChainDetailsCtrl.$inject = ["$scope", "SOSAuth", "ScheduleService", "JobChainService", "$uibModal", "OrderService", "toasty", "$rootScope", "DailyPlanService", "$location", "gettextCatalog", "CoreService", "$timeout"];
    function JobChainDetailsCtrl($scope, SOSAuth, ScheduleService, JobChainService, $uibModal, OrderService, toasty, $rootScope, DailyPlanService, $location, gettextCatalog, CoreService, $timeout) {
        var vm = $scope;
        vm.orderFilters = CoreService.getOrderDetailTab();
        var object = $location.search();

        vm.reset = function () {
            vm.object = {};
        };
        function volatileInfo(draw) {
            JobChainService.getJobChain({
                jobschedulerId: $scope.schedulerIds.selected,
                jobChain: vm.path,
                maxOrders: vm.userPreferences.maxOrderPerJobchain
            }).then(function (res) {
                vm.jobChain.fileOrderSources = [];
                var temp = [];
                temp = angular.merge({}, vm.jobChain, res.jobChain);
                temp.nodes = [];
                angular.forEach(vm.jobChain.nodes, function (node1) {
                    if (node1.orders && node1.orders.length > 0) {
                        node1.orders = [];
                    }
                    angular.forEach(res.jobChain.nodes, function (node2) {
                        if (node1.name == node2.name) {
                            temp.nodes.push(angular.merge(node1, node2));
                        }
                    });
                });

                var temp2 = [];
                if (vm.jobChain.nestedJobChains && vm.jobChain.nestedJobChains.length > 0) {
                    angular.forEach(vm.jobChain.nestedJobChains, function (chain1) {
                        angular.forEach(res.nestedJobChains, function (chain2) {
                            if (chain1.path == chain2.path)
                                temp2.push(angular.merge(chain1, chain2));
                        });
                    });
                } else {
                    temp2 = res.nestedJobChains;
                }
                vm.jobChain = temp;
                vm.jobChain.nestedJobChains = temp2;
                angular.forEach(vm.jobChain.nodes, function (node1, index) {
                    angular.forEach(vm.jobChain.nestedJobChains, function (chain1) {
                        if (node1.jobChain.path == chain1.path) {
                            vm.jobChain.nodes[index].jobChain = chain1;
                        }
                    });
                });
                SOSAuth.setJobChain(JSON.stringify(vm.jobChain));
                SOSAuth.save();
                if (draw) {
                    $rootScope.$broadcast('drawJobChainFlowDiagram');
                } else {
                    $rootScope.$broadcast('reloadJobChain');
                }

            }, function () {
                SOSAuth.setJobChain(JSON.stringify(vm.jobChain));
                SOSAuth.save();

                if (draw) {
                    $rootScope.$broadcast('drawJobChainFlowDiagram');
                } else {
                    $rootScope.$broadcast('reloadJobChain');
                }
            });
        }

        $scope.$on('refreshList', function (event) {
            volatileInfo();
        });

        $scope.$on('showNested', function (event) {
            object = $location.search();
            getPermanent();
        });

        getPermanent();

        function getPermanent() {

            if (object.path) {
                vm.path = object.path;
                if (vm.path.substring(0, 1) == '/')
                    vm.paths = vm.path.substring(1, vm.path.length).split('/');
                else
                    vm.paths = vm.path.split('/');

                if (SOSAuth.jobChain) {
                    vm.jobChain = JSON.parse(SOSAuth.jobChain);
                }
                JobChainService.getJobChainP({
                    jobschedulerId: $scope.schedulerIds.selected,
                    jobChain: vm.path
                }).then(function (result) {
                    vm.jobChain = result.jobChain;
                    vm.jobChain.nestedJobChains = result.nestedJobChains;
                    volatileInfo('draw');
                });

            } else {
                toasty.error({
                    title: '',
                    msg: gettextCatalog.getString('message.incorrectJobChainPath'),
                    timeout: 0
                });
                window.history.back();
            }
        }


        $rootScope.expand_to = '';
        vm.setPath = function (path) {
            $rootScope.expand_to = {
                name: path,
                path: vm.path
            };
            $location.path('/job_chains')
        };
        var t1 = '';
        $scope.$on('$stateChangeSuccess', function (event, toState, param, fromState) {
            vm.object = {};
            vm.orderFilters.isOverview = toState.url == '/overview';
            if (vm.orderFilters.isOverview && fromState.name == 'app.jobChainDetails.orders') {
                t1 = $timeout(function () {
                    $rootScope.$broadcast('drawJobChainFlowDiagram');
                    $timeout.cancel(t1);
                }, 200);
            }

        });

        $scope.$on('$destroy', function () {
            if (t1) {
                $timeout.cancel(t1);
            }
        });


        vm.viewJobChainOrder = function () {
            $location.path('/job_chain_detail/orders').search({path: vm.path});
        };

        vm.viewJobChainDetail = function () {
            $location.path('/job_chain_detail/overview').search({path: vm.path});
        };

        vm.sortBy = function (propertyName) {
            vm.object.orders = [];
            vm.orderFilters.reverse = !vm.orderFilters.reverse;
            vm.orderFilters.filter.sortBy = propertyName;
        };


        vm.viewCalendar = function (nestedJobChain) {
            vm.maxPlannedTime = undefined;
            vm.isCaledarLoading = true;
            vm._jobChain = nestedJobChain ? nestedJobChain : vm.jobChain;
            vm.planItems = [];
            DailyPlanService.getPlans({
                jobschedulerId: $scope.schedulerIds.selected,
                states: ['PLANNED'],
                jobChain: vm._jobChain.path
            }).then(function (res) {
                vm.planItemData = res.planItems;
                vm.planItemData.forEach(function (data) {
                    var planData = {
                        plannedStartTime: data.plannedStartTime,
                        expectedEndTime: data.expectedEndTime,
                        orderId: data.orderId
                    };
                    vm.planItems.push(planData);
                    if (!vm.maxPlannedTime || new Date(data.plannedStartTime) > vm.maxPlannedTime) {
                        vm.maxPlannedTime = new Date(data.plannedStartTime);
                    }
                });
                vm.isCaledarLoading = false;
            }, function (err) {
                vm.isCaledarLoading = false;
            });
            openCalendar();
            vm.object.jobChains = [];
        };


        vm.showCalendar = vm.viewCalendar;

        function openCalendar() {
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/calendar-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                size: 'lg',
                backdrop: 'static'
            });
        }

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

            if (order.fromDate && order.at == 'later') {
                obj.at = moment.utc(order.fromDate).format();
            } else {
                obj.at = order.atTime;
            }

            if (paramObject && paramObject.params.length > 0) {
                obj.params = paramObject.params;
            }
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
            orders.orders.push(obj);
            OrderService.addOrder(orders);
            vm.object.orders = [];

        }

        vm.addOrder = function (path) {
            ScheduleService.getSchedulesP({
                jobschedulerId: $scope.schedulerIds.selected,
                compact: true
            }).then(function (res) {
                vm.schedules = res.schedules;
            });

            vm._jobChain = angular.copy(vm.jobChain);

            JobChainService.getJobChainP({
                jobschedulerId: vm.schedulerIds.selected,
                jobChain: path ? path : vm.jobChain.path
            }).then(function (res) {
                vm._jobChain = res.jobChain;
            });
            vm.order = {};
            vm.paramObject = {};
            vm.paramObject.params = [];
            vm.order.atTime = 'now';
            vm.comments = {};
            vm.comments.radio = 'predefined';

            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/add-order-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                addOrder(vm.order, vm.paramObject);
            }, function () {
                vm.object.orders = [];
            });
        };

        vm.stopJob = function (path) {
            var jobChains = {};
            jobChains.jobChains = [];
            jobChains.jobschedulerId = $scope.schedulerIds.selected;
            jobChains.jobChains.push({jobChain: path ? path : vm.jobChain.path});
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = path ? path : vm.jobChain.path;
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

                    vm.reset();
                });
            } else {

                JobChainService.stop(jobChains);

                vm.reset();
            }

        };

        vm.viewFlowDiagram = function (jobChain) {
            SOSAuth.setJobChain(JSON.stringify(jobChain));
            SOSAuth.save();
            $location.path('/job_chain_detail/overview').search({path: jobChain.path});
            if ($('#mainContainer')) {
                $('#mainContainer').remove();
            }

            $scope.$broadcast('showNested');
            vm.orderFilters.pageView = 'grid';
        };

        vm.stopJobChain = vm.stopJob;
        vm.unstopJob = function (path) {
            var jobChains = {};
            jobChains.jobChains = [];
            jobChains.jobschedulerId = $scope.schedulerIds.selected;
            jobChains.jobChains.push({jobChain: path ? path : vm.jobChain.path});
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = path ? path : vm.jobChain.path;
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
                    vm.reset();
                });
            } else {

                JobChainService.unstop(jobChains);
                vm.reset();
            }

        };

        vm.unstopJobChain = vm.unstopJob;

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
                            for (var j = 0; j < vm.orders.length; j++) {
                                if (vm.object.orders[i].path == vm.orders[j].path) {
                                    vm.orders.splice(j, 1);
                                    break;
                                }
                            }

                        }
                        vm.reset();
                    });
                }, function () {
                    vm.reset();
                });
            } else {
                OrderService.deleteOrder(orders).then(function (res) {
                    for (var i = 0; i < vm.object.orders.length; i++) {
                        for (var j = 0; j < vm.orders.length; j++) {
                            if (vm.object.orders[i].path == vm.orders[j].path) {
                                vm.orders.splice(j, 1);
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
                    vm.reset();
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
                    vm.reset();
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
                    vm.reset();
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
                    vm.reset();
                });
            } else {
                OrderService.startOrder(orders);
                vm.reset();
            }

        };

        $scope.$on('event-started', function () {
            if (vm.events && vm.events[0] && vm.events[0].eventSnapshots)
                for (var i = 0; i < vm.events[0].eventSnapshots.length; i++) {
                    if (vm.events[0].eventSnapshots[i].path == vm.jobChain.path && vm.events[0].eventSnapshots[i].eventType == "FileBasedRemoved") {
                        $location.path('/job_chains');
                        break;
                    }
                    if (vm.events[0].eventSnapshots[i].path != undefined && (vm.events[0].eventSnapshots[i].eventType == 'JobChainStateChanged' || vm.events[0].eventSnapshots[i].eventType == 'JobStateChanged' || ((vm.events[0].eventSnapshots[i].eventType == 'FileBasedActivated' || vm.events[0].eventSnapshots[i].eventType == "FileBasedRemoved") && (vm.events[0].eventSnapshots[i].objectType == "JOBCHAIN" || vm.events[0].eventSnapshots[i].objectType == "ORDER")) && !vm.events[0].eventSnapshots[i].eventId)) {
                        var path = [];
                        if (vm.events[0].eventSnapshots[i].path.indexOf(",") > -1) {
                            path = vm.events[0].eventSnapshots[i].path.split(",");
                        } else {
                            path[0] = vm.events[0].eventSnapshots[i].path;
                        }

                        var flag = false;
                        if (vm.jobChain.nodes && vm.jobChain.nodes.length > 0) {
                            for (var m = 0; m < vm.jobChain.nodes.length; m++) {
                                if (vm.jobChain.nodes[m].job && path[0] == vm.jobChain.nodes[m].job.path) {
                                    flag = true;
                                    break;
                                }
                                if (vm.jobChain.nodes[m].jobChain && path[0] == vm.jobChain.nodes[m].jobChain.path) {
                                    flag = true;
                                    break;
                                }
                            }
                        }
                        if (vm.jobChain.path == path[0] || flag) {
                            volatileInfo();
                        }
                        break;
                    }
                }
        });
    }

    OrderCtrl.$inject = ["$scope", "$rootScope", "OrderService", "UserService", "orderByFilter", "$uibModal", "SavedFilter", "CoreService", "$timeout", "AuditLogService", "$location"];
    function OrderCtrl($scope, $rootScope, OrderService, UserService, orderBy, $uibModal, SavedFilter, CoreService, $timeout, AuditLogService, $location) {
        var vm = $scope;

        vm.orderFilters = CoreService.getOrderTab();

        vm.tree = [];
        vm.allOrders = [];

        vm.my_tree = {};

        vm.object = {};
        vm.filter_tree = {};
        vm.filterTree1 = [];
        vm.object.paths = [];

        vm.selectedFiltered;
        vm.temp_filter = {};

        vm.reset = function () {
            vm.object = {};
        };

        vm.savedOrderFilter = JSON.parse(SavedFilter.orderFilters) || {};
        vm.orderFilterList = [];

        if (vm.orderFilters.selectedView) {
            vm.savedOrderFilter.selected = vm.savedOrderFilter.selected || vm.savedOrderFilter.favorite;
        }
        else {
            vm.savedOrderFilter.selected = undefined;
        }

        vm.expanding_property = {
            field: "name"
        };

        if ($location.search().scheduler_id && $location.search().path) {
            vm.checkSchedulerId();
            getOrderByPath($location.search().path);
        } else {
            checkSharedFilters();
        }

        function getOrderByPath(path) {
            var jobChain = [];
            if (path.indexOf(",") > -1) {
                jobChain = path.split(",");
            }

            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.compact = true;
            obj.orders = [{jobChain: jobChain[0], orderId: jobChain[1]}];
            OrderService.getOrdersP(obj).then(function (result) {
                vm.orders = result.orders;
                getOrderByPathV(obj);
                vm.isLoading = true;
            }, function () {
                getOrderByPathV(obj);
                vm.isLoading = true;
            });
        }

        function getOrderByPathV(obj) {
            OrderService.get(obj).then(function (res) {
                if (vm.orders) {
                    vm.orders = angular.merge(vm.orders, res.orders)
                } else {
                    vm.orders = res.orders;
                }
            });
        }

        function checkSharedFilters() {
            if (vm.permission.JOCConfigurations.share.view) {
                var obj = {};
                obj.jobschedulerId = vm.schedulerIds.selected;
                obj.configurationType = "CUSTOMIZATION";
                obj.objectType = "ORDER";
                obj.shared = true;
                UserService.configurations(obj).then(function (res) {
                    if (res.configurations && res.configurations.length > 0)
                        vm.orderFilterList = res.configurations;
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
            obj.objectType = "ORDER";
            UserService.configurations(obj).then(function (res) {

                if (vm.orderFilterList && vm.orderFilterList.length > 0) {
                    if (res.configurations && res.configurations.length > 0) {
                        vm.orderFilterList = vm.orderFilterList.concat(res.configurations);
                    }
                    var data = [];

                    for (var i = 0; i < vm.orderFilterList.length; i++) {
                        var flag = true;
                        for (var j = 0; j < data.length; j++) {
                            if (data[j].account == vm.orderFilterList[i].account && data[j].name == vm.orderFilterList[i].name) {
                                flag = false;
                            }
                        }
                        if (flag) {
                            data.push(vm.orderFilterList[i]);
                        }
                    }
                    vm.orderFilterList = data;
                } else {
                    vm.orderFilterList = res.configurations;
                }
                if (vm.savedOrderFilter.selected) {
                    var flag = true;
                    angular.forEach(vm.orderFilterList, function (value) {
                        if (value.id == vm.savedOrderFilter.selected) {
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
                        vm.savedOrderFilter.selected = undefined;
                        initTree();
                    }
                } else {
                    vm.savedOrderFilter.selected = undefined;
                    initTree();
                }

            }, function (err) {
                vm.savedOrderFilter.selected = undefined;
                initTree();
            })
        }

        vm.exportToExcel = function () {
            $rootScope.$broadcast('exportData');
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
            if(vm.selectedFiltered){
                 isCustomizationSelected(true);
            }

            OrderService.tree({
                jobschedulerId: vm.schedulerIds.selected,
                compact: true,
                folders: folders,
                types: ['ORDER']
            }).then(function (res) {
                if ($rootScope.order_expand_to) {
                    vm.tree = angular.copy(res.folders);
                    filteredTreeData();
                } else {
                    if (vm.isEmpty(vm.orderFilters.expand_to)) {
                        vm.tree = angular.copy(res.folders);
                        filteredTreeData();
                    } else {
                        vm.orderFilters.expand_to = vm.recursiveTreeUpdate(angular.copy(res.folders), vm.orderFilters.expand_to);
                        vm.tree = vm.orderFilters.expand_to;
                        vm.changeStatus();
                    }
                }
                vm.orderFilters.expand_to = vm.tree;

                vm.isLoading = true;
            }, function (err) {
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
            if (vm.showLogPanel && (vm.showLogPanel.path1 != data.path)) {
                vm.hideLogPanel();
            }
            data.selected1 = true;
            data.orders = [];
            vm.allOrders = [];
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
            if (vm.showLogPanel && (vm.showLogPanel.path1 != data.path)) {
                vm.hideLogPanel();
            }
            vm.allOrders = [];
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
            OrderService.getOrdersP(obj).then(function (result) {
                vm.orders = result.orders;
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
            vm.allOrders = [];
            function recursive(data) {
                data.expanded = true;
                data.folders = orderBy(data.folders, 'name');

                data.orders = [];
                angular.forEach(vm.orders, function (value) {
                    if (data.path == value.path.substring(0, value.path.lastIndexOf('/')) || data.path == value.path.substring(0, value.path.lastIndexOf('/') + 1)) {
                        data.orders.push(value);
                        value.path1 = data.path;
                        vm.allOrders.push(value);
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
            }
            obj.folders = [{folder: data.path, recursive: false}];
            OrderService.getOrdersP(obj).then(function (result) {
                data.orders = result.orders;
                volatileFolderData(data, obj);
            }, function () {
                volatileFolderData(data, obj);
                vm.loading = false;
            });
        }

        function expandFolderData1(data) {

            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.compact = true;
            if (vm.selectedFiltered) {
                obj.regex = vm.selectedFiltered.regex;
            }
            obj.folders = [{folder: data.path, recursive: false}];
            OrderService.getOrdersP(obj).then(function (result) {
                data.orders = result.orders;
                volatileFolderData1(data, obj);
            }, function () {
                volatileFolderData1(data, obj);
                vm.loading = false;
            });
        }

        function volatileFolderData(data, obj) {

            if (vm.selectedFiltered) {
                obj = parseDate(obj);
            } else {
                if (vm.orderFilters.filter.state != 'ALL') {
                    obj.processingStates = [];
                    obj.processingStates.push(vm.orderFilters.filter.state);
                }
            }
            OrderService.get(obj).then(function (res) {
                var data1 = [];
                if (data.orders && data.orders.length > 0) {
                    angular.forEach(data.orders, function (orders) {

                        for (var i = 0; i < res.orders.length; i++) {
                            if (orders.path == res.orders[i].path) {
                                res.orders[i].title = angular.copy(orders.title);
                                res.orders[i].path1 = angular.copy(orders.path1);
                                res.orders[i].show = angular.copy(orders.show);
                                orders = res.orders[i];
                                data1.push(orders);
                                res.orders.splice(i, 1);
                                break;
                            }
                        }
                    });
                    data1 = data1.concat(res.orders);
                    data.orders = data1;
                } else {
                    data.orders = res.orders;
                }

                if (data.orders.length > 0) {
                    angular.forEach(data.orders, function (value) {
                        var flag = true;
                        value.path1 = data.path;

                        for (var i = 0; i < vm.allOrders; i++) {
                            if (value.path == vm.allOrders[i].path) {
                                flag = false;
                                break;
                            }
                        }
                        if (flag)
                            vm.allOrders.push(value);
                    });
                }
                vm.folderPath = data.name || '/';

                vm.loading = false;
            }, function () {
                if (data.orders.length > 0) {
                    angular.forEach(data.orders, function (value) {
                        var flag = true;
                        value.path1 = data.path;

                        for (var i = 0; i < vm.allOrders; i++) {
                            if (value.path == vm.allOrders[i].path) {
                                flag = false;
                                break;
                            }
                        }
                        if (flag)
                            vm.allOrders.push(value);
                    });
                }
                vm.loading = false;
                vm.folderPath = data.name || '/';
            });
        }

        function volatileFolderData1(data, obj) {

            if (vm.selectedFiltered) {
                obj = parseDate(obj);
            } else {
                if (vm.orderFilters.filter.state != 'ALL') {
                    obj.processingStates = [];
                    obj.processingStates.push(vm.orderFilters.filter.state);
                }
            }

            OrderService.get(obj).then(function (res) {

                var data1 = [];
                if (data.orders && data.orders.length > 0) {
                    angular.forEach(data.orders, function (orders) {

                        for (var i = 0; i < res.orders.length; i++) {
                            if (orders.path == res.orders[i].path) {
                                res.orders[i].title = angular.copy(orders.title);
                                res.orders[i].path1 = angular.copy(orders.path1);
                                res.orders[i].show = angular.copy(orders.show);
                                orders = res.orders[i];
                                data1.push(orders);
                                res.orders.splice(i, 1);
                                break;
                            }
                        }
                    });
                    data1 = data1.concat(res.orders);
                    data.orders = data1;
                } else {
                    data.orders = res.orders;
                }
                var temp = [];
                if (data.orders.length > 0) {

                    for (var x = 0; x < vm.allOrders.length; x++) {
                        if (vm.allOrders[x].path1 != data.path) {
                            temp.push(vm.allOrders[x]);
                        }
                    }
                    angular.forEach(data.orders, function (value) {
                        value.path1 = data.path;
                        temp.push(value);
                    });
                }
                vm.allOrders = temp;
                vm.folderPath = data.name || '/';

                vm.loading = false;
            }, function () {
                var temp = [];
                if (data.orders.length > 0) {

                    for (var x = 0; x < vm.allOrders.length; x++) {
                        if (vm.allOrders[x].path1 != data.path) {
                            temp.push(vm.allOrders[x]);
                        }
                    }
                    angular.forEach(data.orders, function (value) {
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
                vm.allOrders = temp;
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
                data.orders = [];
                expandFolderData(data);

                vm.folderPath = data.name || '/';
                angular.forEach(data.orders, function (a) {
                    a.path1 = data.path;
                    vm.allOrders.push(a);
                });
            }
            data.folders = orderBy(data.folders, 'name');
            angular.forEach(data.folders, function (value) {

                if (vm.expand_to) {

                    if (vm.flag && value.path.substring(1, value.path.length) == splitPath[i] && i < splitPath.length) {
                        i = i + 1;
                        splitPath[i] = splitPath[i - 1] + '/' + splitPath[i];

                        value.expanded = true;
                        if (vm.expand_to.name == value.name) {
                            value.selected1 = true;
                            vm.flag = false;
                            i = 1;
                            splitPath = [];

                        }
                    }
                }

                checkExpand(value);
                if (value.expanded || value.selected1) {
                    if (data.path == '/') {
                        data.selected1 = false;
                    }
                }
            });
        }


        function filteredTreeData() {
            angular.forEach(vm.tree, function (value) {
                if ($rootScope.order_expand_to) {
                    vm.expand_to = angular.copy($rootScope.order_expand_to);
                    splitPath = vm.expand_to.path.split('/');
                    $rootScope.order_expand_to = '';
                    vm.flag = true;
                }
                if (splitPath.length < 2) {
                    value.selected1 = true;
                }
                value.expanded = true;

                vm.allOrders = [];
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
            node.orders = [];

            for (var i = 0; i < x.length; i++) {

                var p = [];
                if (x[i].path.indexOf(",") > -1) {
                    p = x[i].path.split(",");
                } else {
                    p[0] = x[i].path;
                }
                if (node.path == p[0].substring(0, p[0].lastIndexOf('/')) || p[0].substring(0, p[0].lastIndexOf('/')) == '') {
                    x[i].path1 = node.path;
                    node.orders.push(x[i]);
                    vm.allOrders.push(x[i]);
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
            if (vm.selectedFiltered.type) {
                obj.types = vm.selectedFiltered.type;
            }
            if (vm.selectedFiltered.processingState) {
                obj.processingState = vm.selectedFiltered.processingState;
            }
            if (vm.selectedFiltered.planned) {
                if (/^\s*(now\s*\+)\s*(\d+)\s*$/i.test(vm.selectedFiltered.planned)) {
                    fromDate = new Date();
                    toDate = new Date();
                    var seconds = parseInt(/^\s*(now\s*\+)\s*(\d+)\s*$/i.exec(vm.selectedFiltered.planned)[2]);
                    toDate.setSeconds(toDate.getSeconds() + seconds);
                } else if (/^\s*\d+[d,h]\s*$/i.test(vm.selectedFiltered.planned)) {
                    obj.dateFrom = vm.selectedFiltered.planned;
                } else if (/^\s*(Today)\s*$/i.test(vm.selectedFiltered.planned)) {
                    fromDate = new Date();
                    fromDate.setHours(0);
                    fromDate.setMinutes(0);
                    fromDate.setSeconds(0);
                    fromDate.setMilliseconds(0);
                    toDate = new Date();
                    toDate.setDate(toDate.getDate() + 1);
                    toDate.setHours(0);
                    toDate.setMinutes(0);
                    toDate.setSeconds(0);
                    toDate.setMilliseconds(0);
                } else if (/^\s*(now)\s*$/i.test(vm.selectedFiltered.planned)) {
                    fromDate = new Date();
                    toDate = new Date();
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
            if (vm.selectedFiltered.fromDate) {
                fromDate = new Date(vm.selectedFiltered.fromDate);
                if (vm.selectedFiltered.fromTime) {
                    vm.selectedFiltered.fromTime = new Date(vm.selectedFiltered.fromTime);
                    fromDate.setHours(vm.selectedFiltered.fromTime.getHours());
                    fromDate.setMinutes(vm.selectedFiltered.fromTime.getMinutes());
                    fromDate.setSeconds(vm.selectedFiltered.fromTime.getSeconds());
                } else {
                    fromDate.setHours(0);
                    fromDate.setMinutes(0);
                    fromDate.setSeconds(0);
                    fromDate.setMilliseconds(0);
                }

            }
            if (vm.selectedFiltered.toDate) {
                toDate = new Date(vm.selectedFiltered.toDate);
                if (vm.selectedFiltered.toTime) {

                    vm.selectedFiltered.toTime = new Date(vm.selectedFiltered.toTime);
                    toDate.setHours(vm.selectedFiltered.toTime.getHours());
                    toDate.setMinutes(vm.selectedFiltered.toTime.getMinutes());
                    toDate.setSeconds(vm.selectedFiltered.toTime.getSeconds());
                } else {
                    toDate.setHours(0);
                    toDate.setMinutes(0);
                    toDate.setSeconds(0);
                    toDate.setMilliseconds(0);
                }
            }

            if (fromDate && toDate) {
                obj.dateFrom = fromDate;
                obj.dateTo = toDate;
            }

            return obj;
        }


        function volatileInformation(obj, expandNode) {
            if (vm.selectedFiltered) {
                obj = parseDate(obj);
            } else {
                if (vm.orderFilters.filter.state != 'ALL') {
                    obj.processingStates = [];
                    obj.processingStates.push(vm.orderFilters.filter.state);
                }
            }
            OrderService.get(obj).then(function (res) {

                var data = [];
                if (vm.orders && vm.orders.length > 0) {
                    angular.forEach(vm.orders, function (order) {

                        for (var i = 0; i < res.orders.length; i++) {
                            if (order.path == res.orders[i].path) {
                                res.orders[i].title = angular.copy(order.title);
                                res.orders[i].path1 = angular.copy(order.path1);
                                res.orders[i].show = angular.copy(order.show);
                                order = res.orders[i];
                                data.push(order);
                                res.orders.splice(i, 1);
                                break;
                            }
                        }
                    });
                    data = data.concat(res.orders);
                    vm.orders = data;
                } else {
                    vm.orders = res.orders;
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
            vm.hideLogPanel();
            vm.allOrders = [];
            vm.loading = true;
            obj = {folders: []};
            obj1 = {folders: []};


            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.compact = true;

            if (vm.selectedFiltered) {
                obj.regex = vm.selectedFiltered.regex;
            } else {
                if (vm.orderFilters.filter.state != 'ALL') {
                    obj.processingStates = [];
                    obj.processingStates.push(vm.orderFilters.filter.state);
                }
            }

            obj1.jobschedulerId = vm.schedulerIds.selected;
            obj1.compact = true;
            if (vm.selectedFiltered) {
                obj1.regex = vm.selectedFiltered.regex;
            }

            angular.forEach(vm.tree, function (value) {
                if (value.expanded || value.selected1)
                    checkExpandTreeForUpdates(value);
            });

            OrderService.getOrdersP(obj1).then(function (result) {
                OrderService.get(obj).then(function (res) {
                    if (result.orders && result.orders.length > 0) {
                        var x = [];
                        angular.forEach(result.orders, function (orders) {
                            for (var i = 0; i < res.orders.length; i++) {
                                if (orders.path == res.orders[i].path) {
                                    res.orders[i].title = angular.copy(orders.title);
                                    res.orders[i].show = angular.copy(orders.show);
                                    orders = res.orders[i];
                                    x.push(orders);
                                    res.orders.splice(i, 1);
                                    break;
                                }
                            }

                        });

                        x = x.concat(res.orders);

                        angular.forEach(vm.tree, function (node, index) {
                            insertData(node, x);
                        })
                    } else {
                        angular.forEach(vm.tree, function (node, index) {
                            insertData(node, res.orders);
                        })
                    }
                    vm.loading = false;

                }, function () {
                    vm.loading = false;
                    angular.forEach(vm.tree, function (node, index) {
                        insertData(node, result.orders);
                    })
                });
            }, function () {
                vm.loading = false;
                OrderService.get(obj).then(function (res) {
                    if (res.orders) {
                        angular.forEach(vm.tree, function (node, index) {
                            insertData(node, res.orders);
                        })
                    }
                });
            });
        };

        vm.load = function () {
            initTree();
        };

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


        if (vm.orderFilters && vm.orderFilters.showLogPanel) {
            vm.showLogFuc(vm.orderFilters.showLogPanel);
        }

        vm.hideLogPanel = function () {
            vm.showLogPanel = undefined;
            vm.orderFilters.showLogPanel = vm.showLogPanel;
        };


        /**---------------filter, sorting and pagination -------------------*/
        vm.sortBy = function (propertyName) {
            vm.reset();
            vm.orderFilters.reverse = !vm.orderFilters.reverse;
            vm.orderFilters.filter.sortBy = propertyName;
        };
        function parseDateForSearch(obj) {
            var fromDate;
            var toDate;
            if (vm.orderFilter1.type) {
                obj.types = vm.orderFilter1.type;
            }
            if (vm.orderFilter1.planned) {
                if (/^\s*(now\s*\+)\s*(\d+)\s*$/i.test(vm.orderFilter1.planned)) {
                    fromDate = new Date();
                    toDate = new Date();
                    var seconds = parseInt(/^\s*(now\s*\+)\s*(\d+)\s*$/i.exec(vm.orderFilter1.planned)[2]);
                    toDate.setSeconds(toDate.getSeconds() + seconds);
                } else if (/^\s*\d+[d,h]\s*$/i.test(vm.orderFilter1.planned)) {
                    obj.dateFrom = vm.orderFilter1.planned;
                } else if (/^\s*(Today)\s*$/i.test(vm.orderFilter1.planned)) {
                    fromDate = new Date();
                    fromDate.setHours(0);
                    fromDate.setMinutes(0);
                    fromDate.setSeconds(0);
                    fromDate.setMilliseconds(0);
                    toDate = new Date();
                    toDate.setDate(toDate.getDate() + 1);
                    toDate.setHours(0);
                    toDate.setMinutes(0);
                    toDate.setSeconds(0);
                    toDate.setMilliseconds(0);
                } else if (/^\s*(now)\s*$/i.test(vm.orderFilter1.planned)) {
                    fromDate = new Date();
                    toDate = new Date();
                } else if (/^\s*(\d+):(\d+)\s*(am|pm)\s*to\s*(\d+):(\d+)\s*(am|pm)\s*$/i.test(vm.orderFilter1.planned)) {
                    var time = /^\s*(\d+):(\d+)\s*(am|pm)\s*to\s*(\d+):(\d+)\s*(am|pm)\s*$/i.exec(vm.orderFilter1.planned);
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

            if (vm.orderFilter1.fromDate) {
                fromDate = new Date(vm.orderFilter1.fromDate);
                if (vm.orderFilter1.fromTime) {
                    vm.orderFilter1.fromTime = new Date(vm.orderFilter1.fromTime);
                    fromDate.setHours(vm.orderFilter1.fromTime.getHours());
                    fromDate.setMinutes(vm.orderFilter1.fromTime.getMinutes());
                    fromDate.setSeconds(vm.orderFilter1.fromTime.getSeconds());
                } else {
                    fromDate.setHours(0);
                    fromDate.setMinutes(0);
                    fromDate.setSeconds(0);
                    fromDate.setMilliseconds(0);
                }

            }
            if (vm.orderFilter1.toDate) {
                toDate = new Date(vm.orderFilter1.toDate);
                if (vm.orderFilter1.toTime) {
                    vm.orderFilter1.toTime = new Date(vm.orderFilter1.toTime);
                    toDate.setHours(vm.orderFilter1.toTime.getHours());
                    toDate.setMinutes(vm.orderFilter1.toTime.getMinutes());
                    toDate.setSeconds(vm.orderFilter1.toTime.getSeconds());
                } else {
                    toDate.setHours(0);
                    toDate.setMinutes(0);
                    toDate.setSeconds(0);
                    toDate.setMilliseconds(0);
                }
            }

            if (fromDate && toDate) {
                obj.dateFrom = fromDate;
                obj.dateTo = toDate;
            }

            return obj;
        }

        vm.saveAsFilter = function (form) {
            if (vm.orderFilter1.radio == 'current') {
                vm.orderFilter1.fromDate = undefined;
                vm.orderFilter1.fromTime = undefined;
                vm.orderFilter1.toDate = undefined;
                vm.orderFilter1.toTime = undefined;
                vm.orderFilter1.planned = undefined;
            } else if (vm.orderFilter1.radio == 'planned') {
                vm.orderFilter1.processingState = undefined;
            }
            var configObj = {};
            configObj.jobschedulerId = vm.schedulerIds.selected;
            configObj.account = vm.permission.user;
            configObj.configurationType = "CUSTOMIZATION";
            configObj.objectType = "ORDER";
            configObj.id = 0;
            configObj.name = vm.orderFilter1.name;
            // configObj.shared = vm.orderFilter1.shared;

            configObj.configurationItem = JSON.stringify(vm.orderFilter1);
            UserService.saveConfiguration(configObj).then(function (res) {
                configObj.id = res.id;
                vm.orderFilter1.name = '';
                if (form)
                    form.$setPristine();
                vm.orderFilterList.push(configObj);
            });
        };
        vm.advancedSearch = function () {
            vm.isUnique = true;
            vm.showSearchPanel = true;
            vm.orderFilter1 = {};
        };
        vm.cancel = function (form) {
            vm.showSearchPanel = false;
            vm.orderFilter1 = undefined;
            if (form)
                form.$setPristine();
        };

        function searchV(obj) {
            if (vm.orderFilter1.processingState) {
                obj.processingStates = vm.orderFilter1.processingState;
            }
            obj = parseDateForSearch(obj);
            OrderService.get(obj).then(function (res) {
                var data = [];
                if (vm.orders && vm.orders.length > 0) {
                    angular.forEach(vm.orders, function (orders) {
                        for (var i = 0; i < res.orders.length; i++) {
                            if (orders.path == res.orders[i].path) {
                                orders = angular.merge(orders, res.orders[i]);
                                orders.path1 = orders.path.substring(0, orders.path.lastIndexOf('/'));
                                data.push(orders);
                                res.orders.splice(i, 1);
                                break;
                            }
                        }
                    });
                    data = data.concat(res.orders);
                } else {
                    for (var i = 0; i < res.orders.length; i++) {
                        res.orders[i].path1 = res.orders[i].path.substring(0, res.orders[i].path.lastIndexOf('/'));
                        data.push(res.orders[i]);
                    }
                }
                vm.orders = data;
                vm.allOrders = vm.orders;

                traverseTreeForSearchData();
            }, function () {
                angular.forEach(vm.orders, function (job) {
                    job.path1 = jobChainData.path.substring(0, job.path.lastIndexOf('/'));
                });
                vm.allOrders = vm.orders;
                traverseTreeForSearchData();
            });

        }

        vm.search = function () {

            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.compact = true;
            if (vm.orderFilter1.regex) {
                obj.regex = vm.orderFilter1.regex;
            }
            if (vm.orderFilter1.paths && vm.orderFilter1.paths.length > 0) {
                obj.folders = [];
                for (var i = 0; i < vm.orderFilter1.paths.length; i++) {
                    obj.folders.push({folder: vm.orderFilter1.paths[i], recursive: false});
                }
            }

            OrderService.getOrdersP(obj).then(function (result) {
                vm.orders = result.orders;
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
                    data.folders[i].orders = [];
                    pushJobChain(data.folders[i]);
                    traverseTree1(data.folders[i]);
                }
            }

            function navFullTree() {
                for (var i = 0; i < vm.tree.length; i++) {
                    vm.tree[i].selected1 = true;
                    vm.tree[i].expanded = true;
                    vm.tree[i].orders = [];
                    pushJobChain(vm.tree[i]);
                    traverseTree1(vm.tree[i]);
                }
            }

            function pushJobChain(data) {
                angular.forEach(vm.orders, function (jobChain) {
                    if (data.path == jobChain.path1) {
                        data.selected1 = true;
                        data.orders.push(jobChain);
                    }
                });
            }

            navFullTree();
        }

        function isCustomizationSelected(flag) {
            if (flag) {
                vm.temp_filter.state = angular.copy(vm.orderFilters.filter.state);
                vm.orderFilters.filter.state = '';
            } else {
                if(vm.temp_filter.state)
                vm.orderFilters.filter.state = angular.copy(vm.temp_filter.state);
                else
                vm.orderFilters.filter.state = 'ALL';
            }
        }

        vm.applyFilter = function () {
            vm.cancel();
            vm.orderFilter1 = {};
            vm.isUnique = true;

            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/order-filter-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                size: 'lg',
                backdrop: 'static'
            });
            modalInstance.result.then(function () {

                if (vm.orderFilter1.radio == 'current') {
                    vm.orderFilter1.fromDate = undefined;
                    vm.orderFilter1.fromTime = undefined;
                    vm.orderFilter1.toDate = undefined;
                    vm.orderFilter1.toTime = undefined;
                    vm.orderFilter1.planned = undefined;
                } else if (vm.orderFilter1.radio == 'planned') {
                    vm.orderFilter1.processingState = undefined;
                }
                var configObj = {};
                configObj.jobschedulerId = vm.schedulerIds.selected;
                configObj.account = vm.permission.user;
                configObj.configurationType = "CUSTOMIZATION";
                configObj.objectType = "ORDER";
                configObj.id = 0;
                configObj.name = vm.orderFilter1.name;
                configObj.shared = vm.orderFilter1.shared;

                configObj.configurationItem = JSON.stringify(vm.orderFilter1);
                UserService.saveConfiguration(configObj).then(function (res) {
                    configObj.id = res.id;
                    vm.orderFilterList.push(configObj);

                    if (vm.orderFilterList.length == 1) {
                        vm.savedOrderFilter.selected = res.id;
                        vm.orderFilters.selectedView = true;
                        vm.selectedFiltered = vm.orderFilter1;
                        isCustomizationSelected(true);
                        vm.selectedFiltered.account = vm.permission.user;
                        SavedFilter.setOrder(vm.savedOrderFilter);
                        SavedFilter.save();
                        vm.load();
                    }
                });
            }, function () {

            });
        };

        vm.editFilters = function () {
            vm.filters = {};
            vm.filters.list = vm.orderFilterList;
            vm.filters.favorite = vm.savedOrderFilter.favorite;

            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/edit-filter-dialog.html',
                controller: 'DialogCtrl',
                scope: vm
            });
        };
        var temp_name ='';
        vm.editFilter = function (filter) {
            vm.cancel();
            vm.action = 'edit';
            vm.isUnique = true;
            temp_name = angular.copy(filter.name);
            UserService.configuration({jobschedulerId: filter.jobschedulerId, id: filter.id}).then(function (conf) {
                vm.orderFilter1 = JSON.parse(conf.configuration.configurationItem);
                vm.orderFilter1.shared = filter.shared;
                vm.paths = vm.orderFilter1.paths;
                vm.object.paths = vm.paths;
            });

            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/edit-order-filter-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                size: 'lg',
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                if (vm.savedOrderFilter.selected == filter.id) {
                    vm.selectedFiltered = vm.orderFilter1;
                    vm.orderFilters.selectedView = true;
                    isCustomizationSelected(true);
                    vm.load();
                }
                var configObj = {};
                configObj.jobschedulerId = filter.jobschedulerId;
                configObj.account = filter.account;
                configObj.configurationType = filter.configurationType;
                configObj.objectType = filter.objectType;
                configObj.configurationItem = JSON.stringify(vm.orderFilter1);
                configObj.name = vm.orderFilter1.name;
                configObj.id = filter.id;
                configObj.shared = vm.orderFilter1.shared;
                UserService.saveConfiguration(configObj);
                filter.name = vm.orderFilter1.name;
                temp_name ='';
            }, function () {
temp_name ='';
            });
        };

        vm.copyFilter = function (filter) {
            vm.action = 'copy';
            vm.isUnique = true;

            UserService.configuration({jobschedulerId: filter.jobschedulerId, id: filter.id}).then(function (conf) {
                vm.orderFilter1 = JSON.parse(conf.configuration.configurationItem);
                vm.orderFilter1.shared = filter.shared;
                vm.paths = vm.orderFilter1.paths;
                vm.object.paths = vm.paths;
                vm.orderFilter1.name = vm.checkCopyName(vm.orderFilterList, filter.name)

            });

            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/edit-order-filter-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                size: 'lg',
                backdrop: 'static'
            });
            modalInstance.result.then(function () {

                if (vm.orderFilter1.radio == 'current') {
                    vm.orderFilter1.fromDate = undefined;
                    vm.orderFilter1.fromTime = undefined;
                    vm.orderFilter1.toDate = undefined;
                    vm.orderFilter1.toTime = undefined;
                    vm.orderFilter1.planned = undefined;
                } else if (vm.orderFilter1.radio == 'planned') {
                    vm.orderFilter1.processingState = undefined;
                }
                var configObj = {};
                configObj.jobschedulerId = filter.jobschedulerId;
                configObj.account = vm.permission.user;
                configObj.configurationType = "CUSTOMIZATION";
                configObj.objectType = "ORDER";
                configObj.name = vm.orderFilter1.name;
                configObj.id = 0;
                configObj.shared = vm.orderFilter1.shared;
                configObj.configurationItem = JSON.stringify(vm.orderFilter1);
                UserService.saveConfiguration(configObj).then(function (res) {
                    configObj.id = res.id;
                    vm.orderFilterList.push(configObj);
                })

            }, function () {

            });
        };

        vm.deleteFilter = function (filter) {
            UserService.deleteConfiguration({
                jobschedulerId: filter.jobschedulerId,
                id: filter.id
            }).then(function (res) {
                var indexArr = [];
                angular.forEach(vm.orderFilterList, function (value, index) {
                    if (value.name == filter.name && value.account == filter.account) {
                        vm.orderFilterList.splice(index, 1);
                    }
                });
                if (vm.savedOrderFilter.selected == filter.id) {
                    vm.savedOrderFilter.selected = undefined;
                    vm.orderFilters.selectedView = false;
                    vm.selectedFiltered = undefined;
                    isCustomizationSelected(false);
                    vm.load();
                } else {
                    if (vm.orderFilterList.length == 0) {
                        isCustomizationSelected(false);
                        vm.savedOrderFilter.selected = undefined;
                        vm.orderFilters.selectedView = false;
                        vm.selectedFiltered = undefined;
                    }
                }
                SavedFilter.setOrder(vm.savedOrderFilter);
                SavedFilter.save();
            });
        };

        vm.makePrivate = function (configObj) {

            UserService.privateConfiguration({
                jobschedulerId: configObj.jobschedulerId,
                id: configObj.id
            }).then(function (conf) {
                configObj.shared = false;
                if (vm.permission.user != configObj.account) {
                    angular.forEach(vm.orderFilterList, function (value, index) {
                        if (value.id == configObj.id) {
                            vm.orderFilterList.splice(index, 1);
                        }
                    });
                }
            });
        };
        vm.makeShare = function (configObj) {
            UserService.shareConfiguration({
                jobschedulerId: configObj.jobschedulerId,
                id: configObj.id
            }).then(function (conf) {
                configObj.shared = true;
            });
        };

        vm.favorite = function (filter) {
            vm.savedOrderFilter.favorite = filter.id;
            vm.orderFilters.selectedView = true;
            vm.filters.favorite = filter.id;
            SavedFilter.setOrder(vm.savedOrderFilter);
            SavedFilter.save();
            vm.load();
        };

        vm.removeFavorite = function () {
            vm.savedOrderFilter.favorite = '';
            vm.filters.favorite = '';
            SavedFilter.setOrder(vm.savedOrderFilter);
            SavedFilter.save();
        };

        vm.checkFilterName = function () {
            vm.isUnique = true;
            angular.forEach(vm.orderFilterList, function (value) {
                if (vm.orderFilter1.name == value.name && vm.permission.user == value.account && vm.orderFilter1.name != temp_name) {
                    vm.isUnique = false;
                }
            });
        };

        vm.changeFilter = function (filter) {
            if (filter) {
                vm.savedOrderFilter.selected = filter.id;
                vm.orderFilters.selectedView = true;
                UserService.configuration({jobschedulerId: filter.jobschedulerId, id: filter.id}).then(function (conf) {
                    vm.selectedFiltered = JSON.parse(conf.configuration.configurationItem);
                    vm.selectedFiltered.account = filter.account;
                    vm.load();
                });
            } else {
                isCustomizationSelected(false);
                vm.savedOrderFilter.selected = filter;
                vm.orderFilters.selectedView = false;
                vm.selectedFiltered = filter;
                vm.load();
            }

            SavedFilter.setOrder(vm.savedOrderFilter);
            SavedFilter.save();

        };
        vm.getTreeStructure = function () {
            OrderService.tree({
                jobschedulerId: vm.schedulerIds.selected,
                compact: true,
                types: ['ORDER']
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


        var watcher1 = $scope.$watchCollection('object.paths', function (newNames) {
            if (newNames && newNames.length > 0) {
                vm.paths = newNames;
            }
        });

        vm.addOrderPaths = function () {
            vm.orderFilter1.paths = vm.paths;
        };
        vm.remove = function (object) {
            vm.orderFilter1.paths.splice(object, 1);
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
                    vm.reset();
                });
            } else {
                OrderService.deleteOrder(orders).then(function (res) {
                    for (var i = 0; i < vm.object.orders.length; i++) {
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
                    vm.reset();
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
                    vm.reset();
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
                    vm.reset();
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
                    vm.reset();
                });
            } else {
                OrderService.startOrder(orders);
                vm.reset();
            }

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

        function recursiveTreeUpdate(scrTree, destTree) {
            if (scrTree && destTree) {
                for (var i = 0; i < scrTree.length; i++) {
                    for (var j = 0; j < destTree.length; j++) {
                        if (scrTree[i].path == destTree[j].path) {
                            scrTree[i].orders = destTree[j].orders;
                            scrTree[i].expanded = destTree[j].expanded;
                            scrTree[i].selected = destTree[j].selected;
                            scrTree[i].selected1 = destTree[j].selected1;
                            recursiveTreeUpdate(scrTree[i].folders, destTree[j].folders);
                            break;
                        }
                    }
                }
            }
        }

        vm.recursiveTreeUpdate = function (scrTree, destTree) {
            if (scrTree && destTree)
                for (var i = 0; i < scrTree.length; i++) {
                    for (var j = 0; j < destTree.length; j++) {
                        if (scrTree[i].path == destTree[j].path) {
                            scrTree[i].orders = destTree[j].orders;
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

        vm.expandDetails = function () {
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.orders = [];
            angular.forEach(vm.allOrders, function (value, index) {
                obj.orders.push({jobChain: value.jobChain, orderId: value.orderId});
            });
            OrderService.get(obj).then(function (res) {
                angular.forEach(res.orders, function (value) {
                    for (var i = 0; i < vm.allOrders.length; i++) {
                        if (value.path == vm.allOrders[i].path) {
                            vm.allOrders[i] = angular.merge(vm.allOrders[i], value);
                            vm.allOrders[i].show = true;
                            break;
                        }
                    }
                });
            });
        };

        vm.collapseDetails = function () {
            angular.forEach(vm.allOrders, function (value, index) {
                value.show = false;
            });
        };

        var t1 = '';
        $scope.$on('event-started', function () {
            if (vm.events && vm.events[0] && vm.events[0].eventSnapshots)
                angular.forEach(vm.events[0].eventSnapshots, function (value1) {
                    if (value1.path && value1.eventType === "OrderStateChanged" && !value1.eventId) {
                        if ($location.search().path) {
                            if (value1.path == $location.search().path)
                                getOrderByPath($location.search().path);
                        } else {
                            if (vm.orderFilters.filter.state == 'ALL') {
                                angular.forEach(vm.allOrders, function (value2, index) {

                                    if (value2.path == value1.path) {

                                        var obj = {};
                                        obj.jobschedulerId = $scope.schedulerIds.selected;
                                        obj.orderId = value2.orderId;
                                        obj.jobChain = value2.path.split(',')[0];
                                        obj.compact = true;
                                        OrderService.getOrder(obj).then(function (res) {
                                            if (res.order && res.order.path) {
                                                res.order.title = angular.copy(vm.allOrders[index].title);
                                                res.order.path1 = angular.copy(vm.allOrders[index].path1);
                                                res.order.params = angular.copy(vm.allOrders[index].params);
                                                res.order.show = angular.copy(vm.allOrders[index].show);
                                                vm.allOrders[index] = res.order;
                                            } else {
                                                vm.allOrders.splice(index, 1);
                                            }
                                        });
                                    }
                                });
                            } else {
                                navFullTreeForUpdateOrder(value1.path.substring(0, value1.path.lastIndexOf('/')));
                            }
                        }
                    }
                    if ((value1.eventType === "FileBasedActivated" || value1.eventType == "FileBasedRemoved") && value1.objectType == "ORDER") {
                        OrderService.tree({
                            jobschedulerId: vm.schedulerIds.selected,
                            compact: true,
                            types: ['ORDER']
                        }).then(function (res) {
                            if (!angular.equals(vm.filterTree, res.folders)) {
                                vm.filterTree = res.folders;
                                vm.orderFilters.expand_to = vm.recursiveTreeUpdate(angular.copy(res.folders), vm.orderFilters.expand_to);
                                vm.tree = vm.orderFilters.expand_to;
                            }
                        });
                        var path = [];
                        if (value1.path.indexOf(",") > -1) {
                            path = value1.path.split(",");
                        } else {
                            path[0] = value1.path;
                        }
                        if (vm.allOrders.length > 0) {
                            for (var j = 0; j < vm.allOrders.length; j++) {
                                if (path[0].substring(0, path[0].lastIndexOf('/')) == vm.allOrders[j].jobChain.substring(0, vm.allOrders[j].jobChain.lastIndexOf('/'))) {
                                    navFullTreeForUpdateOrder(path[0].substring(0, path[0].lastIndexOf('/')));
                                    break;
                                }
                            }
                        } else {
                            navFullTreeForUpdateOrder(path[0].substring(0, path[0].lastIndexOf('/')));
                        }
                    }
                });
        });

        function navFullTreeForUpdateOrder(path) {
            for (var i = 0; i < vm.tree.length; i++) {
                if (vm.tree[i].path != path) {
                    traverseTreeForUpdateOrder(vm.tree[i], path);
                } else {
                    if (vm.tree[i].selected1)
                        expandFolderData1(vm.tree[i]);
                    break;
                }
            }
        }

        function traverseTreeForUpdateOrder(data, path) {
            if (data.folders)
                for (var i = 0; i < data.folders.length; i++) {
                    if (data.folders[i].path != path) {
                        traverseTreeForUpdateOrder(data.folders[i], path);
                    } else {
                        if (data.folders[i].selected1)
                            expandFolderData1(data.folders[i]);
                        break;
                    }
                }
        }

        var watcher2 = $scope.$watchCollection('filtered', function (newNames) {
            if (newNames)
                vm.object = {};
        });
        $scope.$on('$destroy', function () {
            watcher1();
            watcher2();
            if (t1) {
                $timeout.cancel(t1);
            }
        });

    }

    OrderOverviewCtrl.$inject = ["$scope", "$rootScope", "OrderService", "$stateParams", "CoreService", "$uibModal", "AuditLogService"];
    function OrderOverviewCtrl($scope, $rootScope, OrderService, $stateParams, CoreService, $uibModal, AuditLogService) {

        var vm = $scope;

        vm.orderFilters = CoreService.getOrderTab1();
        vm.orderFilters.filter.state = $stateParams.name;
        vm.orderFilters.currentPage = 1;

        vm.allOrders = [];

        vm.object = {};

        vm.reset = function () {
            vm.object = {};
        };

        vm.exportToExcel = function () {
            $rootScope.$broadcast('exportData');
        };

        vm.init = function () {
            var obj1 = {};
            obj1.jobschedulerId = vm.schedulerIds.selected;
            obj1.compact = true;
            obj1.processingStates = [];
            obj1.processingStates.push(vm.orderFilters.filter.state);

            OrderService.get(obj1).then(function (res) {
                angular.forEach(res.orders, function (value) {
                    value.path1 = value.path.substring(1, value.path.lastIndexOf('/'));
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
        if (vm.orderFilters && vm.orderFilters.showLogPanel) {
            vm.showLogFuc(vm.orderFilters.showLogPanel);
        }

        vm.hideLogPanel = function () {
            vm.showLogPanel = undefined;
            vm.orderFilters.showLogPanel = vm.showLogPanel;
        };


        vm.changeStatus = function () {

            vm.hideLogPanel();
            vm.init();
        };
        $scope.$on("orderState", function (evt, state) {
            if (state) {
                vm.orderFilters.filter.state = state;
                var obj = {};
                obj.jobschedulerId = $scope.schedulerIds.selected;
                obj.compact = true;
                obj.processingStates = [];
                obj.processingStates.push(vm.orderFilters.filter.state);

                OrderService.get(obj).then(function (res) {
                    angular.forEach(res.orders, function (value) {
                        value.path1 = value.path.substring(1, value.path.lastIndexOf('/'));
                    });
                    vm.allOrders = res.orders;
                });
            }
        });

        /**---------------filter, sorting and pagination -------------------*/
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
                    vm.reset();
                });
            } else {
                OrderService.deleteOrder(orders).then(function (res) {
                    for (var i = 0; i < vm.object.orders.length; i++) {
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
                    vm.reset();
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
                    vm.reset();
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
                    vm.reset();
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
                    vm.reset();
                });
            } else {
                OrderService.startOrder(orders);
                vm.reset();
            }

        };

        vm.showLeftPanel = function () {
            CoreService.setSideView(false);
            $('#rightPanel').removeClass('fade-in m-l-0');
            $('#leftPanel').show();
            $('.sidebar-btn').hide();
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
                        OrderService.get(obj).then(function (res) {
                            angular.forEach(res.orders, function (value) {
                                value.path1 = value.path.substring(1, value.path.lastIndexOf('/'));
                            });
                            vm.reset();
                            vm.allOrders = res.orders;
                            waitForResponse = true;

                        }, function () {
                            waitForResponse = true;
                        });
                        $rootScope.$broadcast('reloadSnapshot');
                        break;
                    }
                }
        });
    }


    OrderFunctionCtrl.$inject = ["$scope", "$rootScope", "OrderService", "$uibModal", "ScheduleService", '$timeout', "DailyPlanService", "JobChainService", "$location"];
    function OrderFunctionCtrl($scope, $rootScope, OrderService, $uibModal, ScheduleService, $timeout, DailyPlanService, JobChainService, $location) {
        var vm = $scope;
        vm.maxEntryPerPage = vm.userPreferences.maxEntryPerPage;

        var promise1;

        /**--------------- Checkbox functions -------------*/
        vm.allCheck = {
            checkbox: false
        };

        var watcher1 = vm.$watchCollection('object.orders', function (newNames) {
            if (newNames && newNames.length > 0) {

                if (vm.allOrders && vm.allOrders.length > 0)
                    vm.allCheck.checkbox = newNames.length == vm.allOrders.slice((vm.orderFilters.pageSize * (vm.orderFilters.currentPage - 1)), (vm.orderFilters.pageSize * vm.orderFilters.currentPage)).length;
                else if (vm.orders && vm.orders.length > 0)
                    vm.allCheck.checkbox = newNames.length == vm.orders.slice((vm.orderFilters.pageSize * (vm.orderFilters.currentPage - 1)), (vm.orderFilters.pageSize * vm.orderFilters.currentPage)).length;
                $rootScope.suspendSelected = false;
                $rootScope.deletedSelected = false;
                $rootScope.runningSelected = false;
                $rootScope.resetSelected = false;
                angular.forEach(newNames, function (value) {
                    if (value.processingState) {
                        if (value.processingState._text == 'SUSPENDED' || value.processingState._text == 'BLACKLIST') {
                            $rootScope.suspendSelected = true;
                        }
                        if (value.processingState._text != 'PENDING' && value.processingState._text != 'SETBACK') {
                            $rootScope.runningSelected = true;
                        }
                        if (value._type != 'AD_HOC' || value._type != 'FILE_ORDER') {
                            $rootScope.deletedSelected = true;

                        } else {
                            $rootScope.resetSelected = true;
                        }
                    }
                });
            } else {
                vm.allCheck.checkbox = false;
            }
        });

        vm.checkAll = function () {
            if (vm.allCheck.checkbox) {
                if (vm.allOrders && vm.allOrders.length > 0)
                    vm.object.orders = vm.allOrders.slice((vm.orderFilters.pageSize * (vm.orderFilters.currentPage - 1)), (vm.orderFilters.pageSize * vm.orderFilters.currentPage));
                else if (vm.orders && vm.orders.length > 0)
                    vm.object.orders = vm.orders.slice((vm.orderFilters.pageSize * (vm.orderFilters.currentPage - 1)), (vm.orderFilters.pageSize * vm.orderFilters.currentPage));

            } else {
                vm.reset();
            }
        };

        var watcher3 = vm.$watch('orderFilters.pageSize', function (newNames) {
            if (newNames)
                vm.reset();
        });

        $scope.$on('exportData', function () {
            $('#exportToExcelBtn').attr("disabled", true);

            $('#orderTableId').table2excel({
                exclude: ".noExl",
                filename: "jobscheduler-orders",
                fileext: ".xls",
                exclude_img: false,
                exclude_links: false,
                exclude_inputs: false
            });

            $('#exportToExcelBtn').attr("disabled", false);
        });


        /**--------------- sorting and pagination -------------------*/
        vm.pageChange = function () {
            vm.reset();
        };


        function startAt(order, paramObject) {
            var orders = {};
            orders.orders = [];

            orders.jobschedulerId = $scope.schedulerIds.selected;
            var obj = {};
            obj.orderId = order.orderId;
            obj.jobChain = order.jobChain;
            obj.params = order.params;

            if (order.date && order.time) {
                order.date.setHours(order.time.getHours());
                order.date.setMinutes(order.time.getMinutes());
                order.date.setSeconds(order.time.getSeconds());
            }

            if (order.date && order.at == 'later')
                obj.at = moment.utc(order.date).format();
            else
                obj.at = order.atTime;

            if (!obj.params && paramObject.params.length > 0) {
                obj.params = paramObject.params;
            } else if (obj.params && paramObject.params.length > 0) {
                obj.params.concat(paramObject.params);
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

            OrderService.startOrder(orders).then(function (res) {
                var obj = {};
                obj.orders = [];

                obj.jobschedulerId = vm.schedulerIds.selected;
                obj.orders.push({orderId: order.orderId, jobChain: order.path.split(',')[0]});
                OrderService.get(obj).then(function (res) {
                    order = angular.merge(order, res.orders[0]);
                });
            });
            vm.reset();
        }

        vm.startOrder = function (order) {
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
            vm.order.atTime = 'now';
            vm.comments = {};
            vm.comments.radio = 'predefined';

            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/start-order-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                startAt(vm.order, vm.paramObject);
            }, function () {
                vm.reset();
            });
        };

        vm.start = function (order) {
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            orders.orders.push({orderId: order.orderId, jobChain: order.jobChain, at: 'now'});
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = order.path;
                vm.comments.operation = 'Start';
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

                    OrderService.startOrder(orders);
                    vm.reset();
                }, function () {
                    vm.reset();
                });
            } else {
                OrderService.startOrder(orders);
                vm.reset();
            }

        };

        function setOrderState(order) {

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
            orders.orders.push({
                orderId: order.orderId,
                jobChain: order.jobChain,
                state: vm.order.state,
                endState: vm.order.endState
            });

            OrderService.setOrderState(orders);
            vm.reset();
        }

        vm.setOrderState = function (order) {
            vm.comments = {};
            vm.comments.radio = 'predefined';
            vm.order = angular.copy(order);
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/set-order-state-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                setOrderState(order);
            }, function () {
                vm.reset();
            });

            JobChainService.getJobChainP({
                jobschedulerId: $scope.schedulerIds.selected,
                jobChain: order.jobChain
            }).then(function (res) {
                vm._jobChain = res.jobChain;
                angular.forEach(res.jobChain.endNodes, function (value) {
                    if (vm._jobChain.nodes)
                        vm._jobChain.nodes.push(value);
                    else {
                        vm._jobChain.nodes = [];
                        vm._jobChain.nodes.push(value);
                    }
                });
            });
        };

        function setRunTime(order) {
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
            orders.orders.push({
                orderId: order.orderId,
                jobChain: order.jobChain,
                runTime: vkbeautify.xmlmin(order.runTime)
            });


            OrderService.setRunTime(orders).then(function () {
                var orders = {};
                orders.orders = [];
                orders.jobschedulerId = $scope.schedulerIds.selected;
                orders.orders.push({orderId: order.orderId, jobChain: order.jobChain});
                OrderService.get(orders).then(function (res) {
                    order = angular.merge(order, res.orders[0]);
                });
            });
            vm.reset();
        }

        vm.setRunTime = function (order) {
            vm.comments = {};
            vm.comments.radio = 'predefined';
            vm.scheduleAction = undefined;
            OrderService.getRunTime({
                jobschedulerId: $scope.schedulerIds.selected,
                jobChain: order.jobChain,
                orderId: order.orderId
            }).then(function (res) {
                if (res.runTime) {
                    vm.runTimes = res.runTime;
                    vm.xml = vm.runTimes.runTime;
                }
                $rootScope.$broadcast('loadXml');

            });

            vm.order = order;

            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/set-run-time-dialog.html',
                controller: 'RuntimeEditorDialogCtrl',
                scope: vm,
                size: 'lg',
                backdrop: 'static'
            });
            modalInstance.result.then(function () {

                setRunTime(order);
            }, function () {
                vm.reset();
            });

            ScheduleService.getSchedulesP({
                jobschedulerId: $scope.schedulerIds.selected,
                compact: true
            }).then(function (res) {
                vm.schedules = res.schedules;
            });

            vm.zones = moment.tz.names();
        };
        /**------------------------------------------------------end run time editor -------------------------------------------------------*/


        vm.suspendOrder = function (order) {
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            orders.orders.push({orderId: order.orderId, jobChain: order.jobChain});
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = order.path;
                vm.comments.operation = 'Suspend';
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

                    OrderService.suspendOrder(orders);
                    vm.reset();
                }, function () {
                    vm.reset();
                });
            } else {
                OrderService.suspendOrder(orders);
            }

        };

        vm.resumeOrder = function (order) {
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            orders.orders.push({orderId: order.orderId, jobChain: order.jobChain});
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = order.path;
                vm.comments.operation = 'Resume';
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
                    OrderService.resumeOrder(orders);
                    vm.reset();
                }, function () {
                    vm.reset();
                });
            } else {
                OrderService.resumeOrder(orders);
                vm.reset();
            }

        };

        vm.resumeOrderNextstate = function (order) {
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
                vm.reset();
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
            orders.orders.push({orderId: order.orderId, jobChain: order.jobChain});

            if (orders.params) {
                orders.params.concat(paramObject.params);
            } else {
                orders.params = paramObject.params;
            }
            OrderService.resumeOrder(orders);
            vm.reset();
        }

        vm.resumeOrderWithParam = function (order) {
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

        vm.resetOrder = function (order) {
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            orders.orders.push({orderId: order.orderId, jobChain: order.jobChain});
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = order.path;
                vm.comments.operation = 'Reset';
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
                    OrderService.resetOrder(orders);
                    vm.reset();
                }, function () {
                    vm.reset();
                });
            } else {
                OrderService.resetOrder(orders);
                vm.reset();
            }

        };

        vm.removeOrder = function (order) {
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            orders.orders.push({orderId: order.orderId, jobChain: order.jobChain});
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = order.path;
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
                    OrderService.removeOrder(orders);
                    vm.reset();
                }, function () {
                    vm.reset();
                });
            } else {
                OrderService.removeOrder(orders);
                vm.reset();
            }
        };

        vm.deleteOrder = function (order, jobChain) {

            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            orders.orders.push({orderId: order.orderId, jobChain: order.jobChain});
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = order.path;
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
                    OrderService.deleteOrder(orders).then(function (res) {
                        if (vm.allOrders && vm.allOrders.length > 0) {
                            for (var j = 0; j < vm.allOrders.length; j++) {
                                if (vm.allOrders[j].path == order.path) {
                                    vm.allOrders.splice(j, 1);
                                }
                            }

                        } else if (vm.orders && vm.orders.length > 0) {
                            for (var j = 0; j < vm.orders.length; j++) {
                                if (vm.orders[j].path == order.path) {
                                    vm.orders.splice(j, 1);
                                }
                            }

                        } else {
                            $scope.$emit('refreshList', jobChain);
                        }
                        vm.reset();
                    });
                }, function () {
                    vm.reset();
                });
            } else {
                OrderService.deleteOrder(orders).then(function (res) {
                    if (vm.allOrders && vm.allOrders.length > 0) {
                        for (var j = 0; j < vm.allOrders.length; j++) {
                            if (vm.allOrders[j].path == order.path) {
                                vm.allOrders.splice(j, 1);
                            }
                        }

                    } else if (vm.orders && vm.orders.length > 0) {
                        for (var j = 0; j < vm.orders.length; j++) {
                            if (vm.orders[j].path == order.path) {
                                vm.orders.splice(j, 1);
                            }
                        }

                    } else {
                        $scope.$emit('refreshList', jobChain);
                    }
                    vm.reset();
                });
            }
        };


        vm.viewCalendar = function (order) {
            vm.maxPlannedTime = undefined;
            vm.isCaledarLoading = true;
            vm._jobChain = order;
            vm._jobChain.name = order.orderId;
            vm.planItems = [];
            DailyPlanService.getPlans({
                jobschedulerId: $scope.schedulerIds.selected,
                states: ['PLANNED'],
                orderId: order.orderId
            }).then(function (res) {
                vm.planItemData = res.planItems;
                vm.planItemData.forEach(function (data) {
                    var planData = {
                        plannedStartTime: data.plannedStartTime,
                        expectedEndTime: data.expectedEndTime,
                        orderId: data.orderId
                    };
                    vm.planItems.push(planData);
                    if (!vm.maxPlannedTime || new Date(data.plannedStartTime) > vm.maxPlannedTime) {
                        vm.maxPlannedTime = new Date(data.plannedStartTime);
                    }
                });
                vm.isCaledarLoading = false;
            }, function (err) {
                vm.isCaledarLoading = false;
            });
            openCalendar();
            vm.reset();
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


        vm.showPanelFuc = function (order) {
            order.show = true;
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            orders.orders.push({orderId: order.orderId, jobChain: order.path.split(',')[0]});
            OrderService.get(orders).then(function (res) {
                order = angular.merge(order, res.orders[0]);
            });
        };

        vm.limitNum = vm.userPreferences.maxOrderPerJobchain;
        vm.showOrderPanel = '';
        vm.showOrderPanelFuc = function (path) {
            $location.path('/job_chain_detail/orders').search({path: path});
        };

        $scope.$on('event-started', function () {
            if (vm.events && vm.events[0] && vm.events[0].eventSnapshots && vm.showLogPanel)
                for (var i = 0; i < vm.events[0].eventSnapshots.length; i++) {
                    if (vm.events[0].eventSnapshots[i].path != undefined && vm.events[0].eventSnapshots[i].eventType === "OrderStateChanged" && !vm.events[0].eventSnapshots[i].eventId) {
                        var path = vm.events[0].eventSnapshots[i].path;
                        if (vm.showLogPanel.path == path) {
                            var orders = {};
                            orders = {};
                            orders.orders = [];
                            orders.orders.push({
                                orderId: vm.showLogPanel.orderId,
                                jobChain: vm.showLogPanel.path.split(',')[0]
                            });
                            orders.jobschedulerId = $scope.schedulerIds.selected;
                            orders.limit = parseInt(vm.userPreferences.maxHistoryPerOrder);

                            OrderService.histories(orders).then(function (res) {
                                vm.historys = res.history;
                            });
                        }
                    }
                }
        });

        $scope.$on('$destroy', function () {
            watcher1();
            watcher3();
            if (promise1)
                $timeout.cancel(promise1);
        });

    }

    HistoryCtrl.$inject = ["$scope", "OrderService", "TaskService", "$uibModal", "SavedFilter", "$timeout",
        "JobService", "orderByFilter", "CoreService", "UserService"];
    function HistoryCtrl($scope, OrderService, TaskService, $uibModal, SavedFilter, $timeout,
                         JobService, orderBy, CoreService, UserService) {
        var vm = $scope;
        vm.maxEntryPerPage = vm.userPreferences.maxEntryPerPage;

        vm.historyFilters = CoreService.getHistoryTab();
        vm.order = vm.historyFilters.order;
        vm.task = vm.historyFilters.task;
        if (!vm.order.filter.historyStates) {
            vm.order.filter.historyStates = 'all';

        }
        if (!vm.order.filter.date) {
            vm.order.filter.date = 'today';
        }
        if (!vm.task.filter.historyStates) {
            vm.task.filter.historyStates = 'all';
        }
        if (!vm.task.filter.date) {
            vm.task.filter.date = 'today';
        }

        vm.object = {};
        vm.tree = [];
        vm.tree1 = [];
        var isLoaded = true;

        vm.selectedFiltered1;
        vm.selectedFiltered2;
        vm.temp_filter1 = {};
        vm.temp_filter2 = {};

        vm.jobChainSearch = {};
        vm.jobSearch = {};
        var jobChainSearch = false;
        var jobSearch = false;

        var promise1;

        var loadConfig = false, loadIgnoreList = false;

        vm.savedIgnoreList = {};
        vm.savedIgnoreList.jobChains = [];
        vm.savedIgnoreList.jobs = [];
        vm.savedIgnoreList.orders = [];


        vm.historyFilterObj = JSON.parse(SavedFilter.historyFilters) || {};

        vm.savedHistoryFilter = vm.historyFilterObj.order || {};

        if (vm.historyFilters.order.selectedView) {
            vm.savedHistoryFilter.selected = vm.savedHistoryFilter.selected || vm.savedHistoryFilter.favorite;
        } else {
            vm.savedHistoryFilter.selected = undefined;
        }

        vm.savedJobHistoryFilter = vm.historyFilterObj.job || {};

        if (vm.historyFilters.task.selectedView) {
            vm.savedJobHistoryFilter.selected = vm.savedJobHistoryFilter.selected || vm.savedJobHistoryFilter.favorite;
        } else {
            vm.savedJobHistoryFilter.selected = undefined;
        }

        function checkSharedFilters() {
            if (vm.permission.JOCConfigurations.share.view) {
                var obj = {};
                obj.jobschedulerId = vm.schedulerIds.selected;
                obj.configurationType = "CUSTOMIZATION";
                obj.objectType = "ORDER_HISTORY";
                obj.shared = true;
                UserService.configurations(obj).then(function (res) {
                    vm.orderHistoryFilterList = res.configurations;
                    getOrderCustomizations();
                }, function () {
                    vm.orderHistoryFilterList = [];
                    getOrderCustomizations();
                });
            } else {
                vm.orderHistoryFilterList = [];
                getOrderCustomizations();
            }
        }

        function checkSharedTaskFilters() {
            if (vm.permission.JOCConfigurations.share.view) {
                var obj = {};
                obj.jobschedulerId = vm.schedulerIds.selected;
                obj.configurationType = "CUSTOMIZATION";
                obj.objectType = "TASK_HISTORY";
                obj.shared = true;
                UserService.configurations(obj).then(function (res) {
                    vm.jobHistoryFilterList = res.configurations;
                    getTaskCustomizations();
                }, function () {
                    vm.jobHistoryFilterList = [];
                    getTaskCustomizations();
                });
            } else {
                vm.jobHistoryFilterList = [];
                getTaskCustomizations();
            }
        }

        var configObj = {};
        configObj.jobschedulerId = vm.schedulerIds.selected;
        configObj.account = vm.permission.user;

        function getOrderCustomizations() {
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.account = vm.permission.user;
            obj.configurationType = "CUSTOMIZATION";
            obj.objectType = "ORDER_HISTORY";
            UserService.configurations(obj).then(function (res) {

                if (vm.orderHistoryFilterList && vm.orderHistoryFilterList.length > 0) {
                    if (res.configurations && res.configurations.length > 0) {
                        vm.orderHistoryFilterList = vm.orderHistoryFilterList.concat(res.configurations);
                    }
                    var data = [];
                    for (var i = 0; i < vm.orderHistoryFilterList.length; i++) {
                        var flag = true;
                        for (var j = 0; j < data.length; j++) {
                            if (data[j].id == vm.orderHistoryFilterList[i].id) {
                                flag = false;
                            }
                        }
                        if (flag) {
                            data.push(vm.orderHistoryFilterList[i]);
                        }
                    }
                    vm.orderHistoryFilterList = data;
                } else {
                    vm.orderHistoryFilterList = res.configurations;
                }

                if (vm.savedHistoryFilter.selected) {
                    var flag = true;
                    angular.forEach(vm.orderHistoryFilterList, function (value) {
                        if (value.id == vm.savedHistoryFilter.selected) {
                            flag = false;
                            UserService.configuration({
                                jobschedulerId: value.jobschedulerId,
                                id: value.id
                            }).then(function (conf) {
                                loadConfig = true;
                                vm.selectedFiltered1 = JSON.parse(conf.configuration.configurationItem);
                                vm.selectedFiltered1.account = value.account;
                                vm.init({jobschedulerId: $scope.schedulerIds.selected});
                            });
                        }
                    });
                    if (flag) {
                        vm.savedHistoryFilter.selected = undefined;
                        loadConfig = true;
                        vm.init({jobschedulerId: $scope.schedulerIds.selected});
                    }
                } else {
                    loadConfig = true;
                    vm.savedHistoryFilter.selected = undefined;
                    vm.init({jobschedulerId: $scope.schedulerIds.selected});
                }

            }, function (err) {
                vm.savedHistoryFilter.selected = undefined;
                loadConfig = true;
                vm.init({jobschedulerId: $scope.schedulerIds.selected});
            });
        }

        function getTaskCustomizations() {
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.account = vm.permission.user;
            obj.configurationType = "CUSTOMIZATION";
            obj.objectType = "TASK_HISTORY";
            UserService.configurations(obj).then(function (res) {


                if (vm.jobHistoryFilterList && vm.jobHistoryFilterList.length > 0) {
                    if (res.configurations && res.configurations.length > 0) {
                        vm.jobHistoryFilterList = vm.jobHistoryFilterList.concat(res.configurations);
                    }
                    var data = [];

                    for (var i = 0; i < vm.jobHistoryFilterList.length; i++) {
                        var flag = true;
                        for (var j = 0; j < data.length; j++) {
                            if (data[j].account == vm.jobHistoryFilterList[i].account && data[j].name == vm.jobHistoryFilterList[i].name) {
                                flag = false;
                            }
                        }
                        if (flag) {
                            data.push(vm.jobHistoryFilterList[i]);
                        }
                    }
                    vm.jobHistoryFilterList = data;
                } else {
                    vm.jobHistoryFilterList = res.configurations;
                }

                if (vm.savedJobHistoryFilter.selected) {
                    var flag = true;
                    angular.forEach(vm.jobHistoryFilterList, function (value) {
                        if (value.id == vm.savedJobHistoryFilter.selected) {
                            flag = false;
                            UserService.configuration({
                                jobschedulerId: value.jobschedulerId,
                                id: value.id
                            }).then(function (conf) {
                                loadConfig = true;
                                vm.selectedFiltered2 = JSON.parse(conf.configuration.configurationItem);
                                vm.selectedFiltered2.account = value.account;
                                vm.init({jobschedulerId: $scope.schedulerIds.selected});
                            });
                        }
                    });
                    if (flag) {
                        vm.savedJobHistoryFilter.selected = undefined;
                        loadConfig = true;
                        vm.init({jobschedulerId: $scope.schedulerIds.selected});
                    }
                } else {
                    loadConfig = true;
                    vm.savedJobHistoryFilter.selected = undefined;
                    vm.init({jobschedulerId: $scope.schedulerIds.selected});
                }

            }, function (err) {
                loadConfig = true;
                vm.savedJobHistoryFilter.selected = undefined;
                vm.init({jobschedulerId: $scope.schedulerIds.selected});
            });
        }

        if (vm.historyFilters.type != 'job') {
            checkSharedFilters();
        } else {
            checkSharedTaskFilters();
        }
        vm.ignoreListConfigId = 0;
        function getIgnoreList() {
            var configObj = {};
            configObj.jobschedulerId = vm.schedulerIds.selected;
            configObj.account = vm.permission.user;
            configObj.configurationType = "IGNORELIST";
            UserService.configurations(configObj).then(function (res1) {
                if (res1.configurations && res1.configurations.length > 0) {
                    vm.ignoreListConfigId = res1.configurations[0].id;
                    UserService.configuration({
                        jobschedulerId: vm.schedulerIds.selected,
                        id: res1.configurations[0].id
                    }).then(function (res) {
                        if (res.configuration && res.configuration.configurationItem) {
                            vm.savedIgnoreList = JSON.parse(res.configuration.configurationItem);
                        }
                        loadIgnoreList = true;
                        vm.init({jobschedulerId: $scope.schedulerIds.selected});
                    }, function () {
                        loadIgnoreList = true;
                        vm.init({jobschedulerId: $scope.schedulerIds.selected});
                    });
                } else {
                    loadIgnoreList = true;
                    vm.init({jobschedulerId: $scope.schedulerIds.selected});
                }
            }, function () {
                loadIgnoreList = true;
                vm.init({jobschedulerId: $scope.schedulerIds.selected});
            });
        }

        getIgnoreList();


        /**--------------- sorting and pagination -------------------*/
        vm.sortBy = function (propertyName) {
            vm.order.sortReverse = !vm.order.sortReverse;
            vm.order.filter.sortBy = propertyName;
        };
        vm.sortBy1 = function (propertyName) {
            vm.task.sortReverse = !vm.task.sortReverse;
            vm.task.filter.sortBy = propertyName;
        };

        function setTaskDateRange(filter) {
            if ((vm.savedIgnoreList.isEnable == true || vm.savedIgnoreList.isEnable == 'true') && (vm.savedIgnoreList.jobs && vm.savedIgnoreList.jobs.length > 0)) {

                filter.excludeJobs = [];
                angular.forEach(vm.savedIgnoreList.jobs, function (job) {
                    filter.excludeJobs.push({job: job});
                });
            }
            if (vm.task.filter.date == 'all') {

            } else if (vm.task.filter.date == 'today') {
                var from = new Date();
                var to = new Date();
                from.setHours(0);
                from.setMinutes(0);
                from.setSeconds(0);
                from.setMilliseconds(0);
                to.setDate(to.getDate() + 1);
                to.setHours(0);
                to.setMinutes(0);
                to.setSeconds(0);
                to.setMilliseconds(0);

                filter.dateFrom = from;
                filter.dateTo = to;
            } else {
                filter.dateFrom = vm.task.filter.date;
            }
            return filter;
        }

        function setOrderDateRange(filter) {
            if ((vm.savedIgnoreList.isEnable == true || vm.savedIgnoreList.isEnable == 'true') && ((vm.savedIgnoreList.jobChains && vm.savedIgnoreList.jobChains.length > 0) || (vm.savedIgnoreList.orders && vm.savedIgnoreList.orders.length > 0))) {
                filter.excludeOrders = [];
                angular.forEach(vm.savedIgnoreList.jobChains, function (jobChain) {
                    filter.excludeOrders.push({jobChain: jobChain});
                });

                angular.forEach(vm.savedIgnoreList.orders, function (order) {
                    filter.excludeOrders.push(order);
                });
            }

            if (vm.order.filter.date == 'all') {

            } else if (vm.order.filter.date == 'today') {
                var from = new Date();
                var to = new Date();
                from.setHours(0);
                from.setMinutes(0);
                from.setSeconds(0);
                from.setMilliseconds(0);
                to.setDate(to.getDate() + 1);
                to.setHours(0);
                to.setMinutes(0);
                to.setSeconds(0);
                to.setMilliseconds(0);


                filter.dateFrom = from;
                filter.dateTo = to;

            } else {
                filter.dateFrom = vm.order.filter.date;
            }
            return filter;
        }

        vm.jobHistory = jobHistory;
        function jobHistory(filter) {

            if (!filter) {
                if (!vm.jobHistoryFilterList) {
                    checkSharedTaskFilters();
                    return;
                }
                if (vm.jobHistorys && vm.jobHistorys.length > 0) {
                    return;
                }
                filter = {jobschedulerId: $scope.schedulerIds.selected};
            }
            vm.isLoading = false;

            if (vm.selectedFiltered2) {
                isCustomizationSelected2(true);
                filter = jobParseDate(filter);
            } else {
                filter = setTaskDateRange(filter);
                if (vm.task.filter.historyStates != 'all') {
                    filter.historyStates = [];
                    filter.historyStates.push(vm.task.filter.historyStates);
                }
            }
            filter.limit = parseInt(vm.userPreferences.maxRecords);
            TaskService.histories(filter).then(function (res) {
                vm.jobHistorys = res.history;
                vm.isLoading = true;
                isLoaded = true;
            }, function () {
                vm.isLoading = true;
                isLoaded = true;
            });
        }

        vm.orderHistory = orderHistory;
        function orderHistory(filter) {
            if (!vm.orderHistoryFilterList) {
                checkSharedFilters();
                return;
            }
            if (!filter) {
                if (vm.historys && vm.historys.length > 0) {
                    return;
                }
                filter = {jobschedulerId: $scope.schedulerIds.selected};
            }
            vm.isLoading = false;
            if (vm.selectedFiltered1) {
                isCustomizationSelected1(true);
                filter = orderParseDate(filter);
            } else {
                filter = setOrderDateRange(filter);
                if (vm.order.filter.historyStates != 'all') {
                    filter.historyStates = [];
                    filter.historyStates.push(vm.order.filter.historyStates);
                }
            }
            filter.limit = parseInt(vm.userPreferences.maxRecords);
            OrderService.histories(filter).then(function (res) {
                vm.historys = res.history;
                vm.isLoading = true;
                isLoaded = true;
            }, function () {
                vm.isLoading = true;
                isLoaded = true;
            });
        }

        vm.init = function (filter) {
            if (loadConfig && loadIgnoreList) {
                isLoaded = false;
                if (vm.historyFilters.type == 'job') {
                    jobHistory(filter);
                } else {
                    orderHistory(filter);
                }
            }
        };

        vm.search = function (flag) {
            if (!flag)
                vm.loading = true;
            var filter = {
                jobschedulerId: $scope.schedulerIds.selected,
                limit: parseInt(vm.userPreferences.maxRecords)
            };

            if (vm.historyFilters.type == 'job') {
                vm.task.filter.historyStates = '';
                vm.task.filter.date = '';
                if (vm.jobSearch.job) {
                    filter.jobs = [];
                    var s = vm.jobSearch.job.replace(/,\s+/g, ',');
                    var jobs = s.split(',');
                    angular.forEach(jobs, function (value) {
                        filter.jobs.push({job: value})
                    });
                }
                if (vm.jobSearch.states && vm.jobSearch.states.length > 0) {
                    filter.historyStates = vm.jobSearch.states;
                }
                if (vm.jobSearch.from) {
                    var fromDate = new Date(vm.jobSearch.from);
                    if (vm.jobSearch.fromTime) {

                        fromDate.setHours(vm.jobSearch.fromTime.getHours());
                        fromDate.setMinutes(vm.jobSearch.fromTime.getMinutes());
                        fromDate.setSeconds(vm.jobSearch.fromTime.getSeconds());
                        fromDate.setMilliseconds(0);
                    } else {
                        fromDate.setHours(0);
                        fromDate.setMinutes(0);
                        fromDate.setSeconds(0);
                        fromDate.setMilliseconds(0);
                    }
                    filter.dateFrom = fromDate;
                }
                if (vm.jobSearch.to) {
                    var toDate = new Date(vm.jobSearch.to);
                    if (vm.jobSearch.toTime) {

                        toDate.setHours(vm.jobSearch.toTime.getHours());
                        toDate.setMinutes(vm.jobSearch.toTime.getMinutes());
                        toDate.setSeconds(vm.jobSearch.toTime.getSeconds());
                        toDate.setMilliseconds(0);
                    } else {
                        toDate.setHours(0);
                        toDate.setMinutes(0);
                        toDate.setSeconds(0);
                        toDate.setMilliseconds(0);
                    }
                    filter.dateTo = toDate;
                }
                if (vm.jobSearch.regex) {
                    filter.regex = vm.jobSearch.regex;
                }

                if (vm.jobSearch.paths && vm.jobSearch.paths.length > 0) {
                    filter.folders = [];
                    angular.forEach(vm.jobSearch.paths, function (value) {
                        filter.folders.push({folder: value, recursive: true});
                    })
                }
                if (vm.jobSearch.jobs && vm.jobSearch.jobs.length > 0) {
                    filter.jobs = [];

                    angular.forEach(vm.jobSearch.jobs, function (value) {
                        filter.jobs.push({job: value});
                    });

                }
                TaskService.histories(filter).then(function (res) {
                    vm.jobHistorys = res.history;
                    vm.loading = false;
                    isLoaded = true;
                }, function () {
                    vm.loading = false;
                    isLoaded = true;
                });
                jobSearch = true;
            } else {
                vm.order.filter.historyStates = '';
                vm.order.filter.date = '';
                if (vm.jobChainSearch.jobChain) {
                    filter.orders = [];
                    if (vm.jobChainSearch.orderIds) {
                        var s = vm.jobChainSearch.orderIds.replace(/,\s+/g, ',');
                        var orderIds = s.split(',');
                        angular.forEach(orderIds, function (value) {
                            filter.orders.push({jobChain: vm.jobChainSearch.jobChain, orderId: value})
                        });
                    } else {
                        filter.orders.push({jobChain: vm.jobChainSearch.jobChain})
                    }
                }
                if (vm.jobChainSearch.states && vm.jobChainSearch.states.length > 0) {
                    filter.historyStates = vm.jobChainSearch.states;

                }
                if (vm.jobChainSearch.from) {
                    var fromDate = new Date(vm.jobChainSearch.from);
                    if (vm.jobChainSearch.fromTime) {

                        fromDate.setHours(vm.jobChainSearch.fromTime.getHours());
                        fromDate.setMinutes(vm.jobChainSearch.fromTime.getMinutes());
                        fromDate.setSeconds(vm.jobChainSearch.fromTime.getSeconds());
                        fromDate.setMilliseconds(0);
                    } else {
                        fromDate.setHours(0);
                        fromDate.setMinutes(0);
                        fromDate.setSeconds(0);
                        fromDate.setMilliseconds(0);
                    }
                    filter.dateFrom = fromDate;
                }
                if (vm.jobChainSearch.to) {
                    var toDate = new Date(vm.jobChainSearch.to);
                    if (vm.jobChainSearch.toTime) {

                        toDate.setHours(vm.jobChainSearch.toTime.getHours());
                        toDate.setMinutes(vm.jobChainSearch.toTime.getMinutes());
                        toDate.setSeconds(vm.jobChainSearch.toTime.getSeconds());
                        toDate.setMilliseconds(0);
                    } else {
                        toDate.setHours(0);
                        toDate.setMinutes(0);
                        toDate.setSeconds(0);
                        toDate.setMilliseconds(0);
                    }
                    filter.dateTo = toDate;
                }
                if (vm.jobChainSearch.regex) {
                    filter.regex = vm.jobChainSearch.regex;
                }
                if (vm.jobChainSearch.paths && vm.jobChainSearch.paths.length > 0) {
                    filter.folders = [];
                    angular.forEach(vm.jobChainSearch.paths, function (value) {
                        filter.folders.push({folder: value, recursive: true});
                    })
                }
                if ((vm.jobChainSearch.jobChains && vm.jobChainSearch.jobChains.length > 0) || (vm.jobChainSearch.orders && vm.jobChainSearch.orders.length > 0)) {
                    filter.orders = [];

                    angular.forEach(vm.jobChainSearch.orders, function (value) {
                        filter.orders.push({jobChain: value.jobChain, orderId: value.orderId});
                    });
                    if (!vm.jobChainSearch.orders || vm.jobChainSearch.orders.length == 0) {
                        angular.forEach(vm.jobChainSearch.jobChains, function (value) {
                            filter.orders.push({jobChain: value});
                        });
                    } else {
                        for (var i = 0; i < vm.jobChainSearch.jobChains.length; i++) {
                            for (var j = 0; j < filter.orders.length; j++) {
                                var flag = true;
                                if (filter.orders[j].jobChain == vm.jobChainSearch.jobChains[i]) {
                                    flag = false;
                                    break;
                                }
                            }
                            if (flag) {
                                filter.orders.push({jobChain: vm.jobChainSearch.jobChains[i]});
                            }
                        }
                    }

                }
                OrderService.histories(filter).then(function (res) {
                    vm.historys = res.history;
                    vm.loading = false;
                    isLoaded = true;
                }, function () {
                    vm.loading = false;
                    isLoaded = true;
                });
                jobChainSearch = true;
            }
        };
        vm.advancedSearch = function () {
            vm.isUnique = true;
            vm.showSearchPanel = true;
            vm.object.paths = [];
            vm.object.orders = [];
            vm.object.jobChains = [];
            vm.object.jobs = [];
        };
        vm.cancel = function (form) {
            if (!vm.order.filter.historyStates) {
                vm.order.filter.historyStates = 'all';
            }
            if (!vm.order.filter.date) {
                vm.order.filter.date = 'today';
            }
            if (!vm.task.filter.historyStates) {
                vm.task.filter.historyStates = 'all';
            }
            if (!vm.task.filter.date) {
                vm.task.filter.date = 'today';
            }
            vm.showSearchPanel = false;
            if (vm.historyFilters.type == 'job') {
                vm.jobSearch = {};
                jobSearch = false;
            } else {
                vm.jobChainSearch = {};
                jobChainSearch = false;
            }
            if (form)
                form.$setPristine();
            vm.init();
        };


        function orderParseDate(obj) {

            if ((vm.savedIgnoreList.isEnable == true || vm.savedIgnoreList.isEnable == 'true') && ((vm.savedIgnoreList.jobChains && vm.savedIgnoreList.jobChains.length > 0) || (vm.savedIgnoreList.orders && vm.savedIgnoreList.orders.length > 0))) {
                obj.excludeOrders = [];
                angular.forEach(vm.savedIgnoreList.jobChains, function (jobChain) {
                    obj.excludeOrders.push({jobChain: jobChain});
                });

                angular.forEach(vm.savedIgnoreList.orders, function (order) {
                    obj.excludeOrders.push(order);
                });
            }

            if (vm.selectedFiltered1.regex) {
                obj.regex = vm.selectedFiltered1.regex;
            }
            if (vm.selectedFiltered1.paths && vm.selectedFiltered1.paths.length > 0) {
                obj.folders = [];
                angular.forEach(vm.selectedFiltered1.paths, function (value) {
                    obj.folders.push({folder: value, recursive: true});
                })
            }
            if ((vm.selectedFiltered1.jobChains && vm.selectedFiltered1.jobChains.length > 0) || (vm.selectedFiltered1.orders && vm.selectedFiltered1.orders.length > 0)) {
                obj.orders = [];

                angular.forEach(vm.selectedFiltered1.orders, function (value) {
                    obj.orders.push({jobChain: value.jobChain, orderId: value.orderId});
                });
                if (!vm.selectedFiltered1.orders || vm.selectedFiltered1.orders.length == 0) {
                    angular.forEach(vm.selectedFiltered1.jobChains, function (value) {
                        obj.orders.push({jobChain: value});
                    });
                } else {
                    for (var i = 0; i < vm.selectedFiltered1.jobChains.length; i++) {
                        for (var j = 0; j < obj.orders.length; j++) {
                            var flag = true;
                            if (obj.orders[j].jobChain == vm.selectedFiltered1.jobChains[i]) {
                                flag = false;
                                break;
                            }
                        }
                        if (flag) {
                            obj.orders.push({jobChain: vm.selectedFiltered1.jobChains[i]});
                        }
                    }
                }

            }
            if (vm.selectedFiltered1.state && vm.selectedFiltered1.state.length > 0) {
                obj.historyStates = vm.selectedFiltered1.state;
            }

            var fromDate;
            var toDate;
            if (vm.selectedFiltered1.planned) {
                if (/^\s*(-)\s*(\d+)(h\s*)\s*$/i.test(vm.selectedFiltered1.planned)) {
                    fromDate = new Date();
                    toDate = new Date();
                    var hours = (/^\s*(-)\s*(\d+)(h\s*)\s*$/i.exec(vm.selectedFiltered1.planned)[2]);
                    fromDate.setHours(toDate.getHours() - hours);
                }
                else if (/^\s*(-)\s*(\d+)(d\s*)\s*$/i.test(vm.selectedFiltered1.planned)) {
                    fromDate = new Date();
                    toDate = new Date();
                    var days = (/^\s*(-)\s*(\d+)(d\s*)\s*$/i.exec(vm.selectedFiltered1.planned)[2]);
                    fromDate.setDate(toDate.getDate() - days);
                } else if (/^\s*(now\s*\-)\s*(\d+)\s*$/i.test(vm.selectedFiltered1.planned)) {
                    fromDate = new Date();
                    toDate = new Date();
                    var seconds = parseInt(/^\s*(now\s*\-)\s*(\d+)\s*$/i.exec(vm.selectedFiltered1.planned)[2]);
                    fromDate.setSeconds(toDate.getSeconds() - seconds);
                } else if (/^\s*(Today)\s*$/i.test(vm.selectedFiltered1.planned)) {
                    fromDate = new Date();
                    fromDate.setHours(0);
                    fromDate.setMinutes(0);
                    fromDate.setSeconds(0);
                    fromDate.setMilliseconds(0);
                    toDate = new Date();
                    toDate.setDate(toDate.getDate() + 1);
                    toDate.setHours(0);
                    toDate.setMinutes(0);
                    toDate.setSeconds(0);
                    toDate.setMilliseconds(0);
                } else if (/^\s*(now)\s*$/i.test(vm.selectedFiltered1.planned)) {
                    fromDate = new Date();
                    toDate = new Date();
                } else if (/^\s*(\d+):(\d+)\s*(am|pm)\s*to\s*(\d+):(\d+)\s*(am|pm)\s*$/i.test(vm.selectedFiltered1.planned)) {
                    var time = /^\s*(\d+):(\d+)\s*(am|pm)\s*to\s*(\d+):(\d+)\s*(am|pm)\s*$/i.exec(vm.selectedFiltered1.planned);
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
            }

            if (fromDate && toDate) {
                obj.dateFrom = fromDate;
                obj.dateTo = toDate;
            }
            return obj;
        }

        function jobParseDate(obj) {
            if ((vm.savedIgnoreList.isEnable == true || vm.savedIgnoreList.isEnable == 'true') && (vm.savedIgnoreList.jobs && vm.savedIgnoreList.jobs.length > 0)) {

                obj.excludeJobs = [];
                angular.forEach(vm.savedIgnoreList.jobs, function (job) {
                    obj.excludeJobs.push({job: job});
                });
            }

            if (vm.selectedFiltered2.regex) {
                obj.regex = vm.selectedFiltered2.regex;
            }
            if (vm.selectedFiltered2.state && vm.selectedFiltered2.state.length > 0) {
                obj.historyStates = vm.selectedFiltered2.state;
            }
            if (vm.selectedFiltered2.paths && vm.selectedFiltered2.paths.length > 0) {
                obj.folders = [];
                angular.forEach(vm.selectedFiltered2.paths, function (value) {
                    obj.folders.push({folder: value, recursive: true});
                })
            }
            if (vm.selectedFiltered2.jobs && vm.selectedFiltered2.jobs.length > 0) {
                obj.jobs = [];

                angular.forEach(vm.selectedFiltered2.jobs, function (value) {
                    obj.jobs.push({job: value});
                });

            }
            var fromDate;
            var toDate;
            if (vm.selectedFiltered2.planned) {
                if (/^\s*(-)\s*(\d+)(h\s*)\s*$/i.test(vm.selectedFiltered2.planned)) {
                    fromDate = new Date();
                    toDate = new Date();
                    var hours = (/^\s*(-)\s*(\d+)(h\s*)\s*$/i.exec(vm.selectedFiltered2.planned)[2]);
                    fromDate.setHours(toDate.getHours() - hours);
                }
                else if (/^\s*(-)\s*(\d+)(d\s*)\s*$/i.test(vm.selectedFiltered2.planned)) {
                    fromDate = new Date();
                    toDate = new Date();
                    var days = (/^\s*(-)\s*(\d+)(d\s*)\s*$/i.exec(vm.selectedFiltered2.planned)[2]);
                    fromDate.setDate(toDate.getDate() - days);
                } else if (/^\s*(now\s*\-)\s*(\d+)\s*$/i.test(vm.selectedFiltered2.planned)) {
                    fromDate = new Date();
                    toDate = new Date();
                    var seconds = parseInt(/^\s*(now\s*\-)\s*(\d+)\s*$/i.exec(vm.selectedFiltered2.planned)[2]);
                    fromDate.setSeconds(toDate.getSeconds() - seconds);
                } else if (/^\s*(Today)\s*$/i.test(vm.selectedFiltered2.planned)) {
                    fromDate = new Date();
                    fromDate.setHours(0);
                    fromDate.setMinutes(0);
                    fromDate.setSeconds(0);
                    fromDate.setMilliseconds(0);
                    toDate = new Date();
                    toDate.setDate(toDate.getDate() + 1);
                    toDate.setHours(0);
                    toDate.setMinutes(0);
                    toDate.setSeconds(0);
                    toDate.setMilliseconds(0);
                } else if (/^\s*(now)\s*$/i.test(vm.selectedFiltered2.planned)) {
                    fromDate = new Date();
                    toDate = new Date();
                } else if (/^\s*(\d+):(\d+)\s*(am|pm)\s*to\s*(\d+):(\d+)\s*(am|pm)\s*$/i.test(vm.selectedFiltered2.planned)) {
                    var time = /^\s*(\d+):(\d+)\s*(am|pm)\s*to\s*(\d+):(\d+)\s*(am|pm)\s*$/i.exec(vm.selectedFiltered2.planned);
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
            }
            if (fromDate && toDate) {
                obj.dateFrom = fromDate;
                obj.dateTo = toDate;
            }
            return obj;
        }

        vm.loadHistory = function () {
            if (!vm.order.filter.historyStates) {
                vm.order.filter.historyStates = 'all';

            }
            if (!vm.order.filter.date) {
                vm.order.filter.date = 'today';
            }
            if (!vm.task.filter.historyStates) {
                vm.task.filter.historyStates = 'all';
            }
            if (!vm.task.filter.date) {
                vm.task.filter.date = 'today';
            }
            if (vm.historyFilters.type == 'job') {
                vm.jobSearch = {};
            } else {
                vm.jobChainSearch = {};
            }
            vm.init({jobschedulerId: $scope.schedulerIds.selected})
        };


        vm.showPanelFuc = function (value) {
            value.show = true;
            var orders = {};
            orders.jobschedulerId = $scope.schedulerIds.selected;
            orders.jobChain = value.jobChain;
            orders.orderId = value.orderId;
            orders.historyId = value.historyId;
            OrderService.history(orders).then(function (res) {
                value.steps = res.history.steps;
            });

        };

        vm.exportToExcel = function () {
            isLoaded = false;
            $('#exportToExcelBtn').attr("disabled", true);

            var fileName = 'jobscheduler-order-history-report';
            if (vm.historyFilters.type == 'job') {
                fileName = 'jobscheduler-task-history-report';
            }
            $('#' + vm.historyFilters.type).table2excel({
                exclude: ".noExl",
                filename: fileName,
                fileext: ".xls",
                exclude_img: false,
                exclude_links: false,
                exclude_inputs: false
            });
            $('#exportToExcelBtn').attr("disabled", false);
            isLoaded = true;
        };

        function isCustomizationSelected1(flag) {
            if (flag) {
                vm.temp_filter1.historyStates = angular.copy(vm.order.filter.historyStates);
                vm.temp_filter1.date = angular.copy(vm.order.filter.date);
                vm.order.filter.historyStates = '';
                vm.order.filter.date = '';
            } else {
                if(vm.temp_filter1.historyStates) {
                    vm.order.filter.historyStates = angular.copy(vm.temp_filter1.historyStates);
                    vm.order.filter.date = angular.copy(vm.temp_filter1.date);
                }else{
                    vm.order.filter.historyStates = 'all';
                    vm.order.filter.date = 'today';
                }
            }
        }

        function isCustomizationSelected2(flag) {
            if (flag) {
                vm.temp_filter2.historyStates = angular.copy(vm.task.filter.historyStates);
                vm.temp_filter2.date = angular.copy(vm.task.filter.date);
                vm.task.filter.historyStates = '';
                vm.task.filter.date = '';
            } else {
                if(vm.temp_filter2.historyStates){
                    vm.task.filter.historyStates = angular.copy(vm.temp_filter2.historyStates);
                    vm.task.filter.date = angular.copy(vm.temp_filter2.date);
                }else{
                    vm.task.filter.historyStates = 'all';
                    vm.task.filter.date = 'today';
                }
            }
        }

        /**--------------- Filter -----------------------------*/
        vm.saveAsFilter = function (form) {
            var configObj = {};
            configObj.jobschedulerId = vm.schedulerIds.selected;
            configObj.account = vm.permission.user;
            configObj.configurationType = "CUSTOMIZATION";
            var fromDate;
            var obj = {};
            if(vm.jobChainSearch.name) {
                configObj.name = vm.jobChainSearch.name;
                obj.regex = vm.jobChainSearch.regex;
                obj.paths = vm.jobChainSearch.paths;
                obj.jobChains = vm.jobChainSearch.jobChains;
                obj.orders = vm.jobChainSearch.orders;
                obj.state = vm.jobChainSearch.states;
                obj.name = vm.jobChainSearch.name;
            }
            else {
                configObj.name = vm.jobSearch.name;
                obj.regex = vm.jobSearch.regex;
                obj.paths = vm.jobSearch.paths;
                obj.jobs = vm.jobSearch.jobs;
                obj.state = vm.jobSearch.states;
                obj.name = vm.jobSearch.name;
            }
            //configObj.shared = vm.historyFilter.shared;
            configObj.id = 0;

            if (vm.historyFilters.type == 'jobChain') {
                configObj.objectType = "ORDER_HISTORY";

            } else {
                configObj.objectType = "TASK_HISTORY";

            }
            configObj.configurationItem = JSON.stringify(obj);
            UserService.saveConfiguration(configObj).then(function (res) {
                configObj.id = res.id;
                if (vm.historyFilters.type == 'jobChain') {
                    vm.jobChainSearch.name = '';
                } else {
                    vm.jobSearch.name = '';
                }
                if (form)
                    form.$setPristine();

                if (vm.historyFilters.type == 'jobChain') {
                    vm.orderHistoryFilterList.push(configObj);
                } else {
                    vm.jobHistoryFilterList.push(configObj);
                }

            });
        };
        vm.advanceFilter = function () {
            vm.cancel();
            vm.object.paths = [];
            vm.object.orders = [];
            vm.object.jobChains = [];
            vm.object.jobs = [];
            vm.paths = [];
            vm.jobChains = [];
            vm.orders = [];
            vm.jobs = [];
            vm.historyFilter = {};
            vm.isUnique = true;
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/history-filter-dialog.html',
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
                if (vm.historyFilters.type == 'jobChain') {
                    configObj.objectType = "ORDER_HISTORY";
                } else {
                    configObj.objectType = "TASK_HISTORY";
                }
                UserService.saveConfiguration(configObj).then(function (res) {
                    configObj.id = res.id;
                    if (vm.historyFilters.type == 'jobChain') {
                        vm.orderHistoryFilterList.push(configObj);
                        if (vm.orderHistoryFilterList.length == 1) {
                            vm.savedHistoryFilter.selected = res.id;
                            vm.historyFilters.order.selectedView = true;
                            vm.selectedFiltered1 = vm.historyFilter;
                            vm.selectedFiltered1.account = vm.permission.user;
                            vm.init({jobschedulerId: $scope.schedulerIds.selected});
                            isCustomizationSelected1(true);
                        }
                        vm.historyFilterObj.order = vm.savedHistoryFilter;
                    } else {
                        vm.jobHistoryFilterList.push(configObj);
                        if (vm.jobHistoryFilterList.length == 1) {
                            vm.savedJobHistoryFilter.selected = res.id;
                            vm.historyFilters.task.selectedView = true;
                            vm.selectedFiltered2 = vm.historyFilter;
                            vm.selectedFiltered2.account = vm.permission.user;
                            vm.init({jobschedulerId: $scope.schedulerIds.selected});
                            isCustomizationSelected2(true);
                        }
                        vm.historyFilterObj.job = vm.savedJobHistoryFilter;
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
            } else {
                vm.filters.list = vm.jobHistoryFilterList;
                vm.filters.favorite = vm.savedJobHistoryFilter.favorite;
            }

            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/edit-filter-dialog.html',
                controller: 'DialogCtrl',
                scope: vm
            });
        };
var temp_name ='';
        vm.editFilter = function (filter) {
            vm.cancel();
            vm.action = 'edit';
            vm.isUnique = true;
            temp_name = angular.copy(filter.name);
            UserService.configuration({jobschedulerId: filter.jobschedulerId, id: filter.id}).then(function (conf) {
                vm.historyFilter = JSON.parse(conf.configuration.configurationItem);
                vm.historyFilter.shared = filter.shared;
                vm.paths = vm.historyFilter.paths;
                vm.orders = vm.historyFilter.orders;
                vm.jobChains = vm.historyFilter.jobChains;
                vm.jobs = vm.historyFilter.jobs;
                vm.object.paths = vm.paths;
                vm.object.orders = vm.orders;
                vm.object.jobChains = vm.jobChains;
                vm.object.jobs = vm.jobs;
            });


            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/edit-history-filter-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                size: 'lg',
                backdrop: 'static'
            });
            modalInstance.result.then(function () {

                if (vm.historyFilters.type == 'jobChain') {
                    if (vm.savedHistoryFilter.selected == filter.id) {
                        vm.selectedFiltered1 = vm.historyFilter;
                        vm.historyFilters.order.selectedView = true;
                        vm.init({jobschedulerId: $scope.schedulerIds.selected});
                        isCustomizationSelected1(true);
                    }
                    vm.historyFilterObj.order = vm.savedHistoryFilter;

                } else {
                    if (vm.savedJobHistoryFilter.selected == filter.id) {
                        vm.selectedFiltered2 = vm.historyFilter;
                        vm.historyFilters.task.selectedView = true;
                        vm.init({jobschedulerId: $scope.schedulerIds.selected});
                        isCustomizationSelected2(true);
                    }
                    vm.historyFilterObj.job = vm.savedJobHistoryFilter;
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
                temp_name ='';
            }, function () {
temp_name ='';
            });
        };

        vm.copyFilter = function (filter) {
            vm.action = 'copy';
            vm.isUnique = true;
            UserService.configuration({jobschedulerId: filter.jobschedulerId, id: filter.id}).then(function (conf) {
                vm.historyFilter = JSON.parse(conf.configuration.configurationItem);
                vm.historyFilter.shared = filter.shared;
                vm.paths = vm.historyFilter.paths;
                vm.orders = vm.historyFilter.orders;
                vm.jobChains = vm.historyFilter.jobChains;
                vm.jobs = vm.historyFilter.jobs;
                vm.object.paths = vm.paths;
                vm.object.orders = vm.orders;
                vm.object.jobChains = vm.jobChains;
                vm.object.jobs = vm.jobs;
                if (vm.historyFilters.type == 'jobChain') {
                    vm.historyFilter.name = vm.checkCopyName(vm.orderHistoryFilterList, filter.name);
                } else {
                    vm.historyFilter.name = vm.checkCopyName(vm.jobHistoryFilterList, filter.name);
                }
            });

            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/edit-history-filter-dialog.html',
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
                    if (vm.historyFilters.type == 'jobChain') {
                        vm.orderHistoryFilterList.push(configObj);
                    } else {
                        vm.jobHistoryFilterList.push(configObj);
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

                if (vm.historyFilters.type == 'jobChain') {
                    angular.forEach(vm.orderHistoryFilterList, function (value, index) {
                        if (value.id == filter.id) {
                            vm.orderHistoryFilterList.splice(index, 1);
                        }
                    });

                    if (vm.savedHistoryFilter.selected == filter.id) {
                        vm.savedHistoryFilter.selected = undefined;
                        vm.historyFilters.order.selectedView = false;
                        vm.selectedFiltered1 = undefined;
                        isCustomizationSelected1(false);
                        vm.init({jobschedulerId: $scope.schedulerIds.selected});
                    } else {
                        if (vm.orderHistoryFilterList.length == 0) {
                            vm.savedHistoryFilter.selected = undefined;
                            vm.historyFilters.order.selectedView = false;
                            vm.selectedFiltered1 = undefined;
                            isCustomizationSelected1(false);
                        }
                    }
                    vm.historyFilterObj.order = vm.savedHistoryFilter;
                } else {
                    angular.forEach(vm.jobHistoryFilterList, function (value, index) {
                        if (value.id == filter.id) {
                            vm.jobHistoryFilterList.splice(index, 1);
                        }
                    });

                    if (vm.savedJobHistoryFilter.selected == filter.id) {
                        vm.savedJobHistoryFilter.selected = undefined;
                        vm.historyFilters.task.selectedView = false;
                        vm.selectedFiltered2 = undefined;
                        vm.init({jobschedulerId: $scope.schedulerIds.selected});
                        isCustomizationSelected2(false);
                    } else {
                        if (vm.jobHistoryFilterList.length == 0) {
                            vm.savedJobHistoryFilter.selected = undefined;
                            vm.historyFilters.task.selectedView = false;
                            vm.selectedFiltered2 = undefined;
                            isCustomizationSelected2(false);
                        }
                    }
                    vm.historyFilterObj.job = vm.savedJobHistoryFilter;
                }
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
                    if (vm.historyFilters.type == 'jobChain') {
                        angular.forEach(vm.orderHistoryFilterList, function (value, index) {
                            if (value.id == configObj.id) {
                                vm.orderHistoryFilterList.splice(index, 1);
                            }
                        });
                    } else {
                        angular.forEach(vm.jobHistoryFilterList, function (value, index) {
                            if (value.id == configObj.id) {
                                vm.jobHistoryFilterList.splice(index, 1);
                            }
                        });
                    }
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
            if (vm.historyFilters.type == 'jobChain') {
                vm.savedHistoryFilter.favorite = filter.id;
                vm.historyFilters.order.selectedView = true;
                vm.historyFilterObj.order = vm.savedHistoryFilter;
            } else {
                vm.savedJobHistoryFilter.favorite = filter.id;
                vm.historyFilters.task.selectedView = true;
                vm.historyFilterObj.job = vm.savedJobHistoryFilter;
            }
            SavedFilter.setHistory(vm.historyFilterObj);
            SavedFilter.save();
            vm.init({jobschedulerId: $scope.schedulerIds.selected});
        };

        vm.removeFavorite = function () {
            if (vm.historyFilters.type == 'jobChain') {
                vm.savedHistoryFilter.favorite = '';
                vm.historyFilterObj.order = vm.savedHistoryFilter;
            } else {
                vm.savedJobHistoryFilter.favorite = '';
                vm.historyFilterObj.job = vm.savedJobHistoryFilter;
            }
            vm.filters.favorite = '';
            SavedFilter.setHistory(vm.historyFilterObj);
            SavedFilter.save();
        };
        vm.checkFilterName = function () {
            vm.isUnique = true;
            if (vm.historyFilters.type == 'jobChain') {
                if (vm.jobChainSearch && vm.jobChainSearch.name) {
                    angular.forEach(vm.orderHistoryFilterList, function (value) {
                        if (vm.jobChainSearch.name == value.name && vm.permission.user == value.account) {
                            vm.isUnique = false;
                        }
                    });
                } else if (vm.historyFilter) {
                    angular.forEach(vm.orderHistoryFilterList, function (value) {
                        if (vm.historyFilter.name == value.name && vm.permission.user == value.account && vm.historyFilter.name != temp_name) {
                            vm.isUnique = false;
                        }
                    });
                }
            } else {
                 if (vm.jobSearch && vm.jobSearch.name) {
                    angular.forEach(vm.jobHistoryFilterList, function (value) {
                        if (vm.jobSearch.name == value.name && vm.permission.user == value.account) {
                            vm.isUnique = false;
                        }
                    });
                } else if (vm.historyFilter) {
                     angular.forEach(vm.jobHistoryFilterList, function (value) {
                         if (vm.historyFilter.name == value.name && vm.permission.user == value.account && vm.historyFilter.name != temp_name) {
                             vm.isUnique = false;
                         }
                     });
                 }
            }
        };

        vm.changeFilter = function (filter) {
            if (vm.historyFilters.type == 'jobChain') {
                if (filter) {
                    vm.savedHistoryFilter.selected = filter.id;
                    vm.historyFilters.order.selectedView = true;
                    UserService.configuration({
                        jobschedulerId: filter.jobschedulerId,
                        id: filter.id
                    }).then(function (conf) {
                        vm.selectedFiltered1 = JSON.parse(conf.configuration.configurationItem);
                        vm.selectedFiltered1.account = filter.account;
                        vm.init({jobschedulerId: $scope.schedulerIds.selected});
                    });
                }
                else {
                    isCustomizationSelected1(false);
                    vm.savedHistoryFilter.selected = filter;
                    vm.historyFilters.order.selectedView = false;
                    vm.selectedFiltered1 = filter;
                    vm.init({jobschedulerId: $scope.schedulerIds.selected});
                }

                vm.historyFilterObj.order = vm.savedHistoryFilter;

            } else {
                if (filter) {
                    vm.savedJobHistoryFilter.selected = filter.id;
                    vm.historyFilters.task.selectedView = true;
                    UserService.configuration({
                        jobschedulerId: filter.jobschedulerId,
                        id: filter.id
                    }).then(function (conf) {
                        vm.selectedFiltered2 = JSON.parse(conf.configuration.configurationItem);
                        vm.selectedFiltered2.account = filter.account;
                        vm.init({jobschedulerId: $scope.schedulerIds.selected});
                    });
                }
                else {
                    isCustomizationSelected2(false);
                    vm.savedJobHistoryFilter.selected = filter;
                    vm.historyFilters.task.selectedView = false;
                    vm.selectedFiltered2 = filter;
                    vm.init({jobschedulerId: $scope.schedulerIds.selected});
                }

                vm.historyFilterObj.job = vm.savedJobHistoryFilter;
            }

            SavedFilter.setHistory(vm.historyFilterObj);
            SavedFilter.save();
        };

        vm.expanding_property = {
            field: "name"
        };

        vm.filter_tree = {};
        vm.filter_tree1 = {};
        vm.getTreeStructure = function () {
            $('#treeModal').modal('show');
            if (vm.historyFilters.type == 'jobChain') {
                OrderService.tree({
                    jobschedulerId: vm.schedulerIds.selected,
                    compact: true,
                    types: ['ORDER']
                }).then(function (res) {
                    vm.tree = res.folders;
                }, function (err) {
                    $('#treeModal').modal('hide');
                });
            } else {
                JobService.tree({
                    jobschedulerId: vm.schedulerIds.selected,
                    compact: true,
                    types: ['JOB']
                }).then(function (res) {
                    vm.tree = res.folders
                }, function () {
                    $('#treeModal').modal('hide');
                });
            }
        };

        vm.getTreeStructureForObjects = function () {
            $('#objectModal').modal('show');
            if (vm.historyFilters.type == 'jobChain') {
                OrderService.tree({
                    jobschedulerId: vm.schedulerIds.selected,
                    compact: true,
                    types: ['ORDER']
                }).then(function (res) {
                    vm.tree1 = res.folders;

                }, function (err) {
                    $('#objectModal').modal('hide');
                });
            } else {
                JobService.tree({
                    jobschedulerId: vm.schedulerIds.selected,
                    compact: true,
                    types: ['JOB']
                }).then(function (res) {
                    vm.tree1 = res.folders;
                }, function () {
                    $('#objectModal').modal('hide');
                });
            }
        };

        vm.treeHandler = function (data) {
            data.expanded = !data.expanded;
            if (data.expanded) {
                if (vm.historyFilters.type == 'jobChain') {
                    data.jobChains = [];
                    var obj = {};
                    obj.jobschedulerId = vm.schedulerIds.selected;
                    obj.compact = true;
                    obj.folders = [{folder: data.path, recursive: false}];
                    OrderService.getOrdersP(obj).then(function (result) {
                        data.jobChains = result.orders;
                        if (window.localStorage.$SOS$THEME == 'lighter' || window.localStorage.$SOS$THEME == 'light') {
                            $('.order_img').attr("src", 'images/order.png');
                        }
                    });
                } else {
                    data.jobs = [];
                    var obj = {};
                    obj.jobschedulerId = vm.schedulerIds.selected;
                    obj.compact = true;
                    obj.folders = [{folder: data.path, recursive: false}];
                    JobService.getJobsP(obj).then(function (result) {
                        data.jobs = result.jobs;
                        if (window.localStorage.$SOS$THEME == 'lighter' || window.localStorage.$SOS$THEME == 'light') {
                            $('.job_img').attr("src", 'images/job.png');
                        }
                    });
                }
            }else{
                data.jobChains = [];
                data.jobs = [];
            }
        };

        vm.treeHandler1 = function (data) {
            if (data.expanded) {
                data.folders = orderBy(data.folders, 'name');
            }
        };
        vm.object.paths = [];
        vm.object.orders = [];
        vm.object.jobChains = [];
        vm.object.jobs = [];
        var watcher6 = $scope.$watchCollection('object.paths', function (newNames) {
            if (newNames && newNames.length > 0) {
                vm.paths = newNames;
            }
        });
        var watcher7 = $scope.$watchCollection('object.orders', function (newNames) {
            if (newNames && newNames.length > 0) {
                vm.orders = [];
                angular.forEach(newNames, function (v) {
                    vm.orders.push({orderId: v.orderId, jobChain: v.jobChain});
                });
            }
        });
        var watcher8 = $scope.$watchCollection('object.jobChains', function (newNames) {
            if (newNames && newNames.length > 0) {
                vm.jobChains = newNames;
            }
        });
        var watcher9 = $scope.$watchCollection('object.jobs', function (newNames) {
            if (newNames && newNames.length > 0) {
                vm.jobs = newNames;
            }
        });

        vm.addFolderPaths = function () {
            if (vm.historyFilter)
                vm.historyFilter.paths = vm.paths;
            else if (vm.jobChainSearch && vm.historyFilters.type == 'jobChain')
                vm.jobChainSearch.paths = vm.paths;
            else if (vm.jobSearch && vm.historyFilters.type == 'job')
                vm.jobSearch.paths = vm.paths;
        };
        vm.addObjectPaths = function () {
            if (vm.historyFilters.type == 'jobChain') {
                if (vm.historyFilter) {
                    vm.historyFilter.orders = vm.orders;
                    vm.historyFilter.jobChains = vm.jobChains;
                } else if (vm.jobChainSearch) {
                    vm.jobChainSearch.orders = vm.orders;
                    vm.jobChainSearch.jobChains = vm.jobChains;
                }
            } else {
                if (vm.historyFilter) {
                    vm.historyFilter.jobs = vm.jobs;
                } else if (vm.jobSearch) {
                    vm.jobSearch.jobs = vm.jobs;
                }
            }
        };
        vm.remove = function (object, type) {
            if (type == 'jobChain') {
                if (vm.historyFilter && vm.historyFilter.jobChains) {
                    vm.historyFilter.jobChains.splice(object, 1);
                } else {
                    vm.jobChainSearch.jobChains.splice(object, 1);
                }
                vm.object.jobChains.splice(object, 1);
            } else if (type == 'job') {
                if (vm.historyFilter && vm.historyFilter.jobs) {
                    vm.historyFilter.jobs.splice(object, 1);
                } else {
                    vm.jobSearch.jobs.splice(object, 1);
                }
                vm.object.jobs.splice(object, 1);
            } else if (type == 'order') {
                if (vm.historyFilter && vm.historyFilter.orders) {
                    vm.historyFilter.orders.splice(object, 1);
                } else {
                    vm.jobChainSearch.orders.splice(object, 1);
                }
                vm.object.orders.splice(object, 1);
            } else {
                if (vm.historyFilter && vm.historyFilter.paths) {
                    vm.historyFilter.paths.splice(object, 1);
                } else {
                    if (vm.jobChainSearch && vm.historyFilters.type == 'jobChain')
                        vm.jobChainSearch.paths.splice(object, 1);
                    else if (vm.jobSearch && vm.historyFilters.type == 'job')
                        vm.jobSearch.paths.splice(object, 1);
                }
                vm.object.paths.splice(object, 1);
            }
        };

        /**--------------- ignore list functions -------------*/

        vm.addOrderToIgnoreList = function (orderId, jobChain) {
            var obj = {
                jobChain: jobChain,
                orderId: orderId
            };

            if (vm.savedIgnoreList.orders.indexOf(obj) === -1) {
                vm.savedIgnoreList.orders.push(obj);
                if ((vm.savedIgnoreList.isEnable == 'true' || vm.savedIgnoreList.isEnable == true)) {
                    if (jobChainSearch) {
                        vm.search(true);
                    } else {
                        vm.init({jobschedulerId: $scope.schedulerIds.selected});
                    }
                }
                configObj.configurationType = "IGNORELIST";
                configObj.id = vm.ignoreListConfigId;
                configObj.configurationItem = JSON.stringify(vm.savedIgnoreList);
                UserService.saveConfiguration(configObj).then(function (res) {
                    vm.ignoreListConfigId = res.id;
                })
            }
        };

        vm.addJobChainToIgnoreList = function (name) {
            if (vm.savedIgnoreList.jobChains.indexOf(name) === -1) {
                vm.savedIgnoreList.jobChains.push(name);
                if ((vm.savedIgnoreList.isEnable == 'true' || vm.savedIgnoreList.isEnable == true)) {
                    if (jobChainSearch) {
                        vm.search(true);
                    } else {
                        vm.init({jobschedulerId: $scope.schedulerIds.selected});
                    }
                }
                configObj.configurationType = "IGNORELIST";
                configObj.id = vm.ignoreListConfigId;
                configObj.configurationItem = JSON.stringify(vm.savedIgnoreList);
                UserService.saveConfiguration(configObj).then(function (res) {
                    vm.ignoreListConfigId = res.id;
                })
            }
        };

        vm.addJobToIgnoreList = function (name) {
            if (vm.savedIgnoreList.jobs.indexOf(name) === -1) {
                vm.savedIgnoreList.jobs.push(name);
                if ((vm.savedIgnoreList.isEnable == 'true' || vm.savedIgnoreList.isEnable == true)) {
                    if (jobSearch) {
                        vm.search(true);
                    } else {
                        vm.init({jobschedulerId: $scope.schedulerIds.selected});
                    }
                }
                configObj.configurationType = "IGNORELIST";
                configObj.id = vm.ignoreListConfigId;
                configObj.configurationItem = JSON.stringify(vm.savedIgnoreList);
                UserService.saveConfiguration(configObj).then(function (res) {
                    vm.ignoreListConfigId = res.id;
                })
            }
        };

        vm.editIgnoreList = function () {
            if ((vm.savedIgnoreList.jobChains && vm.savedIgnoreList.jobChains.length > 0) || (vm.savedIgnoreList.orders && vm.savedIgnoreList.orders.length > 0) || (vm.savedIgnoreList.jobs && vm.savedIgnoreList.jobs.length > 0)) {
                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/edit-ignorelist-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
            }
        };

        vm.removeOrderIgnoreList = function (name) {
            vm.savedIgnoreList.orders.splice(vm.savedIgnoreList.orders.indexOf(name), 1);
            configObj.configurationType = "IGNORELIST";
            configObj.configurationItem = JSON.stringify(vm.savedIgnoreList);
            configObj.id = vm.ignoreListConfigId;
            UserService.saveConfiguration(configObj).then(function (res) {
                vm.ignoreListConfigId = res.id;
            });
            if ((vm.savedIgnoreList.isEnable == 'true' || vm.savedIgnoreList.isEnable == true)) {
                if ((jobChainSearch && vm.historyFilters.type == 'jobChain')) {
                    vm.search(true);
                } else
                    vm.init({jobschedulerId: $scope.schedulerIds.selected});
            }
        };
        vm.removeJobChainIgnoreList = function (name) {
            vm.savedIgnoreList.jobChains.splice(vm.savedIgnoreList.jobChains.indexOf(name), 1);
            configObj.configurationType = "IGNORELIST";
            configObj.configurationItem = JSON.stringify(vm.savedIgnoreList);
            configObj.id = vm.ignoreListConfigId;
            UserService.saveConfiguration(configObj).then(function (res) {
                vm.ignoreListConfigId = res.id;
            })
            if ((vm.savedIgnoreList.isEnable == 'true' || vm.savedIgnoreList.isEnable == true)) {
                if ((jobChainSearch && vm.historyFilters.type == 'jobChain')) {
                    vm.search(true);
                } else
                    vm.init({jobschedulerId: $scope.schedulerIds.selected});
            }
        };
        vm.removeJobIgnoreList = function (name) {
            vm.savedIgnoreList.jobs.splice(vm.savedIgnoreList.jobs.indexOf(name), 1);
            configObj.configurationType = "IGNORELIST";
            configObj.configurationItem = JSON.stringify(vm.savedIgnoreList);
            configObj.id = vm.ignoreListConfigId;
            UserService.saveConfiguration(configObj).then(function (res) {
                vm.ignoreListConfigId = res.id;
            })
            if ((vm.savedIgnoreList.isEnable == 'true' || vm.savedIgnoreList.isEnable == true)) {
                if ((jobSearch && vm.historyFilters.type != 'jobChain')) {
                    vm.search(true);
                } else
                    vm.init({jobschedulerId: $scope.schedulerIds.selected});
            }
        };

        vm.resetIgnoreList = function () {

            if ((vm.savedIgnoreList.isEnable == 'true' || vm.savedIgnoreList.isEnable == true) && vm.historyFilters.type == 'jobChain' && ((vm.savedIgnoreList.jobChains && vm.savedIgnoreList.jobChains.length > 0) || (vm.savedIgnoreList.orders && vm.savedIgnoreList.orders.length > 0))) {
                if (jobChainSearch) {
                    vm.search(true);
                } else
                    vm.init({jobschedulerId: $scope.schedulerIds.selected});
            } else if ((vm.savedIgnoreList.isEnable == 'true' || vm.savedIgnoreList.isEnable == true) && vm.historyFilters.type != 'jobChain' && (vm.savedIgnoreList.jobs && vm.savedIgnoreList.jobs.length > 0)) {
                if (jobSearch) {
                    vm.search(true);
                } else
                    vm.init({jobschedulerId: $scope.schedulerIds.selected});
            }
            vm.savedIgnoreList.orders = [];
            vm.savedIgnoreList.jobChains = [];
            vm.savedIgnoreList.jobs = [];
            vm.savedIgnoreList.isEnable = false;
            configObj.configurationType = "IGNORELIST";
            configObj.id = vm.ignoreListConfigId;
            configObj.configurationItem = JSON.stringify(vm.savedIgnoreList);
            UserService.saveConfiguration(configObj).then(function (res) {
                vm.ignoreListConfigId = res.id;
            })
        };

        vm.enableDisableIgnoreList = function () {
            vm.savedIgnoreList.isEnable = !vm.savedIgnoreList.isEnable;
            configObj.configurationType = "IGNORELIST";
            configObj.id = vm.ignoreListConfigId;
            configObj.configurationItem = JSON.stringify(vm.savedIgnoreList);
            UserService.saveConfiguration(configObj).then(function (res) {
                vm.ignoreListConfigId = res.id;
            })
            if ((jobSearch && vm.historyFilters.type != 'jobChain') || (jobChainSearch && vm.historyFilters.type == 'jobChain')) {
                vm.search(true);
            } else
                vm.init({jobschedulerId: $scope.schedulerIds.selected});
        };

        vm.$on('event-started', function () {
            if (vm.events && vm.events[0] && vm.events[0].eventSnapshots) {
                for (var i = 0; i <= vm.events[0].eventSnapshots.length - 1; i++) {
                    if (vm.events[0].eventSnapshots[i].eventType == 'ReportingChangedOrder' && isLoaded) {
                        isLoaded = false;
                        var filter = {};
                        filter.jobschedulerId = $scope.schedulerIds.selected;

                        if (vm.selectedFiltered1) {
                            filter = orderParseDate(filter);
                        } else {
                            filter = setOrderDateRange(filter);
                            if (vm.order.filter.historyStates != 'all') {
                                filter.historyStates = [];
                                filter.historyStates.push(vm.order.filter.historyStates);
                            }
                        }
                        filter.limit = parseInt(vm.userPreferences.maxRecords);
                        if (jobChainSearch) {
                            vm.search(true);
                        } else {
                            OrderService.histories(filter).then(function (res) {
                                vm.historys = res.history;
                                isLoaded = true;
                            }, function () {
                                isLoaded = true;
                            });
                        }

                        break;
                    } else if (vm.events[0].eventSnapshots[i].eventType == 'ReportingChangedJob' && isLoaded) {
                        isLoaded = false;
                        var filter = {};
                        filter.jobschedulerId = $scope.schedulerIds.selected;
                        if (vm.selectedFiltered2) {
                            filter = jobParseDate(filter);
                        } else {
                            filter = setTaskDateRange(filter);
                            if (vm.task.filter.historyStates != 'all') {
                                filter.historyStates = [];
                                filter.historyStates.push(vm.task.filter.historyStates);
                            }
                        }
                        filter.limit = parseInt(vm.userPreferences.maxRecords);
                        if (jobSearch) {
                            vm.search(true);
                        } else {
                            TaskService.histories(filter).then(function (res) {
                                vm.jobHistorys = res.history;
                                isLoaded = true;
                            }, function () {
                                isLoaded = true;
                            });
                        }
                        break;
                    }
                }
            }
        });

        $scope.$on('$destroy', function () {
            watcher6();
            watcher7();
            watcher8();
            watcher9();
            if (promise1) {
                $timeout.cancel(promise1);
            }
        });
    }

    LogCtrl.$inject = ["$scope", "OrderService", "TaskService", "$location", "FileSaver", "Blob", "$sce", "$timeout"];
    function LogCtrl($scope, OrderService, TaskService, $location, FileSaver, Blob, $sce, $timeout) {
        var vm = $scope;
        vm.isLoading = false;

        vm.logClass = function (logData) {
            var logStatus = logData.substring(logData.indexOf("[") + 1, logData.indexOf("]"));
            return "log_" + logStatus.toLowerCase();
        };
        vm.downloadLog = function () {
            var data = new Blob([vm.logs], {type: 'text/plain;charset=utf-8'});
            FileSaver.saveAs(data, 'history.log');
        };
        var object = $location.search();
        var t1;
        vm.loadOrderLog = function () {

            vm.jobChain = object.jobChain;
            var orders = {};
            orders.jobschedulerId = $scope.schedulerIds.selected;
            orders.jobChain = vm.jobChain;
            orders.orderId = object.orderId;
            orders.historyId = object.historyId;
            orders.mime = ['HTML'];
            OrderService.log(orders).then(function (res) {
                if (res.log)
                    vm.logs = $sce.trustAsHtml(res.log.html);
                vm.isLoading = true;

                t1 = $timeout(function () {
                    if (vm.userPreferences.theme != 'light')
                        $('.log_info').css('color', 'white')
                }, 100);
            }, function () {
                vm.isLoading = true;
            });
        };
        vm.loadJobLog = function () {

            vm.job = object.job;
            var jobs = {};
            jobs.jobschedulerId = $scope.schedulerIds.selected;
            jobs.taskId = object.taskId;
            jobs.mime = ['HTML'];
            TaskService.log(jobs).then(function (res) {
                if (res.log)
                    vm.logs = $sce.trustAsHtml(res.log.html);
                vm.isLoading = true;
                t1 = $timeout(function () {
                    if (vm.userPreferences.theme != 'light')
                        $('.log_info').css('color', 'white')
                }, 100);
            }, function () {
                vm.isLoading = true;
            });
        };
        if (object.historyId) {
            vm.orderId = object.orderId;
            vm.loadOrderLog();
        }
        else {
            vm.taskId = object.taskId;
            vm.loadJobLog();
        }
        $scope.$on('$destroy', function () {
            if (t1)
                $timeout.cancel(t1);
        });

    }
})();
