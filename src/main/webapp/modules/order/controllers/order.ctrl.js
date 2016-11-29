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

        function loadJobOrderV(obj) {
            OrderService.getJobOrders(obj).then(function (res) {
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
            });
        }


        function loadOrders(obj) {
            OrderService.getJobOrdersP(obj).then(function (result) {
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

        vm.showPanel = '';
        vm.showPanelFuc = function (value) {
            vm.showPanel = value;
            vm.hidePanel = true;
        };
        vm.hidePanelFuc = function () {
            vm.showPanel = '';
            vm.hidePanel = !vm.hidePanel;
        };
    }

    JobChainOverviewCtrl.$inject = ["$scope", "$rootScope", "OrderService", "SOSAuth", "JobChainService", "JobService", "$timeout", "$window", "$interval", "orderByFilter", "$state", "$uibModal", "DailyPlanService", "$location"];
    function JobChainOverviewCtrl($scope, $rootScope, OrderService, SOSAuth, JobChainService, JobService, $timeout, $window, $interval, orderBy, $state, $uibModal, DailyPlanService, $location) {

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
                angular.forEach(vm.selectedNodes, function (value) {
                    console.log(value.name + " state " + value.state._text + " job state " + value.job.state._text);
                    if (value.state && value.state._text == 'STOPPED') {
                        vm.isStoppedNode = true;
                    }
                    if (value.state && value.state._text == 'SKIPPED') {
                        vm.isSkippedNode = true;
                    }
                    if (value.job.state && value.job.state._text == 'STOPPED') {
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


        function bulkOperationCompleted(operation, status) {
            $rootScope.$broadcast('bulkOperationCompleted', {operation: operation, status: status})
        }

        vm.stopJobs = function () {
            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = $scope.schedulerIds.selected;

            angular.forEach(vm.object.nodes, function (value) {
                jobs.jobs.push({job: value.job.path});
            });
            JobService.stop(jobs).then(function (res) {
                jobs.compact = true;
                JobService.get(jobs).then(function (res) {
                    angular.forEach(res.jobs, function (jobsData) {
                        angular.forEach(vm.object.nodes, function (jobs) {
                            if (jobs.job.path == jobsData.path) {
                                jobs = angular.merge(jobs.job, jobsData);
                            }
                        });
                    });
                    vm.reset();
                    bulkOperationCompleted('stopJobs', 'success');
                }, function (err) {

                });
            }, function (err) {
                vm.reset();
                bulkOperationCompleted('stopJobs', 'error');
            });
        };

        vm.unstopJobs = function () {
            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = $scope.schedulerIds.selected;

            angular.forEach(vm.object.nodes, function (value) {
                jobs.jobs.push({job: value.job.path});
            });
            JobService.unstop(jobs).then(function (res) {
                jobs.compact = true;
                JobService.get(jobs).then(function (res) {
                    angular.forEach(res.jobs, function (jobsData) {
                        angular.forEach(vm.object.nodes, function (jobs) {
                            if (jobs.job.path == jobsData.path) {
                                jobs = angular.merge(jobs.job, jobsData);
                            }
                        });
                    });
                    vm.reset();
                    bulkOperationCompleted('unstopJobs', 'success');
                }, function (err) {

                });
            }, function (err) {
                vm.reset();
                bulkOperationCompleted('unstopJobs', 'error');
            });
        };

        vm.skipNodes = function () {
            var nodes = {};
            nodes.nodes = [];
            nodes.jobschedulerId = $scope.schedulerIds.selected;

            angular.forEach(vm.object.nodes, function (value) {
                nodes.nodes.push({jobChain: vm.jobChain.path, node: value.name});
            });
            JobService.skipNode(nodes).then(function (res) {
                vm.getJobChainData();
                vm.reset();
                bulkOperationCompleted('skipNodes', 'success');
            }, function (err) {
                vm.reset();
                bulkOperationCompleted('skipNodes', 'error');
            });
        };

        vm.unskipNodes = function () {

            var nodes = {};
            nodes.nodes = [];
            nodes.jobschedulerId = $scope.schedulerIds.selected;

            angular.forEach(vm.object.nodes, function (value) {
                nodes.nodes.push({jobChain: vm.jobChain.path, node: value.name});
            });

            JobService.activateNode(nodes).then(function (res) {
                vm.getJobChainData();
                vm.reset();
                bulkOperationCompleted('unskipNodes', 'success');
            }, function (err) {
                vm.reset();
                bulkOperationCompleted('unskipNodes', 'error');
            });
        };

        vm.stopNodes = function () {

            var nodes = {};
            nodes.nodes = [];
            nodes.jobschedulerId = $scope.schedulerIds.selected;

            angular.forEach(vm.object.nodes, function (value) {
                nodes.nodes.push({jobChain: vm.jobChain.path, node: value.name});
            });

            JobService.stopNode(nodes).then(function (res) {
                vm.getJobChainData();
                vm.reset();
                bulkOperationCompleted('stopNodes', 'success');
            }, function (err) {
                vm.reset();
                bulkOperationCompleted('stopNodes', 'error');
            });
        };

        vm.unstopNodes = function () {

            var nodes = {};
            nodes.nodes = [];
            nodes.jobschedulerId = $scope.schedulerIds.selected;

            angular.forEach(vm.object.nodes, function (value) {
                nodes.nodes.push({jobChain: vm.jobChain.path, node: value.name});
            });

            JobService.activateNode(nodes).then(function (res) {
                vm.getJobChainData();
                vm.reset();
                bulkOperationCompleted('unstopNodes', 'success');
            }, function (err) {
                vm.reset();
                bulkOperationCompleted('unstopNodes', 'error');
            });
        };

        vm.getJobChainData = function () {
            var path = object.path;
            var obj = {};
            obj.jobschedulerId = $scope.schedulerIds.selected;
            obj.jobChain = path;

            JobChainService.getJobChainP(obj).then(function (result) {
                vm.jobChainData = result.jobChain;
                volatileFolderData(obj);
            }, function (err) {
                volatileFolderData(obj);
            });
        };

        function volatileFolderData(obj) {
            JobChainService.getJobChain(obj).then(function (res) {
                vm.jobChainData = angular.merge(vm.jobChainData, res.jobChain);
                angular.forEach(vm.jobChainData.nodes, function (nodes) {
                    angular.forEach(vm.jobChain.nodes, function (value) {
                        if (value.name == nodes.name) {
                            value = angular.merge(value, nodes);
                        }
                    });
                });
            }, function (err) {

            });
        }

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
            // console.log("Padding for " + job.name + " is " + padding);
            return padding;
        }

        function loadJobChain() {
            console.log("Load job chain");
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
                showOrders();
                if (vm.totalSubNodes > 0) {
                    vm.totalLineWidth = vm.totalNodes + vm.totalSubNodes;
                } else {
                    vm.totalLineWidth = vm.totalNodes;
                }

                loadHistory();
            }
        }

        loadJobChain();
        $scope.$on("reloadJobChain", function () {
            loadJobChain();
        });

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
                vm.isStoppedNode = false;

                angular.forEach(newNames, function (value) {
                    if (value.state && value.state._text == 'STOPPED') {
                        vm.isStopped = true;
                    }
                    if (value.job.state && value.job.state._text == 'STOPPED') {
                        vm.isStoppedJob = true;
                    }
                    if (value.job.state && value.job.state._text != 'STOPPED') {
                        vm.isUnStoppedJob = true;
                    }
                    if (value.state && value.state._text == 'SKIPPED') {
                        vm.isSkippedNode = true;
                    }
                    if (value.state && value.state._text != 'SKIPPED') {
                        vm.isUnSkippedNode = true;
                    }
                    if (value.state && value.state._text == 'STOPPED') {
                        vm.isStoppedNode = true;
                    }
                    if (value.state && value.state._text != 'STOPPED') {
                        vm.isUnStoppedNode = true;
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
            if (newNames && newNames.length > 0) {
                vm.allCheck.orders = newNames.length == vm.jobChain.nodes.length;
            } else {
                vm.allCheck.orders = false;
            }
            vm.fOrders = angular.copy(vm.obj.orders);
            var timeout = $timeout(function () {
                $rootScope.$broadcast('ordersModified');
                $timeout.cancel(timeout);
            }, 10);


        });

        vm.checkAll = function () {
            if (vm.allCheck.checkbox && vm.jobChain) {

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
            if (timeout) {
                $timeout.cancel(timeout);
            }
            if (promise1)
                $timeout.cancel(promise1);
            if (promise2)
                $timeout.cancel(promise2);
        });

        vm.getOrders = getOrders;
        function getOrders(filter) {
            filter.jobschedulerId = vm.schedulerIds.selected;
            return OrderService.get(filter);
        }


        vm.getJobChainOrders = getOrders;
        vm.shouldPollForOrders = false;
        vm.orderPollingInterval = 15000;

        function showOrders() {

            var filter = {};
            filter.orders = {};
            filter.orders.jobChain = [];
            filter.compact = true;
            filter.orders.jobChain.push(vm.jobChain.path);
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
                if (vm.pageView == 'grid') {
                    var shouldRefresh = false;
                    angular.forEach(vm.orders, function (eOrder, eIndex) {
                        var exists = false;
                        angular.forEach(vm.obj.orders, function (sOrder, eIndex) {
                            if (sOrder.jobChain == eOrder.jobChain && sOrder.orderId == eOrder.orderId) {
                                exists = true;
                            }
                        })
                        if (eOrder.startedAt && !exists) {
                            vm.obj.orders.push(eOrder);
                            shouldRefresh = true;
                        }

                    })
                    if (shouldRefresh) {
                        vm.fOrders = angular.copy(vm.obj.orders);
                        var timeout = $timeout(function () {
                            $rootScope.$on('ordersModified');
                            $timeout.cancel(timeout);
                        }, 10)

                    }
                }
                var current = false;
                angular.forEach(vm.jobChain.nodes, function (node) {
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
                    if (!current && node.job && node.job.state && node.job.state.severity == 0) {
                        $timeout(function () {
                            node.job.state.severity = 1;
                            node.job.state._text = 'PENDING';
                        }, 10);
                    }
                })

                pollForOrders();
            }, function (err) {
                pollForOrders();
            });
        }

        var timeout = undefined;

        function pollForOrders() {
            console.log("polling 01");
            $timeout.cancel(timeout);
            if (vm.shouldPollForOrders) {
                console.log("polling");
                timeout = $timeout(function () {
                    showOrders(true);
                }, vm.orderPollingInterval);
            }
        }

        $rootScope.$on('OrderAdded', function () {
            console.log("Order added");
            vm.shouldPollForOrders = true;
            showOrders(true);
            pollForOrders();
        });


        var orders;


        vm.showPanel = '';
        vm.showPanelFuc = function (value) {
            vm.showPanel = value;
            vm.hidePanel = true;
        };
        vm.hidePanelFuc = function () {
            vm.showPanel = '';
            vm.hidePanel = !vm.hidePanel;
        };

        vm.isLoading1 = false;
        /*        vm.showTaskFuc = function (order) {

         vm.showTaskPanel = order;
         };
         vm.hideTaskPanel = function () {
         vm.showTaskPanel = undefined;
         };*/

        function loadHistory() {
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


        vm.viewAllHistories = function () {
            $state.go('app.history');
            JobChainService.selectedJobChain = vm.jobChain.path;
        };

        vm.setHeight = setHeight;

        function setHeight() {
            if (vm.fitToScreen) {
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

        function volatileInfo(result) {
            JobChainService.getJobChain({
                jobschedulerId: $scope.schedulerIds.selected,
                jobChain: vm.path
            }).then(function (res) {
                if (result)
                    vm.jobChain = angular.merge(res.jobChain, result.jobChain);
                else
                    vm.jobChain = res.jobChain;
                SOSAuth.setJobChain(JSON.stringify(vm.jobChain));
                SOSAuth.save();
                $rootScope.$broadcast('reloadJobChain');
            }, function () {
                vm.jobChain = result.jobChain;
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
                volatileInfo(result);
            }, function () {
                volatileInfo();
            });

        } else {
            toasty.error({
                title: gettextCatalog.getString('message.oops'),
                msg: gettextCatalog.getString('message.incorrectJobChainPath'),
                timeout: 0
            });
            vm.goBack();
        }

        $rootScope.expand_to = '';
        vm.setPath = function (path) {

            $rootScope.expand_to = {
                name: path,
                path: vm.path
            };
            $location.path('/jobChain')
        };

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
                $rootScope.$broadcast('OrderAdded', {orderId: order.orderId});
                toasty.success = {
                    'title': gettextCatalog.getString('message.addOrderSuccessfully')
                }
            }, function (err) {

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
                jobChains.compact = true;
                JobChainService.get(jobChains).then(function (res) {
                    vm.jobChain = angular.merge(vm.jobChain, res.jobChains[0]);
                });
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
                jobChains.compact = true;
                JobChainService.get(jobChains).then(function (res) {
                    vm.jobChain = angular.merge(vm.jobChain, res.jobChains[0]);
                });
            }, function (err) {

            });
            vm.object.jobChains = [];
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
                orders.compact = true;
                OrderService.get(orders).then(function (res) {
                    angular.forEach(vm.object.orders, function (orders) {
                        if (orders.path.substring(0, 1) != '/') {
                            orders.path = '/' + orders.path;
                        }
                        angular.forEach(res.orders, function (orderData) {
                            if (orders.path == orderData.path) {
                                orders = angular.merge(orders, orderData);
                            }
                        })
                    });
                    vm.object.orders = [];
                });

            }, function () {

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
                orders.compact = true;
                OrderService.get(orders).then(function (res) {
                    angular.forEach(vm.object.orders, function (orders) {
                        if (orders.path.substring(0, 1) != '/') {
                            orders.path = '/' + orders.path;
                        }
                        angular.forEach(res.orders, function (orderData) {
                            if (orders.path == orderData.path) {
                                orders = angular.merge(orders, orderData);
                            }
                        })
                    });
                    vm.object.orders = [];
                });


            }, function () {

            });

        };
        vm.resumeAllOrder = function () {
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            angular.forEach(vm.object.orders, function (value) {
                orders.orders.push({orderId: value.orderId, jobChain: value.jobChain});
            });
            OrderService.resumeOrder(orders).then(function (res) {
                orders.compact = true;
                OrderService.get(orders).then(function (res) {
                    angular.forEach(vm.object.orders, function (orders) {
                        if (orders.path.substring(0, 1) != '/') {
                            orders.path = '/' + orders.path;
                        }
                        angular.forEach(res.orders, function (orderData) {
                            if (orders.path == orderData.path) {
                                orders = angular.merge(orders, orderData);
                            }
                        })
                    });
                    vm.object.orders = [];
                });


            }, function () {

            });

        };
        vm.resetAllOrder = function () {
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            angular.forEach(vm.object.orders, function (value) {
                orders.orders.push({orderId: value.orderId, jobChain: value.jobChain});
            });
            OrderService.resetOrder(orders).then(function (res) {
                orders.compact = true;
                OrderService.get(orders).then(function (res) {
                    angular.forEach(vm.object.orders, function (orders) {
                        if (orders.path.substring(0, 1) != '/') {
                            orders.path = '/' + orders.path;
                        }
                        angular.forEach(res.orders, function (orderData) {
                            if (orders.path == orderData.path) {
                                orders = angular.merge(orders, orderData);
                            }
                        })
                    });
                    vm.object.orders = [];
                });
            }, function () {

            });

        };
        vm.startAllOrder = function () {
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            angular.forEach(vm.object.orders, function (value) {
                orders.orders.push({orderId: value.orderId, jobChain: value.jobChain, at: 'now'});
            });

            OrderService.startOrder(orders).then(function (res) {
                orders.compact = true;
                OrderService.get(orders).then(function (res) {
                    angular.forEach(vm.object.orders, function (orders) {
                        if (orders.path.substring(0, 1) != '/') {
                            orders.path = '/' + orders.path;
                        }
                        angular.forEach(res.orders, function (orderData) {
                            if (orders.path == orderData.path) {
                                orders = angular.merge(orders, orderData);
                            }
                        })
                    });
                    vm.object.orders = [];
                });
            }, function () {

            });

        };
    }

    OrderCtrl.$inject = ["$scope", "$rootScope", "OrderService", "orderByFilter", "$uibModal", "SavedFilter", "toasty", "gettextCatalog", "FileSaver", "Blob"];
    function OrderCtrl($scope, $rootScope, OrderService, orderBy, $uibModal, SavedFilter, toasty, gettextCatalog, FileSaver, Blob) {
        var vm = $scope;

        vm.filter = {};
        vm.filter.state = "ALL";
        vm.filter.sortBy = "orderId";
        vm.isLoading = false;

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
        vm.savedOrderFilter.selected = vm.savedOrderFilter.favorite;

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
            OrderService.tree({
                jobschedulerId: vm.schedulerIds.selected,
                compact: true,
                types: ['ORDER']
            }).then(function (res) {

                vm.filterTree = res.folders;
                vm.folderPath = '/';
                vm.tree = angular.copy(vm.filterTree);
                filteredTreeData();
                vm.calculateHeight();
                vm.isLoading = true;
            }, function (err) {
                vm.isLoading = true;
            });
        }

        initTree();


        vm.treeHandler = function (data) {
            navFullTree();
            data.selected1 = true;
            data.orders = [];
            vm.branchs = [];
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
            vm.branchs = [];
            vm.allOrders = [];
            vm.loading = true;
            vm.folderPath = data.name;

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
            vm.branchs = [];
            vm.allOrders = [];
            function recursive(data) {
                data.expanded = true;
                data.folders = orderBy(data.folders, 'name');

                data.orders = [];
                angular.forEach(vm.orders, function (value) {
                    if (data.path == value.path.substring(0, value.path.lastIndexOf('/')) || data.path == value.path.substring(0, value.path.lastIndexOf('/') + 1)) {
                        data.orders.push(value);
                        vm.allOrders.push(value);
                    }
                });

                if (data.orders.length > 0) {
                    vm.branchs.push(data);

                }
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

        function volatileFolderData(data, obj) {
            if (vm.filter.state != 'ALL') {
                obj.processingStates = [];
                obj.processingStates.push(vm.filter.state);
            }
            if (selectedFiltered)
                obj = parseDate(obj);

            OrderService.get(obj).then(function (res) {
                vm.loading = false;
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
                    vm.branchs = [];
                    vm.allOrders = [];
                    vm.branchs.push(data);
                    angular.forEach(data.orders, function (order) {
                        vm.allOrders.push(order);
                    });
                }
                vm.folderPath = data.name;
            }, function () {
                vm.loading = false;
                if (data.orders.length > 0) {
                    vm.branchs.push(data);
                    angular.forEach(data.orders, function (order) {
                        vm.allOrders.push(order);
                    });
                }
                vm.folderPath = data.name;
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


        function checkExpand(data) {
            if (data.selected1) {
                data.orders = [];
                expandFolderData(data);
                if (data.orders.length > 0) {
                    vm.branchs.push(data);
                }

                vm.folderPath = data.name;
                angular.forEach(data.orders, function (a) {
                    vm.allOrders.push(a);
                });
            }
            data.folders = orderBy(data.folders, 'name');
            angular.forEach(data.folders, function (value) {
                if (value.expanded)
                    checkExpand(value);
            });
        }

        function filteredTreeData() {
            angular.forEach(vm.tree, function (value) {
                value.expanded = true;
                vm.branchs = [];
                vm.allOrders = [];
                checkExpand(value);
            });
        }

        function checkExpandTreeForUpdates(data) {
            if (data.selected1) {
                var obj = {};
                obj.jobschedulerId = vm.schedulerIds.selected;
                obj.compact = true;
                if (vm.filter.state != 'ALL') {
                    obj.processingStates = [];
                    obj.processingStates.push(vm.filter.state);
                }

                if (selectedFiltered) {
                    obj.regex = selectedFiltered.regex;
                }
                obj.folders = [{folder: data.path, recursive: false}];

                OrderService.get(obj).then(function (res) {
                    if (res.orders) {
                         //update card view
                        if (obj.folders[0].folder == data.path) {
                            data.orders = res.orders;
                        }
                        //update list view
                        angular.forEach(data.jobChains, function (value) {
                            vm.allOrders.push(value);
                        });
                    }
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
            if (vm.filter.state != 'ALL') {
                obj.processingStates = [];
                obj.processingStates.push(vm.filter.state);
            }
            if (selectedFiltered)
                obj = parseDate(obj);
            OrderService.get(obj).then(function (res) {
                vm.loading = false;
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
            }, function () {
                if (expandNode) {
                    startTraverseNode(expandNode);
                }
                vm.loading = false;
            });
        }

        vm.changeStatus = function () {
            vm.allOrders = [];
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
            vm.reverse = !vm.reverse;
            vm.propertyName = propertyName;
            vm.filter.sortBy = propertyName;
            vm.allOrders = orderBy(vm.allOrders, vm.propertyName, vm.reverse);
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
                    vm.savedOrderFilter.favorite = vm.orderFilter.name;
                    vm.savedOrderFilter.selected = vm.orderFilter.name;
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
                selectedFiltered = undefined;
            } else if (vm.savedOrderFilter.selected == vm.orderFilter.name) {
                vm.savedOrderFilter.selected = undefined;
                selectedFiltered = undefined;

                vm.load();
            }
            SavedFilter.setOrder(vm.savedOrderFilter);
            SavedFilter.save();

        };

        vm.favorite = function (filter) {
            vm.savedOrderFilter.favorite = filter.name;
            vm.savedOrderFilter.selected = filter.name;
            selectedFiltered = filter;
            SavedFilter.setOrder(vm.savedOrderFilter);
            SavedFilter.save();

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
            if (filter)
                vm.savedOrderFilter.selected = filter.name;
            else
                vm.savedOrderFilter.selected = filter;
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
                orders.compact = true;
                OrderService.get(orders).then(function (res) {
                    angular.forEach(vm.object.orders, function (orders) {
                        if (orders.path.substring(0, 1) != '/') {
                            orders.path = '/' + orders.path;
                        }
                        angular.forEach(res.orders, function (orderData) {
                            if (orders.path == orderData.path) {
                                orders = angular.merge(orders, orderData);
                            }
                        })
                    });
                    vm.object.orders = [];
                });

            }, function () {

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
                orders.compact = true;
                OrderService.get(orders).then(function (res) {
                    angular.forEach(vm.object.orders, function (orders) {
                        if (orders.path.substring(0, 1) != '/') {
                            orders.path = '/' + orders.path;
                        }
                        angular.forEach(res.orders, function (orderData) {
                            if (orders.path == orderData.path) {
                                orders = angular.merge(orders, orderData);
                            }
                        })
                    });
                    vm.object.orders = [];
                });


            }, function () {

            });

        };
        vm.resumeAllOrder = function () {
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            angular.forEach(vm.object.orders, function (value) {
                orders.orders.push({orderId: value.orderId, jobChain: value.jobChain});
            });
            OrderService.resumeOrder(orders).then(function (res) {
                orders.compact = true;
                OrderService.get(orders).then(function (res) {
                    angular.forEach(vm.object.orders, function (orders) {
                        if (orders.path.substring(0, 1) != '/') {
                            orders.path = '/' + orders.path;
                        }
                        angular.forEach(res.orders, function (orderData) {
                            if (orders.path == orderData.path) {
                                orders = angular.merge(orders, orderData);
                            }
                        })
                    });
                    vm.object.orders = [];
                });


            }, function () {

            });

        };
        vm.resetAllOrder = function () {
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            angular.forEach(vm.object.orders, function (value) {
                orders.orders.push({orderId: value.orderId, jobChain: value.jobChain});
            });
            OrderService.resetOrder(orders).then(function (res) {
                orders.compact = true;
                OrderService.get(orders).then(function (res) {
                    angular.forEach(vm.object.orders, function (orders) {
                        if (orders.path.substring(0, 1) != '/') {
                            orders.path = '/' + orders.path;
                        }
                        angular.forEach(res.orders, function (orderData) {
                            if (orders.path == orderData.path) {
                                orders = angular.merge(orders, orderData);
                            }
                        })
                    });
                    vm.object.orders = [];
                });
            }, function () {

            });

        };
        vm.startAllOrder = function () {
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            angular.forEach(vm.object.orders, function (value) {
                orders.orders.push({orderId: value.orderId, jobChain: value.jobChain, at: 'now'});
            });

            OrderService.startOrder(orders).then(function (res) {
                orders.compact = true;
                OrderService.get(orders).then(function (res) {
                    angular.forEach(vm.object.orders, function (orders) {
                        if (orders.path.substring(0, 1) != '/') {
                            orders.path = '/' + orders.path;
                        }
                        angular.forEach(res.orders, function (orderData) {
                            if (orders.path == orderData.path) {
                                orders = angular.merge(orders, orderData);
                            }
                        })
                    });
                    vm.object.orders = [];
                });
            }, function () {

            });

        };
        vm.downloadLog = function () {
            var data = new Blob([vm.logs], {type: 'text/plain;charset=utf-8'});
            FileSaver.saveAs(data, 'order.log');
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


        $scope.$on('$destroy', function () {
            //watcher();
            watcher1();
        });

    }

    OrderOverviewCtrl.$inject = ["$scope", "$rootScope", "OrderService", "$stateParams", "orderByFilter", "$uibModal", "SavedFilter", "toasty", "FileSaver", "$interval"];
    function OrderOverviewCtrl($scope, $rootScope, OrderService, $stateParams, orderBy, $uibModal, SavedFilter, toasty, FileSaver, $interval) {
        var vm = $scope;

        vm.name = $stateParams.name;

        vm.filter = {};
        vm.filter.state = vm.name;
        vm.filter.sortBy = "orderId";
        vm.isLoading = false;

        vm.tree = [];
        vm.allOrders = [];
        vm.my_tree = {};

        vm.object = {};
        vm.filter_tree = {};
        vm.filterTree1 = [];
        vm.object.paths = [];
        var selectedFiltered;

        vm.reset = function () {
            vm.object.orders = [];
        };


        vm.savedOrderFilter = JSON.parse(SavedFilter.orderFilters) || {};
        vm.savedOrderFilter.list = vm.savedOrderFilter.list || [];
        vm.savedOrderFilter.selected = vm.savedOrderFilter.favorite;

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
         * Filter tree data based on select folders
         */
        function filterTreeData() {
            vm.tree = angular.copy(vm.filterTree);
            filteredTreeData();
        }

        /**
         * Function to initialized tree view
         */
        function initTree() {
            OrderService.tree({
                jobschedulerId: vm.schedulerIds.selected,
                compact: true,
                types: ['ORDER']
            }).then(function (res) {

                vm.filterTree = res.folders;

                filterTreeData();
                vm.calculateHeight();
                vm.isLoading = true;
            }, function (err) {
                vm.isLoading = true;
            });
        }

        initTree();


        vm.treeHandler = function (data) {
            navFullTree();
            data.selected1 = true;
            data.orders = [];
            vm.branchs = [];
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
            vm.branchs = [];
            vm.allOrders = [];
            vm.loading = true;
            vm.folderPath = data.name;

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
            vm.branchs = [];
            vm.allOrders = [];
            function recursive(data) {
                data.expanded = true;
                data.folders = orderBy(data.folders, 'name');

                data.orders = [];
                angular.forEach(vm.orders, function (value) {
                    if (data.path == value.path.substring(0, value.path.lastIndexOf('/')) || data.path == value.path.substring(0, value.path.lastIndexOf('/') + 1)) {
                        data.orders.push(value);
                        vm.allOrders.push(value);
                    }
                });

                if (data.orders.length > 0) {
                    vm.branchs.push(data);

                }
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

        function volatileFolderData(data, obj) {
            if (vm.filter.state != 'ALL') {
                obj.processingStates = [];
                obj.processingStates.push(vm.filter.state);
            }
            if (selectedFiltered)
                obj = parseDate(obj);

            OrderService.get(obj).then(function (res) {
                vm.loading = false;
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
                    vm.branchs = [];
                    vm.allOrders = [];
                    vm.branchs.push(data);
                    angular.forEach(data.orders, function (order) {
                        vm.allOrders.push(order);
                    });
                }
                vm.folderPath = data.name;
            }, function () {
                vm.loading = false;
                if (data.orders.length > 0) {
                    vm.branchs.push(data);
                    angular.forEach(data.orders, function (order) {
                        vm.allOrders.push(order);
                    });
                }
                vm.folderPath = data.name;
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


        function checkExpand(data) {
            if (data.selected1) {
                data.orders = [];
                expandFolderData(data);
                if (data.orders.length > 0) {
                    vm.branchs.push(data);
                }

                vm.folderPath = data.name;
                angular.forEach(data.orders, function (a) {
                    vm.allOrders.push(a);
                });
            }
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
                    vm.allOrders = [];
                    checkExpand(value);
                }
            });
        }

        function checkExpandTreeForUpdates(data) {
            console.log(data)
            if (data.selected1) {
                var obj = {};
                obj.jobschedulerId = vm.schedulerIds.selected;
                obj.compact = true;
                if (vm.filter.state != 'ALL') {
                    obj.processingStates = [];
                    obj.processingStates.push(vm.filter.state);
                }
                if (selectedFiltered) {
                    obj.regex = selectedFiltered.regex;
                }
                obj.folders = [{folder: data.path, recursive: false}];

                OrderService.get(obj).then(function (res) {
                    if (res.orders) {
                         //update card view
                        if (obj.folders[0].folder == data.path) {
                            data.orders = res.orders;
                        }
                        //update list view
                        angular.forEach(data.jobChains, function (value) {
                            vm.allOrders.push(value);
                        });
                    }
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
            if (vm.filter.state != 'ALL') {
                obj.processingStates = [];
                obj.processingStates.push(vm.filter.state);
            }
            if (selectedFiltered)
                obj = parseDate(obj);
            OrderService.get(obj).then(function (res) {
                vm.loading = false;
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
            }, function () {
                vm.loading = false;
                if (expandNode) {
                    startTraverseNode(expandNode);
                }
            });
        }

        vm.changeStatus = function () {
            vm.allOrders = [];
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
            vm.reverse = (propertyName !== null && vm.propertyName === propertyName) ? !vm.reverse : false;
            vm.propertyName = propertyName;
            vm.allOrders = orderBy(vm.allOrders, vm.propertyName, vm.reverse);
        };
        vm.mainSortBy1 = function (propertyName) {
            vm.reset();
            vm.sortReverse = !vm.sortReverse;
            vm.filter.sortBy = propertyName;
            vm.allOrders = orderBy(vm.allOrders, vm.filter.sortBy, vm.sortReverse);
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
                    vm.savedOrderFilter.favorite = vm.orderFilter.name;
                    vm.savedOrderFilter.selected = vm.orderFilter.name;
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
                selectedFiltered = undefined;

                vm.load();
            } else if (vm.savedOrderFilter.selected == vm.orderFilter.name) {
                vm.savedOrderFilter.selected = undefined;
                selectedFiltered = undefined;

                vm.load();
            }
            SavedFilter.setOrder(vm.savedOrderFilter);
            SavedFilter.save();

        };

        vm.favorite = function (filter) {
            vm.savedOrderFilter.favorite = filter.name;
            vm.savedOrderFilter.selected = filter.name;
            selectedFiltered = filter;
            SavedFilter.setOrder(vm.savedOrderFilter);
            SavedFilter.save();

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
            if (filter)
                vm.savedOrderFilter.selected = filter.name;
            else
                vm.savedOrderFilter.selected = filter;
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
                orders.compact = true;
                OrderService.get(orders).then(function (res) {
                    angular.forEach(vm.object.orders, function (orders) {
                        if (orders.path.substring(0, 1) != '/') {
                            orders.path = '/' + orders.path;
                        }
                        angular.forEach(res.orders, function (orderData) {
                            if (orders.path == orderData.path) {
                                orders = angular.merge(orders, orderData);
                            }
                        })
                    });
                    vm.object.orders = [];
                });

            }, function () {

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
                orders.compact = true;
                OrderService.get(orders).then(function (res) {
                    angular.forEach(vm.object.orders, function (orders) {
                        if (orders.path.substring(0, 1) != '/') {
                            orders.path = '/' + orders.path;
                        }
                        angular.forEach(res.orders, function (orderData) {
                            if (orders.path == orderData.path) {
                                orders = angular.merge(orders, orderData);
                            }
                        })
                    });
                    vm.object.orders = [];
                });


            }, function () {

            });

        };

        vm.resumeAllOrder = function () {
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            angular.forEach(vm.object.orders, function (value) {
                orders.orders.push({orderId: value.orderId, jobChain: value.jobChain});
            });
            OrderService.resumeOrder(orders).then(function (res) {
                orders.compact = true;
                OrderService.get(orders).then(function (res) {
                    angular.forEach(vm.object.orders, function (orders) {
                        if (orders.path.substring(0, 1) != '/') {
                            orders.path = '/' + orders.path;
                        }
                        angular.forEach(res.orders, function (orderData) {
                            if (orders.path == orderData.path) {
                                orders = angular.merge(orders, orderData);
                            }
                        })
                    });
                    vm.object.orders = [];
                });


            }, function () {

            });

        };
        vm.resetAllOrder = function () {
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            angular.forEach(vm.object.orders, function (value) {
                orders.orders.push({orderId: value.orderId, jobChain: value.jobChain});
            });
            OrderService.resetOrder(orders).then(function (res) {
                orders.compact = true;
                OrderService.get(orders).then(function (res) {
                    angular.forEach(vm.object.orders, function (orders) {
                        if (orders.path.substring(0, 1) != '/') {
                            orders.path = '/' + orders.path;
                        }
                        angular.forEach(res.orders, function (orderData) {
                            if (orders.path == orderData.path) {
                                orders = angular.merge(orders, orderData);
                            }
                        })
                    });
                    vm.object.orders = [];
                });
            }, function () {

            });

        };
        vm.startAllOrder = function () {
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            angular.forEach(vm.object.orders, function (value) {
                orders.orders.push({orderId: value.orderId, jobChain: value.jobChain, at: 'now'});
            });

            OrderService.startOrder(orders).then(function (res) {
                orders.compact = true;
                OrderService.get(orders).then(function (res) {
                    angular.forEach(vm.object.orders, function (orders) {
                        if (orders.path.substring(0, 1) != '/') {
                            orders.path = '/' + orders.path;
                        }
                        angular.forEach(res.orders, function (orderData) {
                            if (orders.path == orderData.path) {
                                orders = angular.merge(orders, orderData);
                            }
                        })
                    });
                    vm.object.orders = [];
                });
            }, function () {

            });

        };
        vm.downloadLog = function () {
            var data = new Blob([vm.logs], {type: 'text/plain;charset=utf-8'});
            FileSaver.saveAs(data, 'order.log');
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


        $scope.$on('$destroy', function () {
            // watcher();
            watcher1();

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
                if (vm.allOrders)
                    vm.allCheck.checkbox = newNames.length == vm.allOrders.slice((vm.pageSize * (vm.currentPage - 1)), (vm.pageSize * vm.currentPage)).length;
                else
                    vm.allCheck.checkbox = newNames.length == vm.orders.slice((vm.pageSize * (vm.currentPage - 1)), (vm.pageSize * vm.currentPage)).length;
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
                        if (value.processingState._text != 'BLACKLIST') {
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
                    vm.object.orders = vm.allOrders.slice((vm.pageSize * (vm.currentPage - 1)), (vm.pageSize * vm.currentPage));
                else if (vm.orders && vm.orders.length > 0)
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
            orders.orders.push({orderId: order.orderId, jobChain: order.jobChain, at: 'now'});

            OrderService.startOrder(orders).then(function (res) {

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
            vm.object.orders = [];
        };

        function setOrderState(order) {

            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            orders.orders.push({
                orderId: order.orderId,
                jobChain: order.jobChain,
                state: order.state,
                endState: order.endState
            });
            orders.state = vm.order.state;
            orders.endState = vm.order.endState;
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
                vm._jobChain = res.jobChain;
                angular.forEach(res.jobChain.endNodes, function (value) {
                    vm._jobChain.nodes.push(value);
                });
            });
        };

        function setRunTime(order) {
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            orders.orders.push({orderId: order.orderId, jobChain: order.jobChain, runTime: order.runTime});

            OrderService.setRunTime(orders).then(function (res) {
                var orders = {};
                orders.orders = [];
                orders.compact = true;
                orders.jobschedulerId = $scope.schedulerIds.selected;
                orders.orders.push({orderId: order.orderId, jobChain: order.jobChain});
                OrderService.get(orders).then(function (res) {
                    order = angular.merge(order, res.orders[0]);
                });
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
            orders.orders = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            orders.orders.push({orderId: order.orderId, jobChain: order.jobChain});
            OrderService.suspendOrder(orders).then(function (res) {
                orders.compact = true;
                OrderService.get(orders).then(function (res) {
                    order = angular.merge(order, res.orders[0]);
                });
            }, function () {

            });
            vm.object.orders = [];
        };

        vm.resumeOrder = function (order) {
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            orders.orders.push({orderId: order.orderId, jobChain: order.jobChain});
            OrderService.resumeOrder(orders).then(function (res) {
                orders.compact = true;
                OrderService.get(orders).then(function (res) {
                    order = angular.merge(order, res.orders[0]);
                });
            }, function () {

            });
            vm.object.orders = [];
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
                vm.object.orders = [];
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
                state: order.state,
                endState: order.endState,
                resume: true
            });
            orders.state = vm.order.state;
            orders.endState = vm.order.endState;
            orders.resume = true;
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
            vm.object.orders = [];
        };

        function resumeOrderWithParam(order, paramObject) {
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            orders.orders.push({orderId: order.orderId, jobChain: order.jobChain});
            orders.params.concat(paramObject.params);
            OrderService.resumeOrder(orders).then(function (res) {
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
            orders.orders = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            orders.orders.push({orderId: order.orderId, jobChain: order.jobChain});
            OrderService.resetOrder(orders).then(function (res) {
                orders.compact = true;
                OrderService.get(orders).then(function (res) {
                    order = angular.merge(order, res.orders[0]);
                });
            }, function () {

            });
            vm.object.orders = [];
        };

        vm.removeOrder = function (order) {
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            orders.orders.push({orderId: order.orderId, jobChain: order.jobChain});
            OrderService.removeOrder(orders).then(function (res) {
                orders.compact = true;
                OrderService.get(orders).then(function (res) {
                    order = angular.merge(order, res.orders[0]);
                });
            }, function () {

            });
            vm.object.orders = [];
        };

        vm.deleteOrder = function (order) {
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            orders.orders.push({orderId: order.orderId, jobChain: order.jobChain});
            OrderService.deleteOrder(orders).then(function (res) {
                orders.compact = true;
                OrderService.get(orders).then(function (res) {
                    order = angular.merge(order, res.orders[0]);
                });
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
        }

        vm.isLoading1 = true;
        vm.showLogFuc = function (value) {
                vm.isLoading1 = false;
                var orders = {};
 /*                orders.jobschedulerId = $scope.schedulerIds.selected;
                orders.jobChain = value.jobChain;
                orders.orderId = value.orderId;
               OrderService.history(orders).then(function (res) {
                    vm.steps = res.history.steps;
                    vm.isLoading1 = true;
                }, function () {
                    vm.isLoading1 = true;
                });*/
                orders = {};
                orders.orders = [];
                orders.orders.push({orderId : value.orderId,jobChain:value.jobChain});
                orders.jobschedulerId = $scope.schedulerIds.selected;

                OrderService.histories(orders).then(function (res) {
                    vm.historys = res.history;
                    vm.isLoading1 = true;
                }, function () {
                    vm.isLoading1 = true;
                });

            vm.showLogPanel = value;
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

        vm.logClass = function (logData) {
            var logStatus = logData.substring(logData.indexOf("[") + 1, logData.indexOf("]"));
            return "log_" + logStatus.toLowerCase();
        }
    }

    HistoryCtrl.$inject = ["$scope", "OrderService", "TaskService", "$uibModal", "SavedFilter", "toasty", "$timeout", "gettextCatalog", "FileSaver",
        "Blob", "JobService", "JobChainService", "$interval", "$rootScope", "orderByFilter",];
    function HistoryCtrl($scope, OrderService, TaskService, $uibModal, SavedFilter, toasty, $timeout, gettextCatalog, FileSaver,
                         Blob, JobService, JobChainService, $interval, $rootScope, orderBy) {
        var vm = $scope;
        vm.isLoading = false;
        vm.filter = {};
        vm.filter.type = 'jobChain';
        vm.filter.date = '1h';
        vm.filter.state = 'all';

        vm.pageSize = 25;
        vm.currentPage = 1;

        vm.object = {};
        vm.tree = [];
        var selectedFiltered1, selectedFiltered2;

        var promise1;

        vm.historyFilterObj = JSON.parse(SavedFilter.historyFilters) || {};

        vm.savedHistoryFilter = vm.historyFilterObj.order || {};
        vm.savedHistoryFilter.list = vm.savedHistoryFilter.list || [];
        vm.savedHistoryFilter.selected = vm.savedHistoryFilter.favorite;

        vm.savedJobHistoryFilter = vm.historyFilterObj.job || {};
        vm.savedJobHistoryFilter.list = vm.savedJobHistoryFilter.list || [];
        vm.savedJobHistoryFilter.selected = vm.savedJobHistoryFilter.favorite;


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
            vm.sortReverse = !vm.sortReverse;
            vm.filter.sortBy = propertyName;
            vm.historys = orderBy(vm.historys, vm.filter.sortBy, vm.sortReverse);

        };
        vm.sortBy1 = function (propertyName) {
            vm.sortReverse1 = !vm.sortReverse1;
            vm.filter.sortBy1 = propertyName;
            vm.jobHistorys = orderBy(vm.jobHistorys, vm.filter.sortBy1, vm.sortReverse1);
        };

        vm.jobHistory = jobHistory;
        function jobHistory() {

            vm.isLoading = false;
            var filter = {jobschedulerId: $scope.schedulerIds.selected};
            if (JobService.jobSelected) {
                filter.jobs = [];
                filter.jobs[0] = {job: JobService.jobSelected};

            } else {

                filter.dateFrom = convertToDate();
                filter.dateTo = moment.utc().format();
                if (selectedFiltered2) {
                    filter = jobParseDate(filter);
                }
            }
            TaskService.histories(filter).then(function (res) {
                vm.temp1 = res.history;
                filterJobData();
                vm.isLoading = true;
            }, function () {
                vm.isLoading = true;
                vm.isError = true;
            });
        }

        function convertToDate() {

            var date = new Date();

            if (vm.filter.date == '1h') {

                date.setHours(date.getHours() - 1);
            } else if (vm.filter.date == '12h') {
                date.setHours(date.getHours() - 12);
            } else if (vm.filter.date == '1d') {
                date.setDate(date.getDate() - 1);
            } else if (vm.filter.date == '1w') {
                date.setDate(date.getDate() - 7);
            }

            return vm.filter.date == 'all' ? undefined : moment.utc(date).format();
        }

        vm.init = function (filter) {
            if (vm.filter.type == 'job') {
                jobHistory();
            } else {
                if (JobChainService.selectedJobChain) {
                    filter.orders = [];
                    filter.orders.push({jobChain: JobChainService.selectedJobChain});
                } else {
                    filter.dateFrom = convertToDate();
                    filter.dateTo = moment.utc().format();
                    if (selectedFiltered1) {
                        filter = orderParseDate(filter);
                    }
                }

                OrderService.histories(filter).then(function (res) {
                    vm.temp = res.history;
                    filterData();

                    vm.isLoading = true;
                }, function () {
                    vm.isLoading = true;
                    vm.isError = true;
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
            if (selectedFiltered1 && selectedFiltered1.state && selectedFiltered1.state.length > 0) {
                var data = [];
                angular.forEach(vm.temp, function (res) {
                    var flag = true;
                    if (res.state) {
                        if (selectedFiltered1.state.indexOf(res.state._text) === -1) {
                            flag = false;
                        }
                    }
                    if (flag)
                        data.push(res);
                });
                vm.historys = data;

            } else {
                vm.historys = angular.copy(vm.temp);
            }
        }

        function filterJobData() {

            if (selectedFiltered2 && selectedFiltered2.state && selectedFiltered2.state.length > 0) {
                var data = [];
                angular.forEach(vm.temp1, function (res) {
                    var flag = true;
                    if (flag && selectedFiltered2.state && res.state) {
                        if (selectedFiltered2.state.indexOf(res.state._text) === -1) {
                            flag = false;
                        }
                    }

                    if (flag)
                        data.push(res);
                });
                vm.jobHistorys = data;

            } else {
                vm.jobHistorys = angular.copy(vm.temp1);
            }
        }


        vm.loadHistory = function () {
            vm.init({jobschedulerId: $scope.schedulerIds.selected})
        };


        vm.hideLogPanel = function () {
            vm.showLogPanel = undefined;
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

        var watcher5 = $scope.$watch('pageSize', function (newNames) {
            if (newNames)
                vm.object = {};
        });

        vm.checkAll = function () {
            if (vm.allCheck.checkbox && (vm.historys.length > 0 || vm.jobHistorys.length > 0)) {
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
                if (vm.filter.type == 'jobChain') {
                    vm.savedHistoryFilter.list.push(vm.historyFilter);


                    if (vm.savedHistoryFilter.list.length == 1) {
                        vm.savedHistoryFilter.favorite = vm.historyFilter.name;
                        vm.savedHistoryFilter.selected = vm.historyFilter.name;
                        selectedFiltered1 = vm.historyFilter;
                        vm.init({jobschedulerId: $scope.schedulerIds.selected});
                    }
                    vm.historyFilterObj.order = vm.savedHistoryFilter;


                } else {
                    vm.savedJobHistoryFilter.list.push(vm.historyFilter);


                    if (vm.savedJobHistoryFilter.list.length == 1) {
                        vm.savedJobHistoryFilter.favorite = vm.historyFilter.name;
                        vm.savedJobHistoryFilter.selected = vm.historyFilter.name;
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
            if (vm.filter.type == 'jobChain') {
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

                if (vm.filter.type == 'jobChain') {
                    angular.forEach(vm.savedHistoryFilter.list, function (value, index) {
                        if (value.name == filter.name) {
                            vm.savedHistoryFilter.list[index] = vm.historyFilter;
                        }
                    });
                    if (vm.savedHistoryFilter.selected == vm.filterName) {
                        vm.savedHistoryFilter.selected = vm.historyFilter.name;
                        selectedFiltered1 = vm.historyFilter;
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
                    selectedFiltered1 = undefined;
                } else if (vm.savedHistoryFilter.selected == vm.historyFilter.name) {
                    vm.savedHistoryFilter.selected = undefined;
                    selectedFiltered1 = undefined;
                }
                vm.historyFilterObj.order = vm.savedHistoryFilter;
                vm.init({jobschedulerId: $scope.schedulerIds.selected});

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
                    selectedFiltered2 = undefined;
                } else if (vm.savedJobHistoryFilter.selected == vm.historyFilter.name) {
                    vm.savedJobHistoryFilter.selected = undefined;
                    selectedFiltered2 = undefined;
                }
                vm.historyFilterObj.job = vm.savedJobHistoryFilter;
                filterJobData();
            }
            SavedFilter.setHistory(vm.historyFilterObj);
            SavedFilter.save();
        };

        vm.favorite = function (filter) {
            if (vm.filter.type == 'jobChain') {
                vm.savedHistoryFilter.favorite = filter.name;
                vm.savedHistoryFilter.selected = filter.name;
                vm.historyFilterObj.order = vm.savedHistoryFilter;
                selectedFiltered1=filter;
            } else {
                vm.savedJobHistoryFilter.favorite = filter.name;
                vm.savedJobHistoryFilter.selected = filter.name;
                vm.historyFilterObj.job = vm.savedJobHistoryFilter;
                selectedFiltered2=filter;
            }

            SavedFilter.setHistory(vm.historyFilterObj);
            SavedFilter.save();
            vm.init({jobschedulerId: $scope.schedulerIds.selected});
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
                if (filter)
                    vm.savedHistoryFilter.selected = filter.name;
                else
                    vm.savedHistoryFilter.selected = filter;
                selectedFiltered1 = filter;

                vm.historyFilterObj.order = vm.savedHistoryFilter;

            } else {
                if (filter)
                    vm.savedJobHistoryFilter.selected = filter.name;
                else
                    vm.savedJobHistoryFilter.selected = filter;
                selectedFiltered2 = filter;

                vm.historyFilterObj.job = vm.savedJobHistoryFilter;

            }
            vm.init({jobschedulerId: $scope.schedulerIds.selected});
            SavedFilter.setHistory(vm.historyFilterObj);
            SavedFilter.save();
        };


        $scope.$on('$destroy', function () {
            watcher1();
            watcher2();
            watcher5();
            watcher6();
            if (promise1) {
                $timeout.cancel(promise1);
            }

        });

        vm.downloadLog = function () {
            var data = new Blob([vm.logs], {type: 'text/plain;charset=utf-8'});
            FileSaver.saveAs(data, 'history.log');
        }
    }

    LogCtrl.$inject = ["$scope", "OrderService", "TaskService", "$stateParams", "$location", "FileSaver", "$sce"];
    function LogCtrl($scope, OrderService, TaskService, $stateParams, $location, FileSaver, $sce) {
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
                vm.isError = true;
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
