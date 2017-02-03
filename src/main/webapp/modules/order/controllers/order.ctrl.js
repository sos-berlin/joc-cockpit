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

    JobChainOrdersCtrl.$inject = ["$scope", "SOSAuth", "OrderService", "CoreService","AuditLogService"];
    function JobChainOrdersCtrl($scope, SOSAuth, OrderService, CoreService,AuditLogService) {
        var vm = $scope;
        vm.orderFilters = CoreService.getOrderDetailTab();
        vm.orderFilters.overview = false;
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
                                order = res.orders[i];
                                data.push(order);
                                break;
                            }
                        }
                    });
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
                if (loadFinished)
                    loadOrders(obj);
            }
        }

        loadJobChain();
        $scope.$on("reloadJobChain", function () {
            loadJobChain();
        });

        $scope.$on("orderState", function (evt, state) {
            if (state) {
                var obj = {};
                obj.jobschedulerId = $scope.schedulerIds.selected;
                obj.compact = true;
                obj.orders = [];
                obj.orders.push({jobChain: vm.jobChain.path});
                if (state != 'ALL') {
                    obj.processingStates = [];
                    obj.processingStates.push(state);
                    loadOrders(obj);
                } else {
                    loadOrders(obj);
                }
            }
        });

        vm.showLogFuc = function (value) {
            var orders = {};
            vm.isAuditLog =false;
            orders = {};
            orders.orders = [];
            orders.orders.push({orderId: value.orderId, jobChain: value.jobChain});
            orders.jobschedulerId = $scope.schedulerIds.selected;

            OrderService.histories(orders).then(function (res) {
                vm.historys = res.history;
            });

            vm.showLogPanel = value;
            vm.orderFilters.showLogPanel = vm.showLogPanel;
        };

        function loadAuditLogs(obj) {
            obj.limit = parseInt($window.localStorage.$SOS$MAXAUDITLOGPEROBJECT);
            AuditLogService.getLogs(obj).then(function (result) {
                if (result && result.auditLog) {
                    vm.auditLogs = result.auditLog;
                }
            });
        }

        vm.showAuditLogs = function (value) {
             vm.showLogPanel = value;
            vm.orderFilters.showLogPanel = vm.showLogPanel;
            vm.isAuditLog =true;
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.orders = [];
            obj.orders.push({jobChain: value.jobChain,orderId:value.orderId});
            loadAuditLogs(obj);
        };


        if (vm.orderFilters && vm.orderFilters.showLogPanel) {
            vm.showLogFuc(vm.orderFilters.showLogPanel);
        }

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

    JobChainOverviewCtrl.$inject = ["$scope", "$rootScope", "OrderService", "SOSAuth", "JobChainService", "JobService", "$timeout", "DailyPlanService", "$state", "$location", "CoreService", "$uibModal", "$window"];
    function JobChainOverviewCtrl($scope, $rootScope, OrderService, SOSAuth, JobChainService, JobService, $timeout, DailyPlanService, $state, $location, CoreService, $uibModal, $window) {

        var vm = $scope;
        vm.orderFilters = CoreService.getOrderDetailTab();
        vm.orderFilters.pageView = 'grid';

        vm.orderFilters.overview = true;

        vm.selectedNodes = [];
        vm.allOrdersCheck = {};
        vm.allOrdersCheck.orders = [];
        vm.obj = {};
        vm.obj.orders = [];
        var promise1, promise2;
        var object = $location.search();


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
                angular.forEach(vm.selectedNodes, function (value) {

                    if (value.state && value.state._text == 'STOPPED') {
                        vm.isStoppedNode = true;
                    }
                    if (value.state && value.state._text == 'SKIPPED') {
                        vm.isSkippedNode = true;
                    }
                    if (value.state && value.state._text == 'ACTIVE') {
                        vm.isActiveNode = true;
                    }
                    if (value.job.state && value.job.state._text == 'STOPPED') {
                        vm.isStoppedJob = true;
                    }
                    if (value.job.state && value.job.state._text == 'PENDING') {
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
            if ($window.localStorage.$SOS$AUDITLOG == 'true') {
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
                    if(vm.comments.comment)
                    jobs.comment = vm.comments.comment;
                    JobService.stop(jobs).then(function (res) {
                        $rootScope.$broadcast('bulkOperationCompleted', {
                            operation: 'stopJobs',
                            status: 'success'
                        });
                    });
                }, function () {

                });
            } else {
                JobService.stop(jobs).then(function (res) {
                    $rootScope.$broadcast('bulkOperationCompleted', {
                        operation: 'stopJobs',
                        status: 'success'
                    });
                });
            }
            vm.reset();
        };

        vm.unstopJobs = function () {
            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = $scope.schedulerIds.selected;

            angular.forEach(vm.selectedNodes, function (value) {
                jobs.jobs.push({job: value.job.path});
            });
            if ($window.localStorage.$SOS$AUDITLOG == 'true') {
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
                    if(vm.comments.comment)
                    jobs.comment = vm.comments.comment;
                    JobService.unstop(jobs).then(function (res) {
                        $rootScope.$broadcast('bulkOperationCompleted', {operation: 'unstopJobs', status: 'success'});
                    });
                }, function () {

                });
            } else {
                JobService.unstop(jobs).then(function (res) {
                    $rootScope.$broadcast('bulkOperationCompleted', {operation: 'unstopJobs', status: 'success'});
                });
            }
            vm.reset();
        };

        vm.skipNodes = function () {
            var nodes = {};
            nodes.nodes = [];
            nodes.jobschedulerId = $scope.schedulerIds.selected;

            angular.forEach(vm.selectedNodes, function (value) {
                nodes.nodes.push({jobChain: vm.jobChain.path, node: value.name});
            });
            if ($window.localStorage.$SOS$AUDITLOG == 'true') {
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
                    if(vm.comments.comment)
                    nodes.comment = vm.comments.comment;
                    JobService.skipNode(nodes).then(function (res) {
                        $rootScope.$broadcast('bulkOperationCompleted', {operation: 'skipNodes', status: 'success'});
                    });
                }, function () {

                });
            } else {
                JobService.skipNode(nodes).then(function (res) {
                    $rootScope.$broadcast('bulkOperationCompleted', {operation: 'skipNodes', status: 'success'});
                });
            }
            vm.reset();
        };

        vm.unskipNodes = function () {

            var nodes = {};
            nodes.nodes = [];
            nodes.jobschedulerId = $scope.schedulerIds.selected;

            angular.forEach(vm.selectedNodes, function (value) {
                nodes.nodes.push({jobChain: vm.jobChain.path, node: value.name});
            });
            if ($window.localStorage.$SOS$AUDITLOG == 'true') {
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
                    if(vm.comments.comment)
                    nodes.comment = vm.comments.comment;
                    JobService.activateNode(nodes).then(function (res) {
                        $rootScope.$broadcast('bulkOperationCompleted', {operation: 'unskipNodes', status: 'success'});
                    });
                }, function () {

                });
            } else {
                JobService.activateNode(nodes).then(function (res) {
                    $rootScope.$broadcast('bulkOperationCompleted', {operation: 'unskipNodes', status: 'success'});
                });
            }
            vm.reset();
        };

        vm.stopNodes = function () {

            var nodes = {};
            nodes.nodes = [];
            nodes.jobschedulerId = $scope.schedulerIds.selected;

            angular.forEach(vm.selectedNodes, function (value) {
                nodes.nodes.push({jobChain: vm.jobChain.path, node: value.name});
            });
            if ($window.localStorage.$SOS$AUDITLOG == 'true') {
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
                    if(vm.comments.comment)
                    nodes.comment = vm.comments.comment;
                    JobService.stopNode(nodes).then(function (res) {
                        $rootScope.$broadcast('bulkOperationCompleted', {operation: 'stopNodes', status: 'success'});
                    });
                }, function () {

                });
            } else {
                JobService.stopNode(nodes).then(function (res) {
                    $rootScope.$broadcast('bulkOperationCompleted', {operation: 'stopNodes', status: 'success'});
                });
            }
            vm.reset();
        };

        vm.unstopNodes = function () {

            var nodes = {};
            nodes.nodes = [];
            nodes.jobschedulerId = $scope.schedulerIds.selected;

            angular.forEach(vm.selectedNodes, function (value) {
                nodes.nodes.push({jobChain: vm.jobChain.path, node: value.name});
            });
            if ($window.localStorage.$SOS$AUDITLOG == 'true') {
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
                    if(vm.comments.comment)
                    nodes.comment = vm.comments.comment;
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
                    if (val.job && val.job.state && val.job.state._text == 'RUNNING' && $window.localStorage.$SOS$SHOWTASKS === 'true') {

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
        });
        loadHistory();

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

        vm.onAction = onAction;

        function onAction(path, node, action) {
            var nodes = {};
            nodes.nodes = [];
            nodes.jobschedulerId = $scope.schedulerIds.selected;
            nodes.nodes.push({jobChain: path, node: node});

            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = $scope.schedulerIds.selected;
            jobs.jobs.push({job: path});
            var modalInstance = '';
            vm.comments = {};
            vm.comments.radio = 'predefined';

            if (action == 'stop node') {
                if ($window.localStorage.$SOS$AUDITLOG == 'true') {

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
                        if(vm.comments.comment)
                        nodes.comment = vm.comments.comment;
                        return JobService.stopNode(nodes);
                    }, function () {
                    });
                } else {
                    return JobService.stopNode(nodes);
                }
            } else if (action == 'skip') {
                if ($window.localStorage.$SOS$AUDITLOG == 'true') {

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
                        if(vm.comments.comment)
                        nodes.comment = vm.comments.comment;
                        return JobService.skipNode(nodes);
                    }, function () {
                    });
                } else {
                    return JobService.skipNode(nodes);
                }
            } else if (action == 'unstop node' || action == 'unskip') {
                if ($window.localStorage.$SOS$AUDITLOG == 'true') {

                    vm.comments.name = path;
                    vm.comments.operation = action == 'unskip' ? 'Unskip Node' : 'Stop Node';
                    vm.comments.type = 'Job Chain';

                    modalInstance = $uibModal.open({
                        templateUrl: 'modules/core/template/comment-dialog.html',
                        controller: 'DialogCtrl',
                        scope: vm,
                        backdrop: 'static'
                    });
                    modalInstance.result.then(function () {
                        if(vm.comments.comment)
                        nodes.comment = vm.comments.comment;
                        return JobService.activateNode(nodes);
                    }, function () {
                    });
                } else {
                    return JobService.activateNode(nodes);
                }
            } else if (action == 'stop job') {
                if ($window.localStorage.$SOS$AUDITLOG == 'true') {

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
                        if(vm.comments.comment)
                        jobs.comment = vm.comments.comment;
                        return JobService.stop(jobs);
                    }, function () {
                    });
                } else {
                    return JobService.stop(jobs);
                }
            } else if (action == 'unstop job') {
                if ($window.localStorage.$SOS$AUDITLOG == 'true') {

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
                        if(vm.comments.comment)
                        jobs.comment = vm.comments.comment;
                        return JobService.unstop(jobs);
                    }, function () {
                    });
                } else {
                    return JobService.unstop(jobs);
                }
            }
        }


        vm.stopNode = function (data) {

            var nodes = {};
            nodes.nodes = [];
            nodes.jobschedulerId = $scope.schedulerIds.selected;
            nodes.nodes.push({jobChain: vm.jobChain.path, node: data.name});
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
                    if(vm.comments.comment)
                    nodes.comment = vm.comments.comment;
                    JobService.stopNode(nodes);
                }, function () {
                });
            } else {
                JobService.stopNode(nodes);
            }
        };

        vm.unStopNode = function (data) {

            var nodes = {};
            nodes.nodes = [];
            nodes.jobschedulerId = $scope.schedulerIds.selected;
            nodes.nodes.push({jobChain: vm.jobChain.path, node: data.name});

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
                    if(vm.comments.comment)
                    nodes.comment = vm.comments.comment;
                    JobService.activateNode(nodes);
                }, function () {

                });
            } else {
                JobService.activateNode(nodes);
            }
        };

        vm.skipNode = function (data) {
            var nodes = {};
            nodes.nodes = [];
            nodes.jobschedulerId = $scope.schedulerIds.selected;
            nodes.nodes.push({jobChain: vm.jobChain.path, node: data.name});
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
                    if(vm.comments.comment)
                    nodes.comment = vm.comments.comment;
                    JobService.skipNode(nodes);
                }, function () {

                });
            } else {
                JobService.skipNode(nodes);
            }
        };

        vm.unskipNode = function (data) {

            var nodes = {};
            nodes.nodes = [];
            nodes.jobschedulerId = $scope.schedulerIds.selected;
            nodes.nodes.push({jobChain: vm.jobChain.path, node: data.name});

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
                    if(vm.comments.comment)
                    nodes.comment = vm.comments.comment;
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
                    if(vm.comments.comment)
                    jobs.comment = vm.comments.comment;
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
                    if(vm.comments.comment)
                    jobs.comment = vm.comments.comment;
                    JobService.unstop(jobs);
                }, function () {

                });
            } else {
                JobService.unstop(jobs);
            }
        };

        vm.viewOrders = function (jobChain) {
            $location.path('/jobChainDetails/orders').search(object);
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
                    if (value.job.state && value.job.state._text == 'STOPPED') {
                        vm.isStoppedJob = true;
                    }
                    if (value.job.state && value.job.state._text == 'PENDING') {
                        vm.isPendingJob = true;
                    }
                });

            } else {
                vm.allCheck1.checkbox = false;
            }

            vm.selectedNodes = angular.copy(vm.object1.nodes);
        });

        var watcher3 = vm.$watchCollection('obj.orders', function (newNames) {
            if (newNames && newNames.length > 0) {
                vm.allCheck1.orders = newNames.length == vm.jobChain.nodes.length;
            } else {
                vm.allCheck1.orders = false;
            }
            vm.fOrders = angular.copy(vm.obj.orders);
            var timeout = $timeout(function () {
                $rootScope.$broadcast('ordersModified');
                $timeout.cancel(timeout);
            }, 10);
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

        $scope.$on('$destroy', function () {
            watcher1();
            watcher3();
            if (promise1)
                $timeout.cancel(promise1);
            if (promise2)
                $timeout.cancel(promise2);
        });

        vm.getJobChain = getJobChain;
        function getJobChain(filter) {
            filter.jobschedulerId = vm.schedulerIds.selected;
            return JobChainService.getJobChain(filter);
        }


        vm.isLoading1 = false;

        function loadHistory() {
            if (vm.jobChain) {
                var filter = {};
                filter.jobChain = vm.jobChain.path;
                filter.jobschedulerId = $scope.schedulerIds.selected;

                JobChainService.histories(filter).then(function (res) {
                    vm.orderHistory = res;
                    vm.isLoading1 = true;
                }, function () {
                    vm.isLoading1 = true;
                });
            }
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
            setHeight();
        }

        function setHeight(reset) {
            if (vm.fitToScreen) {

                if (!document.getElementById("mainContainer")) {
                    return;
                }
                var windowWidth = document.getElementById("mainContainer").clientWidth;
                var windowHeight = window.innerHeight;


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

                if (maxTop < windowHeight && maxLeft + 250 < windowWidth) {
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
            if (vm.comments.comment) {
                obj.comment = vm.comments.comment;
            }
            orders.orders.push(obj);
            OrderService.startOrder(orders);
        }

        function setOrderState(order) {

            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;

            if (vm.comments.comment) {
                orders.comment = vm.comments.comment;
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
            if (vm.comments.comment) {
                orders.comment = vm.comments.comment;
            }
            orders.orders.push({
                orderId: order.orderId,
                jobChain: order.jobChain,
                runTime: vkbeautify.xmlmin(order.runTime)
            });
            OrderService.setRunTime(orders);
        }

        function resumeOrderWithParam(order, paramObject) {
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            if (vm.comments.comment) {
                orders.comment = vm.comments.comment;
            }
            orders.orders.push({orderId: order.orderId, jobChain: order.jobChain});
            orders.params.concat(paramObject.params);
            OrderService.resumeOrder(orders);
        }

        function resumeOrderState(order) {
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            if (vm.comments.comment) {
                orders.comment = vm.comments.comment;
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
                if ($window.localStorage.$SOS$AUDITLOG == 'true') {
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
                        if(vm.comments.comment)
                        orders.comment = vm.comments.comment;
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
                orders.orders.push({orderId: order.orderId, jobChain: order.jobChain});
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
                if ($window.localStorage.$SOS$AUDITLOG == 'true') {

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
                        if(vm.comments.comment)
                        orders.comment = vm.comments.comment;
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
                if ($window.localStorage.$SOS$AUDITLOG == 'true') {

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
                        if(vm.comments.comment)
                        orders.comment = vm.comments.comment;
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
                if ($window.localStorage.$SOS$AUDITLOG == 'true') {

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
                        if(vm.comments.comment)
                        orders.comment = vm.comments.comment;
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
                if ($window.localStorage.$SOS$AUDITLOG == 'true') {

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
                        if(vm.comments.comment)
                        orders.comment = vm.comments.comment;
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
                            plannedStartTime: data.plannedStartTime,
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
                if ($window.localStorage.$SOS$AUDITLOG == 'true') {

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
                        if(vm.comments.comment)
                        orders.comment = vm.comments.comment;
                        OrderService.deleteOrder(orders);
                    }, function () {

                    });
                } else {
                    OrderService.deleteOrder(orders);
                }
            }
        };

    }

    JobChainDetailsCtrl.$inject = ["$scope", "SOSAuth", "ScheduleService", "JobChainService", "$uibModal", "OrderService", "toasty", "$rootScope", "DailyPlanService", "$location", "gettextCatalog", "CoreService", "$timeout","$window"];
    function JobChainDetailsCtrl($scope, SOSAuth, ScheduleService, JobChainService, $uibModal, OrderService, toasty, $rootScope, DailyPlanService, $location, gettextCatalog, CoreService, $timeout,$window) {
        var vm = $scope;
        vm.orderFilters = CoreService.getOrderDetailTab();
        var object = $location.search();

        vm.reset = function () {
            vm.object = {};
        };
        function volatileInfo(draw) {
            JobChainService.getJobChain({
                jobschedulerId: $scope.schedulerIds.selected,
                jobChain: vm.path
            }).then(function (res) {
                angular.forEach(vm.jobChain.nodes, function (node) {
                    if (node.orders && node.orders.length > 0) {
                        node.orders = [];
                    }
                });
                vm.jobChain = angular.merge(vm.jobChain, res.jobChain);
                SOSAuth.setJobChain(JSON.stringify(vm.jobChain));
                SOSAuth.save();
                if (draw) {
                    $rootScope.$broadcast('drawJobChainFlowDiagram');
                }
                $rootScope.$broadcast('reloadJobChain');
            }, function () {
                SOSAuth.setJobChain(JSON.stringify(vm.jobChain));
                SOSAuth.save();
                $rootScope.$broadcast('reloadJobChain');
            });
        }

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

        $rootScope.expand_to = '';
        vm.setPath = function (path) {

            $rootScope.expand_to = {
                name: path,
                path: vm.path
            };
            $location.path('/jobChains')
        };
        var t1 = '';
        $scope.$on('$stateChangeSuccess', function (event, toState, param, fromState) {
            vm.object = {};
            vm.orderFilters.isOverview = toState.url == '/overview';
            if (vm.orderFilters.isOverview && fromState.url == '/orders') {
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
            $location.path('/jobChainDetails/orders').search({path: vm.path});
        };

        vm.viewJobChainDetail = function () {
            $location.path('/jobChainDetails/overview').search({path: vm.path});
        };

        vm.sortBy = function (propertyName) {
            vm.object.orders = [];
            vm.orderFilters.reverse = !vm.orderFilters.reverse;
            vm.orderFilters.filter.sortBy = propertyName;
        };


        vm.viewCalendar = function () {
            vm.maxPlannedTime = undefined;
            vm.isCaledarLoading = true;
            vm._jobChain = vm.jobChain;
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
            if (vm.comments.comment) {
                obj.comment = vm.comments.comment;
            }
            orders.orders.push(obj);
            OrderService.addOrder(orders).then(function (res) {
                JobChainService.getJobChain({
                    jobschedulerId: vm.schedulerIds.selected,
                    jobChain: vm.jobChain.path
                }).then(function (res) {
                    vm.jobChain = angular.merge(vm.jobChain, res.jobChain);
                });

            });
            vm.object.orders = [];

        }

        vm.addOrder = function () {
            ScheduleService.getSchedulesP({
                jobschedulerId: $scope.schedulerIds.selected,
                compact: true
            }).then(function (res) {
                vm.schedules = res.schedules;
            });

            vm._jobChain = angular.copy(vm.jobChain);

            JobChainService.getJobChainP({
                jobschedulerId: vm.schedulerIds.selected,
                jobChain: vm.jobChain.path
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

        vm.stopJob = function () {
            var jobChains = {};
            jobChains.jobChains = [];
            jobChains.jobschedulerId = $scope.schedulerIds.selected;
            jobChains.jobChains.push({jobChain: vm.jobChain.path});
            if ($window.localStorage.$SOS$AUDITLOG == 'true') {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = vm.jobChain.path;
                vm.comments.operation = 'Stop';
                vm.comments.type = 'Job Chain';

                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    if(vm.comments.comment)
                    jobChains.comment = vm.comments.comment;
                    JobChainService.stop(jobChains);
                }, function () {

                });
            } else {

                JobChainService.stop(jobChains);
            }

            vm.reset();
        };
        vm.unstopJob = function () {
            var jobChains = {};
            jobChains.jobChains = [];
            jobChains.jobschedulerId = $scope.schedulerIds.selected;
            jobChains.jobChains.push({jobChain: vm.jobChain.path});
            if ($window.localStorage.$SOS$AUDITLOG == 'true') {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = vm.jobChain.path;
                vm.comments.operation = 'Unstop';
                vm.comments.type = 'Job Chain';

                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    if(vm.comments.comment)
                    jobChains.comment = vm.comments.comment;
                    JobChainService.unstop(jobChains);
                }, function () {

                });
            } else {

                JobChainService.unstop(jobChains);
            }
            vm.reset();
        };

        /** --------action ------------ **/


        vm.deleteAllOrder = function () {
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            angular.forEach(vm.object.orders, function (value) {
                orders.orders.push({orderId: value.orderId, jobChain: value.jobChain});
            });
            if ($window.localStorage.$SOS$AUDITLOG == 'true') {
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
                    if(vm.comments.comment)
                    orders.comment = vm.comments.comment;
                    OrderService.deleteOrder(orders).then(function (res) {
                        for (var i = 0; i < vm.object.orders.length; i++) {
                            vm.orders.splice(vm.object.orders[i], 1);
                        }
                        vm.reset();
                    });
                }, function () {

                });
            } else {
                OrderService.deleteOrder(orders).then(function (res) {
                    for (var i = 0; i < vm.object.orders.length; i++) {
                        vm.orders.splice(vm.object.orders[i], 1);
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
            if ($window.localStorage.$SOS$AUDITLOG == 'true') {
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
                    if(vm.comments.comment)
                    orders.comment = vm.comments.comment;
                    OrderService.suspendOrder(orders);
                }, function () {

                });
            } else {
                OrderService.suspendOrder(orders);
            }
            vm.reset();
        };

        vm.resumeAllOrder = function () {
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            angular.forEach(vm.object.orders, function (value) {
                orders.orders.push({orderId: value.orderId, jobChain: value.jobChain});
            });
            if ($window.localStorage.$SOS$AUDITLOG == 'true') {
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
                    if(vm.comments.comment)
                    orders.comment = vm.comments.comment;
                    OrderService.resumeOrder(orders);
                }, function () {

                });
            } else {
                OrderService.resumeOrder(orders);
            }
            vm.reset();
        };
        vm.resetAllOrder = function () {
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            angular.forEach(vm.object.orders, function (value) {
                orders.orders.push({orderId: value.orderId, jobChain: value.jobChain});
            });
            if ($window.localStorage.$SOS$AUDITLOG == 'true') {
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
                    if(vm.comments.comment)
                    orders.comment = vm.comments.comment;
                    OrderService.resetOrder(orders);
                }, function () {

                });
            } else {
                OrderService.resetOrder(orders);
            }
            vm.reset();
        };
        vm.startAllOrder = function () {
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            angular.forEach(vm.object.orders, function (value) {
                orders.orders.push({orderId: value.orderId, jobChain: value.jobChain, at: 'now'});
            });
            if ($window.localStorage.$SOS$AUDITLOG == 'true') {
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
                    if(vm.comments.comment)
                    orders.comment = vm.comments.comment;
                    OrderService.startOrder(orders);
                }, function () {

                });
            } else {
                OrderService.startOrder(orders);
            }
            vm.reset();
        };

        $scope.$on('event-started', function () {
            if (vm.events && vm.events[0] && vm.events[0].eventSnapshots)
                for (var i = 0; i < vm.events[0].eventSnapshots.length; i++) {
                    if (vm.events[0].eventSnapshots[i].path != undefined && (vm.events[0].eventSnapshots[i].eventType.indexOf("Order") !== -1 || vm.events[0].eventSnapshots[i].eventType.indexOf("JobChain") !== -1 || vm.events[0].eventSnapshots[i].eventType == 'JobStateChanged')) {
                        var path = [];
                        if (vm.events[0].eventSnapshots[i].path.indexOf(",") > -1) {
                            path = vm.events[0].eventSnapshots[i].path.split(",");
                        } else {
                            path[0] = vm.events[0].eventSnapshots[i].path;
                        }

                        var flag = false;
                        if (vm.events[0].eventSnapshots[i].eventType == 'JobStateChanged' && vm.jobChain.nodes && vm.jobChain.nodes.length > 0) {
                            for (var m = 0; m < vm.jobChain.nodes.length; m++) {
                                if (path[0] == vm.jobChain.nodes[m].job.path) {
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

    OrderCtrl.$inject = ["$scope", "$rootScope", "OrderService", "orderByFilter", "$uibModal", "SavedFilter", "toasty", "gettextCatalog", "CoreService", "$timeout","AuditLogService","$window"];
    function OrderCtrl($scope, $rootScope, OrderService, orderBy, $uibModal, SavedFilter, toasty, gettextCatalog, CoreService, $timeout,AuditLogService,$window) {
        var vm = $scope;

        vm.orderFilters = CoreService.getOrderTab();

        vm.tree = [];
        vm.allOrders = [];

        vm.my_tree = {};

        vm.object = {};
        vm.filter_tree = {};
        vm.filterTree1 = [];
        vm.object.paths = [];

        var selectedFiltered;

        vm.reset = function () {
            vm.object = {};
        };

        vm.savedOrderFilter = JSON.parse(SavedFilter.orderFilters) || {};
        vm.savedOrderFilter.list = vm.savedOrderFilter.list || [];
        if (vm.orderFilters.selectedView)
            vm.savedOrderFilter.selected = vm.savedOrderFilter.selected || vm.savedOrderFilter.favorite;
        else
            vm.savedOrderFilter.selected = undefined;

        if (vm.savedOrderFilter.selected) {
            angular.forEach(vm.savedOrderFilter.list, function (value) {
                if (value.name == vm.savedOrderFilter.selected) {
                    selectedFiltered = value;
                }
            });
        }

        vm.expanding_property = {
            field: "name"
        };

        vm.exportToExcel = function () {
            $rootScope.$broadcast('exportData');
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
                        previousTreeState();
                    }
                }
                vm.orderFilters.expand_to = vm.tree;
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
            if (selectedFiltered) {
                obj.regex = selectedFiltered.regex;
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
            if (selectedFiltered) {
                obj.regex = selectedFiltered.regex;
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
            if (selectedFiltered) {
                obj.regex = selectedFiltered.regex;
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

            if (selectedFiltered) {
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
                                orders = res.orders[i];
                                data1.push(orders);
                                break;
                            }
                        }
                    });
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
                vm.folderPath = data.name || '/';
            });
        }

        function volatileFolderData1(data, obj) {

            if (selectedFiltered) {
                obj = parseDate(obj);
            } else {
                if (vm.orderFilters.filter.state != 'ALL') {
                    obj.processingStates = [];
                    obj.processingStates.push(vm.orderFilters.filter.state);
                }
            }

            OrderService.get(obj).then(function (res) {

                var data1 = [];
                if (data.orders.length > 0 && data.orders.length > res.orders.length) {
                    angular.forEach(data.orders, function (orders) {

                        for (var i = 0; i < res.orders.length; i++) {
                            if (orders.path == res.orders[i].path) {
                                res.orders[i].title = angular.copy(orders.title);
                                res.orders[i].path1 = angular.copy(orders.path1);
                                orders = res.orders[i];
                                data1.push(orders);
                                break;
                            }
                        }
                    });
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
                value.expanded = true;
                value.selected1 = true;
                vm.allOrders = [];
                checkExpand(value);
            });
        }

        function previousTreeState() {
            vm.allOrders = [];
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
                    if (vm.orderFilters.filter.state != 'ALL') {
                        obj.processingStates = [];
                        obj.processingStates.push(vm.orderFilters.filter.state);
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
                OrderService.getOrdersP(obj1).then(function (result) {
                    OrderService.get(obj).then(function (res) {
                        if (result.orders && result.orders.length > 0) {
                            var x = [];
                            angular.forEach(result.orders, function (orders) {
                                for (var i = 0; i < res.orders.length; i++) {
                                    if (orders.path == res.orders[i].path) {
                                        res.orders[i].title = angular.copy(orders.title);
                                        orders = res.orders[i];
                                        x.push(orders);
                                        break;
                                    }
                                }

                            });
                            data.orders = x;
                        } else {
                            data.orders = res.orders;
                        }
                        //update list view
                        angular.forEach(data.orders, function (value) {
                            value.path1 = data.path;
                            vm.allOrders.push(value);
                        });
                        vm.loading = false;

                    }, function () {
                        vm.loading = false;
                        data.orders = result.orders;

                        angular.forEach(data.orders, function (value) {
                            value.path1 = data.path;
                            vm.allOrders.push(value);
                        });
                    });
                }, function () {
                    vm.loading = false;
                    OrderService.get(obj).then(function (res) {
                        if (res.orders) {
                            //update card view
                            if (obj.folders[0].folder == data.path) {
                                data.orders = res.orders;
                            }
                            //update list view
                            angular.forEach(data.orders, function (value) {
                                value.path1 = data.path;
                                vm.allOrders.push(value);
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
            if (selectedFiltered.type) {
                obj.types = selectedFiltered.type;
            }
            if (selectedFiltered.processingState) {
                obj.processingState = selectedFiltered.processingState;
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
                                order = res.orders[i];
                                data.push(order);
                                break;
                            }
                        }
                    });
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

        vm.changeStatus = function () {
            vm.allOrders = [];
            vm.loading = true;
            angular.forEach(vm.tree, function (value) {
                if (value.expanded || value.selected1)
                    checkExpandTreeForUpdates(value);
            });
        };
        vm.load = function () {
            initTree();
        };

        vm.showLogFuc = function (value) {
            var orders = {};
            vm.isAuditLog =false;

            orders.orders = [];
            orders.orders.push({orderId: value.orderId, jobChain: value.jobChain});
            orders.jobschedulerId = $scope.schedulerIds.selected;

            OrderService.histories(orders).then(function (res) {
                vm.historys = res.history;
            });

            vm.showLogPanel = value;
            vm.orderFilters.showLogPanel = vm.showLogPanel;
        };


        function loadAuditLogs(obj) {
            obj.limit = parseInt($window.localStorage.$SOS$MAXAUDITLOGPEROBJECT);
            AuditLogService.getLogs(obj).then(function (result) {
                if (result && result.auditLog) {
                    vm.auditLogs = result.auditLog;
                }
            });
        }

        vm.showAuditLogs = function (value) {
             vm.showLogPanel = value;
            vm.orderFilters.showLogPanel = vm.showLogPanel;
            vm.isAuditLog =true;
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.orders = [];
            obj.orders.push({jobChain: value.jobChain,orderId:value.orderId});
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

        vm.applyFilter = function () {
            vm.orderFilter = {};
            vm.isUnique = true;

            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/order-filter-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                size: 'lg',
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                if (vm.orderFilter.radio == 'current') {
                    vm.orderFilter.fromDate = undefined;
                    vm.orderFilter.fromTime = undefined;
                    vm.orderFilter.toDate = undefined;
                    vm.orderFilter.toTime = undefined;
                    vm.orderFilter.planned = undefined;
                } else if (vm.orderFilter.radio == 'planned') {
                    vm.orderFilter.processingState = undefined;
                }

                vm.savedOrderFilter.list.push(vm.orderFilter);

                if (vm.savedOrderFilter.list.length == 1) {

                    vm.savedOrderFilter.selected = vm.orderFilter.name;
                    vm.orderFilters.selectedView = true;
                    selectedFiltered = vm.orderFilter;
                    vm.load();
                }
                SavedFilter.setOrder(vm.savedOrderFilter);
                SavedFilter.save();

            }, function () {

            });
        };

        vm.editFilters = function () {
            vm.filters = vm.savedOrderFilter;
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/edit-filter-dialog.html',
                controller: 'DialogCtrl',
                scope: vm
            });
        };

        vm.editFilter = function (filter) {
            vm.filterName = filter.name;
            vm.orderFilter = angular.copy(filter);
            vm.paths = vm.orderFilter.paths;
            vm.object.paths = vm.paths;
            vm.isUnique = true;

            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/edit-order-filter-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                size: 'lg',
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                angular.forEach(vm.savedOrderFilter.list, function (value, index) {
                    if (value.name == filter.name) {
                        vm.savedOrderFilter.list[index] = vm.orderFilter;
                    }
                });
                if (vm.savedOrderFilter.selected == vm.filterName) {
                    vm.savedOrderFilter.selected = vm.orderFilter.name;
                    selectedFiltered = vm.orderFilter;
                    vm.orderFilters.selectedView = true;
                    vm.load();
                }
                if (vm.savedOrderFilter.favorite == vm.filterName) {
                    vm.savedOrderFilter.favorite = vm.orderFilter.name;
                }
                SavedFilter.setOrder(vm.savedOrderFilter);
                SavedFilter.save();
                vm.filterName = undefined;
            }, function () {
                vm.filterName = undefined;
            });
        };

        vm.deleteFilter = function (name) {
            angular.forEach(vm.savedOrderFilter.list, function (value, index) {
                if (value.name == name) {
                    toasty.success({
                        title: value.name + ' ' + gettextCatalog.getString('message.filterDeleteSuccessfully'),
                        msg: ''
                    });
                    vm.savedOrderFilter.list.splice(index, 1);
                }
            });
            if (vm.savedOrderFilter.list.length == 0) {
                vm.savedOrderFilter.selected = undefined;
                vm.orderFilters.selectedView = false;
                selectedFiltered = undefined;
            }
            if (vm.savedOrderFilter.selected == name) {
                vm.savedOrderFilter.selected = undefined;
                vm.orderFilters.selectedView = false;
                selectedFiltered = undefined;
                vm.load();
            }
            SavedFilter.setOrder(vm.savedOrderFilter);
            SavedFilter.save();

        };

        vm.favorite = function (filter) {
            vm.savedOrderFilter.favorite = filter.name;
            vm.orderFilters.selectedView = true;
            SavedFilter.setOrder(vm.savedOrderFilter);
            SavedFilter.save();
            vm.load();
        };

        vm.removeFavorite = function () {
            vm.savedOrderFilter.favorite = '';
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

        vm.addJobChainPaths = function () {
            vm.orderFilter.paths = vm.paths;
        };
        vm.remove = function (object) {
            vm.orderFilter.paths.splice(object, 1);
        };


        vm.checkFilterName = function () {
            vm.isUnique = true;

            angular.forEach(vm.savedOrderFilter.list, function (value) {
                if (!vm.filterName) {
                    if (vm.orderFilter.name == value.name) {
                        vm.isUnique = false;
                    }
                } else {
                    if (value.name != vm.filterName) {
                        if (vm.orderFilter.name == value.name) {
                            vm.isUnique = false;
                        }
                    }
                }
            });
        };

        vm.changeFilter = function (filter) {
            if (filter) {
                vm.savedOrderFilter.selected = filter.name;
                vm.orderFilters.selectedView = true;
            }

            else {
                vm.savedOrderFilter.selected = filter;
                vm.orderFilters.selectedView = false;
            }
            selectedFiltered = filter;
            SavedFilter.setOrder(vm.savedOrderFilter);
            SavedFilter.save();
            vm.load();

        };

        /** --------action ------------ **/


        vm.deleteAllOrder = function () {
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            angular.forEach(vm.object.orders, function (value) {
                orders.orders.push({orderId: value.orderId, jobChain: value.jobChain});
            });
            if ($window.localStorage.$SOS$AUDITLOG == 'true') {
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
                    if(vm.comments.comment)
                    orders.comment = vm.comments.comment;
                    OrderService.deleteOrder(orders).then(function (res) {
                        for (var i = 0; i < vm.object.orders.length; i++) {
                            vm.allOrders.splice(vm.object.orders[i], 1);
                        }
                        vm.reset();
                    });
                }, function () {

                });
            } else {
                OrderService.deleteOrder(orders).then(function (res) {
                    for (var i = 0; i < vm.object.orders.length; i++) {
                        vm.allOrders.splice(vm.object.orders[i], 1);
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
            if ($window.localStorage.$SOS$AUDITLOG == 'true') {
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
                    if(vm.comments.comment)
                    orders.comment = vm.comments.comment;
                    OrderService.suspendOrder(orders);
                }, function () {

                });
            } else {
                OrderService.suspendOrder(orders);
            }
            vm.reset();
        };

        vm.resumeAllOrder = function () {
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            angular.forEach(vm.object.orders, function (value) {
                orders.orders.push({orderId: value.orderId, jobChain: value.jobChain});
            });
            if ($window.localStorage.$SOS$AUDITLOG == 'true') {
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
                    if(vm.comments.comment)
                    orders.comment = vm.comments.comment;
                    OrderService.resumeOrder(orders);
                }, function () {

                });
            } else {
                OrderService.resumeOrder(orders);
            }
            vm.reset();
        };
        vm.resetAllOrder = function () {
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            angular.forEach(vm.object.orders, function (value) {
                orders.orders.push({orderId: value.orderId, jobChain: value.jobChain});
            });
            if ($window.localStorage.$SOS$AUDITLOG == 'true') {
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
                    if(vm.comments.comment)
                    orders.comment = vm.comments.comment;
                    OrderService.resetOrder(orders);
                }, function () {

                });
            } else {
                OrderService.resetOrder(orders);
            }
            vm.reset();
        };
        vm.startAllOrder = function () {
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            angular.forEach(vm.object.orders, function (value) {
                orders.orders.push({orderId: value.orderId, jobChain: value.jobChain, at: 'now'});
            });
            if ($window.localStorage.$SOS$AUDITLOG == 'true') {
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
                    if(vm.comments.comment)
                    orders.comment = vm.comments.comment;
                    OrderService.startOrder(orders);
                }, function () {

                });
            } else {
                OrderService.startOrder(orders);
            }
            vm.reset();
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

        var t1 = '';
        $scope.$on('event-started', function () {
            if (vm.events && vm.events[0] && vm.events[0].eventSnapshots)
                angular.forEach(vm.events[0].eventSnapshots, function (value1) {
                    if (value1.path != undefined && value1.eventType.indexOf("Order") !== -1) {

                        if (vm.orderFilters.filter.state == 'ALL') {
                            angular.forEach(vm.allOrders, function (value2, index) {

                                if (value2.path == value1.path) {

                                    var obj = {};
                                    obj.jobschedulerId = $scope.schedulerIds.selected;
                                    obj.orderId = value2.orderId;
                                    obj.jobChain = value2.jobChain;
                                    obj.compact = true;
                                    OrderService.getOrder(obj).then(function (res) {
                                        if (res.order) {
                                            res.order.title = angular.copy(vm.allOrders[index].title);
                                            res.order.path1 = angular.copy(vm.allOrders[index].path1);
                                            res.order.params = angular.copy(vm.allOrders[index].params);
                                            vm.allOrders[index] = res.order;
                                        }
                                    });
                                }
                            });
                        } else {
                            navFullTreeForUpdateOrder(value1.path.substring(0, value1.path.lastIndexOf('/')));
                        }
                    }
                    if (value1.eventType.indexOf("FileBased") !== -1 && value1.objectType == "ORDER") {
                        if (t1) {
                            $timeout.cancel(t1);
                        }
                        t1 = $timeout(function () {

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

                            $timeout.cancel(t1);
                        }, 5000);

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

        $scope.$on('$destroy', function () {
            watcher1();
            if (t1) {
                $timeout.cancel(t1);
            }
        });

    }

    OrderOverviewCtrl.$inject = ["$scope", "$rootScope", "OrderService", "$stateParams", "CoreService", "$uibModal", "$window","AuditLogService"];
    function OrderOverviewCtrl($scope, $rootScope, OrderService, $stateParams, CoreService, $uibModal, $window,AuditLogService) {
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
            vm.isAuditLog =false;
            orders.orders = [];
            orders.orders.push({orderId: value.orderId, jobChain: value.jobChain});
            orders.jobschedulerId = $scope.schedulerIds.selected;

            OrderService.histories(orders).then(function (res) {
                vm.historys = res.history;
            });

            vm.showLogPanel = value;
            vm.orderFilters.showLogPanel = vm.showLogPanel;
        };

        function loadAuditLogs(obj) {
            obj.limit = parseInt($window.localStorage.$SOS$MAXAUDITLOGPEROBJECT);
            AuditLogService.getLogs(obj).then(function (result) {
                if (result && result.auditLog) {
                    vm.auditLogs = result.auditLog;
                }
            });
        }

        vm.showAuditLogs = function (value) {
             vm.showLogPanel = value;
            vm.orderFilters.showLogPanel = vm.showLogPanel;
            vm.isAuditLog =true;
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.orders = [];
            obj.orders.push({jobChain: value.jobChain,orderId:value.orderId});
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
            if ($window.localStorage.$SOS$AUDITLOG == 'true') {
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
                    if(vm.comments.comment)
                    orders.comment = vm.comments.comment;
                    OrderService.deleteOrder(orders).then(function (res) {
                        for (var i = 0; i < vm.object.orders.length; i++) {
                            vm.allOrders.splice(vm.object.orders[i], 1);
                        }
                        vm.reset();
                    });
                }, function () {

                });
            } else {
                OrderService.deleteOrder(orders).then(function (res) {
                    for (var i = 0; i < vm.object.orders.length; i++) {
                        vm.allOrders.splice(vm.object.orders[i], 1);
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
            if ($window.localStorage.$SOS$AUDITLOG == 'true') {
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
                    if(vm.comments.comment)
                    orders.comment = vm.comments.comment;
                    OrderService.suspendOrder(orders);
                }, function () {

                });
            } else {
                OrderService.suspendOrder(orders);
            }
            vm.reset();
        };

        vm.resumeAllOrder = function () {
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            angular.forEach(vm.object.orders, function (value) {
                orders.orders.push({orderId: value.orderId, jobChain: value.jobChain});
            });
            if ($window.localStorage.$SOS$AUDITLOG == 'true') {
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
                    if(vm.comments.comment)
                    orders.comment = vm.comments.comment;
                    OrderService.resumeOrder(orders);
                }, function () {

                });
            } else {
                OrderService.resumeOrder(orders);
            }
            vm.reset();
        };
        vm.resetAllOrder = function () {
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            angular.forEach(vm.object.orders, function (value) {
                orders.orders.push({orderId: value.orderId, jobChain: value.jobChain});
            });
            if ($window.localStorage.$SOS$AUDITLOG == 'true') {
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
                    if(vm.comments.comment)
                    orders.comment = vm.comments.comment;
                    OrderService.resetOrder(orders);
                }, function () {

                });
            } else {
                OrderService.resetOrder(orders);
            }
            vm.reset();
        };
        vm.startAllOrder = function () {
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            angular.forEach(vm.object.orders, function (value) {
                orders.orders.push({orderId: value.orderId, jobChain: value.jobChain, at: 'now'});
            });
            if ($window.localStorage.$SOS$AUDITLOG == 'true') {
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
                    if(vm.comments.comment)
                    orders.comment = vm.comments.comment;
                    OrderService.startOrder(orders);
                }, function () {

                });
            } else {
                OrderService.startOrder(orders);
            }
            vm.reset();
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
                    if (vm.events[0].eventSnapshots[i].path != undefined && vm.events[0].eventSnapshots[i].eventType.indexOf("Order") !== -1 && waitForResponse) {
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


    OrderFunctionCtrl.$inject = ["$scope", "$rootScope", "OrderService", "$uibModal", "ScheduleService", '$timeout', "DailyPlanService", "JobChainService", "$window", "$location"];
    function OrderFunctionCtrl($scope, $rootScope, OrderService, $uibModal, ScheduleService, $timeout, DailyPlanService, JobChainService, $window, $location) {
        var vm = $scope;
        vm.maxEntryPerPage = $window.localStorage.$SOS$MAXENTRYPERPAGE;

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
                        if (value._type != 'AD_HOC') {
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
            if (vm.comments.comment) {
                obj.comment = vm.comments.comment;
            }
            OrderService.startOrder(orders).then(function (res) {
                var obj = {};
                obj.orders = [];

                obj.jobschedulerId = vm.schedulerIds.selected;
                obj.orders.push({orderId: order.orderId, jobChain: order.jobChain});
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
            orders.orders.push({orderId: order.orderId, jobChain: order.jobChain});
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
            if ($window.localStorage.$SOS$AUDITLOG == 'true') {
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
                    if(vm.comments.comment)
                    orders.comment = vm.comments.comment;
                    OrderService.startOrder(orders);
                }, function () {

                });
            } else {
                OrderService.startOrder(orders);
            }
            vm.reset();
        };

        function setOrderState(order) {

            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;

            if (vm.comments.comment) {
                orders.comment = vm.comments.comment;

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
            if (vm.comments.comment) {
                orders.comment = vm.comments.comment;
            }
            orders.orders.push({
                orderId: order.orderId,
                jobChain: order.jobChain,
                runTime: vkbeautify.xmlmin(order.runTime)
            });


            OrderService.setRunTime(orders);
            vm.reset();
        }

        vm.setRunTime = function (order) {
            vm.comments = {};
            vm.comments.radio = 'predefined';
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
            if ($window.localStorage.$SOS$AUDITLOG == 'true') {
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
                    if(vm.comments.comment)
                    orders.comment = vm.comments.comment;
                    OrderService.suspendOrder(orders);
                }, function () {

                });
            } else {
                OrderService.suspendOrder(orders);
            }
            vm.reset();
        };

        vm.resumeOrder = function (order) {
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            orders.orders.push({orderId: order.orderId, jobChain: order.jobChain});
            if ($window.localStorage.$SOS$AUDITLOG == 'true') {
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
                    if(vm.comments.comment)
                    orders.comment = vm.comments.comment;
                    OrderService.resumeOrder(orders);
                }, function () {

                });
            } else {
                OrderService.resumeOrder(orders);
            }
            vm.reset();
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
            if (vm.comments.comment) {
                orders.comment = vm.comments.comment;
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
            if (vm.comments.comment) {
                orders.comment = vm.comments.comment;
            }
            orders.orders.push({orderId: order.orderId, jobChain: order.jobChain});


            orders.params.concat(paramObject.params);
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
            if ($window.localStorage.$SOS$AUDITLOG == 'true') {
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
                    if(vm.comments.comment)
                    orders.comment = vm.comments.comment;
                    OrderService.resetOrder(orders);
                }, function () {

                });
            } else {
                OrderService.resetOrder(orders);
            }
            vm.reset();
        };

        vm.removeOrder = function (order) {
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            orders.orders.push({orderId: order.orderId, jobChain: order.jobChain});
            if ($window.localStorage.$SOS$AUDITLOG == 'true') {
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
                    if(vm.comments.comment)
                    orders.comment = vm.comments.comment;
                    OrderService.removeOrder(orders);
                }, function () {

                });
            } else {

                OrderService.removeOrder(orders);
            }
            vm.reset();
        };

        vm.deleteOrder = function (order) {
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            orders.orders.push({orderId: order.orderId, jobChain: order.jobChain});
            if ($window.localStorage.$SOS$AUDITLOG == 'true') {
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
                    if(vm.comments.comment)
                    orders.comment = vm.comments.comment;
                    OrderService.deleteOrder(orders).then(function (res) {
                        if (vm.allOrders && vm.allOrders.length > 0) {
                            angular.forEach(vm.allOrders, function (value) {

                                if (value.path == order.path) {
                                    vm.allOrders.splice(index, 1);
                                }
                            });
                        } else if (vm.orders && vm.orders.length > 0) {
                            angular.forEach(vm.orders, function (value, index) {

                                if (value.path == order.path) {
                                    vm.orders.splice(index, 1);
                                }
                            });
                        }
                    });
                }, function () {

                });
            } else {
                OrderService.deleteOrder(orders).then(function (res) {
                    if (vm.allOrders && vm.allOrders.length > 0) {
                        angular.forEach(vm.allOrders, function (value) {

                            if (value.path == order.path) {
                                vm.allOrders.splice(index, 1);
                            }
                        });
                    } else if (vm.orders && vm.orders.length > 0) {
                        angular.forEach(vm.orders, function (value, index) {

                            if (value.path == order.path) {
                                vm.orders.splice(index, 1);
                            }
                        });
                    }
                });
            }

            vm.reset();
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


        vm.showPanel = '';
        vm.showPanelFuc = function (order) {
            vm.showPanel = order.path;
            var orders = {};
            orders.orders = [];

            orders.jobschedulerId = $scope.schedulerIds.selected;
            orders.orders.push({orderId: order.orderId, jobChain: order.jobChain});
            OrderService.get(orders).then(function (res) {
                order = angular.merge(order, res.orders[0]);
            });
            vm.hidePanel = true;
        };

        vm.hidePanelFuc = function () {
            vm.showPanel = '';
            vm.hidePanel = !vm.hidePanel;
        };


        vm.limitNum = $window.localStorage.$SOS$MAXORDERPERJOBCHAIN;
        vm.showOrderPanel = '';
        vm.showOrderPanelFuc = function (path) {
            $location.path('/jobChainDetails/orders').search({path: path});
        };

        $scope.$on('event-started', function () {
            if (vm.events && vm.events[0] && vm.events[0].eventSnapshots && vm.showLogPanel)
                for (var i = 0; i < vm.events[0].eventSnapshots.length; i++) {
                    if (vm.events[0].eventSnapshots[i].path != undefined && vm.events[0].eventSnapshots[i].eventType.indexOf("Order") !== -1) {
                        var path = vm.events[0].eventSnapshots[i].path;
                        if (vm.showLogPanel.path == path) {
                            var orders = {};
                            orders = {};
                            orders.orders = [];
                            orders.orders.push({orderId: vm.showLogPanel.orderId, jobChain: vm.showLogPanel.jobChain});
                            orders.jobschedulerId = $scope.schedulerIds.selected;
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

    HistoryCtrl.$inject = ["$scope", "OrderService", "TaskService", "$uibModal", "SavedFilter", "toasty", "$timeout", "gettextCatalog",
        "JobService", "orderByFilter", "CoreService", "$window"];
    function HistoryCtrl($scope, OrderService, TaskService, $uibModal, SavedFilter, toasty, $timeout, gettextCatalog,
                         JobService, orderBy, CoreService, $window) {
        var vm = $scope;
        vm.maxEntryPerPage = $window.localStorage.$SOS$MAXENTRYPERPAGE;

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

        var selectedFiltered1, selectedFiltered2;

        vm.jobChainSearch = {};
        vm.jobSearch = {};
        var jobChainSearch = false;
        var jobSearch = false;

        var promise1;

        vm.historyFilterObj = JSON.parse(SavedFilter.historyFilters) || {};

        vm.savedHistoryFilter = vm.historyFilterObj.order || {};
        vm.savedHistoryFilter.list = vm.savedHistoryFilter.list || [];

        if (vm.historyFilters.order.selectedView)
            vm.savedHistoryFilter.selected = vm.savedHistoryFilter.selected || vm.savedHistoryFilter.favorite;
        else
            vm.savedHistoryFilter.selected = undefined;

        vm.savedJobHistoryFilter = vm.historyFilterObj.job || {};
        vm.savedJobHistoryFilter.list = vm.savedJobHistoryFilter.list || [];

        if (vm.historyFilters.task.selectedView)
            vm.savedJobHistoryFilter.selected = vm.savedJobHistoryFilter.selected || vm.savedJobHistoryFilter.favorite;
        else
            vm.savedJobHistoryFilter.selected = undefined;

        vm.savedIgnoreList = JSON.parse(SavedFilter.ignoreList) || {};
        vm.savedIgnoreList.orders = vm.savedIgnoreList.orders || [];
        vm.savedIgnoreList.jobChains = vm.savedIgnoreList.jobChains || [];
        vm.savedIgnoreList.jobs = vm.savedIgnoreList.jobs || [];
        vm.savedIgnoreList.isEnable = vm.savedIgnoreList.isEnable || false;

        if (vm.savedHistoryFilter.selected) {
            angular.forEach(vm.savedHistoryFilter.list, function (value) {
                if (value.name == vm.savedHistoryFilter.selected) {
                    selectedFiltered1 = value;
                }
            });
        }

        if (vm.savedJobHistoryFilter.selected) {
            angular.forEach(vm.savedJobHistoryFilter.list, function (value) {
                if (value.name == vm.savedJobHistoryFilter.selected) {
                    selectedFiltered2 = value;
                }
            });
        }

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
            if ((vm.savedIgnoreList.isEnable == true || vm.savedIgnoreList.isEnable == 'true') && vm.savedIgnoreList.jobs.length > 0) {

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
            if ((vm.savedIgnoreList.isEnable == true || vm.savedIgnoreList.isEnable == 'true') && (vm.savedIgnoreList.jobChains.length > 0 || vm.savedIgnoreList.orders.length > 0)) {
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
                if (vm.jobHistorys && vm.jobHistorys.length > 0) {
                    return;
                }
                filter = {jobschedulerId: $scope.schedulerIds.selected};
            }
            vm.isLoading = false;

            if (selectedFiltered2) {
                filter = jobParseDate(filter);
            } else {
                filter = setTaskDateRange(filter);
                if (vm.task.filter.historyStates != 'all') {
                    filter.historyStates = [];
                    filter.historyStates.push(vm.task.filter.historyStates);
                }
            }
            filter.limit = parseInt($window.localStorage.$SOS$MAXRECORDS);
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
            if (!filter) {
                if (vm.historys && vm.historys.length > 0) {
                    return;
                }
                filter = {jobschedulerId: $scope.schedulerIds.selected};
            }
            vm.isLoading = false;
            if (selectedFiltered1) {
                filter = orderParseDate(filter);
            } else {
                filter = setOrderDateRange(filter);
                if (vm.order.filter.historyStates != 'all') {
                    filter.historyStates = [];
                    filter.historyStates.push(vm.order.filter.historyStates);
                }
            }
            filter.limit = parseInt($window.localStorage.$SOS$MAXRECORDS);
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
            isLoaded = false;
            if (vm.historyFilters.type == 'job') {
                jobHistory(filter);
            } else {
                orderHistory(filter);
            }
        };

        vm.search = function (flag) {
            if (!flag)
                vm.loading = true;
            var filter = {
                jobschedulerId: $scope.schedulerIds.selected,
                limit: parseInt($window.localStorage.$SOS$MAXRECORDS)
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
                if ((vm.savedIgnoreList.isEnable == true || vm.savedIgnoreList.isEnable == 'true') && vm.savedIgnoreList.jobs.length > 0) {

                    filter.excludeJobs = [];
                    angular.forEach(vm.savedIgnoreList.jobs, function (job) {
                        filter.excludeJobs.push({job: job});
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
                        var orderIds = vm.jobChainSearch.orderIds.split(',');
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
                if ((vm.savedIgnoreList.isEnable == true || vm.savedIgnoreList.isEnable == 'true') && (vm.savedIgnoreList.jobChains.length > 0 || vm.savedIgnoreList.orders.length > 0)) {

                    filter.excludeOrders = [];
                    angular.forEach(vm.savedIgnoreList.jobChains, function (jobChain) {
                        filter.excludeOrders.push({jobChain: jobChain});
                    });

                    angular.forEach(vm.savedIgnoreList.orders, function (order) {
                        filter.excludeOrders.push(order);
                    });

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

        vm.cancel = function () {
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
        };


        function orderParseDate(obj) {

            if ((vm.savedIgnoreList.isEnable == true || vm.savedIgnoreList.isEnable == 'true') && (vm.savedIgnoreList.jobChains.length > 0 || vm.savedIgnoreList.orders.length > 0)) {
                obj.excludeOrders = [];
                angular.forEach(vm.savedIgnoreList.jobChains, function (jobChain) {
                    obj.excludeOrders.push({jobChain: jobChain});
                });

                angular.forEach(vm.savedIgnoreList.orders, function (order) {
                    obj.excludeOrders.push(order);
                });
            }

            if (selectedFiltered1.regex) {
                obj.regex = selectedFiltered1.regex;
            }
            if (selectedFiltered1.paths && selectedFiltered1.paths.length > 0) {
                obj.folders = [];
                angular.forEach(selectedFiltered1.paths, function (value) {
                    obj.folders.push({folder: value, recursive: true});
                })
            }
            if ((selectedFiltered1.jobChains && selectedFiltered1.jobChains.length > 0) || (selectedFiltered1.orders && selectedFiltered1.orders.length > 0)) {
                obj.orders = [];

                angular.forEach(selectedFiltered1.orders, function (value) {
                    obj.orders.push({jobChain: value.jobChain, orderId: value.orderId});
                });
                if (!selectedFiltered1.orders || selectedFiltered1.orders.length == 0) {
                    angular.forEach(selectedFiltered1.jobChains, function (value) {
                        obj.orders.push({jobChain: value});
                    });
                } else {
                    for (var i = 0; i < selectedFiltered1.jobChains.length; i++) {
                        for (var j = 0; j < obj.orders.length; j++) {
                            var flag = true;
                            if (obj.orders[j].jobChain == selectedFiltered1.jobChains[i]) {
                                flag = false;
                                break;
                            }
                        }
                        if (flag) {
                            obj.orders.push({jobChain: selectedFiltered1.jobChains[i]});
                        }
                    }
                }

            }
            if (selectedFiltered1.state && selectedFiltered1.state.length > 0) {
                obj.historyStates = selectedFiltered1.state;
            }

            var fromDate;
            var toDate;
            if (selectedFiltered1.planned) {
                if (/^\s*(-)\s*(\d+)(h\s*)\s*$/i.test(selectedFiltered1.planned)) {
                    fromDate = new Date();
                    toDate = new Date();
                    var hours = (/^\s*(-)\s*(\d+)(h\s*)\s*$/i.exec(selectedFiltered1.planned)[2]);
                    fromDate.setHours(toDate.getHours() - hours);
                }
                else if (/^\s*(-)\s*(\d+)(d\s*)\s*$/i.test(selectedFiltered1.planned)) {
                    fromDate = new Date();
                    toDate = new Date();
                    var days = (/^\s*(-)\s*(\d+)(d\s*)\s*$/i.exec(selectedFiltered1.planned)[2]);
                    fromDate.setDate(toDate.getDate() - days);
                } else if (/^\s*(now\s*\-)\s*(\d+)\s*$/i.test(selectedFiltered1.planned)) {
                    fromDate = new Date();
                    toDate = new Date();
                    var seconds = parseInt(/^\s*(now\s*\-)\s*(\d+)\s*$/i.exec(selectedFiltered1.planned)[2]);
                    fromDate.setSeconds(toDate.getSeconds() - seconds);
                } else if (/^\s*(Today)\s*$/i.test(selectedFiltered1.planned)) {
                    fromDate = new Date();
                    fromDate.setHours(0);
                    fromDate.setMinutes(0);
                    toDate = new Date();
                    toDate.setHours(23);
                    toDate.setMinutes(59);
                } else if (/^\s*(now)\s*$/i.test(selectedFiltered1.planned)) {
                    fromDate = new Date();
                    toDate = new Date();
                } else if (/^\s*(\d+):(\d+)\s*(am|pm)\s*to\s*(\d+):(\d+)\s*(am|pm)\s*$/i.test(selectedFiltered1.planned)) {
                    var time = /^\s*(\d+):(\d+)\s*(am|pm)\s*to\s*(\d+):(\d+)\s*(am|pm)\s*$/i.exec(selectedFiltered1.planned);
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
            if ((vm.savedIgnoreList.isEnable == true || vm.savedIgnoreList.isEnable == 'true') && vm.savedIgnoreList.jobs.length > 0) {

                obj.excludeJobs = [];
                angular.forEach(vm.savedIgnoreList.jobs, function (job) {
                    obj.excludeJobs.push({job: job});
                });
            }

            if (selectedFiltered2.regex) {
                obj.regex = selectedFiltered2.regex;
            }
            if (selectedFiltered2.state && selectedFiltered2.state.length > 0) {
                obj.historyStates = selectedFiltered2.state;
            }
            if (selectedFiltered2.paths && selectedFiltered2.paths.length > 0) {
                obj.folders = [];
                angular.forEach(selectedFiltered2.paths, function (value) {
                    obj.folders.push({folder: value, recursive: true});
                })
            }
            if (selectedFiltered2.jobs && selectedFiltered2.jobs.length > 0) {
                obj.jobs = [];

                angular.forEach(selectedFiltered2.jobs, function (value) {
                    obj.jobs.push({job: value});
                });

            }
            var fromDate;
            var toDate;
            if (selectedFiltered2.planned) {
                if (/^\s*(-)\s*(\d+)(h\s*)\s*$/i.test(selectedFiltered2.planned)) {
                    fromDate = new Date();
                    toDate = new Date();
                    var hours = (/^\s*(-)\s*(\d+)(h\s*)\s*$/i.exec(selectedFiltered2.planned)[2]);
                    fromDate.setHours(toDate.getHours() - hours);
                }
                else if (/^\s*(-)\s*(\d+)(d\s*)\s*$/i.test(selectedFiltered2.planned)) {
                    fromDate = new Date();
                    toDate = new Date();
                    var days = (/^\s*(-)\s*(\d+)(d\s*)\s*$/i.exec(selectedFiltered2.planned)[2]);
                    fromDate.setDate(toDate.getDate() - days);
                } else if (/^\s*(now\s*\-)\s*(\d+)\s*$/i.test(selectedFiltered2.planned)) {
                    fromDate = new Date();
                    toDate = new Date();
                    var seconds = parseInt(/^\s*(now\s*\-)\s*(\d+)\s*$/i.exec(selectedFiltered2.planned)[2]);
                    fromDate.setSeconds(toDate.getSeconds() - seconds);
                } else if (/^\s*(Today)\s*$/i.test(selectedFiltered2.planned)) {
                    fromDate = new Date();

                    fromDate.setHours(0);
                    fromDate.setMinutes(0);
                    toDate = new Date();
                    toDate.setHours(23);
                    toDate.setMinutes(59);
                } else if (/^\s*(now)\s*$/i.test(selectedFiltered2.planned)) {
                    fromDate = new Date();
                    toDate = new Date();
                } else if (/^\s*(\d+):(\d+)\s*(am|pm)\s*to\s*(\d+):(\d+)\s*(am|pm)\s*$/i.test(selectedFiltered2.planned)) {
                    var time = /^\s*(\d+):(\d+)\s*(am|pm)\s*to\s*(\d+):(\d+)\s*(am|pm)\s*$/i.exec(selectedFiltered2.planned);
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

        vm.init({jobschedulerId: $scope.schedulerIds.selected});


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


        vm.showPanel = '';
        vm.showPanelFuc = function (value) {
            vm.showPanel = value;
            var orders = {};
            orders.jobschedulerId = $scope.schedulerIds.selected;
            orders.jobChain = value.jobChain;
            orders.orderId = value.orderId;
            orders.historyId = value.historyId;
            OrderService.history(orders).then(function (res) {
                vm.steps = res.history.steps;
            });
            vm.hidePanel = true;
        };
        vm.hidePanelFuc = function () {
            vm.showPanel = '';
            vm.hidePanel = !vm.hidePanel;
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


        /**--------------- Filter -----------------------------*/
        vm.advanceFilter = function () {
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
                if (vm.historyFilters.type == 'jobChain') {
                    vm.savedHistoryFilter.list.push(vm.historyFilter);
                    if (vm.savedHistoryFilter.list.length == 1) {
                        vm.savedHistoryFilter.selected = vm.historyFilter.name;
                        vm.historyFilters.order.selectedView = true;
                        selectedFiltered1 = vm.historyFilter;
                        vm.init({jobschedulerId: $scope.schedulerIds.selected});
                    }
                    vm.historyFilterObj.order = vm.savedHistoryFilter;
                } else {
                    vm.savedJobHistoryFilter.list.push(vm.historyFilter);
                    if (vm.savedJobHistoryFilter.list.length == 1) {
                        vm.savedJobHistoryFilter.selected = vm.historyFilter.name;
                        vm.historyFilters.task.selectedView = true;
                        selectedFiltered2 = vm.historyFilter;
                        vm.init({jobschedulerId: $scope.schedulerIds.selected});
                    }
                    vm.historyFilterObj.job = vm.savedJobHistoryFilter;
                }
                SavedFilter.setHistory(vm.historyFilterObj);
                SavedFilter.save();
            }, function () {

            });
        };

        vm.editFilters = function () {
            if (vm.historyFilters.type == 'jobChain') {
                vm.filters = vm.savedHistoryFilter;
            } else {
                vm.filters = vm.savedJobHistoryFilter;
            }
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/edit-filter-dialog.html',
                controller: 'DialogCtrl',
                scope: vm
            });

        };

        vm.editFilter = function (filter) {
            vm.filterName = filter.name;
            vm.historyFilter = angular.copy(filter);
            vm.paths = vm.historyFilter.paths;
            vm.orders = vm.historyFilter.orders;
            vm.jobChains = vm.historyFilter.jobChains;
            vm.jobs = vm.historyFilter.jobs;
            vm.object.paths = vm.paths;
            vm.object.orders = vm.orders;
            vm.object.jobChains = vm.jobChains;
            vm.object.jobs = vm.jobs;
            vm.isUnique = true;

            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/edit-history-filter-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                size: 'lg',
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                if (vm.historyFilters.type == 'jobChain') {
                    angular.forEach(vm.savedHistoryFilter.list, function (value, index) {
                        if (value.name == filter.name) {
                            vm.savedHistoryFilter.list[index] = vm.historyFilter;
                        }
                    });
                    if (vm.savedHistoryFilter.selected == vm.filterName) {
                        vm.savedHistoryFilter.selected = vm.historyFilter.name;
                        selectedFiltered1 = vm.historyFilter;
                        vm.historyFilters.order.selectedView = true;
                        vm.init({jobschedulerId: $scope.schedulerIds.selected});
                    }
                    if (vm.savedHistoryFilter.favorite == vm.filterName) {
                        vm.savedHistoryFilter.favorite = vm.historyFilter.name;
                    }
                    vm.historyFilterObj.order = vm.savedHistoryFilter;

                } else {
                    angular.forEach(vm.savedJobHistoryFilter.list, function (value, index) {
                        if (value.name == filter.name) {
                            vm.savedJobHistoryFilter.list[index] = vm.historyFilter;
                        }
                    });
                    if (vm.savedJobHistoryFilter.selected == vm.filterName) {
                        vm.savedJobHistoryFilter.selected = vm.historyFilter.name;
                        selectedFiltered2 = vm.historyFilter;
                        vm.historyFilters.task.selectedView = true;
                        vm.init({jobschedulerId: $scope.schedulerIds.selected});
                    }
                    if (vm.savedJobHistoryFilter.favorite == vm.filterName) {
                        vm.savedJobHistoryFilter.favorite = vm.historyFilter.name;
                    }
                    vm.historyFilterObj.job = vm.savedJobHistoryFilter;
                }
                SavedFilter.setHistory(vm.historyFilterObj);
                SavedFilter.save();
                vm.filterName = undefined;
            }, function () {
                vm.filterName = undefined;
            });
        };

        vm.deleteFilter = function (name) {

            if (vm.historyFilters.type == 'jobChain') {
                angular.forEach(vm.savedHistoryFilter.list, function (value, index) {
                    if (value.name == name) {
                        toasty.success({
                            title: value.name + ' ' + gettextCatalog.getString('message.filterDeleteSuccessfully'),
                            msg: ''
                        });
                        vm.savedHistoryFilter.list.splice(index, 1);
                    }
                });
                if (vm.savedHistoryFilter.list.length == 0) {
                    vm.savedHistoryFilter.selected = undefined;
                    vm.historyFilters.order.selectedView = false;
                    selectedFiltered1 = undefined;
                }
                if (vm.savedHistoryFilter.selected == name) {
                    vm.savedHistoryFilter.selected = undefined;
                    vm.historyFilters.order.selectedView = false;
                    selectedFiltered1 = undefined;
                    vm.init({jobschedulerId: $scope.schedulerIds.selected});
                }
                vm.historyFilterObj.order = vm.savedHistoryFilter;


            } else {
                angular.forEach(vm.savedJobHistoryFilter.list, function (value, index) {
                    if (value.name == name) {
                        toasty.success({
                            title: value.name + ' ' + gettextCatalog.getString('message.filterDeleteSuccessfully')
                        });
                        vm.savedJobHistoryFilter.list.splice(index, 1);
                    }
                });
                if (vm.savedJobHistoryFilter.list.length == 0) {
                    vm.savedJobHistoryFilter.selected = undefined;
                    vm.historyFilters.task.selectedView = false;
                    selectedFiltered2 = undefined;
                }
                if (vm.savedJobHistoryFilter.selected == name) {
                    vm.savedJobHistoryFilter.selected = undefined;
                    vm.historyFilters.task.selectedView = false;
                    selectedFiltered2 = undefined;
                    vm.init({jobschedulerId: $scope.schedulerIds.selected});
                }
                vm.historyFilterObj.job = vm.savedJobHistoryFilter;

            }
            SavedFilter.setHistory(vm.historyFilterObj);
            SavedFilter.save();
        };

        vm.favorite = function (filter) {
            if (vm.historyFilters.type == 'jobChain') {
                vm.savedHistoryFilter.favorite = filter.name;
                vm.historyFilters.order.selectedView = true;
                vm.historyFilterObj.order = vm.savedHistoryFilter;
            } else {
                vm.savedJobHistoryFilter.favorite = filter.name;
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

            SavedFilter.setHistory(vm.historyFilterObj);
            SavedFilter.save();
        };

        vm.expanding_property = {
            field: "name"
        };

        vm.filter_tree = {};

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

        vm.treeHandler = function (data) {
            if (vm.historyFilters.type == 'jobChain') {
                data.jobChains = [];
                var obj = {};
                obj.jobschedulerId = vm.schedulerIds.selected;
                obj.compact = true;
                obj.folders = [{folder: data.path, recursive: false}];
                OrderService.getOrdersP(obj).then(function (result) {
                    data.jobChains = result.orders;
                });
            } else {
                data.jobs = [];
                var obj = {};
                obj.jobschedulerId = vm.schedulerIds.selected;
                obj.compact = true;
                obj.folders = [{folder: data.path, recursive: false}];
                JobService.getJobsP(obj).then(function (result) {
                    data.jobs = result.jobs;
                });
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
                vm.object.orders = [];
                vm.object.jobChains = [];
                vm.object.jobs = [];
            }
        });
        var watcher7 = $scope.$watchCollection('object.orders', function (newNames) {
            if (newNames && newNames.length > 0) {
                vm.orders = [];
                angular.forEach(newNames, function (v) {
                    vm.orders.push({orderId: v.orderId, jobChain: v.jobChain});
                });
                vm.object.paths = [];
            }
        });
        var watcher8 = $scope.$watchCollection('object.jobChains', function (newNames) {
            if (newNames && newNames.length > 0) {
                vm.jobChains = newNames;
                vm.object.paths = [];
            }
        });
        var watcher9 = $scope.$watchCollection('object.jobs', function (newNames) {
            if (newNames && newNames.length > 0) {
                vm.jobs = newNames;
                vm.object.paths = [];
            }
        });

        vm.addJobChainPaths = function () {
            vm.historyFilter.paths = vm.paths;
            vm.historyFilter.orders = vm.orders;
            vm.historyFilter.jobChains = vm.jobChains;
            vm.historyFilter.jobs = vm.jobs;
        };
        vm.remove = function (object, type) {
            if (type == 'jobChain') {
                vm.historyFilter.jobChains.splice(object, 1);
            } else if (type == 'job') {
                vm.historyFilter.jobs.splice(object, 1);
            } else if (type == 'order') {
                vm.historyFilter.orders.splice(object, 1);
            } else {
                vm.historyFilter.paths.splice(object, 1);
            }
        };

        vm.checkFilterName = function () {
            vm.isUnique = true;
            if (vm.historyFilters.type == 'jobChain') {
                angular.forEach(vm.savedHistoryFilter.list, function (value) {
                    if (!vm.filterName) {
                        if (vm.historyFilter.name == value.name) {
                            vm.isUnique = false;
                        }
                    } else {
                        if (value.name != vm.filterName) {
                            if (vm.historyFilter.name == value.name) {
                                vm.isUnique = false;
                            }
                        }
                    }
                });
            } else {
                angular.forEach(vm.savedJobHistoryFilter.list, function (value) {
                    if (!vm.filterName) {
                        if (vm.historyFilter.name == value.name) {
                            vm.isUnique = false;
                        }
                    } else {
                        if (value.name != vm.filterName) {
                            if (vm.historyFilter.name == value.name) {
                                vm.isUnique = false;
                            }
                        }
                    }
                });
            }
        };

        vm.changeFilter = function (filter) {
            if (vm.historyFilters.type == 'jobChain') {
                if (filter) {
                    vm.savedHistoryFilter.selected = filter.name;
                    vm.historyFilters.order.selectedView = true;
                }
                else {
                    vm.savedHistoryFilter.selected = filter;
                    vm.historyFilters.order.selectedView = false;
                }
                selectedFiltered1 = filter;

                vm.historyFilterObj.order = vm.savedHistoryFilter;

            } else {
                if (filter) {
                    vm.savedJobHistoryFilter.selected = filter.name;
                    vm.historyFilters.task.selectedView = true;
                }
                else {
                    vm.savedJobHistoryFilter.selected = filter;
                    vm.historyFilters.task.selectedView = false;
                }
                selectedFiltered2 = filter;

                vm.historyFilterObj.job = vm.savedJobHistoryFilter;

            }
            vm.init({jobschedulerId: $scope.schedulerIds.selected});
            SavedFilter.setHistory(vm.historyFilterObj);
            SavedFilter.save();
        };
        /**--------------- ignore list functions -------------*/

        vm.addOrderToIgnoreList = function (orderId, jobChain) {
            var obj = {
                jobChain: jobChain,
                orderId: orderId
            };
            if (vm.savedIgnoreList.orders.indexOf(obj) === -1) {
                vm.savedIgnoreList.orders.push(obj);
                SavedFilter.setIgnoreList(vm.savedIgnoreList);
                SavedFilter.save();
                if ((vm.savedIgnoreList.isEnable == 'true' || vm.savedIgnoreList.isEnable == true)) {
                    if (jobChainSearch) {
                        vm.search(true);
                    } else {
                        vm.init({jobschedulerId: $scope.schedulerIds.selected});
                    }
                }
            }
        };

        vm.addJobChainToIgnoreList = function (name) {
            if (vm.savedIgnoreList.jobChains.indexOf(name) === -1) {
                vm.savedIgnoreList.jobChains.push(name);
                SavedFilter.setIgnoreList(vm.savedIgnoreList);
                SavedFilter.save();
                if ((vm.savedIgnoreList.isEnable == 'true' || vm.savedIgnoreList.isEnable == true)) {
                    console.log('>>>>>>>');
                    if (jobChainSearch) {
                        vm.search(true);
                    } else {
                        vm.init({jobschedulerId: $scope.schedulerIds.selected});
                    }
                }
            }
        };

        vm.addJobToIgnoreList = function (name) {
            if (vm.savedIgnoreList.jobs.indexOf(name) === -1) {
                vm.savedIgnoreList.jobs.push(name);
                SavedFilter.setIgnoreList(vm.savedIgnoreList);
                SavedFilter.save();
                if ((vm.savedIgnoreList.isEnable == 'true' || vm.savedIgnoreList.isEnable == true)) {
                    if (jobSearch) {
                        vm.search(true);
                    } else {
                        vm.init({jobschedulerId: $scope.schedulerIds.selected});
                    }
                }
            }
        };

        vm.editIgnoreList = function () {
            if (vm.savedIgnoreList.jobChains.length > 0 || vm.savedIgnoreList.jobs.length > 0 || vm.savedIgnoreList.orders.length > 0) {
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
            SavedFilter.setIgnoreList(vm.savedIgnoreList);
            SavedFilter.save();
            if ((vm.savedIgnoreList.isEnable == 'true' || vm.savedIgnoreList.isEnable == true)) {
                if ((jobChainSearch && vm.historyFilters.type == 'jobChain')) {
                    vm.search(true);
                } else
                    vm.init({jobschedulerId: $scope.schedulerIds.selected});
            }
        };
        vm.removeJobChainIgnoreList = function (name) {
            vm.savedIgnoreList.jobChains.splice(vm.savedIgnoreList.jobChains.indexOf(name), 1);
            SavedFilter.setIgnoreList(vm.savedIgnoreList);
            SavedFilter.save();
            if ((vm.savedIgnoreList.isEnable == 'true' || vm.savedIgnoreList.isEnable == true)) {
                if ((jobChainSearch && vm.historyFilters.type == 'jobChain')) {
                    vm.search(true);
                } else
                    vm.init({jobschedulerId: $scope.schedulerIds.selected});
            }
        };
        vm.removeJobIgnoreList = function (name) {
            vm.savedIgnoreList.jobs.splice(vm.savedIgnoreList.jobs.indexOf(name), 1);
            SavedFilter.setIgnoreList(vm.savedIgnoreList);
            SavedFilter.save();
            if ((vm.savedIgnoreList.isEnable == 'true' || vm.savedIgnoreList.isEnable == true)) {
                if ((jobSearch && vm.historyFilters.type != 'jobChain')) {
                    vm.search(true);
                } else
                    vm.init({jobschedulerId: $scope.schedulerIds.selected});
            }
        };

        vm.resetIgnoreList = function () {

            if ((vm.savedIgnoreList.isEnable == 'true' || vm.savedIgnoreList.isEnable == true) && vm.historyFilters.type == 'jobChain' && (vm.savedIgnoreList.jobChains.length > 0 || (vm.savedIgnoreList.orders.length > 0))) {
                if (jobChainSearch) {
                    vm.search(true);
                } else
                    vm.init({jobschedulerId: $scope.schedulerIds.selected});
            } else if ((vm.savedIgnoreList.isEnable == 'true' || vm.savedIgnoreList.isEnable == true) && vm.historyFilters.type != 'jobChain' && vm.savedIgnoreList.jobs.length > 0) {
                if (jobSearch) {
                    vm.search(true);
                } else
                    vm.init({jobschedulerId: $scope.schedulerIds.selected});
            }
            vm.savedIgnoreList.orders = [];
            vm.savedIgnoreList.jobChains = [];
            vm.savedIgnoreList.jobs = [];
            vm.savedIgnoreList.isEnable = false;
            SavedFilter.setIgnoreList(vm.savedIgnoreList);
            SavedFilter.save();
        };

        vm.enableDisableIgnoreList = function () {
            vm.savedIgnoreList.isEnable = !vm.savedIgnoreList.isEnable;
            SavedFilter.setIgnoreList(vm.savedIgnoreList);
            SavedFilter.save();
            if ((jobSearch && vm.historyFilters.type != 'jobChain') || (jobChainSearch && vm.historyFilters.type == 'jobChain')) {
                vm.search(true);
            } else
                vm.init({jobschedulerId: $scope.schedulerIds.selected});
        };
        var int = '';
        var int1 = '';
        vm.$on('event-started', function () {
            if (vm.events && vm.events[0] && vm.events[0].eventSnapshots) {
                for (var i = 0; i <= vm.events[0].eventSnapshots.length - 1; i++) {
                    if (vm.events[0].eventSnapshots[i].eventType == 'OrderFinished' && vm.historyFilters.type == 'jobChain' && isLoaded) {
                        isLoaded = false;
                        if (int) {
                            $timeout.cancel(int);
                        }
                        int = $timeout(function () {
                            var filter = {};
                            filter.jobschedulerId = $scope.schedulerIds.selected;

                            if (selectedFiltered1) {
                                filter = orderParseDate(filter);
                            } else {
                                filter = setOrderDateRange(filter);
                                if (vm.order.filter.historyStates != 'all') {
                                    filter.historyStates = [];
                                    filter.historyStates.push(vm.order.filter.historyStates);
                                }
                            }
                            filter.limit = parseInt($window.localStorage.$SOS$MAXRECORDS);
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

                            $timeout.cancel(int);
                        }, 5000);
                        break;
                    } else if (vm.events[0].eventSnapshots[i].eventType == 'TaskClosed' && vm.historyFilters.type == 'job' && isLoaded) {
                        isLoaded = false;
                        if (int1) {
                            $timeout.cancel(int1);
                        }
                        int1 = $timeout(function () {
                            var filter = {};
                            filter.jobschedulerId = $scope.schedulerIds.selected;
                            if (selectedFiltered2) {
                                filter = jobParseDate(filter);
                            } else {
                                filter = setTaskDateRange(filter);
                                if (vm.task.filter.historyStates != 'all') {
                                    filter.historyStates = [];
                                    filter.historyStates.push(vm.task.filter.historyStates);
                                }
                            }
                            filter.limit = parseInt($window.localStorage.$SOS$MAXRECORDS);
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

                            $timeout.cancel(int1);
                        }, 5000);
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
            if (int)
                $timeout.cancel(int);
            if (int1)
                $timeout.cancel(int1);
        });

    }

    LogCtrl.$inject = ["$scope", "OrderService", "TaskService", "$stateParams", "$location", "FileSaver", "Blob", "$sce"];
    function LogCtrl($scope, OrderService, TaskService, $stateParams, $location, FileSaver, Blob, $sce) {
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
        vm.loadOrderLog = function () {

            vm.jobChain = object.jobChain;
            var orders = {};
            orders.jobschedulerId = $scope.schedulerIds.selected;
            orders.jobChain = vm.jobChain;
            orders.orderId = $stateParams.orderId;
            orders.historyId = $stateParams.historyId;
            orders.mime = ['HTML'];
            OrderService.log(orders).then(function (res) {
                if (res.log)
                    vm.logs = $sce.trustAsHtml(res.log.html);
                vm.isLoading = true;
            }, function () {
                vm.isLoading = true;
            });
        };
        vm.loadJobLog = function () {

            vm.job = object.job;
            var jobs = {};
            jobs.jobschedulerId = $scope.schedulerIds.selected;
            jobs.taskId = $stateParams.taskId;
            jobs.mime = ['HTML'];
            TaskService.log(jobs).then(function (res) {
                if (res.log)
                    vm.logs = $sce.trustAsHtml(res.log.html);
                vm.isLoading = true;
            }, function () {
                vm.isLoading = true;
            });
        };
        if ($stateParams.historyId) {
            vm.orderId = $stateParams.orderId;
            vm.loadOrderLog();
        }
        else {
            vm.taskId = $stateParams.taskId;
            vm.loadJobLog();
        }

    }
})();
