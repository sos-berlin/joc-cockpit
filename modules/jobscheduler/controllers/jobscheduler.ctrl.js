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
            displayName: "Agent Cluster Name",
            sortable: true,
            filterable: true,
            cellTemplate: "<span>{{row.branch[expandingProperty.field].substring(row.branch[expandingProperty.field].lastIndexOf('/')+1,row.branch[expandingProperty.field].lastIndexOf('&'))}}</span>"
        };
        vm.col_defs = [
            {
                field: "Status",
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
            vm.isLoading = false;
            JobSchedulerService.getAgentClusterP({
                state: state,
                jobschedulerId: vm.schedulerIds.selected
            }).then(function (res) {
                JobSchedulerService.getAgentCluster({
                    state: state,
                    jobschedulerId: vm.schedulerIds.selected
                }).then(function (result) {
                    vm.tree_data = prepareDataForTreegrid(res, result);
                    vm.isLoading = true;
                });
            }, function () {
                vm.isLoading = true;
                vm.isError = true;
            });
        };


        vm.loadLocks = function () {
            vm.isLoading = false;
            ResourceService.getLocksP({jobschedulerId: vm.schedulerIds.selected}).then(function (result) {
                vm.locks = result.locks;
                vm.isLoading = true;
                ResourceService.get({jobschedulerId: vm.schedulerIds.selected}).then(function (res) {
                    vm.locks = angular.merge(result.locks, res.locks);

                });
            }, function () {
                vm.isLoading = true;
                vm.isError = true;
            });
        };


        vm.loadProcessClass = function () {
            vm.isLoading = false;
            ResourceService.getProcessClassP({jobschedulerId: vm.schedulerIds.selected}).then(function (result) {
                vm.processClasses = result.processClasses;
                vm.isLoading = true;
                ResourceService.getProcessClass({jobschedulerId: vm.schedulerIds.selected}).then(function (res) {
                    vm.processClasses = angular.merge(result.processClasses, res.processClasses);

                });
            }, function () {
                vm.isLoading = true;
                vm.isError = true;
            });
        };


        vm.$on('$stateChangeSuccess', function (event, toState) {
            vm.state = '';
            if (toState.name == 'app.resources.agentClusters') {
                vm.state = 'agent';
                vm.filter.state = $stateParams.type || 'all';
                if (vm.filter.state === 'all') {
                    vm.loadAgents();
                } else {
                    vm.loadAgents(vm.filter.state === "healthy" ? 0 : vm.filter.state === "unhealthy" ? 1 : 2);
                }
            } else if (toState.name == 'app.resources.locks') {
                vm.state = 'lock';
                vm.loadLocks();
            } else {
                vm.state = 'processClass';
                vm.loadProcessClass();
            }

        });
    }


    ScheduleCtrl.$inject = ["$scope", "ScheduleService", "orderByFilter", "$uibModal"];
    function ScheduleCtrl($scope, ScheduleService, orderBy, $uibModal) {
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
        vm.init({jobschedulerId: vm.schedulerIds.selected});

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

        var watcher1 = vm.$watchCollection('object.schedules', function (newNames) {
            if (newNames && newNames.length > 0) {
                vm.allCheck.checkbox = newNames.length == vm.schedules.slice((vm.pageSize * (vm.currentPage - 1)), (vm.pageSize * vm.currentPage)).length;
            } else {
                vm.allCheck.checkbox = false;
            }
        });

        var watcher2 = vm.$watchCollection('filtered', function (newNames) {
            if (newNames)
                vm.object.schedules = [];
        });


        var watcher3 = vm.$watch('pageSize', function (newNames) {
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
            ScheduleService.substitute(schedule, vm.schedulerIds.selected).then(function (res) {

            });
        }

        vm.substitute = function (schedule) {
            vm._schedule = schedule;
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/add-substitute-dialog.html',
                controller: 'DialogCtrl',
                scope: vm
            });
            modalInstance.result.then(function () {
                substitute(schedule);
            }, function () {

            });
        };

        vm.substituteAll = function () {

            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/add-substitute-dialog.html',
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
            schedules.jobschedulerId = vm.schedulerIds.selected;
            schedules.schedule = schedule.path;
            schedules.runTime = vm.runTime;
            ScheduleService.setRunTime(schedules).then(function (result) {
                vm.schedules = result.schedules;
            }, function () {
                vm.isError = true;
            });

        };
        vm.editSchedule = function (schedule) {
            vm._schedule = schedule;
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/add-schedule.html',
                controller: 'DialogCtrl',
                scope: vm
            });
            modalInstance.result.then(function () {
                vm.setRunTime(vm._schedule);
            }, function () {
                vm.object.schedules = [];
            });
        };

        vm.$on('$destroy', function () {
            watcher1();
            watcher2();
            watcher3();
        });

    }


    ScheduleOrderCtrl.$inject = ["$scope", "ScheduleService", "$stateParams", "$uibModal"];
    function ScheduleOrderCtrl($scope, ScheduleService, $stateParams, $uibModal) {
        var vm = $scope;
        vm.name = $stateParams.name;

        ScheduleService.getScheduleP(vm.name, vm.schedulerIds.selected).then(function (result) {
            vm.schedule = result.schedule;
        }, function () {
            vm.isError = true;
        });


        function substitute(schedule) {
            ScheduleService.substitute(schedule, vm.schedulerIds.selected).then(function (res) {

            });
        }

        vm.substitute = function (schedule) {
            ScheduleService.getSchedulesP({jobschedulerId: vm.schedulerIds.selected}).then(function (result) {
                vm.schedules = result.schedules;
            }, function () {
                vm.isError = true;
            });
            vm._schedule = schedule;
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/add-substitute-dialog.html',
                controller: 'DialogCtrl',
                scope: vm
            });
            modalInstance.result.then(function () {
                substitute(schedule);
            }, function () {

            });
        };


    }

    DashboardCtrl.$inject = ['$scope', 'OrderService', 'JobSchedulerService', '$interval', '$state', '$timeout'];
    function DashboardCtrl($scope, OrderService, JobSchedulerService, $interval, $state, $timeout) {
        var vm = $scope;
        var bgColorArray = [];


        vm.getAgentCluster = function () {
            JobSchedulerService.getAgentCluster({jobschedulerId: vm.schedulerIds.selected}).then(function (result) {
                vm.agentClusters = result.agentClusters;
                var agentArray = [];
                var agentArray1 = [];
                angular.forEach(result.agentClusters, function (value) {

                    var numTask = 0;
                    angular.forEach(value.agents, function (value1) {
                        if (value1.runningTasks)
                            numTask = numTask + value1.runningTasks;
                    });
                    agentArray.push([value.path.substring(value.path.lastIndexOf('/') + 1), numTask]);

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

            return JobSchedulerService.getSupervisorP({jobschedulerId: vm.schedulerIds.selected});
        }


        vm.getClusterMembers = getClusterMembers;
        function getClusterMembers() {

            return JobSchedulerService.getClusterMembers({jobschedulerId: vm.schedulerIds.selected});
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

            return JobSchedulerService.getDatabase({jobschedulerId: vm.schedulerIds.selected});
        }

        function getClusterMembersP() {

            return JobSchedulerService.getClusterMembersP({jobschedulerId: vm.schedulerIds.selected});
        }


        vm.loadOrderSnapshot = function () {
            OrderService.getSnapshot({jobschedulerId: vm.schedulerIds.selected}).then(function (res) {
                vm.snapshot = res.orders;
            });
        };


        vm.interval = $interval(function () {
            vm.loadOrderSnapshot(undefined, vm.schedulerIds.selected);
        }, 60000);

        vm.$on('$destroy', function () {
            // Make sure that the interval is destroyed too
            $interval.cancel(vm.interval);
        });

        vm.$on('elementClick.directive', function (angularEvent, event) {

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
                JobSchedulerService.terminate(host, port, vm.schedulerIds.selected).then(function (res) {
                    success('stopped');
                }, function (err) {

                });
            } else if ((objectType == 'supervisor' || objectType == 'master') && action == 'restart') {
                JobSchedulerService.restart(host, port, vm.schedulerIds.selected).then(function (res) {
                    success('running');
                }, function (err) {

                });
            } else if ((objectType == 'supervisor' || objectType == 'master') && action == 'abortAndRestart') {
                JobSchedulerService.abortAndRestart(host, port, vm.schedulerIds.selected).then(function (res) {
                    success('running');
                }, function (err) {

                });

            } else if ((objectType == 'supervisor' || objectType == 'master') && action == 'pause') {
                JobSchedulerService.pause(host, port, vm.schedulerIds.selected).then(function (res) {
                    success('paused');
                }, function (err) {

                });

            } else if ((objectType == 'supervisor' || objectType == 'master') && action == 'continue') {
                JobSchedulerService.continue(host, port, vm.schedulerIds.selected).then(function (res) {
                    success('running');
                }, function (err) {

                });

            } else if (objectType == 'cluster' && action == 'terminate') {
                JobSchedulerService.terminateCluster({jobschedulerId: vm.schedulerIds.selected}).then(function (res) {
                    clusterSuccess('stopped');
                }, function (err) {

                });

            } else if (objectType == 'cluster' && action == 'terminateFailsafe') {
                JobSchedulerService.terminateFailsafeCluster({jobschedulerId: vm.schedulerIds.selected}).then(function (res) {
                    clusterSuccess('stopped');
                }, function (err) {

                });

            } else if (objectType == 'cluster' && action == 'restart') {
                JobSchedulerService.restartCluster({jobschedulerId: vm.schedulerIds.selected}).then(function (res) {
                    clusterSuccess('running');
                }, function (err) {

                });

            }


            function success(state) {
                //console.log("Here02 " + host + port);
                states[host + port] = state;
                //console.log("Here02 states " + states[host + port]);

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
                        test();
                        determineClusterStatus();
                        return;
                    }
                    angular.forEach(vm.clusterStatusData.members.masters, function (master, index) {
                        states[master.host + master.port] = state;
                        if (index == vm.clusterStatusData.members.masters.length - 1) {
                            test();
                            determineClusterStatus();
                        }
                    })
                }
            }
        };


        /*-------------Menu active function call-------------------*/
        vm.terminate = function () {
            JobSchedulerService.terminate({jobschedulerId: vm.schedulerIds.selected}).then(function (res) {

            });
        };
        vm.restart = function () {
            JobSchedulerService.restart({jobschedulerId: vm.schedulerIds.selected}).then(function (res) {

            });
        };
        vm.terminateFailSafe = function () {
            JobSchedulerService.terminateFailSafe({jobschedulerId: vm.schedulerIds.selected}).then(function (res) {

            });
        }

    }


    DailyPlanCtrl.$inject = ['$scope', 'JobSchedulerService', '$timeout', '$log', 'ganttUtils', 'GanttObjectModel', 'gettextCatalog', 'ganttDebounce',
        'moment', 'orderByFilter', '$uibModal', 'SavedFilter', 'toasty', 'OrderService', 'JobService'];
    function DailyPlanCtrl($scope, JobSchedulerService, $timeout, $log, utils, ObjectModel, gettextCatalog, debounce, moment, orderBy, $uibModal, SavedFilter, toasty,
                           OrderService, JobService) {

        var vm = $scope;

        vm.pageSize = 10;
        vm.currentPage = 1;
        vm.isCellOpen = true;
        vm.isLoading = true;
        vm.isLoading1 = true;
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

        vm.getPlans = function (dateRange) {
            filterData(dateRange);
        }

        vm.toggleSource = function () {

        }

        var objectModel;
        var dataToRemove;

        // Event handler
        var logScrollEvent = function (left, date, direction) {
            if (date !== undefined) {
                $log.info('[Event] api.on.scroll: ' + left + ', ' + (date === undefined ? 'undefined' : date.format()) + ', ' + direction);
            }
        };

        // Event handler
        var logDataEvent = function (eventName) {
            $log.info('[Event] ' + eventName);
        };

        // Event handler
        var logTaskEvent = function (eventName, task) {
            $log.info('[Event] ' + eventName + ': ' + task.model.name);
        };

        // Event handler
        var logRowEvent = function (eventName, row) {
            $log.info('[Event] ' + eventName + ': ' + row.model.name);
        };

        // Event handler
        var logTimespanEvent = function (eventName, timespan) {
            $log.info('[Event] ' + eventName + ': ' + timespan.model.name);
        };

        // Event handler
        var logLabelsEvent = function (eventName, width) {
            $log.info('[Event] ' + eventName + ': ' + width);
        };

        // Event handler
        var logColumnsGenerateEvent = function (columns, headers) {
            $log.info('[Event] ' + 'columns.on.generate' + ': ' + columns.length + ' column(s), ' + headers.length + ' header(s)');
        };

        // Event handler
        var logRowsFilterEvent = function (rows, filteredRows) {
            $log.info('[Event] rows.on.filter: ' + filteredRows.length + '/' + rows.length + ' rows displayed.');
        };

        // Event handler
        var logTasksFilterEvent = function (tasks, filteredTasks) {
            $log.info('[Event] tasks.on.filter: ' + filteredTasks.length + '/' + tasks.length + ' tasks displayed.');
        };

        // Event handler
        var logReadyEvent = function () {
            $log.info('[Event] core.on.ready');
        };

        // Event utility function
        var addEventName = function (eventName, func) {
            return function (data) {
                return func(eventName, data);
            };
        };


        // angular-gantt options
        var toDate = new Date();
        toDate.setDate(toDate.getDate() + 1);
        $scope.options = {
            mode: 'custom',
            scale: '30 minutes',
            sortMode: undefined,
            sideMode: 'TreeTable',
            daily: false,
            maxHeight: window.innerHeight - 300,
            width: false,
            zoom: 1,
            treeTableColumns: ['model.orderId', 'model.status'],
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
            treeHeaderContent: gettextCatalog.getString('label.processedPlans'),
            columnsHeaderContents: {
                'model.name': '{{getHeader()}}',
                'mode.lorderId': '{{getHeader()}}',
                'model.status': '{{getHeader()}}'
            },
            autoExpand: 'none',
            taskOutOfRange: 'truncate',
            fromDate: moment(null),
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
            filterTask: '',
            filterRow: '',
            shrinkToFit: true,
            timeFrames: {
                'day': {
                    start: moment('8:00', 'HH:mm'),
                    end: moment('20:00', 'HH:mm'),
                    color: '#a88add',
                    working: true,
                    default: true
                },
                'noon': {
                    start: moment('12:00', 'HH:mm'),
                    end: moment('13:30', 'HH:mm'),
                    working: false,
                    default: true
                },
                'closed': {
                    working: false,
                    default: true
                },
                'weekend': {
                    working: false
                },
                'holiday': {
                    working: false,
                    color: 'red',
                    classes: ['gantt-timeframe-holiday']
                }
            },
            dateFrames: {
                'weekend': {
                    evaluator: function (date) {
                        return date.isoWeekday() === 6 || date.isoWeekday() === 7;
                    },
                    targets: ['weekend']
                },
                '11-november': {
                    evaluator: function (date) {
                        date = new Date(date);
                        return date.getTime() === new Date().getTime();
                    },
                    targets: ['holiday']
                }
            },
            timeFramesWorkingMode: 'hidden',
            timeFramesNonWorkingMode: 'visible',
            columnMagnet: '15 minutes',
            timeFramesMagnet: true,
            dependencies: {
                enabled: false,
                conflictChecker: false
            },
            targetDataAddRowIndex: undefined,
            canDraw: function (event) {
                var isLeftMouseButton = event.button === 0 || event.button === 1;
                return $scope.options.draw && !$scope.options.readOnly && isLeftMouseButton;
            },
            drawTaskFactory: function () {
                return {
                    id: utils.randomUuid(),  // Unique id of the task.
                    name: 'Drawn task', // Name shown on top of each task.
                    color: '#AA8833' // Color of the task in HEX format (Optional).
                };
            },
            api: function (api) {
                // API Object is used to control methods and events from angular-gantt.
                $scope.api = api;

                api.core.on.ready($scope, function () {
                    // Log various events to console
                    api.scroll.on.scroll($scope, logScrollEvent);
                    api.core.on.ready($scope, logReadyEvent);

                    api.data.on.remove($scope, addEventName('data.on.remove', logDataEvent));
                    api.data.on.load($scope, addEventName('data.on.load', logDataEvent));
                    api.data.on.clear($scope, addEventName('data.on.clear', logDataEvent));
                    api.data.on.change($scope, addEventName('data.on.change', logDataEvent));

                    api.tasks.on.add($scope, addEventName('tasks.on.add', logTaskEvent));
                    api.tasks.on.change($scope, addEventName('tasks.on.change', logTaskEvent));
                    api.tasks.on.rowChange($scope, addEventName('tasks.on.rowChange', logTaskEvent));
                    api.tasks.on.remove($scope, addEventName('tasks.on.remove', logTaskEvent));

                    if (api.tasks.on.moveBegin) {
                        api.tasks.on.moveBegin($scope, addEventName('tasks.on.moveBegin', logTaskEvent));
                        //api.tasks.on.move($scope, addEventName('tasks.on.move', logTaskEvent));
                        api.tasks.on.moveEnd($scope, addEventName('tasks.on.moveEnd', logTaskEvent));

                        api.tasks.on.resizeBegin($scope, addEventName('tasks.on.resizeBegin', logTaskEvent));
                        //api.tasks.on.resize($scope, addEventName('tasks.on.resize', logTaskEvent));
                        api.tasks.on.resizeEnd($scope, addEventName('tasks.on.resizeEnd', logTaskEvent));
                    }

                    if (api.tasks.on.drawBegin) {
                        api.tasks.on.drawBegin($scope, addEventName('tasks.on.drawBegin', logTaskEvent));
                        //api.tasks.on.draw($scope, addEventName('tasks.on.draw', logTaskEvent));
                        api.tasks.on.drawEnd($scope, addEventName('tasks.on.drawEnd', logTaskEvent));
                    }

                    api.rows.on.add($scope, addEventName('rows.on.add', logRowEvent));
                    api.rows.on.change($scope, addEventName('rows.on.change', logRowEvent));
                    api.rows.on.move($scope, addEventName('rows.on.move', logRowEvent));
                    api.rows.on.remove($scope, addEventName('rows.on.remove', logRowEvent));

                    api.side.on.resizeBegin($scope, addEventName('labels.on.resizeBegin', logLabelsEvent));
                    //api.side.on.resize($scope, addEventName('labels.on.resize', logLabelsEvent));
                    api.side.on.resizeEnd($scope, addEventName('labels.on.resizeEnd', logLabelsEvent));

                    api.timespans.on.add($scope, addEventName('timespans.on.add', logTimespanEvent));
                    api.columns.on.generate($scope, logColumnsGenerateEvent);

                    api.rows.on.filter($scope, logRowsFilterEvent);
                    api.tasks.on.filter($scope, logTasksFilterEvent);

                    api.data.on.change($scope, function (newData) {
                        //if (dataToRemove === undefined) {
                        //    dataToRemove = [
                        //        {'id': newData[1].id}, // Remove Kickoff row
                        //        {
                        //            'id': newData[0].id, 'tasks': [
                        //            {'id': newData[0].tasks[0].id},
                        //        ]
                        //        }
                        //    ];
                        //}
                    });

                    // When gantt is ready, load data.
                    // `data` attribute could have been used too.
                    $scope.load();

                    // Add some DOM events
                    api.directives.on.new($scope, function (directiveName, directiveScope, element) {
                        if (directiveName === 'ganttTask') {
                            element.bind('click', function (event) {
                                event.stopPropagation();
                                logTaskEvent('task-click', directiveScope.task);
                            });
                            element.bind('mousedown touchstart', function (event) {
                                event.stopPropagation();
                                $scope.live.row = directiveScope.task.row.model;
                                if (directiveScope.task.originalModel !== undefined) {
                                    $scope.live.task = directiveScope.task.originalModel;
                                } else {
                                    $scope.live.task = directiveScope.task.model;
                                }
                                $scope.$digest();
                            });
                        } else if (directiveName === 'ganttRow') {
                            element.bind('click', function (event) {
                                event.stopPropagation();
                                logRowEvent('row-click', directiveScope.row);
                            });
                            element.bind('mousedown touchstart', function (event) {
                                event.stopPropagation();
                                $scope.live.row = directiveScope.row.model;
                                $scope.$digest();
                            });
                        } else if (directiveName === 'ganttRowLabel') {
                            element.bind('click', function () {
                                logRowEvent('row-label-click', directiveScope.row);
                            });
                            element.bind('mousedown touchstart', function () {
                                $scope.live.row = directiveScope.row.model;
                                $scope.$digest();
                            });
                        }
                    });

                    api.tasks.on.rowChange($scope, function (task) {
                        $scope.live.row = task.row.model;
                    });

                    objectModel = new ObjectModel(api);
                });
            }
        };

        $scope.handleTaskIconClick = function (taskModel) {
            alert('Icon from ' + taskModel.name + ' task has been clicked.');
        };

        $scope.handleRowIconClick = function (rowModel) {
            alert('Icon from ' + rowModel.name + ' row has been clicked.');
        };

        $scope.expandAll = function () {
            $scope.api.tree.expandAll();
        };

        $scope.collapseAll = function () {
            $scope.api.tree.collapseAll();
        };

        $scope.$watch('options.sideMode', function (newValue, oldValue) {
            if (newValue !== oldValue) {
                $scope.api.side.setWidth(undefined);
                $timeout(function () {
                    $scope.api.columns.refresh();
                });
            }
        });

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

        // Reload data action
        $scope.load = function () {
            //$scope.data = JobSchedulerService.getSampleData();


            if (vm.dataSource == 'Demo') {
                vm.temp = OrderService.getDailyPlanData();
                filterData();
            } else {
                OrderService.get().then(function (res) {

                    res.orders = res.orders.splice(0, 20);
                    vm.temp = res.orders;
                    angular.forEach(vm.temp, function (value, index) {
                        value.nextStartTime = new Date();
                        value.nextStartTime.setMinutes(value.nextStartTime.getMinutes() + 30);

                    });
                    JobService.get({compact: false}).then(function (res) {
                        res.jobs = res.jobs.splice(0, 20);
                        angular.forEach(res.jobs, function (value, index) {
                            //if (value.nextStartTime) {
                            console.log("Job is having next start time");
                            value.nextStartTime = new Date();
                            value.nextStartTime.setMinutes(value.nextStartTime.getMinutes() + 30);
                            vm.temp.push(value);
                            //  }


                        });
                        filterData();
                    }, function (err) {

                    })


                })
            }


            dataToRemove = undefined;

            $scope.timespans = JobSchedulerService.getSampleTimespans();
        };

        $scope.reload = function () {
            $scope.load();
        };

        // Remove data action
        $scope.remove = function () {
            $scope.api.data.remove(dataToRemove);
            $scope.api.dependencies.refresh();
        };

        // Clear data action
        $scope.clear = function () {
            $scope.data = [];
        };

        // Add data to target row index
        $scope.addOverlapTaskToTargetRowIndex = function () {
            var targetDataAddRowIndex = parseInt($scope.options.targetDataAddRowIndex);

            if (targetDataAddRowIndex) {
                var targetRow = $scope.data[$scope.options.targetDataAddRowIndex];

                if (targetRow && targetRow.tasks && targetRow.tasks.length > 0) {
                    var firstTaskInRow = targetRow.tasks[0];
                    var copiedColor = firstTaskInRow.color;
                    var firstTaskEndDate = firstTaskInRow.to.toDate();
                    var overlappingFromDate = new Date(firstTaskEndDate);

                    overlappingFromDate.setDate(overlappingFromDate.getDate() - 1);

                    var overlappingToDate = new Date(overlappingFromDate);

                    overlappingToDate.setDate(overlappingToDate.getDate() + 7);

                    targetRow.tasks.push({
                        'name': 'Overlapping',
                        'from': overlappingFromDate,
                        'to': overlappingToDate,
                        'color': copiedColor
                    });
                }
            }
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


        // Visual two way binding.
        $scope.live = {};

        var debounceValue = 1000;

        var listenTaskJson = debounce(function (taskJson) {
            if (taskJson !== undefined) {
                var task = angular.fromJson(taskJson);
                objectModel.cleanTask(task);
                var model = $scope.live.task;
                angular.extend(model, task);
            }
        }, debounceValue);
        $scope.$watch('live.taskJson', listenTaskJson);

        var listenRowJson = debounce(function (rowJson) {
            if (rowJson !== undefined) {
                var row = angular.fromJson(rowJson);
                objectModel.cleanRow(row);
                var tasks = row.tasks;

                delete row.tasks;
                delete row.drawTask;

                var rowModel = $scope.live.row;

                angular.extend(rowModel, row);

                var newTasks = {};
                var i, l;

                if (tasks !== undefined) {
                    for (i = 0, l = tasks.length; i < l; i++) {
                        objectModel.cleanTask(tasks[i]);
                    }

                    for (i = 0, l = tasks.length; i < l; i++) {
                        newTasks[tasks[i].id] = tasks[i];
                    }

                    if (rowModel.tasks === undefined) {
                        rowModel.tasks = [];
                    }
                    for (i = rowModel.tasks.length - 1; i >= 0; i--) {
                        var existingTask = rowModel.tasks[i];
                        var newTask = newTasks[existingTask.id];
                        if (newTask === undefined) {
                            rowModel.tasks.splice(i, 1);
                        } else {
                            objectModel.cleanTask(newTask);
                            angular.extend(existingTask, newTask);
                            delete newTasks[existingTask.id];
                        }
                    }
                } else {
                    delete rowModel.tasks;
                }

                angular.forEach(newTasks, function (newTask) {
                    rowModel.tasks.push(newTask);
                });
            }
        }, debounceValue);
        $scope.$watch('live.rowJson', listenRowJson);

        $scope.$watchCollection('live.task', function (task) {
            $scope.live.taskJson = angular.toJson(task, true);
            $scope.live.rowJson = angular.toJson($scope.live.row, true);
        });

        $scope.$watchCollection('live.row', function (row) {
            $scope.live.rowJson = angular.toJson(row, true);
            if (row !== undefined && row.tasks !== undefined && row.tasks.indexOf($scope.live.task) < 0) {
                $scope.live.task = row.tasks[0];
            }
        });

        $scope.$watchCollection('live.row.tasks', function () {
            $scope.live.rowJson = angular.toJson($scope.live.row, true);
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

        vm.showLogFuc = function (plan) {
            vm.showLogPanel = plan;
            var filter = [];
            filter[0] = {};
            filter[0].jobChain = plan.jobChain;
            filter[0].orderId = plan.orderId;
            OrderService.histories(filter).then(function (res) {
                vm.histories = res.history;
            }, function (err) {

            })
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


                        if (flag && value.state && !value.name && res.processingState._text) {
                            if (value.state.indexOf(res.processingState._text) === -1) {
                                flag = false;
                            }
                        }

                        if (flag && value.state && value.name && res.processingState._text) {
                            if (value.state.indexOf(res.processingState._text) === -1) {
                                flag = false;
                            }
                        }


                        if (value.processPlanned && res.name) {
                            if (!res.name.match(value.name)) {
                                flag = false;
                            }
                        }

                        if (flag && value.processPlanned && !res.name && res.jobChain) {
                            if (!res.jobChain.match(value.jobChain)) {
                                flag = false;
                            }
                        }
                        if (flag && value.fromDate && res.nextStartTime) {

                            if (value.fromTime) {
                                value.fromDate = new Date(value.fromDate);
                                value.fromTime = new Date(value.fromTime);
                                value.fromDate.setHours(value.fromTime.getHours());
                                value.fromDate.setMinutes(value.fromTime.getMinutes());
                                value.fromDate.setSeconds(value.fromTime.getSeconds());
                            }
                            var time1 = moment(value.fromDate).diff(moment(res.nextStartTime));
                            var time2 = moment(res.nextStartTime).diff(moment(value.toDate));
                            if (time1 >= 0 && time2 <= 0) {
                                flag = false;
                            }
                        }


                        if (flag)
                            data.push(res);
                    });
                }
            });
        }

        function filterData(dateRange) {
            console.log("Filtering " + JSON.stringify(vm.savedDailyPlanFilter));
            var data = [];
            if (!vm.savedDailyPlanFilter.selected) {
                data = vm.temp;
            } else {
                applySavedFilter(data);
            }
            var to = new Date();
            var from = new Date();

            if (dateRange) {
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
                console.log("Filter for state " + vm.filter.status);
                var flag = true;
                if (new Date(value.nextStartTime) < from || new Date(value.nextStartTime) > to) {

                    flag = false;
                }

                if (vm.filter.status && vm.filter.status != 'all' && !value.name && value.processingState._text) {
                    console.log("Found " + value.processingState._text);
                    if (vm.filter.status.indexOf(value.processingState._text) === -1) {
                        console.log("Not matched ");
                        flag = false;
                    } else {
                        console.log("Matched ");
                    }
                }

                if (vm.filter.status && vm.filter.status != 'all' && value.name && value.state._text) {
                    if (vm.filter.status.indexOf(value.state._text) === -1) {
                        flag = false;
                    }
                }
                if (flag) {
                    data2.push(value);
                }
            });

            vm.plans = data2;
            prepareGanttData(data2);
            console.log("Data " + vm.data.length);
        }

        function prepareGanttData(data2) {
            var orders = [];
            angular.forEach(data2, function (order, index) {
                orders[index] = {};
                orders[index].tasks = [];
                orders[index].tasks[0] = {};
                if (order.name) {
                    orders[index].name = order.name;
                    vm.plans[index].processedPlan = order.name;
                    orders[index].tasks[0].name = order.name;
                    orders[index].orderId = '-';
                    orders[index].status = order.state._text;
                    vm.plans[index].status = order.state._text;
                    if (order.state._text == 'EXECUTED') {
                        orders[index].tasks[0].color = "#7ab97a";
                    } else if (order.state._text == 'LATE') {
                        orders[index].tasks[0].color = "rgba(255, 195, 0, .9)";
                    }
                } else {
                    orders[index].name = order.jobChain.substring(order.jobChain.lastIndexOf('/') + 1, order.jobChain.length);
                    vm.plans[index].processedPlan = orders[index].name;
                    orders[index].tasks[0].name = order.orderId;
                    orders[index].orderId = order.orderId;
                    orders[index].status = order.processingState._text;
                    vm.plans[index].status = order.processingState._text;
                    if (order.processingState._text == 'EXECUTED') {
                        orders[index].tasks[0].color = "#7ab97a";
                    } else if (order.processingState._text == 'LATE') {
                        orders[index].tasks[0].color = "rgba(255, 195, 0, .9)";
                    }
                }
                orders[index].tasks[0].from = new Date(order.nextStartTime);
                orders[index].tasks[0].to = new Date(order.nextStartTime);
                orders[index].tasks[0].to.setMinutes(orders[index].tasks[0].to.getMinutes() + 30);


            })
            vm.data = orders;
        }

        vm.tree =[];
        vm.getTreeStructure = function() {
            console.log("Getting tree structure");
            $('#treeModal').modal('show');
            var tree = [], keys = [];
            angular.forEach(vm.temp, function (item) {
                var key = item['jobChain']||item['path'];
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

         vm.selectValue = function(data){
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


    }
})();
