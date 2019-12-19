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

    ResourceCtrl.$inject = ["$scope", "$rootScope", "JobSchedulerService", "ResourceService", "orderByFilter", "ScheduleService", "$uibModal", "CoreService", "$interval", "$window", "TaskService",
        "CalendarService", "$timeout", "FileSaver", "FileUploader", "toasty", "gettextCatalog", "AuditLogService", "EventService", "UserService", "SavedFilter", "OrderService", "JobService", "$filter", "SOSAuth"];

    function ResourceCtrl($scope, $rootScope, JobSchedulerService, ResourceService, orderBy, ScheduleService, $uibModal, CoreService, $interval, $window, TaskService,
                          CalendarService, $timeout, FileSaver, FileUploader, toasty, gettextCatalog, AuditLogService, EventService, UserService, SavedFilter, OrderService, JobService, $filter, SOSAuth) {
        var vm = $scope;
        vm.maxEntryPerPage = vm.userPreferences.maxEntryPerPage;
        vm.resourceFilters = CoreService.getResourceTab();
        vm.agentsFilters = vm.resourceFilters.agents;
        vm.agentsFilters.isCompact = vm.userPreferences.isAgentCompact == undefined ? vm.userPreferences.isCompact : vm.userPreferences.isAgentCompact;
        vm.agentJobExecutionFilters = vm.resourceFilters.agentJobExecution;
        vm.locksFilters = vm.resourceFilters.locks;
        vm.processFilters = vm.resourceFilters.processClasses;
        vm.scheduleFilters = vm.resourceFilters.schedules;
        vm.calendarFilters = vm.resourceFilters.calendars;
        vm.eventFilters = vm.resourceFilters.events;
        vm.documentFilters = vm.resourceFilters.documents;
        vm.documentTypes =['ALL','HTML','XML','XSL','XSD','JAVASCRIPT','JSON','CSS','MARKDOWN','GIF','JPEG','PNG'];

        vm.selectedFiltered = '';
        vm.savedEventFilter = JSON.parse(SavedFilter.eventFilters) || {};

        vm.selectedFilteredAgent = '';
        vm.savedAgentFilter = JSON.parse(SavedFilter.agentFilters) || {};

        vm.eventFilterList = [];
        vm.agentFilterList = [];

        function resizeSidePanel() {
            setTimeout(function () {
                let ht = ($('.app-header').height() || 61)
                    + ($('.top-header-bar').height() || 16)
                    + $('.sub-header').height() + $('.sub-header-2').height() + 32;

                $('#leftPanel').stickySidebar({
                    sidebarTopMargin: ht
                });
            }, 0);
        }

        if (vm.eventFilters.selectedView) {
            vm.savedEventFilter.selected = vm.savedEventFilter.selected || vm.savedEventFilter.favorite;
        } else {
            vm.savedEventFilter.selected = undefined;
        }

        if (vm.agentJobExecutionFilters.selectedView) {
            vm.savedAgentFilter.selected = vm.savedAgentFilter.selected || vm.savedAgentFilter.favorite;
        } else {
            vm.savedAgentFilter.selected = undefined;
        }

        vm.object = {};
        vm.filter_tree = {};
        vm.filterTree1 = [];
        vm.object.paths = [];

        if (!vm.schedulerIds.selected) {
            vm.resourceFilters.state = '';
            vm.isLoading = true;
            return;
        }

        vm.toggleCompactView = function(){
            vm.agentsFilters.isCompact = !vm.agentsFilters.isCompact;
            vm.userPreferences.isAgentCompact = vm.agentsFilters.isCompact;
            vm.saveProfileSettings(vm.userPreferences);
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
            if (scrTree && destTree) {
                for (let i = 0; i < scrTree.length; i++) {
                    for (let j = 0; j < destTree.length; j++) {
                        if (scrTree[i].path === destTree[j].path) {
                            if (type === 'lock') {
                                scrTree[i].locks = destTree[j].locks;
                            } else if (type === 'processClass') {
                                scrTree[i].processClasses = destTree[j].processClasses;
                            } else if (type === 'agent') {
                                scrTree[i].agentClusters = destTree[j].agentClusters;
                            } else if (type === 'schedule') {
                                scrTree[i].schedules = destTree[j].schedules;
                            } else if (type === 'calendar') {
                                scrTree[i].calendars = destTree[j].calendars;
                            } else if (type === 'document') {
                                scrTree[i].documents = destTree[j].documents;
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
        }

        vm.recursiveTreeUpdate = function (scrTree, destTree, type) {
            if (scrTree && destTree) {
                recursiveTreeUpdate(scrTree, destTree, type);
            }
            return scrTree;
        };

        vm.expandDetails = function () {
            vm.collapseDetails(true);
        };

        vm.collapseDetails = function (isExpand) {
            let flag = isExpand === true ? true : false;
            if (vm.resourceFilters.state == 'schedules') {
                angular.forEach(vm.allSchedules, function (value) {
                    value.show = flag;
                });
            } else if (vm.resourceFilters.state == 'agent') {
                angular.forEach(vm.allAgentClusters, function (value) {
                    value.show = flag;
                });
            } else if (vm.resourceFilters.state == 'processClass') {
                angular.forEach(vm.allProcessClasses, function (value) {
                    value.show = flag;
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

        /** -----------------Begin Agent clusters------------------- */

        vm.treeAgent = [];
        vm.my_tree_agent = {};
        vm.expanding_propertyA = {
            field: "name"
        };
        vm.sortByA = function (propertyName) {
            vm.agentsFilters.reverse = !vm.agentsFilters.reverse;
            vm.agentsFilters.filter.sortBy = propertyName;
        };

        /**
         * Function to initialized Agent tree
         */
        function initAgentTree(type) {
            ResourceService.tree({
                jobschedulerId: vm.schedulerIds.selected,
                compact: true,
                types: ['AGENTCLUSTER']
            }).then(function (res) {
                if ($rootScope.agent_cluster_expand_to) {
                    vm.treeAgent = angular.copy(res.folders);
                    filteredTreeDataA();
                } else {
                    if (type) {
                        vm.treeAgent = angular.copy(res.folders);
                        filteredTreeDataA(type);
                    } else {
                        if (_.isEmpty(vm.agentsFilters.expand_to)) {
                            vm.treeAgent = angular.copy(res.folders);
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

        var count = 1, splitPath = [];

        function filteredTreeDataA(type) {
            for (let i = 0; i < vm.treeAgent.length; i++) {
                if ($rootScope.agent_cluster_expand_to) {
                    vm.expand_to = angular.copy($rootScope.agent_cluster_expand_to);
                    splitPath = vm.expand_to.path.split('/');
                    $rootScope.agent_cluster_expand_to = '';
                    vm.flag = true;
                }
                if (splitPath.length < 2) {
                    vm.treeAgent[i].selected1 = true;
                }
                vm.treeAgent[i].expanded = true;

                vm.allAgentClusters = [];
                checkExpandA(vm.treeAgent[i], type);
            }
        }

        function previousTreeStateA() {
            vm.pollAgents();
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
            if (vm.userPreferences.expandOption === 'both')
                data.expanded = true;
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
                if (!data.agentClusters)
                    data.agentClusters = [];

                loadAgentsV(data, type);
                vm.folderPathA = data.name || '/';
                angular.forEach(data.agentClusters, function (value) {
                    value.path1 = data.path;
                    vm.allAgentClusters.push(value);
                });
            }
            if (data.folders && data.folders.length > 0) {
                data.folders = orderBy(data.folders, 'name');
                for (let x = 0; x < data.folders.length; x++) {
                    if (vm.expand_to) {
                        if (vm.flag && data.folders[x].path.substring(1, data.folders[x].path.length) == splitPath[count] && count < splitPath.length) {
                            count = count + 1;
                            splitPath[count] = splitPath[count - 1] + '/' + splitPath[count];

                            data.folders[x].expanded = true;
                            if (vm.expand_to.name == data.folders[x].name) {
                                data.folders[x].selected1 = true;
                                vm.flag = false;
                                count = 1;
                                splitPath = [];

                            }
                        }
                    }
                    checkExpandA(data.folders[x], type);
                    if (type) {
                        data.folders[x].expanded = true;
                        data.folders[x].selected1 = true;
                    } else if (data.folders[x].expanded || data.folders[x].selected1) {

                        if (data.path == '/') {
                            data.selected1 = false;
                        }
                    }
                }
            }
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

        function pollCheckExpandTreeForUpdates(data, obj1) {
            if (data.selected1) {
                obj1.folders.push({folder: data.path, recursive: false});
                vm.folderPathA = data.name || '/';
            }
            data.folders = orderBy(data.folders, 'name');
            angular.forEach(data.folders, function (value) {
                if (value.expanded || value.selected1)
                    pollCheckExpandTreeForUpdates(value, obj1);
            });
        }


        vm.pollAgents = function () {
            let obj1 = {folders: []};

            obj1.jobschedulerId = vm.schedulerIds.selected;
            if (vm.agentsFilters.filter.state != 'all') {
                obj1.state = vm.agentsFilters.filter.state == '0' ? 0 : vm.agentsFilters.filter.state == '1' ? 1 : 2;
            }

            angular.forEach(vm.treeAgent, function (value) {
                if (value.expanded || value.selected1)
                    pollCheckExpandTreeForUpdates(value, obj1);
            });

            JobSchedulerService.getAgentCluster(obj1).then(function (result) {
                vm.allAgentClusters = [];
                angular.forEach(vm.treeAgent, function (node, index) {
                    insertDataA(node, result.agentClusters);
                })
            });
        };

        function insertDataA(node, x) {
            var _temp = angular.copy(node.agentClusters);
            node.agentClusters = [];

            for (let i = 0; i < x.length; i++) {
                if (node.path == x[i].path.substring(0, x[i].path.lastIndexOf('/')) || (node.path == x[i].path.substring(0, x[i].path.lastIndexOf('/') + 1))) {
                    x[i].path1 = node.path;
                    if (_temp && _temp.length > 0) {
                        for (var j = 0; j < _temp.length; j++) {
                            if (_temp[j].path == x[i].path) {
                                x[i].show = _temp[j].show;
                                break;
                            }
                        }
                    }
                    node.agentClusters.push(x[i]);
                    vm.allAgentClusters.push(x[i]);
                }
            }

            angular.forEach(node.folders, function (value) {
                if (value.expanded || value.selected1)
                    insertDataA(value, x);
            });
        }

        function loadAgentsV(data, type) {
            let obj = {};
            obj.jobschedulerId = $scope.schedulerIds.selected;

            if (vm.agentsFilters.filter.state != 'all') {
                obj.state = vm.agentsFilters.filter.state == '0' ? 0 : vm.agentsFilters.filter.state == '1' ? 1 : 2;
            }

            obj.folders = [
                {folder: data.path, recursive: !!type}
            ];
            JobSchedulerService.getAgentCluster(obj).then(function (result) {
                data.agentClusters = result.agentClusters;
                angular.forEach(data.agentClusters, function (value) {
                    value.path1 = data.path;
                });
                vm.allAgentClusters = data.agentClusters;
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


        vm.editAgentCluster = function (cluster) {
            vm.comments = {};
            vm.comments.radio = 'predefined';
            ResourceService.getProcessClassConfig({
                jobschedulerId: $scope.schedulerIds.selected,
                processClass: cluster.path
            }).then(function (res) {
                vm.processClassObject = res.configuration;
                vm.processClassObject.path = cluster.path;
                vm.processClassObject.name = cluster.path.substring(cluster.path.lastIndexOf('/') + 1);
                if(!vm.processClassObject.remoteSchedulers){
                    vm.processClassObject.remoteSchedulers = {remoteSchedulerList:[]};
                }
                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/edit-process-class-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    size: 'lg',
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    let obj = {};
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
                    obj.jobschedulerId = $scope.schedulerIds.selected;
                    obj.processClass = cluster.path;
                    let list = [];
                    if (vm.processClassObject.remoteSchedulers.remoteSchedulerList.length > 0) {
                        for (let i = 0; i < vm.processClassObject.remoteSchedulers.remoteSchedulerList.length; i++) {
                            if (vm.processClassObject.remoteSchedulers.remoteSchedulerList[i].remoteScheduler) {
                                list.push(vm.processClassObject.remoteSchedulers.remoteSchedulerList[i]);
                            }
                        }
                    }
                    if (vm.processClassObject.remoteSchedulers.select && list.length === 0) {
                        vm.processClassObject.remoteSchedulers.select = '';
                    }
                    vm.processClassObject.remoteSchedulers.remoteSchedulerList = list;
                    obj.configuration = vm.processClassObject;
                    delete obj.configuration['path'];
                    
                    ResourceService.updateProcessClassConfig(obj);
                }, function () {

                });
            });
        };

        vm.removeAgentCluster = function(processClass) {
            let obj ={jobschedulerId: $scope.schedulerIds.selected, processClass : processClass.path};
            vm.processClassObject = processClass;

            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.type = 'Process Class';
                vm.comments.operation = 'Delete';
                vm.comments.name = processClass.path;

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
                    deleteProcessClass(obj);
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
                    deleteProcessClass(obj);
                }, function () {

                });
            }
        };

        function deleteProcessClass(obj) {
            ResourceService.deleteProcessClassConfig(obj).then(function (res) {
                for (let i = 0; i < vm.allAgentClusters.length; i++) {
                    if (vm.allAgentClusters[i].path == processClass.path) {
                        vm.allAgentClusters.splice(i, 1);
                        break;
                    }
                }
            });
        }



        /** <<<<<<<<<<<<< End Agent clusters >>>>>>>>>>>>>>> */


        /** -----------------Begin Agent Job Execution------------------- */

        vm.sortByAT = function (propertyName) {
            vm.agentJobExecutionFilters.reverse = !vm.agentJobExecutionFilters.reverse;
            vm.agentJobExecutionFilters.filter.sortBy = propertyName;
        };
        vm.agentJobExecutionFilters.current = vm.userPreferences.agentTask == 'current';

        function checkSharedFiltersAgent() {
            if (vm.permission.JOCConfigurations.share.view) {
                let obj = {};
                obj.jobschedulerId = vm.schedulerIds.selected;
                obj.configurationType = "CUSTOMIZATION";
                obj.objectType = "AGENTCLUSTER";
                obj.shared = true;
                UserService.configurations(obj).then(function (res) {
                    if (res.configurations && res.configurations.length > 0)
                        vm.agentFilterList = res.configurations;
                    getCustomizationsAgent();
                }, function () {
                    vm.agentFilterList = [];
                    getCustomizationsAgent();
                });
            } else {
                vm.agentFilterList = [];
                getCustomizationsAgent();
            }
        }

        function getCustomizationsAgent() {
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.account = vm.permission.user;
            obj.configurationType = "CUSTOMIZATION";
            obj.objectType = "AGENTCLUSTER";
            UserService.configurations(obj).then(function (res) {
                if (vm.agentFilterList && vm.agentFilterList.length > 0) {
                    if (res.configurations && res.configurations.length > 0) {
                        vm.agentFilterList = vm.agentFilterList.concat(res.configurations);
                    }
                    let data = [];

                    for (let i = 0; i < vm.agentFilterList.length; i++) {
                        let flag = true;
                        for (let j = 0; j < data.length; j++) {
                            if (data[j].account == vm.agentFilterList[i].account && data[j].name == vm.agentFilterList[i].name) {
                                flag = false;
                            }
                        }
                        if (flag) {
                            data.push(vm.agentFilterList[i]);
                        }
                    }
                    vm.agentFilterList = data;
                } else {
                    vm.agentFilterList = res.configurations;
                }

                if (vm.savedAgentFilter.selected) {
                    var flag = true;
                    angular.forEach(vm.agentFilterList, function (value) {
                        if (value.id == vm.savedAgentFilter.selected) {
                            flag = false;
                            UserService.configuration({
                                jobschedulerId: value.jobschedulerId,
                                id: value.id
                            }).then(function (conf) {
                                loadConfig = true;
                                vm.selectedFilteredAgent = JSON.parse(conf.configuration.configurationItem);
                                vm.selectedFilteredAgent.account = value.account;
                                getAgentTasks();
                            });
                        }
                    });
                    if (flag) {
                        vm.savedAgentFilter.selected = undefined;
                        loadConfig = true;
                        getAgentTasks();
                    }
                } else {
                    loadConfig = true;
                    vm.savedAgentFilter.selected = undefined;
                    getAgentTasks();
                }

            }, function (err) {
                loadConfig = true;
                vm.savedAgentFilter.selected = undefined;
                getAgentTasks();
            });
        }

        function isCustomizationSelected(flag) {
            if (flag) {
                vm.temp_filter = angular.copy(vm.agentJobExecutionFilters.filter.date);
                vm.agentJobExecutionFilters.filter.date = '';
            } else {
                if (vm.temp_filter)
                    vm.agentJobExecutionFilters.filter.date = angular.copy(vm.temp_filter);
                else
                    vm.agentJobExecutionFilters.filter.date = 'today';
            }
        }

        /**
         * Function to initialized Agent tasks
         */
        vm.loadAgentTasks = getAgentTasks;

        function getAgentTasks() {
            vm.isLoading = false;
            var obj = {};
            obj.jobschedulerId = vm.agentJobExecutionFilters.current == true ? vm.schedulerIds.selected : '';

            if (vm.selectedFilteredAgent && !_.isEmpty(vm.selectedFilteredAgent)) {
                isCustomizationSelected(true);

                if (vm.selectedFilteredAgent.date === 'process') {
                    if (vm.selectedFilteredAgent.planned) {
                        obj.dateFrom = parseProcessExecuted(vm.selectedFilteredAgent.planned);
                    }
                } else {
                    if (vm.selectedFilteredAgent.from) {
                        var fromDate = new Date(vm.selectedFilteredAgent.from);
                        if (vm.selectedFilteredAgent.fromTime) {
                            if (vm.selectedFilteredAgent.fromTime === '24:00' || vm.selectedFilteredAgent.fromTime === '24:00:00') {
                                fromDate.setDate(fromDate.getDate() + 1);
                                fromDate.setHours(0);
                                fromDate.setMinutes(0);
                                fromDate.setSeconds(0);
                                fromDate.setMilliseconds(0);
                            } else {
                                fromDate.setHours(moment(vm.selectedFilteredAgent.fromTime, 'HH:mm:ss').hours());
                                fromDate.setMinutes(moment(vm.selectedFilteredAgent.fromTime, 'HH:mm:ss').minutes());
                                fromDate.setSeconds(moment(vm.selectedFilteredAgent.fromTime, 'HH:mm:ss').seconds());
                            }
                        } else {
                            fromDate.setHours(0);
                            fromDate.setMinutes(0);
                            fromDate.setSeconds(0);
                        }
                        fromDate.setMilliseconds(0);
                        obj.dateFrom = moment.utc(fromDate);
                    }
                    if (vm.selectedFilteredAgent.to) {
                        var toDate = new Date(vm.selectedFilteredAgent.to);
                        if (vm.selectedFilteredAgent.toTime) {
                            if (vm.selectedFilteredAgent.toTime === '24:00' || vm.selectedFilteredAgent.toTime === '24:00:00') {
                                toDate.setDate(toDate.getDate() + 1);
                                toDate.setHours(0);
                                toDate.setMinutes(0);
                                toDate.setSeconds(0);
                            } else {
                                toDate.setHours(moment(vm.selectedFilteredAgent.toTime, 'HH:mm:ss').hours());
                                toDate.setMinutes(moment(vm.selectedFilteredAgent.toTime, 'HH:mm:ss').minutes());
                                toDate.setSeconds(moment(vm.selectedFilteredAgent.toTime, 'HH:mm:ss').seconds());
                            }
                        } else {
                            toDate.setHours(0);
                            toDate.setMinutes(0);
                            toDate.setSeconds(0);
                        }
                        toDate.setMilliseconds(0);
                        obj.dateTo = moment.utc(toDate);
                    }
                }

                if ((obj.dateFrom && typeof obj.dateFrom.getMonth === 'function')) {
                    obj.dateFrom = moment(obj.dateFrom).tz(vm.userPreferences.zone)._d;
                }
                if ((obj.dateTo && typeof obj.dateTo.getMonth === 'function')) {
                    obj.dateTo = moment(obj.dateTo).tz(vm.userPreferences.zone)._d;
                }
                if (vm.selectedFilteredAgent.url) {
                    vm.selectedFilteredAgent.url = vm.selectedFilteredAgent.url.replace(/\s*(,|^|$)\s*/g, "$1");
                    obj.agents = vm.selectedFilteredAgent.url.split(',');
                }
            } else {
                obj = setDateRange(obj);
            }
            ResourceService.getAgentTask(obj).then(function (res) {
                vm.agentTasks = res.agents;
                vm.totalJobExecution = res.totalNumOfSuccessfulTasks;
                vm.totalJobs = res.totalNumOfJobs;
                vm.isLoading = true;
            }, function () {
                vm.isLoading = true;
                vm.agentTasks = [];
            });
        }

        function setDateRange(filter) {
            if (vm.agentJobExecutionFilters.filter.date == 'today') {
                let from = new Date();
                let to = new Date();
                from.setHours(0);
                from.setMinutes(0);
                from.setSeconds(0);
                from.setMilliseconds(0);
                to.setDate(to.getDate() + 1);
                to.setHours(0);
                to.setMinutes(0);
                to.setSeconds(0);
                to.setMilliseconds(0);

                filter.dateFrom = moment.utc(from);
                filter.dateTo = moment.utc(to);

            } else if (vm.agentJobExecutionFilters.filter.date && vm.agentJobExecutionFilters.filter.date != 'all') {
                filter.dateFrom = vm.agentJobExecutionFilters.filter.date;
                filter.timeZone = vm.userPreferences.zone;
            }
            if ((filter.dateFrom && typeof filter.dateFrom.getMonth === 'function') || (filter.dateTo && typeof filter.dateTo.getMonth === 'function')) {
                delete filter["timeZone"];
            }
            if ((filter.dateFrom && typeof filter.dateFrom.getMonth === 'function')) {
                filter.dateFrom = moment(filter.dateFrom).tz(vm.userPreferences.zone)._d;
            }
            if ((filter.dateTo && typeof filter.dateTo.getMonth === 'function')) {
                filter.dateTo = moment(filter.dateTo).tz(vm.userPreferences.zone)._d;
            }

            return filter;
        }

        vm.changeJobScheduler = function () {
            getAgentTasks();
        };

        vm.agentJobSearch = {};
        vm.advancedSearch = function () {
            vm.agentJobSearch = {};
            vm.showSearchPanel = true;
            vm.isUnique = true;
            vm.agentJobSearch.date = 'date';
            vm.agentJobSearch.from = new Date();
            vm.agentJobSearch.fromTime = '00:00';
            vm.agentJobSearch.to = new Date();
            vm.agentJobSearch.toTime = moment().format("HH:mm")
        };
        vm.cancel = function () {
            if (!vm.agentJobExecutionFilters.filter.date) {
                vm.agentJobExecutionFilters.filter.date = 'today';
            }
            vm.showSearchPanel = false;
            vm.agentJobSearch = {};
            if (hitSearch) {
                hitSearch = false;
                getAgentTasks();
            }
        };

        vm.exportToExcel = function () {
            $('#exportToExcelBtn').attr("disabled", true);
            if (!vm.isIE()) {
                $('#agentJobExecution').table2excel({
                    exclude: ".tableexport-ignore",
                    filename: "jobscheduler-agent-job-excution",
                    fileext: ".xls",
                    exclude_img: false,
                    exclude_links: false,
                    exclude_inputs: false
                });
            } else {
                var ExportButtons = document.getElementById('agentJobExecution');
                var instance = new TableExport(ExportButtons, {
                    formats: ['xlsx'],
                    exportButtons: false
                });
                var exportData = instance.getExportData()['agentJobExecution']['xlsx'];
                instance.export2file(exportData.data, exportData.mimeType, "jobscheduler-agent-job-excution", exportData.fileExtension);
            }
            $('#exportToExcelBtn').attr("disabled", false);
        };
        let hitSearch = false;
        vm.search = function () {
            var obj = {};
            if (vm.agentJobSearch.jobschedulerId) {
                obj.jobschedulerId = vm.agentJobSearch.jobschedulerId;
            } else {
                obj.jobschedulerId = vm.agentJobExecutionFilters.current == true ? vm.schedulerIds.selected : '';
            }
            if (vm.agentJobSearch.url) {
                vm.agentJobSearch.url = vm.agentJobSearch.url.replace(/\s*(,|^|$)\s*/g, "$1");
                obj.agents = vm.agentJobSearch.url.split(',');
            }
            if (vm.agentJobSearch.date == 'process') {
                obj.dateFrom = parseProcessExecuted(vm.selectedFiltered.planned);
            } else {
                if (vm.agentJobSearch.from) {
                    var fromDate = new Date(vm.agentJobSearch.from);
                    if (vm.agentJobSearch.fromTime) {
                        if (vm.agentJobSearch.fromTime === '24:00' || vm.agentJobSearch.fromTime === '24:00:00') {
                            fromDate.setDate(fromDate.getDate() + 1);
                            fromDate.setHours(0);
                            fromDate.setMinutes(0);
                            fromDate.setSeconds(0);
                            fromDate.setMilliseconds(0);
                        } else {
                            fromDate.setHours(moment(vm.agentJobSearch.fromTime, 'HH:mm:ss').hours());
                            fromDate.setMinutes(moment(vm.agentJobSearch.fromTime, 'HH:mm:ss').minutes());
                            fromDate.setSeconds(moment(vm.agentJobSearch.fromTime, 'HH:mm:ss').seconds());
                        }
                    } else {
                        fromDate.setHours(0);
                        fromDate.setMinutes(0);
                        fromDate.setSeconds(0);
                    }
                    fromDate.setMilliseconds(0);
                    obj.dateFrom = moment.utc(fromDate);
                }
                if (vm.agentJobSearch.to) {
                    var toDate = new Date(vm.agentJobSearch.to);
                    if (vm.agentJobSearch.toTime) {
                        if (vm.agentJobSearch.toTime === '24:00' || vm.agentJobSearch.toTime === '24:00:00') {
                            toDate.setDate(toDate.getDate() + 1);
                            toDate.setHours(0);
                            toDate.setMinutes(0);
                            toDate.setSeconds(0);
                        } else {
                            toDate.setHours(moment(vm.agentJobSearch.toTime, 'HH:mm:ss').hours());
                            toDate.setMinutes(moment(vm.agentJobSearch.toTime, 'HH:mm:ss').minutes());
                            toDate.setSeconds(moment(vm.agentJobSearch.toTime, 'HH:mm:ss').seconds());
                        }
                    } else {
                        toDate.setHours(0);
                        toDate.setMinutes(0);
                        toDate.setSeconds(0);
                    }
                    toDate.setMilliseconds(0);
                    obj.dateTo = moment.utc(toDate);
                }
            }

            if ((obj.dateFrom && typeof obj.dateFrom.getMonth === 'function')) {
                obj.dateFrom = moment(obj.dateFrom).tz(vm.userPreferences.zone)._d;
            }
            if ((obj.dateTo && typeof obj.dateTo.getMonth === 'function')) {
                obj.dateTo = moment(obj.dateTo).tz(vm.userPreferences.zone)._d;
            }
            vm.agentJobExecutionFilters.filter.date = '';
            hitSearch = true;
            ResourceService.getAgentTask(obj).then(function (res) {
                vm.agentTasks = res.agents;
                vm.totalJobExecution = res.totalNumOfSuccessfulTasks;
            });
        };

        /** <<<<<<<<<<<<< End Agent Job Execution >>>>>>>>>>>>>>> */

        /** -----------------Begin Events------------------- */

        vm.sortByE = function (propertyName) {
            vm.eventFilters.reverse = !vm.eventFilters.reverse;
            vm.eventFilters.filter.sortBy = propertyName;
            vm.object = {};
        };
        vm.object.events = [];
        vm.checkAllEvent = {
            checkbox: false
        };
        vm.checkAllEventFnc = function (filtered) {
            if (vm.checkAllEvent.checkbox && filtered.length > 0) {
                let _events = $filter('orderBy')(filtered, vm.eventFilters.filter.sortBy, vm.eventFilters.reverse);
                vm.object.events = _events.slice((vm.userPreferences.entryPerPage * (vm.eventFilters.currentPage - 1)), (vm.userPreferences.entryPerPage * vm.eventFilters.currentPage));
            } else {
                vm.object.events = [];
            }
        };

        var watcher6 = $scope.$watchCollection('object.events', function (newNames) {
            if (newNames && newNames.length > 0) {
                let _events = $filter('filter')(vm.customEvents, {path: vm.eventFilters.searchText});
                vm.checkAllEvent.checkbox = newNames.length === _events.slice((vm.userPreferences.entryPerPage * (vm.eventFilters.currentPage - 1)), (vm.userPreferences.entryPerPage * vm.eventFilters.currentPage)).length;
            } else {
                vm.checkAllEvent.checkbox = false;
            }
        });

        vm.loadEvents = getEvents;

        function getEvents() {
            vm.isLoading = false;
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            if (vm.selectedFiltered) {
                if (vm.selectedFiltered.from1) {
                    obj.dateFrom = parseProcessExecuted(vm.selectedFiltered.from1);
                }
                if (vm.selectedFiltered.to1) {
                    obj.dateTo = parseProcessExecuted(vm.selectedFiltered.to1);
                }
                if (vm.selectedFiltered.jobs) {
                    obj.jobs = [];
                    angular.forEach(vm.selectedFiltered.jobs, function (job) {
                        obj.jobs.push({job: job});
                    });
                }
                if (vm.selectedFiltered.jobChains) {
                    obj.orders = [];
                    let jobChainsArr = angular.copy(vm.selectedFiltered.jobChains);
                    if (vm.selectedFiltered.orders) {
                        angular.forEach(vm.selectedFiltered.orders, function (order) {
                            let index = jobChainsArr.indexOf(order.jobChain);
                            if (index > -1) {
                                jobChainsArr.splice(index, 1);
                            }
                        });
                    }
                    angular.forEach(jobChainsArr, function (jobChain) {
                        obj.orders.push({jobChain: jobChain});
                    });
                    if (vm.selectedFiltered.orders) {
                        obj.orders = obj.orders.concat(vm.selectedFiltered.orders);
                    }
                } else if (vm.selectedFiltered.orders) {
                    obj.orders = vm.selectedFiltered.orders;
                }
                if (vm.selectedFiltered.eventIds) {
                    vm.selectedFiltered.eventIds = vm.selectedFiltered.eventIds.replace(/\s*(,|^|$)\s*/g, "$1");
                    obj.eventIds = vm.selectedFiltered.eventIds.split(',');
                }
                if (vm.selectedFiltered.eventClasses) {
                    vm.selectedFiltered.eventIds = vm.selectedFiltered.eventIds.replace(/\s*(,|^|$)\s*/g, "$1");
                    obj.eventClasses = vm.selectedFiltered.eventClasses.split(',');
                }
                if (vm.selectedFiltered.exitCodes || vm.selectedFiltered.exitCodes == 0) {
                    var regExp = new RegExp("[0-9]+", "g");
                    var data = vm.selectedFiltered.exitCodes.match(regExp);
                    if (data) {
                        obj.exitCodes = [];
                        for (var i = 0; i < data.length; i++) {
                            obj.exitCodes.push(parseInt(data[i]))
                        }
                    }
                }
            }

            EventService.getEvents(obj).then(function (res) {
                vm.customEvents = res.events;
                vm.isLoading = true;
            }, function () {
                vm.isLoading = true;
                vm.customEvents = [];
            });
        }

        vm.checkExpireValue = function (type) {
            if (type === 'expirationPeriod') {
                vm.event.expirationCycle = '';
                vm.event.expiresDate = '';
                vm.event.expiresTime = '';
            } else if (type === 'expirationCycle') {
                vm.event.expirationPeriod = '';
                vm.event.expiresDate = '';
                vm.event.expiresTime = '';
            } else if (type === 'expires') {
                vm.event.expirationCycle = '';
                vm.event.expirationPeriod = '';
            }
        };

        function addEvent() {
            var obj = {};
            obj.eventId = vm.event.eventId;
            obj.eventClass = vm.event.eventClass;
            obj.exitCode = vm.event.exitCode;

            if (vm.event.expiresDate) {
                if (vm.event.expiresTime) {
                    vm.event.expiresDate.setHours(moment(vm.event.expiresTime, 'HH:mm:ss').hours());
                    vm.event.expiresDate.setMinutes(moment(vm.event.expiresTime, 'HH:mm:ss').minutes());
                    vm.event.expiresDate.setSeconds(moment(vm.event.expiresTime, 'HH:mm:ss').seconds());
                }
                obj.expires = vm.event.expiresDate;
            } else if (vm.event.expirationPeriod) {
                obj.expirationPeriod = vm.event.expirationPeriod;
            } else if (vm.event.expirationCycle) {
                let d = new Date();
                d.setHours(moment(vm.event.expirationCycle, 'HH:mm:ss').hours());
                d.setMinutes(moment(vm.event.expirationCycle, 'HH:mm:ss').minutes());
                d.setSeconds(moment(vm.event.expirationCycle, 'HH:mm:ss').seconds());

                obj.expirationCycle = moment(d).utc().format('HH:mm:ss');
            }

            obj.job = vm.event.job;
            obj.jobChain = vm.event.jobChain;
            obj.orderId = vm.event.order;

            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.auditLog = {};
            if (vm.comments.comment)
                obj.auditLog.comment = vm.comments.comment;
            if (vm.comments.timeSpent)
                obj.auditLog.timeSpent = vm.comments.timeSpent;

            if (vm.comments.ticketLink)
                obj.auditLog.ticketLink = vm.comments.ticketLink;

            if (vm.paramObject.params && vm.paramObject.params.length > 0)
                obj.params = vm.paramObject.params;
            EventService.addEvent(obj);
        }

        vm.addEvent = function () {
            vm.event = {};
            vm.event.exitCode = 0;
            vm.comments = {};
            vm.comments.radio = 'predefined';
            vm.paramObject = {};
            vm.paramObject.params = [];
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/add-event-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                addEvent();
            }, function () {

            });
        };

        vm.deleteEvent = function (event) {
            vm._event = event;
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.ids = [];
            if (event) {
                obj.ids.push(event.id);
            } else {
                angular.forEach(vm.object.events, function (value) {
                    obj.ids.push(value.id);
                });
            }
            var modalInstance = {};
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = '';
                vm.comments.operation = 'Delete';
                vm.comments.type = 'Event';
                if (event) {
                    vm.comments.name = event.eventId;
                } else {
                    angular.forEach(vm.object.events, function (value, index) {
                        if (index == vm.object.events.length - 1) {
                            vm.comments.name = vm.comments.name + ' ' + value.eventId;
                        } else {
                            vm.comments.name = value.eventId + ', ' + vm.comments.name;
                        }
                    });
                }
                modalInstance = $uibModal.open({
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
                    EventService.deleteEvent(obj).then(function (res) {
                        if (event) {
                            event.isDeleted = true;
                        } else {
                            angular.forEach(vm.object.events, function (value) {
                                value.isDeleted = true;
                            });
                            vm.object.events = [];
                        }
                    });

                }, function () {
                    vm.object.events = [];
                });
            } else {
                modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/delete-confirm-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    EventService.deleteEvent(obj).then(function (res) {
                        if (event) {
                            event.isDeleted = true;
                        } else {
                            angular.forEach(vm.object.events, function (value) {
                                value.isDeleted = true;
                            });
                            vm.object.events = [];
                        }
                    });

                }, function () {
                    vm.object.events = [];
                });
            }
        };

        vm.eventSearch = {};
        vm.advancedEventSearch = function () {
            vm.eventSearch = {};
            vm.isUnique = true;
            vm.showSearchEventPanel = true;
            vm.eventSearch.date = 'date';
        };
        vm.cancelEventSearch = function (form) {
            vm.eventSearch = {};
            vm.showSearchEventPanel = false;
            if (form)
                form.$setPristine();
            getEvents();
        };

        function checkSharedFilters() {
            if (vm.permission.JOCConfigurations.share.view) {
                var obj = {};
                obj.jobschedulerId = vm.schedulerIds.selected;
                obj.configurationType = "CUSTOMIZATION";
                obj.objectType = "EVENT";
                obj.shared = true;
                UserService.configurations(obj).then(function (res) {
                    if (res.configurations && res.configurations.length > 0)
                        vm.eventFilterList = res.configurations;
                    getCustomizations();
                }, function () {
                    vm.eventFilterList = [];
                    getCustomizations();
                });
            } else {
                vm.eventFilterList = [];
                getCustomizations();
            }
        }

        vm.tree1 = [];
        vm.filter_tree1 = {};
        vm.expanding_property = {
            field: "name"
        };
        vm.getTreeStructureForObject = function (type) {
            vm.clickOn = type;
            $('#singleObjectModal').modal('show');
            if (type == 'jobChain') {
                OrderService.tree({
                    jobschedulerId: vm.schedulerIds.selected,
                    compact: true,
                    types: ['ORDER']
                }).then(function (res) {
                    vm.tree1 = res.folders;
                    angular.forEach(vm.tree1, function (value) {
                        value.expanded = true;
                        if (value.folders) {
                            value.folders = orderBy(value.folders, 'name');
                        }
                    });
                }, function () {
                    $('#singleObjectModal').modal('hide');
                });
            } else if (type == 'job') {
                JobService.tree({
                    jobschedulerId: vm.schedulerIds.selected,
                    compact: true,
                    types: ['JOB']
                }).then(function (res) {
                    vm.tree1 = res.folders;
                    angular.forEach(vm.tree1, function (value) {
                        value.expanded = true;
                        if (value.folders) {
                            value.folders = orderBy(value.folders, 'name');
                        }
                    });
                }, function () {
                    $('#singleObjectModal').modal('hide');
                });
            }
        };
        vm.getTreeStructureForObjects = function (type) {
            vm.clickOn = type;
            $('#objectModal').modal('show');
            if (type == 'jobChain') {
                OrderService.tree({
                    jobschedulerId: vm.schedulerIds.selected,
                    compact: true,
                    types: ['ORDER']
                }).then(function (res) {
                    vm.tree1 = res.folders;
                    angular.forEach(vm.tree1, function (value) {
                        value.expanded = true;
                        if (value.folders) {
                            value.folders = orderBy(value.folders, 'name');
                        }
                    });
                }, function () {
                    $('#objectModal').modal('hide');
                });
            } else if (type == 'job') {
                JobService.tree({
                    jobschedulerId: vm.schedulerIds.selected,
                    compact: true,
                    types: ['JOB']
                }).then(function (res) {
                    vm.tree1 = res.folders;
                    angular.forEach(vm.tree1, function (value) {
                        value.expanded = true;
                        if (value.folders) {
                            value.folders = orderBy(value.folders, 'name');
                        }
                    });
                }, function () {
                    $('#objectModal').modal('hide');
                });
            }
        };

        vm.treeHandler = function (data) {
            if (!data.expanded && !data.level) {

                if (data.jobChain) {
                    vm.event.jobChain = data.jobChain;
                } else if (data.order) {
                    vm.event.order = data.order.orderId;
                    vm.event.jobChain = data.order.jobChain;
                } else if (data.job) {
                    vm.event.job = data.job;
                }
                $('#singleObjectModal').modal('hide');
                return;
            }
            data.expanded = !data.expanded;
            if (data.expanded) {
                if (vm.clickOn === 'jobChain') {
                    data.jobChains = [];
                    let obj = {};
                    obj.jobschedulerId = vm.schedulerIds.selected;
                    obj.compact = true;
                    obj.folders = [{folder: data.path, recursive: false}];
                    OrderService.getOrdersP(obj).then(function (result) {
                        data.jobChains = result.orders;
                        setTimeout(function () {
                            if (window.localStorage.$SOS$THEME == 'lighter' || window.localStorage.$SOS$THEME == 'light') {
                                $('.order_img').attr("src", 'images/order.png');
                            }
                        }, 30);

                    });
                } else {
                    data.jobs = [];
                    let obj = {};
                    obj.jobschedulerId = vm.schedulerIds.selected;
                    obj.compact = true;
                    obj.folders = [{folder: data.path, recursive: false}];
                    JobService.getJobsP(obj).then(function (result) {
                        data.jobs = result.jobs;
                        setTimeout(function () {
                            if (window.localStorage.$SOS$THEME == 'lighter' || window.localStorage.$SOS$THEME == 'light') {
                                $('.job_img').attr("src", 'images/job.png');
                            }
                        }, 30);
                    });
                }
            } else {
                data.jobChains = [];
                data.jobs = [];
            }
        };

        vm.treeHandler1 = function (data) {
            if (data.expanded) {
                data.folders = orderBy(data.folders, 'name');
            }
        };

        vm.object.orders = [];
        vm.object.jobChains = [];
        vm.object.jobs = [];

        var watcher7 = $scope.$watchCollection('object.orders', function (newNames) {
            if (newNames && newNames.length > 0) {
                vm.orders = [];
                angular.forEach(newNames, function (v) {
                    vm.orders.push({orderId: v.orderId, jobChain: v.jobChain});
                });
            }
        });
        var watcher8 = $scope.$watchCollection('object.jobChains', function (newNames) {
            if (newNames && newNames.length > 0) {
                vm.jobChains = newNames;
            }
        });
        var watcher9 = $scope.$watchCollection('object.jobs', function (newNames) {
            if (newNames && newNames.length > 0) {
                vm.jobs = newNames;
            }
        });

        vm.addObjectPaths = function () {
            if (vm.clickOn == 'jobChain') {
                if (vm.eventSearch && vm.showSearchEventPanel) {
                    vm.eventSearch.orders = vm.orders;
                    vm.eventSearch.jobChains = vm.jobChains;
                } else if (vm.eventFilter && !vm.showSearchEventPanel) {
                    vm.eventFilter.orders = vm.orders;
                    vm.eventFilter.jobChains = vm.jobChains;
                }
            } else {
                if (vm.eventSearch && vm.showSearchEventPanel) {
                    vm.eventSearch.jobs = vm.jobs;
                } else if (vm.eventFilter && !vm.showSearchEventPanel) {
                    vm.eventFilter.jobs = vm.jobs;
                }
            }
        };
        vm.addObjectPath = function () {
            if (vm.clickOn == 'jobChain') {
                if (vm.eventSearch && vm.showSearchEventPanel) {
                    vm.eventSearch.orders = vm.orders;
                    vm.eventSearch.jobChains = vm.jobChains;
                } else if (vm.eventFilter && !vm.showSearchEventPanel) {
                    vm.eventFilter.orders = vm.orders;
                    vm.eventFilter.jobChains = vm.jobChains;
                }
            } else {
                if (vm.eventSearch && vm.showSearchEventPanel) {
                    vm.eventSearch.jobs = vm.jobs;
                } else if (vm.eventFilter && !vm.showSearchEventPanel) {
                    vm.eventFilter.jobs = vm.jobs;
                }
            }
        };
        vm.remove = function (object, type) {
            if (type == 'jobChain') {
                if (vm.eventFilter && vm.eventFilter.jobChains && !vm.showSearchEventPanel) {
                    for (let i = 0; i < vm.eventFilter.jobChains.length; i++) {
                        if (angular.equals(vm.eventFilter.jobChains[i], object)) {
                            vm.eventFilter.jobChains.splice(i, 1);
                            break;
                        }
                    }

                } else {
                    for (let i = 0; i < vm.eventSearch.jobChains.length; i++) {
                        if (angular.equals(vm.eventSearch.jobChains[i], object)) {
                            vm.eventSearch.jobChains.splice(i, 1);
                            break;
                        }
                    }

                }
            } else if (type == 'job') {
                if (vm.eventFilter && vm.eventFilter.jobs && !vm.showSearchEventPanel) {
                    for (let i = 0; i < vm.eventFilter.jobs.length; i++) {
                        if (angular.equals(vm.eventFilter.jobs[i], object)) {
                            vm.eventFilter.jobs.splice(i, 1);
                            break;
                        }
                    }
                } else {
                    for (let i = 0; i < vm.eventSearch.jobs.length; i++) {
                        if (angular.equals(vm.eventSearch.jobs[i], object)) {
                            vm.eventSearch.jobs.splice(i, 1);
                            break;
                        }
                    }
                }

            } else if (type == 'order') {
                if (vm.eventFilter && vm.eventFilter.orders && !vm.showSearchEventPanel) {
                    for (let i = 0; i < vm.eventFilter.orders.length; i++) {
                        if (angular.equals(vm.eventFilter.orders[i], object)) {
                            vm.eventFilter.orders.splice(i, 1);
                            vm.object.orders.splice(i, 1);
                            break;
                        }
                    }
                } else {
                    for (let i = 0; i < vm.eventSearch.orders.length; i++) {
                        if (angular.equals(vm.eventSearch.orders[i], object)) {
                            vm.eventSearch.orders.splice(i, 1);
                            vm.object.orders.splice(i, 1);
                            break;
                        }
                    }
                }

            }
        };
        var loadConfig = true;

        function getCustomizations() {
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.account = vm.permission.user;
            obj.configurationType = "CUSTOMIZATION";
            obj.objectType = "EVENT";
            UserService.configurations(obj).then(function (res) {
                if (vm.eventFilterList && vm.eventFilterList.length > 0) {
                    if (res.configurations && res.configurations.length > 0) {
                        vm.eventFilterList = vm.eventFilterList.concat(res.configurations);
                    }
                    var data = [];

                    for (let i = 0; i < vm.eventFilterList.length; i++) {
                        var flag = true;
                        for (let j = 0; j < data.length; j++) {
                            if (data[j].account == vm.eventFilterList[i].account && data[j].name == vm.eventFilterList[i].name) {
                                flag = false;
                            }
                        }
                        if (flag) {
                            data.push(vm.eventFilterList[i]);
                        }
                    }
                    vm.eventFilterList = data;
                } else {
                    vm.eventFilterList = res.configurations;
                }

                if (vm.savedEventFilter.selected) {
                    var flag = true;
                    angular.forEach(vm.eventFilterList, function (value) {
                        if (value.id == vm.savedEventFilter.selected) {
                            flag = false;
                            UserService.configuration({
                                jobschedulerId: value.jobschedulerId,
                                id: value.id
                            }).then(function (conf) {
                                loadConfig = true;
                                vm.selectedFiltered = JSON.parse(conf.configuration.configurationItem);
                                vm.selectedFiltered.account = value.account;
                                getEvents();
                            });
                        }
                    });
                    if (flag) {
                        vm.savedEventFilter.selected = undefined;
                        loadConfig = true;
                        getEvents();
                    }
                } else {
                    loadConfig = true;
                    vm.savedEventFilter.selected = undefined;
                    getEvents();
                }

            }, function (err) {
                loadConfig = true;
                vm.savedEventFilter.selected = undefined;
                getEvents();
            });
        }

        vm.saveAsFilter = function (form) {
            let configObj = {};
            configObj.jobschedulerId = vm.schedulerIds.selected;
            configObj.account = vm.permission.user;
            configObj.configurationType = "CUSTOMIZATION";
            configObj.id = 0;
            if (vm.resourceFilters.state === 'events') {
                configObj.objectType = "EVENT";
                configObj.name = vm.eventSearch.name;
                configObj.configurationItem = JSON.stringify(vm.eventSearch);
                UserService.saveConfiguration(configObj).then(function (res) {
                    configObj.id = res.id;
                    vm.eventSearch.name = '';
                    if (form)
                        form.$setPristine();
                    vm.eventFilterList.push(configObj);
                });
            } else {
                configObj.objectType = "AGENTCLUSTER";
                configObj.name = vm.agentJobSearch.name;
                configObj.configurationItem = JSON.stringify(vm.agentJobSearch);
                UserService.saveConfiguration(configObj).then(function (res) {
                    configObj.id = res.id;
                    vm.agentJobSearch.name = '';
                    if (form)
                        form.$setPristine();
                    vm.agentFilterList.push(configObj);
                });
            }
        };

        vm.advanceFilter = function () {
            if(vm.resourceFilters.state === 'events') {
                vm.eventSearch = {};
                vm.showSearchEventPanel = false;
                vm.isUnique = true;
                vm.action = 'add';
                vm.eventFilter = {};
                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/event-filter-dialog.html',
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
                    configObj.name = vm.eventFilter.name;
                    configObj.shared = vm.eventFilter.shared;
                    configObj.id = 0;
                    configObj.configurationItem = JSON.stringify(vm.eventFilter);
                    configObj.objectType = "EVENT";

                    UserService.saveConfiguration(configObj).then(function (res) {
                        configObj.id = res.id;
                        vm.eventFilterList.push(configObj);
                        if (vm.eventFilterList.length == 1) {
                            vm.savedEventFilter.selected = res.id;
                            vm.eventFilters.selectedView = true;
                            vm.selectedFiltered = vm.eventFilter;
                            vm.selectedFiltered.account = vm.permission.user;
                            SavedFilter.setEvent(vm.savedEventFilter);
                            SavedFilter.save();
                            getEvents();
                        }
                    });

                }, function () {
                });
            }else{
                vm.agentJobSearch = {};
                vm.showSearchPanel = false;
                vm.isUnique = true;
                vm.action = 'add';
                vm.agentJobExecutionFilter = {};
                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/agent-filter-dialog.html',
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
                    configObj.name = vm.agentJobExecutionFilter.name;
                    configObj.shared = vm.agentJobExecutionFilter.shared;
                    configObj.id = 0;
                    configObj.configurationItem = JSON.stringify(vm.agentJobExecutionFilter);
                    configObj.objectType = "AGENTCLUSTER";

                    UserService.saveConfiguration(configObj).then(function (res) {
                        configObj.id = res.id;
                        vm.agentFilterList.push(configObj);
                        if (vm.agentFilterList.length == 1) {
                            vm.savedAgentFilter.selected = res.id;
                            vm.agentJobExecutionFilters.selectedView = true;
                            vm.selectedFiltered = vm.agentJobExecutionFilter;
                            vm.selectedFiltered.account = vm.permission.user;
                            isCustomizationSelected(true);
                            SavedFilter.setEvent(vm.savedAgentFilter);
                            SavedFilter.save();
                            getAgentTasks();
                        }
                    });

                }, function () {
                });
            }
        };

        vm.editFilters = function () {
            vm.filters = {};
            if (vm.resourceFilters.state === 'events') {
                vm.filters.list = vm.eventFilterList;
                vm.filters.favorite = vm.savedEventFilter.favorite;
            } else {
                vm.filters.list = vm.agentFilterList;
                vm.filters.favorite = vm.savedAgentFilter.favorite;
            }
            let modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/edit-filter-dialog.html',
                controller: 'DialogCtrl',
                scope: vm
            });
        };
        var temp_name = '',temp_name1 = '';

        vm.editFilter = function (filter) {
            if(vm.resourceFilters.state === 'events') {
                vm.eventSearch = {};
                vm.showSearchEventPanel = false;
                vm.action = 'edit';
                vm.isUnique = true;
                temp_name = angular.copy(filter.name);
                UserService.configuration({jobschedulerId: filter.jobschedulerId, id: filter.id}).then(function (conf) {
                    vm.eventFilter = JSON.parse(conf.configuration.configurationItem);
                    vm.eventFilter.shared = filter.shared;
                });

                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/event-filter-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    size: 'lg',
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    if (vm.savedEventFilter.selected == filter.id) {
                        vm.selectedFiltered = vm.eventFilter;
                        vm.eventFilters.selectedView = true;

                        getEvents();
                    }
                    var configObj = {};
                    configObj.jobschedulerId = filter.jobschedulerId;
                    configObj.account = filter.account;
                    configObj.configurationType = filter.configurationType;
                    configObj.objectType = filter.objectType;
                    configObj.id = filter.id;
                    configObj.configurationItem = JSON.stringify(vm.eventFilter);
                    configObj.name = vm.eventFilter.name;
                    configObj.shared = vm.eventFilter.shared;
                    filter.shared = vm.eventFilter.shared;
                    UserService.saveConfiguration(configObj);
                    filter.name = vm.eventFilter.name;
                    temp_name = '';
                }, function () {
                    temp_name = '';
                });
            }else{
                vm.agentJobSearch = {};
                vm.showSearchPanel = false;
                vm.action = 'edit';
                vm.isUnique = true;
                temp_name1 = angular.copy(filter.name);
                UserService.configuration({jobschedulerId: filter.jobschedulerId, id: filter.id}).then(function (conf) {
                    vm.agentJobExecutionFilter = JSON.parse(conf.configuration.configurationItem);
                    vm.agentJobExecutionFilter.shared = filter.shared;
                });

                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/agent-filter-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    size: 'lg',
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    if (vm.savedAgentFilter.selected == filter.id) {
                        vm.selectedFilteredAgent = vm.agentJobExecutionFilter;
                        vm.agentJobExecutionFilters.selectedView = true;
                        isCustomizationSelected(true);
                        getAgentTasks();
                    }
                    var configObj = {};
                    configObj.jobschedulerId = filter.jobschedulerId;
                    configObj.account = filter.account;
                    configObj.configurationType = filter.configurationType;
                    configObj.objectType = filter.objectType;
                    configObj.id = filter.id;
                    configObj.configurationItem = JSON.stringify(vm.agentJobExecutionFilter);
                    configObj.name = vm.agentJobExecutionFilter.name;
                    configObj.shared = vm.agentJobExecutionFilter.shared;
                    filter.shared = vm.agentJobExecutionFilter.shared;
                    UserService.saveConfiguration(configObj);
                    filter.name = vm.agentJobExecutionFilter.name;
                    temp_name1 = '';
                }, function () {
                    temp_name1 = '';
                });
            }
        };

        vm.copyFilter = function (filter) {
            if (vm.resourceFilters.state === 'events') {
                vm.action = 'copy';
                vm.isUnique = true;
                UserService.configuration({
                    jobschedulerId: filter.jobschedulerId,
                    id: filter.id
                }).then(function (conf) {
                    vm.eventFilter = JSON.parse(conf.configuration.configurationItem);
                    vm.eventFilter.shared = filter.shared;
                    vm.eventFilter.name = vm.checkCopyName(vm.eventFilterList, filter.name);
                });

                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/event-filter-dialog.html',
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
                    configObj.name = vm.eventFilter.name;
                    configObj.shared = vm.eventFilter.shared;
                    configObj.objectType = filter.objectType;
                    configObj.id = 0;
                    configObj.configurationItem = JSON.stringify(vm.eventFilter);
                    UserService.saveConfiguration(configObj).then(function (res) {
                        configObj.id = res.id;
                        vm.eventFilterList.push(configObj);
                    });
                }, function () {
                });
            } else {
                vm.action = 'copy';
                vm.isUnique = true;
                UserService.configuration({
                    jobschedulerId: filter.jobschedulerId,
                    id: filter.id
                }).then(function (conf) {
                    vm.agentJobExecutionFilter = JSON.parse(conf.configuration.configurationItem);
                    vm.agentJobExecutionFilter.shared = filter.shared;
                    vm.agentJobExecutionFilter.name = vm.checkCopyName(vm.agentFilterList, filter.name);
                });

                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/agent-filter-dialog.html',
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
                    configObj.name = vm.agentJobExecutionFilter.name;
                    configObj.shared = vm.agentJobExecutionFilter.shared;
                    configObj.objectType = filter.objectType;
                    configObj.id = 0;
                    configObj.configurationItem = JSON.stringify(vm.agentJobExecutionFilter);
                    UserService.saveConfiguration(configObj).then(function (res) {
                        configObj.id = res.id;
                        vm.agentFilterList.push(configObj);
                    });
                }, function () {
                });
            }
        };

        vm.deleteFilter = function (filter) {
            UserService.deleteConfiguration({
                jobschedulerId: filter.jobschedulerId,
                id: filter.id
            }).then(function () {
                if (vm.resourceFilters.state === 'events') {
                    angular.forEach(vm.eventFilterList, function (value, index) {
                        if (value.id == filter.id) {
                            vm.eventFilterList.splice(index, 1);
                        }
                    });
                    if (vm.savedEventFilter.selected == filter.id) {
                        vm.savedEventFilter.selected = undefined;
                        vm.eventFilters.selectedView = false;
                        vm.selectedFiltered = undefined;
                        getEvents();
                    } else {
                        if (vm.eventFilterList.length == 0) {
                            vm.savedEventFilter.selected = undefined;
                            vm.eventFilters.selectedView = false;
                            vm.selectedFiltered = undefined;
                        }
                    }
                    SavedFilter.setEvent(vm.savedEventFilter);
                } else {
                    angular.forEach(vm.agentFilterList, function (value, index) {
                        if (value.id == filter.id) {
                            vm.agentFilterList.splice(index, 1);
                        }
                    });
                    if (vm.savedAgentFilter.selected == filter.id) {
                        vm.savedAgentFilter.selected = undefined;
                        vm.agentJobExecutionFilters.selectedView = false;
                        vm.selectedFilteredAgent = undefined;
                        isCustomizationSelected(false);
                        getAgentTasks();
                    } else {
                        if (vm.agentFilterList.length == 0) {
                            vm.savedAgentFilter.selected = undefined;
                            vm.agentJobExecutionFilters.selectedView = false;
                            vm.selectedFilteredAgent = undefined;
                            isCustomizationSelected(false);
                        }
                    }
                    SavedFilter.setAgent(vm.savedAgentFilter);
                }
                SavedFilter.save();
            });
        };

        vm.makePrivate = function (configObj) {
            UserService.privateConfiguration({
                jobschedulerId: configObj.jobschedulerId,
                id: configObj.id
            }).then(function (res) {
                configObj.shared = false;
                if (vm.permission.user != configObj.account) {
                    if (vm.resourceFilters.state === 'events') {
                        angular.forEach(vm.eventFilterList, function (value, index) {
                            if (value.id == configObj.id) {
                                vm.eventFilterList.splice(index, 1);
                            }
                        });
                    } else {
                        angular.forEach(vm.agentFilterList, function (value, index) {
                            if (value.id == configObj.id) {
                                vm.agentFilterList.splice(index, 1);
                            }
                        });
                    }
                }
            });
        };

        vm.makeShare = function (configObj) {
            UserService.shareConfiguration({
                jobschedulerId: configObj.jobschedulerId,
                id: configObj.id
            }).then(function (res) {
                configObj.shared = true;
            });
        };

        vm.favorite = function (filter) {
            if (vm.resourceFilters.state === 'events') {
                vm.filters.favorite = filter.id;
                vm.savedEventFilter.favorite = filter.id;
                vm.eventFilters.selectedView = true;
                SavedFilter.setEvent(vm.savedEventFilter);
                SavedFilter.save();
                getEvents();
            }else {
                vm.filters.favorite = filter.id;
                vm.savedAgentFilter.favorite = filter.id;
                vm.agentJobExecutionFilters.selectedView = true;
                SavedFilter.setAgent(vm.savedAgentFilter);
                SavedFilter.save();
                getAgentTasks();
            }
        };

        vm.removeFavorite = function () {
            if (vm.resourceFilters.state === 'events') {
                vm.savedEventFilter.favorite = '';
                vm.filters.favorite = '';
                SavedFilter.setEvent(vm.savedEventFilter);
            } else {
                vm.savedAgentFilter.favorite = '';
                vm.filters.favorite = '';
                SavedFilter.setAgent(vm.savedAgentFilter);
            }
            SavedFilter.save();
        };

        vm.checkFilterName = function () {
            vm.isUnique = true;
            if (vm.resourceFilters.state === 'events') {
                if (vm.eventSearch && vm.eventSearch.name) {
                    angular.forEach(vm.eventFilterList, function (value) {
                        if (vm.eventSearch.name == value.name && vm.permission.user == value.account) {
                            vm.isUnique = false;
                        }
                    });
                } else if (vm.eventFilter) {
                    angular.forEach(vm.eventFilterList, function (value) {
                        if (vm.eventFilter.name == value.name && vm.permission.user == value.account && vm.eventFilter.name != temp_name) {
                            vm.isUnique = false;
                        }
                    });
                }
            } else {
                if (vm.agentJobSearch && vm.agentJobSearch.name) {
                    angular.forEach(vm.agentFilterList, function (value) {
                        if (vm.agentJobSearch.name == value.name && vm.permission.user == value.account) {
                            vm.isUnique = false;
                        }
                    });
                } else if (vm.agentJobExecutionFilter) {
                    angular.forEach(vm.agentFilterList, function (value) {
                        if (vm.agentJobExecutionFilter.name == value.name && vm.permission.user == value.account && vm.agentJobExecutionFilter.name != temp_name1) {
                            vm.isUnique = false;
                        }
                    });
                }
            }
        };

        vm.changeFilter = function (filter) {
            if (vm.resourceFilters.state === 'events') {
                vm.eventSearch = {};
                vm.showSearchEventPanel = false;

                if (filter) {
                    vm.savedEventFilter.selected = filter.id;
                    vm.eventFilters.selectedView = true;
                    UserService.configuration({
                        jobschedulerId: filter.jobschedulerId,
                        id: filter.id
                    }).then(function (conf) {
                        vm.selectedFiltered = JSON.parse(conf.configuration.configurationItem);
                        vm.selectedFiltered.account = filter.account;
                        getEvents();
                    });
                } else {
                    vm.savedEventFilter.selected = filter;
                    vm.eventFilters.selectedView = false;
                    vm.selectedFiltered = filter;
                    getEvents();
                }

                SavedFilter.setEvent(vm.savedEventFilter);
            } else {
                vm.agentJobSearch = {};
                vm.showSearchPanel = false;

                if (filter) {
                    vm.savedAgentFilter.selected = filter.id;
                    vm.agentJobExecutionFilters.selectedView = true;
                    UserService.configuration({
                        jobschedulerId: filter.jobschedulerId,
                        id: filter.id
                    }).then(function (conf) {
                        vm.selectedFilteredAgent = JSON.parse(conf.configuration.configurationItem);
                        vm.selectedFilteredAgent.account = filter.account;
                        getAgentTasks();
                    });
                } else {
                    isCustomizationSelected(false);
                    vm.savedAgentFilter.selected = filter;
                    vm.agentJobExecutionFilters.selectedView = false;
                    vm.selectedFilteredAgent = filter;
                    getAgentTasks();
                }

                SavedFilter.setAgent(vm.savedAgentFilter);
            }
            SavedFilter.save();
        };

        function parseProcessExecuted(regex) {
            var date;
            if (/^\s*(now\s*[-,+])\s*(\d+)\s*$/i.test(regex)) {
                let seconds = parseInt(/^\s*(now\s*[-,+])\s*(\d+)\s*$/i.exec(regex)[2]);
                let sign = /^\s*(now\s*[-,+])\s*(\d+)\s*$/i.exec(regex)[1].substring(3);
                date= sign.trim() + seconds+'s';
            } else if (/^\s*[-,+](\d+)(s|h|d|w|M|y)\s*$/.test(regex)) {
                date = regex;
            } else if (/^\s*(Today)\s*$/i.test(regex)) {
                date = '0d';
            } else if (/^\s*(now)\s*$/i.test(regex)) {
                date = moment.utc(new Date());
            } else if (/^\s*[-,+](\d+)(s|h|d|w|M|y)\s*[-,+](\d+)(s|h|d|w|M|y)\s*$/.test(regex)) {
                date = regex;
            }
            return date;
        }

        vm.searchEvent = function () {
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            if (vm.eventSearch.date == 'process') {
                if (vm.eventSearch.from1) {
                    obj.dateFrom = parseProcessExecuted(vm.eventSearch.from1);
                }
                if (vm.eventSearch.to1) {
                    obj.dateTo = parseProcessExecuted(vm.eventSearch.to1);
                }
            } else if (vm.eventSearch.date == 'date') {
                if (vm.eventSearch.from) {
                    var fromDate = new Date(vm.eventSearch.from);
                    if (vm.eventSearch.fromTime) {
                        if (vm.eventSearch.fromTime === '24:00' || vm.eventSearch.fromTime === '24:00:00') {
                            fromDate.setDate(fromDate.getDate() + 1);
                            fromDate.setHours(0);
                            fromDate.setMinutes(0);
                            fromDate.setSeconds(0);
                        } else {
                            fromDate.setHours(moment(vm.eventSearch.fromTime, 'HH:mm:ss').hours());
                            fromDate.setMinutes(moment(vm.eventSearch.fromTime, 'HH:mm:ss').minutes());
                            fromDate.setSeconds(moment(vm.eventSearch.fromTime, 'HH:mm:ss').seconds());
                        }
                    } else {
                        fromDate.setHours(0);
                        fromDate.setMinutes(0);
                        fromDate.setSeconds(0);
                    }
                    fromDate.setMilliseconds(0);
                    obj.dateFrom = moment.utc(fromDate);
                }
                if (vm.eventSearch.to) {
                    var toDate = new Date(vm.eventSearch.to);
                    if (vm.eventSearch.toTime) {
                        if (vm.eventSearch.toTime === '24:00' || vm.eventSearch.toTime === '24:00:00') {
                            toDate.setDate(toDate.getDate() + 1);
                            toDate.setHours(0);
                            toDate.setMinutes(0);
                            toDate.setSeconds(0);
                        } else {
                            toDate.setHours(moment(vm.eventSearch.toTime, 'HH:mm:ss').hours());
                            toDate.setMinutes(moment(vm.eventSearch.toTime, 'HH:mm:ss').minutes());
                            toDate.setSeconds(moment(vm.eventSearch.toTime, 'HH:mm:ss').seconds());
                        }
                    } else {
                        toDate.setHours(0);
                        toDate.setMinutes(0);
                        toDate.setSeconds(0);
                    }
                    toDate.setMilliseconds(0);
                    obj.dateTo = moment.utc(toDate);
                }
            }
            if (vm.eventSearch.jobs) {
                obj.jobs = [];
                angular.forEach(vm.eventSearch.jobs, function (job) {
                    obj.jobs.push({job: job});
                });
            }
            if (vm.eventSearch.jobChains) {
                obj.orders = [];
                let jobChainsArr = angular.copy(vm.eventSearch.jobChains);
                if(vm.eventSearch.orders) {
                    angular.forEach(vm.eventSearch.orders, function (order) {
                        let index = jobChainsArr.indexOf(order.jobChain);
                        if (index > -1) {
                            jobChainsArr.splice(index, 1);
                        }
                    });
                }
                angular.forEach(jobChainsArr, function (jobChain) {
                    obj.orders.push({jobChain: jobChain});
                });
                if(vm.eventSearch.orders) {
                    obj.orders = obj.orders.concat(vm.eventSearch.orders);
                }
            } else if (vm.eventSearch.orders) {
                obj.orders = vm.eventSearch.orders;
            }
            if (vm.eventSearch.eventIds) {
                vm.eventSearch.eventIds = vm.eventSearch.eventIds.replace(/\s*(,|^|$)\s*/g, "$1");
                obj.eventIds = vm.eventSearch.eventIds.split(',');
            }
            if (vm.eventSearch.eventClasses) {
                vm.eventSearch.eventClasses = vm.eventSearch.eventClasses.replace(/\s*(,|^|$)\s*/g, "$1");
                obj.eventClasses = vm.eventSearch.eventClasses.split(',');
            }
            if (vm.eventSearch.exitCodes || vm.eventSearch.exitCodes == 0) {
                var regExp = new RegExp("[0-9]+", "g");
                var data = vm.eventSearch.exitCodes.match(regExp);
                if (data) {
                    obj.exitCodes = [];
                    for (var i = 0; i < data.length; i++) {
                        obj.exitCodes.push(parseInt(data[i]))
                    }
                }
            }

            EventService.getEvents(obj).then(function (res) {
                vm.customEvents = res.events;
                vm.isLoading = true;
            }, function () {
                vm.isLoading = true;
                vm.customEvents = [];
            });
        };

        vm.showEventPanelFnc = function (value) {
            if (!value) {
                return;
            }
            vm.showEventPanel = value;
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.events = [];
            obj.events.push(value.eventId);
            obj.limit = parseInt(vm.userPreferences.maxAuditLogPerObject);
            AuditLogService.getLogs(obj).then(function (result) {
                if (result && result.auditLog) {
                    vm.auditLogs = result.auditLog;
                }
            });
        };
        vm.hideEventPanel = function () {
            vm.showEventPanel = undefined;
        };
        /** <<<<<<<<<<<<< End Events >>>>>>>>>>>>>>> */


        /** -----------------Begin Locks------------------- */

        vm.treeLock = [];
        vm.my_tree_lock = {};
        vm.expanding_propertyL = {
            field: "name"
        };
        vm.sortByL = function (propertyName) {
            vm.locksFilters.reverse = !vm.locksFilters.reverse;
            vm.locksFilters.filter.sortBy = propertyName;
        };

        /**
         * Function to initialized Lock tree
         */
        function initLockTree() {

            ResourceService.tree({
                jobschedulerId: vm.schedulerIds.selected,
                compact: true,
                types: ['LOCK']
            }).then(function (res) {

                if (_.isEmpty(vm.locksFilters.expand_to)) {
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
                                lock = _.merge(lock, lockData);
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
                                lock = _.merge(lock, lockData);
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
                                lock = _.merge(lock, lockData);
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
            if(vm.userPreferences.expandOption === 'both')
                data.expanded = true;
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


        /** <<<<<<<<<<<<< End Locks >>>>>>>>>>>>>>> */


        /** ---------------------- Begin Process classes ------------------------ */

        vm.treeProcess = [];
        vm.my_tree_process = {};
        vm.expanding_propertyP = {
            field: "name"
        };
        vm.sortByP = function (propertyName) {
            vm.processFilters.reverse = !vm.processFilters.reverse;
            vm.processFilters.filter.sortBy = propertyName;
        };

        /**
         * Function to initialized Process tree
         */
        function initProcessTree() {
            ResourceService.tree({
                jobschedulerId: vm.schedulerIds.selected,
                compact: true,
                types: ['PROCESSCLASS']
            }).then(function (res) {

                if ($rootScope.process_class_expand_to) {
                    vm.treeProcess = angular.copy(res.folders);
                    filteredTreeDataP();
                } else {
                    if (_.isEmpty(vm.processFilters.expand_to)) {
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
            for (let i = 0; i < vm.treeProcess.length; i++) {
                if ($rootScope.process_class_expand_to) {
                    vm.expand_to = angular.copy($rootScope.process_class_expand_to);
                    splitPath = vm.expand_to.path.split('/');
                    $rootScope.process_class_expand_to = '';
                    vm.flag = true;
                }
                if (splitPath.length < 2) {
                    vm.treeProcess[i].selected1 = true;
                }
                vm.treeProcess[i].expanded = true;

                vm.allProcessClasses = [];
                checkExpandP(vm.treeProcess[i]);
            }
        }

        function checkExpandTreeForUpdatesP(data, obj) {
            if (data.selected1) {
                obj.folders.push({folder: data.path, recursive: false});
                vm.folderPathP = data.name || '/';
            }

            data.folders = orderBy(data.folders, 'name');
            angular.forEach(data.folders, function (value) {
                if (value.expanded || value.selected1)
                    checkExpandTreeForUpdatesP(value, obj);
            });
        }

        function insertDataP(node, x) {
            var _temp = angular.copy(node.processClasses);
            node.processClasses = [];
            for (let i = 0; i < x.length; i++) {
                if (node.path == x[i].path.substring(0, x[i].path.lastIndexOf('/')) || (x[i].path.substring(0, x[i].path.lastIndexOf('/') + 1) == node.path)) {
                    x[i].path1 = node.path;
                    if (_temp && _temp.length > 0) {
                        for (var j = 0; j < _temp.length; j++) {
                            if (_temp[j].path == x[i].path) {
                                x[i].show = _temp[j].show;
                                break;
                            }
                        }
                    }
                    node.processClasses.push(x[i]);
                    vm.allProcessClasses.push(x[i]);
                }
            }
            angular.forEach(node.folders, function (value) {
                if (value.expanded || value.selected1)
                    insertDataP(value, x);
            });
        }

        function previousTreeStateP() {

            vm.allProcessClasses = [];
            vm.loading = true;

            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.folders = [];
            for (var i = 0; i < vm.treeProcess.length; i++) {
                if (vm.treeProcess[i].expanded || vm.treeProcess[i].selected1)
                    checkExpandTreeForUpdatesP(vm.treeProcess[i], obj);
            }

            ResourceService.getProcessClassP(obj).then(function (result) {
                ResourceService.getProcessClass(obj).then(function (res) {
                    if (result.processClasses && result.processClasses.length > 0) {
                        var x = [];
                        angular.forEach(result.processClasses, function (jobChain, index) {
                            for (var i = 0; i < res.processClasses.length; i++) {
                                if (result.processClasses[index].path == res.processClasses[i].path) {
                                    result.processClasses[index] = _.merge(result.processClasses[index], res.processClasses[i]);
                                    x.push(result.processClasses[index]);
                                    res.processClasses.splice(i, 1);
                                    break;
                                }

                            }
                        });
                        angular.forEach(vm.treeProcess, function (node) {
                            insertDataP(node, x);
                        })

                    } else {
                        angular.forEach(vm.treeProcess, function (node) {
                            insertDataP(node, res.processClasses);
                        })
                    }

                    vm.loading = false;
                }, function () {
                    angular.forEach(vm.treeProcess, function (node) {
                        insertDataP(node, result.processClasses);
                    });

                    vm.loading = false;
                });

            }, function () {
                ResourceService.getProcessClass(obj).then(function (res) {
                    angular.forEach(vm.treeProcess, function (node) {
                        insertDataP(node, res.processClasses);
                    });

                    vm.loading = false;
                }, function () {

                });
                vm.loading = false;
            });

            /*            angular.forEach(vm.treeProcess, function (value) {
             vm.allProcessClasses = [];
             checkExpandP(value);
             });*/
        }

        function volatileInformationP(obj, expandNode) {
            ResourceService.getProcessClass(obj).then(function (res) {

                if (vm.processClasses.length > 0) {
                    angular.forEach(vm.processClasses, function (processClass) {
                        angular.forEach(res.processClasses, function (processClassData) {
                            if (processClass.path == processClassData.path) {
                                processClassData.maxProcesses = processClass.maxProcesses;
                                processClassData.documentation = processClass.documentation;
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
                                processClassData.documentation = processClass.documentation;
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
                                processClassData.documentation = processClass.documentation;
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
            if(vm.userPreferences.expandOption === 'both')
                data.expanded = true;
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
                if (!data.processClasses) {
                    data.processClasses = [];
                }
                expandFolderDataP(data);

                vm.folderPathP = data.name || '/';
                angular.forEach(data.processClasses, function (value) {
                    value.path1 = data.path;
                    vm.allProcessClasses.push(value);
                });
            }

            if (data.folders && data.folders.length > 0) {
                data.folders = orderBy(data.folders, 'name');
                for (var x = 0; x < data.folders.length; x++) {
                    if (vm.expand_to) {
                        if (vm.flag && data.folders[x].path.substring(1, data.folders[x].path.length) == splitPath[count] && count < splitPath.length) {
                            count = count + 1;
                            splitPath[count] = splitPath[count - 1] + '/' + splitPath[count];

                            data.folders[x].expanded = true;
                            if (vm.expand_to.name == data.folders[x].name) {
                                data.folders[x].selected1 = true;
                                vm.flag = false;
                                count = 1;
                                splitPath = [];

                            }
                        }
                    }
                    checkExpandP(data.folders[x]);
                    if (data.folders[x].expanded || data.folders[x].selected1) {
                        if (data.path == '/') {
                            data.selected1 = false;
                        }
                    }
                }
            }
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

        /** <<<<<<<<<<<<< End Process classes >>>>>>>>>>>>>>> */


        /** --------------------- Begin Schedules ------------------------- */

        vm.treeSchedule = [];
        vm.my_tree_schedule = {};
        vm.expanding_propertyS = {
            field: "name"
        };
        vm.sortByS = function (propertyName) {
            vm.object.schedules = [];
            vm.scheduleFilters.reverse = !vm.scheduleFilters.reverse;
            vm.scheduleFilters.filter.sortBy = propertyName;
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
                    vm.treeSchedule = angular.copy(res.folders);
                    filteredTreeData();
                } else {
                    if (_.isEmpty(vm.scheduleFilters.expand_to)) {
                        vm.treeSchedule = angular.copy(res.folders);
                        filteredTreeData();
                    } else {
                        vm.scheduleFilters.expand_to = vm.recursiveTreeUpdate(angular.copy(res.folders), vm.scheduleFilters.expand_to, 'schedule');
                        vm.treeSchedule = vm.scheduleFilters.expand_to;
                        vm.changeState();
                    }
                }
                vm.scheduleFilters.expand_to = vm.treeSchedule;
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
            angular.forEach(vm.treeSchedule, function (value) {
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
                                    schedule = _.merge(schedule, res.schedules[i]);
                                    data1.push(schedule);
                                    break;
                                }
                            }
                        });

                    } else {
                        data1 = res.schedules;
                    }

                    angular.forEach(vm.treeSchedule, function (value) {
                        insertSchedules(value, data1);
                    });
                    vm.loading = false;
                }, function () {
                    ScheduleService.get(obj).then(function (res) {
                        angular.forEach(vm.treeSchedule, function (value) {
                            insertSchedules(value, res.schedules);
                        });
                        vm.loading = false;
                    })
                });
            }, function (err) {

            });
        };

        function filteredTreeData() {
            angular.forEach(vm.treeSchedule, function (value) {
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
                                schedule = _.merge(schedule, res.schedules[i]);
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

        function expandFolderDataS(data) {
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
                                    schedule = _.merge(schedule, res.schedules[i]);
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
                                    schedule = _.merge(schedule, res.schedules[i]);
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

        vm.treeHandler1S = function (data) {
            if (data.expanded) {
                data.folders = orderBy(data.folders, 'name');
            }
        };

        vm.treeHandlerS = function (data) {
            if(vm.userPreferences.expandOption === 'both')
                data.expanded = true;
            vm.reset();
            navFullTree();
            data.selected1 = true;
            data.folders = orderBy(data.folders, 'name');
            data.schedules = [];
            vm.allSchedules = [];
            expandFolderData(data);
        };

        function navFullTree() {
            angular.forEach(vm.treeSchedule, function (value) {
                value.selected1 = false;
                if (value.expanded) {
                    traverseTree(value);
                }
            });
        }

        vm.expandNodeS = function (data) {
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

        vm.allCheck = {
            checkbox: false
        };

        var watcher1 = $scope.$watchCollection('object.schedules', function (newNames) {
            if (newNames && newNames.length > 0) {
                let _schedules = $filter('filter')(vm.allSchedules, {path:vm.scheduleFilters.searchText});
                vm.allCheck.checkbox = newNames.length === _schedules.slice((vm.userPreferences.entryPerPage * (vm.scheduleFilters.currentPage - 1)), (vm.userPreferences.entryPerPage * vm.scheduleFilters.currentPage)).length;
            } else {
                vm.allCheck.checkbox = false;
            }
        });

        var watcher3 = $scope.$watch('userPreferences.entryPerPage', function (newNames) {
            if (newNames)
                vm.object = {};
        });

        vm.checkAll = function (filteredS) {
            if (vm.allCheck.checkbox && filteredS.length > 0) {
                let _schedule = $filter('orderBy')(filteredS, vm.scheduleFilters.filter.sortBy, vm.scheduleFilters.reverse);
                vm.object.schedules = _schedule.slice((vm.userPreferences.entryPerPage * (vm.scheduleFilters.currentPage - 1)), (vm.userPreferences.entryPerPage * vm.scheduleFilters.currentPage));
            } else {
                vm.object.schedules = [];
            }
        };

        function createSchedule(schedule) {
            let schedules = {};
            schedules.jobschedulerId = $scope.schedulerIds.selected;
            if (vm.substituteObj.folder.lastIndexOf('/') != vm.substituteObj.folder.length - 1) {
                vm.substituteObj.folder = vm.substituteObj.folder + '/';
            }
            schedules.schedule = vm.substituteObj.folder + '' + vm.substituteObj.name;
            let x2js = new X2JS();

            let x = x2js.xml_str2json(schedule.runTime);
            x.schedule._substitute = schedule.path;

            schedules.runTime = x2js.json2xml_str(x).replace(/,/g, ' ');
            schedules.calendars = vm.schedule.calendars;

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


            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/add-substitute-dialog.html',
                controller: 'RuntimeEditorDialogCtrl',
                scope: vm,
                size: 'lg',
                backdrop: 'static',
                windowClass: 'fade-modal'
            });
            modalInstance.result.then(function () {
                createSchedule(schedule);
            }, function (res) {
                if(res === 'ok') {
                    createSchedule(schedule);
                }else {
                    vm.substituteCalendars = [];
                    vm.runTimes = {};
                }
            });

            ScheduleService.getSchedulesP({jobschedulerId: $scope.schedulerIds.selected}).then(function (result) {
                vm._schedules = [];
                angular.forEach(result.schedules, function (value) {
                    if (value && !value.substitute && value.path != schedule.path)
                        vm._schedules.push(value)
                });
            });
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
                    vm.substitute(value);
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
            schedules.runTime = schedule.runTime;
            schedules.calendars = vm.schedule.calendars;
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
                for (var i = 0; i < vm.treeSchedule.length; i++) {
                    checkExpandTreeForUpdates(vm.treeSchedule[i]);
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
                    vm.calendars = res.calendars;
                }
                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/edit-schedule-dialog.html',
                    controller: 'RuntimeEditorDialogCtrl',
                    scope: vm,
                    size: 'lg',
                    backdrop: 'static',
                    windowClass: 'fade-modal'
                });
                modalInstance.result.then(function () {
                    setRunTime(schedule);
                    vm.xml = undefined;
                    vm.calendars = [];
                }, function (res) {
                    if(res === 'ok') {
                        setRunTime(schedule);
                        vm.xml = undefined;
                        vm.calendars = [];
                    }else {
                        vm.object.schedules = [];
                        vm.calendars = [];
                    }
                });
            });
            ScheduleService.getSchedulesP({jobschedulerId: $scope.schedulerIds.selected}).then(function (result) {
                vm._schedules = [];
                angular.forEach(result.schedules, function (value) {
                    if (value && !value.substitute && value.path != schedule.path)
                        vm._schedules.push(value)
                });
            });

        };

        function navFullTreeForUpdateSchedule(path) {
            for (var i = 0; i < vm.treeSchedule.length; i++) {
                if (vm.treeSchedule[i].path != path) {
                    traverseTreeForUpdateSchedule(vm.treeSchedule[i], path);
                } else {
                    if (vm.treeSchedule[i].selected1)
                        expandFolderDataS(vm.treeSchedule[i]);
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
                            expandFolderDataS(data.folders[i]);
                        break;
                    }
                }
        }


        /** <<<<<<<<<<<<< End Schedules >>>>>>>>>>>>>>> */


        /** -------------------- Begin Calendars ------------------------ */

        vm.treeCalendar = [];
        vm.my_tree_calendar = {};
        vm.expanding_propertyC = {
            field: "name"
        };
        vm.sortByC = function (propertyName) {
            vm.calendarFilters.reverse = !vm.calendarFilters.reverse;
            vm.calendarFilters.filter.sortBy = propertyName;
            vm.object = {};
        };
        vm.allCheckCalendar = {
            checkbox: false
        };
        vm.checkAllCalendar = function (filteredC) {
            if (vm.allCheckCalendar.checkbox && filteredC.length > 0) {
                let _calendar = $filter('orderBy')(filteredC, vm.calendarFilters.filter.sortBy, vm.calendarFilters.reverse);
                vm.object.calendars = _calendar.slice((vm.userPreferences.entryPerPage * (vm.calendarFilters.currentPage - 1)), (vm.userPreferences.entryPerPage * vm.calendarFilters.currentPage));
            } else {
                vm.object.calendars = [];
            }
        };

        var watcher4 = $scope.$watchCollection('object.calendars', function (newNames) {
            if (newNames && newNames.length > 0) {
                let _calendar = $filter('filter')(vm.allCalendars, {path:vm.calendarFilters.searchText});
                vm.allCheckCalendar.checkbox = newNames.length == _calendar.slice((vm.userPreferences.entryPerPage * (vm.calendarFilters.currentPage - 1)), (vm.userPreferences.entryPerPage * vm.calendarFilters.currentPage)).length;
            } else {
                vm.allCheckCalendar.checkbox = false;
            }
        });

        vm.getCategories = function () {
            CalendarService.getCalendarCategories({jobschedulerId: vm.schedulerIds.selected}).then(function (res) {
                vm.categories = res.categories;
            });
        };


        /**
         * Function to initialized Calendar tree
         */
        function initCalendarTree(allDelete) {
            vm.getCategories();
            ResourceService.tree({
                jobschedulerId: vm.schedulerIds.selected,
                compact: true,
                types: ["WORKINGDAYSCALENDAR", "NONWORKINGDAYSCALENDAR"]
            }).then(function (res) {
                if ($rootScope.calendar_expand_to) {
                    vm.treeCalendar = angular.copy(res.folders);
                    filteredTreeDataC();
                } else {
                    if (_.isEmpty(vm.calendarFilters.expand_to)) {
                        vm.treeCalendar = angular.copy(res.folders);
                        filteredTreeDataC();
                    } else {
                        vm.calendarFilters.expand_to = vm.recursiveTreeUpdate(angular.copy(res.folders), vm.calendarFilters.expand_to, 'calendar');
                        vm.treeCalendar = vm.calendarFilters.expand_to;
                        if(allDelete && vm.treeCalendar.length > 0) {
                            vm.treeCalendar[0].selected1 = true;
                        }
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
                if ($rootScope.calendar_expand_to) {
                    if ((value.path == $rootScope.calendar_expand_to.path))
                        value.selected1 = true;
                } else {
                    value.selected1 = true;
                }
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
            vm.object.calendars = [];
            vm.loading = true;
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.folders = [{folder: data.path, recursive: false}];
            if (vm.calendarFilters.filter.type != 'ALL') {
                obj.type = vm.calendarFilters.filter.type;
            }
            if (vm.calendarFilters.filter.category) {
                obj.categories = [];
                obj.categories.push(vm.calendarFilters.filter.category);
            }
            obj.compact = true;
            CalendarService.getListOfCalendars(obj).then(function (result) {
                data.calendars = result.calendars;
                vm.folderPathC = data.name || '/';
                vm.folderFullPathC = data.path || '/';
                vm.loading = false;
                var flag = false;
                if (data.calendars.length > 0) {
                    angular.forEach(data.calendars, function (value) {
                        value.path1 = data.path;
                        if (vm.showPanel && vm.showPanel.path == data.path) {
                            flag = true;
                        }
                    });
                }
                vm.allCalendars = data.calendars;
                if (!flag) {
                    vm.showPanel = undefined;
                }
                setTimeout(function () {
                    updatePanelHeight();
                },0);
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
            if(vm.userPreferences.expandOption === 'both')
                data.expanded = true;
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
            if (vm.calendarFilters.filter.category) {
                obj.categories = [];
                obj.categories.push(vm.calendarFilters.filter.category);
            }
            obj.compact = true;
            CalendarService.getListOfCalendars(obj).then(function (result) {
                vm.allCalendars = result.calendars;
                startTraverseNode1(data);
                vm.loading = false;
                updatePanelHeight()
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

        function getExpandTreeForUpdates1(data, obj1) {
            if (data.selected1) {
                obj1.folders.push({folder: data.path, recursive: false});
            }
            data.folders = orderBy(data.folders, 'name');
            angular.forEach(data.folders, function (value) {
                if (value.expanded || value.selected1)
                    getExpandTreeForUpdates1(value, obj1);
            });
        }

        vm.loadCalendar = function (flag) {
            vm.object.calendars = [];
            if (flag == 'remove') {
                vm.calendarFilters.filter.category = undefined;
            }
            let obj1 = {folders: []};
            if (vm.calendarFilters.filter.type != 'ALL') {
                obj1.type = vm.calendarFilters.filter.type;
            }
            if (vm.calendarFilters.filter.category) {
                obj1.categories = [];
                obj1.categories.push(vm.calendarFilters.filter.category);
            }
            vm.allCalendars = [];
            vm.loading = true;
            angular.forEach(vm.treeCalendar, function (value) {
                if (value.expanded || value.selected1)
                    getExpandTreeForUpdates1(value, obj1);
            });
            obj1.compact = true;
            obj1.jobschedulerId = vm.schedulerIds.selected;
            CalendarService.getListOfCalendars(obj1).then(function (res) {
                var data = res.calendars;
                angular.forEach(vm.treeCalendar, function (value) {
                    insertCalendar(value, data);
                });
                vm.loading = false;
                setTimeout(function () {
                    updatePanelHeight();
                }, 0);

            }, function () {
                vm.loading = false;
            });
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
                obj.calendar.path = vm.calendar.newPath;
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
                $rootScope.$broadcast('calendar-close');
                vm.getCategories();
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
            t1 = $timeout(function () {
                vm.template = 'page1';
            }, 400);
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

                $uibModal.open({
                    templateUrl: 'modules/core/template/set-calendar-dialog.html',
                    controller: 'CalendarEditorDialogCtrl',
                    scope: vm,
                    size: 'lg',
                    backdrop: 'static',
                    windowClass: 'fade-modal'
                });
                t1 = $timeout(function () {
                    vm.template = 'page1';
                }, 400);
            });
            vm.object.calendars = [];
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

            CalendarService.saveAs(obj);
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
        var uploader = $scope.uploader = new FileUploader({
             url: './api/documentations/import',
            alias: 'file'
        });

        uploader.onBeforeUploadItem = function (item) {
            if(vm.resourceFilters.state !== 'calendars') {
                let obj ={
                    folder: vm.document.path === '/' ? '' : vm.document.path,
                    jobschedulerId: vm.schedulerIds.selected,
                    accessToken : SOSAuth.accessTokenId
                };
                if (vm.comments.comment) {
                    obj.comment = vm.comments.comment;
                }
                if (vm.comments.timeSpent)
                    obj.timeSpent = vm.comments.timeSpent;
                if (vm.comments.ticketLink)
                    obj.ticketLink = vm.comments.ticketLink;
                item.file.name = encodeURIComponent(item.file.name);
                item.formData = [obj];
            }
        };

        uploader.onErrorItem = function (fileItem, response, status, headers) {
            if (response.error) {
                toasty.error({
                    title: response.error.code,
                    msg: response.error.message,
                    timeout: 10000
                });
            }
        };


        vm.fileLoading = false;
        // CALLBACKS
        uploader.onAfterAddingFile = function (item) {
            if(vm.resourceFilters.state === 'calendars') {
                let fileExt = item.file.name.slice(item.file.name.lastIndexOf('.') + 1).toUpperCase();
                if (fileExt != 'JSON') {
                    toasty.error({
                        title: gettextCatalog.getString("message.invalidFileExtension"),
                        timeout: 10000
                    });
                    item.remove();
                } else {
                    vm.fileLoading = true;
                    var reader = new FileReader();
                    reader.readAsText(item._file, "UTF-8");
                    reader.onload = onLoadFile;
                }
            }
        };

        uploader.onCompleteItem = function (fileItem, response, status, headers) {
            if (status == '200') {
                if(uploader.queue && uploader.queue.length>0) {
                    uploader.queue[0].remove();
                }
                $rootScope.$broadcast('closeModal');
                initDocumentTree();
            }
        };

        vm.basedOnCalendars = [];
        vm.fileContentCalendars = [];

        function onLoadFile(event) {
            var data = JSON.parse(event.target.result);
            var paths = [];
            if (data && data.calendars) {
                for (let i = 0; i < data.calendars.length; i++) {
                    if (!data.calendars[i].basedOn) {
                        vm.fileContentCalendars.push(data.calendars[i]);
                    } else {
                        vm.basedOnCalendars.push(data.calendars[i]);
                    }
                }

            }
            if (vm.fileContentCalendars && angular.isArray(vm.fileContentCalendars)) {
                for (let i = 0; i < vm.fileContentCalendars.length; i++) {
                    if (vm.fileContentCalendars[i].path)
                        paths.push(vm.fileContentCalendars[i].path);
                }
            }
            if (paths.length == 0) {
                vm.fileLoading = false;
                vm.fileContentCalendars = undefined;
                toasty.error({
                    title: gettextCatalog.getString("message.notValidCalendarFile"),
                    timeout: 10000
                });
                uploader.queue[0].remove();
                return;
            }
            var obj = {};
            obj.calendars = paths;
            obj.compact = true;
            obj.jobschedulerId = vm.schedulerIds.selected;
            CalendarService.calendarsUsed(obj).then(function (res) {
                vm.calendrs = res.calendars;
                angular.forEach(res.calendars, function (value) {
                    for (let i = 0; i < vm.fileContentCalendars.length; i++) {
                        if (value.path == vm.fileContentCalendars[i].path) {
                            vm.fileContentCalendars[i].isExit = true;
                            break;
                        }
                    }
                });
                vm.fileLoading = false;
            }, function () {
                vm.fileLoading = false;
            });

        }

        vm.importCalendarObj = {};
        vm.importCalendarObj.jobschedulerId = vm.schedulerIds.selected;
        vm.importCalendarObj.calendars = [];
        vm.checkImportCalendar = {
            checkbox: false
        };
        vm.checkImportCalendarFn = function () {
            if (vm.checkImportCalendar.checkbox && vm.fileContentCalendars.length > 0) {
                let _calendars = $filter('orderBy')(vm.fileContentCalendars, 'name');
                vm.importCalendarObj.calendars = _calendars;
            } else {
                vm.importCalendarObj.calendars = [];
            }
        };

        var watcher5 = $scope.$watchCollection('importCalendarObj.calendars', function (newNames) {
            vm.importCalendars = [];
            if (newNames && newNames.length > 0 && vm.fileContentCalendars) {
                vm.checkImportCalendar.checkbox = newNames.length == vm.fileContentCalendars.length;
            } else {
                vm.checkImportCalendar.checkbox = false;
            }

            if (newNames) {
                angular.forEach(vm.calendrs, function (value) {
                    for (var i = 0; i < newNames.length; i++) {
                        if (value.usedBy && newNames[i].path == value.path) {
                            vm.importCalendars.push(value);
                            break;
                        }
                    }
                });
            }
        });

        vm.importCalendar = function () {
            vm.comments = {};
            vm.comments.radio = 'predefined';
            var modalInstance1 = $uibModal.open({
                templateUrl: 'modules/core/template/import-calendar-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                size: 'lg',
                backdrop: 'static'
            });
            modalInstance1.result.then(function () {
                importCalendarCall();
            }, function () {
                vm.importCalendars = [];
                vm.fileContentCalendars = [];
                vm.basedOnCalendars = [];
                vm.importCalendarObj ={};
                vm.importCalendarObj.jobschedulerId = vm.schedulerIds.selected;
            });
        };


        function importCalendarCall() {
            vm.importAllCalendar = [];
            vm.fileContentCalendars = [];
            for (var i = 0; i < vm.importCalendarObj.calendars.length; i++) {
                if (vm.importCalendarObj.calendars[i].isExit) {
                    delete vm.importCalendarObj.calendars[i]['isExit'];
                }
            }
            if (vm.basedOnCalendars && vm.basedOnCalendars.length > 0) {
                vm.importCalendarObj.calendars = vm.importCalendarObj.calendars.concat(vm.basedOnCalendars)
            }
            vm.importCalendarObj.auditLog = {};
            if (vm.comments.comment) {
                vm.importCalendarObj.auditLog.comment = vm.comments.comment;
            }

            if (vm.comments.timeSpent) {
                vm.importCalendarObj.auditLog.timeSpent = vm.comments.timeSpent;
            }

            if (vm.comments.ticketLink) {
                vm.importCalendarObj.auditLog.ticketLink = vm.comments.ticketLink;
            }
            CalendarService.import(vm.importCalendarObj).then(function (res) {
                uploader.queue[0].remove();
                vm.importCalendarObj.calendars = [];
                vm.basedOnCalendars = [];
                vm.importCalendarObj.auditLog = {};
                initCalendarTree();
            }, function () {
                vm.importCalendarObj.calendars = [];
                vm.basedOnCalendars = [];
                vm.importCalendarObj.auditLog = {};
            });
        }

        vm.exportCalendar = function (calendar) {
            var calendars = [];
            if (calendar) {
                calendars.push(calendar.path);
            } else {
                angular.forEach(vm.object.calendars, function (value) {
                    calendars.push(value.path)
                });
            }
            CalendarService.export({
                calendars: calendars,
                jobschedulerId: vm.schedulerIds.selected
            }).then(function (res) {

                vm.loading = false;
                var name = 'calendars' + '.json';
                var fileType = 'application/octet-stream';

                if (res.headers('Content-Disposition') && /filename=(.+)/.test(res.headers('Content-Disposition'))) {
                    name = /filename=(.+)/.exec(res.headers('Content-Disposition'))[1];
                }
                if (res.headers('Content-Type')) {
                    fileType = res.headers('Content-Type');
                }
                var data = res.data;
                if (typeof data === 'object') {
                    data = JSON.stringify(data, undefined, 2);
                }
                var blob = new Blob([data], {type: fileType});
                FileSaver.saveAs(blob, name);
            });
        };

        function deleteCalendar(obj) {
            CalendarService.delete(obj).then(function () {

                vm.getCategories();
                for (let i = 0; i < vm.object.calendars.length; i++) {
                    if (vm.showPanel && vm.object.calendars[i].path == vm.showPanel.path) {
                        vm.showPanel = undefined;
                        break;
                    }
                }
                vm.object.calendars = [];
            });
            vm.calendarArr = undefined;
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
                    vm.calendarArr = undefined;
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
                    vm.calendarArr = undefined;
                });
            }
        }

        vm.deleteCalendar = function (calendar) {
            let obj = {};
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
                CalendarService.calendarUsed({
                    id: vm.calendar.id,
                    jobschedulerId: vm.schedulerIds.selected
                }).then(function (res) {
                    vm.calendar.usedIn = res;

                });
            } else {
                vm.calendarArr = angular.copy(vm.object.calendars);
                angular.forEach(vm.calendarArr, function (value) {
                    CalendarService.calendarUsed({
                        id: value.id,
                        jobschedulerId: vm.schedulerIds.selected
                    }).then(function (res) {
                        value.usedIn = res;
                    });
                });

            }
            deleteCalendarFn(obj, calendar);

        };

        vm.getTreeStructure = function () {
            ResourceService.tree({
                jobschedulerId: vm.schedulerIds.selected,
                compact: true,
                types: vm.resourceFilters.state === 'calendars' ? ["WORKINGDAYSCALENDAR", "NONWORKINGDAYSCALENDAR"] : ['DOCUMENTATION']
            }).then(function (res) {
                vm.filterTree1 = res.folders;
                angular.forEach(vm.filterTree1, function (value) {
                    value.expanded = true;
                    if (value.folders) {
                        value.folders = orderBy(value.folders, 'name');
                    }
                });
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
        vm.loadAuditLogs = function (value) {
            vm.showPanel = value;
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.calendars = [];
            obj.calendars.push(value.path);
            obj.limit = parseInt(vm.userPreferences.maxAuditLogPerObject);
            AuditLogService.getLogs(obj).then(function (result) {
                if (result && result.auditLog) {
                    vm.auditLogs = result.auditLog;
                }
            });
        };
        vm.hideAuditPanel = function () {
            vm.showPanel = undefined;
        };
        vm.resetPanel = function () {
            let rsHt = JSON.parse(SavedFilter.resizerHeight) || {};
            if (rsHt.calendar && typeof rsHt.calendar === 'object') {
                if (rsHt.calendar[vm.folderPathC]) {
                    delete rsHt.calendar[vm.folderPathC];
                    SavedFilter.setResizerHeight(rsHt);
                    SavedFilter.save();
                    _updatePanelHeight();
                }
            }
        };
        vm.resizerHeight;

        function updatePanelHeight() {
            let rsHt = JSON.parse(SavedFilter.resizerHeight) || {};
            if (rsHt.calendar && !_.isEmpty(rsHt.calendar)) {
                if (rsHt.calendar[vm.folderPathC]) {
                    vm.resizerHeight = rsHt.calendar[vm.folderPathC];
                    $('#calendarDivId').css('height', vm.resizerHeight);
                } else {
                    _updatePanelHeight();
                }
            } else {
                _updatePanelHeight();
            }
        }

        function _updatePanelHeight() {
            setTimeout(function () {
                let ht = (parseInt($('#calendarTableId').height()) + 50);
                let el = document.getElementById('calendarDivId');
                if (el && el.scrollWidth > el.clientWidth) {
                    ht = ht + 11;
                }
                if (ht > 450) {
                    ht = 450;
                }
                vm.resizerHeight = ht + 'px';
                $('#calendarDivId').css('height', vm.resizerHeight);
            }, 10);
        }

        $scope.$on('angular-resizable.resizeEnd', function (event, args) {
            if(args.id === 'calendarDivId') {
                let rsHt = JSON.parse(SavedFilter.resizerHeight) || {};
                if (rsHt.calendar && typeof rsHt.calendar === 'object') {
                    rsHt.calendar[vm.folderPathC] = args.height;
                } else {
                    rsHt.calendar = {};
                }
                rsHt.calendar[vm.folderPathC] = args.height;
                SavedFilter.setResizerHeight(rsHt);
                SavedFilter.save();
                vm.resizerHeight = args.height;
            }
        });

        /** <<<<<<<<<<<<< End Calendars >>>>>>>>>>>>>>> */


        /** ---------------------- Begin Documentations ------------------------ */

        vm.treeDocument = [];
        vm.my_tree_document = {};
        vm.expanding_propertyD = {
            field: "name"
        };
        vm.sortByD = function (propertyName) {
            vm.documentFilters.reverse = !vm.documentFilters.reverse;
            vm.documentFilters.filter.sortBy = propertyName;
            vm.object = {};
        };

        vm.allCheckDocument = {
            checkbox: false
        };

        vm.checkAllDocument = function (filteredD) {
            if (vm.allCheckDocument.checkbox && filteredD.length > 0) {
                let _document = $filter('orderBy')(filteredD, vm.documentFilters.filter.sortBy, vm.documentFilters.reverse);
                vm.object.documents = _document.slice((vm.userPreferences.entryPerPage * (vm.documentFilters.currentPage - 1)), (vm.userPreferences.entryPerPage * vm.documentFilters.currentPage));
            } else {
                vm.object.documents = [];
            }
        };

        var watcher10 = $scope.$watchCollection('object.documents', function (newNames) {
            if (newNames && newNames.length > 0) {
                let _document = $filter('filter')(vm.allDocumentations, {path: vm.documentFilters.searchText});
                vm.allCheckDocument.checkbox = newNames.length === _document.slice((vm.userPreferences.entryPerPage * (vm.documentFilters.currentPage - 1)), (vm.userPreferences.entryPerPage * vm.documentFilters.currentPage)).length;
            } else {
                vm.allCheckDocument.checkbox = false;
            }
        });

        /**
         * Function to initialized Document tree
         */
        function initDocumentTree() {
            ResourceService.tree({
                jobschedulerId: vm.schedulerIds.selected,
                compact: true,
                types: ["DOCUMENTATION"]
            }).then(function (res) {
                if ($rootScope.document_expand_to) {
                    vm.treeDocument = res.folders;
                    filteredTreeDataD();
                } else {
                    if (_.isEmpty(vm.documentFilters.expand_to)) {
                        vm.treeDocument = res.folders;
                        filteredTreeDataD();
                    } else {
                        vm.documentFilters.expand_to = vm.recursiveTreeUpdate(angular.copy(res.folders), vm.documentFilters.expand_to, 'document');
                        vm.treeDocument = vm.documentFilters.expand_to;
                        vm.loadDocument();
                    }
                }
                vm.documentFilters.expand_to = vm.treeDocument;
                vm.isLoading = true;
            }, function () {
                vm.isLoading = true;
            });
        }


        function filteredTreeDataD() {
            angular.forEach(vm.treeDocument, function (value) {
                value.expanded = true;
                if ($rootScope.document_expand_to) {
                    if ((value.path == $rootScope.document_expand_to.path))
                        value.selected1 = true;
                } else {
                    value.selected1 = true;
                }
                vm.allDocumentations = [];
                checkExpandD(value);
            });
        }

        function checkExpandD(data) {
            if (data.selected1) {
                data.documents = [];
                expandFolderDataD(data);

                vm.folderPathD = data.name || '/';
                vm.folderFullPathD = data.path || '/';
                angular.forEach(data.documents, function (value) {
                    value.path1 = data.path;
                    vm.allDocumentations.push(value);
                });

            }
            data.folders = orderBy(data.folders, 'name');
            angular.forEach(data.folders, function (value) {
                if ($rootScope.document_expand_to && $rootScope.document_expand_to.path.indexOf(value.path) != -1) {
                    value.expanded = true;
                }
                if ($rootScope.document_expand_to && $rootScope.document_expand_to.path == value.path) {
                    value.selected1 = true;
                    $rootScope.document_expand_to = undefined;
                }
                checkExpandD(value);
            });

        }

        function expandFolderDataD(data) {
            vm.object.documents = [];
            vm.loading = true;
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.folders = [{folder: data.path, recursive: false}];

            obj.compact = true;
            vm.folderPathD = data.name || '/';
            if (vm.documentFilters.filter.type != 'ALL') {
                obj.types = [];
                obj.types.push(vm.documentFilters.filter.type);
            }
            ResourceService.getDocumentations(obj).then(function (result) {
                data.documents = result.documentations;

                vm.folderFullPathD = data.path || '/';
                vm.loading = false;
                var flag = false;
                if (data.documents.length > 0) {
                    angular.forEach(data.documents, function (value) {
                        value.path1 = data.path;
                        if (vm.showPanel && vm.showPanel.path == data.path) {
                            flag = true;
                        }
                    });
                }
                vm.allDocumentations = data.documents;
            }, function () {

                vm.loading = false;
            });
        }

        vm.treeHandler1D = function (data) {
            if (data.expanded) {
                data.folders = orderBy(data.folders, 'name');
            }
        };

        vm.treeHandlerD = function (data) {
            if (vm.userPreferences.expandOption === 'both')
                data.expanded = true;
            navFullTreeD();
            data.selected1 = true;
            data.documents = [];
            vm.allDocumentations = [];
            vm.loading = true;
            expandFolderDataD(data);
        };

        function navFullTreeD() {
            angular.forEach(vm.treeDocument, function (value) {
                value.selected1 = false;
                if (value.expanded) {
                    traverseTree(value);
                }
            });
        }

        vm.expandNodeD = function (data) {
            navFullTreeD();
            vm.allDocumentations = [];
            vm.loading = true;
            vm.folderPathD = data.name || '/';
            vm.folderFullPathD = data.path || '/';
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.folders = [];
            obj.folders.push({folder: data.path, recursive: true});
            if (vm.documentFilters.filter.type != 'ALL') {
                obj.types = [];
                obj.types.push(vm.documentFilters.filter.type);
            }

            ResourceService.getDocumentations(obj).then(function (result) {
                vm.allDocumentations = result.documentations;
                startTraverseNodeD(data);
                vm.loading = false;
            }, function () {
                vm.loading = false;
            });
        };

        function startTraverseNodeD(data) {
            function recursive(data) {
                data.expanded = true;
                data.folders = orderBy(data.folders, 'name');
                data.documents = [];
                angular.forEach(vm.allDocumentations, function (value) {
                    if (data.path == value.path.substring(0, value.path.lastIndexOf('/')) || data.path == value.path.substring(0, value.path.lastIndexOf('/') + 1)) {
                        data.documents.push(value);
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

        vm.loadDocument = function () {
            vm.object.documents = [];
            let objDoc = {folders: []};
            vm.allDocumentations = [];
            vm.loading = true;
            angular.forEach(vm.treeDocument, function (value) {
                if (value.expanded || value.selected1)
                    getExpandTreeForUpdates1(value, objDoc);
            });
            objDoc.jobschedulerId = vm.schedulerIds.selected;
            if (vm.documentFilters.filter.type != 'ALL') {
                objDoc.types = [];
                objDoc.types.push(vm.documentFilters.filter.type);
            }
            ResourceService.getDocumentations(objDoc).then(function (res) {
                var data = res.documentations;
                angular.forEach(vm.treeDocument, function (value) {
                    insertDocument(value, data);
                });
                vm.loading = false;
            }, function () {
                vm.loading = false;
            });
        };

        function insertDocument(node, x) {
            node.documents = [];
            for (var i = 0; i < x.length; i++) {
                if (node.path == x[i].path.substring(0, x[i].path.lastIndexOf('/')) || node.path == x[i].path.substring(0, x[i].path.lastIndexOf('/') + 1)) {
                    x[i].path1 = node.path;
                    node.documents.push(x[i]);
                    vm.allDocumentations.push(x[i]);
                }
            }
            vm.folderPathD = node.name || '/';
            vm.folderFullPathD = node.path || '/';
            angular.forEach(node.folders, function (value) {
                if (value.expanded || value.selected1)
                    insertDocument(value, x);
            });
        }

        vm.showDocumentUsage = function(document) {
  
            vm.document = angular.copy(document);
            ResourceService.documentationUsed({
                documentation: vm.document.path,
                jobschedulerId: vm.schedulerIds.selected
            }).then(function (res) {
                vm.document.usedIn = res.objects;
                
            });
            var modalInstance1 = $uibModal.open({
                templateUrl: 'modules/core/template/show-usage-document-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                backdrop: 'static'
            });
            modalInstance1.result.then(function () {

            }, function () {

            });
        };

        vm.exportDocument = function (document) {
            let obj = {jobschedulerId: vm.schedulerIds.selected,documentations: []};
            if(document){
                obj.documentations.push(document.path);
            } else {
                angular.forEach(vm.object.documents, function (value) {
                    obj.documentations.push(value.path);
                });
            }
            ResourceService.exportDocumentations(obj).then(function (res) {
               $("#tmpFrame").attr('src', './api/documentations/export?jobschedulerId='+vm.schedulerIds.selected+'&filename='+res.filename+'&accessToken='+ SOSAuth.accessTokenId);
            });
        };

        vm.importDocument = function () {
            vm.document ={path : vm.folderFullPathD};
            vm.comments = {};
            vm.comments.radio = 'predefined';
            var modalInstance1 = $uibModal.open({
                templateUrl: 'modules/core/template/import-document-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                size: 'lg',
                backdrop: 'static'
            });
            modalInstance1.result.then(function () {

            }, function () {

            });
        };

        vm.treeExpandD = function (data) {
            vm.document.path = data.path;
            $('#treeModal').modal('hide');
            $('.fade-modal').css('opacity', '1');
        };

        vm.deleteDocumentations = function (document) {
            let obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.documentations = [];
            if (document) {
                obj.documentations.push(document.path)
            } else {
                angular.forEach(vm.object.documents, function (value) {
                    obj.documentations.push(value.path)
                });
            }
            vm.document = angular.copy(document);
            if (document) {
                vm.documentArr = undefined;
                vm.document.delete = true;
                ResourceService.documentationUsed({
                    documentation: vm.document.path,
                    jobschedulerId: vm.schedulerIds.selected
                }).then(function (res) {
                    vm.document.usedIn = res.objects;

                });
            } else {
                vm.documentArr = angular.copy(vm.object.documents);
                angular.forEach(vm.documentArr, function (value) {
                    ResourceService.documentationUsed({
                        documentation: value.path,
                        jobschedulerId: vm.schedulerIds.selected
                    }).then(function (res) {
                        value.usedIn = res.objects;
                    });
                });

            }
            deleteDocumentFn(obj, document);
        };

        function deleteDocument(obj, document) {
            ResourceService.deleteDocumentations(obj).then(function () {
                if (document) {
                    for (let i = 0; i < vm.allDocumentations.length; i++) {
                        if (vm.allDocumentations[i].path === document.path) {
                            vm.allDocumentations.splice(i, 1);
                            break;
                        }
                    }
                } else {
                    for (let i = 0; i < vm.object.documents.length; i++) {
                        for (let j = 0; j < vm.allDocumentations.length; j++) {
                            if (vm.allDocumentations[j].path === vm.object.documents[i].path) {
                                vm.allDocumentations.splice(j, 1);
                                break;
                            }
                        }
                    }
                }
            });
        }

        function deleteDocumentFn(obj, document) {

            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.type = 'Documentation';
                vm.comments.operation = 'Delete';
                if (document) {
                    vm.comments.name = document.path;
                } else {
                    vm.comments.name = '';
                    angular.forEach(vm.object.documents, function (value, index) {
                        if (index == vm.object.documents.length - 1) {
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
                    deleteDocument(obj, document);
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
                    deleteDocument(obj, document);
                }, function () {

                });
            }
        }

        /** <<<<<<<<<<<<< End Documentations >>>>>>>>>>>>>>> */

        vm.assignedDocument = function(data) {
            vm.assignObj = {
                type: vm.resourceFilters.state === 'schedules' ? 'Schedule' : vm.resourceFilters.state === 'calendars' ? 'Calendar' : vm.resourceFilters.state === 'processClass' ? 'Process Class' : 'Lock',
                path: data.path,
            };
            let type = vm.resourceFilters.state === 'schedules' ? 'schedule' : vm.resourceFilters.state === 'calendars' ? 'calendar' : vm.resourceFilters.state === 'processClass' ? 'processClass' : 'lock';
            let obj = {jobschedulerId: vm.schedulerIds.selected};
            obj[type] = data.path;
            vm.comments = {};
            vm.comments.radio = 'predefined';
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/assign-document-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                size: 'lg',
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
                obj.documentation = vm.assignObj.documentation;

                ResourceService.assign(type, obj).then(function (res) {
                    data.documentation = vm.assignObj.documentation;
                });
            }, function () {

            });
        };

        vm.getDocumentTreeStructure = function () {
            $rootScope.$broadcast('initTree');
        };

        vm.$on('closeDocumentTree', function (evn, path) {
            vm.assignObj.documentation = path;
        });

        vm.unassignedDocument = function (data) {
            let type = vm.resourceFilters.state === 'schedules' ? 'schedule' : vm.resourceFilters.state === 'calendars' ? 'calendar' : vm.resourceFilters.state === 'processClass' ? 'processClass' : 'lock';
            let obj = {jobschedulerId: vm.schedulerIds.selected};
            obj[type] = data.path;
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = data.path;
                vm.comments.operation = 'Unassign Documentation';
                vm.comments.type = vm.resourceFilters.state === 'schedules' ? 'Schedule' : vm.resourceFilters.state === 'calendars' ? 'Calendar' : vm.resourceFilters.state === 'processClass' ? 'Process Class' : 'Lock';

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
                    ResourceService.unassign(type, obj).then(function () {
                        data.documentation = undefined;
                    });
                }, function () {

                });
            } else {
                ResourceService.unassign(type, obj).then(function () {
                    data.documentation = undefined;
                });
            }
        };

        function initialObj() {
            vm.object = {};
            vm.object.events = [];
            vm.object.calendars = [];
            vm.object.orders = [];
            vm.object.jobChains = [];
            vm.object.jobs = [];
            vm.allCheck.checkbox = false;
            vm.checkAllEvent.checkbox = false;
            vm.allCheckCalendar.checkbox = false;
        }

        $scope.$on('$stateChangeSuccess', function (event, toState, toParams) {
            var views = {};
            initialObj();
            vm.document = undefined;
            vm.documentArr = undefined;
            vm.calendar = undefined;
            vm.calendarArr = undefined;
            resizeSidePanel();
            if ($window.localStorage.views)
                views = JSON.parse($window.localStorage.views);
            if (toState.name == 'app.resources.agentClusters') {
                vm.resourceFilters.state = 'agent';
                vm.pageView = views.agent;
                if (toParams.type && toParams.type != 'all') {
                    vm.agentsFilters.filter.state = toParams.type == 'healthy' ? '0' : toParams.type == 'unhealthy' ? '1' : '2';
                }else{
                    vm.agentsFilters.filter.state = 'all';
                }
                vm.treeAgent = [];
                initAgentTree(toParams.type);
            } else if (toState.name == 'app.resources.locks') {

                vm.pageView = views.lock;
                vm.resourceFilters.state = 'locks';
                vm.treeLock = [];
                initLockTree();
            } else if (toState.name == 'app.resources.processClasses') {

                vm.pageView = views.processClass;
                vm.resourceFilters.state = 'processClass';
                vm.treeProcess = [];
                initProcessTree();
            } else if (toState.name == 'app.resources.schedules') {
                vm.pageView = views.schedule;
                vm.resourceFilters.state = 'schedules';
                vm.treeSchedule = [];
                initTree();
            } else if (toState.name == 'app.resources.calendars') {
                vm.pageView = views.calendar || vm.userPreferences.pageView;
                vm.resourceFilters.state = 'calendars';
                vm.treeCalendar = [];
                initCalendarTree();
            } else if (toState.name == 'app.resources.agentJobExecutions') {
                vm.resourceFilters.state = 'agentJobExecutions';
                checkSharedFiltersAgent();
            } else if (toState.name == 'app.resources.events') {
                vm.resourceFilters.state = 'events';
                checkSharedFilters();
            } else if (toState.name == 'app.resources.documentations') {
                vm.pageView = views.document || vm.userPreferences.pageView;
                vm.resourceFilters.state = 'documentations';
                vm.treeDocument = [];
                initDocumentTree();
            }
            startPolling();
        });

        $scope.$on('event-started', function () {
            if (vm.events && vm.events[0] && vm.events[0].eventSnapshots && vm.events[0].eventSnapshots.length > 0)
                for(let x= 0; x < vm.events[0].eventSnapshots.length; x++) {
                    let event = vm.events[0].eventSnapshots[x];
                    if (event.eventType == "FileBasedActivated" || event.eventType == "FileBasedRemoved") {
                        var path = '';
                        if (vm.resourceFilters.state == 'locks' && event.objectType == 'LOCK') {
                            ResourceService.tree({
                                jobschedulerId: vm.schedulerIds.selected,
                                compact: true,
                                types: ['LOCK']
                            }).then(function (res) {
                                vm.locksFilters.expand_to = vm.recursiveTreeUpdate(angular.copy(res.folders), vm.locksFilters.expand_to, 'lock');
                                vm.treeLock = vm.locksFilters.expand_to;
                                recursiveSort(vm.treeLock);
                            });

                            path = event.path;

                            if (vm.allLocks && vm.allLocks.length > 0) {
                                for (let j = 0; j < vm.allLocks.length; j++) {
                                    if (path.substring(0, path.lastIndexOf('/')) == vm.allLocks[j].path.substring(0, vm.allLocks[j].path.lastIndexOf('/'))) {
                                        navFullTreeForUpdateLock(path.substring(0, path.lastIndexOf('/')));
                                        break;
                                    }
                                }
                            } else {
                                vm.allLocks = [];
                                navFullTreeForUpdateLock(path.substring(0, path.lastIndexOf('/')));
                            }
                        } else if (vm.resourceFilters.state == 'processClass' && event.objectType == 'PROCESSCLASS') {
                            ResourceService.tree({
                                jobschedulerId: vm.schedulerIds.selected,
                                compact: true,
                                types: ['PROCESSCLASS']
                            }).then(function (res) {
                                vm.processFilters.expand_to = vm.recursiveTreeUpdate(angular.copy(res.folders), vm.processFilters.expand_to, 'processClass');
                                vm.treeProcess = vm.processFilters.expand_to;
                                recursiveSort(vm.treeProcess);
                            });

                            path = event.path;

                            if (vm.allProcessClasses.length > 0) {
                                for (let j = 0; j < vm.allProcessClasses.length; j++) {
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
                                vm.treeSchedule = vm.scheduleFilters.expand_to;
                                recursiveSort(vm.treeSchedule);
                            });

                            path = event.path;

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
                            let obj = {};
                            obj.jobschedulerId = $scope.schedulerIds.selected;
                            obj.folders = [{
                                folder: vm.allProcessClasses[0].path.substring(0, vm.allProcessClasses[0].path.lastIndexOf('/')),
                                recursive: false
                            }];
                            ResourceService.getProcessClass(obj).then(function (res) {
                                if (res.processClasses) {
                                    angular.forEach(res.processClasses, function (value1) {
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

                    } else if (event.eventType == "JobStateChanged" && vm.resourceFilters.state == 'locks') {
                        angular.forEach(vm.allLocks, function (value2, index) {
                            if (event.path != undefined) {
                                if (value2.path == event.path) {
                                    var obj = {};
                                    obj.jobschedulerId = $scope.schedulerIds.selected;
                                    obj.folders = [{folder: value2.path, recursive: false}];
                                    ResourceService.get(obj).then(function (res) {
                                        if (res.locks) {
                                            vm.allLocks[index] = _.merge(vm.allLocks[index], res.locks[0]);
                                        }
                                    });
                                }
                            }
                        });
                    }
                    if (vm.resourceFilters.state == 'calendars') {
                        if (event.eventType == "CalendarCreated") {
                            var path = event.path.substring(0, event.path.lastIndexOf('/')) || '/';
                            var name = '';
                            if (path != '/')
                                name = path.substring(path.lastIndexOf('/') + 1, path.length);
                            $rootScope.calendar_expand_to = {
                                name: name,
                                path: path
                            };
                            initCalendarTree();
                            break;

                        } else if (event.eventType == "CalendarUpdated") {
                            for (let x = 0; x < vm.allCalendars.length; x++) {
                                if (vm.allCalendars[x].path == event.path) {
                                    var obj = {};
                                    obj.jobschedulerId = $scope.schedulerIds.selected;
                                    obj.id = vm.allCalendars[x].id;
                                    CalendarService.getCalendar(obj).then(function (res) {
                                        if (res.calendar) {
                                            vm.allCalendars[x] = _.merge(vm.allCalendars[x], res.calendar);
                                        }
                                    });
                                    break;
                                }
                            }
                        } else if (event.eventType == "CalendarDeleted") {
                            for (let x = 0; x < vm.allCalendars.length; x++) {
                                if (vm.allCalendars[x].path == event.path) {
                                    vm.allCalendars.splice(x, 1);
                                    break;
                                }
                            }
                            if (vm.allCalendars.length == 0) {
                                initCalendarTree(true);
                                 break;
                            }
                        } else {
                            if (event.eventType.match('Calendar')) {
                                initCalendarTree();
                                 break;
                            }
                        }
                        if (event.eventType == "AuditLogChanged" && vm.showPanel && vm.showPanel.path == event.path) {
                            vm.loadAuditLogs(vm.showPanel);
                        }
                    }
                    if (vm.resourceFilters.state == 'events' && event.objectType == 'OTHER') {
                        if (event.eventType == 'CustomEventAdded' || event.eventType == 'CustomEventDeleted') {
                            getEvents()
                        }
                    }
                }
        });

        var interval1, interval2;

        function poll1() {
            interval1 = $interval(function () {
                vm.pollAgents();
            }, 30 * 1000)
        }

        function poll2() {
            interval2 = $interval(function () {
                for (let i = 0; i < vm.treeSchedule.length; i++) {
                    checkExpandTreeForUpdates(vm.treeSchedule[i]);
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
            $('#rightPanel1').find('.parent .child').removeClass('col-xxl-3 col-lg-4').addClass('col-xxl-2 col-lg-3');
            $('#leftPanel').hide();
            $('.sidebar-btn').show();
        };
        vm.showLeftPanel = function () {
            $('#rightPanel1').removeClass('m-l-0 fade-in');
            $('#rightPanel1').find('.parent .child').addClass('col-xxl-3 col-lg-4').removeClass('col-xxl-2 col-lg-3');
            $('#leftPanel').show();
            $('.sidebar-btn').hide();

        };


        var watcher11 = $scope.$watch('scheduleFilters.searchText', function (newNames) {
            if (newNames)
                vm.object = {};
        });
        var watcher12 = $scope.$watch('calendarFilters.searchText', function (newNames) {
            if (newNames)
                vm.object = {};
        });
        var watcher13 = $scope.$watch('documentFilters.searchText', function (newNames) {
            if (newNames)
                vm.object = {};
        });
        var watcher14 = $scope.$watch('eventFilters.searchText', function (newNames) {
            if (newNames)
                vm.object = {};
        });

        vm.pageChange = function () {
            vm.object = {};
        };

        $scope.$on('$destroy', function () {
            watcher1();
            watcher3();
            watcher4();
            watcher5();
            watcher6();
            watcher7();
            watcher8();
            watcher9();
            watcher10();
            watcher11();
            watcher12();
            watcher13();
            watcher14();
            $interval.cancel(interval1);
            $interval.cancel(interval2);
            $timeout.cancel(t1);

        });
    }

    ResourceInfoCtrl.$inject = ['$scope', '$rootScope', '$stateParams', '$state', 'ResourceService', 'ScheduleService', 'JobSchedulerService', '$uibModal', 'TaskService', 'CalendarService', '$timeout', 'FileSaver', 'AuditLogService', '$window','SOSAuth' ];
    function ResourceInfoCtrl($scope, $rootScope, $stateParams, $state, ResourceService, ScheduleService, JobSchedulerService, $uibModal, TaskService, CalendarService, $timeout, FileSaver, AuditLogService, $window, SOSAuth) {
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
            } else if ($state.current.name == 'app.documentation') {
                getDocument();
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

        vm.editAgentCluster = function (cluster) {
            vm.comments = {};
            vm.comments.radio = 'predefined';
            ResourceService.getProcessClassConfig({
                jobschedulerId: $scope.schedulerIds.selected,
                processClass: cluster.path
            }).then(function (res) {
                vm.processClassObject = res.configuration;
                vm.processClassObject.path = cluster.path;
                vm.processClassObject.name = cluster.path.substring(cluster.path.lastIndexOf('/') + 1);
                if(!vm.processClassObject.remoteSchedulers){
                    vm.processClassObject.remoteSchedulers = {remoteSchedulerList:[]};
                }
                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/edit-process-class-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    size: 'lg',
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    let obj = {};
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
                    obj.jobschedulerId = $scope.schedulerIds.selected;
                    obj.processClass = cluster.path;
                    let list = [];
                    if (vm.processClassObject.remoteSchedulers.remoteSchedulerList.length > 0) {
                        for (let i = 0; i < vm.processClassObject.remoteSchedulers.remoteSchedulerList.length; i++) {
                            if (vm.processClassObject.remoteSchedulers.remoteSchedulerList[i].remoteScheduler) {
                                list.push(vm.processClassObject.remoteSchedulers.remoteSchedulerList[i]);
                            }
                        }
                    }
                    if (vm.processClassObject.remoteSchedulers.select && list.length === 0) {
                        vm.processClassObject.remoteSchedulers.select = '';
                    }
                    vm.processClassObject.remoteSchedulers.remoteSchedulerList = list;
                    obj.configuration = vm.processClassObject;
                    delete obj.configuration['path'];
                    ResourceService.updateProcessClassConfig(obj);
                }, function () {

                });
            });
        };

        vm.removeAgentCluster = function(processClass) {
            let obj ={jobschedulerId: $scope.schedulerIds.selected, processClass : processClass.path};
            vm.processClassObject = processClass;

            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.type = 'Process Class';
                vm.comments.operation = 'Delete';
                vm.comments.name = processClass.path;

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
                    deleteProcessClass(obj);
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
                    deleteProcessClass(obj);
                }, function () {

                });
            }
        };

        function deleteProcessClass(obj) {
            ResourceService.deleteProcessClassConfig(obj).then(function (res) {
                vm.agentClusters =[];
            });
        }

        function volatileInformationL(obj) {
            ResourceService.get(obj).then(function (res) {
                if (vm.locks.length > 0) {
                    vm.lock = _.merge(vm.locks, res.locks);
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
                    var schedule = _.merge(vm.scheudule, res.scheudule);
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
                    var processClass = _.merge(vm.processClasses[0], res.processClasses[0]);
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
            if (vm.substituteObj.name.substring(0, 1) == '/') {
                schedules.schedule = vm.substituteObj.name;
            } else {
                schedules.schedule = vm.substituteObj.folder + '' + vm.substituteObj.name;
            }
            var x2js = new X2JS();

            var x = x2js.xml_str2json(schedule.runTime);
            x.schedule._substitute = schedule.path;
            schedules.runTime = x2js.json2xml_str(x).replace(/,/g, ' ');
            schedules.calendars = vm.schedule.calendars;

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


            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/add-substitute-dialog.html',
                controller: 'RuntimeEditorDialogCtrl',
                scope: vm,
                size: 'lg',
                backdrop: 'static',
                windowClass: 'fade-modal'
            });
            modalInstance.result.then(function () {
                createSchedule(schedule);
            }, function (res) {
                if(res === 'ok'){
                    createSchedule(schedule);
                }
            });

            ScheduleService.getSchedulesP({jobschedulerId: $scope.schedulerIds.selected}).then(function (result) {
                vm._schedules = [];
                angular.forEach(result.schedules, function (value) {
                    if (value && !value.substitute && value.path != schedule.path)
                        vm._schedules.push(value)
                });
            });

        };

        function setRunTime(schedule) {
            var schedules = {};
            schedules.jobschedulerId = $scope.schedulerIds.selected;
            schedules.schedule = schedule.path;
            schedules.runTime = schedule.runTime;
            schedules.calendars = vm.schedule.calendars;
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
                    vm.calendars = res.calendars;
                }

                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/edit-schedule-dialog.html',
                    controller: 'RuntimeEditorDialogCtrl',
                    scope: vm,
                    size: 'lg',
                    backdrop: 'static',
                    windowClass: 'fade-modal'
                });
                modalInstance.result.then(function () {
                    setRunTime(schedule);
                    vm.xml = undefined;
                    vm.calendars = [];
                }, function (res) {
                    if(res === 'ok'){
                        setRunTime(schedule);
                     
                    }
                        vm.xml = undefined;
                        vm.calendars = [];
                    
                });
            });
            ScheduleService.getSchedulesP({jobschedulerId: $scope.schedulerIds.selected}).then(function (result) {
                vm._schedules = [];
                angular.forEach(result.schedules, function (value) {
                    if (value && !value.substitute && value.path != schedule.path)
                        vm._schedules.push(value)
                });
            });

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
                angular.forEach(vm.filterTree1, function (value) {
                    value.expanded = true;
                    if (value.folders) {
                        value.folders = orderBy(value.folders, 'name');
                    }
                });
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
                obj.calendar.path = vm.calendar.newPath;
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

            CalendarService.storeCalendar(obj);
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
                }, 400);
            });

        };

        vm.exportCalendar = function (calendar) {
            var calendars = [];
            if (calendar) {
                calendars.push(calendar.path);
            }
            CalendarService.export({
                calendars: calendars,
                jobschedulerId: vm.schedulerIds.selected
            }).then(function (res) {
                vm.loading = false;
                var name = 'calendars' + '.json';
                var fileType = 'application/octet-stream';

                if (res.headers('Content-Disposition') && /filename=(.+)/.test(res.headers('Content-Disposition'))) {
                    name = /filename=(.+)/.exec(res.headers('Content-Disposition'))[1];
                }
                if (res.headers('Content-Type')) {
                    fileType = res.headers('Content-Type');
                }
                var data = res.data;
                if (typeof data === 'object') {
                    data = JSON.stringify(data, undefined, 2);
                }
                var blob = new Blob([data], {type: fileType});
                FileSaver.saveAs(blob, name);
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
            CalendarService.delete(obj);
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

        vm.loadAuditLogs = function (value) {
            vm.showPanel = value;
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.calendars = [];
            obj.calendars.push(value.path);
            obj.limit = parseInt(vm.userPreferences.maxAuditLogPerObject);
            AuditLogService.getLogs(obj).then(function (result) {
                if (result && result.auditLog) {
                    vm.auditLogs = result.auditLog;
                }
            });
        };
        vm.hideAuditPanel = function () {
            vm.showPanel = undefined;
        };

        /** -----------------Begin Documentation------------------- */
        function getDocument() {
            vm.allDocumentations = [];
            var obj = {};
            obj.documentations = [$stateParams.path];
            obj.jobschedulerId = vm.schedulerIds.selected;
            ResourceService.getDocumentations(obj).then(function (result) {
                vm.allDocumentations = result.documentations;
                vm.isLoading = true;
            }, function () {
                vm.isLoading = true;
            });
        }

        vm.showDocumentUsage = function(document) {
            vm.document = angular.copy(document);
            ResourceService.documentationUsed({
                documentation: vm.document.path,
                jobschedulerId: vm.schedulerIds.selected
            }).then(function (res) {
                vm.document.usedIn = res.objects;
            });
            var modalInstance1 = $uibModal.open({
                templateUrl: 'modules/core/template/show-usage-document-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                backdrop: 'static'
            });
            modalInstance1.result.then(function () {

            }, function () {

            });
        };

        vm.exportDocument = function (document) {
            let obj = {jobschedulerId: vm.schedulerIds.selected,documentations: []};
            obj.documentations.push(document.path);
            ResourceService.exportDocumentations(obj).then(function (res) {
               $("#tmpFrame").attr('src', './api/documentations/export?jobschedulerId='+vm.schedulerIds.selected+'&filename='+res.filename+'&accessToken='+ SOSAuth.accessTokenId);
            });
        };

        vm.deleteDocumentations = function (document) {
            let obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.documentations = [];
            obj.documentations.push(document.path);
            vm.document = angular.copy(document);
            vm.documentArr = undefined;
            vm.document.delete = true;
            ResourceService.documentationUsed({
                documentation: vm.document.path,
                jobschedulerId: vm.schedulerIds.selected
            }).then(function (res) {
                vm.document.usedIn = res.objects;
            });

            deleteDocumentFn(obj, document);
        };

        function deleteDocument(obj) {
            ResourceService.deleteDocumentations(obj).then(function () {
                vm.allDocumentations =[];
            });
        }

        function deleteDocumentFn(obj, document) {
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.type = 'Documentation';
                vm.comments.operation = 'Delete';
                vm.comments.name = document.path;
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
                    deleteDocument(obj);
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
                    deleteDocument(obj);
                }, function () {

                });
            }
        }

        vm.assignedDocument = function (data) {
            vm.assignObj = {
                type: $state.current.name === 'app.schedule' ? 'Schedule' : $state.current.name === 'app.calendar' ? 'Calendar' : $state.current.name === 'app.processClass' ? 'Process Class' : 'Lock',
                path: data.path,
            };
            let type = $state.current.name === 'app.schedule' ? 'schedule' : $state.current.name === 'app.calendar' ? 'calendar' : $state.current.name === 'app.processClass' ? 'processClass' : 'lock';
            let obj = {jobschedulerId: vm.schedulerIds.selected};
            obj[type] = data.path;
            vm.comments = {};
            vm.comments.radio = 'predefined';
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/assign-document-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                size: 'lg',
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
                obj.documentation = vm.assignObj.documentation;

                ResourceService.assign(type, obj).then(function (res) {
                    data.documentation = vm.assignObj.documentation;
                });
            }, function () {

            });
        };

        vm.getDocumentTreeStructure = function () {
            $rootScope.$broadcast('initTree');
        };

        vm.$on('closeDocumentTree', function (evn, path) {
            vm.assignObj.documentation = path;
        });

        vm.unassignedDocument = function (data) {
            let type = $state.current.name === 'app.schedule' ? 'schedule' : $state.current.name === 'app.calendar' ? 'calendar' : $state.current.name === 'app.processClass' ? 'processClass' : 'lock';
            let obj = {jobschedulerId: vm.schedulerIds.selected};
            obj[type] = data.path;
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = data.path;
                vm.comments.operation = 'Unassign Documentation';
                vm.comments.type = $state.current.name === 'app.schedule' ? 'Schedule' : $state.current.name === 'app.calendar' ? 'Calendar' : $state.current.name === 'app.processClass' ? 'Process Class' : 'Lock';

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
                    ResourceService.unassign(type, obj).then(function () {
                        data.documentation = undefined;
                    });
                }, function () {

                });
            } else {
                ResourceService.unassign(type, obj).then(function () {
                    data.documentation = undefined;
                });
            }
        };

        $scope.$on('$destroy', function () {
            $timeout.cancel(t1);
        });
    }

    DashboardCtrl.$inject = ['$scope', 'OrderService', 'JobSchedulerService', 'ResourceService', 'gettextCatalog', '$state', '$uibModal', 'DailyPlanService', '$rootScope', '$timeout', 'CoreService', 'SOSAuth', "$interval", "UserService", "$window", "YadeService", 'JobService', 'PermissionService'];

    function DashboardCtrl($scope, OrderService, JobSchedulerService, ResourceService, gettextCatalog, $state, $uibModal, DailyPlanService, $rootScope, $timeout, CoreService, SOSAuth, $interval, UserService, $window, YadeService, JobService, PermissionService) {
        var vm = $scope;
        vm.loadingImg = true;

        function initConfig(flag) {
           let grid = $('.grid-stack').data('gridstack');
            grid.movable('.grid-stack-item', flag);
            grid.resizable('.grid-stack-item', flag);
        }


        vm.dashboardFilters = CoreService.getDashboardTab();

        var isLoadedSnapshot = true, isLoadedSummary = true, isLoadedDailyPlan = true, isLoadedFileSummary = true,
            isLoadedFileOverview = true, isLoadedTaskSummary = true, isLoadedTaskSnapshot = true;

        vm.isAgentClusterVisible = false;
        vm.isRunningAgentVisible = false;
        vm.isJobscheduleStatusVisible = false;
        vm.isMasterClusterVisible = false;
        vm.isOrderOverviewVisible = false;
        vm.isOrderSummaryVisible = false;
        vm.istaskOverviewVisible = false;
        vm.istaskSummaryVisible = false;
        vm.isFileOverviewVisible = false;
        vm.isFileSummaryVisible = false;
        vm.isDailPlanVisible = false;
        vm.editLayoutObj = false;

        vm.dashboard = {widgets: []};
        vm.widgetWithPermission = [];

        function initWidgets() {
            vm.dashboard = {widgets: []};
            vm.widgetWithPermission = [];

            if(vm.userPreferences.dashboard && vm.userPreferences.dashboard.length > 0) {
                if (vm.userPreferences.dashboard[0].sizeX) {
                    vm.userPreferences.dashboard = undefined;
                }
            }

            if (vm.userPreferences.dashboard) {
                vm.dashboardLayout = vm.userPreferences.dashboard;
            } else {
                vm.dashboardLayout = [{
                    row: 0,
                    col: 0,
                    width: 4,
                    height: 3,
                    name: "agentClusterStatus",
                    visible: true,
                    message: gettextCatalog.getString('message.agentClusterStatus')
                }, {
                    row: 0,
                    col: 3,
                    width: 4,
                    height: 3,
                    name: "agentClusterRunningTasks",
                    visible: true,
                    message: gettextCatalog.getString('message.agentClusterRunningTasks')
                }, {
                    row: 4,
                    col: 0,
                    width: 8,
                    height: 6,
                    name: "masterClusterStatus",
                    visible: true,
                    message: gettextCatalog.getString('message.masterClusterStatus')
                }, {
                    row: 0,
                    col: 6,
                    width: 12,
                    height: 3,
                    name: "jobSchedulerStatus",
                    visible: true,
                    message: gettextCatalog.getString('message.jobSchedulerStatus')
                }, {
                    row: 0,
                    col: 9,
                    width: 8,
                    height: 2,
                    name: "ordersOverview",
                    visible: true,
                    message: gettextCatalog.getString('message.ordersOverview')
                }, {
                    row: 8,
                    col: 9,
                    width: 4,
                    height: 2,
                    name: "ordersSummary",
                    visible: true,
                    message: gettextCatalog.getString('message.ordersSummary')
                }, {
                    row: 0,
                    col: 11,
                    width: 8,
                    height: 2,
                    name: "tasksOverview",
                    visible: true,
                    message: gettextCatalog.getString('message.tasksOverview')
                }, {
                    row: 8,
                    col: 11,
                    width: 4,
                    height: 2,
                    name: "tasksSummary",
                    visible: true,
                    message: gettextCatalog.getString('message.tasksSummary')
                }, {
                    row: 0,
                    col: 13,
                    width: 8,
                    height: 2,
                    name: "fileTransferOverview",
                    visible: true,
                    message: gettextCatalog.getString('message.fileTransferOverview')
                }, {
                    row: 8,
                    col: 13,
                    width: 4,
                    height: 2,
                    name: "fileTransferSummary",
                    visible: true,
                    message: gettextCatalog.getString('message.fileTransferSummary')
                }, {
                    row: 0,
                    col: 15,
                    width: 12,
                    height: 2,
                    name: "dailyPlanOverview",
                    visible: true,
                    message: gettextCatalog.getString('message.dailyPlanOverview')
                }];
            }

            for (let i = 0; i < vm.dashboardLayout.length; i++) {
                if (vm.dashboardLayout[i].name === 'agentClusterStatus' && vm.permission.JobschedulerUniversalAgent.view.status) {
                    vm.widgetWithPermission.push(vm.dashboardLayout[i]);
                } else if (vm.dashboardLayout[i].name === 'agentClusterRunningTasks' && vm.permission.ProcessClass.view.status) {
                    vm.widgetWithPermission.push(vm.dashboardLayout[i]);
                } else if (vm.dashboardLayout[i].name === 'jobSchedulerStatus') {
                    vm.widgetWithPermission.push(vm.dashboardLayout[i]);
                } else if (vm.dashboardLayout[i].name === 'masterClusterStatus') {
                    vm.widgetWithPermission.push(vm.dashboardLayout[i]);
                } else if (vm.dashboardLayout[i].name === 'dailyPlanOverview' && vm.permission.DailyPlan.view.status) {
                    vm.widgetWithPermission.push(vm.dashboardLayout[i]);
                } else if (vm.dashboardLayout[i].name === 'ordersOverview' && vm.permission.Order.view.status) {
                    vm.widgetWithPermission.push(vm.dashboardLayout[i]);
                } else if (vm.dashboardLayout[i].name === 'ordersSummary' && vm.permission.Order.view.status) {
                    vm.widgetWithPermission.push(vm.dashboardLayout[i]);
                } else if (vm.dashboardLayout[i].name === 'tasksOverview' && vm.permission.Job.view.status) {
                    vm.widgetWithPermission.push(vm.dashboardLayout[i]);
                } else if (vm.dashboardLayout[i].name === 'tasksSummary' && vm.permission.Job.view.status) {
                    vm.widgetWithPermission.push(vm.dashboardLayout[i]);
                } else if (vm.dashboardLayout[i].name === 'fileTransferOverview' && vm.permission.YADE.view.status) {
                    vm.widgetWithPermission.push(vm.dashboardLayout[i]);
                } else if (vm.dashboardLayout[i].name === 'fileTransferSummary' && vm.permission.YADE.view.status) {
                    vm.widgetWithPermission.push(vm.dashboardLayout[i]);
                }
            }

            for (let i = 0; i < vm.widgetWithPermission.length; i++) {
                if (vm.widgetWithPermission[i].visible) {
                    vm.dashboard.widgets.push(vm.widgetWithPermission[i]);
                }
                restrictRestCall(vm.widgetWithPermission[i].name, vm.widgetWithPermission[i].visible);
            }

            setWidgetHeight();
        }

        vm.downloadJocLog = function(){
            $("#tmpFrame").attr('src', './api/log?accessToken='+ SOSAuth.accessTokenId);
        };

        vm.editLayout = function () {
            vm._tempDashboard = angular.copy(vm.dashboard);
            vm.editLayoutObj = true;
            initConfig(true);
        };
        vm.resetLayout = function () {
            vm._dashboard = 'reset layout?';
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/confirm-dialog.html',
                controller: 'DialogCtrl1',
                scope: vm,
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                vm.userPreferences.dashboard = undefined;
                initWidgets();
                setWidgetPreference(true);
                $state.reload('app.dashboard');
                vm._dashboard = undefined;
            }, function () {
                vm._dashboard = undefined;
            })
        };

        vm.saveWidget = function () {
            vm.editLayoutObj = false;
            initConfig(false);
            setWidgetPreference();
        };

        vm.cancelWidget = function () {
            vm.editLayoutObj = false;
            vm.dashboard = angular.copy(vm._tempDashboard);
            reloadWidgets();
            initConfig(false);
        };
        var interval;

        function setWidgetHeight() {
            var count = 0;
            interval = $interval(function () {
                count = count + 1;
                if (count > 2) {
                    vm.loadingImg = false;
                    $('.grid-stack').gridstack({
                        resizable: {
                            handles: 'e, se, s'
                        }, cellHeight: 55,
                        verticalMargin: 22
                    });
                    initConfig(false);
                    $interval.cancel(interval)
                }
            }, 300);
        }

        function setWidgetPreference(reset) {
            if (!vm.userPreferences.theme) {
                return;
            }
            if(!reset) {
                let serializedData = _.map($('.grid-stack > .grid-stack-item:visible'), function (el) {
                    el = $(el);
                    var node = el.data('_gridstack_node');
                    return {
                        row: node.x,
                        col: node.y,
                        width: node.width,
                        height: node.height,
                        name: node.id
                    };
                });

                for (let i = 0; i < vm.widgetWithPermission.length; i++) {
                    for (let j = 0; j < serializedData.length; j++) {
                        if (vm.widgetWithPermission[i].name === serializedData[j].name) {
                            vm.widgetWithPermission[i].row = serializedData[j].row;
                            vm.widgetWithPermission[i].col = serializedData[j].col;
                            vm.widgetWithPermission[i].width = serializedData[j].width;
                            vm.widgetWithPermission[i].height = serializedData[j].height;
                            serializedData.splice(j, 1);
                            break;
                        }
                    }
                }
            }

            vm.userPreferences.dashboard = vm.widgetWithPermission;
            $window.sessionStorage.preferences = JSON.stringify(vm.userPreferences);
            let configObj = {};
            configObj.jobschedulerId = $scope.schedulerIds.selected;
            configObj.account = vm.permission.user;
            configObj.configurationType = "PROFILE";
            configObj.id = parseInt($window.sessionStorage.preferenceId);
            configObj.configurationItem = JSON.stringify(vm.userPreferences);

            if (configObj.id && configObj.id > 0)
                UserService.saveConfiguration(configObj);
        }

        vm.addWidgetDialog = function () {
            $uibModal.open({
                templateUrl: 'modules/core/template/add-widget-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                size: 'lg',
                backdrop: 'static'
            });
        };

        function reloadWidgets() {
            setTimeout(function () {
                $('.grid-stack').gridstack({
                    resizable: {
                        handles: 'e, se, s'
                    }, cellHeight: 55,
                    verticalMargin: 22
                });
                $rootScope.$broadcast('clusterStatusDataChanged');
            }, 100)
        }

        vm.addWidget = function (widget) {
            for (let i = 0; i < vm.widgetWithPermission.length; i++) {
                if (vm.widgetWithPermission[i].name === widget.name) {
                    vm.widgetWithPermission[i].visible = true;
                    if (vm.dashboard.widgets.length !== 0) {
                        let item = vm.dashboard.widgets[vm.dashboard.widgets.length - 1];
                        vm.widgetWithPermission[i].row = 0;
                        vm.widgetWithPermission[i].col = item.col + item.height;
                    }
                    vm.dashboard.widgets.push(vm.widgetWithPermission[i]);
                    break;
                }
            }
            restrictRestCall(widget.name, true);
            reloadWidgets();
        };

        vm.removeWidget = function (widget) {
            widget.visible = false;
            for (let i = 0; i < vm.widgetWithPermission.length; i++) {
                if (vm.widgetWithPermission[i].name === widget.name) {
                    vm.widgetWithPermission[i].visible = false;
                    break;
                }
            }
            for (let j = 0; j < vm.dashboard.widgets.length; j++) {
                if (vm.dashboard.widgets[j].name === widget.name) {
                    vm.dashboard.widgets.splice(j, 1);
                    break;
                }
            }
            reloadWidgets();

        };

        vm.agentClusters = {};
        if (SOSAuth.jobChain) {
            SOSAuth.setJobChain(undefined);
            SOSAuth.save();
        }

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
            if (!vm.isAgentClusterVisible) {
                return;
            }
            if (!vm.agentClusters) {
                vm.isLoadedAgentCluster = false;
            }
            if (vm.schedulerIds.selected) {
                JobSchedulerService.getAgentCluster({
                    jobschedulerId: vm.schedulerIds.selected
                }).then(function (res) {
                    if (res.agentClusters) {
                        vm.agentClusters = res.agentClusters;
                        prepareAgentClusterData(vm.agentClusters);
                    }
                    vm.isLoadedAgentCluster = true;
                }, function () {
                    vm.agentClusterData = [];
                    vm.isLoadedAgentCluster = true;
                });
            }else{
               vm.agentClusterData = [];
               vm.isLoadedAgentCluster = true;
            }
        };

        vm.barOptions = {
            chart: {
                type: 'discreteBarChart',
                height: 160,
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
            if (!vm.isRunningAgentVisible) {
                return;
            }
            vm.isLoadedRunningTask = false;
            var agentArray = [];
            if (vm.scheduleState == 'UNREACHABLE') {
                agentClusterRunningTaskGraph(agentArray);
                return;
            }
            if (vm.schedulerIds.selected) {
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
            }else{
                agentClusterRunningTaskGraph(agentArray);
            }
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
            if (!vm.isMasterClusterVisible) {
                $rootScope.$broadcast('reloadScheduleDetail', true);
                return;
            }
            clusterStatusData = {};
            if (vm.schedulerIds.selected && !vm.isLoadedMasterCluster) {
                getDatabase().then(function (res) {
                    clusterStatusData.database = res;
                    getClusterMembersP().then(function (res) {
                        clusterStatusData.members = res;
                        if (clusterStatusData.members.masters && clusterStatusData.members.masters.length > 1) {
                            clusterStatusData.members.masters.sort(function (a, b) {
                                return a.clusterType.precedence - b.clusterType.precedence;
                            });
                        }
                        vm.clusterStatusData = clusterStatusData;
                        t2 = $timeout(function () {
                            $rootScope.$broadcast('clusterStatusDataChanged');
                            vm.isLoadedMasterCluster = true;
                        }, 75);

                    }, function () {
                        vm.clusterStatusData = [];
                        vm.isLoadedMasterCluster = true;

                    });
                }, function () {
                    vm.isLoadedMasterCluster = true;
                });
            } else {
                vm.clusterStatusData = [];
                vm.isLoadedMasterCluster = true;
                vm.notPermissionForMasterCluster = {};
            }
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


        vm.clusterAction = function (objectType, action, host, port, id) {
            $('.cluster-rect').popover('dispose');
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
                                SOSAuth.save();
                                if (res.selected != vm.schedulerIds.selected) {
                                    $state.reload(vm.currentState);
                                } else {
                                    for (let i = 0; i < vm.mastersList.length; i++) {
                                        if (vm.mastersList[i].jobschedulerId === obj.jobschedulerId && vm.mastersList[i].host === obj.host && vm.mastersList[i].port === obj.port) {
                                            vm.mastersList.splice(i, 1);
                                            break;
                                        }
                                    }
                                }
                                $rootScope.$broadcast('reloadUser');

                            }
                        });
                    })
                } else if (objectType === 'cluster' && action === 'terminate') {
                    JobSchedulerService.terminateCluster(obj1);
                } else if (objectType === 'cluster' && action === 'terminateFailsafe') {
                    JobSchedulerService.terminateFailsafeCluster(obj1);
                } else if (objectType === 'cluster' && action === 'restart') {
                    JobSchedulerService.restartCluster(obj1);
                } else if (objectType === 'cluster' && action === 'reactivatePrimaryJobscheduler') {
                    JobSchedulerService.reactivate(obj1);
                } else if (action === 'downloadLog') {
                    $rootScope.downloading = true;
                    if (!id) {
                        id = vm.schedulerIds.selected;
                    }
                    JobSchedulerService.info({
                        jobschedulerId: id,
                        host: host,
                        port: port
                    }).then(function (res) {
                        $rootScope.downloading = false;
                         $("#tmpFrame").attr('src', './api/jobscheduler/log?jobschedulerId='+id+'&filename='+res.log.filename+'&accessToken='+ SOSAuth.accessTokenId);
                    }, function () {
                        $rootScope.downloading = false;
                    });
                } else if (action === 'downloadDebugLog') {
                    $rootScope.downloading = true;
                    if (!id) {
                        id = vm.schedulerIds.selected;
                    }
                    JobSchedulerService.debugInfo({
                        jobschedulerId: id,
                        host: host,
                        port: port
                    }).then(function (res) {
                        $rootScope.downloading = false;
                         $("#tmpFrame").attr('src', './api/jobscheduler/debuglog?jobschedulerId='+id+'&filename='+res.log.filename+'&accessToken='+ SOSAuth.accessTokenId);
                    }, function () {
                        $rootScope.downloading = false;
                    });
                }
            }

            if (((objectType === 'supervisor' || objectType === 'master') && (action === 'terminateAndRestartWithTimeout' || action === 'terminateWithin')) || (objectType === 'cluster' && action === 'reactivatePrimaryJobschedulerWithIn') ) {
                vm.getTimeout(host, port, id, action);
            } else {
                if (vm.userPreferences.auditLog && action != 'downloadLog' && action != 'downloadDebugLog') {
                    vm.comments = {};
                    vm.comments.radio = 'predefined';
                    if(id && host)
                        vm.comments.name = id + ' (' + host + ':' + port + ')';
                    vm.comments.operation = action == 'remove' ? 'Remove instance' : 'button.'+action;
                    vm.comments.type = objectType !== 'cluster' ? 'JobScheduler' : 'Master Cluster';
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
        vm.getTimeout = function (host, port, id, action) {
            vm.comments = {};
            vm.comments.radio = 'predefined';
            vm._scheduleName = id || vm.schedulerIds.selected;
             if (host){
                 vm._scheduleName = vm._scheduleName + ' (' + host + ':' + port + ')';
             }

            vm.action = action;
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/get-timeout-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                var obj = {};
                obj.jobschedulerId = id || vm.schedulerIds.selected;
                if(host) {
                    obj.host = host;
                    obj.port = port;
                }
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
                if (action === 'terminateAndRestartWithTimeout') {
                    JobSchedulerService.restartWithin(obj);
                } else if (action === 'reactivatePrimaryJobschedulerWithIn') {
                    JobSchedulerService.reactivate(obj);
                } else {
                    JobSchedulerService.terminate(obj);
                }

            }, function () {

            });
        };

        vm.loadOrderSnapshot = function (flag) {
            if (!vm.isOrderOverviewVisible) {
                return;
            }
            if (vm.scheduleState == 'UNREACHABLE' && !flag) {
                isLoadedSnapshot = true;
                vm.snapshot = {};
                return;
            }
            if (vm.schedulerIds.selected) {
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
            } else {
                isLoadedSnapshot = true;
                vm.notPermissionForSnapshot = {};
            }
        };

        vm.getOrderSummary = function () {
            if (!vm.isOrderSummaryVisible) {
                return;
            }
            isLoadedSummary = false;
            let obj = {};
            obj.jobschedulerId = $scope.schedulerIds.selected;
            obj.dateFrom = vm.dashboardFilters.filter.orderSummaryfrom;
            obj.timeZone = vm.userPreferences.zone;
             if (vm.schedulerIds.selected) {
                 OrderService.getSummary(obj).then(function (res) {
                     vm.orderSummary = res.orders;
                     isLoadedSummary = true;

                 }, function (err) {
                     vm.notPermissionForSummary = !err.data.isPermitted;
                     isLoadedSummary = true;
                 })
             }else {
                 vm.notPermissionForSummary = {};
                 isLoadedSummary = true;
             }
        };

        vm.loadTaskSnapshot = function (flag) {
            if (!vm.istaskOverviewVisible) {
                return;
            }
            if (vm.scheduleState == 'UNREACHABLE' && !flag) {
                isLoadedTaskSnapshot = true;
                vm.jobSnapshot = {};
                return;
            }
             if (vm.schedulerIds.selected) {
                 isLoadedTaskSnapshot = false;
                 JobService.getSnapshot({jobschedulerId: $scope.schedulerIds.selected}).then(function (res) {
                     vm.jobSnapshot = res.jobs;
                     vm.notPermissionForTaskSnapshot = '';
                     isLoadedTaskSnapshot = true;

                 }, function (err) {
                     if (err.data)
                         vm.notPermissionForTaskSnapshot = !err.data.isPermitted;
                     isLoadedTaskSnapshot = true;
                 });
             }else{
                 isLoadedTaskSnapshot = true;
                vm.notPermissionForTaskSnapshot = {};
             }
        };

        vm.getTaskSummary = function () {
            if (!vm.istaskSummaryVisible) {
                return;
            }
            isLoadedTaskSummary = false;
            var obj = {};
            obj.jobschedulerId = $scope.schedulerIds.selected;
            obj.dateFrom = vm.dashboardFilters.filter.taskSummaryfrom;
            obj.timeZone = vm.userPreferences.zone;
            if (vm.schedulerIds.selected) {
                JobService.getSummary(obj).then(function (res) {
                    vm.taskSummary = res.jobs;
                    isLoadedTaskSummary = true;
                }, function (err) {
                    vm.notPermissionForTaskSummary = !err.data.isPermitted;
                    isLoadedTaskSummary = true;
                })
            }else{
                 isLoadedTaskSummary = false;
                 vm.notPermissionForTaskSummary = {};
            }
        };

        vm.getFileOverview = function (flag) {
            if (!vm.isFileOverviewVisible) {
                return;
            }
            if (vm.scheduleState == 'UNREACHABLE' && !flag) {
                isLoadedFileOverview = true;
                vm.yadeOverview = {};
                return;
            }
            if (vm.schedulerIds.selected) {
                isLoadedFileOverview = false;
                YadeService.getOverview({jobschedulerId: $scope.schedulerIds.selected}).then(function (res) {
                    vm.yadeOverview = res.transfers;
                    vm.notPermissionForSnapshot = '';
                    isLoadedFileOverview = true;
                }, function (err) {
                    if (err.data)
                        vm.notPermissionForFileOverview = !err.data.isPermitted;
                    isLoadedFileOverview = true;
                });
            }else{
                isLoadedFileOverview = true;
                vm.notPermissionForFileOverview = {};
            }
        };

        vm.getFileSummary = function () {
            if (!vm.isFileSummaryVisible) {
                return;
            }
            isLoadedFileSummary = false;
            let obj = {};
            obj.dateFrom = vm.dashboardFilters.filter.fileSummaryfrom;
            obj.timeZone = vm.userPreferences.zone;
            obj.jobschedulerId = $scope.schedulerIds.selected;
            if (vm.schedulerIds.selected) {
                YadeService.getSummary(obj).then(function (res) {
                    vm.yadeSummary = res;
                    isLoadedFileSummary = true;
                }, function (err) {
                    if (err.data)
                        vm.notPermissionForFileSummary = !err.data.isPermitted;
                    isLoadedFileSummary = true;
                })
            }else{
                vm.notPermissionForFileSummary = {};
                isLoadedFileSummary = true;
            }
        };

        vm.loadScheduleStatus = function () {
            if (!vm.isJobscheduleStatusVisible) {
                return;
            }
            JobSchedulerService.getClusterMembersP({jobschedulerId: ''}).then(function (res) {
                vm.mastersList = res.masters;
                JobSchedulerService.getClusterMembers({jobschedulerId: ''}).then(function (result) {
                    vm.mastersList = _.merge(res.masters, result.masters);
                    angular.forEach(vm.mastersList, function (data) {
                        data.permission = PermissionService.getPermission(data.jobschedulerId).JobschedulerMaster;
                    });
                })

            }, function () {
                JobSchedulerService.getClusterMembers({jobschedulerId: ''}).then(function (result) {
                    vm.mastersList = result.masters;
                    angular.forEach(vm.mastersList, function (data) {
                        data.permission = PermissionService.getPermission(data.jobschedulerId).JobschedulerMaster;
                    });
                }, function () {
                    vm.mastersList = [];
                })
            })
        };

        /*----------------- Daily plan overview -----------------*/
        vm.getDailyPlans = function () {
            if (!vm.isDailPlanVisible) {
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
            if (vm.schedulerIds.selected) {
                DailyPlanService.getPlans(obj).then(function (res) {
                    vm.planItemData = res.planItems;
                    filterData();
                    isLoadedDailyPlan = true;
                }, function () {
                    isLoadedDailyPlan = true;
                    vm.totalPlanData = 0;
                })
            } else {
                isLoadedDailyPlan = true;
                vm.totalPlanData = 0;
            }
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
            for (let i = 0; i <= 5; i++) {
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
            for (let i = 0; i <= 5; i++) {
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
                for (let i = 0; i <= 5; i++) {
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
                for (let i = 0; i <= 5; i++) {
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
            vm.taskHistoryTab.order.filter.date = vm.dashboardFilters.filter.orderSummaryfrom === '0d' ? 'today' : vm.dashboardFilters.filter.orderSummaryfrom;
            $state.go('app.history');
        };
        vm.showTaskSummary = function (state) {
            vm.taskHistoryTab = CoreService.getHistoryTab();
            vm.taskHistoryTab.type = 'job';
            vm.taskHistoryTab.task.filter.historyStates = state;
            vm.taskHistoryTab.task.selectedView = false;
            vm.taskHistoryTab.task.filter.date = vm.dashboardFilters.filter.taskSummaryfrom === '0d' ? 'today' : vm.dashboardFilters.filter.taskSummaryfrom;
            $state.go('app.history');
        };
        vm.showYadeSummary = function (state) {
            vm.taskHistoryTab = CoreService.getHistoryTab();
            vm.taskHistoryTab.type = 'yade';
            vm.taskHistoryTab.yade.filter.historyStates = state;
            vm.taskHistoryTab.yade.selectedView = false;
            vm.taskHistoryTab.yade.filter.date = vm.dashboardFilters.filter.fileSummaryfrom === '0d' ? 'today' : vm.dashboardFilters.filter.fileSummaryfrom;
            $state.go('app.history');
        };

        var interval1 = '';

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
                if (flag)
                    poll();
            } else if (id == 'agentClusterRunningTasks') {
                vm.isRunningAgentVisible = flag;
                vm.getAgentClusterRunningTask();
            } else if (id == 'jobSchedulerStatus') {
                vm.isJobscheduleStatusVisible = flag;
                vm.loadScheduleStatus();
            } else if (id == 'masterClusterStatus') {
                vm.isMasterClusterVisible = flag;
                vm.isLoadedMasterCluster = false;
                prepareClusterStatusData();
            } else if (id == 'ordersOverview') {
                vm.isOrderOverviewVisible = flag;
                vm.loadOrderSnapshot();
            } else if (id == 'ordersSummary') {
                vm.isOrderSummaryVisible = flag;
                vm.getOrderSummary();
            } else if (id == 'tasksOverview') {
                vm.istaskOverviewVisible = flag;
                vm.loadTaskSnapshot();
            } else if (id == 'tasksSummary') {
                vm.istaskSummaryVisible = flag;
                vm.getTaskSummary();
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

        if (!_.isEmpty(vm.userPreferences)) {
            initWidgets();
            if (vm.userPreferences && !vm.userPreferences.dashboard)
                setWidgetPreference();
        } else {

            $scope.$on('reloadPreferences', function () {
                if (vm.loadingImg)
                    initWidgets();
                if (vm.userPreferences && !vm.userPreferences.dashboard) {
                    setWidgetPreference();
                }
            });
            if (!vm.schedulerIds.selected) {
                initWidgets();
            }
        }


        $scope.$on('event-started', function (event, args) {
            if (args.events && args.events[0] && args.events[0].eventSnapshots) {
                for (let i = 0; i < args.events[0].eventSnapshots.length; i++) {
                    if (args.events[0].eventSnapshots[i].eventType === "SchedulerStateChanged") {
                        isLoadedSnapshot = false;
                        isLoadedTaskSnapshot = false;
                        vm.loadOrderSnapshot(true);
                        vm.loadTaskSnapshot(true);
                        vm.getFileOverview(true);
                        vm.loadScheduleStatus();
                        vm.isLoadedMasterCluster = false;
                        prepareClusterStatusData();
                    }
                    if ((args.events[0].eventSnapshots[i].eventType === "OrderStateChanged" && isLoadedSnapshot)) {
                        isLoadedSnapshot = false;
                        if (!vm.notPermissionForSnapshot)
                            vm.loadOrderSnapshot();
                    } else if (args.events[0].eventSnapshots[i].eventType === "ReportingChangedOrder" && isLoadedSummary) {
                        isLoadedSummary = false;
                        if (!vm.notPermissionForSummary)
                            vm.getOrderSummary();
                    } else if ((args.events[0].eventSnapshots[i].eventType === "JobStateChanged" && isLoadedTaskSnapshot)) {
                        isLoadedTaskSnapshot = false;
                        if (!vm.notPermissionForTaskSnapshot)
                            vm.loadTaskSnapshot();
                    } else if (args.events[0].eventSnapshots[i].eventType === "ReportingChangedJob" && isLoadedTaskSummary) {
                        isLoadedTaskSummary = false;
                        if (!vm.notPermissionForTaskSummary)
                            vm.getTaskSummary();
                    } else if (args.events[0].eventSnapshots[i].eventType === "DailyPlanChanged" && isLoadedDailyPlan) {
                        isLoadedDailyPlan = false;
                        vm.getDailyPlans();
                    } else if (args.events[0].eventSnapshots[i].eventType === "FileBasedActivated" && args.events[0].eventSnapshots[i].objectType === "PROCESSCLASS" && (vm.isLoadedAgentCluster || vm.isLoadedRunningTask)) {
                        vm.isLoadedAgentCluster = false;
                        if (vm.permission && vm.permission.JobschedulerUniversalAgent && vm.permission.JobschedulerUniversalAgent.view.status)
                            vm.getAgentCluster();
                        if (vm.permission && vm.permission.ProcessClass && vm.permission.ProcessClass.view.status)
                            vm.getAgentClusterRunningTask();
                    } else if (args.events[0].eventSnapshots[i].objectType === "OTHER") {
                        if (args.events[0].eventSnapshots[i].eventType === "YADEFileStateChanged" && isLoadedFileOverview) {
                            vm.getFileOverview();
                        } else if (args.events[0].eventSnapshots[i].eventType === "YADETransferStarted" && isLoadedFileSummary) {
                            vm.getFileSummary();
                        }
                    }
                    if (args.events[0].eventSnapshots[i].eventType === "JobStateChanged" && vm.isLoadedRunningTask) {
                        vm.isLoadedRunningTask = false;
                        if (vm.permission && vm.permission.ProcessClass && vm.permission.ProcessClass.view.status)
                            vm.getAgentClusterRunningTask();
                    }
                }
            }
            if (args.otherEvents && args.otherEvents.length > 0) {
                for (var j = 0; j < args.otherEvents.length; j++) {
                    if (args.otherEvents[j].jobschedulerId != vm.schedulerIds.selected) {
                        var flag = false;
                        if (args.otherEvents[j].eventSnapshots && args.otherEvents[j].eventSnapshots.length > 0)
                            for (var x = 0; x < args.otherEvents[j].eventSnapshots.length; x++) {
                                if (args.otherEvents[j].eventSnapshots[x].eventType === "SchedulerStateChanged") {
                                    vm.loadScheduleStatus();
                                   if(vm.selectedJobScheduler && vm.selectedJobScheduler.clusterType && ( vm.selectedJobScheduler.clusterType !== 'STANDALONE')) {
                                       vm.isLoadedMasterCluster = false;
                                       prepareClusterStatusData();
                                    }
                                    flag = true;
                                    break;
                                }
                            }
                        if (flag) {
                            break;
                        }
                    }
                }
            }
        });

        $scope.$on('$destroy', function () {
            if (t1)
                $timeout.cancel(t1);
            if (t2)
                $timeout.cancel(t2);
            if (interval)
                $interval.cancel(interval);
            if (interval1)
                $interval.cancel(interval1);


        });
    }

    DailyPlanCtrl.$inject = ['$scope', '$timeout', 'gettext', 'orderByFilter', '$uibModal', 'SavedFilter', 'DailyPlanService', '$stateParams', 'CoreService', 'UserService', 'ResourceService'];

    function DailyPlanCtrl($scope, $timeout, gettext, orderBy, $uibModal, SavedFilter, DailyPlanService, $stateParams, CoreService, UserService, ResourceService) {
        var vm = $scope;
        vm.todayDate = new Date();
        vm.dailyPlanFilters = CoreService.getDailyPlanTab();
        vm.maxEntryPerPage = vm.userPreferences.maxEntryPerPage;

        vm.selectedFiltered = '';
        vm.isUnique = true;
        var promise1;
        vm.object = {};
        vm.filter_tree = {};
        vm.filterTree1 = [];
        vm.object.paths = [];
        vm.expanding_property = {
            field: "name"
        };

        $scope.reloadState = 'no';

        if (!vm.schedulerIds.selected) {
            vm.isLoading = true;
            isLoaded = true;
            vm.showSpinner = false;
            return;
        }

        vm.reload = function() {
            if ($scope.reloadState === 'no') {
                $scope.plans = [];
                $scope.folderPath = 'Process aborted';
                $scope.reloadState = 'yes';
            } else if ($scope.reloadState === 'yes') {
                $scope.reloadState = 'no';
                vm.isLoading = false;
                vm.getPlans();
            }
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
        } else {
            vm.savedDailyPlanFilter.selected = undefined;
        }
        vm.temp_filter = {};

        function checkSharedFilters() {
            if (vm.permission.JOCConfigurations.share.view.status) {
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
        checkSharedFilters();

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
                    let data = [];
                    for (let i = 0; i < vm.dailyPlanFilterList.length; i++) {
                        let flag = true;
                        for (let j = 0; j < data.length; j++) {
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
                    let flag = true;
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

            }, function () {
                vm.savedDailyPlanFilter.selected = undefined;
                vm.load();
            })
        }

        function setDateRange() {
            vm.currentDateValue = new Date();
            let from, to;
            if (vm.dailyPlanFilters.filter.range == 'today' || !vm.dailyPlanFilters.filter.range) {
                from = '0d';
                to = '0d';
            } else {
                from = new Date();
                to = new Date();
                from.setDate(from.getDate());
                to.setDate(to.getDate() + 1);
                from = moment.utc(from);
                to = moment.utc(to);
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

        vm.getPlans = function (isJobstream) {
            if (isJobstream) {
                vm.dailyPlanFilters.filter.jobStream = !vm.dailyPlanFilters.filter.jobStream;
            }
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
            targetDataAddRowIndex: undefined
        };

        $(window).resize(function () {
            let ht = $('.app-header').height()
                + $('.app-footer').height()
                + $('.top-header-bar').height()
                + $('.sub-header').height()
                + $('.sub-header-2').height() + 82;
            vm.options.maxHeight = window.innerHeight - ht;
        });

        vm.canAutoWidth = function (scale) {
            return !(scale.match(/.*?hour.*?/) || scale.match(/.*?minute.*?/));
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
            let obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj = applySearchFilter(obj);
            if (!obj.dateFrom) {
                obj.dateFrom = new Date();
                obj.dateFrom.setHours(0);
                obj.dateFrom.setMinutes(0);
                obj.dateFrom.setSeconds(0);
                obj.dateFrom.setMilliseconds(0);
                obj.dateFrom = moment.utc(obj.dateFrom);
            }
            if (!obj.dateTo) {
                obj.dateTo = new Date();
                obj.dateTo.setDate(toDate.getDate() + 1);
                obj.dateTo.setHours(0);
                obj.dateTo.setMinutes(0);
                obj.dateTo.setSeconds(0);
                obj.dateTo.setMilliseconds(0);
                obj.dateTo = moment.utc(obj.dateTo);
            }
            vm.showSpinner = true;
            obj.timeZone = vm.userPreferences.zone;

            if ((obj.dateFrom && (typeof obj.dateFrom.getMonth === 'function' || typeof obj.dateFrom === 'object')) || (obj.dateTo && (typeof obj.dateTo.getMonth === 'function'  || typeof obj.dateTo === 'object'))) {
                obj.timeZone = 'UTC';
            }
            if ((obj.dateFrom && typeof obj.dateFrom.getMonth === 'function')) {
                obj.dateFrom = moment(obj.dateFrom).tz(vm.userPreferences.zone)._d;
            }
            if ((obj.dateTo && typeof obj.dateTo.getMonth === 'function')) {
                obj.dateTo = moment(obj.dateTo).tz(vm.userPreferences.zone)._d;
            }

            vm.dailyPlanFilters.filter.status = '';
            vm.dailyPlanFilters.filter.state = '';
            vm.dailyPlanFilters.filter.range = '';

            DailyPlanService.getPlans(obj).then(function (res) {
                vm.plans = res.planItems;
                vm.plans = sortByKey(vm.plans, vm.dailyPlanFilters.filter.sortBy, vm.dailyPlanFilters.reverse);
                prepareGanttData(vm.plans, true);
                if (res.created) {
                    vm.maxPlannedTime = new Date(res.created.until);
                } else {
                    vm.maxPlannedTime = undefined;
                }
                vm.isLoading = true;
                isLoaded = true;
                vm.showSpinner = false;
            }, function () {
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
            vm.searchDailyPlanFilter.fromTime = moment().format("HH:mm");
            vm.searchDailyPlanFilter.to = new Date();
            vm.searchDailyPlanFilter.toTime = '24:00';
            vm.dailyPlanFilter = undefined;
        };
        vm.cancel = function (form) {
            vm.showSearchPanel = false;
            vm.searchDailyPlanFilter = undefined;

            if (!vm.dailyPlanFilters.filter.status) {
                vm.dailyPlanFilters.filter.status = 'ALL';
            }
            if (!vm.dailyPlanFilters.filter.state) {
                vm.dailyPlanFilters.filter.state = '';
            }
            if (!vm.dailyPlanFilters.filter.range) {
                vm.dailyPlanFilters.filter.range = 'today';
            }

            if (form)
                form.$setPristine();
             if(hitSearch) {
                 hitSearch = false;
                 vm.getPlans();
             }
        };

        function parseProcessExecuted(regex) {
            let date;
            if (/^\s*(now\s*[-,+])\s*(\d+)\s*$/i.test(regex)) {
                let seconds = parseInt(/^\s*(now\s*[-,+])\s*(\d+)\s*$/i.exec(regex)[2]);
                let sign = /^\s*(now\s*[-,+])\s*(\d+)\s*$/i.exec(regex)[1].substring(3);
                date= sign.trim() + seconds+'s';
            } else if (/^\s*[-,+](\d+)(s|h|d|w|M|y)\s*$/.test(regex)) {
                date = regex;
            } else if (/^\s*(Today)\s*$/i.test(regex)) {
                date = '0d';
            } else if (/^\s*(now)\s*$/i.test(regex)) {
                date = moment.utc(new Date());
            } else if (/^\s*[-,+](\d+)(s|h|d|w|M|y)\s*[-,+](\d+)(s|h|d|w|M|y)\s*$/.test(regex)) {
                date = regex;
            }
            return date;
        }

        function applySearchFilter(obj) {
            if (vm.searchDailyPlanFilter.regex)
                obj.regex = vm.searchDailyPlanFilter.regex;
            if (vm.searchDailyPlanFilter.jobChain)
                obj.jobChain = vm.searchDailyPlanFilter.jobChain;
            if (vm.searchDailyPlanFilter.orderId)
                obj.orderId = vm.searchDailyPlanFilter.orderId;
            if (vm.searchDailyPlanFilter.job)
                obj.job = vm.searchDailyPlanFilter.job;
            if (vm.searchDailyPlanFilter.jobStream)
                obj.jobStream = vm.searchDailyPlanFilter.jobStream;

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
                for (let i = 0; i < vm.searchDailyPlanFilter.paths.length; i++) {
                    obj.folders.push({folder: vm.searchDailyPlanFilter.paths[i], recursive: true});
                }
            }
            var fromDate;
            var toDate;

            if (vm.searchDailyPlanFilter.radio == 'current') {
                if (vm.searchDailyPlanFilter.from) {
                    fromDate = new Date(vm.searchDailyPlanFilter.from);
                    if (vm.searchDailyPlanFilter.fromTime) {
                        if (vm.searchDailyPlanFilter.fromTime === '24:00' || vm.searchDailyPlanFilter.fromTime === '24:00:00') {
                            fromDate.setDate(fromDate.getDate() + 1);
                            fromDate.setHours(0);
                            fromDate.setMinutes(0);
                            fromDate.setSeconds(0);
                        } else {
                            fromDate.setHours(moment(vm.searchDailyPlanFilter.fromTime, 'HH:mm:ss').hours());
                            fromDate.setMinutes(moment(vm.searchDailyPlanFilter.fromTime, 'HH:mm:ss').minutes());
                            fromDate.setSeconds(moment(vm.searchDailyPlanFilter.fromTime, 'HH:mm:ss').seconds());
                        }
                    } else {
                        fromDate.setHours(0);
                        fromDate.setMinutes(0);
                        fromDate.setSeconds(0);

                    }
                    fromDate.setMilliseconds(0);
                    fromDate = moment.utc(fromDate);
                }
                if (vm.searchDailyPlanFilter.to) {
                    toDate = new Date(vm.searchDailyPlanFilter.to);
                    if (vm.searchDailyPlanFilter.toTime) {
                        if (vm.searchDailyPlanFilter.toTime === '24:00' || vm.searchDailyPlanFilter.toTime === '24:00:00') {
                            toDate.setDate(toDate.getDate() + 1);
                            toDate.setHours(0);
                            toDate.setMinutes(0);
                            toDate.setSeconds(0);
                        } else {
                            toDate.setHours(moment(vm.searchDailyPlanFilter.toTime, 'HH:mm:ss').hours());
                            toDate.setMinutes(moment(vm.searchDailyPlanFilter.toTime, 'HH:mm:ss').minutes());
                            toDate.setSeconds(moment(vm.searchDailyPlanFilter.toTime, 'HH:mm:ss').seconds());
                        }
                    } else {
                        toDate.setHours(0);
                        toDate.setMinutes(0);
                        toDate.setSeconds(0);

                    }
                    toDate.setMilliseconds(0);
                    toDate = moment.utc(toDate);
                }
            } else {
                if (vm.searchDailyPlanFilter.from1) {
                    fromDate = parseProcessExecuted(vm.searchDailyPlanFilter.from1);
                }
                if (vm.searchDailyPlanFilter.to1) {
                    toDate = parseProcessExecuted(vm.searchDailyPlanFilter.to1);
                }
            }
            if (!fromDate) {
                fromDate = new Date();
                fromDate.setHours(0);
                fromDate.setMinutes(0);
                fromDate.setSeconds(0);
                fromDate.setMilliseconds(0);
                fromDate = moment.utc(fromDate);
            }
            obj.dateFrom = fromDate;
            if (!toDate) {
                toDate = new Date();
                toDate.setDate(toDate.getDate() + 1);
                toDate.setHours(0);
                toDate.setMinutes(0);
                toDate.setSeconds(0);
                toDate.setMilliseconds(0);
                toDate = moment.utc(toDate);
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
                for (let i = 0; i < vm.selectedFiltered.paths.length; i++) {
                    obj.folders.push({folder: vm.selectedFiltered.paths[i], recursive: true});
                }
            }
            var fromDate;
            var toDate;

            if (vm.selectedFiltered.from) {
                fromDate = parseProcessExecuted(vm.selectedFiltered.from);
            }
            if (vm.selectedFiltered.to) {
                toDate = parseProcessExecuted(vm.selectedFiltered.to);
            }

            if (!fromDate) {
                fromDate = new Date();
                fromDate.setHours(0);
                fromDate.setMinutes(0);
                fromDate.setSeconds(0);
                fromDate.setMilliseconds(0);
                fromDate = moment.utc(fromDate);
            }
            obj.dateFrom = fromDate;
            if (!toDate) {
                toDate = new Date();
                toDate.setDate(toDate.getDate() + 1);
                toDate.setHours(0);
                toDate.setMinutes(0);
                toDate.setSeconds(0);
                toDate.setMilliseconds(0);
                toDate = moment.utc(toDate);
            }
            obj.dateTo = toDate;

            return obj;
        }

        function prepareGanttData(data2, flag) {

            var minNextStartTime;
            var maxEndTime;
            var orders = [];

            var groupJobChain = [];
            for (let i = 0; i < data2.length; i++) {

                if (groupJobChain.length > 0) {
                    let flag = false;
                    for (let j = 0; j < groupJobChain.length; j++) {
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
            for (let index = 0; index < groupJobChain.length; index++) {
                let i = 0;
                orders[index] = {};
                orders[index].tasks = [];
                for (let index1 = 0; index1 < data2.length; index1++) {
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
                        } else if (data2[index1].late) {
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
                            let s = parseInt((data2[index1].period.repeat) % 60),
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
                        } else if (data2[index1].late) {
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
                            let s = parseInt((data2[index1].period.repeat) % 60),
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
                let to = new Date(minNextStartTime);
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
            let obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;

            if (vm.selectedFiltered) {
                isCustomizationSelected(true);
                obj = applySavedFilter(obj);
                obj.jobStream = vm.selectedFiltered.jobStream;
            } else {
                obj.isJobStream = vm.dailyPlanFilters.filter.jobStream;
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
                obj.dateFrom = moment.utc(obj.dateFrom);
            }
            if (!obj.dateTo) {
                obj.dateTo = new Date();
                obj.dateTo.setDate(toDate.getDate() + 1);
                obj.dateTo.setHours(0);
                obj.dateTo.setMinutes(0);
                obj.dateTo.setSeconds(0);
                obj.dateTo.setMilliseconds(0);
                obj.dateTo = moment.utc(obj.dateTo);
            }
            vm.showSpinner = true;
            obj.timeZone = vm.userPreferences.zone;
            if ((obj.dateFrom && (typeof obj.dateFrom.getMonth === 'function' || typeof obj.dateFrom === 'object')) || (obj.dateTo && (typeof obj.dateTo.getMonth === 'function' || typeof obj.dateTo === 'object'))) {
                obj.timeZone = 'UTC';
            }
            if ((obj.dateFrom && typeof obj.dateFrom.getMonth === 'function')) {
                obj.dateFrom = moment(obj.dateFrom).tz(vm.userPreferences.zone)._d;
            }
            if ((obj.dateTo && typeof obj.dateTo.getMonth === 'function')) {
                obj.dateTo = moment(obj.dateTo).tz(vm.userPreferences.zone)._d;
            }

            DailyPlanService.getPlans(obj).then(function (res) {
                vm.plans = res.planItems;
                vm.plans = sortByKey(vm.plans, vm.dailyPlanFilters.filter.sortBy, vm.dailyPlanFilters.reverse);
                prepareGanttData(vm.plans, true);
                if (res.created) {
                    vm.maxPlannedTime = new Date(res.created.until);
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

        function sortByKey(array, key, order) {
            if (key == 'processedPlanned' || key == 'orderId') {
                return array.sort(function (x, y) {
                    let key1 = key == 'processedPlanned' ? x.orderId ? 'jobChain' : 'job' : key;
                    let a = x[key1];
                    let b = y[key1];
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

                    let AInt = parseInt(a, 10);
                    let BInt = parseInt(b, 10);

                    if (isNaN(AInt) && isNaN(BInt)) {
                        return naturalSorter(a, b);
                    } else if (isNaN(AInt)) {//A is not an Int
                        return 1;
                    } else if (isNaN(BInt)) {//B is not an Int
                        return -1;
                    } else if (AInt == BInt) {
                        let aA = a.replace(reA, "");
                        let bA = b.replace(reA, "");
                        return aA > bA ? 1 : -1;
                    } else {
                        return AInt > BInt ? 1 : -1;
                    }

                });
            } else if (key == 'duration') {
                return array.sort(function (x, y) {
                    let a = x;
                    let b = y;
                    if (!order) {
                        a = y;
                        b = x;
                    }
                    let m, n;
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
                    let a = x;
                    let b = y;
                    if (!order) {
                        a = y;
                        b = x;
                    }
                    let m = 0, n = 0;
                    if (a.startTime && a.endTime) {
                        m = moment(a.startTime).diff(a.endTime) || 0;
                    }
                    if (b.startTime && b.endTime) {
                        n = moment(b.startTime).diff(b.endTime) || 0;
                    }
                    return m > n ? 1 : -1;
                });
            } else {
                return orderBy(array, key, order);
            }
        }

        function naturalSorter(as, bs) {
            let a, b, a1, b1, i = 0, n, L,
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
            let configObj = {};
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
                    fromDate = parseProcessExecuted(vm.searchDailyPlanFilter.from1);
                }
                if (vm.searchDailyPlanFilter.to1) {
                    toDate = parseProcessExecuted(vm.searchDailyPlanFilter.to1);
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
                let configObj = {};
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

            $uibModal.open({
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
                let configObj = {};
                configObj.jobschedulerId = filter.jobschedulerId;
                configObj.account = filter.account;
                configObj.configurationType = filter.configurationType;
                configObj.objectType = filter.objectType;
                configObj.configurationItem = JSON.stringify(vm.dailyPlanFilter);
                configObj.name = vm.dailyPlanFilter.name;
                configObj.id = filter.id;
                configObj.shared = vm.dailyPlanFilter.shared;
                filter.shared = vm.dailyPlanFilter.shared;

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
            }).then(function () {
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
            }).then(function () {
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
            }).then(function () {
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
            } else {
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
                angular.forEach(vm.filterTree1, function (value) {
                    value.expanded = true;
                    if (value.folders) {
                        value.folders = orderBy(value.folders, 'name');
                    }
                });
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
                for (let i = 0; i < vm.dailyPlanFilter.paths.length; i++) {
                    if (angular.equals(vm.dailyPlanFilter.paths[i], object)) {
                        vm.dailyPlanFilter.paths.splice(i, 1);
                        break;
                    }
                }
            } else if (vm.searchDailyPlanFilter && vm.searchDailyPlanFilter.paths) {
                for (let i = 0; i < vm.searchDailyPlanFilter.paths.length; i++) {
                    if (angular.equals(vm.searchDailyPlanFilter.paths[i], object)) {
                        vm.searchDailyPlanFilter.paths.splice(i, 1);
                        break;
                    }
                }
            }
        };
        vm.$on('resetViewDate', function () {
            vm.getPlansByEvents();
        });

        var isLoaded = true;
        vm.$on('event-started', function () {
            if (vm.events && vm.events[0] && vm.events[0].eventSnapshots && vm.events[0].eventSnapshots.length > 0)
                for (let i = 0; i <= vm.events[0].eventSnapshots.length - 1; i++) {
                    if (vm.events[0].eventSnapshots[i].eventType === 'DailyPlanChanged' && isLoaded) {
                        vm.getPlansByEvents();
                        break;
                    }
                }
        });

        vm.getPlansByEvents = function () {
            isLoaded = false;

            setDateRange();
            let obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            if (vm.searchDailyPlanFilter && hitSearch) {
                obj = applySearchFilter(obj);
            } else {
                if (vm.selectedFiltered) {
                    obj = applySavedFilter(obj);
                } else {
                    obj.isJobStream = vm.dailyPlanFilters.filter.jobStream;
                    obj.dateFrom = vm.dailyPlanFilters.filter.from;
                    obj.dateTo = vm.dailyPlanFilters.filter.to;

                    if (vm.dailyPlanFilters.filter.status !== 'ALL') {
                        obj.states = [];
                        if (vm.dailyPlanFilters.filter.status === 'WAITING') {
                            obj.states.push("PLANNED");
                        } else {
                            obj.states.push(vm.dailyPlanFilters.filter.status);
                        }
                    }
                    if (vm.dailyPlanFilters.filter.state === 'LATE') {
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
                obj.dateFrom = moment.utc(obj.dateFrom);
            }
            if (!obj.dateTo) {
                obj.dateTo = new Date();
                obj.dateTo.setDate(toDate.getDate() + 1);
                obj.dateTo.setHours(0);
                obj.dateTo.setMinutes(0);
                obj.dateTo.setSeconds(0);
                obj.dateTo.setMilliseconds(0);
                obj.dateTo = moment.utc(obj.dateTo);
            }
            obj.timeZone = vm.userPreferences.zone;
            if ((obj.dateFrom && (typeof obj.dateFrom.getMonth === 'function' || typeof obj.dateFrom === 'object')) || (obj.dateTo && (typeof obj.dateTo.getMonth === 'function'  || typeof obj.dateTo === 'object'))) {
                obj.timeZone = 'UTC';
            }
            if ((obj.dateFrom && typeof obj.dateFrom.getMonth === 'function')) {
                obj.dateFrom = moment(obj.dateFrom).tz(vm.userPreferences.zone)._d;
            }
            if ((obj.dateTo && typeof obj.dateTo.getMonth === 'function')) {
                obj.dateTo = moment(obj.dateTo).tz(vm.userPreferences.zone)._d;
            }
            DailyPlanService.getPlans(obj).then(function (res) {
                vm.plans = res.planItems;
                isLoaded = true;
                vm.plans = sortByKey(vm.plans, vm.dailyPlanFilters.filter.sortBy, vm.dailyPlanFilters.reverse);
                prepareGanttData(vm.plans);
                if (res.created) {
                    vm.maxPlannedTime = new Date(res.created.until);
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
