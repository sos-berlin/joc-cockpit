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
        vm.propertyNameA = "name";
        vm.propertyNameL = "name";
        vm.propertyNameS = "name";
        vm.propertyNameP = "name";
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
        vm.sortByA = function (propertyName) {
            vm.reverseA = !vm.reverseA;
            vm.propertyNameA = propertyName;
            vm.tree_data = orderBy(vm.tree_data, vm.propertyNameA, vm.reverseA);

        };
        vm.sortByP = function (propertyName) {
            vm.reverseP = !vm.reverseP;
            vm.propertyNameP = propertyName;
            vm.allProcessClasses = orderBy(vm.allProcessClasses, vm.propertyNameP, vm.reverseP);

        };
        vm.sortByS = function (propertyName) {
            vm.object.schedules = [];
            vm.reverseS = !vm.reverseS;
            vm.propertyNameS = propertyName;
            vm.allSchedules = orderBy(vm.allSchedules, vm.propertyNameS, vm.reverseS);

        };
        vm.sortByL = function (propertyName) {
            vm.reverseL = !vm.reverseL;
            vm.propertyNameL = propertyName;
            vm.allLocks = orderBy(vm.allLocks, vm.propertyNameL, vm.reverseL);
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
                sortable: true,
                cellTemplate: "<a target='_blank' href='{{row.branch[col.field]}}'>{{row.branch[col.field]}}</a>"
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
            loadAgentsV();
        };

        function loadAgentsV() {
            var obj = {};
            obj.jobschedulerId = $scope.schedulerIds.selected;

            if (vm.filter.state != 'all') {
                obj.state = vm.filter.state == '0' ? 0 : vm.filter.state == '1' ? 1 : 2;
            }

            JobSchedulerService.getAgentCluster(obj).then(function (result) {
                vm.isLoading = true;
                vm.agentClusters = result.agentClusters;
                vm.tree_data = prepareDataForTree(vm.agentClusters);
            }, function () {
                vm.isLoading = true;
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
                filteredTreeDataL();
                vm.isLoading = true;
            }, function (err) {
                vm.isLoading = true;
            });
        }

        function filteredTreeDataL() {
            vm.folderPathL = '/';
            angular.forEach(vm.treeLock, function (value) {
                value.expanded = true;
                if (value.expanded) {
                    vm.branchsL = [];
                    vm.allLocks = [];
                    checkExpandL(value);
                }

            });
        }

        function volatileInformationL(obj, expandNode) {
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
                if (expandNode) {
                    startTraverseNodeL(expandNode);
                }
            }, function () {
                if (expandNode) {
                    startTraverseNodeL(expandNode);
                }
            });
        }


        vm.expandNodeL = function (data) {
            vm.branchsL = [];
            vm.allLocks = [];
            var obj = {};
            vm.loading = true;
            vm.folderPathL = data.name;
            obj.jobschedulerId = vm.schedulerIds.selected;
            ResourceService.getLocksP(obj).then(function (result) {
                vm.locks = result.locks;
                volatileInformationL(obj, data);
            }, function () {
                volatileInformationL(obj,  data);
                vm.loading = false;
            });
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

        function startTraverseNodeL(data) {
            vm.branchsL = [];
            vm.allLocks = [];
            function recursive(data) {
                data.expanded = !0;
                data.folders = orderBy(data.folders, 'name');
                vm.folderPathL = data.name;

                data.locks = [];
                angular.forEach(vm.locks, function (value) {
                    if (data.path == value.path.substring(0, value.path.lastIndexOf('/')) || data.path == value.path.substring(0, value.path.lastIndexOf('/') + 1)) {
                        data.locks.push(value);
                        vm.allLocks.push(value);
                    }
                });

                if (data.locks.length > 0) {
                    vm.branchsL.push(data);
                    data.selected1 = true;
                }
                angular.forEach(data.folders, function (a) {
                    recursive(a);
                });
            }

            recursive(data);
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
                vm.loading = false;
            });
        }

        function volatileFolderDataL(data, obj) {
            ResourceService.get(obj).then(function (res) {
                vm.loading = false;
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
                    vm.branchsL.push(data);
                }
                vm.folderPathL = data.name;
                angular.forEach(data.locks, function (value) {
                    vm.allLocks.push(value);
                });
            }, function () {
                if (data.locks.length > 0) {
                    vm.branchsL.push(data);
                }
                vm.folderPathL = data.name;
                angular.forEach(data.locks, function (value) {
                    vm.allLocks.push(value);
                });
                vm.loading = false;
            });
        }

        vm.treeHandlerL = function (data) {
            navFullTreeL();
            data.selected1 = true;
            data.locks = [];
            vm.branchsL = [];
            vm.allLocks = [];
            vm.loading = true;
            expandFolderDataL(data);
        };

        vm.treeHandler1L = function (data) {
            if (data.expanded) {
                data.folders = orderBy(data.folders, 'name');
            }
        };

        function navFullTreeL() {
            angular.forEach(vm.treeLock, function (value) {
                value.selected1 = false;
                if (value.expanded) {
                    traverseTree(value);
                }
            });
        }

        function traverseTree(data) {
            angular.forEach(data.folders, function (value) {
                value.selected1 = false;
                if (value.expanded) {
                    traverseTree(value);
                }
            });
        }


        function checkExpandL(data) {
            if (data.selected1) {
                data.locks = [];
                expandFolderDataL(data);
                if (data.locks.length > 0) {
                    vm.branchsL.push(data);
                }
                vm.folderPathL = data.name;
                angular.forEach(data.locks, function (value) {
                    vm.allLocks.push(value);
                });
            }
            data.folders = orderBy(data.folders, 'name');
            angular.forEach(data.folders, function (value) {
                vm.folderPathL = data.name;
                if (value.expanded)
                    checkExpandL(value);
            });

        }

        function checkExpandTreeForUpdatesL(data) {
            if (data.selected1) {
                var obj = {};
                obj.jobschedulerId = vm.schedulerIds.selected;
                obj.folders = [{folder: data.path, recursive: false}];

                if (data.locks.length > 0) {
                    ResourceService.get(obj).then(function (res) {
                        vm.loading = false;
                        if (res.locks && res.locks.length > 0) {
                            angular.forEach(res.locks, function (locksData) {
                                //update card view
                                angular.forEach(data.locks, function (locks) {

                                    if (locks.path == locksData.path) {
                                        locks = angular.merge(locks, locksData);
                                    }
                                })
                                //update list view
                                angular.forEach(vm.allLocks, function (locks) {
                                    if (locks.path == locksData.path) {
                                        locks = angular.merge(locks, locksData);
                                    }
                                });
                            });
                        }

                    },function(){
                        vm.loading = false;
                    });
                }

            }
            data.folders = orderBy(data.folders, 'name');
            angular.forEach(data.folders, function (value) {
                if (value.expanded || value.selected1)
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
                filteredTreeDataP();
                vm.isLoading = true;
            }, function (err) {
                vm.isLoading = true;
            });
        }

        function filteredTreeDataP() {
            vm.folderPathP = '/';
            angular.forEach(vm.treeProcess, function (value) {
                value.expanded = true;
                vm.branchsP = [];
                vm.allProcessClasses = [];
                checkExpandP(value);
            });
        }

        function volatileInformationP(obj, expandNode) {
            ResourceService.getProcessClass(obj).then(function (res) {
                vm.loading = false;
                if (vm.processClasses.length > 0 && vm.processClasses.length == res.processClasses.length) {
                    angular.forEach(vm.processClasses, function (processClass) {
                        angular.forEach(res.processClasses, function (processClassData) {
                            if (processClass.path == processClassData.path || processClassData.name == 'multi' || processClassData.name == '(default)' || processClassData.name == 'single') {
                                processClass = angular.merge(processClass, processClassData);
                            }
                        });
                    });
                } else {
                    vm.processClasses = res.processClasses;
                }

                if (expandNode) {
                    startTraverseNodeP(expandNode);
                }
            }, function () {
                vm.loading = false;
                if (expandNode) {
                    startTraverseNodeP(expandNode);
                }
            });
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
                vm.loading = false;
            });
        }

        function volatileFolderDataP(data, obj) {
            ResourceService.getProcessClass(obj).then(function (res) {
                 vm.loading = false;
                if (data.processClasses.length > 0 && data.processClasses.length == res.processClasses.length) {
                    angular.forEach(data.processClasses, function (processClass) {
                        angular.forEach(res.processClasses, function (processClassData) {
                            if (processClass.path == processClassData.path || processClassData.name == 'multi' || processClassData.name == '(default)' || processClassData.name == 'single') {
                                processClass = angular.merge(processClass, processClassData);
                                console.log(processClassData);
                            }
                        });
                    });
                } else {
                    data.processClasses = res.processClasses;
                }
                if (data.processClasses.length > 0) {
                    vm.branchsP.push(data);
                }

                vm.folderPathP = data.name;

                angular.forEach(data.processClasses, function (value) {
                    vm.allProcessClasses.push(value);
                });
            }, function () {
                 vm.loading = false;
                if (data.processClasses.length > 0) {
                    vm.branchsP.push(data);
                }

                vm.folderPathP = data.name;

                angular.forEach(data.processClasses, function (value) {
                    vm.allProcessClasses.push(value);
                });
            });
        }

        vm.treeHandler1P = function (data) {
            if (data.expanded) {
                data.folders = orderBy(data.folders, 'name');
            }
        };

        vm.treeHandlerP = function (data) {
            navFullTreeP();
            data.selected1 = true;
            data.processClasses = [];
            vm.branchsP = [];
            vm.allProcessClasses = [];
            vm.loading = true;
            expandFolderDataP(data);
        };
        function navFullTreeP() {
            angular.forEach(vm.treeProcess, function (value) {
                value.selected1 = false;
                if (value.expanded) {
                    traverseTree(value);
                }
            });
        }

        vm.expandNodeP = function (data) {
            vm.branchsP = [];
            vm.allProcessClasses = [];
            vm.loading = true;
            vm.folderPathP = data.name;
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            ResourceService.getProcessClassP(obj).then(function (result) {
                vm.processClasses = result.processClasses;

                volatileInformationP(obj, data);
            }, function () {
                volatileInformationP(obj, data);
                vm.loading = false;
            });
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
        function startTraverseNodeP(data) {
            vm.branchsP = [];
            vm.allProcessClasses = [];
            function recursive(data) {
                data.expanded = !0;
                data.folders = orderBy(data.folders, 'name');
                 vm.folderPathP = data.name;

                data.processClasses = [];
                angular.forEach(vm.processClasses, function (value) {
                    if (data.path == value.path.substring(0, value.path.lastIndexOf('/'))) {
                        data.processClasses.push(value);
                        vm.allProcessClasses.push(value);
                    }
                });

                if (data.processClasses.length > 0) {
                    vm.branchsP.push(data);
                    data.selected1 = true;
                }
                angular.forEach(data.folders, function (a) {
                    recursive(a);
                });
            }

            recursive(data);
        }

        function checkExpandP(data) {
            data.processClasses = [];
            expandFolderDataP(data);
            if (data.processClasses.length > 0) {
                vm.branchsP.push(data);
            }
            vm.folderPathP = data.name;
            data.folders = orderBy(data.folders, 'name');
            angular.forEach(data.processClasses, function (value) {
                vm.allProcessClasses.push(value);
            });
            angular.forEach(data.folders, function (value) {
                vm.folderPathP = data.name;
                if (value.expanded)
                    checkExpandP(value);
            });

        }

        function checkExpandTreeForUpdatesP(data) {
             if (data.selected1) {
                 var obj = {};
                 obj.jobschedulerId = vm.schedulerIds.selected;
                 obj.folders = [{folder: data.path, recursive: false}];

                 if (data.processClasses.length > 0) {
                     ResourceService.getProcessClass(obj).then(function (res) {
                         if (res.processClasses && res.processClasses.length > 0) {
                             angular.forEach(res.processClasses, function (processClassData) {
                                 //update card view
                                 angular.forEach(data.processClasses, function (processClasses) {

                                     if (processClasses.path == processClassData.path) {
                                         processClasses = angular.merge(processClasses, processClassData);
                                     }
                                 });
                                 //update list view
                                 angular.forEach(vm.allProcessClasses, function (processClass) {
                                     if (processClass.path == processClassData.path) {
                                         processClass = angular.merge(processClass, processClassData);
                                     }
                                 });
                             });
                         }
                     });
                 }
             }

            data.folders = orderBy(data.folders, 'name');
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
                vm.object.schedules = vm.allSchedules.slice((vm.pageSize * (vm.currentPage - 1)), (vm.pageSize * vm.currentPage));
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
                if (res.folders && res.folders.length > 0 && res.folders[0])
                    vm.tree = res.folders;
                filteredTreeData();
                vm.isLoading = true;
            }, function (err) {
                vm.isLoading = true;
            });
        }

        function filteredTreeData() {
            vm.folderPathS = '/';
            angular.forEach(vm.tree, function (value) {
                value.expanded = true;
                if (value.expanded) {
                    vm.branchs = [];
                    vm.allSchedules = [];
                    checkExpand(value);
                }

            });
        }


        function volatileInformation(obj, expandNode) {
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

                if (expandNode) {
                    startTraverseNode(expandNode);
                }
            }, function () {

                if (expandNode) {
                    startTraverseNode(expandNode);
                }
            });
        }


        function expandFolderData(data) {
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
                vm.loading = false;
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

                    vm.branchs.push(data);
                }
                vm.folderPathS = data.name;

                angular.forEach(data.schedules, function (value) {
                    vm.allSchedules.push(value);
                });
            }, function () {
                vm.loading = false;
                if (data.schedules.length > 0) {
                    vm.branchs.push(data);
                }
                vm.folderPathS = data.name;

                angular.forEach(data.schedules, function (value) {
                    vm.allSchedules.push(value);
                });
            });
        }

        vm.treeHandler1 = function (data) {
            if (data.expanded) {
                data.folders = orderBy(data.folders, 'name');
            }
        };

        vm.treeHandler = function (data) {
            navFullTree();
            data.selected1 = true;
            data.folders = orderBy(data.folders, 'name');
            data.schedules = [];
            vm.branchs = [];
            vm.allSchedules = [];
            expandFolderData(data);
        };

        function navFullTree() {
            angular.forEach(vm.tree, function (value) {
                value.selected1 = false;
                if (value.expanded) {
                    traverseTree(value);
                }
            });
        }



        vm.expandNode = function (data) {
            vm.branchs = [];
            vm.allSchedules = [];
            vm.loading = true;
            vm.folderPathS = data.name;
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            ScheduleService.getSchedulesP(obj).then(function (result) {
                vm.schedules = result.schedules;

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
            vm.allSchedules = [];
            function recursive(data) {
                data.expanded = !0;
                data.folders = orderBy(data.folders, 'name');
                 vm.folderPathS = data.name;

                data.schedules = [];
                angular.forEach(vm.schedules, function (value) {
                    if (data.path == value.path.substring(0, value.path.lastIndexOf('/'))) {
                        data.schedules.push(value);
                        vm.allSchedules.push(value);
                    }
                });

                if (data.schedules.length > 0) {
                    vm.branchs.push(data);
                    data.selected1 = true;
                }
                angular.forEach(data.folders, function (a) {
                    recursive(a);
                });
            }

            recursive(data);
        }


        function checkExpand(data) {
            data.schedules = [];
            expandFolderData(data);
            if (data.schedules.length > 0) {
                vm.branchs.push(data);
            }
            vm.folderPathS = data.name;

            angular.forEach(data.schedules, function (value) {
                vm.allSchedules.push(value);
            });
            data.folders = orderBy(data.folders, 'name');
            angular.forEach(data.folders, function (value) {
                vm.folderPathS = data.name;
                if (value.expanded)
                    checkExpand(value);
            });

        }


        function checkExpandTreeForUpdates(data) {
            if (data.selected1) {
                var obj = {};
                obj.jobschedulerId = vm.schedulerIds.selected;

                obj.folders = [{folder: data.path, recursive: false}];

                if (data.schedules.length > 0) {
                    ScheduleService.get(obj).then(function (res) {
                        vm.loading = false;
                        if (res.schedules && res.schedules.length > 0) {
                            angular.forEach(res.schedules, function (scheduleData) {
                                //update card view
                                angular.forEach(data.schedules, function (schedules) {

                                    if (schedules.path == scheduleData.path) {
                                        schedules = angular.merge(schedules, scheduleData);
                                    }
                                })
                                //update list view
                                angular.forEach(vm.allSchedules, function (schedule) {
                                    if (schedule.path == scheduleData.path) {
                                        schedule = angular.merge(schedule, scheduleData);
                                    }
                                });
                            });
                        }
                    },function(){
                        vm.loading = false;
                    });
                }
            }

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
                else
                    filteredTreeDataL();
            } else if (toState.name == 'app.resources.processClasses') {
                vm.state = 'processClass';
                if (vm.treeProcess.length == 0)
                    initProccessTree();
                else
                    filteredTreeDataP();
            } else {
                vm.state = 'schedules';
                if (vm.tree.length == 0)
                    initTree();
                else
                    filteredTreeData();
            }

        });


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

        function loadOrderV(orders) {
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
                loadOrderV(orders);
            }, function () {
                vm.isLoading = true;
                loadOrderV(orders);
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
            if (vm.schedule.usedByOrders && vm.schedule.usedByOrders.length > 0)
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

    DashboardCtrl.$inject = ['$scope', 'OrderService', 'JobSchedulerService', '$interval', '$state', '$uibModal', 'DailyPlanService', 'moment', '$rootScope', '$q'];
    function DashboardCtrl($scope, OrderService, JobSchedulerService, $interval, $state, $uibModal, DailyPlanService, moment, $rootScope, $q) {
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


        vm.getAgentCluster = function () {
            JobSchedulerService.getAgentCluster({
                jobschedulerId: $scope.schedulerIds.selected
            }).then(function (res) {
                if (res.agentClusters) {
                    vm.agentClusters = res.agentClusters;
                    prepareAgentClusterData(vm.agentClusters);
                }
            });

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
            return JobSchedulerService.getClusterMembers({jobschedulerId: $scope.schedulerIds.selected}, refresh);
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
                /*  to.setDate(to.getDate() + 1);
                 to.setHours(0);
                 to.setMinutes(0);
                 to.setSeconds(0);

                 to.setHours(to.getHours() + 24);*/
                from.setDate(from.getDate() + 1);
                //   from.setHours(0);
                //  from.setMinutes(0);
                //  from.setSeconds(0);
                to.setDate(to.getDate() + 2);
                //   to.setHours(0);
                //  to.setMinutes(0);
                //  to.setSeconds(0);
                // console.info("setDateRange::"+to);
            }

            vm.filter.from = from;
            vm.filter.to = to;
        }


        vm.getDailyPlans = function () {
            var obj = {};
            obj.jobschedulerId = $scope.schedulerIds.selected;
            if (vm.filter.range == 'next-24-hours') {
                setDateRange(vm.filter.range);
            }
            if (vm.filter.range == 'today') {
                setDateRange(vm.filter.range);
            }
            if (vm.filter.range == "today") {
                obj.dateFrom = vm.filter.from;
                obj.dateTo = vm.filter.to;
            } else {
                obj.dateFrom = vm.filter.from;
                obj.dateTo = vm.filter.to;
            }
            DailyPlanService.getPlans(obj).then(function (res) {
                vm.planItemData = res.planItems;
                filterData();
            }, function (err) {

            })
        }

        vm.getDailyPlans();

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
    }

    DailyPlanCtrl.$inject = ['$scope', '$timeout', 'gettextCatalog', 'moment', 'orderByFilter', '$uibModal', 'SavedFilter', 'toasty', 'OrderService', 'DailyPlanService', '$interval', '$rootScope', 'JobChainService','$stateParams'];
    function DailyPlanCtrl($scope, $timeout, gettextCatalog, moment, orderBy, $uibModal, SavedFilter, toasty, OrderService, DailyPlanService, $interval, $rootScope, JobChainService,$stateParams) {

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
                vm.currentDateValue = new Date();
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
                to.setDate(to.getDate() + 2);
                //   to.setHours(0);
                //  to.setMinutes(0);
                //  to.setSeconds(0);


                // console.info("setDateRange::"+to);
                vm.currentDateValue = from;
            }

            vm.filter.from = from;
            vm.filter.to = to;
        }

        setDateRange();

        vm.getPlans = function () {
            if (vm.range != 'period') {
                vm.filter.range = undefined;
            }

            if (vm.filter.range == 'next-24-hours') {
                setDateRange(vm.filter.range);
            }
            if (vm.filter.range == 'today') {
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
                'model.name': gettextCatalog.getString('label.jobChain') + '/' + gettextCatalog.getString('label.job'),
                'model.orderId': gettextCatalog.getString('label.orderId')
                //'model.status': gettextCatalog.getString('label.status')
            },
            columnsClasses: {
                'model.name': 'gantt-column-name',
                'model.orderId': 'gantt-column-from'
                // 'model.status': 'gantt-column-to'
            },
            columnsHeaderContents: {
                'model.name': '{{getHeader()}}',
                'model.orderId': '{{getHeader()}}'
                // 'model.status': '{{getHeader()}}'
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

                if (selectedFiltered.state && selectedFiltered.state.length > 0) {
                    obj.state = [];
                    if (selectedFiltered.state.indexOf('WAITING') !== -1) {
                        obj.state.push("PLANNED");
                    } else if (selectedFiltered.state.indexOf('EXECUTED') !== -1) {
                        obj.state.push("SUCCESSFUL");
                        obj.state.push("FAILED");
                    }
                    if (selectedFiltered.state.indexOf('LATE') !== -1) {
                        obj.late = true;
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
                    obj.dateFrom = fromDate;
                    obj.dateTo = toDate;
                }
            }
            return obj;

        }

        function prepareGanttData(data2) {

            var minNextStartTime;
            var maxEndTime;
            var orders = [];
            $scope.ordersNoDuplicate = [];
            data2 = orderBy(data2, 'plannedStartTime', false);

            var groupJobChain = alasql('SELECT * FROM ?  GROUP BY jobChain', [data2]);
            angular.forEach(groupJobChain, function (order1, index) {
                var i = 0;
                orders[index] = {};
                orders[index].tasks = [];
                angular.forEach(data2, function (order, index1) {


                    if (order1.jobChain == order.jobChain) {

                        orders[index].tasks[i] = {};
                        if (order.job != undefined) {
                            orders[index].name = order.job;
                            orders[index].orderId = '-';
                        } else {
                            // orders[index].name = order.jobChain.substring(order.jobChain.lastIndexOf('/') + 1, order.jobChain.length);
                            orders[index].name = order.jobChain.substring(order.jobChain);
                            orders[index].orderId = order.orderId;
                        }

                        vm.plans[index].processedPlanned = orders[index].name;
                        orders[index].tasks[i].name = orders[index].name;
                        //orders[index].status = order.state._text;
                        vm.plans[index].status = order.state._text;
                        if (order.state._text == 'SUCCESSFUL') {
                            orders[index].tasks[i].color = "#7ab97a";
                        } else if (order.state._text == 'FAILED') {
                            orders[index].tasks[i].color = "#e86680";
                        }
                        else if (order.late) {
                            orders[index].tasks[i].color = "rgba(255, 195, 0, .9)";
                        }

                        orders[index].tasks[i].from = new Date(order.plannedStartTime);

                        if (!minNextStartTime || minNextStartTime > new Date(order.plannedStartTime)) {
                            minNextStartTime = new Date(order.plannedStartTime);
                        }
                        if (!maxEndTime || maxEndTime < new Date(order.expectedEndTime)) {
                            maxEndTime = new Date(order.expectedEndTime);
                        }
                        orders[index].tasks[i].to = new Date(order.expectedEndTime);
                        i++;

                    }

                });

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
           // console.info("data:" + JSON.stringify(vm.data));

            promise1 = $timeout(function () {
                $('#div').animate({
                    scrollLeft: $("#gantt-current-date-line").offset().left
                }, 500);
            }, 4000);
        }

        /*       function prepareGanttData(data2) {

         var minNextStartTime;
         var maxEndTime;
         var orders = [];
         $scope.ordersNoDuplicate = [];
         data2 = orderBy(data2, 'plannedStartTime', false);

         // console.info("Data2"+JSON.stringify(data2));
         //console.info("variable"+JSON.stringify(alasql('SELECT * FROM ?  GROUP BY jobChain', [data2])));

         angular.forEach(data2, function (order, index) {


         if ($scope.ordersNoDuplicate.length > 0) {
         var flag = false;

         angular.forEach($scope.ordersNoDuplicate, function (order1, index1) {
         //console.info("for ordersNoDuplicate index1 :"+index1 +"order:"+JSON.stringify(order));


         if (order.jobChain == order1.name) {
         //console.info("order1 jobChain :"+JSON.stringify(order1));

         orders[index1].tasks[orders[index1].tasks.length] = {};
         flag = true;
         var indexLength = orders[index1].tasks.length - 1;
         //   orders[index].tasks[orders[index].tasks.length].name = orders[index].name;
         orders[index1].tasks[indexLength].name = orders[index1].name;
         // orders[index1].status = order.state._text;
         vm.plans[index1].status = order.state._text;
         if (order.state._text == 'SUCCESSFUL') {
         orders[index1].tasks[indexLength].color = "#7ab97a";
         } else if (order.state._text == 'FAILED') {
         orders[index1].tasks[indexLength].color = "#e86680";
         }
         else if (order.late) {
         orders[index1].tasks[indexLength].color = "rgba(255, 195, 0, .9)";
         }
         orders[index1].tasks[indexLength].from = '';

         orders[index1].tasks[indexLength].from = new Date(order.plannedStartTime);

         if (!minNextStartTime || minNextStartTime > new Date(order.plannedStartTime)) {
         minNextStartTime = new Date(order.plannedStartTime);
         }
         if (!maxEndTime || maxEndTime < new Date(order.expectedEndTime)) {
         maxEndTime = new Date(order.expectedEndTime);
         }
         orders[index1].tasks[indexLength].to = new Date(order.expectedEndTime);
         // $scope.ordersNoDuplicate[index] = orders[index];

         }

         if (order.job == order1.name) {

         //console.info("order1 job :"+JSON.stringify(order1));
         orders[index1].tasks[orders[index1].tasks.length] = {};
         flag = true;
         var indexLength = orders[index1].tasks.length - 1;
         //   orders[index].tasks[orders[index].tasks.length].name = orders[index].name;
         orders[index1].tasks[indexLength].name = orders[index1].name;
         // orders[index1].status = order.state._text;
         vm.plans[index1].status = order.state._text;
         if (order.state._text == 'SUCCESSFUL') {
         orders[index1].tasks[indexLength].color = "#7ab97a";
         } else if (order.state._text == 'FAILED') {
         orders[index1].tasks[indexLength].color = "#e86680";
         }
         else if (order.late) {
         orders[index1].tasks[indexLength].color = "rgba(255, 195, 0, .9)";
         }
         orders[index1].tasks[indexLength].from = '';

         orders[index1].tasks[indexLength].from = new Date(order.plannedStartTime);

         if (!minNextStartTime || minNextStartTime > new Date(order.plannedStartTime)) {
         minNextStartTime = new Date(order.plannedStartTime);
         }
         if (!maxEndTime || maxEndTime < new Date(order.expectedEndTime)) {
         maxEndTime = new Date(order.expectedEndTime);
         }
         orders[index1].tasks[indexLength].to = new Date(order.expectedEndTime);

         }
         else if (flag == false && index1 == $scope.ordersNoDuplicate.length - 1) {
         //  console.info("else if  :"+JSON.stringify($scope.ordersNoDuplicate));
         //   console.info("else if  orders :"+JSON.stringify(orders));
         //console.info("else if  $scope.ordersNoDuplicate.length :"+$scope.ordersNoDuplicate.length);


         var indexLength = $scope.ordersNoDuplicate.length;
         orders[indexLength] = {};
         orders[indexLength].tasks = [];
         orders[indexLength].tasks[0] = {};

         if (order.job != undefined) {
         orders[indexLength].name = order.job;
         orders[indexLength].orderId = '-';
         } else {
         // orders[index].name = order.jobChain.substring(order.jobChain.lastIndexOf('/') + 1, order.jobChain.length);
         orders[indexLength].name = order.jobChain.substring(order.jobChain);
         orders[indexLength].orderId = order.orderId;
         }

         vm.plans[indexLength].processedPlanned = orders[indexLength].name;
         orders[indexLength].tasks[0].name = orders[indexLength].name;
         // orders[indexLength].status = order.state._text;
         vm.plans[indexLength].status = order.state._text;
         if (order.state._text == 'SUCCESSFUL') {
         orders[indexLength].tasks[0].color = "#7ab97a";
         } else if (order.state._text == 'FAILED') {
         orders[indexLength].tasks[0].color = "#e86680";
         }
         else if (order.late) {
         orders[indexLength].tasks[0].color = "rgba(255, 195, 0, .9)";
         }

         orders[indexLength].tasks[0].from = new Date(order.plannedStartTime);

         if (!minNextStartTime || minNextStartTime > new Date(order.plannedStartTime)) {
         minNextStartTime = new Date(order.plannedStartTime);
         }
         if (!maxEndTime || maxEndTime < new Date(order.expectedEndTime)) {
         maxEndTime = new Date(order.expectedEndTime);
         }
         orders[indexLength].tasks[0].to = new Date(order.expectedEndTime);

         $scope.ordersNoDuplicate.push(orders[indexLength]);
         //    console.info(" second orders[index]" + JSON.stringify(orders[indexLength]));
         //   console.info(" second $scope.ordersNoDuplicate[index]" + JSON.stringify($scope.ordersNoDuplicate));
         }

         });
         } else {
         orders[index] = {};
         orders[index].tasks = [];
         orders[index].tasks[0] = {};
         if (order.job != undefined) {
         orders[index].name = order.job;
         orders[index].orderId = '-';
         } else {
         // orders[index].name = order.jobChain.substring(order.jobChain.lastIndexOf('/') + 1, order.jobChain.length);
         orders[index].name = order.jobChain.substring(order.jobChain);
         orders[index].orderId = order.orderId;
         }

         vm.plans[index].processedPlanned = orders[index].name;
         orders[index].tasks[0].name = orders[index].name;
         //orders[index].status = order.state._text;
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

         $scope.ordersNoDuplicate[index] = orders[index];
         //console.info(" first $scope.ordersNoDuplicate[index]" + JSON.stringify($scope.ordersNoDuplicate));

         }


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
         }*/

        vm.load = function () {
            var obj = {};
            obj.jobschedulerId= vm.schedulerIds.selected;
            obj.dateFrom= vm.filter.from;
            obj.dateTo= vm.filter.to;

            if(vm.filter.status !='ALL') {
                obj.states = [];
                if (vm.filter.status == 'WAITING') {
                    obj.states.push("PLANNED");
                } else if (vm.filter.status == 'EXECUTED') {
                    obj.states.push("SUCCESSFUL");
                    obj.states.push("FAILED");
                }
                if (vm.filter.status == 'LATE'){
                    obj.late = true;
                }
            }

            obj = applySavedFilter(obj);
 vm.showSpinner=true;
            $scope.startSpin();
           
            DailyPlanService.getPlans(obj).then(function (res) {
                vm.plans = res.planItems;

                //if (vm.pageView == 'grid')
                    prepareGanttData(vm.plans);
                vm.isLoading = true;
                 vm.showSpinner= false;
                  $scope.stopSpin();
            }, function (err) {
                 vm.isLoading = true;
            })
        };

           // console.info($stateParams);
        if($stateParams.filter!=null){
              if ($stateParams.filter == 1) {
                  vm.filter.status = 'WAITING';
              }
             if ($stateParams.filter ==2) {
                  vm.filter.status = 'LATE';
              }

             if ($stateParams.filter == 3) {
                  vm.filter.status = 'EXECUTED';
              }

               if($stateParams.day == 'next-24-hours' ){
                setDateRange('next-24-hours');
            }
             if($stateParams.day == 'today' ){
                setDateRange('today');
            }

           //vm.load();
        }

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
            vm.savedDailyPlanFilter.favorite = filter.name;
            vm.savedDailyPlanFilter.selected = filter.name;
            selectedFiltered = filter;
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

        vm.startSpin = function () {
            if (vm.showSpinner) {
               vm.showSpinner1= true;
            }
        };

        vm.stopSpin = function () {
            if (!vm.showSpinner) {
                vm.showSpinner1= false;
            }
        };
        vm.$on('$destroy', function () {
            if (promise1)
                $timeout.cancel(promise1);
            watcher();
        });


    }
})();
