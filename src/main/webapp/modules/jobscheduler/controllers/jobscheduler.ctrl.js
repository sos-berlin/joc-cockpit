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

    ResourceCtrl.$inject = ["$scope", "$rootScope", 'JobSchedulerService', "ResourceService", "orderByFilter", "ScheduleService", "$uibModal", "CoreService", "$interval", "$timeout"];
    function ResourceCtrl($scope, $rootScope, JobSchedulerService, ResourceService, orderBy, ScheduleService, $uibModal, CoreService, $interval, $timeout) {
        var vm = $scope;
        vm.maxEntryPerPage = vm.userPreferences.maxEntryPerPage;
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
        function initAgentTree(type) {

            ResourceService.tree({
                jobschedulerId: vm.schedulerIds.selected,
                compact: true,
                types: ['AGENTCLUSTER']
            }).then(function (res) {
                if (vm.isEmpty(vm.agentsFilters.expand_to)) {
                    vm.treeAgent = res.folders;
                    filteredTreeDataA(type);
                } else {
                    vm.agentsFilters.expand_to = vm.recursiveTreeUpdate(angular.copy(res.folders), vm.agentsFilters.expand_to, 'agent');
                    vm.treeAgent = vm.agentsFilters.expand_to;
                    previousTreeStateA();
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
                checkExpandA(value,type);
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
                if(type == 'all') {
                    value.selected1 = true;
                    value.selected1 = true;
                }
                else if (value.expanded || value.selected1) {
                    if (data.path == '/') {
                        data.selected1 = false;
                    }
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
        var obj = {};
        vm.loadAgents = function () {

            vm.allAgentClusters = [];
            vm.loading = true;
            obj = {folders: []};
            obj.jobschedulerId = vm.schedulerIds.selected;
            if (vm.agentsFilters.filter.state != 'all') {
                obj.state = vm.agentsFilters.filter.state == '0' ? 0 : vm.agentsFilters.filter.state == '1' ? 1 : 2;
            }

            for (var i = 0; i < vm.treeAgent.length; i++) {
                if (vm.treeAgent[i].expanded || vm.treeAgent[i].selected1)
                    checkExpandTreeForUpdatesA(vm.treeAgent[i]);
            }

            JobSchedulerService.getAgentCluster(obj).then(function (result) {
                angular.forEach(vm.treeAgent, function (node, index) {
                    insertData(node, result.agentClusters);
                });
                vm.loading = false;
            }, function () {
                vm.loading = false;
            });
        };


        function checkExpandTreeForUpdatesA(data) {
            if (data.selected1) {
                var obj = {};
                obj.jobschedulerId = vm.schedulerIds.selected;
                vm.folderPathS = data.name || '/';
                obj.folders = [{folder: data.path, recursive: false}];
                JobSchedulerService.getAgentCluster(obj).then(function (result) {
                    data.agentClusters = result.agentClusters;
                });
            }
            data.folders = orderBy(data.folders, 'name');
            angular.forEach(data.folders, function (value) {
                if (value.expanded || value.selected1)
                    checkExpandTreeForUpdatesA(value);
            });
        }


        function insertData(node, x) {
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
            modalInstance.result.then(function () {
            }, function () {

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


        function createSchedule(schedule) {
            var schedules = {};
            schedules.jobschedulerId = $scope.schedulerIds.selected;
            if(vm.substituteObj.folder.lastIndexOf('/') != vm.substituteObj.folder.length-1){
                vm.substituteObj.folder = vm.substituteObj.folder+'/';
            }
            schedules.schedule = vm.substituteObj.folder + '' + vm.substituteObj.name;

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

            var x2js = new X2JS();
            var _xml = x2js.xml_str2json(vm.tempXML);
            _xml.schedule._substitute = vm.sch._substitute;
            if (vm.sch._title)
                _xml.schedule._title = vm.sch._title;
            if (vm.sch._valid_from)
                _xml.schedule._valid_from = vm.sch._valid_from;
            if (vm.sch._valid_to)
                _xml.schedule._valid_to = vm.sch._valid_to;
            var xmlStr = x2js.json2xml_str(_xml);
            xmlStr = xmlStr.replace(/,/g, ' ');

            ScheduleService.setRunTime(schedules).then(function () {
                var temp = angular.copy(schedule);
                temp.runTime = xmlStr;
                substitute(temp);
            });
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
            ScheduleService.getRunTime({
                jobschedulerId: $scope.schedulerIds.selected,
                schedule: schedule.path
            }).then(function (res) {
                if (res.configuration) {
                    vm.runTimes = res.configuration;
                    vm.runTimes.content = vm.runTimes.content.xml;
                    vm.tempXML = vm.runTimes.content;
                }
                $rootScope.$broadcast('loadXml');

            });

            ScheduleService.getSchedulesP({jobschedulerId: $scope.schedulerIds.selected}).then(function (result) {
                vm._schedules = result.schedules;
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
            ScheduleService.getSchedulesP({jobschedulerId: $scope.schedulerIds.selected}).then(function (result) {
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

            ScheduleService.setRunTime(schedules);
        }

        vm.editSchedule = function (schedule) {
            vm.comments = {};
            vm.comments.radio = 'predefined';
            vm.sch = {};
            vm.schedule = schedule;
            vm.sch._title = schedule.title;
            vm.scheduleAction = 'edit';
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
            ScheduleService.getSchedulesP({jobschedulerId: $scope.schedulerIds.selected}).then(function (result) {
                vm._schedules = result.schedules;
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
                    vm.changeState();
                }
                vm.schdeuleFilters.expand_to = vm.tree;

                vm.isLoading = true;
            }, function (err) {
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
            if (vm.schdeuleFilters.filter.state != 'all') {
                obj.states = [];
                obj.states.push(vm.schdeuleFilters.filter.state);
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
            vm.allSchedules = [];
            angular.forEach(vm.tree, function (value) {
                value.expanded = true;
                value.selected1 = true;

                checkExpand(value);
            });
        }

        function volatileInformation(obj, expandNode) {
            if (vm.schdeuleFilters.filter.state != 'all') {
                obj.states = [];
                obj.states.push(vm.schdeuleFilters.filter.state);
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
            if (vm.schdeuleFilters.filter.state != 'all') {
                obj.states = [];
                obj.states.push(vm.schdeuleFilters.filter.state);
            }
            ScheduleService.get(obj).then(function (res) {
                var data1 = [];
                if (data.schedules && data.schedules.length > 0) {
                    angular.forEach(data.schedules, function (schedule) {
                        for (var i = 0; i < res.schedules.length; i++) {
                            if (schedule.path == res.schedules[i].path) {
                                schedule = angular.merge(schedule, res.schedules[i]);
                                data1.push(schedule);
                                break;
                            }
                        }
                    });
                    data.schedules = data1;
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
                obj.states = [];
                obj.states.push(vm.schdeuleFilters.filter.state);
            }
            ScheduleService.get(obj).then(function (res) {
                var data1 = [];
                if (data.schedules.length > 0) {
                    angular.forEach(data.schedules, function (schedule) {
                        for (var i = 0; i < res.schedules.length; i++) {
                            if (schedule.path == res.schedules[i].path) {
                                schedule = angular.merge(schedule, res.schedules[i]);
                                data1.push(schedule);
                                break;
                            }
                        }
                    });
                    data.schedules = data1;
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

                checkExpand(value);
                if (value.expanded || value.selected1) {
                    if (data.path == '/') {
                        data.selected1 = false;
                    }
                }
            });
        }

        vm.expandDetails = function() {
            if(vm.resourceFilters.state == 'schedules') {
                angular.forEach(vm.allSchedules, function (value, index) {
                    value.show = true;
                });
            }else if (vm.resourceFilters.state == 'agent'){
                angular.forEach(vm.allAgentClusters, function (value, index) {
                    value.show = true;
                });
            }
        };

        vm.collapseDetails = function(){
            if(vm.resourceFilters.state == 'schedules') {
                angular.forEach(vm.allSchedules, function (value, index) {
                    value.show = false;
                });
            }else if (vm.resourceFilters.state == 'agent'){
                angular.forEach(vm.allAgentClusters, function (value, index) {
                    value.show = false;
                });
            }
        };
        $scope.$on('event-started', function () {
            if (vm.events && vm.events[0] && vm.events[0].eventSnapshots)
                angular.forEach(vm.events[0].eventSnapshots, function (event) {
                    if (event.eventType == "FileBasedActivated") {

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

                        } else if (vm.resourceFilters.state == 'agent' && event.objectType == 'PROCESSCLASS') {
                            ResourceService.tree({
                                jobschedulerId: vm.schedulerIds.selected,
                                compact: true,
                                types: ['AGENTCLUSTER']
                            }).then(function (res) {
                                vm.agentsFilters.expand_to = vm.recursiveTreeUpdate(angular.copy(res.folders), vm.agentsFilters.expand_to, 'agent');
                                vm.treeAgent = vm.agentsFilters.expand_to;
                            });
                        }
                    }
                    if (event.eventType == "JobStateChanged" && vm.resourceFilters.state == 'processClass') {
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
                if (toParams.type && toParams.type !='all')
                    vm.agentsFilters.filter.state = toParams.type == 'healthy' ? '0' : toParams.type == 'unhealthy' ? '1' : '2';
                vm.treeAgent = [];
                initAgentTree(toParams.type);
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
                    checkExpandTreeForUpdatesA(vm.treeAgent[i]);
                }
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
            $interval.cancel(interval1);
            $interval.cancel(interval2);

        });
    }


    ResourceInfoCtrl.$inject = ['$scope', '$rootScope', '$stateParams', '$state', 'ResourceService', 'ScheduleService', 'JobSchedulerService', '$uibModal'];
    function ResourceInfoCtrl($scope, $rootScope, $stateParams, $state, ResourceService, ScheduleService, JobSchedulerService, $uibModal) {
        var vm = $scope;
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
            }
        }


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

        function substitute(schedule) {
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

        function createSchedule(schedule) {
            var schedules = {};
            schedules.jobschedulerId = $scope.schedulerIds.selected;
            if(vm.substituteObj.folder.lastIndexOf('/') != vm.substituteObj.folder.length-1){
                vm.substituteObj.folder = vm.substituteObj.folder+'/';
            }
            schedules.schedule = vm.substituteObj.folder + '' + vm.substituteObj.name;

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

            var x2js = new X2JS();
            var _xml = x2js.xml_str2json(vm.tempXML);
            _xml.schedule._substitute = vm.sch._substitute;
            if (vm.sch._title)
                _xml.schedule._title = vm.sch._title;
            if (vm.sch._valid_from)
                _xml.schedule._valid_from = vm.sch._valid_from;
            if (vm.sch._valid_to)
                _xml.schedule._valid_to = vm.sch._valid_to;
            var xmlStr = x2js.json2xml_str(_xml);
            xmlStr = xmlStr.replace(/,/g, ' ');

            ScheduleService.setRunTime(schedules).then(function () {
                var temp = angular.copy(schedule);
                temp.runTime = xmlStr;
                substitute(temp);
            });
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
            ScheduleService.getRunTime({
                jobschedulerId: $scope.schedulerIds.selected,
                schedule: schedule.path
            }).then(function (res) {
                if (res.configuration) {
                    vm.runTimes = res.configuration;
                    vm.runTimes.content = vm.runTimes.content.xml;
                    vm.tempXML = vm.runTimes.content;
                }
                $rootScope.$broadcast('loadXml');

            });

            ScheduleService.getSchedulesP({jobschedulerId: $scope.schedulerIds.selected}).then(function (result) {
                vm._schedules = result.schedules;
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
        };

        vm.editSchedule = function (schedule) {
            vm.comments = {};
            vm.comments.radio = 'predefined';
            vm.sch = {};
            vm.schedule = schedule;
            vm.sch._title = schedule.title;
            vm.scheduleAction = 'edit';
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
            ScheduleService.getSchedulesP({jobschedulerId: $scope.schedulerIds.selected}).then(function (result) {
                vm._schedules = result.schedules;
            });
            vm.zones = moment.tz.names();
        };

    }


    DashboardCtrl.$inject = ['$scope', 'OrderService', 'JobSchedulerService', 'ResourceService', 'gettextCatalog', '$state', '$uibModal', 'DailyPlanService', 'moment', '$rootScope', '$timeout', 'CoreService', 'SOSAuth', 'FileSaver', "$interval"];
    function DashboardCtrl($scope, OrderService, JobSchedulerService, ResourceService, gettextCatalog, $state, $uibModal, DailyPlanService, moment, $rootScope, $timeout, CoreService, SOSAuth, FileSaver, $interval) {
        var vm = $scope;
        if (SOSAuth.jobChain) {
            SOSAuth.setJobChain(undefined);
            SOSAuth.save();
        }

        vm.dashboardFilters = CoreService.getDashboardTab();
        var isLoadedSnapshot = true, isLoadedSummary = true,isLoadedDailyPlan = true,isLoadedAgentCluster = true, isLoadedRunningTask =true;

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
             isLoadedAgentCluster = false;
            JobSchedulerService.getAgentCluster({
                jobschedulerId: $scope.schedulerIds.selected
            }).then(function (res) {
                if (res.agentClusters) {
                    vm.agentClusters = res.agentClusters;
                    prepareAgentClusterData(vm.agentClusters);
                }
                isLoadedAgentCluster = true;
            }, function(){
                 isLoadedAgentCluster = true;
            });
        };
        vm.getAgentCluster();

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
                interactive: true,
                noData: gettextCatalog.getString('message.noDataAvailable')

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

        vm.getAgentClusterRunningTask = function () {
            isLoadedRunningTask = false;
            var agentArray = [];
            ResourceService.getProcessClass({
                jobschedulerId: $scope.schedulerIds.selected,
                isAgentCluster: true
            }).then(function (res) {
                if (res.processClasses) {
                    vm.processClasses = res.processClasses;
                    angular.forEach(vm.processClasses, function (value) {
                        agentArray.push({label: value.path, value: value.numOfProcesses});
                    });
                    vm.agentStatusChart = [{
                        "key": "Agents",
                        "values": agentArray
                    }];
                    if (vm.agentStatusChart[0] && vm.agentStatusChart[0].values && vm.agentStatusChart[0].values.length > 10) {
                        vm.barOptions.chart.width = vm.agentStatusChart[0].values.length * 50;
                    }
                }
                isLoadedRunningTask = true;
            }, function () {
                vm.processClasses = [];
                vm.agentStatusChart = [{
                    "key": "Agents",
                    "values": agentArray
                }];
                isLoadedRunningTask = true;
            });
        };

        if (vm.permission && vm.permission.ProcessClass.view.status)
            vm.getAgentClusterRunningTask();

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
        function toolTipContentFunction() {
            return function (key, x) {
                return '<h3>' + gettextCatalog.getString(key) + '</h3>' +
                    '<p>' + d3.format(',f')(x) + '</p>'
            }
        }

        var format = d3.format(',.0f');
        vm.valueFormatFunction = function () {
            return function (d) {
                return format(d);
            }
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
                    interval = $timeout(function () {
                        if (document.getElementById('agent-cluster-status')) {
                            var a = document.getElementById('agent-cluster-status').clientHeight
                        }
                        if (document.getElementById('agent-running-task')) {
                            var b = document.getElementById('agent-running-task').clientHeight
                        }
                        if (a + b > 320) {
                            $('#master-cluster-status').css('height', (a + b - 20) + 'px');
                        }
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
            $state.go('app.resources.agentClusters',{type:'all'});
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
                    JobSchedulerService.terminate(obj).then(function (res) {
                        success('stopped', host, port);
                    });
                } else if ((objectType == 'supervisor' || objectType == 'master') && action == 'abort') {
                    JobSchedulerService.abort(obj).then(function (res) {
                        success('running', host, port);
                    });
                } else if ((objectType == 'supervisor' || objectType == 'master') && action == 'abortAndRestart') {
                    JobSchedulerService.abortAndRestart(obj).then(function (res) {
                        success('running', host, port);
                    });
                } else if ((objectType == 'supervisor' || objectType == 'master') && action == 'terminateAndRestart') {
                    JobSchedulerService.restart(obj).then(function (res) {
                        success('running', host, port);
                    });
                }
                else if ((objectType == 'supervisor' || objectType == 'master') && action == 'pause') {
                    JobSchedulerService.pause(obj).then(function (res) {
                        success('paused', host, port);
                    });
                } else if ((objectType == 'supervisor' || objectType == 'master') && action == 'continue') {
                    JobSchedulerService.continue(obj).then(function (res) {
                        success('running', host, port);
                    });
                } else if (objectType == 'cluster' && action == 'terminate') {

                    JobSchedulerService.terminateCluster(obj1).then(function (res) {
                        clusterSuccess('stopped', host, port);
                    });
                } else if (objectType == 'cluster' && action == 'terminateFailsafe') {
                    JobSchedulerService.terminateFailsafeCluster(obj1).then(function (res) {
                        clusterSuccess('stopped', host, port);
                    });
                } else if (objectType == 'cluster' && action == 'restart') {
                    JobSchedulerService.restartCluster(obj1).then(function (res) {
                        clusterSuccess('running', host, port);
                    });
                } else if (action == 'downloadLog') {
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
                vm.getTimeout(host, port, id);
            } else {

                if (vm.userPreferences.auditLog && action !== 'downloadLog') {
                    vm.comments = {};
                    vm.comments.radio = 'predefined';
                    vm.comments.name = objectType;
                    vm.comments.operation = action == "terminateFailsafe" ? "Terminate and fail-over" : action == "terminateAndRestart" ? "Terminate and Restart" : action == "abortAndRestart" ? "Abort and Restart" : action == "terminate" ? "Terminate" : action == "pause" ? "Pause" : action == "abort" ? "Abort" : "Continue";
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
            states[host + port] = state;
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
        vm.getTimeout = function (host, port, id) {
            vm.comments = {};
            vm.comments.radio = 'predefined';
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

                JobSchedulerService.restartWithin(obj).then(function (res) {
                    success('running', host, port);
                });
            }, function () {

            });
        };

        vm.loadOrderSnapshot = function () {
            isLoadedSnapshot = false;
            OrderService.getSnapshot({jobschedulerId: $scope.schedulerIds.selected}).then(function (res) {
                vm.snapshot = res.orders;
                isLoadedSnapshot = true;
            }, function(){
                isLoadedSnapshot = true;
            });
        };
        vm.loadOrderSnapshot();

        vm.getOrderSummary = function () {
            isLoadedSummary = false;
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
                isLoadedSummary = true;
            }, function(){
                isLoadedSummary = true;
            })
        };
        vm.getOrderSummary();
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
            isLoadedDailyPlan = false;
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
                isLoadedDailyPlan = true;
            }, function(){
                isLoadedDailyPlan = true;
            })
        };

        if (vm.permission && vm.permission.DailyPlan.view.status)
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

        $scope.$on('event-started', function () {
            if (vm.events && vm.events[0] && vm.events[0].eventSnapshots)
                for (var i = 0; i <= vm.events[0].eventSnapshots.length - 1; i++) {
                    if (vm.events[0].eventSnapshots[i].eventType === "OrderStateChanged" && isLoadedSnapshot) {
                        isLoadedSnapshot = false;
                        vm.loadOrderSnapshot();
                    } else if (vm.events[0].eventSnapshots[i].eventType === "ReportingChangedOrder" && isLoadedSummary) {
                         isLoadedSummary = false;
                        vm.getOrderSummary();
                    }else if (vm.events[0].eventSnapshots[i].eventType === "DailyPlanChanged" && isLoadedDailyPlan) {
                         isLoadedDailyPlan = false;
                        vm.getDailyPlans();
                    }else if (vm.events[0].eventSnapshots[i].eventType === "FileBasedActivated" && vm.events[0].eventSnapshots[i].objectType === "PROCESSCLASS" && isLoadedAgentCluster) {
                         isLoadedAgentCluster = false;
                         vm.getAgentCluster();
                         vm.getAgentClusterRunningTask();
                    } else if (vm.events[0].eventSnapshots[i].eventType === "JobStateChanged" && isLoadedRunningTask) {
                         isLoadedRunningTask = false;
                        vm.getAgentClusterRunningTask();
                    }
                }
        });

        var interval1;

        function poll() {
            interval1 = $interval(function () {
                vm.getAgentCluster();
            }, 60 * 1000)
        }

        poll();


        $scope.$on('$destroy', function () {
            $timeout.cancel(interval);
            $interval.cancel(interval1);

        });
    }

    DailyPlanCtrl.$inject = ['$scope', '$timeout', 'gettextCatalog', 'orderByFilter', '$uibModal', 'SavedFilter', 'DailyPlanService', '$stateParams', 'CoreService', 'UserService'];
    function DailyPlanCtrl($scope, $timeout, gettextCatalog, orderBy, $uibModal, SavedFilter, DailyPlanService, $stateParams, CoreService, UserService) {
        var vm = $scope;
        vm.todayDate = new Date();
        vm.dailyPlanFilters = CoreService.getDailyPlanTab();
        vm.maxEntryPerPage = vm.userPreferences.maxEntryPerPage;

        vm.selectedFiltered;
        var promise1;

        vm.savedDailyPlanFilter = JSON.parse(SavedFilter.dailyPlanFilters) || {};
        vm.dailyPlanFilterList = [];


        if (vm.dailyPlanFilters.selectedView) {
            vm.savedDailyPlanFilter.selected = vm.savedDailyPlanFilter.selected || vm.savedDailyPlanFilter.favorite;
        }
        else {
            vm.savedDailyPlanFilter.selected = undefined;
        }

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
        }
        if ($stateParams.day != null) {
            vm.dailyPlanFilters.filter.range = $stateParams.day;
        }

        vm.$on('resetDailyPlanDate', function () {
            vm.getPlans();
        });
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
                from.setDate(from.getDate());
                to.setDate(to.getDate() + 1);
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
                'model.name': gettextCatalog.getString('label.jobChain') + '/' + gettextCatalog.getString('label.job'),
                'model.orderId': gettextCatalog.getString('label.orderId')
            },
            columnsClasses: {
                'model.name': 'gantt-column-name',
                'model.orderId': 'gantt-column-from'
            },
            columnsHeaderContents: {
                'model.name': '{{getHeader()}}',
                'model.orderId': '{{getHeader()}}'
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

        function applySavedFilter(obj) {
            if (vm.selectedFiltered.regex)
                obj.regex = vm.selectedFiltered.regex;

            if (vm.selectedFiltered.state && vm.selectedFiltered.state.length > 0) {
                obj.states = [];
                if (vm.selectedFiltered.state.indexOf('WAITING') !== -1) {
                    obj.states.push("PLANNED");
                } else if (vm.selectedFiltered.state.indexOf('EXECUTED') !== -1) {
                    obj.states.push("SUCCESSFUL");
                    obj.states.push("FAILED");
                }
                if (vm.selectedFiltered.state.indexOf('LATE') !== -1) {
                    obj.late = true;
                }

            }

            var fromDate;
            var toDate;

            if (vm.selectedFiltered.planned) {
                if (/^\s*(now\s*\+)\s*(\d+)\s*$/i.test(vm.selectedFiltered.planned)) {
                    fromDate = new Date();
                    toDate = new Date();
                    var seconds = parseInt(/^\s*(now\s*\+)\s*(\d+)\s*$/i.exec(vm.selectedFiltered.planned)[2]);
                    toDate.setSeconds(toDate.getSeconds() + seconds);
                } else if (/^\s*\d+[d,h]\s*$/i.test(vm.selectedFiltered.planned)) {
                    obj.dateFrom = vm.selectedFiltered.planned;
                } else if (/^\s*(Today)\s*$/i.test(vm.selectedFiltered.planned)) {
                    fromDate = new Date();
                    fromDate.setHours(0);
                    fromDate.setMinutes(0);
                    toDate = new Date();
                    toDate.setHours(23);
                    toDate.setMinutes(59);
                } else if (/^\s*(now)\s*$/i.test(vm.selectedFiltered.planned)) {
                    fromDate = new Date();
                    toDate = new Date();
                } else if (/^\s*(\d+):(\d+)\s*(am|pm)\s*to\s*(\d+):(\d+)\s*(am|pm)\s*$/i.test(vm.selectedFiltered.planned)) {
                    var time = /^\s*(\d+):(\d+)\s*(am|pm)\s*to\s*(\d+):(\d+)\s*(am|pm)\s*$/i.exec(vm.selectedFiltered.planned);
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

            if (vm.selectedFiltered.fromDate) {
                fromDate = new Date(vm.selectedFiltered.fromDate);
                if (vm.selectedFiltered.fromTime) {
                    vm.selectedFiltered.fromTime = new Date(vm.selectedFiltered.fromTime);
                    fromDate.setHours(vm.selectedFiltered.fromTime.getHours());
                    fromDate.setMinutes(vm.selectedFiltered.fromTime.getMinutes());
                    fromDate.setSeconds(vm.selectedFiltered.fromTime.getSeconds());
                } else {
                    fromDate.setHours(0);
                    fromDate.setMinutes(0);
                    fromDate.setSeconds(0);
                    fromDate.setMilliseconds(0);
                }
            }

            if (vm.selectedFiltered.toDate) {
                toDate = new Date(vm.selectedFiltered.toDate);
                if (vm.selectedFiltered.toTime) {
                    vm.selectedFiltered.toTime = new Date(vm.selectedFiltered.toTime);
                    toDate.setHours(vm.selectedFiltered.toTime.getHours());
                    toDate.setMinutes(vm.selectedFiltered.toTime.getMinutes());
                    toDate.setSeconds(vm.selectedFiltered.toTime.getSeconds());
                } else {
                    toDate.setHours(0);
                    toDate.setMinutes(0);
                    toDate.setSeconds(0);
                    toDate.setMilliseconds(0);
                }
            }


            if (fromDate && toDate) {
                obj.dateFrom = fromDate;
                obj.dateTo = toDate;
                vm.dailyPlanFilters.filter.from = fromDate;
                vm.dailyPlanFilters.filter.to = toDate;
            }

            return obj;
        }

        function prepareGanttData(data2, flag) {

            var minNextStartTime;
            var maxEndTime;
            var orders = [];
            $scope.ordersNoDuplicate = [];
            data2 = orderBy(data2, 'plannedStartTime', false);

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

            vm.data = orderBy(orders, 'plannedStartTime');

            if (flag)
                promise1 = $timeout(function () {
                    if ($("#gantt-current-date-line").offset())
                        $('#div').animate({
                            scrollLeft: $("#gantt-current-date-line").offset().left
                        }, 500);
                    $timeout.cancel(promise1);
                }, 4000);
        }

        vm.load = function () {
            isLoaded = false;
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;

            if (vm.selectedFiltered) {
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

            DailyPlanService.getPlans(obj).then(function (res) {
                vm.plans = res.planItems;

                prepareGanttData(vm.plans, true);
                vm.isLoading = true;
                isLoaded = true;
                vm.showSpinner = false;
            }, function (err) {
                vm.isLoading = true;
                isLoaded = true;
                vm.showSpinner = false;
            })
        };


        /**--------------- filter, sorting and pagination -------------------*/
        vm.sortBy = function (propertyName) {
            vm.dailyPlanFilters.reverse = !vm.dailyPlanFilters.reverse;
            vm.dailyPlanFilters.filter.sortBy = propertyName;
            if (vm.pageView == 'grid') {
                vm.plans = orderBy(vm.plans, vm.dailyPlanFilters.filter.sortBy, vm.dailyPlanFilters.reverse);
                prepareGanttData(vm.plans, true);
            }
        };


        vm.applyFilter = function () {
            vm.dailyPlanFilter = {};
            vm.isUnique = true;
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/daily-plan-filter-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                size: 'lg',
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                if (vm.dailyPlanFilter.radio == 'current') {
                    vm.dailyPlanFilter.fromDate = undefined;
                    vm.dailyPlanFilter.fromTime = undefined;
                    vm.dailyPlanFilter.toDate = undefined;
                    vm.dailyPlanFilter.toTime = undefined;
                    vm.dailyPlanFilter.planned = undefined;
                } else if (vm.dailyPlanFilter.radio == 'planned') {
                    vm.dailyPlanFilter.state = undefined;
                }

                var configObj = {};
                configObj.jobschedulerId = vm.schedulerIds.selected;
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

                    if (vm.dailyPlanFilterList.length == 1) {
                        vm.savedDailyPlanFilter.selected = vm.dailyPlanFilter.name;
                        vm.dailyPlanFilters.selectedView = true;
                        vm.selectedFiltered = vm.dailyPlanFilter;
                        vm.load();
                        SavedFilter.setDailyPlan(vm.savedDailyPlanFilter);
                        SavedFilter.save();
                    }
                })
            }, function () {

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

        vm.editFilter = function (filter) {
            vm.action = 'edit';
            vm.isUnique = true;
            vm.dailyPlanFilter = {};

            UserService.configuration({jobschedulerId: filter.jobschedulerId, id: filter.id}).then(function (conf) {
                vm.dailyPlanFilter = JSON.parse(conf.configuration.configurationItem);
                vm.dailyPlanFilter.shared = filter.shared;
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
                UserService.saveConfiguration(configObj);
                filter.name = vm.dailyPlanFilter.name;
            }, function () {

            });
        };

        vm.copyFilter = function (filter) {
            vm.action = 'copy';
            vm.isUnique = true;
            vm.dailyPlanFilter = {};
            UserService.configuration({jobschedulerId: filter.jobschedulerId, id: filter.id}).then(function (conf) {
                vm.dailyPlanFilter = JSON.parse(conf.configuration.configurationItem);
                vm.dailyPlanFilter.shared = filter.shared;
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

                if (vm.dailyPlanFilter.radio == 'current') {
                    vm.dailyPlanFilter.fromDate = undefined;
                    vm.dailyPlanFilter.fromTime = undefined;
                    vm.dailyPlanFilter.toDate = undefined;
                    vm.dailyPlanFilter.toTime = undefined;
                    vm.dailyPlanFilter.planned = undefined;
                } else if (vm.dailyPlanFilter.radio == 'planned') {
                    vm.dailyPlanFilter.state = undefined;
                }

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
                })

            }, function () {

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

                    vm.dailyPlanFilters.selectedView = false;
                    vm.selectedFiltered = undefined;
                    setDateRange();
                    vm.load();
                } else {
                    if (vm.dailyPlanFilterList.length == 0) {
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
            angular.forEach(vm.dailyPlanFilterList, function (value) {
                if (vm.dailyPlanFilter.name == value.name && vm.permission.user == value.account) {
                    vm.isUnique = false;
                }
            });
        };

        vm.changeFilter = function (filter) {
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
                vm.savedDailyPlanFilter.selected = filter;
                vm.dailyPlanFilters.selectedView = false;
                vm.selectedFiltered = filter;
                setDateRange();
                vm.load();
            }

            SavedFilter.setDailyPlan(vm.savedDailyPlanFilter);
            SavedFilter.save();

        };

        var int = '';
        var isLoaded = true;
        vm.$on('event-started', function () {
            if (vm.events && vm.events[0] && vm.events[0].eventSnapshots)
                for (var i = 0; i <= vm.events[0].eventSnapshots.length - 1; i++) {
                    if (vm.events[0].eventSnapshots[i].eventType == 'DailyPlanChanged' && isLoaded) {
                        isLoaded = false;
                        if (int) {
                            $timeout.cancel(int);
                        }
                        int = $timeout(function () {
                            vm.getPlansByEvents();
                            $timeout.cancel(int);
                        }, 1000);
                        break;
                    }
                }
        });

        vm.getPlansByEvents = function () {
            isLoaded = false;
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

            if (vm.selectedFiltered) {
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
                isLoaded = true;
                prepareGanttData(vm.plans);
            }, function () {
                isLoaded = true;
            });
        };


        vm.$on('$destroy', function () {
            if (promise1)
                $timeout.cancel(promise1);
            if (int)
                $timeout.cancel(int);
        });


    }
})();
