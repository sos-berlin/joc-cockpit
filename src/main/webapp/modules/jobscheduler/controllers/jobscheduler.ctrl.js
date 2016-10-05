/**
 * Created by sourabhagrawal on 29/06/16.
 */
(function () {
    'use strict';
    angular
        .module('app')
        .controller('ResourceCtrl', ResourceCtrl)
        .controller('ScheduleCtrl', ScheduleCtrl)
        .controller('ScheduleOrderCtrl', ScheduleOrderCtrl)
        .controller('DashboardCtrl', DashboardCtrl)
        .controller('DailyPlanCtrl', DailyPlanCtrl);


    ResourceCtrl.$inject = ["$scope", 'JobSchedulerService', '$stateParams', "ResourceService", "orderByFilter", "gettextCatalog"];
    function ResourceCtrl($scope, JobSchedulerService, $stateParams, ResourceService, orderBy, gettextCatalog) {
        var vm = $scope;
        vm.filter = {};
        vm.filter.state = "all";
        vm.filter.sortBy = "name";


        vm.pageSize = 10;
        vm.currentPage = 1;

        vm.sortBy = function (propertyName) {
            vm.reverse = (propertyName !== null && vm.propertyName === propertyName) ? !vm.reverse : false;
            vm.propertyName = propertyName;
            if (vm.state = 'agent') {
                vm.tree_data = orderBy(vm.tree_data, vm.propertyName, vm.reverse);
            }
            else if (vm.state = 'locks') {
                vm.locks = orderBy(vm.locks, vm.propertyName, vm.reverse);
            } else {
                vm.processClasses = orderBy(vm.processClasses, vm.propertyName, vm.reverse);
            }
        };

        vm.mainSortBy = function (propertyName) {
            vm.sortReverse = !vm.sortReverse;
            vm.filter.sortBy = propertyName;
            if (vm.state = 'agent')
                vm.tree_data = orderBy(vm.tree_data, vm.filter.sortBy, vm.sortReverse);
            else if (vm.state = 'locks') {
                vm.locks = orderBy(vm.locks, vm.filter.sortBy, vm.sortReverse);
            } else {
                vm.processClasses = orderBy(vm.processClasses, vm.filter.sortBy, vm.sortReverse);
            }
        };
        vm.tree_data = [];

        vm.expanding_property = {
            field: "AgentClusterName",
            displayName: gettextCatalog.getString('label.agentClusterName'),
            sortable: true,
            filterable: true,
            cellTemplate: "<span>{{row.branch[expandingProperty.field].substring(row.branch[expandingProperty.field].lastIndexOf('/')+1,row.branch[expandingProperty.field].lastIndexOf('&'))}}</span>"
        };
        vm.col_defs = [
            {
                field: "Status",
                displayName: gettextCatalog.getString('label.status'),
                sortable: true,
                cellTemplate: "<span class='text-u-c label b-{{row.branch[col.field]}}'>{{ row.branch[col.field]}}</span>"
            },
            {
                field: "URL",
                displayName: gettextCatalog.getString('label.url'),
                sortable: true
            },
            {
                field: "TotalAgents",
                displayName: gettextCatalog.getString('label.totalAgents'),
                sortable: true,
                sortingType: "number"
            },
            {
                field: "RunningAgent",
                displayName: gettextCatalog.getString('label.runningAgent'),
                sortable: true,
                sortingType: "number"
            },
            {
                field: "NotReachable",
                displayName: gettextCatalog.getString('label.notReachable'),
                sortable: true,
                sortingType: "number"
            }, {
                field: "SchedulingType",
                displayName: gettextCatalog.getString('label.schedulingType'),
                sortable: true,
                cellTemplate: "<span >{{ row.branch[col.field] | translate }}</span>"
            },
            {
                field: "LastUpdateTime",
                displayName: gettextCatalog.getString('label.lastUpdateTime'),
                sortable: true,
                cellTemplate: "<span class='text-muted'>{{ row.branch[col.field] | stringToDate }}</span>"
            },
            {
                field: "MaxProcess",
                displayName: gettextCatalog.getString('label.maxProcess'),
                sortable: true,
                sortingType: "number"
            },
            {
                field: "RunningTasks",
                displayName: gettextCatalog.getString('label.runningTasks'),
                sortable: true,
                sortingType: "number"
            }
        ];


        function prepareDataForTreegrid(res, result) {
            var agentsData = [];
            angular.forEach(res.agentClusters, function (value, index) {

                var clusterObj = {
                    "AgentClusterName": value.path + '&' + (result.agentClusters[index].state._text === "all_agents_are_running" ? "healthy" : result.agentClusters[index].state._text === "only_some_agents_are_running" ? "unhealthy" : "unreachable"),
                    "Status": result.agentClusters[index].state._text === "all_agents_are_running" ? "healthy" : result.agentClusters[index].state._text === "only_some_agents_are_running" ? "unhealthy" : "unreachable",
                    "URL": '-',
                    "TotalAgents": result.agentClusters[index].numOfAgents.any,
                    "RunningAgent": result.agentClusters[index].numOfAgents.running,
                    "NotReachable": result.agentClusters[index].numOfAgents.any - result.agentClusters[index].numOfAgents.running,
                    "SchedulingType": value._type,
                    "LastUpdateTime": result.agentClusters[index].surveyDate,
                    "MaxProcess": value.maxProcesses,
                    "RunningTasks": 0,
                    "children": []
                };

                angular.forEach(value.agents, function (agent, index1) {
                    if (result.agentClusters[index].agents[index1].runningTasks)
                        clusterObj.RunningTasks = clusterObj.RunningTasks + result.agentClusters[index].agents[index1].runningTasks;

                    var agentObj = {
                        "AgentClusterName": agent.host + '&' + (result.agentClusters[index].agents[index1].state._text === "running" ? "healthy" : "unreachable"),
                        "Status": result.agentClusters[index].agents[index1].state._text === "running" ? "healthy" : "unreachable",
                        "URL": result.agentClusters[index].agents[index1].url,
                        "TotalAgents": "-",
                        "RunningAgent": "-",
                        "NotReachable": "-",
                        "SchedulingType": "-",
                        "LastUpdateTime": result.agentClusters[index].agents[index1].surveyDate,
                        "MaxProcess": "-",
                        "RunningTasks": result.agentClusters[index].agents[index1].runningTasks
                    };
                    clusterObj.children.push(agentObj);
                });

                agentsData.push(clusterObj);

            });
            return agentsData;
        }

        vm.loadAgents = function (state) {
            if(state != undefined) {
                if (vm.filter.state == 'all') {
                    vm.tree_data = angular.copy(vm.temp);

                } else {
                    var data = [];
                    angular.forEach(vm.temp, function (value) {

                        if (vm.filter.state === value.Status) {
                            data.push(value);
                        }
                    });
                    vm.tree_data = data;
                }

                return;
            }
            JobSchedulerService.getAgentClusterP({
                jobschedulerId: $scope.schedulerIds.selected
            }).then(function (res) {
                JobSchedulerService.getAgentCluster({
                    jobschedulerId: $scope.schedulerIds.selected
                }).then(function (result) {
                    vm.tree_data = prepareDataForTreegrid(res, result);
                    vm.temp = angular.copy(vm.tree_data);
                    vm.isLoading = true;
                });
            }, function () {
                vm.isLoading = true;
                vm.isError = true;
            });
        };


        vm.loadLocks = function () {
            vm.isLoading = false;
            ResourceService.getLocksP({jobschedulerId: $scope.schedulerIds.selected}).then(function (result) {
                vm.locks = result.locks;
                vm.isLoading = true;
                ResourceService.get({jobschedulerId: $scope.schedulerIds.selected}).then(function (res) {
                    vm.locks = angular.merge(result.locks, res.locks);

                });
            }, function () {
                vm.isLoading = true;
                vm.isError = true;
            });
        };


        vm.loadProcessClass = function () {
            vm.isLoading = false;
            ResourceService.getProcessClassP({jobschedulerId: $scope.schedulerIds.selected}).then(function (result) {
                vm.processClasses = result.processClasses;
                vm.isLoading = true;
                ResourceService.getProcessClass({jobschedulerId: $scope.schedulerIds.selected}).then(function (res) {
                    vm.processClasses = angular.merge(result.processClasses, res.processClasses);

                });
            }, function () {
                vm.isLoading = true;
                vm.isError = true;
            });
        };


        $scope.$on('$stateChangeSuccess', function (event, toState) {
            vm.state = '';
            if (toState.name == 'app.resources.agentClusters') {
                vm.state = 'agent';
                vm.filter.state = $stateParams.type || 'all';
                vm.isLoading = false;
                 vm.loadAgents();
            } else if (toState.name == 'app.resources.locks') {
                vm.state = 'lock';
                vm.loadLocks();
            } else {
                vm.state = 'processClass';
                vm.loadProcessClass();
            }

        });
    }


    ScheduleCtrl.$inject = ["$scope", "$rootScope", "ScheduleService", "orderByFilter", "$uibModal"];
    function ScheduleCtrl($scope,$rootScope, ScheduleService, orderBy, $uibModal) {
        var vm = $scope;
        vm.filter = {};
        vm.filter.state = "all";
        vm.filter.sortBy = "name";
        vm.object = {};

        vm.pageSize = 10;
        vm.currentPage = 1;

        /**--------------- sorting and pagination -------------------*/
        vm.pageChange = function () {
            vm.object.schedules = [];
        };

        vm.sortBy = function (propertyName) {
            vm.object.schedules = [];
            vm.reverse = (propertyName !== null && vm.propertyName === propertyName) ? !vm.reverse : false;
            vm.propertyName = propertyName;
            vm.schedules = orderBy(vm.schedules, vm.propertyName, vm.reverse);
        };

        vm.mainSortBy = function (propertyName) {
            vm.object.schedules = [];
            vm.sortReverse = !vm.sortReverse;
            vm.filter.sortBy = propertyName;
            vm.schedules = orderBy(vm.schedules, vm.filter.sortBy, vm.sortReverse);
        };


        vm.init = function (filter) {
            vm.isLoading = false;
            ScheduleService.getSchedulesP(filter).then(function (result) {
                vm.schedules = result.schedules;
                vm.temp = result.schedules;
                vm.isLoading = true;
                ScheduleService.get(filter).then(function (res) {
                    angular.merge(result.schedules, res.schedules)
                });
            }, function () {
                vm.isLoading = true;
                vm.isError = true;
            });
        };
        vm.init({jobschedulerId: $scope.schedulerIds.selected});

        vm.load = function () {
            vm.data = [];
            angular.forEach(vm.temp, function (value) {
                if (value.state._text == vm.filter.state || vm.filter.state == 'all')
                    vm.data.push(value);
            });
            vm.schedules = vm.data;
        };

        vm.allCheck = {
            checkbox: false
        };

        var watcher1 = $scope.$watchCollection('object.schedules', function (newNames) {
            if (newNames && newNames.length > 0) {
                vm.allCheck.checkbox = newNames.length == vm.schedules.slice((vm.pageSize * (vm.currentPage - 1)), (vm.pageSize * vm.currentPage)).length;
            } else {
                vm.allCheck.checkbox = false;
            }
        });

        var watcher2 = $scope.$watchCollection('filtered', function (newNames) {
            if (newNames)
                vm.object.schedules = [];
        });


        var watcher3 = $scope.$watch('pageSize', function (newNames) {
            if (newNames)
                vm.object.schedules = [];
        });

        vm.checkAll = function () {
            if (vm.allCheck.checkbox) {
                vm.object.schedules = vm.schedules.slice((vm.pageSize * (vm.currentPage - 1)), (vm.pageSize * vm.currentPage));
            } else {
                vm.object.schedules = [];
            }
        };

        function substitute(schedule) {
            ScheduleService.substitute(schedule, $scope.schedulerIds.selected).then(function (res) {

            });
        }

        vm.substitute = function (schedule) {
            vm.sch = {};
            vm.sch.folder = '/';

            vm.sch._valid_from = moment().set({hour:0,minute:0,second:0,millisecond:0}).format('YYYY-MM-DD HH:mm:ss');
            vm.sch._valid_to = moment().set({hour:23,minute:59,second:59,millisecond:0}).format('YYYY-MM-DD HH:mm:ss');
            vm.sch._substitute = schedule.path;
            vm.schedule = schedule;

            //console.log(schedule);
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/add-substitute-dialog.html',
                controller: 'RuntimeEditorDialogCtrl',
                scope: vm,
                size: 'lg',
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                substitute(schedule);
            }, function () {

            });
            ScheduleService.getRunTime({
                jobschedulerId: $scope.schedulerIds.selected,
                schedule: schedule.path
            }).then(function (res) {
                if (res.runTime) {
                    vm.runTimes = res.runTime;
                    vm.runTimes.content = vm.runTimes.content.replace(/&lt;/g, '<');
                    vm.runTimes.content = vm.runTimes.content.replace(/&gt;/g, '>');
                    vm.xml = vm.runTimes.content;
                }
                $rootScope.$broadcast('loadXml');

            });
            vm.zones = moment.tz.names();
        };

        vm.substituteAll = function () {

            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/substitute-all-dialog.html',
                controller: 'DialogCtrl',
                scope: vm
            });
            modalInstance.result.then(function () {
                angular.forEach(vm.object.schedules, function (value) {
                    substitute(value);
                });
            }, function () {
                vm.object.schedules = [];
            });
        };

        vm.setRunTime = function (schedule) {
            var schedules = {};
            schedules.jobschedulerId = $scope.schedulerIds.selected;
            schedules.schedule = schedule.path;
            schedules.runTime = schedule.runTime;
            ScheduleService.setRunTime(schedules).then(function (result) {
                vm.schedules = result.schedules;
            }, function () {
                vm.isError = true;
            });

        };

        vm.editSchedule = function (schedule) {

            vm.sch = {};
            vm.schedule = schedule;
            vm.sch._title = schedule.title;
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/edit-schedule-dialog.html',
                controller: 'RuntimeEditorDialogCtrl',
                scope: vm,
                size: 'lg',
                backdrop: 'static'
            });
            modalInstance.result.then(function () {

                setRunTime(schedule);
            }, function () {
                vm.object.schedules = [];
            });
            ScheduleService.getRunTime({
                jobschedulerId: $scope.schedulerIds.selected,
                schedule: schedule.path
            }).then(function (res) {
                if (res.runTime) {
                    vm.runTimes = res.runTime;
                    vm.runTimes.content = vm.runTimes.content.replace(/&lt;/g, '<');
                    vm.runTimes.content = vm.runTimes.content.replace(/&gt;/g, '>');
                    vm.xml = vm.runTimes.content;
                }
                $rootScope.$broadcast('loadXml');

            });
            vm.zones = moment.tz.names();
        };

        $scope.$on('$destroy', function () {
            watcher1();
            watcher2();
            watcher3();
        });
    }


    ScheduleOrderCtrl.$inject = ["$scope","$rootScope", "ScheduleService", "$stateParams", "$location", "OrderService", "$uibModal", "orderByFilter"];
    function ScheduleOrderCtrl($scope, $rootScope, ScheduleService, $stateParams, $location, OrderService, $uibModal,  orderBy ) {
        var vm = $scope;
        vm.name = $stateParams.name;
        var object = $location.search();

        vm.path = object.path;

        vm.filter = {};
        vm.filter.sortBy = "status";
        vm.isLoading = false;
        vm.object = {};

        /**--------------- sorting and pagination -------------------*/
        vm.sortBy = function (propertyName) {
            vm.object.orders = [];
            vm.reverse = (propertyName !== null && vm.propertyName === propertyName) ? !vm.reverse : false;
            vm.propertyName = propertyName;
            vm.orders = orderBy(vm.orders, vm.propertyName, vm.reverse);
        };

        vm.orders=[];
        function loadOrders(orders) {
            OrderService.getOrdersP({
                jobschedulerId: $scope.schedulerIds.selected,
                compact: true,
                orders: orders
            }).then(function (result) {

                OrderService.get({jobschedulerId: $scope.schedulerIds.selected, orders: orders}).then(function (res) {
                    var temp = angular.merge(result.orders, res.orders);
                    for(var i =0; i<temp.length;i++){
                        if(temp[i].orderId = orders[0].orderId){
                            vm.orders.push(temp[i]);
                            break;
                        }
                    }
                    vm.isLoading = true;
                }, function () {
                    vm.isLoading = true;
                    vm.isError = true;
                });
            });
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

        ScheduleService.getScheduleP(vm.path, $scope.schedulerIds.selected).then(function (result) {
            vm.schedule = result.schedule;
            loadOrders(vm.schedule.usedByOrders);
        }, function () {
            vm.isError = true;
        });

        vm.editSchedule = function () {

            vm.sch = {};

            vm.sch._title = vm.schedule.title;
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/edit-schedule-dialog.html',
                controller: 'RuntimeEditorDialogCtrl',
                scope: vm,
                size: 'lg',
                backdrop: 'static'
            });
            modalInstance.result.then(function () {

                setRunTime(schedule);
            }, function () {
                vm.object.schedules = [];
            });
            ScheduleService.getRunTime({
                jobschedulerId: $scope.schedulerIds.selected,
                schedule: schedule.path
            }).then(function (res) {
                if (res.runTime) {
                    vm.runTimes = res.runTime;
                    vm.runTimes.content = vm.runTimes.content.replace(/&lt;/g, '<');
                    vm.runTimes.content = vm.runTimes.content.replace(/&gt;/g, '>');
                    vm.xml = vm.runTimes.content;
                }
                $rootScope.$broadcast('loadXml');

            });
            vm.zones = moment.tz.names();
        };

        vm.substitute = function () {
            vm.sch = {};
            vm.sch.folder = '/';

            vm.sch._valid_from = moment().set({
                hour: 0,
                minute: 0,
                second: 0,
                millisecond: 0
            }).format('YYYY-MM-DD HH:mm:ss');
            vm.sch._valid_to = moment().set({
                hour: 23,
                minute: 59,
                second: 59,
                millisecond: 0
            }).format('YYYY-MM-DD HH:mm:ss');
            vm.sch._substitute = vm.schedule.path;


            //console.log(schedule);
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/add-substitute-dialog.html',
                controller: 'RuntimeEditorDialogCtrl',
                scope: vm,
                size: 'lg',
                backdrop: 'static'
            });
            modalInstance.result.then(function () {

            }, function () {

            });
            ScheduleService.getRunTime({
                jobschedulerId: $scope.schedulerIds.selected,
                schedule: vm.schedule.path
            }).then(function (res) {
                if (res.runTime) {
                    vm.runTimes = res.runTime;
                    vm.runTimes.content = vm.runTimes.content.replace(/&lt;/g, '<');
                    vm.runTimes.content = vm.runTimes.content.replace(/&gt;/g, '>');
                    vm.xml = vm.runTimes.content;
                }
                $rootScope.$broadcast('loadXml');

            });
            vm.zones = moment.tz.names();
        };
    }

    DashboardCtrl.$inject = ['$scope', 'OrderService', 'JobSchedulerService', '$interval', '$state', '$uibModal', 'DailyPlanService', 'moment'];
    function DashboardCtrl($scope, OrderService, JobSchedulerService, $interval, $state, $uibModal, DailyPlanService, moment) {
        var vm = $scope;
        var bgColorArray = [];


        vm.getAgentCluster = function () {
            JobSchedulerService.getAgentCluster({jobschedulerId: $scope.schedulerIds.selected}).then(function (result) {
                vm.agentClusters = result.agentClusters;
                var agentArray = [];
                var agentArray1 = [];
                vm.YAxisDomain = [0, 3];
                //vm.YAxisDomain[0] = 0;
                angular.forEach(result.agentClusters, function (value) {

                    var numTask = 0;
                    angular.forEach(value.agents, function (value1) {
                        if (value1.runningTasks)
                            numTask = numTask + value1.runningTasks;
                    });
                    agentArray.push([value.path.substring(value.path.lastIndexOf('/') + 1), numTask]);
                    //if(!vm.YAxisDomain[1]){
                    //    vm.YAxisDomain[1]=Math.ceil(numTask+1);
                    //}else if(numTask>vm.YAxisDomain[1]){
                    //    vm.YAxisDomain[1]=Math.ceil(numTask+1);
                    //}
                    if (value.state._text == "all_agents_are_running") {
                        value.state._text = "label.healthyAgentCluster";
                        bgColorArray.push('#7ab97a');
                    } else if (value.state._text == "all_agents_are_unreachable") {
                        value.state._text = "label.unreachableAgentCluster";
                        bgColorArray.push('#e86680');
                    } else {
                        value.state._text = "label.unhealthyAgentCluster";
                        bgColorArray.push('rgba(255, 195, 0, 0.9)');
                    }
                    agentArray1.push({
                        key: value.state._text,
                        y: value.numOfAgents.any
                    });
                });

                vm.agentClusterData = agentArray1;

                vm.agentStatusChart = [
                    {
                        "key": "Agents",
                        "values": agentArray
                    }
                ];
            });
        };


        vm.xFunction = function () {
            return function (d) {
                return d.key;
            };
        };
        vm.yFunction = function () {
            return function (d) {
                return d.y;
            };
        };
        vm.descriptionFunction = function () {
            return function (d) {
                return d.key;
            }
        };


        var format = d3.format(',.0f');
        vm.valueFormatFunction = function () {
            return function (d) {
                return format(d);
            }
        };

        vm.colorFunction = function () {
            return function (d, i) {
                return bgColorArray[i];
            };
        };

        var cluster = 'passive';
        var scenario = 'From mock API';

        prepareClusterStatusData();
        var clusterStatusData = {};


        function prepareClusterStatusData() {
            clusterStatusData = {};
            getDatabase().then(function (res) {
                clusterStatusData.database = res;
                getClusterMembersP().then(function (res) {
                    angular.forEach(res.masters, function (master, index) {
                        if (index == res.masters.length - 1) {
                            //console.log("Now refresh");
                            clusterStatusData.members = res;
                            vm.clusterStatusData = clusterStatusData;
                        }
                    })

                }, function (err) {

                })
            }, function (err) {

            })
        }


        vm.getSupervisor = getSupervisorDetails;
        function getSupervisorDetails() {

            return JobSchedulerService.getSupervisorP({jobschedulerId: $scope.schedulerIds.selected});
        }


        vm.getClusterMembers = getClusterMembers;
        function getClusterMembers() {

            return JobSchedulerService.getClusterMembers({jobschedulerId: $scope.schedulerIds.selected});
        }


        determineClusterStatus();

        function determineClusterStatus() {
            vm.clusterStatus = 'stopped';
            vm.getClusterMembers().then(function (res) {
                angular.forEach(res.masters, function (master, index) {
                    if (master.state._text == 'running') {
                        vm.clusterStatus = 'running';
                    }
                })
            }, function (err) {

            })
        }

        function getDatabase() {

            return JobSchedulerService.getDatabase({jobschedulerId: $scope.schedulerIds.selected});
        }

        function getClusterMembersP() {

            return JobSchedulerService.getClusterMembersP({jobschedulerId: $scope.schedulerIds.selected});
        }


        vm.loadOrderSnapshot = function () {
            OrderService.getSnapshot({jobschedulerId: $scope.schedulerIds.selected}).then(function (res) {
                vm.snapshot = res.orders;
            });
        };


        vm.interval = $interval(function () {
            vm.loadOrderSnapshot(undefined, $scope.schedulerIds.selected);
        }, 60000);

        $scope.$on('elementClick.directive', function (angularEvent, event) {

            var key = '';
            if (event.point.key) {
                if (event.point.key == "label.healthyAgentCluster") {
                    key = 'healthy';
                } else if (event.point.key == "label.unhealthyAgentCluster") {
                    key = 'unhealthy';
                } else {
                    key = 'unreachable';
                }
            } else {
                angular.forEach(vm.agentClusters, function (value) {
                    if (event.point[0] == value.path.substring(value.path.lastIndexOf('/') + 1)) {

                        if (value.state._text == "all_agents_are_running") {
                            key = 'healthy';
                        } else if (value.state._text == "only_some_agents_are_running") {
                            key = 'unhealthy';
                        } else {
                            key = 'unreachable';
                        }

                    }
                });
            }
            $state.go('app.resources.agentClusters', {type: key});

        });

        vm.setLabel = function (label) {
            var key = '';
            if (label == "label.healthyAgentCluster") {
                key = 'healthy';
            } else if (label == "label.unhealthyAgentCluster") {
                key = 'unhealthy';
            } else {
                key = 'unreachable';
            }

            $state.go('app.resources.agentClusters', {type: key});
        };

        vm.viewAllAgents = function () {
            $state.go('app.resources.agentClusters', {type: 'all'});
        };

        // vm.loadOrderSummary(vm.summaryFilter.dateFrom);
        vm.loadOrderSnapshot();
        vm.getAgentCluster();
        //vm.getAgentClusterP();
        var states = [];
        vm.clusterAction = function (objectType, action, host, port) {
            //console.log("objectType " + objectType + " action " + action + " object " + host + port);
            if ((objectType == 'supervisor' || objectType == 'master') && action == 'terminate') {
                JobSchedulerService.terminate(host, port, $scope.schedulerIds.selected).then(function (res) {
                    success('stopped', host, port);
                }, function (err) {

                });
            } else if ((objectType == 'supervisor' || objectType == 'master') && action == 'restart') {
                JobSchedulerService.restart(host, port, $scope.schedulerIds.selected).then(function (res) {
                    success('running', host, port);
                }, function (err) {

                });
            } else if ((objectType == 'supervisor' || objectType == 'master') && action == 'abortAndRestart') {
                JobSchedulerService.abortAndRestart(host, port, $scope.schedulerIds.selected).then(function (res) {
                    success('running', host, port);
                }, function (err) {

                });

            } else if ((objectType == 'supervisor' || objectType == 'master') && action == 'terminateAndRestart') {
                JobSchedulerService.terminate(host, port, $scope.schedulerIds.selected).then(function (res) {
                    JobSchedulerService.restart(host, port, $scope.schedulerIds.selected).then(function (res) {
                        success('running', host, port);
                    }, function (err) {

                    });
                }, function (err) {

                });

            } else if ((objectType == 'supervisor' || objectType == 'master') && action == 'terminateAndRestartWithin') {
                vm.getTimeout(host, port);


            }
            else if ((objectType == 'supervisor' || objectType == 'master') && action == 'pause') {
                JobSchedulerService.pause(host, port, $scope.schedulerIds.selected).then(function (res) {
                    success('paused', host, port);
                }, function (err) {

                });

            } else if ((objectType == 'supervisor' || objectType == 'master') && action == 'continue') {
                JobSchedulerService.continue(host, port, $scope.schedulerIds.selected).then(function (res) {
                    success('running', host, port);
                }, function (err) {

                });

            } else if (objectType == 'cluster' && action == 'terminate') {
                JobSchedulerService.terminateCluster({jobschedulerId: $scope.schedulerIds.selected}).then(function (res) {
                    clusterSuccess('stopped', host, port);
                }, function (err) {

                });

            } else if (objectType == 'cluster' && action == 'terminateFailsafe') {
                JobSchedulerService.terminateFailsafeCluster({jobschedulerId: $scope.schedulerIds.selected}).then(function (res) {
                    clusterSuccess('stopped', host, port);
                }, function (err) {

                });

            } else if (objectType == 'cluster' && action == 'restart') {
                JobSchedulerService.restartCluster({jobschedulerId: $scope.schedulerIds.selected}).then(function (res) {
                    clusterSuccess('running', host, port);
                }, function (err) {

                });

            }


            function clusterSuccess(state) {

                if (vm.clusterStatusData.supervisors.length == 0) {
                    drawForRemainings();
                }
                angular.forEach(vm.clusterStatusData.supervisors, function (supervisor, sIndex) {
                    states[supervisor.host + supervisor.port] = state;
                    angular.forEach(supervisor.masters, function (master, mIndex) {
                        states[master.host + master.port] = state;
                        if (sIndex == vm.clusterStatusData.supervisors.length - 1 && mIndex == supervisor.masters.length - 1) {
                            drawForRemainings();
                        }
                    })
                });

                function drawForRemainings() {
                    if (vm.clusterStatusData.members.masters.length == 0) {
                        determineClusterStatus();
                        return;
                    }
                    angular.forEach(vm.clusterStatusData.members.masters, function (master, index) {
                        states[master.host + master.port] = state;
                        if (index == vm.clusterStatusData.members.masters.length - 1) {
                            determineClusterStatus();
                        }
                    })
                }
            }
        };

        function success(state, host, port) {
            //console.log("Here02 " + host + port);
            states[host + port] = state;
            //console.log("Here02 states " + states[host + port]);

        }

        /*-------------Menu active function call-------------------*/
        vm.terminate = function () {
            JobSchedulerService.terminate({jobschedulerId: $scope.schedulerIds.selected}).then(function (res) {

            });
        };
        vm.restart = function () {
            JobSchedulerService.restart({jobschedulerId: $scope.schedulerIds.selected}).then(function (res) {

            });
        };
        vm.terminateFailSafe = function () {
            JobSchedulerService.terminateFailSafe({jobschedulerId: $scope.schedulerIds.selected}).then(function (res) {

            });
        }

        vm.criterion = {};
        vm.criterion.timeout = 60;
        vm.getTimeout = function (host, port) {

            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/get-timeout-dialog.html',
                controller: 'DialogCtrl',
                scope: vm
            });
            modalInstance.result.then(function () {
                JobSchedulerService.terminateWithin(host, port, $scope.schedulerIds.selected, vm.criterion.timeout).then(function (res) {
                    JobSchedulerService.restartWithin(host, port, $scope.schedulerIds.selected, vm.criterion.timeout).then(function (res) {
                        success('running', host, port);
                    }, function (err) {

                    });
                }, function (err) {

                });
            }, function () {

            });
        };
 /*----------------- Daily plan overview -----------------*/
        vm.filter = {};
        vm.filter.range = "today";
        getDailyPlans();

        function getDailyPlans() {
            DailyPlanService.getPlans({jobschedulerId: $scope.schedulerIds.selected}).then(function(res){
                vm.planItemData = res.planItems;

                filterData();
            },function(err){

            })
        }

        function filterData() {
            vm.waiting = 0;
            vm.late = 0;
            vm.lateSuccess = 0;
            vm.lateError = 0;
            vm.executed = 0;
            vm.error = 0;

            var to = new Date();
            var from = new Date();
            if (vm.filter.range == 'today') {
                from.setHours(0);
                from.setMinutes(0);
                from.setSeconds(0);
                to.setHours(0);
                to.setMinutes(0);
                to.setSeconds(0);
                to.setDate(to.getDate() + 1);
            } else {
                to.setHours(to.getDate() + 24);
            }

            var data = [];

            vm.planItemData.forEach(function (value, index) {
                var flag = true;
                if (new Date(value.plannedStartTime) < from || new Date(value.plannedStartTime) > to) {
                    flag = false;

                }
                if (flag) {
                    data.push(value);
                }
            });

            vm.totalPlanData = data.length;
            data.forEach(function (value, index) {
                var time;
                if(!value.startTime ) {
                    time = moment(value.plannedStartTime).diff(moment(new Date()));
                    if(time < 0) {
                        vm.late++;
                    } else {
                        vm.waiting++;
                    }
                } else if(value.state._text == 'SUCCESSFUL' && value.startTime) {
                    time = moment(value.plannedStartTime).diff(moment(value.startTime));
                    if(time == 0) {
                        vm.executed++;
                    } else {
                        vm.lateSuccess++;
                    }
                } else {
                    time = moment(value.plannedStartTime).diff(moment(value.startTime));
                    if(time == 0) {
                        vm.error++;
                    } else {
                        vm.lateError++;
                    }
                }
            });
            vm.waiting = getPlanPercent(vm.waiting);
            vm.late = getPlanPercent(vm.late);
            vm.executed = getPlanPercent(vm.executed);
            vm.lateSuccess = getPlanPercent(vm.lateSuccess);
            vm.error = getPlanPercent(vm.error);
            vm.lateError = getPlanPercent(vm.lateError);
        }

        function getPlanPercent(status) {
            var statusPercent = (status/vm.totalPlanData) * 100;
            return statusPercent;
        }

        vm.getPlans = function () {
            filterData();
        };

        $scope.$on('$destroy', function () {
            // Make sure that the interval is destroyed too
            $interval.cancel(vm.interval);
        });


    }


    DailyPlanCtrl.$inject = ['$scope', '$timeout', 'gettextCatalog', 'moment', 'orderByFilter', '$uibModal', 'SavedFilter', 'toasty', 'OrderService', 'DailyPlanService'];
    function DailyPlanCtrl($scope,  $timeout, gettextCatalog, moment, orderBy, $uibModal, SavedFilter, toasty, OrderService, DailyPlanService) {

        var vm = $scope;

        vm.todayDate = new Date();
        vm.pageSize = 10;
        vm.currentPage = 1;
        vm.isCellOpen = true;
        vm.isLoading = false;

        vm.filter = {};
        vm.filter.range = "today";
        vm.filter.sortBy = "name";
        vm.filter.status = 'all';
        vm.showPanel = '';
        vm.showLogPanel = undefined;
        vm.object = {};
        vm.savedDailyPlanFilter = JSON.parse(SavedFilter.dailyPlanFilters) || {};
        vm.savedDailyPlanFilter.list = vm.savedDailyPlanFilter.list || [];
        vm.savedIgnoreList = JSON.parse(SavedFilter.ignoreList) || {};
        vm.savedIgnoreList.dailyPlans = vm.savedIgnoreList.dailyPlans || [];
        vm.savedIgnoreList.isEnable = vm.savedIgnoreList.isEnable || false;
        vm.dataSource = 'Demo';

        var promise1, promise2;

        setDateRange();

        function setDateRange(range) {
            var from = new Date();
            var to = new Date();
            if (range == 'today' || !range) {
                from.setHours(0);
                from.setMinutes(0);
                from.setSeconds(0);
                to.setDate(to.getDate() + 1);
                to.setHours(0);
                to.setMinutes(0);
                to.setSeconds(0);
            } else if (range == 'next-24-hours') {
                to.setHours(to.getHours() + 24);
            }

            vm.filter.from = from;
            vm.filter.to = to;
        }

        vm.getPlans = function () {
            filterData();
        };

        vm.toggleSource = function () {

        };

        vm.exportToExcel = function () {
            $('#exportToExcelBtn').attr("disabled", true);
            var pageSizeTemp = angular.copy(vm.pageSize);
            var currentPageTemp = angular.copy(vm.currentPage);

            vm.pageSize = vm.plans.length;
            vm.currentPage = 1;
            promise1 = $timeout(function () {
                $('#dailyPlanTableId').table2excel({
                    exclude: ".noExl",
                    filename: "jobscheduler-jobchain",
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


        var toDate = new Date();
        toDate.setDate(toDate.getDate() + 1);
        $scope.options = {
            mode: 'custom',
            scale: 'hour',
            sortMode: undefined,
            sideMode: 'TreeTable',
            daily: false,
            maxHeight: window.innerHeight - 300,
            width: false,
            zoom: 1,
            treeTableColumns: ['model.name', 'model.orderId', 'model.status'],
            columnsHeaders: {
                'model.name': gettextCatalog.getString('label.processesPlanned'),
                'model.orderId': gettextCatalog.getString('label.orderId'),
                'model.status': gettextCatalog.getString('label.status')
            },
            columnsClasses: {
                'model.name': 'gantt-column-name',
                'model.orderId': 'gantt-column-from',
                'model.status': 'gantt-column-to'
            },
            columnsHeaderContents: {
                'model.name': '{{getHeader()}}',
                'mode.lorderId': '{{getHeader()}}',
                'model.status': '{{getHeader()}}'
            },
            autoExpand: 'none',
            taskOutOfRange: 'truncate',
            toDate: toDate,
            rowContent: '<i class="fa fa-align-justify"></i> {{row.model.orderId}}',
            taskContent: '<i class="fa fa-tasks"></i> {{task.model.orderId}}',
            allowSideResizing: true,
            labelsEnabled: true,
            currentDate: 'line',
            currentDateValue: new Date(),
            draw: false,
            readOnly: false,
            groupDisplayMode: 'group',
            shrinkToFit: true,
            columnMagnet: '15 minutes',
            targetDataAddRowIndex: undefined,
            api: function (api) {
                api.core.on.ready($scope, function () {
                    $scope.load();
                });
            }
        };

        $scope.canAutoWidth = function (scale) {
            if (scale.match(/.*?hour.*?/) || scale.match(/.*?minute.*?/)) {
                return false;
            }
            return true;
        };

        $scope.getColumnWidth = function (widthEnabled, scale, zoom) {
            if (!widthEnabled && $scope.canAutoWidth(scale)) {
                return undefined;
            }
            if (scale.match(/.*?week.*?/)) {
                return 150 * zoom;
            }
            if (scale.match(/.*?month.*?/)) {
                return 300 * zoom;
            }
            if (scale.match(/.*?quarter.*?/)) {
                return 500 * zoom;
            }
            if (scale.match(/.*?year.*?/)) {
                return 800 * zoom;
            }
            return 40 * zoom;
        };


        $scope.load = function () {
            DailyPlanService.getPlans({jobschedulerId: $scope.schedulerIds.selected}).then(function (res) {
                vm.temp = res.planItems;
                filterData();
            }, function (err) {

            })
        };


        vm.sortBy = function (propertyName) {
            vm.reverse = (propertyName !== null && vm.propertyName === propertyName) ? !vm.reverse : false;
            vm.propertyName = propertyName;
            vm.plans = orderBy(vm.plans, vm.propertyName, vm.reverse);
            prepareGanttData(vm.plans);

        };

        vm.mainSortBy = function (propertyName) {
            vm.sortReverse = !vm.sortReverse;
            vm.filter.sortBy = propertyName;
            vm.plans = orderBy(vm.plans, vm.filter.sortBy, vm.sortReverse);
            prepareGanttData(vm.plans);
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

        vm.showLogFuc = function (plan) {
            vm.showLogPanel = plan;
            var filter = [];
            filter[0] = {};
            filter[0].jobChain = plan.jobChain;
            filter[0].orderId = plan.orderId;
            OrderService.histories(filter).then(function (res) {
                vm.histories = res.history;
            }, function (err) {

            });
            vm.steps = [];
        };

        vm.applyFilter = function () {
            vm.dailyPlanFilter = {};
            vm.isUnique = true;
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/daily-plan-filter-dialog.html',
                controller: 'DialogCtrl',
                scope: vm
            });
            modalInstance.result.then(function () {
                if (vm.savedDailyPlanFilter.shared) {
                    //TODO Save daily plan filter into database.
                } else {
                    vm.savedDailyPlanFilter = JSON.parse(SavedFilter.dailyPlanFilters) || {};
                    vm.savedDailyPlanFilter.list = vm.savedDailyPlanFilter.list || [];

                    vm.savedDailyPlanFilter.list.push(vm.dailyPlanFilter);
                    vm.savedDailyPlanFilter.selected = vm.dailyPlanFilter.name;
                    SavedFilter.setDailyPlan(vm.savedDailyPlanFilter);
                    SavedFilter.save();
                }

                filterData();

            }, function () {

            });
        };

        vm.editFilters = function () {
            vm.filters = vm.savedDailyPlanFilter.list;
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
            vm.dailyPlanFilter = angular.copy(filter);
            vm.isUnique = true;
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/edit-daily-plan-filter-dialog.html',
                controller: 'DialogCtrl',
                scope: vm
            });
            modalInstance.result.then(function () {
                angular.forEach(vm.savedDailyPlanFilter.list, function (value, index) {
                    if (value.name == filter.name) {
                        vm.savedDailyPlanFilter.list[index] = vm.dailyPlanFilter;
                    }
                });
                vm.filterName = undefined;
                SavedFilter.setDailyPlan(vm.savedDailyPlanFilter);
                SavedFilter.save();
                filterData();
            }, function () {
                vm.filterName = undefined;
            });
        };

        vm.deleteFilter = function () {
            angular.forEach(vm.savedDailyPlanFilter.list, function (value, index) {
                if (value.name == vm.dailyPlanFilter.name) {
                    toasty.success({
                        title: value.name + ' filter deleted successfully!',
                        msg: ''
                    });
                    vm.savedDailyPlanFilter.list.splice(index, 1);
                }
            });
            if (vm.savedDailyPlanFilter.list.length == 0) {
                vm.savedDailyPlanFilter = {};
            } else if (vm.savedDailyPlanFilter.selected == vm.dailyPlanFilter.name) {
                vm.savedDailyPlanFilter.selected = undefined;
            }
            SavedFilter.setDailyPlan(vm.savedDailyPlanFilter);
            SavedFilter.save();
        };

        vm.checkFilterName = function () {
            vm.isUnique = true;

            angular.forEach(vm.savedDailyPlanFilter.list, function (value) {
                if (!vm.filterName) {
                    if (vm.dailyPlanFilter.name == value.name) {
                        vm.isUnique = false;
                    }
                } else {
                    if (value.name != vm.filterName) {
                        if (vm.dailyPlanFilter.name == value.name) {
                            vm.isUnique = false;
                        }
                    }
                }
            });
        };

        vm.changeFilter = function (filter) {
            vm.savedDailyPlanFilter.selected = filter;
            filterData();
            SavedFilter.setDailyPlan(vm.savedDailyPlanFilter);
            SavedFilter.save();

        };

        function applySavedFilter(data) {
            angular.forEach(vm.savedDailyPlanFilter.list, function (value) {
                if (value.name == vm.savedDailyPlanFilter.selected) {
                    angular.forEach(vm.temp, function (res) {
                        var flag = true;

                        if (value.regex && res.orderId) {
                            if (!res.orderId.match(value.regex)) {
                                flag = false;
                            }
                        }

                        if (flag && value.state && res.state._text) {
                            if (value.state.indexOf(res.state._text) === -1) {
                                flag = false;
                            }
                        }


                        if (value.processPlanned && res.job != "NULL") {
                            if (!res.job.match(value.processPlanned)) {
                                flag = false;
                            }
                        }

                        if (value.processPlanned && res.jobChain && res.job == "NULL") {
                            if (!res.jobChain.match(value.processPlanned)) {
                                flag = false;
                            }
                        }

                        if (flag && value.fromDate && res.plannedStartTime) {

                            if (value.fromTime) {
                                value.fromDate = new Date(value.fromDate);
                                value.fromTime = new Date(value.fromTime);
                                value.fromDate.setHours(value.fromTime.getHours());
                                value.fromDate.setMinutes(value.fromTime.getMinutes());
                                value.fromDate.setSeconds(value.fromTime.getSeconds());
                            }
                            var time1 = moment(value.fromDate).diff(moment(res.plannedStartTime));
                            var time2 = moment(res.plannedStartTime).diff(moment(value.toDate));
                            if (time1 >= 0 && time2 <= 0) {
                                flag = false;
                            }
                        }


                        if (flag) {
                            data.push(res);
                        }


                    });
                }
            });
        }

        function filterData() {
            console.log("Filtering 01" + JSON.stringify(vm.savedDailyPlanFilter) + " Range " + vm.range);
            var data = [];
            if (!vm.savedDailyPlanFilter.selected) {
                data = vm.temp;
            } else {
                applySavedFilter(data);
            }
            var to = new Date();
            var from = new Date();

            if (vm.range == 'dateRange') {
                from = vm.filter.from;
                to = vm.filter.to;
            } else {
                if (vm.filter.range == 'today') {
                    from.setHours(0);
                    from.setMinutes(0);
                    from.setSeconds(0);
                    to.setHours(0);
                    to.setMinutes(0);
                    to.setSeconds(0);
                    to.setDate(to.getDate() + 1);
                    setDateRange('today');
                } else if (vm.filter.range == 'next-24-hours') {
                    to.setDate(to.getDate() + 1);
                    setDateRange('next-24-hours');
                }
            }


            var data2 = [];

            angular.forEach(data, function (value, index) {

                var flag = true;
                if (new Date(value.plannedStartTime) < from || new Date(value.plannedStartTime) > to) {
                    flag = false;
                }

                if (vm.filter.status && vm.filter.status != 'all' && value.state._text) {

                    if (vm.filter.status == "WAITING" && value.state._text.indexOf("PLANNED") === -1) {
                        flag = false;
                    } else if (vm.filter.status == "LATE" && !value.late) {
                        flag = false;
                    } else if (vm.filter.status == "EXECUTED" && value.state._text.indexOf("SUCCESSFUL") === -1 && value.state._text.indexOf("FAILED") === -1) {
                        flag = false;
                    }
                }

                if (flag) {
                    data2.push(value);
                }
            });

            vm.plans = data2;
            prepareGanttData(data2);
            vm.isLoading = true;
            console.log("Data " + vm.data.length);
        }

        function prepareGanttData(data2) {
            var minNextStartTime;
            var orders = [];
            data2 = orderBy(data2, 'plannedStartTime', false);

            angular.forEach(data2, function (order, index) {
                orders[index] = {};
                orders[index].tasks = [];
                orders[index].tasks[0] = {};
                if (order.job != "NULL") {
                    orders[index].name = order.job;
                    orders[index].orderId = '-';
                } else {
                    orders[index].name = order.jobChain.substring(order.jobChain.lastIndexOf('/') + 1, order.jobChain.length);
                    orders[index].orderId = order.orderId;
                }

                vm.plans[index].processedPlanned = orders[index].name;
                orders[index].tasks[0].name = orders[index].name;
                orders[index].status = order.state._text;
                vm.plans[index].status = order.state._text;
                if (order.state._text == 'SUCCESSFUL') {
                    orders[index].tasks[0].color = "#7ab97a";
                } else if (order.state._text == 'FAILED') {
                    orders[index].tasks[0].color = "#e86680";
                }
                else if (order.late) {
                    orders[index].tasks[0].color = "rgba(255, 195, 0, .9)";
                }

                orders[index].tasks[0].from = new Date(order.plannedStartTime);

                if (!minNextStartTime || minNextStartTime > new Date(order.plannedStartTime)) {
                    minNextStartTime = new Date(order.plannedStartTime);
                }
                orders[index].tasks[0].to = new Date(order.expectedEndTime);

            });

            if (minNextStartTime) {
                minNextStartTime.setMinutes(0);
                minNextStartTime.setHours(0);
                $scope.options.fromDate = minNextStartTime;
                console.log("Smallest from01 " + minNextStartTime);

            }
            vm.data = orderBy(orders, 'plannedStartTime');

            promise2 = $timeout(function () {
                $('#div').animate({
                    scrollLeft: $("#gantt-current-date-line").offset().left
                }, 800);
            }, 4500);
        }


        vm.tree = [];
        vm.getTreeStructure = function () {
            console.log("Getting tree structure");
            $('#treeModal').modal('show');
            var tree = [], keys = [];
            angular.forEach(vm.temp, function (item) {
                var key = item['jobChain'] || item['path'];
                if (keys.indexOf(key) === -1) {
                    keys.push(key);
                    tree.push(key.split('/'));
                }
            });
            vm.tree = convertToHierarchy(tree);

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

        vm.selectValue = function (data) {
            vm.filterString1 = data.JobChain;
            vm.dailyPlanFilter.name = vm.filterString1;
        };


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

        $scope.$on('$destroy', function () {
            if (promise1)
                $timeout.cancel(promise1);
            if (promise2)
                $timeout.cancel(promise2);
        });


    }
})();
