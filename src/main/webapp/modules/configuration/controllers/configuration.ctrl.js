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
        .controller('XMLEditorCtrl', XMLEditorCtrl);

    EditorConfigurationCtrl.$inject = ['$scope', '$rootScope', '$state', 'CoreService', '$location'];

    function EditorConfigurationCtrl($scope, $rootScope, $state, CoreService, $location) {
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
                    const flag = top < 78;
                    top = top - $(window).scrollTop();
                    dom.css({'height': 'calc(100vh - ' + (top - 10) + 'px'});
                    if (top < 96) {
                        top = 96;
                    }

                    if($location.path().split('/')[2] !== 'other') {
                        $('.sticky').css('top', top);
                    } else {
                        top = top + 35;
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

        $scope.deleteConf = function () {
            $rootScope.$broadcast('deleteXML');
        };

        $scope.$on('$viewContentLoaded', function () {
            $scope.currentTab = $state.current.url;
            setTimeout(function () {
                calcHeight();
            }, 100);
        });

        $scope.$on('$stateChangeSuccess', function (event, toState, toParams) {
            $scope.configFilters.state = toState.name;
        });

        $scope.$on('hide-button', function (event, data) {
            $scope.hideButton = data.submitXSD;
            $scope.isDeployed = data.isDeploy;
            $scope.state = data.XSDState;
        });
    }

    JOEEditorCtrl.$inject = ['$scope', 'SOSAuth', 'CoreService', 'EditorService', 'orderByFilter', '$uibModal', 'clipboard'];

    function JOEEditorCtrl($scope, SOSAuth, CoreService, EditorService, orderBy, $uibModal, clipboard) {
        const vm = $scope;
        vm.joeConfigFilters = CoreService.getConfigurationTab().joe;
        vm.tree = [];
        vm.filter_tree = {};
        vm.filterTree1 = [];
        vm.treeDeploy = {};
        vm.deployables = [];
        vm.isloaded = true;

        vm.deployableObjects = {handleRecursively: true, account: vm.username};
        vm.expanding_property = {
            field: 'name'
        };

        hljs.configure({
            useBR: true
        });

        function recursiveTreeUpdate(scrTree, destTree) {
            if (scrTree && destTree) {
                for (let j = 0; j < scrTree.length; j++) {
                    for (let i = 0; i < destTree.length; i++) {
                        if (destTree[i].path && scrTree[j].path && (destTree[i].path === scrTree[j].path)) {
                            scrTree[j].expanded = destTree[i].expanded;
                            scrTree[j].selected1 = destTree[i].selected1;
                            if (scrTree[j].deleted) {
                                scrTree[j].expanded = false;
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
                                recursiveTreeUpdate(scrTree[j].folders, destTree[i].folders);
                            }
                            break;
                        }
                    }
                }
            }
            return scrTree;
        }

        function init(path, mainPath) {
            if (vm.isloaded) {
                vm.isloaded = false;
                EditorService.tree({
                    jobschedulerId: vm.schedulerIds.selected,
                    types: ['JOE']
                }).then(function (res) {
                    vm.isloaded = true;
                    if (path) {
                        vm.tree = recursiveTreeUpdate(res.folders, vm.tree);
                        updateFolders(path, true);
                        updateFolders(mainPath, true);
                    } else {
                        if (_.isEmpty(vm.joeConfigFilters.expand_to)) {
                            vm.tree = res.folders;
                            if (vm.tree.length > 0) {
                                vm.tree[0].expanded = true;
                                updateObjects(vm.tree[0]);
                            }
                        } else {
                            vm.tree = recursiveTreeUpdate(res.folders, vm.joeConfigFilters.expand_to);
                            restoreState();
                        }

                    }
                }, function () {
                    vm.isloaded = true;
                });
            }
        }

        function restoreState() {
            if (vm.joeConfigFilters.activeTab.type === 'type') {
                vm.type = vm.joeConfigFilters.activeTab.object;
            } else if (vm.joeConfigFilters.activeTab.type === 'param') {
                vm.param = vm.joeConfigFilters.activeTab.object;
            }
            updateFolders(null, true, function (response) {
                let data = response.child;
                let _path = '';
                if (data.object) {
                    _path = data.parent;
                } else {
                    _path = data.path;
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
                        })
                    })
                } else {
                    setTimeout(function () {
                        vm.$broadcast('NEW_PARAM', {
                            object: data,
                            parent: response.parent,
                            superParent: response.superParent
                        })
                    }, 70);
                }
            });
        }

        vm.$on('deployables', function () {
            if (lastClickedItem) {
                let _tempObj = angular.copy(lastClickedItem);
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
                if (!_tempObj.deleted) {
                    vm.storeObject(_tempObj, _tempObj, null, function (result) {
                        if (!result) {
                            vm.$broadcast('UPDATE_TEMP', lastClickedItem);
                            vm.deployTree = _buildDeployTree();
                            vm.deployables = [];
                        }
                    });
                }
            } else {
                vm.deployTree = _buildDeployTree();
                vm.deployables = [];
            }
        });

        function _buildDeployTree() {
            EditorService.deployables({
                jobschedulerId: vm.schedulerIds.selected
            }).then(function (res) {
                buildDeployablesTree(res);
            });
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
                            if (array[j].path == res["deployables"][i].folder) {
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
            let modalInstance = $uibModal.open({
                templateUrl: 'modules/configuration/views/deployables.html',
                controller: 'DialogCtrl1',
                scope: vm,
                backdrop: 'static'
            });
            modalInstance.result.then(function (res) {
                recursivelyDeploy();
            }, function () {
                vm.deployableObjects = {handleRecursively: true, account: vm.username};
            });
        }

        function checkFolder(obj, node) {
            let pathArray = obj.path.split('/');
            let len = pathArray.length - (pathArray.length - 1);
            if (len < pathArray.length) {
                if (node.folders && node.folders.length > 0) {
                    let a = [];
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
                    EditorService.deploy(objArr[i]);
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
                    EditorService.deploy(obj);
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
            if(vm.deployableObjects[objectType] && data[type]) {
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
            if(isValid && vm.folder.name.lastIndexOf('.') > -1){
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
            if(vm.permission.JobschedulerMaster.administration.configurations.edit) {
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
                            if (result) {
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
                                    arr[i].children[index].children = [{
                                        name: 'Steps/Nodes',
                                        param: 'STEPSNODES'
                                    }, {name: 'Orders', param: 'ORDER'}];
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
            }, function (err) {
                $('[data-toggle="tooltip"]').tooltip();
                console.error(err);
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
                        dest.children[i] = angular.merge(dest.children[i], sour[j]);
                        if(type === 'JOB'){
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
                            }, {name: 'Orders', param: 'ORDER'}];
                        }
                        if(type == 'JOB'){
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

        function updateFolders(path, recursive, cb) {
            if (vm.tree.length > 0) {
                function traverseTree(data, parent) {
                    if (data.folders) {
                        for (let i = 0; i < data.folders.length; i++) {
                            if (data.folders[i].selected1 && cb) {
                                cb({child: data.folders[i], parent: data, superParent: parent});
                            }
                            if (data.folders[i].expanded || recursive) {
                                if (path === data.path) {
                                    updateObjects(data, function () {
                                        if ((vm.path === path) && (vm.type || vm.param)) {
                                            vm.$broadcast('RELOAD', data);
                                        }
                                    });
                                    break;
                                } else {
                                    traverseTree(data.folders[i], data);
                                }
                            }
                        }
                    } else {
                        if (data.children) {
                            for (let i = 0; i < data.children.length; i++) {
                                if (data.children[i].selected1 && cb) {
                                    cb({child: data.children[i], parent: data, superParent: parent});
                                }
                                if (data.children[i].expanded) {
                                    traverseTree(data.children[i], parent);
                                }
                            }
                        }
                    }
                }

                traverseTree(vm.tree[0], null);
            }
        }

        vm.expandNode = function (data) {
            if (!data.children)
                updateObjects(data);
        };

        vm.navFullTree = function(path, type) {
            for (let i = 0; i < vm.tree.length; i++) {
                vm.tree[i].selected1 = false;
                if (vm.tree[i].expanded) {
                    traverseTree1(vm.tree[i], path, type);
                }
            }
        };

        function traverseTree1(data, path, type) {
            if(data.path === path){
                data.expanded = true;
            }
            if (data.folders) {
                for (let i = 0; i < data.folders.length; i++) {
                    if (data.folders[i]) {
                       if(data.folders[i].object === type && data.path === path) {
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
            defaultObjects = ['name', 'deleted', 'deployed', 'selected1', 'children', 'type', 'expanded', 'orderId', 'jobChain','$$hashKey'];

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
            let _path = '';
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
                }, function (err) {
                    console.error(err);
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
            navToJobChainChild('STEPSNODES', 0);
        };

        vm.openOrder = function () {
            navToJobChainChild('ORDER', 1);
        };

        function navToJobChainChild(param, index) {
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

        vm.addObject = function (object, evt) {
            object.expanded = true;
            if (object.object === 'JOB') {
                vm.createNewJob(object.children, 'no', object.parent, evt);
            } else if (object.object === 'JOBCHAIN') {
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

        vm.releaseLock = function (obj) {
            if (obj.lockedBy == vm.username) {
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
                at: 'now',
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
                children: [{name: 'Steps/Nodes', param: 'STEPSNODES'}, {name: 'Orders', param: 'ORDER'}]
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
            if(vm.permission.JobschedulerMaster.administration.configurations.edit) {
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
                    at: 'now',
                    type: 'ORDER'
                };
                obj.orderId = obj.name;
                if (jobChain) {
                    obj.jobChain = jobChain.name;
                    obj.name = obj.jobChain + ',' + obj.name;
                }
                obj.parent = parent;
                if (evt) {
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
                    }).then(function (res) {
                        orders.push(obj);
                    }, function (err) {
                        vm.checkIsFolderLock(err, parent, function (result) {
                            if (result) {
                                vm.storeObject(obj, {}, evt);
                            }
                        });
                    });

                    vm.navFullTree();
                    list.selected1 = true;
                    vm.type = null;
                    vm.param = 'ORDER';
                    vm.getFileObject(obj, obj.path, function () {
                        setTimeout(function () {
                            let _obj = {object: obj, parent: evt.$parentNodeScope.$modelValue};
                            if (evt.$parentNodeScope.$parentNodeScope && evt.$parentNodeScope.$parentNodeScope.$parentNodeScope) {
                                _obj.superParent = evt.$parentNodeScope.$parentNodeScope.$parentNodeScope.$modelValue;
                            }
                            vm.$broadcast('NEW_PARAM', _obj)
                        }, 0);
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
            if (vm.obj) {
                if (vm.obj.type === 'runTime') {
                    vm.$broadcast('RUNTIME', vm.obj);
                } else if (vm.obj.type === 'nodeParameter') {
                    vm.$broadcast('NODE_PARAMETER', vm.obj);
                }
                vm.obj = null;
            }
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
                liveVersion = res.configuration;
                vm.toXML(liveVersion, type, function (xml) {
                    vm.liveXml = EditorService.diff(vm.draftXml, xml);
                });
            });
            vm.toXML(obj, type, function (xml) {
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
                        obj.message = 'JOE1003';
                    }
                    vm.storeObject(obj, obj);
                }, function () {

                });
            });
        };

        vm.storeObject = function (obj, configuration, evt, cb) {
            if (obj && obj.type && vm.permission.JobschedulerMaster.administration.configurations.edit) {
                let _path = '';
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
                    EditorService.store({
                        jobschedulerId: vm.schedulerIds.selected,
                        objectType: obj.type,
                        path: _path,
                        configuration: configuration
                    }).then(function (res) {
                        if (evt) {
                            navToObjectForEdit(obj, evt);
                        }
                        if (cb) {
                            cb()
                        }
                    }, function (err) {
                        vm.checkIsFolderLock(err, obj.path, function (result) {
                            if (result) {
                                EditorService.store({
                                    jobschedulerId: vm.schedulerIds.selected,
                                    objectType: obj.type,
                                    path: _path,
                                    configuration: configuration
                                });
                                if (evt) {
                                    navToObjectForEdit(obj, evt);
                                }
                                if (cb) {
                                    cb()
                                }
                            } else {
                                cb(err);
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
                        object.expaned = false;
                        if (!object.deployed) {
                            object.deleted = true;
                            if (objectType === 'FOLDER' || objectType === 'JOB' || objectType === 'JOBCHAIN')
                                object.expanded = false;
                        }
                    }
                }, function (err) {
                    vm.checkIsFolderLock(err, path, function (result) {
                        if (result) {
                            EditorService.delete({
                                jobschedulerId: vm.schedulerIds.selected,
                                objectType: objectType,
                                path: _path
                            }).then(function () {
                                if (object) {
                                    object.expaned = false;
                                    if (!object.deployed) {
                                        object.deleted = true;
                                        if (objectType === 'FOLDER' || objectType === 'JOB' || objectType === 'JOBCHAIN')
                                            object.expanded = false;
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
                        cb();
                    }
                    vm.overTake = null;
                }, function () {
                    vm.overTake = null;
                    cb();
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
            vm.deleteDraftObject = {name: name || obj.folder};
            let modalInstance = $uibModal.open({
                templateUrl: 'modules/configuration/views/confirmation-dialog.html',
                controller: 'DialogCtrl1',
                scope: vm,
                backdrop: 'static',
            });
            obj.account = vm.username;
            modalInstance.result.then(function () {
                EditorService.deleteDraft(obj).then(function () {

                    if ((vm.type || vm.param)) {
                        if (lastClickedItem && object.path === lastClickedItem.path && object.name === lastClickedItem.name && object.type === lastClickedItem.type) {
                            if (!object.deployed) {
                                vm.type = null;
                                vm.param = null;
                            } else {
                                object.deployed = true;
                                object.changeTemp = true;
                            }
                        } else if (vm.param === 'ORDER' && object.type === 'JOBCHAIN') {
                            vm.$broadcast('RELOAD', object)
                        }
                    }
                }, function (err) {
                    vm.checkIsFolderLock(err, object.path, function (result) {
                        if (result) {
                            EditorService.deleteDraft(obj).then(function () {
                                if ((vm.type || vm.param) && lastClickedItem && object.path === lastClickedItem.path && object.name === lastClickedItem.name && object.type === lastClickedItem.type) {
                                    if (!object.deployed) {
                                        vm.type = null;
                                        vm.param = null;
                                    } else {
                                        object.deployed = true;
                                        object.changeTemp = true;
                                    }
                                }
                            })
                        }
                    });
                });
                vm.deleteDraftObject = null;
            }, function () {
                vm.deleteDraftObject = null;
            })
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
                object.changeTemp = true;
            }, function (err) {
                vm.checkIsFolderLock(err, path, function (result) {
                    if (result) {
                        EditorService.restore({
                            jobschedulerId: vm.schedulerIds.selected,
                            objectType: object.type || 'FOLDER',
                            path: _path
                        }).then(function () {
                            object.deleted = false;
                            object.changeTemp = true;
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
                            form.$setPristine();
                            form.$setUntouched();
                            form.$invalid = false;
                        } else {
                            vm.checkIsFolderLock(err, obj.path, function (result) {
                                if (result) {
                                    vm.renameObject(obj, temp, form);
                                } else {
                                    obj.name = temp.name;
                                    form.$setPristine();
                                    form.$setUntouched();
                                    form.$invalid = false;
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
                            form.$setPristine();
                            form.$setUntouched();
                            form.$invalid = false;
                        } else {
                            vm.checkIsFolderLock(err, obj.path, function (result) {
                                if (result) {
                                    vm.renameObject(obj, temp, form);
                                } else {
                                    obj.orderId = temp.orderId;
                                    obj.name = temp.name;
                                    form.$setPristine();
                                    form.$setUntouched();
                                    form.$invalid = false;
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
                if (lastClickedItem && lastClickedItem.type === obj.type && lastClickedItem.name === obj.name && lastClickedItem.path === obj.path) {
                    let _tempObj = angular.copy(lastClickedItem);
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
                    openXmlModal(_tempObj, obj, _path, isEditable, _tempObj.message, path);
                } else {
                    EditorService.getFile({
                        jobschedulerId: vm.schedulerIds.selected,
                        path: _path,
                        objectType: obj.type,
                    }).then(function (res) {
                        openXmlModal(res.configuration, obj, _path, isEditable, res.objectVersionStatus.message._messageCode, path);
                    }, function (err) {
                        console.error(err);
                    });
                }
            }
        };

        vm.copy = function (obj, evt) {
            vm.tPath = evt.$parentNodeScope.$modelValue.parent;
            vm.copyData = angular.copy(obj);
        };

        vm.paste = function (obj) {
            if (obj.object === vm.copyData.type && obj.parent === vm.tPath) {
                let tName;
                for (let i = 0; i < obj.children.length; i++) {
                    if (obj.children[i].name.match(/(^Copy\([0-9]*\))+/gi)) {
                        tName = angular.copy(obj.children[i].name);
                    }
                }
                if (!tName) {
                    tName = 'copy(1)of_' + vm.copyData.name;
                } else {
                    tName = tName.split('(')[1];
                    tName = tName.split(')')[0];
                    tName = parseInt(tName);
                    tName = 'copy' + '(' + (tName + 1) + ')' + 'of_' + vm.copyData.name;
                }
                let data = angular.copy(vm.copyData);
                vm.getFileObject(data, obj.parent, function (res) {
                    data.name = tName;
                    vm.storeObject(data, res.configuration);
                });
            }
        };

        vm.copyInRightPanel = function (obj, path) {
            vm.tPath = path;
            vm.copyData = angular.copy(obj);
        };

        vm.pasteInRightPanel = function (obj, objType, path, path2) {
            let p = path + path2;
            let tName;
            if (path2 === 'order') {
                if (objType === vm.copyData.type && p === vm.tPath) {
                    for (let i = 0; i < obj.length; i++) {
                        if (obj[i].orderId.match(/(^Copy\([0-9]*\))+/gi)) {
                            tName = angular.copy(obj[i].orderId);
                        }
                    }
                    if (!tName) {
                        parseInt(tName);
                        tName = 'copy(' + (parseInt(vm.copyData.orderId) + 1) + ')of_' + vm.copyData.orderId;
                    } else {
                        tName = tName.split('(')[1];
                        tName = tName.split(')')[0];
                        tName = parseInt(tName);
                        tName = 'copy' + '(' + (tName + 1) + ')' + 'of_' + vm.copyData.orderId;
                    }
                    tName = vm.copyData.jobChain + ',' + tName;
                }
            } else {
                if (objType === vm.copyData.type && p === vm.tPath) {
                    for (let i = 0; i < obj.length; i++) {
                        if (obj[i].name.match(/(^Copy\([0-9]*\))+/gi)) {
                            tName = angular.copy(obj[i].name);
                        }
                    }
                    if (!tName) {
                        tName = 'copy(1)of_' + vm.copyData.name;
                    } else {
                        tName = tName.split('(')[1];
                        tName = tName.split(')')[0];
                        tName = parseInt(tName);
                        tName = 'copy' + '(' + (tName + 1) + ')' + 'of_' + vm.copyData.name;
                    }
                }
            }
            if (tName) {
                let data = angular.copy(vm.copyData);
                vm.getFileObject(data, obj.parent, function (res) {
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
                    isEditable = false;
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
                        }).then(function (res) {
                            refactorJSONObject(obj, vm.objectXml.configuration, message, path);
                            obj.deployed = false;
                        }, function (err) {
                            console.error(err)
                        });
                    }
                }, function () {
                    vm.objectXml = {};
                })
            });
        }

        vm.changeXml = function () {
            if (vm.objectXml.lockedByUser) {
                return;
            }
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
                            account: vm.username
                        };

                        EditorService.deploy(x).then(function () {
                            if (orders[i].deleted) {

                            } else {
                                orders[i].deployed = true;
                            }
                            orders[i].changeTemp = true;
                        });
                    }
                }
            }
        };

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

            if (vm.permission.JobschedulerMaster.administration.configurations.edit && obj.objectName && lastClickedItem && lastClickedItem.name === obj.objectName && (vm.type === lastClickedItem.type || vm.param === lastClickedItem.type)) {
                let _tempObj = angular.copy(lastClickedItem);
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
                let _path = '';
                if (_tempObj.path) {
                    if (_tempObj.path === '/') {
                        _path = _tempObj.path + _tempObj.name;
                    } else {
                        _path = _tempObj.path + '/' + _tempObj.name;
                    }
                }
                EditorService.store({
                    jobschedulerId: vm.schedulerIds.selected,
                    objectType: _tempObj.type,
                    path: _path,
                    configuration: _tempObj
                }).then(function (res) {
                    vm.$broadcast('UPDATE_TEMP', lastClickedItem);
                    deployWithComment(obj, object);
                }, function (err) {
                    vm.checkIsFolderLock(err, _tempObj.path, function (result) {
                        if (result) {
                            EditorService.store({
                                jobschedulerId: vm.schedulerIds.selected,
                                objectType: _tempObj.type,
                                path: _path,
                                configuration: _tempObj
                            }).then(function (res) {
                                deployWithComment(obj, object);
                            });
                        }
                    });
                });
            } else {
                deployWithComment(obj, object);
            }
        };

        function deployWithComment(obj, object) {
            obj.account = vm.username;
            if (vm.userPreferences.auditLog) {
                vm.comments = {};
                vm.comments.radio = 'predefined';
                vm.comments.name = obj.folder + (obj.objectName ? '/' + obj.objectName : '');
                vm.comments.operation = 'Deploy';
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
                    EditorService.deploy(obj).then(function () {
                        if (object.deleted) {
                            if (lastClickedItem && object && lastClickedItem.type === object.type && lastClickedItem.name === object.name && lastClickedItem.path === object.path) {
                                vm.removeSection();
                            }
                        } else {
                            object.deployed = true;
                        }
                        object.changeTemp = true;
                    });
                }, function () {

                });
            } else {
                EditorService.deploy(obj).then(function () {
                    if (object.deleted) {
                        if (lastClickedItem && object && lastClickedItem.type === object.type && lastClickedItem.name === object.name && lastClickedItem.path === object.path) {
                            vm.removeSection();
                        }
                    } else {
                        object.deployed = true;
                    }
                    object.changeTemp = true;
                });
            }
        }

        vm.isSideBarClicked = function (e) {
            e.stopPropagation();
        };

        vm.applyHighlight = function (script) {
            document.querySelectorAll('div.code').forEach((block) => {
                script.content = EditorService.highlight(EditorService.setLanguage(script.language), block.innerText);
            });
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

        $scope.$on('event-started', function () {
            if (vm.events && vm.events[0] && vm.events[0].eventSnapshots) {
                for (let i = 0; i < vm.events[0].eventSnapshots.length; i++) {
                    let path = vm.events[0].eventSnapshots[i].path.substring(0, vm.events[0].eventSnapshots[i].path.lastIndexOf('/') + 1) || '/';
                    if (vm.events[0].eventSnapshots[i].eventType.match(/FileBase/) && !vm.events[0].eventSnapshots[i].eventId && vm.isloaded) {
                        init(vm.events[0].eventSnapshots[i].path, path);
                        break
                    } else if (vm.events[0].eventSnapshots[i].eventType === 'JoeUpdated' && !vm.events[0].eventSnapshots[i].eventId) {
                        if (vm.events[0].eventSnapshots[i].objectType === 'FOLDER') {
                            init(vm.events[0].eventSnapshots[i].path, path);
                        } else {
                            updateFolders(path);
                            updateFolders(vm.events[0].eventSnapshots[i].path);
                        }
                        break;
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
        });
    }

    JobEditorCtrl.$inject = ['$scope', '$uibModal', 'EditorService', '$interval'];

    function JobEditorCtrl($scope, $uibModal, EditorService, $interval) {
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
            vm.isWatcherStop = false;
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
            if (!EditorService.isLastEntryEmpty(vm.job.params.paramList, 'name', 'value')) {
                vm.job.params.paramList.push(param);
            }
        };

        vm.onKeyPress = function($event, type) {
            let key = $event.keyCode || $event.which;
            if (key == '13') {
                if(type === 'env'){
                    vm.addEnvironmentParams();
                }else if(type === 'param') {
                    vm.addParameter();
                }if(type === 'lock'){
                    vm.addLock();
                }else if(type === 'monitor') {
                    vm.addMonitor();
                }else{
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
            if (!EditorService.isLastEntryEmpty(vm.job.environment.variables, 'name', 'value')) {
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
                            vm.setback = {};
                            vm._tempSetback = undefined;
                            break;
                        }
                    }
                } else {
                    if (!vm.job.delayOrderAfterSetbacks) {
                        vm.job.delayOrderAfterSetbacks = [];
                    }
                    if (vm.setback.setbackCount)
                        vm.job.delayOrderAfterSetbacks.push(vm.setback);
                    vm.setback = {};
                }
            }
        };

        vm.editSetback = function (data) {
            vm.setback = angular.copy(data);
            vm._tempSetback = angular.copy(data);
        };

        vm.removeSetback = function (setback) {
            for (let i = 0; i < vm.job.delayOrderAfterSetbacks.length; i++) {
                if (vm.job.delayOrderAfterSetbacks[i].setbackCount === setback.setbackCount && vm.job.delayOrderAfterSetbacks[i].delay === setback.delay) {
                    vm.job.delayOrderAfterSetbacks.splice(i, 1);
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
                    vm.toXML(vm.job.runTime, 'runTime', function (xml) {
                        vm.xml = xml;
                    });
                } else {
                    vm.xml = '<run_time></run_time>'
                }
            }
            vm.isWatcherStop = true;
            vm._tempJob = angular.copy(vm.job);
        };

        vm.closeSidePanel1 = function () {
            vm.closeSidePanel();
            EditorService.clearEmptyData(vm.job);
            EditorService.clearEmptyData(vm._tempJob);
            vm.isWatcherStop = false;
        };

        vm.checkPriority = function (data) {
            if (!data.match(/(\bidle\b|\bbelow\snormal\b|\bnormal\b|\babove\snormal\b|\bhigh\b|^-?[0-1]{0,1}[0-9]{0,1}$|^-?[0-9]{0,1}$|^-?[2]{0,1}[0]{0,1}$|^$)+/g)) {
                vm.job.priority = '';
            }
        };

        let isLoadingCompleted = true;

        function storeObject(isCheck, close) {
            if (!isCheck) {
                vm.closeSidePanel();
            }
            if (vm.job && vm.job.name) {
                if (vm.job.runTime && typeof vm.job.runTime === 'string') {
                    EditorService.toJSON(vm.job.runTime).then(function (res) {
                        vm.job.runTime = res.data;
                        _store(close);
                    });
                } else {
                    _store(close);
                }
                if (!isCheck) {
                    delete vm.job['current'];
                }
            }
        }

        function _store(close) {
            if (vm.job.lockUses && vm.job.lockUses.length === 0) {
                delete vm.job['lockUses'];
            }
            if (vm.job.monitorUses && vm.job.monitorUses.length === 0) {
                delete vm.job['monitorUses'];
            }
            if (vm.job.changeTemp) {
                delete vm.job['changeTemp'];
                vm._tempJob = angular.copy(vm.job);
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

            if (vm.job.isOrderJob === false) {
                vm.job.isOrderJob = 'no';
            } else if (vm.job.isOrderJob === true) {
                vm.job.isOrderJob = 'yes';
            }
            if (vm._tempJob.isOrderJob === false) {
                vm._tempJob.isOrderJob = 'no';
            } else if (vm._tempJob.isOrderJob === true) {
                vm._tempJob.isOrderJob = 'yes';
            }
            if (vm._tempJob.deployed !== vm.job.deployed) {
                vm._tempJob.deployed = angular.copy(vm.job.deployed);
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
                if (!_tempObj.deleted) {
                    vm.storeObject(_tempObj, _tempObj, null, function (result) {
                        if (!close) {
                            if (!result) {
                                vm.extraInfo.storeDate = new Date();
                                vm.job.deployed = false;
                                vm.job.message = 'JOE1003';
                                vm._tempJob = angular.copy(vm.job);
                            } else {
                                let defaultObjects = ['name', 'deleted', 'deployed', 'selected1', 'children', 'type', 'expanded', 'message', 'path','$$hashKey'];
                                for (let propName in vm.job) {
                                    if (typeof propName === 'string' && defaultObjects.indexOf(propName) === -1) {
                                        delete vm.job[propName];
                                    }
                                }
                                vm.job = angular.merge(vm.job, vm._tempJob);
                            }
                        }
                        setTimeout(function () {
                            isLoadingCompleted = true;
                        }, 0)
                    });
                }
            }
        }

        var interval = null;

        function initInterval() {
            if (interval) {
                $interval.cancel(interval);
            }
            interval = $interval(function () {
                if (!vm.isWatcherStop)
                    storeObject(true, false);
            }, 30000);
        }

        vm.$on('RUNTIME', function (evt, obj) {
            vm.xml = null;
            EditorService.toJSON(obj.xml).then(function (res) {
                vm.job.runTime = res.data;
                if (obj.calendars && obj.calendars.length > 0) {
                    vm.job.runTime.calendars = JSON.stringify({calendars: obj.calendars});
                }
            });
        });

        vm.$on('RELOAD', function (evt, job) {
            if (job && job.folders && job.folders.length > 7) {
                vm.jobs = job.folders[0].children || [];
                vm.processClasses = job.folders[3].children || [];
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
            initialDefaultValue();
            vm.checkLockedBy(job.data, job.parent, vm.extraInfo);
            storeObject(false, true);
            initInterval();
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
                vm.locks = job.parent.folders[6].children || [];
                vm.monitors = job.parent.folders[7].children || [];
                detectChanges();
            } else {
                vm.jobs = job.data.children || [];
                vm.job = undefined;
                vm._tempJob = undefined;
            }
            vm.setLastSection(vm.job);
        });

        var watcher1 = null;

        function detectChanges() {
            if (watcher1) {
                watcher1();
            }
            watcher1 = $scope.$watchCollection('job', function (newValues, oldValues) {
                if (newValues && oldValues && newValues !== oldValues && newValues.selected1 === oldValues.selected1 && newValues.expanded === oldValues.expanded && isLoadingCompleted) {
                    if (vm.extraInfo.lockedBy) {
                        storeObject(true, false);
                    }
                }
            });
        }

        $scope.$on('$destroy', function () {
            if (watcher1) {
                watcher1();
            }
            if (interval) {
                $interval.cancel(interval);
            }
            storeObject(false, true);
        });
    }

    JobChainEditorCtrl.$inject = ['$scope', 'EditorService', '$interval'];

    function JobChainEditorCtrl($scope, EditorService, $interval) {
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
                    detectChanges()
                });
            } else {
                vm.createNewJobChain(vm.jobChains);
            }
        };

        vm.createOrder = function () {
            vm.order = {
                name: '1',
            };
        };

        vm.createNode = function () {
            vm.jobChain = {
                name: 'job_chain1',
                ordersRecoverable: true
            };
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
            let _path = '';
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

        vm.$on('NODE_PARAMETER', function (evt) {
            if(vm.permission.JobschedulerMaster.administration.configurations.edit) {
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
                                if (result) {
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
        });

        vm.addParameter = function () {
            let param = {
                name: '',
                value: ''
            };
            if (!EditorService.isLastEntryEmpty(vm.node.params.paramList, 'name', 'value')) {
                vm.node.params.paramList.push(param);
            }
        };

        vm.onKeyPress = function($event, type) {
            let key = $event.keyCode || $event.which;
            if (key == '13') {
                if(type === 'param') {
                    vm.addParameter();
                }
            }
        };

        vm.removeParams = function (index) {
            vm.node.params.paramList.splice(index, 1);
        };

        let isLoadingCompleted = true;

        function storeObject(isCheck, close) {
            if (!isCheck) {
                vm.closeSidePanel();
            }
            if (vm.jobChain && vm.jobChain.name) {
                if (vm.jobChain.changeTemp) {
                    delete vm.jobChain['changeTemp'];
                    vm._tempJobChain = angular.copy(vm.jobChain);
                }
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
                    vm._tempJobChain.deployed = angular.copy(vm.jobChain.deployed);
                }
                if (!angular.equals(angular.toJson(vm._tempJobChain), angular.toJson(vm.jobChain)) && vm._tempJobChain.name === vm.jobChain.name) {
                    isLoadingCompleted = false;
                    if (!vm.extraInfo.lockedSince) {
                        vm.lockObject(vm.jobChain);
                    }
                    if (!vm.jobChain.deleted) {
                        vm.storeObject(vm.jobChain, vm.jobChain, null, function (result) {
                            if (!close) {
                                if (!result) {
                                    vm.extraInfo.storeDate = new Date();
                                    vm.jobChain.message = 'JOE1003';
                                    vm.jobChain.deployed = false;
                                    vm._tempJobChain = angular.copy(vm.jobChain);
                                } else {
                                    let defaultObjects = ['name', 'deleted', 'deployed', 'selected1', 'children', 'type', 'expanded', 'message', 'path','$$hashKey'];
                                    for (let propName in vm.jobChain) {
                                        if (typeof propName === 'string' && defaultObjects.indexOf(propName) === -1) {
                                            delete vm.jobChain[propName];
                                        }
                                    }
                                    vm.jobChain = angular.merge(vm.jobChain, vm._tempJobChain);
                                }
                                setTimeout(function () {
                                    isLoadingCompleted = true;
                                }, 0)
                            }
                        });
                    }
                }
                if (!isCheck) {
                    delete vm.jobChain['current'];
                }
            }
        }

        var interval = null;

        function initInterval() {
            if (interval) {
                $interval.cancel(interval);
            }
            interval = $interval(function () {
                storeObject(true, false);
            }, 30000);
        }

        vm.$on('RELOAD', function (evt, jobChain) {
            if (jobChain && jobChain.folders && jobChain.folders.length > 7) {
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
            vm.extraInfo = {};
            vm.checkLockedBy(jobChain.data, jobChain.parent, vm.extraInfo);
            storeObject(false, true);
            initInterval();
            vm.extraInfo.path = jobChain.data.parent;
            if (jobChain.data.type) {
                vm.jobChain = jobChain.data;
                vm.jobChain.current = true;
                vm.jobChains = jobChain.parent.folders[1].children || [];
                vm.processClasses = jobChain.parent.folders[3].children || [];
                vm.agentClusters = jobChain.parent.folders[4].children || [];
                vm._tempJobChain = angular.copy(vm.jobChain);
                detectChanges();

            } else {
                vm.jobChains = jobChain.data.children || [];
                vm.jobChain = undefined;
                vm._tempJobChain = undefined;
            }
            vm.setLastSection(vm.jobChain);

        });

        var watcher1 = null;

        function detectChanges() {
            if (watcher1) {
                watcher1();
            }
            watcher1 = $scope.$watchCollection('jobChain', function (newValues, oldValues) {
                if (newValues && oldValues && newValues !== oldValues && newValues.selected1 === oldValues.selected1 && newValues.expanded === oldValues.expanded && isLoadingCompleted) {
                    if (vm.extraInfo.lockedBy) {
                        storeObject(true, false);
                    }
                }
            });
        }

        $scope.$on('$destroy', function () {
            if (watcher1) {
                watcher1();
            }
            if (interval) {
                $interval.cancel(interval);
            }
            storeObject(false, true);
        });
    }

    OrderEditorCtrl.$inject = ['$scope', 'EditorService', '$timeout'];

    function OrderEditorCtrl($scope, EditorService, $timeout) {
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
                        vm._order.priority = parseInt(vm._order.priority);
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
                    vm.toXML(vm._order.runTime, 'runTime', function (xml) {
                        vm.xml = xml;
                    });
                } else {
                    vm.xml = '<run_time></run_time>'
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
            }else{
                vm.tempOrderNodeparams = angular.copy(vm.orderNodeparams);
                vm.addNodeParameter();
            }
            vm.isWatcherStop = true;
        };

        vm.closeSidePanel1 = function () {
            vm.isWatcherStop = false;
            vm.closeSidePanel();
            storeObject(true, false);
        };

        vm.$on('RUNTIME', function (evt, obj) {
            vm.xml = null;
            EditorService.toJSON(obj.xml).then(function (res) {
                vm._order.runTime = res.data;
                if (obj.calendars && obj.calendars.length > 0) {
                    vm._order.runTime.calendars = JSON.stringify({calendars: obj.calendars});
                }
            });
        });

        vm.$on('NODE_PARAMETER', function (evt) {
            if (vm.orderNodeparams && vm.permission.JobschedulerMaster.administration.configurations.edit) {
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
                                if (result) {
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
        });

        vm.onKeyPress = function($event, type) {
            let key = $event.keyCode || $event.which;
            if (key == '13') {
                if(type === 'nodeParam'){
                    vm.addNodeParameter();
                }else if(type === 'param') {
                    vm.addParameter();
                }else{
                    vm.addIncludes();
                }
            }
        };

        vm.addParameter = function () {
            let param = {
                name: '',
                value: ''
            };
            if (!EditorService.isLastEntryEmpty(vm._order.params.paramList, 'name', 'value')) {
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
            if(!vm.nodeparams.paramList){
                vm.nodeparams.paramList = [];
            }
            if (!EditorService.isLastEntryEmpty(vm.nodeparams.paramList, 'name', 'value')) {
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
            let _path = '';
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
                            if (result) {
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
            let _path = '';
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
                if (!vm.orderNodeparams.jobChainNode) {
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

        let isLoadingCompleted = true;

        function storeObject(isCheck, close) {
            if (!isCheck) {
                vm.closeSidePanel();
            }

            if (vm._order && vm._order.name) {
                if (vm._order.runTime && typeof vm._order.runTime === 'string') {
                    EditorService.toJSON(vm._order.runTime).then(function (res) {
                        vm._order.runTime = res.data;
                        _store(close);
                    });
                } else {
                    _store(close);
                }
                if (!isCheck) {
                    delete vm._order['current'];
                }
            }
        }

        function _store(close) {
            if (vm._order.changeTemp) {
                delete vm._order['changeTemp'];
                vm._tempOrder = angular.copy(vm._order);
            }
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
                vm._tempOrder.deployed = angular.copy(vm._order.deployed);
            }
            if (!angular.equals(angular.toJson(vm._tempOrder), angular.toJson(vm._order)) && vm._tempOrder.name === vm._order.name) {
                if (!vm.extraInfo.lockedSince) {
                    vm.lockObject(vm._order);
                }
                if (!vm._order.deleted) {
                    vm.storeObject(vm._order, vm._order, null, function (result) {
                        if (!close) {
                            if (!result) {
                                vm.extraInfo.storeDate = new Date();
                                vm._order.message = 'JOE1003';
                                vm._order.deployed = false;
                                vm._tempOrder = angular.copy(vm._order);
                            } else {
                                let defaultObjects = ['name', 'deleted', 'deployed', 'selected1', 'type', 'message', 'path','$$hashKey'];
                                for (let propName in vm._order) {
                                    if (typeof propName === 'string' && defaultObjects.indexOf(propName) === -1) {
                                        delete vm._order[propName];
                                    }
                                }
                                vm._order = angular.merge(vm._order, vm._tempOrder);
                            }
                        }
                    });
                }
            }
        }

        vm.$on('RELOAD', function (evt, order) {
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
            vm.isWatcherStop = false;
            storeObject(false, true);
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
        });

        var watcher1 = null, timeout = null;

        function detectChanges() {
            if (watcher1) {
                watcher1();
            }
            watcher1 = $scope.$watchCollection('_order', function (newValues, oldValues) {
                if (newValues && oldValues && newValues !== oldValues && isLoadingCompleted && !vm.isWatcherStop) {
                    isLoadingCompleted = false;
                    timeout = $timeout(function () {
                        storeObject(true, false);
                        isLoadingCompleted = true;
                    }, 3000);
                }
            });
        }

        $scope.$on('$destroy', function () {
            if (watcher1) {
                watcher1();
            }
            if (timeout) {
                $timeout.cancel(timeout);
            }
            storeObject(false, true);
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
                            if (!result) {
                                vm.processClass.message = 'JOE1003';
                                vm.extraInfo.storeDate = new Date();
                                vm.processClass.deployed = false;
                                vm._tempProcessClass = angular.copy(vm.processClass);
                            } else {
                                let defaultObjects = ['name', 'deleted', 'deployed', 'selected1', 'type', 'expanded', 'message', 'path','$$hashKey'];
                                for (let propName in vm.processClass) {
                                    if (typeof propName === 'string' && defaultObjects.indexOf(propName) === -1) {
                                        delete vm.processClass[propName];
                                    }
                                }
                                vm.processClass = angular.merge(vm.processClass, vm._tempProcessClass);
                            }
                        });
                    }
                }
            }
        }

        vm.update = function(){
            storeObject();
        };

        vm.$on('RELOAD', function (evt, processClass) {
            if (processClass && processClass.folders && processClass.folders.length > 7) {
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
            vm.setLastSection(null);
        });
        $scope.$on('$destroy', function () {
            if(vm.processClass){
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
            if(host.remoteScheduler){
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
                            if (!result) {
                                vm.extraInfo.storeDate = new Date();
                                vm.agentCluster.message = 'JOE1003';
                                vm.agentCluster.deployed = false;
                                vm._tempAgentCluster = angular.copy(vm.agentCluster);
                            } else {
                                let defaultObjects = ['name', 'deleted', 'deployed', 'selected1', 'type', 'expanded', 'message', 'path','$$hashKey'];
                                for (let propName in vm.agentCluster) {
                                    if (typeof propName === 'string' && defaultObjects.indexOf(propName) === -1) {
                                        delete vm.agentCluster[propName];
                                    }
                                }
                                vm.agentCluster = angular.merge(vm.agentCluster, vm._tempAgentCluster);
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
            if (agentCluster && agentCluster.folders && agentCluster.folders.length > 7) {
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
            vm.setLastSection(null);
        });
        $scope.$on('$destroy', function () {
            if (vm.agentCluster) {
                delete vm.agentCluster['current'];
            }
        });
    }

    ScheduleEditorCtrl.$inject = ['$scope', 'EditorService'];

    function ScheduleEditorCtrl($scope, EditorService) {
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
            if(!vm.error.validDate) {
                 storeObject();
            }
        };

        vm.openSidePanel = function () {
            vm.joe = true;
            if (vm.schedule.calendars) {
                let cal = JSON.parse(vm.schedule.calendars);
                vm.calendars = cal ? cal.calendars : null;
            }
            vm.toXML(vm.schedule, 'schedule', function (xml) {
                vm.xml = xml;
            });
            vm.openSidePanelG('runTime');
            vm.substituteObj = {};
            vm._tempSchedule = angular.copy(vm.schedule);
        };

        vm.$on('RUNTIME', function (evt, obj) {
            if(vm.schedule) {
                let tempName =  angular.copy(vm.schedule.name);
                vm.xml = null;
                EditorService.toJSON(obj.xml).then(function (res) {
                    if(tempName === vm.schedule.name) {
                        let defaultObjects = ['name', 'deleted', 'deployed', 'selected1', 'type', 'message', 'path', 'current', '$$hashKey'];
                        for (let propName in vm.schedule) {
                            if (typeof propName === 'string' && defaultObjects.indexOf(propName) === -1) {
                                delete vm.schedule[propName];
                            }
                        }
                        setDates(res.data);
                        vm.schedule = angular.merge(vm.schedule, res.data);
                        if (obj.calendars && obj.calendars.length > 0) {
                            vm.schedule.calendars = JSON.stringify({calendars: obj.calendars});
                        }
                        storeObject();
                    }
                });
            }
        });

        function setDates(data){
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
                        vm.storeObject(vm.schedule, vm.schedule, null, function (result) {
                            if (!result) {
                                vm.extraInfo.storeDate = new Date();
                                vm.schedule.message = 'JOE1003';
                                vm.schedule.deployed = false;
                                vm._tempSchedule = angular.copy(vm.schedule);
                            } else {
                                let defaultObjects = ['name', 'deleted', 'deployed', 'selected1', 'type', 'expanded', 'message', 'path', '$$hashKey'];
                                for (let propName in vm.schedule) {
                                    if (typeof propName === 'string' && defaultObjects.indexOf(propName) === -1) {
                                        delete vm.schedule[propName];
                                    }
                                }
                                vm.schedule = angular.merge(vm.schedule, vm._tempSchedule);
                            }
                        });
                    }
                }
            }
        }

        vm.update = function(){
            storeObject();
        };

        vm.$on('RELOAD', function (evt, schedule) {
            if (schedule && schedule.folders && schedule.folders.length > 7) {
                vm.schedules = schedule.folders[5].children || [];
                vm.checkLockedBy(schedule, null, vm.extraInfo);
            }
        });

        vm.$on('NEW_OBJECT', function (evt, schedule) {
            vm.closeSidePanel();
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
            vm.setLastSection(null);
        });
        $scope.$on('$destroy', function () {
            if (vm.schedule) {
                delete vm.schedule['current'];
            }
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
                            if (!result) {
                                vm.extraInfo.storeDate = new Date();
                                vm.lock.message = 'JOE1003';
                                vm.lock.checkbox = !vm.lock.maxNonExclusive;
                                vm.lock.deployed = false;
                                vm._tempLock = angular.copy(vm.lock);
                            } else {
                                let defaultObjects = ['name', 'deleted', 'deployed', 'selected1', 'type', 'expanded', 'message', 'path', '$$hashKey'];
                                for (let propName in vm.lock) {
                                    if (typeof propName === 'string' && defaultObjects.indexOf(propName) === -1) {
                                        delete vm.lock[propName];
                                    }
                                }
                                vm.lock = angular.merge(vm.lock, vm._tempLock);
                            }

                        });
                    }
                }
            }
        }

        vm.update = function(){
            storeObject();
        };

        vm.$on('RELOAD', function (evt, lock) {
            if (lock && lock.folders && lock.folders.length > 7) {
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
            vm.setLastSection(null);
        });
        $scope.$on('$destroy', function () {
            if (vm.lock) {
                delete vm.lock['current'];
            }
        });
    }

    MonitorEditorCtrl.$inject = ['$scope', 'EditorService', '$interval'];

    function MonitorEditorCtrl($scope, EditorService, $interval) {
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
                    vm.setLastSection(vm.job);
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
            storeObject(true, false);
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
                            if (result) {
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

        function storeObject(isCheck, close) {
            if (vm.job && vm.job.name) {
                if (vm.job.changeTemp) {
                    delete vm.job['changeTemp'];
                    vm._tempJob = angular.copy(vm.job);
                }
                if (vm._tempJob) {
                    if (vm.job["selected"] != undefined) {
                        vm._tempJob["selected"] = angular.copy(vm.job["selected"]);
                    }
                    vm._tempJob["selected1"] = angular.copy(vm.job["selected1"]);
                    vm._tempJob["expanded"] = angular.copy(vm.job["expanded"]);
                    vm._tempJob["children"] = angular.copy(vm.job["children"]);
                }
                if (vm._tempJob.deployed !== vm.job.deployed) {
                    vm._tempJob.deployed = angular.copy(vm.job.deployed);
                }
                if (vm.job.isOrderJob === false) {
                    vm.job.isOrderJob = 'no';
                } else if (vm.job.isOrderJob === true) {
                    vm.job.isOrderJob = 'yes';
                }
                if (vm._tempJob.isOrderJob === false) {
                    vm._tempJob.isOrderJob = 'no';
                } else if (vm._tempJob.isOrderJob === true) {
                    vm._tempJob.isOrderJob = 'yes';
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
                        vm.storeObject(_tempObj, _tempObj, null, function (result) {
                            if (!close) {
                                if (!result) {
                                    vm.extraInfo.storeDate = new Date();
                                    vm.job.message = 'JOE1003';
                                    vm.job.deployed = false;
                                    vm._tempJob = angular.copy(vm.job);
                                } else {
                                    let defaultObjects = ['name', 'deleted', 'deployed', 'selected1', 'type', 'expanded', 'message', 'path', '$$hashKey'];
                                    for (let propName in vm.job) {
                                        if (typeof propName === 'string' && defaultObjects.indexOf(propName) === -1) {
                                            delete vm.job[propName];
                                        }
                                    }
                                    vm.job = angular.merge(vm.job, vm._tempJob);
                                }
                            }
                        });
                    }
                }
            } else {
                if (vm.monitor && vm.monitor.name) {
                    if (vm.monitor.changeTemp) {
                        delete vm.monitor['changeTemp'];
                        vm._tempMonitor = angular.copy(vm.monitor);
                    }
                    if (vm._tempMonitor) {
                        if (vm.monitor["selected"] != undefined) {
                            vm._tempMonitor["selected"] = angular.copy(vm.monitor["selected"]);
                        }
                        vm._tempMonitor["selected1"] = angular.copy(vm.monitor["selected1"]);
                    }
                    if (vm._tempMonitor.deployed !== vm.monitor.deployed) {
                        vm._tempMonitor.deployed = angular.copy(vm.monitor.deployed);
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
                            vm.storeObject(_tempObj, _tempObj, null, function (result) {
                                if (!close) {
                                    if (!result) {
                                        vm.extraInfo.storeDate = new Date();
                                        vm.monitor.message = 'JOE1003';
                                        vm.monitor.deployed = false;
                                        vm._tempMonitor = angular.copy(vm.monitor);
                                    } else {
                                        let defaultObjects = ['name', 'deleted', 'deployed', 'selected1', 'type', 'expanded', 'message', 'path', '$$hashKey'];
                                        for (let propName in vm.monitor) {
                                            if (typeof propName === 'string' && defaultObjects.indexOf(propName) === -1) {
                                                delete vm.monitor[propName];
                                            }
                                        }
                                        vm.monitor = angular.merge(vm.monitor, vm._tempMonitor);
                                    }
                                }
                            });
                        }
                    }
                    if (!isCheck) {
                        delete vm.monitor['current'];
                    }
                }
            }
        }

        var interval = null;

        function initInterval() {
            if (interval) {
                $interval.cancel(interval);
            }
            interval = $interval(function () {
                storeObject(true, false);
            }, 30000);
        }

        vm.$on('RELOAD', function (evt, monitor) {
            if (monitor && monitor.folders && monitor.folders.length > 7) {
                if (vm.monitors)
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
            storeObject(false, true);
            initInterval();
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
            storeObject(false, true);
            initInterval();
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

        $scope.$on('$destroy', function () {
            //call store
            if (interval) {
                $interval.cancel(interval);
            }
            storeObject(false, true);
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

        vm.cancel = function(form){
            vm.code= {};
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
            vm.closeSidePanel();
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
            if (!EditorService.isLastEntryEmpty(vm.code.environment.variables, 'name', 'value')) {
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
                if (!EditorService.isLastEntryEmpty(vm.code.params.paramList, 'name', 'value')) {
                    vm.code.params.paramList.push(param);
                }
            } else {
                if (!EditorService.isLastEntryEmpty(vm.code.params.copyParams, 'name', 'value')) {
                    vm.addCopyParameter();
                }
            }
        };

        vm.removeParams = function (index) {
            vm.code.params.paramList.splice(index, 1);
        };

        vm.onKeyPress = function($event, type) {
            let key = $event.keyCode || $event.which;
            if (key == '13') {
                if(type === 'env'){
                    vm.addEnvironmentParams();
                }else if(type === 'param') {
                    vm.addParameter();
                }else{
                    vm.addIncludes();
                }
            }
        };

        vm.$on('RELOAD', function (evt, job) {
            if (job && job.folders && job.folders.length > 7) {
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
                    vm.storeObject(_tempObj, _tempObj, null, function (result) {
                        if (!result) {
                            vm.job.message = 'JOE1003';
                            vm.extraInfo.storeDate = new Date();
                            vm.job.deployed = false;
                        }
                    });
                }
            }
        }

        vm.getSelectedJobChainData = function () {
            let _path = '';
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
        vm._nextState = ['success', 'error'];
        vm._onError = ['setback', 'suspend'];
        var timer = null, t1 = null;

        function initialDefaultObject() {
            vm.tabActive = 'tab1';
            vm.isToggle = false;
            vm.pageView = 'graph';
            vm.object = {jobs: []};
            vm.activeTabInParameter = 'tab22';
            vm.paramObject = [];
            vm.fileOrderSource = {};
            vm.state = [];
            vm.extraInfo = {};
        }

        vm.changeActiveTab = function (data) {
            vm.tabActive = data;
        };

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
                // Shows an error message if the editor cannot start
                console.error('Cannot start application: ' + e);
                setTimeout(function(){
                    init()
                },100);
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
            if (vm.preferences.theme !== 'light' && vm.preferences.theme !== 'lighter' || !vm.userPreferences.theme) {
                style[mxConstants.STYLE_FONTCOLOR] = '#ffffff';
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
                let className = '';
                if (cell.value.tagName === 'Job') {
                    className = 'vertex-text job';
                } else {
                    className = 'vertex-text order';
                }
                let state = cell.getAttribute('label');
                if (cell.getAttribute('job')) {
                    return '<div data-state="' + state + '" class="' + className + '">' + state + '<br><span data-state="' + state + '" class="text-muted text-sm">' + cell.getAttribute('job') + '</span></div>';
                } else if (cell.getAttribute('missingNode')) {
                    return '<div data-state="' + state + '" class="' + className + '">' + state + '<br><i class="text-danger text-muted text-sm">missing</i></div>';
                }

                if (cell.value.tagName === 'FileOrder') {
                    return '<div class="vertex-text file-order">Folder: ' + cell.getAttribute('directory') + '<br><i class="text-muted text-sm">RegExp: ' + cell.getAttribute('regex') + '</i></div>';
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
                let cell = evt.getProperty('cell'); // cell may be null
                if (cell != null && !vm.stepNode && !vm.isToggle) {
                    setTimeout(function () {
                        if (!vm.stepNode && !vm.isToggle) {
                            openNodeEditor(cell);
                        }
                    }, 100);
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
                            for (let i = 0; i < vm.jobChain.jobChainNodes.length; i++) {
                                if ((vm.jobChain.jobChainNodes[i].state === state.cell.getAttribute('label'))
                                    || (vm.jobChain.jobChainNodes[i].nextState && (vm.jobChain.jobChainNodes[i].nextState === state.cell.getAttribute('label')) && state.cell.getAttribute('missingNode'))
                                    || (vm.jobChain.jobChainNodes[i].errorState && (vm.jobChain.jobChainNodes[i].errorState === state.cell.getAttribute('label')) && state.cell.getAttribute('missingNode'))) {
                                    vm.stepNode = vm.jobChain.jobChainNodes[i];
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
                dragLeave: function (evt, state) {
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

            graph.isValidDropTarget = function (cell, cells, evt) {
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
                for (let i = 0; i < vm.jobChain.jobChainNodes.length; i++) {
                    if (vm.jobChain.jobChainNodes[i].state === cell.getAttribute('label')) {
                        vm.editNode(vm.jobChain.jobChainNodes[i]);
                        let modalInstance = $uibModal.open({
                            templateUrl: 'modules/configuration/views/step-node-dialog.html',
                            controller: 'DialogCtrl1',
                            scope: vm,
                            backdrop: 'static',
                            size: 'lg'
                        });
                        modalInstance.result.then(function () {
                            vm.applyNode();
                            reloadGraph();
                        }, function () {
                            vm.cancelNode();
                        });
                        break;
                    }
                }
            } else if (cell.value.tagName === 'Order') {
                for (let i = 0; i < vm.jobChainOrders.length; i++) {
                    if (vm.jobChainOrders[i].orderId === cell.getAttribute('label')) {
                        vm.isUnique = true;
                        vm.order = angular.copy(vm.jobChainOrders[i]);
                        vm._tempOrder = angular.copy(vm.jobChainOrders[i]);
                        $('#orderModal').modal('show');
                        break;
                    }
                }
            } else {
                for (let i = 0; i < vm.jobChain.fileOrderSources.length; i++) {
                    if (vm.jobChain.fileOrderSources[i].directory === cell.getAttribute('directory')) {
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
            if (target && target.getAttribute('class') === 'dropContainer' && cell) {
                if (cell.value.tagName === 'Job') {
                    for (let i = 0; i < vm.jobChain.jobChainNodes.length; i++) {
                        if (vm.jobChain.jobChainNodes[i].state === cell.getAttribute('label')) {
                            vm.jobChain.jobChainNodes.splice(i, 1);
                            break;
                        }
                    }
                } else if (cell.value.tagName === 'Order') {
                    for (let i = 0; i < vm.jobChainOrders.length; i++) {
                        if (vm.jobChainOrders[i].orderId === cell.getAttribute('label')) {
                            if (vm.orders && vm.orders.length > 0) {
                                for (let j = 0; j < vm.orders.length; j++) {
                                    if (vm.orders[j].name === vm.jobChainOrders[i].name) {
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
                                                if (result) {
                                                    vm.orders[j].deleted = true;
                                                    vm.jobChainOrders.splice(i, 1);
                                                    EditorService.delete({
                                                        jobschedulerId: vm.schedulerIds.selected,
                                                        objectType: 'ORDER',
                                                        path: path
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
                        if (vm.jobChain.fileOrderSources[i].directory === cell.getAttribute('directory')) {
                            vm.jobChain.fileOrderSources.splice(i, 1);
                            break;
                        }
                    }
                }
                reloadGraph();
                storeObject();
            }
            $('#dropContainer2').hide();

        }

        function createWorkflowDiagram(graph, scrollValue, showErrorNode) {
            for (let m = 0; m < vm.jobs.length; m++) {
                vm.jobs[m].isIcon = false;
            }
            if (vm._jobs) {
                for (let m = 0; m < vm._jobs.length; m++) {
                    vm._jobs[m].isIcon = false;
                }
            }
            sortJobChainOrder();

            graph.getModel().beginUpdate();
            let splitRegex = new RegExp('(.+):(.+)');
            try {
                if (vm.jobChain.fileOrderSources) {
                    for (let i = 0; i < vm.jobChain.fileOrderSources.length; i++) {
                        if (vm.jobChain.fileOrderSources[i].directory) {
                            let v1 = createFileOrderVertex(vm.jobChain.fileOrderSources[i], graph);
                            vm.jobChain.fileOrderSources[i].fId = v1.id;
                        }
                    }
                }
                if (vm.jobChain.jobChainNodes) {
                    let missingNodes = new Map();
                    let missingErrorNodes = new Map();
                    for (let i = 0; i < vm.jobChain.jobChainNodes.length; i++) {
                        if (vm.jobChain.jobChainNodes[i].state) {
                            let v1 = createJobVertex(vm.jobChain.jobChainNodes[i], graph);
                            if (vm.jobChain.jobChainNodes[i].isParam) {
                                addOverlays(graph, v1);
                            }
                            if (vm.jobChain.jobChainNodes[i].job && !vm.jobChain.jobChainNodes[i].isNextStateExist && vm.jobChain.jobChainNodes[i].nextState) {
                                let _node = getCellNode('Job', vm.jobChain.jobChainNodes[i].nextState);
                                _node.setAttribute('missingNode', 'true');
                                let style = 'job;strokeColor=#999;fillColor=rgba(255,255,224,0.6)';
                                let m1 = missingNodes.get(vm.jobChain.jobChainNodes[i].nextState);
                                if (!m1) {
                                    m1 = graph.insertVertex(graph.getDefaultParent(), null, _node, 0, 0, 180, 42, style);
                                }
                                missingNodes.set(vm.jobChain.jobChainNodes[i].errorState, m1);
                                graph.insertEdge(graph.getDefaultParent(), null, getCellNode('Connection', '', ''),
                                    v1, m1);
                            }
                            if (vm.jobChain.jobChainNodes[i].job && !vm.jobChain.jobChainNodes[i].isErrorStateExist && vm.jobChain.jobChainNodes[i].errorState) {
                                let _node = getCellNode('Job', vm.jobChain.jobChainNodes[i].errorState);
                                _node.setAttribute('missingNode', 'true');
                                let style = 'job;strokeColor=#999;fillColor=rgba(255,130,128,0.6)';
                                let m1 = missingErrorNodes.get(vm.jobChain.jobChainNodes[i].errorState);
                                if (!m1) {
                                    m1 = graph.insertVertex(graph.getDefaultParent(), null, _node, 0, 0, 180, 42, style);
                                }
                                missingErrorNodes.set(vm.jobChain.jobChainNodes[i].errorState, m1);
                                graph.insertEdge(graph.getDefaultParent(), null, getCellNode('Connection', '', ''),
                                    v1, m1, 'dashed=1;dashPattern=1 2;strokeColor=#dc143c');
                            }

                            vm.jobChain.jobChainNodes[i].jId = v1.id;
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
                        for (let j = 0; j < vm.jobChain.jobChainNodes.length; j++) {
                            if (vm.jobChain.jobChainNodes[i].jId) {
                                if (vm.jobChain.jobChainNodes[i].state !== vm.jobChain.jobChainNodes[j].state && vm.jobChain.jobChainNodes[j].job) {
                                    if (vm.jobChain.jobChainNodes[i].onReturnCodes && vm.jobChain.jobChainNodes[i].onReturnCodes.onReturnCodeList && vm.jobChain.jobChainNodes[i].onReturnCodes.onReturnCodeList.length > 0) {
                                        let rc = vm.jobChain.jobChainNodes[i].onReturnCodes;
                                        if (rc.onReturnCodeList) {
                                            for (let m = 0; m < rc.onReturnCodeList.length; m++) {
                                                if (rc.onReturnCodeList[m].toState && vm.jobChain.jobChainNodes[j].state === rc.onReturnCodeList[m].toState.state) {
                                                    graph.insertEdge(graph.getDefaultParent(), null, getCellNode('Connection', 'exit: ' + rc.onReturnCodeList[m].returnCode, ''),
                                                        graph.getModel().getCell(vm.jobChain.jobChainNodes[i].jId), graph.getModel().getCell(vm.jobChain.jobChainNodes[j].jId), 'dashed=1;dashPattern=1 2;');
                                                }
                                            }
                                        }
                                    }
                                }
                                if (vm.jobChain.jobChainNodes[j].state && splitRegex.test(vm.jobChain.jobChainNodes[j].state) && vm.jobChain.jobChainNodes[i].state !== vm.jobChain.jobChainNodes[j].state) {
                                    let arr = splitRegex.exec(vm.jobChain.jobChainNodes[j].state);
                                    if (vm.jobChain.jobChainNodes[i].state == arr[1]) {
                                        graph.insertEdge(graph.getDefaultParent(), null, getCellNode('Connection', '', ''),
                                            graph.getModel().getCell(vm.jobChain.jobChainNodes[i].jId), graph.getModel().getCell(vm.jobChain.jobChainNodes[j].jId));
                                    }
                                }
                                if (vm.jobChain.jobChainNodes[j].nextState && vm.jobChain.jobChainNodes[i].state === vm.jobChain.jobChainNodes[j].nextState) {
                                    graph.insertEdge(graph.getDefaultParent(), null, getCellNode('Connection', '', ''),
                                        graph.getModel().getCell(vm.jobChain.jobChainNodes[j].jId), graph.getModel().getCell(vm.jobChain.jobChainNodes[i].jId));
                                }
                                if (vm.jobChain.jobChainNodes[i].errorState && vm.jobChain.jobChainNodes[i].errorState === vm.jobChain.jobChainNodes[j].state) {
                                    if (showErrorNode) {
                                        graph.insertEdge(graph.getDefaultParent(), null, getCellNode('Connection', '', ''),
                                            graph.getModel().getCell(vm.jobChain.jobChainNodes[i].jId), graph.getModel().getCell(vm.jobChain.jobChainNodes[j].jId), 'dashed=1;dashPattern=1 2;strokeColor=#dc143c');
                                    } else {
                                        graph.removeCells([graph.getModel().getCell(vm.jobChain.jobChainNodes[j].jId)]);
                                        vm.jobChain.jobChainNodes[j].jId = null;
                                    }
                                }
                            }
                        }
                    }
                }
                if (vm.jobChainOrders && vm.jobChainOrders.length > 0 && vm.jobChain.jobChainNodes.length > 0) {
                    for (let i = 0; i < vm.jobChainOrders.length; i++) {
                        if (vm.jobChainOrders[i].orderId && !vm.jobChainOrders[i].deleted) {
                            let o1 = createOrderVertex(vm.jobChainOrders[i].orderId, graph);
                            graph.insertEdge(graph.getDefaultParent(), null, getCellNode('Connection', '', ''),
                                o1, graph.getModel().getCell(vm.jobChain.jobChainNodes[0].jId), 'dashed=1;');

                        }
                    }
                }
            } catch (e) {
                console.error(e)
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
                $('[data-toggle="tooltip"]').tooltip();
                vm.actual();
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
                let obj = {
                    state: vm.userPreferences.automaticStateName ? '100' : job.substring(job.lastIndexOf('/') + 1),
                    job: job,
                    nextState: 'success',
                    errorState: 'error'
                };
                let obj2 = {state: 'success'};
                let obj3 = {state: 'error'};
                vm.jobChain.jobChainNodes.push(obj);
                vm.jobChain.jobChainNodes.push(obj2);
                vm.jobChain.jobChainNodes.push(obj3);
                flag = true;

            } else {
                let obj = null;
                let s_name = vm.userPreferences.automaticStateName ? '100' : job.substring(job.lastIndexOf('/') + 1);
                if (onJob) {
                    let textArr = onJob.dataset ? onJob.dataset.state : onJob.innerHTML.split('<br>')[0];
                    for (let i = 0; i < vm.jobChain.jobChainNodes.length; i++) {
                        if (vm.jobChain.jobChainNodes[i].state === textArr) {
                            obj = {
                                state: vm.userPreferences.automaticStateName ? getStateNumber(s_name) : getStateName(s_name),
                                job: job,
                                nextState: vm.jobChain.jobChainNodes[i].nextState,
                                errorState: vm.jobChain.jobChainNodes[i].errorState
                            };
                            vm.jobChain.jobChainNodes[i].nextState = obj.state;
                        }
                    }
                } else {
                    let isFind = false;
                    for (let i = 0; i < vm.jobChain.jobChainNodes.length; i++) {
                        if (vm.jobChain.jobChainNodes[i].nextState && vm.jobChain.jobChainNodes[i].nextState.toLowerCase() === 'success') {
                            obj = {
                                state: vm.userPreferences.automaticStateName ? getStateNumber(s_name) : getStateName(s_name),
                                job: job,
                                nextState: vm.jobChain.jobChainNodes[i].nextState,
                                errorState: vm.jobChain.jobChainNodes[i].errorState
                            };
                            vm.jobChain.jobChainNodes[i].nextState = obj.state;
                            isFind = true;
                            break;
                        }
                    }
                    if (!isFind) {
                        for (let i = vm.jobChain.jobChainNodes.length - 1; i >= 0; i--) {

                            if (vm.jobChain.jobChainNodes[i].job) {
                                obj = {
                                    state: vm.userPreferences.automaticStateName ? getStateNumber(s_name) : getStateName(s_name),
                                    job: job,
                                    nextState: vm.jobChain.jobChainNodes[i].nextState,
                                    errorState: vm.jobChain.jobChainNodes[i].errorState
                                };
                                vm.jobChain.jobChainNodes[i].nextState = obj.state;
                                break;
                            }
                        }

                    }
                }
                if (obj) {
                    if (obj.state == obj.nextState) {
                        obj.nextState = 'success';
                    }
                    vm.jobChain.jobChainNodes.push(obj);
                    flag = true;
                }
            }
            if (flag) {
                sortJobChainOrder();
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
        function getCellNode(name, label, job) {
            const doc = mxUtils.createXmlDocument();
            // Create new node object
            const _node = doc.createElement(name);
            if (label)
                _node.setAttribute('label', label.trim());
            if (job)
                _node.setAttribute('job', job);
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
            let _node = getCellNode('Job', job.state, job.job);
            let style = 'job;strokeColor=#999';
            if (!job.job) {
                let eColor = '#fce3e8', sColor = '#e5ffe5';
                if (vm.preferences.theme !== 'light' && vm.preferences.theme !== 'lighter' || !vm.userPreferences.theme) {
                    eColor = 'rgba(255,130,128,0.7)';
                    sColor = 'rgba(133,255,168,0.7)';
                }
                style += ';fillColor=' + (job.state.toLowerCase() === 'error' ? eColor : sColor)
            }
            return graph.insertVertex(graph.getDefaultParent(), null, _node, 0, 0, 180, 42, style)
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

            }
            vm.cancelNode();
            storeObject();
        };

        vm.editNode = function (node, sink) {
            vm.isUnique = true;
            vm.node = angular.copy(node);
            if (sink) {
                vm.node.nodeType = 'File Sink';
            } else {
                vm.node.nodeType = node.job ? 'Full Node' : 'End Node';
            }
            vm._tempNode = angular.copy(node);
        };

        vm.applyNode = function (form) {
            if (!vm.node.state) {
                return;
            }
            if (vm._tempNode) {
                let flag = false;
                for (let i = 0; i < vm.jobChain.jobChainNodes.length; i++) {
                    if (vm.jobChain.jobChainNodes[i].state === vm._tempNode.state) {
                        if (vm.node.nodeType === 'Full Node') {
                            vm.jobChain.jobChainNodes[i] = {
                                state: vm.node.state,
                                job: vm.node.job,
                                nextState: vm.node.nextState,
                                errorState: vm.node.errorState,
                                delay: vm.node.delay,
                                onError: vm.node.onError,
                                onReturnCodes: vm.node.onReturnCodes
                            };
                        } else if (vm.node.nodeType === 'End Node') {
                            vm.jobChain.jobChainNodes[i] = {state: vm.node.state};
                        } else {
                            vm.jobChain.jobChainNodes.splice(i, 1);
                        }
                        flag = true;
                        break;
                    }
                }
                if (!flag) {
                    if (vm.node.nodeType === 'Full Node') {
                        vm.jobChain.jobChainNodes.push({
                            state: vm.node.state,
                            job: vm.node.job,
                            nextState: vm.node.nextState,
                            errorState: vm.node.errorState,
                            delay: vm.node.delay,
                            onError: vm.node.onError,
                            onReturnCodes: vm.node.onReturnCodes
                        });
                    } else if (vm.node.nodeType === 'End Node') {
                        vm.jobChain.jobChainNodes.push({state: vm.node.state});
                    }
                }

                if (vm.node.nodeType === 'File Sink') {
                    let flg = false;
                    if (!vm.jobChain.fileOrderSinks) {
                        vm.jobChain.fileOrderSinks = [];
                    } else {
                        for (let i = 0; i < vm.jobChain.fileOrderSinks.length; i++) {
                            if (vm.jobChain.fileOrderSinks[i].state === vm._tempNode.state) {
                                vm.jobChain.fileOrderSinks[i] = {
                                    state: vm.node.state,
                                    moveTo: vm.node.moveTo,
                                    remove: vm.node.remove,
                                    delay: vm.node.delay
                                };
                                flg = true;
                                break
                            }
                        }
                    }
                    if (!flg) {
                        vm.jobChain.fileOrderSinks.push({
                            state: vm.node.state,
                            moveTo: vm.node.moveTo,
                            remove: vm.node.remove,
                            delay: vm.node.delay
                        });
                    }
                } else {
                    for (let i = 0; i < vm.jobChain.fileOrderSinks.length; i++) {
                        if (vm.jobChain.fileOrderSinks[i].state === vm._tempNode.state) {
                            vm.jobChain.fileOrderSinks.splice(i, 1);
                            break;
                        }
                    }
                }
            } else {
                if (vm.node.nodeType === 'Full Node') {
                    vm.jobChain.jobChainNodes.push({
                        state: vm.node.state,
                        job: vm.node.job,
                        onError: vm.node.onError,
                        nextState: vm.node.nextState,
                        errorState: vm.node.errorState,
                        onReturnCodes: vm.node.onReturnCodes,
                        delay: vm.node.delay
                    });
                } else if (vm.node.nodeType === 'End Node') {
                    vm.jobChain.jobChainNodes.push({state: vm.node.state});
                } else {
                    if (!vm.jobChain.fileOrderSinks) {
                        vm.jobChain.fileOrderSinks = [];
                    }
                    vm.jobChain.fileOrderSinks.push({
                        state: vm.node.state,
                        moveTo: vm.node.moveTo,
                        remove: vm.node.remove,
                        delay: vm.node.delay
                    });
                }

            }

            vm.cancelNode(form);
            sortJobChainOrder();
            storeObject();
        };

        function sortJobChainOrder() {
            if (vm.jobChain && !vm.jobChain.jobChainNodes) {
                vm.jobChain.jobChainNodes = [];
            }
            let sortedNodes = [];
            let x = [];
            vm._nextState = ['success', 'error'];
            for (let i = 0; i < vm.jobChain.jobChainNodes.length; i++) {
                vm.jobChain.jobChainNodes[i].isNextStateExist = false;
                vm.jobChain.jobChainNodes[i].isErrorStateExist = false;
                if (vm._nextState.indexOf(vm.jobChain.jobChainNodes[i].state) === -1) {
                    vm._nextState.push(vm.jobChain.jobChainNodes[i].state);
                }


                if (vm.orderNodeparams && vm.orderNodeparams.jobChainNodes) {
                    for (let j = 0; j < vm.orderNodeparams.jobChainNodes.length; j++) {
                        if (vm.orderNodeparams.jobChainNodes[j].state === vm.jobChain.jobChainNodes[i].state) {
                            vm.jobChain.jobChainNodes[i].isParam = true;
                            break;
                        }
                    }
                }
                if (vm.jobChain.jobChainNodes[i].job) {
                    let flag = false;
                    for (let j = 0; j < vm.jobChain.jobChainNodes.length; j++) {
                        if (vm.jobChain.jobChainNodes[i].state !== vm.jobChain.jobChainNodes[j].state) {
                            if (vm.jobChain.jobChainNodes[i].job) {
                                if (vm.jobChain.jobChainNodes[i].state === vm.jobChain.jobChainNodes[j].nextState) {
                                    flag = true;
                                    sortedNodes.push(vm.jobChain.jobChainNodes[i]);
                                }
                                if (vm.jobChain.jobChainNodes[i].nextState && (vm.jobChain.jobChainNodes[i].nextState === vm.jobChain.jobChainNodes[j].state)) {
                                    vm.jobChain.jobChainNodes[i].isNextStateExist = true;
                                }
                                if (vm.jobChain.jobChainNodes[i].errorState && (vm.jobChain.jobChainNodes[i].errorState === vm.jobChain.jobChainNodes[j].state)) {
                                    vm.jobChain.jobChainNodes[i].isErrorStateExist = true;
                                }
                            }
                        }
                    }
                    if (!flag) {
                        x.push(vm.jobChain.jobChainNodes[i])
                    }
                }
            }
            if (x.length > 0) {
                let arr = [];
                if (sortedNodes.length > 0) {
                    let count = {num: sortedNodes.length};
                    arr = recursiveSort(x, sortedNodes, count);
                } else {
                    arr = x;
                }
                if (sortedNodes.length > 0) {
                    for (let i = 0; i < sortedNodes.length; i++) {
                        let isPush = true;
                        for (let j = 0; j < arr.length; j++) {
                            if (sortedNodes[i].state === arr[j].state) {
                                isPush = false;
                                break;
                            }
                        }
                        if (isPush) {
                            arr.push(sortedNodes[i]);
                        }
                    }
                }
                sortedNodes = arr;
            }
            vm.jobChain.jobChainNodes.forEach(function (item) {
                if (!item.job) {
                    sortedNodes.push(item);
                }
            });

            sortedNodes = _.uniqBy(sortedNodes, 'state');

            vm.jobChain.jobChainNodes = sortedNodes;
        }

        function recursiveSort(arr1, arr2, obj){
            ++obj.num;
            let arr = [];
            for (let i = 0; i < arr1.length; i++) {
                arr.push(arr1[i]);
                for (let j = 0; j < arr2.length; j++) {
                    if (arr1[i].nextState === arr2[j].state) {
                        arr.push(arr2[j]);
                        arr2.splice(j,1);
                        break;
                    }
                }
            }
            if(arr2.length > 0 && obj.num < vm.jobChain.jobChainNodes.length){
                arr = recursiveSort(arr,  arr2, obj);
            }
            return arr;
        }

        vm.addMissingNode = function (stepNode) {
            let node = angular.copy(vm.node);
            if(stepNode){
                node = stepNode;
            }
            if (node.nextState) {
                if (vm.jobChain.jobChainNodes.filter(function (x) {
                    return x.state === node.nextState
                }).length === 0) {
                    vm.jobChain.jobChainNodes.push({
                        state: node.nextState,
                        node: 'End Node',
                    });
                }
            }
            if (node.errorState) {
                if (vm.jobChain.jobChainNodes.filter(function (x) {
                    return x.state === node.errorState
                }).length === 0) {
                    vm.jobChain.jobChainNodes.push({
                        state: node.errorState,
                        node: 'End Node',
                    });
                }
            }

            sortJobChainOrder();
            storeObject();
            vm.cancelNode();
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

        vm.removeFileOrder = function (node) {
            for (let i = 0; i < vm.jobChain.fileOrderSources.length; i++) {
                if (vm.jobChain.fileOrderSources[i].directory === node.directory) {
                    vm.jobChain.fileOrderSources.splice(i, 1);
                    storeObject();
                    break;
                }
            }
        };

        vm.editFileOrder = function (node) {
            vm.fileOrderSource = angular.copy(node);
            vm._tempFileOrder = angular.copy(node);
        };

        vm.applyFileOrder = function (form) {
            if (!vm.jobChain.fileOrderSources) {
                vm.jobChain.fileOrderSources = [];
            }
            if (!vm.fileOrderSource.directory) {
                return;
            }
            if (vm._tempFileOrder) {
                for (let i = 0; i < vm.jobChain.fileOrderSources.length; i++) {
                    if (angular.equals(angular.toJson(vm.jobChain.fileOrderSources[i]), angular.toJson(vm._tempFileOrder))) {
                        vm.jobChain.fileOrderSources[i] = {
                            directory: vm.fileOrderSource.directory,
                            regex: vm.fileOrderSource.regex,
                            delayAfterError: vm.fileOrderSource.delayAfterError,
                            repeat: vm.fileOrderSource.repeat,
                            nextState: vm.fileOrderSource.nextState,
                            alertWhenDirectoryMissing: vm.fileOrderSource.alertWhenDirectoryMissing
                        };

                        break;
                    }
                }
            } else {
                if (vm.fileOrderSource && vm.fileOrderSource.directory)
                    vm.jobChain.fileOrderSources.push({
                        directory: vm.fileOrderSource.directory,
                        regex: vm.fileOrderSource.regex,
                        delayAfterError: vm.fileOrderSource.delayAfterError,
                        repeat: vm.fileOrderSource.repeat,
                        nextState: vm.fileOrderSource.nextState,
                        alertWhenDirectoryMissing: vm.fileOrderSource.alertWhenDirectoryMissing
                    });
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
            vm.isUnique = true;
            vm.order = {jobChain: vm.jobChain.name, orderId: ''};
            $('#orderModal').modal('show');
        }

        vm.checkOrderId = function () {
            vm.isUnique = true;
            angular.forEach(vm.jobChainOrders, function (value) {
                if (vm.order.orderId === value.orderId && (vm._tempOrder && vm._tempOrder.orderId !== vm.order.orderId)) {
                    vm.isUnique = false;
                }
            })
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
            if (!vm._tempOrder) {
                vm.order.type = 'ORDER';
                vm.order.name = vm.order.jobChain + ',' + vm.order.orderId;
                vm.storeObject(vm.order, vm.order, null, function (result) {
                    if (!result) {
                        vm.jobChainOrders.push(angular.copy(vm.order));
                        vm.orders.push(angular.copy(vm.order));
                        reloadGraph();
                    }
                    vm.order = {};
                });
            } else {
                for (let i = 0; i < vm.jobChainOrders.length; i++) {
                    if (angular.equals(vm.jobChainOrders[i], vm._tempOrder)) {
                        vm.jobChainOrders[i] = angular.merge(vm.jobChainOrders[i], vm.order);
                        break;
                    }
                }
            }
            vm.closeModel(form);
        };

        function addFileOrderToWorkflow() {
            vm.orderSource = {};
            $('#fileOrderModal').modal('show');
        }

        vm.onAddFileOrder = function (form) {
            if (!vm._tempOrderSource) {
                if (!vm.jobChain.fileOrderSources) {
                    vm.jobChain.fileOrderSources = [];
                }
                vm.jobChain.fileOrderSources.push(angular.copy(vm.orderSource));
                vm.orderSource = {};

            } else {
                for (let i = 0; i < vm.jobChain.fileOrderSources.length; i++) {
                    if (angular.equals(vm.jobChain.fileOrderSources[i], vm._tempOrderSource)) {
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

        vm.openSidePanel = function (title) {
            vm.openSidePanelG(title);
            if (title === 'nodeParameter') {
                vm.jobChainNodes = [];
                if (vm.orderNodeparams) {
                    if (vm.orderNodeparams.jobChainNodes) {
                        vm.jobChainNodes = vm.orderNodeparams.jobChainNodes || [];
                    }
                    if (vm.orderNodeparams.params) {
                        vm._nodeParams = vm.orderNodeparams.params;
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
                if (!vm.node.onReturnCodes) {
                    vm.node.onReturnCodes = {onReturnCodeList: []};
                    vm.addOrder = false;
                    vm.addReturnCode();
                }
                vm._tempRc = angular.copy(vm.node);
            }
        };

        vm.closeSidePanel1 = function () {
            vm.closeSidePanel();
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
                storeObject(vm.node);
                if (vm.pageView === 'graph') {
                    reloadGraph();
                }
            }
        };

        function getNodeParams() {
            let _path = '';
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
                    vm.orderNodeparams = res.configuration.jobChain.order;
                }
                if (!vm.orderNodeparams) {
                    vm.orderNodeparams = {params: {}};
                }
            });
        }


        vm.$on('NODE_PARAMETER', function (evt) {
            if (vm.jobChain && vm.jobChain.name && vm.jobChain.path && vm.permission.JobschedulerMaster.administration.configurations.edit) {
                let _path = '';
                if (vm.jobChain.path === '/') {
                    _path = vm.jobChain.path + vm.jobChain.name;
                } else {
                    _path = vm.jobChain.path + '/' + vm.jobChain.name;
                }
                EditorService.clearEmptyData(vm.jobChainNode);
                if (vm._tempJobChainNode)
                    EditorService.clearEmptyData(vm._tempJobChainNode);
                if (vm._tempJobChainNode && !angular.equals(vm._tempJobChainNode, vm.jobChainNode)) {
                    vm._tempJobChainNode = null;
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

                    }, function (err) {
                        vm.checkIsFolderLock(err, vm.jobChain.path, function (result) {
                            if (result) {
                                EditorService.store(obj)
                            }
                        });
                    })
                }
            }
        });

        vm.addParameter = function () {
            let param = {
                name: '',
                value: ''
            };
            if (!EditorService.isLastEntryEmpty(vm.jobChainNode.params.paramList, 'name', 'value')) {
                vm.jobChainNode.params.paramList.push(param);
            }
        };

        vm.removeParams = function (index) {
            vm.jobChainNode.params.paramList.splice(index, 1);
        };

        vm.changeActiveParameterTab = function (data) {
            vm.activeTabInParameter = data;
            vm.state = [];
        };

        vm.addReturnCode = function () {
            vm.addState = true;
            let returnCode = {returnCode: '', toState: {state: ''}};
            vm.state.push(returnCode);
        };

        vm.editState = function (data, index) {
            vm.state = [];
            vm.isEdit = true;
            vm.addState = true;
            let returnCode = {returnCode: data.returnCode, toState: {state: data.toState.state}, index: index};
            vm.state.push(returnCode);
        };

        vm.applyState = function () {
            vm.addState = false;
            let flag;
            if (vm.node.onReturnCodes.onReturnCodeList.length > 0) {
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
                vm.node.onReturnCodes.onReturnCodeList = vm.state;
            }

            vm.state = [];
            updateNode();
        };

        vm.disableApplyButton = function () {
            for (let i = 0; i < vm.state.length; i++) {
                if (vm.state[i].returnCode === '' || vm.state[i].toState.state === '') {
                    return 'true';
                }
            }
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

        vm.cancelState = function () {
            vm.state = [];
            vm.addState = false;
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
            vm.paramObject.push({name: '', value: ''});
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
                if (ui.item.sortable.model && !ui.item.sortable.model.job) {
                    ui.item.sortable.cancel();
                }
            },update: function(e, ui) {
                if (ui.item.sortable.model && ui.item.sortable.model.job) {
                    isSort = true;
                }
            },
            stop: function (e, ui) {
                if(isSort) {
                    for (let i = 0; i < vm.jobChain.jobChainNodes.length; i++) {
                        if (vm.jobChain.jobChainNodes[i].job && ((i + 1) < vm.jobChain.jobChainNodes.length)) {
                            vm.jobChain.jobChainNodes[i].nextState = angular.copy(vm.jobChain.jobChainNodes[i + 1].state);
                        }
                    }
                    storeObject();
                }
            }
        };

        function updateNode() {
            for (let i = 0; i < vm.jobChain.jobChainNodes.length; i++) {
                if (angular.equals(angular.toJson(vm.jobChain.jobChainNodes[i]), angular.toJson(vm._tempNode))) {
                    vm.jobChain.jobChainNodes[i] = vm.node;
                    break;
                }
            }
        }

        const watcher1 = $scope.$watch('pageView', function (newName, oldName) {
            vm.isUnique = true;
            if (newName && oldName && newName !== oldName && vm.editor) {
                vm.editor.graph.removeCells(vm.editor.graph.getChildVertices(vm.editor.graph.getDefaultParent()));
                createWorkflowDiagram(vm.editor.graph, null, vm.joeConfigFilters.jobChain.showError);
                vm.cancelNode();
                vm.cancelFileOrder();
            }
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
                            vm.jobChain.deployed = false;
                        }
                    });
                }
            }
        }

        vm.$on('RELOAD', function (evt, jobChain) {
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
            sortJobChainOrder();
            reloadGraph();
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
            } else {
                createWorkflowDiagram(vm.editor.graph, null, vm.joeConfigFilters.jobChain.showError);
            }
            vm.node = {nodeType: 'Full Node'};
        });

        $scope.$on('$destroy', function () {
            //call store
            if (t1) {
                $timeout.cancel(t1);
            }
            if (timer) {
                $timeout.cancel(timer);
            }
            watcher1();
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

    XMLEditorCtrl.$inject = ['$scope', 'SOSAuth', 'CoreService', 'AuditLogService', '$location', '$http', '$uibModal', 'gettextCatalog', 'toasty', 'FileUploader', 'EditorService', '$interval'];

    function XMLEditorCtrl($scope, SOSAuth, CoreService, AuditLogService, $location, $http, $uibModal, gettextCatalog, toasty, FileUploader, EditorService, $interval) {
        const vm = $scope;

        vm.counting = 0;
        vm.autoAddCount = 0;
        vm.nodes = [];
        vm.childNode = [];
        vm.showAllChild = [];
        vm.selectedXsd = '';
        vm.submitXsd = false;
        vm.isLoading = true;
        vm.fileLoading = false;
        vm.showSelectSchema = false;

        vm.treeOptions = {
            beforeDrop: function (e) {
                let sourceValue = e.source.nodeScope.$modelValue,
                    destValue = e.dest.nodesScope.node ? e.dest.nodesScope.node : undefined;
                return dragAnddropRules(sourceValue, destValue);
            }
        };

        const uploader = $scope.uploader = new FileUploader({
            url: '',
            alias: 'file'
        });

        // CALLBACKS
        uploader.onAfterAddingFile = function (item) {
            let fileExt = item.file.name.slice(item.file.name.lastIndexOf('.') + 1).toUpperCase();
            if (fileExt != 'XML') {
                toasty.error({
                    title: gettextCatalog.getString('message.invalidFileExtension'),
                    timeout: 10000
                });
                item.remove();
            } else {
                vm.fileLoading = true;
                let reader = new FileReader();
                reader.readAsText(item._file, 'UTF-8');
                reader.onload = onLoadFile;
            }
        };


        const interval = $interval(function () {
            if (vm.submitXsd) {
                storeXML();
            }
        }, 30000);
        $scope.$on('$destroy', function () {
            //call store
            $interval.cancel(interval);
            if (vm.submitXsd) {
                storeXML();
            }
        });

        function compare(str1, str2) {
            let a = str1.replace(/\s/g, '');
            let b = str2.replace(/\s/g, '');
            return angular.equals(a, b);
        }

        function storeXML() {
            vm._xml = _showXml();
            if(!vm._xml){
                return;
            }
            let eRes;
            if (vm.prevXML && vm._xml) {
                eRes = compare(vm.prevXML.toString(), vm._xml.toString());
            }
            if (!eRes && vm.objectType !== 'OTHER') {
                EditorService.storeXML({
                    jobschedulerId: vm.schedulerIds.selected,
                    objectType: vm.objectType,
                    configuration: vm._xml
                }).then(function (res) {
                    vm.isDeploy = false;
                    vm.XSDState = Object.assign({}, {message: res.message});
                    vm.XSDState.modified = res.modified;
                    vm.prevXML = vm._xml;
                    hideButtons();
                }, function (err) {
                    toasty.error({
                        msg: error.data.error.message,
                        clickToClose: true
                    });
                });
            } else if(!eRes){
                EditorService.storeXML({
                    jobschedulerId: vm.schedulerIds.selected,
                    objectType: vm.objectType,
                    configuration: vm._xml,
                    id: vm.activeTab.id,
                    name: vm.activeTab.name,
                    schema: vm.path
                }).then(function (res) {
                    vm.isDeploy = false;
                    vm.XSDState = Object.assign({}, {message: res.message});
                    vm.XSDState.modified = res.modified;
                    vm.prevXML = vm._xml;
                    vm.activeTab.id = res.id;
                    hideButtons();
                }, function (err) {
                    toasty.error({
                        msg: error.data.error.message,
                        clickToClose: true
                    });
                });
            }
        }

        function onLoadFile(event) {
            vm.uploadData = event.target.result;
            if (vm.uploadData !== undefined && vm.uploadData !== '') {
            } else {
                toasty.error({
                    title: gettextCatalog.getString('Invalid xml file or file must be empty'),
                    timeout: 10000
                });
            }
        }

        vm.collapseAll = function () {
            vm.$broadcast('angular-ui-tree:collapse-all');
        };

        vm.expandAll = function () {
            vm.$broadcast('angular-ui-tree:expand-all');
        };

        vm.reassignSchema = function () {
            vm.nodes = [];
            vm.isLoading = true;
            EditorService.getXSD(vm.path).then(function (data) {
                loadTree(data.data, true);
            }, function (err) {
                vm.submitXsd = false;
                vm.isLoading = false;
                vm.XSDState = '';
                vm.error = err;
                hideButtons();
            });
        };

        function removeComment(data) {
            return data.replace(/\<\!\-\-((?!\-\-\>)[\s\S])*\-\-\>\s*/g, '');
        }

        function ngOnInit() {
            EditorService.readXML({
                jobschedulerId: vm.schedulerIds.selected,
                "objectType": vm.objectType
            }).then(function (res) {
                vm.path = res.schema;
                if (res.configuration) {
                    if (!ok(res.configuration)) {
                        vm.nodes = [];
                        vm.isLoading = true;
                        vm.XSDState = res.state;
                        vm.submitXsd = true;
                        vm.isDeploy = res.state.deployed;
                        vm.XSDState.modified = res.modified;
                        let tXml = removeComment(res.configuration);
                        vm.prevXML = tXml;
                        EditorService.getXSD(vm.path).then(function (data) {
                            loadTree(data.data, true);
                        });
                        setTimeout(function () {
                            createJSONFromXML(res.configuration);
                            if (res.state.deployed) {
                                $scope.changeValidConfigStatus(true);
                            }
                        }, 600);
                        hideButtons();
                    } else {
                        vm.submitXsd = false;
                        vm.isLoading = false;
                        vm.XSDState = res.state;
                        vm.XSDState.modified = res.modified;
                        openXMLDialog(res.configuration);
                        hideButtons();
                    }
                } else {
                    vm.submitXsd = false;
                    vm.isLoading = false;
                    vm.XSDState = res.state;
                    vm.XSDState = Object.assign(vm.XSDState, {warning: res.warning});
                    hideButtons();
                }
            }, function (err) {
                vm.submitXsd = false;
                vm.isLoading = false;
                vm.XSDState = '';
                vm.error = err;
                toasty.error({
                    msg: err.data.error.message,
                    clickToClose: true
                });
                hideButtons();
            });
        }

        function hideButtons() {
            vm.$emit('hide-button', {submitXSD: vm.submitXsd, isDeploy: vm.isDeploy, XSDState: vm.XSDState});
        }

        submit();

        function loadTree(xml, check) {
            vm.doc = new DOMParser().parseFromString(xml, 'application/xml');
            getRootNode(vm.doc, check);
            vm.xsdXML = xml;
            xpathFunc();
            addKeyReferencing();
            vm.selectedNode = vm.nodes[0];
            vm.getData(vm.nodes[0]);
            vm.isLoading = !!check;
        }

        // submit xsd to open
        function submit() {
            let path = $location.path();
            let x = path.split('/')[2];
            vm.objectType = x.toUpperCase();
            if (x == 'notification') {
                vm.selectedXsd = 'systemMonitorNotification';
            } else if (x === 'yade') {
                vm.selectedXsd = x;
            }
            if (vm.selectedXsd !== '' && vm.objectType !== 'OTHER') {
                vm.selectedDd = x;
                ngOnInit();
            } else {
                vm.isLoading = false;
                vm.submitXsd = false;
                EditorService.readXML({
                    jobschedulerId: vm.schedulerIds.selected,
                    "objectType": vm.objectType
                }).then(function (res) {
                    if(!res.configurations) {
                        vm.otherSchema = res.schemas;
                        vm.tabsArray = [];
                    } else {
                        vm.tabsArray = angular.copy(res.configurations);
                        vm.activeTab = vm.tabsArray[length-1];
                        readOthersXSD(vm.activeTab.id)
                    }
                });
                hideButtons();
            }
        }

        vm.othersSubmit = function () {
            vm.path = vm.selectedXsd;
            EditorService.getXSD(vm.selectedXsd).then(function (data) {
                loadTree(data.data, false);
                vm.submitXsd = true;
                vm.isDeploy = false;
                vm.prevXML = '';
            });
        };

        vm.changeXSD = function (data) {
            vm.selectedXsd = data;
        };

        // create json from xml
        function createJSONFromXML(data) {
            let result1;
            try {
                result1 = xml2json(data, {
                    compact: true,
                    spaces: 4,
                    ignoreDeclaration: true,
                    ignoreComment: true,
                    alwaysChildren: true
                });
                let rootNode;
                let r_node;
                let x;
                try {
                    x = JSON.parse(result1);
                } catch (e) {
                    vm.submitXsd = false;
                    vm.isLoading = false;
                    vm.error = e;
                    hideButtons();
                }
                for (let key in x) {
                    rootNode = key;
                }
                let json = createTempJson(x, rootNode);
                for (let key in json) {
                    r_node = key;
                }
                if (vm.nodes[0] && vm.nodes[0].ref === rootNode) {
                    vm.submitXsd = true;
                    createJsonAccToXsd(json, r_node, vm.nodes[0]);
                } else {
                    vm.nodes = [{}];
                    createNormalTreeJson(json, r_node, vm.nodes[0], '#');
                }
            } catch (e) {
                vm.submitXsd = false;
                vm.isLoading = false;
                vm.error = e;
                hideButtons();
            }
        }

        function createTempJson(editJson, rootNode) {
            let temp = {};
            if (_.isArray(editJson[rootNode])) {
                for (let i = 0; i < editJson[rootNode].length; i++) {
                    temp = Object.assign(temp, {[rootNode]: editJson[rootNode][i]});
                }
            } else {
                for (let a in editJson[rootNode]) {
                    if (a == '_text') {
                        a = '_cdata';
                    }
                    if (a == '_attributes' || a == '_cdata') {
                        if (temp[rootNode] == undefined) {
                            temp = Object.assign(temp, {[rootNode]: {[a]: editJson[rootNode][a]}});
                        } else {
                            temp[rootNode] = Object.assign(temp[rootNode], {[a]: editJson[rootNode][a]});
                        }
                    } else {
                        if (_.isArray(editJson[rootNode][a])) {
                            for (let i = 0; i < editJson[rootNode][a].length; i++) {
                                let x = a + '*' + i;
                                if (temp[rootNode] == undefined) {
                                    temp = Object.assign(temp, {[rootNode]: {[x]: {}}});
                                } else {
                                    temp[rootNode] = Object.assign(temp[rootNode], {[x]: {}});
                                }
                                for (let key in editJson[rootNode][a][i]) {
                                    createTempJsonRecursion(key, temp[rootNode][x], editJson[rootNode][a][i]);
                                }
                            }
                        } else {
                            if (temp[rootNode] == undefined) {
                                temp = Object.assign(temp, {[rootNode]: {[a]: {}}});
                                for (let key in editJson[rootNode][a]) {
                                    createTempJsonRecursion(key, temp[rootNode][a], editJson[rootNode][a]);
                                }
                            } else {
                                temp[rootNode] = Object.assign(temp[rootNode], {[a]: {}});
                                for (let key in editJson[rootNode][a]) {
                                    createTempJsonRecursion(key, temp[rootNode][a], editJson[rootNode][a]);
                                }
                            }
                        }
                    }
                }
            }
            vm.isLoading = false;
            return temp;
        }

        function createTempJsonRecursion(key, tempArr, editJson) {
            if (key == '_text') {
                key = '_cdata';
            }
            if (key == '_attributes' || key == '_cdata') {
                tempArr = Object.assign(tempArr, {[key]: editJson[key]});
            } else {
                if (editJson && _.isArray(editJson[key])) {
                    for (let i = 0; i < editJson[key].length; i++) {
                        let x = key + '*' + i;
                        tempArr = Object.assign(tempArr, {[x]: {}});
                        if (editJson) {
                            for (let as in editJson[key][i]) {
                                createTempJsonRecursion(as, tempArr[x], editJson[key][i]);
                            }
                        }
                    }
                } else {
                    tempArr = Object.assign(tempArr, {[key]: {}});
                    if (editJson) {
                        for (let x in editJson[key]) {
                            createTempJsonRecursion(x, tempArr[key], editJson[key]);
                        }
                    }
                }
            }
        }

        function createJsonAccToXsd(xmljson, rootNode, mainjson) {
            mainjson.nodes = [];
            if (xmljson[rootNode] && xmljson[rootNode]._attributes !== undefined) {
                for (let key in xmljson[rootNode]._attributes) {
                    if (mainjson && mainjson.attributes) {
                        for (let i = 0; i < mainjson.attributes.length; i++) {
                            if (key === mainjson.attributes[i].name) {
                                let a = xmljson[rootNode]._attributes[key];
                                mainjson.attributes[i] = Object.assign(mainjson.attributes[i], {data: a});
                            }
                        }
                    }
                }
            }
            if (xmljson[rootNode] && xmljson[rootNode]._cdata !== undefined) {
                mainjson.values[0] = Object.assign(mainjson.values[0], {data: xmljson[rootNode]._cdata});
            }

            for (let key in xmljson[rootNode]) {
                if (key !== '_attributes' && key !== '_cdata') {
                    addChildForxml(key, rootNode, xmljson, mainjson);
                }
            }
        }

        function addChildForxml(key, rootNode, xmljson, mainjson) {
            let a;
            if (key.indexOf('*')) {
                a = key.split('*')[0];
            }
            vm.checkChildNode(mainjson);
            for (let i = 0; i < vm.childNode.length; i++) {
                if (a === vm.childNode[i].ref) {
                    vm.childNode[i].import = key;
                    vm.addChild(vm.childNode[i], mainjson, false, i);
                }
            }
            for (let i = 0; i < mainjson.nodes.length; i++) {
                if (mainjson.nodes[i].ref == a && mainjson.nodes[i].import == key) {
                    createJsonAccToXsd(xmljson[rootNode], key, mainjson.nodes[i]);
                }
            }
        }

        // create json if xsd not matched
        function createNormalTreeJson(xmljson, rootNode, mainjson, parent) {
            let temp = {};
            vm.getData(temp);
            let a = undefined;
            if (rootNode.indexOf('*')) {
                a = rootNode.split('*')[0];
            }
            if (a == undefined) {
                mainjson = Object.assign(mainjson, {ref: rootNode, parent: parent});
            } else {
                mainjson = Object.assign(mainjson, {ref: a, parent: parent, import: rootNode});
            }
            for (let key in xmljson[rootNode]) {
                if (key === '_attributes') {
                    mainjson = Object.assign(mainjson, {attributes: []});
                    for (let x in xmljson[rootNode]._attributes) {
                        let dat = xmljson[rootNode]._attributes[x];
                        let temp1 = {};
                        temp1 = Object.assign(temp1, {name: x, data: dat, parent: rootNode});
                        mainjson.attributes.push(temp1);
                    }
                }
            }
            for (let key in xmljson[rootNode]) {
                if (key !== '_attributes' && key !== '_cdata') {
                    if (!mainjson.nodes) {
                        mainjson = Object.assign(mainjson, {nodes: []});
                    }
                    addChildToNormal(key, rootNode, xmljson, mainjson);
                }
            }
        }

        function addChildToNormal(key, rootNode, xmljson, mainjson) {
            let temp = {};
            let a = undefined;
            if (key.indexOf('*')) {
                a = key.split('*')[0];
            }
            if (a == undefined) {
                temp = Object.assign(temp, {ref: key, parent: rootNode, import: key});
            } else {
                temp = Object.assign(temp, {ref: a, parent: rootNode, import: key});
            }
            mainjson.nodes.push(temp);
            for (let i = 0; i < mainjson.nodes.length; i++) {
                if (mainjson.nodes[i].ref === a && mainjson.nodes[i].import == key) {
                    createNormalTreeJson(xmljson[rootNode], key, mainjson.nodes[i], rootNode);
                }
            }
        }

        vm.addCkCss = function (id) {
            setTimeout(function () {
                $('#' + id).addClass('invalid');
            }, 1);
        };

        vm.removeCkCss = function (id) {
            setTimeout(function () {
                $('#' + id).removeClass('invalid');
            }, 1);
        };

        vm.removeTag = function (data) {
            if (data && data.data && data.data.match(/<[^>]+>/gm)) {
                let x = data.data.replace(/<[^>]+>/gm, '');
                x = x.replace('&nbsp;', ' ');
                return x;
            } else {
                return data.data;
            }
        };

        function addKeyReferencing() {
            let key = {};
            if (vm.nodes[0] && vm.nodes[0].keyref) {
                for (let i = 0; i < vm.nodes[0].attributes.length; i++) {
                    if (vm.nodes[0].attributes[i].refer) {
                        key = Object.assign(key, {refe: vm.nodes[0].ref, name: vm.nodes[0].attributes[i].refer});
                        attachKeyReferencing(key);
                        break;
                    }
                }
            } else {
                if (vm.nodes[0] && vm.nodes[0].nodes) {
                    for (let i = 0; i < vm.nodes[0].nodes.length; i++) {
                        addKeyReferencingRecursion(vm.nodes[0].nodes[i]);
                    }
                }
            }
        }

        function addKeyReferencingRecursion(child) {
            let key = {};
            if (child.keyref && child.attributes) {
                for (let i = 0; i < child.attributes.length; i++) {
                    if (child.attributes[i].refer) {
                        key = Object.assign(key, {refe: child.ref, name: child.attributes[i].refer});
                        attachKeyReferencing(key);
                        if (child.nodes) {
                            for (let i = 0; i < child.nodes.length; i++) {
                                addKeyReferencingRecursion(child.nodes[i]);
                            }
                        }
                        break;
                    }
                }
            } else {
                if (child && child.nodes) {
                    for (let i = 0; i < child.nodes.length; i++) {
                        addKeyReferencingRecursion(child.nodes[i]);
                    }
                }
            }
        }

        function attachKeyReferencing(key) {
            if (key.name) {
                if (vm.nodes[0].ref === key.name && vm.nodes[0].key) {
                    for (let i = 0; i < vm.nodes[0].attributes.length; i++) {
                        if (vm.nodes[0].attributes[i].name === vm.nodes[0].key) {
                            vm.nodes[0].attributes[i].refElement = key.refe;
                            break;
                        }
                    }
                } else {
                    for (let i = 0; i < vm.nodes[0].nodes.length; i++) {
                        attachKeyReferencingRecursion(key, vm.nodes[0].nodes[i]);
                    }
                }
            }
        }

        function attachKeyReferencingRecursion(key, child) {
            if (key.name) {
                if (child.ref === key.name && child.key && child.attributes) {
                    for (let i = 0; i < child.attributes.length; i++) {
                        if (child.attributes[i].name === child.key) {
                            child.attributes[i].refElement = key.refe;
                            break;
                        }
                    }
                } else {
                    for (let i = 0; i < child.nodes.length; i++) {
                        attachKeyReferencingRecursion(key, child.nodes[i]);
                    }
                }
            }
        }

        function getRootNode(doc, check) {
            let temp, attrs, child;
            let select = xpath.useNamespaces({'xs': 'http://www.w3.org/2001/XMLSchema'});
            let rootElementPath = '//xs:element';
            let root = select(rootElementPath, doc);

            if (!root || !root[0]) {
                return;
            }

            for (let i = 0; i < root[0].attributes.length; i++) {
                let b = root[0].attributes[i].nodeValue;
                temp = Object.assign({}, {ref: b});
            }
            temp.parent = '#';
            temp.uuid = vm.counting;
            vm.counting++;
            attrs = checkAttributes(temp.ref);
            if (attrs.length > 0) {
                temp.attributes = [];
                for (let i = 0; i < attrs.length; i++) {
                    checkAttrsText(attrs[i]);
                    attrs[i].id = vm.counting;
                    vm.counting++;
                    temp.attributes.push(attrs[i]);
                }
            }
            setTimeout(() => {
                temp.show = !temp.attributes;
            }, 0);
            let text = checkText(temp.ref);
            if (text) {
                temp.text = text;
            }
            if (!check) {
                child = vm.checkChildNode(temp);
                if (child.length > 0) {
                    for (let i = 0; i < child.length; i++) {
                        if (child[i].minOccurs == undefined) {
                            if (!temp.nodes) {
                                temp.nodes = [];
                            }
                            vm.addChild(child[i], temp, true, i);
                        }
                    }
                }
            }
            printArray(temp);
        }

        function checkText(node) {
            let select = xpath.useNamespaces({'xs': 'http://www.w3.org/2001/XMLSchema'});
            let documentationPath = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:annotation/xs:documentation/@*';
            let element = select(documentationPath, vm.doc);
            let text = {};
            if (element.length > 0) {
                for (let i = 0; i < element.length; i++) {
                    let a = element[i].nodeName;
                    let b = element[i].nodeValue;
                    text = Object.assign(text, {[a]: b});
                }
            } else {
                let documentationPath1 = '/xs:schema/xs:element[@ref=\'' + node + '\']/xs:annotation/xs:documentation/@*';
                let element1 = select(documentationPath1, vm.doc);
                for (let i = 0; i < element1.length; i++) {
                    let a = element1[i].nodeName;
                    let b = element1[i].nodeValue;
                    text = Object.assign(text, {[a]: b});
                }
            }
            let documentationPath2 = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:annotation/xs:documentation';
            let element2 = select(documentationPath2, vm.doc);
            if (element2.length > 0) {
                text.doc = element2;
            }
            text.parent = node;
            return text;
        }

        function checkAttrsText(node) {
            let select = xpath.useNamespaces({'xs': 'http://www.w3.org/2001/XMLSchema'});
            let textAttrsPath = '/xs:schema/xs:element[@name=\'' + node.parent + '\']/xs:complexType/xs:attribute[@name=\'' + node.name + '\']/xs:annotation/xs:documentation';
            let element = select(textAttrsPath, vm.doc);
            let text = {};
            if (element.length > 0) {
                text.doc = element;
                node.text = text;
            }
            if (element.length === 0) {
                let textAttrsPath = '/xs:schema/xs:element[@name=\'' + node.parent + '\']/xs:complexType/xs:simpleContent/xs:extension/xs:attribute[@name=\'' + node.name + '\']/xs:annotation/xs:documentation';
                text.doc = select(textAttrsPath, vm.doc);
                node.text = text;
                if (text.length === 0) {
                    let textAttrsPath1 = '/xs:schema/xs:element[@name=\'' + node.parent + '\']/xs:complexType/xs:complexContent/xs:extension/xs:attribute[@name=\'' + node.name + '\']/xs:annotation/xs:documentation';
                    text.doc = select(textAttrsPath1, vm.doc);
                    if (text.doc)
                        node.text = text;
                }
            }
        }

        function _checkAttributes(attrsPath, attribute, node, attrsArr, select) {
            let attrs = select(attrsPath, vm.doc);
            if (attrs.length > 0) {
                for (let i = 0; i < attrs.length; i++) {
                    attribute = {};
                    let x;
                    for (let j = 0; j < attrs[i].attributes.length; j++) {
                        let a = attrs[i].attributes[j].nodeName;
                        let b = attrs[i].attributes[j].nodeValue;
                        attribute = Object.assign(attribute, {[a]: b});
                        let valueFromXmlEditorPath = '//xs:element[@name=\'' + node + '\']/xs:complexType/xs:attribute[@name=\'' + b + '\']/xs:annotation/xs:appinfo/XmlEditor';
                        let attr1 = select(valueFromXmlEditorPath, vm.doc);
                        if (attr1.length > 0) {
                            if (attr1[0].attributes && attr1[0].attributes.length > 0) {
                                for (let i = 0; i < attr1[0].attributes.length; i++) {
                                    if (attr1[0].attributes[i].nodeName === 'type') {
                                        x = attr1[0].attributes[i].nodeValue;
                                        break;
                                    }
                                }
                            }
                        }
                    }
                    if (x !== undefined) {
                        attribute.type = x;
                    }
                    attribute.parent = node;
                    attrsArr.push(attribute);
                }
            }
        }

        function checkAttributes(node) {
            let select = xpath.useNamespaces({'xs': 'http://www.w3.org/2001/XMLSchema'});
            let complexTypePath = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:complexType';
            let attribute = {};
            let attrsArr = [];
            let element = select(complexTypePath, vm.doc);

            if (element && element.length > 0) {
                _checkAttributes('/xs:schema/xs:element[@name=\'' + node + '\']/xs:complexType/xs:attribute', attribute, node, attrsArr, select);
                _checkAttributes('/xs:schema/xs:element[@name=\'' + node + '\']/xs:complexType/xs:complexContent/xs:extension/xs:attribute', attribute, node, attrsArr, select);
                _checkAttributes('/xs:schema/xs:element[@name=\'' + node + '\']/xs:complexType/xs:simpleContent/xs:extension/xs:attribute', attribute, node, attrsArr, select);
            }
            return attrsArr;
        }

        vm.checkChildNode = function (_nodes) {
            let node = _nodes.ref;
            let parentNode;
            vm.childNode = [];
            let select = xpath.useNamespaces({'xs': 'http://www.w3.org/2001/XMLSchema'});
            let complexTypePath = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:complexType';
            let TypePath = '/xs:schema/xs:element[@name=\'' + node + '\']';
            let nodes = {};
            let childArr = [];
            let element = select(complexTypePath, vm.doc);
            if (element.length > 0) {
                let sequencePath = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:complexType/xs:sequence';
                let choicePath = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:complexType/xs:choice';
                let childFromBasePath = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:complexType/xs:complexContent/xs:extension/@base';
                let complexContentWithElementPath = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:complexType/xs:complexContent/xs:extension/xs:sequence/xs:element';
                let childs = select(childFromBasePath, vm.doc);
                let element1 = select(sequencePath, vm.doc);
                if (element1.length > 0) {
                    let cPath = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:complexType/xs:sequence/xs:element';
                    let cElement = select(cPath, vm.doc);
                    if (cElement.length > 0) {
                        for (let i = 0; i < cElement.length; i++) {
                            nodes = {};
                            for (let j = 0; j < cElement[i].attributes.length; j++) {
                                let a = cElement[i].attributes[j].nodeName;
                                let b = cElement[i].attributes[j].nodeValue;
                                nodes = Object.assign(nodes, {[a]: b});
                            }
                            nodes.parent = node;
                            childArr.push(nodes);
                            vm.childNode = childArr;
                        }
                    }
                    let dPath = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:complexType/xs:sequence/xs:choice/xs:element';
                    let dElement = select(dPath, vm.doc);
                    if (dElement.length > 0) {
                        for (let i = 0; i < dElement.length; i++) {
                            nodes = {};
                            for (let j = 0; j < dElement[i].attributes.length; j++) {
                                let a = dElement[i].attributes[j].nodeName;
                                let b = dElement[i].attributes[j].nodeValue;
                                nodes = Object.assign(nodes, {[a]: b});
                            }
                            nodes.parent = node;
                            nodes.choice = node;
                            childArr.push(nodes);
                            vm.childNode = childArr;
                        }
                    }
                    let ePath = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:complexType/xs:sequence/xs:choice/xs:sequence/xs:element';
                    let eElement = select(ePath, vm.doc);
                    if (eElement.length > 0) {
                        for (let i = 0; i < eElement.length; i++) {
                            nodes = {};
                            for (let j = 0; j < eElement[i].attributes.length; j++) {
                                let a = eElement[i].attributes[j].nodeName;
                                let b = eElement[i].attributes[j].nodeValue;
                                nodes = Object.assign(nodes, {[a]: b});
                            }
                            nodes.parent = node;
                            nodes.choice = node;
                            if (nodes.minOccurs && !nodes.maxOccurs) {
                            } else {
                                childArr.push(nodes);
                            }
                            vm.childNode = childArr;
                        }
                    }
                    return childArr;
                }
                if ((select(choicePath, vm.doc)).length > 0) {
                    let childPath = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:complexType/xs:choice/xs:element';
                    let childs1 = select(childPath, vm.doc);
                    if (childs1.length > 0) {
                        for (let i = 0; i < childs1.length; i++) {
                            nodes = {};
                            for (let j = 0; j < childs1[i].attributes.length; j++) {
                                let a = childs1[i].attributes[j].nodeName;
                                let b = childs1[i].attributes[j].nodeValue;
                                nodes = Object.assign(nodes, {[a]: b});
                            }
                            nodes.parent = node;
                            nodes.choice = node;
                            childArr.push(nodes);
                            vm.childNode = childArr;
                        }
                        let childPath2 = '/xs:schema/xs:element[@name=\'' + node + '\']/xs:complexType/xs:choice/xs:sequence/xs:element';
                        let child12 = select(childPath2, vm.doc);
                        if (child12.length > 0) {
                            for (let i = 0; i < child12.length; i++) {
                                nodes = {};
                                for (let j = 0; j < child12[i].attributes.length; j++) {
                                    let a = child12[i].attributes[j].nodeName;
                                    let b = child12[i].attributes[j].nodeValue;
                                    nodes = Object.assign(nodes, {[a]: b});
                                }
                                nodes.parent = node;
                                nodes.choice = node;
                                childArr.push(nodes);
                                vm.childNode = childArr;
                            }
                        }
                        return childArr;
                    }
                }
                if (childs.length > 0) {
                    if (childs[0].nodeValue !== 'NotEmptyType') {
                        let childrenPath = '/xs:schema/xs:complexType[@name=\'' + childs[0].nodeValue + '\']/xs:sequence/xs:element';
                        let sElement = select(childrenPath, vm.doc);
                        if (sElement.length > 0) {
                            for (let i = 0; i < sElement.length; i++) {
                                nodes = {};
                                for (let j = 0; j < sElement[i].attributes.length; j++) {
                                    let a = sElement[i].attributes[j].nodeName;
                                    let b = sElement[i].attributes[j].nodeValue;
                                    nodes = Object.assign(nodes, {[a]: b});
                                }
                                nodes.parent = node;
                                childArr.push(nodes);
                                vm.childNode = childArr;
                            }
                        } else if ((select(complexContentWithElementPath, vm.doc)).length > 0) {
                            let childrenPath1 = '/xs:schema/xs:complexType[@name=\'' + childs[0].nodeValue + '\']/xs:choice/xs:element';
                            let elementx = select(childrenPath1, vm.doc);
                            if (elementx.length > 0) {
                                for (let i = 0; i < elementx.length; i++) {
                                    nodes = {};
                                    for (let j = 0; j < elementx[i].attributes.length; j++) {
                                        let a = elementx[i].attributes[j].nodeName;
                                        let b = elementx[i].attributes[j].nodeValue;
                                        nodes = Object.assign(nodes, {[a]: b});
                                    }
                                    nodes.parent = node;
                                    nodes.choice = node;
                                    childArr.push(nodes);
                                    vm.childNode = childArr;
                                }
                                let ele = select(complexContentWithElementPath, vm.doc);
                                for (let i = 0; i < ele.length; i++) {
                                    nodes = {};
                                    for (let j = 0; j < ele[i].attributes.length; j++) {
                                        let a = ele[i].attributes[j].nodeName;
                                        let b = ele[i].attributes[j].nodeValue;
                                        nodes = Object.assign(nodes, {[a]: b});
                                    }
                                    nodes.parent = node;
                                    childArr.push(nodes);
                                    vm.childNode = childArr;
                                }
                                return childArr;
                            }
                        }
                    }
                }
            } else if ((select(TypePath, vm.doc).length > 0)) {
                parentNode = node;
                let typeElement = select(TypePath, vm.doc);
                if (typeElement.length > 0 && typeElement[0].attributes.length > 0) {
                    for (let i = 0; i < typeElement[0].attributes.length; i++) {
                        if (typeElement[0].attributes[i].nodeName === 'type') {
                            addTypeChildNode(typeElement[0].attributes[i].nodeValue, parentNode);
                        }
                        if (typeElement[0].attributes[i].nodeValue === 'xs:boolean') {
                            _nodes = Object.assign(_nodes, {values: []});
                            let temp = {};
                            for (let j = 0; j < typeElement[0].attributes.length; j++) {
                                let a = typeElement[0].attributes[j].nodeName;
                                let b = typeElement[0].attributes[j].nodeValue;
                                if (a === 'type') {
                                    a = 'base';
                                }
                                if (a === 'default') {
                                    temp.data = b;
                                }
                                temp = Object.assign(temp, {[a]: b});
                            }
                            temp.parent = node;
                            _nodes.values.push(temp);
                        }
                    }
                }
            }
        };

        function addTypeChildNode(node, parent) {
            let parentNode;
            let select = xpath.useNamespaces({'xs': 'http://www.w3.org/2001/XMLSchema'});
            let complexTypePath = '/xs:schema/xs:complexType[@name=\'' + node + '\']';
            let TypePath = '/xs:schema/xs:element[@name=\'' + node + '\']';
            let nodes = {};
            let childArr = [];
            let element = select(complexTypePath, vm.doc);
            if (element.length > 0) {
                let sequencePath = '/xs:schema/xs:complexType[@name=\'' + node + '\']/xs:sequence';
                let element1 = select(sequencePath, vm.doc);
                if (element1.length > 0) {
                    let childPath = '/xs:schema/xs:complexType[@name=\'' + node + '\']/xs:sequence/xs:element';
                    let childs = select(childPath, vm.doc);
                    if (childs.length > 0) {
                        for (let i = 0; i < childs.length; i++) {
                            nodes = {};
                            for (let j = 0; j < childs[i].attributes.length; j++) {
                                let a = childs[i].attributes[j].nodeName;
                                let b = childs[i].attributes[j].nodeValue;
                                nodes = Object.assign(nodes, {[a]: b});
                            }
                            nodes.parent = parent;
                            childArr.push(nodes);
                            vm.childNode = childArr;
                        }
                    }
                    let seqChoicePath = '/xs:schema/xs:complexType[@name=\'' + node + '\']/xs:sequence/xs:choice/xs:element';
                    let getChildChoice = select(seqChoicePath, vm.doc);
                    if (getChildChoice.length > 0) {
                        for (let i = 0; i < getChildChoice.length; i++) {
                            nodes = {};
                            for (let j = 0; j < getChildChoice[i].attributes.length; j++) {
                                let a = getChildChoice[i].attributes[j].nodeName;
                                let b = getChildChoice[i].attributes[j].nodeValue;
                                nodes = Object.assign(nodes, {[a]: b});
                            }
                            nodes.parent = parent;
                            nodes.choice = parent;
                            childArr.push(nodes);
                            vm.childNode = childArr;
                        }
                    }
                    let seqChoiceSeqPath = '/xs:schema/xs:complexType[@name=\'' + node + '\']/xs:sequence/xs:choice/xs:sequence/xs:element';
                    let getChildChoiceSeq = select(seqChoiceSeqPath, vm.doc);
                    if (getChildChoiceSeq.length > 0) {
                        for (let i = 0; i < getChildChoiceSeq.length; i++) {
                            nodes = {};
                            for (let j = 0; j < getChildChoiceSeq[i].attributes.length; j++) {
                                let a = getChildChoiceSeq[i].attributes[j].nodeName;
                                let b = getChildChoiceSeq[i].attributes[j].nodeValue;
                                nodes = Object.assign(nodes, {[a]: b});
                            }
                            nodes.parent = parent;
                            nodes.choice1 = parent;
                            let flag = false;
                            for (let k = 0; k < childArr.length; k++) {
                                if (childArr[k].ref === nodes.ref) {
                                    flag = true;
                                    childArr[k] = Object.assign(childArr[k], nodes);
                                    break;
                                }
                            }
                            if (!flag) {
                                childArr.push(nodes);
                            }
                            vm.childNode = childArr;
                        }
                    }
                    return childArr;
                }
                let choicePath = '//xs:complexType[@name=\'' + node + '\']/xs:choice';
                if ((select(choicePath, vm.doc)).length) {
                    let childPath = '/xs:schema/xs:complexType[@name=\'' + node + '\']/xs:choice/xs:element';
                    let childs = select(childPath, vm.doc);
                    if (childs.length > 0) {
                        for (let i = 0; i < childs.length; i++) {
                            nodes = {};
                            for (let j = 0; j < childs[i].attributes.length; j++) {
                                let a = childs[i].attributes[j].nodeName;
                                let b = childs[i].attributes[j].nodeValue;
                                nodes = Object.assign(nodes, {[a]: b});
                            }
                            nodes.parent = parent;
                            nodes.choice = parent;
                            childArr.push(nodes);
                            vm.childNode = childArr;
                        }
                        return childArr;
                    }
                }
            } else if ((select(TypePath, vm.doc).length > 0)) {
                parentNode = node;
                let typeElement = select(TypePath, vm.doc);
                if (typeElement.length > 0 && typeElement[0].attributes.length > 0) {
                    for (let i = 0; i < typeElement[0].attributes.length; i++) {
                        if (typeElement[0].attributes[i].nodeName === 'type') {
                            addTypeChildNode(typeElement[0].attributes[i].nodeValue, parentNode);
                        }
                    }
                }
            }
        }

        vm.addChild = function (child, nodeArr, check, index) {
            let attrs = checkAttributes(child.ref);
            let text = checkText(child.ref);
            let value = getValues(child.ref);
            let attrsType = getAttrFromType(child.ref, child.parent);
            let valueType = getValueFromType(child.ref, child.parent);
            let val = getVal(child);
            if ((_.isEmpty(val)) && (_.isEmpty(value)) && (_.isEmpty(valueType))) {
                val = getValFromDefault(child);
            }
            child.nodes = [];
            child.order = index;
            child.uuid = vm.counting;
            child.parentId = nodeArr.uuid;
            vm.counting++;
            if (!(_.isEmpty(attrs))) {
                attachAttrs(attrs, child);
            }
            nodeArr.nodes.push(child);
            nodeArr.nodes = _.orderBy(nodeArr.nodes, ['order'], ['asc']);
            if (check) {
                autoAddChild(child);
            }
            if (!(_.isEmpty(val))) {
                attachValue(val, nodeArr.nodes);
            }
            if (!(_.isEmpty(value))) {
                attachValue(value, nodeArr.nodes);
            }
            if (valueType !== undefined) {
                attachValue(valueType, nodeArr.nodes);
            }
            if (attrsType !== undefined) {
                attachTypeAttrs(attrsType, nodeArr.nodes);
            }
            if (!(_.isEmpty(text))) {
                addText(text, nodeArr.nodes);
            }
            printArraya(false);
            if (child.ref === 'Body') {
                setTimeout(() => {
                    initEditor(child.values[0]);
                }, 100);
            }
            $scope.changeValidConfigStatus(false);
        };

        function autoAddChild(child) {
            if (vm.autoAddCount === 0) {
                let getCh = vm.checkChildNode(child);
                if (getCh) {
                    for (let i = 0; i < getCh.length; i++) {
                        if (getCh[i].minOccurs == undefined || getCh[i].minOccurs == 1) {
                            if (!getCh[i].choice) {
                                getCh[i].nodes = [];
                                vm.autoAddCount++;
                                vm.addChild(getCh[i], child, true, i);
                            }
                        }
                    }
                }
                vm.getData(child);
                printArraya(false);
            }
        }

        // drag and drop check
        function dragAnddropRules(dragNode, dropNode) {
            if (dragNode && dropNode) {
                if (dropNode.ref === dragNode.parent) {
                    let count = 0;
                    if (dragNode.maxOccurs === 'unbounded') {
                        $scope.changeValidConfigStatus(false);
                        return true;
                    } else if (dragNode.maxOccurs !== 'unbounded' && dragNode.maxOccurs !== undefined) {
                        if (dropNode.nodes.length > 0) {
                            for (let i = 0; i < dropNode.nodes.length; i++) {
                                if (dragNode.ref === dropNode.nodes[i].ref) {
                                    count++;
                                }
                            }
                            return dragNode.maxOccurs != count;
                        } else if (dropNode.nodes.length === 0) {
                            $scope.changeValidConfigStatus(false);
                            return true;
                        }
                    } else if (dragNode.maxOccurs === undefined) {
                        if (dropNode.nodes.length > 0) {
                            if (dropNode.nodes.length > 0) {
                                return (dragNode.ref !== dropNode.nodes[0].ref);
                            }
                        } else if (dropNode.nodes.length === 0) {
                            $scope.changeValidConfigStatus(false);
                            return true;
                        }
                    }
                }
            }
            return false;
        }

        // to send data in details component
        vm.getData = function (evt) {
            setTimeout(function () {
                calcHeight();
            }, 1);
            if (evt && evt.keyref) {
                for (let i = 0; i < evt.attributes.length; i++) {
                    if (evt.attributes[i].name === evt.keyref) {
                        vm.getDataAttr(evt.attributes[i].refer);
                        break;
                    }
                }
            }
            vm.selectedNode = evt;
            vm.breadCrumbArray = [];
            if (evt) {
                createBreadCrumb(evt);
            }
            vm.breadCrumbArray.reverse();
        };

        vm.getDataAttr = function (refer) {
            vm.tempArr = [];
            getKeyRecursively(refer, vm.nodes[0].nodes);
        };

        // validation for node value property
        vm.validValue = function (value, ref, tag) {
            if (/^\s*$/.test(value)) {
                vm.error = true;
                vm.text = 'Required Field';
                vm.errorName = {e: ref};
                if (tag.data !== undefined) {
                    for (let key in tag) {
                        if (key == 'data') {
                            delete tag[key];
                            vm.autoValidate();
                        }
                    }
                }
            } else {
                vm.error = false;
            }
            $scope.changeValidConfigStatus(false);
        };

        vm.submitValue = function (value, ref, tag) {
            if (/^\s*$/.test(value)) {
                vm.error = true;
                vm.text = gettextCatalog.getString('xml.message.requiredField');
                vm.errorName = {e: ref};
                if (tag.data !== undefined) {
                    for (let key in tag) {
                        if (key == 'data') {
                            vm.autoValidate();
                            delete tag[key];
                        }
                    }
                }
            } else {
                vm.error = false;
                tag.data = value;
                vm.autoValidate();
            }
        };

        function getKeyRecursively(refer, childNode) {
            let temp;
            for (let i = 0; i < childNode.length; i++) {
                if (childNode[i].ref === refer) {
                    if (childNode[i].key) {
                        temp = childNode[i].key;
                        for (let j = 0; j < childNode[i].attributes.length; j++) {
                            if (childNode[i].attributes[j].name === temp) {
                                if (childNode[i].attributes[j] && childNode[i].attributes[j].data) {
                                    vm.tempArr.push(childNode[i].attributes[j].data);
                                }
                            }
                        }
                    }
                } else {
                    if (vm.nodes[0].nodes[i] && vm.nodes[0].nodes[i].nodes) {
                        getKeyRecursively(refer, childNode[i].nodes);
                    }
                }
            }
        }

        // BreadCrumb
        function createBreadCrumb(node) {
            if (vm.nodes[0] && vm.nodes[0].ref === node.parent && vm.nodes[0].uuid === node.parentId) {
                vm.breadCrumbArray.push(vm.nodes[0]);
            } else {
                if (vm.nodes[0] && vm.nodes[0].nodes && vm.nodes[0].nodes.length > 0) {
                    for (let i = 0; i < vm.nodes[0].nodes.length; i++) {
                        createBreadCrumbRecursively(node, vm.nodes[0].nodes[i]);
                    }
                }
            }
        }

        function createBreadCrumbRecursively(node, nodes) {
            if (nodes && nodes.ref === node.parent && nodes.uuid === node.parentId) {
                vm.breadCrumbArray.push(nodes);
                createBreadCrumb(nodes);
            } else {
                if (nodes.nodes && nodes.nodes.length > 0) {
                    for (let i = 0; i < nodes.nodes.length; i++) {
                        createBreadCrumbRecursively(node, nodes.nodes[i]);
                    }
                }
            }
        }

        function addText(text, child) {
            if (child.length > 0) {
                for (let i = 0; i < child.length; i++) {
                    if (text && text.parent === child[i].ref) {
                        if (!child[i].text) {
                            child[i].text = text;
                            child[i].show = !child[i].attributes && !child[i].values;
                        }
                    }
                }
            }
        }

        function attachTypeAttrs(attrs, child) {
            for (let i = 0; i < child.length; i++) {
                if (attrs[0] && attrs[0].parent === child[i].ref && attrs[0].grandFather === child[i].parent) {
                    if (!child[i].attributes) {
                        child[i].attributes = [];
                        for (let j = 0; j < attrs.length; j++) {
                            checkAttrsValue(attrs[j]);
                            attrs[j].id = vm.counting;
                            if (attrs[j].default) {
                                attrs[j].data = attrs[j].default;
                            }
                            vm.counting++;
                            child[i].attributes.push(attrs[j]);
                        }
                        printArraya(false);
                    } else {
                        for (let j = 0; j < attrs.length; j++) {
                            checkAttrsValue(attrs[j]);
                            attrs[j].id = vm.counting;
                            if (attrs[j].default) {
                                attrs[j].data = attrs[j].default;
                            }
                            vm.counting++;
                            child[i].attributes.push(attrs[j]);
                        }
                        printArraya(false);
                    }
                }
            }
        }

        function attachValue(value, child) {
            if (value && value.length > 0 && value[0].grandFather) {
                for (let i = 0; i < child.length; i++) {
                    if (value[0] && value[0].parent === child[i].ref && value[0].grandFather === child[i].parent) {
                        if (!child[i].values) {
                            child[i].values = [];
                            for (let j = 0; j < value.length; j++) {
                                value[j].uuid = vm.counting;
                                vm.counting++;
                                child[i].values.push(value[j]);
                                if (value[j].base === 'password') {
                                    value[j].pShow = false;
                                }

                            }
                            printArraya(false);
                        }
                    }
                }
            } else {
                if (child.length > 0) {
                    for (let i = 0; i < child.length; i++) {
                        if (value && value[0] && value[0].parent === child[i].ref) {
                            if (!child[i].values) {
                                child[i].values = [];
                                for (let j = 0; j < value.length; j++) {
                                    value[j].uuid = vm.counting;
                                    vm.counting++;
                                    child[i].values.push(value[j]);
                                    if (value[j].base === 'password') {
                                        value[j].pShow = false;
                                    }
                                }
                                printArraya(false);
                            }
                        }
                    }
                }
            }
        }

        function getValFromDefault(node) {
            let select = xpath.useNamespaces({'xs': 'http://www.w3.org/2001/XMLSchema'});
            let attrTypePath = '/xs:schema/xs:element[@name=\'' + node.ref + '\']/@default';
            let ele = select(attrTypePath, vm.doc);
            let valueArr = [];
            let value = {};
            for (let i = 0; i < ele.length; i++) {
                value.base = 'xs:string';
                value.parent = node.ref;
                value.grandFather = node.parent;
                value.data = ele[i].nodeValue;
            }
            if (!(_.isEmpty(value))) {
                valueArr.push(value);
            }
            return valueArr;
        }

        function getVal(nodeValue) {
            let select = xpath.useNamespaces({'xs': 'http://www.w3.org/2001/XMLSchema'});
            let attrTypePath = '/xs:schema/xs:element[@name=\'' + nodeValue.ref + '\']/@type';
            let ele = select(attrTypePath, vm.doc);
            let valueArr = [];
            let value = {};
            for (let i = 0; i < ele.length; i++) {
                if (ele[i].nodeValue === 'xs:string' || ele[i].nodeValue === 'xs:long' || ele[i].nodeValue === 'xs:positiveInteger') {
                    value.base = ele[i].nodeValue;
                    value.parent = nodeValue.ref;
                    value.grandFather = nodeValue.parent;
                }
                if (!(_.isEmpty(value))) {
                    valueArr.push(value);
                }
            }
            return valueArr;
        }

        function attachAttrs(attrs, child) {
            if (!child.attribute) {
                child.attributes = [];
                for (let j = 0; j < attrs.length; j++) {
                    checkAttrsValue(attrs[j]);
                    checkAttrsText(attrs[j]);
                    attrs[j].id = vm.counting;
                    vm.counting++;
                    if (attrs[j].default) {
                        attrs[j].data = attrs[j].default;
                    }
                    if (attrs[j].type === 'password') {
                        attrs[j].pShow = false;
                    }
                    child.attributes.push(attrs[j]);
                }
            }
        }

        function getAttrFromType(nodeValue, parentNode) {
            let select = xpath.useNamespaces({'xs': 'http://www.w3.org/2001/XMLSchema'});
            let attrTypePath = '/xs:schema/xs:element[@name=\'' + nodeValue + '\']/@type';
            let element = select(attrTypePath, vm.doc);
            let attribute = {};
            if (element.length > 0) {
                let ele = select(attrTypePath, vm.doc);
                for (let i = 0; i < ele.length; i++) {
                    let a = ele[i].nodeName;
                    let b = ele[i].nodeValue;
                    attribute = Object.assign(attribute, {[a]: b});

                }

                attribute.parent = nodeValue;
                attribute.grandFather = parentNode;
            }
            return getAttrsFromType(attribute);
        }

        function getAttrsFromType(node) {
            let select = xpath.useNamespaces({'xs': 'http://www.w3.org/2001/XMLSchema'});
            let attrTypePath = '/xs:schema/xs:complexType[@name=\'' + node.type + '\']/xs:simpleContent/xs:extension/xs:attribute/@*';
            let element = select(attrTypePath, vm.doc);
            let attrArr = [];
            let attribute = {};
            if (element.length > 0) {
                for (let i = 0; i < element.length; i++) {
                    let a = element[i].nodeName;
                    let b = element[i].nodeValue;
                    attribute = Object.assign(attribute, {[a]: b});
                }
                attribute.parent = node.parent;
                attribute.grandFather = node.grandFather;
                let value = getAttrsValueFromType(attribute, node);
                if (value.length > 0) {
                    attribute.values = value;
                }
                attrArr.push(attribute);
                return attrArr;
            }
        }

        function getAttrsValueFromType(attr, node) {
            let select = xpath.useNamespaces({'xs': 'http://www.w3.org/2001/XMLSchema'});
            let valueTypePath = '//xs:complexType[@name=\'' + node.type + '\']/xs:simpleContent/xs:extension/xs:attribute[@name=\'' + attr.name + '\']/xs:simpleType/xs:restriction/xs:enumeration';
            let element = select(valueTypePath, vm.doc);
            let valueArr = [];
            if (element.length > 0) {
                for (let i = 0; i < element.length; i++) {
                    let value = {};
                    for (let j = 0; j < element[i].attributes.length; j++) {
                        let a = element[i].attributes[j].nodeName;
                        let b = element[i].attributes[j].nodeValue;
                        value = Object.assign(value, {[a]: b});
                    }
                    valueArr.push(value);
                }
                return valueArr;
            }
        }

        function getValueFromType(nodeValue, parentNode) {
            let select = xpath.useNamespaces({'xs': 'http://www.w3.org/2001/XMLSchema'});
            let attrTypePath = '/xs:schema/xs:element[@name=\'' + nodeValue + '\']/@type';
            let ele = select(attrTypePath, vm.doc);
            let attribute = {};
            if (ele.length > 0) {
                for (let i = 0; i < ele.length; i++) {
                    let a = ele[i].nodeName;
                    let b = ele[i].nodeValue;
                    attribute = Object.assign(attribute, {[a]: b});
                }
                attribute.parent = nodeValue;
                attribute.grandFather = parentNode;
            }
            return getTypeValue(attribute);
        }

        function getTypeValue(node) {
            if (node.type !== 'xs:boolean') {
                let select = xpath.useNamespaces({'xs': 'http://www.w3.org/2001/XMLSchema'});
                let extensionTypePath = '/xs:schema/xs:complexType[@name=\'' + node.type + '\']/xs:simpleContent/xs:extension/@*';
                let element = select(extensionTypePath, vm.doc);
                let value = {};
                let valueArr = [];
                let b;
                if (element.length > 0) {
                    if (element[0] && element[0].nodeValue === 'NotEmptyType') {
                        let a = element[0].nodeName;
                        let x = element[0].nodeValue;
                        value = Object.assign(value, {[a]: x});
                        let simpleTypePath = '/xs:schema/xs:simpleType[@name=\'' + value.base + '\']/xs:restriction/@*';
                        element = select(simpleTypePath, vm.doc);
                        if (element.length > 0) {
                            a = element[0].nodeName;
                            b = element[0].nodeValue;
                            value = Object.assign(value, {[a]: b});
                            let minLengthPath = '/xs:schema/xs:simpleType[@name=\'' + x + '\']/xs:restriction/xs:minLength/@*';
                            element = select(minLengthPath, vm.doc);
                            a = element[0].nodeName;
                            b = element[0].nodeValue;
                            value = Object.assign(value, {[a]: b});
                        }
                        value.parent = node.parent;
                        value.grandFather = node.grandFather;
                    }

                    if (!(_.isEmpty(value))) {
                        valueArr.push(value);
                    }
                    return valueArr;
                }
            } else {
                let value = {};
                let valueArr = [];
                value = Object.assign(node, {base: node.type});
                if (!(_.isEmpty(value))) {
                    valueArr.push(value);
                }
                return valueArr;
            }
        }

        function getValues(node) {
            let select = xpath.useNamespaces({'xs': 'http://www.w3.org/2001/XMLSchema'});
            let extensionPath = '//xs:element[@name=\'' + node + '\']/xs:complexType/xs:simpleContent/xs:extension/@*';
            let value = {};
            let valueArr = [];
            let b;
            let element = select(extensionPath, vm.doc);
            if (element[0] && element[0].nodeValue !== 'NotEmptyType') {
                let a = element[0].nodeName;
                let x = element[0].nodeValue;
                value = Object.assign(value, {[a]: x});
                let defultPath = '//xs:element[@name=\'' + node + '\']/@*';
                let defAttr = select(defultPath, vm.doc);
                if (defAttr.length > 0) {
                    for (let s = 0; s < defAttr.length; s++) {
                        if (defAttr[s].nodeName === 'default') {
                            value.default = defAttr[s].nodeValue;
                            value.data = defAttr[s].nodeValue;
                        }
                    }
                }
            }
            if (element[0] && element[0].nodeValue === 'NotEmptyType') {
                let a = element[0].nodeName;
                let x = element[0].nodeValue;
                value = Object.assign(value, {[a]: x});
                let simpleTypePath = '//xs:simpleType[@name=\'' + value.base + '\']/xs:restriction/@*';
                element = select(simpleTypePath, vm.doc);
                if (element.length > 0) {
                    a = element[0].nodeName;
                    b = element[0].nodeValue;
                    value = Object.assign(value, {[a]: b});
                    let minLengthPath = '//xs:simpleType[@name=\'' + x + '\']/xs:restriction/xs:minLength/@*';
                    element = select(minLengthPath, vm.doc);
                    a = element[0].nodeName;
                    b = element[0].nodeValue;
                    value = Object.assign(value, {[a]: b});

                }
                let defultPath = '//xs:element[@name=\'' + node + '\']/@*';
                let defAttr = select(defultPath, vm.doc);
                if (defAttr.length > 0) {
                    for (let s = 0; s < defAttr.length; s++) {
                        if (defAttr[s].nodeName === 'default') {
                            value.default = defAttr[s].nodeValue;
                            value.data = defAttr[s].nodeValue;
                        }
                    }
                }
                value.parent = node;
            } else {
                let extensionPath1 = '//xs:element[@name=\'' + node + '\']/xs:simpleType/xs:restriction/@*';
                element = select(extensionPath1, vm.doc);
                if (element.length > 0) {
                    let a = element[0].nodeName;
                    let c = element[0].nodeValue;
                    value = Object.assign(value, {[a]: c});
                    let defultPath = '//xs:element[@name=\'' + node + '\']/@*';
                    let defAttr = select(defultPath, vm.doc);
                    if (defAttr.length > 0) {
                        for (let s = 0; s < defAttr.length; s++) {
                            if (defAttr[s].nodeName === 'default') {
                                value.default = defAttr[s].nodeValue;
                                value.data = defAttr[s].nodeValue;
                            }
                        }
                    }
                    let minLengthPath = '//xs:element[@name=\'' + node + '\']/xs:simpleType/xs:restriction/xs:minLength/@*';
                    element = select(minLengthPath, vm.doc);
                    let enumPath = '//xs:element[@name=\'' + node + '\']/xs:simpleType/xs:restriction/xs:enumeration/@*';
                    let ele = select(enumPath, vm.doc);
                    if (element.length > 0) {
                        a = element[0].nodeName;
                        b = element[0].nodeValue;
                        value = Object.assign(value, {[a]: b});
                        let defultPath1 = '//xs:element[@name=\'' + node + '\']/@*';
                        let defAttr = select(defultPath1, vm.doc);
                        if (defAttr.length > 0) {
                            for (let s = 0; s < defAttr.length; s++) {
                                if (defAttr[s].nodeName === 'default') {
                                    value.default = defAttr[s].nodeValue;
                                    value.data = defAttr[s].nodeValue;
                                }
                            }
                        }
                    }
                    if (ele.length > 0) {
                        value.values = [];
                        for (let i = 0; i < ele.length; i++) {
                            let z = {};
                            let x = ele[i].nodeName;
                            let y = ele[i].nodeValue;
                            z = Object.assign(z, {[x]: y});
                            value.values.push(z);
                        }
                        let defultPath2 = '//xs:element[@name=\'' + node + '\']/@*';
                        let defAttr = select(defultPath2, vm.doc);

                        if (defAttr.length > 0) {
                            for (let s = 0; s < defAttr.length; s++) {
                                if (defAttr[s].nodeName === 'default') {
                                    value.default = defAttr[s].nodeValue;
                                    value.data = defAttr[s].nodeValue;
                                }
                            }
                        }
                    }
                }
                if (!(_.isEmpty(value))) {
                    value.parent = node;
                }
            }
            let xmlEditorPath = '//xs:element[@name=\'' + node + '\']/xs:annotation/xs:appinfo/XmlEditor/@type';
            let attr = select(xmlEditorPath, vm.doc);
            if (attr.length > 0) {
                value.base = attr[0].nodeValue;
            }
            if (_.isEmpty(value)) {
                let x;
                let valueFromXmlEditorPath = '//xs:element[@name=\'' + node + '\']/xs:annotation/xs:appinfo/XmlEditor';
                let attr1 = select(valueFromXmlEditorPath, vm.doc);
                if (attr1.length > 0) {
                    if (attr1[0].attributes && attr1[0].attributes.length > 0) {
                        for (let i = 0; i < attr1[0].attributes.length; i++) {
                            if (attr1[0].attributes[i].nodeName === 'type') {
                                x = attr1[0].attributes[i].nodeValue;
                                break;
                            }
                        }
                        if (x !== undefined) {
                            value.base = x;
                            value.parent = node;
                        } else {
                            value.base = 'xs:string';
                            value.parent = node;
                        }
                    }
                }
            }
            if (!(_.isEmpty(value))) {
                valueArr.push(value);
            }
            return valueArr;
        }

        function checkAttrsValue(attrs) {
            let select = xpath.useNamespaces({'xs': 'http://www.w3.org/2001/XMLSchema'});
            let enumerationPath = '//xs:element[@name=\'' + attrs.parent + '\']//xs:complexType/xs:simpleContent/xs:extension/xs:attribute[@name=\'' + attrs.name + '\']/xs:simpleType/xs:restriction/xs:enumeration';
            let valueArr = [];
            let valueJson = {};
            let value = select(enumerationPath, vm.doc);
            if (value.length > 0) {
                for (let i = 0; i < value.length; i++) {
                    valueJson = {};
                    for (let j = 0; j < value[i].attributes.length; j++) {
                        let a = value[i].attributes[j].nodeName;
                        let b = value[i].attributes[j].nodeValue;
                        valueJson = Object.assign(valueJson, {[a]: b});
                    }
                    valueArr.push(valueJson);
                }
                if (!attrs.values) {
                    attrs.values = [];
                    for (let i = 0; i < valueArr.length; i++) {
                        attrs.values.push(valueArr[i]);
                    }
                }
            } else {
                let enumerationPath = '//xs:element[@name=\'' + attrs.parent + '\']//xs:complexType/xs:attribute[@name=\'' + attrs.name + '\']/xs:simpleType/xs:restriction/xs:enumeration';
                value = select(enumerationPath, vm.doc);
                for (let i = 0; i < value.length; i++) {
                    valueJson = {};
                    for (let j = 0; j < value[i].attributes.length; j++) {
                        let a = value[i].attributes[j].nodeName;
                        let b = value[i].attributes[j].nodeValue;
                        valueJson = Object.assign(valueJson, {[a]: b});
                    }
                    valueArr.push(valueJson);
                }
                if (!attrs.values) {
                    attrs.values = [];
                    for (let i = 0; i < valueArr.length; i++) {
                        attrs.values.push(valueArr[i]);
                    }
                }
            }
        }

        function getCNodes(node) {
            let rootChildChilds;
            if (vm.doc.getElementsByTagName('xs:element') !== undefined) {
                rootChildChilds = vm.doc.getElementsByTagName('xs:element');
            }
            let rootChildChildsarr = [];
            let childElement;
            let count = 0;
            for (let index = 0; index < rootChildChilds.length; index++) {
                if (rootChildChilds.item(index).getAttributeNode('name') !== undefined) {
                    rootChildChildsarr[count] = rootChildChilds.item(index).getAttributeNode('name');
                    count++;
                    for (let j = 0; j < rootChildChildsarr.length; j++) {
                        if (rootChildChildsarr[j] && rootChildChildsarr[j].nodeValue === node.ref) {
                            childElement = rootChildChildsarr[j].ownerElement;
                        }
                    }
                }
            }
            getChildNodes(childElement, node.ref, node);
        }

        function getChildNodes(childElement, tagName, tempNode) {
            if (childElement && childElement.getElementsByTagName('xs:complexType') !== undefined) {
                let rootChildChilds = childElement.getElementsByTagName('xs:complexType');
                if (childElement.getElementsByTagName('xs:sequence').length !== 0) {
                    rootChildChilds = childElement.getElementsByTagName('xs:sequence');
                    if (rootChildChilds) {
                        getNode(rootChildChilds, tagName, tempNode);
                    }
                }
                if (childElement.getElementsByTagName('xs:choice').length !== 0) {
                    rootChildChilds = childElement.getElementsByTagName('xs:choice');
                    if (rootChildChilds) {
                        getNode(rootChildChilds, tagName, tempNode);
                    }
                }
                if (childElement.getElementsByTagName('xs:simpleType').length !== 0) {
                    rootChildChilds = childElement.getElementsByTagName('xs:simpleType');
                    if (rootChildChilds) {
                        getNode(rootChildChilds, tagName, tempNode);
                    }
                }
                if (childElement.getAttributeNode('type') !== undefined) {
                    rootChildChilds = childElement.getAttributeNode('type');
                    if (rootChildChilds) {
                        getTypeNode(rootChildChilds, tagName, tempNode);
                    }
                }
                if (childElement.getElementsByTagName('xs:extension').length > 0) {
                    rootChildChilds = childElement.getElementsByTagName('xs:extension');
                    if (rootChildChilds && rootChildChilds[0].getAttributeNode('base') !== undefined) {
                        let x = rootChildChilds[0].getAttributeNode('base');
                        if (x.nodeValue !== 'NotEmptyType' && x.nodeValue !== 'xs:anyURI') {
                            getChildFromBase(x, tagName, tempNode);
                        }
                    }
                }
            }
        }

        function getNode(rootChildChilds, tagName, tempNode) {
            let count = 0;
            let childs = [];
            let x;
            for (let i = 0; i < rootChildChilds.length; i++) {
                for (let j = 0; j < rootChildChilds[i].childNodes.length; j++) {
                    if (rootChildChilds[i].childNodes[j].nodeType == 1) {
                        childs[count] = rootChildChilds[i].childNodes[j];
                        count = count + 1;
                    }
                }
            }
            let rootChildrensAttrArr = [];
            for (let index = 0; index < childs.length; index++) {
                let rootChildrensAttr = {};
                for (let j = 0; j < childs[index].attributes.length; j++) {
                    rootChildrensAttr[childs[index].attributes[j].nodeName] = childs[index].attributes[j].nodeValue;
                    if (x === tagName || x === undefined) {
                        rootChildrensAttr = Object.assign(rootChildrensAttr, {
                            parent: tagName,
                            grandFather: tempNode.parent
                        });
                    } else {
                        rootChildrensAttr.parent = x;
                    }
                }

                rootChildrensAttrArr.push(rootChildrensAttr);
                if (rootChildrensAttr.ref) {
                    if (!checkDuplicateEntries(rootChildrensAttr, vm.showAllChild)) {
                        vm.showAllChild.push(rootChildrensAttr);
                    }
                }
            }
            for (let i = 0; i < rootChildrensAttrArr.length; i++) {
                if (rootChildrensAttrArr[i].ref !== undefined) {
                    getCNodes(rootChildrensAttrArr[i]);
                }
            }
        }

        function checkDuplicateEntries(child, json) {
            let keys = [];
            let count = 0;
            for (let key in child) {
                keys[count] = key;
                count++;
            }
            for (let i = 0; i < json.length; i++) {
                let count1 = 0;
                for (let k = 0; k < keys.length; k++) {
                    let temp = json[i];
                    if (temp[keys[k]] === child[keys[k]]) {
                        count1++;
                    }
                    if (count1 == keys.length) {
                        return true;
                    }
                }
            }
            return false;
        }

        function getChildFromBase(child, tagName, tempNode) {
            if (vm.doc.getElementsByTagName('xs:complexType') !== undefined) {
                var rootChildChilds = vm.doc.getElementsByTagName('xs:complexType');
            }
            let rootChildChildsarr = [];
            let childElement;
            let count = 0;
            for (let index = 0; index < rootChildChilds.length; index++) {
                if (rootChildChilds.item(index).getAttributeNode('name') !== undefined) {
                    rootChildChildsarr[count] = rootChildChilds.item(index).getAttributeNode('name');
                    count++;
                    for (let j = 0; j < rootChildChildsarr.length; j++) {
                        if (rootChildChildsarr[j] && rootChildChildsarr[j].nodeValue === child.nodeValue) {
                            childElement = rootChildChildsarr[j].ownerElement;
                        }
                    }
                }
            }
            getChildNodes(childElement, tagName, tempNode);
        }

        function getTypeNode(rootChildChilds, tagName, tempNode) {
            let child = rootChildChilds.nodeValue;
            child = {type: child};
            getTChildNode(child.type, tagName, tempNode);
        }

        function getTChildNode(child, tagName, tempNode) {
            if (vm.doc.getElementsByTagName('xs:complexType') !== undefined) {
                var rootChildChilds = vm.doc.getElementsByTagName('xs:complexType');
            }
            let rootChildChildsarr = [];
            let childElement;
            let count = 0;
            for (let index = 0; index < rootChildChilds.length; index++) {
                if (rootChildChilds.item(index).getAttributeNode('name') !== undefined) {
                    rootChildChildsarr[count] = rootChildChilds.item(index).getAttributeNode('name');
                    count++;
                    for (let j = 0; j < rootChildChildsarr.length; j++) {
                        if (rootChildChildsarr[j] && rootChildChildsarr[j].nodeValue === child) {
                            childElement = rootChildChildsarr[j].ownerElement;
                        }
                    }
                }
            }
            getChildNodes(childElement, tagName, tempNode);
        }

        // key and Key Ref Implementation code
        function xpathFunc() {
            let select = xpath.useNamespaces({'xs': 'http://www.w3.org/2001/XMLSchema'});
            let a;
            if (vm.nodes[0]) {
                a = vm.nodes[0].ref;
            }
            let keyPath = '/xs:schema/xs:element[@name=\'' + a + '\']/xs:key/@name';
            let keyRefPath = '/xs:schema/xs:element[@name=\'' + a + '\']/xs:keyref';
            let keyattrs = {};

            if (!vm.keyRefNodes || vm.keyRefNodes.length == 0) {
                vm.keyRefNodes = select(keyRefPath, vm.doc);
            }
            if (!vm.keyNodes || vm.keyNodes.length == 0) {
                vm.keyNodes = select(keyPath, vm.doc);
            }
            if (vm.keyNodes.length > 0) {
                for (let i = 0; i < vm.keyNodes.length; i++) {
                    let key = vm.keyNodes[i].nodeName;
                    let value = strReplace(vm.keyNodes[i].nodeValue);
                    keyattrs = Object.assign(keyattrs, {[key]: value});
                    for (let j = 0; j < vm.keyNodes[i].ownerElement.childNodes.length; j++) {
                        if (vm.keyNodes[i].ownerElement.childNodes[j].nodeName === 'xs:field') {
                            for (let k = 0; k < vm.keyNodes[i].ownerElement.childNodes[j].attributes.length; k++) {
                                keyattrs.key = strReplace(vm.keyNodes[i].ownerElement.childNodes[j].attributes[k].nodeValue);
                            }
                            break;
                        }
                    }
                    attachKey(keyattrs);
                }
            }
            if (vm.keyRefNodes.length > 0) {
                for (let i = 0; i < vm.keyRefNodes.length; i++) {
                    getKeyRef(vm.keyRefNodes[i]);
                }
            }
        }

        function getKeyRef(keyRefNodes) {
            let attrs = {};
            for (let i = 0; i < keyRefNodes.attributes.length; i++) {
                let key = keyRefNodes.attributes[i].nodeName;
                let value = strReplace(keyRefNodes.attributes[i].nodeValue);
                attrs = Object.assign(attrs, {[key]: value});
                for (let j = 0; j < keyRefNodes.attributes[0].ownerElement.childNodes.length; j++) {
                    if (keyRefNodes.attributes[0].ownerElement.childNodes[j].nodeName === 'xs:field') {
                        for (let k = 0; k < keyRefNodes.attributes[0].ownerElement.childNodes[j].attributes.length; k++) {
                            attrs.keyref = strReplace(keyRefNodes.attributes[0].ownerElement.childNodes[j].attributes[k].nodeValue);
                        }
                    }
                }
            }
            attachKeyRefNodes(attrs);
        }

        function strReplace(data) {
            return data.replace(/(Key|@)/g, '');
        }

        function attachKey(key) {
            addKeyAndKeyref(key);
        }

        function attachKeyRefNodes(keyrefnodes) {
            addKeyAndKeyref(keyrefnodes);
        }

        function addKeyAndKeyref(nodes) {
            let k = false;
            let keyre = false;
            for (let key in nodes) {
                if (key === 'key') {
                    k = true;
                    break;
                } else if (key === 'keyref') {
                    keyre = true;
                    break;
                }
            }
            if (vm.nodes[0] && vm.nodes[0].nodes) {
                for (let i = 0; i < vm.nodes[0].nodes.length; i++) {
                    if (vm.nodes[0].nodes[i].ref === nodes.name) {
                        if (k) {
                            vm.nodes[0].nodes[i].key = nodes.key;
                        } else if (keyre) {
                            vm.nodes[0].nodes[i].keyref = nodes.keyref;
                        }
                    } else {
                        if (vm.nodes[0].nodes[i].nodes) {
                            recursion(nodes, vm.nodes[0].nodes[i].nodes);
                        }
                    }
                }
            }


            function recursion(_nodes, child) {
                let ke = false;
                let keyref = false;
                for (let key in _nodes) {
                    if (key === 'key') {
                        ke = true;
                        break;
                    } else if (key === 'keyref') {
                        keyref = true;
                        break;
                    }
                }
                for (let i = 0; i < child.length; i++) {
                    if (child[i].ref === _nodes.name) {
                        if (ke) {
                            child[i].key = _nodes.key;
                        } else if (keyref) {
                            child[i].keyref = _nodes.keyref;
                            if (child[i].attributes) {
                                for (let j = 0; j < child[i].attributes.length; j++) {
                                    if (child[i].attributes[j].name === _nodes.keyref) {
                                        child[i].attributes[j].refer = _nodes.refer;
                                    }
                                }
                            }
                        }
                    } else {
                        if (child[i].nodes) {
                            recursion(_nodes, child[i].nodes);
                        }

                    }
                }
            }
        }

        // Remove Node
        vm.deleteNode = function (node) {
            $scope.changeValidConfigStatus(false);
            if (node.parent === '#') {
                console.log('Cannot Delete Root Node');
            } else {
                vm.isNext = false;
                getParent(node, vm.nodes[0]);
            }
        };

        function getParent(node, list) {
            if (node.parentId === list.uuid && list.parent == '#') {
                deleteData(list.nodes, node, list);
            } else {
                if (list.nodes) {
                    for (let i = 0; i < list.nodes.length; i++) {
                        if (node.parentId === list.nodes[i].uuid) {
                            deleteData(list.nodes[i].nodes, node, list.nodes[i]);
                        } else {
                            getParent(node, list.nodes[i]);
                        }
                    }
                }
            }
        }

        function deleteData(parentNode, node, parent) {
            if (parentNode) {
                for (let i = 0; i < parentNode.length; i++) {
                    if (node.ref === parentNode[i].ref && node.uuid == parentNode[i].uuid) {
                        parentNode.splice(i, 1);
                        printArraya(false);
                        vm.getData(parent);
                        vm.isNext = false;
                    }
                }
                if (node.key) {
                    if (vm.nodes[0].keyref) {
                        if (vm.nodes[0].attributes.length > 0) {
                            for (let i = 0; i < vm.nodes[0].attributes.length; i++) {
                                if (vm.nodes[0].keyref === vm.nodes[0].attributes[i].name) {
                                    for (let j = 0; j < node.attributes.length; j++) {
                                        if (node.attributes[j].name == node.key) {
                                            if (vm.nodes[0].attributes[i].data == node.attributes[j].data) {
                                                for (let key in vm.nodes[0].attributes[i]) {
                                                    if (key == 'data') {
                                                        delete vm.nodes[0].attributes[i][key];
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    } else {
                        if (vm.nodes[0].nodes) {
                            for (let i = 0; i < vm.nodes[0].nodes.length; i++) {
                                deleteKeyRefData(vm.nodes[0].nodes[i], node);
                            }
                        }
                    }
                }
            }
        }

        function deleteKeyRefData(child, node) {
            if (child.keyref) {
                if (child.attributes.length > 0) {
                    for (let i = 0; i < child.attributes.length; i++) {
                        if (child.keyref === child.attributes[i].name) {
                            for (let j = 0; j < node.attributes.length; j++) {
                                if (node.attributes[j].name == node.key) {
                                    if (child.attributes[i].data == node.attributes[j].data) {
                                        for (let key in child.attributes[i]) {
                                            if (key == 'data') {
                                                delete child.attributes[i][key];
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
            } else {
                if (child.nodes) {
                    for (let i = 0; i < child.nodes.length; i++) {
                        deleteKeyRefData(child.nodes[i], node);
                    }
                }
            }
        }

        // Cut Node
        vm.cutNode = function (node) {
            $scope.changeValidConfigStatus(false);
            vm.copyItem = {};
            vm.copyItem = Object.assign(vm.copyItem, node);
            searchAndRemoveNode(node);
            vm.cutData = true;
            if (vm.XSDState.message.code == 'XMLEDITOR-101') {
                vm.XSDState.message.code = 'XMLEDITOR-104';
            }
        };

        // searchNode
        function searchAndRemoveNode(node) {
            if (node.parent === vm.nodes[0].ref && node.parentId == vm.nodes[0].uuid) {
                for (let i = 0; i < vm.nodes[0].nodes.length; i++) {
                    if (node.uuid == vm.nodes[0].nodes[i].uuid) {
                        vm.nodes[0].nodes.splice(i, 1);
                    }
                }
            } else {
                for (let i = 0; i < vm.nodes[0].nodes.length; i++) {
                    searchAndRemoveNodeRecursion(node, vm.nodes[0].nodes[i]);
                }
            }
        }

        // searchNodeRecursion
        function searchAndRemoveNodeRecursion(node, child) {
            if (node.parent === child.ref && node.parentId == child.uuid) {
                for (let i = 0; i < child.nodes.length; i++) {
                    if (node.uuid == child.nodes[i].uuid) {
                        child.nodes.splice(i, 1);
                    }
                }
            } else {
                for (let i = 0; i < child.nodes.length; i++) {
                    searchAndRemoveNodeRecursion(node, child.nodes[i]);
                }
            }
        }

        // Copy Node
        vm.copyNode = function (node) {
            for (let key in node) {
                if (typeof (node[key]) == 'object') {
                    vm.copyItem = Object.assign({}, vm.copyItem, {[key]: []});
                    if ((key === 'attributes' || key === 'values') && node[key].length > 0) {
                        for (let i = 0; i < node[key].length; i++) {
                            let temp = {};
                            for (let a in node[key][i]) {
                                if (a == 'id') {
                                    temp = Object.assign(temp, {[a]: vm.counting});
                                    vm.counting++;
                                } else {
                                    temp = Object.assign(temp, {[a]: node[key][i][a]});
                                }
                            }
                            vm.copyItem[key].push(Object.assign({}, temp));
                        }
                    } else if (key === 'nodes' && node[key].length > 0) {
                        for (let i = 0; i < node[key].length; i++) {
                            let a = copyNodeRecursion(node[key][i]);
                            vm.copyItem[key].push(a);
                        }
                    } else if (key === 'text') {
                        vm.copyItem = Object.assign({}, vm.copyItem, {[key]: node[key]});
                    }
                } else {
                    vm.copyItem = Object.assign({}, vm.copyItem, {[key]: node[key]});
                }
            }
        };

        function copyNodeRecursion(node) {
            let tempa = {};
            for (let key in node) {
                if (typeof (node[key]) == 'object') {
                    tempa = Object.assign({}, tempa, {[key]: []});
                    if ((key === 'attributes' || key === 'values') && node[key].length > 0) {
                        for (let i = 0; i < node[key].length; i++) {
                            let temp = {};
                            for (let a in node[key][i]) {
                                if (a == 'id') {
                                    temp = Object.assign(temp, {[a]: vm.counting});
                                    vm.counting++;
                                } else {
                                    temp = Object.assign(temp, {[a]: node[key][i][a]});
                                }
                            }
                            tempa[key].push(Object.assign({}, temp));
                        }
                    } else if (key === 'nodes' && node[key].length > 0) {
                        for (let i = 0; i < node[key].length; i++) {
                            let a = copyNodeRecursion(node[key][i]);
                            tempa[key].push(a);
                        }
                    } else if (key === 'text') {
                        tempa = Object.assign({}, tempa, {[key]: node[key]});
                    }
                } else {
                    tempa = Object.assign({}, tempa, {[key]: node[key]});
                }
            }
            return tempa;
        }

        // check rules before paste
        vm.checkRules = function (pasteNode, copyNode) {
            if (copyNode !== undefined) {
                if (pasteNode.ref === copyNode.parent) {
                    let count = 0;
                    if (copyNode.maxOccurs === 'unbounded') {
                        vm.checkRule = true;
                    } else if (copyNode.maxOccurs !== 'unbounded' && copyNode.maxOccurs !== undefined) {
                        if (pasteNode.nodes.length > 0) {
                            for (let i = 0; i < pasteNode.nodes.length; i++) {
                                if (copyNode.ref === pasteNode.nodes[i].ref) {
                                    count++;
                                }
                            }
                            vm.checkRule = copyNode.maxOccurs != count;
                        } else if (pasteNode.nodes.length === 0) {
                            vm.checkRule = true;
                        }
                    } else if (copyNode.maxOccurs === undefined) {
                        if (pasteNode.nodes.length > 0) {
                            for (let i = 0; i < pasteNode.nodes.length; i++) {
                                vm.checkRule = (copyNode.ref !== pasteNode.nodes[i].ref);
                            }
                        } else if (pasteNode.nodes.length === 0) {
                            vm.checkRule = true;
                        }
                    }
                } else {
                    vm.checkRule = false;
                }
            }
        };

        // Paste Node
        vm.pasteNode = function (node) {
            vm.copyItem.uuid = node.uuid + vm.counting;
            vm.counting++;
            if (vm.copyItem.nodes) {
                vm.copyItem.nodes.forEach(function (node) {
                    changeUuId(node, vm.copyItem.uuid);
                    changeParentId(node, vm.copyItem.uuid);
                });
            }

            node.nodes.push(angular.copy(vm.copyItem));
            node.nodes = _.orderBy(node.nodes, ['order'], ['asc']);
            vm.cutData = false;
            vm.checkRule = true;
            printArraya(false);
        };

        function printArray(rootchildrensattrArr) {
            vm.nodes.push(rootchildrensattrArr);
            printArraya(true);
        }

        function printArraya(flag) {
            if (!flag) {
                vm.autoAddCount = 0;
            }
            xpathFunc();
            addKeyReferencing();
        }

        function calcHeight() {
            let a = $('.top-header-bar').outerHeight(true);
            let b = $('.navbar').outerHeight(true);
            let c = $('.white').outerHeight(true);
            let d = $('.attr').outerHeight(true);
            let e = $('.val').outerHeight(true);
            let f = $(window).outerHeight(true);

            if ((d == null || d === 'null') && (e == null || e === 'null')) {
                let x = f - a - b - c - 160;
                $('.documents').css({
                    'max-height': x + 'px'
                });
            } else if ((d == null || d === 'null') && (e !== null || e !== 'null')) {
                let x = f - a - b - c - e - 160;
                $('.documents').css({
                    'max-height': x + 'px'
                });
            } else if ((d !== null || d !== 'null') && (e == null || e === 'null')) {
                let x = f - a - b - c - d - 160;
                if (x > 300) {
                    $('.documents').css({
                        'max-height': x + 'px'
                    });
                } else {
                    $('.documents').css({
                        'max-height': 300 + 'px'
                    });
                }
            }
        }

        function jsonToXml() {
            if (vm.nodes.length > 0) {
                let doc = document.implementation.createDocument('', '', null);
                let peopleElem = doc.createElement(vm.nodes[0].ref);
                if (vm.nodes[0].attributes && vm.nodes[0].attributes.length > 0) {
                    for (let i = 0; i < vm.nodes[0].attributes.length; i++) {
                        if (vm.nodes[0].attributes[i].data) {
                            peopleElem.setAttribute(vm.nodes[0].attributes[i].name, vm.nodes[0].attributes[i].data);
                        }
                    }
                }
                if (vm.nodes[0] && vm.nodes[0].values && vm.nodes[0].values.length >= 0) {
                    for (let i = 0; i < vm.nodes[0].values.length; i++) {
                        if (vm.nodes[0].values[0].data) {
                            peopleElem.createCDATASection(vm.nodes[0].values[0].data);
                        }
                    }
                }
                if (vm.nodes[0].nodes && vm.nodes[0].nodes.length > 0) {
                    for (let i = 0; i < vm.nodes[0].nodes.length; i++) {
                        createChildJson(peopleElem, vm.nodes[0].nodes[i], doc.createElement(vm.nodes[0].nodes[i].ref), doc);
                    }
                }
                return peopleElem;
            }
        }

        function createChildJson(node, childrenNode, curentNode, doc) {
            if (childrenNode && childrenNode.attributes) {
                for (let i = 0; i < childrenNode.attributes.length; i++) {
                    if (childrenNode.attributes[i].data) {
                        curentNode.setAttribute(childrenNode.attributes[i].name, childrenNode.attributes[i].data);
                    }
                }
            }
            if (childrenNode && childrenNode.values && childrenNode.values.length >= 0) {
                for (let i = 0; i < childrenNode.values.length; i++) {
                    if (childrenNode.values[i].data) {
                        let a = doc.createCDATASection(childrenNode.values[i].data);
                        if (a) {
                            curentNode.appendChild(a);
                        }
                    }
                }
            }
            if (childrenNode.nodes && childrenNode.nodes.length > 0) {
                for (let i = 0; i < childrenNode.nodes.length; i++) {
                    createChildJson(curentNode, childrenNode.nodes[i], doc.createElement(childrenNode.nodes[i].ref), doc);
                }
            }
            node.appendChild(curentNode);
        }

        function _showXml() {
            let xml = jsonToXml();
            if (xml) {
                let xmlAsString = new XMLSerializer().serializeToString(xml);
                let a = `<?xml version="1.0" encoding="UTF-8"?>`;
                a = a.concat(xmlAsString);
                return vkbeautify.xml(a);
            }
        }

        // autoValidate
        vm.autoValidate = function () {
            if (vm.nodes[0] && vm.nodes[0].attributes && vm.nodes[0].attributes.length > 0) {
                for (let i = 0; i < vm.nodes[0].attributes.length; i++) {
                    if (vm.nodes[0].attributes[i].use === 'required') {
                        if (vm.nodes[0].attributes[i].data === undefined) {
                            vm.nonValidattribute = vm.nodes[0].attributes[i];
                            vm.errorLocation = vm.nodes[0];
                            $scope.changeValidConfigStatus(false);
                            return false;
                        }
                    }
                }
            }
            if (vm.nodes[0] && vm.nodes[0].values && vm.nodes[0].values.length > 0) {
                if (vm.nodes[0].values[0].data === undefined) {
                    vm.nonValidattribute = vm.nodes[0].values[0];
                    vm.errorLocation = vm.nodes[0];
                    $scope.changeValidConfigStatus(false);
                    return false;
                }
            }
            if (vm.nodes[0] && vm.nodes[0].nodes && vm.nodes[0].nodes.length > 0) {
                for (let i = 0; i < vm.nodes[0].nodes.length; i++) {
                    let x = autoValidateRecursion(vm.nodes[0].nodes[i]);
                    if (x == false) {
                        return x;
                    }
                }
            }
            vm.nonValidattribute = {};
            vm.isDeploy = false;
            hideButtons();
        };

        function autoValidateRecursion(child) {
            if (child && child.attributes && child.attributes.length > 0) {
                for (let i = 0; i < child.attributes.length; i++) {
                    if (child.attributes[i].use === 'required') {
                        if (child.attributes[i].data === undefined) {
                            vm.nonValidattribute = child.attributes[i];
                            vm.errorLocation = child;
                            $scope.changeValidConfigStatus(false);
                            return false;
                        }
                    }
                }
            }
            if (child && child.values && child.values.length > 0) {
                if (child.values[0].data === undefined) {
                    vm.nonValidattribute = child.values[0];
                    vm.errorLocation = child;
                    $scope.changeValidConfigStatus(false);
                    return false;
                }
            }
            if (child && child.nodes && child.nodes.length > 0) {
                for (let i = 0; i < child.nodes.length; i++) {
                    let x = autoValidateRecursion(child.nodes[i]);
                    if (x == false) {
                        return x;
                    }
                }
            }
        }

        vm.stopPressingSpace = function (id) {
            $('#' + id).keypress(function (e) {
                if (e.key === ' ' || e.key === 'Spacebar') {
                    e.preventDefault();
                }
            })
        };

        // validation for attributes
        vm.validateAttr = function (value, tag, e) {
            $scope.changeValidConfigStatus(false);
            if (tag.type === 'xs:NMTOKEN') {
                if (/\s/.test(value)) {
                    vm.error = true;
                    vm.text = tag.name + ': ' + gettextCatalog.getString('xml.message.spaceNotAllowed');
                    vm.errorName = {e: tag.name};
                    if (tag.data !== undefined) {
                        for (let key in tag) {
                            if (key == 'data') {
                                vm.autoValidate();
                            }
                        }
                    }
                } else if (value == '' && tag.use === 'required') {
                    vm.error = true;
                    vm.text = tag.name + ': ' + gettextCatalog.getString('xml.message.requiredField');
                    vm.errorName = {e: tag.name};
                    if (tag.data !== undefined) {
                        for (let key in tag) {
                            if (key == 'data') {
                                delete tag[key];
                                vm.autoValidate();
                            }
                        }
                    }
                } else {
                    vm.error = false;
                }
            } else if (tag.type === 'xs:NCName') {

                if (/[\i:]|[:]/g.test(value)) {
                    vm.error = true;
                    vm.text = tag.name + ': ' + gettextCatalog.getString('xml.message.colonNotAllowed');
                    vm.errorName = {e: tag.name};
                    if (tag.data !== undefined) {
                        for (let key in tag) {
                            if (key == 'data') {
                                delete tag[key];
                                vm.autoValidate();
                            }
                        }
                    }
                } else if (value == '' && tag.use === 'required') {
                    vm.error = true;
                    vm.text = tag.name + ': ' + gettextCatalog.getString('xml.message.requiredField');
                    vm.errorName = {e: tag.name};
                    if (tag.data !== undefined) {
                        for (let key in tag) {
                            if (key == 'data') {
                                delete tag[key];
                                vm.autoValidate();
                            }
                        }
                    }
                } else {
                    vm.error = false;
                }
            } else if (tag.type === 'xs:string') {
                if (/[a-zA-Z0-9_/s]+.*$/.test(value)) {
                    vm.error = false;
                } else if (tag.use === 'required') {

                    vm.error = true;
                    vm.text = tag.name + ': ' + gettextCatalog.getString('xml.message.requiredField');
                    vm.errorName = {e: tag.name};
                    if (tag.data !== undefined) {
                        for (let key in tag) {
                            if (key == 'data') {
                                delete tag[key];
                                vm.autoValidate();
                            }
                        }
                    }
                } else if (value.length > 0) {
                    vm.error = true;
                    vm.text = tag.name + ': ' + gettextCatalog.getString('xml.message.cannotAddBlankSpace');
                    vm.errorName = {e: tag.name};
                    if (tag.data !== undefined) {
                        for (let key in tag) {
                            if (key == 'data') {
                                delete tag[key];
                                vm.autoValidate();
                            }
                        }
                    }
                } else {
                    vm.error = false;
                }
            } else if (tag.type === 'xs:positiveInteger') {
                if (value !== undefined) {
                    if (/[0-9]/.test(value)) {
                        vm.error = false;
                        vm.submitData(value, tag);
                    } else if (tag.use === 'required' && value === '') {
                        vm.error = true;
                        vm.errorName = {e: tag.name};
                        if (tag.data !== undefined) {
                            for (let key in tag) {
                                if (key == 'data') {
                                    delete tag[key];
                                    vm.autoValidate();
                                }
                            }
                        }
                        vm.text = tag.name + ': ' + gettextCatalog.getString('xml.message.requiredField');
                    } else if (/[a-zA-Z_*]/.test(value)) {
                        vm.error = true;
                        vm.errorName = {e: tag.name};
                        if (tag.data !== undefined) {
                            for (let key in tag) {
                                if (key == 'data') {
                                    delete tag[key];
                                    vm.autoValidate();
                                }
                            }
                        }
                        vm.text = tag.name + ': ' + gettextCatalog.getString('xml.message.onlyPositiveNumbers');
                    } else {
                        vm.error = true;
                        vm.errorName = {e: tag.name};
                        if (tag.data !== undefined) {
                            for (let key in tag) {
                                if (key == 'data') {
                                    delete tag[key];
                                    vm.autoValidate();
                                }
                            }
                        }
                        vm.text = tag.name + ': ' + gettextCatalog.getString('xml.message.cannotNegative');
                    }
                }
            } else if (tag.type === 'xs:integer') {
                if (value != undefined) {
                    if (/[0-9]/.test(value)) {
                        vm.error = false;
                        tag = Object.assign(tag, {data: value});
                        vm.autoValidate();
                    } else if (tag.use === 'required' && value === '') {
                        vm.error = true;
                        vm.text = tag.name + ': ' + gettextCatalog.getString('xml.message.requiredField');
                        vm.errorName = {e: tag.name};
                        if (tag.data !== undefined) {
                            for (let key in tag) {
                                if (key == 'data') {
                                    delete tag[key];
                                    vm.autoValidate();
                                }
                            }
                        }
                    } else if (/[a-zA-Z_*]/.test(value)) {
                        vm.error = true;
                        vm.text = tag.name + ': ' + gettextCatalog.getString('xml.message.onlyNumbers');
                        vm.errorName = {e: tag.name};
                        if (tag.data !== undefined) {
                            for (let key in tag) {
                                if (key == 'data') {
                                    delete tag[key];
                                    vm.autoValidate();
                                }
                            }
                        }
                    } else {
                        vm.error = true;
                        vm.text = tag.name + ': ' + gettextCatalog.getString('xml.message.onlyNumbers');
                        vm.errorName = {e: tag.name};
                        if (tag.data !== undefined) {
                            for (let key in tag) {
                                if (key == 'data') {
                                    delete tag[key];
                                    vm.autoValidate();
                                }
                            }
                        }
                    }
                }
            } else {
                tag = Object.assign(tag, {data: value});
                vm.autoValidate();
            }
        };

        vm.submitData = function (value, tag) {
            if (tag.type === 'xs:NMTOKEN') {
                if (/\s/.test(value)) {
                    vm.error = true;
                    vm.text = tag.name + ': ' + gettextCatalog.getString('xml.message.spaceNotAllowed');
                    vm.errorName = {e: tag.name};
                    if (tag.data !== undefined) {
                        for (let key in tag) {
                            if (key == 'data') {
                                vm.autoValidate();
                            }
                        }
                    }
                } else if (value == '' && tag.use === 'required') {
                    vm.error = true;
                    vm.text = tag.name + ':' + gettextCatalog.getString('xml.message.requiredField');
                    vm.errorName = {e: tag.name};
                    if (tag.data !== undefined) {
                        for (let key in tag) {
                            if (key == 'data') {
                                delete tag[key];
                                vm.autoValidate();
                            }
                        }
                    }
                } else {
                    vm.error = false;
                    tag = Object.assign(tag, {data: value});
                    vm.autoValidate();
                }
            } else if (tag.type === 'xs:NCName') {
                if (/[\i:]|[:]/g.test(value)) {
                    vm.error = true;
                    vm.text = tag.name + ': ' + gettextCatalog.getString('xml.message.colonNotAllowed');
                    vm.errorName = {e: tag.name};
                    if (tag.data !== undefined) {
                        for (let key in tag) {
                            if (key == 'data') {
                                vm.autoValidate();
                            }
                        }
                    }
                } else if (value == '' && tag.use === 'required') {
                    vm.error = true;
                    vm.text = tag.name + ': ' + gettextCatalog.getString('xml.message.requiredField');
                    vm.errorName = {e: tag.name};
                    if (tag.data !== undefined) {
                        for (let key in tag) {
                            if (key == 'data') {
                                delete tag[key];
                                vm.autoValidate();
                            }
                        }
                    }
                } else {
                    vm.error = false;
                    tag = Object.assign(tag, {data: value});
                    vm.autoValidate();
                }
            } else if (tag.type === 'xs:string') {
                if (/[a-zA-Z0-9_\\s]+.*$/.test(value)) {
                    vm.error = false;
                    tag = Object.assign(tag, {data: value});
                    vm.autoValidate();
                } else if (tag.use === 'required') {
                    vm.error = true;
                    vm.text = tag.name + ': ' + gettextCatalog.getString('xml.message.requiredField');
                    vm.errorName = {e: tag.name};
                    if (tag.data !== undefined) {
                        for (let key in tag) {
                            if (key == 'data') {
                                delete tag[key];
                                vm.autoValidate();
                            }
                        }
                    }
                } else if (value.length > 0) {
                    vm.error = true;
                    vm.text = tag.name + ': ' + gettextCatalog.getString('xml.message.cannotAddBlankSpace');
                    vm.errorName = {e: tag.name};
                    if (tag.data !== undefined) {
                        for (let key in tag) {
                            if (key == 'data') {
                                delete tag[key];
                                vm.autoValidate();
                            }
                        }
                    }
                } else {
                    vm.error = false;
                }
            } else if (tag.type === 'xs:positiveInteger') {
                if (/[0-9]/.test(value)) {
                    vm.error = false;
                    tag = Object.assign(tag, {data: value});
                    vm.autoValidate();
                } else if (tag.use === 'required' && value === '') {
                    vm.error = true;
                    vm.errorName = {e: tag.name};
                    vm.text = tag.name + ': ' + gettextCatalog.getString('xml.message.requiredField');
                    if (tag.data !== undefined) {
                        for (let key in tag) {
                            if (key == 'data') {
                                delete tag[key];
                                vm.autoValidate();
                            }
                        }
                    }
                } else if (/[a-zA-Z_*]/.test(value)) {
                    vm.error = true;
                    vm.errorName = {e: tag.name};
                    vm.text = tag.name + ': ' + gettextCatalog.getString('xml.message.onlyPositiveNumbers');
                    if (tag.data !== undefined) {
                        for (let key in tag) {
                            if (key == 'data') {
                                delete tag[key];
                                vm.autoValidate();
                            }
                        }
                    }
                } else if (/[0-9a-zA-Z_*]/.test(value)) {
                    vm.error = true;
                    vm.text = tag.name + ': ' + gettextCatalog.getString('xml.message.onlyPositiveNumbers');
                    vm.errorName = {e: tag.name};
                    if (tag.data !== undefined) {
                        for (let key in tag) {
                            if (key == 'data') {
                                delete tag[key];
                                vm.autoValidate();
                            }
                        }
                    }
                } else {
                    vm.error = true;
                    vm.text = tag.name + ': ' + gettextCatalog.getString('xml.message.cannotNegative');
                    vm.errorName = {e: tag.name};
                    if (tag.data !== undefined) {
                        for (let key in tag) {
                            if (key == 'data') {
                                delete tag[key];
                                vm.autoValidate();
                            }
                        }
                    }
                }
            } else if (tag.type === 'xs:integer') {
                if (/[0-9]/.test(value)) {
                    vm.error = false;
                    tag = Object.assign(tag, {data: value});
                    vm.autoValidate();
                } else if (tag.use === 'required' && value === '') {
                    vm.error = true;
                    vm.text = tag.name + ': ' + gettextCatalog.getString('xml.message.requiredField');
                    vm.errorName = {e: tag.name};
                    if (tag.data !== undefined) {
                        for (let key in tag) {
                            if (key == 'data') {
                                delete tag[key];
                                vm.autoValidate();
                            }
                        }
                    }
                } else if (/[a-zA-Z_*]/.test(value)) {
                    vm.error = true;
                    vm.text = tag.name + ': ' + gettextCatalog.getString('xml.message.onlyNumbers');
                    vm.errorName = {e: tag.name};
                    if (tag.data !== undefined) {
                        for (let key in tag) {
                            if (key == 'data') {
                                delete tag[key];
                                vm.autoValidate();
                            }
                        }
                    }
                } else {
                    vm.error = true;
                    vm.text = tag.name + ': ' + gettextCatalog.getString('xml.message.onlyNumbers');
                    vm.errorName = {e: tag.name};
                    if (tag.data !== undefined) {
                        for (let key in tag) {
                            if (key == 'data') {
                                delete tag[key];
                                vm.autoValidate();
                            }
                        }
                    }
                }
            } else {
                if (/[0-9]/.test(value)) {
                    vm.error = false;
                    tag = Object.assign(tag, {data: value});
                    vm.autoValidate();
                    if (tag.data !== undefined) {
                        for (let key in tag) {
                            if (key == 'data') {
                                delete tag[key];
                                vm.autoValidate();
                            }
                        }
                    }
                } else if (tag.use === 'required' && value === '') {
                    vm.error = true;
                    vm.text = tag.name + ': ' + gettextCatalog.getString('xml.message.requiredField');
                    vm.errorName = {e: tag.name};
                    if (tag.data !== undefined) {
                        for (let key in tag) {
                            if (key == 'data') {
                                delete tag[key];
                                vm.autoValidate();
                            }
                        }
                    }
                } else if (value == '') {
                    tag = Object.assign(tag, {data: tag.defalut});
                    vm.autoValidate();
                }
            }
        };

        // toaster pop toast
        function popToast(node) {
            let msg = '';
            if (node && node.name) {
                msg = 'Attribute "' + node.name + '" cannot be empty';
            } else {
                msg = 'cannot be empty';
            }
            toasty.error({
                title: 'Element : ' + node.parent,
                msg: msg,
                clickToClose: true
            });
        }

        // link gotokey
        vm.gotoKey = function (node) {
            if (node !== undefined) {
                if (node.refer === vm.nodes[0].ref) {
                    if (vm.nodes[0].key) {
                        for (let i = 0; i < vm.nodes[0].attributes.length; i++) {
                            if (vm.nodes[0].attributes[i].name === vm.nodes[0].key) {
                                if (node.data === vm.nodes[0].attributes[i].data) {
                                    vm.getData(vm.nodes[0]);
                                    vm.selectedNode = vm.nodes[0];
                                    vm.refElement = node;
                                }
                            }
                        }
                    } else {
                        for (let i = 0; i < vm.nodes[0].nodes.length; i++) {
                            vm.gotoKeyRecursion(node, vm.nodes[0].nodes[i]);
                        }
                    }
                } else {
                    for (let i = 0; i < vm.nodes[0].nodes.length; i++) {
                        vm.gotoKeyRecursion(node, vm.nodes[0].nodes[i]);
                    }
                }
            }
        };

        vm.getpos = function (node) {
            if (node && node.text) {
                $('[data-toggle="tooltip"]').tooltip({
                    trigger: 'hover focus manual',
                    html: true,
                    delay: {'show': 500, 'hide': 200}
                });
                let a = '#' + node.id;
                $(a).tooltip('show');
            }
        };

        function changeUuId(node, id) {
            node.uuid = id + vm.counting;
            vm.counting++;
            if (node.nodes && node.nodes.length > 0) {
                node.nodes.forEach(function (cNode) {
                    changeUuId(cNode, node.uuid);
                });
            }
        }

        function changeParentId(node, parentId) {
            node.parentId = parentId;
            if (node.nodes && node.nodes.length > 0) {
                node.nodes.forEach(function (cNode) {
                    changeParentId(cNode, node.uuid);
                });
            }
        }

        vm.checkChoice = function (node) {
            if (vm.childNode && vm.childNode.length > 0) {
                let flg = true;
                for (let i = 0; i < vm.childNode.length; i++) {
                    if (vm.childNode[i] && vm.childNode[i].choice) {
                        if (node.nodes && node.nodes.length > 0) {
                            for (let j = 0; j < node.nodes.length; j++) {
                                if (node.nodes[j].choice && node.nodes[j].ref === vm.childNode[i].ref) {
                                    vm.choice = true;
                                    flg = false;
                                    break;
                                }
                            }
                            if (flg) {
                                vm.choice = false;
                            }
                        } else {
                            vm.choice = false;
                        }
                    }
                }
            }
        };

        vm.addDefaultValue = function (node) {
            if (node.values && (node.values[0].base === 'xs:string' && (node.values[0] && node.values[0].values && node.values[0].values.length > 0) && node.values[0].default === undefined)) {
                node.values[0].default = node.values[0].values[0].value;
                node.values[0].data = node.values[0].values[0].value;
            } else if (node.values && (node.values[0].base === 'xs:boolean') && node.values[0].default === undefined) {
                node.values[0].default = true;
                node.values[0].data = true;
            }
        };

        vm.getCustomCss = function (node, parentNode) {
            let count = 0;
            if (vm.choice) {
                if (node.maxOccurs === 'unbounded') {
                    return '';
                } else if (node.maxOccurs !== 'unbounded' && node.maxOccurs !== undefined) {
                    if (parentNode.nodes && parentNode.nodes.length > 0) {
                        for (let i = 0; i < parentNode.nodes.length; i++) {
                            if (node.ref === parentNode.nodes[i].ref) {
                                count++;
                            }
                        }
                        if (node.maxOccurs == count) {
                            return 'disabled disable-link';
                        }
                    }
                } else if (node.maxOccurs === undefined) {
                    if (parentNode.nodes && parentNode.nodes.length > 0) {
                        for (let i = 0; i < parentNode.nodes.length; i++) {
                            if (node.ref === parentNode.nodes[i].ref) {
                                return 'disabled disable-link';
                            }
                        }
                    }
                }
                return node.choice ? 'disabled disable-link' : '';
            }
            if (node.maxOccurs === 'unbounded') {
                return '';
            } else if (node.maxOccurs !== 'unbounded' && node.maxOccurs !== undefined) {
                if (parentNode.nodes && parentNode.nodes.length > 0) {
                    for (let i = 0; i < parentNode.nodes.length; i++) {
                        if (node.ref === parentNode.nodes[i].ref) {
                            count++;
                        }
                    }
                    if (node.maxOccurs == count) {
                        return 'disabled disable-link';
                    }
                }
            } else if (node.maxOccurs === undefined) {
                if (parentNode.nodes && parentNode.nodes.length > 0) {
                    for (let i = 0; i < parentNode.nodes.length; i++) {
                        if (node.ref === parentNode.nodes[i].ref) {
                            return 'disabled disable-link';
                        }
                    }
                }
            }
        };
        // attibutes popover
        vm.tooltip = function (node) {
            $('[data-toggle="tooltip-data"]').tooltip({
                trigger: 'hover focus manual',
                html: true,
                delay: {'show': 300, 'hide': 300}
            });
            vm.tooltipAttrData = '';
            if (node && node.attributes && node.attributes.length > 0) {
                for (let i = 0; i < node.attributes.length; i++) {
                    if (node.attributes[i].data) {
                        if (node.attributes[i].name !== 'password') {
                            let temp = '<div>';
                            temp = temp + node.attributes[i].name;
                            temp = temp + ' = ';
                            temp = temp + node.attributes[i].data;
                            temp = temp + '</div>';
                            vm.tooltipAttrData = vm.tooltipAttrData + temp;
                        } else {
                            let temp = '<div>';
                            temp = temp + node.attributes[i].name;
                            temp = temp + ' = ';
                            temp = temp + vm.passwordLabel(node.attributes[i].data);
                            temp = temp + '</div>';
                            vm.tooltipAttrData = vm.tooltipAttrData + temp;
                        }
                    }
                }
            }

            if (node && node.values && node.values.length > 0) {
                for (let i = 0; i < node.values.length; i++) {
                    if (node.values[i].data) {
                        if (node.ref !== 'password') {
                            let temp = '<div>';
                            temp = temp + node.values[i].data;
                            temp = temp + '</div>';
                            vm.tooltipAttrData = vm.tooltipAttrData + temp;
                        } else {
                            let temp = '<div>';
                            temp = temp + vm.passwordLabel(node.values[i].data);
                            temp = temp + '</div>';
                            vm.tooltipAttrData = vm.tooltipAttrData + temp;
                        }
                    }
                }
            }

            if (vm.tooltipAttrData != '') {
                let x = $.parseHTML(vm.tooltipAttrData);
                let htmlTag = document.createElement('div');
                if (x != null && x.length > 0) {
                    x.forEach(function (html) {
                        htmlTag.append(html);
                    });
                }
                vm.tooltipAttrData = htmlTag;
            }

        };

        vm.gotoKeyRecursion = function (node, child) {
            if (node !== undefined) {
                if (node.refer === child.ref) {
                    if (child.key) {
                        for (let i = 0; i < child.attributes.length; i++) {
                            if (child.attributes[i].name === child.key) {
                                if (node.data === child.attributes[i].data) {
                                    vm.getData(child);
                                    vm.selectedNode = child;
                                    vm.refElement = node;
                                }
                            }
                        }
                    } else {
                        for (let i = 0; i < child.nodes.length; i++) {
                            vm.gotoKeyRecursion(node, child.nodes[i]);
                        }
                    }
                } else {
                    for (let i = 0; i < child.nodes.length; i++) {
                        vm.gotoKeyRecursion(node, child.nodes[i]);
                    }
                }
            }
        };

        vm.gotoKeyref = function (node) {
            if (node !== undefined) {
                if (node.refElement === vm.nodes[0].ref) {
                    if (vm.nodes[0].keyref) {
                        for (let i = 0; i < vm.nodes[0].attributes.length; i++) {
                            if (vm.nodes[0].attributes[i].name === vm.nodes[0].keyref) {
                                if (node.data === vm.nodes[0].attributes[i].data) {
                                    vm.getData(vm.nodes[0]);
                                    vm.selectedNode = vm.nodes[0];
                                }
                            }
                        }
                    } else {
                        for (let i = 0; i < vm.nodes[0].nodes.length; i++) {
                            vm.gotoKeyrefRecursion(node, vm.nodes[0].nodes[i]);
                        }
                    }
                } else if (vm.refElement && vm.refElement.parent === vm.nodes[0].ref) {
                    if (vm.nodes[0].keyref) {
                        for (let i = 0; i < vm.nodes[0].attributes.length; i++) {
                            if (vm.nodes[0].attributes[i].name === vm.nodes[0].keyref) {
                                if (node.data === vm.nodes[0].attributes[i].data) {
                                    vm.getData(vm.nodes[0]);
                                    vm.selectedNode = vm.nodes[0];
                                }
                            }
                        }
                    } else {
                        for (let i = 0; i < vm.nodes[0].nodes.length; i++) {
                            vm.gotoKeyrefRecursion(node, vm.nodes[0].nodes[i]);
                        }
                    }
                } else {
                    for (let i = 0; i < vm.nodes[0].nodes.length; i++) {
                        vm.gotoKeyrefRecursion(node, vm.nodes[0].nodes[i]);
                    }
                }
            }
        };

        vm.gotoKeyrefRecursion = function (node, child) {
            if (node !== undefined) {
                if (node.refElement === child.ref) {
                    if (child.keyref) {
                        for (let i = 0; i < child.attributes.length; i++) {
                            if (child.attributes[i].name === child.keyref) {
                                if (node.data === child.attributes[i].data) {
                                    vm.selectedNode = child;
                                    vm.getData(child);
                                }
                            }
                        }
                    } else {
                        for (let i = 0; i < child.nodes.length; i++) {
                            vm.gotoKeyrefRecursion(node, child.nodes[i]);
                        }
                    }
                } else if (vm.refElement && vm.refElement.parent === child.ref) {
                    if (child.keyref) {
                        for (let i = 0; i < child.attributes.length; i++) {
                            if (child.attributes[i].name === child.keyref) {
                                if (node.data === child.attributes[i].data) {
                                    vm.selectedNode = child;
                                    vm.getData(child);
                                }
                            }
                        }
                    } else {
                        for (let i = 0; i < child.nodes.length; i++) {
                            vm.gotoKeyrefRecursion(node, child.nodes[i]);
                        }
                    }
                } else {
                    for (let i = 0; i < child.nodes.length; i++) {
                        vm.gotoKeyrefRecursion(node, child.nodes[i]);
                    }
                }
            }
        };

        // validate xml
        function validate() {
            vm.autoValidate();
            if (_.isEmpty(vm.nonValidattribute)) {
                validateSer();
                if ($scope.validConfig) {
                    toasty.success({
                        title: 'Element : ' + vm.nodes[0].ref,
                        message: 'XML is valid'
                    });
                }
            } else {
                vm.gotoErrorLocation();
                popToast(vm.nonValidattribute);
                if (vm.nonValidattribute.name) {
                    vm.validateAttr('', vm.nonValidattribute);
                }
            }
        }

        function validateSer() {
            vm._xml = _showXml();
            EditorService.validateXML({
                jobschedulerId: vm.schedulerIds.selected,
                objectType: vm.objectType,
                configuration: vm._xml
            }).then(function (res) {
                $scope.changeValidConfigStatus(true);
            }, function (error) {
                $scope.changeValidConfigStatus(false);
                if (error.data && error.data.error) {
                    toasty.error({
                        msg: error.data.error.message,
                        clickToClose: true
                    });
                }
            });
        }

        // import xml model
        function importXML() {
            vm.importObj = {assignXsd: vm.objectType};
            let modalInstance = $uibModal.open({
                templateUrl: 'modules/configuration/views/import-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                size: 'lg',
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                if (vm.importObj.assignXsd) {
                    if (!ok(vm.uploadData)) {
                        vm.selectedXsd = vm.importObj.assignXsd;
                        vm.reassignSchema();
                        setTimeout(function () {
                            createJSONFromXML(vm.uploadData);
                            storeXML();
                        }, 600);
                        if (uploader.queue && uploader.queue.length > 0) {
                            uploader.queue[0].remove();
                        }
                        vm.submitXsd = true;
                        vm.isDeploy = true;
                        vm.XSDState = {};
                        vm.prevXML = '';
                        hideButtons();
                    } else {
                        openXMLDialog(vm.uploadData);
                        vm.importObj = {};
                        if (uploader.queue && uploader.queue.length > 0) {
                            uploader.queue[0].remove();
                        }
                    }
                }
            }, function () {
                vm.importObj = {};
                if (uploader.queue && uploader.queue.length > 0) {
                    uploader.queue[0].remove();
                }
            });
        }

        function openXMLDialog(data) {
            vm.isEditable = true;
            vm.invalidXML = {};
            vm.invalidXML.xml = angular.copy(vkbeautify.xml(data));
            let modalInstance = $uibModal.open({
                templateUrl: 'modules/configuration/views/show-dialog.html',
                controller: 'DialogCtrl1',
                scope: vm,
                size: 'lg',
                backdrop: 'static'
            });
            modalInstance.result.then(function (res) {
                if (!ok(vm.invalidXML.xml)) {
                    loadTreeFromVXML();
                } else {
                    openXMLDialog(vm.invalidXML.xml);
                }
            }, function () {

            });
        }

        function loadTreeFromVXML() {
            vm.reassignSchema();
            setTimeout(function () {
                createJSONFromXML(vm.invalidXML.xml);
            }, 600);
            vm.submitXsd = true;
            vm.isDeploy = true;
            vm.XSDState = {};
            vm.prevXML = '';
            hideButtons();
        }
        // open new Confimation model
        function newFile() {
            vm.delete = false;
            if (vm.submitXsd && vm.objectType !== 'OTHER') {
                let modalInstance = $uibModal.open({
                    templateUrl: 'modules/configuration/views/confirmation-dialog.html',
                    controller: 'DialogCtrl1',
                    scope: vm,
                    backdrop: 'static'
                });
                modalInstance.result.then(function (res) {
                    if (res === 'yes') {
                        save();
                        vm.nodes = [];
                        newConf();
                    } else {
                        vm.nodes = [];
                        vm.selectedNode = [];
                        newConf();
                    }
                }, function () {

                });
            } else {
                if(vm.objectType === 'OTHER') {
                    vm.nodes = [];
                    vm.selectedNode = [];
                    createNewTab();
                } else {
                    newConf();
                }
            }
        }

        function createNewTab() {
            let tabs;
            if(vm.tabsArray.length === 0) {
                tabs = angular.copy({id:-1, name: 'edit1'});
            } else {
                tabs = angular.copy(vm.tabsArray[vm.tabsArray.length-1]);
                tabs.id = Math.sign(angular.copy(tabs.id - 1)) === 1 ? -1 : angular.copy(tabs.id - 1);
                if(tabs.name.match(/[a-zA-Z]+/g)[0] === 'edit') {
                    tabs.name = angular.copy('edit' + (parseInt(tabs.name.match(/\d+/g)[0]) + 1));
                } else {
                    tabs.name =  'edit1';
                }
            }
            vm.tabsArray.push(tabs);
            vm.activeTab = tabs;
            readOthersXSD(tabs.id)
        }

        vm.changeTab = function (data) {
            vm.activeTab = data;
            readOthersXSD(data.id);
        };

        function readOthersXSD(id) {
            vm.nodes = [];
            vm.selectedNode = [];
            EditorService.readXML({
                jobschedulerId: vm.schedulerIds.selected,
                "objectType": vm.objectType,
                id: id
            }).then(function (res) {
                if (!res.configuration) {
                    vm.showSelectSchema = true;
                    vm.submitXsd = false;
                    vm.otherSchema = res.schemas;
                } else {
                    vm.showSelectSchema = false;
                    if (!ok(res.configuration.configuration)) {
                        vm.path = res.configuration.schema;
                        vm.nodes = [];
                        vm.isLoading = true;
                        vm.submitXsd = true;
                        let tXml = removeComment(res.configuration.configuration);
                        vm.prevXML = tXml;
                        EditorService.getXSD(vm.path).then(function (data) {
                            loadTree(data.data, true);
                        });
                        setTimeout(function () {
                            createJSONFromXML(res.configuration.configuration);
                        }, 600);
                        hideButtons();
                    } else {
                        openXMLDialog(res.configuration.configuration);
                    }
                }
            });
        }

        function newConf() {
            EditorService.readXML({
                jobschedulerId: vm.schedulerIds.selected,
                "objectType": vm.objectType,
                configuration: vm._xml
            }).then(function (res) {
                if (res.schema) {
                    EditorService.getXSD(res.schema).then(function (data) {
                        loadTree(data.data, false);
                        vm.submitXsd = true;
                        vm.isDeploy = false;
                        vm.XSDState = res.state;
                        vm.XSDState.modified = res.modified;
                        vm.prevXML = '';
                        hideButtons();
                    }, function (err) {
                        vm.submitXsd = false;
                        vm.isLoading = false;
                        vm.XSDState = res.state;
                        vm.xsdState = 'null';
                        if (res.warning) {
                            vm.XSDState = Object.assign(vm.XSDState, {warning: res.warning});
                        }
                        vm.error = err;
                        hideButtons();
                    });
                }
            }, function (err) {
                vm.submitXsd = false;
                vm.isLoading = false;
                vm.XSDState = '';
                vm.error = err;
                toasty.error({
                    msg: err.data.error.message,
                    clickToClose: true
                });
                hideButtons();
            });
        }

        function deployXML() {
            vm.autoValidate();
            vm._xml = _showXml();
            if (_.isEmpty(vm.nonValidattribute)) {
                EditorService.deployXML({
                    jobschedulerId: vm.schedulerIds.selected,
                    "objectType": vm.objectType,
                    configuration: vm._xml
                }).then(function (res) {
                    vm.prevXML = vm._xml;
                    vm.isDeploy = true;
                    let state = Object.assign({}, {message: res.message});
                    vm.XSDState = state;
                    $scope.changeValidConfigStatus(true);
                    if (res.deployed) {
                        vm.XSDState.modified = res.deployed;
                        toasty.success({
                            msg: gettextCatalog.getString('xml.message.successfullyDeployed'),
                        });
                    }
                    hideButtons();
                }, function (error) {
                    toasty.error({
                        msg: error.data.error.message,
                        clickToClose: true
                    });
                });
            } else {
                vm.gotoErrorLocation();
                popToast(vm.nonValidattribute);
                if (vm.nonValidattribute.name) {
                    vm.validateAttr('', vm.nonValidattribute);
                }
            }
        }

        // save xml
        function save() {
            let xml = _showXml();
            let name = vm.nodes[0].ref + '.xml';
            let fileType = 'application/xml';
            let blob = new Blob([xml], {type: fileType});
            saveAs(blob, name);
        }

        // create Xml from Json
        function showXml() {
            vm._xml = _showXml();
            let modalInstance = $uibModal.open({
                templateUrl: 'modules/configuration/views/show-dialog.html',
                controller: 'DialogCtrl1',
                scope: vm,
                size: 'lg',
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
            });
        }

        function createTJson(json) {
            let arr = [];
            for (let i = 0; i < json.length; i++) {
                if (json[i].parent === '#') {
                    if (!json[i].nodes) {
                        json[i].nodes = [];
                    }
                    arr.push(json[i]);
                } else if (json[i].parent !== '#') {
                    recur(json[i], arr[0]);
                }
            }
            printTreeArray(arr);
        }

        function recur(node, list) {
            if ((node.parent === list.ref || node.parent === list.rootNode) && node.grandFather === list.parent) {
                if (!node.nodes) {
                    node.nodes = [];
                }
                list.nodes.push(node);
            } else {
                for (let j = 0; j < list.nodes.length; j++) {
                    recur(node, list.nodes[j]);
                }
            }
        }

        function printTreeArray(rootChildrArr) {
            vm.displayNodes = rootChildrArr;
            vm.options = {
                displayField: 'ref',
                isExpandedField: 'expanded',
            };
            vm.innerTreeStruct = '';
            innerH();
        }

        function innerH() {
            vm.innerTreeStruct = '';
            vm.innerTreeStruct = vm.innerTreeStruct + '<div class=\'keysearch\'>' + vm.displayNodes[0].ref + '</div>';
            let temp = vm.displayNodes[0].nodes;
            let temp2;
            for (let i = 0; i < temp.length; i++) {
                vm.innerTreeStruct = vm.innerTreeStruct + '<div class=\'ml-1 keysearch\'>' + temp[i].ref + '</div>';
                if (temp[i].nodes && temp[i].nodes.length > 0) {
                    temp2 = temp[i].nodes;
                    printCN(temp2);
                }
            }
        }

        function printCN(node) {
            let temp;
            let count = 1;
            for (let i = 0; i < node.length; i++) {
                vm.innerTreeStruct = vm.innerTreeStruct + '<div class=\'keysearch\' style="margin-left: ' + (10 * count) + 'px">'
                    + node[i].ref + '</div>';
                if (node[i].nodes && node[i].nodes.length > 0) {
                    temp = node[i].nodes;
                    count++;
                    printChNode(temp);
                }
            }

            function printChNode(_node) {
                for (let i = 0; i < _node.length; i++) {
                    vm.innerTreeStruct = vm.innerTreeStruct + '<div class=\'keysearch\' style="margin-left: ' + (10 * count) + 'px">'
                        + _node[i].ref + '</div>';
                    if (_node[i].nodes && _node[i].nodes.length > 0) {
                        count++;
                        printChNode(_node[i].nodes);
                    }
                }
            }
        }

        // Search in show all child nodes.
        vm.search = function (sData) {
            vm.counter = 0;
            document.getElementById('innertext').innerHTML = '';
            innerH();
            setTimeout(function () {
                document.getElementById('innertext').innerHTML = vm.innerTreeStruct;
                let inputText = document.getElementsByClassName('keysearch');
                for (let i = 0; i < inputText.length; i++) {
                    let innerHTML = inputText[i].innerHTML;
                    let pattern = new RegExp('(' + sData + ')', 'gi');
                    let searchPara = innerHTML.toString();
                    if (pattern.test(searchPara)) {
                        innerHTML = searchPara.replace(pattern, function (str) {
                            return '<span class=\'highlight\'>' + str + '</span>';
                        });
                        inputText[i].innerHTML = innerHTML;
                    }
                    if (searchPara.match(pattern)) {
                        let c = searchPara.match(pattern).length;
                        vm.counter = vm.counter + c;
                    }
                }
            }, 0);
        };

        function initEditor(data) {
            try {
                if (vm.ckEditor) {
                    vm.ckEditor.destroy();
                }
                vm.ckEditor = CKEDITOR.replace(data.uuid.toString(), {
                    toolbar: [
                        {name: 'document', items: ['Source']},
                        {
                            name: 'clipboard',
                            items: ['Cut', 'Copy', 'Paste', 'Undo', 'Redo']
                        },
                        {name: 'editing', items: ['Find', 'Replace', '-']},
                        {
                            name: 'basicstyles',
                            items: ['Bold', 'Italic', 'Underline']
                        },
                        {
                            name: 'paragraph',
                            items: ['NumberedList', 'BulletedList', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock']
                        },
                        {name: 'insert', items: ['Table']},
                        {name: 'styles', items: ['Styles', 'Format']},
                        {name: 'links', items: ['Link', 'Unlink']},
                        {name: 'styles', items: ['Font', 'FontSize']},
                    ],
                    allowedContent: true,
                    bodyClass: vm.userPreferences.theme !== 'light' && vm.userPreferences.theme !== 'lighter' || !vm.userPreferences.theme ? 'white_text' : 'dark_text',
                });
            } catch (e) {
                console.log(e);
            }

            try {
                if (vm.ckEditor) {
                    vm.ckEditor.on('change', function () {
                        vm.myContent = vm.ckEditor.getData();
                        parseEditorText(vm.myContent, vm.selectedNode);
                    });
                }
            } catch (e) {
                console.log(e);
            }
            if (data.data) {
                if (CKEDITOR.instances[data.uuid.toString()]) {
                    CKEDITOR.instances[data.uuid.toString()].setData(data.data);
                }
            } else {
                if (CKEDITOR.instances[data.uuid.toString()]) {
                    CKEDITOR.instances[data.uuid.toString()].setData('');
                }
            }
        }

        function parseEditorText(evn, nodes) {
            if (evn.match(/<[^>]+>/gm)) {
                let x = evn.replace(/<[^>]+>/gm, '');
                if (x !== '&nbsp;') {
                    nodes.values[0] = Object.assign(nodes.values[0], {data: evn});
                    vm.myContent = nodes.values[0].data;
                    vm.error = false;
                } else {
                    delete nodes.values[0].data;
                }
            } else {
                delete nodes.values[0].data;
            }
        }

        //delete config
        function deleteConf() {
            vm.delete = true;
            let modalInstance = $uibModal.open({
                templateUrl: 'modules/configuration/views/confirmation-dialog.html',
                controller: 'DialogCtrl1',
                scope: vm,
                backdrop: 'static'
            });
            modalInstance.result.then(function (res) {
                if (res === 'yes') {
                    del();
                } else {
                    modalInstance.close();
                }
            }, function () {

            });
        }

        function del() {
            EditorService.deleteXML({
                jobschedulerId: vm.schedulerIds.selected,
                "objectType": vm.objectType,
            }).then(function (res) {
                if (res.configuration) {
                    if (!ok(res.configuration)) {
                        vm.nodes = [];
                        vm.isLoading = true;
                        vm.XSDState = res.state;
                        vm.submitXsd = true;
                        vm.isDeploy = res.state.deployed;
                        if (res.state.deployed) {
                            $scope.changeValidConfigStatus(true);
                        }
                        let tXml = removeComment(res.configuration);
                        vm.prevXML = tXml;
                        EditorService.getXSD(vm.path).then(function (data) {
                            loadTree(data.data, true);
                            setTimeout(function () {
                                createJSONFromXML(res.configuration);
                            }, 600);
                            hideButtons();
                        }, function (error) {
                            vm.errpr = error;
                        });
                    }
                } else {
                    vm.submitXsd = false;
                    vm.isLoading = false;
                    vm.XSDState = res.state;
                    openXMLDialog();
                    hideButtons();
                }
            }, function (error) {
                toasty.error({
                    msg: error.data.error.message,
                    clickToClose: true
                });
            });
        }

        // Show all Child Nodes and search functionalities.
        vm.showAllChildNode = function (node) {
            vm.showAllChild = [];
            let _node = {ref: node.ref, parent: '#'};
            vm.showAllChild.push(_node);
            getCNodes(_node);
            createTJson(vm.showAllChild);
            let modalInstance = $uibModal.open({
                templateUrl: 'modules/configuration/views/show-childs-dialog.html',
                controller: 'DialogCtrl1',
                scope: vm,
                size: 'lg',
                backdrop: 'static'
            });
            modalInstance.result.then(function () {

            }, function () {

            });
            setTimeout(function () {
                if (document.getElementById('innertext'))
                    document.getElementById('innertext').innerHTML = vm.innerTreeStruct;
            }, 100)
        };

        vm.$on('save', function () {
            if (vm.nodes && vm.nodes.length > 0)
                save();
        });

        vm.$on('validate', function () {
            if (vm.nodes && vm.nodes.length > 0)
                validate();
        });

        vm.$on('showXml', function () {
            if (vm.nodes && vm.nodes.length > 0)
                showXml();
        });

        vm.$on('importXML', function () {
            importXML();
        });

        vm.$on('newFile', function () {
            newFile();
        });

        vm.$on('deployXML', function () {
            deployXML();
        });

        vm.$on('gotoErrorLocation', function () {
            vm.gotoErrorLocation();
        });

        vm.$on('deleteXML', function () {
            deleteConf();
        });

        function ok(conf) {
            try {
                var dom_parser = new DOMParser();
                var dom_document = dom_parser.parseFromString(conf, 'text/xml');
                if (dom_document.documentElement.getElementsByTagName('parsererror').length > 0 || dom_document.documentElement.nodeName === 'parsererror') {
                    if (dom_document.documentElement.getElementsByTagName('parsererror').length > 0) {
                        toasty.error({
                            title: 'Invalid xml' + dom_document.documentElement.getElementsByTagName('parsererror')[0].innerText,
                            timeout: 10000
                        });
                    } else {
                        toasty.error({
                            title: 'Invalid xml' + dom_document.documentElement.firstChild.nodeValue,
                            timeout: 10000
                        });
                    }
                    return true;
                } else {
                    return false;
                }
            } catch (e) {
                toasty.error({
                    title: 'Invalid xml ' + dom_document.documentElement.getElementsByTagName('parsererror')[0].innerText,
                    msg: e,
                    timeout: 10000
                });
                return true;
            }
        }
        vm.checkBoxCheck = function (data) {
            if (data == 'liveVersion') {
                vm.xmlVersionObj = {draftVersion: false, liveVersion: true};
            } else {
                vm.xmlVersionObj = {draftVersion: true, liveVersion: false};
            }
        };

        vm.showDiff = function () {
            vm.xmlVersionObj = {draftVersion: true, liveVersion: false};
            vm.draftXml = vm.prevXML;
            let liveVersion;
            EditorService.readXML({
                jobschedulerId: vm.schedulerIds.selected,
                "objectType": vm.objectType,
                forceLive: true
            }).then(function (res) {
                if (res.configuration) {
                    liveVersion = res.configuration;
                    vm.liveXml = EditorService.diff(vm.draftXml, res.configuration);
                } else {
                    vm.submitXsd = false;
                    vm.isLoading = false;
                    vm.XSDState = res.state;
                    vm.XSDState = Object.assign(vm.XSDState, {warning: res.warning});
                    hideButtons();
                }
            }, function (error) {
                toasty.error({
                    msg: error.data.error.message,
                    clickToClose: true
                });
            });
            let modalInstance = $uibModal.open({
                templateUrl: 'modules/configuration/views/diff-dialog.html',
                controller: 'DialogCtrl1',
                scope: $scope,
                size: 'diff',
                backdrop: 'static',
            });
            modalInstance.result.then(function () {
                if (vm.xmlVersionObj.liveVersion) {
                    del();
                }
            }, function () {
            });
        };

        vm.getFirstNotEmptyAttribute = function (attrs) {
            if (attrs && attrs.length > 0) {
                for (let i = 0; i < attrs.length; i++) {
                    if (attrs[i].data) {
                        return attrs[i].name + '=' + attrs[i].data;
                    } else {
                        return '';
                    }
                }
            } else {
                return '';
            }
        };

        vm.autosize = function (evt) {
            if (evt) {
                var el = document.getElementById(evt);
                if (el !== null) {
                    setTimeout(function () {
                        el.style.cssText = 'height:19px; padding:4px 8px; overflow:hidden';
                        el.style.cssText = 'height:' + el.scrollHeight + 'px';
                    }, 0);
                }
            }
        };

        vm.checkForTab = function (id) {
            $(document).delegate('#' + id, 'keydown', function (e) {
                var keyCode = e.keyCode || e.which;

                if (keyCode == 9) {
                    e.preventDefault();
                    var start = this.selectionStart;
                    var end = this.selectionEnd;

                    // set textarea value to: text before caret + tab + text after caret
                    $(this).val($(this).val().substring(0, start)
                        + "\t"
                        + $(this).val().substring(end));

                    // put caret at right position again
                    this.selectionStart =
                        this.selectionEnd = start + 1;
                }
            });
        };

        vm.showPassword = function (data) {
            data.pShow = !data.pShow;
        };

        //hide documentation
        vm.hideDocumentation = function (data) {
            data.show = !data.show;
        };

        vm.hideError = function () {
            vm.error = false;
        };
        // goto error location
        vm.gotoErrorLocation = function () {
            if (vm.errorLocation && vm.errorLocation.ref) {
                vm.getData(vm.errorLocation);
                vm.selectedNode = vm.errorLocation;
                vm.errorLocation = {};
            }
        };

        /** ---------------------------tree dropdown actions -------------*/

        vm.addContent = function (data) {
            if (data && data[0] && data[0].data !== undefined) {
                vm.myContent = data[0].data;
            } else {
                vm.myContent = '';
            }
            if (data && data[0].parent === 'Body') {
                setTimeout(function () {
                    initEditor(data[0]);
                }, 10);
            }
        };

        vm.passwordLabel = function (password) {
            if (password !== undefined) {
                return '********';
            }
        };
    }
})();
