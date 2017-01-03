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

    JobChainOrdersCtrl.$inject = ["$scope", "SOSAuth", "OrderService", "CoreService"];
    function JobChainOrdersCtrl($scope, SOSAuth, OrderService, CoreService) {
        var vm = $scope;

        vm.orderFilters = CoreService.getOrderDetailTab();

        vm.orderFilters.overview = false;

        function loadJobOrderV(obj) {
            OrderService.get(obj).then(function (res) {
                var data = [];
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
                vm.isLoading = true;
            }, function () {
                vm.isLoading = true;
            });
        }


        function loadOrders(obj) {
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

        vm.showLeftPanel = function () {
            CoreService.setSideView(false);
            $('#rightPanel').removeClass('fade-in m-l-0');
            $('#leftPanel').show();
            $('.sidebar-btn').hide();
        };

    }

    JobChainOverviewCtrl.$inject = ["$scope", "$rootScope", "OrderService", "SOSAuth", "JobChainService", "JobService", "$timeout", "DailyPlanService", "$state", "$location", "CoreService", "$uibModal"];
    function JobChainOverviewCtrl($scope, $rootScope, OrderService, SOSAuth, JobChainService, JobService, $timeout, DailyPlanService, $state, $location, CoreService, $uibModal) {

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
                //console.log("On add 01");
                if (item) {
                    vm.selectedNodes.push(item);
                }
                vm.isStoppedJob = false;
                vm.isStoppedNode = false;
                vm.isSkippedNode = false;
                vm.isActiveNode = false;
                vm.isPendingJob = false;
                angular.forEach(vm.selectedNodes, function (value) {
                    console.log(value.name + " state " + value.state._text + " job state " + value.job.state._text);
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
            JobService.stop(jobs).then(function (res) {
                vm.reset();
                $rootScope.$broadcast('bulkOperationCompleted', {operation: 'stopJobs', status: 'success'});
            }, function (err) {
                vm.reset();

            });
        };

        vm.unstopJobs = function () {
            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = $scope.schedulerIds.selected;

            angular.forEach(vm.selectedNodes, function (value) {
                jobs.jobs.push({job: value.job.path});
            });

            JobService.unstop(jobs).then(function (res) {
                vm.reset();
                $rootScope.$broadcast('bulkOperationCompleted', {operation: 'unstopJobs', status: 'success'});
            }, function (err) {
                vm.reset();
            });
        };

        vm.skipNodes = function () {
            var nodes = {};
            nodes.nodes = [];
            nodes.jobschedulerId = $scope.schedulerIds.selected;

            angular.forEach(vm.selectedNodes, function (value) {
                nodes.nodes.push({jobChain: vm.jobChain.path, node: value.name});
            });
            JobService.skipNode(nodes).then(function (res) {
                vm.reset();
                $rootScope.$broadcast('bulkOperationCompleted', {operation: 'skipNodes', status: 'success'});
            }, function (err) {
                vm.reset();
            });
        };

        vm.unskipNodes = function () {

            var nodes = {};
            nodes.nodes = [];
            nodes.jobschedulerId = $scope.schedulerIds.selected;

            angular.forEach(vm.selectedNodes, function (value) {
                nodes.nodes.push({jobChain: vm.jobChain.path, node: value.name});
            });

            JobService.activateNode(nodes).then(function (res) {
                vm.reset();
                $rootScope.$broadcast('bulkOperationCompleted', {operation: 'unskipNodes', status: 'success'});
            }, function (err) {
                vm.reset();
            });
        };

        vm.stopNodes = function () {

            var nodes = {};
            nodes.nodes = [];
            nodes.jobschedulerId = $scope.schedulerIds.selected;

            angular.forEach(vm.selectedNodes, function (value) {
                nodes.nodes.push({jobChain: vm.jobChain.path, node: value.name});
            });

            JobService.stopNode(nodes).then(function (res) {
                vm.reset();
                $rootScope.$broadcast('bulkOperationCompleted', {operation: 'stopNodes', status: 'success'});
            }, function (err) {
                vm.reset();
            });
        };

        vm.unstopNodes = function () {

            var nodes = {};
            nodes.nodes = [];
            nodes.jobschedulerId = $scope.schedulerIds.selected;

            angular.forEach(vm.selectedNodes, function (value) {
                nodes.nodes.push({jobChain: vm.jobChain.path, node: value.name});
            });

            JobService.activateNode(nodes).then(function (res) {
                vm.reset();
                $rootScope.$broadcast('bulkOperationCompleted', {operation: 'unstopNodes', status: 'success'});
            }, function (err) {
                vm.reset();
            });
        };


        var splitRegex = new RegExp('(.+):(.+)');

        var parentRegex = '';

        vm.totalNodes = 0;
        vm.uniqueNode = 0;
        vm.totalSubNodes = 0;

        function getPadding(job) {

            var padding = 0;
            var matched = false;

            if (!splitRegex.test(job.name)) {
                vm.totalNodes++;
            } else {
                if (!vm.uniqueNode) {
                    vm.totalNodes++;
                    vm.totalSubNodes++;
                    vm.uniqueNode = splitRegex.exec(job.name)[1];
                } else if (vm.uniqueNode != splitRegex.exec(job.name)[1]) {
                    vm.totalNodes++;
                    vm.totalSubNodes++;
                    vm.uniqueNode = splitRegex.exec(job.name)[1];
                }
            }

            vm.jobChain.nodes.map(function (node) {
                if (splitRegex.test(job.name)) {
                    var parent = splitRegex.exec(job.name)[1];
                    parentRegex = new RegExp("(.+):" + parent);
                    if (parentRegex.test(node.name)) {
                        //console.log("Padding for01 "+job.name+" is "+node.padding);
                        job.padding = node.padding + 10;
                        padding = job.padding;
                    } else if (parent == node.name) {
                        //console.log("Padding for02 "+job.name+" is "+node.padding + "parent :: " + parent);
                        job.padding = node.padding + 10;
                        padding = job.padding;
                    }
                } else if (node.nextNode == job.name && !matched) {
                    //console.log("Padding for03 " + job.name + " is " + node.padding);
                    matched = true;
                    job.padding = node.padding;
                    padding = job.padding;
                }
            });

            return padding;
        }

        function loadJobChain() {

            if (SOSAuth.jobChain) {
                vm.totalNodes = 0;
                vm.totalSubNodes = 0;

                vm.jobChain = JSON.parse(SOSAuth.jobChain);

                angular.forEach(vm.jobChain.nodes, function (node) {
                    if (vm.jobChain.nodes[0]) {
                        vm.jobChain.nodes[0].padding = 0;
                    }
                    getPadding(node);
                });
                if (vm.totalSubNodes > 0) {
                    vm.totalLineWidth = vm.totalNodes + vm.totalSubNodes;
                } else {
                    vm.totalLineWidth = vm.totalNodes;
                }

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
            if (action == 'stop node') {
                return JobService.stopNode({
                    jobschedulerId: $scope.schedulerIds.selected,
                    nodes: [{jobChain: path, node: node}]
                });
            } else if (action == 'skip') {
                return JobService.skipNode({
                    jobschedulerId: $scope.schedulerIds.selected,
                    nodes: [{jobChain: path, node: node}]
                });
            } else if (action == 'unstop node' || action == 'unskip') {
                return JobService.activateNode({
                    jobschedulerId: $scope.schedulerIds.selected,
                    nodes: [{jobChain: path, node: node}]
                });
            } else if (action == 'stop job') {
                return JobService.stop({jobschedulerId: $scope.schedulerIds.selected, jobs: [{job: path}]});
            } else if (action == 'unstop job') {
                return JobService.unstop({jobschedulerId: $scope.schedulerIds.selected, jobs: [{job: path}]});
            }

        }


        vm.stopNode = function (data) {

            var nodes = {};
            nodes.nodes = [];
            nodes.jobschedulerId = $scope.schedulerIds.selected;
            nodes.nodes.push({jobChain: vm.jobChain.path, node: data.name});

            JobService.stopNode(nodes).then(function (res) {

            }, function (err) {

            });
        };

        vm.unStopNode = function (data) {

            var nodes = {};
            nodes.nodes = [];
            nodes.jobschedulerId = $scope.schedulerIds.selected;
            nodes.nodes.push({jobChain: vm.jobChain.path, node: data.name});

            JobService.activateNode(nodes).then(function (res) {
            }, function (err) {

            });
        };

        vm.skipNode = function (data) {

            var nodes = {};
            nodes.nodes = [];
            nodes.jobschedulerId = $scope.schedulerIds.selected;
            nodes.nodes.push({jobChain: vm.jobChain.path, node: data.name});

            JobService.skipNode(nodes).then(function (res) {

            }, function (err) {

            });
        };

        vm.unskipNode = function (data) {

            var nodes = {};
            nodes.nodes = [];
            nodes.jobschedulerId = $scope.schedulerIds.selected;
            nodes.nodes.push({jobChain: vm.jobChain.path, node: data.name});

            JobService.activateNode(nodes).then(function (res) {

            }, function (err) {

            });
        };

        vm.stopJob = function (data) {
            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = $scope.schedulerIds.selected;
            jobs.jobs.push({job: data.job.path});

            JobService.stop(jobs).then(function (res) {

            }, function (err) {

            });
        };

        vm.unstopJob = function (data) {

            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = $scope.schedulerIds.selected;
            jobs.jobs.push({job: data.job.path});
            JobService.unstop(jobs).then(function (res) {

            }, function (err) {

            });
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
                vm.object.nodes = vm.jobChain.nodes;
            } else {
                vm.object1.nodes = [];
            }
            vm.selectedNodes = angular.copy(vm.object.nodes);
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

        function setHeight() {
            if (vm.fitToScreen) {
                var windowWidth = $(window).innerWidth();
                var windowHeight = $(window).innerHeight();
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
                if (maxTop < windowHeight && maxLeft + 230 < windowWidth) {
                    return;
                }


                if (windowWidth / (maxLeft + 230) < windowHeight / maxTop) {
                    vm.slider.value = windowWidth / (maxLeft + 230);
                } else {
                    vm.slider.value = windowWidth / (maxLeft + 230);
                }
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

        vm.$watch("fitToScreen", setHeight);

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
            setHeight();
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


            obj.at = moment.utc(order.date).format();
            if (!obj.params && paramObject.params.length > 0) {
                obj.params = paramObject.params;
            } else if (obj.params && paramObject.params.length > 0) {
                obj.params.concat(paramObject.params);
            }
            orders.orders.push(obj);
            OrderService.startOrder(orders);
        }

        function setOrderState(order) {

            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
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
            orders.orders.push({orderId: order.orderId, jobChain: order.jobChain, runTime: order.runTime});

            OrderService.setRunTime(orders);
        }

        function resumeOrderWithParam(order, paramObject) {
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            orders.orders.push({orderId: order.orderId, jobChain: order.jobChain});
            orders.params.concat(paramObject.params);
            OrderService.resumeOrder(orders);

        }

        function resumeOrderState(order) {
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            orders.orders.push({
                orderId: order.orderId,
                jobChain: order.jobChain,
                state: vm.order.state,
                endState: vm.order.endState,
                resume: true
            });

            orders.resume = true;
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
            if (action == 'start order now') {
                var orders = {};
                orders.orders = [];
                orders.jobschedulerId = $scope.schedulerIds.selected;
                orders.orders.push({orderId: order.orderId, jobChain: order.jobChain, at: 'now'});
                OrderService.startOrder(orders);
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
                vm.order.date = new Date();
                vm.order.time = new Date();

                vm.paramObject = {};
                vm.paramObject.params = [];

                var modalInstance = $uibModal.open({
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

                var modalInstance = $uibModal.open({
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

                });
            }

            if (action == 'suspend order') {
                var orders = {};
                orders.orders = [];
                orders.jobschedulerId = $scope.schedulerIds.selected;
                orders.orders.push({orderId: order.orderId, jobChain: order.jobChain});
                OrderService.suspendOrder(orders);
            }

            if (action == 'resume order') {
                var orders = {};
                orders.orders = [];
                orders.jobschedulerId = $scope.schedulerIds.selected;
                orders.orders.push({orderId: order.orderId, jobChain: order.jobChain});
                OrderService.resumeOrder(orders);
            }

            if (action == 'resume order with param') {
                vm.order = order;
                vm.paramObject = {};
                vm.paramObject.params = [];

                var modalInstance = $uibModal.open({
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
            }

            if (action == 'reset order') {
                var orders = {};
                orders.orders = [];
                orders.jobschedulerId = $scope.schedulerIds.selected;
                orders.orders.push({orderId: order.orderId, jobChain: order.jobChain});
                OrderService.resetOrder(orders);
            }

            if (action == 'remove order') {
                var orders = {};
                orders.orders = [];
                orders.jobschedulerId = $scope.schedulerIds.selected;
                orders.orders.push({orderId: order.orderId, jobChain: order.jobChain});
                OrderService.removeOrder(orders);
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
                OrderService.deleteOrder(orders);
            }


        };

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
                title: gettextCatalog.getString('message.oops'),
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
                        expectedEndTime: data.expectedEndTime
                    };
                    vm.planItems.push(planData);
                });

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
                vm.object.orders = [];
            });

        }

        vm.addOrder = function () {
            ScheduleService.getSchedulesP({
                jobschedulerId: $scope.schedulerIds.selected,
                compact: true
            }).then(function (res) {
                vm.schedules = res.schedules;
            });

            vm._jobChain = vm.jobChain;

            JobChainService.getJobChainP({
                jobschedulerId: vm.schedulerIds.selected,
                jobChain: vm.jobChain.path
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
                vm.object.orders = [];
            });
        };

        vm.stopJob = function () {
            var jobChains = {};
            jobChains.jobChains = [];
            jobChains.jobschedulerId = $scope.schedulerIds.selected;
            jobChains.jobChains.push({jobChain: vm.jobChain.path});
            JobChainService.stop(jobChains).then(function (res) {

            });

            vm.reset();
        };
        vm.unstopJob = function () {
            var jobChains = {};
            jobChains.jobChains = [];
            jobChains.jobschedulerId = $scope.schedulerIds.selected;
            jobChains.jobChains.push({jobChain: vm.jobChain.path});
            JobChainService.unstop(jobChains).then(function (res) {

            });
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
            OrderService.deleteOrder(orders).then(function (res) {
                for (var i = 0; i < vm.object.orders.length; i++) {
                    vm.orders.splice(vm.object.orders[i], 1);
                }
                vm.reset();
            });

        };

        vm.suspendAllOrder = function () {
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            angular.forEach(vm.object.orders, function (value) {
                orders.orders.push({orderId: value.orderId, jobChain: value.jobChain});
            });
            OrderService.suspendOrder(orders).then(function (res) {

            });
            vm.reset();
        };
        vm.resumeAllOrder = function () {
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            angular.forEach(vm.object.orders, function (value) {
                orders.orders.push({orderId: value.orderId, jobChain: value.jobChain});
            });
            OrderService.resumeOrder(orders).then(function (res) {


            });
            vm.reset();

        };
        vm.resetAllOrder = function () {
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            angular.forEach(vm.object.orders, function (value) {
                orders.orders.push({orderId: value.orderId, jobChain: value.jobChain});
            });
            OrderService.resetOrder(orders).then(function (res) {

            });
            vm.reset();
        };
        vm.startAllOrder = function () {
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            angular.forEach(vm.object.orders, function (value) {
                orders.orders.push({orderId: value.orderId, jobChain: value.jobChain, at: 'now'});
            });
            OrderService.startOrder(orders).then(function (res) {

            });
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
                            angular.forEach(vm.jobChain.nodes, function (node, index) {
                                if (path[0] == node.job.path) {
                                    flag = true;
                                }
                            });
                        }
                        if (vm.jobChain.path == path[0] || flag) {
                            volatileInfo();
                        }
                        break;
                    }
                }
        });
    }

    OrderCtrl.$inject = ["$scope", "$rootScope", "OrderService", "orderByFilter", "$uibModal", "SavedFilter", "toasty", "gettextCatalog", "CoreService", "$timeout"];
    function OrderCtrl($scope, $rootScope, OrderService, orderBy, $uibModal, SavedFilter, toasty, gettextCatalog, CoreService, $timeout) {
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
                if (data.orders.length > 0 && data.orders.length > res.orders.length) {
                    angular.forEach(data.orders, function (orders) {
                        if (orders.path.substring(0, 1) != '/') {
                            orders.path = '/' + orders.path;
                        }
                        angular.forEach(res.orders, function (orderData) {
                            if (orders.path == orderData.path) {
                                orders = angular.merge(orders, orderData);
                                data1.push(orders);
                            }
                        })
                    });
                    data.orders = data1;
                } else {
                    data.orders = res.orders;
                }

                if (data.orders.length > 0) {
                    angular.forEach(data.orders, function (value) {
                        var flag = true;
                        value.path1 = data.path;

                        angular.forEach(vm.allOrders, function (value1) {
                            if (value.path == value1.path) {
                                flag = false;
                            }
                        });
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

                        angular.forEach(vm.allOrders, function (value1) {
                            if (value.path == value1.path) {
                                flag = false;
                            }
                        });
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
                        if (orders.path.substring(0, 1) != '/') {
                            orders.path = '/' + orders.path;
                        }
                        angular.forEach(res.orders, function (orderData) {
                            if (orders.path == orderData.path) {
                                orders = angular.merge(orders, orderData);
                                data1.push(orders);
                            }
                        })
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
                        if (result.orders && result.orders.length > 0 && res.orders && res.orders.length > 0) {
                            var x = [];
                            angular.forEach(result.orders, function (orders) {
                                if (orders.path.substring(0, 1) != '/') {
                                    orders.path = '/' + orders.path;
                                }

                                angular.forEach(res.orders, function (orderData) {
                                    if (orders.path == orderData.path) {
                                        orders = angular.merge(orders, orderData);
                                        x.push(orders);
                                    }
                                });
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
                if (vm.orderFilters.filter.state != 'ALL') {
                    obj.processingStates = [];
                    obj.processingStates.push(vm.orderFilters.filter.state);
                }
            }
            OrderService.get(obj).then(function (res) {

                var data = [];
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


        /**---------------filter, sorting and pagination -------------------*/
        vm.sortBy = function (propertyName) {
            vm.reset();
            vm.orderFilters.reverse = !vm.orderFilters.reverse;
            vm.orderFilters.filter.sortBy = propertyName;
        };

        vm.radio = {};
        vm.radio.radio = 'current';
        vm.applyFilter = function () {
            vm.orderFilter = {};
            vm.isUnique = true;
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/order-filter-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
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
        vm.validPlanned = true;
        vm.checkPlanned = function () {
            vm.validPlanned = true;
            if (!vm.orderFilter.planned || /^\s*$/i.test(vm.orderFilter.planned) || /^\s*(now\s*\+)\s*(\d+)\s*$/i.test(vm.orderFilter.planned) || /^\s*(now)\s*$/i.test(vm.orderFilter.planned) || /^\s*(Today)\s*$/i.test(vm.orderFilter.planned)
                || /^\s*(\d+):(\d+)\s*(am|pm)\s*to\s*(\d+):(\d+)\s*(am|pm)\s*$/i.test(vm.orderFilter.planned)) {
            } else {
                vm.validPlanned = false;
            }
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
            //vm.savedOrderFilter.selected = filter.name;
            vm.orderFilters.selectedView = true;
            //selectedFiltered = filter;
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


        var watcher1 = $scope.$watchCollection('object.paths', function (newNames) {
            if (newNames && newNames.length > 0) {
                vm.paths = newNames;
            }
        });

        vm.addJobChainPaths = function () {
            vm.orderFilter.paths = vm.paths;
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
            OrderService.deleteOrder(orders).then(function (res) {

                for (var i = 0; i < vm.object.orders.length; i++) {
                    vm.allOrders.splice(vm.object.orders[i], 1);
                }

                vm.reset();
            });
        };

        vm.suspendAllOrder = function () {
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            angular.forEach(vm.object.orders, function (value) {
                orders.orders.push({orderId: value.orderId, jobChain: value.jobChain});
            });
            OrderService.suspendOrder(orders).then(function (res) {

            });
            vm.reset();
        };
        vm.resumeAllOrder = function () {
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            angular.forEach(vm.object.orders, function (value) {
                orders.orders.push({orderId: value.orderId, jobChain: value.jobChain});
            });
            OrderService.resumeOrder(orders).then(function (res) {


            });
            vm.reset();
        };
        vm.resetAllOrder = function () {
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            angular.forEach(vm.object.orders, function (value) {
                orders.orders.push({orderId: value.orderId, jobChain: value.jobChain});
            });
            OrderService.resetOrder(orders).then(function (res) {


            });
            vm.reset();

        };
        vm.startAllOrder = function () {
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            angular.forEach(vm.object.orders, function (value) {
                orders.orders.push({orderId: value.orderId, jobChain: value.jobChain, at: 'now'});
            });

            OrderService.startOrder(orders).then(function (res) {

            });
            vm.reset();

        };


        vm.showPanel = '';
        vm.showPanelFuc = function (value) {
            vm.showPanel = value;
            vm.hidePanel = true;
        };
        vm.hidePanelFuc = function () {
            vm.showPanel = '';
            vm.hidePanel = !vm.hidePanel;
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
                                            vm.allOrders[index] = angular.merge(vm.allOrders[index], res.order);
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
            //watcher();
            watcher1();
            if (t1) {
                $timeout.cancel(t1);
            }
        });

    }

    OrderOverviewCtrl.$inject = ["$scope", "$rootScope", "OrderService", "$stateParams", "CoreService"];
    function OrderOverviewCtrl($scope, $rootScope, OrderService, $stateParams, CoreService) {
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
            OrderService.deleteOrder(orders).then(function (res) {
                for (var i = 0; i < vm.object.orders.length; i++) {
                    vm.allOrders.splice(vm.object.orders[i], 1);
                }
                vm.reset();
            });

        };

        vm.suspendAllOrder = function () {
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            angular.forEach(vm.object.orders, function (value) {
                orders.orders.push({orderId: value.orderId, jobChain: value.jobChain});
            });
            OrderService.suspendOrder(orders).then(function (res) {

            });
            vm.reset();

        };
        vm.resumeAllOrder = function () {
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            angular.forEach(vm.object.orders, function (value) {
                orders.orders.push({orderId: value.orderId, jobChain: value.jobChain});
            });
            OrderService.resumeOrder(orders).then(function (res) {


            });
            vm.reset();
        };
        vm.resetAllOrder = function () {
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            angular.forEach(vm.object.orders, function (value) {
                orders.orders.push({orderId: value.orderId, jobChain: value.jobChain});
            });
            OrderService.resetOrder(orders).then(function (res) {


            });
            vm.reset();
        };
        vm.startAllOrder = function () {
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            angular.forEach(vm.object.orders, function (value) {
                orders.orders.push({orderId: value.orderId, jobChain: value.jobChain, at: 'now'});
            });

            OrderService.startOrder(orders).then(function (res) {

            });
            vm.reset();
        };

        vm.showLeftPanel = function () {
            CoreService.setSideView(false);
            $('#rightPanel').removeClass('fade-in m-l-0');
            $('#leftPanel').show();
            $('.sidebar-btn').hide();
        };

        $scope.$on('event-started', function () {
            if (vm.events && vm.events[0] && vm.events[0].eventSnapshots)
                for (var i = 0; i < vm.events[0].eventSnapshots.length; i++) {
                    if (vm.events[0].eventSnapshots[i].path != undefined && vm.events[0].eventSnapshots[i].eventType.indexOf("Order") !== -1) {
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
                        $rootScope.$broadcast('reloadSnapshot');
                        break;
                    }
                }
        });
    }


    OrderFunctionCtrl.$inject = ["$scope", "$rootScope", "OrderService", "$uibModal", "ScheduleService", '$timeout', "DailyPlanService", "JobChainService", "$window", "$location"];
    function OrderFunctionCtrl($scope, $rootScope, OrderService, $uibModal, ScheduleService, $timeout, DailyPlanService, JobChainService, $window, $location) {
        var vm = $scope;

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


            obj.at = moment.utc(order.date).format();
            if (!obj.params && paramObject.params.length > 0) {
                obj.params = paramObject.params;
            } else if (obj.params && paramObject.params.length > 0) {
                obj.params.concat(paramObject.params);
            }
            orders.orders.push(obj);
            OrderService.startOrder(orders).then(function (res) {

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
            vm.order.date = new Date();
            vm.order.time = new Date();
            vm.paramObject = {};
            vm.paramObject.params = [];

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

            OrderService.startOrder(orders).then(function (res) {

            });
            vm.reset();
        };

        function setOrderState(order) {

            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            orders.orders.push({
                orderId: order.orderId,
                jobChain: order.jobChain,
                state: vm.order.state,
                endState: vm.order.endState
            });

            OrderService.setOrderState(orders).then(function (res) {
                var orders = {};
                orders.orders = [];
                orders.compact = true;
                orders.jobschedulerId = $scope.schedulerIds.selected;
                orders.orders.push({orderId: order.orderId, jobChain: order.jobChain});
                OrderService.get(orders).then(function (res) {
                    order = angular.merge(order, res.orders[0]);
                });
            }, function () {

            });
            vm.reset();
        }

        vm.setOrderState = function (order) {
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
            orders.orders.push({orderId: order.orderId, jobChain: order.jobChain, runTime: order.runTime});

            OrderService.setRunTime(orders).then(function (res) {

            }, function (err) {
                console.log(err);
            });
            vm.reset();
        }

        vm.setRunTime = function (order) {

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
            OrderService.suspendOrder(orders).then(function (res) {

            });
            vm.reset();
        };

        vm.resumeOrder = function (order) {
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            orders.orders.push({orderId: order.orderId, jobChain: order.jobChain});
            OrderService.resumeOrder(orders).then(function (res) {

            });
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
            orders.orders.push({
                orderId: order.orderId,
                jobChain: order.jobChain,
                state: vm.order.state,
                endState: vm.order.endState,
                resume: true
            });

            orders.resume = true;
            OrderService.setOrderState(orders).then(function (res) {

            });
            vm.reset();
        }

        function resumeOrderWithParam(order, paramObject) {
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            orders.orders.push({orderId: order.orderId, jobChain: order.jobChain});
            orders.params.concat(paramObject.params);
            OrderService.resumeOrder(orders).then(function (res) {

            });
            vm.reset();
        }

        vm.resumeOrderWithParam = function (order) {
            vm.order = order;
            vm.paramObject = {};
            vm.paramObject.params = [];
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
            OrderService.resetOrder(orders).then(function (res) {

            });
            vm.reset();
        };

        vm.removeOrder = function (order) {
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            orders.orders.push({orderId: order.orderId, jobChain: order.jobChain});
            OrderService.removeOrder(orders).then(function (res) {

            });
            vm.reset();
        };

        vm.deleteOrder = function (order) {
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            orders.orders.push({orderId: order.orderId, jobChain: order.jobChain});
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

            vm.reset();
        };

        vm.viewCalendar = function (order) {
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
            vm.reset();
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

        vm.showLogFuc = function (value) {
            var orders = {};
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
        if (vm.orderFilters && vm.orderFilters.showLogPanel) {
            vm.showLogFuc(vm.orderFilters.showLogPanel);
        }

        vm.hideLogPanel = function () {
            vm.showLogPanel = undefined;
            vm.orderFilters.showLogPanel = vm.showLogPanel;
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
        "JobChainService", "orderByFilter", "CoreService", "$window"];
    function HistoryCtrl($scope, OrderService, TaskService, $uibModal, SavedFilter, toasty, $timeout, gettextCatalog,
                         JobChainService, orderBy, CoreService, $window) {
        var vm = $scope;
        vm.historyFilters = CoreService.getHistoryTab();
        vm.order = vm.historyFilters.order;
        vm.task = vm.historyFilters.task;

        vm.object = {};
        vm.tree = [];
        var selectedFiltered1, selectedFiltered2;

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
        vm.pageChange = function () {
            vm.object = {};
        };
        vm.sortBy = function (propertyName) {
            vm.order.sortReverse = !vm.order.sortReverse;
            vm.order.filter.sortBy = propertyName;
        };
        vm.sortBy1 = function (propertyName) {
            vm.task.sortReverse = !vm.task.sortReverse;
            vm.task.filter.sortBy = propertyName;
        };

        function setTaskDateRange(filter) {
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
            vm.isLoading = false;
            if (!filter) {
                filter = {jobschedulerId: $scope.schedulerIds.selected};
            }

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
                filterJobData();
                vm.isLoading = true;
            }, function () {
                vm.isLoading = true;
            });
        }

        vm.init = function (filter) {
            if (vm.historyFilters.type == 'job') {
                jobHistory(filter);
            } else {
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
                    filterData();
                    vm.isLoading = true;
                }, function () {
                    vm.isLoading = true;
                });
            }
        };


        function orderParseDate(obj) {
            if (selectedFiltered1.regex) {
                obj.regex = selectedFiltered1.regex;
            }
            if (selectedFiltered1.paths && selectedFiltered1.paths.length > 0) {
                obj.orders = [];
                angular.forEach(selectedFiltered1.paths, function (value) {
                    obj.orders.push({jobChain: value});
                })
            }
            if (selectedFiltered1.state && selectedFiltered1.state.length > 0) {
                obj.historyStates = selectedFiltered1.state;
            }

            var fromDate;
            var toDate;
            if (selectedFiltered1.planned) {
                if (/^\s*(now\s*\+)\s*(\d+)\s*$/i.test(selectedFiltered1.planned)) {
                    fromDate = new Date();
                    toDate = new Date();
                    var seconds = parseInt(/^\s*(now\+)(\d+)\s*$/i.exec(selectedFiltered1.planned)[2]);
                    toDate.setSeconds(toDate.getSeconds() + seconds);
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

            if (selectedFiltered1.fromDate) {
                if (selectedFiltered1.fromTime) {
                    fromDate = new Date(selectedFiltered1.fromDate);
                    selectedFiltered1.fromTime = new Date(selectedFiltered1.fromTime);
                    fromDate.setHours(selectedFiltered1.fromTime.getHours());
                    fromDate.setMinutes(selectedFiltered1.fromTime.getMinutes());
                    fromDate.setSeconds(selectedFiltered1.fromTime.getSeconds());
                }

            }
            if (selectedFiltered1.toDate) {
                if (selectedFiltered1.toTime) {
                    toDate = new Date(selectedFiltered1.toDate);
                    selectedFiltered1.toTime = new Date(selectedFiltered1.toTime);
                    toDate.setHours(selectedFiltered1.toTime.getHours());
                    toDate.setMinutes(selectedFiltered1.toTime.getMinutes());
                    toDate.setSeconds(selectedFiltered1.toTime.getSeconds());
                }


            }

            if (fromDate && toDate) {
                obj.dateFrom = fromDate;
                obj.dateTo = toDate;
            }
            return obj;
        }

        function jobParseDate(obj) {
            if (selectedFiltered1.regex) {
                obj.regex = selectedFiltered1.regex;
            }
            var fromDate;
            var toDate;
            if (selectedFiltered2.planned) {
                if (/^\s*(now\s*\+)\s*(\d+)\s*$/i.test(selectedFiltered2.planned)) {
                    fromDate = new Date();
                    toDate = new Date();
                    var seconds = parseInt(/^\s*(now\+)(\d+)\s*$/i.exec(selectedFiltered2.planned)[2]);
                    toDate.setSeconds(toDate.getSeconds() + seconds);
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

            if (selectedFiltered2.fromDate) {
                if (selectedFiltered2.fromTime) {
                    fromDate = new Date(selectedFiltered2.fromDate);
                    selectedFiltered2.fromTime = new Date(selectedFiltered2.fromTime);
                    fromDate.setHours(selectedFiltered2.fromTime.getHours());
                    fromDate.setMinutes(selectedFiltered2.fromTime.getMinutes());
                    fromDate.setSeconds(selectedFiltered2.fromTime.getSeconds());
                }

            }
            if (selectedFiltered2.toDate) {
                if (selectedFiltered2.toTime) {
                    toDate = new Date(selectedFiltered2.toDate);
                    selectedFiltered2.toTime = new Date(selectedFiltered2.toTime);
                    toDate.setHours(selectedFiltered2.toTime.getHours());
                    toDate.setMinutes(selectedFiltered2.toTime.getMinutes());
                    toDate.setSeconds(selectedFiltered2.toTime.getSeconds());
                }


            }

            if (fromDate && toDate) {
                obj.dateFrom = fromDate;
                obj.dateTo = toDate;
            }
            return obj;
        }

        vm.init({jobschedulerId: $scope.schedulerIds.selected});

        function filterData() {
            checkIgnoreList();
        }

        function filterJobData() {
            checkJobIgnorelist();
        }

        function checkIgnoreList() {
            vm.object = {};
            var tempData = [];
            if (vm.savedIgnoreList.isEnable && (vm.savedIgnoreList.jobChains.length > 0 || vm.savedIgnoreList.orders.length > 0)) {
                angular.forEach(vm.historys, function (res) {
                    angular.forEach(vm.savedIgnoreList.jobChains, function (value1) {
                        if (res.jobChain != value1) {
                            tempData.push(res);
                        }
                    });

                    angular.forEach(vm.savedIgnoreList.orders, function (value2) {
                        if (res.orderId != value2) {
                            tempData.push(res);
                        }
                    });
                });
                vm.historys = tempData;
            }
        }


        function checkJobIgnorelist() {
            vm.object = {};
            var tempData = [];
            if (vm.savedIgnoreList.isEnable && vm.savedIgnoreList.jobs.length > 0) {
                angular.forEach(vm.jobHistorys, function (res) {
                    angular.forEach(vm.savedIgnoreList.jobs, function (value1) {
                        if (res.job != value1) {
                            tempData.push(res);
                        }
                    });

                });
                vm.jobHistorys = tempData;
            }
        }

        vm.loadHistory = function () {
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

            $('#exportToExcelBtn').attr("disabled", true);
            $('#' + vm.historyFilters.type).table2excel({
                exclude: ".noExl",
                filename: "jobscheduler-order-history-report",
                fileext: ".xls",
                exclude_img: false,
                exclude_links: false,
                exclude_inputs: false
            });
            $('#exportToExcelBtn').attr("disabled", false);
        };

        /**--------------- Checkbox functions -------------*/
        vm.allCheck = {
            checkbox: false
        };


        vm.reset = function () {
            vm.allCheck.checkbox = false;
            vm.object = {};
        };
        vm.validPlanned = true;
        vm.checkPlanned = function () {
            vm.validPlanned = true;
            if (!vm.historyFilter.planned || /^\s*$/i.test(vm.historyFilter.planned) || /^\s*(now\s*\+)\s*(\d+)\s*$/i.test(vm.historyFilter.planned) || /^\s*(now)\s*$/i.test(vm.historyFilter.planned) || /^\s*(Today)\s*$/i.test(vm.historyFilter.planned)
                || /^\s*(\d+):(\d+)\s*(am|pm)\s*to\s*(\d+):(\d+)\s*(am|pm)\s*$/i.test(vm.historyFilter.planned)) {
            } else {
                vm.validPlanned = false;
            }
        };


        /**--------------- Filter -----------------------------*/
        vm.advanceFilter = function () {

            vm.historyFilter = {};
            vm.isUnique = true;
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/history-filter-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
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
            vm.object.paths = vm.paths;
            vm.isUnique = true;
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/edit-history-filter-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
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
                            title: value.name + ' ' + gettextCatalog.getString('message.filterDeleteSuccessfully'),
                            msg: ''
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
                //vm.savedHistoryFilter.selected = filter.name;
                vm.historyFilters.order.selectedView = true;
                vm.historyFilterObj.order = vm.savedHistoryFilter;
                //selectedFiltered1 = filter;
            } else {
                vm.savedJobHistoryFilter.favorite = filter.name;
                //vm.savedJobHistoryFilter.selected = filter.name;
                vm.historyFilters.task.selectedView = true;
                vm.historyFilterObj.job = vm.savedJobHistoryFilter;
                //selectedFiltered2 = filter;
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

            JobChainService.tree({
                jobschedulerId: vm.schedulerIds.selected,
                compact: true,
                types: ['JOBCHAIN']
            }).then(function (res) {
                vm.tree = res.folders;
            }, function (err) {

            });

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

        vm.object.paths = [];
        var watcher6 = $scope.$watchCollection('object.paths', function (newNames) {
            if (newNames && newNames.length > 0) {
                vm.paths = newNames;
            }
        });

        vm.addJobChainPaths = function () {
            vm.historyFilter.paths = vm.paths;
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

        function contextmenu() {
            vm.menuOptions = [
                [gettextCatalog.getString('button.editIgnoreList'), function () {
                    vm.editIgnoreList();
                }],
                [gettextCatalog.getString('button.disableIgnoreList'), function () {
                    vm.enableDisableIgnoreList(false);
                }, vm.savedIgnoreList.isEnable],
                [gettextCatalog.getString('button.enableIgnoreList'), function () {
                    vm.enableDisableIgnoreList(true);
                }, vm.savedIgnoreList.isEnable],
                [gettextCatalog.getString('button.resetIgnoreList'), function () {
                    vm.resetIgnoreList();
                }]
            ];
        }

        contextmenu();

        vm.addToIgnorelist = function () {

            if (vm.historyFilters.type == 'jobChain') {
                angular.forEach(vm.object.historys, function (res) {
                    if (vm.savedIgnoreList.orders.indexOf(res.orderId) === -1) {
                        vm.savedIgnoreList.orders.push(res.orderId);
                    }
                });

                filterData();
            } else {
                angular.forEach(vm.object.jobHistorys, function (res) {

                    if (vm.savedIgnoreList.jobs.indexOf(res.jobs) === -1) {
                        vm.savedIgnoreList.jobs.push(res.job);
                    }

                });
                filterJobData();
            }
            SavedFilter.setIgnoreList(vm.savedIgnoreList);
            SavedFilter.save();
        };


        vm.addOrderToIgnoreList = function (name) {
            vm.savedIgnoreList.orders.push(name);
            SavedFilter.setIgnoreList(vm.savedIgnoreList);
            SavedFilter.save();
            checkIgnoreList();
        };

        vm.addJobChainToIgnoreList = function (name) {
            vm.savedIgnoreList.jobChains.push(name);
            SavedFilter.setIgnoreList(vm.savedIgnoreList);
            SavedFilter.save();
            checkIgnoreList();
        };

        vm.addJobToIgnoreList = function (name) {
            vm.savedIgnoreList.jobs.push(name);
            SavedFilter.setIgnoreList(vm.savedIgnoreList);
            SavedFilter.save();
            checkJobIgnorelist();
        };

        vm.editIgnoreList = function () {
            if (vm.savedIgnoreList.jobChains.length > 0 || vm.savedIgnoreList.jobs.length > 0 || vm.savedIgnoreList.orders.length > 0) {
                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/edit-ignorelist-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {

                }, function () {

                });
            } else {
                toasty.warning({
                    title: 'Ignore list is empty!',
                    msg: ''
                });
            }
        };


        vm.removeOrderIgnoreList = function (name) {
            vm.savedIgnoreList.orders.splice(vm.savedIgnoreList.orders.indexOf(name), 1);
            SavedFilter.setIgnoreList(vm.savedIgnoreList);
            SavedFilter.save();
            filterData();
        };
        vm.removeJobChainIgnoreList = function (name) {
            vm.savedIgnoreList.jobChains.splice(vm.savedIgnoreList.jobChains.indexOf(name), 1);
            SavedFilter.setIgnoreList(vm.savedIgnoreList);
            SavedFilter.save();
            filterData();
        };
        vm.removeJobIgnoreList = function (name) {
            vm.savedIgnoreList.jobs.splice(vm.savedIgnoreList.jobs.indexOf(name), 1);
            SavedFilter.setIgnoreList(vm.savedIgnoreList);
            SavedFilter.save();
            filterJobData();
        };

        vm.resetIgnoreList = function () {
            vm.savedIgnoreList = {};
            vm.savedIgnoreList.isEnable = false;
            SavedFilter.setIgnoreList(vm.savedIgnoreList);
            SavedFilter.save();
            if (vm.historyFilters.type == 'jobChain') {
                filterData();
            } else {
                filterJobData();
            }
        };

        vm.enableDisableIgnoreList = function (isEnable) {
            vm.savedIgnoreList.isEnable = isEnable;
            SavedFilter.setIgnoreList(vm.savedIgnoreList);
            SavedFilter.save();
            contextmenu();
            if (vm.historyFilters.type == 'jobChain') {
                filterData();
            } else {
                filterJobData();
            }
        };
        var int = '';
        var int1 = '';
        vm.$on('event-started', function () {
            if (vm.events && vm.events[0] && vm.events[0].eventSnapshots) {
                for (var i = 0; i <= vm.events[0].eventSnapshots.length - 1; i++) {
                    if (vm.events[0].eventSnapshots[i].eventType == 'OrderFinished' && vm.historyFilters.type == 'jobChain') {
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
                            OrderService.histories(filter).then(function (res) {
                                vm.historys = res.history;
                                filterData();
                            });

                            $timeout.cancel(int);
                        }, 5000);
                        break;
                    } else if (vm.events[0].eventSnapshots[i].eventType == 'TaskClosed' && vm.historyFilters.type == 'job') {
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
                            TaskService.histories(filter).then(function (res) {
                                vm.jobHistorys = res.history;
                                filterJobData();
                            });

                            $timeout.cancel(int1);
                        }, 5000);
                        break;
                    }
                }
            }
        });

        $scope.$on('$destroy', function () {
            watcher6();
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
