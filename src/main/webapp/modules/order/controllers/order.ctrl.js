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

    JobChainOrdersCtrl.$inject = ["$scope", "SOSAuth", "OrderService", "CoreService", "AuditLogService", "$location"];
    function JobChainOrdersCtrl($scope, SOSAuth, OrderService, CoreService, AuditLogService, $location) {
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
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.compact = true;
            obj.orders = [];
            if ($location.search().path) {
                obj.orders.push({jobChain: $location.search().path});
            } else if (SOSAuth.jobChain) {
                vm.jobChain = JSON.parse(SOSAuth.jobChain);
                obj.orders.push({jobChain: vm.jobChain.path});
            }

            if (vm.orderFilters.filter.state && vm.orderFilters.filter.state != 'ALL') {
                obj.processingStates = [];
                obj.processingStates.push(vm.orderFilters.filter.state);
            }
            if (loadFinished)
                loadOrders(obj);

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
                obj.jobschedulerId = vm.schedulerIds.selected;
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
            orders.orders = [];
            orders.orders.push({orderId: value.orderId, jobChain: value.path.split(',')[0]});
            orders.jobschedulerId = vm.schedulerIds.selected;
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

        $scope.$on('event-started', function () {
            if (vm.events && vm.events[0] && vm.events[0].eventSnapshots && vm.showLogPanel)
                angular.forEach(vm.events[0].eventSnapshots, function (event) {
                    if (event.eventType == "ReportingChangedOrder" && !event.eventId) {
                        vm.showLogFuc(vm.showLogPanel);
                    }
                    if (vm.showLogPanel && event.eventType == "AuditLogChanged" && (event.objectType == "ORDER") && event.path == vm.showLogPanel.path) {
                        var obj = {};
                        obj.jobschedulerId = vm.schedulerIds.selected;
                        obj.orders = [];
                        obj.orders.push({jobChain: vm.showLogPanel.jobChain, orderId: vm.showLogPanel.orderId});
                        loadAuditLogs(obj);
                    }
                });
        });

    }

    JobChainOverviewCtrl.$inject = ["$scope", "$rootScope", "OrderService", "SOSAuth", "JobChainService", "JobService", "$timeout", "DailyPlanService", "$state", "$location",
        "CoreService", "$uibModal", "AuditLogService", "FileSaver", "$filter"];
    function JobChainOverviewCtrl($scope, $rootScope, OrderService, SOSAuth, JobChainService, JobService, $timeout, DailyPlanService, $state, $location,
                                  CoreService, $uibModal, AuditLogService, FileSaver, $filter) {

        var vm = $scope;
        vm.orderFilters = CoreService.getOrderDetailTab();
        vm.orderFilters.pageView = 'grid';
        vm.status = vm.orderFilters.filter.state;
        vm.loading = true;

        vm.orderFilters.overview = true;

        vm.selectedNodes = [];

        vm.obj = {};
        vm.obj.orders = [];
        var promise1, promise2;
        var object = $location.search();

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
            jobInfo.jobschedulerId = vm.schedulerIds.selected;
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

        vm.onAction = onAction;

        function onAction(path, node, action) {
            var nodes = {};
            nodes.nodes = [];
            nodes.jobschedulerId = vm.schedulerIds.selected;
            nodes.nodes.push({jobChain: path, node: node});

            var jobs = {};
            if (action == 'stop jobChain' || action == 'unstop jobChain') {
                jobs.jobChains = [];
                jobs.jobChains.push({jobChain: path});
            } else {
                jobs.jobs = [];
                jobs.jobs.push({job: path});
            }

            jobs.jobschedulerId = vm.schedulerIds.selected;

            var modalInstance = '';
            vm.comments = {};
            vm.comments.radio = 'predefined';

            if (action == 'stop node') {
                if (vm.userPreferences.auditLog) {
                    vm.comments.name = path;
                    vm.comments.operation = 'Stop';
                    vm.comments.node = node;
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
                    vm.comments.operation = 'Skip';
                    vm.comments.node = node;
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
                    vm.comments.node = node;
                    vm.comments.operation = action == 'unskip' ? 'Unskip' : 'Unstop';
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
            nodes.jobschedulerId = vm.schedulerIds.selected;
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
                }, function () {
                });
            } else {
                JobService.stopNode(nodes);
            }
        };

        vm.unStopNode = function (data, jobChain) {

            var nodes = {};
            nodes.nodes = [];
            nodes.jobschedulerId = vm.schedulerIds.selected;
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
                }, function () {

                });
            } else {
                JobService.activateNode(nodes);
            }
        };

        vm.skipNode = function (data, jobChain) {
            var nodes = {};
            nodes.nodes = [];
            nodes.jobschedulerId = vm.schedulerIds.selected;
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
                }, function () {

                });
            } else {
                JobService.skipNode(nodes);
            }
        };

        vm.unskipNode = function (data, jobChain) {

            var nodes = {};
            nodes.nodes = [];
            nodes.jobschedulerId = vm.schedulerIds.selected;
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
                }, function () {

                });
            } else {
                JobService.activateNode(nodes);
            }
        };

        vm.stopJob = function (data) {
            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
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
                }, function () {

                });
            } else {
                JobService.stop(jobs);
            }
        };

        vm.unstopJob = function (data) {

            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
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
            jobs.jobschedulerId = vm.schedulerIds.selected;

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
                    JobService.stop(jobs).then(function () {
                        $rootScope.$broadcast('bulkOperationCompleted', {
                            operation: 'stopJobs',
                            status: 'success'
                        });
                    });
                    vm.reset();
                }, function () {

                });
            } else {
                JobService.stop(jobs).then(function () {
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
            jobs.jobschedulerId = vm.schedulerIds.selected;

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
                    JobService.unstop(jobs).then(function () {
                        $rootScope.$broadcast('bulkOperationCompleted', {operation: 'unstopJobs', status: 'success'});
                    });
                    vm.reset();
                }, function () {

                });
            } else {
                JobService.unstop(jobs).then(function () {
                    $rootScope.$broadcast('bulkOperationCompleted', {operation: 'unstopJobs', status: 'success'});
                });
                vm.reset();
            }

        };

        vm.skipNodes = function () {
            var nodes = {};
            nodes.nodes = [];
            nodes.jobschedulerId = vm.schedulerIds.selected;

            angular.forEach(vm.selectedNodes, function (value) {
                nodes.nodes.push({jobChain: vm.jobChain.path, node: value.name});
            });
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = vm.jobChain.path;
                vm.comments.title = vm.jobChain.title;
                vm.comments.node = '';
                vm.comments.operation = 'Skip';
                vm.comments.type = 'Job Chain';
                angular.forEach(vm.selectedNodes, function (value, index) {
                    if (index == vm.selectedNodes.length - 1) {
                        vm.comments.node = vm.comments.node + ' ' + value.name;
                    } else {
                        vm.comments.node = value.name + ', ' + vm.comments.node;
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
                    JobService.skipNode(nodes).then(function () {
                        $rootScope.$broadcast('bulkOperationCompleted', {operation: 'skipNodes', status: 'success'});
                    });
                    vm.reset();
                }, function () {

                });
            } else {
                JobService.skipNode(nodes).then(function () {
                    $rootScope.$broadcast('bulkOperationCompleted', {operation: 'skipNodes', status: 'success'});
                });
                vm.reset();
            }

        };

        vm.unskipNodes = function () {

            var nodes = {};
            nodes.nodes = [];
            nodes.jobschedulerId = vm.schedulerIds.selected;

            angular.forEach(vm.selectedNodes, function (value) {
                nodes.nodes.push({jobChain: vm.jobChain.path, node: value.name});
            });
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = vm.jobChain.path;
                vm.comments.title = vm.jobChain.title;
                vm.comments.node = '';
                vm.comments.operation = 'Unskip';
                vm.comments.type = 'Job Chain';
                angular.forEach(vm.selectedNodes, function (value, index) {
                    if (index == vm.selectedNodes.length - 1) {
                        vm.comments.node = vm.comments.node + ' ' + value.name;
                    } else {
                        vm.comments.node = value.name + ', ' + vm.comments.node;
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
                    JobService.activateNode(nodes).then(function () {
                        $rootScope.$broadcast('bulkOperationCompleted', {operation: 'unskipNodes', status: 'success'});
                    });
                    vm.reset();
                }, function () {

                });
            } else {
                JobService.activateNode(nodes).then(function () {
                    $rootScope.$broadcast('bulkOperationCompleted', {operation: 'unskipNodes', status: 'success'});
                });
                vm.reset();
            }

        };

        vm.stopNodes = function () {

            var nodes = {};
            nodes.nodes = [];
            nodes.jobschedulerId = vm.schedulerIds.selected;

            angular.forEach(vm.selectedNodes, function (value) {
                nodes.nodes.push({jobChain: vm.jobChain.path, node: value.name});
            });
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = vm.jobChain.path;
                vm.comments.title = vm.jobChain.title;
                vm.comments.node = '';
                vm.comments.operation = 'Stop';
                vm.comments.type = 'Job Chain';
                angular.forEach(vm.selectedNodes, function (value, index) {
                    if (index == vm.selectedNodes.length - 1) {
                        vm.comments.node = vm.comments.node + ' ' + value.name;
                    } else {
                        vm.comments.node = value.name + ', ' + vm.comments.node;
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
                    JobService.stopNode(nodes).then(function () {
                        $rootScope.$broadcast('bulkOperationCompleted', {operation: 'stopNodes', status: 'success'});
                    });
                    vm.reset();
                }, function () {

                });
            } else {
                JobService.stopNode(nodes).then(function () {
                    $rootScope.$broadcast('bulkOperationCompleted', {operation: 'stopNodes', status: 'success'});
                });
                vm.reset();
            }

        };

        vm.unstopNodes = function () {

            var nodes = {};
            nodes.nodes = [];
            nodes.jobschedulerId = vm.schedulerIds.selected;

            angular.forEach(vm.selectedNodes, function (value) {
                nodes.nodes.push({jobChain: vm.jobChain.path, node: value.name});
            });
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = vm.jobChain.path;
                vm.comments.title = vm.jobChain.title;
                vm.comments.node = '';
                vm.comments.operation = 'Unstop';
                vm.comments.type = 'Job Chain';
                angular.forEach(vm.selectedNodes, function (value, index) {
                    if (index == vm.selectedNodes.length - 1) {
                        vm.comments.node = vm.comments.node + ' ' + value.name;
                    } else {
                        vm.comments.node = value.name + ', ' + vm.comments.node;
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
                    JobService.activateNode(nodes).then(function () {
                        $rootScope.$broadcast('bulkOperationCompleted', {operation: 'unstopNodes', status: 'success'});
                    });
                }, function () {

                });
            } else {
                JobService.activateNode(nodes).then(function () {
                    $rootScope.$broadcast('bulkOperationCompleted', {operation: 'unstopNodes', status: 'success'});
                });
            }
            vm.reset();
        };

        vm.stopJobChains = function () {
            var jobChains = {};
            jobChains.jobChains = [];
            jobChains.jobschedulerId = vm.schedulerIds.selected;

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
                    JobChainService.stop(jobChains).then(function () {
                        $rootScope.$broadcast('bulkOperationCompleted', {
                            operation: 'stopJobChains',
                            status: 'success'
                        });
                    });
                    vm.reset();
                }, function () {

                });
            } else {
                JobChainService.stop(jobChains).then(function () {
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
            jobChains.jobschedulerId = vm.schedulerIds.selected;

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
                    JobChainService.unstop(jobChains).then(function () {
                        $rootScope.$broadcast('bulkOperationCompleted', {
                            operation: 'unstopJobChains',
                            status: 'success'
                        });
                    });
                    vm.reset();
                }, function () {

                });
            } else {
                JobChainService.unstop(jobChains).then(function () {
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

        function setCanvasBackground(canvas) {
            var w = canvas.width;
            var h = canvas.height;
            var context = canvas.getContext("2d");

            context.font = '22px Arial';
            if (vm.jobChain.title) {
                context.fillText('JobChain : ' + vm.jobChain.path + ' - ' + vm.jobChain.title, 10, 50);
            } else {
                context.fillText('JobChain : ' + vm.jobChain.path, 10, 50);
            }

            context.globalCompositeOperation = "destination-over";
            context.fillStyle = getBackground();
            context.fillRect(0, 0, w, h);
        }

        function getBackground() {
            return $(".box").css("background-color");
        }

        function getBoundingNodes() {
            var obj = {maxTop: 0, maxLeft: 0};
            angular.forEach(vm.coords, function (coord) {
                if (coord.left && coord.left > obj.maxLeft) {
                    obj.maxLeft = coord.left;
                }
                if (coord.top && coord.top > obj.maxTop) {
                    obj.maxTop = coord.top;
                }
            });
            return obj;
        }

        vm.exportDiagram = function (type) {
            vm.loading = true;
            var bound = getBoundingNodes();
            var oHeight = $('#exportId').height();
            var oWidth = $('#exportId').width();
            $(".block-ellipsis").css("overflow", "auto");
            $('#exportId').height(bound.maxTop + 600);
            $('#exportId').width(bound.maxLeft + 100);
            if (type == 'png') {
                $('#exportId').css("padding-left", 10);
            }

            if (vm.slider && vm.slider.value != 100) {
                $("#zoomCn").css("zoom", 1);
                $("#zoomCn").css("transform", "Scale(1)");
                $("#zoomCn").css("transform-origin", "0 0");
            }
            var els = $(".orders-block-cls .order-cls").splice(5);
            if (els && els.length > 0) {
                $.each(els, function (i, e) {
                    $(this).hide();
                })
            }
            var fitToScreen = vm.fitToScreen;
            if (vm.fitToScreen) {
                vm.fitToScreen = false;
                setHeight();
            }


            html2canvas($('#exportId'), {
                useCORS: true,

                width: (bound.maxLeft + 100),
                height: (bound.maxTop + 600),
                background: getBackground(),

                onrendered: function (canvas) {
                    var data = canvas.toDataURL('image/png');

                    if (type == 'pdf') {
                        if (vm.jobChain.title) {
                            var text = "Job Chain -" + vm.jobChain.path + " - " + vm.jobChain.title;
                        } else {
                            var text = "Job Chain -" + vm.jobChain.path;
                        }

                        var docDefinition = {
                            content: [{
                                image: data,
                                fit: [bound.maxTop + 100, bound.maxTop + 100]
                            }, {
                                text: text
                            }],
                            pageOrientation: 'landscape'
                        };
                        if ((bound.maxLeft + 100) > 750) {
                            docDefinition.pageSize = {width: (bound.maxLeft + 120), height: 1200};
                        }
                        pdfMake.createPdf(docDefinition).download(vm.jobChain.name + ".pdf");

                    } else {
                        setCanvasBackground(canvas);
                        canvas.toBlob(function (blob) {
                            FileSaver.saveAs(blob, vm.jobChain.name + '.png');
                        }, 'image/png', 1.0)
                    }
                    if (els && els.length > 0) {
                        $.each(els, function (i, e) {
                            $(this).show();
                        })
                    }
                    $('#exportId').height(oHeight);
                    $('#exportId').width(oWidth);
                    $(".block-ellipsis").css("overflow", "hidden");
                    if (vm.slider && vm.slider.value != 100) {
                        $("#zoomCn").css("zoom", vm.slider.value / 100);
                        $("#zoomCn").css("transform", "Scale(" + vm.slider.value / 100 + ")");
                        $("#zoomCn").css("transform-origin", "0 0");
                    }
                    if (type == 'png') {
                        $('#exportId').css("padding-left", 0);
                    }
                    if (fitToScreen) {
                        vm.fitToScreen = true;
                        setHeight();
                    }
                    vm.loading = false;
                }
            });
        };

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
                vm.isStoppedNode = false;
                vm.isSkippedNode = false;
                vm.isActiveNode = false;
                vm.isPendingJob = false;
                vm.isStoppedJobChain = false;
                vm.isJob = false;
                vm.isJobChain = false;

                angular.forEach(newNames, function (value) {
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
        vm.compareFn = function (obj1, obj2) {
            return obj1.name === obj2.name;
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
                filter.jobschedulerId = vm.schedulerIds.selected;

                JobChainService.histories(filter).then(function (res) {
                    vm.orderHistory = res.history;
                    vm.isLoading1 = true;
                    vm.showHistoryPanel = {name: vm.jobChain.path, title: vm.jobChain.title};
                    if (nestedJobChain) {
                        vm.isAuditLog = false;
                        vm.showHistoryPanel = {name: nestedJobChain.path, title: nestedJobChain.title}
                    }
                }, function () {
                    vm.isLoading1 = true;
                });
            }
        }

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
                vm.showHistoryPanel = {name: vm.jobChain.path, title: vm.jobChain.title};
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
            vm.loading = false;
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

            orders.jobschedulerId = vm.schedulerIds.selected;
            var obj = {};
            obj.orderId = order.orderId;
            obj.jobChain = order.jobChain;
            obj.params = order.params;
            obj.state = vm.order.state;
            obj.endState = vm.order.endState;

            if (order.date && order.time) {
                order.date.setHours(moment(order.time, 'HH:mm:ss').hours());
                order.date.setMinutes(moment(order.time, 'HH:mm:ss').minutes());
                order.date.setSeconds(moment(order.time, 'HH:mm:ss').seconds());
            }

            if (order.date && order.at == 'later') {
                obj.at = moment(order.date).format("YYYY-MM-DD HH:mm:ss");
                obj.timeZone = order.timeZone;
            } else {
                obj.at = order.atTime;
            }

            if (!obj.params && paramObject.params.length > 0) {
                obj.params = paramObject.params;
            } else if (obj.params && paramObject.params.length > 0) {
                obj.params = obj.params.concat(paramObject.params);
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
            orders.jobschedulerId = vm.schedulerIds.selected;
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
                endState: vm.order.endState
            });

            OrderService.setOrderState(orders);
        }

        function setRunTime(order) {
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = vm.schedulerIds.selected;
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
                runTime: vkbeautify.xmlmin(order.runTime),
                calendars: order.calendars
            });
            OrderService.setRunTime(orders).then(function () {
                $scope.$emit('refreshList');
            });
        }

        function resumeOrderWithParam(order, paramObject) {
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = vm.schedulerIds.selected;
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

            if (order.params) {
                order.params = order.params.concat(paramObject.params);
            } else {
                order.params = paramObject.params;
            }

            if (order.params && order.params.length > 0) {
                orders.orders.push({
                    orderId: order.orderId,
                    jobChain: order.jobChain,
                    params: order.params,
                    state: vm.order.state,
                    endState: vm.order.endState
                });
            } else {
                orders.orders.push({
                    orderId: order.orderId,
                    jobChain: order.jobChain,
                    state: vm.order.state,
                    endState: vm.order.endState
                });
            }
            delete orders['params'];
            OrderService.resumeOrder(orders);
        }

        function resumeOrderState(order) {
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = vm.schedulerIds.selected;
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
            var orders = {};
            vm.comments = {};
            vm.comments.radio = 'predefined';
            if (action == 'start order now') {

                orders.orders = [];
                orders.jobschedulerId = vm.schedulerIds.selected;
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
            else if (action == 'view log') {
                vm.showLogWindow(order);
            }

            else if (action == 'start order at') {

                orders.orders = [];

                orders.jobschedulerId = vm.schedulerIds.selected;
                orders.orders.push({orderId: order.orderId, jobChain: order.path.split(',')[0]});
                OrderService.get(orders).then(function (res) {
                    order = angular.merge(order, res.orders[0]);
                });
                vm.order = order;
                vm.paramObject = {};
                vm.paramObject.params = [];
                vm.order.atTime = 'now';
                vm.zones = moment.tz.names();
                if (vm.userPreferences.zone) {
                    vm.order.timeZone = vm.userPreferences.zone;
                }

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
                JobChainService.getJobChainP({
                    jobschedulerId: vm.schedulerIds.selected,
                    jobChain: order.jobChain
                }).then(function (res) {
                    vm._jobChain = res.jobChain;
                    angular.forEach(res.jobChain.endNodes, function (value) {
                        vm._jobChain.nodes.push(value);
                    });
                });
            }

            else if (action == 'set order state') {
                vm.order = angular.copy(order);

                JobChainService.getJobChainP({
                    jobschedulerId: vm.schedulerIds.selected,
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

            else if (action == 'set run time') {
                vm.order = order;
                OrderService.getRunTime({
                    jobschedulerId: vm.schedulerIds.selected,
                    jobChain: order.jobChain,
                    orderId: order.orderId
                }).then(function (res) {
                    if (res.runTime) {
                        vm.runTimes = res.runTime;
                        vm.xml = vm.runTimes.runTime;
                        vm.calendars = vm.runTimes.calendars;
                    }
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
                });
            }

            else if (action == 'suspend order') {

                orders.orders = [];
                orders.jobschedulerId = vm.schedulerIds.selected;
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

            else if (action == 'resume order') {

                orders.orders = [];
                orders.jobschedulerId = vm.schedulerIds.selected;
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

            else if (action == 'resume order with param') {

                orders.orders = [];
                orders.jobschedulerId = vm.schedulerIds.selected;
                orders.orders.push({orderId: order.orderId, jobChain: order.path.split(',')[0]});
                OrderService.get(orders).then(function (res) {
                    order = angular.merge(order, res.orders[0]);
                });

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
                JobChainService.getJobChainP({
                    jobschedulerId: vm.schedulerIds.selected,
                    jobChain: order.jobChain
                }).then(function (res) {
                    vm._jobChain = res.jobChain;
                    angular.forEach(res.jobChain.endNodes, function (value) {
                        vm._jobChain.nodes.push(value);
                    });
                });
            }

            else if (action == 'resume order next state') {
                vm.order = angular.copy(order);

                JobChainService.getJobChainP({
                    jobschedulerId: vm.schedulerIds.selected,
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

            else if (action == 'reset order') {

                orders.orders = [];
                orders.jobschedulerId = vm.schedulerIds.selected;
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

            else if (action == 'remove order') {

                orders.orders = [];
                orders.jobschedulerId = vm.schedulerIds.selected;
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

            else if (action == 'view calendar') {

                vm.maxPlannedTime = undefined;
                vm.isCaledarLoading = true;
                vm._jobChain = order;
                vm._jobChain.name = order.orderId;
                vm.planItems = [];
                DailyPlanService.getPlans({
                    jobschedulerId: vm.schedulerIds.selected,
                    states: ['PLANNED'],
                    orderId: order.orderId,
                    dateFrom: "+0M",
                    dateTo: "+0M",
                    timeZone: vm.userPreferences.zone
                }).then(function (res) {
                    populatePlanItems(res);
                    vm.isCaledarLoading = false;
                }, function (err) {
                    vm.isCaledarLoading = false;
                });
                openCalendar();
            }
            else if (action == 'show assigned calendar') {

                orders.jobschedulerId = vm.schedulerIds.selected;
                orders.jobChain = order.jobChain;
                orders.orderId = order.orderId;
                orders.compact = true;
                OrderService.getcalendars(orders).then(function (res) {
                    vm.obj = angular.copy(order);
                    vm.obj.calendars = res.calendars;
                });
                modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/show-assigned-calendar-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {

                }, function () {

                });
            }


            else if (action == 'delete order') {

                orders.orders = [];
                orders.jobschedulerId = vm.schedulerIds.selected;
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
        vm.getPlan = function (calendarView, viewDate) {
            var date = '';
            if (calendarView == 'year') {
                if (viewDate.getFullYear() < new Date().getFullYear()) {
                    return;
                }
                else if (viewDate.getFullYear() == new Date().getFullYear()) {
                    date = "+0y";
                }
                else {
                    date = "+" + viewDate.getFullYear() - new Date().getFullYear() + "y";
                }
            }
            if (calendarView == 'month') {
                if (viewDate.getFullYear() <= new Date().getFullYear() && viewDate.getMonth() < new Date().getMonth()) {
                    return;
                }
                else if (viewDate.getFullYear() == new Date().getFullYear() && viewDate.getMonth() == new Date().getMonth()) {
                    date = "+" + viewDate.getMonth() - new Date().getMonth() + "M";
                }
                else if (viewDate.getFullYear() >= new Date().getFullYear()) {
                    date = "+" + viewDate.getMonth() - new Date().getMonth() + "M";
                } else {
                    return;
                }
            }

            vm.planItems = [];
            vm.isCaledarLoading = true;
            DailyPlanService.getPlans({
                jobschedulerId: vm.schedulerIds.selected,
                states: ['PLANNED'],
                orderId: vm._jobChain.orderId,
                dateFrom: date,
                dateTo: date,
                timeZone: vm.userPreferences.zone
            }).then(function (res) {
                populatePlanItems(res);
                vm.isCaledarLoading = false;
            }, function (err) {
                vm.isCaledarLoading = false;
            });

        };

        function populatePlanItems(res) {

            vm.planItemData = res.planItems;
            vm.planItemData.forEach(function (data) {
                var planData = {
                    plannedStartTime: moment(data.plannedStartTime).tz(vm.userPreferences.zone),
                    orderId: data.orderId
                };
                vm.planItems.push(planData);
                if (res.created) {
                    vm.maxPlannedTime = new Date(res.deliveryDate);
                }
            });
        }


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
            vm.object.orders = [];
        };

        function volatileInfo(draw) {
            JobChainService.getJobChain({
                jobschedulerId: vm.schedulerIds.selected,
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
                    jobschedulerId: vm.schedulerIds.selected,
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

        getPermanent();

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
            vm.object.orders = [];
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


        vm.getPlan = function (calendarView, viewDate) {
            var date = '';
            if (calendarView == 'year') {
                if (viewDate.getFullYear() < new Date().getFullYear()) {
                    return;
                }
                else if (viewDate.getFullYear() == new Date().getFullYear()) {
                    date = "+0y";
                }
                else {
                    date = "+" + viewDate.getFullYear() - new Date().getFullYear() + "y";
                }
            }
            if (calendarView == 'month') {
                if (viewDate.getFullYear() <= new Date().getFullYear() && viewDate.getMonth() < new Date().getMonth()) {
                    return;
                }
                else if (viewDate.getFullYear() == new Date().getFullYear() && viewDate.getMonth() == new Date().getMonth()) {
                    date = "+" + viewDate.getMonth() - new Date().getMonth() + "M";
                }
                else if (viewDate.getFullYear() >= new Date().getFullYear()) {
                    date = "+" + viewDate.getMonth() - new Date().getMonth() + "M";
                } else {
                    return;
                }
            }

            vm.planItems = [];
            vm.isCaledarLoading = true;
            DailyPlanService.getPlans({
                jobschedulerId: vm.schedulerIds.selected,
                states: ['PLANNED'],
                jobChain: vm._jobChain.path,
                dateFrom: date,
                dateTo: date,
                timeZone: vm.userPreferences.zone
            }).then(function (res) {
                populatePlanItems(res);
                vm.isCaledarLoading = false;
            }, function () {
                vm.isCaledarLoading = false;
            });
        };

        vm.viewCalendar = function (nestedJobChain) {
            vm.maxPlannedTime = undefined;
            vm.selectedChain = nestedJobChain;
            vm._jobChain = nestedJobChain ? angular.copy(nestedJobChain) : vm.jobChain;
            vm.isCaledarLoading = true;
            vm.planItems = [];

            DailyPlanService.getPlans({
                jobschedulerId: vm.schedulerIds.selected,
                states: ['PLANNED'],
                jobChain: vm._jobChain.path,
                dateFrom: "+0M",
                dateTo: "+0M",
                timeZone: vm.userPreferences.zone

            }).then(function (res) {
                populatePlanItems(res);
                vm.isCaledarLoading = false;
            }, function (err) {
                vm.isCaledarLoading = false;
            });
            openCalendar();
            vm.object.jobChains = [];
        };


        function populatePlanItems(res) {
            vm.planItemData = res.planItems;
            vm.planItemData.forEach(function (data) {
                var planData = {
                    plannedStartTime: moment(data.plannedStartTime).tz(vm.userPreferences.zone),
                    orderId: data.orderId
                };
                vm.planItems.push(planData);
                if (res.created) {
                    vm.maxPlannedTime = new Date(res.deliveryDate);
                }
            });
        }

        vm.showCalendar = vm.viewCalendar;

        function openCalendar() {
             $uibModal.open({
                templateUrl: 'modules/core/template/calendar-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                size: 'lg',
                backdrop: 'static'
            });
        }

        function addOrder(order, paramObject) {
            var orders = {};
            orders.jobschedulerId = vm.schedulerIds.selected;
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
            ScheduleService.get({
                jobschedulerId: vm.schedulerIds.selected,
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
            vm.zones = moment.tz.names();
            if (vm.userPreferences.zone) {
                vm.order.timeZone = vm.userPreferences.zone;
            }

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
            jobChains.jobschedulerId = vm.schedulerIds.selected;
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
            jobChains.jobschedulerId = vm.schedulerIds.selected;
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
            orders.jobschedulerId = vm.schedulerIds.selected;
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

                });
            } else {
                OrderService.deleteOrder(orders).then(function (res) {
                    for (var i = 0; i < vm.object.orders.length; i++) {
                        if (vm.showLogPanel && vm.object.orders[i].path == vm.showLogPanel.path) {
                            vm.showLogPanel = undefined;
                        }
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
            orders.jobschedulerId = vm.schedulerIds.selected;
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
            orders.jobschedulerId = vm.schedulerIds.selected;
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
            orders.jobschedulerId = vm.schedulerIds.selected;
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
            orders.jobschedulerId = vm.schedulerIds.selected;
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

        $scope.$on('event-started', function () {
            if (vm.events && vm.events[0] && vm.events[0].eventSnapshots)
                for (var i = 0; i < vm.events[0].eventSnapshots.length; i++) {
                    if (vm.events[0].eventSnapshots[i].path == vm.jobChain.path && vm.events[0].eventSnapshots[i].eventType == "FileBasedRemoved") {
                        $location.path('/job_chains');
                        break;
                    }
                    if (vm.events[0].eventSnapshots[i].path != undefined && (vm.events[0].eventSnapshots[i].eventType == 'JobChainStateChanged' || vm.events[0].eventSnapshots[i].eventType == 'JobStateChanged' || vm.events[0].eventSnapshots[i].eventType === "OrderAdded" || ((vm.events[0].eventSnapshots[i].eventType == 'FileBasedActivated' || vm.events[0].eventSnapshots[i].eventType == "FileBasedRemoved") && (vm.events[0].eventSnapshots[i].objectType == "JOBCHAIN" || vm.events[0].eventSnapshots[i].objectType == "ORDER")) && !vm.events[0].eventSnapshots[i].eventId)) {

                        var path = [];
                        if (vm.events[0].eventSnapshots[i].path.indexOf(",") > -1) {
                            path = vm.events[0].eventSnapshots[i].path.split(",");
                        } else {
                            path[0] = vm.events[0].eventSnapshots[i].path;
                        }

                        var flag = false;
                        if (vm.jobChain.nodes && vm.jobChain.nodes.length > 0) {
                            for (let m = 0; m < vm.jobChain.nodes.length; m++) {
                                if (vm.jobChain.nodes[m].job && path[0] === vm.jobChain.nodes[m].job.path) {
                                    flag = true;
                                    break;
                                }
                                if (vm.jobChain.nodes[m].jobChain && path[0] === vm.jobChain.nodes[m].jobChain.path) {
                                    flag = true;
                                    break;
                                }
                            }
                        }

                        if (vm.jobChain.path === path[0] || flag) {
                            volatileInfo();
                        }

                    }
                   
                }
        });
    }

    OrderCtrl.$inject = ["$scope", "$rootScope", "OrderService", "UserService", "orderByFilter", "$uibModal", "SavedFilter", "CoreService", "$timeout", "AuditLogService", "$location", "$filter"];
    function OrderCtrl($scope, $rootScope, OrderService, UserService, orderBy, $uibModal, SavedFilter, CoreService, $timeout, AuditLogService, $location, $filter) {
        var vm = $scope;
        vm.orderFilters = CoreService.getOrderTab();

        vm.tree = [];
        vm.allOrders = [];

        vm.my_tree = {};
        vm.isUnique = true;

        vm.object = {};
        vm.object.orders = [];

        vm.filter_tree = {};
        vm.filterTree1 = [];
        vm.object.paths = [];

        vm.selectedFiltered;
        vm.temp_filter = {};

        vm.reset = function () {
            vm.object.orders = [];
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
            if (!vm.savedOrderFilter.selected) {
                initTree();
            }
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
                    for (let i = 0; i < vm.orderFilterList.length; i++) {
                        var flag = true;
                        for (var j = 0; j < data.length; j++) {
                            if (data[j].account === vm.orderFilterList[i].account && data[j].name === vm.orderFilterList[i].name) {
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
                }
            }, function () {
                vm.savedOrderFilter.selected = undefined;
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
            if (vm.selectedFiltered) {
                isCustomizationSelected(true);
            }

            OrderService.tree({
                jobschedulerId: vm.schedulerIds.selected,
                compact: true,
                folders: folders,
                types: ['ORDER']
            }).then(function (res) {
                if ($rootScope.order_expand_to) {
                    vm.tree = res.folders;
                    filteredTreeData();
                } else {
                    if (vm.isEmpty(vm.orderFilters.expand_to)) {
                        vm.tree = res.folders;
                        filteredTreeData();
                    } else {
                        vm.orderFilters.expand_to = vm.recursiveTreeUpdate(res.folders, vm.orderFilters.expand_to);
                        vm.tree = vm.orderFilters.expand_to;
                        vm.orderFilters.expand_to= [];
                        vm.changeStatus();
                    }
                }
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
            if (vm.showLogPanel && (vm.showLogPanel.path1 !== data.path)) {
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
            if (vm.showLogPanel && (vm.showLogPanel.path1 !== data.path)) {
                vm.hideLogPanel();
            }
            vm.allOrders = [];
            vm.loading = true;
            vm.folderPath = data.name || '/';
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.compact = true;
            obj.folders = [];
            obj.folders.push({folder: data.path, recursive: true});
            if (vm.selectedFiltered && !_.isEmpty(vm.selectedFiltered)) {
                obj.regex = vm.selectedFiltered.regex;
            }else {
                if (vm.orderFilters.filter.state !== 'ALL') {
                    if (vm.scheduleState === 'UNREACHABLE') {
                        return;
                    }
                    firstVolatileCall(obj, data);
                    return
                }
            }
            OrderService.getOrdersP(obj).then(function (result) {
                vm.allOrders = result.orders;
                vm.loading = false;
                vm.isLoaded = true;
                volatileInformation(obj, data);
            }, function () {
                vm.isLoaded = true;
                vm.loading = false;
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
            function recursive(data) {
                data.expanded = true;
                data.folders = orderBy(data.folders, 'name');

                data.orders = [];
                for(let i=0; i < vm.allOrders.length;i++) {
                    if (data.path === vm.allOrders[i].path.substring(0, vm.allOrders[i].path.lastIndexOf('/')) || data.path === vm.allOrders[i].path.substring(0, vm.allOrders[i].path.lastIndexOf('/') + 1)) {
                        data.orders.push(vm.allOrders[i]);
                        vm.allOrders[i].path1 = data.path;
                    }
                }
                data.selected1 = true;
                angular.forEach(data.folders, function (a) {
                    recursive(a);
                });
            }

            recursive(data);
        }

        function expandFolderData(data) {
            let obj = {jobschedulerId: vm.schedulerIds.selected, compact: true};
            obj.folders = [{folder: data.path, recursive: false}];
            if (vm.selectedFiltered) {
                obj.regex = vm.selectedFiltered.regex;
            } else {
                if (vm.orderFilters.filter.state !== 'ALL') {
                    if (vm.scheduleState === 'UNREACHABLE') {
                        return;
                    }
                    firstVolatileCall(obj, null);
                    return
                }
            }

            OrderService.getOrdersP(obj).then(function (result) {
                data.orders = result.orders;
                vm.allOrders = result.orders;
                vm.loading = false;
                volatileFolderData(data, obj);
            }, function () {
                volatileFolderData(data, obj);
                vm.loading = false;
            });
        }

        function mergeVolatileData(data) {
            for (let x = 0; x < data.orders.length; x++) {
                var flag = true;
                data.orders[x].path1 = data.path;
                for (let i = 0; i < vm.allOrders.length; i++) {
                    if (data.orders[x].path === vm.allOrders[i].path) {
                        flag = false;
                        break;
                    }
                }
                if (flag)
                    vm.allOrders.push(data.orders[x]);
            }

            vm.folderPath = data.name || '/';
            vm.loading = false;
            vm.isLoaded = false;
        }

        function volatileFolderData(data1, obj) {
            if (vm.selectedFiltered) {
                obj = parseDate(obj);
            } else {
                if (vm.orderFilters.filter.state !== 'ALL') {
                    obj.processingStates = [];
                    obj.processingStates.push(vm.orderFilters.filter.state);
                }
            }
            OrderService.get(obj).then(function (res) {
                let data = [];
                if (data1.orders && data1.orders.length > 0) {
                    for(let x =0 ; x < data1.orders.length; x++) {
                        for (let i = 0; i < res.orders.length; i++) {
                            if (data1.orders[x].path === res.orders[i].path) {
                                res.orders[i].title = angular.copy(data1.orders[x].title);
                                res.orders[i].path1 = angular.copy(data1.orders[x].path1);
                                res.orders[i].show = angular.copy(data1.orders[x].show);
                                data1.orders[x] = res.orders[i];
                                data.push(data1.orders[x]);
                                res.orders.splice(i, 1);
                                break;
                            }
                        }
                    }
                    data = data.concat(res.orders);
                    data1.orders = data;
                } else {
                    data1.orders = res.orders;
                }
                mergeVolatileData(data1)
            }, function () {
                mergeVolatileData(data1);
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
            for (let i = 0; i < data.folders.length; i++) {
                data.folders[i].selected1 = false;
                if (data.folders[i].expanded) {
                    traverseTree1(data.folders[i]);
                }
            }
        }

        var i = 1, splitPath = [];

        function checkExpand(data) {
            if (data.selected1) {
                data.orders = [];
                expandFolderData(data);
                vm.folderPath = data.name || '/';
            }
            if (data.folders && data.folders.length > 0) {
                data.folders = orderBy(data.folders, 'name');
                for(let x=0; x< data.folders.length; x++) {
                    if (vm.expand_to) {
                        if (vm.flag && data.folders[x].path.substring(1, data.folders[x].path.length) === splitPath[i] && i < splitPath.length) {
                            i = i + 1;
                            splitPath[i] = splitPath[i - 1] + '/' + splitPath[i];

                            data.folders[x].expanded = true;
                            if (vm.expand_to.name === data.folders[x].name) {
                                data.folders[x].selected1 = true;
                                vm.flag = false;
                                i = 1;
                                splitPath = [];

                            }
                        }
                    }

                    checkExpand(data.folders[x]);
                    if (data.folders[x].expanded || data.folders[x].selected1) {
                        if (data.path === '/') {
                            data.selected1 = false;
                        }
                    }
                }
            }
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

        function checkExpandTreeForUpdates(data, obj , obj1) {
            if (data.selected1) {
                obj.folders.push({folder: data.path, recursive: false});
                obj1.folders.push({folder: data.path, recursive: false});
                vm.folderPath = data.name || '/';
            }

            data.folders = orderBy(data.folders, 'name');
            angular.forEach(data.folders, function (value) {
                if (value.expanded || value.selected1)
                    checkExpandTreeForUpdates(value, obj , obj1);
            });
        }

        function insertData(node, x) {
            var _temp = angular.copy(node.orders);
            node.orders = [];
            for (let i = 0; i < x.length; i++) {
                var p = [];
                if (x[i].path.indexOf(",") > -1) {
                    p = x[i].path.split(",");
                } else {
                    p[0] = x[i].path;
                }
                if (node.path === p[0].substring(0, p[0].lastIndexOf('/')) || node.path === p[0].substring(0, p[0].lastIndexOf('/') + 1)) {
                    x[i].path1 = node.path;

                    if (_temp && _temp.length > 0) {
                        for (let j = 0; j < _temp.length; j++) {
                            if (_temp[j].path === x[i].path) {
                                x[i].show = _temp[j].show;
                                if (x[i].show) {
                                    x[i].priority = _temp[j].priority;
                                    x[i].params = _temp[j].params;
                                    x[i].stateText = _temp[j].stateText;
                                    x[i].endState = _temp[j].endState;
                                }
                                break;
                            }
                        }
                    }
                    node.orders.push(x[i]);
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
            var date;
            var arr;
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
                } else if (/^\s*(\d+)(h|d|w|M|y)\s*$/.test(vm.selectedFiltered.planned)) {
                    obj.dateFrom = vm.selectedFiltered.planned;
                } else if (/^\s*(Today)\s*$/i.test(vm.selectedFiltered.planned)) {
                    fromDate = '0d';
                    toDate = '0d';
                } else if (/^\s*(now)\s*$/i.test(vm.selectedFiltered.planned)) {
                    fromDate = new Date();
                    toDate = new Date();
                } else if (/^\s*(\d+)(h|d|w|M|y)\s*to\s*(\d+)(h|d|w|M|y)\s*$/.test(vm.selectedFiltered.planned)) {
                    date = /^\s*(\d+)(h|d|w|M|y)\s*to\s*(\d+)(h|d|w|M|y)\s*$/.exec(vm.selectedFiltered.planned);
                    arr = date[0].split('to');
                    fromDate = arr[0].trim();
                    toDate = arr[1].trim();
                } else if (/^\s*(\d+)(h|d|w|M|y)\s*to\s*(\d+)(h|d|w|M|y)\s*[+,-](\d+)(h|d|w|M|y)\s*$/.test(vm.selectedFiltered.planned)) {
                    date = /^\s*(\d+)(h|d|w|M|y)\s*to\s*(\d+)(h|d|w|M|y)\s*[+,-](\d+)(h|d|w|M|y)\s*$/.exec(vm.selectedFiltered.planned);
                    arr = date[0].split('to');
                    fromDate = arr[0].trim();
                    toDate = arr[1].trim();
                } else if (/^\s*(\d+)(h|d|w|M|y)\s*[+,-](\d+)(h|d|w|M|y)\s*to\s*(\d+)(h|d|w|M|y)\s*[+,-](\d+)(h|d|w|M|y)\s*$/.test(vm.selectedFiltered.planned)) {
                    date = /^\s*(\d+)(h|d|w|M|y)\s*[+,-](\d+)(h|d|w|M|y)\s*to\s*(\d+)(h|d|w|M|y)\s*[+,-](\d+)(h|d|w|M|y)\s*$/.exec(vm.selectedFiltered.planned);
                    arr = date[0].split('to');
                    fromDate = arr[0].trim();
                    toDate = arr[1].trim();
                } else if (/^\s*(\d+)(h|d|w|M|y)\s*[+,-](\d+)(h|d|w|M|y)\s*to\s*(\d+)(h|d|w|M|y)\s*$/.test(vm.selectedFiltered.planned)) {
                    date = /^\s*(\d+)(h|d|w|M|y)\s*[+,-](\d+)(h|d|w|M|y)\s*to\s*(\d+)(h|d|w|M|y)\s*$/.exec(vm.selectedFiltered.planned);
                    arr = date[0].split('to');
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
                delete obj["timeZone"];
            }
            if ((obj.dateFrom && typeof obj.dateFrom.getMonth === 'function')) {
                obj.dateFrom = moment(obj.dateFrom).tz(vm.userPreferences.zone)._d;
            }
            if ((obj.dateTo && typeof obj.dateTo.getMonth === 'function')) {
                obj.dateTo = moment(obj.dateTo).tz(vm.userPreferences.zone)._d;
            }
            return obj;
        }

        function volatileInformation(obj, expandNode) {
            if (vm.selectedFiltered) {
                obj = parseDate(obj);
            } else {
                if (vm.orderFilters.filter.state !== 'ALL') {
                    obj.processingStates = [];
                    obj.processingStates.push(vm.orderFilters.filter.state);
                }
            }
            OrderService.get(obj).then(function (res) {
                if (vm.allOrders && vm.allOrders.length > 0) {
                    for (let x = 0; x < vm.allOrders.length; x++) {
                        for (let i = 0; i < res.orders.length; i++) {
                            if (vm.allOrders[x].path === res.orders[i].path) {
                                res.orders[i].title = vm.allOrders[x].title;
                                res.orders[i].path1 = vm.allOrders[x].path1;
                                res.orders[i].show = vm.allOrders[x].show;
                                vm.allOrders[x]= res.orders[i];
                                res.orders.splice(i, 1);
                                break;
                            }
                        }
                    }
                    vm.allOrders = vm.allOrders.concat(res.orders);
                } else {
                    vm.allOrders = res.orders;
                }

                if (expandNode) {
                    startTraverseNode(expandNode);
                }
                vm.loading = false;
                vm.isLoaded = false;
            }, function () {
                if (expandNode) {
                    startTraverseNode(expandNode);
                }
                vm.loading = false;
                vm.isLoaded = false;
            });
        }

        function firstVolatileCall(obj, expandNode) {
            if (vm.orderFilters.filter.state !== 'ALL') {
                obj.processingStates = [];
                obj.processingStates.push(vm.orderFilters.filter.state);
            }
            OrderService.get(obj).then(function (res) {
                vm.allOrders = res.orders;
                for (let i = 0; i < vm.allOrders.length; i++) {
                    vm.allOrders[i].path1 = vm.allOrders[i].path.substring(0, vm.allOrders[i].path.lastIndexOf('/')) || vm.allOrders[i].path.substring(0, vm.allOrders[i].path.lastIndexOf('/') + 1);
                }
                vm.loading = false;
                if (!expandNode) {
                    angular.forEach(vm.tree, function (node) {
                        insertData(node, vm.allOrders);
                    });
                } else {
                    startTraverseNode(expandNode);
                }
            }, function () {
                vm.loading = false;
            });
        }

        vm.changeStatus = function () {
            vm.hideLogPanel();
            vm.allOrders = [];
            vm.loading = true;
            var obj = {jobschedulerId : vm.schedulerIds.selected, folders: [], compact : true};
            var obj1 = {jobschedulerId : vm.schedulerIds.selected, folders: [], compact : true};
            angular.forEach(vm.tree, function (value) {
                if (value.expanded || value.selected1)
                    checkExpandTreeForUpdates(value, obj, obj1);
            });
            if (vm.selectedFiltered) {
                obj = parseDate(obj);
                 obj1.regex = vm.selectedFiltered.regex;
            } else {

                if (vm.orderFilters.filter.state !== 'ALL') {
                   if (vm.scheduleState === 'UNREACHABLE') {
                       return;
                   }
                   firstVolatileCall(obj, null);
                   return
               }
            }

            OrderService.getOrdersP(obj1).then(function (result) {
                vm.allOrders = result.orders;
                vm.loading = false;
                OrderService.get(obj).then(function (res) {
                    if (vm.allOrders && vm.allOrders.length > 0) {
                        for(let m=0; m < vm.allOrders.length;m++) {
                            for (let i = 0; i < res.orders.length; i++) {
                                if (vm.allOrders[m].path === res.orders[i].path) {
                                    res.orders[i].title = angular.copy(vm.allOrders[m].title);
                                    res.orders[i].show = angular.copy(vm.allOrders[m].show);
                                    vm.allOrders[m] = res.orders[i];
                                    res.orders.splice(i, 1);
                                    break;
                                }
                            }
                        }

                        vm.allOrders = vm.allOrders.concat(res.orders);
                        angular.forEach(vm.tree, function (node) {
                            insertData(node, vm.allOrders);
                        });

                    } else {
                        angular.forEach(vm.tree, function (node) {
                            insertData(node, res.orders);
                        })
                    }
                }, function () {
                    vm.loading = false;
                    angular.forEach(vm.tree, function (node) {
                        insertData(node, vm.allOrders);
                    })
                });
            }, function () {
                vm.loading = false;
                OrderService.get(obj).then(function (res) {
                    vm.allOrders = res.orders;
                    if (res.orders) {
                        vm.allOrders = res.orders;
                        angular.forEach(vm.tree, function (node) {
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
            orders.jobschedulerId = vm.schedulerIds.selected;
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

            if (vm.orderFilter1.fromDate) {
                fromDate = new Date(vm.orderFilter1.fromDate);
                if (vm.orderFilter1.fromTime) {
                    fromDate.setHours(moment(vm.orderFilter1.fromTime, 'HH:mm:ss').hours());
                    fromDate.setMinutes(moment(vm.orderFilter1.fromTime, 'HH:mm:ss').minutes());
                    fromDate.setSeconds(moment(vm.orderFilter1.fromTime, 'HH:mm:ss').seconds());
                } else {
                    fromDate.setHours(0);
                    fromDate.setMinutes(0);
                    fromDate.setSeconds(0);
                }
                fromDate.setMilliseconds(0);

            }
            if (vm.orderFilter1.toDate) {
                toDate = new Date(vm.orderFilter1.toDate);
                if (vm.orderFilter1.toTime) {
                    toDate.setHours(moment(vm.orderFilter1.toTime, 'HH:mm:ss').hours());
                    toDate.setMinutes(moment(vm.orderFilter1.toTime, 'HH:mm:ss').minutes());
                    toDate.setSeconds(moment(vm.orderFilter1.toTime, 'HH:mm:ss').seconds());
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

            if ((obj.dateFrom && typeof obj.dateFrom.getMonth === 'function')) {
                obj.dateFrom = moment(obj.dateFrom).tz(vm.userPreferences.zone)._d;
            }
            if ((obj.dateTo && typeof obj.dateTo.getMonth === 'function')) {
                obj.dateTo = moment(obj.dateTo).tz(vm.userPreferences.zone)._d;
            }
            return obj;
        }

        vm.saveAsFilter = function (form) {
            var configObj = {};
            configObj.jobschedulerId = vm.schedulerIds.selected;
            configObj.account = vm.permission.user;
            configObj.configurationType = "CUSTOMIZATION";
            configObj.objectType = "ORDER";
            configObj.id = 0;
            configObj.name = vm.orderFilter1.name;

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
            vm.orderFilter1.fromDate = new Date();
            vm.orderFilter1.fromTime = moment().format("HH:mm");
            vm.orderFilter1.toDate = new Date();
            vm.orderFilter1.toTime = '24:00';
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
                if (vm.allOrders && vm.allOrders.length > 0) {
                    for(let x=0; x < vm.allOrders.length; x++) {
                        for (let i = 0; i < res.orders.length; i++) {
                            if (vm.allOrders[x].path == res.orders[i].path) {
                                vm.allOrders[x] = angular.merge(vm.allOrders[x], res.orders[i]);
                                vm.allOrders[x].path1 = vm.allOrders[x].path.substring(0, vm.allOrders[x].path.lastIndexOf('/'));
                                res.orders.splice(i, 1);
                                break;
                            }
                        }
                    }
                } else {
                    for (let i = 0; i < res.orders.length; i++) {
                        res.orders[i].path1 = res.orders[i].path.substring(0, res.orders[i].path.lastIndexOf('/'));
                    }
                }

                vm.allOrders = vm.allOrders.concat(res.jobs);

                traverseTreeForSearchData();
            }, function () {
               if (vm.allOrders && vm.allOrders.length > 0) {
                    for (let x = 0; x < vm.allOrders.length; x++) {
                        vm.allOrders[x].path1 = vm.allOrders[x].path.substring(0, vm.allOrders[x].path.lastIndexOf('/')) || vm.allOrders[x].path.substring(0, vm.allOrders[x].path.lastIndexOf('/') + 1);
                    }
                }
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
                for (let i = 0; i < vm.orderFilter1.paths.length; i++) {
                    obj.folders.push({folder: vm.orderFilter1.paths[i], recursive: true});
                }
            }
            OrderService.getOrdersP(obj).then(function (result) {
                vm.allOrders = result.orders;
                searchV(obj);
            }, function () {
                searchV(obj);
            });
        };

        function traverseTreeForSearchData() {
            function traverseTree1(data) {
                for (let i = 0; i < data.folders.length; i++) {
                    data.folders[i].selected1 = false;
                    data.folders[i].expanded = true;
                    data.folders[i].orders = [];
                    pushOrder(data.folders[i]);
                    traverseTree1(data.folders[i]);
                }
            }

            function navFullTree() {
                for (let i = 0; i < vm.tree.length; i++) {
                    vm.tree[i].selected1 = true;
                    vm.tree[i].expanded = true;
                    vm.tree[i].orders = [];
                    pushOrder(vm.tree[i]);
                    traverseTree1(vm.tree[i]);
                }
            }

            function pushOrder(data) {
                for (let i = 0; i < vm.allOrders.length; i++) {
                    if (data.path === vm.allOrders[i].path1) {
                        data.selected1 = true;
                        data.orders.push(vm.allOrders[i]);
                    }
                }
            }

            navFullTree();
        }

        function isCustomizationSelected(flag) {
            if (flag) {
                vm.temp_filter.state = angular.copy(vm.orderFilters.filter.state);
                vm.orderFilters.filter.state = '';
            } else {
                if (vm.temp_filter.state)
                    vm.orderFilters.filter.state = angular.copy(vm.temp_filter.state);
                else
                    vm.orderFilters.filter.state = 'ALL';
            }
        }

        vm.applyFilter = function () {
            vm.cancel();
            vm.orderFilter1 = {};
            vm.isUnique = true;
            vm.orderFilter1.planned = 'today';

            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/order-filter-dialog.html',
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
                vm.object.paths = [];
            }, function () {
                vm.object.paths = [];
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
        var temp_name = '';
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
                filter.shared = vm.orderFilter1.shared;
                UserService.saveConfiguration(configObj);
                filter.name = vm.orderFilter1.name;
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
                if (vm.orderFilter1.name === value.name && vm.permission.user === value.account && vm.orderFilter1.name !== temp_name) {
                    vm.isUnique = false;
                }
            });
        };

        vm.changeFilter = function (filter) {
            vm.cancel();
            if (filter) {
                vm.savedOrderFilter.selected = filter.id;
                vm.orderFilters.selectedView = true;
                UserService.configuration({jobschedulerId: filter.jobschedulerId, id: filter.id}).then(function (conf) {
                    vm.selectedFiltered = JSON.parse(conf.configuration.configurationItem);
                    vm.selectedFiltered.account = filter.account;
                    if (vm.selectedFiltered.paths) {
                        vm.orderFilters.expand_to = {};
                    }
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
                if (data.path === value) {
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
            for (let i = 0; i < vm.orderFilter1.paths.length; i++) {
                if (angular.equals(vm.orderFilter1.paths[i], object)) {
                    vm.orderFilter1.paths.splice(i, 1);
                    break;
                }
            }
        };

        /** --------action ------------ **/

        vm.deleteAllOrder = function () {
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = vm.schedulerIds.selected;
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
            orders.jobschedulerId = vm.schedulerIds.selected;
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
            orders.jobschedulerId = vm.schedulerIds.selected;
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
            orders.jobschedulerId = vm.schedulerIds.selected;
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
            orders.jobschedulerId = vm.schedulerIds.selected;
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



        vm.recursiveTreeUpdate = function (scrTree, destTree) {
            if (scrTree && destTree)
                for (let i = 0; i < scrTree.length; i++) {
                    for (let j = 0; j < destTree.length; j++) {
                        if (scrTree[i].path === destTree[j].path) {
                            scrTree[i].orders = destTree[j].orders;
                            scrTree[i].expanded = destTree[j].expanded;
                            scrTree[i].selected = destTree[j].selected;
                            scrTree[i].selected1 = destTree[j].selected1;
                            vm.recursiveTreeUpdate(scrTree[i].folders, destTree[j].folders);
                            destTree.splice(j, 1);
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
                for(let x = 0; x < vm.allOrders.length;x++) {
                    for (let i = 0; i < res.orders.length; i++) {
                        if (vm.allOrders[x].path === res.orders[i].path) {
                            vm.allOrders[x] = angular.merge(vm.allOrders[x], res.orders[i]);
                            vm.allOrders[x].show = true;
                            res.orders.splice(i, 1);
                            break;
                        }
                    }
                }
            });
        };

        vm.collapseDetails = function () {
            for(let x = 0; x < vm.allOrders.length;x++) {
                vm.allOrders[x].show = false;
            }
        };

        function checkCurrentSelectedFolders(order) {
            order.path1 = order.path.substring(0, order.path.lastIndexOf('/')) || order.path.substring(0, order.path.lastIndexOf('/') + 1);
            for (let i = 0; i < vm.tree.length; i++) {
                if (vm.tree[i].path !== order.path1) {
                    traverseTreeForUpdateOrder(vm.tree[i], order);
                } else {
                    if (vm.tree[i].selected1) {
                        vm.allOrders.push(order);
                        mergePermanentData(order);
                        break;
                    }
                }
            }
        }

        function traverseTreeForUpdateOrder(data, order) {
            if (data.folders)
                for (let i = 0; i < data.folders.length; i++) {
                    if (data.folders[i].path !== order.path1) {
                        traverseTreeForUpdateOrder(data.folders[i], order);
                    } else {
                        if (data.folders[i].selected1) {
                            vm.allOrders.push(order);
                            mergePermanentData(order);
                            break;
                        }
                    }
                }
        }

        function mergePermanentData(order) {
            var obj = {};
            obj.jobschedulerId = $scope.schedulerIds.selected;
            obj.orderId = order.orderId;
            obj.jobChain = order.jobChain;
            OrderService.getOrdersP(obj).then(function (res) {
                for (let i = 0; i < vm.allOrders.length; i++) {
                    if (vm.allOrders[i].path === res.orders[0].path) {
                        vm.allOrders[i] = angular.merge(vm.allOrders[i],res.orders[0] );
                        break;
                    }
                }
            });
        }

        var t1 = '';
        var mapObj = {};
        $scope.$on('event-started', function () {
            let ordersLoaded = false;
            if (vm.events && vm.events[0] && vm.events[0].eventSnapshots)
                 for (let m = 0; m < vm.events[0].eventSnapshots.length; m++) {
                     if (vm.events[0].eventSnapshots[m].path && (vm.events[0].eventSnapshots[m].eventType === "OrderStateChanged") && !vm.events[0].eventSnapshots[m].eventId) {
                           var path = [];
                         if (vm.events[0].eventSnapshots[m].path.indexOf(",") > -1) {
                             path = vm.events[0].eventSnapshots[m].path.split(",");
                         } else {
                             path[0] = vm.events[0].eventSnapshots[m].path;
                         }
                         if ($location.search().path) {
                             if (vm.events[0].eventSnapshots[m].path === $location.search().path)
                                 getOrderByPath($location.search().path);
                         } else {
                             if (vm.orderFilters.filter.state === 'ALL') {
                                 for(let i =0; i < vm.allOrders.length; i++) {
                                     if (vm.allOrders[i].path === vm.events[0].eventSnapshots[m].path && !vm.loading && (!mapObj[vm.allOrders[i].path])) {
                                         mapObj[vm.events[0].eventSnapshots[m].path] = vm.events[0].eventSnapshots[m].path;
                                         let obj = {};
                                         obj.jobschedulerId = vm.schedulerIds.selected;
                                         obj.orderId = vm.allOrders[i].orderId;
                                         obj.jobChain = vm.allOrders[i].path.split(',')[0];
                                         obj.compact = true;
                                         OrderService.getOrder(obj).then(function (res) {
                                             delete mapObj[vm.events[0].eventSnapshots[m].path];
                                             if (res.order && res.order.path === vm.allOrders[i].path) {
                                                 res.order.title = angular.copy(vm.allOrders[i].title);
                                                 res.order.path1 = angular.copy(vm.allOrders[i].path1);
                                                 res.order.params = angular.copy(vm.allOrders[i].params);
                                                 res.order.show = angular.copy(vm.allOrders[i].show);
                                                 vm.allOrders[i] = res.order;
                                             } else {
                                                 vm.allOrders.splice(i, 1);
                                             }
                                         }, function () {
                                             delete mapObj[vm.events[0].eventSnapshots[m].path];
                                         });
                                     }
                                 }
                             } else {
                                 let obj = {};
                                 obj.jobschedulerId = vm.schedulerIds.selected;
                                 obj.orderId = path[1];
                                 obj.jobChain = path[0];
                                 obj.compact = true;
                                 OrderService.getOrder(obj).then(function (res) {
                                     if (res.order) {
                                         let flag = false;
                                         for (let i = 0; i < vm.allOrders.length; i++) {
                                             if (vm.allOrders[i].path === res.order.path) {
                                                 flag = true;
                                                 if (res.order.processingState._text === vm.orderFilters.filter.state) {
                                                     res.order.title = angular.copy(vm.allOrders[i].title);
                                                     res.order.path1 = angular.copy(vm.allOrders[i].path1);
                                                     res.order.params = angular.copy(vm.allOrders[i].params);
                                                     res.order.show = angular.copy(vm.allOrders[i].show);
                                                     vm.allOrders[i] = res.order;
                                                 } else {
                                                     for (let j = 0; j < vm.allOrders.length; j++) {
                                                         if (vm.allOrders[j].path === res.order.path) {
                                                             vm.allOrders.splice(j, 1);
                                                             break;
                                                         }
                                                     }
                                                 }
                                                 break;
                                             }
                                         }
                                         if (!flag) {
                                             if (res.order.processingState._text === vm.orderFilters.filter.state) {
                                                 checkCurrentSelectedFolders(res.order);
                                             }
                                         }
                                     }
                                 });
                             }
                         }
                     } else if (vm.events[0].eventSnapshots[m].eventType === "OrderAdded" && !vm.events[0].eventSnapshots[m].eventId && !ordersLoaded) {
                         var path1 = vm.events[0].eventSnapshots[m].path.substring(1, vm.events[0].eventSnapshots[m].path.lastIndexOf('/')) || '/';
                         if (path1 === vm.folderPath) {
                             let obj = {jobschedulerId: vm.schedulerIds.selected, folders: [], compact: true};
                             angular.forEach(vm.tree, function (value) {
                                 if (value.expanded || value.selected1)
                                     checkExpandTreeForUpdates(value, obj, obj);
                             });
                             if (vm.selectedFiltered) {
                                 obj = parseDate(obj);
                             }
                             OrderService.get(obj).then(function (res) {
                                 ordersLoaded = true;
                                 if (vm.allOrders && vm.allOrders.length > 0) {
                                     for (let m = 0; m < vm.allOrders.length; m++) {
                                         for (let i = 0; i < res.orders.length; i++) {
                                             if (vm.allOrders[m].path === res.orders[i].path) {
                                                 res.orders[i].title = angular.copy(vm.allOrders[m].title);
                                                 res.orders[i].show = angular.copy(vm.allOrders[m].show);
                                                 res.orders[i].path1 = angular.copy(vm.allOrders[m].path1);
                                                 vm.allOrders[m] = res.orders[i];
                                                 res.orders.splice(i, 1);
                                                 break;
                                             }
                                         }
                                     }
                                     vm.allOrders = vm.allOrders.concat(res.orders);
                                     angular.forEach(vm.tree, function (node) {
                                         insertData(node, vm.allOrders);
                                     });

                                 } else {
                                     angular.forEach(vm.tree, function (node) {
                                         insertData(node, res.orders);
                                     })
                                 }
                             }, function () {
                                 vm.loading = false;
                                 angular.forEach(vm.tree, function (node) {
                                     insertData(node, vm.allOrders);
                                 })
                             });

                         }
                     }else if (vm.events[0].eventSnapshots[m].eventType === "OrderRemoved" && vm.events[0].eventSnapshots[m].eventId && vm.orderFilters.filter.state !== 'ALL') {
                         for (let i = 0; vm.allOrders.length; i++) {
                             if (vm.allOrders[i].path === vm.events[0].eventSnapshots[m].path) {
                                 vm.allOrders.splice(i,1);
                                 break;
                             }
                         }
                     }else if (vm.showLogPanel && vm.events[0].eventSnapshots[m].eventType === "ReportingChangedOrder" && !vm.events[0].eventSnapshots[m].eventId && vm.events[0].eventSnapshots[m].path === vm.showLogPanel.path) {
                         let orders = {};
                         orders.orders = [];
                         orders.orders.push({
                             orderId: vm.showLogPanel.orderId,
                             jobChain: vm.showLogPanel.path.split(',')[0]
                         });
                         orders.jobschedulerId = vm.schedulerIds.selected;
                         orders.limit = parseInt(vm.userPreferences.maxHistoryPerOrder);
                         OrderService.histories(orders).then(function (res) {
                             vm.historys = res.history;
                         });
                     }
                     else if (vm.showLogPanel && vm.events[0].eventSnapshots[m].eventType === "AuditLogChanged" && vm.events[0].eventSnapshots[m].objectType === "ORDER" && vm.events[0].eventSnapshots[m].path === vm.showLogPanel.path) {
                         let obj = {};
                         obj.jobschedulerId = vm.schedulerIds.selected;
                         obj.orders = [];
                         obj.orders.push({jobChain: vm.showLogPanel.jobChain, orderId: vm.showLogPanel.orderId});
                         loadAuditLogs(obj);
                     }
                     else if ((vm.events[0].eventSnapshots[m].eventType === "FileBasedActivated" || vm.events[0].eventSnapshots[m].eventType === "FileBasedRemoved") && vm.events[0].eventSnapshots[m].objectType === "ORDER") {
                         OrderService.tree({
                             jobschedulerId: vm.schedulerIds.selected,
                             compact: true,
                             types: ['ORDER']
                         }).then(function (res) {
                             vm.tree = vm.recursiveTreeUpdate(angular.copy(res.folders), vm.tree);
                             vm.changeStatus();
                         });
                         break;
                     }
                 }
        });

        $scope.$on('$destroy', function () {
             vm.orderFilters.expand_to = vm.tree;
            watcher1();
            if (t1) {
                $timeout.cancel(t1);
            }
        });

    }

    OrderOverviewCtrl.$inject = ["$scope", "$rootScope", "OrderService", "$stateParams", "CoreService", "$uibModal", "AuditLogService", "TaskService"];
    function OrderOverviewCtrl($scope, $rootScope, OrderService, $stateParams, CoreService, $uibModal, AuditLogService, TaskService) {
        var vm = $scope;

        vm.orderFilters = CoreService.getOrderTab1();
        vm.orderFilters.filter.state = $stateParams.name;
        vm.orderFilters.currentPage = 1;

        vm.allOrders = [];
        vm.object = {};
        vm.object.orders = [];

        vm.reset = function () {
            vm.object.orders = [];
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
            let orders = {jobschedulerId: vm.schedulerIds.selected, limit: vm.userPreferences.maxHistoryPerOrder};
            vm.isAuditLog = false;
            vm.isTaskHistory = false;

            if (value.historyId && vm.userPreferences.maxNumInOrderOverviewPerObject < 2) {          
                orders.historyIds = [value.historyId];
            }
            orders.orders = [];
            orders.orders.push({orderId: value.orderId, jobChain: value.path.split(',')[0]});
            OrderService.histories(orders).then(function (res) {
                vm.historys = res.history;
            });
            vm.showLogPanel = value;
            vm.orderFilters.showLogPanel = vm.showLogPanel;
        };

        function loadAuditLogs(obj) {
            obj.limit = vm.userPreferences.maxAuditLogPerObject;
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
            vm.isTaskHistory = false;
            let obj = {jobschedulerId: vm.schedulerIds.selected, orders: []};
            obj.orders.push({jobChain: value.jobChain, orderId: value.orderId});
            if (vm.permission.AuditLog.view.status)
                loadAuditLogs(obj);
        };

        vm.showJobHistory = function (order) {
            vm.showLogPanel = order;
            vm.isTaskHistory = true;
            vm.isAuditLog = false;
            let obj = {jobschedulerId: vm.schedulerIds.selected};
            obj.limit = vm.userPreferences.maxAuditLogPerObject;
            if (order.historyId) {
                obj.historyIds = [];
                obj.historyIds.push({historyId: order.historyId, state: order.state});
            } else if (order.taskId) {
                obj.taskIds = [order.taskId];
            } else {
                obj.jobs = [{job: order.job}];
            }
            TaskService.histories(obj).then(function (res) {
                vm.showLogPanel.taskHistory = res.history;
            }, function () {
                vm.showLogPanel.taskHistory = [];
            })
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
                let obj = {};
                obj.jobschedulerId = vm.schedulerIds.selected;
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
            let orders = {};
            orders.orders = [];
            orders.jobschedulerId = vm.schedulerIds.selected;
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
                    if (index === vm.object.orders.length - 1) {
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
                        for (let i = 0; i < vm.object.orders.length; i++) {
                            if (vm.showLogPanel && vm.object.orders[i].path === vm.showLogPanel.path) {
                                vm.showLogPanel = undefined;
                            }
                            for (let j = 0; j < vm.allOrders.length; j++) {
                                if (vm.object.orders[i].path === vm.allOrders[j].path) {
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
                    for (let i = 0; i < vm.object.orders.length; i++) {
                        if (vm.showLogPanel && vm.object.orders[i].path === vm.showLogPanel.path) {
                            vm.showLogPanel = undefined;
                        }
                        for (let j = 0; j < vm.allOrders.length; j++) {
                            if (vm.object.orders[i].path === vm.allOrders[j].path) {
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
            orders.jobschedulerId = vm.schedulerIds.selected;
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
                    if (index === vm.object.orders.length - 1) {
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
            orders.jobschedulerId = vm.schedulerIds.selected;
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
                    if (index === vm.object.orders.length - 1) {
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
            orders.jobschedulerId = vm.schedulerIds.selected;
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
            orders.jobschedulerId = vm.schedulerIds.selected;
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

        vm.showLeftPanel = function () {
            CoreService.setSideView(false);
            $('#rightPanel').removeClass('fade-in m-l-0');
            $('#leftPanel').show();
            $('.sidebar-btn').hide();
        };
        var waitForResponse = true;

        $scope.$on('event-started', function () {
            if (vm.events && vm.events[0] && vm.events[0].eventSnapshots)
                for (let i = 0; i < vm.events[0].eventSnapshots.length; i++) {
                    if (vm.events[0].eventSnapshots[i].path && vm.events[0].eventSnapshots[i].eventType === "OrderStateChanged" && !vm.events[0].eventSnapshots[i].eventId && waitForResponse) {
                        waitForResponse = false;
                        var obj = {};
                        obj.jobschedulerId = vm.schedulerIds.selected;
                        obj.compact = true;
                        obj.processingStates = [];
                        obj.processingStates.push(vm.orderFilters.filter.state);
                        OrderService.get(obj).then(function (res) {
                            let flag = false;
                            angular.forEach(res.orders, function (value) {
                                value.path1 = value.path.substring(1, value.path.lastIndexOf('/'));
                                if (vm.showLogPanel && vm.showLogPanel.path === value.path) {
                                    flag = true;
                                }
                            });
                            vm.reset();
                            vm.allOrders = res.orders;

                            if (!flag) {
                                vm.showLogPanel = undefined;
                            }
                            waitForResponse = true;
                        }, function () {
                            waitForResponse = true;
                        });
                        $rootScope.$broadcast('reloadSnapshot');
                    }
                    if (vm.showLogPanel && vm.events[0].eventSnapshots[i].eventType === "AuditLogChanged" && vm.events[0].eventSnapshots[i].objectType === "ORDER" && vm.events[0].eventSnapshots[i].path === vm.showLogPanel.path) {
                        let obj = {};
                        obj.jobschedulerId = vm.schedulerIds.selected;
                        obj.orders = [];
                        obj.orders.push({jobChain: vm.showLogPanel.jobChain, orderId: vm.showLogPanel.orderId});
                        loadAuditLogs(obj);
                    }
                }
        });
    }

    OrderFunctionCtrl.$inject = ["$scope", "$rootScope", "OrderService", "$uibModal", '$timeout', "DailyPlanService", "JobChainService", "$location", "$filter"];
    function OrderFunctionCtrl($scope, $rootScope, OrderService, $uibModal, $timeout, DailyPlanService, JobChainService, $location, $filter) {
        var vm = $scope;
        vm.maxEntryPerPage = vm.userPreferences.maxEntryPerPage;

        var promise1;

        /**--------------- Checkbox functions -------------*/
        vm.allCheck = {
            checkbox: false
        };

        var watcher1 = vm.$watchCollection('object.orders', function (newNames) {
            if (newNames && newNames.length > 0) {
                if (vm.filtered) {
                    vm.allCheck.checkbox = newNames.length === vm.filtered.slice((vm.userPreferences.entryPerPage * (vm.orderFilters.currentPage - 1)), (vm.userPreferences.entryPerPage * vm.orderFilters.currentPage)).length;
                }
                else {
                    if (vm.allOrders && vm.allOrders.length > 0)
                        vm.allCheck.checkbox = newNames.length === vm.allOrders.slice((vm.userPreferences.entryPerPage * (vm.orderFilters.currentPage - 1)), (vm.userPreferences.entryPerPage * vm.orderFilters.currentPage)).length;
                    else if (vm.orders && vm.orders.length > 0)
                        vm.allCheck.checkbox = newNames.length === vm.orders.slice((vm.userPreferences.entryPerPage * (vm.orderFilters.currentPage - 1)), (vm.userPreferences.entryPerPage * vm.orderFilters.currentPage)).length;
                }
                $rootScope.suspendSelected = false;
                $rootScope.deletedSelected = false;
                $rootScope.runningSelected = false;
                $rootScope.resetSelected = false;
                angular.forEach(newNames, function (value) {
                    if (value.processingState) {
                        if (value.processingState._text === 'SUSPENDED' || value.processingState._text === 'BLACKLIST') {
                            $rootScope.suspendSelected = true;
                        }
                        if (value.processingState._text !== 'PENDING' && value.processingState._text !== 'SETBACK') {
                            $rootScope.runningSelected = true;
                        }
                        if (value._type === 'PERMANENT') {
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
                var _order = [];
                if (vm.filtered) {
                    _order = $filter('orderBy')(vm.filtered, vm.orderFilters.filter.sortBy, vm.orderFilters.reverse);
                    vm.object.orders = _order.slice((vm.userPreferences.entryPerPage * (vm.orderFilters.currentPage - 1)), (vm.userPreferences.entryPerPage * vm.orderFilters.currentPage));
                }
                else {
                    if (vm.allOrders && vm.allOrders.length > 0)
                        _order = $filter('orderBy')(vm.allOrders, vm.orderFilters.filter.sortBy, vm.orderFilters.reverse);
                    else if (vm.orders && vm.orders.length > 0)
                        _order = $filter('orderBy')(vm.orders, vm.orderFilters.filter.sortBy, vm.orderFilters.reverse);

                    vm.object.orders = _order.slice((vm.userPreferences.entryPerPage * (vm.orderFilters.currentPage - 1)), (vm.userPreferences.entryPerPage * vm.orderFilters.currentPage));
                }

            } else {
                vm.reset();
            }
        };

        var watcher3 = vm.$watch('userPreferences.entryPerPage', function (newNames) {
            if (newNames)
                vm.reset();
        });

        var watcher2 = $scope.$watchCollection('filtered', function (newNames) {
            if (newNames)
                vm.object.orders = [];
        });

        $scope.$on('exportData', function () {
            $('#exportToExcelBtn').attr("disabled", true);
            if (!vm.isIE()) {
                $('#orderTableId').table2excel({
                    exclude: ".tableexport-ignore",
                    filename: "jobscheduler-orders",
                    fileext: ".xls",
                    exclude_img: false,
                    exclude_links: false,
                    exclude_inputs: false
                });
            } else {
                var ExportButtons = document.getElementById('orderTableId');

                var instance = new TableExport(ExportButtons, {
                    formats: ['xlsx'],
                    exportButtons: false,
                    trimWhitespace: true,
                    bootstrap: false
                });
                var exportData = instance.getExportData()['orderTableId']['xlsx'];
                instance.export2file(exportData.data, exportData.mimeType, 'jobscheduler-orders', exportData.fileExtension);
            }
            $('#exportToExcelBtn').attr("disabled", false);
        });

        /**--------------- sorting and pagination -------------------*/
        vm.pageChange = function () {
            vm.reset();
        };

        function startAt(order, paramObject) {
            var orders = {};
            orders.orders = [];

            orders.jobschedulerId = vm.schedulerIds.selected;
            var obj = {};
            obj.orderId = order.orderId;
            obj.jobChain = order.jobChain;
            obj.params = order.params;
            obj.state = vm.order.state;
            obj.endState = vm.order.endState;
            if (order.date && order.time) {
                order.date.setHours(moment(order.time, 'HH:mm:ss').hours());
                order.date.setMinutes(moment(order.time, 'HH:mm:ss').minutes());
                order.date.setSeconds(moment(order.time, 'HH:mm:ss').seconds());
            }

            if (order.date && order.at == 'later') {
                obj.at = moment(order.date).format("YYYY-MM-DD HH:mm:ss");
                obj.timeZone = order.timeZone;
            } else
                obj.at = order.atTime;

            if (!obj.params && paramObject.params.length > 0) {
                obj.params = paramObject.params;
            } else if (obj.params && paramObject.params.length > 0) {
                obj.params = obj.params.concat(paramObject.params);
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

            orders.jobschedulerId = vm.schedulerIds.selected;
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
            vm.zones = moment.tz.names();

            if (vm.userPreferences.zone) {
                vm.order.timeZone = vm.userPreferences.zone;
            }
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
            JobChainService.getJobChainP({
                jobschedulerId: vm.schedulerIds.selected,
                jobChain: order.jobChain
            }).then(function (res) {
                vm._jobChain = res.jobChain;
                angular.forEach(res.jobChain.endNodes, function (value) {
                    vm._jobChain.nodes.push(value);
                });
            });
        };

        vm.start = function (order) {
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = vm.schedulerIds.selected;
            orders.orders.push({orderId: order.orderId, jobChain: order.jobChain, at: 'now'});
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = order.path;
                vm.comments.title = order.title;
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

                });
            } else {
                OrderService.startOrder(orders);
                vm.reset();
            }

        };

        function setOrderState(order) {

            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = vm.schedulerIds.selected;
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
                jobschedulerId: vm.schedulerIds.selected,
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
            orders.jobschedulerId = vm.schedulerIds.selected;
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
                runTime: vkbeautify.xmlmin(order.runTime),
                calendars: order.calendars
            });


            OrderService.setRunTime(orders);
            vm.reset();
        }

        function loadRuntime(order) {
            vm.order = order;
            vm.comments = {};
            vm.comments.radio = 'predefined';
            vm.scheduleAction = undefined;
            OrderService.getRunTime({
                jobschedulerId: vm.schedulerIds.selected,
                jobChain: order.jobChain,
                orderId: order.orderId
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
                    setRunTime(order);
                }, function () {

                });

            });
        }

        vm.setRunTime = function (order) {
            loadRuntime(order);
        };


        /**------------------------------------------------------end run time editor -------------------------------------------------------*/


        vm.suspendOrder = function (order) {
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = vm.schedulerIds.selected;
            orders.orders.push({orderId: order.orderId, jobChain: order.jobChain});
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = order.path;
                vm.comments.title = order.title;
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

                });
            } else {
                OrderService.suspendOrder(orders);
                vm.reset();
            }
        };

        vm.resumeOrder = function (order) {
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = vm.schedulerIds.selected;
            orders.orders.push({orderId: order.orderId, jobChain: order.jobChain});
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = order.path;
                vm.comments.title = order.title;
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

                });
            } else {
                OrderService.resumeOrder(orders);
                vm.reset();
            }

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
                jobschedulerId: vm.schedulerIds.selected,
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
            orders.jobschedulerId = vm.schedulerIds.selected;
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
            orders.jobschedulerId = vm.schedulerIds.selected;
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
                orders.orders.push({
                    orderId: order.orderId,
                    jobChain: order.jobChain,
                    params: order.params,
                    state: vm.order.state,
                    endState: vm.order.endState
                });
            } else {
                orders.orders.push({
                    orderId: order.orderId,
                    jobChain: order.jobChain,
                    state: vm.order.state,
                    endState: vm.order.endState
                });
            }
            delete orders['params'];
            OrderService.resumeOrder(orders);
            vm.reset();
        }

        vm.resumeOrderWithParam = function (order) {

            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = vm.schedulerIds.selected;
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
            JobChainService.getJobChainP({
                jobschedulerId: vm.schedulerIds.selected,
                jobChain: order.jobChain
            }).then(function (res) {
                vm._jobChain = res.jobChain;
                angular.forEach(res.jobChain.endNodes, function (value) {
                    vm._jobChain.nodes.push(value);
                });
            });
        };

        vm.resetOrder = function (order) {
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = vm.schedulerIds.selected;
            orders.orders.push({orderId: order.orderId, jobChain: order.jobChain});
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = order.path;
                vm.comments.title = order.title;
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

                });
            } else {
                OrderService.resetOrder(orders);
                vm.reset();
            }

        };

        vm.removeOrder = function (order) {
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = vm.schedulerIds.selected;
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
                    OrderService.removeOrder(orders);
                    vm.reset();
                }, function () {

                });
            } else {
                OrderService.removeOrder(orders);
                vm.reset();
            }
        };

        function deleteOrder(orders, order, jobChain) {
            OrderService.deleteOrder(orders).then(function (res) {
                if (vm.showLogPanel && order.path == vm.showLogPanel.path) {
                    vm.showLogPanel = '';
                }
                if (vm.allOrders && vm.allOrders.length > 0) {
                    for (var j = 0; j < vm.allOrders.length; j++) {
                        if (vm.allOrders[j].path == order.path) {
                            vm.allOrders.splice(j, 1);
                            break;
                        }
                    }

                } else if (vm.orders && vm.orders.length > 0) {
                    for (var j = 0; j < vm.orders.length; j++) {
                        if (vm.orders[j].path == order.path) {
                            vm.orders.splice(j, 1);
                            break;
                        }
                    }

                } else {
                    $scope.$emit('refreshList', jobChain);
                }

                vm.reset();
            });
        }

        vm.deleteOrder = function (order, jobChain) {

            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = vm.schedulerIds.selected;
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
                    deleteOrder(orders, order, jobChain);
                }, function () {
                    vm.reset();
                });
            } else {
                deleteOrder(orders, order, jobChain);
            }
        };
        vm.showAssignedCalendar = function (order) {
            var orders = {};
            orders.jobschedulerId = vm.schedulerIds.selected;
            orders.jobChain = order.jobChain;
            orders.orderId = order.orderId;
            orders.compact = true;
            OrderService.getcalendars(orders).then(function (res) {
                vm.obj = angular.copy(order);
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

        vm.getPlan = function (calendarView, viewDate) {
            var date = '';
            if (calendarView == 'year') {
                if (viewDate.getFullYear() < new Date().getFullYear()) {
                    return;
                }
                else if (viewDate.getFullYear() == new Date().getFullYear()) {
                    date = "+0y";
                }
                else {
                    date = "+" + viewDate.getFullYear() - new Date().getFullYear() + "y";
                }
            }
            if (calendarView == 'month') {
                if (viewDate.getFullYear() <= new Date().getFullYear() && viewDate.getMonth() < new Date().getMonth()) {
                    return;
                }
                else if (viewDate.getFullYear() == new Date().getFullYear() && viewDate.getMonth() == new Date().getMonth()) {
                    date = "+" + viewDate.getMonth() - new Date().getMonth() + "M";
                }
                else if (viewDate.getFullYear() >= new Date().getFullYear()) {
                    date = "+" + viewDate.getMonth() - new Date().getMonth() + "M";
                } else {
                    return;
                }
            }

            vm.planItems = [];
            vm.isCaledarLoading = true;
            DailyPlanService.getPlans({
                jobschedulerId: vm.schedulerIds.selected,
                states: ['PLANNED'],
                orderId: vm._jobChain.orderId,
                jobChain: vm._jobChain.jobChain,
                dateFrom: date,
                dateTo: date,
                timeZone: vm.userPreferences.zone
            }).then(function (res) {
                populatePlanItems(res);
                vm.isCaledarLoading = false;
            }, function (err) {
                vm.isCaledarLoading = false;
            });
        };

        vm.viewCalendar = function (order) {
            vm.maxPlannedTime = undefined;
            vm._jobChain = angular.copy(order);
            vm.isCaledarLoading = true;
            vm._jobChain.name = order.orderId;
            vm.planItems = [];

            DailyPlanService.getPlans({
                jobschedulerId: vm.schedulerIds.selected,
                states: ['PLANNED'],
                orderId: order.orderId,
                jobChain: order.jobChain,
                dateFrom: "+0M",
                dateTo: "+0M",
                timeZone: vm.userPreferences.zone

            }).then(function (res) {
                populatePlanItems(res);
                vm.isCaledarLoading = false;
            }, function (err) {
                vm.isCaledarLoading = false;
            });
            openCalendar();
            vm.reset();
        };

        function populatePlanItems(res) {
            vm.planItemData = res.planItems;
            vm.planItemData.forEach(function (data) {
                var planData = {
                    plannedStartTime: moment(data.plannedStartTime).tz(vm.userPreferences.zone),
                    orderId: data.orderId
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
                vm._jobChain = null;
            }, function () {
                vm._jobChain = null;
            });
        }


        vm.showPanelFuc = function (order) {
            order.show = true;
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = vm.schedulerIds.selected;
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
                    if (vm.events[0].eventSnapshots[i].path != undefined && vm.events[0].eventSnapshots[i].eventType === "ReportingChangedOrder" && !vm.events[0].eventSnapshots[i].eventId) {
                        var path = vm.events[0].eventSnapshots[i].path;
                        if (vm.showLogPanel.path == path) {
                            var orders = {};
                            orders = {};
                            orders.orders = [];
                            orders.orders.push({
                                orderId: vm.showLogPanel.orderId,
                                jobChain: vm.showLogPanel.path.split(',')[0]
                            });
                            orders.jobschedulerId = vm.schedulerIds.selected;
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
            watcher2();
            watcher3();
            if (promise1)
                $timeout.cancel(promise1);
        });
    }

    HistoryCtrl.$inject = ["$scope", "OrderService", "TaskService", "$uibModal", "SavedFilter", "$timeout",
        "JobService", "orderByFilter", "CoreService", "UserService", "YadeService"];
    function HistoryCtrl($scope, OrderService, TaskService, $uibModal, SavedFilter, $timeout,
                         JobService, orderBy, CoreService, UserService, YadeService) {
        var vm = $scope;
        vm.maxEntryPerPage = vm.userPreferences.maxEntryPerPage;
        vm.isUnique = true;
        vm.historyView = {};
        vm.historyView.current = vm.userPreferences.historyView == 'current';

        vm.changeJobScheduler = function () {
            vm.init();
        };

        vm.historyFilters = CoreService.getHistoryTab();
        vm.order = vm.historyFilters.order;
        vm.task = vm.historyFilters.task;
        vm.yade = vm.historyFilters.yade;
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
        if (!vm.yade.filter.historyStates) {
            vm.yade.filter.historyStates = 'all';
        }
        if (!vm.yade.filter.date) {
            vm.yade.filter.date = 'today';
        }

        vm.object = {};
        vm.tree = [];
        vm.tree1 = [];
        var isLoaded = true;

        vm.selectedFiltered1;
        vm.selectedFiltered2;
        vm.selectedFiltered3;
        vm.temp_filter1 = {};
        vm.temp_filter2 = {};
        vm.temp_filter3 = {};


        vm.jobChainSearch = {};
        vm.jobSearch = {};
        vm.yadeSearch = {};
        var jobChainSearch = false;
        var jobSearch = false;
        var yadeSearch = false;

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

        vm.savedYadeHistoryFilter = vm.historyFilterObj.yade || {};
        if (vm.historyFilters.yade.selectedView) {
            vm.savedYadeHistoryFilter.selected = vm.savedYadeHistoryFilter.selected || vm.savedYadeHistoryFilter.favorite;
        } else {
            vm.savedYadeHistoryFilter.selected = undefined;
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

        function checkSharedYadeFilters() {
            if (vm.permission.JOCConfigurations.share.view) {
                var obj = {};
                obj.jobschedulerId = vm.schedulerIds.selected;
                obj.configurationType = "CUSTOMIZATION";
                obj.objectType = "YADE_HISTORY";
                obj.shared = true;
                UserService.configurations(obj).then(function (res) {
                    vm.yadeHistoryFilterList = res.configurations;
                    getYadeCustomizations();
                }, function () {
                    vm.yadeHistoryFilterList = [];
                    getYadeCustomizations();
                });
            } else {
                vm.yadeHistoryFilterList = [];
                getYadeCustomizations();
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
                                vm.init();
                            });
                        }
                    });
                    if (flag) {
                        vm.savedHistoryFilter.selected = undefined;
                        loadConfig = true;
                        vm.init();
                    }
                } else {
                    loadConfig = true;
                    vm.savedHistoryFilter.selected = undefined;
                    vm.init();
                }

            }, function (err) {
                vm.savedHistoryFilter.selected = undefined;
                loadConfig = true;
                vm.init();
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
                                vm.init();
                            });
                        }
                    });
                    if (flag) {
                        vm.savedJobHistoryFilter.selected = undefined;
                        loadConfig = true;
                        vm.init();
                    }
                } else {
                    loadConfig = true;
                    vm.savedJobHistoryFilter.selected = undefined;
                    vm.init();
                }

            }, function (err) {
                loadConfig = true;
                vm.savedJobHistoryFilter.selected = undefined;
                vm.init();
            });
        }

        function getYadeCustomizations() {
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.account = vm.permission.user;
            obj.configurationType = "CUSTOMIZATION";
            obj.objectType = "YADE_HISTORY";
            UserService.configurations(obj).then(function (res) {
                if (vm.yadeHistoryFilterList && vm.yadeHistoryFilterList.length > 0) {
                    if (res.configurations && res.configurations.length > 0) {
                        vm.yadeHistoryFilterList = vm.yadeHistoryFilterList.concat(res.configurations);
                    }
                    var data = [];

                    for (var i = 0; i < vm.yadeHistoryFilterList.length; i++) {
                        var flag = true;
                        for (var j = 0; j < data.length; j++) {
                            if (data[j].account == vm.yadeHistoryFilterList[i].account && data[j].name == vm.yadeHistoryFilterList[i].name) {
                                flag = false;
                            }
                        }
                        if (flag) {
                            data.push(vm.yadeHistoryFilterList[i]);
                        }
                    }
                    vm.yadeHistoryFilterList = data;
                } else {
                    vm.yadeHistoryFilterList = res.configurations;
                }

                if (vm.savedYadeHistoryFilter.selected) {
                    var flag = true;
                    angular.forEach(vm.yadeHistoryFilterList, function (value) {
                        if (value.id == vm.savedYadeHistoryFilter.selected) {
                            flag = false;
                            UserService.configuration({
                                jobschedulerId: value.jobschedulerId,
                                id: value.id
                            }).then(function (conf) {
                                loadConfig = true;
                                vm.selectedFiltered3 = JSON.parse(conf.configuration.configurationItem);
                                vm.selectedFiltered3.account = value.account;
                                vm.init();
                            });
                        }
                    });
                    if (flag) {
                        vm.savedYadeHistoryFilter.selected = undefined;
                        loadConfig = true;
                        vm.init();
                    }
                } else {
                    loadConfig = true;
                    vm.savedYadeHistoryFilter.selected = undefined;
                    vm.init();
                }

            }, function (err) {
                loadConfig = true;
                vm.savedYadeHistoryFilter.selected = undefined;
                vm.init();
            });
        }

        if (vm.historyFilters.type == 'jobChain') {
            checkSharedFilters();
        } else if (vm.historyFilters.type == 'job') {
            checkSharedTaskFilters();
        } else {
            checkSharedYadeFilters();
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
                            vm.savedIgnoreList = JSON.parse(res.configuration.configurationItem) || {};
                        }
                        loadIgnoreList = true;
                        vm.init();
                    }, function () {
                        loadIgnoreList = true;
                        vm.init();
                    });
                } else {
                    loadIgnoreList = true;
                    vm.init();
                }
            }, function () {
                loadIgnoreList = true;
                vm.init();
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
        vm.sortBy2 = function (propertyName) {
            vm.yade.sortReverse = !vm.yade.sortReverse;
            vm.yade.filter.sortBy = propertyName;
        };

        function setTaskDateRange(filter) {
            if ((vm.savedIgnoreList.isEnable == true || vm.savedIgnoreList.isEnable == 'true') && (vm.savedIgnoreList.jobs && vm.savedIgnoreList.jobs.length > 0)) {
                filter.excludeJobs = [];
                angular.forEach(vm.savedIgnoreList.jobs, function (job) {
                    filter.excludeJobs.push({job: job});
                });
            }
            if (vm.task.filter.date == 'today') {
                filter.dateFrom = '0d';
                filter.dateTo = '0d';
            } else if (vm.task.filter.date && vm.task.filter.date != 'all') {
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

            if (vm.order.filter.date == 'today') {
                filter.dateFrom = '0d';
                filter.dateTo = '0d';

            } else if (vm.order.filter.date && vm.order.filter.date != 'all') {
                filter.dateFrom = vm.order.filter.date;
            }

            return filter;
        }

        function setYadeDateRange(filter) {

            if (vm.yade.filter.date == 'today') {
                filter.dateFrom = '0d';
                filter.dateTo = '0d';
            } else if (vm.yade.filter.date && vm.yade.filter.date != 'all') {
                filter.dateFrom = vm.yade.filter.date;
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
                filter = {jobschedulerId: vm.historyView.current == true ? vm.schedulerIds.selected : ''};
            }
            vm.isLoading = false;

            if (vm.selectedFiltered2) {
                isCustomizationSelected2(true);
                filter = jobParseDate(filter);
            } else {
                filter = setTaskDateRange(filter);
                if (vm.task.filter.historyStates && vm.task.filter.historyStates != 'all' && vm.task.filter.historyStates.length > 0) {
                    filter.historyStates = [];
                    filter.historyStates.push(vm.task.filter.historyStates);
                }
            }
            filter.limit = parseInt(vm.userPreferences.maxRecords);
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
            TaskService.histories(filter).then(function (res) {
                vm.jobHistorys = res.history;
                setDuration(vm.jobHistorys);
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
                filter = {jobschedulerId: vm.historyView.current == true ? vm.schedulerIds.selected : ''};
            }
            vm.isLoading = false;
            if (vm.selectedFiltered1) {
                isCustomizationSelected1(true);
                filter = orderParseDate(filter);
            } else {
                filter = setOrderDateRange(filter);
                if (vm.order.filter.historyStates && vm.order.filter.historyStates != 'all' && vm.order.filter.historyStates.length > 0) {
                    filter.historyStates = [];
                    filter.historyStates.push(vm.order.filter.historyStates);
                }
            }
            filter.limit = parseInt(vm.userPreferences.maxRecords);
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
            OrderService.histories(filter).then(function (res) {
                vm.historys = res.history;
                setDuration(vm.historys);
                vm.isLoading = true;
                isLoaded = true;
            }, function () {
                vm.isLoading = true;
                isLoaded = true;
            });
        }

        vm.yadeHistory = yadeHistory;

        function yadeHistory(filter) {
            if (!vm.yadeHistoryFilterList) {
                checkSharedYadeFilters();
                return;
            }
            if (!filter) {
                filter = {jobschedulerId: vm.historyView.current == true ? vm.schedulerIds.selected : ''};
            }
            vm.isLoading = false;
            if (vm.selectedFiltered3) {
                isCustomizationSelected3(true);
                filter = yadeParseDate(filter);
            } else {
                filter = setYadeDateRange(filter);
                if (vm.yade.filter.historyStates && vm.yade.filter.historyStates != 'all' && vm.yade.filter.historyStates.length > 0) {
                    filter.states = [];
                    filter.states.push(vm.yade.filter.historyStates);
                }
            }
            filter.limit = parseInt(vm.userPreferences.maxRecords);
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
            filter.compact = true;
            YadeService.getTransfers(filter).then(function (res) {
                vm.yadeHistorys = res.transfers;
                vm.isLoading = true;
                isLoaded = true;
            }, function () {
                vm.isLoading = true;
                isLoaded = true;
            });
        }

        vm.init = function () {
            var filter = {};
            filter.jobschedulerId = vm.historyView.current == true ? vm.schedulerIds.selected : '';
            if (loadConfig && loadIgnoreList) {
                isLoaded = false;
                if (vm.historyFilters.type == 'job') {
                    jobHistory(filter);
                } else if (vm.historyFilters.type == 'jobChain') {
                    orderHistory(filter);
                } else {
                    yadeHistory(filter);
                }
            }
        };

        function mergeHostAndProtocol(hosts, protocols) {
            var arr = [];
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
            } else {
                angular.forEach(hosts, function (value, index) {
                    for (let x = 0; x < protocols.length; x++) {
                        arr.push({host: value, protocol: protocols[x]});
                        protocols.splice(index, 1);
                        break;
                    }
                });
            }
            return arr;
        }

        vm.search = function (flag) {
            if (!flag)
                vm.loading = true;
            var filter = {
                jobschedulerId: vm.historyView.current == true ? vm.schedulerIds.selected : '',
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
                if (vm.jobSearch.date == 'process') {
                    filter = parseProcessExecuted(vm.jobSearch.planned, filter);
                } else {
                    if (vm.jobSearch.date == 'date' && vm.jobSearch.from) {
                        var fromDate = new Date(vm.jobSearch.from);
                        if (vm.jobSearch.fromTime) {
                            fromDate.setHours(moment(vm.jobSearch.fromTime, 'HH:mm:ss').hours());
                            fromDate.setMinutes(moment(vm.jobSearch.fromTime, 'HH:mm:ss').minutes());
                            fromDate.setSeconds(moment(vm.jobSearch.fromTime, 'HH:mm:ss').seconds());
                        } else {
                            fromDate.setHours(0);
                            fromDate.setMinutes(0);
                            fromDate.setSeconds(0);
                        }
                        fromDate.setMilliseconds(0);
                        filter.dateFrom = fromDate;
                    }
                    if (vm.jobSearch.date == 'date' && vm.jobSearch.to) {
                        var toDate = new Date(vm.jobSearch.to);
                        if (vm.jobSearch.toTime) {
                            toDate.setHours(moment(vm.jobSearch.toTime, 'HH:mm:ss').hours());
                            toDate.setMinutes(moment(vm.jobSearch.toTime, 'HH:mm:ss').minutes());
                            toDate.setSeconds(moment(vm.jobSearch.toTime, 'HH:mm:ss').seconds());
                        } else {
                            toDate.setHours(0);
                            toDate.setMinutes(0);
                            toDate.setSeconds(0);
                        }
                        toDate.setMilliseconds(0);
                        filter.dateTo = toDate;
                    }
                }

                if (vm.jobSearch.regex) {
                    filter.regex = vm.jobSearch.regex;
                }
                if (vm.jobSearch.jobschedulerId) {
                    filter.jobschedulerId = vm.jobSearch.jobschedulerId;
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
                TaskService.histories(filter).then(function (res) {
                    vm.jobHistorys = res.history;
                    setDuration(vm.jobHistorys);
                    vm.loading = false;
                    isLoaded = true;
                }, function () {
                    vm.loading = false;
                    isLoaded = true;
                });
                jobSearch = true;
            } else if (vm.historyFilters.type == 'jobChain') {
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
                if (vm.jobChainSearch.date == 'process') {
                    filter = parseProcessExecuted(vm.jobChainSearch.planned, filter);

                }
                if (vm.jobChainSearch.date == 'date' && vm.jobChainSearch.from) {
                    var fromDate = new Date(vm.jobChainSearch.from);
                    if (vm.jobChainSearch.fromTime) {
                        fromDate.setHours(moment(vm.jobChainSearch.fromTime, 'HH:mm:ss').hours());
                        fromDate.setMinutes(moment(vm.jobChainSearch.fromTime, 'HH:mm:ss').minutes());
                        fromDate.setSeconds(moment(vm.jobChainSearch.fromTime, 'HH:mm:ss').seconds());
                    } else {
                        fromDate.setHours(0);
                        fromDate.setMinutes(0);
                        fromDate.setSeconds(0);
                    }
                    fromDate.setMilliseconds(0);
                    filter.dateFrom = fromDate;
                }
                if (vm.jobChainSearch.date == 'date' && vm.jobChainSearch.to) {
                    var toDate = new Date(vm.jobChainSearch.to);
                    if (vm.jobChainSearch.toTime) {
                        toDate.setHours(moment(vm.jobChainSearch.toTime, 'HH:mm:ss').hours());
                        toDate.setMinutes(moment(vm.jobChainSearch.toTime, 'HH:mm:ss').minutes());
                        toDate.setSeconds(moment(vm.jobChainSearch.toTime, 'HH:mm:ss').seconds());

                    } else {
                        toDate.setHours(0);
                        toDate.setMinutes(0);
                        toDate.setSeconds(0);
                    }
                    toDate.setMilliseconds(0);

                    filter.dateTo = toDate;
                }

                if (vm.jobChainSearch.regex) {
                    filter.regex = vm.jobChainSearch.regex;
                }
                if (vm.jobChainSearch.jobschedulerId) {
                    filter.jobschedulerId = vm.jobChainSearch.jobschedulerId;
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
                        if (vm.jobChainSearch.jobChains)
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
                OrderService.histories(filter).then(function (res) {
                    vm.historys = res.history;
                    setDuration(vm.historys);
                    vm.loading = false;
                    isLoaded = true;
                }, function () {
                    vm.loading = false;
                    isLoaded = true;
                });
                jobChainSearch = true;
            }
            else {
                vm.yade.filter.historyStates = '';
                vm.yade.filter.date = '';
                if (vm.yadeSearch.states && vm.yadeSearch.states.length > 0) {
                    filter.states = vm.yadeSearch.states;
                }
                if (vm.yadeSearch.profileId) {
                    vm.yadeSearch.profileId = vm.yadeSearch.profileId.replace(/\s*(,|^|$)\s*/g, "$1");
                    filter.profiles = vm.yadeSearch.profileId.split(',');
                }
                if (vm.yadeSearch.mandator) {
                    filter.mandator = vm.yadeSearch.mandator;
                }
                if (vm.yadeSearch.operations && vm.yadeSearch.operations.length > 0) {
                    filter.operations = vm.yadeSearch.operations;
                }
                if (vm.yadeSearch.sourceFileName) {
                    vm.yadeSearch.sourceFileName = vm.yadeSearch.sourceFileName.replace(/\s*(,|^|$)\s*/g, "$1");
                    filter.sourceFiles = vm.yadeSearch.sourceFileName.split(',');
                }
                if (vm.yadeSearch.targetFileName) {
                    vm.yadeSearch.targetFileName = vm.yadeSearch.targetFileName.replace(/\s*(,|^|$)\s*/g, "$1");
                    filter.targetFiles = vm.yadeSearch.targetFileName.split(',');
                }
                if (vm.yadeSearch.sourceHost || vm.yadeSearch.sourceProtocol) {
                    var hosts = [];
                    var protocols = [];
                    if (vm.yadeSearch.sourceHost) {
                        vm.yadeSearch.sourceHost = vm.yadeSearch.sourceHost.replace(/\s*(,|^|$)\s*/g, "$1");
                        hosts = vm.yadeSearch.sourceHost.split(',');
                    }
                    if (vm.yadeSearch.sourceProtocol) {
                        vm.yadeSearch.sourceProtocol = vm.yadeSearch.sourceProtocol.replace(/\s*(,|^|$)\s*/g, "$1");
                        protocols = vm.yadeSearch.sourceProtocol.split(',');
                    }
                    filter.sources = mergeHostAndProtocol(hosts, protocols);
                }
                if (vm.yadeSearch.targetHost || vm.yadeSearch.targetProtocol) {
                    var hosts = [];
                    var protocols = [];
                    if (vm.yadeSearch.targetHost) {
                        vm.yadeSearch.targetHost = vm.yadeSearch.targetHost.replace(/\s*(,|^|$)\s*/g, "$1");
                        hosts = vm.yadeSearch.targetHost.split(',');
                    }
                    if (vm.yadeSearch.targetProtocol) {
                        vm.yadeSearch.targetProtocol = vm.yadeSearch.targetProtocol.replace(/\s*(,|^|$)\s*/g, "$1");
                        protocols = vm.yadeSearch.targetProtocol.split(',');
                    }
                    filter.targets = mergeHostAndProtocol(hosts, protocols);
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
                    delete filter["timeZone"];
                }
                if ((filter.dateFrom && typeof filter.dateFrom.getMonth === 'function')) {
                    filter.dateFrom = moment(filter.dateFrom).tz(vm.userPreferences.zone)._d;
                }
                if ((filter.dateTo && typeof filter.dateTo.getMonth === 'function')) {
                    filter.dateTo = moment(filter.dateTo).tz(vm.userPreferences.zone)._d;
                }
                filter.compact = true;
                YadeService.getTransfers(filter).then(function (res) {
                    vm.yadeHistorys = res.transfers;
                    setDuration(vm.yadeHistorys);
                    vm.loading = false;
                    isLoaded = true;
                }, function () {
                    vm.loading = false;
                    isLoaded = true;
                });
                yadeSearch = true;
            }
        };
        vm.advancedSearch = function () {
            vm.isUnique = true;
            vm.showSearchPanel = true;
            vm.object.paths = [];
            vm.object.orders = [];
            vm.object.jobChains = [];
            vm.object.jobs = [];
            vm.jobChainSearch.date = 'date';
            vm.jobSearch.date = 'date';
            vm.yadeSearch.date = 'date';

            vm.jobChainSearch.from = new Date();
            vm.jobChainSearch.fromTime = '00:00';
            vm.jobChainSearch.to = new Date();
            vm.jobChainSearch.toTime =  moment().format("HH:mm");

            vm.jobSearch.from = new Date();
            vm.jobSearch.fromTime = '00:00';
            vm.jobSearch.to = new Date();
            vm.jobSearch.toTime =  moment().format("HH:mm");

            vm.yadeSearch.from = new Date();
            vm.yadeSearch.fromTime = '00:00';
            vm.yadeSearch.to = new Date();
            vm.yadeSearch.toTime =  moment().format("HH:mm")
        };
        vm.cancel = function (form) {
            if (form)
                form.$setPristine();
            vm.showSearchPanel = false;
            vm.loadHistory();
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

            obj = parseProcessExecuted(vm.selectedFiltered1.planned, obj);
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
            obj = parseProcessExecuted(vm.selectedFiltered2.planned, obj);
            return obj;
        }

        function yadeParseDate(obj) {
            if (vm.selectedFiltered3.states && vm.selectedFiltered3.states.length > 0) {
                obj.states = vm.selectedFiltered3.states;
            }

            if (vm.selectedFiltered3.operations && vm.selectedFiltered3.operations.length > 0) {
                obj.operations = vm.selectedFiltered3.operations;
            }

            if (vm.selectedFiltered3.profileId) {
                vm.selectedFiltered3.profileId = vm.selectedFiltered3.profileId.replace(/\s*(,|^|$)\s*/g, "$1");
                obj.profiles = vm.selectedFiltered3.profileId.split(',');
            }

            if (vm.selectedFiltered3.mandator) {
                obj.mandator = vm.selectedFiltered3.mandator;
            }

            if (vm.selectedFiltered3.sourceFileName) {
                vm.selectedFiltered3.sourceFileName = vm.selectedFiltered3.sourceFileName.replace(/\s*(,|^|$)\s*/g, "$1");
                obj.sourceFiles = vm.selectedFiltered3.sourceFileName.split(',');
            }
            if (vm.selectedFiltered3.targetFileName) {
                vm.selectedFiltered3.targetFileName = vm.selectedFiltered3.targetFileName.replace(/\s*(,|^|$)\s*/g, "$1");
                obj.targetFiles = vm.selectedFiltered3.targetFileName.split(',');
            }
            if (vm.selectedFiltered3.sourceHost || vm.selectedFiltered3.sourceProtocol) {
                var hosts = [];
                var protocols = [];
                if (vm.selectedFiltered3.sourceHost) {
                    vm.selectedFiltered3.sourceHost = vm.selectedFiltered3.sourceHost.replace(/\s*(,|^|$)\s*/g, "$1");
                    hosts = vm.selectedFiltered3.sourceHost.split(',');
                }
                if (vm.selectedFiltered3.sourceProtocol) {
                    vm.selectedFiltered3.sourceProtocol = vm.selectedFiltered3.sourceProtocol.replace(/\s*(,|^|$)\s*/g, "$1");
                    protocols = vm.selectedFiltered3.sourceProtocol.split(',');
                }
                obj.sources = mergeHostAndProtocol(hosts, protocols);

            }
            if (vm.selectedFiltered3.targetHost || vm.selectedFiltered3.targetProtocol) {
                var hosts = [];
                var protocols = [];
                if (vm.selectedFiltered3.targetHost) {
                    vm.selectedFiltered3.targetHost = vm.selectedFiltered3.targetHost.replace(/\s*(,|^|$)\s*/g, "$1");
                    hosts = vm.selectedFiltered3.targetHost.split(',');
                }
                if (vm.selectedFiltered3.targetProtocol) {
                    vm.selectedFiltered3.targetProtocol = vm.selectedFiltered3.targetProtocol.replace(/\s*(,|^|$)\s*/g, "$1");
                    protocols = vm.selectedFiltered3.targetProtocol.split(',');
                }
                obj.targets = mergeHostAndProtocol(hosts, protocols);
            }
            if (vm.selectedFiltered3.planned)
                obj = parseProcessExecuted(vm.selectedFiltered3.planned, obj);
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
            if (!vm.yade.filter.historyStates) {
                vm.yade.filter.historyStates = 'all';
            }
            if (!vm.yade.filter.date) {
                vm.yade.filter.date = 'today';
            }

            if (vm.historyFilters.type == 'job') {
                vm.jobSearch = {};
                vm.jobSearch.date = 'date';
            } else if (vm.historyFilters.type == 'jobChain') {
                vm.jobChainSearch = {};
                vm.jobChainSearch.date = 'date';
            } else {
                vm.yadeSearch = {};
                vm.yadeSearch.date = 'date';
            }
            vm.init()

        };


        vm.showPanelFuc = function (value) {
            value.show = true;
            var orders = {};
            orders.jobschedulerId = value.jobschedulerId || vm.schedulerIds.selected;
            orders.jobChain = value.jobChain;
            orders.orderId = value.orderId;
            orders.historyId = value.historyId;
            OrderService.history(orders).then(function (res) {
                value.steps = res.history.steps;
            },function(){
                value.steps = [];
            });

        };
        vm.showTransferFuc = function (value) {
            var obj = {};
            obj.jobschedulerId = value.jobschedulerId || vm.schedulerIds.selected;
            obj.transferIds = [];
            obj.transferIds.push(value.id);
            YadeService.getTransfers(obj).then(function (res) {
                value = angular.merge(value, res.transfers[0]);
                vm.isLoading = true;
            }, function () {
                vm.isLoading = true;
            });
            value.show = true;
            if (vm.permission.YADE.view.files) {
                var ids = [];
                ids.push(value.id);
                YadeService.files({
                    transferIds: ids,
                    jobschedulerId: value.jobschedulerId || vm.schedulerIds.selected
                }).then(function (res) {
                    value.files = res.files
                })
            }
        };

        vm.exportToExcel = function () {
            isLoaded = false;
            $('#exportToExcelBtn').attr("disabled", true);

            var fileName = 'jobscheduler-order-history-report';
            if (vm.historyFilters.type == 'job') {
                fileName = 'jobscheduler-task-history-report';
            } else if (vm.historyFilters.type == 'yade') {
                fileName = 'yade-history-report';
            }
            if (!vm.isIE()) {
                $('#' + vm.historyFilters.type).table2excel({
                    exclude: ".tableexport-ignore",
                    filename: fileName,
                    fileext: ".xls",
                    exclude_img: false,
                    exclude_links: false,
                    exclude_inputs: false
                });
            } else {
                var ExportButtons = document.getElementById(vm.historyFilters.type);
                var instance = new TableExport(ExportButtons, {
                    formats: ['xlsx'],
                    exportButtons: false,
                    trimWhitespace: true,
                    bootstrap: false
                });
                var exportData = instance.getExportData()[vm.historyFilters.type]['xlsx'];
                instance.export2file(exportData.data, exportData.mimeType, fileName, exportData.fileExtension);
            }

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
                if (vm.temp_filter1.historyStates) {
                    vm.order.filter.historyStates = angular.copy(vm.temp_filter1.historyStates);
                    vm.order.filter.date = angular.copy(vm.temp_filter1.date);
                } else {
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
                if (vm.temp_filter2.historyStates) {
                    vm.task.filter.historyStates = angular.copy(vm.temp_filter2.historyStates);
                    vm.task.filter.date = angular.copy(vm.temp_filter2.date);
                } else {
                    vm.task.filter.historyStates = 'all';
                    vm.task.filter.date = 'today';
                }
            }
        }

        function isCustomizationSelected3(flag) {
            if (flag) {
                vm.temp_filter3.states = angular.copy(vm.yade.filter.historyStates);
                vm.temp_filter3.date = angular.copy(vm.yade.filter.date);
                vm.yade.filter.historyStates = '';
                vm.yade.filter.date = '';
            } else {
                if (vm.temp_filter3.states) {
                    vm.task.filter.historyStates = angular.copy(vm.temp_filter3.historyStates);
                    vm.task.filter.date = angular.copy(vm.temp_filter3.date);
                } else {
                    vm.yade.filter.historyStates = 'all';
                    vm.yade.filter.date = 'today';
                }
            }
        }

        /**--------------- Filter -----------------------------*/
        vm.saveAsFilter = function (form) {
            var configObj = {};
            configObj.jobschedulerId = vm.schedulerIds.selected;
            configObj.account = vm.permission.user;
            configObj.configurationType = "CUSTOMIZATION";
            var obj = {};
            if (vm.jobChainSearch.name) {
                configObj.name = vm.jobChainSearch.name;
                obj.regex = vm.jobChainSearch.regex;
                obj.paths = vm.jobChainSearch.paths;
                obj.jobChains = vm.jobChainSearch.jobChains;
                obj.orders = vm.jobChainSearch.orders;
                obj.state = vm.jobChainSearch.states;
                obj.name = vm.jobChainSearch.name;
                obj.planned = vm.jobChainSearch.planned;
            }
            else if (vm.jobChainSearch.name) {
                configObj.name = vm.jobSearch.name;
                obj.regex = vm.jobSearch.regex;
                obj.paths = vm.jobSearch.paths;
                obj.jobs = vm.jobSearch.jobs;
                obj.state = vm.jobSearch.states;
                obj.name = vm.jobSearch.name;
                obj.planned = vm.jobSearch.planned;
            }

            else {
                configObj.name = vm.yadeSearch.name;
                obj = vm.yadeSearch;
            }
            configObj.id = 0;

            if (vm.historyFilters.type == 'jobChain') {
                configObj.objectType = "ORDER_HISTORY";
            } else if (vm.historyFilters.type == 'job') {
                configObj.objectType = "TASK_HISTORY";
            } else {
                configObj.objectType = "YADE_HISTORY";
            }
            configObj.configurationItem = JSON.stringify(obj);
            UserService.saveConfiguration(configObj).then(function (res) {
                configObj.id = res.id;
                if (vm.historyFilters.type == 'jobChain') {
                    vm.jobChainSearch.name = '';
                } else if (vm.historyFilters.type == 'job') {
                    vm.jobSearch.name = '';
                } else {
                    vm.yadeSearch.name = '';
                }
                if (form)
                    form.$setPristine();

                if (vm.historyFilters.type == 'jobChain') {
                    vm.orderHistoryFilterList.push(configObj);
                } else if (vm.historyFilters.type == 'job') {
                    vm.jobHistoryFilterList.push(configObj);
                } else {
                    vm.yadeHistoryFilterList.push(configObj);
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
            vm.historyFilter.planned = 'today';
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
                } else if (vm.historyFilters.type == 'job') {
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
                            vm.init();
                            isCustomizationSelected1(true);
                        }
                        vm.historyFilterObj.order = vm.savedHistoryFilter;
                    } else if (vm.historyFilters.type == 'job') {
                        vm.jobHistoryFilterList.push(configObj);
                        if (vm.jobHistoryFilterList.length == 1) {
                            vm.savedJobHistoryFilter.selected = res.id;
                            vm.historyFilters.task.selectedView = true;
                            vm.selectedFiltered2 = vm.historyFilter;
                            vm.selectedFiltered2.account = vm.permission.user;
                            vm.init();
                            isCustomizationSelected2(true);
                        }
                        vm.historyFilterObj.job = vm.savedJobHistoryFilter;
                    }
                    SavedFilter.setHistory(vm.historyFilterObj);
                    SavedFilter.save();
                });
                vm.object.paths = [];
                vm.object.orders = [];
                vm.object.jobChains = [];
                vm.object.jobs = [];
            }, function () {
                vm.object.paths = [];
                vm.object.orders = [];
                vm.object.jobChains = [];
                vm.object.jobs = [];
            });
        };
        vm.advanceFilter1 = function () {
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
                configObj.objectType = "YADE_HISTORY";

                UserService.saveConfiguration(configObj).then(function (res) {
                    configObj.id = res.id;
                    vm.yadeHistoryFilterList.push(configObj);


                    if (vm.yadeHistoryFilterList.length == 1) {
                        vm.savedHistoryFilter.selected = res.id;
                        vm.yadeFilter.yade.selectedView = true;
                        vm.selectedFiltered3 = vm.yadeFilter;
                        vm.selectedFiltered3.account = vm.permission.user;
                        vm.init();
                        isCustomizationSelected3(true);
                    }
                    vm.historyFilterObj.yade = vm.savedHistoryFilter;

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
            } else if (vm.historyFilters.type == 'job') {
                vm.filters.list = vm.jobHistoryFilterList;
                vm.filters.favorite = vm.savedJobHistoryFilter.favorite;
            } else {
                vm.filters.list = vm.yadeHistoryFilterList;
                vm.filters.favorite = vm.savedYadeHistoryFilter.favorite;
            }

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
                if (vm.historyFilters.type == 'yade') {
                    vm.yadeFilter = vm.historyFilter;
                }
            });
            var url = 'modules/core/template/edit-history-filter-dialog.html';
            if (vm.historyFilters.type == 'yade') {
                url = 'modules/core/template/yade-filter-dialog.html';
            }
            var modalInstance = $uibModal.open({
                templateUrl: url,
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
                        vm.init();
                        isCustomizationSelected1(true);
                    }
                    vm.historyFilterObj.order = vm.savedHistoryFilter;

                } else if (vm.historyFilters.type == 'job') {
                    if (vm.savedJobHistoryFilter.selected == filter.id) {
                        vm.selectedFiltered2 = vm.historyFilter;
                        vm.historyFilters.task.selectedView = true;
                        vm.init();
                        isCustomizationSelected2(true);
                    }
                    vm.historyFilterObj.job = vm.savedJobHistoryFilter;
                } else if (vm.historyFilters.type == 'yade') {
                    if (vm.savedHistoryFilter.selected == filter.id) {
                        vm.selectedFiltered3 = vm.yadeFilter;
                        vm.historyFilters.yade.selectedView = true;
                        vm.init();
                        isCustomizationSelected3(true);
                    }
                    vm.historyFilterObj.yade = vm.savedHistoryFilter;

                }
                var configObj = {};
                configObj.jobschedulerId = filter.jobschedulerId;
                configObj.account = filter.account;
                configObj.configurationType = filter.configurationType;
                configObj.objectType = filter.objectType;
                configObj.id = filter.id;
                if (vm.historyFilters.type == 'yade') {
                    configObj.configurationItem = JSON.stringify(vm.yadeFilter);
                    configObj.name = vm.yadeFilter.name;
                    configObj.shared = vm.yadeFilter.shared;
                    filter.shared = vm.yadeFilter.shared;
                    filter.name = vm.yadeFilter.name;
                } else {
                    configObj.configurationItem = JSON.stringify(vm.historyFilter);
                    configObj.name = vm.historyFilter.name;
                    configObj.shared = vm.historyFilter.shared;
                    filter.shared = vm.historyFilter.shared;
                    filter.name = vm.historyFilter.name;
                }

                UserService.saveConfiguration(configObj);

                temp_name = '';
                vm.object.paths = [];
                vm.object.orders = [];
                vm.object.jobChains = [];
                vm.object.jobs = [];
                temp_name = '';
            }, function () {
                temp_name = '';
                vm.object.paths = [];
                vm.object.orders = [];
                vm.object.jobChains = [];
                vm.object.jobs = [];
                temp_name = '';
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
                } else if (vm.historyFilters.type == 'job') {
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
                    } else if (vm.historyFilters.type == 'job') {
                        vm.jobHistoryFilterList.push(configObj);
                    }
                });
                vm.object.paths = [];
                vm.object.orders = [];
                vm.object.jobChains = [];
                vm.object.jobs = [];
            }, function () {
                vm.object.paths = [];
                vm.object.orders = [];
                vm.object.jobChains = [];
                vm.object.jobs = [];
            });
        };


        vm.copyFilter1 = function (filter) {
            vm.action = 'copy';
            vm.isUnique = true;
            UserService.configuration({jobschedulerId: filter.jobschedulerId, id: filter.id}).then(function (conf) {
                vm.yadeFilter = JSON.parse(conf.configuration.configurationItem);
                vm.yadeFilter.shared = filter.shared;

                if (vm.historyFilters.type == 'yade') {
                    vm.yadeFilter.name = vm.checkCopyName(vm.yadeHistoryFilterList, filter.name);
                }
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
                    if (vm.historyFilters.type == 'yade') {
                        vm.yadeHistoryFilterList.push(configObj);
                    }
                });
            }, function () {
            });
        };
        vm.deleteFilter = function (filter) {
            UserService.deleteConfiguration({
                jobschedulerId: filter.jobschedulerId,
                id: filter.id
            }).then(function () {
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
                        vm.init();
                    } else {
                        if (vm.orderHistoryFilterList.length == 0) {
                            vm.savedHistoryFilter.selected = undefined;
                            vm.historyFilters.order.selectedView = false;
                            vm.selectedFiltered1 = undefined;
                            isCustomizationSelected1(false);
                        }
                    }
                    vm.historyFilterObj.order = vm.savedHistoryFilter;
                } else if (vm.historyFilters.type == 'job') {
                    angular.forEach(vm.jobHistoryFilterList, function (value, index) {
                        if (value.id == filter.id) {
                            vm.jobHistoryFilterList.splice(index, 1);
                        }
                    });

                    if (vm.savedJobHistoryFilter.selected == filter.id) {
                        vm.savedJobHistoryFilter.selected = undefined;
                        vm.historyFilters.task.selectedView = false;
                        vm.selectedFiltered2 = undefined;
                        vm.init();
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
                } else {
                    angular.forEach(vm.yadeHistoryFilterList, function (value, index) {
                        if (value.id == filter.id) {
                            vm.yadeHistoryFilterList.splice(index, 1);
                        }
                    });

                    if (vm.savedYadeHistoryFilter.selected == filter.id) {
                        vm.savedYadeHistoryFilter.selected = undefined;
                        vm.historyFilters.yade.selectedView = false;
                        vm.selectedFiltered3 = undefined;
                        vm.init();
                        isCustomizationSelected3(false);
                    } else {
                        if (vm.yadeHistoryFilterList.length == 0) {
                            vm.savedYadeHistoryFilter.selected = undefined;
                            vm.historyFilters.yade.selectedView = false;
                            vm.selectedFiltered3 = undefined;
                            isCustomizationSelected3(false);
                        }
                    }
                    vm.historyFilterObj.yade = vm.savedYadeHistoryFilter;
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
                    } else if (vm.historyFilters.type == 'job') {
                        angular.forEach(vm.jobHistoryFilterList, function (value, index) {
                            if (value.id == configObj.id) {
                                vm.jobHistoryFilterList.splice(index, 1);
                            }
                        });
                    } else {
                        angular.forEach(vm.yadeHistoryFilterList, function (value, index) {
                            if (value.id == configObj.id) {
                                vm.yadeHistoryFilterList.splice(index, 1);
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
            } else if (vm.historyFilters.type == 'job') {
                vm.savedJobHistoryFilter.favorite = filter.id;
                vm.historyFilters.task.selectedView = true;
                vm.historyFilterObj.job = vm.savedJobHistoryFilter;
            }
            else {
                vm.savedYadeHistoryFilter.favorite = filter.id;
                vm.historyFilters.yade.selectedView = true;
                vm.historyFilterObj.yade = vm.savedYadeHistoryFilter;
            }
            SavedFilter.setHistory(vm.historyFilterObj);
            SavedFilter.save();
            vm.init();
        };

        vm.removeFavorite = function () {
            if (vm.historyFilters.type == 'jobChain') {
                vm.savedHistoryFilter.favorite = '';
                vm.historyFilterObj.order = vm.savedHistoryFilter;
            } else if (vm.historyFilters.type == 'job') {
                vm.savedJobHistoryFilter.favorite = '';
                vm.historyFilterObj.job = vm.savedJobHistoryFilter;
            }
            else {
                vm.savedYadeHistoryFilter.favorite = '';
                vm.historyFilterObj.yade = vm.savedYadeHistoryFilter;
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
            } else if (vm.historyFilters.type == 'job') {
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
            else if (vm.historyFilters.type == 'yade') {
                if (vm.yadeSearch && vm.yadeSearch.name) {
                    angular.forEach(vm.yadeHistoryFilterList, function (value) {
                        if (vm.yadeSearch.name == value.name && vm.permission.user == value.account) {
                            vm.isUnique = false;
                        }
                    });
                } else if (vm.yadeFilter) {
                    angular.forEach(vm.yadeHistoryFilterList, function (value) {
                        if (vm.yadeFilter.name == value.name && vm.permission.user == value.account && vm.yadeFilter.name != temp_name) {
                            vm.isUnique = false;
                        }
                    });
                }
            }
        };

        vm.changeFilter = function (filter) {
            vm.cancel();
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
                        vm.init();
                    });
                }
                else {
                    isCustomizationSelected1(false);
                    vm.savedHistoryFilter.selected = filter;
                    vm.historyFilters.order.selectedView = false;
                    vm.selectedFiltered1 = filter;
                    vm.init();
                }

                vm.historyFilterObj.order = vm.savedHistoryFilter;

            } else if (vm.historyFilters.type == 'job') {
                if (filter) {
                    vm.savedJobHistoryFilter.selected = filter.id;
                    vm.historyFilters.task.selectedView = true;
                    UserService.configuration({
                        jobschedulerId: filter.jobschedulerId,
                        id: filter.id
                    }).then(function (conf) {
                        vm.selectedFiltered2 = JSON.parse(conf.configuration.configurationItem);
                        vm.selectedFiltered2.account = filter.account;
                        vm.init();
                    });
                }
                else {
                    isCustomizationSelected2(false);
                    vm.savedJobHistoryFilter.selected = filter;
                    vm.historyFilters.task.selectedView = false;
                    vm.selectedFiltered2 = filter;
                    vm.init();
                }

                vm.historyFilterObj.job = vm.savedJobHistoryFilter;
            }
            else if (vm.historyFilters.type == 'yade') {
                if (filter) {
                    vm.savedYadeHistoryFilter.selected = filter.id;
                    vm.historyFilters.yade.selectedView = true;
                    UserService.configuration({
                        jobschedulerId: filter.jobschedulerId,
                        id: filter.id
                    }).then(function (conf) {
                        vm.selectedFiltered3 = JSON.parse(conf.configuration.configurationItem);
                        vm.selectedFiltered3.account = filter.account;
                        vm.init();
                    });
                }
                else {
                    isCustomizationSelected3(false);
                    vm.savedYadeHistoryFilter.selected = filter;
                    vm.historyFilters.yade.selectedView = false;
                    vm.selectedFiltered3 = filter;
                    vm.init();
                }

                vm.historyFilterObj.yade = vm.savedYadeHistoryFilter;
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
                    angular.forEach(vm.tree, function (value) {
                        value.expanded = true;
                    });
                }, function (err) {
                    $('#treeModal').modal('hide');
                });
            } else if (vm.historyFilters.type == 'job') {
                JobService.tree({
                    jobschedulerId: vm.schedulerIds.selected,
                    compact: true,
                    types: ['JOB']
                }).then(function (res) {
                    vm.tree = res.folders;
                    angular.forEach(vm.tree, function (value) {
                        value.expanded = true;
                    });
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
                    angular.forEach(vm.tree1, function (value) {
                        value.expanded = true;
                    });
                }, function (err) {
                    $('#objectModal').modal('hide');
                });
            } else if (vm.historyFilters.type == 'job') {
                JobService.tree({
                    jobschedulerId: vm.schedulerIds.selected,
                    compact: true,
                    types: ['JOB']
                }).then(function (res) {
                    vm.tree1 = res.folders;
                    angular.forEach(vm.tree1, function (value) {
                        value.expanded = true;
                    });
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
                        setTimeout(function () {
                            if (window.localStorage.$SOS$THEME == 'lighter' || window.localStorage.$SOS$THEME == 'light') {
                                $('.order_img').attr("src", 'images/order.png');
                            }
                        }, 100);

                    });
                } else if (vm.historyFilters.type == 'job') {
                    data.jobs = [];
                    var obj = {};
                    obj.jobschedulerId = vm.schedulerIds.selected;
                    obj.compact = true;
                    obj.folders = [{folder: data.path, recursive: false}];
                    JobService.getJobsP(obj).then(function (result) {
                        data.jobs = result.jobs;
                        setTimeout(function () {
                            if (window.localStorage.$SOS$THEME == 'lighter' || window.localStorage.$SOS$THEME == 'light') {
                                $('.job_img').attr("src", 'images/job.png');
                            }
                        }, 100);
                    });
                }
            } else {
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
            if (vm.historyFilter && !vm.showSearchPanel) {
                vm.historyFilter.paths = vm.paths;
            } else if (vm.jobChainSearch && vm.historyFilters.type == 'jobChain') {
                vm.jobChainSearch.paths = vm.paths;
            } else if (vm.jobSearch && vm.historyFilters.type == 'job') {
                vm.jobSearch.paths = vm.paths;
            }
        };
        vm.addObjectPaths = function () {
            if (vm.historyFilters.type == 'jobChain') {
                if (vm.jobChainSearch && vm.showSearchPanel) {
                    vm.jobChainSearch.orders = vm.orders;
                    vm.jobChainSearch.jobChains = vm.jobChains;
                }
                else if (vm.historyFilter && !vm.showSearchPanel) {
                    vm.historyFilter.orders = vm.orders;
                    vm.historyFilter.jobChains = vm.jobChains;
                }
            } else if (vm.historyFilters.type == 'job') {
                if (vm.jobSearch && vm.showSearchPanel) {
                    vm.jobSearch.jobs = vm.jobs;
                }
                else if (vm.historyFilter && !vm.showSearchPanel) {
                    vm.historyFilter.jobs = vm.jobs;
                }
            }
        };
        vm.remove = function (object, type) {
            if (type == 'jobChain') {
                if (vm.historyFilter && vm.historyFilter.jobChains && !vm.showSearchPanel) {
                    for (var i = 0; i < vm.historyFilter.jobChains.length; i++) {
                        if (angular.equals(vm.historyFilter.jobChains[i], object)) {
                            vm.historyFilter.jobChains.splice(i, 1);
                            break;
                        }
                    }

                } else {
                    for (var i = 0; i < vm.jobChainSearch.jobChains.length; i++) {
                        if (angular.equals(vm.jobChainSearch.jobChains[i], object)) {
                            vm.jobChainSearch.jobChains.splice(i, 1);
                            break;
                        }
                    }

                }
            } else if (type == 'job') {
                if (vm.historyFilter && vm.historyFilter.jobs && !vm.showSearchPanel) {
                    for (var i = 0; i < vm.historyFilter.jobs.length; i++) {
                        if (angular.equals(vm.historyFilter.jobs[i], object)) {
                            vm.historyFilter.jobs.splice(i, 1);
                            break;
                        }
                    }
                } else {
                    for (var i = 0; i < vm.jobSearch.jobs.length; i++) {
                        if (angular.equals(vm.jobSearch.jobs[i], object)) {
                            vm.jobSearch.jobs.splice(i, 1);
                            break;
                        }
                    }
                }

            } else if (type == 'order') {
                if (vm.historyFilter && vm.historyFilter.orders && !vm.showSearchPanel) {
                    for (var i = 0; i < vm.historyFilter.orders.length; i++) {
                        if (angular.equals(vm.historyFilter.orders[i], object)) {
                            vm.historyFilter.orders.splice(i, 1);
                            vm.object.orders.splice(i, 1);
                            break;
                        }
                    }
                } else {
                    for (var i = 0; i < vm.jobChainSearch.orders.length; i++) {
                        if (angular.equals(vm.jobChainSearch.orders[i], object)) {
                            vm.jobChainSearch.orders.splice(i, 1);
                            vm.object.orders.splice(i, 1);
                            break;
                        }
                    }
                }

            } else {
                if (vm.historyFilter && vm.historyFilter.paths && !vm.showSearchPanel) {
                    for (var i = 0; i < vm.historyFilter.paths.length; i++) {
                        if (angular.equals(vm.historyFilter.paths[i], object)) {
                            vm.historyFilter.paths.splice(i, 1);
                            break;
                        }
                    }
                } else if (vm.jobChainSearch && vm.historyFilters.type == 'jobChain') {
                    for (var i = 0; i < vm.jobChainSearch.paths.length; i++) {
                        if (angular.equals(vm.jobChainSearch.paths[i], object)) {
                            vm.jobChainSearch.paths.splice(i, 1);
                            break;
                        }
                    }
                } else if (vm.jobSearch && vm.historyFilters.type == 'job') {
                    for (var i = 0; i < vm.jobSearch.paths.length; i++) {
                        if (angular.equals(vm.jobSearch.paths[i], object)) {
                            vm.jobSearch.paths.splice(i, 1);
                            break;
                        }
                    }
                }
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
                        vm.init();
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
                        vm.init();
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
                        vm.init();
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
                    vm.init();
            }
        };
        vm.removeJobChainIgnoreList = function (name) {
            vm.savedIgnoreList.jobChains.splice(vm.savedIgnoreList.jobChains.indexOf(name), 1);
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
                    vm.init();
            }
        };
        vm.removeJobIgnoreList = function (name) {
            vm.savedIgnoreList.jobs.splice(vm.savedIgnoreList.jobs.indexOf(name), 1);
            configObj.configurationType = "IGNORELIST";
            configObj.configurationItem = JSON.stringify(vm.savedIgnoreList);
            configObj.id = vm.ignoreListConfigId;
            UserService.saveConfiguration(configObj).then(function (res) {
                vm.ignoreListConfigId = res.id;
            });
            if ((vm.savedIgnoreList.isEnable == 'true' || vm.savedIgnoreList.isEnable == true)) {
                if ((jobSearch && vm.historyFilters.type != 'jobChain')) {
                    vm.search(true);
                } else
                    vm.init();
            }
        };

        vm.resetIgnoreList = function () {

            if ((vm.savedIgnoreList.isEnable == 'true' || vm.savedIgnoreList.isEnable == true) && vm.historyFilters.type == 'jobChain' && ((vm.savedIgnoreList.jobChains && vm.savedIgnoreList.jobChains.length > 0) || (vm.savedIgnoreList.orders && vm.savedIgnoreList.orders.length > 0))) {
                if (jobChainSearch) {
                    vm.search(true);
                } else
                    vm.init();
            } else if ((vm.savedIgnoreList.isEnable == 'true' || vm.savedIgnoreList.isEnable == true) && vm.historyFilters.type != 'jobChain' && (vm.savedIgnoreList.jobs && vm.savedIgnoreList.jobs.length > 0)) {
                if (jobSearch) {
                    vm.search(true);
                } else
                    vm.init();
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
            });
            if ((jobSearch && vm.historyFilters.type != 'jobChain') || (jobChainSearch && vm.historyFilters.type == 'jobChain')) {
                vm.search(true);
            } else
                vm.init();
        };


        function getTransfer(transfer) {
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.transferIds = [];
            obj.transferIds.push(transfer.id);
            YadeService.getTransfers(obj).then(function (res) {
                if (res.transfers && res.transfers.length > 0) {
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

        function getFiles(value) {
            if (vm.permission.YADE.view.files) {
                var ids = [];
                ids.push(value.id);
                YadeService.files({
                    transferIds: ids,
                    jobschedulerId: value.jobschedulerId || vm.schedulerIds.selected
                }).then(function (res) {
                    value.files = res.files
                })
            }
        }

        function updateHistoryAfterEvent() {
            var filter = {};
            isLoaded = false;
            if (vm.historyFilters.type == 'jobChain') {

                filter.jobschedulerId = vm.historyView.current == true ? vm.schedulerIds.selected : '';

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
                    OrderService.histories(filter).then(function (res) {
                        vm.historys = res.history;
                        setDuration(vm.historys);
                        isLoaded = true;
                    }, function () {
                        isLoaded = true;
                    });
                }
            } else if (vm.historyFilters.type == 'job') {

                filter.jobschedulerId = vm.historyView.current == true ? vm.schedulerIds.selected : '';
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
                    TaskService.histories(filter).then(function (res) {
                        vm.jobHistorys = res.history;
                        setDuration(vm.jobHistorys);
                        isLoaded = true;
                    }, function () {
                        isLoaded = true;
                    });
                }
            } else if (vm.historyFilters.type == 'yade') {

                filter = {jobschedulerId: vm.historyView.current == true ? vm.schedulerIds.selected : ''};

                if (vm.selectedFiltered3) {
                    isCustomizationSelected3(true);
                    filter = yadeParseDate(filter);
                } else {
                    filter = setYadeDateRange(filter);
                    if (vm.yade.filter.historyStates && vm.yade.filter.historyStates != 'all' && vm.yade.filter.historyStates.length > 0) {
                        filter.states = [];
                        filter.states.push(vm.yade.filter.historyStates);
                    }
                }
                filter.limit = parseInt(vm.userPreferences.maxRecords);
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
                filter.compact = true;
                if (yadeSearch) {
                    vm.search(true);
                } else {
                    YadeService.getTransfers(filter).then(function (res) {
                        vm.yadeHistorys = res.transfers;
                        vm.isLoading = true;
                        isLoaded = true;
                    }, function () {
                        vm.isLoading = true;
                        isLoaded = true;
                    });
                }
            }
        }

        vm.$on('event-started', function () {
            if (vm.events && vm.events[0] && vm.events[0].eventSnapshots) {
                for (var i = 0; i <= vm.events[0].eventSnapshots.length - 1; i++) {
                    if (vm.events[0].eventSnapshots[i].eventType == 'ReportingChangedOrder' && isLoaded) {
                        isLoaded = false;
                        updateHistoryAfterEvent();
                        break;
                    } else if (vm.events[0].eventSnapshots[i].eventType == 'ReportingChangedJob' && isLoaded) {
                        updateHistoryAfterEvent();
                        break;
                    } else if (vm.events[0].eventSnapshots[i].objectType == 'OTHER') {
                        if (vm.events[0].eventSnapshots[i].eventType == 'YADETransferStarted') {
                            updateHistoryAfterEvent();
                            break;
                        } else if (vm.events[0].eventSnapshots[i].eventType == 'YADETransferUpdated' && vm.historyFilters.type == 'yade') {
                            for (var x = 0; x < vm.yadeHistorys.length; x++) {
                                if (vm.yadeHistorys[x].id == vm.events[0].eventSnapshots[i].path) {
                                    getTransfer(vm.yadeHistorys[x]);
                                    break;
                                }
                            }
                        } else if (vm.events[0].eventSnapshots[i].eventType == 'YADEFileStateChanged') {
                            for (var x = 0; x < vm.yadeHistorys.length; x++) {
                                if (vm.yadeHistorys[x].id == vm.events[0].eventSnapshots[i].path && vm.yadeHistorys[x].show) {
                                    getFiles(vm.yadeHistorys[x]);
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        });

        function setDuration(histories) {
            angular.forEach(histories, function (history, index) {
                if (history.startTime && history.endTime) {
                    histories[index].duration = new Date(history.endTime).getTime() - new Date(history.startTime).getTime();
                }
            })
        }

        vm.$on('resetViewDate', function () {
            updateHistoryAfterEvent();
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

    LogCtrl.$inject = ["$scope", "OrderService", "TaskService", "$location", "FileSaver", "Blob", "$timeout","SOSAuth"];
    function LogCtrl($scope, OrderService, TaskService, $location, FileSaver, Blob, $timeout, SOSAuth) {
        var vm = $scope;
        vm.isLoading = false;
        let abs_url = $location.absUrl();
        abs_url = abs_url.substring(0, abs_url.indexOf('#!/'));

        vm.saveLog = function () {
            if (vm.logs) {
                var code = String(vm.logs).replace(/<[^>]+>/gm, '');
                var data = new Blob([code], {type: 'text/plain;charset=utf-8'});
                FileSaver.saveAs(data, 'history.log');
            }
        };

        function getParam(name) {
            var url = window.location.href;
            if (!url) url = location.href;
            name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
            var regexS = "[\\?&]" + name + "=([^&]*)";
            var regex = new RegExp(regexS);
            var results = regex.exec(url);
            return results == null ? null : decodeURIComponent(results[1].replace(/\+/g, ""));
        }

        var object = $location.search();
        var t1;
        vm.loadOrderLog = function () {
            vm.jobChain = getParam("jobChain");
            var orders = {};
            orders.jobschedulerId = getParam("schedulerId");
            orders.jobChain = vm.jobChain;
            orders.orderId = vm.orderId;
            orders.historyId = getParam("historyId");
            orders.filename = getParam("filename");

            OrderService.log(orders).then(function (res) {
                vm.isLoading = true;
                res.data = res.data.replace("[ERROR]", "<span class=\"log_error\">[ERROR]</span>");
                vm.logs = res.data.replace("[WARN]", "<span class=\"log_warn\">[WARN]</span>");
                if (vm.userPreferences.theme !== 'light' && vm.userPreferences.theme !== 'lighter')
                    t1 = $timeout(function () {
                        $('.log_info').css('color', 'white')
                    }, 100);
            }, function (err) {
                vm.logs = err;
                vm.isLoading = true;
            });
        };

        vm.loadJobLog = function () {
            vm.job = getParam("job");
            var jobs = {};
            jobs.jobschedulerId = getParam("schedulerId");
            jobs.taskId = vm.taskId;
            jobs.filename = getParam("filename");
            TaskService.log(jobs).then(function (res) {
                vm.isLoading = true;
                res.data = res.data.replace("[ERROR]", "<span class=\"log_error\">[ERROR]</span>");
                vm.logs = res.data.replace("[WARN]", "<span class=\"log_warn\">[WARN]</span>");
                if (vm.userPreferences.theme !== 'light' && vm.userPreferences.theme !== 'lighter')
                    t1 = $timeout(function () {
                        $('.log_info').css('color', 'white')
                    }, 100);
            }, function (err) {
                vm.logs = err;
                vm.isLoading = true;
            });
        };
        if (object && getParam("historyId")) {
            vm.orderId = getParam("orderId");
            vm.loadOrderLog();
        }
        else if (object && getParam("taskId")) {
            vm.taskId = getParam("taskId");
            vm.loadJobLog();
        } else {
            alert('Invalid URL');
        }
        
        $scope.downloadLog = function () {
            if (getParam("orderId")) {
                document.getElementById("tmpFrame").src = './api/order/log/download?orderId='+getParam("orderId")+'&jobChain='+getParam("jobChain")+'&historyId='+getParam("historyId")+'&jobschedulerId=' + getParam("schedulerId") +
                     '&accessToken=' + SOSAuth.accessTokenId;
            } else if (getParam("taskId")) {
                document.getElementById("tmpFrame").src = './api/task/log/download?taskId='+getParam("taskId")+'&jobschedulerId=' + getParam("schedulerId") +
                     '&accessToken=' + SOSAuth.accessTokenId;
            }
            document.getElementById("tmpFrame").contentWindow.onerror = function () {
                alert('Download error!!');
                return false;
            }
        };

        $scope.$on('$destroy', function () {
            if (t1)
                $timeout.cancel(t1);
        });
    }
})
();
