/**
 * Created by sourabhagrawal on 29/06/16.
 */
(function () {
    'use strict';
    angular
        .module('app')
        .controller('ResourceCtrl', ResourceCtrl)
        .controller('ResourceInfoCtrl', ResourceInfoCtrl)
        .controller('DashboardCtrl', DashboardCtrl)
        .controller('DailyPlanCtrl', DailyPlanCtrl);

    ResourceCtrl.$inject = ["$scope", "$rootScope", "JobSchedulerService", "ResourceService", "orderByFilter", "ScheduleService", "$uibModal", "CoreService", "$interval", "$window", "TaskService", "CalendarService","$timeout"];
    function ResourceCtrl($scope, $rootScope, JobSchedulerService, ResourceService, orderBy, ScheduleService, $uibModal, CoreService, $interval, $window, TaskService, CalendarService,$timeout) {
        var vm = $scope;
        vm.maxEntryPerPage = vm.userPreferences.maxEntryPerPage;
        vm.resourceFilters = CoreService.getResourceTab();
        vm.agentsFilters = vm.resourceFilters.agents;
        vm.locksFilters = vm.resourceFilters.locks;
        vm.processFilters = vm.resourceFilters.processClasses;
        vm.scheduleFilters = vm.resourceFilters.schedules;
        vm.calendarFilters = vm.resourceFilters.calendar;

        vm.object = {};

        vm.tree = [];
        vm.treeLock = [];
        vm.treeProcess = [];
        vm.treeAgent = [];
        vm.treeCalendar = [];
        vm.my_tree = {};
        vm.my_tree_lock = {};
        vm.my_tree_process = {};
        vm.my_tree_agent = {};
        vm.my_tree_calendar = {};

        vm.filter_tree = {};
        vm.filterTree1 = [];
        vm.object.paths = [];
        vm.expanding_property = {
            field: "name"
        };

        vm.expanding_propertyA = {
            field: "name"
        };

        vm.expanding_property1 = {
            field: "name"
        };
        vm.expanding_propertyL = {
            field: "name"
        };
        vm.expanding_propertyP = {
            field: "name"
        };
        vm.expanding_propertyC = {
            field: "name"
        };
        vm.sortByA = function (propertyName) {
            vm.agentsFilters.reverse = !vm.agentsFilters.reverse;
            vm.agentsFilters.filter.sortBy = propertyName;
        };
        vm.sortByP = function (propertyName) {
            vm.processFilters.reverse = !vm.processFilters.reverse;
            vm.processFilters.filter.sortBy = propertyName;
        };
        vm.sortByS = function (propertyName) {
            vm.object.schedules = [];
            vm.scheduleFilters.reverse = !vm.scheduleFilters.reverse;
            vm.scheduleFilters.filter.sortBy = propertyName;
        };
        vm.sortByL = function (propertyName) {
            vm.locksFilters.reverse = !vm.locksFilters.reverse;
            vm.locksFilters.filter.sortBy = propertyName;
        };
        vm.sortByC = function (propertyName) {
            vm.calendarFilters.reverse = !vm.calendarFilters.reverse;
            vm.calendarFilters.filter.sortBy = propertyName;
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
            angular.forEach(data.folders, function (value) {
                value.selected1 = false;
                if (value.expanded) {
                    traverseTree(value);
                }
            });
        }

        function recursiveTreeUpdate(scrTree, destTree, type) {
            if (scrTree && destTree)
                for (var i = 0; i < scrTree.length; i++) {
                    for (var j = 0; j < destTree.length; j++) {
                        if (scrTree[i].path == destTree[j].path) {
                            if (type == 'lock') {
                                scrTree[i].locks = destTree[j].locks;
                            } else if (type == 'processClass') {
                                scrTree[i].processClasses = destTree[j].processClasses;
                            } else if (type == 'agent') {
                                scrTree[i].agentClusters = destTree[j].agentClusters;
                            }else if(type == 'schedule'){
                                scrTree[i].schedules = destTree[j].schedules;
                            } else {
                                scrTree[i].calendars = destTree[j].calendars;
                            }
                            scrTree[i].expanded = destTree[j].expanded;
                            scrTree[i].selected = destTree[j].selected;
                            scrTree[i].selected1 = destTree[j].selected1;
                            recursiveTreeUpdate(scrTree[i].folders, destTree[j].folders, type);
                            destTree.splice(j, 1);
                            break;
                        }
                    }
                }
        }

        vm.recursiveTreeUpdate = function (scrTree, destTree, type) {
            if (scrTree && destTree)
                for (var i = 0; i < scrTree.length; i++) {
                    for (var j = 0; j < destTree.length; j++) {
                        if (scrTree[i].path == destTree[j].path) {
                            if (type == 'lock') {
                                scrTree[i].locks = destTree[j].locks;
                            } else if (type == 'processClass') {
                                scrTree[i].processClasses = destTree[j].processClasses;
                            } else if (type == 'agent') {
                                scrTree[i].agentClusters = destTree[j].agentClusters;
                            } else if(type == 'schedule'){
                                scrTree[i].schedules = destTree[j].schedules;
                            } else {
                                scrTree[i].calendars = destTree[j].calendars;
                            }
                            scrTree[i].expanded = destTree[j].expanded;
                            scrTree[i].selected = destTree[j].selected;
                            scrTree[i].selected1 = destTree[j].selected1;
                            recursiveTreeUpdate(scrTree[i].folders, destTree[j].folders, type);
                            destTree.splice(j, 1);
                            break;
                        }
                    }
                }
            return scrTree;
        };


        /** -----------------Begin Agent clusters------------------- */

        /**
         * Function to initialized SCHEDULE tree
         */
        function initAgentTree(type) {
            ResourceService.tree({
                jobschedulerId: vm.schedulerIds.selected,
                compact: true,
                types: ['AGENTCLUSTER']
            }).then(function (res) {
                if ($rootScope.agent_cluster_expand_to) {
                    vm.treeAgent = res.folders;
                    filteredTreeDataA();
                } else {
                    if (type) {
                        vm.treeAgent = res.folders;
                        filteredTreeDataA(type);
                    } else {
                        if (vm.isEmpty(vm.agentsFilters.expand_to)) {
                            vm.treeAgent = res.folders;
                            filteredTreeDataA(type);
                        } else {
                            vm.agentsFilters.expand_to = vm.recursiveTreeUpdate(angular.copy(res.folders), vm.agentsFilters.expand_to, 'agent');
                            vm.treeAgent = vm.agentsFilters.expand_to;
                            previousTreeStateA();
                        }
                    }
                }

                vm.agentsFilters.expand_to = vm.treeAgent;
                vm.isLoading = true;
            }, function () {
                vm.isLoading = true;
            });
        }

        function filteredTreeDataA(type) {
            angular.forEach(vm.treeAgent, function (value) {
                value.expanded = true;
                value.selected1 = true;
                vm.allAgentClusters = [];
                checkExpandA(value, type);
            });
        }

        function previousTreeStateA() {
            angular.forEach(vm.treeAgent, function (value) {
                vm.allAgentClusters = [];
                checkExpandA(value);
            });
        }

        vm.expandNodeA = function (data) {
            navFullTreeA();
            vm.allAgentClusters = [];
            vm.loading = true;
            vm.folderPathA = data.name || '/';
            var obj = {};
            obj.jobschedulerId = $scope.schedulerIds.selected;

            if (vm.agentsFilters.filter.state != 'all') {
                obj.state = vm.agentsFilters.filter.state == '0' ? 0 : vm.agentsFilters.filter.state == '1' ? 1 : 2;
            }

            obj.folders = [{folder: data.path, recursive: true}];
            JobSchedulerService.getAgentCluster(obj).then(function (result) {
                vm.agentClusters = result.agentClusters;
                vm.loading = false;
                startTraverseNodeA(data);
            }, function () {
                vm.loading = false;
            });
        };

        vm.treeHandlerA = function (data) {
            navFullTreeA();
            data.selected1 = true;
            data.agentClusters = [];
            vm.allAgentClusters = [];
            vm.loading = true;
            loadAgentsV(data);
        };

        vm.treeHandler1A = function (data) {
            if (data.expanded) {
                data.folders = orderBy(data.folders, 'name');
            }
        };

        function navFullTreeA() {
            angular.forEach(vm.treeAgent, function (value) {
                value.selected1 = false;
                if (value.expanded) {
                    traverseTree(value);
                }
            });
        }

        function checkExpandA(data, type) {
            if (data.selected1) {
                data.agentClusters = [];
                loadAgentsV(data);

                vm.folderPathA = data.name || '/';
                angular.forEach(data.agentClusters, function (value) {
                    value.path1 = data.path;
                    vm.allAgentClusters.push(value);
                });
            }
            data.folders = orderBy(data.folders, 'name');
            angular.forEach(data.folders, function (value) {
                if (type) {
                    value.expanded = true;
                    value.selected1 = true;
                }
                if ($rootScope.agent_cluster_expand_to && $rootScope.agent_cluster_expand_to.path.indexOf(value.path) != -1) {
                    value.expanded = true;
                }
                if ($rootScope.agent_cluster_expand_to && $rootScope.agent_cluster_expand_to.path == value.path) {
                    value.selected1 = true;
                    $rootScope.agent_cluster_expand_to = undefined;
                }

                checkExpandA(value, type);
            });
        }


        vm.showAgents = function (cluster) {
            cluster.show = true;
        };
        vm.hideAgents = function (cluster) {
            cluster.show = false;
        };

        vm.loadAgents = function () {
            vm.pollAgents();
        };


        function pollCheckExpandTreeForUpdates(data) {
            if (data.selected1) {
                obj1.folders.push({folder: data.path, recursive: false});
                vm.folderPath = data.name || '/';
            }
            data.folders = orderBy(data.folders, 'name');
            angular.forEach(data.folders, function (value) {
                if (value.expanded || value.selected1)
                    pollCheckExpandTreeForUpdates(value);
            });
        }


        var obj1 = {};
        vm.pollAgents = function () {
            obj1 = {folders: []};

            obj1.jobschedulerId = vm.schedulerIds.selected;
            if (vm.agentsFilters.filter.state != 'all') {
                obj1.state = vm.agentsFilters.filter.state == '0' ? 0 : vm.agentsFilters.filter.state == '1' ? 1 : 2;
            }

            angular.forEach(vm.treeAgent, function (value) {
                if (value.expanded || value.selected1)
                    pollCheckExpandTreeForUpdates(value);
            });

            JobSchedulerService.getAgentCluster(obj1).then(function (result) {
                vm.allAgentClusters = [];
                angular.forEach(vm.treeAgent, function (node, index) {
                    insertData(node, result.agentClusters);
                })
            });
        };


        function insertData(node, x) {
            for (var i = 0; i < node.agentClusters.length; i++) {
                for (var j = 0; j < x.length; j++) {
                    if (node.agentClusters[i].path == x[j].path) {
                        if (node.agentClusters[i].show)
                            x[j].show = true;
                        break;
                    }
                }
            }
            node.agentClusters = [];
            for (var i = 0; i < x.length; i++) {
                if (node.path == x[i].path.substring(0, x[i].path.lastIndexOf('/')) || node.path == x[i].path.substring(0, x[i].path.lastIndexOf('/') + 1)) {
                    x[i].path1 = node.path;
                    node.agentClusters.push(x[i]);
                    vm.allAgentClusters.push(x[i]);
                }
            }

            angular.forEach(node.folders, function (value) {
                if (value.expanded || value.selected1)
                    insertData(value, x);
            });
        }

        function loadAgentsV(data) {
            var obj = {};
            obj.jobschedulerId = $scope.schedulerIds.selected;

            if (vm.agentsFilters.filter.state != 'all') {
                obj.state = vm.agentsFilters.filter.state == '0' ? 0 : vm.agentsFilters.filter.state == '1' ? 1 : 2;
            }

            obj.folders = [
                {folder: data.path, recursive: false}
            ];
            JobSchedulerService.getAgentCluster(obj).then(function (result) {
                data.agentClusters = result.agentClusters;
                angular.forEach(data.agentClusters, function (value) {
                    value.path1 = data.path;
                    vm.allAgentClusters.push(value);
                });
                vm.loading = false;
                vm.folderPathA = data.name || '/';
            }, function () {
                vm.loading = false;
                vm.folderPathA = data.name || '/';
            });
        }

        function startTraverseNodeA(data) {
            vm.allAgentClusters = [];
            function recursive(data) {
                data.expanded = true;
                data.folders = orderBy(data.folders, 'name');
                data.agentClusters = [];
                angular.forEach(vm.agentClusters, function (value) {
                    if (data.path == value.path.substring(0, value.path.lastIndexOf('/')) || data.path == value.path.substring(0, value.path.lastIndexOf('/') + 1)) {
                        data.agentClusters.push(value);
                        value.path1 = data.path;
                        vm.allAgentClusters.push(value);
                    }
                });

                data.selected1 = true;
                angular.forEach(data.folders, function (a) {
                    recursive(a);
                });
            }

            recursive(data);
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

                if (vm.isEmpty(vm.locksFilters.expand_to)) {
                    vm.treeLock = res.folders;
                    filteredTreeDataL();
                } else {
                    vm.locksFilters.expand_to = vm.recursiveTreeUpdate(angular.copy(res.folders), vm.locksFilters.expand_to, 'lock');
                    vm.treeLock = vm.locksFilters.expand_to;
                    previousTreeStateL();
                }
                vm.locksFilters.expand_to = vm.treeLock;

                vm.isLoading = true;
            }, function () {
                vm.isLoading = true;
            });
        }

        function filteredTreeDataL() {
            angular.forEach(vm.treeLock, function (value) {
                value.expanded = true;
                value.selected1 = true;
                vm.allLocks = [];
                checkExpandL(value);
            });
        }

        function previousTreeStateL() {

            angular.forEach(vm.treeLock, function (value) {
                vm.allLocks = [];
                checkExpandL(value);
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
                vm.loading = false;
            }, function () {
                if (expandNode) {
                    startTraverseNodeL(expandNode);
                }
                vm.loading = false;
            });
        }


        vm.expandNodeL = function (data) {
            navFullTreeL();
            vm.allLocks = [];
            vm.loading = true;
            vm.folderPathL = data.name || '/';
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.folders = [];
            obj.folders.push({folder: data.path, recursive: true});
            ResourceService.getLocksP(obj).then(function (result) {
                vm.locks = result.locks;
                volatileInformationL(obj, data);
            }, function () {
                volatileInformationL(obj, data);
                vm.loading = false;
            });
        };


        function startTraverseNodeL(data) {
            vm.allLocks = [];
            function recursive(data) {
                data.expanded = true;
                data.folders = orderBy(data.folders, 'name');
                data.locks = [];
                angular.forEach(vm.locks, function (value) {
                    if (data.path == value.path.substring(0, value.path.lastIndexOf('/')) || data.path == value.path.substring(0, value.path.lastIndexOf('/') + 1)) {
                        data.locks.push(value);
                        value.path1 = data.path;
                        vm.allLocks.push(value);
                    }
                });

                data.selected1 = true;

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

        function expandFolderDataL1(data) {
            vm.loading = true;
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.folders = [{folder: data.path, recursive: false}];
            ResourceService.getLocksP(obj).then(function (result) {
                data.locks = result.locks;
                volatileFolderDataL1(data, obj);
            }, function () {
                volatileFolderDataL1(data, obj);
                vm.loading = false;
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
                    angular.forEach(data.locks, function (value) {
                        var flag = true;
                        value.path1 = data.path;

                        angular.forEach(vm.allLocks, function (value1) {
                            if (value.path == value1.path) {
                                flag = false;
                            }
                        });
                        if (flag)
                            vm.allLocks.push(value);
                    });
                }
                vm.folderPathL = data.name || '/';

                vm.loading = false;
            }, function () {

                if (data.locks.length > 0) {
                    angular.forEach(data.locks, function (value) {
                        var flag = true;
                        value.path1 = data.path;

                        angular.forEach(vm.allLocks, function (value1) {
                            if (value.path == value1.path) {
                                flag = false;
                            }
                        });
                        if (flag)
                            vm.allLocks.push(value);
                    });
                }
                vm.folderPathL = data.name || '/';

                vm.loading = false;
            });
        }

        function volatileFolderDataL1(data, obj) {
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

                var temp = [];
                if (data.locks.length > 0) {

                    for (var x = 0; x < vm.allLocks.length; x++) {
                        if (vm.allLocks[x].path1 != data.path) {
                            temp.push(vm.allLocks[x]);
                        }
                    }
                    angular.forEach(data.locks, function (value) {

                        value.path1 = data.path;
                        temp.push(value);
                    });
                }
                vm.allLocks = temp;

                vm.folderPathL = data.name || '/';

                vm.loading = false;
            }, function () {

                var temp = [];
                if (data.locks.length > 0) {

                    for (var x = 0; x < vm.allLocks.length; x++) {
                        if (vm.allLocks[x].path1 != data.path) {
                            temp.push(vm.allLocks[x]);
                        }
                    }
                    angular.forEach(data.locks, function (value) {
                        value.path1 = data.path;
                        temp.push(value);
                    });
                }
                vm.allLocks = temp;
                vm.folderPathL = data.name || '/';

                vm.loading = false;
            });
        }

        vm.treeHandlerL = function (data) {
            navFullTreeL();
            data.selected1 = true;
            data.locks = [];
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


        function checkExpandL(data) {
            if (data.selected1) {
                data.locks = [];
                expandFolderDataL(data);

                vm.folderPathL = data.name || '/';
                angular.forEach(data.locks, function (value) {
                    value.path1 = data.path;
                    vm.allLocks.push(value);
                });
            }
            data.folders = orderBy(data.folders, 'name');
            angular.forEach(data.folders, function (value) {
                checkExpandL(value);
            });
        }


        /** <<<<<<<<<<<<< End Locks >>>>>>>>>>>>>>> */

        /** -----------------Begin ProcessClass------------------- */

        /**
         * Function to initialized Proccess tree
         */
        function initProccessTree() {
            ResourceService.tree({
                jobschedulerId: vm.schedulerIds.selected,
                compact: true,
                types: ['PROCESSCLASS']
            }).then(function (res) {

                if ($rootScope.agent_cluster_expand_to) {
                    vm.treeProcess = angular.copy(res.folders);
                    filteredTreeDataP();
                } else {
                    if (vm.isEmpty(vm.processFilters.expand_to)) {
                        vm.treeProcess = angular.copy(res.folders);
                        filteredTreeDataP();
                    } else {

                        vm.processFilters.expand_to = vm.recursiveTreeUpdate(angular.copy(res.folders), vm.processFilters.expand_to, 'processClass');
                        vm.treeProcess = vm.processFilters.expand_to;
                        previousTreeStateP();
                    }
                }

                vm.processFilters.expand_to = vm.treeProcess;
                vm.isLoading = true;
            }, function (err) {
                vm.isLoading = true;
            });
        }

        vm.showRunningProcesses = function (processClass) {
            processClass.show = true;
        };

        vm.hideRunningProcesses = function (processClass) {
            processClass.show = false;
        };

        function terminateTaskWithTimeout(task, path) {
            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            var taskIds = [];
            taskIds.push({taskId: task.taskId});
            jobs.jobs.push({job: path, taskIds: taskIds});

            jobs.auditLog = {};
            if (vm.comments.comment) {
                jobs.auditLog.comment = vm.comments.comment;
            }
            if (vm.comments.timeSpent) {
                jobs.auditLog.timeSpent = vm.comments.timeSpent;
            }

            if (vm.comments.ticketLink) {
                jobs.auditLog.ticketLink = vm.comments.ticketLink;
            }

            jobs.timeout = vm.timeout;
            TaskService.terminateWith(jobs);

        }


        vm.terminateTaskWithTimeout = function (task, path) {
            if (task && path) {
                vm.task = task;
                vm.path = path;
            }

            vm.timeout = 10;
            vm.comments = {};
            vm.comments.radio = 'predefined';
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/terminate-task-timeout-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                terminateTaskWithTimeout(task, path);
                vm.reset();
            }, function () {
                vm.reset();
            });

        };

        function filteredTreeDataP() {
            angular.forEach(vm.treeProcess, function (value) {
                value.expanded = true;
                value.selected1 = true;
                vm.allProcessClasses = [];
                checkExpandP(value);
            });
        }

        function previousTreeStateP() {
            angular.forEach(vm.treeProcess, function (value) {
                vm.allProcessClasses = [];
                checkExpandP(value);
            });
        }

        function volatileInformationP(obj, expandNode) {
            ResourceService.getProcessClass(obj).then(function (res) {

                if (vm.processClasses.length > 0) {
                    angular.forEach(vm.processClasses, function (processClass) {
                        angular.forEach(res.processClasses, function (processClassData) {
                            if (processClass.path == processClassData.path) {
                                processClassData.maxProcesses = processClass.maxProcesses;
                                processClass = processClassData;
                            }
                        });
                    });
                }

                vm.processClasses = res.processClasses;

                if (expandNode) {
                    startTraverseNodeP(expandNode);
                }
                vm.loading = false;
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

        function expandFolderDataP1(data) {
            vm.loading = true;
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.folders = [{folder: data.path, recursive: false}];
            ResourceService.getProcessClassP(obj).then(function (result) {
                data.processClasses = result.processClasses;
                volatileFolderDataP1(data, obj);

            }, function () {
                volatileFolderDataP1(data, obj);
                vm.loading = false;
            });
        }

        function volatileFolderDataP(data, obj) {
            ResourceService.getProcessClass(obj).then(function (res) {

                if (data.processClasses.length > 0) {
                    angular.forEach(data.processClasses, function (processClass) {
                        angular.forEach(res.processClasses, function (processClassData) {
                            if (processClass.path == processClassData.path) {
                                processClassData.maxProcesses = processClass.maxProcesses;
                                processClass = processClassData;
                            }
                        });
                    });
                }

                data.processClasses = res.processClasses;


                if (data.processClasses.length > 0) {
                    angular.forEach(data.processClasses, function (value) {
                        var flag = true;
                        value.path1 = data.path;

                        angular.forEach(vm.allProcessClasses, function (value1) {
                            if (value.path == value1.path) {
                                flag = false;
                            }
                        });
                        if (flag)
                            vm.allProcessClasses.push(value);
                    });
                }
                vm.folderPathP = data.name || '/';

                vm.loading = false;
            }, function () {

                if (data.processClasses.length > 0) {
                    angular.forEach(data.processClasses, function (value) {
                        var flag = true;
                        value.path1 = data.path;

                        angular.forEach(vm.allProcessClasses, function (value1) {
                            if (value.path == value1.path) {
                                flag = false;
                            }
                        });
                        if (flag)
                            vm.allProcessClasses.push(value);
                    });
                }
                vm.folderPathP = data.name || '/';

                vm.loading = false;
            });
        }

        function volatileFolderDataP1(data, obj) {
            ResourceService.getProcessClass(obj).then(function (res) {

                if (data.processClasses.length > 0) {
                    angular.forEach(data.processClasses, function (processClass) {
                        angular.forEach(res.processClasses, function (processClassData) {
                            if (processClass.path == processClassData.path) {
                                processClassData.maxProcesses = processClass.maxProcesses;
                                processClass = processClassData;
                            }
                        });
                    });
                }

                data.processClasses = res.processClasses;

                var temp = [];
                if (data.processClasses.length > 0) {
                    for (var x = 0; x < vm.allProcessClasses.length; x++) {
                        if (vm.allProcessClasses[x].path1 != data.path) {
                            temp.push(vm.allProcessClasses[x]);
                        }
                    }
                    angular.forEach(data.processClasses, function (value) {
                        value.path1 = data.path;
                        temp.push(value);
                    });
                }
                vm.allProcessClasses = temp;
                vm.folderPathP = data.name || '/';

                vm.loading = false;
            }, function () {

                var temp = [];
                if (data.processClasses.length > 0) {
                    for (var x = 0; x < vm.allProcessClasses.length; x++) {
                        if (vm.allProcessClasses[x].path1 != data.path) {
                            temp.push(vm.allProcessClasses[x]);
                        }
                    }
                    angular.forEach(data.processClasses, function (value) {
                        value.path1 = data.path;
                        temp.push(value);
                    });
                }
                vm.allProcessClasses = temp;
                vm.folderPathP = data.name || '/';

                vm.loading = false;
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
            navFullTreeP();
            vm.allProcessClasses = [];
            vm.loading = true;
            vm.folderPathP = data.name || '/';
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.folders = [];
            obj.folders.push({folder: data.path, recursive: true});
            ResourceService.getProcessClassP(obj).then(function (result) {
                vm.processClasses = result.processClasses;
                volatileInformationP(obj, data);
            }, function () {
                volatileInformationP(obj, data);
                vm.loading = false;
            });
        };


        function startTraverseNodeP(data) {
            vm.allProcessClasses = [];
            function recursive(data) {
                data.expanded = true;
                data.folders = orderBy(data.folders, 'name');
                data.processClasses = [];
                angular.forEach(vm.processClasses, function (value) {
                    if (data.path == value.path.substring(0, value.path.lastIndexOf('/')) || (data.path == '/' && (value.name == 'multi' || value.name == '(default)' || value.name == 'single'))) {
                        data.processClasses.push(value);
                        value.path1 = data.path;
                        vm.allProcessClasses.push(value);
                    }
                });
                data.selected1 = true;
                angular.forEach(data.folders, function (a) {
                    recursive(a);
                });
            }

            recursive(data);
        }

        function checkExpandP(data) {
            if (data.selected1) {
                data.processClasses = [];
                expandFolderDataP(data);

                vm.folderPathP = data.name || '/';
                angular.forEach(data.processClasses, function (value) {
                    value.path1 = data.path;
                    vm.allProcessClasses.push(value);
                });
            }
            data.folders = orderBy(data.folders, 'name');
            angular.forEach(data.folders, function (value) {
                if ($rootScope.process_class_expand_to && $rootScope.process_class_expand_to.path.indexOf(value.path) != -1) {
                    value.expanded = true;
                }
                if ($rootScope.process_class_expand_to && $rootScope.process_class_expand_to.path == value.path) {
                    value.selected1 = true;
                    $rootScope.process_class_expand_to = undefined;
                }
                checkExpandP(value);
            });
        }

        vm.showProcesses = function (processClass) {
            vm.processClass = processClass;
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/process-list-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                size: 'lg'
            });
            modalInstance.result.then(function () {
            }, function () {

            });
        };


        /** <<<<<<<<<<<<< End ProcessClass >>>>>>>>>>>>>>> */


        /** -----------------Begin Calendar------------------- */

        vm.allCheckCalendar = {
            checkbox: false
        };
        vm.checkAllCalendar = function() {
            if (vm.allCheckCalendar.checkbox && vm.allCalendars.length > 0) {
                vm.object.calendars = vm.allCalendars.slice((vm.userPreferences.entryPerPage * (vm.calendarFilters.currentPage - 1)), (vm.userPreferences.entryPerPage * vm.calendarFilters.currentPage));
            } else {
                vm.object.calendars = [];
            }
        };

        var watcher4 = $scope.$watchCollection('object.calendars', function (newNames) {
            if (newNames && newNames.length > 0) {
                vm.allCheckCalendar.checkbox = newNames.length == vm.allCalendars.slice((vm.userPreferences.entryPerPage * (vm.calendarFilters.currentPage - 1)), (vm.userPreferences.entryPerPage * vm.calendarFilters.currentPage)).length;
            } else {
                vm.allCheckCalendar.checkbox = false;
            }
        });

        vm.getCategories = function() {
            CalendarService.getCalendarCategories({jobschedulerId: vm.schedulerIds.selected}).then(function (res) {
                vm.categories = res.categories;
            });
        };

        vm.getCategories();

        /**
         * Function to initialized Calendar tree
         */
        function initCalendarTree() {
            ResourceService.tree({
                jobschedulerId: vm.schedulerIds.selected,
                compact: true,
                types: ["WORKINGDAYSCALENDAR","NONWORKINGDAYSCALENDAR"]
            }).then(function (res) {
                if ($rootScope.calendar_expand_to) {
                    vm.treeCalendar = angular.copy(res.folders);
                    filteredTreeDataC();
                } else {
                    if (vm.isEmpty(vm.calendarFilters.expand_to)) {
                        vm.treeCalendar = angular.copy(res.folders);
                        filteredTreeDataC();
                    } else {
                        vm.calendarFilters.expand_to = vm.recursiveTreeUpdate(angular.copy(res.folders), vm.calendarFilters.expand_to, 'calendar');
                        vm.treeCalendar = vm.calendarFilters.expand_to;
                        vm.loadCalendar();
                    }
                }
                vm.calendarFilters.expand_to = vm.treeCalendar;
                vm.isLoading = true;
            }, function () {
                vm.isLoading = true;
            });
        }


        function filteredTreeDataC() {
            angular.forEach(vm.treeCalendar, function (value) {
                value.expanded = true;
                value.selected1 = true;
                vm.allCalendars = [];
                checkExpandC(value);
            });
        }

        function checkExpandC(data) {
            if (data.selected1) {
                data.calendars = [];
                expandFolderDataC(data);

                vm.folderPathC = data.name || '/';
                vm.folderFullPathC = data.path || '/';
                angular.forEach(data.calendars, function (value) {
                    value.path1 = data.path;
                    vm.allCalendars.push(value);
                });
            }
            data.folders = orderBy(data.folders, 'name');
            angular.forEach(data.folders, function (value) {
                if ($rootScope.calendar_expand_to && $rootScope.calendar_expand_to.path.indexOf(value.path) != -1) {
                    value.expanded = true;
                }
                if ($rootScope.calendar_expand_to && $rootScope.calendar_expand_to.path == value.path) {
                    value.selected1 = true;
                    $rootScope.calendar_expand_to = undefined;
                }
                checkExpandC(value);
            });
        }

        function expandFolderDataC(data) {
            vm.object.calendars=[];
            vm.loading = true;
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.folders = [{folder: data.path, recursive: false}];
            if (vm.calendarFilters.filter.type != 'ALL') {
                obj.type = vm.calendarFilters.filter.type;
            }
            if(vm.calendarFilters.filter.category){
                obj.categories = [];
                obj.categories.push(vm.calendarFilters.filter.category);
            }
            obj.compact = true;
            CalendarService.getListOfCalendars(obj).then(function (result) {
                data.calendars = result.calendars;
                vm.allCalendars = result.calendars;
                vm.folderPathC = data.name || '/';
                vm.folderFullPathC = data.path || '/';
                vm.loading = false;
                if (data.calendars.length > 0) {
                    angular.forEach(data.calendars, function (value) {
                        var flag = true;
                        value.path1 = data.path;
                    });
                }
            }, function () {
                vm.loading = false;
            });
        }

        vm.treeHandler1C = function (data) {
            if (data.expanded) {
                data.folders = orderBy(data.folders, 'name');
            }
        };

        vm.treeHandlerC = function (data) {
            navFullTreeC();
            data.selected1 = true;
            data.calendars = [];
            vm.allCalendars = [];
            vm.loading = true;
            expandFolderDataC(data);
        };
        function navFullTreeC() {
            angular.forEach(vm.treeCalendar, function (value) {
                value.selected1 = false;
                if (value.expanded) {
                    traverseTree(value);
                }
            });
        }

        vm.expandNodeC = function (data) {
            //console.log(data)
            navFullTreeC();
            vm.allCalendars = [];
            vm.loading = true;
            vm.folderPathC = data.name || '/';
            vm.folderFullPathC = data.path || '/';
            var obj = {};
             obj.jobschedulerId = vm.schedulerIds.selected;
            obj.folders = [];
            obj.folders.push({folder: data.path, recursive: true});
            if (vm.calendarFilters.filter.type != 'ALL') {
                obj.type = vm.calendarFilters.filter.type;
            }
            if(vm.calendarFilters.filter.category){
                obj.categories = [];
                obj.categories.push(vm.calendarFilters.filter.category);
            }
            obj.compact = true;
            CalendarService.getListOfCalendars(obj).then(function (result) {
                vm.allCalendars = result.calendars;
                startTraverseNode1(data);
                vm.loading = false;
            }, function () {
                vm.loading = false;
            });
        };

        function startTraverseNode1(data) {
            function recursive(data) {
                data.expanded = true;
                data.folders = orderBy(data.folders, 'name');
                data.calendars = [];
                angular.forEach(vm.allCalendars, function (value) {
                    if (data.path == value.path.substring(0, value.path.lastIndexOf('/')) || data.path == value.path.substring(0, value.path.lastIndexOf('/') + 1)) {
                        data.calendars.push(value);
                        value.path1 = data.path;
                    }
                });
                data.selected1 = true;
                angular.forEach(data.folders, function (a) {
                    recursive(a);
                });
            }
            recursive(data);
        }


        function insertCalendar(node, x) {
            node.calendars = [];
            for (var i = 0; i < x.length; i++) {
                if (node.path == x[i].path.substring(0, x[i].path.lastIndexOf('/')) || node.path == x[i].path.substring(0, x[i].path.lastIndexOf('/') + 1)) {
                    x[i].path1 = node.path;
                    node.calendars.push(x[i]);
                    vm.allCalendars.push(x[i]);
                }
            }

            vm.folderPathC = node.name || '/';
            vm.folderFullPathC = node.path || '/';
            angular.forEach(node.folders, function (value) {
                if (value.expanded || value.selected1)
                    insertCalendar(value, x);
            });
        }
        var obj1={};
        function getExpandTreeForUpdates1(data) {
            if (data.selected1) {
                obj1.folders.push({folder: data.path, recursive: false});
            }
            data.folders = orderBy(data.folders, 'name');
            angular.forEach(data.folders, function (value) {
                if (value.expanded || value.selected1)
                    getExpandTreeForUpdates1(value);
            });
        }

        vm.loadCalendar = function(flag) {
            vm.object.calendars=[];
            if(flag == 'remove'){
                vm.calendarFilters.filter.category = undefined;
            }
            obj1 = {folders: []};
            if (vm.calendarFilters.filter.type != 'ALL') {
                obj1.type = vm.calendarFilters.filter.type;
            }
            if(vm.calendarFilters.filter.category){
                obj1.categories = [];
                obj1.categories.push(vm.calendarFilters.filter.category);
            }
            vm.allCalendars = [];
            vm.loading = true;
            angular.forEach(vm.treeCalendar, function (value) {
                if (value.expanded || value.selected1)
                    getExpandTreeForUpdates1(value);
            });
            obj1.compact = true;
             obj1.jobschedulerId = vm.schedulerIds.selected;
            CalendarService.getListOfCalendars(obj1).then(function (res) {
                var data = res.calendars;
                angular.forEach(vm.treeCalendar, function (value) {
                    insertCalendar(value, data);
                });
                vm.loading = false;
            }, function () {
                vm.loading = false;
            });
        };
        var t1;

        function storeCalendar() {
            var obj = {};
             obj.jobschedulerId = vm.schedulerIds.selected;
            obj.calendar = vm.calendar.calendarObj;
            if(vm.calendar.create) {
                if (vm.calendar.path == '/') {
                    obj.calendar.path = '/' + vm.calendar.name;
                } else {
                    obj.calendar.path = vm.calendar.path + '/' + vm.calendar.name;
                }
            }else{
                obj.calendar.path = vm.calendar.path;
                obj.calendar.id = vm.calendar.id;
            }
            obj.calendar.title = vm.calendar.title;
            obj.calendar.category = vm.calendar.category;
            obj.calendar.type = vm.calendar.type;
            if(vm.calendar.from)
                obj.calendar.from = moment(vm.calendar.from).format('YYYY-MM-DD') ;
            if(vm.calendar.to)
                obj.calendar.to = moment(vm.calendar.to).format('YYYY-MM-DD');
            if (vm.comments.comment) {
                obj.auditLog = {};
                obj.auditLog.comment = vm.comments.comment;
            }
            if (vm.comments.timeSpent)
                obj.auditLog.timeSpent = vm.comments.timeSpent;
            if (vm.comments.ticketLink)
                obj.auditLog.ticketLink = vm.comments.ticketLink;

            CalendarService.storeCalendar(obj).then(function () {
                  initCalendarTree();
            });
        }
        $scope.$on('calendar-obj', function (event, data) {
            vm.calendar = data.calendar;
            storeCalendar();
        });
        vm.addCalendar = function () {

            vm.comments = {};
            vm.comments.radio = 'predefined';
            vm.calendar = {};
            vm.calendar.path = vm.folderFullPathC || '/';
            vm.calendar.type = 'WORKING_DAYS';
            vm.calendar.create = true;
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/set-calendar-dialog.html',
                controller: 'CalendarEditorDialogCtrl',
                scope: vm,
                size: 'lg',
                backdrop: 'static',
                windowClass: 'fade-modal'
            });
            t1 = $timeout(function(){
                vm.template = 'page1';
            },100);
        };

        vm.editCalendar = function (calendar) {

            CalendarService.getCalendar({
                id: calendar.id,
                jobschedulerId: vm.schedulerIds.selected
            }).then(function (res) {
                vm.calendar = res.calendar;
                vm.calendar.newPath = angular.copy(calendar.path);
                vm.comments = {};
                vm.comments.radio = 'predefined';

                vm.calendar.create = false;

                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/set-calendar-dialog.html',
                    controller: 'CalendarEditorDialogCtrl',
                    scope: vm,
                    size: 'lg',
                    backdrop: 'static',
                    windowClass: 'fade-modal'
                });
                t1 = $timeout(function () {
                    vm.template = 'page1';
                }, 100);
            });
            vm.object.calendars = [];
        };

        $scope.$on('copy-calendar',function (event, data) {
            vm.calendar = data.calendar;
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.calendar = vm.calendar.calendarObj;
            obj.calendar.path = vm.calendar.newPath;
            if (vm.calendar.title)
                obj.calendar.title = vm.calendar.title;
            if (vm.calendar.category)
                obj.calendar.category = vm.calendar.category;
            obj.calendar.type = vm.calendar.type;
            if (vm.calendar.from)
                obj.calendar.from = moment(vm.calendar.from).format('YYYY-MM-DD');
            if (vm.calendar.to)
                obj.calendar.to = moment(vm.calendar.to).format('YYYY-MM-DD');
            if (vm.comments.comment) {
                obj.auditLog = {};
                obj.auditLog.comment = vm.comments.comment;
            }
            if (vm.comments.timeSpent)
                obj.auditLog.timeSpent = vm.comments.timeSpent;
            if (vm.comments.ticketLink)
                obj.auditLog.ticketLink = vm.comments.ticketLink;

            CalendarService.saveAs(obj).then(function () {
                initCalendarTree();
            });
        });
        vm.showUsage = function(calendar){
            vm.calendar = angular.copy(calendar);
            CalendarService.calendarUsed({id: calendar.id,jobschedulerId : vm.schedulerIds.selected}).then(function (res) {
                    vm.calendar.usedIn = res;
                });
              var modalInstance1 = $uibModal.open({
                    templateUrl: 'modules/core/template/show-usage-calendar-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance1.result.then(function () {

                }, function () {

                });
        };

        function deleteCalendar(obj) {
            CalendarService.delete(obj).then(function () {
                initCalendarTree();
                vm.object.calendars=[];
            });
        }
        function deleteCalendarFn(obj, calendar) {
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.type = 'Calendar';
                vm.comments.operation = 'Delete';
                if (calendar) {
                    vm.comments.name = calendar.path;
                } else {
                    vm.comments.name = '';
                    angular.forEach(vm.object.calendars, function (value, index) {
                        if (index == vm.object.calendars.length - 1) {
                            vm.comments.name = vm.comments.name + ' ' + value.path;
                        } else {
                            vm.comments.name = value.path + ', ' + vm.comments.name;
                        }
                    });
                }
                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    obj.auditLog = {};
                    if (vm.comments.comment)
                        obj.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        obj.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        obj.auditLog.ticketLink = vm.comments.ticketLink;
                    deleteCalendar(obj);
                }, function () {

                });

            } else {
                var modalInstance1 = $uibModal.open({
                    templateUrl: 'modules/core/template/confirm-dialog.html',
                    controller: 'DialogCtrl1',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance1.result.then(function () {
                    deleteCalendar(obj);
                }, function () {

                });
            }
        }
        vm.deleteCalendar = function (calendar) {
            var obj = {};
             obj.jobschedulerId = vm.schedulerIds.selected;
            obj.calendarIds = [];
            if (calendar) {
                obj.calendarIds.push(calendar.id)
            } else {
                angular.forEach(vm.object.calendars, function (value) {
                    obj.calendarIds.push(value.id)
                });
            }
            vm.calendar = angular.copy(calendar);
            if (calendar) {
                vm.calendarArr = undefined;
                vm.calendar.delete = true;
                CalendarService.calendarUsed({id: vm.calendar.id,  jobschedulerId : vm.schedulerIds.selected}).then(function (res) {
                    vm.calendar.usedIn = res;

                });
            } else {

                vm.calendarArr = angular.copy(vm.object.calendars);
                angular.forEach(vm.calendarArr, function (value) {
                    CalendarService.calendarUsed({id: value.id, jobschedulerId : vm.schedulerIds.selected}).then(function (res) {
                        value.usedIn = res;
                    });
                });

            }
            deleteCalendarFn(obj,calendar);

        };

        vm.getTreeStructure = function () {
            ResourceService.tree({
                jobschedulerId: vm.schedulerIds.selected,
                compact: true,
                types: ["WORKINGDAYSCALENDAR","NONWORKINGDAYSCALENDAR"]
            }).then(function (res) {
                vm.filterTree1 = res.folders;

            }, function () {
                $('#treeModal').modal('hide');
                $('.fade-modal').css('opacity', '1');
            });

            $('#treeModal').modal('show');
            $('.fade-modal').css('opacity', '0.85');
        };
        vm.closeModal = function () {
            $('#treeModal').modal('hide');
            $('.fade-modal').css('opacity', '1');
        };
        vm.treeExpand = function (data) {
            vm.calendar.path = data.path;
            vm.calendar.newPath = data.path;
            $('#treeModal').modal('hide');
            $('.fade-modal').css('opacity', '1');
        };
        /** <<<<<<<<<<<<< End Calendar >>>>>>>>>>>>>>> */


        /** -----------------Begin Schedules------------------- */


        vm.allCheck = {
            checkbox: false
        };

        var watcher1 = $scope.$watchCollection('object.schedules', function (newNames) {
            if (newNames && newNames.length > 0) {
                vm.allCheck.checkbox = newNames.length == vm.allSchedules.slice((vm.userPreferences.entryPerPage * (vm.scheduleFilters.currentPage - 1)), (vm.userPreferences.entryPerPage * vm.scheduleFilters.currentPage)).length;
            } else {
                vm.allCheck.checkbox = false;
            }
        });

        var watcher3 = $scope.$watch('userPreferences.entryPerPage', function (newNames) {
            if (newNames)
                vm.object.schedules = [];
        });

        vm.checkAll = function () {
            if (vm.allCheck.checkbox && vm.allSchedules.length > 0) {
                vm.object.schedules = vm.allSchedules.slice((vm.userPreferences.entryPerPage * (vm.scheduleFilters.currentPage - 1)), (vm.userPreferences.entryPerPage * vm.scheduleFilters.currentPage));
            } else {
                vm.object.schedules = [];
            }
        };

        function createSchedule(schedule) {
            var schedules = {};
            schedules.jobschedulerId = $scope.schedulerIds.selected;
            if (vm.substituteObj.folder.lastIndexOf('/') != vm.substituteObj.folder.length - 1) {
                vm.substituteObj.folder = vm.substituteObj.folder + '/';
            }
            schedules.schedule = vm.substituteObj.folder + '' + vm.substituteObj.name;
            var x2js = new X2JS();

            var x = x2js.xml_str2json(schedule.runTime);
            x.schedule._substitute = vm.sch._substitute;
            schedules.runTime = x2js.json2xml_str(x).replace(/,/g, ' ');

            schedules.auditLog = {};
            if (vm.comments.comment) {
                schedules.auditLog.comment = vm.comments.comment;
            }

            if (vm.comments.timeSpent) {
                schedules.auditLog.timeSpent = vm.comments.timeSpent;
            }

            if (vm.comments.ticketLink) {
                schedules.auditLog.ticketLink = vm.comments.ticketLink;
            }

            ScheduleService.setRunTime(schedules);
        }

        vm.substitute = function (schedule) {
            vm.sch = {};
            vm.sch.folder = '/';
            vm.comments = {};
            vm.comments.radio = 'predefined';

            vm.sch._substitute = schedule.path;
            vm.schedule = schedule;
            vm.substituteObj = {};
            vm.substituteObj.showText = false;
            vm.substituteObj.folder = '/';
            vm.scheduleAction = undefined;


            ScheduleService.getRunTime({
                jobschedulerId: $scope.schedulerIds.selected,
                schedule: schedule.path
            }).then(function (res) {
                if (res.configuration) {
                    vm.runTimes = res.configuration;
                    vm.runTimes.content = vm.runTimes.content.xml;
                    vm.tempXML = vm.runTimes.content;
                }
                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/add-substitute-dialog.html',
                    controller: 'RuntimeEditorDialogCtrl',
                    scope: vm,
                    size: 'lg',
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    createSchedule(schedule);
                }, function () {

                });
            });

            ScheduleService.getSchedulesP({jobschedulerId: $scope.schedulerIds.selected}).then(function (result) {
                vm._schedules = [];
                angular.forEach(result.schedules, function (value) {
                    if (value && !value.substitute && value.path != schedule.path)
                        vm._schedules.push(value)
                });
            });
            vm.zones = moment.tz.names();
        };

        vm.substituteAll = function () {
            vm.comments = {};
            vm.comments.radio = 'predefined';
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
                vm.object.schedules = [];
            }, function () {
                vm.object.schedules = [];
            });
            ScheduleService.get({jobschedulerId: $scope.schedulerIds.selected}).then(function (result) {
                vm._schedules = result.schedules;

            });
        };

        vm.reset = function () {
            vm.object.schedules = [];
        };

        function setRunTime(schedule) {
            var schedules = {};
            schedules.jobschedulerId = $scope.schedulerIds.selected;
            schedules.schedule = schedule.path;
            schedules.runTime = vkbeautify.xmlmin(schedule.runTime);
            schedules.auditLog = {};
            if (vm.comments.comment) {
                schedules.auditLog.comment = vm.comments.comment;
            }

            if (vm.comments.timeSpent) {
                schedules.auditLog.timeSpent = vm.comments.timeSpent;
            }

            if (vm.comments.ticketLink) {
                schedules.auditLog.ticketLink = vm.comments.ticketLink;
            }

            ScheduleService.setRunTime(schedules).then(function () {
                for (var i = 0; i < vm.tree.length; i++) {
                    checkExpandTreeForUpdates(vm.tree[i]);
                }
            })
        }

        vm.editSchedule = function (schedule) {
            vm.comments = {};
            vm.comments.radio = 'predefined';
            vm.sch = {};
            vm.schedule = schedule;
            vm.sch._title = schedule.title;
            vm.scheduleAction = 'edit';

            ScheduleService.getRunTime({
                jobschedulerId: $scope.schedulerIds.selected,
                schedule: schedule.path
            }).then(function (res) {
                if (res.configuration) {
                    vm.runTimes = res.configuration;
                    vm.runTimes.content = vm.runTimes.content.xml;
                    vm.xml = vm.runTimes.content;
                }
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
            });
            ScheduleService.getSchedulesP({jobschedulerId: $scope.schedulerIds.selected}).then(function (result) {
                vm._schedules = [];
                angular.forEach(result.schedules, function (value) {
                    if (value && !value.substitute && value.path != schedule.path)
                        vm._schedules.push(value)
                });
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
               
                if ($rootScope.schedule_expand_to) {
                    vm.tree = angular.copy(res.folders);
                    filteredTreeData();
                } else {
                    if (vm.isEmpty(vm.scheduleFilters.expand_to)) {
                        vm.tree = angular.copy(res.folders);
                        filteredTreeData();
                    } else {
                        vm.scheduleFilters.expand_to = vm.recursiveTreeUpdate(angular.copy(res.folders), vm.scheduleFilters.expand_to, 'schedule');
                        vm.tree = vm.scheduleFilters.expand_to;
                        vm.changeState();
                    }
                }
                vm.scheduleFilters.expand_to = vm.tree;
                vm.isLoading = true;
            }, function () {
                vm.isLoading = true;
            });
        }


        function checkExpandTreeForUpdates(data) {
            if (data.selected1) {
                var obj = {};
                obj.jobschedulerId = vm.schedulerIds.selected;
                vm.folderPathS = data.name || '/';
                obj.folders = [{folder: data.path, recursive: false}];
                ScheduleService.getSchedulesP(obj).then(function (result) {
                    data.schedules = result.schedules;
                    volatileFolderData(data, obj);
                }, function (err) {
                    vm.loading = false;
                    volatileFolderData(data, obj);
                });
            }
            data.folders = orderBy(data.folders, 'name');
            angular.forEach(data.folders, function (value) {
                if (value.expanded || value.selected1)
                    checkExpandTreeForUpdates(value);
            });
        }


        function getExpandTreeForUpdates(data) {
            if (data.selected1) {
                obj.folders.push({folder: data.path, recursive: false});
            }
            data.folders = orderBy(data.folders, 'name');
            angular.forEach(data.folders, function (value) {
                if (value.expanded || value.selected1)
                    getExpandTreeForUpdates(value);
            });
        }

        function insertSchedules(node, x) {

            node.schedules = [];
            for (var i = 0; i < x.length; i++) {
                if (node.path == x[i].path.substring(0, x[i].path.lastIndexOf('/')) || node.path == x[i].path.substring(0, x[i].path.lastIndexOf('/') + 1)) {
                    x[i].path1 = node.path;
                    node.schedules.push(x[i]);
                    vm.allSchedules.push(x[i]);
                }
            }

            vm.folderPathS = node.name || '/';
            angular.forEach(node.folders, function (value) {
                if (value.expanded || value.selected1)
                    insertSchedules(value, x);
            });
        }

        var obj = {};
        vm.changeState = function () {
            obj = {folders: []};
            obj.jobschedulerId = vm.schedulerIds.selected;
            if (vm.scheduleFilters.filter.state != 'all') {
                obj.states = [];
                obj.states.push(vm.scheduleFilters.filter.state);
            }
            vm.allSchedules = [];
            vm.loading = true;
            angular.forEach(vm.tree, function (value) {
                if (value.expanded || value.selected1)
                    getExpandTreeForUpdates(value);
            });

            ScheduleService.getSchedulesP(obj).then(function (result) {
                ScheduleService.get(obj).then(function (res) {
                    var data1 = [];
                    if (result.schedules && result.schedules.length > 0) {
                        angular.forEach(result.schedules, function (schedule) {
                            for (var i = 0; i < res.schedules.length; i++) {
                                if (schedule.path == res.schedules[i].path) {
                                    schedule = angular.merge(schedule, res.schedules[i]);
                                    data1.push(schedule);
                                    break;
                                }
                            }
                        });

                    } else {
                        data1 = res.schedules;
                    }

                    angular.forEach(vm.tree, function (value) {
                        insertSchedules(value, data1);
                    });
                    vm.loading = false;
                }, function () {
                    ScheduleService.get(obj).then(function (res) {
                        angular.forEach(vm.tree, function (value) {
                            insertSchedules(value, res.schedules);
                        });
                        vm.loading = false;
                    })
                });
            }, function (err) {

            });
        };

        function filteredTreeData() {
            angular.forEach(vm.tree, function (value) {
                value.expanded = true;
                value.selected1 = true;
                vm.allSchedules = [];
                checkExpand(value);
            });
        }

        function volatileInformation(obj, expandNode) {
            if (vm.scheduleFilters.filter.state != 'all') {
                obj.states = [];
                obj.states.push(vm.scheduleFilters.filter.state);
            }
            ScheduleService.get(obj).then(function (res) {
                var data = [];
                if (vm.schedules.length > 0) {
                    angular.forEach(vm.schedules, function (schedule) {
                        for (var i = 0; i < res.schedules.length; i++) {
                            if (schedule.path == res.schedules[i].path) {
                                schedule = angular.merge(schedule, res.schedules[i]);
                                data.push(schedule);
                                break;
                            }
                        }
                    });
                    vm.schedules = data;
                } else {
                    vm.schedules = res.schedules;
                }

                if (expandNode) {
                    startTraverseNode(expandNode);
                }
                vm.loading = false;
            }, function () {
                vm.loading = false;
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
                volatileFolderData(data, obj);
            }, function (err) {
                vm.loading = false;
                volatileFolderData(data, obj);
            });
        }

        function expandFolderData1(data) {
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.folders = [{folder: data.path, recursive: false}];
            ScheduleService.getSchedulesP(obj).then(function (result) {
                data.schedules = result.schedules;
                volatileFolderData1(data, obj);
            }, function (err) {
                vm.loading = false;
                volatileFolderData1(data, obj);
            });
        }

        function volatileFolderData(data, obj) {
            if (vm.scheduleFilters.filter.state != 'all') {
                obj.states = [];
                obj.states.push(vm.scheduleFilters.filter.state);
            }
            ScheduleService.get(obj).then(function (res) {
                var data1 = [];
                if (data.schedules && data.schedules.length > 0) {
                    if (res.schedules.length > 0) {
                        angular.forEach(data.schedules, function (schedule) {
                            for (var i = 0; i < res.schedules.length; i++) {
                                if (schedule.path == res.schedules[i].path) {
                                    schedule = angular.merge(schedule, res.schedules[i]);
                                    data1.push(schedule);
                                    res.schedules.splice(i, 1);
                                    break;
                                }
                            }
                        });
                        data1 = data1.concat(res.schedules);
                        data.schedules = data1;
                    }
                } else {
                    data.schedules = res.schedules;
                }

                if (data.schedules.length > 0) {
                    angular.forEach(data.schedules, function (value) {
                        var flag = true;
                        value.path1 = data.path;

                        angular.forEach(vm.allSchedules, function (value1) {
                            if (value.path == value1.path) {
                                flag = false;
                            }
                        });
                        if (flag)
                            vm.allSchedules.push(value);
                    });
                }
                vm.folderPathS = data.name || '/';

                vm.loading = false;
            }, function () {
                if (data.schedules.length > 0) {
                    angular.forEach(data.schedules, function (value) {
                        var flag = true;
                        value.path1 = data.path;

                        angular.forEach(vm.allSchedules, function (value1) {
                            if (value.path == value1.path) {
                                flag = false;
                            }
                        });
                        if (flag)
                            vm.allSchedules.push(value);
                    });
                }
                vm.folderPathS = data.name || '/';

                vm.loading = false;
            });
        }

        function volatileFolderData1(data, obj) {
            if (vm.scheduleFilters.filter.state != 'all') {
                obj.states = [];
                obj.states.push(vm.scheduleFilters.filter.state);
            }
            ScheduleService.get(obj).then(function (res) {
                var data1 = [];
                if (data.schedules.length > 0) {
                    if (res.schedules.length > 0) {
                        angular.forEach(data.schedules, function (schedule) {
                            for (var i = 0; i < res.schedules.length; i++) {
                                if (schedule.path == res.schedules[i].path) {
                                    schedule = angular.merge(schedule, res.schedules[i]);
                                    data1.push(schedule);
                                    res.schedules.splice(i, 1);
                                    break;
                                }
                            }
                        });
                        data1 = data1.concat(res.schedules);
                        data.schedules = data1;
                    }
                } else {
                    data.schedules = res.schedules;
                }

                var temp = [];
                if (data.schedules.length > 0) {

                    for (var x = 0; x < vm.allSchedules.length; x++) {
                        if (vm.allSchedules[x].path1 != data.path) {
                            temp.push(vm.allSchedules[x]);
                        }
                    }
                    angular.forEach(data.schedules, function (value) {
                        value.path1 = data.path;
                        temp.push(value);
                    });
                }
                vm.allSchedules = temp;

                vm.folderPathS = data.name || '/';

                vm.loading = false;
            }, function () {
                var temp = [];
                if (data.schedules.length > 0) {

                    for (var x = 0; x < vm.allSchedules.length; x++) {
                        if (vm.allSchedules[x].path1 != data.path) {
                            temp.push(vm.allSchedules[x]);
                        }
                    }
                    angular.forEach(data.schedules, function (value) {
                        value.path1 = data.path;
                        temp.push(value);
                    });
                }
                vm.allSchedules = temp;
                vm.folderPathS = data.name || '/';

                vm.loading = false;
            });
        }

        vm.treeHandler1 = function (data) {
            if (data.expanded) {
                data.folders = orderBy(data.folders, 'name');
            }
        };

        vm.treeHandler = function (data) {
            vm.reset();
            navFullTree();
            data.selected1 = true;
            data.folders = orderBy(data.folders, 'name');
            data.schedules = [];
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
            vm.loading = true;
            vm.reset();
            navFullTree();
            vm.allSchedules = [];

            vm.folderPathS = data.name || '/';
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.folders = [];
            obj.folders.push({folder: data.path, recursive: true});
            ScheduleService.getSchedulesP(obj).then(function (result) {
                vm.schedules = result.schedules;
                volatileInformation(obj, data);
            }, function () {
                volatileInformation(obj, data);
                vm.loading = false;
            });
        };

        function startTraverseNode(data) {
            vm.allSchedules = [];
            function recursive(data) {
                data.expanded = true;
                data.folders = orderBy(data.folders, 'name');
                data.schedules = [];
                angular.forEach(vm.schedules, function (value) {
                    if (data.path == value.path.substring(0, value.path.lastIndexOf('/')) || data.path == value.path.substring(0, value.path.lastIndexOf('/') + 1)) {
                        data.schedules.push(value);
                        value.path1 = data.path;
                        vm.allSchedules.push(value);
                    }
                });
                data.selected1 = true;
                angular.forEach(data.folders, function (a) {
                    recursive(a);
                });
            }

            recursive(data);
        }

        function checkExpand(data) {
            if (data.selected1) {
                data.schedules = [];
                expandFolderData(data);
                vm.folderPathS = data.name || '/';
                angular.forEach(data.schedules, function (value) {
                    value.path1 = data.path;
                    vm.allSchedules.push(value);
                });
            }
            data.folders = orderBy(data.folders, 'name');
            angular.forEach(data.folders, function (value) {
                if ($rootScope.schedule_expand_to && $rootScope.schedule_expand_to.path.indexOf(value.path) != -1) {
                    value.expanded = true;
                }
                if ($rootScope.schedule_expand_to && $rootScope.schedule_expand_to.path == value.path) {
                    value.selected1 = true;
                    $rootScope.schedule_expand_to = undefined;
                }
                checkExpand(value);
                if (value.expanded || value.selected1) {
                    if (data.path == '/') {
                        data.selected1 = false;
                    }
                }
            });
        }

        vm.expandDetails = function () {
            if (vm.resourceFilters.state == 'schedules') {
                angular.forEach(vm.allSchedules, function (value, index) {
                    value.show = true;
                });
            } else if (vm.resourceFilters.state == 'agent') {
                angular.forEach(vm.allAgentClusters, function (value, index) {
                    value.show = true;
                });
            } else if (vm.resourceFilters.state == 'processClass') {
                angular.forEach(vm.allProcessClasses, function (value, index) {
                    value.show = true;
                });
            }
        };

        vm.collapseDetails = function () {
            if (vm.resourceFilters.state == 'schedules') {
                angular.forEach(vm.allSchedules, function (value, index) {
                    value.show = false;
                });
            } else if (vm.resourceFilters.state == 'agent') {
                angular.forEach(vm.allAgentClusters, function (value, index) {
                    value.show = false;
                });
            } else if (vm.resourceFilters.state == 'processClass') {
                angular.forEach(vm.allProcessClasses, function (value, index) {
                    value.show = false;
                });
            }
        };

        function recursiveSort(tree) {
            function recursive(data) {
                data.folders = orderBy(data.folders, 'name');
                angular.forEach(data.folders, function (value) {
                    recursive(value);
                });
            }

            angular.forEach(tree, function (value) {
                recursive(value);
            });
        }

        $scope.$on('event-started', function () {
            if (vm.events && vm.events[0] && vm.events[0].eventSnapshots)
                angular.forEach(vm.events[0].eventSnapshots, function (event) {
                    if (event.eventType == "FileBasedActivated" || event.eventType == "FileBasedRemoved") {
                        if (vm.resourceFilters.state == 'lock' && event.objectType == 'LOCK') {
                            ResourceService.tree({
                                jobschedulerId: vm.schedulerIds.selected,
                                compact: true,
                                types: ['LOCK']
                            }).then(function (res) {
                                vm.locksFilters.expand_to = vm.recursiveTreeUpdate(angular.copy(res.folders), vm.locksFilters.expand_to, 'lock');
                                vm.treeLock = vm.locksFilters.expand_to;
                                recursiveSort(vm.treeLock);
                            });

                            var path = event.path;

                            if (vm.allLocks && vm.allLocks.length > 0) {
                                for (var j = 0; j < vm.allLocks.length; j++) {
                                    if (path.substring(0, path.lastIndexOf('/')) == vm.allLocks[j].path.substring(0, vm.allLocks[j].path.lastIndexOf('/'))) {
                                        navFullTreeForUpdateLock(path.substring(0, path.lastIndexOf('/')));
                                        break;
                                    }
                                }
                            } else {
                                vm.allLocks = [];
                                navFullTreeForUpdateLock(path.substring(0, path.lastIndexOf('/')));
                            }
                        }
                        else if (vm.resourceFilters.state == 'processClass' && event.objectType == 'PROCESSCLASS') {
                            ResourceService.tree({
                                jobschedulerId: vm.schedulerIds.selected,
                                compact: true,
                                types: ['PROCESSCLASS']
                            }).then(function (res) {

                                vm.processFilters.expand_to = vm.recursiveTreeUpdate(angular.copy(res.folders), vm.processFilters.expand_to, 'processClass');
                                vm.treeProcess = vm.processFilters.expand_to;
                                recursiveSort(vm.treeProcess);
                            });

                            var path = event.path;

                            if (vm.allProcessClasses.length > 0) {
                                for (var j = 0; j < vm.allProcessClasses.length; j++) {
                                    if (path.substring(0, path.lastIndexOf('/')) == vm.allProcessClasses[j].path.substring(0, vm.allProcessClasses[j].path.lastIndexOf('/'))) {
                                        navFullTreeForUpdateProcess(path.substring(0, path.lastIndexOf('/')));
                                        break;
                                    }
                                }
                            } else {
                                navFullTreeForUpdateProcess(path.substring(0, path.lastIndexOf('/')));
                            }
                        } else if (vm.resourceFilters.state == 'schedules' && event.objectType == 'SCHEDULE') {
                            ResourceService.tree({
                                jobschedulerId: vm.schedulerIds.selected,
                                compact: true,
                                types: ['SCHEDULE']
                            }).then(function (res) {
                                vm.scheduleFilters.expand_to = vm.recursiveTreeUpdate(angular.copy(res.folders), vm.scheduleFilters.expand_to, 'schedule');
                                vm.tree = vm.scheduleFilters.expand_to;
                                recursiveSort(vm.tree);
                            });

                            var path = event.path;

                            if (vm.allSchedules.length > 0) {
                                for (var j = 0; j < vm.allSchedules.length; j++) {
                                    if (path.substring(0, path.lastIndexOf('/')) == vm.allSchedules[j].path.substring(0, vm.allSchedules[j].path.lastIndexOf('/'))) {
                                        navFullTreeForUpdateSchedule(path.substring(0, path.lastIndexOf('/')));
                                        break;
                                    }
                                }
                            } else {
                                navFullTreeForUpdateSchedule(path.substring(0, path.lastIndexOf('/')));
                            }

                        } else if (vm.resourceFilters.state == 'agent' && event.objectType == 'PROCESSCLASS') {
                            ResourceService.tree({
                                jobschedulerId: vm.schedulerIds.selected,
                                compact: true,
                                types: ['AGENTCLUSTER']
                            }).then(function (res) {
                                vm.agentsFilters.expand_to = vm.recursiveTreeUpdate(angular.copy(res.folders), vm.agentsFilters.expand_to, 'agent');
                                vm.treeAgent = vm.agentsFilters.expand_to;
                                recursiveSort(vm.treeAgent);
                            });

                            vm.pollAgents();
                        }
                    }
                    if (event.eventType == "JobStateChanged" && vm.resourceFilters.state == 'processClass') {
                        if (vm.allProcessClasses && vm.allProcessClasses.length > 0) {
                            var obj = {};
                            obj.jobschedulerId = $scope.schedulerIds.selected;
                            obj.folders = [{
                                folder: vm.allProcessClasses[0].path.substring(0, vm.allProcessClasses[0].path.lastIndexOf('/')),
                                recursive: false
                            }];
                            ResourceService.getProcessClass(obj).then(function (res) {
                                if (res.processClasses) {
                                    angular.forEach(res.processClasses, function (value1, index1) {
                                        angular.forEach(vm.allProcessClasses, function (value2, index2) {
                                            if (value1.path == value2.path) {
                                                vm.allProcessClasses[index2].processes = value1.processes;
                                                vm.allProcessClasses[index2].numOfProcesses = value1.numOfProcesses;
                                            }
                                        })

                                    })
                                }
                            });
                        }

                    } else if (event.eventType == "JobStateChanged" && vm.resourceFilters.state == 'lock') {
                        angular.forEach(vm.allLocks, function (value2, index) {
                            if (event.path != undefined) {
                                if (value2.path == event.path) {
                                    var obj = {};
                                    obj.jobschedulerId = $scope.schedulerIds.selected;
                                    obj.folders = [{folder: value2.path, recursive: false}];
                                    ResourceService.get(obj).then(function (res) {
                                        if (res.locks) {
                                            vm.allLocks[index] = angular.merge(vm.allLocks[index], res.locks[0]);
                                        }
                                    });
                                }
                            }
                        });
                    }
                });
        });

        function navFullTreeForUpdateSchedule(path) {
            for (var i = 0; i < vm.tree.length; i++) {
                if (vm.tree[i].path != path) {
                    traverseTreeForUpdateSchedule(vm.tree[i], path);
                } else {
                    if (vm.tree[i].selected1)
                        expandFolderData1(vm.tree[i]);
                    break;
                }
            }
        }

        function traverseTreeForUpdateSchedule(data, path) {
            if (data.folders)
                for (var i = 0; i < data.folders.length; i++) {
                    if (data.folders[i].path != path) {
                        traverseTreeForUpdateSchedule(data.folders[i], path);
                    } else {
                        if (data.folders[i].selected1)
                            expandFolderData1(data.folders[i]);
                        break;
                    }
                }
        }

        function navFullTreeForUpdateLock(path) {
            for (var i = 0; i < vm.treeLock.length; i++) {
                if (vm.treeLock[i].path != path) {
                    traverseTreeForUpdateLock(vm.treeLock[i], path);
                } else {
                    if (vm.treeLock[i].selected1)
                        expandFolderDataL1(vm.treeLock[i]);
                    break;
                }
            }
        }

        function traverseTreeForUpdateLock(data, path) {
            if (data.folders)
                for (var i = 0; i < data.folders.length; i++) {
                    if (data.folders[i].path != path) {
                        traverseTreeForUpdateLock(data.folders[i], path);
                    } else {
                        if (data.folders[i].selected1)
                            expandFolderDataL1(data.folders[i]);
                        break;
                    }
                }
        }

        function navFullTreeForUpdateProcess(path) {
            for (var i = 0; i < vm.treeProcess.length; i++) {
                if (vm.treeProcess[i].path != path) {
                    traverseTreeForUpdateProcess(vm.treeProcess[i], path);
                } else {
                    if (vm.treeProcess[i].selected1)
                        expandFolderDataP1(vm.treeProcess[i]);
                    break;
                }
            }
        }

        function traverseTreeForUpdateProcess(data, path) {
            if (data.folders)
                for (var i = 0; i < data.folders.length; i++) {
                    if (data.folders[i].path != path) {
                        traverseTreeForUpdateProcess(data.folders[i], path);
                    } else {
                        if (data.folders[i].selected1)
                            expandFolderDataP1(data.folders[i]);
                        break;
                    }
                }
        }


        /** -----------------End Schedules------------------- */

        $scope.$on('$stateChangeSuccess', function (event, toState, toParams) {
            var views = {};
            if ($window.localStorage.views)
                views = JSON.parse($window.localStorage.views);
            if (toState.name == 'app.resources.agentClusters') {
                vm.resourceFilters.state = 'agent';
                vm.pageView = views.agent;
                if (toParams.type && toParams.type != 'all')
                    vm.agentsFilters.filter.state = toParams.type == 'healthy' ? '0' : toParams.type == 'unhealthy' ? '1' : '2';
                vm.treeAgent = [];
                initAgentTree(toParams.type);
            } else if (toState.name == 'app.resources.locks') {
                vm.pageView = views.lock;
                vm.resourceFilters.state = 'lock';
                vm.treeLock = [];
                initLockTree();
            } else if (toState.name == 'app.resources.processClasses') {
                vm.pageView = views.processClass;
                vm.resourceFilters.state = 'processClass';
                vm.treeProcess = [];
                initProccessTree();
            } else if (toState.name == 'app.resources.schedules') {
                vm.pageView = views.schedule;
                vm.resourceFilters.state = 'schedules';
                vm.tree = [];
                initTree();
            } else if (toState.name == 'app.resources.calendars') {
                vm.pageView = views.calendar || vm.userPreferences.pageView || 'grid';
                vm.resourceFilters.state = 'calendars';
                vm.treeCalendar = [];
                initCalendarTree();
            }
            startPolling();
        });

        var interval1, interval2;

        function poll1() {
            interval1 = $interval(function () {
                vm.pollAgents();
            }, 30 * 1000)
        }

        function poll2() {
            interval2 = $interval(function () {
                for (var i = 0; i < vm.tree.length; i++) {
                    checkExpandTreeForUpdates(vm.tree[i]);
                }
            }, 30 * 1000)
        }

        function startPolling() {
            $interval.cancel(interval1);
            $interval.cancel(interval2);
            if (vm.resourceFilters.state == 'agent') {
                poll1();
            } else if (vm.resourceFilters.state == 'schedules') {
                poll2();
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
            watcher3();
            watcher4();
            $interval.cancel(interval1);
            $interval.cancel(interval2);
            $timeout.cancel(t1);

        });
    }

    ResourceInfoCtrl.$inject = ['$scope', '$stateParams', '$state', 'ResourceService', 'ScheduleService', 'JobSchedulerService', '$uibModal', 'TaskService','CalendarService','$timeout'];
    function ResourceInfoCtrl($scope, $stateParams, $state, ResourceService, ScheduleService, JobSchedulerService, $uibModal, TaskService,CalendarService, $timeout) {
        var vm = $scope;
        if ($state.current.name != 'app.calendar')
            vm.checkSchedulerId();
        load();

        function load() {

            if ($state.current.name == 'app.agentCluster') {
                getAgentCluster();
            } else if ($state.current.name == 'app.lock') {
                getLock();
            } else if ($state.current.name == 'app.processClass') {
                getProcessClass();
            } else if ($state.current.name == 'app.schedule') {
                getSchedule();
            } else if ($state.current.name == 'app.calendar') {
                getCalendar();
            }
        }

        vm.showRunningProcesses = function (processClass) {
            processClass.show = true;
        };

        vm.hideRunningProcesses = function (processClass) {
            processClass.show = false;
        };

        function getAgentCluster() {
            vm.agentClusters = [];

            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.agentClusters = [{agentCluster: $stateParams.path}];
            JobSchedulerService.getAgentCluster(obj).then(function (result) {
                vm.agentClusters = result.agentClusters;
                vm.isLoading = true;
            }, function () {
                vm.isLoading = true;
            });
        }

        vm.showAgents = function (cluster) {
            cluster.show = true;
        };
        vm.hideAgents = function (cluster) {
            cluster.show = false;
        };

        function volatileInformationL(obj) {
            ResourceService.get(obj).then(function (res) {
                if (vm.locks.length > 0) {
                    vm.lock = angular.merge(vm.locks, res.locks);
                } else {
                    vm.locks = res.locks;
                }

                vm.isLoading = true;
            }, function () {
                vm.isLoading = true;
            });
        }


        function getLock() {
            vm.locks = [];
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.locks = [{lock: $stateParams.path}];
            ResourceService.getLocksP(obj).then(function (result) {
                vm.locks = result.locks;
                volatileInformationL(obj);
                vm.isLoading = true;
            }, function () {
                volatileInformationL(obj);

            });
        }

        function volatileInformationS() {
            ScheduleService.getSchedule($stateParams.path, vm.schedulerIds.selected).then(function (res) {
                if (vm.scheudule) {
                    var schedule = angular.merge(vm.scheudule, res.scheudule);
                    vm.allSchedules.push(schedule);
                } else {
                    vm.allSchedules.push(res.scheudule);
                }

                vm.isLoading = true;
            }, function () {
                vm.isLoading = true;
            });
        }


        function getSchedule() {
            vm.allSchedules = [];
            ScheduleService.getScheduleP($stateParams.path, vm.schedulerIds.selected).then(function (result) {
                vm.scheudule = result.schedule;
                volatileInformationS();
                vm.isLoading = true;
            }, function () {
                volatileInformationS();
            });
        }


        function volatileInformationP(obj) {
            ResourceService.getProcessClass(obj).then(function (res) {
                if (vm.processClasses.length > 0) {
                    var processClass = angular.merge(vm.processClasses[0], res.processClasses[0]);
                    vm.allProcessClasses.push(processClass);
                } else {
                    vm.allProcessClasses.push(res.processClasses);
                }

                vm.isLoading = true;
            }, function () {
                vm.allProcessClasses.push(vm.processClasses[0]);
                vm.isLoading = true;
            });
        }


        function getProcessClass() {
            vm.allProcessClasses = [];

            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.processClasses = [{processClass: $stateParams.path}];
            ResourceService.getProcessClassP(obj).then(function (result) {
                vm.processClasses = result.processClasses;
                volatileInformationP(obj);
                vm.isLoading = true;
            }, function () {
                volatileInformationP(obj);
            });
        }

        vm.showProcesses = function (processClass) {
            vm.processClass = processClass;
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/process-list-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                size: 'lg'
            });
        };

        function createSchedule(schedule) {
            var schedules = {};
            schedules.jobschedulerId = $scope.schedulerIds.selected;
            if (vm.substituteObj.folder.lastIndexOf('/') != vm.substituteObj.folder.length - 1) {
                vm.substituteObj.folder = vm.substituteObj.folder + '/';
            }
            schedules.schedule = vm.substituteObj.folder + '' + vm.substituteObj.name;
            var x2js = new X2JS();

            var x = x2js.xml_str2json(schedule.runTime);
            x.schedule._substitute = vm.sch._substitute;
            schedules.runTime = x2js.json2xml_str(x).replace(/,/g, ' ');

            schedules.auditLog = {};
            if (vm.comments.comment) {
                schedules.auditLog.comment = vm.comments.comment;
            }

            if (vm.comments.timeSpent) {
                schedules.auditLog.timeSpent = vm.comments.timeSpent;
            }

            if (vm.comments.ticketLink) {
                schedules.auditLog.ticketLink = vm.comments.ticketLink;
            }

            ScheduleService.setRunTime(schedules);
        }

        vm.substitute = function (schedule) {
            vm.sch = {};
            vm.sch.folder = '/';
            vm.comments = {};
            vm.comments.radio = 'predefined';

            vm.sch._substitute = schedule.path;
            vm.schedule = schedule;
            vm.substituteObj = {};
            vm.substituteObj.showText = false;
            vm.substituteObj.folder = '/';
            vm.scheduleAction = undefined;


            ScheduleService.getRunTime({
                jobschedulerId: $scope.schedulerIds.selected,
                schedule: schedule.path
            }).then(function (res) {
                if (res.configuration) {
                    vm.runTimes = res.configuration;
                    vm.runTimes.content = vm.runTimes.content.xml;
                    vm.tempXML = vm.runTimes.content;
                }

                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/add-substitute-dialog.html',
                    controller: 'RuntimeEditorDialogCtrl',
                    scope: vm,
                    size: 'lg',
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    createSchedule(schedule);
                }, function () {

                });
            });

            ScheduleService.getSchedulesP({jobschedulerId: $scope.schedulerIds.selected}).then(function (result) {
                vm._schedules = [];
                angular.forEach(result.schedules, function (value) {
                    if (value && !value.substitute && value.path != schedule.path)
                        vm._schedules.push(value)
                });
            });
            vm.zones = moment.tz.names();
        };

        function setRunTime(schedule) {
            var schedules = {};
            schedules.jobschedulerId = $scope.schedulerIds.selected;
            schedules.schedule = schedule.path;
            schedules.runTime = vkbeautify.xmlmin(schedule.runTime);
            schedules.auditLog = {};
            if (vm.comments.comment) {
                schedules.auditLog.comment = vm.comments.comment;
            }

            if (vm.comments.timeSpent) {
                schedules.auditLog.timeSpent = vm.comments.timeSpent;
            }

            if (vm.comments.ticketLink) {
                schedules.auditLog.ticketLink = vm.comments.ticketLink;
            }

            ScheduleService.setRunTime(schedules);
        }

        vm.editSchedule = function (schedule) {
            vm.comments = {};
            vm.comments.radio = 'predefined';
            vm.sch = {};
            vm.schedule = schedule;
            vm.sch._title = schedule.title;
            vm.scheduleAction = 'edit';

            ScheduleService.getRunTime({
                jobschedulerId: $scope.schedulerIds.selected,
                schedule: schedule.path
            }).then(function (res) {
                if (res.configuration) {
                    vm.runTimes = res.configuration;
                    vm.runTimes.content = vm.runTimes.content.xml;
                    vm.xml = vm.runTimes.content;
                }

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

                });
            });
            ScheduleService.getSchedulesP({jobschedulerId: $scope.schedulerIds.selected}).then(function (result) {
                vm._schedules = [];
                angular.forEach(result.schedules, function (value) {
                    if (value && !value.substitute && value.path != schedule.path)
                        vm._schedules.push(value)
                });
            });
            vm.zones = moment.tz.names();
        };

        function terminateTaskWithTimeout(task, path) {
            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            var taskIds = [];
            taskIds.push({taskId: task.taskId});
            jobs.jobs.push({job: path, taskIds: taskIds});

            jobs.auditLog = {};
            if (vm.comments.comment) {
                jobs.auditLog.comment = vm.comments.comment;
            }
            if (vm.comments.timeSpent) {
                jobs.auditLog.timeSpent = vm.comments.timeSpent;
            }

            if (vm.comments.ticketLink) {
                jobs.auditLog.ticketLink = vm.comments.ticketLink;
            }

            jobs.timeout = vm.timeout;
            TaskService.terminateWith(jobs);

        }

        vm.terminateTaskWithTimeout = function (task, path) {
            if (task && path) {
                vm.task = task;
                vm.path = path;
            }

            vm.timeout = 10;
            vm.comments = {};
            vm.comments.radio = 'predefined';
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/terminate-task-timeout-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                terminateTaskWithTimeout(task, path);
            }, function () {

            });

        };

        function getCalendar() {
            vm.allCalendars = [];
            var obj = {};
            obj.calendars = [$stateParams.path];
            obj.compact = true;
            obj.jobschedulerId = vm.schedulerIds.selected;
            CalendarService.getListOfCalendars(obj).then(function (res) {
                vm.allCalendars = res.calendars;
                vm.isLoading = true;
            }, function () {
                vm.isLoading = true;
            });
        }

        vm.filter_tree = {};
        vm.filterTree1 = [];
        vm.expanding_property = {
            field: "name"
        };
        vm.getTreeStructure = function () {
            ResourceService.tree({
                jobschedulerId: vm.schedulerIds.selected,
                compact: true
            }).then(function (res) {
                vm.filterTree1 = res.folders;

            }, function () {
                $('#treeModal').modal('hide');
                $('.fade-modal').css('opacity', '1');
            });

            $('#treeModal').modal('show');
            $('.fade-modal').css('opacity', '0.85');
        };
        vm.closeModal = function () {
            $('#treeModal').modal('hide');
            $('.fade-modal').css('opacity', '1');
        };
        vm.treeExpand = function (data) {
            vm.calendar.path = data.path;
            vm.calendar.newPath = data.path;
            $('#treeModal').modal('hide');
            $('.fade-modal').css('opacity', '1');
        };

        var t1;

        function storeCalendar() {
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.calendar = vm.calendar.calendarObj;
            if (vm.calendar.create) {
                if (vm.calendar.path == '/') {
                    obj.calendar.path = '/' + vm.calendar.name;
                } else {
                    obj.calendar.path = vm.calendar.path + '/' + vm.calendar.name;
                }
            } else {
                obj.calendar.path = vm.calendar.path;
                obj.calendar.id = vm.calendar.id;
            }
            obj.calendar.title = vm.calendar.title;
            obj.calendar.category = vm.calendar.category;
            obj.calendar.type = vm.calendar.type;
            if (vm.calendar.from)
                obj.calendar.from = moment(vm.calendar.from).format('YYYY-MM-DD');
            if (vm.calendar.to)
                obj.calendar.to = moment(vm.calendar.to).format('YYYY-MM-DD');
            if (vm.comments.comment) {
                obj.auditLog = {};
                obj.auditLog.comment = vm.comments.comment;
            }
            if (vm.comments.timeSpent)
                obj.auditLog.timeSpent = vm.comments.timeSpent;
            if (vm.comments.ticketLink)
                obj.auditLog.ticketLink = vm.comments.ticketLink;

            CalendarService.storeCalendar(obj).then(function () {

            });
        }

        $scope.$on('calendar-obj', function (event, data) {
            vm.calendar = data.calendar;
            storeCalendar();
        });

        vm.editCalendar = function (calendar) {

            CalendarService.getCalendar({
                id: calendar.id,
                jobschedulerId: vm.schedulerIds.selected
            }).then(function (res) {
                vm.calendar = res.calendar;
                vm.calendar.newPath = angular.copy(calendar.path);
                vm.comments = {};
                vm.comments.radio = 'predefined';

                vm.calendar.create = false;

                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/set-calendar-dialog.html',
                    controller: 'CalendarEditorDialogCtrl',
                    scope: vm,
                    size: 'lg',
                    backdrop: 'static',
                    windowClass: 'fade-modal'
                });
                t1 = $timeout(function () {
                    vm.template = 'page1';
                }, 100);
            });

        };

        $scope.$on('copy-calendar', function (event, data) {
            vm.calendar = data.calendar;
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.calendar = vm.calendar.calendarObj;
            obj.calendar.path = vm.calendar.newPath;
            if (vm.calendar.title)
                obj.calendar.title = vm.calendar.title;
            if (vm.calendar.category)
                obj.calendar.category = vm.calendar.category;
            obj.calendar.type = vm.calendar.type;
            if (vm.calendar.from)
                obj.calendar.from = moment(vm.calendar.from).format('YYYY-MM-DD');
            if (vm.calendar.to)
                obj.calendar.to = moment(vm.calendar.to).format('YYYY-MM-DD');
            if (vm.comments.comment) {
                obj.auditLog = {};
                obj.auditLog.comment = vm.comments.comment;
            }
            if (vm.comments.timeSpent)
                obj.auditLog.timeSpent = vm.comments.timeSpent;
            if (vm.comments.ticketLink)
                obj.auditLog.ticketLink = vm.comments.ticketLink;

            CalendarService.saveAs(obj).then(function () {

            });
        });
        vm.showUsage = function (calendar) {
            vm.calendar = angular.copy(calendar);
            CalendarService.calendarUsed({
                id: calendar.id,
                jobschedulerId: vm.schedulerIds.selected
            }).then(function (res) {
                vm.calendar.usedIn = res;
            });
            var modalInstance1 = $uibModal.open({
                templateUrl: 'modules/core/template/show-usage-calendar-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                backdrop: 'static'
            });
            modalInstance1.result.then(function () {

            }, function () {

            });
        };

        function deleteCalendar(obj) {
            CalendarService.delete(obj).then(function () {

            });
        }

        function deleteCalendarFn(obj, calendar) {
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.type = 'Calendar';
                vm.comments.operation = 'Delete';
                vm.comments.name = calendar.path;

                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    obj.auditLog = {};
                    if (vm.comments.comment)
                        obj.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        obj.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        obj.auditLog.ticketLink = vm.comments.ticketLink;
                    deleteCalendar(obj);
                }, function () {

                });

            } else {
                var modalInstance1 = $uibModal.open({
                    templateUrl: 'modules/core/template/confirm-dialog.html',
                    controller: 'DialogCtrl1',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance1.result.then(function () {
                    deleteCalendar(obj);
                }, function () {

                });
            }
        }

        vm.deleteCalendar = function (calendar) {
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.calendarIds = [];

            obj.calendarIds.push(calendar.id);

            vm.calendar = angular.copy(calendar);

            vm.calendar.delete = true;
            CalendarService.calendarUsed({
                id: vm.calendar.id,
                jobschedulerId: vm.schedulerIds.selected
            }).then(function (res) {
                vm.calendar.usedIn = res;
            });

            deleteCalendarFn(obj, calendar);
        };

        $scope.$on('$destroy', function () {
            $timeout.cancel(t1);
        });
    }


    DashboardCtrl.$inject = ['$scope', 'OrderService', 'JobSchedulerService', 'ResourceService', 'gettextCatalog', '$state', '$uibModal', 'DailyPlanService', '$rootScope', '$timeout', 'CoreService', 'SOSAuth', 'FileSaver', "$interval","UserService","$window","YadeService"];
    function DashboardCtrl($scope, OrderService, JobSchedulerService, ResourceService, gettextCatalog, $state, $uibModal, DailyPlanService, $rootScope, $timeout, CoreService, SOSAuth, FileSaver, $interval,UserService,$window,YadeService) {
        var vm = $scope;
        vm.loadingImg = true;
        var isDragging = false;
        vm.gridsterOpts = {
            resizable: {
                resize: function () {
                    isDragging = true;
                },
                stop: function () {
                    setWidgetPreference();
                     isDragging = false;
                }
            },
            draggable: {
                drag: function () {
                    isDragging = true;
                },
                stop: function () {
                   setWidgetPreference();
                    isDragging = false;
                }
            }
        };

        vm.isAgentClusterVisible = true;
        vm.isRunningAgentVisible = true;
        vm.isMasterClusterVisible = true;
        vm.isOrderOverviewVisible = true;
        vm.isOrderSummaryVisible = true;
        vm.isFileOverviewVisible = true;
        vm.isFileSummaryVisible = true;
        vm.isDailPlanVisible = true;

        vm.dashboard = {widgets: []};
        function initWidgets() {
            if (vm.userPreferences.dashboard) {
                vm.dashboardLayout = vm.userPreferences.dashboard;
            } else {
                vm.dashboardLayout = [{
                    row: 0,
                    col: 0,
                    sizeX: 2,
                    sizeY: 1,
                    name: "agentClusterStatus",
                    visible: true,
                    message: 'Pie chart help to identify agents status'
                }, {
                    row: 1,
                    col: 0,
                    sizeX: 2,
                    sizeY: 1,
                    name: "agentClusterRunningTasks",
                    visible: true,
                    message: 'Bar chart help to identify running task on agents'
                }, {
                    row: 0,
                    col: 2,
                    sizeX: 4,
                    sizeY: 2,
                    name: "masterClusterStatus",
                    visible: true,
                    message: 'Flow chart help to identify status of cluster'
                }, {
                    row: 2,
                    col: 0,
                    sizeX: 4,
                    sizeY: 1,
                    name: "ordersOverview",
                    visible: true,
                    message: 'This widget help to identify the orders overview'
                }, {
                    row: 2,
                    col: 4,
                    sizeX: 2,
                    sizeY: 1,
                    name: "ordersSummary",
                    visible: true,
                    message: 'This widget help to identify the summary of orders'
                }, {
                    row: 3,
                    col: 0,
                    sizeX: 4,
                    sizeY: 1,
                    name: "fileTransferOverview",
                    visible: true,
                    message: 'This widget help to identify the files transfer overview'
                }, {
                    row: 3,
                    col: 4,
                    sizeX: 2,
                    sizeY: 1,
                    name: "fileTransferSummary",
                    visible: true,
                    message: 'This widget help to identify the summary of files transfer'
                }, {
                    row: 4,
                    col: 0,
                    sizeX: 6,
                    sizeY: 1,
                    name: "dailyPlanOverview",
                    visible: true,
                    message: 'This widget help to identify daily plan overview'
                }];
            }
            adjustRow(vm.dashboardLayout);
            vm.dashboard.widgets.sort(function (a, b) {
                if (parseInt(a.row) == parseInt(b.row)) {
                    return parseInt(a.col) - parseInt(b.col);
                }
                return parseInt(a.row) - parseInt(b.row);
            });

            for (var i = 0; i < vm.dashboardLayout.length; i++) {
                if (vm.dashboardLayout[i].name == 'agentClusterStatus' && !vm.permission.JobschedulerUniversalAgent.view.status) {
                    vm.dashboardLayout[i].visible = false;
                } else if (vm.dashboardLayout[i].name == 'agentClusterRunningTasks' && !vm.permission.ProcessClass.view.status) {
                    vm.dashboardLayout[i].visible = false;
                } else if (vm.dashboardLayout[i].name == 'masterClusterStatus' && !vm.permission.JobschedulerMasterCluster.view.status) {
                    vm.dashboardLayout[i].visible = false;
                } else if (vm.dashboardLayout[i].name == 'dailyPlanOverview' && !vm.permission.DailyPlan.view.status) {
                    vm.dashboardLayout[i].visible = false;
                }
                if (vm.dashboardLayout[i].visible) {
                    vm.dashboard.widgets.push(vm.dashboardLayout[i]);
                }
                restrictRestCall(vm.dashboardLayout[i].name, vm.dashboardLayout[i].visible);
                if (i == vm.dashboardLayout.length - 1)
                     vm.loadingImg= false;
            }
        }

        function setWidgetPreference() {
            if(!vm.userPreferences.theme){
                return;
            }
            vm.userPreferences.dashboard = vm.dashboardLayout;
            $window.sessionStorage.preferences = JSON.stringify(vm.userPreferences);
            var configObj = {};
            configObj.jobschedulerId = $scope.schedulerIds.selected;
            configObj.account = vm.permission.user;
            configObj.configurationType = "PROFILE";
            configObj.id = parseInt($window.sessionStorage.preferenceId);
            configObj.configurationItem = JSON.stringify(vm.userPreferences);

           if(configObj.id && configObj.id>0)
           UserService.saveConfiguration(configObj);
        }

        vm.addWidgetDialog = function () {
            isDragging = true;
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/add-widget-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                size: 'lg',
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                isDragging = false;
            }, function () {
                isDragging = false;
            });
        };

        vm.addWidget = function (widget) {
            vm.dashboard.widgets.sort(function (a, b) {
                if (parseInt(a.row) == parseInt(b.row)) {
                    return parseInt(a.col) - parseInt(b.col);
                }
                return parseInt(a.row) - parseInt(b.row);
            });

            for (var i = 0; i < vm.dashboardLayout.length; i++) {
                if (vm.dashboardLayout[i].name == widget.name) {
                    vm.dashboardLayout[i].visible = true;
                    if (vm.dashboard.widgets.length - 1 >= 0) {
                        if ((vm.dashboardLayout[vm.dashboard.widgets.length - 1].row == widget.row) && (widget.sizeX + vm.dashboardLayout[vm.dashboard.widgets.length - 1].sizeX) == 6) {
                            if (vm.dashboardLayout[vm.dashboard.widgets.length - 1].col != widget.col) {
                                vm.dashboardLayout[i].col = vm.dashboardLayout[vm.dashboard.widgets.length - 1].col + 2;
                            }
                            vm.dashboardLayout[i].row = parseInt(vm.dashboardLayout[vm.dashboard.widgets.length - 1].row);
                        } else {
                            vm.dashboardLayout[i].row = parseInt(vm.dashboardLayout[vm.dashboard.widgets.length - 1].row) + 1;
                        }
                    }

                    vm.dashboard.widgets.push(vm.dashboardLayout[i]);
                    break;
                }
            }

            restrictRestCall(widget.name, true);
            if (t2) {
                $timeout.cancel(t2);
            }
            t2 = $timeout(function () {
                setClusterWidgetHeight();
                setWidgetPreference();
            }, 100);
        };
        function adjustRow(widgets) {
            widgets.sort(function(a, b) {
                if(parseInt(a.row) == parseInt(b.row)){
                     return parseInt(a.col) - parseInt(b.col);
                }
                return parseInt(a.row) - parseInt(b.row);
            });
            var flag = false;
            for (var i = 0; i < widgets.length; i++) {
                if (widgets[i].row > 0) {
                    if (i > 0) {
                        if (widgets[i].row != widgets[i - 1].row && widgets[i].row != widgets[i - 1].row + 1)
                            flag = true;
                        if (flag)
                            widgets[i].row = widgets[i].row - 1;
                    }
                }
            }
        }

        vm.removeWidget = function (widget) {
            isDragging = true;
            widget.visible = false;
            restrictRestCall(widget.name,widget.visible);
            vm.dashboard.widgets.splice(vm.dashboard.widgets.indexOf(widget), 1);
            adjustRow(vm.dashboard.widgets);
            if(t2){
                $timeout.cancel(t2);
            }
            t2 = $timeout(function () {
                  setClusterWidgetHeight();
                  setWidgetPreference();
                  isDragging = false;
            }, 100);
        };

        function setClusterWidgetHeight() {
            vm.dashboard.widgets.sort(function (a, b) {
                if (parseInt(a.row) == parseInt(b.row)) {
                    return parseInt(a.col) - parseInt(b.col);
                }
                return parseInt(a.row) - parseInt(b.row);
            });
            for (var i = 0; i < vm.dashboard.widgets.length; i++) {

                if (i > 0) {
                    if (vm.dashboard.widgets[i].row == vm.dashboard.widgets[i - 1].row) {
                        if (vm.dashboard.widgets[i].sizeY == vm.dashboard.widgets[i - 1].sizeY) {
                            ht3 = $('#' + vm.dashboard.widgets[i].name + '1').innerHeight();
                            ht4 = $('#' + vm.dashboard.widgets[i - 1].name + '1').innerHeight();
                            if (ht3 > $('#' + vm.dashboard.widgets[i].name + '1').css('max-height')) {
                                ht3 = $('#' + vm.dashboard.widgets[i].name + '1').css('max-height');
                            }
                            if (ht4 > $('#' + vm.dashboard.widgets[i - 1].name + '1').css('max-height')) {
                                ht4 = $('#' + vm.dashboard.widgets[i - 1].name + '1').css('max-height');
                            }
                            if (ht3 > ht4) {
                                $('#' + vm.dashboard.widgets[i - 1].name + '1').css('height', ht3 + 'px');
                            } else if (ht4 > ht3) {
                                $('#' + vm.dashboard.widgets[i].name + '1').css('height', ht4 + 'px');
                            }

                        } else {
                            if (vm.dashboard.widgets[i].sizeY > 1) {
                                if (i < vm.dashboard.widgets.length && vm.dashboard.widgets[i + 1] && (vm.dashboard.widgets[i - 1].col == vm.dashboard.widgets[i + 1].col) && (vm.dashboard.widgets[i - 1].row == vm.dashboard.widgets[i + 1].row - 1)) {
                                    ht3 = $('#' + vm.dashboard.widgets[i - 1].name).innerHeight();
                                    ht4 = $('#' + vm.dashboard.widgets[i + 1].name).innerHeight();
                                    if (ht3 > $('#' + vm.dashboard.widgets[i].name + '1').css('max-height')) {
                                        ht3 = $('#' + vm.dashboard.widgets[i].name + '1').css('max-height');
                                    }
                                    if (ht4 > $('#' + vm.dashboard.widgets[i + 1].name + '1').css('max-height')) {
                                        ht4 = $('#' + vm.dashboard.widgets[i + 1].name + '1').css('max-height');
                                    }
                                    var clustHt = $('#clusterStatusContainer').innerHeight() || 0;
                                    if ((ht3 + ht4 - 22) > clustHt) {
                                        $('#' + vm.dashboard.widgets[i].name + '1').css({
                                            'height': (ht3 + ht4 - 22) + 'px',
                                            overflow: ''
                                        });
                                    } else {
                                        $('#' + vm.dashboard.widgets[i].name + '1').css({
                                            'height': (ht3 + ht4 - 22) + 'px',
                                            overflow: 'auto'
                                        });
                                    }
                                }
                            }
                        }
                    }
                }
                if (vm.dashboard.widgets[i].row == 0){
                    $('#' + vm.dashboard.widgets[i].name).css('top','22px');
                }
                else if (vm.dashboard.widgets[i].row > 0) {
                    if (vm.dashboard.widgets[i - 1].row == vm.dashboard.widgets[i].row) {
                        $('#' + vm.dashboard.widgets[i].name).css('top', $('#' + vm.dashboard.widgets[i - 1].name).position().top + 'px');
                        continue;
                    }
                    var ht = 0, ht1 = 0, ht2 = 0, ht3 = 0, ht4 = 0;
                    var top = 0;
                    if (vm.dashboard.widgets[i].row == 1) {
                        if (i == 1) {
                            ht = $('#' + vm.dashboard.widgets[i - 1].name).innerHeight();
                        } else if (i == 2) {
                            ht1 = $('#' + vm.dashboard.widgets[i - 1].name).innerHeight();
                            ht2 = $('#' + vm.dashboard.widgets[i - 2].name).innerHeight();
                            if (vm.dashboard.widgets[i - 1].sizeY == vm.dashboard.widgets[i - 2].sizeY) {
                                ht = ht1 > ht2 ? ht1 : ht2;
                            } else if (vm.dashboard.widgets[i - 1].sizeY > vm.dashboard.widgets[i - 2].sizeY) {
                                ht = ht2;
                            } else {
                                ht = ht1;
                            }
                        } else {
                            if (vm.dashboard.widgets[i].row == vm.dashboard.widgets[i - 1].row + 1) {
                                ht = $('#' + vm.dashboard.widgets[i - 1].name).innerHeight();
                                top = $('#' + vm.dashboard.widgets[i - 1].name).position().top;
                            } else if (vm.dashboard.widgets[i].row == vm.dashboard.widgets[i - 2].row + 1) {
                                ht = $('#' + vm.dashboard.widgets[i - 2].name).innerHeight();
                                top = $('#' + vm.dashboard.widgets[i - 2].name).position().top;
                            } else {
                                $('#' + vm.dashboard.widgets[i].name).css('top', $('#' + vm.dashboard.widgets[i - 1].name).position().top + 'px');
                            }
                        }
                        if (ht > 0)
                            $('#' + vm.dashboard.widgets[i].name).css('top', ht + 22 + 'px');

                    } else if (vm.dashboard.widgets[i].row == 2) {
                        if (i == 1) {
                            ht = $('#' + vm.dashboard.widgets[i - 1].name).innerHeight();
                            top = $('#' + vm.dashboard.widgets[i - 1].name).position().top;
                        }
                        if (i == 2) {
                            if (vm.dashboard.widgets[i].row == vm.dashboard.widgets[i - 1].row + 1) {
                                ht = $('#' + vm.dashboard.widgets[i - 1].name).innerHeight();
                                top = $('#' + vm.dashboard.widgets[i - 1].name).position().top;
                            } else {
                                ht1 = $('#' + vm.dashboard.widgets[i - 1].name).innerHeight();
                                ht2 = $('#' + vm.dashboard.widgets[i - 2].name).innerHeight();
                                ht = ht1 > ht2 ? ht1 : ht2;
                                top = ht1 > ht2 ? $('#' + vm.dashboard.widgets[i - 1].name).position().top : $('#' + vm.dashboard.widgets[i - 2].name).position().top;
                            }
                        } else if (i == 3) {
                            if (vm.dashboard.widgets[i].row == vm.dashboard.widgets[i - 1].row + 1) {
                                ht = $('#' + vm.dashboard.widgets[i - 1].name).innerHeight();
                                top = $('#' + vm.dashboard.widgets[i - 1].name).position().top;
                            } else if (vm.dashboard.widgets[i].row == vm.dashboard.widgets[i - 2].row + 1) {
                                ht = $('#' + vm.dashboard.widgets[i - 2].name).innerHeight();
                                top = $('#' + vm.dashboard.widgets[i - 2].name).position().top;
                            } else {
                                $('#' + vm.dashboard.widgets[i].name).css('top', $('#' + vm.dashboard.widgets[i - 1].name).position().top + 'px');
                            }
                        } else if (i == 4) {
                            $('#' + vm.dashboard.widgets[i].name).css('top', $('#' + vm.dashboard.widgets[i - 1].name).position().top + 'px');
                        }
                        if (ht > 0)
                            $('#' + vm.dashboard.widgets[i].name).css('top', ht + top + 'px');

                    } else if (vm.dashboard.widgets[i].row == 3) {
                        if (i == 4) {
                            if (vm.dashboard.widgets[i].row == vm.dashboard.widgets[i - 1].row + 1) {
                                ht = $('#' + vm.dashboard.widgets[i - 1].name).innerHeight();
                                top = $('#' + vm.dashboard.widgets[i - 1].name).position().top;
                            } else {
                                ht1 = $('#' + vm.dashboard.widgets[i - 1].name).innerHeight();
                                ht2 = $('#' + vm.dashboard.widgets[i - 2].name).innerHeight();
                                ht = ht1 > ht2 ? ht1 : ht2;
                                top = ht1 > ht2 ? $('#' + vm.dashboard.widgets[i - 1].name).position().top : $('#' + vm.dashboard.widgets[i - 2].name).position().top;
                            }
                        } else if (i == 5) {
                            if (vm.dashboard.widgets[i].row == vm.dashboard.widgets[i - 1].row + 1) {
                                ht = $('#' + vm.dashboard.widgets[i - 1].name).innerHeight();
                                top = $('#' + vm.dashboard.widgets[i - 1].name).position().top;
                            } else if (vm.dashboard.widgets[i].row == vm.dashboard.widgets[i - 2].row + 1) {
                                ht = $('#' + vm.dashboard.widgets[i - 2].name).innerHeight();
                                top = $('#' + vm.dashboard.widgets[i - 2].name).position().top;
                            } else {
                                if (vm.dashboard.widgets[i - 1].row == 2) {
                                    ht = $('#' + vm.dashboard.widgets[i - 1].name).innerHeight();
                                    top = $('#' + vm.dashboard.widgets[i - 1].name).position().top;
                                }
                            }
                        } else if (i == 6) {
                            $('#' + vm.dashboard.widgets[i].name).css('top', $('#' + vm.dashboard.widgets[i - 1].name).position().top + 'px');
                        }
                        if (ht > 0)
                            $('#' + vm.dashboard.widgets[i].name).css('top', ht + top + 'px');
                    } else if (vm.dashboard.widgets[i].row == 4) {
                        //   console.log(vm.dashboard.widgets[i].name +' : '+vm.dashboard.widgets[i].row)
                        if (i < 6) {
                            ht = $('#' + vm.dashboard.widgets[i - 1].name).innerHeight();
                            top = $('#' + vm.dashboard.widgets[i - 1].name).position().top;
                        }
                        else if (i == 6) {
                            if (vm.dashboard.widgets[i].row == vm.dashboard.widgets[i - 1].row + 1) {
                                ht = $('#' + vm.dashboard.widgets[i - 1].name).innerHeight();
                                top = $('#' + vm.dashboard.widgets[i - 1].name).position().top;
                            } else {
                                ht1 = $('#' + vm.dashboard.widgets[i - 1].name).innerHeight();
                                ht2 = $('#' + vm.dashboard.widgets[i - 2].name).innerHeight();
                                ht = ht1 > ht2 ? ht1 : ht2;
                                top = ht1 > ht2 ? $('#' + vm.dashboard.widgets[i - 1].name).position().top : $('#' + vm.dashboard.widgets[i - 2].name).position().top;
                            }
                        } else if (i == 7) {
                            if (vm.dashboard.widgets[i].row == vm.dashboard.widgets[i - 1].row + 1 && vm.dashboard.widgets[i].col == 0) {
                                ht = $('#' + vm.dashboard.widgets[i - 1].name).innerHeight();
                                top = $('#' + vm.dashboard.widgets[i - 1].name).position().top;
                            } else if (vm.dashboard.widgets[i].row == vm.dashboard.widgets[i - 2].row + 1 && vm.dashboard.widgets[i].col == 0) {
                                ht = $('#' + vm.dashboard.widgets[i - 2].name).innerHeight();
                                top = $('#' + vm.dashboard.widgets[i - 2].name).position().top;
                            } else {
                                if (vm.dashboard.widgets[i - 1].row == 2) {
                                    $('#' + vm.dashboard.widgets[i].name).css('top', $('#' + vm.dashboard.widgets[i - 1].name).position().top + 'px');
                                }
                            }
                        }
                        if (ht > 0)
                            $('#' + vm.dashboard.widgets[i].name).css('top', ht + top + 'px');
                    } else if (vm.dashboard.widgets[i].row >= 5) {
                        if (i == 6) {
                            if (vm.dashboard.widgets[i].row == vm.dashboard.widgets[i - 1].row + 1) {
                                ht = $('#' + vm.dashboard.widgets[i - 1].name).innerHeight();
                                top = $('#' + vm.dashboard.widgets[i - 1].name).position().top;
                            } else {
                                ht1 = $('#' + vm.dashboard.widgets[i - 1].name).innerHeight();
                                ht2 = $('#' + vm.dashboard.widgets[i - 2].name).innerHeight();
                                ht = ht1 > ht2 ? ht1 : ht2;
                                top = ht1 > ht2 ? $('#' + vm.dashboard.widgets[i - 1].name).position().top : $('#' + vm.dashboard.widgets[i - 2].name).position().top;
                            }
                        } else if (i == 7) {
                            if (vm.dashboard.widgets[i].row == vm.dashboard.widgets[i - 1].row + 1 && vm.dashboard.widgets[i].col == 0) {
                                ht = $('#' + vm.dashboard.widgets[i - 1].name).innerHeight();
                                top = $('#' + vm.dashboard.widgets[i - 1].name).position().top;
                            } else if (vm.dashboard.widgets[i].row == vm.dashboard.widgets[i - 2].row + 1 && vm.dashboard.widgets[i].col == 0) {
                                ht = $('#' + vm.dashboard.widgets[i - 2].name).innerHeight();
                                top = $('#' + vm.dashboard.widgets[i - 2].name).position().top;
                            } else {
                                if (vm.dashboard.widgets[i - 1].row == 2) {
                                    $('#' + vm.dashboard.widgets[i].name).css('top', $('#' + vm.dashboard.widgets[i - 1].name).position().top + 'px');
                                }
                            }
                        }
                        if (ht > 0)
                            $('#' + vm.dashboard.widgets[i].name).css('top', ht + top + 'px');
                    }
                }
            }
        }

        var interval2 = $interval(function () {
            if(!isDragging)
            setClusterWidgetHeight();
        },1200);

        vm.agentClusters = {};
        if (SOSAuth.jobChain) {
            SOSAuth.setJobChain(undefined);
            SOSAuth.save();
        }

        vm.dashboardFilters = CoreService.getDashboardTab();
        var isLoadedSnapshot = true, isLoadedSummary = true, isLoadedDailyPlan = true, isLoadedFileSummary= true, isLoadedFileOverview=true;

        function groupBy(data) {
            var results = [];
            if (!(data)) return;

            angular.forEach(data, function (value) {
                var result = {};

                result.count = 1;
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
                            result.count = result.count + results[i].count;
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
            if(!vm.isAgentClusterVisible){
                return;
            }
            if (!vm.agentClusters) {
                vm.isLoadedAgentCluster = false;
            }
            JobSchedulerService.getAgentCluster({
                jobschedulerId: $scope.schedulerIds.selected
            }).then(function (res) {
                if (res.agentClusters) {
                    vm.agentClusters = res.agentClusters;
                    prepareAgentClusterData(vm.agentClusters);
                }
                vm.isLoadedAgentCluster = true;
            }, function () {
                vm.isLoadedAgentCluster = true;
            });
        };


        vm.barOptions = {
            chart: {
                type: 'discreteBarChart',
                height: 180,
                margin: {
                    top: 20,
                    right: 20,
                    bottom: 70,
                    left: 50
                },
                x: function (d) {
                    return d.label;
                },
                y: function (d) {
                    return d.value;
                },
                yAxis: {tickFormat: yAxisTickFormatFunction()},
                xAxis: {rotateLabels: -35},
                valueFormat: function (d) {
                    return d3.format(',.4f')(d);
                },
                tooltip: {
                    enabled: true,
                    duration: 0,
                    contentGenerator: function (d) {
                        return '<h3>' + gettextCatalog.getString(d.data.label) + '</h3>' +
                            '<p>' + d.data.value + '</p>';
                    }
                },
                discretebar: {
                    dispatch: {
                        elementClick: function (e) {
                            var key = '';
                            angular.forEach(vm.agentClusters, function (value) {

                                if (e.data.label == value.path) {

                                    if (value.state._text.toLowerCase() == "label.healthyAgentCluster") {
                                        key = 'healthy';
                                    } else if (value.state._text.toLowerCase() == "label.unhealthyAgentCluster") {
                                        key = 'unhealthy';
                                    } else {
                                        key = 'unreachable';
                                    }
                                    $state.go('app.resources.agentClusters', {type: key});
                                }
                            });
                        }
                    }
                },
                duration: 500,
                interactive: true
            }
        };

        vm.pieOptions = {
            "chart": {
                id: "agentClusterId",
                type: 'pieChart',
                x: xFunction(),
                y: yFunction(),
                width: 180,
                height: 180,
                labelsOutside: false,
                showLabels: true,
                labelType: 'percent',
                showLegend: false,
                color: function (d, i) {
                    if (d.key == "label.healthyAgentCluster") {
                        return ' #7ab97a';
                    } else if (d.key == "label.unreachableAgentCluster") {
                        return '#e86680';
                    } else {
                        return 'rgba(255, 195, 0, 0.9)';
                    }
                },
                tooltip: {
                    enabled: true,
                    duration: 0,
                    contentGenerator: function (d) {
                        return '<h3>' + gettextCatalog.getString(d.data.key) + '</h3>' +
                            '<p>' + d.data.y + '</p>';
                    }
                },
                pie: {
                    dispatch: {
                        elementClick: function (e) {
                            var key = '';
                            if (e.data.key == "label.healthyAgentCluster") {
                                key = 'healthy';
                            } else if (e.data.key == "label.unhealthyAgentCluster") {
                                key = 'unhealthy';
                            } else {
                                key = 'unreachable';
                            }
                            $state.go('app.resources.agentClusters', {type: key});
                        }

                    }
                }
            }
        };

        var t1, t2;

        function agentClusterRunningTaskGraph(agentArray) {
            vm.processClasses = [];
            vm.agentStatusChart = [{
                "key": "Agents",
                "values": agentArray
            }];
            vm.isLoadedRunningTask = true;
        }

        vm.getAgentClusterRunningTask = function () {
            if(!vm.isRunningAgentVisible){
                return;
            }
            vm.isLoadedRunningTask = false;
            var agentArray = [];
            if (vm.scheduleState == 'UNREACHABLE') {
                agentClusterRunningTaskGraph(agentArray);
                return;
            }
            ResourceService.getProcessClass({
                jobschedulerId: $scope.schedulerIds.selected,
                isAgentCluster: true
            }).then(function (res) {
                if (res.processClasses) {
                    vm.processClasses = res.processClasses;
                    angular.forEach(vm.processClasses, function (value) {
                        agentArray.push({label: value.path, value: value.numOfProcesses});
                    });

                    t1 = $timeout(function () {
                        vm.agentStatusChart = [{
                            "key": "Agents",
                            "values": agentArray
                        }];
                        if (vm.agentStatusChart[0] && vm.agentStatusChart[0].values && vm.agentStatusChart[0].values.length > 10) {
                            vm.barOptions.chart.width = vm.agentStatusChart[0].values.length * 50;
                        }

                    }, 0);
                }

                vm.isLoadedRunningTask = true;
            }, function () {
                agentClusterRunningTaskGraph(agentArray);
            });
        };

        function prepareAgentClusterData(result) {
            var agentArray1 = [];
            vm.YAxisDomain = [0, 3];

            angular.forEach(groupBy(result), function (value) {
                agentArray1.push({
                    key: value._text,
                    y: value.count
                });
            });
            vm.agentClusterData = agentArray1;
        }

        function xFunction() {
            return function (d) {
                return d.key;
            };
        }

        function yFunction() {
            return function (d) {
                return d.y;
            };
        }

        function yAxisTickFormatFunction() {
            return function (d) {
                if (d % 1 === 0) {
                    return d3.format(',f')(d);
                } else {
                    return;
                }
            };
        }

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

        var clusterStatusData = {};

        vm.isLoadedMasterCluster = false;
        function prepareClusterStatusData() {
            if(!vm.isMasterClusterVisible){
                return;
            }
            clusterStatusData = {};
            getDatabase().then(function (res) {
                clusterStatusData.database = res;
                getClusterMembersP().then(function (res) {
                    clusterStatusData.members = res;
                    vm.clusterStatusData = clusterStatusData;
                    t2 = $timeout(function () {
                        vm.clusterStatusData = clusterStatusData;
                        $rootScope.$broadcast('clusterStatusDataChanged');
                        vm.isLoadedMasterCluster = true;
                        $('#masterClusterStatus1').on('shown.bs.dropdown', function (e) {
                            var $menu = $(e.target).find('.more-option');
                            if ($menu && $menu.offset()) {
                                $(this).find('.dropdown-menu').css("top", $menu.offset().top + 27);
                                if (window.localStorage.$SOS$LANG == 'fr') {
                                    $(this).find('.dropdown-menu').css("left", $menu.offset().left - 260);
                                } else if (window.localStorage.$SOS$LANG == 'ja') {
                                    $(this).find('.dropdown-menu').css("left", $menu.offset().left - 125);
                                } else if (window.localStorage.$SOS$LANG == 'de') {
                                    $(this).find('.dropdown-menu').css("left", $menu.offset().left - 230);
                                } else {
                                    $(this).find('.dropdown-menu').css("left", $menu.offset().left - 210);
                                }
                                $(this).find('.dropdown-menu').css("position", "fixed");
                                $(this).find('.dropdown-menu').css("z-index", "9999");
                            }
                        });
                        $('#masterClusterStatus1').on('hide.bs.dropdown', function () {
                            $(this).find('.dropdown-menu').css("top", "auto");
                            $(this).find('.dropdown-menu').css("left", "auto");
                        });
                    }, 60);
                }, function () {
                    vm.isLoadedMasterCluster = true;
                });
            }, function () {
                vm.isLoadedMasterCluster = true;
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
            $state.go('app.resources.agentClusters', {type: 'all'});
        };

        var states = [];
        vm.clusterAction = function (objectType, action, host, port, id) {
            function performAction() {
                var obj = {};
                obj.jobschedulerId = id || vm.schedulerIds.selected;
                obj.host = host;
                obj.port = port;
                var obj1 = {};
                obj1.jobschedulerId = id || vm.schedulerIds.selected;
                obj.auditLog = {};
                obj1.auditLog = {};

                if (vm.comments && vm.comments.comment) {
                    obj.auditLog.comment = vm.comments.comment;
                    obj1.auditLog.comment = vm.comments.comment;
                }
                if (vm.comments && vm.comments.timeSpent) {
                    obj.auditLog.timeSpent = vm.comments.timeSpent;
                    obj1.auditLog.timeSpent = vm.comments.timeSpent;
                }

                if (vm.comments && vm.comments.ticketLink) {
                    obj.auditLog.ticketLink = vm.comments.ticketLink;
                    obj1.auditLog.ticketLink = vm.comments.ticketLink;
                }

                if ((objectType == 'supervisor' || objectType == 'master') && action == 'terminate') {
                    JobSchedulerService.terminate(obj);
                } else if ((objectType == 'supervisor' || objectType == 'master') && action == 'abort') {
                    JobSchedulerService.abort(obj);
                } else if ((objectType == 'supervisor' || objectType == 'master') && action == 'abortAndRestart') {
                    JobSchedulerService.abortAndRestart(obj);
                } else if ((objectType == 'supervisor' || objectType == 'master') && action == 'terminateAndRestart') {
                    JobSchedulerService.restart(obj);
                } else if ((objectType == 'supervisor' || objectType == 'master') && action == 'pause') {
                    JobSchedulerService.pause(obj);
                } else if ((objectType == 'supervisor' || objectType == 'master') && action == 'continue') {
                    JobSchedulerService.continue(obj);
                } else if ((objectType == 'supervisor' || objectType == 'master') && action == 'remove') {
                    JobSchedulerService.cleanup(obj).then(function () {
                        JobSchedulerService.getSchedulerIds().then(function (res) {
                            if (res) {
                                CoreService.setDefaultTab();
                                SOSAuth.setIds(res);
                                SOSAuth.setPermission(permission);
                                SOSAuth.save();
                                if (res.selected != vm.schedulerIds.selected)
                                    $state.reload(vm.currentState);
                                $rootScope.$broadcast('reloadUser');

                            }
                        });
                    })
                } else if (objectType == 'cluster' && action == 'terminate') {
                    JobSchedulerService.terminateCluster(obj1);
                } else if (objectType == 'cluster' && action == 'terminateFailsafe') {
                    JobSchedulerService.terminateFailsafeCluster(obj1);
                } else if (objectType == 'cluster' && action == 'restart') {
                    JobSchedulerService.restartCluster(obj1);
                }
                else if (action == 'downloadLog') {
                    vm.loading = true;
                    if (!id) {
                        id = vm.schedulerIds.selected;
                    }
                    JobSchedulerService.downloadLog({
                        jobschedulerId: id,
                        host: host,
                        port: port
                    }).then(function (res) {
                        vm.loading = false;
                        var name = 'jobscheduler.' + id + '.main.log';
                        var fileType = 'application/octet-stream';

                        if (res.headers('Content-Disposition') && /filename=(.+)/.test(res.headers('Content-Disposition'))) {
                            name = /filename=(.+)/.exec(res.headers('Content-Disposition'))[1];
                        }
                        if (res.headers('Content-Type')) {
                            fileType = res.headers('Content-Type');
                        }
                        var data = new Blob([res.data], {type: fileType});
                        FileSaver.saveAs(data, name);
                    }, function () {
                        vm.loading = false;
                    });
                }
            }

            if ((objectType == 'supervisor' || objectType == 'master') && action == 'terminateAndRestartWithTimeout') {
                vm.getTimeout(host, port, id,action);
            } if ((objectType == 'supervisor' || objectType == 'master') && action == 'terminateWithin') {
                vm.getTimeout(host, port, id,action);
            }else {
                if (vm.userPreferences.auditLog && action !== 'downloadLog') {
                    vm.comments = {};
                    vm.comments.radio = 'predefined';
                    vm.comments.name = id + ' (' + host + ':' + port + ')';
                    vm.comments.operation = action == "terminateFailsafe" ? "Terminate and fail-over" : action == "terminateAndRestart" ? "Terminate and Restart" : action == "abortAndRestart" ? "Abort and Restart" : action == "terminate" ? "Terminate" : action == "pause" ? "Pause" : action == "abort" ? "Abort" : action == "remove" ? "Remove instance" : "Continue";
                    vm.comments.type = 'JobScheduler';
                    var modalInstance = $uibModal.open({
                        templateUrl: 'modules/core/template/comment-dialog.html',
                        controller: 'DialogCtrl',
                        scope: vm,
                        backdrop: 'static'
                    });
                    modalInstance.result.then(function () {
                        performAction();
                    }, function () {

                    });
                } else {
                    performAction();
                }
            }

        };

        /*-------------Menu active function call-------------------*/
        vm.terminate = function () {
            JobSchedulerService.terminate({jobschedulerId: $scope.schedulerIds.selected});
        };
        vm.restart = function () {
            JobSchedulerService.restart({jobschedulerId: $scope.schedulerIds.selected}).then(function (res) {

            });
        };
        vm.terminateFailSafe = function () {
            JobSchedulerService.terminateFailSafe({jobschedulerId: $scope.schedulerIds.selected});
        };

        vm.criterion = {};
        vm.criterion.timeout = 60;
        vm.getTimeout = function (host, port, id,action) {
            vm.comments = {};
            vm.comments.radio = 'predefined';
            vm._scheduleName = id + ' (' + host + ':' + port + ')';
            vm.action = action;
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/get-timeout-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                var obj = {};
                obj.jobschedulerId = id;
                obj.host = host;
                obj.port = port;
                obj.timeout = vm.criterion.timeout;
                obj.auditLog = {};
                if (vm.comments.comment) {
                    obj.auditLog.comment = vm.comments.comment;
                }
                if (vm.comments.timeSpent) {
                    obj.auditLog.timeSpent = vm.comments.timeSpent;
                }

                if (vm.comments.ticketLink) {
                    obj.auditLog.ticketLink = vm.comments.ticketLink;
                }
                if (action == 'terminateAndRestartWithTimeout')
                    JobSchedulerService.restartWithin(obj);
                else
                    JobSchedulerService.terminate(obj);
            }, function () {

            });
        };

        vm.loadOrderSnapshot = function (flag) {
            if(!vm.isOrderOverviewVisible){
                return;
            }
            if (vm.scheduleState == 'UNREACHABLE' && !flag) {
                isLoadedSnapshot = true;
                vm.snapshot = {};
                return;
            }
            isLoadedSnapshot = false;
            OrderService.getSnapshot({jobschedulerId: $scope.schedulerIds.selected}).then(function (res) {
                vm.snapshot = res.orders;
                vm.notPermissionForSnapshot = '';
                isLoadedSnapshot = true;
            }, function (err) {
                if (err.data)
                    vm.notPermissionForSnapshot = !err.data.isPermitted;
                isLoadedSnapshot = true;
            });
        };


        vm.getOrderSummary = function () {
             if(!vm.isOrderSummaryVisible){
                return;
            }
            isLoadedSummary = false;
            var obj = {};
            obj.jobschedulerId = $scope.schedulerIds.selected;

            if (vm.dashboardFilters.filter.orderRange == 'today') {
                obj.dateFrom = '0d';
            } else {
                obj.dateFrom = vm.dashboardFilters.filter.orderSummaryfrom;
            }
            obj.timeZone = vm.userPreferences.zone;
            OrderService.getSummary(obj).then(function (res) {
                vm.orderSummary = res.orders;
                isLoadedSummary = true;
            }, function (err) {
                vm.notPermissionForSummary = !err.data.isPermitted;
                isLoadedSummary = true;
            })
        };
        vm.getFileOverview = function () {
            if(!vm.isFileOverviewVisible){
                return;
            }
        };

        vm.getFileSummary = function () {
            if(!vm.isFileSummaryVisible){
                return;
            }
            isLoadedFileSummary = false;
            var obj = {};

            if (vm.dashboardFilters.filter.fileRange == 'today') {
                obj.dateFrom = '0d';
            } else {
                obj.dateFrom = vm.dashboardFilters.filter.fileSummaryfrom;
            }
            obj.timeZone = vm.userPreferences.zone;
            YadeService.getSummary(obj).then(function (res) {
                vm.yadeSummary = res;
                isLoadedFileSummary = true;
            }, function (err) {
                vm.notPermissionForFileSummary = !err.data.isPermitted;
                isLoadedFileSummary = true;
            })
        };

        /*----------------- Daily plan overview -----------------*/

        vm.getDailyPlans = function () {
            if(!vm.isDailPlanVisible){
                return;
            }
            isLoadedDailyPlan = false;
            var obj = {};
            obj.jobschedulerId = $scope.schedulerIds.selected;

            if (vm.dashboardFilters.filter.range != 'today') {
                var from = new Date();
                var to = new Date();
                to.setDate(to.getDate() + 1);
                vm.dashboardFilters.filter.from = from;
                vm.dashboardFilters.filter.to = to;
                obj.dateFrom = from;
                obj.dateTo = to;
            } else {
                obj.dateFrom = '0d';
                obj.dateTo = '0d';
                obj.timeZone = vm.userPreferences.zone;
            }

            DailyPlanService.getPlans(obj).then(function (res) {
                vm.planItemData = res.planItems;
                filterData();
                isLoadedDailyPlan = true;
            }, function () {
                isLoadedDailyPlan = true;
            })
        };


        function filterData() {
            vm.waiting = 0;
            vm.late = 0;
            vm.lateSuccess = 0;
            vm.lateError = 0;
            vm.success = 0;
            vm.error = 0;
            if (!vm.planItemData) {
                return;
            }
            vm.totalPlanData = 0;
            angular.forEach(vm.planItemData, function (value) {
                vm.totalPlanData++;
                var time;
                if (value.state._text == 'FAILED') {
                    if (value.late) {
                        vm.lateError++;
                    }
                    vm.error++;
                } else if (value.state._text == 'SUCCESSFUL') {
                    if (value.late) {
                        vm.lateSuccess++;
                    }
                    vm.success++;
                } else if (value.state._text == 'PLANNED') {
                    if (value.late) {
                        vm.late++;
                    }
                    vm.waiting++;
                }
            });
            vm.waiting = getPlanPercent(vm.waiting);
            vm.late = getPlanPercent(vm.late);
            vm.success = getPlanPercent(vm.success);
            vm.lateSuccess = getPlanPercent(vm.lateSuccess);
            vm.error = getPlanPercent(vm.error);
            vm.lateError = getPlanPercent(vm.lateError);
            vm.arrayWidth = [];
            vm.arrayWidth[0] = vm.waiting;
            vm.arrayWidth[1] = vm.late;
            vm.arrayWidth[2] = vm.success;
            vm.arrayWidth[3] = vm.lateSuccess;
            vm.arrayWidth[4] = vm.error;
            vm.arrayWidth[5] = vm.lateError;

            var totalLessWidth = 0, totalGreaterWidth = 0, flag = false;
            for (var i = 0; i <= 5; i++) {
                if (vm.arrayWidth[i] > 0) {
                    if (vm.arrayWidth[i] <= 28) {
                        vm.arrayWidth[i] = 14;
                        totalLessWidth = totalLessWidth + vm.arrayWidth[i];
                    }
                    if (vm.arrayWidth[i] > 28) {
                        flag = true;
                        totalGreaterWidth = totalGreaterWidth + vm.arrayWidth[i];
                    }
                }
            }
            for (var i = 0; i <= 5; i++) {
                if (vm.arrayWidth[i] > 28) {
                    vm.arrayWidth[i] = (100 - totalLessWidth) * vm.arrayWidth[i] / totalGreaterWidth;
                }
            }

            if (!flag) {
                vm.arrayWidth[0] = vm.waiting;
                vm.arrayWidth[1] = vm.late;
                vm.arrayWidth[2] = vm.success;
                vm.arrayWidth[3] = vm.lateSuccess;
                vm.arrayWidth[4] = vm.error;
                vm.arrayWidth[5] = vm.lateError;
                var totalLessWidth = 0, totalGreaterWidth = 0;
                for (var i = 0; i <= 5; i++) {
                    if (vm.arrayWidth[i] > 0) {

                        if (vm.arrayWidth[i] <= 14) {
                            vm.arrayWidth[i] = 14;
                            totalLessWidth = totalLessWidth + vm.arrayWidth[i];
                        }
                        if (vm.arrayWidth[i] > 14) {
                            totalGreaterWidth = totalGreaterWidth + vm.arrayWidth[i];
                        }
                    }
                }
                for (var i = 0; i <= 5; i++) {
                    if (vm.arrayWidth[i] > 14) {
                        vm.arrayWidth[i] = (100 - totalLessWidth) * vm.arrayWidth[i] / totalGreaterWidth;
                    }
                }
            }
        }

        function getPlanPercent(status) {
            return (status / vm.totalPlanData) * 100;
        }

        vm.showOrderSummary = function (state) {
            vm.taskHistoryTab = CoreService.getHistoryTab();
            vm.taskHistoryTab.type = 'jobChain';
            vm.taskHistoryTab.order.filter.historyStates = state;
            vm.taskHistoryTab.order.selectedView = false;
            vm.taskHistoryTab.order.filter.date = typeof vm.dashboardFilters.filter.orderSummaryfrom === 'string' ? vm.dashboardFilters.filter.orderSummaryfrom : 'today';
            $state.go('app.history');
        };

        var interval1='';
        function poll() {
            if (interval1)
                $interval.cancel(interval1);
            interval1 = $interval(function () {
                vm.getAgentCluster();
            }, 60 * 1000)
        }


        function restrictRestCall(id, flag) {
            if (id == 'agentClusterStatus') {
                vm.isAgentClusterVisible = flag;
                vm.getAgentCluster();
                if(flag)
                poll();
            } else if (id == 'agentClusterRunningTasks') {
                vm.isRunningAgentVisible = flag;
                vm.getAgentClusterRunningTask();
            } else if (id == 'masterClusterStatus') {
                vm.isMasterClusterVisible = flag;
                prepareClusterStatusData();
            } else if (id == 'ordersOverview') {
                vm.isOrderOverviewVisible = flag;
                vm.loadOrderSnapshot();
            } else if (id == 'ordersSummary') {
                vm.isOrderSummaryVisible = flag;
                vm.getOrderSummary();
            } else if (id == 'fileTransferOverview') {
                vm.isFileOverviewVisible = flag;
                vm.getFileOverview();
            } else if (id == 'fileTransferSummary') {
                vm.isFileSummaryVisible = flag;
                vm.getFileSummary();
            } else if (id == 'dailyPlanOverview') {
                vm.isDailPlanVisible = flag;
                vm.getDailyPlans();
            }
        }
        if(!vm.isEmpty(vm.userPreferences)) {
            initWidgets();
            if (!vm.userPreferences.dashboard)
                setWidgetPreference();
        }

        $scope.$on('reloadPreferences', function () {
            if(vm.loadingImg)
             initWidgets();
             if (!vm.userPreferences.dashboard) {
                 setWidgetPreference();
             }
        });
        $scope.$on('event-started', function () {
            if (vm.events && vm.events[0] && vm.events[0].eventSnapshots)
                for (var i = 0; i <= vm.events[0].eventSnapshots.length - 1; i++) {
                    if (vm.events[0].eventSnapshots[i].eventType === "SchedulerStateChanged") {
                        isLoadedSnapshot = false;
                        vm.loadOrderSnapshot(true);
                    }
                    if ((vm.events[0].eventSnapshots[i].eventType === "OrderStateChanged" && isLoadedSnapshot)) {
                        isLoadedSnapshot = false;
                        if (!vm.notPermissionForSnapshot)
                            vm.loadOrderSnapshot();
                    } else if (vm.events[0].eventSnapshots[i].eventType === "ReportingChangedOrder" && isLoadedSummary) {
                        isLoadedSummary = false;
                        if (!vm.notPermissionForSummary)
                            vm.getOrderSummary();
                    } else if (vm.events[0].eventSnapshots[i].eventType === "DailyPlanChanged" && isLoadedDailyPlan) {
                        isLoadedDailyPlan = false;
                        vm.getDailyPlans();
                    } else if (vm.events[0].eventSnapshots[i].eventType === "FileBasedActivated" && vm.events[0].eventSnapshots[i].objectType === "PROCESSCLASS" && (vm.isLoadedAgentCluster || vm.isLoadedRunningTask)) {
                        vm.isLoadedAgentCluster = false;
                        if (vm.permission && vm.permission.JobschedulerUniversalAgent && vm.permission.JobschedulerUniversalAgent.view.status)
                            vm.getAgentCluster();
                        if (vm.permission && vm.permission.ProcessClass && vm.permission.ProcessClass.view.status)
                            vm.getAgentClusterRunningTask();
                    } else if (vm.events[0].eventSnapshots[i].eventType === "JobStateChanged" && vm.isLoadedRunningTask) {
                        vm.isLoadedRunningTask = false;
                        if (vm.permission && vm.permission.ProcessClass && vm.permission.ProcessClass.view.status)
                            vm.getAgentClusterRunningTask();
                    }
                }
        });

        $scope.$on('$destroy', function () {
            if (t1)
                $timeout.cancel(t1);
            if (t2)
                $timeout.cancel(t2);
            if (interval1)
                $interval.cancel(interval1);
                $interval.cancel(interval2);

        });
    }

    DailyPlanCtrl.$inject = ['$scope', '$timeout', 'gettext', 'orderByFilter', '$uibModal', 'SavedFilter', 'DailyPlanService', '$stateParams', 'CoreService', 'UserService', 'ResourceService'];
    function DailyPlanCtrl($scope, $timeout, gettext, orderBy, $uibModal, SavedFilter, DailyPlanService, $stateParams, CoreService, UserService, ResourceService) {
        var vm = $scope;
        vm.todayDate = new Date();
        vm.dailyPlanFilters = CoreService.getDailyPlanTab();
        vm.maxEntryPerPage = vm.userPreferences.maxEntryPerPage;

        vm.selectedFiltered;
        vm.isUnique = true;
        var promise1;
        vm.object = {};
        vm.filter_tree = {};
        vm.filterTree1 = [];
        vm.object.paths = [];
        vm.expanding_property = {
            field: "name"
        };

        vm.savedDailyPlanFilter = JSON.parse(SavedFilter.dailyPlanFilters) || {};
        vm.dailyPlanFilterList = [];
        if ($stateParams.filter != null) {
            vm.dailyPlanFilters.selectedView = false;
            vm.dailyPlanFilters.filter.state = '';
            if ($stateParams.filter == 1) {
                vm.dailyPlanFilters.filter.status = 'WAITING';
            } else if ($stateParams.filter == 2) {
                vm.dailyPlanFilters.filter.status = 'WAITING';
                vm.dailyPlanFilters.filter.state = 'LATE';
            } else if ($stateParams.filter == 3) {
                vm.dailyPlanFilters.filter.state = 'LATE';
                vm.dailyPlanFilters.filter.status = 'SUCCESSFUL';
            } else if ($stateParams.filter == 4) {
                vm.dailyPlanFilters.filter.state = 'LATE';
                vm.dailyPlanFilters.filter.status = 'FAILED';
            } else if ($stateParams.filter == 5) {
                vm.dailyPlanFilters.filter.status = 'SUCCESSFUL';
            } else if ($stateParams.filter == 6) {
                vm.dailyPlanFilters.filter.status = 'FAILED';
            }
        }
        if ($stateParams.day != null) {
            vm.dailyPlanFilters.filter.range = $stateParams.day;
        }

        if (vm.dailyPlanFilters.selectedView) {
            vm.savedDailyPlanFilter.selected = vm.savedDailyPlanFilter.selected || vm.savedDailyPlanFilter.favorite;
        }
        else {
            vm.savedDailyPlanFilter.selected = undefined;
        }
        vm.temp_filter = {};

        function checkSharedFilters() {
            if (vm.permission.JOCConfigurations.share.view) {
                var obj = {};
                obj.jobschedulerId = vm.schedulerIds.selected;
                obj.configurationType = "CUSTOMIZATION";
                obj.objectType = "DAILYPLAN";
                obj.shared = true;
                UserService.configurations(obj).then(function (res) {
                    if (res.configurations && res.configurations.length > 0)
                        vm.dailyPlanFilterList = res.configurations;
                    getCustomizations();
                }, function () {
                    getCustomizations();
                });
            } else {
                getCustomizations();
            }
        }

        function getCustomizations() {
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.account = vm.permission.user;
            obj.configurationType = "CUSTOMIZATION";
            obj.objectType = "DAILYPLAN";
            UserService.configurations(obj).then(function (res) {

                if (vm.dailyPlanFilterList && vm.dailyPlanFilterList.length > 0) {
                    if (res.configurations && res.configurations.length > 0) {
                        vm.dailyPlanFilterList = vm.dailyPlanFilterList.concat(res.configurations);
                    }
                    var data = [];
                    for (var i = 0; i < vm.dailyPlanFilterList.length; i++) {
                        var flag = true;
                        for (var j = 0; j < data.length; j++) {
                            if (data[j].account == vm.dailyPlanFilterList[i].account && data[j].name == vm.dailyPlanFilterList[i].name) {
                                flag = false;
                            }

                        }
                        if (flag) {
                            data.push(vm.dailyPlanFilterList[i]);
                        }
                    }
                    vm.dailyPlanFilterList = data;

                } else {
                    vm.dailyPlanFilterList = res.configurations;
                }
                if (vm.savedDailyPlanFilter.selected) {
                    var flag = true;
                    angular.forEach(vm.dailyPlanFilterList, function (value) {
                        if (value.id == vm.savedDailyPlanFilter.selected) {
                            flag = false;
                            UserService.configuration({
                                jobschedulerId: value.jobschedulerId,
                                id: value.id
                            }).then(function (conf) {
                                vm.selectedFiltered = JSON.parse(conf.configuration.configurationItem);
                                vm.selectedFiltered.account = value.account;
                                vm.load();
                            });
                        }
                    });
                    if (flag) {
                        vm.savedDailyPlanFilter.selected = undefined;
                        vm.load();
                    }
                } else {
                    vm.savedDailyPlanFilter.selected = undefined;
                    vm.load();
                }

            }, function (err) {
                vm.savedDailyPlanFilter.selected = undefined;
                vm.load();
            })
        }

        vm.$on('resetDailyPlanDate', function () {
            vm.getPlans();
        });
        function setDateRange() {

            if (vm.dailyPlanFilters.filter.range == 'today' || !vm.dailyPlanFilters.filter.range) {
                var from = '0d';
                var to = '0d';
                vm.currentDateValue = new Date();
            } else {
                var from = new Date();
                var to = new Date();
                from.setDate(from.getDate());
                to.setDate(to.getDate() + 1);
                vm.currentDateValue = from;
            }
            vm.dailyPlanFilters.filter.from = from;
            vm.dailyPlanFilters.filter.to = to;

        }

        setDateRange();
        var late = true;
        if (vm.dailyPlanFilters.filter.state == 'LATE') {
            late = false;
        }
        vm.changeLate = function () {
            late = !late;
            if (late) {
                vm.dailyPlanFilters.filter.state = '';
            } else {
                if (vm.dailyPlanFilters.filter.status == 'ALL') {
                    vm.dailyPlanFilters.filter.status = '';
                }
            }
            setDateRange();
            vm.load();
        };

        vm.getPlans = function () {
            setDateRange();
            vm.load();
        };


        vm.exportToExcel = function () {
            $('#exportToExcelBtn').attr("disabled", true);
            if (!vm.isIE()) {
                $('#dailyPlanTableId').table2excel({
                    exclude: ".tableexport-ignore",
                    filename: "jobscheduler-dailyplan",
                    fileext: ".xls",
                    exclude_img: false,
                    exclude_links: false,
                    exclude_inputs: false
                });
            } else {
                var ExportButtons = document.getElementById('dailyPlanTableId');
                var instance = new TableExport(ExportButtons, {
                    formats: ['xlsx'],
                    exportButtons: false
                });
                var exportData = instance.getExportData()['dailyPlanTableId']['xlsx'];
                instance.export2file(exportData.data, exportData.mimeType, "jobscheduler-dailyplan", exportData.fileExtension);
            }
            $('#exportToExcelBtn').attr("disabled", false);
        };
        vm.dataFormate = vm.userPreferences.dateFormat;
        vm.options = {
            mode: 'custom',
            scale: 'hour',
            sortMode: undefined,
            sideMode: 'TreeTable',
            daily: false,
            maxHeight: window.innerHeight - 280,
            width: false,
            zoom: 1.1,
            treeTableColumns: ['model.name', 'model.orderId'],
            columnsHeaders: {
                'model.name': gettext('label.jobChainOrJob'),
                'model.orderId': gettext('label.orderId')
            },
            columnsClasses: {
                'model.name': 'gantt-column-name',
                'model.orderId': 'gantt-column-from'
            },
            columnsHeaderContents: {
                'model.name': '{{getHeader() | translate}}',
                'model.orderId': '{{getHeader() | translate}}'
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
                    checkSharedFilters();
                });
            }
        };

        $(window).resize(function () {
            var ht = $('.app-header').height()
                + $('.app-footer').height()
                + $('.top-header-bar').height()
                + $('.sub-header').height()
                + $('.sub-header-2').height() + 82;
            vm.options.maxHeight = window.innerHeight - ht;
        });

        vm.canAutoWidth = function (scale) {
            if (scale.match(/.*?hour.*?/) || scale.match(/.*?minute.*?/)) {
                return false;
            } else
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
        vm.setToDate = function () {

            if (vm.searchDailyPlanFilter.from && vm.searchDailyPlanFilter.to) {
                if (moment(vm.searchDailyPlanFilter.to).diff(vm.searchDailyPlanFilter.from) < 0) {
                    vm.searchDailyPlanFilter.to = angular.copy(vm.searchDailyPlanFilter.from)
                }
            }
        };

        var hitSearch = false;
        vm.search = function () {
            hitSearch = true;
            isLoaded = false;
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj = applySearchFilter(obj);
            if (!obj.dateFrom) {
                obj.dateFrom = new Date();
                obj.dateFrom.setHours(0);
                obj.dateFrom.setMinutes(0);
                obj.dateFrom.setSeconds(0);
                obj.dateFrom.setMilliseconds(0);
            }
            if (!obj.dateTo) {
                obj.dateTo = new Date();
                obj.dateTo.setDate(toDate.getDate() + 1);
                obj.dateTo.setHours(0);
                obj.dateTo.setMinutes(0);
                obj.dateTo.setSeconds(0);
                obj.dateTo.setMilliseconds(0);
            }
            vm.showSpinner = true;
            obj.timeZone = vm.userPreferences.zone;
            if ((obj.dateFrom && typeof obj.dateFrom.getMonth === 'function') || (obj.dateTo && typeof  obj.dateTo.getMonth === 'function')) {
                delete obj['timeZone']
            }
            DailyPlanService.getPlans(obj).then(function (res) {
                vm.plans = res.planItems;
                vm.plans = sortByKey(vm.plans, vm.dailyPlanFilters.filter.sortBy, vm.dailyPlanFilters.reverse);
                prepareGanttData(vm.plans, true);
                if (res.created) {
                    vm.maxPlannedTime = new Date(res.deliveryDate);
                } else {
                    vm.maxPlannedTime = undefined;
                }
                vm.isLoading = true;
                isLoaded = true;
                vm.showSpinner = false;
            }, function (err) {
                vm.isLoading = true;
                isLoaded = true;
                vm.showSpinner = false;
            })
        };
        vm.advancedSearch = function () {
            vm.isUnique = true;
            vm.showSearchPanel = true;
            vm.searchDailyPlanFilter = {};
            vm.searchDailyPlanFilter.radio = 'current';
            vm.searchDailyPlanFilter.from1 = 'today';
            vm.searchDailyPlanFilter.to1 = 'today';
            vm.searchDailyPlanFilter.from = new Date();
            vm.searchDailyPlanFilter.fromTime = '00:00';
            vm.searchDailyPlanFilter.to = new Date();
            vm.searchDailyPlanFilter.to.setDate(vm.searchDailyPlanFilter.to.getDate() + 1);
            vm.searchDailyPlanFilter.toTime = '00:00';
            vm.dailyPlanFilter = undefined;
        };
        vm.cancel = function (form) {
            vm.showSearchPanel = false;
            hitSearch = false;
            vm.searchDailyPlanFilter = undefined;
            if (form)
                form.$setPristine();
        };

        function applySearchFilter(obj) {
            if (vm.searchDailyPlanFilter.regex)
                obj.regex = vm.searchDailyPlanFilter.regex;
            if (vm.searchDailyPlanFilter.jobChain)
                obj.jobChain = vm.searchDailyPlanFilter.jobChain;
            if (vm.searchDailyPlanFilter.orderId)
                obj.orderId = vm.searchDailyPlanFilter.orderId;
            if (vm.searchDailyPlanFilter.job)
                obj.job = vm.searchDailyPlanFilter.job;

            if (vm.searchDailyPlanFilter.state && vm.searchDailyPlanFilter.state.length > 0) {
                obj.states = [];
                if (vm.searchDailyPlanFilter.state.indexOf('WAITING') !== -1) {
                    obj.states.push("PLANNED");
                }
                if (vm.searchDailyPlanFilter.state.indexOf('SUCCESSFUL') !== -1) {
                    obj.states.push("SUCCESSFUL");
                }
                if (vm.searchDailyPlanFilter.state.indexOf('FAILED') !== -1) {
                    obj.states.push("FAILED");
                }
                if (vm.searchDailyPlanFilter.state.indexOf('LATE') !== -1) {
                    obj.late = true;
                }
            }
            if (vm.searchDailyPlanFilter.paths && vm.searchDailyPlanFilter.paths.length > 0) {
                obj.folders = [];
                for (var i = 0; i < vm.searchDailyPlanFilter.paths.length; i++) {
                    obj.folders.push({folder: vm.searchDailyPlanFilter.paths[i], recursive: true});
                }
            }
            var fromDate;
            var toDate;

            if (vm.searchDailyPlanFilter.radio == 'current') {
                if (vm.searchDailyPlanFilter.from) {
                    fromDate = new Date(vm.searchDailyPlanFilter.from);
                    if (vm.searchDailyPlanFilter.fromTime) {
                        fromDate.setHours(moment(vm.searchDailyPlanFilter.fromTime, 'HH:mm:ss').hours());
                        fromDate.setMinutes(moment(vm.searchDailyPlanFilter.fromTime, 'HH:mm:ss').minutes());
                        fromDate.setSeconds(moment(vm.searchDailyPlanFilter.fromTime, 'HH:mm:ss').seconds());
                        fromDate.setMilliseconds(0);
                    } else {
                        fromDate.setHours(0);
                        fromDate.setMinutes(0);
                        fromDate.setSeconds(0);
                        fromDate.setMilliseconds(0);
                    }

                }
                if (vm.searchDailyPlanFilter.to) {
                    toDate = new Date(vm.searchDailyPlanFilter.to);
                    if (vm.searchDailyPlanFilter.toTime) {
                        toDate.setHours(moment(vm.searchDailyPlanFilter.toTime, 'HH:mm:ss').hours());
                        toDate.setMinutes(moment(vm.searchDailyPlanFilter.toTime, 'HH:mm:ss').minutes());
                        toDate.setSeconds(moment(vm.searchDailyPlanFilter.toTime, 'HH:mm:ss').seconds());
                        toDate.setMilliseconds(0);
                    } else {
                        toDate.setHours(0);
                        toDate.setMinutes(0);
                        toDate.setSeconds(0);
                        toDate.setMilliseconds(0);
                    }
                }
            } else {
                if (vm.searchDailyPlanFilter.from1) {
                    if (/^\s*(now\s*[-,+])\s*(\d+)\s*$/i.test(vm.searchDailyPlanFilter.from1)) {
                        fromDate = new Date();
                        var seconds = parseInt(/^\s*(now\s*\-)\s*(\d+)\s*$/i.exec(vm.searchDailyPlanFilter.from1)[2]);
                        fromDate.setSeconds(fromDate.getSeconds() - seconds);
                    } else if (/^\s*[-,+]?\d+[d,h,w]{1}\s*$/i.test(vm.searchDailyPlanFilter.from1)) {
                        fromDate = vm.searchDailyPlanFilter.from1;
                    } else if (/^\s*(Today)\s*$/i.test(vm.searchDailyPlanFilter.from1)) {
                        fromDate = '0d';
                    } else if (/^\s*(now)\s*$/i.test(vm.searchDailyPlanFilter.from1)) {
                        fromDate = new Date();
                    }
                }
                if (vm.searchDailyPlanFilter.to1) {
                    if (/^\s*(now\s*[-,+])\s*(\d+)\s*$/i.test(vm.searchDailyPlanFilter.to1)) {
                        toDate = new Date();
                        var seconds = parseInt(/^\s*(now\s*\+)\s*(\d+)\s*$/i.exec(vm.searchDailyPlanFilter.to1)[2]);
                        toDate.setSeconds(toDate.getSeconds() + seconds);
                    } else if (/^\s*[-,+]?\d+[d,h,w]{1}\s*$/i.test(vm.searchDailyPlanFilter.to1)) {
                        toDate = vm.searchDailyPlanFilter.to1;
                    } else if (/^\s*(Today)\s*$/i.test(vm.searchDailyPlanFilter.to1)) {
                        toDate = '0d';
                    } else if (/^\s*(now)\s*$/i.test(vm.searchDailyPlanFilter.to1)) {
                        toDate = new Date();
                    }
                }
            }
            if (!fromDate) {
                fromDate = new Date();
                fromDate.setHours(0);
                fromDate.setMinutes(0);
                fromDate.setSeconds(0);
                fromDate.setMilliseconds(0);
            }
            obj.dateFrom = fromDate;
            if (!toDate) {
                toDate = new Date();
                toDate.setDate(toDate.getDate() + 1);
                toDate.setHours(0);
                toDate.setMinutes(0);
                toDate.setSeconds(0);
                toDate.setMilliseconds(0);

            }
            obj.dateTo = toDate;

            return obj;
        }

        function applySavedFilter(obj) {
            if (vm.selectedFiltered.regex)
                obj.regex = vm.selectedFiltered.regex;
            if (vm.selectedFiltered.jobChain)
                obj.jobChain = vm.selectedFiltered.jobChain;
            if (vm.selectedFiltered.orderId)
                obj.orderId = vm.selectedFiltered.orderId;
            if (vm.selectedFiltered.job)
                obj.job = vm.selectedFiltered.job;
            if (vm.selectedFiltered.state && vm.selectedFiltered.state.length > 0) {
                obj.states = [];
                if (vm.selectedFiltered.state.indexOf('WAITING') !== -1) {
                    obj.states.push("PLANNED");
                }
                if (vm.selectedFiltered.state.indexOf('SUCCESSFUL') !== -1) {
                    obj.states.push("SUCCESSFUL");
                }
                if (vm.selectedFiltered.state.indexOf('FAILED') !== -1) {
                    obj.states.push("FAILED");
                }
                if (vm.selectedFiltered.state.indexOf('LATE') !== -1) {
                    obj.late = true;
                }

            }
            if (vm.selectedFiltered.paths && vm.selectedFiltered.paths.length > 0) {
                obj.folders = [];
                for (var i = 0; i < vm.selectedFiltered.paths.length; i++) {
                    obj.folders.push({folder: vm.selectedFiltered.paths[i], recursive: true});
                }
            }
            var fromDate;
            var toDate;

            if (vm.selectedFiltered.from) {
                if (/^\s*(now\s*[-,+])\s*(\d+)\s*$/i.test(vm.selectedFiltered.from)) {
                    fromDate = new Date();
                    var seconds = parseInt(/^\s*(now\s*\-)\s*(\d+)\s*$/i.exec(vm.selectedFiltered.from)[2]);
                    fromDate.setSeconds(fromDate.getSeconds() - seconds);
                } else if (/^\s*[-,+]?\d+[d,h,w]{1}\s*$/i.test(vm.selectedFiltered.from)) {
                    fromDate = vm.selectedFiltered.from;
                } else if (/^\s*(Today)\s*$/i.test(vm.selectedFiltered.from)) {
                    fromDate = '0d';
                } else if (/^\s*(now)\s*$/i.test(vm.selectedFiltered.from)) {
                    fromDate = new Date();
                }
            }

            if (vm.selectedFiltered.to) {
                if (/^\s*(now\s*[-,+])\s*(\d+)\s*$/i.test(vm.selectedFiltered.to)) {
                    toDate = new Date();
                    var seconds = parseInt(/^\s*(now\s*\+)\s*(\d+)\s*$/i.exec(vm.selectedFiltered.to)[2]);
                    toDate.setSeconds(toDate.getSeconds() + seconds);
                } else if (/^\s*[-,+]?\d+[d,h,w]{1}\s*$/i.test(vm.selectedFiltered.to)) {
                    toDate = vm.selectedFiltered.to;
                } else if (/^\s*(Today)\s*$/i.test(vm.selectedFiltered.to)) {
                    toDate = '0d';
                } else if (/^\s*(now)\s*$/i.test(vm.selectedFiltered.to)) {
                    toDate = new Date();
                }
            }

            if (!fromDate) {
                fromDate = new Date();
                fromDate.setHours(0);
                fromDate.setMinutes(0);
                fromDate.setSeconds(0);
                fromDate.setMilliseconds(0);

            }
            obj.dateFrom = fromDate;
            if (!toDate) {
                toDate = new Date();
                toDate.setDate(toDate.getDate() + 1);
                toDate.setHours(0);
                toDate.setMinutes(0);
                toDate.setSeconds(0);
                toDate.setMilliseconds(0);
            }
            obj.dateTo = toDate;

            return obj;
        }

        function prepareGanttData(data2, flag) {

            var minNextStartTime;
            var maxEndTime;
            var orders = [];
            vm.ordersNoDuplicate = [];

            var groupJobChain = [];
            for (var i = 0; i < data2.length; i++) {

                if (groupJobChain.length > 0) {
                    var flag = false;
                    for (var j = 0; j < groupJobChain.length; j++) {
                        if (data2[i].jobChain && (groupJobChain[j].jobChain == data2[i].jobChain && groupJobChain[j].orderId == data2[i].orderId)) {
                            flag = true;
                        } else if (data2[i].job && (groupJobChain[j].job == data2[i].job)) {
                            flag = true;
                        }
                    }
                    if (!flag) {
                        if (data2[i].orderId) {
                            groupJobChain.push({orderId: data2[i].orderId, jobChain: data2[i].jobChain});
                        } else if (data2[i].job) {
                            groupJobChain.push({job: data2[i].job});
                        }
                    }
                } else {

                    if (data2[i].orderId)
                        groupJobChain.push({orderId: data2[i].orderId, jobChain: data2[i].jobChain});
                    else if (data2[i].job)
                        groupJobChain.push({job: data2[i].job});
                }
            }
            var theme = window.localStorage.$SOS$THEME;
            for (var index = 0; index < groupJobChain.length; index++) {
                var i = 0;
                orders[index] = {};
                orders[index].tasks = [];
                for (var index1 = 0; index1 < data2.length; index1++) {
                    if (data2[index1].orderId && (groupJobChain[index].jobChain == data2[index1].jobChain && groupJobChain[index].orderId == data2[index1].orderId)) {
                        orders[index].tasks[i] = {};
                        orders[index].name = data2[index1].jobChain.substring(data2[index1].jobChain);
                        orders[index].orderId = data2[index1].orderId;

                        vm.plans[index].processedPlanned = orders[index].name;
                        orders[index].tasks[i].name = orders[index].name;

                        vm.plans[index].status = data2[index1].state._text;
                        if (data2[index1].state._text == 'SUCCESSFUL') {
                            orders[index].tasks[i].color = "#7ab97a";
                        } else if (data2[index1].state._text == 'FAILED') {
                            orders[index].tasks[i].color = "#e86680";
                        }
                        else if (data2[index1].late) {
                            orders[index].tasks[i].color = "#ffc300";
                        } else {
                            if (theme != 'light' && theme != 'lighter')
                                orders[index].tasks[i].color = "#fafafa";
                        }
                        orders[index].tasks[i].from = new Date(data2[index1].plannedStartTime);

                        if (!minNextStartTime || minNextStartTime > new Date(data2[index1].plannedStartTime)) {
                            minNextStartTime = new Date(data2[index1].plannedStartTime);
                        }
                        if (!maxEndTime || maxEndTime < new Date(data2[index1].expectedEndTime)) {
                            maxEndTime = new Date(data2[index1].expectedEndTime);
                        }
                        orders[index].tasks[i].to = new Date(data2[index1].expectedEndTime);

                        if (data2[index1].startMode == 0) {
                            orders[index].tasks[i].startMode = 'label.singleStartMode';
                            orders[index].tasks[i].content = '<i class="fa fa-repeat1">';
                        } else if (data2[index1].startMode == 1) {
                            orders[index].tasks[i].startMode = 'label.startStartRepeatMode';
                            orders[index].tasks[i].content = '<img style="margin-left: -10px" src="images/start-start.png">';
                        } else if (data2[index1].startMode == 2) {
                            orders[index].tasks[i].startMode = 'label.startEndRepeatMode';
                            orders[index].tasks[i].content = '<img style="margin-left: -10px" src="images/end-start.png">';
                        }

                        if (data2[index1].period.repeat) {
                            var s = parseInt((data2[index1].period.repeat) % 60),
                                m = parseInt((data2[index1].period.repeat / 60) % 60),
                                h = parseInt((data2[index1].period.repeat / (60 * 60)) % 24);
                            h = h > 9 ? h : '0' + h;
                            m = m > 9 ? m : '0' + m;
                            s = s > 9 ? s : '0' + s;
                            orders[index].tasks[i].repeat = h + ':' + m + ':' + s;
                        }
                        i++;
                    } else if (data2[index1].job && (groupJobChain[index].job == data2[index1].job)) {
                        orders[index].tasks[i] = {};
                        orders[index].name = data2[index1].job;

                        vm.plans[index].processedPlanned = orders[index].name;
                        orders[index].tasks[i].name = orders[index].name;

                        vm.plans[index].status = data2[index1].state._text;
                        if (data2[index1].state._text == 'SUCCESSFUL') {
                            orders[index].tasks[i].color = "#7ab97a";
                        } else if (data2[index1].state._text == 'FAILED') {
                            orders[index].tasks[i].color = "#e86680";
                        }
                        else if (data2[index1].late) {
                            orders[index].tasks[i].color = "#ffc300";
                        } else {
                            if (theme != 'light' && theme != 'lighter')
                                orders[index].tasks[i].color = "#fafafa";
                        }
                        orders[index].tasks[i].from = new Date(data2[index1].plannedStartTime);

                        if (!minNextStartTime || minNextStartTime > new Date(data2[index1].plannedStartTime)) {
                            minNextStartTime = new Date(data2[index1].plannedStartTime);
                        }
                        if (!maxEndTime || maxEndTime < new Date(data2[index1].expectedEndTime)) {
                            maxEndTime = new Date(data2[index1].expectedEndTime);
                        }
                        orders[index].tasks[i].to = new Date(data2[index1].expectedEndTime);

                        if (data2[index1].startMode == 0) {
                            orders[index].tasks[i].startMode = 'label.singleStartMode';
                            orders[index].tasks[i].content = '<i class="fa fa-repeat1">';
                        } else if (data2[index1].startMode == 1) {
                            orders[index].tasks[i].startMode = 'label.startStartRepeatMode';
                            orders[index].tasks[i].content = '<img style="margin-left: -10px" src="images/start-start.png">';
                        } else if (data2[index1].startMode == 2) {
                            orders[index].tasks[i].startMode = 'label.startEndRepeatMode';
                            orders[index].tasks[i].content = '<img style="margin-left: -10px" src="images/end-start.png">';
                        }

                        if (data2[index1].period.repeat) {
                            var s = parseInt((data2[index1].period.repeat) % 60),
                                m = parseInt((data2[index1].period.repeat / 60) % 60),
                                h = parseInt((data2[index1].period.repeat / (60 * 60)) % 24);
                            h = h > 9 ? h : '0' + h;
                            m = m > 9 ? m : '0' + m;
                            s = s > 9 ? s : '0' + s;
                            orders[index].tasks[i].repeat = h + ':' + m + ':' + s;
                        }
                        i++;
                    }
                }
            }

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

            vm.data = orders;

            if (flag)
                promise1 = $timeout(function () {
                    if ($("#gantt-current-date-line").offset())
                        $('#div').animate({
                            scrollLeft: $("#gantt-current-date-line").offset().left
                        }, 500);
                    $timeout.cancel(promise1);
                }, 3500);
        }

        vm.load = function () {
            isLoaded = false;
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;

            if (vm.selectedFiltered) {
                isCustomizationSelected(true);
                obj = applySavedFilter(obj);
            } else {
                obj.dateFrom = vm.dailyPlanFilters.filter.from;
                obj.dateTo = vm.dailyPlanFilters.filter.to;

                if (vm.dailyPlanFilters.filter.status != 'ALL') {
                    obj.states = [];
                    if (vm.dailyPlanFilters.filter.status == 'WAITING') {
                        obj.states.push("PLANNED");
                    } else {
                        obj.states.push(vm.dailyPlanFilters.filter.status);
                    }
                }
                if (vm.dailyPlanFilters.filter.state == 'LATE') {
                    obj.late = true;
                }
            }
            if (!obj.dateFrom) {
                obj.dateFrom = new Date();
                obj.dateFrom.setHours(0);
                obj.dateFrom.setMinutes(0);
                obj.dateFrom.setSeconds(0);
                obj.dateFrom.setMilliseconds(0);
            }
            if (!obj.dateTo) {
                obj.dateTo = new Date();
                obj.dateTo.setDate(toDate.getDate() + 1);
                obj.dateTo.setHours(0);
                obj.dateTo.setMinutes(0);
                obj.dateTo.setSeconds(0);
                obj.dateTo.setMilliseconds(0);
            }
            vm.showSpinner = true;
            obj.timeZone = vm.userPreferences.zone;
            if ((obj.dateFrom && typeof obj.dateFrom.getMonth === 'function') || (obj.dateTo && typeof obj.dateTo.getMonth === 'function')) {
                delete obj['timeZone']
            }
            DailyPlanService.getPlans(obj).then(function (res) {
                vm.plans = res.planItems;
                vm.plans = sortByKey(vm.plans, vm.dailyPlanFilters.filter.sortBy, vm.dailyPlanFilters.reverse);
                prepareGanttData(vm.plans, true);
                if (res.created) {
                    vm.maxPlannedTime = new Date(res.deliveryDate);
                } else {
                    vm.maxPlannedTime = undefined;
                }
                vm.isLoading = true;
                isLoaded = true;
                vm.showSpinner = false;
            }, function (err) {
                vm.isLoading = true;
                isLoaded = true;
                vm.showSpinner = false;
            })
        };

        var reA = /[^a-zA-Z]/g;
        var reN = /[^0-9]/g;

        function sortByKey(array, key, order) {
            if (key == 'processedPlanned' || key == 'orderId') {
                return array.sort(function (x, y) {
                    var key1 = key == 'processedPlanned' ? x.orderId ? 'jobChain' : 'job' : key;

                    var a = x[key1];
                    var b = y[key1];
                    if (order) {
                        a = y[key1];
                        b = x[key1];
                    }

                    if (!a && b) {
                        if (key1 == 'job') {
                            a = x['jobChain'];
                            if (order) {
                                a = y['jobChain'];
                            }
                        } else if (key1 == 'jobChain') {
                            a = x['job'];
                            if (order) {
                                a = y['job'];
                            }
                        } else {
                            return -1;
                        }
                    } else if (a && !b) {
                        if (key1 == 'job') {
                            b = y['jobChain'];
                            if (order) {
                                b = x['jobChain'];
                            }
                        } else if (key1 == 'jobChain') {
                            b = y['job'];
                            if (order) {
                                b = x['job'];
                            }
                        } else {
                            return 1;
                        }
                    }

                    var AInt = parseInt(a, 10);
                    var BInt = parseInt(b, 10);

                    if (isNaN(AInt) && isNaN(BInt)) {
                        return naturalSorter(a, b);
                    } else if (isNaN(AInt)) {//A is not an Int
                        return 1;
                    } else if (isNaN(BInt)) {//B is not an Int
                        return -1;
                    } else if (AInt == BInt) {
                        var aA = a.replace(reA, "");
                        var bA = b.replace(reA, "");
                        return aA > bA ? 1 : -1;
                    } else {
                        return AInt > BInt ? 1 : -1;
                    }

                });
            } else if (key == 'duration') {
                return array.sort(function (x, y) {
                    var a = x;
                    var b = y;
                    if (!order) {
                        a = y;
                        b = x;
                    }
                    var m, n;
                    if (a.plannedStartTime && a.expectedEndTime) {
                        m = moment(a.plannedStartTime).diff(a.expectedEndTime);
                    }
                    if (b.plannedStartTime && b.expectedEndTime) {
                        n = moment(b.plannedStartTime).diff(b.expectedEndTime);
                    }
                    return m > n ? 1 : -1;
                });
            } else if (key == 'duration1') {
                return array.sort(function (x, y) {
                    var a = x;
                    var b = y;
                    if (!order) {
                        a = y;
                        b = x;
                    }

                    var m = 0, n = 0;
                    if (a.startTime && a.endTime) {
                        m = moment(a.startTime).diff(a.endTime) || 0;
                    }
                    if (b.startTime && b.endTime) {
                        n = moment(b.startTime).diff(b.endTime) || 0;
                    }
                    return m > n ? 1 : -1;
                });
            }
            else {
                return orderBy(array, key, order);
            }
        }

        function naturalSorter(as, bs) {
            var a, b, a1, b1, i = 0, n, L,
                rx = /(\.\d+)|(\d+(\.\d+)?)|([^\d.]+)|(\.\D+)|(\.$)/g;
            if (as === bs) return 0;
            a = as.toLowerCase().match(rx);
            b = bs.toLowerCase().match(rx);
            L = a.length;
            while (i < L) {
                if (!b[i]) return 1;
                a1 = a[i];
                b1 = b[i++];
                if (a1 !== b1) {
                    n = a1 - b1;
                    if (!isNaN(n)) return n;
                    return a1 > b1 ? 1 : -1;
                }
            }
            return b[i] ? -1 : 0;
        }

        /**--------------- filter, sorting and pagination -------------------*/
        vm.sortBy = function (propertyName) {
            vm.dailyPlanFilters.reverse = !vm.dailyPlanFilters.reverse;
            vm.dailyPlanFilters.filter.sortBy = propertyName;
            vm.plans = sortByKey(vm.plans, vm.dailyPlanFilters.filter.sortBy, vm.dailyPlanFilters.reverse);
            prepareGanttData(vm.plans, true);
        };

        function isCustomizationSelected(flag) {
            if (flag) {
                vm.temp_filter.status = angular.copy(vm.dailyPlanFilters.filter.status);
                vm.temp_filter.range = angular.copy(vm.dailyPlanFilters.filter.range);
                vm.dailyPlanFilters.filter.status = '';
                vm.dailyPlanFilters.filter.range = '';
            } else {
                if (vm.temp_filter.status) {
                    vm.dailyPlanFilters.filter.status = angular.copy(vm.temp_filter.status);
                    vm.dailyPlanFilters.filter.range = angular.copy(vm.temp_filter.range);
                } else {
                    vm.dailyPlanFilters.filter.status = 'ALL';
                    vm.dailyPlanFilters.filter.range = 'today';
                }
            }
        }

        vm.saveAsFilter = function (form) {
            var configObj = {};
            configObj.jobschedulerId = vm.schedulerIds.selected;
            configObj.account = vm.permission.user;
            configObj.configurationType = "CUSTOMIZATION";
            configObj.objectType = "DAILYPLAN";
            configObj.name = vm.searchDailyPlanFilter.name;
            configObj.id = 0;
            var fromDate;
            var toDate;
            var obj = {};
            obj.regex = vm.searchDailyPlanFilter.regex;
            obj.paths = vm.searchDailyPlanFilter.paths;
            obj.jobChain = vm.searchDailyPlanFilter.jobChain;
            obj.orderId = vm.searchDailyPlanFilter.orderId;
            obj.job = vm.searchDailyPlanFilter.job;
            obj.state = vm.searchDailyPlanFilter.state;
            obj.name = vm.searchDailyPlanFilter.name;
            if (vm.searchDailyPlanFilter.radio != 'current') {
                if (vm.searchDailyPlanFilter.from1) {
                    if (/^\s*(now\s*[-,+])\s*(\d+)\s*$/i.test(vm.searchDailyPlanFilter.from1)) {
                        fromDate = new Date();
                        var seconds = parseInt(/^\s*(now\s*\-)\s*(\d+)\s*$/i.exec(vm.searchDailyPlanFilter.from1)[2]);
                        fromDate.setSeconds(fromDate.getSeconds() - seconds);
                    } else if (/^\s*[-,+]?\d+[d,h,w]{1}\s*$/i.test(vm.searchDailyPlanFilter.from1)) {
                        fromDate = vm.searchDailyPlanFilter.from1;
                    } else if (/^\s*(Today)\s*$/i.test(vm.searchDailyPlanFilter.from1)) {
                        fromDate = '0d';
                    } else if (/^\s*(now)\s*$/i.test(vm.searchDailyPlanFilter.from1)) {
                        fromDate = new Date();
                    }
                }
                if (vm.searchDailyPlanFilter.to1) {
                    if (/^\s*(now\s*[-,+])\s*(\d+)\s*$/i.test(vm.searchDailyPlanFilter.to1)) {
                        toDate = new Date();
                        var seconds = parseInt(/^\s*(now\s*\+)\s*(\d+)\s*$/i.exec(vm.searchDailyPlanFilter.to1)[2]);
                        toDate.setSeconds(toDate.getSeconds() + seconds);
                    } else if (/^\s*[-,+]?\d+[d,h,w]{1}\s*$/i.test(vm.searchDailyPlanFilter.to1)) {
                        toDate = vm.searchDailyPlanFilter.to1;
                    } else if (/^\s*(Today)\s*$/i.test(vm.searchDailyPlanFilter.to1)) {
                        toDate = '0d';
                    } else if (/^\s*(now)\s*$/i.test(vm.searchDailyPlanFilter.to1)) {
                        toDate = new Date();
                    }
                }

            }
            if (fromDate) {
                obj.from = fromDate;
            } else {
                obj.from = '0d';
            }
            if (toDate) {
                obj.to = toDate;
            } else {
                obj.to = '0d';
            }
            configObj.configurationItem = JSON.stringify(obj);
            UserService.saveConfiguration(configObj).then(function (res) {
                configObj.id = res.id;
                vm.searchDailyPlanFilter.name = '';
                if (form)
                    form.$setPristine();
                vm.dailyPlanFilterList.push(configObj);
            });
        };
        vm.applyFilter = function () {
            vm.cancel();
            vm.dailyPlanFilter = {};
            vm.dailyPlanFilter.from = 'today';
            vm.dailyPlanFilter.to = 'today';
            vm.isUnique = true;
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/daily-plan-filter-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                size: 'lg',
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                var configObj = {};
                configObj.jobschedulerId = vm.schedulerIds.selected;
                configObj.account = vm.permission.user;
                configObj.configurationType = "CUSTOMIZATION";
                configObj.objectType = "DAILYPLAN";
                configObj.name = vm.dailyPlanFilter.name;
                configObj.shared = vm.dailyPlanFilter.shared;
                configObj.id = 0;
                if (!vm.dailyPlanFilter.from) {
                    vm.dailyPlanFilter.from = '0d';
                }
                if (!vm.dailyPlanFilter.to) {
                    vm.dailyPlanFilter.to = '0d';
                }
                configObj.configurationItem = JSON.stringify(vm.dailyPlanFilter);
                UserService.saveConfiguration(configObj).then(function (res) {
                    configObj.id = res.id;
                    vm.dailyPlanFilterList.push(configObj);

                    if (vm.dailyPlanFilterList.length == 1) {
                        vm.savedDailyPlanFilter.selected = res.id;
                        vm.dailyPlanFilters.selectedView = true;
                        vm.selectedFiltered = vm.dailyPlanFilter;
                        isCustomizationSelected(true);
                        vm.load();
                        SavedFilter.setDailyPlan(vm.savedDailyPlanFilter);
                        SavedFilter.save();
                    }
                });
                vm.object.paths = [];
            }, function () {
                vm.object.paths = [];
            });
        };

        vm.editFilters = function () {
            vm.filters = {};
            vm.filters.list = vm.dailyPlanFilterList;
            vm.filters.favorite = vm.savedDailyPlanFilter.favorite;

            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/edit-filter-dialog.html',
                controller: 'DialogCtrl',
                scope: vm
            });
        };
        var temp_name = '';
        vm.editFilter = function (filter) {
            vm.cancel();
            vm.action = 'edit';
            vm.isUnique = true;
            vm.dailyPlanFilter = {};
            temp_name = angular.copy(filter.name);
            UserService.configuration({jobschedulerId: filter.jobschedulerId, id: filter.id}).then(function (conf) {
                vm.dailyPlanFilter = JSON.parse(conf.configuration.configurationItem);
                vm.dailyPlanFilter.shared = filter.shared;
                vm.paths = vm.dailyPlanFilter.paths;
                vm.object.paths = vm.paths;
            });

            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/edit-daily-plan-filter-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                size: 'lg',
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                if (vm.savedDailyPlanFilter.selected == filter.id) {
                    vm.selectedFiltered = vm.dailyPlanFilter;
                    vm.dailyPlanFilters.selectedView = true;
                    isCustomizationSelected(true);
                    vm.load();
                }
                var configObj = {};
                configObj.jobschedulerId = filter.jobschedulerId;
                configObj.account = filter.account;
                configObj.configurationType = filter.configurationType;
                configObj.objectType = filter.objectType;
                configObj.configurationItem = JSON.stringify(vm.dailyPlanFilter);
                configObj.name = vm.dailyPlanFilter.name;
                configObj.id = filter.id;
                configObj.shared = vm.dailyPlanFilter.shared;

                if (!vm.dailyPlanFilter.from) {
                    vm.dailyPlanFilter.from = '0d';
                }
                if (!vm.dailyPlanFilter.to) {
                    vm.dailyPlanFilter.to = '0d';
                }
                UserService.saveConfiguration(configObj);
                filter.name = vm.dailyPlanFilter.name;
                temp_name = '';
                vm.object.paths = [];
            }, function () {
                temp_name = '';
                vm.object.paths = [];
            });
        };

        vm.copyFilter = function (filter) {
            vm.action = 'copy';
            vm.isUnique = true;
            vm.dailyPlanFilter = {};
            UserService.configuration({jobschedulerId: filter.jobschedulerId, id: filter.id}).then(function (conf) {
                vm.dailyPlanFilter = JSON.parse(conf.configuration.configurationItem);
                vm.dailyPlanFilter.shared = filter.shared;
                vm.paths = vm.dailyPlanFilter.paths;
                vm.object.paths = vm.paths;
                vm.dailyPlanFilter.name = vm.checkCopyName(vm.dailyPlanFilterList, filter.name);
            });

            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/edit-daily-plan-filter-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                size: 'lg',
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                var configObj = {};
                configObj.jobschedulerId = filter.jobschedulerId;
                configObj.account = vm.permission.user;
                configObj.configurationType = "CUSTOMIZATION";
                configObj.objectType = "DAILYPLAN";
                configObj.name = vm.dailyPlanFilter.name;
                configObj.shared = vm.dailyPlanFilter.shared;
                configObj.id = 0;

                configObj.configurationItem = JSON.stringify(vm.dailyPlanFilter);
                UserService.saveConfiguration(configObj).then(function (res) {
                    configObj.id = res.id;
                    vm.dailyPlanFilterList.push(configObj);
                });
                vm.object.paths = [];

            }, function () {
                vm.object.paths = [];
            });
        };

        vm.deleteFilter = function (filter) {
            UserService.deleteConfiguration({
                jobschedulerId: filter.jobschedulerId,
                id: filter.id
            }).then(function (res) {
                angular.forEach(vm.dailyPlanFilterList, function (value, index) {
                    if (value.id == filter.id) {
                        vm.dailyPlanFilterList.splice(index, 1);
                    }
                });

                if (vm.savedDailyPlanFilter.selected == filter.id) {
                    vm.savedDailyPlanFilter.selected = undefined;
                    isCustomizationSelected(false);
                    vm.dailyPlanFilters.selectedView = false;
                    vm.selectedFiltered = undefined;
                    setDateRange();
                    vm.load();
                } else {
                    if (vm.dailyPlanFilterList.length == 0) {
                        isCustomizationSelected(false);
                        vm.savedDailyPlanFilter.selected = undefined;
                        vm.dailyPlanFilters.selectedView = false;
                        vm.selectedFiltered = undefined;
                    }
                }
                SavedFilter.setDailyPlan(vm.savedDailyPlanFilter);
                SavedFilter.save();
            });
        };

        vm.makePrivate = function (configObj) {

            UserService.privateConfiguration({
                jobschedulerId: configObj.jobschedulerId,
                id: configObj.id
            }).then(function (conf) {
                configObj.shared = false;
                if (vm.permission.user != configObj.account) {
                    angular.forEach(vm.dailyPlanFilterList, function (value, index) {
                        if (value.id == configObj.id) {
                            vm.dailyPlanFilterList.splice(index, 1);
                        }
                    });
                }
            });
        };
        vm.makeShare = function (configObj) {
            UserService.shareConfiguration({
                jobschedulerId: configObj.jobschedulerId,
                id: configObj.id
            }).then(function (conf) {
                configObj.shared = true;
            });
        };
        vm.favorite = function (filter) {
            vm.savedDailyPlanFilter.favorite = filter.id;
            vm.dailyPlanFilters.selectedView = true;
            vm.filters.favorite = filter.id;
            SavedFilter.setDailyPlan(vm.savedDailyPlanFilter);
            SavedFilter.save();
            vm.load();
        };

        vm.removeFavorite = function () {
            vm.savedDailyPlanFilter.favorite = '';
            vm.filters.favorite = '';
            SavedFilter.setDailyPlan(vm.savedDailyPlanFilter);
            SavedFilter.save();
        };
        vm.checkFilterName = function () {
            vm.isUnique = true;
            if (vm.searchDailyPlanFilter && vm.searchDailyPlanFilter.name) {
                angular.forEach(vm.dailyPlanFilterList, function (value) {
                    if (vm.searchDailyPlanFilter.name == value.name && vm.permission.user == value.account) {
                        vm.isUnique = false;
                    }
                });
            } else if (vm.dailyPlanFilter) {
                angular.forEach(vm.dailyPlanFilterList, function (value) {
                    if (vm.dailyPlanFilter.name == value.name && vm.permission.user == value.account && vm.dailyPlanFilter.name != temp_name) {
                        vm.isUnique = false;
                    }
                });
            }
        };

        vm.changeFilter = function (filter) {
            vm.cancel();
            if (filter) {
                vm.savedDailyPlanFilter.selected = filter.id;
                vm.dailyPlanFilters.selectedView = true;
                UserService.configuration({jobschedulerId: filter.jobschedulerId, id: filter.id}).then(function (conf) {
                    vm.selectedFiltered = JSON.parse(conf.configuration.configurationItem);
                    vm.selectedFiltered.account = filter.account;
                    vm.load();
                });
            }
            else {
                isCustomizationSelected(false);
                vm.savedDailyPlanFilter.selected = filter;
                vm.dailyPlanFilters.selectedView = false;
                vm.selectedFiltered = filter;
                setDateRange();
                vm.load();
            }

            SavedFilter.setDailyPlan(vm.savedDailyPlanFilter);
            SavedFilter.save();

        };
        vm.getTreeStructure = function () {
            ResourceService.tree({
                jobschedulerId: vm.schedulerIds.selected,
                compact: true,
                types: ['DAILYPLAN']
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

        vm.addFolderPaths = function () {
            if (vm.dailyPlanFilter) {
                vm.dailyPlanFilter.paths = vm.paths;
            } else {
                vm.searchDailyPlanFilter.paths = vm.paths;
            }
        };
        vm.remove = function (object) {
            if (vm.dailyPlanFilter && vm.dailyPlanFilter.paths) {
                for (var i = 0; i < vm.dailyPlanFilter.paths.length; i++) {
                    if (angular.equals(vm.dailyPlanFilter.paths[i], object)) {
                        vm.dailyPlanFilter.paths.splice(i, 1);
                        break;
                    }
                }
            } else if (vm.searchDailyPlanFilter && vm.searchDailyPlanFilter.paths) {
                for (var i = 0; i < vm.searchDailyPlanFilter.paths.length; i++) {
                    if (angular.equals(vm.searchDailyPlanFilter.paths[i], object)) {
                        vm.searchDailyPlanFilter.paths.splice(i, 1);
                        break;
                    }
                }
            }
        };

        var isLoaded = true;
        vm.$on('event-started', function () {
            if (vm.events && vm.events[0] && vm.events[0].eventSnapshots)
                for (var i = 0; i <= vm.events[0].eventSnapshots.length - 1; i++) {
                    if (vm.events[0].eventSnapshots[i].eventType == 'DailyPlanChanged' && isLoaded) {
                        vm.getPlansByEvents();
                        break;
                    }
                }
        });

        vm.getPlansByEvents = function () {
            isLoaded = false;

            setDateRange();
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            if (vm.searchDailyPlanFilter && hitSearch) {
                obj = applySearchFilter(obj);
            } else {
                if (vm.selectedFiltered) {
                    obj = applySavedFilter(obj);
                } else {
                    obj.dateFrom = vm.dailyPlanFilters.filter.from;
                    obj.dateTo = vm.dailyPlanFilters.filter.to;

                    if (vm.dailyPlanFilters.filter.status != 'ALL') {
                        obj.states = [];
                        if (vm.dailyPlanFilters.filter.status == 'WAITING') {
                            obj.states.push("PLANNED");
                        } else {
                            obj.states.push(vm.dailyPlanFilters.filter.status);
                        }
                    }
                    if (vm.dailyPlanFilters.filter.state == 'LATE') {
                        obj.late = true;
                    }
                }
            }
            if (!obj.dateFrom) {
                obj.dateFrom = new Date();
                obj.dateFrom.setHours(0);
                obj.dateFrom.setMinutes(0);
                obj.dateFrom.setSeconds(0);
                obj.dateFrom.setMilliseconds(0);
            }
            if (!obj.dateTo) {
                obj.dateTo = new Date();
                obj.dateTo.setDate(toDate.getDate() + 1);
                obj.dateTo.setHours(0);
                obj.dateTo.setMinutes(0);
                obj.dateTo.setSeconds(0);
                obj.dateTo.setMilliseconds(0);
            }
            obj.timeZone = vm.userPreferences.zone;
            if ((obj.dateFrom && typeof obj.dateFrom.getMonth === 'function') || (obj.dateTo && typeof obj.dateTo.getMonth === 'function')) {
                delete obj['timeZone']
            }
            DailyPlanService.getPlans(obj).then(function (res) {
                vm.plans = res.planItems;
                isLoaded = true;
                vm.plans = sortByKey(vm.plans, vm.dailyPlanFilters.filter.sortBy, vm.dailyPlanFilters.reverse);
                prepareGanttData(vm.plans);
                if (res.created) {
                    vm.maxPlannedTime = new Date(res.deliveryDate);
                } else {
                    vm.maxPlannedTime = undefined;
                }
            }, function () {
                isLoaded = true;
            });
        };


        vm.$on('$destroy', function () {
            watcher1();
            if (promise1)
                $timeout.cancel(promise1);
        });


    }
})();
