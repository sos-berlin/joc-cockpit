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


    ResourceCtrl.$inject = ["$scope", "$rootScope", 'JobSchedulerService', "ResourceService", "orderByFilter", "gettextCatalog", "ScheduleService", "$uibModal", "CoreService", "$interval", "$timeout"];
    function ResourceCtrl($scope, $rootScope, JobSchedulerService, ResourceService, orderBy, gettextCatalog, ScheduleService, $uibModal, CoreService, $interval, $timeout) {
        var vm = $scope;
        vm.resourceFilters = CoreService.getResourceTab();
        vm.agentsFilters = vm.resourceFilters.agents;
        vm.locksFilters = vm.resourceFilters.locks;
        vm.processFilters = vm.resourceFilters.processClasses;
        vm.schdeuleFilters = vm.resourceFilters.schedules;

        vm.object = {};

        vm.tree = [];
        vm.treeLock = [];
        vm.treeProcess = [];
        vm.treeAgent = [];
        vm.my_tree = {};
        vm.my_tree_lock = {};
        vm.my_tree_process = {};
        vm.my_tree_agent = {};

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
            vm.schdeuleFilters.reverse = !vm.schdeuleFilters.reverse;
            vm.schdeuleFilters.filter.sortBy = propertyName;
        };
        vm.sortByL = function (propertyName) {
            vm.locksFilters.reverse = !vm.locksFilters.reverse;
            vm.locksFilters.filter.sortBy = propertyName;
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
                            } else {
                                scrTree[i].schedules = destTree[j].schedules;
                            }
                            scrTree[i].expanded = destTree[j].expanded;
                            scrTree[i].selected = destTree[j].selected;
                            scrTree[i].selected1 = destTree[j].selected1;
                            recursiveTreeUpdate(scrTree[i].folders, destTree[j].folders, type);
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
                            } else {
                                scrTree[i].schedules = destTree[j].schedules;
                            }
                            scrTree[i].expanded = destTree[j].expanded;
                            scrTree[i].selected = destTree[j].selected;
                            scrTree[i].selected1 = destTree[j].selected1;
                            recursiveTreeUpdate(scrTree[i].folders, destTree[j].folders, type);
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
        function initAgentTree() {

            ResourceService.tree({
                jobschedulerId: vm.schedulerIds.selected,
                compact: true,
                types: ['AGENTCLUSTER']
            }).then(function (res) {
                if (vm.isEmpty(vm.agentsFilters.expand_to)) {
                    vm.treeAgent = res.folders;
                    filteredTreeDataA();
                } else {
                    vm.agentsFilters.expand_to = vm.recursiveTreeUpdate(angular.copy(res.folders), vm.agentsFilters.expand_to, 'agent');
                    vm.treeAgent = vm.agentsFilters.expand_to;
                    previousTreeStateA();
                }
                vm.agentsFilters.expand_to = vm.treeAgent;

                vm.folderPathA = '/';
                vm.isLoading = true;
            }, function () {
                vm.isLoading = true;
            });
        }

        function filteredTreeDataA() {
            angular.forEach(vm.treeAgent, function (value) {
                value.expanded = true;
                value.selected1 = true;
                vm.allAgentClusters = [];
                checkExpandA(value);
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

            obj.folders = [
                {folder: data.path, recursive: false}
            ];
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


        function checkExpandA(data) {
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
                checkExpandA(value);
                if (value.expanded || value.selected1) {
                    if (data.path == '/') {
                        data.selected1 = false;
                    }
                }

            });
        }


        vm.showAgents = function (cluster) {
            cluster.show = true;
        };
        vm.hideAgents = function (cluster) {
            cluster.show = false;
        };

        vm.loadAgents = function () {
            vm.allAgentClusters = [];
            vm.loading = true;
            for (var i = 0; i < vm.treeAgent.length; i++) {
                if (vm.treeAgent[i].expanded || vm.treeAgent[i].selected1)
                    checkExpandTreeForUpdatesA(vm.treeAgent[i]);
            }
        };

        function checkExpandTreeForUpdatesA(data) {
            if (data.selected1) {
                var obj = {};
                obj.jobschedulerId = vm.schedulerIds.selected;
                if (vm.agentsFilters.filter.state != 'all') {
                    obj.state = vm.agentsFilters.filter.state == '0' ? 0 : vm.agentsFilters.filter.state == '1' ? 1 : 2;
                }

                obj.folders = [
                    {folder: data.path, recursive: false}
                ];

                JobSchedulerService.getAgentCluster(obj).then(function (result) {

                    angular.forEach(result.agentClusters, function (value) {
                        if (data.path == value.path.substring(0, value.path.lastIndexOf('/')) || data.path == value.path.substring(0, value.path.lastIndexOf('/') + 1)) {
                            data.agentClusters.push(value);
                            value.path1 = data.path;
                            vm.allAgentClusters.push(value);
                        }
                    });
                    vm.loading = false;
                }, function () {
                    vm.loading = false;
                });

            }

            data.folders = orderBy(data.folders, 'name');
            angular.forEach(data.folders, function (value) {
                if (value.expanded || value.selected1)
                    checkExpandTreeForUpdatesA(value);
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
                // vm.agentClusters = result.agentClusters;
                angular.forEach(result.agentClusters, function (value) {
                    if (data.path == value.path.substring(0, value.path.lastIndexOf('/')) || data.path == value.path.substring(0, value.path.lastIndexOf('/') + 1)) {
                        data.agentClusters.push(value);
                        value.path1 = data.path;
                        vm.allAgentClusters.push(value);
                    }
                });
                vm.loading = false;
                vm.folderPathA = data.name || '/';
                //startTraverseNodeA(data);
            }, function () {
                vm.loading = false;
            });
        }

        function startTraverseNodeA(data) {
            vm.allAgentClusters = [];
            function recursive(data) {
                data.expanded = !0;
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

                vm.folderPathL = '/';
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
                data.expanded = !0;
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
                if (value.expanded || value.selected1) {
                    if (data.path == '/') {
                        data.selected1 = false;
                    }
                }

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

                if (vm.isEmpty(vm.processFilters.expand_to)) {
                    vm.treeProcess = angular.copy(res.folders);
                    filteredTreeDataP();
                } else {

                    vm.processFilters.expand_to = vm.recursiveTreeUpdate(angular.copy(res.folders), vm.processFilters.expand_to, 'processClass');
                    vm.treeProcess = vm.processFilters.expand_to;
                    previousTreeStateP();
                }
                vm.processFilters.expand_to = vm.treeProcess;

                vm.folderPath = '/';

                vm.isLoading = true;
            }, function (err) {
                vm.isLoading = true;
            });
        }

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
                data.expanded = !0;
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

                checkExpandP(value);
                if (value.expanded || value.selected1) {
                    if (data.path == '/') {
                        data.selected1 = false;
                    }
                }

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


        /** <<<<<<<<<<<<< End ProcessClass >>>>>>>>>>>>>>> */


        /** -----------------Begin Schedules------------------- */


        vm.allCheck = {
            checkbox: false
        };

        var watcher1 = $scope.$watchCollection('object.schedules', function (newNames) {
            if (newNames && newNames.length > 0) {
                vm.allCheck.checkbox = newNames.length == vm.allSchedules.slice((vm.schdeuleFilters.pageSize * (vm.schdeuleFilters.currentPage - 1)), (vm.schdeuleFilters.pageSize * vm.schdeuleFilters.currentPage)).length;
            } else {
                vm.allCheck.checkbox = false;
            }
        });

        var watcher3 = $scope.$watch('schdeuleFilters.pageSize', function (newNames) {
            if (newNames)
                vm.object.schedules = [];
        });

        vm.checkAll = function () {
            if (vm.allCheck.checkbox && vm.allSchedules.length > 0) {
                vm.object.schedules = vm.allSchedules.slice((vm.schdeuleFilters.pageSize * (vm.schdeuleFilters.currentPage - 1)), (vm.schdeuleFilters.pageSize * vm.schdeuleFilters.currentPage));
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
                if (res.configuration) {
                    vm.runTimes = res.configuration;
                    vm.runTimes.content = vm.runTimes.content.xml;
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

        function setRunTime(schedule) {
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
                if (res.configuration) {
                    vm.runTimes = res.configuration;
                    vm.runTimes.content = vm.runTimes.content.xml;
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

                if (vm.isEmpty(vm.schdeuleFilters.expand_to)) {
                    vm.tree = angular.copy(res.folders);
                    filteredTreeData();
                } else {
                    vm.schdeuleFilters.expand_to = vm.recursiveTreeUpdate(angular.copy(res.folders), vm.schdeuleFilters.expand_to, 'schedule');
                    vm.tree = vm.schdeuleFilters.expand_to;
                    previousTreeState();
                }
                vm.schdeuleFilters.expand_to = vm.tree;

                vm.folderPath = '/';
                vm.isLoading = true;
            }, function (err) {
                vm.isLoading = true;
            });
        }


        function checkExpandTreeForUpdates(data) {
            if (data.selected1) {
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
            data.folders = orderBy(data.folders, 'name');
            angular.forEach(data.folders, function (value) {
                if (value.expanded || value.selected1)
                    checkExpandTreeForUpdates(value);
            });
        }

        vm.changeState = function () {
            vm.allSchedules = [];
            vm.loading = true;
            angular.forEach(vm.tree, function (value) {
                if (value.expanded || value.selected1)
                    checkExpandTreeForUpdates(value);
            });
        };

        function filteredTreeData() {
            vm.allSchedules = [];
            angular.forEach(vm.tree, function (value) {
                value.expanded = true;
                value.selected1 = true;

                checkExpand(value);
            });
        }

        function previousTreeState() {
            vm.allSchedules = [];
            angular.forEach(vm.tree, function (value) {

                checkExpand(value);
            });
        }

        function volatileInformation(obj, expandNode) {
            if (vm.schdeuleFilters.filter.state != 'all') {
                obj.state = [];
                obj.state.push(vm.schdeuleFilters.filter.state);
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
            if (vm.schdeuleFilters.filter.state != 'all') {
                obj.state = [];
                obj.state.push(vm.schdeuleFilters.filter.state);
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
            if (vm.schdeuleFilters.filter.state != 'all') {
                obj.state = [];
                obj.state.push(vm.schdeuleFilters.filter.state);
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
            vm.reset();
            navFullTree();
            vm.allSchedules = [];
            vm.loading = true;
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
                data.expanded = !0;
                data.folders = orderBy(data.folders, 'name');
                vm.folderPathS = data.name || '/';

                data.schedules = [];
                angular.forEach(vm.schedules, function (value) {
                    if (data.path == value.path.substring(0, value.path.lastIndexOf('/'))) {
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

                checkExpand(value);
                if (value.expanded || value.selected1) {
                    if (data.path == '/') {
                        data.selected1 = false;
                    }
                }
            });
        }


        var t1 = '';
        $scope.$on('event-started', function () {
            if (vm.events && vm.events[0] && vm.events[0].eventSnapshots)
                angular.forEach(vm.events[0].eventSnapshots, function(event) {
                    if (event.eventType.indexOf("FileBased") !== -1) {
                        if (t1) {
                            $timeout.cancel(t1);
                        }
                        t1 = $timeout(function () {
                            if (vm.resourceFilters.state == 'lock' && event.objectType == 'LOCK') {
                                ResourceService.tree({
                                    jobschedulerId: vm.schedulerIds.selected,
                                    compact: true,
                                    types: ['LOCK']
                                }).then(function (res) {

                                    vm.locksFilters.expand_to = vm.recursiveTreeUpdate(angular.copy(res.folders), vm.locksFilters.expand_to, 'lock');
                                    vm.treeLock = vm.locksFilters.expand_to;

                                });

                                var path = [];
                                if (event.path.indexOf(",") > -1) {
                                    path = event.path.split(",");
                                } else {
                                    path[0] = event.path;
                                }
                                if (vm.allLocks.length > 0) {
                                    for (var j = 0; j < vm.allLocks.length; j++) {
                                        if (path[0].substring(0, path[0].lastIndexOf('/')) == vm.allLocks[j].path.substring(0, vm.allLocks[j].path.lastIndexOf('/'))) {
                                            navFullTreeForUpdateLock(path[0].substring(0, path[0].lastIndexOf('/')));
                                            break;
                                        }
                                    }
                                } else {
                                    navFullTreeForUpdateLock(path[0].substring(0, path[0].lastIndexOf('/')));
                                }

                            } else if (vm.resourceFilters.state == 'processClass' && event.objectType == 'PROCESSCLASS') {
                                ResourceService.tree({
                                    jobschedulerId: vm.schedulerIds.selected,
                                    compact: true,
                                    types: ['PROCESSCLASS']
                                }).then(function (res) {

                                    vm.processFilters.expand_to = vm.recursiveTreeUpdate(angular.copy(res.folders), vm.processFilters.expand_to, 'processClass');
                                    vm.treeProcess = vm.processFilters.expand_to;

                                });

                                var path = [];
                                if (event.path.indexOf(",") > -1) {
                                    path = event.path.split(",");
                                } else {
                                    path[0] = event.path;
                                }
                                if (vm.allProcessClasses.length > 0) {
                                    for (var j = 0; j < vm.allProcessClasses.length; j++) {
                                        if (path[0].substring(0, path[0].lastIndexOf('/')) == vm.allProcessClasses[j].path.substring(0, vm.allProcessClasses[j].path.lastIndexOf('/'))) {
                                            navFullTreeForUpdateProcess(path[0].substring(0, path[0].lastIndexOf('/')));
                                            break;
                                        }
                                    }
                                } else {
                                    navFullTreeForUpdateProcess(path[0].substring(0, path[0].lastIndexOf('/')));
                                }
                            } else if (vm.resourceFilters.state == 'schedules' && event.objectType == 'SCHEDULE') {
                                ResourceService.tree({
                                    jobschedulerId: vm.schedulerIds.selected,
                                    compact: true,
                                    types: ['SCHEDULE']
                                }).then(function (res) {
                                    vm.schdeuleFilters.expand_to = vm.recursiveTreeUpdate(angular.copy(res.folders), vm.schdeuleFilters.expand_to, 'schedule');
                                    vm.tree = vm.schdeuleFilters.expand_to;
                                });

                                var path = [];
                                if (event.path.indexOf(",") > -1) {
                                    path = event.path.split(",");
                                } else {
                                    path[0] = event.path;
                                }
                                if (vm.allSchedules.length > 0) {
                                    for (var j = 0; j < vm.allSchedules.length; j++) {
                                        if (path[0].substring(0, path[0].lastIndexOf('/')) == vm.allSchedules[j].path.substring(0, vm.allSchedules[j].path.lastIndexOf('/'))) {
                                            navFullTreeForUpdateSchedule(path[0].substring(0, path[0].lastIndexOf('/')));
                                            break;
                                        }
                                    }
                                } else {
                                    navFullTreeForUpdateSchedule(path[0].substring(0, path[0].lastIndexOf('/')));
                                }

                            } else if (vm.resourceFilters.state == 'agent') {
                                ResourceService.tree({
                                    jobschedulerId: vm.schedulerIds.selected,
                                    compact: true,
                                    types: ['AGENTCLUSTER']
                                }).then(function (res) {
                                    vm.agentsFilters.expand_to = vm.recursiveTreeUpdate(angular.copy(res.folders), vm.agentsFilters.expand_to, 'agent');
                                    vm.treeAgent = vm.agentsFilters.expand_to;
                                });
                            }

                            $timeout.cancel(t1);
                        }, 5000);
                    }
                    if (event.eventType.indexOf("Task") !== -1 && vm.resourceFilters.state == 'processClass') {
                        angular.forEach(vm.allProcessClasses, function (value2, index) {
                            if (event.path != undefined) {
                                if (value2.path == event.path) {
                                    var obj = {};
                                    obj.jobschedulerId = $scope.schedulerIds.selected;
                                    obj.folders = [{folder: value2.path, recursive: false}];
                                    ResourceService.getProcessClass(obj).then(function (res) {
                                        if (res.processClasses) {
                                            vm.allProcessClasses[index] = angular.merge(vm.allProcessClasses[index], res.processClasses[0]);
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


        function filteredVolatileTreeData() {
            angular.forEach(vm.tree, function (value) {
                if (value.expanded)
                    checkExpandTreeForUpdates(value);
            });
        }


        /** -----------------End Schedules------------------- */


        $scope.$on('$stateChangeSuccess', function (event, toState, toParams) {

            if (toState.name == 'app.resources.agentClusters') {
                vm.resourceFilters.state = 'agent';
                if (toParams.type)
                    vm.agentsFilters.filter.state = toParams.type == 'healthy' ? '0' : toParams.type == 'unhealthy' ? '1' : '2';
                vm.treeAgent = [];
                initAgentTree();
            } else if (toState.name == 'app.resources.locks') {
                vm.resourceFilters.state = 'lock';
                vm.treeLock = [];
                initLockTree();
            } else if (toState.name == 'app.resources.processClasses') {
                vm.resourceFilters.state = 'processClass';
                vm.treeProcess = [];
                initProccessTree();
            } else {
                vm.resourceFilters.state = 'schedules';
                vm.tree = [];
                initTree();
            }
            startPolling();

        });

        var interval1, interval2;

        function poll1() {
            interval1 = $interval(function () {
                for (var i = 0; i < vm.treeAgent.length; i++) {
                    if (vm.treeAgent[i].expanded || vm.treeAgent[i].selected1)
                        checkExpandTreeForUpdatesA(vm.treeAgent[i]);
                }
            }, 60 * 1000)
        }

        function poll2() {
            interval2 = $interval(function () {
                filteredVolatileTreeData();
            }, 60 * 1000)
        }

        function startPolling() {
            $interval.cancel(interval1);
            $interval.cancel(interval2);
            if (vm.resourceFilters.state == 'agent') {
               //  poll1();
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
            $interval.cancel(interval1);
            $interval.cancel(interval2);
            if (t1) {
                $timeout.cancel(t1);
            }
        });
    }


    ScheduleOrderCtrl.$inject = ["$scope", "$rootScope", "ScheduleService", "$stateParams", "$location", "OrderService", "$uibModal", "CoreService"];
    function ScheduleOrderCtrl($scope, $rootScope, ScheduleService, $stateParams, $location, OrderService, $uibModal, CoreService) {
        var vm = $scope;
        vm.name = $stateParams.name;
        var object = $location.search();

        vm.path = object.path;

        vm.orderFilters = CoreService.getOrderTab1();
        vm.orderFilters.currentPage = 1;

        vm.reset = function () {
            vm.object = {};
        };
        vm.object = {};

        /**--------------- sorting and pagination -------------------*/
        vm.sortBy = function (propertyName) {
            vm.object.orders = [];
            vm.orderFilters.reverse = !vm.orderFilters.reverse;
            vm.orderFilters.filter.sortBy = propertyName;
        };


        function loadOrderV(orders) {
            OrderService.get({
                jobschedulerId: $scope.schedulerIds.selected,
                orders: orders,
                compact: true
            }).then(function (res) {
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

        vm.orders = [];
        function loadOrders(orders) {
            OrderService.getOrdersP({
                jobschedulerId: $scope.schedulerIds.selected,
                compact: true,
                orders: orders
            }).then(function (result) {
                angular.forEach(result.orders, function (value) {
                    value.path1 = value.path.substring(1, value.path.lastIndexOf('/'));
                    console.log(value.path1)
                });
                vm.orders = result.orders;
                vm.isLoading = true;
                loadOrderV(orders);
            }, function () {
                vm.isLoading = true;
                loadOrderV(orders);
            });
        }


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
                if (res.configuration) {
                    vm.runTimes = res.configuration;
                    vm.runTimes.content = vm.runTimes.content.xml;
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
                if (res.configuration) {
                    vm.runTimes = res.configuration;
                    vm.runTimes.content = vm.runTimes.content.xml;
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
                vm.object.orders = [];
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
                vm.object.orders = [];
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
                vm.object.orders = [];

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

                vm.object.orders = [];
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
                vm.object.orders = [];
            });

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

        $scope.$on('event-started', function () {
            if (vm.events && vm.events[0] && vm.events[0].eventSnapshots)
                for (var i = 0; i < vm.events[0].eventSnapshots.length; i++) {
                    if (vm.events[0].eventSnapshots[i].path != undefined && vm.events[0].eventSnapshots[i].eventType.indexOf("Order") !== -1) {
                        angular.forEach(vm.orders, function (value2, index) {
                            var path = vm.events[0].eventSnapshots[i].path;
                            if (value2.path == path) {

                                var obj = {};
                                obj.jobschedulerId = $scope.schedulerIds.selected;
                                obj.orderId = value2.orderId;
                                obj.jobChain = value2.jobChain;
                                obj.compact = true;
                                OrderService.getOrder(obj).then(function (res) {
                                    if (res.order) {
                                        vm.orders[index] = angular.merge(vm.orders[index], res.order);
                                    }
                                });
                            }
                        });
                    }
                }
        });
    }

    DashboardCtrl.$inject = ['$scope', 'OrderService', 'JobSchedulerService', 'ResourceService', '$interval', '$state', '$uibModal', 'DailyPlanService', 'moment', '$rootScope', '$timeout', 'CoreService'];
    function DashboardCtrl($scope, OrderService, JobSchedulerService, ResourceService, $interval, $state, $uibModal, DailyPlanService, moment, $rootScope, $timeout, CoreService) {
        var vm = $scope;
        var bgColorArray = [];

        vm.dashboardFilters = CoreService.getDashboardTab();

        vm.clusterStatusPollingInterval = 2 * 60 * 1000;

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

        vm.getAgentClusterRunningTask = function () {
            var agentArray = [];
            ResourceService.getProcessClass({
                jobschedulerId: $scope.schedulerIds.selected,
                isAgentCluster: true
            }).then(function (res) {
                if (res.processClasses) {
                    vm.processClasses = res.processClasses;
                    angular.forEach(vm.processClasses, function (value) {
                        agentArray.push([value.path, value.numOfProcesses]);
                    });
                    vm.agentStatusChart = [
                        {
                            "key": "Agents",
                            "values": agentArray
                        }
                    ];

                }
            });

        };
        if (vm.permission.ProcessClass.view.status)
            vm.getAgentClusterRunningTask();

        function prepareAgentClusterData(result) {
            var agentArray1 = [];
            vm.YAxisDomain = [0, 3];
            //vm.YAxisDomain[0] = 0;

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


                if (d % 1 === 0) {
                    return d3.format(',f')(d);

                } else {
                    return;
                }

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

        var interval = undefined;

        function prepareClusterStatusData() {
            clusterStatusData = {};
            getDatabase().then(function (res) {
                clusterStatusData.database = res;
                getClusterMembersP().then(function (res) {
                    clusterStatusData.members = res;
                    vm.clusterStatusData = clusterStatusData;
                    $rootScope.$broadcast('reloadScheduleDetail', vm.clusterStatusData.members);
                    interval = $timeout(function () {
                        vm.clusterStatusData = clusterStatusData;
                        $rootScope.$broadcast('clusterStatusDataChanged');
                    }, 100);

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
            } else if ((objectType == 'supervisor' || objectType == 'master') && action == 'abort') {
                JobSchedulerService.abort(host, port, $scope.schedulerIds.selected).then(function (res) {
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

        function setDateRange(range) {
            var from = new Date();
            var to = new Date();
            if (range == 'today' || !range) {
                from.setHours(0);
                from.setMinutes(0);
                from.setSeconds(0);
                from.setMilliseconds(0);
                to.setDate(to.getDate() + 1);
                to.setHours(0);
                to.setMinutes(0);
                to.setSeconds(0);
                to.setMilliseconds(0);
            } else if (range == 'next-24-hours') {

                from.setDate(from.getDate() + 1);

                to.setDate(to.getDate() + 2);

            }

            vm.dashboardFilters.filter.from = from;
            vm.dashboardFilters.filter.to = to;
        }


        vm.getDailyPlans = function () {
            var obj = {};
            obj.jobschedulerId = $scope.schedulerIds.selected;

            if (vm.dashboardFilters.filter.range == 'next-24-hours') {
                setDateRange(vm.dashboardFilters.filter.range);
            }
            if (vm.dashboardFilters.filter.range == 'today') {
                setDateRange(vm.dashboardFilters.filter.range);
            }
            if (vm.dashboardFilters.filter.range == "today") {
                obj.dateFrom = vm.dashboardFilters.filter.from;
                obj.dateTo = vm.dashboardFilters.filter.to;
            } else {
                obj.dateFrom = vm.dashboardFilters.filter.from;
                obj.dateTo = vm.dashboardFilters.filter.to;
            }

            DailyPlanService.getPlans(obj).then(function (res) {
                vm.planItemData = res.planItems;
                filterData();
            }, function (err) {

            })
        };

        if (vm.permission.DailyPlan.view.status)
            vm.getDailyPlans();


        function setOrderDateRange(range) {
            var from = new Date();
            var to = new Date();
            if (range == 'today' || !range) {
                from.setHours(0);
                from.setMinutes(0);
                from.setSeconds(0);
                from.setMilliseconds(0);
                to.setDate(to.getDate() + 1);
                to.setHours(0);
                to.setMinutes(0);
                to.setSeconds(0);
                to.setMilliseconds(0);
            } else if (range == 'next-24-hours') {

                from.setDate(from.getDate() + 1);

                to.setDate(to.getDate() + 2);

            }

            vm.dashboardFilters.filter.orderSummaryfrom = from;
            vm.dashboardFilters.filter.orderSummaryto = to;
        }

        vm.getOrderSummary = function () {
            var obj = {};
            obj.jobschedulerId = $scope.schedulerIds.selected;
            if (vm.dashboardFilters.filter.orderRange == 'next-24-hours') {
                setOrderDateRange(vm.dashboardFilters.filter.orderRange);

            }
            if (vm.dashboardFilters.filter.orderRange == 'today') {
                setOrderDateRange(vm.dashboardFilters.filter.orderRange);
            }
            if (vm.dashboardFilters.filter.orderRange == "today") {
                obj.dateFrom = vm.dashboardFilters.filter.orderSummaryfrom;
                obj.dateTo = vm.dashboardFilters.filter.orderSummaryto;
            } else {
                obj.dateFrom = vm.dashboardFilters.filter.orderSummaryfrom;
            }
            OrderService.getSummary(obj).then(function (res) {

                vm.orderSummary = res.orders;

                vm.orderSummary.total = vm.orderSummary.successful + vm.orderSummary.failed;
                if (vm.orderSummary.successful == 0) {
                    vm.orderSummary.percent = 0;
                } else {
                    vm.orderSummary.percent = (vm.orderSummary.successful / 1) / 100;
                }

            }, function (err) {

            })
        };
        vm.getOrderSummary();

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
            vm.arrayWidth = [];
            vm.arrayWidth[0] = vm.waiting;
            vm.arrayWidth[1] = vm.late;
            vm.arrayWidth[2] = vm.executed;
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
                vm.arrayWidth[2] = vm.executed;
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

        var int = '';
        $scope.$on('event-started', function () {
            if (vm.events && vm.events[0] && vm.events[0].eventSnapshots)
                for (var i = 0; i <= vm.events[0].eventSnapshots.length - 1; i++) {
                    if (vm.events[0].eventSnapshots[i].eventType.indexOf("Order") !== -1) {
                        vm.loadOrderSnapshot();
                        vm.getOrderSummary();
                        if (vm.events[0].eventSnapshots[i].eventType == 'OrderStarted' || vm.events[0].eventSnapshots[i].eventType == 'OrderFinished')
                            vm.getAgentClusterRunningTask();
                        if (int)
                            $timeout.cancel(int);
                        if (vm.events[0].eventSnapshots[i].eventType == 'OrderFinished')
                            int = $timeout(function () {
                                vm.getDailyPlans();
                                $timeout.cancel(int);
                            }, 5000);
                        break;
                    }
                }
        });

        $scope.$on('$destroy', function () {
            $timeout.cancel(interval);
            $timeout.cancel(int);
        });
    }

    DailyPlanCtrl.$inject = ['$scope', '$timeout', 'gettextCatalog', 'orderByFilter', '$uibModal', 'SavedFilter', 'toasty', 'DailyPlanService', 'JobChainService', '$stateParams', 'CoreService'];
    function DailyPlanCtrl($scope, $timeout, gettextCatalog, orderBy, $uibModal, SavedFilter, toasty, DailyPlanService, JobChainService, $stateParams, CoreService) {
        var vm = $scope;
        vm.todayDate = new Date();
        vm.dailyPlanFilters = CoreService.getDailyPlanTab();

        vm.showPanel = '';
        vm.showLogPanel = undefined;
        vm.object = {};
        vm.tree = [];
        var selectedFiltered;
        var promise1;

        vm.savedDailyPlanFilter = JSON.parse(SavedFilter.dailyPlanFilters) || {};
        vm.savedDailyPlanFilter.list = vm.savedDailyPlanFilter.list || [];

        if (vm.dailyPlanFilters.selectedView)
            vm.savedDailyPlanFilter.selected = vm.savedDailyPlanFilter.favorite;

        if (vm.savedDailyPlanFilter.selected) {
            angular.forEach(vm.savedDailyPlanFilter.list, function (value) {
                if (value.name == vm.savedDailyPlanFilter.selected) {
                    selectedFiltered = value;
                }
            });
        }

        function setDateRange(range) {
            var from = new Date();
            var to = new Date();
            if (range == 'today' || !range) {
                from.setHours(0);
                from.setMinutes(0);
                from.setSeconds(0);
                from.setMilliseconds(0);
                to.setDate(to.getDate() + 1);
                to.setHours(0);
                to.setMinutes(0);
                to.setSeconds(0);
                to.setMilliseconds(0);
                vm.currentDateValue = new Date();
            } else if (range == 'next-24-hours') {
                from.setDate(from.getDate() + 1);
                to.setDate(to.getDate() + 2);
                vm.currentDateValue = from;
            }
            vm.dailyPlanFilters.filter.from = from;
            vm.dailyPlanFilters.filter.to = to;
        }

        if (!vm.dailyPlanFilters.filter.from || !vm.dailyPlanFilters.filter.to) {
            setDateRange();
        }

        vm.getPlans = function () {
            if (vm.dailyPlanFilters.range != 'period') {
                vm.dailyPlanFilters.filter.range = undefined;
            }
            if (vm.dailyPlanFilters.filter.range == 'next-24-hours') {
                setDateRange(vm.dailyPlanFilters.filter.range);
            }
            if (vm.dailyPlanFilters.filter.range == 'today') {
                setDateRange(vm.dailyPlanFilters.filter.range);
            }
            vm.load();
        };


        vm.exportToExcel = function () {
            $('#exportToExcelBtn').attr("disabled", true);

            $('#dailyPlanTableId').table2excel({
                exclude: ".noExl",
                filename: "jobscheduler-dailyplan",
                fileext: ".xls",
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
            treeTableColumns: ['model.name', 'model.orderId'],
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


            for (var index = 0; index < groupJobChain.length; index++) {
                var i = 0;
                orders[index] = {};
                orders[index].tasks = [];
                for (var index1 = 0; index1 < data2.length; index1++) {

                    if (groupJobChain[index].jobChain == data2[index1].jobChain) {

                        orders[index].tasks[i] = {};
                        if (data2[index1].job != undefined) {
                            orders[index].name = data2[index1].job;
                            orders[index].orderId = '-';
                        } else {
                            orders[index].name = data2[index1].jobChain.substring(data2[index1].jobChain);
                            orders[index].orderId = data2[index1].orderId;
                        }

                        vm.plans[index].processedPlanned = orders[index].name;
                        orders[index].tasks[i].name = orders[index].name;

                        vm.plans[index].status = data2[index1].state._text;
                        if (data2[index1].state._text == 'SUCCESSFUL') {
                            orders[index].tasks[i].color = "#7ab97a";
                        } else if (data2[index1].state._text == 'FAILED') {
                            orders[index].tasks[i].color = "#e86680";
                        }
                        else if (data2[index1].late) {
                            orders[index].tasks[i].color = "rgba(255, 195, 0, .9)";
                        }

                        orders[index].tasks[i].from = new Date(data2[index1].plannedStartTime);

                        if (!minNextStartTime || minNextStartTime > new Date(data2[index1].plannedStartTime)) {
                            minNextStartTime = new Date(data2[index1].plannedStartTime);
                        }
                        if (!maxEndTime || maxEndTime < new Date(data2[index1].expectedEndTime)) {
                            maxEndTime = new Date(data2[index1].expectedEndTime);
                        }
                        orders[index].tasks[i].to = new Date(data2[index1].expectedEndTime);
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

            vm.data = orderBy(orders, 'plannedStartTime');
            // console.info("data:" + JSON.stringify(vm.data));

            promise1 = $timeout(function () {
                $('#div').animate({
                    scrollLeft: $("#gantt-current-date-line").offset().left
                }, 500);
            }, 4000);
        }

        vm.load = function () {
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;

            if (selectedFiltered) {
                obj = applySavedFilter(obj);
            } else {
                obj.dateFrom = vm.dailyPlanFilters.filter.from;
                obj.dateTo = vm.dailyPlanFilters.filter.to;

                if (vm.dailyPlanFilters.filter.status != 'ALL') {
                    obj.states = [];
                    if (vm.dailyPlanFilters.filter.status == 'WAITING') {
                        obj.states.push("PLANNED");
                    } else if (vm.dailyPlanFilters.filter.status == 'EXECUTED') {
                        obj.states.push("SUCCESSFUL");
                        obj.states.push("FAILED");
                    }
                    if (vm.dailyPlanFilters.filter.status == 'LATE') {
                        obj.late = true;
                    }
                }
            }
            vm.showSpinner = true;
            $scope.startSpin();

            DailyPlanService.getPlans(obj).then(function (res) {
                vm.plans = res.planItems;

                //if (vm.pageView == 'grid')
                prepareGanttData(vm.plans);
                vm.isLoading = true;
                vm.showSpinner = false;
                $scope.stopSpin();
            }, function (err) {
                vm.isLoading = true;
                vm.showSpinner = false;
                $scope.stopSpin();
            })
        };

        // console.info($stateParams);
        if ($stateParams.filter != null) {
            if ($stateParams.filter == 1) {
                vm.dailyPlanFilters.filter.status = 'WAITING';
            }
            if ($stateParams.filter == 2) {
                vm.dailyPlanFilters.filter.status = 'LATE';
            }

            if ($stateParams.filter == 3) {
                vm.dailyPlanFilters.filter.status = 'EXECUTED';
            }

            if ($stateParams.day == 'next-24-hours') {
                setDateRange('next-24-hours');
            }
            if ($stateParams.day == 'today') {
                setDateRange('today');
            }
            //vm.load();
        }

        /**--------------- filter, sorting and pagination -------------------*/
        vm.sortBy = function (propertyName) {
            vm.dailyPlanFilters.reverse = !vm.dailyPlanFilters.reverse;
            vm.dailyPlanFilters.filter.sortBy = propertyName;
            if (vm.pageView == 'grid') {
                vm.plans = orderBy(vm.plans, vm.dailyPlanFilters.filter.sortBy, vm.dailyPlanFilters.reverse);
                prepareGanttData(vm.plans);
            }
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
                    vm.dailyPlanFilters.selectedView = true;
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
                    vm.dailyPlanFilters.selectedView = true;
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

        vm.deleteFilter = function (name) {
            angular.forEach(vm.savedDailyPlanFilter.list, function (value, index) {
                if (value.name == name) {
                    toasty.success({
                        title: value.name + ' ' + gettextCatalog.getString('message.filterDeleteSuccessfully'),
                        msg: ''
                    });
                    vm.savedDailyPlanFilter.list.splice(index, 1);
                }
            });
            if (vm.savedDailyPlanFilter.list.length == 0) {
                vm.savedDailyPlanFilter.selected = undefined;
                vm.dailyPlanFilters.selectedView = false;
                selectedFiltered = undefined;
            }
            if (vm.savedDailyPlanFilter.selected == name) {
                vm.savedDailyPlanFilter.selected = undefined;
                vm.dailyPlanFilters.selectedView = false;
                selectedFiltered = undefined;
                vm.load();
            }
            SavedFilter.setDailyPlan(vm.savedDailyPlanFilter);
            SavedFilter.save();
        };

        vm.favorite = function (filter) {
            vm.savedDailyPlanFilter.favorite = filter.name;
            vm.savedDailyPlanFilter.selected = filter.name;
            vm.dailyPlanFilters.selectedView = true;
            selectedFiltered = filter;
            SavedFilter.setDailyPlan(vm.savedDailyPlanFilter);
            SavedFilter.save();
            vm.load();
        };

        vm.removeFavorite = function () {
            vm.savedDailyPlanFilter.favorite = '';
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
            if (filter) {
                vm.savedDailyPlanFilter.selected = filter.name;
                vm.dailyPlanFilters.selectedView = true;
            }
            else {
                vm.savedDailyPlanFilter.selected = filter;
                vm.dailyPlanFilters.selectedView = false;
            }
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
                compact: true,
                types: ['ORDER']
            }).then(function (res) {
                vm.tree = res.folders;
            }, function (err) {
                $('#treeModal').modal('hide');
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
                vm.showSpinner1 = true;
            }
        };

        vm.stopSpin = function () {
            if (!vm.showSpinner) {
                vm.showSpinner1 = false;
            }
        };


        var int = '';
        vm.$on('event-started', function () {
            if (vm.events && vm.events[0] && vm.events[0].eventSnapshots)
                for (var i = 0; i <= vm.events[0].eventSnapshots.length - 1; i++) {
                    if (vm.events[0].eventSnapshots[i].eventType == 'OrderFinished') {
                        if (int) {
                            $timeout.cancel(int);
                        }
                        int = $timeout(function () {
                            vm.getPlansByEvents();
                            $timeout.cancel(int);
                        }, 5000);
                        break;
                    }
                }

        });


        vm.getPlansByEvents = function () {

            if (vm.dailyPlanFilters.range != 'period') {
                vm.dailyPlanFilters.filter.range = undefined;
            }

            if (vm.dailyPlanFilters.filter.range == 'next-24-hours') {
                setDateRange(vm.dailyPlanFilters.filter.range);
            }
            if (vm.dailyPlanFilters.filter.range == 'today') {
                setDateRange(vm.dailyPlanFilters.filter.range);
            }
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;

            if (selectedFiltered) {
                obj = applySavedFilter(obj);
            } else {
                obj.dateFrom = vm.dailyPlanFilters.filter.from;
                obj.dateTo = vm.dailyPlanFilters.filter.to;

                if (vm.dailyPlanFilters.filter.status != 'ALL') {
                    obj.states = [];
                    if (vm.dailyPlanFilters.filter.status == 'WAITING') {
                        obj.states.push("PLANNED");
                    } else if (vm.dailyPlanFilters.filter.status == 'EXECUTED') {
                        obj.states.push("SUCCESSFUL");
                        obj.states.push("FAILED");
                    }
                    if (vm.dailyPlanFilters.filter.status == 'LATE') {
                        obj.late = true;
                    }
                }
            }

            DailyPlanService.getPlans(obj).then(function (res) {
                vm.plans = res.planItems;
                prepareGanttData(vm.plans);
            })
        };


        vm.$on('$destroy', function () {
            if (promise1)
                $timeout.cancel(promise1);
            watcher();
            if (int)
                $timeout.cancel(int);
        });


    }
})();
