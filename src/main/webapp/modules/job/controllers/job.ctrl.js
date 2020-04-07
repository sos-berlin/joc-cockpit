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
        "$rootScope", "CoreService", "$timeout", "TaskService", "$window", "AuditLogService", "$filter"];

    function JobChainCtrl($scope, JobChainService, OrderService, JobService, UserService, $location, SOSAuth, $uibModal, orderBy, ScheduleService, SavedFilter,
                          $rootScope, CoreService, $timeout, TaskService, $window, AuditLogService, $filter) {
        const vm = $scope;
        vm.jobChainFilters = CoreService.getJobChainTab();
        vm.maxEntryPerPage = vm.userPreferences.maxEntryPerPage;
        vm.jobChainFilters.isCompact = vm.userPreferences.isJobChainCompact == undefined ? vm.userPreferences.isCompact : vm.userPreferences.isJobChainCompact;

        vm.object = {};
        vm.object1 = {};
        vm.isUnique = true;
        vm.tree = [];
        vm.allJobChains = [];
        vm.chainFiltered = [];
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
                vm.chainFiltered = tempArr.slice((vm.userPreferences.entryPerPage * (vm.jobChainFilters.currentPage - 1)), (vm.userPreferences.entryPerPage * vm.jobChainFilters.currentPage));
            } else {
                vm.chainFiltered = tempArr;
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
            $scope.reloadState = 'no';
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
                    if (_.isEmpty(vm.jobChainFilters.expand_to)) {
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
            if (vm.jobChainFilters.filter.state && vm.jobChainFilters.filter.state !== 'ALL') {
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
                if (vm.jobChainFilters.filter.state && vm.jobChainFilters.filter.state !== 'ALL') {
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
            for (let i = 0; i < vm.chainFiltered.length; i++) {
                if (!vm.chainFiltered[i].state) {
                    obj.jobChains.push({jobChain: vm.chainFiltered[i].path});
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
                if (vm.jobChainFilters.filter.state && vm.jobChainFilters.filter.state !== 'ALL') {
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
                vm.jobChainCheckAll.checkbox = newNames.length === vm.chainFiltered.slice((vm.userPreferences.entryPerPage * (vm.jobChainFilters.currentPage - 1)), (vm.userPreferences.entryPerPage * vm.jobChainFilters.currentPage)).length;
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
            if (vm.jobChainCheckAll.checkbox && vm.chainFiltered && vm.chainFiltered.length > 0) {
                let _jobChain = $filter('orderBy')($scope.chainFiltered, vm.jobChainFilters.filter.sortBy, vm.jobChainFilters.reverse);
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
            let arr;
            let isFiltered = true;
            if (vm.jobChainFilters.filter.sortBy === 'name' || vm.jobChainFilters.filter.sortBy === 'path') {
                arr = all ? vm.jobChains : vm.chainFiltered;
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
                for (let i = 0; i < vm.chainFiltered.length; i++) {
                    if (!vm.chainFiltered[i].state) {
                        obj.jobChains.push({jobChain: vm.chainFiltered[i].path});
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
            obj.limit = parseInt(vm.userPreferences.maxHistoryPerJobchain, 10);
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
            obj.limit = parseInt(vm.userPreferences.maxHistoryPerTask,10);
            obj.orders = [{
                jobChain: jobChain.path
            }];

            if (skip && !_.isEmpty(vm.taskHistoryRequestObj)) {

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

    JobCtrl.$inject = ["$scope", "$rootScope", "JobService", "UserService", "$uibModal", "orderByFilter", "SavedFilter", "TaskService", "$state", "CoreService", "$timeout", "AuditLogService", "$location", "OrderService", "$filter", "ConditionService", "FileUploader", "toasty", "gettextCatalog"];

    function JobCtrl($scope, $rootScope, JobService, UserService, $uibModal, orderBy, SavedFilter, TaskService, $state, CoreService, $timeout, AuditLogService, $location, OrderService, $filter, ConditionService, FileUploader, toasty, gettextCatalog) {
        const vm = $scope;
        vm.isConditionTab = $location.path() === '/job_streams';

        vm.jobFilters = vm.isConditionTab ? CoreService.getConditionTab() : CoreService.getJobTab();
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

        if (vm.jobFilters.selectedView && !vm.isConditionTab) {
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
            if (!vm.savedJobFilter.selected && !vm.isConditionTab) {
                initTree();
            }
            if (!vm.isConditionTab) {
                checkSharedFilters();
            } else {
                initWorkflowTree();
            }
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
                if (vm.jobs && vm.jobs.length > 0) {
                    vm.showTaskFuc(vm.jobs[0]);
                }
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
                    if (vm.jobs && vm.jobs.length > 0) {
                        vm.showTaskFuc(vm.jobs[0]);
                    }
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
            let tempArr;
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
                    if (_.isEmpty(vm.jobFilters.expand_to)) {
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

        function initWorkflowTree() {
            vm.reloadState = 'no';
            let obj = {jobschedulerId: vm.schedulerIds.selected};
            if (vm.jobFilters.graphViewDetail.jobStream !== 'ALL') {
                obj.jobStream = vm.jobFilters.graphViewDetail.jobStream
            }
            JobService.tree({
                jobschedulerId: vm.schedulerIds.selected,
                compact: true,
                types: ['JOB']
            }).then(function (res) {
                ConditionService.workflowTree(obj).then(function (res1) {
                    vm.jobStreams = ['ALL'];
                    if (res1.jobStreamFolders && res1.jobStreamFolders.length > 0) {
                        for (let i = 0; i < res1.jobStreamFolders.length; i++) {
                            vm.jobStreams.push(res1.jobStreamFolders[i].jobStream);
                        }
                    }
                    vm._tempTree = angular.copy(res.folders);
                    if (vm.jobFilters.graphViewDetail.jobStream !== 'ALL' && res1.jobStreamFolders && res1.jobStreamFolders.length > 0) {
                        let jobStreamFolders = [];
                        if (res1.jobStreamFolders && res1.jobStreamFolders.length > 0) {
                            for (let i = 0; i < res1.jobStreamFolders.length; i++) {
                                if (res1.jobStreamFolders[i].jobStream === vm.jobFilters.graphViewDetail.jobStream) {
                                    jobStreamFolders = res1.jobStreamFolders[i].folders;
                                }
                            }
                        }
                        let folders = filterTreeData(jobStreamFolders);
                        if (_.isEmpty(vm.jobFilters.expand_to)) {
                            vm.tree = angular.copy(folders);
                            filteredTreeData();
                        } else {
                            vm.jobFilters.expand_to = vm.recursiveTreeUpdate(angular.copy(folders), vm.jobFilters.expand_to);
                            vm.tree = vm.jobFilters.expand_to;
                            vm.jobFilters.expand_to = [];
                            vm.changeStatus();
                        }
                    } else {
                        if (_.isEmpty(vm.jobFilters.expand_to)) {
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
                });

            }, function () {
                vm.isLoading = true;
            });
        }

        vm.updateJobStreamFolders = function () {
            ConditionService.workflowTree({jobschedulerId: vm.schedulerIds.selected}).then(function (res1) {
                vm.jobStreams = ['ALL'];
                if (res1.jobStreamFolders && res1.jobStreamFolders.length > 0) {
                    for (let i = 0; i < res1.jobStreamFolders.length; i++) {
                        vm.jobStreams.push(res1.jobStreamFolders[i].jobStream);
                    }
                }
            });
        };

        vm.$on('reloadTree', function (evt, data) {
            if (vm.jobFilters.graphViewDetail.jobStream === data.oldName) {
                vm.jobFilters.graphViewDetail.jobStream = data.newName;
            }
            vm.updateJobStreamFolders();
        });

        function filterTreeData(list) {
            let _tempArr = [];
            list = list.sort();
            for (let i = list.length - 1; i >= 0; i--) {
                if (_tempArr.length == 0) {
                    _tempArr.push(list[i]);
                } else if (!_tempArr[_tempArr.length - 1].match(list[i])) {
                    _tempArr.push(list[i]);
                }
            }
            if (_tempArr.length === 0) {
                let obj = {name: '', path: '/'};
                obj.selected1 = true;
                vm.allJobs = [];
                checkExpand(obj);
                return [obj];
            }
            let folders = [], isCalled = false;
            for (let i = 0; i < _tempArr.length; i++) {
                let nodes = _tempArr[i].split('/');
                let arr = [];
                let flag = true, index = 0;

                for (let j = 0; j < nodes.length; j++) {
                    let obj = {};
                    obj.name = nodes[j];
                    obj.path = nodes[j] ? _tempArr[i].substring(0, _tempArr[i].lastIndexOf(nodes[j]) + nodes[j].length) : '/';
                    obj.expanded = true;

                    if (j < nodes.length - 1) {
                        obj.folders = [];
                    } else if (!isCalled) {
                        isCalled = true;
                        obj.selected1 = true;
                        vm.allJobs = [];
                        checkExpand(obj);
                    }
                    if (folders && folders[0] && folders[0][j]) {
                        if (folders[0][j].name == nodes[j]) {
                            flag = false;
                            index = j;
                        } else {
                            if (arr.length === 0) {
                                arr.push(obj);
                            } else if (arr.length > 0) {
                                recursiveUpdate(arr[0], obj);
                            }
                        }
                    } else {
                        if (arr.length === 0) {
                            arr.push(obj);
                        } else if (arr.length > 0) {
                            recursiveUpdate(arr[0], obj);
                        }
                    }
                }
                if (flag) {
                    folders.push(arr);
                } else {
                    recursiveUpdate1(folders[0][index], arr);
                }


            }

            return folders[0];
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
            if (arr && arr.length > 0 && arr[0].folders) {
                for (let y = 0; y < data.folders.length; y++) {
                    if (arr[0].name === data.folders[y].name) {
                        flag = false;
                        recursiveUpdate1(data.folders[y], arr[0].folders);
                    }
                }
            }
            if (flag) {
                let flag2 = true;
                for (let i = 0; i < data.folders.length; i++) {
                    if (data.folders[i].name === arr[0].name && data.folders[i].path === arr[0].path) {
                        flag2 = false;
                        break;
                    }
                }
                if (flag2) {
                    data.folders.push(arr[0]);
                }
            }
        }

        vm.changeWorkflowPath = function (path) {
            vm.jobFilters.graphViewDetail.jobStream = path;
            if (path !== 'ALL') {
                vm.isLoading = false;
                let obj = {
                    jobschedulerId: vm.schedulerIds.selected,
                    jobStream: vm.jobFilters.graphViewDetail.jobStream
                };
                ConditionService.workflowTree(obj).then(function (res1) {
                    let jobStreamFolders = [];
                    if (res1.jobStreamFolders && res1.jobStreamFolders.length > 0) {
                        for (let i = 0; i < res1.jobStreamFolders.length; i++) {
                            if (res1.jobStreamFolders[i].jobStream === path) {
                                jobStreamFolders = res1.jobStreamFolders[i].folders;
                                break;
                            }
                        }
                    }
                    let folders = filterTreeData(jobStreamFolders);
                    if (_.isEmpty(vm.jobFilters.expand_to)) {
                        vm.tree = angular.copy(folders);
                    } else {
                        vm.jobFilters.expand_to = vm.recursiveTreeUpdate(angular.copy(folders), vm.jobFilters.expand_to);
                        vm.tree = vm.jobFilters.expand_to;
                        vm.jobFilters.expand_to = [];
                        vm.changeStatus();
                    }
                    vm.isLoading = true;
                }, function () {
                    vm.isLoading = true;
                });
            } else {
                if (vm._tempTree) {
                    vm.tree = angular.copy(vm._tempTree);
                }
                filteredTreeData();
            }
        };

        vm.$on('reloadObject', function () {
            navFullTree();
            filteredTreeData();
        });

        vm.noReload = false;

        $scope.$on('switchPath', function ($event, path) {
            let p = path.path;
            angular.forEach(vm.tree, function (value) {
                if (value.path != p) {
                    value.expanded = true;
                    recursive(value, p);
                } else {
                    vm.noReload = true;
                    vm.treeHandler(value);
                }
            });
        });

        function recursive(data, path) {
            for (let i = 0; i < data.folders.length; i++) {
                if (data.folders[i].path != path) {
                    if (path.match(data.folders[i].path)) {
                        data.folders[i].expanded = true;
                    }
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

            if (vm.isConditionTab) {
                obj.isOrderJob = false;
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
                                if (res1.jobs && res1.jobs.length > 0)
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

            if (vm.isConditionTab) {
                obj.isOrderJob = false;
            }
            JobService.getJobsP(obj).then(function (result) {
                for (let i = 0; i < result.jobs.length; i++) {
                    result.jobs[i].path1 = data.path;
                }
                data.jobs = result.jobs;
                vm.allJobs = result.jobs;
                if (vm.noReload) {
                    vm.noReload = false;
                    $scope.$broadcast('reloadWorkflow');
                }
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
            if(vm.tree) {
                for (let i = 0; i < vm.tree.length; i++) {
                    if ($rootScope.job_expand_to) {
                        vm.expand_to = angular.copy($rootScope.job_expand_to);
                        splitPath = vm.expand_to.path.split('/');
                        $rootScope.job_expand_to = '';
                        vm.flag = true;
                    }
                    if (splitPath.length < 2) {
                        if(!vm.tree[i].expanded) {
                            vm.tree[i].selected1 = true;
                        }
                    }
                    vm.tree[i].expanded = true;
                    vm.allJobs = [];
                    checkExpand(vm.tree[i]);
                }
            }else{
                if(vm._tempTree) {
                    vm.tree = angular.copy(vm._tempTree);
                }
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
            if (vm.selectedFiltered.criticality && vm.selectedFiltered.criticality.length > 0) {
                obj.criticality = vm.selectedFiltered.criticality;
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
            $('[data-toggle="tooltip"]').tooltip('dispose');
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
                $('[data-toggle="tooltip"]').tooltip();
            }, 10);
        }

        function volatileInformation(obj, expandNode, treeUpdate) {
            if (vm.scheduleState === 'UNREACHABLE') {
                updateTreeData(expandNode, treeUpdate);
                return;
            }
            if (!vm.selectedFiltered) {
                if (vm.jobFilters.filter.state && vm.jobFilters.filter.state !== 'ALL') {
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
            if (vm.isConditionTab) {
                obj.isOrderJob = false;
                obj.compact = false;
            }
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
                vm.noReload = false;
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
            if (vm.jobFilters.filter.state && vm.jobFilters.filter.state !== 'ALL') {
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
                if(vm.selectedFiltered.criticality){
                    obj.criticality = vm.selectedFiltered.criticality;
                }
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

            if (vm.isConditionTab) {
                obj1.isOrderJob = false;
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
            if (vm.isConditionTab) {
                initWorkflowTree();
            } else {
                initTree();
            }
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
            if (vm.allCheck.checkbox && vm.filtered.length > 0) {
                let _job = $filter('orderBy')($scope.filtered, vm.jobFilters.filter.sortBy, vm.jobFilters.reverse);
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
            let arr;
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
            if (vm.isConditionTab) {
                obj.isOrderJob = false;
            }
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
                } else if (res.jobs && res.jobs.length && (!obj.criticality || obj.criticality.length===0)) {
                    for (let i = 0; i < res.jobs.length; i++) {
                        res.jobs[i].path1 = res.jobs[i].path.substring(0, res.jobs[i].path.lastIndexOf('/')) || res.jobs[i].path.substring(0, res.jobs[i].path.lastIndexOf('/') + 1);
                    }
                    vm.allJobs = res.jobs;
                }else{
                    vm.allJobs = allJobs;
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
            if (vm.jobFilter.paths && vm.jobFilter.paths.length > 0) {
                obj.folders = [];
                for (let i = 0; i < vm.jobFilter.paths.length; i++) {
                    obj.folders.push({folder: vm.jobFilter.paths[i], recursive: true});
                }
            }
            if (vm.jobFilter.criticality && vm.jobFilter.criticality.length > 0) {
                obj.criticality = vm.jobFilter.criticality;
            }
            vm.folderPath = '/';
            if (vm.isConditionTab) {
                obj.isOrderJob = false;
            }
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
            if (vm.importJobstreamObj && vm.importJobstreamObj.jobs) {
                vm.object.importJobStreamObj = {};
            } else {
                delete vm.object['importJobStreamObj'];
            }
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
            if (vm.importJobstreamObj && vm.importJobstreamObj.jobs) {
                vm.importJobstreamObj.path = data.path;
                $('#treeModal').modal('hide');
                $('.fade-modal').css('opacity', '1');
            }
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
            if (vm.jobFilter) {
                vm.jobFilter.paths = vm.paths;
            }
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
            if (vm.isConditionTab) {
                obj.isOrderJob = false;
            }
            JobService.getJobsP(obj).then(function (res) {
                value = _.merge(value, res.job);
                obj.compactView = vm.jobFilters.isCompact;
                JobService.get(obj).then(function (result) {
                    if (result.jobs && result.jobs.length > 0)
                        value = mergePermanentAndVolatile(result.jobs[0], value);
                });
            }, function () {
                obj.compactView = vm.jobFilters.isCompact;
                JobService.get(obj).then(function (result) {
                    if (result.jobs && result.jobs.length > 0)
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
                if (res.jobs && res.jobs.length > 0) {
                    job.jobChains = res.jobs[0].jobChains;
                    job.showJobChains = true;
                    jobs.compactView = vm.jobFilters.isCompact;
                    JobService.get(jobs).then(function (result) {
                        job = mergePermanentAndVolatile(result.jobs[0], job);
                        updatePanelHeight();
                    });
                }
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
            if (vm.isConditionTab) {
                obj.isOrderJob = false;
            }
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
                                    if (result.jobs && result.jobs.length > 0) {
                                        if (vm.allJobs[m].path === result.jobs[0].path) {
                                            vm.allJobs[m] = mergePermanentAndVolatile(result.jobs[0], vm.allJobs[m]);
                                        }
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
                runTime: job.runTime,
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
                }
                var modalInstance = $uibModal.open({
                    templateUrl: 'modules/core/template/set-run-time-dialog.html',
                    controller: 'RuntimeEditorDialogCtrl',
                    scope: vm,
                    size: 'lg',
                    backdrop: 'static',
                    windowClass: 'fade-modal'
                });
                modalInstance.result.then(function (res) {
                    setRunTime(job);
                    vm.reset();
                }, function (res) {
                    if (res === 'ok') {
                        setRunTime(job);
                        vm.reset();
                    }
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

        vm.editConditions = function (job, name, cb) {
            vm._job = angular.copy(job);
            ConditionService.inCondition({
                jobschedulerId: $scope.schedulerIds.selected,
                jobs: [{job: job.path}]
            }).then(function (res) {
                if (res.jobsInconditions && res.jobsInconditions.length > 0) {
                    vm._job.inconditions = res.jobsInconditions[0].inconditions;
                    if (vm._job.inconditions && vm._job.inconditions.length > 0) {
                        openDialog(name, cb);
                    }
                }
                ConditionService.outCondition({
                    jobschedulerId: $scope.schedulerIds.selected,
                    jobs: [{job: job.path}]
                }).then(function (result) {
                    if (result.jobsOutconditions && result.jobsOutconditions.length > 0) {
                        vm._job.outconditions = result.jobsOutconditions[0].outconditions;
                        if (vm._job.inconditions && vm._job.inconditions.length === 0) {
                            openDialog(name, cb);
                        }
                    }
                });
            })
        };

        function openDialog(name, cb) {
            vm._jobStreamName = name;
            var modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/conditions-dialog.html',
                controller: 'EditConditionDialogCtrl',
                scope: vm,
                size: 'lg',
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                ConditionService.updateInCondition({
                    jobschedulerId: $scope.schedulerIds.selected,
                    jobsInconditions: [{job: vm._job.path, inconditions: vm._job.inconditions}]
                }).then(function () {
                    ConditionService.updateOutCondition({
                        jobschedulerId: $scope.schedulerIds.selected,
                        jobsOutconditions: [{job: vm._job.path, outconditions: vm._job.outconditions}]
                    }).then(function () {
                        vm.updateJobStreamFolders();
                        if (cb) {
                            cb();
                        }
                    });
                });

            }, function () {
                vm._job = null;
                if (cb) {
                    cb('cancel');
                }
            });
        }

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
                if (res.jobs && res.jobs.length > 0) {
                    for (let i = 0; i < vm.allJobs.length; i++) {
                        if (vm.allJobs[i].path === res.jobs[0].path) {
                            vm.allJobs[i] = mergePermanentAndVolatile(vm.allJobs[i], res.jobs[0]);
                            getFilteredData();
                            break;
                        }
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
                                    if (vm.isConditionTab) {
                                        obj.isOrderJob = false;
                                    }
                                    JobService.get(obj).then(function (res) {
                                        if (res.jobs && res.jobs.length > 0) {
                                            let flag = false;
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
                                if (vm.isConditionTab) {
                                    vm._tempTree = vm.recursiveTreeUpdate(angular.copy(res.folders), vm.tree);
                                    vm.changeWorkflowPath(vm.jobFilters.graphViewDetail.jobStream)
                                } else {
                                    vm.tree = vm.recursiveTreeUpdate(angular.copy(res.folders), vm.tree);
                                    vm.changeStatus(true);
                                }
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
                if (newValue !== 'grid' && newValue !== 'list') {
                    vm.showSearchPanel = false;
                    vm.jobFilter = {};
                }
            }
        });

        vm.resizerHeight = 450;
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

        vm.fileLoading = false;
        vm.fileContentJobStreams = [];
        vm.importJobstreamObj = {};
        vm.checkImportJobstream = {checkbox: false};

        var uploader = $scope.uploader = new FileUploader({
            url: '',
            alias: 'file'
        });

        // CALLBACKS
        uploader.onAfterAddingFile = function (item) {
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
        };

        vm.selectAll = function () {
            if (vm.importJobstreamObj.all) {
                for (let i = 0; i < vm.fileContentJobStreams.length; i++) {
                    for (let x = 0; x < vm.fileContentJobStreams[i].jobs.length; x++) {
                        let flag = true;
                        for (let y = 0; y < vm.importJobstreamObj.jobs.length; y++) {
                            if (vm.fileContentJobStreams[i].jobs[x].job === vm.importJobstreamObj.jobs[y].job) {
                                flag = false;
                                break;
                            }
                        }
                        if (flag) {
                            vm.importJobstreamObj.jobs.push(vm.fileContentJobStreams[i].jobs[x]);
                        }
                    }

                    $("#" + vm.fileContentJobStreams[i].jobStream).prop('checked', true);
                }
            } else {
                for (let i = 0; i < vm.fileContentJobStreams.length; i++) {
                    $("#" + vm.fileContentJobStreams[i].jobStream).prop('checked', false);
                }
                vm.importJobstreamObj.jobs = [];
            }
        };

        vm.checkImportJobstreamFn = function (key, data) {
            if ($("#" + key) && $("#" + key).prop('checked')) {
                for (let i = 0; i < data.jobs.length; i++) {
                    let flag = true;
                    for (let x = 0; x < vm.importJobstreamObj.jobs.length; x++) {
                        if (data.jobs[i].job === vm.importJobstreamObj.jobs[x].job) {
                            flag = false;
                            break;
                        }
                    }
                    if (flag) {
                        vm.importJobstreamObj.jobs.push(data.jobs[i]);
                    }
                }
            } else {
                let len = angular.copy(vm.importJobstreamObj.jobs.length);
                for (let i = 0; i < len; i++) {
                    for (let x = 0; x < vm.importJobstreamObj.jobs.length; x++) {
                        if (key == vm.importJobstreamObj.jobs[x].jobStream) {
                            vm.importJobstreamObj.jobs.splice(x, 1);
                            break;
                        }
                    }
                }
            }
        };

        var watcher8 = $scope.$watchCollection('importJobstreamObj.jobs', function (newNames) {
            if (newNames && newNames.length > 0) {
                let totalCount = 0;
                for (let j = 0; j < vm.fileContentJobStreams.length; j++) {
                    let count = 0;
                    for (let i = 0; i < newNames.length; i++) {
                        if (vm.fileContentJobStreams[j].jobStream == newNames[i].jobStream) {
                            ++count;
                        }
                    }
                    if (count === vm.fileContentJobStreams[j].jobs.length) {
                        $("#" + vm.fileContentJobStreams[j].jobStream).prop('checked', true);
                        ++totalCount;
                    } else {
                        $("#" + vm.fileContentJobStreams[j].jobStream).prop('checked', false);
                    }
                }
                vm.importJobstreamObj.all = vm.fileContentJobStreams.length === totalCount;
            } else {
                vm.checkImportJobstream.checkbox = false;
            }
        });

        function onLoadFile(event) {
            try {
                let data = JSON.parse(event.target.result);
                if (data && data.length > 0) {
                    for (let i = 0; i < data.length; i++) {
                        if (data[i].jobStream && data[i].jobs) {
                            for (let j = 0; j < data[i].jobs.length; j++) {
                                data[i].jobs[j].jobStream = data[i].jobStream;
                            }
                            vm.fileContentJobStreams.push(data[i]);
                        }
                    }
                }
            }catch (e) {

            }
            if (vm.fileContentJobStreams.length === 0) {
                vm.fileLoading = false;
                vm.fileContentJobStreams = undefined;
                toasty.error({
                    title: gettextCatalog.getString("message.notValidJobStreamFile"),
                    timeout: 10000
                });
                uploader.queue[0].remove();
                return;
            }
            let obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            vm.fileLoading = false;
        }

        vm.importJobStream = function () {
            vm.fileLoading = false;
            vm.fileContentJobStreams = [];
            vm.importJobstreamObj = {jobstreams: [], jobs: [], path: '/'};
            vm.checkImportJobstream = {checkbox: false};
            var modalInstance1 = $uibModal.open({
                templateUrl: 'modules/core/template/import-jobstream-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                size: 'lg',
                backdrop: 'static'
            });
            modalInstance1.result.then(function () {
                if (uploader && uploader.queue && uploader.queue.length > 0) {
                    uploader.queue[0].remove();
                }
                let inObj = [], outObj = [];
                if (vm.importJobstreamObj.path === '/') {
                    vm.importJobstreamObj.path = '';
                } else if (vm.importJobstreamObj.path && vm.importJobstreamObj.path.length > 1) {
                    let index = vm.importJobstreamObj.path.lastIndexOf('/');
                    if (index === vm.importJobstreamObj.path.length - 1) {
                        vm.importJobstreamObj.path = vm.importJobstreamObj.path.substring(0, vm.importJobstreamObj.path.length - 1)
                    }
                }

                for (let i = 0; i < vm.importJobstreamObj.jobs.length; i++) {
                    inObj.push({
                        job: vm.importJobstreamObj.path + vm.importJobstreamObj.jobs[i].job,
                        inconditions: vm.importJobstreamObj.jobs[i].inconditions
                    });
                    outObj.push({
                        job: vm.importJobstreamObj.path + vm.importJobstreamObj.jobs[i].job,
                        outconditions: vm.importJobstreamObj.jobs[i].outconditions
                    })
                }
                ConditionService.updateInCondition({
                    jobschedulerId: $scope.schedulerIds.selected,
                    jobsInconditions: inObj
                }).then(function () {
                    ConditionService.updateOutCondition({
                        jobschedulerId: $scope.schedulerIds.selected,
                        jobsOutconditions: outObj
                    }).then(function () {
                        vm.updateJobStreamFolders();
                        if ((inObj.length > 0 && inObj[0].job.match(vm.folderPath)) || (outObj.length > 0 && outObj[0].job.match(vm.folderPath))) {
                            vm.$broadcast('importJobStream');
                        }

                    });
                });
                vm.importJobstreamObj = {};
            }, function () {
                vm.importJobstreamObj = {};
            });
        };

        vm.startConditionResolver = function () {
            vm.resolvingCondition = true;
            ConditionService.startConditionResolver({"jobschedulerId": $scope.schedulerIds.selected}).then(function () {
                setTimeout(function () {
                    vm.resolvingCondition = false;
                }, 700);
            }, function () {
                vm.resolvingCondition = false;
            })
        };

        vm.createJobStream = function () {
            vm.$broadcast('createJobStream');
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
            watcher8();
        });
    }

    JobOverviewCtrl.$inject = ["$scope", "$rootScope", "JobService", "$uibModal", "TaskService", "CoreService", "OrderService", "AuditLogService", "$stateParams", "$filter", "SavedFilter", "$timeout"];

    function JobOverviewCtrl($scope, $rootScope, JobService, $uibModal, TaskService, CoreService, OrderService, AuditLogService, $stateParams, $filter, SavedFilter, $timeout) {
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
                if (vm.jobFilters.filter.state) {
                    obj.states.push(vm.jobFilters.filter.state);
                }
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
                if (res.jobs && res.jobs.length > 0) {
                    value = mergePermanentAndVolatile(res.jobs[0], value);
                }
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
                if (res.jobs && res.jobs.length > 0) {
                    job.jobChains = res.jobs[0].jobChains;
                    job.showJobChains = true;
                    jobs.compactView = vm.jobFilters.isCompact;
                    JobService.get(jobs).then(function (res1) {
                        job = mergePermanentAndVolatile(res1.jobs[0], job);
                        updatePanelHeight();
                    });
                }
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
                runTime: job.runTime,
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
                }, function (res) {
                    if (res === 'ok') {
                        setRunTime(job);
                        vm.reset();
                    }
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
                if (res.jobs && res.jobs.length > 0) {
                    for (let i = 0; i < vm.allJobs.length; i++) {
                        if (vm.allJobs[i].path === res.jobs[0].path) {
                            vm.allJobs[i] = mergePermanentAndVolatile(vm.allJobs[i], res.jobs[0]);
                            break;
                        }
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

    JobWorkflowCtrl.$inject = ["$scope", "$rootScope", "$uibModal", "CoreService", "ConditionService", "AuditLogService", "gettextCatalog", "$timeout", "toasty", "orderByFilter", "FileSaver", "$filter", "DailyPlanService", "JobService"];

    function JobWorkflowCtrl($scope, $rootScope, $uibModal, CoreService, ConditionService, AuditLogService, gettextCatalog, $timeout, toasty, orderBy, FileSaver, $filter, DailyPlanService, JobService) {
        const vm = $scope;
        vm.jobFilters = CoreService.getConditionTab();
        vm.configXml = './mxgraph/config/diagrameditor.xml';
        vm.isJobStreamLoaded = false;
        vm.editor = {};
        vm.jobs = [];

        vm.flag = false;
        vm.isUpdated = true;
        vm.eventNodes = [];
        vm.jobStreamList = [];
        vm.tree_handler = {};
        vm.selectedSession = {};
        vm.selectedJobstreamStarter = {};
        let isInitiate = true, timer = null, ht = 0, maxScrollHt = 0;

        vm.getSessions = function () {
            if(vm.jobStreamList.length ===0){
                return;
            }
            if (!vm.fromDate) {
                vm.fromDate = new Date().getTime();
            }
            if (!vm.toDate) {
                vm.toDate = new Date().getTime();
            }
            let from = new Date(vm.fromDate).setHours(0, 0, 0, 0);
            let to = new Date(vm.toDate).setHours(23, 59, 59, 59);
            from = moment.utc(from);
            to = moment.utc(to);
            ConditionService.getSessions({
                jobschedulerId: $scope.schedulerIds.selected,
                jobStreamId: vm.selectedJobstreamStarter.id ? vm.selectedJobstreamStarter.id : vm.jobStreamList[0].id,
                dateFrom: from,
                dateTo: to
            }).then(function (res) {
                vm.sessions = res.jobstreamSessions;
                if (vm.sessions && vm.sessions.length > 0) {
                    vm.selectedSession = vm.sessions[vm.sessions.length - 1];
                } else {
                    vm.selectedSession = {};
                }
                vm.getEvents(null);
            }, function (err) {

            })
        };

        vm.selectSession = function(session){
            vm.selectedSession = session;
            vm.loadHistory()
        };

        vm.getJobStreams = function () {
            let path = vm.folderPath;
            if (path.substring(0, 1) !== '/') {
                path = '/' + path;
            }
            ConditionService.getJobStreams({
                jobschedulerId: $scope.schedulerIds.selected,
                folder: path
            }).then(function (res) {
                vm.jobStreamList = res.jobstreams;
                if (vm.jobStreamList && vm.jobStreamList.length > 0) {
                    if (!vm.selectedJobStream) {
                        vm.selectedJobStream = vm.jobStreamList[0].jobStream;
                    }
                    vm.getSessions();
                }
                if (vm.allJobs && vm.allJobs.length > 0) {
                    init();
                } else {
                    vm.isJobStreamLoaded = true;
                }
            }, function (err) {

            })
        };
        vm.getJobStreams();

        function checkToolbarWidth() {
            let tbWidth = $('#toolbar').width();
            if (tbWidth > 0) {
                if (tbWidth < 660) {
                    $('.toolBtn').hide();
                    $('#outlineContainer').css({'width': '130px', 'height': '120px'});
                    if (tbWidth < 450 && vm.firstClick) {
                        vm.firstClick = false;
                        $('.sidebar-close').click();
                    }
                } else {
                    $('.toolBtn').show();
                    $('#outlineContainer').css({'width': '170px', 'height': '150px'});
                }
            } else {
                timer = $timeout(function () {
                    checkToolbarWidth();
                }, 100);
            }
        }

        function init() {
            if (sessionStorage.preferences) {
                vm.preferences = JSON.parse(sessionStorage.preferences) || {};
            }
            createEditor();

            let top = Math.round($('.scroll-y').position().top + 85);
            ht = 'calc(100vh - ' + top + 'px)';
            $('.graph-container').css({'height': ht, 'scroll-top': '0'});

            let dom = $('#graph');
            dom.css({opacity: 1});
            dom.slimscroll({height: ht});
            dom.on('drop', function (event) {
                vm.dropTarget = window.selectedJob;
                if (event.target.tagName && event.target.tagName.toLowerCase() === 'svg') {
                    createJobNode(vm.dropTarget, event, 'job');
                } else if (event.target.tagName && event.target.tagName.toLowerCase() === 'div') {
                    let type, className = '';
                    if (event.target.className && (event.target.className.match(/job/) || event.target.className.match(/event1/) || event.target.className.match(/in-condition/))) {
                        className = event.target.className;
                    } else if (event.target.childElementCount > 0) {
                        className = event.target.childNodes[0].className;
                    }
                    type = className.match(/event1/) ? 'event' : className.match(/in-condition/) ? 'in-condition' : className.match(/job/) ? 'job' : null;
                    if (type) {
                        createJobNode(vm.dropTarget, event, type, className);
                    }
                }
                event.preventDefault();
            });
            $('#toolbarContainer').css({'max-height': 'calc(100vh - ' + (top - 42) + 'px)'});
            const panel = $('.property-panel');
            $('.sidebar-open', panel).click(function () {
                $('.sidebar').css({'width': '300px', opacity: 1});
                $('.sidebar-open').css('right', '-20px');
                if (window.innerWidth > 1024) {
                    $('#outlineContainer').animate({'right': '312px'}, 'fast', 'linear');
                    $('.graph-container').animate({'margin-right': '300px'}, 'fast', 'linear');
                    $('#toolbar').animate({'margin-right': '300px'}, 'fast', 'linear');
                    $('.scrolltop-btn').css('right', '340px');
                    $('.scrollBottom-btn').css('right', '340px');
                } else {
                    $('#outlineContainer').animate({'right': '13px', 'z-index': 0}, 'fast', 'linear');
                    $('.graph-container').animate({'margin-right': '0'}, 'fast', 'linear');
                    $('#toolbar').animate({'margin-right': '0'}, 'fast', 'linear');
                }
                $('.sidebar-close').animate({right: '300px'}, 'fast', 'linear', function () {
                    checkToolbarWidth();
                });
            });

            $('.sidebar-close', panel).click(function () {
                $('.sidebar-open').css('right', '0');
                $('.sidebar').css({'width': '0', opacity: 0});
                $('#outlineContainer').animate({'right': '14px'}, 'fast', 'linear');
                $('.graph-container').animate({'margin-right': '0'}, 'fast', 'linear');
                $('#toolbar').animate({'margin-right': '0'}, 'fast', 'linear');
                $('.sidebar-close').css('right', '-20px');
                $('.scrolltop-btn').css('right', '44px');
                $('.scrollBottom-btn').css('right', '44px');
            });

            $('.graph-container').scroll(function () {
                if (isInitiate && $(this).scrollTop() !== 0) {
                    $(this).scrollTop(0);
                }
                if ($(this).scrollTop() > 10) {
                    $('.scrollBottom-btn').hide();
                    $('.scrolltop-btn').show();
                } else {
                    $('.scrollBottom-btn').show();
                    $('.scrolltop-btn').hide();
                }
                isInitiate = false;
            });

            $(window).resize(function () {
                checkToolbarWidth();
                maxScrollHt = $('.graph-container')[0] ? $('.graph-container')[0].scrollHeight : 0;
            });

            setTimeout(function () {
                $('#outlineContainer').css({opacity: 1});
                if (window.innerWidth > 1024) {
                    vm.firstClick = true;
                    $('.sidebar-open').click();
                } else {
                    checkToolbarWidth();
                }
            }, 100);
            recursivelyConnectJobs(false, false);

            /**
             * Changes the zoom on mouseWheel events
             */
            dom.bind('mousewheel DOMMouseScroll', function (event) {
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
                        if (bounds.y < -0.05 && bounds.height > dom.height()) {
                            vm.editor.graph.center(true, true, 0.5, -0.02);
                        }
                    }
                }
            });
        }

        let isScrollToTop = true;
        vm.scrollTop = function () {
            isScrollToTop = true;
            $('#graph').slimscroll({height: ht});
            $('.graph-container').animate({'scroll-top': '0'}, 'fast');
        };
        vm.scrollBottom = function () {
            if (isScrollToTop) {
                isScrollToTop = false;
                let dom = $('#graph');
                let _dom = $('.graph-container');
                if (maxScrollHt == 0) {
                    maxScrollHt = _dom[0].scrollHeight;
                }
                let _ht = $('#history-panel').height() || 250;
                dom.slimscroll({height: (dom.height() - _ht) + 'px'});
                _dom.animate({'scroll-top': (maxScrollHt - _dom.height()) + 'px'}, 'fast', 'linear');
            } else {
                vm.scrollTop();
            }
        };

        function recursivelyConnectJobs(reload, checkScroll, cb) {
            let tempJobs;
            if (vm.jobs) {
                tempJobs = angular.copy(vm.jobs);
            }
            $('[data-toggle="tooltip"]').tooltip('dispose');
            if (vm.jobFilters.graphViewDetail.tab === 'reference') {
                vm.jobFilters.graphViewDetail.tab = 'jobStream';
            }

            let jobPaths = [];
            angular.forEach(vm.allJobs, function (job) {
                jobPaths.push({job: job.path});
            });
            if (jobPaths.length > 0 && vm.jobStreamList.length > 0) {
                ConditionService.inCondition({
                    jobschedulerId: $scope.schedulerIds.selected,
                    jobs: jobPaths
                }).then(function (res) {
                    ConditionService.outCondition({
                        jobschedulerId: $scope.schedulerIds.selected,
                        jobs: jobPaths
                    }).then(function (result) {
                        vm.workflows = [];
                        vm._allJobs = angular.copy(vm.allJobs);
                        for (let i = 0; i < vm.allJobs.length; i++) {
                            vm._allJobs[i].path1 = vm._allJobs[i].path.substring(0, vm._allJobs[i].path.lastIndexOf('/')) || '/';
                        }
                        vm._allJobs = orderBy(vm._allJobs, 'path1', false);

                        let mergeData = _.merge(res.jobsInconditions, result.jobsOutconditions);
                        let len = mergeData.length;

                        for (let i = 0; i < len; i++) {
                            let wf = (mergeData[i].inconditions.length > 0) ? mergeData[i].inconditions[0].jobStream : (mergeData[i].outconditions.length > 0) ? mergeData[i].outconditions[0].jobStream : '';
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
                                    jobStream: wf,
                                    path: _job.path1,
                                    jobs: [_job]
                                };
                                let _tempWorkflow;
                                let _conditions = [];
                                for (let i = 0; i < vm.workflows.length; i++) {
                                    if (vm.workflows[i].jobStream === x.jobStream) {
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

                        vm.isJobStreamLoaded = true;
                        vm.isUpdated = true;
                        let scrollValue = {scrollTop: 0, scrollLeft: 0};
                        if (checkScroll) {
                            let element = document.getElementById("graph");
                            scrollValue.scrollTop = element.scrollTop;
                            scrollValue.scrollLeft = element.scrollLeft;
                            scrollValue.scale = vm.editor.graph.getView().getScale();
                        }
                        if (reload) {
                            vm.editor.graph.removeCells(vm.editor.graph.getChildVertices(vm.editor.graph.getDefaultParent()));
                        }

                        if (!vm.selectedJobStream) {
                            let wf = vm.workflows[0];
                            if (vm.jobFilters.graphViewDetail.jobStream && vm.jobFilters.graphViewDetail.jobStream !== 'ALL') {
                                for (let x = 0; x < vm.workflows.length; x++) {
                                    if (vm.jobFilters.graphViewDetail.jobStream === vm.workflows[x].jobStream) {
                                        wf = vm.workflows[x];
                                        break;
                                    }
                                }
                            }
                            if (wf) {
                                vm.selectedJobStream = wf.jobStream;
                                createWorkflowDiagram(wf.jobs, !reload, scrollValue, tempJobs);
                            }
                        } else {
                            let _jobs = [];
                            let _findWF = false;
                            for (let x = 0; x < vm.workflows.length; x++) {
                                if (vm.selectedJobStream === 'ALL') {
                                    _jobs = _jobs.concat(vm.workflows[x].jobs);
                                    _findWF = true;
                                    break;
                                } else if (vm.selectedJobStream === vm.workflows[x].jobStream) {
                                    createWorkflowDiagram(vm.workflows[x].jobs, !reload, scrollValue, tempJobs);
                                    _findWF = true;
                                    break;
                                }
                            }
                            if (!_findWF && vm.workflows.length > 0) {
                                vm.selectedJobStream = vm.workflows[0].jobStream;
                                createWorkflowDiagram(vm.workflows[0].jobs, !reload, scrollValue, tempJobs);
                            }
                            if (_jobs.length > 0) {
                                createWorkflowDiagram(_jobs, !reload, scrollValue, tempJobs);
                            }
                        }
                        if (vm.selectedJobStream && vm.workflows.length === 0) {
                            vm.selectedJobStream = null;
                            vm.flag = false;
                        }
                        if (vm.selectedJobStream && vm.selectedJobStream !== 'ALL') {
                            vm.loadHistory();
                        }

                        vm.getEvents(null);
                        if (cb) {
                            cb();
                        }
                        if (vm.workflows.length === 0) {
                            $('[data-toggle="tooltip"]').tooltip();
                        }
                    }, function () {
                        vm.isJobStreamLoaded = true;
                        if (cb) {
                            cb();
                        }
                    });
                }, function () {
                    vm.isJobStreamLoaded = true;
                    if (cb) {
                        cb();
                    }
                });
            } else {
                vm.isJobStreamLoaded = true;
                if (cb) {
                    cb();
                }
            }
        }

        function createJobNode(job, event, type, className) {
            let objJob = {};
            for (let i = 0; i < vm.allJobs.length; i++) {
                if (vm.allJobs[i].path === job) {
                    objJob = vm.allJobs[i];
                    break;
                }
            }
            if (!className) {
                const graph = vm.editor.graph;
                let name = job.substring(job.lastIndexOf('/'));
                let _node = getCellNode('Job', name, job, '');
                _node.setAttribute('status', '');
                let style = 'job';
                let v1 = graph.insertVertex(graph.getDefaultParent(), null, _node, event.offsetX * .3, event.offsetY, 180, 50, style);

                vm.editConditions(objJob, vm._jobStream.jobStream || vm.selectedJobStream, function (res) {
                    if (res) {
                        graph.removeCells([v1]);
                    } else {
                        recursivelyConnectJobs(true, true, function () {
                            vm._jobStream = {};
                            for (let i = 0; i < vm.workflows.length; i++) {
                                if (vm.selectedJobStream === vm.workflows[i].jobStream) {
                                    if (vm.workflows[i].jobs.length === 1) {
                                        vm.actual();
                                    }
                                    break;
                                }
                            }
                        });
                    }
                });

            } else {
                if (vm.selectedJobStream !== 'ALL') {
                    if (type === 'job') {
                        addJobToAnotherJob(objJob, className);
                    } else {
                        addJobWithIncondition(objJob, className);
                    }
                }
            }
        }

        function addJobToAnotherJob(job, className) {
            const graph = vm.editor.graph;
            let ids = className.split(' '), dropTarget = null;
            for (let i = 0; i < ids.length; i++) {
                if (parseInt(ids[i])) {
                    let cell = graph.getModel().getCell(ids[i]);
                    let path = cell.getAttribute('actual');
                    for (let i = 0; i < vm.allJobs.length; i++) {
                        if (vm.allJobs[i].path === path) {
                            dropTarget = vm.allJobs[i];
                            break;
                        }
                    }
                    break;
                }
            }
            if (dropTarget) {
                for (let i = 0; i < dropTarget.outconditions.length; i++) {
                    if (dropTarget.outconditions[i].conditionExpression.expression.match(/rc:0/)) {
                        let str = '';
                        if (dropTarget.outconditions[i].outconditionEvents.length > 0) {
                            for (let j = 0; j < dropTarget.outconditions[i].outconditionEvents.length; j++) {
                                if (dropTarget.outconditions[i].outconditionEvents[j].command === 'create') {
                                    let exp = dropTarget.outconditions[i].outconditionEvents[j].event;
                                    if (dropTarget.outconditions[i].outconditionEvents[j].globalEvent) {
                                        exp = 'global:' + dropTarget.outconditions[i].outconditionEvents[j].event;
                                    }
                                    str = str + exp;
                                    if (dropTarget.outconditions[i].outconditionEvents.length - 1 !== j) {
                                        str = str + ' or '
                                    }
                                }
                            }
                            if (str.length > 3 && str.lastIndexOf('or ') === str.length - 3) {
                                str = str.substring(0, str.length - 4);
                            }
                        }
                        if (str) {
                            addJobWithIncondition(job, className, str);
                        }
                        break;
                    }
                }
            }
        }

        function addJobWithIncondition(job, className, str) {
            let dropTarget, commands;
            if (!str) {
                const graph = vm.editor.graph;
                let ids = className.split(' ');
                for (let i = 0; i < ids.length; i++) {
                    if (parseInt(ids[i])) {
                        dropTarget = graph.getModel().getCell(ids[i]);
                        commands = dropTarget.getAttribute('commands');
                        break;
                    }
                }
            }
            let exp = '';
            if (dropTarget) {
                if (dropTarget.getAttribute('globalEvent') === 'true') {
                    exp = 'global:';
                }
                exp = exp + dropTarget.getAttribute('actual');
            } else {
                exp = str;
            }
            let inObj = [{
                "conditionExpression": {
                    "expression": exp
                },
                "inconditionCommands": commands ? JSON.parse(commands) : [
                    {
                        "command": "startjob",
                        "commandParam": "now"
                    }
                ],
                "jobStream": vm.selectedJobStream,
                "markExpression": true,
                "skipOutCondition": false
            }];

            let evtName = getJobName(job.name);

            let outObj = [{
                "conditionExpression": {
                    "expression": 'rc:0'
                },
                "outconditionEvents": [
                    {
                        "event": evtName,
                        "command": 'create'
                    }
                ],
                "jobStream": vm.selectedJobStream,
                "markExpression": true,
                "skipOutCondition": false
            }];

            let flag = false;
            ConditionService.updateInCondition({
                jobschedulerId: $scope.schedulerIds.selected,
                jobsInconditions: [{job: job.path, inconditions: inObj}]
            }).then(function () {
                if (flag) {
                    flag = false;
                    recursivelyConnectJobs(true, true);
                } else {
                    flag = true;
                }
            });

            ConditionService.updateOutCondition({
                jobschedulerId: $scope.schedulerIds.selected,
                jobsOutconditions: [{job: job.path, outconditions: outObj}]
            }).then(function () {
                if (flag) {
                    flag = false;
                    recursivelyConnectJobs(true, true);
                } else {
                    flag = true;
                }
            });
        }

        function getJobName(name) {
            let evtName = name;
            if (/\(([^)]+)\)/i.test(name)) {
                evtName = evtName.replace('(', '_').replace(')', '_');
            }
            if (name.match(/./)) {
                evtName = evtName.replace('.', '_');
            }
            if (name.match(/#/)) {
                evtName = evtName.replace('#', '_');
            }
            return evtName;
        }

        function createJobVertex(job, graph) {
            let _node = getCellNode('Job', job.name, job.path, '');
            _node.setAttribute('status', job.state._text);
            let nextPeriod = false;
            if (job.inconditions && !job.nextStartTime) {
                for (let i = 0; i < job.inconditions.length; i++) {
                    if (job.inconditions[i].nextPeriod) {
                        _node.setAttribute('nextPeriod', job.inconditions[i].nextPeriod);
                        nextPeriod = true;
                        break;
                    }
                }
            } else {
                _node.setAttribute('nextStartTime', job.nextStartTime);
            }
            let enqueTask;
            if (job.taskQueue && job.taskQueue.length > 0) {
                enqueTask = job.taskQueue[job.taskQueue.length - 1];
                _node.setAttribute('enquePeriod', enqueTask.enqueued);
            }
            let style = 'job';
            style += ';strokeColor=' + (CoreService.getColorBySeverity(job.state.severity) || '#999');
            if (nextPeriod) {
                style += ';fillColor=none';
            }
            let v1 = createVertex(graph.getDefaultParent(), _node, job.name, style);
            let barColor = job.state._text === 'RUNNING' ? 'green' : job.state._text === 'PENDING' ? 'yellow' : job.state._text === undefined ? 'grey' : 'red';
            if (barColor !== 'red' && enqueTask) {
                barColor = 'orange'
            }
            addOverlays(graph, v1, barColor);
            job.jId = v1.id;
            return v1;
        }

        function createInCond(job, cond, graph, v1, mapObj) {
            let _label = parseExpression(cond.conditionExpression);
            let _node = getCellNode('InCondition', _label, cond.conditionExpression.expression, cond.jobStream);
            _node.setAttribute('isConsumed', cond.consumed);
            _node.setAttribute('_id', cond.id);
            _node.setAttribute('job', job.path);
            _node.setAttribute('outconditions', JSON.stringify(cond.outconditions));
            _node.setAttribute('markExpression', cond.markExpression);
            _node.setAttribute('skipOutCondition', cond.skipOutCondition);
            if (cond.inconditionCommands) {
                _node.setAttribute('commands', JSON.stringify(cond.inconditionCommands));
            }
            let style = 'condition';
            if (cond.consumed) {
                style += ';fillColor=none';
            }
            if (cond.conditionExpression.value) {
                style += ';strokeColor=green;';
            }

            let conditionVertex = createVertex(graph.getDefaultParent(), _node, cond.conditionExpression.expression, style);

            addOverlays(graph, conditionVertex, cond.conditionExpression.value ? 'green' : '');
            for (let m = 0; m < cond.outconditions.length; m++) {
                if (cond.outconditions[m].jobStream !== cond.jobStream) {
                    addReferenceIcon(graph, conditionVertex);
                } else {
                    for (let z = 0; z < cond.outconditions[m].jobs.length; z++) {
                        if (cond.outconditions[m].jobs[z].job !== job.path) {
                            let _job = mapObj.get(cond.outconditions[m].jobs[z].job);
                            if (_job) {
                                let v2 = null;
                                if (_job.jId) {
                                    v2 = graph.getModel().getCell(_job.jId);
                                } else {
                                    v2 = createJobVertex(_job, graph);
                                    createConnection(_job, graph, v2, mapObj);
                                }
                                if (_job.isExpanded || (!vm.jobFilters.graphViewDetail.isWorkflowCompact && _job.isExpanded === undefined)) {
                                    graph.insertEdge(graph.getDefaultParent(), null, getCellNode('Connection', '', '', ''), graph.getModel().getCell(_job.boxId), conditionVertex);
                                } else {
                                    graph.insertEdge(graph.getDefaultParent(), null, getCellNode('Connection', '', '', ''), v2, conditionVertex);
                                }
                            }
                        }
                    }
                }
            }
            graph.insertEdge(graph.getDefaultParent(), null, getCellNode('Connection', '', '', ''), conditionVertex, v1);
        }

        function createOutCond(job, cond, graph, v1, out, mapObj) {
            let expand = job.isExpanded || (!vm.jobFilters.graphViewDetail.isWorkflowCompact && job.isExpanded === undefined);
            let events = [], conditionVertex = null;
            if (expand) {
                if (!job.inConditionProceed) {
                    for (let x = 0; x < job.inconditions.length; x++) {
                        createInCond(job, job.inconditions[x], graph, v1, mapObj);
                    }
                }
                let _label = parseExpression(cond.conditionExpression);
                let _node = getCellNode('OutCondition', _label, cond.conditionExpression.expression, cond.jobStream);
                _node.setAttribute('_id', cond.id);
                _node.setAttribute('job', job.path);
                _node.setAttribute('events', JSON.stringify(cond.outconditionEvents));
                _node.setAttribute('inconditions', JSON.stringify(cond.inconditions));
                let style = 'condition2';
                if (cond.conditionExpression.value) {
                    style += ';strokeColor=green;';
                }
                conditionVertex = createVertex(graph.getDefaultParent(), _node, cond.conditionExpression.expression, style);
                addOverlays(graph, conditionVertex, cond.conditionExpression.value ? 'green' : '');
                graph.insertEdge(graph.getDefaultParent(), null, getCellNode('Connection', '', '', ''), v1, conditionVertex, '');

                if ((vm.preferences.jobStreamEvents && cond.isExpanded === undefined) || cond.isExpanded) {
                    if (cond.outconditionEvents.length > 0) {
                        for (let z = 0; z < cond.outconditionEvents.length; z++) {
                            if (cond.outconditionEvents[z].command === 'create') {
                                let label = cond.outconditionEvents[z].event;
                                if (cond.outconditionEvents[z].globalEvent) {
                                    label = gettextCatalog.getString('label.global') + ':' + cond.outconditionEvents[z].event;
                                }
                                let _node = getCellNode('Event', label, cond.outconditionEvents[z].event, cond.jobStream);
                                let flg = cond.outconditionEvents[z].exists ? true : cond.outconditionEvents[z].existsInJobStream;
                                _node.setAttribute('isExist', flg);
                                _node.setAttribute('globalEvent', cond.outconditionEvents[z].globalEvent);
                                _node.setAttribute('job', job.path);
                                _node.setAttribute('outconditionId', cond.id);
                                let style = 'event';
                                if (!cond.outconditionEvents[z].existsInJobStream && cond.outconditionEvents[z].exists) {
                                    style += ';dashed=1';
                                }
                                if (!cond.outconditionEvents[z].exists && !cond.outconditionEvents[z].existsInJobStream) {
                                    style += ';fillColor=none';
                                }
                                let e1 = createVertex(graph.getDefaultParent(), _node, cond.outconditionEvents[z].event, style);
                                graph.insertEdge(graph.getDefaultParent(), null, getCellNode('Connection', '', '', ''), conditionVertex, e1);
                                events.push(e1);
                            }
                        }
                    }
                } else {
                    graph.insertEdge(graph.getDefaultParent(), null, getCellNode('Connection', '', '', ''), conditionVertex, out);
                }
            }

            for (let n = 0; n < cond.inconditions.length; n++) {
                if (cond.jobStream !== cond.inconditions[n].jobStream) {
                    if (conditionVertex)
                        addReferenceIcon(graph, conditionVertex);
                } else {
                    for (let p = 0; p < cond.inconditions[n].jobs.length; p++) {
                        if (cond.inconditions[n].jobs[p].job !== job.path) {
                            let _job = mapObj.get(cond.inconditions[n].jobs[p].job);
                            if (_job) {
                                let v2 = null, flag = false;
                                if (_job && _job.jId) {
                                    v2 = graph.getModel().getCell(_job.jId);
                                } else {
                                    v2 = createJobVertex(_job, graph);
                                    flag = true;
                                }
                                if (!expand && graph.getEdgesBetween(v1, v2).length === 0) {
                                    if (!(_job.isExpanded || (!vm.jobFilters.graphViewDetail.isWorkflowCompact && _job.isExpanded === undefined))) {
                                        graph.insertEdge(graph.getDefaultParent(), null, getCellNode('Connection', '', '', ''), v1, v2);
                                    }
                                } else {
                                    if (!(_job.isExpanded || (!vm.jobFilters.graphViewDetail.isWorkflowCompact && _job.isExpanded === undefined))) {
                                        graph.insertEdge(graph.getDefaultParent(), null, getCellNode('Connection', '', '', ''), out, v2);
                                    }
                                }
                                if (flag) {
                                    createConnection(_job, graph, v2, mapObj);
                                }
                                if (expand && out && (vm.preferences.jobStreamEvents || cond.isExpanded)) {
                                    for (let z = 0; z < _job.inconditions.length; z++) {
                                        for (let b = 0; b < events.length; b++) {
                                            if (matchExpression(_job.inconditions[z].conditionExpression.jobStreamEvents, events[b].getAttribute('actual'))) {
                                                if (graph.getEdgesBetween(events[b], out).length === 0) {
                                                    graph.insertEdge(graph.getDefaultParent(), null, getCellNode('Connection', '', '', ''), events[b], out);
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
        }

        function createConnection(job, graph, v1, mapObj) {
            let out = null, len = job.outconditions.length;
            if (job.isExpanded || (!vm.jobFilters.graphViewDetail.isWorkflowCompact && job.isExpanded === undefined)) {
                if (len > 0) {
                    out = createVertex(graph.getDefaultParent(), getCellNode('Box', job.name, job.path, ''), '', 'circle');
                    job.boxId = out.id;
                } else {
                    for (let x = 0; x < job.inconditions.length; x++) {
                        createInCond(job, job.inconditions[x], graph, v1, mapObj);
                    }
                }
            }

            let flag = true;
            for (let n = 0; n < len; n++) {
                createOutCond(job, job.outconditions[n], graph, v1, out, mapObj);
                job.inConditionProceed = true;
                if (out) {
                    if (job.outconditions[n].inconditions.length > 0) {
                        flag = false;
                        let flg = false;
                        for (let x = 0; x < job.outconditions[n].inconditions.length; x++) {
                            if (job.outconditions[n].jobStream === job.outconditions[n].inconditions[x].jobStream) {
                                if (job.outconditions[n].inconditions[x].jobs.length === 1 && job.path === job.outconditions[n].inconditions[x].jobs[0].job) {
                                    graph.removeCells([out], true);
                                }
                                flg = true;
                                break;
                            }
                        }
                        if (!flg) {
                            flag = true;
                        }
                    }
                }
            }
            if (flag) {
                graph.removeCells([out], true);
            }
        }

        let interval;

        function createWorkflowDiagram(jobs, reload, scrollValue, tempJobs) {
            const graph = vm.editor.graph;
            graph.getModel().beginUpdate();
            if (!jobs) {
                return;
            }
            let mapObj = new Map();
            for(let i=0; i < vm.jobStreamList.length;i++){
                if(vm.jobStreamList[i].jobStream === vm.selectedJobStream) {
                    vm.selectedJobstreamStarter = vm.jobStreamList[i];
                    break;
                }
            }
            try {
                let starter = vm.selectedJobstreamStarter.jobstreamStarters[0];
                let _node = getCellNode('Jobstream', starter.title || ' -', '', '');
                _node.setAttribute('id', vm.selectedJobstreamStarter.id);
                _node.setAttribute('starter', JSON.stringify(starter));
                let js1 = graph.insertVertex(graph.getDefaultParent(), null, _node, 0, 0, 150, 50, 'order');
                for (let i = 0; i < jobs.length; i++) {
                    if (!jobs[i].state) {
                        jobs[i].state = {};
                    }
                    if (tempJobs) {
                        mergeJobsConditionsState(jobs[i], tempJobs);
                    }
                    delete jobs[i]['jId'];
                    delete jobs[i]['boxId'];
                    delete jobs[i]['inConditionProceed'];
                    mapObj.set(jobs[i].path, jobs[i]);
                }
                for (let i = 0; i < jobs.length; i++) {
                    let v1 = null;
                    if (!jobs[i].jId) {
                        v1 = createJobVertex(jobs[i], graph);
                        createConnection(jobs[i], graph, v1, mapObj);
                    }
                    for (let j = 0; j < starter.jobs.length; j++) {
                        if (jobs[i].path === starter.jobs[j].job) {
                            graph.insertEdge(graph.getDefaultParent(), null, getCellNode('Connection', '', '', ''), js1, v1);
                            break;
                        }
                    }
                }

/*                if (v1 && js1 && !isConnected) {
                    isConnected = true;
                    let inComingEdges = graph.getIncomingEdges(v1);
                    if (inComingEdges && inComingEdges.length > 0) {
                        for (let x = 0; x < inComingEdges.length; x++) {
                            graph.insertEdge(graph.getDefaultParent(), null, getCellNode('Connection', '', '', ''), js1, inComingEdges[x].source);
                        }
                    } else {
                        graph.insertEdge(graph.getDefaultParent(), null, getCellNode('Connection', '', '', ''), js1, v1);
                    }
                }*/

                vm.jobs = jobs;
            } catch (e) {
                console.error(e)
            } finally {
                // Updates the display
                graph.getModel().endUpdate();
                executeLayout(graph);
            }
            if (reload) {
                makeCenter();
            }
            if (scrollValue && scrollValue.scrollTop) {
                let element = document.getElementById("graph");
                element.scrollTop = scrollValue.scrollTop;
                element.scrollLeft = scrollValue.scrollLeft;
                if (scrollValue.scale) {
                    vm.editor.graph.getView().setScale(scrollValue.scale);
                }
            }

            if (vm.workflows && vm.workflows.length) {
                for (let x = 0; x < vm.workflows.length; x++) {
                    for (let j = 0; j < vm.workflows[x].jobs.length; j++) {
                        for (let i = 0; i < vm._allJobs.length; i++) {
                            if (vm.workflows[x].jobs[j].path === vm._allJobs[i].path) {
                                vm._allJobs.splice(i, 1);
                                break;
                            }
                        }
                    }
                }
            }

            vm.expandingInProgress = false;
            setTimeout(function () {
                $('[data-toggle="tooltip"]').tooltip();
                updateWorkflowDiagram(vm.jobs);
                if (vm.jobs && vm.editor)
                    startInterval();
            }, 100);
        }

        function mergeJobsConditionsState(job, _tempJob) {
            if (_tempJob.length > 0) {
                for (let j = 0; j < _tempJob.length; j++) {
                    if (_tempJob[j].path === job.path) {
                        for (let m = 0; m < _tempJob[j].outconditions.length; m++) {
                            if (_tempJob[j].outconditions[m].isExpanded) {
                                for (let n = 0; n < job.outconditions.length; n++) {
                                    job.outconditions[n].isExpanded = true;
                                }
                            }
                        }
                        _tempJob.splice(j, 1);
                        break;
                    }
                }
            }
        }

        function startInterval() {
            if (interval) {
                clearInterval(interval);
            }
            interval = setInterval(function () {
                updateNextStartTime();
            }, 8000);
        }

        function matchExpression(jobStreamEvents, event) {
            let flag = false;
            if (jobStreamEvents) {
                for (let i = 0; i < jobStreamEvents.length; i++) {
                    if (jobStreamEvents[i] === event || jobStreamEvents[i] === 'global:' + event) {
                        flag = true;
                        break;
                    }
                }
            }
            return flag;
        }

        function updateWorkflowDiagram(jobs) {
            if (!jobs || !vm.editor) return;
            if (!vm.editor.graph) return;

            vm.runningTasks = [];
            vm.taskQueue = [];
            for (let j = 0; j < jobs.length; j++) {
                if (jobs[j].runningTasks && jobs[j].runningTasks.length > 0) {
                    angular.forEach(jobs[j].runningTasks, function (value, index) {
                        jobs[j].runningTasks[index].path = jobs[j].path;
                    });
                    vm.runningTasks = vm.runningTasks.concat(jobs[j].runningTasks)
                }
                if (jobs[j].taskQueue && jobs[j].taskQueue.length > 0) {
                    angular.forEach(jobs[j].taskQueue, function (value, index) {
                        jobs[j].taskQueue[index].path = jobs[j].path;
                    });
                    vm.taskQueue = vm.taskQueue.concat(jobs[j].taskQueue)
                }
            }
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
                                const edit1 = new mxCellAttributeChange(
                                    vertices[i], 'nextPeriod', checkNextPeriod(jobs[j]));
                                const edit2 = new mxCellAttributeChange(
                                    vertices[i], 'status', jobs[j].state._text);
                                const edit3 = new mxCellAttributeChange(
                                    vertices[i], 'nextStartTime', jobs[j].nextStartTime);
                                let edit4;
                                if (jobs[j].taskQueue && jobs[j].taskQueue.length > 0) {
                                    let enqueTask = jobs[j].taskQueue[jobs[j].taskQueue.length - 1];
                                    edit4 = new mxCellAttributeChange(
                                        vertices[i], 'enquePeriod', enqueTask.enqueued);
                                } else if (vertices[i].getAttribute('enquePeriod')) {
                                    edit4 = new mxCellAttributeChange(
                                        vertices[i], 'enquePeriod', '');
                                }
                                graph.getModel().execute(edit1);
                                graph.getModel().execute(edit2);
                                graph.getModel().execute(edit3);
                                if (edit4) {
                                    graph.getModel().execute(edit4);
                                }
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

        function checkNextPeriod(job) {
            if (!job.nextStartTime) {
                for (let i = 0; i < job.inconditions.length; i++) {
                    if (job.inconditions[i].nextPeriod) {
                        return job.inconditions[i].nextPeriod;
                    }
                }
            } else {
                return null;
            }
        }

        function updateNextStartTime() {
            if (!vm.editor) return;
            const graph = vm.editor.graph;
            let parent = graph.getDefaultParent();
            graph.getModel().beginUpdate();
            try {
                let vertices = graph.getChildVertices(parent);
                for (let i = 0; i < vertices.length; i++) {
                    if (vertices[i].value.tagName === 'Job') {
                        if (vertices[i].getAttribute('nextStartTime')) {
                            const edit = new mxCellAttributeChange(
                                vertices[i], 'nextStartTime', vertices[i].getAttribute('nextStartTime'));
                            graph.getModel().execute(edit);
                        } else if (vertices[i].getAttribute('nextPeriod')) {
                            const edit2 = new mxCellAttributeChange(
                                vertices[i], 'nextPeriod', vertices[i].getAttribute('nextPeriod'));
                            graph.getModel().execute(edit2);
                        } else if (vertices[i].getAttribute('enquePeriod')) {
                            const edit3 = new mxCellAttributeChange(
                                vertices[i], 'enquePeriod', vertices[i].getAttribute('enquePeriod'));
                            graph.getModel().execute(edit3);
                        }
                    }
                }
            } catch (e) {
                console.error(e)
            } finally {
                // Updates the display
                graph.getModel().endUpdate();
            }
        }

        vm.changeTab = function (tab) {
            vm.jobFilters.graphViewDetail.tab = tab;
        };

        /** -------------------- JobStream Actions ------------------- */

        vm._jobStream = {};
        vm.createJobStream = function () {
            if(!vm._allJobs || vm._allJobs.length===0) {
                vm._allJobs = angular.copy(vm.allJobs);
                for (let i = 0; i < vm.allJobs.length; i++) {
                    vm._allJobs[i].path1 = vm._allJobs[i].path.substring(0, vm._allJobs[i].path.lastIndexOf('/')) || '/';
                }
                vm._allJobs = orderBy(vm._allJobs, 'path1', false);
            }
            vm._jobStream.jobstreamStarters = [{
                title: '',
                jobs: [{job: '', startDelay: 0}],
                state: 'active',
                params: [],
                runTime: {}
            }];
            $scope.isUnique = true;
            let modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/create-job-stream-dialog.html',
                controller: 'DialogCtrl1',
                scope: vm,
                size: 'lg',
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                addJobStream(vm._jobStream);
            }, function () {
                vm._jobStream = {};
            })
        };

        vm.checkJobName = function (job) {
           // console.log(job)
            // console.log(vm._jobStream.starters);
            $scope.isUnique = true;
       /*     for (let i = 0; i < vm._jobStream.starters.length; i++) {
                if (vm._jobStream.starters[i].name === job) {
                    $scope.isUnique = false;
                    break;
                }
            }*/
        };

        vm.openParameterModal = function (starter) {
            vm.starter = starter;
            vm.addParam();
            $('#parameterModal').modal('show');
        };

        vm.addJob = function (starter) {
            if (starter.jobs.length === 0 || (starter.jobs.length > 0 && starter.jobs[starter.jobs.length - 1].job !== '')) {
                starter.jobs.push({job: '', startDelay: 0});
            }
        };
        vm.removeJob = function (index, starter) {
            starter.jobs.splice(index, 1)
        };

        vm.addParam = function () {
            if (vm.starter.params.length === 0 || (vm.starter.params.length > 0 && vm.starter.params[vm.starter.params.length - 1].name !== '')) {
                vm.starter.params.push({name: '', value: ''});
            }
        };
        vm.removeParam = function (index) {
            vm.starter.params.splice(index, 1)
        };

        vm.startJobstream = function (jobStream) {
            let data = JSON.parse(jobStream.cell.getAttribute('starter'));
            ConditionService.startJobStreamStarter({
                jobschedulerId: $scope.schedulerIds.selected,
                jobstreamStarters: [{"jobStreamStarterId": data.jobStreamStarterId}]
            }).then(function (res) {
                console.log(res)
            }, function (err) {

            })
        };

        vm.setRuntimeJobstream = function (jobStream, starter) {
            vm._starter = starter;
            vm.calendars = null;
            if (jobStream) {
                let data = JSON.parse(jobStream.cell.getAttribute('starter'));
                vm.order = {runTime: data.runTime, path: jobStream.cell.getAttribute('label')};
            } else {
                vm.order = {runTime: starter.runTime, path: vm._jobStream.jobStream, isJobStream: true};
            }
            vm.modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/set-run-time-dialog.html',
                controller: 'RuntimeEditorDialogCtrl',
                scope: vm,
                size: 'lg',
                backdrop: 'static',
                windowClass: 'fade-modal'
            });
        };

        vm.$on('Close-Jobstream-Model', function (evt, arg) {
            if (arg === 'ok') {
                vm._starter.runTime = vm.order.runTime;
            }
            vm.modalInstance.close();
        });

        vm.editJobstreamStarter = function (jobStream) {
            vm._jobStream = {editStarter: true, id: jobStream.cell.getAttribute('id'), jobStream: jobStream.cell.getAttribute('label')};
            vm._jobStream.jobstreamStarters = [JSON.parse(jobStream.cell.getAttribute('starter'))];
            let modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/create-job-stream-dialog.html',
                controller: 'DialogCtrl1',
                scope: vm,
                size: 'lg',
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                editStarter(vm._jobStream);
            }, function () {

            })
        };


        function addJobStream(jobStream) {
            let path = vm.folderPath;
            if (path.substring(0, 1) !== '/') {
                path = '/' + path;
            }
            let obj = {
                jobschedulerId: $scope.schedulerIds.selected,
                state: 'active',
                folder: path,
                jobStream: jobStream.jobStream,
                jobstreamStarters: jobStream.jobstreamStarters
            };
            if(vm._jobStream.update){
                obj.id = vm._jobStream.id;
            }
            ConditionService.addJobStream(obj).then(function (res) {
                let outCond = [];
                for(let i =0;i < jobStream.jobstreamStarters[0].jobs.length;i++){
                    if(jobStream.jobstreamStarters[0].jobs[i]){
                        let name = jobStream.jobstreamStarters[0].jobs[i].job.substring(jobStream.jobstreamStarters[0].jobs[i].job.lastIndexOf('/')+1);
                        let evtName = getJobName(name);
                        let outObj = [{
                            "conditionExpression": {
                                "expression": 'rc:0'
                            },
                            "outconditionEvents": [
                                {
                                    "event": evtName,
                                    "command": 'create'
                                }
                            ],
                            "jobStream": jobStream.jobStream,
                            "markExpression": true,
                            "skipOutCondition": false
                        }];
                        outCond.push({job:jobStream.jobstreamStarters[0].jobs[i].job, outconditions: outObj})
                    }
                }

                if(outCond.length>0) {
                    ConditionService.updateOutCondition({
                        jobschedulerId: $scope.schedulerIds.selected,
                        jobsOutconditions: outCond,
                        jobStreamStarterId: res.jobstreamStarters[0].jobStreamStarterId,
                    }).then(function () {
                        if (vm.jobStreamList && vm.jobStreamList.length === 0) {
                            vm.getJobStreams();
                        } else {
                            if (vm._jobStream.update) {
                                for (let i = 0; i < vm.jobStreamList.length; i++) {
                                    if (vm.jobStreamList[i].id === vm._jobStream.id) {
                                        vm.jobStreamList.splice(i, 1);
                                        break;
                                    }
                                }
                            }
                            vm.jobStreamList.push(res);
                            recursivelyConnectJobs(true, true);
                        }
                    });
                }

            }, function (err) {

            })
        }

        function editStarter(jobstream) {
            let obj = {
                jobschedulerId: $scope.schedulerIds.selected,
                jobStream: jobstream.id,
                jobstreamStarters: jobstream.jobstreamStarters,
            };
            ConditionService.editJobStreamStarter(obj).then(function (res) {
                for (let i = 0; i < vm.jobStreamList.length; i++) {
                    if (vm.jobStreamList[i].id === jobstream.id) {
                        vm.jobStreamList.splice(i, 1);
                        break;
                    }
                }
                vm.jobStreamList.push(res);
                recursivelyConnectJobs(true, true);
            }, function (err) {

            })
        }

        vm.changeGraph = function (jobStream) {
            $('[data-toggle="tooltip"]').tooltip('dispose');
            vm._jobStream = {};
            if (jobStream) {
                if (vm.selectedJobStream !== jobStream.jobStream) {
                    vm.selectedJobStream = jobStream.jobStream;
                    vm.editor.graph.removeCells(vm.editor.graph.getChildVertices(vm.editor.graph.getDefaultParent()));
                    for (let x = 0; x < vm.workflows.length; x++) {
                        if (vm.workflows[x].jobStream === jobStream.jobStream) {
                            createWorkflowDiagram(vm.workflows[x].jobs, false, {});
                            break;
                        }
                    }

                    vm.getSessions()
                }
            } else {
                let jobs = [];
                vm.selectedJobStream = 'ALL';
                for (let x = 0; x < vm.workflows.length; x++) {
                    jobs = jobs.concat(vm.workflows[x].jobs)
                }
                vm.editor.graph.removeCells(vm.editor.graph.getChildVertices(vm.editor.graph.getDefaultParent()));
                createWorkflowDiagram(jobs, false, {});
            }
        };

        vm.compactView = function (flag, type) {
            if (!type)
                vm.jobFilters.graphViewDetail.isWorkflowCompact = !flag;
            if (vm.jobs.length > 0) {
                $('[data-toggle="tooltip"]').tooltip('dispose');
                for (let i = 0; i < vm.jobs.length; i++) {
                    vm.jobs[i].isExpanded = type ? flag ? flag : vm.jobs[i].isExpanded : flag;
                    if (type) {
                        for (let j = 0; j < vm.jobs[i].outconditions.length; j++) {
                            vm.jobs[i].outconditions[j].isExpanded = flag;
                        }
                    }
                }
                vm.editor.graph.removeCells(vm.editor.graph.getChildVertices(vm.editor.graph.getDefaultParent()));
                createWorkflowDiagram(vm.jobs, true, {});
            }
        };

        vm.expandOutCond = function (cell) {
            for (let i = 0; i < vm.jobs.length; i++) {
                if (vm.jobs[i].path == cell.getAttribute('job')) {
                    for (let j = 0; j < vm.jobs[i].outconditions.length; j++) {
                        if (vm.jobs[i].outconditions[j].conditionExpression.expression === cell.getAttribute('actual')) {
                            vm.jobs[i].outconditions[j].isExpanded = true;
                            break;
                        }
                    }
                    updateJobs(true);
                    break;
                }
            }
        };

        vm.collapseOutCond = function (cell) {
            for (let i = 0; i < vm.jobs.length; i++) {
                if (vm.jobs[i].path == cell.getAttribute('job')) {
                    for (let j = 0; j < vm.jobs[i].outconditions.length; j++) {
                        if (vm.jobs[i].outconditions[j].conditionExpression.expression === cell.getAttribute('actual')) {
                            vm.jobs[i].outconditions[j].isExpanded = false;
                            break;
                        }
                    }
                    updateJobs(true);
                    break;
                }
            }
        };

        vm.updateWorkflow = function (jobStream) {
            vm._jobStream = angular.copy(jobStream);
            vm._jobStream.update = true;
            let modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/create-job-stream-dialog.html',
                controller: 'DialogCtrl1',
                scope: vm,
                size: 'lg',
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                if (vm.selectedJobStream === jobStream.jobStream) {
                    vm.selectedJobStream = vm._jobStream.jobStream;
                }
                addJobStream(vm._jobStream);
            }, function () {

            })
        };

        vm.removeWorkflow = function (jobStream, index) {
            vm.deleteJobSteam = jobStream.jobStream;
            let modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/confirm-dialog.html',
                controller: 'DialogCtrl1',
                scope: vm,
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                let obj = {
                    jobschedulerId: $scope.schedulerIds.selected,
                    jobStreamId: jobStream.id
                };
                ConditionService.deleteJobStream(obj).then(function () {
                    reset(jobStream);
                });
                vm.deleteJobSteam = undefined;
            }, function () {
                vm.deleteJobSteam = undefined;
            });
        };

        function reset(jobStream) {
            if (jobStream.jobStream === vm.selectedJobStream) {
                vm.selectedJobStream = '';
                if (vm.workflows.length === 0) {
                    vm.flag = false;
                }
                vm.updateJobStreamFolders();
                recursivelyConnectJobs(true, false);
            } else {
                recursivelyConnectJobs(true, true);
            }
        }

        vm.switchGraph = function (condition, job) {
            let wf = vm.workflows[0];
            let p = wf.path === '/' ? '/' : wf.path + '/';
            let path = job.job.substring(0, job.job.lastIndexOf('/')) + '/' + condition.jobStream;
            if (path !== p + vm.selectedJobStream) {
                vm.jobFilters.graphViewDetail.tab = 'jobStream';
                vm.reloadNewWorkflow = condition.jobStream;
                $rootScope.$broadcast('switchPath', {path: job.job.substring(0, job.job.lastIndexOf('/'))});
            } else {
                if (condition.jobStream !== vm.selectedJobStream) {
                    vm.jobFilters.graphViewDetail.tab = 'jobStream';
                    vm.changeGraph(condition.jobStream);
                }
            }
        };

        vm.treeHandler = function (data) {
            if (!data.folders || data.type) {
                let p = data.path.substring(0, data.path.lastIndexOf('/')) || '/';
                if (data.path !== p + vm.selectedJobStream) {
                    if (data.type && data.folders) {
                        vm.reloadNewWorkflow = {workflow: data};
                    } else {
                        vm.reloadNewWorkflow = data;
                    }
                    $rootScope.$broadcast('switchPath', {path: p});
                } else {
                    if (!data.type) {
                        vm.navigateToEvent(data.evt);
                    }
                }
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
            let expArr = [], resultArr = [], val = [];

            if (conditions.expression) {
                let _exp = conditions.expression.replace(/\(\s+/g, '(').replace(/\s+\)/g, ')');
                _exp = _exp.trim();
                let ex = _exp.split(/\s+(and not|and|not|or)\s+/);
                for (let i = 0; i < ex.length; i++) {
                    if (ex[i].match('and not') || ex[i].match('or not')) {
                        expArr = expArr.concat(ex[i].split(' '))
                    } else if (ex[i] && ex[i] != '(' && ex[i] != ')') {
                        expArr.push(ex[i])
                    }
                }
                if(conditions.validatedExpression) {
                    let _valExp = conditions.validatedExpression.replace(/\(\s+/g, '(').replace(/\s+\)/g, ')');
                    _valExp = _valExp.trim();
                    val = _valExp.split(/\s+(\(|\)|&&|!|\|\|)\s+/);
                    for (let i = 0; i < val.length; i++) {
                        if (val[i].match('! ')) {
                            resultArr = resultArr.concat(val[i].split(' '))
                        } else if (val[i] && val[i] != '(' && val[i] != ')') {
                            resultArr.push(val[i]);
                        }
                    }
                }
            }

            let _label = '';
            for (let x = 0; x < expArr.length; x++) {
                if (expArr[x]) {
                    if (resultArr[x] && resultArr[x].trim().match('true')) {
                        _label = _label + '<span class="text-check">' + expArr[x].trim() + '</span> ';
                    } else {
                        _label = _label + expArr[x].trim() + ' ';
                    }
                }
            }
            return _label;
        }

        vm.openModel = function (cell) {
            let label = cell.getAttribute('actual');
            vm._expression = {};
            vm._expression.label = cell.value.tagName;
            vm._expression.expression = label;
            vm._expression.commands = [];
            vm._expression.events = [];
            vm._expression.job = cell.getAttribute('job');
            if (vm._expression.label === 'InCondition') {
                let commands = cell.getAttribute('commands');
                vm._expression.commands = JSON.parse(commands) || [];
                vm._expression.markExpression = cell.getAttribute('markExpression') == 'true';
                vm._expression.skipOutCondition = cell.getAttribute('skipOutCondition') == 'true';
            } else if (vm._expression.label === 'OutCondition') {
                let events = cell.getAttribute('events');
                vm._expression.events = JSON.parse(events) || [];
            }

            let modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/workflow-event-dialog.html',
                controller: 'EditConditionDialogCtrl',
                scope: vm,
                size: 'lg',
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                if (vm._expression !== label) {
                    updateExpression(cell);
                }
            }, function () {

            });
        };

        let t1;

        vm.getEvents = function (cell) {
            if (!vm.filteredByWorkflow && vm.selectedJobStream != 'ALL') {
                vm.filteredByWorkflow = vm.selectedJobStream;
            }
            let obj = {
                jobschedulerId: $scope.schedulerIds.selected,
                session: vm.selectedSession.session,
                jobStream: vm.selectedJobStream !== 'ALL' ? vm.selectedJobStream : ''
            };
            if (cell) {
                obj.outConditionId = cell.getAttribute('_id');
            } else {
                if (vm.jobFilters.graphViewDetail.eventFilter === 'ALL') {
                    delete obj['jobStream'];
                }
            }
            if (vm.permission.JobStream.view.eventlist) {
                if (obj.jobStream === null || obj.jobStream === '') {
                    delete obj['jobStream'];
                }
                ConditionService.getEvents(obj).then(function (res) {
                    vm.eventList = res.conditionEvents;
                    checkEventFilter();
                });
            }
        };

        vm.changeEvents = function (jobStream) {
            let obj = {jobschedulerId: $scope.schedulerIds.selected, session: vm.selectedSession.session};
            if (jobStream) {
                vm.filteredByWorkflow = jobStream;
                obj.jobStream = vm.filteredByWorkflow;
            } else {
                vm.jobFilters.graphViewDetail.eventFilter = vm.jobFilters.graphViewDetail.eventFilter === 'ALL' ? 'EXIST' : "ALL";
                if (vm.jobFilters.graphViewDetail.eventFilter !== 'ALL') {
                    obj.jobStream = vm.filteredByWorkflow;
                    for (let i = 0; i < vm.workflows.length; i++) {
                        if (vm.workflows[i].jobStream === vm.filteredByWorkflow || vm.workflows[i].jobStream === vm.selectedJobStream) {
                            obj.jobStream = vm.workflows[i].jobStream;
                            vm.filteredByWorkflow = vm.workflows[i].jobStream;
                            break;
                        }
                    }
                }
            }
            if (vm.permission.JobStream.view.eventlist) {
                if (obj.jobStream === null || obj.jobStream === '') {
                    delete obj['jobStream'];
                }
                ConditionService.getEvents(obj).then(function (res) {
                    vm.eventList = res.conditionEvents;
                    checkEventFilter();
                });
            }
        };

        function checkEventFilter() {
            if (vm.jobFilters.graphViewDetail.eventFilter === 'ALL' && vm.eventList.length > 0) {
                let arr = [];
                for (let i = 0; i < vm.eventList.length; i++) {
                    let p = vm.eventList[i].path === '/' ? vm.eventList[i].path : vm.eventList[i].path + '/';
                    let path = p + vm.eventList[i].jobStream;
                    if (arr.indexOf(path) === -1) {
                        arr.push(path);
                    }
                }
                createTreeStructure(arr);
            } else {
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
                    obj.jobStream = nodes[j];
                    obj.path = nodes[j] ? list[i] : '/';
                    if (j < nodes.length - 1) {
                        obj.folders = [];
                        obj.expanded = true;
                    } else {
                        obj.type = 'WORKFLOW';
                        obj.events = [];
                        for (let m = 0; m < vm.eventList.length; m++) {
                            let p = vm.eventList[m].path === '/' ? '/' + vm.eventList[m].jobStream : vm.eventList[m].path + '/' + vm.eventList[m].jobStream;
                            if (list[i] == p) {
                                obj.events.push({
                                    event: vm.eventList[m].event,
                                    globalEvent: vm.eventList[m].globalEvent
                                });
                            }
                        }

                    }
                    if (eventNodes[0] && eventNodes[0][j]) {
                        if (eventNodes[0][j].name == nodes[j]) {
                            flag = false;
                            index = j;
                        } else {
                            if (arr.length === 0) {
                                arr.push(obj);
                            } else if (arr.length > 0) {
                                recursiveUpdate(arr[0], obj);
                            }
                        }
                    } else {
                        if (arr.length === 0) {
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

        vm.addEventFromWorkflow = function (cell, cell2) {
            let obj = {
                jobschedulerId: $scope.schedulerIds.selected,
                session: vm.selectedSession.session
            };
            if (cell2) {
                obj.event = cell.event;
                obj.globalEvent = cell.globalEvent;
                obj.outConditionId = cell2.getAttribute('_id');
                obj.jobStream = cell2.getAttribute('jobStream');
            } else {
                obj.jobStream = cell.getAttribute('jobStream');
                obj.outConditionId = cell.getAttribute('outconditionId');
                obj.event = cell.getAttribute('actual');
                obj.globalEvent = cell.getAttribute('globalEvent');

            }
            ConditionService.addEvent(obj);
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
                        'jobschedulerId': $scope.schedulerIds.selected,
                        'jobStream': vm.eventList[i].jobStream,
                        'event': vm.eventList[i].event,
                        'outConditionId': vm.eventList[i].outConditionId,
                        'session': vm.selectedSession.session
                    };
                    ConditionService.deleteEvent(obj).then(function (res) {
                        if (i === len - 1) {
                            recursivelyConnectJobs(true, true);
                        }
                    });
                }
            });
        };

        vm.removeEventFromWorkflow = function (cell, cell2) {
            let obj = {
                jobschedulerId: $scope.schedulerIds.selected,
                session: vm.selectedSession.session
            };
            if (cell2) {
                obj.event = cell.event;
                obj.globalEvent = cell.globalEvent;
                obj.outConditionId = cell2.getAttribute('_id');
                obj.jobStream = cell2.getAttribute('jobStream');
            } else {
                obj.jobStream = cell.getAttribute('jobStream');
                obj.outConditionId = cell.getAttribute('outconditionId');
                obj.event = cell.getAttribute('actual');
                obj.globalEvent = cell.getAttribute('globalEvent');
            }
            ConditionService.deleteEvent(obj);
        };

        vm.resetJob = function (cell) {
            ConditionService.resetWorkflow({
                "jobschedulerId": $scope.schedulerIds.selected,
                "job": cell.getAttribute('actual'),
                "jobStream": ''
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
                if (vm._expression.job === vm.jobs[i].path) {
                    if (vm._expression.label === 'InCondition') {
                        for (let j = 0; j < vm.jobs[i].inconditions.length; j++) {
                            if (vm.jobs[i].inconditions[j].id == cell.getAttribute('_id')) {
                                vm.jobs[i].inconditions[j].conditionExpression.expression = vm._expression.expression;
                                for (let m = 0; m < vm.jobs[i].inconditions[j].inconditionCommands.length; m++) {
                                    for (let n = 0; n < vm._expression.commands.length; n++) {
                                        if (vm.jobs[i].inconditions[j].inconditionCommands[m].command === vm._expression.commands[n].command && vm.jobs[i].inconditions[j].inconditionCommands[m].commandParam === vm._expression.commands[n].commandParam) {
                                            vm._expression.commands[n].id = vm.jobs[i].inconditions[j].inconditionCommands[m].id;
                                            break;
                                        }
                                    }
                                }
                                vm.jobs[i].inconditions[j].inconditionCommands = vm._expression.commands;
                                vm.jobs[i].inconditions[j].markExpression = vm._expression.markExpression;
                                vm.jobs[i].inconditions[j].skipOutCondition = vm._expression.skipOutCondition;
                                ConditionService.updateInCondition({
                                    jobschedulerId: $scope.schedulerIds.selected,
                                    jobsInconditions: [{job: vm.jobs[i].path, inconditions: vm.jobs[i].inconditions}]
                                }).then(function (res) {
                                    recursivelyConnectJobs(true, true);
                                });
                                break;

                            }
                        }
                    } else if (vm._expression.label === 'OutCondition') {
                        for (let j = 0; j < vm.jobs[i].outconditions.length; j++) {
                            if (vm.jobs[i].outconditions[j].id == cell.getAttribute('_id')) {
                                vm.jobs[i].outconditions[j].conditionExpression.expression = vm._expression.expression;
                                for (let n = 0; n < vm._expression.events.length; n++) {
                                    if (!vm._expression.events[n].command) {
                                        vm._expression.events[n].command = 'create';
                                    }
                                }
                                vm.jobs[i].outconditions[j].outconditionEvents = vm._expression.events;
                                ConditionService.updateOutCondition({
                                    jobschedulerId: $scope.schedulerIds.selected,
                                    jobsOutconditions: [{job: vm.jobs[i].path, outconditions: vm.jobs[i].outconditions}]
                                }).then(function (res) {
                                    recursivelyConnectJobs(true, true);
                                });
                                break;
                            }
                        }
                    }
                    break;
                }
            }
        }

        function updateJobs(flag) {
            $('[data-toggle="tooltip"]').tooltip('dispose');
            let element = document.getElementById("graph") || {};
            let scrollValue = {
                scrollTop: element.scrollTop,
                scrollLeft: element.scrollLeft,
                scale: vm.editor.graph.getView().getScale()
            };
            vm.editor.graph.removeCells(vm.editor.graph.getChildVertices(vm.editor.graph.getDefaultParent()));
            createWorkflowDiagram(vm.jobs, false, scrollValue);
            if (!flag)
                vm.getEvents(null);
        }

        vm.navigateToEvent = function (evt, jobStream) {
            let evtName;
            if (evt && evt.event) {
                evtName = evt.event;
            } else {
                evtName = evt;
            }
            if (jobStream && jobStream !== vm.selectedJobStream) {
                vm.selectedJobStream = jobStream;
                let jobs;
                for (let i = 0; i < vm.workflows.length; i++) {
                    if (vm.workflows[i].jobStream === vm.selectedJobStream) {
                        jobs = vm.workflows[i].jobs;
                        break;
                    }
                }
                vm.editor.graph.removeCells(vm.editor.graph.getChildVertices(vm.editor.graph.getDefaultParent()));
                createWorkflowDiagram(jobs, true, {});
                vm.navigateToEvent(evtName);
                return;
            }
            let vertices = vm.editor.graph.getChildVertices(vm.editor.graph.getDefaultParent());
            let flag = false;
            for (let i = 0; i < vertices.length; i++) {
                if (vertices[i].value.tagName === 'Event') {
                    if (vertices[i].getAttribute('actual') == evtName) {
                        const graph = $('#graph');
                        let bounds = vm.editor.graph.getGraphBounds();
                        let state = vm.editor.graph.view.getState(vertices[i]);
                        vm.editor.graph.view.setTranslate(((graph.width() / 2) - (state.width / 2) - (state.x - bounds.x)),
                            (bounds.y - (state.y - ((graph.height() / 2) - (state.height / 2)))));
                        flag = true;
                        break;
                    }
                }
            }

            if (!flag) {
                let flg = false;
                for (let i = 0; i < vm.jobs.length; i++) {
                    if (vm.jobs[i].outconditions.length > 0) {
                        for (let j = 0; j < vm.jobs[i].outconditions.length; j++) {
                            if (vm.jobs[i].outconditions[j].outconditionEvents.length > 0) {
                                for (let x = 0; x < vm.jobs[i].outconditions[j].outconditionEvents.length; x++) {
                                    if (vm.jobs[i].outconditions[j].outconditionEvents[x].event === evtName) {
                                        flg = true;
                                        break;
                                    }
                                }
                                if (flg) {
                                    vm.jobs[i].outconditions[j].isExpanded = true;
                                    break;
                                }
                            }
                        }
                        if (flg) {
                            vm.jobs[i].isExpanded = true;
                            break;
                        }
                    }
                }
                if (flg) {
                    let element = document.getElementById("graph") || {};
                    let scrollValue = {
                        scrollTop: element.scrollTop,
                        scrollLeft: element.scrollLeft,
                        scale: vm.editor.graph.getView().getScale()
                    };
                    vm.editor.graph.removeCells(vm.editor.graph.getChildVertices(vm.editor.graph.getDefaultParent()));
                    createWorkflowDiagram(vm.jobs, false, scrollValue);
                    vm.navigateToEvent(evtName);

                }
            }
        };

        $scope.$on('reloadWorkflow', function () {
            if (vm.reloadNewWorkflow) {
                let evt = angular.copy(vm.reloadNewWorkflow.evt);
                if (vm.reloadNewWorkflow.workflow) {
                    vm.selectedJobStream = angular.copy(vm.reloadNewWorkflow.workflow.jobStream);
                } else {
                    vm.selectedJobStream = angular.copy(vm.reloadNewWorkflow);
                }
                vm.reloadNewWorkflow = null;
                recursivelyConnectJobs(true, false, function () {
                    vm.navigateToEvent(evt);
                });
            } else {
                updateWorkflowDiagram(vm.jobs);
            }
            vm.getSessions();
        });

        vm.editConditions1 = function (job) {
            vm.editConditions(job, null, function (res) {
                if (!res) {
                    recursivelyConnectJobs(true, true, function () {
                        vm._jobStream = {};
                    });
                }
            });
        };

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
        function makeCenter() {
            t1 = $timeout(function () {
                vm.actual();
            }, 0);
        }

        /**
         * Function to create dom element
         */
        function getCellNode(name, label, actual, jobStream) {
            const doc = mxUtils.createXmlDocument();
            // Create new node object
            const _node = doc.createElement(name);
            if (!label){
                label = '';
            }
            _node.setAttribute('label', label.trim());
            _node.setAttribute('actual', actual.trim());
            _node.setAttribute('jobStream', jobStream);
            return _node;
        }

        /**
         * Function to create vertex
         */
        function createVertex(parent, _node, text, style) {
            let w = 22;
            let h = 22;
            if (text) {
                w = 180;
                h = 50;
                if (style === 'job') {
                    h = 42;
                }
            }
            return vm.editor.graph.insertVertex(parent, null, _node, 0, 0, w, h, style);
        }


        /**
         * Function : addOverlays
         *
         * Add bar in bottom
         * @param graph
         * @param cell
         */
        function addOverlays(graph, cell, color) {
            let img = color === 'green' ? 'images/green-bar.svg' : color === 'red' ? 'images/red-bar.svg' : color === 'yellow' ? 'images/yellow-bar.svg' : color === 'orange' ? 'images/orange-bar.svg' : 'images/grey-bar.svg';
            if (cell.value.tagName === 'InCondition') {
                img = color === 'green' ? 'images/green-right-curve-bar.svg' : 'images/grey-right-curve-bar.svg';
            } else if (cell.value.tagName === 'OutCondition') {
                img = color === 'green' ? 'images/green-left-curve-bar.svg' : 'images/grey-left-curve-bar.svg';
            }
            let w = cell.value.tagName === 'Job' ? 180 : 151;
            let overlay = new mxCellOverlay(
                new mxImage(img, w, 4), ""
            );
            overlay.cursor = "default";
            overlay.align = mxConstants.ALIGN_CENTER;
            graph.addCellOverlay(cell, overlay);
        }

        /**
         * Function : addReferenceIcon
         *
         * Add connect in IN/Out condition to show references
         * @param graph
         * @param cell
         */
        function addReferenceIcon(graph, cell) {
            let img = 'images/connector.svg';
            let overlay = new mxCellOverlay(
                new mxImage(img, 14, 14), "", mxConstants.ALIGN_RIGHT, mxConstants.ALIGN_TOP
            );
            overlay.cursor = "pointer";
            graph.addCellOverlay(cell, overlay);
            setTimeout(function () {
                if (overlay) {
                    overlay.addListener(mxEvent.CLICK, function (sender, evt) {
                        handleSingleClick(evt.getProperty('cell'));
                    });
                }
            }, 100)
        }

        /**
         * Function : handleSingleClick
         *
         * Handle expand/collapse for Job cell and show reference tab for IN/Out conditions
         * @param cell
         */
        function handleSingleClick(cell) {
            vm.outEvents = null;
            if (cell.value && cell.value.tagName === 'InCondition') {
                vm.jobFilters.graphViewDetail.tab = 'reference';
                vm.referenceTabHeading = gettextCatalog.getString('InCondition') + ' : ' + cell.getAttribute('actual');
                vm._outconditionReference = JSON.parse(cell.getAttribute('outconditions'));
            } else if (cell.value && cell.value.tagName === 'OutCondition') {
                vm.jobFilters.graphViewDetail.tab = 'reference';
                vm.outEvents = JSON.parse(cell.getAttribute('events'));
                vm.outVertex = cell;
                vm.referenceTabHeading = gettextCatalog.getString('OutCondition') + ' : ' + cell.getAttribute('actual');
                vm._outconditionReference = JSON.parse(cell.getAttribute('inconditions'));
            } else if (cell.value.tagName === 'Job') {
                for (let i = 0; i < vm.jobs.length; i++) {
                    if (vm.jobs[i].path == cell.getAttribute('actual')) {
                        vm.jobs[i].isExpanded = !vm.jobs[i].isExpanded;
                        updateJobs(true);
                        break;
                    }
                }
            }
        }

        var firstDay, lastDay;

        function showPlans(job) {
            vm.planViewJob = {path: job.path};
            vm.calendarTitle = new Date().getFullYear();
            vm.viewCalObj = {calendarView: 'month'};
            JobService.getRunTime({
                jobschedulerId: vm.schedulerIds.selected,
                job: job.path
            }).then(function (result) {
                if (result.runTime) {
                    vm.planItems = [];
                    vm.isCaledarLoading = true;
                    firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0);
                    lastDay = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 0);
                    vm.planViewJob.runTime = result.runTime.runTime;
                    getPlansFromRuntime(firstDay, lastDay);
                    $('#year-calendar').data('calendar').setCallBack(function (e) {
                        if (vm.isCalendarDisplay) {
                            vm.viewCalObj.calendarView = e.view;
                            vm.getPlan(e.currentYear, e.currentMonth, true);
                        } else {
                            vm.isCalendarDisplay = true;
                        }
                    });

                }
            });
            openCalendar();
        }

        function getPlansFromRuntime(firstDay, lastDay) {
            DailyPlanService.getPlansFromRuntime({
                jobschedulerId: $scope.schedulerIds.selected,
                runTime: vm.planViewJob.runTime,
                dateFrom: moment(firstDay).format('YYYY-MM-DD'),
                dateTo: moment(lastDay).format('YYYY-MM-DD')
            }).then(function (res) {
                populatePlanItems(res);
                $('#year-calendar').data('calendar').setDataSource(vm.planItems);
                vm.isCalendarDisplay = true;
                vm.isCaledarLoading = false;
            }, function () {
                vm.isCaledarLoading = false;
            });
        }

        function populatePlanItems(res) {
            if (res.periods) {
                res.periods.forEach(function (value) {
                    let planData = {};
                    if (value.begin) {
                        planData.plannedStartTime = moment(value.begin).tz(vm.userPreferences.zone);
                        if (value.end) {
                            planData.endTime = vm.getTimeFromDate(moment(value.end).tz(vm.userPreferences.zone));
                        }
                        if (value.repeat) {
                            planData.repeat = value.repeat;
                        }
                    } else if (value.singleStart) {
                        planData.plannedStartTime = moment(value.singleStart).tz(vm.userPreferences.zone);
                    }
                    let date = new Date(planData.plannedStartTime).setHours(0, 0, 0, 0);
                    planData.startDate = date;
                    planData.endDate = date;
                    planData.color = 'blue';
                    vm.planItems.push(planData);
                });
            }
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
                vm.planViewJob = null;
            }, function () {
                vm.planViewJob = null;
            });
        }

        /**
         * Function to override Mxgraph properties and functions
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
            mxHierarchicalLayout.prototype.interRankCellSpacing = 40;
            mxTooltipHandler.prototype.delay = 0;
            mxConstants.VERTEX_SELECTION_COLOR = null;
            mxConstants.EDGE_SELECTION_COLOR = null;
            mxConstants.GUIDE_COLOR = null;

            let style = graph.getStylesheet().getDefaultVertexStyle();
            let style2 = graph.getStylesheet().getDefaultEdgeStyle();
            if (vm.preferences.theme !== 'light' && vm.preferences.theme !== 'lighter' || !vm.userPreferences.theme) {
                style[mxConstants.STYLE_FONTCOLOR] = '#ffffff';
                style2[mxConstants.STYLE_STROKECOLOR] = '#aaa';
                style2[mxConstants.STYLE_FONTCOLOR] = '#f2f2f2';
            }
            style[mxConstants.STYLE_FILLCOLOR] = vm.preferences.theme === 'dark' ? '#333332' : vm.preferences.theme === 'grey' ? '#535a63' :
                vm.preferences.theme === 'blue' ? '#344d68' : vm.preferences.theme === 'blue-lt' ? '#4e5c6a' : vm.preferences.theme === 'cyan' ? '#00445a' : '#f5f7fb';

            // Enables snapping waypoints to terminals
            mxEdgeHandler.prototype.snapToTerminals = true;

            graph.setConnectable(false);
            graph.setHtmlLabels(true);
            graph.setDisconnectOnMove(false);
            graph.collapseToPreferredSize = false;
            graph.constrainChildren = false;
            graph.extendParentsOnAdd = false;
            graph.extendParents = false;

            // remove overlays from exclude list for mxCellCodec so that overlays are encoded into XML
            let cellCodec = mxCodecRegistry.getCodec(mxCell);
            let excludes = cellCodec.exclude;
            if (excludes.indexOf('overlays') > 0) {
                excludes.splice(excludes.indexOf('overlays'), 1);
            }

            // Parallelogram
            function Parallelogram() {
                mxActor.call(this);
            }

            mxUtils.extend(Parallelogram, mxActor);
            Parallelogram.prototype.size = .18;
            Parallelogram.prototype.isRoundable = function () {
                return true;
            };
            Parallelogram.prototype.redrawPath = function (c, x, y, w, h) {
                var dx = w * Math.max(0, Math.min(1, parseFloat(mxUtils.getValue(this.style, 'size', this.size))));
                let arcSize = mxUtils.getValue(this.style, mxConstants.STYLE_ARCSIZE, mxConstants.LINE_ARCSIZE) / 2;
                this.addPoints(c, [new mxPoint(0, h), new mxPoint(dx, 0), new mxPoint(w, 0), new mxPoint(w - dx, h)], this.isRounded, arcSize, true);
                c.end();
            };

            // Parallelogram2
            function Parallelogram2() {
                mxActor.call(this);
            }

            mxUtils.extend(Parallelogram2, mxActor);
            Parallelogram2.prototype.size = .18;
            Parallelogram2.prototype.isRoundable = function () {
                return true;
            };
            Parallelogram2.prototype.redrawPath = function (c, x, y, w, h) {
                var dx = w * Math.max(0, Math.min(1, parseFloat(mxUtils.getValue(this.style, 'size', this.size))));
                let arcSize = mxUtils.getValue(this.style, mxConstants.STYLE_ARCSIZE, mxConstants.LINE_ARCSIZE) / 2;
                this.addPoints(c, [new mxPoint(0, 0), new mxPoint(dx, h), new mxPoint(w, h), new mxPoint(w - dx, 0)], this.isRounded, arcSize, true);
                c.end();
            };

            // SumEllipseShape
            function SumEllipseShape() {
                mxEllipse.call(this);
            }

            mxUtils.extend(SumEllipseShape, mxEllipse);
            SumEllipseShape.prototype.paintVertexShape = function (c, x, y, w, h) {
                mxEllipse.prototype.paintVertexShape.apply(this, arguments);
                let s2 = 0.145;
                c.setShadow(false);
                c.begin();
                c.moveTo(x + w * s2, y + h * s2);
                c.lineTo(x + w * (1 - s2), y + h * (1 - s2));
                c.end();
                c.stroke();
                c.begin();
                c.moveTo(x + w * (1 - s2), y + h * s2);
                c.lineTo(x + w * s2, y + h * (1 - s2));
                c.end();
                c.stroke();
            };

            mxCellRenderer.registerShape('sumEllipse', SumEllipseShape);
            mxCellRenderer.registerShape('Parallelogram', Parallelogram);
            mxCellRenderer.registerShape('Parallelogram2', Parallelogram2);

            /**
             * Overrides method to provide a cell label in the display
             * @param cell
             */
            graph.convertValueToString = function (cell) {
                if (cell.value.tagName === 'Connection' || cell.value.tagName === 'Box') {
                    return '';
                }
                let className;
                if (cell.value.tagName === 'Job') {
                    className = 'vertex-text job ' + cell.id;
                } else if (cell.value.tagName === 'Event') {
                    className = 'vertex-text event1 ' + cell.id;
                } else if (cell.value.tagName === 'InCondition') {
                    className = 'vertex-text in-condition ' + cell.id;
                } else {
                    className = 'vertex-text out-condition';
                }

                let str = '<div class="' + className + '">' + cell.getAttribute('label');
                if (cell.value.tagName === 'Job') {
                    if (cell.getAttribute('nextStartTime') && cell.getAttribute('nextStartTime') != 'undefined') {
                        let time = ' <span class="text-success" >(' + $filter('remainingTime')(cell.getAttribute('nextStartTime')) + ')</span>';
                        str = str + '<br><i>' + $filter('stringToDate')(cell.getAttribute('nextStartTime')) + '</i>' + time
                    } else if (cell.getAttribute('nextPeriod') && cell.getAttribute('nextPeriod') != 'undefined') {
                        let time = ' <span class="text-success" >(' + $filter('remainingTime')(cell.getAttribute('nextPeriod')) + ')</span>';
                        str = str + '<div class="clickable-time text-hover-primary"><i class="clickable-time">' + $filter('stringToDate1')(cell.getAttribute('nextPeriod')) + '</i>' + time + '</div>';
                    } else if (cell.getAttribute('enquePeriod') && cell.getAttribute('enquePeriod') != 'undefined') {
                        let time = ' <span class="text-success" >(' + $filter('remainingTime')(cell.getAttribute('enquePeriod')) + ')</span>';
                        let text, className = '', status = cell.getAttribute('status');
                        if (status === 'RUNNING' || status === 'PENDING') {
                            text = gettextCatalog.getString('message.notInPeriod');
                            className = 'clickable-time text-hover-primary';
                        } else {
                            text = gettextCatalog.getString(status);
                        }
                        str = str + '<div class="' + className + '">' +
                            '<i class="' + className + '">' + text + '</i><br>' +
                            '<i class="' + className + '">' + $filter('stringToDate')(cell.getAttribute('enquePeriod')) + '</i>' + time + '</div>';
                    }
                }
                str = str + '</div>';
                return str;
            };

            /**
             * Function: isCellMovable
             *
             * Returns true if the given cell is moveable.
             */
            graph.isCellMovable = function (cell) {
                if (cell.value) {
                    return cell.value.tagName === 'Job';
                } else {
                    return false;
                }
            };

            mxCellOverlay.prototype.getBounds = function (state) {
                let isEdge = state.view.graph.getModel().isEdge(state.cell);
                let s = state.view.scale;
                let pt;
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

                } else {
                    let pts = state.absolutePoints;
                    if (pts.length % 2 == 1) {
                        pt = pts[Math.floor(pts.length / 2)];
                    } else {
                        let idx = pts.length / 2;
                        let p0 = pts[idx - 1];
                        let p1 = pts[idx];
                        pt = new mxPoint(p0.x + (p1.x - p0.x) / 2,
                            p0.y + (p1.y - p0.y) / 2);
                    }
                }

                if (this.align == mxConstants.ALIGN_CENTER) {
                    pt.y = pt.y - (2 * state.shape.scale);
                    if (state.cell.value.tagName === 'InCondition') {
                        pt.x = pt.x + (15 * state.shape.scale);
                    } else if (state.cell.value.tagName === 'OutCondition') {
                        pt.x = pt.x - (15 * state.shape.scale);
                    }
                } else if (this.align == mxConstants.ALIGN_RIGHT && (state.cell.value.tagName === 'InCondition' || state.cell.value.tagName === 'OutCondition')) {
                    pt.y = pt.y + (7 * state.shape.scale);
                    if (state.cell.value.tagName === 'InCondition') {
                        pt.x = pt.x - (38 * state.shape.scale);
                    } else {
                        pt.x = pt.x - (13 * state.shape.scale);
                    }
                }

                if (!pt) {
                    return;
                }
                return new mxRectangle(Math.round(pt.x - (w * this.defaultOverlap - this.offset.x) * s),
                    Math.round(pt.y - (h * this.defaultOverlap - this.offset.y) * s), w * s, h * s);
            };

            /**
             * Function: getTooltipForCell
             *
             * Returns the string or DOM node to be used as the tooltip for the given
             * cell.
             */
            graph.getTooltipForCell = function (cell) {
                let tip = null;
                if (cell != null && cell.getTooltip != null) {
                    tip = cell.getTooltip();
                } else {
                    if (!(cell.value.tagName === 'Connection' || cell.value.tagName === 'Box')) {
                        tip = "<div class='vertex-text2'>";
                        if (cell.value.tagName === 'Job') {
                            tip = tip + cell.getAttribute('label') + ' - ' + gettextCatalog.getString(cell.getAttribute('status'));
                        } else if (cell.getAttribute('label')) {
                            tip = tip + cell.getAttribute('label');
                        }
                        tip = tip + '</div>';
                    }
                }

                return tip;
            };

            /**
             * Function: handle a click event
             */
            graph.addListener(mxEvent.CLICK, function (sender, evt) {
                let event = evt.getProperty('event');
                let cell = evt.getProperty('cell'); // cell may be null
                if (cell != null) {
                    if (event && event.target && (event.target.className === 'clickable-time' || event.target.className === 'clickable-time text-hover-primary')) {
                        for (let i = 0; i < vm.jobs.length; i++) {
                            if (vm.jobs[i].path == cell.getAttribute('actual')) {
                                showPlans(vm.jobs[i]);
                                break;
                            }
                        }
                    } else {
                        setTimeout(function () {
                            if (cell) {
                                handleSingleClick(cell);
                            }
                        }, 200);
                    }
                    evt.consume();
                }
                vm.selectedNode = null;
            });

            // Shows a "modal" window when clicking on img.
            function mxIconSet(state) {
                this.images = [];
                let img;
                if (state.cell && state.cell.value.tagName === 'Job' || state.cell.value.tagName === 'Jobstream' || (state.cell.value.tagName === 'Event' && (vm.permission.JobStream.change.events.add || vm.permission.JobStream.change.events.remove)) || (state.cell.value.tagName === 'InCondition' || state.cell.value.tagName === 'OutCondition' && vm.permission.JobStream.change.conditions)) {
                    img = mxUtils.createImage('images/menu.svg');
                    let x = state.x - (20 * state.shape.scale), y = state.y - (8 * state.shape.scale);
                    if (state.cell.value.tagName === 'Event') {
                        x += (state.width * .222);
                    } else if (state.cell.value.tagName === 'OutCondition') {
                        x += (state.width * .167);
                    } else if (state.cell.value.tagName === 'Jobstream') {
                        x = x + (20 * state.shape.scale);
                    }

                    img.style.left = x + 'px';
                    img.style.top = y + 'px';
                    mxEvent.addListener(img, 'click',
                        mxUtils.bind(this, function (evt) {
                            let _x = x;
                            if (evt.clientX > 240) {
                                _x = _x - 120;
                                if (state.cell.value.tagName === 'Job') {
                                    _x -= 28;
                                    if (vm.userPreferences.locale === 'de') {
                                        _x -= 40;
                                    } else if (vm.userPreferences.locale === 'fr') {
                                        _x -= 75;
                                    }
                                }
                                vm.openToRight = false;
                            } else {
                                vm.openToRight = true;
                            }

                            let _y = y + 60 - $('#graph').scrollTop() - $('.graph-container').scrollTop();
                            _x = _x - $('#graph').scrollLeft() - $('.graph-container').scrollLeft();
                            vm.selectedNode = {type: state.cell.value.tagName, cell: state.cell};
                            if (vm.selectedNode.type === 'Event') {
                                vm.selectedNode.isExist = state.cell.getAttribute('isExist');
                            } else if (vm.selectedNode.type === 'Job') {
                                for (let i = 0; i < vm.jobs.length; i++) {
                                    if (vm.jobs[i].path === state.cell.getAttribute('actual')) {
                                        vm.selectedNode.job = vm.jobs[i];
                                        break;
                                    }
                                }
                            }
                            let $menu = document.getElementById('actionMenu');
                            if ((window.innerHeight - evt.clientY) < 320 && state.cell.value.tagName === 'Job') {
                                _y = _y - 328;
                            }
                            $menu.style.left = _x + "px";
                            $menu.style.top = (_y + 36) + "px";

                            this.destroy();
                        })
                    );
                }
                if (img) {
                    img.style.position = 'absolute';
                    img.style.cursor = 'pointer';
                    img.style.width = (18 * state.shape.scale) + 'px';
                    img.style.height = (18 * state.shape.scale) + 'px';
                    state.view.graph.container.appendChild(img);
                    this.images.push(img);
                }
            }

            mxIconSet.prototype.destroy = function () {
                if (this.images != null) {
                    for (let i = 0; i < this.images.length; i++) {
                        let img = this.images[i];
                        img.parentNode.removeChild(img);
                    }
                }
                this.images = null;
            };

            /**
             * Function: getCursorForCell
             *
             * Returns the cursor value to be used for the CSS of the shape for the
             * given cell.
             *@param cell
             */
            graph.getCursorForCell = function (cell) {
                if (cell && cell.value && (cell.value.tagName === 'InCondition' || cell.value.tagName === 'OutCondition' || (cell.value.tagName === 'Job'))) {
                    return 'pointer';
                } else {
                    return null;
                }
            };

            // Defines the tolerance before removing the icons
            var iconTolerance = 10;
            let isJobDraging = false, movedJob = null;

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
                    if (me.consumed && !me.getCell()) {
                        isJobDraging = true;
                        movedJob = null;
                        setTimeout(function () {
                            if (isJobDraging)
                                $('#dropContainer').css({opacity: 1});
                        }, 10);
                    }
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
                    if (isJobDraging) {
                        isJobDraging = false;
                        detachedJob(me.evt.target, movedJob)
                    }
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

            graph.moveCells = function (cells, dx, dy, clone, target, evt, mapping) {
                if (cells && cells[0]) {
                    movedJob = cells[0];
                }
                dx = 0;
                dy = (dy != null) ? dy : 0;
                clone = (clone != null) ? clone : false;
                if (cells != null && (dx != 0 || dy != 0 || clone || target != null)) {
                    // Removes descendants with ancestors in cells to avoid multiple moving
                    cells = this.model.getTopmostCells(cells);
                    if (cells && cells[0] && cells && cells[0].value && cells[0].value.tagName === 'Job') {
                        dy = 0;
                    }

                    this.model.beginUpdate();
                    try {
                        // Faster cell lookups to remove relative edge labels with selected
                        // terminals to avoid explicit and implicit move at same time
                        var dict = new mxDictionary();
                        for (let i = 0; i < cells.length; i++) {
                            dict.put(cells[i], true);
                        }

                        var isSelected = mxUtils.bind(this, function (cell) {
                            while (cell != null) {
                                if (dict.get(cell)) {
                                    return true;
                                }

                                cell = this.model.getParent(cell);
                            }
                            return false;
                        });

                        // Removes relative edge labels with selected terminals
                        var checked = [];

                        for (let i = 0; i < cells.length; i++) {
                            let geo = this.getCellGeometry(cells[i]);
                            let parent = this.model.getParent(cells[i]);

                            if ((geo == null || !geo.relative) || !this.model.isEdge(parent) ||
                                (!isSelected(this.model.getTerminal(parent, true)) &&
                                    !isSelected(this.model.getTerminal(parent, false)))) {
                                checked.push(cells[i]);
                            }
                        }

                        cells = checked;

                        if (clone) {
                            cells = this.cloneCells(cells, this.isCloneInvalidEdges(), mapping);
                            if (target == null) {
                                target = this.getDefaultParent();
                            }
                        }

                        // to avoid forward references in sessions.
                        // Need to disable allowNegativeCoordinates if target not null to
                        // allow for temporary negative numbers until cellsAdded is called.
                        var previous = this.isAllowNegativeCoordinates();

                        if (target != null) {
                            this.setAllowNegativeCoordinates(true);
                        }

                        this.cellsMoved(cells, dx, dy, !clone && this.isDisconnectOnMove()
                            && this.isAllowDanglingEdges(), target == null,
                            this.isExtendParentsOnMove() && target == null);

                        this.setAllowNegativeCoordinates(previous);

                        if (target != null) {
                            let index = this.model.getChildCount(target);
                            this.cellsAdded(cells, target, index, null, null, true);
                        }

                        // Dispatches a move event
                        this.fireEvent(new mxEventObject(mxEvent.MOVE_CELLS, 'cells', cells,
                            'dx', dx, 'dy', dy, 'clone', clone, 'target', target, 'event', evt));
                    } finally {
                        this.model.endUpdate();
                    }
                }
                return cells;
            };
            graph.isValidDropTarget = function (cell, cells, evt) {
                return false;
            }
        }

        function detachedJob(target, job) {
            let dom = $('#dropContainer');
            if (target && target.getAttribute('class') == 'dropContainer' && job) {
                dom.css({'border-color': 'green'});
                let flag = true;
                ConditionService.updateInCondition({
                    jobschedulerId: $scope.schedulerIds.selected,
                    jobsInconditions: [{job: job.getAttribute('actual'), inconditions: []}]
                }).then(function (res) {
                    if (flag) {
                        flag = false;
                        dom.css({'opacity': 0, 'border-color': '#ccc'});
                        recursivelyConnectJobs(true, true);
                    }
                });
                ConditionService.updateOutCondition({
                    jobschedulerId: $scope.schedulerIds.selected,
                    jobsOutconditions: [{job: job.getAttribute('actual'), outconditions: []}]
                }).then(function () {
                    if (flag) {
                        flag = false;
                        dom.css({'opacity': 0, 'border-color': '#ccc'});
                        recursivelyConnectJobs(true, true);
                    }
                }, function (err) {
                    if (flag) {
                        flag = false;
                        dom.css({'opacity': 0, 'border-color': '#ccc'});
                        recursivelyConnectJobs(true, true);
                    }
                });
            } else {
                dom.css({'opacity': 0});
            }
        }

        vm.getPlan = function (newYear, newMonth, isReload) {
            vm.planItems = [];
            vm.isCaledarLoading = true;
            let year = newYear, month = newMonth;
            let dom = $('#year-calendar').data('calendar');
            if (!year) {
                year = dom.getYear();
                month = dom.getMonth();
            }
            if (!isReload) {
                vm.isCalendarDisplay = false;
                dom.setYearView({view: vm.viewCalObj.calendarView, year: year});
            }
            let firstDay2 = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0);
            let lastDay2 = new Date(year, 11, 31, 23, 59, 0);
            if (vm.viewCalObj.calendarView == 'year') {
                if (year < new Date().getFullYear()) {
                    return;
                } else if (year == new Date().getFullYear()) {
                    firstDay2 = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0);
                } else {
                    firstDay2 = new Date(year, 0, 1, 0, 0, 0);
                }
            }
            if (vm.viewCalObj.calendarView == 'month') {
                if (year <= new Date().getFullYear() && month < new Date().getMonth()) {
                    return;
                } else if (year == new Date().getFullYear() && month == new Date().getMonth()) {
                    firstDay2 = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), 0, 0, 0);
                } else {
                    firstDay2 = new Date(year, month, 1, 0, 0, 0);

                }
                lastDay2 = new Date(year, month + 1, 0, 23, 59, 0);
            }

            if (new Date(firstDay2) >= new Date(firstDay) && new Date(lastDay2) <= new Date(lastDay)) {
                return;
            }
            firstDay = firstDay2;
            lastDay = lastDay2;
            getPlansFromRuntime(firstDay, lastDay);
        };

        vm.loadHistory = function () {
            let obj = {
                jobschedulerId: vm.schedulerIds.selected,
                session: vm.selectedSession.session,
                jobStream: vm.selectedSession.jobStream,
                limit: parseInt(vm.userPreferences.maxHistoryPerJobchain, 10)
            };
            if(vm.selectedSession.session) {
                ConditionService.history(obj).then(function (res) {
                    vm.taskHistory = res.history;
                }, function (err) {
                    console.log(err)
                });
            }
        };

        vm.loadAuditLogs = function () {
            var obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.jobs = [];
            for (let i = 0; i < vm.jobs.length; i++) {
                obj.jobs.push({job: vm.jobs[i].path});
            }
            obj.limit = parseInt(vm.userPreferences.maxAuditLogRecords) < parseInt(vm.userPreferences.maxAuditLogPerObject) ? parseInt(vm.userPreferences.maxAuditLogRecords) : parseInt(vm.userPreferences.maxAuditLogPerObject);
            AuditLogService.getLogs(obj).then(function (result) {
                if (result && result.auditLog) {
                    vm.auditLogs = result.auditLog;
                }
            });
        };

        $scope.$on('event-started', function () {
            if (vm.events && vm.events.length > 0 && vm.events[0].eventSnapshots) {
                for (let m = 0; m < vm.events[0].eventSnapshots.length; m++) {
                    if ((vm.events[0].eventSnapshots[m].eventType === "EventCreated" || vm.events[0].eventSnapshots[m].eventType === "EventRemoved" || vm.events[0].eventSnapshots[m].eventType === "InconditionValidated") && !vm.events[0].eventSnapshots[m].eventId) {
                        recursivelyConnectJobs(true, true);
                        break;
                    } else if (vm.events[0].eventSnapshots[m].eventType === "JobStateChanged" && !vm.events[0].eventSnapshots[m].eventId) {
                        let flag = false;
                        for (let i = 0; i < vm.jobs.length; i++) {
                            if (vm.jobs[i].path === vm.events[0].eventSnapshots[m].path) {
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
                    } else if (vm.events[0].eventSnapshots[m].eventType === "ReportingChangedJob" && !vm.events[0].eventSnapshots[m].eventId) {
                        if (vm.selectedJobStream && vm.selectedJobStream !== 'ALL') {
                            vm.loadHistory();
                        }
                    } else if (vm.events[0].eventSnapshots[m].eventType === "AuditLogChanged" && vm.events[0].eventSnapshots[m].objectType === "JOB" && !vm.events[0].eventSnapshots[m].eventId) {
                        if (vm.permission.AuditLog.view.status && vm.auditLogs) {
                            vm.loadAuditLogs();
                        }
                    }
                }
            }
        });

        /** -------------------- Actions ------------------- */
        $scope.closeMenu = function () {
            vm.selectedNode = null;
        };

        $scope.$on('createJobStream', function () {
            vm.createJobStream();
        });

        vm.zoomIn = function () {
            if (vm.editor && vm.editor.graph) {
                vm.editor.graph.zoomIn();
            }
        };

        vm.zoomOut = function () {
            if (vm.editor && vm.editor.graph) {
                vm.editor.graph.zoomOut();
            }
        };

        vm.actual = function () {
            if (vm.editor && vm.editor.graph) {
                vm.editor.graph.zoomActual();
                center();
            }
        };

        vm.fit = function () {
            if (vm.editor && vm.editor.graph) {
                vm.editor.graph.fit();
                center();
            }
        };

        function center() {
            let dom = document.getElementById("graph");
            let x = 0.5, y = 0.2;
            if (dom.clientWidth !== dom.scrollWidth) {
                x = 0;
            }
            if (dom.clientHeight !== dom.scrollHeight) {
                y = 0;
            }
            vm.editor.graph.center(true, true, x, y);
        }

        $scope.$on('importJobStream', function () {
            recursivelyConnectJobs(true, true);
        });

        vm.exportJobStream = function () {
            let jobStreams = [];
            for (let i = 0; i < vm.workflows.length; i++) {
                let obj = {
                    jobStream: vm.workflows[i].jobStream,
                    jobs: []
                };
                for (let j = 0; j < vm.workflows[i].jobs.length; j++) {
                    let _job = vm.workflows[i].jobs[j];
                    let in_conditions = [], out_conditions = [];
                    for (let x = 0; x < _job.inconditions.length; x++) {
                        let obj = {};
                        obj.conditionExpression = {expression: _job.inconditions[x].conditionExpression.expression};
                        obj.inconditionCommands = [];
                        obj.jobStream = _job.inconditions[x].jobStream;
                        for (let y = 0; y < _job.inconditions[x].inconditionCommands.length; y++) {
                            obj.inconditionCommands.push({
                                "command": _job.inconditions[x].inconditionCommands[y].command,
                                "commandParam": _job.inconditions[x].inconditionCommands[y].commandParam
                            });
                        }
                        in_conditions.push(obj);
                    }

                    for (let x = 0; x < _job.outconditions.length; x++) {
                        let obj = {};
                        obj.conditionExpression = {expression: _job.outconditions[x].conditionExpression.expression};
                        obj.outconditionEvents = [];
                        obj.jobStream = _job.outconditions[x].jobStream;
                        for (let y = 0; y < _job.outconditions[x].outconditionEvents.length; y++) {
                            obj.outconditionEvents.push({
                                "command": _job.outconditions[x].outconditionEvents[y].command,
                                "event": _job.outconditions[x].outconditionEvents[y].event,
                                "globalEvent": _job.outconditions[x].outconditionEvents[y].globalEvent
                            });
                        }
                        out_conditions.push(obj);
                    }

                    obj.jobs.push({job: _job.path, inconditions: in_conditions, outconditions: out_conditions})
                }
                jobStreams.push(obj);
            }

            let name = 'jobstream' + '.json';
            let fileType = 'application/octet-stream';
            let data = jobStreams;
            if (typeof data === 'object') {
                data = JSON.stringify(data, undefined, 2);
            }
            let blob = new Blob([data], {type: fileType});
            FileSaver.saveAs(blob, name);
        };

        vm.exportInPng = function () {
            if (vm.editor && vm.editor.graph) {
                vm.exportSvg('jobstream');
            }
        };

        $scope.$on('$destroy', function () {
            if (t1) {
                $timeout.cancel(t1);
            }
            if (timer) {
                $timeout.cancel(timer);
            }
            if (interval) {
                clearInterval(interval);
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
