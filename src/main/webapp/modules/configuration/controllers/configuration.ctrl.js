/**
 * Created by sourabhagrawal on 04/09/19.
 */
(function () {
    'use strict';
    angular
        .module('app')
        .controller('EditorConfigurationCtrl', EditorConfigurationCtrl)
        .controller('JOEEditorCtrl', JOEEditorCtrl)
        .controller('JobEditorCtrl', JobEditorCtrl)
        .controller('JobChainEditorCtrl', JobChainEditorCtrl)
        .controller('OrderEditorCtrl', OrderEditorCtrl)
        .controller('ProcessClassEditorCtrl', ProcessClassEditorCtrl)
        .controller('AgentClusterEditorCtrl', AgentClusterEditorCtrl)
        .controller('ScheduleEditorCtrl', ScheduleEditorCtrl)
        .controller('LockEditorCtrl', LockEditorCtrl)
        .controller('MonitorEditorCtrl', MonitorEditorCtrl)
        .controller('CommandEditorCtrl', CommandEditorCtrl)
        .controller('StepNodeCtrl', StepNodeCtrl)
        .controller('FileOrderCtrl', FileOrderCtrl)
        .controller('WizardCtrl', WizardCtrl);

    EditorConfigurationCtrl.$inject = ['$scope', '$rootScope', '$state', 'CoreService', '$uibModal'];

    function EditorConfigurationCtrl($scope, $rootScope, $state, CoreService, $uibModal) {
        $scope.configFilters = CoreService.getConfigurationTab();
        $scope.validConfig = false;
        $scope.changeValidConfigStatus = function (status) {
            $scope.validConfig = status;
        };

        $(window).resize(function () {
            calcHeight();
        });

        function calcHeight() {
            const dom = $('.scroll-y');
            let count = 0;
            if (dom && dom.position()) {
                function recursiveCheck() {
                    ++count;
                    let top = dom.position().top + 10;
                    const flag = top < 130;
                    top = top - $(window).scrollTop();
                    dom.css({'height': 'calc(100vh - ' + (top - 10) + 'px'});
                    if (top < 96) {
                        top = 96;
                    }
                    if ($state.current.url !== '/other') {
                        $('.sticky').css('top', top);
                    } else {
                        top = top + 39;
                        $('.sticky').css('top', top);
                    }
                    $('.tree-block').height('calc(100vh - ' + top + 'px' + ')');
                    if (count < 5) {
                        if (flag) {
                            recursiveCheck();
                        } else {
                            let interval = setInterval(function () {
                                recursiveCheck();
                                clearInterval(interval);
                            }, 150);
                        }
                    }
                }

                recursiveCheck();
            }
        }

        $scope.saveXml = function () {
            $rootScope.$broadcast('save');
        };

        $scope.validateXml = function () {
            $rootScope.$broadcast('validate');
        };

        $scope.showXml = function () {
            $rootScope.$broadcast('showXml');
        };

        $scope.importXML = function () {
            $rootScope.$broadcast('importXML');
        };

        $scope.newXmlFile = function () {
            $rootScope.$broadcast('newFile');
        };

        $scope.deployXML = function () {
            $rootScope.$broadcast('deployXML');
        };

        $scope.isDeployBtnDisabled = false;
        $scope.showDeploy = function () {
            $scope.isDeployBtnDisabled = true;
            $rootScope.$broadcast('deployables');
            setTimeout(function () {
                $scope.isDeployBtnDisabled = false;
            }, 1000);
        };

        $scope.showDeployResults = function () {
            $scope.messageList = $scope.configFilters.joe.deployedMessages;
            let modalInstance = $uibModal.open({
                templateUrl: 'modules/configuration/views/deploy-message-list-dialog.html',
                controller: 'DialogCtrl1',
                scope: $scope,
                size: 'lg',
                backdrop: 'static'
            });
            modalInstance.result.then(function () {

            }, function () {

            });
        };

        $scope.deleteConf = function () {
            $rootScope.$broadcast('deleteXML');
        };

        $scope.$on('$viewContentLoaded', function () {
            $scope.currentTab = $state.current.url;
            setTimeout(function () {
                calcHeight();
            }, 100);
        });

        $scope.$on('$stateChangeSuccess', function (event, toState) {
            $scope.configFilters.state = toState.name;
        });

        $scope.$on('hide-button', function (event, data) {
            $scope.hideButton = data.submitXSD;
            $scope.isDeployed = data.isDeploy;
            $scope.state = data.XSDState;
            $scope.type = data.type;
        });
    }

    JOEEditorCtrl.$inject = ['$scope', 'SOSAuth', 'CoreService', 'EditorService', 'orderByFilter', '$uibModal', 'clipboard', 'gettextCatalog', 'toasty'];

    function JOEEditorCtrl($scope, SOSAuth, CoreService, EditorService, orderBy, $uibModal, clipboard, gettextCatalog, toasty) {
        const vm = $scope;
        vm.joeConfigFilters = CoreService.getConfigurationTab().joe;
        vm.tree = [];
        vm.filter_tree = {};
        vm.filterTree1 = [];
        vm.treeDeploy = {};
        vm.deployables = [];
        vm.isloaded = true;
        vm.isLoading = true;
        vm.isBackAvailable = {};
        vm.deployableObjects = {handleRecursively: true, account: vm.username};
        vm.expanding_property = {
            field: 'name'
        };

        hljs.configure({
            useBR: true
        });

        vm.backToCurrentState = function () {
            let showList = false;
            if (lastClickedItem) {
                lastClickedItem.selected1 = false;
            } else {
                showList = true;
            }
            vm.isLoading = true;
            let obj = vm.isBackAvailable.object;
            let param = vm.isBackAvailable.param;
            let isMatch = false;
            let pathArr = [];
            if (!obj.path) {
                showList = true;
                obj.path = vm.isBackAvailable.path;
            }
            if (obj.path !== vm.path) {
                let arr = obj.path.split('/');
                for (let i = 0; i < arr.length; i++) {
                    if (arr[i]) {
                        if (i > 0 && arr[i - 1]) {
                            pathArr.push('/' + arr[i - 1] + '/' + arr[i]);
                        } else {
                            pathArr.push('/' + arr[i])
                        }
                    }
                }

            }
            traverseTree(vm.tree[0], obj.path);
            vm.isBackAvailable = {};

            function traverseTree(data, _path) {
                if (data.path === _path) {
                    data.expanded = true;
                    for (let x = 0; x < data.folders.length; x++) {
                        if (data.folders[x].object === obj.type) {
                            if (data.folders[x].children) {
                                for (let y = 0; y < data.folders[x].children.length; y++) {
                                    if (data.folders[x].children[y].name === obj.name) {
                                        navToSelectedObject(data, x, y, param, showList);
                                        break;
                                    }
                                }
                            }
                            break;
                        }
                    }
                    isMatch = true;
                }

                if (pathArr.indexOf(data.path) > -1) {
                    data.expanded = true;
                }

                if (data.folders) {
                    for (let i = 0; i < data.folders.length; i++) {
                        if (data.folders[i]) {
                            if (!isMatch) {
                                traverseTree(data.folders[i], _path);
                            }
                        }
                    }
                }
            }
        };

        let _tempArrToExpand = [];

        function recursiveTreeUpdate(scrTree, destTree, isExist) {

            if (scrTree && destTree) {
                for (let j = 0; j < scrTree.length; j++) {
                    if (vm.path && scrTree[j].path && vm.path === scrTree[j].path) {
                        isExist.isCurrentFolderExist = true;
                    }
                    for (let i = 0; i < destTree.length; i++) {
                        if (destTree[i].path && scrTree[j].path && (destTree[i].path === scrTree[j].path)) {
                            scrTree[j].expanded = destTree[i].expanded;
                            scrTree[j].selected1 = destTree[i].selected1;
                            if (scrTree[j].deleted) {
                                scrTree[j].expanded = false;
                            }
                            if(scrTree[j].expanded && scrTree[j].path.split('/').length === 8){
                                scrTree[j].expanded = false;
                                _tempArrToExpand.push(scrTree[j]);
                            }
                            if (destTree[i].folders && destTree[i].folders.length > 0) {
                                let arr = [];
                                for (let x = 0; x < destTree[i].folders.length; x++) {
                                    if (destTree[i].folders[x].object && destTree[i].folders[x].name) {
                                        arr.push(destTree[i].folders[x]);
                                    }
                                }
                                if (scrTree[j].folders) {
                                    scrTree[j].folders = arr.concat(scrTree[j].folders);
                                } else {
                                    scrTree[j].folders = arr;
                                }
                            }
                            if (scrTree[j].folders && destTree[i].folders) {
                                recursiveTreeUpdate(scrTree[j].folders, destTree[i].folders, isExist);
                            }
                            break;
                        }
                    }
                }
            }
            return scrTree;
        }

        function init(path, mainPath) {
            _tempArrToExpand = [];
            if (vm.isloaded) {
                vm.isloaded = false;
                EditorService.tree({
                    jobschedulerId: vm.schedulerIds.selected,
                    types: ['JOE']
                }).then(function (res) {
                    vm.isloaded = true;
                    let isExist = {isCurrentFolderExist: false};
                    if (path) {
                        vm.tree = recursiveTreeUpdate(res.folders, vm.tree, isExist);
                        updateFolders(path);
                        if (path !== mainPath) {
                            updateFolders(mainPath);
                        }
                        vm.isLoading = false;
                    } else {
                        if (_.isEmpty(vm.joeConfigFilters.expand_to)) {
                            vm.tree = res.folders;
                            if (vm.tree.length > 0) {
                                vm.tree[0].expanded = true;
                                updateObjects(vm.tree[0]);
                            }
                            vm.isLoading = false;
                        } else {
                            if (vm.joeConfigFilters.activeTab.path) {
                                vm.path = vm.joeConfigFilters.activeTab.path;
                            }
                            vm.tree = res.folders;
                            recursiveTreeUpdate(vm.tree, vm.joeConfigFilters.expand_to, isExist);
                            restoreState();
                        }

                    }
                    if (_tempArrToExpand && _tempArrToExpand.length > 0) {
                        setTimeout(function () {
                            for (let i = 0; i < _tempArrToExpand.length; i++) {
                                _tempArrToExpand[i].expanded = true;
                            }
                        }, 10);
                    }
                    if (!isExist.isCurrentFolderExist && vm.path) {
                        vm.removeSection();
                    }
                }, function () {
                    vm.isloaded = true;
                    vm.isLoading = false;
                });
            }
        }

        function restoreState() {
            if (vm.joeConfigFilters.activeTab.type === 'type') {
                vm.type = vm.joeConfigFilters.activeTab.object;
            } else if (vm.joeConfigFilters.activeTab.type === 'param') {
                vm.param = vm.joeConfigFilters.activeTab.object;
            }
            if (!vm.joeConfigFilters.activeTab.path) {
                vm.isLoading = false;
                return;
            }

            updateFolders(vm.joeConfigFilters.activeTab.path, function (response) {
                vm.isLoading = false;
                if (response) {
                    let data = response.child;
                    let _path;
                    if (data.object) {
                        _path = data.parent;
                    } else if (data.type) {
                        _path = data.path;
                    } else {
                        _path = response.parent.path;
                    }
                    vm.path = _path;
                    if (data.object) {
                        setTimeout(function () {
                            vm.$broadcast('NEW_OBJECT', {
                                data: data,
                                parent: response.parent
                            });
                        }, 70);
                    } else if (data.type) {
                        vm.getFileObject(data, _path, function () {
                            vm.$broadcast('NEW_OBJECT', {
                                data: data,
                                parent: response.superParent
                            });
                        });
                    } else {
                        setTimeout(function () {
                            vm.$broadcast('NEW_PARAM', {
                                object: data,
                                parent: response.parent,
                                superParent: response.superParent
                            });
                        }, 70);
                    }
                }
            });
        }

        vm.$on('deployables', function () {
            vm.deployTree = _buildDeployTree();
            vm.deployables = [];
        });

        function _buildDeployTree() {
            let modalInstance = $uibModal.open({
                templateUrl: 'modules/configuration/views/deployables.html',
                controller: 'DialogCtrl1',
                scope: vm,
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                recursivelyDeploy();
            }, function () {
                vm.deployableObjects = {handleRecursively: true, account: vm.username};
            });
            setTimeout(function () {
                EditorService.deployables({
                    jobschedulerId: vm.schedulerIds.selected
                }).then(function (res) {
                    buildDeployablesTree(res);
                });
            }, 0)
        }

        function buildDeployablesTree(res) {
            if (res["deployables"] && res["deployables"].length > 0) {
                let array = [];
                vm.deployables.push({jobschedulerId: res.deployables[0].jobschedulerId});
                for (let i = 0; i < res["deployables"].length; i++) {
                    let temp;
                    if (res["deployables"][i].folder !== '/') {
                        let x = res.deployables[i].folder.split('/');
                        temp = {
                            name: x[x.length - 1],
                            path: res.deployables[i].folder,
                            jobschedulerId: res.deployables[i].jobschedulerId,
                            operation: res.deployables[i].operation
                        };
                    } else {
                        if (!vm.deployables[0].name) {
                            vm.deployables[0] = {
                                name: "/",
                                path: res.deployables[i].folder,
                                jobschedulerId: res.deployables[i].jobschedulerId,
                            }
                        }
                    }
                    let flag = false;
                    if (array.length > 0 && res["deployables"][i].folder !== '/') {
                        for (let j = 0; j < array.length; j++) {
                            if (array[j].path === res["deployables"][i].folder) {
                                if (res.deployables[i].objectType !== 'FOLDER') {
                                    if (array[j][res.deployables[i].objectType]) {
                                        array[j][res.deployables[i].objectType].push({
                                            name: res.deployables[i].objectName,
                                            path: res["deployables"][i].folder,
                                            operation: res["deployables"][i].operation
                                        });
                                    } else {
                                        array[j][res.deployables[i].objectType] = [];
                                        array[j][res.deployables[i].objectType].push({
                                            name: res.deployables[i].objectName,
                                            path: res["deployables"][i].folder,
                                            operation: res["deployables"][i].operation
                                        });
                                    }
                                } else {
                                    if (!array[j].folders) {
                                        array[j].folders = [];
                                        array[j].folders.push({
                                            name: res.deployables[i].objectName,
                                            path: res.deployables[i].folder,
                                            operation: res.deployables[i].operation
                                        })
                                    }
                                }
                                flag = true;
                                break;
                            } else {
                                flag = false;
                                if (res.deployables[i].objectType !== 'FOLDER') {
                                    if (!temp[res.deployables[i].objectType]) {
                                        temp[res.deployables[i].objectType] = [];
                                        temp[res.deployables[i].objectType].push({
                                            name: res.deployables[i].objectName,
                                            path: res["deployables"][i].folder,
                                            operation: res["deployables"][i].operation
                                        });
                                    }
                                } else {
                                    if (!temp.folders) {
                                        temp.folders = [];
                                        temp.folders.push({
                                            name: res.deployables[i].objectName,
                                            path: res.deployables[i].folder,
                                            operation: res.deployables[i].operation
                                        });
                                    }
                                }
                            }
                        }
                        if (!flag) {
                            array.push(temp);
                        }
                    } else {
                        if (res["deployables"][i].folder !== '/') {
                            if (res.deployables[i].objectType !== 'FOLDER') {
                                if (!temp[res.deployables[i].objectType]) {
                                    temp[res.deployables[i].objectType] = [];
                                    temp[res.deployables[i].objectType].push({
                                        name: res.deployables[i].objectName,
                                        path: res["deployables"][i].folder,
                                        operation: res["deployables"][i].operation
                                    });
                                }
                                array.push(temp);
                            } else {
                                if (!temp.folders) {
                                    temp.folders = [];
                                    temp.folders.push({
                                        name: res.deployables[i].objectName,
                                        path: res.deployables[i].folder,
                                        operation: res.deployables[i].operation
                                    });
                                } else {
                                    temp.folders.push({
                                        name: res.deployables[i].objectName,
                                        path: res.deployables[i].folder,
                                        operation: res.deployables[i].operation
                                    });
                                }
                            }
                        } else {
                            if (res.deployables[i].objectType !== 'FOLDER') {
                                if (!vm.deployables[0][res.deployables[i].objectType]) {
                                    vm.deployables[0][res.deployables[i].objectType] = [];
                                    vm.deployables[0][res.deployables[i].objectType].push({
                                        name: res.deployables[i].objectName,
                                        path: '/',
                                        operation: res.deployables[i].operation
                                    });
                                } else {
                                    vm.deployables[0][res.deployables[i].objectType].push({
                                        name: res.deployables[i].objectName,
                                        path: '/',
                                        operation: res.deployables[i].operation
                                    });
                                }
                            } else {
                                if (vm.deployables[0] && !vm.deployables[0].folders) {
                                    vm.deployables[0].folders = [];
                                    vm.deployables[0].folders.push({
                                        name: res.deployables[i].objectName,
                                        path: res.deployables[i].folder,
                                        operation: res.deployables[i].operation
                                    })
                                }
                            }
                        }
                    }
                }
                let tempArray = [];
                if (array.length > 0) {
                    for (let i = 0; i < array.length; i++) {
                        if (array[i].path != undefined && array[i].path.split('/').length > 2) {
                            tempArray.push(array[i]);
                            array.splice(i, 1);
                            i--;
                        } else if (array[i].path != undefined && array[i].path.split('/').length == 2) {
                            if (array[i].path.split('/')[0] == '') {
                                if (vm.deployables[0].folders == undefined) {
                                    vm.deployables[0].folders = [];
                                    vm.deployables[0].folders.push(array[i]);
                                    array.splice(i, 1);
                                    i--;
                                } else {
                                    if (vm.deployables[0].folders.filter(function (e) {
                                        return e.name == array[i].name
                                    }).length == 0) {
                                        vm.deployables[0].folders.push(array[i]);
                                        array.splice(i, 1);
                                        i--;
                                    } else {
                                        let a = vm.deployables[0].folders.filter(function (e) {
                                            return e.name == array[i].name
                                        });
                                        a[0] = Object.assign(a[0], array[i]);
                                        array.splice(i, 1);
                                        i--;
                                    }
                                }
                            }
                        } else {
                            if (i === 0) {
                                vm.deployables.push(array[i]);
                            } else {
                                vm.deployables.push(array[i]);
                                i--;
                            }
                        }
                    }
                }
                if (!vm.deployables[0].name) {
                    vm.deployables[0].name = '/';
                    vm.deployables[0].path = '/';
                }
                if (!vm.deployables[0].folders) {
                    vm.deployables[0].folders = [];
                }
                if (tempArray.length > 0) {
                    for (let i = 0; i < tempArray.length; i++) {
                        checkFolder(tempArray[i], vm.deployables[0])
                    }
                }
            }
        }

        function checkFolder(obj, node) {
            let pathArray = obj.path.split('/');
            let len = pathArray.length - (pathArray.length - 1);
            if (len < pathArray.length) {
                if (node.folders && node.folders.length > 0) {
                    let a;
                    a = node.folders.filter(function (e) {
                        return e.name == pathArray[len];
                    });
                    if (a.length > 0) {
                        len++;
                        if (!a[0].folders) {
                            a[0].folders = [];
                        }
                        createFolder(a[0], len, obj, pathArray);
                    } else {
                        node.folders.push({name: pathArray[len], path: node.path + pathArray[len], folders: []});
                        len++;
                        createFolder(node.folders[node.folders.length - 1], len, obj, pathArray);
                    }
                } else {
                    if (!node.folders) {
                        node.folders = [];
                    }
                    node.folders.push({name: pathArray[len], path: node.path + pathArray[len], folders: []});
                    len++;
                    createFolder(node.folders[0], len, obj, pathArray);
                }
            } else {
                obj = Object.assign(obj, {folders: []});
                node.folders.push(obj);
            }
        }

        function createFolder(node, len, obj, pathArray) {
            if (len < pathArray.length - 1) {
                if (node.folders && node.folders.length > 0) {
                    let a = node.folders.filter(function (e) {
                        return e.name == pathArray[len];
                    });
                    if (a.length > 0) {
                        len++;
                        if (!a[0].folders) {
                            a[0].folders = [];
                        }
                        createFolder(a[0], len, obj, pathArray);
                    } else {
                        node.folders.push({name: pathArray[len], path: node.path + '/' + pathArray[len], folders: []});
                        len++;
                        createFolder(node.folders[node.folders.length - 1], len, obj, pathArray);
                    }
                } else {
                    if (!node.folders) {
                        node.folders = [];
                    }
                    node.folders.push({name: pathArray[len], path: node.path + '/' + pathArray[len], folders: []});
                    len++;
                    createFolder(node.folders[0], len, obj, pathArray);
                }
            } else {
                obj = Object.assign(obj, {folders: []});
                node.folders.push(obj);
            }
        }

        function recursivelyDeploy() {
            let obj = {};
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.operation = 'Deploy';
                const modalInstance = $uibModal.open({
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
                    recursiveDeploy(obj.auditLog);
                }, function () {
                    vm.deployableObjects = {handleRecursively: true, account: vm.username};
                });
            } else {
                recursiveDeploy();
            }
        }

        function recursiveDeploy(auditLog) {
            vm.isDeploying = true;
            vm.joeConfigFilters.deployedMessages = [];
            let objArr = [], folderArr = [];
            let flag = true;

            if (vm.deployableObjects.handleRecursively) {
                for (let i = 0; i < vm.deployableObjects.folders.length; i++) {
                    if (vm.deployableObjects.folders[i] === '/') {
                        folderArr.push('/');
                        flag = false;
                        break
                    }
                }
            }
            if (flag) {
                for (let i = 0; i < vm.deployableObjects.folders.length; i++) {
                    if (folderArr.length === 0) {
                        folderArr.push(vm.deployableObjects.folders[i]);
                    } else {
                        for (let j = 0; j < folderArr.length; j++) {
                            if (folderArr[j] !== '/' && vm.deployableObjects.folders[i] !== folderArr[j] && vm.deployableObjects.folders[i].match(folderArr[j])) {
                                folderArr.splice(j, 1);
                                break;
                            } else {
                                if (folderArr.indexOf(vm.deployableObjects.folders[i]) === -1)
                                    folderArr.push(vm.deployableObjects.folders[i]);
                            }
                        }
                    }
                }
                isObjectExist('jobs', 'JOB', objArr, folderArr);
                isObjectExist('jobChains', 'JOBCHAIN', objArr, folderArr);
                isObjectExist('orders', 'ORDER', objArr, folderArr);
                isObjectExist('schedules', 'SCHEDULE', objArr, folderArr);
                isObjectExist('processClasses', 'PROCESSCLASS', objArr, folderArr);
                isObjectExist('agentClusters', 'AGENTCLUSTER', objArr, folderArr);
                isObjectExist('locks', 'LOCK', objArr, folderArr);
                isObjectExist('monitors', 'MONITOR', objArr, folderArr);
            }
            if (objArr.length > 0) {
                for (let i = 0; i < objArr.length; i++) {
                    if (auditLog) {
                        objArr[i].auditLog = auditLog;
                    }
                    objArr[i].account = vm.deployableObjects.account;
                    EditorService.deploy(objArr[i]).then(function (res) {
                        if (i === objArr.length - 1) {
                            vm.isDeploying = false;
                        }
                        manageDeployMessages(res, null, true);
                    }, function () {
                        vm.isDeploying = false;
                    });
                }
            }
            if (folderArr.length > 0) {
                for (let i = 0; i < folderArr.length; i++) {
                    let obj = {
                        jobschedulerId: vm.schedulerIds.selected,
                        folder: folderArr[i],
                        recursive: vm.deployableObjects.handleRecursively
                    };
                    if (auditLog) {
                        obj.auditLog = auditLog;
                    }
                    obj.account = vm.deployableObjects.account;
                    EditorService.deploy(obj).then(function (res) {
                        if (i === folderArr.length - 1) {
                            vm.isDeploying = false;
                        }
                        manageDeployMessages(res, null, true);
                    }, function () {
                        vm.isDeploying = false;
                    });
                }
            }
            vm.deployableObjects = {handleRecursively: true, account: vm.username};
        }

        function isObjectExist(type, objectType, objArr, folderArr) {
            if (vm.deployableObjects[type]) {
                for (let i = 0; i < vm.deployableObjects[type].length; i++) {
                    let flag = true;
                    for (let j = 0; j < folderArr.length; j++) {
                        if (vm.deployableObjects[type][i].path.match(folderArr[j])) {
                            flag = false;
                            break;
                        }
                    }
                    if (flag) {
                        objArr.push({
                            jobschedulerId: vm.schedulerIds.selected,
                            objectName: vm.deployableObjects[type][i].name,
                            folder: vm.deployableObjects[type][i].path,
                            objectType: objectType
                        });
                    }
                }
            }
        }

        vm.handleCheckbox = function (data) {
            if (data.type === 'FOLDER') {
                for (let i = 0; i < vm.deployables.length; i++) {
                    let flag = vm.deployables[i].path !== data.path;
                    if (flag) {
                        traverseTreeRecursively(vm.deployables[i], data.path);
                    } else {
                        toggleObject(vm.deployables[i], data.path);
                    }

                }
            } else {
                checkObjectRecursively(data);
            }
        };

        function checkObjectRecursively(data) {
            let mainFolder = null;
            for (let i = 0; i < vm.deployables.length; i++) {
                if (vm.deployables[i].path === data.data.path) {
                    mainFolder = vm.deployables[i];
                } else {
                    recursive(vm.deployables[i].folders, data.data.path);
                }
            }

            function recursive(data, path) {
                for (let i = 0; i < data.length; i++) {
                    if (data[i].path === path) {
                        mainFolder = data[i];
                    } else {
                        recursive(data[i].folders, path);
                    }
                }
            }

            let isExit = false;
            if (!vm.deployableObjects.folders) {
                vm.deployableObjects.folders = [];
            }

            for (let i = 0; i < vm.deployableObjects.folders.length; i++) {
                if (mainFolder && vm.deployableObjects.folders[i] === mainFolder.path) {
                    isExit = true;
                    break;
                }
            }

            if (isExit) {
                if (!checkMissingObject(mainFolder, data.type)) {
                    for (let i = 0; i < vm.deployableObjects.folders.length; i++) {
                        if (vm.deployableObjects.folders[i] === mainFolder.path) {
                            vm.deployableObjects.folders.splice(i, 1);
                            break;
                        }
                    }
                }
            } else {
                let isAdd = true;
                let objectArr = ['JOBCHAIN', 'JOB', 'ORDER', 'PROCESSCLASS', 'AGENTCLUSTER', 'SCHEDULE', 'LOCK', 'MONITOR'];
                if (checkMissingObject(mainFolder, data.type)) {
                    for (let i = 0; i < 8; i++) {
                        if (objectArr[i] !== data.type) {
                            if (mainFolder[objectArr[i]]) {
                                if (!checkMissingObject(mainFolder, objectArr[i])) {
                                    isAdd = false;
                                    break;
                                }
                            }
                        }
                    }

                    if (isAdd) {
                        vm.deployableObjects.folders.push(mainFolder.path);
                    }
                }
            }
        }

        function checkMissingObject(data, type) {
            let objectType = type === 'JOBCHAIN' ? 'jobChains' : type === 'JOB' ? 'jobs' : type === 'ORDER' ? 'orders' : type === 'PROCESSCLASS' ? 'processClasses'
                : type === 'AGENTCLUSTER' ? 'agentClusters' : type === 'SCHEDULE' ? 'schedules' : type === 'MONITOR' ? 'monitors' : 'locks';
            let count = 0;
            if (vm.deployableObjects[objectType] && data[type]) {
                for (let j = 0; j < data[type].length; j++) {
                    for (let i = 0; i < vm.deployableObjects[objectType].length; i++) {
                        if (vm.deployableObjects[objectType][i].path === data[type][j].path && vm.deployableObjects[objectType][i].name === data[type][j].name) {
                            ++count;
                            break;
                        }
                    }
                }
            }
            return data[type].length === count;
        }

        function traverseTreeRecursively(data, path) {
            if (data.folders) {
                for (let i = 0; i < data.folders.length; i++) {
                    if (data.folders[i].path !== path) {
                        traverseTreeRecursively(data.folders[i], path);
                    } else {
                        toggleObject(data.folders[i], path);
                    }
                }
            }
        }

        function toggleObject(data, path) {
            let isChecked = false;
            for (let a = 0; a < vm.deployableObjects.folders.length; a++) {
                if (vm.deployableObjects.folders[a] === path) {
                    isChecked = true;
                    break;
                }
            }
            if (path !== '/') {
                let parent = path.substring(0, path.lastIndexOf('/'));
                if (parent) {
                    for (let i = 0; i < vm.deployables[0].folders.length; i++) {
                        if (vm.deployables[0].folders[i].path === parent) {
                            let parentObject = vm.deployables[0].folders[i];
                            let flag = parentObject.JOB || parentObject.JOBCHAIN || parentObject.ORDER || parentObject.PROCESSCLASS ||
                                parentObject.AGENTCLUSTER || parentObject.SCHEDULE || parentObject.LOCK || parentObject.MONITOR;
                            if (!flag) {
                                let index = vm.deployableObjects.folders.indexOf(parentObject.path);
                                if (!isChecked) {
                                    if (index > -1) {
                                        vm.deployableObjects.folders.splice(index, 1);
                                    }
                                } else {
                                    if (index === -1) {
                                        vm.deployableObjects.folders.push(parentObject.path);
                                    }
                                }
                            }
                            break;
                        }
                    }

                }
            }
            _toggleObject(data, 'JOB', isChecked, 'jobs');
            _toggleObject(data, 'JOBCHAIN', isChecked, 'jobChains');
            _toggleObject(data, 'ORDER', isChecked, 'orders');
            _toggleObject(data, 'PROCESSCLASS', isChecked, 'processClasses');
            _toggleObject(data, 'AGENTCLUSTER', isChecked, 'agentClusters');
            _toggleObject(data, 'SCHEDULE', isChecked, 'schedules');
            _toggleObject(data, 'LOCK', isChecked, 'locks');
            _toggleObject(data, 'MONITOR', isChecked, 'monitors');
            if (vm.deployableObjects.handleRecursively) {
                _toggleFolderObject(data, isChecked);
                for (let i = 0; i < data.folders.length; i++) {
                    toggleObject(data.folders[i], data.folders[i].path);
                }
            }
        }

        function _toggleObject(data, type, isChecked, objectType) {
            if (data[type]) {
                if (!vm.deployableObjects[objectType]) {
                    vm.deployableObjects[objectType] = [];
                }
                for (let j = 0; j < data[type].length; j++) {
                    let flg = true;
                    for (let x = 0; x < vm.deployableObjects[objectType].length; x++) {
                        if ((vm.deployableObjects[objectType][x] && vm.deployableObjects[objectType][x].name === data[type][j].name
                            && vm.deployableObjects[objectType][x].path === data[type][j].path)) {
                            flg = false;
                            if (!isChecked) {
                                vm.deployableObjects[objectType].splice(x, 1);
                            }
                            break;
                        }
                    }
                    if (flg && isChecked) {
                        vm.deployableObjects[objectType].push(data[type][j]);
                    }
                }
            }
        }

        function _toggleFolderObject(data, isChecked) {
            if (data.folders) {
                if (!vm.deployableObjects.folders) {
                    vm.deployableObjects.folders = [];
                }
                for (let j = 0; j < data.folders.length; j++) {
                    let flg = true;
                    for (let x = 0; x < vm.deployableObjects.folders.length; x++) {
                        if ((vm.deployableObjects.folders[x] === data.folders[j].path)) {
                            flg = false;
                            if (!isChecked) {
                                vm.deployableObjects.folders.splice(x, 1);
                            }
                            break;
                        }
                    }
                    if (flg && isChecked) {
                        vm.deployableObjects.folders.push(data.folders[j].path);
                    }
                }
            }
        }

        vm.checkFolderName = function () {
            let isValid = true;
            let reg = ['/', "\\", ':', '<', '>', '|', '?', '*', '"'];
            for (let i = 0; i < reg.length; i++) {
                if (vm.folder.name.indexOf(reg[i]) > -1) {
                    isValid = false;
                    break;
                }
            }
            if (isValid && vm.folder.name.lastIndexOf('.') > -1) {
                isValid = false;
            }
            if (isValid) {
                vm.folder.error = false;
            } else {
                vm.folder.error = true;
                return;
            }
            vm.isUnique = true;
            angular.forEach(vm._folders, function (value) {
                if (vm.folder.name === value.name) {
                    vm.isUnique = false;
                }
            })
        };

        vm.createFolder = function (node) {
            if (vm.permission && vm.permission.JobschedulerMaster && vm.permission.JobschedulerMaster.administration.configurations.edit) {
                vm.folder = {name: ''};
                vm._folders = node.folders;
                vm.isUnique = true;
                let modalInstance = $uibModal.open({
                    templateUrl: 'modules/configuration/views/create-folder-dialog.html',
                    controller: 'DialogCtrl1',
                    scope: vm,
                    size: 'md',
                    backdrop: 'static'
                });
                modalInstance.result.then(function () {
                    let _path = '';
                    if (node.path === '/') {
                        _path = node.path + vm.folder.name;
                    } else {
                        _path = node.path + '/' + vm.folder.name;
                    }
                    EditorService.store({
                        jobschedulerId: vm.schedulerIds.selected,
                        objectType: 'FOLDER',
                        path: _path,
                        configuration: {}
                    }).then(function () {

                    }, function (err) {
                        vm.checkIsFolderLock(err, node.path, function (result) {
                            if (result === 'yes') {
                                EditorService.store({
                                    jobschedulerId: vm.schedulerIds.selected,
                                    objectType: 'FOLDER',
                                    path: _path,
                                    configuration: {}
                                })
                            }
                        });
                    })
                }, function () {

                });
            }
        };

        vm.toXML = function (json, object, cb) {
            EditorService.toXML(json, object).then(function (res) {
                cb(res.data);
            });
        };

        init();

        function updateObjects(data, cb) {
            let flag = true, arr = [];
            if (!data.folders) {
                data.folders = [];
            } else {
                if (data.folders[0].object) {
                    flag = false;
                    for (let i = 0; i < data.folders.length; i++) {
                        if (data.folders[i].object) {
                            arr.push(data.folders[i])
                        } else {
                            break;
                        }
                    }
                }
            }

            if (flag) {
                arr = [{name: 'Jobs', object: 'JOB', children: [], parent: data.path},
                    {name: 'Job Chains', object: 'JOBCHAIN', children: [], parent: data.path},
                    {name: 'Orders', object: 'ORDER', children: [], parent: data.path},
                    {name: 'Process Classes', object: 'PROCESSCLASS', children: [], parent: data.path},
                    {name: 'Agent Clusters', object: 'AGENTCLUSTER', children: [], parent: data.path},
                    {name: 'Schedules', object: 'SCHEDULE', children: [], parent: data.path},
                    {name: 'Locks', object: 'LOCK', children: [], parent: data.path},
                    {name: 'Pre/Post Processing', object: 'MONITOR', children: [], parent: data.path}];

                data.folders = arr.concat(data.folders);
            }

            EditorService.getFolder({
                jobschedulerId: vm.schedulerIds.selected,
                path: data.path
            }).then(function (res) {
                for (let i = 0; i < arr.length; i++) {
                    if (arr[i].object === 'JOB') {
                        if (res.jobs) {
                            if (!flag) {
                                mergeFolderData(res.jobs, arr[i], 'JOB');
                            } else {
                                arr[i].children = orderBy(res.jobs, 'name');
                                angular.forEach(arr[i].children, function (child, index) {
                                    arr[i].children[index].type = arr[i].object;
                                    arr[i].children[index].children = [{
                                        name: 'Commands',
                                        param: 'COMMAND'
                                    }, {name: 'Pre/Post Processing', param: 'MONITOR'}];
                                });
                            }
                        } else {
                            arr[i].children = [];
                        }
                    }
                    if (arr[i].object === 'JOBCHAIN') {
                        if (res.jobChains) {
                            if (!flag) {
                                mergeFolderData(res.jobChains, arr[i], 'JOBCHAIN');
                            } else {
                                arr[i].children = orderBy(res.jobChains, 'name');
                                angular.forEach(arr[i].children, function (child, index) {
                                    arr[i].children[index].type = arr[i].object;
                                    arr[i].children[index].children = [
                                        {name: 'Steps/Nodes', param: 'STEPSNODES'},
                                        {name: 'Orders', param: 'ORDER'},
                                        {name: 'File Order Source', param: 'FILEORDER'}];
                                });
                            }
                        } else {
                            arr[i].children = [];
                        }
                    }
                    if (arr[i].object === 'ORDER') {
                        if (res.orders) {
                            if (!flag) {
                                mergeFolderData(res.orders, arr[i], 'ORDER');
                            } else {
                                angular.forEach(res.orders, function (child) {
                                    let split = child.name.split(',');
                                    if (split.length > 1) {
                                        child.orderId = split[1];
                                        child.jobChain = split[0];
                                    } else {
                                        child.orderId = split[0];
                                    }
                                });
                                arr[i].children = orderBy(res.orders, 'orderId');
                            }
                        } else {
                            arr[i].children = [];
                        }
                    }
                    if (arr[i].object === 'LOCK') {
                        if (res.locks) {
                            if (!flag) {
                                mergeFolderData(res.locks, arr[i], 'LOCK');
                            } else {
                                arr[i].children = orderBy(res.locks, 'name');
                            }
                        } else {
                            arr[i].children = [];
                        }
                    }
                    if (arr[i].object === 'PROCESSCLASS') {
                        if (res.processClasses) {
                            if (!flag) {
                                mergeFolderData(res.processClasses, arr[i], 'PROCESSCLASS');
                            } else {
                                arr[i].children = orderBy(res.processClasses, 'name');
                            }
                        } else {
                            arr[i].children = [];
                        }
                    }
                    if (arr[i].object === 'AGENTCLUSTER') {
                        if (res.agentClusters) {
                            if (!flag) {
                                mergeFolderData(res.agentClusters, arr[i], 'AGENTCLUSTER');
                            } else {
                                arr[i].children = orderBy(res.agentClusters, 'name');
                            }
                        } else {
                            arr[i].children = [];
                        }
                    }
                    if (arr[i].object === 'SCHEDULE') {
                        if (res.schedules) {
                            if (!flag) {
                                mergeFolderData(res.schedules, arr[i], 'SCHEDULE');
                            } else {
                                arr[i].children = orderBy(res.schedules, 'name');
                            }
                        } else {
                            arr[i].children = [];
                        }
                    }
                    if (arr[i].object === 'MONITOR') {
                        if (res.monitors) {
                            if (!flag) {
                                mergeFolderData(res.monitors, arr[i], 'MONITOR');
                            } else {
                                arr[i].children = orderBy(res.monitors, 'name');
                            }
                        } else {
                            arr[i].children = [];
                        }
                    }
                    if (arr[i].object !== 'JOB' && arr[i].object !== 'JOBCHAIN') {
                        angular.forEach(arr[i].children, function (child, index) {
                            arr[i].children[index].type = arr[i].object;
                        });
                    }
                    if (data.lockedBy) {
                        if (data.lockedBy !== vm.username) {
                            arr[i].lockedByUser = data.lockedBy;
                        }
                        arr[i].lockedSince = data.lockedSince;
                    }
                }
                $('[data-toggle="tooltip"]').tooltip();
                if (cb) {
                    cb();
                }
            }, function () {
                $('[data-toggle="tooltip"]').tooltip();
                if (cb) {
                    cb();
                }
            });
        }

        function mergeFolderData(sour, dest, type) {
            if (type === 'ORDER') {
                angular.forEach(sour, function (child) {
                    let split = child.name.split(',');
                    if (split.length > 1) {
                        child.orderId = split[1];
                        child.jobChain = split[0];
                    } else {
                        child.orderId = split[0];
                    }
                });
            }
            for (let i = 0; i < dest.children.length; i++) {
                for (let j = 0; j < sour.length; j++) {
                    if (dest.children[i].name === sour[j].name) {
                        dest.children[i].deleted = sour[j].deleted;
                        dest.children[i].deployed = sour[j].deployed;
                        if (lastClickedItem && lastClickedItem.name === dest.children[i].name && lastClickedItem.path === dest.children[i].path && lastClickedItem.type === type && type === 'JOB') {
                            sour[j].isOrderJob = dest.children[i].isOrderJob;
                        } else {
                            dest.children[i] = angular.merge(dest.children[i], sour[j]);
                        }
                        if (type === 'JOB') {
                            dest.children[i].isOrderJob = sour[j].isOrderJob;
                            if (dest.children[i].isOrderJob === true) {
                                dest.children[i].isOrderJob = 'yes';
                            } else if (dest.children[i].isOrderJob === false) {
                                dest.children[i].isOrderJob = 'no';
                            }
                        }
                        dest.children[i].match = true;
                        sour.splice(j, 1);
                        break;
                    }
                }
            }
            for (let i = dest.children.length - 1; i >= 0; i--) {
                if (dest.children[i].match) {
                    delete dest.children[i]['match'];
                } else {
                    dest.children.splice(i, 1);
                }
            }
            if (sour.length > 0) {
                if (type === 'JOB' || type === 'JOBCHAIN') {
                    angular.forEach(sour, function (child, index) {
                        sour[index].type = type;
                        if (type === 'JOB') {
                            sour[index].children = [{
                                name: 'Commands',
                                param: 'COMMAND'
                            }, {name: 'Pre/Post Processing', param: 'MONITOR'}];
                        } else {
                            sour[index].children = [{
                                name: 'Steps/Nodes',
                                param: 'STEPSNODES'
                            }, {name: 'Orders', param: 'ORDER'}, {name: 'File Order Source', param: 'FILEORDER'}];
                        }
                        if (type === 'JOB') {
                            if (child.isOrderJob === true) {
                                child.isOrderJob = 'yes';
                            } else if (child.isOrderJob === false) {
                                child.isOrderJob = 'no';
                            }
                        }
                    });
                }
                dest.children = dest.children.concat(sour);
            }

            if (type === 'ORDER') {
                dest.children = orderBy(dest.children, 'orderId');
            } else {
                dest.children = orderBy(dest.children, 'name');
            }
        }

        function updateFolders(path, cb) {
            let isMatch = false, isCallback = false, lastData = null;
            if (vm.tree.length > 0) {
                function traverseTree(data, parent) {
                    if (path && data.path && (path === data.path || data.path === path.substring(0, path.length - 1))) {
                        updateObjects(data, function () {
                            if ((vm.path === path || vm.path === path.substring(0, path.length - 1)) && (vm.type || vm.param)) {
                                vm.$broadcast('RELOAD', data);
                            }
                        });
                        lastData = data;
                        isMatch = true;
                    }
                    if (data.folders) {
                        for (let i = 0; i < data.folders.length; i++) {
                            if (data.folders[i].selected1 && cb) {
                                isMatch = true;
                                updateObjects(parent);
                                isCallback = true;
                                cb({child: data.folders[i], parent: data, superParent: parent});
                            }
                            if (!isMatch) {
                                traverseTree(data.folders[i], data);
                            }
                        }
                    } else {
                        if (data.children) {
                            for (let i = 0; i < data.children.length; i++) {
                                if (data.children[i].selected1 && cb) {
                                    isMatch = true;
                                    updateObjects(parent);
                                    isCallback = true;
                                    cb({child: data.children[i], parent: data, superParent: parent});
                                    if ((vm.type && (data.children[i].type === vm.type)) || (vm.param && (data.children[i].param === vm.param))) {
                                        break;
                                    }
                                }
                                if (!isMatch) {
                                    traverseTree(data.children[i], parent);
                                }
                            }
                        }
                    }
                }

                traverseTree(vm.tree[0], vm.tree[0]);
            }
            if (cb && !isCallback) {
                vm.isLoading = false;
                for (let i = 0; i < lastData.folders.length; i++) {
                    if (vm.type) {
                        if (lastData.folders[i].object === vm.type) {
                            for (let j = 0; j < lastData.folders[i].children.length; j++) {
                                if (lastData.folders[i].children[j].selected1) {
                                    cb({
                                        child: lastData.folders[i].children[j],
                                        parent: lastData.folders[i],
                                        superParent: lastData
                                    });
                                    break;
                                }
                            }
                            break;
                        }
                    } else {
                        if ((lastData.folders[i].object === 'JOB' && (vm.param === 'COMMAND' || vm.param === 'MONITOR')) ||
                            (lastData.folders[i].object === 'JOBCHAIN' && (vm.param === 'STEPSNODES' || vm.param === 'ORDER' || vm.param === 'FILEORDER'))) {
                            for (let j = 0; j < lastData.folders[i].children.length; j++) {
                                for (let x = 0; x < lastData.folders[i].children[j].children.length; x++) {
                                    if (lastData.folders[i].children[j].children[x].selected1) {
                                        cb({
                                            child: lastData.folders[i].children[j].children[x],
                                            parent: lastData.folders[i].children[j],
                                            superParent: lastData
                                        });
                                        break;
                                    }
                                }
                            }
                            break;
                        }
                    }
                }
            }
        }

        vm.expandNode = function (data) {
            if (!data.children) {
                updateObjects(data);
            }
        };

        vm.navToObject = function (obj, path, type) {
            vm.isLoading = true;
            vm.isBackAvailable = {
                object: obj,
                path: vm.path,
                param: vm.param
            };
            obj.selected1 = false;
            let isMatch = false;
            let pathArr = [];
            if (path.indexOf('/') > -1) {
                let arr = path.split('/');
                for (let i = 0; i < arr.length - 1; i++) {
                    if (arr[i]) {
                        if (i > 0 && arr[i - 1]) {
                            pathArr.push('/' + arr[i - 1] + '/' + arr[i]);
                        } else {
                            pathArr.push('/' + arr[i])
                        }
                    }
                }

                traverseTree(vm.tree[0], path.substring(0, path.lastIndexOf('/')) || '/');
            } else {
                traverseTree(vm.tree[0], obj.path || vm.path, 'current');
            }

            function traverseTree(data, _path, isCurrentFolder) {
                if (data.path === _path) {
                    data.expanded = true;
                    updateObjects(data, function () {
                        for (let x = 0; x < data.folders.length; x++) {
                            let flg = false;
                            if (data.folders[x].object === type || (type === 'PROCESSCLASS' && data.folders[x].object === 'AGENTCLUSTER')) {
                                if (data.folders[x].children) {
                                    for (let y = 0; y < data.folders[x].children.length; y++) {
                                        if (isCurrentFolder && path === data.folders[x].children[y].name) {
                                            navToSelectedObject(data, x, y);
                                            flg = true;
                                            break
                                        }
                                        if ((data.folders[x].parent + '/' + data.folders[x].children[y].name) === path || (data.folders[x].parent + data.folders[x].children[y].name) === path) {
                                            navToSelectedObject(data, x, y);
                                            flg = true;
                                            break
                                        }
                                    }
                                }
                            }
                            if (flg) {
                                break;
                            }
                        }
                    });
                    isMatch = true;
                }

                if (pathArr.length > 0 && pathArr.indexOf(data.path) > -1) {
                    data.expanded = true;
                    vm.expandNode(data);
                }

                if (data.folders) {

                    for (let i = 0; i < data.folders.length; i++) {
                        if (data.folders[i]) {
                            if (data.path === vm.path) {
                                data.folders[i].selected1 = false;
                                if (data.folders[i].object === obj.type) {
                                    for (let j = 0; j < data.folders[i].children.length; j++) {
                                        if (data.folders[i].children[j].name === obj.name) {
                                            data.folders[i].children[j].selected1 = false;
                                            if (data.folders[i].children[j].children) {
                                                for (let x = 0; x < data.folders[i].children[j].children.length; x++) {
                                                    data.folders[i].children[j].children[x].selected1 = false;
                                                }
                                            }
                                            break;
                                        }
                                    }
                                }
                            }
                            if (!isMatch) {
                                traverseTree(data.folders[i], _path, isCurrentFolder);
                            }
                        }
                    }
                }
            }
        };

        function navToSelectedObject(data, x, y, param, showList) {
            let paramIndex = 0;
            vm.param = param;
            if (param) {
                vm.type = undefined;
                for (let i = 0; i < data.folders[x].children[y].children.length; i++) {
                    if (data.folders[x].children[y].children[i].param === param) {
                        paramIndex = i;
                        data.folders[x].children[y].expanded = true;
                        break;
                    }
                }
            } else {
                vm.type = data.folders[x].object;
            }
            data.folders[x].expanded = true;
            vm.path = data.path;
            if (!showList) {
                vm.getFileObject(data.folders[x].children[y], data.path, function () {
                    vm.isLoading = false;
                    if (param) {
                        data.folders[x].children[y].children[paramIndex].selected1 = true;
                        vm.$broadcast('NEW_PARAM', {
                            object: data.folders[x].children[y].children[paramIndex],
                            parent: data.folders[x].children[y],
                            superParent: data
                        })
                    } else {
                        data.folders[x].children[y].selected1 = true;
                        vm.$broadcast('NEW_OBJECT', {
                            data: data.folders[x].children[y],
                            parent: data
                        })
                    }
                });
            } else {
                data.folders[x].selected1 = true;
                setTimeout(function () {
                    vm.isLoading = false;
                    vm.$broadcast('NEW_OBJECT', {
                        data: data.folders[x],
                        parent: data
                    })
                }, 70)
            }
        }

        vm.navFullTree = function (path, type) {
            for (let i = 0; i < vm.tree.length; i++) {
                vm.tree[i].selected1 = false;
                if (vm.tree[i].expanded) {
                    traverseTree1(vm.tree[i], path, type);
                }
            }
        };

        function traverseTree1(data, path, type) {
            if (data.path === path) {
                data.expanded = true;
            }
            if (data.folders) {
                for (let i = 0; i < data.folders.length; i++) {
                    if (data.folders[i]) {
                        if (data.folders[i].object === type && data.path === path) {
                            data.folders[i].expanded = true;
                        }
                        data.folders[i].selected1 = false;
                        if (data.folders[i].expanded) {
                            traverseTree1(data.folders[i], path, type);
                        }
                    }
                }
            } else {
                if (data.children) {
                    for (let i = 0; i < data.children.length; i++) {
                        data.children[i].selected1 = false;
                        if (data.children[i].expanded) {
                            traverseTree1(data.children[i], path, type);
                        }
                    }
                }
            }
        }

        let lastClickedItem = null,
            defaultObjects = ['name', 'deleted', 'deployed', 'selected1', 'children', 'type', 'expanded', 'orderId', 'jobChain', '$$hashKey'];

        vm.setLastSection = function (obj) {
            lastClickedItem = obj;
        };

        vm.removeSection = function () {
            vm.type = null;
            vm.param = null;
        };

        vm.getFileObject = function (obj, path, cb) {
            if (!obj.type) {
                return;
            }
            let _path;
            if (!path) {
                path = vm.path;
            }
            if (path === '/') {
                _path = path + obj.name;
            } else {
                _path = path + '/' + obj.name;
            }
            if (path) {
                EditorService.getFile({
                    jobschedulerId: vm.schedulerIds.selected,
                    path: _path,
                    objectType: obj.type,
                    forceLive: obj.forceLive
                }).then(function (res) {
                    refactorJSONObject(obj, res.configuration, res.objectVersionStatus.message._messageCode, path);
                    if (cb) {
                        cb(obj);
                    }
                }, function () {
                    if (cb) {
                        cb();
                    }
                });
            }
        };

        function refactorJSONObject(obj, configuration, message, path) {
            for (let propName in obj) {
                if (typeof propName === 'string' && defaultObjects.indexOf(propName) === -1) {
                    delete obj[propName];
                }
            }
            obj = angular.merge(obj, configuration);
            obj.message = message;
            obj.path = path;
            if (obj.type === 'JOBCHAIN') {
                if (obj.ordersRecoverable === 'yes' || obj.ordersRecoverable === 'true' || obj.ordersRecoverable === '1' || obj.ordersRecoverable === true) {
                    obj.ordersRecoverable = true;
                }
                if (obj.distributed === 'yes' || obj.distributed === 'true' || obj.distributed === '1' || obj.distributed === true) {
                    obj.distributed = true;
                }
            } else if (obj.type === 'JOB') {
                if (obj.enabled === 'no' || obj.enabled === 'false' || obj.enabled === '0' || obj.enabled === false) {
                    obj.disabled = true;
                }
                if (obj.isOrderJob === 'true' || obj.isOrderJob === '1' || obj.isOrderJob === 'yes' || obj.isOrderJob === true) {
                    obj.isOrderJob = 'yes';
                } else {
                    obj.isOrderJob = 'no';
                }

                obj.loadUserProfile = obj.loadUserProfile === 'yes' || obj.loadUserProfile === '1' || obj.loadUserProfile === 'true' || obj.loadUserProfile === true;
                obj.forceIdleTimeout = obj.forceIdleTimeout === 'yes' || obj.forceIdleTimeout === '1' || obj.forceIdleTimeout === 'true' || obj.forceIdleTimeout === true;
                obj.stopOnError = obj.stopOnError === 'yes' || obj.stopOnError === '1' || obj.stopOnError === 'true' || obj.stopOnError === true;
                if (obj.settings) {
                    if (obj.settings.mailOnError) {
                        if (obj.settings.mailOnError === 'yes' || obj.settings.mailOnError === '1' || obj.settings.mailOnError === 'true' || obj.settings.mailOnError === true) {
                            obj.settings.mailOnError = 'yes';
                        } else {
                            obj.settings.mailOnError = 'no';
                        }
                    }
                    if (obj.settings.mailOnWarning) {
                        if (obj.settings.mailOnWarning === 'yes' || obj.settings.mailOnWarning === '1' || obj.settings.mailOnWarning === 'true' || obj.settings.mailOnWarning === true) {
                            obj.settings.mailOnWarning = 'yes';
                        } else {
                            obj.settings.mailOnWarning = 'no';
                        }
                    }
                    if (obj.settings.mailOnSuccess) {
                        if (obj.settings.mailOnSuccess === 'yes' || obj.settings.mailOnSuccess === '1' || obj.settings.mailOnSuccess === 'true' || obj.settings.mailOnSuccess === true) {
                            obj.settings.mailOnSuccess = 'yes';
                        } else {
                            obj.settings.mailOnSuccess = 'no';
                        }
                    }
                    if (obj.settings.mailOnProcess) {
                        if (obj.settings.mailOnProcess === 'yes' || obj.settings.mailOnProcess === 'true' || obj.settings.mailOnProcess === '1' || obj.settings.mailOnProcess === true) {
                            obj.settings.mailOnProcess = 'yes';
                        } else {
                            obj.settings.mailOnProcess = 'no';
                        }
                    }
                    if (obj.settings.histroy) {
                        if (obj.settings.histroy === 'yes' || obj.settings.histroy === 'true' || obj.settings.histroy === '1' || obj.settings.histroy === true) {
                            obj.settings.histroy = 'yes';
                        } else {
                            obj.settings.histroy = 'no';
                        }
                    }
                }
                if (obj.ignoreSignals && typeof obj.ignoreSignals == 'string') {
                    obj.ignoreSignals = obj.ignoreSignals.split(/\s+/);
                }

            } else if (obj.type === 'ORDER') {
                if (obj.priority)
                    obj.priority = parseInt(obj.priority);
            }
            if (obj.script && obj.script.content && obj.script.content && obj.script.language) {
                obj.script.content = EditorService.highlight(EditorService.setLanguage(obj.script.language), obj.script.content);
            }
            if (obj.monitors && obj.monitors.length > 0) {
                for (let i = 0; i < obj.monitors.length; i++) {
                    if (obj.monitors[i].script && obj.monitors[i].script.content && obj.monitors[i].script.content) {
                        obj.monitors[i].script.content = EditorService.highlight(EditorService.setLanguage(obj.monitors[i].script.content), obj.monitors[i].script.content);
                    }
                }
            }
        }

        vm.treeHandler = function (data, evt) {
            if (data.folders || data.deleted || !(data.object || data.type || data.param)) {
                return;
            }
            if (lastClickedItem) {
                if (lastClickedItem.type === data.type && vm.type) {
                    if (angular.equals(angular.toJson(lastClickedItem), angular.toJson(data))) {
                        return;
                    }
                } else if (vm.param === data.param) {
                    if (angular.equals(angular.toJson(lastClickedItem), angular.toJson(evt.$parentNodeScope.$modelValue))) {
                        return;
                    }
                }
            }

            vm.isBackAvailable = {};
            vm.isLoading = true;
            lastClickedItem = null;
            vm.copyData = null;
            if (vm.userPreferences.expandOption === 'both' && !data.type) {
                data.expanded = true;
            }
            vm.navFullTree();
            data.selected1 = true;
            vm.type = data.object || data.type;

            let _path = '';
            if (data.object) {
                _path = data.parent;
            } else {
                if (evt.$parentNodeScope.$modelValue && evt.$parentNodeScope.$modelValue.path) {
                    _path = evt.$parentNodeScope.$modelValue.parent || evt.$parentNodeScope.$modelValue.path;
                } else if (evt.$parentNodeScope.$parentNodeScope && evt.$parentNodeScope.$parentNodeScope.$modelValue) {
                    _path = evt.$parentNodeScope.$parentNodeScope.$modelValue.parent || evt.$parentNodeScope.$parentNodeScope.$modelValue.path;
                }
            }
            if (data.param) {
                vm.param = data.param;
            } else {
                vm.param = undefined;
            }
            vm.path = _path;

            if (data.type) {
                vm.getFileObject(data, _path, function () {
                    broadcastData(data, evt);
                })
            } else {
                if (_path && evt.$parentNodeScope.$modelValue && evt.$parentNodeScope.$modelValue.type) {
                    vm.getFileObject(evt.$parentNodeScope.$modelValue, _path, function () {
                        broadcastData(data, evt);
                    })
                } else {
                    setTimeout(function () {
                        broadcastData(data, evt);
                    }, 70);
                }
            }
        };

        vm.openStepsNode = function () {
            navToObjectChild('STEPSNODES', 0);
        };

        vm.openOrder = function () {
            navToObjectChild('ORDER', 1);
        };

        vm.openFileOrder = function () {
            navToObjectChild('FILEORDER', 2);
        };

        vm.openCommands= function () {
            navToObjectChild('COMMAND', 0);
        };

        vm.openMonitor= function () {
            navToObjectChild('MONITOR', 1);
        };

        function navToObjectChild(param, index) {
            vm.type = null;
            vm.param = param;
            lastClickedItem.selected1 = false;
            lastClickedItem.expanded = true;
            let obj = {object: lastClickedItem.children[index], parent: lastClickedItem};
            for (let i = 0; i < vm.tree.length; i++) {
                if (vm.tree[i].path !== lastClickedItem.path) {
                    traverseTree(vm.tree[i]);
                } else {
                    obj.superParent = vm.tree[i];
                }
            }

            function traverseTree(data) {
                if (data.folders) {
                    for (let i = 0; i < data.folders.length; i++) {
                        if (data.folders[i]) {
                            if (data.folders[i].path !== lastClickedItem.path) {
                                traverseTree(data.folders[i]);
                            } else {
                                obj.superParent = data.folders[i];
                            }
                        }
                    }
                }
            }

            obj.object.selected1 = true;
            setTimeout(function () {
                vm.$broadcast('NEW_PARAM', obj)
            }, 70);
        }

        function broadcastData(data, evt) {
            vm.isLoading = false;
            if (data.param && evt.$parentNodeScope && evt.$parentNodeScope.$modelValue) {
                let obj = {object: data, parent: evt.$parentNodeScope.$modelValue};
                if (evt.$parentNodeScope.$parentNodeScope && evt.$parentNodeScope.$parentNodeScope.$parentNodeScope) {
                    obj.superParent = evt.$parentNodeScope.$parentNodeScope.$parentNodeScope.$modelValue;
                }
                vm.$broadcast('NEW_PARAM', obj)
            } else {
                vm.$broadcast('NEW_OBJECT', {
                    data: data,
                    parent: evt.$parentNodeScope.$modelValue.object ? evt.$parentNodeScope.$parentNodeScope.$modelValue : evt.$parentNodeScope.$modelValue
                });
            }
        }

        vm.toggleTree = function (data) {
            data.expanded = !data.expanded;
        };

        vm.getName = function (list, name, key, type) {
            if (list.length === 0) {
                return name;
            } else {
                let arr = [];
                list.forEach(function (element) {
                    if (element[key]) {
                        arr.push(element[key].split(/(\d+)(?!.*\d)/)[1]);
                    }
                });
                let large = arr[arr.length - 1] || 0;
                for (let i = 1; i < arr.length; i++) {
                    if (large < parseInt(arr[i])) {
                        large = parseInt(arr[i]);
                    }
                }
                large++;
                if (!angular.isNumber(large) || isNaN(large)) {
                    large = 0;
                }
                return (type + large);
            }
        };

        vm.isOrderJob = function (job) {
            return job.isOrderJob === 'true' || job.isOrderJob === true || job.isOrderJob === 'yes' || job.isOrderJob == '1';
        };

        vm.addJob  = function (object, evt, isOrderJob) {
            vm.createNewJob(object.children, isOrderJob, object.parent, evt);
        };

        vm.addObject = function (object, evt) {
            object.expanded = true;
            if (object.object === 'JOBCHAIN') {
                vm.createNewJobChain(object.children, object.parent, evt);
            } else if (object.object === 'PROCESSCLASS') {
                vm.createNewProcessClass(object.children, object.parent, evt);
            } else if (object.object === 'AGENTCLUSTER') {
                vm.createNewAgentCluster(object.children, object.parent, evt);
            } else if (object.param === 'ORDER') {
                vm.createNewOrder(object, null, object.parent, evt);
            } else if (object.object === 'LOCK') {
                vm.createNewLock(object.children, object.parent, evt);
            } else if (object.object === 'SCHEDULE') {
                vm.createNewSchedule(object.children, object.parent, evt);
            } else if (object.object === 'MONITOR') {
                vm.createNewMonitor(object.children, object.parent, evt);
            }
        };

        vm.newObject = function (node, type) {
            node.expanded = true;
            let object;
            if (node.folders && node.folders.length > 0) {
                for (let i = 0; i < node.folders.length; i++) {
                    if (node.folders[i].object) {
                        if (node.folders[i].object === type) {
                            object = node.folders[i];
                            break;
                        }
                    } else {
                        break;
                    }
                }
            }

            if (object) {
                vm.addObject(object, node);
            } else {
                updateObjects(node, function () {
                    for (let i = 0; i < node.folders.length; i++) {
                        if (node.folders[i].object === type) {
                            object = node.folders[i];
                            break;
                        }
                    }
                    vm.addObject(object, node);
                });
            }
        };

        /**
         * Function: Add JITL jobs
         */
        vm.openWizard = function (object, path, evt) {
            vm.childrens = object.children || object;
            let modalInstance = $uibModal.open({
                templateUrl: 'modules/configuration/views/job-wizard-dialog.html',
                controller: 'WizardCtrl',
                scope: $scope,
                backdrop: 'static',
                size: 'lg'
            });
            modalInstance.result.then(function (job) {
                let params = [];
                if(job.params && job.params.length > 0){
                    for(let i=0; i < job.params.length;i++){
                        params.push({name :job.params[i].name, value :job.params[i].newValue})
                    }
                }
                if (job.paramList && job.paramList.length > 0) {
                    for(let i=0; i < job.paramList.length;i++){
                        params.push({name :job.paramList[i].name, value :job.paramList[i].newValue})
                    }
                }
                let obj = {
                    name: job.newName,
                    isOrderJob: job.type === 'order',
                    script: {language: 'java', 'javaClass': job.javaClass},
                    docPath: job.docPath,
                    type: 'JOB',
                    parent: object.parent || path,
                    children: [{name: 'Commands', param: 'COMMAND'}, {name: 'Pre/Post Processing', param: 'MONITOR'}]
                };
                vm.storeObject(obj, {
                    isOrderJob: obj.isOrderJob,
                    script: obj.script,
                    params: {paramList: params}
                }, evt, function (result) {
                    if (!result) {
                        if (object.children) {
                            object.children.push(obj);
                        } else {
                            object.push(obj);
                        }

                    }
                });
            }, function () {

            });
        };

        vm.releaseLock = function (obj) {
            if (obj.lockedBy === vm.username) {
                EditorService.releaseLock({jobschedulerId: vm.schedulerIds.selected, path: obj.path}).then(function () {
                    obj.lockedBy = null;
                });
            } else {
                EditorService.lockInfo({jobschedulerId: vm.schedulerIds.selected, path: obj.path}).then(function (res) {
                    if (!vm.overTake) {
                        vm.overTake = res;
                        let modalInstance = $uibModal.open({
                            templateUrl: 'modules/configuration/views/confirmation-dialog.html',
                            controller: 'DialogCtrl1',
                            scope: vm,
                            backdrop: 'static'
                        });
                        modalInstance.result.then(function (res) {
                            if (res === 'yes') {
                                EditorService.releaseLock({
                                    jobschedulerId: vm.schedulerIds.selected,
                                    path: obj.path,
                                    forceLock: true
                                }).then(function () {
                                    obj.lockedBy = null;
                                });
                            }
                            vm.overTake = null;
                        }, function () {
                            vm.overTake = null;
                        });
                    }
                });
            }
        };

        vm.lockObject = function (obj) {
            if (obj && obj.path) {
                EditorService.lock({jobschedulerId: vm.schedulerIds.selected, path: obj.path});
            }
        };

        vm.createNewJob = function (list, isOrderJob, parent, evt) {
            let obj = {
                name: vm.getName(list, 'job1', 'name', 'job'),
                isOrderJob: isOrderJob,
                script: {language: 'shell'},
                type: 'JOB',
                children: [{name: 'Commands', param: 'COMMAND'}, {name: 'Pre/Post Processing', param: 'MONITOR'}]
            };
            obj.parent = parent;
            vm.storeObject(obj, {isOrderJob: isOrderJob, script: {language: 'shell'}}, evt, function (result) {
                if (!result) {
                    list.push(obj);
                }
            });
        };

        vm.createNewJobChain = function (list, parent, evt) {
            let obj = {
                name: vm.getName(list, 'job_chain1', 'name', 'job_chain'),
                ordersRecoverable: true,
                type: 'JOBCHAIN',
                children: [{name: 'Steps/Nodes', param: 'STEPSNODES'}, {
                    name: 'Orders',
                    param: 'ORDER'
                }, {name: 'File Order Source', param: 'FILEORDER'}]
            };
            obj.parent = parent;
            vm.storeObject(obj, {ordersRecoverable: obj.ordersRecoverable}, evt, function (result) {
                if (!result)
                    list.push(obj);
            });
        };

        vm.createNewProcessClass = function (list, parent, evt) {
            let obj = {
                name: vm.getName(list, 'p1', 'name', 'p'),
                maxProcesses: 1,
                type: 'PROCESSCLASS',
            };

            obj.parent = parent;
            vm.storeObject(obj, {maxProcesses: obj.maxProcesses}, evt, function (result) {
                if (!result)
                    list.push(obj);
            });
        };

        vm.createNewAgentCluster = function (list, parent, evt) {
            let obj = {
                name: vm.getName(list, 'agent1', 'name', 'agent'),
                maxProcesses: 1,
                type: 'AGENTCLUSTER',
            };
            obj.parent = parent;
            vm.storeObject(obj, {maxProcesses: obj.maxProcesses}, evt, function (result) {
                if (!result)
                    list.push(obj);
            });
        };

        vm.createNewOrder = function (list, jobChain, parent, evt) {
            if (vm.permission && vm.permission.JobschedulerMaster && vm.permission.JobschedulerMaster.administration.configurations.edit) {
                let orders = [];
                if (evt) {
                    if (evt.$parentNodeScope && evt.$parentNodeScope.$parentNodeScope && evt.$parentNodeScope.$parentNodeScope.$parentNodeScope && evt.$parentNodeScope.$parentNodeScope.$parentNodeScope.$modelValue) {
                        let list = evt.$parentNodeScope.$parentNodeScope.$parentNodeScope.$modelValue.folders;
                        jobChain = evt.$parentNodeScope.$modelValue;
                        parent = evt.$parentNodeScope.$parentNodeScope.$parentNodeScope.$modelValue.path;
                        if (list && list.length > 2 && list[2].object === 'ORDER') {
                            for (let j = 0; j < list[2].children.length; j++) {
                                if (list[2].children[j].jobChain === jobChain.name) {
                                    orders.push(list[2].children[j]);
                                }
                            }
                        }
                    }
                } else {
                    orders = list;
                }
                let obj = {
                    name: vm.getName(orders, '1', 'orderId', ''),
                    type: 'ORDER'
                };
                obj.orderId = obj.name;
                if (jobChain) {
                    obj.jobChain = jobChain.name;
                    obj.name = obj.jobChain + ',' + obj.name;
                }
                obj.parent = parent;
                if (evt) {
                    vm.navFullTree();
                    list.selected1 = true;
                    vm.type = null;
                    vm.param = 'ORDER';
                    let _path = '';
                    if (parent === '/') {
                        _path = parent + obj.name;
                    } else {
                        _path = parent + '/' + obj.name;
                    }
                    EditorService.store({
                        jobschedulerId: vm.schedulerIds.selected,
                        objectType: obj.type,
                        path: _path,
                        configuration: {}
                    }).then(function () {
                        orders.push(obj);
                        navToOrderTab(obj, evt);
                    }, function (err) {
                        vm.checkIsFolderLock(err, parent, function (result) {
                            if (result === 'yes') {
                                EditorService.store({
                                    jobschedulerId: vm.schedulerIds.selected,
                                    objectType: obj.type,
                                    path: _path,
                                    configuration: {}
                                }).then(function () {
                                    orders.push(obj);
                                    navToOrderTab(obj, evt);
                                });
                            }
                        });
                    });
                } else {
                    vm.storeObject(obj, {}, evt, function (result) {
                        if (!result) {
                            list.push(obj);
                        }
                    });
                }
            }
        };

        function navToOrderTab(obj, evt) {
            vm.getFileObject(obj, obj.parent, function () {
                let _obj = {object: obj, parent: evt.$parentNodeScope.$modelValue};
                if (evt.$parentNodeScope.$parentNodeScope && evt.$parentNodeScope.$parentNodeScope.$parentNodeScope) {
                    _obj.superParent = evt.$parentNodeScope.$parentNodeScope.$parentNodeScope.$modelValue;
                }
                vm.$broadcast('NEW_PARAM', _obj)
            });
        }

        vm.createNewLock = function (object, parent, evt) {
            let obj = {
                name: vm.getName(object, 'lock1', 'name', 'lock'),
                checkbox: true,
                type: 'LOCK'
            };
            obj.parent = parent;
            vm.storeObject(obj, {}, evt, function (result) {
                if (!result)
                    object.push(obj);
            });
        };

        vm.createNewSchedule = function (object, parent, evt) {
            let obj = {
                name: vm.getName(object, 'schedule1', 'name', 'schedule'),
                type: 'SCHEDULE'
            };
            obj.parent = parent;
            vm.storeObject(obj, {}, evt, function (result) {
                if (!result)
                    object.push(obj);
            });
        };

        vm.createNewMonitor = function (object, parent, evt) {
            let obj = {
                name: vm.getName(object, 'process0', 'name', 'process'),
                script: {language: 'java'},
                ordering: object.length > 0 ? (object[object.length - 1].ordering + 1) : 0,
                type: 'MONITOR'
            };
            obj.parent = parent;
            vm.storeObject(obj, {ordering: obj.ordering, script: {language: 'java'}}, evt, function (result) {
                if (!result)
                    object.push(obj);
            });
        };

        let callBack = null, objectType = null;
        vm.getObjectTreeStructure = function (type, cb) {
            callBack = cb;
            objectType = type;
            vm.filterTree1 = [];
            let types = [type];
            if (type === 'PROCESSCLASS') {
                types.push('AGENTCLUSTER')
            }
            EditorService.tree({
                jobschedulerId: vm.schedulerIds.selected,
                forJoe: true,
                types: types
            }).then(function (res) {
                vm.filterTree1 = res.folders;
                angular.forEach(vm.filterTree1, function (value) {
                    value.expanded = true;
                    if (value.folders) {
                        value.folders = orderBy(value.folders, 'name');
                    }
                    vm.treeExpand(value, true);
                });
            }, function () {

            });
            $('#treeModal').modal('show');
        };

        vm.closeModal = function () {
            $('#treeModal').modal('hide');
        };

        vm.treeExpand = function (data, isFirstCall) {
            if (data.path) {
                if (!isFirstCall)
                    data.expanded = !data.expanded;
                if (data.expanded) {
                    EditorService.getFolder({
                        jobschedulerId: vm.schedulerIds.selected,
                        path: data.path
                    }).then(function (res) {
                        if (objectType === 'AGENTCLUSTER' || objectType === 'PROCESSCLASS') {
                            data.agentClusters = res.agentClusters || [];
                            for (let i = 0; i < data.agentClusters.length; i++) {
                                data.agentClusters[i].path = data.path === '/' ? data.path + '' + data.agentClusters[i].name : data.path + '/' + data.agentClusters[i].name;
                            }
                        }
                        if (objectType === 'PROCESSCLASS') {
                            data.processClasses = res.processClasses || [];
                            for (let i = 0; i < data.processClasses.length; i++) {
                                data.processClasses[i].path = data.path === '/' ? data.path + '' + data.processClasses[i].name : data.path + '/' + data.processClasses[i].name;
                            }
                        } else if (objectType === 'LOCK') {
                            data.locks = res.locks || [];
                            for (let i = 0; i < data.locks.length; i++) {
                                data.locks[i].path = data.path === '/' ? data.path + '' + data.locks[i].name : data.path + '/' + data.locks[i].name;
                            }
                        } else if (objectType === 'JOB') {
                            data.jobs = res.jobs || [];
                            for (let i = 0; i < data.jobs.length; i++) {
                                data.jobs[i].path = data.path === '/' ? data.path + '' + data.jobs[i].name : data.path + '/' + data.jobs[i].name;
                            }
                        } else if (objectType === 'MONITOR') {
                            data.monitors = res.monitors || [];
                            for (let i = 0; i < data.monitors.length; i++) {
                                data.monitors[i].path = data.path === '/' ? data.path + '' + data.monitors[i].name : data.path + '/' + data.monitors[i].name;
                            }
                        } else if (objectType === 'SCHEDULE') {
                            data.schedules = res.schedules || [];
                            for (let i = 0; i < data.schedules.length; i++) {
                                data.schedules[i].path = data.path === '/' ? data.path + '' + data.schedules[i].name : data.path + '/' + data.schedules[i].name;
                            }
                        } else if (objectType === 'JOBCHAIN') {
                            data.jobChains1 = res.jobChains || [];
                            for (let i = 0; i < data.jobChains1.length; i++) {
                                data.jobChains1[i].path = data.path === '/' ? data.path + '' + data.jobChains1[i].name : data.path + '/' + data.jobChains1[i].name;
                            }
                        }
                    });
                }
            } else {
                callBack(data);
                vm.closeModal();
            }
        };

        vm.treeExpand1 = function (data) {
            if (data.expanded) {
                data.folders = orderBy(data.folders, 'name');
            }
        };

        $(document).on('keydown', '#xml-script', function (e) {
            if (e.keyCode == 9) {
                EditorService.insertTab();
                e.preventDefault()
            }
        });

        vm.openSidePanelG = function (title) {
            vm.obj = {type: title, title: 'joe.button.' + title};
        };

        vm.closeSidePanel = function () {
            vm.obj = null;
        };

        vm.checkBoxCheck = function (data) {
            if (data == 'liveVersion') {
                vm.xmlVersionObj = {draftVersion: false, liveVersion: true};
            } else {
                vm.xmlVersionObj = {draftVersion: true, liveVersion: false};
            }
        };

        vm.showDiff = function (type, obj) {
            vm.xmlVersionObj = {draftVersion: true, liveVersion: false};
            let liveVersion = {};
            vm.getFileObject({name: obj.name, type: obj.type, forceLive: true}, obj.path, function (res) {
                liveVersion = res;
                vm.toXML(liveVersion, type, function (xml) {
                    vm.liveXml = EditorService.diff(vm.draftXml, xml);
                });
            });
            let _tempObj = angular.copy(obj);
            if (_tempObj.ignoreSignals && angular.isArray(_tempObj.ignoreSignals)) {
                _tempObj.ignoreSignals = _tempObj.ignoreSignals.join(' ');
            }
            if (_tempObj.disabled) {
                _tempObj.enabled = false;
            }
            if (_tempObj.script && _tempObj.script.content) {
                _tempObj.script.content = EditorService.getTextContent(_tempObj.script.content);
            }
            if (_tempObj.monitors) {
                for (let i = 0; i < _tempObj.monitors.length; i++) {
                    if (_tempObj.monitors[i].script && _tempObj.monitors[i].script.content) {
                        _tempObj.monitors[i].script.content = EditorService.getTextContent(_tempObj.monitors[i].script.content);
                    }
                }
            }
            vm.toXML(_tempObj, type, function (xml) {
                vm.draftXml = xml;
                let modalInstance = $uibModal.open({
                    templateUrl: 'modules/configuration/views/diff-dialog.html',
                    controller: 'DialogCtrl1',
                    scope: $scope,
                    size: 'diff',
                    backdrop: 'static',
                });
                modalInstance.result.then(function () {
                    if (vm.xmlVersionObj.liveVersion) {
                        obj = angular.merge(obj, liveVersion);
                    }
                    vm.storeObject(obj, obj);
                }, function () {

                });
            });
        };

        vm.storeObject = function (obj, configuration, evt, cb) {
            if (obj && obj.type && vm.permission && vm.permission.JobschedulerMaster && vm.permission.JobschedulerMaster.administration.configurations.edit) {
                let _path;
                if (obj.parent && !obj.path) {
                    obj.path = obj.parent;
                } else if (!obj.path) {
                    obj.path = vm.path;
                }

                if (obj.path) {
                    if (obj.path === '/') {
                        _path = obj.path + obj.name;
                    } else {
                        _path = obj.path + '/' + obj.name;
                    }
                }

                if (_path) {
                    let req = {
                        jobschedulerId: vm.schedulerIds.selected,
                        objectType: obj.type,
                        path: _path,
                        configuration: configuration
                    };
                    if(obj.docPath){
                        req.docPath = obj.docPath;
                    }
                   
                    EditorService.store(req).then(function () {
                        obj.deployed = false;
                        obj.message = 'JOE1003';
                        if (evt) {
                            navToObjectForEdit(obj, evt);
                        }
                        if (cb) {
                            cb()
                        }
                    }, function (err) {
                        vm.checkIsFolderLock(err, obj.path, function (result) {
                            if (result === 'yes') {
                                EditorService.store({
                                    jobschedulerId: vm.schedulerIds.selected,
                                    objectType: obj.type,
                                    path: _path,
                                    configuration: configuration
                                }).then(function () {
                                    obj.deployed = false;
                                    obj.message = 'JOE1003';
                                    if (evt) {
                                        navToObjectForEdit(obj, evt);
                                    }
                                    if (cb) {
                                        cb()
                                    }
                                });
                            } else {
                                cb('no');
                            }
                        });
                    });
                }

            }
        };

        function navToObjectForEdit(obj, evt) {
            vm.navFullTree();
            obj.selected1 = true;
            vm.type = obj.type;
            vm.param = undefined;
            vm.getFileObject(obj, obj.path, function () {
                vm.$broadcast('NEW_OBJECT', {
                    data: obj,
                    parent: evt.$parentNodeScope ? evt.$parentNodeScope.$modelValue : evt
                })
            });
        }

        vm.removeObject = function (object, evt) {
            let path = '', name = '';
            if (object.type) {
                if (evt.$parentNodeScope.$modelValue && evt.$parentNodeScope.$modelValue.path) {
                    path = evt.$parentNodeScope.$modelValue.path;
                } else if (evt.$parentNodeScope.$parentNodeScope && evt.$parentNodeScope.$parentNodeScope.$modelValue) {
                    path = evt.$parentNodeScope.$parentNodeScope.$modelValue.path;
                }
                name = object.name;
            } else {
                path = object.path;
            }
            vm.deleteObject(object.type || 'FOLDER', name, path, object);
        };

        vm.deleteObject = function (objectType, name, path, object) {
            let _path = '';
            if (name) {
                if (!path) {
                    path = vm.path
                }
                if (path === '/') {
                    _path = path + name;
                } else {
                    _path = path + '/' + name;
                }
            } else {
                _path = path;
            }

            vm._joeObjectName = name || path;
            let modalInstance = $uibModal.open({
                templateUrl: 'modules/core/template/confirm-dialog.html',
                controller: 'DialogCtrl1',
                scope: vm,
                size: 'md',
                backdrop: 'static',
            });
            modalInstance.result.then(function () {
                EditorService.delete({
                    jobschedulerId: vm.schedulerIds.selected,
                    objectType: objectType,
                    path: _path
                }).then(function () {
                    if (object) {
                        object.expanded = false;
                        object.deleted = true;
                        object.selected1 = false;
                        if (lastClickedItem && path === vm.path && lastClickedItem.type === object.type && lastClickedItem.name === object.name) {
                            vm.removeSection();
                        }
                    }
                }, function (err) {
                    vm.checkIsFolderLock(err, path, function (result) {
                        if (result === 'yes') {
                            EditorService.delete({
                                jobschedulerId: vm.schedulerIds.selected,
                                objectType: objectType,
                                path: _path
                            }).then(function () {
                                if (object) {
                                    object.expanded = false;
                                    object.deleted = true;
                                    object.selected1 = false;
                                    if (lastClickedItem && path === vm.path && lastClickedItem.type === object.type) {
                                        vm.removeSection();
                                    }
                                }
                            });
                        }
                    });
                });
            });
        };

        vm.checkIsFolderLock = function (err, path, cb) {
            if (err.status === 434 && !vm.overTake) {
                vm.overTake = err.data;
                let modalInstance = $uibModal.open({
                    templateUrl: 'modules/configuration/views/confirmation-dialog.html',
                    controller: 'DialogCtrl1',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function (res) {
                    if (res === 'yes') {
                        EditorService.lock({
                            jobschedulerId: vm.schedulerIds.selected,
                            path: path,
                            forceLock: true
                        }).then(function () {
                            cb('yes');
                        }, function () {
                            cb();
                        });
                    } else {
                        cb('no');
                    }
                    vm.overTake = null;
                }, function () {
                    vm.overTake = null;
                    cb('no');
                });
            }
        };

        vm.removeDraft = function (object, evt) {
            let path = '', name = '';
            if (object.type) {
                if (evt.$parentNodeScope.$modelValue && evt.$parentNodeScope.$modelValue.path) {
                    path = evt.$parentNodeScope.$modelValue.path;
                } else if (evt.$parentNodeScope.$parentNodeScope && evt.$parentNodeScope.$parentNodeScope.$modelValue) {
                    path = evt.$parentNodeScope.$parentNodeScope.$modelValue.path;
                }
                name = object.name;
            } else {
                path = object.path;
            }
            let obj = {
                jobschedulerId: vm.schedulerIds.selected,
                objectType: object.type || 'FOLDER',
                folder: path || vm.path
            };
            if (name) {
                obj.objectName = name;
            }
            _deleteDraft(obj, name, object);
        };

        vm.deleteDraft = function (object) {
            let obj = {};
            obj.jobschedulerId = vm.schedulerIds.selected;
            obj.objectType = object.type;
            obj.objectName = object.name;
            obj.folder = object.path || vm.path;
            _deleteDraft(obj, object.name, object);
        };

        function _deleteDraft(obj, name, object) {
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.type = object.type.toLowerCase();
                vm.comments.operation = 'label.deleteDraft';
                vm.comments.name = name || obj.folder;
                let modalInstance = $uibModal.open({
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
                    _deleteDraftAPICall(obj, object);
                }, function () {

                });
            } else {
                vm.deleteDraftObject = {name: name || obj.folder};
                let modalInstance = $uibModal.open({
                    templateUrl: 'modules/configuration/views/confirmation-dialog.html',
                    controller: 'DialogCtrl1',
                    scope: vm,
                    backdrop: 'static',
                });

                modalInstance.result.then(function () {
                    _deleteDraftAPICall(obj, object);
                    vm.deleteDraftObject = null;
                }, function () {
                    vm.deleteDraftObject = null;
                })
            }
        }

        function _deleteDraftAPICall(obj, object) {
            obj.account = vm.username;
            EditorService.deleteDraft(obj).then(function () {
                if ((vm.type || vm.param)) {
                    if (lastClickedItem && object.path === lastClickedItem.path && object.name === lastClickedItem.name && object.type === lastClickedItem.type) {
                        if (!object.deployed) {
                            vm.removeSection();
                        }
                    } else if (vm.param === 'ORDER' && object.type === 'JOBCHAIN') {
                        vm.$broadcast('RELOAD', object)
                    }
                }
            }, function (err) {
                vm.checkIsFolderLock(err, object.path || obj.folder, function (result) {
                    if (result === 'yes') {
                        EditorService.deleteDraft(obj).then(function () {
                            if ((vm.type || vm.param)) {
                                if (lastClickedItem && object.path === lastClickedItem.path && object.name === lastClickedItem.name && object.type === lastClickedItem.type) {
                                    if (!object.deployed) {
                                        vm.removeSection();
                                    }
                                } else if (vm.param === 'ORDER' && object.type === 'JOBCHAIN') {
                                    vm.$broadcast('RELOAD', object)
                                }
                            }
                        });
                    }
                });
            });
        }

        vm.restoreObject = function (object, evt) {
            let path = '', _path = '';
            if (object.type) {
                if (object.path) {
                    path = object.path;
                } else if (evt) {
                    if (evt.$parentNodeScope.$modelValue && evt.$parentNodeScope.$modelValue.path) {
                        path = evt.$parentNodeScope.$modelValue.path;
                    } else if (evt.$parentNodeScope.$parentNodeScope && evt.$parentNodeScope.$parentNodeScope.$modelValue) {
                        path = evt.$parentNodeScope.$parentNodeScope.$modelValue.path;
                    }
                }
                if (!path) {
                    path = vm.path
                }
                if (path === '/') {
                    _path = path + object.name;
                } else {
                    _path = path + '/' + object.name;
                }
            } else {
                _path = object.path;
            }
            EditorService.restore({
                jobschedulerId: vm.schedulerIds.selected,
                objectType: object.type || 'FOLDER',
                path: _path
            }).then(function () {
                object.deleted = false;
            }, function (err) {
                if (!path) {
                    path = _path;
                }
                vm.checkIsFolderLock(err, path, function (result) {
                    if (result === 'yes') {
                        EditorService.restore({
                            jobschedulerId: vm.schedulerIds.selected,
                            objectType: object.type || 'FOLDER',
                            path: _path
                        }).then(function () {
                            object.deleted = false;
                        });
                    }
                });
            });
        };

        vm.renameObject = function (obj, temp, form) {
            let _path = '', oldPath = '';
            if (obj.name) {
                if (obj.path === '/') {
                    _path = obj.path + obj.name;
                    oldPath = obj.path + temp.name;
                } else {
                    _path = obj.path + '/' + obj.name;
                    oldPath = obj.path + '/' + temp.name;
                }
                if (_path && oldPath && (_path !== oldPath)) {
                    EditorService.rename({
                        jobschedulerId: vm.schedulerIds.selected,
                        objectType: obj.type,
                        path: _path,
                        oldPath: oldPath,
                    }).then(function () {
                        temp.name = obj.name;
                    }, function (err) {
                        if (err.status !== 434) {
                            obj.name = temp.name;
                        } else {
                            vm.checkIsFolderLock(err, obj.path, function (result) {
                                if (result === 'yes') {
                                    vm.renameObject(obj, temp, form);
                                } else {
                                    obj.name = temp.name;
                                }
                            });
                        }
                    });
                }
            } else {
                obj.name = temp.name;
            }
        };

        vm.renameOrderObject = function (obj, temp, form) {
            let _path = '', oldPath = '';
            if (obj.orderId) {
                obj.name = obj.jobChain + ',' + obj.orderId;
                if (obj.path === '/') {
                    _path = obj.path + obj.name;
                    oldPath = obj.path + temp.name;
                } else {
                    _path = obj.path + '/' + obj.name;
                    oldPath = obj.path + '/' + temp.name;
                }
                if (_path && oldPath && (_path !== oldPath)) {
                    EditorService.rename({
                        jobschedulerId: vm.schedulerIds.selected,
                        objectType: obj.type,
                        path: _path,
                        oldPath: oldPath,
                    }).then(function () {
                        temp.name = obj.name;
                        temp.orderId = obj.orderId;
                    }, function (err) {
                        if (err.status !== 434) {
                            obj.orderId = temp.orderId;
                            obj.name = temp.name;
                        } else {
                            vm.checkIsFolderLock(err, obj.path, function (result) {
                                if (result === 'yes') {
                                    vm.renameObject(obj, temp, form);
                                } else {
                                    obj.orderId = temp.orderId;
                                    obj.name = temp.name;
                                }
                            });
                        }
                    });
                }
            } else {
                obj.orderId = temp.orderId;
                obj.name = temp.name;
            }
        };

        vm.showXml = function (obj, evt, isEditable) {
            vm.closeSidePanel();
            vm.isEditable = isEditable;
            vm.objectXml = {};
            let _path = '', path = '';
            if (evt) {
                if (evt.$parentNodeScope.$modelValue && evt.$parentNodeScope.$modelValue.path) {
                    path = evt.$parentNodeScope.$modelValue.path;
                } else if (evt.$parentNodeScope.$parentNodeScope && evt.$parentNodeScope.$parentNodeScope.$modelValue) {
                    path = evt.$parentNodeScope.$parentNodeScope.$modelValue.path;
                }
            } else if (obj.path) {
                path = obj.path;
            } else {
                path = vm.path;
            }
            if (path === '/') {
                _path = path + obj.name;
            } else {
                _path = path + '/' + obj.name;
            }

            if (path) {
                EditorService.getFile({
                    jobschedulerId: vm.schedulerIds.selected,
                    path: _path,
                    objectType: obj.type,
                }).then(function (res) {
                    openXmlModal(res.configuration, obj, _path, isEditable, res.objectVersionStatus.message._messageCode, path);
                });
            }
        };

        vm.copy = function (obj, evt, path) {
            vm.tPath = evt ? evt.$parentNodeScope.$modelValue.parent : path;
            vm.copyData = angular.copy(obj);
        };

        vm.paste = function (obj, children) {
            if (!children) {
                children = obj.children;
            }
            if (obj.object === vm.copyData.type && obj.parent === vm.tPath) {
                let tName;
                if (obj.object === 'ORDER') {
                    for (let i = 0; i < children.length; i++) {
                        if (children[i].orderId.match(/(^Copy\([0-9]*\))+/gi)) {
                            tName = angular.copy(children[i].orderId);
                        }
                    }
                    if (!tName) {
                        tName = 'copy(' + ((parseInt(vm.copyData.orderId) || 0) + 1) + ')of_' + vm.copyData.orderId;
                    } else {
                        tName = tName.split('(')[1];
                        tName = tName.split(')')[0];
                        tName = parseInt(tName) || 0;
                        tName = 'copy' + '(' + (tName + 1) + ')' + 'of_' + vm.copyData.orderId;
                    }
                    tName = vm.copyData.jobChain + ',' + tName;
                } else {
                    for (let i = 0; i < children.length; i++) {
                        if (children[i].name.match(/(^Copy\([0-9]*\))+/gi)) {
                            tName = angular.copy(children[i].name);
                        }
                    }
                    if (!tName) {
                        tName = 'copy(1)of_' + vm.copyData.name;
                    } else {
                        tName = tName.split('(')[1];
                        tName = tName.split(')')[0];
                        tName = parseInt(tName) || 0;
                        tName = 'copy' + '(' + (tName + 1) + ')' + 'of_' + vm.copyData.name;
                    }
                }
                let data = angular.copy(vm.copyData);
                let _path;
                if (obj.parent === '/') {
                    _path = obj.parent + data.name;
                } else {
                    _path = obj.parent + '/' + data.name;
                }
                if(!data.path){
                    data.path = obj.parent;
                }
                EditorService.getFile({
                    jobschedulerId: vm.schedulerIds.selected,
                    path: _path,
                    objectType: data.type
                }).then(function (res) {
                    data.name = tName;
                    vm.storeObject(data, res.configuration);
                });
            }
        };

        vm.pasteOrder = function (evt) {
            let folders = evt.$parentNodeScope.$parentNodeScope.$parentNodeScope.$modelValue.folders;
            let orders = folders[2].children;
            let jobChain = evt.$parentNodeScope.$modelValue;
            if (evt.$parentNodeScope.$parentNodeScope.$modelValue.parent === vm.tPath) {
                let tName;
                for (let i = 0; i < orders.length; i++) {
                    if (orders[i].jobChain === jobChain.name) {
                        if (orders[i].orderId.match(/(^Copy\([0-9]*\))+/gi)) {
                            tName = angular.copy(orders[i].orderId);
                        }
                    }
                }
                if (!tName) {
                    tName = 'copy(' + ((parseInt(vm.copyData.orderId) || 0) + 1) + ')of_' + vm.copyData.orderId;
                } else {
                    tName = tName.split('(')[1];
                    tName = tName.split(')')[0];
                    tName = parseInt(tName) || 0;
                    tName = 'copy' + '(' + (tName + 1) + ')' + 'of_' + vm.copyData.orderId;
                }
                tName = jobChain.name + ',' + tName;
                let data = angular.copy(vm.copyData);
                let _path;
                if (vm.tPath === '/') {
                    _path = vm.tPath + data.name;
                } else {
                    _path = vm.tPath + '/' + data.name;
                }
                EditorService.getFile({
                    jobschedulerId: vm.schedulerIds.selected,
                    path: _path,
                    objectType: data.type
                }).then(function (res) {
                    data.name = tName;
                    vm.storeObject(data, res.configuration);
                });
            }
        };

        function openXmlModal(data, obj, _path, isEditable, message, path) {
            vm.toXML(data, obj.type, function (xml) {
                if (!isEditable) {
                    vm.objectXml.html = EditorService.highlight('xml', xml);
                }
                vm.objectXml.xml = vkbeautify.xml(xml, 4);

                vm.objectXml.path = _path;
                let lockedBy = EditorService.isFolderLock(vm.tree, path);
                if (lockedBy && lockedBy !== vm.username) {
                    vm.objectXml.lockedByUser = lockedBy;
                }
                let modalInstance = $uibModal.open({
                    templateUrl: 'modules/configuration/views/object-xml-dialog.html',
                    controller: 'DialogCtrl1',
                    scope: vm,
                    backdrop: 'static',
                    size: 'lg'
                });
                modalInstance.result.then(function () {
                    if (!vm.objectXml.error) {
                        EditorService.store({
                            jobschedulerId: vm.schedulerIds.selected,
                            objectType: obj.type,
                            path: _path,
                            configuration: vm.objectXml.configuration
                        }).then(function () {
                            refactorJSONObject(obj, vm.objectXml.configuration, message, path);
                            obj.deployed = false;
                        }, function(err){
                            vm.checkIsFolderLock(err, _path, function (result) {
                                if (result === 'yes') {
                                    EditorService.store({
                                        jobschedulerId: vm.schedulerIds.selected,
                                        objectType: obj.type,
                                        path: _path,
                                        configuration: vm.objectXml.configuration
                                    })
                                }
                            });
                        });
                    }
                }, function () {
                    vm.objectXml = {};
                })
            });
        }

        vm.changeXml = function () {
            vm.objectXml.validate = true;
            EditorService.toJSON(vm.objectXml.xml).then(function (res) {
                vm.objectXml.configuration = res.data;
                vm.objectXml.validate = false;
            }, function () {
                vm.objectXml.error = true;
                vm.objectXml.validate = false;
            });
        };

        vm.copyToClipboard = function () {
            clipboard.copyText(vm.objectXml.xml);
        };

        vm.deployObject = function (object, evt) {
            let path = object.path;
            if (!path) {
                if (evt.$parentNodeScope.$modelValue && evt.$parentNodeScope.$modelValue.path) {
                    path = evt.$parentNodeScope.$modelValue.path;
                } else if (evt.$parentNodeScope.$parentNodeScope && evt.$parentNodeScope.$parentNodeScope.$modelValue) {
                    path = evt.$parentNodeScope.$parentNodeScope.$modelValue.path;
                }
            }
            let obj = {
                jobschedulerId: vm.schedulerIds.selected,
                folder: path
            };
            if (!object.param && object.type !== 'ORDER') {
                if (object.type) {
                    obj.objectName = object.name;
                    obj.objectType = object.type;
                } else if (object.object) {
                    obj.objectType = object.object;
                    obj.recursive = true;
                } else {
                    obj.recursive = true;
                }
                vm.deploy(null, object, obj);
            } else {
                if (vm.userPreferences.auditLog) {
                    vm.comments = {};
                    vm.comments.radio = 'predefined';
                    vm.comments.name = obj.folder + (obj.objectName ? '/' + obj.objectName : '');
                    vm.comments.operation = 'label.deploy';
                    vm.comments.type = 'Object';
                    const modalInstance = $uibModal.open({
                        templateUrl: 'modules/core/template/comment-dialog.html',
                        controller: 'DialogCtrl',
                        scope: vm,
                        backdrop: 'static'
                    });
                    modalInstance.result.then(function () {
                        let auditLog = {};
                        if (vm.comments.comment)
                            auditLog.comment = vm.comments.comment;

                        if (vm.comments.timeSpent)
                            auditLog.timeSpent = vm.comments.timeSpent;

                        if (vm.comments.ticketLink)
                            auditLog.ticketLink = vm.comments.ticketLink;
                        deployOrder(evt, auditLog);
                    }, function () {

                    });
                } else {
                    deployOrder(evt);
                }
            }
        };

        function deployOrder(evt, auditLog) {
            vm.isDeploying = true;
            if (evt.$parentNodeScope.$parentNodeScope && evt.$parentNodeScope.$parentNodeScope.$parentNodeScope && evt.$parentNodeScope.$parentNodeScope.$parentNodeScope.$modelValue) {
                let list = evt.$parentNodeScope.$parentNodeScope.$parentNodeScope.$modelValue.folders;
                let orders = [];
                let jobChain = evt.$parentNodeScope.$modelValue;
                for (let i = 0; i < list.length; i++) {
                    if (list[i].object === 'ORDER' && list[i].children) {
                        for (let j = 0; j < list[i].children.length; j++) {
                            if (!list[i].children[j].deployed && list[i].children[j].jobChain === jobChain.name) {
                                orders.push(list[i].children[j]);
                            }
                        }
                        break;
                    }
                }
                for (let i = 0; i < orders.length; i++) {
                    let x = {
                        jobschedulerId: vm.schedulerIds.selected,
                        folder: evt.$parentNodeScope.$parentNodeScope.$parentNodeScope.$modelValue.path,
                        objectType: 'ORDER',
                        objectName: orders[i].name,
                        account: vm.username,
                        auditLog: auditLog
                    };

                    EditorService.deploy(x).then(function (res) {
                        manageDeployMessages(res, orders[i], true);
                        if (i === orders.length - 1) {
                            vm.isDeploying = false;
                        }
                    }, function () {
                        vm.isDeploying = false;
                    });
                }
            }
        }

        vm.deploy = function (type, object, data) {
            let obj = {};
            if (!data) {
                obj.jobschedulerId = vm.schedulerIds.selected;
                obj.objectType = type;
                obj.objectName = object.name;
                obj.folder = object.path || vm.path;
            } else {
                obj = data;
            }
            deployWithComment(obj, object);
        };

        function deployWithComment(obj, object) {
            obj.account = vm.username;
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = obj.folder + (obj.objectName ? '/' + obj.objectName : '');
                vm.comments.operation = 'label.deploy';
                vm.comments.type = 'Object';
                const modalInstance = $uibModal.open({
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
                    EditorService.deploy(obj).then(function (res) {
                        manageDeployMessages(res, object);
                        if (object.deleted && object.deployed) {
                            if (lastClickedItem && object && lastClickedItem.type === object.type && lastClickedItem.name === object.name && lastClickedItem.path === object.path) {
                                vm.removeSection();
                            }
                        }
                        vm.isDeploying = false;
                    }, function () {
                        vm.isDeploying = false;
                    });
                }, function () {

                });
            } else {
                EditorService.deploy(obj).then(function (res) {
                    manageDeployMessages(res, object);
                    if (object.deleted && object.deployed) {
                        if (lastClickedItem && object && lastClickedItem.type === object.type && lastClickedItem.name === object.name && lastClickedItem.path === object.path) {
                            vm.removeSection();
                        }
                    }
                    vm.isDeploying = false;
                }, function () {
                    vm.isDeploying = false;
                });
            }
        }

        function manageDeployMessages(res, object, concat) {
            if (concat) {
                vm.joeConfigFilters.deployedMessages = vm.joeConfigFilters.deployedMessages.concat(res.report);
            } else {
                vm.joeConfigFilters.deployedMessages = res.report;
            }
            if (res.report.length > 0 && res.report[0]) {
                if (object && object.type) {
                    object.deployed = res.report[0].deployed;
                    if (res.report[0].failReason && res.report[0].failReason._key) {
                        toasty.error({
                            title: res.report[0].failReason._key,
                            msg: res.report[0].failReason.message,
                            timeout: 8000
                        });
                    }
                } else {
                    let flag = false;
                    for (let i = 0; i < res.report.length; i++) {
                        if (res.report[i].failReason._key === 'INCOMPLETE_CONFIGURATION') {
                            flag = true;
                            break;
                        }
                    }
                    if (flag) {
                        toasty.error({
                            title: 'message.incompleteConfiguration',
                            timeout: 8000
                        });
                    }
                }
            }
        }

        vm.isSideBarClicked = function (e) {
            e.stopPropagation();
        };

        vm.checkLockedBy = function (data, parent, obj) {
            obj.lockedBy = data.lockedByUser || data.lockedBy;
            obj.lockedSince = data.lockedSince;
            if (parent && parent.lockedBy) {
                obj.lockedBy = parent.lockedBy;
                obj.lockedSince = parent.lockedSince;
            }
            if (obj.lockedBy === vm.username) {
                obj.lockedBy = null;
            }
        };

        vm.hidePanel = function () {
            vm.joeConfigFilters.hideSideBar = true;
            $('#centerPanel').addClass('m-l-0 fade-in');
            $('#centerPanel').find('.parent .child').removeClass('col-xxl-3 col-lg-4').addClass('col-xxl-2 col-lg-3');
            $('#leftSidePanel').hide();
            $('.sidebar-btn').show();
        };

        vm.showLeftPanel = function () {
            vm.joeConfigFilters.hideSideBar = false;
            $('#centerPanel').removeClass('fade-in m-l-0');
            $('#centerPanel').find('.parent .child').addClass('col-xxl-3 col-lg-4').removeClass('col-xxl-2 col-lg-3');
            $('#leftSidePanel').show();
            $('.sidebar-btn').hide();
        };

        if(vm.joeConfigFilters.hideSideBar){
            vm.hidePanel();
        }

        $scope.$on('event-started', function () {
            if (vm.events && vm.events[0] && vm.events[0].eventSnapshots) {
                for (let i = 0; i < vm.events[0].eventSnapshots.length; i++) {
                    let path = vm.events[0].eventSnapshots[i].path.substring(0, vm.events[0].eventSnapshots[i].path.lastIndexOf('/') + 1) || '/';
                    if (vm.events[0].eventSnapshots[i].eventType.match(/FileBase/) && !vm.events[0].eventSnapshots[i].eventId && vm.isloaded) {
                        init(vm.events[0].eventSnapshots[i].path, path);
                        break
                    } else if (vm.events[0].eventSnapshots[i].eventType === 'JoeUpdated' && !vm.events[0].eventSnapshots[i].eventId) {
                        if (vm.events[0].eventSnapshots[i].objectType === 'FOLDER' && vm.isloaded) {
                            init(vm.events[0].eventSnapshots[i].path, path);
                            break;
                        } else {
                            updateFolders(vm.events[0].eventSnapshots[i].path);
                        }
                    }
                }
            }
        });

        $scope.$on('$destroy', function () {
            vm.joeConfigFilters.expand_to = vm.tree;
            if (vm.type) {
                vm.joeConfigFilters.activeTab.type = 'type';
                vm.joeConfigFilters.activeTab.object = vm.type;
            } else if (vm.param) {
                vm.joeConfigFilters.activeTab.type = 'param';
                vm.joeConfigFilters.activeTab.object = vm.param;
            }
            vm.joeConfigFilters.activeTab.path = vm.path;
        });
    }

    JobEditorCtrl.$inject = ['$scope', '$uibModal', 'EditorService'];

    function JobEditorCtrl($scope, $uibModal, EditorService) {
        const vm = $scope;
        vm.filter = {'sortBy': 'name', sortReverse: false};
        vm.jobs = [];
        vm.languages = ['shell', 'java', 'dotnet', 'java:javascript', 'perlScript', 'powershell', 'VBScript', 'scriptcontrol:vbscript', 'javax.script:rhino', 'javax.script:ecmascript', 'javascript'];
        vm.logLevelValue = ['', 'error', 'warn', 'info', 'debug', 'debug1', 'debug2', 'debug3', 'debug4', 'debug5', 'debug6', 'debug7', 'debug8', 'debug9'];
        vm.stderrLogLevelValue = ['error', 'info'];
        vm.historyOnProcessValue = ['', 0, 1, 2, 3, 4];
        vm.functionalCodeValue = ['spooler_init', 'spooler_open', 'spooler_process', 'spooler_close', 'spooler_exit', 'spooler_on_error', 'spooler_on_success'];
        vm.historyWithLogValue = ['', 'yes', 'no', 'gzip'];
        vm.ignoreSignalsValue = ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGHTRAP', 'SIGABRT', 'SIGIOT', 'SIGBUS', 'SIGFPE', 'SIGKILL', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGPIPE', 'SIGALRM', 'SIGTERM', 'SIGSTKFLT', 'SIGCHLD', 'SIGCONT', 'SIGSTOP', 'SIGTSTP', 'SIGTTIN', 'SIGTTOU', 'SIGURG', 'SIGXCPU', 'SIGXFSZ', 'SIGVTALRM', 'SIGPROF', 'SIGWINCH', 'SIGPOLL', 'SIGIO', 'SIGPWR', 'SIGSYS'];
        vm.priorityValue = ['', 'idle', 'below normal', 'normal', 'above normal', 'high'];
        vm.mailOnDelayAfterErrorValue = ['', 'all', 'first_only', 'last_only', 'first_and_last_only'];
        vm.common = ['', 'yes', 'no'];

        vm.changeTab = function (tab, lang) {
            if (tab) {
                vm.activeTab = tab;
            } else if (lang) {
                if (lang === 'java' || lang === 'dotnet') {
                    vm.activeTab = 'tab2';
                } else if (vm.activeTab === 'tab2') {
                    vm.activeTab = 'tab1';
                }
            }
        };

        function initialDefaultValue() {
            vm.extraInfo = {};
            vm.activeTab = 'tab1';
            vm.processClass = [];
            vm.activeTabInParameter = 'tab11';
            vm.include = {select: 'file'};
            vm.delayAfterErrors = {delay: 'delay'};
            vm.directoriesChanged = {directory: ''};
            vm.setback = {};
        }

        vm.sortBy1 = function (data) {
            vm.filter.sortBy = data;
            vm.filter.sortReverse = !vm.filter.sortReverse;
        };

        vm.changeActiveParameterTab = function (data) {
            vm.activeTabInParameter = data;
            if (vm.activeTabInParameter === 'tab33') {
                if (vm.job.params.includes && vm.job.params.includes.length > 0) {
                    for (let i = 0; i < vm.job.params.includes.length; i++) {
                        if (vm.job.params.includes[i].file) {
                            vm.job.params.includes[i].select = 'file';
                        } else {
                            vm.job.params.includes[i].select = 'live_file';
                        }
                    }
                }
            }
        };

        vm.createStandaloneJob = function () {
            vm.createNewJob(vm.jobs, 'no');
        };

        vm.createJob = function (job) {
            vm.navFullTree(vm.extraInfo.path, 'JOB');
            job.selected1 = true;
            vm.getFileObject(job, job.path, function () {
                vm.job = job;
                vm.job.current = true;
                vm._tempJob = angular.copy(vm.job);
                vm.setLastSection(vm.job);
                if (vm.job.script && vm.job.script.language === 'java' || vm.job.script.language === 'dotnet') {
                    vm.activeTab = 'tab2';
                }
                detectChanges();
                isStored = true;
            });
        };

        vm.createOrderJob = function () {
            vm.createNewJob(vm.jobs, 'yes');
        };

        vm.removeJob = function (job) {
            vm.deleteObject('JOB', job.name, job.path, job);
        };

        vm.getProcessClassTreeStructure = function () {
            vm.getObjectTreeStructure('PROCESSCLASS', function (data) {
                vm.job.processClass = data.process;
            });
        };

        vm.getLockTreeStructure = function () {
            vm.getObjectTreeStructure('LOCK', function (data) {
                let flag = true;
                for (let i = 0; i < vm.job.lockUses.length; i++) {
                    if (!vm.job.lockUses[i].lock) {
                        vm.job.lockUses[i].lock = data.lock;
                        vm.job.lockUses[i].exclusive = vm.job.lockUses[i].exclusive === 'yes';
                        flag = false;
                        break;
                    }
                }
                if (flag) {
                    vm.job.lockUses.push({lock: data.lock, exclusive: true});
                }
            });
        };

        vm.getMonitorTreeStructure = function () {
            vm.getObjectTreeStructure('MONITOR', function (data) {
                let flag = true;
                for (let i = 0; i < vm.job.monitorUses.length; i++) {
                    if (!vm.job.monitorUses[i].monitor) {
                        vm.job.monitorUses[i].monitor = data.monitor;
                        flag = false;
                        break;
                    }
                }
                if (flag) {
                    vm.job.monitorUses.push({monitor: data.monitor, ordering: 0});
                }
            });
        };

        vm.addParameter = function () {
            let param = {
                name: '',
                value: ''
            };
            if (!EditorService.isLastEntryEmpty(vm.job.params.paramList, 'name', '')) {
                vm.job.params.paramList.push(param);
            }
        };

        vm.onKeyPress = function ($event, type) {
            let key = $event.keyCode || $event.which;
            if (key == '13') {
                if (type === 'env') {
                    vm.addEnvironmentParams();
                } else if (type === 'param') {
                    vm.addParameter();
                }
                if (type === 'lock') {
                    vm.addLock();
                } else if (type === 'monitor') {
                    vm.addMonitor();
                } else {
                    vm.addIncludes();
                }
            }
        };

        vm.removeParams = function (index) {
            vm.job.params.paramList.splice(index, 1);
        };

        vm.addEnvironmentParams = function () {
            let envParam = {
                name: '',
                value: ''
            };
            if (!EditorService.isLastEntryEmpty(vm.job.environment.variables, 'name', '')) {
                vm.job.environment.variables.push(envParam);
            }
        };

        vm.removeEnvironmentParams = function (index) {
            vm.job.environment.variables.splice(index, 1);
        };

        vm.addIncludes = function () {
            let includesParam = {
                select: 'file',
                file: '',
                node: ''
            };
            if (!EditorService.isLastEntryEmpty(vm.job.params.includes, 'file', 'liveFile')) {
                vm.job.params.includes.push(includesParam);
            }
        };

        vm.removeIncludes = function (index) {
            vm.job.params.includes.splice(index, 1);
        };

        vm.changeFileType = function (data) {
            if (data.select === 'file') {
                if (!data.file) {
                    data.file = data.liveFile || '';
                }
                delete data['liveFile'];
            } else {
                if (!data.liveFile) {
                    data.liveFile = data.file || '';
                }
                delete data['file'];
            }
        };

        vm.addLock = function () {
            let param = {
                lock: '',
                exclusive: true
            };
            if (!vm.job.lockUses) {
                vm.job.lockUses = [];
            }
            if (!EditorService.isLastEntryEmpty(vm.job.lockUses, 'lock', 'exclusive')) {
                vm.job.lockUses.push(param);
            }
        };

        vm.removeLock = function (index) {
            vm.job.lockUses.splice(index, 1);
        };

        vm.addMonitor = function () {
            let param = {
                monitor: '',
                ordering: 0
            };
            if (!vm.job.monitorUses) {
                vm.job.monitorUses = [];
            }
            if (!EditorService.isLastEntryEmpty(vm.job.monitorUses, 'monitor', 'ordering')) {
                vm.job.monitorUses.push(param);
            }
        };

        vm.removeMonitor = function (index) {
            vm.job.monitorUses.splice(index, 1);
        };

        $(document).on('keydown', '.editor-script', function (e) {
            if (e.keyCode == 9) {
                EditorService.insertTab();
                e.preventDefault()
            }
        });

        function setLanguage() {
            if (!vm.job.script || _.isEmpty(vm.job.script)) {
                vm.job.script = {language: 'shell'};
            }
            return EditorService.setLanguage(vm.job.script.language);
        }

        vm.addLangParameter = function (data) {
            if (!vm.job.script || _.isEmpty(vm.job.script)) {
                vm.job.script = {language: 'shell'};
            }
            let block = EditorService.getFunctionalCode(data, setLanguage());
            let x = EditorService.highlight(setLanguage(), block);
            let inn = document.getElementById('editor-script').innerHTML;
            vm.job.script.content = inn + x;
            vm.job.functionCodeSnippets = '';
        };

        vm.addFile = function () {
            if (vm._tempFile) {
                for (let i = 0; i < vm.job.script.includes.length; i++) {
                    if (angular.equals(angular.toJson(vm.job.script.includes[i]), angular.toJson(vm._tempFile))) {
                        vm.job.script.includes[i] = {};
                        if (vm.include.select == "file") {
                            vm.job.script.includes[i].file = vm.include.fileName;
                        } else {
                            vm.job.script.includes[i].liveFile = vm.include.fileName;
                        }
                        vm._tempFile = undefined;
                        vm.include = {select: 'file'};
                        break;
                    }
                }
            } else {
                if (!vm.job.script.includes) {
                    vm.job.script.includes = [];
                }
                let x = {};
                if (vm.include.select == "file") {
                    x.file = vm.include.fileName;
                } else {
                    x.liveFile = vm.include.fileName;
                }
                vm.job.script.includes.push(x);
                vm.include = {select: 'file'};
            }
        };

        vm.editFile = function (data) {
            vm.include = {};
            if (data.file) {
                vm.include.select = "file";
                vm.include.fileName = data.file;
            } else {
                vm.include.select = "live_file";
                vm.include.fileName = data.liveFile;
            }
            vm._tempFile = angular.copy(data);
        };

        vm.removeFile = function (include) {
            for (let i = 0; i < vm.job.script.includes.length; i++) {
                if (vm.job.script.includes[i].file === include.file) {
                    vm.job.script.includes.splice(i, 1);
                    storeObject();
                    break;
                }
            }
        };

        vm.applyDelay = function () {
            if (vm.delayAfterErrors.delay == 'delay' && !vm.delayAfterErrors.reRunTime) {
                return;
            }
            if (vm._tempDelay) {
                for (let i = 0; i < vm.job.delayAfterErrors.length; i++) {
                    if (angular.equals(angular.toJson(vm.job.delayAfterErrors[i]), angular.toJson(vm._tempDelay))) {
                        if (vm.job.delayAfterErrors[i].delay == 'delay' || vm.delayAfterErrors.delay == 'delay') {
                            vm.job.delayAfterErrors[i] = {
                                delay: vm.delayAfterErrors.reRunTime,
                                errorCount: vm.delayAfterErrors.errorCount
                            };
                            vm._tempDelay = undefined;
                        } else {
                            vm.job.delayAfterErrors[i] = {
                                delay: vm.delayAfterErrors.delay,
                                errorCount: vm.delayAfterErrors.errorCount
                            };
                            vm._tempDelay = undefined;
                        }
                        vm.delayAfterErrors = {delay: 'delay'};
                        break;
                    }
                }
            } else {
                if (!vm.job.delayAfterErrors) {
                    vm.job.delayAfterErrors = [];
                }
                if (vm.delayAfterErrors.errorCount) {
                    if (vm.delayAfterErrors.delay == 'delay') {
                        vm.job.delayAfterErrors.push({
                            delay: vm.delayAfterErrors.reRunTime,
                            errorCount: vm.delayAfterErrors.errorCount
                        });
                    } else {
                        vm.job.delayAfterErrors.push({
                            delay: vm.delayAfterErrors.delay,
                            errorCount: vm.delayAfterErrors.errorCount
                        });
                    }
                    vm.delayAfterErrors = {delay: 'delay'};
                }
            }
        };

        vm.editDelay = function (data) {
            if (data.delay !== 'stop') {
                vm.delayAfterErrors = {delay: 'delay', errorCount: data.errorCount, reRunTime: data.delay};
            } else {
                vm.delayAfterErrors = angular.copy(data);
            }
            vm._tempDelay = angular.copy(data);
        };

        vm.removeDelay = function (error) {
            for (let i = 0; i < vm.job.delayAfterErrors.length; i++) {
                if (vm.job.delayAfterErrors[i].errorCount === error.errorCount && vm.job.delayAfterErrors[i].delay === error.delay) {
                    vm.job.delayAfterErrors.splice(i, 1);
                    storeObject();
                    break;
                }
            }
        };

        vm.applyDir = function () {
            if (vm._tempDir) {
                for (let i = 0; i < vm.job.startWhenDirectoriesChanged.length; i++) {
                    if (angular.equals(angular.toJson(vm.job.startWhenDirectoriesChanged[i]), angular.toJson(vm._tempDir))) {
                        vm.job.startWhenDirectoriesChanged[i] = {
                            directory: vm.directoriesChanged.directory,
                            regex: vm.directoriesChanged.regex
                        };
                        vm._tempDir = undefined;
                        vm.directoriesChanged = {};
                        break;
                    }
                }
            } else {
                if (!vm.job.startWhenDirectoriesChanged) {
                    vm.job.startWhenDirectoriesChanged = [];
                }
                if (vm.directoriesChanged.directory)
                    vm.job.startWhenDirectoriesChanged.push(vm.directoriesChanged);
                vm.directoriesChanged = {directory: ''};
            }
        };

        vm.editDir = function (data) {
            vm.directoriesChanged = angular.copy(data);
            vm._tempDir = angular.copy(data);
        };

        vm.removeDir = function (error) {
            for (let i = 0; i < vm.job.startWhenDirectoriesChanged.length; i++) {
                if (vm.job.startWhenDirectoriesChanged[i].directory === error.directory && vm.job.startWhenDirectoriesChanged[i].regex === error.regex) {
                    vm.job.startWhenDirectoriesChanged.splice(i, 1);
                    storeObject();
                    break;
                }
            }
        };

        vm.applySetback = function () {
            if (!(vm.setback.isMaximum || vm.setback.delay)) {
                return;
            }
            let flag = true;
            delete vm.setback['error'];
            if (vm.job.delayOrderAfterSetbacks && vm.job.delayOrderAfterSetbacks.length > 0 && vm.setback.isMaximum) {
                for (let i = 0; i < vm.job.delayOrderAfterSetbacks.length; i++) {
                    if (vm.job.delayOrderAfterSetbacks[i].isMaximum) {
                        flag = false;
                        vm.setback.error = true;
                        break;
                    }
                }
            }
            if (flag) {
                if (vm._tempSetback) {
                    for (let i = 0; i < vm.job.delayOrderAfterSetbacks.length; i++) {
                        if (angular.equals(angular.toJson(vm.job.delayOrderAfterSetbacks[i]), angular.toJson(vm._tempSetback))) {
                            vm.job.delayOrderAfterSetbacks[i] = {
                                setbackCount: vm.setback.setbackCount,
                                isMaximum: vm.setback.isMaximum,
                                delay: vm.setback.delay
                            };
                            break;
                        }
                    }
                } else {
                    if (!vm.job.delayOrderAfterSetbacks) {
                        vm.job.delayOrderAfterSetbacks = [];
                    }
                    if (vm.setback.setbackCount)
                        vm.job.delayOrderAfterSetbacks.push(vm.setback);

                }
            }
            if(vm.setback.error){
                return;
            }
            vm._tempSetback = undefined;
            vm.setback = {};
        };

        vm.editSetback = function (data) {
            vm.setback = angular.copy(data);
            vm._tempSetback = angular.copy(data);
        };

        vm.removeSetback = function (setback) {
            for (let i = 0; i < vm.job.delayOrderAfterSetbacks.length; i++) {
                if (vm.job.delayOrderAfterSetbacks[i].setbackCount === setback.setbackCount && vm.job.delayOrderAfterSetbacks[i].delay === setback.delay) {
                    vm.setback ={};
                    vm._tempSetback = undefined;
                    vm.job.delayOrderAfterSetbacks.splice(i, 1);
                    storeObject();
                    break;
                }
            }
        };

        vm.selectProcessClass = function (data) {
            vm.job.processClass = data;
            vm.isShow = false;
        };

        vm.openSidePanel = function (title) {
            vm.openSidePanelG(title);
            if (title === 'parameter') {
                if (!vm.job.params) {
                    vm.job.params = {paramList: [], includes: []};
                }
                if (!vm.job.params.paramList) {
                    vm.job.params.paramList = [];
                }
                if (!vm.job.params.includes) {
                    vm.job.params.includes = [];
                }
                if (vm.job.params.paramList && vm.job.params.paramList.length === 0) {
                    vm.addParameter();
                }
                if (vm.job.params.includes && vm.job.params.includes.length === 0) {
                    vm.addIncludes();
                }
                if (!vm.job.environment || !vm.job.environment.variables) {
                    if (!vm.job.environment) {
                        vm.job.environment = {variables: []};
                    } else {
                        vm.job.environment.variables = [];
                    }
                    vm.addEnvironmentParams();
                }

            } else if (title === 'locksUsed') {
                if (!vm.job.lockUses) {
                    vm.job.lockUses = [];
                    vm.addLock();
                }else{
                    for(let i=0; i < vm.job.lockUses.length;i++ ){
                        if(vm.job.lockUses[i].exclusive ==='true' || vm.job.lockUses[i].exclusive ==='yes'){
                            vm.job.lockUses[i].exclusive = true;
                        }
                    }
                }
            } else if (title === 'monitorsUsed') {
                if (!vm.job.monitorUses) {
                    vm.job.monitorUses = [];
                    vm.addMonitor();
                }
            } else if (title === 'runTime') {
                vm.order = angular.copy(vm.job);
                vm.joe = true;
                if (vm.job.runTime) {
                    if (vm.job.runTime.calendars) {
                        let cal = JSON.parse(vm.job.runTime.calendars);
                        vm.calendars = cal ? cal.calendars : null;
                    }
                }
            }
            vm._tempJob = angular.copy(vm.job);
        };

        vm.closeSidePanel1 = function (close) {
            if (vm.obj) {
                if (vm.job) {
                    if (vm.obj.type === 'runTime') {
                        vm.job.runTime = vm.obj.run_time;
                        if (vm.obj.calendars && vm.obj.calendars.length > 0) {
                            vm.job.runTime.calendars = JSON.stringify({calendars: vm.obj.calendars});
                        } else if(vm.job.runTime.calendars){
                            delete vm.job.runTime['calendars'];
                        }
                    } else {
                        EditorService.clearEmptyData(vm.job);
                        EditorService.clearEmptyData(vm._tempJob);
                    }
                    storeObject();
                }
                vm.calendars = null;
                vm.closeSidePanel();
            }
        };

        vm.checkPriority = function (data) {
            if (!data.match(/(\bidle\b|\bbelow\snormal\b|\bnormal\b|\babove\snormal\b|\bhigh\b|^-?[0-1]{0,1}[0-9]{0,1}$|^-?[0-9]{0,1}$|^-?[2]{0,1}[0]{0,1}$|^$)+/g)) {
                vm.job.priority = '';
            }
        };

        let isLoadingCompleted = true;

        function storeObject() {
            if (vm.job && vm.job.name) {
                isStored = false;
                if (vm.job.lockUses && vm.job.lockUses.length === 0) {
                    delete vm.job['lockUses'];
                }
                if (vm.job.monitorUses && vm.job.monitorUses.length === 0) {
                    delete vm.job['monitorUses'];
                }
                if (vm._tempJob) {
                    if (vm.job["selected"] != undefined) {
                        vm._tempJob["selected"] = angular.copy(vm.job["selected"]);
                    }
                    vm._tempJob["selected1"] = angular.copy(vm.job["selected1"]);
                    vm._tempJob["expanded"] = angular.copy(vm.job["expanded"]);
                    vm._tempJob["children"] = angular.copy(vm.job["children"]);
                    vm._tempJob["current"] = angular.copy(vm.job["current"]);
                }

                if (vm._tempJob.deployed !== vm.job.deployed) {
                    vm._tempJob.deployed = vm.job.deployed;
                }
                if (vm._tempJob.deleted !== vm.job.deleted) {
                    vm._tempJob.deleted = vm.job.deleted;
                }

                if (!angular.equals(angular.toJson(vm._tempJob), angular.toJson(vm.job)) && vm._tempJob.name === vm.job.name) {
                    isLoadingCompleted = false;
                    if (!vm.extraInfo.lockedSince) {
                        vm.lockObject(vm.job);
                    }
                    let _tempObj = angular.copy(vm.job);
                    if (_tempObj.ignoreSignals && angular.isArray(_tempObj.ignoreSignals)) {
                        _tempObj.ignoreSignals = _tempObj.ignoreSignals.join(' ');
                    }
                    _tempObj.enabled = !_tempObj.disabled;
                    if (_tempObj.script && _tempObj.script.content) {
                        _tempObj.script.content = EditorService.getTextContent(_tempObj.script.content);
                    }
                    if (_tempObj.monitors) {
                        for (let i = 0; i < _tempObj.monitors.length; i++) {
                            if (_tempObj.monitors[i].script && _tempObj.monitors[i].script.content) {
                                _tempObj.monitors[i].script.content = EditorService.getTextContent(_tempObj.monitors[i].script.content);
                            }
                        }
                    }
                    if (!_tempObj.deleted) {
                        vm.storeObject(vm.job, _tempObj, null, function (result) {
                            if (_tempObj.name === vm.job.name && _tempObj.path === vm.job.path) {
                                setTimeout(function () {
                                    isStored = true;
                                }, 1000);
                                if (!result || result !== 'no') {
                                    vm.extraInfo.storeDate = new Date();
                                    vm._tempJob = angular.copy(vm.job);
                                } else {
                                    let defaultObjects = ['name', 'deleted', 'deployed', 'selected1', 'children', 'type', 'expanded', 'message', 'path', '$$hashKey'];
                                    for (let propName in vm.job) {
                                        if (typeof propName === 'string' && defaultObjects.indexOf(propName) === -1) {
                                            delete vm.job[propName];
                                        }
                                    }
                                    vm.job = angular.merge(vm.job, vm._tempJob);
                                    vm._tempJob = angular.copy(vm.job);
                                }
                            } else {
                                isStored = true;
                            }
                        });
                    }
                } else {
                    isStored = true;
                }
            }
        }

        vm.$on('RELOAD', function (evt, job) {
            if (vm.extraInfo && job && job.folders && job.folders.length > 7) {
                vm.jobs = job.folders[0].children || [];
                vm.processClasses = job.folders[3].children || [];
                vm.agentClusters = job.folders[4].children || [];
                vm.locks = job.folders[6].children || [];
                vm.monitors = job.folders[7].children || [];
                vm.checkLockedBy(job, null, vm.extraInfo);
            }
        });

        vm.$on('UPDATE_TEMP', function (evt, obj) {
            if (vm.job && vm.job.name === obj.name && vm.job.path === obj.path) {
                vm._tempJob = angular.copy(vm.job);
            }
        });

        vm.$on('NEW_OBJECT', function (evt, job) {
            vm.closeSidePanel1(true);
            initialDefaultValue();
            vm.checkLockedBy(job.data, job.parent, vm.extraInfo);
            vm.extraInfo.path = job.data.parent;
            if (job.data.type) {
                vm.job = job.data;
                if (!vm.job.script) {
                    vm.job.script = {language: 'shell'};
                } else {
                    if (vm.job.script.language === 'java' || vm.job.script.language === 'dotnet') {
                        vm.activeTab = 'tab2';
                    }
                }
                vm.job.current = true;
                vm._tempJob = angular.copy(vm.job);
                vm.jobs = job.parent.folders[0].children || [];
                vm.processClasses = job.parent.folders[3].children || [];
                vm.agentClusters = job.parent.folders[4].children || [];
                vm.locks = job.parent.folders[6].children || [];
                vm.monitors = job.parent.folders[7].children || [];
                detectChanges();
                isStored = true;
            } else {
                vm.jobs = job.data.children || [];
                vm.job = undefined;
                vm._tempJob = undefined;
            }
            vm.setLastSection(vm.job);
        });

        vm.applyHighlight = function (script) {
            document.querySelectorAll('div.code').forEach((block) => {
                script.content = EditorService.highlight(EditorService.setLanguage(script.language), block.innerText);
            });
            storeObject();
        };

        var watcher1 = null, isStored = false;

        function detectChanges() {
            if (watcher1) {
                watcher1();
            }
            watcher1 = $scope.$watchCollection('job', function (newValues, oldValues) {
                if (newValues && oldValues && newValues !== oldValues && isStored && vm.job.name === vm._tempJob.name) {
                    isStored = false;
                    storeObject();
                }
            });
        }

        $scope.$on('$destroy', function () {
            if (watcher1) {
                watcher1();
            }
            if (vm.job) {
                delete vm.job['current'];
            }
            vm.closeSidePanel1(true);
        });
    }

    JobChainEditorCtrl.$inject = ['$scope', 'EditorService'];

    function JobChainEditorCtrl($scope, EditorService) {
        const vm = $scope;
        vm.filter = {'sortBy': 'name', sortReverse: false};
        vm.jobChains = [];
        vm.processClass = [];
        vm.extraInfo = {};

        vm.sortBy1 = function (data) {
            vm.filter.sortBy = data;
            vm.filter.sortReverse = !vm.filter.sortReverse;
        };

        vm.createJobChain = function (jobChain) {
            if (jobChain) {
                vm.navFullTree(vm.extraInfo.path, 'JOBCHAIN');
                jobChain.selected1 = true;
                vm.getFileObject(jobChain, jobChain.path, function () {
                    vm.jobChain = jobChain;
                    vm.jobChain.current = true;
                    vm._tempJobChain = angular.copy(vm.jobChain);
                    vm.setLastSection(vm.jobChain);
                    detectChanges();
                    isStored = true;
                });
            } else {
                vm.createNewJobChain(vm.jobChains);
            }
        };

        vm.removeJobChain = function (jobChain) {
            vm.deleteObject('JOBCHAIN', jobChain.name, jobChain.path, jobChain);
        };

        vm.getProcessClassTreeStructure = function (type) {
            vm.getObjectTreeStructure(type === 'processClass' ? 'PROCESSCLASS' : 'AGENTCLUSTER', function (data) {
                vm.jobChain[type] = data.process;
            });
        };

        vm.openSidePanel = function (title) {
            vm.openSidePanelG(title);
            let _path;
            if (vm.jobChain.path === '/') {
                _path = vm.jobChain.path + vm.jobChain.name;
            } else {
                _path = vm.jobChain.path + '/' + vm.jobChain.name;
            }
            if (vm.jobChain.path && vm.jobChain.name) {
                EditorService.getFile({
                    jobschedulerId: vm.schedulerIds.selected,
                    path: _path,
                    objectType: 'NODEPARAMS',
                }).then(function (res) {
                    vm.node = {};
                    if (res.configuration && res.configuration.jobChain && res.configuration.jobChain.order) {
                        vm.node = res.configuration.jobChain.order || {};
                    }
                    if (!vm.node.params || !vm.node.params.paramList) {
                        if (!vm.node.params) {
                            vm.node.params = {paramList: []};
                        } else {
                            vm.node.params.paramList = [];
                        }
                        vm.addParameter();
                    }
                    vm._tempNode = angular.copy(vm.node)
                });
            }
        };

        vm.closeSidePanel1 = function () {
            if (vm.obj) {
                if (vm.obj.type === 'nodeParameter') {
                    storeNodeParam();
                }
                vm.closeSidePanel();
            }
        };

        function storeNodeParam() {
            if (vm.permission && vm.permission.JobschedulerMaster && vm.permission.JobschedulerMaster.administration.configurations.edit) {
                EditorService.clearEmptyData(vm.node);
                if (vm._tempNode)
                    EditorService.clearEmptyData(vm._tempNode);
                if (vm._tempNode && !angular.equals(vm.node, vm._tempNode)) {
                    let _path = '';
                    if (vm.jobChain.path === '/') {
                        _path = vm.jobChain.path + vm.jobChain.name;
                    } else {
                        _path = vm.jobChain.path + '/' + vm.jobChain.name;
                    }
                    if (vm.jobChain.path && vm.jobChain.name) {
                        EditorService.store({
                            jobschedulerId: vm.schedulerIds.selected,
                            objectType: 'NODEPARAMS',
                            path: _path,
                            configuration: {
                                "jobChain": {
                                    "name": vm.jobChain.name,
                                    "order": {"params": vm.node.params, "jobChainNodes": vm.node.jobChainNodes}
                                }
                            }
                        }).then(function () {

                        }, function (err) {
                            vm.checkIsFolderLock(err, vm.jobChain.path, function (result) {
                                if (result === 'yes') {
                                    EditorService.store({
                                        jobschedulerId: vm.schedulerIds.selected,
                                        objectType: 'NODEPARAMS',
                                        path: _path,
                                        configuration: {
                                            "jobChain": {
                                                "name": vm.jobChain.name,
                                                "order": {
                                                    "params": vm.node.params,
                                                    "jobChainNodes": vm.node.jobChainNodes
                                                }
                                            }
                                        }
                                    })
                                }
                            });
                        })
                    }
                }
            }
        }

        vm.addParameter = function () {
            let param = {
                name: '',
                value: ''
            };
            if (!EditorService.isLastEntryEmpty(vm.node.params.paramList, 'name', '')) {
                vm.node.params.paramList.push(param);
            }
        };

        vm.onKeyPress = function ($event, type) {
            let key = $event.keyCode || $event.which;
            if (key == '13') {
                if (type === 'param') {
                    vm.addParameter();
                }
            }
        };

        vm.removeParams = function (index) {
            vm.node.params.paramList.splice(index, 1);
        };

        function storeObject() {
            if (vm.jobChain && vm.jobChain.name) {
                if (vm._tempJobChain) {
                    if (vm.jobChain["selected"] != undefined) {
                        vm._tempJobChain["selected"] = angular.copy(vm.jobChain["selected"]);
                    }
                    vm._tempJobChain["selected1"] = angular.copy(vm.jobChain["selected1"]);
                    vm._tempJobChain["expanded"] = angular.copy(vm.jobChain["expanded"]);
                    vm._tempJobChain["current"] = angular.copy(vm.jobChain["current"]);
                    vm._tempJobChain["children"] = angular.copy(vm.jobChain["children"]);
                }

                if (vm._tempJobChain.deployed !== vm.jobChain.deployed) {
                    vm._tempJobChain.deployed = vm.jobChain.deployed;
                }
                if (vm._tempJobChain.deleted !== vm.jobChain.deleted) {
                    vm._tempJobChain.deleted = vm.jobChain.deleted;
                }
                if (!angular.equals(angular.toJson(vm._tempJobChain), angular.toJson(vm.jobChain)) && vm._tempJobChain.name === vm.jobChain.name) {
                    if (!vm.extraInfo.lockedSince) {
                        vm.lockObject(vm.jobChain);
                    }
                    if (!vm.jobChain.deleted) {
                        vm.storeObject(vm.jobChain, vm.jobChain, null, function (result) {
                            setTimeout(function () {
                                isStored = true;
                            }, 1000);
                            if (!result || result !== 'no') {
                                vm.extraInfo.storeDate = new Date();
                                vm._tempJobChain = angular.copy(vm.jobChain);
                            } else {
                                let defaultObjects = ['name', 'deleted', 'deployed', 'selected1', 'children', 'type', 'expanded', 'message', 'path', '$$hashKey'];
                                for (let propName in vm.jobChain) {
                                    if (typeof propName === 'string' && defaultObjects.indexOf(propName) === -1) {
                                        delete vm.jobChain[propName];
                                    }
                                }
                                vm.jobChain = angular.merge(vm.jobChain, vm._tempJobChain);
                                vm._tempJobChain = angular.copy(vm.jobChain);
                            }
                        });
                    }
                } else {
                    isStored = true;
                }
            }
        }

        vm.$on('RELOAD', function (evt, jobChain) {
            if (vm.extraInfo && jobChain && jobChain.folders && jobChain.folders.length > 7) {
                vm.jobChains = jobChain.folders[1].children || [];
                vm.processClasses = jobChain.folders[3].children || [];
                vm.agentClusters = jobChain.folders[4].children || [];
                vm.checkLockedBy(jobChain, null, vm.extraInfo);
            }
        });

        vm.$on('UPDATE_TEMP', function (evt, obj) {
            if (vm.jobChain && vm.jobChain.name === obj.name && vm.jobChain.path === obj.path) {
                vm._tempJobChain = angular.copy(vm.jobChain);
            }
        });

        vm.$on('NEW_OBJECT', function (evt, jobChain) {
            if (vm.jobChain) {
                vm.closeSidePanel1();
            }
            vm.extraInfo = {};
            vm.checkLockedBy(jobChain.data, jobChain.parent, vm.extraInfo);
            vm.extraInfo.path = jobChain.data.parent;
            if (jobChain.data.type) {
                vm.jobChain = jobChain.data;
                vm.jobChain.current = true;
                vm.jobChains = jobChain.parent.folders[1].children || [];
                vm.processClasses = jobChain.parent.folders[3].children || [];
                vm.agentClusters = jobChain.parent.folders[4].children || [];
                vm._tempJobChain = angular.copy(vm.jobChain);
                detectChanges();
                isStored = true;
            } else {
                vm.jobChains = jobChain.data.children || [];
                vm.jobChain = undefined;
                vm._tempJobChain = undefined;
            }
            vm.setLastSection(vm.jobChain);

        });

        var watcher1 = null, isStored = false;

        function detectChanges() {
            if (watcher1) {
                watcher1();
            }
            watcher1 = $scope.$watchCollection('jobChain', function (newValues, oldValues) {
                if (newValues && oldValues && newValues !== oldValues && isStored && vm.jobChain.name === vm._tempJobChain.name) {
                    isStored = false;
                    storeObject();
                }
            });
        }

        $scope.$on('$destroy', function () {
            if (watcher1) {
                watcher1();
            }
            if (vm.jobChain) {
                delete vm.jobChain['current'];
            }
            vm.closeSidePanel1();
        });
    }

    OrderEditorCtrl.$inject = ['$scope', 'EditorService'];

    function OrderEditorCtrl($scope, EditorService) {
        const vm = $scope;
        vm.filter = {'sortBy': 'orderId', sortReverse: false};

        function initConfig() {
            vm.orders = [];
            vm.activeTabInParameter = 'tab11';
            vm.jobChainNodes = [];
            vm.nodeparams = [];
            vm.extraInfo = {};
        }

        vm.changeActiveParameterTab = function (data) {
            vm.activeTabInParameter = data;
            if (vm.activeTabInParameter === 'tab22') {
                if (!vm._order.params || !vm._order.params.includes) {
                    if (!vm._order.params) {
                        vm._order.params = {includes: []};
                    } else {
                        vm._order.params.includes = [];
                    }
                }
                if (vm._order.params.includes && vm._order.params.includes.length > 0) {
                    for (let i = 0; i < vm._order.params.includes.length; i++) {
                        if (vm._order.params.includes[i].file) {
                            vm._order.params.includes[i].select = 'file';
                        } else {
                            vm._order.params.includes[i].select = 'live_file';
                        }
                    }
                }

            }
        };
        vm.sortBy1 = function (data) {
            vm.filter.sortBy = data;
            vm.filter.sortReverse = !vm.filter.sortReverse;
        };

        vm.createOrder = function (order) {
            if (order) {
                vm.getFileObject(order, order.path, function () {
                    vm._order = order;
                    if (vm._order.priority)
                        vm._order.priority = parseInt(vm._order.priority, 10);
                    vm._order.current = true;
                    if (!vm._order.params || !vm._order.params.paramList) {
                        if (!vm._order.params) {
                            vm._order.params = {paramList: []};
                        } else {
                            vm._order.params.paramList = [];
                        }
                    }

                    getNodeParam();
                    if (vm._order.jobChain) {
                        vm.getSelectedJobChainData(vm._order.jobChain, order.path);
                    }
                    vm._tempOrder = angular.copy(vm._order);
                    vm.setLastSection(vm._order);
                    detectChanges();
                    isStored = true;
                });
            } else {
                vm.createNewOrder(vm.orders, vm.jobChain);
                if (vm.allOrders && vm.allOrders.children) {
                    for (let i = 0; i < vm.orders.length; i++) {
                        if (vm.allOrders.children.length === 0) {
                            vm.allOrders.expanded = true;
                            vm.allOrders.children.push(vm.orders[i]);
                        } else {
                            let flag = true;
                            for (let j = 0; j < vm.allOrders.children.length; j++) {
                                if (vm.allOrders.children[j].orderId === vm.orders[i].orderId && vm.allOrders.children[j].jobChain === vm.orders[i].jobChain) {
                                    flag = false;
                                    break;
                                }
                            }
                            if (flag) {
                                vm.allOrders.children.push(vm.orders[i]);
                            }
                        }
                    }
                }
            }
        };

        vm.removeOrder = function (order) {
            vm.deleteObject('ORDER', order.name, order.path, order);
        };

        vm.openSidePanel = function (title) {
            vm.openSidePanelG(title);
            if (title === 'runTime') {
                vm.joe = true;
                vm.order = angular.copy(vm._order);
                if (vm._order.runTime) {
                    if (vm._order.runTime.calendars) {
                        let cal = JSON.parse(vm._order.runTime.calendars);
                        vm.calendars = cal ? cal.calendars : null;
                    }
                }
            } else if (title === 'parameter') {
                if (!vm._order.params) {
                    vm._order.params = {paramList: [], includes: []};
                }
                if (!vm._order.params.paramList) {
                    vm._order.params.paramList = [];
                }
                if (!vm._order.params.includes) {
                    vm._order.params.includes = [];

                }
                if (vm._order.params.paramList && vm._order.params.paramList.length === 0) {
                    vm.addParameter();
                }
                if (vm._order.params.includes && vm._order.params.includes.length === 0) {
                    vm.addIncludes();
                }
            } else {
                vm.tempOrderNodeparams = angular.copy(vm.orderNodeparams);
                vm.addNodeParameter();
            }
        };

        vm.closeSidePanel1 = function (close) {
            if (vm.obj) {
                if (vm.obj.type === 'runTime') {
                    vm._order.runTime = vm.obj.run_time;
                    if (vm.obj.calendars && vm.obj.calendars.length > 0) {
                        vm._order.runTime.calendars = JSON.stringify({calendars: vm.obj.calendars});
                    } else if(vm._order.runTime.calendars){
                        delete vm._order.runTime['calendars'];
                    }
                    storeObject();
                }
                if (vm.obj.type === 'parameter') {
                    storeObject();
                } else if (vm.obj.type === 'nodeParameter') {
                    storeNodeParam();
                }
                vm.calendars = null;
                vm.closeSidePanel();
            }
        };

        function storeNodeParam() {
            if (vm.orderNodeparams && vm.permission && vm.permission.JobschedulerMaster && vm.permission.JobschedulerMaster.administration.configurations.edit) {
                EditorService.clearEmptyData(vm.orderNodeparams);
                EditorService.clearEmptyData(vm.tempOrderNodeparams);
                if (vm.tempOrderNodeparams && !angular.equals(vm.tempOrderNodeparams, vm.orderNodeparams)) {
                    let _path = '';
                    if (vm._order.path === '/') {
                        _path = vm._order.path + vm._order.name;
                    } else {
                        _path = vm._order.path + '/' + vm._order.name;
                    }
                    let conf = {
                        jobChain: {
                            "name": vm._order.jobChain, order: vm.orderNodeparams
                        }
                    };

                    if (vm._order.path && vm._order.name) {
                        EditorService.store({
                            jobschedulerId: vm.schedulerIds.selected,
                            objectType: 'NODEPARAMS',
                            path: _path,
                            configuration: conf
                        }).then(function () {

                        }, function (err) {
                            vm.checkIsFolderLock(err, vm._order.path, function (result) {
                                if (result === 'yes') {
                                    EditorService.store({
                                        jobschedulerId: vm.schedulerIds.selected,
                                        objectType: 'NODEPARAMS',
                                        path: _path,
                                        configuration: conf
                                    })
                                }
                            });
                        })
                    }
                }
            }
        }

        vm.onKeyPress = function ($event, type) {
            let key = $event.keyCode || $event.which;
            if (key == '13') {
                if (type === 'nodeParam') {
                    vm.addNodeParameter();
                } else if (type === 'param') {
                    vm.addParameter();
                } else {
                    vm.addIncludes();
                }
            }
        };

        vm.addParameter = function () {
            let param = {
                name: '',
                value: ''
            };
            if (!EditorService.isLastEntryEmpty(vm._order.params.paramList, 'name', '')) {
                vm._order.params.paramList.push(param);
            }
        };

        vm.removeParams = function (index) {
            vm._order.params.paramList.splice(index, 1);
        };

        vm.addNodeParameter = function () {
            let param = {
                name: '',
                value: ''
            };
            if (!vm.nodeparams.paramList) {
                vm.nodeparams.paramList = [];
            }
            if (!EditorService.isLastEntryEmpty(vm.nodeparams.paramList, 'name', '')) {
                vm.nodeparams.paramList.push(param);
            }
        };

        vm.removeNodeParams = function (index) {
            vm.nodeparams.paramList.splice(index, 1);
        };

        vm.changeFileType = function (data) {
            if (data.select === 'file') {
                if (!data.file) {
                    data.file = data.liveFile || '';
                }
                delete data['liveFile'];
            } else {
                if (!data.liveFile) {
                    data.liveFile = data.file || '';
                }
                delete data['file'];
            }
        };

        vm.addIncludes = function () {
            let includesParam = {
                select: 'file',
                file: '',
                node: ''
            };
            if (!EditorService.isLastEntryEmpty(vm._order.params.includes, 'file', 'liveFile')) {
                vm._order.params.includes.push(includesParam);
            }
        };

        vm.removeIncludes = function (index) {
            vm._order.params.includes.splice(index, 1);
        };

        vm.getSelectedJobChainData = function (data, path, rename) {
            let _path;
            if (path === '/') {
                _path = path + data;
            } else {
                _path = path + '/' + data;
            }
            EditorService.getFile({
                jobschedulerId: vm.schedulerIds.selected,
                objectType: 'JOBCHAIN',
                path: _path,
            }).then(function (res) {
                vm.jobChainNodes = res.configuration.jobChainNodes;
            });
            if (rename) {
                let name = vm._order.jobChain + ',' + vm._order.orderId;
                let oldPath = '', newPath = '';
                if (path === '/') {
                    newPath = path + name;
                    oldPath = path + vm._order.name;
                } else {
                    newPath = path + '/' + name;
                    oldPath = path + '/' + vm._order.name;
                }
                if (newPath !== oldPath) {
                    EditorService.rename({
                        jobschedulerId: vm.schedulerIds.selected,
                        objectType: 'ORDER',
                        path: newPath,
                        oldPath: oldPath,
                    }).then(function () {
                        vm._order.name = name;
                        vm._tempOrder.name = name;
                    }, function (err) {
                        vm.checkIsFolderLock(err, path, function (result) {
                            if (result === 'yes') {
                                EditorService.rename({
                                    jobschedulerId: vm.schedulerIds.selected,
                                    objectType: 'ORDER',
                                    path: newPath,
                                    oldPath: oldPath,
                                }).then(function () {
                                    vm._order.name = name;
                                    vm._tempOrder.name = name;
                                });
                            }
                        });
                    });
                }
            }
        };

        function getNodeParam() {
            vm.global = {node: 'global'};
            let _path;
            if (vm._order.path === '/') {
                _path = vm._order.path + vm._order.name;
            } else {
                _path = vm._order.path + '/' + vm._order.name;
            }
            EditorService.getFile({
                jobschedulerId: vm.schedulerIds.selected,
                path: _path,
                objectType: 'NODEPARAMS',
            }).then(function (res) {
                if (res.configuration && res.configuration.jobChain && res.configuration.jobChain.order) {
                    vm.orderNodeparams = res.configuration.jobChain.order;
                }
                if (!vm.orderNodeparams) {
                    vm.orderNodeparams = {params: {}};
                }
                vm.changeGlobalNode();
            });
        }

        vm.changeGlobalNode = function () {
            if (vm.global.node === 'global') {
                if (!vm.orderNodeparams.params) {
                    vm.orderNodeparams.params = {};
                }
                vm.nodeparams = vm.orderNodeparams.params;
            } else {
                if (!vm.orderNodeparams.jobChainNodes) {
                    vm.orderNodeparams.jobChainNodes = [];
                }
                let flag = false;
                if (vm.orderNodeparams.jobChainNodes && vm.orderNodeparams.jobChainNodes.length > 0) {
                    for (let i = 0; i < vm.orderNodeparams.jobChainNodes.length; i++) {
                        if (vm.orderNodeparams.jobChainNodes[i].state === vm.global.node) {
                            vm.nodeparams = vm.orderNodeparams.jobChainNodes[i].params || {};
                            flag = true;
                            break;
                        }
                    }
                }
                if (!flag) {
                    vm.orderNodeparams.jobChainNodes.push({state: vm.global.node, params: {}});
                    vm.nodeparams = vm.orderNodeparams.jobChainNodes[vm.orderNodeparams.jobChainNodes.length - 1].params;
                }
            }
            if (!vm.nodeparams.paramList) {
                vm.nodeparams.paramList = [];
            }
        };

        function getAllOrders(obj) {
            if (obj) {
                for (let i = 0; i < obj.folders.length; i++) {
                    if (obj.folders[i].object === 'ORDER') {
                        vm.allOrders = obj.folders[i];
                        break;
                    }
                }
            }
        }

        function storeObject() {
            if (vm._order && vm._order.name) {
                if (vm._tempOrder) {
                    if (vm._order["selected"] != undefined) {
                        vm._tempOrder["selected"] = angular.copy(vm._order["selected"]);
                    }
                    vm._tempOrder["selected1"] = angular.copy(vm._order["selected1"]);
                    vm._tempOrder["current"] = angular.copy(vm._order["current"]);
                }
                EditorService.clearEmptyData(vm._order);
                EditorService.clearEmptyData(vm._tempOrder);

                if (vm._tempOrder.deployed !== vm._order.deployed) {
                    vm._tempOrder.deployed = vm._order.deployed;
                }
                if (vm._tempOrder.deleted !== vm._order.deleted) {
                    vm._tempOrder.deleted = vm._order.deleted;
                }
                if (!angular.equals(angular.toJson(vm._tempOrder), angular.toJson(vm._order)) && vm._tempOrder.name === vm._order.name) {
                    if (!vm.extraInfo.lockedSince) {
                        vm.lockObject(vm._order);
                    }
                    if (!vm._order.deleted) {
                        let name = angular.copy(vm._order.name);
                        vm.storeObject(vm._order, vm._order, null, function (result) {
                            if (name === vm._order.name) {
                                setTimeout(function () {
                                    isStored = true;
                                }, 1000);
                                if (!result || result !== 'no') {
                                    vm.extraInfo.storeDate = new Date();
                                    vm._tempOrder = angular.copy(vm._order);
                                } else {
                                    let defaultObjects = ['name', 'deleted', 'deployed', 'selected1', 'type', 'message', 'path', '$$hashKey'];
                                    for (let propName in vm._order) {
                                        if (typeof propName === 'string' && defaultObjects.indexOf(propName) === -1) {
                                            delete vm._order[propName];
                                        }
                                    }
                                    vm._order = angular.merge(vm._order, vm._tempOrder);
                                    vm._tempOrder = angular.copy(vm._order);
                                }
                            }
                        });
                    }
                } else {
                    isStored = true;
                }
            }
        }

        vm.$on('RELOAD', function (evt, order) {
            if (vm.extraInfo && vm.jobChain) {
                if (order && order.folders && order.folders.length > 7) {
                    vm.jobChains = order.folders[1].children || [];
                    let orders = order.folders[2].children || [];
                    vm.orders = [];
                    if (orders && orders.length > 0) {
                        for (let i = 0; i < orders.length; i++) {
                            if (orders[i].jobChain === vm.jobChain.name) {
                                vm.orders.push(orders[i]);
                            }
                        }
                    }
                    vm.checkLockedBy(order, null, vm.extraInfo);
                } else if (order) {
                    if (vm.jobChain.name === order.name && vm.jobChain.path === order.path) {
                        vm.removeSection();
                    }
                }
            }
        });

        vm.$on('UPDATE_TEMP', function (evt, obj) {
            if (vm._order && vm._order.name === obj.name && vm._order.path === obj.path) {
                vm._tempOrder = angular.copy(vm._order);
            }
        });

        vm.$on('NEW_PARAM', function (evt, obj) {
            initConfig();
            vm.setLastSection(null);
            if (obj.superParent) {
                vm.checkLockedBy(obj.superParent, null, vm.extraInfo);
            }
            vm.jobChain = obj.parent;
            getAllOrders(obj.superParent);
            if (obj.superParent && obj.superParent.folders && obj.superParent.folders.length > 0) {
                let orders = obj.superParent.folders[2].children;
                vm.jobChains = obj.superParent.folders[1].children || [];
                vm.orders = [];
                if (orders && orders.length > 0) {
                    for (let i = 0; i < orders.length; i++) {
                        if (orders[i].jobChain === vm.jobChain.name) {
                            vm.orders.push(orders[i]);
                        }
                    }
                }
            }
            vm._order = undefined;
            if (obj.object && obj.object.type === 'ORDER' && obj.object.path) {
                vm.createOrder(obj.object);
            }
        });

        var watcher1 = null, isStored = false;

        function detectChanges() {
            if (watcher1) {
                watcher1();
            }
            watcher1 = $scope.$watchCollection('_order', function (newValues, oldValues) {
                if (newValues && oldValues && newValues !== oldValues && isStored && vm._order.orderId === vm._tempOrder.orderId && vm._order.jobChain === vm._tempOrder.jobChain) {
                    isStored = false;
                    storeObject();
                }
            });
        }

        $scope.$on('$destroy', function () {
            if (watcher1) {
                watcher1();
            }
            if (vm._order) {
                delete vm._order['current'];
            }
            vm.closeSidePanel1(true);
        });
    }

    ProcessClassEditorCtrl.$inject = ['$scope'];

    function ProcessClassEditorCtrl($scope) {
        const vm = $scope;
        vm.filter = {'sortBy': 'name', sortReverse: false};
        vm.processClasses = [];

        vm.sortBy1 = function (data) {
            vm.filter.sortBy = data;
            vm.filter.sortReverse = !vm.filter.sortReverse;
        };

        vm.createProcessClass = function (processClass) {
            if (processClass) {
                vm.navFullTree(vm.extraInfo.path, 'PROCESSCLASS');
                processClass.selected1 = true;
                vm.getFileObject(processClass, processClass.path, function () {
                    vm.processClass = processClass;
                    vm.processClass.current = true;
                    vm._tempProcessClass = angular.copy(vm.processClass);
                    vm.setLastSection(vm.processClass);
                });
            } else {
                vm.createNewProcessClass(vm.processClasses);
            }
        };

        vm.removeProcessClass = function (processClass) {
            vm.deleteObject('PROCESSCLASS', processClass.name, processClass.path, processClass);
        };

        function storeObject() {
            if (vm.processClass && vm.processClass.name) {
                if (!vm.extraInfo.lockedSince) {
                    vm.lockObject(vm.processClass);
                }
                if (!vm.processClass.deleted) {
                    if (vm._tempProcessClass) {
                        vm._tempProcessClass["selected1"] = angular.copy(vm.processClass["selected1"]);
                        vm._tempProcessClass["path"] = angular.copy(vm.processClass["path"]);
                        vm._tempProcessClass["current"] = angular.copy(vm.processClass["current"]);
                    }
                    if (!angular.equals(angular.toJson(vm._tempProcessClass), angular.toJson(vm.processClass))) {
                        vm.storeObject(vm.processClass, vm.processClass, null, function (result) {
                            if (!result || result !== 'no') {
                                vm.extraInfo.storeDate = new Date();
                                vm._tempProcessClass = angular.copy(vm.processClass);
                            } else {
                                let defaultObjects = ['name', 'deleted', 'deployed', 'selected1', 'type', 'expanded', 'message', 'path', '$$hashKey'];
                                for (let propName in vm.processClass) {
                                    if (typeof propName === 'string' && defaultObjects.indexOf(propName) === -1) {
                                        delete vm.processClass[propName];
                                    }
                                }
                                vm.processClass = angular.merge(vm.processClass, vm._tempProcessClass);
                                vm._tempProcessClass = angular.copy(vm.processClass);
                            }
                        });
                    }
                }
            }
        }

        vm.update = function () {
            storeObject();
        };

        vm.$on('RELOAD', function (evt, processClass) {
            if (vm.extraInfo && processClass && processClass.folders && processClass.folders.length > 7) {
                vm.processClasses = processClass.folders[3].children || [];
                vm.checkLockedBy(processClass, null, vm.extraInfo);
            }
        });

        vm.$on('NEW_OBJECT', function (evt, processClass) {
            vm.extraInfo = {};
            vm.checkLockedBy(processClass.data, processClass.parent, vm.extraInfo);
            vm.extraInfo.path = processClass.data.parent;
            if (processClass.data.type) {
                vm.processClass = processClass.data;
                vm.processClass.current = true;
                vm._tempProcessClass = angular.copy(vm.processClass);
                vm.processClasses = processClass.parent.folders[3].children || [];
            } else {
                vm.processClasses = processClass.data.children || [];
                vm.processClass = undefined;
                vm._tempProcessClass = undefined;
            }
            vm.setLastSection(vm.processClass);
        });

        $scope.$on('$destroy', function () {
            if (vm.processClass) {
                delete vm.processClass['current'];
            }
        });
    }

    AgentClusterEditorCtrl.$inject = ['$scope', 'EditorService'];

    function AgentClusterEditorCtrl($scope, EditorService) {
        const vm = $scope;
        vm.filter = {'sortBy': 'name', sortReverse: false};
        vm.agentClusters = [];

        vm.sortBy1 = function (data) {
            vm.filter.sortBy = data;
            vm.filter.sortReverse = !vm.filter.sortReverse;
        };

        vm.createAgentCluster = function (agentCluster) {
            if (agentCluster) {
                vm.navFullTree(vm.extraInfo.path, 'AGENTCLUSTER');
                agentCluster.selected1 = true;
                vm.getFileObject(agentCluster, agentCluster.path, function () {
                    vm.agentCluster = agentCluster;
                    vm.agentCluster.current = true;

                    if (!vm.agentCluster.remoteSchedulers) {
                        vm.agentCluster.remoteSchedulers = {remoteSchedulerList: []};
                    }
                    vm._tempAgentCluster = angular.copy(vm.agentCluster);
                    vm.setLastSection(vm.agentCluster);
                });
            } else {
                vm.createNewAgentCluster(vm.agentClusters);
            }
        };

        vm.removeAgentCluster = function (agentCluster) {
            vm.deleteObject('AGENTCLUSTER', agentCluster.name, agentCluster);
        };

        vm.addRemoteSchedulers = function () {
            let param = {
                remoteScheduler: '',
                httpHeartbeatTimeout: '',
                httpHeartbeatPeriod: ''
            };
            if (!EditorService.isLastEntryEmpty(vm.agentCluster.remoteSchedulers.remoteSchedulerList, 'remoteScheduler')) {
                vm.agentCluster.remoteSchedulers.remoteSchedulerList.push(param);
            }
        };

        vm.removeRemoteSchedulers = function (index, host) {
            vm.agentCluster.remoteSchedulers.remoteSchedulerList.splice(index, 1);
            if (host.remoteScheduler) {
                storeObject();
            }
        };

        function storeObject() {
            if (vm.agentCluster && vm.agentCluster.name) {
                if (!vm.extraInfo.lockedSince) {
                    vm.lockObject(vm.agentCluster);
                }
                if (!vm.agentCluster.deleted) {
                    if (vm._tempAgentCluster) {
                        vm._tempAgentCluster["selected1"] = angular.copy(vm.agentCluster["selected1"]);
                        vm._tempAgentCluster["path"] = angular.copy(vm.agentCluster["path"]);
                        vm._tempAgentCluster["current"] = angular.copy(vm.agentCluster["current"]);
                    }
                    if (!angular.equals(angular.toJson(vm._tempAgentCluster), angular.toJson(vm.agentCluster))) {
                        vm.storeObject(vm.agentCluster, vm.agentCluster, null, function (result) {
                            if (!result || result !== 'no') {
                                vm.extraInfo.storeDate = new Date();
                                vm._tempAgentCluster = angular.copy(vm.agentCluster);
                            } else {
                                let defaultObjects = ['name', 'deleted', 'deployed', 'selected1', 'type', 'expanded', 'message', 'path', '$$hashKey'];
                                for (let propName in vm.agentCluster) {
                                    if (typeof propName === 'string' && defaultObjects.indexOf(propName) === -1) {
                                        delete vm.agentCluster[propName];
                                    }
                                }
                                vm.agentCluster = angular.merge(vm.agentCluster, vm._tempAgentCluster);
                                vm._tempAgentCluster = angular.copy(vm.agentCluster);
                            }

                        });
                    }
                }
            }
        }

        vm.update = function (form) {
            if (!form.$invalid) {
                storeObject();
            }
        };

        vm.$on('RELOAD', function (evt, agentCluster) {
            if (vm.extraInfo && agentCluster && agentCluster.folders && agentCluster.folders.length > 7) {
                vm.agentClusters = agentCluster.folders[4].children || [];
                vm.checkLockedBy(agentCluster, null, vm.extraInfo);
            }
        });

        vm.$on('NEW_OBJECT', function (evt, agentCluster) {
            vm.extraInfo = {};
            vm.checkLockedBy(agentCluster.data, agentCluster.parent, vm.extraInfo);
            vm.extraInfo.path = agentCluster.data.parent;
            if (agentCluster.data.type) {
                vm.agentCluster = agentCluster.data;
                vm.agentCluster.current = true;
                if (!vm.agentCluster.remoteSchedulers) {
                    vm.agentCluster.remoteSchedulers = {remoteSchedulerList: []};
                }
                vm._tempAgentCluster = angular.copy(vm.agentCluster);
                vm.agentClusters = agentCluster.parent.folders[4].children || [];
            } else {
                vm.agentClusters = agentCluster.data.children || [];
                vm.agentCluster = undefined;
                vm._tempAgentCluster = undefined;
            }
            vm.setLastSection(vm.agentCluster);
        });
        $scope.$on('$destroy', function () {
            if (vm.agentCluster) {
                delete vm.agentCluster['current'];
            }
        });
    }

    ScheduleEditorCtrl.$inject = ['$scope'];

    function ScheduleEditorCtrl($scope) {
        const vm = $scope;
        vm.filter = {'sortBy': 'name', sortReverse: false};
        vm.schedules = [];

        vm.sortBy1 = function (data) {
            vm.filter.sortBy = data;
            vm.filter.sortReverse = !vm.filter.sortReverse;
        };

        vm.createSchedule = function (schedule) {
            if (schedule) {
                vm.navFullTree(vm.extraInfo.path, 'SCHEDULE');
                schedule.selected1 = true;
                vm.getFileObject(schedule, schedule.path, function () {
                    vm.schedule = schedule;
                    vm.schedule.current = true;
                    setDates(vm.schedule);
                    vm._tempSchedule = angular.copy(vm.schedule);
                    vm.setLastSection(vm.schedule);
                });
            } else {
                vm.createNewSchedule(vm.schedules);
            }
        };

        vm.removeSchedule = function (schedule) {
            vm.deleteObject('SCHEDULE', schedule.name, schedule.path, schedule);
        };

        vm.getSubstituteTreeStructure = function () {
            vm.getObjectTreeStructure('SCHEDULE', function (data) {
                vm.schedule.substitute = data.schedule;
            });
        };

        vm.error = {};
        vm.checkDate = function () {
            vm.schedule.validFrom = undefined;
            if (!vm.schedule.fromTime) {
                vm.schedule.fromTime = '00:00';
            }
            if (!vm.schedule.toTime) {
                vm.schedule.toTime = '00:00';
            }
            if (vm.schedule.fromTime && vm.schedule.fromDate) {
                let date = new Date(vm.schedule.fromDate);
                date.setHours(vm.schedule.fromTime.substring(0, 2));
                date.setMinutes(vm.schedule.fromTime.substring(3, 5));
                if (vm.schedule.fromTime.substring(6, 8)) {
                    date.setSeconds(vm.schedule.fromTime.substring(6, 8));
                } else {
                    date.setSeconds(0);
                }
                vm.schedule.validFrom = moment(date).format('YYYY-MM-DD HH:mm:ss');
            }
            vm.schedule.validTo = undefined;
            if (vm.schedule.toTime && vm.schedule.toDate) {
                let date = new Date(vm.schedule.toDate);
                date.setHours(vm.schedule.toTime.substring(0, 2));
                date.setMinutes(vm.schedule.toTime.substring(3, 5));
                if (vm.schedule.toTime.substring(6, 8)) {
                    date.setSeconds(vm.schedule.toTime.substring(6, 8));
                } else {
                    date.setSeconds(0);
                }
                vm.schedule.validTo = moment(date).format('YYYY-MM-DD HH:mm:ss');
            }

            if (vm.schedule.validFrom && vm.schedule.validTo) {
                vm.error.validDate = moment(vm.schedule.validFrom).diff(moment(vm.schedule.validTo)) > 0;
                if (!vm.error.validDate) {
                    if (!vm.schedule.showText) {
                        vm.schedule.showText = true;
                    }
                }
            } else {
                if (!vm.schedule.showText)
                    vm.error.validDate = true;
            }
            if (!vm.error.validDate) {
                storeObject();
            }
        };

        vm.openSidePanel = function () {
            vm.joe = true;
            if (vm.schedule.calendars) {
                let cal = JSON.parse(vm.schedule.calendars);
                vm.calendars = cal ? cal.calendars : null;
            }
            vm.openSidePanelG('runTime');
            vm.sch = {};
            vm._tempSchedule = angular.copy(vm.schedule);
        };

        vm.closeSidePanel1 = function (close) {
            if (vm.obj) {
                if (vm.obj.type === 'runTime') {
                    storeRuntime(vm.obj, close);
                }
                vm.calendars = null;
                vm.closeSidePanel();
            }
        };

        function storeRuntime(obj, close) {
            let defaultObjects = ['name', 'deleted', 'deployed', 'selected1', 'type', 'message', 'path', 'current', '$$hashKey'];
            for (let propName in vm.schedule) {
                if (typeof propName === 'string' && defaultObjects.indexOf(propName) === -1) {
                    delete vm.schedule[propName];
                }
            }
            setDates(obj.schedule);
            vm.schedule = angular.merge(vm.schedule, obj.schedule);
            if (obj.calendars && obj.calendars.length > 0) {
                vm.schedule.calendars = JSON.stringify({calendars: obj.calendars});
            } else if(vm.schedule.calendars){
                delete vm.schedule['calendars'];
            }
            if (vm.schedule) {
                storeObject();
            }
        }

        function setDates(data) {
            if (data.validFrom) {
                vm.schedule.fromDate = data.validFrom;
                let d = new Date(data.validFrom),
                    h = d.getHours(), m = d.getMinutes(), s = d.getSeconds();
                h = h > 9 ? h : '0' + h;
                m = m > 9 ? m : '0' + m;
                s = s > 9 ? s : '0' + s;
                vm.schedule.fromTime = h + ':' + m + ':' + s;
            }
            if (data.validTo) {
                vm.schedule.toDate = data.validTo;
                let d = new Date(data.validTo),
                    h = d.getHours(), m = d.getMinutes(), s = d.getSeconds();
                h = h > 9 ? h : '0' + h;
                m = m > 9 ? m : '0' + m;
                s = s > 9 ? s : '0' + s;
                vm.schedule.toTime = h + ':' + m + ':' + s;
            }
        }

        function storeObject() {
            if (vm.schedule && vm.schedule.name) {
                if (!vm.extraInfo.lockedSince) {
                    vm.lockObject(vm.schedule);
                }
                if (!vm.schedule.deleted) {
                    if (vm._tempSchedule) {
                        vm._tempSchedule["selected1"] = angular.copy(vm.schedule["selected1"]);
                        vm._tempSchedule["path"] = angular.copy(vm.schedule["path"]);
                        vm._tempSchedule["current"] = angular.copy(vm.schedule["current"]);
                    }

                    if (!angular.equals(angular.toJson(vm._tempSchedule), angular.toJson(vm.schedule))) {
                        let name = angular.copy(vm.schedule.name);
                        vm.storeObject(vm.schedule, vm.schedule, null, function (result) {
                            if (vm.schedule.name === name) {
                                if (!result || result !== 'no') {
                                    vm.extraInfo.storeDate = new Date();
                                    vm._tempSchedule = angular.copy(vm.schedule);
                                } else {
                                    let defaultObjects = ['name', 'deleted', 'deployed', 'selected1', 'type', 'expanded', 'message', 'path', '$$hashKey'];
                                    for (let propName in vm.schedule) {
                                        if (typeof propName === 'string' && defaultObjects.indexOf(propName) === -1) {
                                            delete vm.schedule[propName];
                                        }
                                    }
                                    vm.schedule = angular.merge(vm.schedule, vm._tempSchedule);
                                    vm._tempSchedule = angular.copy(vm.schedule);
                                }
                            }
                        });
                    }
                }
            }
        }

        vm.update = function () {
            storeObject();
        };

        vm.$on('RELOAD', function (evt, schedule) {
            if (vm.extraInfo && schedule && schedule.folders && schedule.folders.length > 7) {
                vm.schedules = schedule.folders[5].children || [];
                vm.checkLockedBy(schedule, null, vm.extraInfo);
            }
        });

        vm.$on('NEW_OBJECT', function (evt, schedule) {
            if (vm.schedule) {
                vm.closeSidePanel1(close);
            }
            vm.extraInfo = {};
            vm.checkLockedBy(schedule.data, schedule.parent, vm.extraInfo);
            vm.extraInfo.path = schedule.data.parent;
            if (schedule.data.type) {
                vm.schedule = schedule.data;
                vm.schedule.current = true;
                setDates(vm.schedule);
                vm._tempSchedule = angular.copy(vm.schedule);
                vm.schedules = schedule.parent.folders[5].children || [];
            } else {
                vm.schedules = schedule.data.children || [];
                vm.schedule = undefined;
                vm._tempSchedule = undefined;
            }
            vm.setLastSection(vm.schedule);
        });

        $scope.$on('$destroy', function () {
            if (vm.schedule) {
                delete vm.schedule['current'];
            }
            vm.closeSidePanel1(close);
        });
    }

    LockEditorCtrl.$inject = ['$scope'];

    function LockEditorCtrl($scope) {
        const vm = $scope;
        vm.filter = {'sortBy': 'name', sortReverse: false};
        vm.locks = [];
        vm.sortBy1 = function (data) {
            vm.filter.sortBy = data;
            vm.filter.sortReverse = !vm.filter.sortReverse;
        };

        vm.createLock = function (lock) {
            if (lock) {
                vm.navFullTree(vm.extraInfo.path, 'LOCK');
                lock.selected1 = true;
                vm.getFileObject(lock, lock.path, function () {
                    vm.lock = lock;
                    vm.lock.current = true;
                    vm.lock.checkbox = !vm.lock.maxNonExclusive;
                    vm._tempLock = angular.copy(vm.lock);
                    vm.setLastSection(vm.lock);
                });
            } else {
                vm.createNewLock(vm.locks);
            }
        };

        vm.removeLock = function (lock) {
            vm.deleteObject('LOCK', lock.name, lock.path, lock);
        };

        function storeObject() {
            if (vm.lock && vm.lock.name) {
                if (vm.lock.checkbox && vm.lock.maxNonExclusive) {
                    vm.lock.maxNonExclusive = null;
                }
                if (!vm.extraInfo.lockedSince) {
                    vm.lockObject(vm.lock);
                }
                if (!vm.lock.deleted) {
                    if (vm._tempLock) {
                        vm._tempLock["selected1"] = angular.copy(vm.lock["selected1"]);
                        vm._tempLock["path"] = angular.copy(vm.lock["path"]);
                        vm._tempLock["current"] = angular.copy(vm.lock["current"]);
                    }
                    if (!angular.equals(angular.toJson(vm._tempLock), angular.toJson(vm.lock))) {
                        vm.storeObject(vm.lock, vm.lock, null, function (result) {
                            if (!result || result !== 'no') {
                                vm.extraInfo.storeDate = new Date();
                                vm.lock.checkbox = !vm.lock.maxNonExclusive;
                                vm._tempLock = angular.copy(vm.lock);
                            } else {
                                let defaultObjects = ['name', 'deleted', 'deployed', 'selected1', 'type', 'expanded', 'message', 'path', '$$hashKey'];
                                for (let propName in vm.lock) {
                                    if (typeof propName === 'string' && defaultObjects.indexOf(propName) === -1) {
                                        delete vm.lock[propName];
                                    }
                                }
                                vm.lock = angular.merge(vm.lock, vm._tempLock);
                                vm._tempLock = angular.copy(vm.lock);
                            }

                        });
                    }
                }
            }
        }

        vm.update = function () {
            storeObject();
        };

        vm.$on('RELOAD', function (evt, lock) {
            if (vm.extraInfo && lock && lock.folders && lock.folders.length > 7) {
                vm.locks = lock.folders[6].children || [];
                vm.checkLockedBy(lock, null, vm.extraInfo);
            }
        });

        vm.$on('NEW_OBJECT', function (evt, lock) {
            vm.extraInfo = {};
            vm.checkLockedBy(lock.data, lock.parent, vm.extraInfo);
            vm.extraInfo.path = lock.data.parent;
            if (lock.data.type) {
                vm.lock = lock.data;
                vm.lock.checkbox = !vm.lock.maxNonExclusive;
                vm.lock.current = true;
                vm._tempLock = angular.copy(vm.lock);
                vm.locks = lock.parent.folders[6].children || [];
            } else {
                vm.locks = lock.data.children || [];
                vm.lock = undefined;
                vm._tempLock = undefined;
            }
            vm.setLastSection(vm.lock);
        });

        $scope.$on('$destroy', function () {
            if (vm.lock) {
                delete vm.lock['current'];
            }
        });
    }

    MonitorEditorCtrl.$inject = ['$scope', 'EditorService'];

    function MonitorEditorCtrl($scope, EditorService) {
        const vm = $scope;
        vm.filter = {'sortBy': 'name', sortReverse: false};
        vm.include = {select: 'file'};
        vm.monitors = [];
        vm.functionalCodeValue = ['spooler_task_before', 'spooler_task_after', 'spooler_process_before', 'spooler_process_after'];
        vm.languages = ['java', 'dotnet', 'java:javascript', 'perlScript', 'powershell', 'VBScript', 'scriptcontrol:vbscript', 'javax.script:rhino', 'javax.script:ecmascript', 'javascript'];
        vm.favourites = ['configuration_monitor', 'create_event_monitor'];
        vm.extraInfo = {};
        vm.activeTab = 'tab1';

        vm.sortBy1 = function (data) {
            vm.filter.sortBy = data;
            vm.filter.sortReverse = !vm.filter.sortReverse;
        };

        vm.changeTab = function (tab, lang) {
            if (tab) {
                vm.activeTab = tab;
            } else if (lang) {
                if (lang === 'java' || lang === 'dotnet') {
                    vm.activeTab = 'tab2';
                } else if (vm.activeTab === 'tab2') {
                    vm.activeTab = 'tab1';
                }
            }
            storeObject();
        };

        vm.createMonitor = function (monitor) {
            if (vm.job && vm.job.monitors) {
                if (monitor) {
                    vm.monitor = monitor;
                } else {
                    let obj = {
                        name: vm.getName(vm.job.monitors, 'process0', 'name', 'process'),
                        script: {language: 'java'},
                        ordering: vm.job.monitors.length > 0 ? (vm.job.monitors[vm.job.monitors.length - 1].ordering + 1) : 0,
                        param: 'MONITOR'
                    };
                    vm.job.monitors.push(obj);
                    storeObject();
                }
            } else {
                if (monitor) {
                    vm.navFullTree(vm.extraInfo.path, 'MONITOR');
                    monitor.selected1 = true;
                    vm.getFileObject(monitor, monitor.path, function () {
                        vm.monitor = monitor;
                        vm.monitor.current = true;
                        vm._tempMonitor = angular.copy(vm.monitor);
                        if (vm.monitor.script && vm.monitor.script.language === 'java' || vm.monitor.script.language === 'dotnet') {
                            vm.activeTab = 'tab2';
                        }
                        vm.setLastSection(vm.monitor);
                    });
                } else {
                    vm.createNewMonitor(vm.monitors);
                }
            }
        };

        vm.removeMonitor = function (monitor) {
            if (vm.job && vm.job.monitors) {
                for (let i = 0; i < vm.job.monitors.length; i++) {
                    if (vm.job.monitors[i].name === monitor.name) {
                        vm.job.monitors.splice(i, 1);
                        storeObject();
                        break;
                    }
                }
            } else {
                vm.deleteObject('MONITOR', monitor.name, monitor.path, monitor);
            }
        };

        vm.addFile = function () {
            if (vm._tempFile) {
                for (let i = 0; i < vm.monitor.script.includes.length; i++) {
                    if (angular.equals(vm.monitor.script.includes[i], vm._tempFile)) {
                        vm.monitor.script.includes[i] = {};
                        if (vm.include.select === "file") {
                            vm.monitor.script.includes[i].file = vm.include.fileName;
                        } else {
                            vm.monitor.script.includes[i].liveFile = vm.include.fileName;
                        }
                        vm._tempFile = undefined;
                        vm.include = {select: 'file'};
                        break;
                    }
                }
            } else {
                if (!vm.monitor.script.includes) {
                    vm.monitor.script.includes = [];
                }
                let x = {};
                if (vm.include.select === "file") {
                    x.file = vm.include.fileName;
                } else {
                    x.liveFile = vm.include.fileName;
                }
                vm.monitor.script.includes.push(x);
                vm.include = {select: 'file'};
            }
            storeObject();
        };

        vm.editFile = function (data) {
            vm.include = {};
            if (data.file) {
                vm.include.select = "file";
                vm.include.fileName = data.file;
            } else {
                vm.include.select = "live_file";
                vm.include.fileName = data.liveFile;
            }
            vm._tempFile = angular.copy(data);
        };

        vm.removeFile = function (include) {
            for (let i = 0; i < vm.monitor.script.includes.length; i++) {
                if (vm.monitor.script.includes[i].file === include.file || vm.monitor.script.includes[i].liveFile === include.liveFile) {
                    vm.monitor.script.includes.splice(i, 1);
                    storeObject();
                    break;
                }
            }
        };

        vm.addLangParameter = function (data) {
            if (_.isEmpty(vm.monitor.script)) {
                vm.monitor.script = {language: 'shell'};
            }
            let block = EditorService.getFunctionalCode(data, setLanguage());
            let x = EditorService.highlight(setLanguage(), block);
            let inn = document.getElementById('editor-script').innerHTML;
            vm.monitor.script.content = inn + x;
        };

        function setLanguage() {
            return EditorService.setLanguage(vm.monitor.script.language);
        }

        function setTemplate(obj) {
            if (obj.template == 'configuration_monitor') {
                obj.script = {
                    "language": "java",
                    "javaClass": "com.sos.jitl.jobchainnodeparameter.monitor.JobchainNodeSubstituteMonitor"
                };
            } else {
                obj.script = {
                    "language": "java",
                    "javaClass": "sos.scheduler.job.JobSchedulerSubmitEventMonitor"
                };
            }
            storeObject();
        }

        vm.changeTemplate = function () {
            if (vm.job) {
                vm.monitor.name = vm.monitor.template;
                setTemplate(vm.monitor)
            } else {
                if (vm.monitor.name !== vm.monitor.template) {
                    let path = '', oldPath = '';
                    if (vm.monitor.path === '/') {
                        path = vm.monitor.path + vm.monitor.template;
                        oldPath = vm.monitor.path + vm.monitor.name;
                    } else {
                        path = vm.monitor.path + '/' + vm.monitor.template;
                        oldPath = vm.monitor.path + '/' + vm.monitor.name;
                    }
                    EditorService.rename({
                        jobschedulerId: vm.schedulerIds.selected,
                        objectType: 'MONITOR',
                        path: path,
                        oldPath: oldPath,
                    }).then(function () {
                        vm.monitor.name = vm.monitor.template;
                        vm._tempMonitor.name = angular.copy(vm.monitor.name);
                        setTemplate(vm.monitor);
                    }, function (err) {
                        vm.checkIsFolderLock(err, vm.monitor.path, function (result) {
                            if (result === 'yes') {
                                EditorService.rename({
                                    jobschedulerId: vm.schedulerIds.selected,
                                    objectType: 'MONITOR',
                                    path: path,
                                    oldPath: oldPath,
                                }).then(function () {
                                    vm.monitor.name = vm.monitor.template;
                                    vm._tempMonitor.name = angular.copy(vm.monitor.name);
                                    setTemplate(vm.monitor)
                                });
                            }
                        });
                    });
                }
            }
        };

        vm.applyHighlight = function (script) {
            document.querySelectorAll('div.code').forEach((block) => {
                script.content = EditorService.highlight(EditorService.setLanguage(script.language), block.innerText);
            });
            storeObject();
        };

        function storeObject() {
            if (vm.job && vm.job.name) {
                if (vm._tempJob) {
                    if (vm.job["selected"] != undefined) {
                        vm._tempJob["selected"] = angular.copy(vm.job["selected"]);
                    }
                    vm._tempJob["selected1"] = angular.copy(vm.job["selected1"]);
                    vm._tempJob["expanded"] = angular.copy(vm.job["expanded"]);
                    vm._tempJob["children"] = angular.copy(vm.job["children"]);
                }
                if (vm._tempJob.deployed !== vm.job.deployed) {
                    vm._tempJob.deployed = vm.job.deployed;
                }
                if (vm._tempJob.deleted !== vm.job.deleted) {
                    vm._tempJob.deleted = vm.job.deleted;
                }
                if (!angular.equals(angular.toJson(vm._tempJob), angular.toJson(vm.job)) && vm._tempJob.name === vm.job.name) {
                    if (!vm.extraInfo.lockedSince) {
                        vm.lockObject(vm.job);
                    }
                    let _tempObj = angular.copy(vm.job);
                    if (_tempObj.ignoreSignals && angular.isArray(_tempObj.ignoreSignals)) {
                        _tempObj.ignoreSignals = _tempObj.ignoreSignals.join(' ');
                    }
                    if (_tempObj.script && _tempObj.script.content) {
                        _tempObj.script.content = EditorService.getTextContent(_tempObj.script.content);
                    }
                    if (_tempObj.monitors) {
                        for (let i = 0; i < _tempObj.monitors.length; i++) {
                            if (_tempObj.monitors[i].script && _tempObj.monitors[i].script.content) {
                                _tempObj.monitors[i].script.content = EditorService.getTextContent(_tempObj.monitors[i].script.content);
                            }
                        }
                    }
                    if (!_tempObj.deleted) {
                        vm.storeObject(vm.job, _tempObj, null, function (result) {

                            if (!result || result !== 'no') {
                                vm.extraInfo.storeDate = new Date();
                                vm._tempJob = angular.copy(vm.job);
                            } else {
                                let defaultObjects = ['name', 'deleted', 'deployed', 'selected1', 'type', 'expanded', 'message', 'path', '$$hashKey'];
                                for (let propName in vm.job) {
                                    if (typeof propName === 'string' && defaultObjects.indexOf(propName) === -1) {
                                        delete vm.job[propName];
                                    }
                                }
                                vm.job = angular.merge(vm.job, vm._tempJob);
                                vm._tempJob = angular.copy(vm.job);
                            }

                        });
                    }
                }
            } else {
                if (vm.monitor && vm.monitor.name) {
                    if (vm._tempMonitor) {
                        if (vm.monitor["selected"] != undefined) {
                            vm._tempMonitor["selected"] = angular.copy(vm.monitor["selected"]);
                        }
                        vm._tempMonitor["selected1"] = angular.copy(vm.monitor["selected1"]);
                    }
                    if (vm._tempMonitor.deployed !== vm.monitor.deployed) {
                        vm._tempMonitor.deployed = vm.monitor.deployed;
                    }
                    if (vm._tempMonitor.deleted !== vm.monitor.deleted) {
                        vm._tempMonitor.deleted = vm.monitor.deleted;
                    }
                    if (!angular.equals(angular.toJson(vm._tempMonitor), angular.toJson(vm.monitor)) && vm._tempMonitor.name === vm.monitor.name) {
                        if (!vm.extraInfo.lockedSince) {
                            vm.lockObject(vm.monitor);
                        }
                        let _tempObj = angular.copy(vm.monitor);
                        if (_tempObj.script && _tempObj.script.content) {
                            _tempObj.script.content = EditorService.getTextContent(_tempObj.script.content);
                        }

                        if (!_tempObj.deleted) {
                            vm.storeObject(vm.monitor, _tempObj, null, function (result) {
                                if (!result || result !== 'no') {
                                    vm.extraInfo.storeDate = new Date();
                                    vm._tempMonitor = angular.copy(vm.monitor);
                                } else {
                                    let defaultObjects = ['name', 'deleted', 'deployed', 'selected1', 'type', 'expanded', 'message', 'path', '$$hashKey'];
                                    for (let propName in vm.monitor) {
                                        if (typeof propName === 'string' && defaultObjects.indexOf(propName) === -1) {
                                            delete vm.monitor[propName];
                                        }
                                    }
                                    vm.monitor = angular.merge(vm.monitor, vm._tempMonitor);
                                    vm._tempMonitor = angular.copy(vm.monitor);
                                }

                            });
                        }
                    }

                }
            }
        }

        vm.$on('RELOAD', function (evt, monitor) {
            if (vm.extraInfo && monitor && monitor.folders && monitor.folders.length > 7) {
                if (vm.monitors && !vm.job)
                    vm.monitors = monitor.folders[7].children || [];
                vm.checkLockedBy(monitor, null, vm.extraInfo);
            }
        });

        vm.$on('UPDATE_TEMP', function (evt, obj) {
            if (vm.job && vm.job.name === obj.name && vm.job.path === obj.path) {
                vm._tempJob = angular.copy(vm.job);
            } else {
                if (vm.monitor && vm.monitor.name === obj.name && vm.monitor.path === obj.path) {
                    vm._tempMonitor = angular.copy(vm.monitor);
                }
            }
        });

        vm.$on('NEW_OBJECT', function (evt, monitor) {
            vm.extraInfo = {};
            vm.checkLockedBy(monitor.data, monitor.parent, vm.extraInfo);
            vm.job = undefined;
            vm.extraInfo.path = monitor.data.parent;
            if (monitor.data.type) {
                vm.monitor = monitor.data;
                vm.monitor.current = true;
                vm._tempMonitor = angular.copy(vm.monitor);
                vm.monitors = monitor.parent.folders[7].children || [];
                if (vm.monitor.script && vm.monitor.script.language === 'java' || vm.monitor.script.language === 'dotnet') {
                    vm.activeTab = 'tab2';
                }
            } else {
                vm.monitors = monitor.data.children || [];
                vm.monitor = undefined;
                vm._tempMonitor = undefined;
            }
            vm.setLastSection(vm.monitor);
        });

        vm.$on('NEW_PARAM', function (evt, obj) {
            if (obj.superParent) {
                vm.checkLockedBy(obj.superParent, null, vm.extraInfo);
            }
            vm.job = obj.parent;
            if (!vm.job.monitors) {
                vm.job.monitors = [];
            }

            vm._tempJob = angular.copy(vm.job);
            vm.monitors = vm.job.monitors;
            vm.monitor = undefined;
            vm._tempMonitor = undefined;
            vm.setLastSection(vm.job);
        });

        vm.update = function (form) {
            if (!form.$invalid) {
                storeObject();
            }
        };

        $scope.$on('$destroy', function () {
            storeObject();
        });
    }

    CommandEditorCtrl.$inject = ['$scope', 'EditorService'];

    function CommandEditorCtrl($scope, EditorService) {
        const vm = $scope;
        vm.form = '<from>';
        vm.filter = {'sortBy': 'exitCode', sortReverse: false};
        vm.job = {};
        vm.activeTabInParameter = 'tab11';
        vm.newParameterTab = {activeTab: 'parameter'};
        vm._commands = ['error', 'success', 'SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGHTRAP', 'SIGABRT', 'SIGIOT', 'SIGBUS', 'SIGFPE', 'SIGKILL', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGPIPE', 'SIGALRM', 'SIGTERM', 'SIGSTKFLT', 'SIGCHLD', 'SIGCONT', 'SIGSTOP', 'SIGTSTP', 'SIGTTIN', 'SIGTTOU', 'SIGURG', 'SIGXCPU', 'SIGXFSZ', 'SIGVTALRM', 'SIGPROF', 'SIGWINCH', 'SIGPOLL', 'SIGIO', 'SIGPWR', 'SIGSYS'];
        vm.sortBy1 = function (data) {
            vm.filter.sortBy = data;
            vm.filter.sortReverse = !vm.filter.sortReverse;
        };

        function recursiveCheckName(name) {
            for (let i = 0; i < vm.job.commands.length; i++) {
                if (vm.job.commands[i].onExitCode.toLowerCase() === name) {
                    name = 1;
                    break;
                }
            }
            return name;
        }

        vm.createCommand = function (command) {
            if (command) {
                vm.command = command;
            } else {
                if (!vm.job.commands) {
                    vm.job.commands = [];
                }
                let name = 'error';
                if (vm.job.commands.length > 0) {
                    for (let i = 0; i < vm.job.commands.length; i++) {
                        if (vm.job.commands[i].onExitCode.toLowerCase() === name) {
                            name = 'success';
                            name = recursiveCheckName(name);
                            break;
                        }
                    }
                    if (typeof name === "number") {
                        name = vm.getName(vm.job.commands, '1', 'onExitCode', '');
                    }
                }
                let obj = {
                    onExitCode: name,
                    startJobs: [],
                    type: 'COMMAND'
                };
                vm.job.commands.push(obj);
                storeObject();
            }
        };

        vm.removeCommand = function (command) {
            for (let i = 0; i < vm.job.commands.length; i++) {
                if (vm.job.commands[i].onExitCode === command.onExitCode) {
                    vm.job.commands.splice(i, 1);
                    break;
                }
            }
            storeObject();
        };

        vm.getJobTreeStructure = function (type) {
            vm.getObjectTreeStructure(type, function (data) {
                if (type === 'JOB') {
                    vm.code.job = data.job;
                } else if (type === 'JOBCHAIN') {
                    vm.code.jobChain = data.jobChain;
                }
            });
        };

        vm.addJob = function () {
            vm.isCodeEdit = true;
            vm.isAddOrder = false;
            vm.isEdit = false;
            vm.code = {
                job: '',
                at: '',
                type: 'COMMAND'
            };
        };

        vm.addOrder = function () {
            vm.isCodeEdit = true;
            vm.isAddOrder = true;
            vm.isEdit = false;
            vm.code = {
                jobChain: '',
                at: '',
                type: 'COMMAND'
            };
        };

        vm.applyCode = function () {
            if (vm.isEdit) {
                vm.isCodeEdit = false;
            } else {
                if (vm.isAddOrder) {
                    if (!vm.command.addOrders) {
                        vm.command.addOrders = [];
                    }
                    vm.command.addOrders.push(vm.code);
                    vm.isCodeEdit = false;
                } else {
                    if (!vm.command.startJobs) {
                        vm.command.startJobs = [];
                    }
                    vm.command.startJobs.push(vm.code);
                    vm.isCodeEdit = false;
                }
            }
            storeObject();
        };

        vm.cancel = function (form) {
            vm.code = {};
            vm.isCodeEdit = false;
            if (form) {
                form.$setPristine();
                form.$setUntouched();
                form.$invalid = false;
            }
        };

        vm.removeStartJobCode = function (code) {
            for (let i = 0; i < vm.command.startJobs.length; i++) {
                if (vm.command.startJobs[i].command === code.command && vm.command.startJobs[i].job === code.job && vm.command.startJobs[i].jobChain === code.jobChain) {
                    vm.command.startJobs.splice(i, 1);
                    break;
                }
            }
            storeObject();
        };

        vm.removeAddOrdersCode = function (code) {
            for (let i = 0; i < vm.command.addOrders.length; i++) {
                if (vm.command.addOrders[i].command === code.command && vm.command.addOrders[i].job === code.job && vm.command.addOrders[i].jobChain === code.jobChain) {
                    vm.command.addOrders.splice(i, 1);
                    break;
                }
            }
            storeObject();
        };

        vm.editCode = function (code, type) {
            vm.isAddOrder = type === 'order';
            vm.isEdit = true;
            vm.isCodeEdit = true;
            code.priority = parseInt(code.priority);
            code.replace = code.replace == 'true' || code.replace == 'yes' || code.replace == '1';
            vm.code = code;
            if (vm.isAddOrder) {
                vm.getSelectedJobChainData();
            }
        };

        vm.openSidePanel = function (title) {
            vm.openSidePanelG(title);
            if (!vm.code.params || !vm.code.params.paramList || vm.code.params.paramList.length === 0) {
                vm.changeParameterConfig(vm.newParameterTab.activeTab);
            }
            if ((!vm.code.environment || !vm.code.environment.variables) && !vm.isAddOrder) {
                if (!vm.code.environment) {
                    vm.code.environment = {variables: []};
                } else {
                    vm.code.environment.variables = [];
                }
                vm.addEnvironmentParams();
            }
            if (!vm.code.params || !vm.code.params.includes) {
                if (!vm.code.params) {
                    vm.code.params = {includes: []};
                } else {
                    vm.code.params.includes = [];
                }
                vm.addIncludes();
            }
            vm._tempCode = angular.copy(vm.code);
        };

        vm.closeSidePanel1 = function () {
            if (vm.obj) {
                if (!angular.equals(angular.toJson(vm._tempCode), angular.toJson(vm.code))) {
                    if (vm.code.params && vm.code.params.paramList && vm.code.params.paramList.length === 0) {
                        delete vm.code.params['paramList']
                    }
                    if (vm.code.params && vm.code.params.copyParams && vm.code.params.copyParams.length === 0) {
                        delete vm.code.params['copyParams']
                    }
                    if (vm.code.params && vm.code.params.includes && vm.code.params.includes.length === 0) {
                        delete vm.code.params['includes']
                    }
                    if (vm.code.environment && vm.code.environment.variables && vm.code.environment.variables.length === 0) {
                        delete vm.code.environment['paramList']
                    }
                    storeObject();
                }
                vm.closeSidePanel();
            }
        };

        vm.changeParameterConfig = function (data) {
            vm.newParameterTab.activeTab = data;
            if (vm.newParameterTab.activeTab === 'parameter' && (!vm.code.params || !vm.code.params.paramList)) {
                if (!vm.code.params) {
                    vm.code.params = {paramList: []};
                } else {
                    vm.code.params.paramList = [];
                }
                vm.addParameter();
            } else if ((vm.newParameterTab.activeTab === 'fromTask' || vm.newParameterTab.activeTab === 'fromOrder') && (!vm.code.params || !vm.code.params.copyParams)) {
                if (!vm.code.params) {
                    vm.code.params = {copyParams: []};
                } else {
                    vm.code.params.copyParams = [];
                }
            }
        };

        vm.addCopyParameter = function () {
            let param = {};
            if (vm.newParameterTab.activeTab === 'fromOrder') {
                param = {
                    from: 'order'
                };
            } else if (vm.newParameterTab.activeTab === 'fromTask') {
                param = {
                    from: 'task'
                };
            }
            if (!EditorService.isLastEntryEmpty(vm.code.params.copyParams, 'from')) {
                vm.code.params.copyParams.push(param);
            }
        };

        vm.removeCopyParams = function (index) {
            vm.code.params.copyParams.splice(index, 1);
        };

        vm.changeActiveParameterTab = function (data) {
            vm.activeTabInParameter = data;
            if (vm.activeTabInParameter === 'tab33') {
                if (vm.isAddOrder) {
                    if (vm.command.addOrders && vm.command.addOrders.length > 0) {
                        for (let i = 0; i < vm.command.addOrders.length; i++) {
                            if (vm.command.addOrders[i].params && vm.command.addOrders[i].params.includes && vm.command.addOrders[i].params.includes.length > 0) {
                                for (let j = 0; j < vm.command.addOrders[i].params.includes.length; j++) {
                                    if (vm.command.addOrders[i].params.includes[j].file) {
                                        vm.command.addOrders[i].params.includes[j].select = 'file';
                                    } else {
                                        vm.command.addOrders[i].params.includes[j].select = 'live_file';
                                    }
                                }
                            }
                        }
                    }
                } else {
                    if (vm.command.startJobs && vm.command.startJobs.length > 0) {
                        for (let i = 0; i < vm.command.startJobs.length; i++) {
                            if (vm.command.startJobs[i].params && vm.command.startJobs[i].params.includes && vm.command.startJobs[i].params.includes.length > 0) {
                                for (let j = 0; j < vm.command.startJobs[i].params.includes.length; j++) {
                                    if (vm.command.startJobs[i].params.includes[j].file) {
                                        vm.command.startJobs[i].params.includes[j].select = 'file';
                                    } else {
                                        vm.command.startJobs[i].params.includes[j].select = 'live_file';
                                    }
                                }
                            }
                        }
                    }
                }

            }
        };

        vm.addEnvironmentParams = function () {
            let envParam = {
                name: '',
                value: ''
            };
            if (!EditorService.isLastEntryEmpty(vm.code.environment.variables, 'name', '')) {
                vm.code.environment.variables.push(envParam);
            }
        };

        vm.removeEnvironmentParams = function (index) {
            vm.code.environment.variables.splice(index, 1);
        };

        vm.changeFileType = function (data) {
            if (data.select === 'file') {
                if (!data.file) {
                    data.file = data.liveFile || '';
                }
                delete data['liveFile'];
            } else {
                if (!data.liveFile) {
                    data.liveFile = data.file || '';
                }
                delete data['file'];
            }
        };

        vm.addIncludes = function () {
            let includesParam = {
                select: 'file',
                file: '',
                node: ''
            };

            if (!EditorService.isLastEntryEmpty(vm.code.params.includes, 'file', 'liveFile')) {
                vm.code.params.includes.push(includesParam);
            }
        };

        vm.removeIncludes = function (index) {
            vm.code.params.includes.splice(index, 1);
        };

        vm.addParameter = function () {
            if (vm.newParameterTab.activeTab == 'parameter') {
                let param = {
                    name: '',
                    value: ''
                };
                if (!EditorService.isLastEntryEmpty(vm.code.params.paramList, 'name', '')) {
                    vm.code.params.paramList.push(param);
                }
            } else {
                if (!EditorService.isLastEntryEmpty(vm.code.params.copyParams, 'name', '')) {
                    vm.addCopyParameter();
                }
            }
        };

        vm.removeParams = function (index) {
            vm.code.params.paramList.splice(index, 1);
        };

        vm.onKeyPress = function ($event, type) {
            let key = $event.keyCode || $event.which;
            if (key == '13') {
                if (type === 'env') {
                    vm.addEnvironmentParams();
                } else if (type === 'param') {
                    vm.addParameter();
                } else {
                    vm.addIncludes();
                }
            }
        };

        vm.$on('RELOAD', function (evt, job) {
            if (vm.extraInfo && job && job.folders && job.folders.length > 7) {
                if (vm.jobChains)
                    vm.jobChains = job.folders[1].children || [];
                vm.checkLockedBy(job, null, vm.extraInfo);

            }
        });

        function storeObject() {
            if (vm.job && vm.job.name) {
                if (!vm.extraInfo.lockedSince) {
                    vm.lockObject(vm.job);
                }
                let _tempObj = angular.copy(vm.job);
                if (_tempObj.ignoreSignals && angular.isArray(_tempObj.ignoreSignals)) {
                    _tempObj.ignoreSignals = _tempObj.ignoreSignals.join(' ');
                }
                if (_tempObj.script && _tempObj.script.content) {
                    _tempObj.script.content = EditorService.getTextContent(_tempObj.script.content);
                }
                if (_tempObj.monitors) {
                    for (let i = 0; i < _tempObj.monitors.length; i++) {
                        if (_tempObj.monitors[i].script && _tempObj.monitors[i].script.content) {
                            _tempObj.monitors[i].script.content = EditorService.getTextContent(_tempObj.monitors[i].script.content);
                        }
                    }
                }
                if (!_tempObj.deleted) {
                    vm.storeObject(vm.job, _tempObj, null, function (result) {
                        if (!result || result !== 'no') {
                            vm.extraInfo.storeDate = new Date();
                        }
                    });
                }
            }
        }

        vm.getSelectedJobChainData = function () {
            let _path;
            if (vm.code.jobChain.indexOf('/') > -1) {
                _path = vm.code.jobChain;
            } else {
                if (vm.job.path === '/') {
                    _path = vm.job.path + vm.code.jobChain;
                } else {
                    _path = vm.job.path + '/' + vm.code.jobChain;
                }
            }
            EditorService.getFile({
                jobschedulerId: vm.schedulerIds.selected,
                objectType: 'JOBCHAIN',
                path: _path,
            }).then(function (res) {
                vm.jobChainNodes = res.configuration.jobChainNodes;
            });
        };

        vm.$on('NEW_PARAM', function (evt, obj) {
            if (vm.job) {
                vm.closeSidePanel1();
            }
            vm.extraInfo = {};
            if (obj.superParent) {
                vm.checkLockedBy(obj.superParent, null, vm.extraInfo);
            }
            for (let i = 0; i < obj.superParent.folders.length; i++) {
                if (obj.superParent.folders[i].object === 'JOBCHAIN') {
                    vm.jobChains = obj.superParent.folders[i].children;
                    break;
                }
            }
            vm.isCodeEdit = false;

            vm.job = obj.parent;
            if (!vm.job.commands) {
                vm.job.commands = [];
            }
            vm.command = undefined;
            vm.code = undefined;
        });

        $scope.$on('$destroy', function () {
            if (vm.job) {
                vm.closeSidePanel1();
            }
        });
    }

    StepNodeCtrl.$inject = ['$scope', '$rootScope', '$timeout', 'EditorService', 'orderByFilter', 'CoreService', '$uibModal'];

    function StepNodeCtrl($scope, $rootScope, $timeout, EditorService, orderBy, CoreService, $uibModal) {
        const vm = $scope;
        vm.expanding_property = {
            field: 'name'
        };
        vm.joeConfigFilters = CoreService.getConfigurationTab().joe;

        vm.tree = [];
        vm.filter_tree = {};
        vm.filter = {'sortBy': 'exitCode', sortReverse: false};
        vm._nextState = [];
        vm._onError = ['', 'setback', 'suspend'];
        var timer = null, t1 = null;

        function initialDefaultObject() {
            vm.isToggle = false;
            vm.object = {jobs: []};
            vm.activeTabInParameter = 'tab11';
            vm.paramObject = [];
            vm.fileOrderSource = {};
            vm.state = [];
            vm.extraInfo = {};
        }

        function init() {
            if (sessionStorage.preferences) {
                vm.preferences = JSON.parse(sessionStorage.preferences) || {};
            }
            createEditor();
            let top = Math.round($('.scroll-y').position().top + 98);
            let ht = 'calc(100vh - ' + top + 'px)';
            $('.graph-container').css({'height': ht, 'scroll-top': '0'});

            let dom = $('#graph');
            if (dom) {
                dom.css({opacity: 1});
                dom.slimscroll({height: ht});
                dom.on('drop', function (event) {
                    event.preventDefault();
                    if (window.selectedJob === 'addOrderId') {
                        addOrderToWorkflow();
                    } else if (window.selectedJob === 'addFileOrderId') {
                        addFileOrderToWorkflow();
                    } else {
                        if (event.target.tagName && event.target.tagName.toLowerCase() === 'svg') {
                            createJobNode(window.selectedJob, null);
                        } else if (event.target.tagName && event.target.tagName.toLowerCase() === 'div') {
                            createJobNode(window.selectedJob, event.target);
                        }
                    }

                });
                $('#toolbarContainer').css({'max-height': 'calc(100vh - ' + (top) + 'px)'});

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
        }

        /**
         * Constructs a new application (returns an mxEditor instance)
         */
        function createEditor() {
            try {
                if (!mxClient.isBrowserSupported()) {
                    mxUtils.error('Browser is not supported!', 200, false);
                } else {
                    const node = mxUtils.load('./mxgraph/config/diagrameditor.xml').getDocumentElement();
                    if (node)
                        vm.editor = new mxEditor(node);
                    if (vm.editor) {
                        initEditorConf(vm.editor);
                        const outln = document.getElementById('outlineContainer2');
                        if (outln) {
                            new mxOutline(vm.editor.graph, outln);
                        }
                        vm.editor.graph.allowAutoPanning = true;
                        createWorkflowDiagram(vm.editor.graph, null, vm.joeConfigFilters.jobChain.showError);
                    }
                }
            } catch (e) {
                setTimeout(function () {
                    init()
                }, 80);
            }
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
            if (vm.preferences.theme !== 'light' && vm.preferences.theme !== 'lighter' || !vm.preferences.theme) {
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

            /**
             * Overrides method to provide a cell label in the display
             * @param cell
             */
            graph.convertValueToString = function (cell) {
                if (cell.value.tagName === 'Connection') {
                    return cell.getAttribute('label');
                }
                let className;
                if (cell.value.tagName === 'Job') {
                    className = 'vertex-text job';
                } else {
                    className = 'vertex-text order';
                }
                let state = cell.getAttribute('label');
                if (cell.getAttribute('job')) {
                    let str = '<div data-state="' + state + '" class="' + className + '">' + state + '<div><span data-state="' + state + '" class="text-muted text-sm"><a class="text-hover-primary">' + cell.getAttribute('job') + '</a></span></div>';
                    if (cell.getAttribute('suspend')) {
                        str = str + '<div><i class="text-warning text-sm">on error suspend</i></div>';
                    }
                    str = str + '</div>';
                    return str;
                } else if (cell.getAttribute('missingNode')) {
                    return '<div data-state="' + state + '" class="' + className + '">' + state + '<div><i class="text-danger text-muted text-sm">missing</i></div></div>';
                } else if (cell.getAttribute('fileSink')) {
                    return '<div data-state="' + state + '" class="' + className + '">' + state + '<div><i class="_600 text-sm">File Sink</i></div></div>';
                }

                if (cell.value.tagName === 'FileOrder') {
                    return '<div class="vertex-text file-order">Folder: ' + cell.getAttribute('directory') + '<div><i class="text-muted text-sm">RegExp: ' + cell.getAttribute('regex') + '</i></div></div>';
                }

                return '<div data-state="' + state + '" class="' + className + '">' + state + '</div>';
            };

            /**
             * Function: isCellMovable
             *
             * Returns true if the given cell is moveable.
             */
            graph.isCellMovable = function (cell) {
                if (cell.value && cell.value.tagName && cell.getAttribute('missingNode')) {
                    return false;
                }
                return !!(cell.value && cell.value.tagName);
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
                        tip = '<div class="vertex-text2">';
                        if (cell.value.tagName === 'Job') {
                            tip = tip + cell.getAttribute('label');
                            if (cell.getAttribute('job')) {
                                tip = tip + ' - ' + cell.getAttribute('job');
                            }
                        } else if (cell.value.tagName === 'FileOrder') {
                            tip = tip + 'Folder: ' + cell.getAttribute('directory') + ' \n RegExp: ' + cell.getAttribute('regex');
                        } else {
                            tip = tip + cell.getAttribute('label');
                        }
                        tip = tip + '</div>';
                    }
                }
                return tip;
            };

            let isJobDragging = false, movedJob = null, dropObject = null;

            /**
             * Function: handle a click event
             */
            graph.addListener(mxEvent.CLICK, function (sender, evt) {
                let event = evt.getProperty('event');
                let cell = evt.getProperty('cell'); // cell may be null
                if (cell != null && !vm.stepNode && !vm.isToggle) {
                    if (event && event.target && event.target.className === 'text-hover-primary') {
                        for (let i = 0; i < vm.jobChain.jobChainNodes.length; i++) {
                            if (vm.jobChain.jobChainNodes[i].state === cell.getAttribute('label')) {
                                vm.navToObject(vm.jobChain, vm.jobChain.jobChainNodes[i].job, 'JOB');
                                break;
                            }
                        }
                    } else {
                        setTimeout(function () {
                            if (!vm.stepNode && !vm.isToggle) {
                                openNodeEditor(cell);
                            }
                        }, 100);
                    }
                    evt.consume();
                }
                vm.stepNode = null;
            });

            // Shows a "modal" window when clicking on img.
            function mxIconSet(state) {
                this.images = [];
                let img;
                if (state.cell && state.cell.value.tagName === 'Job' && (state.cell.getAttribute('job') || state.cell.getAttribute('missingNode'))) {
                    img = mxUtils.createImage('images/menu.svg');
                    let x = state.x - (18 * state.shape.scale), y = state.y - (8 * state.shape.scale);
                    img.style.left = x + 'px';
                    img.style.top = y + 'px';
                    mxEvent.addListener(img, 'click',
                        mxUtils.bind(this, function (evt) {
                            let _x = x;
                            if (evt.clientX > 240) {
                                _x = _x - 120;
                                vm.openToRight = false;
                            } else {
                                vm.openToRight = true;
                            }

                            let _y = y + 13 - $('#graph').scrollTop() - $('.graph-container').scrollTop();
                            _x = _x - $('#graph').scrollLeft() - $('.graph-container').scrollLeft();
                            for (let i = 0; i < vm.jobChain.jobChainNodes.length; i++) {
                                if ((vm.jobChain.jobChainNodes[i].state === state.cell.getAttribute('label'))
                                    || (vm.jobChain.jobChainNodes[i].nextState && (vm.jobChain.jobChainNodes[i].nextState === state.cell.getAttribute('label')) && state.cell.getAttribute('missingNode'))
                                    || (vm.jobChain.jobChainNodes[i].errorState && (vm.jobChain.jobChainNodes[i].errorState === state.cell.getAttribute('label')) && state.cell.getAttribute('missingNode'))) {
                                    vm.stepNode = vm.jobChain.jobChainNodes[i];
                                    vm.stepNode.missingNode = !!state.cell.getAttribute('missingNode');
                                    break;
                                }
                            }
                            let $menu = document.getElementById('actionMenu');
                            $menu.style.left = _x + "px";
                            $menu.style.top = _y + "px";
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
                        isJobDragging = true;
                        movedJob = null;
                        setTimeout(function () {
                            if (isJobDragging)
                                $('#dropContainer2').show();
                        }, 10);
                    }
                    if (this.currentState != null && (me.getState() == this.currentState ||
                        me.getState() == null)) {
                        let tol = 10;
                        let tmp = new mxRectangle(me.getGraphX() - tol,
                            me.getGraphY() - tol, 2 * tol, 2 * tol);

                        if (mxUtils.intersects(tmp, this.currentState)) {
                            return;
                        }
                    }

                    let tmp = graph.view.getState(me.getCell());
                    if (tmp) {
                        dropObject = tmp.cell;
                    } else {
                        dropObject = null;
                    }
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
                    if (isJobDragging) {
                        isJobDragging = false;
                        detachedJob(me.evt.target, movedJob)
                    }

                },
                dragEnter: function (evt, state) {
                    if (this.currentIconSet == null) {
                        this.currentIconSet = new mxIconSet(state);
                    }
                },
                dragLeave: function () {
                    if (this.currentIconSet != null) {
                        this.currentIconSet.destroy();
                        this.currentIconSet = null;
                    }
                }
            });

            graph.moveCells = function (cells, dx, dy, clone, target, evt, mapping) {
                vm.stepNode = null;
                if (cells && cells[0]) {
                    movedJob = cells[0];
                }
                dx = 0;
                dy = (dy != null) ? dy : 0;
                clone = (clone != null) ? clone : false;
                if (cells != null && (dx != 0 || dy != 0 || clone || target != null)) {
                    // Removes descendants with ancestors in cells to avoid multiple moving
                    cells = this.model.getTopmostCells(cells);
                    if (cells && cells[0] && cells && cells[0].value) {
                        dy = 0;
                        if (dropObject && movedJob.id !== dropObject.id) {
                            vm.isToggle = true;
                            if (movedJob.value.tagName === 'FileOrder' && dropObject.getAttribute('label')) {
                                moveFileOrderSource(movedJob, dropObject);
                            } else {
                                if (dropObject.getAttribute('job') && movedJob.getAttribute('job')) {
                                    toggleNodes(movedJob, dropObject);
                                }
                            }
                            dropObject = null;
                            setTimeout(function () {
                                vm.isToggle = false;
                            }, 110);
                        }
                    }
                    this.model.beginUpdate();
                    try {
                        // Faster cell lookups to remove relative edge labels with selected
                        // terminals to avoid explicit and implicit move at same time
                        let dict = new mxDictionary();
                        for (let i = 0; i < cells.length; i++) {
                            dict.put(cells[i], true);
                        }

                        let isSelected = mxUtils.bind(this, function (cell) {
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
                        let previous = this.isAllowNegativeCoordinates();

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

            graph.isValidDropTarget = function () {
                return false;
            }
        }

        vm.loadGraph = function () {
            reloadGraph();
        };

        vm.closeMenu = function () {
            vm.stepNode = null;
        };

        function moveFileOrderSource(cell, target) {
            for (let i = 0; i < vm.jobChain.fileOrderSources.length; i++) {
                if (vm.jobChain.fileOrderSources[i].directory === cell.getAttribute('directory')) {
                    vm.jobChain.fileOrderSources[i].nextState = target.getAttribute('label');
                    storeObject();
                    reloadGraph();
                    break;
                }
            }

        }

        function toggleNodes(cell, target) {
            if (cell.value.tagName === 'Job' && target.value.tagName === 'Job') {
                let sour = {};
                for (let i = 0; i < vm.jobChain.jobChainNodes.length; i++) {
                    if (vm.jobChain.jobChainNodes[i].state === cell.getAttribute('label')) {
                        sour = vm.jobChain.jobChainNodes[i];
                        vm.jobChain.jobChainNodes.splice(i, 1);
                        break;
                    }
                }
                let arr = [];
                for (let i = 0; i < vm.jobChain.jobChainNodes.length; i++) {
                    if (vm.jobChain.jobChainNodes[i].state === target.getAttribute('label')) {
                        arr.push(sour);
                    }
                    arr.push(vm.jobChain.jobChainNodes[i]);
                }
                for (let i = 0; i < arr.length; i++) {
                    if (arr[i].job && ((i + 1) < arr.length)) {
                        arr[i].nextState = angular.copy(arr[i + 1].state);
                    }
                }
                vm.jobChain.jobChainNodes = arr;
                storeObject();
                reloadGraph();
            }
        }

        function openNodeEditor(cell) {
            if (cell.value.tagName === 'Job') {
                if (cell.getAttribute('fileSink')) {
                    for (let i = 0; i < vm.jobChain.fileOrderSinks.length; i++) {
                        if (vm.jobChain.fileOrderSinks[i].state === cell.getAttribute('label')) {
                            vm.editNode(vm.jobChain.fileOrderSinks[i], true);
                            let modalInstance = $uibModal.open({
                                templateUrl: 'modules/configuration/views/step-node-dialog.html',
                                controller: 'DialogCtrl1',
                                scope: $scope,
                                backdrop: 'static',
                                size: 'lg'
                            });
                            modalInstance.result.then(function () {
                                vm.applyNode(null, true);
                                reloadGraph();
                            }, function () {
                                vm.cancelNode();
                            });
                            break;
                        }
                    }
                } else {
                    for (let i = 0; i < vm.jobChain.jobChainNodes.length; i++) {
                        if (vm.jobChain.jobChainNodes[i].state === cell.getAttribute('label')) {
                            vm.editNode(vm.jobChain.jobChainNodes[i]);
                            let modalInstance = $uibModal.open({
                                templateUrl: 'modules/configuration/views/step-node-dialog.html',
                                controller: 'DialogCtrl1',
                                scope: $scope,
                                backdrop: 'static',
                                size: 'lg'
                            });
                            modalInstance.result.then(function () {
                                vm.applyNode(null, true);
                                reloadGraph();
                            }, function () {
                                vm.cancelNode();
                            });
                            break;
                        }
                    }
                }
            } else if (cell.value.tagName === 'Order') {
                for (let i = 0; i < vm.jobChainOrders.length; i++) {
                    if (vm.jobChainOrders[i].orderId === cell.getAttribute('label')) {
                        vm.isUnique = true;
                        vm.order = angular.copy(vm.jobChainOrders[i]);
                        if (vm.order.priority)
                            vm.order.priority = parseInt(vm.order.priority, 10);
                        vm._tempOrder = angular.copy(vm.jobChainOrders[i]);
                        vm.orderNodeparams = null;
                        vm.global = {node: 'global'};
                        $('#orderModal').modal('show');
                        break;
                    }
                }
            } else {
                for (let i = 0; i < vm.jobChain.fileOrderSources.length; i++) {
                    if (vm.jobChain.fileOrderSources[i].directory === cell.getAttribute('directory') && vm.jobChain.fileOrderSources[i].regex === cell.getAttribute('regex')) {
                        vm.jobChain.fileOrderSources[i].alertWhenDirectoryMissing = vm.jobChain.fileOrderSources[i].alertWhenDirectoryMissing === 'true' || vm.jobChain.fileOrderSources[i].alertWhenDirectoryMissing === true;
                        vm.orderSource = angular.copy(vm.jobChain.fileOrderSources[i]);
                        vm._tempOrderSource = angular.copy(vm.jobChain.fileOrderSources[i]);
                        $('#fileOrderModal').modal('show');
                        break;
                    }
                }
            }
        }

        function reloadGraph() {
            let element = document.getElementById('graph');
            let scrollValue = {
                scrollTop: element.scrollTop,
                scrollLeft: element.scrollLeft,
                scale: vm.editor.graph.getView().getScale()
            };
            vm.editor.graph.removeCells(vm.editor.graph.getChildVertices(vm.editor.graph.getDefaultParent()));
            createWorkflowDiagram(vm.editor.graph, scrollValue, vm.joeConfigFilters.jobChain.showError);
        }

        function detachedJob(target, cell) {
            let isOrder = false;
            if (target && target.getAttribute('class') === 'dropContainer' && cell) {
                if (cell.value.tagName === 'Job') {
                    if (cell.getAttribute('fileSink')) {
                        for (let m = 0; m < vm.jobChain.fileOrderSinks.length; m++) {
                            if (vm.jobChain.fileOrderSinks[m].state === cell.getAttribute('label')) {
                                vm.jobChain.fileOrderSinks.splice(m, 1);
                                break;
                            }
                        }
                    } else {
                        for (let i = 0; i < vm.jobChain.jobChainNodes.length; i++) {
                            if (vm.jobChain.jobChainNodes[i].state === cell.getAttribute('label')) {
                                vm.jobChain.jobChainNodes.splice(i, 1);
                                break;
                            }
                        }
                    }
                } else if (cell.value.tagName === 'Order') {
                    for (let i = 0; i < vm.jobChainOrders.length; i++) {
                        if (vm.jobChainOrders[i].orderId === cell.getAttribute('label')) {
                            if (vm.orders && vm.orders.length > 0) {
                                for (let j = 0; j < vm.orders.length; j++) {
                                    if (vm.orders[j].name === vm.jobChainOrders[i].name) {
                                        isOrder = true;
                                        let path = '';
                                        if (vm.jobChain.path === '/') {
                                            path = vm.jobChain.path + vm.orders[j].name;
                                        } else {
                                            path = vm.jobChain.path + '/' + vm.orders[j].name;
                                        }
                                        EditorService.delete({
                                            jobschedulerId: vm.schedulerIds.selected,
                                            objectType: 'ORDER',
                                            path: path
                                        }).then(function () {
                                            vm.orders[j].deleted = true;
                                            vm.jobChainOrders.splice(i, 1);
                                        }, function (err) {
                                            vm.checkIsFolderLock(err, vm.jobChain.path, function (result) {
                                                if (result === 'yes') {
                                                    vm.orders[j].deleted = true;
                                                    vm.jobChainOrders.splice(i, 1);
                                                    EditorService.delete({
                                                        jobschedulerId: vm.schedulerIds.selected,
                                                        objectType: 'ORDER',
                                                        path: path
                                                    }).then(function () {
                                                        vm.orders[j].deleted = true;
                                                        vm.jobChainOrders.splice(i, 1);
                                                    });
                                                }
                                            });
                                        });
                                        break;
                                    }
                                }
                            }

                            break;
                        }
                    }
                } else {
                    for (let i = 0; i < vm.jobChain.fileOrderSources.length; i++) {
                        if (vm.jobChain.fileOrderSources[i].directory === cell.getAttribute('directory') && vm.jobChain.fileOrderSources[i].regex === cell.getAttribute('regex')) {
                            vm.jobChain.fileOrderSources.splice(i, 1);
                            break;
                        }
                    }
                }

                if (!isOrder) {
                    reloadGraph();
                    storeObject();
                }
            }
            $('#dropContainer2').hide();

        }

        function createWorkflowDiagram(graph, scrollValue, showErrorNode) {
            checkMissingNodes();
            for (let m = 0; m < vm.jobs.length; m++) {
                vm.jobs[m].isIcon = false;
            }
            if (vm._jobs) {
                for (let m = 0; m < vm._jobs.length; m++) {
                    vm._jobs[m].isIcon = false;
                }
            }
            graph.getModel().beginUpdate();
            let splitRegex = new RegExp('(.+):(.+)');
            let _tempArr = [];
            try {
                if (vm.jobChain.fileOrderSources) {
                    for (let i = 0; i < vm.jobChain.fileOrderSources.length; i++) {
                        if (vm.jobChain.fileOrderSources[i].directory) {
                            let v1 = createFileOrderVertex(vm.jobChain.fileOrderSources[i], graph);
                            vm.jobChain.fileOrderSources[i].fId = v1.id;
                        }
                    }
                }
                let vertexMap = new Map();
                if (vm.jobChain.jobChainNodes) {
                    let missingNodes = new Map();
                    for (let i = 0; i < vm.jobChain.jobChainNodes.length; i++) {
                        if (vm.jobChain.jobChainNodes[i].state) {
                            let v1 = createJobVertex(vm.jobChain.jobChainNodes[i], graph);
                            if (vm.jobChain.jobChainNodes[i].isParam) {
                                addOverlays(graph, v1);
                            }
                            if (vm.jobChain.jobChainNodes[i].job && (!vm.jobChain.jobChainNodes[i].isNextStateExist || vm.jobChain.jobChainNodes[i].isMatchNextStateWithFileSink) && vm.jobChain.jobChainNodes[i].nextState) {
                                let style;
                                let _node = getCellNode('Job', vm.jobChain.jobChainNodes[i].nextState);
                                if (vm.jobChain.jobChainNodes[i].isMatchNextStateWithFileSink) {
                                    _node.setAttribute('fileSink', 'true');
                                    style = 'job;strokeColor=#999;fillColor=rgba(245,250,133,0.6)';
                                } else {
                                    _node.setAttribute('missingNode', 'true');
                                    style = 'job;strokeColor=#999;fillColor=rgba(255,255,224,0.6)';
                                }

                                let m1 = missingNodes.get(vm.jobChain.jobChainNodes[i].nextState);
                                if (!m1) {
                                    m1 = graph.insertVertex(graph.getDefaultParent(), null, _node, 0, 0, 180, 42, style);
                                }
                                missingNodes.set(vm.jobChain.jobChainNodes[i].nextState, m1);
                                graph.insertEdge(graph.getDefaultParent(), null, getCellNode('Connection', '', ''),
                                    v1, m1);
                            }
                            if (vm.jobChain.jobChainNodes[i].job && (!vm.jobChain.jobChainNodes[i].isErrorStateExist || vm.jobChain.jobChainNodes[i].isMatchWithFileSink) && vm.jobChain.jobChainNodes[i].errorState) {
                                let _node = getCellNode('Job', vm.jobChain.jobChainNodes[i].errorState);
                                let style;
                                if (vm.jobChain.jobChainNodes[i].isMatchWithFileSink) {
                                    style = 'job;strokeColor=#999;fillColor=rgba(245,250,133,0.6)';
                                    _node.setAttribute('fileSink', 'true');
                                } else if (!vm.jobChain.jobChainNodes[i].onError) {
                                    style = 'job;strokeColor=#999;fillColor=rgba(255,130,128,0.6)';
                                    _node.setAttribute('missingNode', 'true');
                                }
                                let m1 = missingNodes.get(vm.jobChain.jobChainNodes[i].errorState);
                                if (!m1) {
                                    m1 = graph.insertVertex(graph.getDefaultParent(), null, _node, 0, 0, 180, 42, style);
                                }
                                missingNodes.set(vm.jobChain.jobChainNodes[i].errorState, m1);

                                if (m1) {
                                    style = 'dashed=1;dashPattern=1 2;strokeColor=#dc143c';
                                    if (vm.jobChain.jobChainNodes[i].isMatchWithFileSink) {
                                        style = 'dashed=1;dashPattern=1 2;';
                                    }
                                    graph.insertEdge(graph.getDefaultParent(), null, getCellNode('Connection', '', ''),
                                        v1, m1, style);
                                }
                            }

                            if (!vertexMap.has(vm.jobChain.jobChainNodes[i].state)) {
                                vertexMap.set(vm.jobChain.jobChainNodes[i].state, v1);
                            }
                            if (vm.jobChain.fileOrderSources) {
                                if (vm.jobChain.fileOrderSources.length > 0) {
                                    for (let j = 0; j < vm.jobChain.fileOrderSources.length; j++) {
                                        if ((vm.jobChain.fileOrderSources[j].nextState && vm.jobChain.fileOrderSources[j].nextState === vm.jobChain.jobChainNodes[i].state) ||
                                            (!vm.jobChain.fileOrderSources[j].nextState && i === 0)) {
                                            graph.insertEdge(graph.getDefaultParent(), null, getCellNode('Connection', '', ''),
                                                graph.getModel().getCell(vm.jobChain.fileOrderSources[j].fId), v1);
                                        }
                                    }
                                }
                            }
                        }
                        if (vm.jobChain.jobChainNodes[i].job) {
                            for (let m = 0; m < vm.jobs.length; m++) {
                                if (vm.jobs[m].name === vm.jobChain.jobChainNodes[i].job) {
                                    vm.jobs[m].isIcon = true;
                                    break;
                                }
                            }
                            if (vm._jobs) {
                                for (let m = 0; m < vm._jobs.length; m++) {
                                    if (vm._jobs[m].path === vm.jobChain.jobChainNodes[i].job) {
                                        vm._jobs[m].isIcon = true;
                                        break;
                                    }
                                }
                            }
                        }
                    }
                    for (let i = 0; i < vm.jobChain.jobChainNodes.length; i++) {
                        let v1 = vertexMap.get(vm.jobChain.jobChainNodes[i].state);
                        let isNodeExist = false;
                        for (let j = 0; j < vm.jobChain.jobChainNodes.length; j++) {
                            if (v1 && vm.jobChain.jobChainNodes[i].state !== vm.jobChain.jobChainNodes[j].state) {
                                if (vm.jobChain.jobChainNodes[i].state === vm.jobChain.jobChainNodes[j].errorState) {
                                    isNodeExist = true;
                                }
                                if (vm.jobChain.jobChainNodes[i].onReturnCodes && vm.jobChain.jobChainNodes[i].onReturnCodes.onReturnCodeList && vm.jobChain.jobChainNodes[i].onReturnCodes.onReturnCodeList.length > 0) {
                                    let rc = vm.jobChain.jobChainNodes[i].onReturnCodes;
                                    if (rc.onReturnCodeList) {
                                        for (let m = 0; m < rc.onReturnCodeList.length; m++) {
                                            if (rc.onReturnCodeList[m].toState && vm.jobChain.jobChainNodes[j].state === rc.onReturnCodeList[m].toState.state) {
                                                graph.insertEdge(graph.getDefaultParent(), null, getCellNode('Connection', 'exit: ' + rc.onReturnCodeList[m].returnCode, ''),
                                                    v1, vertexMap.get(vm.jobChain.jobChainNodes[j].state), 'dashed=1;');
                                            }
                                        }
                                    }
                                }

                                if (vm.jobChain.jobChainNodes[j].state && splitRegex.test(vm.jobChain.jobChainNodes[j].state) && vm.jobChain.jobChainNodes[i].state !== vm.jobChain.jobChainNodes[j].state) {
                                    let arr = splitRegex.exec(vm.jobChain.jobChainNodes[j].state);
                                    if (vm.jobChain.jobChainNodes[i].state == arr[1]) {
                                        graph.insertEdge(graph.getDefaultParent(), null, getCellNode('Connection', '', ''),
                                            v1, vertexMap.get(vm.jobChain.jobChainNodes[j].state));
                                    }
                                }
                                if (vm.jobChain.jobChainNodes[j].nextState && vm.jobChain.jobChainNodes[i].state === vm.jobChain.jobChainNodes[j].nextState) {
                                    graph.insertEdge(graph.getDefaultParent(), null, getCellNode('Connection', '', ''),
                                        vertexMap.get(vm.jobChain.jobChainNodes[j].state), v1);
                                }
                                if (!vm.jobChain.jobChainNodes[i].onError && vm.jobChain.jobChainNodes[i].errorState && vm.jobChain.jobChainNodes[i].errorState === vm.jobChain.jobChainNodes[j].state) {
                                    if (showErrorNode) {
                                        let vert = vertexMap.get(vm.jobChain.jobChainNodes[j].state);
                                        let style = vert.getStyle();
                                        let eColor = '#fce3e8';
                                        if (vm.preferences.theme !== 'light' && vm.preferences.theme !== 'lighter' || !vm.preferences.theme) {
                                            eColor = 'rgba(255,130,128,0.7)';
                                        }
                                        style += ';fillColor=' + eColor;
                                        vert.setStyle(style);
                                        graph.insertEdge(graph.getDefaultParent(), null, getCellNode('Connection', '', ''),
                                            v1, vert, 'dashed=1;dashPattern=1 2;strokeColor=#dc143c');
                                    } else {
                                        graph.removeCells([vertexMap.get(vm.jobChain.jobChainNodes[j].state)]);
                                    }
                                }
                            }
                            if (isNodeExist && !vm.jobChain.jobChainNodes[i].job && vm.jobChain.jobChainNodes.length - 1 === j && v1.getEdgeCount() == 0) {
                                if (_tempArr.indexOf(v1) === -1) {
                                    _tempArr.push(v1);
                                }
                            }
                        }
                        if (vm.jobChain.jobChainNodes[i].onError === 'setback') {
                            graph.insertEdge(graph.getDefaultParent(), null, getCellNode('Connection', 'setback', ''),
                                v1, v1, 'dashed=1;');
                        }
                        if (vm.jobChain.jobChainNodes[i].nextState === vm.jobChain.jobChainNodes[i].state) {
                            graph.insertEdge(graph.getDefaultParent(), null, getCellNode('Connection', '', ''),
                                v1, v1);
                        }
                        if (vm.jobChain.jobChainNodes[i].errorState === vm.jobChain.jobChainNodes[i].state) {
                            graph.insertEdge(graph.getDefaultParent(), null, getCellNode('Connection', '', ''),
                                v1, v1, 'dashed=1;dashPattern=1 2;strokeColor=#dc143c');
                        }
                    }
                }
                if (vm.jobChainOrders && vm.jobChainOrders.length > 0 && vm.jobChain.jobChainNodes.length > 0) {
                    for (let i = 0; i < vm.jobChainOrders.length; i++) {
                        if (vm.jobChainOrders[i].orderId && !vm.jobChainOrders[i].deleted) {
                            let o1 = createOrderVertex(vm.jobChainOrders[i].orderId, graph);
                            if (vm.jobChainOrders[i].initialState) {
                                for (let j = 0; j < vm.jobChain.jobChainNodes.length; j++) {
                                    if (vm.jobChainOrders[i].initialState === vm.jobChain.jobChainNodes[j].state) {
                                        graph.insertEdge(graph.getDefaultParent(), null, getCellNode('Connection', '', ''),
                                            o1, vertexMap.get(vm.jobChain.jobChainNodes[j].state), 'dashed=1;');
                                        break;
                                    }
                                }
                            } else {
                                graph.insertEdge(graph.getDefaultParent(), null, getCellNode('Connection', '', ''),
                                    o1, vertexMap.get(vm.jobChain.jobChainNodes[0].state), 'dashed=1;');
                            }

                        }
                    }
                }
                graph.removeCells(_tempArr)
            } catch (e) {

            } finally {
                // Updates the display
                graph.getModel().endUpdate();
                executeLayout(graph);
            }
            if (scrollValue) {
                let element = document.getElementById('graph');
                if (scrollValue.scrollTop)
                    element.scrollTop = scrollValue.scrollTop;
                if (scrollValue.scrollLeft)
                    element.scrollLeft = scrollValue.scrollLeft;
                if (scrollValue.scale)
                    vm.editor.graph.getView().setScale(scrollValue.scale);
            }
            setTimeout(function () {
                if (!scrollValue) {
                    $('[data-toggle="tooltip"]').tooltip();
                    vm.actual();
                }
                vm.isToggle = false;
            }, 50);
        }

        /**
         * Function : addOverlays
         *
         * Add bar in bottom
         * @param graph
         * @param cell
         */
        function addOverlays(graph, cell) {
            let img = 'images/green-bar.svg';
            let overlay = new mxCellOverlay(
                new mxImage(img, 8, 8), ""
            );
            overlay.align = mxConstants.ALIGN_RIGHT;
            overlay.cursor = "pointer";
            overlay.verticalAlign = mxConstants.ALIGN_TOP;
            graph.addCellOverlay(cell, overlay);
            overlay.addListener(mxEvent.CLICK, function (sender, evt) {
                handleSingleClick(evt.getProperty('cell'));
            });
        }

        /**
         * Function : handleSingleClick
         *
         * @param cell
         */
        function handleSingleClick(cell) {
            for (let i = 0; i < vm.jobChain.jobChainNodes.length; i++) {
                if (vm.jobChain.jobChainNodes[i].state === cell.getAttribute('label')) {
                    vm.openNode(vm.jobChain.jobChainNodes[i], vm.jobChain.jobChainNodes[i].isParam ? 'nodeParameter' : 'returnCodes');
                    break;
                }
            }
        }

        /**
         * Reformat the layout
         */
        function executeLayout(graph) {
            const layout = new mxHierarchicalLayout(graph);
            layout.execute(graph.getDefaultParent());
        }

        function createJobNode(job, onJob) {
            let flag = false;
            if (vm.jobChain.jobChainNodes.length === 0) {
                let nState;
                let eState;
                let obj2 = {state: 'success'};
                let obj3 = {state: 'error'};
                if (vm.jobChain.fileOrderSinks.length > 0) {
                    for (let i = 0; i < vm.jobChain.fileOrderSinks.length; i++) {
                        if (vm.jobChain.fileOrderSinks[i].state.toLowerCase() === 'success') {
                            nState = vm.jobChain.fileOrderSinks[i].state;
                            obj2 = null;
                        }
                        if (vm.jobChain.fileOrderSinks[i].state.toLowerCase() === 'error') {
                            eState = vm.jobChain.fileOrderSinks[i].state;
                            obj3 = null;
                        }
                    }
                }
                if (!nState) {
                    nState = 'success';
                }
                if (!eState) {
                    eState = 'error';
                }
                let obj = {
                    state: vm.preferences.automaticStateName ? '100' : job.substring(job.lastIndexOf('/') + 1),
                    job: job,
                    nextState: nState,
                    errorState: eState
                };
                vm.jobChain.jobChainNodes.push(obj);
                if (obj2) {
                    vm.jobChain.jobChainNodes.push(obj2);
                }
                if (obj3) {
                    vm.jobChain.jobChainNodes.push(obj3);
                }
                flag = true;

            } else {
                let obj = null, index;
                let s_name = vm.preferences.automaticStateName ? '100' : job.substring(job.lastIndexOf('/') + 1);
                if (onJob) {
                    if (!onJob.innerHTML.match('text-hover-primary')) {
                        return;
                    }
                    let textArr = onJob.dataset ? onJob.dataset.state : onJob.innerHTML.split('<br>')[0];
                    for (let i = 0; i < vm.jobChain.jobChainNodes.length; i++) {
                        if (vm.jobChain.jobChainNodes[i].state === textArr) {
                            obj = {
                                state: vm.preferences.automaticStateName ? getStateNumber(s_name) : getStateName(s_name),
                                job: job,
                                nextState: vm.jobChain.jobChainNodes[i].nextState,
                                errorState: vm.jobChain.jobChainNodes[i].errorState
                            };
                            vm.jobChain.jobChainNodes[i].nextState = obj.state;
                            index = i;
                            break;
                        }
                    }
                } else {
                    let isFind = false;
                    for (let i = 0; i < vm.jobChain.jobChainNodes.length; i++) {
                        if (vm.jobChain.jobChainNodes[i].nextState && vm.jobChain.jobChainNodes[i].nextState.toLowerCase() === 'success') {
                            obj = {
                                state: vm.preferences.automaticStateName ? getStateNumber(s_name) : getStateName(s_name),
                                job: job,
                                nextState: vm.jobChain.jobChainNodes[i].nextState,
                                errorState: vm.jobChain.jobChainNodes[i].errorState
                            };
                            vm.jobChain.jobChainNodes[i].nextState = obj.state;
                            isFind = true;
                            index = i;
                            break;
                        }
                    }
                    if (!isFind) {
                        for (let i = vm.jobChain.jobChainNodes.length - 1; i >= 0; i--) {
                            if (vm.jobChain.jobChainNodes[i].job) {
                                obj = {
                                    state: vm.preferences.automaticStateName ? getStateNumber(s_name) : getStateName(s_name),
                                    job: job,
                                    nextState: vm.jobChain.jobChainNodes[i].nextState,
                                    errorState: vm.jobChain.jobChainNodes[i].errorState
                                };
                                vm.jobChain.jobChainNodes[i].nextState = obj.state;
                                index = i;
                                break;
                            }
                        }
                    }
                    if (!obj) {
                        let nState;
                        let eState;
                        for (let i = 0; i < vm.jobChain.jobChainNodes.length; i++) {
                            if (vm.jobChain.jobChainNodes[i].state.toLowerCase() === 'success') {
                                nState = vm.jobChain.jobChainNodes[i].state;
                            }
                            if (vm.jobChain.jobChainNodes[i].state.toLowerCase() === 'error') {
                                eState = vm.jobChain.jobChainNodes[i].state;
                            }
                        }
                        if (vm.jobChain.fileOrderSinks.length > 0) {
                            for (let i = 0; i < vm.jobChain.fileOrderSinks.length; i++) {
                                if (!nState && vm.jobChain.fileOrderSinks[i].state.toLowerCase() === 'success') {
                                    nState = vm.jobChain.jobChainNodes[i].state;
                                }
                                if (!eState && vm.jobChain.fileOrderSinks[i].state.toLowerCase() === 'error') {
                                    eState = vm.jobChain.fileOrderSinks[i].state;
                                }
                            }
                        }
                        if (!nState) {
                            nState = 'success';
                        }
                        if (!eState) {
                            eState = 'error';
                        }
                        obj = {
                            state: vm.preferences.automaticStateName ? getStateNumber(s_name) : getStateName(s_name),
                            job: job,
                            nextState: nState,
                            errorState: eState
                        };
                    }
                }
                if (obj) {
                    if (obj.state === obj.nextState) {
                        obj.nextState = 'success';
                    }

                    if (index > -1) {
                        vm.jobChain.jobChainNodes.splice(index + 1, 0, obj);
                    } else {
                        vm.jobChain.jobChainNodes.splice(0, 0, obj);
                    }
                    flag = true;
                }
            }
            if (flag) {
                reloadGraph();
                storeObject();
            }
        }

        /**
         * Function to create state name dynamically
         */
        function getStateName(state) {
            let name = state;
            let splitRegex = new RegExp('(_)+(\\d+)(?!.*\\d)');

            function recursive(state) {
                for (let i = 0; i < vm.jobChain.jobChainNodes.length; i++) {
                    if (vm.jobChain.jobChainNodes[i].state === state) {
                        let flag = splitRegex.test(state);
                        if (flag) {
                            let arr = splitRegex.exec(state);
                            if (arr.length > 1) {
                                let num = parseInt(arr[2]) + 1;
                                state = state.split(splitRegex)[0] + '_' + num;
                            } else {
                                state += '_2';
                            }
                        } else {
                            state += '_1';
                        }
                        name = state;
                        recursive(state);
                        break;
                    }
                }
            }

            recursive(state);
            return name;
        }

        /**
         * Function to create state name dynamically
         */
        function getStateNumber(state) {
            let name = state;

            function recursive(state) {
                for (let i = 0; i < vm.jobChain.jobChainNodes.length; i++) {
                    if (vm.jobChain.jobChainNodes[i].state === state) {
                        name = state;
                        name = (parseInt(name) + 100).toString();
                        recursive(name);
                        break;
                    }
                }
            }

            recursive(state);
            return name;
        }

        /**
         * Function to create dom element
         */
        function getCellNode(name, label, job, isSuspend) {
            const doc = mxUtils.createXmlDocument();
            // Create new node object
            const _node = doc.createElement(name);
            if (label)
                _node.setAttribute('label', label.trim());
            if (job)
                _node.setAttribute('job', job);
            if (isSuspend) {
                _node.setAttribute('suspend', 'true');
            }
            return _node;
        }

        /**
         * Function to create file order vertex
         */
        function createFileOrderVertex(fileOrder, graph) {
            const doc = mxUtils.createXmlDocument();
            // Create new node object
            const _node = doc.createElement('FileOrder');
            _node.setAttribute('directory', fileOrder.directory);
            if (fileOrder.regex) {
                _node.setAttribute('regex', fileOrder.regex);
            }
            let style = 'fileOrder;strokeColor=#999;rounded=1';
            return graph.insertVertex(graph.getDefaultParent(), null, _node, 0, 0, 220, 42, style)
        }

        /**
         * Function to create Job vertex
         */
        function createJobVertex(job, graph) {
            let _node = getCellNode('Job', job.state, job.job, job.onError === 'suspend');
            let style = 'job;strokeColor=#999';
            if (!job.job) {
                let sColor = '#e5ffe5';
                if (vm.preferences.theme !== 'light' && vm.preferences.theme !== 'lighter' || !vm.preferences.theme) {
                    sColor = 'rgba(133,255,168,0.7)';
                }
                style += ';fillColor=' + sColor;
            }
            return graph.insertVertex(graph.getDefaultParent(), null, _node, 0, 0, 180, 46, style)
        }

        /**
         * Function to create Job vertex
         */
        function createOrderVertex(name, graph) {
            let _node = getCellNode('Order', name);
            let style = 'order;strokeColor=#999;fillColor=none';
            return graph.insertVertex(graph.getDefaultParent(), null, _node, 0, 0, 180, 42, style)
        }

        vm.getJobChainTreeStructure = function (val) {
            vm.getObjectTreeStructure('JOBCHAIN', function (data) {
                val.jobChain = data.jobChain;
            });
        };

        vm.openNode = function (node, type) {
            vm.isUnique = true;
            vm.node = angular.copy(node);
            vm.node.nodeType = 'Full Node';
            vm._tempNode = angular.copy(node);
            vm.openSidePanel(type);
        };

        vm.removeNode = function (node, sink) {
            if (sink) {
                vm._nextState.splice(vm._nextState.indexOf(sink.state), 1);
                for (let i = 0; i < vm.jobChain.fileOrderSinks.length; i++) {
                    if (vm.jobChain.fileOrderSinks[i].state === node.state) {
                        vm.jobChain.fileOrderSinks.splice(i, 1);
                        break;
                    }
                }
            } else {
                vm._nextState.splice(vm._nextState.indexOf(node.state), 1);
                for (let i = 0; i < vm.jobChain.jobChainNodes.length; i++) {
                    if (vm.jobChain.jobChainNodes[i]) {
                        if (vm.jobChain.jobChainNodes[i].state === node.state) {
                            vm.jobChain.jobChainNodes.splice(i, 1);
                            break
                        }
                    }
                }
                if (vm.jobChainNodeparams && vm.jobChainNodeparams.jobChainNodes && vm.jobChainNodeparams.jobChainNodes.length > 0) {
                    for (let i = 0; i < vm.jobChainNodeparams.jobChainNodes.length; i++) {
                        if (node.state === vm.jobChainNodeparams.jobChainNodes[i].state) {
                            vm.jobChainNodeparams.jobChainNodes.splice(i, 1);
                            vm.jobChainNodes = vm.jobChainNodeparams.jobChainNodes;
                            storeNodeParam(true);
                            break;
                        }
                    }
                }

            }
            vm.cancelNode();
            checkMissingNodes();
            storeObject();
        };

        function _editNode(node, sink) {
            vm.isUnique = true;
            vm.node = angular.copy(node);
            if (sink) {
                vm.node.nodeType = 'File Sink';
            } else {
                vm.node.nodeType = node.job ? 'Full Node' : 'End Node';
            }
            vm._tempNode = angular.copy(vm.node);
        }

        vm.editNode = function (node, sink) {
            if (vm._tempNode) {
                if (vm._tempNode.state === node.state) {
                    return;
                } else {
                    if (!angular.equals(angular.toJson(vm._tempNode), angular.toJson(vm.node))) {
                        vm.checkNodeName(vm.node);
                        if (!vm.isUnique) {
                            return;
                        }
                        vm.applyNode(vm.myForm);
                    }
                }
            } else {
                if (vm.node && vm.node.state) {
                    vm.checkNodeName(vm.node);
                    if (!vm.isUnique) {
                        return;
                    }
                    vm.applyNode(vm.myForm);
                }
            }
            _editNode(node, sink);
        };

        vm.applyNode = function (form, checkFrom) {
            if (!checkFrom) {
                if ((form && form.$invalid) || !vm.isUnique) {
                    return;
                }
            }
            if (!vm.node.state) {
                return;
            }
            let obj;
            if (vm.node.nodeType === 'Full Node') {
                obj = {
                    state: vm.node.state,
                    job: vm.node.job,
                    nextState: vm.node.nextState,
                    errorState: vm.node.errorState,
                    delay: vm.node.delay,
                    onError: vm.node.onError,
                    onReturnCodes: vm.node.onReturnCodes
                };
            } else if (vm.node.nodeType === 'End Node') {
                obj = {state: vm.node.state};
            } else {
                obj = {
                    state: vm.node.state,
                    moveTo: vm.node.moveTo,
                    remove: vm.node.remove,
                    delay: vm.node.delay
                };
            }
            if (vm._tempNode) {
                if (vm._tempNode.nodeType !== 'File Sink') {
                    for (let i = 0; i < vm.jobChain.jobChainNodes.length; i++) {
                        if (vm.jobChain.jobChainNodes[i].state === vm._tempNode.state) {
                            if (vm.node.nodeType !== 'File Sink') {
                                vm.jobChain.jobChainNodes[i] = obj;
                            } else {
                                vm.jobChain.jobChainNodes.splice(i, 1);
                                vm.jobChain.fileOrderSinks.push(obj);
                            }
                            break;
                        }
                    }
                } else {
                    if (vm.node.nodeType === 'File Sink') {
                        for (let i = 0; i < vm.jobChain.fileOrderSinks.length; i++) {
                            if (vm.jobChain.fileOrderSinks[i].state === vm._tempNode.state) {
                                vm.jobChain.fileOrderSinks[i] = obj;
                                break
                            }
                        }
                    } else {
                        for (let i = 0; i < vm.jobChain.fileOrderSinks.length; i++) {
                            if (vm.jobChain.fileOrderSinks[i].state === vm._tempNode.state) {
                                vm.jobChain.fileOrderSinks.splice(i, 1);
                                break;
                            }
                        }
                        checkDataBeforePush(vm.node.nodeType, obj);
                    }
                }
                if (vm.node.state !== vm._tempNode.state) {
                    if (vm._tempNode.nodeType === 'Full Node' && vm.jobChainNodeparams && vm.jobChainNodeparams.jobChainNodes && vm.jobChainNodeparams.jobChainNodes.length > 0) {
                        for (let i = 0; i < vm.jobChainNodeparams.jobChainNodes.length; i++) {
                            if (vm._tempNode.state === vm.jobChainNodeparams.jobChainNodes[i].state) {
                                if (vm.node.nodeType === 'Full Node') {
                                    vm.jobChainNodeparams.jobChainNodes[i].state = vm.node.state;
                                } else {
                                    vm.jobChainNodeparams.jobChainNodes.splice(i, 1);
                                }
                                vm.jobChainNodes = vm.jobChainNodeparams.jobChainNodes;
                                storeNodeParam(true);
                                break;
                            }
                        }
                    }
                }
            } else {
                if (vm.node.nodeType !== 'File Sink') {
                    checkDataBeforePush(vm.node.nodeType, obj);
                } else {
                    if (!vm.jobChain.fileOrderSinks) {
                        vm.jobChain.fileOrderSinks = [];
                    }
                    vm.jobChain.fileOrderSinks.push(obj);
                }
            }

            vm.cancelNode(form);
            checkMissingNodes();
            storeObject();
        };

        function checkDataBeforePush(type, obj) {
            if (vm.jobChain.jobChainNodes.length === 0 || type === 'End Node') {
                vm.jobChain.jobChainNodes.push(obj);
            } else {
                let index = vm.jobChain.jobChainNodes.length - 1;
                for (let i = 0; i < vm.jobChain.jobChainNodes.length; i++) {
                    if (!vm.jobChain.jobChainNodes[i].job) {
                        index = i - 1;
                        break;
                    }
                }
                vm.jobChain.jobChainNodes.splice(index + 1, 0, obj);
            }
        }

        function checkMissingNodes() {
            if (vm.jobChain && !vm.jobChain.jobChainNodes) {
                vm.jobChain.jobChainNodes = [];
            }
            vm._nextState = ['success', 'error'];
            for (let i = 0; i < vm.jobChain.jobChainNodes.length; i++) {
                delete vm.jobChain.jobChainNodes[i]['isMatchWithFileSink'];
                delete vm.jobChain.jobChainNodes[i]['isMatchNextStateWithFileSink'];
                delete vm.jobChain.jobChainNodes[i]['missingNode'];
                vm.jobChain.jobChainNodes[i].isNextStateExist = false;
                vm.jobChain.jobChainNodes[i].isErrorStateExist = false;
                vm.jobChain.jobChainNodes[i].isParam = false;
                if (vm._nextState.indexOf(vm.jobChain.jobChainNodes[i].state) === -1) {
                    vm._nextState.push(vm.jobChain.jobChainNodes[i].state);
                }

                if (vm.jobChainNodeparams && vm.jobChainNodeparams.jobChainNodes) {
                    for (let j = 0; j < vm.jobChainNodeparams.jobChainNodes.length; j++) {
                        if (vm.jobChainNodeparams.jobChainNodes[j].state === vm.jobChain.jobChainNodes[i].state && !_.isEmpty(vm.jobChainNodeparams.jobChainNodes[j].params)) {
                            vm.jobChain.jobChainNodes[i].isParam = true;
                            break;
                        }
                    }
                }

                if (vm.jobChain.jobChainNodes[i].job) {
                    for (let j = 0; j < vm.jobChain.jobChainNodes.length; j++) {
                        if (vm.jobChain.jobChainNodes[i].state !== vm.jobChain.jobChainNodes[j].state) {
                            if (vm.jobChain.jobChainNodes[i].nextState && (vm.jobChain.jobChainNodes[i].nextState === vm.jobChain.jobChainNodes[j].state)) {
                                vm.jobChain.jobChainNodes[i].isNextStateExist = true;
                            }
                            if (vm.jobChain.jobChainNodes[i].errorState && (vm.jobChain.jobChainNodes[i].errorState === vm.jobChain.jobChainNodes[j].state)) {
                                vm.jobChain.jobChainNodes[i].isErrorStateExist = true;
                            }
                        }
                    }

                    for (let m = 0; m < vm.jobChain.fileOrderSinks.length; m++) {
                        if (vm._nextState.indexOf(vm.jobChain.fileOrderSinks[m].state) === -1) {
                            vm._nextState.push(vm.jobChain.fileOrderSinks[m].state);
                        }
                        if (vm.jobChain.jobChainNodes[i].errorState === vm.jobChain.fileOrderSinks[m].state) {
                            if (!vm.jobChain.jobChainNodes[i].onError) {
                                vm.jobChain.jobChainNodes[i].isMatchWithFileSink = true;
                            }
                            vm.jobChain.jobChainNodes[i].isErrorStateExist = true;
                        }
                        if (vm.jobChain.jobChainNodes[i].nextState === vm.jobChain.fileOrderSinks[m].state) {
                            vm.jobChain.jobChainNodes[i].isNextStateExist = true;
                            vm.jobChain.jobChainNodes[i].isMatchNextStateWithFileSink = true;
                        }
                    }
                }
                if (vm.jobChain.jobChainNodes[i].state === vm.jobChain.jobChainNodes[i].nextState) {
                    vm.jobChain.jobChainNodes[i].isNextStateExist = true;
                }
                if (vm.jobChain.jobChainNodes[i].state === vm.jobChain.jobChainNodes[i].errorState) {
                    vm.jobChain.jobChainNodes[i].isErrorStateExist = true;
                }
            }
        }

        vm.addMissingNode = function (stepNode) {
            let node = angular.copy(vm.node);
            if (stepNode) {
                node = stepNode;
            }
            if (node.nextState && !node.isNextStateExist) {
                vm.jobChain.jobChainNodes.push({
                    state: node.nextState,
                    node: 'End Node',
                });
            }
            if (node.errorState && !node.isErrorStateExist) {
                vm.jobChain.jobChainNodes.push({
                    state: node.errorState,
                    node: 'End Node',
                });
            }
            checkMissingNodes();
            storeObject();
            vm.cancelNode();
            if (stepNode) {
                reloadGraph();
            }
        };

        vm.cancelNode = function (form) {
            vm._tempNode = null;
            vm.isUnique = true;
            vm.node = {nodeType: 'Full Node'};
            if (form) {
                form.$setPristine();
                form.$setUntouched();
                form.$invalid = false;
                form.state.$invalid = false;
            }
        };

        vm.getTreeStructure = function () {
            vm._temp = angular.copy(vm.object.jobs);
            $('#objectModal').modal('show');
            EditorService.tree({
                jobschedulerId: vm.schedulerIds.selected,
                forJoe: true,
                types: ['JOB']
            }).then(function (res) {
                vm.tree = res.folders;
                angular.forEach(vm.tree, function (value) {
                    value.expanded = true;
                    if (value.folders) {
                        value.folders = orderBy(value.folders, 'name');
                    }
                });
            }, function () {
                $('#objectModal').modal('hide');
            });
        };

        vm.treeHandler = function (data) {
            if (vm.extraInfo.path !== data.path) {
                data.jobs = [];
                EditorService.getFolder({
                    jobschedulerId: vm.schedulerIds.selected,
                    path: data.path
                }).then(function (result) {
                    data.jobs = [];
                    angular.forEach(result.jobs, function (job) {
                        if (vm.isOrderJob(job)) {
                            job.path = data.path === '/' ? '/' + job.name : data.path + '/' + job.name;
                            data.jobs.push(job);
                        }
                    })
                });
            }
        };

        vm.treeHandler1 = function (data) {
            if (data.expanded) {
                data.folders = orderBy(data.folders, 'name');
            }
        };

        vm.getJobTreeStructure = function () {
            vm.getObjectTreeStructure('JOB', function (data) {
                vm.node.job = data.job;
            });
        };

        vm.addJobs = function () {
            vm._jobs = [];
            angular.forEach(vm.object.jobs, function (job) {
                vm._jobs.push({
                    name: job.substring(job.lastIndexOf('/') + 1),
                    path1: job.substring(0, job.lastIndexOf('/')),
                    path: job
                });
            })
        };

        vm.cancelModel = function () {
            vm.object.jobs = angular.copy(vm._temp);
            $('#objectModal').modal('hide');
        };

        vm.isUnique = true;

        function addOrderToWorkflow() {
            vm.orderNodeparams = null;
            vm.global = {node: 'global'};
            vm.isUnique = true;
            vm.order = {jobChain: vm.jobChain.name, orderId: ''};
            $('#orderModal').modal('show');
        }

        vm.checkOrderId = function () {
            vm.isUnique = true;
            for (let i = 0; i < vm.orders.length; i++) {
                if (vm.order.orderId === vm.orders[i].orderId && vm.order.jobChain === vm.orders[i].jobChain) {
                    if (!(vm._tempOrder && vm._tempOrder.orderId === vm.order.orderId)) {
                        vm.isUnique = false;
                    }
                    break;
                }
            }
        };

        vm.checkNodeName = function (node) {
            vm.isUnique = true;
            let tempName = vm._tempNode ? vm._tempNode.state : '';
            for (let i = 0; i < vm.jobChain.jobChainNodes.length; i++) {
                if (node.state === vm.jobChain.jobChainNodes[i].state && tempName !== node.state) {
                    vm.isUnique = false;
                    break;
                }
            }
            if (vm.isUnique) {
                for (let i = 0; i < vm.jobChain.fileOrderSinks.length; i++) {
                    if (node.state === vm.jobChain.fileOrderSinks[i].state && tempName !== node.state) {
                        vm.isUnique = false;
                        break;
                    }
                }
            }
        };

        vm.onAddOrder = function (form) {
            vm.order.name = vm.order.jobChain + ',' + vm.order.orderId;
            if (!vm._tempOrder) {
                vm.order.type = 'ORDER';
                vm.storeObject(vm.order, vm.order, null, function (result) {
                    if (!result) {
                        vm.jobChainOrders.push(angular.copy(vm.order));
                        vm.orders.push(angular.copy(vm.order));
                    }
                    vm.order = {};
                });
            } else {
                for (let i = 0; i < vm.jobChainOrders.length; i++) {
                    if (angular.equals(vm.jobChainOrders[i], vm._tempOrder)) {
                        vm.jobChainOrders[i].title = vm.order.title;
                        vm.jobChainOrders[i].priority = vm.order.priority;
                        vm.jobChainOrders[i].initialState = vm.order.initialState;
                        vm.jobChainOrders[i].endState = vm.order.endState;
                        if (vm._tempOrder.orderId !== vm.order.orderId) {
                            vm.jobChainOrders[i].orderId = vm.order.orderId;
                            vm.jobChainOrders[i].name = vm.order.name;
                            renameOrderId(vm._tempOrder, vm.order);
                        } else {
                            vm.storeObject(vm.order, vm.order);
                        }
                        reloadGraph();
                        break;
                    }
                }
            }
            vm.closeModel(form);
        };

        function renameOrderId(_tempOrder, order) {
            let path = '', oldPath = '';
            if (vm.jobChain.path === '/') {
                path = vm.jobChain.path + order.name;
                oldPath = vm.jobChain.path + _tempOrder.name;
            } else {
                path = vm.jobChain.path + '/' + order.name;
                oldPath = vm.jobChain.path + '/' + _tempOrder.name;
            }
            EditorService.rename({
                jobschedulerId: vm.schedulerIds.selected,
                objectType: 'ORDER',
                path: path,
                oldPath: oldPath,
            }).then(function () {
                vm.storeObject(order, order);
            });
        }

        function addFileOrderToWorkflow() {
            vm.orderSource = {};
            $('#fileOrderModal').modal('show');
        }

        vm.onAddFileOrder = function (form) {
            if (!vm._tempOrderSource) {
                let flag = true;
                if (!vm.jobChain.fileOrderSources) {
                    vm.jobChain.fileOrderSources = [];
                } else {
                    for (let i = 0; i < vm.jobChain.fileOrderSources.length; i++) {
                        vm.orderSource.fId = vm.jobChain.fileOrderSources[i].fId;
                        if (angular.equals(angular.toJson(vm.jobChain.fileOrderSources[i]), angular.toJson(vm.orderSource))) {
                            flag = false;
                            break;
                        }
                    }
                }
                if (flag) {
                    vm.jobChain.fileOrderSources.push(angular.copy(vm.orderSource));
                }
                vm.orderSource = {};
            } else {
                for (let i = 0; i < vm.jobChain.fileOrderSources.length; i++) {
                    vm._tempOrderSource.fId = vm.jobChain.fileOrderSources[i].fId;
                    if (angular.equals(angular.toJson(vm.jobChain.fileOrderSources[i]), angular.toJson(vm._tempOrderSource))) {
                        vm.jobChain.fileOrderSources.splice(i, 1);
                        break;
                    }
                }
                vm.jobChain.fileOrderSources.push(angular.copy(vm.orderSource));
                vm.orderSource = {};
            }
            vm.closeModel(form);
            storeObject();
            reloadGraph();
        };

        vm.closeModel = function (form) {
            vm.orderNodeparams = null;
            $('#orderModal').modal('hide');
            $('#fileOrderModal').modal('hide');
            vm._tempOrderSource = null;
            vm._tempOrder = null;
            if (form) {
                form.$setPristine();
                form.$setUntouched();
                form.$invalid = false;
            }
        };

        vm.onKeyPress = function ($event, type) {
            if ($event) {
                let key = $event.keyCode || $event.which;
                if (key == '13') {
                    if (type === 'param') {
                        vm.addParameter();
                    } else if (type === 'rParam') {
                        vm.addReturnCodeOrderParameter()
                    } else if (type === 'oParam') {
                        vm.addNodeParameter()
                    }
                }
            } else {
                vm.addReturnCode();
            }
        };

        vm.openSidePanel = function (title) {
            vm.openSidePanelG(title);
            if (title === 'nodeParameter') {
                vm.jobChainNodes = [];
                if (vm.jobChainNodeparams) {
                    if (vm.jobChainNodeparams.jobChainNodes) {
                        vm.jobChainNodes = vm.jobChainNodeparams.jobChainNodes || [];
                    }
                    if (vm.jobChainNodeparams.params) {
                        vm._nodeParams = vm.jobChainNodeparams.params;
                    }
                }
                vm.jobChainNode = {};
                if (vm.jobChainNodes.length > 0) {
                    let flg = false;
                    for (let i = 0; i < vm.jobChainNodes.length; i++) {
                        if (vm.node.state === vm.jobChainNodes[i].state) {
                            vm.jobChainNode = vm.jobChainNodes[i];
                            flg = true;
                            break;
                        }
                    }
                    if (!flg) {
                        vm.jobChainNodes.push({state: vm.node.state});
                        vm.jobChainNode = vm.jobChainNodes[vm.jobChainNodes.length - 1];
                    }
                } else {
                    vm.jobChainNodes.push({state: vm.node.state});
                    vm.jobChainNode = vm.jobChainNodes[vm.jobChainNodes.length - 1];
                }
                if (!vm.jobChainNode.params || !vm.jobChainNode.params.paramList) {
                    if (!vm.jobChainNode.params) {
                        vm.jobChainNode.params = {paramList: []};
                    } else {
                        vm.jobChainNode.params.paramList = [];
                    }
                    vm.addParameter();
                }
                vm._tempJobChainNode = angular.copy(vm.jobChainNode);
            } else if (title === 'returnCodes') {
                vm.activeTabInParameter = 'tab11';
                vm.addOrder = false;
                vm.state = [];
                if (!vm.node.onReturnCodes) {
                    vm.node.onReturnCodes = {onReturnCodeList: []};
                }
                if (!vm.node.onReturnCodes.onReturnCodeList) {
                    vm.node.onReturnCodes = {onReturnCodeList: []};
                }

                if (vm.node.onReturnCodes.onReturnCodeList.length > 0) {
                    for (let i = 0; i < vm.node.onReturnCodes.onReturnCodeList.length; i++) {
                        if (vm.node.onReturnCodes.onReturnCodeList[i].toState) {
                            vm.state.push(vm.node.onReturnCodes.onReturnCodeList[i]);
                        }
                    }
                }
                if (vm.state.length === 0) {
                    vm.addReturnCode();
                }
                vm._tempRc = angular.copy(vm.node);
            }
        };

        vm.closeSidePanel1 = function () {
            if (vm.obj) {
                if (vm.obj.type === 'nodeParameter') {
                    storeNodeParam();
                }else {
                    if (vm._tempRc) {
                        vm.applyState();
                        for (let i = 0; i < vm.jobChain.jobChainNodes.length; i++) {
                            if (angular.equals(angular.toJson(vm.jobChain.jobChainNodes[i]), angular.toJson(vm._tempNode))) {
                                vm.jobChain.jobChainNodes[i].onReturnCodes = vm.node.onReturnCodes;
                                if (vm.node.onReturnCodes && vm.node.onReturnCodes.onReturnCodeList && vm.node.onReturnCodes.onReturnCodeList.length === 0) {
                                    delete vm.jobChain.jobChainNodes[i].onReturnCodes['onReturnCodeList'];
                                }
                                break;
                            }
                        }
                        if (vm._tempRc && !angular.equals(angular.toJson(vm._tempRc), angular.toJson(vm.node))) {
                            storeObject();
                            if (vm.joeConfigFilters.jobChain.pageView === 'graph') {
                                reloadGraph();
                            }
                        }
                    }
                    vm._tempRc = null;
                }
                vm.closeSidePanel();
            }
        };

        function getNodeParams() {
            let _path;
            if (vm.jobChain.path === '/') {
                _path = vm.jobChain.path + vm.jobChain.name;
            } else {
                _path = vm.jobChain.path + '/' + vm.jobChain.name;
            }
            EditorService.getFile({
                jobschedulerId: vm.schedulerIds.selected,
                path: _path,
                objectType: 'NODEPARAMS',
            }).then(function (res) {
                if (res.configuration && res.configuration.jobChain && res.configuration.jobChain.order) {
                    vm.jobChainNodeparams = res.configuration.jobChain.order;
                }
                if (!vm.jobChainNodeparams) {
                    vm.jobChainNodeparams = {params: {}};
                }

                if (vm.joeConfigFilters.jobChain.pageView === 'graph') {
                    reloadGraph();
                }else{
                    checkMissingNodes()
                }
            });
        }

        function storeNodeParam(noCheck) {
            if (vm.jobChain && vm.jobChain.name && vm.jobChain.path && vm.permission && vm.permission.JobschedulerMaster && vm.permission.JobschedulerMaster.administration.configurations.edit) {
                let _path;
                if (vm.jobChain.path === '/') {
                    _path = vm.jobChain.path + vm.jobChain.name;
                } else {
                    _path = vm.jobChain.path + '/' + vm.jobChain.name;
                }
                if(vm.jobChainNode)
                    EditorService.clearEmptyData(vm.jobChainNode);
                if (vm._tempJobChainNode)
                    EditorService.clearEmptyData(vm._tempJobChainNode);
                if ((vm._tempJobChainNode && !angular.equals(vm._tempJobChainNode, vm.jobChainNode)) || noCheck) {
                    for (let i = 0; i < vm.jobChainNodes.length; i++) {
                        if (vm.jobChainNodes[i].state && !vm.jobChainNodes[i].params) {
                            vm.jobChainNodes.splice(i, 1);
                            break;
                        }
                    }
                    let obj = {
                        jobschedulerId: vm.schedulerIds.selected,
                        objectType: 'NODEPARAMS',
                        path: _path,
                        configuration: {
                            "jobChain": {
                                "name": vm.jobChain.name,
                                "order": {"params": vm._nodeParams, "jobChainNodes": vm.jobChainNodes}
                            }
                        }
                    };
                    EditorService.store(obj).then(function () {
                        checkMissingNodes();
                        if (vm.joeConfigFilters.jobChain.pageView === 'graph') {
                            reloadGraph();
                        }
                        vm._tempJobChainNode = null;
                    }, function (err) {
                        vm.checkIsFolderLock(err, vm.jobChain.path, function (result) {
                            if (result === 'yes') {
                                EditorService.store(obj).then(function () {
                                    checkMissingNodes();
                                    if (vm.joeConfigFilters.jobChain.pageView === 'graph') {
                                        reloadGraph();
                                    }
                                });
				vm._tempJobChainNode = null;
                            } else {
                                vm.jobChainNode = vm._tempJobChainNode;
                            }
                        });
                    })
                }
            }
        }

        vm.addParameter = function () {
            let param = {
                name: '',
                value: ''
            };
            if (!EditorService.isLastEntryEmpty(vm.jobChainNode.params.paramList, 'name', '')) {
                vm.jobChainNode.params.paramList.push(param);
            }
        };

        vm.removeParams = function (index) {
            vm.jobChainNode.params.paramList.splice(index, 1);
        };

        vm.changeActiveParameterTab = function (data) {
            vm.activeTabInParameter = data;
        };

        vm.addReturnCode = function () {
            let returnCode = {returnCode: '', toState: {state: ''}};
            if (!EditorService.isLastEntryEmpty(vm.state, 'returnCode', '')) {
                vm.state.push(returnCode);
            }
        };

        vm.applyState = function () {
            if (vm.state.length > 0) {
                let last = vm.state[vm.state.length - 1];
                if (!last.returnCode || !last.toState.state) {
                    vm.state.splice(vm.state.length - 1, 1);
                }
                if (!vm.node.onReturnCodes) {
                    vm.node.onReturnCodes = {onReturnCodeList: []};
                } else if (!vm.node.onReturnCodes.onReturnCodeList) {
                    vm.node.onReturnCodes.onReturnCodeList = [];
                }
            }
            let flag;
            if (vm.node.onReturnCodes.onReturnCodeList.length > 0) {
                if (vm.state.length > 0) {
                    for (let i = 0; i < vm.state.length; i++) {
                        flag = false;
                        for (let j = 0; j < vm.node.onReturnCodes.onReturnCodeList.length; j++) {
                            if ((vm.node.onReturnCodes.onReturnCodeList[j].addOrder && vm.state[i].returnCode === vm.node.onReturnCodes.onReturnCodeList[j].addOrder.returnCode) || vm.state[i].returnCode === vm.node.onReturnCodes.onReturnCodeList[j].returnCode) {
                                flag = true;
                                let temp;
                                if (vm.node.onReturnCodes.onReturnCodeList[j].addOrder) {
                                    delete vm.node.onReturnCodes.onReturnCodeList[j].addOrder.returnCode;
                                    temp = {
                                        returnCode: vm.state[i].returnCode,
                                        addOrder: vm.node.onReturnCodes.onReturnCodeList[j].addOrder,
                                        toState: vm.state[i].toState
                                    }
                                } else {
                                    temp = {returnCode: vm.state[i].returnCode, toState: vm.state[i].toState}
                                }
                                vm.node.onReturnCodes.onReturnCodeList[j] = temp;
                                break;
                            }
                        }
                        if (!flag && !vm.isEdit) {
                            if (vm.state[i].returnCode) {
                                vm.node.onReturnCodes.onReturnCodeList.push(vm.state[i]);
                            }
                        }
                        if (vm.isEdit) {
                            vm.node.onReturnCodes.onReturnCodeList[vm.state[i].index].returnCode = vm.state[i].returnCode;
                            vm.node.onReturnCodes.onReturnCodeList[vm.state[i].index].toState.state = vm.state[i].toState.state;
                        }
                    }
                } else {
                    let _tempArr = [];
                    for (let j = 0; j < vm.node.onReturnCodes.onReturnCodeList.length; j++) {
                        if (vm.node.onReturnCodes.onReturnCodeList[j].addOrder) {
                            _tempArr.push(vm.node.onReturnCodes.onReturnCodeList[j]);
                        }
                    }
                    vm.node.onReturnCodes.onReturnCodeList = _tempArr;
                }
            } else {
                vm.node.onReturnCodes.onReturnCodeList = vm.state;
            }
            updateNode();
        };

        vm.editAddOrder = function (data) {
            vm.variable = {addOrder: {}};
            vm.addOrder = true;
            vm.variable.returnCode = angular.copy(data.returnCode);
            vm.variable.addOrder.id = angular.copy(data.addOrder.id);
            vm.variable.addOrder.isShow = angular.copy(data.addOrder.isShow);
            vm.variable.addOrder.jobChain = angular.copy(data.addOrder.jobChain);
            vm.variable.isEdit = true;
            vm.paramObject = [];
            if (data.addOrder.params && data.addOrder.params.paramList.length > 0) {
                vm.paramObject = data.addOrder.params.paramList;
            }
            delete vm.variable.params;
            vm.tempEdit = angular.copy(vm.variable.returnCode);
        };

        vm.removeReturnCode = function (index) {
            vm.state.splice(index, 1);
        };

        vm.removeAddOrderReturnCode = function (index, e) {
            if (e == 'order') {
                if (vm.node.onReturnCodes.onReturnCodeList[index].toState) {
                    delete vm.node.onReturnCodes.onReturnCodeList[index].addOrder;
                } else {
                    vm.node.onReturnCodes.onReturnCodeList.splice(index, 1);
                }
            } else {
                if (vm.node.onReturnCodes.onReturnCodeList[index].addOrder) {
                    delete vm.node.onReturnCodes.onReturnCodeList[index].toState;
                } else {
                    vm.node.onReturnCodes.onReturnCodeList.splice(index, 1);
                }
            }
        };

        vm.addReturnCodeOrderParameter = function () {
            let param = {
                name: '',
                value: ''
            };
            if (!EditorService.isLastEntryEmpty(vm.paramObject, 'name', '')) {
                vm.paramObject.push(param);
            }
        };

        vm.removeReturnCodeOrderParameter = function (index) {
            vm.paramObject.splice(index, 1);
        };

        vm.removeParamsReturnCode = function (index, rCode) {
            rCode.addOrder.params.paramList.splice(index, 1);
            if (rCode.addOrder.params.paramList.length === 0) {
                delete rCode.addOrder.params;
                rCode.addOrder.isShow = false;
            }
        };

        vm.showOrder = function () {
            vm.addOrder = true;
            vm.variable = {
                returnCode: '',
                addOrder: {
                    id: '',
                    jobChain: '',
                    isShow: false,
                    xmlns: "https://jobscheduler-plugins.sos-berlin.com/NodeOrderPlugin"
                }
            };
            vm.paramObject = [];
        };

        vm.applyOrder = function () {
            if (vm.variable.returnCode) {
                if (vm.paramObject.length > 0) {
                    if (vm.variable && !vm.variable.params) {
                        vm.variable.addOrder.params = {paramList: vm.paramObject};
                    } else {
                        vm.paramObject.forEach(function (data) {
                            vm.variable.addOrder.params.paramList.push(data);
                        });
                    }
                }
                if (vm.node.onReturnCodes.onReturnCodeList.length > 0) {
                    let flag = false;
                    for (let i = 0; i < vm.node.onReturnCodes.onReturnCodeList.length; i++) {
                        if (vm.node.onReturnCodes.onReturnCodeList[i].returnCode === vm.variable.returnCode) {
                            if (vm.node.onReturnCodes.onReturnCodeList[i] && vm.node.onReturnCodes.onReturnCodeList[i].addOrder && vm.node.onReturnCodes.onReturnCodeList[i].addOrder.params && vm.node.onReturnCodes.onReturnCodeList[i].addOrder.params.paramList && vm.node.onReturnCodes.onReturnCodeList[i].addOrder.params.paramList.length > 0) {
                                if (vm.variable && !vm.variable.params) {
                                    vm.variable.params = {paramList: vm.node.onReturnCodes.onReturnCodeList[i].addOrder.params.paramList}
                                } else {
                                    if (!vm.variable.isEdit) {
                                        for (let j = 0; j < vm.node.onReturnCodes.onReturnCodeList[i].addOrder.params.paramList.length; j++) {
                                            vm.variable.params.paramList.push(vm.node.onReturnCodes.onReturnCodeList[i].addOrder.params.paramList[j]);
                                        }
                                    }
                                }
                                flag = true;
                                vm.node.onReturnCodes.onReturnCodeList[i].returnCode = vm.variable.returnCode;
                                vm.node.onReturnCodes.onReturnCodeList[i].addOrder = vm.variable.addOrder;
                                break;
                            } else if (vm.node.onReturnCodes.onReturnCodeList[i] && !vm.node.onReturnCodes.onReturnCodeList[i].addOrder) {
                                flag = true;
                                vm.node.onReturnCodes.onReturnCodeList[i].returnCode = vm.variable.returnCode;
                                vm.node.onReturnCodes.onReturnCodeList[i].addOrder = vm.variable.addOrder;
                                break;
                            }
                        }
                    }
                    if (!flag && !vm.variable.isEdit) {
                        vm.node.onReturnCodes.onReturnCodeList.push({
                            returnCode: vm.variable.returnCode,
                            addOrder: vm.variable.addOrder
                        });
                    }
                    if (!flag && vm.variable.isEdit) {
                        let state;
                        for (let i = 0; i < vm.node.onReturnCodes.onReturnCodeList.length; i++) {
                            if (vm.node.onReturnCodes.onReturnCodeList[i].returnCode === vm.tempEdit) {
                                if (vm.node.onReturnCodes.onReturnCodeList[i].toState) {
                                    state = angular.copy(vm.node.onReturnCodes.onReturnCodeList[i].toState);
                                }
                                vm.node.onReturnCodes.onReturnCodeList.splice(i, 1);
                            }
                        }
                        if (state) {
                            vm.node.onReturnCodes.onReturnCodeList.push({
                                returnCode: vm.variable.returnCode,
                                toState: state,
                                addOrder: vm.variable.addOrder
                            });
                        } else {
                            vm.node.onReturnCodes.onReturnCodeList.push({
                                returnCode: vm.variable.returnCode,
                                addOrder: vm.variable.addOrder
                            });
                        }
                    }
                } else {
                    vm.node.onReturnCodes.onReturnCodeList.push(vm.variable);
                }
                vm.addOrder = false;
                updateNode();
            }
        };

        vm.cancelOrder = function () {
            vm.addOrder = false;
        };

        vm.showParamsList = function (data) {
            data.isShow = true;
        };

        vm.hideParamsList = function (data) {
            data.isShow = false;
        };

        let isSort = false;
        vm.sortableOptions = {
            start: function (e, ui) {
                isSort = false;
                if (!ui.item.sortable.model) {
                    ui.item.sortable.cancel();
                } else if (!ui.item.sortable.model.job) {
                    ui.item.sortable.cancel();
                }
            }, update: function (e, ui) {
                if (ui.item.sortable.model && ui.item.sortable.model.job) {
                    isSort = true;
                }
            },
            stop: function () {
                if (isSort) {
                    storeObject();
                }
            }
        };

        function updateNode() {
            for (let i = 0; i < vm.jobChain.jobChainNodes.length; i++) {
                if (vm.jobChain.jobChainNodes[i].state === vm._tempNode.state) {
                    vm.jobChain.jobChainNodes[i].onReturnCodes = vm.node.onReturnCodes;
                    break;
                }
            }
        }

        vm.openNodeParameter = function (order) {
            if (!vm.orderNodeparams) {
                getNodeParam(order);
            }
            $('#nodeParameterModal').modal('show');
        };

        vm.closeModelP = function () {
            $('#nodeParameterModal').modal('hide');
            vm.storeNodeParameter(vm.order);
        };

        vm.addNodeParameter = function () {
            let param = {
                name: '',
                value: ''
            };
            if (!vm.nodeparams.paramList) {
                vm.nodeparams.paramList = [];
            }
            if (!EditorService.isLastEntryEmpty(vm.nodeparams.paramList, 'name', '')) {
                vm.nodeparams.paramList.push(param);
            }
        };

        vm.removeNodeParams = function (index) {
            vm.nodeparams.paramList.splice(index, 1);
        };

        function getNodeParam(order) {
            let _path;
            if (vm.jobChain.path === '/') {
                _path = vm.jobChain.path + order.jobChain + ',' + order.orderId;
            } else {
                _path = vm.jobChain.path + '/' + order.jobChain + ',' + order.orderId;
            }
            EditorService.getFile({
                jobschedulerId: vm.schedulerIds.selected,
                path: _path,
                objectType: 'NODEPARAMS',
            }).then(function (res) {
                if (res.configuration && res.configuration.jobChain && res.configuration.jobChain.order) {
                    vm.orderNodeparams = res.configuration.jobChain.order;
                }
                if (!vm.orderNodeparams) {
                    vm.orderNodeparams = {params: {}};
                }
                vm.changeGlobalNode();
            });
        }

        vm.changeGlobalNode = function () {
            if (vm.global.node === 'global') {
                if (!vm.orderNodeparams.params) {
                    vm.orderNodeparams.params = {};
                }
                vm.nodeparams = vm.orderNodeparams.params;
            } else {
                if (!vm.orderNodeparams.jobChainNodes) {
                    vm.orderNodeparams.jobChainNodes = [];
                }
                let flag = false;
                if (vm.orderNodeparams.jobChainNodes && vm.orderNodeparams.jobChainNodes.length > 0) {
                    for (let i = 0; i < vm.orderNodeparams.jobChainNodes.length; i++) {
                        if (vm.orderNodeparams.jobChainNodes[i].state === vm.global.node) {
                            vm.nodeparams = vm.orderNodeparams.jobChainNodes[i].params || {};
                            flag = true;
                            break;
                        }
                    }
                }
                if (!flag) {
                    vm.orderNodeparams.jobChainNodes.push({state: vm.global.node, params: {}});
                    vm.nodeparams = vm.orderNodeparams.jobChainNodes[vm.orderNodeparams.jobChainNodes.length - 1].params;
                }
            }
            if (!vm.nodeparams.paramList) {
                vm.nodeparams.paramList = [];
            }
            if (vm.nodeparams.paramList.length === 0) {
                vm.addNodeParameter();
            }
        };

        vm.storeNodeParameter = function (order) {
            if (vm.orderNodeparams && vm.permission && vm.permission.JobschedulerMaster && vm.permission.JobschedulerMaster.administration.configurations.edit) {
                EditorService.clearEmptyData(vm.orderNodeparams);
                let _path;
                if (vm.jobChain.path === '/') {
                    _path = vm.jobChain.path + order.jobChain + ',' + order.orderId;
                } else {
                    _path = vm.jobChain.path + '/' + order.jobChain + ',' + order.orderId;
                }
                let conf = {
                    jobChain: {
                        "name": order.jobChain, order: vm.orderNodeparams
                    }
                };
                EditorService.store({
                    jobschedulerId: vm.schedulerIds.selected,
                    objectType: 'NODEPARAMS',
                    path: _path,
                    configuration: conf
                })
            }
        };

        vm.setView = function (view) {
            if (vm.joeConfigFilters.jobChain.pageView === view) {
                return;
            } else {
                if (view === 'graph') {
                    checkNode();
                }
            }
            vm.joeConfigFilters.jobChain.pageView = view;
            vm.isUnique = true;
            if (view === 'graph' && vm.editor) {
                vm.editor.graph.removeCells(vm.editor.graph.getChildVertices(vm.editor.graph.getDefaultParent()));
                createWorkflowDiagram(vm.editor.graph, null, vm.joeConfigFilters.jobChain.showError);
            }
            vm.cancelNode();
        };

        vm.export = function () {
            if (vm.editor && vm.editor.graph) {
                vm.exportSvg(vm.jobChain.name);
            }
        };

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
            let dom = document.getElementById('graph');
            let x = 0.5, y = 0.2;
            if (dom.clientWidth !== dom.scrollWidth) {
                x = 0;
            }
            if (dom.clientHeight !== dom.scrollHeight) {
                y = 0;
            }
            vm.editor.graph.center(true, true, x, y);
        }

        function storeObject() {
            if (vm.jobChain && vm.jobChain.name) {
                if (!vm.extraInfo.lockedSince) {
                    vm.lockObject(vm.jobChain);
                }
                if (!vm.jobChain.deleted) {
                    vm.storeObject(vm.jobChain, vm.jobChain, null, function (result) {
                        if (!result) {
                            vm.extraInfo.storeDate = new Date();
                        }
                    });
                }
            }
        }

        function checkNode() {
            if (vm._tempNode) {
                if (!angular.equals(angular.toJson(vm._tempNode), angular.toJson(vm.node))) {
                    vm.applyNode(vm.myForm);
                }
            } else {
                if (vm.node && vm.node.state) {
                    vm.applyNode(vm.myForm);
                }
            }
        }

        vm.newNode = function(form){
            if (vm._tempNode) {
                if (!angular.equals(angular.toJson(vm._tempNode), angular.toJson(vm.node))) {
                    vm.applyNode(form);
                }else {
                    vm.cancelNode(form);
                }
            } else {
                if (vm.node && vm.node.state) {
                    vm.applyNode(form);
                }else {
                    vm.cancelNode(form);
                }
            }
        };

        vm.$on('deployables', function () {
            checkNode();
        });

        vm.$on('RELOAD', function (evt, jobChain) {
            if (vm.extraInfo && vm.editor && vm.editor.graph) {
                if (jobChain && jobChain.folders && jobChain.folders.length > 3) {
                    vm.jobs = jobChain.folders[0].children || [];
                    vm.jobChains = jobChain.folders[1].children || [];
                    vm.orders = jobChain.folders[2].children || [];
                    vm.jobChainOrders = [];
                    if (vm.orders && vm.orders.length > 0) {
                        for (let i = 0; i < vm.orders.length; i++) {
                            if (vm.orders[i].jobChain === vm.jobChain.name && !vm.orders[i].deleted) {
                                vm.jobChainOrders.push(vm.orders[i]);
                            }
                        }
                    }
                }
                vm.checkLockedBy(jobChain, null, vm.extraInfo);
                reloadGraph();
            }
        });

        vm.$on('NEW_PARAM', function (evt, obj) {
            initialDefaultObject();
            if (obj.superParent) {
                vm.checkLockedBy(obj.superParent, null, vm.extraInfo);
            }

            if (vm.editor && vm.editor.graph) {
                vm.editor.graph.removeCells(vm.editor.graph.getChildVertices(vm.editor.graph.getDefaultParent()));
            }
            vm.jobChain = obj.parent;
            vm.setLastSection(vm.jobChain);
            getNodeParams();
            if (obj.superParent && obj.superParent.folders && obj.superParent.folders.length > 0) {
                vm.jobs = obj.superParent.folders[0].children;
                vm.jobChains = obj.superParent.folders[1].children;
                vm.orders = obj.superParent.folders[2].children;
                vm.jobChainOrders = [];
                if (vm.orders && vm.orders.length > 0) {
                    for (let i = 0; i < vm.orders.length; i++) {
                        if (vm.orders[i].jobChain === vm.jobChain.name && !vm.orders[i].deleted) {
                            vm.jobChainOrders.push(vm.orders[i]);
                        }
                    }
                }
            }
            if (!vm.jobChain.jobChainNodes) {
                vm.jobChain.jobChainNodes = [];
            }
            if (!vm.jobChain.fileOrderSinks) {
                vm.jobChain.fileOrderSinks = [];
            }
            if (!vm.jobChain.fileOrderSources) {
                vm.jobChain.fileOrderSources = [];
            }
            if (!vm.editor) {
                init();
            }
            vm.node = {nodeType: 'Full Node'};
        });

        $scope.$on('$destroy', function () {
            //call store
            checkNode();
            vm.closeSidePanel1();
            if (t1) {
                $timeout.cancel(t1);
            }
            if (timer) {
                $timeout.cancel(timer);
            }
            try {
                if (vm.editor) {
                    vm.editor.destroy();
                    vm.editor = null;
                }
            } catch (e) {

            }
        });
    }

    FileOrderCtrl.$inject = ['$scope'];

    function FileOrderCtrl($scope) {
        const vm = $scope;

        vm.removeFileOrder = function (index) {
            vm.jobChain.fileOrderSources.splice(index, 1);
            storeObject();
        };

        vm.editFileOrder = function (node) {
            if (vm._tempFileOrder) {
                if (angular.equals(angular.toJson(node), angular.toJson(vm._tempFileOrder))) {
                    return;
                } else {
                    if (!angular.equals(angular.toJson(vm._tempFileOrder), angular.toJson(vm.fileOrderSource))) {
                        vm.applyFileOrder(vm.form);
                    }
                }
            } else {
                if (vm.fileOrderSource && vm.fileOrderSource.directory) {
                    vm.applyFileOrder(vm.form);
                }
            }
            node.alertWhenDirectoryMissing = node.alertWhenDirectoryMissing === 'true' || node.alertWhenDirectoryMissing === true;
            vm.fileOrderSource = angular.copy(node);
            vm._tempFileOrder = angular.copy(node);
        };

        vm.applyFileOrder = function (form) {
            if (form && form.$invalid) {
                return
            }
            if (!vm.jobChain.fileOrderSources) {
                vm.jobChain.fileOrderSources = [];
            }
            if (!vm.fileOrderSource.directory) {
                return;
            }
            let obj = {
                directory: vm.fileOrderSource.directory,
                regex: vm.fileOrderSource.regex,
                delayAfterError: vm.fileOrderSource.delayAfterError,
                repeat: vm.fileOrderSource.repeat,
                nextState: vm.fileOrderSource.nextState,
                alertWhenDirectoryMissing: vm.fileOrderSource.alertWhenDirectoryMissing
            };

            if (vm._tempFileOrder) {
                for (let i = 0; i < vm.jobChain.fileOrderSources.length; i++) {
                    if (angular.equals(angular.toJson(vm.jobChain.fileOrderSources[i]), angular.toJson(vm._tempFileOrder))) {
                        vm.jobChain.fileOrderSources[i] = obj;
                        break;
                    }
                }
            } else {
                if (vm.fileOrderSource && vm.fileOrderSource.directory) {
                    let flag = true;
                    if (!vm.jobChain.fileOrderSources) {
                        vm.jobChain.fileOrderSources = [];
                    }else{
                        for (let i = 0; i < vm.jobChain.fileOrderSources.length; i++) {
                            if (angular.equals(angular.toJson(vm.jobChain.fileOrderSources[i]), angular.toJson(obj))) {
                                flag = false;
                                break;
                            }
                        }
                    }
                    if(flag) {
                        vm.jobChain.fileOrderSources.push(obj);
                    }
                }
            }
            vm.cancelFileOrder(form);
            storeObject();
        };

        vm.cancelFileOrder = function (form) {
            vm._tempFileOrder = null;
            vm.fileOrderSource = {};
            if (form) {
                form.$setPristine();
                form.$setUntouched();
                form.$invalid = false;
            }
        };

        function storeObject() {
            if (vm.jobChain && vm.jobChain.name) {
                if (!vm.extraInfo.lockedSince) {
                    vm.lockObject(vm.jobChain);
                }
                if (!vm.jobChain.deleted) {
                    vm.storeObject(vm.jobChain, vm.jobChain, null, function (result) {
                        if (!result) {
                            vm.extraInfo.storeDate = new Date();
                        }
                    });
                }
            }
        }

        function checkFileOrder() {
            if (vm._tempFileOrder) {
                if (!angular.equals(angular.toJson(vm._tempFileOrder), angular.toJson(vm.fileOrderSource))) {
                    vm.applyFileOrder(vm.form);
                }
            } else {
                if (vm.fileOrderSource && vm.fileOrderSource.directory) {
                    vm.applyFileOrder(vm.form);
                }
            }
        }

        vm.newFileOrderSource = function(form) {
            if (vm._tempFileOrder) {
                if (!angular.equals(angular.toJson(vm._tempFileOrder), angular.toJson(vm.fileOrderSource))) {
                    vm.applyFileOrder(form);
                } else {
                    vm.cancelFileOrder(form);
                }
            } else {
                if (vm.fileOrderSource && vm.fileOrderSource.directory) {
                    vm.applyFileOrder(form);
                } else {
                    vm.cancelFileOrder(form);
                }
            }
        };

        vm.$on('deployables', function () {
            checkFileOrder();
        });

        vm.$on('RELOAD', function (evt, jobChain) {
            if (vm.extraInfo) {
                vm.checkLockedBy(jobChain, null, vm.extraInfo);
            }
        });

        vm.$on('NEW_PARAM', function (evt, obj) {
            vm.extraInfo = {};
            if (obj.superParent) {
                vm.checkLockedBy(obj.superParent, null, vm.extraInfo);
            }
            vm.jobChain = obj.parent;
            if (!vm.jobChain.fileOrderSources) {
                vm.jobChain.fileOrderSources = [];
            }
            vm.setLastSection(vm.jobChain);
        });

        $scope.$on('$destroy', function () {
            //call store
            checkFileOrder();
        });
    }

    WizardCtrl.$inject = ['$scope', '$uibModalInstance', 'EditorService'];

    function WizardCtrl($scope, $uibModalInstance, EditorService) {
        $scope.wizard = {
            step: 1,
            type: 'standalone',
            checkbox: false,
            searchText:''
        };

        $scope.isUnique = true;
        $scope.isLoading = false;

        function getJitlJobs() {
            $scope.isLoading = true;
            $scope.jobList = [];
            $scope.job = {};
            EditorService.getJitlJobs({
                jobschedulerId: $scope.schedulerIds.selected,
                isOrderJob: $scope.wizard.type === 'order'
            }).then(function (res) {
                $scope.jobList = res.jobs;
                $scope.isLoading = false;
            }, function(){
                $scope.isLoading = false;
            });
        }

        $scope.selectJob = function (_job) {
            let name = angular.copy($scope.job.newName);
            EditorService.getJitlJob({
                jobschedulerId: $scope.schedulerIds.selected,
                docPath: _job.docPath
            }).then(function (res) {
                $scope.job = res;
                $scope.job.paramList = [];
                $scope.job.newName = name;
                checkRequiredParam();
            });
        };

        $scope.addParameter = function () {
            let param = {
                name: '',
                newValue: ''
            };
            if (!EditorService.isLastEntryEmpty($scope.job.paramList, 'name', '')) {
                $scope.job.paramList.push(param);
            }
        };

        $scope.removeParams = function (index) {
            $scope.job.paramList.splice(index, 1);
        };

        $scope.next = function () {
            $scope.wizard.step = $scope.wizard.step + 1;
            if (!$scope.jobList) {
                getJitlJobs();
            }
            if($scope.wizard.step ===3) {
                setTimeout(function () {
                    popover();
                }, 100)
            }
        };
        $scope.back = function () {
            $scope.wizard.step = $scope.wizard.step - 1;
        };

        $scope.typeChange = function () {
           
            if ($scope.jobList) {
                getJitlJobs();
            }
        };

        $scope.onKeyPress = function ($event) {
            let key = $event.keyCode || $event.which;
            if (key == '13') {
                $scope.addParameter();
            }
        };

        $scope.showDoc = function(path){
            $scope.previewDocument({path: path});
        };

        function popover() {
            $('[data-toggle="popover"]').popover({
                html: true,
                trigger: "manual",
            }).on("mouseenter", function () {
                const _this = this;
                $(this).popover("show");
                $(".popover").on("mouseleave", function () {
                    $(_this).popover('hide');
                });
            }).on("mouseleave", function () {
                const _this = this;
                setTimeout(function () {
                    if (!$(".popover:hover").length) {
                        $(_this).popover("hide");
                    }
                }, 300);
            });
        }

        $scope.ok = function () {
            $scope.job.params = $scope.wizard.params;
            $scope.job.type = $scope.wizard.type;
            $uibModalInstance.close($scope.job);
        };
        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };

        $scope.checkJobName = function() {
           
            $scope.isUnique = true;
            for (let i = 0; i < $scope.childrens.length; i++) {
                if ($scope.childrens[i].name === $scope.job.newName) {
                    $scope.isUnique = false;
                    break;
                }
            }
        };


        /**--------------- Checkbox functions -------------*/

        $scope.checkAll = function () {
            if ($scope.wizard.checkbox) {
                $scope.wizard.params = angular.copy($scope.job.params);
            } else {
                checkRequiredParam();
            }
        };

        function checkRequiredParam(){
            $scope.wizard.params = [];
            if($scope.job.params.length > 0 ) {
                let arr =[];
                for (let i = 0; i < $scope.job.params.length; i++) {
                    if ($scope.job.params[i].required) {
                        $scope.wizard.params.push($scope.job.params[i]);
                    }else{
                        arr.push($scope.job.params[i]);
                    }
                }
                $scope.job.params = $scope.wizard.params.concat(arr);
            }
        }

        const watcher1 = $scope.$watchCollection('wizard.params', function (newNames) {
            if (newNames && newNames.length > 0) {
                $scope.wizard.checkbox = newNames.length === $scope.job.params.length;
            } else {
                $scope.wizard.checkbox = false;
            }
        });

        $scope.$on('$destroy', function () {
            watcher1();
        });
    }
})();
