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

    EditorConfigurationCtrl.$inject = ['$scope', '$rootScope', '$state', 'CoreService', "$location"];

    function EditorConfigurationCtrl($scope, $rootScope, $state, CoreService, $location) {
        $scope.configFilters = CoreService.getConfigurationTab();
        $scope.validConfig = false;
        $scope.selectedDropdown = 'yade';
        $scope.isActive = false;
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
                    let top = dom.position().top + 15;
                    const flag = top < 78;
                    top = top - $(window).scrollTop();
                    dom.css({'height': 'calc(100vh - ' + (top - 10) + 'px'});
                    if (top < 96) {
                        top = 96;
                    }
                    $('.sticky').css('top', top);
                    $('.tree-block').height('calc(100vh - ' + top + 'px' + ')');
                    if (count < 5) {
                        if (flag) {
                            recursiveCheck();
                        } else {
                            let intval = setInterval(function () {
                                recursiveCheck();
                                clearInterval(intval);
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

        $scope.isDeployBtnDisbaled = false;
        $scope.showDeploy = function () {
            $scope.isDeployBtnDisbaled = true;
            $rootScope.$broadcast('deployables');
            setTimeout(function () {
                $scope.isDeployBtnDisbaled = false;
            }, 1000);
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

        $scope.$on('set-dropdown', function (event, data) {
            $scope.selectedDropdown = data;
        });
        $scope.isActive = function () {
            if ($location.path() == '/configuration/yade' || $location.path() == '/configuration/notification' || $location.path() == '/configuration/others') {
                return true;
            }
        }
    }

    JOEEditorCtrl.$inject = ['$scope', 'SOSAuth', 'CoreService', 'EditorService', 'orderByFilter', '$uibModal','clipboard'];

    function JOEEditorCtrl($scope, SOSAuth, CoreService, EditorService, orderBy, $uibModal, clipboard) {
        const vm = $scope;
        vm.tree = [];
        vm.filter_tree = {};
        vm.filterTree1 = [];
        vm.treeDeploy = {};
        vm.deployables = [];
        vm.isloaded = true;

        vm.deployableObjects = {handleRecursively: true};
        vm.expanding_property = {
            field: 'name'
        };

        hljs.configure({
            useBR: true
        });

        function init(reload) {
            if(vm.isloaded) {
                vm.isloaded = false;
                EditorService.tree({
                    jobschedulerId: vm.schedulerIds.selected,
                    types: ['JOE']
                }).then(function (res) {
                    vm.isloaded = true;
                    if (reload) {
                        vm.tree = vm.recursiveTreeUpdate(res.folders, vm.tree);
                    } else {
                        vm.tree = res.folders;
                        if (vm.tree.length > 0) {
                            vm.tree[0].expanded = true;
                            updateObjects(vm.tree[0]);
                        }
                    }
                }, function () {
                    vm.isloaded = true;
                });
            }
        }

        vm.$on('deployables', function () {
            vm.deployTree = _buildDeployTree();
            vm.deployables = [];
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
                vm.deployables.push({});
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
                        let x = res.deployables[i].folder.split('/');
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
                                    if (vm.deployables[0].folders.filter(e => e.name == array[i].name).length == 0) {
                                        vm.deployables[0].folders.push(array[i]);
                                        array.splice(i, 1);
                                        i--;
                                    } else {
                                        let a = vm.deployables[0].folders.filter(e => e.name == array[i].name);
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
                if (tempArray.length > 0) {
                    for (let i = 0; i < array.length; i++) {
                        let regex = "(\\" + array[i].path + "\\/)";
                        for (let j = 0; j < tempArray.length; j++) {
                            if (tempArray[j].path && tempArray[j].path.match(regex)) {
                                if (array[i].path && tempArray[j].path.split('/').length == (array[i].path.split('/').length + 1)) {
                                    if (array[i].folders) {
                                        if (array[i].folders.filter(e => e.name === tempArray[j].name).length == 0) {
                                            array[i].folders.push(tempArray[j]);
                                            tempArray.splice(j, 1);
                                            j--;
                                            break;
                                        } else {
                                            var x = array[i].folders.filter(e => e.name === tempArray[j].name);
                                            x[0] = Object.assign(x[0], tempArray[j]);
                                            tempArray.splice(j, 1);
                                            j--;
                                            break;
                                        }
                                    } else {
                                        Object.assign(array[i], {folders: []});
                                        array[i].folders.push(tempArray[j]);
                                        tempArray.splice(j, 1);
                                        j--;
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }

                if (tempArray.length > 0) {
                    if (array.length > 0) {
                        for (let index = 0; index < array.length; index++) {
                            if (array[index].folders) {
                                recursionToCreateChild(tempArray, array[index].folders);
                            } else {
                                if (vm.deployables[0] && vm.deployables[0].folders) {
                                    for (let i = 0; i < vm.deployables[0].folders.length; i++) {
                                        recursionToCreateChild(tempArray, vm.deployables[0].folders);
                                    }
                                }
                            }
                        }
                    } else {
                        if (vm.deployables[0].folders) {
                            for (let i = 0; i < vm.deployables[0].folders.length; i++) {
                                recursionToCreateChild(tempArray, vm.deployables[0].folders);
                            }
                        }
                    }
                }
                if (tempArray.length > 0) {
                    checkFolder(tempArray);
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
                vm.deployableObjects = {handleRecursively: true};
            });
        }

        function checkFolder(tempArray) {
            for (let i = 0; i < tempArray.length; i++) {
                if (tempArray[i].path != undefined && tempArray[i].path.split('/').length > 2) {
                    let x = tempArray[i].path.split('/').length;
                    let tPath = tempArray[i].path.split('/')[0];
                    if (tPath != '') {
                        let a = vm.deployables.filter(e => e.name === tempArray[i].name);
                        if (a.length > 0) {
                            x--;
                            createFolder(x, a.folders, tempArray[i], tempArray[i].path.split('/'));
                        } else {
                            vm.deployables.push({name: tPath, path: tPath, folders: []});
                            let a = vm.deployables.filter(e => e.name === tempArray[i].name);
                            x--;
                            createFolder(x, a.folders, tempArray[i], tempArray[i].path.split('/'));
                        }
                    } else {
                        x--;
                        let a = [];
                        if (vm.deployables[0] && vm.deployables[0].folders) {
                            a = vm.deployables[0].folders.filter(e => e.name === tempArray[i].name);
                        } else {
                            vm.deployables[0].folders = [];
                        }
                        if (a.length > 0) {
                            x--;
                            createFolder(x, a[0].folders, tempArray[i], tempArray[i].path.split('/'));
                        } else {
                            let tp = tempArray[i].path.split('/')[x - 1];
                            vm.deployables[0].folders.push({name: tp, path: '/' + tp, folders: []});
                            let a = vm.deployables[0].folders.filter(e => e.name === tp);
                            x--;
                            createFolder(x, a[0].folders, tempArray[i], tempArray[i].path.split('/'));
                        }
                    }
                }
            }
        }

        function createFolder(length, array, tObj, pathArray) {
            if (pathArray.length > 0 && length != NaN) {
                pathArray.splice(0, 1);
                let x = pathArray[length - 1];
                if (array.filter(e => e.name == x).length > 0) {
                    let a = array.filter(e => e.name === tObj.name);
                    length--;
                    createFolder(length, a[0].folders, tObj, path);
                } else {
                    length--;
                    if (length > 0) {
                        array.push({name: x, path: x, folders: []});
                        let a = array.filter(e => e.name === x);
                        createFolder(length, a[0].folders, tObj, path);
                    } else {
                        array.push(tObj);
                    }
                }
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


                    if (vm.deployableObjects.handleRecursively && vm.deployableObjects.folders && vm.deployableObjects.folders.length > 0) {
                        let x = vm.deployableObjects.folders.sort();
                        obj.jobschedulerId = vm.schedulerIds.selected;
                        obj.recursive = true;
                        obj.folder = x[0] || '/';
                        EditorService.deploy(obj);
                    }
                    vm.deployableObjects = {handleRecursively: true};
                    //call to store
                }, function () {
                    vm.deployableObjects = {handleRecursively: true};
                });
            } else {

            }
        }

        function recursionToCreateChild(tempArray, array) {
            for (let i = 0; i < array.length; i++) {
                let regex = "(\\" + array[i].path + "\\/)";
                for (let j = 0; j < tempArray.length; j++) {
                    if (tempArray[j].path.match(regex)) {
                        if (tempArray[j].path.split('/').length == (array[i].path.split('/').length + 1)) {
                            if (array[i].folders) {
                                if (array[i].folders.filter(e => e.name === tempArray[j].name).length == 0) {
                                    array[i].folders.push(tempArray[j]);
                                    tempArray.splice(j, 1);
                                    j--;
                                    break;
                                } else {
                                    var x = array[i].folders.filter(e => e.name === tempArray[j].name);
                                    x[0] = Object.assign(x[0], tempArray[j]);
                                    tempArray.splice(j, 1);
                                    j--;
                                    break;
                                }
                            } else {
                                Object.assign(array[i], {folders: []});
                                array[i].folders.push(tempArray[j]);
                                tempArray.splice(j, 1);
                                j--;
                                break;
                            }
                        }
                    }
                }
            }

            if (tempArray.length > 0) {
                for (let index = 0; index < array.length; index++) {
                    if (array[index].folders) {
                        recursionToCreateChild(tempArray, array[index].folders);
                    }
                }
            }
        }

        vm.handleRecursively = function (data) {
            if (data) {
                console.log('handleRecursively Reset')
            }
        };

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
            }else{
                console.log('uncheck the folder checkbox')
            }
        };

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
            _toggleObject(data, 'JOB', isChecked, 'jobs');
            _toggleObject(data, 'JOBCHAIN', isChecked, 'jobChains');
            _toggleObject(data, 'ORDER', isChecked, 'orders');
            _toggleObject(data, 'PROCESSCLASS', isChecked, 'processClasses');
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
            vm.isUnique = true;
            angular.forEach(vm._folders, function (value) {
                if (vm.folder.name == value.name) {
                    vm.isUnique = false;
                }
            })
        };

        vm.createFolder = function (node) {
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
                }).then(function (res) {
                    node.folders.push({name: vm.folder.name, path: _path});
                }, function (err) {
                    console.log(err)
                });
            }, function () {

            });
        };

        vm.toXML = function (json, object, cb) {
            EditorService.toXML(json, object).then(function (res) {
                cb(res.data);
            });
        };

        init();

        function updateObjects(data, cb) {
            if (!data.folders) {
                data.folders = [];
            } else {
                if (data.folders[0].object) {
                    let removeValFromIndex = [0, 1, 2, 3, 4, 5, 6, 7];
                    for (let i = removeValFromIndex.length - 1; i >= 0; i--)
                        data.folders.splice(removeValFromIndex[i], 1);
                }
            }

            let arr = [{name: 'Jobs', object: 'JOB', children: [], parent: data.path},
                {name: 'Job Chains', object: 'JOBCHAIN', children: [], parent: data.path},
                {name: 'Orders', object: 'ORDER', children: [], parent: data.path},
                {name: 'Process Classes', object: 'PROCESSCLASS', children: [], parent: data.path},
                {name: 'Agent Clusters', object: 'AGENTCLUSTER', children: [], parent: data.path},
                {name: 'Schedules', object: 'SCHEDULE', children: [], parent: data.path},
                {name: 'Locks', object: 'LOCK', children: [], parent: data.path},
                {name: 'Pre/Post Processing', object: 'MONITOR', children: [], parent: data.path}];

            data.folders = arr.concat(data.folders);
            EditorService.getFolder({
                jobschedulerId: vm.schedulerIds.selected,
                path: data.path
            }).then(function (res) {
                for (let i = 0; i < arr.length; i++) {
                    if (res.jobs && arr[i].object === 'JOB') {
                        arr[i].children = orderBy(res.jobs, 'name');
                        angular.forEach(arr[i].children, function (child, index) {
                            arr[i].children[index].type = arr[i].object;
                            arr[i].children[index].children = [{
                                name: 'Commands',
                                deleted: child.deleted,
                                param: 'COMMAND'
                            }, {name: 'Pre/Post Processing', deleted: child.deleted, param: 'MONITOR'}];
                        });
                    }
                    if (res.jobChains && arr[i].object === 'JOBCHAIN') {
                        arr[i].children = orderBy(res.jobChains, 'name');
                        angular.forEach(arr[i].children, function (child, index) {
                            arr[i].children[index].type = arr[i].object;
                            arr[i].children[index].children = [{
                                name: 'Steps/Nodes',
                                deleted: child.deleted,
                                param: 'STEPSNODES'
                            }, {name: 'Orders', deleted: child.deleted, param: 'ORDER'}];
                        });
                    }
                    if (res.orders && arr[i].object === 'ORDER') {
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
                    if (res.locks && arr[i].object === 'LOCK') {
                        arr[i].children = orderBy(res.locks, 'name');
                    }
                    if (res.processClasses && arr[i].object === 'PROCESSCLASS') {
                        arr[i].children = orderBy(res.processClasses, 'name');
                    }
                    if (res.agentClusters && arr[i].object === 'AGENTCLUSTER') {
                        arr[i].children = orderBy(res.agentClusters, 'name');
                    }
                    if (res.schedules && arr[i].object === 'SCHEDULE') {
                        arr[i].children = orderBy(res.schedules, 'name');
                    }
                    if (res.monitors && arr[i].object === 'MONITOR') {
                        arr[i].children = orderBy(res.monitors, 'name');
                    }
                    if (arr[i].object !== 'JOB' && arr[i].object !== 'JOBCHAIN') {
                        angular.forEach(arr[i].children, function (child, index) {
                            arr[i].children[index].type = arr[i].object;
                        });
                    }
                }
                if (cb) {
                    cb();
                }
            }, function (err) {
                console.log(err);
                if (cb) {
                    cb();
                }
            });
        }

        vm.expandNode = function (data) {
            if (!data.children)
                updateObjects(data);
        };

        function navFullTree() {
            for (let i = 0; i < vm.tree.length; i++) {
                vm.tree[i].selected1 = false;
                if (vm.tree[i].expanded) {
                    traverseTree1(vm.tree[i]);
                }
            }
        }

        function traverseTree1(data) {
            if (data.folders) {
                for (let i = 0; i < data.folders.length; i++) {
                    data.folders[i].selected1 = false;
                    if (data.folders[i].expanded) {
                        traverseTree1(data.folders[i]);
                    }
                }
            } else {
                if (data.children) {
                    for (let i = 0; i < data.children.length; i++) {
                        data.children[i].selected1 = false;
                        if (data.children[i].expanded) {
                            traverseTree1(data.children[i]);
                        }
                    }
                }
            }
        }

        let lastClickedItem = null;

        vm.getFileObject = function (obj, path, cb) {
            if (!obj.type) {
                return;
            }
            let _path = '';
            if(!path){
                path = vm.path;
            }
            if (path === '/') {
                _path = path + obj.name;
            } else {
                _path = path + '/' + obj.name;
            }
            if(path) {
                EditorService.getFile({
                    jobschedulerId: vm.schedulerIds.selected,
                    path: _path,
                    objectType: obj.type,
                    forceLive: obj.forceLive
                }).then(function (res) {
                    obj = angular.merge(obj, res.configuration);
                    obj.message = res.objectVersionStatus.message._messageCode;
                    obj.path = path;
                    if (obj.type === 'JOBCHAIN') {
                        if (obj.ordersRecoverable === 'yes' || obj.ordersRecoverable === 'true' || obj.ordersRecoverable === '1') {
                            obj.ordersRecoverable = true;
                        }
                        if (obj.distributed === 'yes' || obj.distributed === 'true' || obj.distributed === '1') {
                            obj.distributed = true;
                        }
                    } else if (obj.type === 'JOB') {
                        if (obj.isOrderJob === 'true' || obj.isOrderJob === '1' || obj.isOrderJob === 'yes') {
                            obj.isOrderJob = 'yes';
                        } else {
                            obj.isOrderJob = 'no';
                        }
                        obj.loadUserProfile = obj.loadUserProfile === 'yes' || obj.loadUserProfile === '1' || obj.loadUserProfile === 'true';
                        obj.forceIdleTimeout = obj.forceIdleTimeout === 'yes' || obj.forceIdleTimeout === '1' || obj.forceIdleTimeout === 'true';
                        obj.stopOnError = obj.stopOnError === 'yes' || obj.stopOnError === '1' || obj.stopOnError === 'true';
                        if (obj.settings) {
                            if (obj.settings.mailOnError === 'yes' || obj.settings.mailOnError === '1' || obj.settings.mailOnError === 'true') {
                                obj.settings.mailOnError = 'yes';
                            } else {
                                obj.settings.mailOnError = 'no';
                            }
                            if (obj.settings.mailOnWarning === 'yes' || obj.settings.mailOnWarning === '1' || obj.settings.mailOnWarning === 'true') {
                                obj.settings.mailOnWarning = 'yes';
                            } else {
                                obj.settings.mailOnWarning = 'no';
                            }
                            if (obj.settings.mailOnSuccess === 'yes' || obj.settings.mailOnSuccess === '1' || obj.settings.mailOnSuccess === 'true') {
                                obj.settings.mailOnSuccess = 'yes';
                            } else {
                                obj.settings.mailOnSuccess = 'no';
                            }
                            if (obj.settings.mailOnProcess === 'yes' || obj.settings.mailOnProcess === 'true' || obj.settings.mailOnProcess === '1') {
                                obj.settings.mailOnProcess = 'yes';
                            } else {
                                obj.settings.mailOnProcess = 'no';
                            }
                            if (obj.settings.histroy === 'yes' || obj.settings.histroy === 'true' || obj.settings.histroy === '1') {
                                obj.settings.histroy = 'yes';
                            } else {
                                obj.settings.histroy = 'no';
                            }
                        }
                        if (obj.ignoreSignals) {
                            obj.ignoreSignals = obj.ignoreSignals.split(/\s+/);
                        }

                    } else if (obj.type === 'ORDER') {
                        if (obj.priority)
                            obj.priority = parseInt(obj.priority);
                    }

                    if (cb) {
                        cb(res);
                    }
                }, function (err) {
                    console.log(err);
                    if (cb) {
                        cb();
                    }
                });
            }else{
                console.log('ghhhhhhhhhh')
            }
        };

        vm.treeHandler = function (data, evt) {
            console.log(data)
            if (data.folders || data.deleted) {
                return;
            }
            if (vm.userPreferences.expandOption === 'both' && !data.type) {
                data.expanded = true;
            }
            navFullTree();
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
            console.log('_path', _path)
            if (data.type) {
                lastClickedItem = data;
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
                    parent: evt.$parentNodeScope.$parentNodeScope ? evt.$parentNodeScope.$parentNodeScope.$modelValue : evt.$parentNodeScope.$modelValue
                })
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
                list.forEach(element => {
                    if (element[key]) {
                        arr.push(element[key].split(/(\d+)(?!.*\d)/)[1]);
                    }
                });
                let large = arr[arr.length - 1] || 0;
                for (let i = 1; i < arr.length; i++) {
                    if (angular.isNumber(arr[i]) && large < parseInt(arr[i])) {
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
                vm.createNewJob(object.children, false, object.parent, evt);
            } else if (object.object === 'JOBCHAIN') {
                vm.createNewJobChain(object.children, object.parent, evt);
            } else if (object.object === 'PROCESSCLASS') {
                vm.createNewProcessClass(object.children, object.parent, evt);
            } else if (object.object === 'AGENTCLUSTER') {
                vm.createNewAgentCluster(object.children, object.parent, evt);
            } else if (object.object === 'ORDER') {
                vm.createNewOrder(object.children, null, object.parent, evt);
            } else if (object.object === 'LOCK') {
                vm.createNewLock(object.children, object.parent,evt);
            } else if (object.object === 'SCHEDULE') {
                vm.createNewSchedule(object.children, object.parent,evt);
            } else if (object.object === 'MONITOR') {
                vm.createNewMonitor(object.children, object.parent,evt);
            }
        };

        vm.newObject = function (node, type, evt) {
            node.expanded = true;
            let object;
            for (let i = 0; i < node.folders.length; i++) {
                if(node.folders[i].object) {
                    if (node.folders[i].object === type) {
                        object = node.folders[i];
                        break;
                    }
                }else{
                     break;
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

        vm.createNewJob = function (object, isOrderJob, parent, evt) {
            let obj = {
                name: vm.getName(object, 'job1', 'name', 'job'),
                isOrderJob: isOrderJob,
                script: {language: 'shell'},
                at: 'now',
                type: 'JOB',
                children: [{name: 'Commands', param: 'COMMAND'}, {name: 'Pre/Post Processing', param: 'MONITOR'}]
            };
            object.push(obj);
            obj.parent = parent;
            vm.storeObject(obj, {isOrderJob: isOrderJob, script: {language: 'shell'}}, evt);
        };

        vm.createNewJobChain = function (object, parent, evt) {
            let obj = {
                name: vm.getName(object, 'job_chain1', 'name', 'job_chain'),
                ordersRecoverable: true,
                type: 'JOBCHAIN',
                children: [{name: 'Steps/Nodes', param: 'STEPSNODES'}, {name: 'Orders', param: 'ORDER'}]
            };
            object.push(obj);
            obj.parent = parent;
            vm.storeObject(obj, {ordersRecoverable: obj.ordersRecoverable},evt);
        };

        vm.createNewProcessClass = function (object, parent, evt) {
            let obj = {
                name: vm.getName(object, 'p1', 'name', 'p'),
                maxProcesses: 1,
                type: 'PROCESSCLASS',
            };
            object.push(obj);
            obj.parent = parent;
            vm.storeObject(obj, {maxProcesses: obj.maxProcesses},evt);
        };

        vm.createNewAgentCluster = function (object, parent, evt) {
            let obj = {
                name: vm.getName(object, 'agent1', 'name', 'agent'),
                type: 'AGENTCLUSTER',
            };
            object.push(obj);
            obj.parent = parent;
            vm.storeObject(obj, {},evt);
        };

        vm.createNewOrder = function (object, jobChain, parent, evt) {
            let obj = {
                name: vm.getName(object, '1', 'name', ''),
                at: 'now',
                type: 'ORDER'
            };
            obj.orderId = obj.name;
            if (jobChain) {
                obj.jobChain = jobChain.name;
                obj.name = obj.jobChain + ',' + obj.name;
            }

            object.push(obj);
            obj.parent = parent;
            vm.storeObject(obj, {},evt);
        };

        vm.createNewLock = function (object, parent, evt) {
            let obj = {
                name: vm.getName(object, 'lock1', 'name', 'lock'),
                checkbox: true,
                type: 'LOCK'
            };
            object.push(obj);
            obj.parent = parent;
            vm.storeObject(obj, {},evt);
        };

        vm.createNewSchedule = function (object, parent,evt) {
            let obj = {
                name: vm.getName(object, 'schedule1', 'name', 'schedule'),
                maxProcess: 0,
                type: 'SCHEDULE'
            };
            object.push(obj);
            obj.parent = parent;
            vm.storeObject(obj, {},evt);
        };

        vm.createNewMonitor = function (object, parent, evt) {
            let obj = {
                name: vm.getName(object, 'monitor0', 'name', 'monitor'),
                script: {language: 'java'},
                ordering: object.length > 0 ? (object[object.length - 1].ordering + 1) : 0,
                type: 'MONITOR'
            };
            object.push(obj);
            obj.parent = parent;
            vm.storeObject(obj, {ordering: obj.ordering}, evt);
        };

        let callBack = null, objectType = null;
        vm.getObjectTreeStructure = function (type, cb) {
            callBack = cb;
            objectType = type;
            vm.filterTree1 = [];
            EditorService.tree({
                jobschedulerId: vm.schedulerIds.selected,
                compact: true,
                types: [type]
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
                        if (objectType === 'PROCESSCLASS') {
                            data.processClasses = res.processClasses || [];
                            for (let i = 0; i < data.processClasses.length; i++) {
                                data.processClasses[i].path = data.path === '/' ? data.path + '' + data.processClasses[i].name : data.path + '/' + data.processClasses[i].name;
                            }
                        } else if (objectType === 'AGENTCLUSTER') {
                            data.agentClusters = res.agentClusters || [];
                            for (let i = 0; i < data.agentClusters.length; i++) {
                                data.agentClusters[i].path = data.path === '/' ? data.path + '' + data.agentClusters[i].name : data.path + '/' + data.agentClusters[i].name;
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
            if(vm.obj) {
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

        vm.storeObject = function (obj, configuration, evt) {
            if (obj && obj.type) {
                let _path = '';
                if (obj.parent) {
                    obj.path = obj.parent;
                } else if(!obj.path){
                    obj.path = vm.path;
                }

                if(obj.path) {
                    if (obj.path === '/') {
                        _path = obj.path + obj.name;
                    } else {
                        _path = obj.path + '/' + obj.name;
                    }
                }

                if (_path)
                    EditorService.store({
                        jobschedulerId: vm.schedulerIds.selected,
                        objectType: obj.type,
                        path: _path,
                        configuration: configuration
                    }).then(function (res) {
                        configuration.deployed = false;
                    }, function (err) {
                        console.error(err)
                    });

                if (evt) {
                    navFullTree();
                    obj.selected1 = true;
                    vm.type = obj.type;
                    vm.param = undefined;

                    vm.getFileObject(obj, obj.path, function () {
                        setTimeout(function () {
                            vm.$broadcast('NEW_OBJECT', {
                                data: obj,
                                parent: evt.$parentNodeScope ? evt.$parentNodeScope.$modelValue : evt
                            })
                        }, 0);
                    });
                }
            }
        };

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
            vm.deleteObject(object.type || 'FOLDER', name, path, function () {
                object.deleted = true;
            });
        };

        vm.deleteObject = function (objectType, name, path, cb) {
            if (name) {
                if(!path){
                   path = vm.path
                }
                if (path === '/') {
                    path = path + name;
                } else {
                    path = path + '/' + name;
                }
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
                    path: path
                }).then(function (res) {
                    cb();
                }, function () {

                });
            });
        };

        vm.restoreObject = function (object, evt) {
            let path = '';
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
                if(!path){
                   path = vm.path
                }
                if (path === '/') {
                    path = path + object.name;
                } else {
                    path = path + '/' + object.name;
                }
            } else {
                path = object.path;
            }
            EditorService.restore({
                jobschedulerId: vm.schedulerIds.selected,
                objectType: object.type || 'FOLDER',
                path: path
            }).then(function (res) {
                object.deleted = false;
            });
        };

        vm.renameObject = function (obj, oldName, form) {
            let _path = '', oldPath = '';
            if(obj.name) {
                if (obj.path === '/') {
                    _path = obj.path + obj.name;
                    oldPath = obj.path + oldName;
                } else {
                    _path = obj.path + '/' + obj.name;
                    oldPath = obj.path + '/' + oldName;
                }
                if (_path && oldPath && (_path !== oldPath)) {
                    EditorService.rename({
                        jobschedulerId: vm.schedulerIds.selected,
                        objectType: obj.type,
                        path: _path,
                        oldPath: oldPath,
                    }).then(function () {

                    }, function () {
                        obj.name = oldName;
                        form.$setPristine();
                        form.$setUntouched();
                        form.$invalid = false;
                    });
                }
            }else{
                obj.name = oldName;
            }
        };

        vm.renameOrderObject = function (obj, temp, form) {
            let _path = '', oldPath = '';
            if(obj.orderId) {
                 obj.name = obj.jobChain + ',' +obj.orderId;
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

                    }, function () {
                        obj.orderId = temp.orderId;
                        obj.name = temp.name;
                        form.$setPristine();
                        form.$setUntouched();
                        form.$invalid = false;
                    });
                }
            }else{
                obj.orderId = temp.orderId;
                obj.name = temp.name;
            }
        };

        vm.showXml = function (obj, evt, isEditable) {
            vm.isEditable = isEditable;
            vm.objectXml = {};
            let _path = '', path = '';
            if (evt) {
                if (evt.$parentNodeScope.$modelValue && evt.$parentNodeScope.$modelValue.path) {
                    path = evt.$parentNodeScope.$modelValue.path;
                } else if (evt.$parentNodeScope.$parentNodeScope && evt.$parentNodeScope.$parentNodeScope.$modelValue) {
                    path = evt.$parentNodeScope.$parentNodeScope.$modelValue.path;
                }
            } else if(obj.path){
                path = obj.path;
            }else {
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
                    let json = res.configuration;
                    vm.toXML(json, obj.type, function (xml) {
                        if (!isEditable) {
                            vm.objectXml.xml = EditorService.highlight('xml', xml);
                        } else {
                            vm.objectXml.xml = vkbeautify.xml(xml, 4);
                        }
                        $uibModal.open({
                            templateUrl: 'modules/configuration/views/object-xml-dialog.html',
                            controller: 'DialogCtrl1',
                            scope: vm,
                            backdrop: 'static',
                            size: 'lg'
                        }).result.then(function () {
                            if (!vm.objectXml.error) {
                                EditorService.store({
                                    jobschedulerId: vm.schedulerIds.selected,
                                    objectType: obj.type,
                                    path: _path,
                                    configuration: vm.objectXml.configuration
                                }).then(function (res) {
                                    obj.deployed = false;
                                }, function (err) {
                                    console.error(err)
                                });
                            }
                        }, function () {
                            vm.objectXml = {};
                        })
                    });
                }, function (err) {
                    console.error(err);
                });
            }
        };

        vm.changeXml = function() {
            vm.objectXml.validate = true;
            EditorService.toJSON(vm.objectXml.xml).then(function (res) {
                vm.objectXml.configuration = res.data;
                vm.objectXml.validate = false;
            }, function(){
                vm.objectXml.error = true;
                vm.objectXml.validate = false;
            });
        };

        vm.copyToClipboard = function() {
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

            let timeout = 0;
            if (obj.objectName && lastClickedItem && lastClickedItem.name == obj.objectName) {
                vm.storeObject(lastClickedItem, lastClickedItem);
                timeout = 100;
            }

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

                    EditorService.deploy(obj).then(function (res) {
                        object.deployed = true;
                    });
                }, function () {

                });
            } else {
                setTimeout(function () {
                    EditorService.deploy(obj).then(function (res) {
                        object.deployed = true;
                    });
                }, timeout);
            }
        };

        vm.isSideBarClicked = function (e) {
            e.stopPropagation();
        };

        $scope.$on('event-started', function () {
            if (vm.events && vm.events[0] && vm.events[0].eventSnapshots) {
                for (let i = 0; i < vm.events[0].eventSnapshots.length; i++) {
                    if (vm.events[0].eventSnapshots[i].eventType.match(/FileBase/) && !vm.events[0].eventSnapshots[i].eventId) {
                        init(true);
                        break
                    }else if (vm.events[0].eventSnapshots[i].eventType === 'JoeUpdated' && !vm.events[0].eventSnapshots[i].eventId) {
                        console.log(vm.events[0].eventSnapshots[i]);
                        break
                    }
                }
            }
        });
    }

    JobEditorCtrl.$inject = ['$scope', '$uibModal', 'EditorService', '$interval'];

    function JobEditorCtrl($scope, $uibModal, EditorService, $interval) {
        const vm = $scope;
        vm.filter = {'sortBy': 'name', sortReverse: false};
        vm.jobs = [];
        vm.languages = ['shell', 'java', 'dotnet', 'java:javascript', 'perlScript', 'powershell', 'VBScript', 'scriptcontrol:vbscript', 'javax.script:rhino', 'javax.script:ecmascript', 'javascript'];
        vm.logLevelValue = ['error', 'warn', 'info', 'debug', 'debug1', 'debug2', 'debug3', 'debug4', 'debug5', 'debug6', 'debug7', 'debug8', 'debug9'];
        vm.stderrLogLevelValue = ['error', 'warn', 'info', 'debug', 'debug1', 'debug2', 'debug3', 'debug4', 'debug5', 'debug6', 'debug7', 'debug8', 'debug9'];
        vm.historyOnProcessValue = [0, 1, 2, 3, 4];
        vm.functionalCodeValue = ['spooler_init', 'spooler_open', 'spooler_process', 'spooler_close', 'spooler_exit', 'spooler_on_error', 'spooler_on_success'];
        vm.historyWithLogValue = ['yes', 'no', 'gzip'];
        vm.ignoreSignalsValue = ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGHTRAP', 'SIGABRT', 'SIGIOT', 'SIGBUS', 'SIGFPE', 'SIGKILL', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGPIPE', 'SIGALRM', 'SIGTERM', 'SIGSTKFLT', 'SIGCHLD', 'SIGCONT', 'SIGSTOP', 'SIGTSTP', 'SIGTTIN', 'SIGTTOU', 'SIGURG', 'SIGXCPU', 'SIGXFSZ', 'SIGVTALRM', 'SIGPROF', 'SIGWINCH', 'SIGPOLL', 'SIGIO', 'SIGPWR', 'SIGSYS'];
        vm.priorityValue = ['idle', 'below normal', 'normal', 'above normal', 'high'];
        vm.mailOnDelayAfterErrorValue = ['all', 'first_only', 'last_only', 'first_and_last_only'];

        vm.activeTab = 'tab1';

        vm.changeTab = function(tab, lang) {
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
            vm.processClass = [];
            vm.activeTabInParameter = 'tab11';
            vm.include = {file: 'file'};
            vm.document = {file: 'file'};
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
        };

        vm.createStandaloneJob = function () {
            vm.createNewJob(vm.jobs, false);
        };

        vm.createJob = function (job) {
            vm.getFileObject(job, job.path, function () {
                vm.job = job;
                vm.job.current = true;
                vm._tempJob = angular.copy(vm.job);
            });
        };

        vm.createOrderJob = function () {
            vm.createNewJob(vm.jobs, true);
        };

        vm.removeJob = function (job) {
            for (let i = 0; i < vm.jobs.length; i++) {
                if (vm.jobs[i].name === job.name) {
                    vm.deleteObject('JOB', job.name, job.path, function () {
                        job.deleted = true;
                    });
                    break;
                }
            }
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
            if (!vm.job.params) {
                vm.job.params = {paramList: []}
            } else if (!vm.job.params.paramList) {
                vm.job.params.paramList = [];
            }
            vm.job.params.paramList.push(param);
        };

        vm.removeParams = function (index) {
            vm.job.params.paramList.splice(index, 1);
        };

        vm.addEnvironmentParams = function () {
            let envParam = {
                name: '',
                value: ''
            };
            if (!vm.job.environment) {
                vm.job.environment = {variables: []}
            }
            vm.job.environment.variables.push(envParam);
        };

        vm.removeEnvironmentParams = function (index) {
            vm.job.environment.variables.splice(index, 1);
        };

        vm.addIncludes = function () {
            let includesParam = {
                liveFile: '',
                file: '',
                node: ''
            };
            if (!vm.job.params.includes) {
                Object.assign(vm.job.params, {includes: []});
            }
            vm.job.params.includes.push(includesParam);
        };

        vm.removeIncludes = function (index) {
            vm.job.params.includes.splice(index, 1);
        };

        vm.addLock = function () {
            let param = {
                name: '',
                exclusive: 'yes'
            };
            if (!vm.job.lockUses) {
                vm.job.lockUses = [];
            }
            vm.job.lockUses.push(param);
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
            vm.job.monitorUses.push(param);
        };

        vm.removeMonitor = function (index) {
            vm.job.monitorUses.splice(index, 1);
        };

        vm.addProcessing = function () {
            let param = {
                name: '',
                ordering: 0
            };
            if (!vm.job.processingObject) {
                vm.job.processingObject = {params: []}
            }
            vm.job.processingObject.params.push(param);
        };

        $(document).on('keydown', '.editor-script', function (e) {
            if (e.keyCode == 9) {
                EditorService.insertTab();
                e.preventDefault()
            }
        });

        vm.applyHighlight = function () {
            document.querySelectorAll('div.code').forEach((block) => {
                vm.job.script.content = EditorService.highlight(setLanguage(), block.innerText);
            });
        };

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

        vm.removeProcessing = function (index) {
            vm.job.processingObject.params.splice(index, 1);
        };

        vm.addFile = function () {
            if (vm._tempFile) {
                for (let i = 0; i < vm.job.script.includes.length; i++) {
                    if (angular.equals(vm.job.script.includes[i], vm._tempFile)) {
                        vm.job.script.includes[i] = {
                            liveFile: vm.include.liveFile,
                            file: vm.include.file,
                        };
                        vm._tempFile = undefined;
                        vm.include = {};
                        break;
                    }
                }
            } else {
                if (!vm.job.script.includes) {
                    vm.job.script.includes = [];
                }
                if (vm.include.liveFile)
                    vm.job.script.includes.push(vm.include);
                vm.include = {file: ''};
            }
        };

        vm.editFile = function (data) {
            vm.include = angular.copy(data);
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

        vm.addDocumentFile = function () {
            if (!vm.job.documentation) {
                vm.job.documentation = {includes: []};
            }
            if (vm.document.liveFile)
                vm.job.documentation.includes.push(vm.document);
            vm.document = {file: ''};
        };

        vm.removeDocumentFile = function (document) {
            for (let i = 0; i < vm.job.documentation.includes.length; i++) {
                if (vm.job.documentation.includes[i].file === document.file) {
                    vm.job.documentation.includes.splice(i, 1);
                    break;
                }
            }
        };

        vm.applyDelay = function () {
            if (vm._tempDelay) {
                for (let i = 0; i < vm.job.delayAfterErrors.length; i++) {
                    if (angular.equals(vm.job.delayAfterErrors[i], vm._tempDelay)) {
                        if (vm.job.delayAfterErrors[i].delay == 'delay' || vm.delayAfterErrors.delay == 'delay') {
                            vm.job.delayAfterErrors[i] = {
                                delay: vm.delayAfterErrors.delay,
                                reRunTime: vm.delayAfterErrors.reRunTime,
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
                        vm.delayAfterErrors = {};
                        break;
                    }
                }
            } else {
                if (!vm.job.delayAfterErrors) {
                    vm.job.delayAfterErrors = [];
                }
                if (vm.delayAfterErrors.errorCount)
                    vm.job.delayAfterErrors.push(vm.delayAfterErrors);
                vm.delayAfterErrors = {delay: 'delay'};
            }
        };

        vm.editDelay = function (data) {
            vm.delayAfterErrors = angular.copy(data);
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
                    if (angular.equals(vm.job.startWhenDirectoriesChanged[i], vm._tempDir)) {
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
            if (vm._tempSetback) {
                for (let i = 0; i < vm.job.delayOrderAfterSetbacks.length; i++) {
                    if (angular.equals(vm.job.delayOrderAfterSetbacks[i], vm._tempSetback)) {
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
        };

        vm.editSetback = function (data) {
            vm.setback = angular.copy(data);
            vm._tempSetback = angular.copy(data);
        };

        vm.removeSetback = function (setback) {
            for (let i = 0; i < vm.job.delayOrderAfterSetbacks.length; i++) {
                if (vm.job.delayOrderAfterSetbacks[i].setbackCount === setback.setbackCount && vm.job.startWhenDirectoriesChanged[i].delay === setback.delay) {
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
                if (!vm.job.params || vm.job.params.paramList.length === 0) {
                    vm.addParameter();
                }
                if (!vm.job.environment || vm.job.environment.variables.length === 0) {
                    vm.addEnvironmentParams();
                }
                if (!vm.job.params || !vm.job.params.includes || vm.job.params.includes.length === 0) {
                    vm.addIncludes();
                }
            } else if (title === 'locksUsed') {
                if (!vm.job.lockUses || vm.job.lockUses.length === 0) {
                    vm.addLock();
                }
            } else if (title === 'monitorsUsed') {
                if (!vm.job.monitorUses || vm.job.monitorUses.length === 0) {
                    vm.addMonitor();
                }
            } else if (title === 'runTime') {
                vm.order = vm.job;
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
                    vm.xml = '<run_time/>'
                }
            }
        };

        function storeObject(isCheck) {
             if(!isCheck) {
                 vm.closeSidePanel();
             }
            if (vm.job && vm.job.name) {
                if (vm.job.runTime && typeof vm.job.runTime === 'string') {
                    EditorService.toJSON(vm.job.runTime).then(function (res) {
                        vm.job.runTime = res.data;
                        vm.storeObject(vm.job, vm.job);
                    });
                } else {
                    if (vm._tempJob) {
                        vm._tempJob["$$hashKey"] = angular.copy(vm.job["$$hashKey"]);
                        if (vm.job["selected"] != undefined) {
                            vm._tempJob["selected"] = angular.copy(vm.job["selected"]);
                        }
                        vm._tempJob["selected1"] = angular.copy(vm.job["selected1"]);
                    }
                    if (!angular.equals(vm._tempJob, vm.job)) {
                        vm.storeObject(vm.job, vm.job);
                    }
                }
                 if(!isCheck) {
                     delete vm.job['current'];
                 }
            }
        }

        const interval = $interval(function () {
            storeObject(true);
        }, 30000);

        vm.$on('RUNTIME', function (evt, obj) {
            vm.xml = null;
            EditorService.toJSON(obj.xml).then(function (res) {
                vm.job.runTime = res.data;
                if (obj.calendars && obj.calendars.length > 0) {
                    vm.job.runTime.calendars = JSON.stringify({calendars: obj.calendars});
                }
            });
        });

        vm.$on('NEW_OBJECT', function (evt, job) {
            storeObject();
            initialDefaultValue();
            if (job.data.type) {
                vm.job = job.data;
                if (!vm.job.script) {
                    vm.job.script = {language: 'shell'};
                }
                vm.job.current = true;
                vm._tempJob = angular.copy(vm.job);
                vm.jobs = job.parent.folders[0].children || [];
                vm.processClasses = job.parent.folders[3].children || [];
                vm.locks = job.parent.folders[6].children || [];
                vm.monitors = job.parent.folders[7].children || [];
            } else {
                vm.jobs = job.data.children || [];
                vm.job = undefined;
                vm._tempJob = undefined;
                for (let i = 0; i < job.parent.folders.length; i++) {
                    if (job.parent.folders[i].path == job.data.parent) {
                        vm.processClasses = job.parent.folders[i].folders[3].children || [];
                        vm.locks = job.parent.folders[i].folders[6].children || [];
                        vm.monitors = job.parent.folders[i].folders[7].children || [];
                        break;
                    }
                }
            }
        });

        $scope.$on('$destroy', function () {
            //call store
            $interval.cancel(interval);
            storeObject();
        });
    }

    JobChainEditorCtrl.$inject = ['$scope', '$interval'];

    function JobChainEditorCtrl($scope, $interval) {
        const vm = $scope;
        vm.filter = {'sortBy': 'name', sortReverse: false};
        vm.jobChains = [];
        vm.processClass = [];

        vm.sortBy1 = function (data) {
            vm.filter.sortBy = data;
            vm.filter.sortReverse = !vm.filter.sortReverse;
        };

        vm.createJobChain = function (jobChain) {
            if (jobChain) {
                vm.getFileObject(jobChain, jobChain.path, function () {
                    vm.jobChain = jobChain;
                    vm.jobChain.current = true;
                    vm._tempJobChain = angular.copy(vm.jobChain);
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
            for (let i = 0; i < vm.jobChains.length; i++) {
                if (vm.jobChains[i].name === jobChain.name) {
                    vm.deleteObject('JOBCHAIN', jobChain.name, jobChain.path, function () {
                        jobChain.deleted = true;
                    });
                    break;
                }
            }
        };

        vm.getProcessClassTreeStructure = function (type) {
            vm.getObjectTreeStructure(type === 'processClass' ? 'PROCESSCLASS' : 'AGENTCLUSTER', function (data) {
                vm.jobChain[type] = data.process;
            });
        };

        vm.openSidePanel = function (title) {
            vm.openSidePanelG(title);
            if (title === 'parameter') {
                if (!vm.jobChain.params || vm.jobChain.params.paramList.length === 0) {
                    vm.addParameter();
                }
            }
        };

        vm.addParameter = function () {
            let param = {
                name: '',
                value: ''
            };
            if (!vm.jobChain.params) {
                vm.jobChain.params = {paramList: []}
            }
            vm.jobChain.params.paramList.push(param);
        };

        vm.removeParams = function (index) {
            vm.jobChain.params.paramList.splice(index, 1);
        };

        function storeObject(isCheck) {
            if (!isCheck) {
                vm.closeSidePanel();
            }
            if (vm.jobChain && vm.jobChain.name) {
                if (vm._tempJobChain) {
                    vm._tempJobChain["$$hashKey"] = angular.copy(vm.jobChain["$$hashKey"]);
                    if (vm.jobChain["selected"] != undefined) {
                        vm._tempJobChain["selected"] = angular.copy(vm.jobChain["selected"]);
                    }
                    vm._tempJobChain["selected1"] = angular.copy(vm.jobChain["selected1"]);
                }
                if (!angular.equals(vm._tempJobChain, vm.jobChain)) {
                    vm.storeObject(vm.jobChain, vm.jobChain);
                }
                if (!isCheck) {
                    delete vm.jobChain['current'];
                }
            }
        }

        const interval = $interval(function () {
            storeObject(true);
        }, 30000);

        vm.$on('NEW_OBJECT', function (evt, jobChain) {
            storeObject();
            if (jobChain.data.type) {
                vm.jobChain = jobChain.data;
                vm.jobChain.current = true;
                vm._tempJobChain = angular.copy(vm.jobChain);
                vm.jobChains = jobChain.parent.folders[1].children || [];
                vm.processClasses = jobChain.parent.folders[3].children || [];
            } else {
                vm.jobChains = jobChain.data.children || [];
                vm.jobChain = undefined;
                vm._tempJobChain = undefined;
                for (let i = 0; i < jobChain.parent.folders.length; i++) {
                    if (jobChain.parent.folders[i].path == jobChain.data.parent) {
                        vm.processClasses = jobChain.parent.folders[i].folders[3].children || [];
                        break;
                    }
                }
            }
        });

        $scope.$on('$destroy', function () {
            //call store
            $interval.cancel(interval);
            storeObject();
        });
    }

    OrderEditorCtrl.$inject = ['$scope', 'EditorService', '$interval'];

    function OrderEditorCtrl($scope, EditorService, $interval) {
        const vm = $scope;
        vm.filter = {'sortBy': 'orderId', sortReverse: false};
        vm.orders = [];
        vm.activeTabInParameter = 'tab11';
        vm.jobChainNodes = [];
        vm.nodeparams = [];
        vm.changeActiveParameterTab = function (data) {
            vm.activeTabInParameter = data;
        };
        vm.sortBy1 = function (data) {
            vm.filter.sortBy = data;
            vm.filter.sortReverse = !vm.filter.sortReverse;
        };

        vm.createOrder = function (order) {
            if (order) {
                vm.getFileObject(order, order.path, function () {
                    vm.order = order;
                    vm.order.current = true;
                    vm._tempOrder = angular.copy(vm.order);
                    if (vm.order.jobChain) {
                        vm.getSelectedJobChainData(vm.order.jobChain, order.path);
                    }
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
            for (let i = 0; i < vm.orders.length; i++) {
                if (vm.orders[i].name === order.name) {
                    vm.deleteObject('ORDER', order.name, order.path, function () {
                        order.deleted = true;
                    });
                    break;
                }
            }
        };

        vm.openSidePanel = function (title) {
            vm.openSidePanelG(title);
            if (title === 'parameter') {
                if (!vm.order.params || !vm.order.params.paramList || vm.order.params.paramList.length === 0) {
                    vm.addParameter();
                }
                if (!vm.order.params || !vm.order.params.includes || vm.order.params.includes.length === 0) {
                    vm.addIncludes();
                }
            } else if (title === 'runTime') {
                vm.joe = true;
                if (vm.order.runTime) {
                    if (vm.order.runTime.calendars) {
                        let cal = JSON.parse(vm.order.runTime.calendars);
                        vm.calendars = cal ? cal.calendars : null;
                    }
                    vm.toXML(vm.order.runTime, 'runTime', function (xml) {
                        vm.xml = xml;
                    });
                } else {
                    vm.xml = '<run_time/>'
                }
            } else if (title === 'nodeParameter') {
                let _path = '';
                if (vm.order.path === '/') {
                    _path = vm.order.path + vm.order.name;
                } else {
                    _path = vm.order.path + '/' + vm.order.name;
                }
                EditorService.getFile({
                    jobschedulerId: vm.schedulerIds.selected,
                    path: _path,
                    objectType: 'NODEPARAMS',
                }).then(function (res) {
                    console.log(res.configuration, ' >>>>');
                    if (res.configuration && res.configuration.jobChain && res.configuration.jobChain.order) {
                        vm.nodeparams = res.configuration.jobChain.order.params || {};
                    }
                    if (!vm.nodeparams || !vm.nodeparams.paramList || vm.nodeparams.paramList.length === 0) {
                        vm.addNodeParameter();
                    }
                });
            }
        };

        vm.$on('RUNTIME', function (evt, obj) {
           vm.xml =  null;
            EditorService.toJSON(obj.xml).then(function (res) {
                vm.order.runTime = res.data;
                if(obj.calendars && obj.calendars.length>0) {
                    vm.order.runTime.calendars = JSON.stringify({calendars: obj.calendars});
                }
            });
        });

        vm.$on('NODE_PARAMETER', function (evt) {
            console.log('save node params', vm.nodeparams);
            let _path = '';
            if (vm.order.path === '/') {
                _path = vm.order.path + vm.order.name;
            } else {
                _path = vm.order.path + '/' + vm.order.name;
            }
            EditorService.store({
                jobschedulerId: vm.schedulerIds.selected,
                objectType: 'NODEPARAMS',
                path: _path,
                configuration: {"jobChain":{"name":vm.order.jobChain,"order":{"params":vm.nodeparams}}}
            }).then(function (res) {
               console.log(res)
            }, function (err) {
                console.error(err)
            });
        });

        vm.addParameter = function () {
            let param = {
                name: '',
                value: ''
            };
            if (!vm.order.params || !vm.order.params.paramList) {
                vm.order.params = {paramList: []}
            }
            vm.order.params.paramList.push(param);
        };

        vm.removeParams = function (index) {
            vm.order.params.paramList.splice(index, 1);
        };

        vm.addNodeParameter = function () {
            let param = {
                name: '',
                value: ''
            };
            if (!vm.nodeparams) {
                vm.nodeparams = {paramList: []}
            }else {
                if (!vm.nodeparams.paramList) {
                    vm.nodeparams = {paramList: []}
                }
            }
            vm.nodeparams.paramList.push(param);
        };

        vm.removeNodeParams = function (index) {
            vm.nodeparams.paramList.splice(index, 1);
        };

        vm.addIncludes = function () {
            let includesParam = {
                file: '',
                liveFile: '',
                node: ''
            };
            if (!vm.order.params.includes) {
                Object.assign(vm.order.params, {includes: []})
            }
            vm.order.params.includes.push(includesParam);
        };

        vm.removeIncludes = function (index) {
            vm.order.params.paramList.splice(index, 1);
        };

        vm.getSelectedJobChainData = function (data, path) {
            if (path === '/') {
                path = path + data;
            } else {
                path = path + '/' + data;
            }
            EditorService.getFile({
                jobschedulerId: vm.schedulerIds.selected,
                objectType: 'JOBCHAIN',
                path: path,
            }).then(function (res) {
                vm.jobChainNodes = res.configuration.jobChainNodes;
            });
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

        function storeObject(isCheck) {
            if (!isCheck) {
                vm.closeSidePanel();
            }
            if (vm.order && vm.order.name) {
                if (vm.order.runTime && typeof vm.order.runTime === 'string') {
                    EditorService.toJSON(vm.order.runTime).then(function (res) {
                        vm.order.runTime = res.data;
                        vm.storeObject(vm.order, vm.order);
                    });
                } else {
                    if (vm._tempOrder) {
                        vm._tempOrder["$$hashKey"] = angular.copy(vm.order["$$hashKey"]);
                        if (vm.order["selected"] != undefined) {
                            vm._tempOrder["selected"] = angular.copy(vm.order["selected"]);
                        }
                        vm._tempOrder["selected1"] = angular.copy(vm.order["selected1"]);
                    }
                    if (!angular.equals(vm._tempOrder, vm.order)) {
                        vm.storeObject(vm.order, vm.order);
                    }
                }
                if (!isCheck) {
                    delete vm.order['current'];
                }
            }
        }

        const interval = $interval(function () {
            storeObject(true);
        }, 30000);

        vm.$on('NEW_PARAM', function (evt, obj) {
            storeObject();
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
            vm.order = undefined;
        });

        vm.$on('NEW_OBJECT', function (evt, order) {
            storeObject();
            vm.jobChain = undefined;
            vm.allOrders = undefined;
            if (order.data.type) {
                vm.order = order.data;
                 vm.order.current = true;
                vm._tempOrder = angular.copy(vm.order);
                vm.orders = order.parent.folders[2].children || [];
                vm.jobChains = order.parent.folders[1].children || [];
                if (vm.order.jobChain) {
                    vm.getSelectedJobChainData(vm.order.jobChain, vm.order.path);
                }
            } else {
                vm.orders = order.data.children || [];
                vm.jobChains = [];
                for(let i=0; i < order.parent.folders.length; i++){
                    if(order.parent.folders[i].path == order.data.parent){
                        vm.jobChains = order.parent.folders[i].folders[1].children || [];
                        break;
                    }
                }
                vm.order = undefined;
                vm._tempOrder = undefined;
            }
        });

        $scope.$on('$destroy', function () {
            //call store
            $interval.cancel(interval);
            storeObject();
        });
    }

    ProcessClassEditorCtrl.$inject = ['$scope', '$interval'];

    function ProcessClassEditorCtrl($scope, $interval) {
        const vm = $scope;
        vm.filter = {'sortBy': 'name', sortReverse: false};
        vm.processClasses = [];

        vm.sortBy1 = function (data) {
            vm.filter.sortBy = data;
            vm.filter.sortReverse = !vm.filter.sortReverse;
        };

        vm.createProcessClass = function (processClass) {
            if (processClass) {
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
            for (let i = 0; i < vm.processClasses.length; i++) {
                if (vm.processClasses[i].name === processClass.name) {
                    vm.deleteObject('PROCESSCLASS', processClass.name, processClass.path, function () {
                        processClass.deleted = true;
                    });
                    break;
                }
            }
        };

        function storeObject(isCheck) {
            if (vm.processClass && vm.processClass.name) {
                if (vm._tempProcessClass) {
                    vm._tempProcessClass["$$hashKey"] = angular.copy(vm.processClass["$$hashKey"]);
                    if (vm.processClass["selected"] != undefined) {
                        vm._tempProcessClass["selected"] = angular.copy(vm.processClass["selected"]);
                    }
                    vm._tempProcessClass["selected1"] = angular.copy(vm.processClass["selected1"]);
                }
                if (angular.equals(vm._tempProcessClass, vm.processClass)) {
                    vm.storeObject(vm.processClass, vm.processClass);
                }
                if(!isCheck) {
                    delete vm.processClass['current'];
                }
            }
        }

        const interval = $interval(function () {
            storeObject(true);
        }, 30000);

        vm.$on('NEW_OBJECT', function (evt, processClass) {
            storeObject();
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
        });

        $scope.$on('$destroy', function () {
            //call store
            $interval.cancel(interval);
            storeObject();
        });
    }

    AgentClusterEditorCtrl.$inject = ['$scope', '$interval'];

    function AgentClusterEditorCtrl($scope, $interval) {
        const vm = $scope;
        vm.filter = {'sortBy': 'name', sortReverse: false};
        vm.agentClusters = [];

        vm.sortBy1 = function (data) {
            vm.filter.sortBy = data;
            vm.filter.sortReverse = !vm.filter.sortReverse;
        };

        vm.createAgentCluster = function (agentCluster) {
            if (agentCluster) {
                vm.getFileObject(agentCluster, agentCluster.path, function () {
                    vm.agentCluster = agentCluster;
                    vm.agentCluster.current = true;
                    vm._tempAgentCluster = angular.copy(vm.agentCluster);
                    if (!vm.agentCluster.remoteSchedulers) {
                        vm.agentCluster.remoteSchedulers = {remoteSchedulerList: []};
                        vm.addRemoteSchedulers();
                    }
                });
            } else {
                vm.createNewAgentCluster(vm.agentClusters);
            }
        };

        vm.removeAgentCluster = function (agentCluster) {
            for (let i = 0; i < vm.agentClusters.length; i++) {
                if (vm.agentClusters[i].name === agentCluster.name) {
                    vm.deleteObject('AGENTCLUSTER', agentCluster.name, agentCluster.path, function () {
                        agentCluster.deleted = true;
                    });
                    break;
                }
            }
        };

        vm.addRemoteSchedulers = function () {
            let param = {
                remoteScheduler: '',
                httpHeartbeatTimeout: '',
                httpHeartbeatPeriod: ''
            };
            vm.agentCluster.remoteSchedulers.remoteSchedulerList.push(param);
        };

        vm.removeRemoteSchedulers = function (index) {
            vm.agentCluster.remoteSchedulers.remoteSchedulerList.splice(index, 1);
        };


        function storeObject(isCheck) {
            if (vm.agentCluster && vm.agentCluster.name) {
                if (vm._tempAgentCluster) {
                    vm._tempAgentCluster["$$hashKey"] = angular.copy(vm.agentCluster["$$hashKey"]);
                    if (vm.agentCluster["selected"] != undefined) {
                        vm._tempAgentCluster["selected"] = angular.copy(vm.agentCluster["selected"]);
                    }
                    vm._tempAgentCluster["selected1"] = angular.copy(vm.agentCluster["selected1"]);
                }
                if (!angular.equals(vm._tempAgentCluster, vm.agentCluster)) {
                    vm.storeObject(vm.agentCluster, vm.agentCluster);
                }
                if (!isCheck) {
                    delete vm.agentCluster['current'];
                }
            }
        }

        vm.$on('NEW_OBJECT', function (evt, agentCluster) {
            storeObject();
            if (agentCluster.data.type) {
                vm.agentCluster = agentCluster.data;
                vm.agentCluster.current = true;
                vm._tempAgentCluster = angular.copy(vm.agentCluster);
                vm.agentClusters = agentCluster.parent.folders[4].children || [];
                if (!vm.agentCluster.remoteSchedulers) {
                    vm.agentCluster.remoteSchedulers = {remoteSchedulerList: []};
                    vm.addRemoteSchedulers();
                }

            } else {
                vm.agentClusters = agentCluster.data.children || [];
                vm.agentCluster = undefined;
                vm._tempAgentCluster = undefined;
            }
        });

        const interval = $interval(function () {
            storeObject(true);
        }, 30000);

        $scope.$on('$destroy', function () {
            //call store
            $interval.cancel(interval);
            storeObject();
        });
    }

    ScheduleEditorCtrl.$inject = ['$scope', '$interval'];

    function ScheduleEditorCtrl($scope, $interval) {
        const vm = $scope;
        vm.filter = {'sortBy': 'name', sortReverse: false};
        vm.schedules = [];

        vm.sortBy1 = function (data) {
            vm.filter.sortBy = data;
            vm.filter.sortReverse = !vm.filter.sortReverse;
        };

        vm.createSchedule = function (schedule) {
            if (schedule) {
                vm.getFileObject(schedule, schedule.path, function () {
                    vm.schedule = schedule;
                    vm.schedule.current = true;
                    vm._tempSchedule = angular.copy(vm.schedule);
                });
            } else {
                vm.createNewSchedule(vm.schedules);
            }
        };

        vm.removeSchedule = function (schedule) {
            for (let i = 0; i < vm.schedules.length; i++) {
                if (vm.schedules[i].name === schedule.name) {
                    vm.deleteObject('SCHEDULE', schedule.name, schedule.path, function () {
                        schedule.deleted = true;
                    });
                    break;
                }
            }
        };

        vm.getSubstituteTreeStructure = function () {
            vm.getObjectTreeStructure('SCHEDULE', function (data) {
                vm.schedule.substitute = data.schedule;
            });
        };

        vm.error={};
        vm.checkDate = function () {
            vm.schedule.valid_from = undefined;
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
                vm.schedule.valid_from = moment(date).format('YYYY-MM-DD HH:mm:ss');
            }
            vm.schedule.valid_to = undefined;
            if (vm.schedule.toTime && vm.schedule.toDate) {
                let date = new Date(vm.schedule.toDate);
                date.setHours(vm.schedule.toTime.substring(0, 2));
                date.setMinutes(vm.schedule.toTime.substring(3, 5));
                if (vm.schedule.toTime.substring(6, 8)) {
                    date.setSeconds(vm.schedule.toTime.substring(6, 8));
                } else {
                    date.setSeconds(0);
                }
                vm.schedule.valid_to = moment(date).format('YYYY-MM-DD HH:mm:ss');
            }

            if (vm.schedule.valid_from && vm.schedule.valid_to) {
                vm.error.validDate = moment(vm.schedule.valid_from).diff(moment(vm.schedule.valid_to)) > 0;
                if (!vm.error.validDate) {
                    if (!vm.schedule.showText) {
                        vm.schedule.showText = true;
                    }
                }
            } else {
                if (!vm.schedule.showText)
                    vm.error.validDate = true;
            }
        };

        vm.openSidePanel = function () {
            vm.joe = true;
            if (vm.schedule.calendars) {
                vm.calendars = vm.schedule.calendars.calendars;
            }
            vm.toXML(vm.schedule, 'schedule', function (xml) {
                vm.xml = xml;
            });
            vm.openSidePanelG('runTime');
            vm.substituteObj = {};
        };

        vm.$on('RUNTIME', function (evt, obj) {
            vm.xml =  null;
            EditorService.toJSON(obj.xml).then(function (res) {
                res.data.name = vm.schedule.name;
                res.data.message = vm.schedule.message;
                res.data.deployed = vm.schedule.deployed;
                res.data.deleted = vm.schedule.deleted;
                res.data.type = vm.schedule.type;
                res.data.toDate = vm.schedule.toDate;
                res.data.toTime = vm.schedule.toTime;
                res.data.fromDate = vm.schedule.fromDate;
                res.data.fromTime = vm.schedule.fromTime;
                vm.schedule = res.data;
                if(obj.calendars && obj.calendars.length>0) {
                    vm.schedule.calendars = JSON.stringify({calendars: obj.calendars});
                }
            });
        });

        function storeObject(isCheck) {
            if (!isCheck) {
                vm.closeSidePanel();
            }
            if (vm.schedule && vm.schedule.name) {
                if (vm._tempSchedule) {
                    vm._tempSchedule["$$hashKey"] = angular.copy(vm.schedule["$$hashKey"]);
                    if (vm.schedule["selected"] != undefined) {
                        vm._tempSchedule["selected"] = angular.copy(vm.schedule["selected"]);
                    }
                    vm._tempSchedule["selected1"] = angular.copy(vm.schedule["selected1"]);
                }
                if (!angular.equals(vm._tempSchedule, vm.schedule)) {
                    vm.storeObject(vm.schedule, vm.schedule);
                }
                if (!isCheck) {
                    delete vm.schedule['current'];
                }
            }
        }

        vm.$on('NEW_OBJECT', function (evt, schedule) {
            storeObject();
            if (schedule.data.type) {
                vm.schedule = schedule.data;
                vm.schedule.current = true;
                vm._tempSchedule = angular.copy(vm.schedule);
                vm.schedules = schedule.parent.folders[5].children || [];
            } else {
                vm.schedules = schedule.data.children || [];
                vm.schedule = undefined;
                vm._tempSchedule = undefined;
            }
        });

        const interval = $interval(function () {
            storeObject(true);
        }, 30000);

        $scope.$on('$destroy', function () {
            //call store
            $interval.cancel(interval);
            storeObject();
        });
    }

    LockEditorCtrl.$inject = ['$scope', '$interval'];
    function LockEditorCtrl($scope, $interval) {
        const vm = $scope;
        vm.filter = {'sortBy': 'name', sortReverse: false};
        vm.locks = [];
        vm.sortBy1 = function (data) {
            vm.filter.sortBy = data;
            vm.filter.sortReverse = !vm.filter.sortReverse;
        };

        vm.createLock = function (lock) {
            if (lock) {
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
            for (let i = 0; i < vm.locks.length; i++) {
                if (vm.locks[i].name === lock.name) {
                    vm.deleteObject('LOCK', lock.name, lock.path, function () {
                        lock.deleted = true;
                    });
                    break;
                }
            }
        };

        function storeObject(isCheck) {
            if (vm.lock && vm.lock.name) {
                if (vm.lock.checkbox && vm.lock.maxNonExclusive) {
                    vm.lock.maxNonExclusive = null;
                }
                if (vm._tempLock) {
                    vm._tempLock["$$hashKey"] = angular.copy(vm.lock["$$hashKey"]);
                    if (vm.lock["selected"] != undefined) {
                        vm._tempLock["selected"] = angular.copy(vm.lock["selected"]);
                    }
                    vm._tempLock["selected1"] = angular.copy(vm.lock["selected1"]);
                }
                if (!angular.equals(vm._tempLock, vm.lock)) {
                    vm.storeObject(vm.lock, vm.lock);
                }
                if(!isCheck) {
                    delete vm.lock['current'];
                }
            }
        }

        const interval = $interval(function () {
            storeObject(true);
        }, 30000);

        vm.$on('NEW_OBJECT', function (evt, lock) {
            storeObject();
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
        });

        $scope.$on('$destroy', function () {
            //call store
            $interval.cancel(interval);
            storeObject();
        });
    }

    MonitorEditorCtrl.$inject = ['$scope', 'EditorService', '$interval'];

    function MonitorEditorCtrl($scope, EditorService, $interval) {
        const vm = $scope;
        vm.filter = {'sortBy': 'name', sortReverse: false};
        vm.items = {file: '', liveFile: ''};
        vm.monitors = [];
        vm.functionalCodeValue = ['spooler_task_before', 'spooler_task_after', 'spooler_process_before', 'spooler_process_after'];
        vm.languages = ['java', 'dotnet', 'java:javascript', 'perlScript', 'powershell', 'VBScript', 'scriptcontrol:vbscript', 'javax.script:rhino', 'javax.script:ecmascript', 'javascript'];
        vm.favourites = ['configuration_monitor', 'create_event_monitor'];

        vm.sortBy1 = function (data) {
            vm.filter.sortBy = data;
            vm.filter.sortReverse = !vm.filter.sortReverse;
        };

        vm.createMonitor = function (monitor) {
            if (monitor) {
                vm.getFileObject(monitor, monitor.path, function () {
                    vm.monitor = monitor;
                    vm.monitor.current = true;
                    vm._tempMonitor = angular.copy(vm.monitor);
                });
            } else {
                vm.createNewMonitor(vm.monitors);
            }
        };

        vm.removeMonitor = function (monitor) {
            for (let i = 0; i < vm.monitors.length; i++) {
                if (vm.monitors[i].name === monitor.name) {
                    vm.deleteObject('MONITOR', monitor.name, monitor.path, function () {
                        monitor.deleted = true;
                    });
                    break;
                }
            }
        };

        vm.addFile = function () {
            if (!vm.monitor.script.includes) {
                vm.monitor.script.includes = [];
            }
            if (vm.items.liveFile)
                vm.monitor.script.includes.push(vm.items);
            vm.items = {file: '', liveFile: ''};
        };

        vm.removeFile = function (include) {
            for (let i = 0; i < vm.monitor.script.includes.length; i++) {
                if (vm.monitor.script.includes[i].file === include.file) {
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

        vm.applyHighlight = function () {
            document.querySelectorAll('div.code').forEach((block) => {
                vm.monitor.script.content = EditorService.highlight(setLanguage(), block.innerText);
            });
        };

        function storeObject(isCheck) {
            if (vm.monitor && vm.monitor.name) {
                if (vm._tempMonitor) {
                    vm._tempMonitor["$$hashKey"] = angular.copy(vm.monitor["$$hashKey"]);
                    if (vm.monitor["selected"] != undefined) {
                        vm._tempMonitor["selected"] = angular.copy(vm.monitor["selected"]);
                    }
                    vm._tempMonitor["selected1"] = angular.copy(vm.monitor["selected1"]);
                }
                if (!angular.equals(vm._tempMonitor, vm.monitor)) {
                    vm.storeObject(vm.monitor, vm.monitor);
                }
                if(!isCheck) {
                    delete vm.monitor['current'];
                }
            } else if (vm.job && vm.job.name) {
                if (vm._tempJob) {
                    vm._tempJob["$$hashKey"] = angular.copy(vm.job["$$hashKey"]);
                    if (vm.job["selected"] != undefined) {
                        vm._tempJob["selected"] = angular.copy(vm.job["selected"]);
                    }
                    vm._tempJob["selected1"] = angular.copy(vm.job["selected1"]);
                }
                if (!angular.equals(vm._tempJob, vm.job)) {
                    vm.storeObject(vm.job, vm.job);
                }
            }
        }

        const interval = $interval(function () {
            storeObject(true);
        }, 30000);

        vm.$on('NEW_OBJECT', function (evt, monitor) {
            storeObject();
            vm.job = undefined;
            if (monitor.data.type) {
                vm.monitor = monitor.data;
                vm.monitor.current = true;
                vm._tempMonitor = angular.copy(vm.monitor);
                vm.monitors = monitor.parent.folders[7].children || [];
            } else {
                vm.monitors = monitor.data.children || [];
                vm.monitor = undefined;
                vm._tempMonitor = undefined;
            }
        });

        vm.$on('NEW_PARAM', function (evt, obj) {
            storeObject();
            vm.job = obj.parent;
            if (!vm.job.monitors) {
                vm.job.monitors = [];
            }
            vm._tempJob = angular.copy(vm.job);
            vm.monitors = vm.job.monitors;
            vm.monitor = undefined;
            vm._tempMonitor = undefined;
        });

        $scope.$on('$destroy', function () {
            //call store
            $interval.cancel(interval);
            storeObject();
        });
    }

    CommandEditorCtrl.$inject = ['$scope', '$interval'];

    function CommandEditorCtrl($scope, $interval) {
        const vm = $scope;
        vm.filter = {'sortBy': 'exitCode', sortReverse: false};
        vm.job = {};
        vm.sortBy1 = function (data) {
            vm.filter.sortBy = data;
            vm.filter.sortReverse = !vm.filter.sortReverse;
        };

        vm.createCommand = function (command) {
            if (command) {
                vm.command = command;
            } else {
                let obj = {
                    onExitCode: vm.getName(vm.job.commands, '1', 'onExitCode', ''),
                    startJobs: [],
                    type: 'COMMAND'
                };
                vm.job.commands.push(obj);
            }
        };

        vm.removeCommand = function (command) {
            for (let i = 0; i < vm.job.commands.length; i++) {
                if (vm.job.commands[i].onExitCode === command.onExitCode) {
                    vm.job.commands.splice(i, 1);
                    break;
                }
            }
        };

        vm.addJob = function () {
            if (!vm.command.startJobs) {
                vm.command.startJobs = [];
            }
            let obj = {
                job: vm.getName(vm.command.startJobs, 'job1', 'job', 'job'),
                at: '',
                type: 'COMMAND'
            };
            vm.command.startJobs.push(obj);
        };

        vm.addOrder = function () {
            let obj = {
                jobChain: vm.getName(vm.command.startJobs, 'job_chain1', 'jobChain', 'job_chain'),
                at: '',
                type: 'COMMAND'
            };
            vm.command.startJobs.push(obj);
        };

        vm.removeCode = function (code) {
            for (let i = 0; i < vm.command.startJobs.length; i++) {
                if (vm.command.startJobs[i].command === code.command && vm.command.startJobs[i].job === code.job && vm.command.startJobs[i].jobChain === code.jobChain) {
                    vm.command.startJobs.splice(i, 1);
                    break;
                }
            }
        };

        vm.editCode = function (code) {
            vm.isJob = !!code.job;
            vm.isCodeEdit = true;
            vm.command = undefined;
            vm.code = code;
        };

        vm.openSidePanel = function (title) {
            vm.openSidePanelG(title);
            if (!vm.code.params || vm.code.params.paramList.length === 0) {
                vm.addParameter();
            }
        };

        vm.addParameter = function () {
            let param = {
                name: '',
                value: ''
            };
            if (!vm.code.params) {
                vm.code.params = {paramList: []}
            }
            vm.code.params.paramList.push(param);
        };

        vm.removeParams = function (index) {
            vm.code.params.paramList.splice(index, 1);
        };

        function storeObject() {
            if (vm.job && vm.job.name) {
                if (vm._tempJob) {
                    vm._tempJob["$$hashKey"] = angular.copy(vm.job["$$hashKey"]);
                    if (vm.job["selected"] != undefined) {
                        vm._tempJob["selected"] = angular.copy(vm.job["selected"]);
                    }
                    vm._tempJob["selected1"] = angular.copy(vm.job["selected1"]);
                }
                if (!angular.equals(vm._tempJob, vm.job)) {
                    vm.storeObject(vm.job, vm.job);
                }
            }
        }

        const interval = $interval(function () {
            storeObject()
        }, 30000);

        vm.$on('NEW_PARAM', function (evt, obj) {
            storeObject();
            vm.isCodeEdit = false;
            vm.job = obj.parent;
            if (!vm.job.commands) {
                vm.job.commands = [];
            }
            vm._tempJob = angular.copy(vm.job);
            vm.command = undefined;
            vm.code = undefined;
        });

        $scope.$on('$destroy', function () {
            //call store
            $interval.cancel(interval);
            storeObject();
        });
    }

    StepNodeCtrl.$inject = ['$scope', '$rootScope', '$timeout', 'EditorService', 'orderByFilter', '$interval'];

    function StepNodeCtrl($scope, $rootScope, $timeout, EditorService, orderBy, $interval) {
        const vm = $scope;
        vm.expanding_property = {
            field: 'name'
        };

        vm.tree = [];
        vm.filter_tree = {};
        vm.filter = {'sortBy': 'exitCode', sortReverse: false};
        vm._errorState = ['success', 'error'];
        vm._nextState = ['success', 'error'];
        vm._onError = ['setback', 'suspend'];
        var timer = null, t1 = null;

        function initialDefaultObject() {
            vm.tabActive = 'tab1';
            vm.activeMissingNodeButton = true;
            vm.pageView = 'graph';
            vm.currentPath = '';
            vm.config = {showErrorNodes: true};
            vm.object = {jobs: []};
            vm.activeTabInParameter = 'tab11';
            vm.paramObject = [];
            vm.state = [];
        }

        vm.changeActiveTab = function (data) {
            vm.tabActive = data;
        };

        function init() {
            if (sessionStorage.preferences) {
                vm.preferences = JSON.parse(sessionStorage.preferences) || {};
            }
            createEditor();
            let top = Math.round($('.scroll-y').position().top + 110);
            let ht = 'calc(100vh - ' + top + 'px)';
            $('.graph-container').css({'height': ht, 'scroll-top': '0'});

            let dom = $('#graph');
            if (dom) {
                dom.css({opacity: 1});
                dom.slimscroll({height: ht});
                dom.on('drop', function (event) {
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
                    event.preventDefault();
                });
                $('#toolbarContainer').css({'max-height': 'calc(100vh - ' + (top - 42) + 'px)'});

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
                        createWorkflowDiagram(vm.editor.graph, null, vm.config.showErrorNodes);
                    }
                }
            } catch (e) {
                // Shows an error message if the editor cannot start
                console.log('Cannot start application: ' + e);
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
                    return '';
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
                return true;
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

            let isJobDragging = false, movedJob = null;

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
                },
                mouseUp: function (sender, me) {
                    if (isJobDragging) {
                        isJobDragging = false;
                        detachedJob(me.evt.target, movedJob)
                    }
                },
                dragEnter: function (evt, state) {

                },
                dragLeave: function (evt, state) {

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
                    if (cells && cells[0] && cells && cells[0].value) {
                        dy = 0;
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

        function reloadGraph() {
            let element = document.getElementById('graph');
            let scrollValue = {
                scrollTop: element.scrollTop,
                scrollLeft: element.scrollLeft,
                scale: vm.editor.graph.getView().getScale()
            };
            vm.editor.graph.removeCells(vm.editor.graph.getChildVertices(vm.editor.graph.getDefaultParent()));
            createWorkflowDiagram(vm.editor.graph, scrollValue, vm.config.showErrorNodes);
        }

        function detachedJob(target, cell) {
            if (target && target.getAttribute('class') === 'dropContainer' && cell) {
                console.log(cell.value.tagName);
                let node = null;
                if (cell.value.tagName === 'Job') {
                    for (let i = 0; i < vm.jobChain.jobChainNodes.length; i++) {
                        if (vm.jobChain.jobChainNodes[i].state === cell.getAttribute('label') && vm.jobChain.jobChainNodes[i].job === cell.getAttribute('job')) {
                            node = angular.copy(vm.jobChain.jobChainNodes[i]);
                            vm.jobChain.jobChainNodes.splice(i, 1);
                            break;
                        }
                    }
                    if (node) {
                        for (let i = 0; i < vm.jobChain.jobChainNodes.length; i++) {
                            if (vm.jobChain.jobChainNodes[i].nextState === node.state) {
                                vm.jobChain.jobChainNodes[i].nextState = node.nextState;
                            }
                            if (vm.jobChain.jobChainNodes[i].errorState === node.state) {
                                vm.jobChain.jobChainNodes[i].errorState = node.errorState;
                            }
                        }
                    }
                } else if (cell.value.tagName === 'Order') {
                    for (let i = 0; i < vm.jobChainOrders.length; i++) {
                        if (vm.jobChainOrders[i].orderId === cell.getAttribute('label')) {
                            if (vm.orders && vm.orders.length > 0) {
                                for (let j = 0; j < vm.orders.length; j++) {
                                    if (vm.orders[j].jobChain === vm.jobChainOrders[i].jobChain && vm.orders[j].orderId === vm.jobChainOrders[i].orderId) {
                                        vm.orders[j].jobChain = null;
                                        vm.orders[j].name = vm.orders[j].orderId;
                                        console.log(vm.orders[j])
                                       // vm.storeObject(vm.orders[j], vm.orders[j]);
                                        break;
                                    }
                                }
                            }
                            vm.jobChainOrders.splice(i, 1);
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
                reloadGraph();
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

            graph.getModel().beginUpdate();
            let splitRegex = new RegExp('(.+):(.+)');
            try {
                for (let i = 0; i < vm.jobChain.fileOrderSources.length; i++) {
                    if (vm.jobChain.fileOrderSources[i].directory) {
                        let v1 = createFileOrderVertex(vm.jobChain.fileOrderSources[i], graph);
                        vm.jobChain.fileOrderSources[i].fId = v1.id;
                    }
                }
                for (let i = 0; i < vm.jobChain.jobChainNodes.length; i++) {
                    if (vm._nextState.indexOf(vm.jobChain.jobChainNodes[i].state) === -1) {
                        vm._nextState.push(vm.jobChain.jobChainNodes[i].state);
                    }
                    if (vm._errorState.indexOf(vm.jobChain.jobChainNodes[i].state) === -1) {
                        vm._errorState.push(vm.jobChain.jobChainNodes[i].state);
                    }
                    if (vm.jobChain.jobChainNodes[i].state) {
                        let v1 = createJobVertex(vm.jobChain.jobChainNodes[i], graph);
                        vm.jobChain.jobChainNodes[i].jId = v1.id;
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
                        if (vm.jobChain.jobChainNodes[j].jId) {
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
                if (vm.jobChainOrders && vm.jobChainOrders.length > 0 && vm.jobChain.jobChainNodes.length > 0) {
                    for (let i = 0; i < vm.jobChainOrders.length; i++) {
                        if (vm.jobChainOrders[i].orderId) {
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
            }, 0);
        }

        /**
         * Reformat the layout
         */
        function executeLayout(graph) {
            const layout = new mxHierarchicalLayout(graph);
            layout.execute(graph.getDefaultParent());
        }

        function createJobNode(job, onJob) {
            if (vm.jobChain.jobChainNodes.length === 0) {
                let obj = {
                    state: job.substring(job.lastIndexOf('/') + 1),
                    job: job,
                    nextState: 'success',
                    errorState: 'error'
                };
                let obj2 = {state: 'success'};
                let obj3 = {state: 'error'};
                vm.jobChain.jobChainNodes.push(obj);
                vm.jobChain.jobChainNodes.push(obj2);
                vm.jobChain.jobChainNodes.push(obj3);

            } else {
                let obj = null;
                let s_name = job.substring(job.lastIndexOf('/') + 1);
                if (onJob) {
                    let textArr = onJob.dataset ? onJob.dataset.state : onJob.innerHTML.split('<br>')[0];
                    for (let i = 0; i < vm.jobChain.jobChainNodes.length; i++) {
                        if (vm.jobChain.jobChainNodes[i].state === textArr) {
                            obj = {
                                state: getStateName(s_name),
                                job: job,
                                nextState: vm.jobChain.jobChainNodes[i].nextState,
                                errorState: vm.jobChain.jobChainNodes[i].errorState
                            };
                            vm.jobChain.jobChainNodes[i].nextState = obj.state;
                        }
                    }
                } else {
                    for (let i = 0; i < vm.jobChain.jobChainNodes.length; i++) {
                        if (vm.jobChain.jobChainNodes[i].nextState && vm.jobChain.jobChainNodes[i].nextState.toLowerCase() === 'success') {
                            obj = {
                                state: getStateName(s_name),
                                job: job,
                                nextState: vm.jobChain.jobChainNodes[i].nextState,
                                errorState: vm.jobChain.jobChainNodes[i].errorState
                            };
                            vm.jobChain.jobChainNodes[i].nextState = obj.state;
                            break;
                        }
                    }
                }
                if (obj) {
                    vm.jobChain.jobChainNodes.push(obj);
                }
            }
            vm.sortJobChainOrder();

            reloadGraph();
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
            _node.setAttribute('regex', fileOrder.regex);
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
                style += ';fillColor=' + (job.state.toLowerCase() === 'error' ? '#fce3e8' : '#e5ffe5')
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
                vm._errorState.splice(vm._errorState.indexOf(node.state), 1);
                for (let i = 0; i < vm.jobChain.jobChainNodes.length; i++) {
                    if (vm.jobChain.jobChainNodes[i]) {
                        if (vm.jobChain.jobChainNodes[i].state === node.state && vm.jobChain.jobChainNodes[i].job === node.job) {
                            vm.jobChain.jobChainNodes.splice(i, 1);
                        }
                        if (vm.jobChain.jobChainNodes[i].nextState === node.state) {
                            vm.jobChain.jobChainNodes[i].nextState = node.nextState;
                        }
                        if (vm.jobChain.jobChainNodes[i].errorState === node.state) {
                            vm.jobChain.jobChainNodes[i].errorState = node.errorState;
                        }
                    }
                }
            }
        };

        vm.editNode = function (node, sink) {
            vm.node = angular.copy(node);
            if (sink) {
                vm.node.nodeType = 'File Sink';
            } else {
                vm.node.nodeType = node.job ? 'Full Node' : 'End Node';
            }
            vm._tempNode = angular.copy(node);
        };

        vm.applyNode = function (form) {
            if (vm._tempNode) {
                for (let i = 0; i < vm.jobChain.jobChainNodes.length; i++) {
                    if (angular.equals(vm.jobChain.jobChainNodes[i], vm._tempNode)) {
                        if (vm.node.nodeType === 'Full Node') {
                            vm.jobChain.jobChainNodes[i] = {
                                state: vm.node.state,
                                job: vm.node.job,
                                nextState: vm.node.nextState,
                                errorState: vm.node.errorState,
                                delay: vm.node.delay
                            };
                        } else if (vm.node.nodeType === 'End Node') {
                            vm.jobChain.jobChainNodes[i] = {state: vm.node.state};
                        } else {
                            vm.jobChain.fileOrderSinks[i] = {
                                state: vm.node.state,
                                moveTo: vm.node.moveTo,
                                remove: vm.node.remove,
                                delay: vm.node.delay
                            };
                        }
                        break;
                    }
                }
            } else {
                if (vm.node.nodeType === 'Full Node') {
                    vm.jobChain.jobChainNodes.push({
                        state: vm.node.state,
                        job: vm.node.job,
                        nextState: vm.node.nextState,
                        errorState: vm.node.errorState,
                        delay: vm.node.delay
                    });
                } else if (vm.node.nodeType === 'End Node') {
                    vm.jobChain.jobChainNodes.push({state: vm.node.state});
                } else {
                    vm.jobChain.fileOrderSinks.push({
                        state: vm.node.state,
                        moveTo: vm.node.moveTo,
                        remove: vm.node.remove,
                        delay: vm.node.delay
                    });
                }

            }
            if (vm.node.nodeType !== 'File Sink') {
                if (vm._tempNode) {
                    vm._nextState.splice(vm._nextState.indexOf(vm._tempNode.state), 1);
                    vm._errorState.splice(vm._errorState.indexOf(vm._tempNode.state), 1);
                }
                if (vm._nextState.indexOf(vm.node.state) === -1) {
                    vm._nextState.push(vm.node.state);
                }
                if (vm._errorState.indexOf(vm.node.state) === -1) {
                    vm._errorState.push(vm.node.state);
                }
            }
            vm.activeMissingNodeButton = true;
            vm.sortJobChainOrder();
            vm.cancelNode(form);
        };

        vm.sortJobChainOrder = function () {
            let tempArr = [];
            let flag;
            let x = [];
            for (let i = 0; i < vm.jobChain.jobChainNodes.length; i++) {
                flag = false;
                if(vm.jobChain.jobChainNodes[i].job) {
                    for (let j = 0; j < vm.jobChain.jobChainNodes.length; j++) {
                        if(vm.jobChain.jobChainNodes[j].job) {
                            if(vm.jobChain.jobChainNodes[i].nextState === vm.jobChain.jobChainNodes[j].state) {
                                flag = true;
                                tempArr.push(vm.jobChain.jobChainNodes[i]);
                                break;
                            }
                        }
                    } 
                    if(!flag) {
                        x.push(vm.jobChain.jobChainNodes[i])
                    }            
                }  
            }
            for (let i = 0; i < tempArr.length; i++) {
                for (let j = 0; j < x.length; j++) {
                    if(vm.jobChain.jobChainNodes[i].nextState === x[j].state) {
                        tempArr.push(x[j]);
                        x.splice(j,1);
                        j--;
                        break;
                    }
                }
            }
            if(x.length>0) {
                x.forEach(item => {
                    tempArr.push(item);
                });
            }
            vm.jobChain.jobChainNodes.forEach((item) => {
                if(!item.job) {
                    tempArr.push(item);
                }
            });                
            vm.jobChain.jobChainNodes = [];
            vm.jobChain.jobChainNodes = angular.copy(tempArr);
        };

        vm.addMissingNode = function () {            
            vm.activeMissingNodeButton = false;
            if (vm.jobChain.jobChainNodes.length > 1) {
                for (let i = 0; i < vm.jobChain.jobChainNodes.length; i++) {
                    let nFlag = false;
                    let eFlag = false;
                    for (let j=1; j < vm.jobChain.jobChainNodes.length; j++) {
                        if (vm.jobChain.jobChainNodes[i].nextState === vm.jobChain.jobChainNodes[j].state) {
                            nFlag = true;
                        }
                        if(vm.jobChain.jobChainNodes[i].errorState === vm.jobChain.jobChainNodes[j].state) {
                            eFlag = true;
                        }
                        if(vm.jobChain.jobChainNodes[i].nextState === vm.jobChain.jobChainNodes[j].state || vm.jobChain.jobChainNodes[i].errorState === vm.jobChain.jobChainNodes[j].state) {
                            break;
                        }
                    }
                    if (!nFlag && vm.jobChain.jobChainNodes[i].nextState) {
                        if(vm.jobChain.jobChainNodes.filter(x => x.state === vm.jobChain.jobChainNodes[i].nextState).length == 0) {
                            vm.jobChain.jobChainNodes.push({
                                state: vm.jobChain.jobChainNodes[i].nextState,
                                node: 'End Node',
                            });
                        }
                    }
                    if(!eFlag && vm.jobChain.jobChainNodes[i].errorState) {
                        if(vm.jobChain.jobChainNodes.filter(x => x.state === vm.jobChain.jobChainNodes[i].errorState).length == 0) {
                            vm.jobChain.jobChainNodes.push({
                                state: vm.jobChain.jobChainNodes[i].errorState,
                                node: 'End Node',
                            });
                        }
                    }
                }
            }
        };

        vm.cancelNode = function (form) {
            vm._tempNode = null;
            vm.node = {nodeType: 'Full Node'};
            form.$setPristine();
            form.$setUntouched();
            form.$invalid = false;
            form.state.$invalid = false;
        };

        vm.removeFileOrder = function (node) {
            for (let i = 0; i < vm.jobChain.fileOrderSources.length; i++) {
                if (vm.jobChain.fileOrderSources[i].directory === node.directory && vm.jobChain.fileOrderSources[i].regex === node.regex) {
                    vm.jobChain.fileOrderSources.splice(i, 1);
                    break;
                }
            }
        };

        vm.editFileOrder = function (node) {
            vm.fileOrder = angular.copy(node);
            vm._tempFileOrder = angular.copy(node);
        };

        vm.applyFileOrder = function (form) {
            if (vm._tempFileOrder) {
                for (let i = 0; i < vm.jobChain.fileOrderSources.length; i++) {
                    if (angular.equals(vm.jobChain.fileOrderSources[i], vm._tempFileOrder)) {
                        vm.jobChain.fileOrderSources[i] = vm.fileOrder;
                        vm._tempFileOrder = null;
                        vm.fileOrder = null;
                        break;
                    }
                }
            } else {
                vm.jobChain.fileOrderSources.push(vm.fileOrder);
            }
            vm.cancelFileOrder(form);
        };

        vm.cancelFileOrder = function (form) {
            vm._tempFileOrder = null;
            vm.fileOrder = null;
            form.$setPristine();
            form.$setUntouched();
        };

        vm.getTreeStructure = function () {
            vm._temp = angular.copy(vm.object.jobs);
            $('#objectModal').modal('show');
            EditorService.tree({
                jobschedulerId: vm.schedulerIds.selected,
                compact: true,
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
            if (vm.currentPath !== data.path) {
                data.jobs = [];
                EditorService.getFolder({
                    jobschedulerId: vm.schedulerIds.selected,
                    path: data.path
                }).then(function (result) {
                    data.jobs = [];
                    angular.forEach(result.jobs, function (job) {
                        if (!vm.isOrderJob(job)) {
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

        function addOrderToWorkflow() {
            vm.order = {jobChain: vm.jobChain.name};
            $('#orderModal').modal('show');
        }

        vm.onAddOrder = function () {
            $('#orderModal').modal('hide');
            vm.jobChainOrders.push(vm.order);
            vm.order.type = 'ORDER';
            vm.order.name = vm.order.jobChain + ',' + vm.order.orderId;
            vm.orders.push(vm.order);
            vm.storeObject(vm.order, vm.order);
            reloadGraph();
        };

        function addFileOrderToWorkflow() {
            vm.orderSource = {};
            $('#fileOrderModal').modal('show');
        }

        vm.onAddFileOrder = function () {
            $('#fileOrderModal').modal('hide');
            vm.jobChain.fileOrderSources.push(vm.orderSource);
            reloadGraph();
        };

        vm.openSidePanel = function (title) {
            vm.openSidePanelG(title);
            if (title === 'parameter') {
                getNodeParams();
            } else if (title === 'returnCodes') {
                if (!vm.node.onReturnCodes) {
                    vm.node.onReturnCodes = {onReturnCodeList: []};
                }
                vm.addOrder = false;
            }
        };

        vm.addParameter = function () {
            let param = {
                name: '',
                value: ''
            };
            if(!vm.jobChainNodes.params){
                vm.jobChainNodes.params = {paramList:[]};
            }
            vm.jobChainNodes.params.paramList.push(param);
        };

        vm.removeParams = function (index) {
            vm.jobChainNodes.params.paramList.splice(index, 1);
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

        vm.editState = function(data, index) {
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
                        vm.node.onReturnCodes.onReturnCodeList.push(vm.state[i]);
                    }
                    if(vm.isEdit) {
                        console.log(vm.state[i].index);
                        
                        vm.node.onReturnCodes.onReturnCodeList[vm.state[i].index].returnCode = vm.state[i].returnCode;
                        vm.node.onReturnCodes.onReturnCodeList[vm.state[i].index].toState.state = vm.state[i].toState.state;
                    }
                }
            } else {
                vm.node.onReturnCodes.onReturnCodeList = vm.state;
            }
            console.log(vm.node.onReturnCodes.onReturnCodeList);
            vm.state = [];
        };

        vm.editAddOrder = function (data) {
            vm.variable = {};
            vm.addOrder = true;
            vm.variable.returnCode = data.addOrder.returnCode ? angular.copy(data.addOrder.returnCode) : angular.copy(data.returnCode);
            vm.variable.id = angular.copy(data.addOrder.id);
            vm.variable.isShow = angular.copy(data.addOrder.isShow);
            vm.variable.jobChain = angular.copy(data.addOrder.jobChain);
            vm.variable.isEdit = true;
            vm.paramObject = [];
            if (data.addOrder.params && data.addOrder.params.paramList.length > 0) {
                vm.paramObject = data.addOrder.params.paramList;
            }
            delete vm.variable.params;
            vm.tempEdit = angular.copy(vm.variable.returnCode);
        };

        vm.cancelState = function() {
            vm.state = [];
            vm.addState = false;
        };

        vm.removeReturnCode = function (index) {
            vm.state.splice(index, 1);
        };

        vm.removeAddOrderReturnCode = function (index, e) {
            if(e == 'order') {
                if(vm.node.onReturnCodes.onReturnCodeList[index].toState) {
                    delete vm.node.onReturnCodes.onReturnCodeList[index].addOrder;
                } else {
                    vm.node.onReturnCodes.onReturnCodeList.splice(index, 1);
                }
            } else {
                if(vm.node.onReturnCodes.onReturnCodeList[index].addOrder) {
                    delete vm.node.onReturnCodes.onReturnCodeList[index].toState;
                } else {
                    vm.node.onReturnCodes.onReturnCodeList.splice(index, 1);
                }
            }            
        };

        vm.addReturnCodeOrderParameter = function () {
            vm.paramObject.push({name: '', value: ''});
        };

        vm.RemoveReturnCodeOrderParameter = function (index) {
            vm.paramObject.splice(index, 1);
        };

        vm.removeParamsReturnCode = function (index, rCode) {
            rCode.addOrder.params.paramList.splice(index, 1);
            if (rCode.addOrder.params.paramList.length === 0) {
                delete rCode.addOrder.params;
                rCode.addOrder.isShow = false;
                console.log(rCode.addOrder);
            }
        };

        vm.showOrder = function () {
            vm.addOrder = true;
            vm.variable = {
                id: '',
                returnCode: '',
                jobChain: '',
                isShow: false,
                xmlns: "https://jobscheduler-plugins.sos-berlin.com/NodeOrderPlugin"
            };
            vm.paramObject = [];
        };

        vm.applyOrder = function () {
            if (vm.variable.returnCode !== vm.tempEdit && vm.variable.isEdit) {
                vm.node.onReturnCodes.onReturnCodeList = vm.node.onReturnCodes.onReturnCodeList.filter(data => data.addOrder.returnCode !== vm.tempEdit);
            }
            if (vm.paramObject.length > 0) {
                if (vm.variable && !vm.variable.params) {
                    vm.variable.params = {paramList: vm.paramObject};
                } else {
                    vm.paramObject.forEach(function (data) {
                        vm.variable.params.paramList.push(data);
                    });
                }
            }
            if (vm.node.onReturnCodes.onReturnCodeList.length > 0) {
                let flag = false;
                for (let i = 0; i < vm.node.onReturnCodes.onReturnCodeList.length; i++) {
                    if (vm.node.onReturnCodes.onReturnCodeList[i].addOrder && vm.node.onReturnCodes.onReturnCodeList[i].addOrder.returnCode === vm.variable.returnCode) {
                        if (vm.node.onReturnCodes.onReturnCodeList[i].addOrder.params && vm.node.onReturnCodes.onReturnCodeList[i].addOrder.params.paramList && vm.node.onReturnCodes.onReturnCodeList[i].addOrder.params.paramList.length > 0) {
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
                            if (vm.variable.isEdit) {
                                vm.node.onReturnCodes.onReturnCodeList[i].addOrder = vm.variable;
                            } else {
                                vm.node.onReturnCodes.onReturnCodeList[i].addOrder = vm.variable;
                            }
                            break;
                        } else if (vm.node.onReturnCodes.onReturnCodeList[i].addOrder && !vm.node.onReturnCodes.onReturnCodeList[i].addOrder.params) {
                            flag = true;
                            vm.node.onReturnCodes.onReturnCodeList[i].addOrder = vm.variable;
                            break;
                        }
                    } else if (vm.node.onReturnCodes.onReturnCodeList[i].returnCode === vm.variable.returnCode) {
                        if (vm.node.onReturnCodes.onReturnCodeList[i].returnCode !== undefined) {
                            delete vm.variable.returnCode;
                            flag = true;
                            vm.node.onReturnCodes.onReturnCodeList[i].addOrder = vm.variable;
                            break;
                        }
                    }
                }
                if (!flag) {
                    vm.node.onReturnCodes.onReturnCodeList.push({addOrder: vm.variable});
                }
            } else {
                vm.node.onReturnCodes.onReturnCodeList.push({addOrder: vm.variable});
            }
            vm.addOrder = false;
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

        vm.sortableOptions = {
            start: function(e, ui) {
                if(ui.item.context.innerText.match("(" + 'Endnode' + ")") != null) {
                    ui.item.sortable.cancel();
                }
            },
            stop: function() {
                for (let i = 0; i < vm.jobChain.jobChainNodes.length; i++) {
                    if(vm.jobChain.jobChainNodes[i].job) {
                      vm.jobChain.jobChainNodes[i].nextState = angular.copy(vm.jobChain.jobChainNodes[i+1].state);
                    }
                }
            }
        };

        function getNodeParams() {
            let _path = '';
            if (vm.currentPath === '/') {
                _path = vm.currentPath + vm.jobChain.name;
            } else {
                _path = vm.currentPath + '/' + vm.jobChain.name;
            }
            EditorService.getFile({
                jobschedulerId: vm.schedulerIds.selected,
                path: _path,
                objectType: 'NODEPARAMS',
            }).then(function (res) {
                let arr = [];
                if (res.configuration && res.configuration.jobChain && res.configuration.jobChain.order && res.configuration.jobChain.order.jobChainNodes) {
                    arr = res.configuration.jobChain.order.jobChainNodes || {};
                }
                if(arr.length>0) {
                    for (let i = 0; i < arr.length; i++) {
                        if (vm.node.state === arr[i].state) {
                            vm.jobChainNodes = arr[i];
                            break
                        }
                    }
                }
                if (!vm.jobChainNodes.params || vm.jobChainNodes.params.paramList.length === 0) {
                    vm.addParameter();
                }
            });
        }

        const watcher1 = $scope.$watch('pageView', function (newName, oldName) {
            if (newName && oldName && newName !== oldName && vm.editor) {
                vm.editor.graph.removeCells(vm.editor.graph.getChildVertices(vm.editor.graph.getDefaultParent()));
                createWorkflowDiagram(vm.editor.graph, null, vm.config.showErrorNodes);
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

        function storeObject(isCheck) {
            if(!isCheck) {
                vm.closeSidePanel();
            }
            if (vm.jobChain && vm.jobChain.name) {
                if (vm._tempJobChain) {
                    vm._tempJobChain["$$hashKey"] = angular.copy(vm.jobChain["$$hashKey"]);
                    if (vm.jobChain["selected"] != undefined) {
                        vm._tempJobChain["selected"] = angular.copy(vm.jobChain["selected"]);
                    }
                    vm._tempJobChain["selected1"] = angular.copy(vm.jobChain["selected1"]);
                }
                if (!angular.equals(vm._tempJobChain, vm.jobChain)) {
                    vm.storeObject(vm.jobChain, vm.jobChain);
                }
            }
        }

        const interval = $interval(function () {
            storeObject(true);
        }, 30000);

        vm.$on('NEW_PARAM', function (evt, obj) {
            storeObject();
            initialDefaultObject();
            if (vm.editor && vm.editor.graph) {
                vm.editor.graph.removeCells(vm.editor.graph.getChildVertices(vm.editor.graph.getDefaultParent()));
            }
            vm.jobChain = obj.parent;
            if (obj.superParent && obj.superParent.folders && obj.superParent.folders.length > 0) {
                vm.jobs = obj.superParent.folders[0].children;
                vm.jobChains = obj.superParent.folders[1].children;
                vm.orders = obj.superParent.folders[2].children;
                vm.jobChainOrders = [];
                if (vm.orders && vm.orders.length > 0) {
                    for (let i = 0; i < vm.orders.length; i++) {
                        if (vm.orders[i].jobChain === vm.jobChain.name) {
                            vm.jobChainOrders.push(vm.orders[i]);
                        }
                    }
                }
                vm.currentPath = obj.superParent.path;
            }
            if (!vm.jobChain.jobChainNodes) {
                vm.jobChain.jobChainNodes = [];
            }
            if (!vm.jobChain.fileOrderSources) {
                vm.jobChain.fileOrderSources = [];
            }
            if (!vm.editor) {
                setTimeout(function () {
                    init();
                }, 10);
            } else {
                createWorkflowDiagram(vm.editor.graph, null, vm.config.showErrorNodes);
            }

            vm.node = {nodeType: 'Full Node'};
            vm._tempJobChain = angular.copy(vm.jobChain);
        });

        $scope.$on('$destroy', function () {
            $interval.cancel(interval);
            //call store
            storeObject();
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

    XMLEditorCtrl.$inject = ['$scope', 'SOSAuth', 'CoreService', 'AuditLogService', '$location', '$http', '$uibModal', 'gettextCatalog', 'toasty', 'FileUploader', 'EditorService'];

    function XMLEditorCtrl($scope, SOSAuth, CoreService, AuditLogService, $location, $http, $uibModal, gettextCatalog, toasty, FileUploader, EditorService) {
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
        vm.selectedDd;
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


        vm.setDropdown = function () {
            vm.$emit('set-dropdown', vm.selectedDd);
        };


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
            getInitTree(true);
        };

        function ngOnInit() {
            let xml = sessionStorage.getItem(vm.selectedXsd);
            if (sessionStorage.getItem(vm.selectedXsd) !== null) {
                if (sessionStorage.$SOS$XSD) {
                    vm.submitXsd = true;
                    vm.selectedXsd = sessionStorage.$SOS$XSD;
                }
                vm.reassignSchema();
                setTimeout(() => {
                    createJSONFromXML(xml);
                }, 600);
            } else {
                if (vm.selectedXsd) {
                    vm.submitXsd = true;
                    // vm.selectedXsd = sessionStorage.$SOS$XSD;
                    getInitTree(false);
                } else {
                    vm.isLoading = false;
                }
            }
        }

        submit();

        // getInit tree
        function getInitTree(check) {
            if (vm.selectedXsd === 'systemMonitorNotification') {
                EditorService.readXML({
                    jobschedulerId: vm.schedulerIds.selected,
                    "objectType":"NOTIFICATION"
                }).then(function (res) {
                    console.log(res);
                    let path = res.schema;
                    console.log(path);
                    $http.get(path)
                    .then(function (data) {
                        loadTree(data.data, check);
                    });
                }, function () {
    
                }); 
            } else if (vm.selectedXsd === 'yade') {
                EditorService.readXML({
                    jobschedulerId: vm.schedulerIds.selected,
                    "objectType":"YADE"
                }).then(function (res) {
                    console.log(res);
                    let path = res.schema;
                    console.log(path);
                    $http.get(path)
                    .then(function (data) {
                        loadTree(data.data, check);
                    });
                }, function () {
    
                });
            } else {
                EditorService.readXML({
                    jobschedulerId: vm.schedulerIds.selected,
                    "objectType":"OTHER"
                }).then(function (res) {
                    console.log(res);
                    let path = res.schema;
                    console.log(path);
                    $http.get(path)
                    .then(function (data) {
                        loadTree(data.data, check);
                    });
                }, function () {
    
                });
            }
        }

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
            if (x == 'notification') {
                vm.selectedXsd = 'systemMonitorNotification';
            } else if (x === 'yade') {
                vm.selectedXsd = x;
            }
            if (vm.selectedXsd !== '') {
                vm.selectedDd = x;
                vm.setDropdown();
                if (sessionStorage.getItem(vm.selectedXsd) === null) {
                    sessionStorage.$SOS$XSD = vm.selectedXsd;
                    vm.submitXsd = true;
                    getInitTree(false);
                } else {
                    sessionStorage.$SOS$XSD = vm.selectedXsd;
                    ngOnInit();
                }
            } else {
                vm.selectedDd = 'others';
                vm.selectedXsd = sessionStorage.$SOS$XSD;
                sessionStorage.removeItem('$SOS$XSD');
                vm.setDropdown();
                ngOnInit();
            }
        }

        vm.othersSubmit = function () {
            if (vm.selectedXsd !== '') {
                vm.nodes = [];
                sessionStorage.$SOS$XSD = vm.selectedXsd;
                vm.submitXsd = true;
                getInitTree(false);
            }
        };

        // create json from xml
        function createJSONFromXML(data) {
            let result1 = xml2json(data, {
                compact: true,
                spaces: 4,
                ignoreDeclaration: true,
                ignoreComment: true,
                alwaysChildren: true
            });

            let rootNode;
            let r_node;
            let x = JSON.parse(result1);
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
                    vm.addChild(vm.childNode[i], mainjson, false);
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
            setTimeout(() => {
                $('#' + id).addClass('invalid');
            }, 1);
        };

        vm.removeCkCss = function (id) {
            setTimeout(() => {
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
                            vm.addChild(child[i], temp, true);
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
                            childArr.push(nodes);
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

        vm.addChild = function (child, nodeArr, check) {
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
            child.uuid = vm.counting;
            child.parentId = nodeArr.uuid;
            vm.counting++;
            if (!(_.isEmpty(attrs))) {
                attachAttrs(attrs, child);
            }
            nodeArr.nodes.push(child);
            if (check) {
                autoAddChild(child);
            }
            if (!(_.isEmpty(text))) {
                addText(text, nodeArr.nodes);
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
            if (nodeArr.ref === 'NotificationMail' || nodeArr.ref === 'Header') {
                arrangeArr(nodeArr);
            }
            printArraya(false);
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
                                vm.addChild(getCh[i], child, true);
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
                            return true;
                        }
                    } else if (dragNode.maxOccurs === undefined) {
                        if (dropNode.nodes.length > 0) {
                            if (dropNode.nodes.length > 0) {
                                return (dragNode.ref !== dropNode.nodes[0].ref);
                            }
                        } else if (dropNode.nodes.length === 0) {
                            return true;
                        }
                    }
                }
            }
            return false;
        }

        // to send data in details component
        vm.getData = function (evt) {
            setTimeout(() => {
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
            vm.error = false;
            if (/[a-zA-Z0-9_]+.*$/.test(value)) {
                vm.error = false;
            } else if (ref == 'FileSpec' || ref == 'Directory') {
                if (/[(a-zA-Z0-9_*./)]+.*$/.test(value)) {
                    vm.error = false;
                }
            } else {
                vm.error = true;
                vm.text = 'Required Field';
                vm.errorName = ref;
                if (tag.data !== undefined) {
                    for (let key in tag) {
                        if (key == 'data') {
                            delete tag[key];
                            vm.autoValidate();
                        }
                    }
                }
            }
        };

        vm.submitValue = function (value, ref, tag) {
            if (/[a-zA-Z0-9_]+.*$/.test(value)) {
                vm.error = false;
                tag.data = value;
                vm.autoValidate();
            } else if (ref == 'FileSpec' || ref == 'Directory') {
                if (/[(a-zA-Z0-9_*./)]+.*$/.test(value)) {
                    vm.error = false;
                    tag.data = value;
                    vm.autoValidate();
                }
            } else {
                vm.error = true;
                vm.text = gettextCatalog.getString('xml.message.requiredField');
                vm.errorName = ref;
                if (tag.data !== undefined) {
                    for (let key in tag) {
                        if (key == 'data') {
                            vm.autoValidate();
                            delete tag[key];
                        }
                    }
                }
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

        function arrangeArr(node) {
            let arr = _.clone(node.nodes);
            for (let j = 0; j < arr.length; j++) {
                if (node.nodes[j].ref === 'From') {
                    let temp;
                    if (node && node.nodes[0] !== undefined) {
                        temp = node.nodes[0];
                        node.nodes[0] = node.nodes[j];
                        node.nodes[j] = temp;
                    }
                }
                if (node.nodes[j].ref === 'To') {
                    let temp;
                    if (node && node.nodes[1] !== undefined) {
                        temp = node.nodes[1];
                        node.nodes[1] = node.nodes[j];
                        node.nodes[j] = temp;
                    }
                }
                if (node.nodes[j].ref === 'CC') {
                    let temp;
                    if (node && node.nodes[2] !== undefined) {
                        temp = node.nodes[2];
                        node.nodes[2] = node.nodes[j];
                        node.nodes[j] = temp;
                    }
                }
                if (node.nodes[j].ref === 'BCC') {
                    let temp;
                    if (node && node.nodes[3] !== undefined) {
                        temp = node.nodes[3];
                        node.nodes[3] = node.nodes[j];
                        node.nodes[j] = temp;
                    }
                }
                if (node.nodes[j].ref === 'Subject' && j < node.nodes[j].length) {
                    let temp;
                    if (node && node.nodes[4] !== undefined) {
                        temp = node.nodes[4];
                        node.nodes[4] = node.nodes[j];
                        node.nodes[j] = temp;
                    }
                }
            }
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
            vm.copyItem = {};
            vm.copyItem = Object.assign(vm.copyItem, node);
            searchAndRemoveNode(node);
            vm.cutData = true;
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
            let xmlAsString = new XMLSerializer().serializeToString(xml);
            let a = `<?xml version="1.0" encoding="UTF-8" standalone="no" ?>`;
            a = a.concat(xmlAsString);
            return vkbeautify.xml(a);
        }


        function autoSave() {
            if (vm.nodes[0] && vm.nodes[0].ref) {
                let a = _showXml();
                let name = '';
                if (vm.nodes[0].ref === 'Configurations') {
                    name = 'yade';
                } else if (vm.nodes[0].ref === 'SystemMonitorNotification') {
                    name = 'systemMonitorNotification';
                } else if (vm.nodes[0].ref === 'Inventory') {
                    name = 'JSSuiteInventory';
                }
                sessionStorage.setItem(name, a);
            } else {
                sessionStorage.removeItem(vm.selectedXsd);
            }
            vm.setDropdown();
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
            $(window).keypress(function (e) {
                if (e.key === ' ' || e.key === 'Spacebar') {
                    e.preventDefault();
                }
            })
        };

        // validation for attributes
        vm.validateAttr = function (value, tag, e) {
            if (tag.type === 'xs:NMTOKEN') {
                if (/\s/.test(value)) {
                    vm.error = true;
                    vm.text = tag.name + ': ' + gettextCatalog.getString('xml.message.spaceNotAllowed');
                    vm.errorName = tag.name;
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
                    vm.errorName = tag.name;
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
                    vm.errorName = tag.name;
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
                    vm.errorName = tag.name;
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
                if (/[a-zA-Z0-9_]+.*$/.test(value)) {
                    vm.error = false;
                } else if (tag.use === 'required') {

                    vm.error = true;
                    vm.text = tag.name + ': ' + gettextCatalog.getString('xml.message.requiredField');
                    vm.errorName = tag.name;
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
                    vm.errorName = tag.name;
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
                        vm.text = tag.name + ': ' + gettextCatalog.getString('xml.message.requiredField');
                        vm.errorName = tag.name;
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
                        vm.text = tag.name + ': ' + gettextCatalog.getString('xml.message.onlyPositiveNumbers');
                        vm.errorName = tag.name;
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
                        vm.errorName = tag.name;
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
            } else if (tag.type === 'xs:integer') {
                if (value != undefined) {
                    if (/[0-9]/.test(value)) {
                        vm.error = false;
                        tag = Object.assign(tag, {data: value});
                        vm.autoValidate();
                    } else if (tag.use === 'required' && value === '') {
                        vm.error = true;
                        vm.text = tag.name + ': ' + gettextCatalog.getString('xml.message.requiredField');
                        vm.errorName = tag.name;
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
                        vm.errorName = tag.name;
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
                        vm.errorName = tag.name;
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
                    vm.errorName = tag.name;
                    if (tag.data !== undefined) {
                        for (let key in tag) {
                            if (key == 'data') {
                                // delete tag[key];
                                vm.autoValidate();
                            }
                        }
                    }
                } else if (value == '' && tag.use === 'required') {
                    vm.error = true;
                    vm.text = tag.name + ':' + gettextCatalog.getString('xml.message.requiredField');
                    vm.errorName = tag.name;
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
                    vm.errorName = tag.name;
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
                    vm.errorName = tag.name;
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
                if (/[a-zA-Z0-9_]+.*$/.test(value)) {
                    vm.error = false;
                    tag = Object.assign(tag, {data: value});
                    vm.autoValidate();
                } else if (tag.use === 'required') {
                    vm.error = true;
                    vm.text = tag.name + ': ' + gettextCatalog.getString('xml.message.requiredField');
                    vm.errorName = tag.name;
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
                    vm.errorName = tag.name;
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
                    vm.text = tag.name + ': ' + gettextCatalog.getString('xml.message.requiredField');
                    vm.errorName = tag.name;
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
                    vm.text = tag.name + ': ' + gettextCatalog.getString('xml.message.onlyPositiveNumbers');
                    vm.errorName = tag.name;
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
                    vm.errorName = tag.name;
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
                    vm.errorName = tag.name;
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
                    vm.errorName = tag.name;
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
                    vm.errorName = tag.name;
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
                    vm.errorName = tag.name;
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
                    vm.errorName = tag.name;
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
                vm.copyItem.nodes.forEach((node) => {
                    changeUuId(node, vm.copyItem.uuid);
                    changeParentId(node, vm.copyItem.uuid);
                });
            }

            node.nodes.push(angular.copy(vm.copyItem));
            vm.cutData = false;
            vm.checkRule = true;
            printArraya(false);
        };

        function changeUuId(node, id) {
            node.uuid = id + vm.counting;
            vm.counting++;
            if (node.nodes && node.nodes.length > 0) {
                node.nodes.forEach((cNode) => {
                    changeUuId(cNode, node.uuid);
                });
            }
        }

        function changeParentId(node, parentId) {
            node.parentId = parentId;
            if (node.nodes && node.nodes.length > 0) {
                node.nodes.forEach((cNode) => {
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
            if (node.attributes) {
                for (let i = 0; i < node.attributes.length; i++) {
                    if (node.attributes[i].data) {
                        let temp = '<div>';
                        temp = temp + node.attributes[i].name;
                        temp = temp + ' = ';
                        temp = temp + node.attributes[i].data;
                        temp = temp + '</div>';
                        vm.tooltipAttrData = vm.tooltipAttrData + temp;
                    }
                }
                if (vm.tooltipAttrData != '') {
                    let x = $.parseHTML(vm.tooltipAttrData);
                    let htmlTag = document.createElement('div');
                    if (x != null && x.length > 0) {
                        x.forEach(html => {
                            htmlTag.append(html);
                        });
                    }
                    vm.tooltipAttrData = htmlTag;
                }
            }
            let a = '#' + node.uuid;
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
                $scope.changeValidConfigStatus(true);
                toasty.success({
                    title: 'Element : ' + vm.nodes[0].ref,
                    message: 'XML is valid'
                });
            } else {
                vm.gotoErrorLocation();
                popToast(vm.nonValidattribute);
                if (vm.nonValidattribute.name) {
                    vm.validateAttr('', vm.nonValidattribute);
                }
            }
        }

        // import xml model
        function importXML() {
            vm.importObj = {assignXsd: ''};
            let modalInstance = $uibModal.open({
                templateUrl: 'modules/configuration/views/import-dialog.html',
                controller: 'DialogCtrl',
                scope: vm,
                size: 'lg',
                backdrop: 'static'
            });
            modalInstance.result.then(function () {
                if (vm.importObj.assignXsd) {
                    vm.selectedXsd = vm.importObj.assignXsd;
                    sessionStorage.setItem('$SOS$XSD', vm.selectedXsd);
                    vm.reassignSchema();
                    setTimeout(() => {
                        createJSONFromXML(vm.uploadData);
                    }, 600);
                    if (uploader.queue && uploader.queue.length > 0) {
                        uploader.queue[0].remove();
                    }
                    vm.submitXsd = true;
                }
            }, function () {
                vm.importObj = {};
                if (uploader.queue && uploader.queue.length > 0) {
                    uploader.queue[0].remove();
                }
            });
        }

        // open new Confimation model
        function newFile() {
            let modalInstance = $uibModal.open({
                templateUrl: 'modules/configuration/views/confirmation-dialog.html',
                controller: 'DialogCtrl1',
                scope: vm,
                size: 'lg',
                backdrop: 'static'
            });
            modalInstance.result.then(function (res) {
                let name = '';
                if (vm.nodes[0].ref === 'Configurations') {
                    name = 'yade';
                } else if (vm.nodes[0].ref === 'SystemMonitorNotification') {
                    name = 'systemMonitorNotification';
                }
                if (res === 'yes') {
                    save();
                } else {
                    vm.nodes = [];
                    vm.selectedNode = [];
                }
                vm.submitXsd = false;
                sessionStorage.removeItem('$SOS$XSD');
                sessionStorage.removeItem(name);
                submit();
            }, function () {

            });
        }

        // save xml
        function save() {
            let xml = _showXml();
            let name = vm.nodes[0].ref + '.xml';
            let fileType = 'application/xml';
            let blob = new Blob([xml], {type: fileType});
            saveAs(blob, name);
            vm.nodes = [];
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

            }, function () {

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
            vm.innerTreeStruct = vm.innerTreeStruct + '<div class=\'keysearch\'>' + vm.nodes[0].ref + '</div>';
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
            setTimeout(() => {
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
                    {name: 'links', items: ['Link', 'Unlink']},
                    {name: 'styles', items: ['Font', 'FontSize']},
                ],
                bodyClass: vm.userPreferences.theme !== 'light' && vm.userPreferences.theme !== 'lighter' || !vm.userPreferences.theme ? 'white_text' : 'dark_text',
            });

            vm.ckEditor.on('change', function () {
                vm.myContent = vm.ckEditor.getData();
                parseEditorText(vm.myContent, vm.selectedNode);
            });
            if (data.data) {
                CKEDITOR.instances[data.uuid.toString()].setData(data.data);
            } else {
                CKEDITOR.instances[data.uuid.toString()].setData('');
            }
        }

        function parseEditorText(evn, nodes) {
            if (evn.match(/<[^>]+>/gm)) {
                let x = evn.replace(/<[^>]+>/gm);
                if (x !== 'undefined&nbsp;undefined') {
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

        // Show all Child Nodes and search functionalities.
        vm.showAllChildNode = function (node) {
            vm.showAllChild = [];
            let _node = {ref: node.ref, parent: '#'};
            vm.showAllChild.push(_node);
            getCNodes(_node);
            createTJson(vm.showAllChild);
            let modalInstance = $uibModal.open({
                templateUrl: 'modules/configuration/views//show-childs-dialog.html',
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

        vm.$on('gotoErrorLocation', function () {
            vm.gotoErrorLocation();
        });

        window.addEventListener('beforeunload', function () {
            autoSave();
            return true;
        });

        vm.$on('$destroy', function () {
            autoSave();
        });


        //hide documentation
        vm.hideDocumentation = function () {
            let dom = $('#doc');
            if (dom.hasClass('show')) {
                dom.removeClass('show').addClass('hide');
            } else {
                dom.removeClass('hide').addClass('show');
            }
        };

        vm.documentationIcon = function () {
            if ($('#doc').hasClass('show')) {
                return 'fa-chevron-down';
            } else {
                return 'fa-chevron-right';
            }
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
                let x = password.length;
                let a = '';
                for (let i = 0; i < x; i++) {
                    a = a + '*';
                }
                return a;
            }
        };
    }
})();
