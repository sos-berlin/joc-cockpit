/**
 * Created by sourabhagrawal on 31/05/16.
 */
(function () {
    'use strict';
    angular
        .module('app')
        .controller('JobChainCtrl', JobChainCtrl)
        .controller('JobCtrl', JobCtrl)
        .controller('JobOverviewCtrl', JobOverviewCtrl)
        .controller('JobWorkflowCtrl', JobWorkflowCtrl);

    JobChainCtrl.$inject = ["$scope", "JobChainService", "OrderService", "JobService", "UserService", "$location", "SOSAuth", "$uibModal", "orderByFilter", "ScheduleService", "SavedFilter",
        "DailyPlanService", "$rootScope", "CoreService", "$timeout", "TaskService", "$window", "AuditLogService", "$filter"];

    function JobChainCtrl($scope, JobChainService, OrderService, JobService, UserService, $location, SOSAuth, $uibModal, orderBy, ScheduleService, SavedFilter,
                          DailyPlanService, $rootScope, CoreService, $timeout, TaskService, $window, AuditLogService, $filter) {
        const vm = $scope;
        vm.jobChainFilters = CoreService.getJobChainTab();
        vm.maxEntryPerPage = vm.userPreferences.maxEntryPerPage;
        vm.jobChainFilters.isCompact = vm.userPreferences.isJobChainCompact == undefined ? vm.userPreferences.isCompact : vm.userPreferences.isJobChainCompact;

        vm.object = {};
        vm.object1 = {};
        vm.isUnique = true;
        vm.tree = [];
        vm.allJobChains = [];
        vm.filtered = [];
        vm.my_tree = {};

        vm.filter_tree = {};
        vm.filterTree1 = [];
        vm.object.paths = [];
        vm.object1.paths = [];
        vm.temp_filter = {};

        var modalInstance;
        $scope.reloadState = 'no';
        vm.selectedFiltered = null;
        if (!vm.schedulerIds.selected) {
            vm.isLoading = true;
            return;
        }
        var t1, t2;
        function resizeSidePanel() {
            t1 = $timeout(function () {
                let ht = ($('.app-header').height() || 61)
                    + ($('.top-header-bar').height() || 16)
                    + $('.sub-header').height() + 24;

                $('#leftPanel').stickySidebar({
                    sidebarTopMargin: ht
                });

            }, 0);
        }

        resizeSidePanel();

        function mergePermanentAndVolatile(sour, dest, nestedJobChain) {
            dest.numOfOrders = sour.numOfOrders;
            dest.numOfNodes = sour.numOfNodes;
            dest.state = sour.state;
            if (!dest.nodes && sour.nodes) {
                dest.nodes = sour.nodes;
                if (nestedJobChain && dest.nodes) {
                    for (let i = 0; i < dest.nodes.length; i++) {
                        if (dest.nodes[i].jobChain)
                            dest.nestedJobChains = nestedJobChain;
                    }
                }
            } else if (dest.nodes && sour.nodes) {
                for (let i = 0; i < dest.nodes.length; i++) {
                    for (let j = 0; j < sour.nodes.length; j++) {
                        if (sour.nodes[j].job && (dest.nodes[i].name === sour.nodes[j].name) && (dest.nodes[i].job.path === sour.nodes[j].job.path)) {
                            sour.nodes[j].job.processClass = dest.nodes[i].job.processClass;
                            dest.nodes[i] = sour.nodes[j];
                            sour.nodes.splice(j, 1);
                            break;
                        } else if (dest.nodes.jobChain && (dest.nodes[i].name === sour.nodes[j].name)) {
                            dest.nodes[i] = sour.nodes[j];
                            sour.nodes.splice(j, 1);
                            break;
                        } else {
                            if (dest.nodes[i].jobChain.path == sour.nodes[j].jobChain.path)
                                dest.nodes[i].jobChain.documentation = sour.nodes[j].jobChain.documentation;
                        }
                    }
                    if (dest.nodes[i].jobChain && nestedJobChain)
                        dest.nestedJobChains = nestedJobChain;
                }
            }

            dest.configurationStatus = sour.configurationStatus;
            dest.ordersSummary = sour.ordersSummary;
            dest.fileOrderSources = sour.fileOrderSources;
            return dest;
        }

        vm.savedJobChainFilter = JSON.parse(SavedFilter.jobChainFilters) || {};
        vm.jobChainFilterList = [];

        if (vm.jobChainFilters.selectedView) {
            vm.savedJobChainFilter.selected = vm.savedJobChainFilter.selected || vm.savedJobChainFilter.favorite;
        } else {
            vm.savedJobChainFilter.selected = undefined;
        }

        vm.expanding_property = {
            field: "name"
        };
        if ($location.search().scheduler_id && $location.search().path) {
            vm.checkSchedulerId();
            getJobChainByPath($location.search().path);
        } else {
            if (!vm.savedJobChainFilter.selected) {
                initTree();
            }
            checkSharedFilters();
        }

        function getJobChainByPath(path) {
            let obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;

            obj.compact = !vm.userPreferences.showOrders;
            obj.jobChains = [{jobChain: path}];
            JobChainService.getJobChainsP(obj).then(function (result) {
                vm.jobChains = result.jobChains;
                getJobChainByPathV(obj);
                vm.isLoading = true;
            }, function () {
                getJobChainByPathV(obj);
                vm.isLoading = true;
            });
        }

        function getJobChainByPathV(obj) {
            obj.maxOrders = vm.userPreferences.maxOrderPerJobchain;
            obj.compactView = vm.jobChainFilters.isCompact;
            JobChainService.get(obj).then(function (res) {
                if (vm.jobChains) {
                    vm.jobChains[0] = mergePermanentAndVolatile(res.jobChains[0], vm.jobChains[0], res.nestedJobChains);
                } else {
                    vm.jobChains = res.jobChains;
                    if (vm.jobChains && vm.jobChains.length && res.nestedJobChains)
                        vm.jobChains[0].nestedJobChains = res.nestedJobChains;
                }

                if (vm.jobChains[0].show && vm.userPreferences.showTasks) {
                    angular.forEach(vm.jobChains[0].nodes, function (val, index) {
                        if (val.job && val.job.state && val.job.state._text === 'RUNNING') {
                            JobService.get({
                                jobschedulerId: vm.schedulerIds.selected,
                                jobs: [{job: val.job.path}],
                                compactView: vm.jobChainFilters.isCompact
                            }).then(function (res1) {
                                vm.jobChains[0].nodes[index].job = _.merge(vm.jobChains[0].nodes[index].job, res1.jobs[0]);
                                updatePanelHeight();
                            });
                        }
                    });

                }
                vm.showHistory(vm.jobChains[0]);
                updatePanelHeight();
            });
        }

        function checkSharedFilters() {
            if (vm.permission.JOCConfigurations.share.view) {
                var obj = {};
                obj.jobschedulerId = vm.schedulerIds.selected;
                obj.configurationType = "CUSTOMIZATION";
                obj.objectType = "JOBCHAIN";
                obj.shared = true;
                UserService.configurations(obj).then(function (res) {
                    if (res.configurations && res.configurations.length > 0)
                        vm.jobChainFilterList = res.configurations;
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
            obj.objectType = "JOBCHAIN";
            UserService.configurations(obj).then(function (res) {

                if (vm.jobChainFilterList && vm.jobChainFilterList.length > 0) {
                    if (res.configurations && res.configurations.length > 0) {
                        vm.jobChainFilterList = vm.jobChainFilterList.concat(res.configurations);
                    }
                    let data = [];
                    for (let i = 0; i < vm.jobChainFilterList.length; i++) {
                        let flag = true;
                        for (let j = 0; j < data.length; j++) {
                            if (data[j].id === vm.jobChainFilterList[i].id) {
                                flag = false;
                            }
                        }
                        if (flag) {
                            data.push(vm.jobChainFilterList[i]);
                        }
                    }
                    vm.jobChainFilterList = data;
                } else {
                    vm.jobChainFilterList = res.configurations;
                }

                if (vm.savedJobChainFilter.selected) {
                    let flag = true;
                    angular.forEach(vm.jobChainFilterList, function (value) {
                        if (value.id === vm.savedJobChainFilter.selected) {
                            flag = false;
                            UserService.configuration({
                                jobschedulerId: value.jobschedulerId,
                                id: value.id
                            }).then(function (conf) {
                                vm.selectedFiltered = JSON.parse(conf.configuration.configurationItem);
                                vm.selectedFiltered.account = value.account;
                                initTree();
                            });
                        }
                    });
                    if (flag) {
                        vm.savedJobChainFilter.selected = undefined;
                        initTree();
                    }
                }

            }, function () {
                vm.savedJobChainFilter.selected = undefined;
            })
        }

        function isCustomizationSelected(flag) {
            if (flag) {
                vm.temp_filter.state = angular.copy(vm.jobChainFilters.filter.state);
                vm.jobChainFilters.filter.state = '';
            } else {
                if (vm.temp_filter.state)
                    vm.jobChainFilters.filter.state = angular.copy(vm.temp_filter.state);
                else
                    vm.jobChainFilters.filter.state = 'ALL';
            }
        }

        function getFilteredData(flag) {
            let tempArr = [];
            vm.reset();
            if (vm.jobChainFilters.searchText && vm.jobChainFilters.searchText !== '' && !flag) {
                tempArr = $filter('filter')(vm.allJobChains, {path: vm.jobChainFilters.searchText}, false);
                let tempArr1 = $filter('filter')(vm.allJobChains, {nodes: {$: vm.jobChainFilters.searchText}}, false);
                if (tempArr1.length > 0) {
                    angular.forEach(tempArr1, function (val) {
                        let flag = true;
                        for (let i = 0; i < tempArr.length; i++) {
                            if (tempArr[i].path === val.path) {
                                flag = false;
                                break;
                            }
                        }
                        if (flag && val.show) {
                            tempArr.push(val);
                        }
                    })
                }
            } else {
                tempArr = vm.allJobChains;
            }
            tempArr = $filter('orderBy')(tempArr, vm.jobChainFilters.filter.sortBy, vm.jobChainFilters.reverse);
            vm.totalCount = tempArr.length;
            if (vm.pageView === 'list') {
                vm.filtered = tempArr.slice((vm.userPreferences.entryPerPage * (vm.jobChainFilters.currentPage - 1)), (vm.userPreferences.entryPerPage * vm.jobChainFilters.currentPage));
            } else {
                vm.filtered = tempArr;
            }
            tempArr = [];

        }

        vm.reload = function () {
            if ($scope.reloadState == 'no') {
                $scope.allJobChains = [];
                $scope.folderPath = 'Process aborted';
                $scope.reloadState = 'yes';
                vm.jobChainFilters.expand_to = vm.tree;
            } else if ($scope.reloadState == 'yes') {
                $scope.reloadState = 'no';
                $scope.load();
            }
        };

        /**
         * Function to initialized tree view
         */
        function initTree() {
            $scope.reloadState == 'no';
            let folders = [];
            if (vm.selectedFiltered && vm.selectedFiltered.paths && vm.selectedFiltered.paths.length > 0) {
                for (let i = 0; i < vm.selectedFiltered.paths.length; i++) {
                    folders.push({folder: vm.selectedFiltered.paths[i]});
                }
            }
            if (vm.selectedFiltered) {
                isCustomizationSelected(true);
            }

            JobChainService.tree({
                jobschedulerId: vm.schedulerIds.selected,
                compact: true,
                folders: folders,
                types: ['JOBCHAIN']
            }).then(function (res) {
                if ($rootScope.expand_to) {
                    vm.tree = res.folders;
                    filteredTreeData();
                } else {
                    if (vm.isEmpty(vm.jobChainFilters.expand_to)) {
                        vm.tree = res.folders;
                        filteredTreeData();
                    } else {
                        vm.jobChainFilters.expand_to = vm.recursiveTreeUpdate(res.folders, vm.jobChainFilters.expand_to);
                        vm.tree = vm.jobChainFilters.expand_to;
                        vm.jobChainFilters.expand_to = [];
                        vm.changeStatus();
                    }
                }
                vm.jobChainFilters.expand_to = vm.tree;
                vm.isLoading = true;
            }, function () {
                vm.isLoading = true;
            });
        }

        vm.$on('reloadObject', function () {
            navFullTree();
            filteredTreeData();
        });

        vm.treeHandler = function (data) {
            vm.reset();
            if (vm.userPreferences.expandOption === 'both')
                data.expanded = true;
            navFullTree();
            if (vm.showHistoryPanel && (vm.showHistoryPanel.path1 !== data.path)) {
                vm.showHistoryPanel = '';
                vm.historyRequestObj = {};
                vm.taskHistoryRequestObj = {};
                vm.jobChainFilters.historyPanelState = {};
            }
            data.selected1 = true;
            data.jobChains = [];
            vm.allJobChains = [];
            vm.loading = true;
            expandFolderData(data);
        };
        vm.treeHandler1 = function (data) {
            if (data.expanded) {
                data.folders = orderBy(data.folders, 'name');
            }
        };
        vm.expandNode = function (data) {
            vm.reset();
            navFullTree();
            if (vm.showHistoryPanel && (vm.showHistoryPanel.path1 !== data.path)) {
                vm.showHistoryPanel = '';
                vm.historyRequestObj = {};
                vm.taskHistoryRequestObj = {};
                vm.jobChainFilters.historyPanelState = {};
            }
            vm.allJobChains = [];
            vm.loading = true;
            vm.folderPath = data.name || data.path;

            let obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.compact = true;
            if (vm.selectedFiltered) {
                obj.regex = vm.selectedFiltered.regex;
                if (vm.selectedFiltered.jobRegex) {
                    obj.job = {};
                    obj.job.regex = vm.selectedFiltered.jobRegex;
                }
                if (vm.selectedFiltered.jobs) {
                    obj.job = {};
                    obj.job.regex = vm.selectedFiltered.jobRegex;
                }
                if (vm.selectedFiltered.jobs && vm.selectedFiltered.jobs.length > 0) {
                    obj.job.folders = [];
                    for (let i = 0; i < vm.selectedFiltered.jobs.length; i++) {
                        obj.job.folders.push({folder: vm.selectedFiltered.jobs[i]});
                    }
                }
            }
            obj.folders = [];
            obj.folders.push({folder: data.path, recursive: true});
            if (vm.userPreferences.showOrders) {
                obj.compact = false;
            }
            JobChainService.getJobChainsP(obj).then(function (result) {
                for (let i = 0; i < result.jobChains.length; i++) {
                    result.jobChains[i].path1 = data.path;
                }
                vm.allJobChains = result.jobChains;
                vm.loading = false;
                getFilteredData();
                volatileInformation(obj, data, false);
            }, function () {
                volatileInformation(obj, data, false);
            });
        };

        vm.collapseNode = function (data) {
            function recursive(data) {
                data.expanded = !1;
                for (let i = 0; i < data.folders.length; i++) {
                    data.folders[i].expanded = !1;
                    if (data.folders[i].folders.length > 0) {
                        for (let j = 0; j < data.folders[i].folders.length; j++) {
                            recursive(data.folders[i].folders[j]);
                        }
                    }
                }
            }

            recursive(data);
        };

        function startTraverseNode(data) {
            function recursive(data) {
                data.expanded = true;
                data.folders = orderBy(data.folders, 'name');
                data.jobChains = [];
                for (let i = 0; i < vm.allJobChains.length; i++) {
                    if (data.path === vm.allJobChains[i].path.substring(0, vm.allJobChains[i].path.lastIndexOf('/')) || data.path === vm.allJobChains[i].path.substring(0, vm.allJobChains[i].path.lastIndexOf('/') + 1)) {
                        data.jobChains.push(vm.allJobChains[i]);
                        vm.allJobChains[i].path1 = data.path;
                    }
                }
                data.selected1 = true;
                for (let j = 0; j < data.folders.length; j++) {
                    recursive(data.folders[j]);
                }
            }

            recursive(data);
        }

        function updateDimensions() {
            let max = 0;
            $('#jobChainTableId .inner-table').find('thead th.dynamic-thead').each(function () {
                let val = $(this).width();
                max = (val > max) ? val : max;
            });
            if (max > 0) {
                $('#jobChainTableId .inner-table th.dynamic-thead').css('width', max + 'px');
            }
        }

        function mergePermanentRes(arr, obj, expandNode) {
            delete obj['folders'];
            delete obj['states'];
            obj.jobChains = arr;
            if (vm.userPreferences.showOrders) {
                obj.compact = false;
            }
            JobChainService.getJobChainsP(obj).then(function (res) {
                for (let m = 0; m < vm.allJobChains.length; m++) {
                    for (let i = 0; i < res.jobChains.length; i++) {
                        if (vm.allJobChains[m].path === res.jobChains[i].path) {
                            vm.allJobChains[m] = mergePermanentAndVolatile(vm.allJobChains[m], res.jobChains[i]);

                            if (vm.allJobChains[m].show && vm.userPreferences.showTasks) {
                                angular.forEach(vm.allJobChains[m].nodes, function (val, index) {
                                    if (val.job && val.job.state && val.job.state._text === 'RUNNING') {
                                        JobService.get({
                                            jobschedulerId: vm.schedulerIds.selected,
                                            jobs: [{job: val.job.path}],
                                            compactView: vm.jobChainFilters.isCompact
                                        }).then(function (res1) {
                                            vm.allJobChains[m].nodes[index].job = _.merge(vm.allJobChains[m].nodes[index].job, res1.jobs[0]);
                                        });
                                    }
                                });
                            }
                            res.jobChains.splice(i, 1);
                            break;
                        }
                    }
                }
                getFilteredData();
                if (!expandNode) {
                    angular.forEach(vm.tree, function (node) {
                        insertData(node, vm.allJobChains);
                    });
                } else {
                    startTraverseNode(expandNode);
                }
            });
        }

        function firstVolatileCall(obj, data) {
            if (vm.jobChainFilters.filter.state !== 'ALL') {
                obj.states = [];
                obj.states.push(vm.jobChainFilters.filter.state);
            }
            obj.compactView = vm.jobChainFilters.isCompact;
            JobChainService.get(obj).then(function (res) {
                vm.allJobChains = res.jobChains;
                let jobChainPath = [];
                for (let i = 0; i < vm.allJobChains.length; i++) {
                    vm.allJobChains[i].path1 = vm.allJobChains[i].path.substring(0, vm.allJobChains[i].path.lastIndexOf('/')) || vm.allJobChains[i].path.substring(0, vm.allJobChains[i].path.lastIndexOf('/') + 1);
                    jobChainPath.push({jobChain: vm.allJobChains[i].path});
                }
                if (res.jobChains && res.jobChains.length > 0) {
                    mergePermanentRes(jobChainPath, obj, data);
                } else {
                    getFilteredData();
                }
                vm.loading = false;
                updatePanelHeight();
            }, function () {
                vm.loading = false;
            });
        }

        function expandFolderData(data) {
            vm.folderPath = data.name || data.path;
            let obj = {
                jobschedulerId: vm.schedulerIds.selected,
                compact: true,
                folders: [{folder: data.path, recursive: false}]
            };
            if (vm.selectedFiltered) {
                obj.regex = vm.selectedFiltered.regex;
                if (vm.selectedFiltered.jobRegex) {
                    obj.job = {};
                    obj.job.regex = vm.selectedFiltered.jobRegex;
                }
                if (vm.selectedFiltered.jobs) {
                    obj.job = {};
                    obj.job.regex = vm.selectedFiltered.jobRegex;
                }
                if (vm.selectedFiltered.jobs && vm.selectedFiltered.jobs.length > 0) {
                    obj.job.folders = [];
                    for (let i = 0; i < vm.selectedFiltered.jobs.length; i++) {
                        obj.job.folders.push({folder: vm.selectedFiltered.jobs[i]});
                    }
                }

            } else {
                if (vm.jobChainFilters.filter.state !== 'ALL') {
                    if (vm.scheduleState === 'UNREACHABLE') {
                        return;
                    }
                    firstVolatileCall(obj, null);
                    return
                }
            }
            if (vm.userPreferences.showOrders) {
                obj.compact = false;
            }
            JobChainService.getJobChainsP(obj).then(function (result) {
                for (let i = 0; i < result.jobChains.length; i++) {
                    result.jobChains[i].path1 = data.path;
                }
                data.jobChains = result.jobChains;
                vm.allJobChains = result.jobChains;
                getFilteredData();
                vm.loading = false;
                vm.isLoaded = true;
                volatileInformation(obj, null, false);
            }, function () {
                vm.isLoaded = true;
                volatileInformation(obj, null, false);
            });
        }

        function navFullTree() {
            for (let i = 0; i < vm.tree.length; i++) {
                vm.tree[i].selected1 = false;
                vm.tree[i].jobChains = [];
                if (vm.tree[i].expanded) {
                    traverseTree1(vm.tree[i]);
                }
            }
        }

        function traverseTree1(data) {
            for (let i = 0; i < data.folders.length; i++) {
                data.folders[i].selected1 = false;
                data.folders[i].jobChains = [];
                if (data.folders[i].expanded) {
                    traverseTree1(data.folders[i]);
                }
            }
        }

        var count = 1, splitPath = [];

        function checkExpand(data) {
            if (data.selected1) {
                data.jobChains = [];
                expandFolderData(data);
                vm.folderPath = data.name || data.path;
            }
            if (data.folders && data.folders.length > 0) {
                data.folders = orderBy(data.folders, 'name');
                for (let x = 0; x < data.folders.length; x++) {
                    if (vm.expand_to) {
                        if (vm.flag && data.folders[x].path.substring(1, data.folders[x].path.length) === splitPath[count] && count < splitPath.length) {
                            count = count + 1;
                            splitPath[count] = splitPath[count - 1] + '/' + splitPath[count];
                            data.folders[x].expanded = true;
                            if (vm.expand_to.name === data.folders[x].name) {
                                data.folders[x].selected1 = true;
                                vm.flag = false;
                                count = 1;
                                splitPath = [];
                            }
                        }
                    }
                    checkExpand(data.folders[x]);
                    if (data.folders[x].expanded || data.folders[x].selected1) {
                        if (data.path === '/') {
                            data.selected1 = false;
                        }
                    }
                }
            }
        }

        function filteredTreeData() {
            for (let i = 0; i < vm.tree.length; i++) {
                if ($rootScope.expand_to) {
                    vm.expand_to = angular.copy($rootScope.expand_to);
                    splitPath = vm.expand_to.path.split('/');
                    $rootScope.expand_to = '';
                    vm.flag = true;
                }
                if (splitPath.length < 2) {
                    vm.tree[i].selected1 = true;
                }
                vm.tree[i].expanded = true;

                vm.allJobChains = [];
                checkExpand(vm.tree[i]);
            }
        }

        function checkExpandTreeForUpdates(data, obj, obj1) {
            if (data.selected1) {
                obj.folders.push({folder: data.path, recursive: false});
                obj1.folders.push({folder: data.path, recursive: false});
                vm.folderPath = data.name || data.path;
            }

            data.folders = orderBy(data.folders, 'name');
            angular.forEach(data.folders, function (value) {
                if (value.expanded || value.selected1)
                    checkExpandTreeForUpdates(value, obj, obj1);
            });
        }

        function insertData(node, x) {
            let _temp = angular.copy(node.jobChains);
            node.jobChains = [];
            for (let i = 0; i < x.length; i++) {
                if (node.path === x[i].path.substring(0, x[i].path.lastIndexOf('/')) || (x[i].path.substring(0, x[i].path.lastIndexOf('/') + 1) === node.path)) {
                    x[i].path1 = node.path;
                    if (_temp && _temp.length > 0) {
                        for (let j = 0; j < _temp.length; j++) {
                            if (_temp[j].path === x[i].path) {
                                x[i].show = _temp[j].show;
                                break;
                            }
                        }
                    }
                    node.jobChains.push(x[i]);
                }
            }
            angular.forEach(node.folders, function (value) {
                if (value.expanded || value.selected1)
                    insertData(value, x);
            });
        }

        function updateTreeData(expandNode, treeUpdate) {
            if (expandNode) {
                startTraverseNode(expandNode);
            }
            if (treeUpdate) {
                angular.forEach(vm.tree, function (node) {
                    insertData(node, vm.allJobChains);
                })
            }
            vm.isLoaded = false;
            updatePanelHeight();
        }

        function updatePanelHeight() {
            let rsHt = JSON.parse(SavedFilter.resizerHeight) || {};
            if ($location.search().scheduler_id && $location.search().path) {
                if (!vm.isInfoResize) {
                    _updatePanelHeight('info');
                }
            } else {
                if (rsHt.jobChain && !_.isEmpty(rsHt.jobChain)) {
                    if (rsHt.jobChain[vm.folderPath]) {
                        vm.resizerHeight = rsHt.jobChain[vm.folderPath];
                        $('#jobChainDivId').css('height', vm.resizerHeight);
                    } else {
                        _updatePanelHeight();
                    }
                } else {
                    _updatePanelHeight();
                }
            }

            setTimeout(function () {
                $('#jobChainTableId .inner-table th.dynamic-thead').css('width', 'auto');
                updateDimensions();
            }, 0);
        }

        $(window).resize(function () {
            $('#jobChainTableId .inner-table th.dynamic-thead').css('width', 'auto');
            updateDimensions();
        });

        function _updatePanelHeight(info) {
             t2 = $timeout(function () {
                let num = info ? 20 : 50;
                let ht = (parseInt($('#jobChainTableId').height()) + num);
                let el = info ? document.getElementById('jobChainInfoDivId') : document.getElementById('jobChainDivId');
                if (el && el.scrollWidth > el.clientWidth) {
                    ht = ht + 11;
                }
                if (ht > 450) {
                    ht = 450;
                }
                if (info) {
                    $('#jobChainInfoDivId').css('height', ht + 'px');
                } else {
                    vm.resizerHeight = ht + 'px';
                    $('#jobChainDivId').css('height', vm.resizerHeight);
                }
            }, 10);
        }

        function volatileInformation(obj, expandNode, treeUpdate) {
            if (vm.scheduleState === 'UNREACHABLE') {
                updateTreeData(expandNode, treeUpdate);
                return;
            }
            if (vm.selectedFiltered && vm.selectedFiltered.state) {
                obj.states = vm.selectedFiltered.state;
            } else {
                if (vm.jobChainFilters.filter.state !== 'ALL') {
                    obj.states = [];
                    obj.states.push(vm.jobChainFilters.filter.state);
                }
            }
            if (vm.userPreferences.showOrders) {
                obj.compact = false;
            }
            obj.maxOrders = vm.userPreferences.maxOrderPerJobchain;

            delete obj ['folders'];
            obj.jobChains = [];
            for (let i = 0; i < vm.filtered.length; i++) {
                if (!vm.filtered[i].state) {
                    obj.jobChains.push({jobChain: vm.filtered[i].path});
                }
            }
            if (vm.allJobChains.length === 0) {
                vm.isLoaded = false;
                return;
            }
            obj.compactView = vm.jobChainFilters.isCompact;
            JobChainService.get(obj).then(function (res) {
                if (res.jobChains.length > 0) {
                    for (let x = 0; x < vm.allJobChains.length; x++) {
                        if (vm.userPreferences.showOrders)
                            vm.allJobChains[x].show = true;
                        for (let i = 0; i < res.jobChains.length; i++) {
                            if (vm.allJobChains[x].path === res.jobChains[i].path) {
                                vm.allJobChains[x] = mergePermanentAndVolatile(res.jobChains[i], vm.allJobChains[x], res.nestedJobChains);
                                if (vm.allJobChains[x].show && vm.userPreferences.showTasks) {
                                    angular.forEach(vm.allJobChains[x].nodes, function (val, index) {
                                        if (val.job && val.job.state && val.job.state._text === 'RUNNING') {
                                            JobService.get({
                                                jobschedulerId: vm.schedulerIds.selected,
                                                jobs: [{job: val.job.path}],
                                                compactView: vm.jobChainFilters.isCompact
                                            }).then(function (res1) {
                                                vm.allJobChains[x].nodes[index].job = _.merge(vm.allJobChains[x].nodes[index].job, res1.jobs[0]);
                                                updatePanelHeight();
                                            });
                                        }
                                    });
                                }
                                res.jobChains.splice(i, 1);
                                break;
                            }
                        }
                    }
                } else {
                    if (vm.jobChainFilters.filter.state !== 'ALL') {
                        vm.allJobChains = res.jobChains;
                    }
                }

                updateTreeData(expandNode, treeUpdate);
                if (treeUpdate) {
                    for (let x = 0; x < vm.allJobChains.length; x++) {
                        if (vm.allJobChains[x].show && vm.userPreferences.showTasks) {
                            angular.forEach(vm.allJobChains[x].nodes, function (val, index) {
                                if (val.job && val.job.state && val.job.state._text === 'RUNNING') {
                                    JobService.get({
                                        jobschedulerId: vm.schedulerIds.selected,
                                        jobs: [{job: val.job.path}],
                                        compactView: vm.jobChainFilters.isCompact
                                    }).then(function (res1) {
                                        vm.allJobChains[x].nodes[index].job = _.merge(vm.allJobChains[x].nodes[index].job, res1.jobs[0]);
                                        updatePanelHeight();
                                    });
                                }
                            });
                        }
                    }
                }

                updatePanelHeight();
            }, function () {
                updateTreeData(expandNode, treeUpdate);
            });
        }

        vm.toggleCompactView = function () {
            vm.jobChainFilters.isCompact = !vm.jobChainFilters.isCompact;
            if (!vm.jobChainFilters.isCompact) {
                vm.changeStatus();
            }
            vm.userPreferences.isJobChainCompact = vm.jobChainFilters.isCompact;
            vm.saveProfileSettings(vm.userPreferences);
        };

        vm.changeStatus = function () {
            vm.reloadState = 'no';
            vm.showHistoryPanel = '';
            vm.historyRequestObj = {};
            vm.taskHistoryRequestObj = {};

            vm.allJobChains = [];
            vm.loading = true;

            let obj = {jobschedulerId: vm.schedulerIds.selected, folders: [], compact: false};
            let obj1 = {jobschedulerId: vm.schedulerIds.selected, folders: []};

            if (vm.selectedFiltered && vm.selectedFiltered.state) {
                obj.states = vm.selectedFiltered.state;
            } else {
                if (vm.jobChainFilters.filter.state !== 'ALL') {
                    obj.states = [];
                    obj.states.push(vm.jobChainFilters.filter.state);
                }
            }
            for (let i = 0; i < vm.tree.length; i++) {
                if (vm.tree[i].expanded || vm.tree[i].selected1)
                    checkExpandTreeForUpdates(vm.tree[i], obj, obj1);
            }
            obj.maxOrders = vm.userPreferences.maxOrderPerJobchain;
            if (vm.selectedFiltered) {
                obj.regex = vm.selectedFiltered.regex;
                obj1.regex = vm.selectedFiltered.regex;
                if (vm.selectedFiltered.jobRegex) {
                    obj.job = {};
                    obj.job.regex = vm.selectedFiltered.jobRegex;
                }
                if (vm.selectedFiltered.jobs) {
                    obj.job = {};
                    obj.job.regex = vm.selectedFiltered.jobRegex;
                }
                if (vm.selectedFiltered.jobs && vm.selectedFiltered.jobs.length > 0) {
                    obj.job.folders = [];
                    for (let i = 0; i < vm.selectedFiltered.jobs.length; i++) {
                        obj.job.folders.push({folder: vm.selectedFiltered.jobs[i]});
                    }
                }
                obj1.job = obj.job;
            } else {
                if (vm.jobChainFilters.filter.state !== 'ALL') {
                    if (vm.scheduleState === 'UNREACHABLE') {
                        return;
                    }
                    firstVolatileCall(obj, null);
                    return
                }
            }

            JobChainService.getJobChainsP(obj1).then(function (result) {
                for (let i = 0; i < result.jobChains.length; i++) {
                    result.jobChains[i].path1 = result.jobChains[i].path.substring(0, result.jobChains[i].path.lastIndexOf('/')) || result.jobChains[i].path.substring(0, result.jobChains[i].path.lastIndexOf('/') + 1);
                    if (vm.jobChainFilters && vm.jobChainFilters.showHistoryPanel && vm.jobChainFilters.showHistoryPanel.path === result.jobChains[i].path) {
                        let flag = vm.jobChainFilters.historyPanelState.tab;
                        vm.showHistory(result.jobChains[i], null, null, null, flag);
                    }
                }
                vm.allJobChains = result.jobChains;
                getFilteredData(true);
                vm.loading = false;
                vm.isLoaded = true;
                volatileInformation(obj, null, true);
            }, function () {
                getFilteredData();
                vm.loading = false;
                vm.isLoaded = true;
                volatileInformation(obj, null, true);
            });
        };

        vm.load = function () {
            initTree();
        };

        /**--------------- Checkbox functions -------------*/
        vm.jobChainCheckAll = {
            checkbox: false
        };

        var watcher1 = vm.$watchCollection('object.jobChains', function (newNames) {
            if (newNames && newNames.length > 0) {
                vm.jobChainCheckAll.checkbox = newNames.length === vm.filtered.slice((vm.userPreferences.entryPerPage * (vm.jobChainFilters.currentPage - 1)), (vm.userPreferences.entryPerPage * vm.jobChainFilters.currentPage)).length;
                vm.isStopped = false;
                vm.isUnstopped = false;
                angular.forEach(newNames, function (value) {
                    if (value.state && value.state._text === 'STOPPED') {
                        vm.isStopped = true;
                    } else {
                        vm.isUnstopped = true;
                    }
                    if (value.state && (value.state._text === 'UNDER_CONSTRUCTION' || value.state._text === 'NOT_INITIALIZED')) {
                        vm.isStopped = true;
                        vm.isUnstopped = true;
                    }
                });
            } else {
                vm.jobChainCheckAll.checkbox = false;
            }
        });

        var watcher3 = $scope.$watch('userPreferences.entryPerPage', function () {
            vm.reset();
        });

        vm.jobChainCheckAllFnc = function () {
            if (vm.jobChainCheckAll.checkbox && vm.allJobChains && vm.allJobChains.length > 0) {
                var _jobChain = $filter('orderBy')($scope.filtered, vm.jobChainFilters.filter.sortBy, vm.jobChainFilters.reverse);
                vm.object.jobChains = _jobChain.slice((vm.userPreferences.entryPerPage * (vm.jobChainFilters.currentPage - 1)), (vm.userPreferences.entryPerPage * vm.jobChainFilters.currentPage));

            } else {
                vm.reset();
            }
        };

        /**--------------- Actions -----------------------------*/
        vm.viewOrders = function (jobChain, state) {
            if (vm.permission.Order.view.status) {
                vm.orderFilters = CoreService.getOrderDetailTab();
                if (state)
                    vm.orderFilters.filter.state = state;
                else
                    vm.orderFilters.filter.state = 'ALL';
                SOSAuth.setJobChain(JSON.stringify(jobChain));
                SOSAuth.save();
                $location.path('/job_chain_detail/orders').search({path: jobChain.path});
            }
        };

        vm.viewFlowDiagram = function (jobChain) {
            SOSAuth.setJobChain(JSON.stringify(jobChain));
            SOSAuth.save();
            $location.path('/job_chain_detail/overview').search({path: jobChain.path});
        };


        vm.getPlan = function (calendarView, viewDate) {
            var date = "";
            if (calendarView === 'year') {
                if (viewDate.getFullYear() < new Date().getFullYear()) {
                    return;
                } else if (viewDate.getFullYear() === new Date().getFullYear()) {
                    date = "+0y";
                } else {
                    date = "+" + viewDate.getFullYear() - new Date().getFullYear() + "y";
                }
            }
            if (calendarView === 'month') {
                if (viewDate.getFullYear() <= new Date().getFullYear() && viewDate.getMonth() < new Date().getMonth()) {
                    return;
                } else if (viewDate.getFullYear() === new Date().getFullYear() && viewDate.getMonth() === new Date().getMonth()) {
                    date = "+" + viewDate.getMonth() - new Date().getMonth() + "M";
                } else {
                    date = "+" + viewDate.getMonth() - (new Date().getMonth() - (12 * (viewDate.getFullYear() - new Date().getFullYear()))) + "M";
                }
            }

            vm.planItems = [];
            vm.isCaledarLoading = true;
            DailyPlanService.getPlans({
                jobschedulerId: $scope.schedulerIds.selected,
                states: ['PLANNED'],
                jobChain: vm._jobChain.path,
                dateFrom: date,
                dateTo: date,
                timeZone: vm.userPreferences.zone
            }).then(function (res) {
                populatePlanItems(res);
                vm.isCaledarLoading = false;
            }, function () {
                vm.isCaledarLoading = false;
            });
        };

        vm.showCalendar = function (jobChain) {
            vm.maxPlannedTime = undefined;
            vm._jobChain = angular.copy(jobChain);
            vm.planItems = [];
            vm.isCaledarLoading = true;

            DailyPlanService.getPlans({
                jobschedulerId: $scope.schedulerIds.selected,
                states: ['PLANNED'],
                jobChain: jobChain.path,
                dateFrom: "+0M",
                dateTo: "+0M",
                timeZone: vm.userPreferences.zone
            }).then(function (res) {
                populatePlanItems(res);
                vm.isCaledarLoading = false;
            }, function () {
                vm.isCaledarLoading = false;
            });
            openCalendar();
        };

        function populatePlanItems(res) {
            vm.planItemData = res.planItems;
            vm.planItemData.forEach(function (data) {
                var planData = {
                    plannedStartTime: moment(data.plannedStartTime).tz(vm.userPreferences.zone),
                    orderId: data.orderId
                };
                vm.planItems.push(planData);
                if (res.created) {
                    vm.maxPlannedTime = new Date(res.created.until);
                }
            });
        }

        function openCalendar() {
            modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/calendar-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                size: 'lg',
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                vm._jobChain = null;
            }, function () {
                vm._jobChain = null;
            });
            vm.reset();
        }

        function loadJobOrderV(obj) {
            OrderService.get(obj).then(function (res) {
                var data = [];
                if (res && res.orders) {
                    if (vm.orders.length > 0 && vm.orders.length > res.orders.length) {
                        for (let x = 0; x < vm.orders.length; x++) {
                            for (let i = 0; i < res.orders.length; i++) {
                                if (vm.orders[x].path === res.orders[i].path) {
                                    vm.orders[x] = _.merge(vm.orders[x], res.orders[i]);
                                    data.push(vm.orders[x]);
                                    res.orders.splice(i, 1);
                                    break;
                                }
                            }
                        }
                        vm.orders = data;
                    } else {
                        vm.orders = res.orders;
                    }
                }
            });
        }

        function loadOrders(obj) {
            OrderService.getOrdersP(obj).then(function (result) {
                if (result && result.orders) {
                    vm.orders = result.orders;
                }
                loadJobOrderV(obj);
            }, function () {
                loadJobOrderV(obj);
            });
        }

        vm.showOrders = function (jobChain) {
            vm.jobChain = jobChain;
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.compact = true;
            obj.orders = [];
            obj.orders.push({jobChain: jobChain.path});
            loadOrders(obj);

            modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/order-list-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                size: 'lg',
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                vm.orders = null;
            }, function () {
                vm.orders = null;
            });
        };

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
                if (order.fromTime === '24:00' || order.fromTime === '24:00:00') {
                    order.fromDate.setDate(order.fromDate.getDate() + 1);
                    order.fromDate.setHours(0);
                    order.fromDate.setMinutes(0);
                    order.fromDate.setSeconds(0);
                } else {
                    order.fromDate.setHours(moment(order.fromTime, 'HH:mm:ss').hours());
                    order.fromDate.setMinutes(moment(order.fromTime, 'HH:mm:ss').minutes());
                    order.fromDate.setSeconds(moment(order.fromTime, 'HH:mm:ss').seconds());
                }
                order.fromDate.setMilliseconds(0);
            }

            if (order.fromDate && order.at === 'later') {
                obj.at = moment(order.fromDate).format("YYYY-MM-DD HH:mm:ss");
                obj.timeZone = order.timeZone;
            } else {
                obj.at = order.atTime;
            }
            if (paramObject && paramObject.params.length > 0) {
                obj.params = paramObject.params;
            }
            orders.orders.push(obj);
            orders.auditLog = {};
            if (vm.comments.comment) {
                orders.auditLog.comment = vm.comments.comment;
            }
            if (vm.comments.timeSpent) {
                orders.auditLog.timeSpent = vm.comments.timeSpent;
            }
            if (vm.comments.ticketLink) {
                orders.auditLog.ticketLink = vm.comments.ticketLink;
            }
            OrderService.addOrder(orders);
            vm.reset();
        }

        vm.addOrder = function (jobChain) {
            ScheduleService.get({
                jobschedulerId: vm.schedulerIds.selected,
                compact: true
            }).then(function (res) {
                vm.schedules = res.schedules;
            });

            vm._jobChain = angular.copy(jobChain);
            vm.comments = {};
            vm.comments.radio = 'predefined';

            JobChainService.getJobChainP({
                jobschedulerId: vm.schedulerIds.selected,
                jobChain: jobChain.path
            }).then(function (res) {
                vm._jobChain = res.jobChain;

            });

            vm.order = {};
            vm.paramObject = {};
            vm.paramObject.params = [];
            vm.order.atTime = 'now';
            vm.order.fromDate = new Date();
            vm.zones = moment.tz.names();
            if (vm.userPreferences.zone) {
                vm.order.timeZone = vm.userPreferences.zone;
            }
            modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/add-order-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                addOrder(vm.order, vm.paramObject);
            }, function () {

            });

        };
        vm.stopJobChain = function (jobChain) {
            var jobChains = {};
            jobChains.jobChains = [];
            jobChains.jobschedulerId = vm.schedulerIds.selected;
            jobChains.jobChains.push({jobChain: jobChain.path});

            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = jobChain.path;
                vm.comments.title = jobChain.title;
                vm.comments.operation = 'Stop';
                vm.comments.type = 'Job Chain';
                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    jobChains.auditLog = {};
                    if (vm.comments.comment)
                        jobChains.auditLog.comment = vm.comments.comment;

                    if (vm.comments.timeSpent)
                        jobChains.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        jobChains.auditLog.ticketLink = vm.comments.ticketLink;

                    JobChainService.stop(jobChains);
                    vm.reset();
                }, function () {

                });
            } else {
                JobChainService.stop(jobChains);
                vm.reset();
            }

        };
        vm.unstopJobChain = function (jobChain) {
            var jobChains = {};
            jobChains.jobChains = [];
            jobChains.jobschedulerId = vm.schedulerIds.selected;
            jobChains.jobChains.push({jobChain: jobChain.path});
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = jobChain.path;
                vm.comments.title = jobChain.title;
                vm.comments.operation = 'Unstop';
                vm.comments.type = 'Job Chain';
                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    jobChains.auditLog = {};
                    if (vm.comments.comment)
                        jobChains.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        jobChains.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        jobChains.auditLog.ticketLink = vm.comments.ticketLink;


                    JobChainService.unstop(jobChains);
                    vm.reset();
                }, function () {

                });
            } else {
                JobChainService.unstop(jobChains);
                vm.reset();
            }

        };
        vm.stopAll = function () {
            var jobChains = {};
            jobChains.jobChains = [];
            jobChains.jobschedulerId = vm.schedulerIds.selected;
            angular.forEach(vm.object.jobChains, function (value) {
                jobChains.jobChains.push({jobChain: value.path});
            });
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = '';
                vm.comments.operation = 'Stop';
                vm.comments.type = 'Job Chain';
                angular.forEach(vm.object.jobChains, function (value, index) {
                    if (index == vm.object.jobChains.length - 1) {
                        vm.comments.name = vm.comments.name + ' ' + value.path;
                    } else {
                        vm.comments.name = value.path + ', ' + vm.comments.name;
                    }
                });
                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    jobChains.auditLog = {};
                    if (vm.comments.comment)
                        jobChains.auditLog.comment = vm.comments.comment;

                    if (vm.comments.timeSpent)
                        jobChains.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        jobChains.auditLog.ticketLink = vm.comments.ticketLink;
                    JobChainService.stop(jobChains);
                    vm.reset();
                }, function () {

                });
            } else {
                JobChainService.stop(jobChains);
                vm.reset();
            }

        };
        vm.unstopAll = function () {
            var jobChains = {};
            jobChains.jobChains = [];
            jobChains.jobschedulerId = vm.schedulerIds.selected;

            angular.forEach(vm.object.jobChains, function (value) {
                jobChains.jobChains.push({jobChain: value.path});
            });
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = '';
                vm.comments.operation = 'Unstop';
                vm.comments.type = 'Job Chain';
                angular.forEach(vm.object.jobChains, function (value, index) {
                    if (index == vm.object.jobChains.length - 1) {
                        vm.comments.name = vm.comments.name + ' ' + value.path;
                    } else {
                        vm.comments.name = value.path + ', ' + vm.comments.name;
                    }
                });
                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    jobChains.auditLog = {};
                    if (vm.comments.comment)
                        jobChains.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        jobChains.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        jobChains.auditLog.ticketLink = vm.comments.ticketLink;
                    JobChainService.unstop(jobChains);
                    vm.reset();
                }, function () {

                });
            } else {
                JobChainService.unstop(jobChains);
                vm.reset();
            }

        };
        vm.stopNode = function (data, jobChain) {
            var nodes = {};
            nodes.nodes = [];
            nodes.jobschedulerId = $scope.schedulerIds.selected;
            nodes.nodes.push({jobChain: jobChain.path, node: data.name});
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = jobChain.path;
                vm.comments.title = jobChain.title;
                vm.comments.node = data.name;
                vm.comments.operation = 'Stop';
                vm.comments.type = 'Job Chain';

                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    nodes.auditLog = {};
                    if (vm.comments.comment)
                        nodes.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        nodes.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        nodes.auditLog.ticketLink = vm.comments.ticketLink;
                    JobService.stopNode(nodes);
                    vm.reset();
                }, function () {
                });
            } else {
                JobService.stopNode(nodes);
                vm.reset();
            }

        };
        vm.unStopNode = function (data, jobChain) {
            var nodes = {};
            nodes.nodes = [];
            nodes.jobschedulerId = $scope.schedulerIds.selected;
            nodes.nodes.push({jobChain: jobChain.path, node: data.name});
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = jobChain.path;
                vm.comments.title = jobChain.title;
                vm.comments.node = data.name;
                vm.comments.operation = 'Unstop';
                vm.comments.type = 'Job Chain';

                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    nodes.auditLog = {};
                    if (vm.comments.comment)
                        nodes.auditLog.comment = vm.comments.comment;

                    if (vm.comments.timeSpent)
                        nodes.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        nodes.auditLog.ticketLink = vm.comments.ticketLink;
                    JobService.activateNode(nodes);
                    vm.reset();
                }, function () {

                });
            } else {
                JobService.activateNode(nodes);
                vm.reset();
            }

        };
        vm.skipNode = function (data, jobChain) {
            var nodes = {};
            nodes.nodes = [];
            nodes.jobschedulerId = $scope.schedulerIds.selected;
            nodes.nodes.push({jobChain: jobChain.path, node: data.name});
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = jobChain.path;
                vm.comments.title = jobChain.title;
                vm.comments.node = data.name;
                vm.comments.operation = 'Skip';
                vm.comments.type = 'Job Chain';

                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    nodes.auditLog = {};
                    if (vm.comments.comment)
                        nodes.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        nodes.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        nodes.auditLog.ticketLink = vm.comments.ticketLink;
                    JobService.skipNode(nodes);
                    vm.reset();
                }, function () {

                });
            } else {
                JobService.skipNode(nodes);
                vm.reset();
            }

        };
        vm.unskipNode = function (data, jobChain) {
            var nodes = {};
            nodes.nodes = [];
            nodes.jobschedulerId = $scope.schedulerIds.selected;
            nodes.nodes.push({jobChain: jobChain.path, node: data.name});
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = jobChain.path;
                vm.comments.title = jobChain.title;
                vm.comments.node = data.name;
                vm.comments.operation = 'Unskip';
                vm.comments.type = 'Job Chain';

                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    nodes.auditLog = {};
                    if (vm.comments.comment)
                        nodes.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        nodes.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        nodes.auditLog.ticketLink = vm.comments.ticketLink;
                    JobService.activateNode(nodes);
                    vm.reset();
                }, function () {

                });
            } else {
                JobService.activateNode(nodes);
                vm.reset();
            }

        };
        vm.stopJob = function (data) {
            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = $scope.schedulerIds.selected;
            jobs.jobs.push({job: data.job.path});
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = data.job.path;
                vm.comments.title = data.job.title;
                vm.comments.operation = 'Stop';
                vm.comments.type = 'Job';

                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    jobs.auditLog = {};
                    if (vm.comments.comment)
                        jobs.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        jobs.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        jobs.auditLog.ticketLink = vm.comments.ticketLink;
                    JobService.stop(jobs);
                    vm.reset();
                }, function () {

                });
            } else {
                JobService.stop(jobs);
                vm.reset();
            }

        };
        vm.unstopJob = function (data) {
            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = $scope.schedulerIds.selected;
            jobs.jobs.push({job: data.job.path});
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = data.job.path;
                vm.comments.title = data.job.title;
                vm.comments.operation = 'Unstop';
                vm.comments.type = 'Job';

                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    jobs.auditLog = {};
                    if (vm.comments.comment)
                        jobs.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        jobs.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        jobs.auditLog.ticketLink = vm.comments.ticketLink;
                    JobService.unstop(jobs);
                    vm.reset();
                }, function () {

                });
            } else {
                JobService.unstop(jobs);
                vm.reset();
            }
        };
        vm.end = function (task, path) {
            var jobs = {};
            jobs.jobs = [];
            var taskIds = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            taskIds.push({taskId: task.taskId});
            jobs.jobs.push({job: path, taskIds: taskIds});
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = path;
                vm.comments.task = task.taskId;
                vm.comments.operation = 'End Task';
                vm.comments.type = 'Job';

                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    jobs.auditLog = {};
                    if (vm.comments.comment)
                        jobs.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        jobs.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        jobs.auditLog.ticketLink = vm.comments.ticketLink;
                    TaskService.end(jobs);
                    vm.reset();
                }, function () {

                });
            } else {
                TaskService.end(jobs);
                vm.reset();
            }

        };
        vm.killTask = function (task, path) {
            var jobs = {};
            jobs.jobs = [];
            var taskIds = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            taskIds.push({taskId: task.taskId});
            jobs.jobs.push({job: path, taskIds: taskIds});
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = path;
                vm.comments.task = task.taskId;
                vm.comments.operation = 'Kill Task';
                vm.comments.type = 'Job';

                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    jobs.auditLog = {};
                    if (vm.comments.comment)
                        jobs.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        jobs.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        jobs.auditLog.ticketLink = vm.comments.ticketLink;
                    TaskService.kill(jobs);
                    vm.reset();
                }, function () {

                });
            } else {
                TaskService.kill(jobs);
                vm.reset();
            }


        };
        vm.terminateTask = function (task, path) {
            var jobs = {};
            jobs.jobs = [];
            var taskIds = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            taskIds.push({taskId: task.taskId});
            jobs.jobs.push({job: path, taskIds: taskIds});
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = path;
                vm.comments.task = task.taskId;
                vm.comments.operation = 'Terminate Task';
                vm.comments.type = 'Job';

                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    jobs.auditLog = {};
                    if (vm.comments.comment)
                        jobs.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        jobs.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        jobs.auditLog.ticketLink = vm.comments.ticketLink;
                    TaskService.terminate(jobs);
                    vm.reset();
                }, function () {

                });
            } else {
                TaskService.terminate(jobs);
                vm.reset();
            }

        };

        function terminateTaskWithTimeout(job, task, path) {
            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            if (!task) {
                if (!job) {
                    angular.forEach(vm.object.jobs, function (value) {
                        jobs.jobs.push({job: value.path});
                    });
                } else {
                    jobs.jobs.push({job: job.path});
                }
            } else {
                let taskIds = [];
                taskIds.push({taskId: task.taskId});
                jobs.jobs.push({job: path, taskIds: taskIds});
            }
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

            jobs.timeout = vm.timeObj.timeout;
            TaskService.terminateWith(jobs);
        }

        vm.terminateTaskWithTimeout = function (job, task, path) {
            if (job) {
                vm.job = job;
            } else if (task && path) {
                vm.task = task;
                vm.path = path;
            } else {
                vm.taskJobs = vm.object.jobs;
            }
            vm.comments = {};
            vm.comments.radio = 'predefined';
            vm.timeObj = {};
            vm.timeObj.timeout = 10;

            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/terminate-task-timeout-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                terminateTaskWithTimeout(job, task, path);
                vm.reset();
            }, function () {

            });
        };

        function updateListForDocmentation(path, doc, isReversed) {
            angular.forEach(vm.allJobChains, function (value, index) {
                if (value.path === path && !isReversed) {
                    vm.allJobChains[index].documentation = doc;
                } else {
                    if (value.show) {
                        angular.forEach(vm.allJobChains[index].nodes, function (val, i) {
                            if (val.jobChain) {
                                if (val.jobChain.path === path)
                                    vm.allJobChains[index].nodes[i].jobChain.documentation = doc;
                            }
                        });
                    }
                }
            })
        }

        function updateNodeListForDocmentation(job, path, doc, isReversed) {
            angular.forEach(vm.allJobChains, function (value, index) {
                if (value.show) {
                    if (!isReversed && value.path === path) {
                        angular.forEach(vm.allJobChains[index].nodes, function (val, i) {
                            vm.allJobChains[index].nodes[i].job.documentation = doc;
                        });
                    } else if (value.path !== path && value.nestedJobChains) {
                        angular.forEach(vm.allJobChains[index].nestedJobChains, function (val, i) {
                            if (val.path === path) {
                                angular.forEach(val.nodes, function (val1, j) {
                                    vm.allJobChains[index].nestedJobChains[i].nodes[j].job.documentation = doc;
                                });
                            }
                        });
                    }
                }

            })
        }

        vm.assignedDocumentJobChain = function (jobChain, isNested) {
            vm.assignObj = {
                type: 'Job Chain',
                path: jobChain.path,
            };
            let obj = {jobschedulerId: vm.schedulerIds.selected, jobChain: jobChain.path};
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
                JobChainService.assign(obj).then(function (res) {
                    jobChain.documentation = vm.assignObj.documentation;
                    if (isNested) {
                        updateListForDocmentation(jobChain.path, vm.assignObj.documentation);
                    } else {
                        updateListForDocmentation(jobChain.path, vm.assignObj.documentation, 'reverse');
                    }
                });
            }, function () {

            });
        };

        vm.assignedDocumentJob = function (job, nestedJobChain, isNested) {
            vm.assignObj = {
                type: 'Job',
                path: job.path,
            };
            let obj = {jobschedulerId: vm.schedulerIds.selected, job: job.path};
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
                JobService.assign(obj).then(function (res) {
                    job.documentation = vm.assignObj.documentation;
                    if (isNested) {
                        updateNodeListForDocmentation(job, nestedJobChain.path, vm.assignObj.documentation);
                    } else {
                        updateNodeListForDocmentation(job, nestedJobChain.path, vm.assignObj.documentation, 'reverse');
                    }
                });
            }, function () {

            });
        };

        vm.getDocumentTreeStructure = function () {
            $rootScope.$broadcast('initTree');
        };

        vm.$on('closeDocumentTree', function (evn, path) {
            if (vm.assignObj)
                vm.assignObj.documentation = path;
        });

        vm.unassignedDocumentJobChain = function (jobChain, isNested) {
            vm.assignObj = {};
            let obj = {jobschedulerId: vm.schedulerIds.selected, jobChain: jobChain.path};
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = jobChain.path;
                vm.comments.operation = 'Unassign Documentation';
                vm.comments.type = 'Job Chain';

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
                    JobChainService.unassign(obj).then(function () {
                        jobChain.documentation = undefined;
                        if (isNested) {
                            updateListForDocmentation(jobChain.path);
                        } else {
                            updateListForDocmentation(jobChain.path, null, 'reverse');
                        }
                    });
                }, function () {

                });
            } else {
                JobChainService.unassign(obj).then(function () {
                    jobChain.documentation = undefined;
                    if (isNested) {
                        updateListForDocmentation(jobChain.path);
                    } else {
                        updateListForDocmentation(jobChain.path, null, 'reverse');
                    }
                });
            }
        };

        vm.unassignedDocumentJob = function (job, nestedJobChain, isNested) {
            vm.assignObj = {};
            let obj = {jobschedulerId: vm.schedulerIds.selected, job: job.path};
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = job.path;
                vm.comments.operation = 'Unassign Documentation';
                vm.comments.type = 'Job';

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
                    JobService.unassign(obj).then(function () {
                        job.documentation = undefined;
                        if (isNested) {
                            updateNodeListForDocmentation(job, nestedJobChain.path, null);
                        } else {
                            updateNodeListForDocmentation(job, nestedJobChain.path, null, 'reverse');
                        }
                    });
                }, function () {

                });
            } else {
                JobService.unassign(obj).then(function () {
                    job.documentation = undefined;
                    if (isNested) {
                        updateNodeListForDocmentation(job, nestedJobChain.path, null);
                    } else {
                        updateNodeListForDocmentation(job, nestedJobChain.path, null, 'reverse');
                    }
                });
            }
        };

        vm.reset = function () {
            vm.jobChainCheckAll.checkbox = false;
            vm.object.jobChains = [];
        };

        vm.exportToExcel = function () {
            $('#exportToExcelBtn').attr("disabled", true);
            if (!vm.isIE()) {
                $('#jobChainTableId').table2excel({
                    exclude: ".tableexport-ignore",
                    filename: "jobscheduler-jobchain",
                    fileext: ".xls",
                    exclude_img: false,
                    exclude_links: false,
                    exclude_inputs: false
                });
            } else {
                var ExportButtons = document.getElementById('jobChainTableId');
                var instance = new TableExport(ExportButtons, {
                    formats: ['xlsx'],
                    exportButtons: false
                });
                var exportData = instance.getExportData()['jobChainTableId']['xlsx'];
                instance.export2file(exportData.data, exportData.mimeType, "jobscheduler-jobchain", exportData.fileExtension);
            }
            $('#exportToExcelBtn').attr("disabled", false);
        };

        /**---------------filtering, sorting and pagination -------------------*/

        vm.pageChange = function () {
            getFilteredData();
            callVolatileInformation();
        };

        vm.sortBy = function (propertyName) {
            vm.jobChainFilters.reverse = !vm.jobChainFilters.reverse;
            vm.jobChainFilters.filter.sortBy = propertyName;
            if (propertyName === 'name' || propertyName === 'path') {
                getFilteredData();
                callVolatileInformation();
            } else {
                callVolatileInformation(true);
            }
        };

        vm.searchInResult = function () {
            getFilteredData();
            callVolatileInformation();
        };
        vm.setEntryPerPage = function (num) {
            vm.userPreferences.entryPerPage = num;
            getFilteredData();
            callVolatileInformation();
        };

        function callVolatileInformation(all) {
            if (vm.scheduleState === 'UNREACHABLE' || vm.jobChainFilters.filter.state !== 'ALL') {
                return;
            }
            let obj = {jobschedulerId: vm.schedulerIds.selected};
            obj.jobChains = [];
            let arr = [];
            let isFiltered = true;
            if (vm.jobChainFilters.filter.sortBy === 'name' || vm.jobChainFilters.filter.sortBy === 'path') {
                arr = all ? vm.jobChains : vm.filtered;
                isFiltered = !all;
            } else {
                isFiltered = false;
                arr = vm.allJobChains;
            }

            for (let i = 0; i < arr.length; i++) {
                if (!arr[i].state) {
                    obj.jobChains.push({jobChain: arr[i].path});
                }
            }
            if (obj.jobChains.length > 0) {
                vm.isLoaded = true;
                obj.compactView = vm.jobChainFilters.isCompact;
                JobChainService.get(obj).then(function (res) {
                    for (let x = 0; x < vm.allJobChains.length; x++) {
                        for (let i = 0; i < res.jobChains.length; i++) {
                            if (vm.allJobChains[x].path === res.jobChains[i].path) {
                                vm.allJobChains[x] = mergePermanentAndVolatile(res.jobChains[i], vm.allJobChains[x], res.nestedJobChains);
                                if (vm.allJobChains[x].show && vm.userPreferences.showTasks) {
                                    angular.forEach(res.jobChains[i].nodes, function (val, index) {
                                        if (val.job && val.job.state && val.job.state._text === 'RUNNING') {
                                            JobService.get({
                                                jobschedulerId: vm.schedulerIds.selected,
                                                jobs: [{job: val.job.path}],
                                                compactView: vm.jobChainFilters.isCompact
                                            }).then(function (res1) {
                                                vm.allJobChains[x].nodes[index].job = _.merge(vm.allJobChains[x].nodes[index].job, res1.jobs[0]);
                                                updatePanelHeight();
                                            });
                                        }
                                    });
                                }
                                res.jobChains.splice(i, 1);
                                break;
                            }
                        }
                    }

                    if (!isFiltered) {
                        getFilteredData();
                    }
                    vm.isLoaded = false;
                }, function () {
                    if (!isFiltered) {
                        getFilteredData();
                    }
                    vm.isLoaded = false;
                });
            } else {
                if (!isFiltered) {
                    getFilteredData();
                }
            }
        }

        vm.saveAsFilter = function (form) {
            var configObj = {};
            configObj.jobschedulerId = vm.schedulerIds.selected;
            configObj.account = vm.permission.user;
            configObj.configurationType = "CUSTOMIZATION";
            configObj.objectType = "JOBCHAIN";
            configObj.name = vm.jobChainFilter.name;
            configObj.id = 0;

            configObj.configurationItem = JSON.stringify(vm.jobChainFilter);
            UserService.saveConfiguration(configObj).then(function (res) {
                configObj.id = res.id;
                vm.jobChainFilter.name = '';
                if (form)
                    form.$setPristine();

                vm.jobChainFilterList.push(configObj);
            })
        };
        vm.advancedSearch = function () {
            vm.jobChainFilter = {};
            vm.isUnique = true;
            vm.showSearchPanel = true;
            vm.isSearchHit = false;
        };
        vm.cancel = function (form) {
            vm.showSearchPanel = false;
            vm.jobChainFilter = {};
            if (form)
                form.$setPristine();
            if (vm.isSearchHit) {
                vm.isSearchHit = false;
                vm.changeStatus();
            }
        };

        function searchV(obj, allJobChains) {
            if (vm.jobChainFilter && vm.jobChainFilter.state) {
                obj.states = vm.jobChainFilter.state;
            }
            if (vm.userPreferences.showOrders) {
                obj.compact = false;
            }
            obj.maxOrders = vm.userPreferences.maxOrderPerJobchain;
            obj.compactView = vm.jobChainFilters.isCompact;
            JobChainService.get(obj).then(function (res) {
                let data = [];
                if (allJobChains && allJobChains.length > 0) {
                    if (res.jobChains.length > 0) {
                        for (let x = 0; x < allJobChains.length; x++) {
                            if (vm.userPreferences.showOrders)
                                allJobChains[x].show = true;
                            for (let i = 0; i < res.jobChains.length; i++) {
                                if (allJobChains[x].path === res.jobChains[i].path) {
                                    allJobChains[x] = _.merge(allJobChains[x], res.jobChains[i]);
                                    allJobChains[x].path1 = allJobChains[x].path.substring(0, allJobChains[x].path.lastIndexOf('/')) || allJobChains[x].path.substring(0, allJobChains[x].path.lastIndexOf('/') + 1);
                                    data.push(allJobChains[x]);
                                    res.jobChains.splice(i, 1);
                                    break;
                                }
                            }

                            if (allJobChains[x].show && vm.userPreferences.showTasks) {
                                angular.forEach(allJobChains[x].nodes, function (val, index) {
                                    if (val.job && val.job.state && val.job.state._text === 'RUNNING') {
                                        JobService.get({
                                            jobschedulerId: vm.schedulerIds.selected,
                                            jobs: [{job: val.job.path}],
                                            compactView: vm.jobChainFilters.isCompact
                                        }).then(function (res1) {
                                            allJobChains[x].nodes[index].job = _.merge(allJobChains[x].nodes[index].job, res1.jobs[0]);
                                        });
                                    }
                                });
                            }
                        }
                    }
                } else if (res.jobChains && res.jobChains.length) {
                    for (let x = 0; x < res.jobChains.length; x++) {
                        if (vm.userPreferences.showOrders)
                            res.jobChains[x].show = true;
                        res.jobChains[x].path1 = res.jobChains[x].path.substring(0, res.jobChains[x].path.lastIndexOf('/')) || res.jobChains[x].path.substring(0, res.jobChains[x].path.lastIndexOf('/') + 1);
                        data.push(res.jobChains[x]);
                    }
                }
                vm.allJobChains = data;
                if (vm.allJobChains.length == 0) {
                    vm.hideHistory();
                }
                vm.isLoaded = false;
                getFilteredData();
                traverseTreeForSearchData();
                updatePanelHeight();
            }, function () {
                let data = [];

                for (let x = 0; x < allJobChains.length; x++) {
                    if (vm.userPreferences.showOrders)
                        allJobChains[x].show = true;
                    allJobChains[x].path1 = allJobChains[x].path.substring(0, allJobChains[x].path.lastIndexOf('/')) || allJobChains[x].path.substring(0, allJobChains[x].path.lastIndexOf('/') + 1);
                    data.push(allJobChains[x]);

                }
                vm.allJobChains = data;
                vm.isLoaded = false;
                getFilteredData();
                traverseTreeForSearchData();
                updatePanelHeight();
            });
        }

        vm.search = function () {
            vm.isLoaded = true;
            vm.isSearchHit = true;
            let obj = {
                jobschedulerId: vm.schedulerIds.selected,
                compact: true
            };
            if (vm.jobChainFilter && vm.jobChainFilter.regex) {
                obj.regex = vm.jobChainFilter.regex;
            }
            if (vm.jobChainFilter && vm.jobChainFilter.paths && vm.jobChainFilter.paths.length > 0) {
                obj.folders = [];
                for (let i = 0; i < vm.jobChainFilter.paths.length; i++) {
                    obj.folders.push({folder: vm.jobChainFilter.paths[i], recursive: true});
                }
            }
            if (vm.jobChainFilter.jobRegex) {
                obj.job = {};
                obj.job.regex = vm.jobChainFilter.jobRegex;
            }
            if (vm.jobChainFilter.jobs && vm.jobChainFilter.jobs.length > 0) {
                if (!obj.job) {
                    obj.job = {};
                }
                obj.job.folders = [];
                for (let i = 0; i < vm.jobChainFilter.jobs.length; i++) {
                    obj.job.folders.push({folder: vm.jobChainFilter.jobs[i], recursive: true});
                }
            }
            if (vm.userPreferences.showOrders) {
                obj.compact = false;
            }
            vm.folderPath = '/';
            JobChainService.getJobChainsP(obj).then(function (result) {
                searchV(obj, result.jobChains);
            }, function () {
                vm.allJobChains = [];
                searchV(obj, []);
            });
        };

        function traverseTreeForSearchData() {
            function traverseTree1(data) {
                for (let i = 0; i < data.folders.length; i++) {
                    data.folders[i].selected1 = false;
                    data.folders[i].expanded = true;
                    data.folders[i].jobChains = [];
                    pushJobChain(data.folders[i]);
                    traverseTree1(data.folders[i]);
                }
            }

            function navFullTree() {
                for (let i = 0; i < vm.tree.length; i++) {
                    vm.tree[i].selected1 = true;
                    vm.tree[i].expanded = true;
                    vm.tree[i].jobChains = [];
                    pushJobChain(vm.tree[i]);
                    traverseTree1(vm.tree[i]);
                }
            }

            function pushJobChain(data) {
                for (let i = 0; i < vm.allJobChains.length; i++) {
                    if (data.path === vm.allJobChains[i].path1) {
                        data.selected1 = true;
                        data.jobChains.push(vm.allJobChains[i]);
                    }
                }
            }

            navFullTree();
        }

        vm.applyFilter = function () {
            vm.cancel();
            vm.jobChainFilter = {};
            vm.isUnique = true;
            modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/jobchain-filter-dialog.html',
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
                configObj.objectType = "JOBCHAIN";
                configObj.name = vm.jobChainFilter.name;
                configObj.id = 0;
                configObj.shared = vm.jobChainFilter.shared;

                configObj.configurationItem = JSON.stringify(vm.jobChainFilter);
                UserService.saveConfiguration(configObj).then(function (res) {
                    configObj.id = res.id;
                    vm.jobChainFilterList.push(configObj);

                    if (vm.jobChainFilterList.length == 1) {
                        vm.savedJobChainFilter.selected = res.id;
                        vm.jobChainFilters.selectedView = true;
                        vm.selectedFiltered = vm.jobChainFilter;
                        vm.selectedFiltered.account = vm.permission.user;
                        isCustomizationSelected(true);
                        SavedFilter.setJobChain(vm.savedJobChainFilter);
                        SavedFilter.save();
                        vm.load();
                    }
                })
            }, function () {

            });
        };
        vm.editFilters = function () {
            vm.filters = {};
            vm.filters.list = vm.jobChainFilterList;
            vm.filters.favorite = vm.savedJobChainFilter.favorite;
            modalInstance = $uibModal.open({
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
            temp_name = angular.copy(filter.name);
            UserService.configuration({jobschedulerId: filter.jobschedulerId, id: filter.id}).then(function (conf) {
                vm.jobChainFilter = JSON.parse(conf.configuration.configurationItem);
                vm.jobChainFilter.shared = filter.shared;
                vm.paths = vm.jobChainFilter.paths;
                vm.jobPaths = vm.jobChainFilter.jobs;
                vm.object.paths = vm.paths;
                vm.object1.paths = vm.jobPaths;
            });

            modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/edit-jobchain-filter-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                size: 'lg',
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                if (vm.savedJobChainFilter.selected === filter.id) {
                    vm.selectedFiltered = vm.jobChainFilter;
                    vm.jobChainFilters.selectedView = true;
                    isCustomizationSelected(true);
                    vm.load();
                }
                var configObj = {};
                configObj.jobschedulerId = filter.jobschedulerId;
                configObj.account = filter.account;
                configObj.configurationType = filter.configurationType;
                configObj.objectType = filter.objectType;
                configObj.configurationItem = JSON.stringify(vm.jobChainFilter);
                configObj.name = vm.jobChainFilter.name;
                configObj.id = filter.id;
                configObj.shared = vm.jobChainFilter.shared;
                filter.shared = vm.jobChainFilter.shared;

                UserService.saveConfiguration(configObj);
                filter.name = vm.jobChainFilter.name;
                temp_name = '';
            }, function () {
                temp_name = '';
            });
        };
        vm.copyFilter = function (filter) {
            vm.action = 'copy';
            vm.isUnique = true;
            UserService.configuration({jobschedulerId: filter.jobschedulerId, id: filter.id}).then(function (conf) {
                vm.jobChainFilter = JSON.parse(conf.configuration.configurationItem);
                vm.jobChainFilter.shared = filter.shared;
                vm.paths = vm.jobChainFilter.paths;
                vm.jobPaths = vm.jobChainFilter.jobs;
                vm.object.paths = vm.paths;
                vm.object1.paths = vm.jobPaths;
                vm.jobChainFilter.name = vm.checkCopyName(vm.jobChainFilterList, filter.name)
            });

            modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/edit-jobchain-filter-dialog.html',
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
                configObj.objectType = "JOBCHAIN";
                configObj.name = vm.jobChainFilter.name;
                configObj.shared = vm.jobChainFilter.shared;
                configObj.id = 0;

                configObj.configurationItem = JSON.stringify(vm.jobChainFilter);
                UserService.saveConfiguration(configObj).then(function (res) {
                    configObj.id = res.id;
                    vm.jobChainFilterList.push(configObj);
                });

            }, function () {

            });
        };
        vm.deleteFilter = function (filter) {
            UserService.deleteConfiguration({
                jobschedulerId: filter.jobschedulerId,
                id: filter.id
            }).then(function () {
                angular.forEach(vm.jobChainFilterList, function (value, index) {
                    if (value.id == filter.id) {
                        vm.jobChainFilterList.splice(index, 1);
                    }
                });

                if (vm.savedJobChainFilter.selected == filter.id) {
                    vm.savedJobChainFilter.selected = undefined;
                    vm.jobChainFilters.selectedView = false;
                    vm.selectedFiltered = undefined;
                    isCustomizationSelected(false);
                    vm.load();
                } else {
                    if (vm.jobChainFilterList.length == 0) {
                        vm.savedJobChainFilter.selected = undefined;
                        vm.jobChainFilters.selectedView = false;
                        vm.selectedFiltered = undefined;
                        isCustomizationSelected(false);
                    }
                }
                SavedFilter.setJobChain(vm.savedJobChainFilter);
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
                    angular.forEach(vm.jobChainFilterList, function (value, index) {
                        if (value.id == configObj.id) {
                            vm.jobChainFilterList.splice(index, 1);
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
            vm.savedJobChainFilter.favorite = filter.id;
            vm.filters.favorite = filter.id;
            vm.jobChainFilters.selectedView = true;
            SavedFilter.setJobChain(vm.savedJobChainFilter);
            SavedFilter.save();
            vm.load();
        };
        vm.removeFavorite = function () {
            vm.savedJobChainFilter.favorite = '';
            vm.filters.favorite = '';
            SavedFilter.setJobChain(vm.savedJobChainFilter);
            SavedFilter.save();
        };
        vm.checkFilterName = function () {
            vm.isUnique = true;
            angular.forEach(vm.jobChainFilterList, function (value) {
                if (vm.jobChainFilter.name == value.name && vm.permission.user == value.account && vm.jobChainFilter.name != temp_name) {
                    vm.isUnique = false;
                }
            })
        };
        vm.changeFilter = function (filter) {
            vm.cancel();
            if (filter) {
                vm.savedJobChainFilter.selected = filter.id;
                vm.jobChainFilters.selectedView = true;
                UserService.configuration({jobschedulerId: filter.jobschedulerId, id: filter.id}).then(function (conf) {
                    vm.selectedFiltered = JSON.parse(conf.configuration.configurationItem);
                    vm.selectedFiltered.account = filter.account;
                    if (vm.selectedFiltered.paths) {
                        vm.jobChainFilters.expand_to = {};
                    }
                    vm.load();
                });
            } else {
                isCustomizationSelected(false);
                vm.savedJobChainFilter.selected = filter;
                vm.jobChainFilters.selectedView = false;
                vm.selectedFiltered = filter;
                vm.load();
            }

            SavedFilter.setJobChain(vm.savedJobChainFilter);
            SavedFilter.save();

        };
        vm.type = '';
        vm.getTreeStructure = function (type) {
            vm.type = type;
            JobChainService.tree({
                jobschedulerId: vm.schedulerIds.selected,
                compact: true,
                types: type == 'job' ? ['JOB'] : ['JOBCHAIN']
            }).then(function (res) {
                vm.filterTree1 = res.folders;
                angular.forEach(vm.filterTree1, function (value) {
                    value.expanded = true;
                    if (value.folders) {
                        value.folders = orderBy(value.folders, 'name');
                    }
                });
            }, function () {
                if (type == 'job') {
                    $('#treeModal1').modal('hide');
                } else {
                    $('#treeModal').modal('hide');
                }
            });
            if (type == 'job') {
                $('#treeModal1').modal('show');
            } else {
                $('#treeModal').modal('show');
            }
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

        vm.treeExpand1 = function (data) {
            angular.forEach(vm.object1.paths, function (value) {
                if (data.path == value) {
                    if (data.folders.length > 0) {
                        data.folders = orderBy(data.folders, 'name');
                        angular.forEach(data.folders, function (res) {
                            vm.object1.paths.push(res.path);
                        });
                    }
                }
            });
        };

        var watcher4 = $scope.$watchCollection('object.paths', function (newNames) {
            if (newNames && newNames.length > 0) {
                vm.paths = newNames;
            }
        });

        var watcher5 = $scope.$watchCollection('object1.paths', function (newNames) {
            if (newNames && newNames.length > 0) {
                vm.jobPaths = newNames;
            }
        });

        vm.addJobChainPaths = function () {
            if (vm.type == 'job') {
                vm.jobChainFilter.jobs = vm.jobPaths;
            } else {
                vm.jobChainFilter.paths = vm.paths;
            }
        };

        vm.remove = function (object) {
            for (let i = 0; i < vm.jobChainFilter.paths.length; i++) {
                if (angular.equals(vm.jobChainFilter.paths[i], object)) {
                    vm.jobChainFilter.paths.splice(i, 1);
                    break;
                }
            }
        };

        vm.remove1 = function (object) {
            for (let i = 0; i < vm.jobChainFilter.jobs.length; i++) {
                if (angular.equals(vm.jobChainFilter.jobs[i], object)) {
                    vm.jobChainFilter.jobs.splice(i, 1);
                    break;
                }
            }
        };

        vm.hidePanel = function () {
            $('#rightPanel1').addClass('m-l-0 fade-in');
            $('#rightPanel1').find('.parent .child').removeClass('col-xxl-3 col-lg-4').addClass('col-xxl-2 col-lg-3');
            $('#leftPanel').hide();
            $('.sidebar-btn').show();
        };

        vm.showLeftPanel = function () {
            $('#rightPanel1').removeClass('fade-in m-l-0');
            $('#rightPanel1').find('.parent .child').addClass('col-xxl-3 col-lg-4').removeClass('col-xxl-2 col-lg-3');
            $('#leftPanel').show();
            $('.sidebar-btn').hide();
        };

        function traverseToSelectedJobChain(data, jobChain) {
            function recursive(data) {
                if (data.path === jobChain.path1 && data.jobChains && data.jobChains.length > 0) {
                    for (let index = 0; index < data.jobChains.length; index++) {
                        if (jobChain.path === data.jobChains[index].path) {
                            data.jobChains[index] = jobChain;
                        }
                    }
                }
                for (let i = 0; i < data.folders.length; i++) {
                    if (data.folders[i].path.match(jobChain.path1) || jobChain.path1.match(data.folders[i].path)) {
                        recursive(data.folders[i]);
                    }
                }
            }

            recursive(data);
        }

        vm.showNodePanelFuc = showNodePanelFuc;

        function showNodePanelFuc(jobChain) {
            jobChain.show = true;
            JobChainService.getJobChainP({
                jobschedulerId: vm.schedulerIds.selected,
                jobChain: jobChain.path
            }).then(function (result) {
                jobChain.nodes = [];
                jobChain = _.merge(jobChain, result.jobChain);
                JobChainService.getJobChain({
                    jobschedulerId: vm.schedulerIds.selected,
                    jobChain: jobChain.path,
                    maxOrders: vm.userPreferences.maxOrderPerJobchain,
                    compactView: vm.jobChainFilters.isCompact
                }).then(function (res) {
                    jobChain = mergePermanentAndVolatile(res.jobChain, jobChain, res.nestedJobChains);
                    if (vm.userPreferences.showTasks) {
                        angular.forEach(jobChain.nodes, function (val, index) {
                            if (val.job && val.job.state && val.job.state._text === 'RUNNING') {
                                JobService.get({
                                    jobschedulerId: vm.schedulerIds.selected,
                                    jobs: [{job: val.job.path}],
                                    compactView: vm.jobChainFilters.isCompact
                                }).then(function (res1) {
                                    jobChain.nodes[index].job = _.merge(jobChain.nodes[index].job, res1.jobs[0]);
                                    updatePanelHeight();
                                });
                            }
                        });
                    }
                    updatePanelHeight();
                });

            });

            for (let i = 0; i < vm.tree.length; i++) {
                if (vm.tree[i].path.match(jobChain.path1) || jobChain.path1.match(vm.tree[i].path)) {
                    traverseToSelectedJobChain(vm.tree[i], jobChain);
                }
            }
        }

        vm.hideNodePanelFuc = function (jobChain) {
            jobChain.show = false;
            for (let i = 0; i < vm.tree.length; i++) {
                if (vm.tree[i].path.match(jobChain.path1) || jobChain.path1.match(vm.tree[i].path)) {
                    traverseToSelectedJobChain(vm.tree[i], jobChain);
                }
            }
            setTimeout(function () {
                updatePanelHeight();
            }, 1)
        };

        vm.expandDetails = function () {
            vm.isLoaded = true;
            let obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.jobChains = [];
            for (let i = 0; i < vm.allJobChains.length; i++) {
                obj.jobChains.push({jobChain: vm.allJobChains[i].path});
            }
            JobChainService.getJobChainsP(obj).then(function (result) {
                for (let i = 0; i < vm.allJobChains.length; i++) {
                    for (let j = 0; j < result.jobChains.length; j++) {
                        if (result.jobChains[j].path === vm.allJobChains[i].path) {
                            vm.allJobChains[i] = mergePermanentAndVolatile(result.jobChains[j], vm.allJobChains[i], null);
                            vm.allJobChains[i].show = true;
                            result.jobChains.splice(j, 1);
                            break;
                        }
                    }
                }
                obj.jobChains = [];
                for (let i = 0; i < vm.filtered.length; i++) {
                    if (!vm.filtered[i].state) {
                        obj.jobChains.push({jobChain: vm.filtered[i].path});
                    }
                }
                obj.compactView = vm.jobChainFilters.isCompact;
                JobChainService.get(obj).then(function (res) {
                    for (let i = 0; i < vm.allJobChains.length; i++) {
                        for (let j = 0; j < res.jobChains.length; j++) {
                            if (res.jobChains[j].path === vm.allJobChains[i].path) {
                                vm.allJobChains[i] = mergePermanentAndVolatile(res.jobChains[j], vm.allJobChains[i], res.nestedJobChains);
                                vm.allJobChains[i].show = true;
                                if (vm.userPreferences.showTasks)
                                    angular.forEach(vm.allJobChains[i].nodes, function (val, index) {
                                        if (val.job && val.job.state && val.job.state._text === 'RUNNING') {
                                            JobService.get({
                                                jobschedulerId: vm.schedulerIds.selected,
                                                jobs: [{job: val.job.path}],
                                                compactView: vm.jobChainFilters.isCompact
                                            }).then(function (res1) {
                                                vm.allJobChains[i].nodes[index].job = _.merge(vm.allJobChains[i].nodes[index].job, res1.jobs[0]);
                                                updatePanelHeight();
                                            });
                                        }
                                    });
                                res.jobChains.splice(j, 1);
                                break;
                            }
                        }
                    }
                    updatePanelHeight();
                });
                vm.isLoaded = false;

            }, function () {
                vm.isLoaded = false;
            });
        };

        vm.collapseDetails = function () {
            for (let i = 0; i < vm.allJobChains.length; i++) {
                vm.allJobChains[i].show = false;
            }
            setTimeout(function () {
                updatePanelHeight();
            }, 1)
        };

        vm.showHistory = showHistory;

        vm.historyRequestObj = {};

        function showHistory(jobChain, node, order, skip, toggle) {
            if (vm.showHistoryPanel && vm.showHistoryPanel.path !== jobChain.path) {
                vm.historyRequestObj = {};
                vm.taskHistoryRequestObj = {};
            }

            vm.showHistoryPanel = angular.copy(jobChain);
            vm.isAuditLog = false;
            vm.isTaskHistory = false;

            if (!toggle) {
                if (vm.userPreferences.historyTab === 'order' || skip) {
                    vm.isTaskHistory = false;
                } else {
                    vm.showJobHistory(jobChain, node, order);
                    return;
                }
            } else {
                vm.taskHistoryRequestObj = {};
                vm.showJobHistory(jobChain, node, order);
                return;
            }
            let obj = {};
            obj.limit = vm.userPreferences.maxHistoryPerJobchain;
            obj.orders = [{
                jobChain: jobChain.path
            }];
            obj.jobschedulerId = $scope.schedulerIds.selected;
            if (node) {
                jobChain.showHistory = node.name;
            } else if (order) {
                jobChain.showHistory = order.orderId;
                obj.orders[0].orderId = order.orderId;
            }
            vm.historyRequestObj = obj;
            OrderService.histories(obj).then(function (res) {
                vm.historys = res.history;
            });
            vm.jobChainFilters.historyPanelState.tab = vm.isTaskHistory;
        }

        vm.taskHistoryRequestObj = {};
        vm.showJobHistory = function (jobChain, node, order, skip) {
            vm.showHistoryPanel = angular.copy(jobChain);
            vm.isTaskHistory = true;
            vm.isAuditLog = false;
            let obj = {jobschedulerId: vm.schedulerIds.selected};
            obj.limit = vm.userPreferences.maxHistoryPerTask;
            obj.orders = [{
                jobChain: jobChain.path
            }];

            if (skip && !vm.isEmpty(vm.taskHistoryRequestObj)) {

                obj = vm.taskHistoryRequestObj;
            } else {
                if (node) {
                    obj.orders[0].state = node.name;
                    vm.jobChainFilters.historyPanelState.name = node.name;
                    vm.jobChainFilters.historyPanelState.key = 'label.state';
                } else if (order) {
                    obj.orders[0].orderId = order.orderId;
                    vm.jobChainFilters.historyPanelState.name = order.orderId;
                    vm.jobChainFilters.historyPanelState.key = 'label.order';
                } else {
                    if (vm.jobChainFilters.historyPanelState.name) {
                        if (vm.jobChainFilters.historyPanelState.key === 'label.state') {
                            obj.orders[0].state = vm.jobChainFilters.historyPanelState.name;
                        } else {
                            obj.orders[0].orderId = vm.jobChainFilters.historyPanelState.name;
                        }
                    }
                }
                jobChain.showHistory = vm.jobChainFilters.historyPanelState.name;
            }

            vm.taskHistoryRequestObj = obj;
            TaskService.histories(obj).then(function (res) {
                vm.showHistoryPanel.taskHistory = res.history;
            }, function () {
                vm.showHistoryPanel.taskHistory = [];
            });
            vm.jobChainFilters.historyPanelState.tab = vm.isTaskHistory;
        };

        vm.loadAuditLogs = function (obj) {
            obj.limit = parseInt(vm.userPreferences.maxAuditLogRecords) < parseInt(vm.userPreferences.maxAuditLogPerObject) ? parseInt(vm.userPreferences.maxAuditLogRecords) : parseInt(vm.userPreferences.maxAuditLogPerObject);
            AuditLogService.getLogs(obj).then(function (result) {
                if (result && result.auditLog) {
                    vm.auditLogs = result.auditLog;
                }
            });
        };

        vm.showAuditLogs = function (jobChain) {
            vm.showHistoryPanel = angular.copy(jobChain);
            vm.isAuditLog = true;
            vm.isTaskHistory = false;
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.orders = [];
            obj.orders.push({jobChain: jobChain.path});
            if (vm.permission.AuditLog.view.status)
                vm.loadAuditLogs(obj);
        };

        vm.hideHistory = function (jobChain) {
            if (!jobChain) {
                vm.showHistoryPanel = '';
                vm.historyRequestObj = {};
                vm.taskHistoryRequestObj = {};
            } else {
                jobChain.showHistory = '';
                vm.showHistory(vm.showHistoryPanel);
            }

        };

        vm.recursiveTreeUpdate = function (scrTree, destTree) {
            if (scrTree && destTree)
                for (let i = 0; i < scrTree.length; i++) {
                    for (let j = 0; j < destTree.length; j++) {
                        if (scrTree[i].path === destTree[j].path) {
                            scrTree[i].jobChains = destTree[j].jobChains;
                            scrTree[i].expanded = destTree[j].expanded;
                            scrTree[i].selected = destTree[j].selected;
                            scrTree[i].selected1 = destTree[j].selected1;
                            vm.recursiveTreeUpdate(scrTree[i].folders, destTree[j].folders);
                            destTree.splice(j, 1);
                            break;
                        }
                    }
                }
            return scrTree;
        };

        var loadFileBasedObj = true, isOperationGoingOn = false, isAnyFileEventOnHold = false, isFuncCalled = false,
            jobChainPaths = [];

        $scope.$on('event-started', function () {
            if (vm.events && vm.events.length > 0 && vm.events[0].eventSnapshots) {
                if (!isOperationGoingOn) {
                    if ($location.search().scheduler_id && $location.search().path) {
                        for (let j = 0; j < vm.events[0].eventSnapshots.length; j++) {
                            if (vm.events[0].eventSnapshots[j].objectType === "JOBCHAIN" && vm.events[0].eventSnapshots[j].path === $location.search().path) {
                                let obj = {};
                                obj.jobschedulerId = vm.schedulerIds.selected;
                                obj.jobChains = [{jobChain: $location.search().path}];
                                getJobChainByPathV(obj);
                                break;
                            }
                        }
                        return;
                    }
                    let arr = [];
                    let arr1 = [];
                    let callTree = false;
                    for (let j = 0; j < vm.events[0].eventSnapshots.length; j++) {
                        if (vm.events[0].eventSnapshots[j].eventType === 'JobChainStateChanged' && !vm.events[0].eventSnapshots[j].eventId) {
                            arr.push({jobChain: vm.events[0].eventSnapshots[j].path});
                        }
                        if (vm.events[0].eventSnapshots[j].eventType === "InventoryInitialized" || (vm.events[0].eventSnapshots[j].eventType === "FileBasedActivated" || vm.events[0].eventSnapshots[j].eventType === "FileBasedRemoved") && (vm.events[0].eventSnapshots[j].objectType === "JOBCHAIN" || vm.events[0].eventSnapshots[j].objectType == "JOB" || vm.events[0].eventSnapshots[j].objectType === "ORDER") && loadFileBasedObj && !callTree) {
                            callTree = true;
                            arr = [];
                            break;
                        }

                        if (vm.showHistoryPanel && vm.events[0].eventSnapshots[j].eventType === "FileBasedRemoved" && vm.events[0].eventSnapshots[j].objectType === "JOBCHAIN") {
                            if (vm.showHistoryPanel.path === vm.events[0].eventSnapshots[j].path) {
                                vm.showHistoryPanel = '';
                                vm.historyRequestObj = {};
                                vm.taskHistoryRequestObj = {};
                                vm.jobChainFilters.historyPanelState = {};
                            }
                        }
                    }
                    if (callTree) {
                        loadFileBasedObj = false;
                        if (vm.selectedFiltered && vm.selectedFiltered.paths && vm.selectedFiltered.paths.length > 0) {
                            var folders = [];
                            angular.forEach(vm.selectedFiltered.paths, function (v) {
                                folders.push({folder: v});
                            });
                        }
                        JobChainService.tree({
                            jobschedulerId: vm.schedulerIds.selected,
                            compact: true,
                            folders: folders,
                            types: ['JOBCHAIN']
                        }).then(function (res) {
                            loadFileBasedObj = true;
                            vm.tree = vm.recursiveTreeUpdate(res.folders, vm.tree);
                            vm.changeStatus();
                        }, function () {
                            loadFileBasedObj = true;
                        });
                    }
                    if (arr.length > 0) {
                        for (let i = 0; i < vm.allJobChains.length; i++) {
                            for (let j = 0; j < arr.length; j++) {
                                if (arr[j].jobChain === vm.allJobChains[i].path) {
                                    arr1.push(arr[j]);
                                    arr.splice(j, 1);
                                    break;
                                }
                            }
                        }
                    }
                    if (arr1.length > 0 && !vm.loading) {
                        let obj = {};
                        obj.jobschedulerId = $scope.schedulerIds.selected;
                        obj.jobChains = arr1;
                        obj.compactView = vm.jobChainFilters.isCompact;
                        JobChainService.get(obj).then(function (res) {
                            if (res.jobChains) {
                                for (let index = 0; index < vm.allJobChains.length; index++) {
                                    for (let i = 0; i < res.jobChains.length; i++) {
                                        if (vm.allJobChains[index].path === res.jobChains[i].path) {
                                            vm.allJobChains[index] = mergePermanentAndVolatile(res.jobChains[i], vm.allJobChains[index], res.nestedJobChains);
                                            if (vm.userPreferences.showTasks && vm.allJobChains[index].show)
                                                angular.forEach(vm.allJobChains[index].nodes, function (val, index2) {
                                                    if (val.job && val.job.state && val.job.state._text === 'RUNNING') {
                                                        JobService.get({
                                                            jobschedulerId: vm.schedulerIds.selected,
                                                            jobs: [{job: val.job.path}],
                                                            compactView: vm.jobChainFilters.isCompact
                                                        }).then(function (res1) {
                                                            vm.allJobChains[index].nodes[index2].job = _.merge(vm.allJobChains[index].nodes[index2].job, res1.jobs[0]);
                                                            updatePanelHeight();
                                                        });
                                                    }
                                                });

                                            res.jobChains.splice(i, 1);
                                            break;
                                        }
                                    }
                                }
                            }
                        });
                    }
                } else {
                    for (let j = 0; j < vm.events[0].eventSnapshots.length; j++) {
                        if (vm.events[0].eventSnapshots[j].eventType === 'JobChainStateChanged' && !vm.events[0].eventSnapshots[j].eventId) {
                            if (jobChainPaths.indexOf(vm.events[0].eventSnapshots[j].path) === -1) {
                                jobChainPaths.push(vm.events[0].eventSnapshots[j].path);
                            }
                        } else if (vm.events[0].eventSnapshots[j].eventType === "InventoryInitialized" || (vm.events[0].eventSnapshots[j].eventType === "FileBasedActivated" || vm.events[0].eventSnapshots[j].eventType === "FileBasedRemoved") && vm.events[0].eventSnapshots[j].objectType === "JOBCHAIN") {
                            isAnyFileEventOnHold = true;
                            break;
                        }
                    }
                }
                if (vm.showHistoryPanel) {
                    for (let i = 0; i < vm.events[0].eventSnapshots.length; i++) {
                        if (vm.events[0].eventSnapshots[i].eventType === "ReportingChangedOrder" && !vm.events[0].eventSnapshots[i].eventId && !vm.isTaskHistory && !vm.isAuditLog) {
                            OrderService.histories(vm.historyRequestObj).then(function (res) {
                                vm.historys = res.history;
                            });
                        }
                        if (vm.events[0].eventSnapshots[i].eventType === "ReportingChangedJob" && !vm.events[0].eventSnapshots[i].eventId && vm.isTaskHistory) {
                            TaskService.histories(vm.taskHistoryRequestObj).then(function (res) {
                                vm.showHistoryPanel.taskHistory = res.history;
                            }, function () {
                                vm.showHistoryPanel.taskHistory = [];
                            })
                        }
                        var path = vm.events[0].eventSnapshots[i].path.split(',')[0];
                        if (vm.events[0].eventSnapshots[i].eventType === "AuditLogChanged" && (vm.events[0].eventSnapshots[i].objectType === "JOBCHAIN" || vm.events[0].eventSnapshots[i].objectType === "ORDER") && (path === vm.showHistoryPanel.path) && vm.isAuditLog) {
                            if (vm.permission.AuditLog.view.status) {
                                let obj = {};
                                obj.jobschedulerId = vm.schedulerIds.selected;
                                obj.orders = [];
                                obj.orders.push({jobChain: vm.showHistoryPanel.path});
                                vm.loadAuditLogs(obj);
                            }
                        }
                    }
                }
            }
        });

        $scope.$on('stopEvents', function () {
            isOperationGoingOn = true;
            isAnyFileEventOnHold = false;
            isFuncCalled = false;
            jobChainPaths = [];
        });

        $scope.$on('startEvents', function () {
            isOperationGoingOn = false;
            if (!isFuncCalled) {
                refreshUIWithHoldEvents();
            }
        });

        function refreshUIWithHoldEvents() {
            isFuncCalled = true;
            let arr = [];
            for (let i = 0; i < vm.allJobChains.length; i++) {
                for (let j = 0; j < jobChainPaths.length; j++) {
                    if (jobChainPaths[j] === vm.allJobChains[i].path) {
                        arr.push({jobChain: jobChainPaths[j]});
                        jobChainPaths.splice(j, 1);
                        break;
                    }
                }
            }
            if (!isAnyFileEventOnHold) {
                if (arr.length == 0) {
                    return;
                }
                let obj = {};
                obj.jobschedulerId = $scope.schedulerIds.selected;
                obj.jobChains = arr;
                obj.compactView = vm.jobChainFilters.isCompact;
                JobChainService.get(obj).then(function (res) {
                    isFuncCalled = false;
                    if (res.jobChains) {
                        for (let index = 0; index < vm.allJobChains.length; index++) {
                            for (let i = 0; i < res.jobChains.length; i++) {
                                if (vm.allJobChains[index].path === res.jobChains[i].path) {
                                    vm.allJobChains[index] = mergePermanentAndVolatile(res.jobChains[i], vm.allJobChains[index], res.nestedJobChains);
                                    if (vm.userPreferences.showTasks && vm.allJobChains[index].show)
                                        angular.forEach(vm.allJobChains[index].nodes, function (val, index2) {
                                            if (val.job && val.job.state && val.job.state._text === 'RUNNING') {
                                                JobService.get({
                                                    jobschedulerId: vm.schedulerIds.selected,
                                                    jobs: [{job: val.job.path}],
                                                    compactView: vm.jobChainFilters.isCompact
                                                }).then(function (res1) {
                                                    vm.allJobChains[index].nodes[index2].job = _.merge(vm.allJobChains[index].nodes[index2].job, res1.jobs[0]);
                                                });
                                            }
                                        });

                                    res.jobChains.splice(i, 1);
                                    break;
                                }

                            }
                        }
                    }
                });
            } else {
                loadFileBasedObj = false;
                if ($location.search().scheduler_id && $location.search().path) {
                    return;
                }
                if (vm.selectedFiltered && vm.selectedFiltered.paths && vm.selectedFiltered.paths.length > 0) {
                    var folders = [];
                    angular.forEach(vm.selectedFiltered.paths, function (v) {
                        folders.push({folder: v});
                    });
                }
                JobChainService.tree({
                    jobschedulerId: vm.schedulerIds.selected,
                    compact: true,
                    folders: folders,
                    types: ['JOBCHAIN']
                }).then(function (res) {
                    loadFileBasedObj = true;
                    isFuncCalled = true;
                    vm.tree = vm.recursiveTreeUpdate(res.folders, vm.tree);
                    vm.changeStatus();
                }, function () {
                    loadFileBasedObj = true;
                    isFuncCalled = true;
                });
            }
        }

        $scope.$on('refreshList', function (event, jobChain) {
            showNodePanelFuc(jobChain);
        });
        var watcher2 = $scope.$watchCollection('filtered', function (newNames) {
            if (newNames)
                vm.object = {};
        });

        var watcher6 = $scope.$watchCollection('pageView', function (newValue, oldValue) {
            if (newValue && oldValue) {
                if (newValue === 'grid' && oldValue === 'list') {
                    vm.changeStatus();
                } else {
                    getFilteredData();
                }
            }
        });

        vm.resizerHeight = 450;
        vm.resizerHeightInfo;
        vm.isInfoResize = false;

        vm.resetPanel = function () {
            if ($location.search().scheduler_id && $location.search().path) {
                vm.isInfoResize = false;
                _updatePanelHeight('info');
            } else {
                let rsHt = JSON.parse(SavedFilter.resizerHeight) || {};
                if (rsHt.jobChain && typeof rsHt.jobChain === 'object') {
                    if (rsHt.jobChain[vm.folderPath]) {
                        delete rsHt.jobChain[vm.folderPath];
                        SavedFilter.setResizerHeight(rsHt);
                        SavedFilter.save();
                        _updatePanelHeight();
                    }
                }
            }
        };

        $scope.$on('angular-resizable.resizeEnd', function (event, args) {
            if (args.id === 'jobChainDivId') {
                let rsHt = JSON.parse(SavedFilter.resizerHeight) || {};
                if (rsHt.jobChain && typeof rsHt.jobChain === 'object') {
                    rsHt.jobChain[vm.folderPath] = args.height;
                } else {
                    rsHt.jobChain = {};
                }
                rsHt.jobChain[vm.folderPath] = args.height;
                SavedFilter.setResizerHeight(rsHt);
                SavedFilter.save();
                vm.resizerHeight = args.height;
            } else if (args.id === 'jobChainInfoDivId') {
                vm.resizerHeightInfo = args.height;
                vm.isInfoResize = true;
            }
        });

        $scope.$on('$destroy', function () {
            vm.jobChainFilters.expand_to = vm.tree;
            vm.jobChainFilters.showHistoryPanel = vm.showHistoryPanel;
            watcher1();
            watcher2();
            watcher3();
            watcher4();
            watcher5();
            watcher6();
            if (t1) {
                $timeout.cancel(t1);
            }
            if (t2) {
                $timeout.cancel(t2);
            }
        });
    }

    JobCtrl.$inject = ["$scope", "$rootScope", "JobService", "UserService", "$uibModal", "orderByFilter", "SavedFilter", "TaskService", "$state", "CoreService", "$timeout", "DailyPlanService", "AuditLogService", "$location", "OrderService", "$filter", "ConditionService"];

    function JobCtrl($scope, $rootScope, JobService, UserService, $uibModal, orderBy, SavedFilter, TaskService, $state, CoreService, $timeout, DailyPlanService, AuditLogService, $location, OrderService, $filter, ConditionService) {
        const vm = $scope;
        vm.jobFilters = CoreService.getJobTab();
        vm.jobFilters.isCompact = vm.userPreferences.isJobCompact == undefined ? vm.userPreferences.isCompact : vm.userPreferences.isJobCompact;
        vm.maxEntryPerPage = vm.userPreferences.maxEntryPerPage;
        vm.showTask = vm.userPreferences.showTasks;
        vm.isUnique = true;

        vm.object = {};
        vm.tree = [];
        vm.allJobs = [];
        vm.filtered = [];
        vm.my_tree = {};

        vm.filter_tree = {};
        vm.filterTree1 = [];
        vm.object.paths = [];

        vm.selectedFiltered = null;
        vm.reloadState = 'no';
        vm.temp_filter = {};

        vm.savedJobFilter = JSON.parse(SavedFilter.jobFilters) || {};
        vm.jobFilterList = [];

        function resizeSidePanel() {
            setTimeout(function () {
                let ht = ($('.app-header').height() || 61)
                    + ($('.top-header-bar').height() || 16)
                    + $('.sub-header').height() + 24;

                $('#leftPanel').stickySidebar({
                    sidebarTopMargin: ht
                });
            }, 0);
        }

        resizeSidePanel();

        if (vm.jobFilters.selectedView) {
            vm.savedJobFilter.selected = vm.savedJobFilter.selected || vm.savedJobFilter.favorite;
        } else {
            vm.savedJobFilter.selected = undefined;
        }

        vm.expanding_property = {
            field: "name"
        };
        if (!vm.schedulerIds.selected) {
            vm.isLoading = true;
            return;
        }
        if ($location.search().scheduler_id && $location.search().path) {
            vm.checkSchedulerId();
            getJobByPath($location.search().path);
        } else {
            if (!vm.savedJobFilter.selected) {
                initTree();
            }
            checkSharedFilters();
        }

        function mergePermanentAndVolatile(sour, dest) {
            dest.runningTasks = sour.runningTasks;
            dest.error = sour.error;
            dest.numOfRunningTasks = sour.numOfRunningTasks;
            dest.numOfQueuedTasks = sour.numOfQueuedTasks;
            dest.taskQueue = sour.taskQueue;
            dest.nextStartTime = sour.nextStartTime;
            dest.startedAt = sour.startedAt;
            dest.state = sour.state;
            dest.stateText = sour.stateText;
            dest.configurationStatus = sour.configurationStatus;
            dest.ordersSummary = sour.ordersSummary;
            if (sour.maxTasks)
                dest.maxTasks = sour.maxTasks;
            if (sour.title)
                dest.title = sour.title;
            return dest;
        }

        function getJobByPath(path) {
            let obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.jobs = [{job: path}];
            JobService.getJobsP(obj).then(function (result) {
                vm.jobs = result.jobs;
                getJobByPathV(obj);
                vm.showTaskFuc(vm.jobs[0]);
                vm.isLoading = true;
            }, function () {
                getJobByPathV(obj);
                vm.isLoading = true;
            });
        }

        function getJobByPathV(obj) {
            obj.compactView = vm.jobFilters.isCompact;
            JobService.get(obj).then(function (res) {
                if (vm.jobs && angular.isArray(vm.jobs)) {
                    vm.jobs[0] = mergePermanentAndVolatile(res.jobs[0], vm.jobs[0]);
                } else {
                    vm.jobs = res.jobs;
                    vm.showTaskFuc(vm.jobs[0]);
                }
                updatePanelHeight();
            });
        }

        function checkSharedFilters() {
            if (vm.permission.JOCConfigurations.share.view) {
                let obj = {};
                obj.jobschedulerId = vm.schedulerIds.selected;
                obj.configurationType = "CUSTOMIZATION";
                obj.objectType = "JOB";
                obj.shared = true;
                UserService.configurations(obj).then(function (res) {
                    if (res.configurations && res.configurations.length > 0)
                        vm.jobFilterList = res.configurations;
                    getCustomizations();
                }, function () {
                    getCustomizations();
                });
            } else {
                getCustomizations();
            }
        }

        function getCustomizations() {
            let obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.account = vm.permission.user;
            obj.configurationType = "CUSTOMIZATION";
            obj.objectType = "JOB";
            UserService.configurations(obj).then(function (res) {

                if (vm.jobFilterList && vm.jobFilterList.length > 0) {
                    if (res.configurations && res.configurations.length > 0) {
                        vm.jobFilterList = vm.jobFilterList.concat(res.configurations);
                    }
                    let data = [];

                    for (let i = 0; i < vm.jobFilterList.length; i++) {
                        let flag = true;
                        for (let j = 0; j < data.length; j++) {
                            if (data[j].id === vm.jobFilterList[i].id) {
                                flag = false;
                            }
                        }
                        if (flag) {
                            data.push(vm.jobFilterList[i]);
                        }
                    }
                    vm.jobFilterList = data;
                } else {
                    vm.jobFilterList = res.configurations;
                }

                if (vm.savedJobFilter.selected) {
                    let flag = true;
                    angular.forEach(vm.jobFilterList, function (value) {
                        if (value.id === vm.savedJobFilter.selected) {
                            flag = false;
                            UserService.configuration({
                                jobschedulerId: value.jobschedulerId,
                                id: value.id
                            }).then(function (conf) {
                                vm.selectedFiltered = JSON.parse(conf.configuration.configurationItem);
                                vm.selectedFiltered.account = value.account;

                                initTree();
                            });
                        }
                    });
                    if (flag) {
                        vm.savedJobFilter.selected = undefined;
                        initTree();
                    }
                }
            }, function () {
                vm.savedJobFilter.selected = undefined;
            })
        }

        function getFilteredData(flag) {
            let tempArr = [];
            vm.reset();
            if (vm.jobFilters.searchText && vm.jobFilters.searchText !== '' && !flag) {
                tempArr = $filter('filter')(vm.allJobs, {path: vm.jobFilters.searchText}, false);
            } else {
                tempArr = vm.allJobs;
            }
            tempArr = $filter('orderBy')(tempArr, vm.jobFilters.filter.sortBy, vm.jobFilters.reverse);
            vm.totalCount = tempArr.length;

            if (vm.pageView === 'list') {
                vm.filtered = tempArr.slice((vm.userPreferences.entryPerPage * (vm.jobFilters.currentPage - 1)), (vm.userPreferences.entryPerPage * vm.jobFilters.currentPage));
            } else {
                vm.filtered = tempArr;
            }
            tempArr = [];
            updatePanelHeight();
        }

        vm.reload = function () {
            if ($scope.reloadState == 'no') {
                $scope.allJobs = [];
                $scope.folderPath = 'Process aborted';
                $scope.reloadState = 'yes';
                vm.jobFilters.expand_to = vm.tree;
            } else if ($scope.reloadState == 'yes') {
                $scope.reloadState = 'no';
                $scope.load();
            }
        };

        /**
         * Function to initialized tree view
         */
        function initTree() {
            vm.reloadState = 'no';
            let folders = [];
            if (vm.selectedFiltered && vm.selectedFiltered.paths && vm.selectedFiltered.paths.length > 0) {

                angular.forEach(vm.selectedFiltered.paths, function (v) {
                    folders.push({folder: v});
                });
            }
            if (vm.selectedFiltered) {
                isCustomizationSelected(true);
            }

            JobService.tree({
                jobschedulerId: vm.schedulerIds.selected,
                compact: true,
                folders: folders,
                types: ['JOB']
            }).then(function (res) {

                if ($rootScope.job_expand_to) {
                    vm.tree = angular.copy(res.folders);
                    filteredTreeData();
                } else {
                    if (vm.isEmpty(vm.jobFilters.expand_to)) {
                        vm.tree = angular.copy(res.folders);
                        filteredTreeData();
                    } else {
                        vm.jobFilters.expand_to = vm.recursiveTreeUpdate(angular.copy(res.folders), vm.jobFilters.expand_to);
                        vm.tree = vm.jobFilters.expand_to;
                        vm.jobFilters.expand_to = [];
                        vm.changeStatus();
                    }
                }
                vm.isLoading = true;
            }, function () {
                vm.isLoading = true;
            });
        }

        vm.$on('reloadObject', function () {
            navFullTree();
            filteredTreeData();
        });

        vm.noReload = false;

        $scope.$on('switchPath', function($event, path){
            let p = path.path;

            p = p.substring(0, p.lastIndexOf('/')) || '/';
            angular.forEach(vm.tree, function (value) {
                if (value.path != p) {
                    value.expanded = true;
                    recursive(value, p);
                }else{
                    vm.noReload = true;
                    vm.treeHandler(value);
                }
            });
        });

        function recursive(data, path) {
            for (let i = 0; i < data.folders.length; i++) {
                if (data.folders[i].path != path) {
                    data.folders[i].expanded = true;
                    recursive(data.folders[i], path);
                } else {
                    vm.noReload = true;
                    vm.treeHandler(data.folders[i]);
                }
            }
        }

        vm.treeHandler = function (data) {
            if (vm.userPreferences.expandOption === 'both')
                data.expanded = true;
            navFullTree();
            $scope.reloadState = 'no';
            data.jobs = [];
            vm.allJobs = [];
            vm.loading = true;
            expandFolderData(data);
            vm.reset();
            if (vm.showTaskPanel && (vm.showTaskPanel.path1 !== data.path)) {
                vm.hideTaskPanel();
            }
        };

        vm.treeHandler1 = function (data) {
            if (data.expanded) {
                data.folders = orderBy(data.folders, 'name');
            }
        };

        vm.expandNode = function (data) {
            vm.reset();
            navFullTree();
            $scope.reloadState = 'no';
            if (vm.showTaskPanel && (vm.showTaskPanel.path1 !== data.path)) {
                vm.hideTaskPanel();
            }
            vm.allJobs = [];
            vm.loading = true;
            vm.folderPath = data.name || data.path;
            let obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.compact = true;
            obj.folders = [];
            obj.folders.push({folder: data.path, recursive: true});

            if (vm.selectedFiltered) {
                obj.regex = vm.selectedFiltered.regex;
                obj = parseDate(obj);
            } else {
                if (vm.jobFilters.filter.type !== 'ALL') {
                    obj.isOrderJob = vm.jobFilters.filter.type === 'order';
                }

                if (vm.jobFilters.filter.state !== 'ALL') {
                    if (vm.scheduleState === 'UNREACHABLE') {
                        return;
                    }
                    firstVolatileCall(obj, obj, data);
                    return
                }
            }

            JobService.getJobsP(obj).then(function (result) {
                for (let i = 0; i < result.jobs.length; i++) {
                    result.jobs[i].path1 = data.path;
                }
                vm.allJobs = result.jobs;
                vm.loading = false;
                vm.isLoaded = true;
                getFilteredData();
                volatileInformation(obj, data, false);
            }, function () {
                vm.isLoaded = true;
                vm.loading = false;
                volatileInformation(obj, data, false);

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
            function recursive(data) {
                data.expanded = true;
                data.folders = orderBy(data.folders, 'name');

                data.jobs = [];
                for (let i = 0; i < vm.allJobs.length; i++) {
                    if (data.path === vm.allJobs[i].path.substring(0, vm.allJobs[i].path.lastIndexOf('/')) || data.path === vm.allJobs[i].path.substring(0, vm.allJobs[i].path.lastIndexOf('/') + 1)) {
                        data.jobs.push(vm.allJobs[i]);
                        vm.allJobs[i].path1 = data.path;
                        if (vm.allJobs[i].state && vm.allJobs[i].state._text === 'RUNNING' && vm.userPreferences.showTasks) {
                            JobService.get({
                                jobschedulerId: vm.schedulerIds.selected,
                                jobs: [{job: vm.allJobs[i].path}],
                                compactView: vm.jobFilters.isCompact
                            }).then(function (res1) {
                                vm.allJobs[i] = mergePermanentAndVolatile(res1.jobs[0], vm.allJobs[i]);
                            });
                        }
                    }
                }
                data.selected1 = true;
                angular.forEach(data.folders, function (a) {
                    recursive(a);
                });
            }

            recursive(data);
        }

        function expandFolderData(data) {
            data.selected1 = true;
            vm.folderPath = data.name || data.path;
            let obj = {jobschedulerId: vm.schedulerIds.selected, compact: true};
            obj.folders = [{folder: data.path, recursive: false}];
            if (vm.selectedFiltered) {
                obj.regex = vm.selectedFiltered.regex;
                obj = parseDate(obj);
            } else {
                if (vm.jobFilters.filter.type !== 'ALL') {
                    obj.isOrderJob = vm.jobFilters.filter.type === 'order';
                }
                if (vm.jobFilters.filter.state !== 'ALL') {
                    if (vm.scheduleState === 'UNREACHABLE') {
                        return;
                    }
                    firstVolatileCall(obj, obj);
                    return
                }
            }

            JobService.getJobsP(obj).then(function (result) {
                for (let i = 0; i < result.jobs.length; i++) {
                    result.jobs[i].path1 = data.path;
                }
                data.jobs = result.jobs;
                vm.allJobs = result.jobs;
                getFilteredData();
                vm.loading = false;
                vm.isLoaded = true;
                volatileInformation(obj, null, true)
            }, function () {
                vm.isLoaded = true;
                volatileInformation(obj, null, true)
            });
        }

        function navFullTree() {
            angular.forEach(vm.tree, function (value) {
                value.selected1 = false;
                value.jobs = [];
                if (value.expanded) {
                    traverseTree1(value);
                }
            });
        }

        function traverseTree1(data) {
            for (let i = 0; i < data.folders.length; i++) {
                data.folders[i].selected1 = false;
                data.folders[i].jobs = [];
                if (data.folders[i].expanded) {
                    traverseTree1(data.folders[i]);
                }
            }
        }

        var count = 1, splitPath = [];

        function checkExpand(data) {
            if (data.selected1) {
                data.jobs = [];
                expandFolderData(data);
                vm.folderPath = data.name || data.path;
            }
            if (data.folders && data.folders.length > 0) {
                data.folders = orderBy(data.folders, 'name');
                for (let x = 0; x < data.folders.length; x++) {
                    if (vm.expand_to) {
                        if (vm.flag && data.folders[x].path.substring(1, data.folders[x].path.length) === splitPath[count] && count < splitPath.length) {
                            count = count + 1;
                            splitPath[count] = splitPath[count - 1] + '/' + splitPath[count];
                            data.folders[x].expanded = true;
                            if (vm.expand_to.name === data.folders[x].name) {
                                data.folders[x].selected1 = true;
                                vm.flag = false;
                                count = 1;
                                splitPath = [];
                            }
                        }
                    }
                    checkExpand(data.folders[x]);
                    if (data.folders[x].expanded || data.folders[x].selected1) {
                        if (data.path === '/') {
                            data.selected1 = false;
                        }
                    }
                }
            }
        }

        function filteredTreeData() {
            for (let i = 0; i < vm.tree.length; i++) {
                if ($rootScope.job_expand_to) {
                    vm.expand_to = angular.copy($rootScope.job_expand_to);
                    splitPath = vm.expand_to.path.split('/');
                    $rootScope.job_expand_to = '';
                    vm.flag = true;
                }
                if (splitPath.length < 2) {
                    vm.tree[i].selected1 = true;
                }
                vm.tree[i].expanded = true;
                vm.allJobs = [];
                checkExpand(vm.tree[i]);
            }
        }

        function checkExpandTreeForUpdates(data, obj, obj1) {
            if (data.selected1) {
                obj.folders.push({folder: data.path, recursive: false});
                obj1.folders.push({folder: data.path, recursive: false});
                vm.folderPath = data.name || data.path;
            }
            data.folders = orderBy(data.folders, 'name');
            angular.forEach(data.folders, function (value) {
                if (value.expanded || value.selected1)
                    checkExpandTreeForUpdates(value, obj, obj1);
            });
        }

        function insertData(node, x) {
            var _temp = angular.copy(node.jobs);
            node.jobs = [];
            for (let i = 0; i < x.length; i++) {
                if (node.path === x[i].path.substring(0, x[i].path.lastIndexOf('/')) || (node.path === x[i].path.substring(0, x[i].path.lastIndexOf('/') + 1))) {
                    x[i].path1 = node.path;
                    if (_temp && _temp.length > 0) {
                        for (let j = 0; j < _temp.length; j++) {
                            if (_temp[j].path === x[i].path) {
                                x[i].showJobChains = _temp[j].showJobChains;
                                if (x[i].showJobChains) {
                                    x[i].jobChains = _temp[j].jobChains;
                                }
                                break;
                            }
                        }
                    }
                    node.jobs.push(x[i]);
                }
            }
            angular.forEach(node.folders, function (value) {
                if (value.expanded || value.selected1)
                    insertData(value, x);
            });
        }

        function parseDate(obj) {
            var fromDate, toDate;
            if (vm.selectedFiltered.state && vm.selectedFiltered.state.length > 0) {
                obj.states = vm.selectedFiltered.state;
            }
            if (vm.selectedFiltered.type && vm.selectedFiltered.type.length > 0) {
                if (vm.selectedFiltered.type.length > 1) {
                } else {
                    obj.isOrderJob = vm.selectedFiltered.type[0] === 'order';
                }
            }
            if (vm.selectedFiltered.planned) {
                var date, arr;
                if (/^\s*(now\s*\+)\s*(\d+)\s*$/i.test(vm.selectedFiltered.planned)) {
                    var seconds = parseInt(/^\s*(now\s*\+)\s*(\d+)\s*$/i.exec(vm.selectedFiltered.planned)[2]);
                    fromDate = '+' + seconds + 's';
                } else if (/^\s*(\d+)(s|h|d|w|M|y)\s*$/.test(vm.selectedFiltered.planned)) {
                    obj.dateFrom = vm.selectedFiltered.planned;
                } else if (/^\s*(Today)\s*$/i.test(vm.selectedFiltered.planned)) {
                    fromDate = '0d';
                    toDate = '0d';
                } else if (/^\s*(now)\s*$/i.test(vm.selectedFiltered.planned)) {
                    fromDate = moment.utc(new Date());
                    toDate = fromDate;
                } else if (/^\s*(\d+)(s|h|d|w|M|y)\s*to\s*(\d+)(s|h|d|w|M|y)\s*$/.test(vm.selectedFiltered.planned)) {
                    date = /^\s*(\d+)(s|h|d|w|M|y)\s*to\s*(\d+)(s|h|d|w|M|y)\s*$/.exec(vm.selectedFiltered.planned);
                    arr = date[0].split('to');
                    fromDate = arr[0].trim();
                    toDate = arr[1].trim();
                } else if (/^\s*(\d+)(s|h|d|w|M|y)\s*to\s*(\d+)(s|h|d|w|M|y)\s*[+,-](\d+)(s|h|d|w|M|y)\s*$/.test(vm.selectedFiltered.planned)) {
                    date = /^\s*(\d+)(s|h|d|w|M|y)\s*to\s*(\d+)(s|h|d|w|M|y)\s*[+,-](\d+)(s|h|d|w|M|y)\s*$/.exec(vm.selectedFiltered.planned);
                    arr = date[0].split('to');
                    fromDate = arr[0].trim();
                    toDate = arr[1].trim();
                } else if (/^\s*(\d+)(s|h|d|w|M|y)\s*[+,-](\d+)(s|h|d|w|M|y)\s*to\s*(\d+)(s|h|d|w|M|y)\s*[+,-](\d+)(s|h|d|w|M|y)\s*$/.test(vm.selectedFiltered.planned)) {
                    date = /^\s*(\d+)(s|h|d|w|M|y)\s*[+,-](\d+)(s|h|d|w|M|y)\s*to\s*(\d+)(s|h|d|w|M|y)\s*[+,-](\d+)(s|h|d|w|M|y)\s*$/.exec(vm.selectedFiltered.planned);
                    arr = date[0].split('to');
                    fromDate = arr[0].trim();
                    toDate = arr[1].trim();
                } else if (/^\s*(\d+)(s|h|d|w|M|y)\s*[+,-](\d+)(s|h|d|w|M|y)\s*to\s*(\d+)(s|h|d|w|M|y)\s*$/.test(vm.selectedFiltered.planned)) {
                    date = /^\s*(\d+)(s|h|d|w|M|y)\s*[+,-](\d+)(s|h|d|w|M|y)\s*to\s*(\d+)(s|h|d|w|M|y)\s*$/.exec(vm.selectedFiltered.planned);
                    arr = date[0].split('to');
                    fromDate = arr[0].trim();
                    toDate = arr[1].trim();
                } else if (/^\s*(?:(?:(1[0-2]|0?[0-9]):)?([0-5][0-9]):)?([0-5][0-9])\s?(?:am|pm)\s*to\s*(?:(?:(1[0-2]|0?[0-9]):)?([0-5][0-9]):)?([0-5][0-9])\s?(?:am|pm)\s*$/.test(vm.selectedFiltered.planned)) {
                    let reg = /^\s*(?:(?:(1[0-2]|0?[0-9]):)?([0-5][0-9]):)?([0-5][0-9])\s?(?:am|pm)\s*to\s*(?:(?:(1[0-2]|0?[0-9]):)?([0-5][0-9]):)?([0-5][0-9])\s?(?:am|pm)\s*$/i.exec(vm.selectedFiltered.planned);
                    let arr = reg[0].split('to');
                    let fromTime = moment(arr[0].trim(), "HH:mm:ss:a");
                    let toTime = moment(arr[1].trim(), "HH:mm:ss:a");

                    fromDate = moment.utc(fromTime);
                    toDate = moment.utc(toTime);
                }
            }

            if (fromDate && toDate) {
                obj.dateFrom = fromDate;
                obj.dateTo = toDate;
            }
            obj.timeZone = vm.userPreferences.zone;
            if ((obj.dateFrom && typeof obj.dateFrom.getMonth === 'function') || (obj.dateTo && typeof obj.dateTo.getMonth === 'function')) {
                delete obj["timeZone"];
            }
            if ((obj.dateFrom && typeof obj.dateFrom.getMonth === 'function')) {
                obj.dateFrom = moment(obj.dateFrom).tz(vm.userPreferences.zone)._d;
            }
            if ((obj.dateTo && typeof obj.dateTo.getMonth === 'function')) {
                obj.dateTo = moment(obj.dateTo).tz(vm.userPreferences.zone)._d;
            }
            return obj;
        }

        function updateTreeData(expandNode, treeUpdate) {
            if (expandNode) {
                startTraverseNode(expandNode);
            }
            if (treeUpdate) {
                angular.forEach(vm.tree, function (node) {
                    insertData(node, vm.allJobs);
                })
            }

            vm.isLoaded = false;
            updatePanelHeight();
        }

        function updatePanelHeight() {
            let rsHt = JSON.parse(SavedFilter.resizerHeight) || {};
            if ($location.search().scheduler_id && $location.search().path) {
                if (!vm.isInfoResize) {
                    _updatePanelHeight('info');
                }
            } else {
                if (rsHt.job && !_.isEmpty(rsHt.job)) {
                    if (rsHt.job[vm.folderPath]) {
                        vm.resizerHeight = rsHt.job[vm.folderPath];
                        $('#jobDivId').css('height', vm.resizerHeight);
                    } else {
                        _updatePanelHeight();
                    }
                } else {
                    _updatePanelHeight();
                }
            }
        }

        function _updatePanelHeight(info) {
            setTimeout(function () {
                let num = info ? 20 : 50;
                let ht = (parseInt($('#jobTableId').height()) + num);
                let el = info ? document.getElementById('jobInfoDivId') : document.getElementById('jobDivId');
                if (el && el.scrollWidth > el.clientWidth) {
                    ht = ht + 11;
                }
                if (ht > 450) {
                    ht = 450;
                }
                if (info) {
                    $('#jobInfoDivId').css('height', ht + 'px');
                } else {
                    vm.resizerHeight = ht + 'px';
                    $('#jobDivId').css('height', vm.resizerHeight);
                }
            }, 10);
        }

        function volatileInformation(obj, expandNode, treeUpdate) {
            if (vm.scheduleState === 'UNREACHABLE') {
                updateTreeData(expandNode, treeUpdate);
                return;
            }
            if (!vm.selectedFiltered) {
                if (vm.jobFilters.filter.state !== 'ALL') {
                    obj.states = [];
                    obj.states.push(vm.jobFilters.filter.state);
                }
            }
            delete obj ['folders'];
            obj.jobs = [];
            for (let i = 0; i < vm.filtered.length; i++) {
                if (!vm.filtered[i].state) {
                    obj.jobs.push({job: vm.filtered[i].path});
                }
            }
            if (vm.allJobs.length === 0) {
                vm.isLoaded = false;
                return;
            }
            obj.compactView = vm.jobFilters.isCompact;
            JobService.get(obj).then(function (res) {
                if (res.jobs.length > 0) {
                    for (let x = 0; x < vm.allJobs.length; x++) {
                        for (let i = 0; i < res.jobs.length; i++) {
                            if (vm.allJobs[x].path === res.jobs[i].path) {
                                vm.allJobs[x] = mergePermanentAndVolatile(res.jobs[i], vm.allJobs[x]);
                                if (vm.allJobs[x].state && vm.allJobs[x].state._text === 'RUNNING' && vm.userPreferences.showTasks) {
                                    vm.allJobs[x].showJobChains = true;
                                }
                                res.jobs.splice(i, 1);
                                break;
                            }
                        }
                    }
                } else {
                    vm.allJobs = res.jobs;
                }
                if (!expandNode && treeUpdate) {
                    getFilteredData();
                }
                $scope.$broadcast('reloadWorkflow');
                updateTreeData(expandNode, treeUpdate);
            }, function () {
                updateTreeData(expandNode, treeUpdate);
            });
        }

        function mergePermanentRes(arr, obj, expandNode) {
            delete obj['folders'];
            delete obj['states'];
            obj.jobs = arr;
            JobService.getJobsP(obj).then(function (res) {
                for (let m = 0; m < vm.allJobs.length; m++) {
                    for (let i = 0; i < res.jobs.length; i++) {
                        if (vm.allJobs[m].path === res.jobs[i].path) {
                            vm.allJobs[m] = mergePermanentAndVolatile(vm.allJobs[m], res.jobs[i]);
                            res.jobs.splice(i, 1);
                            break;
                        }
                    }
                }
                getFilteredData();
                if (!expandNode) {
                    angular.forEach(vm.tree, function (node) {
                        insertData(node, vm.allJobs);
                    });
                } else {
                    startTraverseNode(expandNode);
                }
            });
        }

        function firstVolatileCall(obj, obj1, data) {
            if (vm.jobFilters.filter.state !== 'ALL') {
                obj.states = [];
                obj.states.push(vm.jobFilters.filter.state);
            }
            obj.compactView = vm.jobFilters.isCompact;
            JobService.get(obj).then(function (res) {
                vm.allJobs = res.jobs;
                let jobsPath = [];
                for (let i = 0; i < vm.allJobs.length; i++) {
                    vm.allJobs[i].path1 = vm.allJobs[i].path.substring(0, vm.allJobs[i].path.lastIndexOf('/')) || vm.allJobs[i].path.substring(0, vm.allJobs[i].path.lastIndexOf('/') + 1);
                    jobsPath.push({job: vm.allJobs[i].path});
                }
                if (res.jobs && res.jobs.length > 0)
                    mergePermanentRes(jobsPath, obj1, data);
                vm.loading = false;
                getFilteredData();
            }, function () {
                vm.loading = false;
            });
        }

        vm.toggleCompactView = function () {
            vm.jobFilters.isCompact = !vm.jobFilters.isCompact;
            if (!vm.jobFilters.isCompact) {
                vm.changeStatus();
            }
            vm.userPreferences.isJobCompact = vm.jobFilters.isCompact;
            vm.saveProfileSettings(vm.userPreferences);
        };

        vm.changeStatus = function (reload) {
            vm.hideTaskPanel();
            $scope.reloadState = 'no';
            vm.allJobs = [];
            vm.loading = true;
            var obj = {folders: [], jobschedulerId: vm.schedulerIds.selected};
            if (!vm.showTask)
                obj.compact = true;

            var obj1 = {folders: []};

            obj1.jobschedulerId = vm.schedulerIds.selected;
            obj1.compact = true;

            for (let i = 0; i < vm.tree.length; i++) {
                if (vm.tree[i].expanded || vm.tree[i].selected1)
                    checkExpandTreeForUpdates(vm.tree[i], obj, obj1);
            }

            if (vm.selectedFiltered) {

                obj.regex = vm.selectedFiltered.regex;
                obj1.regex = vm.selectedFiltered.regex;
                if (vm.selectedFiltered.state)
                    obj.states = vm.selectedFiltered.state;
                if (vm.selectedFiltered.type && vm.selectedFiltered.type.length > 0) {
                    if (vm.selectedFiltered.type.length > 1) {
                    } else {
                        obj.isOrderJob = vm.selectedFiltered.type[0] === 'order';
                        obj1.isOrderJob = vm.selectedFiltered.type[0] === 'order';
                    }
                }
            } else {
                if (vm.jobFilters.filter.type !== 'ALL') {
                    obj.isOrderJob = vm.jobFilters.filter.type === 'order';
                    obj1.isOrderJob = vm.jobFilters.filter.type === 'order';
                }
                if (vm.jobFilters.filter.state !== 'ALL') {
                    if (vm.scheduleState === 'UNREACHABLE') {
                        return;
                    }
                    firstVolatileCall(obj, obj1, null);
                    return
                }
            }

            JobService.getJobsP(obj1).then(function (result) {
                for (let i = 0; i < result.jobs.length; i++) {
                    result.jobs[i].path1 = result.jobs[i].path.substring(0, result.jobs[i].path.lastIndexOf('/')) || result.jobs[i].path.substring(0, result.jobs[i].path.lastIndexOf('/') + 1);
                    if (vm.jobFilters && vm.jobFilters.showTaskPanel && vm.jobFilters.showTaskPanel.path === result.jobs[i].path) {
                        vm.showTaskFuc(vm.jobFilters.showTaskPanel);
                    }
                }
                vm.allJobs = result.jobs;

                getFilteredData(true);
                vm.loading = false;
                vm.isLoaded = true;
                volatileInformation(obj, null, true);
                if (reload) {
                    $scope.$broadcast('reloadWorkflow');
                }
            }, function () {
                volatileInformation(obj, null, true);
            });
        };

        vm.load = function () {
            initTree();
        };

        /**--------------- Checkbox functions -------------*/
        vm.allCheck = {
            checkbox: false
        };
        vm.allTaskCheck = {checkbox: false};
        vm.allOrderCheck = {checkbox: false};

        var watcher1 = $scope.$watchCollection('object.jobs', function (newNames) {
            if (newNames && newNames.length > 0) {
                vm.allCheck.checkbox = newNames.length === vm.filtered.length;
                vm.isTasks = false;
                vm.isStopped = false;
                vm.isUnstopped = false;
                vm.isStart = false;
                angular.forEach(newNames, function (value) {
                    if (value.state && value.state._text === 'RUNNING') {
                        vm.isTasks = true;
                    }
                    if (value.state && value.state._text === 'STOPPED') {
                        vm.isStopped = true;
                    } else {
                        vm.isUnstopped = true;
                    }
                    if ((value.ordersSummary && value.ordersSummary.pending) || (value.configurationStatus && value.configurationStatus.severity === 2)) {
                        vm.isStart = true;
                    }
                    if (value.isShellJob) {
                        vm.isStart = false;
                    }
                });
            } else {
                vm.reset();
            }
        });

        var watcher2 = $scope.$watchCollection('object.tasks', function (newNames) {
            if (newNames && newNames.length > 0 && vm.showTaskPanel.taskQueue) {
                vm.allTaskCheck.checkbox = newNames.length === vm.showTaskPanel.taskQueue.length;
            } else {
                vm.allTaskCheck.checkbox = false;
                vm.object.tasks = [];
            }
        });

        var watcher3 = $scope.$watchCollection('object.orders', function (newNames) {
            if (newNames && newNames.length > 0 && vm.queueOrders && vm.queueOrders.orderQueue) {
                vm.allOrderCheck.checkbox = newNames.length === vm.queueOrders.orderQueue.length;
            } else {
                vm.allOrderCheck.checkbox = false;
                vm.object.orders = [];
            }
        });

        var watcher4 = $scope.$watch('userPreferences.entryPerPage', function (newNames) {
            if (newNames)
                vm.reset();
        });
        vm.checkAll = function () {
            if (vm.allCheck.checkbox && vm.allJobs.length > 0) {
                var _job = $filter('orderBy')($scope.allJobs, vm.jobFilters.filter.sortBy, vm.jobFilters.reverse);
                vm.object.jobs = _job.slice((vm.userPreferences.entryPerPage * (vm.jobFilters.currentPage - 1)), (vm.userPreferences.entryPerPage * vm.jobFilters.currentPage));
            } else {
                vm.reset();
            }
        };
        vm.checkAllTask = function () {
            if (vm.showTaskPanel.taskQueue && vm.allTaskCheck.checkbox && vm.showTaskPanel.taskQueue.length > 0) {
                vm.object.tasks = vm.showTaskPanel.taskQueue;
            } else {
                vm.object.tasks = [];
            }
        };
        vm.checkAllOrder = function () {
            if (vm.queueOrders && vm.allOrderCheck.checkbox && vm.queueOrders.orderQueue.length > 0) {
                vm.object.orders = [];
                angular.forEach(vm.queueOrders.orderQueue, function (order) {
                    if (order._type !== 'PERMANENT') {
                        vm.object.orders.push(order)
                    }
                });
                if (vm.object.orders.length === 0) {
                    vm.allOrderCheck.checkbox = false;
                }
            } else {
                vm.object.orders = [];
            }
        };
        /**--------------- sorting and pagination -------------------*/
        vm.pageChange = function () {
            getFilteredData();
            callVolatileInformation();
        };

        vm.sortBy = function (propertyName) {
            vm.jobFilters.reverse = !vm.jobFilters.reverse;
            vm.jobFilters.filter.sortBy = propertyName;
            if (propertyName === 'name' || propertyName === 'path') {
                getFilteredData();
                callVolatileInformation();
            } else {
                callVolatileInformation(true);
            }
        };
        vm.searchInResult = function () {
            getFilteredData();
            callVolatileInformation();
        };
        vm.setEntryPerPage = function (num) {
            vm.userPreferences.entryPerPage = num;
            getFilteredData();
            callVolatileInformation();
        };

        function callVolatileInformation(all) {
            if (vm.scheduleState === 'UNREACHABLE' || vm.jobFilters.filter.state !== 'ALL') {
                return;
            }
            let obj = {jobschedulerId: vm.schedulerIds.selected};
            obj.jobs = [];
            let arr = [];
            let isFiltered = true;
            if (vm.jobFilters.filter.sortBy === 'name' || vm.jobFilters.filter.sortBy === 'path') {
                arr = all ? vm.allJobs : vm.filtered;
                isFiltered = !all;
            } else {
                isFiltered = false;
                arr = vm.allJobs;
            }

            for (let i = 0; i < arr.length; i++) {
                if (!arr[i].state) {
                    obj.jobs.push({job: arr[i].path});
                }
            }
            if (obj.jobs.length > 0) {
                vm.isLoaded = true;
                obj.compactView = vm.jobFilters.isCompact;
                JobService.get(obj).then(function (res) {
                    for (let x = 0; x < vm.allJobs.length; x++) {
                        for (let i = 0; i < res.jobs.length; i++) {
                            if (vm.allJobs[x].path === res.jobs[i].path) {
                                vm.allJobs[x] = mergePermanentAndVolatile(res.jobs[i], vm.allJobs[x]);
                                if (vm.allJobs[x].state && vm.allJobs[x].state._text === 'RUNNING' && vm.userPreferences.showTasks) {
                                    vm.allJobs[x].showJobChains = true;
                                }
                                res.jobs.splice(i, 1);
                                break;
                            }
                        }
                    }

                    if (!isFiltered) {
                        getFilteredData();
                    }
                    vm.isLoaded = false;
                }, function () {
                    if (!isFiltered) {
                        getFilteredData();
                    }
                    vm.isLoaded = false;
                });
            } else {
                if (!isFiltered) {
                    getFilteredData();
                }
            }
        }

        vm.hidePanel = function () {
            $('#rightPanel1').addClass('m-l-0 fade-in');
            $('#rightPanel1').find('.parent .child').removeClass('col-xxl-3 col-lg-4').addClass('col-xxl-2 col-lg-3');
            $('#leftPanel').hide();
            $('.sidebar-btn').show();
        };

        vm.showLeftPanel = function () {
            $('#rightPanel1').removeClass('fade-in m-l-0');
            $('#rightPanel1').find('.parent .child').addClass('col-xxl-3 col-lg-4').removeClass('col-xxl-2 col-lg-3');
            $('#leftPanel').show();
            $('.sidebar-btn').hide();

        };

        vm.saveAsFilter = function (form) {
            var configObj = {};
            configObj.jobschedulerId = vm.schedulerIds.selected;
            configObj.account = vm.permission.user;
            configObj.configurationType = "CUSTOMIZATION";
            configObj.objectType = "JOB";
            configObj.name = vm.jobFilter.name;
            configObj.id = 0;

            configObj.configurationItem = JSON.stringify(vm.jobFilter);
            UserService.saveConfiguration(configObj).then(function (res) {
                configObj.id = res.id;
                vm.jobFilter.name = '';
                if (form)
                    form.$setPristine();
                vm.jobFilterList.push(configObj);
            });
        };

        vm.advancedSearch = function () {
            vm.jobFilter = {};
            vm.isUnique = true;
            vm.showSearchPanel = true;
            vm.isSearchHit = false;
        };
        vm.cancel = function (form) {
            vm.showSearchPanel = false;
            vm.jobFilter = {};
            if (form)
                form.$setPristine();
            if (vm.isSearchHit) {
                vm.isSearchHit = false;
                vm.changeStatus();
            }
        };

        function searchV(obj, allJobs) {
            if (vm.jobFilter && vm.jobFilter.state) {
                obj.states = vm.jobFilter.state;
            }
            obj.compactView = vm.jobFilters.isCompact;
            JobService.get(obj).then(function (res) {
                let data = [];
                if (allJobs && allJobs.length > 0) {
                    for (let x = 0; x < allJobs.length; x++) {
                        for (let i = 0; i < res.jobs.length; i++) {
                            if (allJobs[x].path === res.jobs[i].path) {
                                allJobs[x] = mergePermanentAndVolatile(res.jobs[i], allJobs[x]);
                                allJobs[x].path1 = allJobs[x].path.substring(0, allJobs[x].path.lastIndexOf('/')) || allJobs[x].path.substring(0, allJobs[x].path.lastIndexOf('/') + 1);
                                data.push(allJobs[x]);
                                res.jobs.splice(i, 1);
                                break;
                            }
                        }
                    }
                    vm.allJobs = data;
                } else if (res.jobs && res.jobs.length) {
                    for (let i = 0; i < res.jobs.length; i++) {
                        res.jobs[i].path1 = res.jobs[i].path.substring(0, res.jobs[i].path.lastIndexOf('/')) || res.jobs[i].path.substring(0, res.jobs[i].path.lastIndexOf('/') + 1);
                    }
                    vm.allJobs = res.jobs;
                }
                if (vm.allJobs.length == 0) {
                    vm.hideTaskPanel(0);
                }
                vm.isLoaded = false;
                getFilteredData();
                traverseTreeForSearchData();
            }, function () {
                if (allJobs && allJobs.length > 0) {
                    for (let x = 0; x < allJobs.length; x++) {
                        allJobs[x].path1 = allJobs[x].path.substring(0, allJobs[x].path.lastIndexOf('/')) || allJobs[x].path.substring(0, allJobs[x].path.lastIndexOf('/') + 1);
                    }
                }
                vm.isLoaded = false;
                vm.allJobs = allJobs;
                getFilteredData();
                traverseTreeForSearchData();
            });
        }

        vm.search = function () {
            vm.isLoaded = true;
            vm.isSearchHit = true;
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.compact = true;
            if (vm.jobFilter && vm.jobFilter.regex) {
                obj.regex = vm.jobFilter.regex;
            }
            if (vm.jobFilter.type && vm.jobFilter.type.length > 0) {
                if (vm.jobFilter.type.length > 1) {
                } else {
                    obj.isOrderJob = vm.jobFilter.type[0] === 'order';
                }
            }
            if (vm.jobFilter && vm.jobFilter.paths && vm.jobFilter.paths.length > 0) {
                obj.folders = [];
                for (let i = 0; i < vm.jobFilter.paths.length; i++) {
                    obj.folders.push({folder: vm.jobFilter.paths[i], recursive: true});
                }
            }
            vm.folderPath = '/';
            JobService.getJobsP(obj).then(function (result) {
                searchV(obj, result.jobs);
            }, function () {
                vm.allJobs = [];
                searchV(obj, []);
            });
        };

        function traverseTreeForSearchData() {
            function traverseTree1(data) {
                for (let i = 0; i < data.folders.length; i++) {
                    data.folders[i].selected1 = false;
                    data.folders[i].expanded = true;
                    data.folders[i].jobs = [];
                    pushJob(data.folders[i]);
                    traverseTree1(data.folders[i]);
                }
            }

            function navFullTree() {
                for (let i = 0; i < vm.tree.length; i++) {
                    vm.tree[i].selected1 = true;
                    vm.tree[i].expanded = true;
                    vm.tree[i].jobs = [];
                    pushJob(vm.tree[i]);
                    traverseTree1(vm.tree[i]);
                }
            }

            function pushJob(data) {
                for (let i = 0; i < vm.allJobs.length; i++) {
                    if (data.path === vm.allJobs[i].path1) {
                        data.selected1 = true;
                        data.jobs.push(vm.allJobs[i]);
                    }
                }
            }

            navFullTree();
        }

        function isCustomizationSelected(flag) {
            if (flag) {
                vm.temp_filter.state = angular.copy(vm.jobFilters.filter.state);
                vm.temp_filter.type = angular.copy(vm.jobFilters.filter.type);
                vm.jobFilters.filter.state = '';
                vm.jobFilters.filter.type = '';
            } else {
                if (vm.temp_filter.state) {
                    vm.jobFilters.filter.state = angular.copy(vm.temp_filter.state);
                    vm.jobFilters.filter.type = angular.copy(vm.temp_filter.type);
                } else {
                    vm.jobFilters.filter.state = 'ALL';
                    vm.jobFilters.filter.type = 'ALL';
                }
            }
        }

        /**--------------- Begin of Custom.. -----------------------------*/
        vm.applyFilter = function () {
            vm.cancel();
            vm.jobFilter = {};
            vm.isUnique = true;
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/job-filter-dialog.html',
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
                configObj.objectType = "JOB";
                configObj.name = vm.jobFilter.name;
                configObj.id = 0;
                configObj.shared = vm.jobFilter.shared;

                configObj.configurationItem = JSON.stringify(vm.jobFilter);
                UserService.saveConfiguration(configObj).then(function (res) {
                    configObj.id = res.id;
                    vm.jobFilterList.push(configObj);
                    if (vm.jobFilterList.length === 1) {
                        vm.savedJobFilter.selected = res.id;
                        vm.selectedFiltered = vm.jobFilter;
                        vm.selectedFiltered.account = vm.permission.user;
                        vm.jobFilters.selectedView = true;
                        isCustomizationSelected(true);
                        SavedFilter.setJob(vm.savedJobFilter);
                        SavedFilter.save();
                        vm.load();
                    }
                });
                vm.object.paths = [];
            }, function () {
                vm.object.paths = [];
            });
        };
        vm.editFilters = function () {
            vm.filters = {};
            vm.filters.list = vm.jobFilterList;
            vm.filters.favorite = vm.savedJobFilter.favorite;
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
            temp_name = angular.copy(filter.name);
            UserService.configuration({jobschedulerId: filter.jobschedulerId, id: filter.id}).then(function (conf) {
                vm.jobFilter = JSON.parse(conf.configuration.configurationItem);
                vm.jobFilter.shared = filter.shared;
                vm.paths = vm.jobFilter.paths;
                vm.object.paths = vm.paths;
            });

            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/edit-job-filter-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                size: 'lg',
                backdrop: 'static'
            });
            modalInstance.result.then(function () {

                if (vm.savedJobFilter.selected === filter.id) {
                    vm.selectedFiltered = vm.jobFilter;
                    vm.jobFilters.selectedView = true;
                    isCustomizationSelected(true);
                    vm.load();
                }
                var configObj = {};
                configObj.jobschedulerId = filter.jobschedulerId;
                configObj.account = filter.account;
                configObj.configurationType = filter.configurationType;
                configObj.objectType = filter.objectType;
                configObj.configurationItem = JSON.stringify(vm.jobFilter);
                configObj.id = filter.id;
                configObj.name = vm.jobFilter.name;
                configObj.shared = vm.jobFilter.shared;
                filter.shared = vm.jobFilter.shared;
                UserService.saveConfiguration(configObj);
                filter.name = vm.jobFilter.name;
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
            UserService.configuration({jobschedulerId: filter.jobschedulerId, id: filter.id}).then(function (conf) {
                vm.jobFilter = JSON.parse(conf.configuration.configurationItem);
                vm.jobFilter.shared = filter.shared;
                vm.paths = vm.jobFilter.paths;
                vm.object.paths = vm.paths;
                vm.jobFilter.name = vm.checkCopyName(vm.jobFilterList, filter.name);
            });

            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/edit-job-filter-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                size: 'lg',
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                var configObj = {};
                configObj.account = vm.permission.user;
                configObj.jobschedulerId = filter.jobschedulerId;
                configObj.configurationType = filter.configurationType;
                configObj.objectType = filter.objectType;
                configObj.name = vm.jobFilter.name;
                configObj.id = 0;
                configObj.shared = vm.jobFilter.shared;
                configObj.configurationItem = JSON.stringify(vm.jobFilter);
                UserService.saveConfiguration(configObj).then(function (res) {
                    configObj.id = res.id;
                    vm.jobFilterList.push(configObj);
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
                angular.forEach(vm.jobFilterList, function (value, index) {
                    if (value.id === filter.id) {
                        vm.jobFilterList.splice(index, 1);
                    }
                });
                if (vm.savedJobFilter.selected === filter.id) {
                    vm.savedJobFilter.selected = undefined;
                    vm.jobFilters.selectedView = false;
                    isCustomizationSelected(false);
                    vm.selectedFiltered = undefined;
                    vm.load();
                } else {
                    if (vm.jobFilterList.length === 0) {
                        vm.savedJobFilter.selected = undefined;
                        vm.jobFilters.selectedView = false;
                        vm.selectedFiltered = undefined;
                        isCustomizationSelected(false);
                    }
                }
                SavedFilter.setJob(vm.savedJobFilter);
                SavedFilter.save();
            });
        };
        vm.makePrivate = function (configObj) {
            UserService.privateConfiguration({
                jobschedulerId: configObj.jobschedulerId,
                id: configObj.id
            }).then(function () {
                configObj.shared = false;
                if (vm.permission.user !== configObj.account) {
                    angular.forEach(vm.jobFilterList, function (value, index) {
                        if (value.id === configObj.id) {
                            vm.jobFilterList.splice(index, 1);
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
            vm.savedJobFilter.favorite = filter.id;
            vm.jobFilters.selectedView = true;
            vm.filters.favorite = filter.id;
            SavedFilter.setJob(vm.savedJobFilter);
            SavedFilter.save();
            vm.load();
        };
        vm.removeFavorite = function () {
            vm.savedJobFilter.favorite = '';
            vm.filters.favorite = '';
            SavedFilter.setJob(vm.savedJobFilter);
            SavedFilter.save();
        };

        vm.checkFilterName = function () {
            vm.isUnique = true;
            angular.forEach(vm.jobFilterList, function (value) {
                if (vm.jobFilter.name === value.name && vm.permission.user === value.account && vm.jobFilter.name !== temp_name) {
                    vm.isUnique = false;
                }
            })
        };

        vm.changeFilter = function (filter) {
            vm.cancel();
            if (filter) {
                vm.savedJobFilter.selected = filter.id;
                vm.jobFilters.selectedView = true;
                UserService.configuration({jobschedulerId: filter.jobschedulerId, id: filter.id}).then(function (conf) {
                    vm.selectedFiltered = JSON.parse(conf.configuration.configurationItem);
                    vm.selectedFiltered.account = filter.account;

                    if (vm.selectedFiltered.paths) {
                        vm.jobFilters.expand_to = {};
                    }
                    vm.load();
                });
            } else {
                isCustomizationSelected(false);
                vm.savedJobFilter.selected = filter;
                vm.jobFilters.selectedView = false;
                vm.selectedFiltered = filter;
                vm.load();
            }
            SavedFilter.setJob(vm.savedJobFilter);
            SavedFilter.save();
        };

        vm.getTreeStructure = function () {
            JobService.tree({
                jobschedulerId: vm.schedulerIds.selected,
                compact: true,
                types: ['JOB']
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
                if (data.path === value) {
                    if (data.folders.length > 0) {
                        data.folders = orderBy(data.folders, 'name');
                        angular.forEach(data.folders, function (res) {
                            vm.object.paths.push(res.path);
                        });
                    }
                }
            });
        };

        var watcher5 = $scope.$watchCollection('object.paths', function (newNames) {
            if (newNames && newNames.length > 0) {
                vm.paths = newNames;
            }
        });

        vm.addJobChainPaths = function () {
            vm.jobFilter.paths = vm.paths;
        };

        vm.remove = function (object) {
            for (let i = 0; i < vm.jobFilter.paths.length; i++) {
                if (angular.equals(vm.jobFilter.paths[i], object)) {
                    vm.jobFilter.paths.splice(i, 1);
                    break;
                }
            }
        };
        /**--------------- End of Customization -----------------------------*/


        vm.loadHistory = function (value) {
            var jobs = {};
            jobs.jobschedulerId = vm.schedulerIds.selected;
            jobs.job = value.path;
            JobService.history(jobs).then(function (res) {
                vm.taskHistory = res.history;
            });
        };

        vm.loadAuditLogs = function (value) {
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.jobs = [];
            obj.jobs.push({job: value.path});
            obj.limit = parseInt(vm.userPreferences.maxAuditLogRecords) < parseInt(vm.userPreferences.maxAuditLogPerObject) ? parseInt(vm.userPreferences.maxAuditLogRecords) : parseInt(vm.userPreferences.maxAuditLogPerObject);
            AuditLogService.getLogs(obj).then(function (result) {
                if (result && result.auditLog) {
                    vm.auditLogs = result.auditLog;
                }
            });
        };

        function getHistoryPanelData(value) {
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.jobs = [];
            obj.jobs.push({job: value.path});
            JobService.getJobsP(obj).then(function (res) {
                value = _.merge(value, res.job);
                obj.compactView = vm.jobFilters.isCompact;
                JobService.get(obj).then(function (result) {
                    value = mergePermanentAndVolatile(result.jobs[0], value);
                });
            }, function () {
                obj.compactView = vm.jobFilters.isCompact;
                JobService.get(obj).then(function (result) {
                    value = mergePermanentAndVolatile(result.jobs[0], value);
                });
            });
            if (value.ordersSummary)
                getQueueOrders(value);
        }

        vm.showTaskFuc = function (value, isRunning) {
            vm.allTaskCheck.checkbox = false;
            vm.object.tasks = [];
            if (isRunning)
                if (value.numOfRunningTasks === 0) return;
            vm.isAuditLog = false;
            vm.loadHistory(value);
            getHistoryPanelData(value);
            vm.showTaskPanel = value;
            vm.isRunning = isRunning;
        };

        vm.showAuditLogs = function (value) {
            vm.showTaskPanel = value;
            vm.allTaskCheck.checkbox = false;
            vm.object.tasks = [];
            vm.isAuditLog = true;
            if (vm.permission.AuditLog.view.status)
                vm.loadAuditLogs(value);
            getHistoryPanelData(value);
        };

        function getQueueOrders(value) {
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.job = value.path;
            obj.compactView = vm.jobFilters.isCompact;
            JobService.getQueueOrders(obj).then(function (res) {
                vm.queueOrders = res.job;
            });
        }

        vm.showJobChains = function (job) {
            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            jobs.jobs.push({job: job.path});
            JobService.getJobsP(jobs).then(function (res) {
                job.jobChains = res.jobs[0].jobChains;
                job.showJobChains = true;
                jobs.compactView = vm.jobFilters.isCompact;
                JobService.get(jobs).then(function (result) {
                    job = mergePermanentAndVolatile(result.jobs[0], job);
                    updatePanelHeight();
                });
            });

        };

        vm.hideJobChains = function (job) {
            job.showJobChains = false;
            job.runningTasks = [];
            updatePanelHeight();
        };

        vm.hideTaskPanel = function () {
            vm.showTaskPanel = undefined;
        };
        vm.expandDetails = function () {
            let obj = {};
            vm.isLoaded = true;
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.jobs = [];
            angular.forEach(vm.allJobs, function (value) {
                obj.jobs.push({job: value.path});
            });
            vm.isLoaded = true;

            JobService.getJobsP(obj).then(function (res) {
                vm.isLoaded = false;
                for (let m = 0; m < vm.allJobs.length; m++) {
                    for (let i = 0; i < res.jobs.length; i++) {
                        if (res.jobs[i].path === vm.allJobs[m].path && res.jobs[i].name === vm.allJobs[m].name) {
                            vm.allJobs[m].jobChains = res.jobs[i].jobChains;
                            vm.allJobs[m].showJobChains = true;
                            if (vm.allJobs[m].state && vm.allJobs[m].state._text === 'RUNNING') {
                                JobService.get({
                                    jobschedulerId: vm.schedulerIds.selected,
                                    jobs: [{job: vm.allJobs[m].path}],
                                    compactView: vm.jobFilters.isCompact
                                }).then(function (result) {
                                    if (vm.allJobs[m].path === result.jobs[0].path) {
                                        vm.allJobs[m] = mergePermanentAndVolatile(result.jobs[0], vm.allJobs[m]);
                                    }
                                });
                            }

                            res.jobs.splice(i, 1);
                            break;
                        }
                    }
                }
                updatePanelHeight();
            }, function () {
                vm.isLoaded = false;
            });
        };

        vm.collapseDetails = function () {
            for (let i = 0; i < vm.allJobs.length; i++) {
                vm.allJobs[i].showJobChains = false;
            }
            setTimeout(function () {
                updatePanelHeight();
            }, 1)
        };

        /**--------------- Actions -----------------------------*/
        vm.exportToExcel = function () {
            $('#exportToExcelBtn').attr("disabled", true);
            if (!vm.isIE()) {
                $('#jobTableId').table2excel({
                    exclude: ".tableexport-ignore",
                    filename: "jobscheduler-job",
                    fileext: ".xls",
                    exclude_img: false,
                    exclude_links: false,
                    exclude_inputs: false
                });
            } else {
                var ExportButtons = document.getElementById('jobTableId');
                var instance = new TableExport(ExportButtons, {
                    formats: ['xlsx'],
                    exportButtons: false
                });
                var exportData = instance.getExportData()['jobTableId']['xlsx'];
                instance.export2file(exportData.data, exportData.mimeType, "jobscheduler-job", exportData.fileExtension);
            }
            $('#exportToExcelBtn').attr("disabled", false);
        };

        vm.stop = function (job) {
            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            jobs.jobs.push({job: job.path});
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = job.path;
                vm.comments.title = job.title;
                vm.comments.operation = 'Stop';
                vm.comments.type = 'Job';

                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    jobs.auditLog = {};
                    if (vm.comments.comment)
                        jobs.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        jobs.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        jobs.auditLog.ticketLink = vm.comments.ticketLink;
                    JobService.stop(jobs);
                    vm.reset();
                }, function () {

                });
            } else {
                JobService.stop(jobs);
                vm.reset();
            }
        };
        vm.unstop = function (job) {
            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            jobs.jobs.push({job: job.path});
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = job.path;
                vm.comments.title = job.title;
                vm.comments.operation = 'Unstop';
                vm.comments.type = 'Job';

                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    jobs.auditLog = {};
                    if (vm.comments.comment)
                        jobs.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        jobs.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        jobs.auditLog.ticketLink = vm.comments.ticketLink;
                    JobService.unstop(jobs);
                    vm.reset();
                }, function () {

                });
            } else {
                JobService.unstop(jobs);
                vm.reset();
            }
        };
        vm.start = function (job) {
            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            jobs.jobs.push({job: job.path, at: 'now'});
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = job.path;
                vm.comments.title = job.title;
                vm.comments.operation = 'Start';
                vm.comments.type = 'Job';

                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    jobs.auditLog = {};
                    if (vm.comments.comment)
                        jobs.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        jobs.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        jobs.auditLog.ticketLink = vm.comments.ticketLink;
                    JobService.start(jobs);
                    vm.reset();
                }, function () {

                });
            } else {
                JobService.start(jobs);
                vm.reset();
            }
        };

        function startAt(job, paramObject) {
            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            var obj = {};
            obj.params = job.params;
            obj.job = job.path;

            if (job.date && job.time) {
                if (job.time === '24:00' || job.time === '24:00:00') {
                    job.date.setDate(job.date.getDate() + 1);
                    job.date.setHours(0);
                    job.date.setMinutes(0);
                    job.date.setSeconds(0);
                } else {
                    job.date.setHours(moment(job.time, 'HH:mm:ss').hours());
                    job.date.setMinutes(moment(job.time, 'HH:mm:ss').minutes());
                    job.date.setSeconds(moment(job.time, 'HH:mm:ss').seconds());
                }
                job.date.setMilliseconds(0);
            }
            if (job.date && job.at === 'later') {
                obj.at = moment(job.date).format("YYYY-MM-DD HH:mm:ss");
                obj.timeZone = job.timeZone;
            } else
                obj.at = job.atTime;

            if (!obj.params && paramObject.params.length > 0) {
                obj.params = paramObject.params;
            } else if (obj.params && paramObject.params.length > 0) {
                obj.params = obj.params.concat(paramObject.params);
            }

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

            jobs.jobs.push(obj);
            JobService.start(jobs);
        }

        vm.startAt = function (job) {
            vm.job = job;
            JobService.getJob({
                jobschedulerId: vm.schedulerIds.selected,
                compact: false,
                job: vm.job.path
            }).then(function (res) {
                vm.job = _.merge(vm.job, res.job);
            });
            vm.paramObject = {};
            vm.paramObject.params = [];
            vm.job.atTime = 'now';
            vm.comments = {};
            vm.comments.radio = 'predefined';
            vm.zones = moment.tz.names();

            if (vm.userPreferences.zone) {
                vm.job.timeZone = vm.userPreferences.zone;
            }
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/start-job-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                startAt(vm.job, vm.paramObject);
                vm.reset();
            }, function () {

            });
        };
        vm.stopAll = function () {
            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            angular.forEach(vm.object.jobs, function (value) {
                jobs.jobs.push({job: value.path});
            });
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = '';
                vm.comments.operation = 'Stop';
                vm.comments.type = 'Job';
                angular.forEach(vm.object.jobs, function (value, index) {
                    if (index === vm.object.jobs.length - 1) {
                        vm.comments.name = vm.comments.name + ' ' + value.path;
                    } else {
                        vm.comments.name = value.path + ', ' + vm.comments.name;
                    }
                });
                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    jobs.auditLog = {};
                    if (vm.comments.comment)
                        jobs.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        jobs.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        jobs.auditLog.ticketLink = vm.comments.ticketLink;
                    JobService.stop(jobs);
                    vm.reset();
                }, function () {

                });
            } else {
                JobService.stop(jobs);
                vm.reset();
            }
        };
        vm.unStopAll = function () {
            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            angular.forEach(vm.object.jobs, function (value) {
                jobs.jobs.push({job: value.path});
            });
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = '';
                vm.comments.operation = 'Unstop';
                vm.comments.type = 'Job';
                angular.forEach(vm.object.jobs, function (value, index) {
                    if (index === vm.object.jobs.length - 1) {
                        vm.comments.name = vm.comments.name + ' ' + value.path;
                    } else {
                        vm.comments.name = value.path + ', ' + vm.comments.name;
                    }
                });
                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    jobs.auditLog = {};
                    if (vm.comments.comment)
                        jobs.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        jobs.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        jobs.auditLog.ticketLink = vm.comments.ticketLink;
                    JobService.unstop(jobs);
                    vm.reset();
                }, function () {

                });
            } else {
                JobService.unstop(jobs);
                vm.reset();
            }
        };
        vm.startAll = function () {
            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            angular.forEach(vm.object.jobs, function (value) {
                jobs.jobs.push({job: value.path});
            });
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = '';
                vm.comments.operation = 'Start';
                vm.comments.type = 'Job';
                angular.forEach(vm.object.jobs, function (value, index) {
                    if (index === vm.object.jobs.length - 1) {
                        vm.comments.name = vm.comments.name + ' ' + value.path;
                    } else {
                        vm.comments.name = value.path + ', ' + vm.comments.name;
                    }
                });
                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    jobs.auditLog = {};
                    if (vm.comments.comment)
                        jobs.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        jobs.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        jobs.auditLog.ticketLink = vm.comments.ticketLink;
                    JobService.start(jobs);
                    vm.reset();
                }, function () {

                });
            } else {
                JobService.start(jobs);
                vm.reset();
            }
        };
        vm.reset = function () {
            vm.allCheck.checkbox = false;
            vm.object.jobs = [];
        };

        function terminateTaskWithTimeout(job, task, path) {

            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            if (!task) {

                if (!job) {
                    angular.forEach(vm.object.jobs, function (value) {
                        jobs.jobs.push({job: value.path});
                    });
                } else {
                    jobs.jobs.push({job: job.path});
                }
            } else {
                var taskIds = [];
                taskIds.push({taskId: task.taskId});
                jobs.jobs.push({job: path, taskIds: taskIds});
            }
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
            jobs.timeout = vm.timeObj.timeout;
            TaskService.terminateWith(jobs);
        }

        vm.terminateTaskWithTimeout = function (job, task, path) {
            if (job) {
                vm.job = job;
            } else if (task && path) {
                vm.task = task;
                vm.path = path;
            } else {
                vm.taskJobs = vm.object.jobs;
            }
            vm.timeObj = {};
            vm.timeObj.timeout = 10;
            vm.comments = {};
            vm.comments.radio = 'predefined';
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/terminate-task-timeout-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                terminateTaskWithTimeout(job, task, path);
                vm.reset();
            }, function () {

            });
        };
        vm.end = function (task, path) {
            var jobs = {};
            jobs.jobs = [];
            var taskIds = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            taskIds.push({taskId: task.taskId});
            jobs.jobs.push({job: path, taskIds: taskIds});
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = path;
                vm.comments.task = task.taskId;
                vm.comments.operation = 'End Task';
                vm.comments.type = 'Job';

                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    jobs.auditLog = {};
                    if (vm.comments.comment)
                        jobs.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        jobs.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        jobs.auditLog.ticketLink = vm.comments.ticketLink;
                    TaskService.end(jobs);
                    vm.reset();
                }, function () {

                });
            } else {
                TaskService.end(jobs);
                vm.reset();
            }
        };
        vm.killTask = function (task, path) {
            var jobs = {};
            jobs.jobs = [];
            var taskIds = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            taskIds.push({taskId: task.taskId});
            jobs.jobs.push({job: path, taskIds: taskIds});
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = path;
                vm.comments.task = task.taskId;
                vm.comments.operation = 'Kill Task';
                vm.comments.type = 'Job';

                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    jobs.auditLog = {};
                    if (vm.comments.comment)
                        jobs.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        jobs.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        jobs.auditLog.ticketLink = vm.comments.ticketLink;
                    TaskService.kill(jobs);
                    vm.reset();
                }, function () {

                });
            } else {
                TaskService.kill(jobs);
                vm.reset();
            }
        };
        vm.terminateTask = function (task, path) {
            var jobs = {};
            jobs.jobs = [];
            var taskIds = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            taskIds.push({taskId: task.taskId});
            jobs.jobs.push({job: path, taskIds: taskIds});
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = path;
                vm.comments.task = task.taskId;
                vm.comments.operation = 'Terminate Task';
                vm.comments.type = 'Job';

                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    jobs.auditLog = {};
                    if (vm.comments.comment)
                        jobs.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        jobs.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        jobs.auditLog.ticketLink = vm.comments.ticketLink;
                    TaskService.terminate(jobs);
                    vm.reset();
                }, function () {

                });
            } else {
                TaskService.terminate(jobs);
                vm.reset();
            }
        };
        vm.killAllTask = function (job) {
            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            if (!job) {
                angular.forEach(vm.object.jobs, function (value) {
                    jobs.jobs.push({job: value.path});
                });
            } else {
                jobs.jobs.push({job: job.path});
            }
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = '';
                vm.comments.operation = 'Kill all Task';
                vm.comments.type = 'Job';
                vm.comments.title = job.title;
                if (!job) {
                    angular.forEach(vm.object.jobs, function (value, index) {
                        if (index === vm.object.jobs.length - 1) {
                            vm.comments.name = vm.comments.name + ' ' + value.path;
                        } else {
                            vm.comments.name = value.path + ', ' + vm.comments.name;
                        }
                    });
                } else {
                    vm.comments.name = job.path;
                }
                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    jobs.auditLog = {};
                    if (vm.comments.comment)
                        jobs.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        jobs.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        jobs.auditLog.ticketLink = vm.comments.ticketLink;
                    TaskService.killAll(jobs);
                    vm.reset();
                }, function () {

                });
            } else {
                TaskService.killAll(jobs);
                vm.reset();
            }
        };
        vm.deleteAllTask = function () {
            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;

            var taskIds = [];
            angular.forEach(vm.object.tasks, function (value) {
                taskIds.push({taskId: value.taskId})
            });
            jobs.jobs.push({job: vm.showTaskPanel.path, taskIds: taskIds});

            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = '';
                vm.comments.operation = 'Delete all Task';
                vm.comments.type = 'Job';
                vm.comments.title = vm.showTaskPanel.title;

                vm.comments.name = vm.showTaskPanel.path;

                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    jobs.auditLog = {};
                    if (vm.comments.comment)
                        jobs.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        jobs.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        jobs.auditLog.ticketLink = vm.comments.ticketLink;
                    TaskService.killAll(jobs);
                    vm.allTaskCheck.checkbox = false;
                    vm.object.tasks = [];
                }, function () {
                    vm.allTaskCheck.checkbox = false;
                    vm.object.tasks = [];
                });
            } else {
                TaskService.killAll(jobs);
                vm.allTaskCheck.checkbox = false;
                vm.object.tasks = [];
            }
        };
        vm.terminateAllTask = function (job) {
            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            if (!job) {
                angular.forEach(vm.object.jobs, function (value) {
                    jobs.jobs.push({job: value.path});
                });
            } else {
                jobs.jobs.push({job: job.path});
            }
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = '';
                vm.comments.operation = 'Terminate all Task';
                vm.comments.type = 'Job';
                vm.comments.title = job.title;
                if (!job) {
                    angular.forEach(vm.object.jobs, function (value, index) {
                        if (index === vm.object.jobs.length - 1) {
                            vm.comments.name = vm.comments.name + ' ' + value.path;
                        } else {
                            vm.comments.name = value.path + ', ' + vm.comments.name;
                        }
                    });
                } else {
                    vm.comments.name = job.path;
                }

                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    jobs.auditLog = {};
                    if (vm.comments.comment)
                        jobs.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        jobs.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        jobs.auditLog.ticketLink = vm.comments.ticketLink;
                    TaskService.terminateAll(jobs);
                    vm.reset();
                }, function () {

                });
            } else {
                TaskService.terminateAll(jobs);
                vm.reset();
            }
        };

        function setRunTime(job) {
            var jobs = {};
            jobs.jobs = [];

            jobs.jobs.push({
                job: job.path,
                runTime: vkbeautify.xmlmin(job.runTime),
                calendars: job.calendars
            });

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
            jobs.jobschedulerId = vm.schedulerIds.selected;
            JobService.setRunTime(jobs);
        }

        function loadRuntime(job) {
            vm.order = job;
            vm.comments = {};
            vm.comments.radio = 'predefined';
            vm.scheduleAction = undefined;
            JobService.getRunTime({
                jobschedulerId: vm.schedulerIds.selected,
                job: job.path
            }).then(function (res) {
                if (res.runTime) {
                    vm.runTimes = res.runTime;
                    vm.xml = vm.runTimes.runTime;
                    vm.calendars = vm.runTimes.calendars;
                }
                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/set-run-time-dialog.html',
                    controller: 'RuntimeEditorDialogCtrl',
                    scope: vm,
                    size: 'lg',
                    backdrop: 'static',
                    windowClass: 'fade-modal'
                });
                modalInstance.result.then(function () {
                    setRunTime(job);
                    vm.reset();
                }, function () {

                });

            });
        }

        vm.setRunTime = function (job) {
            loadRuntime(job);
        };
        vm.deleteAllOrder = function () {
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;

            angular.forEach(vm.object.orders, function (value) {
                orders.orders.push({orderId: value.orderId, jobChain: value.jobChain});
            });

            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = '';
                vm.comments.operation = 'Delete';
                vm.comments.type = 'Order';
                angular.forEach(vm.object.orders, function (value, index) {
                    if (index === vm.object.orders.length - 1) {
                        vm.comments.name = vm.comments.name + ' ' + value.path;
                    } else {
                        vm.comments.name = value.path + ', ' + vm.comments.name;
                    }
                });
                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    orders.auditLog = {};
                    if (vm.comments.comment)
                        orders.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        orders.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        orders.auditLog.ticketLink = vm.comments.ticketLink;

                    OrderService.deleteOrder(orders).then(function () {
                        vm.allOrderCheck.checkbox = false;
                        vm.object.orders = [];
                    });

                }, function () {
                    vm.allOrderCheck.checkbox = false;
                    vm.object.orders = [];
                });
            } else {
                OrderService.deleteOrder(orders).then(function () {
                    vm.allOrderCheck.checkbox = false;
                    vm.object.orders = [];
                });
            }
        };
        vm.showAssignedCalendar = function (job) {
            var jobs = {};
            jobs.jobschedulerId = vm.schedulerIds.selected;
            jobs.job = job.path;
            jobs.compact = true;
            JobService.getcalendars(jobs).then(function (res) {
                vm.obj = angular.copy(job);
                vm.obj.calendars = res.calendars;
            });
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/show-assigned-calendar-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                backdrop: 'static'
            });
            modalInstance.result.then(function () {

            }, function () {

            });
        };
        vm.deleteOrder = function (order) {
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            orders.orders.push({orderId: order.orderId, jobChain: order.jobChain});
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = order.path;
                vm.comments.title = order.title;
                vm.comments.operation = 'Delete';
                vm.comments.type = 'Order';
                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    orders.auditLog = {};
                    if (vm.comments.comment)
                        orders.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        orders.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        orders.auditLog.ticketLink = vm.comments.ticketLink;
                    OrderService.deleteOrder(orders).then(function () {
                        vm.allOrderCheck.checkbox = false;
                        vm.object.orders = [];

                    });
                }, function () {
                    vm.allOrderCheck.checkbox = false;
                    vm.object.orders = [];
                });
            } else {
                OrderService.deleteOrder(orders).then(function () {
                    vm.allOrderCheck.checkbox = false;
                    vm.object.orders = [];
                });
            }
        };

        vm.assignedDocument = function (job) {
            vm.assignObj = {
                type: 'Job',
                path: job.path,
            };
            let obj = {jobschedulerId: vm.schedulerIds.selected, job: job.path};
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
                JobService.assign(obj).then(function (res) {
                    job.documentation = vm.assignObj.documentation;
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

        vm.unassignedDocument = function (job) {
            let obj = {jobschedulerId: vm.schedulerIds.selected, job: job.path};
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = job.path;
                vm.comments.operation = 'Unassign Documentation';
                vm.comments.type = 'Job';

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
                    JobService.unassign(obj).then(function () {
                        job.documentation = undefined;
                    });
                }, function () {

                });
            } else {
                JobService.unassign(obj).then(function () {
                    job.documentation = undefined;
                });
            }
        };

        vm.getPlan = function (calendarView, viewDate) {
            var date = '';
            if (calendarView === 'year') {
                if (viewDate.getFullYear() < new Date().getFullYear()) {
                    return;
                } else if (viewDate.getFullYear() === new Date().getFullYear()) {
                    date = "+0y";
                } else {
                    date = "+" + viewDate.getFullYear() - new Date().getFullYear() + "y";
                }
            }
            if (calendarView === 'month') {
                if (viewDate.getFullYear() <= new Date().getFullYear() && viewDate.getMonth() < new Date().getMonth()) {
                    return;
                } else if (viewDate.getFullYear() === new Date().getFullYear() && viewDate.getMonth() === new Date().getMonth()) {
                    date = "+" + viewDate.getMonth() - new Date().getMonth() + "M";
                } else {
                    date = "+" + viewDate.getMonth() - (new Date().getMonth() - (12 * (viewDate.getFullYear() - new Date().getFullYear()))) + "M";
                }
            }

            vm.planItems = [];
            vm.isCaledarLoading = true;
            DailyPlanService.getPlans({
                jobschedulerId: $scope.schedulerIds.selected,
                states: ['PLANNED'],
                job: vm._job.path,
                dateFrom: date,
                dateTo: date,
                timeZone: vm.userPreferences.zone
            }).then(function (res) {
                populatePlanItems(res);
                vm.isCaledarLoading = false;
            }, function () {
                vm.isCaledarLoading = false;
            });

        };
        vm.viewCalendar = function (job) {
            vm.maxPlannedTime = undefined;
            vm._job = angular.copy(job);
            vm.planItems = [];
            vm.isCaledarLoading = true;

            DailyPlanService.getPlans({
                jobschedulerId: $scope.schedulerIds.selected,
                states: ['PLANNED'],
                job: vm._job.path,
                dateFrom: "+0M",
                dateTo: "+0M",
                timeZone: vm.userPreferences.zone
            }).then(function (res) {
                populatePlanItems(res);
                vm.isCaledarLoading = false;
            }, function () {
                vm.isCaledarLoading = false;
            });
            openCalendar();
        };

        function populatePlanItems(res) {
            vm.planItemData = res.planItems;
            vm.planItemData.forEach(function (data) {
                var planData = {
                    plannedStartTime: moment(data.plannedStartTime).tz(vm.userPreferences.zone)
                };
                vm.planItems.push(planData);
                if (res.created) {
                    vm.maxPlannedTime = new Date(res.created.until);
                }
            });
        }

        function openCalendar() {
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/calendar-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                size: 'lg',
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                vm._job = null;
            }, function () {
                vm._job = null;
            });
        }

        vm.viewAllHistories = function () {
            vm.taskHistoryTab = CoreService.getHistoryTab();
            vm.taskHistoryTab.type = 'job';
            $state.go('app.history');
        };

        vm.recursiveTreeUpdate = function (scrTree, destTree) {
            if (scrTree && destTree)
                for (let i = 0; i < scrTree.length; i++) {
                    for (let j = 0; j < destTree.length; j++) {
                        if (scrTree[i].path === destTree[j].path) {
                            scrTree[i].jobs = destTree[j].jobs;
                            scrTree[i].expanded = destTree[j].expanded;
                            scrTree[i].selected = destTree[j].selected;
                            scrTree[i].selected1 = destTree[j].selected1;
                            vm.recursiveTreeUpdate(scrTree[i].folders, destTree[j].folders);
                            destTree.splice(j, 1);
                            break;
                        }
                    }
                }
            return scrTree;
        };

        vm.assignWorkflow = function () {
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/assign-workflow-dialog.html',
                controller: 'DialogCtrl1',
                scope: vm,
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                vm.object.jobs = [];
            }, function () {
                vm.object.jobs = [];
            });
        };

        vm.editConditions = function (job) {
            vm._job = angular.copy(job);
            ConditionService.inCondition({
                jobschedulerId: $scope.schedulerIds.selected,
                jobs: [{job : job.path}]
            }).then(function (res) {
                if(res.jobsInconditions && res.jobsInconditions.length > 0 ) {
                    vm._job.inconditions = res.jobsInconditions[0].inconditions;
                    if (vm._job.inconditions && vm._job.inconditions.length > 0) {
                        openDialog();
                    }
                }
                ConditionService.outCondition({
                    jobschedulerId: $scope.schedulerIds.selected,
                    jobs: [{job : job.path}]
                }).then(function (result) {
                    if(result.jobsOutconditions && result.jobsOutconditions.length > 0 ) {
                        vm._job.outconditions = result.jobsOutconditions[0].outconditions;
                        if (vm._job.inconditions && vm._job.inconditions.length === 0) {
                            openDialog();
                        }
                    }
                });


            })
        };

        function openDialog() {
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/conditions-dialog.html',
                controller: 'EditConditionDialogCtrl',
                scope: vm,
                size: 'lg',
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                ConditionService.updateInCondition({
                    masterId: $scope.schedulerIds.selected,
                    jobsInconditions: [{job: vm._job.path, inconditions : vm._job.inconditions}]
                });
                ConditionService.updateOutCondition({
                    masterId: $scope.schedulerIds.selected,
                    jobsOutconditions: [{job: vm._job.path, outconditions : vm._job.outconditions}]
                });
            }, function () {
                vm._job = null;
            });
        }

        vm.resetWorkflow = function (workflow, job) {
            vm.workflow = workflow;
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/confirm-dialog.html',
                controller: 'DialogCtrl1',
                scope: vm,
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                ConditionService.resetWorkflow({
                    "masterId": $scope.schedulerIds.selected,
                    "job": job,
                    "workflow": workflow
                }).then(function (res) {
                    console.log(res);
                }, function () {

                })
            }, function () {

            });

        };

        function checkCurrentSelectedFolders(job) {
            job.path1 = job.path.substring(0, job.path.lastIndexOf('/')) || job.path.substring(0, job.path.lastIndexOf('/') + 1);
            for (let i = 0; i < vm.tree.length; i++) {
                if (vm.tree[i].path !== job.path1) {
                    traverseTreeForUpdateJob(vm.tree[i], job);
                } else {
                    if (vm.tree[i].selected1) {
                        vm.allJobs.push(job);
                        mergePermanentData(job.path);
                        break;
                    }
                }
            }
        }

        function traverseTreeForUpdateJob(data, job) {
            if (data.folders)
                for (let i = 0; i < data.folders.length; i++) {
                    if (data.folders[i].path !== job.path1) {
                        traverseTreeForUpdateJob(data.folders[i], job);
                    } else {
                        if (data.folders[i].selected1) {
                            vm.allJobs.push(job);
                            mergePermanentData(job.path);
                            break;
                        }
                    }
                }
        }

        function mergePermanentData(path) {
            var obj = {};
            obj.jobschedulerId = $scope.schedulerIds.selected;
            obj.jobs = [];
            obj.jobs.push({job: path});
            JobService.getJobsP(obj).then(function (res) {
                for (let i = 0; i < vm.allJobs.length; i++) {
                    if (vm.allJobs[i].path === res.jobs[0].path) {
                        vm.allJobs[i] = mergePermanentAndVolatile(vm.allJobs[i], res.jobs[0]);
                        getFilteredData();
                        break;
                    }
                }
            });
        }

        var isOperationGoingOn = false, isAnyFileEventOnHold = false, isFuncCalled = false, jobPaths = [];
        $scope.$on('event-started', function () {

            if (!isOperationGoingOn) {
                if (vm.events && vm.events.length > 0 && vm.events[0].eventSnapshots) {
                    for (let m = 0; m < vm.events[0].eventSnapshots.length; m++) {
                        if (vm.events[0].eventSnapshots[m].eventType === "JobStateChanged" && !vm.events[0].eventSnapshots[m].eventId) {
                            if (vm.events[0].eventSnapshots[m].path) {
                                var path = [];
                                if (vm.events[0].eventSnapshots[m].path.indexOf(",") > -1) {
                                    path = vm.events[0].eventSnapshots[m].path.split(",");
                                } else {
                                    path[0] = vm.events[0].eventSnapshots[m].path;
                                }
                                if ($location.search().path) {
                                    if (vm.events[0].eventSnapshots[m].path === $location.search().path) {
                                        let obj = {};
                                        obj.jobschedulerId = vm.schedulerIds.selected;
                                        obj.jobs = [{job: $location.search().path}];
                                        getJobByPathV(obj);
                                    }
                                } else {
                                    var obj = {};
                                    obj.jobschedulerId = $scope.schedulerIds.selected;
                                    obj.jobs = [];
                                    obj.jobs.push({job: path[0]});
                                    obj.compactView = vm.jobFilters.isCompact;
                                    JobService.get(obj).then(function (res) {
                                        if (res.jobs && res.jobs.length > 0) {
                                            var flag = false;
                                            for (let i = 0; i < vm.allJobs.length; i++) {
                                                if (vm.allJobs[i].path === res.jobs[0].path) {
                                                    flag = true;
                                                    if (vm.jobFilters.filter.state === 'ALL' || res.jobs[0].state._text === vm.jobFilters.filter.state) {
                                                        vm.allJobs[i] = mergePermanentAndVolatile(res.jobs[0], vm.allJobs[i]);
                                                        if (vm.allJobs[i].state && vm.allJobs[i].state._text === 'RUNNING' && vm.showTask) {
                                                            vm.allJobs[i].showJobChains = true;
                                                        }
                                                        if (vm.showTaskPanel && (vm.showTaskPanel.path === vm.allJobs[i].path)) {
                                                            vm.showTaskPanel = vm.allJobs[i];
                                                        }
                                                    } else {
                                                        for (let j = 0; j < vm.allJobs.length; j++) {
                                                            if (vm.allJobs[j].path === res.jobs[0].path) {
                                                                vm.allJobs.splice(j, 1);
                                                                break;
                                                            }
                                                        }
                                                    }
                                                    break;
                                                }
                                            }
                                            if (!flag) {
                                                if (res.jobs[0].state._text === vm.jobFilters.filter.state) {
                                                    checkCurrentSelectedFolders(res.jobs[0]);
                                                }
                                            }
                                            getFilteredData();
                                        }
                                    });
                                }
                            }
                        } else if (vm.showTaskPanel && vm.events[0].eventSnapshots[m].eventType === "ReportingChangedJob" && !vm.events[0].eventSnapshots[m].eventId && !vm.isAuditLog) {
                            let jobs = {};
                            jobs.jobschedulerId = vm.schedulerIds.selected;
                            jobs.job = vm.showTaskPanel.path;
                            JobService.history(jobs).then(function (res) {
                                vm.taskHistory = res.history;
                            });
                        } else if (vm.showTaskPanel && vm.events[0].eventSnapshots[m].eventType === "AuditLogChanged" && vm.events[0].eventSnapshots[m].objectType === "JOB" && vm.events[0].eventSnapshots[m].path === vm.showTaskPanel.path && vm.isAuditLog) {
                            if (vm.permission.AuditLog.view.status)
                                vm.loadAuditLogs(vm.showTaskPanel);
                        } else if (vm.events[0].eventSnapshots[m].eventType === "InventoryInitialized" || (vm.events[0].eventSnapshots[m].eventType === "FileBasedActivated" || vm.events[0].eventSnapshots[m].eventType === "FileBasedRemoved") && vm.events[0].eventSnapshots[m].objectType === "JOB" && !$location.search().path) {
                            let folders = [];
                            if (vm.selectedFiltered && vm.selectedFiltered.paths && vm.selectedFiltered.paths.length > 0) {
                                angular.forEach(vm.selectedFiltered.paths, function (v) {
                                    folders.push({folder: v});
                                });
                            }
                            JobService.tree({
                                jobschedulerId: vm.schedulerIds.selected,
                                compact: true,
                                folders: folders,
                                types: ['JOB']
                            }).then(function (res) {
                                vm.tree = vm.recursiveTreeUpdate(angular.copy(res.folders), vm.tree);
                                vm.changeStatus(true);

                            });
                            break;
                        } else if (vm.events[0].eventSnapshots[m].eventType === "JobTaskQueueChanged" && vm.showTaskPanel) {
                            getHistoryPanelData(vm.showTaskPanel);
                        }
                    }
                }
            } else {
                if (vm.events && vm.events.length > 0 && vm.events[0].eventSnapshots) {
                    for (let j = 0; j < vm.events[0].eventSnapshots.length; j++) {
                        if (vm.events[0].eventSnapshots[j].eventType === 'JobStateChanged' && !vm.events[0].eventSnapshots[j].eventId) {
                            if (jobPaths.indexOf(vm.events[0].eventSnapshots[j].path) == -1) {
                                jobPaths.push(vm.events[0].eventSnapshots[j].path);
                            }
                        } else if (vm.events[0].eventSnapshots[j].eventType === "InventoryInitialized" || (vm.events[0].eventSnapshots[j].eventType === "FileBasedActivated" || vm.events[0].eventSnapshots[j].eventType === "FileBasedRemoved") && vm.events[0].eventSnapshots[j].objectType === "JOB") {
                            isAnyFileEventOnHold = true;
                            break;
                        }
                    }
                }
            }
        });

        $scope.$on('stopEvents', function () {
            isOperationGoingOn = true;
            isAnyFileEventOnHold = false;
            isFuncCalled = false;
            jobPaths = [];
        });

        $scope.$on('startEvents', function () {
            isOperationGoingOn = false;
            if (!isFuncCalled) {
                refreshUIWithHoldEvents();
            }
        });

        function refreshUIWithHoldEvents() {
            isFuncCalled = true;
            let arr = [];
            for (let i = 0; i < vm.allJobs.length; i++) {
                for (let j = 0; j < jobPaths.length; j++) {
                    if (jobPaths[j] === vm.allJobs[i].path) {
                        arr.push({job: jobPaths[j]});
                        jobPaths.splice(j, 1);
                        break;
                    }
                }
            }

            if (!isAnyFileEventOnHold) {
                if (arr.length == 0) {
                    return;
                }
                let obj = {};
                obj.jobschedulerId = $scope.schedulerIds.selected;
                obj.jobs = arr;
                obj.compactView = vm.jobFilters.isCompact;
                JobService.get(obj).then(function (res) {
                    if (res.jobs && res.jobs.length > 0) {
                        var flag = false;
                        for (let i = 0; i < vm.allJobs.length; i++) {
                            if (vm.allJobs[i].path === res.jobs[0].path) {
                                flag = true;
                                if (vm.jobFilters.filter.state === 'ALL' || res.jobs[0].state._text === vm.jobFilters.filter.state) {
                                    vm.allJobs[i] = mergePermanentAndVolatile(res.jobs[0], vm.allJobs[i]);
                                    if (vm.allJobs[i].state && vm.allJobs[i].state._text === 'RUNNING' && vm.showTask) {
                                        vm.allJobs[i].showJobChains = true;
                                    }
                                    if (vm.showTaskPanel && (vm.showTaskPanel.path === vm.allJobs[i].path)) {
                                        vm.showTaskPanel = vm.allJobs[i];
                                    }
                                } else {
                                    for (let j = 0; j < vm.allJobs.length; j++) {
                                        if (vm.allJobs[j].path === res.jobs[0].path) {
                                            vm.allJobs.splice(j, 1);
                                            break;
                                        }
                                    }
                                }
                                break;
                            }
                        }
                        if (!flag) {
                            if (res.jobs[0].state._text === vm.jobFilters.filter.state) {
                                checkCurrentSelectedFolders(res.jobs[0]);
                            }
                        }
                        getFilteredData();
                    }
                });
            } else {
                if ($location.search().path) {
                    return;
                }
                let folders = [];
                if (vm.selectedFiltered && vm.selectedFiltered.paths && vm.selectedFiltered.paths.length > 0) {
                    angular.forEach(vm.selectedFiltered.paths, function (v) {
                        folders.push({folder: v});
                    });
                }
                JobService.tree({
                    jobschedulerId: vm.schedulerIds.selected,
                    compact: true,
                    folders: folders,
                    types: ['JOB']
                }).then(function (res) {
                    isFuncCalled = false;
                    vm.tree = vm.recursiveTreeUpdate(angular.copy(res.folders), vm.tree);
                    vm.changeStatus();
                });

            }
        }

        var watcher6 = $scope.$watchCollection('filtered', function (newNames) {
            if (newNames)
                vm.object.jobs = [];
        });

        var watcher7 = $scope.$watchCollection('pageView', function (newValue, oldValue) {
            if (newValue && oldValue) {
                if (newValue === 'grid' && oldValue === 'list') {
                    vm.changeStatus();
                } else {
                    getFilteredData();
                }
            }
        });


        vm.resizerHeight = 450;
        vm.resizerHeightInfo;
        vm.isInfoResize = false;

        vm.resetPanel = function () {
            if ($location.search().scheduler_id && $location.search().path) {
                vm.isInfoResize = false;
                _updatePanelHeight('info');
            } else {
                let rsHt = JSON.parse(SavedFilter.resizerHeight) || {};
                if (rsHt.job && typeof rsHt.job === 'object') {
                    if (rsHt.job[vm.folderPath]) {
                        delete rsHt.job[vm.folderPath];
                        SavedFilter.setResizerHeight(rsHt);
                        SavedFilter.save();
                        _updatePanelHeight();
                    }
                }
            }
        };

        $scope.$on('angular-resizable.resizeEnd', function (event, args) {
            if (args.id === 'jobDivId') {
                let rsHt = JSON.parse(SavedFilter.resizerHeight) || {};
                if (rsHt.job && typeof rsHt.job === 'object') {
                    rsHt.job[vm.folderPath] = args.height;
                } else {
                    rsHt.job = {};
                }
                rsHt.job[vm.folderPath] = args.height;
                SavedFilter.setResizerHeight(rsHt);
                SavedFilter.save();
                vm.resizerHeight = args.height;
            } else if (args.id === 'jobInfoDivId') {
                vm.resizerHeightInfo = args.height;
                vm.isInfoResize = true;
            }
        });

        vm.startConditionResolver = function(){
            vm.$broadcast('startConditionResolver');
        };

        vm.zoomIn = function () {
            vm.$broadcast('zoomIn');
        };

        vm.zoomOut = function () {
            vm.$broadcast('zoomOut');
        };

        vm.actual = function () {
            vm.$broadcast('actual');
        };

        vm.fit = function () {
            vm.$broadcast('fit');
        };

        $scope.$on('$destroy', function () {
            vm.jobFilters.expand_to = vm.tree;
            vm.jobFilters.showTaskPanel = vm.showTaskPanel;
            watcher1();
            watcher2();
            watcher3();
            watcher4();
            watcher5();
            watcher6();
            watcher7();
        });
    }

    JobOverviewCtrl.$inject = ["$scope", "$rootScope", "JobService", "$uibModal", "TaskService", "CoreService", "OrderService", "DailyPlanService", "AuditLogService", "$stateParams", "$filter", "SavedFilter", "$timeout"];

    function JobOverviewCtrl($scope, $rootScope, JobService, $uibModal, TaskService, CoreService, OrderService, DailyPlanService, AuditLogService, $stateParams, $filter, SavedFilter, $timeout) {
        var vm = $scope;
        vm.jobFilters = CoreService.getJobDetailTab();
        vm.jobFilters.isCompact = vm.userPreferences.isJobOverviewCompact == undefined ? vm.userPreferences.isCompact : vm.userPreferences.isJobOverviewCompact;
        vm.maxEntryPerPage = vm.userPreferences.maxEntryPerPage;

        vm.showTask = vm.userPreferences.showTasks;

        vm.allJobs = [];
        vm.jobFilters.filter.state = $stateParams.name;
        vm.object = {};
        $scope.reloadState = 'no';

        vm.reload = function () {
            if ($scope.reloadState == 'no') {
                $scope.allJobs = [];
                $scope.folderPath = 'Process aborted';
                $scope.reloadState = 'yes';
            } else if ($scope.reloadState == 'yes') {
                $scope.reloadState = 'no';
                vm.isLoading = false;
                $scope.init();
            }
        };

        function mergePermanentAndVolatile(sour, dest) {
            dest.runningTasks = sour.runningTasks;
            dest.error = sour.error;
            dest.numOfRunningTasks = sour.numOfRunningTasks;
            dest.numOfQueuedTasks = sour.numOfQueuedTasks;
            dest.taskQueue = sour.taskQueue;
            dest.nextStartTime = sour.nextStartTime;
            dest.startedAt = sour.startedAt;
            dest.state = sour.state;
            dest.stateText = sour.stateText;
            dest.configurationStatus = sour.configurationStatus;
            dest.ordersSummary = sour.ordersSummary;
            dest.path1 = sour.path1;
            if (sour.maxTasks)
                dest.maxTasks = sour.maxTasks;
            if (sour.title)
                dest.title = sour.title;
            return dest;
        }

        vm.init = function () {
            var obj = {};
            vm.isLoaded = true;
            $scope.reloadState = 'no';
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.compact = true;
            obj.states = [];
            vm.status = vm.jobFilters.filter.state;
            if (vm.jobFilters.filter.state !== 'ALL') {
                obj.states.push(vm.jobFilters.filter.state);
                obj.compactView = vm.jobFilters.isCompact;
                if (vm.jobFilters.filter.state == 'RUNNING') {
                    obj.compact = false;
                }

                JobService.get(obj).then(function (res) {
                    obj.jobs = [];
                    angular.forEach(res.jobs, function (value) {
                        obj.jobs.push({job: value.path});
                        value.path1 = value.path.substring(1, value.path.lastIndexOf('/'));
                    });
                    vm.allJobs = res.jobs;
                    if (obj.jobs.length > 0) {
                        JobService.getJobsP(obj).then(function (result) {
                            for (let i = 0; i < vm.allJobs.length; i++) {
                                for (let j = 0; j < result.jobs.length; j++) {
                                    if (vm.allJobs[i].path === result.jobs[j].path) {
                                        vm.allJobs[i] = mergePermanentAndVolatile(vm.allJobs[i], result.jobs[j]);
                                        result.jobs.splice(j, 1);
                                        break;
                                    }
                                }
                            }
                            updatePanelHeight();
                        }, function () {
                            updatePanelHeight();
                        });
                    }
                    vm.isLoading = true;
                    vm.isLoaded = false;
                }, function () {
                    vm.isLoading = true;
                    vm.isLoaded = false;
                    vm.isError = true;
                });
            } else {
                JobService.getJobsP(obj).then(function (res) {
                    for (let i = 0; i < res.jobs.length; i++) {
                        res.jobs[i].path1 = res.jobs[i].path.substring(1, res.jobs[i].path.lastIndexOf('/'));
                    }
                    vm.allJobs = res.jobs;
                    vm.isLoading = true;
                    obj.compactView = vm.jobFilters.isCompact;
                    JobService.get(obj).then(function (result) {
                        for (let i = 0; i < vm.allJobs.length; i++) {
                            for (let j = 0; j < result.jobs.length; j++) {
                                if (vm.allJobs[i].path === result.jobs[j].path) {
                                    vm.allJobs[i] = mergePermanentAndVolatile(result.jobs[j], vm.allJobs[i]);
                                    result.jobs.splice(j, 1);
                                    break;
                                }
                            }
                        }
                        updatePanelHeight();
                    }, function () {
                        updatePanelHeight();
                    });

                }, function () {
                    vm.isLoading = true;
                });
            }
        };
        vm.init();

        vm.toggleCompactView = function () {
            vm.jobFilters.isCompact = !vm.jobFilters.isCompact;
            if (!vm.jobFilters.isCompact) {
                vm.init();
            }
            vm.userPreferences.isJobOverviewCompact = vm.jobFilters.isCompact;
            vm.saveProfileSettings(vm.userPreferences);
        };

        vm.changeStatus = function () {
            vm.isLoading = false;
            vm.hideTaskPanel();
            vm.init();
        };
        $scope.$on("jobState", function (evt, state) {
            if (state) {
                vm.jobFilters.filter.state = state;
                vm.changeStatus();
            }
        });

        vm.exportToExcel = function () {
            $('#exportToExcelBtn').attr("disabled", true);

            if (!vm.isIE()) {
                $('#jobTableId').table2excel({
                    exclude: ".tableexport-ignore",
                    filename: "jobscheduler-job",
                    fileext: ".xls",
                    exclude_img: false,
                    exclude_links: false,
                    exclude_inputs: false
                });
            } else {
                var ExportButtons = document.getElementById('jobTableId');
                var instance = new TableExport(ExportButtons, {
                    formats: ['xlsx'],
                    exportButtons: false
                });
                var exportData = instance.getExportData()['jobTableId']['xlsx'];
                instance.export2file(exportData.data, exportData.mimeType, "jobscheduler-job", exportData.fileExtension);
            }
            $('#exportToExcelBtn').attr("disabled", false);
        };

        /**--------------- Checkbox functions -------------*/
        vm.allCheck = {
            checkbox: false
        };
        vm.allTaskCheck = {checkbox: false};
        vm.allOrderCheck = {checkbox: false};


        var watcher1 = $scope.$watchCollection('object.jobs', function (newNames) {
            if (newNames && newNames.length > 0) {
                vm.allCheck.checkbox = newNames.length === vm.allJobs.slice((vm.userPreferences.entryPerPage * (vm.jobFilters.currentPage - 1)), (vm.userPreferences.entryPerPage * vm.jobFilters.currentPage)).length;

                vm.isTasks = false;
                vm.isStopped = false;
                vm.isUnstopped = false;
                vm.isStart = false;
                angular.forEach(newNames, function (value) {
                    if (value.state && value.state._text === 'RUNNING') {
                        vm.isTasks = true;
                    }
                    if (value.state && value.state._text === 'STOPPED') {
                        vm.isStopped = true;
                    } else {
                        vm.isUnstopped = true;
                    }
                    if ((value.ordersSummary && value.ordersSummary.pending) || (value.configurationStatus && value.configurationStatus.severity === 2)) {
                        vm.isStart = true;
                    }
                    if (value.isShellJob === true) {
                        vm.isStart = false;
                    }
                });
            } else {
                vm.reset();
            }
        });

        var watcher2 = $scope.$watchCollection('object.tasks', function (newNames) {
            if (newNames && newNames.length > 0 && vm.showTaskPanel.taskQueue) {
                vm.allTaskCheck.checkbox = newNames.length === vm.showTaskPanel.taskQueue.length;
            } else {
                vm.allTaskCheck.checkbox = false;
                vm.object.tasks = [];
            }
        });

        var watcher3 = $scope.$watchCollection('object.orders', function (newNames) {
            if (newNames && newNames.length > 0 && vm.queueOrders && vm.queueOrders.orderQueue) {
                vm.allOrderCheck.checkbox = newNames.length === vm.queueOrders.orderQueue.length;
            } else {
                vm.allOrderCheck.checkbox = false;
                vm.object.orders = [];
            }
        });

        var watcher4 = $scope.$watch('userPreferences.entryPerPage', function (newNames) {
            if (newNames)
                vm.reset();
        });
        vm.checkAll = function () {
            if (vm.allCheck.checkbox && vm.allJobs.length > 0) {
                var _job = $filter('orderBy')($scope.allJobs, vm.jobFilters.filter.sortBy, vm.jobFilters.reverse);
                vm.object.jobs = _job.slice((vm.userPreferences.entryPerPage * (vm.jobFilters.currentPage - 1)), (vm.userPreferences.entryPerPage * vm.jobFilters.currentPage));
            } else {
                vm.reset();
            }
        };
        vm.checkAllTask = function () {
            if (vm.showTaskPanel.taskQueue && vm.allTaskCheck.checkbox && vm.showTaskPanel.taskQueue.length > 0) {
                vm.object.tasks = vm.showTaskPanel.taskQueue;
            } else {
                vm.object.tasks = [];
            }
        };
        vm.checkAllOrder = function () {
            if (vm.queueOrders && vm.allOrderCheck.checkbox && vm.queueOrders.orderQueue.length > 0) {
                vm.object.orders = [];
                angular.forEach(vm.queueOrders.orderQueue, function (order) {
                    if (order._type !== 'PERMANENT') {
                        vm.object.orders.push(order)
                    }
                });
                if (vm.object.orders.length === 0) {
                    vm.allOrderCheck.checkbox = false;
                }
            } else {
                vm.object.orders = [];
            }
        };
        /**--------------- sorting and pagination -------------------*/
        vm.pageChange = function () {
            vm.reset();
        };

        vm.sortBy = function (propertyName) {
            vm.reset();
            vm.jobFilters.reverse = !vm.jobFilters.reverse;
            vm.jobFilters.filter.sortBy = propertyName;
        };

        vm.loadHistory = function (value) {
            var jobs = {};
            jobs.jobschedulerId = vm.schedulerIds.selected;
            jobs.job = value.path;
            JobService.history(jobs).then(function (res) {
                vm.taskHistory = res.history;
            });
        };

        vm.loadAuditLogs = function (value) {
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.jobs = [];
            obj.jobs.push({job: value.path});
            obj.limit = parseInt(vm.userPreferences.maxAuditLogRecords) < parseInt(vm.userPreferences.maxAuditLogPerObject) ? parseInt(vm.userPreferences.maxAuditLogRecords) : parseInt(vm.userPreferences.maxAuditLogPerObject);
            AuditLogService.getLogs(obj).then(function (result) {
                if (result && result.auditLog) {
                    vm.auditLogs = result.auditLog;
                }
            });
        };

        function getHistoryPanelData(value) {
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.jobs = [];
            obj.jobs.push({job: value.path});
            obj.compactView = vm.jobFilters.isCompact;
            JobService.get(obj).then(function (res) {
                value = mergePermanentAndVolatile(res.jobs[0], value);
            });

            if (value.ordersSummary)
                getQueueOrders(value);
        }

        vm.showTaskFuc = function (value, isRunning) {
            vm.allTaskCheck.checkbox = false;
            vm.object.tasks = [];
            if (isRunning)
                if (value.numOfRunningTasks === 0) return;
            vm.isAuditLog = false;
            vm.loadHistory(value);
            getHistoryPanelData(value);
            vm.showTaskPanel = value;
            vm.isRunning = isRunning;
        };

        vm.showAuditLogs = function (value) {
            vm.showTaskPanel = value;
            vm.allTaskCheck.checkbox = false;
            vm.object.tasks = [];
            vm.isAuditLog = true;
            if (vm.permission.AuditLog.view.status)
                vm.loadAuditLogs(value);
            getHistoryPanelData(value);
        };

        function getQueueOrders(value) {
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.job = value.path;
            obj.compactView = vm.jobFilters.isCompact;
            JobService.getQueueOrders(obj).then(function (res) {
                vm.queueOrders = res.job;
            });
        }

        vm.showJobChains = function (job) {
            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            jobs.jobs.push({job: job.path});
            JobService.getJobsP(jobs).then(function (res) {
                job.jobChains = res.jobs[0].jobChains;
                job.showJobChains = true;
                jobs.compactView = vm.jobFilters.isCompact;
                JobService.get(jobs).then(function (res1) {
                    job = mergePermanentAndVolatile(res1.jobs[0], job);
                    updatePanelHeight();
                });
            });
        };

        vm.hideJobChains = function (job) {
            job.showJobChains = false;
            setTimeout(function () {
                updatePanelHeight();
            }, 1)
        };

        vm.hideTaskPanel = function () {
            vm.showTaskPanel = undefined;
        };

        /**--------------- Actions -----------------------------*/
        vm.stop = function (job) {
            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            jobs.jobs.push({job: job.path});
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = job.path;
                vm.comments.title = job.title;
                vm.comments.operation = 'Stop';
                vm.comments.type = 'Job';

                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    jobs.auditLog = {};
                    if (vm.comments.comment)
                        jobs.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        jobs.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        jobs.auditLog.ticketLink = vm.comments.ticketLink;
                    JobService.stop(jobs);
                    vm.reset();
                }, function () {

                });
            } else {
                JobService.stop(jobs);
                vm.reset();
            }
        };

        vm.unstop = function (job) {
            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            jobs.jobs.push({job: job.path});
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = job.path;
                vm.comments.title = job.title;
                vm.comments.operation = 'Unstop';
                vm.comments.type = 'Job';

                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    jobs.auditLog = {};
                    if (vm.comments.comment)
                        jobs.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        jobs.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        jobs.auditLog.ticketLink = vm.comments.ticketLink;
                    JobService.unstop(jobs);
                    vm.reset();
                }, function () {

                });
            } else {
                JobService.unstop(jobs);
                vm.reset();
            }
        };

        vm.start = function (job) {
            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            jobs.jobs.push({job: job.path, at: 'now'});
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = job.path;
                vm.comments.title = job.title;
                vm.comments.operation = 'Start';
                vm.comments.type = 'Job';

                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    jobs.auditLog = {};
                    if (vm.comments.comment)
                        jobs.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        jobs.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        jobs.auditLog.ticketLink = vm.comments.ticketLink;
                    JobService.start(jobs);
                    vm.reset();
                }, function () {

                });
            } else {
                JobService.start(jobs);
                vm.reset();
            }
        };

        function startAt(job, paramObject) {
            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            var obj = {};
            obj.params = job.params;
            obj.job = job.path;

            if (job.date && job.time) {
                if (job.time === '24:00' || job.time === '24:00:00') {
                    job.date.setDate(job.date.getDate() + 1);
                    job.date.setHours(0);
                    job.date.setMinutes(0);
                    job.date.setSeconds(0);
                } else {
                    job.date.setHours(moment(job.time, 'HH:mm:ss').hours());
                    job.date.setMinutes(moment(job.time, 'HH:mm:ss').minutes());
                    job.date.setSeconds(moment(job.time, 'HH:mm:ss').seconds());
                }
                job.date.setMilliseconds(0);
            }
            if (job.date && job.at === 'later') {
                obj.at = moment(job.date).format("YYYY-MM-DD HH:mm:ss");
                obj.timeZone = job.timeZone;
            } else
                obj.at = job.atTime;

            if (!obj.params && paramObject.params.length > 0) {
                obj.params = paramObject.params;
            } else if (obj.params && paramObject.params.length > 0) {
                obj.params = obj.params.concat(paramObject.params);
            }

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
            jobs.jobs.push(obj);
            JobService.start(jobs);
        }

        vm.startAt = function (job) {
            vm.job = job;
            JobService.getJob({
                jobschedulerId: vm.schedulerIds.selected,
                compact: false,
                job: vm.job.path
            }).then(function (res) {
                vm.job = _.merge(vm.job, res.job);
            });
            vm.paramObject = {};
            vm.paramObject.params = [];
            vm.job.atTime = 'now';
            vm.comments = {};
            vm.comments.radio = 'predefined';
            vm.zones = moment.tz.names();

            if (vm.userPreferences.zone) {
                vm.job.timeZone = vm.userPreferences.zone;
            }
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/start-job-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                startAt(vm.job, vm.paramObject);
                vm.reset();
            }, function () {

            });
        };

        vm.stopAll = function () {
            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            angular.forEach(vm.object.jobs, function (value) {
                jobs.jobs.push({job: value.path});
            });
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = '';
                vm.comments.operation = 'Stop';
                vm.comments.type = 'Job';
                angular.forEach(vm.object.jobs, function (value, index) {
                    if (index === vm.object.jobs.length - 1) {
                        vm.comments.name = vm.comments.name + ' ' + value.path;
                    } else {
                        vm.comments.name = value.path + ', ' + vm.comments.name;
                    }
                });
                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    jobs.auditLog = {};
                    if (vm.comments.comment)
                        jobs.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        jobs.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        jobs.auditLog.ticketLink = vm.comments.ticketLink;
                    JobService.stop(jobs);
                    vm.reset();
                }, function () {

                });
            } else {
                JobService.stop(jobs);
                vm.reset();
            }
        };

        vm.unStopAll = function () {
            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            angular.forEach(vm.object.jobs, function (value) {
                jobs.jobs.push({job: value.path});
            });
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = '';
                vm.comments.operation = 'Unstop';
                vm.comments.type = 'Job';
                angular.forEach(vm.object.jobs, function (value, index) {
                    if (index === vm.object.jobs.length - 1) {
                        vm.comments.name = vm.comments.name + ' ' + value.path;
                    } else {
                        vm.comments.name = value.path + ', ' + vm.comments.name;
                    }
                });
                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    jobs.auditLog = {};
                    if (vm.comments.comment)
                        jobs.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        jobs.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        jobs.auditLog.ticketLink = vm.comments.ticketLink;
                    JobService.unstop(jobs);
                    vm.reset();
                }, function () {

                });
            } else {
                JobService.unstop(jobs);
                vm.reset();
            }
        };

        vm.startAll = function () {
            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            angular.forEach(vm.object.jobs, function (value) {
                jobs.jobs.push({job: value.path});
            });
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = '';
                vm.comments.operation = 'Start';
                vm.comments.type = 'Job';
                angular.forEach(vm.object.jobs, function (value, index) {
                    if (index === vm.object.jobs.length - 1) {
                        vm.comments.name = vm.comments.name + ' ' + value.path;
                    } else {
                        vm.comments.name = value.path + ', ' + vm.comments.name;
                    }
                });
                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    jobs.auditLog = {};
                    if (vm.comments.comment)
                        jobs.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        jobs.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        jobs.auditLog.ticketLink = vm.comments.ticketLink;
                    JobService.start(jobs);
                    vm.reset();
                }, function () {

                });
            } else {
                JobService.start(jobs);
                vm.reset();
            }

        };

        vm.reset = function () {
            vm.allCheck.checkbox = false;
            vm.object.jobs = [];
        };

        function terminateTaskWithTimeout(job, task, path) {
            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            if (!task) {

                if (!job) {
                    angular.forEach(vm.object.jobs, function (value) {
                        jobs.jobs.push({job: value.path});
                    });
                } else {
                    jobs.jobs.push({job: job.path});
                }
            } else {
                var taskIds = [];
                taskIds.push({taskId: task.taskId});
                jobs.jobs.push({job: path, taskIds: taskIds});
            }
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
            jobs.timeout = vm.timeObj.timeout;
            TaskService.terminateWith(jobs);
        }

        vm.terminateTaskWithTimeout = function (job, task, path) {
            if (job) {
                vm.job = job;
            } else if (task && path) {
                vm.task = task;
                vm.path = path;
            } else {
                vm.taskJobs = vm.object.jobs;
            }
            vm.timeObj = {};
            vm.timeObj.timeout = 10;
            vm.comments = {};
            vm.comments.radio = 'predefined';
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/terminate-task-timeout-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                terminateTaskWithTimeout(job, task, path);
                vm.reset();
            }, function () {

            });
        };

        vm.end = function (task, path) {
            var jobs = {};
            jobs.jobs = [];
            var taskIds = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            taskIds.push({taskId: task.taskId});
            jobs.jobs.push({job: path, taskIds: taskIds});
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = path;
                vm.comments.task = task.taskId;
                vm.comments.operation = 'End Task';
                vm.comments.type = 'Job';

                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    jobs.auditLog = {};
                    if (vm.comments.comment)
                        jobs.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        jobs.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        jobs.auditLog.ticketLink = vm.comments.ticketLink;
                    TaskService.end(jobs);
                    vm.reset();
                }, function () {

                });
            } else {
                TaskService.end(jobs);
                vm.reset();
            }

        };

        vm.killTask = function (task, path) {
            var jobs = {};
            jobs.jobs = [];
            var taskIds = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            taskIds.push({taskId: task.taskId});
            jobs.jobs.push({job: path, taskIds: taskIds});
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = path;
                vm.comments.task = task.taskId;
                vm.comments.operation = 'Kill Task';
                vm.comments.type = 'Job';

                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    jobs.auditLog = {};
                    if (vm.comments.comment)
                        jobs.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        jobs.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        jobs.auditLog.ticketLink = vm.comments.ticketLink;
                    TaskService.kill(jobs);
                    vm.reset();
                }, function () {

                });
            } else {
                TaskService.kill(jobs);
                vm.reset();
            }

        };

        vm.terminateTask = function (task, path) {
            var jobs = {};
            jobs.jobs = [];
            var taskIds = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            taskIds.push({taskId: task.taskId});
            jobs.jobs.push({job: path, taskIds: taskIds});
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = path;
                vm.comments.task = task.taskId;
                vm.comments.operation = 'Terminate Task';
                vm.comments.type = 'Job';

                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    jobs.auditLog = {};
                    if (vm.comments.comment)
                        jobs.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        jobs.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        jobs.auditLog.ticketLink = vm.comments.ticketLink;
                    TaskService.terminate(jobs);
                    vm.reset();
                }, function () {

                });
            } else {
                TaskService.terminate(jobs);
                vm.reset();
            }
        };

        vm.killAllTask = function (job) {
            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            if (!job) {
                angular.forEach(vm.object.jobs, function (value) {
                    jobs.jobs.push({job: value.path});
                });
            } else {
                jobs.jobs.push({job: job.path});
            }
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = '';
                vm.comments.operation = 'Kill all Task';
                vm.comments.type = 'Job';
                vm.comments.title = job.title;
                if (!job) {
                    angular.forEach(vm.object.jobs, function (value, index) {
                        if (index === vm.object.jobs.length - 1) {
                            vm.comments.name = vm.comments.name + ' ' + value.path;
                        } else {
                            vm.comments.name = value.path + ', ' + vm.comments.name;
                        }
                    });
                } else {
                    vm.comments.name = job.path;
                }
                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    jobs.auditLog = {};
                    if (vm.comments.comment)
                        jobs.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        jobs.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        jobs.auditLog.ticketLink = vm.comments.ticketLink;
                    TaskService.killAll(jobs);
                    vm.reset();
                }, function () {

                });
            } else {
                TaskService.killAll(jobs);
                vm.reset();
            }
        };

        vm.deleteAllTask = function () {
            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;

            var taskIds = [];
            angular.forEach(vm.object.tasks, function (value) {
                taskIds.push({taskId: value.taskId})
            });
            jobs.jobs.push({job: vm.showTaskPanel.path, taskIds: taskIds});

            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = '';
                vm.comments.operation = 'Delete all Task';
                vm.comments.type = 'Job';
                vm.comments.title = vm.showTaskPanel.title;

                vm.comments.name = vm.showTaskPanel.path;

                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    jobs.auditLog = {};
                    if (vm.comments.comment)
                        jobs.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        jobs.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        jobs.auditLog.ticketLink = vm.comments.ticketLink;
                    TaskService.killAll(jobs);
                    vm.allTaskCheck.checkbox = false;
                    vm.object.tasks = [];
                }, function () {
                    vm.allTaskCheck.checkbox = false;
                    vm.object.tasks = [];
                });
            } else {
                TaskService.killAll(jobs);
                vm.allTaskCheck.checkbox = false;
                vm.object.tasks = [];
            }
        };

        vm.terminateAllTask = function (job) {
            var jobs = {};
            jobs.jobs = [];
            jobs.jobschedulerId = vm.schedulerIds.selected;
            if (!job) {
                angular.forEach(vm.object.jobs, function (value) {
                    jobs.jobs.push({job: value.path});
                });
            } else {
                jobs.jobs.push({job: job.path});
            }
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = '';
                vm.comments.operation = 'Terminate all Task';
                vm.comments.type = 'Job';
                vm.comments.title = job.title;
                if (!job) {
                    angular.forEach(vm.object.jobs, function (value, index) {
                        if (index === vm.object.jobs.length - 1) {
                            vm.comments.name = vm.comments.name + ' ' + value.path;
                        } else {
                            vm.comments.name = value.path + ', ' + vm.comments.name;
                        }
                    });
                } else {
                    vm.comments.name = job.path;
                }
                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    jobs.auditLog = {};
                    if (vm.comments.comment)
                        jobs.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        jobs.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        jobs.auditLog.ticketLink = vm.comments.ticketLink;
                    TaskService.terminateAll(jobs);
                    vm.reset();
                }, function () {

                });
            } else {
                TaskService.terminateAll(jobs);
                vm.reset();
            }
        };

        function setRunTime(job) {
            var jobs = {};
            jobs.jobs = [];
            jobs.jobs.push({
                job: job.path,
                runTime: vkbeautify.xmlmin(job.runTime),
                calendars: job.calendars
            });
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
            jobs.jobschedulerId = vm.schedulerIds.selected;
            JobService.setRunTime(jobs);
        }

        function loadRuntime(job) {
            vm.order = job;
            vm.comments = {};
            vm.comments.radio = 'predefined';
            vm.scheduleAction = undefined;
            JobService.getRunTime({
                jobschedulerId: vm.schedulerIds.selected,
                job: job.path
            }).then(function (res) {
                if (res.runTime) {
                    vm.runTimes = res.runTime;
                    vm.xml = vm.runTimes.runTime;
                    vm.calendars = vm.runTimes.calendars;
                }
                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/set-run-time-dialog.html',
                    controller: 'RuntimeEditorDialogCtrl',
                    scope: vm,
                    size: 'lg',
                    backdrop: 'static',
                    windowClass: 'fade-modal'
                });
                modalInstance.result.then(function () {
                    setRunTime(job);
                    vm.reset();
                }, function () {

                });
            });
        }

        vm.setRunTime = function (job) {
            loadRuntime(job);
        };

        vm.deleteAllOrder = function () {

            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;

            angular.forEach(vm.object.orders, function (value) {
                orders.orders.push({orderId: value.orderId, jobChain: value.jobChain});
            });

            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = '';
                vm.comments.operation = 'Delete';
                vm.comments.type = 'Order';
                angular.forEach(vm.object.orders, function (value, index) {
                    if (index === vm.object.orders.length - 1) {
                        vm.comments.name = vm.comments.name + ' ' + value.path;
                    } else {
                        vm.comments.name = value.path + ', ' + vm.comments.name;
                    }
                });
                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    orders.auditLog = {};
                    if (vm.comments.comment)
                        orders.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        orders.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        orders.auditLog.ticketLink = vm.comments.ticketLink;

                    OrderService.deleteOrder(orders).then(function () {
                        vm.allOrderCheck.checkbox = false;
                        vm.object.orders = [];
                    });

                }, function () {
                    vm.allOrderCheck.checkbox = false;
                    vm.object.orders = [];
                });
            } else {
                OrderService.deleteOrder(orders).then(function () {
                    vm.allOrderCheck.checkbox = false;
                    vm.object.orders = [];
                });
            }
        };

        vm.showAssignedCalendar = function (job) {
            var jobs = {};
            jobs.jobschedulerId = vm.schedulerIds.selected;
            jobs.job = job.path;
            jobs.compact = true;
            JobService.getcalendars(jobs).then(function (res) {
                vm.obj = angular.copy(job);
                vm.obj.calendars = res.calendars;
            });
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/show-assigned-calendar-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                backdrop: 'static'
            });
            modalInstance.result.then(function () {

            }, function () {

            });
        };

        vm.deleteOrder = function (order) {
            var orders = {};
            orders.orders = [];
            orders.jobschedulerId = $scope.schedulerIds.selected;
            orders.orders.push({orderId: order.orderId, jobChain: order.jobChain});
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = order.path;
                vm.comments.title = order.title;
                vm.comments.operation = 'Delete';
                vm.comments.type = 'Order';
                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/comment-dialog.html',
                    controller: 'DialogCtrl',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    orders.auditLog = {};
                    if (vm.comments.comment)
                        orders.auditLog.comment = vm.comments.comment;
                    if (vm.comments.timeSpent)
                        orders.auditLog.timeSpent = vm.comments.timeSpent;

                    if (vm.comments.ticketLink)
                        orders.auditLog.ticketLink = vm.comments.ticketLink;
                    OrderService.deleteOrder(orders).then(function () {
                        vm.allOrderCheck.checkbox = false;
                        vm.object.orders = [];

                    });
                }, function () {
                    vm.allOrderCheck.checkbox = false;
                    vm.object.orders = [];
                });
            } else {
                OrderService.deleteOrder(orders).then(function () {
                    vm.allOrderCheck.checkbox = false;
                    vm.object.orders = [];
                });
            }
        };

        vm.assignedDocument = function (job) {
            vm.assignObj = {
                type: 'Job',
                path: job.path,
            };
            let obj = {jobschedulerId: vm.schedulerIds.selected, job: job.path};
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
                JobService.assign(obj).then(function (res) {
                    job.documentation = vm.assignObj.documentation;
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

        vm.unassignedDocument = function (job) {
            let obj = {jobschedulerId: vm.schedulerIds.selected, job: job.path};
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = job.path;
                vm.comments.operation = 'Unassign Documentation';
                vm.comments.type = 'Job';

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
                    JobService.unassign(obj).then(function () {
                        job.documentation = undefined;
                    });
                }, function () {

                });
            } else {
                JobService.unassign(obj).then(function () {
                    job.documentation = undefined;
                });
            }
        };

        vm.getPlan = function (calendarView, viewDate) {
            var date = '';
            if (calendarView === 'year') {
                if (viewDate.getFullYear() < new Date().getFullYear()) {
                    return;
                } else if (viewDate.getFullYear() === new Date().getFullYear()) {
                    date = "+0y";
                } else {
                    date = "+" + viewDate.getFullYear() - new Date().getFullYear() + "y";
                }
            }
            if (calendarView === 'month') {
                if (viewDate.getFullYear() <= new Date().getFullYear() && viewDate.getMonth() < new Date().getMonth()) {
                    return;
                } else if (viewDate.getFullYear() === new Date().getFullYear() && viewDate.getMonth() === new Date().getMonth()) {
                    date = "+" + viewDate.getMonth() - new Date().getMonth() + "M";
                } else {
                    date = "+" + viewDate.getMonth() - (new Date().getMonth() - (12 * (viewDate.getFullYear() - new Date().getFullYear()))) + "M";
                }
            }

            vm.planItems = [];
            vm.isCaledarLoading = true;
            DailyPlanService.getPlans({
                jobschedulerId: $scope.schedulerIds.selected,
                states: ['PLANNED'],
                job: vm._job.path,
                dateFrom: date,
                dateTo: date,
                timeZone: vm.userPreferences.zone
            }).then(function (res) {
                populatePlanItems(res);
                vm.isCaledarLoading = false;
            }, function () {
                vm.isCaledarLoading = false;
            });
        };

        vm.viewCalendar = function (job) {
            vm.maxPlannedTime = undefined;
            vm._job = angular.copy(job);
            vm.planItems = [];
            vm.isCaledarLoading = true;

            DailyPlanService.getPlans({
                jobschedulerId: $scope.schedulerIds.selected,
                states: ['PLANNED'],
                job: vm._job.path,
                dateFrom: "+0M",
                dateTo: "+0M",
                timeZone: vm.userPreferences.zone
            }).then(function (res) {
                populatePlanItems(res);
                vm.isCaledarLoading = false;
            }, function () {
                vm.isCaledarLoading = false;
            });
            openCalendar();
        };

        function populatePlanItems(res) {
            vm.planItemData = res.planItems;
            vm.planItemData.forEach(function (data) {
                var planData = {
                    plannedStartTime: moment(data.plannedStartTime).tz(vm.userPreferences.zone)
                };
                vm.planItems.push(planData);
                if (res.created) {
                    vm.maxPlannedTime = new Date(res.created.until);
                }
            });
        }

        function openCalendar() {
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/calendar-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                size: 'lg',
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                vm._job = null;
            }, function () {
                vm._job = null;
            });
        }

        vm.viewAllHistories = function () {
            vm.taskHistoryTab = CoreService.getHistoryTab();
            vm.taskHistoryTab.type = 'job';
            $state.go('app.history');
        };

        vm.showLeftPanel = function () {
            CoreService.setSideView(false);
            $('#rightPanel').removeClass('fade-in m-l-0');
            $('#leftPanel').show();
            $('.sidebar-btn').hide();
        };


        function mergePermanentData(path) {
            var obj = {};
            obj.jobschedulerId = $scope.schedulerIds.selected;
            obj.jobs = [];
            obj.jobs.push({job: path});
            JobService.getJobsP(obj).then(function (res) {
                for (let i = 0; i < vm.allJobs.length; i++) {
                    if (vm.allJobs[i].path === res.jobs[0].path) {
                        vm.allJobs[i] = mergePermanentAndVolatile(vm.allJobs[i], res.jobs[0]);
                        break;
                    }
                }
            });
        }

        var isOperationGoingOn = false, isFuncCalled = false, jobPaths = [];

        $scope.$on('event-started', function () {
            if (!isOperationGoingOn) {
                if (vm.events && vm.events[0] && vm.events[0].eventSnapshots) {
                    for (let i = 0; i < vm.events[0].eventSnapshots.length; i++) {
                        if (vm.events[0].eventSnapshots[i].path && vm.events[0].eventSnapshots[i].eventType === "JobStateChanged" && !vm.events[0].eventSnapshots[i].eventId) {
                            var path = [];
                            if (vm.events[0].eventSnapshots[i].path.indexOf(",") > -1) {
                                path = vm.events[0].eventSnapshots[i].path.split(",");
                            } else {
                                path[0] = vm.events[0].eventSnapshots[i].path;
                            }

                            var obj = {};
                            obj.jobschedulerId = $scope.schedulerIds.selected;
                            obj.jobs = [];
                            obj.jobs.push({job: path[0]});
                            obj.compactView = vm.jobFilters.isCompact;
                            JobService.get(obj).then(function (res) {
                                if (res.jobs && res.jobs.length > 0) {
                                    var flag = false;
                                    for (let i = 0; i < vm.allJobs.length; i++) {
                                        if (vm.allJobs[i].path === res.jobs[0].path) {
                                            flag = true;
                                            if (vm.jobFilters.filter.state === 'ALL' || res.jobs[0].state._text === vm.jobFilters.filter.state) {
                                                vm.allJobs[i] = mergePermanentAndVolatile(res.jobs[0], vm.allJobs[i]);

                                                if (vm.showTaskPanel && (vm.showTaskPanel.path === vm.allJobs[i].path)) {
                                                    vm.showTaskPanel = vm.allJobs[i];
                                                }
                                            } else {
                                                for (let i = 0; i < vm.allJobs.length; i++) {
                                                    if (vm.allJobs[i].path === res.jobs[0].path) {
                                                        vm.allJobs.splice(i, 1);
                                                        break;
                                                    }
                                                }
                                            }
                                            break;
                                        }
                                    }
                                    if (!flag) {
                                        if (res.jobs[0].state._text === vm.jobFilters.filter.state) {
                                            vm.allJobs.push(res.jobs[0]);
                                            mergePermanentData(res.jobs[0].path)
                                        }
                                    }
                                }
                            });

                            $rootScope.$broadcast('reloadJobSnapshot');
                        } else if (vm.showTaskPanel && vm.events[0].eventSnapshots[i].eventType === "ReportingChangedJob" && !vm.events[0].eventSnapshots[i].eventId) {
                            var jobs = {};
                            jobs.jobschedulerId = vm.schedulerIds.selected;
                            jobs.job = vm.showTaskPanel.path;
                            JobService.history(jobs).then(function (res) {
                                vm.taskHistory = res.history;
                            });
                        } else if (vm.showTaskPanel && vm.events[0].eventSnapshots[i].eventType === "AuditLogChanged" && vm.events[0].eventSnapshots[i].objectType === "JOB" && vm.events[0].eventSnapshots[i].path === vm.showTaskPanel.path) {
                            if (vm.permission.AuditLog.view.status)
                                vm.loadAuditLogs(vm.showTaskPanel);
                        } else if (vm.events[0].eventSnapshots[i].eventType === "JobTaskQueueChanged" && vm.showTaskPanel) {
                            getHistoryPanelData(vm.showTaskPanel);
                        }
                    }
                }
            } else {
                if (vm.events && vm.events.length > 0 && vm.events[0].eventSnapshots) {
                    for (let j = 0; j < vm.events[0].eventSnapshots.length; j++) {
                        if (vm.events[0].eventSnapshots[j].eventType === 'JobStateChanged' && !vm.events[0].eventSnapshots[j].eventId) {
                            if (jobPaths.indexOf(vm.events[0].eventSnapshots[j].path) == -1) {
                                jobPaths.push(vm.events[0].eventSnapshots[j].path);
                            }
                        }
                    }
                }
            }
        });

        $scope.$on('stopEvents', function () {
            isOperationGoingOn = true;
            isFuncCalled = false;
            jobPaths = [];
        });

        $scope.$on('startEvents', function () {
            isOperationGoingOn = false;
            if (!isFuncCalled) {
                refreshUIWithHoldEvents();
            }
        });

        function refreshUIWithHoldEvents() {
            isFuncCalled = true;
            $rootScope.$broadcast('reloadJobSnapshot');
            let arr = [];

            for (let j = 0; j < jobPaths.length; j++) {
                arr.push({job: jobPaths[j]});
            }
            if (arr.length == 0) {
                return;
            }

            var obj = {};
            obj.jobschedulerId = $scope.schedulerIds.selected;
            obj.jobs = arr;
            obj.compactView = vm.jobFilters.isCompact;
            JobService.get(obj).then(function (res) {
                isFuncCalled = false;
                if (res.jobs && res.jobs.length > 0) {
                    var flag = false;
                    for (let i = 0; i < vm.allJobs.length; i++) {
                        if (vm.allJobs[i].path === res.jobs[0].path) {
                            flag = true;
                            if (vm.jobFilters.filter.state === 'ALL' || res.jobs[0].state._text === vm.jobFilters.filter.state) {
                                vm.allJobs[i] = mergePermanentAndVolatile(res.jobs[0], vm.allJobs[i]);
                                if (vm.showTaskPanel && (vm.showTaskPanel.path === vm.allJobs[i].path)) {
                                    vm.showTaskPanel = vm.allJobs[i];
                                }
                            } else {
                                for (let i = 0; i < vm.allJobs.length; i++) {
                                    if (vm.allJobs[i].path === res.jobs[0].path) {
                                        vm.allJobs.splice(i, 1);
                                        break;
                                    }
                                }
                            }
                            break;
                        }
                    }
                    if (!flag) {
                        if (res.jobs[0].state._text === vm.jobFilters.filter.state) {
                            vm.allJobs.push(res.jobs[0]);
                            mergePermanentData(res.jobs[0].path)
                        }
                    }
                }
            }, function () {
                isFuncCalled = false;
            });
        }

        vm.isSizeChange = false;
        let rsHt = JSON.parse(SavedFilter.resizerHeight) || {};
        if (!_.isEmpty(rsHt) && rsHt.jobOverview) {
            vm.resizerHeight = rsHt.jobOverview;
            vm.isSizeChange = true;
        }


        function updatePanelHeight() {
            if (!vm.isSizeChange) {
                let rsHt = JSON.parse(SavedFilter.resizerHeight) || {};
                if (!_.isEmpty(rsHt) && rsHt.jobOverview) {
                    vm.resizerHeight = rsHt.jobOverview;
                } else {
                    _updatePanelHeight();
                }
            }
        }
        var t1;
        function _updatePanelHeight() {
            t1 = $timeout(function () {
                let ht = (parseInt($('#jobTableId').height()) + 50);
                let el = document.getElementById('jobDivId');
                if (el && el.scrollWidth > el.clientWidth) {
                    ht = ht + 11;
                }
                if (ht > 450) {
                    ht = 450;
                }
                vm.resizerHeight = ht + 'px';
                $('#jobDivId').css('height', vm.resizerHeight);

            }, 5);
        }

        vm.resetPanel = function () {
            rsHt.jobOverview = undefined;
            vm.isSizeChange = false;
            SavedFilter.setResizerHeight(rsHt);
            SavedFilter.save();
            _updatePanelHeight();
        };

        $scope.$on('angular-resizable.resizeEnd', function (event, args) {
            if (args.id === 'jobDivId') {
                let rsHt = JSON.parse(SavedFilter.resizerHeight) || {};
                rsHt.jobOverview = args.height;
                vm.isSizeChange = true;
                SavedFilter.setResizerHeight(rsHt);
                SavedFilter.save();
            }
        });

        $scope.$on('$destroy', function () {
            watcher1();
            watcher2();
            watcher3();
            watcher4();
            if (t1) {
                $timeout.cancel(t1);
            }

        });
    }

    JobWorkflowCtrl.$inject = ["$scope", "$rootScope", "$uibModal", "CoreService", "ConditionService", "gettextCatalog", "$timeout", "toasty", "orderByFilter"];

    function JobWorkflowCtrl($scope, $rootScope, $uibModal, CoreService, ConditionService, gettextCatalog, $timeout, toasty, orderBy) {
        const vm = $scope;
        vm.jobFilters = CoreService.getJobTab();
        vm.jobFilters.isWorkflowCompact = vm.jobFilters.isWorkflowCompact ? vm.jobFilters.isWorkflowCompact : false;
        vm.configXml = './mxgraph/config/diagrameditor.xml';
        vm.isWorkflowLoaded = false;
        vm.editor = {};
        vm.workflows = [];
        vm.flag = false;
        vm.isUpdated = true;
        vm.eventNodes = [];
        vm.tree_handler = {};


        function init() {
            if (sessionStorage.preferences) {
                vm.preferences = JSON.parse(sessionStorage.preferences) || {};
            }
            if (!(vm.preferences.theme === 'light' || vm.preferences.theme === 'lighter' || !vm.preferences.theme)) {
                vm.configXml = './mxgraph/config/diagrameditor-dark.xml';
            }
            createEditor();

            let ht = 'calc(100vh - ' + Math.round($('.scroll-y').position().top + 38) + 'px)';
            $('#graph').slimscroll({height: ht});
            const panel = $('.property-panel');
            $('.sidebar-open', panel).click(function () {
                $('.sidebar').css({'width': '296px', opacity: 1});
                $('.sidebar-open').css('right', '-20px');
                if (window.innerWidth > 1024) {
                    $('#outlineContainer').animate({'right': '306px'}, 'fast', 'linear');
                    $('.graph-container').animate({'margin-right': '296px'}, 'fast', 'linear');
                }else {
                    $('#outlineContainer').animate({'right': '10px'}, 'fast', 'linear');
                    $('.graph-container').animate({'margin-right': '0'}, 'fast', 'linear');
                }
                $('.sidebar-close').animate({right: '296px'}, 'fast', 'linear');
                //makeCenter(vm.editor.graph);
            });

            $('.sidebar-close', panel).click(function () {
                $('.sidebar-open').css('right', '0');
                $('.sidebar').css({'width': '0', opacity: 0});
                $('#outlineContainer').animate({'right': '10px'}, 'fast', 'linear');
                $('.graph-container').animate({'margin-right': '0'}, 'fast', 'linear');
                $('.sidebar-close').css('right', '-20px');
                //makeCenter(vm.editor.graph);
            });
            setTimeout(function () {
                $('#outlineContainer').css({opacity: 1});
                if (window.innerWidth > 1024) {
                    $('.sidebar-open').click();
                }
            }, 100);
            recursivelyConnectJobs(false, false);

            /**
             * Changes the zoom on mouseWheel events
             */
            $('.graph-container').bind('mousewheel DOMMouseScroll', function (event) {
                if (vm.editor) {
                    if (event.ctrlKey) {
                        event.preventDefault();
                        if (event.originalEvent.wheelDelta > 0 || event.originalEvent.detail < 0) {
                            vm.editor.execute('zoomIn');
                        } else {
                            vm.editor.execute('zoomOut');
                        }
                    } else {
                        const bounds = vm.editor.graph.getGraphBounds();
                        if (bounds.y < 0 && bounds.height > $('#graph').height()) {
                            vm.editor.graph.center(true, true, 0.5, 0);
                        }
                    }
                }
            });
        }

        function recursivelyConnectJobs(reload, checkScroll) {
            vm.workflows = [];
            let jobPaths = [];
            angular.forEach(vm.allJobs, function (job) {
                jobPaths.push({job: job.path});
            });
            if (jobPaths.length > 0) {
                ConditionService.inCondition({
                    jobschedulerId: $scope.schedulerIds.selected,
                    jobs: jobPaths
                }).then(function (res) {
                    ConditionService.outCondition({
                        jobschedulerId: $scope.schedulerIds.selected,
                        jobs: jobPaths
                    }).then(function (result) {
                        let mergeData = _.merge(res.jobsInconditions, result.jobsOutconditions);
                        let len = mergeData.length;
                        for (let i = 0; i < len; i++) {
                            let wf = (mergeData[i].inconditions.length > 0) ? mergeData[i].inconditions[0].workflow : (mergeData[i].outconditions.length > 0) ? mergeData[i].outconditions[0].workflow : '';
                            if (wf) {
                                vm.flag = true;
                                let _job = {};
                                for (let j = 0; j < vm.allJobs.length; j++) {
                                    if (vm.allJobs[j].path == mergeData[i].job) {
                                        _job = vm.allJobs[j];
                                        _job.inconditions = mergeData[i].inconditions;
                                        _job.outconditions = mergeData[i].outconditions;
                                        break;
                                    }
                                }

                                let x = {
                                    name: wf,
                                    path: _job.path1,
                                    jobs: [_job]
                                };
                                let _tempWorkflow;
                                let _conditions = [];
                                for (let i = 0; i < vm.workflows.length; i++) {
                                    if (vm.workflows[i].name === x.name) {
                                        _conditions = vm.workflows[i].jobs;
                                        _tempWorkflow = vm.workflows[i];
                                        break;
                                    }
                                }

                                if ((!_job.inconditions || _job.inconditions.length === 0) && (_job.outconditions && _job.outconditions.length > 0)) {
                                    if (_conditions.length === 0) {
                                        _conditions.push(_job);
                                    } else {
                                        _conditions = [_job].concat(_conditions);
                                    }
                                } else if ((!_job.outconditions || _job.outconditions.length === 0) && (_job.inconditions && _job.inconditions.length > 0)) {
                                    _conditions.push(_job);
                                } else if ((_job.outconditions && _job.outconditions.length > 0) || (_job.inconditions && _job.inconditions.length > 0)) {
                                    _conditions.push(_job);
                                    let _temp = angular.copy(_conditions);
                                    let arr = [];
                                    for (let i = 0; i < _temp.length; i++) {
                                        for (let j = 0; j < _conditions.length; j++) {
                                            if (_conditions[j].outconditions.length > 0) {
                                                arr.push(_conditions[j]);
                                                _conditions.splice(j, 1);
                                                break;
                                            }
                                        }
                                    }
                                    _conditions = arr.concat(_conditions);
                                }

                                if (!_tempWorkflow) {
                                    vm.workflows.push(x);
                                } else {
                                    _tempWorkflow.jobs = _conditions;
                                }

                            }
                        }

                        vm.isWorkflowLoaded = true;
                        vm.isUpdated = true;
                        let scrollTop = 0;
                        if(checkScroll) {
                            let element = document.getElementById("graph");
                            scrollTop = element.scrollTop ;
                        }
                        if (reload) {
                            vm.editor.graph.removeCells(vm.editor.graph.getChildVertices(vm.editor.graph.getDefaultParent()));
                        }
                        if (!vm.selectedWorkflow) {
                            vm.selectedWorkflow = vm.workflows[0].name;
                            createWorkflowDiagram(vm.workflows[0].jobs, !reload, scrollTop);
                        } else {
                            for (let x = 0; x < vm.workflows.length; x++) {
                                if (vm.selectedWorkflow === vm.workflows[x].name) {
                                    createWorkflowDiagram(vm.workflows[x].jobs, !reload, scrollTop);
                                    break;
                                }
                            }
                        }
                        if(!vm.eventFilter)
                            vm.eventFilter = 'EXIST';
                        vm.getEvents(null);
                    }, function () {
                        vm.isWorkflowLoaded = true;
                    });
                }, function (err) {
                    vm.isWorkflowLoaded = true;
                });
            } else {
                vm.isWorkflowLoaded = true;
            }
        }

        if (vm.allJobs && vm.allJobs.length > 0) {
            init();
        } else {
            vm.isWorkflowLoaded = true;
        }

        function createWorkflowDiagram(jobs, reload, scrollValue) {
            const graph = vm.editor.graph;
            let parent = graph.getDefaultParent();
            graph.getModel().beginUpdate();
            let vertexes = [];

            for (let i = 0; i < jobs.length; i++) {
                jobs[i].jId = undefined;
            }
            try {
                for (let i = 0; i < jobs.length; i++) {
                    let events = [];
                    if (!jobs[i].state) {
                        jobs[i].state = {};
                    }
                    let v1;
                    if (!jobs[i].jId) {
                        let lb = '<span><i class="text-xs fa fa-circle ' + vm.colorFunction(jobs[i].state.severity) + '"></i> ' + jobs[i].name + ' </span>';
                        let _node = getCellNode('Job', lb, jobs[i].path);
                        _node.setAttribute('status', gettextCatalog.getString(jobs[i].state._text));
                        v1 = createVertex(parent, _node, jobs[i].name, 'job');
                        jobs[i].jId = v1.id;
                    } else {
                        v1 = graph.getModel().getCell(jobs[i].jId)
                    }

                    if (!vm.jobFilters.isWorkflowCompact) {
                        for (let x = 0; x < jobs[i].inconditions.length; x++) {
                            let _label = parseExpression(jobs[i].inconditions[x].conditionExpression);
                            let _node = getCellNode('InCondition', _label, jobs[i].inconditions[x].conditionExpression.expression);
                            _node.setAttribute('isConsumed', jobs[i].inconditions[x].consumed);
                            if (jobs[i].inconditions[x].inconditionCommands) {
                                _node.setAttribute('commands', JSON.stringify(jobs[i].inconditions[x].inconditionCommands));
                            }
                            let style = jobs[i].inconditions[x].consumed ? 'condition1' : 'condition';
                            let conditionVertex = createVertex(parent, _node, jobs[i].inconditions[x].conditionExpression.expression, style);
                            jobs[i].inconditions[x].vertexId = conditionVertex.id;

                            graph.insertEdge(parent, null, getCellNode('Connection', 'In', ''), conditionVertex, v1);

                            let img = jobs[i].inconditions[x].conditionExpression.value ? './mxgraph/images/green-bar.svg' : './mxgraph/images/red-bar.svg';
                            let overlay = new mxCellOverlay(new mxImage(img, conditionVertex.geometry.width, 6), '', 'center', 'bottom');
                            graph.addCellOverlay(conditionVertex, overlay);
                        }

                        for (let x = 0; x < jobs[i].outconditions.length; x++) {
                            let _label = parseExpression(jobs[i].outconditions[x].conditionExpression);
                            let _node = getCellNode('OutCondition', _label, jobs[i].outconditions[x].conditionExpression.expression);
                            _node.setAttribute('_id', jobs[i].outconditions[x].id);

                            let conditionVertex = createVertex(parent, _node, jobs[i].outconditions[x].conditionExpression.expression, 'condition2');
                            jobs[i].outconditions[x].vertexId = conditionVertex.id;
                            graph.insertEdge(parent, null, getCellNode('Connection', 'Out', ''), v1, conditionVertex);
                            if (jobs[i].outconditions[x].outconditionEvents.length > 0) {
                                for (let z = 0; z < jobs[i].outconditions[x].outconditionEvents.length; z++) {
                                    if (jobs[i].outconditions[x].outconditionEvents[z].command === 'create') {
                                        let _node = getCellNode('Event', jobs[i].outconditions[x].outconditionEvents[z].event, jobs[i].outconditions[x].outconditionEvents[z].event);
                                        let flg = jobs[i].outconditions[x].outconditionEvents[z].existsInWorkflow ? jobs[i].outconditions[x].outconditionEvents[z].existsInWorkflow : jobs[i].outconditions[x].outconditionEvents[z].exists;
                                        _node.setAttribute('isExist', flg);
                                        let style = jobs[i].outconditions[x].outconditionEvents[z].existsInWorkflow ? 'event1' : jobs[i].outconditions[x].outconditionEvents[z].exists ? 'event2' : 'event';
                                        let e1 = createVertex(parent, _node, jobs[i].outconditions[x].outconditionEvents[z].event, style);
                                        events.push(e1);
                                        graph.insertEdge(parent, null, getCellNode('Connection', '', ''), conditionVertex, e1);
                                    }
                                }
                            }
                            let img = jobs[i].outconditions[x].conditionExpression.value ? './mxgraph/images/green-bar.svg' : './mxgraph/images/red-bar.svg';
                            let overlay = new mxCellOverlay(new mxImage(img, conditionVertex.geometry.width, 6), '', 'center', 'top');
                            graph.addCellOverlay(conditionVertex, overlay);
                        }

                        if (jobs[i].outconditions.length > 0) {
                            let out = createVertex(parent, getCellNode('Box', jobs[i].name, jobs[i].path), jobs[i].name, 'circle');
                            vertexes.push(out);
                            for (let m = 0; m < events.length; m++) {
                                graph.insertEdge(parent, null, getCellNode('Connection', '', ''), events[m], out);
                            }
                        }
                    } else {
                        for (let m = 0; m < jobs.length; m++) {
                            if (jobs[i].path !== jobs[m].path) {
                                for (let n = 0; n < jobs[m].inconditions.length; n++) {
                                    for (let x = 0; x < jobs[i].outconditions.length; x++) {
                                        if (jobs[i].outconditions[x].outconditionEvents.length > 0) {
                                            for (let z = 0; z < jobs[i].outconditions[x].outconditionEvents.length; z++) {
                                                if (jobs[m].inconditions[n].conditionExpression.expression.match(jobs[i].outconditions[x].outconditionEvents[z].event) ||
                                                    jobs[m].inconditions[n].conditionExpression.expression.indexOf(jobs[i].outconditions[x].outconditionEvents[z].event) > -1) {
                                                    if (!jobs[m].jId) {
                                                        if (!jobs[m].state) {
                                                            jobs[m].state = {};
                                                        }
                                                        let lb = '<span><i class="text-xs fa fa-circle ' + vm.colorFunction(jobs[m].state.severity) + '"></i> ' + jobs[m].name + ' </span>';
                                                        let _node = getCellNode('Job', lb, jobs[m].path);
                                                        _node.setAttribute('status', gettextCatalog.getString(jobs[m].state._text));
                                                        let v2 = createVertex(parent, _node, jobs[i].name, 'job');
                                                        jobs[m].jId = v2.id;
                                                        graph.insertEdge(parent, null, getCellNode('Connection', '', ''), v1, v2);
                                                    } else {
                                                        let isConnected = false;
                                                        if (v1.edges) {
                                                            for (let y = 0; y < v1.edges.length; y++) {
                                                                if (v1.edges[y].target.id === graph.getModel().getCell(jobs[m].jId).id) {
                                                                    isConnected = true;
                                                                    break;
                                                                }
                                                            }
                                                        }
                                                        if (!isConnected) {
                                                            graph.insertEdge(parent, null, getCellNode('Connection', '', ''), v1, graph.getModel().getCell(jobs[m].jId));
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    if (events.length > 0) {
                        for (let b = 0; b < events.length; b++) {
                            for (let m = 0; m < jobs.length; m++) {
                                if (jobs[i].path !== jobs[m].path) {
                                    for (let x = 0; x < jobs[m].inconditions.length; x++) {
                                        if (jobs[m].inconditions[x].conditionExpression.expression.match(events[b].getAttribute('label')) ||
                                            jobs[m].inconditions[x].conditionExpression.expression.indexOf(events[b].getAttribute('label')) > -1) {
                                            for (let y = 0; y < events[b].edges.length; y++) {
                                                if (events[b].edges[y].source.id === events[b].id) {
                                                    if (!jobs[m].inconditions[x].boxId) {
                                                        jobs[m].inconditions[x].boxId = [events[b].edges[y].target.id];
                                                    } else {
                                                        if (jobs[m].inconditions[x].boxId.indexOf(events[b].edges[y].target.id) === -1) {
                                                            jobs[m].inconditions[x].boxId.push(events[b].edges[y].target.id);
                                                        }
                                                    }

                                                    break;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                for (let i = 0; i < jobs.length; i++) {
                    for (let j = 0; j < jobs[i].inconditions.length; j++) {
                        if (jobs[i].inconditions[j].boxId && jobs[i].inconditions[j].boxId.length > 0) {
                            for (let b = 0; b < jobs[i].inconditions[j].boxId.length; b++) {
                                graph.insertEdge(parent, null, getCellNode('Connection', '', ''), graph.getModel().getCell(jobs[i].inconditions[j].boxId[b]), graph.getModel().getCell(jobs[i].inconditions[j].vertexId));
                            }
                            delete jobs[i].inconditions[j]['boxId'];
                        }
                    }
                }

                for (let i = 0; i < vertexes.length; i++) {
                    if (graph.getOutgoingEdges(vertexes[i]) && graph.getOutgoingEdges(vertexes[i]).length === 0) {
                        graph.removeCells([vertexes[i]], true);
                    }
                }
                if (reload) {
                    makeCenter(graph);
                }
            } catch (e) {
                console.error(e)
            } finally {
                // Updates the display
                graph.getModel().endUpdate();
                executeLayout(graph);
            }
            vm.jobs = jobs;
            setTimeout(function () {
                updateWorkflowDiagram(vm.jobs);
            }, 10);
            let element = document.getElementById("graph");
            element.scrollTop = scrollValue;
        }

        function updateWorkflowDiagram(jobs) {
            if(!jobs || !vm.editor) return;

            const graph = vm.editor.graph;
            let parent = graph.getDefaultParent();
            graph.getModel().beginUpdate();
            let edges = [];
            let edges2 = [];
            try {
                let vertices = graph.getChildVertices(parent);
                for (let i = 0; i < vertices.length; i++) {
                    if (vertices[i].value.tagName === 'Job') {
                        for (let j = 0; j < jobs.length; j++) {
                            if (vertices[i].getAttribute('actual') === jobs[j].path) {
                                let lb = '<span><i class="text-xs fa fa-circle ' + vm.colorFunction(jobs[j].state.severity) + '"></i> ' + jobs[j].name + ' </span>';
                                const edit = new mxCellAttributeChange(
                                    vertices[i], 'label', lb);
                                graph.getModel().execute(edit);
                                const edit2 = new mxCellAttributeChange(
                                    vertices[i], 'status', jobs[j].state._text);
                                graph.getModel().execute(edit2);
                                if (jobs[j].state._text == 'RUNNING') {
                                    edges = edges.concat(graph.getOutgoingEdges(vertices[i], parent));
                                } else {
                                    edges2 = edges2.concat(graph.getOutgoingEdges(vertices[i], parent));
                                }
                                break;
                            }
                        }
                    }
                }
            } catch (e) {
                console.error(e)
            } finally {
                // Updates the display
                graph.getModel().endUpdate();
            }
            for (let i = 0; i < edges.length; i++) {
                let state = graph.view.getState(edges[i]);
                state.shape.node.getElementsByTagName('path')[1].setAttribute('class', 'flow');
            }
            for (let i = 0; i < edges2.length; i++) {
                let state = graph.view.getState(edges2[i]);
                state.shape.node.getElementsByTagName('path')[1].removeAttribute('class');
            }
        }

        vm.changeGraph = function (workflow) {
            if (vm.selectedWorkflow !== workflow.name) {
                vm.selectedWorkflow = workflow.name;
                vm.editor.graph.removeCells(vm.editor.graph.getChildVertices(vm.editor.graph.getDefaultParent()));
                createWorkflowDiagram(workflow.jobs, false,0);
                vm.getEvents(null);
            }
        };

        vm.compactView = function (workflow) {
            vm.jobFilters.isWorkflowCompact = !vm.jobFilters.isWorkflowCompact;
            for (let x = 0; x < vm.workflows.length; x++) {
                if (workflow === vm.workflows[x].name) {
                    for (let i = 0; i < vm.workflows[x].jobs.length; i++) {
                        delete vm.workflows[x].jobs[i]['jId'];
                    }
                    vm.editor.graph.removeCells(vm.editor.graph.getChildVertices(vm.editor.graph.getDefaultParent()));
                    createWorkflowDiagram(vm.workflows[x].jobs, false,0);
                    break;
                }
            }
        };

        vm.resetWorkflow = function (workflow, job) {
            vm.workflow = workflow;
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/confirm-dialog.html',
                controller: 'DialogCtrl1',
                scope: vm,
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                ConditionService.resetWorkflow({
                    "masterId": $scope.schedulerIds.selected,
                    "job": job,
                    "workflow": workflow
                }).then(function (res) {
                    vm.isUpdated = false;
                    recursivelyConnectJobs(true, false);
                }, function () {

                })
            }, function () {

            });
        };

        vm.treeHandler = function (data) {
            let wf = vm.workflows[0];
            let p = wf.path === '/' ? '/' : wf.path + '/';
            if(data.path !== p+wf.name) {
                $rootScope.$broadcast('switchPath', {path: data.path});
                t1 = $timeout(function () {
                    vm.selectedWorkflow = null;
                    recursivelyConnectJobs(true, false);
                }, 1000);
            }else{
                vm.navigateToEvent(data.evt);
            }
        };

        vm.treeHandler1 = function (data) {
            if (data.expanded) {
                data.folders = orderBy(data.folders, 'name');
            }
        };

        /**
         * Function : Parse expression to create label

         * @param conditions
         */
        function parseExpression(conditions) {
            let ex = conditions.expression.split(/\s*(\(|\)|and|or|not)\s*/);
            let val = conditions.validatedExpression.split(/\s*(\(|\)|&&|!|\|\|)\s*/);
            let _label = '';
            for (let x = 0; x < ex.length; x++) {
                if (ex[x]) {
                    if (val[x] && val[x].trim() == 'true') {
                        _label = _label + '<span class="text-check">' + ex[x].trim() + '</span> ';
                    } else {
                        _label = _label + ex[x].trim() + ' ';
                    }
                }
            }
            return _label;
        }

        vm.openModel = function (cell) {
            let label = cell.getAttribute('actual');
            vm.expression = {};
            vm.expression.label = cell.value.tagName;
            vm.expression.expression = label;
            vm.expression.commands = [];
            vm.expression.events = [];

            for (let i = 0; i < cell.edges.length; i++) {
                if (vm.expression.label === 'InCondition') {
                    if (cell.edges[i].source.id === cell.id) {
                        vm.expression.job = cell.edges[i].target.getAttribute('actual');
                        let commands = cell.edges[i].source.getAttribute('commands');
                        if (commands) {
                            vm.expression.commands = JSON.parse(commands) || [];
                        }
                        break;
                    }
                } else if (vm.expression.label === 'OutCondition') {
                    if (cell.edges[i].target.id === cell.id) {
                        vm.expression.job = cell.edges[i].source.getAttribute('actual');
                    } else {
                        vm.expression.events.push({
                            event: cell.edges[i].target.getAttribute('actual'),
                            command: 'create'
                        });
                    }
                }
            }
            let modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/workflow-event-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                if (vm.expression !== label) {
                    updateExpression(cell);
                }
            }, function () {

            });
        };

        let isFunction = false, t1;
        vm.generateExpression = function (operator, func) {
            if (vm.expression.expression && vm.expression.expression != ' ' && operator) {
                isFunction = false;
                vm.tmpExp = null;
                if (!vm.operator) {
                    vm.operator = operator;
                    vm.tmp = vm.expression.expression;
                    vm.expression.expression = vm.expression.expression + ' ' + operator + ' ';
                } else if (vm.tmp) {
                    vm.expression.expression = vm.tmp + ' ' + operator + ' ';
                }
            } else if (func) {
                vm.tmp = null;
                if (!isFunction) {
                    isFunction = true;
                    vm.tmpExp = vm.expression.expression;
                    vm.expression.expression = vm.expression.expression + ' ' + func + ':';
                } else if (vm.tmpExp || vm.tmpExp == '') {
                    vm.expression.expression = vm.tmpExp + ' ' + func + ':';
                }
            }
        };

        vm.validateExpression = function () {
            vm.operator = undefined;
            vm.tmp = null;
            vm.tmpExp = null;
        };

        vm.addEvent = function (expression) {
            let param = {
                event: '',
                id: 0
            };
            expression.events.push(param);
        };

        vm.removeEvent = function (events, index) {
            events.splice(index, 1);
        };

        vm.addCommand = function (expression) {
            let param = {
                command: '',
                commandParam: '',
                id: 0
            };
            expression.commands.push(param);
        };

        vm.removeCommand = function (commands, index) {
            commands.splice(index, 1);
        };

        vm.selectCommand = function (commands, command, index) {
            if (command === 'start_job') {
                commands[index].commandParam = 'now';
            } else {
                commands[index].commandParam = '';
            }
        };

        vm.getEvents = function (cell) {
            if (!vm.filteredByWorkflow) {
                vm.filteredByWorkflow = vm.selectedWorkflow;
            }
            let obj = {masterId: $scope.schedulerIds.selected, workflow: vm.selectedWorkflow};
            if (cell) {
                obj.outConditionId = cell.getAttribute('_id');
            } else {
                if (vm.eventFilter === 'ALL') {
                    delete obj['workflow'];
                } else {
                    for (let i = 0; i < vm.workflows.length; i++) {
                        if (vm.workflows[i].name == vm.selectedWorkflow) {
                            obj.path = vm.workflows[i].path;
                            break;
                        }
                    }
                }
            }
            ConditionService.getEvents(obj).then(function (res) {
                vm.eventList = res.conditionEvents;
                checkEventFilter();
            });
        };

        vm.changeEvents = function (workflow) {
            let obj = {masterId: $scope.schedulerIds.selected};
            if (workflow) {
                vm.filteredByWorkflow = workflow;
                obj.workflow = vm.filteredByWorkflow;
            } else {
                vm.eventFilter = vm.eventFilter === 'ALL' ? 'EXIST' : "ALL";
                if (vm.eventFilter !== 'ALL') {
                    obj.workflow = vm.filteredByWorkflow;
                    for (let i = 0; i < vm.workflows.length; i++) {
                        if (vm.workflows[i].name == workflow) {
                            obj.path = vm.workflows[i].path;
                            break;
                        }
                    }
                }
            }

            ConditionService.getEvents(obj).then(function (res) {
                vm.eventList = res.conditionEvents;
                checkEventFilter();
            });
        };

        function checkEventFilter(){
            if (vm.eventFilter === 'ALL' && vm.eventList.length > 0) {
                let arr = [];
                for (let i = 0; i < vm.eventList.length; i++) {
                    let p =  vm.eventList[i].path === '/' ?  vm.eventList[i].path :  vm.eventList[i].path + '/';
                    let path =  p + vm.eventList[i].workflow;
                    if (arr.indexOf(path) === -1) {
                        arr.push(path);
                    }
                }
                createTreeStructure(arr);
            }else{
                vm.eventNodes = [];
            }
        }

        function createTreeStructure(list) {
            let eventNodes = [];
            for (let i = 0; i < list.length; i++) {
                let nodes = list[i].split('/');
                let arr = [];
                let flag = true, index = 0;
                for (let j = 0; j < nodes.length; j++) {
                    let obj = {};
                    obj.name = nodes[j];
                    obj.path = nodes[j] ? list[i] : '/';
                    if (j < nodes.length - 1) {
                        obj.folders = [];
                        obj.expanded = true;
                    } else {
                        obj.type = 'WORKFLOW';
                        obj.events = [];
                        for (let m = 0; m < vm.eventList.length; m++) {
                            let p =  vm.eventList[m].path === '/' ?  '/' + vm.eventList[m].workflow :  vm.eventList[m].path + '/' + vm.eventList[m].workflow;
                            if (list[i] == p) {
                                obj.events.push(vm.eventList[m].event);
                            }
                        }

                    }
                    if (eventNodes[0] && eventNodes[0][j]) {
                        if (eventNodes[0][j].name == nodes[j]) {
                            flag = false;
                            index = j;
                        } else {
                            if (arr.length == 0) {
                                arr.push(obj);
                            } else if (arr.length > 0) {
                                recursiveUpdate(arr[0], obj);
                            }
                        }
                    } else {
                        if (arr.length == 0) {
                            arr.push(obj);
                        } else if (arr.length > 0) {
                            recursiveUpdate(arr[0], obj);
                        }
                    }
                }
                if (flag) {
                    eventNodes.push(arr);
                } else {
                    recursiveUpdate1(eventNodes[0][index], arr);
                }
            }

            vm.eventNodes = eventNodes[0];
        }

        function recursiveUpdate(arr, obj) {
            if (arr.folders.length === 0) {
                arr.folders.push(obj);
            } else {
                recursiveUpdate(arr.folders[0], obj);
            }
        }

        function recursiveUpdate1(data, arr) {
            let flag = true;
            if (arr[0].folders) {
                for (let y = 0; y < data.folders.length; y++) {
                    if (arr[0].name === data.folders[y].name) {
                        flag = false;
                        recursiveUpdate1(data.folders[y], arr[0].folders);
                    }
                }
            }
            if (flag) {
                data.folders.push(arr[0]);
            }
        }

        vm.addEventFromWorkflow = function (cell) {
            let obj = {masterId: $scope.schedulerIds.selected, workflow: vm.selectedWorkflow};
            let job = '';
            for (let i = 0; i < cell.edges.length; i++) {
                if (cell.edges[i].target.id === cell.id) {
                    obj.outConditionId = cell.edges[i].source.getAttribute('_id');
                } else {
                    job = cell.edges[i].target.getAttribute('actual');
                }
            }
            obj.event = cell.getAttribute('label');
            ConditionService.addEvent(obj).then(function () {
                updateSingleJob(job);
            }, function (err) {
                toasty.error({
                    title: err.data.error.code,
                    msg: err.data.error.message || 'API exception',
                    timeout: 10000
                });
            });
        };

        vm.removeAllEventFromWorkflow = function () {

            vm.deleteAllEvents = true;
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/confirm-dialog.html',
                controller: 'DialogCtrl1',
                scope: vm,
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                let len = vm.eventList.length;
                for (let i = 0; i < len; i++) {
                    let obj = {
                        'masterId': $scope.schedulerIds.selected,
                        'workflow': vm.selectedWorkflow,
                        'event': vm.eventList[i].event,
                        'outConditionId': vm.eventList[i].outConditionId
                    };
                    ConditionService.deleteEvent(obj).then(function (res) {
                        if (i === len - 1) {
                            recursivelyConnectJobs(true, true);
                        }
                    });
                }
            }, function () {

            });
        };

        vm.removeEventFromWorkflow = function (cell) {
            let obj = {masterId: $scope.schedulerIds.selected, workflow: vm.selectedWorkflow};
            obj.event = cell.getAttribute('actual');
            let job = '';
            for (let i = 0; i < cell.edges.length; i++) {
                if (cell.edges[i].target.id === cell.id) {
                    obj.outConditionId = cell.edges[i].source.getAttribute('_id');

                } else {
                    job = cell.edges[i].target.getAttribute('actual');
                }
            }
            ConditionService.deleteEvent(obj).then(function () {
                updateSingleJob(job);
            });
        };

        vm.startConditionResolver = function () {
            ConditionService.startConditionResolver({"masterId": $scope.schedulerIds.selected}).then(function (res) {
                console.log(res);
            });
        };

        vm.resetJob = function (cell) {
            ConditionService.resetWorkflow({
                "masterId": $scope.schedulerIds.selected,
                "job": cell.getAttribute('actual'),
                "workflow": ''
            }).then(function (res) {
                updateSingleJob(cell.getAttribute('actual'));
            })
        };

        function updateSingleJob(job) {
            ConditionService.inCondition({
                jobschedulerId: $scope.schedulerIds.selected,
                jobs: [{job: job}]
            }).then(function (res) {
                ConditionService.outCondition({
                    jobschedulerId: $scope.schedulerIds.selected,
                    jobs: [{job: job}]
                }).then(function (result) {
                    for (let i = 0; i < vm.jobs.length; i++) {
                        if (vm.jobs[i].path === job) {
                            vm.jobs[i].inconditions = res.jobsInconditions[0].inconditions;
                            vm.jobs[i].outconditions = result.jobsOutconditions[0].outconditions;
                        }
                    }
                    updateJobs();
                });
            });
        }

        function updateExpression(cell) {
            for (let i = 0; i < vm.jobs.length; i++) {
                if (vm.expression.job === vm.jobs[i].path) {
                    if (vm.expression.label === 'InCondition') {
                        for (let j = 0; j < vm.jobs[i].inconditions.length; j++) {
                            if (vm.jobs[i].inconditions[j].vertexId == cell.id) {
                                let flg = vm.jobs[i].inconditions[j].conditionExpression.expression == vm.expression.expression;
                                if (!flg) {
                                    vm.jobs[i].inconditions[j].conditionExpression.expression = vm.expression.expression;
                                }

                                for (let m = 0; m < vm.jobs[i].inconditions[j].inconditionCommands.length; m++) {
                                    for (let n = 0; n < vm.expression.commands.length; n++) {
                                        if (vm.jobs[i].inconditions[j].inconditionCommands[m].command === vm.expression.commands[n].command && vm.jobs[i].inconditions[j].inconditionCommands[m].commandParam === vm.expression.commands[n].commandParam) {
                                            vm.expression.commands[n].id = vm.jobs[i].inconditions[j].inconditionCommands[m].id;
                                            break;
                                        }
                                    }
                                }
                                vm.jobs[i].inconditions[j].inconditionCommands = vm.expression.commands;
                                ConditionService.updateInCondition({
                                    masterId: $scope.schedulerIds.selected,
                                    jobsInconditions: [{job: vm.jobs[i].path, inconditions: vm.jobs[i].inconditions}]
                                }).then(function (res) {
                                    if (!flg) {
                                        if (res.jobsInconditions && res.jobsInconditions.length > 0) {
                                            vm.jobs[i].inconditions = res.jobsInconditions[0].inconditions;
                                        }
                                        updateJobs();
                                    }
                                });
                                break;

                            }
                        }
                    } else if (vm.expression.label === 'OutCondition') {
                        for (let j = 0; j < vm.jobs[i].outconditions.length; j++) {
                            if (vm.jobs[i].outconditions[j].vertexId == cell.id) {
                                vm.jobs[i].outconditions[j].conditionExpression.expression = vm.expression.expression;
                                for (let m = 0; m < vm.jobs[i].outconditions[j].outconditionEvents.length; m++) {
                                    if (vm.jobs[i].outconditions[j].outconditionEvents[m].command === 'create') {
                                        for (let n = 0; n < vm.expression.events.length; n++) {
                                            if (vm.jobs[i].outconditions[j].outconditionEvents[m].event === vm.expression.events[n].event) {
                                                vm.expression.events.splice(n, 1);
                                                break;
                                            }
                                        }

                                    }
                                }
                                for (let n = 0; n < vm.expression.events.length; n++) {
                                    vm.expression.events[n].command = 'create';
                                }

                                vm.jobs[i].outconditions[j].outconditionEvents = vm.jobs[i].outconditions[j].outconditionEvents.concat(vm.expression.events);

                                ConditionService.updateOutCondition({
                                    masterId: $scope.schedulerIds.selected,
                                    jobsOutconditions: [{job: vm.jobs[i].path, outconditions: vm.jobs[i].outconditions}]
                                }).then(function (res) {
                                    if (res.jobsOutconditions && res.jobsOutconditions.length > 0) {
                                        vm.jobs[i].outconditions = res.jobsOutconditions[0].outconditions;
                                    }
                                    updateJobs();
                                });
                                break;
                            }
                        }
                    }
                    break;
                }
            }
        }

        function updateJobs() {
            let element = document.getElementById("graph");
            let scrollTop = element.scrollTop;
            vm.editor.graph.removeCells(vm.editor.graph.getChildVertices(vm.editor.graph.getDefaultParent()));
            createWorkflowDiagram(vm.jobs, false, scrollTop);
            vm.getEvents(null);
        }

        vm.navigateToEvent = function (evt) {
            let vertices = vm.editor.graph.getChildVertices(vm.editor.graph.getDefaultParent());
            for (let i = 0; i < vertices.length; i++) {
                if (vertices[i].value.tagName === 'Event') {
                    if (vertices[i].getAttribute('actual') == evt) {
                        const graph = $('#graph');
                        let bounds = vm.editor.graph.getGraphBounds();
                        let state = vm.editor.graph.view.getState(vertices[i]);
                        vm.editor.graph.view.setTranslate(((graph.width() / 2) - (state.width / 2) - (state.x - bounds.x)),
                            (bounds.y - (state.y - ((graph.height() / 2) - (state.height / 2)))));
                        break;
                    }
                }
            }
        };

        $scope.$on('reloadWorkflow', function () {
            updateWorkflowDiagram(vm.jobs);
        });

        /**
         * Constructs a new application (returns an mxEditor instance)
         */
        function createEditor() {
            let editor = null;
            try {
                if (!mxClient.isBrowserSupported()) {
                    mxUtils.error('Browser is not supported!', 200, false);
                } else {
                    const node = mxUtils.load(vm.configXml).getDocumentElement();
                    editor = new mxEditor(node);
                    vm.editor = editor;
                    initEditorConf(editor);
                    const outln = document.getElementById('outlineContainer');
                    outln.style['border'] = '1px solid lightgray';
                    outln.style['background'] = '#FFFFFF';
                    new mxOutline(editor.graph, outln);
                    editor.graph.allowAutoPanning = true;
                }
            } catch (e) {
                // Shows an error message if the editor cannot start
                mxUtils.alert('Cannot start application: ' + e.message);
                throw e; // for debugging
            }
        }

        /**
         * Reformat the layout
         */
        function executeLayout(graph) {
            const layout = new mxHierarchicalLayout(graph);
            layout.execute(graph.getDefaultParent());
        }

        /**
         * Function to centered the flow diagram
         */
        function makeCenter(graph) {
             t1 = $timeout(function () {
                graph.zoomActual();
                graph.center(true, true, 0.5, 0);
            }, 0);
        }

        /**
         * Function to create dom element
         */
        function getCellNode(name, label, actual) {
            const doc = mxUtils.createXmlDocument();
            // Create new node object
            const _node = doc.createElement(name);
            _node.setAttribute('label', label);
            _node.setAttribute('actual', actual);
            return _node;
        }

        /**
         * Function to create vertex
         */
        function createVertex(parent, _node, text, style) {
            let size = mxUtils.getSizeForString(text, 12);
            let w = (size.width + 66);
            let h = (size.height + 20);
            if (style === 'circle') {
                w = size.width + 16 < 60 ? 60 : size.width + 16;
                if (w > 100) {
                    h = w / 2;
                } else {
                    h = w - 3;
                }
            } else if (style === 'event' || style === 'event1' || style === 'event2') {
                h = size.height + 50;
            } else if (style === 'condition' || style === 'condition1' || style === 'condition2') {
                h = size.height + 30;
            }
            return vm.editor.graph.insertVertex(parent, null, _node, 0, 0, w, h, style);
        }

        /**
         * Function to cverride Mxgraph properties and functions
         */
        function initEditorConf(editor) {
            const graph = editor.graph;

            // Alt disables guides
            mxGraphHandler.prototype.guidesEnabled = true;
            mxGraph.prototype.cellsResizable = false;
            mxGraph.prototype.multigraph = false;
            mxGraph.prototype.allowDanglingEdges = false;
            mxGraph.prototype.cellsLocked = true;
            mxGraph.prototype.foldingEnabled = true;
            mxHierarchicalLayout.prototype.interRankCellSpacing = 50;
            mxTooltipHandler.prototype.delay = 0;
            mxConstants.VERTEX_SELECTION_COLOR = null;
            mxConstants.EDGE_SELECTION_COLOR = null;

            if (vm.preferences.theme !== 'light' && vm.preferences.theme !== 'lighter' || !vm.userPreferences.theme) {
                let style = graph.getStylesheet().getDefaultEdgeStyle();
                style[mxConstants.STYLE_FONTCOLOR] = '#ffffff';
            }

            // Enables snapping waypoints to terminals
            mxEdgeHandler.prototype.snapToTerminals = true;
            graph.setAutoSizeCells(true);
            graph.setCellsResizable(true);
            graph.setConnectable(false);
            graph.setHtmlLabels(true);
            graph.setDisconnectOnMove(false);
            graph.collapseToPreferredSize = false;
            graph.constrainChildren = false;
            graph.extendParentsOnAdd = false;
            graph.extendParents = false;

            // Off page connector
            function OffPageConnectorShape() {
                mxActor.call(this);
            }

            mxUtils.extend(OffPageConnectorShape, mxActor);
            OffPageConnectorShape.prototype.size = 3 / 8;
            OffPageConnectorShape.prototype.isRoundable = function () {
                return true;
            };
            OffPageConnectorShape.prototype.redrawPath = function (c, x, y, w, h) {
                let s = h * Math.max(0, Math.min(1, parseFloat(mxUtils.getValue(this.style, 'size', this.size))));
                let arcSize = mxUtils.getValue(this.style, mxConstants.STYLE_ARCSIZE, mxConstants.LINE_ARCSIZE) / 2;
                this.addPoints(c, [new mxPoint(0, 0), new mxPoint(w, 0), new mxPoint(w, h - s), new mxPoint(w / 2, h),
                    new mxPoint(0, h - s)], this.isRounded, arcSize, true);
                c.end();
            };

            mxCellRenderer.registerShape('offPageConnector', OffPageConnectorShape);

            /**
             * Overrides method to provide a cell label in the display
             * @param cell
             */
            graph.convertValueToString = function (cell) {
                return cell.getAttribute('label');
            };

            graph.getTooltipForCell = function (cell) {
                let str = '';
                if (mxUtils.isNode(cell.value)) {
                    if (cell.value.tagName === 'Connection' || cell.value.tagName === 'Box') {
                        return '';
                    } else {
                        if (cell.value.tagName === 'Job') {
                            str = cell.getAttribute('label') + ' - ' + cell.getAttribute('status');
                        } else if (cell.value.tagName === 'Event') {
                            str = 'Event: ' + cell.getAttribute('label');
                        } else if (cell.value.tagName === 'InCondition') {
                            str = 'In-condition: ' + cell.getAttribute('label');
                        } else if (cell.value.tagName === 'OutCondition') {
                            str = 'Out-condition: ' + cell.getAttribute('label');
                        }
                    }
                }
                return str;
            };

            // Shows a "modal" window when double clicking a vertex.
            graph.dblClick = function (evt, cell) {
                // Do not fire a DOUBLE_CLICK event here as mxEditor will
                // consume the event and start the in-place editor.
                if (this.isEnabled() &&
                    !mxEvent.isConsumed(evt) &&
                    cell != null) {
                    if (cell.value.tagName !== 'Job' && cell.value.tagName !== 'Box' && cell.value.tagName !== 'Event' && cell.value.tagName !== 'Connection') {
                        vm.openModel(cell);
                    }
                }
                // Disables any default behaviour for the double click
                mxEvent.consume(evt);
            };

            // Shows a "modal" window when clicking on img.
            function mxIconSet(state) {
                this.images = [];
                let img;
                if (state.cell && state.cell.value.tagName !== 'Job' && state.cell.value.tagName !== 'Box' && state.cell.value.tagName !== 'Event' && state.cell.value.tagName !== 'Connection') {
                    // Edit
                   // if (!state.cell.getAttribute('isConsumed') || state.cell.getAttribute('isConsumed') == 'false') {
                        img = mxUtils.createImage('images/edit.svg');
                        img.setAttribute('title', gettextCatalog.getString('button.updateExpression'));
                        img.style.left = (state.x + state.width - 6) + 'px';
                        img.style.top = (state.y - 2) + 'px';

                        mxEvent.addListener(img, 'click',
                            mxUtils.bind(this, function (evt) {
                                vm.openModel(state.cell);
                                mxEvent.consume(evt);
                                this.destroy();
                            })
                        );
                   // }

                } else if (state.cell.value.tagName === 'Event') {
                    if (state.cell.getAttribute('isExist') == 'true') {
                        // Remove
                        img = mxUtils.createImage('images/delete.png');
                        img.setAttribute('title', gettextCatalog.getString('button.deleteEvent'));
                        img.style.left = (state.x + state.width) + 'px';
                        img.style.top = (state.y + (state.height / 2) + 2) + 'px';

                        mxEvent.addListener(img, 'click',
                            mxUtils.bind(this, function (evt) {
                                vm.removeEventFromWorkflow(state.cell);
                                mxEvent.consume(evt);
                                this.destroy();
                            })
                        );
                    }

                    if (state.cell.getAttribute('isExist') == 'false') {
                        // add
                        img = mxUtils.createImage('images/add.png');
                        img.setAttribute('title', gettextCatalog.getString('button.addEvent'));
                        img.style.left = (state.x - 3) + 'px';
                        img.style.top = (state.y + (state.height / 2) + 1) + 'px';

                        mxEvent.addListener(img, 'click',
                            mxUtils.bind(this, function (evt) {
                                vm.addEventFromWorkflow(state.cell);
                                mxEvent.consume(evt);
                                this.destroy();
                            })
                        );

                    }
                } else if (state.cell.value.tagName === 'Job') {
                    // Edit
                    img = mxUtils.createImage('images/reset.svg');
                    img.setAttribute('title', gettextCatalog.getString('button.resetJob'));
                    img.style.left = (state.x + state.width - 6) + 'px';
                    img.style.top = (state.y - 2) + 'px';

                    mxEvent.addListener(img, 'click',
                        mxUtils.bind(this, function (evt) {
                            vm.resetJob(state.cell);
                            mxEvent.consume(evt);
                            this.destroy();
                        })
                    );
                }

                if (img) {
                    img.style.position = 'absolute';
                    img.style.cursor = 'pointer';
                    img.style.width = '16px';
                    img.style.height = '16px';
                    state.view.graph.container.appendChild(img);
                    this.images.push(img);
                }
            }

            mxIconSet.prototype.destroy = function () {
                if (this.images != null) {
                    for (var i = 0; i < this.images.length; i++) {
                        var img = this.images[i];
                        img.parentNode.removeChild(img);
                    }
                }

                this.images = null;
            };

            // Defines the tolerance before removing the icons
            var iconTolerance = 20;

            // Shows icons if the mouse is over a cell
            graph.addMouseListener({
                    currentState: null,
                    currentIconSet: null,
                    mouseDown: function (sender, me) {
                        // Hides icons on mouse down
                        if (this.currentState != null) {
                            this.dragLeave(me.getEvent(), this.currentState);
                            this.currentState = null;
                        }
                    },
                    mouseMove: function (sender, me) {
                        if (this.currentState != null && (me.getState() == this.currentState ||
                            me.getState() == null)) {
                            let tol = iconTolerance;
                            let tmp = new mxRectangle(me.getGraphX() - tol,
                                me.getGraphY() - tol, 2 * tol, 2 * tol);

                            if (mxUtils.intersects(tmp, this.currentState)) {
                                return;
                            }
                        }

                        let tmp = graph.view.getState(me.getCell());
                        // Ignores everything but vertices
                        if (graph.isMouseDown || (tmp != null && !graph.getModel().isVertex(tmp.cell))) {
                            tmp = null;
                        }
                        if (tmp != this.currentState) {
                            if (this.currentState != null) {
                                this.dragLeave(me.getEvent(), this.currentState);
                            }
                            this.currentState = tmp;
                            if (this.currentState != null) {
                                this.dragEnter(me.getEvent(), this.currentState);
                            }
                        }
                    },
                    mouseUp: function (sender, me) {
                    },
                    dragEnter: function (evt, state) {
                        if (this.currentIconSet == null) {
                            this.currentIconSet = new mxIconSet(state);
                        }
                    },
                    dragLeave: function (evt, state) {
                        if (this.currentIconSet != null) {
                            this.currentIconSet.destroy();
                            this.currentIconSet = null;
                        }
                    }
                });

            mxCellOverlay.prototype.getBounds = function (state) {
                let isEdge = state.view.graph.getModel().isEdge(state.cell);
                let s = state.view.scale;
                let pt = null;
                let w = this.image.width;
                let h = this.image.height;
                if (!isEdge) {
                    pt = new mxPoint();
                    if (this.align == mxConstants.ALIGN_LEFT) {
                        pt.x = state.x;
                    } else if (this.align == mxConstants.ALIGN_CENTER) {
                        pt.x = state.x + state.width / 2;
                    } else {
                        pt.x = state.x + state.width;
                    }
                    if (this.verticalAlign == mxConstants.ALIGN_TOP) {
                        pt.y = state.y;
                    } else if (this.verticalAlign == mxConstants.ALIGN_MIDDLE) {
                        pt.y = state.y + state.height / 2;
                    } else {
                        pt.y = state.y + state.height;
                    }
                }
                if (state.cell && state.cell.value.tagName === 'OutCondition') {
                    return new mxRectangle(Math.round(pt.x - (w * this.defaultOverlap - this.offset.x) * s),
                        Math.round(pt.y - (h * this.defaultOverlap - this.offset.y) * s) + 3, w * s, h * s);
                } else {
                    return new mxRectangle(Math.round(pt.x - (w * this.defaultOverlap - this.offset.x) * s),
                        Math.round(pt.y - (h * this.defaultOverlap - this.offset.y) * s) - 3, w * s, h * s);
                }
            };
        }

        $scope.$on('event-started', function () {
            if (vm.events && vm.events.length > 0 && vm.events[0].eventSnapshots) {
                for (let m = 0; m < vm.events[0].eventSnapshots.length; m++) {
                    if (vm.events[0].eventSnapshots[m].eventType === "EventCreated" && !vm.events[0].eventSnapshots[m].eventId) {
                        recursivelyConnectJobs(true, true);
                        break;
                    } else if (vm.events[0].eventSnapshots[m].eventType === "InconditionValidated" && !vm.events[0].eventSnapshots[m].eventId) {
                        updateSingleJob(vm.events[0].eventSnapshots[m].path);
                    } else if(vm.events[0].eventSnapshots[m].eventType === "JobStateChanged" && !vm.events[0].eventSnapshots[m].eventId){
                        let flag = false;
                        for(let i =0; i < vm.allJobs.length; i++) {
                            if(vm.allJobs[i].path === vm.events[0].eventSnapshots[m].path){
                               
                                flag = true;
                                break;
                            }
                        }
                        if (flag) {
                            t1 = $timeout(function () {
                                
                                recursivelyConnectJobs(true, true);
                            }, 200);
                            break;
                        }
                    }
                }
            }
        });


        /** -------------------- Actions ------------------- */


        $scope.$on('startConditionResolver', function () {
            vm.startConditionResolver();
        });

        $scope.$on('zoomIn', function () {
            if (vm.editor && vm.editor.graph) {
                vm.editor.graph.zoomIn();
            }
        });

        $scope.$on('zoomOut', function () {
            if (vm.editor && vm.editor.graph) {
                vm.editor.graph.zoomOut();
            }
        });

        $scope.$on('actual', function () {
            if (vm.editor && vm.editor.graph) {
                vm.editor.graph.zoomActual();
                vm.editor.graph.center(true, true, 0.5, 0);
            }
        });

        $scope.$on('fit', function () {
            if (vm.editor && vm.editor.graph) {
                vm.editor.graph.fit();
                vm.editor.graph.center(true, true, 0.5, 0);
            }
        });

        vm.functions = ['[*]', '[today]', '[yesterday]', '[yesterday - 2]'];
        let d = new Date();
        let day = Math.ceil((new Date(d.getTime()) - new Date(d.getFullYear(), 0, 1) + 1) / 86400000);
        vm.functions.push('[' + d.getFullYear() + '.' + day + ']');
        vm.getSuggestion = function ($event) {
            let key = $event.keyCode || $event.which;
            if (key === 91) {
                $('#event-suggestion').css({
                    display: 'inline-block',
                    opacity: 1,
                    left: $event.target.value.length * 3 + 'px'
                });
            } else if (key === 93 || key === 13 || key === 8) {
                $('#event-suggestion').css({display: 'none', opacity: 0});
            }
        };

        vm.addSuggestion = function (value) {
            if (vm.expression && vm.expression.expression) {
                vm.expression.expression = vm.expression.expression + value.substring(1);
            }
            $('#event-suggestion').css({display: 'none', opacity: 0});
        };

        $scope.$on('$destroy', function () {
            if (t1) {
                $timeout.cancel(t1);
            }
            try {
                if (vm.editor) {
                    vm.editor.destroy();
                    vm.editor = null;
                }
            } catch (e) {
                console.error(e);
            }

        });
    }
})();
