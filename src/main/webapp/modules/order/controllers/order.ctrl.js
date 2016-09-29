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

        vm.filter.sortBy = "status";

        /**
         * @return {number}
         * @return {number}
         * @return {number}
         * @return {number}
         * @return {number}
         */
        function CustomOrder(item) {
            switch (item) {
                case 'RUNNING':
                    return 1;
                case 'SETBACK':
                    return 2;
                case 'waitingForResource':
                    return 3;
                case 'SUSPENDED':
                    return 4;
                case 'PENDING':
                    return 5;
            }
        }

        vm.orders = [];
        if (SOSAuth.jobChain) {
            vm.isLoading = false;

            vm.jobChain = JSON.parse(SOSAuth.jobChain);
            OrderService.getJobOrdersP(vm.jobChain.path, $scope.schedulerIds.selected).then(function (result) {

                OrderService.getJobOrders(vm.jobChain.path, $scope.schedulerIds.selected).then(function (res) {
                    var data = [];
                    angular.forEach(angular.merge(result.orders, res.orders), function (value) {

                        if (value.jobChain === vm.jobChain.path) {
                            value.path1 = value.path.substring(1, value.path.lastIndexOf('/'));

                            data.push(value);
                        }
                    });
                    vm.orders = data;

                    vm.orders.sort(function (a, b) {
                        if (a && b && a.processingState && b.processingState) {
                            return (CustomOrder(a.processingState._text) > CustomOrder(b.processingState._text) ? 1 : -1);
                        } else {
                            return -1;
                        }
                    });
                    vm.temp = vm.orders;

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
        vm.selectedNodes = [];
        vm.allOrdersCheck={};
        vm.allOrdersCheck.orders=[];
        vm.obj={};
        vm.obj.orders=[];
        var promise1, promise2;


        vm.onAdd = function (item) {
          promise1 =  $timeout(function () {
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

        vm.onRemove = function (item) {
            angular.forEach(vm.selectedNodes, function (node, index) {
                if (node.name == item.name) {
                  promise2 =  $timeout(function () {
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

        function getPadding(job) {
            var padding = 0;
            var matched = false;
            vm.jobChain.nodes.map(function (node) {
                if (splitRegex.test(job.name)) {
                    var parent = splitRegex.exec(job.name)[1];
                    parentRegex = new RegExp("(.+):" + parent);
                    if (parentRegex.test(node.name)) {
                        // console.log("Padding for01 "+job.name+" is "+node.padding);
                        job.padding = node.padding + 10;
                        padding = job.padding;
                    } else if (parent == node.name) {
                        //console.log("Padding for02 "+job.name+" is "+node.padding);
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

            vm.jobChain = JSON.parse(SOSAuth.jobChain);
            console.log("Job Chain " + JSON.stringify(vm.jobChain));
            angular.forEach(vm.jobChain.nodes, function (node) {
                if (vm.jobChain.nodes[0]) {
                    vm.jobChain.nodes[0].padding = 0;
                }
                getPadding(node);
                showOrders();
            });
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
             JobService.stopNode([{jobChain: data.path, node: data.node}]).then(function(res){
                    console.log(data);
                    data.state._text = 'STOPPED';
                    data.state.severity = 2;
                });
        };
        vm.skipNode = function (data) {
             JobService.skipNode([{jobChain: data.path, node: data.node}]).then(function(res){
                      data.state._text = 'SKIPPED';
                    data.state.severity = 2;
                });
        };
        vm.unskipNode = function (data) {
             JobService.activateNode([{jobChain: data.path, node: data.node}]).then(function(res){
                     data.state._text = 'ACTIVE';
                    data.state.severity = 2;
                });
        };
        vm.stopJob = function (data) {
            console.log(data)
            JobService.stop([{job: data.path}]).then(function(res){
                      data.job.state._text = 'STOPPED';
                    data.job.state.severity = 2;
                });
        };
        vm.unstopJob = function (data) {
            console.log(data)
             JobService.unstop([{job: data.path}]).then(function(res){
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

                angular.forEach(newNames, function (value) {
                    console.log(value)
                    if (value.state && value.state._text.toLowerCase() == 'stopped') {
                        vm.isStopped = true;
                    }
                    if (value.job.state && value.job.state._text.toLowerCase() == 'stopped') {
                        vm.isStoppedJob = true;
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
            console.log("Watcher "+vm.obj.orders.length);
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

                 vm.obj.orders=angular.copy(vm.orders,vm.obj.orders);
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
            if(promise1)
            $timeout.cancel(promise1);
            if(promise2)
            $timeout.cancel(promise2);
        });

        vm.getOrders = getOrders;
        function getOrders(filter) {

            return OrderService.get(filter);
        }

        vm.getJobChainOrders = getOrders;
        function getOrders(filter) {

            return OrderService.get(filter);
        }

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

                })
                res.orders = res.orders.slice(0, 10);
                vm.orders = res.orders;

                angular.forEach(vm.jobChain.nodes, function (node, index) {
                    node.orders = [];
                })

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
                            return;
                        } else {
                            console.log("Node name " + vm.jobChain.nodes[jobNumber].name);
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
                scope: vm
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
            orders.jobschedulerId = $scope.schedulerIds.selected;
            orders.state = order.state;
            orders.endState = order.endState;

            orders.order.push({orderId: order.orderId, jobChain: order.jobChain});
            OrderService.setOrderState(orders).then(function (res) {
                console.log(res);
            }, function () {

            });
            vm.object.orders = [];
        }

        vm.setOrderState = function (order) {
            vm.order = order;

            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/set-order-state-dialog.html',
                controller: 'DialogCtrl',
                scope: vm
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
                scope: vm
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
            DailyPlanService.getPlans({jobschedulerId: $scope.schedulerIds.selected, state: 'PLANNED' }).then(function (res) {
                vm.planItemData = res.planItems;
                vm.planItemData.forEach(function (data) {
                    var planData = {
                        plannedStartTime: data.plannedStartTime,
                        expectedEndTime: data.expectedEndTime
                    };
                    vm.planItems.push(planData);
                });
                openCalendar();
            }, function (err) {
            });
            vm.object.orders = [];
        };

        function openCalendar() {
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/calendar-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                size: 'lg'
            });
            modalInstance.result.then(function () {
                console.log('>>>>');
            }, function () {

            });
            vm.object.orders = [];
        };


    }

    JobChainDetailsCtrl.$inject = ["$scope", "SOSAuth", "orderByFilter", "ScheduleService", "JobChainService", "$uibModal", "OrderService", "toasty", "$rootScope", "DailyPlanService", "$location","gettextCatalog"];
    function JobChainDetailsCtrl($scope, SOSAuth, orderBy, ScheduleService, JobChainService, $uibModal, OrderService, toasty, $rootScope, DailyPlanService, $location, gettextCatalog) {
        var vm = $scope;
        vm.filter = {};
        var object = $location.search();

        if(object.path) {
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

        }else {
            toasty.error({
                title: gettextCatalog.getString('message.oops'),
                msg: gettextCatalog.getString('message.incorrectJobChainPath')
            });
            vm.goBack();
        }

        $scope.$on('$stateChangeSuccess', function () {
            vm.object = {};
        });

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
            DailyPlanService.getPlans({jobschedulerId: $scope.schedulerIds.selected, state: 'PLANNED' }).then(function (res) {
                vm.planItemData = res.planItems;
                vm.planItemData.forEach(function (data) {
                    var planData = {
                        plannedStartTime: data.plannedStartTime,
                        expectedEndTime: data.expectedEndTime
                    };
                    vm.planItems.push(planData);
                });
                openCalendar();
            }, function (err) {
            });
            vm.object.jobChains = [];
        };

        function openCalendar() {
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/calendar-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                size: 'lg'
            });
            modalInstance.result.then(function () {
                console.log('>>>>');
            }, function () {
            });
        }

        function addOrder(order, paramObject) {
            var orders = {};
            orders = order;
            orders.jobschedulerId = $scope.schedulerIds.selected;
            orders.params = paramObject;
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

            ScheduleService.getSchedulesP({jobschedulerId: $scope.schedulerIds.selected, compact:true}).then(function (res) {
                vm.schedules = res.schedules;
            });

            vm._jobChain = vm.jobChain;
            vm.order = {};
            vm.paramObject = {};
            vm.paramObject.params = [];

            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/add-order-dialog.html',
                controller: 'DialogCtrl',
                scope: vm
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

    OrderCtrl.$inject = ["$scope","$rootScope", "OrderService", "CoreService", "orderByFilter", "$uibModal", "SavedFilter", "toasty", "gettextCatalog", "FileSaver", "Blob"];
    function OrderCtrl($scope, $rootScope, OrderService, CoreService, orderBy, $uibModal, SavedFilter, toasty,gettextCatalog, FileSaver, Blob) {
        var vm = $scope;

        vm.filter = {};
        vm.filter.state = "all";
        vm.filter.sortBy = "status";
        vm.isLoading = false;

        vm.object = {};

        vm.savedOrderFilter = JSON.parse(SavedFilter.orderFilters) || {};
        vm.savedOrderFilter.list = vm.savedOrderFilter.list || [];

        vm.exportToExcel = function(){
            $rootScope.$broadcast('exportData');
        };


        /**
         * @return {number}
         * @return {number}
         * @return {number}
         * @return {number}
         * @return {number}
         */
        function CustomOrder(item) {
            switch (item) {
                case 'RUNNING':
                    return 1;

                case 'SETBACK':
                    return 2;

                case 'waitingForResource':
                    return 3;
                case 'SUSPENDED':
                    return 4;

                case 'PENDING':
                    return 5;
            }
        }

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

        vm.showLeftPanel = function () {
            CoreService.setSideView(false);
            $('#rightPanel').removeClass('fade-in m-l-0');
            $('#leftPanel').show();
            $('.sidebar-btn').hide();
        };

        vm.downloadLog = function (logs) {
            var data = new Blob(['file-with-test-log-data'], {type: 'text/plain;charset=utf-8'});
            FileSaver.saveAs(data, 'order.log');
        };

        vm.init = function () {
            OrderService.getOrdersP({jobschedulerId: $scope.schedulerIds.selected, compact:true}).then(function (result) {
                angular.forEach(result.orders, function (value) {
                    value.path1 = value.path.substring(1, value.path.lastIndexOf('/'));
                });
                vm.orders = result.orders;
                vm.isLoading = true;

                OrderService.get({jobschedulerId: $scope.schedulerIds.selected}).then(function (res) {
                    vm.temp = angular.merge(result.orders, res.orders);
                    vm.temp.sort(function (a, b) {
                        if (a && b && a.processingState && b.processingState) {
                            return (CustomOrder(a.processingState._text) > CustomOrder(b.processingState._text) ? 1 : -1);
                        } else {
                            return -1;
                        }
                    });

                    filterData();

                }, function () {
                    vm.isLoading = true;
                    vm.isError = true;
                });
            });
        };

        vm.init();
        vm.load = function () {
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
        };

        vm.load1 = function () {
            var data = [];
            if (vm.savedOrderFilter.selected) {
                filterData();

                angular.forEach(vm.orders, function (value) {
                    if (value._type.toLowerCase() == vm.filter.state)
                        data.push(value);
                });
                vm.orders = data;
            } else {

                angular.forEach(vm.temp, function (value) {
                    if (value._type.toLowerCase() == vm.filter.state)
                        data.push(value);
                });
                vm.orders = data;
            }
        };


        $scope.$on("orderState", function (evt, state) {
            vm.filter.state = state;
            var data = [];
            if (vm.savedOrderFilter.selected) {
                filterData();
                angular.forEach(vm.orders, function (value) {
                    if (value.processingState._text.toLowerCase() == state || state == 'all')
                        data.push(value);
                });

            } else {
                angular.forEach(vm.temp, function (value) {
                    if (value.processingState._text.toLowerCase() == state || state == 'all')
                        data.push(value);
                });

            }
            vm.orders = data;
        });

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
                    angular.forEach(vm.temp, function (res) {

                        var flag = true;
                        if (value.regex && res.orderId) {
                            if (!res.orderId.match(value.regex)) {
                                flag = false;
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

        vm.applyFilter = function () {
            vm.orderFilter = {};
            vm.isUnique = true;
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/order-filter-dialog.html',
                controller: 'DialogCtrl',
                scope: vm
            });
            modalInstance.result.then(function () {
                vm.savedOrderFilter.list.push(vm.orderFilter);
                vm.savedOrderFilter.selected = vm.orderFilter.name;
                filterData();
                SavedFilter.setOrder(vm.savedOrderFilter);
                SavedFilter.save();
            }, function () {

            });
        };

        vm.editFilters = function () {
            vm.filters = vm.savedOrderFilter.list;
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/edit-filter-dialog.html',
                controller: 'DialogCtrl',
                scope: vm
            });
            modalInstance.result.then(function () {

            }, function () {

            });
        };

        vm.editFilter = function (filter) {
            vm.filterName = filter.name;
            vm.orderFilter = angular.copy(filter);
            vm.isUnique = true;
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/edit-order-filter-dialog.html',
                controller: 'DialogCtrl',
                scope: vm
            });
            modalInstance.result.then(function () {
                angular.forEach(vm.savedOrderFilter.list, function (value, index) {
                    if (value.name == filter.name) {
                        vm.savedOrderFilter.list[index] = vm.orderFilter;
                    }
                });
                vm.filterName = undefined;
                SavedFilter.setOrder(vm.savedOrderFilter);
                SavedFilter.save();
                filterData();
            }, function () {
                vm.filterName = undefined;
            });
        };

        vm.deleteFilter = function () {
            angular.forEach(vm.savedOrderFilter.list, function (value, index) {
                if (value.name == vm.orderFilter.name) {
                    toasty.success({
                        title: value.name + ' '+ gettextCatalog.getString('message.filterDeleteSuccessfully'),
                        msg: ''
                    });
                    vm.savedOrderFilter.list.splice(index, 1);
                }
            });
            if (vm.savedOrderFilter.list.length == 0) {
                vm.savedOrderFilter = {};
            }
            SavedFilter.setOrder(vm.savedOrderFilter);
            SavedFilter.save();
            filterData();
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
            filterData();

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

    OrderOverviewCtrl.$inject = ["$scope", "OrderService", "$stateParams", "orderByFilter", "$uibModal", "SavedFilter", "toasty"];
    function OrderOverviewCtrl($scope, OrderService, $stateParams, orderBy, $uibModal, SavedFilter, toasty) {
        var vm = $scope;
        vm.filter = {};
        vm.filter.sortBy = "status";

        vm.isLoading = false;
        vm.name = $stateParams.name;

        vm.object = {};

        vm.savedOrderFilter = JSON.parse(SavedFilter.orderFilters) || {};
        vm.savedOrderFilter.list = vm.savedOrderFilter.list || [];

        /**
         * @return {number}
         * @return {number}
         * @return {number}
         * @return {number}
         * @return {number}
         */
        function CustomOrder(item) {
            switch (item) {
                case 'RUNNING':
                    return 1;
                case 'SETBACK':
                    return 2;
                case 'waitingForResource':
                    return 3;
                case 'SUSPENDED':
                    return 4;

                case 'PENDING':
                    return 5;
            }
        }

        vm.sortBy = function (propertyName) {
            vm.object.orders = [];
            vm.reverse = (propertyName !== null && vm.propertyName === propertyName) ? !vm.reverse : false;
            vm.propertyName = propertyName;
            vm.orders = orderBy(vm.orders, vm.propertyName, vm.reverse);
        };
        vm.mainSortBy = function (propertyName) {
            vm.object.orders = [];
            vm.sortReverse = !vm.sortReverse;
            vm.filter.sortBy = propertyName;
            vm.orders = orderBy(vm.orders, vm.filter.sortBy, vm.sortReverse);
        };

        vm.init = function () {
            OrderService.getOrdersP({jobschedulerId: $scope.schedulerIds.selected, compact:true}).then(function (result) {
                angular.forEach(result.orders, function (value) {
                    value.path1 = value.path.substring(1, value.path.lastIndexOf('/'));
                });
                OrderService.get({jobschedulerId: $scope.schedulerIds.selected}).then(function (res) {
                    vm.temp = angular.merge(result.orders, res.orders);
                    vm.temp.sort(function (a, b) {
                        if (a && b && a.processingState && b.processingState) {
                            return (CustomOrder(a.processingState._text) > CustomOrder(b.processingState._text) ? 1 : -1);
                        } else {
                            return -1;
                        }
                    });

                    filterData();
                    vm.isLoading = true;

                }, function () {
                    vm.isLoading = true;
                    vm.isError = true;
                });
            });
        };
        vm.filter.state = $stateParams.name;
        vm.init();

        vm.load = function () {
            var data = [];
            if (vm.savedOrderFilter.selected) {
                filterData();

                angular.forEach(vm.orders, function (value) {
                    if (value.processingState._text.toLowerCase() == vm.filter.state || vm.filter.state == 'all')
                        data.push(value);
                });

            } else {
                angular.forEach(vm.temp, function (value) {
                    if (value.processingState._text.toLowerCase() == vm.filter.state || vm.filter.state == 'all')
                        data.push(value);
                });

            }
            vm.orders = data;
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
            if (vm.savedOrderFilter.list.length > 0) {
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
                        vm.data = [];
                        var data = [];
                        angular.forEach(vm.temp, function (value) {
                            if (value.processingState._text.toLowerCase() == vm.filter.state || vm.filter.state == 'all')
                                data.push(value);
                        });
                        angular.forEach(data, function (res) {

                            var flag = true;
                            if (value.regex && res.orderId) {
                                if (!res.orderId.match(value.regex)) {
                                    flag = false;
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
                                vm.data.push(res);
                        });
                        vm.orders = vm.data;
                    }

                });
            } else {
                var data = [];
                angular.forEach(vm.temp, function (value) {
                    if (value.processingState._text.toLowerCase() == vm.filter.state || vm.filter.state == 'all')
                        data.push(value);
                });
                vm.orders = data;
            }
        }

        vm.applyFilter = function () {
            vm.orderFilter = {};
            vm.isUnique = true;
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/order-filter-dialog.html',
                controller: 'DialogCtrl',
                scope: vm
            });
            modalInstance.result.then(function () {
                vm.savedOrderFilter.list.push(vm.orderFilter);
                vm.savedOrderFilter.selected = vm.orderFilter.name;
                SavedFilter.setOrder(vm.savedOrderFilter);
                SavedFilter.save();
                filterData();
            }, function () {

            });
        };

        vm.editFilters = function () {
            vm.filters = vm.savedOrderFilter.list;
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/edit-filter-dialog.html',
                controller: 'DialogCtrl',
                scope: vm
            });
            modalInstance.result.then(function () {

            }, function () {

            });
        };

        vm.editFilter = function (filter) {
            vm.filterName = filter.name;
            vm.orderFilter = angular.copy(filter);
            vm.isUnique = true;
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/edit-order-filter-dialog.html',
                controller: 'DialogCtrl',
                scope: vm
            });
            modalInstance.result.then(function () {
                angular.forEach(vm.savedOrderFilter.list, function (value, index) {
                    if (value.name == filter.name) {
                        vm.savedOrderFilter.list[index] = vm.orderFilter;
                    }
                });
                vm.filterName = undefined;
                SavedFilter.setOrder(vm.savedOrderFilter);
                SavedFilter.save();
                filterData();
            }, function () {
                vm.filterName = undefined;
            });
        };

        vm.deleteFilter = function () {
            angular.forEach(vm.savedOrderFilter.list, function (value, index) {
                if (value.name == vm.orderFilter.name) {
                    toasty.success({
                        title: value.name + ' '+ gettextCatalog.getString('message.filterDeleteSuccessfully'),
                        msg: ''
                    });
                    vm.savedOrderFilter.list.splice(index, 1);
                }
            });
            if (vm.savedOrderFilter.list.length == 0) {
                vm.savedOrderFilter = {};
            }
            SavedFilter.setOrder(vm.savedOrderFilter);
            SavedFilter.save();
            filterData();
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
            filterData();

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



    OrderFunctionCtrl.$inject = ["$scope", "$rootScope", "OrderService", "$uibModal", "ScheduleService", 'toasty','$timeout', "DailyPlanService"];
    function OrderFunctionCtrl($scope, $rootScope, OrderService, $uibModal, ScheduleService, toasty,$timeout, DailyPlanService) {
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
            var pageSizeTemp = angular.copy(vm.pageSize);
            var currentPageTemp = angular.copy(vm.currentPage);
            vm.pageSize = vm.orders.length;
            vm.currentPage = 1;
            promise1 = $timeout(function () {
                $('#orderTableId').table2excel({
                    exclude: ".noExl",
                    filename: "jobscheduler-orders",
                    fileext: ".xlsx",
                    exclude_img: false,
                    exclude_links: false,
                    exclude_inputs: false
                });
                vm.pageSize = pageSizeTemp;
                vm.currentPage = currentPageTemp;
                $('#exportToExcelBtn').attr("disabled", false);
            }, 800);
        });


        /**--------------- sorting and pagination -------------------*/
        vm.pageChange = function () {
            vm.object.orders = [];
        };


        function startAt(order, paramObject) {
            var orders = {};
            orders.order = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            orders.order.push({orderId: order.orderId, jobChain: order.jobChain});

            if (order.date && order.time) {
                order.date.setHours(order.time.getHours());
                order.date.setMinutes(order.time.getMinutes());
                order.date.setSeconds(order.time.getSeconds());
            }

            orders.at = moment.utc(order.date).format();
            orders.params.concat(paramObject.params);
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
                scope: vm
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
            orders.jobschedulerId = $scope.schedulerIds.selected;
            orders.state = order.state;
            orders.endState = order.endState;

            orders.order.push({orderId: order.orderId, jobChain: order.jobChain});
            OrderService.setOrderState(orders).then(function (res) {
                console.log(res);
            }, function () {

            });
            vm.object.orders = [];
        }

        vm.setOrderState = function (order) {
            vm.order = order;

            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/set-order-state-dialog.html',
                controller: 'DialogCtrl',
                scope: vm
            });
            modalInstance.result.then(function () {
                setOrderState(order);
            }, function () {
                vm.object.orders = [];
            });
        };

        /**------------------------------------------------------begin run time editor -------------------------------------------------------*/



        function setRunTime(order) {
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            orders.orders.push({orderId: order.orderId, jobChain: order.jobChain, runTime : order.runTime});

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
                scope: vm
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
            DailyPlanService.getPlans({jobschedulerId: $scope.schedulerIds.selected, state: 'PLANNED' }).then(function (res) {
                vm.planItemData = res.planItems;
                vm.planItemData.forEach(function (data) {
                    var planData = {
                        plannedStartTime: data.plannedStartTime,
                        expectedEndTime: data.expectedEndTime
                    };
                    vm.planItems.push(planData);
                });
                openCalendar();
            }, function (err) {
            });
            vm.object.orders = [];
        };

        function openCalendar() {
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/calendar-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                size: 'lg'
            });
            modalInstance.result.then(function () {
                console.log('>>>>');
            }, function () {
            });
        }

        vm.isLoading1 = true;
        vm.showLogFuc = function (value) {
            if (value.historyId) {
                vm.isLoading1 = false;
                var orders = {};
                orders.jobschedulerId = $scope.schedulerIds.selected;
                orders.jobChain = value.jobChain;
                orders.orderId = value.orderId;
                orders.historyId = value.historyId;


                OrderService.log(orders).then(function (res) {
                    vm.logs = res.log;
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
             if(promise1)
            $timeout.cancel(promise1);
        });

    }

    HistoryCtrl.$inject = ["$scope", "OrderService", "TaskService", "$uibModal", "SavedFilter", "toasty", "$timeout", "gettextCatalog", "FileSaver",
        "Blob", "JobService", "JobChainService"];
    function HistoryCtrl($scope, OrderService, TaskService, $uibModal, SavedFilter, toasty, $timeout, gettextCatalog, FileSaver,
                         Blob, JobService, JobChainService) {
        var vm = $scope;
        vm.isLoading = false;
        vm.filter = {};
        vm.filter.type = 'jobChain';
        vm.filter.date ='all';

        vm.pageSize = 10;
        vm.currentPage = 1;

        vm.object = {};

        var promise1;

        vm.historyFilterObj = JSON.parse(SavedFilter.historyFilters) || {};

        vm.savedHistoryFilter = vm.historyFilterObj.order || {};
        vm.savedHistoryFilter.list = vm.savedHistoryFilter.list || [];

        vm.savedJobHistoryFilter = vm.historyFilterObj.job || {};
        vm.savedJobHistoryFilter.list = vm.savedJobHistoryFilter.list || [];

        vm.savedIgnoreList = JSON.parse(SavedFilter.ignoreList) || {};
        vm.savedIgnoreList.orders = vm.savedIgnoreList.orders || [];
        vm.savedIgnoreList.jobChains = vm.savedIgnoreList.jobChains || [];
        vm.savedIgnoreList.jobs = vm.savedIgnoreList.jobs || [];
        vm.savedIgnoreList.isEnable = vm.savedIgnoreList.isEnable || false;

        if (JobService.jobSelected) {
            console.log("Job selected " + JobService.jobSelected);
            vm.filter.type = 'job';
        } else {
            console.log("JobChain selected " + JobChainService.selectedJobChain);
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


        vm.tree = [];
        vm.getTreeStructure = function () {
            $('#treeModal').modal('show');
            var tree = [], keys = [];
            angular.forEach(vm.temp, function (item) {
                var key = item['jobChain'];
                if (keys.indexOf(key) === -1) {
                    keys.push(key);
                    tree.push(key.split('/'));
                }
            });
            vm.tree = convertToHierarchy(tree);

        };


        vm.selectValue = function (data) {
            vm.filterString1 = data.JobChain;
            vm.historyFilter.jobChain = vm.filterString1;
        };


        function convertToHierarchy(arry) {
            // Discard duplicates and set up parent/child relationships
            var children = {};
            var hasParent = {};
            for (var i = 0; i < arry.length; i++) {
                var path = arry[i];
                var parent = null;
                for (var j = 0; j < path.length; j++) {
                    var item = path[j];
                    if (!children[item]) {
                        children[item] = {};
                    }
                    if (parent) {
                        children[parent][item] = true;
                        /* dummy value */
                        hasParent[item] = true;
                    }
                    parent = item;
                }
            }

            // Now build the hierarchy
            var result = [];
            for (item in children) {
                if (!hasParent[item]) {
                    result.push(buildNodeRecursive(item, children));
                }
            }
            return result;
        }

        function buildNodeRecursive(item, children) {
            var node = {'JobChain': item, children: []};
            for (var child in children[item]) {
                node.children.push(buildNodeRecursive(child, children));
            }
            return node;
        }


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

                            if (flag && value.jobChain && res.jobChain) {
                                if (!res.jobChain.match(value.jobChain)) {
                                    flag = false;
                                }
                            }
                            if (flag && value.fromDate && res.startTime) {

                                if (value.fromTime) {
                                    value.fromDate = new Date(value.fromDate);
                                    value.fromTime = new Date(value.fromTime);
                                    value.fromDate.setHours(value.fromTime.getHours());
                                    value.fromDate.setMinutes(value.fromTime.getMinutes());
                                    value.fromDate.setSeconds(value.fromTime.getSeconds());
                                }
                                var time = moment(value.fromDate).diff(moment(res.startTime));
                                if (time >= 0) {
                                    flag = false;
                                }
                            }
                            if (flag && value.toDate && res.endTime) {
                                if (value.toTime) {
                                    value.toDate = new Date(value.toDate);
                                    value.toTime = new Date(value.toTime);
                                    value.toDate.setHours(value.toTime.getHours());
                                    value.toDate.setMinutes(value.toTime.getMinutes());
                                    value.toDate.setSeconds(value.toTime.getSeconds());
                                }
                                var time = moment(res.endTime).diff(moment(value.toDate));

                                if (time < 0) {
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
            checkIgnorelist();
        }

        function checkIgnorelist() {
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
                            if (flag && value.fromDate && res.startTime) {

                                if (value.fromTime) {
                                    value.fromDate = new Date(value.fromDate);
                                    value.fromTime = new Date(value.fromTime);
                                    value.fromDate.setHours(value.fromTime.getHours());
                                    value.fromDate.setMinutes(value.fromTime.getMinutes());
                                    value.fromDate.setSeconds(value.fromTime.getSeconds());
                                }
                                var time = moment(value.fromDate).diff(moment(res.startTime));
                                if (time >= 0) {
                                    flag = false;
                                }
                            }
                            if (flag && value.toDate && res.endTime) {
                                if (value.toTime) {
                                    value.toDate = new Date(value.toDate);
                                    value.toTime = new Date(value.toTime);
                                    value.toDate.setHours(value.toTime.getHours());
                                    value.toDate.setMinutes(value.toTime.getMinutes());
                                    value.toDate.setSeconds(value.toTime.getSeconds());
                                }
                                var time = moment(res.endTime).diff(moment(value.toDate));

                                if (time < 0) {
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
                    vm.logs = res.log;
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
                    vm.logs = res.log;
                    vm.isLoading = true;
                }, function () {
                    vm.isError = true;
                    vm.isLoading = true;
                });
            }

            vm.showLogPanel = value;
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
            var pageSizeTemp = angular.copy(vm.pageSize);
            var currentPageTemp = angular.copy(vm.currentPage);

            if (vm.filter.type == 'jobChain')
                vm.pageSize = vm.historys.length;
            else
                vm.pageSize = vm.jobHistorys.length;
            vm.currentPage = 1;
            promise1 = $timeout(function () {
                $('#' + vm.filter.type).table2excel({
                    exclude: ".noExl",
                    filename: "jobscheduler-order-history-report",
                    fileext: ".xlsx",
                    exclude_img: false,
                    exclude_links: false,
                    exclude_inputs: false
                });
                vm.pageSize = pageSizeTemp;
                vm.currentPage = currentPageTemp;
                $('#exportToExcelBtn').attr("disabled", false);
            }, 800);
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

        /**--------------- Filter -----------------------------*/
        vm.advanceFilter = function () {

            vm.historyFilter = {};
            vm.isUnique = true;
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/history-filter-dialog.html',
                controller: 'DialogCtrl',
                scope: vm
            });
            modalInstance.result.then(function () {
                if (vm.filter.type == 'jobChain') {
                    vm.savedHistoryFilter.list.push(vm.historyFilter);
                    vm.savedHistoryFilter.selected = vm.historyFilter.name;
                    vm.historyFilterObj.order = vm.savedHistoryFilter;
                    filterData();

                } else {
                    vm.savedJobHistoryFilter.list.push(vm.historyFilter);
                    vm.savedJobHistoryFilter.selected = vm.historyFilter.name;
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
                vm.filters = vm.savedHistoryFilter.list;
            } else {
                vm.filters = vm.savedJobHistoryFilter.list;
            }
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/edit-filter-dialog.html',
                controller: 'DialogCtrl',
                scope: vm
            });
            modalInstance.result.then(function () {

            }, function () {

            });

        };

        vm.editFilter = function (filter) {
            vm.filterName = filter.name;
            vm.historyFilter = angular.copy(filter);
            vm.isUnique = true;
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/edit-history-filter-dialog.html',
                controller: 'DialogCtrl',
                scope: vm
            });
            modalInstance.result.then(function () {

                if (vm.filter.type == 'jobChain') {
                    angular.forEach(vm.savedHistoryFilter.list, function (value, index) {
                        if (value.name == filter.name) {
                            vm.savedHistoryFilter.list[index] = vm.historyFilter;
                        }
                    });
                    vm.historyFilterObj.order = vm.savedHistoryFilter;
                    filterData();

                } else {
                    angular.forEach(vm.savedJobHistoryFilter.list, function (value, index) {
                        if (value.name == filter.name) {
                            vm.savedJobHistoryFilter.list[index] = vm.historyFilter;
                        }
                    });
                    vm.historyFilterObj.job = vm.savedJobHistoryFilter;
                    filterJobData();
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
                }
                vm.historyFilterObj.job = vm.savedJobHistoryFilter;
                filterJobData();
            }
            SavedFilter.setHistory(vm.historyFilterObj);
            SavedFilter.save();
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
            checkIgnorelist();
        };

        vm.addJobChainToIgnoreList = function (name) {
            vm.savedIgnoreList.jobChains.push(name);
            SavedFilter.setIgnoreList(vm.savedIgnoreList);
            SavedFilter.save();
            checkIgnorelist();
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
                    scope: vm
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

        $scope.$on('$destroy', function () {
            watcher1();
            watcher2();
            watcher3();
            watcher4();
            watcher5();
             if(promise1)
            $timeout.cancel(promise1);
        });

        vm.downloadLog = function (logs) {
            var data = new Blob(['file-with-test-log-data'], {type: 'text/plain;charset=utf-8'});
            FileSaver.saveAs(data, 'history.log');
        }
    }

    LogCtrl.$inject = ["$scope", "OrderService", "TaskService", "$stateParams", "$location"];
    function LogCtrl($scope, OrderService, TaskService, $stateParams, $location) {
        var vm = $scope;
        vm.isLoading = false;


        vm.loadOrderLog = function () {
            var object = $location.search();

            vm.jobChain = object.jobChain;
            var orders = {};
            orders.jobschedulerId = $scope.schedulerIds.selected;
            orders.jobChain = vm.jobChain;
            orders.orderId = $stateParams.orderId;
            orders.historyId = $stateParams.historyId;
            OrderService.log(orders).then(function (res) {
                vm.logs = res.log;
                vm.isLoading = true;
            }, function () {
                vm.isError = true;
                vm.isLoading = true;
            });
        };
        vm.loadJobLog = function () {
            var jobs = {};
            jobs.jobschedulerId = $scope.schedulerIds.selected;
            jobs.taskId = $stateParams.taskId;
            TaskService.log(jobs).then(function (res) {
                vm.logs = res.log;
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
