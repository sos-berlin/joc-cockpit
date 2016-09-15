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

    JobChainOrdersCtrl.$inject = ["$scope", "$rootScope", "SOSAuth", "OrderService", "$state", "CoreService"];
    function JobChainOrdersCtrl($scope, $rootScope, SOSAuth, OrderService, $state, CoreService) {
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
            OrderService.getJobOrdersP(vm.jobChain.path, vm.schedulerIds.selected).then(function (result) {

                OrderService.getJobOrders(vm.jobChain.path, vm.schedulerIds.selected).then(function (res) {
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

        vm.$on("orderState", function (evt, state) {

            var data = [];
            angular.forEach(vm.temp, function (value) {
                if (value.processingState._text.toLowerCase() === state || state === 'all')
                    data.push(value);
            });
            vm.orders = data;
        });

        vm.showOrder = function (order) {
            SOSAuth.setOrder(order);
            SOSAuth.save();
            $state.go('app.orderFlow');
        };
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

    JobChainOverviewCtrl.$inject = ["$scope", "$rootScope", "OrderService", "SOSAuth", "JobChainService", "JobService",
        "$timeout", "toasty", "$interval", "$q","orderByFilter"];
    function JobChainOverviewCtrl($scope, $rootScope, OrderService, SOSAuth, JobChainService, JobService, $timeout, toasty, $interval, $q,orderBy) {

        var vm = $scope;
        $rootScope.overview = true;
        vm.pageView = 'list';
        vm.showErrorNodes = true;
        vm.selectedNodes = [];

        // var ordersData = [];


        vm.onAdd = function (item) {
            $timeout(function () {
                vm.selectedNodes.push(item);
            }, 100);

            console.log("Added " + JSON.stringify(vm.selectedNodes));
        };

        vm.onRemove = function (item) {
            angular.forEach(vm.selectedNodes, function (node, index) {
                if (node.name == item.name) {
                    $timeout(function () {
                        vm.selectedNodes.splice(index, 1);
                    }, 100);

                    console.log("Removed " + JSON.stringify(vm.selectedNodes));
                }
            })
        };

        vm.getJobChainConfiguration = function () {
            OrderService.getConfiguration(vm.schedulerIds.selected).then(function (res) {
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


            })
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


            })
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


            })
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
            })
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


            })
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

        // getJobChainP();
        function getJobChainP() {
            JobChainService.getJobChainP().then(function (res) {
                vm.jobs = res;
            }, function (err) {

            })
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


        vm.$on("slideEnded", function () {
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
            } else {
                vm.allCheck.checkbox = false;
            }
            vm.selectedNodes = vm.object.nodes;
        });

        var watcher2 = vm.$watchCollection('filtered', function (newNames) {
            if (newNames)
                vm.object.nodes = [];
        });


        vm.checkAll = function () {
            if (vm.allCheck.checkbox) {

                vm.object.nodes = vm.jobChain.nodes;
            } else {
                vm.object.nodes = [];
            }

        };
        vm.$on('$destroy', function () {
            watcher1();
            watcher2();
        });

        vm.getOrders = getOrders;
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

        $rootScope.$on('OrderAdded', function (event,args) {
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
                            console.log("Node name "+vm.jobChain.nodes[jobNumber].name);
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

    }

    JobChainDetailsCtrl.$inject = ["$scope", "SOSAuth", "orderByFilter", "ScheduleService", "JobChainService", "$uibModal", "OrderService", "toasty", "$rootScope"];
    function JobChainDetailsCtrl($scope, SOSAuth, orderBy, ScheduleService, JobChainService, $uibModal, OrderService, toasty, $rootScope) {
        var vm = $scope;
        vm.filter = {};

        if (SOSAuth.jobChain) {
            vm.jobChain = JSON.parse(SOSAuth.jobChain);
        }
        vm.$on('$stateChangeSuccess', function () {
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


        //These variables MUST be set as a minimum for the calendar to work
        vm.calendarView = 'month';
        vm.viewDate = new Date();
        vm.events = [];
        vm.isCellOpen = true;

        vm.viewCalendar = function () {
            vm._jobChain = vm.jobChain;
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/calendar-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                size: 'lg'
            });
            modalInstance.result.then(function () {

            }, function () {

            });
            vm.object.jobChains = [];

        };
        function addOrder(order, paramObject) {
            var orders = {};
            orders = order;
            orders.jobschedulerId = vm.schedulerIds.selected;
            orders.params = paramObject;
            OrderService.addOrder(orders).then(function (res) {
                toasty.success = {
                    'title': 'Order Successfully added'
                }
            }, function (err) {

            });
            vm.object.orders = [];
            $rootScope.$broadcast('OrderAdded',{orderId:order.orderId});
        }

        vm.addOrder = function () {

            ScheduleService.getSchedulesP({jobschedulerId: vm.schedulerIds.selected}).then(function (res) {
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
            jobChains.jobschedulerId = vm.schedulerIds.selected;
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
            jobChains.jobschedulerId = vm.schedulerIds.selected;
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
            orders.jobschedulerId = vm.schedulerIds.selected;

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
            orders.jobschedulerId = vm.schedulerIds.selected;
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
            orders.jobschedulerId = vm.schedulerIds.selected;
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
            orders.jobschedulerId = vm.schedulerIds.selected;
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

    OrderCtrl.$inject = ["$scope", "OrderService", "CoreService", "orderByFilter", "$uibModal", "SavedFilter", "toasty", "gettextCatalog","FileSaver","Blob"];
    function OrderCtrl($scope, OrderService, CoreService, orderBy, $uibModal, SavedFilter, toasty,gettextCatalog,FileSaver,Blob) {
        var vm = $scope;

        vm.filter = {};
        vm.filter.state = "all";
        vm.filter.sortBy = "status";
        vm.isLoading = false;

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

        vm.downloadLog = function(logs){
            var data = new Blob(['file-with-test-log-data'],{type:'text/plain;charset=utf-8'});
            FileSaver.saveAs(data,'order.log');
        }

        vm.init = function () {
            OrderService.getOrdersP({jobschedulerId: vm.schedulerIds.selected}).then(function (result) {
                angular.forEach(result.orders, function (value) {
                    value.path1 = value.path.substring(1, value.path.lastIndexOf('/'));
                });
                vm.orders = result.orders;
                vm.isLoading = true;

                OrderService.get({jobschedulerId: vm.schedulerIds.selected}).then(function (res) {
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
            if (vm.savedOrderFilter.selected) {
                filterData();
                var data = [];
                angular.forEach(vm.orders, function (value) {
                    if (value.processingState._text.toLowerCase() == vm.filter.state || vm.filter.state == 'all')
                        data.push(value);
                });
                vm.orders = data;
            } else {
                var data = [];
                angular.forEach(vm.temp, function (value) {
                    if (value.processingState._text.toLowerCase() == vm.filter.state || vm.filter.state == 'all')
                        data.push(value);
                });
                vm.orders = data;
            }
        };

        vm.load1 = function () {
            if (vm.savedOrderFilter.selected) {
                filterData();
                var data = [];
                angular.forEach(vm.orders, function (value) {
                    if (value._type.toLowerCase() == vm.filter.state)
                        data.push(value);
                });
                vm.orders = data;
            } else {
                var data = [];
                angular.forEach(vm.temp, function (value) {
                    if (value._type.toLowerCase() == vm.filter.state)
                        data.push(value);
                });
                vm.orders = data;
            }
        };


        vm.$on("orderState", function (evt, state) {
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
            orders.jobschedulerId = vm.schedulerIds.selected;

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
            orders.jobschedulerId = vm.schedulerIds.selected;
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
            orders.jobschedulerId = vm.schedulerIds.selected;
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
            orders.jobschedulerId = vm.schedulerIds.selected;
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

    OrderOverviewCtrl.$inject = ["$scope", "OrderService", "$stateParams", "SOSAuth", "$location", "orderByFilter", "$uibModal", "SavedFilter", "toasty"];
    function OrderOverviewCtrl($scope, OrderService, $stateParams, SOSAuth, $location, orderBy, $uibModal, SavedFilter, toasty) {
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
            OrderService.getOrdersP({jobschedulerId: vm.schedulerIds.selected}).then(function (result) {
                angular.forEach(result.orders, function (value) {
                    value.path1 = value.path.substring(1, value.path.lastIndexOf('/'));
                });
                OrderService.get({jobschedulerId: vm.schedulerIds.selected}).then(function (res) {
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


        vm.viewOrder = function (order) {
            SOSAuth.setOrder(order);
            SOSAuth.save();
            $location.path('/' + $stateParams.name + '/orderFlow');
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
            orders.jobschedulerId = vm.schedulerIds.selected;

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
            orders.jobschedulerId = vm.schedulerIds.selected;
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
            orders.jobschedulerId = vm.schedulerIds.selected;
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
            orders.jobschedulerId = vm.schedulerIds.selected;
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



    OrderFunctionCtrl.$inject = ["$scope", "$rootScope", "OrderService", "$uibModal", "ScheduleService", 'toasty'];
    function OrderFunctionCtrl($scope, $rootScope, OrderService, $uibModal, ScheduleService, toasty) {
        var vm = $scope;

        vm.pageSize = 10;
        vm.currentPage = 1;

        vm.calendarView = 'month';
        vm.viewDate = new Date();
        vm.events = [];
        vm.isCellOpen = true;


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

        /**--------------- sorting and pagination -------------------*/
        vm.pageChange = function () {
            vm.object.orders = [];
        };


        function startAt(order, paramObject) {
            var orders = {};
            orders.order = [];
            orders.jobschedulerId = vm.schedulerIds.selected;
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
            orders.jobschedulerId = vm.schedulerIds.selected;
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
            orders.jobschedulerId = vm.schedulerIds.selected;
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

        vm.calendarView = 'month';
        vm.viewDate = new Date();
        vm.events = [];
        var x2js = [];
        vm.editor = {
            hidePervious :false
    };

        function setRunTime(order) {
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = vm.schedulerIds.selected;
            orders.orders.push({orderId: order.orderId, jobChain: order.jobChain});

            orders.runTime = order.runTime;
            OrderService.setRunTime(orders).then(function (res) {
                console.log(res);
            }, function () {

            });
            vm.object.orders = [];
        }


        vm.timespanClicked = function(event, date){
            console.log(date);
            vm.events.push({title: 'New event', type: 'important', startsAt: date, endsAt: date });
        };

        vm.textEditor = function(xml) {
            console.log(xml);
            getXml2Json(xml);
        };

        vm.editRunTime = function(data) {
            vm.editor.hidePervious = true;
            vm.run_time= {
                run_time : data
            };

            console.log(vm.run_time);
        };

        vm.createRunTime = function() {

            delete vm.run_time['frequency'];
            delete vm.run_time['every'];

            if(vm.run_time.weekdays && vm.run_time.weekdays.day.period) {
                if (vm.run_time.weekdays.day.period._single_start) {
                    vm.run_time.weekdays.day.period._single_start = moment(vm.run_time.weekdays.day.period._single_start).format('hh:mm:ss');
                }
                if (vm.run_time.weekdays.day.period._repeat_time) {
                    vm.run_time.weekdays.day.period._repeat_time = moment(vm.run_time.weekdays.day.period._repeat_time).format('hh:mm:ss');
                }
                if (vm.run_time.weekdays.day.period._repeat) {
                    vm.run_time.weekdays.day.period._repeat = moment(vm.run_time.weekdays.day.period._repeat).format('hh:mm:ss');
                }
                if (vm.run_time.weekdays.day.period._begin) {
                    vm.run_time.weekdays.day.period._begin = moment(vm.run_time.weekdays.day.period._begin).format('hh:mm:ss');
                }
                if (vm.run_time.weekdays.day.period._end) {
                    vm.run_time.weekdays.day.period._end = moment(vm.run_time.weekdays.day.period._end).format('hh:mm:ss');
                }

                if (vm.run_time.weekdays && vm.run_time.weekdays.day.period._absolute_repeat) {
                    vm.run_time.weekdays.day.period._absolute_repeat = moment(vm.run_time.weekdays.day.period._absolute_repeat).format('hh:mm:ss');
                }
            }
            if(vm.run_time.date && vm.run_time.date._date){
                vm.run_time.date._date = moment(vm.run_time.date._date).format('YYYY-MM-DD');
            }
            var xmlStr = x2js.json2xml_str({run_time: vm.run_time});

            xmlStr =  xmlStr.replace(/,/g, ' ');
            vm.xml = vkbeautify.xml(xmlStr, 4);

            vm.run_time.every = 'weekDays';
            vm.run_time.frequency = 'single_start';

            getXml2Json(vm.xml);
        };



        function getXml2Json(xml) {
            vm.runtimeList = [];

            vm.runTimeList = x2js.xml_str2json(xml);
            vm.run_time = vm.runTimeList.run_time;

            if (vm.runTimeList.run_time && vm.runTimeList.run_time.weekdays) {
                angular.forEach(vm.runTimeList.run_time.weekdays, function (value) {
                    var str = '';
                    if (value) {
                        str = str + 'Daily ';
                        if (value._day) {
                            str = str + getWeekDays(value._day);
                        }
                        if (value.period) {
                            if (value.period._single_start) {
                                str = str + ' single start at ' + value.period._single_start;
                            }
                            if (value.period._repeat_time) {
                                str = str + ' repeat_time ' + value.period._repeat_time;
                            }
                            if (value.period._repeat) {
                                str = str + ' repeat at ' + value.period._repeat;
                            }
                            if (value.period._begin) {
                                str = str + ' begin at ' + value.period._begin;
                            }
                            if (value.period._end) {
                                str = str + ' end at ' + value.period._end;
                            }
                        }


                        vm.runtimeList.push({runTime: str, xml : vm.runTimeList.run_time.weekdays});
                    }
                });
            }

            if (vm.runTimeList.run_time && vm.runTimeList.run_time.monthdays) {


                angular.forEach(vm.runTimeList.run_time.monthdays, function (value) {
                    var str = '';

                    if (value) {

                        if (value._month) {
                            str = str + getMonthDays(value._day);
                        }
                        if (value._day) {
                            str = str + ' Day of months '+ value._day;
                        }
                        if (value.period) {
                            if (value.period._single_start) {
                                str = str + ' single start at ' + value.period._single_start;
                            }
                            if (value.period._repeat_time) {
                                str = str + ' repeat_time ' + value.period._repeat_time;
                            }
                            if (value.period._repeat) {
                                str = str + ' repeat at ' + value.period._repeat;
                            }
                            if (value.period._begin) {
                                str = str + ' begin at ' + value.period._begin;
                            }
                            if (value.period._end) {
                                str = str + ' end at ' + value.period._end;
                            }
                        }

                        vm.runtimeList.push({runTime: str, xml : vm.runTimeList.run_time.monthdays});
                    }
                });
            }
        }


        function getWeekDays(day) {
            var str = '(';
            var days = day.split(' ');
            angular.forEach(days, function (value) {
                if (value == 1) {
                    str = str + 'mon,';
                } else if (value == 2) {
                    str = str + 'tue,';
                }
                else if (value == 3) {
                    str = str + 'wen,';
                }
                else if (value == 4) {
                    str = str + 'thu,';
                } else if (value == 5) {
                    str = str + 'fri,';
                } else if (value == 6) {
                    str = str + 'sat,';
                }
                else if (value == 7){
                    str = str + 'sun';
                }
            });

            if(str.length==1){
                return '';
            }else{
                if(str.substring(str.length-1) == ','){
                    str =str.substring(0, str.length-1);
                }
            }
            return str + ')'
        }

        function getMonthDays(month) {
            var str = '(';
            var months = month.split(' ');
            angular.forEach(months, function (value) {
                if (value == 1) {
                    str = str + 'jan,';
                }
                else if (value == 2) {
                    str = str + 'feb,';
                }
                else if (value == 3) {
                    str = str + 'mar,';
                } else if (value == 4) {
                    str = str + 'apr,';
                } else if (value == 5) {
                    str = str + 'may,';
                }
                else if (value == 6) {
                    str = str + 'jun';
                }
                else if (value == 7) {
                    str = str + 'jul';
                }
                else if (value == 8) {
                    str = str + 'aug';
                }
                else if (value == 9) {
                    str = str + 'sep';
                }
                else if (value == 10) {
                    str = str + 'oct';
                }
                else if (value == 11) {
                    str = str + 'nov';
                }
                else if (value == 12) {
                    str = str + 'dec';
                }
            });

            if(str.length==1){
                return '';
            }else{
                if(str.substring(str.length-1) == ','){
                    str =str.substring(0,str.length-1);
                }
            }
            return str + ')'
        }

        vm.setRunTime = function (order) {
            x2js = new X2JS();
            vm.editor.hidePervious = false;
            vm.run_time = {};


            OrderService.getRunTime({
                jobschedulerId: vm.schedulerIds.selected,
                jobChain: order.jobChain,
                orderId: order.orderId
            }).then(function (res) {
                vm.runTime = res.runTime;
                vm.runTime.content = vm.runTime.content.replace(/&lt;/g, '<');
                vm.runTime.content = vm.runTime.content.replace(/&gt;/g, '>');
                vm.xml = vkbeautify.xml(vm.runTime.content, 4);
                getXml2Json(vm.xml);

            });

            vm.order = order;

            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/set-run-time-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                size: 'lg'
            });
            modalInstance.result.then(function () {
                setRunTime(order);
            }, function () {
                vm.object.orders = [];
            });

            ScheduleService.getSchedulesP({jobschedulerId: vm.schedulerIds.selected}).then(function (res) {
                vm.schedules = res.schedules;
            });

        };
 /**------------------------------------------------------end run time editor -------------------------------------------------------*/



        vm.suspendOrder = function (order) {
            var orders = {};
            orders.order = [];
            orders.jobschedulerId = vm.schedulerIds.selected;
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
            orders.jobschedulerId = vm.schedulerIds.selected;
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
            orders.jobschedulerId = vm.schedulerIds.selected;
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
            orders.jobschedulerId = vm.schedulerIds.selected;
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
            orders.jobschedulerId = vm.schedulerIds.selected;
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
            orders.jobschedulerId = vm.schedulerIds.selected;
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
            orders.jobschedulerId = vm.schedulerIds.selected;
            orders.order.push({orderId: order.orderId, jobChain: order.jobChain});
            OrderService.deleteOrder(orders).then(function (res) {
                order.processingState._text = 'DELETED';
                order.processingState.severity = '4';
            }, function () {

            });
            vm.object.orders = [];
        };

        vm.viewCalendar = function (order) {
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

        vm.isLoading1 = true;
        vm.showLogFuc = function (value) {
            if (value.historyId) {
                vm.isLoading1 = false;
                var orders = {};
                orders.jobschedulerId = vm.schedulerIds.selected;
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
            orders.jobschedulerId = vm.schedulerIds.selected;
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

        vm.$on('$destroy', function () {
            watcher1();
            watcher2();
            watcher3();
        });

    }

    HistoryCtrl.$inject = ["$scope", "OrderService", "TaskService", "$uibModal", "SavedFilter", "toasty", "$timeout", "gettextCatalog","FileSaver","Blob"];
    function HistoryCtrl($scope, OrderService, TaskService, $uibModal, SavedFilter, toasty, $timeout, gettextCatalog,FileSaver,Blob) {
        var vm = $scope;
        vm.isLoading = false;
        vm.filter = {};
        vm.filter.type = 'jobChain';

        vm.pageSize = 10;
        vm.currentPage = 1;

        vm.object = {};

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
            OrderService.historys(filter).then(function (res) {
                vm.temp = res.history;
                filterData();

                vm.isLoading = true;
            }, function () {
                vm.isLoading = true;
                vm.isError = true;
            });
        };


        vm.tree =[];
        vm.getTreeStructure = function() {
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


        vm.selectValue = function(data){
            vm.filterString1 = data.JobChain;
            vm.historyFilter.jobChain = vm.filterString1;
        };


        function convertToHierarchy(arry) {
            // Discard duplicates and set up parent/child relationships
            var children = {};
            var hasParent = {};
            for (var i = 0; i < arry.length; i++)
            {
                var path = arry[i];
                var parent = null;
                for (var j = 0; j < path.length; j++)
                {
                    var item = path[j];
                    if (!children[item]) {
                        children[item] = {};
                    }
                    if (parent) {
                        children[parent][item] = true; /* dummy value */
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

        function buildNodeRecursive(item, children)
        {
            var node = {'JobChain':item, children:[]};
            for (var child in children[item]) {
                node.children.push(buildNodeRecursive(child, children));
            }
            return node;
        }


        vm.init({jobschedulerId: vm.schedulerIds.selected});

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


        vm.jobHistory = function () {
            if (!vm.temp1) {
                vm.isLoading = false;
                TaskService.historys({jobschedulerId: vm.schedulerIds.selected}).then(function (res) {
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
        };


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
                orders.jobschedulerId = vm.schedulerIds.selected;
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
            }else {
                var jobs = {};
                jobs.jobschedulerId = vm.schedulerIds.selected;
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
            $('#exportToExcelBtn').attr("disabled",true);
            var pageSizeTemp = angular.copy(vm.pageSize);
            var currentPageTemp = angular.copy(vm.currentPage);

            if(vm.filter.type == 'jobChain')
            vm.pageSize = vm.historys.length;
            else
            vm.pageSize =  vm.jobHistorys.length;
            vm.currentPage = 1;
            $timeout(function () {
                $('#' + vm.filter.type).table2excel({
                    exclude: ".noExl",
                    filename: "jobscheduler-order-history-report",
                    fileext: ".xls",
					exclude_img: false,
					exclude_links: false,
					exclude_inputs: false
                });
                vm.pageSize = pageSizeTemp;
                vm.currentPage = currentPageTemp;
                 $('#exportToExcelBtn').attr("disabled",false);
            }, 800);
        };

        /**--------------- Checkbox functions -------------*/
        vm.allCheck = {
            checkbox: false
        };

        var watcher1 = vm.$watchCollection('object.historys', function (newNames) {
            if (newNames && newNames.length > 0) {

                vm.allCheck.checkbox = newNames.length == vm.historys.slice((vm.pageSize * (vm.currentPage - 1)), (vm.pageSize * vm.currentPage)).length;
            } else {
                vm.allCheck.checkbox = false;
            }
        });

        var watcher2 = vm.$watchCollection('object.jobHistorys', function (newNames) {
            if (newNames && newNames.length > 0) {

                vm.allCheck.checkbox = newNames.length == vm.jobHistorys.slice((vm.pageSize * (vm.currentPage - 1)), (vm.pageSize * vm.currentPage)).length;
            } else {
                vm.allCheck.checkbox = false;
            }
        });

        var watcher3 = vm.$watchCollection('filtered', function (newNames) {
            if (newNames)
                vm.object = {};
        });

        var watcher4 = vm.$watchCollection('jobFiltered', function (newNames) {
            if (newNames)
                vm.object = {};
        });

        var watcher5 = vm.$watch('pageSize', function (newNames) {
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
                            title: value.name + ' '+ gettextCatalog.getString('message.filterDeleteSuccessfully'),
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
                            title: value.name + ' '+ gettextCatalog.getString('message.filterDeleteSuccessfully'),
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

        vm.$on('$destroy', function () {
            watcher1();
            watcher2();
            watcher3();
            watcher4();
            watcher5();
        });

        vm.downloadLog = function(logs){
            var data = new Blob(['file-with-test-log-data'],{type:'text/plain;charset=utf-8'});
            FileSaver.saveAs(data,'history.log');
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
            orders.jobschedulerId = vm.schedulerIds.selected;
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
            jobs.jobschedulerId = vm.schedulerIds.selected;
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
