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

    JobChainOrdersCtrl.$inject = ["$scope", "$rootScope", "SOSAuth", "OrderService", "CoreService"];
    function JobChainOrdersCtrl($scope, $rootScope, SOSAuth, OrderService, CoreService) {
        var vm = $scope;

        $rootScope.overview = false;

        vm.filter.sortBy = "orderId";

        vm.orders = [];
        if (SOSAuth.jobChain) {
            vm.isLoading = false;

            vm.jobChain = JSON.parse(SOSAuth.jobChain);
            OrderService.getJobOrdersP(vm.jobChain.path, $scope.schedulerIds.selected).then(function (result) {

                OrderService.getJobOrders(vm.jobChain.path, $scope.schedulerIds.selected).then(function (res) {
                    var data = [];
                    vm.temp = angular.merge(result.orders, res.orders);
                    angular.forEach(vm.temp, function (value) {
                        if (value.jobChain === vm.jobChain.path) {
                            value.path1 = value.path.substring(0, value.path.lastIndexOf('/'));
                            data.push(value);
                        }
                    });
                    vm.orders = data;

                    vm.isLoading = true;
                });
            }, function () {
                vm.isLoading = true;
                vm.isError = true;
            });
        }

        $scope.$on("orderState", function (evt, state) {

            var data = [];
            angular.forEach(vm.temp, function (value) {
                if (value.processingState._text.toLowerCase() === state || state === 'all')
                    data.push(value);
            });
            vm.orders = data;

        });

        vm.showLeftPanel = function () {
            CoreService.setSideView(false);
            $('#rightPanel').removeClass('fade-in m-l-0');
            $('#leftPanel').show();
            $('.sidebar-btn').hide();
        };

        vm.showPanel = '';
        vm.showPanelFuc = function (value) {
            vm.showPanel = value;
            vm.hidePanel = !vm.hidePanel;
        };
        vm.hidePanelFuc = function () {
            vm.showPanel = '';
            vm.hidePanel = !vm.hidePanel;
        };
    }

    JobChainOverviewCtrl.$inject = ["$scope", "$rootScope", "OrderService", "SOSAuth", "JobChainService", "JobService", "$timeout", "toasty", "$interval", "orderByFilter", "$state", "$uibModal", "DailyPlanService"];
    function JobChainOverviewCtrl($scope, $rootScope, OrderService, SOSAuth, JobChainService, JobService, $timeout, toasty, $interval, orderBy, $state, $uibModal, DailyPlanService) {

        var vm = $scope;
        $rootScope.overview = true;
        vm.pageView = 'list';
        vm.showErrorNodes = true;
        vm.fitToScreen = false;
        vm.selectedNodes = [];
        vm.allOrdersCheck = {};
        vm.allOrdersCheck.orders = [];
        vm.obj = {};
        vm.obj.orders = [];
        var promise1, promise2;


        vm.onAdd = function (item) {
            promise1 = $timeout(function () {
                vm.selectedNodes.push(item);

                vm.isStopped = false;
                vm.isStoppedJob = false;
                angular.forEach(vm.selectedNodes, function (value) {
                    console.log(value.state);
                    if (value.state && value.state._text.toLowerCase() == 'stopped') {
                        vm.isStopped = true;
                    }
                    if (value.job.state && value.job.state._text.toLowerCase() == 'stopped') {
                        vm.isStoppedJob = true;
                    }
                });


            }, 50);
        };

        vm.reset = function () {
            vm.object.nodes = [];
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

        vm.getJobChainConfiguration = function () {
            OrderService.getConfiguration($scope.schedulerIds.selected).then(function (res) {
                res.configuration.content.xml = res.configuration.content.xml.replace(/&lt;/g, '<');
                var data = res.configuration.content.xml.replace(/&gt;/g, '>');
                data = data.replace(/<(\w+)\s*(.*)\/>/g, "<$1 $2></$1>");
                console.log("Corrected data " + data);
                //data = '<job_chain_node  state="inventory" job="Inventory" next_state="success" error_state="error"/>' ;
                var jsonObject = xml2json.parser(data);
                console.log("Parsed result " + JSON.stringify(jsonObject));
            }, function (err) {

            })
        };


        var isAllowed = function (status, item, callback) {
            var allowed = true;
            angular.forEach(vm.selectedNodes, function (node, index) {
                if (item == 'job' && node.state._text.toLowerCase() == status) {
                    allowed = false;
                } else if (item == 'node' && node.job.state._text.toLowerCase() == status) {
                    allowed = false;
                }
                if (index == vm.selectedNodes.length - 1) {
                    callback(allowed);
                }
            })
        };

        vm.stopJobs = function () {
            isAllowed('stopped', 'job', function (allowed) {
                if (!allowed) {
                    toasty.warning({
                        title: 'Not allowed!',
                        msg: ''
                    });
                }

                angular.forEach(vm.selectedNodes, function (node) {
                    JobService.stop([{job: node.job.path}]).then(function (res) {

                    }, function (err) {

                    })
                })
            });
            vm.selectedNodes = [];
        };

        vm.unstopJobs = function () {
            isAllowed('stopped', 'job', function (allowed) {
                if (!allowed) {
                    toasty.warning({
                        title: 'Not allowed!',
                        msg: ''
                    });
                }

                angular.forEach(vm.selectedNodes, function (node) {
                    JobService.unstop([{job: node.job.path}]).then(function (res) {

                    }, function (err) {

                    })
                })


            });
            vm.selectedNodes = [];
        };

        vm.skipNodes = function () {
            isAllowed('stopped', 'job', function (allowed) {
                if (!allowed) {
                    toasty.warning({
                        title: 'Not allowed!',
                        msg: ''
                    });
                }

                angular.forEach(vm.selectedNodes, function (node) {
                    JobService.skipNode([{jobChain: vm.jobChain.path, node: node.name}]).then(function (res) {

                    }, function (err) {

                    })
                })


            });
            vm.selectedNodes = [];
        };

        vm.stopNodes = function () {
            isAllowed('stopped', 'job', function (allowed) {
                if (!allowed) {
                    toasty.warning({
                        title: 'Not allowed!',
                        msg: ''
                    });
                }
                angular.forEach(vm.selectedNodes, function (node) {
                    JobService.stopNode([{jobChain: vm.jobChain.path, node: node.name}]).then(function (res) {

                    }, function (err) {

                    })
                })
            });
            vm.selectedNodes = [];
        };

        vm.unskipNodes = function () {
            isAllowed('stopped', 'job', function (allowed) {
                if (!allowed) {
                    toasty.warning({
                        title: 'Not allowed!',
                        msg: ''
                    });
                }

                angular.forEach(vm.selectedNodes, function (node) {
                    JobService.activateNode([{jobChain: vm.jobChain.path, node: node.name}]).then(function (res) {

                    }, function (err) {

                    })
                })
            });
            vm.selectedNodes = [];
        };

        var splitRegex = new RegExp('(.+):(.+)');

        var parentRegex = '';

        vm.totalNodes;
        vm.uniqueNode;
        vm.totalSubNodes;

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
            // console.log("Padding for " + job.name + " is " + padding);
            return padding;
        }

        if (SOSAuth.jobChain) {
            vm.isLoading = false;
            vm.totalNodes = 0;
            vm.totalSubNodes = 0;

            vm.jobChain = JSON.parse(SOSAuth.jobChain);
            console.log("Job Chain " + JSON.stringify(vm.jobChain));
            angular.forEach(vm.jobChain.nodes, function (node) {
                if (vm.jobChain.nodes[0]) {
                    vm.jobChain.nodes[0].padding = 0;
                }
                getPadding(node);
                showOrders();
            });
            if (vm.totalSubNodes > 0) {
                vm.totalLineWidth = vm.totalNodes + vm.totalSubNodes;
            } else {
                vm.totalLineWidth = vm.totalNodes;
            }
        }

        vm.getJobInfo = getJobInfo;
        function getJobInfo(getJobInfo) {
            return JobService.getJobP(getJobInfo);
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
            vm.selectedNodes = [];
            if (action == 'stop node') {
                return JobService.stopNode([{jobChain: path, node: node}]);
            } else if (action == 'skip') {
                return JobService.skipNode([{jobChain: path, node: node}]);
            } else if (action == 'unstop node' || action == 'unskip') {
                return JobService.activateNode([{jobChain: path, node: node}]);
            } else if (action == 'stop job') {
                return JobService.stop([{job: path}]);
            } else if (action == 'unstop job') {
                return JobService.unstop([{job: path}]);
            }

        }

        vm.stopNode = function (data) {
            console.log(data)
            JobService.stopNode([{jobChain: data.path, node: data.node}]).then(function (res) {
                console.log(data);
                data.state._text = 'STOPPED';
                data.state.severity = 2;
            });
        };
        vm.skipNode = function (data) {
            console.log(data)
            JobService.skipNode([{jobChain: data.path, node: data.node}]).then(function (res) {
                data.state._text = 'SKIPPED';
                data.state.severity = 2;
            });
        };
        vm.unskipNode = function (data) {
            console.log(data)
            JobService.activateNode([{jobChain: data.path, node: data.node}]).then(function (res) {
                data.state._text = 'ACTIVE';
                data.state.severity = 2;
            });
        };
        vm.stopJob = function (data) {
            console.log(data)
            JobService.stop([{job: data.path}]).then(function (res) {
                data.job.state._text = 'STOPPED';
                data.job.state.severity = 2;
            });
        };
        vm.unstopJob = function (data) {
            console.log(data)
            JobService.unstop([{job: data.path}]).then(function (res) {
                data.job.state._text = 'ACTIVE';
                data.job.state.severity = 2;
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

        vm.object = {};
        vm.allCheck = {
            checkbox: false
        };


        var watcher1 = vm.$watchCollection('object.nodes', function (newNames) {
            if (newNames && newNames.length > 0) {
                vm.allCheck.checkbox = newNames.length == vm.jobChain.nodes.length;

                vm.isStopped = false;
                vm.isStoppedJob = false;
                vm.isUnStoppedJob = false;
                vm.isSkippedNode = false;
                vm.isUnSkippedNode = false;

                angular.forEach(newNames, function (value) {
                    console.log(value)
                    if (value.state && value.state._text.toLowerCase() == 'stopped') {
                        vm.isStopped = true;
                    }
                    if (value.job.state && value.job.state._text.toLowerCase() == 'stopped') {
                        vm.isStoppedJob = true;
                    }
                    if (value.job.state && value.job.state._text.toLowerCase() != 'stopped') {
                        vm.isUnStoppedJob = true;
                    }
                    if (value.state && value.state._text.toLowerCase() == 'skipped') {
                        vm.isSkippedNode = true;
                    }
                    if (value.state && value.state._text.toLowerCase() != 'skipped') {
                        vm.isUnSkippedNode = true;
                    }
                });


            } else {
                vm.allCheck.checkbox = false;
            }


            vm.selectedNodes = vm.object.nodes;
        });

        var watcher2 = vm.$watchCollection('filtered', function (newNames) {
            if (newNames)
                vm.object.nodes = [];
        });

        var watcher3 = vm.$watchCollection('obj.orders', function (newNames) {
            console.log("Watcher " + vm.obj.orders.length);
            if (newNames && newNames.length > 0) {
                vm.allCheck.orders = newNames.length == vm.jobChain.nodes.length;
            } else {
                vm.allCheck.orders = false;
            }
        });


        vm.checkAll = function () {
            if (vm.allCheck.checkbox) {

                vm.object.nodes = vm.jobChain.nodes;
            } else {
                vm.object.nodes = [];
            }

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
            watcher2();
            if (promise1)
                $timeout.cancel(promise1);
            if (promise2)
                $timeout.cancel(promise2);
        });

        vm.getOrders = getOrders;
        function getOrders(filter) {

            return OrderService.get(filter);
        }

        vm.getJobChainOrders = getOrders;
/*     function getOrders(filter) {
            return OrderService.get(filter);
        }*/

        function showOrders() {
            var filter = {};
            filter.jobChain = [];
            filter.jobChain[0] = vm.jobChain.path;
            OrderService.get(filter).then(function (res) {
                res.orders = orderBy(res.orders, '+processingState._text', false, function (v1, v2) {
                    if (v1.value == 'RUNNING') {
                        return -1;
                    } else if (v1.value > v2.value) {
                        return -1;
                    }
                    return 1;
                });

                vm.orders = res.orders;

                angular.forEach(vm.jobChain.nodes, function (node, index) {
                    node.orders = [];
                });

                angular.forEach(vm.jobChain.nodes, function (node, index) {
                    angular.forEach(res.orders, function (order, index) {
                        if (order.state == node.name) {
                            node.orders.push(order);
                        }
                    })
                })
            }, function (err) {

            });
        }

        var jobNumber = -1;
        var orders;

        $rootScope.$on('OrderAdded', function (event, args) {
            startSimulating(args.orderId);
        });


        function startSimulating(orderId) {

            var promise = $interval(function () {
                OrderService.get({}).then(function (res) {
                    jobNumber++;
                    if (vm.jobChain && vm.jobChain.nodes && vm.jobChain.nodes.length > 0) {
                        if (jobNumber >= vm.jobChain.nodes.length) {
                            $interval.cancel(promise);
                            vm.getOrders = getOrders;
                        } else {

                            res.orders[0].processingState._text = 'RUNNING';
                            res.orders[0].orderId = orderId;
                            res.orders[0].state = vm.jobChain.nodes[jobNumber].name;
                            orders = res;
                            vm.getOrders = getOrdersSimulate;
                            $rootScope.$broadcast('UpdateOrderProgress');
                        }


                    }

                });
            }, 5000);


        }

        function getOrdersSimulate(filter) {

            return OrderService.getSimulated(orders);

        }

        vm.showPanel = '';
        vm.showPanelFuc = function (value) {
            vm.showPanel = value;
            vm.hidePanel = !vm.hidePanel;
        };
        vm.hidePanelFuc = function () {
            vm.showPanel = '';
            vm.hidePanel = !vm.hidePanel;
        };

        vm.isLoading1 = true;
        vm.showTaskFuc = function (order) {

            vm.isLoading1 = false;
            vm.showTaskPanel = order;
            var filter = {};
            filter.jobChain = vm.jobChain.path;
            filter.jobschedulerId = $scope.schedulerIds.selected;

            JobChainService.histories(filter).then(function (res) {
                vm.orderHistory = res;
                vm.isLoading1 = true;
            }, function () {
                vm.isLoading1 = true;
            });

        };

        vm.hideTaskPanel = function () {
            vm.showTaskPanel = undefined;
        };

        vm.viewAllHistories = function () {
            $state.go('app.history');
            JobChainService.selectedJobChain = vm.jobChain.path;
        };

        vm.startOrder = function (order) {
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
                vm.object.orders = [];
            });
        };

        vm.start = function (order) {
            var orders = {};
            orders.order = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            orders.order.push({orderId: order.orderId, jobChain: order.jobChain});

            OrderService.startOrder(orders).then(function (res) {
                order.processingState._text = 'RUNNING';
                order.processingState.severity = '0';
            }, function () {

            });
            vm.object.orders = [];
        };

        function setOrderState(order) {
            var orders = {};
            orders.order = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            orders.order.push({orderId: order.orderId, jobChain: order.jobChain, state:order.state,endState :order.endState});
            orders.state = vm.order.state;
            orders.endState = vm.order.endState;

            OrderService.setOrderState(orders).then(function (res) {
                console.log(res);
            }, function () {

            });
            vm.object.orders = [];
        }

        vm.setOrderState = function (order) {
            vm.order = angular.copy(order);
            vm._jobChain = vm.jobChain;
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/set-order-state-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                 backdrop: 'static'
            });
            modalInstance.result.then(function () {
                setOrderState(order);
            }, function () {
                vm.object.orders = [];
            });
        };

        vm.suspendOrder = function (order) {
            var orders = {};
            orders.order = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            orders.order.push({orderId: order.orderId, jobChain: order.jobChain});
            OrderService.suspendOrder(orders).then(function (res) {
                order.processingState._text = 'SUSPENDED';
                order.processingState.severity = '2';
            }, function () {

            });
            vm.object.orders = [];
        };

        vm.resumeOrder = function (order) {
            var orders = {};
            orders.order = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            orders.order.push({orderId: order.orderId, jobChain: order.jobChain});
            OrderService.resumeOrder(orders).then(function (res) {
                order.processingState._text = 'RUNNING';
                order.processingState.severity = '0';
            }, function () {

            });
            vm.object.orders = [];
        };

        vm.resumeOrderNextstate = function (order) {
            var orders = {};
            orders.order = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            orders.order.push({orderId: order.orderId, jobChain: order.jobChain});
            OrderService.resumeOrder(orders).then(function (res) {
                console.log(res);
            }, function () {

            });
            vm.object.orders = [];
        };

        function resumeOrderWithParam(order, paramObject) {
            var orders = {};
            orders.order = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            orders.order.push({orderId: order.orderId, jobChain: order.jobChain});
            orders.params.concat(paramObject.params);
            OrderService.resumeOrder(orders).then(function (res) {
                console.log(res);
            }, function () {

            });
            vm.object.orders = [];
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
                vm.object.orders = [];
            });
        };

        vm.resetOrder = function (order) {
            var orders = {};
            orders.order = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            orders.order.push({orderId: order.orderId, jobChain: order.jobChain});
            OrderService.resetOrder(orders).then(function (res) {
                order.processingState._text = 'RUNNING';
                order.processingState.severity = '0';
            }, function () {

            });
            vm.object.orders = [];
        };

        vm.removeOrder = function (order) {
            var orders = {};
            orders.order = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            orders.order.push({orderId: order.orderId, jobChain: order.jobChain});
            OrderService.removeOrder(orders).then(function (res) {
                order.processingState._text = 'REMOVED';
                order.processingState.severity = '3';
            }, function () {

            });
            vm.object.orders = [];
        };

        vm.deleteOrder = function (order) {
            var orders = {};
            orders.order = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            orders.order.push({orderId: order.orderId, jobChain: order.jobChain});
            OrderService.deleteOrder(orders).then(function (res) {
                order.processingState._text = 'DELETED';
                order.processingState.severity = '4';
            }, function () {

            });
            vm.object.orders = [];
        };

        vm.viewCalendar = function (order) {
            vm.planItems = [];
            DailyPlanService.getPlans({
                jobschedulerId: $scope.schedulerIds.selected,
                state: 'PLANNED'
            }).then(function (res) {
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
            vm.object.orders = [];
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
                console.log('>>>>');
            }, function () {

            });
            vm.object.orders = [];
        };

        vm.setHeight = setHeight;

        function setHeight() {
            if (vm.fitToScreen) {
                console.log("width :: " + $(window).innerWidth());
                var windowWidth = $(window).innerWidth();
                var totalNodsWidth = vm.totalNodes * 230;
                var totalLineWidth = vm.totalLineWidth * 52;
                var totalValue = 166 + totalNodsWidth + totalLineWidth;
                totalValue = totalValue / 100;
                windowWidth = windowWidth / totalValue;
                vm.slider.value = windowWidth;
                setFlowDigramWidth();
            } else {
                vm.slider.value = 100;
                setFlowDigramWidth();
            }
        }

        vm.$watch("fitToScreen", setHeight);

        function setFlowDigramWidth() {
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
    }

    JobChainDetailsCtrl.$inject = ["$scope", "SOSAuth", "orderByFilter", "ScheduleService", "JobChainService", "$uibModal", "OrderService", "toasty", "$rootScope", "DailyPlanService", "$location", "gettextCatalog"];
    function JobChainDetailsCtrl($scope, SOSAuth, orderBy, ScheduleService, JobChainService, $uibModal, OrderService, toasty, $rootScope, DailyPlanService, $location, gettextCatalog) {
        var vm = $scope;
        vm.filter = {};
        var object = $location.search();

        if (object.path) {
            vm.path = object.path;
            if (SOSAuth.jobChain) {
                vm.jobChain = JSON.parse(SOSAuth.jobChain);
            }
            if (!vm.jobChain) {
                JobChainService.getJobChainP({
                    jobschedulerId: $scope.schedulerIds.selected,
                    jobChain: vm.path
                }).then(function (result) {
                    JobChainService.getJobChain({
                        jobschedulerId: $scope.schedulerIds.selected,
                        jobChain: vm.path
                    }).then(function (res) {
                        vm.jobChain = angular.merge(result.jobChain, res.jobChain);
                        SOSAuth.setJobChain(JSON.stringify(vm.jobChain));
                        SOSAuth.save();
                    });
                }, function (err) {

                });
            }

        } else {
            toasty.error({
                title: gettextCatalog.getString('message.oops'),
                msg: gettextCatalog.getString('message.incorrectJobChainPath'),
                timeout: 0
            });
            vm.goBack();
        }

        $scope.$on('$stateChangeSuccess', function (event, toState) {
            vm.object = {};
            vm.isOverview = toState.url == '/overview';
        });


        vm.viewJobChainOrder = function () {
            $location.path('/jobChainDetails/orders').search({path: vm.path});
        };

        vm.viewJobChainDetail = function () {
            $location.path('/jobChainDetails/overview').search({path: vm.path});
        };

        vm.sortBy = function (propertyName) {
            vm.object.orders = [];
            vm.reverse = (propertyName !== null && vm.propertyName === propertyName) ? !vm.reverse : false;
            vm.propertyName = propertyName;
            vm.orders = orderBy(vm.orders, vm.propertyName, vm.reverse);
        };
        vm.mainSortBy2 = function (propertyName) {
            vm.object.orders = [];
            vm.sortReverse = !vm.sortReverse;
            vm.filter.sortBy = propertyName;
            vm.orders = orderBy(vm.orders, vm.filter.sortBy, vm.sortReverse);
        };


        vm.viewCalendar = function () {
            vm._jobChain = vm.jobChain;
            vm.planItems = [];
            DailyPlanService.getPlans({
                jobschedulerId: $scope.schedulerIds.selected,
                state: 'PLANNED'
            }).then(function (res) {
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
                console.log('>>>>');
            }, function () {
            });
        }

        function addOrder(order, paramObject) {
            var orders = {};
            orders.jobschedulerId = $scope.schedulerIds.selected;
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

            if (paramObject.length > 0) {
                orders.params = paramObject;
            }
            OrderService.addOrder(orders).then(function (res) {
                toasty.success = {
                    'title': gettextCatalog.getString('message.addOrderSuccessfully')
                }
            }, function (err) {

            });
            vm.object.orders = [];
            $rootScope.$broadcast('OrderAdded', {orderId: order.orderId});
        }

        vm.addOrder = function () {
            ScheduleService.getSchedulesP({
                jobschedulerId: $scope.schedulerIds.selected,
                compact: true
            }).then(function (res) {
                vm.schedules = res.schedules;
            });

            vm._jobChain = vm.jobChain;
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
                vm.jobChain.state._text = 'STOPPED';
                vm.jobChain.state.severity = 2;
            }, function (err) {

            });
            vm.object.jobChains = [];
        };
        vm.unstopJob = function () {
            var jobChains = {};
            jobChains.jobChains = [];
            jobChains.jobschedulerId = $scope.schedulerIds.selected;
            jobChains.jobChains.push({jobChain: vm.jobChain.path});
            JobChainService.unstop(jobChains).then(function (res) {
                vm.jobChain.state._text = 'RUNNING';
                vm.jobChain.state.severity = 0;
            }, function (err) {

            });
            vm.object.jobChains = [];
        };

        /** --------action ------------ **/

        vm.deleteAllOrder = function () {

            var orders = {};
            orders.order = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;

            angular.forEach(vm.object.orders, function (value) {
                orders.order.push({orderId: value.orderId, jobChain: value.jobChain});
            });

            OrderService.deleteOrder(orders).then(function (res) {
                console.log(res);
            }, function () {

            });
            vm.object.orders = [];
        };

        vm.suspendAllOrder = function () {
            var orders = {};
            orders.order = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            angular.forEach(vm.object.orders, function (value) {
                orders.order.push({orderId: value.orderId, jobChain: value.jobChain});
            });
            OrderService.suspendOrder(orders).then(function (res) {
                angular.forEach(vm.object.orders, function (order) {
                    order.processingState._text = 'SUSPENDED';
                    order.processingState.severity = '2';
                });
                vm.object.orders = [];
            }, function () {

            });

        };

        vm.resetAllOrder = function () {
            var orders = {};
            orders.order = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            angular.forEach(vm.object.orders, function (value) {
                orders.order.push({orderId: value.orderId, jobChain: value.jobChain});
            });
            OrderService.resetOrder(orders).then(function (res) {
                angular.forEach(vm.object.orders, function (order) {
                    order.processingState._text = 'RUNNING';
                    order.processingState.severity = '0';

                });
                vm.object.orders = [];
            }, function () {

            });

        };

        vm.startAllOrder = function () {
            var orders = {};
            orders.order = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            angular.forEach(vm.object.orders, function (value) {
                orders.order.push({orderId: value.orderId, jobChain: value.jobChain});
            });

            OrderService.startOrder(orders).then(function (res) {
                angular.forEach(vm.object.orders, function (order) {
                    order.processingState._text = 'RUNNING';
                    order.processingState.severity = '0';
                });
                vm.object.orders = [];
            }, function () {

            });

        };
    }

    OrderCtrl.$inject = ["$scope", "$rootScope", "OrderService", "orderByFilter", "$uibModal", "SavedFilter", "toasty", "gettextCatalog", "FileSaver", "Blob",
        "$interval", "$timeout"];
    function OrderCtrl($scope, $rootScope, OrderService, orderBy, $uibModal, SavedFilter, toasty, gettextCatalog, FileSaver, Blob
        , $interval, $timeout) {
        var vm = $scope;

        vm.filter = {};
        vm.filter.state = "all";
        vm.filter.sortBy = "orderId";
        vm.isLoading = false;

        vm.object = {};

        vm.reset = function () {
            vm.object.orders = [];
        };

        vm.savedOrderFilter = JSON.parse(SavedFilter.orderFilters) || {};
        vm.savedOrderFilter.list = vm.savedOrderFilter.list || [];
        vm.savedOrderFilter.selected = vm.savedOrderFilter.favorite;

        vm.exportToExcel = function () {
            $rootScope.$broadcast('exportData');
        };


        /**--------------- sorting and pagination -------------------*/
        vm.sortBy = function (propertyName) {
            vm.object.orders = [];
            vm.reverse = (propertyName !== null && vm.propertyName === propertyName) ? !vm.reverse : false;
            vm.propertyName = propertyName;
            vm.orders = orderBy(vm.orders, vm.propertyName, vm.reverse);
        };
        vm.mainSortBy1 = function (propertyName) {
            vm.object.orders = [];
            vm.sortReverse = !vm.sortReverse;
            vm.filter.sortBy = propertyName;
            vm.orders = orderBy(vm.orders, vm.filter.sortBy, vm.sortReverse);
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

        vm.downloadLog = function () {
            var data = new Blob([vm.logs], {type: 'text/plain;charset=utf-8'});
            FileSaver.saveAs(data, 'order.log');
        };

        vm.tree = [];

        vm.expanding_property = {
            field: "name"
        };

        vm.my_tree = {};
        vm.branchs = [];

        vm.treeHandler = function (data) {
            data.folders = orderBy(data.folders, 'name');
            if (data.expanded) {
                data.orders = [];
                angular.forEach(vm.orders, function (value) {
                    if (data.path == value.path.substring(0, value.path.lastIndexOf('/'))) {
                        data.orders.push(value);
                    }
                });
                data.orders = orderBy(data.orders, vm.filter.sortBy);
                vm.branchs = [];
                vm.branchs.push(data);
            }
        };
       vm.treeHandler1 = function (data) {
            data.folders = orderBy(data.folders, 'name');
            if (data.expanded) {
                data.orders = [];
                angular.forEach(vm.orders, function (value) {
                    if (data.path == value.path.substring(0, value.path.lastIndexOf('/'))) {
                        data.orders.push(value);
                    }
                });
                data.orders = orderBy(data.orders, vm.filter.sortBy);

                if (data.orders.length > 0) {
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
                data.orders = [];
                angular.forEach(vm.orders, function (value) {
                    if (value.path == value.path.substring(0, value.path.lastIndexOf('/'))) {
                        data.orders.push(value);
                    }
                });
                data.orders = orderBy(data.orders, vm.filter.sortBy);
                if (data.orders.length > 0) {
                    vm.branchs.push(data);
                }
                angular.forEach(data.folders, function (a) {
                    a.expanded = !0;

                    a.orders = [];
                    angular.forEach(vm.orders, function (value) {
                        if (a.path == value.path.substring(0, value.path.lastIndexOf('/'))) {
                            a.orders.push(value);
                        }
                    });
                    a.orders = orderBy(a.orders, vm.filter.sortBy);

                    if (a.orders.length > 0) {
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
            data.orders = [];
            data.folders = orderBy(data.folders, 'name');
            angular.forEach(vm.orders, function (value) {

                if (data.path == value.path.substring(0, value.path.lastIndexOf('/'))) {
                    data.orders.push(value);
                }
            });
            data.orders = orderBy(data.orders, vm.filter.sortBy);
            if (data.orders.length > 0) {
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
            data.orders = [];
            angular.forEach(vm.orders, function (value) {
                if (data.path == value.path.substring(0, value.path.lastIndexOf('/'))) {
                    data.orders.push(value);
                }
            });
            data.orders = orderBy(data.orders, vm.filter.sortBy);
            if (data.orders.length > 0) {
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


        OrderService.tree({
            jobschedulerId: vm.schedulerIds.selected,
            compact: true,
            types: ['ORDER']
        }).then(function (res) {

            if (res.folders.length > 1) {
                vm.filterTree = res.folders;
            } else {
                vm.filterTree = res.folders[0].folders;
            }
            vm.filterTree = orderBy(vm.filterTree, 'name');
            if (vm.savedOrderFilter.list.length > 0) {
                filterTreeData();
            } else {
                vm.tree = angular.copy(vm.filterTree);
            }
            vm.calculateHeight();
            //vm.isLoading = true;
        }, function (err) {

        });


        vm.init = function () {
            OrderService.getOrdersP({
                jobschedulerId: $scope.schedulerIds.selected,
                compact: true
            }).then(function (result) {
                vm.orders = result.orders;
                getVolatile();
                vm.isLoading = true;

            });
        };

        vm.init();

        function getVolatile() {
            OrderService.get({jobschedulerId: $scope.schedulerIds.selected}).then(function (res) {
                vm.temp = angular.merge(vm.orders, res.orders);
                filterData();
            }, function () {
                vm.isLoading = true;
                vm.isError = true;
            });
        }

        vm.load = function () {
            filterTreeData();
            vm.object.orders = [];
            var data = [];
            if (vm.savedOrderFilter.selected) {
                filterData();
                angular.forEach(vm.orders, function (value) {
                    if (value.processingState._text.toLowerCase() == vm.filter.state || vm.filter.state == 'all')
                        data.push(value);
                });
                vm.orders = data;
            } else {
                angular.forEach(vm.temp, function (value) {
                    if (value.processingState._text.toLowerCase() == vm.filter.state || vm.filter.state == 'all')
                        data.push(value);
                });
                vm.orders = data;
            }

            filteredTreeData();
        };


        vm.showPanel = '';
        vm.showPanelFuc = function (value) {
            vm.showPanel = value;
            vm.hidePanel = !vm.hidePanel;
        };
        vm.hidePanelFuc = function () {
            vm.showPanel = '';
            vm.hidePanel = !vm.hidePanel;
        };


        function filterData() {
            angular.forEach(vm.savedOrderFilter.list, function (value) {
                if (!vm.savedOrderFilter.selected) {
                    vm.orders = vm.temp;
                }
                else if (value.name == vm.savedOrderFilter.selected) {
                    var data = [];

                    angular.forEach(vm.temp, function (res, index) {

                        var flag = true;
                        if (index == 0) {
                            res.startedAt = new Date();
                        }

                        if (value.regex && res.orderId) {
                            if (!res.orderId.match(value.regex)) {
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

                        if (flag && value.processingState && res.processingState) {

                            if (value.processingState.indexOf(res.processingState._text) === -1) {
                                flag = false;
                            }
                        }
                        if (flag && value.type && res._type) {
                            if (value.type.indexOf(res._type) === -1) {
                                flag = false;
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
                                var time = /^\s*(\d+):(\d+)\s*(am|pm)\s*to\s*(\d+):(\d+)\s*(am|pm)\s*$/i.exec(value.planned);
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

                        if (fromDate && toDate) {
                            if (fromDate > new Date(moment(res.startedAt)) && toDate < new Date(moment(res.startedAt))) {
                                flag = false;
                            }
                        }

                        if (flag)
                            data.push(res);
                    });
                    vm.orders = data;
                }

            });
        }

        function filterTreeData() {
            angular.forEach(vm.savedOrderFilter.list, function (value) {
                if (!vm.savedOrderFilter.selected) {
                    if (!vm.tree) {
                        vm.tree = angular.copy(vm.filterTree);
                    } else {
                        if (vm.tree.length != vm.filterTree.length) {
                            vm.tree = angular.copy(vm.filterTree);
                        }
                    }
                }
                else if (value.name == vm.savedOrderFilter.selected && value.paths && value.paths.length > 0) {
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
                console.log("here " + JSON.stringify(vm.orderFilter));
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
                vm.savedOrderFilter.selected = vm.orderFilter.name;
                 if(vm.savedOrderFilter.list.length==1){
                    vm.savedOrderFilter.favorite = vm.orderFilter.name;
                }
                SavedFilter.setOrder(vm.savedOrderFilter);
                SavedFilter.save();
                vm.load();
            }, function () {

            });
        };
        vm.validPlanned = true;
        vm.checkPlanned = function () {
            vm.validPlanned = true;
            if (!vm.orderFilter.planned|| /^\s*$/i.test(vm.orderFilter.planned) || /^\s*(now\s*\+)\s*(\d+)\s*$/i.test(vm.orderFilter.planned) || /^\s*(now)\s*$/i.test(vm.orderFilter.planned) || /^\s*(Today)\s*$/i.test(vm.orderFilter.planned)
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
                scope: vm,
                 backdrop: 'static'
            });
            modalInstance.result.then(function () {

            }, function () {

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

        vm.deleteFilter = function () {
            angular.forEach(vm.savedOrderFilter.list, function (value, index) {
                if (value.name == vm.orderFilter.name) {
                    toasty.success({
                        title: value.name + ' ' + gettextCatalog.getString('message.filterDeleteSuccessfully'),
                        msg: ''
                    });
                    vm.savedOrderFilter.list.splice(index, 1);
                }
            });
            if (vm.savedOrderFilter.list.length == 0) {
                vm.savedOrderFilter = {};
            }else if (vm.savedOrderFilter.selected == vm.orderFilter.name) {
                vm.savedOrderFilter.selected = undefined;
            }
            SavedFilter.setOrder(vm.savedOrderFilter);
            SavedFilter.save();
            vm.load();
        };

        vm.favorite = function(filter) {
            vm.savedOrderFilter.favorite = filter;
            vm.savedOrderFilter.selected = filter;
            SavedFilter.setOrder(vm.savedOrderFilter);
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
        var watcher = $scope.$watchCollection('object.paths', function (newNames) {
            if (newNames && newNames.length > 0) {
                vm.paths= newNames;
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
            vm.savedOrderFilter.selected = filter;
            SavedFilter.setOrder(vm.savedOrderFilter);
            SavedFilter.save();
            vm.load();

        };

        /** --------action ------------ **/

        vm.deleteAllOrder = function () {
            var orders = {};
            orders.order = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;

            angular.forEach(vm.object.orders, function (value) {
                orders.order.push({orderId: value.orderId, jobChain: value.jobChain});
            });

            OrderService.deleteOrder(orders).then(function (res) {
                console.log(res);
            }, function () {

            });
            vm.object.orders = [];
        };

        vm.suspendAllOrder = function () {
            var orders = {};
            orders.order = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            angular.forEach(vm.object.orders, function (value) {
                orders.order.push({orderId: value.orderId, jobChain: value.jobChain});
            });
            OrderService.suspendOrder(orders).then(function (res) {
                angular.forEach(vm.object.orders, function (order) {
                    order.processingState._text = 'SUSPENDED';
                    order.processingState.severity = '2';

                });
                vm.object.orders = [];

            }, function () {

            });

        };
        vm.resetAllOrder = function () {
            var orders = {};
            orders.order = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            angular.forEach(vm.object.orders, function (value) {
                orders.order.push({orderId: value.orderId, jobChain: value.jobChain});
            });
            OrderService.resetOrder(orders).then(function (res) {
                angular.forEach(vm.object.orders, function (order) {
                    order.processingState._text = 'RUNNING';
                    order.processingState.severity = '0';

                });
                vm.object.orders = [];
            }, function () {

            });

        };
        vm.startAllOrder = function () {
            var orders = {};
            orders.order = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            angular.forEach(vm.object.orders, function (value) {
                orders.order.push({orderId: value.orderId, jobChain: value.jobChain});
            });

            OrderService.startOrder(orders).then(function (res) {
                angular.forEach(vm.object.orders, function (order) {
                    order.processingState._text = 'RUNNING';
                    order.processingState.severity = '0';

                });
                vm.object.orders = [];
            }, function () {

            });

        };


        startPolling();

        function startPolling() {
            if ($rootScope.config.orders.polling) {
                poll();
            }
        }

        var interval;

        function poll() {
            interval = $interval(function () {
                if (vm.pageView == 'list') {
                    getVolatile();
                } else {

                }
            }, $rootScope.config.orders.interval * 1000)
        }

        $scope.$on('$destroy', function () {
            watcher();
            if (interval)
                $interval.cancel(interval);

        });

    }

    OrderOverviewCtrl.$inject = ["$scope", "OrderService", "$stateParams", "orderByFilter", "$uibModal", "SavedFilter", "toasty", "FileSaver"];
    function OrderOverviewCtrl($scope, OrderService, $stateParams, orderBy, $uibModal, SavedFilter, toasty, FileSaver) {
        var vm = $scope;

        vm.name = $stateParams.name;

        vm.filter = {};
        vm.filter.state = "all";
        vm.filter.sortBy = "orderId";
        vm.isLoading = false;

        vm.object = {};

        vm.savedOrderFilter = JSON.parse(SavedFilter.orderFilters) || {};
        vm.savedOrderFilter.list = vm.savedOrderFilter.list || [];
        vm.savedOrderFilter.selected = vm.savedOrderFilter.favorite;

        vm.exportToExcel = function () {
            $rootScope.$broadcast('exportData');
        };


        /**--------------- sorting and pagination -------------------*/
        vm.sortBy = function (propertyName) {
            vm.object.orders = [];
            vm.reverse = (propertyName !== null && vm.propertyName === propertyName) ? !vm.reverse : false;
            vm.propertyName = propertyName;
            vm.orders = orderBy(vm.orders, vm.propertyName, vm.reverse);
        };
        vm.mainSortBy1 = function (propertyName) {
            vm.object.orders = [];
            vm.sortReverse = !vm.sortReverse;
            vm.filter.sortBy = propertyName;
            vm.orders = orderBy(vm.orders, vm.filter.sortBy, vm.sortReverse);
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

        vm.downloadLog = function () {
            var data = new Blob([vm.logs], {type: 'text/plain;charset=utf-8'});
            FileSaver.saveAs(data, 'order.log');
        };

        vm.tree = [];

        vm.expanding_property = {
            field: "name"
        };

        vm.my_tree = {};
        vm.branchs = [];

        vm.treeHandler = function (data) {
            data.folders = orderBy(data.folders, 'name');
            if (data.expanded) {
                data.orders = [];
                angular.forEach(vm.orders, function (value) {
                    if (data.path == value.path.substring(0, value.path.lastIndexOf('/'))) {
                        data.orders.push(value);
                    }
                });
                data.orders = orderBy(data.orders, vm.filter.sortBy);

                //   if (data.orders.length > 0) {
                vm.branchs = [];
                vm.branchs.push(data);
                //  }
            }
        };


        vm.expandNode = function (data) {
            vm.branchs = [];
            function recursive(data) {
                data.expanded = !0;
                data.folders = orderBy(data.folders, 'name');
                data.orders = [];
                angular.forEach(vm.orders, function (value) {
                    if (value.path == value.path.substring(0, value.path.lastIndexOf('/'))) {
                        data.orders.push(value);
                    }
                });
                data.orders = orderBy(data.orders, vm.filter.sortBy);
                if (data.orders.length > 0) {
                    vm.branchs.push(data);
                }
                angular.forEach(data.folders, function (a) {
                    a.expanded = !0;

                    a.orders = [];
                    angular.forEach(vm.orders, function (value) {
                        if (a.path == value.path.substring(0, value.path.lastIndexOf('/'))) {
                            a.orders.push(value);
                        }
                    });
                    a.orders = orderBy(a.orders, vm.filter.sortBy);

                    if (a.orders.length > 0) {
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
            data.orders = [];
            data.folders = orderBy(data.folders, 'name');
            angular.forEach(vm.orders, function (value) {

                if (data.path == value.path.substring(0, value.path.lastIndexOf('/'))) {
                    data.orders.push(value);
                }
            });
            data.orders = orderBy(data.orders, vm.filter.sortBy);
            if (data.orders.length > 0) {
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
            data.orders = [];
            angular.forEach(vm.orders, function (value) {
                if (data.path == value.path.substring(0, value.path.lastIndexOf('/'))) {
                    data.orders.push(value);
                }
            });
            data.orders = orderBy(data.orders, vm.filter.sortBy);
            if (data.orders.length > 0) {
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


        OrderService.tree({
            jobschedulerId: vm.schedulerIds.selected,
            compact: true,
            types: ['ORDER']
        }).then(function (res) {

            if (res.folders.length > 1) {
                vm.filterTree = res.folders;
            } else {
                vm.filterTree = res.folders[0].folders;
            }
            vm.filterTree = orderBy(vm.filterTree, 'name');
            if (vm.savedOrderFilter.list.length > 0) {
                filterTreeData();
            } else {
                vm.tree = angular.copy(vm.filterTree);
            }
            vm.calculateHeight();
            //vm.isLoading = true;
        }, function (err) {

        });


        vm.init = function () {
            OrderService.getOrdersP({
                jobschedulerId: $scope.schedulerIds.selected,
                compact: true
            }).then(function (result) {
                vm.orders = result.orders;
                vm.isLoading = true;
                OrderService.get({jobschedulerId: $scope.schedulerIds.selected}).then(function (res) {
                    vm.temp = angular.merge(result.orders, res.orders);
                    filterData();
                }, function () {
                    vm.isLoading = true;
                    vm.isError = true;
                });
            });
        };

        vm.init();


        vm.load = function () {
            filterTreeData();
            vm.object.orders = [];
            var data = [];
            if (vm.savedOrderFilter.selected) {
                filterData();
                angular.forEach(vm.orders, function (value) {
                    if (value.processingState._text.toLowerCase() == vm.filter.state || vm.filter.state == 'all')
                        data.push(value);
                });
                vm.orders = data;
            } else {
                angular.forEach(vm.temp, function (value) {
                    if (value.processingState._text.toLowerCase() == vm.filter.state || vm.filter.state == 'all')
                        data.push(value);
                });
                vm.orders = data;
            }

            filteredTreeData();
        };


        vm.filter.state = $stateParams.name;


        vm.showPanel = '';
        vm.showPanelFuc = function (value) {
            vm.showPanel = value;
            vm.hidePanel = !vm.hidePanel;
        };
        vm.hidePanelFuc = function () {
            vm.showPanel = '';
            vm.hidePanel = !vm.hidePanel;
        };


        function filterData() {
            angular.forEach(vm.savedOrderFilter.list, function (value) {
                if (!vm.savedOrderFilter.selected) {
                    var data = [];
                    angular.forEach(vm.temp, function (value) {
                        if (value.processingState._text.toLowerCase() == vm.filter.state || vm.filter.state == 'all')
                            data.push(value);
                    });
                    vm.orders = data;
                }
                else if (value.name == vm.savedOrderFilter.selected) {
                    var data = [];
                    angular.forEach(vm.temp, function (res) {

                        var flag = true;
                        if (value.regex && res.orderId) {
                            if (!res.orderId.match(value.regex)) {
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

                        if (flag && value.processingState && res.processingState) {
                            if (value.processingState.indexOf(res.processingState._text) === -1) {
                                flag = false;
                            }
                        }
                        if (flag && value.type && res._type) {
                            if (value.type.indexOf(res._type) === -1) {
                                flag = false;
                            }
                        }

                        if (flag)
                            data.push(res);
                    });
                    vm.orders = data;
                }

            });
        }

        function filterTreeData() {
            angular.forEach(vm.savedOrderFilter.list, function (value) {
                if (!vm.savedOrderFilter.selected) {
                    if (!vm.tree) {
                        vm.tree = angular.copy(vm.filterTree);
                    } else {
                        if (vm.tree.length != vm.filterTree.length) {
                            vm.tree = angular.copy(vm.filterTree);
                        }
                    }
                }
                else if (value.name == vm.savedOrderFilter.selected && value.paths && value.paths.length > 0) {
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
            vm.orderFilter = {};
            vm.isUnique = true;
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/order-filter-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                 backdrop: 'static'
            });
            modalInstance.result.then(function () {
                vm.savedOrderFilter.list.push(vm.orderFilter);
                vm.savedOrderFilter.selected = vm.orderFilter.name;
                if(vm.savedOrderFilter.list.length==1){
                    vm.savedOrderFilter.favorite = vm.orderFilter.name;
                }
                SavedFilter.setOrder(vm.savedOrderFilter);
                SavedFilter.save();
                vm.load();
            }, function () {

            });
        };

        vm.editFilters = function () {
            vm.filters = vm.savedOrderFilter;
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

        vm.deleteFilter = function () {
            angular.forEach(vm.savedOrderFilter.list, function (value, index) {
                if (value.name == vm.orderFilter.name) {
                    toasty.success({
                        title: value.name + ' ' + gettextCatalog.getString('message.filterDeleteSuccessfully'),
                        msg: ''
                    });
                    vm.savedOrderFilter.list.splice(index, 1);
                }
            });
            if (vm.savedOrderFilter.list.length == 0) {
                vm.savedOrderFilter = {};
            }else if (vm.savedOrderFilter.selected == vm.orderFilter.name) {
                vm.savedOrderFilter.selected = undefined;
            }
            SavedFilter.setOrder(vm.savedOrderFilter);
            SavedFilter.save();
            vm.load();
        };

        vm.favorite = function(filter) {
            vm.savedOrderFilter.favorite = filter;
            vm.savedOrderFilter.selected = filter;
            SavedFilter.setOrder(vm.savedOrderFilter);
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
        var watcher = $scope.$watchCollection('object.paths', function (newNames) {
            if (newNames && newNames.length > 0) {
                vm.paths= newNames;
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
            vm.savedOrderFilter.selected = filter;
            SavedFilter.setOrder(vm.savedOrderFilter);
            SavedFilter.save();
            vm.load();
        };


        /** --------action ------------ **/

        vm.deleteAllOrder = function () {

            var orders = {};
            orders.order = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;

            angular.forEach(vm.object.orders, function (value) {
                orders.order.push({orderId: value.orderId, jobChain: value.jobChain});
            });

            OrderService.deleteOrder(orders).then(function (res) {
                console.log(res);
            }, function () {

            });
            vm.object.orders = [];
        };

        vm.suspendAllOrder = function () {
            var orders = {};
            orders.order = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            angular.forEach(vm.object.orders, function (value) {
                orders.order.push({orderId: value.orderId, jobChain: value.jobChain});
            });
            OrderService.suspendOrder(orders).then(function (res) {
                angular.forEach(vm.object.orders, function (order) {
                    order.processingState._text = 'SUSPENDED';
                    order.processingState.severity = '2';

                });
                vm.object.orders = [];
            }, function () {

            });

        };

        vm.resetAllOrder = function () {
            var orders = {};
            orders.order = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            angular.forEach(vm.object.orders, function (value) {
                orders.order.push({orderId: value.orderId, jobChain: value.jobChain});
            });
            OrderService.resetOrder(orders).then(function (res) {
                angular.forEach(vm.object.orders, function (order) {
                    order.processingState._text = 'RUNNING';
                    order.processingState.severity = '0';

                });
                vm.object.orders = [];
            }, function () {

            });

        };

        vm.startAllOrder = function () {
            var orders = {};
            orders.order = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            angular.forEach(vm.object.orders, function (value) {
                orders.order.push({orderId: value.orderId, jobChain: value.jobChain});
            });

            OrderService.startOrder(orders).then(function (res) {

                angular.forEach(vm.object.orders, function (order) {
                    order.processingState._text = 'RUNNING';
                    order.processingState.severity = '0';

                });
                vm.object.orders = [];

            }, function () {

            });

        };

        $scope.$on('$destroy', function () {
            watcher();

        });

    }


    OrderFunctionCtrl.$inject = ["$scope", "$rootScope", "OrderService", "$uibModal", "ScheduleService", 'toasty', '$timeout', "DailyPlanService", "JobChainService"];
    function OrderFunctionCtrl($scope, $rootScope, OrderService, $uibModal, ScheduleService, toasty, $timeout, DailyPlanService, JobChainService) {
        var vm = $scope;

        vm.pageSize = 10;
        vm.currentPage = 1;

        vm.calendarView = 'month';
        vm.viewDate = new Date();
        vm.events = [];
        vm.isCellOpen = true;
        var promise1;


        /**--------------- Checkbox functions -------------*/
        vm.allCheck = {
            checkbox: false
        };

        var watcher1 = vm.$watchCollection('object.orders', function (newNames) {

            if (newNames && newNames.length > 0) {
                vm.allCheck.checkbox = newNames.length == vm.orders.slice((vm.pageSize * (vm.currentPage - 1)), (vm.pageSize * vm.currentPage)).length;
                $rootScope.suspendSelected = false;
                $rootScope.deletedSelected = false;
                $rootScope.runningSelected = false;
                $rootScope.resetSelected = false;
                angular.forEach(newNames, function (value) {
                    if (value.processingState) {
                        if (value.processingState._text.toLowerCase() == 'suspended' || value.processingState._text.toLowerCase() == 'blacklist') {
                            $rootScope.suspendSelected = true;
                        }
                        if (value.processingState._text.toLowerCase() != 'pending' && value.processingState._text.toLowerCase() != 'setback') {
                            $rootScope.runningSelected = true;
                        }
                        if (value.processingState._text.toLowerCase() != 'blacklist') {
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
                vm.object.orders = vm.orders.slice((vm.pageSize * (vm.currentPage - 1)), (vm.pageSize * vm.currentPage));
            } else {
                vm.object.orders = [];
            }
        };
        var watcher2 = vm.$watchCollection('filtered', function (newNames) {
            if (newNames)
                vm.object.orders = [];
        });

        var watcher3 = vm.$watch('pageSize', function (newNames) {
            if (newNames)
                vm.object.orders = [];
        });

        $scope.$on('exportData', function () {
            $('#exportToExcelBtn').attr("disabled", true);

            $('#orderTableId').table2excel({
                exclude: ".noExl",
                filename: "jobscheduler-orders",
                fileext: ".xlsx",
                exclude_img: false,
                exclude_links: false,
                exclude_inputs: false
            });

            $('#exportToExcelBtn').attr("disabled", false);
        });


        /**--------------- sorting and pagination -------------------*/
        vm.pageChange = function () {
            vm.object.orders = [];
        };


        function startAt(order, paramObject) {
            var orders = {};
            orders.orders = [];
            orders.params = order.params;
            orders.jobschedulerId = $scope.schedulerIds.selected;
            orders.orders.push({orderId: order.orderId, jobChain: order.jobChain});

            if (order.date && order.time) {
                order.date.setHours(order.time.getHours());
                order.date.setMinutes(order.time.getMinutes());
                order.date.setSeconds(order.time.getSeconds());
            }


            orders.at = moment.utc(order.date).format();
            if(!orders.params && paramObject.params.length>0) {
                orders.params = paramObject.params;
            }else if(orders.params && paramObject.params.length>0){
                 orders.params.concat(paramObject.params);
            }
            OrderService.startOrder(orders).then(function (res) {
                console.log(res);
            }, function () {

            });
            vm.object.orders = [];
        }

        vm.startOrder = function (order) {

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
                vm.object.orders = [];
            });
        };

        vm.start = function (order) {
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            orders.orders.push({orderId: order.orderId, jobChain: order.jobChain});

            OrderService.startOrder(orders).then(function (res) {
                order.processingState._text = 'RUNNING';
                order.processingState.severity = '0';
            }, function () {

            });
            vm.object.orders = [];
        };

        function setOrderState(order) {

            var orders = {};
            orders.order = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            orders.order.push({orderId: order.orderId, jobChain: order.jobChain, state:order.state,endState :order.endState});
            orders.state = vm.order.state;
            orders.endState = vm.order.endState;
            OrderService.setOrderState(orders).then(function (res) {
                console.log(res);
            }, function () {

            });
            vm.object.orders = [];
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
                vm.object.orders = [];
            });

            JobChainService.getJobChainP({
                jobschedulerId: $scope.schedulerIds.selected,
                jobChain: order.jobChain
            }).then(function (res) {

                vm._jobChain = res.jobChain
            });
        };

        /**------------------------------------------------------begin run time editor -------------------------------------------------------*/



        function setRunTime(order) {
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            orders.orders.push({orderId: order.orderId, jobChain: order.jobChain, runTime: order.runTime});

            OrderService.setRunTime(orders).then(function (res) {
                console.log(res);
            }, function (err) {
                console.log(err);
            });
            vm.object.orders = [];
        }

        vm.setRunTime = function (order) {

            OrderService.getRunTime({
                jobschedulerId: $scope.schedulerIds.selected,
                jobChain: order.jobChain,
                orderId: order.orderId
            }).then(function (res) {
                if (res.runTime) {
                    vm.runTimes = res.runTime;
                    vm.runTimes.content = vm.runTimes.content.replace(/&lt;/g, '<');
                    vm.runTimes.content = vm.runTimes.content.replace(/&gt;/g, '>');
                    vm.xml = vm.runTimes.content;
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
                vm.object.orders = [];
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
            orders.order = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            orders.order.push({orderId: order.orderId, jobChain: order.jobChain});
            OrderService.suspendOrder(orders).then(function (res) {
                order.processingState._text = 'SUSPENDED';
                order.processingState.severity = '2';
            }, function () {

            });
            vm.object.orders = [];
        };

        vm.resumeOrder = function (order) {
            var orders = {};
            orders.order = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            orders.order.push({orderId: order.orderId, jobChain: order.jobChain});
            OrderService.resumeOrder(orders).then(function (res) {
                order.processingState._text = 'RUNNING';
                order.processingState.severity = '0';
            }, function () {

            });
            vm.object.orders = [];
        };

        vm.resumeOrderNextstate = function (order) {
            var orders = {};
            orders.order = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            orders.order.push({orderId: order.orderId, jobChain: order.jobChain});
            OrderService.resumeOrder(orders).then(function (res) {
                console.log(res);
            }, function () {

            });
            vm.object.orders = [];
        };

        function resumeOrderWithParam(order, paramObject) {
            var orders = {};
            orders.order = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            orders.order.push({orderId: order.orderId, jobChain: order.jobChain});
            orders.params.concat(paramObject.params);
            OrderService.resumeOrder(orders).then(function (res) {
                console.log(res);
            }, function () {

            });
            vm.object.orders = [];
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
                vm.object.orders = [];
            });
        };

        vm.resetOrder = function (order) {
            var orders = {};
            orders.order = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            orders.order.push({orderId: order.orderId, jobChain: order.jobChain});
            OrderService.resetOrder(orders).then(function (res) {
                order.processingState._text = 'RUNNING';
                order.processingState.severity = '0';
            }, function () {

            });
            vm.object.orders = [];
        };

        vm.removeOrder = function (order) {
            var orders = {};
            orders.order = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            orders.order.push({orderId: order.orderId, jobChain: order.jobChain});
            OrderService.removeOrder(orders).then(function (res) {
                order.processingState._text = 'REMOVED';
                order.processingState.severity = '3';
            }, function () {

            });
            vm.object.orders = [];
        };

        vm.deleteOrder = function (order) {
            var orders = {};
            orders.order = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            orders.order.push({orderId: order.orderId, jobChain: order.jobChain});
            OrderService.deleteOrder(orders).then(function (res) {
                order.processingState._text = 'DELETED';
                order.processingState.severity = '4';
            }, function () {

            });
            vm.object.orders = [];
        };

        vm.viewCalendar = function (order) {
            vm._jobChain = order;
            vm._jobChain.name = order.orderId;
            vm.planItems = [];
            DailyPlanService.getPlans({
                jobschedulerId: $scope.schedulerIds.selected,
                state: 'PLANNED'
            }).then(function (res) {
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
            vm.object.orders = [];
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
                console.log('>>>>');
            }, function () {
            });
        }

        vm.isLoading1 = true;
        vm.showLogFuc = function (value) {
            if (!value.historyId) {
                vm.isLoading1 = false;
                var orders = {};
                orders.jobschedulerId = $scope.schedulerIds.selected;
                orders.jobChain = value.jobChain;
                orders.orderId = value.orderId;
                orders.historyId = value.historyId;


                OrderService.log(orders).then(function (res) {
                     var logs = JSON.parse(JSON.stringify( res));
                    logs=logs.data.substring(logs.data.indexOf("plain")+8);
                    logs = logs.substring(0,logs.indexOf("}"));
                    logs=logs.replace(/"/g,'').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/\\n/g,'<br>');
                    vm.logs = logs.split('<br>');

                    vm.showLogPanel = value;
                    vm.isLoading1 = true;
                }, function () {
                    vm.isLoading1 = true;
                    vm.isError = true;
                });
            } else {
                toasty.info({
                    title: 'Don\'t have any logs!'
                });
            }
        };
        vm.loadHistory = function () {

            var orders = {};
            orders.jobschedulerId = $scope.schedulerIds.selected;
            orders.jobChain = vm.showLogPanel.jobChain;
            orders.orderId = vm.showLogPanel.orderId;
            orders.historyId = vm.showLogPanel.historyId;

            OrderService.history(orders).then(function (res) {
                vm.historys = res.steps;
            }, function () {
                vm.isError = true;
            });
        };

        vm.showLogPanel = undefined;
        vm.hideLogPanel = function () {
            vm.showLogPanel = undefined;
        };

        $scope.$on('$destroy', function () {
            watcher1();
            watcher2();
            watcher3();
            if (promise1)
                $timeout.cancel(promise1);
        });

        vm.logClass = function(logData) {
            var logStatus = logData.substring(logData.indexOf("[")+1, logData.indexOf("]"));
            return "log_" + logStatus.toLowerCase();
        }
    }

    HistoryCtrl.$inject = ["$scope", "OrderService", "TaskService", "$uibModal", "SavedFilter", "toasty", "$timeout", "gettextCatalog", "FileSaver",
        "Blob", "JobService", "JobChainService", "$interval", "$rootScope"];
    function HistoryCtrl($scope, OrderService, TaskService, $uibModal, SavedFilter, toasty, $timeout, gettextCatalog, FileSaver,
                         Blob, JobService, JobChainService, $interval, $rootScope) {
        var vm = $scope;
        vm.isLoading = false;
        vm.filter = {};
        vm.filter.type = 'jobChain';
        vm.filter.date = 'all';

        vm.pageSize = 10;
        vm.currentPage = 1;

        vm.object = {};
        vm.tree = [];

        var promise1;

        vm.historyFilterObj = JSON.parse(SavedFilter.historyFilters) || {};

        vm.savedHistoryFilter = vm.historyFilterObj.order || {};
        vm.savedHistoryFilter.list = vm.savedHistoryFilter.list || [];
        vm.savedHistoryFilter.selected = vm.savedHistoryFilter.favorite;

        vm.savedJobHistoryFilter = vm.historyFilterObj.job || {};
        vm.savedJobHistoryFilter.list = vm.savedJobHistoryFilter.list || [];
         vm.savedJobHistoryFilter.selected = vm.savedJobHistoryFilter.favorite;

        vm.savedIgnoreList = JSON.parse(SavedFilter.ignoreList) || {};
        vm.savedIgnoreList.orders = vm.savedIgnoreList.orders || [];
        vm.savedIgnoreList.jobChains = vm.savedIgnoreList.jobChains || [];
        vm.savedIgnoreList.jobs = vm.savedIgnoreList.jobs || [];
        vm.savedIgnoreList.isEnable = vm.savedIgnoreList.isEnable || false;

        if (JobService.jobSelected) {
            vm.filter.type = 'job';
        } else {
            vm.filter.type = 'jobChain';
        }

        /**--------------- sorting and pagination -------------------*/
        vm.pageChange = function () {
            vm.object = {};
        };
        vm.sortBy = function (propertyName) {
            vm.object = {};
            vm.sortReverse = !vm.sortReverse;
            vm.filter.sortBy = propertyName;

        };

        vm.init = function (filter) {
            if (vm.filter.type == 'job') {
                jobHistory();
            } else {
                if (JobChainService.selectedJobChain) {
                    filter.jobChain = JobChainService.selectedJobChain;
                }
                OrderService.historys(filter).then(function (res) {
                    vm.temp = res.history;
                    filterData();

                    vm.isLoading = true;
                }, function () {
                    vm.isLoading = true;
                    vm.isError = true;
                });
            }

        };


        vm.init({jobschedulerId: $scope.schedulerIds.selected});

        function filterData() {
            if (vm.savedHistoryFilter.list.length > 0) {
                angular.forEach(vm.savedHistoryFilter.list, function (value) {
                    if (!vm.savedHistoryFilter.selected) {
                        vm.historys = angular.copy(vm.temp);
                    }
                    else if (value.name == vm.savedHistoryFilter.selected) {
                        var data = [];
                        angular.forEach(vm.temp, function (res) {

                            var flag = true;
                            if (value.regex && res.orderId) {
                                if (!res.orderId.match(value.regex)) {
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

                                    if (('/' + res.jobChain).indexOf(value.paths[i]) === -1) {
                                        flag = false;
                                        break;
                                    }
                                }
                            }

                            var fromDate;
                            var toDate;
                            if (flag && value.planned && res.startTime && res.endTime) {
                                if (/^\s*(now\s*\+)\s*(\d+)\s*$/i.test(value.planned)) {
                                    console.log("Matched now " + /^\s*(now\+)(\d+)\s*$/i.exec(value.planned));
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
                                }
                                else if (/^\s*(\d+):(\d+)\s*(am|pm)\s*to\s*(\d+):(\d+)\s*(am|pm)\s*$/i.test(value.planned)) {
                                    console.log("Matched time range " + /^\s*(\d+):(\d+)\s*(am|pm)\s*to\s*(\d+):(\d+)\s*(am|pm)\s*$/i.exec(value.planned));
                                    var time = /^\s*(\d+):(\d+)\s*(am|pm)\s*to\s*(\d+):(\d+)\s*(am|pm)\s*$/i.exec(value.planned)
                                    fromDate = new Date();
                                    if (/(pm)/i.test(time[3]) && parseInt(time[1]) != 12) {
                                        console.log("Found from pm");
                                        fromDate.setHours(parseInt(time[1]) + 12);
                                    } else {
                                        fromDate.setHours(parseInt(time[1]));
                                    }

                                    fromDate.setMinutes(parseInt(time[2]));
                                    toDate = new Date();
                                    if (/(pm)/i.test(time[6]) && parseInt(time[4]) != 12) {
                                        console.log("Found to pm");
                                        toDate.setHours(parseInt(time[4]) + 12);
                                    } else {
                                        toDate.setHours(parseInt(time[4]));
                                    }
                                    toDate.setMinutes(parseInt(time[5]));
                                } else {
                                    console.log("Not matched to any thing");
                                }
                            }


                            if (flag && value.fromDate && res.startTime) {
                                if (value.fromTime) {
                                    fromDate = new Date(value.fromDate);
                                    value.fromTime = new Date(value.fromTime);
                                    fromDate.setHours(value.fromTime.getHours());
                                    fromDate.setMinutes(value.fromTime.getMinutes());
                                    fromDate.setSeconds(value.fromTime.getSeconds());
                                }

                            }
                            if (flag && value.toDate && res.endTime) {
                                if (value.toTime) {
                                    toDate = new Date(value.toDate);
                                    value.toTime = new Date(value.toTime);
                                    toDate.setHours(value.toTime.getHours());
                                    toDate.setMinutes(value.toTime.getMinutes());
                                    toDate.setSeconds(value.toTime.getSeconds());
                                }


                            }
                            if (fromDate && toDate) {
                                if (fromDate > new Date(moment(res.startTime)) || toDate < new Date(moment(res.endTime))) {
                                    flag = false;
                                }
                            }

                            if (flag)
                                data.push(res);
                        });
                        vm.historys = data;
                    }

                });
            } else {
                vm.historys = angular.copy(vm.temp);
            }
            checkIgnoreList();
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

        vm.jobHistory = jobHistory;
        function jobHistory() {
            if (!vm.temp1) {
                vm.isLoading = false;
                var filter = {jobschedulerId: $scope.schedulerIds.selected};
                if (JobService.jobSelected) {
                    filter.jobs = [];
                    filter.jobs[0] = {job: JobService.jobSelected};

                }
                TaskService.historys(filter).then(function (res) {
                    vm.temp1 = res.history;
                    filterJobData();
                    vm.isLoading = true;
                }, function () {
                    vm.isLoading = true;
                    vm.isError = true;
                });
            } else {
                filterJobData();
            }
        }


        function filterJobData() {

            if (vm.savedJobHistoryFilter.list.length > 0) {
                angular.forEach(vm.savedJobHistoryFilter.list, function (value) {
                    if (!vm.savedJobHistoryFilter.selected) {
                        vm.jobHistorys = angular.copy(vm.temp1);
                    }
                    else if (value.name == vm.savedJobHistoryFilter.selected) {
                        var data = [];
                        angular.forEach(vm.temp1, function (res) {

                            var flag = true;
                            if (value.job && res.job) {
                                if (!res.job.match(value.job)) {
                                    flag = false;
                                }
                            }

                            if (flag && value.state && res.state) {
                                if (value.state.indexOf(res.state._text) === -1) {
                                    flag = false;
                                }
                            }
                             var fromDate;
                            var toDate;
                            if (flag && value.planned && res.startTime && res.endTime) {
                                if (/^\s*(now\s*\+)\s*(\d+)\s*$/i.test(value.planned)) {
                                    console.log("Matched now " + /^\s*(now\+)(\d+)\s*$/i.exec(value.planned));
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
                                }  else if (/^\s*(now)\s*$/i.test(value.planned)) {
                                    fromDate = new Date();
                                    toDate = new Date();
                                } else if (/^\s*(\d+):(\d+)\s*(am|pm)\s*to\s*(\d+):(\d+)\s*(am|pm)\s*$/i.test(value.planned)) {
                                    console.log("Matched time range " + /^\s*(\d+):(\d+)\s*(am|pm)\s*to\s*(\d+):(\d+)\s*(am|pm)\s*$/i.exec(value.planned));
                                    var time = /^\s*(\d+):(\d+)\s*(am|pm)\s*to\s*(\d+):(\d+)\s*(am|pm)\s*$/i.exec(value.planned)
                                    fromDate = new Date();
                                    if (/(pm)/i.test(time[3]) && parseInt(time[1]) != 12) {
                                        console.log("Found from pm");
                                        fromDate.setHours(parseInt(time[1]) + 12);
                                    } else {
                                        fromDate.setHours(parseInt(time[1]));
                                    }

                                    fromDate.setMinutes(parseInt(time[2]));
                                    toDate = new Date();
                                    if (/(pm)/i.test(time[6]) && parseInt(time[4]) != 12) {
                                        console.log("Found to pm");
                                        toDate.setHours(parseInt(time[4]) + 12);
                                    } else {
                                        toDate.setHours(parseInt(time[4]));
                                    }
                                    toDate.setMinutes(parseInt(time[5]));
                                } else {
                                    console.log("Not matched to any thing");
                                }
                            }


                            if (flag && value.fromDate && res.startTime) {
                                if (value.fromTime) {
                                    fromDate = new Date(value.fromDate);
                                    value.fromTime = new Date(value.fromTime);
                                    fromDate.setHours(value.fromTime.getHours());
                                    fromDate.setMinutes(value.fromTime.getMinutes());
                                    fromDate.setSeconds(value.fromTime.getSeconds());
                                }

                            }
                            if (flag && value.toDate && res.endTime) {
                                if (value.toTime) {
                                    toDate = new Date(value.toDate);
                                    value.toTime = new Date(value.toTime);
                                    toDate.setHours(value.toTime.getHours());
                                    toDate.setMinutes(value.toTime.getMinutes());
                                    toDate.setSeconds(value.toTime.getSeconds());
                                }


                            }
                            if (fromDate && toDate) {
                                if (fromDate > new Date(moment(res.startTime)) || toDate < new Date(moment(res.endTime))) {
                                    flag = false;
                                }
                            }

                            if (flag)
                                data.push(res);
                        });
                        vm.jobHistorys = data;
                    }

                });
            } else {
                vm.jobHistorys = angular.copy(vm.temp1);
            }
            checkJobIgnorelist();
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
            var date = new Date();
            if (vm.filter.date == 'lastHour') {
                date.setHours(date.getHours() - 1);
            }
            else if (vm.filter.date == 'halfDay') {
                date.setHours(date.getHours() - 12);
            }
            else if (vm.filter.date == 'fullDay') {
                date.setDate(date.getDate() - 1);
            } else {
                date.setDate(date.getDate() - 7);
            }

            var data = [];
            if (vm.filter.type == 'jobChain') {
                filterData();
                if (vm.filter.date != 'all') {
                    angular.forEach(vm.historys, function (value) {
                        var time = moment(value.startTime).diff(moment(date));
                        if (time >= 0) {
                            data.push(value);

                        }
                    });
                    vm.historys = data;
                }
            } else {
                filterJobData();
                if (vm.filter.date != 'all') {
                    angular.forEach(vm.jobHistorys, function (value) {
                        var time = moment(value.startTime).diff(moment(date));
                        if (time >= 0) {
                            data.push(value);
                        }
                    });
                    vm.jobHistorys = data;
                }
            }

        };

        vm.isLoading1 = true;
        vm.showLogFuc = function (value) {
            if (vm.filter.type == 'jobChain') {
                var orders = {};
                orders.jobschedulerId = $scope.schedulerIds.selected;
                orders.jobChain = value.jobChain;
                orders.orderId = value.orderId;
                orders.historyId = value.historyId;
                OrderService.log(orders).then(function (res) {
                    var logs = JSON.parse(JSON.stringify( res));
                    logs=logs.data.substring(logs.data.indexOf("plain")+8);
                    logs = logs.substring(0,logs.indexOf("}"));
                    logs=logs.replace(/"/g,'').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/\\n/g,'<br>');
                    vm.logs = logs.split('<br>');
                    vm.isLoading1 = false;
                }, function () {
                    vm.isError = true;
                    vm.isLoading1 = false;
                });
            } else {
                var jobs = {};
                jobs.jobschedulerId = $scope.schedulerIds.selected;
                jobs.taskId = value.taskId;
                TaskService.log(jobs).then(function (res) {
                    var logs = JSON.parse(JSON.stringify( res));
                    logs=logs.data.substring(logs.data.indexOf("plain")+8);
                    logs = logs.substring(0,logs.indexOf("}"));
                    logs=logs.replace(/"/g,'').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/\\n/g,'<br>');
                    vm.logs = logs.split('<br>');
                    vm.isLoading = true;
                }, function () {
                    vm.isError = true;
                    vm.isLoading = true;
                });
            }
            vm.showLogPanel = value;
        };

        vm.logClass = function(logData) {
            var logStatus = logData.substring(logData.indexOf("[")+1, logData.indexOf("]"));
            return "log_" + logStatus.toLowerCase();
        };

        vm.hideLogPanel = function () {
            vm.showLogPanel = undefined;
        };

        vm.showPanel = '';
        vm.showPanelFuc = function (value) {
            vm.showPanel = value;
            vm.hidePanel = !vm.hidePanel;
        };
        vm.hidePanelFuc = function () {
            vm.showPanel = '';
            vm.hidePanel = !vm.hidePanel;
        };

        vm.exportToExcel = function () {
            $('#exportToExcelBtn').attr("disabled", true);
            $('#' + vm.filter.type).table2excel({
                exclude: ".noExl",
                filename: "jobscheduler-order-history-report",
                fileext: ".xlsx",
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

        var watcher1 = $scope.$watchCollection('object.historys', function (newNames) {
            if (newNames && newNames.length > 0) {

                vm.allCheck.checkbox = newNames.length == vm.historys.slice((vm.pageSize * (vm.currentPage - 1)), (vm.pageSize * vm.currentPage)).length;
            } else {
                vm.allCheck.checkbox = false;
            }
        });

        var watcher2 = $scope.$watchCollection('object.jobHistorys', function (newNames) {
            if (newNames && newNames.length > 0) {

                vm.allCheck.checkbox = newNames.length == vm.jobHistorys.slice((vm.pageSize * (vm.currentPage - 1)), (vm.pageSize * vm.currentPage)).length;
            } else {
                vm.allCheck.checkbox = false;
            }
        });

        var watcher3 = $scope.$watchCollection('filtered', function (newNames) {
            if (newNames)
                vm.object = {};
        });

        var watcher4 = $scope.$watchCollection('jobFiltered', function (newNames) {
            if (newNames)
                vm.object = {};
        });

        var watcher5 = $scope.$watch('pageSize', function (newNames) {
            if (newNames)
                vm.object = {};
        });

        vm.checkAll = function () {
            if (vm.allCheck.checkbox) {
                if (vm.filter.type == 'jobChain') {
                    vm.object.historys = vm.historys.slice((vm.pageSize * (vm.currentPage - 1)), (vm.pageSize * vm.currentPage));
                } else
                    vm.object.jobHistorys = vm.jobHistorys.slice((vm.pageSize * (vm.currentPage - 1)), (vm.pageSize * vm.currentPage));
            } else {
                vm.object = {};
            }
        };

        vm.reset = function () {
            vm.object = {};
        };
       vm.validPlanned = true;
        vm.checkPlanned = function () {
            vm.validPlanned = true;
            if (!vm.historyFilter.planned|| /^\s*$/i.test(vm.historyFilter.planned) || /^\s*(now\s*\+)\s*(\d+)\s*$/i.test(vm.historyFilter.planned) || /^\s*(now)\s*$/i.test(vm.historyFilter.planned) || /^\s*(Today)\s*$/i.test(vm.historyFilter.planned)
                || /^\s*(\d+):(\d+)\s*(am|pm)\s*to\s*(\d+):(\d+)\s*(am|pm)\s*$/i.test(vm.historyFilter.planned)) {
            } else {
                vm.validPlanned = false;
            }
        }


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
                if (vm.filter.type == 'jobChain') {
                    vm.savedHistoryFilter.list.push(vm.historyFilter);
                    vm.savedHistoryFilter.selected = vm.historyFilter.name;

                    if (vm.savedHistoryFilter.list.length==1) {
                        vm.savedHistoryFilter.favorite = vm.historyFilter.name;
                    }
                    vm.historyFilterObj.order = vm.savedHistoryFilter;
                    filterData();

                } else {
                    vm.savedJobHistoryFilter.list.push(vm.historyFilter);
                    vm.savedJobHistoryFilter.selected = vm.historyFilter.name;

                     if (vm.savedJobHistoryFilter.list.length==1) {
                        vm.savedJobHistoryFilter.favorite = vm.historyFilter.name;
                    }
                    vm.historyFilterObj.job = vm.savedJobHistoryFilter;
                    filterJobData();
                }
                SavedFilter.setHistory(vm.historyFilterObj);
                SavedFilter.save();
            }, function () {

            });
        };


        vm.editFilters = function () {
            if (vm.filter.type == 'jobChain') {
                vm.filters = vm.savedHistoryFilter;
            } else {
                vm.filters = vm.savedJobHistoryFilter;
            }
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

                if (vm.filter.type == 'jobChain') {
                    angular.forEach(vm.savedHistoryFilter.list, function (value, index) {
                        if (value.name == filter.name) {
                            vm.savedHistoryFilter.list[index] = vm.historyFilter;
                        }
                    });
                    if (vm.savedHistoryFilter.selected == vm.filterName) {
                        vm.savedHistoryFilter.selected = vm.jobFilter.name;
                         filterData();
                    }
                    if (vm.savedHistoryFilter.favorite == vm.filterName) {
                        vm.savedHistoryFilter.favorite = vm.jobFilter.name;
                    }
                    vm.historyFilterObj.order = vm.savedHistoryFilter;



                } else {
                    angular.forEach(vm.savedJobHistoryFilter.list, function (value, index) {
                        if (value.name == filter.name) {
                            vm.savedJobHistoryFilter.list[index] = vm.historyFilter;
                        }
                    });
                     if (vm.savedJobHistoryFilter.selected == vm.filterName) {
                        vm.savedJobHistoryFilter.selected = vm.jobFilter.name;
                         filterJobData();
                    }
                    if (vm.savedJobHistoryFilter.favorite == vm.filterName) {
                        vm.savedJobHistoryFilter.favorite = vm.jobFilter.name;
                    }
                    vm.historyFilterObj.job = vm.savedJobHistoryFilter;


                }
                vm.filterName = undefined;
                SavedFilter.setHistory(vm.historyFilterObj);
                SavedFilter.save();

            }, function () {
                vm.filterName = undefined;
            });
        };

        vm.deleteFilter = function () {

            if (vm.filter.type == 'jobChain') {
                angular.forEach(vm.savedHistoryFilter.list, function (value, index) {
                    if (value.name == vm.historyFilter.name) {
                        toasty.success({
                            title: value.name + ' ' + gettextCatalog.getString('message.filterDeleteSuccessfully'),
                            msg: ''
                        });
                        vm.savedHistoryFilter.list.splice(index, 1);
                    }
                });
                if (vm.savedHistoryFilter.list.length == 0) {
                    vm.savedHistoryFilter = {};
                }else if (vm.savedHistoryFilter.selected == vm.historyFilter.name) {
                    vm.savedHistoryFilter.selected = undefined;
                }
                vm.historyFilterObj.order = vm.savedHistoryFilter;
                filterData();

            } else {
                angular.forEach(vm.savedJobHistoryFilter.list, function (value, index) {
                    if (value.name == vm.historyFilter.name) {
                        toasty.success({
                            title: value.name + ' ' + gettextCatalog.getString('message.filterDeleteSuccessfully'),
                            msg: ''
                        });
                        vm.savedJobHistoryFilter.list.splice(index, 1);
                    }
                });
                if (vm.savedJobHistoryFilter.list.length == 0) {
                    vm.savedJobHistoryFilter = {};
                }else if (vm.savedJobHistoryFilter.selected == vm.historyFilter.name) {
                    vm.savedJobHistoryFilter.selected = undefined;
                }
                vm.historyFilterObj.job = vm.savedJobHistoryFilter;
                filterJobData();
            }
            SavedFilter.setHistory(vm.historyFilterObj);
            SavedFilter.save();
        };

         vm.favorite = function(filter) {
             if (vm.filter.type == 'jobChain') {
                 vm.savedHistoryFilter.favorite = filter;
                 vm.savedHistoryFilter.selected = filter;
                 vm.historyFilterObj.order = vm.savedHistoryFilter;
                 filterData();
             } else {
                 vm.savedJobHistoryFilter.favorite = filter;
                 vm.savedJobHistoryFilter.selected = filter;
                 vm.historyFilterObj.job = vm.savedJobHistoryFilter;
                 filterJobData();
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
                compact: true
            }).then(function (res) {

                if (res.folders.length > 1) {
                    vm.tree = res.folders;
                } else {
                    vm.tree = res.folders[0].folders;
                }

            }, function (err) {

            });

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
        var watcher6 = $scope.$watchCollection('object.paths', function (newNames) {
            if (newNames && newNames.length > 0) {
                vm.paths= newNames;
            }
        });

        vm.addJobChainPaths = function () {
            vm.historyFilter.paths = vm.paths;
        };

        vm.checkFilterName = function () {
            vm.isUnique = true;
            if (vm.filter.type == 'jobChain') {
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
            if (vm.filter.type == 'jobChain') {
                vm.savedHistoryFilter.selected = filter;
                vm.historyFilterObj.order = vm.savedHistoryFilter;

                filterData();
            } else {
                vm.savedJobHistoryFilter.selected = filter;
                vm.historyFilterObj.job = vm.savedJobHistoryFilter;
                filterJobData();
            }
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

            if (vm.filter.type == 'jobChain') {
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
            if (vm.filter.type == 'jobChain') {
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
            if (vm.filter.type == 'jobChain') {
                filterData();
            } else {
                filterJobData();
            }
        };


        startPolling();

        function startPolling() {

            if ($rootScope.config.history.polling) {
                poll();
            }
        }

        var interval;

        function poll() {
            interval = $interval(function () {
                vm.init({jobschedulerId: $scope.schedulerIds.selected});
            }, $rootScope.config.history.interval * 1000)
        }

        $scope.$on('$destroy', function () {
            watcher1();
            watcher2();
            watcher3();
            watcher4();
            watcher5();
            watcher6();
            if (promise1) {
                $timeout.cancel(promise1);
            }
            if (interval)
                $interval.cancel(interval);

        });

        vm.downloadLog = function () {
            var data = new Blob([vm.logs], {type: 'text/plain;charset=utf-8'});
            FileSaver.saveAs(data, 'history.log');
        }
    }

    LogCtrl.$inject = ["$scope", "OrderService", "TaskService", "$stateParams", "$location", "FileSaver"];
    function LogCtrl($scope, OrderService, TaskService, $stateParams, $location, FileSaver) {
        var vm = $scope;
        vm.isLoading = false;

        vm.logClass = function(logData) {
            var logStatus = logData.substring(logData.indexOf("[")+1, logData.indexOf("]"));
            return "log_" + logStatus.toLowerCase();
        };
        vm.downloadLog = function () {
            var data = new Blob([vm.logs], {type: 'text/plain;charset=utf-8'});
            FileSaver.saveAs(data, 'history.log');
        }
        var object = $location.search();
        vm.loadOrderLog = function () {

            vm.jobChain = object.jobChain;
            var orders = {};
            orders.jobschedulerId = $scope.schedulerIds.selected;
            orders.jobChain = vm.jobChain;
            orders.orderId = $stateParams.orderId;
            orders.historyId = $stateParams.historyId;
            OrderService.log(orders).then(function (res) {
                var logs = JSON.parse(JSON.stringify(res));
                logs = logs.data.substring(logs.data.indexOf("plain") + 8);
                logs = logs.substring(0, logs.indexOf("}"));
                logs = logs.replace(/"/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\\n/g, '<br>');
                vm.logs = logs.split('<br>');
                vm.isLoading = true;
            }, function () {
                vm.isError = true;
                vm.isLoading = true;
            });
        };
        vm.loadJobLog = function () {

            vm.job = object.job;
            var jobs = {};
            jobs.jobschedulerId = $scope.schedulerIds.selected;
            jobs.taskId = $stateParams.taskId;
            TaskService.log(jobs).then(function (res) {
                var logs = JSON.parse(JSON.stringify(res));
                logs = logs.data.substring(logs.data.indexOf("plain") + 8);
                logs = logs.substring(0, logs.indexOf("}"));
                logs = logs.replace(/"/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\\n/g, '<br>');
                vm.logs = logs.split('<br>');
                vm.isLoading = true;
            }, function () {
                vm.isError = true;
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
