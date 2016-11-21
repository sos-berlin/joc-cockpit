/**
 * Created by sourabhagrawal on 29/06/16.
 */
(function () {
    'use strict';
    angular
        .module('app')
        .controller('ResourceCtrl', ResourceCtrl)
        .controller('ScheduleOrderCtrl', ScheduleOrderCtrl)
        .controller('DashboardCtrl', DashboardCtrl)
        .controller('DailyPlanCtrl', DailyPlanCtrl);


    ResourceCtrl.$inject = ["$scope", "$rootScope", 'JobSchedulerService', "ResourceService", "orderByFilter", "gettextCatalog", "ScheduleService", "$interval", "$uibModal"];
    function ResourceCtrl($scope, $rootScope, JobSchedulerService, ResourceService, orderBy, gettextCatalog, ScheduleService, $interval, $uibModal) {
        var vm = $scope;
        vm.filter = {};
        vm.filter.state = "all";
        vm.filter.sortBy = "name";
        vm.filter1 = {};
        vm.filter1.state = "all";
        vm.object = {};
        vm.pageSize = 10;
        vm.currentPage = 1;

        vm.tree = [];
        vm.treeLock = [];
        vm.treeProcess = [];
        vm.tree_data = [];
        vm.my_tree = {};
        vm.my_tree_lock = {};
        vm.my_tree_process = {};

        vm.expanding_property1 = {
            field: "name"
        };
        vm.sortBy = function (propertyName) {
            vm.reverse = (propertyName !== null && vm.propertyName === propertyName) ? !vm.reverse : false;
            vm.propertyName = propertyName;
            if (vm.state == 'agent') {
                vm.tree_data = orderBy(vm.tree_data, vm.propertyName, vm.reverse);
            }
            else if (vm.state == 'locks') {
                vm.allLocks = orderBy(vm.allLocks, vm.propertyName, vm.reverse);
            } else if (vm.state == 'processClass') {
                vm.allProcessClasses = orderBy(vm.allProcessClasses, vm.propertyName, vm.reverse);
            } else {
                vm.object.schedules = [];
                vm.allSchedules = orderBy(vm.allSchedules, vm.propertyName, vm.reverse);
            }
        };

        vm.mainSortBy = function (propertyName) {
            vm.sortReverse = !vm.sortReverse;
            vm.filter.sortBy = propertyName;
            if (vm.state == 'agent')
                vm.tree_data = orderBy(vm.tree_data, vm.filter.sortBy, vm.sortReverse);
            else if (vm.state == 'locks') {
                vm.allLocks = orderBy(vm.allLocks, vm.filter.sortBy, vm.sortReverse);
            } else if (vm.state == 'processClass') {
                vm.allProcessClasses = orderBy(vm.allProcessClasses, vm.filter.sortBy, vm.sortReverse);
            } else {
                vm.object.schedules = [];
                vm.allSchedules = orderBy(vm.allSchedules, vm.filter.sortBy, vm.sortReverse);
            }
        };


        /** -----------------Begin Agent clusters------------------- */


        vm.expanding_property = {
            field: "AgentCluster",
            displayName: gettextCatalog.getString('label.agentCluster'),
            sortable: true
        };

        vm.col_defs = [
            {
                field: "Status",
                displayName: gettextCatalog.getString('label.status'),
                sortable: true,
                cellTemplate: "<span  class='label b-{{row.branch[col.field].substr(0,row.branch[col.field].length-1)}} _{{row.branch[col.field].substr(row.branch[col.field].length-1,row.branch[col.field].length)}}'>{{ row.branch[col.field].substring(0,row.branch[col.field].lastIndexOf('&')) | translate}}</span>"
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
                field: "RunningAgents",
                displayName: gettextCatalog.getString('label.runningAgents'),
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
                displayName: gettextCatalog.getString('label.maxProcesses'),
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

        function prepareDataForTree(res) {
            var agentsData = [];
            angular.forEach(res, function (value) {
                var st = value.state._text === "ALL_AGENTS_ARE_RUNNING" ? "healthy" : value.state._text === "ONLY_SOME_AGENTS_ARE_RUNNING" ? "unhealthy" : "unreachable";
                var clusterObj = {
                    "AgentCluster": value.path,
                    "Status": st + '&',
                    "URL": '-',
                    "TotalAgents": value.numOfAgents.any,
                    "RunningAgents": value.numOfAgents.running,
                    "NotReachable": value.numOfAgents.any - value.numOfAgents.running,
                    "SchedulingType": value._type,
                    "LastUpdateTime": value.surveyDate,
                    "MaxProcess": value.maxProcesses,
                    "RunningTasks": 0,
                    "children": []
                };

                angular.forEach(value.agents, function (agent, index1) {
                    if (agent.runningTasks)
                        clusterObj.RunningTasks = clusterObj.RunningTasks + agent.runningTasks;

                    var agentObj = {
                        "AgentCluster": agent.host || '-',
                        "Status": agent.state._text + '&' + agent.state.severity,
                        "URL": agent.url,
                        "TotalAgents": "-",
                        "RunningAgents": "-",
                        "NotReachable": "-",
                        "SchedulingType": "-",
                        "LastUpdateTime": agent.surveyDate,
                        "MaxProcess": "-",
                        "RunningTasks": agent.runningTasks
                    };
                    clusterObj.children.push(agentObj);
                });

                agentsData.push(clusterObj);

            });
            return agentsData;
        }


        vm.loadAgents = function () {
            var obj = {};
            obj.jobschedulerId = $scope.schedulerIds.selected;
            if (vm.filter.state != 'all') {
                obj.state = vm.filter.state == '0' ? 0 : vm.filter.state == '1' ? 1 : 2;
            }

            JobSchedulerService.getAgentClusterP(obj).then(function (res) {
                vm.agentClusters = res.agentClusters;
                vm.tree_data = prepareDataForTree(vm.agentClusters);
                vm.isLoading = true;
                loadAgentsV();
            }, function () {
                vm.isLoading = true;
                loadAgentsV();
            });
        };

        function loadAgentsV() {
            var obj = {};
            obj.jobschedulerId = $scope.schedulerIds.selected;

            if (vm.filter.state != 'all') {
                obj.state = vm.filter.state == '0' ? 0 : vm.filter.state == '1' ? 1 : 2;
            }

            JobSchedulerService.getAgentCluster(obj).then(function (result) {
/*                if(vm.agentClusters && vm.agentClusters.length>0) {
                    angular.forEach(vm.agentClusters, function (data) {
                        angular.forEach(result.agentClusters, function (data1) {
                            if (data1.path == '/' + data.path + '/' + data.name) {
                                data = angular.merge(data, data1);
                            }
                        });
                    });
                }
                else*/
                    vm.agentClusters = result.agentClusters;

                vm.tree_data = prepareDataForTree(vm.agentClusters);
            });
        }

        /** <<<<<<<<<<<<< End Agent clusters >>>>>>>>>>>>>>> */





        /** -----------------Begin Locks------------------- */
        /**
         * Function to initialized SCHEDULE tree
         */
        function initLockTree() {
            ResourceService.tree({
                jobschedulerId: vm.schedulerIds.selected,
                compact: true,
                types: ['LOCK']
            }).then(function (res) {
                vm.treeLock = res.folders;
                vm.isLoading = true;
            }, function (err) {
                vm.isLoading = true;
            });
        }

        function volatileInformationL(obj, flag) {
            ResourceService.get(obj).then(function (res) {
                if (vm.locks.length > 0) {
                    angular.forEach(vm.locks, function (lock) {
                        angular.forEach(res.locks, function (lockData) {
                            if (lock.path == lockData.path) {
                                lock = angular.merge(lock, lockData);
                            }
                        });
                    });
                } else {
                    vm.locks = res.locks;
                }
                if (flag) {
                    startTraverseTreeL();
                }
            }, function () {
                if (flag) {
                    startTraverseTreeL();
                }
            });
        }


        /**
         * Expand all tree data
         */
        vm.expandAllL = function () {
            vm.branchsL = [];
            vm.allLocks = [];
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            ResourceService.getLocksP(obj).then(function (result) {
                vm.locks = result.locks;
                volatileInformationL(obj, true);
            }, function () {
                volatileInformationL(obj, true);
                vm.isError = true;
            });

        };
        function startTraverseTreeL() {
            vm.branchsL = [];
            vm.allLocks = [];
            angular.forEach(vm.treeLock, function (value) {
                traverseTreeL(value);
            });
        }

        function traverseTreeL(data) {
            data.locks = [];
            data.folders = orderBy(data.folders, 'name');
            angular.forEach(vm.locks, function (value) {
                if (data.path == value.path.substring(0, value.path.lastIndexOf('/'))) {
                    data.locks.push(value);
                    vm.allLocks.push(value);
                }
            });
            if (data.locks.length > 0) {
                vm.branchsL.push(data);
            }

            if (data.folders.length > 0) {
                angular.forEach(data.folders, function (value) {
                    traverseTreeL(value);
                });
            }
        }

        function expandFolderDataL(data) {
            vm.loading = true;
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.folders = [{folder: data.path, recursive: false}];
            ResourceService.getLocksP(obj).then(function (result) {
                data.locks = result.locks;
                volatileFolderDataL(data, obj);
            }, function () {
                volatileFolderDataL(data, obj);
            });
        }

        function volatileFolderDataL(data, obj) {
            ResourceService.get(obj).then(function (res) {
                if (data.locks && data.locks.length > 0) {
                    angular.forEach(data.locks, function (lock) {
                        angular.forEach(res.locks, function (lockData) {
                            if (lock.path == lockData.path) {
                                lock = angular.merge(lock, lockData);
                            }
                        });
                    });
                } else {
                    data.locks = res.locks;
                }
                if (data.locks.length > 0) {
                    data.locks = orderBy(data.locks, vm.filter.sortBy);
                    vm.branchsL.push(data);
                }
                angular.forEach(data.locks, function (value) {
                    vm.allLocks.push(value);
                });
            }, function () {
                if (data.locks.length > 0) {
                    data.locks = orderBy(data.locks, vm.filter.sortBy);
                    vm.branchsL.push(data);
                }
                angular.forEach(data.locks, function (value) {
                    vm.allLocks.push(value);
                });
            });
        }

        vm.treeHandlerL = function (data) {
            data.expanded = !data.expanded;
            if (data.expanded) {
                if (!data.locks || data.locks.length == 0)
                    expandFolderDataL(data);
                vm.branchsL = [];
                vm.allLocks = [];
                vm.branchsL.push(data);
                angular.forEach(data.locks, function (value) {
                    vm.allLocks.push(value);
                });
            }
        };

        vm.treeHandler1L = function (data) {
            data.folders = orderBy(data.folders, 'name');
            data.locks = [];
            vm.branchsL = [];
            vm.allLocks = [];
            expandFolderDataL(data);
        };

        vm.expandNodeL = function (data) {
            vm.branchsL = [];
            vm.allLocks = [];
            function recursiveL(data) {
                data.expanded = !0;
                data.folders = orderBy(data.folders, 'name');

                data.locks = [];
                expandFolderDataL(data);
                angular.forEach(data.folders, function (a) {
                    a.expanded = !0;

                    a.locks = [];
                    expandFolderDataL(data);

                    if (a.folders.length > 0) {
                        angular.forEach(a.folders, function (value) {
                            recursiveL(value);
                        });
                    }
                });
            }

            recursiveL(data);
        };

        vm.collapseNodeL = function (data) {
            function recursiveL(data) {
                data.expanded = !1;
                angular.forEach(data.folders, function (a) {
                    a.expanded = !1;
                    if (a.folders.length > 0) {
                        angular.forEach(a.folders, function (value) {
                            recursiveL(value);
                        });
                    }
                });
            }

            recursiveL(data);
        };


        function checkExpandL(data) {
            data.locks = [];
            expandFolderDataL(data);
            if (data.locks.length > 0) {
                vm.branchsL.push(data);
            }
            angular.forEach(data.locks, function (value) {
                vm.allLocks.push(value);
            });
            angular.forEach(data.folders, function (value) {
                if (value.expanded)
                    checkExpandL(value);
            });

        }

        function checkExpandTreeForUpdatesL(data) {

            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.folders = [{folder: data.path, recursive: false}];

            if (data.locks.length > 0)
                volatileFolderDataL(data, obj);

            angular.forEach(data.folders, function (value) {
                if (value.expanded)
                    checkExpandTreeForUpdatesL(value);
            });
        }

        function filteredVolatileTreeDataL() {
            angular.forEach(vm.treeLock, function (value) {
                if (value.expanded)
                    checkExpandTreeForUpdatesL(value);
            });
        }


        /** <<<<<<<<<<<<< End Locks >>>>>>>>>>>>>>> */

        /** -----------------Begin ProcessClass------------------- */

        /**
         * Function to initialized SCHEDULE tree
         */
        function initProccessTree() {
            ResourceService.tree({
                jobschedulerId: vm.schedulerIds.selected,
                compact: true,
                types: ['PROCESSCLASS']
            }).then(function (res) {

                vm.treeProcess = res.folders;
                vm.isLoading = true;
            }, function (err) {
                vm.isLoading = true;
            });
        }

        function volatileInformationP(obj, flag) {
            ResourceService.getProcessClass(obj).then(function (res) {
                if (vm.processClasses.length > 0) {
                    angular.forEach(vm.processClasses, function (processClass) {
                        angular.forEach(res.processClasses, function (processClassData) {
                            if (processClass.path == processClassData.path) {
                                processClass = angular.merge(processClass, processClassData);
                            }
                        });
                    });
                } else {
                    vm.processClasses = res.processClasses;
                }
                if (flag) {
                    startTraverseTreeP();
                }
            }, function () {
                if (flag) {
                    startTraverseTreeP();
                }
            });
        }



        /**
         * Expand all tree data
         */
        vm.expandAllP = function () {
            vm.branchsP = [];
            vm.allProcessClasses = [];
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            ResourceService.getProcessClassP(obj).then(function (result) {
                vm.processClasses = result.processClasses;
                volatileInformationP(obj, true);
            }, function () {
                volatileInformationP(obj, true);
                vm.isError = true;
            });

        };
        function startTraverseTreeP() {
            vm.branchsP = [];
            vm.allProcessClasses = [];
            angular.forEach(vm.treeProcess, function (value) {
                traverseTreeP(value);
            });
        }

        function traverseTreeP(data) {
            data.processClasses = [];
            data.folders = orderBy(data.folders, 'name');
            angular.forEach(vm.processClasses, function (value) {
                if (data.path == value.path.substring(0, value.path.lastIndexOf('/'))) {
                    data.processClasses.push(value);
                    vm.allProcessClasses.push(value);
                }
            });
            if (data.processClasses.length > 0) {
                vm.branchsP.push(data);
            }

            if (data.folders.length > 0) {
                angular.forEach(data.folders, function (value) {
                    traverseTreeP(value);
                });
            }
        }

        function expandFolderDataP(data) {
            vm.loading = true;
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.folders = [{folder: data.path, recursive: false}];
            ResourceService.getProcessClassP(obj).then(function (result) {
                data.processClasses = result.processClasses;
                volatileFolderDataP(data, obj);
            }, function () {
                volatileFolderDataP(data, obj);
            });
        }

        function volatileFolderDataP(data, obj) {
            ResourceService.getProcessClass(obj).then(function (res) {
                if (data.processClasses.length > 0) {
                    angular.forEach(data.processClasses, function (processClass) {
                        angular.forEach(res.processClasses, function (processClassData) {
                            if (processClass.path == processClassData.path) {
                                processClass = angular.merge(processClass, processClassData);
                            }
                        });
                    });
                } else {
                    data.processClasses = res.processClasses;
                }
                if (data.processClasses.length > 0) {
                    data.processClasses = orderBy(data.processClasses, vm.filter.sortBy);
                    vm.branchsP.push(data);
                }
                angular.forEach(data.processClasses, function (value) {
                    vm.allProcessClasses.push(value);
                });
            }, function () {
                if (data.processClasses.length > 0) {
                    data.processClasses = orderBy(data.processClasses, vm.filter.sortBy);
                    vm.branchsP.push(data);
                }
                angular.forEach(data.processClasses, function (value) {
                    vm.allProcessClasses.push(value);
                });
            });
        }

        vm.treeHandlerP = function (data) {
            data.expanded = !data.expanded;
            if (data.expanded) {
                if (!data.processClasses || data.processClasses.length == 0)
                    expandFolderDataP(data);
                vm.branchsP = [];
                vm.allProcessClasses = [];
                vm.branchsP.push(data);
                angular.forEach(data.processClasses, function (value) {
                    vm.allProcessClasses.push(value);
                });
            }
        };

        vm.treeHandler1P = function (data) {
            data.folders = orderBy(data.folders, 'name');
            data.processClasses = [];
            vm.branchsP = [];
            vm.allProcessClasses = [];
            expandFolderDataP(data);

        };

        vm.expandNodeP = function (data) {
            vm.branchsP = [];
            vm.allProcessClasses = [];
            function recursiveP(data) {
                data.expanded = !0;
                data.folders = orderBy(data.folders, 'name');

                data.processClasses = [];
                expandFolderDataP(data);
                angular.forEach(data.folders, function (a) {
                    a.expanded = !0;

                    a.processClasses = [];
                    expandFolderDataP(data);

                    if (a.folders.length > 0) {
                        angular.forEach(a.folders, function (value) {
                            recursiveP(value);
                        });
                    }
                });
            }

            recursiveP(data);
        };

        vm.collapseNodeP = function (data) {
            function recursiveP(data) {
                data.expanded = !1;
                angular.forEach(data.folders, function (a) {
                    a.expanded = !1;
                    if (a.folders.length > 0) {
                        angular.forEach(a.folders, function (value) {
                            recursiveP(value);
                        });
                    }
                });
            }

            recursiveP(data);
        };


        function checkExpandP(data) {
            data.processClasses = [];
            expandFolderDataP(data);
            if (data.processClasses.length > 0) {
                vm.branchsP.push(data);
            }
            angular.forEach(data.processClasses, function (value) {
                vm.allProcessClasses.push(value);
            });
            angular.forEach(data.folders, function (value) {
                if (value.expanded)
                    checkExpandP(value);
            });

        }

        function checkExpandTreeForUpdatesP(data) {

            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.folders = [{folder: data.path, recursive: false}];

            if (data.processClasses.length > 0)
                volatileFolderDataP(data, obj);

            angular.forEach(data.folders, function (value) {
                if (value.expanded)
                    checkExpandTreeForUpdatesP(value);
            });
        }

        function filteredVolatileTreeDataP() {
            angular.forEach(vm.treeProcess, function (value) {
                if (value.expanded)
                    checkExpandTreeForUpdatesP(value);
            });
        }

        /** <<<<<<<<<<<<< End ProcessClass >>>>>>>>>>>>>>> */


        /** -----------------Begin Schedules------------------- */


        vm.allCheck = {
            checkbox: false
        };

        var watcher1 = $scope.$watchCollection('object.schedules', function (newNames) {
            if (newNames && newNames.length > 0) {
                vm.allCheck.checkbox = newNames.length == vm.allSchedules.slice((vm.pageSize * (vm.currentPage - 1)), (vm.pageSize * vm.currentPage)).length;
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
            if (vm.allCheck.checkbox && vm.allSchedules.length > 0) {
                vm.object.allSchedules = vm.allSchedules.slice((vm.pageSize * (vm.currentPage - 1)), (vm.pageSize * vm.currentPage));
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
            vm.sch._substitute = schedule.path;
            vm.schedule = schedule;

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
                scope: vm,
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                angular.forEach(vm.object.schedules, function (value) {
                    substitute(value);
                });
            }, function () {
                vm.object.schedules = [];
            });
        };

        vm.reset = function () {
            vm.object.schedules = [];
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


        /**
         * Function to initialized SCHEDULE tree
         */
        function initTree() {
            ResourceService.tree({
                jobschedulerId: vm.schedulerIds.selected,
                compact: true,
                types: ['SCHEDULE']
            }).then(function (res) {
                console.log(res.folders)
                if(res.folders && res.folders.length>0 && res.folders[0])
                vm.tree = res.folders;
                vm.isLoading = true;
            }, function (err) {
                vm.isLoading = true;
            });
        }

        function volatileInformation(obj, flag) {
            if (vm.filter1.state != 'all') {
                obj.state = [];
                obj.state.push(vm.filter1.state);
            }
            ScheduleService.get(obj).then(function (res) {
                if (vm.schedules.length > 0) {
                    angular.forEach(vm.schedules, function (schedule) {
                        angular.forEach(res.schedules, function (scheduleData) {
                            if (schedule.name == scheduleData.name) {
                                schedule = angular.merge(schedule, scheduleData);
                            }
                        });
                    });
                } else {
                    vm.schedules = res.schedules;
                }
                if (flag) {
                    startTraverseTree();
                }
            }, function () {
                if (flag) {
                    startTraverseTree();
                }
            });
        }


        /**
         * Expand all tree data
         */
        vm.expandAll = function () {
            vm.branchs = [];
            vm.allSchedules = [];
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            ScheduleService.getSchedulesP(obj).then(function (result) {
                vm.schedules = result.schedules;

                volatileInformation(obj, true);
            }, function () {
                volatileInformation(obj, true);
                vm.isError = true;
            });

        };
        function startTraverseTree() {
            vm.branchs = [];
            vm.allSchedules = [];
            angular.forEach(vm.tree, function (value) {
                traverseTree(value);
            });
        }

        function traverseTree(data) {
            data.schedules = [];
            data.folders = orderBy(data.folders, 'name');
            angular.forEach(vm.schedules, function (value) {
                if (data.path == value.path.substring(0, value.path.lastIndexOf('/'))) {
                    data.schedules.push(value);
                    vm.allSchedules.push(value);
                }
            });
            if (data.schedules.length > 0) {
                vm.branchs.push(data);
            }

            if (data.folders.length > 0) {
                angular.forEach(data.folders, function (value) {
                    traverseTree(value);
                });
            }
        }

        function expandFolderData(data) {
            vm.loading = true;
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.folders = [{folder: data.path, recursive: false}];
            ScheduleService.getSchedulesP(obj).then(function (result) {
                data.schedules = result.schedules;
                vm.loading = false;
                volatileFolderData(data, obj);
            }, function (err) {
                vm.loading = false;
                volatileFolderData(data, obj);
            });
        }

        function volatileFolderData(data, obj) {
            if (vm.filter1.state != 'all') {
                obj.state = [];
                obj.state.push(vm.filter1.state);
            }
            ScheduleService.get(obj).then(function (res) {
                if (data.schedules.length > 0) {
                    angular.forEach(data.schedules, function (schedule) {
                        angular.forEach(res.schedules, function (scheduleData) {
                            if (schedule.name == scheduleData.name) {
                                schedule = angular.merge(schedule, scheduleData);
                            }
                        });
                    });
                } else {
                    data.schedules = res.schedules;
                }

                if (data.schedules.length > 0) {
                    data.schedules = orderBy(data.schedules, vm.filter.sortBy);
                    vm.branchs.push(data);
                }
                angular.forEach(data.schedules, function (value) {
                    vm.allSchedules.push(value);
                });
            }, function () {
                if (data.schedules.length > 0) {
                    data.schedules = orderBy(data.schedules, vm.filter.sortBy);
                    vm.branchs.push(data);
                }
                angular.forEach(data.schedules, function (value) {
                    vm.allSchedules.push(value);
                });
            });
        }

        vm.treeHandler = function (data) {
            data.expanded = !data.expanded;
            if (data.expanded) {
                if (!data.schedules || data.schedules.length == 0)
                    expandFolderData(data);
                vm.branchs = [];
                vm.allSchedules = [];
                vm.branchs.push(data);
                angular.forEach(data.schedules, function (value) {
                    vm.allSchedules.push(value);
                });
            }
        };

        vm.treeHandler1 = function (data) {
            data.folders = orderBy(data.folders, 'name');
            data.schedules = [];
            vm.branchs = [];
            vm.allSchedules = [];
            expandFolderData(data);
        };

        vm.expandNode = function (data) {
            vm.branchs = [];
            vm.allSchedules = [];
            function recursive(data) {
                data.expanded = !0;
                data.folders = orderBy(data.folders, 'name');

                data.schedules = [];
                expandFolderData(data);
                angular.forEach(data.folders, function (a) {
                    a.expanded = !0;

                    a.schedules = [];
                    expandFolderData(data);

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


        function checkExpand(data) {
            data.schedules = [];
            expandFolderData(data);
            if (data.schedules.length > 0) {
                vm.branchs.push(data);
            }
            angular.forEach(data.schedules, function (value) {
                vm.allSchedules.push(value);
            });
            angular.forEach(data.folders, function (value) {
                if (value.expanded)
                    checkExpand(value);
            });

        }


        function checkExpandTreeForUpdates(data) {

            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;

            obj.folders = [{folder: data.path, recursive: false}];

            if (data.schedules.length > 0)
                volatileFolderData(data, obj);

            angular.forEach(data.folders, function (value) {
                if (value.expanded)
                    checkExpandTreeForUpdates(value);
            });
        }

        function filteredVolatileTreeData() {
            angular.forEach(vm.tree, function (value) {
                if (value.expanded)
                    checkExpandTreeForUpdates(value);
            });
        }


        /** -----------------End Schedules------------------- */


        $scope.$on('$stateChangeSuccess', function (event, toState, toParams) {
            vm.state = '';

            if (toState.name == 'app.resources.agentClusters') {
                vm.state = 'agent';
                if (toParams.type)
                    vm.filter.state = toParams.type == 'healthy' ? '0' : toParams.type == 'unhealthy' ? '1' : '2';

                if (!vm.agentClusters) {
                    vm.loadAgents();
                }

            } else if (toState.name == 'app.resources.locks') {
                vm.state = 'lock';
                if (vm.treeLock.length == 0)
                    initLockTree();
            } else if (toState.name == 'app.resources.processClasses') {
                vm.state = 'processClass';
                if (vm.treeProcess.length == 0)
                    initProccessTree();
            } else {
                vm.state = 'schedules';
                if (vm.tree.length == 0)
                    initTree();
            }
            startPolling();
        });


        var interval1, interval2, interval3, interval4;

        function poll1() {
            interval1 = $interval(function () {
                loadAgentsV();
            }, $rootScope.config.agentCluster.interval * 1000)
        }

        function poll2() {
            interval2 = $interval(function () {
                filteredVolatileTreeDataL();
            }, $rootScope.config.locks.interval * 1000)
        }

        function poll3() {
            interval3 = $interval(function () {
                filteredVolatileTreeDataP();
            }, $rootScope.config.processClass.interval * 1000)
        }

        function poll4() {
            interval4 = $interval(function () {
                filteredVolatileTreeData();
            }, $rootScope.config.schedules.interval * 1000)
        }

        function startPolling() {
            $interval.cancel(interval1);
            $interval.cancel(interval2);
            $interval.cancel(interval3);
            $interval.cancel(interval4);
            if (vm.state == 'agent') {
                if ($rootScope.config.agentCluster.polling == 'true')
                    poll1();
            } else if (vm.state == 'lock') {
                if ($rootScope.config.locks.polling == 'true')
                    poll2();
            } else if (vm.state == 'processClass') {
                if ($rootScope.config.processClass.polling == 'true')
                    poll3();
            } else {
                if ($rootScope.config.schedules.polling == 'true')
                    poll4();
            }
        }

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
            watcher1();
            watcher2();
            watcher3();
            $interval.cancel(interval1);
            $interval.cancel(interval2);
            $interval.cancel(interval3);
            $interval.cancel(interval4);

        });
    }


    ScheduleOrderCtrl.$inject = ["$scope", "$rootScope", "ScheduleService", "$stateParams", "$location", "OrderService", "$uibModal", "orderByFilter"];
    function ScheduleOrderCtrl($scope, $rootScope, ScheduleService, $stateParams, $location, OrderService, $uibModal, orderBy) {
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

        function loadOrderV(){
            OrderService.get({
                    jobschedulerId: $scope.schedulerIds.selected,
                    orders: orders,
                    compact: true
                }).then(function (res) {
                    vm.orders = angular.merge(res.orders, vm.orders);
                });
        }

        vm.orders = [];
        function loadOrders(orders) {
            OrderService.getOrdersP({
                jobschedulerId: $scope.schedulerIds.selected,
                compact: true,
                orders: orders
            }).then(function (result) {
                vm.orders = result.orders;
                vm.isLoading = true;
               loadOrderV();
            }, function () {
                vm.isLoading = true;
               loadOrderV();
            });
        }

        vm.showPanel = '';
        vm.showPanelFuc = function (value) {
            vm.showPanel = value;
            vm.hidePanel = true;
        };
        vm.hidePanelFuc = function () {
            vm.showPanel = '';
            vm.hidePanel = !vm.hidePanel;
        };
        function loadScheduleV() {
            ScheduleService.getSchedule(vm.path, $scope.schedulerIds.selected).then(function (res) {
                vm.schedule = angular.merge(vm.schedule, res.schedule);
                if (vm.schedule.usedByOrders && vm.schedule.usedByOrders.length > 0)
                    loadOrders(vm.schedule.usedByOrders);
            });
        }

        ScheduleService.getScheduleP(vm.path, $scope.schedulerIds.selected).then(function (result) {
            vm.schedule = result.schedule;
            vm.isLoading = true;
            loadScheduleV();
            if(vm.schedule.usedByOrders && vm.schedule.usedByOrders.length>0)
            loadOrders(vm.schedule.usedByOrders);
        }, function () {
            vm.isLoading = true;
            loadScheduleV();
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

    DashboardCtrl.$inject = ['$scope', 'OrderService', 'JobSchedulerService', '$interval', '$state', '$uibModal', 'DailyPlanService', 'moment', '$rootScope','$q'];
    function DashboardCtrl($scope, OrderService, JobSchedulerService, $interval, $state, $uibModal, DailyPlanService, moment, $rootScope,$q) {
        var vm = $scope;
        var bgColorArray = [];


        function groupBy(data) {
            var results = [];
            if (!(data)) return;

            angular.forEach(data, function (value) {
                var result = {};

                result.numOfAgents = value.numOfAgents.any;
                if (value.state._text == "ALL_AGENTS_ARE_RUNNING") {

                    result._text = "label.healthyAgentCluster";
                } else if (value.state._text.toLowerCase() == "all_agents_are_unreachable") {
                    result._text = "label.unreachableAgentCluster";
                } else {
                    result._text = "label.unhealthyAgentCluster";
                }

                if (results.length > 0) {
                    for (var i = 0; i < results.length; i++) {
                        if (results[i]._text == result._text) {
                            result.numOfAgents = results[i].numOfAgents + value.numOfAgents.any;
                            results.splice(i, 1);
                            break;
                        }
                    }
                }
                results.push(result);

            });
            return results;
        }

        function getAgentClusterV() {

            JobSchedulerService.getAgentCluster({
                jobschedulerId: $scope.schedulerIds.selected
            }).then(function (res) {
           /*     if(vm.agentClusters && vm.agentClusters.length>0) {
                    angular.forEach(vm.agentClusters, function (data) {
                        angular.forEach(res.agentClusters, function (data1) {
                            if (data1.path == '/' + data.path + '/' + data.name) {
                                data = angular.merge(data, data1);
                            }
                        });
                    });
                }else{*/
                    vm.agentClusters=res.agentClusters;


                prepareAgentClusterData(vm.agentClusters);
            });
        }

        vm.getAgentCluster = function () {
/*            JobSchedulerService.getAgentClusterP({
                jobschedulerId: $scope.schedulerIds.selected
            }).then(function (result) {
                vm.agentClusters = result.agentClusters;
                prepareAgentClusterData(vm.agentClusters);
                getAgentClusterV();
            }, function (err) {
                getAgentClusterV();
            });*/
            getAgentClusterV();
        };

        function prepareAgentClusterData(result) {
            var agentArray = [];
            var agentArray1 = [];
            vm.YAxisDomain = [0, 3];
            //vm.YAxisDomain[0] = 0;

            angular.forEach(result, function (value) {
                var numTask = 0;
                angular.forEach(value.agents, function (value1) {
                    if (value1.runningTasks)
                        numTask = numTask + value1.runningTasks;
                });
                agentArray.push([value.path.substring(value.path.lastIndexOf('/') + 1), numTask]);
            });
            angular.forEach(groupBy(result), function (value) {

                if (value._text == "label.healthyAgentCluster") {
                    bgColorArray.push('#7ab97a');
                } else if (value._text == "label.unreachableAgentCluster") {
                    bgColorArray.push('#e86680');
                } else {
                    bgColorArray.push('rgba(255, 195, 0, 0.9)');
                }
                agentArray1.push({
                    key: value._text,
                    y: value.numOfAgents
                });
            });

            vm.agentClusterData = agentArray1;

            vm.agentStatusChart = [
                {
                    "key": "Agents",
                    "values": agentArray
                }
            ];
        }


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

        vm.yAxisTickFormatFunction = function () {
            return function (d) {
                return d3.format(',f')(d);
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


        prepareClusterStatusData();
        var clusterStatusData = {};

        function prepareClusterStatusData() {
            clusterStatusData = {};
            getDatabase().then(function (res) {
                clusterStatusData.database = res;
                getClusterMembersP().then(function (res) {
                    clusterStatusData.members = res;
                    vm.clusterStatusData = clusterStatusData;
                      $rootScope.$broadcast('reloadScheduleDetail', vm.clusterStatusData.members);
                });
            });
        }


        vm.getSupervisor = getSupervisorDetails;
        function getSupervisorDetails() {

            return JobSchedulerService.getSupervisorP({jobschedulerId: $scope.schedulerIds.selected});
        }

        function getClusterMembersP() {
            return JobSchedulerService.getClusterMembersP({jobschedulerId: $scope.schedulerIds.selected});
        }

        vm.getClusterMembers = getClusterMembers;
        function getClusterMembers(refresh) {
            return JobSchedulerService.getClusterMembers({jobschedulerId: $scope.schedulerIds.selected},refresh);
        }
        function getDatabase() {

            return JobSchedulerService.getDatabase({jobschedulerId: $scope.schedulerIds.selected});
        }


        vm.loadOrderSnapshot = function () {
            OrderService.getSnapshot({jobschedulerId: $scope.schedulerIds.selected}).then(function (res) {
                vm.snapshot = res.orders;
            });
        };


        $scope.$on('elementClick.directive', function (angularEvent, event) {
            var key = '';
            if (event.label) {
                if (event.label == "label.healthyAgentCluster") {
                    key = 'healthy';
                } else if (event.label == "label.unhealthyAgentCluster") {
                    key = 'unhealthy';
                } else {
                    key = 'unreachable';
                }
            } else {
                angular.forEach(vm.agentClusters, function (value) {
                    if (event.point[0] == value.path.substring(value.path.lastIndexOf('/') + 1)) {

                        if (value.state._text.toLowerCase() == "label.healthyAgentCluster") {
                            key = 'healthy';
                        } else if (value.state._text.toLowerCase() == "label.unhealthyAgentCluster") {
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
            $state.go('app.resources.agentClusters');
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
                    JobSchedulerService.restart(host, port, $scope.schedulerIds.selected).then(function (res) {
                        success('running', host, port);
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
        };

        vm.criterion = {};
        vm.criterion.timeout = 60;
        vm.getTimeout = function (host, port) {

            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/get-timeout-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                JobSchedulerService.restartWithin(host, port, $scope.schedulerIds.selected, vm.criterion.timeout).then(function (res) {
                    success('running', host, port);
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
            var obj = {};
            obj.jobschedulerId = $scope.schedulerIds.selected;
            if (vm.filter.range == "today") {
                obj.dateFrom = new Date();
            } else {
                obj.dateFrom = '24h';
            }
            DailyPlanService.getPlans(obj).then(function (res) {
                vm.planItemData = res.planItems;
                filterData();
            }, function (err) {

            })
        }

        function filterData() {
            vm.waiting = 0;
            vm.late = 0;
            vm.lateSuccess = 0;
            vm.lateError = 0;
            vm.executed = 0;
            vm.error = 0;

            if (!vm.planItemData) {
                return;
            }

            vm.totalPlanData = vm.planItemData.length;
            angular.forEach(vm.planItemData, function (value) {
                var time;
                if (!value.startTime) {
                    time = moment(value.plannedStartTime).diff(moment(new Date()));
                    if (time < 0) {
                        vm.late++;
                    } else {
                        vm.waiting++;
                    }
                } else if (value.state._text == 'SUCCESSFUL' && value.startTime) {
                    time = moment(value.plannedStartTime).diff(moment(value.startTime));
                    if (time == 0) {
                        vm.executed++;
                    } else {
                        vm.lateSuccess++;
                    }
                } else {
                    time = moment(value.plannedStartTime).diff(moment(value.startTime));
                    if (time == 0) {
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
            return (status / vm.totalPlanData) * 100;
        }


        startPolling();

        function startPolling() {

            if ($rootScope.config.agentClusterStatus.polling == 'true') {
                poll1();
            }
            if ($rootScope.config.orderOverviewWidget.polling == 'true') {
                poll2();
            }
            if ($rootScope.config.dailyPlanWidget.polling == 'true') {
                poll3();
            }
        }

        var interval1, interval2, interval3;

        function poll1() {
            interval1 = $interval(function () {
                vm.getAgentCluster();

            }, $rootScope.config.agentClusterStatus.interval * 1000)
        }

        function poll2() {
            interval2 = $interval(function () {
                vm.loadOrderSnapshot();
            }, $rootScope.config.orderOverviewWidget.interval * 1000)
        }

        function poll3() {
            interval3 = $interval(function () {
                getDailyPlans();
            }, $rootScope.config.dailyPlanWidget.interval * 1000)
        }

        $scope.$on('$destroy', function () {
            $interval.cancel(interval1);
            $interval.cancel(interval2);
            $interval.cancel(interval3);

        });


    }


    DailyPlanCtrl.$inject = ['$scope', '$timeout', 'gettextCatalog', 'moment', 'orderByFilter', '$uibModal', 'SavedFilter', 'toasty', 'OrderService', 'DailyPlanService', '$interval', '$rootScope', 'JobChainService'];
    function DailyPlanCtrl($scope, $timeout, gettextCatalog, moment, orderBy, $uibModal, SavedFilter, toasty, OrderService, DailyPlanService, $interval, $rootScope, JobChainService) {

        var vm = $scope;

        vm.todayDate = new Date();
        vm.pageSize = 10;
        vm.currentPage = 1;

        vm.filter = {};
        vm.filter.range = "today";
        vm.filter.sortBy = "name";
        vm.filter.status = 'ALL';
        vm.range = 'period';
        vm.showPanel = '';
        vm.showLogPanel = undefined;
        vm.object = {};
        vm.tree = [];
        var selectedFiltered;
        var promise1;


        vm.savedDailyPlanFilter = JSON.parse(SavedFilter.dailyPlanFilters) || {};
        vm.savedDailyPlanFilter.list = vm.savedDailyPlanFilter.list || [];
        vm.savedDailyPlanFilter.selected = vm.savedDailyPlanFilter.favorite;

        if (vm.savedDailyPlanFilter.selected) {
            angular.forEach(vm.savedDailyPlanFilter.list, function (value) {
                if (value.name == vm.savedDailyPlanFilter.selected) {
                    selectedFiltered = value;
                }
            });
        }

        vm.savedIgnoreList = JSON.parse(SavedFilter.ignoreList) || {};
        vm.savedIgnoreList.dailyPlans = vm.savedIgnoreList.dailyPlans || [];
        vm.savedIgnoreList.isEnable = vm.savedIgnoreList.isEnable || false;

        var watcher = $scope.$watch('pageView', function (newName) {
            if (newName) {
                vm.pageView = newName;
            }
        });

        function setDateRange(range) {
            var from = new Date();
            var to = new Date();
            if (range == 'today' || !range) {
               // from.setHours(0);
               // from.setMinutes(0);
               // from.setSeconds(0);
                to.setDate(to.getDate() + 1);
               // to.setHours(0);
               // to.setMinutes(0);
               // to.setSeconds(0);
            } else if (range == 'next-24-hours') {
              /*  to.setDate(to.getDate() + 1);
                to.setHours(0);
                to.setMinutes(0);
                to.setSeconds(0);

                to.setHours(to.getHours() + 24);*/
              from.setDate(from.getDate() + 1);
              //   from.setHours(0);
              //  from.setMinutes(0);
              //  from.setSeconds(0);
                to.setDate(to.getDate() +2);
             //   to.setHours(0);
              //  to.setMinutes(0);
              //  to.setSeconds(0);



                // console.info("setDateRange::"+to);
            }

            vm.filter.from = from;
            vm.filter.to = to;
        }

        setDateRange();

        vm.getPlans = function () {
            if (vm.range != 'period') {
                vm.filter.range = undefined;
            }

            if(vm.filter.range == 'next-24-hours'){
                setDateRange(vm.filter.range);
            }
             if(vm.filter.range == 'today'){
                setDateRange(vm.filter.range);
            }
            vm.load();
        };


        vm.exportToExcel = function () {
            $('#exportToExcelBtn').attr("disabled", true);

            $('#dailyPlanTableId').table2excel({
                exclude: ".noExl",
                filename: "jobscheduler-jobchain",
                fileext: ".xlsx",
                exclude_img: false,
                exclude_links: false,
                exclude_inputs: false
            });

            $('#exportToExcelBtn').attr("disabled", false);
        };


        vm.options = {
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
                'model.orderId': '{{getHeader()}}',
                'model.status': '{{getHeader()}}'
            },
            autoExpand: 'none',
            taskOutOfRange: 'truncate',
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
                api.core.on.ready(vm, function () {
                    vm.load();
                });
            }
        };

        vm.canAutoWidth = function (scale) {
            if (scale.match(/.*?hour.*?/) || scale.match(/.*?minute.*?/)) {
                return false;
            }
            return true;
        };

        vm.getColumnWidth = function (widthEnabled, scale, zoom) {
            if (!widthEnabled && vm.canAutoWidth(scale)) {
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

        function applySavedFilter(obj) {

            if (selectedFiltered) {

                if (selectedFiltered.regex)
                    obj.regex = selectedFiltered.regex;

                if (selectedFiltered.state && selectedFiltered.state.length>0) {
                    obj.state =[];
                    if (selectedFiltered.state.indexOf('WAITING') !== -1) {
                        obj.state.push("PLANNED");
                    } else if (selectedFiltered.state.indexOf('EXECUTED') !== -1) {
                         obj.state.push("SUCCESSFUL");
                         obj.state.push("FAILED");
                    }
                    if (selectedFiltered.state.indexOf('LATE') !== -1) {
                        obj.late =true;
                    }

                }

                var fromDate;
                var toDate;

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
                        var time = /^\s*(\d+):(\d+)\s*(am|pm)\s*to\s*(\d+):(\d+)\s*(am|pm)\s*$/i.exec(selectedFiltered.planned)
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
                   obj.dateFrom= fromDate;
                   obj.dateTo= toDate;
                }
            }
            return obj;

        }

        function prepareGanttData(data2) {

            var minNextStartTime;
            var maxEndTime;
            var orders = [];
            data2 = orderBy(data2, 'plannedStartTime', false);
            angular.forEach(data2, function (order, index) {
                orders[index] = {};
                orders[index].tasks = [];
                orders[index].tasks[0] = {};
                if (order.job!=undefined ) {
                    orders[index].name = order.job;
                    orders[index].orderId = '-';
                } else {
                   // orders[index].name = order.jobChain.substring(order.jobChain.lastIndexOf('/') + 1, order.jobChain.length);
                    orders[index].name = order.jobChain.substring(order.jobChain);
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
                if (!maxEndTime || maxEndTime < new Date(order.expectedEndTime)) {
                    maxEndTime = new Date(order.expectedEndTime);
                }
                orders[index].tasks[0].to = new Date(order.expectedEndTime);

            });

            if (minNextStartTime) {
                minNextStartTime.setMinutes(0);
                minNextStartTime.setHours(0);
                vm.options.fromDate = minNextStartTime;
                var to = new Date(minNextStartTime);
                to.setHours(23);
                if (maxEndTime > to) {
                    vm.options.toDate = maxEndTime;
                } else {
                    vm.options.toDate = to;
                }
            }

            vm.data = orderBy(orders, 'plannedStartTime');

            promise1 = $timeout(function () {
                $('#div').animate({
                    scrollLeft: $("#gantt-current-date-line").offset().left
                }, 500);
            }, 4000);
        }

        vm.load = function () {
            var obj = {};
            obj.jobschedulerId= vm.schedulerIds.selected;
            obj.dateFrom= vm.filter.from;
            obj.dateTo= vm.filter.to;

            if(vm.filter.status !='ALL') {
                obj.state = [];
                if (vm.filter.status == 'WAITING') {
                    obj.state.push("PLANNED");
                } else if (vm.filter.status == 'EXECUTED') {
                    obj.state.push("SUCCESSFUL");
                    obj.state.push("FAILED");
                }
                if (vm.filter.status == 'LATE'){
                    obj.late = true;
                }
            }

            obj = applySavedFilter(obj);

            DailyPlanService.getPlans(obj).then(function (res) {
                vm.plans = res.planItems;

                if(vm.pageView=='grid')
                prepareGanttData(vm.plans);
                vm.isLoading = true;
            }, function (err) {
                 vm.isLoading = true;
            })
        };

         /**--------------- filter, sorting and pagination -------------------*/
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


        vm.applyFilter = function () {
            vm.dailyPlanFilter = {};
            vm.isUnique = true;
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/daily-plan-filter-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                backdrop: 'static'
            });
            modalInstance.result.then(function () {

                vm.savedDailyPlanFilter.list.push(vm.dailyPlanFilter);

                if (vm.savedDailyPlanFilter.list.length == 1) {
                    vm.savedDailyPlanFilter.selected = vm.dailyPlanFilter.name;
                    vm.savedDailyPlanFilter.favorite = vm.dailyPlanFilter.name;
                    vm.load();
                }
                SavedFilter.setDailyPlan(vm.savedDailyPlanFilter);
                SavedFilter.save();

            }, function () {

            });
        };

        vm.editFilters = function () {
            vm.filters = vm.savedDailyPlanFilter;
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/edit-filter-dialog.html',
                controller: 'DialogCtrl',
                scope: vm
            });
        };

        vm.editFilter = function (filter) {
            vm.filterName = filter.name;
            vm.dailyPlanFilter = angular.copy(filter);
            vm.paths = vm.dailyPlanFilter.paths;
            vm.object.paths = vm.paths;
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

                if (vm.savedDailyPlanFilter.selected == vm.filterName) {
                    vm.savedDailyPlanFilter.selected = vm.dailyPlanFilter.name;
                    selectedFiltered = vm.dailyPlanFilter;
                    vm.load();
                }
                if (vm.savedDailyPlanFilter.favorite == vm.filterName) {
                    vm.savedDailyPlanFilter.favorite = vm.dailyPlanFilter.name;
                }


                SavedFilter.setDailyPlan(vm.savedDailyPlanFilter);
                SavedFilter.save();
                vm.filterName = undefined;
            }, function () {
                vm.filterName = undefined;
            });
        };

        vm.deleteFilter = function () {
            angular.forEach(vm.savedDailyPlanFilter.list, function (value, index) {
                if (value.name == vm.dailyPlanFilter.name) {
                    toasty.success({
                        title: value.name + ' ' + gettextCatalog.getString('message.filterDeleteSuccessfully'),
                        msg: ''
                    });
                    vm.savedDailyPlanFilter.list.splice(index, 1);
                }
            });
            if (vm.savedDailyPlanFilter.list.length == 0) {
                vm.savedDailyPlanFilter = {};
                selectedFiltered = undefined;
            } else if (vm.savedDailyPlanFilter.selected == vm.dailyPlanFilter.name) {
                vm.savedDailyPlanFilter.selected = undefined;
                selectedFiltered = undefined;
                vm.load();
            }
            SavedFilter.setDailyPlan(vm.savedDailyPlanFilter);
            SavedFilter.save();
        };

        vm.favorite = function (filter) {
            vm.savedDailyPlanFilter.favorite = filter;
            vm.savedDailyPlanFilter.selected = filter;
            selectedFiltered = undefined;
            SavedFilter.setDailyPlan(vm.savedDailyPlanFilter);
            SavedFilter.save();
            vm.load();
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
            if (filter)
                vm.savedDailyPlanFilter.selected = filter.name;
            else
                vm.savedDailyPlanFilter.selected = filter;
            selectedFiltered = filter;
            SavedFilter.setDailyPlan(vm.savedDailyPlanFilter);
            SavedFilter.save();
            vm.load();
        };

        vm.validPlanned = true;
        vm.checkPlanned = function () {
            vm.validPlanned = true;
            if (!vm.dailyPlanFilter.planned || /^\s*$/i.test(vm.dailyPlanFilter.planned) || /^\s*(now\s*\+)\s*(\d+)\s*$/i.test(vm.dailyPlanFilter.planned) || /^\s*(now)\s*$/i.test(vm.dailyPlanFilter.planned) || /^\s*(Today)\s*$/i.test(vm.dailyPlanFilter.planned)
                || /^\s*(\d+):(\d+)\s*(am|pm)\s*to\s*(\d+):(\d+)\s*(am|pm)\s*$/i.test(vm.dailyPlanFilter.planned)) {
            } else {
                vm.validPlanned = false;
            }
        };

        vm.filter_tree = {};
         vm.object.paths = [];
        vm.expanding_property = {
            field: "name"
        };
        vm.getTreeStructure = function () {

            $('#treeModal').modal('show');
            JobChainService.tree({
                jobschedulerId: vm.schedulerIds.selected,
                compact: true
            }).then(function (res) {
                vm.tree = res.folders;
            }, function (err) {

            });
        };


        vm.treeExpand = function (data) {
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


        var watcher = $scope.$watchCollection('object.paths', function (newNames) {
            if (newNames && newNames.length > 0) {
                vm.paths = newNames;
            }
        });

        vm.addJobChainPaths = function () {
            vm.dailyPlanFilter.paths = vm.paths;
        };


        startPolling();

        function startPolling() {
            if ($rootScope.config.dailyPlan.polling == 'true') {
                poll();
            }
        }

        var interval;

        function poll() {
            interval = $interval(function () {
                vm.load();
            }, $rootScope.config.dailyPlan.interval * 1000)

        }

        $scope.$on('$destroy', function () {
            if (interval)
                $interval.cancel(interval);
            if (promise1)
                $timeout.cancel(promise1);
            watcher();

        });


    }
})();
